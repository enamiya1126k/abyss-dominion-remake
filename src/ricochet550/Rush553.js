// Shared rules for earned second shots and delayed, server-owned jackpot reveals.
export const RUSH553=Object.freeze({charge:100,duration:4200,impulse:1.6,revealMs:960});
export const overdrive553=(p,at)=>at<(p.overdriveUntil553??0);
export function canBurst553(g,p,at=g.simAt){return !!(g.game==='pinball'&&g.phase==='play'&&p?.picked&&p.launched&&!p.burstUsed553&&p.burstCharge553>=100&&at<g.deadline)}
export function initRush553(g){for(const p of g.players)Object.assign(p,{burstCharge553:0,burstUsed553:false,burstReadyAt553:0,overdriveUntil553:0,bursts553:0});}
export function chargeRush553(g,p,strength,event){
 const before=p.burstCharge553??0;p.burstCharge553=Math.min(100,before+4+Math.min(8,strength*.12));
 if(before<100&&p.burstCharge553===100){p.burstReadyAt553=g.simAt;event(g,'burstReady',{seat:p.seat,x:p.x,y:p.y,text:'限界突破！ もう一度、引いて撃て！'})}
}
export function burst553(g,p,power,angle,{limit,event}){
 if(!canBurst553(g,p)||!Number.isFinite(power)||power<.08||power>1||!Number.isFinite(angle)||Math.abs(angle)>Math.PI)return false;
 const carryX=p.vx,carryY=p.vy,speed=(7+13*power+21*power**3)*RUSH553.impulse*(1+.18*(p.parts?.spring??0));
 p.vx+=Math.sin(angle)*speed;p.vy+=Math.cos(angle)*speed;limit(p);
 p.burstCharge553=0;p.burstUsed553=true;p.bursts553++;p.pulling=false;p.pullKind553=null;p.overdriveUntil553=g.simAt+RUSH553.duration;
 event(g,'burst',{seat:p.seat,x:p.x,y:p.y,carryX,carryY,vx:p.vx,vy:p.vy,text:'限界突破 · 4.2秒、得点２倍！'});return true;
}
// The multiplier is sampled exactly once on the server. Persist it, but never serialize
// it to clients until the reveal. All other scoring factors are frozen at impact.
export function queueJackpot553(g,p,base,x,y,mult,{random,event}){
 const roll=random(g),tier=roll<.6?1:roll<.92?3:7,final=g.round===g.rounds;
 const pending={seat:p.seat,base:base*(final?2:1),x,y,mult,final,at:g.simAt,revealAt:g.simAt+RUSH553.revealMs,_tier553:tier};
 g.carnival552.pending553=pending;event(g,'jackpotSpin',{seat:p.seat,x,y,base:pending.base,final});
}
export function resolveJackpot553(g,event,force=false){
 const c=g.carnival552,j=c?.pending553;if(!j||!force&&g.simAt<j.revealAt)return false;
 // Clear before crediting, making repeated ticks, round completion and restored saves idempotent.
 c.pending553=null;const p=g.players.find(q=>q.seat===j.seat);if(!p)return false;
 const total=q=>q.score+q.roundScore,rank=()=>1+g.players.filter(q=>total(q)>total(p)).length;
 const from=rank(),value=j.base*j._tier553;p.roundScore+=value;
 event(g,'jackpot',{seat:j.seat,x:j.x,y:j.y,value,mult:j.mult,tier:j._tier553,final:j.final,from,to:rank()});return true;
}
export function shiftRush553(g,shift){
 if(g.carnival552?.pending553){g.carnival552.pending553.at+=shift;g.carnival552.pending553.revealAt+=shift;}
 for(const p of g.players){p.overdriveUntil553=(p.overdriveUntil553??0)+shift;p.burstReadyAt553=(p.burstReadyAt553??0)+shift;}
}
export function publicRush553(g){if(g.carnival552?.pending553)delete g.carnival552.pending553._tier553;}
