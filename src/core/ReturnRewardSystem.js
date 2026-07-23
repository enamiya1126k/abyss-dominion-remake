const EMPTY_MANUAL={active:false,startFloor:1,lastFloor:1,floorsCleared:0,pendingGold:0,startedAt:null};

function safeFloor(value){return Math.max(1,Math.min(10000,Math.floor(Number(value)||1)))}

export function goldForClearedFloor(floor){
 const f=safeFloor(floor);
 // Early floors stay modest; high floors rise strongly without touching battle rewards.
 const base=32+f*3;
 const depth=Math.pow(1+f/120,1.42);
 const milestone=1+Math.floor((f-1)/100)*0.18;
 return Math.max(20,Math.round(base*depth*milestone));
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
 state.returnRewards.history??={totalManualReturns:0,totalManualFloors:0,totalManualGold:0};
 for(const key of["totalManualReturns","totalManualFloors","totalManualGold"]){
  state.returnRewards.history[key]=Math.max(0,Math.floor(Number(state.returnRewards.history[key])||0));
 }
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
  startedAt:run.startedAt
 };
}

export function claimManualReturn(state){
 const preview=manualReturnPreview(state);
 state.player.gold=Math.max(0,Math.floor(Number(state.player.gold)||0))+preview.gold;
 const history=state.returnRewards.history;
 history.totalManualReturns++;
 history.totalManualFloors+=preview.floorsCleared;
 history.totalManualGold+=preview.gold;
 state.returnRewards.manual={...EMPTY_MANUAL,startFloor:preview.endFloor,lastFloor:preview.endFloor};
 return preview;
}

export function abandonManualExpedition(state){
 normalizeReturnRewards(state);
 const floor=safeFloor(state.player?.currentFloor);
 state.returnRewards.manual={...EMPTY_MANUAL,startFloor:floor,lastFloor:floor};
}
