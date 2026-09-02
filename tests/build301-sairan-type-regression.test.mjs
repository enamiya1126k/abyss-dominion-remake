import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

import{recordCampaignEnding}from"../src/core/Campaign100System.js";

test("Build304 retires selectable Sairan types and keeps one authored king",async()=>{
 const[main,core]=await Promise.all([
  readFile(new URL("../src/main.js",import.meta.url),"utf8"),
  readFile(new URL("../src/core/Campaign100System.js",import.meta.url),"utf8")
 ]);
 assert.doesNotMatch(main,/SAIRAN_TYPES|applyCampaignSairanType|data-sairan-type|selectedSairanType/);
 assert.doesNotMatch(core,/export const SAIRAN_TYPES|applyCampaignSairanType/);
 assert.match(main,/createMonster\("abyss_dominion",\{nickname:"魔王サイラーン",title:"万魔の王"/);
 assert.match(main,/sairan\.equippedSkills=recommendedSkillLoadout\(sairan\)\.slice\(0,4\)/);
});

test("only a victorious campaign ending becomes a true clear",async()=>{
 const defeated={};assert.deepEqual(recordCampaignEnding(defeated,"defeat"),{ending:"defeat",victorious:false,finalCompleted:false});assert.deepEqual(defeated.campaign100.endings,["defeat"]);
 for(const ending of["complete","comeback"]){const state={},result=recordCampaignEnding(state,ending);assert.equal(result.victorious,true);assert.equal(state.campaign100.finalCompleted,true);assert.deepEqual(state.campaign100.endings,[ending])}
 const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8"),start=main.indexOf("function showCampaignEnding("),endingBlock=main.slice(start,main.indexOf("function finishCampaignFinalBattle",start));
 assert.match(endingBlock,/if\(outcome\.victorious\)\{mark10000FloorCleared\(save\.state\);save\.state\.flags\.ending10000Played=true\}/);
 assert.doesNotMatch(endingBlock,/campaign\.finalCompleted=true/)
});
