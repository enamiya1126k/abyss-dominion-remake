import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture430,reserve430} from '../tools/build430/offline-fixture.mjs';
import {WorldRaidOfflineClient430} from '../src/worldRaid/WorldRaidOfflineClient430.js';
import {WorldRaidClient430} from '../src/worldRaid/WorldRaidClient430.js';
import {SaveService} from '../src/services/SaveService.js';

const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};globalThis.WebSocket={OPEN:1};
function setup(f){
 let bank=null,screen;
 const transport={selfId:f.a.playerId,profile:f.a.profile,connectionReady:true,ws:{readyState:1},capabilities:new Set(['worldRaidV1','worldRaidRewardsV1','worldRaidOfflineV1']),_handleMessage:()=>{},_notifyServerAvailability:()=>{},_send:()=>true,startBackground:()=>{}};
 const offline=new WorldRaidOfflineClient430({transport,getBank:()=>bank,setBank:b=>{bank=structuredClone(b);return true;},now:f.now,onUpdate:(id,events)=>screen?.offlineUpdated(id,events)});
 transport.worldRaidOffline430=offline;const save=new SaveService();screen=new WorldRaidClient430({transport,getState:()=>save.state});
 return {screen,offline,transport,bank:()=>bank};
}
function startOnline(f){assert.equal(f.c.start(f.a,{requestId:'screen-online-431001',campaignId:f.c.ledger.state.current.id}).ok,true);return f.c.snapshot(f.a.playerId);}
test('ticket acknowledgement updates the quota used by the screen immediately',()=>{
 const f=fixture430(),g=setup(f);g.screen.receive({state:f.c.snapshot(f.a.playerId)});reserve430(f);f.c.ticketList430(f.a);g.offline.receive(f.messages.at(-1));
 assert.equal(g.screen.state.remaining,2);assert.equal(g.screen.onlineState430.remaining,2);
});
test('an unrelated offline bank update cannot roll an active online battle back to the cached lobby',()=>{
 const f=fixture430(),g=setup(f);g.screen.receive({state:f.c.snapshot(f.a.playerId)});const active=startOnline(f);g.screen.receive({state:active});g.screen.offlineUpdated();
 assert.equal(g.screen.state.attempt?.id,active.attempt.id);assert.equal(g.screen.state.attempt.status,'active');assert.equal(g.screen.presentation.roomState.raid.round,active.attempt.raid.round);
});
test('reopening a cached online battle restores the native presentation state as well as its header',()=>{
 const f=fixture430(),g=setup(f),active=startOnline(f);g.offline.cacheState(active);g.screen.offlineUpdated();
 assert.equal(g.screen.state.attempt.id,active.attempt.id);assert.equal(g.screen.presentation.roomState?.roomId,active.attempt.id);assert.equal(g.screen.presentation.selectedTarget.raid,active.attempt.raid.boss.id);
});
test('an old status packet cannot overwrite the accepted online state or durable cache',()=>{
 const f=fixture430(),g=setup(f),old=f.c.snapshot(f.a.playerId),active=startOnline(f);g.screen.receive({state:active});g.screen.receive({state:old});
 assert.equal(g.screen.onlineState430.revision,active.revision);assert.equal(g.bank().cachedState.revision,active.revision);g.screen.offlineUpdated();assert.equal(g.screen.state.attempt.id,active.attempt.id);
});
test('a delayed ticket-list snapshot cannot replace a newer battle, but still delivers its ticket',()=>{
 const f=fixture430(),g=setup(f),[t]=reserve430(f);f.c.ticketList430(f.a);const list=structuredClone(f.messages.at(-1)),active=startOnline(f);g.screen.receive({state:active});g.offline.receive(list);
 assert.ok(g.bank().tickets[t.id]);assert.equal(g.bank().cachedState.revision,active.revision);assert.equal(g.screen.state.attempt.id,active.attempt.id);
});
