import {CHAPTER_TWO_PAIRS392} from '../src/data/chapterTwoPairs392.js';
import {chapterTwoSprite383} from '../src/ui/ChapterTwoSprite383.js';
import {monsterVisual} from '../src/ui/MonsterVisual.js';
import {tickBattleEffects} from '../src/battle/BattleRules.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {SPECIES} from '../src/data/species.js';
import {CHAPTER_TWO_SPECIES392} from '../src/data/chapterTwoSpecies392.js';
import {chapterTwoCaptureChance383} from '../src/data/chapterTwoSpecies383.js';
import {CHAPTER_TWO_ACTIONS392} from '../src/chapterTwo/ChapterTwoMonsters392.js';
import {CHAPTER_TWO_SPRITES392} from '../src/data/chapterTwoSprites392.js';
import {chapterTwoFrame383,chapterTwoCanvasFrame383} from '../src/ui/ChapterTwoSprite383.js';
import {createMonster,calculatedStats,displayName} from '../src/models/Monster.js';
import {learnedSkills,allSpeciesSkills,maxMp,skillDamage,chooseAutoBattleDecision} from '../src/battle/SkillSystem.js';
import {createEnemyBattleState,chooseEnemyAction,specialActionInfo,enemyActionMpCost} from '../src/battle/EnemyAI.js';
import {applyEnemyDamage,applyBattleEffect,hasEffect,effectValue} from '../src/battle/BattleRules.js';
import {ENCOUNTERS,chapterTwoEnemyEntries,tuneChapterTwoEnemy,CHAPTER_TWO_AREAS} from '../src/chapterTwo/ChapterTwoSystem.js';
import {eligibleEncounterSpecies} from '../src/core/EncounterPoolSystem.js';
import {SaveService} from '../src/services/SaveService.js';
import {TWIN_PAIRS385,twinPair385,twinReady385,reserveTwin385,resolveTwin385,queuePairCounter390,resolvePairCounters390} from '../src/battle/TwinResonance385.js';
import {twinStatus385,twinCodex385} from '../src/ui/TwinStatus385.js';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
const roster=Object.values(CHAPTER_TWO_SPECIES392),main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

test('dream twins deliberately prepare sleep and pursue it in both AIs; zero MP falls back to attack',()=>{
 const enemies=encounter('roam1_3_392'),b=state(['tillea']);
 assert.equal(chooseEnemyAction(enemies[0],{allies:enemies,opponents:b.party,battle:b}),'ch2_morina__lull');
 b.allyAilments[b.party[0].id]=[{id:'sleep',turns:1}];
 assert.equal(chooseEnemyAction(enemies[1],{allies:enemies,opponents:b.party,battle:b}),'ch2_elmize__harvest');
 enemies[1].currentMp=0;assert.equal(chooseEnemyAction(enemies[1],{allies:enemies,opponents:b.party,battle:b}),'attack');
 const p=state(['morina','elmize']);p.party.forEach(u=>u._maxHp=calculatedStats(u).hp);
 assert.equal(chooseAutoBattleDecision(p.party[0],p).skill?.id,'ch2_morina__lull');
 p.enemyStatuses.e=[{id:'sleep',turns:1}];assert.equal(chooseAutoBattleDecision(p.party[1],p).skill?.id,'ch2_elmize__harvest');
});
test('sleep amplification is recalculated after cleansing and enemy followups pass the same hybrid rules',async()=>{
 const b=state(['morina','elmize']);b.enemyStatuses.e=[{id:'sleep',turns:1}];const {c}=runtime(b),before=b.enemies[0].hp;
 await c.resolveTwinResonance385(b.party[0]);const boosted=before-b.enemies[0].hp;b.enemyStatuses.e=[];
 b.enemies[0].hp=before;b.turn++;await c.resolveTwinResonance385(b.party[0]);assert.ok(boosted>(before-b.enemies[0].hp)*1.75);
 for(const asleep of [false,true]){const e=state(['tillea']);e.enemies=encounter('roam1_3_392');if(asleep)e.allyAilments[e.party[0].id]=[{id:'sleep',turns:1}];const {c:enemy,hits}=runtime(e);await enemy.resolveTwinResonance385(e.enemies[0],'enemy');assert.equal(hits.length,1);assert.equal(hits[0].p,3.2*(asleep?1.8:1));assert.equal(hits[0].rules.damageClass,'hybrid');assert.equal(hits[0].rules.defenseIgnore,.3);}
});
test('dragon resonance removes exactly one positive effect per living target before damage on both sides',async()=>{
 for(const side of ['ally','enemy']){
  const b=state(side==='ally'?['dracia','rucie']:['tillea','morina','elmize','everia']);if(side==='enemy')b.enemies=encounter('roam3_1_392');
  else b.enemies=Array.from({length:4},(_,i)=>({id:'target'+i,hp:1e10,maxHp:1e10,def:100,mdef:100,element:'neutral'}));
  const targets=side==='ally'?b.enemies:b.party,effects=side==='ally'?b.enemyEffects:b.allyEffects;
  for(const u of targets){effects[u.id]=[{kind:'atkUp',value:.2,turns:2},{kind:'defUp',value:.2,turns:2},{kind:'healDown',value:.4,turns:2}];u.enemyMagicCircle={id:'sentinel'};if(side==='ally')u._floorBossHpShield=888;else b.circleShields[u.id]=888;}
  targets[2].isolated=true;if(side==='ally')targets[3].hp=0;else targets[3].currentHp=0;
  const {c}=runtime(b),actor=(side==='ally'?b.party:b.enemies)[0],env=c.pairBattleEnvironment385(actor,side),hit=env.hit;
  let checks=0;env.hit=async(s,t,p)=>{checks++;assert.deepEqual(effects[t.id].map(e=>e.kind),['defUp','healDown']);assert.equal(side==='ally'?t._floorBossHpShield:b.circleShields[t.id],888);return hit(s,t,p);};
  await resolveTwin385(b,actor,side,env);assert.equal(checks,2);
  for(const u of targets.slice(2))assert.deepEqual(effects[u.id].map(e=>e.kind),['atkUp','defUp','healDown']);
  for(const u of targets)assert.equal(u.enemyMagicCircle.id,'sentinel');
 }
});
test('crowns second resonance checks each opponents current HP at the boundary, in either member order',async()=>{
 for(const order of [[0,1],[1,0]]){
  const b=state(['nemesia','everia']);b.enemies=[{id:'low',hp:35,maxHp:100},{id:'high',hp:35.001,maxHp:100}];const env=simpleEnv(b);env.opponentHpRatio=t=>t.hp/t.maxHp;
  env.hit=async(s,t,p)=>{env.calls.hits.push([s.id,t.id,p.power,p.defenseIgnore]);return 1;};
  await resolveTwin385(b,b.party[order[0]],'ally',env);assert.deepEqual(env.calls.hits.map(h=>h[2]),[2.1,2.1]);
  await resolveTwin385(b,b.party[order[1]],'ally',env);assert.deepEqual(env.calls.hits.slice(2).map(h=>h[2]),[3.8*1.6,3.8]);assert.ok(env.calls.hits.slice(2).every(h=>h[3]===.35));
  const count=env.calls.hits.length;for(const u of b.party)await resolveTwin385(b,u,'ally',env);assert.equal(env.calls.hits.length,count);
  b.turn++;await resolveTwin385(b,b.party[0],'ally',env);assert.deepEqual(env.calls.hits.slice(-2).map(h=>h[2]),[2.1,2.1]);
 }
});
test('actual crown enemy adapter uses player currentHp and calculated max HP and player adapter uses enemy hp/maxHp',async()=>{
 const b=state(['tillea','morina']);b.enemies=encounter('roam4_3_392');const {c,hits}=runtime(b);
 await c.resolveTwinResonance385(b.enemies[0],'enemy');assert.ok(hits.every(h=>h.p===2.1));
 b.party[0].currentHp=Math.floor(calculatedStats(b.party[0]).hp*.35);b.party[1].currentHp=Math.ceil(calculatedStats(b.party[1]).hp*.351);
 hits.length=0;await c.resolveTwinResonance385(b.enemies[1],'enemy');assert.deepEqual(hits.map(h=>h.p),[3.8*1.6,3.8]);assert.ok(hits.every(h=>h.rules.damageClass==='physical'&&h.rules.defenseIgnore===.35));
 const p=state(['nemesia','everia']);const {c:pc}=runtime(p);p.enemies[0].hp=35;p.enemies[0].maxHp=100;assert.equal(pc.pairBattleEnvironment385(p.party[0]).opponentHpRatio(p.enemies[0]),.35);
});
test('crown quota survives duplicate copies and checkpoint reload, and a dead or captured sister prevents the finisher',async()=>{
 let b=state(['nemesia','everia']);let env=simpleEnv(b);await resolveTwin385(b,b.party[0],'ally',env);
 b=JSON.parse(JSON.stringify(b));b.party.push({...b.party[0],id:'duplicate'});env=simpleEnv(b);await resolveTwin385(b,b.party[2],'ally',env);assert.equal(env.calls.hits.length,0);
 await resolveTwin385(b,b.party[1],'ally',env);assert.equal(env.calls.hits[0][2],3.8);
 for(const stop of [u=>u.currentHp=0,u=>u.captured=true,u=>u.isolated=true]){const p=state(['nemesia','everia']),e=simpleEnv(p);e.blocked=u=>!!u.isolated;await resolveTwin385(p,p.party[0],'ally',e);e.cue=async()=>stop(p.party[0]);await resolveTwin385(p,p.party[1],'ally',e);assert.equal(e.calls.hits.length,1);}
});
test('new alternate patrols appear on the next revisit without replacing any earlier capture or pair',()=>{
 const seen=new Set();for(const [id,e] of Object.entries(ENCOUNTERS).filter(([,e])=>e.roaming&&!e.roamingBase391))for(const visit380 of [0,1]){const units=chapterTwoEnemyEntries(id,{visit380});assert.ok(units.length<=4);for(const u of units){assert.equal(u.uncapturable,false);seen.add(u.speciesId);}}
 for(const s of Object.values(SPECIES).filter(s=>s.chapterTwoOnly))assert.ok(seen.has(s.id),s.id);
 for(const id of ['roam1_3','roam3_1','roam4_3']){assert.deepEqual(chapterTwoEnemyEntries(id,{visit380:1}).map(u=>u.speciesId),ENCOUNTERS[id+'_392'].species);assert.deepEqual(chapterTwoEnemyEntries(id,{visit380:2}).map(u=>u.speciesId),ENCOUNTERS[id].species);}
 assert.equal(SPECIES.ch2_elmina.chapterTwoSet389,true);assert.notEqual(SPECIES.ch2_elmina.name,SPECIES.ch2_elmize.name);
});

import {clearNegativeAllyEffects,clearPersistentAilments} from '../src/battle/BattleRules.js';
import * as C from '../src/chapterTwo/ChapterTwoSystem.js';
function monster(key){const m=createMonster('ch2_'+key,{level:1500});m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);return m;}
function encounter(id){return chapterTwoEnemyEntries(id).map((e,i)=>{const u=createEnemyBattleState(SPECIES[e.speciesId],{...e,id:'e'+i,combatRarity:SPECIES[e.speciesId].rarity},100);tuneChapterTwoEnemy(u,id,i);return u;});}
function state(keys=['ryune','rose']){return {party:keys.map(monster),enemies:[{id:'e',hp:1e10,maxHp:1e10,def:100,mdef:100,element:'neutral'}],turn:1,allyEffects:{},enemyEffects:{},enemyStatuses:{},allyAilments:{},circleShields:{}};}
function simpleEnv(b){const calls={hits:[],heals:[],shields:[],cues:[],weakens:[]};return {calls,blocked:()=>false,opponents:()=>b.enemies.filter(e=>e.hp>0),cue:async p=>calls.cues.push(p.pair.id),hit:async(s,t,p)=>{calls.hits.push([s.id,t.id,p.power]);t.hp-=1;return 1;},heal:async(u,r)=>calls.heals.push([u.id,r]),shield:(u,r)=>calls.shields.push([u.id,r]),weaken:(u,e)=>calls.weakens.push([u.id,e.kind])};}
function runtime(b){const logs=[],floats=[],hits=[];const c={queuePairCounter390,resolvePairCounters390,clearNegativeAllyEffects,clearPersistentAilments,maxMp,hasCircleEffect:()=>false,queueMagicCircleEvent(){},battle:b,save:{state:{equipment:[]}},SPECIES,resolveTwin385,calculatedStats,displayName,POSITIVE_ENEMY_EFFECTS:new Set(['atkUp','defUp','spdUp','accuracyUp','evasionUp','guard']),skillDamage,applyEnemyDamage,applyBattleEffect,effectValue,hasEffect,allyAilment:(u,id)=>(b.allyAilments[u.id]??[]).find(s=>s.id===id),aliveEnemies:x=>x.enemies.filter(e=>e.hp>0),ultimateIsolated:(_b,u)=>!!u.isolated,ultimateExtraBlocked:(_b,u)=>!!u.blocked,convertedAttackStats:s=>s,attackHits:()=>true,allyAttackFactor:id=>1+effectValue(b,id,'atkUp')-effectValue(b,id,'atkDown'),enemyDefenseFactor:id=>1+effectValue(b,id,'defUp','enemy')-effectValue(b,id,'defDown','enemy'),attributeDamageMultiplier:()=>1,abyssBattleMultiplier:()=>1,enemyDamageMultiplier:()=>1,endgameIncomingDamageMultiplier:()=>1,weaponMasteryDamageMultiplier:()=>1,magicCircleDamageMultiplier:()=>1,affixValue:()=>0,addBattleLog:(_b,s)=>logs.push(s),battleBanner:async()=>{},animateAttack:async()=>{},animateHit:async()=>{},floatText:async(...a)=>floats.push(a),recordBattleDamage(){},registerWeaponFinisher(){},recordBattleHealing(){},flushBattleRecoveries:async()=>{},queueBattleRecovery(){},heroOverheal(){},dealEnemyHit:async(e,t,p,label,crit,element,rules)=>{hits.push({e,t,p,element,rules});t.currentHp=Math.max(0,t.currentHp-10);return 10;}};
 const start=main.indexOf('async function resolveTwinResonance385('),end=main.indexOf('async function triggerInvincibleAlliance(',start);assert.ok(start>0&&end>start);vm.createContext(c);const ailmentStart=main.indexOf("function clearAilments(");vm.runInContext(main.slice(ailmentStart,main.indexOf("\n",ailmentStart)),c);vm.runInContext(main.slice(start,end),c);
 const recoveryStart=main.indexOf('function recoverBattleHp('),recoveryEnd=main.indexOf('function storeFloorBossManaNocturne(',recoveryStart);vm.runInContext(main.slice(recoveryStart,recoveryEnd),c);const mpStart=main.indexOf("function recoverBattleMp("),mpEnd=main.indexOf("function magicCircleDamageMultiplier(",mpStart);vm.runInContext(main.slice(mpStart,mpEnd),c);return{c,logs,floats,hits};}


test('all current releases retain an equal rank roster and complete capturable pairs',()=>{
 const all=Object.values(SPECIES).filter(s=>s.chapterTwoOnly),seen=new Set();assert.equal(all.length,70);for(const rank of ['N','R','SR','SSR','UR','LR','神話'])assert.equal(all.filter(s=>s.rarity===rank).length,10);assert.equal(Object.keys(CHAPTER_TWO_ACTIONS392).length,28);assert.equal(CHAPTER_TWO_PAIRS392.length,3);
 const ordinary=new Set(eligibleEncounterSpecies(SPECIES,999999).map(s=>s.id));for(const s of all){assert.equal(ordinary.has(s.id),false);assert.equal(s.gachaExcluded,true);assert.equal(allSpeciesSkills(s.id).length,4);}
 for(const [id,e] of Object.entries(ENCOUNTERS).filter(([,e])=>e.roaming&&!e.elite393))for(const u of encounter(id)){seen.add(u.speciesId);assert.equal(u.uncapturable,false);}
 for(const s of all)assert.ok(seen.has(s.id),s.id);const pairs=new Set(all.map(s=>twinPair385(s.id)?.id).filter(Boolean));assert.equal(pairs.size,24);for(const s of roster){assert.equal(chapterTwoCaptureChance383(s.id,.99),s.captureCap383);for(const k of s.authoredSkills){assert.equal(specialActionInfo(k.id).power,k.power);assert.equal(enemyActionMpCost({},k.id),k.mp);}}
});
test('all new habitats match the codex, use six real gear slots and keep each pair together',()=>{
 for(const id of ['roam1_3_392','roam3_1_392','roam4_3_392']){const e=ENCOUNTERS[id],units=encounter(id);assert.ok(e.roaming);for(const u of units){const s=SPECIES[u.speciesId];if(!s.chapterTwoSet392)continue;assert.equal(u.enemyGear.length,6);assert.ok(u.enemyEquipmentLevel>0);assert.ok(u.enemyMagicCircle.id);for(const k of ['maxHp','maxMp','atk','matk','def','mdef','spd'])assert.ok(Number.isFinite(u[k])&&u[k]>0);const magic=s.authoredSkills.filter(k=>k.power>0).every(k=>k.damageClass==='magic');assert.ok(u.enemyGear.slice(0,2).every(w=>(w.stats[magic?'matk':'atk']??0)>0));assert.ok(s.habitat383.includes(CHAPTER_TWO_AREAS[e.area].rooms.find(r=>r.id===e.room).name));}}
 for(const p of CHAPTER_TWO_PAIRS392)assert.ok(Object.values(ENCOUNTERS).some(e=>e.roaming&&p.members.every(id=>e.species.includes(id))));assert.equal(ENCOUNTERS.roam4_4.species[0],'ch2_ordia');assert.equal(ENCOUNTERS.roam4_3.species[0],'ch2_luxion');
});
test('the seven new captures preserve four learned skills, depleted HP/MP and pair identity across SaveService',()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};const save=new SaveService();for(const s of roster){const m=monster(s.key);m.currentHp=0;m.currentMp=3;save.state.monsters.push(m);}save.save();const loaded=new SaveService();for(const s of roster){const m=loaded.state.monsters.find(u=>u.speciesId===s.id);assert.equal(m.currentHp,0);assert.equal(m.currentMp,3);assert.equal(learnedSkills(m).length,4);assert.equal(twinPair385(m)?.id,twinPair385(s.id)?.id);assert.equal(m.enemyGear,undefined);}
});
test('all 56 new poses are true RGBA, right-facing and within the 256px live renderer bounds',()=>{
 const oldDoc=globalThis.document,oldImage=globalThis.Image;let draws=0;globalThis.Image=class{set src(v){this.onload();}};globalThis.document={createElement:()=>({getContext:()=>({translate(){},scale(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(rule){assert.equal(rule,'evenodd');},drawImage(){draws++;}})})};try{for(const s of roster){const atlas=CHAPTER_TWO_SPRITES392[s.id],bytes=fs.readFileSync(new URL('../'+atlas.url.split('?')[0],import.meta.url));assert.equal(bytes[25],6);assert.equal(atlas.facing,'right');assert.equal(Object.keys(atlas.frames).length,8);assert.match(monsterVisual(s.id),/data-source-facing="right"/);for(const frame of Object.keys(atlas.frames)){const f=chapterTwoFrame383(s.id,frame);assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=256&&f.y+f.height<=256);assert.equal(chapterTwoCanvasFrame383(s.id,frame).width,256);}}}finally{globalThis.document=oldDoc;globalThis.Image=oldImage;}assert.equal(draws,56);
});
