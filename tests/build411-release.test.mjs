import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {run,monster} from '../tools/build411/native-harness.mjs';
import {SaveService} from '../src/services/SaveService.js';
import {calculatedStats,rawCalculatedStats410} from '../src/models/Monster.js';
import {buildOnlinePartyProfile} from '../src/ui/screens/OnlinePartyScreen.js';
import {onlineStats411,onlineHp411,localHp411} from '../src/online/OnlineTraitCompatibility411.js';
import {SINGLE_TRAITS410,settleSingleDeaths410,noteSingleDamage410,naturalSingleAction410} from '../src/battle/SingleTraits410.js';
import {APP_VERSION} from '../src/core/config.js';
const plain=x=>JSON.parse(JSON.stringify(x));
function save(){const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};return new SaveService();}
for(const id of Object.keys(SINGLE_TRAITS410))test(`411 online ${id}: legacy body, wounds and KO survive 100 round trips`,()=>{
 const s=save(),u=monster(id,1500,true);s.state.monsters=[u];s.state.party=[u.id];buildOnlinePartyProfile(s.state);
 const raw=rawCalculatedStats410(u),local=calculatedStats(u);assert.deepEqual(onlineStats411(u),raw);
 for(const hp of [0,1,Math.floor(local.hp*.37),local.hp]){
  u.currentHp=hp;
  for(let n=0;n<100;n++)u.currentHp=localHp411(u,onlineHp411(u));
  assert.equal(u.currentHp,hp);
  const before=plain(s.state),profile=buildOnlinePartyProfile(s.state);
  assert.equal(profile.battleStats.hp,raw.hp);assert.equal(profile.battleStats.atk,raw.atk);
  assert.equal(profile.currentHp,onlineHp411(u));assert.deepEqual(plain(s.state),before);
  assert.equal(profile.battleRoster[0].currentHp,profile.currentHp);
  assert.equal(profile.singleTraits410,undefined);assert.equal(profile.chapterTwoAbilities408,undefined);
 }
 if(id==='ch2_fiora')assert.equal(buildOnlinePartyProfile(s.state).skills.find(x=>x.id==='ch2_fiora__guard')?.partyShieldRate,.10);
});
test('411 ordinary monsters keep exact online stats and HP',()=>{
 const u=monster('slime',100,false);for(const hp of [0,1,34,u.maxHp]){u.currentHp=hp;assert.deepEqual(onlineStats411(u),calculatedStats(u));assert.equal(onlineHp411(u),hp);assert.equal(localHp411(u,hp),hp);}
});
test('411 growing body never exports doubled battle stats to the legacy server',async()=>{
 const {b,party,enemies}=await run(['ch2_velg','ch2_grant'],['ch2_grant'],{inspect:true});const u=party[0],raw=rawCalculatedStats410(u);
 enemies[0].hp=0;noteSingleDamage410(b,enemies[0],u);settleSingleDeaths410(b);assert.ok(calculatedStats(u).hp>raw.hp*.25);assert.deepEqual(onlineStats411(u),raw);
});
test('411 actual online HP update converts once; duplicate delivery and failed persistence are atomic',async()=>{
 const x=await run(['ch2_fiora','ch2_lumea'],['ch2_grant'],{inspect:true}),c=x.context,u=x.party[0];c.save.save=()=>true;
 const event={mutationId:'hp411',rosterVitals:[{monsterId:u.id,hp:Math.floor(onlineStats411(u).hp*.4),mp:2}]};
 assert.equal(c.applyOnlineVitalsUpdate(event).ok,true);assert.equal(u.currentHp,40);assert.equal(u.currentMp,2);
 assert.equal(c.applyOnlineVitalsUpdate(event).duplicate,true);assert.equal(u.currentHp,40);
 const before=plain(c.save.state);c.save.save=()=>false;assert.equal(c.applyOnlineVitalsUpdate({...event,mutationId:'fail411'}).ok,false);assert.deepEqual(plain(c.save.state),before);
 c.save.save=()=>true;assert.equal(c.applyOnlineVitalsUpdate({mutationId:'ko411',monsterId:u.id,hp:0,mp:0}).ok,true);assert.equal(c.save.state.monsters[0].currentHp,0);
});
test('411 native checkpoint restore preserves winter progress and shared pair/trait receipts',async()=>{
 const x=await run(['ch2_noctia','ch2_fiora','ch2_sephira','ch2_astrelle'],['ch2_grant'],{inspect:true}),c=x.context;
 for(let r=1;r<=5;r++){x.b.turn=r;naturalSingleAction410(x.b,x.party[0],'ally');}
 await c.resolveTwinResonance385(x.party[2],'ally');c.persistExpeditionSnapshot=()=>null;x.nativeSave();
 const raw=plain(c.save.state),s=save();s.state=raw;assert.equal(s.save(),true);c.save=new SaveService();c.battle=null;c.setTimeout=()=>0;c.renderBattle=()=>{};
 assert.equal(c.resumeSavedBattle(),true);c.prepareBattleUltimates358();
 assert.deepEqual(plain(c.battle.chapterTwoAbilities408),raw.activeBattle.chapterTwoAbilities408);
 assert.deepEqual(plain(c.battle.pairSynergy409),raw.activeBattle.pairSynergy409);
 assert.equal(c.battle.party[1].currentHp,100);
 assert.equal(naturalSingleAction410(c.battle,c.battle.party[0],'ally').kind,'skip');
 assert.equal(Object.values(c.battle.chapterTwoAbilities408.sleepers)[0].ticks,5);
 for(let r=6;r<=10;r++){c.battle.turn=r;assert.equal(naturalSingleAction410(c.battle,c.battle.party[0],'ally').kind,'skip');}
 c.battle.turn=11;assert.equal(naturalSingleAction410(c.battle,c.battle.party[0],'ally').kind,'discharge');assert.equal(c.battle.enemies[0].hp,1);
});
for(const blocked of ['none','read','write'])test(`411 entry always imports current release when cache storage is ${blocked}`,async()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');const entry=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
 const calls=[],removed=[];const context={console:{warn(){}},window:{},navigator:{},localStorage:{getItem(){if(blocked==='read')throw Error('blocked');return '3.1.82-build402'},setItem(k,v){if(blocked==='write')throw Error('quota');calls.push([k,v])},removeItem:k=>removed.push(k)},load:async url=>calls.push(url)};
 vm.createContext(context);await vm.runInContext(entry.replace('await import(', 'await load('),context);
 assert.ok(calls.includes(`./src/main.js?v=${APP_VERSION}-build411`));assert.equal(context.window.__abyssBootComplete,true);assert.deepEqual(removed,[]);
});
