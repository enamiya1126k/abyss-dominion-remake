import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

import{
 GACHA_HISTORY_ENTRY_LIMIT,
 GACHA_PITY_LIMITS,
 gachaPityForcedRarity,
 normalizeGachaDrawHistory,
 recordGachaDraw,
 recordGachaPityDraw,
 rollSummonRarityWithPity,
 selectBalancedGachaEntry
}from"../src/core/GachaBalanceSystem.js";
import{bossExperiencePackReward}from"../src/core/BossRewardSystem.js";
import{teamBattleRewardEntitlements,teamBattleRewardPreview}from"../src/core/EndgameSystem.js";
import{rollTreasureChestReward}from"../src/core/TreasureSystem.js";
import{EQUIPMENT_SELL_BASES,equipmentSellPrice}from"../src/services/EquipmentStorage.js";
import{equipmentCraftingEconomicFloor,rerollGoldCost}from"../src/services/EquipmentAffixCrafting.js";

function sequence(values,fallback=.5){
 let index=0;
 return()=>values[index++]??fallback;
}

test("gacha pool selection consumes a persisted shuffle bag",()=>{
 const pool=Array.from({length:12},(_,index)=>({id:`entry-${index}`}));
 let history={},previous=null;
 for(let cycle=0;cycle<4;cycle++){
  const seen=new Set();
  for(let draw=0;draw<pool.length;draw++){
   const selected=selectBalancedGachaEntry(pool,{random:()=>.37,recentKeys:history.standard??[],keyOf:entry=>entry.id});
   assert.equal(seen.has(selected.id),false,`duplicate ${selected.id} in cycle ${cycle}`);
   if(draw===0&&previous!==null)assert.notEqual(selected.id,previous,"bag boundary repeated the last item");
   seen.add(selected.id);previous=selected.id;history=recordGachaDraw(history,"standard",selected.id);
  }
  assert.equal(seen.size,pool.length);
 }
 assert.ok(GACHA_HISTORY_ENTRY_LIMIT>=pool.length);
 let oversized={standard:Array.from({length:GACHA_HISTORY_ENTRY_LIMIT+25},(_,index)=>`old-${index}`)};
 oversized=normalizeGachaDrawHistory(oversized);
 assert.equal(oversized.standard.length,GACHA_HISTORY_ENTRY_LIMIT);
 assert.equal(oversized.standard.at(-1),`old-${GACHA_HISTORY_ENTRY_LIMIT+24}`);
});

test("paid rarity ceilings force UR+, LR+ and Mythic at 50/150/300",()=>{
 assert.deepEqual(GACHA_PITY_LIMITS,{urPlus:50,lrPlus:150,mythic:300});
 let pity={};
 for(let draw=0;draw<49;draw++)pity=rollSummonRarityWithPity("normal",pity,()=>.999).pity;
 assert.equal(gachaPityForcedRarity(pity),"UR");
 const ur=rollSummonRarityWithPity("normal",pity,()=>.999);
 assert.deepEqual({rarity:ur.rarity,forced:ur.forced,urPlus:ur.pity.urPlus},{rarity:"UR",forced:true,urPlus:0});
 const lr=rollSummonRarityWithPity("normal",{urPlus:0,lrPlus:149,mythic:20},()=>.999);
 assert.equal(lr.rarity,"LR");assert.equal(lr.forced,true);assert.equal(lr.pity.lrPlus,0);
 const mythic=rollSummonRarityWithPity("normal",{urPlus:49,lrPlus:149,mythic:299},()=>.999);
 assert.equal(mythic.rarity,"神話");assert.equal(mythic.forced,true);assert.deepEqual(mythic.pity,{urPlus:0,lrPlus:0,mythic:0});
 assert.deepEqual(recordGachaPityDraw({urPlus:3,lrPlus:4,mythic:5},"LR"),{urPlus:0,lrPlus:0,mythic:6});
});

test("boss EXP packs follow the 30/50/70-floor campaign thresholds",()=>{
 assert.deepEqual({tier:bossExperiencePackReward(1).tier,amount:bossExperiencePackReward(1).amount},{tier:"small",amount:1});
 assert.deepEqual({tier:bossExperiencePackReward(10).tier,amount:bossExperiencePackReward(10).amount},{tier:"small",amount:2});
 assert.deepEqual({tier:bossExperiencePackReward(20).tier,amount:bossExperiencePackReward(20).amount},{tier:"small",amount:3});
 assert.deepEqual({tier:bossExperiencePackReward(30).tier,amount:bossExperiencePackReward(30).amount},{tier:"medium",amount:2});
 assert.equal(bossExperiencePackReward(49).tier,"medium");
 assert.equal(bossExperiencePackReward(50).tier,"large");
 assert.equal(bossExperiencePackReward(69).tier,"large");
 assert.equal(bossExperiencePackReward(70).tier,"ultra");
 for(const floor of[1,10,20,30,49,50,69,70,100]){const reward=bossExperiencePackReward(floor);assert.ok(reward.levelSpan*reward.amount<=10)}
});

test("4v4 rewards remain worthwhile from the first trial",()=>{
 const first=teamBattleRewardPreview(1,1);
 assert.equal(first.goldMultiplier,.5);
 assert.equal(first.crystals,25);
 const tenth=teamBattleRewardEntitlements(10,{firstClear:true});
 assert.equal(tenth.breakthroughReward,true);
 assert.equal(tenth.bonusCrystals,100);
 assert.equal(tenth.captureCrystals,50);
 assert.equal(tenth.guaranteedRarity,"SR");
 assert.ok(teamBattleRewardPreview(20).crystals>first.crystals);
});

test("ordinary box equipment distributes weapon, armor and accessory evenly",()=>{
 const slotFor=value=>rollTreasureChestReward({floor:40,kind:"box",baseGold:100,random:sequence([0,.99,value,.5,.5])}).equipment?.slot;
 assert.equal(slotFor(.01),"weapon");
 assert.equal(slotFor(.5),"armor");
 assert.equal(slotFor(.99),"accessory");
 const counts={weapon:0,armor:0,accessory:0};
 for(let index=0;index<3000;index++){
  const value=(index%3+.5)/3,reward=rollTreasureChestReward({floor:40,kind:"box",baseGold:100,random:sequence([0,.99,value,.5,.5])});
  counts[reward.equipment.slot]++;
 }
 assert.deepEqual(counts,{weapon:1000,armor:1000,accessory:1000});
});

test("equipment sale values are meaningful and cap imported extreme levels",()=>{
 assert.deepEqual(EQUIPMENT_SELL_BASES,{N:50,R:150,SR:500,SSR:1500,UR:5000,LR:15000,"神話":50000,"深淵":150000,"十神":500000});
 assert.equal(equipmentSellPrice({rarity:"N",level:1,plus:0}),70);
 assert.equal(equipmentSellPrice({rarity:"神話",level:100,plus:0}),52000);
 assert.equal(equipmentSellPrice({rarity:"深淵",level:1000,plus:30}),185000);
 assert.equal(equipmentSellPrice({rarity:"N",level:99999,plus:0}),equipmentSellPrice({rarity:"N",level:1000,plus:0}));
 assert.equal(equipmentSellPrice({rarity:"N",level:1,plus:99999}),equipmentSellPrice({rarity:"N",level:1,plus:999}));
});

test("affix rerolls price the 100-floor campaign on the legacy 1000-floor curve",()=>{
 assert.equal(equipmentCraftingEconomicFloor(1),10);
 assert.equal(equipmentCraftingEconomicFloor(50),500);
 assert.equal(equipmentCraftingEconomicFloor(100),1000);
 assert.equal(equipmentCraftingEconomicFloor(9999),1000);
 const affixes=["hpPct","atkPct","critRate","bossDamage"].map((id,index)=>({id,value:index+1,quality:"normal",locked:false})),item={slot:"weapon",rarity:"神話",level:100,plus:0,affixes};
 assert.equal(rerollGoldCost({player:{maxFloor:100}},item),397100);
 item.affixes.slice(0,3).forEach(affix=>affix.locked=true);
 assert.equal(rerollGoldCost({player:{maxFloor:100}},item),3180000);
 assert.ok(rerollGoldCost({player:{maxFloor:50}},item)<rerollGoldCost({player:{maxFloor:100}},item));
});

test("main wires paid pity, split idle clocks, and campaign milestone depth",async()=>{
 const source=await readFile(new URL("../src/main.js",import.meta.url),"utf8");
 assert.match(source,/rollSummonRarityWithPity\(guarantee\?"guaranteed":"normal",save\.state\.gacha\.pity\)/);
 assert.match(source,/forcedRarity:pityRarity/);
 assert.match(source,/GOLDは5分ごと／装備は2時間ごと/);
 assert.match(source,/result\.goldElapsedMs/);
 assert.match(source,/result\.equipmentElapsedMs/);
 assert.match(source,/milestoneId=milestones\.includes\(requested\)\?requested:!requested\?milestones\[0\]:null/,'a touched Ten God keeps its authored boss identity instead of always selecting the first milestone');
 assert.match(source,/milestoneBossEntry\(milestoneId,floor\)/);
 assert.match(source,/economyFloor:legacyFloor/);
 assert.match(source,/goldForClearedFloor\(campaignFloorToLegacyFloor\(endFloor\)\)/,"online defeat caps use the same 100-floor-to-legacy economy depth as rewards");
 assert.match(source,/goldForClearedFloor\(campaignFloorToLegacyFloor\(save\.state\.player\.currentFloor\)\)/,"offline defeat caps use the same 100-floor-to-legacy economy depth as rewards");
});

test("dedicated floor-boss equipment resolves both campaign trophies and legacy catalog exchanges",async()=>{
 const source=await readFile(new URL("../src/main.js",import.meta.url),"utf8"),start=source.indexOf("function dedicatedFloorBossEquipment("),end=source.indexOf("function dedicatedFloorBossWeapon(",start),helper=source.slice(start,end);
 assert.ok(start>=0&&end>start);
 const run=new Function("inputFloor",`
  const CAMPAIGN_MAX_FLOOR=100,definition={id:"boss-10",floor:10,cycleFloor:10},design={name:"専用王装",slot:"weapon",stats:{atk:3}};
  const floorBossDefinitionById=id=>id===definition.id?definition:null;
  const floorBossDefinitionForFloor=floor=>floor===1?definition:null;
  const floorBossEquipmentDesignByPiece=id=>id===definition.id?design:null;
  const EQUIPMENT_BASES={weapon:[{id:"sword"}],armor:[],accessory:[]},randomFrom=list=>list[0];
  const createEquipment=(slot,options)=>({slot,rarity:options.rarity,stats:{atk:1},ruleOverrides:options.ruleOverrides});
  const equipmentDropLevelForFloor=floor=>floor,normalizeFloorBossDedicatedItem=()=>{};
  ${helper}
  return dedicatedFloorBossEquipment(inputFloor,{floorBossCatalogId:"boss-10"},"weapon");
 `);
 const trophy=run(1),exchange=run(10);
 assert.deepEqual({level:trophy.level,obtainedFloor:trophy.obtainedFloor,atk:trophy.stats.atk},{level:10,obtainedFloor:1,atk:4});
 assert.deepEqual({level:exchange.level,obtainedFloor:exchange.obtainedFloor,atk:exchange.stats.atk},{level:10,obtainedFloor:1,atk:4});
});
