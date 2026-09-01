import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function join(store, index) {
  const conn = connection();
  const result = store.hello(conn, {
    friendId: `AD-KY96-AAA${index ? "C" : "B"}`,
    clientKey: `build256-pickup-player-${index}`.padEnd(32, "x"),
    profile: {
      displayName: index ? "Guest" : "Owner",
      monsterId: `build256-pickup-monster-${index}`,
      speciesId: "slime",
      maxFloor: 20,
      currentHp: 300,
      currentMp: 40,
      explorePickupDone: true,
      battleStats: { hp: 300, mp: 40, atk: 120, matk: 100, def: 90, mdef: 80, spd: 70, crit: 5, evasion: 3, accuracy: 100 },
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session };
}

function setup() {
  const store = new RoomStore({ now: () => 256_000, random: () => .47, randomRoomCode: () => "KY256X" });
  const owner = join(store, 0), guest = join(store, 1);
  const created = store.createRoom(owner.session), room = store.rooms.get(created.room.roomId);
  assert.equal(store.joinRoom(guest.session, room.roomId).ok, true);
  for (const member of [owner, guest]) assert.equal(store.setReady(member.session, true).ok, true);
  assert.equal(store.startExpedition(owner.session, { hostWorld: { floorSeeds: { 1: 256_001 }, openedChestIds: { 1: [] } } }).ok, true);
  room.expedition.objects = room.expedition.objects.filter(object => object.type === "exit");
  room.expedition.coop = { ...(room.expedition.coop ?? {}), enabled: true, partySize: 2, gimmickType: "splitKey", keyHolders: {} };
  return { store, room, owner, guest };
}

function cellAtDistance(expedition, origin, distance) {
  for (let y = 0; y < expedition.rows; y++) for (let x = 0; x < expedition.cols; x++) {
    if (expedition.tiles[y]?.[x] === "." && Math.max(Math.abs(x - origin.x), Math.abs(y - origin.y)) === distance) return { x, y };
  }
  throw new Error(`walkable cell at distance ${distance} was not found`);
}

test("build256 small key fragments expose a stable pickup prompt from two tiles away", () => {
  const { store, room, owner } = setup(), origin = { ...owner.session.dungeonPosition };
  const fragment = { id: "build256-key-near", type: "keyFragment", fragment: "cyan", ...cellAtDistance(room.expedition, origin, 2), resolved: false, nonBlocking: true };
  room.expedition.objects.push(fragment);

  store._syncCoopInteractions(room);
  assert.deepEqual(room.expedition.interactions[owner.session.playerId], {
    action: "collectKeyFragment",
    targetId: fragment.id,
    label: "鍵の欠片を拾う",
    hint: "2マス以内から拾えます・2人で別々の欠片を集める",
  });
  assert.equal(store.expeditionInteract(owner.session, { action: "collectKeyFragment", targetId: fragment.id }).ok, true);
  assert.equal(fragment.resolved, true);
});

test("build256 stepping directly onto a key fragment collects it once without violating distinct holders", () => {
  const { store, room, owner } = setup(), position = { ...owner.session.dungeonPosition };
  const cyan = { id: "build256-key-exact", type: "keyFragment", fragment: "cyan", ...position, resolved: false, nonBlocking: true };
  room.expedition.objects.push(cyan);

  store._resolveLanding(room, owner.session);
  assert.equal(cyan.resolved, true);
  assert.equal(room.expedition.coop.keyHolders.cyan, owner.session.playerId);
  const firstEvents = owner.conn.messages.filter(message => message.type === "expeditionEvent" && message.event?.id?.endsWith(":key-cyan")).length;
  store._resolveLanding(room, owner.session);
  assert.equal(owner.conn.messages.filter(message => message.type === "expeditionEvent" && message.event?.id?.endsWith(":key-cyan")).length, firstEvents, "an already resolved fragment must not fire twice");

  const violet = { id: "build256-key-same-holder", type: "keyFragment", fragment: "violet", ...position, resolved: false, nonBlocking: true };
  room.expedition.objects.push(violet);
  store._resolveLanding(room, owner.session);
  assert.equal(violet.resolved, false, "one player cannot auto-collect both halves");
  assert.deepEqual(room.expedition.coop.keyHolders, { cyan: owner.session.playerId });
});

test("build256 key-fragment pickup still rejects forged requests beyond the forgiving radius", () => {
  const { store, room, guest } = setup(), origin = { ...guest.session.dungeonPosition };
  const fragment = { id: "build256-key-far", type: "keyFragment", fragment: "violet", ...cellAtDistance(room.expedition, origin, 3), resolved: false, nonBlocking: true };
  room.expedition.objects.push(fragment);

  store._syncCoopInteractions(room);
  assert.notEqual(room.expedition.interactions[guest.session.playerId]?.targetId, fragment.id);
  const result = store.expeditionInteract(guest.session, { action: "collectKeyFragment", targetId: fragment.id });
  assert.equal(result.ok, false);
  assert.equal(result.code, "OUT_OF_RANGE");
  assert.equal(fragment.resolved, false);
});
