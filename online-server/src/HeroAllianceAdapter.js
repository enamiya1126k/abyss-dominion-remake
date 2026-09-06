import {isHeroResonanceSpecies} from '../../src/core/HeroResonanceSystem.js';
import {heroAuthoredSkills,reserveHeroAction,chooseHeroAllianceSkill,runHeroAllianceAction,triggerHeroAlliance,drainHeroReactions,mitigateHeroDamage,tryHeroLastStand,heroId} from '../../src/core/HeroAllianceSystem.js';
export function onlineHeroView(b,actor=null){
 if(b.boss){b.heroAlliance348??={};return {...b,enemies:[b.boss,...b.minions],heroAlliance348:b.heroAlliance348}}
 if(actor?.side){const sides=['sun','moon'],own=actor.side,other=sides.find(s=>s!==own);b.heroAlliance348??={};for(const s of sides)b.heroAlliance348[s]??={lastStandUsed:false,pending:[]};return {...b,players:Object.fromEntries(Object.entries(b.players).filter(([,u])=>u.side===own)),enemies:Object.values(b.players).filter(u=>u.side!==own),heroAlliance348:{ally:b.heroAlliance348[own],enemy:b.heroAlliance348[other]}}}
 b.heroAlliance348??={};return b;
}
function prepare(b){for(const u of [...Object.values(b.players??{}),...b.enemies]){if(!isHeroResonanceSpecies(u.speciesId))continue;u.heroSkillCosts348=Object.fromEntries((u.skills??[]).map(s=>[s.id,Math.max(0,Number(s.mp)||0)]));}}
export function onlineHeroEnvironment(b,events,random=Math.random,{onDamage=null,onDeath=null}={}){
 prepare(b);
 return {events,random,stats:u=>({...u,...u.stats,hp:u.maxHp,_affixes:u.equipmentCombatEffects??u._affixes??{}}),
 damage:(target,side,amount,{source})=>{
  const cap=target.enemyMimicArmor?1:target.side?Math.ceil(target.maxHp*.55):!b.boss&&side==='enemy'?Math.ceil(target.maxHp*.9):Infinity;const before=target.hp,damage=mitigateHeroDamage(b,side,target,Math.min(amount,cap)),absorbed=Math.min(target.shield??0,damage);target.shield=Math.max(0,(target.shield??0)-absorbed);target.hp=Math.max(0,before-damage+absorbed);
  tryHeroLastStand(b,side,target,before);
  const dealt=Math.max(0,before-target.hp);onDamage?.(source,target,dealt,before);
  if(target.hp<=0){if(onDeath)onDeath(target,source);else if(target.circleEffect==='lastLife'&&!target.circleLastLifeUsed){target.circleLastLifeUsed=true;target.hp=1}else if(target.circleEffect==='revive'&&!target.circleReviveUsed){target.circleReviveUsed=true;target.hp=Math.max(1,Math.ceil(target.maxHp*.35))}}
  return dealt;
 },onSkill:(u,s)=>{if(s){b.skillUses??={};b.skillUses[heroId(u)]??={};b.skillUses[heroId(u)][s.id]=(b.skillUses[heroId(u)][s.id]??0)+1}}};
}
export function onlineHeroAuto(b,actor,now=Date.now()){
 if(!isHeroResonanceSpecies(actor?.speciesId))return null;const view=onlineHeroView(b,actor);prepare(view);const side=view.enemies.includes(actor)?'enemy':'ally',skill=chooseHeroAllianceSkill(view,side,actor),target=(skill?.type==='revive'?Object.values(view.players).find(u=>u.hp<=0):view.enemies.find(u=>u.hp>0));return{actorId:heroId(actor),kind:skill?'skill':'attack',skillId:skill?.id??null,targetId:heroId(target),enemyTargetId:heroId(view.enemies.find(u=>u.hp>0)),auto:true,submittedAt:now};
}
export function resolveOnlineHero(b,actor,action,events,random=Math.random,hooks={}){
 if(!isHeroResonanceSpecies(actor?.speciesId)||!['attack','skill'].includes(action?.kind))return false;
 const skill=action.kind==='skill'?heroAuthoredSkills(actor).find(s=>s.id===action.skillId):null;if(action.kind==='skill'&&!skill)return false;
 const view=onlineHeroView(b,actor),start=events.length,env=onlineHeroEnvironment(view,events,random,hooks),side=view.enemies.includes(actor)?'enemy':'ally';
 runHeroAllianceAction(view,side,actor,skill,env,{targetId:b.boss?action.enemyTargetId:action.targetId});action.heroResolved348=true;b.skillUses=view.skillUses;
 for(const e of events.slice(start)){
  const u=Object.values(b.players??{}).find(u=>heroId(u)===e.actorId),target=Object.values(b.players??{}).find(u=>heroId(u)===e.targetId),metrics=u?.metrics,contribution=b.contribution?.[u?.ownerPlayerId??u?.playerId];
  e.actorOwnerId=u?.ownerPlayerId??u?.playerId;e.targetKind=target?'player':b.boss?(e.targetId===b.boss.id?'boss':'minion'):e.targetKind;
  if(e.kind==='damage'){if(metrics)metrics.damage=(metrics.damage??0)+e.value;if(target?.metrics)target.metrics.damageTaken=(target.metrics.damageTaken??0)+e.value;if(contribution)contribution.damage=(contribution.damage??0)+e.value}
  if(['heal','revive'].includes(e.kind)){if(metrics)metrics.healing=(metrics.healing??0)+e.value;if(contribution)contribution.healing=(contribution.healing??0)+e.value}
  if(e.kind==='revive'&&contribution)contribution.revives=(contribution.revives??0)+1;
 }
 return true;
}
export function onlineHeroFollowups(b,actor,events,random=Math.random,hooks={}){if(!isHeroResonanceSpecies(actor?.speciesId))return;const view=onlineHeroView(b,actor);triggerHeroAlliance(view,'ally',actor,onlineHeroEnvironment(view,events,random,hooks));}
export function onlineHeroIncoming(b,target,amount){return mitigateHeroDamage(onlineHeroView(b,target),'ally',target,amount)}
export function onlineHeroSurvive(b,target,before,events,random=Math.random,hooks={}){const view=onlineHeroView(b,target);tryHeroLastStand(view,'ally',target,before);drainHeroReactions(view,onlineHeroEnvironment(view,events,random,hooks));}

export function reserveOnlineHeroNormal(b,actor){return !isHeroResonanceSpecies(actor?.speciesId)||reserveHeroAction(onlineHeroView(b,actor),'ally',actor)}
