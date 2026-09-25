import test from 'node:test';
import assert from 'node:assert/strict';
import * as H from '../src/hide/Rules536.js';
import * as E from '../src/hide/Heist541.js';
import {objective559,alarmTarget559} from '../src/hide/Tactics559.js';
import {free537,path537} from '../src/hide/Map537.js';
const members=Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'仲間'+i,choice:{speciesId:'slime'}}));
function game(seed=559){const g=H.makeHide536({id:'h',code:'H',hostId:'p0',members});g.role='hunter';H.startHide536(g,0,seed);g.phase='play';g.lastAt=g.startAt;g.elapsed=0;return g}
function work(g,ms){for(let n=0;n<ms&&g.phase==='play';n+=50){const dt=Math.min(50,ms-n);g.elapsed+=dt;g.lastAt=g.startAt+g.elapsed;E.tickHeist541(g,dt,H.finishHide536)}}
const place=(p,q)=>Object.assign(p,{x:q.x,y:q.y,moving:false});
function unlock(g,n=3){for(const s of g.heist541.seals.slice(0,n)){s.done=true;s.progress=8000}}
test('five distinct seals and two distant exits remain reachable through generated estates',()=>{
 for(const seed of [1,2,3,7,13,22,540,559]){const g=game(seed),h=g.heist541;assert.equal(g.rulesVersion,6);assert.equal(h.seals.length,5);assert.equal(h.exits.length,2);assert.equal(new Set(h.seals.map(s=>s.room)).size,5);assert(Math.hypot(h.exits[0].x-h.exits[1].x,h.exits[0].y-h.exits[1].y)>3000);for(const q of [...h.seals,...h.exits,h.cage]){assert(free537(g.map,q.x,q.y));assert(path537(g.map,g.map.spawn,q).length,seed+': unreachable objective')}}
});
for(const count of [1,2,3])test(count+' workers require '+(count===1?8:6)+' seconds; third worker cannot multiply the rate',()=>{
 const g=game(),s=g.heist541.seals[0],duration=count===1?8000:6000;g.players.slice(1,count+1).forEach(p=>place(p,s));work(g,duration-50);assert(!s.done);work(g,50);assert(s.done);assert.equal(s.progress,8000);
});
test('movement interrupts work; partial progress decays and completed seals stay unlocked',()=>{
 const g=game(),p=g.players[1],s=g.heist541.seals[0];place(p,s);p.moving=true;work(g,1000);assert.equal(s.progress,0);p.moving=false;work(g,2000);assert.equal(s.progress,2000);place(p,g.map.spawn);work(g,1000);assert.equal(s.progress,1700);place(p,s);work(g,6300);assert(s.done);place(p,g.map.spawn);work(g,20000);assert.equal(s.progress,8000);
});
test('room alarm starts at three seconds, preserves feints, and contains no player identity',()=>{
 const g=game(),p=g.players[1],s=g.heist541.seals[0];place(p,s);work(g,2950);assert.equal(g.events.filter(e=>e.type==='alarm559').length,0);work(g,50);const event=g.events.find(e=>e.type==='alarm559');assert.equal(event.at,3000);assert.equal(event.seal,s.id);for(const key of ['x','y','playerId','objectId','seat'])assert(!(key in event));place(p,g.map.spawn);work(g,1000);assert(s.alarmUntil>g.elapsed);work(g,6000);assert(s.alarmUntil<=g.elapsed);
});
test('short repeated stops cannot conceal a partly completed seal indefinitely',()=>{
 const g=game(),p=g.players[1],s=g.heist541.seals[0];place(p,s);work(g,2000);place(p,g.map.spawn);work(g,500);place(p,s);work(g,1000);assert(g.events.some(e=>e.type==='alarm559'));
});
test('three of any five unlock both gates and remaining seals cannot add a fourth completion',()=>{
 const g=game(),p=g.players[1];for(const i of [1,3,4]){place(p,g.heist541.seals[i]);work(g,8000)}assert(E.gatesOpen559(g.heist541));assert.equal(g.events.filter(e=>e.type==='gates559').length,1);place(p,g.heist541.seals[0]);work(g,10000);assert.equal(g.heist541.seals.filter(s=>s.done).length,3);assert(!g.heist541.seals.some(s=>s.alarmUntil>g.elapsed));
});
test('simultaneous completion closes the objective phase at exactly three',()=>{
 const g=game();unlock(g,2);for(const [i,p] of g.players.slice(1,3).entries()){const s=g.heist541.seals[i+2];s.progress=7950;place(p,s)}work(g,50);assert.equal(g.heist541.seals.filter(s=>s.done).length,3);assert.equal(g.events.filter(e=>e.type==='gates559').length,1);
});
for(const id of ['west','east'])test(id+' gate is locked until three seals and then wins for the team',()=>{
 const g=game(),p=g.players[1],gate=g.heist541.exits.find(e=>e.id===id);place(p,gate);work(g,100);assert.equal(g.phase,'play');unlock(g);work(g,50);assert.equal(g.reason,'escape');assert.equal(g.winnerIds.length,3);assert.equal(g.results.find(r=>r.playerId==='p1').exit,id);assert.equal(g.results.filter(r=>r.escaped).length,1);assert.equal(g.results.filter(r=>r.survived).length,3);
});
test('alive hiders still lose at the deadline, even when all required seals are open',()=>{
 for(const opened of [false,true]){const g=game();if(opened)unlock(g);g.elapsed=179950;g.lastAt=g.startAt+g.elapsed;H.advanceHide536(g,g.endAt);assert.equal(g.winningSide,'hunter');assert.equal(g.reason,'locked');assert.equal(g.results.filter(r=>r.escaped).length,0);assert.equal(g.results.filter(r=>r.survived).length,3)}
});
test('hunter snapshots hide progress, work timers and unseen identities after an alarm',()=>{
 const g=game(),s=g.heist541.seals[0];place(g.players[1],s);place(g.players[0],g.heist541.exits[0]);work(g,3500);const hunter=H.publicHide536(g,'p0'),hider=H.publicHide536(g,'p1');assert(hunter.heist541.seals[0].alarmUntil>g.elapsed);for(const key of ['progress','workMs','nextAlarmAt'])assert(!(key in hunter.heist541.seals[0]));assert.equal(hunter.players[1].x,undefined);assert.equal(hunter.players[1].objectId,undefined);assert.equal(hider.heist541.seals[0].progress,3500);
});
test('hunter responds to room alarms without reading hidden hider positions or progress',()=>{
 const g=game(),h=g.players[0],s=g.heist541.seals[2];s.alarmUntil=9000;const other=structuredClone(g);other.players[1].x=100;other.players[1].y=100;other.heist541.seals[2].progress=7999;assert.deepEqual(objective559(g,h),objective559(other,other.players[0]));assert.equal(objective559(g,h).key,'alarm:2');assert.equal(alarmTarget559(g,h,[]),null);
});
test('alarm investigation may target an ordinary visible decoy; no omniscient identity lookup',()=>{
 const g=game(),s=g.heist541.seals[0],h=g.players[0];s.alarmUntil=9000;place(h,s);const decoy={id:'ordinary',x:s.x+70,y:s.y,kind:1,checked:false};assert.equal(alarmTarget559(g,h,[decoy]).id,'ordinary');decoy.checked=true;assert.equal(alarmTarget559(g,h,[decoy]),null);
});
test('guarded seal and gate have alternatives for an informed hider',()=>{
 const g=game(),p=g.players[1],h=g.players[0];g.map={width:4800,height:4400,cells:Array(48*44).fill(5),decor:[]};const guarded=g.heist541.seals[0];place(h,guarded);place(p,{x:h.x+350,y:h.y});assert.notEqual(objective559(g,p).id,guarded.id);unlock(g);place(h,g.heist541.exits[0]);place(p,{x:h.x+350,y:h.y});assert.equal(objective559(g,p).id,'east');
});
test('rescue still works once per prisoner and captures can still win before escape',()=>{
 const g=game(),p=g.players[1],q=g.players[2],king=g.players[0];p.alive=false;place(q,g.heist541.cage);place(king,g.heist541.exits[1]);work(g,2800);assert(p.alive&&p.rescued541);assert.equal(q.rescues559,1);p.alive=false;work(g,3000);assert(!p.alive);
});
test('serialized partial work and AI state resume deterministically',()=>{
 const g=game(3);g.players.forEach(p=>p.ai=true);for(let i=0;i<200;i++)H.advanceHide536(g,g.lastAt+50);const loaded=JSON.parse(JSON.stringify(g));for(let i=0;i<150;i++){H.advanceHide536(g,g.lastAt+50);H.advanceHide536(loaded,loaded.lastAt+50)}assert.deepEqual(loaded,JSON.parse(JSON.stringify(g)));
});
