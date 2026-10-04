import {course589} from './Courses589.js';
import {enemyAt587,surfaces587} from './Level587.js';
export const POWERS591={fire:{name:'火の紋章',color:'#ffc17f',ammo:10,cooldown:420},wind:{name:'風の紋章',color:'#a5f1e6',ammo:8,cooldown:580}};
const usable=p=>p.alive&&!p.respawnAt&&p.finishTime==null;
const crossed=(x0,x1,x,r)=>Math.min(x0,x1)-r<=x&&Math.max(x0,x1)+r>=x;
export function combat591(g,emit){
 const course=course589(g),now=g.lastAt;
 for(const p of g.players){
  if(!usable(p))continue;
  for(const item of course.pickups){
   if(p.powers.includes(item.id)||Math.abs(p.x-item.x)>24||Math.abs(p.y-14-item.y)>30)continue;
   p.powers.push(item.id);p.weapon=item.kind;p.ammo=POWERS591[item.kind].ammo;emit(g,'power',{seat:p.seat,kind:item.kind,x:item.x,y:item.y});
  }
  if(!p.attackHeld||!p.weapon||p.ammo<=0||now<p.shotAt||g.projectiles.length>=24)continue;
  const power=POWERS591[p.weapon];p.ammo--;p.shots++;p.shotAt=now+power.cooldown;
  g.projectiles.push({id:++g.projectileId,owner:p.seat,kind:p.weapon,x:p.x+p.facing*25,y:p.y-16,vx:p.facing*(p.weapon==='fire'?390:440),vy:0,born:now,until:now+1600});
  emit(g,'shoot',{seat:p.seat,kind:p.weapon,x:p.x,y:p.y-16});
 }
 const surfaces=surfaces587(g.elapsed,course,g);
 g.projectiles=g.projectiles.filter(b=>{
  if(now>=b.until)return false;
  const oldX=b.x,oldY=b.y;b.x+=b.vx*.025;
  if(b.kind==='fire'){b.vy+=520*.025;b.y+=b.vy*.025;}
  for(const s of surfaces){
   if(b.x+6<s.x||b.x-6>s.x+s.w)continue;
   if(b.kind==='fire'&&b.vy>0&&oldY<=s.y-5&&b.y>=s.y-5){b.y=s.y-6;b.vy=-150;break;}
   if(!s.oneWay&&b.y>s.y+3&&b.y<s.y+s.h)return false;
  }
  for(const e of g.enemies){
   if(e.defeated||e.downUntil>now)continue;const q=enemyAt587(e,g.elapsed);
   if(!crossed(oldX,b.x,q.x,23)||Math.abs(b.y-(q.y-13))>21)continue;
   e.defeated=true;e.downUntil=0;const owner=g.players[b.owner];owner.kills++;
   emit(g,'defeat',{seat:b.owner,x:q.x,y:q.y,kind:b.kind});return false;
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
