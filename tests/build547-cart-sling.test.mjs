import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../src/cart/Rules543.js';
import {pull547,pullLimit547} from '../src/cart/Sling547.js';
import {queueCart543,liveCart543,advanceCarts543,handleCart543} from '../online-server/src/CartCoordinator543.js';
const members=Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'仲間'+i,owned:[{id:'m'+i,speciesId:'slime'}],choice:{id:'m'+i,speciesId:'slime'}}));
export function fixture547(){
 let now=10000;const sent=[],g=R.makeCart543({id:'test547',code:'LOCAL',partyId:'party',hostId:'p0',now,members});R.startCart543(g,now,547);g.phase='play';g.roundAt=now;g.lastAt=now;
 const sessions=new Map(members.map(p=>[p.playerId,{playerId:p.playerId,connected:true}]));
 const party={id:'party',hostId:'p0',members:members.map(p=>({...p,cartVersion543:4,ready:true}))};
 const c={data:{cartRooms543:{LOCAL:g},parties462:{party}},sessions,subscribers:new Set(sessions.keys()),now:()=>now,transaction:fn=>fn(),broadcast(){},push(){},isBusy:()=>false,send:(id,m)=>sent.push({id,m})};
 return{c,g,party,sessions,sent,clock:value=>now=value,tick(ms=25){now+=ms;advanceCarts543(c)},live:()=>liveCart543(c,c.data.cartRooms543.LOCAL)};
}
const message=(g,extra={})=>({cartVersion543:4,gameId:g.id,round:g.round,seq:1,action:'shoot',power:.5,angle:0,...extra});
test('pull length controls power independent of hold time, bounded in CSS pixels',()=>{
 const metrics={width:390,height:560,xScale:32,yScale:13,skewX:0},start={x:100,y:100};
 assert.equal(pull547(start,{x:102,y:106},metrics).active,false);
 const short=pull547(start,{x:100,y:140},metrics),long=pull547(start,{x:100,y:190},metrics);
 assert(short.power<long.power);assert.equal(long.angle,0);assert.equal(pull547(start,{x:100,y:900},metrics).power,1);
 assert.equal(pull547(start,start,metrics).power,0);assert(pullLimit547(320,350)<=100);
});
test('launch direction is opposite finger after projection in every lane and aspect ratio',()=>{
 for(const [width,height]of [[320,445],[390,580],[504,347]])for(const x of [-2.7,-.9,.9,2.7])for(const [dx,dy]of [[30,60],[-30,60],[60,0],[-20,-55]]){
  const m={width,height,xScale:width*.82/8.8*(1-1.1/30*.56),yScale:height*.69/30,skewX:-x/8.8*width*.82*.56/30};
  const p=pull547({x:120,y:120},{x:120+dx,y:120+dy},m),vx=Math.sin(p.angle),vy=Math.cos(p.angle),sx=vx*m.xScale+vy*m.skewX,sy=-vy*m.yScale;
  assert(Math.abs((sx*dy-sy*dx)/Math.hypot(sx,sy)/Math.hypot(dx,dy))<1e-10);assert(sx*dx+sy*dy<0);
 }
});
test('a short and long hold with the same pull launch at identical velocity',()=>{
 const values=[];for(const duration of [100,6000]){const {g}=fixture547(),p=g.players[0];R.input543(g,p,'pull',0,.8,.42);g.elapsed=duration;assert(R.input543(g,p,'shoot',duration,.8,.42));values.push([p.vx,p.vy,p.power])}assert.deepEqual(values[0],values[1]);
});
test('return, cancellation, legacy release and repeated shot never accidentally launch',()=>{
 const {g}=fixture547(),p=g.players[0];R.input543(g,p,'pull',0,.2,.7);R.input543(g,p,'cancel',200);assert(!p.launched);assert.equal(p.pullPower547,0);
 assert.equal(R.input543(g,p,'release',300,.2,1),false);assert.equal(R.input543(g,p,'shoot',300,.2,0),false);
 assert(R.input543(g,p,'shoot',400,.4,.6));assert.equal(R.input543(g,p,'shoot',410,-.4,1),false);assert.equal(g.events.filter(e=>e.type==='launch').length,1);assert.equal(p.power,.6);
});
test('wire validates power, angle, version, ownership, round and sequence',()=>{
 for(const override of [{power:NaN},{power:Infinity},{power:'0.5'},{power:-1},{power:1.01},{power:0},{angle:NaN},{angle:Math.PI+.01},{angle:'0'},{cartVersion543:3},{round:2},{seq:0},{seq:1.1},{action:'release'}]){
  const f=fixture547();assert.equal(queueCart543(f.c,f.sessions.get('p0'),message(f.g,override)),false,JSON.stringify(override));
 }
 const f=fixture547();assert(queueCart543(f.c,f.sessions.get('p0'),message(f.g)));assert.equal(queueCart543(f.c,f.sessions.get('p0'),message(f.g)),false);f.tick();assert(f.live().players[0].launched);assert(!f.live().players[1].launched);
});
test('pull updates coalesce and release carries its own final power without depending on a last move packet',()=>{
 const f=fixture547(),s=f.sessions.get('p0');for(let seq=1;seq<=60;seq++)assert(queueCart543(f.c,s,message(f.g,{seq,action:'pull',power:.25})));
 assert.equal(f.c.cartRuntime543.get(f.g.id).inputs.get('p0').length,1);
 assert(queueCart543(f.c,s,message(f.g,{seq:61,power:.83,angle:-.9})));f.tick();const p=f.live().players[0];assert.equal(p.power,.83);assert.equal(p.aim545,-.9);assert.equal(f.live().events.filter(e=>e.type==='launch').length,1);
});
test('an on-time release survives the next simulation tick; deadline uses pull distance, not held seconds',()=>{
 const f=fixture547();f.g.elapsed=8475;f.g.lastAt=f.g.roundAt+8475;f.clock(f.g.roundAt+8499);
 assert(queueCart543(f.c,f.sessions.get('p0'),message(f.g,{power:.33})));f.tick(1);assert.equal(f.live().players[0].power,.33);
 const other=fixture547(),p=other.g.players[0];R.input543(other.g,p,'pull',100,0,.2);other.g.lastAt=other.g.roundAt+8475;other.clock(other.g.roundAt+8475);other.tick();assert.equal(other.live().players[0].power,.2);
 assert.equal(queueCart543(other.c,other.sessions.get('p1'),message(other.g)),false);
});
test('disconnect and home state reject inputs, and incompatible live rooms return to lobby',()=>{
 const f=fixture547();f.sessions.get('p0').connected=false;assert.equal(queueCart543(f.c,f.sessions.get('p0'),message(f.g)),false);f.sessions.get('p0').connected=true;f.party.members[0].atHome=true;assert.equal(queueCart543(f.c,f.sessions.get('p0'),message(f.g)),false);
 f.g.rules543=3;advanceCarts543(f.c);assert.equal(f.c.data.cartRooms543.LOCAL.phase,'lobby');assert(f.party.members.every(p=>!p.ready));
 assert.throws(()=>handleCart543(f.c,f.sessions.get('p0'),{op:'cart543',gameId:f.g.id,cartVersion543:3,kind:'start'}),/Build547/);
});
test('actual movement matches the guide on all five surfaces including backward and bank shots',()=>{
 for(let round=1;round<=5;round++)for(const angle of [-2.5,-.8,0,.5,2.5]){
  const {g}=fixture547();g.round=round;g.players=g.players.slice(0,1);const p=g.players[0],forecast=R.forecast544(g,p,.55,angle);
  assert(R.input543(g,p,'shoot',0,angle,.55));for(let i=0;i<600;i++){g.elapsed+=25;R.physics543(g)}
  assert(Math.abs(forecast.x-p.x)<1e-8);assert(Math.abs(forecast.y-p.y)<1e-8);assert.equal(forecast.fallen,p.fallenAt!=null);
 }
});
