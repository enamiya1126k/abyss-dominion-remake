import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {WorldRaidCoordinator430} from '../online-server/src/WorldRaidCoordinator430.js';
import {WorldRaidCoordinator429} from '../online-server/src/WorldRaidCoordinator429.js';
import {sanitizeProfile} from '../online-server/src/RoomStore.js';
import {WorldRaidReplay430,replayOffline430} from '../src/worldRaid/WorldRaidReplay430.js';
import {fixture430,reserve430,finish430} from '../tools/build430/offline-fixture.mjs';
function killOnline(f,who=f.b){f.c.ledger.transact(s=>{s.current.hp=1;return {ok:true};});assert.equal(f.c.start(who,{requestId:'kill-online-000001',campaignId:f.c.ledger.state.current.id}).ok,true);const a=f.c.active(who.playerId);f.c.auto(who,{attemptId:a.id,round:1,enabled:false});assert.equal(f.c.action(who,{attemptId:a.id,round:1,kind:'attack',actorId:who.playerId,enemyTargetId:a.room.raid.boss.id}).ok,true);}

test('online attempts and reserved tickets use the same 3-per-day quota; retries do not reserve twice',()=>{
 const f=fixture430();const t=reserve430(f,f.a,2);assert.equal(f.c.snapshot(f.a.playerId).remaining,1);reserve430(f,f.a,2);assert.equal(f.c._tickets430().length,2);
 assert.equal(f.c.start(f.a,{requestId:'online-after-reserve',campaignId:t[0].campaignId}).ok,true);assert.equal(f.c.snapshot(f.a.playerId).remaining,0);f.c.retreat(f.a,{attemptId:f.c.active(f.a.playerId).id,round:1});assert.equal(f.c.reserve430(f.a,{count:1,requestId:'one-more-0000000000',campaignId:t[0].campaignId}).code,'WORLD_RAID_LIMIT');
});
test('JST midnight resets only the new day; old tickets remain charged to their issue day',()=>{
 const f=fixture430();reserve430(f,f.a,3);f.setNow(Date.UTC(2026,8,14,15));assert.equal(f.c.snapshot(f.a.playerId).remaining,3);reserve430(f,f.a,3,'next-day-000000001');assert.equal(f.c._tickets430().length,6);assert.deepEqual(Object.values(f.c.ledger.state.days).map(d=>d[f.a.playerId]),[3,3]);
});
test('reservation persistence failure changes neither quota nor tickets; same request succeeds on retry',()=>{
 const f=fixture430(),before=JSON.stringify(f.c.ledger.state),m={count:3,requestId:'reserve-fail-0000001',campaignId:f.c.ledger.state.current.id};f.setWritable(false);assert.equal(f.c.reserve430(f.a,m).ok,false);assert.equal(JSON.stringify(f.c.ledger.state),before);f.setWritable(true);assert.equal(f.c.reserve430(f.a,m).ok,true);assert.equal(f.c._tickets430().length,3);
});
test('manual and automatic offline combat replay identically after JSON checkpoint reload',()=>{
 const f=fixture430(),[t]=reserve430(f);for(const manual of [false,true]){const r=finish430(t,{manual}),replayed=replayOffline430(t,JSON.parse(JSON.stringify(r.commands)));assert.equal(replayed.damage,r.damage);assert.deepEqual(replayed.snapshot(),r.snapshot());assert.ok(r.room.raid.round<=10&&r.room.raid.round>=6);assert.ok(r.damage>0);}
});
test('result values and forged roster are ignored; only replayed commands determine accepted damage',()=>{
 const f=fixture430(),[t]=reserve430(f),r=finish430(t),hp=f.c.ledger.state.current.hp;const result=f.c.submit430(f.a,{ticketId:t.id,commands:r.commands,damage:999999999999999,initialRoom:{},seed:123});assert.equal(result.ok,true);assert.equal(result.receipt.damage,r.damage);assert.equal(f.c.ledger.state.current.hp,hp-r.damage);assert.equal(f.c.snapshot(f.a.playerId).remaining,2);
});
test('duplicate uploads including concurrent arrivals settle a ticket exactly once',async()=>{
 const f=fixture430(),[t]=reserve430(f),r=finish430(t),m={ticketId:t.id,commands:r.commands},hp=f.c.ledger.state.current.hp;const result=await Promise.all([Promise.resolve().then(()=>f.c.submit430(f.a,m)),Promise.resolve().then(()=>f.c.submit430(f.a,m))]);assert.equal(result[1].duplicate,true);assert.equal(f.c.ledger.state.current.hp,hp-r.damage);assert.equal(f.c.ledger.state.current.contribution[f.a.playerId].attempts,1);
});
test('another account, unknown tickets, incomplete battle and invalid commands cannot affect the ledger',()=>{
 const f=fixture430(),[t]=reserve430(f),before=JSON.stringify(f.c.ledger.state);for(const [who,m]of [[f.b,{ticketId:t.id,commands:[]}],[f.a,{ticketId:'fake'}],[f.a,{ticketId:t.id,commands:[]}],[f.a,{ticketId:t.id,commands:[{kind:'advance',round:100}]}]])assert.equal(f.c.submit430(who,m).ok,false);assert.equal(JSON.stringify(f.c.ledger.state),before);
});
test('submit persistence failure rolls back HP, contribution, ticket receipt and rewards',()=>{
 const f=fixture430(),[t]=reserve430(f),r=finish430(t),before=JSON.stringify(f.c.ledger.state);f.setWritable(false);assert.equal(f.c.submit430(f.a,{ticketId:t.id,commands:r.commands}).ok,false);assert.equal(JSON.stringify(f.c.ledger.state),before);f.setWritable(true);assert.equal(f.c.submit430(f.a,{ticketId:t.id,commands:r.commands}).ok,true);
});
test('late results rank on the original killed boss; next HP and original last-hit bonus remain intact',()=>{
 const f=fixture430(),[t]=reserve430(f),r=finish430(t);killOnline(f);const old=f.c.ledger.state.history[0];assert.ok(old.closing430);assert.equal(Object.keys(f.c.ledger.state.rewards429).length,0);const nextHp=f.c.ledger.state.current.hp;
 f.c.ranking429(f.a,{sequence:1});assert.equal(f.messages.at(-1).campaign.provisional430,true);
 const received=f.c.submit430(f.a,{ticketId:t.id,commands:r.commands});assert.equal(received.receipt.late,true);assert.equal(received.receipt.lastHit,false);assert.equal(f.c.ledger.state.current.hp,nextHp);const awards=Object.values(f.c.ledger.state.rewards429);assert.equal(awards.length,2);assert.equal(awards.find(a=>a.source.lastHit).playerId,f.b.playerId);assert.equal(awards.find(a=>a.playerId===f.a.playerId).source.rank,1);assert.ok(f.c.ledger.state.history[0].settlement429);
});
test('all outstanding tickets must settle or expire before rank rewards are fixed',()=>{
 const f=fixture430(),[a,b]=reserve430(f,f.a,2);killOnline(f);const r=finish430(a);f.c.submit430(f.a,{ticketId:a.id,commands:r.commands});assert.equal(Object.keys(f.c.ledger.state.rewards429).length,0);f.setNow(b.expiresAt);f.c.advance();assert.ok(f.c.ledger.state.history[0].settlement429);assert.equal(f.c.ledger.state.offline430.tickets[b.id].status,'expired');assert.equal(Object.keys(f.c.ledger.state.rewards429).length,2);
});
test('expired uploads cannot change finalized ranks or get last-hit rewards; quota stays consumed',()=>{
 const f=fixture430(),[t]=reserve430(f),r=finish430(t);killOnline(f);f.setNow(t.expiresAt+1);f.c.advance();const before=JSON.stringify(f.c.ledger.state.rewards429),hp=f.c.ledger.state.current.hp;const received=f.c.submit430(f.a,{ticketId:t.id,commands:r.commands});assert.equal(received.receipt,undefined);assert.equal(f.messages.at(-1).receipt.status,'expired');assert.equal(f.c.ledger.state.current.hp,hp);assert.equal(JSON.stringify(f.c.ledger.state.rewards429),before);assert.equal(f.c.ledger.state.days[t.day][f.a.playerId],1);
});
test('an offline finishing blow transitions boss once and waits for other outstanding tickets',()=>{
 const f=fixture430();f.c.ledger.state.current.hp=1;const [a]=reserve430(f),[b]=reserve430(f,f.b,1,'other-ticket-000001');f.c.submit430(f.a,{ticketId:a.id,commands:finish430(a).commands});assert.equal(f.c.ledger.state.current.sequence,2);assert.equal(f.c.ledger.state.history[0].killerId,f.a.playerId);f.c.submit430(f.b,{ticketId:b.id,commands:finish430(b).commands});const awards=Object.values(f.c.ledger.state.rewards429);assert.equal(awards.length,2);assert.equal(awards.filter(a=>a.source.lastHit).length,1);
});
test('server restart preserves tickets, seed, pending settlement and one-time result receipts',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'offline430-'));try{const file=path.join(dir,'raid.json'),f=fixture430({stateFile:file}),[t]=reserve430(f),r=finish430(t);killOnline(f);
 let c=new WorldRaidCoordinator430({stateFile:file,sessions:f.sessions,now:f.now});assert.equal(c.healthy(),true);assert.ok(c.ledger.state.history[0].closing430);assert.equal(Object.keys(c.ledger.state.rewards429).length,0);assert.equal(c.submit430(f.a,{ticketId:t.id,commands:r.commands}).ok,true);c=new WorldRaidCoordinator430({stateFile:file,sessions:f.sessions,now:f.now});assert.equal(c.healthy(),true);assert.equal(c.submit430(f.a,{ticketId:t.id,commands:r.commands}).duplicate,true);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('existing Build429 final rewards stay frozen during upgrade',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'upgrade430-'));try{const file=path.join(dir,'raid.json'),f=fixture430({stateFile:file});killOnline(f);const before=JSON.stringify(f.c.ledger.state.rewards429),c=new WorldRaidCoordinator430({stateFile:file,sessions:f.sessions,now:f.now});assert.equal(JSON.stringify(c.ledger.state.rewards429),before);assert.ok(new WorldRaidCoordinator429({stateFile:file,sessions:f.sessions,now:f.now}).healthy());}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
