import {freezePlayer604,thaw604} from '../../src/runners587/Threats604.js';
import {event580} from '../../src/arcade580/Common580.js';
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
  for(let i=0;i<4;i++){assert.equal(frames.get('p'+i).selfId,'p'+i);assert.equal(frames.get('p'+i).runners.courseId,'coast');assert.equal(frames.get('p'+i).runners.rules587,14);assert(f.g().players[i].x>90+i*24);}
  const g=f.g(),p=g.players[0],friend=g.players[1];g.enemies=[];Object.assign(p,{x:250,y:300,vx:0,vy:0,weapon:'wind',ammo:8,attackHeld:false});Object.assign(friend,{x:310,y:300,vx:0,vy:0});
  assert(await send(0,{op:'runnersInput587',seq:2,round:1,action:'control',target:{axis:0,jump:false,attack:true}}));f.tick(75);assert(g.events.some(e=>e.type==='bump'));assert.equal(friend.deaths,0);assert(friend.alive);
  // New state crosses the same real four-client transport, including thaw.
  const frozen=g.players[3];frozen.invincibleUntil=0;freezePlayer604(g,frozen,event580);
  g.threats604.shots.push({id:999,kind:'cannon',x:1000,y:0,vx:-100,vy:0,r:15,born:g.elapsed,until:g.elapsed+3000});f.tick(75);await new Promise(r=>setTimeout(r,15));
  for(const frame of frames.values()){assert(frame.runners.players[3].frozenUntil604>frame.runners.elapsed);assert(frame.runners.threats604.shots.some(s=>s.id===999));}
  thaw604(g,frozen,event580);f.tick(75);await new Promise(r=>setTimeout(r,15));for(const frame of frames.values())assert.equal(frame.runners.players[3].frozenUntil604,0);
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
  assert.equal(wind.airJumps598,1);assert.equal(wind.ammo,5);assert(g.events.some(e=>e.type==='windjump'&&e.seat===2));
  const duet=course589(g).trials601[0];
  for(let i=0;i<2;i++)Object.assign(g.players[i],{x:duet.pads[i].x,y:duet.pads[i].y,vx:0,vy:0,axis:0,grounded:true,platformId:null,jumpHeld:false,jumpBufferUntil:0,bumpUntil:0,respawnAt:0});
  f.tick(650);assert(g.coop601[duet.id].open);
  Object.assign(p,{x:duet.reward.x,y:duet.reward.y+14,vx:0,vy:0,grounded:false,platformId:null});f.tick(75);await new Promise(r=>setTimeout(r,15));
  for(let i=0;i<4;i++){const world=frames.get('p'+i).runners;assert(world.coop601[duet.id].open);assert.equal(world.stars601.length,1);assert(world.players.every(q=>q.checkpoint===world.teamCheckpoint));}
  g.players.forEach(p=>{p.x=course589(g).goal;p.y=300;p.respawnAt=0;p.alive=true;p.bumpUntil=0;});f.tick(2000);assert.equal(g.phase,'result');assert(g.teamClear);
  assert(await send(0,{op:'partyResult490',partyId:f.p.id,gameId:g.id,kind:'again'}));assert.equal(f.g().phase,'lobby');assert.equal(f.g().courseId,'coast');assert(f.p.members.every(p=>!p.ready));
 }finally{clients.forEach(c=>c.close());await new Promise(r=>wss.close(r));await new Promise(r=>server.close(r));}
});
test('roster retains protocol 14 and rejects an old ready request',()=>{const f=room();assert(f.dispatch('p0',{op:'partyRoster462',roster:f.p.members[0].owned}));assert.equal(f.p.members[0].runnersVersion587,14);assert.throws(()=>f.dispatch('p0',{op:'partyReady462',ready:true,runnersVersion587:12}),/Build604/);});
test('host may leave in play; only the remaining humans count toward runner clear',()=>{const f=room();f.start();const g=f.g();assert(f.dispatch('p0',{op:'runnersInput587',seq:1,round:1,action:'control',target:{axis:1,jump:false,attack:true}}));assert(f.dispatch('p0',{op:'partyLeave462'}));assert.equal(f.p.hostId,'p1');assert.equal(f.a.find(f.c,'p0'),null);assert(!f.dispatch('p0',{op:'runnersInput587',seq:2,round:1,action:'control',target:{axis:1,jump:false,attack:true}}));f.tick(50);assert(g.players[0].departed);assert(!g.players[0].alive);assert.equal(g.players[0].auto,false);assert.equal(g.players[0].shots,0);if(g.boss600)g.boss600.hp=0;g.players.slice(1).forEach(p=>Object.assign(p,{x:course589(g).goal,y:300}));g.switches=course589(g).switches.map(s=>s.id);f.tick(1800);assert.equal(g.phase,'result');assert(g.teamClear);assert(!g.winnerIds.includes('p0'));});
test('last player exit cleans up both saved room and running simulation',()=>{const f=room();f.start();for(let i=0;i<4;i++)assert(f.dispatch('p'+i,{op:'partyLeave462'}));f.tick(50);assert(!f.c.data.parties462.TEST);assert.equal(f.c.data.runnersRooms580.TEST,undefined);assert.equal(f.c.runnersRuntime580.size,0);});

test('actual socket close/reopen retries foreground resume and retains the mid-air scene',async()=>{
 const {presence599}=await import('../../src/runners587/Resume599.js');
 const sockets=new Map(),server=http.createServer(),wss=new WebSocketServer({server});
 const f=room({send:(id,m)=>{const s=sockets.get(id);if(s?.readyState===1)s.send(JSON.stringify(m));}});f.start();for(let i=1;i<4;i++)f.c.sessions.get('p'+i).connected=false;
 const g=f.g(),p=g.players[0];g.enemies=[];Object.assign(p,{x:148,y:218,vy:180,vx:0,axis:0,grounded:false,platformId:null,weapon:'fire',deaths:3});
 const c={transport:{selfId:'p0',ws:null},runnersUI587:{seq:0},state:{runners:f.a.snapshot(f.c,f.saved(),'p0')},connected(){return this.transport.ws?.readyState===1;},ready(){return this.connected();},raw(op,m){if(!this.connected())return false;this.transport.ws.send(JSON.stringify({op,...m}));return true;}};
 const snapshot=s=>s.send(JSON.stringify({type:'runnersFrame587',selfId:'p0',serverNow:f.at,runners:f.a.snapshot(f.c,f.saved(),'p0')}));
 wss.on('connection',s=>{sockets.set('p0',s);f.c.sessions.get('p0').connected=true;s.on('message',b=>{f.dispatch('p0',JSON.parse(b));f.tick(25);snapshot(s);});s.on('close',()=>{if(sockets.get('p0')===s){sockets.delete('p0');f.c.sessions.get('p0').connected=false;}});snapshot(s);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const clients=[];
 const until=predicate=>new Promise((resolve,reject)=>{const start=Date.now(),poll=()=>{if(predicate())return resolve();if(Date.now()-start>2000)return reject(Error('resume timeout'));setTimeout(poll,5);};poll();});
 const open=async()=>{const s=new WebSocket('ws://127.0.0.1:'+server.address().port);clients.push(s);c.transport.ws=s;s.on('message',b=>{const m=JSON.parse(b);if(s!==c.transport.ws)return;c.state=m;presence599(c);});await new Promise((r,j)=>{s.once('open',r);s.once('error',j);});return s;};
 try{
  const first=await open();presence599(c,true,{force:true});await until(()=>c.state.runners.players[0].paused&&c.runnersUI587.presencePending599==null);
  const saved={x:p.x,y:p.y,vy:p.vy,elapsed:g.elapsed};const closed=new Promise(r=>first.once('close',r));first.close();await closed;await until(()=>!f.c.sessions.get('p0').connected);f.tick(1000);
  presence599(c,false,{force:true});assert.equal(g.elapsed,saved.elapsed);assert.equal(p.y,saved.y);
  await open();await until(()=>!c.state.runners.players[0].paused&&!c.state.runners.players[0].waiting&&c.runnersUI587.presencePending599==null);
  assert.equal(c.state.runners.id,g.id);assert.equal(p.x,saved.x);assert(Math.abs(p.y-saved.y)<8);assert.equal(p.weapon,'fire');assert.equal(p.deaths,3);assert.equal(p.respawnAt,0);
 }finally{clients.forEach(s=>s.terminate());await new Promise(r=>wss.close(r));await new Promise(r=>server.close(r));}
});

// Progress must survive a runtime reload immediately after the acquisition frame.
test('shared star and seal progress is saved on its event, without a one-second wait',()=>{
 const f=room();f.dispatch('p0',{op:'runners587',kind:'course',courseId:'coast'});f.start();const g=f.g(),trial=course589(g).trials601[0];g.enemies=[];
 for(let i=0;i<2;i++)Object.assign(g.players[i],{...trial.pads[i],vx:0,vy:0,axis:0,grounded:true,platformId:null,jumpHeld:false});
 f.tick(600);assert(f.saved().coop601[trial.id].open);
 const p=g.players[0];Object.assign(p,{x:trial.reward.x,y:trial.reward.y+14,vx:0,vy:0,grounded:false,platformId:null});f.tick(25);assert.equal(f.saved().stars601.length,1);
 const stars=[...g.stars601],cp=g.teamCheckpoint;f.c.runnersRuntime580.clear();f.tick(25);assert.deepEqual(f.g().stars601,stars);assert.equal(f.g().teamCheckpoint,cp);assert(f.g().coop601[trial.id].open);
});
