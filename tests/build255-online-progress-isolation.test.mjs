import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  captureLocalProgress,
  beginGuestProgressIsolation,
  finishGuestProgressIsolation,
  recoverInterruptedGuestProgress,
  onlineProgressionAllowed,
  legacyProgressRecoveryCandidate,
  applyLegacyProgressRecovery,
  undoLegacyProgressRecovery,
} from "../src/online/OnlineProgressIsolation.js";

function state() {
  return {
    flags: {
      abyssUnlocked: true, deepAbyssUnlocked: false,
      gameClear1000: false, ending1000Played: false,
      gameClear10000: false, ending10000Played: false,
      secondWorldEntered: false, tenGodObserved: false,
    },
    worldPhase: 0,
    player: {
      gold: 1200, crystals: 8, maxFloor: 21, currentFloor: 17, checkpoint: 11, inRun: false,
      nextShopFloor: 24, floorSeeds: { 17: 170 }, openedChests: { 17: ["local"] },
      bossRewards: { 10: true, 20: true }, pendingBossRewards: {}, bossKills: { 10: 1, 20: 1 },
      exploreRun: { id: null, floors: {} },
    },
    inventory: { potions: 2, captureCrystals: 3 },
    monsters: [{ id: "m1", level: 20, exp: 4, currentHp: 80, currentMp: 12 }],
    equipment: [{ id: "e1" }],
    records: { kills: 4, chests: 2 },
    returnRewards: { manual: { active: false, startFloor: 17, lastFloor: 17, floorsCleared: 0 } },
    secretRooms: { run: null, activeRoom: null }, biomeProgress: {}, floorBossChallenges: {}, secondWorld: {},
    onlineParty: {
      claimedRewards: ["before"], processedExpeditionResultIds: [], coopContributionHistory: [],
      firstCoopBossClears: [], activeExpeditionRunId: null, activeManualExploreRunId: null,
      activeExpeditionOwnerId: null,
      hostWorld: { ownerId: null, openedChestIds: {}, floorSeeds: {}, defeatedBossFloors: [], claimedBossRewardFloors: [] },
      progressIsolation: {},
    },
  };
}

test("snapshot capture fails closed for missing, null, or non-cloneable progression", () => {
  const missing = state();
  delete missing.player.openedChests;
  assert.equal(captureLocalProgress(missing), null);

  const nulled = state();
  nulled.player.exploreRun = null;
  assert.equal(captureLocalProgress(nulled), null);

  const unsafe = state();
  unsafe.player.exploreRun.floors.bad = { calculate: () => 1 };
  assert.equal(captureLocalProgress(unsafe), null);
  const entered = beginGuestProgressIsolation(unsafe, { roomId: "ROOM", ownerId: "host", selfId: "guest" });
  assert.deepEqual({ ok: entered.ok, captured: entered.captured, reason: entered.reason }, { ok: false, captured: false, reason: "SNAPSHOT_FAILED" });
  assert.equal(unsafe.onlineParty.progressIsolation.activeGuestSession, null);

  const cyclic = state();
  cyclic.player.exploreRun.floors.loop = cyclic.player.exploreRun;
  assert.equal(captureLocalProgress(cyclic), null);
});

test("large campaign progression creates a complete detached snapshot", () => {
  const value = state();
  value.player.floorSeeds = {};
  value.player.openedChests = {};
  for (let depth = 1; depth <= 10_000; depth += 1) {
    value.player.floorSeeds[depth] = depth * 17;
    value.player.openedChests[depth] = [`chest-${depth}-a`, `chest-${depth}-b`];
  }
  value.player.exploreRun = {
    id: "large-local-run",
    floors: Object.fromEntries(Array.from({ length: 2_000 }, (_, index) => [String(index + 1), { visited: true, steps: index + 3 }])),
  };
  const snapshot = captureLocalProgress(value);
  assert.ok(snapshot);
  assert.equal(Object.keys(snapshot.player.floorSeeds).length, 10_000);
  assert.equal(Object.keys(snapshot.player.openedChests).length, 10_000);
  assert.equal(Object.keys(snapshot.player.exploreRun.floors).length, 2_000);
  value.player.openedChests[10_000].push("late-mutation");
  value.player.exploreRun.floors[1].steps = 999;
  assert.deepEqual(snapshot.player.openedChests[10_000], ["chest-10000-a", "chest-10000-b"]);
  assert.equal(snapshot.player.exploreRun.floors[1].steps, 3);
});

test("guest reconnect/exit restores only local progression and keeps earned assets", () => {
  const value = state();
  assert.equal(beginGuestProgressIsolation(value, { roomId: "ROOM", ownerId: "host", selfId: "guest", runId: "run-1" }).captured, true);
  value.player.maxFloor = 201; value.player.currentFloor = 201; value.player.checkpoint = 200;
  value.player.floorSeeds[201] = 999; value.player.bossKills[200] = 1;
  value.flags.deepAbyssUnlocked = true;
  value.player.gold += 900; value.player.crystals += 4; value.inventory.potions += 3;
  value.monsters[0].level = 24; value.monsters[0].currentHp = 31; value.equipment.push({ id: "online-drop" });
  value.records.kills += 3; value.records.chests += 1;
  value.onlineParty.claimedRewards.push("run-1:floor-clear:guest");
  value.onlineParty.coopContributionHistory.push({ resultId: "run-1", score: 40 });

  const reconnect = beginGuestProgressIsolation(value, { roomId: "ROOM", ownerId: "host", selfId: "guest", runId: "run-1" });
  assert.equal(reconnect.captured, false);
  assert.deepEqual([value.player.maxFloor, value.player.currentFloor, value.player.checkpoint], [21, 17, 11]);
  assert.equal(value.player.bossKills[200], undefined);
  assert.deepEqual([value.player.gold, value.player.crystals, value.inventory.potions], [2100, 12, 5]);
  assert.deepEqual([value.monsters[0].level, value.monsters[0].currentHp], [24, 31]);
  assert.equal(value.equipment.at(-1).id, "online-drop");
  assert.equal(value.onlineParty.claimedRewards.at(-1), "run-1:floor-clear:guest");

  value.player.maxFloor = 500; value.player.currentFloor = 500;
  value.player.gold += 100; value.monsters[0].exp += 9;
  const exit = finishGuestProgressIsolation(value, { reason: "leave" });
  assert.equal(exit.restored, true);
  assert.deepEqual([value.player.maxFloor, value.player.currentFloor, value.player.checkpoint], [21, 17, 11]);
  assert.equal(value.player.gold, 2200);
  assert.equal(value.monsters[0].exp, 13);
  assert.equal(value.onlineParty.coopContributionHistory[0].score, 40);
  assert.deepEqual([value.records.kills, value.records.chests], [7, 3]);
  assert.equal(value.onlineParty.progressIsolation.activeGuestSession, null);
});

test("reload recovery is idempotent and preserves guest rewards", () => {
  const value = state();
  beginGuestProgressIsolation(value, { roomId: "ROOM", ownerId: "host", selfId: "guest" });
  value.player.maxFloor = 999; value.player.gold = 9999; value.monsters[0].level = 50;
  assert.equal(recoverInterruptedGuestProgress(value, 1234).restored, true);
  assert.equal(value.player.maxFloor, 21);
  assert.equal(value.player.gold, 9999);
  assert.equal(value.monsters[0].level, 50);
  assert.equal(value.onlineParty.progressIsolation.interruptedRecovery.reason, "reload");
  assert.equal(recoverInterruptedGuestProgress(value, 1235).restored, false);
});

test("progression events fail closed without an explicit matching owner", () => {
  const context = { selfId: "me", roomOwnerId: "me" };
  assert.equal(onlineProgressionAllowed({}, context), false);
  assert.equal(onlineProgressionAllowed({ worldOwnerId: "other" }, context), false);
  assert.equal(onlineProgressionAllowed({ worldOwnerId: "me", progressionEligible: false }, context), false);
  assert.equal(onlineProgressionAllowed({ worldOwnerId: "me" }, context), true);
  assert.equal(onlineProgressionAllowed({ worldOwnerId: "me" }, { selfId: "me", roomOwnerId: "other" }), false);
});

test("legacy contaminated floor can be repaired and undone without losing rewards", () => {
  const value = state();
  value.player.maxFloor = 201; value.player.currentFloor = 201; value.player.checkpoint = 11;
  value.onlineParty.claimedRewards.push("old-run:floor-clear:guest");
  value.onlineParty.firstCoopBossClears = [200];
  value.onlineParty.hostWorld.floorSeeds = { 200: 7, 201: 8 };
  value.onlineParty.hostWorld.defeatedBossFloors = [200];
  value.biomeProgress = {
    forgotten_forest: { visitedFloors: [12, 20], encounters: { slime: 2 }, openedChests: ["local-chest"], events: [], bossDefeated: true },
    deep_3_poison: { visitedFloors: [201], encounters: {}, openedChests: ["foreign"], events: [], bossDefeated: true },
  };
  value.floorBossChallenges = {
    discovered: { "floor-boss-200": true, "floor-boss-300": true }, encounters: { "floor-boss-200": 1, "floor-boss-300": 1 },
    victories: { "floor-boss-200": 1, "floor-boss-300": 1 }, fragments: { "floor-boss-300": 2 }, contracts: {}, processedResults: {},
  };
  value.secondWorld = { randomEvents: { resolvedFloors: [1001, 2001], counts: { shrine: 2 } } };
  const candidate = legacyProgressRecoveryCandidate(value);
  assert.ok(candidate);
  assert.equal(candidate.currentMax, 201);
  assert.equal(candidate.suggestedMax, 21);
  const repaired = applyLegacyProgressRecovery(value, candidate, 21, 2000);
  assert.equal(repaired.ok, true);
  assert.deepEqual([value.player.maxFloor, value.player.currentFloor], [21, 21]);
  assert.equal(value.onlineParty.hostWorld.floorSeeds[200], undefined);
  assert.deepEqual(value.biomeProgress.forgotten_forest.openedChests, ["local-chest"]);
  assert.equal(value.biomeProgress.deep_3_poison, undefined);
  assert.equal(value.floorBossChallenges.discovered["floor-boss-200"], undefined);
  assert.equal(value.floorBossChallenges.discovered["floor-boss-300"], true, "owned fragments stay usable");
  assert.deepEqual(value.secondWorld, {});
  value.player.gold += 777; value.monsters[0].level = 99;
  assert.equal(undoLegacyProgressRecovery(value).restored, true);
  assert.deepEqual([value.player.maxFloor, value.player.currentFloor], [201, 201]);
  assert.equal(value.player.gold, 1977);
  assert.equal(value.monsters[0].level, 99);
});

test("migration-derived ending flags do not legitimize a contaminated deep floor", () => {
  const value = state();
  value.player.maxFloor = 2001; value.player.currentFloor = 2001;
  value.flags.gameClear1000 = true; value.flags.secondWorldEntered = true; value.flags.deepAbyssUnlocked = true;
  value.onlineParty.claimedRewards.push("deep-host:floor-clear:guest");
  value.onlineParty.firstCoopBossClears = [1000, 2000];
  value.onlineParty.hostWorld.floorSeeds = { 2000: 4, 2001: 5 };
  value.onlineParty.hostWorld.defeatedBossFloors = [1000, 2000];
  const candidate = legacyProgressRecoveryCandidate(value);
  assert.ok(candidate);
  assert.equal(candidate.suggestedMax, 21);
});

test("explicitly self-owned online host progress is never offered as guest contamination", () => {
  const value = state();
  value.player.maxFloor = 31; value.player.currentFloor = 31;
  value.onlineParty.claimedRewards.push("owned-run:floor-clear:me");
  value.onlineParty.firstCoopBossClears = [30];
  value.onlineParty.hostWorld.ownerId = "me";
  value.onlineParty.hostWorld.floorSeeds = { 31: 3 };
  value.onlineParty.hostWorld.defeatedBossFloors = [30];
  assert.equal(legacyProgressRecoveryCandidate(value, { selfId: "me" }), null);
});

test("legacy repair refuses to erase an unrelated active local expedition", () => {
  const value = state();
  value.player.maxFloor = 201; value.player.currentFloor = 17; value.player.inRun = true;
  value.player.exploreRun = { id: "local-run", floors: { 17: { visited: true } } };
  value.returnRewards.manual = { active: true, startFloor: 17, lastFloor: 17, floorsCleared: 0, pendingGold: 88 };
  value.onlineParty.claimedRewards.push("old-online:floor-clear:guest");
  value.onlineParty.hostWorld.floorSeeds = { 201: 4 };
  const candidate = legacyProgressRecoveryCandidate(value);
  assert.ok(candidate);
  assert.equal(candidate.onlineRunAttached, false);
  const result = applyLegacyProgressRecovery(value, candidate, candidate.suggestedMax);
  assert.equal(result.reason, "ACTIVE_LOCAL_RUN");
  assert.equal(value.player.inRun, true);
  assert.equal(value.returnRewards.manual.pendingGold, 88);
});

test("main persistence gates floor unlock, boss first-clear, and host world by owner", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  const saveSource = await readFile(new URL("../src/services/SaveService.js", import.meta.url), "utf8");
  const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(index, /ASSET_VERSION = "2\.11\.82"/);
  assert.match(index, /ASSET_BUILD = "build258"/);
  assert.match(source, /progressionEligible=Boolean\(worldOwnerId\)&&worldOwnerId===selfId&&\(!roomOwnerId\|\|roomOwnerId===selfId\)&&source\.progressionEligible!==false,leaderFloorUnlock=progressionEligible\?/);
  assert.match(source, /source\.bossFirstClear&&progressionEligible/);
  assert.match(source, /legacyProgressRecoveryCandidate\(save\.state,\{selfId:ensureOnlinePartyController\(\)\.selfId\}\)/);
  assert.match(source, /save\.state\.player\?\.inRun&&!candidate\.onlineRunAttached/);
  assert.match(source, /if\(!ownsOnlineWorldProgress\(\{worldOwnerId:ownerId,progressionEligible:true\}\)\)return false/);
  assert.match(source, /return\{ok:true,ignored:true,guest:true\}/);
  assert.doesNotMatch(source, /candidates=\[\.\.\.\(Array\.isArray\(online\.firstCoopBossClears\)/);
  const recoveryIndex = saveSource.indexOf("recoverInterruptedGuestProgress(s);");
  const expeditionNormalizationIndex = saveSource.indexOf("s.expeditionSnapshot=normalizeExpeditionSnapshot(s.expeditionSnapshot);");
  const exploreRunNormalizationIndex = saveSource.indexOf("s.player.exploreRun=normalizeExploreRun(s.player.exploreRun);");
  assert.ok(recoveryIndex >= 0 && recoveryIndex < expeditionNormalizationIndex);
  assert.ok(recoveryIndex < exploreRunNormalizationIndex);
});
