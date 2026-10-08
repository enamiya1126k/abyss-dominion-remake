import {hitBoss600} from './Encounters600.js';
import {fallLimit600} from './Terrain600.js';
import {enemyAt587,surfaces587} from './Level587.js';
import {course589} from './Courses589.js';
export function freeze598(g,e){const p=enemyAt587(e,g.elapsed);e.ice={x:p.x,y:p.y,dir:p.dir,vx:0,vy:0,at:g.elapsed,until:g.elapsed+6500,kicker:null,grace:0};e.frozenAt=g.elapsed;e.frozenUntil=g.elapsed+6500;}
function smash(g,e,emit,seat=null){e.defeated=true;const q=e.ice;if(seat!=null&&g.players[seat])g.players[seat].kills++;emit(g,'shatter',{seat,x:q.x,y:q.y});delete e.ice;e.frozenUntil=0;}
export function stepIce598(g,emit,hurt){
 const course=course589(g),terrain=surfaces587(g.elapsed,course,g).filter(s=>!s.ice);
 for(const e of g.enemies){if(!e.ice||e.defeated)continue;const q=e.ice;
  if(g.elapsed>=q.until){e.x=Math.max(e.min,Math.min(e.max,q.x));e.y=q.y;e.motionOffset=g.elapsed;e.frozenUntil=0;delete e.ice;continue;}
  const old={x:q.x,y:q.y};q.x+=q.vx*.025;q.vy=Math.min(700,q.vy+1350*.025);q.y+=q.vy*.025;q.at=g.elapsed;
  const wall=terrain.find(s=>!s.oneWay&&q.y>s.y+3&&q.y-32<s.y+s.h&&Math.max(old.x,q.x)+22>s.x&&Math.min(old.x,q.x)-22<s.x+s.w);
  if((wall&&Math.abs(q.vx)>0)||q.y>fallLimit600(course,q.x)||q.x<0||q.x>course.length){smash(g,e,emit,q.kicker);continue;}
  const floor=terrain.filter(s=>q.x+20>s.x&&q.x-20<s.x+s.w&&old.y<=s.y+1&&q.y>=s.y).sort((a,b)=>a.y-b.y)[0];if(floor){q.y=floor.y;q.vy=0;}
  if(!q.vx)continue;
  const b=g.boss600;if(b?.hp>0&&Math.abs(q.x-b.x)<55&&Math.abs(q.y-b.y)<65){hitBoss600(g,q.kicker,3,emit);smash(g,e,emit,q.kicker);continue;}
  for(const foe of g.enemies){if(foe===e||foe.defeated)continue;const p=enemyAt587(foe,g.elapsed);if(p.x<Math.min(old.x,q.x)-38||p.x>Math.max(old.x,q.x)+38||Math.abs(p.y-q.y)>30)continue;foe.defeated=true;const owner=g.players[q.kicker];if(owner)owner.kills++;emit(g,'defeat',{seat:q.kicker,x:p.x,y:p.y,kind:'ice'});}
  for(const p of g.players){if(!p.alive||p.waiting||p.respawnAt||p.finishTime!=null||p.platformId==='ice:'+e.id||p.seat===q.kicker&&g.elapsed<q.grace)continue;if(p.x>=Math.min(old.x,q.x)-32&&p.x<=Math.max(old.x,q.x)+32&&p.y>q.y-31&&p.y-28<q.y)hurt(g,p,'ice',old.x);}
 }
}
export function iceContact598(g,previous,emit,hurt){
 for(const e of g.enemies){if(!e.ice||e.defeated)continue;const q=e.ice;if(q.vx)continue;
  for(const p of g.players){if(!p.alive||p.waiting||p.respawnAt||p.finishTime!=null||p.platformId==='ice:'+e.id)continue;
   if(Math.abs(p.x-q.x)>33||p.y<=q.y-31||p.y-28>=q.y)continue;
   const dir=Math.sign(q.x-p.x)||p.facing;q.vx=dir*350;q.kicker=p.seat;q.grace=g.elapsed+350;q.until=g.elapsed+6500;e.frozenUntil=q.until;emit(g,'icekick',{seat:p.seat,x:q.x,y:q.y,dir});break;
  }
 }
}
