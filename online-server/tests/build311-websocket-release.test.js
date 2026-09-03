import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { WebSocket } from "ws";

const PROTOCOL = "1.17.0";
const STALE_PROTOCOL = "1.16.0";
const INTEGRATED_MESSAGE = "この機能は共同探索へ統合されました。通常の共同探索を開始してください。";
const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function timeoutPromise(ms, label) {
  return new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    timer.unref?.();
  });
}

function delay(ms) {
  return new Promise(resolve => {
    const timer = setTimeout(resolve, ms);
    timer.unref?.();
  });
}

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

function createClient(url) {
  const socket = new WebSocket(url);
  const inbox = [];
  const waiters = [];

  socket.on("message", raw => {
    const message = JSON.parse(raw.toString());
    const matchIndex = waiters.findIndex(waiter => waiter.predicate(message));
    if (matchIndex < 0) {
      inbox.push(message);
      return;
    }
    const [waiter] = waiters.splice(matchIndex, 1);
    clearTimeout(waiter.timer);
    waiter.resolve(message);
  });
  socket.on("close", () => {
    while (waiters.length) {
      const waiter = waiters.shift();
      clearTimeout(waiter.timer);
      waiter.reject(new Error("socket closed before the expected message arrived"));
    }
  });

  return {
    socket,
    async open() {
      if (socket.readyState === WebSocket.OPEN) return;
      await Promise.race([
        new Promise((resolve, reject) => {
          socket.once("open", resolve);
          socket.once("error", reject);
        }),
        timeoutPromise(4_000, "websocket open"),
      ]);
    },
    send(message) {
      socket.send(JSON.stringify(message));
    },
    waitFor(predicate, label = "message") {
      const foundIndex = inbox.findIndex(predicate);
      if (foundIndex >= 0) return Promise.resolve(inbox.splice(foundIndex, 1)[0]);
      return new Promise((resolve, reject) => {
        const waiter = { predicate, resolve, reject, timer: null };
        waiter.timer = setTimeout(() => {
          const index = waiters.indexOf(waiter);
          if (index >= 0) waiters.splice(index, 1);
          reject(new Error(`${label} timed out`));
        }, 4_000);
        waiter.timer.unref?.();
        waiters.push(waiter);
      });
    },
    async close() {
      if (socket.readyState === WebSocket.CLOSED) return;
      const closed = new Promise(resolve => socket.once("close", resolve));
      if (socket.readyState === WebSocket.OPEN) socket.close(1000, "test complete");
      else socket.terminate();
      await Promise.race([closed, delay(1_000)]);
    },
  };
}

function profile(index) {
  return {
    displayName: `Build311通信試験${index}`,
    speciesId: "slime",
    monsterName: `試験魔物${index}`,
    maxFloor: 100,
    currentHp: 10_000,
    currentMp: 100,
    battleStats: {
      hp: 10_000,
      mp: 100,
      atk: 1_000,
      matk: 900,
      def: 800,
      mdef: 750,
      spd: 100 + index,
      crit: 5,
      evasion: 8,
      accuracy: 100,
    },
    skills: [],
  };
}

const identities = ["AAAB", "AAAC", "AAAD", "AAAE", "AAAF"];

function credentials(index) {
  return {
    friendId: `AD-B3WS-${identities[index - 1]}`,
    clientKey: `build311-websocket-client-${index}`.padEnd(32, "x"),
    profile: profile(index),
  };
}

async function helloClient(url, identity, { protocol = PROTOCOL, resumeToken } = {}) {
  const client = createClient(url);
  await client.open();
  client.send({ type: "hello", protocol, ...identity, ...(resumeToken ? { resumeToken } : {}) });
  return client;
}

async function connectCurrentClient(url, identity, options = {}) {
  const client = await helloClient(url, identity, options);
  const hello = await client.waitFor(
    message => message.type === "helloAck" || message.type === "error",
    "hello response",
  );
  assert.equal(
    hello.type,
    "helloAck",
    `handshake failed: ${hello.code ?? "UNKNOWN"} ${hello.message ?? ""}`.trim(),
  );
  const recovery = await client.waitFor(message => message.type === "recoveryComplete", "recoveryComplete");
  assert.equal(hello.protocol, PROTOCOL);
  assert.equal(hello.capabilities?.expeditionResultsV1, true);
  assert.equal(hello.capabilities?.onlineSafetyV1, true);
  assert.equal(typeof hello.resumeToken, "string");
  assert.ok(hello.resumeToken.length >= 16);
  return { client, hello, recovery };
}

test("Build311 real websocket contract uses protocol 1.17.0 and preserves recovery and exploration", { timeout: 30_000 }, async () => {
  const port = await freePort();
  const stateDirectory = await mkdtemp(path.join(tmpdir(), "abyss-build311-ws-"));
  const child = spawn(process.execPath, ["server.js"], {
    cwd: serverDirectory,
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      ALLOWED_ORIGINS: "*",
      FRIEND_STATE_FILE: path.join(stateDirectory, "friends.json"),
      GUILD_STATE_FILE: path.join(stateDirectory, "guilds.json"),
      POWER_RANKING_STATE_FILE: path.join(stateDirectory, "rankings.json"),
      SETTLEMENT_STATE_FILE: path.join(stateDirectory, "settlements.json"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const clients = [];
  let stderr = "";
  child.stderr.on("data", chunk => { stderr += chunk.toString(); });

  try {
    await Promise.race([
      new Promise((resolve, reject) => {
        child.stdout.on("data", chunk => {
          if (chunk.toString().includes("Online home, exploration, raid")) resolve();
        });
        child.once("exit", code => reject(new Error(`server exited early (${code}): ${stderr}`)));
      }),
      timeoutPromise(5_000, "server startup"),
    ]);

    const healthResponse = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(healthResponse.status, 200);
    const health = await healthResponse.json();
    assert.equal(health.ok, true);
    assert.equal(health.protocol, PROTOCOL);
    assert.equal(health.resonanceMazes, 0);

    const url = `ws://127.0.0.1:${port}/party`;
    const stale = await helloClient(url, credentials(1), { protocol: STALE_PROTOCOL });
    clients.push(stale);
    const mismatch = await stale.waitFor(
      message => message.type === "error" && message.code === "PROTOCOL_MISMATCH",
      "stale protocol rejection",
    );
    assert.equal(mismatch.message, "ゲームとオンラインサーバーのバージョンが一致しません");
    await stale.close();

    const connected = [];
    for (let index = 1; index <= 5; index += 1) {
      const result = await connectCurrentClient(url, credentials(index));
      clients.push(result.client);
      connected.push(result);
      assert.equal(result.hello.resumed, false);
      assert.equal(result.recovery.orphanedExpedition, true);
    }

    connected[0].client.send({ type: "createRoom" });
    const created = await connected[0].client.waitFor(
      message => message.type === "roomState" && message.room?.members?.length === 1,
      "room creation",
    );
    const roomId = created.room.roomId;
    assert.match(roomId, /^[A-Z2-9]{6}$/);

    for (let index = 1; index < 4; index += 1) {
      connected[index].client.send({ type: "joinRoom", roomId });
      await connected[index].client.waitFor(
        message => message.type === "roomState" && message.room?.roomId === roomId,
        `player ${index + 1} join`,
      );
    }
    const fullRoom = await connected[0].client.waitFor(
      message => message.type === "roomState" && message.room?.members?.length === 4,
      "four-player room synchronization",
    );
    assert.equal(new Set(fullRoom.room.members.map(member => member.playerId)).size, 4);

    const reconnectIdentity = credentials(4);
    await connected[3].client.close();
    await connected[0].client.waitFor(
      message => message.type === "roomState"
        && message.room?.roomId === roomId
        && message.room.members.some(member => member.playerId === reconnectIdentity.friendId && !member.connected),
      "disconnected member state",
    );
    const resumed = await connectCurrentClient(url, reconnectIdentity, { resumeToken: connected[3].hello.resumeToken });
    clients.push(resumed.client);
    connected[3] = resumed;
    assert.equal(resumed.hello.resumed, true);
    assert.equal(resumed.hello.resumableRoom, true);
    assert.equal(resumed.hello.room?.roomId, roomId);
    assert.equal(resumed.recovery.orphanedExpedition, false);

    resumed.client.send({ type: "chat", text: "Build311四人通信テスト成功" });
    const chat = await connected[0].client.waitFor(
      message => message.type === "chatMessage" && message.message?.text === "Build311四人通信テスト成功",
      "room chat synchronization",
    );
    assert.equal(chat.message.name, "Build311通信試験4");

    connected[4].client.send({ type: "joinRoom", roomId });
    const rejected = await connected[4].client.waitFor(
      message => message.type === "error" && message.code === "ROOM_FULL",
      "fifth-player rejection",
    );
    assert.equal(rejected.message, "この部屋は4人で満員です");

    connected[4].client.send({ type: "createRoom" });
    await connected[4].client.waitFor(
      message => message.type === "roomState" && message.room?.phase === "lobby" && message.room?.members?.length === 1,
      "solo room creation",
    );
    connected[4].client.send({ type: "setFloor", floor: 1 });
    await connected[4].client.waitFor(
      message => message.type === "roomState" && message.room?.selectedFloor === 1,
      "solo floor selection",
    );
    connected[4].client.send({ type: "setReady", ready: true });
    await connected[4].client.waitFor(
      message => message.type === "roomState" && message.room?.members?.[0]?.ready === true,
      "solo ready state",
    );

    for (const request of [
      { type: "startResonance" },
      { type: "resonanceMove", direction: "right" },
      { type: "resonanceAction", kind: "interact" },
    ]) {
      connected[4].client.send(request);
      const error = await connected[4].client.waitFor(
        message => message.type === "error" && message.code === "RESONANCE_INTEGRATED",
        `${request.type} migration response`,
      );
      assert.equal(error.message, INTEGRATED_MESSAGE);
    }

    connected[4].client.send({
      type: "startExpedition",
      profile: credentials(5).profile,
      hostWorld: { floorSeeds: { 1: 31101 }, openedChestIds: {} },
    });
    const started = await connected[4].client.waitFor(
      message => message.type === "expeditionStarted",
      "normal expedition start",
    );
    assert.equal(started.room.phase, "expedition");
    assert.equal(started.room.selectedFloor, 1);
    assert.equal(started.room.resonance, null);
    assert.equal(started.room.expedition.floor, 1);
    assert.equal(started.room.expedition.coop.enabled, false);
    assert.equal(started.room.expedition.coop.resonance, null);
  } finally {
    await Promise.allSettled(clients.map(client => client.close()));
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      await Promise.race([
        new Promise(resolve => child.once("exit", resolve)),
        delay(2_000),
      ]);
    }
    await rm(stateDirectory, { recursive: true, force: true });
  }
});
