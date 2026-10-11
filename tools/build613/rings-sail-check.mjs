import fs from 'node:fs';import assert from 'node:assert/strict';
import {makeRunners587,startRunners587,advanceRunners587} from '../../src/runners587/Rules587.js';
import {course589} from '../../src/runners587/Courses589.js';
import {SHIP_ROUTES611 as routes,vessel611} from '../../src/runners587/Voyage609.js';
import {control587} from '../../src/runners587/Physics587.js';
const g=makeRunners587({id:'sail',members:[{playerId:'p',name:'P'}],now:0});g.courseId='voyage';startRunners587(g,0);const p=g.players[0],c=course589(g),trace=[];
for(let t=25;t<160000&&g.phase!=='result';t+=25){
 const r=routes.find(r=>p.x<r.end+r.w+15),b=r&&vessel611(r,g.elapsed),on=b&&p.platformId===b.id;
 let target=c.goal+20,jump=false;
 if(r){
  target=b.x+b.w*.5;
  if(g.elapsed>r.arrival-500)target=r.end+r.w+50;
  if(!on&&p.x<r.start)target=r.start+120;
  if(on){
   for(const s of g.enemyShots600??[]){const rel=s.vx-b.speed,dt=rel?(p.x-s.x)/rel:99;
    if(Math.abs(s.y-286)<15&&dt>0&&dt<.38)jump=true;
    if(s.vy>0&&Math.abs(p.x-s.x)<38&&s.y>90)target=p.x<s.x?p.x-85:p.x+85;
   }
   if(p.y<300&&!p.grounded)jump=true;
  }
 }
 if(r===routes[2]){const n=g.ship609.rings613?.[0]?.next??0,q=c.rings613[n];if(q&&q.x-b.x<330){target=q.x;if(p.grounded&&Math.abs(p.x-q.x)<95)jump=true;}}
 if(!p.grounded&&p.vy<0)jump=true;
 if(p.x>4935&&p.x<5105)jump=true;
 const axis=p.x<target-6?1:p.x>target+8?-1:0;
 const deaths=p.deaths;control587(p,{axis,jump,attack:false},t);advanceRunners587(g,t);if(p.deaths>deaths)console.log(g.events.filter(e=>e.type==='miss').at(-1));
 if(t%1000===0)trace.push({t,x:p.x,y:p.y,platform:p.platformId,deaths:p.deaths,alive:p.alive});
}
fs.mkdirSync('docs/build613',{recursive:true});fs.writeFileSync('docs/build613/rings-sailing-witness.json',JSON.stringify({finish:p.finishTime,deaths:p.deaths,trace},null,2));console.log({finish:p.finishTime,deaths:p.deaths,alive:p.alive,x:p.x,phase:g.phase});assert.notEqual(p.finishTime,null);assert.equal(p.deaths,0);assert(g.stars601.includes('voyage-star-2'));console.log('Four rings and star collected under live fire');
