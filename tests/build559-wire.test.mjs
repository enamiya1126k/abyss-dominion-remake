import test from 'node:test';
import assert from 'node:assert/strict';
import {room559} from '../tools/build559/fixture.mjs';
import {queueHide536,hideSnapshot536} from '../online-server/src/HideCoordinator536.js';
const packet=(g,extra={})=>({op:'hideInput536',hideVersion536:6,gameId:g.id,kind:'input',seq:1,target:{x:800,y:700},...extra});
test('main coordinator advertises new hide protocol and streams four private views',()=>{
 const r=room559();r.advance(150);const frames=r.messages.filter(m=>m.type==='hideFrame536');assert.deepEqual(new Set(frames.map(m=>m.id)),new Set(['p0','p1','p2','p3']));
 for(const session of r.sessions.values()){const v=r.c.view(session);assert.equal(v.hideVersion536,6);assert.equal(v.cartVersion543,7);assert.equal(v.ricochetVersion550,6);assert.equal(v.hide.rulesVersion,6);assert.equal(v.hide.heist541.seals.length,5);assert.equal(v.hide.heist541.exits.length,2)}
 const hunter=frames.find(m=>m.selfId==='p0').hide;assert(hunter.players.slice(1).every(p=>p.x===undefined&&p.objectId===undefined));assert(hunter.heist541.seals.every(s=>s.progress===undefined));
});
test('queued actions bind to authenticated player, reject old protocol and stale sequence',()=>{
 const r=room559(),g=r.saved,s=r.sessions.get('p1');assert.equal(queueHide536(r.c,s,packet(g,{hideVersion536:5})),false);assert.equal(queueHide536(r.c,{playerId:'intruder'},packet(g)),false);
 r.raw('p1','hideInput536',{...packet(g),playerId:'p0',target:{x:1700,y:600}});r.advance(50);assert.equal(r.game.players[1].lastSeq,1);assert.equal(r.game.players[0].lastSeq,0);assert.equal(queueHide536(r.c,s,packet(g)),false);
 assert.equal(queueHide536(r.c,s,packet(g,{seq:2,target:{x:Infinity,y:0}})),false);assert.equal(queueHide536(r.c,s,packet(g,{seq:2,gameId:'old-match'})),false);assert(r.c.healthy());
});
test('old clients cannot ready and old active matches safely return to lobby',()=>{
 const r=room559({phase:'lobby'});r.raw('p0','partyReady462',{hideVersion536:5,ready:true});assert(r.messages.some(m=>m.type==='raceError451'&&m.message.includes('Build559')));
 const active=room559();active.saved.rulesVersion=5;active.advance(50);assert.equal(active.saved.phase,'lobby');assert.equal(active.saved.rulesVersion,6);assert(active.saved.migrationNote.includes('封印'));assert(active.party.members.every(m=>!m.ready));assert(!active.c.hideRuntime536?.has(active.saved.id));
});
test('disconnect hands control to AI and reconnect preserves objective progress and sequence',()=>{
 const r=room559();r.raw('p1','hideInput536',{...packet(r.saved),seq:9});r.advance(50);r.game.heist541.seals[0].progress=1400;r.sessions.get('p1').connected=false;r.advance(50);assert(r.game.players[1].auto);r.sessions.get('p1').connected=true;r.advance(50);const s=hideSnapshot536(r.c,r.saved,'p1');assert.equal(s.players[1].lastSeq,9);assert(!s.players[1].auto);assert(s.heist541.seals[0].progress>0);assert.equal(s.heist541.exits.length,2);
});
