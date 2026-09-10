import {relicIncomingMultiplier394} from '../src/battle/ChapterTwoRelicCombat394.js';
import {CHAPTER_TWO_PAIRS390} from '../src/data/chapterTwoPairs390.js';
import {chapterTwoSprite383} from '../src/ui/ChapterTwoSprite383.js';
import {monsterVisual} from '../src/ui/MonsterVisual.js';
import {tickBattleEffects} from '../src/battle/BattleRules.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {SPECIES} from '../src/data/species.js';
import {CHAPTER_TWO_SPECIES390} from '../src/data/chapterTwoSpecies390.js';
import {chapterTwoCaptureChance383} from '../src/data/chapterTwoSpecies383.js';
import {CHAPTER_TWO_ACTIONS390} from '../src/chapterTwo/ChapterTwoMonsters390.js';
import {CHAPTER_TWO_SPRITES390} from '../src/data/chapterTwoSprites390.js';
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
const roster=Object.values(CHAPTER_TWO_SPECIES390),main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

test('ice twins prepare freeze and select shatter in enemy AI and player auto, with an MP fallback',()=>{
 const enemies=encounter('roam2_1'),iselle=enemies.find(e=>e.speciesId==='ch2_iselle'),virelle=enemies.find(e=>e.speciesId==='ch2_virelle'),b=state(['miretta']);
 const context={allies:enemies,opponents:b.party,battle:b};assert.equal(chooseEnemyAction(iselle,context),'ch2_iselle__seal');b.allyAilments[b.party[0].id]=[{id:'freeze',turns:1}];assert.equal(chooseEnemyAction(virelle,context),'ch2_virelle__shatter');virelle.currentMp=0;assert.equal(chooseEnemyAction(virelle,context),'attack');
 const player=state(['iselle','virelle']);player.party.forEach(u=>u._maxHp=calculatedStats(u).hp);assert.equal(chooseAutoBattleDecision(player.party[0],player).skill?.id,'ch2_iselle__seal');player.enemyStatuses.e=[{id:'freeze',turns:1}];assert.equal(chooseAutoBattleDecision(player.party[1],player).skill?.id,'ch2_virelle__shatter');
});
test('frost bonus is checked per strike, retargets without carrying ice, and works in actual enemy and ally paths',async()=>{
 const b=state(['iselle','virelle']);b.enemies[0].hp=1;b.enemies.push({id:'clean',hp:100});const env=simpleEnv(b);env.hasStatus=t=>t.id==='e';await resolveTwin385(b,b.party[0],'ally',env);assert.deepEqual(env.calls.hits.map(h=>h[2]),[1.15*1.7,1.15,1.15]);
 const p=state(['iselle','virelle']);p.enemyStatuses.e=[{id:'freeze',turns:1}];const {c}=runtime(p),before=p.enemies[0].hp;await c.resolveTwinResonance385(p.party[0]);const frozen=before-p.enemies[0].hp;p.enemies[0].hp=before;p.enemyStatuses={};p.turn++;await c.resolveTwinResonance385(p.party[0]);assert.ok(frozen>(before-p.enemies[0].hp)*1.65);
 const e=state(['miretta']);e.enemies=encounter('roam2_1');e.allyAilments[e.party[0].id]=[{id:'freeze',turns:1}];const {c:enemy,hits}=runtime(e);await enemy.resolveTwinResonance385(e.enemies.find(u=>u.speciesId==='ch2_iselle'),'enemy');assert.equal(hits.length,3);assert.ok(hits.every(h=>h.p===1.15*1.7&&h.rules.damageClass==='hybrid'&&h.rules.defenseIgnore===.25));
});
test('spell charge crosses rounds, costs no extra MP, releases once on the third resonance and resets',async()=>{
 for(const keys of [['sephira','astrelle'],['astrelle','sephira']]){
  let b=state(keys),env=simpleEnv(b),mp=b.party.map(u=>u.currentMp);await resolveTwin385(b,b.party[0],'ally',env);await resolveTwin385(b,b.party[1],'ally',env);assert.equal(env.calls.hits.length,0);assert.ok(env.calls.shields.every(s=>s[1]===.12));assert.match(twinStatus385(b.party,{battle:b}),/魔力 2\/3/);assert.deepEqual(b.party.map(u=>u.currentMp),mp);
  assert.equal(reserveTwin385(b,b.party[0]),null);b.party.push({...b.party[0],id:'clone'});assert.equal(reserveTwin385(b,b.party[2]),null);
  b=JSON.parse(JSON.stringify(b));b.turn++;b.enemies.push({id:'second',hp:100});env=simpleEnv(b);await resolveTwin385(b,b.party[0],'ally',env);assert.deepEqual(env.calls.hits.map(h=>h[2]),[5.5,5.5]);assert.ok(env.calls.shields.every(s=>s[1]===.2));assert.equal(b.twinResonance385.charge390['ally:starconfluence'],0);await resolveTwin385(b,b.party[1],'ally',env);assert.equal(b.twinResonance385.charge390['ally:starconfluence'],1);
 }
});
test('spell charge is isolated between sides and pauses when a partner leaves or dies',()=>{
 const b=state(['sephira','astrelle']);b.enemies=encounter('roam4_1');const caster=b.enemies.find(u=>u.speciesId==='ch2_sephira');reserveTwin385(b,b.party[0]);reserveTwin385(b,caster,'enemy');assert.equal(b.twinResonance385.charge390['ally:starconfluence'],1);assert.equal(b.twinResonance385.charge390['enemy:starconfluence'],1);
 b.party[1].currentHp=0;assert.equal(reserveTwin385(b,b.party[0]),null);b.turn++;assert.equal(reserveTwin385(b,b.party[0]),null);assert.equal(b.twinResonance385.charge390['ally:starconfluence'],1);b.party[1].currentHp=1;assert.equal(reserveTwin385(b,b.party[1]).pair.chargeCount390,2);
});
test('actual player and enemy spell paths apply zero preparation damage and the magical finisher',async()=>{
 const b=state(['sephira','astrelle']);b.party.push(monster('miretta'));b.party[2].currentHp=0;const {c,logs}=runtime(b),hp=b.enemies[0].hp;await c.resolveTwinResonance385(b.party[0]);await c.resolveTwinResonance385(b.party[1]);assert.equal(b.enemies[0].hp,hp);assert.equal(b.circleShields[b.party[2].id],undefined);b.turn++;await c.resolveTwinResonance385(b.party[0]);assert.ok(b.enemies[0].hp<hp);assert.ok(logs.some(s=>s.includes('合体魔法')));
 const e=state(['miretta']);e.enemies=encounter('roam4_1');const sisters=e.enemies.filter(u=>['ch2_sephira','ch2_astrelle'].includes(u.speciesId)),{c:enemy,hits}=runtime(e);for(const u of sisters)await enemy.resolveTwinResonance385(u,'enemy');assert.equal(hits.length,0);e.turn++;await enemy.resolveTwinResonance385(sisters[0],'enemy');assert.equal(hits.length,1);assert.equal(hits[0].p,5.5);assert.equal(hits[0].rules.damageClass,'magic');assert.equal(hits[0].rules.defenseIgnore,.35);
});
function arm(b,side='ally'){
 const units=side==='enemy'?b.enemies:b.party,pair=twinPair385('ch2_rostia');for(const u of units.filter(u=>pair.members.includes(u.speciesId)))applyBattleEffect(b,u.id,{...pair.partyEffect,sourceKey:'pair:oathreturn'},side);
}
test('guard counter uses the partner, original attacker and independent per-species quotas',async()=>{
 const b=state(['rostia','althea']),attacker=b.enemies[0];arm(b);assert.equal(queuePairCounter390(b,b.party[0],attacker,'ally',false),false);assert.equal(queuePairCounter390(b,b.party[0],attacker,'ally',true),true);assert.equal(queuePairCounter390(b,b.party[0],attacker,'ally',true),false);assert.equal(queuePairCounter390(b,b.party[1],attacker,'ally',true),true);
 const env=simpleEnv(b);assert.equal(await resolvePairCounters390(b,()=>env),2);assert.deepEqual(env.calls.hits.map(h=>h[0]),[b.party[1].id,b.party[0].id]);assert.ok(env.calls.hits.every(h=>h[1]===attacker.id&&h[2]===2.4));assert.equal(env.calls.heals.length,0);assert.equal(env.calls.shields.length,0);assert.equal(await resolvePairCounters390(b,()=>env),0);
 assert.ok(reserveTwin385(b,b.party[0]));b.turn++;assert.equal(queuePairCounter390(b,b.party[0],attacker,'ally',true),true);
});
test('counter reservations survive JSON checkpoints and duplicate sisters cannot add reactions',async()=>{
 let b=state(['rostia','althea']);arm(b);queuePairCounter390(b,b.party[0],b.enemies[0],'ally',true);b=JSON.parse(JSON.stringify(b));b.party.push({...b.party[0],id:'clone'});arm(b);assert.equal(queuePairCounter390(b,b.party[2],b.enemies[0],'ally',true),false);const env=simpleEnv(b);assert.equal(await resolvePairCounters390(b,()=>env),1);assert.equal(await resolvePairCounters390(b,()=>env),0);
});
test('guard dispel, death, capture, removal and isolation cancel pending counters; ordinary guard does not arm one',async()=>{
 for(const cancel of [b=>b.party[1].currentHp=0,b=>b.party[1].captured=true,b=>b.party.pop(),b=>b.allyEffects[b.party[0].id]=[],b=>b.enemies[0].hp=0,b=>b.ultimates358={effects:[{kind:"exile",source:b.enemies[0].id,targets:[b.party[1].id],until:2}]},b=>b.allyAilments[b.party[1].id]=[{id:"freeze",turns:1}]]){const b=state(['rostia','althea']);arm(b);queuePairCounter390(b,b.party[0],b.enemies[0],'ally',true);cancel(b);assert.equal(await resolvePairCounters390(b,()=>simpleEnv(b)),0);}
 const b=state(['rostia','althea']);applyBattleEffect(b,b.party[0].id,{kind:'guard',value:.5,turns:3});assert.equal(queuePairCounter390(b,b.party[0],b.enemies[0],'ally',true),false);arm(b);tickBattleEffects(b);tickBattleEffects(b);assert.equal(queuePairCounter390(b,b.party[0],b.enemies[0],'ally',true),false);
});
test('counter cues recheck living partners and counter hits never queue an endless response',async()=>{
 const b=state(['rostia','althea']);b.enemies=encounter('roam1_1');arm(b);arm(b,'enemy');const defender=b.enemies.find(u=>u.speciesId==='ch2_rostia');queuePairCounter390(b,b.party[0],defender,'ally',true);const env=simpleEnv(b);env.hit=async()=>{assert.equal(queuePairCounter390(b,defender,b.party[1],'enemy',true),false);return 1;};assert.equal(await resolvePairCounters390(b,()=>env),1);assert.equal(b.twinResonance385.counterQueue390.length,0);
 b.turn++;queuePairCounter390(b,b.party[0],defender,'ally',true);env.cue=async()=>{b.party[1].captured=true;};assert.equal(await resolvePairCounters390(b,()=>env),0);
});
test('actual enemy damage queues a response through absorbed barriers; status damage and lethal hits do not',async()=>{
 const b=state(['miretta']);b.enemies=encounter('roam1_1');arm(b,'enemy');const defender=b.enemies.find(u=>u.speciesId==='ch2_rostia');defender._floorBossHpShield=10000;
 assert.equal(applyEnemyDamage(b,defender,100,{sourceId:b.party[0].id,damageClass:'physical'}).damage,0);assert.equal(b.twinResonance385.counterQueue390.length,1);const {c,hits}=runtime(b);await c.resolveTwinResonance385(b.party[0]);assert.equal(hits.length,1);assert.equal(hits[0].e.speciesId,'ch2_althea');assert.equal(hits[0].p,2.4);
 b.turn++;applyEnemyDamage(b,defender,100,{sourceId:b.party[0].id});assert.equal(b.twinResonance385.counterQueue390.length,0);defender._floorBossHpShield=0;applyEnemyDamage(b,defender,1e12,{sourceId:b.party[0].id,damageClass:'physical'});assert.equal(b.twinResonance385.counterQueue390.length,0);
});
test('actual oath resonance arms only the two living sisters and keeps shield and guard bounded',async()=>{
 const b=state(['rostia','althea','miretta']),{c}=runtime(b);await c.resolveTwinResonance385(b.party[0]);await c.resolveTwinResonance385(b.party[1]);for(const u of b.party.slice(0,2)){assert.equal(effectValue(b,u.id,'guard'),.25);assert.equal(b.circleShields[u.id],Math.floor(calculatedStats(u).hp*.18));}assert.equal(effectValue(b,b.party[2].id,'guard'),0);assert.equal(b.circleShields[b.party[2].id],undefined);
 const env=simpleEnv(b);queuePairCounter390(b,b.party[0],b.enemies[0],'ally',true);await resolvePairCounters390(b,()=>env);assert.equal(env.calls.hits.length,1);
});
test('actual incoming-hit path queues protected ally counters, ignores misses and respects an enemy counter reaction flag',async()=>{
 const b=state(['rostia','althea']);b.guards={};const e=b.enemies[0];Object.assign(e,{atk:100,matk:100,crit:0,accuracy:100});arm(b);
 const {c}=runtime(b);Object.assign(c,{relicIncomingMultiplier394,beginUltimateAction(){},hasCircleEffect:()=>false,circleEffectNumber:()=>0,syncInvincibleAllianceState(){},signatureResonance:()=>null,elementalResistance:()=>0,enemyAttackFactor:()=>1,allyDefenseFactor:()=>1,enemyDamageAfterDefense:(a,d)=>Math.max(1,a-d),absorbSignatureShield:(_u,d)=>d,absorbMagicCircleShield:()=>0,mitigateHeroDamage:(_b,_side,_u,d)=>d,tryHeroLastStand(){},tryUnyielding:()=>false,recordBattleTaken(){},flushMagicCircleEvents:async()=>{},burstParticles(){},handleMagicCircleDeath(){},animateDefeat:async()=>{},tryGuardianPassive:async()=>{},flushHeroReactions348:async()=>{}});
 const start=main.indexOf('async function dealEnemyHit('),end=main.indexOf('function floorBossDomainActionMultiplier(',start);vm.runInContext(main.slice(start,end),c);
 assert.equal(await c.dealEnemyHit(e,b.party[0],1,'',0),0);assert.equal(b.twinResonance385.counterQueue390.length,1);await c.flushPairCounters390();assert.equal(b.twinResonance385.counterQueue390.length,0);
 b.turn++;c.attackHits=()=>false;await c.dealEnemyHit(e,b.party[0],1,'',0);assert.equal(b.twinResonance385.counterQueue390.length,0);
 c.attackHits=()=>true;applyBattleEffect(b,b.party[0].id,{kind:'counter',value:2,turns:2});const before=e.hp;await c.dealEnemyHit(e,b.party[0],1,'',0,null,{noCounter390:true});assert.equal(e.hp,before);
});
test('new healer rescues a critical partner and all three pair names and ranks are visible overhead',()=>{
 for(const [support,partner,skill] of [['rostia','althea','vow'],['astrelle','sephira','grace']]){const b=state([support,partner]);b.party.forEach(u=>u._maxHp=calculatedStats(u).hp);b.party[1].currentHp=1;assert.equal(chooseAutoBattleDecision(b.party[0],b).skill?.id,`ch2_${support}__${skill}`);}
 for(const id of ['roam1_1','roam1_4','roam2_1','roam4_1']){const b=state(['miretta']);b.enemies=encounter(id);b.turnQueue=[];const html=BattleScreen(b,{},{});for(const e of b.enemies){const start=html.indexOf(`data-enemy-target="${e.id}"`),end=html.indexOf('side-unit-sprite',start);assert.ok(html.slice(start,end).includes(e.name));assert.ok(html.slice(start,end).includes('combat-rank-badge'));}}
});

function monster(key){const m=createMonster('ch2_'+key,{level:1500});m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);return m;}
function encounter(id){return chapterTwoEnemyEntries(id).map((e,i)=>{const u=createEnemyBattleState(SPECIES[e.speciesId],{...e,id:'e'+i,combatRarity:SPECIES[e.speciesId].rarity},100);tuneChapterTwoEnemy(u,id,i);return u;});}
function state(keys=['ryune','rose']){return {party:keys.map(monster),enemies:[{id:'e',hp:1e10,maxHp:1e10,def:100,mdef:100,element:'neutral'}],turn:1,allyEffects:{},enemyEffects:{},enemyStatuses:{},allyAilments:{},circleShields:{}};}
function simpleEnv(b){const calls={hits:[],heals:[],shields:[],cues:[],weakens:[]};return {calls,blocked:()=>false,opponents:()=>b.enemies.filter(e=>e.hp>0),cue:async p=>calls.cues.push(p.pair.id),hit:async(s,t,p)=>{calls.hits.push([s.id,t.id,p.power]);t.hp-=1;return 1;},heal:async(u,r)=>calls.heals.push([u.id,r]),shield:(u,r)=>calls.shields.push([u.id,r]),weaken:(u,e)=>calls.weakens.push([u.id,e.kind])};}
function runtime(b){const logs=[],floats=[],hits=[];const c={queuePairCounter390,resolvePairCounters390,battle:b,save:{state:{equipment:[]}},SPECIES,resolveTwin385,calculatedStats,displayName,POSITIVE_ENEMY_EFFECTS:new Set(['atkUp','defUp','spdUp','accuracyUp','evasionUp','guard']),skillDamage,applyEnemyDamage,applyBattleEffect,effectValue,hasEffect,allyAilment:(u,id)=>(b.allyAilments[u.id]??[]).find(s=>s.id===id),aliveEnemies:x=>x.enemies.filter(e=>e.hp>0),ultimateIsolated:(_b,u)=>!!u.isolated,ultimateExtraBlocked:(_b,u)=>!!u.blocked,convertedAttackStats:s=>s,attackHits:()=>true,allyAttackFactor:id=>1+effectValue(b,id,'atkUp')-effectValue(b,id,'atkDown'),enemyDefenseFactor:id=>1+effectValue(b,id,'defUp','enemy')-effectValue(b,id,'defDown','enemy'),attributeDamageMultiplier:()=>1,abyssBattleMultiplier:()=>1,enemyDamageMultiplier:()=>1,endgameIncomingDamageMultiplier:()=>1,weaponMasteryDamageMultiplier:()=>1,magicCircleDamageMultiplier:()=>1,affixValue:()=>0,addBattleLog:(_b,s)=>logs.push(s),battleBanner:async()=>{},animateAttack:async()=>{},animateHit:async()=>{},floatText:async(...a)=>floats.push(a),recordBattleDamage(){},registerWeaponFinisher(){},recordBattleHealing(){},flushBattleRecoveries:async()=>{},queueBattleRecovery(){},heroOverheal(){},dealEnemyHit:async(e,t,p,label,crit,element,rules)=>{hits.push({e,t,p,element,rules});t.currentHp=Math.max(0,t.currentHp-10);return 10;}};
 const start=main.indexOf('async function resolveTwinResonance385('),end=main.indexOf('async function triggerInvincibleAlliance(',start);assert.ok(start>0&&end>start);vm.createContext(c);vm.runInContext(main.slice(start,end),c);
 const recoveryStart=main.indexOf('function recoverBattleHp('),recoveryEnd=main.indexOf('function storeFloorBossManaNocturne(',recoveryStart);vm.runInContext(main.slice(recoveryStart,recoveryEnd),c);return{c,logs,floats,hits};}


test('all current releases retain an equal rank roster and complete capturable pairs',()=>{
 const all=Object.values(SPECIES).filter(s=>s.chapterTwoOnly),seen=new Set();assert.equal(all.length,70);for(const rank of ['N','R','SR','SSR','UR','LR','神話'])assert.equal(all.filter(s=>s.rarity===rank).length,10);assert.equal(Object.keys(CHAPTER_TWO_ACTIONS390).length,28);assert.equal(CHAPTER_TWO_PAIRS390.length,3);
 const ordinary=new Set(eligibleEncounterSpecies(SPECIES,999999).map(s=>s.id));for(const s of all){assert.equal(ordinary.has(s.id),false);assert.equal(s.gachaExcluded,true);assert.equal(allSpeciesSkills(s.id).length,4);}
 for(const [id,e] of Object.entries(ENCOUNTERS).filter(([,e])=>e.roaming&&!e.elite393))for(const u of encounter(id)){seen.add(u.speciesId);assert.equal(u.uncapturable,false);}
 for(const s of all)assert.ok(seen.has(s.id),s.id);const pairs=new Set(all.map(s=>twinPair385(s.id)?.id).filter(Boolean));assert.equal(pairs.size,24);for(const s of roster){assert.equal(chapterTwoCaptureChance383(s.id,.99),s.captureCap383);for(const k of s.authoredSkills){assert.equal(specialActionInfo(k.id).power,k.power);assert.equal(enemyActionMpCost({},k.id),k.mp);}}
});
test('all new habitats match the codex, use six real gear slots and keep each pair together',()=>{
 for(const id of ['roam1_1','roam1_4','roam2_1','roam4_1']){const e=ENCOUNTERS[id],units=encounter(id);assert.ok(e.roaming);for(const u of units){const s=SPECIES[u.speciesId];if(!s.chapterTwoSet390)continue;assert.equal(u.enemyGear.length,6);assert.ok(u.enemyEquipmentLevel>0);assert.ok(u.enemyMagicCircle.id);for(const k of ['maxHp','maxMp','atk','matk','def','mdef','spd'])assert.ok(Number.isFinite(u[k])&&u[k]>0);const magic=s.authoredSkills.filter(k=>k.power>0).every(k=>k.damageClass==='magic');assert.ok(u.enemyGear.slice(0,2).every(w=>(w.stats[magic?'matk':'atk']??0)>0));assert.ok(s.habitat383.includes(CHAPTER_TWO_AREAS[e.area].rooms.find(r=>r.id===e.room).name));}}
 for(const p of CHAPTER_TWO_PAIRS390)assert.ok(Object.values(ENCOUNTERS).some(e=>e.roaming&&p.members.every(id=>e.species.includes(id))));assert.equal(ENCOUNTERS.roam4_4.species[0],'ch2_ordia');assert.equal(ENCOUNTERS.roam4_3.species[0],'ch2_luxion');
});
test('the seven new captures preserve four learned skills, depleted HP/MP and pair identity across SaveService',()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};const save=new SaveService();for(const s of roster){const m=monster(s.key);m.currentHp=0;m.currentMp=3;save.state.monsters.push(m);}save.save();const loaded=new SaveService();for(const s of roster){const m=loaded.state.monsters.find(u=>u.speciesId===s.id);assert.equal(m.currentHp,0);assert.equal(m.currentMp,3);assert.equal(learnedSkills(m).length,4);assert.equal(twinPair385(m)?.id,twinPair385(s.id)?.id);assert.equal(m.enemyGear,undefined);}
});
test('all 56 new poses are true RGBA, right-facing and within the 256px live renderer bounds',()=>{
 const oldDoc=globalThis.document,oldImage=globalThis.Image;let draws=0;globalThis.Image=class{set src(v){this.onload();}};globalThis.document={createElement:()=>({getContext:()=>({translate(){},scale(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(rule){assert.equal(rule,'evenodd');},drawImage(){draws++;}})})};try{for(const s of roster){const atlas=CHAPTER_TWO_SPRITES390[s.id],bytes=fs.readFileSync(new URL('../'+atlas.url.split('?')[0],import.meta.url));assert.equal(bytes[25],6);assert.equal(atlas.facing,'right');assert.equal(Object.keys(atlas.frames).length,8);assert.match(monsterVisual(s.id),/data-source-facing="right"/);for(const frame of Object.keys(atlas.frames)){const f=chapterTwoFrame383(s.id,frame);assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=256&&f.y+f.height<=256);assert.equal(chapterTwoCanvasFrame383(s.id,frame).width,256);}}}finally{globalThis.document=oldDoc;globalThis.Image=oldImage;}assert.equal(draws,56);
});
