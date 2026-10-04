import {combat591} from './Combat591.js';
import {bot591} from './Bot591.js';
import {make580,players580,publicBase580,event580 as emit,resume580} from '../arcade580/Common580.js';
import {enemyAt587,surfaces587} from './Level587.js';
import {course589,readyGate589,inHazard589} from './Courses589.js';
import {mechanics589} from './Mechanics589.js';
import {RUN587 as C,control587,stepRunner587,enemyContact588} from './Physics587.js';
import {rank588} from './Feel588.js';
export const makeRunners587=args=>({...make580('runners',args),rules587:4,courseId:'forest',switches:[],switchBy:{},crumbles:{},rescues:0,teamClear:false,teamCheckpoint:0,projectiles:[],projectileId:0,elapsed:0,stage:'ready',enemies:[],finishAt:null});
export const signature587=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
export function startRunners587(g,now,seed=587){if(g.phase!=='lobby')return false;const course=course589(g);g.courseId=course.id;players580(g);g.seed=seed>>>0||587;
 for(const p of g.players){delete p.score;Object.assign(p,{x:90+p.seat*24,y:300,vx:0,vy:0,axis:0,facing:1,grounded:true,platformId:'ground0',lastGroundAt:now,controlAt:now,jumpHeld:false,jumpBufferUntil:0,springFlight:false,lives:C.lives,alive:true,respawnAt:0,invincibleUntil:0,boostUntil:0,gems:[],checkpoint:0,furthest:90,finishTime:null,outAt:null,lastSeq:0,powers:[],weapon:null,ammo:0,attackHeld:false,shotAt:0,shots:0,kills:0,pranks:0,bumpUntil:0,bumpSafeUntil:0,stomps:0,jumps:0,wallJumps:0,buddyBounces:0,buddyUntil:0,wallSide:0,wallAt:-1e9,wallLockUntil:0,botWait:now+C.countdown+p.seat*100+(seed%5)*10});}
 Object.assign(g,{phase:'countdown',stage:'ready',phaseAt:now,lastAt:now,serverAt:now,startAt:now+C.countdown,deadline:now+C.countdown+course.duration,elapsed:0,finishAt:null,switches:[],switchBy:{},crumbles:{},rescues:0,teamClear:false,teamCheckpoint:0,projectiles:[],projectileId:0,enemies:course.enemies.map(e=>({...e,downUntil:0})),results:[],winnerIds:[]});g.revision++;return true;
}
export function validRunners587(g,p,m){return g.phase==='play'&&g.stage==='run'&&p?.alive&&p.finishTime==null&&!p.respawnAt&&m.action==='control'&&m.target&&[-1,0,1].includes(m.target.axis)&&typeof m.target.jump==='boolean'&&typeof m.target.attack==='boolean';}
export function inputRunners587(g,p,m){if(!validRunners587(g,p,m))return false;p.lastSeq=Math.max(p.lastSeq,m.seq??0);control587(p,m.target,g.lastAt);return true;}
function respawn(g,p){const course=course589(g);p.checkpoint=Math.max(p.checkpoint,g.teamCheckpoint??0);const cp=course.checkpoints[p.checkpoint];Object.assign(p,{x:cp.x,y:cp.y,vx:0,vy:0,axis:0,jumpHeld:false,jumpBufferUntil:0,controlAt:g.lastAt,grounded:true,platformId:surfaces587(g.elapsed,course,g).find(s=>s.ground&&cp.x>=s.x&&cp.x<s.x+s.w)?.id,alive:true,lives:p.lives>0?p.lives:3,powers:[],weapon:null,ammo:0,attackHeld:false,bumpUntil:0,bumpSafeUntil:0,respawnAt:0,invincibleUntil:g.lastAt+1600,boostUntil:0,springFlight:false,lastGroundAt:g.lastAt,wallSide:0,wallAt:-1e9,wallLockUntil:0,buddyUntil:0});emit(g,'respawn',{seat:p.seat,x:p.x,y:p.y});}
export function hurtRunners587(g,p,cause='fall'){if(!p.alive||p.respawnAt||p.finishTime!=null)return false;if(cause!=='fall'&&g.lastAt<p.invincibleUntil)return false;p.lives--;p.vx=0;p.vy=0;p.axis=0;p.jumpHeld=false;p.jumpBufferUntil=0;p.boostUntil=0;if(p.lives<=0){p.alive=false;p.outAt=g.lastAt;p.respawnAt=g.lastAt+2200;}else p.respawnAt=g.lastAt+C.respawn;emit(g,p.alive?'miss':'out',{seat:p.seat,cause,x:p.x,y:p.y,lives:p.lives});return true;}
export function finishRunners587(g){const course=course589(g);g.teamClear=course.mode==='coop'&&readyGate589(g)&&g.players.every(p=>p.finishTime!=null);
 g.results=g.players.map(p=>({seat:p.seat,playerId:p.playerId,rank:course.mode==='coop'?(g.teamClear?1:0):rank588(g,p),finishTime:p.finishTime,distance:Math.min(100,Math.floor(p.furthest/course.goal*100)),lives:p.lives})).sort((a,b)=>a.rank-b.rank||a.seat-b.seat);
 g.winnerIds=g.results.filter(r=>r.rank===1).map(r=>r.playerId);g.stage='finish';g.finishAt=g.lastAt+1600;emit(g,'last',{winnerIds:g.winnerIds});
}
export function advanceRunners587(g,now,inputs=new Map(),auto=new Set()){
 if(['lobby','result'].includes(g.phase))return false;const course=course589(g);
 if(now-g.lastAt>1000){const delta=now-g.lastAt-C.step;for(const b of g.projectiles){b.born+=delta;b.until+=delta;}for(const e of g.enemies)if(e.downUntil>0)e.downUntil+=delta;}
 resume580(g,now,inputs,['startAt','phaseAt','deadline','finishAt'],['controlAt','lastGroundAt','jumpBufferUntil','respawnAt','invincibleUntil','boostUntil','outAt','wallAt','wallLockUntil','buddyUntil','bumpUntil','bumpSafeUntil','shotAt']);
 let changed=false;while(g.lastAt+C.step<=now&&g.phase!=='result'){g.lastAt+=C.step;changed=true;
  if(g.phase==='countdown'){inputs.clear();if(g.lastAt<g.startAt)continue;g.phase='play';g.stage='run';g.phaseAt=g.lastAt;emit(g,'start');}
  if(g.stage==='finish'){inputs.clear();if(g.lastAt>=g.finishAt){g.phase='result';g.phaseAt=g.lastAt;emit(g,'finish');}continue;}
  g.elapsed=g.lastAt-g.startAt;const previous=new Map();
  for(const p of g.players){const wasAuto=p.auto;p.auto=p.ai||auto.has(p.playerId);const list=inputs.get(p.playerId)??[];inputs.delete(p.playerId);if(p.finishTime!=null)continue;
   if(p.respawnAt){if(g.lastAt>=p.respawnAt)respawn(g,p);else continue;}
   if(!p.alive)continue;
   if(wasAuto&&!p.auto)control587(p,{axis:0,jump:false},g.lastAt);
   if(p.auto)bot591(g,p);else{const future=[];for(const m of list){if(Number.isFinite(m.at)&&m.at>g.lastAt){future.push(m);continue;}if(m.round==null||m.round===g.round)inputRunners587(g,p,m);}if(future.length)inputs.set(p.playerId,future);}
   const {before,jumped,wallJumped,landed,impact}=stepRunner587(p,g.lastAt,g.elapsed,C.step/1000,g);previous.set(p.seat,before);if(wallJumped){p.wallJumps++;emit(g,'wallkick',{seat:p.seat,x:p.x,y:p.y});}if(jumped){p.jumps++;emit(g,'jump',{seat:p.seat,x:p.x,y:p.y});}
   if(landed&&!before.grounded&&impact>180)emit(g,'land',{seat:p.seat,x:p.x,y:p.y});
   if(p.y>440){hurtRunners587(g,p);continue;}
   for(const enemy of g.enemies){if(enemy.defeated||enemy.downUntil>g.lastAt)continue;const e=enemyAt587(enemy,g.elapsed),contact=enemyContact588(p,e,before);if(!contact)continue;
    if(contact==='stomp'){enemy.defeated=true;enemy.downUntil=0;p.y=e.y-24;p.vy=p.jumpHeld?-365:-285;p.grounded=false;p.lastGroundAt=-1e9;p.springFlight=true;p.stomps++;emit(g,'stomp',{seat:p.seat,x:e.x,y:e.y});}
    else hurtRunners587(g,p,'enemy');break;
   }
   if(!p.alive||p.respawnAt)continue;
   const spring=course.springs.find(s=>p.grounded&&Math.abs(s.x-p.x)<21&&Math.abs(s.y-p.y)<5);if(spring){p.vy=-(spring.power??C.spring);p.grounded=false;p.lastGroundAt=-1e9;p.springFlight=true;emit(g,'spring',{seat:p.seat,x:spring.x,y:spring.y});}
   for(const gem of course.gems)if(!p.gems.includes(gem.id)&&Math.hypot(p.x-gem.x,p.y-C.height/2-gem.y)<25){p.gems.push(gem.id);p.boostUntil=g.lastAt+2600;emit(g,'boost',{seat:p.seat,x:gem.x,y:gem.y});}
   for(let i=p.checkpoint+1;i<course.checkpoints.length;i++){const cp=course.checkpoints[i];if(p.x>=cp.x&&p.y<=cp.y+15){p.checkpoint=i;g.teamCheckpoint=Math.max(g.teamCheckpoint,i);emit(g,'checkpoint',{seat:p.seat,checkpoint:i});}}
   p.furthest=Math.max(p.furthest,p.x);
  }
  mechanics589(g,previous,emit,hurtRunners587);
  combat591(g,emit);
  for(const p of g.players)if(p.alive&&!p.respawnAt&&p.finishTime==null&&p.x>=course.goal&&p.y<=320){
   if(!readyGate589(g)){p.x=course.goal-35;p.vx=0;continue;}
   p.finishTime=g.elapsed;p.x=course.goal+10;p.vx=0;p.vy=0;p.axis=0;if(course.mode!=='coop')g.deadline=Math.min(g.deadline,g.lastAt+C.grace);emit(g,'goal',{seat:p.seat,time:p.finishTime});
  }
  if(g.lastAt>=g.deadline||g.players.every(p=>p.finishTime!=null))finishRunners587(g);
 }
 g.serverAt=g.lastAt;g.updatedAt=now;if(changed)g.revision++;return changed;
}
export function publicRunners587(g,selfId){return{...publicBase580(g),rules587:g.rules587,courseId:g.courseId??'forest',switches:[...(g.switches??[])],switchBy:{...(g.switchBy??{})},crumbles:{...(g.crumbles??{})},rescues:g.rescues,teamClear:g.teamClear,teamCheckpoint:g.teamCheckpoint,projectiles:g.projectiles.map(b=>({...b})),stage:g.stage,elapsed:g.elapsed,finishAt:g.finishAt,enemies:g.enemies.map(e=>({...e})),players:g.players.map(({inputSeq563,botWait,...p})=>({...p,gems:[...p.gems],powers:[...p.powers],processedSeq:p.lastSeq,lastSeq:p.playerId===selfId?Math.max(p.lastSeq,inputSeq563??0):0}))};}
