import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { WebSocket } from "ws";
import { RoomStore } from "../src/RoomStore.js";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function encoded(value, width) {
  let number = Math.max(0, Math.floor(Number(value) || 0));
  let result = "";
  do {
    result = ALPHABET[number % ALPHABET.length] + result;
    number = Math.floor(number / ALPHABET.length);
  } while (number > 0);
  return result.padStart(width, "A").slice(-width);
}

function connection() {
  return {
    messages: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close() {},
  };
}

function hello(store, index, profile = {}) {
  const conn = connection();
  const friendId = `AD-${encoded(index, 4)}-${encoded(index + 200, 4)}`;
  const result = store.hello(conn, {
    friendId,
    clientKey: `build229-room-directory-client-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `募集主${index}`,
      monsterName: `仲間${index}`,
      speciesId: "slime",
      level: 10 + index,
      power: 9_999_999,
      maxFloor: 500,
      skills: [{ id: "private-skill", name: "非公開スキル", kind: "attack", mp: 0, power: 1 }],
      battleStats: { hp: 5000, mp: 100, atk: 900, matk: 800, def: 700, mdef: 650, spd: 300 },
      ...profile,
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session, result };
}

function environment({ now = 10_000 } = {}) {
  let clock = now;
  let roomSerial = 0;
  const store = new RoomStore({
    now: () => clock,
    random: () => 0.9,
    randomRoomCode: () => `R${encoded(roomSerial++, 5)}`,
  });
  return {
    store,
    now: () => clock,
    advance(milliseconds) { clock += milliseconds; },
  };
}

function publicRoom(store, player, options = {}) {
  const result = store.createRoom(player.session, {
    published: true,
    purpose: "explore",
    style: "anyone",
    ...options,
  });
  assert.equal(result.ok, true);
  return store.rooms.get(result.room.roomId);
}

test("build229 keeps rooms private by default and exposes only the strict public listing DTO", () => {
  const env = environment();
  const observer = hello(env.store, 1);
  const privateHost = hello(env.store, 2);
  const publicHost = hello(env.store, 3, {
    displayName: "公開主",
    monsterName: "公開仲間",
    visualSpeciesId: "myth_yori",
    fallbackEmoji: "竜",
  });

  const privateCreated = env.store.createRoom(privateHost.session);
  assert.equal(privateCreated.ok, true);
  assert.equal(env.store.rooms.get(privateCreated.room.roomId).listing.published, false);

  const room = publicRoom(env.store, publicHost, { purpose: "raid", style: "help" });
  const listed = env.store.listRoomListings(observer.session);
  assert.equal(listed.ok, true);
  assert.equal(listed.listings.length, 1);
  const entry = listed.listings[0];
  assert.equal(entry.roomId, room.roomId);
  assert.deepEqual(Object.keys(entry).sort(), [
    "count", "expiresAt", "floor", "host", "listingId", "max", "publishedAt",
    "purpose", "roomId", "slots", "style", "updatedAt",
  ].sort());
  assert.deepEqual(Object.keys(entry.host).sort(), [
    "displayName", "fallbackEmoji", "level", "monsterName", "speciesId", "visualSpeciesId",
  ].sort());
  assert.equal(entry.purpose, "raid");
  assert.equal(entry.style, "help");
  assert.equal(entry.host.displayName, "公開主");
  assert.equal(entry.host.monsterName, "公開仲間");

  const wire = JSON.stringify(listed.message);
  for (const secret of [
    publicHost.session.playerId,
    publicHost.session.clientKey,
    publicHost.session.resumeToken,
    "private-skill",
    "非公開スキル",
  ]) assert.equal(wire.includes(secret), false, `listing leaked ${secret}`);
  for (const forbiddenKey of [
    "ownerId", "leaderId", "playerId", "clientKey", "resumeToken", "profile",
    "battleStats", "skills", "equipment", "chatHistory", "hostWorld", "raidProgress",
  ]) assert.equal(Object.hasOwn(entry, forbiddenKey) || Object.hasOwn(entry.host, forbiddenKey), false, `listing exposed ${forbiddenKey}`);
});

test("build229 lists only a public, open lobby with a connected host", () => {
  const env = environment();
  const observer = hello(env.store, 10);

  const eligibleHost = hello(env.store, 11);
  const eligible = publicRoom(env.store, eligibleHost, { purpose: "social", style: "casual" });

  const privateHost = hello(env.store, 12);
  env.store.createRoom(privateHost.session);

  const fullHost = hello(env.store, 13);
  const full = publicRoom(env.store, fullHost);
  for (let index = 14; index <= 16; index += 1) {
    const member = hello(env.store, index);
    assert.equal(env.store.joinRoom(member.session, full.roomId).ok, true);
  }

  const busyHost = hello(env.store, 17);
  const busyHelper = hello(env.store, 18);
  const busy = publicRoom(env.store, busyHost);
  assert.equal(env.store.joinRoom(busyHelper.session, busy.roomId).ok, true);
  assert.equal(env.store.setReady(busyHost.session, true).ok, true);
  assert.equal(env.store.setReady(busyHelper.session, true).ok, true);
  assert.equal(env.store.startExpedition(busyHost.session, { hostWorld: { floorSeeds: { 1: 22917 }, openedChestIds: {} } }).ok, true);

  const offlineHost = hello(env.store, 19);
  publicRoom(env.store, offlineHost);
  env.store.disconnect(offlineHost.session);

  const expiredHost = hello(env.store, 20);
  const expired = publicRoom(env.store, expiredHost);
  expired.listing.expiresAt = env.now();

  const result = env.store.listRoomListings(observer.session);
  assert.equal(result.ok, true);
  assert.deepEqual(result.listings.map(entry => entry.roomId), [eligible.roomId]);
  assert.equal(result.listings[0].purpose, "social");
  assert.equal(result.listings[0].style, "casual");
});

test("build229 caps the directory at 24 entries with a deterministic order", () => {
  const env = environment({ now: 50_000 });
  const observer = hello(env.store, 30);
  const roomIds = [];
  for (let index = 31; index < 58; index += 1) {
    const host = hello(env.store, index);
    roomIds.push(publicRoom(env.store, host).roomId);
  }

  const first = env.store.listRoomListings(observer.session);
  assert.equal(first.ok, true);
  assert.equal(first.listings.length, 24);
  assert.deepEqual(first.listings.map(entry => entry.roomId), [...roomIds].sort().slice(0, 24));

  env.advance(1_000);
  const second = env.store.listRoomListings(observer.session);
  assert.equal(second.ok, true);
  assert.deepEqual(second.listings, first.listings);
});

test("build229 quick join selects only a matching public listing", () => {
  const env = environment();
  const privateHost = hello(env.store, 60);
  env.store.createRoom(privateHost.session);
  const raidHost = hello(env.store, 61);
  const raid = publicRoom(env.store, raidHost, { purpose: "raid", style: "fast" });
  const guest = hello(env.store, 62);

  const noMatch = env.store.quickJoin(guest.session, { purpose: "explore" });
  assert.equal(noMatch.ok, false);
  assert.equal(noMatch.code, "NO_OPEN_ROOMS");
  assert.equal(guest.session.roomId, null);

  const joined = env.store.quickJoin(guest.session, { purpose: "raid", style: "fast" });
  assert.equal(joined.ok, true);
  assert.equal(guest.session.roomId, raid.roomId);
  assert.equal(raid.members.has(guest.session.playerId), true);
});

test("build229 serializes two quick joins for the final slot without overfilling", async () => {
  const env = environment();
  const host = hello(env.store, 70);
  const room = publicRoom(env.store, host);
  for (let index = 71; index <= 72; index += 1) {
    const member = hello(env.store, index);
    assert.equal(env.store.joinRoom(member.session, room.roomId).ok, true);
  }
  assert.equal(room.members.size, 3);

  const racers = [hello(env.store, 73), hello(env.store, 74)];
  const results = await Promise.all(racers.map(async player => env.store.quickJoin(player.session, { purpose: "explore" })));
  assert.equal(results.filter(result => result.ok).length, 1);
  assert.equal(results.filter(result => result.code === "NO_OPEN_ROOMS").length, 1);
  assert.equal(room.members.size, 4);
  assert.equal(racers.filter(player => player.session.roomId === room.roomId).length, 1);
});

test("build229 removed members cannot rejoin the same surviving room", () => {
  const env = environment();
  const host = hello(env.store, 80);
  const guest = hello(env.store, 81);
  const room = publicRoom(env.store, host);
  assert.equal(env.store.joinRoom(guest.session, room.roomId).ok, true);
  const listingId = room.listing.listingId;

  const unauthorized = env.store.removeRoomMember(guest.session, host.session.playerId);
  assert.equal(unauthorized.code, "LEADER_ONLY");

  const removed = env.store.removeRoomMember(host.session, guest.session.playerId);
  assert.equal(removed.ok, true);
  assert.equal(guest.session.roomId, null);
  assert.equal(room.removedMemberIds.has(guest.session.playerId), true);
  assert.ok(guest.conn.messages.some(message => message.type === "leftRoom"));

  const direct = env.store.joinRoom(guest.session, room.roomId);
  assert.equal(direct.code, "REMOVED_FROM_ROOM");
  const listed = env.store.joinListedRoom(guest.session, { roomId: room.roomId, listingId });
  assert.equal(listed.code, "REMOVED_FROM_ROOM");
  const quick = env.store.quickJoin(guest.session, { purpose: "explore" });
  assert.equal(quick.code, "NO_OPEN_ROOMS");
  assert.equal(room.members.size, 1);
});

test("build229 applies independent deterministic directory and quick-join rate limits", () => {
  const env = environment({ now: 100_000 });
  const observer = hello(env.store, 90);

  assert.equal(env.store.listRoomListings(observer.session).ok, true);
  assert.equal(env.store.listRoomListings(observer.session).code, "LISTING_RATE");
  env.advance(999);
  assert.equal(env.store.listRoomListings(observer.session).code, "LISTING_RATE");
  env.advance(1);
  assert.equal(env.store.listRoomListings(observer.session).ok, true);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const result = env.store.quickJoin(observer.session);
    assert.equal(result.code, "NO_OPEN_ROOMS");
  }
  assert.equal(env.store.quickJoin(observer.session).code, "QUICK_JOIN_RATE");
  env.advance(10_000);
  assert.equal(env.store.quickJoin(observer.session).code, "NO_OPEN_ROOMS");

  const host = hello(env.store, 91);
  const room = env.store.createRoom(host.session);
  assert.equal(room.ok, true);
  assert.equal(env.store.setRoomListing(host.session, { published: true }).ok, true);
  assert.equal(env.store.setRoomListing(host.session, { published: false }).ok, true, "privacy unpublish must bypass the publish/update limiter");
  assert.equal(env.store.rooms.get(room.room.roomId).listing.published, false);
  assert.equal(env.store.setRoomListing(host.session, { published: true }).code, "LISTING_RATE");
  env.advance(2_000);
  assert.equal(env.store.setRoomListing(host.session, { published: true }).ok, true);
  assert.equal(env.store.setRoomListing(host.session, { published: false }).ok, true);
});

function websocketClient(url) {
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
      waiter.reject(new Error("websocket closed before the expected message"));
    }
  });
  return {
    socket,
    open() {
      if (socket.readyState === WebSocket.OPEN) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("websocket open timed out")), 4_000);
        timer.unref?.();
        socket.once("open", () => { clearTimeout(timer); resolve(); });
        socket.once("error", error => { clearTimeout(timer); reject(error); });
      });
    },
    send(message) { socket.send(JSON.stringify(message)); },
    waitFor(predicate, label) {
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

async function availablePort() {
  const socket = net.createServer();
  await new Promise((resolve, reject) => {
    socket.once("error", reject);
    socket.listen(0, "127.0.0.1", resolve);
  });
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  return port;
}

async function websocketHello(url, index) {
  const client = websocketClient(url);
  await client.open();
  client.send({
    type: "hello",
    protocol: "1.16.0",
    friendId: `AD-DIRX-${index === 1 ? "AAAB" : "AAAC"}`,
    clientKey: `build229-directory-websocket-client-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `掲示板通信${index}`,
      monsterName: `通信仲間${index}`,
      speciesId: "slime",
      maxFloor: 120,
      battleStats: { hp: 1000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: 100 },
      skills: [],
    },
  });
  const helloAck = await client.waitFor(message => message.type === "helloAck", "helloAck");
  return { client, helloAck };
}

test("build229 exposes directory capability, push, explicit reply and listed join over real websocket", { timeout: 20_000 }, async () => {
  const port = await availablePort();
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
      new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error("server startup timed out")), 5_000);
        timer.unref?.();
      }),
    ]);

    const url = `ws://127.0.0.1:${port}/party`;
    const host = await websocketHello(url, 1);
    const viewer = await websocketHello(url, 2);
    clients.push(host.client, viewer.client);
    assert.equal(host.helloAck.protocol, "1.16.0");
    assert.equal(host.helloAck.capabilities?.roomListingsV1, true);
    assert.equal(viewer.helloAck.capabilities?.roomListingsV1, true);

    viewer.client.send({
      type: "hello",
      protocol: "1.16.0",
      friendId: "AD-DIRX-AAAC",
      clientKey: "build229-directory-websocket-client-2".padEnd(32, "x"),
      profile: { displayName: "二重HELLO" },
    });
    const duplicateHello = await viewer.client.waitFor(message => message.type === "error" && message.code === "ALREADY_READY", "duplicate hello rejection");
    assert.equal(duplicateHello.code, "ALREADY_READY");

    host.client.send({ type: "createRoom", published: true, purpose: "raid", style: "help" });
    const created = await host.client.waitFor(message => message.type === "roomState" && message.room?.listing?.published === true, "published room");
    const pushed = await viewer.client.waitFor(message => message.type === "roomListings" && message.listings?.some(entry => entry.roomId === created.room.roomId), "directory push");
    const card = pushed.listings.find(entry => entry.roomId === created.room.roomId);
    assert.equal(card.purpose, "raid");
    assert.equal(card.style, "help");

    viewer.client.send({ type: "listRoomListings", purpose: "raid" });
    const explicit = await viewer.client.waitFor(message => message.type === "roomListings" && message.listings?.some(entry => entry.listingId === card.listingId), "directory reply");
    assert.equal(explicit.listings.length, 1);

    viewer.client.send({ type: "joinListedRoom", roomId: card.roomId, listingId: card.listingId });
    const joined = await viewer.client.waitFor(message => message.type === "roomState" && message.room?.roomId === card.roomId && message.room.members?.length === 2, "listed join");
    assert.equal(joined.room.members.length, 2, "a second hello on one socket must not allocate another room seat");
    assert.equal(joined.room.members.some(member => member.playerId === viewer.helloAck.playerId), true);
  } finally {
    for (const client of clients) client.close();
    if (child.exitCode === null) child.kill("SIGTERM");
    await Promise.race([
      new Promise(resolve => child.once("exit", resolve)),
      new Promise(resolve => setTimeout(resolve, 2_000)),
    ]);
  }
});
