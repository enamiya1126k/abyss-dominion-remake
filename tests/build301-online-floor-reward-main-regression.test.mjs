import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");

function between(start, end) {
  const from = main.indexOf(start), to = main.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `missing source range: ${start} -> ${end}`);
  return main.slice(from, to);
}

test("build301 campaign trophy equipment is dedicated for normal bosses and signature gear for milestones", () => {
  const source = between("function stableRewardIndex", "function applyOnlineCampaignTrophyFragments");
  const signatureCalls = [], dedicatedCalls = [];
  const factory = new Function(
    "CAMPAIGN_MAX_FLOOR", "ENDGAME_BOSSES", "milestoneBossIdsForFloor", "createSignatureEquipment",
    "dedicatedFloorBossEquipment", "bossRewardEquipment", "campaignFloorToLegacyFloor", "equipmentDropLevelForFloor",
    `${source}; return campaignTrophyEquipment;`,
  )(
    100,
    { abyss_pride: { faction: "abyss" }, ten_dominion: { faction: "tenGod" } },
    floor => floor === 70 ? ["abyss_pride"] : floor === 100 ? ["ten_dominion"] : [],
    (ownerId, pieceIndex) => { signatureCalls.push({ ownerId, pieceIndex }); return { name: ownerId, rarity: ownerId.startsWith("ten_") ? "十神" : "深淵", slot: "weapon", plus: 0 }; },
    (floor, boss, piece) => { dedicatedCalls.push({ floor, boss, piece }); return { name: "normal-dedicated", rarity: "神話", slot: piece, plus: 0, ruleOverrides: { floorBossDedicated: true } }; },
    () => { throw new Error("normal campaign trophy unexpectedly fell back to generic boss gear"); },
    floor => floor * 10,
    floor => floor,
  );

  const normal = factory({ floor: 31, boss: { floorBossCatalogId: "floor-boss-310" }, rewardId: "normal" });
  assert.equal(normal.ruleOverrides.floorBossDedicated, true);
  assert.equal(dedicatedCalls.length, 1);
  const abyss = factory({ floor: 70, boss: { endgameBossId: "abyss_pride" }, rewardId: "abyss", level: 700 });
  const tenGod = factory({ floor: 100, boss: { endgameBossId: "ten_dominion" }, rewardId: "ten", level: 1000 });
  assert.deepEqual(signatureCalls.map(call => call.ownerId), ["abyss_pride", "ten_dominion"]);
  assert.equal(abyss.rarity, "深淵");
  assert.equal(tenGod.rarity, "十神");
  assert.equal(tenGod.obtainedMethod, "campaignTrophyChest");
});

test("build301 online trophy claims apply authoritative fragmentAwards for every boss exactly once", () => {
  const source = between("function applyOnlineCampaignTrophyFragments", "function claimOnlinePartyReward");
  const save = { state: {} }, endgame = Object.fromEntries(["ten_dominion", "ten_creation", "ten_end", "ten_divinity"].map(id => [id, {}])), applied = [];
  const apply = new Function(
    "campaignTrophyFragmentAwards", "ENDGAME_BOSSES", "awardEmergencyFragments", "save",
    `${source}; return applyOnlineCampaignTrophyFragments;`,
  )(
    () => { throw new Error("authoritative fragmentAwards must not be recomputed"); },
    endgame,
    (_state, bossId, won, resultId, amount) => applied.push({ bossId, won, resultId, amount }),
    save,
  );
  const awards = [
    ...Object.keys(endgame).map(id => ({ id, amount: 10, boss: { endgameBossId: id } })),
    { id: "floor-boss-310", amount: 5, boss: { floorBossCatalogId: "floor-boss-310" } },
  ];
  apply({ rewardId: "reward-1", floor: 100, source: { fragmentAwards: awards } });
  assert.deepEqual(applied.map(entry => [entry.bossId, entry.amount]), Object.keys(endgame).map(id => [id, 10]));
  assert.equal(save.state.floorBossChallenges.fragments["floor-boss-310"], 5);
});

test("build301 host campaign progress merges forward and an explicit new replay resets only run-scoped fields", () => {
  const source = between("function normalizedOnlineCampaignProgress", "function persistOnlineHostWorld");
  const entry = { runId: "run-a", keyIds: ["key-a"], keysCollected: 1, trophyLocksOpened: 1, trophyClaimed: false, hotSpringUsed: false, bossDiscovered: true, bossDefeated: true, exitUnlocked: true, visitedRoomIds: ["room"], postBossSpawns: {} };
  const save = { state: { player: { bossRewards: {} } } };
  const functions = new Function(
    "CAMPAIGN_KEYS_PER_FLOOR", "save", "campaignFloorState",
    `${source}; return { mergeOnlineCampaignProgress, mergeOnlineCampaignProgressIntoLocal };`,
  )(3, save, () => entry);

  functions.mergeOnlineCampaignProgressIntoLocal(42, { runId: "run-a", keysCollected: 2, trophyLocksOpened: 2, collectedKeyIds: ["key-b"], hotSpringUsed: true });
  assert.equal(entry.keysCollected, 2);
  assert.equal(entry.trophyLocksOpened, 2);
  assert.equal(entry.hotSpringUsed, true);
  functions.mergeOnlineCampaignProgressIntoLocal(42, { runId: "run-replay", keysCollected: 1, trophyLocksOpened: 0, collectedKeyIds: ["replay-key"], trophyMythicClaimed: true, replayActive: true, bossDefeatedThisRun: false });
  assert.equal(entry.runId, "run-replay");
  assert.deepEqual(entry.keyIds, ["replay-key"]);
  assert.equal(entry.bossDefeated, false);
  assert.equal(entry.trophyClaimed, true, "replay cannot restore the first-clear signature entitlement");
});

test("build301 main retires legacy choices and makes 100F boss clear a final gate, not a true ending", () => {
  assert.doesNotMatch(main, /function (?:prepareOnlineFloorBossReward|repairMissedOnlineFloorBossRewards|resumePendingBossReward|showBossRewards)\b/);
  assert.equal(main.match(/build194-floor-boss-three-choice/g)?.length, 1, "the legacy format may appear only in the one-way retirement filter");
  assert.match(main, /if\(retireLegacyCampaignBossRewardChoices\(\)\)save\.save\(\)/);
  const persist = between("function persistOnlineHostWorld", "function onlineExploreMonster");
  assert.match(persist, /source\.campaignFloorStates/);
  assert.match(persist, /defeatCampaignBoss\(save\.state,floor\)/);
  assert.match(persist, /if\(floor===CAMPAIGN_MAX_FLOOR\)mark1000FloorCleared\(save\.state\)/);
  assert.doesNotMatch(persist, /mark10000FloorCleared/);
  assert.match(persist, /if\(!save\.save\(\)\)\{save\.state=backup/);
  const offlineTrophy = between("function showCampaignTrophyReveal", "function interactExploreDecoration");
  assert.match(offlineTrophy, /equipmentDisplayRarity\(equipment\)/);
  assert.match(offlineTrophy, /campaignTrophyEquipment\(/);
});
