import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

import{recordCampaignEnding}from"../src/core/Campaign100System.js";

test("Build309 keeps Sairan in authored story only and forbids every active combat path",async()=>{
 const[main,core,story]=await Promise.all([
  readFile(new URL("../src/main.js",import.meta.url),"utf8"),
  readFile(new URL("../src/core/Campaign100System.js",import.meta.url),"utf8"),
  readFile(new URL("../src/core/CampaignStorySystem.js",import.meta.url),"utf8")
 ]);
 assert.doesNotMatch(main,/SAIRAN_TYPES|applyCampaignSairanType|data-sairan-type|selectedSairanType/);
 assert.doesNotMatch(core,/export const SAIRAN_TYPES|applyCampaignSairanType/);
 assert.doesNotMatch(main,/createMonster\("abyss_dominion",\{nickname:"魔王サイラーン"/);
 assert.doesNotMatch(main,/campaignStage:"sairan"/);
 assert.doesNotMatch(main,/sairan\.equippedSkills|recommendedSkillLoadout\(sairan\)/);
 assert.match(story,/name:"魔王サイラーン"/);
 assert.match(story,/sairan:Object\.freeze\(\{storyOnly:true,battleEligible:false,finalBattleParticipant:false\}\)/);
 assert.match(story,/finalBattle:Object\.freeze\(\{partySize:4,heroIds:HERO_PARTY_IDS,allowSairan:false\}\)/);
 assert.match(main,/function retireLegacyCampaignSairanBattle\(\)/,"legacy interrupted battles keep a cleanup-only path");
});

test("only a victorious campaign ending becomes a true clear",async()=>{
 const defeated={};assert.deepEqual(recordCampaignEnding(defeated,"defeat"),{ending:"defeat",victorious:false,finalCompleted:false});assert.deepEqual(defeated.campaign100.endings,["defeat"]);
 for(const ending of["complete","comeback"]){const state={},result=recordCampaignEnding(state,ending);assert.equal(result.victorious,true);assert.equal(state.campaign100.finalCompleted,true);assert.deepEqual(state.campaign100.endings,[ending])}
 const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8"),start=main.indexOf("function showCampaignEnding("),endingBlock=main.slice(start,main.indexOf("function finishCampaignFinalBattle",start));
 assert.match(endingBlock,/if\(outcome\.victorious\)\{mark10000FloorCleared\(save\.state\);save\.state\.flags\.ending10000Played=true\}/);
 assert.doesNotMatch(endingBlock,/campaign\.finalCompleted=true/)
});
