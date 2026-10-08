import {surfaces587} from './Level587.js';
import {course589} from './Courses589.js';
export const RUN587=Object.freeze({step:25,countdown:3000,duration:75000,grace:16000,lives:3,radius:11,height:28,speed:235,boostSpeed:280,accel:1900,brake:2600,airAccel:1800,gravity:1080,fallGravity:1350,jump:470,shortJump:275,spring:610,coyote:125,buffer:150,inputTTL:350,respawn:700,invincible:1200,wallJump:465,wallPush:260,wallSlide:92,buddyJump:550});
export const clamp587=(n,a,b)=>Math.max(a,Math.min(b,n));
const approach=(v,target,d)=>v<target?Math.min(target,v+d):Math.max(target,v-d);
export function control587(p,target,at){const held=!!target.jump;if(held&&!p.jumpHeld)p.jumpBufferUntil=at+RUN587.buffer;p.jumpHeld=held;p.attackHeld=!!target.attack;if(typeof target.pause==='boolean')p.paused=target.pause;p.axis=target.axis;p.controlAt=at;}
export function enemyContact588(p,e,before){
 const top=e.y-24,dx=Math.abs(p.x-e.x);
 // Swept feet crossing the top wins over side damage, even at high fall speed.
 if(p.vy>=0&&dx<RUN587.radius+18&&before.y<=top+12&&p.y>=top-2&&p.y-RUN587.height<e.y+4)return 'stomp';
 if(dx>=RUN587.radius+12||p.y<=top+3||p.y-RUN587.height>=e.y-2)return null;
 if(p.vy<0&&p.y<e.y-9)return null;
 return 'hurt';
}
// Shared by authority and prediction: every stomp grants a fresh normal jump.
export function stomp599(p,e){
 Object.assign(p,{y:e.y-24,vy:-285,grounded:false,platformId:null,lastGroundAt:-1e9,springFlight:true,jumpBufferUntil:0,reboundJump599:true,airJumpUsed:false,airJumps598:0,wallSide:0,wallAt:-1e9,wallLockUntil:0});
}
// y is the character's feet. Server and prediction share all course physics.
export function stepRunner587(p,at,elapsed,dt=RUN587.step/1000,world={}){
 const C=RUN587,course=course589(world),surfaces=surfaces587(elapsed,course,world),previous=surfaces587(elapsed-dt*1000,course,world);
 let jumped=false,wallJumped=false,windJumped=false,landed=false,spring=null,impact=0;
 if(at-p.controlAt>C.inputTTL){p.axis=0;p.jumpHeld=false;p.attackHeld=false;p.jumpBufferUntil=0;}
 if(p.grounded&&p.platformId){const old=previous.find(s=>s.id===p.platformId),now=surfaces.find(s=>s.id===p.platformId);if(old&&now){p.x+=now.x-old.x;p.y+=now.y-old.y;}}
 if(p.grounded){p.lastGroundAt=at;p.airJumpUsed=false;p.airJumps598=0;p.reboundJump599=false;}
 if(p.jumpBufferUntil>=at){
  if(at-p.lastGroundAt<=C.coyote){p.vy=-C.jump;jumped=true;p.springFlight=false;}
  else if(p.reboundJump599){p.vy=-C.jump;p.reboundJump599=false;jumped=true;p.springFlight=false;}
  else if(p.wallSide&&at-(p.wallAt??-1e9)<=100&&at>=(p.wallLockUntil??0)){
   p.vy=-C.wallJump;p.wallKickVx=-p.wallSide*C.wallPush;p.vx=p.wallKickVx;p.facing=-p.wallSide;p.wallLockUntil=at+140;p.wallSide=0;p.wallAt=-1e9;p.springFlight=true;wallJumped=true;
  }
  else if(!p.grounded&&p.weapon==='wind'&&(p.airJumps598??0)<2){p.vy=-C.jump;p.airJumps598=(p.airJumps598??0)+1;p.airJumpUsed=p.airJumps598>=2;p.springFlight=true;windJumped=true;}
  if(jumped||wallJumped||windJumped){p.grounded=false;p.platformId=null;p.lastGroundAt=-1e9;p.jumpBufferUntil=0;}
 }
 if(!p.jumpHeld&&!p.springFlight&&p.vy<-C.shortJump)p.vy=-C.shortJump;
 const wind=!p.grounded?course.winds.find(w=>p.x>=w.x&&p.x<w.x+w.w&&p.y>w.y&&p.y<w.y+w.h):null;
 const speed=p.weapon==='thunder'?315:p.boostUntil>at?C.boostSpeed:C.speed,wanted=p.axis*speed+(wind?.speed??0);
 if(at<(p.bumpUntil??0))p.vx=p.bumpVx;
 else if(at<(p.wallLockUntil??0))p.vx=p.wallKickVx;
 else{p.vx=approach(p.vx,wanted,(p.axis?(p.grounded?C.accel:C.airAccel):(p.grounded&&course.theme==='frost'?750:C.brake))*dt);if(p.axis)p.facing=p.axis;}
 const before={x:p.x,y:p.y,vy:p.vy,grounded:p.grounded};
 const belt=p.grounded?course.belts.find(b=>p.x>=b.x&&p.x<b.x+b.w&&Math.abs(p.y-b.y)<4):null;
 p.x=clamp587(p.x+(p.vx+(belt?.speed??0))*dt,C.radius,course.length-C.radius);
 let wallSide=0;
 for(const s of surfaces){
  if(s.oneWay||before.y<=s.y+.01||before.y-C.height>=s.y+s.h)continue;
  if(p.x+C.radius>s.x&&p.x-C.radius<s.x+s.w){
   if(before.x+C.radius<=s.x+.1){p.x=s.x-C.radius;p.vx=0;wallSide=1;}
   else if(before.x-C.radius>=s.x+s.w-.1){p.x=s.x+s.w+C.radius;p.vx=0;wallSide=-1;}
  }
  if(Math.abs(p.x+C.radius-s.x)<1.5)wallSide=1;
  if(Math.abs(p.x-C.radius-s.x-s.w)<1.5)wallSide=-1;
 }
 p.wallSide=wallSide;if(wallSide)p.wallAt=at;
 p.vy=Math.min(750,p.vy+(p.vy>0?C.fallGravity:C.gravity)*dt);
 if(wallSide&&p.axis===wallSide&&!p.grounded&&p.vy>C.wallSlide)p.vy=C.wallSlide;
 p.y+=p.vy*dt;p.grounded=false;p.platformId=null;
 if(p.vy<0){
  for(const s of surfaces){if(s.oneWay||p.x+C.radius<=s.x||p.x-C.radius>=s.x+s.w)continue;
   if(before.y-C.height>=s.y+s.h&&p.y-C.height<s.y+s.h){p.y=s.y+s.h+C.height;p.vy=0;}
  }
 }else{
  let hit=null;
  for(const s of surfaces){const old=s.move?(previous.find(q=>q.id===s.id)??s):s;if(p.x+C.radius>s.x&&p.x-C.radius<s.x+s.w&&before.y<=old.y+1&&p.y>=s.y&&(!hit||s.y<hit.y))hit=s;}
  if(hit){impact=p.vy;p.y=hit.y;p.vy=0;p.grounded=true;p.platformId=hit.id;p.lastGroundAt=at;p.springFlight=false;landed=true;p.wallSide=0;p.wallLockUntil=0;p.reboundJump599=false;p.airJumps598=0;p.airJumpUsed=false;
   if(hit.spring){spring=hit;Object.assign(p,{vy:-(hit.power??C.spring),grounded:false,platformId:null,lastGroundAt:-1e9,springFlight:true,jumpBufferUntil:0,wallSide:0,wallAt:-1e9,wallLockUntil:0});}
  }
 }
 return {before,jumped,wallJumped,windJumped,landed,spring,impact,surfaces};
}
