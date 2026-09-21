import{makeGorilla503,startGorilla503,pullGorilla503,advanceGorilla503,publicGorilla503,GORILLA503}from'./Rules503.js';
export const DRUM_MS504=3000;
export function makeGorilla504(args){return{...makeGorilla503(args),rules504:1}}
export function startGorilla504(g,at,options){const{mercyCoins504,trapOrder504}=options;
 if(!Array.isArray(mercyCoins504)||mercyCoins504.length!==30||mercyCoins504.some(v=>v!==0&&v!==1)||!Array.isArray(trapOrder504)||trapOrder504.length!==30||new Set(trapOrder504).size!==30||trapOrder504.some(v=>!Number.isInteger(v)||v<0||v>=30))throw Error('抽選情報が不正です');
 startGorilla503(g,at,options);g.rules504=1;g.mercyCoins504=[...mercyCoins504];g.trapOrder504=[...trapOrder504];g.drumIndex504=0;g.drumAt504=null;g.allSafe504=false;return g;
}
function concealDrum(g){const e=g.events.at(-1);if(g.phase==='pluck'&&e?.kind==='rage')e.kind='drum'}
export function pullGorilla504(g,...args){const changed=pullGorilla503(g,...args);if(changed)concealDrum(g);return changed}
function phase(g,name,at,duration){g.phase=name;g.phaseAt503=at;g.deadline=null;g.nextAt=at+duration;g.updatedAt=at;g.revision++}
function allSafe(g,at){phase(g,'result',at,0);g.allSafe504=true;g.resultAt=at;g.nextAt=null;g.results=g.players.map(p=>({playerId:p.playerId,blownFar:false,pulls:p.pulls,safePulls:p.safePulls,autoPulls:p.autoPulls}))}
export function advanceGorilla504(g,now){if(g.rules504!==1)return advanceGorilla503(g,now);let changed=false;
 for(let i=0;i<384&&!['lobby','result'].includes(g.phase)&&now>=g.nextAt;i++){
  const at=g.nextAt,e=g.events.at(-1);
  if(g.phase==='pluck'&&e?.kind==='drum'){g.drumAt504=at;phase(g,'drum',at,DRUM_MS504)}
  else if(g.phase==='drum'){
   // The server generated independent unbiased crypto coins at start. Neither
   // the client nor cosmetic pain/colour/AI cadence can affect these outcomes.
   const mercy=g.mercyCoins504[g.drumIndex504++]===1;e.kind=mercy?'safe':'rage';e.mercy504=mercy;
   if(mercy){g.players[e.seat].safePulls++;g.badHair=g.trapOrder504.find(id=>!g.picked.includes(id));phase(g,'reaction',at,GORILLA503.reactionMs)}
   else{g.loserId=e.playerId;g.blastAt=at-1300;phase(g,'blast',at,GORILLA503.blastMs-1300)}
  }else if(g.phase==='reaction'&&g.picked.length===30&&e?.mercy504){allSafe(g,at)}
  else{advanceGorilla503(g,at);concealDrum(g)}
  changed=true;
 }
 return changed;
}
export function publicGorilla504(g,connected){const result=publicGorilla503(g,connected);if(g.rules504!==1)return result;return{...result,rules504:1,drumAt504:g.drumAt504??null,allSafe504:!!g.allSafe504}}
