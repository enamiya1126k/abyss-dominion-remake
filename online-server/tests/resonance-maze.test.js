import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

const INTEGRATED = {
  ok: false,
  code: "RESONANCE_INTEGRATED",
  message: "この機能は共同探索へ統合されました。通常の共同探索を開始してください。",
};

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function hello(store, index) {
  const conn = connection();
  const friendId = `AD-ZZZZ-ZZZ${"BCDE"[index - 1]}`;
  const result = store.hello(conn, {
    friendId,
    clientKey: `resonance-client-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `共同探索者${index}`,
      speciesId: "slime",
      maxFloor: 100,
      currentHp: 5000,
      currentMp: 100,
      battleStats: { hp: 5000, mp: 100, atk: 500, matk: 500, def: 400, mdef: 400, spd: 300 },
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session };
}

test("legacy resonance commands are inert and direct the party to normal co-op exploration", () => {
  const store = new RoomStore({ randomRoomCode: () => "ECHO24", random: () => .9 });
  const leader = hello(store, 1), helper = hello(store, 2);
  const created = store.createRoom(leader.session), room = store.rooms.get(created.room.roomId);
  assert.equal(store.joinRoom(helper.session, room.roomId).ok, true);
  assert.equal(store.setReady(leader.session, true).ok, true);
  assert.equal(store.setReady(helper.session, true).ok, true);
  const before = store.roomSnapshot(room), messageCounts = [leader.conn.messages.length, helper.conn.messages.length];

  assert.deepEqual(store.startResonance(leader.session), INTEGRATED);
  assert.deepEqual(store.moveResonance(leader.session, { direction: "right" }), INTEGRATED);
  assert.deepEqual(store.resonanceAction(leader.session, { kind: "interact" }), INTEGRATED);
  assert.deepEqual(store.roomSnapshot(room), before);
  assert.deepEqual([leader.conn.messages.length, helper.conn.messages.length], messageCounts);
  assert.equal(room.phase, "lobby");
  assert.equal(room.resonance, null);

  const started = store.startExpedition(leader.session, { hostWorld: { floorSeeds: { 1: 18401 }, openedChestIds: {} } });
  assert.equal(started.ok, true);
  assert.equal(started.room.phase, "expedition");
  assert.equal(started.room.resonance, null);
  assert.equal(started.room.expedition.coop.enabled, true);
  assert.equal(started.room.expedition.coop.resonance.level, 0);
});

test("one-player online exploration disables every co-op resonance layer", () => {
  const store = new RoomStore({ randomRoomCode: () => "SOLO24", random: () => .5 });
  const leader = hello(store, 3);
  const created = store.createRoom(leader.session), room = store.rooms.get(created.room.roomId);
  assert.equal(store.setReady(leader.session, true).ok, true);
  const started = store.startExpedition(leader.session, { hostWorld: { floorSeeds: { 1: 18402 }, openedChestIds: {} }, forceRare: "hiddenPortal" });
  assert.equal(started.ok, true);
  assert.equal(room.coopRun.resonance, null);
  assert.equal(room.expedition.coop.enabled, false);
  assert.equal(room.expedition.coop.resonance, null);
  assert.equal(room.expedition.coop.rare.kind, null);
  const coOpTypes = new Set(["coopSwitch", "resonanceVault", "coopElite", "resonanceChest", "relaySeal", "keyFragment", "combinedKey", "rarePortal", "rarePortalGuardian", "rarePortalChest"]);
  assert.equal(room.expedition.objects.some(object => coOpTypes.has(object.type)), false);
  assert.equal(store.roomSnapshot(room).resonance, null);
});

test("legacy resonance room purposes are normalized to co-op exploration", () => {
  const store = new RoomStore({ randomRoomCode: () => "LIST24" });
  const host = hello(store, 4), viewer = hello(store, 1);
  const created = store.createRoom(host.session, { published: true, purpose: "resonance", style: "casual" });
  assert.equal(created.room.listing.purpose, "explore");
  const listed = store.listRoomListings(viewer.session, { purpose: "resonance" });
  assert.equal(listed.ok, true);
  assert.equal(listed.listings.length, 1);
  assert.equal(listed.listings[0].purpose, "explore");
});
