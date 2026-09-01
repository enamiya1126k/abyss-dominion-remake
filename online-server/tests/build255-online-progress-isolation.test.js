import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

const PROGRESSION_TYPES = new Set(["hostWorldDelta", "battleDefeated", "floorBossDefeated"]);

function connection() {
  return {
    messages: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close() {},
  };
}

function identity(index) {
  return {
    friendId: `AD-Z255-AAA${String.fromCharCode(66 + index)}`,
    clientKey: `build255-progress-isolation-${index}`.padEnd(32, "x"),
  };
}

function profile(index, overrides = {}) {
  return {
    displayName: index === 0 ? "World owner" : `Guest ${index}`,
    monsterId: `build255-monster-${index}`,
    speciesId: "slime",
    maxFloor: index === 0 ? 50 : 1,
    currentHp: 500,
    currentMp: 40,
    explorePickupDone: true,
    battleStats: {
      hp: 500,
      mp: 40,
      atk: 260,
      matk: 230,
      def: 180,
      mdef: 170,
      spd: 90,
      crit: 5,
      evasion: 3,
      accuracy: 100,
    },
    ...overrides,
  };
}

function hello(store, index, { resumeToken, backgroundOnly = false, overrides = {} } = {}) {
  const conn = connection();
  const result = store.hello(conn, {
    ...identity(index),
    resumeToken,
    backgroundOnly,
    profile: profile(index, overrides),
  });
  assert.equal(result.ok, true, result.message);
  return { index, conn, result, session: conn.session };
}

function createStartedRoom({
  floor = 7,
  currentSeed = true,
  nextSeed = true,
  reconnectGraceMs = 1_000,
} = {}) {
  let now = 255_000;
  const store = new RoomStore({
    now: () => now,
    random: () => .41,
    reconnectGraceMs,
    randomRoomCode: () => "ISO255",
  });
  const owner = hello(store, 0), guest = hello(store, 1);
  const created = store.createRoom(owner.session), room = store.rooms.get(created.room.roomId);
  assert.equal(store.joinRoom(guest.session, room.roomId).ok, true);
  assert.equal(store.setFloor(owner.session, floor).ok, true);
  assert.equal(store.setReady(owner.session, true).ok, true);
  assert.equal(store.setReady(guest.session, true).ok, true);
  const floorSeeds = {};
  if (currentSeed) floorSeeds[floor] = 255_000 + floor;
  if (nextSeed) floorSeeds[floor + 1] = 255_001 + floor;
  const started = store.startExpedition(owner.session, {
    hostWorld: {
      floorSeeds,
      openedChestIds: {},
      defeatedBossFloors: [],
      claimedBossRewardFloors: [],
    },
  });
  assert.equal(started.ok, true, started.message);
  return {
    store,
    room,
    owner,
    guest,
    advanceTime(ms) { now += ms; },
  };
}

function clearLive(...players) {
  for (const player of players) player.conn.messages.length = 0;
}

function injectChest(room, player, id = "build255-chest") {
  const position = { ...player.session.dungeonPosition };
  room.expedition.objects = room.expedition.objects.filter(object => object.x !== position.x || object.y !== position.y);
  room.expedition.decorations = (room.expedition.decorations ?? []).filter(object => object.x !== position.x || object.y !== position.y);
  const chest = {
    id,
    hostChestKey: id,
    type: "chest",
    ...position,
    kind: "box",
    locked: false,
    mimic: false,
    resolved: false,
  };
  room.expedition.objects.push(chest);
  return chest;
}

function advanceFloor({ store, room, owner, guest }) {
  room.expedition.encountersEnabled = false;
  for (const player of [owner, guest].filter(Boolean)) player.session.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  store._resolveLanding(room, owner.session);
  store._updateStairGathering(room);
  const advanced = store.completeExpedition(owner.session);
  assert.equal(advanced.ok, true, advanced.message);
  assert.equal(advanced.advanced, true);
  return advanced;
}

function assertNoProgressionReceipt(player) {
  assert.deepEqual(player.conn.messages.filter(message => PROGRESSION_TYPES.has(message.type)), []);
  assert.deepEqual(player.session.pendingMessages.filter(message => PROGRESSION_TYPES.has(message.type)), []);
}

test("build255 host world mutations and acknowledgements are owner-only", () => {
  const { store, room, owner, guest } = createStartedRoom({ currentSeed: false, nextSeed: false });
  const initial = owner.conn.messages.find(message => message.type === "hostWorldDelta" && message.delta?.floorSeed?.floor === 7);
  assert.ok(initial, "the newly generated floor seed is delivered to its owner");
  assertNoProgressionReceipt(guest);

  const rejected = store.ackHostWorldDelta(guest.session, initial.mutationId);
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, "WORLD_OWNER_ONLY");
  assert.ok(owner.session.pendingMessages.some(message => message.mutationId === initial.mutationId));
  assert.equal(store.ackHostWorldDelta(owner.session, initial.mutationId).ok, true);
  assert.equal(store.ackHostWorldDelta(owner.session, initial.mutationId).ok, true, "owner acknowledgement is idempotent");

  clearLive(owner, guest);
  const chest = injectChest(room, owner);
  store._resolveLanding(room, owner.session);
  assert.equal(chest.resolved, true);
  const chestDelta = owner.conn.messages.find(message => message.type === "hostWorldDelta" && message.delta?.openedChest?.chestId === chest.id);
  assert.ok(chestDelta);
  assert.ok(owner.session.pendingMessages.some(message => message.mutationId === chestDelta.mutationId));
  assertNoProgressionReceipt(guest);

  clearLive(owner, guest);
  advanceFloor({ store, room, owner, guest });
  assert.ok(owner.conn.messages.some(message => message.type === "hostWorldDelta" && message.delta?.floorSeed?.floor === 8));
  assertNoProgressionReceipt(guest);
});

test("build255 a background guest receives rewards but never owner progression receipts", () => {
  const { store, room, owner, guest } = createStartedRoom();
  const resumeToken = guest.result.resumeToken;
  store.disconnect(guest.session, guest.conn);
  const resumed = hello(store, 1, { resumeToken, backgroundOnly: true });
  guest.conn = resumed.conn;
  guest.session = resumed.session;
  guest.result = resumed.result;
  clearLive(owner, guest);

  const chest = injectChest(room, owner, "build255-background-chest");
  store._resolveLanding(room, owner.session);
  assert.equal(chest.resolved, true);
  assert.ok(owner.conn.messages.some(message => message.type === "hostWorldDelta"));
  assert.ok(guest.conn.messages.some(message => message.type === "onlineReward"), "personal rewards remain background-safe");
  assertNoProgressionReceipt(guest);
});

test("build255 floor-boss receipts are physically owner-only while guest rewards and visuals remain", () => {
  const { store, room, owner, guest } = createStartedRoom({ floor: 10 });
  clearLive(owner, guest);
  const boss = room.expedition.objects.find(object => object.type === "floorBoss");
  assert.ok(boss);
  store._startBattle(room, boss);
  const battle = room.expedition.battle;
  for (const enemy of battle.enemies) enemy.hp = 0;
  const settled = store._finishBattleVictory(room, battle);
  assert.notEqual(settled?.ok, false, settled?.message);

  assert.ok(owner.session.pendingMessages.some(message => message.type === "battleDefeated" && message.floorBoss === true));
  assert.ok(owner.session.pendingMessages.some(message => message.type === "hostWorldDelta" && message.delta?.defeatedBoss?.floor === 10));
  assert.ok(owner.conn.messages.some(message => message.type === "floorBossDefeated"));
  assertNoProgressionReceipt(guest);
  assert.ok(guest.session.pendingRewards.some(entry => entry.source?.kind === "battle"));
  assert.ok(guest.session.pendingMessages.some(message => message.type === "expeditionVitals" && message.reason === "battleVictory"));
  assert.ok(guest.conn.messages.some(message => message.type === "battleEnded"));
  assert.ok(guest.conn.messages.some(message => message.type === "expeditionEvent" && message.event?.kind === "floorBossDefeated"));
});

test("build255 floor assist and terminal results cannot advance guest progression", () => {
  const floor = 7;
  const { store, room, owner, guest } = createStartedRoom({ floor, nextSeed: false });
  clearLive(owner, guest);
  advanceFloor({ store, room, owner, guest });

  const ownerClear = owner.session.pendingRewards.find(entry => entry.source?.kind === "floorClear" && entry.source.floor === floor);
  const guestAssist = guest.session.pendingRewards.find(entry => entry.source?.kind === "floorAssist" && entry.source.floor === floor);
  assert.equal(ownerClear?.reward?.leaderFloorUnlock, floor + 1);
  assert.ok(guestAssist);
  assert.equal(Object.hasOwn(guestAssist.reward, "leaderFloorUnlock"), false);
  assert.equal(Object.hasOwn(guestAssist.source, "leaderFloorUnlock"), false);
  assert.equal(guest.session.profile.maxFloor, 1);
  assertNoProgressionReceipt(guest);

  assert.equal(store.requestReturn(owner.session).ended, true);
  const ownerResult = owner.session.pendingMessages.findLast(message => message.type === "expeditionResult");
  const guestResult = guest.session.pendingMessages.findLast(message => message.type === "expeditionResult");
  assert.equal(ownerResult.progressionEligible, true);
  assert.equal(ownerResult.summary.progressionEligible, true);
  assert.equal(ownerResult.summary.ownerFloorUnlock, floor + 1);
  assert.equal(guestResult.progressionEligible, false);
  assert.equal(guestResult.summary.progressionEligible, false);
  assert.equal(Object.hasOwn(guestResult.summary, "ownerFloorUnlock"), false);
  assert.equal(Object.hasOwn(guestResult.summary, "nextFloor"), false);
  assert.deepEqual(guestResult.assistedWorld, { ownerId: owner.session.playerId, startFloor: floor, endFloor: floor + 1, floorsCleared: 1 });
  assert.equal(guestResult.finalVitals.playerId, guest.session.playerId);
  assert.ok(guestResult.summary.ranking.some(entry => entry.playerId === guest.session.playerId));
  assert.equal(guest.session.profile.maxFloor, 1);
  assert.equal(owner.conn.messages.findLast(message => message.type === "expeditionEnded")?.progressionEligible, true);
  assert.equal(guest.conn.messages.findLast(message => message.type === "expeditionEnded")?.progressionEligible, false);
  assert.equal(owner.session.expeditionEntryProfile, null);
  assert.equal(guest.session.expeditionEntryProfile, null);
});

test("build255 disconnected guest recovery replays only personal settlements", () => {
  const { store, room, owner, guest, advanceTime } = createStartedRoom({ reconnectGraceMs: 1_000 });
  const resumeToken = guest.result.resumeToken;
  clearLive(owner, guest);
  store.disconnect(guest.session, guest.conn);

  injectChest(room, owner, "build255-recovery-chest");
  store._resolveLanding(room, owner.session);
  assert.equal(store.requestReturn(owner.session).ended, true);
  advanceTime(1_001);
  store.pruneExpired();

  const outbox = store.recoveryOutboxes.get(guest.session.playerId);
  assert.ok(outbox);
  assert.equal(outbox.pendingMessages.some(message => PROGRESSION_TYPES.has(message.type)), false);
  assert.ok(outbox.pendingMessages.some(message => message.type === "expeditionResult" && message.progressionEligible === false));
  assert.ok(outbox.pendingRewards.some(entry => entry.source?.kind === "chest"));

  const recovered = hello(store, 1, { resumeToken });
  recovered.conn.messages.length = 0;
  assert.equal(store.deliverPendingRewards(recovered.session), true);
  assert.equal(recovered.conn.messages.some(message => PROGRESSION_TYPES.has(message.type)), false);
  assert.ok(recovered.conn.messages.some(message => message.type === "onlineReward" && message.source?.kind === "chest"));
  const result = recovered.conn.messages.find(message => message.type === "expeditionResult");
  assert.equal(result?.progressionEligible, false);
  assert.equal(Object.hasOwn(result?.summary ?? {}, "ownerFloorUnlock"), false);
  assert.equal(recovered.session.profile.maxFloor, 1);
});

test("build255 a formal mid-run guest leave keeps only personal vitals and a safe result", () => {
  const floor = 7;
  const { store, room, owner, guest } = createStartedRoom({ floor });
  clearLive(owner, guest);
  const beforeRewards = guest.session.pendingRewards.length;
  assert.equal(store.leaveRoom(guest.session).ok, true);
  assert.equal(room.phase, "expedition");
  assert.equal(guest.session.roomId, null);
  assert.equal(guest.session.expeditionEntryProfile, null);
  const leaveVitals = guest.session.pendingMessages.findLast(message => message.type === "expeditionVitals");
  assert.equal(leaveVitals.reason, "leave");

  advanceFloor({ store, room, owner, guest: null });
  assert.equal(guest.session.pendingRewards.length, beforeRewards, "a departed guest receives no later floor assistance settlement");
  assert.equal(guest.session.pendingRewards.some(entry => ["floorClear", "floorAssist"].includes(entry.source?.kind)), false);
  assert.equal(store.requestReturn(owner.session).ended, true);

  const result = guest.session.pendingMessages.findLast(message => message.type === "expeditionResult");
  assert.equal(result.progressionEligible, false);
  assert.equal(result.finalVitals.mutationId, leaveVitals.mutationId);
  assert.equal(Object.hasOwn(result.summary, "ownerFloorUnlock"), false);
  assert.equal(Object.hasOwn(result.summary, "nextFloor"), false);
  assert.equal(guest.session.profile.maxFloor, 1);
  assertNoProgressionReceipt(guest);
});

test("build255 active-run profile sync and reconnect cannot replace entry progression or combat stats", () => {
  const { store, room, owner, guest } = createStartedRoom({ floor: 7 });
  const entry = JSON.parse(JSON.stringify(guest.session.expeditionEntryProfile));
  assert.equal(entry.maxFloor, 1);
  assert.equal(entry.battleStats.atk, 260);

  const syncedProfile = JSON.parse(JSON.stringify(guest.session.profile));
  syncedProfile.maxFloor = 9_999;
  syncedProfile.battleStats = { ...syncedProfile.battleStats, hp: 900_000, mp: 80_000, atk: 999_999_999 };
  syncedProfile.currentHp = 321;
  syncedProfile.currentMp = 17;
  syncedProfile.equipment = [{ slot: "weapon", label: "武", name: "同期済み装備", rarity: "SR", level: 7, plus: 1 }];
  syncedProfile.battleRoster = syncedProfile.battleRoster.map((monster, index) => ({
    ...monster,
    battleStats: { ...monster.battleStats, hp: 900_000 + index, mp: 80_000 + index, atk: 999_999_999 },
    currentHp: index === 0 ? 321 : monster.currentHp,
    currentMp: index === 0 ? 17 : monster.currentMp,
    equipment: index === 0 ? syncedProfile.equipment : monster.equipment,
  }));
  const synced = store.expeditionProfileSync(guest.session, syncedProfile);
  assert.equal(synced.ok, true, synced.message);
  assert.equal(guest.session.profile.maxFloor, 1);
  assert.equal(guest.session.profile.battleStats.hp, 500);
  assert.equal(guest.session.profile.battleStats.atk, 260);
  assert.equal(guest.session.profile.battleRoster[0].battleStats.atk, 260);
  assert.equal(guest.session.profile.equipment[0].name, "同期済み装備", "non-stat equipment metadata may still sync");
  assert.deepEqual(guest.session.coopVitals, { hp: 321, maxHp: 500, mp: 17, maxMp: 40 });

  const resumeToken = guest.result.resumeToken;
  store.disconnect(guest.session, guest.conn);
  const reconnectProfile = JSON.parse(JSON.stringify(guest.session.profile));
  reconnectProfile.maxFloor = 10_000;
  reconnectProfile.battleStats = { ...reconnectProfile.battleStats, hp: 1_000_000, atk: 1_000_000_000 };
  reconnectProfile.battleRoster = reconnectProfile.battleRoster.map(monster => ({
    ...monster,
    battleStats: { ...monster.battleStats, hp: 1_000_000, atk: 1_000_000_000 },
  }));
  const reconnectConnection = connection();
  const resumed = store.hello(reconnectConnection, {
    ...identity(1),
    resumeToken,
    profile: reconnectProfile,
  });
  assert.equal(resumed.ok, true, resumed.message);
  guest.conn = reconnectConnection;
  guest.session = reconnectConnection.session;
  assert.equal(resumed.resumed, true);
  assert.equal(room.phase, "expedition");
  assert.equal(room.expedition.floor, 7);
  assert.equal(guest.session.profile.maxFloor, 1);
  assert.equal(guest.session.profile.battleStats.hp, 500);
  assert.equal(guest.session.profile.battleStats.atk, 260);
  assert.equal(guest.session.profile.battleRoster[0].battleStats.atk, 260);

  store._startBattle(room, {
    id: "build255-profile-encounter-1",
    type: "encounter",
    x: guest.session.dungeonPosition.x,
    y: guest.session.dungeonPosition.y,
    resolved: true,
  });
  const guestActor = Object.values(room.expedition.battle.players).find(actor => actor.ownerPlayerId === guest.session.playerId);
  assert.ok(guestActor);
  assert.equal(guestActor.maxHp, 500);
  assert.equal(guestActor.stats.atk, 260);
});

test("build255 legacy contaminated guest queues are repaired before delivery", () => {
  const { store, owner, guest } = createStartedRoom();
  const resultId = "legacy-run:expedition-result:owner";
  guest.session.pendingRewards.push({
    rewardId: "legacy-floor-clear",
    reward: { gold: 10, leaderFloorUnlock: 201 },
    source: { kind: "floorClear", floor: 200, leaderFloorUnlock: 201, worldOwnerId: owner.session.playerId },
  }, {
    rewardId: "legacy-floor-clear-without-owner",
    reward: { gold: 10, leaderFloorUnlock: 301 },
    source: { kind: "floorClear", floor: 300, leaderFloorUnlock: 301 },
  }, {
    rewardId: "legacy-floor-assist-with-unlocks",
    reward: { gold: 10, leaderFloorUnlock: 401, ownerFloorUnlock: 401, nextFloor: 402, maxFloor: 401 },
    source: { kind: "floorAssist", floor: 400, leaderFloorUnlock: 401, ownerFloorUnlock: 401, nextFloor: 402, maxFloor: 401, worldOwnerId: owner.session.playerId },
  });
  guest.session.pendingMessages.push(
    { type: "hostWorldDelta", mutationId: "legacy-host-world", ownerId: owner.session.playerId, hostWorld: { revision: 9 } },
    { type: "battleDefeated", eventId: "legacy-battle", worldOwnerId: owner.session.playerId, progressionEligible: false, floor: 200 },
    { type: "floorBossDefeated", ownerId: owner.session.playerId, progressionEligible: false, floor: 200 },
    {
      type: "expeditionResult",
      resultId,
      recipientId: guest.session.playerId,
      ownerId: owner.session.playerId,
      startFloor: 200,
      endFloor: 201,
      floorsCleared: 1,
      ownerFloorUnlock: 999,
      nextFloor: 1_000,
      assistedWorld: { ownerId: owner.session.playerId, startFloor: 200, endFloor: 201, floorsCleared: 1, ownerFloorUnlock: 999, nextFloor: 1_000 },
      summary: { ownerId: owner.session.playerId, ownerFloorUnlock: 201, nextFloor: 202, floor: 201, startFloor: 200, endFloor: 201, floorsCleared: 1, assistedWorld: { startFloor: 9_000, nextFloor: 9_999 } },
    },
  );
  clearLive(guest);
  assert.equal(store.deliverPendingRewards(guest.session), true);

  assertNoProgressionReceipt(guest);
  const repairedReward = guest.session.pendingRewards.find(entry => entry.rewardId === "legacy-floor-clear");
  assert.equal(repairedReward.source.kind, "floorAssist");
  assert.equal(Object.hasOwn(repairedReward.reward, "leaderFloorUnlock"), false);
  assert.equal(Object.hasOwn(repairedReward.source, "leaderFloorUnlock"), false);
  const failClosedReward = guest.session.pendingRewards.find(entry => entry.rewardId === "legacy-floor-clear-without-owner");
  assert.equal(failClosedReward.source.kind, "floorAssist");
  assert.equal(Object.hasOwn(failClosedReward.reward, "leaderFloorUnlock"), false);
  const repairedAssist = guest.session.pendingRewards.find(entry => entry.rewardId === "legacy-floor-assist-with-unlocks");
  assert.equal(repairedAssist.source.kind, "floorAssist");
  for (const field of ["leaderFloorUnlock", "ownerFloorUnlock", "nextFloor", "maxFloor"]) {
    assert.equal(Object.hasOwn(repairedAssist.reward, field), false, `reward.${field} must be stripped`);
    assert.equal(Object.hasOwn(repairedAssist.source, field), false, `source.${field} must be stripped`);
  }
  const repairedResult = guest.session.pendingMessages.find(message => message.resultId === resultId);
  assert.equal(repairedResult.progressionEligible, false);
  assert.equal(Object.hasOwn(repairedResult, "ownerFloorUnlock"), false);
  assert.equal(Object.hasOwn(repairedResult, "nextFloor"), false);
  assert.equal(Object.hasOwn(repairedResult.summary, "ownerFloorUnlock"), false);
  assert.equal(Object.hasOwn(repairedResult.summary, "nextFloor"), false);
  assert.deepEqual(repairedResult.assistedWorld, { ownerId: owner.session.playerId, startFloor: 200, endFloor: 201, floorsCleared: 1 });
  assert.deepEqual(repairedResult.summary.assistedWorld, repairedResult.assistedWorld);
});

test("build255 ownership transfer clamps the inherited lobby floor to the new owner", () => {
  const store = new RoomStore({ randomRoomCode: () => "OWN255" });
  const owner = hello(store, 0), guest = hello(store, 1);
  const created = store.createRoom(owner.session), room = store.rooms.get(created.room.roomId);
  assert.equal(store.joinRoom(guest.session, room.roomId).ok, true);
  assert.equal(store.setFloor(owner.session, 50).ok, true);
  assert.equal(room.selectedFloor, 50);
  assert.equal(store.leaveRoom(owner.session).ok, true);
  assert.equal(room.ownerId, guest.session.playerId);
  assert.equal(room.leaderId, guest.session.playerId);
  assert.equal(room.selectedFloor, 1);
  assert.equal(store.setReady(guest.session, true).ok, true);
  const started = store.startExpedition(guest.session, { hostWorld: { floorSeeds: { 50: 255_050 } } });
  assert.equal(started.ok, true, started.message);
  assert.equal(room.expedition.floor, 1);
  assert.equal(room.expedition.hostOwnerId, guest.session.playerId);
});

test("build255 legacy owner results require explicit progression eligibility", () => {
  const { store, owner } = createStartedRoom();
  owner.session.pendingMessages.push({
    type: "expeditionResult",
    resultId: "legacy-owner-implicit-result",
    recipientId: owner.session.playerId,
    ownerId: owner.session.playerId,
    startFloor: 7,
    endFloor: 8,
    floorsCleared: 1,
    summary: { ownerId: owner.session.playerId, ownerFloorUnlock: 8, nextFloor: 9, startFloor: 7, endFloor: 8, floorsCleared: 1 },
  }, {
    type: "expeditionResult",
    resultId: "legacy-owner-explicit-result",
    recipientId: owner.session.playerId,
    ownerId: owner.session.playerId,
    progressionEligible: true,
    startFloor: 7,
    endFloor: 8,
    floorsCleared: 1,
    summary: { ownerId: owner.session.playerId, ownerFloorUnlock: 8, nextFloor: 9, startFloor: 7, endFloor: 8, floorsCleared: 1 },
  }, {
    type: "floorBossDefeated",
    receiptId: "legacy-owner-floor-boss-explicit",
    ownerId: owner.session.playerId,
    progressionEligible: true,
    floor: 10,
  }, {
    type: "floorBossDefeated",
    receiptId: "legacy-owner-floor-boss-implicit",
    ownerId: owner.session.playerId,
    floor: 20,
  });
  assert.equal(store.deliverPendingRewards(owner.session), true);

  const implicit = owner.session.pendingMessages.find(message => message.resultId === "legacy-owner-implicit-result");
  assert.equal(implicit.progressionEligible, false);
  assert.equal(Object.hasOwn(implicit.summary, "ownerFloorUnlock"), false);
  assert.equal(Object.hasOwn(implicit.summary, "nextFloor"), false);
  assert.deepEqual(implicit.assistedWorld, { ownerId: owner.session.playerId, startFloor: 7, endFloor: 8, floorsCleared: 1 });

  const explicit = owner.session.pendingMessages.find(message => message.resultId === "legacy-owner-explicit-result");
  assert.equal(explicit.progressionEligible, true);
  assert.equal(explicit.summary.progressionEligible, true);
  assert.equal(explicit.summary.ownerFloorUnlock, 8);
  assert.equal(explicit.summary.nextFloor, 9);
  assert.ok(owner.session.pendingMessages.some(message => message.receiptId === "legacy-owner-floor-boss-explicit"));
  assert.equal(owner.session.pendingMessages.some(message => message.receiptId === "legacy-owner-floor-boss-implicit"), false);
});

test("build255 never substitutes the leader when explicit world ownership is missing", () => {
  const store = new RoomStore({ randomRoomCode: () => "MISS55" });
  const leader = hello(store, 0), guest = hello(store, 1);
  const created = store.createRoom(leader.session), room = store.rooms.get(created.room.roomId);
  assert.equal(store.joinRoom(guest.session, room.roomId).ok, true);
  assert.equal(store.setReady(leader.session, true).ok, true);
  assert.equal(store.setReady(guest.session, true).ok, true);

  room.ownerId = null;
  assert.equal(store.roomSnapshot(room, leader.session.playerId).ownerId, null);
  const started = store.startExpedition(leader.session, { hostWorld: { floorSeeds: {} } });
  assert.equal(started.ok, false);
  assert.equal(started.code, "WORLD_OWNER_REQUIRED");
  assert.equal(room.phase, "lobby");
  assert.equal(room.expedition, null);
  assertNoProgressionReceipt(leader);
  assertNoProgressionReceipt(guest);
});
