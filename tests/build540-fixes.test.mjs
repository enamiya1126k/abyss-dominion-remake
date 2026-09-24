import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {AtomicSnapshot540} from '../online-server/src/AtomicSnapshot540.js';
import * as T from '../src/tetra/Rules539.js';
import * as H from '../src/hide/Rules536.js';
import * as F from '../src/fishing/Rules524.js';
import * as L from '../src/luck/Rules511.js';
import {RaceCoordinator451} from '../online-server/src/RaceCoordinator451.js';
import {partyFor462,partyRace462} from '../online-server/src/PartyCoordinator462.js';
import {queueTetra539,liveTetra539} from '../online-server/src/TetraCoordinator539.js';
const members=Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'player'+i,choice:{id:'m'+i,speciesId:'slime'}}));
const tetra=(seed=540)=>{const g=T.makeTetra539({id:'t',code:'code',members,hostId:'p0'});T.startTetra539(g,0,seed);T.advanceTetra539(g,4000);return g};
const step=(g,ms)=>{for(const end=g.lastAt+ms;g.lastAt<end&&g.phase!=='result';)T.advanceTetra539(g,g.lastAt+50)};
const place=(g,p,pad,dx=0,dy=0)=>Object.assign(p,{x:pad.x+dx,y:pad.y+dy,padId:pad.id,flight:null,fallAt:null,chargeAt:null,landedAt:g.elapsed});
const time=(g,t)=>{g.elapsed=t;g.lastAt=g.startAt+t;g.serverAt=g.lastAt};

test('snapshot: locked Windows rename keeps durable newest data, retries, recovers after restart',()=>{
 const dir=fs.mkdtempSync(join(tmpdir(),'abyss540-')),path=join(dir,'state.json');let locked=true;const callbacks=[],io={...fs,renameSync(a,b){if(locked)throw Object.assign(Error('locked'),{code:'EPERM'});fs.renameSync(a,b)}};
 const store=new AtomicSnapshot540(path,{io,schedule:fn=>{callbacks.push(fn);return callbacks.length},cancel:()=>{}}),data=revision=>({version:1,serial:1,revision,rooms:{},accounts:{},score:revision});
 try{store.commit(JSON.stringify(data(1)),1);store.commit(JSON.stringify(data(2)),2);assert.equal(fs.readdirSync(dir).length,1);const resumed=new AtomicSnapshot540(path,{io,schedule:()=>1,cancel:()=>{}});assert.equal(resumed.load().score,2);locked=false;callbacks.shift()();assert.equal(JSON.parse(fs.readFileSync(path)).score,2);assert.equal(fs.readdirSync(dir).length,1);resumed.close();store.close()}finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('snapshot: real disk failure rejects, truncated pending file never replaces valid save',()=>{
 const dir=fs.mkdtempSync(join(tmpdir(),'abyss540-')),path=join(dir,'state.json');try{fs.writeFileSync(path,JSON.stringify({version:1,serial:1,revision:4,rooms:{},accounts:{}}));fs.writeFileSync(path+'.pending540-5-broken','{"version":');const a=new AtomicSnapshot540(path);assert.equal(a.load().revision,4);const b=new AtomicSnapshot540(path,{io:{...fs,writeFileSync(){throw Object.assign(Error('full'),{code:'ENOSPC'})}}});assert.throws(()=>b.commit('{}',6),/full/);assert.equal(JSON.parse(fs.readFileSync(path)).revision,4)}finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('tetra: 100 random fields connect all checkpoints and offer wide branching choices',()=>{
 for(let seed=1;seed<=100;seed++){const c=T.course539(seed);assert.ok(c.pads.length>=95);assert.equal(c.checkpoints.length,6);assert.ok(c.pads.some(p=>p.x<250)&&c.pads.some(p=>p.x>1250));assert.ok(c.pads.every(p=>!['spin','tilt','sink'].includes(p.kind)));let seen=new Set([0]),queue=[c.pads[0]];while(queue.length){const a=queue.shift();for(const b of c.pads)if(!seen.has(b.id)&&Math.hypot(a.x-b.x,a.y-b.y)<T.TETRA539.maxJump-30){seen.add(b.id);queue.push(b)}}for(const id of c.checkpoints)assert.ok(seen.has(id),'seed '+seed);assert.ok(seen.size>c.pads.length*.95)}
});
test('tetra: drag power determines distance independently of holding time; cancelled and malformed input cannot jump',()=>{
 for(const hold of[0,500,9000]){const g=tetra(),p=g.players[0],a={angle:-Math.PI/2,power:.6};assert.ok(T.inputTetra539(g,p,{...a,action:'begin'}));time(g,hold);assert.ok(T.inputTetra539(g,p,{...a,action:'release'}));assert.ok(Math.abs(p.flight.distance-312)<=24)}
 const g=tetra(),p=g.players[0];T.inputTetra539(g,p,{action:'begin',angle:0,power:0});assert.equal(T.inputTetra539(g,p,{action:'release',angle:0,power:0}),false);assert.equal(p.flight,null);for(const power of[NaN,Infinity,-1,1.01])assert.equal(T.inputTetra539(g,p,{action:'begin',angle:0,power}),false);
});
test('tetra: ordinary wave saves only tips/checkpoints; great wave washes tips and airborne players',()=>{
 const g=tetra(),pad=g.course.pads.find(p=>p.kind==='stable'),p=g.players[0];place(g,p,pad);time(g,13500);step(g,50);assert.equal(p.fallAt,null);place(g,p,pad,55,0);step(g,50);assert.notEqual(p.fallAt,null);
 place(g,p,pad);time(g,37500);step(g,50);assert.notEqual(p.fallAt,null);place(g,p,g.course.pads[1]);step(g,50);assert.equal(p.fallAt,null);
 place(g,p,pad);time(g,37400);p.padId=null;p.flight={x:pad.x,y:pad.y,tx:pad.x,ty:pad.y-200,at:g.elapsed,distance:200,duration:1000};step(g,50);assert.notEqual(p.fallAt,null);
});
test('tetra: low pad tide and moss affect feet; tip stays put between waves',()=>{
 const g=tetra(),p=g.players[0],low=g.course.pads.find(p=>p.kind==='low'),moss=g.course.pads.find(p=>p.kind==='slippery');low.tideOffset=13500;place(g,p,low);step(g,50);assert.notEqual(p.fallAt,null);place(g,p,moss);const x=p.x;step(g,1600);assert.equal(p.x,x);assert.equal(p.fallAt,null);place(g,p,moss,55,0);step(g,2500);assert.ok(p.falls>=2);assert.ok(g.events.some(e=>e.reason==='slip'));
});
test('tetra: occupied landings do not overlap; respawns use separate spaces',()=>{
 const g=tetra(),p=g.players[0],q=g.players[1],pad=g.course.pads.find(p=>p.kind==='stable');place(g,q,pad);p.padId=null;p.flight={x:pad.x,y:pad.y+180,tx:pad.x,ty:pad.y,at:0,distance:180,duration:50};step(g,50);assert.notEqual(p.fallAt,null);assert.equal(q.fallAt,null);for(const p of g.players)T.fall539(g,p);step(g,1600);for(const a of g.players)for(const b of g.players)if(a!==b)assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=T.TETRA539.body*2);
});
test('tetra: checkpoints must be visited in order; seeded bots use the same physics and reach goals',()=>{
 const g=tetra(),p=g.players[0],last=g.course.pads[5];p.padId=null;p.flight={x:last.x,y:last.y+50,tx:last.x,ty:last.y,at:0,distance:50,duration:50};step(g,50);assert.equal(p.checkpoint,0);assert.equal(p.finishedAt,null);
 for(const seed of[1,2,3,539,540]){const g=tetra(seed);g.players.forEach(p=>p.ai=true);step(g,150000);assert.equal(g.phase,'result');assert.ok(g.results.some(p=>p.finishedAt!=null));assert.equal(g.results.length,4)}
});
test('hide: move and attack together at 200 units; shots max three and recharge ten seconds',()=>{
 const g=H.makeHide536({id:'h',code:'h',hostId:'p0',members});g.role='hunter';H.startHide536(g,0,538);H.advanceHide536(g,10000);H.advanceHide536(g,20000);const p=g.players[0];g.map={...g.map,decor:[],cells:Array(g.map.cells.length).fill(5)};p.x=2200;p.y=2200;const o=g.objects[0];Object.assign(o,{x:2400,y:2200,checked:false});const inputs=new Map([['p0',{steer:{x:1,y:0},receivedAt:g.lastAt,attack:o.id}]]);H.advanceHide536(g,g.lastAt+50,inputs);assert.ok(p.moving&&p.x>2200);assert.equal(g.shots,2);assert.equal(o.checked,true);H.advanceHide536(g,g.lastAt+9900);assert.equal(g.shots,2);H.advanceHide536(g,g.lastAt+100);assert.equal(g.shots,3);H.advanceHide536(g,g.lastAt+10000);assert.equal(g.shots,3);
});
test('hide: live disguise swapping retains movement, stamina and privacy',()=>{
 const g=H.makeHide536({id:'h',code:'h',hostId:'p0',members});g.role='hunter';H.startHide536(g,0,538);H.advanceHide536(g,10000);H.advanceHide536(g,20000);const p=g.players[1];g.map={...g.map,decor:[],cells:Array(g.map.cells.length).fill(5)};p.x=2100;p.y=2100;const before=p.stamina;H.advanceHide536(g,g.lastAt+50,new Map([[p.playerId,{kind:p.choices[1],steer:{x:1,y:0},receivedAt:g.lastAt}]]));assert.equal(p.kind,p.choices[1]);assert.ok(p.moving&&p.stamina<before);const view=H.publicHide536(g,'p0');assert.equal(view.players[1].x,undefined);assert.equal(view.players[1].choices,undefined);assert.ok(Number.isFinite(H.publicHide536(g,'p2').players[1].x));
});
test('luck: a stop hit cannot be undone by a later magnet; huge legal growth is preserved',()=>{
 const g=L.makeLuck511({id:'l',code:'l',hostId:'p0',members});g.rounds=16;const plan=L.drawPlan511(()=>0,16);L.startLuck511(g,0,plan);g.round=2;g.boxes511=[0,0,0,0];g.items511=[0,0,0,0];g.auto511=[false,false,false,false];g.plan511[1].order=[0,1,2,3];['pit','magnet','rocket','engine'].forEach((id,i)=>g.plan511[1].seats[i].boxes[0][0]=id);[3000,2000,10000,0].forEach((v,i)=>g.players[i].distance=v);let r=L.resolveRound511(g,0);assert.equal(r.rows[1].stopped,true);assert.equal(r.rows[1].gain,0);assert.equal(r.rows[1].to,2000);
 g.round=16;g.plan511[15].seats.forEach(s=>s.boxes[0][0]='engine');g.players[0].loadout=[{id:'doubling',round:1},{id:'doubling',round:8}];r=L.resolveRound511(g,0);assert.equal(r.rows[0].calculation.doubling,23);assert.equal(2n**23n,8388608n);assert.ok(L.metres511(r.rows[0].planned)>1000000000n);
});
test('fishing: compact frames reduce wire size, retain live controls, and full results retain records',()=>{
 const g=F.makeFishing524({id:'f',code:'f',hostId:'p0',members});F.startFishing524(g,0,540);F.advanceFishing524(g,3000);for(const p of g.players)p.records=Array.from({length:20},(_,i)=>({id:'carp',name:'コイ',kg:2,value:10,at:i,detail:'catch record'.repeat(10)}));const full=F.publicFishing524(g),frame=F.fishingFrame540(g),a=JSON.stringify(full).length,b=JSON.stringify(frame).length;assert.ok(b<a*.4);assert.equal(frame.players[0].mode,full.players[0].mode);assert.equal(frame.players[0].lastSeq,full.players[0].lastSeq);assert.equal(full.players[0].records.length,20);F.finishFishing524(g);assert.equal(F.fishingFrame540(g).players[0].records.length,20);console.log('frame bytes',a,b);
});
test('coordinator: new protocol, authoritative identity, sequence and power validation, reconnect save',()=>{
 let now=0;const sessions=new Map(members.map(m=>[m.playerId,{playerId:m.playerId,clientKey:m.playerId,connected:true}])),c=new RaceCoordinator451({sessions,now:()=>now});const call=(id,op,p={})=>c.handle(sessions.get(id),{op,tetraVersion539:2,roster:[{id:'m',speciesId:'slime'}],...p});call('p0','partyCreate462',{game:'tetra'});const party=partyFor462(c,'p0');for(let i=1;i<4;i++)call('p'+i,'partyJoin462',{code:party.code});let saved=partyRace462(c,party);for(let i=0;i<4;i++){call('p'+i,'tetra539',{gameId:saved.id,kind:'select',monsterId:'m'});call('p'+i,'partyReady462',{ready:true})}call('p0','tetra539',{gameId:saved.id,kind:'start'});now=4000;c.advanceTetra539();let g=liveTetra539(c,saved);assert.equal(g.phase,'play');const packet={gameId:g.id,tetraVersion539:2,action:'begin',angle:-1.5,power:.5,seq:1};assert.equal(queueTetra539(c,sessions.get('p0'),{...packet,power:2}),false);assert.equal(queueTetra539(c,sessions.get('p0'),{...packet,tetraVersion539:1}),false);assert.equal(queueTetra539(c,sessions.get('p0'),packet),true);assert.equal(queueTetra539(c,sessions.get('p0'),packet),false);assert.equal(queueTetra539(c,sessions.get('p0'),{...packet,action:'release',seq:2}),true);now+=50;c.advanceTetra539();assert.ok(g.players[0].flight);assert.equal(g.players[1].flight,null);
});
