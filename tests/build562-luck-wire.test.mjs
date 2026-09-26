import test from 'node:test';
import assert from 'node:assert/strict';
import {createLuck511,handleLuck511,advanceLucks511} from '../online-server/src/LuckCoordinator511.js';
import {publicLuck511} from '../src/luck/Rules511.js';
import {members} from '../tools/build562/fixture.mjs';

function room(){
 let at=1000;const sessions=new Map(members.map(m=>[m.playerId,{playerId:m.playerId,connected:true}]));
 const people=members.map(m=>({...structuredClone(m),owned:[m.choice],ready:true,atHome:false,luckVersion511:1,luckVersion562:1,minigamesVersion528:1}));
 const party={id:'party562',code:'TEST',hostId:'p0',members:people};
 const c={data:{serial:0,parties462:{TEST:party},luckRooms507:{}},sessions,now:()=>at,isBusy:()=>false,transaction:fn=>fn(),broadcast(){this.broadcasts++},broadcasts:0};
 const g=createLuck511(c,party,people);c.data.luckRooms507.TEST=g;
 const state=()=>c.data.luckRooms507.TEST;
 const send=(id,kind,extra={})=>handleLuck511(c,sessions.get(id)??{playerId:id},{op:'luck511',gameId:state().id,kind,luckVersion511:1,luckVersion562:1,minigamesVersion528:1,...extra});
 const tick=()=>{at=state().nextAt;advanceLucks511(c)};
 return{c,state,send,tick,party};
}

test('lobby rejects old clients, wrong actor/game and mixed builds; public server capability is explicit',()=>{
 const f=room();assert.equal(publicLuck511(f.state(),'p0').itemRules562,1);
 assert.throws(()=>f.send('p0','start',{luckVersion562:0}),/Build562/);
 assert.throws(()=>f.send('p1','start'),/部屋主/);
 assert.throws(()=>f.send('p0','start',{gameId:'other'}),/切り替わり/);
 f.party.members[2].luckVersion562=0;assert.throws(()=>f.send('p0','start'),/全員がBuild562/);f.party.members[2].luckVersion562=1;
 f.party.members[1].ready=false;assert.throws(()=>f.send('p0','start'),/準備OK/);f.party.members[1].ready=true;
 assert.equal(f.send('p0','start'),true);const plan=JSON.stringify(f.state().plan511);
 f.send('p0','start');assert.equal(JSON.stringify(f.state().plan511),plan);
});

test('sealed hands and future draw/dice stay private; duplicate messages do not resolve twice',()=>{
 const f=room();f.send('p0','start');f.tick();
 const chest=publicLuck511(f.state(),'p0');assert.equal(chest.hand,null);assert(!('plan511' in chest));assert.equal(chest.event,null);
 f.send('p0','chest',{round:1,index:2});const revision=f.state().revision;
 f.send('p0','chest',{round:1,index:2});assert.equal(f.state().revision,revision);
 assert.throws(()=>f.send('p0','chest',{round:1,index:3}),/変更できません/);
 for(const id of ['p1','p2','p3'])f.send(id,'chest',{round:1,index:0});f.tick();
 const mine=publicLuck511(f.state(),'p0'),spectator=publicLuck511(f.state(),'visitor');
 assert.deepEqual(mine.hand,f.state().plan511[0].seats[0].boxes[2]);assert.equal(spectator.hand,null);assert.equal(spectator.ownPick,null);
 assert(!('dice' in mine));assert(!('boxes511' in mine));assert(!('items511' in mine));
 for(const id of ['p0','p1','p2','p3'])f.send(id,'hand',{round:1,index:0});f.tick();
 assert.equal(f.state().phase,'reveal');assert.equal(f.state().history.length,1);
 f.send('p0','hand',{round:1,index:0});assert.equal(f.state().history.length,1);
 assert.throws(()=>f.send('p0','hand',{round:1,index:1}),/終了/);
 assert.equal(f.state().event.itemRules562,1);
});

for(const rounds of [8,16])test(`${rounds} rounds through real server handlers: ward carry, restart and repeated tick`,()=>{
 const f=room();f.send('p0','rounds',{rounds});f.party.members.forEach(p=>p.ready=true);f.send('p0','start');
 // Replace only sealed draws, keeping the production phase engine and handlers.
 for(const row of f.state().plan511)for(const seat of row.seats)seat.boxes=Array.from({length:4},()=>['ward','engine','rocket','shield']);
 let steps=0,restarted=false;
 while(f.state().phase!=='result'){
  const g=f.state();assert(++steps<rounds*10);
  if(['chest','hand'].includes(g.phase)){
   for(const id of ['p0','p1','p2','p3'])f.send(id,g.phase,{round:g.round,index:g.phase==='chest'?0:id==='p0'&&g.round===1?0:1});
  }
  f.tick();const after=f.state();
  if(after.phase==='settle'){
   assert.equal(after.players[0].wards,after.round);assert.equal(after.history.length,after.round);
   const saved=JSON.stringify(after);advanceLucks511(f.c);assert.equal(JSON.stringify(f.state()),saved);
   if(after.round===4){f.c.data=JSON.parse(JSON.stringify(f.c.data));restarted=true;}
  }
 }
 assert(restarted);assert.equal(f.state().players[0].wards,rounds);assert.equal(f.state().history.length,rounds);assert.equal(f.state().results.length,4);
 const saved=JSON.stringify(f.state());f.send('p0','hand',{round:1,index:0});assert.equal(JSON.stringify(f.state()),saved);
 assert.equal(publicLuck511(f.state(),'p0').players[0].wards,rounds);
});
