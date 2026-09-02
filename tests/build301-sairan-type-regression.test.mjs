import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

import{SAIRAN_TYPES,applyCampaignSairanType,recordCampaignEnding}from"../src/core/Campaign100System.js";
import{createMonster,calculatedStats}from"../src/models/Monster.js";
import{allLearnedSkills}from"../src/battle/SkillSystem.js";

const makeSairan=typeId=>{
 const monster=createMonster("abyss_dominion",{nickname:"魔王サイラーン",level:100,rank:4,attribute:"dark",obtainedMethod:"campaignFinalTemporary"});
 applyCampaignSairanType(monster,typeId,{learnedSkillIds:allLearnedSkills(monster).map(skill=>skill.id)});
 return monster
};

test("all five Sairan types persist materially distinct runtime stats",()=>{
 const rows=Object.keys(SAIRAN_TYPES).map(typeId=>{
  const monster=makeSairan(typeId),stats=calculatedStats(monster),reloaded=JSON.parse(JSON.stringify(monster));
  assert.equal(monster.campaignSairanType,typeId);
  assert.equal(monster.title,SAIRAN_TYPES[typeId].name);
  assert.deepEqual(monster.floorBossStatProfile,SAIRAN_TYPES[typeId].stats);
  assert.deepEqual(calculatedStats(reloaded),stats,`${typeId} survives save serialization`);
  assert.deepEqual(reloaded.equippedSkills,monster.equippedSkills,`${typeId} loadout survives save serialization`);
  assert.equal(monster.equippedSkills.filter(Boolean).length,4);
  assert.equal(monster.skillLoadoutInitialized,true);
  return[typeId,stats]
 });
 const byType=Object.fromEntries(rows),fingerprints=new Set(rows.map(([,stats])=>[stats.hp,stats.atk,stats.matk,stats.def,stats.mdef,stats.spd].join("|")));
 const loadouts=new Set(Object.keys(SAIRAN_TYPES).map(typeId=>makeSairan(typeId).equippedSkills.join("|")));
 assert.equal(fingerprints.size,Object.keys(SAIRAN_TYPES).length);
 assert.equal(loadouts.size,Object.keys(SAIRAN_TYPES).length);
 assert.ok(byType.power.atk>byType.balanced.atk&&byType.power.spd<byType.balanced.spd,"power trades speed for attack");
 assert.ok(byType.magic.matk>Math.max(byType.balanced.matk,byType.power.matk),"magic has the highest magic attack");
 assert.ok(byType.speed.spd>Math.max(byType.balanced.spd,byType.magic.spd),"speed has the highest speed");
 assert.ok(byType.fortress.hp>byType.power.hp&&byType.fortress.def>byType.power.def,"fortress has the highest durability")
});

test("unknown Sairan type safely falls back to balanced",()=>{
 const monster=makeSairan("missing-type");
 assert.equal(monster.campaignSairanType,"balanced");
 assert.deepEqual(monster.floorBossStatProfile,SAIRAN_TYPES.balanced.stats)
});

test("campaign final creation applies the selected Sairan runtime profile before HP initialization",async()=>{
 const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8"),start=main.indexOf('const type=SAIRAN_TYPES[campaign.selectedSairanType]'),creation=main.slice(start,main.indexOf("showCampaignEnding(campaignEndingForResult",start));
 assert.match(creation,/applyCampaignSairanType\(sairan,type\.id,\{learnedSkillIds:learnedSairanSkillIds\}\)/);
 assert.ok(creation.indexOf("applyCampaignSairanType(sairan,type.id")<creation.indexOf("sairan.currentHp=calculatedStats(sairan).hp"))
});

test("only a victorious campaign ending becomes a true clear",async()=>{
 const defeated={};assert.deepEqual(recordCampaignEnding(defeated,"defeat"),{ending:"defeat",victorious:false,finalCompleted:false});assert.deepEqual(defeated.campaign100.endings,["defeat"]);
 for(const ending of["complete","comeback"]){const state={},result=recordCampaignEnding(state,ending);assert.equal(result.victorious,true);assert.equal(state.campaign100.finalCompleted,true);assert.deepEqual(state.campaign100.endings,[ending])}
 const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8"),start=main.indexOf("function showCampaignEnding("),endingBlock=main.slice(start,main.indexOf("function finishCampaignFinalBattle",start));
 assert.match(endingBlock,/if\(outcome\.victorious\)\{mark10000FloorCleared\(save\.state\);save\.state\.flags\.ending10000Played=true\}/);
 assert.doesNotMatch(endingBlock,/campaign\.finalCompleted=true/)
});
