import test from "node:test";
import assert from "node:assert/strict";
import { personalBonusDraw } from "../src/OnlineExpansion207.js";
import { firstClearEquipmentRarity } from "../src/OnlineExpansion207.js";
import { raidVictoryRewardBase } from "../src/RaidCoordinator.js";
import { coopFloorTier } from "../src/CoopGimmicks.js";

test("build301 personal co-op GOLD uses campaign-to-legacy depth", () => {
  const rolls = [0, 0];
  const low = personalBonusDraw(() => rolls.shift() ?? 0, { floor: 1 });
  const highRolls = [0, 0];
  const high = personalBonusDraw(() => highRolls.shift() ?? 0, { floor: 100 });
  assert.equal(low.reward.gold, (10 + 10) * 130);
  assert.equal(high.reward.gold, (1000 + 10) * 130);
  assert.ok(high.reward.gold > low.reward.gold * 50);
});

test("build301 weekly raid reward uses campaign-to-legacy depth", () => {
  assert.deepEqual(raidVictoryRewardBase(1), {
    depth: 150,
    gold: 1_495_000,
    crystals: 69,
    experience: 99_000,
    raidMaterials: 80,
  });
  assert.deepEqual(raidVictoryRewardBase(100), {
    depth: 1000,
    gold: 8_720_000,
    crystals: 205,
    experience: 558_000,
    raidMaterials: 80,
  });
  assert.deepEqual(raidVictoryRewardBase(50, 1.3), {
    depth: 500,
    gold: 5_811_000,
    crystals: 163,
    experience: 374_400,
    raidMaterials: 104,
  });
});

test("build301 co-op reward tiers span the full 100-floor campaign", () => {
  assert.equal(coopFloorTier(1).id, "black-iron");
  assert.equal(coopFloorTier(10).id, "silver");
  assert.equal(coopFloorTier(50).id, "gold");
  assert.equal(coopFloorTier(100).id, "abyss");
  assert.equal(firstClearEquipmentRarity(1), "R");
  assert.equal(firstClearEquipmentRarity(10), "SSR");
  assert.equal(firstClearEquipmentRarity(50), "UR");
  assert.equal(firstClearEquipmentRarity(100), "LR");
});
