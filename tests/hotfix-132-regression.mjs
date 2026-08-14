import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

import{APP_VERSION,SAVE_SCHEMA_VERSION,TRUE_MAX_LEVEL}from"../src/core/config.js";
import{SPECIES}from"../src/data/species.js";
import{ENDGAME_BOSSES,shouldTriggerEmergency,teamBattleRewardPreview}from"../src/core/EndgameSystem.js";
import{createMonster,expNeedFor,experienceCrystalValue,applyTotalExperience}from"../src/models/Monster.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

assert.equal(APP_VERSION,"2.7.0");
assert.equal(SAVE_SCHEMA_VERSION,53);
assert.equal(TRUE_MAX_LEVEL,10000);

const newIds=["eraser_slime","pushpin_roller","pencil_mouse","stapler_crab","compass_beetle","gluepot_mimic","fountain_pen_mage","correction_ghost","scissor_mantis","pencilcase_parade","chalkboard_dragon","forbidden_paper_cutter","ochuki","bechi","kiara","roxy","milim","ai","eris","golden_darkness"];
assert.equal(newIds.length,20);
for(const id of newIds)assert.ok(SPECIES[id],`missing new species ${id}`);

assert.equal(Object.values(ENDGAME_BOSSES).filter(boss=>boss.faction==="abyss").length,7);
assert.equal(Object.values(ENDGAME_BOSSES).filter(boss=>boss.faction==="tenGod").length,10);

for(const speciesId of["slime","ancient_dragon"]){
 const monster=createMonster(speciesId,{level:1});
 applyTotalExperience(monster,experienceCrystalValue(monster)*50);
 assert.equal(monster.level,10000,`${speciesId} must reach level 10000 with 50 crystals`);
}
const ordinary={speciesId:"slime",level:500},endgame={speciesId:"slime",level:500,endgameFaction:"abyss"};
const ratio=expNeedFor(endgame)/expNeedFor(ordinary);
assert.ok(ratio>4.99&&ratio<5.01,`endgame EXP ratio ${ratio}`);
const abyssGrowth=createMonster("slime",{level:1,endgameBossId:"abyss_envy",endgameFaction:"abyss",isContractedEndgame:true,allowEndgameLevel:true});
applyTotalExperience(abyssGrowth,experienceCrystalValue(abyssGrowth)*50);
assert.ok(abyssGrowth.level<10000,"endgame growth must remain much slower");

assert.equal(shouldTriggerEmergency({player:{currentFloor:5000,maxFloor:5000},flags:{},endgame:{}}),false);
assert.equal(teamBattleRewardPreview(1,10000).goldMultiplier,.04);

const main=read("src/main.js"),battle=read("src/ui/screens/BattleScreen.js"),equipment=read("src/ui/screens/EquipmentScreen.js"),css=read("src/Styles/v2.4.0.css")+read("src/Styles/v2.5.0.css"),save=read("src/services/SaveService.js");
assert.match(main,/countRoll<\.25\?2:countRoll<\.62\?3:4/);
assert.match(main,/function enemyLevelForFloor\(floor\)\{return scaledEnemyLevelForFloor\(floor\)\}/);
assert.match(main,/uncapturable:true,endgameRoaming:true/);
assert.match(main,/chance=bossData\?\.faction==="tenGod"\?\.12:\.18/);
assert.equal((main.match(/function playTenGodFirstContact\(/g)??[]).length,1);
assert.equal((main.match(/playTenGodFirstContact\(/g)??[]).length,1,"post-1000 contact screen must not be invoked");
assert.equal((main.match(/function showSecondWorldRandomEvent\(/g)??[]).length,1);
assert.equal((main.match(/showSecondWorldRandomEvent\(/g)??[]).length,1,"post-1000 random event screen must not be invoked");
assert.match(main,/深淵・十神は捕獲できません/);
assert.match(battle,/捕獲不可/);
assert.match(main,/moved>CAMERA_DRAG_THRESHOLD_PX\|\|inside/);
assert.match(css,/equipment-affection-button/);
assert.match(css,/home-item-shop-row/);
assert.match(css,/enemy-status-row.*ally-status-row/s);
assert.match(css,/gacha-result-equipment-art/);
assert.match(save,/experienceItems=Math\.max\(0,s\.inventory\.experienceItems-9950\)/);

const spriteDirs=[...Array.from({length:20},(_,index)=>String(index+211)),"abyss_envy","abyss_extinction","abyss_gluttony","abyss_greed","abyss_pride","abyss_sloth","abyss_wrath","ten_dark","ten_earth","ten_fire","ten_ice","ten_light","ten_space","ten_thunder","ten_time","ten_water","ten_wind"];
const catalog=await import("../src/data/monsterCatalog.js");
const frames=["idle1","idle2","idle3","walk1","walk2","attack","damage","down"];
for(const key of spriteDirs){
 const id=/^\d+$/.test(key)?newIds[Number(key)-211]:key,folder=catalog.MONSTER_SPRITE_FOLDERS[id];
 assert.ok(folder,`missing sprite folder mapping ${id}`);
 for(const frame of frames)assert.ok(fs.existsSync(path.join(root,"assets/monsters",folder,`${frame}.png`)),`missing ${folder}/${frame}.png`);
}

console.log("Hotfix 132 regression: PASS");
