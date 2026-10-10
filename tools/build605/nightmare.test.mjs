import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {COURSES589,course589,readyGate589} from '../../src/runners587/Courses589.js';
import {makeRunners587,startRunners587,advanceRunners587,hurtRunners587,publicRunners587} from '../../src/runners587/Rules587.js';
import {stepRunner587,control587,stomp599} from '../../src/runners587/Physics587.js';
import {surfaces587} from '../../src/runners587/Level587.js';
import {fallLimit600} from '../../src/runners587/Terrain600.js';
import {phase603,saw603,pendulum603,lightning603,cannon603,meteor603,hazards603} from '../../src/runners587/Hazards603.js';
import {encounters600,hitBoss600} from '../../src/runners587/Encounters600.js';
import {cooperation601} from '../../src/runners587/Coop601.js';
const newCourses=COURSES589.slice(8),emit=(g,type,data)=>g.events.push({id:g.events.length+1,type,at:g.lastAt,...data});
function game(id,n=1){const g=makeRunners587({id:'qa603',code:'T',hostId:'p0',members:Array.from({length:n},(_,i)=>({playerId:'p'+i,name:'P'+i})),now:0});g.courseId=id;startRunners587(g,0);for(let t=25;t<=3000;t+=25)advanceRunners587(g,t);g.enemies=[];return g;}
function place(g,x,y){const p=g.players[0],s=surfaces587(g.elapsed,course589(g),g).find(s=>x>=s.x&&x<=s.x+s.w&&Math.abs(y-s.y)<1);Object.assign(p,{x,y,vx:0,vy:0,weapon:null,boostUntil:0,axis:0,grounded:!!s,platformId:s?.id??null,jumpHeld:false,jumpBufferUntil:0,wallSide:0,wallAt:-1e9,wallLockUntil:0,airJumps598:0,reboundJump599:false,lastGroundAt:s?g.lastAt:-1e9,controlAt:g.lastAt,respawnAt:0,invincibleUntil:0});return p;}
function physics(g,axis,jump){g.lastAt+=25;g.elapsed+=25;const p=g.players[0];control587(p,{axis,jump,attack:false},g.lastAt);return stepRunner587(p,g.lastAt,g.elapsed,.025,g);}
for(const c of newCourses){
 test(c.id+' doubles the castle length and offers a distinct 12-area, human-only expedition',()=>{
  const old=course589('ember');assert.equal(c.length,old.length*2);assert.equal(c.goal,old.goal*2);assert.equal(c.sections.length,12);assert.equal(c.stars601.length,3);assert.equal(c.trials601.length,1);assert.equal(c.pickups.length,12);assert.equal(new Set(c.pickups.map(p=>p.kind)).size,6);assert.equal(c.mode,'coop');
  const danger=x=>['hazards','crushers','firebars600','tides600','rollers600','saws603','pendulums603','lightning603','cannons603','meteors603'].reduce((n,k)=>n+(x[k]?.length??0),0);assert(danger(c)>=danger(old)*3);assert(new Set(c.modules603.map(m=>m.kind)).size>=9);
  assert(newCourses.every(other=>other===c||JSON.stringify(other.modules603)!==JSON.stringify(c.modules603)));
  const surfaces=surfaces587(0,c,{});for(const cp of c.checkpoints){const s=surfaces.find(s=>cp.x>=s.x&&cp.x<=s.x+s.w&&s.y===cp.y);assert(s&&!s.crumble&&!s.move&&!s.phase603,'unstable flag '+JSON.stringify(cp));}
 });
 test(c.id+' all wall-kick shafts have a solo exit without a form or a companion',()=>{
  for(const shaft of c.climbs602){const g=game(c.id),p=place(g,shaft.left+35,shaft.bottom);let axis=1,kicks=0,done=false;
   for(let i=0;i<720;i++){let jump=p.jumpHeld;if(p.grounded){jump=true;axis=1;}else if(p.wallSide&&g.lastAt+25>=p.wallLockUntil){jump=!p.jumpHeld;if(jump)axis=-p.wallSide;}else if(p.y<shaft.top-8)axis=1;
    const result=physics(g,axis,jump);if(result.wallJumped)kicks++;assert(!result.crushed601);assert(p.y<fallLimit600(c,p.x));if(p.x>shaft.right+42&&p.y<=shaft.top+10){done=true;break;}
   }assert(done,shaft.id+' '+JSON.stringify({x:p.x,y:p.y,kicks}));assert(kicks>=3);
  }
 });
 test(c.id+' timed/orbit/ridge platforms can be linked with real solo jumps',()=>{
  for(const m of c.modules603.filter(m=>['phase','orbits','mountain'].includes(m.kind))){
   const id=c.modules603.indexOf(m),prefix=m.kind==='mountain'?c.id+'-ridge-'+id+'-':c.id+'-path-'+m.left+'-';
   const pads=c.platforms.filter(p=>p.id.startsWith(prefix)).sort((a,b)=>a.x-b.x),g=game(c.id);
   const start=surfaces587(0,c,g).find(s=>s.ground&&s.x===m.left),end=surfaces587(0,c,g).find(s=>s.ground&&s.x===m.left+(m.kind==='mountain'?1070:1010));
   let from=start;assert(start&&end);
   for(const target of [...pads,end]){let reached=false,last;
    for(const wait of [0,500,1100,1800,2600,3500,4300]){g.elapsed=10000+wait;g.lastAt=13000+wait;
     const s=surfaces587(g.elapsed,c,g).find(s=>s.id===from.id),to=surfaces587(g.elapsed,c,g).find(s=>s.id===target.id);if(!s||!to)continue;
     const p=place(g,s.x+s.w-17,s.y);
     for(let i=0;i<125;i++){const live=surfaces587(g.elapsed+25,c,g).find(s=>s.id===target.id)??target,aim=live.x+Math.min(32,live.w/2),axis=p.x<aim-5?1:p.x>aim+5?-1:0;physics(g,axis,true);last={x:p.x,y:p.y};if(p.grounded&&p.platformId===target.id){reached=true;break;}if(p.y>fallLimit600(c,p.x))break;}
     if(reached)break;
    }
    assert(reached,m.kind+' '+from.id+' -> '+target.id+' '+JSON.stringify(last));from=target;
   }
  }
 });
 test(c.id+' bridge springs cross the closed gap without an elemental power',()=>{
  for(const b of c.bridges){const g=game(c.id),s=c.springs.find(s=>s.id===b.id+'-spring'),p=place(g,s.x,s.y-36);Object.assign(p,{vy:130,grounded:false,platformId:null,lastGroundAt:-1e9});let launched=false,reached=false;
   for(let i=0;i<120;i++){const out=physics(g,1,false);launched||=!!out.spring;if(p.x>b.x+b.w+12&&p.grounded&&p.y===300){reached=true;break;}if(p.y>460)break;}
   assert(launched&&reached,b.id+' '+JSON.stringify({x:p.x,y:p.y,launched}));
  }
 });

}
test('orbit platforms carry an idle player through a full cycle without vertical jitter',()=>{const g=game('eclipse'),c=course589(g),p0=c.platforms.find(p=>p.orbit603);g.elapsed=0;const initial=surfaces587(0,c,g).find(p=>p.id===p0.id),p=place(g,initial.x+initial.w/2,initial.y);for(let i=0;i<200;i++){physics(g,0,false);const s=surfaces587(g.elapsed,c,g).find(p=>p.id===p0.id);assert.equal(p.platformId,s.id);assert.equal(p.y,s.y);assert(Math.abs(p.x-(s.x+s.w/2))<.01);}});
for(const c of newCourses)test(c.id+' optional summit and long underground room have reachable solo links',()=>{
 const g=game(c.id),summit=c.platforms.filter(p=>p.id.includes('-star-rise-'));
 const ground=surfaces587(0,c,g).find(p=>p.ground&&p.x<=summit[0].x+32&&p.x+p.w>=summit[0].x+32);
 const underground=c.platforms.filter(p=>p.secret602).sort((a,b)=>a.x-b.x);
 for(const route of [[ground,...summit],underground])for(let k=1;k<route.length;k++){
  const from=route[k-1],target=route[k];g.elapsed=10000;g.lastAt=13000;
  const p=place(g,Math.min(from.x+from.w-17,target.x+target.w/2),from.y);let reached=false;
  for(let i=0;i<160;i++){const aim=target.x+Math.min(32,target.w/2),axis=p.x<aim-5?1:p.x>aim+5?-1:0;physics(g,axis,true);if(p.grounded&&p.platformId===target.id){reached=true;break;}if(p.y>fallLimit600(c,p.x))break;}
  assert(reached,from.id+' -> '+target.id+' '+JSON.stringify({x:p.x,y:p.y}));
 }
 const last=underground.at(-1),shaft=c.climbs602.find(s=>!s.mandatory);assert(last.x+last.w>shaft.left&&last.y===shaft.bottom);
 const star=c.stars601.find(s=>s.kind==='summit');assert(star.x>summit.at(-1).x&&star.x<summit.at(-1).x+summit.at(-1).w);
});
test('phase platforms warn before disappearing, release a rider and return at the same time for server and drawing',()=>{const g=game('eclipse'),c=course589(g),p0=c.platforms.find(p=>p.phase603),h=p0.phase603;g.elapsed=h.on-h.offset-25;g.lastAt=3000+g.elapsed;const s=surfaces587(g.elapsed,c,g).find(p=>p.id===p0.id),p=place(g,s.x+s.w/2,s.y);assert(phase603(p0,g.elapsed).warning);physics(g,0,false);assert(!phase603(p0,g.elapsed).solid);assert(!surfaces587(g.elapsed,c,g).some(p=>p.id===p0.id));assert(!p.grounded);assert(phase603(p0,h.period-h.offset).solid);});
test('updraft lifts a player with shared physics while leaving normal courses unchanged',()=>{const g=game('abyssice'),c=course589(g),jet=c.jets603[0],p=place(g,jet.x+jet.w/2,jet.y-30);g.elapsed=0;g.lastAt=3000;for(let i=0;i<55;i++)physics(g,0,false);assert(p.y<jet.y-170);assert(p.vy<0);assert.equal(p.weapon,null);});
test('elite bosses retain solo openings, produce wider volleys and block the gate until defeated',()=>{
 for(const c of newCourses){const g=game(c.id),b=g.boss600,p=g.players[0];Object.assign(p,{x:b.left+55,y:300});g.elapsed=1000;encounters600(g,c,new Map(),emit,hurtRunners587,stomp599);assert.equal(b.phase,'warn');b.turn=1;g.elapsed+=b.elite603.warn+25;encounters600(g,c,new Map(),emit,hurtRunners587,stomp599);assert.equal(b.phase,'cast');assert(g.enemyShots600.length>=3);b.phase='rest';b.hitUntil=0;assert(hitBoss600(g,0,1,emit,{kind:'shot',x:b.x+b.dir*50}));assert.equal(b.hp,b.maxHp-1);}
});
