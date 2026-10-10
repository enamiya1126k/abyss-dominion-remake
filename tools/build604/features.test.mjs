import test from 'node:test';
import assert from 'node:assert/strict';
import {makeRunners587,startRunners587,advanceRunners587,inputRunners587,hurtRunners587,publicRunners587} from '../../src/runners587/Rules587.js';
import {course589,COURSES589,readyGate589} from '../../src/runners587/Courses589.js';
import {stepRunner587,control587,stomp599} from '../../src/runners587/Physics587.js';
import {surfaces587} from '../../src/runners587/Level587.js';
import {combat591} from '../../src/runners587/Combat591.js';
import {remember591,predict591} from '../../src/runners587/Motion591.js';
import {look588} from '../../src/runners587/Feel588.js';
import {crumble600,fallLimit600} from '../../src/runners587/Terrain600.js';
import {encounters600,firebar600,tide600,roller600,hitBoss600} from '../../src/runners587/Encounters600.js';
const emit=(g,type,data={})=>g.events.push({type,at:g.lastAt,...data});
function game(id='forest'){
 const g=makeRunners587({id:'six00',code:'TEST',hostId:'p0',members:[{playerId:'p0',name:'You'}],now:1000});g.courseId=id;startRunners587(g,1000,600);
 for(let at=1025;at<=4025;at+=25)advanceRunners587(g,at);g.enemies=[];return g;
}
function tick(g,ms,target){for(let t=0;t<ms;t+=25){if(target)inputRunners587(g,g.players[0],{seq:g.players[0].lastSeq+1,action:'control',target});advanceRunners587(g,g.lastAt+25);}}
const client=g=>({transport:{selfId:'p0'},state:{runners:publicRunners587(g,'p0')},runnersUI587:{inputs591:[],corrections591:new Map()}});
for(const [kind,hits]of [['fire',1],['stone',1],['wind',1],['ice',1],['thunder',1],['water',1]])test(kind+' breaks one box with '+hits+' actual collisions, preserving the rest of its stack',()=>{
 const g=game('ember'),box=course589(g).walls.find(w=>w.box),stack=course589(g).walls.filter(w=>w.box&&w.x===box.x);assert(stack.length>=2);
 for(let i=0;i<hits;i++){g.projectiles=[{owner:0,kind,x:box.x-10,y:box.y+box.h/2,vx:600,vy:0,until:1e9,hitsLeft:3}];combat591(g,emit);assert.equal(g.projectiles.length,0);if(i<hits-1)assert(!g.broken.includes(box.id));}
 assert.deepEqual(g.broken,[box.id]);assert.equal(g.events.filter(e=>e.type==='break').length,1);
});
test('projectile visible edge grazes a box and a fast shot cannot tunnel through it',()=>{
 const g=game('ember'),box=course589(g).walls.find(w=>w.box);
 for(let i=0;i<2;i++){g.projectiles=[{owner:0,kind:'fire',x:box.x-30,y:box.y-3,vx:5000,vy:0,until:1e9,hitsLeft:3}];combat591(g,emit);}
 assert(g.broken.includes(box.id));
});
test('falling ledge carries its rider for 1.8 seconds and allows a fresh jump during the fall',()=>{
 const g=game('clock'),c=course589(g),s=c.platforms.find(p=>p.crumble),p=g.players[0];g.crumbles[s.id]=0;
 Object.assign(p,{x:s.x+s.w/2,y:s.y,vx:0,vy:0,grounded:true,platformId:s.id,lastGroundAt:5000,axis:0});
 for(let elapsed=25;elapsed<=1800;elapsed+=25){control587(p,{axis:0,jump:false,attack:false},5000+elapsed);stepRunner587(p,5000+elapsed,elapsed,.025,g);const floor=surfaces587(elapsed,c,g).find(q=>q.id===s.id);assert(p.grounded,'rider fell through at '+elapsed);assert(Math.abs(p.y-floor.y)<.001);}
 const y=p.y;control587(p,{axis:1,jump:true,attack:false},6825);stepRunner587(p,6825,1825,.025,g);assert(p.vy<-400);assert(p.y<y);assert(!p.grounded);
 assert(crumble600(0,2100).fall<60);assert(surfaces587(3650,c,g).some(q=>q.id===s.id));assert(!surfaces587(3800,c,g).some(q=>q.id===s.id));assert(surfaces587(6250,c,g).some(q=>q.id===s.id));
});
test('vertical moving platforms never alternate grounded and airborne for a stationary rider',()=>{
 const g=game('sky'),c=course589(g),s=c.platforms.find(p=>p.move?.axis==='y'),p=g.players[0],start=surfaces587(0,c,g).find(q=>q.id===s.id);
 Object.assign(p,{x:start.x+start.w/2,y:start.y,vx:0,vy:0,grounded:true,platformId:s.id});
 for(let t=25;t<=6000;t+=25){control587(p,{axis:0,jump:false,attack:false},t+5000);stepRunner587(p,t+5000,t,.025,g);const q=surfaces587(t,c,g).find(q=>q.id===s.id);assert(p.grounded);assert(Math.abs(p.y-q.y)<.001);}
});
test('fractional prediction does not borrow a future landing flag or snap down early',()=>{
 const g=game(),p=g.players[0];Object.assign(p,{x:95,y:288,vy:440,grounded:false,platformId:null,lastGroundAt:-1e9});const c=client(g);remember591(c);
 const q=predict591(c,c.state.runners.players[0],g.lastAt+4);assert(q.y>288&&q.y<293);assert(!q.grounded);
});
test('respawn discards old airborne input even if intermediate death packets were missed',()=>{
 const g=game(),p=g.players[0],c=client(g);remember591(c);c.runnersUI587.inputs591.push({seq:500,at:g.lastAt,target:{axis:1,jump:true,attack:false}});
 Object.assign(p,{x:700,y:480,vy:200,grounded:false});hurtRunners587(g,p,'fall');tick(g,725);
 c.state.runners=publicRunners587(g,'p0');remember591(c);assert.equal(c.runnersUI587.inputs591.length,0);
 for(let dt=0;dt<=195;dt+=5){const q=predict591(c,c.state.runners.players[0],g.lastAt+dt);assert.equal(q.y,300);assert(q.grounded);}
});
test('inputs received while respawning are acknowledged but never replayed as a ghost jump',()=>{
 const g=game(),p=g.players[0];hurtRunners587(g,p,'fall');
 advanceRunners587(g,g.lastAt+25,new Map([['p0',[{round:g.round,seq:90,action:'control',target:{axis:1,jump:true,attack:false}}]]]));
 assert.equal(p.lastSeq,90);tick(g,800);assert.equal(p.y,300);assert(!p.jumpHeld);
});
test('turning in the air does not change the camera anchor; deep rooms stay in view',()=>{
 const p={x:1500,y:180,vx:0,axis:1,facing:1};assert.equal(look588(390,480,p,'forest').camera,look588(390,480,{...p,axis:-1,facing:-1},'forest').camera);
 const d=look588(390,480,{...p,y:550},'crystal');assert(Math.abs(550*d.scale+d.offsetY-d.anchor-40*d.scale)<.001);
});
for(const c of COURSES589)test(c.id+' has sparse forms, safe item positions and valid checkpoint surfaces',()=>{
 const ordinary=c.pickups.filter(p=>!p.secret);assert.equal(ordinary.length,c.expert603?12:6);assert.equal(new Set(ordinary.map(p=>p.kind)).size,6);assert(c.pickups.length<=(c.expert603?12:7));
 const sorted=[...ordinary].sort((a,b)=>a.x-b.x);for(let i=1;i<sorted.length;i++)assert(sorted[i].x-sorted[i-1].x>=600);
 const s=surfaces587(0,c,{});for(const item of ordinary){assert(item.x<c.goal);assert(s.some(q=>item.x>=q.x&&item.x<=q.x+q.w&&Math.abs(q.y-item.y-27)<5),'unsupported item '+item.id);}
 for(const cp of c.checkpoints)assert(s.some(q=>cp.x>=q.x&&cp.x<=q.x+q.w&&Math.abs(q.y-cp.y)<2),'unsupported checkpoint '+JSON.stringify(cp));
});
test('forest spawns three groups of four only once, with both ground and flying attackers',()=>{
 const g=game(),c=course589(g),h=c.swarms600[0],p=g.players[0];p.x=h.trigger;p.y=300;
 for(const elapsed of [1000,1425,1450,1875,1900,6000]){g.elapsed=elapsed;encounters600(g,c,new Map(),emit,hurtRunners587,stomp599);assert(g.enemies.length<=12);if(elapsed===1425)assert.equal(g.enemies.length,4);if(elapsed===1875)assert.equal(g.enemies.length,8);}
 assert.equal(g.enemies.length,12);assert.equal(g.enemies.filter(e=>e.flying).length,3);
});
test('firebar collision uses the same rotating points as its drawing while water is harmless',()=>{
 const g=game('ember'),c=course589(g),h=c.firebars600[0],p=g.players[0];g.elapsed=0;const q=firebar600(h,0).at(-1);Object.assign(p,{x:q.x,y:q.y+12,invincibleUntil:0});encounters600(g,c,new Map(),emit,hurtRunners587,stomp599);assert.equal(p.deaths,1);
 const coast=game('coast'),cc=course589(coast),t=cc.tides600[0],player=coast.players[0];Object.assign(player,{x:t.x+20,y:300});coast.elapsed=0;encounters600(coast,cc,new Map(),emit,hurtRunners587,stomp599);assert.equal(player.deaths,0);coast.elapsed=4000;encounters600(coast,cc,new Map(),emit,hurtRunners587,stomp599);assert.equal(player.deaths,0);assert(tide600(t,4000).y<260);
});
for(const id of ['relay','crystal'])test(id+' underground entrance catches a real fall before the kill plane',()=>{
 const g=game(id),c=course589(g),room=c.secrets600[0],p=g.players[0];Object.assign(p,{x:room.entrance,y:400,vx:0,vy:180,grounded:false,platformId:null});
 for(let i=0;i<60&&!p.grounded;i++)tick(g,25,{axis:0,jump:false,attack:false});assert.equal(p.deaths,0);assert.equal(p.platformId,id+'-602-cave-floor0');assert(p.y<fallLimit600(c,p.x));
});
for(const id of ['forest','relay','ember'])test(id+' boss telegraphs, damages, takes attacks and stomps, and unlocks the gate',()=>{
 const g=game(id),c=course589(g),b=g.boss600,p=g.players[0];g.switches=c.switches.map(s=>s.id);assert(!readyGate589(g));p.x=b.left;
 encounters600(g,c,new Map(),emit,hurtRunners587,stomp599);assert.equal(b.phase,'warn');g.elapsed+=925;encounters600(g,c,new Map(),emit,hurtRunners587,stomp599);assert.equal(b.phase,'dash');
 b.phase='rest';b.phaseAt=g.elapsed;Object.assign(p,{x:b.x,y:b.y-61,vy:100,grounded:false,platformId:null});encounters600(g,c,new Map([[p.seat,{y:b.y-68}]]),emit,hurtRunners587,stomp599);assert.equal(b.hp,b.maxHp-2);assert(p.vy<0);assert(p.reboundJump599);
 g.elapsed+=525;g.projectiles=[{owner:0,kind:'stone',x:b.x-41,y:b.y-20,vx:300,vy:0,until:1e9,hitsLeft:2}];combat591(g,emit);assert.equal(b.hp,b.maxHp-4);
 while(b.hp>0){g.elapsed+=525;hitBoss600(g,0,2,emit);}assert(readyGate589(g));assert.equal(b.phase,'down');assert(g.events.some(e=>e.type==='boss-defeat'));
});
