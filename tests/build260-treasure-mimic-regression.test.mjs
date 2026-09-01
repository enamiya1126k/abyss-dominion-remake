import test from "node:test";
import assert from "node:assert/strict";

import { SPECIES } from "../src/data/species.js";
import { eligibleEncounterSpecies } from "../src/core/EncounterPoolSystem.js";
import {
  TREASURE_BALANCE_VERSION,
  TREASURE_ROOM_MIMIC_MAX,
  mimicExperienceMultiplier,
  mimicVictoryCrystals,
  mimicVictoryGold,
  rollTreasureChestReward,
  treasureRoomRateForFloor,
} from "../src/core/TreasureSystem.js";

test("build260 makes treasure rooms rare and bounded", () => {
  assert.equal(TREASURE_BALANCE_VERSION, 200);
  assert.equal(treasureRoomRateForFloor(1), .005);
  assert.equal(treasureRoomRateForFloor(99), .005);
  assert.equal(treasureRoomRateForFloor(100), .0055);
  assert.equal(treasureRoomRateForFloor(500), .0075);
  assert.equal(treasureRoomRateForFloor(1000), .01);
  assert.equal(treasureRoomRateForFloor(9999), .01);
  assert.equal(TREASURE_ROOM_MIMIC_MAX, 2);
});

test("build260 locked chests always give mythic, high-level equipment", () => {
  for (let index = 0; index < 100; index++) {
    let seed = index + 1;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const reward = rollTreasureChestReward({ floor: 400, kind: "radiant", locked: true, random, baseGold: 100 });
    assert.equal(reward.equipment?.rarity, "神話");
    assert.ok(reward.equipment.level >= 720 && reward.equipment.level <= 960);
    assert.ok(reward.gold >= 800);
    assert.ok(reward.crystals >= 5);
  }
});

test("build260 every normal chest has a guaranteed useful reward", () => {
  const apple = rollTreasureChestReward({ floor: 80, kind: "apple", random: () => .99, baseGold: 50 });
  const box = rollTreasureChestReward({ floor: 80, kind: "box", random: () => .99, baseGold: 50 });
  const cabinet = rollTreasureChestReward({ floor: 80, kind: "cabinet", random: () => .99, baseGold: 50 });
  const radiant = rollTreasureChestReward({ floor: 80, kind: "radiant", random: () => .99, baseGold: 50 });
  assert.equal(apple.potions, 2);
  assert.ok(apple.gold > 0 && box.gold > 0 && cabinet.gold > 0 && radiant.gold > 0);
  assert.ok(cabinet.equipment && radiant.equipment);
  assert.ok(["SR", "SSR", "UR", "LR"].includes(cabinet.equipment.rarity));
  assert.ok(["UR", "LR", "神話"].includes(radiant.equipment.rarity));
});

test("build260 mimic is chest-only and pays jackpot rewards", () => {
  assert.equal(SPECIES.mimic.fieldEncounter, false);
  assert.equal(eligibleEncounterSpecies(SPECIES, 9999).some(species => species.id === "mimic"), false);
  assert.equal(mimicExperienceMultiplier(), 8);
  assert.ok(mimicVictoryGold(200, 1000) >= 12000);
  assert.ok(mimicVictoryCrystals(200, () => 0) >= 12);
});
