import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

import {compatibleSubslots} from "../src/data/equipment.js";
import {createEquipment} from "../src/models/Equipment.js";
import {assignEquipmentToSubslot,normalizeEquipmentLoadouts} from "../src/services/EquipmentLoadoutSystem.js";
import {affixOutgoingDamageMultiplier,skillEffectSummary,skillMpCostBreakdown} from "../src/battle/SkillSystem.js";
import {APP_VERSION,SAVE_SCHEMA_VERSION} from "../src/core/config.js";

const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>readFileSync(join(root,relative),"utf8");
const main=read("src/main.js"),battleScreen=read("src/ui/screens/BattleScreen.js"),equipmentScreen=read("src/ui/screens/EquipmentScreen.js"),css=read("src/Styles/build210.css"),index=read("index.html");

for(const handedness of["right","left","twoHanded","either"]){
 const item={id:`fixture-${handedness}`,slot:"weapon",handedness,ruleOverrides:{subslot:handedness==="left"?"weaponLeft":"weaponRight"}};
 assert.deepEqual(compatibleSubslots(item),["weaponRight","weaponLeft"],`${handedness} weapon must fit both hands`);
}

const generated=createEquipment("weapon",{handedness:"twoHanded"});
assert.equal(generated.handedness,"either","new weapons must use the retired-handedness save value");

const monster={id:"build210-owner",speciesId:"slime",level:100,equipment:{weaponRight:"weapon-a",weaponLeft:"weapon-b"}};
const state={party:[monster.id],monsters:[monster],equipment:[
 {id:"weapon-a",slot:"weapon",handedness:"twoHanded",level:1,stats:{atk:10},ruleOverrides:{}},
 {id:"weapon-b",slot:"weapon",handedness:"left",level:1,stats:{matk:10},ruleOverrides:{}}
]};
normalizeEquipmentLoadouts(state);
assert.equal(monster.equipment.weaponRight,"weapon-a");
assert.equal(monster.equipment.weaponLeft,"weapon-b","legacy two-handed weapons must no longer clear the left slot");

assert.equal(assignEquipmentToSubslot(state,"weapon-a",monster.id,"weaponLeft").ok,true);
assert.equal(monster.equipment.weaponRight,null,"moving one physical item must clear its former hand");
assert.equal(monster.equipment.weaponLeft,"weapon-a");
assert.equal(assignEquipmentToSubslot(state,"weapon-b",monster.id,"weaponRight").ok,true);
assert.equal(monster.equipment.weaponRight,"weapon-b");
assert.equal(monster.equipment.weaponLeft,"weapon-a","two distinct weapons must coexist");

const caster={speciesId:"slime",level:20,rank:1,currentMp:100,skillProgress:{},_equipmentStats:{},_equipmentAffixes:{mpCostReduction:8}};
const cost=skillMpCostBreakdown(caster,{id:"build210-mp",mp:25});
assert.deepEqual({before:cost.beforeEquipment,after:cost.final,reduction:cost.equipmentReduction},{before:25,after:23,reduction:8});
assert.equal(skillEffectSummary({type:"cleanse",target:"味方全体"}),"味方全体の状態異常・弱体効果をすべて解除","cleanse-type skills must never fall back to flavor prose");
assert.equal(affixOutgoingDamageMultiplier({_affixes:{allElementDamage:15,fireDamage:10}},{boss:false},"fire"),1.25,"all-element and matching-element authorities must both change real damage");

assert.match(main,/appliedAuthorities=new Set\(\)/,"duplicate named authorities must be deduplicated");
assert.match(main,/Object\.defineProperty\(m,"_equipmentAuthorities"/);
assert.match(main,/装備固有能力｜\$\{mpAuthorities\.map/);
assert.match(main,/battleSkillMechanics\(skill\)/,"cinematic subtitle must use computed mechanics");
assert.match(battleScreen,/【装備技】/);
assert.match(battleScreen,/renderBiomeBadge\(battle\.biomeBattle\)/);
assert.match(battleScreen,/environment\.favorable/);
assert.match(battleScreen,/environment\.adverse/);
assert.match(equipmentScreen,/function handLabel\(item\)\{return item\.slot!=="weapon"\?"":"左右対応"\}/);
assert.match(css,/\.battle-banner-actor/);
assert.match(css,/\.equipment-authority-badge/);
assert.match(css,/\.battle-biome-attribute/);
assert.match(index,/build210\.css\?v=2\.11\.45-build210/);
assert.match(index,/ASSET_BUILD = "build210"/);
assert.equal(APP_VERSION,"2.11.45");
assert.equal(SAVE_SCHEMA_VERSION,58);

console.log("build210 equipment/battle clarity regression: PASS");
