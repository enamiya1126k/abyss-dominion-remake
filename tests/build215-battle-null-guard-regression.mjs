import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createMonster, calculatedStats, displayName, expNeedFor, unlockedSkills } from "../src/models/Monster.js";
import { learnedSkills, maxMp } from "../src/battle/SkillSystem.js";
import { buildTurnQueue, currentAlly, skipInvalidEntries } from "../src/battle/TurnSystem.js";
import { BattleScreen } from "../src/ui/screens/BattleScreen.js";

assert.equal(displayName(null), "不明な魔物");
assert.deepEqual(calculatedStats(null), { hp: 1, atk: 1, matk: 1, def: 0, mdef: 0, spd: 1, crit: 0, evasion: 0, accuracy: 100 });
assert.ok(expNeedFor(null) >= 25);
assert.deepEqual(unlockedSkills(null), []);
assert.equal(maxMp(null), 0);
assert.deepEqual(learnedSkills(null), []);

const monster = createMonster("slime", { level: 5 });
const stats = calculatedStats(monster);
monster.currentHp = stats.hp;
monster.currentMp = maxMp(monster);
const enemy = { id: "enemy-test", speciesId: "slime", name: "テストスライム", level: 5, hp: 10, maxHp: 10, atk: 1, def: 0, spd: 1, color: "#fff" };
const battle = {
  party: [null, monster], enemies: [enemy], enemy, targetEnemyId: enemy.id,
  turn: 1, turnQueue: [], queueIndex: 0, guards: {}, cooldowns: {},
  enemyStatuses: {}, allyAilments: {}, allyEffects: {}, enemyEffects: {},
  species: {}, log: [], auto: false, busy: false, magicCircleProfiles: {}, magicCircleArt: {},
};

assert.doesNotThrow(() => buildTurnQueue(battle));
assert.equal(battle.turnQueue.filter(entry => entry.type === "ally").length, 1);
assert.doesNotThrow(() => skipInvalidEntries(battle));
assert.equal(currentAlly(battle)?.id, monster.id);
assert.doesNotThrow(() => BattleScreen(battle, { captureCrystals: 0 }, { battleSpeed: 1 }, 1));

const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
assert.match(main, /function sanitizeBattleParty\(\)/);
assert.match(main, /sanitizeBattleParty\(\);\n if\(battle\.busy/);
assert.match(index, /ASSET_VERSION = "2\.11\.50"/);
assert.match(index, /ASSET_BUILD = "build215"/);

console.log("build215 battle null-guard regression: ok");
