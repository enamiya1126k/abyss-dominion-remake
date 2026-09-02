import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { campaignFloorToLegacyDepth } from "../src/CampaignFloorScale.js";
import { floorEnemyStats } from "../src/OfflineDungeonRules.js";
import { RoomStore } from "../src/RoomStore.js";
import { enemyLevelForFloor } from "../../src/core/EnemyScalingSystem.js";
import { chestGoldBase } from "../../src/core/GoldEconomySystem.js";
import { rollTreasureChestReward, treasureRoomRateForFloor } from "../../src/core/TreasureSystem.js";

const constantRandom = () => .5;

test("build301 online campaign 1F/50F/100F use legacy depth 10F/500F/1000F for scaling", () => {
  const store = new RoomStore({ random: constantRandom });
  for (const [floor, depth] of [[1, 10], [50, 500], [100, 1000]]) {
    assert.equal(campaignFloorToLegacyDepth(floor), depth);
    const stats = floorEnemyStats({ floor, template: { id: "slime" }, random: constantRandom });
    assert.equal(stats.level, enemyLevelForFloor(depth, .5), `${floor}F enemy level`);
    assert.equal(store._rewardFor(floor, "completion").gold, Math.max(300, Math.round(300 + depth * 35)), `${floor}F completion gold`);

    const object = { kind: "box", locked: false, treasureRoom: true };
    const expectedPlan = rollTreasureChestReward({ floor: depth, ...object, luck: 0, random: constantRandom, baseGold: chestGoldBase(depth) });
    const expectedReward = { gold: expectedPlan.gold, potions: expectedPlan.potions, crystals: expectedPlan.crystals };
    if (expectedPlan.equipment) Object.assign(expectedReward, {
      randomEquipmentRarity: expectedPlan.equipment.rarity,
      equipmentSlot: expectedPlan.equipment.slot,
      equipmentLevel: expectedPlan.equipment.level,
      equipmentPlus: expectedPlan.equipment.plus,
    });
    assert.deepEqual(store._offlineChestReward(floor, object), expectedReward, `${floor}F chest roll`);
    assert.equal(treasureRoomRateForFloor(campaignFloorToLegacyDepth(floor)), treasureRoomRateForFloor(depth));
  }
});

test("build301 server routes every depth-sensitive online economy call through the campaign depth adapter", () => {
  const source = readFileSync(new URL("../src/RoomStore.js", import.meta.url), "utf8");
  for (const snippet of [
    "rollEnemyMagicCircle(campaignFloorToLegacyDepth(battle.floor)",
    "battleGoldBase(campaignFloorToLegacyDepth(battle.floor)",
    "chestGoldBase(campaignFloorToLegacyDepth(expedition.floor))",
    "campaignFloorToLegacyDepth(battle.floor));if(geared",
    "legacyMimicVictoryCrystals(campaignFloorToLegacyDepth(floor)",
  ]) assert.equal(source.includes(snippet), true, `missing adapter: ${snippet}`);
});

test("build301 campaign depth adapter clamps out-of-range display floors", () => {
  assert.equal(campaignFloorToLegacyDepth(-5), 10);
  assert.equal(campaignFloorToLegacyDepth(0), 10);
  assert.equal(campaignFloorToLegacyDepth(101), 1000);
  assert.equal(campaignFloorToLegacyDepth(9999), 1000);
});
