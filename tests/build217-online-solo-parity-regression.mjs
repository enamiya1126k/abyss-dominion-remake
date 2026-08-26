import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RoomStore } from "../online-server/src/RoomStore.js";
import { ATTRIBUTE_RELATIONS } from "../src/data/attributes.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(resolve(root, path), "utf8");
const roomStoreSource = read("online-server/src/RoomStore.js");
const dungeonRulesSource = read("online-server/src/OfflineDungeonRules.js");
const raidSource = read("online-server/src/RaidCoordinator.js");
const battleSource = read("src/ui/screens/BattleScreen.js");
const visualSource = read("src/ui/MonsterVisual.js");
const clientSource = read("src/online/OnlinePartyClient.js");
const indexSource = read("index.html");
const configSource = read("src/core/config.js");

assert.match(indexSource, /build217\.css\?v=2\.11\.52-build217/);
assert.match(indexSource, /build225\.css\?v=2\.11\.54-build225/);
assert.match(indexSource, /ASSET_BUILD = "build225"/);
assert.match(configSource, /APP_VERSION="2\.11\.54"/);

assert.match(roomStoreSource, /floorBossDefinitionForFloor,milestoneBossIdsForFloor/);
assert.match(roomStoreSource, /const templates=boss\?floorBossTemplates217\(floor\)/);
assert.match(roomStoreSource, /partyHpScale=partySize>=2\?1\+\(partySize-1\)\*\.82:1/);
assert.match(dungeonRulesSource, /if \(bossFloor\) add\("encounter", layout\.boss, 1, \{ bossEncounter: true \}\)/);
assert.match(dungeonRulesSource, /ONLINE_ENEMY_HP_DIVISOR = 1/);

const store = new RoomStore({ now: () => 123456, random: () => .5 });
const member = { coopVitals: { hp: 100 }, profile: { battleStats: { hp: 100 } } };
const enemiesAt = floor => store._createBattleEnemies({ id: `build217-${floor}`, floor, floorBoss: true }, [member], 1);
assert.equal(store._createBattleEnemies({ id: "build217-solo", floor: 1 }, [member], 1)[0].coopPartyScale, 1);
assert.ok(Math.abs(store._createBattleEnemies({ id: "build217-coop", floor: 1 }, [member, member], 1)[0].coopPartyScale - 1.82) < 1e-9);
const floor50 = enemiesAt(50), floor100 = enemiesAt(100), floor1000 = enemiesAt(1000);
assert.equal(floor50.length, 1);
assert.equal(floor50[0].name, "星祷の命紡ぎ");
assert.equal(floor50[0].floorBossCatalogId, "floor-boss-50");
assert.ok(floor50[0].battleActions.length >= 4);
assert.equal(floor100[0].endgameBossId, "abyss_gluttony");
assert.match(floor100[0].name, /^深淵/);
assert.equal(floor1000[0].endgameBossId, "ten_time");
assert.match(floor1000[0].name, /^十神/);

assert.deepEqual(ATTRIBUTE_RELATIONS.light, { strong: ["dark"], weak: ["dark"] });
assert.deepEqual(ATTRIBUTE_RELATIONS.dark, { strong: ["light"], weak: ["light"] });
assert.match(battleSource, /環境強化/);
assert.match(battleSource, /環境弱体/);
assert.match(battleSource, /攻撃有効/);
assert.doesNotMatch(battleSource, /class="(?:ally|enemy)-formation-label"/);

assert.match(battleSource, /skillCombatKeywords\(skill\)/);
assert.doesNotMatch(battleSource, /onlineDescription\s*\|\|\s*skill\.description/);

for (const family of ["abyss-amalga", "juvenile-amalga"]) {
  for (const frame of ["idle1", "idle2", "idle3", "walk1", "walk2", "attack", "damage", "down"]) {
    assert.ok(existsSync(resolve(root, `assets/online/raid/${family}-${frame}.png`)), `${family}-${frame}.png is required`);
  }
}
assert.match(raidSource, /visualBase:"\.\/assets\/online\/raid\/abyss-amalga"/);
assert.match(raidSource, /visualBase:"\.\/assets\/online\/raid\/juvenile-amalga"/);
assert.doesNotMatch(raidSource, /abyss-amalga\.png/);
assert.match(visualSource, /IDLE_FRAMES=Object\.freeze\(\["idle1","idle2","idle3","idle2"\]\)/);
assert.match(clientSource, /setMonsterVisualFrame\(actor,"attack"\)/);
assert.match(clientSource, /setMonsterVisualFrame\(target,"damage"\)/);
assert.match(clientSource, /setMonsterVisualFrame\(target,"down"\)/);

assert.match(roomStoreSource, /captureCrystalCost:1/);
console.log("build217 online solo parity regression: ok");
