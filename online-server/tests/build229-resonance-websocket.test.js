import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { WebSocket } from "ws";

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function timeoutPromise(milliseconds, label) {
  return new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${milliseconds}ms`)), milliseconds);
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
    const index = waiters.findIndex(waiter => waiter.predicate(message));
    if (index >= 0) {
      const [waiter] = waiters.splice(index, 1);
      clearTimeout(waiter.timer);
      waiter.resolve(message);
    } else inbox.push(message);
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
    send(message) { socket.send(JSON.stringify(message)); },
    waitFor(predicate, label = "message") {
      const found = inbox.findIndex(predicate);
      if (found >= 0) return Promise.resolve(inbox.splice(found, 1)[0]);
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
    close() {
      if ([WebSocket.OPEN, WebSocket.CONNECTING].includes(socket.readyState)) socket.close(1000, "test complete");
    },
  };
}

function profile(index) {
  return {
    displayName: `共鳴通信${index}`,
    monsterName: `共鳴魔物${index}`,
    speciesId: "slime",
    maxFloor: 100,
    power: 2500,
    battleStats: { hp: 5000, mp: 100, atk: 500, matk: 450, def: 400, mdef: 380, spd: 300 },
    skills: [],
  };
}

async function connectPlayer(url, index, resume = null) {
  const client = createClient(url);
  await client.open();
  const suffix = index === 1 ? "AAAB" : "AAAC";
  const friendId = `AD-RSNA-${suffix}`;
  const clientKey = `build229-resonance-websocket-client-${index}`.padEnd(32, "x");
  client.send({
    type: "hello",
    protocol: "1.16.0",
    friendId,
    clientKey,
    resumeToken: resume?.resumeToken,
    profile: profile(index),
  });
  const hello = await client.waitFor(message => message.type === "helloAck", "helloAck");
  assert.equal(hello.protocol, "1.16.0");
  return { client, hello, friendId, clientKey };
}

function routeDirections(tiles, from, target) {
  const vectors = [
    ["right", 1, 0], ["down", 0, 1], ["left", -1, 0], ["up", 0, -1],
  ];
  const key = point => `${point.x},${point.y}`;
  const queue = [{ x: from.x, y: from.y }];
  const previous = new Map([[key(from), null]]);
  const directionByKey = new Map();
  for (let cursor = 0; cursor < queue.length && !previous.has(key(target)); cursor += 1) {
    const current = queue[cursor];
    for (const [direction, dx, dy] of vectors) {
      const next = { x: current.x + dx, y: current.y + dy };
      const nextKey = key(next);
      if (previous.has(nextKey) || tiles[next.y]?.[next.x] !== ".") continue;
      previous.set(nextKey, current);
      directionByKey.set(nextKey, direction);
      queue.push(next);
    }
  }
  assert.equal(previous.has(key(target)), true, "switch must be reachable");
  const route = [];
  for (let cursor = target; key(cursor) !== key(from); cursor = previous.get(key(cursor))) {
    route.unshift({ direction: directionByKey.get(key(cursor)), x: cursor.x, y: cursor.y });
  }
  return route;
}

test("build229 restores the resonance maze through the real 1.16.0 websocket path", { timeout: 25_000 }, async () => {
  const port = await freePort();
  const child = spawn(process.execPath, ["server.js"], {
    cwd: serverDirectory,
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
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

    const health = await fetch(`http://127.0.0.1:${port}/health`).then(response => response.json());
    assert.equal(health.ok, true);
    assert.equal(health.protocol, "1.16.0");

    const url = `ws://127.0.0.1:${port}/party`;
    const leader = await connectPlayer(url, 1);
    const helper = await connectPlayer(url, 2);
    clients.push(leader.client, helper.client);
    assert.equal(leader.hello.resumed, false);
    assert.equal(helper.hello.resumed, false);

    leader.client.send({ type: "createRoom" });
    const created = await leader.client.waitFor(message => message.type === "roomState" && message.room?.members?.length === 1, "room creation");
    const roomId = created.room.roomId;
    helper.client.send({ type: "joinRoom", roomId });
    await helper.client.waitFor(message => message.type === "roomState" && message.room?.roomId === roomId && message.room.members.length === 2, "room join");

    leader.client.send({ type: "setReady", ready: true });
    helper.client.send({ type: "setReady", ready: true });
    await leader.client.waitFor(message => message.type === "roomState" && message.room?.members?.every(member => member.ready), "both ready");

    leader.client.send({ type: "startResonance" });
    const [leaderStart, helperStart] = await Promise.all([
      leader.client.waitFor(message => message.type === "resonanceStarted", "leader resonance start"),
      helper.client.waitFor(message => message.type === "resonanceStarted", "helper resonance start"),
    ]);
    assert.equal(leaderStart.resonance.id, helperStart.resonance.id);
    assert.equal(leaderStart.resonance.phase, "switches");
    assert.equal(leaderStart.resonance.players.length, 2);
    assert.equal(Object.keys(leaderStart.resonance.clues).length, 2);

    const leaderPlayer = leaderStart.resonance.players.find(player => player.playerId === leader.hello.playerId);
    const firstSwitch = leaderStart.resonance.switches[0];
    const route = routeDirections(leaderStart.resonance.tiles, leaderPlayer, firstSwitch);
    let latest = leaderStart.resonance;
    for (const step of route) {
      leader.client.send({ type: "resonanceMove", direction: step.direction });
      const state = await leader.client.waitFor(message => message.type === "resonanceState"
        && message.reason === "move"
        && message.resonance?.players?.some(player => player.playerId === leader.hello.playerId && player.x === step.x && player.y === step.y), "resonance move");
      latest = state.resonance;
    }
    const movedLeader = latest.players.find(player => player.playerId === leader.hello.playerId);
    assert.deepEqual({ x: movedLeader.x, y: movedLeader.y }, { x: firstSwitch.x, y: firstSwitch.y });

    leader.client.send({ type: "resonanceAction", kind: "interact" });
    const acted = await leader.client.waitFor(message => message.type === "resonanceState"
      && message.reason === "action"
      && message.resonance?.switches?.some(plate => plate.heldBy === leader.hello.playerId), "resonance action");
    assert.equal(acted.resonance.id, leaderStart.resonance.id);

    const helperBefore = acted.resonance.players.find(player => player.playerId === helper.hello.playerId);
    const oldResumeToken = helper.hello.resumeToken;
    helper.client.close();
    await leader.client.waitFor(message => message.type === "roomState"
      && message.room?.roomId === roomId
      && message.room.members.some(member => member.playerId === helper.hello.playerId && member.connected === false), "helper disconnect");

    const resumedHelper = await connectPlayer(url, 2, { resumeToken: oldResumeToken });
    clients.push(resumedHelper.client);
    assert.equal(resumedHelper.hello.resumed, true);
    assert.equal(resumedHelper.hello.room?.roomId, roomId);
    assert.equal(resumedHelper.hello.room?.phase, "resonance");
    assert.equal(resumedHelper.hello.room?.resonance?.id, leaderStart.resonance.id);
    const helperAfter = resumedHelper.hello.room.resonance.players.find(player => player.playerId === helper.hello.playerId);
    assert.deepEqual(helperAfter, helperBefore);
    assert.equal(resumedHelper.hello.room.resonance.switches.some(plate => plate.heldBy === leader.hello.playerId), true);
  } finally {
    for (const client of clients) client.close();
    if (child.exitCode === null) child.kill("SIGTERM");
    await Promise.race([
      new Promise(resolve => child.once("exit", resolve)),
      new Promise(resolve => setTimeout(resolve, 2_000)),
    ]);
  }
});
