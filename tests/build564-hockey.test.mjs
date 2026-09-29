import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { HOCKEY564 as C, makeHockey564, startHockey564, advanceHockey564,
  physicsHockey564, pairHockey564, finishHockey564, publicHockey564, launch564,
  canShoot564, input564, botHockey564 } from '../src/ricochet550/Hockey564.js';
import { launch563 } from '../src/ricochet550/Goals563.js';
import { members } from '../tools/build563/fixture.mjs';
import { room } from '../tools/build563/wire-fixture.mjs';

function game(count = 4, seed = 564) {
  const g = makeHockey564({ id:'hockey', code:'TEST', hostId:'p0', partyId:'party', members:members().slice(0,count), now:1000 });
  startHockey564(g,1000,seed);
  for(let t=g.simAt+20;t<=g.startAt;t+=20) advanceHockey564(g,t);
  g.players.forEach(p=>{p.ai=false;p.x=p.seat%2===0?-6:6;p.y=6+p.seat*2;p.vx=p.vy=0;});
  return g;
}
function puck(g, x, y, vx=0, vy=0, lastTouch=null) {
  g.gem={x,y,vx,vy,r:C.gemRadius,mass:.65,lastTouch,serial:1,value:1};
}

test('one to four people fill exactly two teams; player colors and selected monsters survive',()=>{
  for(let n=1;n<=4;n++){
    const people=members().slice(0,n),g=makeHockey564({id:'x',members:people});
    startHockey564(g,0,22);
    assert.deepEqual([0,1].map(t=>g.players.filter(p=>p.team564===t).length),[2,2]);
    for(let i=0;i<n;i++){assert.equal(g.players[i].color499,people[i].color499);assert.equal(g.players[i].speciesId,people[i].choice.speciesId);}
    assert.equal(g.players.filter(p=>p.ai).length,4-n);
  }
});

test('launch, momentum, reload and cancel retain the exact Build563 behavior',()=>{
  assert.equal(launch564,launch563);
  const g=game(),p=g.players[0];p.vx=3;p.vy=-2;
  assert(launch564(g,p,.7,.4));const speed=7+15*.7+13*.7*.7;
  assert(Math.abs(p.vx-(3+Math.sin(.4)*speed))<1e-9);
  assert(Math.abs(p.vy-(-2+Math.cos(.4)*speed))<1e-9);
  assert.equal(p.nextShotAt563-g.simAt,1250);assert(!canShoot564(g,p,g.simAt+1249));assert(canShoot564(g,p,g.simAt+1250));
  g.simAt+=1250;assert(input564(g,p,{seq:1,round:1,shot:1,action:'pull',angle:0,power:.9}));
  assert(input564(g,p,{seq:2,round:1,shot:1,action:'cancel'}));assert(!p.pulling);assert.equal(p.shots555,1);
});

test('only a complete puck crossing inside either goal scores for the opposite team',()=>{
  for(const defending of [0,1]){
    const g=game(),atBottom=defending===0,front=atBottom?C.goalDepth:C.height-C.goalDepth;
    puck(g,0,front+(atBottom?-.1:.1));physicsHockey564(g);assert.deepEqual(g.teams564.map(t=>t.score),[0,0]);
    puck(g,0,atBottom?.6:C.height-.6);physicsHockey564(g);
    assert.equal(g.teams564[1-defending].score,1);assert.equal(g.teams564[defending].score,0);assert.equal(g.gem,null);
    physicsHockey564(g);assert.equal(g.teams564[1-defending].score,1);
  }
  const g=game();puck(g,5,.6);physicsHockey564(g);assert.deepEqual(g.teams564.map(t=>t.score),[0,0]);assert(g.gem);
});

test('own goals credit opponents, assists only credit a recent teammate, positions continue after goals',()=>{
  const g=game(),p=g.players.find(p=>p.team564===0);puck(g,0,.6,0,0,p.seat);
  const positions=g.players.map(p=>[p.x,p.y]);physicsHockey564(g);
  assert.equal(g.teams564[1].score,1);assert.equal(p.ownGoals564,1);assert.equal(p.goals,0);assert(g.lastGoal.ownGoal);
  assert.deepEqual(g.players.map(p=>[p.x,p.y]),positions);
  const allies=g.players.filter(p=>p.team564===0);puck(g,0,C.height-.6,0,0,allies[1].seat);
  g.gem.assistSeat564=allies[0].seat;g.gem.assistAt564=g.simAt-500;physicsHockey564(g);
  assert.equal(allies[1].goals,1);assert.equal(allies[0].assists564,1);assert.equal(g.teams564[0].score,1);
});

test('wall banks, goalposts, both teams and the collision-driven rotor remain physical',()=>{
  const g=game();puck(g,7.45,9,20,0);physicsHockey564(g);assert(g.gem.vx<0);
  puck(g,C.goalHalfWidth-.3,C.goalDepth+.55,0,-30);physicsHockey564(g,.04);assert(g.gem);assert(g.gem.vy>0||Math.abs(g.gem.vx)>1);
  const a=g.players[0],b=g.players[1];Object.assign(a,{x:0,y:7,vx:10,vy:0});Object.assign(b,{x:1,y:7,vx:0,vy:0});
  assert(pairHockey564(g,a,b)>0);assert(b.vx>0);
  Object.assign(a,{x:1.8,y:C.height/2+.7,vx:0,vy:-25});g.gem=null;physicsHockey564(g,.02);assert(Math.abs(g.rotor.omega)>.1);
});

test('final fifteen seconds are two points; deadline seals the result for both teammates',()=>{
  const g=game();g.simAt=g.deadline-14980;puck(g,0,C.height-.6);physicsHockey564(g);assert.equal(g.teams564[0].score,2);
  finishHockey564(g,g.deadline);assert.equal(g.winnerIds.length,2);assert(g.winnerIds.every(id=>g.players.find(p=>p.playerId===id).team564===0));
  assert(!g.draw564);const scores=g.teams564.map(t=>t.score);advanceHockey564(g,g.deadline+2000);assert.deepEqual(g.teams564.map(t=>t.score),scores);
  const tie=game();finishHockey564(tie,tie.deadline);assert(tie.draw564);assert.equal(tie.winnerIds.length,4);
});

test('team selection is authenticated, capacity-limited, locked during play and preserved for a rematch',()=>{
  const f=room('pinball');f.p.members.splice(2);f.saved().members.splice(2);
  f.ready();assert(f.dispatch('p1',{op:f.a.op,kind:'team',team:0}));assert(f.p.members.every(p=>!p.ready));
  assert.throws(()=>f.dispatch('p0',{op:f.a.op,kind:'team',team:2}),/チーム/);
  assert.throws(()=>f.dispatch('outsider',{op:f.a.op,kind:'team',team:0}),/切り替わり/);
  f.start();assert.deepEqual(f.g().players.slice(0,2).map(p=>p.team564),[0,0]);
  assert.throws(()=>f.dispatch('p0',{op:f.a.op,kind:'team',team:1}),/開始前/);
  finishHockey564(f.g(),f.at);f.tick(20);const id=f.g().id;
  assert(f.dispatch('p0',{op:'partyResult490',partyId:f.p.id,gameId:id,kind:'again'}));
  assert.equal(f.g().phase,'lobby');assert.deepEqual(f.saved().members.map(p=>p.team564),[0,0]);
  const full=room('pinball');assert.throws(()=>full.dispatch('p0',{op:full.a.op,kind:'team',team:1}),/２人/);
});

test('all four snapshots agree on team scores, survive save/restore, and old rules return to lobby',()=>{
  const f=room('pinball');f.start();const g=f.g();g.players.forEach((p,i)=>{p.x=i%2?-6:6;p.y=7+i;p.vx=p.vy=0;});
  puck(g,0,C.height-.6);f.tick(60);assert.equal(f.g().teams564[0].score,1);
  const snapshots=f.p.members.map(p=>f.a.snapshot(f.c,f.saved(),p.playerId));
  for(const s of snapshots){assert.deepEqual(s.teams564.map(t=>t.score),[1,0]);assert.equal(s.members.filter(m=>m.team564===0).length,2);assert(!('seed' in s));assert(s.members.every(m=>!('owned' in m)));}
  f.c[f.a.runtime]=new Map();f.c.data[f.a.rooms].TEST=JSON.parse(JSON.stringify(f.saved()));f.tick(100);assert.equal(f.g().teams564[0].score,1);
  f.saved().rules550=7;f.tick(20);assert.equal(f.saved().phase,'lobby');assert.equal(f.saved().rules550,8);assert(f.p.members.every(p=>!p.ready));
});

test('AI assigns one attacker and one defender; finite ninety-second matches finish across seeds',()=>{
  let goals=0;const teamGoals=[0,0];
  for(let seed=1;seed<=32;seed++){
    const g=game(1,seed);g.players.forEach(p=>p.ai=true);
    for(let t=g.simAt+20;t<=g.deadline;t+=20){advanceHockey564(g,t);assert(g.players.every(p=>[p.x,p.y,p.vx,p.vy].every(Number.isFinite)));}
    assert.equal(g.phase,'result');assert.equal(g.teamResults564.length,2);assert(g.players.every(p=>p.shots555>0));
    for(const t of g.teams564){goals+=t.goals;teamGoals[t.id]+=t.goals;}
  }
  assert(goals>=32,'matches must produce goals');assert(teamGoals.every(n=>n>0));
  const g=game();puck(g,0,11);g.players[0].x=-1;g.players[0].y=9;g.players[2].x=0;g.players[2].y=4;
  botHockey564(g,g.players[0]);botHockey564(g,g.players[2]);assert.deepEqual([g.players[0].role564,g.players[2].role564].sort(),['attack','defend']);
  console.log(JSON.stringify({aiMatches:32,totalGoals:goals,teamGoals}));
});

test('active facade, client/server protocol and menu all select hockey',async()=>{
  const rules=await import('../src/ricochet550/Rules550.js');assert.equal(rules.RICOCHET550.version,8);
  const menu=(await import('../src/party/PartyGames462.js')).PARTY_GAMES462.find(g=>g.id==='pinball');assert.equal(menu.name,'人間エアホッケー！');
  for(const path of ['src/race/RaceClient451.js','online-server/src/RaceCoordinator451.js'])assert((await readFile(new URL('../'+path,import.meta.url),'utf8')).includes('ricochetVersion550:8'));
});
