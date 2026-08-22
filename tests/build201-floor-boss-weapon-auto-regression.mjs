import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

import {FLOOR_BOSS_CATALOG} from "../src/data/floorBosses.js";
import {chooseAutoSkill,effectiveSkillMpCost,learnedSkills,skillById} from "../src/battle/SkillSystem.js";
import {APP_VERSION,SAVE_SCHEMA_VERSION} from "../src/core/config.js";

const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const main=readFileSync(join(root,"src","main.js"),"utf8");
const index=readFileSync(join(root,"index.html"),"utf8");
const boss=FLOOR_BOSS_CATALOG.find(entry=>entry.dedicatedWeapon?.skill);
const weaponSkill=boss?.dedicatedWeapon?.skill;

assert.ok(weaponSkill,"floor-boss weapon skill fixture is required");
assert.deepEqual(skillById(weaponSkill.id),weaponSkill,"equipment-granted floor-boss skill must resolve by id");

for(const subslot of ["weaponRight","weaponLeft"]){
 const monster={
  id:`build201-${subslot}`,
  speciesId:"slime",
  level:100,
  rank:1,
  currentHp:100,
  currentMp:999,
  equipment:{[subslot]:"fixture-weapon"},
  equippedSkills:[weaponSkill.id,null,null,null],
  skillLoadoutInitialized:true,
  skillProgress:{},
  _equipmentSkills:[weaponSkill],
  _equipmentStats:{},
  _equipmentAffixes:{}
 };
 const cost=effectiveSkillMpCost(monster,weaponSkill);
 monster.currentMp=cost;
 assert.equal(learnedSkills(monster)[0]?.id,weaponSkill.id,`${subslot}: equipped skill must remain learned`);
 assert.equal(chooseAutoSkill(monster,{party:[monster],cooldowns:{}})?.id,weaponSkill.id,`${subslot}: auto AI must select the affordable weapon skill`);
 monster.currentMp=Math.max(0,cost-1);
 assert.equal(chooseAutoSkill(monster,{party:[monster],cooldowns:{}}),null,`${subslot}: auto AI must reject an unaffordable weapon skill`);
}

assert.match(main,/const equippedSkill=learnedSkills\(a\)\.find\(candidate=>candidate\.id===skillId\);let skill=equippedSkill\?\?skillById\(skillId\)/);
assert.match(main,/return command\("attack",null,\{skipRandomCircle:true\}\)/);
assert.match(index,/const ASSET_VERSION = "2\.11\.36";/);
assert.match(index,/const ASSET_BUILD = "build201";/);
assert.equal(APP_VERSION,"2.11.36");
assert.equal(SAVE_SCHEMA_VERSION,58);

console.log("build201 floor-boss weapon auto regression: PASS (right/left + MP fallback)");
