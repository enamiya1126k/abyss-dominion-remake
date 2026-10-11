import {sweep604} from './Threats604.js';
import {tickBoss612,bossPose612} from './Boss612.js';
import {bossPair608} from './FinalRules608.js';
import {onHub607} from './Mechanics607.js';
// Pure geometry shared by authority and rendering. Timers use game elapsed time.
export function firebar600(h,elapsed){const angle=h.angle616??(elapsed/h.period*Math.PI*2+(h.offset??0));return Array.from({length:Math.ceil(h.length/15)},(_,i)=>({x:h.x+Math.cos(angle)*(i+1)*15,y:h.y+Math.sin(angle)*(i+1)*15,r:8}));}
export const tide600=(h,elapsed)=>({y:h.y+20-(.5-.5*Math.cos((elapsed+(h.offset??0))/h.period*Math.PI*2))*83});
export function roller600(h,elapsed){const cycle=Math.floor(elapsed/h.period),phase=elapsed%h.period,t=(phase-700)/2800;return {cycle,warning:phase<700,active:t>=0&&t<1,x:h.right-(h.right-h.left)*Math.max(0,t),y:h.y-22,r:22};}
const overlap=(p,x,y,r)=>p.x+10>x-r&&p.x-10<x+r&&p.y>y-r&&p.y-28<y+r;
const active=p=>p.alive&&!p.waiting&&!p.paused&&!p.respawnAt&&p.finishTime==null;
export const bossPosition600=(b,elapsed)=>bossPose612(b,elapsed).x;
export {bossPose612};
export const bossOpen604=(b,t)=>['rest','stunned'].includes(b.phase)&&t>=(b.crownUntil604??0);
export function bossHead606(p,b,old,t=Infinity){return b.hp>0&&!!old&&!(p.frozenUntil604>t)&&Math.abs(p.x-b.x)<=39&&p.vy>=0&&old.y<=b.y-50&&p.y>=b.y-64&&p.y-28<b.y;}
export const bossStomp600=(p,b,old,t=Infinity)=>bossOpen604(b,t)&&bossHead606(p,b,old,t);
export function bossGuardBounce606(p,b,at,stomp){
 stomp(p,{y:b.y-38});const dir=Math.sign(p.x-b.x)||-b.dir||1;
 Object.assign(p,{vy:-320,vx:dir*150,bumpVx:dir*150,bumpUntil:at+180,bossGuardUntil606:at+300});
}
export function initEncounters600(g,course){
 g.waves600={};g.rollerBroken600={};g.enemyShots600=[];g.boss600=course.boss600?{...course.boss600,elite603:course.boss600.elite603?{...course.boss600.elite603}:undefined,phase:'sleep',phaseAt:0,turn:0,hitUntil:0,dir:-1}:null;
 if(g.boss600){const b=g.boss600,n=g.players.filter(p=>!p.departed).length;b.maxHp=b.hp=Math.round(b.maxHp*(1+.45*Math.max(0,n-1)));b.lastHitSeat601=null;b.lastHitAt601=-1e9;b.comboUntil601=0;}
 for(const e of g.enemies)if(e.prefrozen600)e.ice={x:e.x,y:e.y,dir:-1,vx:0,vy:0,at:0,until:1e9,kicker:null,grace:0};
}
export function hitBoss600(g,seat,amount,emit,impact={}){
 const b=g.boss600;if(!b||b.hp<=0||b.phase==='sleep'||g.elapsed<b.hitUntil)return false;
 const shield=['wave','fire'].includes(b.pattern)&&['warn','dash'].includes(b.phase);
 if(shield&&impact.kind==='shot'&&Math.sign(impact.x-b.x)===b.dir){emit(g,'boss-block',{seat,x:b.x+b.dir*30,y:b.y-32});return false;}
 if(!bossPair608(g,b,seat,emit))return false;if(b.final608)amount=2;
 const combo=seat!=null&&b.lastHitSeat601!=null&&seat!==b.lastHitSeat601&&g.elapsed-b.lastHitAt601<=1500&&g.elapsed>=(b.comboUntil601??0);
 if(combo){amount+=2;b.stun612={y:b.y};b.phase='stunned';b.phaseAt=g.elapsed;b.comboUntil601=g.elapsed+2600;emit(g,'boss-combo',{seat,helper:b.lastHitSeat601,x:b.x,y:b.y-36});}
 b.lastHitSeat601=seat;b.lastHitAt601=g.elapsed;
 b.hp=Math.max(0,b.hp-amount);b.hitUntil=g.elapsed+500;emit(g,'boss-hit',{seat,x:b.x,y:b.y-38});
 if(!b.hp){b.phase='down';b.phaseAt=g.elapsed;g.enemyShots600=[];if(g.players[seat])g.players[seat].kills++;emit(g,'boss-defeat',{seat,x:b.x,y:b.y});}
 return true;
}
export function encounters600(g,course,previous,emit,hurt,stomp){
 const players=g.players.filter(active),now=g.elapsed;
 for(const h of course.swarms600){
  let w=g.waves600[h.id];if(!w&&players.some(p=>p.x>=h.trigger))w=g.waves600[h.id]={start:now,count:0};
  if(!w)continue;
  while(w.count<h.count&&now>=w.start+Math.floor(w.count/4)*h.interval){
   const i=w.count++,flying=i%4===3,x=h.max-(i%4)*18;
   g.enemies.push({id:h.id+'-'+i,x,y:h.y-(flying?82:0),min:h.min,max:h.max,speed:85+i*3,advance:true,flying,bob:flying?12:0,motionOffset:now});
   emit(g,'swarm',{x,y:h.y});
  }
 }
 for(const p of players){
  for(const h of course.firebars600)if(!onHub607(p,h)&&Math.abs(p.x-h.x)<h.length+20&&firebar600(h,now).some(q=>overlap(p,q.x,q.y,q.r)))hurt(g,p,'firebar',h.x);
 }
 const b=g.boss600;
 if(b?.hp>0){
  if(b.final608){const stage=b.hp<=b.maxHp/3?3:b.hp<=b.maxHp*2/3?2:1;b.finalPhase608=stage;Object.assign(b.elite603,{warn:stage===3?420:stage===2?500:600,rest:stage===3?600:stage===2?680:760,dash:stage===3?280:stage===2?260:240,castSpeed:stage===3?380:stage===2?350:320});}
  if(!['counter','leap','stunned'].includes(b.phase))b.y=b.baseY604??300;
  tickBoss612(g,b,players);
  for(const p of players){if(!active(p))continue;const old=previous.get(p.seat);if(!old||Math.abs(p.x-b.x)>39)continue;
   const top=b.y-62;
   if(bossStomp600(p,b,old,now)){const hit=hitBoss600(g,p.seat,2,emit,{kind:'stomp'});stomp(p,{y:top+24});if(hit&&b.hp>0){b.baseY604=b.y;b.crownUntil604=now+1800;b.phase='counter';b.phaseAt=now;b.dir=p.x<b.x?1:-1;p.bumpVx=-b.dir*190;p.bumpUntil=g.lastAt+220;p.vx=p.bumpVx;}emit(g,'stomp',{seat:p.seat,x:b.x,y:top});}
   else if(bossHead606(p,b,old,now)){bossGuardBounce606(p,b,g.lastAt,stomp);emit(g,'boss-block',{seat:p.seat,x:p.x,y:top,head606:true});}
   else if(p.y>top+3&&p.y-28<b.y&&g.lastAt>=(p.bossGuardUntil606??0))hurt(g,p,'boss',b.x);
  }
  b.at600=now;
 }
 g.enemyShots600=(g.enemyShots600??[]).filter(s=>{
  const oldX=s.x,oldY=s.y;s.x+=s.vx*.025;s.y+=s.vy*.025;
  for(const p of players)if(active(p)&&sweep604(oldX,oldY,s.x,s.y,{x:p.x-10,y:p.y-28,w:20,h:28},s.r)!=null){hurt(g,p,'boss-shot',oldX);return false;}
  return now<s.until&&s.y<370&&s.x>0&&s.x<course.length;
 });
}
