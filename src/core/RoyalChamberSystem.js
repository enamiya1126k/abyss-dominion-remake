// The chamber is a location after floor 100, never a farmable floor 101.
export const ROYAL_LOCATION='魔王城-王室';
export const ROYAL_ASSET='./assets/ui/campaign/royal-hall-360.png';
export const ROYAL_ITEM_KEYS=Object.freeze(['potions','highPotions','partyPotions','manaPotions','highManaPotions','partyManaPotions','fullManaPotions','partyFullManaPotions','reviveLeaves','statusCures','partyStatusCures','fullHeals','partyFullHeals']);
const copy=value=>JSON.parse(JSON.stringify(value??null));
export function royalState(state){
 state.campaign100??={};const c=state.campaign100,cycle=Math.max(0,Number(c.reincarnation319?.cycle)||0);
 let room=c.royal360;
 if(!room||room.cycle!==cycle)room=c.royal360={version:1,cycle,phase:c.finalCompleted?'cleared':'approach',position:{x:10,y:26},dialogueIndex:0,memoryWins:0};
 if(!['approach','ready','battle','victory','rewind','cleared'].includes(room.phase))room.phase=c.finalCompleted?'cleared':'approach';
 room.position=royalWalkable(room.position?.x,room.position?.y)?room.position:{x:10,y:26};
 room.dialogueIndex=Math.max(0,Math.floor(Number(room.dialogueIndex)||0));
 return room;
}
export function royalWalkable(x,y){
 if(!Number.isInteger(x)||!Number.isInteger(y))return false;
 // Match the generated carpet, side alcoves, buttresses and throne dais.
 if(y>=26&&y<=29)return x>=9&&x<=10;
 if(y>=7&&y<=25){let left=4,right=15;if(y>=9&&y<=11||y>=18&&y<=21){left=2;right=17}return x>=left&&x<=right}
 return y===6&&x>=8&&x<=11;
}
export function createRoyalWorld(){return{royal:true,cols:20,rows:30,start:{x:10,y:26},tiles:Array.from({length:30},(_,y)=>Array.from({length:20},(_,x)=>royalWalkable(x,y)?0:1)),rooms:[],sections:[],decorations:[],enemies:[],chests:[],bossDefeated:true,currentAttribute:'dark'};}
export function royalHeroPositions(heroes){return heroes.filter(h=>!h.defeated&&Number(h.remainingHpRate??1)>0).map((h,i,all)=>({...h,x:10+(i-(all.length-1)/2)*2,y:12+(i%2)*.6}));}
export function royalContact(position,heroes,{audience=false}={}){const radius=audience?3:1.45;return heroes.some(h=>Math.hypot(position.x-h.x,position.y-h.y)<=radius);}
export function beginRoyalAttempt(state,ledger,{memory=false}={}){
 const room=royalState(state);if(room.attempt||room.phase==='rewind'||room.phase==='victory')return false;
 room.attempt={memory,stage:Math.max(1,(Number(room.memoryWins)||0)+1),partyIds:[...(state.party??[])],items:Object.fromEntries(ROYAL_ITEM_KEYS.map(k=>[k,Math.max(0,Number(state.inventory?.[k])||0)])),gold:Math.max(0,Number(state.player?.gold)||0),heroes:copy(ledger.heroes),startedAt:Date.now()};
 room.phase='battle';room.dialogueIndex=0;return true;
}
export function settleRoyalAttempt(state,{won=false,ending='narrow',variant=null,resultId}={}){
 const room=royalState(state);if(room.lastResultId===resultId)return{duplicate:true};
 if(!room.attempt)return{missing:true};room.lastResultId=resultId;
 if(room.attempt.memory){const stage=room.attempt.stage??1,partyIds=room.attempt.partyIds??state.party;restoreRoyalSupplies(state);room.phase='cleared';room.memoryWins=(Number(room.memoryWins)||0)+(won?1:0);let awarded=false;if(won&&!state.campaign100.royalMemoryChampion360){state.campaign100.royalMemoryChampion360=true;awarded=true}state.campaign100.revengeBest361=Math.max(Number(state.campaign100.revengeBest361)||0,room.memoryWins);room.attempt=null;room.position={x:10,y:17};return{memory:true,won,awarded,stage,partyIds};}
 room.phase=won?'victory':'rewind';room.pendingEnding={ending,variant,resultId};room.dialogueIndex=0;room.position={x:10,y:17};return{won,phase:room.phase};
}
export function restoreRoyalSupplies(state){const attempt=royalState(state).attempt;if(!attempt)return;state.inventory??={};for(const[k,v]of Object.entries(attempt.items??{}))state.inventory[k]=v;state.player.gold=attempt.gold;}
export function rewindRoyalAttempt(state,ledger){
 const room=royalState(state);if(room.phase!=='rewind')return false;
 restoreRoyalSupplies(state);if(room.attempt?.heroes)ledger.heroes=copy(room.attempt.heroes);
 ledger.finalArena={...ledger.finalArena,unlocked:true,entered:false,battleStarted:false,completed:false,audienceCompleted:true,lastEnding:'defeat'};
 room.attempt=null;room.phase='ready';room.position={x:10,y:26};room.dialogueIndex=0;room.rewinds=(Number(room.rewinds)||0)+1;room.pendingEnding=null;
 state.player.currentFloor=100;state.player.checkpoint=100;delete state.activeBattle;state.campaign100.finalCompleted=false;return true;
}
export function abandonRoyalAttempt(state){const room=royalState(state);restoreRoyalSupplies(state);room.phase=room.attempt?.memory?'cleared':'ready';room.attempt=null;room.position={x:10,y:17};}
