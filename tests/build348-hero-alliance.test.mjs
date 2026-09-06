import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createCampaignHeroLoadout,applyCampaignHeroLoadout} from '../src/core/CampaignHeroLoadoutSystem.js';
import {calculatedStats} from '../src/models/Monster.js';
import {maxMp,effectiveSkillMpCost} from '../src/battle/SkillSystem.js';
import {equipmentRequiredMonsterLevel} from '../src/models/Equipment.js';
import * as H from '../src/core/HeroAllianceSystem.js';
import {heroResonanceProfile} from '../src/core/HeroResonanceSystem.js';
import {MYTHIC_SERIAL_SPECIES} from '../src/data/mythicSerialSpecies.js';
import {applyEnemyDamage,tickBattleEffects} from '../src/battle/BattleRules.js';
import {RoomStore} from '../online-server/src/RoomStore.js';
import {TeamBattleCoordinator} from '../online-server/src/TeamBattleCoordinator.js';
import {RaidCoordinator} from '../online-server/src/RaidCoordinator.js';
import {resolveOnlineHero,onlineHeroAuto,onlineHeroIncoming,onlineHeroSurvive} from '../online-server/src/HeroAllianceAdapter.js';
const ids=H.HERO_ORDER;
const make=(id,extra={})=>({id,playerId:id,speciesId:id,name:MYTHIC_SERIAL_SPECIES[id]?.name??id,level:1000,hp:100000,maxHp:100000,mp:1000,maxMp:1000,atk:100,matk:100,def:60,mdef:60,spd:100,crit:0,evasion:0,effects:[],cooldowns:{},...extra});
const skill=(id,name)=>H.heroAuthoredSkills({speciesId:id,level:1000}).find(s=>s.id===name);
function online(n=4){const members=ids.slice(0,n).map(id=>make(id));return{round:1,players:Object.fromEntries(members.map(u=>[u.id,u])),enemies:[make('dummy',{playerId:undefined,hp:1e8,maxHp:1e8})]};}
const env=(events=[])=>({events,random:()=>.9,stats:u=>({...u,hp:u.maxHp})});

test('enemy stats equal legitimate player loadout; six actual dedicated pieces and legal level',()=>{
 for(const id of ids){const {monster,equipment,stats,maxMp:mp}=createCampaignHeroLoadout(id),enemy=applyCampaignHeroLoadout({id:'enemy',campaignHeroId:id,speciesId:id,level:1000});assert.deepEqual(calculatedStats(monster),stats);for(const key of ['hp','atk','matk','def','mdef','spd','crit','evasion'])assert.equal(key==='hp'?enemy.maxHp:enemy[key],stats[key],id+key);assert.equal(enemy.maxMp,maxMp(monster));assert.equal(mp,enemy.maxMp);assert.equal(enemy.enemyMagicCircle,null);assert.equal(equipment.length,6);for(const item of equipment){assert.equal(item.level,2000);assert.equal(item.plus,100);assert.ok(equipmentRequiredMonsterLevel(item)<=monster.level)}assert.equal(enemy.hiddenDamageTaken,1);assert.equal(enemy.bossPowerMultiplier,1);for(const s of H.heroAuthoredSkills(monster))assert.equal(H.heroSkillCost(enemy,s),effectiveSkillMpCost(monster,s));}
 const speeds=ids.map(id=>[id,createCampaignHeroLoadout(id).stats.spd]);assert.equal(speeds.sort((a,b)=>b[1]-a[1])[0][0],'myth_rion');
});
test('all 16 skills produce identical damage, MP, cooldown and effects for ally and enemy',()=>{
 for(const id of ids)for(const s of H.heroAuthoredSkills(make(id))){
  const run=side=>{const units=ids.map(i=>make(i,{playerId:undefined,hp:i===id?80000:40000}));if(s.type==='revive')units.find(u=>u.speciesId!==id).hp=0;const opponents=[make('dummy',{playerId:undefined,hp:1e8,maxHp:1e8})],b={round:1,players:Object.fromEntries((side==='ally'?units:opponents).map(u=>[u.id,u])),enemies:side==='ally'?opponents:units},actor=units.find(u=>u.speciesId===id),events=[];H.runHeroAllianceAction(b,side,actor,s,env(events),{followup:true});return{units,opponents,events:events.map(e=>({kind:e.kind,value:e.value,label:e.label}))}};
  assert.deepEqual(run('ally'),run('enemy'),s.id);
 }
});
test('2/3/4 heroes share 4/9/16 action budgets without recursive followups and retain MP on echoes',()=>{
 for(let n=2;n<=4;n++){const b=online(n),events=[],actors=Object.values(b.players),before=actors.map(u=>u.mp);for(const actor of actors){const s=H.chooseHeroAllianceSkill(b,'ally',actor);H.runHeroAllianceAction(b,'ally',actor,s,env(events));}assert.equal(events.filter(e=>e.kind==='heroAction').length,n*n);assert.equal(b.heroAlliance348.ally.actions,n*n);for(let i=0;i<n;i++){const paid=events.find(e=>e.kind==='heroAction'&&e.actorId===actors[i].id&&!e.followup);const s=H.heroAuthoredSkills(actors[i]).find(s=>s.id===paid?.skillId);assert.equal(actors[i].mp,before[i]-(s?H.heroSkillCost(actors[i],s):0));}const count=events.length;H.triggerHeroAlliance(b,'ally',actors[0],env(events));assert.equal(events.length,count);b.round++;assert.equal(H.heroAllianceState(b,'ally').actions,0);}
});
test('ordered setup: Rion defense break, Enami vulnerability, Hide finisher, Yori guaranteed critical setup',()=>{
 const b=online(),events=[];H.runHeroAllianceAction(b,'ally',b.players.myth_rion,H.chooseHeroAllianceSkill(b,'ally',b.players.myth_rion),env(events));assert.deepEqual(events.filter(e=>e.kind==='heroAction').map(e=>e.skillId),['rion_talk','enami_world_create','hide_master_claw','yori_beautiful']);assert.ok(H.heroEffect(b,b.enemies[0],'enemy','vulnerable')>0);
});
test('70% followups scale damage, healing and shields; cooldowns apply and normal MP costs remain',()=>{
 for(const name of ['enami_world_create','enami_hyper_focus','rion_therapy']){const id=name.startsWith('enami')?'myth_enami':'myth_rion',s=skill(id,name),run=followup=>{const b=online(),u=b.players[id];for(const a of Object.values(b.players))a.hp=1;H.runHeroAllianceAction(b,'ally',u,s,env(),{followup,reserved:true});return b};const small=run(true);if(name==='rion_therapy')assert.equal(small.players.myth_rion.hp,28001);if(name==='enami_hyper_focus')assert.equal(small.players.myth_rion.heroShield348,21000);assert.equal(small.players[id].mp,1000);}
 const b=online(),u=b.players.myth_hide,s=skill('myth_hide','hide_master_claw');H.runHeroAllianceAction(b,'ally',u,s,env(),{followup:true});assert.equal(u.cooldowns[s.id],5);const events=[];H.runHeroAllianceAction(b,'ally',u,s,env(events),{followup:true});assert.equal(events[0].skillId,'attack');
});
test('living count changes reduction immediately; shields cap at 40% and can fully absorb',()=>{
 const b=online(),u=b.players.myth_rion;assert.equal(H.mitigateHeroDamage(b,'ally',u,100),40);b.players.myth_yori.hp=0;assert.equal(H.mitigateHeroDamage(b,'ally',u,100),70);b.players.myth_hide.hp=0;assert.equal(H.mitigateHeroDamage(b,'ally',u,100),85);u.hp=u.maxHp;assert.equal(H.heroOverheal(b,'ally',u,999999,u.maxHp),40000);assert.equal(H.heroOverheal(b,'ally',u,100,u.maxHp),0);assert.equal(H.mitigateHeroDamage(b,'ally',u,100),0);assert.equal(u.heroShield348,39915);
});
test('first lethal hit survives once, three emergency actions, JSON reload and revival do not reset it',()=>{
 let b=online();const u=b.players.myth_yori,before=u.hp;u.hp=0;assert.equal(H.tryHeroLastStand(b,'ally',u,before),true);assert.equal(u.hp,1);b=JSON.parse(JSON.stringify(b));const events=[];H.drainHeroReactions(b,env(events));assert.equal(events.filter(e=>e.kind==='heroAction').length,3);assert.equal(events.filter(e=>e.kind==='heroLastStand').length,1);const restored=b.players.myth_yori;restored.hp=0;assert.equal(H.tryHeroLastStand(b,'ally',restored,100),false);restored.hp=100;b.round++;restored.hp=0;assert.equal(H.tryHeroLastStand(b,'ally',restored,100),false);
});
test('Rion restores HP50%/MP25%, revive seal is a flag, Yori gets just one nonrecursive kill punch',()=>{
 const b=online(),r=b.players.myth_rion,y=b.players.myth_yori;y.hp=0;H.runHeroAllianceAction(b,'ally',r,skill('myth_rion','rion_community'),env(),{reserved:true,followup:true});assert.equal(y.hp,35000);assert.equal(y.mp,175);
 y.hp=0;r.cooldowns={};y.effects=[{kind:'reviveSeal',turns:2}];H.runHeroAllianceAction(b,'ally',r,skill('myth_rion','rion_community'),env(),{reserved:true,followup:true});assert.equal(y.hp,0);
 const one={round:1,players:{y:make('myth_yori',{atk:100000})},enemies:[make('a',{hp:10}),make('b',{hp:10}),make('c',{hp:1000000})]},events=[];H.runHeroAllianceAction(one,'ally',one.players.y,skill('myth_yori','yori_difficult'),env(events));assert.equal(events.filter(e=>e.kind==='damage'&&e.finisher).length,1);assert.equal(one.enemies[2].hp,1000000);
});
test('buff refresh cannot overwrite a stronger regular buff; cooldown/extension once per round',()=>{
 const b=online(),r=b.players.myth_rion,e=b.players.myth_enami,h=b.players.myth_hide;H.runHeroAllianceAction(b,'ally',e,skill('myth_enami','enami_hyper_focus'),env(),{reserved:true});const before=H.heroEffect(b,r,'ally','atkUp');H.runHeroAllianceAction(b,'ally',e,skill('myth_enami','enami_hyper_focus'),env(),{followup:true,reserved:true});assert.ok(H.heroEffect(b,r,'ally','atkUp')>=before);r.cooldowns.test=10;H.runHeroAllianceAction(b,'ally',r,skill('myth_rion','rion_talk'),env(),{followup:true,reserved:true});const cd=r.cooldowns.test;H.runHeroAllianceAction(b,'ally',r,skill('myth_rion','rion_talk'),env(),{followup:true,reserved:true});assert.equal(r.cooldowns.test,cd);
});
test('real co-op, raid and team resolvers execute canonical skills and bound chain counts',()=>{
 const room=new RoomStore({random:()=>.9}),team=new TeamBattleCoordinator({sessions:new Map(),random:()=>.9}),raid=new RaidCoordinator({sessions:new Map(),random:()=>.9});
 for(const mode of ['room','team','raid']){const b=online(),events=[],r=b.players.myth_rion;for(const u of Object.values(b.players)){u.stats={...u,hp:u.maxHp};u.skills=H.heroAuthoredSkills(u);u.metrics={damage:0,healing:0,damageTaken:0,support:0};u.ownerPlayerId=u.id;}
 const action={kind:'skill',skillId:'rion_talk',targetId:b.enemies[0].id};
 if(mode==='room')room._resolvePlayerAction({},b,r,action,events,new Map());
 if(mode==='team'){for(const u of Object.values(b.players))u.side='sun';const target=b.enemies[0];target.playerId=target.id;target.side='moon';target.metrics={damageTaken:0};b.players[target.id]=target;team._resolveAction(b,r,action,events);}
 if(mode==='raid'){b.boss=b.enemies[0];b.minions=[];b.progress={hp:b.boss.hp,maxHp:b.boss.maxHp,totalDamage:0};b.contribution=Object.fromEntries(ids.map(id=>[id,{damage:0,healing:0,revives:0}]));action.enemyTargetId=b.boss.id;raid._resolvePlayer({},b,r,action,null,events);assert.equal(b.progress.hp,b.boss.hp);assert.ok(b.contribution.myth_rion.damage>0);}
 assert.equal(events.filter(e=>e.kind==='heroAction').length,4,mode);assert.equal(action.heroResolved348,true);assert.ok(events.some(e=>e.skillId==='enami_world_create'),mode);
 }
});
test('generic co-op enemy attacks trigger hero reduction and emergency response',()=>{
 const store=new RoomStore({random:()=>.9}),b=online();b.enemies=[make('slime',{playerId:undefined,atk:1e9,matk:1e9,crit:0,currentMp:0,maxMp:0})];for(const u of Object.values(b.players)){u.stats={hp:u.maxHp,atk:100,matk:100,def:0,mdef:0,crit:0,spd:10};u.skills=H.heroAuthoredSkills(u)}const events=[];store._resolveEnemyActions(b,events,b.enemies[0]);assert.ok(Object.values(b.players).some(u=>u.hp<100000));assert.ok(events.some(e=>e.kind==='heroAction')||Object.values(b.players).every(u=>u.hp>0));
});

test('browser resume keeps spent emergency response, shield, chains and action budget',()=>{
 const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),from=source.indexOf('function resumeSavedBattle()'),to=source.indexOf('\nfunction affixValue(',from),party=ids.map(id=>createCampaignHeroLoadout(id).monster),state={ally:{lastStandUsed:true,pending:[],round:3,actions:12,regular:[party[0].id],shortened:true,extended:true,limit:16,signatureExtra:[]}},enemy=applyCampaignHeroLoadout({id:'enemy',speciesId:'myth_yori',campaignHeroId:'myth_yori',level:1000});
 const data=JSON.parse(JSON.stringify({enemies:[enemy],floor:100,turn:3,heroAlliance348:state,heroShields348:{[party[0].id]:1234},heroChains348:{[party[0].id]:{targetId:'enemy',stacks:2}},turnQueue:[],queueIndex:0,actionCommitted:true}));
 const c={save:{state:{activeBattle:data,monsters:party,party:party.map(u=>u.id),player:{currentFloor:100},settings:{exploreAutoMode:'off'}}},battle:null,SPECIES:{},Math,Number,Object,Boolean,Date,JSON,crypto,hydrateExpeditionSnapshot:()=>null,activeSignatureResonances:()=>[],equippedMagicCircle:()=>null,magicCircleMarkup:()=>'',enemyMagicCircleMarkup:()=>'',createBattleRulesState:()=>({}),normalizePersistentAilments:()=>[],initializeFloorBossDeathTracking:()=>{},heroResonanceProfile,invincibleAllianceReady:()=>false,hydrateEndgameEnemy:()=>{},syncPersistentAilments:()=>{},aliveEnemies:b=>b.enemies.filter(u=>u.hp>0),renderBattle:()=>{},setTimeout:()=>{},scaledBattleDelay:n=>n,applyCampaignHeroLoadout,snapshot:null,screen:null};vm.createContext(c);vm.runInContext(source.slice(from,to),c);assert.equal(c.resumeSavedBattle(),true);assert.equal(c.battle.heroAlliance348.ally.lastStandUsed,true);assert.equal(c.battle.heroAlliance348.ally.actions,12);assert.equal(c.battle.party[0].heroShield348,1234);assert.equal(c.battle.party[0].heroChain348.stacks,2);
 // Legacy enemies migrate once while their wound and MP ratios remain intact.
 data.enemies[0].heroLoadoutVersion348=1;data.enemies[0].hp=data.enemies[0].maxHp*.5;const beforeMp=data.enemies[0].currentMp/data.enemies[0].maxMp;assert.equal(c.resumeSavedBattle(),true);assert.ok(Math.abs(c.battle.enemies[0].hp/c.battle.enemies[0].maxHp-.5)<.001);assert.equal(c.battle.enemies[0].heroLoadoutVersion348,2);assert.ok(Math.abs(c.battle.enemies[0].currentMp/c.battle.enemies[0].maxMp-beforeMp)<.01);
});
test('browser hero damage adapter uses actual enemy mitigation once and respects guards on allies',()=>{
 const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),from=source.indexOf('function heroBattleEnvironment348()'),to=source.indexOf('async function showHeroEvents348(',from),pack=createCampaignHeroLoadout('myth_rion'),party=[pack.monster],enemy=applyCampaignHeroLoadout({id:'enemy',speciesId:'myth_yori',campaignHeroId:'myth_yori',level:1000}),b={party,enemies:[enemy],turn:1,enemyEffects:{},allyEffects:{},enemyStatuses:{},circleShields:{},signatureShields:{},log:[]};
 const c={battle:b,calculatedStats,maxMp,allLearnedSkills:H.heroAuthoredSkills,effectiveSkillMpCost,signatureResonance:u=>u.heroSignature348,heroId:H.heroId,mitigateHeroDamage:H.mitigateHeroDamage,tryHeroLastStand:H.tryHeroLastStand,applyEnemyDamage,enemyDamageMultiplier:()=>1,endgameIncomingDamageMultiplier:()=>1,magicCircleDamageMultiplier:()=>1,recordBattleDamage:()=>{},registerWeaponFinisher:()=>{},tryUnyielding:()=>{},recordBattleTaken:()=>{},handleMagicCircleDeath:()=>{},Object,Math,Number};vm.createContext(c);vm.runInContext(source.slice(from,to),c);const environment=c.heroBattleEnvironment348(),before=enemy.hp;environment.damage(enemy,'enemy',100,{source:party[0],element:'neutral',damageClass:'physical'});assert.equal(before-enemy.hp,70);const allyBefore=party[0].currentHp;environment.damage(party[0],'ally',50,{source:enemy,element:'neutral',damageClass:'physical'});assert.equal(allyBefore-party[0].currentHp,35);
});
