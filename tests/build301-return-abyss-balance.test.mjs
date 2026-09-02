import test from"node:test";
import assert from"node:assert/strict";
import{
 goldForClearedFloor,
 idleEquipmentDropCount,
 idleRewardProfile,
 manualEquipmentDropCount,
 returnRewardGrade,
 idleReturnPreview,
 claimIdleReturn,
 beginManualExpedition,
 recordManualFloorClear,
 claimManualReturn,
 normalizeReturnRewards
}from"../src/core/ReturnRewardSystem.js";
import{
 ABYSS_SKILL_NODES,
 ABYSS_SKILL_TREE_VERSION,
 abyssExpansionRewardScale,
 abyssExplorationChance,
 createAbyssSkillTreeState,
 normalizeAbyssSkillTree
}from"../src/core/AbyssSkillTreeSystem.js";

const MINUTE=60_000,HOUR=60*MINUTE,T0=1_700_000_000_000;

function rewardState(maxFloor=100,clock=T0){
 return{
  player:{gold:0,currentFloor:maxFloor,maxFloor,exploreRun:{id:null,floors:{}}},
  monsters:[],party:[],equipment:[],reserveEquipment:[],bossEquipmentVault:[],
  returnRewards:{idle:{lastClaimAt:clock,lastGoldClaimAt:clock,lastEquipmentClaimAt:clock}},
  abyssSkillTree:createAbyssSkillTreeState()
 };
}

function learnedTreeState(nodeId){
 const node=ABYSS_SKILL_NODES.find(entry=>entry.id===nodeId);
 return{
  player:{gold:0},monsters:[],party:[],
  abyssSkillTree:{version:ABYSS_SKILL_TREE_VERSION,learned:[nodeId],grandfathered:[nodeId],paidCosts:{[nodeId]:node.cost},investedGold:node.cost}
 };
}

test("idle profiles follow the 100-floor campaign bands",()=>{
 const cases=[
  [1,.50,8],[9,.50,8],[10,.60,10],[29,.60,10],[30,.65,12],[49,.65,12],
  [50,.70,14],[69,.70,14],[70,.75,16],[79,.75,16],[80,.80,18],[89,.80,18],
  [90,.85,20],[99,.85,20],[100,.90,24]
 ];
 for(const[floor,expeditionRate,maxHours]of cases)assert.deepEqual(idleRewardProfile(floor),{minFloor:idleRewardProfile(floor).minFloor,maxFloor:idleRewardProfile(floor).maxFloor,expeditionRate,maxHours});
 assert.equal(idleRewardProfile(Number.NaN).minFloor,1);
 assert.equal(idleRewardProfile(999).minFloor,100);
 assert.equal(idleEquipmentDropCount(2*HOUR-1),0);
 assert.equal(idleEquipmentDropCount(2*HOUR),1);
 assert.equal(idleEquipmentDropCount(24*HOUR),12);
 assert.equal(idleEquipmentDropCount(48*HOUR),12);
});

test("manual return drops and report grades fit the shorter campaign",()=>{
 assert.deepEqual([0,1,2,3,4,5,20].map(manualEquipmentDropCount),[0,1,1,2,2,3,3]);
 assert.deepEqual([0,1,3,5,10,20].map(floors=>returnRewardGrade(floors)),["C","B","A","S","SS","SSS"]);
 assert.equal(returnRewardGrade(0,[{rarity:"SSR"}]),"SS");
 assert.equal(returnRewardGrade(0,[{item:{rarity:"LR"}}]),"SSS");
});

test("100F idle return uses legacy depth 900 and the 24-hour cap",()=>{
 const preview=idleReturnPreview(rewardState(100),T0+24*HOUR);
 assert.equal(preview.floorUnits,288);
 assert.equal(preview.expeditionFloor,90);
 assert.equal(preview.rewardDepth,900);
 assert.equal(preview.goldPerUnit,13_920);
 assert.equal(preview.baseGold,4_008_960);
 assert.equal(preview.gold,4_008_960);
 assert.equal(preview.equipmentCount,12);
 assert.equal(preview.maxHours,24);
 assert.equal(preview.capped,true);
 assert.equal(preview.equipmentCapped,true);

 const cappedState=rewardState(100),overCap=idleReturnPreview(cappedState,T0+30*HOUR);
 assert.equal(overCap.floorUnits,288);
 assert.equal(overCap.equipmentCount,12);
 claimIdleReturn(cappedState,T0+30*HOUR);
 assert.equal(cappedState.returnRewards.idle.lastGoldClaimAt,T0+30*HOUR);
 assert.equal(cappedState.returnRewards.idle.lastEquipmentClaimAt,T0+30*HOUR);
 assert.equal(idleReturnPreview(cappedState,T0+30*HOUR).available,false);
});

test("gold claims do not reset the separate two-hour equipment clock",()=>{
 const state=rewardState(100);
 const first=claimIdleReturn(state,T0+5*MINUTE);
 assert.equal(first.floorUnits,1);
 assert.equal(first.equipmentCount,0);
 assert.equal(state.returnRewards.idle.lastGoldClaimAt,T0+5*MINUTE);
 assert.equal(state.returnRewards.idle.lastEquipmentClaimAt,T0);

 const originalRandom=Math.random;
 try{
  Math.random=()=>.5;
  const second=claimIdleReturn(state,T0+2*HOUR);
  assert.equal(second.floorUnits,23);
  assert.equal(second.equipmentCount,1);
  assert.equal(state.returnRewards.idle.lastGoldClaimAt,T0+2*HOUR);
  assert.equal(state.returnRewards.idle.lastEquipmentClaimAt,T0+2*HOUR);
  assert.equal(second.equipment[0].item.level,900);
  assert.equal(second.equipment[0].item.obtainedFloor,90);
 }finally{Math.random=originalRandom}
});

test("idle claim preserves partial intervals and migrates legacy clocks",()=>{
 const state=rewardState(100);
 const claim=claimIdleReturn(state,T0+9*MINUTE);
 assert.equal(claim.floorUnits,1);
 assert.equal(state.returnRewards.idle.lastGoldClaimAt,T0+5*MINUTE);
 assert.equal(state.returnRewards.idle.lastEquipmentClaimAt,T0);
 assert.equal(idleReturnPreview(state,T0+10*MINUTE).floorUnits,1);

 claimIdleReturn(state,T0+119*MINUTE);
 assert.equal(state.returnRewards.idle.lastEquipmentClaimAt,T0);
 assert.equal(idleReturnPreview(state,T0+2*HOUR).equipmentCount,1);

 const legacy=rewardState(50);
 legacy.returnRewards.idle={lastClaimAt:T0};
 normalizeReturnRewards(legacy,T0+HOUR);
 assert.equal(legacy.returnRewards.idle.lastGoldClaimAt,T0);
 assert.equal(legacy.returnRewards.idle.lastEquipmentClaimAt,T0);
 assert.equal(legacy.returnRewards.idle.lastClaimAt,T0);

 legacy.returnRewards.idle={lastClaimAt:T0+3*HOUR,lastGoldClaimAt:T0+3*HOUR,lastEquipmentClaimAt:T0+3*HOUR};
 normalizeReturnRewards(legacy,T0+HOUR);
 assert.equal(legacy.returnRewards.idle.lastGoldClaimAt,T0+HOUR);
 assert.equal(legacy.returnRewards.idle.lastEquipmentClaimAt,T0+HOUR);
});

test("manual return rewards campaign floors at their legacy-depth equivalent",()=>{
 const state=rewardState(49);
 beginManualExpedition(state,49);
 state.player.currentFloor=50;
 const run=recordManualFloorClear(state,50);
 assert.equal(run.floorsCleared,1);
 assert.equal(run.pendingGold,goldForClearedFloor(500));
 assert.equal(run.pendingGold,27_136);

 const originalRandom=Math.random;
 try{
  Math.random=()=>.5;
  const claimed=claimManualReturn(state);
  assert.equal(claimed.gold,27_136);
  assert.equal(claimed.equipment.length,1);
  assert.equal(claimed.equipment[0].item.level,500);
  assert.equal(claimed.equipment[0].item.obtainedFloor,50);
 }finally{Math.random=originalRandom}
});

test("Abyss tree v7 has the intended prices and restrained late scaling",()=>{
 assert.equal(ABYSS_SKILL_TREE_VERSION,7);
 assert.equal(ABYSS_SKILL_NODES.length,297);
 assert.equal(ABYSS_SKILL_NODES.reduce((sum,node)=>sum+node.cost,0),986_346_000);
 for(const category of["economy","combat","exploration"]){
  assert.deepEqual(ABYSS_SKILL_NODES.filter(node=>node.category===category&&node.tier<=4).map(node=>node.cost),[1_000,3_000,3_000,10_000,10_000,30_000]);
 }
 const lane=ABYSS_SKILL_NODES.filter(node=>node.category==="economy"&&node.branchId==="gold-vein");
 assert.equal(lane[0].cost,5_000);
 assert.equal(lane.at(-1).cost,10_000_000);
 assert.equal(lane.reduce((sum,node)=>sum+node.cost,0),109_575_000);
 assert.deepEqual([0,7,8,15,16,23,24,29,30].map(abyssExpansionRewardScale),[1,1,1.25,1.25,1.5,1.5,2,2,2.5]);
});

test("v7 refunds only positive v6 price differences and is idempotent",()=>{
 const node=ABYSS_SKILL_NODES.find(entry=>entry.id==="economy-gold-vein-01");
 assert.equal(node.previousCost,30_000);
 assert.equal(node.cost,5_000);
 for(const paidCosts of[{[node.id]:30_000},{}]){
  const state={player:{gold:100},monsters:[],party:[],abyssSkillTree:{version:6,learned:[node.id],paidCosts}};
  normalizeAbyssSkillTree(state);
  assert.equal(state.player.gold,25_100);
  assert.equal(state.abyssSkillRebalance.version,7);
  assert.equal(state.abyssSkillRebalance.refund,25_000);
  assert.equal(state.abyssSkillTree.paidCosts[node.id],5_000);
  assert.equal(state.abyssSkillTree.investedGold,5_000);
  normalizeAbyssSkillTree(state);
  assert.equal(state.player.gold,25_100);
 }

 const root=ABYSS_SKILL_NODES.find(entry=>entry.id==="economy-gold-sense");
 const upward={player:{gold:100},monsters:[],party:[],abyssSkillTree:{version:6,learned:[root.id],paidCosts:{}}};
 normalizeAbyssSkillTree(upward);
 assert.equal(upward.player.gold,100,"a price increase must never create a negative refund or debit an old save");
});

test("exploration quantity bonuses no longer inflate unrelated probabilities",()=>{
 const general=learnedTreeState("exploration-fate-compass-01");
 assert.equal(abyssExplorationChance(general,.10,null),.10);

 const equipment=learnedTreeState("exploration-relic-sense");
 assert.ok(Math.abs(abyssExplorationChance(equipment,.10,"equipmentDropRate",{additive:true})-.15)<1e-12);

 const key=learnedTreeState("exploration-key-echo");
 assert.ok(Math.abs(abyssExplorationChance(key,.002,"abyssKeyDropRate")-.0022)<1e-12);
});
