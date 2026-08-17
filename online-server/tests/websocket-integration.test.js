import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { WebSocket } from "ws";

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function timeoutPromise(ms, label) {
  return new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
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
    if (matchIndex >= 0) {
      const [waiter] = waiters.splice(matchIndex, 1);
      clearTimeout(waiter.timer);
      waiter.resolve(message);
    } else {
      inbox.push(message);
    }
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
    close() {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close();
    },
  };
}

function profile(index) {
  return {
    displayName: `通信試験${index}`,
    speciesId: "slime",
    monsterName: `試験魔物${index}`,
    maxFloor: 100,
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

async function connectPlayer(url, index) {
  const client = createClient(url);
  await client.open();
  const alphabet = "BCDEFG";
  client.send({
    type: "hello",
    friendId: `AD-TEST-TES${alphabet[index - 1]}`,
    clientKey: `websocket-integration-secret-${index}`.padEnd(32, "x"),
    profile: profile(index),
  });
  const hello = await client.waitFor(message => message.type === "helloAck", "helloAck");
  assert.equal(hello.resumed, false);
  return client;
}

test("real websocket server synchronizes four clients, chat, health and capacity", { timeout: 20_000 }, async () => {
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
    assert.equal(health.protocol, "1.7.0");

    const url = `ws://127.0.0.1:${port}/party`;
    for (let index = 1; index <= 5; index += 1) clients.push(await connectPlayer(url, index));

    clients[0].send({ type: "createRoom" });
    const created = await clients[0].waitFor(message => message.type === "roomState" && message.room?.members?.length === 1, "room creation");
    const roomId = created.room.roomId;
    assert.match(roomId, /^[A-Z2-9]{6}$/);

    for (let index = 1; index < 4; index += 1) {
      clients[index].send({ type: "joinRoom", roomId });
      await clients[index].waitFor(message => message.type === "roomState" && message.room?.roomId === roomId, `player ${index + 1} join`);
    }
    const fullRoom = await clients[0].waitFor(message => message.type === "roomState" && message.room?.members?.length === 4, "four-player room synchronization");
    assert.equal(new Set(fullRoom.room.members.map(member => member.playerId)).size, 4);

    clients[3].send({ type: "chat", text: "四人通信テスト成功" });
    const chat = await clients[0].waitFor(message => message.type === "chatMessage" && message.message?.text === "四人通信テスト成功", "room chat synchronization");
    assert.equal(chat.message.name, "通信試験4");

    clients[4].send({ type: "joinRoom", roomId });
    const rejected = await clients[4].waitFor(message => message.type === "error" && message.code === "ROOM_FULL", "fifth-player rejection");
    assert.equal(rejected.message, "この部屋は4人で満員です");
  } finally {
    for (const client of clients) client.close();
    if (child.exitCode === null) child.kill("SIGTERM");
    await Promise.race([
      new Promise(resolve => child.once("exit", resolve)),
      new Promise(resolve => setTimeout(resolve, 2_000)),
    ]);
  }
});
