import * as Balance from '../src/core/CampaignEndgameBalance.js';
import fs from 'node:fs';import vm from 'node:vm';
import {SPECIES} from '../src/data/species.js';
import * as E from '../src/core/EnemyScalingSystem.js';
import * as A from '../src/battle/EnemyAI.js';
import * as Q from '../src/models/Equipment.js';
import * as C from '../src/core/MagicCircleSystem.js';
import * as D from '../src/core/EndgameSystem.js';
import * as P from '../src/core/Campaign100System.js';
import {endgameCharacter} from '../src/data/endgameCharacters.js';
import {applyEliteModifiers} from '../src/core/SecondWorldEliteSystem.js';
import {canonicalAttribute} from '../src/data/attributes.js';
import {rng} from './build357-balance-simulation.mjs';
export function enemyAt(floor=80,id='ten_space',seed=1){const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),random=rng(seed),math=Object.create(Math);math.random=random;const c={...Balance,...E,...A,...Q,...C,...D,...P,SPECIES,endgameCharacter,applyEliteModifiers,canonicalAttribute,Math:math,Date,save:{state:{player:{currentFloor:floor}}},ENEMY_EQUIPMENT_SUBSLOTS:[['weaponRight','weapon'],['weaponLeft','weapon'],['armorBody','armor'],['armorSupport','armor'],['accessoryNeck','accessory'],['accessoryFinger','accessory']]};vm.createContext(c);for(const name of ['normalizedElement','applyEnemyMultiplier','prepareEnemyEntry','milestoneBossEntry','hydrateEndgameEnemy','applyEnemyMagicCircleProfile','applyFloorBossSignatureProfile','makeBattleEnemy']){const start=source.indexOf(`function ${name}(`),rest=source.slice(start),next=rest.slice(9).search(/\n(?:async )?function /),text=next<0?rest:rest.slice(0,next+9);vm.runInContext(text,c)}const old=Math.random;Math.random=random;try{return c.makeBattleEnemy(c.milestoneBossEntry(id,floor))}finally{Math.random=old}}
if(process.argv[1]?.endsWith('build358-balance-model.mjs'))console.log(JSON.stringify(Array.from({length:3},(_,i)=>{const e=enemyAt(80,'ten_space',i+1);return{hp:e.maxHp,atk:e.atk,matk:e.matk,def:e.def,mdef:e.mdef,spd:e.spd,circle:e.enemyMagicCircle?.id,level:e.level}})));

import {gmParty} from './build357-balance-simulation.mjs';
import {calculatedStats} from '../src/models/Monster.js';
import {maxMp,learnedSkills,effectiveSkillMpCost,skillDamage} from '../src/battle/SkillSystem.js';
import {attackHits} from '../src/battle/HitSystem.js';
import {attributeDamageMultiplier} from '../src/data/attributes.js';
import {applyEnemyDamage,createBattleRulesState,effectValue,applyBattleEffect,tickBattleEffects,tickCooldowns} from '../src/battle/BattleRules.js';
import * as U from '../src/core/EndgameUltimateSystem.js';
export function balanceParty(seed,normal=false){const party=gmParty(rng(seed));if(normal)for(const u of party){u.level=800;u.plus=3;u.affection=300;for(const k of Object.keys(u._equipmentStats))u._equipmentStats[k]=Math.round(u._equipmentStats[k]*.45);u._equipmentAffixes={};u._seriesEffects={};u.stats=calculatedStats(u);u.maxHp=u.stats.hp;u.maxMp=maxMp(u);u.currentHp=u.maxHp;u.currentMp=u.maxMp}return party}
// Comparison fixture, not an estimate of everyone's inventory. Uses the actual
// enemy factory, damage/AI/CT/hit functions. Omits item economy and player circles.
export function encounterModel(seed=1,{normal=false,untuned=false}={}){const random=rng(seed),party=balanceParty(seed,normal),e=enemyAt(80,'ten_space',seed),b={turn:1,party,enemies:[e],...createBattleRulesState(party)},old=Math.random;Math.random=random;
 if(untuned){for(const[k,v]of Object.entries(e.campaignBalance358.rates)){const stat=k==='hp'?'maxHp':k;e[stat]=Math.round(e[stat]/v)}e.hp=e.maxHp}
 U.prepareUltimateBattle(b,{stats:u=>party.includes(u)?u.stats:{...u,hp:u.maxHp},mp:u=>u.maxMp,skills:u=>party.includes(u)?learnedSkills(u):endgameCharacter(u.endgameBossId)?.skills??[]});
 const fx=(u,k)=>effectValue(b,u.id,k,party.includes(u)?'ally':'enemy');
 try{for(;b.turn<=30&&e.hp>0&&party.some(u=>u.currentHp>0);b.turn++){
  const order=[...party,e].filter(u=>(u.currentHp??u.hp)>0).sort((a,c)=>(c.stats?.spd??c.spd)-(a.stats?.spd??a.spd));
  for(const u of order){if((u.currentHp??u.hp)<=0||e.hp<=0||!party.some(a=>a.currentHp>0)||fx(u,'stun'))continue;if(U.beforeUltimateAction(b,u,{random}))continue;
   if(u===e){const special=U.chooseEndgameUltimate(b,e);if(special){U.castEndgameUltimate(b,e,special.id,{random});continue}const action=A.chooseEnemyAction(e,{allies:[e],opponents:party,battle:b}),cost=A.enemyActionMpCost(e,action),info=A.specialActionInfo(action);e.currentMp=Math.max(0,e.currentMp-cost);if(action==='divineBarrier'||action==='guard'||action==='charge')continue;if(action==='heal'){e.hp=Math.min(e.maxHp,e.hp+A.enemyHealAmount(e));continue}if(action==='enrage'){e.atk=Math.floor(e.atk*1.18);continue}const targets=party.filter(u=>u.currentHp>0&&!U.ultimateIsolated(b,u));if(!targets.length)continue;const affected=info?.allEnemies?targets:[targets.sort((a,c)=>Math.max(c.stats.atk,c.stats.matk)-Math.max(a.stats.atk,a.stats.matk))[0]];U.beginUltimateAction(b,e,info);
    for(const target of affected){const st=target.stats;if(!attackHits({accuracy:e.accuracy,evasion:st.evasion,guaranteedHit:info?.guaranteedHit},random))continue;const magic=info?.damageClass==='magic',atk=(magic?e.matk:e.atk)*Math.max(.2,1+fx(e,'atkUp')-fx(e,'atkDown')),def=(magic?st.mdef:st.def)*Math.max(.2,1+fx(target,'defUp')-fx(target,'defDown'))*(1-(info?.defenseIgnore??0))*.55,power=info?.power??A.enemyAttackMultiplier(e,action),critical=random()<.08+e.crit,guard=fx(target,'guard');let damage=A.enemyDamageAfterDefense(atk,def)*power*attributeDamageMultiplier(info?.element??e.element,target.attribute)*(1-guard)*(1+(fx(target,'vulnerable')))*(critical?1.55:1);target.currentHp=Math.max(0,target.currentHp-Math.floor(damage));for(const effect of info?.effects??[])if(effect.enemy)applyBattleEffect(b,target.id,effect,'ally')}
    if(info)U.afterUltimateOrdinary(b,e,info,{random});U.finishUltimateAction(b);continue;
   }
   const st=u.stats,skills=learnedSkills(u).filter(s=>!b.cooldowns[u.id]?.[s.id]&&u.currentMp>=effectiveSkillMpCost(u,s)),choice=skills.map(s=>({s,score:s.type==='revive'?(party.some(a=>a.currentHp<=0)?1e6:-1):s.type==='selfHeal'?(u.currentHp/st.hp<.55?1e5:-1):s.type==='allHeal'?(party.some(a=>a.currentHp>0&&a.currentHp/a.stats.hp<.65)?1e5:-1):(s.power??0)*(s.hits??1)})).sort((a,c)=>c.score-a.score)[0],skill=choice?.score>0?choice.s:{id:'attack',name:'たたかう',type:'attack',power:1,mp:0,damageClass:st.matk>st.atk?'magic':'physical',element:u.attribute};U.beginUltimateAction(b,u,skill);u.currentMp-=effectiveSkillMpCost(u,skill);if(skill.cooldown)b.cooldowns[u.id][skill.id]=skill.cooldown+1;
   if(skill.type==='revive'){const dead=party.find(a=>a.currentHp<=0);if(dead)dead.currentHp=Math.floor(dead.stats.hp*(skill.revive??.3));continue}if(['selfHeal','allHeal'].includes(skill.type)){for(const a of skill.type==='allHeal'?party.filter(a=>a.currentHp>0):[u])a.currentHp=Math.min(a.stats.hp,a.currentHp+Math.floor(a.stats.hp*(skill.heal??.25)));continue}
   for(let hit=0;hit<(skill.hits??1)&&e.hp>0;hit++){if(!attackHits({accuracy:st.accuracy,evasion:e.evasion,guaranteedHit:skill.guaranteedHit},random))continue;const af=Math.max(.2,1+fx(u,'atkUp')-fx(u,'atkDown')),df=Math.max(.2,1+fx(e,'defUp')-fx(e,'defDown'))*(1-(skill.defenseIgnore??0)),raw=skillDamage({...st,atk:st.atk*af,matk:st.matk*af},{...e,def:e.def*df,mdef:e.mdef*df},skill,random()<.95)*(1+(st._affixes?.skillPower??0)/100)*attributeDamageMultiplier(skill.element??u.attribute,e.element)*A.enemyDamageMultiplier(e)*(e.hiddenDamageTaken??1)*(e.elementMultipliers?.[skill.element??u.attribute]??1);applyEnemyDamage(b,e,raw,{sourceId:u.id,element:skill.element??u.attribute,damageClass:skill.damageClass});}
   for(const effect of skill.effects??[])applyBattleEffect(b,effect.enemy?e.id:u.id,effect,effect.enemy?'enemy':'ally');U.afterUltimateOrdinary(b,u,skill,{random});U.finishUltimateAction(b);
  }
  tickCooldowns(b);tickBattleEffects(b);U.endUltimateRound(b);
 }return{won:e.hp<=0,rounds:b.turn-1,remaining:Math.round(e.hp/e.maxHp*100),partyHp:party.map(u=>u.stats.hp)};
 }finally{U.cleanupUltimateBattle(b);Math.random=old}
}
