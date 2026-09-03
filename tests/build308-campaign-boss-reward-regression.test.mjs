import test from"node:test";
import assert from"node:assert/strict";

import{CAMPAIGN_MILESTONE_BOSSES}from"../src/core/Campaign100System.js";
import{
 CAMPAIGN_BOSS_REWARD_VERSION,campaignBossChestReward,campaignBossChestRewardsForFloor,
 campaignBossRewardClaimKey,campaignBossRewardTier
}from"../src/core/CampaignBossRewardSystem.js";

const bossForTier={normal:"floor-boss-10",abyss:"abyss_gluttony",tenGod:"ten_time"};

test("Build308 first boss-chest currencies are deterministic, finite and integral",()=>{
 for(const floor of[1,10,37,80,90,100])for(const[tier,bossId]of Object.entries(bossForTier)){
  const first=campaignBossChestReward({floor,bossId}),second=campaignBossChestReward({floor,bossId});
  assert.deepEqual(first,second,`${tier} floor ${floor} must be reproducible`);
  assert.equal(first.version,CAMPAIGN_BOSS_REWARD_VERSION);
  assert.equal(first.tier,tier);
  assert.ok(Number.isSafeInteger(first.gold)&&first.gold>0);
  assert.ok(Number.isSafeInteger(first.crystals)&&first.crystals>0)
 }
});

test("Build308 rewards rise monotonically within every boss class",()=>{
 for(const[tier,bossId]of Object.entries(bossForTier)){
  let previous=campaignBossChestReward({floor:1,bossId});
  for(let floor=2;floor<=100;floor++){
   const reward=campaignBossChestReward({floor,bossId});
   assert.ok(reward.gold>=previous.gold,`${tier} GOLD decreased at floor ${floor}`);
   assert.ok(reward.crystals>=previous.crystals,`${tier} crystals decreased at floor ${floor}`);
   previous=reward
  }
 }
});

test("Build308 normal, Abyss and Ten-God chests have visibly separated values",()=>{
 for(const floor of[1,10,50,80,100]){
  const normal=campaignBossChestReward({floor,bossId:bossForTier.normal}),abyss=campaignBossChestReward({floor,bossId:bossForTier.abyss}),tenGod=campaignBossChestReward({floor,bossId:bossForTier.tenGod});
  assert.ok(abyss.gold>normal.gold&&tenGod.gold>abyss.gold,`GOLD tiers overlap at floor ${floor}`);
  assert.ok(abyss.crystals>normal.crystals&&tenGod.crystals>abyss.crystals,`crystal tiers overlap at floor ${floor}`)
 }
 assert.deepEqual(
  [campaignBossChestReward({floor:10,bossId:"floor-boss-100"}),campaignBossChestReward({floor:10,bossId:"abyss_gluttony"}),campaignBossChestReward({floor:10,bossId:"ten_time"})].map(({gold,crystals})=>({gold,crystals})),
  [{gold:95000,crystals:30},{gold:129000,crystals:51},{gold:167000,crystals:78}]
 );
 assert.deepEqual(
  [campaignBossChestReward({floor:100,bossId:"floor-boss-990"}),campaignBossChestReward({floor:100,bossId:"abyss_pride"}),campaignBossChestReward({floor:100,bossId:"ten_divinity"})].map(({gold,crystals})=>({gold,crystals})),
  [{gold:1137000,crystals:120},{gold:1535000,crystals:172},{gold:1990000,crystals:235}]
 )
});

test("Build308 floor 80, 90 and 100 grant one independently receipted reward per Ten God",()=>{
 for(const[floor,expected]of[[80,3],[90,3],[100,4]]){
  const bosses=CAMPAIGN_MILESTONE_BOSSES[floor],rewards=campaignBossChestRewardsForFloor({floor,bosses:[...bosses,bosses[0]]});
  assert.equal(rewards.length,expected,`${floor}F must expose ${expected} unique chests`);
  assert.equal(new Set(rewards.map(reward=>reward.bossId)).size,expected);
  assert.equal(new Set(rewards.map(reward=>reward.claimKey)).size,expected);
  assert.ok(rewards.every(reward=>reward.tier==="tenGod"));
  const remaining=campaignBossChestRewardsForFloor({floor,bosses,claimedRewardKeys:[rewards[0].claimKey]});
  assert.equal(remaining.length,expected-1,"claiming one god must not claim the other gods");
  assert.ok(!remaining.some(reward=>reward.claimKey===rewards[0].claimKey))
 }
});

test("Build308 claim keys are boss-specific and restored claim maps are accepted",()=>{
 const first=campaignBossChestReward({floor:80,bossId:"ten_time"}),second=campaignBossChestReward({floor:80,bossId:"ten_space"});
 assert.notEqual(first.claimKey,second.claimKey);
 assert.equal(first.claimKey,campaignBossRewardClaimKey({floor:80,bossId:"ten_time"}));
 assert.deepEqual(campaignBossChestRewardsForFloor({floor:80,bosses:["ten_time","ten_space"],claimedRewardKeys:{[first.claimKey]:true}}).map(reward=>reward.bossId),["ten_space"])
});

test("Build308 reward inputs are bounded and faction metadata remains canonical",()=>{
 assert.equal(campaignBossChestReward({floor:-999,bossId:"floor-boss-10"}).floor,1);
 assert.equal(campaignBossChestReward({floor:999999,bossId:"floor-boss-10"}).floor,100);
 assert.equal(campaignBossChestReward({floor:Infinity,bossId:"floor-boss-10"}).floor,1);
 assert.equal(campaignBossChestReward({floor:10,bossId:""}),null);
 assert.equal(campaignBossRewardTier({id:"restored-id",faction:"tenGod"}),"tenGod");
 assert.equal(campaignBossRewardTier({id:"restored-id",faction:"abyss"}),"abyss");
 assert.equal(campaignBossRewardTier("floor-boss-10"),"normal")
});
