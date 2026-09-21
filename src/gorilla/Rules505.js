import{makeGorilla504,startGorilla504,advanceGorilla504,publicGorilla504}from'./Rules504.js';
import{GORILLA503}from'./Rules503.js';
const bumps=new Set([3,8,16,21,27]);
export const painWeight505=id=>bumps.has(id)?2:1;
export const discomfort505=g=>(g.picked??[]).reduce((n,id)=>n+painWeight505(id),0)+(g.painOffset505??0);
export function makeGorilla505(args){return{...makeGorilla504(args),rules505:1,painOffset505:0}}
export function startGorilla505(g,at,options){startGorilla504(g,at,options);g.rules505=1;g.painOffset505=0;g.pendingPain505=null;return g}
// Spot coordinates exist only in presentation. The server validates the action,
// owns its independent random draw and never lets pinching select a losing hair.
export function pinchGorilla505(g,id,spot,turn,seq,at,roll){
 if(g.rules505!==1||![0,1].includes(spot)||!Number.isInteger(turn)||turn<0||!Number.isInteger(seq)||seq<0)throw Error('操作を確認してください');
 if(g.events.some(e=>e.action505==='pinch'&&e.playerId===id&&e.turn===turn&&e.seq===seq&&e.spot505===spot))return false;
 if(g.phase!=='playing'||g.players[g.turnSeat]?.playerId!==id||turn!==g.turn||seq!==g.events.length)throw Error('いまは操作できません');
 if(g.turnPulls503>=GORILLA503.maxPulls||g.deadline==null||!Number.isFinite(at)||at<g.thinkAt503||at>=g.deadline)throw Error('選ぶ時間が終了しました');
 const value=roll();if(!Number.isInteger(value)||value<0||value>=100)throw Error('抽選情報が不正です');
 const before=discomfort505(g);g.pendingPain505=value<65?Math.max(2,24-before):2;
 g.remaining503=Math.max(0,g.deadline-at);g.turnPulls503++;
 g.events.push({seq,turn,playerId:id,seat:g.turnSeat,action505:'pinch',spot505:spot,at,kind:'safe',automatic:false});
 g.phase='pinch';g.phaseAt503=at;g.deadline=null;g.nextAt=at+GORILLA503.pluckMs;g.updatedAt=at;g.revision++;return true;
}
export function advanceGorilla505(g,now){if(g.rules505!==1)return advanceGorilla504(g,now);let changed=false;
 for(let i=0;i<512&&!['lobby','result'].includes(g.phase)&&now>=g.nextAt;i++){
  const at=g.nextAt;
  if(g.phase==='pinch'){g.painOffset505=(g.painOffset505??0)+(g.pendingPain505??0);g.pendingPain505=null;g.phase='reaction';g.phaseAt503=at;g.deadline=null;g.nextAt=at+GORILLA503.reactionMs;g.updatedAt=at;g.revision++}
  else advanceGorilla504(g,at);
  changed=true;
 }
 return changed;
}
export function publicGorilla505(g,connected){const out=publicGorilla504(g,connected);return g.rules505===1?{...out,rules505:1,painOffset505:g.painOffset505??0}:out}
