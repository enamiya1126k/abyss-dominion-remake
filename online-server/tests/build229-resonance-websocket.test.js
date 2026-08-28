import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import path from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { WebSocket } from "ws";

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INTEGRATED_MESSAGE = "この機能は共同探索へ統合されました。通常の共同探索を開始してください。";

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

function createClient(url) {
  const socket = new WebSocket(url), inbox = [], waiters = [];
  socket.on("message", raw => {
    const message = JSON.parse(raw.toString()), index = waiters.findIndex(waiter => waiter.predicate(message));
    if (index < 0) { inbox.push(message); return; }
    const [waiter] = waiters.splice(index, 1); clearTimeout(waiter.timer); waiter.resolve(message);
  });
  return {
    socket,
    open: () => new Promise((resolve, reject) => { socket.once("open", resolve); socket.once("error", reject); }),
    send: message => socket.send(JSON.stringify(message)),
    waitFor(predicate, label) {
      const index = inbox.findIndex(predicate); if (index >= 0) return Promise.resolve(inbox.splice(index, 1)[0]);
      return new Promise((resolve, reject) => {
        const waiter = { predicate, resolve, reject, timer: null };
        waiter.timer = setTimeout(() => { const position = waiters.indexOf(waiter); if (position >= 0) waiters.splice(position, 1); reject(new Error(`${label} timed out`)); }, 4_000);
        waiters.push(waiter);
      });
    },
    close: () => socket.close(1000, "test complete"),
  };
}

test("legacy resonance websocket requests are rejected without replacing normal exploration", { timeout: 20_000 }, async () => {
  const port = await freePort(), state = mkdtempSync(path.join(tmpdir(), "abyss-184-ws-"));
  const child = spawn(process.execPath, ["server.js"], {
    cwd: serverDirectory,
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      FRIEND_STATE_FILE: path.join(state, "friends.json"),
      GUILD_STATE_FILE: path.join(state, "guilds.json"),
      SETTLEMENT_STATE_FILE: path.join(state, "settlements.json"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stderr = "", client;
  child.stderr.on("data", chunk => { stderr += chunk.toString(); });
  try {
    await Promise.race([
      new Promise((resolve, reject) => {
        child.stdout.on("data", chunk => { if (chunk.toString().includes("Online home, exploration, raid")) resolve(); });
        child.once("exit", code => reject(new Error(`server exited early (${code}): ${stderr}`)));
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("server startup timed out")), 5_000)),
    ]);
    const health = await fetch(`http://127.0.0.1:${port}/health`).then(response => response.json());
    assert.equal(health.ok, true); assert.equal(health.resonanceMazes, 0);

    client = createClient(`ws://127.0.0.1:${port}/party`); await client.open();
    const profile = { displayName: "共同探索通信", speciesId: "slime", maxFloor: 100, currentHp: 5000, currentMp: 100, battleStats: { hp: 5000, mp: 100, atk: 500, matk: 450, def: 400, mdef: 380, spd: 300 }, skills: [] };
    client.send({ type: "hello", protocol: "1.16.0", friendId: "AD-RSNA-AAAB", clientKey: "build184-websocket-client".padEnd(32, "x"), profile });
    await client.waitFor(message => message.type === "helloAck", "helloAck");
    client.send({ type: "createRoom" });
    await client.waitFor(message => message.type === "roomState" && message.room?.phase === "lobby", "room creation");
    client.send({ type: "setReady", ready: true });
    await client.waitFor(message => message.type === "roomState" && message.room?.members?.[0]?.ready, "ready state");

    for (const request of [{ type: "startResonance" }, { type: "resonanceMove", direction: "right" }, { type: "resonanceAction", kind: "interact" }]) {
      client.send(request);
      const error = await client.waitFor(message => message.type === "error" && message.code === "RESONANCE_INTEGRATED", `${request.type} migration response`);
      assert.equal(error.message, INTEGRATED_MESSAGE);
    }

    client.send({ type: "startExpedition", profile, hostWorld: { floorSeeds: { 1: 18401 }, openedChestIds: {} } });
    const started = await client.waitFor(message => message.type === "expeditionStarted", "normal expedition start");
    assert.equal(started.room.phase, "expedition");
    assert.equal(started.room.resonance, null);
    assert.equal(started.room.expedition.coop.enabled, false);
    assert.equal(started.room.expedition.coop.resonance, null);
  } finally {
    client?.close();
    if (child.exitCode === null) child.kill("SIGTERM");
    await Promise.race([new Promise(resolve => child.once("exit", resolve)), new Promise(resolve => setTimeout(resolve, 2_000))]);
  }
});
