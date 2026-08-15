import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

import{APP_VERSION,SAVE_SCHEMA_VERSION}from"../src/core/config.js";
import{equipmentHolderRateForFloor,equipmentSlotsForFloor,rollEnemyEquipmentRarity,enemyHiddenProfileForFloor}from"../src/core/EnemyScalingSystem.js";
import{enemyMagicCircleRateForFloor,equipMagicCircle,normalizeMagicCircleState}from"../src/core/MagicCircleSystem.js";
import{applyEnemyDamage}from"../src/battle/BattleRules.js";
import{isDarkMarketBargain}from"../src/core/SecretRoomSystem.js";
import{SPECIES}from"../src/data/species.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const main=read("src/main.js"),battleScreen=read("src/ui/screens/BattleScreen.js"),css=read("src/Styles/v2.6.0.css"),index=read("index.html");

assert.equal(APP_VERSION,"2.9.0");
assert.equal(SAVE_SCHEMA_VERSION,54);
assert.match(index,/ASSET_VERSION = "2\.9\.0"/);

assert.equal(equipmentSlotsForFloor(49),3);
assert.equal(equipmentSlotsForFloor(50),6);
assert.ok(equipmentHolderRateForFloor(49)<equipmentHolderRateForFloor(50));
assert.equal(equipmentHolderRateForFloor(50),.96);
assert.equal(rollEnemyEquipmentRarity(50,"N",0),"LR");
const loadout=enemyHiddenProfileForFloor(50,{rank:"N",equipped:true,slots:6,gearLevel:100,rarity:"LR",roll:()=>0});
assert.equal(loadout.active,true);assert.equal(loadout.slots,6);assert.equal(loadout.gearLevel,100);assert.equal(loadout.rarity,"LR");assert.equal(loadout.socketRarity,"LR");assert.ok(loadout.atk>2&&loadout.def>2);

assert.equal(enemyMagicCircleRateForFloor(100,"N"),1);
assert.equal(enemyMagicCircleRateForFloor(1,"LR"),1);
assert.ok(enemyMagicCircleRateForFloor(50,"N")<1);

const circleState={party:["a","b"],monsters:[{id:"a",nickname:"A",magicCircleId:"aegis"},{id:"b",nickname:"B",magicCircleId:"aegis"}],magicCircles:{owned:{aegis:1},goldSpent:0}};
normalizeMagicCircleState(circleState);
assert.equal(circleState.monsters[0].magicCircleId,"aegis");assert.equal(circleState.monsters[1].magicCircleId,"none");
assert.equal(equipMagicCircle(circleState,circleState.monsters[1],"aegis").ok,false);

const mimic={hp:5,maxHp:5,enemyMimicArmor:true};const battle={turn:1};
assert.equal(applyEnemyDamage(battle,mimic,999).damage,1);assert.equal(mimic.hp,4);
assert.equal(applyEnemyDamage(battle,mimic,999).damage,0);assert.equal(mimic.hp,4);
battle.turn=2;assert.equal(applyEnemyDamage(battle,mimic,999).damage,1);assert.equal(mimic.hp,3);
assert.equal(SPECIES.mimic.captureRate,.01);

assert.equal(isDarkMarketBargain({kind:"equipment",sold:false,priceTone:"bargain",price:80,referencePrice:1000}),true);
assert.equal(isDarkMarketBargain({kind:"monster",sold:false,priceTone:"bargain",price:90,referencePrice:1000}),false);
assert.equal(isDarkMarketBargain({kind:"equipment",sold:false,priceTone:"fair",price:1,referencePrice:1000}),false);

assert.match(main,/else if\(floor<100\)count=roll<\.05\?1:roll<\.38\?2:roll<\.73\?3:4/);
assert.match(main,/else count=roll<\.01\?1:roll<\.09\?2:roll<\.27\?3:4/);
assert.match(main,/enemyOnlyMimicProfile=true/);
assert.match(main,/save\.state\.player\.inRun=false;cancelPendingExploreActions\(\);stopGame\(\)/);
assert.match(main,/mode==="items"/);assert.match(main,/filter\(isDarkMarketBargain\)/);assert.match(main,/Math\.floor\(save\.state\.player\.gold\/2\)/);
assert.match(main,/game\.world\.shop&&!game\.world\.shop\.autoVisited/);assert.match(main,/if\(exploreAutoActive\(\)\)game\.world\.shop\.autoVisited=true/);
assert.match(main,/option\.type==="crystal"/);
assert.match(main,/function bindTapAnywhereClose/);assert.match(main,/物理ATK/);assert.match(main,/なつき度/);
assert.match(battleScreen,/enemyMagicCircleArt/);assert.match(css,/enemy-battle-magic-circle/);

console.log("ABYSS DOMINION v2.9.0 enemy/AUTO regression: PASS");
