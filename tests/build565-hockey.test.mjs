import test from 'node:test';
import assert from 'node:assert/strict';
import {HOCKEY564 as C,makeHockey564,startHockey564,advanceHockey564,physicsHockey564,pairHockey564,canShoot564,launch564,input564,power565,publicHockey564,finishHockey564} from '../src/ricochet550/Hockey564.js';
import {members} from '../tools/build563/fixture.mjs';
import {room} from '../tools/build563/wire-fixture.mjs';
function game(rotor=false,speed=1,seed=565){
 const g=makeHockey564({id:'refined',code:'TEST',hostId:'p0',partyId:'party',members:members(),now:0});g.hockey565={rotor,speed};startHockey564(g,0,seed);
 for(let at=20;at<=g.startAt;at+=20)advanceHockey564(g,at);
 g.players.forEach(p=>{p.ai=false;p.x=p.seat<2?-6:6;p.y=p.team564===0?3:C.height-3;p.vx=p.vy=0;});return g;
}
const putPuck=(g,extra={})=>g.gem={x:0,y:5,vx:0,vy:0,r:C.gemRadius,mass:.65,serial:9,value:1,lastTouch:null,charge565:0,chain565:0,touch565:null,...extra};
function receive(g,actor,index){
 const direction=index%2===0?1:-1;
 Object.assign(actor,{x:direction===1?-3:3,y:4,vx:direction*8,vy:0});
 Object.assign(g.gem,{x:actor.x+direction*1.1,y:4,vx:0,vy:0});g.simAt+=200;
 return pairHockey564(g,actor,g.gem);
}

test('both scoring lines are flush with the outer field boundary',()=>{
 const g=game();assert.deepEqual(g.goals.map(p=>p.y),[0,C.height]);
 for(const defending of [0,1]){
  const h=game(),y=defending===0?-.1:C.height+.1;putPuck(h,{y});physicsHockey564(h);assert(h.gem);assert.equal(h.teams564[1-defending].score,0);
  h.gem.y=defending===0?-C.gemRadius-.01:C.height+C.gemRadius+.01;physicsHockey564(h);assert.equal(h.teams564[1-defending].score,1);
 }
});

test('pass charge grows exactly five percent per qualified pass with no gameplay ceiling',()=>{
 const g=game(),allies=g.players.filter(p=>p.team564===0);putPuck(g);receive(g,allies[0],0);
 for(let i=1;i<=200;i++){assert(receive(g,allies[i%2],i)>0);assert.equal(g.gem.charge565,i);assert.equal(power565(g.gem),1+i*.05);}
 assert.equal(power565(g.gem),11);assert.equal(allies.reduce((s,p)=>s+p.passes565,0),200);
});

test('same striker, rapid contacts and adjacent strikers cannot farm charge',()=>{
 const g=game(),allies=g.players.filter(p=>p.team564===0);putPuck(g);receive(g,allies[0],0);
 for(let i=0;i<10;i++)receive(g,allies[0],0);assert.equal(g.gem.charge565,0);
 const previous=g.gem.lastTouch;g.gem.touch565={seat:previous,team:0,at:g.simAt,x:1.9,y:4};
 Object.assign(allies[1],{x:3,y:4,vx:-8,vy:0});Object.assign(g.gem,{x:1.9,y:4,vx:0,vy:0});pairHockey564(g,allies[1],g.gem);assert.equal(g.gem.charge565,0);
});

test('an opponent return retains the full charge and can cause a powered own goal',()=>{
 const g=game(),allies=g.players.filter(p=>p.team564===0);putPuck(g);receive(g,allies[0],0);receive(g,allies[1],1);
 const enemy=g.players.find(p=>p.team564===1);Object.assign(enemy,{x:0,y:14,vx:9,vy:0});Object.assign(g.gem,{x:1.1,y:14,vx:0,vy:0});g.simAt+=200;pairHockey564(g,enemy,g.gem);
 assert.equal(g.gem.charge565,1);assert.equal(g.gem.chain565,0);assert.equal(g.gem.lastTouch,enemy.seat);
 Object.assign(g.gem,{x:0,y:C.height+.6,vx:0,vy:0});physicsHockey564(g);assert.equal(g.teams564[0].score,1);assert(g.lastGoal.ownGoal);assert.equal(g.lastGoal.charge565,1);
});

test('2x mode doubles puck flight without changing a striker launch or compounding repeated impacts',()=>{
 const a=game(false,1),b=game(false,2);for(const g of[a,b]){putPuck(g);receive(g,g.players[0],0);}
 assert(Math.abs(b.gem.vx/a.gem.vx-2)<1e-10);assert.equal(a.players[0].vx,b.players[0].vx);
 for(let i=0;i<20;i++){receive(a,a.players[0],0);receive(b,b.players[0],0);assert(Math.abs(b.gem.vx/a.gem.vx-2)<1e-10);}
 assert.equal(a.gem.charge565,0);assert.equal(b.gem.charge565,0);
 for(const g of[a,b]){const p=g.players[2];p.vx=p.vy=0;assert(launch564(g,p,.7,.5));}assert.equal(a.players[2].vx,b.players[2].vx);assert.equal(a.players[2].vy,b.players[2].vy);
});

test('strikers stay completely in their own half after shots, body collisions and spinning-rotor contacts',()=>{
 for(const rotor of[false,true])for(const speed of[1,2]){
  const g=game(rotor,speed);g.rotor.omega=13;putPuck(g,{x:5,y:C.height/2,vy:15});
  for(let i=0;i<500;i++){
   g.players.forEach((p,n)=>{if(i%40===0){p.x=(n%2?1:-1)*1.2;p.y=C.height/2+(p.team564===0?-1:1)*1.3;p.vx=(n%2?-1:1)*42;p.vy=p.team564===0?46:-46;}});
   physicsHockey564(g);
   for(const p of g.players){assert(p.team564===0?p.y+p.r<=C.height/2+1e-9:p.y-p.r>=C.height/2-1e-9);assert(p.y>=p.r-1e-9&&p.y<=C.height-p.r+1e-9);}
  }
 }
});

test('propeller off removes its collision, and propeller on really transfers momentum',()=>{
 const states=[];for(const on of[false,true]){const g=game(on);putPuck(g,{x:1.6,y:C.height/2-1,vy:26});physicsHockey564(g,.06);states.push(g);}
 assert.equal(states[0].rotor.omega,0);assert(Math.abs(states[1].rotor.omega)>.1);assert(states[1].events.some(e=>e.type==='rotor'));
});

test('extreme unbounded charge still hits a defender instead of tunneling into its goal',()=>{
 for(const speed of[1,2]){
  const g=game(false,speed),p=g.players[0];Object.assign(p,{x:0,y:3,vx:0,vy:0});putPuck(g,{y:8,vy:-2000,charge565:1000});
  physicsHockey564(g,.005);assert(g.gem);assert.equal(g.gem.lastTouch,p.seat);assert.equal(g.teams564[1].score,0);assert.equal(g.gem.charge565,1000);assert(g.gem.vy>0);
 }
});

test('very fast free shots cross the flush goal once; corner shots rebound from the rail',()=>{
 const g=game(false,2);putPuck(g,{y:8,vy:-2400,charge565:1000});physicsHockey564(g,.02);assert.equal(g.teams564[1].score,1);assert.equal(g.gem,null);
 const h=game(false,2);putPuck(h,{x:4.5,y:2,vy:-2400,charge565:1000});physicsHockey564(h,.002);assert(h.gem);assert(h.gem.vy>0);assert.equal(h.teams564[1].score,0);
});

test('goals lock input for exactly two seconds then reset charge and serve toward the conceding team',()=>{
 const g=game();putPuck(g,{y:-.6,lastTouch:0,charge565:40});physicsHockey564(g);const scoredAt=g.simAt;
 assert.equal(g.gemReadyAt-scoredAt,2000);assert(!canShoot564(g,g.players[0]));assert(!input564(g,g.players[0],{seq:1,round:1,shot:0,action:'shoot',power:1,angle:0}));
 const positions=g.players.map(p=>[p.x,p.y]);for(let at=scoredAt+20;at<scoredAt+2000;at+=20)advanceHockey564(g,at);
 assert.equal(g.gem,null);assert.deepEqual(g.players.map(p=>[p.x,p.y]),positions);advanceHockey564(g,scoredAt+2000);
 assert(g.gem);assert.equal(g.gem.charge565,0);assert(g.gem.y<C.height/2);assert.equal(g.teams564[1].score,1);
});

test('host-only options validate exact values, clear readiness, lock in play and persist on rematch',()=>{
 const f=room('pinball');f.ready();
 assert.throws(()=>f.dispatch('p1',{op:f.a.op,kind:'hockeyOptions',rotor:true,speed:2}),/部屋主/);
 for(const [rotor,speed]of[['true',2],[true,3],[null,1]])assert.throws(()=>f.dispatch('p0',{op:f.a.op,kind:'hockeyOptions',rotor,speed}),/選んで/);
 assert(f.dispatch('p0',{op:f.a.op,kind:'hockeyOptions',rotor:true,speed:2}));assert(f.p.members.every(p=>!p.ready));f.start();
 assert.deepEqual(f.g().hockey565,{rotor:true,speed:2});assert.throws(()=>f.dispatch('p0',{op:f.a.op,kind:'hockeyOptions',rotor:false,speed:1}),/開始前/);
 finishHockey564(f.g(),f.at);f.tick(20);f.dispatch('p0',{op:'partyResult490',partyId:f.p.id,gameId:f.g().id,kind:'again'});assert.deepEqual(f.g().hockey565,{rotor:true,speed:2});
});

test('all clients receive charge, options and the same respawn deadline across save and reconnect',()=>{
 const f=room('pinball');f.dispatch('p0',{op:f.a.op,kind:'hockeyOptions',rotor:true,speed:2});f.start();putPuck(f.g(),{x:5,y:5,charge565:123,vx:1});f.tick(20);
 for(const m of f.p.members){const s=f.a.snapshot(f.c,f.saved(),m.playerId);assert.equal(s.gem.charge565,123);assert.deepEqual(s.hockey565,{rotor:true,speed:2});}
 putPuck(f.g(),{y:-.6,charge565:123});f.tick(20);const deadline=f.g().gemReadyAt;f.c[f.a.runtime]=new Map();f.tick(100);
 for(const m of f.p.members){const s=f.a.snapshot(f.c,f.saved(),m.playerId);assert.equal(s.lastGoal.charge565,123);assert.equal(s.gemReadyAt,deadline);assert.equal(s.gem,null);}
});

test('all four option combinations complete finite AI matches with bounded home positions',()=>{
 const results=[];
 for(const rotor of[false,true])for(const speed of[1,2]){
  let goals=0,passes=0,maxCharge=0;const teamGoals=[0,0];
  for(let seed=1;seed<=12;seed++){
   const g=game(rotor,speed,seed);g.players.forEach(p=>p.ai=true);
   for(let at=g.simAt+20;at<=g.deadline;at+=20){advanceHockey564(g,at);maxCharge=Math.max(maxCharge,g.gem?.charge565??0);assert(g.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&& (p.team564===0?p.y+p.r<=C.height/2+1e-8:p.y-p.r>=C.height/2-1e-8)));}
   assert.equal(g.phase,'result');goals+=g.teams564.reduce((s,t)=>s+t.goals,0);passes+=g.players.reduce((s,p)=>s+p.passes565,0);for(const t of g.teams564)teamGoals[t.id]+=t.goals;
  }
  assert(goals>=12);assert(teamGoals.every(n=>n>0));results.push({rotor,speed,matches:12,goals,passes,maxCharge,teamGoals});
 }
 console.log(JSON.stringify({optionSimulation565:results}));
});
