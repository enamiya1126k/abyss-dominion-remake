import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

function connection() {
  return {
    messages: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close() {},
  };
}

function identity(index) {
  return {
    friendId: `AD-RC45-AAA${String.fromCharCode(66 + index)}`,
    clientKey: `build245-reconnect-client-${index}`.padEnd(32, "x"),
  };
}

function profile(index) {
  return {
    displayName: index === 0 ? "World owner" : `Guest ${index}`,
    monsterId: `build245-monster-${index}`,
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
  };
}

function hello(store, index, resumeToken = undefined) {
  const conn = connection();
  const result = store.hello(conn, {
    ...identity(index),
    resumeToken,
    profile: profile(index),
  });
  assert.equal(result.ok, true);
  return { conn, result, session: conn.session };
}

function startRoom({ players = 2, floor = 7, seed = 245_007, reconnectGraceMs = 5_000 } = {}) {
  let now = 245_000;
  const store = new RoomStore({
    now: () => now,
    reconnectGraceMs,
    random: () => .43,
    randomRoomCode: () => "RC245X",
  });
  const members = Array.from({ length: players }, (_, index) => hello(store, index));
  const created = store.createRoom(members[0].session);
  assert.equal(created.ok, true);
  const room = store.rooms.get(created.room.roomId);
  for (const member of members.slice(1)) assert.equal(store.joinRoom(member.session, room.roomId).ok, true);
  assert.equal(store.setFloor(members[0].session, floor).ok, true);
  for (const member of members) assert.equal(store.setReady(member.session, true).ok, true);
  const started = store.startExpedition(members[0].session, {
    hostWorld: {
      floorSeeds: { [floor]: seed, [floor + 1]: seed + 1 },
      openedChestIds: { [floor]: [], [floor + 1]: [] },
      defeatedBossFloors: [],
      claimedBossRewardFloors: [],
    },
  });
  assert.equal(started.ok, true);
  return {
    store,
    members,
    room,
    advanceTime(ms) { now += ms; },
  };
}

function mapState(room) {
  const expedition = room.expedition;
  return {
    id: expedition.id,
    floor: expedition.floor,
    offlineSeed: expedition.offlineSeed,
    cols: expedition.cols,
    rows: expedition.rows,
    tiles: structuredClone(expedition.tiles),
    start: { ...expedition.start },
    exit: { ...expedition.exit },
    objects: structuredClone(expedition.objects),
    decorations: structuredClone(expedition.decorations),
  };
}

function ordinaryObjects(expedition) {
  return structuredClone((expedition.objects ?? []).filter(object => (
    !object.onlineAdded
    && !object.coopOnly
    && !object.optional
    && !object.rare
    && !String(object.id ?? "").startsWith("coop-")
    && !String(object.id ?? "").startsWith("rare-")
  )));
}

test("build245 owner and guest reconnect to the same ordinary expedition with personal state intact", () => {
  const { store, members: [owner, guest], room } = startRoom();
  const expeditionBefore = mapState(room);
  owner.session.coopVitals = { hp: 411, maxHp: 500, mp: 31, maxMp: 40 };
  guest.session.coopVitals = { hp: 287, maxHp: 500, mp: 14, maxMp: 40 };
  guest.session.dungeonPosition = { ...room.expedition.start, facing: "left" };
  const guestPosition = { ...guest.session.dungeonPosition };
  const guestVitals = { ...guest.session.coopVitals };
  const reward = {
    rewardId: `${room.expedition.id}:build245-personal:${guest.session.playerId}`,
    reward: { gold: 245, crystals: 1 },
    source: { kind: "test", floor: room.expedition.floor, worldOwnerId: owner.session.playerId },
  };
  assert.equal(store._queueReward(guest.session, reward), true);
  const pendingRewardIds = guest.session.pendingRewards.map(entry => entry.rewardId);

  for (const member of [guest, owner]) {
    const oldToken = member.result.resumeToken;
    store.disconnect(member.session, member.conn);
    assert.equal(room.phase, "expedition");
    assert.deepEqual(mapState(room), expeditionBefore, "disconnect must not regenerate or replace the host's ordinary floor");

    const resumed = hello(store, member === owner ? 0 : 1, oldToken);
    assert.equal(resumed.result.resumed, true);
    assert.equal(resumed.result.room.expedition.id, expeditionBefore.id);
    assert.equal(resumed.result.room.expedition.floor, expeditionBefore.floor);
    assert.equal(resumed.result.room.expedition.offlineSeed, expeditionBefore.offlineSeed);
    assert.deepEqual(resumed.result.room.expedition.tiles, expeditionBefore.tiles);
    assert.deepEqual(resumed.result.room.expedition.objects, expeditionBefore.objects);
    assert.deepEqual(resumed.result.room.expedition.decorations, expeditionBefore.decorations);
    member.conn = resumed.conn;
    member.result = resumed.result;
    member.session = resumed.session;
  }

  assert.deepEqual(guest.session.dungeonPosition, guestPosition);
  assert.deepEqual(guest.session.coopVitals, guestVitals);
  assert.deepEqual(guest.session.pendingRewards.map(entry => entry.rewardId), pendingRewardIds);
  guest.conn.messages.length = 0;
  assert.equal(store.deliverPendingRewards(guest.session), true);
  assert.equal(guest.conn.messages.filter(message => message.type === "onlineReward" && message.rewardId === reward.rewardId).length, 1);
  assert.equal(store.ackReward(guest.session, reward.rewardId).ok, true);
  assert.equal(store.ackReward(guest.session, reward.rewardId).ok, true, "a retried acknowledgement is idempotent");
  assert.equal(store.deliverPendingRewards(guest.session), true);
  assert.equal(guest.conn.messages.filter(message => message.type === "onlineReward" && message.rewardId === reward.rewardId).length, 1, "an acknowledged reward is never delivered again");
  assert.equal(guest.session.pendingRewards.some(entry => entry.rewardId === reward.rewardId), false);
});

test("build245 a guest can leave mid-floor while the owner continues and only the owner advances", () => {
  const floor = 7;
  const { store, members: [owner, guest], room } = startRoom({ floor });
  const expeditionId = room.expedition.id;
  const ownerMap = {
    floor: room.expedition.floor,
    seed: room.expedition.offlineSeed,
    tiles: structuredClone(room.expedition.tiles),
    ordinary: ordinaryObjects(room.expedition),
  };
  guest.session.coopVitals = { hp: 263, maxHp: 500, mp: 9, maxMp: 40 };
  assert.equal(store._queueReward(guest.session, {
    rewardId: `${expeditionId}:before-leave:${guest.session.playerId}`,
    reward: { gold: 100 },
    source: { kind: "test", floor },
  }), true);

  assert.equal(store.leaveRoom(guest.session).ok, true);
  assert.equal(room.phase, "expedition");
  assert.equal(room.expedition.id, expeditionId);
  assert.equal(room.expedition.floor, ownerMap.floor);
  assert.equal(room.expedition.offlineSeed, ownerMap.seed);
  assert.deepEqual(room.expedition.tiles, ownerMap.tiles);
  assert.deepEqual(ordinaryObjects(room.expedition), ownerMap.ordinary, "formal leave may remove only the optional co-op overlay");
  assert.equal(room.expedition.coop.enabled, false);
  assert.equal(room.expedition.coop.partySize, 1);
  assert.equal(guest.session.roomId, null);
  assert.equal(guest.session.dungeonPosition, null);
  assert.equal(guest.session.coopVitals, null);
  const leaveVitals = guest.session.pendingMessages.findLast(message => message.type === "expeditionVitals");
  assert.equal(leaveVitals.reason, "leave");
  assert.equal(leaveVitals.hp, 263);
  assert.equal(leaveVitals.mp, 9);
  assert.equal(guest.session.pendingRewards.filter(entry => entry.rewardId.includes(":before-leave:")).length, 1);

  room.expedition.encountersEnabled = false;
  owner.session.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  store._resolveLanding(room, owner.session);
  store._updateStairGathering(room);
  const advanced = store.completeExpedition(owner.session);
  assert.equal(advanced.ok, true);
  assert.equal(advanced.advanced, true);
  assert.equal(room.expedition.floor, floor + 1);
  const ownerClear = owner.session.pendingRewards.find(entry => entry.source?.kind === "floorClear" && entry.source.floor === floor);
  assert.equal(ownerClear?.reward.leaderFloorUnlock, floor + 1);
  assert.equal(guest.session.pendingRewards.some(entry => entry.source?.kind === "floorClear" && entry.source.floor === floor), false);
  assert.equal(guest.session.profile.maxFloor, 1);

  assert.equal(store.requestReturn(owner.session).ended, true);
  const guestResult = guest.session.pendingMessages.findLast(message => message.type === "expeditionResult");
  assert.equal(guestResult.recipientId, guest.session.playerId);
  assert.equal(guestResult.ownerId, owner.session.playerId);
  assert.equal(guestResult.finalVitals.mutationId, leaveVitals.mutationId);
  assert.equal(guestResult.finalVitals.hp, 263);
  assert.equal(guestResult.finalVitals.mp, 9);
  assert.equal(guestResult.progressionEligible, false);
  assert.equal(guestResult.summary.progressionEligible, false);
  assert.equal(Object.hasOwn(guestResult.summary, "ownerFloorUnlock"), false);
  assert.equal(Object.hasOwn(guestResult.summary, "nextFloor"), false);
  assert.deepEqual(guestResult.assistedWorld, { ownerId: owner.session.playerId, startFloor: floor, endFloor: floor + 1, floorsCleared: 1 });
  assert.equal(guest.session.profile.maxFloor, 1, "a former guest's normal floor is never changed by the host result");
});

test("build245 owner leave safely ends the run once and cannot advance the remaining guest", () => {
  const { store, members: [owner, guest], room } = startRoom();
  owner.session.coopVitals = { hp: 401, maxHp: 500, mp: 27, maxMp: 40 };
  guest.session.coopVitals = { hp: 199, maxHp: 500, mp: 8, maxMp: 40 };

  assert.equal(store.leaveRoom(owner.session).ok, true);
  assert.equal(room.phase, "lobby");
  assert.equal(room.expedition, null);
  assert.equal(room.coopRun, null);
  assert.equal(room.members.has(owner.session.playerId), false);
  assert.equal(room.members.has(guest.session.playerId), true);
  assert.equal(room.leaderId, guest.session.playerId);
  assert.equal(owner.session.roomId, null);
  assert.equal(guest.session.profile.maxFloor, 1);

  const ownerResults = owner.session.pendingMessages.filter(message => message.type === "expeditionResult");
  const guestResults = guest.session.pendingMessages.filter(message => message.type === "expeditionResult");
  assert.equal(ownerResults.length, 1);
  assert.equal(guestResults.length, 1);
  assert.equal(ownerResults[0].reason, "worldOwnerLeft");
  assert.equal(guestResults[0].reason, "worldOwnerLeft");
  assert.equal(guestResults[0].ownerId, owner.session.playerId);
  assert.equal(guestResults[0].recipientId, guest.session.playerId);
  assert.equal(guestResults[0].completed, false);
  assert.equal(guestResults[0].finalVitals.hp, 199);
  assert.equal(guestResults[0].finalVitals.mp, 8);
  assert.equal(guest.session.pendingRewards.some(entry => Number(entry.reward?.leaderFloorUnlock) > 0), false);

  assert.equal(store.leaveRoom(owner.session).ok, true);
  assert.equal(owner.session.pendingMessages.filter(message => message.type === "expeditionResult").length, 1, "a retried leave must not create a second terminal result");
  const resultId = guestResults[0].resultId;
  assert.equal(store.ackExpeditionResult(guest.session, resultId).ok, true);
  assert.equal(store.ackExpeditionResult(guest.session, resultId).ok, true);
  assert.equal(guest.session.pendingMessages.some(message => message.type === "expeditionResult" && message.resultId === resultId), false);
  assert.equal(guest.session.pendingMessages.some(message => message.type === "expeditionVitals" && message.mutationId === guestResults[0].finalVitals.mutationId), false);
});

test("build245 owner reconnect timeout ends safely and preserves one recoverable terminal result", () => {
  const { store, members: [owner, guest], room, advanceTime } = startRoom({ reconnectGraceMs: 1_000 });
  const resumeToken = owner.result.resumeToken;
  owner.session.coopVitals = { hp: 377, maxHp: 500, mp: 23, maxMp: 40 };
  guest.session.coopVitals = { hp: 188, maxHp: 500, mp: 7, maxMp: 40 };

  store.disconnect(owner.session, owner.conn);
  advanceTime(1_001);
  store.pruneExpired();

  assert.equal(room.phase, "lobby");
  assert.equal(room.expedition, null);
  assert.equal(room.members.has(owner.session.playerId), false);
  assert.equal(store.sessions.has(owner.session.playerId), false);
  const outbox = store.recoveryOutboxes.get(owner.session.playerId);
  assert.ok(outbox);
  assert.equal(outbox.pendingMessages.filter(message => message.type === "expeditionResult").length, 1);
  assert.equal(guest.session.pendingMessages.filter(message => message.type === "expeditionResult").length, 1);
  assert.equal(guest.session.profile.maxFloor, 1);

  const recovered = hello(store, 0, resumeToken);
  assert.equal(recovered.result.resumed, false);
  assert.equal(recovered.result.recovered, true);
  assert.equal(recovered.result.room, null);
  const result = recovered.session.pendingMessages.find(message => message.type === "expeditionResult");
  assert.ok(result);
  assert.equal(result.reason, "worldOwnerTimeout");
  assert.equal(result.ownerId, recovered.session.playerId);
  assert.equal(result.finalVitals.hp, 377);
  assert.equal(result.finalVitals.mp, 23);
  assert.equal(recovered.session.pendingMessages.filter(message => message.type === "expeditionResult").length, 1);

  recovered.conn.messages.length = 0;
  assert.equal(store.deliverPendingRewards(recovered.session), true);
  assert.equal(recovered.conn.messages.filter(message => message.type === "expeditionResult" && message.resultId === result.resultId).length, 1);
  assert.equal(store.ackExpeditionResult(recovered.session, result.resultId).ok, true);
  assert.equal(store.deliverPendingRewards(recovered.session), true);
  assert.equal(recovered.conn.messages.filter(message => message.type === "expeditionResult" && message.resultId === result.resultId).length, 1);
});

test("build245 cached dedicated-realm actions are inert and never replace the ordinary map", () => {
  const { store, members: [owner], room } = startRoom({ players: 2 });
  const before = mapState(room);
  const positions = Object.fromEntries([...room.members].map(id => [id, { ...store.sessions.get(id).dungeonPosition }]));
  const rewards = Object.fromEntries([...room.members].map(id => [id, store.sessions.get(id).pendingRewards.length]));

  for (const action of ["enterRarePortal", "leaveRareRealm", "leaveRarePortal", "challengeRareGuardian", "openRarePortalChest"]) {
    const response = store.expeditionInteract(owner.session, { action, targetId: "cached-legacy-target" });
    assert.equal(response.ok, false);
    assert.equal(response.code, "FEATURE_INTEGRATED");
    assert.match(response.message, /共同探索へ統合/);
    assert.deepEqual(mapState(room), before, `${action} must not replace, regenerate or mutate the host map`);
    assert.deepEqual(
      Object.fromEntries([...room.members].map(id => [id, { ...store.sessions.get(id).dungeonPosition }])),
      positions,
    );
    assert.deepEqual(
      Object.fromEntries([...room.members].map(id => [id, store.sessions.get(id).pendingRewards.length])),
      rewards,
    );
  }
});
