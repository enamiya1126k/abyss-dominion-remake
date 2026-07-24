import{createEquipment}from"../models/Equipment.js?v=1.1.0";
import{receiveEquipment}from"../services/EquipmentStorage.js?v=1.4.0";
import{abyssEquipmentRarityBonus}from"./AbyssSkillTreeSystem.js?v=1.4.0";
import{modifiedGoldReward}from"./GoldRewardSystem.js?v=1.4.0";
import{goldForClearedFloor}from"./GoldEconomySystem.js?v=1.1.0";

export{goldForClearedFloor}from"./GoldEconomySystem.js?v=1.1.0";

const EMPTY_MANUAL={active:false,startFloor:1,lastFloor:1,floorsCleared:0,pendingGold:0,startedAt:null};
const IDLE_FLOOR_INTERVAL_MS=5*60*1000;
const IDLE_REWARD_RATE=.1;
const IDLE_EQUIPMENT_INTERVAL_MS=2*60*60*1000;
const IDLE_MAX_EQUIPMENT=4;

export const IDLE_REWARD_PROFILES=Object.freeze([
 {minFloor:1,maxFloor:99,expeditionRate:.60,maxHours:4},
 {minFloor:100,maxFloor:499,expeditionRate:.70,maxHours:6},
 {minFloor:500,maxFloor:999,expeditionRate:.75,maxHours:8},
 {minFloor:1000,maxFloor:2999,expeditionRate:.80,maxHours:10},
 {minFloor:3000,maxFloor:6999,expeditionRate:.85,maxHours:12},
 {minFloor:7000,maxFloor:8999,expeditionRate:.90,maxHours:16},
 {minFloor:9000,maxFloor:10000,expeditionRate:.95,maxHours:24}
]);

export const RETURN_RARITY_RATES=[
 {rarity:"LR",rate:.001,label:"0.1%"},
 {rarity:"SSR",rate:.039,label:"3.9%"},
 {rarity:"SR",rate:.16,label:"16.0%"},
 {rarity:"R",rate:.35,label:"35.0%"},
 {rarity:"N",rate:.45,label:"45.0%"}
];

export function returnRarityRates(state=null){
 if(!state)return RETURN_RARITY_RATES;
 const luck=abyssEquipmentRarityBonus(state);
 const lr=Math.min(.20,.001+luck*.002);
 const ssrThreshold=Math.min(.55,.04+luck*.02);
 const srThreshold=Math.min(.75,.20+luck*.04);
 const rThreshold=.55;
 const rates=[
  ["LR",lr],
  ["SSR",Math.max(0,ssrThreshold-lr)],
  ["SR",Math.max(0,srThreshold-ssrThreshold)],
  ["R",Math.max(0,rThreshold-srThreshold)],
  ["N",Math.max(0,1-Math.max(rThreshold,srThreshold))]
 ];
 return rates.map(([rarity,rate])=>({rarity,rate,label:`${(rate*100).toFixed(1)}%`}));
}

export function returnRewardGrade(floorsCleared,equipment=[]){
 const floors=Math.max(0,Math.floor(Number(floorsCleared)||0));
 const rarities=(equipment??[]).map(entry=>entry?.item?.rarity??entry?.rarity);
 if(rarities.includes("LR")||floors>=100)return"SSS";
 if(rarities.includes("SSR")||floors>=50)return"SS";
 if(rarities.includes("SR")||floors>=20)return"S";
 if(floors>=10)return"A";
 if(floors>=5)return"B";
 return"C";
}

function safeFloor(value){return Math.max(1,Math.min(10000,Math.floor(Number(value)||1)))}

export function idleRewardProfile(maxFloor){
 const floor=safeFloor(maxFloor);
 return IDLE_REWARD_PROFILES.find(profile=>floor>=profile.minFloor&&floor<=profile.maxFloor)??IDLE_REWARD_PROFILES.at(-1);
}

export function manualEquipmentDropCount(floorsCleared){
 const n=Math.max(0,Math.floor(Number(floorsCleared)||0));
 if(n<5)return 0;
 if(n<10)return 1;
 if(n<20)return 2;
 return 3;
}

export function rollManualReturnRarity(state=null){
 const r=Math.random();
 let threshold=0;
 for(const entry of returnRarityRates(state)){
  threshold+=entry.rate;
  if(r<threshold)return entry.rarity;
 }
 return"N";
}

function randomEquipmentSlot(){
 const slots=["weapon","armor","accessory"];
 return slots[Math.floor(Math.random()*slots.length)];
}

function createManualReturnEquipment(state){
 return createEquipment(randomEquipmentSlot(),{rarity:rollManualReturnRarity(state)});
}

export function idleEquipmentDropCount(elapsedMs){
 const ms=Math.max(0,Number(elapsedMs)||0);
 return Math.min(IDLE_MAX_EQUIPMENT,Math.floor(ms/IDLE_EQUIPMENT_INTERVAL_MS));
}

export function rollIdleReturnRarity(state=null){
 // Same rarity table as manual return, but far fewer rolls (one per 2 hours, max 4).
 return rollManualReturnRarity(state);
}

function createIdleReturnEquipment(state){
 return createEquipment(randomEquipmentSlot(),{rarity:rollIdleReturnRarity(state)});
}

export function normalizeReturnRewards(state){
 state.returnRewards??={};
 const current=safeFloor(state.player?.currentFloor);
 const manual=state.returnRewards.manual&&typeof state.returnRewards.manual==="object"?state.returnRewards.manual:{};
 state.returnRewards.manual={
  active:Boolean(manual.active),
  startFloor:safeFloor(manual.startFloor??current),
  lastFloor:safeFloor(manual.lastFloor??current),
  floorsCleared:Math.max(0,Math.floor(Number(manual.floorsCleared)||0)),
  pendingGold:Math.max(0,Math.floor(Number(manual.pendingGold)||0)),
  startedAt:Number.isFinite(Number(manual.startedAt))?Number(manual.startedAt):null
 };
 state.returnRewards.history??={totalManualReturns:0,totalManualFloors:0,totalManualGold:0,totalIdleClaims:0,totalIdleGold:0};
 for(const key of["totalManualReturns","totalManualFloors","totalManualGold","totalIdleClaims","totalIdleGold"]){
  state.returnRewards.history[key]=Math.max(0,Math.floor(Number(state.returnRewards.history[key])||0));
 }
 const idle=state.returnRewards.idle&&typeof state.returnRewards.idle==="object"?state.returnRewards.idle:{};
 const now=Date.now(),rawLast=Number(idle.lastClaimAt),profile=idleRewardProfile(state.player?.maxFloor);
 state.returnRewards.idle={
  lastClaimAt:Number.isFinite(rawLast)&&rawLast>0?Math.min(rawLast,now):now,
  maxHours:profile.maxHours
 };
 return state.returnRewards;
}

export function beginManualExpedition(state,startFloor=state.player?.currentFloor){
 normalizeReturnRewards(state);
 const floor=safeFloor(startFloor);
 state.returnRewards.manual={...EMPTY_MANUAL,active:true,startFloor:floor,lastFloor:floor,startedAt:Date.now()};
 return state.returnRewards.manual;
}

export function ensureManualExpedition(state){
 normalizeReturnRewards(state);
 if(!state.returnRewards.manual.active)beginManualExpedition(state,state.player?.currentFloor);
 return state.returnRewards.manual;
}

export function recordManualFloorClear(state,reachedFloor){
 const run=ensureManualExpedition(state);
 const floor=safeFloor(reachedFloor);
 if(floor<=run.lastFloor)return run;
 for(let f=run.lastFloor+1;f<=floor;f++){
  run.floorsCleared++;
  run.pendingGold+=goldForClearedFloor(f);
 }
 run.lastFloor=floor;
 return run;
}

export function manualReturnPreview(state){
 const run=ensureManualExpedition(state);
 return{
  startFloor:run.startFloor,
  endFloor:safeFloor(state.player?.currentFloor),
  floorsCleared:run.floorsCleared,
  baseGold:run.pendingGold,
  gold:modifiedGoldReward(state,run.pendingGold,"manualReturn"),
  startedAt:run.startedAt,
  equipmentCount:manualEquipmentDropCount(run.floorsCleared)
 };
}

export function claimManualReturn(state){
 const preview=manualReturnPreview(state);
 state.player.gold=Math.max(0,Math.floor(Number(state.player.gold)||0))+preview.gold;
 const equipment=[];
 for(let i=0;i<preview.equipmentCount;i++){
  const item=createManualReturnEquipment(state);
  const receipt=receiveEquipment(state,item);
  equipment.push({item,receipt});
 }
 const history=state.returnRewards.history;
 history.totalManualReturns++;
 history.totalManualFloors+=preview.floorsCleared;
 history.totalManualGold+=preview.gold;
 state.returnRewards.manual={...EMPTY_MANUAL,startFloor:preview.endFloor,lastFloor:preview.endFloor};
 return{...preview,equipment};
}

export function abandonManualExpedition(state){
 normalizeReturnRewards(state);
 const floor=safeFloor(state.player?.currentFloor);
 state.returnRewards.manual={...EMPTY_MANUAL,startFloor:floor,lastFloor:floor};
}


export function idleExpeditionFloor(state){
 normalizeReturnRewards(state);
 const maxFloor=safeFloor(state.player?.maxFloor);
 const profile=idleRewardProfile(maxFloor);
 return Math.max(1,Math.floor(maxFloor*profile.expeditionRate));
}

export function idleReturnPreview(state,now=Date.now()){
 normalizeReturnRewards(state);
 const idle=state.returnRewards.idle;
 const current=Math.max(0,Number(now)||Date.now());
 const maxMs=idle.maxHours*60*60*1000;
 const elapsedMs=Math.max(0,Math.min(maxMs,current-idle.lastClaimAt));
 const floorUnits=Math.floor(elapsedMs/IDLE_FLOOR_INTERVAL_MS);
 const profile=idleRewardProfile(state.player?.maxFloor);
 const expeditionFloor=idleExpeditionFloor(state);
 const goldPerUnit=Math.max(1,Math.round(goldForClearedFloor(expeditionFloor)*IDLE_REWARD_RATE));
 const baseGold=floorUnits*goldPerUnit;
 return{
  elapsedMs,
  floorUnits,
  expeditionFloor,
  goldPerUnit,
  baseGold,
  gold:modifiedGoldReward(state,baseGold,"idleReturn"),
  equipmentCount:idleEquipmentDropCount(elapsedMs),
  maxHours:idle.maxHours,
  expeditionRate:profile.expeditionRate,
  capped:current-idle.lastClaimAt>=maxMs,
  available:floorUnits>0
 };
}

export function claimIdleReturn(state,now=Date.now()){
 const preview=idleReturnPreview(state,now);
 if(!preview.available)return preview;
 state.player.gold=Math.max(0,Math.floor(Number(state.player.gold)||0))+preview.gold;
 const equipment=[];
 for(let i=0;i<preview.equipmentCount;i++){
  const item=createIdleReturnEquipment(state);
  const receipt=receiveEquipment(state,item);
  equipment.push({item,receipt});
 }
 state.returnRewards.idle.lastClaimAt=Math.max(0,Number(now)||Date.now());
 state.returnRewards.history.totalIdleClaims++;
 state.returnRewards.history.totalIdleGold+=preview.gold;
 return{...preview,equipment,claimed:true};
}
