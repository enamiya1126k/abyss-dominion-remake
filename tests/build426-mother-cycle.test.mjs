import test from 'node:test';import assert from 'node:assert/strict';
import {run,rng} from '../tools/build430/native-harness.mjs';
import {MOTHER_ENEMY422,tuneMother422} from '../src/primordial/Mother422.js';
import {createEnemyBattleState} from '../src/battle/EnemyAI.js';
import {SPECIES} from '../src/data/species.js';
import {prepareMother426,beginMotherAttack426,endMotherAttack426,endMotherRound426,motherCycleText426,MOTHER_SUMMON_POOL426} from '../src/primordial/Cycle426.js';
import {buildTurnQueue} from '../src/battle/TurnSystem.js';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
import {motherDialDue424} from '../src/primordial/Dial424.js';
export const boss=()=>tuneMother422(createEnemyBattleState(SPECIES.ch2_ionea,{...MOTHER_ENEMY422,id:'mother426'},1));
const ids=['ch2_nemesia','ch2_everia','ch2_aeriel','ch2_vespera'];
async function fixture(team=ids){const f=await run(team,[],{inspect:true,level:6000,gear:true,enemyUnits:[boss()],battleOptions:{specialBattle:true,specialBattleType:'mother422',motherDial424:{lastRound:1,index:7}}});f.b.enemies[0].hp=799999;return f;}
function hit(f,amount=10,extra={}){const a=f.b.party[0];f.context.applyEnemyDamage(f.b,f.b.enemies[0],amount,{sourceId:a.id,damageClass:'physical',...extra});}
function attack(f,amount=10,extra={}){beginMotherAttack426(f.b,f.b.party[0]);hit(f,amount,extra);}
function fallen(f){attack(f);const m=f.b.enemies[0];m.hp=0;assert.equal(m.hp,1);m.hp=0;assert.equal(m.hp,0);return m;}

test('ordinary hits summon once per attack, use at most three slots, and join next round',async()=>{const f=await fixture(),m=f.b.enemies[0];attack(f);for(let i=0;i<12;i++)hit(f,10,{traitCause410:'followup'});assert.equal(f.b.enemies.length,2);attack(f);attack(f);attack(f);assert.equal(f.b.enemies.length,4);for(const child of f.b.enemies.slice(1)){assert.ok(MOTHER_SUMMON_POOL426.includes(child.speciesId));assert.ok(child.level>=2500&&child.level<=4500);assert.equal(child.enemyGear.length,3);assert.ok(child.uncapturable&&child.noItemDrops);assert.equal(child.readyRound426,2);}buildTurnQueue(f.b);assert.equal(f.b.turnQueue.filter(x=>x.type==='enemy').length,1);f.b.turn=2;buildTurnQueue(f.b);assert.equal(f.b.turnQueue.filter(x=>x.type==='enemy').length,4);const old=f.b.enemies[1].id;f.b.enemies[1].hp=0;attack(f);assert.equal(f.b.enemies.length,4);assert.notEqual(f.b.enemies[1].id,old);assert.equal(f.b.enemies[1].readyRound426,3);assert.equal(f.b.enemies[0],m);});

test('poison, counters, reflection, echoes and guarded hits do not summon',async()=>{for(const extra of [{sourceId:'status:poison'}, {traitCause410:'reflection'}, {traitCause410:'trait'}, {relicKind394:'counter'}, {relicKind394:'pairCounter'}, {relicKind394:'excluded'}]){const f=await fixture();attack(f,100,extra);assert.equal(f.b.enemies.length,1,JSON.stringify(extra));}const f=await fixture();f.b.enemies[0]._floorBossHpShield=1000;attack(f,10);assert.equal(f.b.enemies.length,1);endMotherAttack426(f.b);hit(f,10000);assert.equal(f.b.enemies.length,1);});

test('one battle-local guts works through native damage and direct ultimate HP writers',async()=>{for(const team of [ids,['ten_life','ten_time','abyss_wrath','abyss_gluttony']]){const f=await fixture(team),m=f.b.enemies[0];attack(f,1000000000);assert.equal(m.hp,1);assert.equal(f.b.motherCycle426.gutsUsed,true);m.hp=0;assert.equal(m.hp,0);assert.ok(f.b.enemies.length>1);assert.equal(motherDialDue424(f.b),false);const html=BattleScreen(f.b,{},f.context.save.state.settings);assert.doesNotMatch(html,/mother-intent423/);assert.match(motherCycleText426(f.b),/母の復活まで あと5ラウンド/);}});

test('countdown starts after death round, survives five complete rounds, then returns exactly 30% once',async()=>{const f=await fixture(),m=fallen(f);f.b.enemyEffects[m.id]=[{kind:'regen',value:.5,turns:8}];assert.equal(endMotherRound426(f.b),false);for(let r=2;r<=5;r++){f.b.turn=r;assert.equal(endMotherRound426(f.b),false);assert.equal(f.b.motherCycle426.remaining,6-r);assert.equal(endMotherRound426(f.b),false);assert.equal(m.hp,0);}f.b.turn=6;assert.equal(endMotherRound426(f.b),true);assert.equal(m.hp,480000);assert.equal(f.b.motherCycle426.gutsUsed,true);assert.equal(f.b.motherCycle426.reviveUsed,true);assert.deepEqual(f.b.enemyEffects[m.id],[]);m.hp=0;for(let r=7;r<20;r++){f.b.turn=r;assert.equal(endMotherRound426(f.b),false);}assert.equal(m.hp,0);});

test('last child defeated on the fifth round prevents revival; native flow awards victory',async()=>{const f=await fixture();fallen(f);f.b.turn=6;f.b.enemies[1].hp=0;assert.equal(endMotherRound426(f.b),false);f.b.turnQueue=[];f.b.queueIndex=0;f.b.busy=false;await f.context.endRound();assert.equal(f.b.outcome,'win');assert.equal(f.b.enemies[0].hp,0);});

test('generic healing/revive cannot bring back the mother early or mint a second revival',async()=>{const f=await fixture(),m=fallen(f);m.hp=m.maxHp;assert.equal(m.hp,0);await f.context.resolveEnemySpecialAction(f.b.enemies[1],'packRevive');assert.equal(m.hp,0);f.b.turn=6;endMotherRound426(f.b);m.hp=0;m.hp=1;assert.equal(m.hp,0);});

test('checkpoint serialization carries roster, rolled equipment, guts and exact remaining rounds',async()=>{const f=await fixture();fallen(f);f.b.turn=3;endMotherRound426(f.b);f.context.snapshot=null;f.nativeSave();const data=JSON.parse(JSON.stringify(f.context.save.state.activeBattle));assert.equal(data.motherCycle426.remaining,3);assert.equal(data.motherCycle426.gutsUsed,true);assert.equal(data.enemies.length,2);const resumed={...data,party:f.b.party};prepareMother426(resumed);assert.equal(motherCycleText426(resumed),motherCycleText426(f.b));for(let r=4;r<=6;r++){resumed.turn=r;endMotherRound426(resumed);}assert.equal(resumed.enemies[0].hp,480000);assert.equal(resumed.motherCycle426.reviveUsed,true);assert.deepEqual(resumed.enemies[1].enemyGear,data.enemies[1].enemyGear);});

test('old active 425 mothers do not gain new abilities in the middle of a fight',async()=>{const m=boss();delete m.motherRevision426;const f=await run(ids,[],{inspect:true,enemyUnits:[m],battleOptions:{specialBattleType:'mother422'}});assert.equal(prepareMother426(f.b),null);f.b.enemies[0].hp=0;assert.equal(f.b.enemies[0].hp,0);assert.equal(f.b.motherCycle426,undefined);});

test('real automatic command follows native multi-target and turn flow with dynamic summons',async()=>{const result=await run(ids,[],{level:6000,gear:true,circles:true,seed:7,maxRounds:40,trace:true,enemyUnits:[boss()],battleOptions:{specialBattle:true,specialBattleType:'mother422'}});assert.ok(result.won||result.lost);assert.ok(result.trace.some(row=>row.enemies.length>1));});

test('actual resume path preserves a fallen mother and does not replay an already committed summon',async()=>{
 const f=await fixture(),c=f.context,s=c.save.state;s.player.inRun=false;s.chapterTwo376={areaClears378:{4:1}};const {beginMother422}=await import('../src/primordial/State422.js');f.b.battleId=beginMother422(s).id;
 fallen(f);f.b.turn=3;endMotherRound426(f.b);f.b.actionCommitted=true;buildTurnQueue(f.b);f.nativeSave();s.activeBattle=JSON.parse(JSON.stringify(s.activeBattle));const gear=JSON.stringify(s.activeBattle.enemies[1].enemyGear);c.battle=null;c.setTimeout=()=>0;assert.equal(f.nativeResume(),true);
 const b=c.battle;assert.equal(b.enemies[0].hp,0);assert.equal(b.motherCycle426.remaining,3);assert.equal(b.motherCycle426.totalSummons,1);assert.equal(JSON.stringify(b.enemies[1].enemyGear),gear);assert.equal(motherDialDue424(b),false);
 c.prepareBattleUltimates358();c.prepareBattleUltimates358();b.enemies[0].hp=999;assert.equal(b.enemies[0].hp,0);
 for(let r=4;r<=6;r++){b.turn=r;endMotherRound426(b);}assert.equal(b.enemies[0].hp,480000);b.enemies[0].hp=0;assert.equal(b.enemies[0].hp,0);assert.equal(b.motherCycle426.gutsUsed,true);
});

test('poison from a named player can consume guts but cannot trigger a summon',async()=>{const f=await fixture(),m=f.b.enemies[0];beginMotherAttack426(f.b,f.b.party[0]);f.b.enemyStatuses[m.id]=[{id:'poison',power:2,turns:2,sourceMonsterId:f.b.party[0].id}];f.context.processEnemyStatuses(f.b);assert.equal(m.hp,1);assert.equal(f.b.enemies.length,1);f.context.processEnemyStatuses(f.b);assert.equal(m.hp,0);assert.equal(f.b.enemies.length,1);});

test('summon death before the mother does not arm a revival countdown',async()=>{const f=await fixture();attack(f);f.b.enemies[1].hp=0;for(let r=2;r<=8;r++){f.b.turn=r;endMotherRound426(f.b);}assert.equal(f.b.motherCycle426.deathRound,null);assert.equal(f.b.motherCycle426.reviveUsed,false);});

test('a partner follow-up can trigger the one summon even when the first attacker missed',async()=>{const f=await fixture();beginMotherAttack426(f.b,f.b.party[0]);hit(f,100,{sourceId:f.b.party[1].id,relicKind394:'pair'});assert.equal(f.b.enemies.length,2);hit(f,100);assert.equal(f.b.enemies.length,2);});

test('native endRound itself advances the full death grace period and revives before the next queue',async()=>{const f=await fixture(),m=fallen(f);for(let completed=1;completed<=6;completed++){await f.context.endRound();assert.equal(f.b.turn,completed+1);assert.equal(m.hp,completed<6?0:480000);}assert.ok(f.b.turnQueue.some(entry=>entry.id===m.id));assert.equal(f.b.motherCycle426.reviveUsed,true);});
