import test from 'node:test';import assert from 'node:assert/strict';
import {makeRunners587,startRunners587,publicRunners587} from '../../src/runners587/Rules587.js';
import {SHIP_ROUTES611 as routes,vessel611} from '../../src/runners587/Voyage609.js';
import {predict591,remember591} from '../../src/runners587/Motion591.js';
import {voyageTime616} from '../../src/runners587/VoyagePath616.js';
import {stepRunner587,control587} from '../../src/runners587/Physics587.js';
const base=3000;
for(const n of [2,4])test(n+' riders stay attached to the rising/descending ship through delayed and bursty snapshots',()=>{
 const g=makeRunners587({id:'network616',members:Array.from({length:n},(_,i)=>({playerId:'p'+i})),now:0});g.courseId='voyage';startRunners587(g,0);g.phase='play';g.stage='run';g.ship609.departures616={[routes[2].id]:{at:0,seat:0}};
 g.elapsed=11000;g.serverAt=g.lastAt=base+g.elapsed;const boat=vessel611(routes[2],g.elapsed,g);
 for(const p of g.players)Object.assign(p,{x:boat.x+45+p.seat*42,y:boat.y,platformId:boat.id,grounded:true,lastGroundAt:g.serverAt,controlAt:g.serverAt});
 const initial=publicRunners587(g,'p0'),packets=[];let delivered=0;
 for(let t=11025;t<=18000;t+=25){g.elapsed=t;g.lastAt=g.serverAt=base+t;for(const p of g.players){control587(p,{axis:0,jump:false,attack:false},g.lastAt);stepRunner587(p,g.lastAt,t,.025,g);}
  if(t%50===0){let delay=[90,125,190,100,230,90][packets.length%6];if(t>13400&&t<14000)delay+=600;delivered=Math.max(delivered+.01,base+t+delay);packets.push({at:delivered,g:publicRunners587(g,'p0')});}
 }
 const c={transport:{selfId:'p0'},state:{runners:initial},runnersUI587:{inputs591:[]}},last=new Map();remember591(c);let maxStep=0;
 for(let at=base+11100;at<base+17900;at+=1000/60){while(packets[0]?.at<=at){c.state.runners=packets.shift().g;remember591(c);}const snap=c.state.runners,b=vessel611(routes[2],voyageTime616(snap,at),snap);
  for(const p of snap.players){const q=predict591(c,p,at);assert(Math.abs(q.y-b.y)<.01,'remote rider must not float behind the vertical ship');assert(Math.abs(q.x-b.x-(45+p.seat*42))<.05);if(last.has(p.seat)){const old=last.get(p.seat);maxStep=Math.max(maxStep,Math.hypot(q.x-old.x,q.y-old.y));}last.set(p.seat,q);}
 }
 // No pause/catch-up jump for these known paths, including the local rider.
 assert(maxStep<4);console.log(n+' riders, largest recovery step: '+maxStep.toFixed(2)+' world pixels');
});
