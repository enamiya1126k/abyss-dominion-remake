import test from "node:test";
import assert from "node:assert/strict";

import { createSoloStyleDungeon } from "../src/OfflineDungeonRules.js";
import { RoomStore } from "../src/RoomStore.js";

test("build305 floor bosses and their companions never become mimics", () => {
  const dungeon = createSoloStyleDungeon({ roomId: "BOSS", floor: 100, runId: "run", now: 1, random: () => 0 });
  const bossObject = dungeon.objects.find(object => object.bossEncounter);
  assert.ok(bossObject, "the current campaign places a boss on every floor");
  assert.notEqual(bossObject.mimic, true);
  assert.equal(dungeon.objects.filter(object => object.type === "chest").every(object => object.mimic == null || typeof object.mimic === "boolean"), true);

  const battle = { id: "build305-floor-boss", floor: 100, floorBoss: true, forceSpeciesId: "mimic" };
  const members = [{ coopVitals: { hp: 100 }, profile: { battleStats: { hp: 100 } } }];
  const enemies = RoomStore.prototype._createBattleEnemies.call({}, battle, members, 1);
  assert.ok(enemies.length >= 1);
  assert.equal(enemies.every(enemy => enemy.boss && enemy.speciesId !== "mimic" && !enemy.enemyMimicArmor), true);
});

test("build260 treasure rooms cap mimics at two", () => {
  const dungeon = createSoloStyleDungeon({ roomId: "TREASURE", floor: 201, runId: "run", now: 1, random: () => 0 });
  assert.equal(dungeon.treasureRoom, true);
  const chests = dungeon.objects.filter(object => object.type === "chest");
  assert.ok(chests.length >= 6 && chests.length <= 8);
  assert.equal(chests.filter(chest => chest.mimic).length, 2);
});

test("build260 server chest contract preserves mythic level and plus", () => {
  const fakeStore = { random: () => .5 };
  const reward = RoomStore.prototype._offlineChestReward.call(fakeStore, 50, { kind: "radiant", locked: true, treasureRoom: true }, { profile: {} });
  assert.equal(reward.randomEquipmentRarity, "神話");
  assert.ok(reward.equipmentLevel >= 900 && reward.equipmentLevel <= 1200);
  assert.ok(reward.equipmentPlus >= 12);
  assert.ok(reward.gold > 0 && reward.crystals >= 5);
});

test("build260 online mimic uses the shorter chest-only combat profile", () => {
  const battle = { id: "build260-mimic", floor: 300, forceSpeciesId: "mimic", treasureMimic: true, floorBoss: false };
  const members = [{ coopVitals: { hp: 100 }, profile: { battleStats: { hp: 100 } } }];
  const [mimic] = RoomStore.prototype._createBattleEnemies.call({}, battle, members, 1);
  assert.equal(mimic.speciesId, "mimic");
  assert.equal(mimic.hp, 5);
  assert.equal(mimic.maxHp, 5);
  assert.equal(mimic.evasion, 24);
  assert.equal(mimic.enemyMimicArmor, true);
  assert.equal(mimic.treasureMimic, true);
});
