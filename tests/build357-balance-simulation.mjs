// Seeded GM-pack encounters using actual generated equipment, player skill damage,
// hit checks, enemy mitigation and shared hero actions. No magic circles/items;
// this is a balance model, not a replay of a user's save or browser animations.
import {applyGameMasterReward} from '../src/core/SerialCodeSystem.js';
import {equipmentStatMultiplier} from '../src/models/Equipment.js';
import {calculatedStats} from '../src/models/Monster.js';
import {maxMp,learnedSkills,effectiveSkillMpCost,skillDamage} from '../src/battle/SkillSystem.js';
import {aggregateSeriesEffects} from '../src/data/equipmentSeries.js';
import {equipmentAffixesWithSeries} from '../src/core/EquipmentAffixSystem.js';
import {applyCampaignHeroLoadout} from '../src/core/CampaignHeroLoadoutSystem.js';
import {applyEnemyDamage} from '../src/battle/BattleRules.js';
import {attackHits} from '../src/battle/HitSystem.js';
import {attributeDamageMultiplier} from '../src/data/attributes.js';
import * as H from '../src/core/HeroAllianceSystem.js';
export function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
export function gmParty(random){const old=Math.random;Math.random=random;try{const state={};applyGameMasterReward(state,'progressPack356');for(const [i,m] of state.monsters.entries()){
 const gear=state.equipment.slice(i*6,i*6+6),stats={},counts={};m.equipment={};for(const e of gear){m.equipment[e.ruleOverrides.subslot]=e.id;e.equippedBy=m.id;for(const[k,v]of Object.entries(e.stats))stats[k]=(stats[k]??0)+Math.round(v*equipmentStatMultiplier(e));counts[e.series]=(counts[e.series]??0)+1}
 m._equipmentStats=stats;m._seriesEffects=aggregateSeriesEffects(counts);m._equipmentAffixes=equipmentAffixesWithSeries(gear,m._seriesEffects);m.stats=calculatedStats(m);m.maxHp=m.stats.hp;m.maxMp=maxMp(m);m.currentHp=m.maxHp;m.currentMp=m.maxMp;
 }return state.monsters;}finally{Math.random=old}}
export function simulate(ids,seed=1){const random=rng(seed),party=gmParty(random),enemies=ids.map(id=>applyCampaignHeroLoadout({id,speciesId:id,campaignHeroId:id,level:1000})),b={turn:1,party,enemies,enemyEffects:{},allyEffects:{},cooldowns:{},enemyStatuses:{},log:[]},events=[];
 const effect=(u,side,k)=>H.heroEffect(b,u,side,k),stats=u=>u.stats??{...u,hp:u.maxHp};
 const env={random,events,stats,damage:(u,side,d)=>{if(side==='enemy')return applyEnemyDamage(b,u,d,{heroRulesApplied:true}).damage;const before=H.heroHp(u);H.setHeroHp(u,Math.max(0,before-H.mitigateHeroDamage(b,side,u,d)));return before-H.heroHp(u)}};
 let peakHit=0,damage=0;
 for(;b.turn<=30&&party.some(u=>H.heroHp(u)>0)&&enemies.some(u=>u.hp>0);b.turn++){
 const order=[...party,...enemies].filter(u=>H.heroHp(u)>0).sort((a,c)=>(stats(c).spd*(1+effect(c,enemies.includes(c)?'enemy':'ally','spdUp')-effect(c,enemies.includes(c)?'enemy':'ally','spdDown')))-(stats(a).spd*(1+effect(a,enemies.includes(a)?'enemy':'ally','spdUp')-effect(a,enemies.includes(a)?'enemy':'ally','spdDown'))));
 for(const u of order){if(H.heroHp(u)<=0||!enemies.some(e=>e.hp>0)||!party.some(a=>H.heroHp(a)>0))continue;
  if(enemies.includes(u)){const from=events.length;H.runHeroAllianceAction(b,'enemy',u,H.chooseHeroAllianceSkill(b,'enemy',u),env);for(const e of events.slice(from))if(e.kind==='damage')peakHit=Math.max(peakHit,e.value);continue;}
  const cd=H.heroCooldowns(b,u),s=stats(u),skills=learnedSkills(u).filter(k=>!cd[k.id]&&u.currentMp>=effectiveSkillMpCost(u,k));
  const choices=skills.map(k=>({k,score:k.type==='revive'?(party.some(a=>H.heroHp(a)<=0)?1e6:-1):k.type==='selfHeal'?(u.currentHp/u.maxHp<.5?1e5:-1):k.type==='allHeal'?(party.some(a=>a.currentHp>0&&a.currentHp/a.maxHp<.65)?1e5:-1):(k.power??0)*(k.hits??1)})).sort((a,c)=>c.score-a.score),skill=choices[0]?.score>=0?choices[0].k:{id:'attack',power:1,type:'attack',damageClass:s.matk>s.atk?'magic':'physical',element:u.attribute};
  u.currentMp-=effectiveSkillMpCost(u,skill)||0;if(skill.cooldown)cd[skill.id]=skill.cooldown+1;
  if(skill.type==='revive'){const dead=party.find(a=>H.heroHp(a)<=0);if(dead)dead.currentHp=Math.max(1,Math.floor(dead.maxHp*(skill.revive??.3)));continue;}
  if(['selfHeal','allHeal'].includes(skill.type)){for(const a of skill.type==='allHeal'?party.filter(a=>a.currentHp>0):[u])a.currentHp=Math.min(a.maxHp,a.currentHp+Math.floor(a.maxHp*(skill.heal??.3)*(1+(s._affixes.healPower??0)/100)));continue;}
  const target=enemies.filter(e=>e.hp>0).sort((a,c)=>a.hp-c.hp)[0];for(let i=0;i<(skill.hits??1)&&target.hp>0;i++){
   if(!attackHits({accuracy:s.accuracy,accuracyDown:effect(u,'ally','accuracyDown'),evasion:target.evasion,evasionDown:effect(target,'enemy','evasionDown'),guaranteedHit:skill.guaranteedHit},random))continue;
   const af=Math.max(.2,1+effect(u,'ally','atkUp')-effect(u,'ally','atkDown')),df=Math.max(.2,1+effect(target,'enemy','defUp')-effect(target,'enemy','defDown'))*(1-(skill.defenseIgnore??0));
   const raw=skillDamage({...s,atk:s.atk*af,matk:s.matk*af,_currentHpRatio:u.currentHp/u.maxHp},{...target,def:target.def*df,mdef:target.mdef*df},skill,random()<.95)*(1+(s._affixes.skillPower??0)/100)*attributeDamageMultiplier(skill.element??u.attribute,target.element??'neutral')*(1+effect(target,'enemy','vulnerable'));
   damage+=applyEnemyDamage(b,target,Math.floor(raw),{sourceId:u.id}).damage;
  }
  for(const e of skill.effects??[]){const dest=e.enemy?target:u,side=e.enemy?'enemy':'ally';H.heroEffects(b,dest,side).push({...e,turns:e.turns??3});}
 }
 for(const side of ['ally','enemy'])for(const u of H.heroSideUnits(b,side)){const list=H.heroEffects(b,u,side);for(const e of list)e.turns--;list.splice(0,list.length,...list.filter(e=>e.turns>0));for(const k of Object.keys(H.heroCooldowns(b,u)))H.heroCooldowns(b,u)[k]=Math.max(0,H.heroCooldowns(b,u)[k]-1);}
 }
 return{won:enemies.every(e=>e.hp<=0),rounds:b.turn-1,damage,remaining:enemies.map(e=>Math.round(e.hp/e.maxHp*100)),peakHit};
}
if(process.argv[1]?.endsWith('build357-balance-simulation.mjs'))for(const ids of [...H.HERO_ORDER.map(id=>[id]),H.HERO_ORDER]){const rows=Array.from({length:40},(_,i)=>simulate(ids,i+1));console.log(JSON.stringify({ids,wins:rows.filter(r=>r.won).length,n:rows.length,meanRounds:rows.reduce((s,r)=>s+r.rounds,0)/rows.length,noDamage:rows.filter(r=>r.damage===0).length,medianDamage:rows.map(r=>r.damage).sort((a,b)=>a-b)[20]}));}
