import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{SAVE_KEY,SAVE_SCHEMA_VERSION}from"../src/core/config.js";
import{SaveService}from"../src/services/SaveService.js";
import{campaignFloorState,normalizeCampaignState}from"../src/core/Campaign100System.js";
import{campaignHeroEncounterCandidate,createCampaignHeroEncounterState,retireLegacyCampaignRewind}from"../src/core/CampaignHeroEncounterSystem.js";
import{beginOptionalCampaignReincarnation,campaignCanonicalEnding,campaignReincarnationFloorLimit,normalizeCampaignReincarnationState,recordCampaignConclusion,recordCampaignReincarnationFloor}from"../src/core/CampaignReincarnationSystem.js";
import{activeNoticeDefinitions,setServerMaintenanceState,SERVER_MAINTENANCE_NOTICE}from"../src/core/NoticeSystem.js";
import{explorePerformanceProfile}from"../src/core/ExplorePerformanceSystem.js";

class MemoryStorage{
 constructor(){this.values=new Map()}
 getItem(key){return this.values.get(key)??null}
 setItem(key,value){this.values.set(key,String(value))}
 removeItem(key){this.values.delete(key)}
}
const previousStorage=globalThis.localStorage,storage=new MemoryStorage();
globalThis.localStorage=storage;
test.after(()=>{if(previousStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=previousStorage});

test("Build320 migrates Build319 saves without losing value and retires the obsolete forced rewind",()=>{
 storage.values.clear();const seed=new SaveService(),legacy=structuredClone(seed.state),ledger=createCampaignHeroEncounterState();
 legacy.schemaVersion=78;legacy.player.gold=987654;legacy.player.crystals=4321;legacy.player.currentFloor=81;legacy.player.maxFloor=100;
 legacy.monsters[0].nickname="移行保持";legacy.equipment.push({id:"kept-equip",name:"保持装備",slot:"weapon",rarity:"SSR",level:1,plus:0,exp:0,limitBreak:0,stats:{atk:1},affixes:[],equippedBy:null});
 ledger.heroes.myth_yori.remainingHpRate=.23;ledger.heroes.myth_yori.lowestHpRate=.23;ledger.rewind={...ledger.rewind,active:true,currentFloor:81,count:1,resultId:"legacy-defeat",reason:"final-defeat"};ledger.finalArena={...ledger.finalArena,unlocked:true,lastEnding:"defeat"};
 legacy.campaign100.heroEncounters310=ledger;storage.setItem(SAVE_KEY,JSON.stringify(legacy));
 const migrated=new SaveService(),hero=migrated.state.campaign100.heroEncounters310;
 assert.equal(migrated.state.schemaVersion,SAVE_SCHEMA_VERSION);assert.equal(SAVE_SCHEMA_VERSION,79);assert.equal(migrated.state.player.gold,987654);assert.equal(migrated.state.player.crystals,4321);assert.equal(migrated.state.monsters[0].nickname,"移行保持");assert.ok(migrated.state.equipment.some(item=>item.id==="kept-equip"));
 assert.equal(hero.heroes.myth_yori.remainingHpRate,.23);assert.equal(hero.rewind.active,false);assert.equal(hero.legacyRewindRetired,true);assert.equal(hero.finalArena.unlocked,true);assert.equal(hero.finalArena.completed,false);
 const once=structuredClone(hero),reloaded=new SaveService().state.campaign100.heroEncounters310;assert.deepEqual(reloaded,once,"the migration remains stable after its first save");
});

test("Build320 keeps all three endings reachable, defeat retryable, and conclusion receipts single-use",()=>{
 assert.equal(campaignCanonicalEnding(null,{remainingHeroes:4,partyWon:true,partySurvivors:4}).ending,"complete");
 assert.equal(campaignCanonicalEnding(null,{remainingHeroes:4,partyWon:true,partySurvivors:1}).ending,"narrow");
 assert.equal(campaignCanonicalEnding(null,{remainingHeroes:4,partyWon:false,partySurvivors:0}).ending,"defeat");
 const state={player:{maxFloor:100},campaign100:{finalCompleted:false,finalUnlocked:true,floors:{}}};normalizeCampaignState(state);
 const first=recordCampaignConclusion(state,{ending:"defeat",resultId:"final-attempt-1",recordedAt:"2026-09-04T00:00:00.000Z"}),duplicate=recordCampaignConclusion(state,{ending:"defeat",resultId:"final-attempt-1"});
 assert.equal(first.recorded,true);assert.equal(duplicate.duplicate,true);assert.equal(normalizeCampaignReincarnationState(state).history.length,1);assert.equal(state.campaign100.finalCompleted,false,"a defeat never locks the royal rematch");
});

test("Build320 completes two reincarnation loops while preserving lifetime trophy receipts",()=>{
 const state={player:{gold:5000,crystals:250,maxFloor:100,currentFloor:100,checkpoint:100,inRun:false,floorSeeds:{},dungeonShapeHistory:[],openedChests:{},bossKills:{},bossRewards:{},pendingBossRewards:{}},campaign100:{finalCompleted:true,finalUnlocked:true,floors:{}},flags:{ending10000Played:true},monsters:[{id:"kept"}],equipment:[{id:"kept-gear"}],inventory:{potions:9}};
 normalizeCampaignState(state);const floor=campaignFloorState(state,1);floor.trophyClaimed=true;floor.trophyRewardReceipt={fragmentPacksClaimed:3,equipmentClaimed:true,currencyClaimed:true};
 recordCampaignConclusion(state,{ending:"complete",resultId:"cycle-0-end",recordedAt:"2026-09-04T00:00:00.000Z"});assert.equal(beginOptionalCampaignReincarnation(state,{resultId:"cycle-1-start"}).ok,true);
 recordCampaignReincarnationFloor(state,100);assert.equal(campaignReincarnationFloorLimit(state),100);assert.deepEqual(campaignFloorState(state,1).trophyRewardReceipt,{fragmentPacksClaimed:3,equipmentClaimed:true,currencyClaimed:true});
 state.campaign100.finalCompleted=true;recordCampaignConclusion(state,{ending:"narrow",resultId:"cycle-1-end",recordedAt:"2026-09-04T01:00:00.000Z"});assert.equal(beginOptionalCampaignReincarnation(state,{resultId:"cycle-2-start"}).ok,true);
 const progress=normalizeCampaignReincarnationState(state);assert.equal(progress.cycle,2);assert.equal(progress.cycleMaxFloor,1);assert.deepEqual(progress.history.map(entry=>entry.ending),["complete","narrow"]);assert.equal(state.monsters[0].id,"kept");assert.equal(state.equipment[0].id,"kept-gear");assert.equal(state.player.gold,5000);assert.equal(state.inventory.potions,9);assert.deepEqual(campaignFloorState(state,1).trophyRewardReceipt,{fragmentPacksClaimed:3,equipmentClaimed:true,currencyClaimed:true});
});

test("Build320 online/offline state is reversible and online play cannot spawn offline hero ambushes",()=>{
 const state={player:{},inventory:{},notices:{readIds:[],rewardInbox:[]}},heroes=createCampaignHeroEncounterState();
 assert.equal(campaignHeroEncounterCandidate(heroes,{floor:11,encounterRoll:0,online:true,visitedSections:9,stepsSinceBattle:99}),null);
 setServerMaintenanceState(state,true,{now:1_800_000_000_000});assert.ok(activeNoticeDefinitions(state).some(notice=>notice.id===SERVER_MAINTENANCE_NOTICE.id));
 setServerMaintenanceState(state,false,{now:1_800_000_001_000});assert.ok(!activeNoticeDefinitions(state).some(notice=>notice.id===SERVER_MAINTENANCE_NOTICE.id));
});

test("Build320 keeps iPhone Safari interaction targets safe and the exploration profile light",async()=>{
 const[index,css,finalScreen,main]=await Promise.all(["../index.html","../src/Styles/build320-audit.css","../src/ui/screens/CampaignFinalFloorScreen.js","../src/main.js"].map(path=>readFile(new URL(path,import.meta.url),"utf8")));
 assert.match(index,/width=device-width,initial-scale=1,viewport-fit=cover/);assert.doesNotMatch(index,/user-scalable=no/);assert.match(index,/build320-audit\.css/);assert.match(index,/ASSET_BUILD = "build320"/);
 assert.match(css,/min-height:44px/);assert.match(css,/env\(safe-area-inset-bottom\)/);assert.match(css,/touch-action:manipulation/);assert.match(css,/@media\(max-width:430px\)/);assert.match(css,/prefers-reduced-motion:reduce/);assert.doesNotMatch(css,/backdrop-filter|filter:\s*blur/);
 assert.doesNotMatch(finalScreen,/requestAnimationFrame|setInterval/);assert.match(main,/recordCampaignReincarnationFloor\(save\.state,clearedFloor\).*save\.save\(\)/s);assert.match(main,/completed:outcome\.victorious/);assert.match(main,/setServerMaintenanceState\(save\.state,state==="offline"/);
 const phone=explorePerformanceProfile({pixelRatio:3,screenWidth:390,maxTouchPoints:5,hardwareConcurrency:6,deviceMemory:4});assert.equal(phone.pixelRatio,1.35);assert.ok(phone.frameInterval>=1000/30);assert.ok(phone.particleScale<=.45);
});

test("Build320 legacy rewind retirement is pure for already-current saves",()=>{
 const current=createCampaignHeroEncounterState(),result=retireLegacyCampaignRewind(current);assert.equal(result.retired,false);assert.deepEqual(result.state,current);
});
