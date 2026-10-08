import test from 'node:test';import assert from 'node:assert/strict';
import {arcade580} from '../../online-server/src/ArcadeCoordinator580.js';
import * as bomb from '../../online-server/src/BombCoordinator542.js';
import * as hockey from '../../online-server/src/RicochetCoordinator550.js';
import * as party from '../../online-server/src/PartyCoordinator462.js';
const versions={runnersVersion587:9,wallsVersion585:4,chairsVersion583:4,bombVersion542:5,ricochetVersion550:11,lavaVersion598:2,arcadeVersion580:1};
for(const game of ['bomb','pinball','lava','chairs','walls'])test(game+' host exit transfers leadership and keeps other players moving',()=>{
 let at=1000;const people=Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'P'+i,...versions,owned:[{id:'m'+i,speciesId:'slime'}],slotOne476:'m'+i,ready:false,connected:true,atHome:false}));
 const p={id:'party598',code:'EXIT',hostId:'p0',members:people};const c={data:{serial:0,accounts:{},rooms:{},parties462:{EXIT:p}},sessions:new Map(people.map(p=>[p.playerId,{playerId:p.playerId,connected:true}])),subscribers:new Set(),now:()=>at,isBusy:()=>false,transaction:f=>f(),broadcast:()=>{},push:()=>{},send:()=>{},roster:x=>structuredClone(x),member:(g,id)=>g?.members.find(m=>m.playerId===id),roomFor:()=>null};
 const api=game==='bomb'?{find:bomb.bombFor542,live:bomb.liveBomb542,handle:bomb.handleBomb542,advance:bomb.advanceBombs542}:game==='pinball'?{find:hockey.ricochetFor550,live:hockey.liveRicochet550,handle:hockey.handleRicochet550,advance:hockey.advanceRicochets550}:arcade580(game);
 const op=game==='bomb'?'bomb542':game==='pinball'?'ricochet550':game==='lava'?'lava580':game==='chairs'?'chairs583':'walls585';
 party.openGame462(c,p,game);for(const person of people)party.handleParty462(c,c.sessions.get(person.playerId),{op:'partyReady462',ready:true,...versions});const saved=api.find(c,'p0');api.handle(c,c.sessions.get('p0'),{op,kind:'start',gameId:saved.id,...versions});
 for(let i=0;i<125;i++){at+=25;api.advance(c);}const g=api.live(c,saved);assert.equal(g.phase,'play');assert(party.handleParty462(c,c.sessions.get('p0'),{op:'partyLeave462',...versions}));assert.equal(p.hostId,'p1');assert.equal(api.find(c,'p0'),null);
 for(let i=0;i<160;i++){at+=25;api.advance(c);}assert(g.members.find(m=>m.playerId==='p0').departed);assert.equal(g.hostId,'p1');assert(g.players.find(p=>p.playerId==='p0')[game==='pinball'?'auto598':'auto']);assert.notEqual(g.phase,'lobby');
 for(let i=1;i<4;i++)party.handleParty462(c,c.sessions.get('p'+i),{op:'partyLeave462',...versions});at+=25;api.advance(c);assert(!c.data.parties462.EXIT);assert.equal(api.find(c,'p1'),null);
});
