import{createEquipment}from"../models/Equipment.js?v=0.9.15-alpha.37-idle-return-gold-phase1";
import{receiveEquipment}from"../services/EquipmentStorage.js?v=0.9.15-alpha.37-idle-return-gold-phase1";

const EMPTY_MANUAL={active:false,startFloor:1,lastFloor:1,floorsCleared:0,pendingGold:0,startedAt:null};
const IDLE_MAX_HOURS=8;
const IDLE_FLOOR_INTERVAL_MS=5*60*1000;
const IDLE_REWARD_RATE=.1;

function safeFloor(value){return Math.max(1,Math.min(10000,Math.floor(Number(value)||1)))}

export function goldForClearedFloor(floor){
 const f=safeFloor(floor);
 // Early floors stay modest; high floors rise strongly without touching battle rewards.
 const base=32+f*3;
 const depth=Math.pow(1+f/120,1.42);
 const milestone=1+Math.floor((f-1)/100)*0.18;
 return Math.max(20,Math.round(base*depth*milestone));
}

export function manualEquipmentDropCount(floorsCleared){
 const n=Math.max(0,Math.floor(Number(floorsCleared)||0));
 if(n<5)return 0;
 if(n<10)return 1;
 if(n<20)return 2;
 return 3;
}

export function rollManualReturnRarity(){
 const r=Math.random();
 if(r<.001)return"LR";
 if(r<.04)return"SSR";
 if(r<.20)return"SR";
 if(r<.55)return"R";
 return"N";
}

function createManualReturnEquipment(){
 const slots=["weapon","armor","accessory"];
 const slot=slots[Math.floor(Math.random()*slots.length)];
 return createEquipment(slot,{rarity:rollManualReturnRarity()});
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
 const now=Date.now(),rawLast=Number(idle.lastClaimAt);
 state.returnRewards.idle={
  lastClaimAt:Number.isFinite(rawLast)&&rawLast>0?Math.min(rawLast,now):now,
  maxHours:IDLE_MAX_HOURS
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
  gold:run.pendingGold,
  startedAt:run.startedAt,
  equipmentCount:manualEquipmentDropCount(run.floorsCleared)
 };
}

export function claimManualReturn(state){
 const preview=manualReturnPreview(state);
 state.player.gold=Math.max(0,Math.floor(Number(state.player.gold)||0))+preview.gold;
 const equipment=[];
 for(let i=0;i<preview.equipmentCount;i++){
  const item=createManualReturnEquipment();
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
 return Math.max(1,Math.floor(maxFloor*.8));
}

export function idleReturnPreview(state,now=Date.now()){
 normalizeReturnRewards(state);
 const idle=state.returnRewards.idle;
 const current=Math.max(0,Number(now)||Date.now());
 const maxMs=idle.maxHours*60*60*1000;
 const elapsedMs=Math.max(0,Math.min(maxMs,current-idle.lastClaimAt));
 const floorUnits=Math.floor(elapsedMs/IDLE_FLOOR_INTERVAL_MS);
 const expeditionFloor=idleExpeditionFloor(state);
 const goldPerUnit=Math.max(1,Math.round(goldForClearedFloor(expeditionFloor)*IDLE_REWARD_RATE));
 return{
  elapsedMs,
  floorUnits,
  expeditionFloor,
  goldPerUnit,
  gold:floorUnits*goldPerUnit,
  maxHours:idle.maxHours,
  capped:current-idle.lastClaimAt>=maxMs,
  available:floorUnits>0
 };
}

export function claimIdleReturn(state,now=Date.now()){
 const preview=idleReturnPreview(state,now);
 if(!preview.available)return preview;
 state.player.gold=Math.max(0,Math.floor(Number(state.player.gold)||0))+preview.gold;
 state.returnRewards.idle.lastClaimAt=Math.max(0,Number(now)||Date.now());
 state.returnRewards.history.totalIdleClaims++;
 state.returnRewards.history.totalIdleGold+=preview.gold;
 return{...preview,claimed:true};
}
