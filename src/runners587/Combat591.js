import {hitBoss600,roller600} from './Encounters600.js';
import {fallLimit600} from './Terrain600.js';
import {freeze598} from './Ice598.js';
import {ELEMENTS597} from './Gimmicks597.js';
import {course589} from './Courses589.js';
import {enemyAt587,surfaces587} from './Level587.js';
export const POWERS591=Object.fromEntries(Object.entries(ELEMENTS597).map(([id,p])=>[id,{...p,name:p.name+'の紋章'}]));
const usable=p=>p.alive&&!p.waiting&&!p.respawnAt&&p.finishTime==null;
const crossed=(x0,x1,x,r)=>Math.min(x0,x1)-r<=x&&Math.max(x0,x1)+r>=x;
function boxTime600(x0,y0,x1,y1,s){
 let enter=0,exit=1;
 for(const [a,d,min,max]of [[x0,x1-x0,s.x-5,s.x+s.w+5],[y0,y1-y0,s.y-5,s.y+s.h+5]]){
  if(Math.abs(d)<1e-9){if(a<min||a>max)return null;continue;}
  const t0=(min-a)/d,t1=(max-a)/d;enter=Math.max(enter,Math.min(t0,t1));exit=Math.min(exit,Math.max(t0,t1));if(enter>exit)return null;
 }
 return enter;
}
export function combat591(g,emit){
 const course=course589(g),now=g.lastAt;
 for(const p of g.players){
  if(!usable(p))continue;
  for(const item of course.pickups){
   if(p.powers.includes(item.id)||Math.abs(p.x-item.x)>24||Math.abs(p.y-14-item.y)>30)continue;
   p.powers.push(item.id);const power=POWERS591[item.kind];p.weapon=item.kind;p.ammo=0;emit(g,'power',{seat:p.seat,kind:item.kind,x:item.x,y:item.y});
  }
  if(p.burst598&&p.weapon!=='fire')p.burst598=0;
  const burst=p.burst598>0&&now>=p.burstAt598;
  if((!burst&&(!p.attackHeld||!p.weapon||now<p.shotAt))||g.projectiles.length>=24)continue;
  const power=POWERS591[p.weapon];p.shots++;
  if(burst){p.burst598--;p.burstAt598=now+90;}else {p.shotAt=now+power.cooldown;if(p.weapon==='fire'){p.burst598=2;p.burstAt598=now+90;}}
  g.projectiles.push({id:++g.projectileId,owner:p.seat,kind:p.weapon,x:p.x+p.facing*25,y:p.y-16,vx:p.facing*(p.weapon==='stone'?300:p.weapon==='thunder'?600:440),vy:0,hitsLeft:ELEMENTS597[p.weapon].hits,born:now,until:now+1600});
  emit(g,'shoot',{seat:p.seat,kind:p.weapon,x:p.x,y:p.y-16});
 }
 g.ventsOff??={};
 const surfaces=surfaces587(g.elapsed,course,g);
 g.projectiles=g.projectiles.filter(b=>{
  if(now>=b.until)return false;
  const oldX=b.x,oldY=b.y;b.x+=b.vx*.025;
  if(['fire','stone'].includes(b.kind)){b.vy+=520*.025;b.y+=b.vy*.025;}
  // Sweep the visible radius: fast shots, grazing edges and box seams all hit.
  let box=null,time=Infinity,wallTime=Infinity;
  for(const s of surfaces){if(s.spike||s.ice||s.oneWay||s.ground||g.broken?.includes(s.id))continue;const t=boxTime600(oldX,oldY,b.x,b.y,s);if(t==null)continue;if(!s.breakable){wallTime=Math.min(wallTime,t);continue;}if(t<time){box=s;time=t;}}
  if(wallTime<time)return false;
  if(box){g.barrierHits??={};g.broken??=[];const s=box;g.barrierHits[s.id]=(g.barrierHits[s.id]??0)+(b.kind==='stone'?4:b.kind==='fire'?2:1);
   const broken=g.barrierHits[s.id]>=4;if(broken)g.broken.push(s.id);emit(g,broken?'break':'crack',{seat:b.owner,x:s.x+s.w/2,y:s.y+s.h/2,wall:s.id});return false;
  }
  for(const s of surfaces){
   // Spikes stop bodies at the sides, never projectiles or their bounce path.
   if(s.ice||s.spike)continue;
   if(s.breakable&&g.broken?.includes(s.id))continue;
   if(b.x+6<s.x||b.x-6>s.x+s.w)continue;
   if(['fire','stone'].includes(b.kind)&&b.vy>0&&oldY<=s.y-5&&b.y>=s.y-5){b.y=s.y-6;b.vy=-150;break;}
   if(!s.oneWay&&b.y>s.y+3&&b.y<s.y+s.h){
    return false;
   }
  }
  if(b.kind==='water')for(const h of course.hazards){if(h.kind!=='spikes'&&b.x+12>h.x&&b.x-12<h.x+h.w&&b.y>h.y-h.h&&b.y<h.y+8)g.ventsOff[h.id]=now+1800;}
  for(const h of course.rollers600??[]){const q=roller600(h,g.elapsed);if(q.active&&g.rollerBroken600[h.id]!==q.cycle&&crossed(oldX,b.x,q.x,27)&&Math.abs(b.y-q.y)<27){g.rollerBroken600[h.id]=q.cycle;emit(g,'shatter',{seat:b.owner,x:q.x,y:q.y});return false;}}
  const boss=g.boss600;
  if(boss?.hp>0&&crossed(oldX,b.x,boss.x,38)&&b.y>boss.y-66&&b.y<boss.y+4){hitBoss600(g,b.owner,b.kind==='stone'?2:1,emit,{kind:'shot',x:oldX});return false;}
  for(const e of g.enemies){
   if(e.defeated||e.downUntil>now)continue;const q=enemyAt587(e,g.elapsed);
   if(!crossed(oldX,b.x,q.x,23)||Math.abs(b.y-(q.y-13))>21)continue;
   if(b.kind==='ice'){freeze598(g,e);b.hitsLeft=0;emit(g,'freeze',{seat:b.owner,x:q.x,y:q.y});return false;}e.defeated=true;e.downUntil=0;const owner=g.players[b.owner];owner.kills++;if(b.kind==='thunder'){let links=0;for(const next of g.enemies){if(next.defeated||next===e)continue;const n=enemyAt587(next,g.elapsed);if(Math.hypot(n.x-q.x,n.y-q.y)<140&&links++<2){next.defeated=true;owner.kills++;emit(g,'zap',{seat:b.owner,x:n.x,y:n.y,fromX:q.x,fromY:q.y});}}}
   emit(g,'defeat',{seat:b.owner,x:q.x,y:q.y,kind:b.kind});b.hitsLeft=(b.hitsLeft??1)-1;if(b.hitsLeft<=0)return false;
  }
  for(const p of g.players){
   if(p.seat===b.owner||!usable(p)||p.invincibleUntil>now||p.bumpSafeUntil>now)continue;
   if(!crossed(oldX,b.x,p.x,18)||Math.abs(b.y-(p.y-14))>20)continue;
   // Friendly shots never remove a heart. Brief immunity prevents juggling.
   p.bumpVx=Math.sign(b.vx)*(b.kind==='wind'?220:150);p.bumpUntil=now+160;p.bumpSafeUntil=now+1100;
   p.vx=p.bumpVx;p.vy=-155;p.grounded=false;p.platformId=null;p.lastGroundAt=-1e9;p.springFlight=true;
   g.players[b.owner].pranks++;emit(g,'bump',{seat:p.seat,helper:b.owner,x:p.x,y:p.y,kind:b.kind});return false;
  }
  return b.y<fallLimit600(course,b.x)&&b.x>0&&b.x<course.length;
 });
}
