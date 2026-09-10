import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {SPECIES} from '../src/data/species.js';
import {CHAPTER_TWO_SPECIES385} from '../src/data/chapterTwoSpecies385.js';
import {chapterTwoCaptureChance383} from '../src/data/chapterTwoSpecies383.js';
import {CHAPTER_TWO_ACTIONS385} from '../src/chapterTwo/ChapterTwoMonsters385.js';
import {CHAPTER_TWO_SPRITES385} from '../src/data/chapterTwoSprites385.js';
import {chapterTwoFrame383,chapterTwoCanvasFrame383} from '../src/ui/ChapterTwoSprite383.js';
import {createMonster,calculatedStats,displayName} from '../src/models/Monster.js';
import {learnedSkills,allSpeciesSkills,maxMp,skillDamage,chooseAutoBattleDecision} from '../src/battle/SkillSystem.js';
import {createEnemyBattleState,chooseEnemyAction,specialActionInfo,enemyActionMpCost} from '../src/battle/EnemyAI.js';
import {applyEnemyDamage,applyBattleEffect,hasEffect,effectValue} from '../src/battle/BattleRules.js';
import {ENCOUNTERS,chapterTwoEnemyEntries,tuneChapterTwoEnemy,CHAPTER_TWO_AREAS} from '../src/chapterTwo/ChapterTwoSystem.js';
import {eligibleEncounterSpecies} from '../src/core/EncounterPoolSystem.js';
import {SaveService} from '../src/services/SaveService.js';
import {TWIN_PAIRS385,twinPair385,twinReady385,reserveTwin385,resolveTwin385} from '../src/battle/TwinResonance385.js';
import {twinStatus385,twinCodex385} from '../src/ui/TwinStatus385.js';
import {BattleScreen} from '../src/ui/screens/BattleScreen.js';
const roster=Object.values(CHAPTER_TWO_SPECIES385),main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function monster(key){const m=createMonster('ch2_'+key,{level:1500});m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);return m;}
function encounter(id){return chapterTwoEnemyEntries(id).map((e,i)=>{const u=createEnemyBattleState(SPECIES[e.speciesId],{...e,id:'e'+i,combatRarity:SPECIES[e.speciesId].rarity},100);tuneChapterTwoEnemy(u,id,i);return u;});}
function state(keys=['ryune','rose']){return {party:keys.map(monster),enemies:[{id:'e',hp:1e10,maxHp:1e10,def:100,mdef:100,element:'neutral'}],turn:1,allyEffects:{},enemyEffects:{},enemyStatuses:{},allyAilments:{},circleShields:{}};}
function simpleEnv(b){const calls={hits:[],heals:[],shields:[],cues:[],weakens:[]};return {calls,blocked:()=>false,opponents:()=>b.enemies.filter(e=>e.hp>0),cue:async p=>calls.cues.push(p.pair.id),hit:async(s,t,p)=>{calls.hits.push([s.id,t.id,p.power]);t.hp-=1;return 1;},heal:async(u,r)=>calls.heals.push([u.id,r]),shield:(u,r)=>calls.shields.push([u.id,r]),weaken:(u,e)=>calls.weakens.push([u.id,e.kind])};}
function runtime(b){const logs=[],floats=[],hits=[];const c={battle:b,save:{state:{equipment:[]}},SPECIES,resolveTwin385,calculatedStats,displayName,skillDamage,applyEnemyDamage,applyBattleEffect,effectValue,hasEffect,aliveEnemies:x=>x.enemies.filter(e=>e.hp>0),ultimateIsolated:(_b,u)=>!!u.isolated,ultimateExtraBlocked:(_b,u)=>!!u.blocked,convertedAttackStats:s=>s,attackHits:()=>true,allyAttackFactor:id=>1+effectValue(b,id,'atkUp')-effectValue(b,id,'atkDown'),enemyDefenseFactor:id=>1+effectValue(b,id,'defUp','enemy')-effectValue(b,id,'defDown','enemy'),attributeDamageMultiplier:()=>1,abyssBattleMultiplier:()=>1,enemyDamageMultiplier:()=>1,endgameIncomingDamageMultiplier:()=>1,weaponMasteryDamageMultiplier:()=>1,magicCircleDamageMultiplier:()=>1,affixValue:()=>0,addBattleLog:(_b,s)=>logs.push(s),battleBanner:async()=>{},animateAttack:async()=>{},animateHit:async()=>{},floatText:async(...a)=>floats.push(a),recordBattleDamage(){},registerWeaponFinisher(){},recordBattleHealing(){},flushBattleRecoveries:async()=>{},queueBattleRecovery(){},heroOverheal(){},dealEnemyHit:async(e,t,p,label,crit,element,rules)=>{hits.push({e,t,p,element,rules});t.currentHp=Math.max(0,t.currentHp-10);return 10;}};
 const start=main.indexOf('async function resolveTwinResonance385('),end=main.indexOf('async function triggerInvincibleAlliance(',start);assert.ok(start>0&&end>start);vm.createContext(c);vm.runInContext(main.slice(start,end),c);
 const recoveryStart=main.indexOf('function recoverBattleHp('),recoveryEnd=main.indexOf('function storeFloorBossManaNocturne(',recoveryStart);vm.runInContext(main.slice(recoveryStart,recoveryEnd),c);return{c,logs,floats,hits};}

test('seven new heroines retain seven ranks and four usable authored skills apiece',()=>{
 assert.deepEqual(roster.map(s=>s.rarity),['N','R','SR','SSR','UR','LR','神話']);assert.equal(Object.keys(CHAPTER_TWO_ACTIONS385).length,28);
 for(const s of roster){const m=monster(s.key);assert.equal(allSpeciesSkills(s.id).length,4);assert.equal(learnedSkills(m).length,4);for(const k of s.authoredSkills){assert.equal(specialActionInfo(k.id).power,k.power);assert.equal(enemyActionMpCost({},k.id),k.mp);assert.ok(learnedSkills(m).some(x=>x.id===k.id));}assert.ok(calculatedStats(m).hp>0);}
 assert.equal(TWIN_PAIRS385.length,3);assert.equal(new Set(TWIN_PAIRS385.flatMap(p=>p.members)).size,6);assert.equal(twinPair385('ch2_lilica'),null);
});
test('all current natives remain obtainable in repeatable rooms with six real gear slots and matching codex locations',()=>{
 const seen=new Set();for(const [id,e] of Object.entries(ENCOUNTERS).filter(([,e])=>e.roaming&&!e.elite393)){const enemies=encounter(id);for(const u of enemies){seen.add(u.speciesId);assert.equal(u.uncapturable,false);if(SPECIES[u.speciesId]?.chapterTwoSet385){assert.equal(u.enemyGear.length,6);assert.ok(u.enemyEquipmentLevel>0);for(const n of ['hp','atk','matk','def','mdef','spd','maxMp'])assert.ok(Number.isFinite(u[n])&&u[n]>0);const area=CHAPTER_TWO_AREAS[e.area],room=area.rooms.find(r=>r.id===e.room);if(!e.elite393)assert.ok(SPECIES[u.speciesId].habitat383.includes(room.name));}}}
 const all=Object.values(SPECIES).filter(s=>s.chapterTwoOnly);assert.equal(all.length,70);for(const s of all)assert.ok(seen.has(s.id),s.id);
 assert.equal(ENCOUNTERS.roam4_4.species[0],'ch2_ordia');assert.equal(ENCOUNTERS.roam4_3.species[0],'ch2_luxion');
});
test('new capture caps, learned skills and dead HP survive a real save roundtrip',()=>{
 const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};const save=new SaveService(),ordinary=new Set(eligibleEncounterSpecies(SPECIES,999999).map(s=>s.id));
 for(const s of roster){assert.equal(ordinary.has(s.id),false);assert.equal(s.gachaExcluded,true);assert.equal(chapterTwoCaptureChance383(s.id,.99),s.captureCap383);const m=monster(s.key);m.currentHp=0;save.state.monsters.push(m);}save.save();const loaded=new SaveService();for(const s of roster){const m=loaded.state.monsters.find(m=>m.speciesId===s.id);assert.equal(m.currentHp,0);assert.equal(learnedSkills(m).length,4);assert.equal(m.enemyGear,undefined);}
});
test('maid AI sets up defense reduction and the other twin selects the prepared strike',()=>{
 const b=state();const enemies=encounter('roam0_4'),foes=[{id:'p',currentHp:100,currentMp:100,_maxHp:100}],context={allies:enemies,opponents:foes,battle:b};
 enemies.forEach(u=>u._floorBossHpShield=u.maxHp);assert.equal(chooseEnemyAction(enemies[0],context),'ch2_ryune__frost');applyBattleEffect(b,'p',{kind:'defDown',value:.15,turns:2});assert.equal(chooseEnemyAction(enemies[1],context),'ch2_rose__shatter');enemies[1].currentMp=0;assert.equal(chooseEnemyAction(enemies[1],context),'attack');
});
test('twin healer auto can revive her partner but cannot revive a sealed partner',()=>{
 const b=state(['shion','suiren']);b.party[0].currentHp=0;b.party.forEach(u=>u._maxHp=calculatedStats(u).hp);assert.equal(chooseAutoBattleDecision(b.party[1],b).skill?.id,'ch2_suiren__bell');applyBattleEffect(b,b.party[0].id,{kind:'reviveSeal',value:1,turns:2});assert.notEqual(chooseAutoBattleDecision(b.party[1],b).skill?.id,'ch2_suiren__bell');
});
test('resonance requires both real species on the same side, alive and present',()=>{
 const b=state();assert.ok(twinReady385(b,b.party[0]));const sister=b.party.pop();b.enemies.push({...sister,hp:100});assert.equal(twinReady385(b,b.party[0]),null);b.party.push({...b.party[0],id:'copy',visualSpeciesId:'ch2_rose'});assert.equal(twinReady385(b,b.party[0]),null);b.party[1]=sister;sister.currentHp=0;assert.equal(twinReady385(b,b.party[0]),null);sister.currentHp=100;sister.captured=true;assert.equal(twinReady385(b,b.party[0]),null);delete sister.captured;assert.equal(twinReady385(b,{...b.party[0]}),null);assert.equal(twinReady385(b,b.party[0],'ally',u=>u===sister),null);
});
test('each sister triggers once per round; duplicate copies, death/revival and JSON resume cannot reset the quota',()=>{
 let b=state();assert.ok(reserveTwin385(b,b.party[0]));assert.equal(reserveTwin385(b,b.party[0]),null);assert.ok(reserveTwin385(b,b.party[1]));b.party[0].currentHp=0;b.party[0].currentHp=100;assert.equal(reserveTwin385(b,b.party[0]),null);b.party.push({...b.party[0],id:'duplicate'});assert.equal(reserveTwin385(b,b.party[2]),null);b=JSON.parse(JSON.stringify(b));assert.equal(reserveTwin385(b,b.party[0]),null);b.turn++;assert.ok(reserveTwin385(b,b.party[0]));assert.ok(reserveTwin385(b,b.party[1]));
});
test('two different twin pairs in four slots get independent quotas',async()=>{
 const b=state(['ryune','rose','shion','suiren']),env=simpleEnv(b);for(const u of b.party)await resolveTwin385(b,u,'ally',env);assert.deepEqual(env.calls.cues,['mirrors','mirrors','talismans','talismans']);assert.equal(env.calls.hits.length,8);for(const u of b.party)assert.equal(await resolveTwin385(b,u,'ally',env),false);
});
test('a dead target is retargeted across the three mirror hits without wasting quota or MP',async()=>{
 const b=state();b.enemies[0].hp=1;b.enemies.push({id:'other',hp:100});const env=simpleEnv(b),mp=b.party.map(u=>u.currentMp);await resolveTwin385(b,b.party[0],'ally',env);assert.deepEqual(env.calls.hits.map(x=>x[1]),['e','other','other']);assert.deepEqual(b.party.map(u=>u.currentMp),mp);assert.equal(env.calls.shields.length,2);
});
test('followups cannot recursively trigger themselves, even through callback reentry',async()=>{
 const b=state(),env=simpleEnv(b),original=env.hit;env.hit=async(...args)=>{assert.equal(await resolveTwin385(b,b.party[1],'ally',env),false);return original(...args);};await resolveTwin385(b,b.party[0],'ally',env);assert.equal(env.calls.hits.length,3);assert.ok(reserveTwin385(b,b.party[1]));
});
test('a counter killing either sister cancels the remaining hits and recovery',async()=>{
 const b=state(),env=simpleEnv(b),original=env.hit;env.hit=async(...args)=>{const value=await original(...args);b.party[1].currentHp=0;return value;};await resolveTwin385(b,b.party[0],'ally',env);assert.equal(env.calls.hits.length,1);assert.equal(env.calls.shields.length,0);
});
test('isolation during the activation cue stops damage; an empty battle consumes no activation',async()=>{
 const b=state(),env=simpleEnv(b);let blocked=false;env.blocked=()=>blocked;env.cue=async()=>{blocked=true;};await resolveTwin385(b,b.party[0],'ally',env);assert.equal(env.calls.hits.length,0);b.turn++;blocked=false;b.enemies=[];assert.equal(await resolveTwin385(b,b.party[0],'ally',env),false);assert.equal(b.twinResonance385.used['ally:mirrors:ch2_ryune'],1);
});
test('actual mirror runtime deals three stats-based hits and adds bounded shields',async()=>{
 const b=state(),{c}=runtime(b),before=b.enemies[0].hp,mp=b.party.map(u=>u.currentMp);await c.resolveTwinResonance385(b.party[0]);assert.ok(before-b.enemies[0].hp>calculatedStats(b.party[1]).atk*2);for(const u of b.party)assert.equal(b.circleShields[u.id],Math.floor(calculatedStats(u).hp*.12));assert.deepEqual(b.party.map(u=>u.currentMp),mp);const first=b.enemies[0].hp;await c.resolveTwinResonance385(b.party[0]);assert.equal(b.enemies[0].hp,first);b.turn++;b.circleShields[b.party[0].id]=1e8;await c.resolveTwinResonance385(b.party[0]);assert.equal(b.circleShields[b.party[0].id],1e8);
});
test('actual talisman runtime debuffs only damaged targets and honors heal suppression without resurrecting',async()=>{
 const b=state(['shion','suiren','lilica']);b.party.forEach(u=>u.currentHp=1);b.party[2].currentHp=0;applyBattleEffect(b,b.party[0].id,{kind:'healDown',value:.5,turns:2});const {c}=runtime(b);await c.resolveTwinResonance385(b.party[0]);assert.equal(effectValue(b,'e','healDown','enemy'),.35);assert.equal(b.party[0].currentHp,1+Math.floor(Math.floor(calculatedStats(b.party[0]).hp*.12)*.5));assert.equal(b.party[2].currentHp,0);b.turn++;b.enemyEffects={};c.attackHits=()=>false;await c.resolveTwinResonance385(b.party[0]);assert.equal(effectValue(b,'e','healDown','enemy'),0);
});
test('actual angel runtime uses the stronger attack stat, hits all enemies and restores HP plus shield',async()=>{
 const b=state(['aure','noelle','lilica']);b.enemies.push({...b.enemies[0],id:'e2'});b.party.forEach(u=>u.currentHp=1);const {c}=runtime(b);c.calculatedStats=u=>({...calculatedStats(u),atk:100,matk:1000});const before=b.enemies[0].hp;await c.resolveTwinResonance385(b.party[0]);assert.ok(before-b.enemies[0].hp>2500);assert.equal(b.enemies[0].hp,b.enemies[1].hp);for(const u of b.party){assert.equal(u.currentHp,1+Math.floor(calculatedStats(u).hp*.20));assert.equal(b.circleShields[u.id],Math.floor(calculatedStats(u).hp*.20));}
});
test('actual enemy twin runtime calls the ordinary defended damage path with matching signature rules',async()=>{
 const b=state(['lilica']);b.enemies=encounter('roam0_4');const {c,hits}=runtime(b),mp=b.enemies.map(u=>u.currentMp);await c.resolveTwinResonance385(b.enemies[0],'enemy');assert.equal(hits.length,3);assert.ok(hits.every(h=>h.e===b.enemies[1]&&h.p===1.1&&h.rules.defenseIgnore===.3&&h.rules.damageClass==='physical'));assert.deepEqual(b.enemies.map(u=>u.currentMp),mp);assert.equal(b.enemies[0]._floorBossHpShield,Math.floor(b.enemies[0].maxHp*.12));b.enemies[1].hp=0;b.turn++;await c.resolveTwinResonance385(b.enemies[0],'enemy');assert.equal(hits.length,3);
});
test('both sides may use the same twins without sharing the saved activation quota',()=>{
 const b=state();b.enemies=encounter('roam0_4');assert.ok(reserveTwin385(b,b.party[0]));assert.ok(reserveTwin385(b,b.enemies[0],'enemy'));assert.equal(Object.keys(b.twinResonance385.used).length,2);
});
test('actual command, enemy turn and checkpoint contain the twin integration in their executable paths',()=>{
 const command=main.slice(main.indexOf('async function command('),main.indexOf('function chooseEnemyTarget('));assert.match(command,/if\(triggerAlliance\)await resolveTwinResonance385\(a,"ally"\)/);const turn=main.slice(main.indexOf('async function enemyTurn('),main.indexOf('async function finishCurrentAction('));assert.match(turn,/await resolveTwinResonance385\(e,"enemy"\)/);const checkpoint=main.slice(main.indexOf('function saveBattleCheckpoint('),main.indexOf('function saveBattleCheckpoint(')+8000);assert.match(checkpoint,/twinResonance385:battle.twinResonance385\?\?null/);
});
test('formation and battle show the partner requirement, active state and used quotas without losing overhead names',()=>{
 const b=state();assert.match(twinStatus385([b.party[0]]),/ロゼを編成で発動/);assert.match(twinStatus385(b.party),/共鳴中/);reserveTwin385(b,b.party[0]);assert.match(twinStatus385(b.party,{battle:b,compact:true}),/残り1\/2/);for(const p of TWIN_PAIRS385)assert.ok(twinCodex385(p.members[0]).includes(p.name));b.enemies=encounter('roam3_4');b.turnQueue=[];const html=BattleScreen(b,{},{});for(const e of b.enemies){const start=html.indexOf(`data-enemy-target="${e.id}"`),end=html.indexOf('side-unit-sprite',start);assert.ok(html.slice(start,end).includes(e.name));assert.ok(html.slice(start,end).includes('combat-rank-badge'));}assert.ok(html.includes('敵 天穹・双翼聖歌'));
});
test('56 transparent new poses all fit 256px and use the live canvas renderer',()=>{
 const beforeDoc=globalThis.document,beforeImage=globalThis.Image;let draws=0;globalThis.Image=class{set src(v){this.onload();}};globalThis.document={createElement:()=>({getContext:()=>({translate(){},scale(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(rule){assert.equal(rule,'evenodd');},drawImage(){draws++;}})})};try{for(const s of roster){const atlas=CHAPTER_TWO_SPRITES385[s.id],bytes=fs.readFileSync(new URL('../'+atlas.url.split('?')[0],import.meta.url));assert.equal(bytes[25],6);assert.equal(Object.keys(atlas.frames).length,8);for(const name of Object.keys(atlas.frames)){const f=chapterTwoFrame383(s.id,name);assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=256&&f.y+f.height<=256);const canvas=chapterTwoCanvasFrame383(s.id,name);assert.equal(canvas.width,256);}}}finally{globalThis.document=beforeDoc;globalThis.Image=beforeImage;}assert.equal(draws,56);
});
