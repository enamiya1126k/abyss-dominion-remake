import test from 'node:test';import assert from 'node:assert/strict';
import {fixture430,reserve430,finish430} from '../tools/build430/offline-fixture.mjs';
import {WorldRaidOfflineClient430} from '../src/worldRaid/WorldRaidOfflineClient430.js';
import {WorldRaidClient430} from '../src/worldRaid/WorldRaidClient430.js';
import {worldRaidOfflineView430} from '../src/worldRaid/WorldRaidOfflineView430.js';
import {worldRaidRankingView429} from '../src/worldRaid/WorldRaidRankingView429.js';
import {SaveService} from '../src/services/SaveService.js';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};globalThis.WebSocket={OPEN:1};
function client(f,{initial=null,prepare=async()=>({reload:true})}={}){
 let bank=initial,writable=true;const sent=[],notices=[],updates=[],transport={selfId:f.a.playerId,profile:f.a.profile,connectionReady:true,ws:{readyState:1},capabilities:new Set(['worldRaidV1','worldRaidRewardsV1','worldRaidOfflineV1']),_handleMessage:()=>{},_notifyServerAvailability:()=>{},_send:(type,payload)=>{sent.push({type,...payload});return true;},startBackground:()=>{}};
 const bridge=new WorldRaidOfflineClient430({transport,getBank:()=>bank,setBank:b=>{if(!writable)return false;bank=structuredClone(b);return true;},now:f.now,prepare,toast:m=>notices.push(m),onUpdate:(id,events)=>updates.push({id,events})});transport.worldRaidOffline430=bridge;
 return {bridge,transport,sent,notices,updates,setWritable:v=>writable=v,bank:()=>bank};
}
async function deliverTickets(f,g){f.c.ticketList430(f.a);await g.bridge.receive(f.messages.at(-1));}
test('offline commands are saved before presentation; failed saves retain the previous recoverable battle',async()=>{
 const f=fixture430(),[t]=reserve430(f),g=client(f);await deliverTickets(f,g);g.transport.connectionReady=false;await g.bridge.start(t.id);const before=JSON.stringify(g.bank());g.setWritable(false);await assert.rejects(g.bridge.command(t.id,{kind:'advance',round:1}));assert.equal(JSON.stringify(g.bank()),before);g.setWritable(true);await g.bridge.command(t.id,{kind:'advance',round:1});assert.equal(g.bank().tickets[t.id].commands.length,1);assert.equal(g.sent.length,0);
});
test('reload resumes a partially played ticket and saves a completed result before attempting upload',async()=>{
 const f=fixture430(),[t]=reserve430(f),g=client(f);await deliverTickets(f,g);g.transport.connectionReady=false;await g.bridge.start(t.id);await g.bridge.command(t.id,{kind:'advance',round:1});
 const h=client(f,{initial:JSON.parse(JSON.stringify(g.bank()))});h.transport.connectionReady=false;assert.equal(h.bridge.active().ticket.id,t.id);const expected=h.bridge.view(t.id).damage;assert.ok(expected>=0);
 let steps=0;while(h.bridge.active()&&steps++<30){const v=h.bridge.view(t.id);await h.bridge.command(t.id,{kind:'advance',round:v.raid.round});}
 assert.equal(h.bank().tickets[t.id].phase,'pending');assert.equal(h.sent.length,0);h.transport.connectionReady=true;h.bridge.flush(true);const upload=h.sent.find(m=>m.type==='worldRaidSubmit430');assert.deepEqual(upload.commands,h.bank().tickets[t.id].commands);assert.equal(f.c.submit430(f.a,upload).ok,true);
});
test('receipt loss retries the same result, and a later ticket list recovers acknowledgement without duplicate damage',async()=>{
 const f=fixture430(),[t]=reserve430(f),g=client(f);await deliverTickets(f,g);const r=finish430(t),bank=g.bank();bank.tickets[t.id].phase='pending';bank.tickets[t.id].commands=r.commands;g.bridge.write(bank);g.bridge.flush(true);const upload=g.sent.at(-1);f.c.submit430(f.a,upload);const hp=f.c.ledger.state.current.hp;g.bridge.flush(true);assert.equal(f.c.submit430(f.a,g.sent.at(-1)).duplicate,true);assert.equal(f.c.ledger.state.current.hp,hp);await deliverTickets(f,g);assert.equal(g.bank().tickets[t.id].phase,'synced');assert.equal(g.bank().tickets[t.id].receipt.damage,r.damage);assert.equal(g.bank().tickets[t.id].ticket.initialRoom,undefined);
});
test('reservation request persists with its original profile; lost response resends the same request ID',async()=>{
 const f=fixture430(),g=client(f);await g.bridge.reserve(2,f.a.profile,f.c.ledger.state.current.id);const first=g.sent.find(m=>m.type==='worldRaidReserve430');assert.ok(first);assert.equal(f.c.reserve430(f.a,first).ok,true);
 const h=client(f,{initial:JSON.parse(JSON.stringify(g.bank()))});h.bridge.flush(true);const second=h.sent.find(m=>m.type==='worldRaidReserve430');assert.deepEqual(second,first);assert.equal(f.c.reserve430(f.a,second).duplicate,true);await deliverTickets(f,h);assert.equal(h.bank().pendingReserve,undefined);assert.equal(h.bridge.available().length,2);
});
test('failed offline data preparation cannot consume quota or send a reservation',async()=>{
 const f=fixture430(),g=client(f,{prepare:async()=>{throw new Error('cache unavailable');}});await assert.rejects(g.bridge.reserve(3,f.a.profile,f.c.ledger.state.current.id));assert.equal(g.sent.length,0);assert.equal(f.c.snapshot(f.a.playerId).remaining,3);assert.equal(g.bank()?.pendingReserve,undefined);
});
test('old sockets and other-account tickets cannot change the local ticket bank',async()=>{
 const f=fixture430();reserve430(f);const g=client(f);f.c.ticketList430(f.a);const m=f.messages.at(-1);g.transport._handleMessage(m,{});await g.bridge.queue;assert.equal(g.bank(),null);const foreign=structuredClone(m);foreign.tickets[0].playerId=f.b.playerId;await g.bridge.receive(foreign);assert.equal(g.bridge.available().length,0);
});
test('offline lobby keeps the real ticket quota and explains delayed reward finalization',async()=>{
 const f=fixture430(),[t]=reserve430(f,f.a,2),g=client(f);await deliverTickets(f,g);g.transport.connectionReady=false;const html=worldRaidOfflineView430(g.bridge,f.c.snapshot(f.a.playerId));assert.match(html,/取得から24時間/);assert.match(html,/この挑戦権で遊ぶ/);assert.match(html,/次ボスには加算しない/);assert.doesNotMatch(html,/data-world-reserve430/);await g.bridge.start(t.id);assert.match(worldRaidOfflineView430(g.bridge,f.c.snapshot(f.a.playerId)),/途中の挑戦を再開/);
});
test('native manual action, speed and auto controls route locally with no network connection',async()=>{
 const f=fixture430(),[t]=reserve430(f),g=client(f);await deliverTickets(f,g);const save=new SaveService(),screen=new WorldRaidClient430({transport:g.transport,getState:()=>save.state});await g.bridge.start(t.id);screen.localTicket430=t.id;g.transport.connectionReady=false;
 assert.equal(screen.sendBattle('battleAuto',{enabled:false}),true);await g.bridge.queue;assert.equal(screen.sendBattle('raidSpeed',{speed:2}),true);await g.bridge.queue;assert.equal(screen.sendBattle('raidAction',{kind:'attack',actorId:f.a.playerId,enemyTargetId:t.initialRoom.raid.boss.id}),true);await g.bridge.queue;
 assert.deepEqual(g.bank().tickets[t.id].commands.map(c=>c.kind),['auto','speed','action']);assert.equal(g.sent.length,0);
});
test('ticket bank and pending results survive native SaveService serialization',async()=>{
 const f=fixture430(),[t]=reserve430(f),g=client(f);await deliverTickets(f,g);const r=finish430(t),bank=g.bank();bank.tickets[t.id].phase='pending';bank.tickets[t.id].commands=r.commands;
 const save=new SaveService();save.state.onlineParty??={};save.state.onlineParty.worldRaidOffline430=bank;assert.equal(save.save(),true);const reload=new SaveService();reload.load();const data=reload.state.onlineParty.worldRaidOffline430;assert.equal(data.tickets[t.id].phase,'pending');assert.deepEqual(data.tickets[t.id].commands,r.commands);assert.equal(data.tickets[t.id].ticket.seed,t.seed);
});
test('expired tickets cannot start; replay after a lost terminal response stops retrying on receipt',async()=>{
 const f=fixture430(),[t]=reserve430(f),g=client(f);await deliverTickets(f,g);f.setNow(t.expiresAt);assert.equal(g.bridge.available().length,0);await assert.rejects(g.bridge.start(t.id));f.c.advance();await deliverTickets(f,g);assert.equal(g.bank().tickets[t.id].phase,'synced');assert.equal(g.bank().tickets[t.id].receipt.status,'expired');
});
test('provisional rankings clearly distinguish pending settlement from final rewards',()=>{
 const data={campaign:{sequence:1,bossName:'ボス',completedAt:1,provisional430:true,settlementDeadline430:Date.UTC(2026,8,15)},rows:[],mine:null,total:0,page:0,pageSize:20,latestSequence:2};const html=worldRaidRankingView429(data,{connected:true,supported:true});assert.match(html,/オフライン結果を集計中/);assert.match(html,/順位・報酬は仮集計/);assert.doesNotMatch(html,/討伐済み／順位確定/);
});
test('an expired paused battle does not block another still-valid reserved ticket',async()=>{
 const f=fixture430(),[old]=reserve430(f),g=client(f);await deliverTickets(f,g);await g.bridge.start(old.id);f.setNow(f.now()+3600000);const [next]=reserve430(f,f.a,1,'later-ticket-000001');await deliverTickets(f,g);f.setNow(old.expiresAt);g.transport.connectionReady=false;assert.equal(g.bridge.active(),null);await g.bridge.start(next.id);assert.equal(g.bridge.active().ticket.id,next.id);assert.match(worldRaidOfflineView430(g.bridge,f.c.snapshot(f.a.playerId)),/期限切れ：1件/);
});
