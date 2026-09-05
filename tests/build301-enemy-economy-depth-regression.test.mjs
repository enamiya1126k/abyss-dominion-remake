import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8");
const between=(startName,endName)=>{
 const start=main.indexOf(`function ${startName}(`),end=main.indexOf(`function ${endName}(`,start+1);
 assert.ok(start>=0&&end>start);return main.slice(start,end)
};
const prepareSource=between("prepareEnemyEntry","ensureUniqueEnemyMagicCircles"),uniqueSource=between("ensureUniqueEnemyMagicCircles","recordFieldEncounter");

test("build301 campaign 100F enemy loadout keeps legacy-1000 equipment depth",()=>{
 const result=new Function(`
  const SPECIES={slime:{rarity:"N"}},ENEMY_EQUIPMENT_SUBSLOTS=[["weaponRight","weapon"],["weaponLeft","weapon"],["armorBody","armor"],["armorSupport","armor"]];
  const equipmentHolderRateForFloor=()=>1,equipmentSlotsForFloor=floor=>floor>=1000?4:1,rollEnemyEquipmentRarity=()=>"LR",enemyEquipmentLevelForFloor=floor=>Math.round(floor*.82);
  const createEquipment=slot=>({slot,stats:{}}),rollEnemyMagicCircle=floor=>({id:"circle",level:floor>=1000?20:1});
  ${prepareSource}
  return prepareEnemyEntry({speciesId:"slime"},100,{forceGear:true,economyFloor:1000});
 `)();
 assert.equal(result.enemyFloor,100);assert.equal(result.enemyEconomyFloor,1000);assert.equal(result.enemyLoadoutVersion,5);
 assert.equal(result.enemyEquipmentSlots,4);assert.equal(result.enemyEquipmentLevel,820);assert.equal(result.enemyGear.length,4);
 assert.ok(result.enemyGear.every(item=>item.level===820&&item.plus===4));assert.equal(result.enemyMagicCircle.level,20);
});

test("build301 duplicate magic-circle replacement uses the preserved economic depth",()=>{
 const result=new Function(`
  const SPECIES={slime:{rarity:"N"}},calls=[];
  const rollEnemyMagicCircle=(floor,options)=>{calls.push({floor,options});return{id:"replacement",level:floor>=1000?20:1}};
  ${uniqueSource}
  const entries=[
   {speciesId:"slime",enemyEconomyFloor:1000,enemyMagicCircle:{id:"same",level:20}},
   {speciesId:"slime",enemyEconomyFloor:1000,enemyMagicCircle:{id:"same",level:20}}
  ];
  return{result:ensureUniqueEnemyMagicCircles(entries,100),calls};
 `)();
 assert.equal(result.calls.length,1);assert.equal(result.calls[0].floor,1000);assert.equal(result.calls[0].options.force,true);
 assert.equal(result.result[1].enemyMagicCircle.id,"replacement");assert.equal(result.result[1].enemyMagicCircle.level,20);
});

test("build301 battle construction trusts current v4 loadouts",()=>{
 assert.match(main,/prepared=e\.enemyLoadoutVersion===5\?e:prepareEnemyEntry/);
 assert.doesNotMatch(main,/prepared=e\.enemyLoadoutVersion===3\?e:prepareEnemyEntry/);
});
