import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

const FRIEND_ID = "AD-B3ZZ-QA88";
const CLIENT_KEY = "build308-multi-boss-contract-client-key";

function connection() {
  return {
    messages: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close() {},
  };
}

function profile() {
  return {
    displayName: "Build308 QA",
    monsterId: "build308-qa-owner",
    speciesId: "slime",
    maxFloor: 100,
    currentHp: 2_000,
    currentMp: 500,
    explorePickupDone: true,
    battleStats: {
      hp: 2_000,
      mp: 500,
      atk: 50_000,
      matk: 50_000,
      def: 10_000,
      mdef: 10_000,
      spd: 1_000,
      crit: 5,
      evasion: 3,
      accuracy: 100,
    },
  };
}

function defaultHostWorld(floor) {
  return {
    floorSeeds: { [floor]: 308_000 + floor },
    openedChestIds: { [floor]: [] },
    defeatedBossFloors: [],
    claimedBossRewardFloors: [],
    campaignFloorStates: {},
  };
}

function started({ floor = 80, hostWorld = null, campaignReplay = false } = {}) {
  const store = new RoomStore({
    random: () => 0.41,
    randomRoomCode: () => "B308QA",
  });
  const conn = connection();
  const hello = store.hello(conn, {
    friendId: FRIEND_ID,
    clientKey: CLIENT_KEY,
    profile: profile(),
  });
  assert.equal(hello.ok, true, hello.message);
  const owner = conn.session;
  const created = store.createRoom(owner);
  assert.equal(created.ok, true, created.message);
  const room = store.rooms.get(created.room.roomId);
  assert.equal(store.setFloor(owner, floor).ok, true);
  assert.equal(store.setReady(owner, true).ok, true);
  const result = store.startExpedition(owner, {
    campaignReplay,
    hostWorld: hostWorld ?? defaultHostWorld(floor),
  });
  assert.equal(result.ok, true, result.message);
  return { store, conn, owner, room, result };
}

function bossesOf(expedition) {
  return expedition.objects.filter(object => object.type === "floorBoss");
}

function trophiesOf(expedition) {
  return expedition.objects.filter(object => object.type === "campaignTrophy");
}

function defeat(context, boss) {
  const { store, room } = context;
  store._startBattle(room, boss);
  const battle = room.expedition.battle;
  assert.ok(battle, `battle must start for ${boss.bossId}`);
  assert.equal(battle.floorBoss, true);
  assert.equal(battle.bossId, boss.bossId);
  assert.deepEqual(battle.bossProfiles.map(entry => entry.id), [boss.bossId]);
  assert.equal(battle.enemies.length, 1, "a Ten-God room starts exactly one enemy");
  assert.equal(battle.enemies[0].endgameBossId, boss.bossId);
  for (const enemy of battle.enemies) enemy.hp = 0;
  const result = store._finishBattleVictory(room, battle);
  assert.equal(result.ok, true, result.message);
  assert.equal(room.expedition.battle, null);
}

function landOn(context, object) {
  context.owner.dungeonPosition = { x: object.x, y: object.y, facing: "down" };
  return context.store._resolveLanding(context.room, context.owner);
}

test("build308 80F, 90F and 100F create 3/3/4 distinct single-Ten-God encounters", () => {
  const contracts = [
    [80, ["ten_time", "ten_space", "ten_life"]],
    [90, ["ten_death", "ten_fate", "ten_chaos"]],
    [100, ["ten_dominion", "ten_creation", "ten_end", "ten_divinity"]],
  ];

  for (const [floor, expectedIds] of contracts) {
    const context = started({ floor });
    const bosses = bossesOf(context.room.expedition);
    assert.deepEqual(bosses.map(boss => boss.bossId), expectedIds);
    assert.equal(new Set(bosses.map(boss => `${boss.x},${boss.y}`)).size, expectedIds.length,
      `${floor}F bosses must occupy separate map cells`);
    assert.equal(new Set(bosses.map(boss => boss.id)).size, expectedIds.length);

    for (const boss of bosses) {
      assert.deepEqual(boss.bossProfiles.map(entry => entry.id), [boss.bossId]);
      context.store._startBattle(context.room, boss);
      const battle = context.room.expedition.battle;
      assert.equal(battle.bossId, boss.bossId);
      assert.deepEqual(battle.bossProfiles.map(entry => entry.id), [boss.bossId]);
      assert.equal(battle.enemies.length, 1);
      assert.equal(battle.enemies[0].endgameBossId, boss.bossId);
      context.room.expedition.battle = null;
    }
  }
});

test("build308 one Ten God opens the exit while every defeated god keeps an individual reusable-key trophy", () => {
  const context = started({ floor: 80 });
  const { room, owner } = context;
  const bosses = bossesOf(room.expedition);
  const exit = room.expedition.objects.find(object => object.type === "exit");
  assert.equal(exit.hidden, true);

  defeat(context, bosses[0]);
  assert.equal(exit.hidden, false, "the first defeated Ten God opens the next-floor route");
  assert.equal(room.expedition.floorBoss.defeated, true);
  assert.equal(room.expedition.floorBoss.allDefeated, false);
  assert.deepEqual(room.expedition.floorBoss.defeatedBossIds, [bosses[0].bossId]);
  assert.equal(bossesOf(room.expedition).filter(boss => !boss.resolved).length, 2);
  assert.deepEqual(trophiesOf(room.expedition).map(chest => chest.bossId), [bosses[0].bossId]);

  const keys = room.expedition.objects.filter(object => object.type === "campaignKey");
  assert.equal(keys.length, 3);
  for (const key of keys) landOn(context, key);
  assert.equal(room.expedition.campaignKeysCollected, 3);

  landOn(context, trophiesOf(room.expedition)[0]);
  assert.equal(room.expedition.campaignKeysCollected, 3, "opening a trophy must not consume the floor keys");
  assert.deepEqual(room.hostWorld.campaignFloorStates["80"].openedBossIds, [bosses[0].bossId]);
  assert.deepEqual(room.hostWorld.campaignFloorStates["80"].claimedBossIds, [bosses[0].bossId]);
  assert.deepEqual(room.hostWorld.campaignFloorStates["80"].mythicClaimedBossIds, [bosses[0].bossId]);
  assert.deepEqual(room.hostWorld.claimedBossRewardFloors, [], "the legacy floor-wide receipt waits for every boss chest");

  for (const boss of bosses.slice(1)) {
    defeat(context, boss);
    const trophy = trophiesOf(room.expedition).find(chest => chest.bossId === boss.bossId);
    assert.ok(trophy, `${boss.bossId} creates its own trophy`);
    landOn(context, trophy);
    assert.equal(room.expedition.campaignKeysCollected, 3);
  }

  const state = room.hostWorld.campaignFloorStates["80"];
  assert.deepEqual(state.defeatedBossIds, bosses.map(boss => boss.bossId));
  assert.deepEqual(state.openedBossIds, bosses.map(boss => boss.bossId));
  assert.deepEqual(state.claimedBossIds, bosses.map(boss => boss.bossId));
  assert.deepEqual(state.mythicClaimedBossIds, bosses.map(boss => boss.bossId));
  assert.deepEqual(state.fragmentPacksClaimedByBoss,
    Object.fromEntries(bosses.map(boss => [boss.bossId, 3])));
  assert.deepEqual(room.hostWorld.claimedBossRewardFloors, [80]);
  assert.equal(room.expedition.floorBoss.allDefeated, true);
  assert.equal(trophiesOf(room.expedition).every(chest => chest.resolved && chest.locksOpened === 3), true);

  const rewards = owner.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy");
  assert.equal(rewards.length, 3);
  assert.equal(new Set(rewards.map(entry => entry.rewardId)).size, 3);
  assert.equal(rewards.every(entry => entry.rewardId.includes(room.expedition.campaignRewardRunId)), true);
  assert.deepEqual(rewards.map(entry => entry.source.bossId), bosses.map(boss => boss.bossId));
  assert.equal(rewards.every(entry => entry.source.keys === 3 && entry.source.keysConsumed === 0), true);
  assert.equal(rewards.every(entry => entry.source.campaignBossReward?.tier === "tenGod"), true);
  assert.equal(rewards.every(entry => entry.reward.gold >= 1_000_000), true);
  assert.equal(rewards.every(entry => entry.reward.crystals >= 190), true);

  landOn(context, trophiesOf(room.expedition)[0]);
  assert.equal(owner.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy").length, 3,
    "an already claimed god chest must not pay twice");
});

test("build308 replay separates this-run receipts from lifetime mythics and pays repeat currency/fragments", () => {
  const first = started({ floor: 80 });
  const firstBoss = bossesOf(first.room.expedition)[0];
  defeat(first, firstBoss);
  for (const key of first.room.expedition.objects.filter(object => object.type === "campaignKey")) landOn(first, key);
  landOn(first, trophiesOf(first.room.expedition)[0]);

  const firstReward = first.owner.pendingRewards.find(entry => entry.source?.kind === "campaignTrophy");
  const firstRunId = first.room.expedition.campaignRewardRunId;
  assert.ok(firstReward.reward.randomEquipmentRarity === "神話");
  assert.equal(firstReward.source.firstClaim, true);
  assert.equal(firstReward.source.fragmentPacks, 3);
  assert.ok(firstReward.reward.gold > 0);
  assert.ok(firstReward.reward.crystals > 0);
  assert.ok(firstReward.rewardId.includes(firstRunId));

  const replay = started({ floor: 80, hostWorld: structuredClone(first.room.hostWorld), campaignReplay: true });

  const replayRunId = replay.room.expedition.campaignRewardRunId;
  const resetState = replay.room.hostWorld.campaignFloorStates["80"];
  assert.notEqual(replayRunId, firstRunId);
  assert.deepEqual(resetState.openedBossIds, [], "a new run starts with no opened trophy");
  assert.deepEqual(resetState.claimedBossIds, [], "the legacy alias also describes only this run");
  assert.deepEqual(resetState.fragmentPacksClaimedByBoss, {}, "fragment receipts reset per run");
  assert.deepEqual(resetState.mythicClaimedBossIds, [firstBoss.bossId], "the mythic receipt is lifetime data");

  const replayBoss = bossesOf(replay.room.expedition).find(entry => entry.bossId === firstBoss.bossId);
  defeat(replay, replayBoss);
  for (const key of replay.room.expedition.objects.filter(object => object.type === "campaignKey")) landOn(replay, key);
  landOn(replay, trophiesOf(replay.room.expedition).find(entry => entry.bossId === firstBoss.bossId));

  const replayReward = replay.owner.pendingRewards.find(entry => entry.source?.kind === "campaignTrophy");
  assert.ok(replayReward);
  assert.equal("randomEquipmentRarity" in replayReward.reward, false, "replay never grants a second mythic");
  assert.equal(replayReward.source.firstClaim, false);
  assert.equal(replayReward.source.fragmentPacks, 3);
  assert.equal(replayReward.source.legacyFragmentPacks, 0);
  assert.ok(replayReward.reward.gold > 0, "replay still grants boss GOLD");
  assert.ok(replayReward.reward.crystals > 0, "replay still grants boss crystals");
  assert.ok(replayReward.rewardId.includes(replayRunId), "the id is scoped to the replay run");
  assert.ok(replayReward.rewardId.includes(firstBoss.bossId), "the id is scoped to the defeated boss");
  assert.notEqual(replayReward.rewardId, firstReward.rewardId);

  const replayState = replay.room.hostWorld.campaignFloorStates["80"];
  assert.deepEqual(replayState.openedBossIds, [firstBoss.bossId]);
  assert.deepEqual(replayState.mythicClaimedBossIds, [firstBoss.bossId]);
  assert.equal(replayState.fragmentPacksClaimedByBoss[firstBoss.bossId], 3);

  const resumed = started({ floor: 80, hostWorld: structuredClone(replay.room.hostWorld) });
  const resumedState = resumed.room.hostWorld.campaignFloorStates["80"];
  assert.equal(resumed.room.expedition.campaignReplay, true, "ordinary re-entry resumes the active replay run");
  assert.equal(resumed.room.expedition.campaignRewardRunId, replayRunId);
  assert.deepEqual(resumedState.openedBossIds, [firstBoss.bossId]);
  assert.deepEqual(resumedState.mythicClaimedBossIds, [firstBoss.bossId]);
  assert.equal(trophiesOf(resumed.room.expedition).find(entry => entry.bossId === firstBoss.bossId)?.resolved, true);
  assert.equal(bossesOf(resumed.room.expedition).filter(entry => !entry.resolved).length, 2,
    "lifetime floor receipts must not auto-open or defeat the remaining replay bosses");
});

test("build308 legacy partial fragment receipts pay only the missing packs", () => {
  const floor = 6;
  const context = started({ floor, hostWorld: {
    floorSeeds: { [floor]: 308_000 + floor },
    openedChestIds: { [floor]: [] },
    defeatedBossFloors: [floor],
    claimedBossRewardFloors: [],
    campaignFloorStates: {
      [floor]: {
        runId: "legacy-partial-run",
        keysCollected: 3,
        trophyLocksOpened: 2,
        trophyFragmentPacksClaimed: 2,
        trophyMythicClaimed: false,
      },
    },
  } });
  const trophy = trophiesOf(context.room.expedition)[0];
  assert.ok(trophy);
  landOn(context, trophy);

  const reward = context.owner.pendingRewards.find(entry => entry.source?.kind === "campaignTrophy");
  assert.ok(reward);
  assert.equal(reward.source.legacyFragmentPacks, 2);
  assert.equal(reward.source.fragmentPacks, 1, "only one of the three packs remains unpaid");
  assert.equal(reward.source.fragmentAwards[0].amount, 4);
  assert.equal(reward.reward.randomEquipmentRarity, "神話");
  assert.ok(reward.rewardId.includes("legacy-partial-run"));
  assert.ok(reward.rewardId.includes(trophy.bossId));
  assert.equal(context.room.hostWorld.campaignFloorStates[String(floor)].fragmentPacksClaimedByBoss[trophy.bossId], 3);
});

test("build308 used boss spring remains visible and durably used after re-entry", () => {
  const first = started({ floor: 80 });
  defeat(first, bossesOf(first.room.expedition)[0]);
  const spring = first.room.expedition.objects.find(object => object.type === "hotSpring");
  assert.ok(spring);

  first.owner.coopRosterVitals[0].hp = 1;
  first.owner.coopRosterVitals[0].mp = 0;
  first.owner.coopVitals.hp = 1;
  first.owner.coopVitals.mp = 0;
  landOn(first, spring);

  assert.equal(first.owner.coopRosterVitals[0].hp, first.owner.coopRosterVitals[0].maxHp);
  assert.equal(first.owner.coopRosterVitals[0].mp, first.owner.coopRosterVitals[0].maxMp);
  assert.equal(first.room.hostWorld.campaignFloorStates["80"].hotSpringUsed, true);
  assert.deepEqual({ active: spring.active, resolved: spring.resolved, used: spring.used, hidden: spring.hidden },
    { active: true, resolved: true, used: true, hidden: false });

  const restored = started({ floor: 80, hostWorld: structuredClone(first.room.hostWorld) });
  const restoredSpring = restored.room.expedition.objects.find(object => object.type === "hotSpring");
  assert.ok(restoredSpring);
  assert.deepEqual({ active: restoredSpring.active, resolved: restoredSpring.resolved, used: restoredSpring.used, hidden: restoredSpring.hidden },
    { active: true, resolved: true, used: true, hidden: false });
  assert.equal(restored.room.hostWorld.campaignFloorStates["80"].hotSpringUsed, true);
});

test("build308 a reconnect snapshot rescues a legacy combined Ten-God battle", () => {
  const context = started({ floor: 100 });
  const { store, room, owner, conn } = context;
  const bosses = bossesOf(room.expedition);
  store._startBattle(room, bosses[0]);
  const legacyBattle = room.expedition.battle;
  legacyBattle.bossProfiles = room.expedition.floorBoss.profiles.map(profile => ({ ...profile }));
  legacyBattle.enemies = room.expedition.floorBoss.profiles.map((profile, index) => ({
    ...legacyBattle.enemies[0],
    id: `legacy-ten-god-${index}`,
    endgameBossId: profile.id,
    visualSpeciesId: profile.id,
    name: profile.name,
  }));
  const resumeToken = owner.resumeToken;

  store.disconnect(owner, conn);
  const nextConnection = connection();
  const resumed = store.hello(nextConnection, {
    friendId: FRIEND_ID,
    clientKey: CLIENT_KEY,
    resumeToken,
    profile: profile(),
  });

  assert.equal(resumed.ok, true, resumed.message);
  assert.equal(resumed.resumed, true);
  assert.equal(room.expedition.battle, null);
  assert.equal(room.expedition.lastEvent?.kind, "floorBossMigration");
  assert.equal(bossesOf(room.expedition).length, 4);
  assert.equal(bossesOf(room.expedition).every(boss => boss.bossProfiles.length === 1), true);
  assert.deepEqual(room.expedition.floorBoss.defeatedBossIds, []);
});
