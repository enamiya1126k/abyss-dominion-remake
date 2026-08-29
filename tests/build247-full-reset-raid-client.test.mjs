import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ONLINE_STORAGE_KEYS } from "../src/ui/screens/OnlinePartyScreen.js";
import { resetCurrentWeeklyRaidForFullReset } from "../src/online/OnlinePartyClient.js";

class MemoryStorage {
  constructor(entries = {}) { this.values = new Map(Object.entries(entries)); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

class ResetSocket {
  static instances = [];
  constructor(url) {
    this.url = url; this.readyState = 0; this.listeners = new Map(); this.sent = [];
    ResetSocket.instances.push(this);
    queueMicrotask(() => { this.readyState = 1; this.emit("open", {}); });
  }
  addEventListener(type, listener) { const list = this.listeners.get(type) ?? []; list.push(listener); this.listeners.set(type, list); }
  emit(type, event) { for (const listener of this.listeners.get(type) ?? []) listener(event); }
  message(value) { queueMicrotask(() => this.emit("message", { data: JSON.stringify(value) })); }
  send(raw) {
    const message = JSON.parse(raw); this.sent.push(message);
    if (message.type === "hello") this.message({ type: "helloAck", protocol: "1.16.0", capabilities: { fullResetRaidV1: true }, playerId: message.friendId, resumeToken: "rotated-reset-resume-token", room: ResetSocket.resumeRoom ? { roomId: "ROOM47" } : null, activeTradeIds: [] });
    if (message.type === "leaveRoom") this.message({ type: "leftRoom" });
    if (message.type === "resetWeeklyRaidForFullReset") this.message({ type: "weeklyRaidResetAck", requestId: message.requestId, weekId: "weekly-34", duplicate: false });
  }
  close() { this.readyState = 3; this.emit("close", {}); }
}
ResetSocket.resumeRoom = false;

function installStorage() {
  const storage = new MemoryStorage({
    [ONLINE_STORAGE_KEYS.friendId]: "AD-RC47-AAAB",
    [ONLINE_STORAGE_KEYS.clientKey]: "build247-client-key-for-reset-0001",
    [ONLINE_STORAGE_KEYS.serverUrl]: "https://stumble-mountain-lego.ngrok-free.dev",
    [ONLINE_STORAGE_KEYS.resumeTokenMigration]: "1",
  });
  globalThis.localStorage = storage;
  return storage;
}

test("build247 full reset authenticates, leaves a resumed room, waits for ACK and then clears its retry id", { concurrency: false }, async () => {
  const previousStorage = globalThis.localStorage, storage = installStorage(); ResetSocket.instances = []; ResetSocket.resumeRoom = true;
  try {
    const result = await resetCurrentWeeklyRaidForFullReset({}, { WebSocketImpl: ResetSocket, timeoutMs: 2_000 });
    assert.equal(result.ok, true);
    const sent = ResetSocket.instances[0].sent;
    assert.deepEqual(sent.map(message => message.type), ["hello", "leaveRoom", "resetWeeklyRaidForFullReset"]);
    assert.equal(sent[0].friendId, "AD-RC47-AAAB");
    assert.equal(sent[2].requestId, result.requestId);
    assert.equal(storage.getItem(ONLINE_STORAGE_KEYS.fullResetRaidRequest), null);
    assert.equal(storage.getItem(ONLINE_STORAGE_KEYS.resumeToken), "rotated-reset-resume-token");
  } finally { ResetSocket.resumeRoom = false; if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage; }
});

test("build247 offline failure keeps one request id and retries it without claiming completion", { concurrency: false }, async () => {
  const previousStorage = globalThis.localStorage, storage = installStorage(); ResetSocket.instances = [];
  class OfflineSocket { constructor() { throw new Error("offline"); } }
  try {
    const failed = await resetCurrentWeeklyRaidForFullReset({}, { WebSocketImpl: OfflineSocket, timeoutMs: 2_000 });
    assert.equal(failed.ok, false);
    assert.equal(failed.reason, "offline");
    const pending = storage.getItem(ONLINE_STORAGE_KEYS.fullResetRaidRequest);
    assert.equal(pending, failed.requestId);
    const retried = await resetCurrentWeeklyRaidForFullReset({}, { WebSocketImpl: ResetSocket, timeoutMs: 2_000 });
    assert.equal(retried.ok, true);
    assert.equal(retried.requestId, pending, "the retry uses the exact same idempotency key");
    assert.equal(ResetSocket.instances[0].sent.find(message => message.type === "resetWeeklyRaidForFullReset").requestId, pending);
    assert.equal(storage.getItem(ONLINE_STORAGE_KEYS.fullResetRaidRequest), null);
  } finally { if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage; }
});

test("build247 main and websocket protocol gate local reset on the authenticated raid reset ACK", async () => {
  const [main, warning, settings, server, raid] = await Promise.all([
    readFile(new URL("../src/main.js", import.meta.url), "utf8"),
    readFile(new URL("../src/core/FullResetSystem.js", import.meta.url), "utf8"),
    readFile(new URL("../src/ui/screens/SettingsScreen.js", import.meta.url), "utf8"),
    readFile(new URL("../online-server/server.js", import.meta.url), "utf8"),
    readFile(new URL("../online-server/src/RaidCoordinator.js", import.meta.url), "utf8"),
  ]);
  const remoteCall = main.indexOf("await resetCurrentWeeklyRaidForFullReset(save.state)"), localCommit = main.indexOf("if(!save.reset())", remoteCall);
  assert.ok(remoteCall >= 0 && localCommit > remoteCall, "the server ACK gate precedes the local reset commit");
  assert.match(main.slice(remoteCall, localCommit), /if\(!onlineReset\.ok\)/);
  assert.match(main, /ゲームデータは変更していません/);
  assert.match(warning, /今週のレイド討伐・貢献・報酬記録/);
  assert.match(settings, /今週のレイド記録を初期化/);
  assert.match(settings, /オンラインサーバーへ接続できない場合/);
  assert.match(server, /fullResetRaidV1:true/);
  assert.match(server, /resetWeeklyRaidForFullReset/);
  assert.match(server, /weeklyRaidResetAck/);
  assert.match(raid, /kind:"raidMilestone"[^\n]+weekId:raid\.weekId/);
  assert.match(raid, /kind:"raidPersonal"[^\n]+weekId:raid\.weekId/);
  assert.match(raid, /kind:"raidJuvenile"[^\n]+weekId:raid\.weekId/);
});
