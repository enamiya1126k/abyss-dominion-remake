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
  clientKey: "build302-campaign-trophy-client-key",
};

function profile() {
  return {
    displayName: "Campaign owner",
    monsterId: "build302-owner",
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

function hello(store) {
  const conn = connection();
  const result = store.hello(conn, { ...identity, profile: profile() });
  assert.equal(result.ok, true, result.message);
  return { conn, result, session: conn.session };
}

function started({ floor = 6, hostWorld = null, campaignReplay = false } = {}) {
  const store = new RoomStore({
    random: () => .41,
    randomRoomCode: () => "BT302X",
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
      floorSeeds: { [floor]: 302_000 + floor },
      openedChestIds: { [floor]: [] },
      defeatedBossFloors: [floor],
      claimedBossRewardFloors: [],
    },
  });
  assert.equal(result.ok, true, result.message);
  return { store, owner, room, result };
}

function objectOf(expedition, type) {
  return expedition.objects.find(object => object.type === type);
}

function collectKey(context, key) {
  context.owner.session.dungeonPosition = { x: key.x, y: key.y, facing: "down" };
  return context.store._resolveLanding(context.room, context.owner.session);
}

function touchTrophy(context) {
  const trophy = objectOf(context.room.expedition, "campaignTrophy");
  context.owner.session.dungeonPosition = { x: trophy.x, y: trophy.y, facing: "down" };
  return context.store._resolveLanding(context.room, context.owner.session);
}

test("build302 trophy remains fully locked at one or two keys and pays everything once at three", () => {
  const context = started();
  const { room, owner } = context;
  const keys = room.expedition.objects.filter(object => object.type === "campaignKey");
  const trophy = objectOf(room.expedition, "campaignTrophy");

  collectKey(context, keys[0]);
  touchTrophy(context);
  collectKey(context, keys[1]);
  touchTrophy(context);

  assert.equal(room.expedition.campaignKeysCollected, 2);
  assert.equal(trophy.resolved, false);
  assert.equal(trophy.locksOpened, 0);
  assert.equal(owner.session.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy").length, 0);
  assert.equal(room.hostWorld.campaignFloorStates["6"].trophyLocksOpened, 0);
  assert.equal(owner.conn.messages.findLast(message => message.type === "expeditionEvent")?.event?.kind, "campaignTrophyLocked");

  collectKey(context, keys[2]);
  touchTrophy(context);

  const rewards = owner.session.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy");
  assert.equal(rewards.length, 1, "three fragment packs and the mythic are one atomic delivery");
  assert.match(rewards[0].rewardId, /^campaign-trophy:v6:/);
  assert.ok(rewards[0].rewardId.includes(room.expedition.campaignRewardRunId));
  assert.ok(rewards[0].rewardId.includes(trophy.bossId));
  assert.equal(rewards[0].reward.randomEquipmentRarity, "神話");
  assert.ok(rewards[0].reward.crystals >= 25, "Build308 uses the increased floor-boss crystal reward");
  assert.equal(rewards[0].source.fragmentPacks, 3);
  assert.equal(rewards[0].source.legacyFragmentPacks, 0);
  assert.equal(rewards[0].source.fragmentAwards[0].amount, 12);
  assert.equal(rewards[0].source.firstClaim, true);
  assert.equal(rewards[0].source.personalBonus, null, "trophy settlement cannot replace the guaranteed mythic with a bonus roll");
  assert.equal(trophy.resolved, true);
  assert.equal(trophy.locksOpened, 3);
  assert.equal(room.hostWorld.campaignFloorStates["6"].trophyLocksOpened, 3);
  assert.equal(room.hostWorld.campaignFloorStates["6"].trophyMythicClaimed, true);
  assert.deepEqual(room.hostWorld.claimedBossRewardFloors, [6]);

  touchTrophy(context);
  assert.equal(owner.session.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy").length, 1, "an opened trophy cannot pay twice");
});

test("build302 rescues Build301 partial fragment locks without removing or re-awarding them", () => {
  const probe = started();
  const floor = 6;
  const firstKeyId = probe.room.expedition.objects.find(object => object.type === "campaignKey").id;
  const runId = probe.room.expedition.campaignRewardRunId;
  const hostWorld = {
    floorSeeds: { [floor]: 302_000 + floor },
    openedChestIds: { [floor]: [] },
    defeatedBossFloors: [floor],
    claimedBossRewardFloors: [],
    campaignFloorStates: {
      [floor]: {
        runId,
        keysCollected: 1,
        trophyLocksOpened: 1,
        collectedKeyIds: [firstKeyId],
        trophyMythicClaimed: false,
      },
    },
  };
  const context = started({ floor, hostWorld });
  const keys = context.room.expedition.objects.filter(object => object.type === "campaignKey");
  const trophy = objectOf(context.room.expedition, "campaignTrophy");

  assert.equal(context.room.expedition.campaignKeysCollected, 1);
  assert.equal(trophy.locksOpened, 0, "a legacy partial receipt must restore the chest as fully locked");
  assert.equal(context.room.hostWorld.campaignFloorStates["6"].trophyFragmentPacksClaimed, 1, "the Build301 fragment receipt is preserved as migration evidence");
  touchTrophy(context);
  assert.equal(context.owner.session.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy").length, 0);

  for (const key of keys.filter(key => !key.resolved)) collectKey(context, key);
  touchTrophy(context);

  const rewards = context.owner.session.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy");
  assert.equal(rewards.length, 1);
  assert.equal(rewards[0].source.legacyFragmentPacks, 1);
  assert.equal(rewards[0].source.fragmentPacks, 2, "only the two unpaid fragment packs are delivered");
  assert.equal(rewards[0].source.fragmentAwards[0].amount, 8);
  assert.ok(rewards[0].reward.crystals >= 25, "legacy fragment recovery still receives the full Build308 boss currency");
  assert.equal(rewards[0].reward.randomEquipmentRarity, "神話");
  assert.equal(rewards[0].source.firstClaim, true);
  assert.equal(context.room.hostWorld.campaignFloorStates["6"].trophyLocksOpened, 3);
  assert.equal(context.room.hostWorld.campaignFloorStates["6"].trophyFragmentPacksClaimed, 3);
  assert.equal(context.room.hostWorld.campaignFloorStates["6"].trophyMythicClaimed, true);
});

test("build302 preserves the canonical partial receipt sent by an offline save", () => {
  const probe = started(), floor = 6;
  const keyIds = probe.room.expedition.objects.filter(object => object.type === "campaignKey").slice(0, 2).map(object => object.id);
  const context = started({ floor, hostWorld: {
    floorSeeds: { [floor]: 302_000 + floor }, openedChestIds: { [floor]: [] },
    defeatedBossFloors: [floor], claimedBossRewardFloors: [],
    campaignFloorStates: { [floor]: { keysCollected: 2, trophyLocksOpened: 0, trophyFragmentPacksClaimed: 2, collectedKeyIds: keyIds, trophyMythicClaimed: false } },
  } });
  const state = context.room.hostWorld.campaignFloorStates[String(floor)];
  assert.equal(state.trophyLocksOpened, 0);
  assert.equal(state.trophyFragmentPacksClaimed, 2);
  for (const key of context.room.expedition.objects.filter(object => object.type === "campaignKey" && !object.resolved)) collectKey(context, key);
  touchTrophy(context);
  const reward = context.owner.session.pendingRewards.find(entry => entry.source?.kind === "campaignTrophy");
  assert.equal(reward.source.legacyFragmentPacks, 2);
  assert.equal(reward.source.fragmentPacks, 1);
  assert.ok(reward.reward.crystals >= 25, "only fragments are prorated; Build308 boss currency is not");
  assert.equal(reward.reward.randomEquipmentRarity, "神話");
});

test("build302 trophy reward, claim marker, and host state all roll back on one failed settlement", () => {
  const context = started();
  for (const key of context.room.expedition.objects.filter(object => object.type === "campaignKey")) collectKey(context, key);
  const trophy = objectOf(context.room.expedition, "campaignTrophy");
  const beforeWorld = structuredClone(context.room.hostWorld);
  const beforeRewards = structuredClone(context.owner.session.pendingRewards);
  const beforeMessages = structuredClone(context.owner.session.pendingMessages);
  const commit = context.store._commitSettlementBatch.bind(context.store);
  context.store._commitSettlementBatch = () => false;

  const failed = touchTrophy(context);
  assert.equal(failed.code, "SETTLEMENT_PERSISTENCE");
  assert.equal(trophy.resolved, false);
  assert.equal(trophy.locksOpened, 0);
  assert.deepEqual(context.room.hostWorld, beforeWorld);
  assert.deepEqual(context.owner.session.pendingRewards, beforeRewards);
  assert.deepEqual(context.owner.session.pendingMessages, beforeMessages);

  context.store._commitSettlementBatch = commit;
  assert.equal(touchTrophy(context), undefined);
  assert.equal(trophy.resolved, true);
  assert.equal(context.owner.session.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy").length, 1);
  assert.deepEqual(context.room.hostWorld.claimedBossRewardFloors, [6]);
});

test("build302 replay pays all fragments in one claim but never pays a second mythic", () => {
  const first = started();
  for (const key of first.room.expedition.objects.filter(object => object.type === "campaignKey")) collectKey(first, key);
  touchTrophy(first);
  const saved = structuredClone(first.room.hostWorld);

  const replay = started({ hostWorld: saved, campaignReplay: true });
  const boss = objectOf(replay.room.expedition, "floorBoss");
  replay.store._startBattle(replay.room, boss);
  for (const enemy of replay.room.expedition.battle.enemies) enemy.hp = 0;
  assert.equal(replay.store._finishBattleVictory(replay.room, replay.room.expedition.battle).ok, true);
  for (const key of replay.room.expedition.objects.filter(object => object.type === "campaignKey")) collectKey(replay, key);
  touchTrophy(replay);

  const rewards = replay.owner.session.pendingRewards.filter(entry => entry.source?.kind === "campaignTrophy");
  assert.equal(rewards.length, 1);
  assert.equal(rewards[0].source.fragmentPacks, 3);
  assert.equal(rewards[0].source.fragmentAwards[0].amount, 12);
  assert.equal(rewards[0].source.firstClaim, false);
  assert.equal("randomEquipmentRarity" in rewards[0].reward, false);
  assert.deepEqual(replay.room.hostWorld.claimedBossRewardFloors, [6]);
});
