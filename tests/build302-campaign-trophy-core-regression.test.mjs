import test from"node:test";
import assert from"node:assert/strict";
import{
 beginCampaignFloorReplay,campaignFloorState,claimTrophyChest,collectCampaignKey,
 defeatCampaignBoss,normalizeCampaignState,trophyChestEntitlements
}from"../src/core/Campaign100System.js";

function addKeys(state,floor,count=3){
 for(let index=1;index<=count;index++)collectCampaignKey(state,floor,`${floor}-campaign-key-${index}`)
}

test("offline trophy stays locked below three keys and settles only once",()=>{
 const state={};defeatCampaignBoss(state,8);addKeys(state,8,2);
 assert.deepEqual(trophyChestEntitlements(state,8),{available:false,heldKeys:2,missingKeys:1,totalKeys:2,fragmentPacks:3,equipmentGuaranteed:false});
 assert.equal(claimTrophyChest(state,8).claimed,undefined);
 addKeys(state,8,3);const claim=claimTrophyChest(state,8),entry=campaignFloorState(state,8);
 assert.equal(claim.claimed,true);assert.equal(claim.fragmentPacks,3);assert.equal(claim.equipmentGuaranteed,true);
 assert.equal(entry.trophyLocksOpened,3);assert.equal(entry.trophyClaimed,true);assert.equal(entry.keysConsumed,3);
 assert.equal(claimTrophyChest(state,8).claimed,undefined,"the same run cannot settle twice");
});

test("Build301 partial locks preserve prior fragments and still guarantee one item",()=>{
 const state={campaign100:{version:1,floors:{8:{bossDefeated:true,keysCollected:1,keyIds:["8-campaign-key-1"],trophyLocksOpened:1,trophyClaimed:false}}}};
 normalizeCampaignState(state);const rescued=campaignFloorState(state,8);
 assert.equal(rescued.trophyLocksOpened,0);assert.equal(rescued.trophyFragmentPacksClaimed,1);assert.equal(rescued.trophyClaimed,false);
 addKeys(state,8,3);const claim=claimTrophyChest(state,8);
 assert.equal(claim.fragmentPacks,2,"only unpaid fragment packs remain");assert.equal(claim.equipmentGuaranteed,true);
 assert.equal(campaignFloorState(state,8).trophyClaimed,true);
});

test("explicit replay reopens only replay fragments and never a second mythic",()=>{
 const state={};defeatCampaignBoss(state,8);addKeys(state,8);assert.equal(claimTrophyChest(state,8).equipmentGuaranteed,true);
 beginCampaignFloorReplay(state,8,"replay-8");const replay=campaignFloorState(state,8);
 assert.equal(replay.trophyClaimed,true,"global mythic entitlement stays consumed");
 assert.equal(replay.trophyLocksOpened,0);assert.equal(replay.trophyFragmentPacksClaimed,0);
 defeatCampaignBoss(state,8);addKeys(state,8);const claim=claimTrophyChest(state,8);
 assert.equal(claim.claimed,true);assert.equal(claim.fragmentPacks,3);assert.equal(claim.equipmentGuaranteed,false);
 normalizeCampaignState(state);assert.equal(campaignFloorState(state,8).trophyLocksOpened,3,"ordinary re-entry keeps the replay chest settled");
});
