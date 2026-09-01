import test from"node:test";
import assert from"node:assert/strict";
import{COMPLETE_MONSTER_CODEX,codexCollectionSummary,ownedCodexKeys}from"../src/core/CollectionRewardSystem.js";
import{ACHIEVEMENT_DEFINITIONS,achievementMetrics,achievementSummary,syncAchievementRewardInbox}from"../src/core/AchievementRewardSystem.js";
import{enqueueNoticeReward,normalizeNoticeState,pendingNoticeRewards,claimNoticeReward}from"../src/core/NoticeSystem.js";
import{FLOOR_BOSS_CATALOG}from"../src/data/floorBosses.js";

function state(overrides={}){
 return{player:{maxFloor:1,gold:0,crystals:0,bossKills:{},bossRewards:{},pendingBossRewards:{}},monsters:[],equipment:[],reserveEquipment:[],bossEquipmentVault:[],inventory:{captureCrystals:0,abyssKeys:0,experienceItemsUltra:0,fullHeals:0,partyFullHeals:0},notices:{readIds:[],dailyGift:{},rewardInbox:[]},collectionRewards:{queuedMilestones:[]},codex:{encounters:{},captures:{},equipment:{},acquiredMonsterKeys:[]},achievements:{},records:{kills:0,captures:0,chests:0,combatPower:{highest:0,previous:0}},onlineParty:{expeditionsCompleted:0,battlesWon:0,raidWins:0,completedTradeIds:[],tradeHistory:[]},floorBossChallenges:{victories:{},contracts:{}},endgame:{},...overrides}
}

test("catalog is exactly 353 and contains every limited contract",()=>{
 assert.equal(COMPLETE_MONSTER_CODEX.length,353);
 assert.equal(new Set(COMPLETE_MONSTER_CODEX.map(entry=>entry.key)).size,353);
 const limited=COMPLETE_MONSTER_CODEX.filter(entry=>entry.group==="限定魔物").map(entry=>entry.id).sort();
 assert.deepEqual(limited,["dev_familiar_chappy","juvenile_amalga","myth_enami","myth_hide","myth_rion","myth_yori"].sort());
});

test("codex acquisition is permanent and special bodies count exactly once",()=>{
 const ordinary=COMPLETE_MONSTER_CODEX.find(entry=>entry.kind==="ordinary"),boss=FLOOR_BOSS_CATALOG[0],save=state();
 save.monsters=[{speciesId:ordinary.speciesId}];assert.equal(ownedCodexKeys(save).has(ordinary.key),true);
 save.monsters=[];assert.equal(ownedCodexKeys(save).has(ordinary.key),true,"released monsters stay discovered");
 const special=state({monsters:[{speciesId:boss.speciesId,floorBossCatalogId:boss.id}],codex:{encounters:{},captures:{[boss.speciesId]:1},equipment:{},acquiredMonsterKeys:["floorBoss:not-real"]}}),keys=ownedCodexKeys(special);
 assert.deepEqual([...keys],[`floorBoss:${boss.id}`]);assert.equal(codexCollectionSummary(special).owned,1);
});

test("released legacy contracts do not reveal a duplicate ordinary body",()=>{
 const floorBoss=COMPLETE_MONSTER_CODEX.find(entry=>entry.kind==="floorBoss"),endgame=COMPLETE_MONSTER_CODEX.find(entry=>entry.kind==="abyss");
 const save=state({monsters:[],codex:{encounters:{},captures:{[floorBoss.speciesId]:2,[endgame.speciesId]:3},equipment:{}},floorBossChallenges:{contracts:{[floorBoss.id]:true}},endgame:{emergency:{contracts:{[endgame.id]:{contracted:true}}}}}),keys=ownedCodexKeys(save);
 assert.equal(keys.has(floorBoss.key),true);assert.equal(keys.has(endgame.key),true);
 assert.equal(keys.has(`species:${floorBoss.speciesId}`),false);assert.equal(keys.has(`species:${endgame.speciesId}`),false);
 const uncontracted=state({monsters:[],endgame:{emergency:{contracts:{[endgame.id]:{contracted:false}}}}});
 assert.equal(ownedCodexKeys(uncontracted).has(endgame.key),false);
 const legacyContract=state({monsters:[],endgame:{contracts:{[endgame.id]:true},emergency:{contracts:{[endgame.id]:{contracted:false}}}}});
 assert.equal(ownedCodexKeys(legacyContract).has(endgame.key),true,"either legacy contract ledger preserves acquisition");
});

test("weekly raid juvenile never counts as a serial-code achievement",()=>{
 const save=state({monsters:["myth_enami","myth_hide","myth_rion","juvenile_amalga"].map(speciesId=>({speciesId}))});
 assert.equal(achievementMetrics(save).serialOwned,3);
 save.monsters.push({speciesId:"myth_yori"});
 assert.equal(achievementMetrics(save).serialOwned,4);
});

test("all unclaimed inbox rewards survive beyond the claimed-history cap",()=>{
 const save=state();
 for(let index=0;index<200;index++)assert.equal(enqueueNoticeReward(save,{id:`pending-${index}`,title:`報酬${index}`,reward:{gold:1},receivedAt:1_700_000_000_000+index}).ok,true);
 assert.equal(pendingNoticeRewards(save).length,200);assert.equal(save.notices.rewardInbox.length,200);
 save.notices.rewardInbox.forEach(entry=>entry.claimedAt=new Date(1_700_100_000_000).toISOString());normalizeNoticeState(save);
 assert.equal(save.notices.rewardInbox.length,160,"only claimed history is capped");
});

test("retroactive achievements queue once and equipment failure remains unclaimed",()=>{
 const save=state();save.player.maxFloor=1000;save.records.kills=100;
 const first=syncAchievementRewardInbox(save,{now:1_700_000_000_000}),second=syncAchievementRewardInbox(save,{now:1_700_000_000_100});
 assert.ok(first.added>=5);assert.equal(second.added,0);assert.equal(achievementSummary(save).unlocked,first.summary.unlocked);
 assert.equal(ACHIEVEMENT_DEFINITIONS.length,achievementSummary(save).total);
 const id="achievement-floor-1000-v1",beforeGold=save.player.gold,failed=claimNoticeReward(save,id,{grantMythicEquipment:()=>({ok:false}),now:1_700_000_000_200});
 assert.equal(failed.ok,false);assert.equal(save.player.gold,beforeGold);assert.equal(save.notices.rewardInbox.find(entry=>entry.id===id).claimedAt,null);
 const claimed=claimNoticeReward(save,id,{grantMythicEquipment:()=>({ok:true,location:"vault"}),now:1_700_000_000_300});assert.equal(claimed.ok,true);
 assert.ok(save.player.gold>beforeGold);assert.equal(claimNoticeReward(save,id,{grantMythicEquipment:()=>({ok:true})}).duplicate,true);
 save.notices.rewardInbox=save.notices.rewardInbox.filter(entry=>entry.id!==id);
 assert.equal(achievementSummary(save).statuses.find(entry=>entry.id==="floor-1000").claimed,true,"trimmed claimed history stays claimed in the ledger");
});
