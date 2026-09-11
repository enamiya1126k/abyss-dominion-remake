import test from 'node:test';import assert from 'node:assert/strict';
import * as T from '../src/battle/SingleTraits410.js';
import {DEBUFF_CONVERSIONS408,createAbilityState408,deathGrowthStacks408} from '../src/battle/ChapterTwoAbilityRuntime408.js';
import {createBattleRulesState,applyBattleEffect,applyEnemyStatus,effectValue,applyEnemyDamage,processAllyEffects,processEnemyStatuses,tickBattleEffects} from '../src/battle/BattleRules.js';
import {createMonster,calculatedStats,rawCalculatedStats410} from '../src/models/Monster.js';
import {prepareUltimateBattle,beginUltimateAction,singleTerminalVital410,cleanupUltimateBattle} from '../src/core/EndgameUltimateSystem.js';
import {writePairShield409} from '../src/battle/PairSynergy409.js';
import {twinCodex385} from '../src/ui/TwinStatus385.js';
const ordinary='ch2_grant',opposite=s=>s==='ally'?'enemy':'ally';
function fixture(ids,side='ally',foes=[ordinary,ordinary]){
 const make=(speciesId,id,team)=>team==='ally'?createMonster(speciesId,{id,level:1500,traitId:'steady'}):{id,speciesId,name:speciesId,hp:10000,maxHp:10000,atk:1000,matk:1000,def:100,mdef:100,spd:100,currentMp:1000,maxMp:1000};
 const own=ids.map((s,i)=>make(s,'own'+i,side)),enemy=foes.map((s,i)=>make(s,'foe'+i,opposite(side)));for(const u of [...own,...enemy])if('currentHp'in u){u.currentHp=rawCalculatedStats410(u).hp;u.maxHp=u.currentHp;u.currentMp=1000;}
 const b={...createBattleRulesState(side==='ally'?own:enemy),party:side==='ally'?own:enemy,enemies:side==='enemy'?own:enemy,turn:1,circleShields:{},signatureShields:{}};
 const hit=(target,targetSide,plan,source)=>{singleTerminalVital410(b,target,plan.hpFloor,source);T.noteSingleDamage410(b,target,source,{kind:'trait'});};
 const calls=[],env={stats:calculatedStats,rawStats:rawCalculatedStats410,terminal:hit,damage:(u,s,p)=>calls.push({u,s,p})};T.prepareSingles410(b,env);
 const field=s=>s==='ally'?'currentHp':'hp',kill=(u,source=enemy[0],kind='primary')=>{u[field(b.party.includes(u)?'ally':'enemy')]=0;T.noteSingleDamage410(b,u,source,{kind});},settle=()=>T.settleSingleDeaths410(b);
 return{b,own,enemy,side,env,calls,kill,settle,field,hp:u=>u[field(b.party.includes(u)?'ally':'enemy')],set:(u,n)=>u[field(b.party.includes(u)?'ally':'enemy')]=n};
}
for(const side of ['ally','enemy']){
 for(const[id,[buff,value]]of Object.entries(DEBUFF_CONVERSIONS408))test(`${side}: ${id} converts before resistance, without derived stun`,()=>{
  const f=fixture(['ch2_lumea'],side),u=f.own[0],source=f.enemy[0];u.statusProfile={immune:[id]};const e={kind:id,id,value:.4,power:.05,turns:3,chance:1,sourceMonsterId:source.id};
  const applied=side==='enemy'&&['poison','burn','bleed','sleep','freeze','paralysis','shock','curse'].includes(id)?applyEnemyStatus(f.b,e,u.id):applyBattleEffect(f.b,u.id,e,side);
  assert.equal(applied,true);assert.equal(effectValue(f.b,u.id,buff,side),value);const controls=side==='ally'?f.b.allyEffects:f.b.enemyEffects;assert.ok(!(controls[u.id]??[]).some(x=>x.kind===id||x.sourceStatusId));assert.equal((side==='ally'?f.b.allyAilments:f.b.enemyStatuses)[u.id]?.length??0,0);
  applyBattleEffect(f.b,u.id,e,side);assert.equal(effectValue(f.b,u.id,buff,side),value);
 });
 test(`${side}: pact once per species across revival; secondary pact cannot chain`,()=>{
  const f=fixture(['ch2_senela','ch2_senela'],side,['ch2_senela',ordinary]);f.kill(f.own[0]);f.settle();assert.equal(f.hp(f.enemy[0]),0);assert.equal(f.hp(f.own[1])>0,true);
  f.set(f.own[0],1);f.kill(f.own[0],f.enemy[1]);f.kill(f.own[1],f.enemy[1]);f.settle();assert.ok(f.hp(f.enemy[1])>0);
 });
 test(`${side}: pact ignores self, ally, reflection, costs and followups`,()=>{
  for(const kind of ['reflection','trait','cost','followup','counter']){const f=fixture(['ch2_senela'],side);f.kill(f.own[0],f.enemy[0],kind);f.settle();assert.ok(f.hp(f.enemy[0])>0,kind);}
  const f=fixture(['ch2_senela',ordinary],side);f.kill(f.own[0],f.own[1]);f.settle();assert.ok(f.hp(f.enemy[0])>0);
 });
 test(`${side}: pact killer selection and protected MATK coefficient`,()=>{
  const f=fixture(['ch2_senela'],side);f.enemy[1].boss=true;f.kill(f.own[0],f.enemy[1]);f.settle();assert.equal(f.calls.length,1);assert.equal(f.calls[0].u,f.enemy[1]);const raw=T.singleState410(f.b).entries[JSON.stringify([side,f.own[0].id])].raw;assert.equal(f.calls[0].p.requestedDamage,Math.floor(raw.matk*.5)*4);
 });
 test(`${side}: hibernation skips ten actions, discharges on eleven, no extra ticks`,()=>{
  const f=fixture(['ch2_noctia'],side);for(let i=1;i<=10;i++){f.b.turn=i;assert.equal(T.naturalSingleAction410(f.b,f.own[0],side).kind,'skip');T.naturalSingleAction410(f.b,f.own[0],side,{natural:false});T.naturalSingleAction410(f.b,f.own[0],side);assert.equal(Object.values(f.b.chapterTwoAbilities408.sleepers)[0].ticks,i);}
  f.b.turn=11;assert.equal(T.naturalSingleAction410(f.b,f.own[0],side).kind,'discharge');f.enemy.forEach(u=>assert.equal(f.hp(u),1));f.b.turn=12;assert.equal(T.naturalSingleAction410(f.b,f.own[0],side).kind,'none');
 });
 test(`${side}: sleep/control does not count; death before first action and later revive permanently cancels`,()=>{
  const f=fixture(['ch2_noctia'],side);(side==='ally'?f.b.allyEffects:f.b.enemyEffects)[f.own[0].id]=[{kind:'stun',turns:2}];assert.equal(T.naturalSingleAction410(f.b,f.own[0],side).kind,'none');assert.equal(Object.keys(f.b.chapterTwoAbilities408.sleepers).length,0);f.kill(f.own[0]);f.settle();f.set(f.own[0],1);(side==='ally'?f.b.allyEffects:f.b.enemyEffects)[f.own[0].id]=[];f.b.turn=2;assert.equal(T.naturalSingleAction410(f.b,f.own[0],side).kind,'none');
 });
 test(`${side}: absorbed death count is unique, shared, capped and does not heal`,()=>{
  const f=fixture(['ch2_velg','ch2_velg',ordinary,ordinary],side,[ordinary,ordinary,ordinary,ordinary]);const u=f.own[0],before=f.hp(u),base=side==='ally'?calculatedStats(u).atk:u.atk;
  f.kill(f.enemy[0],u);f.settle();assert.equal(f.hp(u),before);assert.equal(side==='ally'?calculatedStats(u).atk:u.atk,base*2+(base%1));assert.equal(deathGrowthStacks408(f.b.chapterTwoAbilities408,{side,speciesId:u.speciesId}),1);
  f.set(f.enemy[0],10);f.kill(f.enemy[0],u);f.settle();assert.equal(deathGrowthStacks408(f.b.chapterTwoAbilities408,{side,speciesId:u.speciesId}),1);
  for(const foe of f.enemy.slice(1)){f.kill(foe,u);}f.settle();assert.equal(deathGrowthStacks408(f.b.chapterTwoAbilities408,{side,speciesId:u.speciesId}),3);assert.equal(f.hp(u),before);
 });
 test(`${side}: dead absorber gets no simultaneous batch; captures and summons excluded`,()=>{
  const f=fixture(['ch2_velg'],side);f.kill(f.own[0]);f.kill(f.enemy[0],f.own[0]);f.settle();assert.equal(deathGrowthStacks408(f.b.chapterTwoAbilities408,{side,speciesId:'ch2_velg'}),0);
  const g=fixture(['ch2_velg'],side);g.enemy[0].captured=true;g.kill(g.enemy[0],g.own[0]);const summoned={...g.enemy[1],id:'summoned',summoned:true};(side==='ally'?g.b.enemies:g.b.party).push(summoned);T.prepareSingles410(g.b,g.env);g.kill(summoned,g.own[0]);g.settle();assert.equal(deathGrowthStacks408(g.b.chapterTwoAbilities408,{side,speciesId:'ch2_velg'}),0);
 });
 test(`${side}: paper body stays HP100; all shields rejected; opening and actions share quota`,()=>{
  const f=fixture(['ch2_fiora',ordinary,'ch2_fiora'],side),u=f.own[0],other=f.own[1],k=JSON.stringify([side,other.id]);assert.equal(u.maxHp,100);assert.equal(f.hp(u),100);
  u.shield=u.heroShield348=u._floorBossHpShield=u.divineBarrier=999;f.b.circleShields[u.id]=999;f.b.signatureShields[u.id]=999;writePairShield409(f.b,side,u,.25,'wings');f.set(u,9999);assert.equal(f.hp(u),100);assert.equal(u.heroShield348,0);assert.equal(f.b.circleShields[u.id],0);assert.equal(u._floorBossHpShield,0);
  const amount=f.b.singleTraits410.shields[k].amount;assert.equal(amount,Math.floor(f.b.singleTraits410.entries[k].maxHp*.08));T.absorbPaperShield410(f.b,other,amount);assert.equal(T.refreshPaperShield410(f.b,u,side,'skill'),false);assert.equal(f.b.singleTraits410.shields[k].amount,0);
  f.b.turn=2;T.naturalSingleAction410(f.b,u,side);assert.equal(f.b.singleTraits410.shields[k].amount,amount);T.naturalSingleAction410(f.b,f.own[2],side);assert.equal(f.b.singleTraits410.shields[k].amount,amount);f.kill(u);f.kill(f.own[2]);f.settle();assert.equal(T.absorbPaperShield410(f.b,other,10),0);f.b.turn=4;assert.equal(T.absorbPaperShield410(f.b,other,10),10);
 });
 test(`${side}: automatic rescue precedes pact/growth/hibernation cancellation`,()=>{
  const f=fixture(['ch2_senela','ch2_noctia','ch2_velg'],side);f.b._singleEnv410.rescue=(u)=>f.set(u,1);f.kill(f.own[0]);f.kill(f.own[1]);f.settle();assert.ok(f.hp(f.enemy[0])>0);assert.equal(Object.keys(f.b.chapterTwoAbilities408.deaths).length,0);assert.equal(T.naturalSingleAction410(f.b,f.own[1],side).kind,'skip');
 });
}
test('inversion requires actual hostile landing; no self costs, reflection or authority conversion',()=>{
 const f=fixture(['ch2_lumea',ordinary]),u=f.own[0];for(const extra of [{sourceMonsterId:u.id},{sourceMonsterId:f.own[1].id},{source:'reflection',sourceMonsterId:f.enemy[0].id},{ultimate358:true,sourceMonsterId:f.enemy[0].id},{selfCost:true,sourceMonsterId:f.enemy[0].id},{unconvertible:true,sourceMonsterId:f.enemy[0].id}]){assert.equal(T.invertSingleDebuff410(f.b,u,{kind:'atkDown',...extra},'ally'),false);}
 assert.equal(applyBattleEffect(f.b,u.id,{kind:'atkDown',chance:0,sourceMonsterId:f.enemy[0].id},'ally'),false);assert.equal(effectValue(f.b,u.id,'atkUp'),0);
});
test('native DoT records hostile killer on both sides',()=>{
 for(const side of ['ally','enemy']){const f=fixture(['ch2_senela'],side),u=f.own[0];f.set(u,1);const poison={id:'poison',name:'毒',power:.1,turns:3,sourceMonsterId:f.enemy[0].id,fromSide:opposite(side)};(side==='ally'?f.b.allyAilments:f.b.enemyStatuses)[u.id]=[poison];if(side==='ally')processAllyEffects(f.b,calculatedStats);else processEnemyStatuses(f.b);f.settle();assert.equal(f.hp(f.enemy[0]),0);}
});
test('terminal protection covers boss catalog, gods, abyss, raids and online',()=>{
 for(const changes of [{boss:true},{floorBossCatalogId:'any'},{endgameBossId:'any'},{faction:'tenGod'},{endgameFaction:'abyss'},{storyProtected:true},{instantDeathImmune:true}])assert.equal(T.protectedSingleTarget410({},changes),true);
 for(const changes of [{onlineMode:true},{mode:'pvp'},{raid:true}])assert.equal(T.protectedSingleTarget410(changes,{}),true);
});
test('trait state + HP JSON reload preserves spent pact, sleep ticks, growth and shield duration',()=>{
 const f=fixture(['ch2_senela','ch2_noctia','ch2_velg','ch2_fiora']);T.naturalSingleAction410(f.b,f.own[1],'ally');f.kill(f.own[0]);f.settle();const saved=JSON.parse(JSON.stringify(f.b));saved.singleTraits410=T.createSingleState410(saved.singleTraits410);saved.chapterTwoAbilities408=createAbilityState408(saved.chapterTwoAbilities408);const before=JSON.stringify(saved);T.prepareSingles410(saved,f.env);assert.equal(saved.party[0].currentHp,0);assert.equal(Object.values(saved.chapterTwoAbilities408.sleepers)[0].ticks,1);assert.equal(deathGrowthStacks408(saved.chapterTwoAbilities408,{side:'ally',speciesId:'ch2_velg'}),2);assert.equal(saved.party[3].currentHp,100);assert.ok(before.includes('singleTraits410'));
});
test('calculated weak bodies apply after gear; growth is removed without permanent stat mutations',()=>{
 for(const speciesId of Object.keys(T.SINGLE_TRAITS410)){const u=createMonster(speciesId,{level:1500});u._equipmentStats={hp:100000,atk:50000,matk:40000};const original=JSON.stringify(u),raw=rawCalculatedStats410(u),stats=calculatedStats(u),def=T.singleTrait410(u);assert.equal(stats.hp,def.fixedMaxHp??Math.floor(raw.hp*def.entryMultipliers.hp));assert.equal(stats.atk,Math.floor(raw.atk*def.entryMultipliers.atk));assert.equal(JSON.stringify(u),original);assert.match(twinCodex385(u),/特殊能力/);}
});
test('legacy control-as-stun keeps the original ailment mapping',()=>{
 for(const[id,buff]of [['fear','atkUp'],['charm','accuracyUp'],['confusion','accuracyUp'],['sleep','spdUp']]){const f=fixture(['ch2_lumea']);assert.equal(applyBattleEffect(f.b,f.own[0].id,{kind:'stun',statusId:id,chance:1,sourceMonsterId:f.enemy[0].id,turns:2},'ally'),true);assert.equal(effectValue(f.b,f.own[0].id,buff),.12);assert.equal(effectValue(f.b,f.own[0].id,'stun'),0);}
});
test('strong ordinary regeneration and conversion regeneration use the maximum, not a sum',()=>{
 const f=fixture(['ch2_lumea']),u=f.own[0];f.set(u,1);applyBattleEffect(f.b,u.id,{kind:'regen',value:.1,turns:2,sourceMonsterId:u.id},'ally');applyBattleEffect(f.b,u.id,{kind:'healDown',chance:1,sourceMonsterId:f.enemy[0].id},'ally');const before=f.hp(u);processAllyEffects(f.b,calculatedStats);assert.equal(f.hp(u)-before,Math.floor(calculatedStats(u).hp*.1));
});
test('battle cleanup removes growth and clamps excess HP without granting healing',()=>{
 const f=fixture(['ch2_velg']);const u=f.own[0],base=calculatedStats(u).hp;f.kill(f.enemy[0],u);f.settle();f.set(u,calculatedStats(u).hp);assert.ok(f.hp(u)>base);cleanupUltimateBattle(f.b);T.cleanupSingles410(f.b);assert.equal(calculatedStats(u).hp,base);assert.equal(u.currentHp,base);assert.equal(u.maxHp,base);
});
test('an already fallen opening party member is not a new death to absorb',()=>{
 const f=fixture(['ch2_velg',ordinary]);T.cleanupSingles410(f.b);f.own[1].currentHp=0;delete f.b.singleTraits410;f.b.chapterTwoAbilities408=createAbilityState408();T.prepareSingles410(f.b,f.env);f.settle();assert.equal(deathGrowthStacks408(f.b.chapterTwoAbilities408,{side:'ally',speciesId:'ch2_velg'}),0);
});
test('legacy hostile status insertion retains its origin for lethal DoT after save',()=>{
 const f=fixture(['ch2_senela']);beginUltimateAction(f.b,f.enemy[0]);assert.equal(applyBattleEffect(f.b,f.own[0].id,{kind:'poison',id:'poison',power:.2,chance:1},'ally'),true);const poison=JSON.parse(JSON.stringify(f.b.allyAilments[f.own[0].id][0]));assert.equal(poison.fromSide,'enemy');assert.equal(poison.sourceMonsterId,f.enemy[0].id);f.set(f.own[0],1);f.b.allyAilments[f.own[0].id]=[poison];processAllyEffects(f.b,calculatedStats);f.settle();assert.equal(f.hp(f.enemy[0]),0);
});
test('equipment normalization before resume preserves grown HP rather than clamping to weak entry HP',()=>{
 const f=fixture(['ch2_velg']),u=f.own[0];f.kill(f.enemy[0],u);f.settle();u.currentHp=calculatedStats(u).hp;const saved=JSON.parse(JSON.stringify(f.b)),restored=saved.party[0],plain=calculatedStats(restored),natural=T.savedSingleStats410(plain,restored,saved);assert.ok(restored.currentHp>plain.hp);assert.equal(natural.hp,restored.currentHp);assert.equal(Math.min(natural.hp,restored.currentHp),restored.currentHp);
});
