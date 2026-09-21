import{CABBAGE484 as RULES486}from'../src/cabbage/Rules484.js';
// Real coordinator integration. Only the two absent base-game catalogs use fixtures
// in a partial patch checkout. A complete checkout uses its real catalogs.
import test from 'node:test';
import assert from 'node:assert/strict';
import{registerHooks}from'node:module';
import{existsSync,mkdtempSync,rmSync,readFileSync}from'node:fs';
import{tmpdir}from'node:os';
import{join}from'node:path';
const fixtures={
 [new URL('../src/ui/MonsterVisual.js',import.meta.url).href]:`export const monsterVisual=()=>'<span class="test-portrait"></span>';export const setMonsterVisualFrame=()=>{};`,
 [new URL('../src/data/species.js',import.meta.url).href]:`export const SPECIES=Object.fromEntries(['slime','goblin','wolf','skeleton','ember_gecko','glacier_queen','myth_rion','myth_yori','myth_hide','myth_enami'].map(id=>[id,{id,name:id,race:id==='slime'?'slime':'beast',rarity:'R'}]));`,
 [new URL('../src/data/endgameCharacters.js',import.meta.url).href]:`export const ENDGAME_CHARACTERS={};export const canonicalEndgameId=id=>id;`
};
const hook=registerHooks({resolve(spec,context,next){const url=spec.startsWith('.')?new URL(spec,context.parentURL).href:spec;if(fixtures[url]&&!existsSync(new URL(url)))return{url,shortCircuit:true};return next(spec,context)},load(url,context,next){if(fixtures[url]&&!existsSync(new URL(url)))return{format:'module',source:fixtures[url],shortCircuit:true};return next(url,context)}});
const{RaceCoordinator451}=await import('../online-server/src/RaceCoordinator451.js');const{raceView452}=await import('../src/race/RaceView452.js');hook.deregister();
function setup(n=4,stateFile=null){let now=10000;const packets=[],sessions=new Map(Array.from({length:n},(_,i)=>['p'+i,{playerId:'p'+i,clientKey:'key'+i,connected:true,profile:{displayName:'Player'+i}}]));const c=new RaceCoordinator451({sessions,stateFile,send:(id,m)=>packets.push({id,m:structuredClone(m)}),now:()=>now});const send=(i,op,extra={})=>{const before=packets.length;c.handle(sessions.get('p'+i),{op,rulesVersion:18,cabbageVersion484:1,cabbageScoring491:1,canalVersion489:1,canalRules492:1,...extra});const errors=packets.slice(before).filter(p=>p.m.type==='raceError451');return errors};return{c,sessions,packets,send,time:t=>now=t,now:()=>now}}
function open(x,n=4){assert.deepEqual(x.send(0,'partyCreate462',{displayName:'Host',roster:[{id:'m0',speciesId:'wolf'}],game:'cabbage'}),[]);const p=Object.values(x.c.data.parties462)[0];for(let i=1;i<n;i++)assert.deepEqual(x.send(i,'partyJoin462',{code:p.code,roster:[{id:'m'+i,speciesId:'slime'}]}),[]);const g=x.c.data.cabbageRooms484[p.code];for(let i=0;i<n;i++){assert.deepEqual(x.send(i,'cabbage484',{gameId:g.id,kind:'select',monsterId:'m'+i}),[]);assert.deepEqual(x.send(i,'partyReady462',{ready:true}),[])}return{g,p}}

import{resultActions490,resultClick490,resultReceive490,resultError490,resultPoll490,resultGame490}from'../src/party/PartyResults490.js';
import{partyHub462,partyClick462}from'../src/party/PartyView462.js';
import{cabbageView484}from'../src/cabbage/View484.js';
import{canalView489}from'../src/canal/View489.js';
import{makeCanal489,startCanal489,advanceCanal489,publicCanal489}from'../src/canal/Rules489.js';
import{makeCabbage484,startCabbage484,advanceCabbage484,publicCabbage484}from'../src/cabbage/Rules484.js';
import{createBoard463}from'../online-server/src/SugorokuCoordinator463.js';
import vm from'node:vm';
// Execute the production client click dispatcher without the absent base game's
// portrait renderer. Transport and coordinator below are real protocol paths.
const clientSource=readFileSync(new URL('../src/race/RaceClient451.js',import.meta.url),'utf8').replace(/^import.*;\n/gm,'').replace('export class RaceClient451','class RaceClient451');
const Client=vm.runInNewContext(clientSource+';RaceClient451',{memberClick485:()=>false,resultClick490,Date});
function finish(x,g){x.send(0,'cabbage484',{kind:'start',gameId:g.id});x.time(g.endAt+RULES486.maxAge+250);x.c.advance();assert.equal(x.c.view(x.sessions.get('p0')).cabbage.phase,'result')}
function ui(x,i=0){const calls=[],c={state:x.c.view(x.sessions.get('p'+i)),transport:{selfId:'p'+i},ready:()=>true,connected:()=>true,connectionMessage:()=>'',draft:{},root:{contains:()=>true},render(){},refresh(){},sgMonster463:()=>'',sgSpeciesName463:id=>id,raw(op,payload){calls.push({op,...payload});const errors=x.send(i,op,payload);if(errors.length){for(const {m}of errors){resultError490(c,m);c.error=m.message}}
 const old=resultGame490(c)?.id;c.state=x.c.view(x.sessions.get('p'+i));if(old!==resultGame490(c)?.id)c.partyBrowse462=false;resultReceive490(c);return true;}};return{c,calls,click(kind){const b={dataset:{partyResult490:kind}};Client.prototype.onClick.call(c,{target:{closest:()=>b}})}}}
test('production result click → server clears completed game → same party can open EVERY minigame',()=>{
 for(const next of ['cabbage','canal','sugoroku','race']){const x=setup(1),{g,p}=open(x,1);finish(x,g);const u=ui(x);u.click('list');assert.equal(u.calls[0].op,'partyResult490');assert.equal(resultGame490(u.c),null);assert.equal(u.c.state.party.game,null);assert.equal(u.c.state.party.id,p.id);assert.equal(u.c.resultPending490,null);assert.equal(u.c.partyBrowse462,true);assert.doesNotMatch(partyHub462(u.c),/ゲーム結果を見る/);partyClick462(u.c,{dataset:{partyGame462:next}});assert.equal(u.c.state.party.game,next);assert.equal(resultGame490(u.c).phase,'lobby');assert.equal(u.c.partyBrowse462,false);assert.notEqual(resultGame490(u.c).id,g.id)}
});
test('production again click creates a new match, resets ready/damage, retains party and rejects duplicate/stale actions',()=>{
 const x=setup(1),{g,p}=open(x,1);finish(x,g);const u=ui(x);u.click('again');const next=resultGame490(u.c);assert.notEqual(next.id,g.id);assert.equal(next.phase,'lobby');assert.ok(u.c.state.party.members.every(m=>!m.ready));const packet=u.calls[0];assert.deepEqual(x.send(0,packet.op,packet),[]);assert.equal(x.c.view(x.sessions.get('p0')).cabbage.id,next.id);assert.ok(x.send(0,'partyResult490',{partyId:p.id,gameId:g.id,kind:'list'}).length);assert.equal(x.c.view(x.sessions.get('p0')).cabbage.id,next.id);
});
test('delayed list retransmit cannot destroy a newly opened game, including after durable restart',()=>{
 const dir=mkdtempSync(join(tmpdir(),'result490-'));try{const file=join(dir,'state.json'),x=setup(1,file),{g,p}=open(x,1);finish(x,g);const packet={partyId:p.id,gameId:g.id,kind:'list'};assert.deepEqual(x.send(0,'partyResult490',packet),[]);x.send(0,'partyGame462',{game:'canal'});const next=x.c.view(x.sessions.get('p0')).canal.id,y=setup(1,file);assert.deepEqual(y.send(0,'partyResult490',packet),[]);assert.equal(y.c.view(y.sessions.get('p0')).canal.id,next)}finally{rmSync(dir,{recursive:true,force:true})}
});
test('guests dismiss only their result, cannot switch for host, then follow the next game',()=>{
 const x=setup(2),{g,p}=open(x,2);finish(x,g);const u=ui(x,1);u.click('list');assert.equal(u.calls.length,0);assert.equal(u.c.partyBrowse462,true);assert.equal(u.c.dismissedResult490,g.id);assert.equal(x.c.view(x.sessions.get('p0')).cabbage.id,g.id);assert.doesNotMatch(partyHub462(u.c),/ゲーム結果を見る/);assert.ok(x.send(1,'partyResult490',{partyId:p.id,gameId:g.id,kind:'again'}).length);
 x.send(0,'partyResult490',{partyId:p.id,gameId:g.id,kind:'again'});u.c.state=x.c.view(x.sessions.get('p1'));resultReceive490(u.c);assert.equal(u.c.dismissedResult490,null);
});
test('active game, wrong party identity and invalid action cannot clear a match',()=>{
 const x=setup(1),{g,p}=open(x,1);x.send(0,'cabbage484',{kind:'start',gameId:g.id});for(const packet of [{partyId:p.id,gameId:g.id,kind:'list'},{partyId:'old',gameId:g.id,kind:'again'},{partyId:p.id,gameId:g.id,kind:'delete'}])assert.ok(x.send(0,'partyResult490',packet).length);assert.equal(x.c.view(x.sessions.get('p0')).cabbage.id,g.id);
});
test('busy errors are visible in the actual result, while list remains able to release the old game',()=>{
 const x=setup(1),{g}=open(x,1);finish(x,g);const u=ui(x);x.c.isBusy=()=>true;u.click('again');assert.equal(u.c.resultPending490,null);assert.equal(resultGame490(u.c).id,g.id);assert.match(cabbageView484(u.c),/role="alert"[^>]*>ほかのオンラインコンテンツ/);u.click('list');assert.equal(resultGame490(u.c),null);
});
test('double taps send once; loss of reply times out, errors release controls, offline/send failure explain what happened',t=>{
 const x=setup(1),{g}=open(x,1);finish(x,g);const u=ui(x),calls=[];let now=100;t.mock.method(Date,'now',()=>now);u.c.raw=(...args)=>{calls.push(args);return true};u.click('again');u.click('again');assert.equal(calls.length,1);assert.match(resultActions490(u.c),/data-party-result490="list" disabled/);now=8201;resultPoll490(u.c);assert.equal(u.c.resultPending490,null);assert.match(resultActions490(u.c),/応答を確認できません/);u.c.ready=()=>false;u.click('again');assert.match(resultActions490(u.c),/接続を確認/);u.c.ready=()=>true;u.c.raw=()=>false;u.click('list');assert.equal(u.c.resultPending490,null);assert.match(resultActions490(u.c),/送信できません/);
});
test('all existing result header routes go through the same close path; ordinary lobby browse is unaffected',()=>{
 for(const dataset of [{partyAction462:'browse'},{partyAction462:'lounge'},{sgAction:'browse'},{raceAction:'back'}]){const x=setup(1),{g}=open(x,1);finish(x,g);const u=ui(x);assert.equal(resultClick490(u.c,{dataset}),true);assert.equal(resultGame490(u.c),null)}
 const x=setup(1);open(x,1);const u=ui(x);assert.equal(resultClick490(u.c,{dataset:{partyAction462:'browse'}}),false);
});
test('clearing results preserves already-issued reward delivery queues',()=>{
 const x=setup(1),{g}=open(x,1);finish(x,g);const a=x.c.data.accounts.p0;a.deliveries.push({id:'prior-reward',kind:'result',gold:100});a.sgDeliveries474=[{id:'prior-crystals',crystals:50}];const snapshot=JSON.stringify([a.deliveries,a.sgDeliveries474]);const u=ui(x);u.click('list');assert.equal(JSON.stringify([x.c.data.accounts.p0.deliveries,x.c.data.accounts.p0.sgDeliveries474]),snapshot);
});
test('outdated server gives a useful error without sending an unsupported request',()=>{const x=setup(1),{g}=open(x,1);finish(x,g);const u=ui(x);delete u.c.state.partyResultActions490;u.click('list');assert.equal(u.calls.length,0);assert.match(resultActions490(u.c),/Build490/)});
import{sugorokuView463}from'../src/sugoroku/View463.js';
import{start463,public463}from'../src/sugoroku/Engine463.js';
test('all FOUR actual result views expose the same two actions and no home button, even with a lingering game menu',()=>{
 const x=setup(1),{g,p}=open(x,1);finish(x,g);const u=ui(x),c=u.c,htmls=[cabbageView484(c)];
 const cn=makeCanal489({id:'cn',code:p.code,partyId:p.id,hostId:'p0',members:[{playerId:'p0',name:'Host',choice:{id:'m0',speciesId:'wolf'}}],now:0});startCanal489(cn,0);advanceCanal489(cn,cn.endAt,()=>false);c.state.cabbage=null;c.state.canal=publicCanal489(cn,'p0',cn.endAt);htmls.push(canalView489(c));c.state.canal=null;
 const sg=createBoard463(x.c,p,g.members);sg.members[0].choice={id:'m0',speciesId:'wolf'};start463(sg,0);sg.phase='result';sg.results=sg.players.map((v,i)=>({playerId:v.playerId,name:v.name,remaining:80-i}));c.state.sugoroku=public463(sg,'p0');c.sgUI463={gameId:sg.id,modal:{kind:'gameMenu465'},scrolls:{}};htmls.push(sugorokuView463(c));assert.equal(c.sgUI463.modal,null);c.state.sugoroku=null;
 const racers=Array.from({length:8},(_,i)=>({speciesId:'wolf',name:'Wolf'+i,ownerId:i===0?'p0':null}));c.state.room={id:'r',phase:'result',hostId:'p0',course:'芝',order:racers.map((_,i)=>i),racers,results:[{playerId:'p0',name:'Host',net:0,stake:0,payout:0,prize:0,place:1}],members:[{playerId:'p0',name:'Host'}],finishMs:racers.map((_,i)=>15000+i*100)};c.bank=()=>null;c.save={state:{player:{gold:100},settings:{}}};htmls.push(raceView452(c));
 for(const html of htmls){assert.match(html,/data-party-result490="again"[^>]*>もう一度<\/button>/);assert.match(html,/data-party-result490="list"[^>]*>ミニゲーム一覧へ戻る<\/button>/);assert.doesNotMatch(html,/ホームへ戻る|data-race-action="back"/)}
});
