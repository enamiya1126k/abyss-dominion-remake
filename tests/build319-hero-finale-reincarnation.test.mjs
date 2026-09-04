import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{campaignFloorState,normalizeCampaignState}from"../src/core/Campaign100System.js";
import{CAMPAIGN_HERO_ENCOUNTER_SCHEDULE,campaignHeroEncounterCandidate,createCampaignHeroEncounterState,recordCampaignHeroWound,campaignFinalHeroEntries}from"../src/core/CampaignHeroEncounterSystem.js";
import{CAMPAIGN_FINAL_ENDING_IDS,beginOptionalCampaignReincarnation,campaignCanonicalEnding,campaignReincarnationDifficultyMultiplier,campaignReincarnationFloorLimit,campaignReincarnationRewardMultiplier,normalizeCampaignReincarnationState,recordCampaignConclusion,recordCampaignReincarnationFloor}from"../src/core/CampaignReincarnationSystem.js";

test("Build319 stages all hero encounters but randomizes the exact floor deterministically",()=>{
 const state=createCampaignHeroEncounterState(),floors=[];
 for(const definition of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE){
  let found=null;for(let floor=definition.floor;floor<=definition.windowEnd;floor++){const candidate=campaignHeroEncounterCandidate(state,{floor});if(candidate?.id===definition.id){found=candidate;break}}
  assert.ok(found,`${definition.id} is guaranteed inside its authored stage`);assert.ok(found.triggerFloor<=found.windowEnd);floors.push(found.triggerFloor-definition.floor);
  assert.deepEqual(campaignHeroEncounterCandidate(state,{floor:found.triggerFloor}),found,"the same save and floor reproduce the same encounter roll");
 }
 assert.ok(new Set(floors).size>=3,"the schedule is not eight fixed mid-floor ambushes");
 assert.equal(campaignHeroEncounterCandidate(state,{floor:11,encounterRoll:.01})?.triggerFloor,11);assert.equal(campaignHeroEncounterCandidate(state,{floor:11,encounterRoll:.99}),null,"a different save seed can move the same hero deeper into its stage");
 assert.deepEqual(CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.slice(0,4).map(entry=>entry.heroId),["myth_yori","myth_hide","myth_enami","myth_rion"]);
});

test("Build319 carries wounds and defeated heroes into the royal final roster",()=>{
 let state=createCampaignHeroEncounterState();
 state=recordCampaignHeroWound(state,{heroId:"myth_yori",woundId:"wound-yori",hpRate:.37}).state;
 state=recordCampaignHeroWound(state,{heroId:"myth_hide",woundId:"down-hide",hpRate:0}).state;
 const entries=campaignFinalHeroEntries(state),yori=entries.find(entry=>entry.heroId==="myth_yori");
 assert.equal(yori.carryHpRate,.37);assert.equal(entries.some(entry=>entry.heroId==="myth_hide"),false);assert.ok(entries.every(entry=>entry.fixedTrialScaling&&entry.level===1000));
});

test("Build319 exposes exactly three canonical endings",()=>{
 assert.deepEqual(CAMPAIGN_FINAL_ENDING_IDS,["complete","narrow","defeat"]);
 assert.deepEqual(campaignCanonicalEnding(null,{remainingHeroes:0,partyWon:false}),{ending:"complete",variant:"all-preempted",victorious:true});
 assert.equal(campaignCanonicalEnding(null,{remainingHeroes:4,partyWon:true,partySurvivors:4}).ending,"complete");
 assert.equal(campaignCanonicalEnding(null,{remainingHeroes:4,partyWon:true,partySurvivors:2}).ending,"narrow");
 assert.equal(campaignCanonicalEnding(null,{remainingHeroes:4,partyWon:false}).ending,"defeat");
});

test("Build319 makes reincarnation optional, preserves collection value, and suppresses unique reward duplication",()=>{
 const state={player:{gold:123456,crystals:789,maxFloor:100,currentFloor:100,checkpoint:100,inRun:false,floorSeeds:{100:44},dungeonShapeHistory:[],openedChests:{1:["old"]},bossKills:{1:1},bossRewards:{},pendingBossRewards:{}},campaign100:{finalCompleted:true,finalUnlocked:true,floors:{}},flags:{ending10000Played:true},monsters:[{id:"kept-monster"}],equipment:[{id:"kept-equipment"}],inventory:{potions:17}};
 normalizeCampaignState(state);const floor=campaignFloorState(state,1);floor.bossDefeated=true;floor.cleared=true;floor.exitUnlocked=true;floor.trophyClaimed=true;floor.trophyRewardReceipt={fragmentPacksClaimed:3,equipmentClaimed:true,currencyClaimed:true};state.campaign100.heroEncounters310=createCampaignHeroEncounterState();state.campaign100.story309={openingSeen:true,seenSceneIds:["road-010"]};
 recordCampaignConclusion(state,{ending:"complete",resultId:"ending-first"});assert.equal(normalizeCampaignReincarnationState(state).available,true);
 const result=beginOptionalCampaignReincarnation(state,{resultId:"start-cycle-1"});assert.equal(result.ok,true);assert.equal(result.cycle,1);assert.equal(state.player.currentFloor,1);assert.equal(state.player.maxFloor,100,"lifetime unlocks stay intact");assert.equal(campaignReincarnationFloorLimit(state),1,"the new prophecy itself starts at floor one");assert.equal(state.monsters[0].id,"kept-monster");assert.equal(state.equipment[0].id,"kept-equipment");assert.equal(state.inventory.potions,17);assert.equal(state.player.gold,123456);assert.equal(state.campaign100.finalCompleted,false);assert.equal(state.campaign100.story309,undefined);assert.equal(state.campaign100.heroEncounters310.heroes.myth_yori.remainingHpRate,1);assert.equal(state.campaign100.floors["1"].replayActive,true);assert.equal(state.campaign100.floors["1"].trophyRewardReceipt.equipmentClaimed,true);
 recordCampaignReincarnationFloor(state,8);assert.equal(campaignReincarnationFloorLimit(state),8);assert.equal(campaignReincarnationDifficultyMultiplier(state),1.28);assert.equal(campaignReincarnationRewardMultiplier(state),1.12);
});

test("Build319 wires the royal audience, final battle, postgame continuation and optional reincarnation",async()=>{
 const[screen,main,home,index]=await Promise.all(["../src/ui/screens/CampaignFinalFloorScreen.js","../src/main.js","../src/ui/screens/HomeScreen.js","../index.html"].map(path=>readFile(new URL(path,import.meta.url),"utf8")));
 assert.match(screen,/魔王城・謁見の王室/);assert.match(screen,/royal-side-party/);assert.match(screen,/royal-side-heroes/);assert.match(screen,/data-final-audience-next/);assert.match(screen,/神話共鳴『無敵』/);
 assert.match(main,/audienceCompleted:true/);assert.match(main,/campaignCanonicalEnding/);assert.match(main,/beginOptionalCampaignReincarnation/);assert.doesNotMatch(main,/beginCampaignDay9Rewind/);assert.match(main,/campaignReincarnationDifficultyMultiplier/);assert.match(main,/campaignReincarnationRewardMultiplier/);assert.match(main,/encounterRoll=seeded\(\(floorSeed\(floor\)/);
 assert.match(home,/クリア後もそのまま継続中/);assert.match(home,/openCampaignReincarnation/);assert.match(index,/build319-finale\.css/);assert.match(index,/ASSET_BUILD = "build319"/);
});
