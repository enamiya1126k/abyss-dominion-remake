import {CHAPTER_TWO_PAIRS388} from '../src/data/chapterTwoPairs388.js';
import {chapterTwoSprite383} from '../src/ui/ChapterTwoSprite383.js';
import {monsterVisual} from '../src/ui/MonsterVisual.js';
import {tickBattleEffects} from '../src/battle/BattleRules.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {SPECIES} from '../src/data/species.js';
import {CHAPTER_TWO_SPECIES388} from '../src/data/chapterTwoSpecies388.js';
import {chapterTwoCaptureChance383} from '../src/data/chapterTwoSpecies383.js';
import {CHAPTER_TWO_ACTIONS388} from '../src/chapterTwo/ChapterTwoMonsters388.js';
import {CHAPTER_TWO_SPRITES388} from '../src/data/chapterTwoSprites388.js';
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
const roster=Object.values(CHAPTER_TWO_SPECIES388),main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function monster(key){const m=createMonster('ch2_'+key,{level:1500});m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);return m;}
function encounter(id){return chapterTwoEnemyEntries(id).map((e,i)=>{const u=createEnemyBattleState(SPECIES[e.speciesId],{...e,id:'e'+i,combatRarity:SPECIES[e.speciesId].rarity},100);tuneChapterTwoEnemy(u,id,i);return u;});}
function state(keys=['ryune','rose']){return {party:keys.map(monster),enemies:[{id:'e',hp:1e10,maxHp:1e10,def:100,mdef:100,element:'neutral'}],turn:1,allyEffects:{},enemyEffects:{},enemyStatuses:{},allyAilments:{},circleShields:{}};}

test('oath guard buffs only living allies and refreshes bounded shields without spending extra MP',async()=>{
 const b=state(['lyriet','rosette','fiora']);b.party[2].currentHp=0;const before=b.party.map(u=>u.currentMp),{c}=runtime(b);await c.resolveTwinResonance385(b.party[0]);
 for(const u of b.party.slice(0,2)){assert.equal(b.circleShields[u.id],Math.floor(calculatedStats(u).hp*.18));assert.equal(effectValue(b,u.id,'atkUp'),.12);}assert.equal(b.circleShields[b.party[2].id],undefined);assert.equal(effectValue(b,b.party[2].id,'atkUp'),0);
 const shields={...b.circleShields};await c.resolveTwinResonance385(b.party[1]);assert.deepEqual(b.circleShields,shields);assert.deepEqual(b.party.map(u=>u.currentMp),before);assert.equal(effectValue(b,b.party[0].id,'atkUp'),.12);assert.equal(reserveTwin385(b,b.party[0]),null);
});
test('rose rescue changes at exactly 40 percent, uses three hits and respects healing suppression',async()=>{
 const b=state(['noctelle','auriane','fiora']),env=simpleEnv(b);env.hpRatio=()=>.401;await resolveTwin385(b,b.party[0],'ally',env);assert.deepEqual(env.calls.hits.map(h=>h[2]),[1.3,1.3,1.3]);assert.ok(env.calls.heals.every(h=>h[1]===.12));b.turn++;env.hpRatio=()=>.4;await resolveTwin385(b,b.party[0],'ally',env);assert.deepEqual(env.calls.hits.slice(3).map(h=>h[2]),[1.65,1.65,1.65]);assert.ok(env.calls.heals.slice(3).every(h=>h[1]===.2));assert.equal(twinPair385(b.party[0]).power,1.3);
 const actual=state(['noctelle','auriane','fiora']);actual.party.forEach(u=>u.currentHp=1);actual.party[2].currentHp=0;applyBattleEffect(actual,actual.party[0].id,{kind:'healDown',value:.5,turns:2});const {c,logs}=runtime(actual);await c.resolveTwinResonance385(actual.party[0]);assert.ok(logs.some(l=>l.includes('不滅の黎明')));assert.equal(actual.party[0].currentHp,1+Math.floor(Math.floor(calculatedStats(actual.party[0]).hp*.2)*.5));assert.equal(actual.party[2].currentHp,0);
});
test('twin clocks read BOTH target marks on each side and lose the bonus when either expires',async()=>{
 const b=state(['eirene','iridelle']);b.enemies.push({...b.enemies[0],id:'clean'});for(const kind of ['spdDown','defDown'])applyBattleEffect(b,'e',{kind,value:.22,turns:2},'enemy');const {c}=runtime(b),before=b.enemies[0].hp;await c.resolveTwinResonance385(b.party[0]);assert.ok(before-b.enemies[0].hp>(before-b.enemies[1].hp)*1.6);assert.equal(effectValue(b,b.party[0].id,'spdUp'),.18);
 const other=state(['fiora']);other.enemies=encounter('roam3_3');const actor=other.enemies.find(u=>u.speciesId==='ch2_eirene');for(const kind of ['spdDown','defDown'])applyBattleEffect(other,other.party[0].id,{kind,value:.22,turns:2});const {c:enemy,hits}=runtime(other);await enemy.resolveTwinResonance385(actor,'enemy');assert.equal(hits[0].p,2.4*1.6);assert.equal(hits[0].rules.defenseIgnore,.2);tickBattleEffects(other);tickBattleEffects(other);other.turn++;await enemy.resolveTwinResonance385(actor,'enemy');assert.equal(hits.at(-1).p,2.4);
});
test('enemy clocks prepare the missing shared mark before their bonus strike and fall back at zero MP',()=>{
 const enemies=encounter('roam3_3'),a=enemies.find(u=>u.speciesId==='ch2_eirene'),b=enemies.find(u=>u.speciesId==='ch2_iridelle'),battle=state(),context={allies:enemies,opponents:[{id:'p',currentHp:100,_maxHp:100}],battle};assert.equal(chooseEnemyAction(a,context),'ch2_eirene__still');applyBattleEffect(battle,'p',{kind:'spdDown',value:.22,turns:2});assert.equal(chooseEnemyAction(b,context),'ch2_iridelle__advance');applyBattleEffect(battle,'p',{kind:'defDown',value:.22,turns:2});assert.equal(chooseEnemyAction(a,context),'ch2_eirene__rewind');assert.equal(chooseEnemyAction(b,context),'ch2_iridelle__future');b.currentMp=0;assert.equal(chooseEnemyAction(b,context),'attack');
});
test('player auto prepares the other clock mark before a strong skill and prioritizes emergency healing',()=>{
 const b=state(['eirene','iridelle']);b.party.forEach(u=>u._maxHp=calculatedStats(u).hp);assert.equal(chooseAutoBattleDecision(b.party[0],b).skill?.id,'ch2_eirene__still');applyBattleEffect(b,'e',{kind:'spdDown',value:.22,turns:2},'enemy');assert.equal(chooseAutoBattleDecision(b.party[1],b).skill?.id,'ch2_iridelle__advance');applyBattleEffect(b,'e',{kind:'defDown',value:.22,turns:2},'enemy');assert.equal(chooseAutoBattleDecision(b.party[1],b).skill?.id,'ch2_iridelle__future');b.party[1].currentHp=1;assert.equal(chooseAutoBattleDecision(b.party[0],b).skill?.id,'ch2_eirene__hourglass');
});
test('all three new pairs stop on capture during the cue and cannot refresh quotas through clones or reload',async()=>{
 for(const p of CHAPTER_TWO_PAIRS388){let b=state(p.members.map(id=>id.slice(4)));const env=simpleEnv(b);env.hpRatio=()=>1;env.boost=()=>{};env.cue=async()=>{b.party[1].captured=true;};await resolveTwin385(b,b.party[0],'ally',env);assert.equal(env.calls.hits.length,0);assert.equal(env.calls.heals.length,0);delete b.party[1].captured;b.party.push({...b.party[0],id:'copy'});b=JSON.parse(JSON.stringify(b));assert.equal(reserveTwin385(b,b.party[2]),null);b.turn++;assert.ok(reserveTwin385(b,b.party[0]));}
});
test('the new pair conditions and enemy overhead names and ranks appear in actual battle markup',()=>{
 for(const p of CHAPTER_TWO_PAIRS388){const b=state(p.members.map(id=>id.slice(4)));assert.match(twinStatus385([b.party[0]]),/を編成で発動/);assert.match(twinStatus385(b.party),/共鳴中/);for(const id of p.members)assert.ok(twinCodex385(id).includes(p.description));}
 for(const id of ['roam0_4','roam1_3','roam2_3','roam3_3']){const b=state(['eirene','iridelle']);b.enemies=encounter(id);b.turnQueue=[];const html=BattleScreen(b,{},{});for(const e of b.enemies){const start=html.indexOf(`data-enemy-target="${e.id}"`),end=html.indexOf('side-unit-sprite',start);assert.ok(html.slice(start,end).includes(e.name));assert.ok(html.slice(start,end).includes('combat-rank-badge'));}}
});
function simpleEnv(b){const calls={hits:[],heals:[],shields:[],cues:[],weakens:[]};return {calls,blocked:()=>false,opponents:()=>b.enemies.filter(e=>e.hp>0),cue:async p=>calls.cues.push(p.pair.id),hit:async(s,t,p)=>{calls.hits.push([s.id,t.id,p.power]);t.hp-=1;return 1;},heal:async(u,r)=>calls.heals.push([u.id,r]),shield:(u,r)=>calls.shields.push([u.id,r]),weaken:(u,e)=>calls.weakens.push([u.id,e.kind])};}
function runtime(b){const logs=[],floats=[],hits=[];const c={battle:b,save:{state:{equipment:[]}},SPECIES,resolveTwin385,calculatedStats,displayName,POSITIVE_ENEMY_EFFECTS:new Set(['atkUp','defUp','spdUp','accuracyUp','evasionUp','guard']),skillDamage,applyEnemyDamage,applyBattleEffect,effectValue,hasEffect,allyAilment:(u,id)=>(b.allyAilments[u.id]??[]).find(s=>s.id===id),aliveEnemies:x=>x.enemies.filter(e=>e.hp>0),ultimateIsolated:(_b,u)=>!!u.isolated,ultimateExtraBlocked:(_b,u)=>!!u.blocked,convertedAttackStats:s=>s,attackHits:()=>true,allyAttackFactor:id=>1+effectValue(b,id,'atkUp')-effectValue(b,id,'atkDown'),enemyDefenseFactor:id=>1+effectValue(b,id,'defUp','enemy')-effectValue(b,id,'defDown','enemy'),attributeDamageMultiplier:()=>1,abyssBattleMultiplier:()=>1,enemyDamageMultiplier:()=>1,endgameIncomingDamageMultiplier:()=>1,weaponMasteryDamageMultiplier:()=>1,magicCircleDamageMultiplier:()=>1,affixValue:()=>0,addBattleLog:(_b,s)=>logs.push(s),battleBanner:async()=>{},animateAttack:async()=>{},animateHit:async()=>{},floatText:async(...a)=>floats.push(a),recordBattleDamage(){},registerWeaponFinisher(){},recordBattleHealing(){},flushBattleRecoveries:async()=>{},queueBattleRecovery(){},heroOverheal(){},dealEnemyHit:async(e,t,p,label,crit,element,rules)=>{hits.push({e,t,p,element,rules});t.currentHp=Math.max(0,t.currentHp-10);return 10;}};
 const start=main.indexOf('async function resolveTwinResonance385('),end=main.indexOf('async function triggerInvincibleAlliance(',start);assert.ok(start>0&&end>start);vm.createContext(c);vm.runInContext(main.slice(start,end),c);
 const recoveryStart=main.indexOf('function recoverBattleHp('),recoveryEnd=main.indexOf('function storeFloorBossManaNocturne(',recoveryStart);vm.runInContext(main.slice(recoveryStart,recoveryEnd),c);return{c,logs,floats,hits};}

test('all current releases retain an equal rank roster and complete capturable pairs',()=>{
 const all=Object.values(SPECIES).filter(s=>s.chapterTwoOnly),seen=new Set();assert.equal(all.length,70);for(const rank of ['N','R','SR','SSR','UR','LR','神話'])assert.equal(all.filter(s=>s.rarity===rank).length,10);assert.equal(Object.keys(CHAPTER_TWO_ACTIONS388).length,28);assert.equal(CHAPTER_TWO_PAIRS388.length,3);
 const ordinary=new Set(eligibleEncounterSpecies(SPECIES,999999).map(s=>s.id));for(const s of all){assert.equal(ordinary.has(s.id),false);assert.equal(s.gachaExcluded,true);assert.equal(allSpeciesSkills(s.id).length,4);}
 for(const [id,e] of Object.entries(ENCOUNTERS).filter(([,e])=>e.roaming&&!e.elite393))for(const u of encounter(id)){seen.add(u.speciesId);assert.equal(u.uncapturable,false);}
 for(const s of all)assert.ok(seen.has(s.id),s.id);const pairs=new Set(all.map(s=>twinPair385(s.id)?.id).filter(Boolean));assert.equal(pairs.size,24);for(const s of roster){assert.equal(chapterTwoCaptureChance383(s.id,.99),s.captureCap383);for(const k of s.authoredSkills){assert.equal(specialActionInfo(k.id).power,k.power);assert.equal(enemyActionMpCost({},k.id),k.mp);}}
});
test('all new habitats match the codex, use six real gear slots and keep each pair together',()=>{
 for(const id of ['roam0_4','roam1_3','roam2_3','roam3_3']){const e=ENCOUNTERS[id],units=encounter(id);assert.ok(e.roaming);for(const u of units){const s=SPECIES[u.speciesId];if(!s.chapterTwoSet388)continue;assert.equal(u.enemyGear.length,6);assert.ok(u.enemyEquipmentLevel>0);assert.ok(u.enemyMagicCircle.id);for(const k of ['maxHp','maxMp','atk','matk','def','mdef','spd'])assert.ok(Number.isFinite(u[k])&&u[k]>0);const magic=s.authoredSkills.filter(k=>k.power>0).every(k=>k.damageClass==='magic');assert.ok(u.enemyGear.slice(0,2).every(w=>(w.stats[magic?'matk':'atk']??0)>0));assert.ok(s.habitat383.includes(CHAPTER_TWO_AREAS[e.area].rooms.find(r=>r.id===e.room).name));}}
 for(const p of CHAPTER_TWO_PAIRS388)assert.ok(Object.values(ENCOUNTERS).some(e=>e.roaming&&p.members.every(id=>e.species.includes(id))));assert.equal(ENCOUNTERS.roam4_4.species[0],'ch2_ordia');assert.equal(ENCOUNTERS.roam4_3.species[0],'ch2_luxion');
});
test('the seven new captures preserve four learned skills, depleted HP/MP and pair identity across SaveService',()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};const save=new SaveService();for(const s of roster){const m=monster(s.key);m.currentHp=0;m.currentMp=3;save.state.monsters.push(m);}save.save();const loaded=new SaveService();for(const s of roster){const m=loaded.state.monsters.find(u=>u.speciesId===s.id);assert.equal(m.currentHp,0);assert.equal(m.currentMp,3);assert.equal(learnedSkills(m).length,4);assert.equal(twinPair385(m)?.id,twinPair385(s.id)?.id);assert.equal(m.enemyGear,undefined);}
});
test('all 56 new poses are true RGBA, right-facing and within the 256px live renderer bounds',()=>{
 const oldDoc=globalThis.document,oldImage=globalThis.Image;let draws=0;globalThis.Image=class{set src(v){this.onload();}};globalThis.document={createElement:()=>({getContext:()=>({translate(){},scale(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(rule){assert.equal(rule,'evenodd');},drawImage(){draws++;}})})};try{for(const s of roster){const atlas=CHAPTER_TWO_SPRITES388[s.id],bytes=fs.readFileSync(new URL('../'+atlas.url.split('?')[0],import.meta.url));assert.equal(bytes[25],6);assert.equal(atlas.facing,'right');assert.equal(Object.keys(atlas.frames).length,8);assert.match(monsterVisual(s.id),/data-source-facing="right"/);for(const frame of Object.keys(atlas.frames)){const f=chapterTwoFrame383(s.id,frame);assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=256&&f.y+f.height<=256);assert.equal(chapterTwoCanvasFrame383(s.id,frame).width,256);}}}finally{globalThis.document=oldDoc;globalThis.Image=oldImage;}assert.equal(draws,56);
});
