import {createHash} from 'node:crypto';
import fs from 'node:fs';import vm from 'node:vm';import {pathToFileURL} from 'node:url';import path from 'node:path';
import {createMonster,calculatedStats} from '../../src/models/Monster.js';import {learnedSkills,maxMp,chooseAutoBattleDecision} from '../../src/battle/SkillSystem.js';import {endgameCharacter} from '../../src/data/endgameCharacters.js';import {SPECIES} from '../../src/data/species.js';import {createBattleRulesState} from '../../src/battle/BattleRules.js';
import {EQUIPMENT_BASES} from '../../src/data/equipment.js';import {createEquipment,equipmentStatMultiplier} from '../../src/models/Equipment.js';import {magicCircleById,magicCircleLevelEffect} from '../../src/core/MagicCircleSystem.js';
import {SaveService} from '../../src/services/SaveService.js';import {createEnemyBattleState} from '../../src/battle/EnemyAI.js';
const root=path.resolve(new URL('../../',import.meta.url).pathname),source=fs.readFileSync(root+'/src/main.js','utf8'),map=JSON.parse(fs.readFileSync(new URL('./native-source-map.json',import.meta.url),'utf8')),imports={},failed=[];
for(const entry of map.imports){try{const module=await import(pathToFileURL(path.resolve(root+'/src',entry.source.split('?')[0])).href);for(const spec of entry.specifiers)imports[spec.local]=spec.imported==='*'?module:module[spec.imported];}catch(e){failed.push({source:entry.source,error:e.message});}}
if(failed.length)throw new Error('Unavailable native imports: '+JSON.stringify(failed));
const expected=JSON.parse(fs.readFileSync(new URL('./source-identity.json',import.meta.url),'utf8'));if(createHash('sha256').update(source).digest('hex')!==expected.main_sha256)throw new Error('This harness requires the exact Build409 main.js recorded in source-identity.json');
const compiled=new vm.Script(map.functions.map(f=>source.slice(f.start,f.end)).join('\n')+'\n'+map.constants.map(s=>'const '+s+';').join('\n'));
const noop=()=>{},asyncNoop=async()=>{};const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
export function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export function monster(id,level=1500,gear=false){
 const god=endgameCharacter(id),m=createMonster(god?.speciesId??id,{endgameBossId:god?.id,level,allowEndgameLevel:true,endgameFaction:god?.faction,attribute:god?.element??SPECIES[id]?.element,traitId:'steady',rank:1,plus:0,affection:0});
 m.id=id;m.maxHp=calculatedStats(m).hp;m.currentHp=m.maxHp;m.maxMp=maxMp(m);m.currentMp=m.maxMp;
 if(gear){
  const names=[['weapon','炎刃'],['weapon','星詠みの杖'],['armor','魔布のローブ'],['armor','守護者の外套'],['accessory','旅人の指輪'],['accessory','生命の首飾り']];
  const stats={};m._benchmarkGear409=names.map(([slot,name])=>{const item=createEquipment(slot,{rarity:'LR',base:EQUIPMENT_BASES[slot].find(x=>x.name===name),affixes:[],series:null});item.level=level;item.plus=0;for(const[k,v]of Object.entries(item.stats))stats[k]=(stats[k]??0)+Math.round(v*equipmentStatMultiplier(item));return {name:item.name,slot:item.slot,rarity:item.rarity,level:item.level,plus:0};});m._equipmentStats=stats;m._equipmentAffixes={};m.maxHp=calculatedStats(m).hp;m.currentHp=m.maxHp;m.maxMp=maxMp(m);m.currentMp=m.maxMp;
 }
 return m;
}
export async function run(partyIds,enemyIds,{seed=1,level=1500,maxRounds=30,gear=false,pairEnabled=true,trace=false,enemyHp=8,enemyPower=1.3,circles=false,boss=false,speed=1,resumeAt=0}={}){
 const random=rng(seed),old=Math.random;Math.random=random;
 try{
 const party=partyIds.map(id=>monster(id,level,gear)),enemies=enemyIds.map((id,i)=>{const m=monster(id,level,gear),stats=calculatedStats(m),e=createEnemyBattleState(SPECIES[m.speciesId],{id:'e'+i,level,combatRarity:SPECIES[m.speciesId].rarity},100);Object.assign(e,stats,{id:'e'+i,speciesId:m.speciesId,hp:Math.floor(stats.hp*enemyHp),maxHp:Math.floor(stats.hp*enemyHp),atk:Math.floor(stats.atk*enemyPower),matk:Math.floor(stats.matk*enemyPower),currentMp:m.maxMp,maxMp:m.maxMp,level,boss,divineBarrier:0});return e;});
 const state=new SaveService().state;state.monsters=party;state.party=party.map(u=>u.id);state.equipment=[];state.player.inRun=true;state.inventory={};
 const b={...createBattleRulesState(party),battleId:'sim409',party,enemies,turn:1,busy:false,guideReady:true,auto:true,guards:{},species:SPECIES,targetEnemyId:enemies[0].id,enemy:enemies[0],pairEnhancements409:pairEnabled,performance:{},circleShields:{},signatureShields:{},circleTurnMultipliers:{},magicCircleProfiles:{},signatureResonances:{},reviveCount:0,delayedSkillEchoes:[],turnQueue:[],queueIndex:0};
 if(circles){const ids=['last_life','mana_reversal','aegis','opening_rite'];for(let i=0;i<party.length;i++){const def=magicCircleById(ids[i]);b.magicCircleProfiles[party[i].id]={...def,level:10,levelEffect:magicCircleLevelEffect(def,10)};if(def.effect==='shield')b.circleShields[party[i].id]=Math.floor(party[i].maxHp*b.magicCircleProfiles[party[i].id].levelEffect.shieldRate);}b.openingCircleBuff=true;}
 state.settings.battleSpeed=speed;
 const context={...imports,console,Math,JSON,Number,String,Object,Array,Map,Set,Date,Promise,Boolean,crypto:globalThis.crypto,setTimeout:fn=>{fn();return 0},clearTimeout:noop,localStorage:globalThis.localStorage,battle:b,save:{state,save:noop},snapshot:null,game:null,app:{querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML:noop},document:{querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null},window:{},history:{},screen:'battle',onlinePartyController:null};
 vm.createContext(context);compiled.runInContext(context);
 for(const name of ['wait','animateAttack','animateHit','animateDefeat','floatText','battleBanner','flushBattleRecoveries','flushMagicCircleEvents','playBattleSound','showEquipmentAuthorityActivation','magicCircleActivationFx'])context[name]=asyncNoop;
 for(const name of ['renderBattle','saveBattleCheckpoint','burstParticles','battleFlash','completeContextGuide','recordExpeditionAffectionDeath','queueBattleRecovery','queueMagicCircleEvent','syncBattleHud','protectTutorialCaptureTarget','sanitizeBattleParty','refreshOnlinePresence','markContextualAction'])context[name]=noop;
 const nativeContinue=context.continueBattleFlow;context.finishCurrentAction=async()=>{b.busy=false;b.actionCommitted=false;await context.flushPairCounters390();for(const side of ['ally','enemy'])for(const u of side==='ally'?b.party:b.enemies)imports.observePairImpact409(b,u,side);await context.flushPairSynergyCues409();};context.continueBattleFlow=asyncNoop;context.win=async()=>{b.outcome='win';b.busy=false;};context.lose=async()=>{b.outcome='loss';b.busy=false;};
 context.queueEquipmentAuthorityCue=noop;context.battleAudio=null;
 const metrics={damage:0,taken:0,healing:0,mpSpent:0,mpDrained:0,shieldAbsorbed:0};context.prepareBattleUltimates358();
 for(const u of [...party,...enemies])for(const field of [party.includes(u)?'currentHp':'hp','currentMp']){const desc=Object.getOwnPropertyDescriptor(u,field);let value=u[field];Object.defineProperty(u,field,{configurable:true,enumerable:true,get:()=>desc?.get?desc.get.call(u):value,set:v=>{const before=desc?.get?desc.get.call(u):value;if(desc?.set)desc.set.call(u,v);else value=v;const after=desc?.get?desc.get.call(u):value,delta=after-before;if(field==='currentMp'){if(party.includes(u)&&delta<0)metrics[context.simActorId===u.id?'mpSpent':'mpDrained']-=delta;}else if(delta<0)metrics[party.includes(u)?'taken':'damage']-=delta;else if(delta>0&&party.includes(u))metrics.healing+=delta;}});}
 const absorb=context.absorbMagicCircleShield;context.absorbMagicCircleShield=(u,d)=>{const result=absorb(u,d);metrics.shieldAbsorbed+=Math.max(0,d-result);return result;};
 const rows=[];
 for(;b.turn<=maxRounds&&party.some(u=>u.currentHp>0)&&enemies.some(u=>u.hp>0);){
 const order=imports.buildTurnQueue(b);
 b.turnQueue=order;
 for(let i=0;i<order.length;i++){
  const entry=order[i],actor=(entry.type==='ally'?party:enemies).find(u=>u.id===entry.id);if((entry.type==='ally'?actor.currentHp:actor.hp)<=0||!party.some(u=>u.currentHp>0)||!enemies.some(u=>u.hp>0))continue;
  b.queueIndex=i;b.busy=false;
  const invalid=imports.skipInvalidEntries(b);if(!invalid||b.queueIndex!==i)continue;
  context.simActorId=entry.id;await nativeContinue();
 }
 if(trace)rows.push({round:b.turn,party:party.map(u=>u.currentHp),enemies:enemies.map(u=>u.hp),log:b.log});
 if(!party.some(u=>u.currentHp>0)||!enemies.some(u=>u.hp>0))break;
 if(resumeAt===b.turn){b.pairSynergy409=imports.createPairState409(JSON.parse(JSON.stringify(b.pairSynergy409)));if(b.twinResonance385)b.twinResonance385=JSON.parse(JSON.stringify(b.twinResonance385));}
 const previous=b.turn;await context.endRound();if(b.turn===previous)b.turn++;
 }
 return {won:!enemies.some(u=>u.hp>0),lost:!party.some(u=>u.currentHp>0),rounds:b.turn,remaining:party.reduce((sum,u)=>sum+u.currentHp/u.maxHp,0)/party.length,synergy:b.pairSynergy409?.stats??{},performance:b.performance,metrics,trace:trace?rows:undefined};
 }finally{Math.random=old;}
}
if(process.argv[1]?.endsWith('native-harness.mjs')){console.log('Imports',Object.keys(imports).length,'unavailable',failed.map(x=>x.source));console.log(await run(['ch2_ryune','ch2_rose','ch2_mirea','ch2_viola'],['ch2_balk','ch2_shelza','ch2_kororu','ch2_grant'],{trace:true}));}
