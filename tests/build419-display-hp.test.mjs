import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {run,monster} from '../tools/build423/native-harness.mjs';
import {calculatedStats} from '../src/models/Monster.js';
import {prepareTrial415,cleanupTrial415,appliedTrial419} from '../src/battle/TrialAdaptation415.js';
import {cleanupSingles410} from '../src/battle/SingleTraits410.js';
import {RESONANCE_PAIRS385,resolveTwin385} from '../src/battle/TwinResonance385.js';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
import {unitPreparationHelp419} from '../src/ui/BattlePreparation415.js';

const pairs=RESONANCE_PAIRS385.filter(p=>['glassaria','oathreturn'].includes(p.id));
const ids=pairs.flatMap(p=>p.members);
// Legacy checkpoint fixtures retain the old battle scale until settlement.
const options={trialAdaptation415:{tier:'chapterTwo',units:{}},specialBattle:true,specialBattleType:'chapterTwo',chapterPreparationTier415:0,chapterPreparationElite415:0};
const dispose=f=>{cleanupSingles410(f.b);cleanupTrial415(f.b)};
const cards=html=>html.match(/<button id="enemy-[\s\S]*?<\/button>/g);

for(const [vault,factor] of [[false,28],[true,42]])test(`legacy checkpoint preparation and both reported pairs: HP×${factor} is independent of followups; heal and shield use prepared HP`,async()=>{
 const f=await run(ids,['slime'],{inspect:true,circles:false,battleOptions:{...options,chapterPreparationVault415:vault}});
 try{
  const {b,context:c,party}=f,maximum=party.map(u=>calculatedStats(u).hp);
  for(const [i,u] of party.entries()){
   const entry=appliedTrial419(b,u);assert.equal(entry.rates.hp,factor);assert.equal(maximum[i],entry.naturalHp*factor);
   u.currentHp=Math.floor(maximum[i]/2);
  }
  // Keep the enemy alive and remove presentation only: the production pair
  // orchestrator, HP recovery, shield writer and bonus processing all execute.
  const activate=async pair=>{
   const actor=party.find(u=>u.speciesId===pair.members[0]),env=c.pairBattleEnvironment385(actor,'ally');
   env.cue=async()=>{};env.hit=async()=>1;
   assert.equal(await resolveTwin385(b,actor,'ally',env),true);
   assert.deepEqual(party.map(u=>calculatedStats(u).hp),maximum);
  };
  await activate(pairs.find(p=>p.id==='glassaria'));
  party.forEach((u,i)=>assert.equal(u.currentHp,Math.floor(maximum[i]/2)+Math.floor(maximum[i]*.10)));
  const hpAfterHealing=party.map(u=>u.currentHp);
  await activate(pairs.find(p=>p.id==='oathreturn'));
  assert.deepEqual(party.map(u=>u.currentHp),hpAfterHealing);
  for(const [i,u] of party.entries())assert.equal(b.circleShields[u.id]??0,i>=2?Math.floor(maximum[i]*.18):0);
  for(let i=0;i<10;i++)prepareTrial415(b,calculatedStats);
  assert.deepEqual(party.map(u=>calculatedStats(u).hp),maximum,'render/preparation retries must not stack rates');
 }finally{dispose(f)}
});

test('detail reports the bound unit, is read-only, and excludes a Ten God in an otherwise eligible party',async()=>{
 const god=monster('ten_divinity',1000),f=await run([],['slime'],{inspect:true,partyUnits:[...ids.slice(0,3).map(id=>monster(id,1000)),god],battleOptions:{...options,chapterPreparationVault415:true}});
 try{
  const u=f.party[0],stats=calculatedStats(u),before=JSON.stringify(f.party);
  const entry=appliedTrial419(f.b,u);assert.ok(entry);entry.rates.hp=999;
  for(let i=0;i<10;i++){
   const html=unitPreparationHelp419(f.b,u,stats);
   assert.match(html,/部隊の備え（ペア連携とは別）/);assert.match(html,/HP×42/);
   assert.ok(html.includes(appliedTrial419(f.b,u).naturalHp.toLocaleString('ja-JP')));
   assert.equal(unitPreparationHelp419(f.b,god,calculatedStats(god)),'');
   assert.equal(unitPreparationHelp419({...f.b},u,stats),'','another battle cannot report this binding');
  }
  assert.equal(JSON.stringify(f.party),before);assert.deepEqual(calculatedStats(u),stats);
  dispose(f);assert.equal(unitPreparationHelp419(f.b,u,calculatedStats(u)),'');
 }finally{dispose(f)}
});

test('HP100 fixed ability is explained as an exception; online has no preparation detail',async()=>{
 for(const onlineMode of [false,'explore']){
  const f=await run(['ch2_fiora',...ids.slice(0,3)],['slime'],{inspect:true,battleOptions:{...options,chapterPreparationVault415:true,onlineMode}});
  try{
   const u=f.party[0];assert.equal(calculatedStats(u).hp,100);
   const html=unitPreparationHelp419(f.b,u,calculatedStats(u));
   if(onlineMode)assert.equal(html,'');else{assert.match(html,/最大HPは100のまま/);assert.doesNotMatch(html,/HP×42/);}
  }finally{dispose(f)}
 }
});

test('same regular enemies render identical name, rank, HP and magic-circle card markup in both chapters',async()=>{
 const f=await run(ids,['ch2_seria','ch2_rostia','slime','ch2_althea'],{inspect:true,battleOptions:options});
 try{
  const settings=f.context.save.state.settings;
  const first=cards(BattleScreen({...f.b,specialBattle:false,specialBattleType:undefined},{},settings,100));
  const second=cards(BattleScreen(f.b,{},settings,100));
  // Sprite clip IDs intentionally increment on every render.
  const stable=rows=>rows.map(row=>row.replace(/chapter-atlas-\d+/g,'chapter-atlas-ID'));
  assert.equal(first.length,4);assert.deepEqual(stable(second),stable(first));
  for(const card of second){assert.match(card,/combat-rank-badge/);assert.match(card,/enemy-card-name/);assert.match(card,/enemy-card-meta/);assert.match(card,/bar-label">HP /);}
 }finally{dispose(f)}
});

test('chapter-two bosses retain rank and full escaped names in the HP card, including long names',async()=>{
 const f=await run(ids,['ch2_rostia','ch2_seria'],{inspect:true,battleOptions:options,boss:true});
 try{
  Object.assign(f.enemies[0],{faction:'tenGod',endgameBossId:'ten_divinity',name:'十神VII 支配'});
  f.enemies[1].name='長い名前の敵 <試験&確認>「終わりの記憶」';
  const html=cards(BattleScreen(f.b,{},f.context.save.state.settings,100));
  assert.match(html[0],/rank-ten-god">十神<\/span><b/);
  for(const card of html){assert.doesNotMatch(card,/boss-meta-only/);assert.match(card,/enemy-card-name/);}
  assert.ok(html[1].includes('&lt;試験&amp;確認&gt;'));assert.ok(!html[1].includes('<試験&確認>'));
 }finally{dispose(f)}
});

test('battle display aliases retain their verified build and config resolves to the current release',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
 for(const path of ['src/main.js','src/core/config.js','src/ui/screens/BattleScreen.js','src/battle/TrialAdaptation415.js','src/ui/BattlePreparation415.js']){
  const entries=Object.entries(map).filter(([key])=>key.split('?')[0]==='./'+path);assert.ok(entries.length);
  for(const [,value] of entries)assert.equal(value,`./${path}?v=${['src/main.js','src/core/config.js','src/ui/screens/BattleScreen.js'].includes(path)?'3.1.102-build423':'3.1.101-build422'}`);
 }
 for(const build of [380,382])assert.ok(html.includes(`build${build}-chapter-two.css?v=3.1.98-build419`));
});
