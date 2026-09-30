import test from 'node:test';
import assert from 'node:assert/strict';
import {HOCKEY564 as C,makeHockey564,startHockey564,advanceHockey564,physicsHockey564,launch564,input564,botHockey564,publicHockey564} from '../src/ricochet550/Hockey564.js';
import {samplePull568,worldAngle568,viewPosition568,launchDirection568} from '../src/ricochet550/Control568.js';
import {point564} from '../src/ricochet550/Board564.js';
import {members} from '../tools/build563/fixture.mjs';
import {room} from '../tools/build563/wire-fixture.mjs';
import {partyClick462} from '../src/party/PartyView462.js';

function game(){
 const g=makeHockey564({id:'handling',code:'TEST',hostId:'p0',partyId:'party',members:members(),now:0});
 startHockey564(g,0,568);for(let t=20;t<=g.startAt;t+=20)advanceHockey564(g,t);
 g.players.forEach((p,i)=>Object.assign(p,{ai:false,x:i<2?-6:6,y:p.team564===0?3:C.height-3,vx:0,vy:0}));
 return g;
}
test('both teams see their own goal and every teammate below center; coordinates rotate exactly 180 degrees',()=>{
 const g=game();
 for(const team of [0,1]){
  const r={width:390,height:610,padY:24,sx:376/16,sy:562/C.height,team568:team};
  const center=point564(r,{x:0,y:C.height/2});
  for(const p of g.players)assert.equal(point564(r,p).y>center.y,p.team564===team);
  assert(point564(r,g.goals[team]).y>center.y);assert(point564(r,g.goals[1-team]).y<center.y);
  const q={x:3.5,y:4.2},roundtrip=viewPosition568(viewPosition568(q,C.height,team),C.height,team);assert.equal(roundtrip.x,q.x);assert(Math.abs(roundtrip.y-q.y)<1e-12);
 }
});
test('diagonal and cardinal pulls map screen direction into mirrored world shots without changing power',()=>{
 for(const [width,height] of [[390,610],[320,440],[740,280]]){
  const r={width,sx:(width-14)/16,sy:(height-48)/C.height};
  for(const delta of [[0,90],[-55,70],[60,0],[30,-60]]){
   const a=samplePull568({x:180,y:220},{x:180+delta[0],y:220+delta[1]},r,0);
   const b=samplePull568({x:180,y:220},{x:180+delta[0],y:220+delta[1]},r,1);
   assert.equal(a.power,b.power);assert(Math.abs(Math.sin(a.angle)+Math.sin(b.angle))<1e-12);
   assert(Math.abs(Math.cos(a.angle)+Math.cos(b.angle))<1e-12);
   for(const [team,pull] of [[0,a],[1,b]]){
    const d=launchDirection568({vx:0,vy:0},pull,r,team),distance=Math.hypot(...delta);
    assert(Math.abs(d.x+delta[0]/distance)<1e-12);assert(Math.abs(d.y+delta[1]/distance)<1e-12);
   }
  }
  assert.equal(samplePull568({x:0,y:0},{x:4,y:5},r,0).power,0);
 }
});
test('up-arrow attacks for either team and the launch preview includes the same residual velocity as the server',()=>{
 for(const team of [0,1]){
  const g=game(),p=g.players.find(p=>p.team564===team),angle=worldAngle568(0,team);
  p.vx=11;p.vy=-4;const r={sx:22,sy:31},d=launchDirection568(p,{power:.7,angle},r,team);
  assert(launch564(g,p,.7,angle));const sign=team===0?1:-1,x=p.vx*r.sx*sign,y=-p.vy*r.sy*sign,n=Math.hypot(x,y);
  assert(Math.abs(x/n-d.x)<1e-12);assert(Math.abs(y/n-d.y)<1e-12);assert(d.y<0);
 }
});
test('small pulls make small corrections, full strength remains 35, and repeated shots cannot bypass reload',()=>{
 const g=game(),p=g.players[0];assert(launch564(g,p,.08,0));assert(p.vy<4.3&&p.vy>4);
 assert(!input564(g,p,{action:'shoot',seq:1,round:1,shot:1,power:1,angle:0}));
 g.simAt+=C.reload;p.vx=p.vy=0;assert(input564(g,p,{action:'shoot',seq:1,round:1,shot:1,power:1,angle:0}));assert.equal(p.vy,35);
 assert(!input564(g,p,{action:'shoot',seq:1,round:1,shot:1,power:1,angle:0}));assert.equal(p.shots555,2);
});
test('aiming brakes a moving striker for either team; cancelling restores normal glide without firing',()=>{
 for(const team of [0,1]){
  const g=game(),p=g.players.find(p=>p.team564===team);g.gem={...g.gem,x:5,y:C.height/2,vx:0,vy:0};
  Object.assign(p,{x:-3,y:team===0?4:C.height-4,vx:6,vy:0});
  assert(input564(g,p,{seq:1,round:1,shot:0,action:'pull',power:.5,angle:worldAngle568(0,team)}));
  physicsHockey564(g,.25);assert(p.vx<1.35);assert.equal(p.shots555,0);
  assert(input564(g,p,{seq:2,round:1,shot:0,action:'cancel'}));const before=p.vx;
  physicsHockey564(g,.1);assert(p.vx/before>.92);assert(!p.pulling);assert.equal(p.shots555,0);
 }
});
test('center and side rails stop the return ricochet while pucks retain their bank-shot bounce',()=>{
 for(const team of [0,1]){
  const g=game(),p=g.players.find(p=>p.team564===team);g.gem={...g.gem,x:6,y:C.height/2,vx:0,vy:0};
  Object.assign(p,{x:0,y:C.height/2+(team===0?-1:1)*(p.r+.03),vx:0,vy:team===0?30:-30});
  physicsHockey564(g,.02);assert(Math.abs(p.vy)<3.7);assert((team===0?-1:1)*p.vy>0);
  Object.assign(p,{x:C.width/2-p.r-.03,y:team===0?4:C.height-4,vx:30,vy:0});physicsHockey564(g,.02);assert(p.vx<0&&p.vx>-3.7);
 }
 const g=game();Object.assign(g.gem,{x:7.5,y:C.height/2,vx:30,vy:0});physicsHockey564(g,.02);assert(g.gem.vx<-26);
});
test('a hard center-line rebound no longer knocks a stationary puck into our own goal',()=>{
 for(const team of [0,1]){
  const g=game(),p=g.players.find(p=>p.team564===team),sign=team===0?1:-1;
  Object.assign(p,{x:0,y:C.height/2-sign*(p.r+.03),vx:0,vy:sign*30});
  Object.assign(g.gem,{x:0,y:C.height/2-sign*3.5,vx:0,vy:0,lastTouch:null});
  for(let i=0;i<150;i++)physicsHockey564(g);
  assert.equal(g.teams564[1-team].score,0);assert.equal(p.ownGoals564,0);assert(g.gem);
 }
});
test('AI behind the puck takes a sideways route instead of driving it toward home',()=>{
 for(const team of [0,1]){
  const g=game(),allies=g.players.filter(p=>p.team564===team),p=allies[0],sign=team===0?1:-1;
  Object.assign(g.gem,{x:0,y:team===0?4:C.height-4,vx:0,vy:0});
  Object.assign(p,{x:0,y:g.gem.y+sign*1.6,vx:0,vy:0,planAt565:g.simAt+1000,passPlan565:false});
  Object.assign(allies[1],{x:-6,y:team===0?1:C.height-1});const aim=botHockey564(g,p);
  assert(aim);assert(Math.abs(Math.sin(aim.angle))>.99);assert(Math.abs(Math.cos(aim.angle))<.06);
 }
});
test('old clients cannot start updated hockey; server snapshots keep world positions for all four viewers',()=>{
 const f=room('pinball');assert.throws(()=>f.dispatch('p0',{op:'partyReady462',ready:true,ricochetVersion550:9}),/Build568/);
 f.start();f.tick(100);const g=f.g();assert.equal(g.rules550,10);
 const positions=g.players.map(p=>[p.x,p.y]);
 for(const p of g.players)assert.deepEqual(publicHockey564(g,p.playerId).players.map(p=>[p.x,p.y]),positions);
});
test('the real party menu admits the updated server and rejects the old version before sending a game change',()=>{
 for(const version of [9,10]){
  const sent=[],c={state:{ricochetVersion550:version,party:{hostId:'p0'}},transport:{selfId:'p0'},ready:()=>true,render:()=>{},raw:(...m)=>sent.push(m)};
  assert(partyClick462(c,{dataset:{partyGame462:'pinball'}}));
  if(version===10){assert.deepEqual(sent,[['partyGame462',{game:'pinball'}]]);assert.equal(c.error,'');}
  else{assert.equal(sent.length,0);assert.match(c.error,/Build568/);}
 }
});
