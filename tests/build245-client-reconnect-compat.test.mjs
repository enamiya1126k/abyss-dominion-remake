import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("build245 rebinds a resumed room to the exact authoritative expedition run once", async () => {
  const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?v=2.11.69-build245-client-resume-test");
  const calls = [];
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    syncedExpeditionStartKey: "", recoverySettlementFailed: false,
    onExpeditionStarted: event => { calls.push(event); return { ok: true }; },
  });
  const room = {
    roomId: "AB12CD", phase: "expedition", ownerId: "host", leaderId: "host",
    coopRun: { runId: "shared-run-77", startFloor: 77, startedAt: 12345 },
    expedition: { id: "floor-instance-77", hostOwnerId: "host", floor: 77, startedAt: 12345 },
  };
  assert.equal(controller._syncActiveExpeditionRun(room), true);
  assert.equal(controller._syncActiveExpeditionRun({ ...room, expedition: { ...room.expedition, floor: 78 } }), true);
  assert.equal(calls.length, 1, "room refreshes and floor changes cannot restart the same saved run");
  assert.deepEqual(calls[0], { runId: "shared-run-77", ownerId: "host", startFloor: 77, startedAt: 12345, resumed: true });
  assert.equal(controller._syncActiveExpeditionRun({ ...room, coopRun: { ...room.coopRun, runId: "shared-run-78" } }), true);
  assert.equal(calls.length, 2, "a genuinely new run is registered independently");

  controller.syncedExpeditionStartKey = "";
  controller.onExpeditionStarted = () => ({ ok: false });
  assert.equal(controller._syncActiveExpeditionRun(room), false);
  assert.equal(controller.syncedExpeditionStartKey, "", "a failed local save remains retryable on the next room snapshot");
  assert.equal(controller.recoverySettlementFailed, true);
});

test("build245 settles recovered results exactly once and safely treats ownerless legacy results as guest records", async () => {
  const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?v=2.11.69-build245-client-result-test");
  const settled = [], shown = [], sent = [];
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    capabilities: new Set(["expeditionResultsV1"]), selfId: "guest", roomState: null,
    expeditionResultInFlight: new Set(), presentedExpeditionResultIds: new Set(), recoverySettlementBatch: 9,
    recoverySettlementFailed: false,
    onExpeditionResult: async event => { settled.push(event); return { ok: true, guest: true, duplicate: settled.length > 1 }; },
    onShowExpeditionResult: (...args) => shown.push(args),
    _send: (type, payload) => { sent.push({ type, payload }); return true; },
  });
  const legacy = {
    type: "expeditionResult", runId: "legacy-run", resultId: "legacy-result", recipientId: "guest",
    startFloor: 20, endFloor: 21, floorsCleared: 1, multiplayer: true,
    finalVitals: { monsterId: "monster-1", hp: 17, mp: 3 }, summary: { ranking: [] },
  };
  await controller._receiveExpeditionResult(legacy, 9);
  await controller._receiveExpeditionResult(legacy, 9);
  assert.equal(settled[0].ownerId, "legacy-owner-unknown");
  assert.notEqual(settled[0].ownerId, controller.selfId, "unknown ownership can never advance guest world progression");
  assert.equal(shown.length, 1, "a recovered result already saved locally is acknowledged without reopening its result screen");
  assert.equal(sent.filter(entry => entry.type === "expeditionResultAck").length, 2);
});

test("build245 waits for queued HP, reward, and result saves before completing an explicit room exit", async () => {
  const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?v=2.11.69-build245-client-leave-test");
  let resolveSave;
  const saving = new Promise(resolve => { resolveSave = resolve; });
  const calls = [], pending = { roomId: "AB12CD", exitAfter: false, sent: true };
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    pendingLeaveOnReconnect: pending, pendingLeaveTimer: null,
    recoverySettlementTasks: new Set([saving]),
    _setStatus: (...args) => calls.push(["status", ...args]),
    _clearRoom: () => calls.push(["clear"]),
  });
  controller._completePendingRoomLeave();
  assert.equal(controller.pendingLeaveOnReconnect, pending);
  assert.equal(calls.some(([kind]) => kind === "clear"), false);
  resolveSave();
  await saving;
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(controller.pendingLeaveOnReconnect, null);
  assert.equal(calls.filter(([kind]) => kind === "clear").length, 1);
});

test("build245 normalizes old contribution saves and legacy resonance route aliases", async () => {
  const previousStorage = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
  try {
    const { SaveService } = await import("../src/services/SaveService.js?v=2.11.69-build245-save-compat-test");
    const service = new SaveService(), legacy = structuredClone(service.state);
    legacy.onlineParty.coopContributionHistory = [null, "broken"];
    for (let index = 0; index < 140; index += 1) legacy.onlineParty.coopContributionHistory.push({
      resultId: `result-${index}`, runId: `run-${index}`, ownerId: "host", startFloor: index + 1,
      endFloor: index + 2, floorsCleared: 1, rank: 99, name: `name-${index}\u0000`,
      exploration: -5, pings: 7, mvpTitles: ["探索王", "探索王", null],
    });
    legacy.onlineParty.coopContributionHistory.push({ resultId: "result-139", name: "latest", startFloor: 5, endFloor: 3 });
    const migrated = service.migrate(legacy), history = migrated.onlineParty.coopContributionHistory;
    assert.equal(history.length, 128);
    assert.equal(history.filter(entry => entry.resultId === "result-139").length, 1);
    assert.equal(history.at(-1).name, "latest");
    assert.equal(history.at(-1).endFloor, 5);
    assert.equal(history[0].rank, 32);
    assert.equal(history[0].exploration, 0);
    assert.deepEqual(history[0].mvpTitles, ["探索王"]);

    values.set("abyss-dominion-online-route", "resonanceMaze");
    const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?v=2.11.69-build245-route-compat-test");
    const routeController = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
    assert.equal(routeController.route, "explore");
    assert.equal(values.get("abyss-dominion-online-route"), "explore");
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage;
  }
});

test("build245 wires resume reconciliation and bounded recovery settlement into every authoritative snapshot", async () => {
  const [client, save] = await Promise.all([read("src/online/OnlinePartyClient.js"), read("src/services/SaveService.js")]);
  assert.match(client, /this\.roomState = room; this\.roomId = room\.roomId;\n    this\._syncActiveExpeditionRun\(room\)/);
  assert.match(client, /message\.type === "expeditionResult"[^\n]*_trackRecoverySettlement/);
  assert.match(client, /if \(!settled\.duplicate && !presentedResultIds\.has\(resultId\)\)/);
  assert.match(client, /LEGACY_RESONANCE_ROUTES/);
  assert.match(save, /onlineParty\.coopContributionHistory=normalizeCoopContributionHistory/);
});
