import assert from"node:assert/strict";
import{
 CAMPAIGN_MAX_FLOOR,CAMPAIGN_KEYS_PER_FLOOR,campaignFloorToLegacyFloor,legacyFloorToCampaignFloor,campaignDayForFloor,
 campaignMilestoneBossIds,roomCountForRandom,roomAttributesForFloor,normalizeCampaignState,campaignFloorState,beginCampaignFloorRun,beginCampaignFloorReplay,collectCampaignKey,
 defeatCampaignBoss,trophyChestEntitlements,claimTrophyChest,campaignEndingForResult
}from"../src/core/Campaign100System.js";

assert.equal(CAMPAIGN_MAX_FLOOR,100);
assert.equal(CAMPAIGN_KEYS_PER_FLOOR,3);
assert.equal(campaignFloorToLegacyFloor(1),10);
assert.equal(campaignFloorToLegacyFloor(100),1000);
assert.equal(legacyFloorToCampaignFloor(990),99);
assert.equal(legacyFloorToCampaignFloor(10000),100);
assert.equal(campaignDayForFloor(1),1);
assert.equal(campaignDayForFloor(100),10);
assert.deepEqual(campaignMilestoneBossIds(70),["abyss_pride"]);
assert.deepEqual(campaignMilestoneBossIds(80),["ten_time","ten_space","ten_life"]);
assert.deepEqual(campaignMilestoneBossIds(100),["ten_dominion","ten_creation","ten_end","ten_divinity"]);
assert.equal(roomCountForRandom(()=>0),4);
assert.equal(roomCountForRandom(()=>.999),6);
assert.equal(new Set(roomAttributesForFloor(1,4,()=>0)).size,4);

const save={};normalizeCampaignState(save);const floor=campaignFloorState(save,12);assert.equal(floor.keysCollected,0);assert.equal(floor.exitUnlocked,false);
assert.deepEqual(collectCampaignKey(save,12,"a"),{collected:true,count:1});assert.deepEqual(collectCampaignKey(save,12,"a"),{collected:false,count:1});
collectCampaignKey(save,12,"b");collectCampaignKey(save,12,"c");assert.equal(trophyChestEntitlements(save,12).available,false);
defeatCampaignBoss(save,12);assert.equal(trophyChestEntitlements(save,12).equipmentGuaranteed,true);const reward=claimTrophyChest(save,12);assert.equal(reward.fragmentPacks,3);assert.equal(reward.equipmentGuaranteed,true);assert.equal(campaignFloorState(save,12).trophyClaimed,true);
const resume=beginCampaignFloorRun(save,12,"resume-2");assert.equal(resume.trophyClaimed,true);assert.equal(resume.keysCollected,3);assert.equal(resume.bossDefeated,true);assert.equal(resume.trophyLocksOpened,3);assert.equal(resume.exitUnlocked,true);
const replay=beginCampaignFloorReplay(save,12,"replay-2");assert.equal(replay.trophyClaimed,true);assert.equal(replay.keysCollected,0);assert.equal(replay.bossDefeated,false);assert.equal(replay.trophyLocksOpened,0);assert.equal(replay.exitUnlocked,false);
assert.equal(campaignEndingForResult({partyWon:true}),"complete");assert.equal(campaignEndingForResult({sairanWon:true}),"comeback");assert.equal(campaignEndingForResult({}),"defeat");
console.log("build300 campaign100 regression: ok");
