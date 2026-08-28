import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../online-server/src/RoomStore.js";

function connection() {
  return {
    messages: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close() {},
  };
}

function profile(displayName) {
  return {
    displayName,
    monsterName: `${displayName}の魔物`,
    monsterId: `${displayName}-monster`,
    speciesId: "slime",
    maxFloor: 80,
    currentHp: 500,
    currentMp: 60,
    explorePickupDone: true,
    battleStats: {
      hp: 500,
      mp: 60,
      atk: 180,
      matk: 160,
      def: 140,
      mdef: 130,
      spd: 90,
      crit: 5,
      evasion: 3,
      accuracy: 100,
    },
  };
}

function join(store, friendId, clientKey, displayName) {
  const conn = connection();
  const sourceProfile = profile(displayName);
  const result = store.hello(conn, { friendId, clientKey, profile: sourceProfile });
  assert.equal(result.ok, true);
  return { conn, session: conn.session, result, friendId, clientKey, profile: sourceProfile };
}

function roomMember(snapshot, playerId) {
  return snapshot.members.find(member => member.playerId === playerId);
}

test("build245 reconnect restores the exact active normal expedition instead of regenerating a map", () => {
  let now = 245_000;
  const store = new RoomStore({
    now: () => now,
    reconnectGraceMs: 300_000,
    randomRoomCode: () => "PAR245",
    random: () => .47,
  });
  const host = join(store, "AD-PAR2-45HA", "build245-parity-host-client-key", "部屋主");
  const guest = join(store, "AD-PAR2-45GB", "build245-parity-guest-client-key", "お手伝い");
  const created = store.createRoom(host.session);
  const room = store.rooms.get(created.room.roomId);
  assert.equal(store.joinRoom(guest.session, room.roomId).ok, true);
  assert.equal(store.setFloor(host.session, 17).ok, true);
  assert.equal(store.setReady(host.session, true).ok, true);
  assert.equal(store.setReady(guest.session, true).ok, true);
  assert.equal(store.startExpedition(host.session, {
    hostWorld: {
      revision: 7,
      floorSeeds: { 17: 245_017 },
      openedChestIds: { 17: [] },
      defeatedBossFloors: [],
      claimedBossRewardFloors: [],
    },
  }).ok, true);

  guest.session.coopVitals = { hp: 333, maxHp: 500, mp: 22, maxMp: 60 };
  const liveExpedition = room.expedition;
  const before = structuredClone(store.roomSnapshot(room, guest.session.playerId));
  const beforeGuest = roomMember(before, guest.session.playerId);
  const rewardId = `${room.expedition.id}:build245-reconnect:${guest.session.playerId}`;
  assert.equal(store._queueReward(guest.session, {
    rewardId,
    reward: { gold: 245 },
    source: { kind: "build245Reconnect", floor: 17, title: "再接続確認" },
  }), true);

  store.disconnect(guest.session, guest.conn);
  assert.strictEqual(room.expedition, liveExpedition, "network loss must retain the authoritative expedition object");
  now += 2_000;
  const replacement = connection();
  const resumed = store.hello(replacement, {
    friendId: guest.friendId,
    clientKey: guest.clientKey,
    resumeToken: guest.result.resumeToken,
    profile: guest.profile,
  });

  assert.equal(resumed.ok, true);
  assert.equal(resumed.resumed, true);
  assert.strictEqual(room.expedition, liveExpedition, "resume must not carve or replace the active floor");
  assert.deepEqual(resumed.room.expedition, before.expedition, "map, enemies, chests, optional objects and run progress stay identical");
  assert.deepEqual(roomMember(resumed.room, host.session.playerId), roomMember(before, host.session.playerId));
  assert.deepEqual(roomMember(resumed.room, guest.session.playerId).dungeonPosition, beforeGuest.dungeonPosition);
  assert.deepEqual(roomMember(resumed.room, guest.session.playerId).coopVitals, { hp: 333, maxHp: 500, mp: 22, maxMp: 60 });
  assert.equal(resumed.room.expedition.id, before.expedition.id);
  assert.equal(resumed.room.expedition.offlineSeed, 245_017);

  store.deliverPendingRewards(replacement.session);
  assert.equal(replacement.messages.filter(message => message.type === "onlineReward" && message.rewardId === rewardId).length, 1);
  assert.equal(store.ackReward(replacement.session, rewardId).ok, true);
  store.deliverPendingRewards(replacement.session);
  assert.equal(replacement.messages.filter(message => message.type === "onlineReward" && message.rewardId === rewardId).length, 1, "ACK prevents a duplicate personal reward after recovery");
});
