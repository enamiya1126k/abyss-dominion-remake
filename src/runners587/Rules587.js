import {initThreats604,stepThreats604,resolveThreats604,thaw604,frozen604} from './Threats604.js';
import {hazards603} from './Hazards603.js';
import {initCoop601,cooperation601,checkpoint601} from './Coop601.js';
import {initEncounters600,encounters600} from './Encounters600.js';
import {fallLimit600} from './Terrain600.js';
import {stepIce598,iceContact598} from './Ice598.js';
import {combat591} from './Combat591.js';
import {assignColors499} from '../party/PartyColors499.js';
import {make580,publicBase580,event580 as emit,resume580} from '../arcade580/Common580.js';
import {enemyAt587,surfaces587} from './Level587.js';
import {course589,readyGate589,inHazard589} from './Courses589.js';
import {mechanics589} from './Mechanics589.js';
import {RUN587 as C,control587,stepRunner587,enemyContact588,stomp599} from './Physics587.js';
import {rank588} from './Feel588.js';
export const makeRunners587=args=>({...make580('runners',{...args,members:args.members.filter(m=>!m.ai)}),rules587:15,courseId:'forest',switches:[],switchBy:{},crumbles:{},rescues:0,teamClear:false,teamCheckpoint:0,projectiles:[],projectileId:0,broken:[],barrierHits:{},ventsOff:{},elapsed:0,stage:'ready',enemies:[],finishAt:null});
export const signature587=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
export function startRunners587(g,now,seed=587){if(g.phase!=='lobby')return false;const course=course589(g);g.courseId=course.id;g.players=g.members.filter(m=>!m.departed&&!m.ai).map((m,seat)=>({playerId:m.playerId,name:m.name,seat,ai:false,auto:false,waiting:false,color499:m.color499,speciesId:m.choice?.speciesId??'slime'}));if(!g.players.length)return false;assignColors499(g.players);g.seed=seed>>>0||587;
 for(const p of g.players){delete p.score;Object.assign(p,{x:90+p.seat*24,y:300,vx:0,vy:0,axis:0,facing:1,grounded:true,platformId:'ground0',lastGroundAt:now,controlAt:now,jumpHeld:false,jumpBufferUntil:0,airJumpUsed:false,airJumps598:0,reboundJump599:false,motionEpoch600:0,springFlight:false,lives:1,deaths:0,fatalDeaths601:0,falls:0,paused:false,alive:true,respawnAt:0,invincibleUntil:0,boostUntil:0,gems:[],checkpoint:0,furthest:90,finishTime:null,outAt:null,lastSeq:0,powers:[],weapon:null,ammo:0,attackHeld:false,shotAt:0,shots:0,kills:0,pranks:0,bumpUntil:0,bumpSafeUntil:0,stomps:0,jumps:0,wallJumps:0,buddyBounces:0,buddyUntil:0,wallSide:0,wallAt:-1e9,wallLockUntil:0});}
 Object.assign(g,{phase:'countdown',stage:'ready',phaseAt:now,lastAt:now,serverAt:now,startAt:now+C.countdown,deadline:now+C.countdown+course.duration,elapsed:0,finishAt:null,switches:[],switchBy:{},crumbles:{},rescues:0,teamClear:false,teamCheckpoint:0,projectiles:[],projectileId:0,broken:[],barrierHits:{},ventsOff:{},enemies:course.enemies.map(e=>({...e,downUntil:0})),results:[],winnerIds:[]});initEncounters600(g,course);initCoop601(g);initThreats604(g);g.revision++;return true;
}
export function validRunners587(g,p,m){return g.phase==='play'&&g.stage==='run'&&p?.alive&&(!p.waiting||typeof m.target?.pause==='boolean')&&p.finishTime==null&&(!p.respawnAt||typeof m.target?.pause==='boolean')&&m.action==='control'&&m.target&&[-1,0,1].includes(m.target.axis)&&typeof m.target.jump==='boolean'&&typeof m.target.attack==='boolean';}
export function inputRunners587(g,p,m){if(!validRunners587(g,p,m))return false;p.lastSeq=Math.max(p.lastSeq,m.seq??0);control587(p,m.target,g.lastAt);return true;}
function respawn(g,p){const course=course589(g);p.checkpoint=Math.max(p.checkpoint,g.teamCheckpoint??0);const cp=course.checkpoints[p.checkpoint];Object.assign(p,{motionEpoch600:(p.motionEpoch600??0)+1,x:cp.x,y:cp.y,vx:0,vy:0,axis:0,jumpHeld:false,jumpBufferUntil:0,airJumpUsed:false,airJumps598:0,reboundJump599:false,controlAt:g.lastAt,grounded:true,platformId:surfaces587(g.elapsed,course,g).find(s=>cp.x>=s.x&&cp.x<s.x+s.w&&Math.abs(cp.y-s.y)<2)?.id,alive:true,lives:Math.max(1,p.lives),attackHeld:false,bumpUntil:0,bumpSafeUntil:0,respawnAt:0,invincibleUntil:g.lastAt+1600,boostUntil:0,frozenUntil604:0,death604:null,springFlight:false,lastGroundAt:g.lastAt,wallSide:0,wallAt:-1e9,wallLockUntil:0,buddyUntil:0});emit(g,'respawn',{seat:p.seat,x:p.x,y:p.y});}
export function hurtRunners587(g,p,cause='fall',sourceX=null){
 const fatal=cause==='fall'||cause==='crush';
 if(!p.alive||p.respawnAt||p.finishTime!=null||p.waiting)return false;
 if(!fatal&&g.lastAt<p.invincibleUntil)return false;
 // An external hit breaks the ice first. It does not also count as a death.
 if(!fatal&&frozen604(p,g.elapsed)){thaw604(g,p,emit);return false;}
 if(!fatal&&p.weapon==='stone'&&g.lastAt>=(p.shieldAt??0)){p.shieldAt=g.lastAt+3500;p.invincibleUntil=g.lastAt+900;emit(g,'shield',{seat:p.seat,x:p.x,y:p.y});return false;}
 const dir=sourceX==null?-p.facing:Math.sign(p.x-sourceX)||-p.facing;
 p.deaths=(p.deaths??0)+1;p.fatalDeaths601=p.deaths;p.lives=1;p.alive=true;
 p.death604={x:p.x,y:p.y,vx:p.vx,vy:p.vy,dir,start:g.elapsed,cause};
 Object.assign(p,{motionEpoch600:(p.motionEpoch600??0)+1,respawnAt:g.lastAt+C.respawn,vx:0,vy:0,axis:0,jumpHeld:false,jumpBufferUntil:0,attackHeld:false,burst598:0,frozenUntil604:0,reboundJump599:false,grounded:false,platformId:null});
 if(cause==='fall')p.falls=(p.falls??0)+1;
 emit(g,'miss',{seat:p.seat,cause,x:p.x,y:p.y,deaths:p.deaths,fatalDeaths601:p.deaths,fatal:true});return true;
}

export function finishRunners587(g){const course=course589(g);g.teamClear=course.mode==='coop'&&readyGate589(g)&&g.players.filter(p=>!p.departed).every(p=>p.finishTime!=null);
 g.results=g.players.filter(p=>!p.departed).map(p=>({seat:p.seat,playerId:p.playerId,rank:rank588(g,p),finishTime:p.finishTime,distance:Math.min(100,Math.floor(p.furthest/course.goal*100)),lives:p.lives,deaths:p.deaths??0,falls:p.falls??0})).sort((a,b)=>a.rank-b.rank||a.seat-b.seat);
 g.winnerIds=g.results.filter(r=>r.rank===1).map(r=>r.playerId);g.stage='finish';g.finishAt=g.lastAt+1600;emit(g,'last',{winnerIds:g.winnerIds});
}
export function advanceRunners587(g,now,inputs=new Map(),absent=new Set()){
 if(['lobby','result'].includes(g.phase))return false;const course=course589(g);
 if(now-g.lastAt>1000){const delta=now-g.lastAt-C.step;for(const b of g.projectiles){b.born+=delta;b.until+=delta;}for(const e of g.enemies)if(e.downUntil>0)e.downUntil+=delta;}
 resume580(g,now,inputs,['startAt','phaseAt','deadline','finishAt'],['controlAt','lastGroundAt','jumpBufferUntil','respawnAt','invincibleUntil','boostUntil','outAt','wallAt','wallLockUntil','buddyUntil','bumpUntil','bumpSafeUntil','shotAt','burstAt598','shieldAt','hurtAt598']);
 let changed=false;while(g.lastAt+C.step<=now&&g.phase!=='result'){g.lastAt+=C.step;changed=true;
  if(g.phase==='countdown'){inputs.clear();if(g.lastAt<g.startAt)continue;g.phase='play';g.stage='run';g.phaseAt=g.lastAt;emit(g,'start');}
  if(g.stage==='finish'){inputs.clear();if(g.lastAt>=g.finishAt){g.phase='result';g.phaseAt=g.lastAt;emit(g,'finish');}continue;}
  for(const p of g.players)if(g.members.find(m=>m.playerId===p.playerId)?.departed){p.departed=true;p.alive=false;p.paused=false;p.waiting=false;}
  // Pause commands remain acceptable while suspended so a foreground return can resume.
  for(const p of g.players)for(const m of inputs.get(p.playerId)??[])if((!Number.isFinite(m.at)||m.at<=g.lastAt)&&(m.round==null||m.round===g.round)&&typeof m.target?.pause==='boolean'){p.paused=m.target.pause;p.lastSeq=Math.max(p.lastSeq,m.seq??0);}
  if(g.players.some(p=>!p.departed&&p.finishTime==null)&&g.players.every(p=>p.departed||p.finishTime!=null||p.paused||absent.has(p.playerId))){
   g.startAt+=C.step;g.deadline+=C.step;for(const b of g.projectiles){b.born+=C.step;b.until+=C.step;}for(const p of g.players)for(const k of ['shotAt','burstAt598','shieldAt','bumpUntil','hurtAt598'])if(p[k]>0)p[k]+=C.step;for(const k of Object.keys(g.ventsOff))g.ventsOff[k]+=C.step;
   for(const p of g.players){p.waiting=p.finishTime==null;p.axis=0;p.jumpHeld=false;p.attackHeld=false;if(p.respawnAt)p.respawnAt+=C.step;if(p.invincibleUntil)p.invincibleUntil+=C.step;}
   inputs.clear();continue;
  }
  g.elapsed=g.lastAt-g.startAt;stepIce598(g,emit,hurtRunners587);const previous=new Map();
  for(const p of g.players){const wasWaiting=p.waiting;p.auto=false;p.waiting=!p.departed&&(absent.has(p.playerId)||!!p.paused);const list=inputs.get(p.playerId)??[];inputs.delete(p.playerId);if(p.finishTime!=null)continue;
   if(p.waiting){if(!wasWaiting){const s=surfaces587(g.elapsed,course,g).find(s=>s.id===p.platformId);p.waitSurface=s?{x:s.x,y:s.y}:null;}p.axis=0;p.jumpHeld=false;p.attackHeld=false;p.jumpBufferUntil=0;if(p.respawnAt)p.respawnAt+=C.step;if(p.invincibleUntil)p.invincibleUntil+=C.step;continue;}
   if(wasWaiting&&p.alive){const s=surfaces587(g.elapsed,course,g).find(s=>s.id===p.platformId);if(s&&p.waitSurface){p.x+=s.x-p.waitSurface.x;p.y=s.y;}p.waitSurface=null;p.invincibleUntil=g.lastAt+1600;p.controlAt=g.lastAt;}
   if(p.respawnAt){for(const m of list)if(m.round==null||m.round===g.round)p.lastSeq=Math.max(p.lastSeq,m.seq??0);list.length=0;if(g.lastAt>=p.respawnAt)respawn(g,p);else continue;}
   if(!p.alive)continue;
   {const future=[];for(const m of list){if(Number.isFinite(m.at)&&m.at>g.lastAt){future.push(m);continue;}if(m.round==null||m.round===g.round)inputRunners587(g,p,m);}if(future.length)inputs.set(p.playerId,future);}
   const {before,jumped,wallJumped,windJumped,landed,spring,impact,crushed601}=stepRunner587(p,g.lastAt,g.elapsed,C.step/1000,g);previous.set(p.seat,before);if(windJumped)emit(g,'windjump',{seat:p.seat,x:p.x,y:p.y});if(wallJumped){p.wallJumps++;emit(g,'wallkick',{seat:p.seat,x:p.x,y:p.y});}if(jumped){p.jumps++;emit(g,'jump',{seat:p.seat,x:p.x,y:p.y});}
   if(landed&&!before.grounded&&impact>180)emit(g,'land',{seat:p.seat,x:p.x,y:p.y});
   if(crushed601){hurtRunners587(g,p,'crush');continue;}
   if(p.y>fallLimit600(course,p.x)){hurtRunners587(g,p);continue;}
   for(const enemy of g.enemies){if(enemy.defeated||enemy.ice||enemy.downUntil>g.lastAt)continue;const e=enemyAt587(enemy,g.elapsed),contact=enemyContact588(p,e,before);if(!contact)continue;
    if(contact==='stomp'&&!frozen604(p,g.elapsed)){enemy.defeated=true;enemy.downUntil=0;stomp599(p,e);p.stomps++;emit(g,'stomp',{seat:p.seat,x:e.x,y:e.y});}
    else hurtRunners587(g,p,'enemy',e.x);break;
   }
   if(!p.alive||p.respawnAt)continue;
   if(spring)emit(g,'spring',{seat:p.seat,x:spring.x+spring.w/2,y:spring.y+spring.h});
   for(const gem of course.gems)if(!p.gems.includes(gem.id)&&Math.hypot(p.x-gem.x,p.y-C.height/2-gem.y)<25){p.gems.push(gem.id);p.boostUntil=g.lastAt+4000;emit(g,'boost',{seat:p.seat,x:gem.x,y:gem.y});}
   for(let i=(g.teamCheckpoint??0)+1;i<course.checkpoints.length;i++){const cp=course.checkpoints[i];if(p.x>=cp.x&&p.y<=cp.y+15)checkpoint601(g,i,p.seat,emit);}
   p.furthest=Math.max(p.furthest,p.x);
  }
  iceContact598(g,previous,emit,hurtRunners587);
  mechanics589(g,previous,emit,hurtRunners587);
  encounters600(g,course,previous,emit,hurtRunners587,stomp599);
  hazards603(g,course,hurtRunners587);
  stepThreats604(g,course,emit);
  combat591(g,emit);
  resolveThreats604(g,course,emit,hurtRunners587,previous);
  cooperation601(g,course,emit);
  for(const p of g.players)if(p.alive&&!p.waiting&&!p.respawnAt&&p.finishTime==null&&p.x>=course.goal&&p.y<=320){
   if(!readyGate589(g)){p.x=course.goal-35;p.vx=0;continue;}
   p.finishTime=g.elapsed;p.x=course.goal+10;p.vx=0;p.vy=0;p.axis=0;if(course.mode!=='coop')g.deadline=Math.min(g.deadline,g.lastAt+C.grace);emit(g,'goal',{seat:p.seat,time:p.finishTime});
  }
  if(g.lastAt>=g.deadline||g.players.every(p=>p.finishTime!=null||!p.alive))finishRunners587(g);
 }
 g.serverAt=g.lastAt;g.updatedAt=now;if(changed)g.revision++;return changed;
}
export function publicRunners587(g,selfId){return{...publicBase580(g),rules587:g.rules587,threats604:structuredClone(g.threats604??null),stars601:[...(g.stars601??[])],starBy601:{...g.starBy601},coop601:structuredClone(g.coop601??{}),boss600:g.boss600?{...g.boss600}:null,enemyShots600:(g.enemyShots600??[]).map(s=>({...s})),rollerBroken600:{...g.rollerBroken600},waves600:structuredClone(g.waves600??{}),courseId:g.courseId??'forest',switches:[...(g.switches??[])],switchBy:{...(g.switchBy??{})},broken:[...(g.broken??[])],barrierHits:{...(g.barrierHits??{})},ventsOff:{...(g.ventsOff??{})},crumbles:{...(g.crumbles??{})},rescues:g.rescues,teamClear:g.teamClear,teamCheckpoint:g.teamCheckpoint,projectiles:g.projectiles.map(b=>({...b})),stage:g.stage,elapsed:g.elapsed,finishAt:g.finishAt,enemies:g.enemies.map(e=>({...e})),players:g.players.map(({inputSeq563,botWait,...p})=>({...p,gems:[...p.gems],powers:[...p.powers],processedSeq:p.lastSeq,lastSeq:p.playerId===selfId?Math.max(p.lastSeq,inputSeq563??0):0}))};}
