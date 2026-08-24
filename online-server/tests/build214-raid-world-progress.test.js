import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function hello(store, suffix = "AAAA") {
  const conn = connection();
  const result = store.hello(conn, {
    friendId: `AD-BZ24-${suffix}`,
    clientKey: `build214-client-key-${suffix}`.padEnd(32, "x"),
    profile: {
      displayName: `主-${suffix}`,
      speciesId: "slime",
      maxFloor: 50,
      battleStats: { hp: 1_000, mp: 100, atk: 180, matk: 160, def: 90, mdef: 90, spd: 70, crit: 5, evasion: 3 },
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session };
}

test("build214 raid HP follows the world owner across room changes", () => {
  const codes = ["B214A1", "B214A2", "B214B1"];
  const store = new RoomStore({ randomRoomCode: () => codes.shift(), random: () => .2 });
  const owner = hello(store, "AAAA");

  const first = store.createRoom(owner.session);
  assert.equal(store.setReady(owner.session, true).ok, true);
  assert.equal(store.startRaid(owner.session).ok, true);
  const firstRoom = store.rooms.get(first.room.roomId);
  firstRoom.raid.boss.hp = 31_250;
  firstRoom.raid.progress.hp = 31_250;
  firstRoom.raid.progress.totalDamage = 18_750;
  store._broadcastRoom(firstRoom);

  const second = store.createRoom(owner.session);
  const secondRoom = store.rooms.get(second.room.roomId);
  assert.notEqual(second.room.roomId, first.room.roomId);
  assert.equal(secondRoom.ownerId, owner.session.playerId);
  assert.equal(secondRoom.raidProgress.hp, 31_250);
  assert.equal(secondRoom.raidProgress.totalDamage, 18_750);

  assert.equal(store.setReady(owner.session, true).ok, true);
  assert.equal(store.startRaid(owner.session).ok, true);
  assert.equal(secondRoom.raid.boss.maxHp, 50_000);
  assert.equal(secondRoom.raid.boss.hp, 31_250);

  const other = hello(store, "BBBB");
  const otherRoomResult = store.createRoom(other.session);
  const otherRoom = store.rooms.get(otherRoomResult.room.roomId);
  assert.equal(otherRoom.raidProgress, null);
  assert.equal(store.setReady(other.session, true).ok, true);
  assert.equal(store.startRaid(other.session).ok, true);
  assert.equal(otherRoom.raid.boss.hp, 50_000);
});

test("build214 clearing a raid removes the owner's retained HP", () => {
  const codes = ["B214C1", "B214C2"];
  const store = new RoomStore({ randomRoomCode: () => codes.shift(), random: () => .2 });
  const owner = hello(store, "CCCC");
  const first = store.createRoom(owner.session);
  const firstRoom = store.rooms.get(first.room.roomId);
  firstRoom.raidProgress = { campaignId: "campaign-test", maxHp: 50_000, hp: 1, attempts: 1, totalDamage: 49_999, milestonesClaimed: [5, 10, 25], lastAttemptAt: 1 };
  store._broadcastRoom(firstRoom);
  assert.equal(store.raidProgressByOwner.get(owner.session.playerId).hp, 1);

  firstRoom.raidProgress = null;
  store._broadcastRoom(firstRoom);
  assert.equal(store.raidProgressByOwner.has(owner.session.playerId), false);
  const second = store.createRoom(owner.session);
  assert.equal(store.rooms.get(second.room.roomId).raidProgress, null);
});
