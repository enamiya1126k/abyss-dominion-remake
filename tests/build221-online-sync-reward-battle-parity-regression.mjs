import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RoomStore } from "../online-server/src/RoomStore.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(resolve(root, path), "utf8");
const room = read("online-server/src/RoomStore.js");
const screen = read("src/ui/screens/OnlinePartyScreen.js");

assert.match(room, /canonicalAttribute,attributeDamageMultiplier/);
assert.match(room, /code:"UNCAPTURABLE"/);
assert.match(room, /_captureChance\(battle,actor,enemy\)/);
assert.match(room, /species\?\.captureRate/);
assert.match(room, /attributeDamageMultiplier\(attackElement,targetElement\)/);
assert.match(room, /_battleEnvironmentFactor\(battle\.floor,attackElement\)/);
assert.match(room, /damageClass:chosenSkill\?\.damageClass/);
assert.match(room, /defenseIgnore:chosenSkill\?\.defenseIgnore/);
assert.match(room, /chosenSkill\.drain/);
assert.match(room, /chosenSkill\.selfHeal/);
assert.match(room, /chosenSkill\.barrier/);
assert.match(room, /skill\.cleanse/);
assert.match(room, /sharedBase=\{gold:battleGoldBase\(battle\.floor,defeated,\{firstBoss\}\)\}/);
assert.match(room, /reward:\{\.\.\.sharedReward,gold,experience,crystals,abyssKeys,kills:defeated\.length/);
assert.match(room, /randomEquipmentRarity,equipmentSlot,equipmentLevel/);
assert.match(room, /type:"battleDefeated"/);

for (const token of ["guaranteedCritical", "defenseIgnore", "critBonus", "drain", "selfHeal", "currentHpDamage", "execute", "barrier", "cleanse"]) {
  assert.match(screen, new RegExp(token));
}
assert.match(screen, /\["stance", "buff", "cleanse"\]/);

const store = new RoomStore({ random: () => 0.5 });
const actor = { level: 50 };
const enemy = { speciesId: "slime", level: 50, hp: 10, maxHp: 100, boss: false, uncapturable: false };
const chance = store._captureChance({ floor: 10 }, actor, enemy);
assert.ok(chance > 0.18 && chance <= 0.65);
assert.equal(store._captureChance({ floor: 10 }, actor, { ...enemy, boss: true, uncapturable: true }), 0);

const physicalTarget = { def: 200, mdef: 20, maxHp: 1000, effects: [] };
const physical = store._damageToEnemy(100, physicalTarget, 1, 0, { damageClass: "physical", defenseIgnore: 0 }).value;
const magic = store._damageToEnemy(100, physicalTarget, 1, 0, { damageClass: "magic", defenseIgnore: 0 }).value;
assert.ok(magic > physical, "magic damage should use MDEF rather than DEF");

console.log("build221 online sync/reward/battle parity regression: ok");
