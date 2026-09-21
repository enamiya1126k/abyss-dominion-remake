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
 [new URL('../src/data/species.js',import.meta.url).href]:`export const SPECIES=Object.fromEntries(['slime','goblin','wolf','skeleton','ember_gecko','glacier_queen','myth_rion','myth_yori','myth_hide','myth_enami'].map(id=>[id,{id,name:id,race:id==='slime'?'slime':'beast',rarity:'R'}]));`,
 [new URL('../src/data/endgameCharacters.js',import.meta.url).href]:`export const ENDGAME_CHARACTERS={};export const canonicalEndgameId=id=>id;`
};
const hook=registerHooks({resolve(spec,context,next){const url=spec.startsWith('.')?new URL(spec,context.parentURL).href:spec;if(fixtures[url]&&!existsSync(new URL(url)))return{url,shortCircuit:true};return next(spec,context)},load(url,context,next){if(fixtures[url]&&!existsSync(new URL(url)))return{format:'module',source:fixtures[url],shortCircuit:true};return next(url,context)}});
const{RaceCoordinator451}=await import('../online-server/src/RaceCoordinator451.js');hook.deregister();
function setup(n=4,stateFile=null){let now=10000;const packets=[],sessions=new Map(Array.from({length:n},(_,i)=>['p'+i,{playerId:'p'+i,clientKey:'key'+i,connected:true,profile:{displayName:'Player'+i}}]));const c=new RaceCoordinator451({sessions,stateFile,send:(id,m)=>packets.push({id,m:structuredClone(m)}),now:()=>now});const send=(i,op,extra={})=>{const before=packets.length;c.handle(sessions.get('p'+i),{op,rulesVersion:18,cabbageVersion484:1,cabbageScoring491:1,...extra});const errors=packets.slice(before).filter(p=>p.m.type==='raceError451');return errors};return{c,sessions,packets,send,time:t=>now=t,now:()=>now}}
function open(x,n=4){assert.deepEqual(x.send(0,'partyCreate462',{displayName:'Host',roster:[{id:'m0',speciesId:'wolf'}],game:'cabbage'}),[]);const p=Object.values(x.c.data.parties462)[0];for(let i=1;i<n;i++)assert.deepEqual(x.send(i,'partyJoin462',{code:p.code,roster:[{id:'m'+i,speciesId:'slime'}]}),[]);const g=x.c.data.cabbageRooms484[p.code];for(let i=0;i<n;i++){assert.deepEqual(x.send(i,'cabbage484',{gameId:g.id,kind:'select',monsterId:'m'+i}),[]);assert.deepEqual(x.send(i,'partyReady462',{ready:true}),[])}return{g,p}}

test('server queues, retries and a durable restart preserve every forbidden penalty and negative score',()=>{
 const dir=mkdtempSync(join(tmpdir(),'cabbage491-'));
 try{
  const file=join(dir,'state.json'),x=setup(1,file),{g}=open(x,1);x.send(0,'cabbage484',{kind:'start',gameId:g.id});
  const w=g.windows.find(w=>w.kind==='stop'),taps=Array.from({length:20},(_,i)=>({seq:i+1,side:i%2?'right':'left',at:w.at+i*25}));
  x.time(w.at+500);x.send(0,'cabbageTap484',{gameId:g.id,taps});x.send(0,'cabbageTap484',{gameId:g.id,taps});x.c.advance();
  const saved=JSON.parse(readFileSync(file)).cabbageRooms484[g.code];assert.equal(saved.players[0].score,-1600);assert.equal(saved.players[0].boardDamage,20);assert.equal(saved.scoringVersion491,1);
  const y=setup(1,file);y.time(w.at+700);y.send(0,'cabbageTap484',{gameId:g.id,taps});y.c.advance();
  assert.equal(y.c.view(y.sessions.get('p0')).cabbage.players[0].score,-1600);
  y.time(w.at+1000);y.send(0,'cabbageTap484',{gameId:g.id,taps:[{seq:21,side:'left',at:y.now()}]});y.c.advance();
  assert.equal(y.c.view(y.sessions.get('p0')).cabbage.players[0].score,-1680);
  y.time(g.endAt+RULES486.maxAge+250);y.c.advance();assert.equal(y.c.view(y.sessions.get('p0')).cabbage.phase,'result');assert.equal(y.c.view(y.sessions.get('p0')).cabbage.players[0].score,-1680);
 }finally{rmSync(dir,{recursive:true,force:true})}
});
test('mixed client versions cannot start; an updated ready packet upgrades a persisted old member without rejoining',()=>{
 const x=setup(2),{g,p}=open(x,2);p.members[1].cabbageScoring491=0;
 assert.ok(x.send(0,'cabbage484',{kind:'start',gameId:g.id}).length);assert.equal(g.phase,'lobby');
 assert.ok(x.send(1,'partyReady462',{ready:true,cabbageScoring491:0}).length);
 assert.deepEqual(x.send(1,'partyReady462',{ready:true}),[]);assert.equal(x.c.data.parties462[p.code].members[1].cabbageScoring491,1);
 assert.ok(x.send(0,'cabbage484',{kind:'start',gameId:g.id,cabbageScoring491:0}).length);assert.equal(g.phase,'lobby');
 assert.deepEqual(x.send(0,'cabbage484',{kind:'start',gameId:g.id}),[]);assert.equal(x.c.data.cabbageRooms484[p.code].scoringVersion491,1);
 const v=x.c.view(x.sessions.get('p0'));assert.equal(v.cabbageScoring491,1);assert.equal(v.cabbage.scoringVersion491,1);
});
