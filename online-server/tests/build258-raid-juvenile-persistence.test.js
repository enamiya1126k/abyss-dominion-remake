import test from "node:test";
import assert from "node:assert/strict";

import { RoomStore } from "../src/RoomStore.js";

const EPOCH = Date.UTC(2026, 0, 5);
const PLAYER_ID = "AD-JUVN-AAAB";

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function join(store) {
  const conn = connection();
  const result = store.hello(conn, {
    friendId: PLAYER_ID,
    clientKey: "build258-juvenile-persistence-client-key",
    profile: {
      displayName: "幼体監査",
      monsterId: "juvenile-audit-monster",
      monsterName: "監査スライム",
      speciesId: "slime",
      attribute: "water",
      level: 201,
      maxFloor: 300,
      currentHp: 1_000,
      currentMp: 100,
      battleStats: { hp: 1_000, mp: 100, atk: 300, matk: 280, def: 180, mdef: 170, spd: 120, crit: 0, evasion: 0, accuracy: 120 },
      skills: [],
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session };
}

function createReadyRoom(store, player, code) {
  store.randomRoomCode = () => code;
  const created = store.createRoom(player.session);
  assert.equal(created.ok, true);
  assert.equal(store.setReady(player.session, true).ok, true);
  return store.rooms.get(created.room.roomId);
}

function finishJuvenileAttempt(store, room, player) {
  room.raid.minionsDefeated = 1;
  room.raid.contribution[player.session.playerId].damage = 1;
  room.raid.outcome = "defeat";
  store.raid._finish(room, room.raid);
}

test("build258 juvenile claim survives client DTO and server restart import without a second reward", () => {
  const firstStore = new RoomStore({ now: () => EPOCH + 1_000, randomRoomCode: () => "JUVN01", random: () => .1 });
  const firstPlayer = join(firstStore), firstRoom = createReadyRoom(firstStore, firstPlayer, "JUVN01");
  assert.equal(firstStore.startRaid(firstPlayer.session).ok, true);
  finishJuvenileAttempt(firstStore, firstRoom, firstPlayer);
  assert.equal(firstRoom.raidProgress.juvenileRewardClaimedBy[PLAYER_ID], true);
  assert.equal(firstPlayer.session.pendingRewards.filter(entry => entry.source?.kind === "raidJuvenile").length, 1);

  const persistedMessage = firstPlayer.conn.messages.findLast(message => message.type === "raidWorldState" && message.raidWorld?.campaignId === firstRoom.raidProgress.campaignId);
  assert.ok(persistedMessage);
  assert.equal(persistedMessage.raidWorld.juvenileRewardClaimedBy[PLAYER_ID], true);
  assert.equal(firstStore.roomSnapshot(firstRoom, PLAYER_ID).raidProgress.juvenileRewardClaimedBy[PLAYER_ID], true);

  const restartedStore = new RoomStore({ now: () => EPOCH + 2_000, randomRoomCode: () => "JUVN02", random: () => .1 });
  const restartedPlayer = join(restartedStore), restartedRoom = createReadyRoom(restartedStore, restartedPlayer, "JUVN02");
  assert.equal(restartedStore.startRaid(restartedPlayer.session, { raidWorld: persistedMessage.raidWorld }).ok, true);
  assert.equal(restartedRoom.raid.progress.juvenileRewardClaimedBy[PLAYER_ID], true);
  assert.equal(restartedStore.roomSnapshot(restartedRoom, PLAYER_ID).raid.progress.juvenileRewardClaimedBy[PLAYER_ID], true);

  finishJuvenileAttempt(restartedStore, restartedRoom, restartedPlayer);
  assert.equal(restartedPlayer.session.pendingRewards.some(entry => entry.source?.kind === "raidJuvenile"), false, "the same campaign cannot award the juvenile package after restart");
});

test("build258 raid progress import and reconnect DTO normalize juvenile claims to 32 strict receipts", () => {
  const store = new RoomStore({ now: () => EPOCH + 1_000, randomRoomCode: () => "JUVN03" });
  const weekly = store.raid.weeklyState();
  const source = {
    campaignId: `${weekly.weekId}-${weekly.boss.id}-claims`,
    weekId: weekly.weekId,
    bossId: weekly.boss.id,
    maxHp: weekly.boss.maxHp,
    hp: weekly.boss.maxHp - 1,
    totalDamage: 1,
    juvenileRewardClaimedBy: Object.fromEntries([
      ["", true],
      ["AD-FALS-AAAB", false],
      ["AD-STRG-AAAB", "true"],
      ...Array.from({ length: 40 }, (_, index) => [`AD-${String(index).padStart(4, "A").slice(-4)}-AAAB`, true]),
    ]),
  };
  const imported = store._importRaidProgress(source);
  assert.ok(imported);
  assert.equal(Object.keys(imported.juvenileRewardClaimedBy).length, 32);
  assert.equal(Object.values(imported.juvenileRewardClaimedBy).every(value => value === true), true);
  assert.equal("AD-FALS-AAAB" in imported.juvenileRewardClaimedBy, false);
  assert.equal("AD-STRG-AAAB" in imported.juvenileRewardClaimedBy, false);

  const player = join(store), room = createReadyRoom(store, player, "JUVN03");
  room.raidProgress = { ...imported, juvenileRewardClaimedBy: { ...imported.juvenileRewardClaimedBy, "AD-OVER-AAAB": true } };
  const claims = store.roomSnapshot(room, PLAYER_ID).raidProgress.juvenileRewardClaimedBy;
  assert.equal(Object.keys(claims).length, 32);
  assert.equal(Object.values(claims).every(value => value === true), true);
});
