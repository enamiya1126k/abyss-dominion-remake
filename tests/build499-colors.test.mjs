// Real coordinator integration. Only the two absent base-game catalogs use fixtures
// in a partial patch checkout. A complete checkout uses its real catalogs.
import test from 'node:test';
import assert from 'node:assert/strict';
import{registerHooks}from'node:module';
import{existsSync,mkdtempSync,rmSync,readFileSync}from'node:fs';
import{tmpdir}from'node:os';
import{join}from'node:path';
const fixtures={
 [new URL('../src/data/species.js',import.meta.url).href]:`export const SPECIES=Object.fromEntries(['slime','goblin','wolf','skeleton','ember_gecko','glacier_queen','myth_rion','myth_yori','myth_hide','myth_enami'].map(id=>[id,{id,name:id,race:id==='slime'?'slime':'beast',rarity:'R'}]));`,
 [new URL('../src/data/endgameCharacters.js',import.meta.url).href]:`export const ENDGAME_CHARACTERS={};export const canonicalEndgameId=id=>id;`
};
const hook=registerHooks({resolve(spec,context,next){const url=spec.startsWith('.')?new URL(spec,context.parentURL).href:spec;if(fixtures[url]&&!existsSync(new URL(url)))return{url,shortCircuit:true};return next(spec,context)},load(url,context,next){if(fixtures[url]&&!existsSync(new URL(url)))return{format:'module',source:fixtures[url],shortCircuit:true};return next(url,context)}});
const{RaceCoordinator451}=await import('../online-server/src/RaceCoordinator451.js');hook.deregister();
function setup(n=4,stateFile=null){let now=10000;const packets=[],sessions=new Map(Array.from({length:n},(_,i)=>['p'+i,{playerId:'p'+i,clientKey:'key'+i,connected:true,profile:{displayName:'Player'+i}}]));const c=new RaceCoordinator451({sessions,stateFile,send:(id,m)=>packets.push({id,m:structuredClone(m)}),now:()=>now});const send=(i,op,extra={})=>{const before=packets.length;c.handle(sessions.get('p'+i),{op,rulesVersion:18,canalVersion489:1,canalRules492:1,canalRules496:1,canalRules494:1,cabbageVersion484:1,cabbageScoring491:1,...extra});return packets.slice(before).filter(p=>p.m.type==='raceError451')};return{c,sessions,packets,send,time:t=>now=t,now:()=>now}}
function open(x,n=4){assert.deepEqual(x.send(0,'partyCreate462',{displayName:'Host',roster:[{id:'m0',speciesId:'wolf'}],game:'canal'}),[]);const p=Object.values(x.c.data.parties462)[0];for(let i=1;i<n;i++)assert.deepEqual(x.send(i,'partyJoin462',{code:p.code,roster:[{id:'m'+i,speciesId:'slime'}]}),[]);const g=x.c.data.canalRooms489[p.code];for(let i=0;i<n;i++){assert.deepEqual(x.send(i,'canal489',{gameId:g.id,kind:'select',monsterId:'m'+i}),[]);assert.deepEqual(x.send(i,'partyReady462',{ready:true}),[])}return{g,p}}
const inp=(seq,lane,held=true)=>({seq,lane,held,pulse:true,burst:false});
// Current protocol integration exercises the real coordinator and durable store.
function start(x,g){assert.deepEqual(x.send(0,'canal489',{gameId:g.id,kind:'start'}),[])}
function seedEnemy(g,at,lane=0){g.enemies.push({id:++g.enemySerial,kind:0,lane,hp:1,maxHp:1,spawnAt:at-5000,travelMs:10000,wiggle:0})}
import{PARTY_COLORS499,color499,assignColors499,seatColors499}from'../src/party/PartyColors499.js';
import{colorAttrs499,colorDialog499,colorClick499,colorKey499,colorReceive499,colorError499}from'../src/party/PartyColorUI499.js';
import{partySeats462}from'../src/party/PartyView462.js';
import{partyFloor476}from'../src/party/PartyPortrait476.js';
import{view496}from'../src/canal/View496.js';
const preference=(x,i,color,extra={})=>{const p=Object.values(x.c.data.parties462)[0],m=p.members.find(m=>m.playerId==='p'+i);return x.send(i,'partyColor499',{partyId:p.id,seatToken485:m?.seatToken485??null,color499:color,...extra})};
test('every authenticated member can choose all four colors; forged target changes only the sender',()=>{
 const x=setup(2),{p,g}=open(x,2);assert.equal(x.c.view(x.sessions.get('p1')).partyColors499,1);
 for(const item of PARTY_COLORS499){assert.deepEqual(preference(x,1,item.id,{playerId:'p0'}),[]);assert.equal(p.members[1].color499,item.id);assert.equal(g.members[1].color499,item.id);assert.equal(p.members[0].color499,'blue');for(const id of ['p0','p1'])assert.equal(x.c.view(x.sessions.get(id)).party.members[1].color499,item.id)}
 assert.equal(p.members[1].ready,true);
});
test('invalid color and stale membership reject atomically without changing saved preference',()=>{
 const x=setup(2),{p}=open(x,2);preference(x,1,'pink');
 for(const color of ['red','BLUE','#fff','__proto__','<img src=x>',null,{},1]){assert.equal(preference(x,1,color).length,1);assert.equal(x.c.data.accounts.p1.partyColor499,'pink')}
 assert.equal(preference(x,1,'green',{partyId:'old'}).length,1);assert.equal(preference(x,1,'green',{seatToken485:'stale'}).length,1);
 const state=x.c.view(x.sessions.get('p1'));assert.equal(state.party.members[1].color499,'pink');assert.ok(!JSON.stringify(state).includes('"key":'));
});
test('selected color follows identity across room changes, leave/rejoin, restart and client roster refresh',()=>{
 const dir=mkdtempSync(join(tmpdir(),'colors499-'));
 try{const file=join(dir,'state.json'),x=setup(2,file),{p}=open(x,2);preference(x,1,'orange');
  assert.deepEqual(x.send(1,'partyRoster462',{roster:[{id:'m1',speciesId:'slime'}],color499:'blue'}),[]);assert.equal(p.members[1].color499,'orange');
  x.send(0,'partyGame462',{game:'cabbage'});assert.equal(x.c.data.cabbageRooms484[p.code].members[1].color499,'orange');
  assert.deepEqual(x.send(1,'partyLeave462'),[]);const y=setup(2,file);
  assert.deepEqual(y.send(1,'partyJoin462',{code:p.code,roster:[{id:'m1',speciesId:'slime'}]}),[]);
  assert.equal(y.c.view(y.sessions.get('p1')).party.members[1].color499,'orange');
  y.send(1,'partyLeave462');y.send(1,'partyCreate462',{roster:[{id:'m1',speciesId:'slime'}]});assert.equal(y.c.view(y.sessions.get('p1')).party.members[0].color499,'orange');
 }finally{rmSync(dir,{recursive:true,force:true})}
});
test('match snapshots freeze colors; AI uses unused colors; result preferences apply on replay',()=>{
 const x=setup(1),{g,p}=open(x,1);preference(x,0,'pink');start(x,g);
 assert.equal(g.players[0].color499,'pink');assert.equal(new Set(g.players.map(p=>p.color499)).size,4);
 for(const id of ['p0'])assert.deepEqual(x.c.view(x.sessions.get(id)).canal.players.map(p=>p.color499),g.players.map(p=>p.color499));
 assert.equal(preference(x,0,'orange').length,1);assert.equal(x.c.data.accounts.p0.partyColor499,'pink');
 x.time(g.endAt+100);x.c.advance();const live=x.c.data.canalRooms489[p.code];assert.equal(live.phase,'result');assert.deepEqual(preference(x,0,'orange'),[]);assert.equal(g.players[0].color499,'pink');
 x.send(0,'partyResult490',{partyId:p.id,gameId:g.id,kind:'again'});assert.equal(x.c.data.canalRooms489[p.code].members[0].color499,'orange');
});
test('legacy rooms without color fields get safe defaults; duplicate human preferences remain their choice',()=>{
 const x=setup(2),{p,g}=open(x,2);delete p.members[0].color499;delete g.members[0].color499;
 assert.equal(x.c.view(x.sessions.get('p0')).party.members[0].color499,'blue');start(x,g);assert.equal(g.players[0].color499,'blue');
 const people=[{seat:0,color499:'pink'},{seat:1,color499:'pink'},{seat:2,ai:true},{seat:3,ai:true}];assignColors499(people);assert.deepEqual(people.map(p=>p.color499),['pink','pink','blue','green']);
 assert.deepEqual(seatColors499(people),['#f5a1cb','#f5a1cb','#78cfff','#91e3b0']);assert.equal(color499('url(javascript:x)',2).id,'pink');
});
function ui(){const sent=[],p={id:'party',hostId:'host',members:[{playerId:'self',name:'<script>x</script>',color499:'orange',seatToken485:'token',connected:true}]},c={state:{party:p,partyColors499:1},transport:{selfId:'self'},save:{state:{monsters:[]}},ready:()=>true,render(){},toast:s=>sent.push(s),raw:(op,m)=>{sent.push({op,m});return true},root:{contains:()=>true,querySelector:()=>null}};
 const seat={dataset:{partyColorOpen499:'self'},closest:q=>q==='[data-party-color-open499]'?seat:null};const button=(action,color)=>{const b={dataset:{partyColorAction499:action,color499:color},closest:q=>q==='[data-party-color-action499]'?b:null};return b};return{c,sent,seat,button}}
test('own frame opens color settings; selection saves once after confirmation and server acknowledgement',()=>{
 const{c,sent,seat,button}=ui();assert.match(colorAttrs499(c,c.state.party.members[0]),/自分のイメージカラー/);assert.equal(colorAttrs499(c,{playerId:'other'}),'');
 assert.equal(colorClick499(c,{target:seat}),true);let html=colorDialog499(c);assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.equal((html.match(/data-color499=/g)??[]).length,4);
 colorClick499(c,{target:button('choose','green')});assert.equal(sent.length,0);colorClick499(c,{target:button('save')});colorClick499(c,{target:button('save')});assert.equal(sent.length,1);assert.deepEqual(sent[0],{op:'partyColor499',m:{partyId:'party',seatToken485:'token',color499:'green'}});
 c.state.party.members[0].color499='green';colorReceive499(c);assert.equal(c.partyColorUI499,null);assert.equal(sent.at(-1),'グリーンに設定したよ');
});
test('old server, active match, failed send and Escape cannot silently change a color',()=>{
 const{c,seat,sent,button}=ui();colorClick499(c,{target:seat});c.state.partyColors499=0;assert.match(colorDialog499(c),/Build499/);colorClick499(c,{target:button('save')});assert.equal(sent.length,0);
 c.state.partyColors499=1;c.state.canal={phase:'playing'};assert.match(colorDialog499(c),/ゲーム終了後/);colorClick499(c,{target:button('save')});assert.equal(sent.length,0);c.state.canal=null;c.raw=()=>false;colorClick499(c,{target:button('save')});assert.equal(c.partyColorUI499.pendingAt,0);assert.match(colorDialog499(c),/接続を確認/);
 colorError499(c,{op:'partyColor499',message:'保存できません'});assert.match(colorDialog499(c),/保存できません/);c.root.querySelector=()=>({});colorKey499(c,{key:'Escape',preventDefault(){}});assert.equal(c.partyColorUI499,null);assert.equal(c.state.party.members[0].color499,'orange');
});
test('lounge and all four in-game panels use the player color rather than a seat color',()=>{
 const{c}=ui();assert.match(partySeats462(c),/--seat472:#ffb376/);assert.match(partyFloor476(c),/--seat476:#ffb376/);
 c.state.canal={id:'g',phase:'playing',players:PARTY_COLORS499.map((p,seat)=>({seat,playerId:seat===0?'self':'ai'+seat,name:'Name',choice:{speciesId:'slime'},color499:PARTY_COLORS499[3-seat].id}))};
 const html=view496(c);assert.match(html,/title="オレンジ" style="--crew:#ffb376"/);assert.match(html,/data-cn-helper496="0" style="--crew:#ffb376/);
});
