import test from 'node:test';import assert from 'node:assert/strict';
import {makeRunners587,startRunners587,advanceRunners587,publicRunners587} from '../../src/runners587/Rules587.js';
import {course589,readyGate589} from '../../src/runners587/Courses589.js';
import {SHIP_ROUTES611 as routes,vessel611,voyageStep609,voyageShips610} from '../../src/runners587/Voyage609.js';
import {voyageStatus609} from '../../src/runners587/VoyageArt609.js';
import {cooperation601} from '../../src/runners587/Coop601.js';
import {stepRunner587,control587} from '../../src/runners587/Physics587.js';
import {surfaces587} from '../../src/runners587/Level587.js';
const emit=(g,type,d={})=>g.events.push({type,...d});const c=course589('voyage');
function game(n=1){const g=makeRunners587({id:'613',members:Array.from({length:n},(_,i)=>({playerId:'p'+i,name:'P'+i})),now:0});g.courseId='voyage';startRunners587(g,0);for(let t=25;t<=3000;t+=25)advanceRunners587(g,t);return g;}
function place(p,x,y=300){Object.assign(p,{x,y,vx:0,vy:0,grounded:true,alive:true,waiting:false,respawnAt:0,finishTime:null});}
test('three wide seas have no static or moving bypass platforms',()=>{assert.equal(routes.length,3);for(const r of routes){assert(r.end-r.start>=1500);assert(c.platforms.every(p=>p.x+p.w<=r.start||p.x>=r.end+r.w));assert(c.grounds.every(([a,b])=>b<=r.start||a>=r.end+r.w));}});
test('ships never reverse or repeat, even after many old round-trip periods',()=>{for(const r of routes){let prev=r.start;for(let t=0;t<=600000;t+=125){const b=vessel611(r,t);assert(b.x>=prev);assert(b.speed>=0);prev=b.x;}assert.equal(prev,r.end);assert.equal(vessel611(r,600000).phase,'arrived');}});
test('next ships wait at the island exit and depart on the fixed timetable',()=>{assert.equal(routes[0].depart,7000);assert.equal(routes[1].depart-routes[0].arrival,16000);assert(Math.abs(routes[2].depart-routes[1].arrival-20000)<.001);for(const r of routes){assert.equal(vessel611(r,r.depart-1).x,r.start);assert(vessel611(r,r.depart+100).x>r.start);}});
test('ships and shore bodies never overlap throughout their routes',()=>{for(const r of routes)for(let t=0;t<=r.arrival+1000;t+=125){const b=vessel611(r,t);assert(c.grounds.every(([x,end])=>b.x+b.w<=x+.001||b.x>=end-.001));}});
test('riders are carried to the arrival dock without teleporting or sinking',()=>{for(const r of routes){const g=game(),p=g.players[0];place(p,r.start+100);p.platformId=r.id;let old=p.x;for(let t=r.depart;t<r.arrival;t+=25){control587(p,{axis:0,jump:false,attack:false},t+3000);stepRunner587(p,t+3000,t,.025,g);assert(Math.abs(p.x-old)<4);assert.equal(p.y,300);old=p.x;}assert(p.x>r.end+90);}});
test('a runner still able to run across the island is not stranded at departure',()=>{const g=game(),p=g.players[0];place(p,2110);g.elapsed=routes[1].depart+25;voyageStep609(g,c,emit);assert(p.alive);});
test('stranding eliminates only the late runner and leaves peer and world coordinates intact',()=>{const g=game(2),a=g.players[0],b=g.players[1];g.elapsed=routes[0].depart+10000;place(a,90);place(b,vessel611(routes[0],g.elapsed).x+100);const x=b.x;voyageStep609(g,c,emit);assert(!a.alive);assert(a.voyageOut613);assert(b.alive);assert.equal(b.x,x);assert.equal(g.elapsed,routes[0].depart+10000);assert(voyageStatus609(g,g.elapsed,a).includes('脱落'));});
test('all stranded runners reach results rather than waiting for the full timer',()=>{const g=game();for(let t=3025;t<=21000;t+=25)advanceRunners587(g,t);assert.equal(g.phase,'result');assert(!g.teamClear);});
test('goal works without stars, boarding flags or a ship beside the gate',()=>{const g=game(),p=g.players[0];place(p,c.goal+1);p.platformId='ground3';assert(readyGate589(g));advanceRunners587(g,g.lastAt+25);assert.notEqual(p.finishTime,null);assert.equal(g.stars601.length,0);});
test('seal sequence is personal, ordered, timed and reset on death',()=>{
 const g=game(2),p=g.players[0],h=c.islands609[0];g.elapsed=27000;
 place(p,h.pads[2].x,h.pads[2].y);voyageStep609(g,c,emit);assert.equal(g.ship609.seals613[0].next,0);
 for(let i=0;i<3;i++){place(g.players[i%2],h.pads[i].x,h.pads[i].y);voyageStep609(g,c,emit);}assert(!g.ship609.completed.includes(0));
 g.elapsed+=9000;voyageStep609(g,c,emit);place(p,h.pads[0].x,h.pads[0].y);voyageStep609(g,c,emit);p.motionEpoch600++;voyageStep609(g,c,emit);assert.equal(g.ship609.seals613[0].next,1);
 for(const q of h.pads){place(p,q.x,q.y);g.elapsed+=1000;voyageStep609(g,c,emit);}assert(g.ship609.completed.includes(0));
});
test('fort defenders spawn only after arming; timeout resets enemies and cannot award a star',()=>{
 const g=game(),p=g.players[0],h=c.islands609[1];assert.equal(g.enemies.length,0);g.elapsed=60000;place(p,h.x,h.y);voyageStep609(g,c,emit);assert.equal(g.enemies.length,2);
 g.elapsed+=12025;g.enemies.forEach(e=>e.defeated=true);voyageStep609(g,c,emit);assert(!g.ship609.completed.includes(1));assert.equal(g.enemies.length,0);
 place(p,h.x+80,h.y);voyageStep609(g,c,emit);place(p,h.x,h.y);voyageStep609(g,c,emit);g.enemies.forEach(e=>e.defeated=true);g.elapsed+=2000;voyageStep609(g,c,emit);assert(g.ship609.completed.includes(1));
});
test('four aerial rings require the same runner in order; death resets partial progress',()=>{
 const g=game(),p=g.players[0];g.elapsed=80000;
 place(p,c.rings613[3].x,c.rings613[3].y+14);voyageStep609(g,c,emit);assert.equal(g.ship609.rings613[0].next,0);
 for(const q of c.rings613.slice(0,2)){place(p,q.x,q.y+14);voyageStep609(g,c,emit);}p.motionEpoch600++;voyageStep609(g,c,emit);assert.equal(g.ship609.rings613[0].next,0);
 for(const q of c.rings613){place(p,q.x,q.y+14);voyageStep609(g,c,emit);}assert(g.ship609.completed.includes(2));
 place(p,7640,284);cooperation601(g,c,emit);assert(g.stars601.includes('voyage-star-2'));
});
test('ship barrages warn for 900ms and alternate high, low and vertical fire',()=>{
 const g=game(),p=g.players[0],seen=new Set();place(p,7900);let lastCount=0;
 for(let t=0;t<100000;t+=25){g.elapsed=t;const due=g.ship609.warnings613?.filter(w=>w.at<=t)??[];const before=g.enemyShots600.length;voyageStep609(g,c,emit);if(g.enemyShots600.length>before)assert(due.length);for(const w of g.ship609.warnings613??[]){assert(w.at-t<=900);seen.add(w.kind==='rain'?'rain':w.high?'high':'low');}}
 assert.deepEqual([...seen].sort(),['high','low','rain']);
});
test('snapshot and restart retain the timetable and isolated objective data',()=>{const g=game();g.elapsed=30000;voyageStep609(g,c,emit);const snap=publicRunners587(g,'p0');snap.ship609.completed.push(99);assert(!g.ship609.completed.includes(99));assert.deepEqual(voyageShips610(g.elapsed,g),voyageShips610(g.elapsed,JSON.parse(JSON.stringify(g))));g.phase='lobby';startRunners587(g,100000);assert.deepEqual(g.ship609,{completed:[]});});

for(const [i,r]of routes.entries())test('sea '+i+' cannot be jumped after missing the ship, even with wind triple jump',()=>{const g=game(),p=g.players[0];place(p,r.start-12);p.platformId='ground'+i;p.weapon='wind';let presses=0;for(let k=1;k<200;k++){const t=r.arrival+10000+k*25;const jump=p.grounded||p.vy>30&&presses<3?!p.jumpHeld:p.jumpHeld;if(jump&&!p.jumpHeld)presses++;control587(p,{axis:1,jump,attack:false},t+3000);stepRunner587(p,t+3000,t,.025,g);if(p.y>720)break;}assert(p.y>720);assert(p.x<r.end);});
test('pausing everyone freezes the same timetable and resumes without rewinding the ships',()=>{const g=game();for(let i=0;i<100;i++)advanceRunners587(g,g.lastAt+25);const before=g.elapsed,ships=voyageShips610(before,g);g.players[0].paused=true;for(let i=0;i<100;i++)advanceRunners587(g,g.lastAt+25);assert.equal(g.elapsed,before);assert.deepEqual(voyageShips610(g.elapsed,g),ships);g.players[0].paused=false;advanceRunners587(g,g.lastAt+25);assert.equal(g.elapsed,before+25);});
for(const n of [2,3,4])test(n+' runners can finish independently without the ships or star objectives',()=>{const g=game(n);for(const p of g.players){place(p,c.goal+1);p.platformId='ground3';advanceRunners587(g,g.lastAt+25);assert.notEqual(p.finishTime,null);}assert(g.teamClear);});
