import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createRequire} from 'node:module';
import {room} from '../tools/build571/wire-fixture.mjs';
test('actual party readiness rejects Build570 clients and stores the new capability',()=>{
 const f=room();assert.throws(()=>f.dispatch('p0',{op:'partyReady462',ready:true,luckVersion571:0}),/Build571/);
 for(let i=0;i<4;i++){assert(f.dispatch('p'+i,{op:'partyReady462',ready:true}));assert.equal(f.p.members[i].luckVersion571,1);}
 f.p.members[2].luckVersion571=0;assert.throws(()=>f.dispatch('p0',{op:'luck511',kind:'start'}),/全員がBuild571/);
 f.p.members[2].luckVersion571=1;assert(f.dispatch('p0',{op:'luck511',kind:'start'}));assert.equal(f.g().itemRules571,1);
});
test('four real WebSocket clients select privately, resolve attack charges once and survive a JSON restart',async()=>{
 const require=createRequire(import.meta.url);let WebSocketServer,WebSocket;
 try{({WebSocketServer,WebSocket}=require('ws'));}catch{const b=require(require.resolve('playwright').replace(/playwright\/index\.js$/,'playwright-core/lib/utilsBundle.js'));WebSocketServer=b.wsServer;WebSocket=b.ws;}
 const f=room(),server=http.createServer(),wss=new WebSocketServer({server}),clients=[];let serial=0;
 wss.on('connection',(socket,request)=>{const id=new URL(request.url,'http://local').searchParams.get('id');socket.on('message',bytes=>{const m=JSON.parse(bytes);try{f.dispatch(id,m);socket.send(JSON.stringify({ack:m.requestId,state:f.view(id)}));}catch(e){socket.send(JSON.stringify({ack:m.requestId,error:e.message}));}})});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  for(let seat=0;seat<4;seat++){const ws=new WebSocket('ws://127.0.0.1:'+server.address().port+'/?id=p'+seat);clients.push(ws);await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j)});}
  const send=(seat,data)=>new Promise((resolve,reject)=>{const requestId=++serial,ws=clients[seat],timer=setTimeout(()=>reject(Error('socket timeout')),2500),listener=bytes=>{const m=JSON.parse(bytes);if(m.ack!==requestId)return;clearTimeout(timer);ws.off('message',listener);m.error?reject(Error(m.error)):resolve(m.state)};ws.on('message',listener);ws.send(JSON.stringify({...data,requestId}));});
  for(let i=0;i<4;i++)await send(i,{op:'partyReady462',ready:true});await send(0,{op:'luck511',kind:'start'});
  for(const [seat,p]of f.g().plan511[0].seats.entries())p.boxes[0]=[['lightning','hunter','vault','rocket'],['rocket','mile','anchor','combo'],['rocket','phoenix','pioneer','shield'],['echo','salvage','interest','resonance']][seat];
  f.g().players[0].loadout=[{id:'hunter',round:1}];f.tick();
  for(let i=0;i<4;i++){const state=await send(i,{op:'luck511',kind:'chest',index:0,round:1});assert.equal(state.hand,null);assert(!('plan511' in state));}
  f.tick();
  for(let i=0;i<4;i++){const state=await send(i,{op:'luck511',kind:'hand',index:0,round:1});assert.deepEqual(state.hand,f.g().plan511[0].seats[i].boxes[0]);}
  f.tick();assert.equal(f.g().history.length,1);assert.equal(f.g().event.rows[0].strikes,2);
  await send(0,{op:'luck511',kind:'hand',index:0,round:1});assert.equal(f.g().history.length,1);
  while(f.g().phase!=='settle')f.tick();f.c.data=JSON.parse(JSON.stringify(f.c.data));
  assert.equal(f.view('p0').players[0].strikes,2);assert.equal(f.view('p3').players[0].attackHits,2);assert.equal(f.view('spectator').hand,null);
 }finally{clients.forEach(c=>c.close());await new Promise(r=>wss.close(r));await new Promise(r=>server.close(r));}
});
