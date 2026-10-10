import {cycle603} from './Hazards603.js';
import {enemyAt587,surfaces587} from './Level587.js';
import {freeze598} from './Ice598.js';

export const live604=p=>p.alive&&!p.departed&&!p.waiting&&!p.paused&&!p.respawnAt&&p.finishTime==null;
export const frozen604=(p,t)=>(p.frozenUntil604??0)>t;
export function thaw604(g,p,emit){
 if(!frozen604(p,g.elapsed))return false;
 p.frozenUntil604=0;p.motionEpoch600=(p.motionEpoch600??0)+1;
 p.invincibleUntil=Math.max(p.invincibleUntil??0,g.lastAt+600);
 emit(g,'thaw',{seat:p.seat,x:p.x,y:p.y-14});return true;
}
export function freezePlayer604(g,p,emit){
 if(!live604(p)||p.invincibleUntil>g.lastAt||frozen604(p,g.elapsed))return false;
 Object.assign(p,{frozenUntil604:g.elapsed+3000,motionEpoch600:(p.motionEpoch600??0)+1,vx:0,vy:0,axis:0,attackHeld:false,jumpHeld:false,jumpBufferUntil:0,burst598:0,bumpUntil:0,wallLockUntil:0});
 emit(g,'player-freeze',{seat:p.seat,x:p.x,y:p.y-14});return true;
}
export function initThreats604(g){g.threats604={cannons:{},meteors:{},rollers:{},shots:[],next:0};}
// Swept collision is shared by hostile shots and the player's counterfire.
export function sweep604(x0,y0,x1,y1,box,r=0){
 let enter=0,exit=1;
 for(const [a,d,lo,hi] of [[x0,x1-x0,box.x-r,box.x+box.w+r],[y0,y1-y0,box.y-r,box.y+box.h+r]]){
  if(Math.abs(d)<1e-9){if(a<lo||a>hi)return null;continue;}
  const t0=(lo-a)/d,t1=(hi-a)/d;enter=Math.max(enter,Math.min(t0,t1));exit=Math.min(exit,Math.max(t0,t1));if(enter>exit)return null;
 }return enter;
}
export const tideTop604=(h,t)=>h.y+20-(.5-.5*Math.cos((t+(h.offset??0))/h.period*Math.PI*2))*83;
export const inWater604=(p,course,t)=>(course.tides600??[]).some(h=>p.x+10>h.x&&p.x-10<h.x+h.w&&p.y>tideTop604(h,t)&&p.y-28<h.y+25);
export function cannonPose604(h,state,t){
 const angle=state?.angle??((h.dir??-1)<0?Math.PI:0),recoil=Math.max(0,1-(t-(state?.firedAt??-1e9))/220)*5;
 const px=h.x,py=h.y-25;
 return {angle,x:px,y:py,muzzleX:px+Math.cos(angle)*(34-recoil),muzzleY:py+Math.sin(angle)*(34-recoil),recoil};
}
const nearest=(players,x,y,range)=>players.filter(p=>Math.abs(p.x-x)<range&&Math.abs(p.y-y)<380).sort((a,b)=>Math.hypot(a.x-x,a.y-14-y)-Math.hypot(b.x-x,b.y-14-y))[0];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function add(g,shot){const s=g.threats604;if(s.shots.length>=48)return;s.shots.push({id:++s.next,born:g.elapsed,until:g.elapsed+3000,...shot});}
export function stepThreats604(g,course,emit){
 if(!g.threats604)initThreats604(g);
 const state=g.threats604,t=g.elapsed,players=g.players.filter(live604);
 for(const p of players)if(p.frozenUntil604&&p.frozenUntil604<=t){p.frozenUntil604=0;emit(g,'thaw',{seat:p.seat,x:p.x,y:p.y-14});}
 for(const h of course.cannons603??[]){
  const phase=cycle603(h,t),cycle=Math.floor((t+(h.offset??0))/h.period),warning=h.warning??700;
  const q=state.cannons[h.id]??={angle:(h.dir??-1)<0?Math.PI:0,cycle:-1,firedAt:-1e9};
  if(q.cycle!==cycle){q.cycle=cycle;q.fired=false;q.target=null;}
  const target=nearest(players,h.x,h.y-25,(h.range??650)+120);
  if(phase<warning-280&&target){
   const goal=Math.atan2(target.y-14-(h.y-25),target.x-h.x),delta=Math.atan2(Math.sin(goal-q.angle),Math.cos(goal-q.angle));
   q.angle+=clamp(delta,-.09,.09);q.target=target.seat;
  }
  q.warning=phase<warning&&q.target!=null;
  if(phase>=warning&&!q.fired){q.fired=true;if(q.target==null||!target)continue;
   const pose=cannonPose604(h,q,t),speed=h.speed??310;q.firedAt=t;
   add(g,{kind:'cannon',source:h.id,x:pose.muzzleX,y:pose.muzzleY,vx:Math.cos(q.angle)*speed,vy:Math.sin(q.angle)*speed,r:15,until:t+(h.range??650)/speed*1000});
   emit(g,'cannon-fire',{x:pose.muzzleX,y:pose.muzzleY});
  }
 }
 // Icicles detach from visible ceiling brackets; ice boulders leave a visible chute.
 for(const h of course.meteors603??[]){
  const cycle=Math.floor((t+(h.offset??0))/h.period),phase=cycle603(h,t),warning=h.warning??800;
  const q=state.meteors[h.id]??={cycle,fired:phase>=warning};if(q.cycle!==cycle){q.cycle=cycle;q.fired=false;}
  if(phase>=warning&&!q.fired){q.fired=true;if(!nearest(players,h.x,h.y,800))continue;
   const from=h.from??h.y-360;add(g,{kind:h.kind==='fire'?'meteor':'icicle',ice:h.kind!=='fire',source:h.id,x:h.x,y:from+29,vx:0,vy:(h.y-from)/((h.fall??1100)/1000),r:11,until:t+(h.fall??1100)+400});
  }
 }
 for(const h of course.rollers600??[]){
  const cycle=Math.floor(t/h.period),phase=t%h.period,q=state.rollers[h.id]??={cycle:-1};if(q.cycle!==cycle){q.cycle=cycle;q.fired=false;}
  if(phase>=700&&!q.fired){q.fired=true;if(!nearest(players,h.right,h.y,850))continue;
   add(g,{kind:'iceball',ice:true,source:h.id,cycle,x:h.right,y:h.y-22,vx:-(h.right-h.left)/2.8,vy:0,r:19,rolling:true,until:t+2800});
  }
 }
 for(const e of g.enemies){
  if(!e.axe604||e.defeated||e.ice||e.downUntil>g.lastAt){if(e.ice)delete e.throw604;continue;}
  const pos=enemyAt587(e,t);let q=e.throw604;
  if(q&&t>=q.until){delete e.throw604;e.motionOffset=t;e.x=clamp(q.x,e.min,e.max);q=null;}
  if(!q&&t>=(e.nextAxe604??0)){
   const target=nearest(players,pos.x,pos.y,470);if(!target||Math.abs(target.y-pos.y)>140)continue;
   q=e.throw604={x:pos.x,y:pos.y,dir:Math.sign(target.x-pos.x)||-1,start:t,until:t+950,vx:clamp(Math.abs(target.x-pos.x)/.9,140,285)*(Math.sign(target.x-pos.x)||-1),fired:false};e.nextAxe604=t+2600;
  }
  if(q&&!q.fired&&t-q.start>=650){q.fired=true;add(g,{kind:'axe',source:e.id,x:q.x+q.dir*23,y:q.y-25,vx:q.vx,vy:-245,gravity:600,r:12,until:t+2600});emit(g,'axe-throw',{x:q.x,y:q.y-25});}
 }
 const terrain=surfaces587(t,course,g).filter(s=>!s.spike&&!s.ice&&!s.oneWay);
 for(const s of state.shots){s.oldX=s.x;s.oldY=s.y;if(s.gravity)s.vy+=s.gravity*.025;s.x+=s.vx*.025;s.y+=s.vy*.025;s.wallTime604=2;
  for(const box of terrain){if(s.rolling&&box.ground&&s.y+s.r<=box.y+3)continue;const hit=sweep604(s.oldX,s.oldY,s.x,s.y,box,s.r);if(hit!=null)s.wallTime604=Math.min(s.wallTime604,hit);}
 }
}
export function counterShot604(g,b,oldX,oldY,emit,limit=2){
 let best=null,when=limit;
 for(const s of g.threats604?.shots??[]){if(s.dead)continue;
  const x0=s.oldX??s.x,y0=s.oldY??s.y;
  const hit=sweep604(oldX-x0,oldY-y0,b.x-s.x,b.y-s.y,{x:-s.r,y:-s.r,w:s.r*2,h:s.r*2},6);
  if(hit!=null&&hit<when&&hit<=(s.wallTime604??2)){best=s;when=hit;}
 }
 if(!best)return false;best.dead=true;emit(g,'shot-break',{seat:b.owner,x:best.x,y:best.y,kind:best.kind});return true;
}
export function resolveThreats604(g,course,emit,hurt){
 if(!g.threats604)return;
 g.threats604.shots=g.threats604.shots.filter(s=>{
  if(s.dead||g.elapsed>=s.until)return false;
  let contact=null,time=s.wallTime604??2;
  for(const p of g.players){if(!live604(p)||p.invincibleUntil>g.lastAt)continue;
   const hit=sweep604(s.oldX,s.oldY,s.x,s.y,{x:p.x-9,y:p.y-27,w:18,h:27},s.r);
   if(hit!=null&&hit<time){time=hit;contact={p};}
  }
  if(s.ice)for(const e of g.enemies){if(e.defeated||e.ice||e.downUntil>g.lastAt)continue;const q=enemyAt587(e,g.elapsed),hit=sweep604(s.oldX,s.oldY,s.x,s.y,{x:q.x-12,y:q.y-26,w:24,h:26},s.r);if(hit!=null&&hit<time){time=hit;contact={e,q};}}
  if(contact){if(contact.p){if(s.ice)freezePlayer604(g,contact.p,emit);else hurt(g,contact.p,s.kind,s.oldX);}else{freeze598(g,contact.e);emit(g,'freeze',{x:contact.q.x,y:contact.q.y});}return false;}
  if(time<=1){emit(g,'shot-break',{x:s.oldX+(s.x-s.oldX)*time,y:s.oldY+(s.y-s.oldY)*time,kind:s.kind});return false;}
  return s.x>-80&&s.x<course.length+80&&s.y<1100;
 });
}
