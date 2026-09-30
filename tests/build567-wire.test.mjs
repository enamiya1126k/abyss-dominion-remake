import test from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,readFileSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';
import {room567,flags} from '../tools/build567/wire-fixture.mjs';import {RaceCoordinator451} from '../online-server/src/RaceCoordinator451.js';
const strokes=(seq,at)=>[{seq,kind:'lift',at:at-35},{seq:seq+1,kind:'cut',at}];
test('swipe wire: new rooms require updated clients, owned chefs, host start and all-human readiness; empty seat is AI',()=>{
 const f=room567();assert.equal(f.g().controlVersion567,1);assert.equal(f.c.view(f.sessions.get('p0')).cabbageSwipe567,1);
 assert.throws(()=>f.dispatch('p0',{op:'partyReady462',ready:true,cabbageSwipe567:0}),/Build567/);
 assert.throws(()=>f.dispatch('p1',{op:'cabbage484',kind:'start'}),/部屋主/);
 assert.throws(()=>f.dispatch('p0',{op:'cabbage484',kind:'select',monsterId:'missing'}),/所持/);
 f.ready();f.party().members[2].cabbageSwipe567=0;assert.throws(()=>f.dispatch('p0',{op:'cabbage484',kind:'start'}),/Build567/);
 f.start();assert.equal(f.g().players.length,4);assert.equal(f.g().players.filter(p=>p.ai).length,1);assert.equal(f.g().phase,'playing');
});
test('swipe wire: original tap packets, wrong room/version, observers and disconnected sessions cannot score',()=>{
 const f=room567();f.start();f.tick(100);const id=f.g().id;
 for(const bad of [{gameId:'stale'},{cabbageSwipe567:0},{strokes:[{seq:1,side:'left',at:f.at}]}])f.dispatch('p0',{op:'cabbageStroke567',gameId:id,strokes:strokes(1,f.at),...bad});
 f.dispatch('p0',{op:'cabbageTap484',taps:[{seq:1,side:'left',at:f.at}]});
 f.sessions.get('p0').connected=false;f.dispatch('p0',{op:'cabbageStroke567',strokes:strokes(1,f.at)});f.sessions.get('p0').connected=true;
 f.c.handle({playerId:'outsider',connected:true},{...flags,op:'cabbageStroke567',gameId:id,strokes:strokes(1,f.at)});f.tick(250);assert.equal(f.g().players[0].score,0);assert.equal(f.g().players[0].lastSeq,0);
 const m={op:'cabbageStroke567',strokes:strokes(1,f.at)};f.dispatch('p0',m);f.dispatch('p0',m);f.tick(250);assert.equal(f.g().players[0].score,10);assert.equal(f.g().players[0].cuts,1);
});
test('swipe wire: stop penalties persist on disk; reconnect cannot replay a cut, and rematch uses swipe controls',()=>{
 const dir=mkdtempSync(join(tmpdir(),'cabbage567-'));try{
  const file=join(dir,'state.json'),f=room567(3,()=>{},file);f.start();const stop=f.g().windows.find(v=>v.kind==='stop');f.tick(stop.at+120-f.at);
  f.dispatch('p0',{op:'cabbageStroke567',strokes:strokes(1,f.at)});f.tick(250);assert.equal(f.g().players[0].score,-80);assert.equal(f.g().players[0].boardDamage,1);
  const saved=JSON.parse(readFileSync(file)).cabbageRooms484[f.g().code];assert.equal(saved.players[0].score,-80);assert.equal(saved.controlVersion567,1);
  const restored=new RaceCoordinator451({sessions:f.sessions,stateFile:file,now:()=>f.at,send:()=>{}});restored.handle(f.sessions.get('p0'),{...flags,op:'cabbageStroke567',gameId:f.g().id,strokes:strokes(1,f.at)});restored.advance();assert.equal(restored.view(f.sessions.get('p0')).cabbage.players[0].score,-80);
  f.tick(f.g().endAt+1200-f.at);assert.equal(f.g().phase,'result');const old=f.g().id;f.dispatch('p0',{op:'partyResult490',partyId:f.party().id,gameId:old,kind:'again'});assert.equal(f.g().controlVersion567,1);assert.equal(f.g().phase,'lobby');assert.notEqual(f.g().id,old);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('swipe wire: four real WebSocket clients deliver independent gestures and receive correct self-only acknowledgements',async()=>{
 const req=createRequire(import.meta.url);let WebSocketServer,WebSocket;try{({WebSocketServer,WebSocket}=req('ws'));}catch{const bundle=req(req.resolve('playwright').replace(/playwright\/index\.js$/,'playwright-core/lib/utilsBundle.js'));WebSocketServer=bundle.wsServer;WebSocket=bundle.ws;}
 const sockets=new Map(),server=http.createServer(),wss=new WebSocketServer({server}),clients=[];let serial=0;const f=room567(4,(id,m)=>sockets.get(id)?.send(JSON.stringify(m)));
 wss.on('connection',(socket,request)=>{const id=new URL(request.url,'http://local').searchParams.get('id');sockets.set(id,socket);socket.on('message',b=>{const m=JSON.parse(b);let error;try{f.dispatch(id,m);f.tick(250);}catch(e){error=e.message;}socket.send(JSON.stringify({ack:m.requestId,error,state:f.c.view(f.sessions.get(id))}));});});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{for(let i=0;i<4;i++){const ws=new WebSocket('ws://127.0.0.1:'+server.address().port+'/?id=p'+i);clients.push(ws);await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});}
  const send=(seat,m)=>new Promise((resolve,reject)=>{const requestId=++serial,ws=clients[seat],timer=setTimeout(()=>reject(Error('timeout')),2500),listener=b=>{const v=JSON.parse(b);if(v.ack!==requestId)return;clearTimeout(timer);ws.off('message',listener);v.error?reject(Error(v.error)):resolve(v.state);};ws.on('message',listener);ws.send(JSON.stringify({...m,requestId}));});
  for(let i=0;i<4;i++)await send(i,{op:'partyReady462',ready:true});await send(0,{op:'cabbage484',kind:'start'});f.tick(3600);
  for(let i=0;i<4;i++){const state=await send(i,{op:'cabbageStroke567',strokes:strokes(1,f.at)});assert.equal(state.cabbage.players[i].score,10);assert.equal(state.cabbage.players[i].lastSeq,2);assert(state.cabbage.players.filter(p=>p.playerId!=='p'+i).every(p=>p.lastSeq===undefined));}
  assert(f.g().players.every(p=>p.cuts===1));
 }finally{clients.forEach(c=>c.close());await new Promise(r=>wss.close(r));await new Promise(r=>server.close(r));}
});
