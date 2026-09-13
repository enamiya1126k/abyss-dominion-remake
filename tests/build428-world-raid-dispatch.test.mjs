import {finish430} from '../tools/build430/offline-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {EventEmitter} from 'node:events';
import {RoomStore} from '../online-server/src/RoomStore.js';
import {WorldRaidCoordinator432} from '../online-server/src/WorldRaidCoordinator432.js';

// Run the actual server message dispatcher with in-memory sockets. This tests
// authentication/routing boundaries, not TCP, WebSocket framing or browsers.
test('actual server dispatcher allows authenticated background raids, rejects room entry, and persists a reconnect',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'world428-dispatch-'));
 try{
  class FakeSocket extends EventEmitter{constructor(){super();this.readyState=1;this.sent=[];}send(raw){this.sent.push(JSON.parse(raw));}close(){this.readyState=3;this.emit('close');}ping(){}terminate(){this.close();}}
  class FakeWss extends EventEmitter{}
  const env=Object.fromEntries(['FRIEND_STATE_FILE','GUILD_STATE_FILE','POWER_RANKING_STATE_FILE','SETTLEMENT_STATE_FILE','WORLD_RAID_STATE_FILE'].map(key=>[key,path.join(dir,key+'.json')]));
  const fakeHttp=new EventEmitter();fakeHttp.listen=()=>{};fakeHttp.close=()=>{};let health;
  const context={RoomStore,WorldRaidCoordinator432,http:{createServer:fn=>{health=fn;return fakeHttp;}},process:{env,on:()=>{}},WebSocketServer:FakeWss,WebSocket:{OPEN:1},URL,Date,JSON,Set,Map,console:{log:()=>{},warn:()=>{},error:()=>{}},setInterval:()=>({unref(){}}),clearInterval:()=>{},setTimeout:()=>({unref(){}}),clearTimeout:()=>{}};
  const source=fs.readFileSync('online-server/server.js','utf8').replace(/^import[^\n]*\n/gm,'').replace('export{server,store};','');
  vm.createContext(context);vm.runInContext(source+'\nglobalThis.exposed={wss,store,worldRaid};',context);const {wss,store,worldRaid}=context.exposed;worldRaid.random=()=>.5;
  const connect=()=>{const socket=new FakeSocket();wss.emit('connection',socket);return socket;},send=(socket,message)=>socket.emit('message',Buffer.from(JSON.stringify(message)));
  const anonymous=connect();send(anonymous,{type:'worldRaidStart'});assert.equal(anonymous.sent.at(-1).code,'NOT_READY');anonymous.close();
  const socket=connect(),hello={type:'hello',protocol:'1.17.0',friendId:'AD-AAAA-BBBB',clientKey:'dispatch-test-key-1234567890',backgroundOnly:true,profile:{displayName:'検証',speciesId:'slime',monsterName:'スライム',level:1000,battleStats:{hp:100000,mp:1000,atk:20000,matk:20000,def:1000,mdef:1000,spd:1000},skills:[]}};
  send(socket,hello);const ack=socket.sent.find(m=>m.type==='helloAck');assert.ok(ack);assert.equal(ack.capabilities.worldRaidV1,true);assert.equal(ack.capabilities.worldRaidRewardsV1,true);assert.equal(ack.capabilities.worldRaidOfflineV1,true);
  send(socket,{type:'worldRaidStatus'});const state=socket.sent.at(-1).state;assert.equal(state.remaining,3);
  const start={type:'worldRaidStart',requestId:'dispatch-request-0001',campaignId:state.campaign.id};send(socket,start);send(socket,start);assert.equal(socket.sent.at(-1).state.remaining,2);assert.ok(worldRaid.active(hello.friendId));
  send(socket,{type:'createRoom'});assert.equal(socket.sent.at(-1).code,'WORLD_RAID_ACTIVE');assert.equal(store.rooms.size,0);
  const attempt=worldRaid.snapshot(hello.friendId).attempt;socket.close();assert.equal(store.sessions.get(hello.friendId).connected,false);
  const resumed=connect();send(resumed,{...hello,resumeToken:ack.resumeToken});send(resumed,{type:'worldRaidStatus'});assert.equal(resumed.sent.at(-1).state.attempt.id,attempt.id);assert.equal(resumed.sent.at(-1).state.remaining,2);
  let healthCode,body;health({url:'/health'},{writeHead:c=>healthCode=c,end:s=>body=JSON.parse(s)});assert.equal(healthCode,200);assert.equal(body.persistence.worldRaid,true);
  send(resumed,{type:'worldRaidRetreat',attemptId:attempt.id,round:1});assert.equal(resumed.sent.at(-1).state.attempt.status,'ended');
  worldRaid.ledger.transact(s=>{s.current.hp=10;s.current.circle432.reviveUsed=true;return {ok:true};});send(resumed,{...start,requestId:'dispatch-second-429'});const second=worldRaid.snapshot(hello.friendId).attempt;send(resumed,{type:'worldRaidAuto',attemptId:second.id,round:1,enabled:false});send(resumed,{type:'worldRaidAction',attemptId:second.id,round:1,actorId:hello.friendId,kind:'attack',enemyTargetId:second.raid.boss.id});
  const reward=resumed.sent.filter(m=>m.type==='worldRaidRewards429'&&m.entries.length).at(-1).entries[0];assert.equal(reward.source.lastHit,true);send(resumed,{type:'worldRaidRanking429',sequence:1,requestId:'dispatch-rank-429'});assert.equal(resumed.sent.at(-1).mine.rank,1);send(resumed,{type:'worldRaidRewardAck429',rewardId:reward.rewardId});assert.equal(resumed.sent.at(-1).pending,0);send(resumed,{type:'worldRaidRewardList429'});assert.equal(resumed.sent.at(-1).entries.length,0);
  send(resumed,{type:'worldRaidReserve430',count:1,requestId:'dispatch-offline-430',campaignId:worldRaid.ledger.state.current.id});const ticket=resumed.sent.filter(m=>m.type==='worldRaidTickets430').at(-1).tickets.find(t=>t.status==='reserved');assert.ok(ticket);assert.equal(worldRaid.snapshot(hello.friendId).remaining,0);const replay=finish430(ticket);const upload={type:'worldRaidSubmit430',ticketId:ticket.id,commands:replay.commands};send(resumed,upload);send(resumed,upload);const receipt=resumed.sent.filter(m=>m.type==='worldRaidOfflineReceipt430').at(-1).receipt;assert.equal(receipt.damage,replay.damage);assert.equal(worldRaid.ledger.state.current.contribution[hello.friendId].damage,replay.damage);resumed.close();
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
