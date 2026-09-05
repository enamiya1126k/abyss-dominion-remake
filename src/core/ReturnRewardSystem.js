import{createEquipment}from"../models/Equipment.js?v=3.1.1-build311";
import{receiveEquipment}from"../services/EquipmentStorage.js?v=3.1.1-build311";
import{abyssEquipmentRarityBonus}from"./AbyssSkillTreeSystem.js?v=3.1.1-build311";
import{modifiedGoldReward}from"./GoldRewardSystem.js?v=3.1.1-build311";
import{goldForClearedFloor}from"./GoldEconomySystem.js?v=3.1.1-build311";
import{CAMPAIGN_MAX_FLOOR,campaignFloorToLegacyFloor}from"./Campaign100System.js?v=3.1.1-build311";

export{goldForClearedFloor}from"./GoldEconomySystem.js?v=3.1.1-build311";

const EMPTY_MANUAL={active:false,startFloor:1,lastFloor:1,floorsCleared:0,pendingGold:0,startedAt:null};
const IDLE_FLOOR_INTERVAL_MS=5*60*1000;
const IDLE_REWARD_RATE=.1;
const IDLE_CRYSTAL_INTERVAL_MS=30*60*1000;
const IDLE_EQUIPMENT_INTERVAL_MS=2*60*60*1000;
const IDLE_MAX_EQUIPMENT=12;

export const IDLE_REWARD_PROFILES=Object.freeze([
 {minFloor:1,maxFloor:9,expeditionRate:.50,maxHours:8},
 {minFloor:10,maxFloor:29,expeditionRate:.60,maxHours:10},
 {minFloor:30,maxFloor:49,expeditionRate:.65,maxHours:12},
 {minFloor:50,maxFloor:69,expeditionRate:.70,maxHours:14},
 {minFloor:70,maxFloor:79,expeditionRate:.75,maxHours:16},
 {minFloor:80,maxFloor:89,expeditionRate:.80,maxHours:18},
 {minFloor:90,maxFloor:99,expeditionRate:.85,maxHours:20},
 {minFloor:100,maxFloor:100,expeditionRate:.90,maxHours:24}
]);

function saturatedNonNegativeAdd(currentValue,amountValue){
 const maximum=Number.MAX_SAFE_INTEGER,currentNumber=Number(currentValue),amountNumber=Number(amountValue),current=Number.isFinite(currentNumber)?Math.max(0,Math.min(maximum,Math.floor(currentNumber))):currentNumber>0?maximum:0,amount=Number.isFinite(amountNumber)?Math.max(0,Math.floor(amountNumber)):amountNumber>0?maximum:0;
 return current+Math.max(0,Math.min(maximum-current,amount));
}

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
 if(rarities.includes("LR")||floors>=20)return"SSS";
 if(rarities.includes("SSR")||floors>=10)return"SS";
 if(rarities.includes("SR")||floors>=5)return"S";
 if(floors>=3)return"A";
 if(floors>=1)return"B";
 return"C";
}

function safeFloor(value){return Math.max(1,Math.min(CAMPAIGN_MAX_FLOOR,Math.floor(Number(value)||1)))}
function rewardDepth(floor){return campaignFloorToLegacyFloor(safeFloor(floor))}
function safeNow(value=Date.now()){const number=Number(value);return Number.isFinite(number)&&number>=0?number:Date.now()}

export function idleRewardProfile(maxFloor){
 const floor=safeFloor(maxFloor);
 return IDLE_REWARD_PROFILES.find(profile=>floor>=profile.minFloor&&floor<=profile.maxFloor)??IDLE_REWARD_PROFILES.at(-1);
}

export function manualEquipmentDropCount(floorsCleared){
 const n=Math.max(0,Math.floor(Number(floorsCleared)||0));
 if(n<1)return 0;
 if(n<3)return 1;
 if(n<5)return 2;
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

function scaledReturnLevel(floor){return Math.max(1,Math.min(99999,Math.round(Math.max(1,Number(floor)||1)*(.5+Math.random()))))}
function createManualReturnEquipment(state,floor=state?.player?.currentFloor){
 const displayFloor=safeFloor(floor),item=createEquipment(randomEquipmentSlot(),{rarity:rollManualReturnRarity(state)});item.level=scaledReturnLevel(rewardDepth(displayFloor));item.obtainedFloor=displayFloor;item.obtainedMethod="manualReturn";return item;
}

export function idleEquipmentDropCount(elapsedMs){
 const ms=Math.max(0,Number(elapsedMs)||0);
 return Math.min(IDLE_MAX_EQUIPMENT,Math.floor(ms/IDLE_EQUIPMENT_INTERVAL_MS));
}

export function rollIdleReturnRarity(state=null){
 // Same rarity table as manual return, but far fewer rolls (one per 2 hours, max 12).
 return rollManualReturnRarity(state);
}

function createIdleReturnEquipment(state,floor){
 const displayFloor=safeFloor(floor),item=createEquipment(randomEquipmentSlot(),{rarity:rollIdleReturnRarity(state)});item.level=scaledReturnLevel(rewardDepth(displayFloor));item.obtainedFloor=displayFloor;item.obtainedMethod="idleReturn";return item;
}

export function normalizeReturnRewards(state,at=Date.now()){
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
 const now=safeNow(at),rawLegacyLast=Number(idle.lastClaimAt),rawGoldLast=Number(idle.lastGoldClaimAt),rawCrystalLast=Number(idle.lastCrystalClaimAt),rawEquipmentLast=Number(idle.lastEquipmentClaimAt),profile=idleRewardProfile(state.player?.maxFloor);
 const normalizeClock=(value,fallback)=>Number.isFinite(value)&&value>0?Math.min(value,now):fallback;
 const legacyLast=normalizeClock(rawLegacyLast,now),lastGoldClaimAt=normalizeClock(rawGoldLast,legacyLast),lastCrystalClaimAt=normalizeClock(rawCrystalLast,lastGoldClaimAt),lastEquipmentClaimAt=normalizeClock(rawEquipmentLast,lastGoldClaimAt);
 state.returnRewards.idle={
  // lastClaimAt remains as a compatibility alias for pre-build301 saves.
  lastClaimAt:lastGoldClaimAt,
  lastGoldClaimAt,
  lastCrystalClaimAt,
  lastEquipmentClaimAt,
  maxHours:profile.maxHours
 };
 return state.returnRewards;
}

export function beginManualExpedition(state,startFloor=state.player?.currentFloor){
 normalizeReturnRewards(state);
 const floor=safeFloor(startFloor);
 state.returnRewards.manual={...EMPTY_MANUAL,active:true,startFloor:floor,lastFloor:floor,startedAt:Date.now()};
 state.player.exploreRun={id:`run-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,floors:{}};
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
  run.pendingGold=saturatedNonNegativeAdd(run.pendingGold,goldForClearedFloor(rewardDepth(f)));
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
 state.player.gold=saturatedNonNegativeAdd(state.player.gold,preview.gold);
 const equipment=[];
 for(let i=0;i<preview.equipmentCount;i++){
  const item=createManualReturnEquipment(state,preview.endFloor);
  const receipt=receiveEquipment(state,item);
  equipment.push({item,receipt});
 }
 const history=state.returnRewards.history;
 history.totalManualReturns++;
 history.totalManualFloors+=preview.floorsCleared;
 history.totalManualGold+=preview.gold;
 state.returnRewards.manual={...EMPTY_MANUAL,startFloor:preview.endFloor,lastFloor:preview.endFloor};
 state.player.exploreRun={id:null,floors:{}};
 return{...preview,equipment};
}

export function abandonManualExpedition(state){
 normalizeReturnRewards(state);
 const floor=safeFloor(state.player?.currentFloor);
 state.returnRewards.manual={...EMPTY_MANUAL,startFloor:floor,lastFloor:floor};
 state.player.exploreRun={id:null,floors:{}};
}


export function idleExpeditionFloor(state,at=Date.now()){
 normalizeReturnRewards(state,at);
 const maxFloor=safeFloor(state.player?.maxFloor);
 const profile=idleRewardProfile(maxFloor);
 return Math.max(1,Math.floor(maxFloor*profile.expeditionRate));
}

export function idleReturnPreview(state,now=Date.now()){
 const current=safeNow(now);
 normalizeReturnRewards(state,current);
 const idle=state.returnRewards.idle;
 const maxMs=idle.maxHours*60*60*1000;
 const rawGoldElapsedMs=Math.max(0,current-idle.lastGoldClaimAt),rawCrystalElapsedMs=Math.max(0,current-idle.lastCrystalClaimAt),rawEquipmentElapsedMs=Math.max(0,current-idle.lastEquipmentClaimAt);
 const goldElapsedMs=Math.min(maxMs,rawGoldElapsedMs),crystalElapsedMs=Math.min(maxMs,rawCrystalElapsedMs),equipmentElapsedMs=Math.min(maxMs,rawEquipmentElapsedMs);
 const floorUnits=Math.floor(goldElapsedMs/IDLE_FLOOR_INTERVAL_MS);
 const profile=idleRewardProfile(state.player?.maxFloor);
 const expeditionFloor=idleExpeditionFloor(state,current);
 const goldPerUnit=Math.max(1,Math.round(goldForClearedFloor(rewardDepth(expeditionFloor))*IDLE_REWARD_RATE));
 const baseGold=floorUnits*goldPerUnit;
 const crystals=Math.floor(crystalElapsedMs/IDLE_CRYSTAL_INTERVAL_MS);
 return{
  elapsedMs:goldElapsedMs,
  goldElapsedMs,
  crystalElapsedMs,
  equipmentElapsedMs,
  floorUnits,
  expeditionFloor,
  rewardDepth:rewardDepth(expeditionFloor),
  goldPerUnit,
  baseGold,
  gold:modifiedGoldReward(state,baseGold,"idleReturn"),
  crystals,
  equipmentCount:idleEquipmentDropCount(equipmentElapsedMs),
  maxHours:idle.maxHours,
  expeditionRate:profile.expeditionRate,
  capped:rawGoldElapsedMs>=maxMs,
  equipmentCapped:rawEquipmentElapsedMs>=maxMs,
  available:floorUnits>0||crystals>0||idleEquipmentDropCount(equipmentElapsedMs)>0
 };
}

export function claimIdleReturn(state,now=Date.now()){
 const preview=idleReturnPreview(state,now);
 if(!preview.available)return preview;
 state.player.gold=saturatedNonNegativeAdd(state.player.gold,preview.gold);
 state.player.crystals=saturatedNonNegativeAdd(state.player.crystals,preview.crystals);
 const equipment=[];
 for(let i=0;i<preview.equipmentCount;i++){
  const item=createIdleReturnEquipment(state,preview.expeditionFloor);
  const receipt=receiveEquipment(state,item);
  equipment.push({item,receipt});
 }
 const current=safeNow(now),idle=state.returnRewards.idle;
 if(preview.floorUnits>0)idle.lastGoldClaimAt=preview.capped?current:Math.min(current,idle.lastGoldClaimAt+preview.floorUnits*IDLE_FLOOR_INTERVAL_MS);
 if(preview.crystals>0)idle.lastCrystalClaimAt=Math.min(current,idle.lastCrystalClaimAt+preview.crystals*IDLE_CRYSTAL_INTERVAL_MS);
 if(preview.equipmentCount>0)idle.lastEquipmentClaimAt=preview.equipmentCapped?current:Math.min(current,idle.lastEquipmentClaimAt+preview.equipmentCount*IDLE_EQUIPMENT_INTERVAL_MS);
 idle.lastClaimAt=idle.lastGoldClaimAt;
 state.returnRewards.history.totalIdleClaims++;
 state.returnRewards.history.totalIdleGold=saturatedNonNegativeAdd(state.returnRewards.history.totalIdleGold,preview.gold);
 return{...preview,equipment,claimed:true};
}
