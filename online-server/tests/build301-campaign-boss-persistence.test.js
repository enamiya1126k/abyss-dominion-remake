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

const identity = {
  friendId: "AD-B3ZZ-TESX",
  clientKey: "build301-campaign-persistence-client-key",
};

function profile() {
  return {
    displayName: "Campaign owner",
    monsterId: "build301-owner",
    speciesId: "slime",
    maxFloor: 100,
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

function hello(store, resumeToken = undefined) {
  const conn = connection();
  const result = store.hello(conn, { ...identity, resumeToken, profile: profile() });
  assert.equal(result.ok, true, result.message);
  return { conn, result, session: conn.session };
}

function started({ floor = 6, defeated = [], claimed = [], campaignReplay = false, hostWorld = null } = {}) {
  const store = new RoomStore({
    random: () => .41,
    randomRoomCode: () => "BP301X",
  });
  const owner = hello(store);
  const created = store.createRoom(owner.session);
  assert.equal(created.ok, true);
  const room = store.rooms.get(created.room.roomId);
  assert.equal(store.setFloor(owner.session, floor).ok, true);
  assert.equal(store.setReady(owner.session, true).ok, true);
  const result = store.startExpedition(owner.session, {
    campaignReplay,
    hostWorld: hostWorld ?? {
      floorSeeds: { [floor]: 301_000 + floor },
      openedChestIds: { [floor]: [] },
      defeatedBossFloors: defeated,
      claimedBossRewardFloors: claimed,
    },
  });
  assert.equal(result.ok, true, result.message);
  return { store, owner, room, result };
}

function objectOf(expedition, type) {
  return expedition.objects.find(object => object.type === type);
}

test("build301 current 1F/6F use the official legacy 10F/60F boss profiles", () => {
  for (const [floor, expected] of [
    [1, { id: "floor-boss-10", name: "黒鉄の剣王", visual: "floor_boss_010" }],
    [6, { id: "floor-boss-60", name: "深潮の封陣卿", visual: "floor_boss_060" }],
  ]) {
    const { room } = started({ floor });
    const profile = room.expedition.floorBoss.profiles[0];
    assert.equal(profile.id, expected.id);
    assert.equal(profile.name, expected.name);
    assert.equal(profile.visualSpeciesId, expected.visual);
  }
});

test("build301 normal re-entry restores a defeated floor without respawning its boss", () => {
  const floor = 6;
  const { room, result } = started({ floor, defeated: [floor] });
  const expedition = room.expedition;
  const boss = objectOf(expedition, "floorBoss");
  const exit = objectOf(expedition, "exit");
  const trophy = objectOf(expedition, "campaignTrophy");
  const spring = objectOf(expedition, "hotSpring");

  assert.equal(expedition.campaignReplay, false);
  assert.equal(expedition.floorBoss.defeated, true);
  assert.equal(boss.resolved, true);
  assert.equal(boss.hidden, true);
  assert.equal(exit.hidden, false);
  assert.equal(exit.resolved, false);
  assert.equal(expedition.encountersEnabled, false);
  assert.equal(expedition.nextEncounter, Number.MAX_SAFE_INTEGER);
  assert.equal(trophy.resolved, false);
  assert.equal(trophy.locksOpened, 0);
  assert.equal(spring.resolved, false);
  assert.equal(expedition.campaignKeysCollected, 0);
  assert.equal(expedition.objects.filter(object => object.type === "campaignKey" && !object.resolved).length, 3);
  assert.notDeepEqual({ x: trophy.x, y: trophy.y }, { x: boss.x, y: boss.y }, "the trophy must not be hidden under the player standing on the defeated boss");
  assert.notDeepEqual({ x: spring.x, y: spring.y }, { x: trophy.x, y: trophy.y });
  assert.deepEqual(result.room.hostWorld.defeatedBossFloors, [floor]);
  assert.equal(result.room.expedition.campaignReplay, false);
});

test("build301 boss victory unlocks the trophy without issuing the removed legacy first-clear contract", () => {
  const floor = 6;
  const { store, owner, room } = started({ floor });
  const boss = objectOf(room.expedition, "floorBoss");
  store._startBattle(room, boss);
  const battle = room.expedition.battle;
  for (const enemy of battle.enemies) enemy.hp = 0;
  const result = store._finishBattleVictory(room, battle);
  assert.equal(result.ok, true);
  assert.deepEqual(room.hostWorld.defeatedBossFloors, [floor]);
  assert.equal(owner.session.pendingRewards.some(entry => entry.source?.bossFirstClear || entry.source?.kind === "floorBoss"), false);
  assert.ok(objectOf(room.expedition, "campaignTrophy"));
});

test("build301 a legacy 3-choice claim never pretends the v2 trophy was opened", () => {
  const floor = 6;
  const { room, result } = started({ floor, defeated: [floor], claimed: [floor] });
  const expedition = room.expedition;
  const trophy = objectOf(expedition, "campaignTrophy");

  assert.equal(expedition.floorBoss.defeated, true);
  assert.equal(trophy.resolved, false);
  assert.equal(trophy.hidden, false);
  assert.equal(trophy.locksOpened, 0);
  assert.equal(expedition.campaignKeysCollected, 0);
  assert.equal(expedition.objects.filter(object => object.type === "campaignKey").every(object => !object.resolved), true);
  assert.deepEqual(result.room.hostWorld.claimedBossRewardFloors, [floor]);
});

test("build301 an explicit three-lock floor state is the only ordinary re-entry completion source", () => {
  const floor = 6, runId = "completed-run";
  const hostWorld = {
    floorSeeds: { [floor]: 301_000 + floor }, openedChestIds: { [floor]: [] },
    defeatedBossFloors: [floor], claimedBossRewardFloors: [floor],
    campaignFloorStates: { [floor]: { runId, keysCollected: 3, trophyLocksOpened: 3, collectedKeyIds: ["campaignKey-1", "campaignKey-2", "campaignKey-3"], trophyMythicClaimed: true } },
  };
  const { room } = started({ floor, hostWorld });
  assert.equal(objectOf(room.expedition, "campaignTrophy").resolved, true);
  assert.equal(objectOf(room.expedition, "campaignTrophy").locksOpened, 3);
  assert.equal(room.expedition.campaignKeysCollected, 3);
});

test("build301 only an explicit campaign replay respawns a defeated boss", () => {
  const floor = 6;
  const { room, result } = started({ floor, defeated: [floor], claimed: [floor], campaignReplay: true });
  const expedition = room.expedition;
  const boss = objectOf(expedition, "floorBoss");
  const exit = objectOf(expedition, "exit");

  assert.equal(expedition.campaignReplay, true);
  assert.equal(expedition.floorBoss.defeated, false);
  assert.equal(boss.resolved, false);
  assert.equal(boss.hidden, false);
  assert.equal(exit.hidden, true);
  assert.equal(expedition.encountersEnabled, true);
  assert.equal(expedition.campaignKeysCollected, 0);
  assert.equal(objectOf(expedition, "campaignTrophy"), undefined);
  assert.equal(objectOf(expedition, "hotSpring"), undefined);
  assert.equal(result.room.expedition.campaignReplay, true);
});

test("build301 the final trophy lock durably records claimedBossRewardFloors", () => {
  const floor = 6;
  const { store, owner, room } = started({ floor, defeated: [floor] });
  const expedition = room.expedition;

  for (const key of expedition.objects.filter(object => object.type === "campaignKey")) {
    owner.session.dungeonPosition = { x: key.x, y: key.y, facing: "down" };
    store._resolveLanding(room, owner.session);
  }
  assert.equal(expedition.campaignKeysCollected, 3);
  const trophy = objectOf(expedition, "campaignTrophy");
  owner.session.dungeonPosition = { x: trophy.x, y: trophy.y, facing: "down" };
  store._resolveLanding(room, owner.session);

  assert.equal(trophy.resolved, true);
  assert.equal(trophy.locksOpened, 3);
  assert.deepEqual(room.hostWorld.claimedBossRewardFloors, [floor]);
  const delta = owner.session.pendingMessages.findLast(message => message.type === "hostWorldDelta");
  assert.deepEqual(delta.delta.claimedBossReward, { floor });
  assert.deepEqual(delta.hostWorld.claimedBossRewardFloors, [floor]);
  const trophyReward = owner.session.pendingRewards.find(entry => entry.source?.kind === "campaignTrophy" && entry.source.keys === 3);
  assert.equal(trophyReward.reward.randomEquipmentRarity, "神話");
  assert.equal(trophyReward.source.firstClaim, true);
  const stableIds = owner.session.pendingRewards
    .filter(entry => entry.source?.kind === "campaignTrophy")
    .map(entry => entry.rewardId)
    .sort();
  assert.deepEqual(stableIds, [`campaign-trophy:v6:${owner.session.playerId}:${floor}:${expedition.campaignRewardRunId}:${trophy.bossId}:claim:${owner.session.playerId}`]);
  assert.equal(stableIds.every(id => id.includes(expedition.campaignRewardRunId)), true, "reward ids are stable inside one run and distinct across explicit replays");
});

test("build302 collected keys survive return without creating partial trophy claims", () => {
  const floor = 6;
  const first = started({ floor, defeated: [floor] });
  const firstKey = first.room.expedition.objects.find(object => object.type === "campaignKey" && object.id === "campaignKey-2")
    ?? first.room.expedition.objects.find(object => object.type === "campaignKey");
  first.owner.session.dungeonPosition = { x: firstKey.x, y: firstKey.y, facing: "down" };
  first.store._resolveLanding(first.room, first.owner.session);
  const trophy = objectOf(first.room.expedition, "campaignTrophy");
  first.owner.session.dungeonPosition = { x: trophy.x, y: trophy.y, facing: "down" };
  first.store._resolveLanding(first.room, first.owner.session);

  const saved = structuredClone(first.room.hostWorld);
  assert.deepEqual(saved.campaignFloorStates[String(floor)], {
    runId: first.room.expedition.campaignRewardRunId, keysCollected: 1, trophyLocksOpened: 0,
    trophyFragmentPacksClaimed: 0,
    collectedKeyIds: [firstKey.id], hotSpringUsed: false, trophyMythicClaimed: false,
    replayActive: false, bossDefeatedThisRun: true,
    openedBossIds: [], claimedBossIds: [], mythicClaimedBossIds: [], fragmentPacksClaimedByBoss: {},
    defeatedBossIds: [trophy.bossId],
  });
  assert.equal(trophy.locksOpened, 0);
  assert.equal(first.owner.session.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy").length, 0);

  first.store._resolveLanding(first.room, first.owner.session);
  assert.equal(first.owner.session.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy").length, 0, "one key cannot mint a partial reward");
  assert.equal(first.store.requestReturn(first.owner.session).ok, true);

  const second = started({ floor, hostWorld: saved });
  const restoredTrophy = objectOf(second.room.expedition, "campaignTrophy");
  const restoredKeys = second.room.expedition.objects.filter(object => object.type === "campaignKey");
  assert.equal(second.room.expedition.campaignKeysCollected, 1);
  assert.equal(restoredTrophy.locksOpened, 0);
  assert.equal(restoredTrophy.resolved, false);
  assert.equal(restoredKeys.find(object => object.id === firstKey.id)?.resolved, true);
  assert.equal(restoredKeys.filter(object => object.resolved).length, 1);

  second.owner.session.dungeonPosition = { x: restoredTrophy.x, y: restoredTrophy.y, facing: "down" };
  second.store._resolveLanding(second.room, second.owner.session);
  assert.equal(second.owner.session.pendingRewards.some(entry => entry.source?.kind === "campaignTrophy"), false, "re-entry cannot pay the already persisted lock again");
});

test("build301 hot spring use survives return and cannot heal again on re-entry", () => {
  const floor = 6;
  const first = started({ floor, defeated: [floor] });
  const spring = objectOf(first.room.expedition, "hotSpring");
  first.owner.session.coopRosterVitals[0].hp = 1;
  first.owner.session.coopRosterVitals[0].mp = 0;
  first.owner.session.dungeonPosition = { x: spring.x, y: spring.y, facing: "down" };
  first.store._resolveLanding(first.room, first.owner.session);

  assert.equal(spring.resolved, true);
  assert.equal(spring.hidden, false, "Build308 keeps a used spring visible");
  assert.equal(first.room.hostWorld.campaignFloorStates[String(floor)].hotSpringUsed, true);
  const delta = first.owner.session.pendingMessages.findLast(message => message.type === "hostWorldDelta");
  assert.deepEqual(delta.delta.hotSpringUsed, { floor });
  const saved = structuredClone(first.room.hostWorld);
  assert.equal(first.store.requestReturn(first.owner.session).ok, true);

  const second = started({ floor, hostWorld: saved });
  const restored = objectOf(second.room.expedition, "hotSpring");
  assert.equal(restored.resolved, true);
  assert.equal(restored.hidden, false, "the visible used state survives re-entry");
  assert.equal(second.result.room.hostWorld.campaignFloorStates[String(floor)].hotSpringUsed, true);
});

test("build301 hot spring host state and every recovered vital roll back together on journal failure", () => {
  const floor = 6;
  const { store, owner, room } = started({ floor, defeated: [floor] });
  const spring = objectOf(room.expedition, "hotSpring");
  owner.session.coopRosterVitals[0].hp = 7;
  owner.session.coopRosterVitals[0].mp = 3;
  owner.session.coopVitals.hp = 7;
  owner.session.coopVitals.mp = 3;
  owner.session.dungeonPosition = { x: spring.x, y: spring.y, facing: "down" };
  const before = {
    world: structuredClone(room.hostWorld),
    roster: structuredClone(owner.session.coopRosterVitals),
    vitals: structuredClone(owner.session.coopVitals),
    revision: owner.session.vitalsRevision,
    rewards: structuredClone(owner.session.pendingRewards),
    messages: structuredClone(owner.session.pendingMessages),
  };
  const sync = store._syncSettlementJournal.bind(store);
  store._syncSettlementJournal = () => false;

  const failed = store._resolveLanding(room, owner.session);
  assert.equal(failed.code, "SETTLEMENT_PERSISTENCE");
  assert.equal(spring.resolved, false);
  assert.equal(spring.hidden, false);
  assert.deepEqual(room.hostWorld, before.world);
  assert.deepEqual(owner.session.coopRosterVitals, before.roster);
  assert.deepEqual(owner.session.coopVitals, before.vitals);
  assert.equal(owner.session.vitalsRevision, before.revision);
  assert.deepEqual(owner.session.pendingRewards, before.rewards);
  assert.deepEqual(owner.session.pendingMessages, before.messages);

  store._syncSettlementJournal = sync;
  assert.equal(store._resolveLanding(room, owner.session), undefined);
  assert.equal(spring.resolved, true);
  assert.equal(room.hostWorld.campaignFloorStates[String(floor)].hotSpringUsed, true);
  assert.equal(owner.session.coopVitals.hp, owner.session.coopVitals.maxHp);
  assert.equal(owner.session.coopVitals.mp, owner.session.coopVitals.maxMp);
});

test("build302 a failed all-key trophy settlement mutates neither the trophy nor host world", () => {
  const floor = 6;
  const { store, owner, room } = started({ floor, defeated: [floor] });
  for (const key of room.expedition.objects.filter(object => object.type === "campaignKey")) {
    owner.session.dungeonPosition = { x: key.x, y: key.y, facing: "down" };
    store._resolveLanding(room, owner.session);
  }
  const trophy = objectOf(room.expedition, "campaignTrophy");
  owner.session.dungeonPosition = { x: trophy.x, y: trophy.y, facing: "down" };
  const before = structuredClone(room.hostWorld);
  const commit = store._commitSettlementBatch.bind(store);
  store._commitSettlementBatch = () => false;

  const failed = store._resolveLanding(room, owner.session);
  assert.equal(failed.code, "SETTLEMENT_PERSISTENCE");
  assert.equal(trophy.locksOpened, 0);
  assert.deepEqual(room.hostWorld, before);
  assert.equal(owner.session.pendingRewards.some(entry => entry.source?.kind === "campaignTrophy"), false);

  store._commitSettlementBatch = commit;
  store._resolveLanding(room, owner.session);
  assert.equal(trophy.locksOpened, 3);
  assert.equal(owner.session.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy").length, 1);
});

test("build308 milestone trophies each carry only their matching boss with fragment parity", () => {
  const floor = 100;
  const { store, owner, room } = started({ floor, defeated: [floor] });
  for (const key of room.expedition.objects.filter(object => object.type === "campaignKey")) {
    owner.session.dungeonPosition = { x: key.x, y: key.y, facing: "down" };
    store._resolveLanding(room, owner.session);
  }
  const trophies = room.expedition.objects.filter(object => object.type === "campaignTrophy");
  assert.deepEqual(trophies.map(trophy => trophy.bossId), ["ten_dominion", "ten_creation", "ten_end", "ten_divinity"]);
  for (const trophy of trophies) {
    owner.session.dungeonPosition = { x: trophy.x, y: trophy.y, facing: "down" };
    store._resolveLanding(room, owner.session);
  }

  const claims = owner.session.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy");
  assert.equal(claims.length, 4);
  assert.deepEqual(claims.map(claim => claim.source.bosses.map(boss => boss.endgameBossId)),
    [["ten_dominion"], ["ten_creation"], ["ten_end"], ["ten_divinity"]]);
  assert.deepEqual(claims.map(claim => claim.source.fragmentAwards.map(entry => [entry.id, entry.amount])), [
    [["ten_dominion", 30]], [["ten_creation", 30]], [["ten_end", 30]], [["ten_divinity", 30]],
  ]);
});

test("build301 explicit replay pays fragments with a new run id but never a second mythic", () => {
  const floor = 6;
  const first = started({ floor, defeated: [floor] });
  for (const key of first.room.expedition.objects.filter(object => object.type === "campaignKey")) {
    first.owner.session.dungeonPosition = { x: key.x, y: key.y, facing: "down" };
    first.store._resolveLanding(first.room, first.owner.session);
  }
  let trophy = objectOf(first.room.expedition, "campaignTrophy");
  first.owner.session.dungeonPosition = { x: trophy.x, y: trophy.y, facing: "down" };
  first.store._resolveLanding(first.room, first.owner.session);
  const saved = structuredClone(first.room.hostWorld), firstRunId = first.room.expedition.campaignRewardRunId;

  const replay = started({ floor, hostWorld: saved, campaignReplay: true });
  const boss = objectOf(replay.room.expedition, "floorBoss");
  replay.store._startBattle(replay.room, boss);
  for (const enemy of replay.room.expedition.battle.enemies) enemy.hp = 0;
  assert.equal(replay.store._finishBattleVictory(replay.room, replay.room.expedition.battle).ok, true);
  for (const key of replay.room.expedition.objects.filter(object => object.type === "campaignKey")) {
    replay.owner.session.dungeonPosition = { x: key.x, y: key.y, facing: "down" };
    replay.store._resolveLanding(replay.room, replay.owner.session);
  }
  trophy = objectOf(replay.room.expedition, "campaignTrophy");
  replay.owner.session.dungeonPosition = { x: trophy.x, y: trophy.y, facing: "down" };
  replay.store._resolveLanding(replay.room, replay.owner.session);

  const rewards = replay.owner.session.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy");
  assert.equal(rewards.length, 1);
  assert.equal(rewards.some(entry => entry.reward.randomEquipmentRarity === "神話"), false);
  assert.equal(rewards.every(entry => entry.source.fragmentAwards.length > 0), true);
  assert.equal(rewards[0].source.fragmentPacks, 3);
  assert.notEqual(replay.room.expedition.campaignRewardRunId, firstRunId);
  assert.equal(rewards.every(entry => entry.rewardId.includes(replay.room.expedition.campaignRewardRunId)), true);
});

test("build301 a replay key saved before its boss keeps the replay boss alive on ordinary re-entry", () => {
  const floor = 6;
  const hostWorld = {
    floorSeeds: { [floor]: 301_000 + floor }, openedChestIds: { [floor]: [] },
    defeatedBossFloors: [floor], claimedBossRewardFloors: [floor],
    campaignFloorStates: { [floor]: { runId: "old-run", keysCollected: 3, trophyLocksOpened: 3, collectedKeyIds: ["campaignKey-1", "campaignKey-2", "campaignKey-3"], trophyMythicClaimed: true } },
  };
  const replay = started({ floor, hostWorld, campaignReplay: true });
  const key = replay.room.expedition.objects.find(object => object.type === "campaignKey");
  replay.owner.session.dungeonPosition = { x: key.x, y: key.y, facing: "down" };
  replay.store._resolveLanding(replay.room, replay.owner.session);
  const saved = structuredClone(replay.room.hostWorld);
  assert.equal(saved.campaignFloorStates[String(floor)].replayActive, true);
  assert.equal(saved.campaignFloorStates[String(floor)].bossDefeatedThisRun, false);

  const resumed = started({ floor, hostWorld: saved });
  assert.equal(resumed.room.expedition.campaignReplay, true);
  assert.equal(resumed.room.expedition.campaignRewardRunId, saved.campaignFloorStates[String(floor)].runId);
  assert.equal(resumed.room.expedition.floorBoss.defeated, false);
  assert.equal(resumed.room.expedition.campaignKeysCollected, 1);
  assert.equal(resumed.room.expedition.objects.filter(object => object.type === "campaignKey" && object.resolved).length, 1);
  assert.equal(objectOf(resumed.room.expedition, "floorBoss").resolved, false);
  assert.equal(objectOf(resumed.room.expedition, "campaignTrophy"), undefined);
});

test("build301 reconnect keeps the restored boss, exit and trophy state in the same run", () => {
  const floor = 6;
  const { store, owner, room } = started({ floor, defeated: [floor] });
  const before = structuredClone({
    id: room.expedition.id,
    floorBoss: room.expedition.floorBoss,
    objects: room.expedition.objects.filter(object => ["floorBoss", "exit", "campaignTrophy", "hotSpring", "campaignKey"].includes(object.type)),
    campaignKeysCollected: room.expedition.campaignKeysCollected,
    encountersEnabled: room.expedition.encountersEnabled,
    nextEncounter: room.expedition.nextEncounter,
  });

  store.disconnect(owner.session, owner.conn);
  const resumed = hello(store, owner.result.resumeToken);
  assert.equal(resumed.result.resumed, true);
  assert.equal(resumed.result.room.expedition.id, before.id);
  assert.deepEqual(room.expedition.floorBoss, before.floorBoss);
  assert.deepEqual(room.expedition.objects.filter(object => ["floorBoss", "exit", "campaignTrophy", "hotSpring", "campaignKey"].includes(object.type)), before.objects);
  assert.equal(room.expedition.campaignKeysCollected, before.campaignKeysCollected);
  assert.equal(room.expedition.encountersEnabled, before.encountersEnabled);
  assert.equal(room.expedition.nextEncounter, before.nextEncounter);
});
