import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

import{
 floorBossCampaignDisplayFloor,
 legacyFloorToCampaignFloor
}from"../src/core/Campaign100System.js";
import{
 FLOOR_BOSS_CATALOG,
 floorBossDefinitionForFloor
}from"../src/data/floorBosses.js";
import{ENDGAME_TRIALS}from"../src/core/EndgameSystem.js";
import{COMPLETE_MONSTER_CODEX}from"../src/core/CollectionRewardSystem.js";
import{MonsterDetailScreen}from"../src/ui/screens/MonsterDetailScreen.js";
import{createMonster}from"../src/models/Monster.js";
import{SaveService}from"../src/services/SaveService.js";

const CAMPAIGN_FLOORS=Object.freeze(Array.from({length:99},(_,index)=>index+1).filter(floor=>floor%10!==0));
const LEGACY_CATALOG_FLOORS=Object.freeze(CAMPAIGN_FLOORS.map(floor=>floor*10));

class MemoryStorage{
 constructor(){this.values=new Map()}
 getItem(key){return this.values.get(key)??null}
 setItem(key,value){this.values.set(key,String(value))}
 removeItem(key){this.values.delete(key)}
}

test("Build306 preserves raw floor-boss IDs and balance floors",()=>{
 assert.equal(FLOOR_BOSS_CATALOG.length,90);
 assert.deepEqual(FLOOR_BOSS_CATALOG.map(boss=>boss.floor),LEGACY_CATALOG_FLOORS);
 assert.deepEqual(FLOOR_BOSS_CATALOG.map(boss=>boss.id),LEGACY_CATALOG_FLOORS.map(floor=>`floor-boss-${floor}`));
 assert.equal(FLOOR_BOSS_CATALOG[0].floor,10);
 assert.equal(FLOOR_BOSS_CATALOG.at(-1).floor,990);
});

test("Build306 converts only proven floor-boss definitions to 1-99F display floors",()=>{
 assert.deepEqual(FLOOR_BOSS_CATALOG.map(floorBossCampaignDisplayFloor),CAMPAIGN_FLOORS);
 assert.equal(new Set(FLOOR_BOSS_CATALOG.map(floorBossCampaignDisplayFloor)).size,90);
 assert.equal(floorBossCampaignDisplayFloor(FLOOR_BOSS_CATALOG[0]),1);
 assert.equal(floorBossCampaignDisplayFloor(FLOOR_BOSS_CATALOG[8]),9);
 assert.equal(floorBossCampaignDisplayFloor(FLOOR_BOSS_CATALOG[9]),11);
 assert.equal(floorBossCampaignDisplayFloor(FLOOR_BOSS_CATALOG.at(-1)),99);

 // Generic campaign floor data must never be divided merely because it has a
 // property named `floor`. Explicit actualFloor is already display-canonical.
 assert.equal(floorBossCampaignDisplayFloor({floor:10}),null);
 assert.equal(floorBossCampaignDisplayFloor({id:"floor-boss-10",floor:1}),null);
 assert.equal(floorBossCampaignDisplayFloor({actualFloor:10,floor:100}),10);

 for(const floor of CAMPAIGN_FLOORS){
  const definition=floorBossDefinitionForFloor(floor);
  assert.ok(definition,`${floor}F should resolve an ordinary floor boss`);
  assert.equal(definition.floor,floor*10);
  assert.equal(definition.actualFloor,floor);
  assert.equal(definition.legacyFloor,floor*10);
  assert.equal(floorBossCampaignDisplayFloor(definition),floor);
 }
 for(let floor=10;floor<=100;floor+=10)assert.equal(floorBossDefinitionForFloor(floor),null,`${floor}F is reserved for a campaign milestone boss`);
 assert.deepEqual(LEGACY_CATALOG_FLOORS.map(legacyFloorToCampaignFloor),CAMPAIGN_FLOORS);
});

test("Build306 Endgame trial labels use campaign floors without changing boss identity",()=>{
 const trials=ENDGAME_TRIALS.slice(0,FLOOR_BOSS_CATALOG.length);
 assert.equal(trials.length,90);
 trials.forEach((trial,index)=>{
  const boss=FLOOR_BOSS_CATALOG[index],displayFloor=CAMPAIGN_FLOORS[index];
  assert.equal(trial.floorBossId,boss.id);
  assert.equal(trial.name,`${displayFloor}階・${boss.name}の法廷`);
  assert.notEqual(trial.name,`${boss.floor}階・${boss.name}の法廷`);
 });
 assert.equal(trials[0].name.startsWith("1階・"),true);
 assert.equal(trials[8].name.startsWith("9階・"),true);
 assert.equal(trials[9].name.startsWith("11階・"),true);
 assert.equal(trials.at(-1).name.startsWith("99階・"),true);
});

test("Build306 collection entries expose campaign floors and retain catalog links",()=>{
 const entries=COMPLETE_MONSTER_CODEX.filter(entry=>entry.kind==="floorBoss");
 assert.equal(entries.length,90);
 entries.forEach((entry,index)=>{
  const boss=FLOOR_BOSS_CATALOG[index],displayFloor=CAMPAIGN_FLOORS[index];
  assert.equal(entry.id,boss.id);
  assert.equal(entry.floorBossCatalogId,boss.id);
  assert.equal(entry.floor,displayFloor);
  assert.equal(entry.source,`${displayFloor}階ボスの欠片契約`);
  assert.notEqual(entry.source,`${boss.floor}階ボスの欠片契約`);
 });
});

test("Build306 authored boss descriptions no longer expose legacy floor copy",async()=>{
 const ninthFloorBoss=FLOOR_BOSS_CATALOG.find(boss=>boss.floor===90);
 const finalOrdinaryBoss=FLOOR_BOSS_CATALOG.find(boss=>boss.floor===990);
 assert.match(ninthFloorBoss?.ai?.description??"",/9階の総合試験/);
 assert.doesNotMatch(ninthFloorBoss?.ai?.description??"",/90階の総合試験/);
 assert.match(finalOrdinaryBoss?.passive?.description??"",/100階直前の冠位竜/);
 assert.doesNotMatch(finalOrdinaryBoss?.passive?.description??"",/1000階直前の冠位竜/);

 const source=await readFile(new URL("../src/data/floorBosses.js",import.meta.url),"utf8");
 assert.doesNotMatch(source,/description:\s*"[^"]*(?:90階の総合試験|1000階直前の冠位竜)/);
 assert.doesNotMatch(source,/quote:\s*"[^"]*(?:次の百階|九百九十の星路)/);
});

test("Build306 repairs only catalog-proven legacy contract acquisition labels",()=>{
 const boss=FLOOR_BOSS_CATALOG.find(entry=>entry.floor===110),oldContract=createMonster(boss.speciesId,{level:boss.floor,obtainedFloor:boss.floor,obtainedMethod:"floorBossContract",floorBossCatalogId:boss.id}),ordinary=createMonster("slime",{obtainedFloor:10,obtainedMethod:"capture"});
 const oldContractHtml=MonsterDetailScreen(oldContract,{monsters:[oldContract],party:[]}),ordinaryHtml=MonsterDetailScreen(ordinary,{monsters:[ordinary],party:[]});
 assert.match(oldContractHtml,/この個体の入手<\/small><b>[^<]*・11階時点/);
 assert.doesNotMatch(oldContractHtml,/この個体の入手<\/small><b>[^<]*・110階時点/);
 assert.match(ordinaryHtml,/探索・捕獲・10階時点/);
});

test("Build306 persistently repairs old contract metadata without changing combat level",()=>{
 const previousStorage=globalThis.localStorage;globalThis.localStorage=new MemoryStorage();
 try{
  const boss=FLOOR_BOSS_CATALOG.find(entry=>entry.floor===110),seed=new SaveService(),contract=createMonster(boss.speciesId,{level:boss.floor,obtainedFloor:boss.floor,obtainedMethod:"floorBossContract",floorBossCatalogId:boss.id}),control=createMonster(boss.speciesId,{level:boss.floor,obtainedFloor:11,obtainedMethod:"floorBossContract",floorBossCatalogId:boss.id});
  seed.state.monsters.push(contract,control);seed.save();
  const migrated=new SaveService(),restored=migrated.state.monsters.find(monster=>monster.id===contract.id),normalizedControl=migrated.state.monsters.find(monster=>monster.id===control.id);
  assert.equal(restored.floorBossCatalogId,boss.id);
  assert.equal(restored.level,normalizedControl.level);
  assert.equal(restored.obtainedFloor,11);
  assert.equal(restored.history.highestFloor,11);
  const reloaded=new SaveService().state.monsters.find(monster=>monster.id===contract.id);
  assert.equal(reloaded.obtainedFloor,11);
 }finally{
  if(previousStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=previousStorage;
 }
});
