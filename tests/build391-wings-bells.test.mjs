import {pairVm409} from './helpers/pair409-vm.mjs';
import {CHAPTER_TWO_PAIRS391} from '../src/data/chapterTwoPairs391.js';
import {chapterTwoSprite383} from '../src/ui/ChapterTwoSprite383.js';
import {monsterVisual} from '../src/ui/MonsterVisual.js';
import {tickBattleEffects} from '../src/battle/BattleRules.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {SPECIES} from '../src/data/species.js';
import {CHAPTER_TWO_SPECIES391} from '../src/data/chapterTwoSpecies391.js';
import {chapterTwoCaptureChance383} from '../src/data/chapterTwoSpecies383.js';
import {CHAPTER_TWO_ACTIONS391} from '../src/chapterTwo/ChapterTwoMonsters391.js';
import {CHAPTER_TWO_SPRITES391} from '../src/data/chapterTwoSprites391.js';
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
const roster=Object.values(CHAPTER_TWO_SPECIES391),main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

import {clearNegativeAllyEffects,clearPersistentAilments} from '../src/battle/BattleRules.js';
import * as C from '../src/chapterTwo/ChapterTwoSystem.js';
import {chapterTwoRoamingId391} from '../src/chapterTwo/ChapterTwoMonsters391.js';
test('crimson twins prepare bleeding and pursue it in both AIs, with a real MP fallback',()=>{
 const foes=encounter('roam0_1_391'),sisters=foes.filter(u=>['ch2_nizelle','ch2_charne'].includes(u.speciesId)),b=state(['rithia']);
 assert.equal(chooseEnemyAction(sisters[0],{allies:foes,opponents:b.party,battle:b}),'ch2_nizelle__feather');
 b.allyAilments[b.party[0].id]=[{id:'bleed',turns:3}];assert.equal(chooseEnemyAction(sisters[1],{allies:foes,opponents:b.party,battle:b}),'ch2_charne__pursuit');
 sisters[1].currentMp=0;assert.equal(chooseEnemyAction(sisters[1],{allies:foes,opponents:b.party,battle:b}),'attack');
 const p=state(['nizelle','charne']);p.party.forEach(u=>u._maxHp=calculatedStats(u).hp);assert.equal(chooseAutoBattleDecision(p.party[0],p).skill?.id,'ch2_nizelle__feather');p.enemyStatuses.e=[{id:'bleed',turns:3}];assert.equal(chooseAutoBattleDecision(p.party[1],p).skill?.id,'ch2_charne__pursuit');
});
test('bleeding bonus is recalculated after retargeting and actual enemy strikes remain physical',async()=>{
 const b=state(['nizelle','charne']);b.enemies[0].hp=1;b.enemies.push({id:'clean',hp:100});const env=simpleEnv(b);env.hasStatus=t=>t.id==='e';await resolveTwin385(b,b.party[0],'ally',env);assert.deepEqual(env.calls.hits.map(h=>h[2]),[1.2*1.6,1.2,1.2]);
 const p=state(['nizelle','charne']);p.enemyStatuses.e=[{id:'bleed',turns:3}];const {c}=runtime(p),before=p.enemies[0].hp;await c.resolveTwinResonance385(p.party[0]);const bleeding=before-p.enemies[0].hp;p.enemies[0].hp=before;p.enemyStatuses={};p.turn++;await c.resolveTwinResonance385(p.party[0]);assert.ok(bleeding>(before-p.enemies[0].hp)*1.55);
 const e=state(['rithia']);e.enemies=encounter('roam0_1_391');e.allyAilments[e.party[0].id]=[{id:'bleed',turns:3}];const {c:enemy,hits}=runtime(e);await enemy.resolveTwinResonance385(e.enemies[0],'enemy');assert.equal(hits.length,3);assert.ok(hits.every(h=>h.p===1.2*1.6&&h.rules.damageClass==='physical'&&h.rules.defenseIgnore===.25));
});
test('actual bell resonance cleanses living allies before healing, preserves buffs and does not revive or reset cooldowns',async()=>{
 const b=state(['ferne','clarisse','rithia','charne']);b.party.forEach(u=>{u.currentHp=10;b.allyEffects[u.id]=[{kind:'atkUp',value:.2,turns:2},{kind:'healDown',value:.7,turns:2},{kind:'mpRecoveryDown',value:.45,turns:2}];b.allyAilments[u.id]=[{id:'bleed',turns:3,power:.025}];u.statuses=['bleed'];});b.party[3].currentHp=0;b.cooldowns={[b.party[0].id]:{example:8}};
 const {c}=runtime(b);await c.resolveTwinResonance385(b.party[0]);
 for(const u of b.party.slice(0,3)){assert.equal(effectValue(b,u.id,'healDown'),0);assert.equal(effectValue(b,u.id,'mpRecoveryDown'),0);assert.equal(effectValue(b,u.id,'atkUp'),.2);assert.equal(b.allyAilments[u.id].length,0);assert.equal(u.statuses.length,0);assert.equal(u.currentHp,10+Math.floor(calculatedStats(u).hp*.1));}
 assert.equal(b.party[3].currentHp,0);assert.equal(b.allyAilments[b.party[3].id].length,1);assert.equal(b.cooldowns[b.party[0].id].example,8);
});
test('actual enemy bell resonance clears ailments and MP recovery weakness but retains positive effects and dead allies',async()=>{
 const b=state(['rithia']);b.enemies=encounter('roam2_3_391');for(const u of b.enemies){u.hp=10;b.enemyStatuses[u.id]=[{id:'poison',turns:3}];b.enemyEffects[u.id]=[{kind:'atkUp',value:.2,turns:2},{kind:'healDown',value:.7,turns:2},{kind:'mpRecoveryDown',value:.45,turns:2}];u.chapterTwoCooldowns383={example:9};}b.enemies[3].hp=0;
 const {c,hits}=runtime(b);await c.resolveTwinResonance385(b.enemies[0],'enemy');assert.equal(hits.length,1);assert.equal(hits[0].rules.damageClass,'hybrid');
 for(const u of b.enemies.slice(0,3)){assert.equal(b.enemyStatuses[u.id].length,0);assert.deepEqual(b.enemyEffects[u.id].map(e=>e.kind),['atkUp']);assert.equal(u.hp,10+Math.floor(u.maxHp*.1));assert.equal(u.chapterTwoCooldowns383.example,9);}assert.equal(b.enemies[3].hp,0);assert.equal(b.enemyStatuses[b.enemies[3].id].length,1);
});
test('actual eclipse resonance refills only the two sisters and applies MP recovery suppression on both sides',async()=>{
 const b=state(['lunaria','solaria','rithia']);b.party.forEach(u=>u.currentMp=0);applyBattleEffect(b,b.party[0].id,{kind:'mpRecoveryDown',value:.5,turns:2});const {c}=runtime(b);await c.resolveTwinResonance385(b.party[0]);assert.equal(b.party[0].currentMp,Math.floor(maxMp(b.party[0])*.12*.5));assert.equal(b.party[1].currentMp,Math.floor(maxMp(b.party[1])*.12));assert.equal(b.party[2].currentMp,0);
 b.turn++;b.party.forEach(u=>u.currentMp=maxMp(u)-1);await c.resolveTwinResonance385(b.party[0]);for(const u of b.party.slice(0,2))assert.equal(u.currentMp,maxMp(u));assert.equal(b.party[2].currentMp,maxMp(b.party[2])-1);
 const e=state(['rithia']);e.enemies=encounter('roam4_4_391');e.enemies.forEach(u=>u.currentMp=0);applyBattleEffect(e,e.enemies[0].id,{kind:'mpRecoveryDown',value:.5,turns:2},'enemy');const {c:enemy,hits}=runtime(e);await enemy.resolveTwinResonance385(e.enemies[0],'enemy');assert.equal(e.enemies[0].currentMp,Math.floor(Math.floor(e.enemies[0].maxMp*.12)*.5));assert.equal(e.enemies[1].currentMp,Math.floor(e.enemies[1].maxMp*.12));assert.equal(e.enemies[2].currentMp,0);assert.equal(e.enemies[3].currentMp,0);assert.equal(hits[0].p,2.6);assert.equal(hits[0].rules.damageClass,'magic');
});
test('eclipse cannot refund infinitely through repeat actions, duplicates or checkpoint reloads',async()=>{
 let b=state(['lunaria','solaria']);b.party.forEach(u=>u.currentMp=0);let {c}=runtime(b);for(const u of b.party)await c.resolveTwinResonance385(u);const mp=b.party.map(u=>u.currentMp);b.party.push({...b.party[0],id:'duplicate'});await c.resolveTwinResonance385(b.party[2]);assert.deepEqual(b.party.slice(0,2).map(u=>u.currentMp),mp);
 b=JSON.parse(JSON.stringify(b));({c}=runtime(b));for(const u of b.party)await c.resolveTwinResonance385(u);assert.deepEqual(b.party.slice(0,2).map(u=>u.currentMp),mp);b.turn++;await c.resolveTwinResonance385(b.party[0]);assert.ok(b.party[0].currentMp>mp[0]);
});
test('support effects stop when a sister is captured or dies during animation',async()=>{
 for(const keys of [['ferne','clarisse'],['lunaria','solaria']]){const b=state(keys),env=simpleEnv(b);let support=0;env.cleanse=()=>support++;env.restoreMp=async()=>support++;env.cue=async()=>b.party[1].captured=true;await resolveTwin385(b,b.party[0],'ally',env);assert.equal(env.calls.hits.length,0);assert.equal(support,0);}
 const b=state(['lunaria','solaria']),env=simpleEnv(b);let refunds=0;env.restoreMp=async()=>{refunds++;b.party[1].currentHp=0;};await resolveTwin385(b,b.party[0],'ally',env);assert.equal(refunds,1);
});
test('support AI recognizes the new MP recovery weakness and rescues a critical partner',()=>{
 const e=encounter('roam2_3_391'),b=state(['rithia']);b.enemyEffects[e[0].id]=[{kind:'mpRecoveryDown',value:.45,turns:2}];assert.equal(chooseEnemyAction(e[1],{allies:e,opponents:b.party,battle:b}),'ch2_clarisse__absolve');
 for(const [support,partner,skill] of [['clarisse','ferne','benison'],['solaria','lunaria','renewal']]){const p=state([support,partner]);p.party.forEach(u=>u._maxHp=calculatedStats(u).hp);p.party[1].currentHp=1;assert.equal(chooseAutoBattleDecision(p.party[0],p).skill?.id,`ch2_${support}__${skill}`);}
});
function roaming(area=0){const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};const save=new SaveService(),s=save.state,m=monster('rithia');s.monsters.push(m);s.party=[m.id];s.player.maxFloor=100;s.campaign100.finalCompleted=true;C.chapterTwoState(s).introComplete=true;C.beginChapterTwoRun(s);const r=C.chapterTwoState(s).run;r.area=area;r.defeated=[...C.chapterTwoArea(r).keys];r.completed=true;r.keys380=C.chapterTwoArea(r).keys.slice(1,3);return{save,s,r};}
test('revisit alternates preserve all 70 capture routes and both old and new complete pairs',()=>{
 const seen=new Set();for(const [id,e] of Object.entries(ENCOUNTERS).filter(([,e])=>e.roaming&&!e.roamingBase391)){for(const visit380 of [0,1]){const units=chapterTwoEnemyEntries(id,{visit380});assert.ok(units.length<=4);for(const u of units){assert.equal(u.uncapturable,false);seen.add(u.speciesId);}}}
 for(const s of Object.values(SPECIES).filter(s=>s.chapterTwoOnly))assert.ok(seen.has(s.id),s.id);
 for(const id of ['roam0_1','roam2_3','roam4_4']){assert.equal(chapterTwoRoamingId391({visit380:0},id,ENCOUNTERS),id);assert.equal(chapterTwoRoamingId391({visit380:1},id,ENCOUNTERS),id+'_391');assert.equal(chapterTwoRoamingId391({visit380:2},id,ENCOUNTERS),id);}
});
test('world, battle entries, title and tuning agree on the saved alternate encounter',()=>{
 const {s,r}=roaming();C.refreshChapterTwoRoaming380(s);r.room=1;const selected='roam0_1_391',boss=C.chapterTwoWorld(r).bosses.find(b=>b.id===selected);assert.ok(boss.active);assert.equal(boss.chapterEnemy.speciesId,ENCOUNTERS[selected].species[0]);
 const entries=chapterTwoEnemyEntries('roam0_1',r);assert.deepEqual(entries.map(u=>u.speciesId),ENCOUNTERS[selected].species);for(let i=0;i<entries.length;i++){const u=createEnemyBattleState(SPECIES[entries[i].speciesId],{...entries[i],id:'check'+i},100);tuneChapterTwoEnemy(u,'roam0_1',i,r);assert.equal(u.enemyGear.length,6);assert.ok(u.atk>0&&u.maxHp>0);assert.equal(u.chapterTwoEncounter,selected);}
 let started;const c={battle:null,save:{state:s},chapterTwoUnlocked:()=>true,CHAPTER_TWO_ENCOUNTERS:ENCOUNTERS,chapterTwoCommit:f=>f(),beginChapterTwoEncounter:C.beginChapterTwoEncounter,capturePartyVitals:()=>[],stopGame(){},startBattle:(e,o)=>started={e,o},chapterTwoEnemyEntries,chapterTwoState:C.chapterTwoState,chapterTwoArea:C.chapterTwoArea,showToast(){throw Error('unexpected toast');}};vm.createContext(Object.assign(c,{...pairVm409,...c}));vm.runInContext(main.slice(main.indexOf('function openChapterTwoBattle('),main.indexOf('function battleVictoryHeader(')),c);c.openChapterTwoBattle('roam0_1');assert.equal(started.o.chapterTwoEncounter,selected);assert.ok(started.o.specialTitle.includes(ENCOUNTERS[selected].name));assert.deepEqual(started.e.map(u=>u.speciesId),ENCOUNTERS[selected].species);
});
test('loss, save reload and attempted refresh cannot reroll a pending patrol',()=>{
 const {save,s,r}=roaming();C.refreshChapterTwoRoaming380(s);r.room=1;const a=C.beginChapterTwoEncounter(s,'roam0_1');assert.equal(a.encounter,'roam0_1_391');C.refreshChapterTwoRoaming380(s);assert.equal(r.visit380,1);assert.equal(C.beginChapterTwoEncounter(s,'roam0_1').token,a.token);s.activeBattle={specialBattle:true,specialBattleType:'chapterTwo',chapterTwoToken:a.token,chapterTwoEncounter:a.encounter,enemies:[{id:'resume-fixture',speciesId:'slime',hp:100,maxHp:100}]};save.save();const restored=new SaveService();assert.equal(C.chapterTwoState(restored.state).run.pending.encounter,a.encounter);assert.equal(C.settleChapterTwoEncounter(restored.state,a.token,{won:false}).ok,true);assert.equal(C.beginChapterTwoEncounter(restored.state,'roam0_1').encounter,a.encounter);
});
test('legacy pending fights are honored and only one base-or-alternate patrol pays per room',()=>{
 const {s,r}=roaming();r.visit380=1;r.room=1;r.pending={token:'legacy-patrol',encounter:'roam0_1',partyIds:[...s.party]};assert.equal(C.beginChapterTwoEncounter(s,'roam0_1').token,'legacy-patrol');assert.equal(chapterTwoEnemyEntries('roam0_1',r)[0].speciesId,ENCOUNTERS.roam0_1.species[0]);assert.equal(C.chapterTwoWorld(r).bosses.some(b=>b.id==='roam0_1'),true);
 const paid=C.settleChapterTwoEncounter(s,'legacy-patrol',{won:true});assert.equal(paid.ok,true);assert.deepEqual(r.roaming380,['roam0_1']);const gold=s.player.gold;assert.equal(C.beginChapterTwoEncounter(s,'roam0_1_391').ok,false);assert.equal(C.beginChapterTwoEncounter(s,'roam0_1').ok,false);assert.equal(C.settleChapterTwoEncounter(s,'legacy-patrol',{won:true}).ok,false);assert.equal(s.player.gold,gold);assert.equal(C.chapterTwoWorld(r).bosses.find(b=>b.id==='roam0_1_391').active,false);
});
test('alternate patrols keep three-room rewards, room gates and tokens across the next visit',()=>{
 const {s,r}=roaming();r.room=1;assert.equal(C.beginChapterTwoEncounter(s,'roam0_1_391').ok,false);C.refreshChapterTwoRoaming380(s);assert.equal(C.beginChapterTwoEncounter(s,'roam2_3_391').ok,false);assert.equal(C.beginChapterTwoEncounter(s,'roam0_3').ok,false);let third,first;
 for(const room of [1,3,4]){r.room=room;const a=C.beginChapterTwoEncounter(s,`roam0_${room}`);assert.equal(a.ok,true);first??=a;const result=C.settleChapterTwoEncounter(s,a.token,{won:true});assert.equal(Boolean(result.equipment),room===4);third=result;}
 assert.deepEqual(r.roaming380,['roam0_1','roam0_3','roam0_4']);assert.equal(third.firstClear,false);assert.equal(third.crystals,0);C.refreshChapterTwoRoaming380(s);r.room=1;const next=C.beginChapterTwoEncounter(s,'roam0_1');assert.notEqual(next.token,first.token);assert.equal(next.encounter,'roam0_1');
});
function monster(key){const m=createMonster('ch2_'+key,{level:1500});m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);return m;}
function encounter(id){return chapterTwoEnemyEntries(id).map((e,i)=>{const u=createEnemyBattleState(SPECIES[e.speciesId],{...e,id:'e'+i,combatRarity:SPECIES[e.speciesId].rarity},100);tuneChapterTwoEnemy(u,id,i);return u;});}
function state(keys=['ryune','rose']){return {party:keys.map(monster),enemies:[{id:'e',hp:1e10,maxHp:1e10,def:100,mdef:100,element:'neutral'}],turn:1,allyEffects:{},enemyEffects:{},enemyStatuses:{},allyAilments:{},circleShields:{}};}
function simpleEnv(b){const calls={hits:[],heals:[],shields:[],cues:[],weakens:[]};return {calls,blocked:()=>false,opponents:()=>b.enemies.filter(e=>e.hp>0),cue:async p=>calls.cues.push(p.pair.id),hit:async(s,t,p)=>{calls.hits.push([s.id,t.id,p.power]);t.hp-=1;return 1;},heal:async(u,r)=>calls.heals.push([u.id,r]),shield:(u,r)=>calls.shields.push([u.id,r]),weaken:(u,e)=>calls.weakens.push([u.id,e.kind])};}
function runtime(b){const logs=[],floats=[],hits=[];const c={queuePairCounter390,resolvePairCounters390,clearNegativeAllyEffects,clearPersistentAilments,maxMp,hasCircleEffect:()=>false,queueMagicCircleEvent(){},battle:b,save:{state:{equipment:[]}},SPECIES,resolveTwin385,calculatedStats,displayName,POSITIVE_ENEMY_EFFECTS:new Set(['atkUp','defUp','spdUp','accuracyUp','evasionUp','guard']),skillDamage,applyEnemyDamage,applyBattleEffect,effectValue,hasEffect,allyAilment:(u,id)=>(b.allyAilments[u.id]??[]).find(s=>s.id===id),aliveEnemies:x=>x.enemies.filter(e=>e.hp>0),ultimateIsolated:(_b,u)=>!!u.isolated,ultimateExtraBlocked:(_b,u)=>!!u.blocked,convertedAttackStats:s=>s,attackHits:()=>true,allyAttackFactor:id=>1+effectValue(b,id,'atkUp')-effectValue(b,id,'atkDown'),enemyDefenseFactor:id=>1+effectValue(b,id,'defUp','enemy')-effectValue(b,id,'defDown','enemy'),attributeDamageMultiplier:()=>1,abyssBattleMultiplier:()=>1,enemyDamageMultiplier:()=>1,endgameIncomingDamageMultiplier:()=>1,weaponMasteryDamageMultiplier:()=>1,magicCircleDamageMultiplier:()=>1,affixValue:()=>0,addBattleLog:(_b,s)=>logs.push(s),battleBanner:async()=>{},animateAttack:async()=>{},animateHit:async()=>{},floatText:async(...a)=>floats.push(a),recordBattleDamage(){},registerWeaponFinisher(){},recordBattleHealing(){},flushBattleRecoveries:async()=>{},queueBattleRecovery(){},heroOverheal(){},dealEnemyHit:async(e,t,p,label,crit,element,rules)=>{hits.push({e,t,p,element,rules});t.currentHp=Math.max(0,t.currentHp-10);return 10;}};
 const start=main.indexOf('async function resolveTwinResonance385('),end=main.indexOf('async function triggerInvincibleAlliance(',start);assert.ok(start>0&&end>start);vm.createContext(Object.assign(c,{...pairVm409,...c}));const ailmentStart=main.indexOf("function clearAilments(");vm.runInContext(main.slice(ailmentStart,main.indexOf("\n",ailmentStart)),c);vm.runInContext(main.slice(start,end),c);
 const recoveryStart=main.indexOf('function recoverBattleHp('),recoveryEnd=main.indexOf('function storeFloorBossManaNocturne(',recoveryStart);vm.runInContext(main.slice(recoveryStart,recoveryEnd),c);const mpStart=main.indexOf("function recoverBattleMp("),mpEnd=main.indexOf("function magicCircleDamageMultiplier(",mpStart);vm.runInContext(main.slice(mpStart,mpEnd),c);return{c,logs,floats,hits};}


test('all current releases retain an equal rank roster and complete capturable pairs',()=>{
 const all=Object.values(SPECIES).filter(s=>s.chapterTwoOnly),seen=new Set();assert.equal(all.length,70);for(const rank of ['N','R','SR','SSR','UR','LR','神話'])assert.equal(all.filter(s=>s.rarity===rank).length,10);assert.equal(Object.keys(CHAPTER_TWO_ACTIONS391).length,28);assert.equal(CHAPTER_TWO_PAIRS391.length,3);
 const ordinary=new Set(eligibleEncounterSpecies(SPECIES,999999).map(s=>s.id));for(const s of all){assert.equal(ordinary.has(s.id),false);assert.equal(s.gachaExcluded,true);assert.equal(allSpeciesSkills(s.id).length,4);}
 for(const [id,e] of Object.entries(ENCOUNTERS).filter(([,e])=>e.roaming&&!e.elite393))for(const u of encounter(id)){seen.add(u.speciesId);assert.equal(u.uncapturable,false);}
 for(const s of all)assert.ok(seen.has(s.id),s.id);const pairs=new Set(all.map(s=>twinPair385(s.id)?.id).filter(Boolean));assert.equal(pairs.size,24);for(const s of roster){assert.equal(chapterTwoCaptureChance383(s.id,.99),s.captureCap383);for(const k of s.authoredSkills){assert.equal(specialActionInfo(k.id).power,k.power);assert.equal(enemyActionMpCost({},k.id),k.mp);}}
});
test('all new habitats match the codex, use six real gear slots and keep each pair together',()=>{
 for(const id of ['roam0_1_391','roam2_3_391','roam4_4_391']){const e=ENCOUNTERS[id],units=encounter(id);assert.ok(e.roaming);for(const u of units){const s=SPECIES[u.speciesId];if(!s.chapterTwoSet391)continue;assert.equal(u.enemyGear.length,6);assert.ok(u.enemyEquipmentLevel>0);assert.ok(u.enemyMagicCircle.id);for(const k of ['maxHp','maxMp','atk','matk','def','mdef','spd'])assert.ok(Number.isFinite(u[k])&&u[k]>0);const magic=s.authoredSkills.filter(k=>k.power>0).every(k=>k.damageClass==='magic');assert.ok(u.enemyGear.slice(0,2).every(w=>(w.stats[magic?'matk':'atk']??0)>0));assert.ok(s.habitat383.includes(CHAPTER_TWO_AREAS[e.area].rooms.find(r=>r.id===e.room).name));}}
 for(const p of CHAPTER_TWO_PAIRS391)assert.ok(Object.values(ENCOUNTERS).some(e=>e.roaming&&p.members.every(id=>e.species.includes(id))));assert.equal(ENCOUNTERS.roam4_4.species[0],'ch2_ordia');assert.equal(ENCOUNTERS.roam4_3.species[0],'ch2_luxion');
});
test('the seven new captures preserve four learned skills, depleted HP/MP and pair identity across SaveService',()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};const save=new SaveService();for(const s of roster){const m=monster(s.key);m.currentHp=0;m.currentMp=3;save.state.monsters.push(m);}save.save();const loaded=new SaveService();for(const s of roster){const m=loaded.state.monsters.find(u=>u.speciesId===s.id);assert.equal(m.currentHp,0);assert.equal(m.currentMp,3);assert.equal(learnedSkills(m).length,4);assert.equal(twinPair385(m)?.id,twinPair385(s.id)?.id);assert.equal(m.enemyGear,undefined);}
});
test('all 56 new poses are true RGBA, right-facing and within the 256px live renderer bounds',()=>{
 const oldDoc=globalThis.document,oldImage=globalThis.Image;let draws=0;globalThis.Image=class{set src(v){this.onload();}};globalThis.document={createElement:()=>({getContext:()=>({translate(){},scale(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(rule){assert.equal(rule,'evenodd');},drawImage(){draws++;}})})};try{for(const s of roster){const atlas=CHAPTER_TWO_SPRITES391[s.id],bytes=fs.readFileSync(new URL('../'+atlas.url.split('?')[0],import.meta.url));assert.equal(bytes[25],6);assert.equal(atlas.facing,'right');assert.equal(Object.keys(atlas.frames).length,8);assert.match(monsterVisual(s.id),/data-source-facing="right"/);for(const frame of Object.keys(atlas.frames)){const f=chapterTwoFrame383(s.id,frame);assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=256&&f.y+f.height<=256);assert.equal(chapterTwoCanvasFrame383(s.id,frame).width,256);}}}finally{globalThis.document=oldDoc;globalThis.Image=oldImage;}assert.equal(draws,56);
});
