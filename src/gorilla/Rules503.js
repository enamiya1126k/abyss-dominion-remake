import{makeGorilla502,startGorilla502,publicGorilla502}from'./Rules502.js';
export const GORILLA503=Object.freeze({hairs:30,countdown:4000,turnMs:60000,warningMs:10000,focusMs:650,pluckMs:850,reactionMs:2600,handoffMs:850,blastMs:5200,maxPulls:3});
const fail=s=>{throw Error(s)};
const random=(g,n)=>{let x=g.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.seed=x>>>0;return g.seed%n};
export function makeGorilla503(args){return{...makeGorilla502(args),rules503:1,hairCount503:GORILLA503.hairs}}
export function startGorilla503(g,now,{badHair,firstSeat}){
 if(!Number.isInteger(badHair)||badHair<0||badHair>=GORILLA503.hairs)fail('抽選情報が不正です');
 startGorilla502(g,now,{badHair:0,firstSeat});g.rules503=1;g.hairCount503=GORILLA503.hairs;g.badHair=badHair;g.startAt=now+GORILLA503.countdown;g.phaseAt503=now;g.nextAt=g.startAt;g.turnPulls503=0;g.remaining503=GORILLA503.turnMs;g.deadline=null;g.decisions503=[];g.lastReaction503=-1;return g;
}
function phase(g,name,at,ms){g.phase=name;g.phaseAt503=at;g.deadline=null;g.nextAt=at+ms;g.updatedAt=at;g.revision++}
function focus(g,at){phase(g,'focus',at,GORILLA503.focusMs)}
function beginTurn(g,at,handoff=false){g.turnSeat=(g.firstSeat+g.turn)%4;g.turnPulls503=0;g.remaining503=GORILLA503.turnMs;g.aiLimit503=1+random(g,3);if(handoff)phase(g,'handoff',at,GORILLA503.handoffMs);else focus(g,at)}
function think(g,name,at){phase(g,name,at,g.remaining503);g.thinkAt503=at;g.deadline=at+g.remaining503;if(g.players[g.turnSeat].ai)g.nextAt=Math.min(g.deadline,at+750+random(g,501))}
function nextTurn(g,at){g.turn++;beginTurn(g,at,true)}
function validate(g,id,turn,at,automatic){if(g.players[g.turnSeat]?.playerId!==id||turn!==g.turn)fail('いまはあなたの順番ではありません');if(!Number.isFinite(at)||at<g.thinkAt503||(!automatic&&at>=g.deadline))fail('選ぶ時間が終了しました')}
function spend(g,at){g.remaining503=Math.max(0,g.deadline-at)}
export function pullGorilla503(g,id,hair,turn,at,automatic=false){
 if(!Number.isInteger(hair)||hair<0||hair>=GORILLA503.hairs||!Number.isInteger(turn)||turn<0)fail('残っている胸毛を1本選んでください');
 if(g.events.some(e=>e.turn===turn&&e.playerId===id&&e.hair===hair))return false;
 if(g.phase!=='playing')fail('胸元のアップで1本選んでね');validate(g,id,turn,at,automatic);
 if(g.picked.includes(hair))fail('その毛はもう抜けています');if(g.turnPulls503>=3)fail('この番は3本までです');
 spend(g,at);const p=g.players[g.turnSeat],bad=hair===g.badHair;let reaction=random(g,4);if(reaction>=g.lastReaction503)reaction++;g.lastReaction503=reaction;
 p.pulls++;p.safePulls+=bad?0:1;p.autoPulls+=automatic?1:0;g.turnPulls503++;g.picked.push(hair);
 g.events.push({seq:g.events.length,turn:g.turn,playerId:id,seat:p.seat,hair,at,kind:bad?'rage':'safe',reaction503:reaction,automatic:!!automatic});phase(g,'pluck',at,GORILLA503.pluckMs);return true;
}
export function decideGorilla503(g,id,kind,turn,seq,at,automatic=false){
 if(!['continue','pass'].includes(kind)||!Number.isInteger(seq)||!Number.isInteger(turn))fail('次の操作を選んでね');
 if(g.decisions503.some(d=>d.playerId===id&&d.turn===turn&&d.seq===seq&&d.kind===kind))return false;
 if(g.phase!=='decision'||seq!==g.events.length||g.turnPulls503<1||g.turnPulls503>=3)fail('王のリアクションを見てから選んでね');validate(g,id,turn,at,automatic);spend(g,at);
 g.decisions503.push({playerId:id,kind,turn,seq});if(kind==='continue'&&g.remaining503>0)focus(g,at);else nextTurn(g,at);return true;
}
export function advanceGorilla503(g,now){let changed=false;
 // Thirty hairs bound all state transitions, even after a long offline/restart gap.
 for(let i=0;i<256&&!['lobby','result'].includes(g.phase)&&now>=g.nextAt;i++){
  const at=g.nextAt;
  if(g.phase==='countdown')beginTurn(g,at);
  else if(g.phase==='handoff')focus(g,at);
  else if(g.phase==='focus')think(g,'playing',at);
  else if(g.phase==='playing'){if(g.turnPulls503>0&&at>=g.deadline)nextTurn(g,at);else{const left=Array.from({length:GORILLA503.hairs},(_,i)=>i).filter(i=>!g.picked.includes(i));pullGorilla503(g,g.players[g.turnSeat].playerId,left[random(g,left.length)],g.turn,at,true)}}
  else if(g.phase==='pluck'){const bad=g.events.at(-1).kind==='rage';if(bad){g.loserId=g.events.at(-1).playerId;g.blastAt=at}phase(g,bad?'blast':'reaction',at,bad?GORILLA503.blastMs:GORILLA503.reactionMs)}
  else if(g.phase==='reaction'){if(g.turnPulls503>=3||g.remaining503<=0)nextTurn(g,at);else think(g,'decision',at)}
  else if(g.phase==='decision'){const kind=g.players[g.turnSeat].ai&&g.turnPulls503<g.aiLimit503&&at<g.deadline?'continue':'pass';decideGorilla503(g,g.players[g.turnSeat].playerId,kind,g.turn,g.events.length,at,true)}
  else if(g.phase==='blast'){phase(g,'result',at,0);g.resultAt=at;g.nextAt=null;g.results=g.players.map(p=>({playerId:p.playerId,blownFar:p.playerId===g.loserId,pulls:p.pulls,safePulls:p.safePulls,autoPulls:p.autoPulls}))}
  changed=true;
 }
 return changed;
}
export function publicGorilla503(g,connected){if(g.rules503!==1)return publicGorilla502(g,connected);return{...publicGorilla502(g,connected),rules503:1,hairCount503:GORILLA503.hairs,phaseAt503:g.phaseAt503??null,turnPulls503:g.turnPulls503??0,remaining503:g.remaining503??GORILLA503.turnMs}}
export function warning503(g,at){if(!['playing','decision'].includes(g.phase)||g.deadline==null)return null;const left=g.deadline-at;return left<=GORILLA503.warningMs?Math.max(0,Math.ceil(left/1000)):null}
