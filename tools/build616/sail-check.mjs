import fs from 'node:fs';import assert from 'node:assert/strict';
import {makeRunners587,startRunners587,advanceRunners587} from '../../src/runners587/Rules587.js';
import {course589} from '../../src/runners587/Courses589.js';
import {SHIP_ROUTES611 as routes,vessel611} from '../../src/runners587/Voyage609.js';
import {control587} from '../../src/runners587/Physics587.js';
const g=makeRunners587({id:'sail616',members:[{playerId:'p',name:'P'}],now:0});g.courseId='voyage';startRunners587(g,0);const collect=process.argv.includes('--rings');const p=g.players[0],c=course589(g),trace=[],visited=new Set(),scenes=new Map();let phases=[0,0,0],last=0,chosen=null;
function policy(g,force=null){
 const p=g.players[0],r=routes.find(r=>p.x<r.end+r.w+20),i=routes.indexOf(r),b=r&&vessel611(r,g.elapsed,g);let target=c.goal+20,jump=false;
 if(r){
  target=b.x+110;
  if(p.x<r.start)target=r.start+110;
  if(b.phase==='arrived')target=r.end+r.w+80;
  if(i===0&&b.phase==='cruise'){
   if(phases[i]===0&&b.x>980){target=1215;jump=p.grounded&&p.x>1070;}
   if(phases[i]===1){target=1380;jump=p.grounded;}
   if(phases[i]===2){target=1570;jump=p.grounded;}
   if(phases[i]===3){target=b.x>1420?Math.max(1660,b.x+175):1570;}
  }
  if(i===1&&b.phase==='cruise'){
   if(phases[i]===0&&b.x>3620){target=3870;jump=p.grounded&&p.x>3715;}
   if(phases[i]===1){target=4050;jump=p.grounded;}
   if(phases[i]===2){target=b.x>4040?b.x+195:4050;jump=b.x>4040&&p.grounded;}
  }
  if(i===2&&b.phase==='cruise'){
   if(phases[i]===0&&b.x>6240){target=6420;jump=p.grounded;}
   if(phases[i]===1){target=6600;jump=p.grounded;}
   if(phases[i]===2){target=6800;jump=p.grounded;}
   if(phases[i]===3){target=b.x>6730?b.x+200:6800;}
   if(p.platformId==='voyage-dive-step'&&b.x>6870){target=b.x+150;jump=p.grounded;}
  }
 }
 if(p.x>4935&&p.x<5105)jump=true;
 if(!p.grounded&&p.vy<0)jump=true;
 if(collect){const next=g.ship609?.rings613?.[0]?.next??0;if(next===0&&p.x>5918&&p.x<6000&&p.grounded)jump=true;if(next===2&&!p.grounded&&p.x>6590&&p.x<6750&&p.y<-80)jump=false;}
 let axis=p.x<target-5?1:p.x>target+8?-1:0;
 if(force){if(force.axis!=null)axis=force.axis;if(force.jump!=null)jump=force.jump;}
 return {axis,jump,attack:Math.floor(g.elapsed/200)%2===0};
}
for(let t=25;t<210000&&g.phase!=='result';t+=25){
 const id=p.platformId;
 if(p.grounded){visited.add(id);if(id==='voyage-axe-refuge')phases[0]=Math.max(phases[0],1);if(id==='voyage-flame-overpass')phases[0]=Math.max(phases[0],2);if(id==='voyage-flame-exit')phases[0]=Math.max(phases[0],3);if(id==='ark609'&&p.x>1550&&phases[0]===3)phases[0]=4;
 if(id==='voyage-rock-refuge')phases[1]=Math.max(phases[1],1);if(id==='voyage-raider-perch')phases[1]=Math.max(phases[1],2);if(id==='ark-works611'&&p.x>4160&&phases[1]===2)phases[1]=3;
 if(id==='voyage-sky-step')phases[2]=Math.max(phases[2],1);if(id==='voyage-sky-overpass')phases[2]=Math.max(phases[2],2);if(id==='voyage-sky-exit')phases[2]=Math.max(phases[2],3);if(id==='ark-coast611'&&p.x>6900&&phases[2]===3)phases[2]=4;}
 let cmd=policy(g,chosen);
 // Look ahead only with genuine game rules: choose a jump/side step when a hazard will hit.
 if(g.phase==='play'&&!p.respawnAt&&t%100===0){
  const candidates=[null,{jump:true},{axis:-1,jump:true},{axis:1,jump:true},{axis:-1},{axis:1},{axis:0}];let best=null,bestScore=-Infinity;
  for(const cand of candidates){const q=structuredClone(g);q.events=[];const a=q.players[0];for(let k=0;k<48;k++){control587(a,policy(q,k<24?cand:null),q.lastAt+25);advanceRunners587(q,q.lastAt+25);if(a.deaths>p.deaths||!a.alive)break;}
   const desired=policy(g),dx=a.x-p.x,score=-(a.deaths-p.deaths)*100000-(a.alive?0:100000)-Math.max(0,a.y-400)*100+(cand? -10-candidates.indexOf(cand):0);
   if(score>bestScore){bestScore=score;best=cand;}
  }
  // Do not steer off the boat unless needed to avert an actual collision.
  chosen=best;cmd=policy(g,best);
 }
 const deaths=p.deaths;control587(p,cmd,t);advanceRunners587(g,t);
 if(p.deaths>deaths){console.log('DEATH',g.elapsed,g.events.filter(e=>e.type==='miss').at(-1),phases);break;}
 const scene=[g.elapsed>0&&g.elapsed<1000,p.x>920&&p.x<1000,p.platformId==='voyage-flame-overpass',g.enemies.some(e=>e.deck616&&g.elapsed>e.deck616.born+300&&g.elapsed<e.deck616.landAt),g.ship609?.rocks616?.some(q=>g.elapsed-q.at>500&&g.elapsed-q.at<750),p.platformId==='voyage-sky-exit'];
 for(let i=0;i<scene.length;i++)if(scene[i]&&!scenes.has(i))scenes.set(i,structuredClone(g));
 if(t%500===0)trace.push({t,x:p.x,y:p.y,platform:p.platformId,phases:[...phases],deaths:p.deaths,alive:p.alive});
}
fs.mkdirSync('docs/build616',{recursive:true});if(!collect)fs.writeFileSync('docs/build616/scene-states.json',JSON.stringify([...scenes].sort((a,b)=>a[0]-b[0]).map(([i,g])=>({i,g})),null,2));fs.writeFileSync('docs/build616/'+(collect?'rings':'sailing')+'-witness.json',JSON.stringify({finish:p.finishTime,deaths:p.deaths,visited:[...visited],trace},null,2));console.log({rings:g.ship609.rings613,stars:g.stars601,finish:p.finishTime,deaths:p.deaths,alive:p.alive,x:p.x,y:p.y,phase:g.phase,phases,visited:[...visited]});assert.notEqual(p.finishTime,null);assert.equal(p.deaths,0);

if(collect)assert(g.stars601.includes('voyage-star-2'));
