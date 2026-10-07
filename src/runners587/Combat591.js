import {ELEMENTS597} from './Gimmicks597.js';
import {course589} from './Courses589.js';
import {enemyAt587,surfaces587} from './Level587.js';
export const POWERS591=Object.fromEntries(Object.entries(ELEMENTS597).map(([id,p])=>[id,{...p,name:p.name+'の紋章'}]));
const usable=p=>p.alive&&!p.waiting&&!p.respawnAt&&p.finishTime==null;
const crossed=(x0,x1,x,r)=>Math.min(x0,x1)-r<=x&&Math.max(x0,x1)+r>=x;
export function combat591(g,emit){
 const course=course589(g),now=g.lastAt;
 for(const p of g.players){
  if(!usable(p))continue;
  for(const item of course.pickups){
   if(p.powers.includes(item.id)||Math.abs(p.x-item.x)>24||Math.abs(p.y-14-item.y)>30)continue;
   p.powers.push(item.id);const power=POWERS591[item.kind];p.weapon=item.kind;p.ammo=0;emit(g,'power',{seat:p.seat,kind:item.kind,x:item.x,y:item.y});
  }
  if(!p.attackHeld||!p.weapon||now<p.shotAt||g.projectiles.length>=24)continue;
  const power=POWERS591[p.weapon];p.shots++;p.shotAt=now+power.cooldown;
  g.projectiles.push({id:++g.projectileId,owner:p.seat,kind:p.weapon,x:p.x+p.facing*25,y:p.y-16,vx:p.facing*(p.weapon==='stone'?300:p.weapon==='thunder'?600:440),vy:0,hitsLeft:ELEMENTS597[p.weapon].hits,born:now,until:now+1600});
  emit(g,'shoot',{seat:p.seat,kind:p.weapon,x:p.x,y:p.y-16});
 }
 g.ventsOff??={};
 const surfaces=surfaces587(g.elapsed,course,g);
 g.projectiles=g.projectiles.filter(b=>{
  if(now>=b.until)return false;
  const oldX=b.x,oldY=b.y;b.x+=b.vx*.025;
  if(['fire','stone'].includes(b.kind)){b.vy+=520*.025;b.y+=b.vy*.025;}
  for(const s of surfaces){
   if(s.breakable&&g.broken?.includes(s.id))continue;
   if(b.x+6<s.x||b.x-6>s.x+s.w)continue;
   if(['fire','stone'].includes(b.kind)&&b.vy>0&&oldY<=s.y-5&&b.y>=s.y-5){b.y=s.y-6;b.vy=-150;break;}
   if(!s.oneWay&&b.y>s.y+3&&b.y<s.y+s.h){
    if(s.breakable&&['fire','stone'].includes(b.kind)){
     g.barrierHits??={};g.broken??=[];g.barrierHits[s.id]=(g.barrierHits[s.id]??0)+(b.kind==='stone'?2:1);
     if(g.barrierHits[s.id]>=2){g.broken.push(s.id);emit(g,'break',{seat:b.owner,x:s.x+s.w/2,y:s.y+s.h/2,wall:s.id});}
     else emit(g,'crack',{seat:b.owner,x:s.x+s.w/2,y:s.y+s.h/2,wall:s.id});
    }
    return false;
   }
  }
  if(b.kind==='water')for(const h of course.hazards){if(h.kind!=='spikes'&&b.x+12>h.x&&b.x-12<h.x+h.w&&b.y>h.y-h.h&&b.y<h.y+8)g.ventsOff[h.id]=now+1800;}
  for(const e of g.enemies){
   if(e.defeated||e.downUntil>now)continue;const q=enemyAt587(e,g.elapsed);
   if(!crossed(oldX,b.x,q.x,23)||Math.abs(b.y-(q.y-13))>21)continue;
   if(b.kind==='ice'){e.frozenAt=g.elapsed;e.frozenUntil=g.elapsed+2300;b.hitsLeft=0;emit(g,'freeze',{seat:b.owner,x:q.x,y:q.y});return false;}e.defeated=true;e.downUntil=0;const owner=g.players[b.owner];owner.kills++;if(b.kind==='thunder'){let links=0;for(const next of g.enemies){if(next.defeated||next===e)continue;const n=enemyAt587(next,g.elapsed);if(Math.hypot(n.x-q.x,n.y-q.y)<140&&links++<2){next.defeated=true;owner.kills++;emit(g,'zap',{seat:b.owner,x:n.x,y:n.y,fromX:q.x,fromY:q.y});}}}
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
  return b.y<440&&b.x>0&&b.x<course.length;
 });
}
