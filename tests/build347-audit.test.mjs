import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {MYTHIC_SERIAL_SPECIES} from '../src/data/mythicSerialSpecies.js';
import {chooseEnemyAction,enemyActionMpCost,specialActionInfo,specialActionMultiplier} from '../src/battle/EnemyAI.js';
import {commitCampaignHeroSkill} from '../src/battle/CampaignHeroSkillSystem.js';
import {applyBattleEffect,hasEffect,effectValue,tickBattleEffects} from '../src/battle/BattleRules.js';
const hero=(speciesId,extra={})=>({id:speciesId,speciesId,campaignHeroId:speciesId,level:1000,hp:100,maxHp:100,atk:100,matk:100,def:100,spd:100,currentMp:999,maxMp:1000,...extra});
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const extract=(from,to)=>main.slice(main.indexOf(from),main.indexOf(to,main.indexOf(from)));
const resolver=extract('async function resolveEnemySpecialAction(', 'async function resolveEnemyFlee(');
function runtime(enemies){
 const battle={enemies,party:[{id:'p',currentHp:1000}],turn:1,reviveCount:0,enemyEffects:{},allyEffects:{},enemyStatuses:{}};
 const context={battle,Math,Number,Set,Object,Boolean,String,Array,specialActionInfo,specialActionMultiplier,hasEffect,applyBattleEffect,addBattleLog:()=>{},battleBanner:async()=>{},battleFlash:()=>{},applyFloorBossActionTax:async()=>{},canBattleRevive:()=>true,queueBattleRecovery:()=>{},flushBattleRecoveries:async()=>{},floatText:async()=>{},POSITIVE_ENEMY_EFFECTS:new Set(['atkUp','defUp','spdUp','guard','regen']),recoverFloorBossHp:(e,n)=>{const before=e.hp;e.hp=Math.min(e.maxHp,e.hp+n);return e.hp-before},grantEnemyAuthorityShield:(e,rate)=>{for(const ally of battle.enemies.filter(x=>x.hp>0))ally._floorBossHpShield=Math.floor(ally.maxHp*rate)}};
 Object.assign(context,{chooseEnemyTarget:()=>battle.party.find(unit=>unit.currentHp>0),floorBossDomainActionMultiplier:()=>1,turnPowerMultiplier:()=>1,allyAilment:()=>null,animateAttack:async()=>{},dealEnemyHit:async(e,target,multiplier,label,crit,element,rules)=>{context.lastHit={multiplier,element,rules};return 10;}});
 vm.createContext(context);vm.runInContext(resolver,context);return context;
}
test('all sixteen authored skills resolve to their real effects and damage classes',()=>{
 for(const species of Object.values(MYTHIC_SERIAL_SPECIES))for(const skill of species.authoredSkills){const action='campaignHero:'+skill.id,info=specialActionInfo(action);assert.equal(info.label,skill.name);assert.equal(specialActionMultiplier(action),skill.power);assert.equal(info.damageClass,skill.damageClass);assert.deepEqual(info.bonusVsEffect,skill.bonusVsEffect);assert.equal(enemyActionMpCost(hero(species.id),action),Math.max(skill.mp,Math.ceil(1000*(skill.mpRate??0))));}
});
test('Rion revives fallen allies, respects seals, MP and serialized cooldowns',()=>{
 const r=hero('myth_rion'),dead=hero('myth_yori',{hp:0});const context={allies:[r,dead],opponents:[{id:'p',currentHp:100}],battle:{turn:1,enemyEffects:{}}};
 const action=chooseEnemyAction(r,context);assert.equal(action,'campaignHero:rion_community');commitCampaignHeroSkill(r,action,1);
 const restored=JSON.parse(JSON.stringify(r));assert.notEqual(chooseEnemyAction(restored,context),action);context.battle.turn=7;assert.equal(chooseEnemyAction(restored,context),action);
 context.battle.enemyEffects[dead.id]=[{kind:'reviveSeal',turns:2}];assert.notEqual(chooseEnemyAction(r,context),action);
 r.currentMp=0;assert.equal(chooseEnemyAction(r,context),'attack');
});
test('enemy party buffs expire without permanently multiplying base stats',async()=>{
 const e=hero('myth_enami'),r=hero('myth_rion'),c=runtime([e,r]);
 await c.resolveEnemySpecialAction(e,'campaignHero:enami_hyper_focus');
 assert.equal(e.atk,100);assert.equal(r.atk,100);assert.equal(effectValue(c.battle,r.id,'atkUp','enemy'),.28);assert.equal(r._floorBossHpShield,25);
 await c.resolveEnemySpecialAction(e,'campaignHero:enami_hyper_focus');assert.equal(effectValue(c.battle,r.id,'atkUp','enemy'),.28);
 for(let i=0;i<3;i++)tickBattleEffects(c.battle);assert.equal(effectValue(c.battle,r.id,'atkUp','enemy'),0);assert.equal(r.atk,100);
});
test('enemy revive restores the advertised HP and MP; healing affects all living allies',async()=>{
 const r=hero('myth_rion'),dead=hero('myth_yori',{hp:0,currentMp:0}),c=runtime([r,dead]);
 await c.resolveEnemySpecialAction(r,'campaignHero:rion_community');assert.equal(dead.hp,38);assert.equal(dead.currentMp,140);assert.equal(c.battle.reviveCount,1);
 r.hp=10;dead.hp=10;await c.resolveEnemySpecialAction(r,'campaignHero:rion_therapy');assert.equal(r.hp,54);assert.equal(dead.hp,54);
});
test('actual follow-up resolver applies attack buffs and defense debuffs',async()=>{
 const fn=extract('async function performInvincibleAllianceSkill(', 'async function triggerInvincibleAlliance(');
 async function run(atkFactor,defFactor){let observed;const member={id:'m',speciesId:'myth_yori',currentHp:100},enemy={id:'e',hp:1000,def:100,mdef:200};
 const c={battle:{party:[member],enemyStatuses:{}},Math,Number,Boolean,Set,aliveEnemies:()=>[enemy],setSkillCooldown:()=>{},applySkillMastery:(m,s)=>s,scaleHeroResonanceSkill:s=>s,resolveRandomSkillElement:s=>s,convertedAttackStats:s=>s,calculatedStats:()=>({hp:100,atk:100,matk:200,spd:0}),displayName:()=>'',addBattleLog:()=>{},battleBanner:async()=>{},applyHeroResonancePressure:()=>{},heroResonanceProfile:()=>({count:2}),animateAttack:async()=>{},hasEffect:()=>false,allyAttackFactor:()=>atkFactor,enemyDefenseFactor:()=>defFactor,skillDamage:(s,e)=>{observed={s,e};return 1},turnPowerMultiplier:()=>1,attributeDamageMultiplier:()=>1,enemyDamageMultiplier:()=>1,magicCircleDamageMultiplier:()=>1,SPECIES:{},applyEnemyDamage:()=>({damage:1,beforeHp:1000}),recordBattleDamage:()=>{},registerWeaponFinisher:()=>{},animateHit:async()=>{},floatText:async()=>{},applySkillEffects:()=>{},resolveCompositeSkillRevive:async()=>{}};
 vm.createContext(c);vm.runInContext(fn,c);await c.performInvincibleAllianceSkill(member,{type:'attack',power:1});return observed;
 }
 const result=await run(1.5,.75);assert.equal(result.s.atk,150);assert.equal(result.s.matk,300);assert.equal(result.e.def,75);assert.equal(result.e.mdef,150);
});

test('enemy Enami defense break activates Yori conditional damage in the real resolver',async()=>{
 const e=hero('myth_enami'),y=hero('myth_yori'),c=runtime([e,y]);
 await c.resolveEnemySpecialAction(y,'campaignHero:yori_rifle');assert.equal(c.lastHit.multiplier,2.2);
 await c.resolveEnemySpecialAction(e,'campaignHero:enami_world_create');assert.ok(hasEffect(c.battle,'p','defDown'));assert.ok(hasEffect(c.battle,'p','vulnerable'));
 await c.resolveEnemySpecialAction(y,'campaignHero:yori_rifle');assert.equal(c.lastHit.multiplier,2.2*1.28);assert.equal(c.lastHit.rules.defenseIgnore,.32);
});
