import test from 'node:test';
import assert from 'node:assert/strict';
import {makeRunners587,startRunners587,advanceRunners587,publicRunners587,inputRunners587} from '../../src/runners587/Rules587.js';
import {stepRunner587,control587,RUN587} from '../../src/runners587/Physics587.js';
import {combat591} from '../../src/runners587/Combat591.js';
import {course589} from '../../src/runners587/Courses589.js';
import {surfaces587} from '../../src/runners587/Level587.js';
import {remember591,predict591} from '../../src/runners587/Motion591.js';
import {syncClock595,clock595} from '../../src/runners587/Timeline595.js';
const fixture=()=>{const g=makeRunners587({id:'ru599',code:'TEST',hostId:'p0',members:[{playerId:'p0',name:'You',choice:{speciesId:'slime'}}],now:1000});startRunners587(g,1000,599);for(let at=1025;at<=4025;at+=25)advanceRunners587(g,at);g.enemies=[];return g;};
const controls=(g,target)=>inputRunners587(g,g.players[0],{round:g.round,seq:(g.players[0].lastSeq??0)+1,action:'control',target:{axis:0,jump:false,attack:false,...target}});
const tick=(g,ms,target)=>{for(let i=0;i<ms;i+=25){if(target)controls(g,target);advanceRunners587(g,g.lastAt+25);}};
const enemy=(x,y=300)=>({id:'target',x,y,min:x,max:x+1,speed:0,downUntil:0});
for(const kind of ['fire','wind','ice','thunder','stone','water'])test(kind+' crosses the spike side and hits the overlapping enemy',()=>{
 const g=fixture(),h=course589(g).hazards.find(h=>h.kind==='spikes'),p=g.players[0],e=enemy(h.x+h.w/2);g.enemies=[e];
 Object.assign(p,{x:h.x-65,y:300,weapon:kind,facing:1,attackHeld:true,shotAt:0});
 for(let i=0;i<32;i++){g.lastAt+=25;g.elapsed+=25;combat591(g,()=>{});p.attackHeld=false;}
 assert(kind==='ice'?e.ice:e.defeated,kind+' must reach an enemy inside the spikes');
});
test('a solid wall still stops a projectile',()=>{
 const g=fixture(),w=course589(g).walls.find(w=>!w.breakable)??course589(g).walls[0];assert(w);
 g.projectiles=[{id:1,kind:'wind',x:w.x-7,y:w.y+w.h/2,vx:440,vy:0,hitsLeft:1,owner:0,until:g.lastAt+1000}];combat591(g,()=>{});assert.equal(g.projectiles.length,0);
});
for(const axis of [-1,1])test('spring side blocks '+axis+' without launching while the direction is held',()=>{
 const g=fixture(),p=g.players[0],s=course589(g).springs[0];Object.assign(p,{x:s.x-axis*72,y:s.y,vx:0,vy:0,grounded:true,platformId:null});
 let springs=0;for(let i=0;i<24;i++){const at=g.lastAt+i*25;control587(p,{axis,jump:false,attack:false},at);if(stepRunner587(p,at,g.elapsed+i*25,.025,g).spring)springs++;}
 // Use this course's geometry, not the original forest definition.
 assert.equal(springs,0);assert.equal(p.y,s.y);assert(Math.abs(p.x-(s.x-axis*34))<.01);
});
test('landing on a spring launches from its visible top, preserves right hold, and does not relaunch in flight',()=>{
 const g=fixture(),p=g.players[0],s=course589(g).springs[0];Object.assign(p,{x:s.x-8,y:s.y-36,vx:235,vy:230,grounded:false,platformId:null,lastGroundAt:-1e9});
 let count=0,lastX=p.x,minY=p.y;
 for(let i=0;i<24;i++){
  const at=g.lastAt+i*25;control587(p,{axis:1,jump:false,attack:false},at);const move=stepRunner587(p,at,g.elapsed+i*25,.025,g);
  if(move.spring){count++;assert.equal(p.y,s.y-28);assert.equal(p.vy,-(s.power??RUN587.spring));assert.equal(p.platformId,null);}
  assert(p.x>=lastX);assert(p.x-lastX<=RUN587.speed*.025+.01);lastX=p.x;minY=Math.min(minY,p.y);
 }
 assert.equal(count,1);assert(minY<s.y-100);assert.equal(p.axis,1);
});
test('stomp gives a small bounce, a fresh normal jump and resets wind air jumps',()=>{
 const g=fixture(),p=g.players[0],e=enemy(100);g.enemies=[e];Object.assign(p,{x:100,y:268,vy:170,grounded:false,platformId:null,lastGroundAt:-1e9,weapon:'wind',airJumps598:2,airJumpUsed:true});
 for(let i=0;i<10&&!e.defeated;i++)tick(g,25,{jump:false});assert(e.defeated);assert.equal(p.vy,-285);assert.equal(p.reboundJump599,true);assert.equal(p.airJumps598,0);
 tick(g,175,{jump:false});const before=p.y;tick(g,25,{jump:true});assert(p.y<before);assert(p.vy<-400);assert.equal(p.reboundJump599,false);assert.equal(p.airJumps598,0);
 for(let i=1;i<=2;i++){tick(g,25,{jump:false});tick(g,25,{jump:true});assert.equal(p.airJumps598,i);}
});
test('even without an element a stomp jump reaches above an ordinary jump',()=>{
 const normal=fixture(),n=normal.players[0];let normalTop=n.y;for(let i=0;i<24;i++){tick(normal,25,{jump:true});normalTop=Math.min(normalTop,n.y);}
 const g=fixture(),p=g.players[0],e=enemy(100);g.enemies=[e];Object.assign(p,{x:100,y:268,vy:170,grounded:false,platformId:null,lastGroundAt:-1e9});
 for(let i=0;i<10&&!e.defeated;i++)tick(g,25,{jump:false});tick(g,175,{jump:false});let top=p.y;for(let i=0;i<24;i++){tick(g,25,{jump:true});top=Math.min(top,p.y);}
 assert(top<normalTop-35,{top,normalTop});assert.equal(p.weapon,null);
});
test('pause-induced startAt shifts do not discard input replay or reset the monotonic clock',()=>{
 const g=fixture(),u={inputs591:[],corrections591:new Map()},c={state:{runners:publicRunners587(g,'p0')},runnersUI587:u};
 remember591(c);u.inputs591.push({seq:9});syncClock595(c,5000,100);const before=clock595(c,150);
 for(let i=1;i<=5;i++){c.state.runners={...c.state.runners,startAt:g.startAt+i*50,serverAt:g.lastAt+i*50};remember591(c);syncClock595(c,5000+i*50,100+i*50);}
 assert.equal(u.inputs591.length,1);assert.equal(u.frames591.length,6);assert.equal(clock595(c,400)-before,250);
});
test('self prediction does not stomp an enemy already inactive on the server',()=>{
 const g=fixture(),p=g.players[0],e=enemy(100);e.downUntil=g.lastAt+1000;g.enemies=[e];Object.assign(p,{x:100,y:271,vy:180,grounded:false,platformId:null,lastGroundAt:-1e9});
 const c={transport:{selfId:'p0'},state:{runners:publicRunners587(g,'p0')},runnersUI587:{inputs591:[]}};remember591(c);const q=predict591(c,c.state.runners.players[0],g.lastAt+50);assert(q.vy>0);assert(!q.reboundJump599);
});
test('spring prediction matches the authoritative trajectory under a held direction',()=>{
 const g=fixture(),p=g.players[0],s=course589(g).springs[0];Object.assign(p,{x:s.x-8,y:s.y-36,vx:235,vy:230,axis:1,grounded:false,platformId:null,lastGroundAt:-1e9,controlAt:g.lastAt});
 const state=publicRunners587(g,'p0'),c={transport:{selfId:'p0'},state:{runners:state},runnersUI587:{inputs591:[]}};remember591(c);
 for(let i=1;i<=8;i++){advanceRunners587(g,g.lastAt+25);const q=predict591(c,state.players[0],state.serverAt+i*25);assert(Math.abs(q.x-p.x)<.001);assert(Math.abs(q.y-p.y)<.001,{predicted:q.y,server:p.y});}
});
test('jittered 50ms snapshots keep a held spring launch continuous at 60Hz render times',()=>{
 const g=fixture(),p=g.players[0],s=course589(g).springs[0];g.enemies=[];Object.assign(p,{x:s.x-8,y:s.y-36,vx:235,vy:230,axis:1,grounded:false,platformId:null,lastGroundAt:-1e9,controlAt:g.lastAt,invincibleUntil:g.lastAt+10000});
 const initial=publicRunners587(g,'p0'),start=g.lastAt,packets=[];let delivery=0;
 const jitter=[55,35,95,60,115,45,70,40];
 for(let i=1;i<=40;i++){controls(g,{axis:1});advanceRunners587(g,g.lastAt+25);if(i%2===0){const server=i*25;delivery=Math.max(delivery+1,server+jitter[packets.length%jitter.length]);packets.push({at:delivery,state:publicRunners587(g,'p0')});}}
 const c={transport:{selfId:'p0'},state:{runners:initial},runnersUI587:{inputs591:[]}};remember591(c);let prev=null,maxStep=0;
 for(let time=0;time<=1000;time+=1000/60){while(packets[0]?.at<=time){c.state.runners=packets.shift().state;remember591(c);}const q=predict591(c,c.state.runners.players[0],start+time);if(prev)maxStep=Math.max(maxStep,Math.hypot(q.x-prev.x,q.y-prev.y));prev=q;}
 assert(maxStep<18,'a render frame jumped '+maxStep.toFixed(2)+' world pixels');
});
