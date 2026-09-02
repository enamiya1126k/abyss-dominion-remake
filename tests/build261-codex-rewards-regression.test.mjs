import test from"node:test";
import assert from"node:assert/strict";
import{COMPLETE_MONSTER_CODEX,codexCollectionSummary,ownedCodexKeys,syncCollectionRewardInbox}from"../src/core/CollectionRewardSystem.js";
import{FLOOR_BOSS_CATALOG}from"../src/data/floorBosses.js";
import{ENDGAME_BOSSES}from"../src/core/EndgameSystem.js";
import{claimNoticeReward,enqueueNoticeReward,pendingNoticeRewards}from"../src/core/NoticeSystem.js";
import{SaveService}from"../src/services/SaveService.js";
import{createMonster}from"../src/models/Monster.js";

class MemoryStorage{
 constructor(){this.values=new Map()}
 getItem(key){return this.values.get(key)??null}
 setItem(key,value){this.values.set(key,String(value))}
 removeItem(key){this.values.delete(key)}
}

function rewardState(monsters=[]){return{monsters,player:{gold:0,crystals:0},inventory:{captureCrystals:0,abyssKeys:0,experienceItemsUltra:0,fullHeals:0,partyFullHeals:0},notices:{readIds:[],dailyGift:{},rewardInbox:[]},collectionRewards:{queuedMilestones:[]}}}

test("complete codex contains every authored monster family",()=>{
 const groups=COMPLETE_MONSTER_CODEX.reduce((map,entry)=>(map.set(entry.group,(map.get(entry.group)??0)+1),map),new Map());
 assert.equal(groups.get("階層ボス"),FLOOR_BOSS_CATALOG.length);
 assert.equal(groups.get("深淵")+groups.get("十神"),Object.keys(ENDGAME_BOSSES).length);
 assert.equal(COMPLETE_MONSTER_CODEX.length,353);
 assert.equal(groups.get("限定魔物"),6);
 assert.equal(new Set(COMPLETE_MONSTER_CODEX.map(entry=>entry.key)).size,COMPLETE_MONSTER_CODEX.length);
});

test("special codex entries open only from exact owned contracts",()=>{
 const floorBoss=FLOOR_BOSS_CATALOG[0],endgame=Object.values(ENDGAME_BOSSES)[0],state=rewardState([{speciesId:floorBoss.speciesId,floorBossCatalogId:floorBoss.id},{speciesId:endgame.speciesId,endgameBossId:endgame.id}]),keys=ownedCodexKeys(state);
 assert.ok(keys.has(`floorBoss:${floorBoss.id}`));assert.ok(keys.has(`endgame:${endgame.id}`));
 assert.equal(keys.has(`species:${floorBoss.speciesId}`),false);assert.equal(keys.has(`species:${endgame.speciesId}`),false);
 assert.equal(keys.size,2);
 assert.equal(codexCollectionSummary(state).owned,keys.size);
 const empty=ownedCodexKeys(rewardState([]));assert.equal(empty.has(`floorBoss:${floorBoss.id}`),false);assert.equal(empty.has(`endgame:${endgame.id}`),false);
});

test("collection milestones queue and claim exactly once",()=>{
 const species=COMPLETE_MONSTER_CODEX.filter(entry=>entry.kind==="ordinary").slice(0,10),state=rewardState(species.map(entry=>({speciesId:entry.speciesId})));
 const first=syncCollectionRewardInbox(state,{now:1_700_000_000_000}),second=syncCollectionRewardInbox(state,{now:1_700_000_000_100});
 assert.equal(first.added,1);assert.equal(second.added,0);assert.equal(pendingNoticeRewards(state).length,1);
 const id=state.notices.rewardInbox[0].id,claimed=claimNoticeReward(state,id,{now:1_700_000_000_200});assert.equal(claimed.ok,true);assert.ok(state.player.gold>0);assert.ok(state.player.crystals>0);
 const duplicate=claimNoticeReward(state,id,{now:1_700_000_000_300});assert.equal(duplicate.duplicate,true);assert.equal(pendingNoticeRewards(state).length,0);
});

test("server deliveries can be persisted in the same idempotent inbox",()=>{
 const state=rewardState(),delivery={id:"power-2026-08-24-AD-ABCD-EFGH",source:"ranking",title:"週間戦力ランキング #1",seasonId:"2026-08-24",rank:1,reward:{gold:100,crystals:10,mythicEquipment:1,equipmentPlus:99},receivedAt:Date.now()};
 assert.equal(enqueueNoticeReward(state,delivery).duplicate,false);assert.equal(enqueueNoticeReward(state,delivery).duplicate,true);
 let equipment=0;const result=claimNoticeReward(state,delivery.id,{grantMythicEquipment:()=>{equipment++;return{ok:true}},now:Date.now()});
 assert.equal(result.ok,true);assert.equal(equipment,1);assert.equal(state.player.gold,100);assert.equal(state.player.crystals,10);
});

test("legacy saves migrate collection rewards into the durable notice inbox",()=>{
 const previousStorage=globalThis.localStorage;globalThis.localStorage=new MemoryStorage();
 try{
  const seed=new SaveService(),species=COMPLETE_MONSTER_CODEX.filter(entry=>entry.kind==="ordinary").slice(0,10);
  seed.state.monsters=species.map((entry,index)=>createMonster(entry.speciesId,{nickname:`図鑑${index+1}`}));
  seed.state.party=seed.state.monsters.slice(0,4).map(monster=>monster.id);
  seed.state.schemaVersion=59;delete seed.state.collectionRewards;delete seed.state.notices.rewardInbox;
  localStorage.setItem("abyss-dominion-remake-v001",JSON.stringify(seed.state));
  const migrated=new SaveService().state;
  assert.equal(migrated.schemaVersion,75);
  assert.ok(Array.isArray(migrated.notices.rewardInbox));
  assert.equal(migrated.notices.rewardInbox.filter(entry=>entry.source==="codex").length,1);
  assert.deepEqual(migrated.collectionRewards.queuedMilestones,["10"]);
 }finally{
  if(previousStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=previousStorage;
 }
});
