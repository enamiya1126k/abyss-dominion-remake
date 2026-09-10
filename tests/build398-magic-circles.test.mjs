import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as C from '../src/core/MagicCircleSystem.js';
import {MAGIC_CIRCLES398,conditionalCircleMultiplier398 as factor} from '../src/data/magicCircles398.js';
import {claimCircleResearch398} from '../src/chapterTwo/MagicCircleResearch398.js';
import {battleCircleMultiplier398} from '../src/battle/MagicCircleCombat398.js';
import {applyEnemyDamage} from '../src/battle/BattleRules.js';
import {maxMp} from '../src/battle/SkillSystem.js';
import {onlineConditionalCircle398,onlineMirrorShield398,onlineDeathDrain398,onlineSacrificeShield398} from '../online-server/src/OnlineMagicCircles398.js';
import {RoomStore} from '../online-server/src/RoomStore.js';
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),extract=(a,b)=>main.slice(main.indexOf(a),main.indexOf(b,main.indexOf(a)));
const state=(unlock=true)=>({player:{maxFloor:unlock?100:90,gold:12345678,crystals:765},campaign100:{finalCompleted:unlock},party:[],monsters:[],magicCircles:{version:4,instances:[],unlocked:{},goldSpent:123}});
const unit=(id,attribute='fire')=>({id,speciesId:'slime',attribute,currentHp:100,currentMp:100,level:1});
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function battle(id,level=1){const a=unit('a'),b=unit('b','water'),e={id:'e',speciesId:'slime',hp:100000,maxHp:100000,def:0,mdef:0};return{a,e,b:{party:[a,b],enemies:[e],enemyStatuses:{},enemyEffects:{},magicCircleProfiles:{a:{...C.magicCircleById(id),level}},turn:1,log:[]}};}
test('398 has 28 unique playable circles, finite bounded profiles and unchanged inventory schema',()=>{
 assert.equal(C.MAGIC_CIRCLES.length,29);assert.equal(new Set(C.MAGIC_CIRCLES.map(c=>c.id)).size,29);assert.equal(C.MAGIC_CIRCLE_STATE_VERSION,4);
 for(const c of C.MAGIC_CIRCLES)for(let level=1;level<=99;level++){const v=C.magicCircleLevelEffect(c,level);for(const n of Object.values(v))if(typeof n==='number')assert.ok(Number.isFinite(n)&&n>=0,c.id);}
 for(const c of MAGIC_CIRCLES398){assert.ok(fs.existsSync(new URL('../'+c.asset.slice(2),import.meta.url)));assert.match(fs.readFileSync(new URL('../'+c.asset.slice(2),import.meta.url),'utf8'),/<svg/);}
});
test('398 only eligible saves claim once, no GOLD/party reset and ownership survives normalization',()=>{
 const locked=state(false),before=structuredClone(locked);assert.equal(claimCircleResearch398(locked).ok,false);assert.deepEqual(locked,before);
 const s=state(),m=unit('m');s.party=['m'];s.monsters=[m];const gold=s.player.gold;assert.equal(claimCircleResearch398(s).granted.length,3);
 const snapshot=structuredClone(s);assert.equal(claimCircleResearch398(s).ok,false);assert.deepEqual(s,snapshot);assert.equal(s.player.gold,gold);assert.equal(s.player.crystals,765);
 const copy=s.magicCircles.instances[0];assert.equal(C.equipMagicCircle(s,m,copy.instanceId).ok,true);assert.equal(C.buyOrUpgradeMagicCircle(s,copy.instanceId).level,2);
 C.normalizeMagicCircleState(s);assert.equal(m.magicCircleInstanceId,copy.instanceId);assert.equal(s.magicCircles.goldSpent,123+C.magicCircleUpgradePrice(copy.circleId,1));
 C.removeMagicCircleInstance(s,copy.instanceId);assert.equal(claimCircleResearch398(s).ok,false);assert.equal(s.magicCircles.instances.length,2);
 for(const key of ['activeBattle','run']){const busy=state();if(key==='run')busy.player.inRun=true;else busy.activeBattle={};const b=structuredClone(busy);assert.equal(claimCircleResearch398(busy).ok,false);assert.deepEqual(busy,b);}
});
test('398 prism counts distinct living allied elements and caps at four',()=>{
 near(factor('ch2_prism398',1,{elements:['fire']}),1);near(factor('ch2_prism398',1,{elements:['fire','fire']}),1);
 near(factor('ch2_prism398',1,{elements:['fire','water']}),1.1);near(factor('ch2_prism398',99,{elements:['fire','water','ice','earth','light']}),1.45);
 const {a,b,e}=battle('ch2_prism398',99);near(battleCircleMultiplier398(b,a,e),1.15);b.party[1].currentHp=0;near(battleCircleMultiplier398(b,a,e),1);
});
test('398 hex counts active distinct ailments, ignores expired effects and caps at three',()=>{
 near(factor('ch2_hex398',1,{statuses:[{id:'poison',turns:3},{id:'poison',turns:2},{id:'sleep',turns:0},{id:'atkDown',turns:4}]}),1.12);
 near(factor('ch2_hex398',99,{statuses:['poison','burn','freeze','curse'].map(id=>({id,turns:1}))}),1.54);
 near(factor('ch2_hex398',99,{statuses:[{kind:'status:poison',turns:2},{kind:'status:freeze',turns:2}]}),1.36);
});
test('398 reserve checks MP after payment, works at exactly 80%, never with zero MP capacity',()=>{
 near(factor('ch2_reserve398',99,{mp:80,maxMp:100}),1.5);near(factor('ch2_reserve398',99,{mp:79,maxMp:100}),1);
 near(factor('ch2_reserve398',99,{mp:0,maxMp:0}),1);near(factor('ch2_reserve398',99,{mp:Infinity,maxMp:100}),1);
 const {a,b,e}=battle('ch2_reserve398',99);a.currentMp=maxMp(a);near(battleCircleMultiplier398(b,a,e),1.5);a.currentMp=Math.floor(maxMp(a)*.79);near(battleCircleMultiplier398(b,a,e),1);
});
test('398 actual damage pipeline applies new bonus exactly once, excluding DOT, copied HP and instant damage',()=>{
 for(const id of MAGIC_CIRCLES398.map(c=>c.id)){
  const {a,b,e}=battle(id,99);a.currentMp=maxMp(a);b.enemyStatuses.e=[{id:'poison',turns:3}];const expected=battleCircleMultiplier398(b,a,e);
  const h=applyEnemyDamage(b,e,1000,{sourceId:a.id,damageClass:'magic',element:'fire'});assert.equal(h.requested,Math.floor(1000*expected));
  assert.equal(applyEnemyDamage(b,e,1000,{sourceId:a.id,damageClass:'magic',relicKind394:'excluded'}).requested,1000);
  assert.equal(applyEnemyDamage(b,e,1000,{sourceId:a.id}).requested,1000);
  assert.equal(applyEnemyDamage(b,e,1000,{sourceId:'status:poison'}).requested,1000);
  a.currentHp=0;assert.equal(applyEnemyDamage(b,e,1000,{sourceId:a.id,damageClass:'magic'}).requested,1000);
 }
});
test('398 GOLD retains diminishing returns, bounded spend and higher caps without zero-GOLD damage bonus',()=>{
 for(const level of [1,50,99]){assert.equal(C.goldPowerDamageMultiplier(0,level),1);let previous=1;for(const g of [100,1e4,1e6,1e8,1e12,Number.MAX_SAFE_INTEGER]){const v=C.goldPowerDamageMultiplier(g,level);assert.ok(v>=previous&&v<=1+C.magicCircleLevelEffect('gold_power',level).damageCap);previous=v;assert.ok(C.goldPowerActionCost(g)<=100000);}}
 assert.equal(C.goldPowerDamageMultiplier(1e12,1),1.3);assert.equal(C.goldPowerDamageMultiplier(1e12,99),1.5);
});
test('398 weak crit always contributes damage even when critical chance is already capped; random bonus only on random actions',()=>{
 const actor=unit('a'),b={party:[actor]},context={battle:b,save:{state:{player:{gold:1e12}}},goldPowerDamageMultiplier:C.goldPowerDamageMultiplier,openingCircleRate:()=>0,calculatedStats:()=>({hp:100}),rageCircleValues:()=>({})};let id='weak_critical';
 context.circleInfo=()=>({...C.magicCircleById(id),level:99});context.hasCircleEffect=(_,effect)=>C.magicCircleById(id).effect===effect;context.circleEffectNumber=(_,key,fallback)=>C.magicCircleLevelEffect(id,99)[key]??fallback;
 vm.createContext(context);vm.runInContext(extract('function magicCircleDamageMultiplier(','function magicCircleCriticalBonus('),context);
 near(context.magicCircleDamageMultiplier(actor),1.25);id='mana_reversal';near(context.magicCircleDamageMultiplier(actor),1.55);id='random_arsenal';near(context.magicCircleDamageMultiplier(actor),1);actor._randomCircleSkill=true;near(context.magicCircleDamageMultiplier(actor),1.45);
});
test('398 death drain restores MP once and applies mana reversal HP cost without reviving dead allies',()=>{
 const dead=unit('dead');dead.currentHp=0;const ally=unit('ally');ally.currentMp=0;const down=unit('down');down.currentHp=0;down.currentMp=0;const enemy={hp:100,currentMp:100,maxMp:100};const ctx={battle:{party:[dead,ally,down]},recordExpeditionAffectionDeath(){},hasCircleEffect:(a,e)=>a===dead&&e==='deathDrain',circleEffectNumber:(_,key,f)=>C.magicCircleLevelEffect('death_drain',99)[key]??f,aliveEnemies:()=>[enemy],maxMp:()=>100,recoverBattleMp:(a,n)=>a.currentMp+=n,queueMagicCircleEvent(){},syncInvincibleAllianceState(){}};
 vm.createContext(ctx);vm.runInContext(extract('function handleMagicCircleDeath(','function magicCircleInstantDeath('),ctx);ctx.handleMagicCircleDeath(dead);assert.equal(enemy.currentMp,10);assert.equal(ally.currentMp,35);assert.equal(down.currentMp,0);ctx.handleMagicCircleDeath(dead);assert.equal(ally.currentMp,35);
 const owner={playerId:'x',hp:0,circleId:'death_drain',circleEffect:'deathDrain',circleLevel:99},p={playerId:'p',hp:500,maxHp:1000,mp:0,maxMp:100,circleEffect:'manaReversal'},foe={hp:100,maxMp:100,currentMp:100},b={players:{x:owner,p},enemies:[foe]};onlineDeathDrain398(b,owner);assert.equal(p.mp,35);assert.equal(p.hp,472);assert.equal(foe.currentMp,10);owner.hp=1;owner.hp=0;onlineDeathDrain398(b,owner);assert.equal(p.mp,35);
});
test('398 mirror opening barrier and sacrifice support preserve a stronger existing shield',()=>{
 const p={playerId:'p',hp:1000,maxHp:1000,shield:0,circleId:'death_mirror',circleEffect:'deathMirror',circleLevel:99};onlineMirrorShield398({p});assert.equal(p.shield,450);p.shield=1500;onlineMirrorShield398({p});assert.equal(p.shield,1500);
 const q={playerId:'q',hp:1000,maxHp:1000,shield:0};onlineSacrificeShield398({players:{p,q}},{circleId:'sacrifice_lottery',circleEffect:'sacrifice',circleLevel:99});assert.equal(q.shield,500);assert.equal(p.shield,1500);
});
test('398 server conditions match browser values and do not introduce circles into PvP rules',()=>{
 for(const [key,expected]of [['prism',1.15],['hex',1.18],['reserve',1.5]]){const actor={hp:100,mp:80,maxMp:100,element:'fire',circleId:`ch2_${key}398`,circleEffect:`circle398_${key}`,circleLevel:99},other={hp:100,element:'water'},b={players:{actor,other}},e={effects:[{kind:'status:poison',turns:2}]};near(onlineConditionalCircle398(b,actor,e),expected);actor.side='sun';near(onlineConditionalCircle398(b,actor,e),1);}
});
test('398 actual RoomStore death handling supplies ally MP and prevents repeated new benefit',()=>{
 const store=Object.create(RoomStore.prototype);store.random=()=>.5;const owner={playerId:'owner',hp:0,maxHp:1000,mp:0,maxMp:100,circleId:'death_drain',circleEffect:'deathDrain',circleLevel:99,equipmentCombatEffects:{}},p={playerId:'p',hp:100,maxHp:100,mp:0,maxMp:100},e={hp:100,maxMp:100,currentMp:100};const b={players:{owner,p},enemies:[e]},events=[];
 store._applyPlayerDeathCircles(b,owner,e,events);assert.equal(p.mp,35);assert.equal(e.currentMp,10);owner.circleDeathHandled=false;store._applyPlayerDeathCircles(b,owner,e,events);assert.equal(p.mp,35);assert.equal(e.currentMp,10);
});
test('398 workshop claims persist once and roll back a failed save without clearing old data',()=>{
 for(const failed of [false,true]){
  const s=state(),m=unit('m');s.monsters=[m];s.party=['m'];let click,saves=0;const before=structuredClone(s),button={disabled:false,addEventListener:(_,fn)=>click=fn},modal={classList:{add(){}},querySelectorAll:()=>[],querySelector:q=>q==='[data-circle-research398]'?button:{},remove(){}};
  const ctx={save:{state:s,save:()=>{saves++;return !failed;}},structuredClone,claimCircleResearch398,app:{insertAdjacentHTML(){}},Modal:()=>'',magicCircleWorkshopBody:()=>'',topModal:()=>modal,showToast(){},render(){}};
  vm.createContext(ctx);vm.runInContext(extract('function openMagicCircleWorkshop(','const INVENTORY_STACK_INFO='),ctx);ctx.openMagicCircleWorkshop('m');const first=click;first({currentTarget:button});
  assert.equal(saves,1);if(failed){assert.deepEqual(ctx.save.state,before);assert.equal(button.disabled,false);}else{assert.equal(ctx.save.state.magicCircles.instances.length,3);first({currentTarget:button});assert.equal(saves,1);}
 }
});
test('398 actual opening mirror protects only wearer, then original instant reflection still triggers once',async()=>{
 const wearer=unit('wearer'),ally=unit('ally'),enemy={id:'enemy',hp:999,maxHp:999};const b={party:[wearer,ally],enemies:[enemy],circleShields:{}};
 const ctx={battle:b,hasCircleEffect:(u,e)=>u===wearer&&e==='deathMirror',circleEffectNumber:(_,key,f)=>C.magicCircleLevelEffect('death_mirror',99)[key]??f,calculatedStats:()=>({hp:1000}),aliveEnemies:()=>[enemy],renderBattle(){},applyEnemyDamage:(_,t,n)=>t.hp=Math.max(0,t.hp-n),recoverBattleHp:(u,n,max)=>u.currentHp=Math.min(max,u.currentHp+n),addBattleLog(){},queueMagicCircleEvent(){},displayName:u=>u.id,recordBattleHealing(){},handleMagicCircleDeath(){}};
 vm.createContext(ctx);vm.runInContext(extract('async function applyOpeningMagicCircles(','function allyMagicCircleTurnCue(')+extract('function magicCircleInstantDeath(','function captureCrystalCost('),ctx);
 await ctx.applyOpeningMagicCircles();assert.equal(b.circleShields.wearer,450);assert.equal(b.circleShields.ally,undefined);
 assert.equal(ctx.magicCircleInstantDeath(wearer,enemy),true);assert.equal(enemy.hp,0);assert.equal(wearer.currentHp,400);assert.equal(ctx.magicCircleInstantDeath(wearer,{hp:100}),false);assert.equal(wearer.currentHp,0);
});
