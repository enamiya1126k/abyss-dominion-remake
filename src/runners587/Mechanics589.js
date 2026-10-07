import {crusherAt597} from './Gimmicks597.js';
import {course589,inHazard589} from './Courses589.js';
import {RUN587 as C} from './Physics587.js';

// Resolve all four previous/current positions together; seat iteration cannot
// turn an ascending character into a platform or bounce a pair repeatedly.
export function mechanics589(g,previous,emit,hurt){
 const course=course589(g),usable=p=>p.alive&&!p.waiting&&!p.respawnAt&&p.finishTime==null;
 const pairs=[];
 for(const rider of g.players){
  if(!usable(rider)||g.lastAt<(rider.buddyUntil??0))continue;
  const before=previous.get(rider.seat);if(!before||before.grounded||rider.y<before.y)continue;
  for(const base of g.players){
   if(base===rider||!usable(base))continue;
   const old=previous.get(base.seat);if(!old)continue;
   const top=base.y-C.height,oldTop=old.y-C.height;
   if(Math.abs(rider.x-base.x)<23&&before.y<=oldTop+3&&rider.y>=top&&rider.y<=base.y+10&&rider.y-before.y>=base.y-old.y){pairs.push({rider,base,top});break;}
  }
 }
 for(const {rider,base,top} of pairs){
  rider.y=top;rider.vy=-C.buddyJump;rider.grounded=false;rider.platformId=null;rider.lastGroundAt=-1e9;rider.jumpBufferUntil=0;rider.springFlight=true;rider.buddyUntil=g.lastAt+300;rider.buddyBounces++;
  emit(g,'buddy',{seat:rider.seat,helper:base.seat,x:rider.x,y:rider.y});
 }
 for(const p of g.players){
  if(!usable(p))continue;
  for(const h of course.crushers??[]){const s=crusherAt597(h,g.elapsed);if(p.x+10<=h.x||p.x-10>=h.x+h.w||p.y-28>=s.bottom||p.y<=s.bottom-180)continue;if(s.bottom<=272&&p.vy<0){p.y=s.bottom+28;p.vy=0;}else if(s.bottom>272)hurt(g,p,'crush');}
  if(inHazard589(p,course,g.elapsed,g)){hurt(g,p,course.hazards.some(h=>h.kind==='spikes'&&p.x+10>h.x&&p.x-10<h.x+h.w&&p.y>h.y-h.h)?'spikes':'steam');continue;}
  if(p.grounded&&course.platforms.some(s=>s.id===p.platformId&&s.crumble)&&g.crumbles[p.platformId]==null){g.crumbles[p.platformId]=g.elapsed;emit(g,'crumble',{seat:p.seat,x:p.x,y:p.y,platform:p.platformId});}
  for(const s of course.switches){
   if(g.switches.includes(s.id)||!p.grounded||Math.abs(p.x-s.x)>24||Math.abs(p.y-s.y)>4)continue;
   g.switches.push(s.id);g.switchBy[s.id]=p.seat;emit(g,'switch',{seat:p.seat,switchId:s.id,x:s.x,y:s.y});
   if(course.mode==='coop')for(const friend of g.players){
    if(friend.alive||friend.finishTime!=null)continue;
    friend.alive=true;friend.lives=1;friend.checkpoint=Math.max(0,course.checkpoints.findLastIndex(cp=>cp.x<=s.x));friend.respawnAt=g.lastAt+C.respawn;friend.outAt=null;g.rescues++;emit(g,'rescue',{seat:friend.seat,helper:p.seat,x:s.x,y:s.y});
   }
  }
 }
 for(const [id,start]of Object.entries(g.crumbles))if(g.elapsed>=start+4000)delete g.crumbles[id];
}
