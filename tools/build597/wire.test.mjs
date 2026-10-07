import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';
import {WebSocketServer,WebSocket} from '../../online-server/node_modules/ws/wrapper.mjs';
import {course589} from '../../src/runners587/Courses589.js';
import {room} from './wire-fixture.mjs';
test('four real WebSocket clients share course, movement, projectiles, friendly hit, reconnection and same-course replay',async()=>{
 const sockets=new Map(),server=http.createServer(),wss=new WebSocketServer({server}),frames=new Map(),f=room({send:(id,m)=>sockets.get(id)?.send(JSON.stringify(m))});let serial=0;
 wss.on('connection',(socket,req)=>{const id=new URL(req.url,'http://localhost').searchParams.get('id');sockets.set(id,socket);socket.on('message',bytes=>{const m=JSON.parse(bytes);let accepted,error;try{accepted=f.dispatch(id,m);f.tick(25);}catch(e){error=e.message;}socket.send(JSON.stringify({ack:m.requestId,accepted,error}));});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const clients=[];
 try{
  for(let i=0;i<4;i++){const id='p'+i,ws=new WebSocket('ws://127.0.0.1:'+server.address().port+'/?id='+id);clients.push(ws);ws.on('message',bytes=>{const m=JSON.parse(bytes);if(m.type==='runnersFrame587')frames.set(id,m);});await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});}
  const send=(seat,data)=>new Promise((resolve,reject)=>{const id=++serial,ws=clients[seat],timer=setTimeout(()=>reject(Error('WebSocket timeout')),2000),listen=bytes=>{const m=JSON.parse(bytes);if(m.ack!==id)return;clearTimeout(timer);ws.off('message',listen);m.error?reject(Error(m.error)):resolve(m.accepted);};ws.on('message',listen);ws.send(JSON.stringify({...data,requestId:id}));});
  await send(0,{op:'runners587',kind:'course',courseId:'coast'});
  for(let i=0;i<4;i++)assert(await send(i,{op:'partyReady462',ready:true}));
  assert(await send(0,{op:'runners587',kind:'start'}));f.tick(3050);
  for(let i=0;i<4;i++)assert(await send(i,{op:'runnersInput587',seq:1,round:1,action:'control',target:{axis:1,jump:i===2,attack:false}}));
  f.tick(150);await new Promise(r=>setTimeout(r,15));assert.equal(frames.size,4);
  for(let i=0;i<4;i++){assert.equal(frames.get('p'+i).selfId,'p'+i);assert.equal(frames.get('p'+i).runners.courseId,'coast');assert.equal(frames.get('p'+i).runners.rules587,7);assert(f.g().players[i].x>90+i*24);}
  const g=f.g(),p=g.players[0],friend=g.players[1];g.enemies=[];Object.assign(p,{x:250,y:300,vx:0,vy:0,weapon:'wind',ammo:8,attackHeld:false});Object.assign(friend,{x:310,y:300,vx:0,vy:0});
  assert(await send(0,{op:'runnersInput587',seq:2,round:1,action:'control',target:{axis:0,jump:false,attack:true}}));f.tick(75);assert(g.events.some(e=>e.type==='bump'));assert.equal(friend.deaths,0);assert(friend.alive);
  f.c.sessions.get('p2').connected=false;f.tick(100);assert(!g.players[2].auto);assert(g.players[2].waiting);f.c.sessions.get('p2').connected=true;f.tick(25);assert(!g.players[2].auto);assert(!g.players[2].waiting);
  const wall=course589(g).walls.find(w=>w.breakable&&w.id.endsWith('-box2'));
  g.players.forEach(q=>Object.assign(q,{x:wall.x-180,y:300,vx:0,vy:0,axis:0,attackHeld:false,jumpHeld:false,bumpUntil:0,alive:true,respawnAt:0}));
  Object.assign(p,{x:wall.x-60,weapon:'fire',ammo:5,facing:1,shotAt:0});
  assert(await send(0,{op:'runnersInput587',seq:3,round:1,action:'control',target:{axis:0,jump:false,attack:true}}));f.tick(325);
  assert(await send(0,{op:'runnersInput587',seq:4,round:1,action:'control',target:{axis:0,jump:false,attack:true}}));f.tick(125);
  assert(await send(0,{op:'runnersInput587',seq:5,round:1,action:'control',target:{axis:0,jump:false,attack:false}}));
  assert(g.broken.includes(wall.id));f.tick(75);await new Promise(r=>setTimeout(r,15));
  for(let i=0;i<4;i++)assert(frames.get('p'+i).runners.broken.includes(wall.id));
  const wind=g.players[2];Object.assign(wind,{x:100,y:300,vx:0,vy:0,grounded:true,lastGroundAt:f.at,weapon:'wind',ammo:5,jumpHeld:false,airJumpUsed:false});
  assert(await send(2,{op:'runnersInput587',seq:2,round:1,action:'control',target:{axis:0,jump:true,attack:false}}));f.tick(200);
  assert(await send(2,{op:'runnersInput587',seq:3,round:1,action:'control',target:{axis:0,jump:false,attack:false}}));
  assert(await send(2,{op:'runnersInput587',seq:4,round:1,action:'control',target:{axis:0,jump:true,attack:false}}));f.tick(75);
  assert(wind.airJumpUsed);assert.equal(wind.ammo,5);assert(g.events.some(e=>e.type==='windjump'&&e.seat===2));
  g.players.forEach(p=>{p.x=course589(g).goal;p.y=300;p.respawnAt=0;p.alive=true;p.bumpUntil=0;});f.tick(2000);assert.equal(g.phase,'result');assert(g.teamClear);
  assert(await send(0,{op:'partyResult490',partyId:f.p.id,gameId:g.id,kind:'again'}));assert.equal(f.g().phase,'lobby');assert.equal(f.g().courseId,'coast');assert(f.p.members.every(p=>!p.ready));
 }finally{clients.forEach(c=>c.close());await new Promise(r=>wss.close(r));await new Promise(r=>server.close(r));}
});
test('roster retains protocol 7 and rejects an old ready request',()=>{const f=room();assert(f.dispatch('p0',{op:'partyRoster462',roster:f.p.members[0].owned}));assert.equal(f.p.members[0].runnersVersion587,7);assert.throws(()=>f.dispatch('p0',{op:'partyReady462',ready:true,runnersVersion587:6}),/Build597/);});
