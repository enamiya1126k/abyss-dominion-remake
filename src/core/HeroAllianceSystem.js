import {MYTHIC_SERIAL_SPECIES} from '../data/mythicSerialSpecies.js?v=3.1.28-build348';
import {attributeDamageMultiplier} from '../data/attributes.js';
import {heroResonanceMembers,heroResonanceProfile,scaleHeroResonanceSkill,isHeroResonanceSpecies} from './HeroResonanceSystem.js?v=3.1.28-build348';

// One rules implementation for browser allies, campaign enemies and online actors.
export const HERO_ORDER=Object.freeze(['myth_rion','myth_enami','myth_hide','myth_yori']);
export const HERO_POSITIVE=new Set(['atkUp','defUp','spdUp','regen','guard','counter','lifeSteal','guaranteedCritical','evasionUp','accuracyUp','critUp','taunt','magicToPhysical','guaranteedHit']);
export const heroId=u=>u?.playerId??u?.id;
export const heroHp=u=>Math.max(0,Number(u?.currentHp??u?.hp)||0);
export const setHeroHp=(u,n)=>{if('currentHp' in u)u.currentHp=Math.max(0,n);else u.hp=Math.max(0,n)};
export const heroMp=u=>Math.max(0,Number(u?.currentMp??u?.mp)||0);
export const setHeroMp=(u,n)=>{if('mp' in u)u.mp=Math.max(0,n);else u.currentMp=Math.max(0,n)};
export const heroSideUnits=(b,side)=>side==='enemy'?(b?.enemies??[]):(b?.party??Object.values(b?.players??{}));
export const heroRound=b=>Math.max(1,Number(b.turn??b.round)||1);
export function heroEffects(b,u,side){
 if(b.players){u.effects??=[];return u.effects}
 const key=side==='enemy'?'enemyEffects':'allyEffects';b[key]??={};return b[key][heroId(u)]??=[];
}
export function heroEffect(b,u,side,kind){return heroEffects(b,u,side).filter(e=>e.kind===kind&&(e.turns??1)>0).reduce((n,e)=>n+(Number(e.value)||0),0)}
export function heroCooldowns(b,u){if(b.players)return u.cooldowns??={};b.cooldowns??={};return b.cooldowns[heroId(u)]??={}}
export function heroAllianceState(b,side){
 b.heroAlliance348??={};const s=b.heroAlliance348[side]??={lastStandUsed:false,pending:[]};
 if(s.round!==heroRound(b)){s.round=heroRound(b);s.actions=0;s.regular=[];s.shortened=false;s.extended=false;s.limit=heroResonanceProfile(heroSideUnits(b,side)).totalActions;s.signatureExtra=[]}
 s.limit=heroResonanceProfile(heroSideUnits(b,side)).totalActions;return s;
}
export function reserveHeroAction(b,side,u,{followup=false}={}){
 const s=heroAllianceState(b,side),id=heroId(u);if(heroHp(u)<=0)return false;
 if(s.actions>=s.limit)return false;
 // All normal, resonance and emergency actions share the current n² budget.
 if(!followup&&s.regular.includes(id))return false;
 s.actions++;if(!followup)s.regular.push(id);return true;
}
export function mitigateHeroDamage(b,side,u,amount){
 let damage=Math.max(0,Math.floor(Number(amount)||0));if(!damage)return 0;
 const profile=heroResonanceProfile(heroSideUnits(b,side));damage=Math.max(1,Math.floor(damage*(1-profile.damageReduction)));
 const absorbed=Math.min(Math.max(0,Number(u.heroShield348)||0),damage);u.heroShield348=Math.max(0,(u.heroShield348??0)-absorbed);return damage-absorbed;
}
export function tryHeroLastStand(b,side,u,beforeHp){
 if(!isHeroResonanceSpecies(u?.speciesId)||heroHp(u)>0||beforeHp<=0)return false;
 const s=heroAllianceState(b,side);if(s.lastStandUsed)return false;
 const members=heroResonanceMembers(heroSideUnits(b,side).map(x=>x===u?{...x,currentHp:beforeHp,hp:beforeHp}:x));if(members.length!==4)return false;
 setHeroHp(u,1);s.lastStandUsed=true;s.pending.push({sourceId:heroId(u),members:members.filter(x=>heroId(x)!==heroId(u)).map(heroId)});return true;
}
export function heroOverheal(b,side,u,overflow,maxHp){
 if(!b||!isHeroResonanceSpecies(u?.speciesId)||heroHp(u)<=0||heroResonanceProfile(heroSideUnits(b,side)).count<2)return 0;
 const cap=Math.floor(maxHp*.4),before=Math.max(0,Number(u.heroShield348)||0);u.heroShield348=Math.min(cap,before+Math.max(0,Math.floor(overflow)));return Math.max(0,u.heroShield348-before);
}
function putEffect(b,u,side,e,source){
 const list=heroEffects(b,u,side),key=`hero348:${heroId(source)}:${e.kind}`,existing=list.find(x=>x.sourceKey===key);
 if(existing){existing.value=Math.max(Number(existing.value)||0,Number(e.value)||0);existing.turns=Math.max(existing.turns??0,e.turns??3)}
 else list.push({...e,turns:e.turns??3,sourceKey:key,sourceMonsterId:heroId(source)});
}
export function heroAuthoredSkills(u){return (MYTHIC_SERIAL_SPECIES[u?.speciesId]?.authoredSkills??[]).filter(s=>(s.unlock?.value??1)<=(u.level??1))}
export function heroSkillCost(u,s){if(Number.isFinite(u.heroSkillCosts348?.[s.id]))return u.heroSkillCosts348[s.id];const base=Math.max(Number(s.mp)||0,Math.ceil((Number(u.maxMp)||0)*(Number(s.mpRate)||0))),reduction=Math.min(50,Math.max(0,Number((u._equipmentAffixes??u._affixes??u.equipmentCombatEffects)?.mpCostReduction)||0));return Math.ceil(base*(1-reduction/100))}
export function chooseHeroAllianceSkill(b,side,u,{free=false}={}){
 const allies=heroSideUnits(b,side),opposite=side==='ally'?'enemy':'ally',enemies=heroSideUnits(b,opposite).filter(x=>heroHp(x)>0),cd=heroCooldowns(b,u);
 const list=heroAuthoredSkills(u).filter(s=>!(cd[s.id]>0)&&(free||heroMp(u)>=heroSkillCost(u,s))).map(s=>{
  let score=-1;const alive=allies.filter(x=>heroHp(x)>0);
  if(s.type==='revive')score=allies.some(x=>heroHp(x)<=0&&!heroEffects(b,x,side).some(e=>e.kind==='reviveSeal'&&(e.turns??1)>0))?10000:-1;
  else if(s.type==='allHeal'){
   const hurt=Math.max(0,...alive.map(x=>1-heroHp(x)/Math.max(1,x.maxHp??x.stats?.hp??heroHp(x))));
   const dirty=s.cleanse&&alive.some(x=>heroEffects(b,x,side).some(e=>!HERO_POSITIVE.has(e.kind)));
   score=hurt>=.18?500+hurt*100:dirty?450:alive.some(x=>!(x.heroShield348>0))&&heroResonanceProfile(allies).count>=2?30:-1;
  }else if(s.type==='buff')score=alive.some(x=>(s.effects??[]).some(e=>(e.allies||x===u)&&heroEffect(b,x,side,e.kind)<(e.value??0)*.7))?(u.speciesId==='myth_yori'?230:120):-1;
  else{
   const setup=(s.effects??[]).filter(e=>e.enemy&&['defDown','vulnerable','spdDown'].includes(e.kind));
   const needed=enemies.some(x=>setup.some(e=>heroEffect(b,x,opposite,e.kind)<(e.value??0)*.7));
   const bonus=enemies.some(x=>heroEffect(b,x,opposite,s.bonusVsEffect?.kind)>0);
   score=(s.id==='enami_world_create'&&needed?300:0)+(s.power??1)*(s.hits??1)*(s.allEnemies?enemies.length:1)+(needed?180:0)+(bonus?160:0);
  }
  return{s,score};
 }).filter(x=>x.score>=0).sort((a,c)=>c.score-a.score);
 return list[0]?.s??null;
}
export function runHeroAllianceAction(b,side,u,skill,env={},options={}){
 const events=env.events??[],random=env.random??Math.random,stats=env.stats??(x=>x.stats??x),opposite=side==='ally'?'enemy':'ally';
 const allies=heroSideUnits(b,side),enemies=heroSideUnits(b,opposite),alive=()=>allies.filter(x=>heroHp(x)>0),foes=()=>enemies.filter(x=>heroHp(x)>0),state=heroAllianceState(b,side);
 if(heroHp(u)<=0||!foes().length)return false;
 if(!options.reserved&&!reserveHeroAction(b,side,u,{followup:options.followup}))return false;
 if((env.blocked?.(u,side))||heroEffects(b,u,side).some(e=>['status:sleep','status:freeze','status:paralysis','sleep','freeze','stun'].includes(e.kind)&&(e.turns??1)>0))return false;
 if(skill&&(heroCooldowns(b,u)[skill.id]>0||!options.followup&&heroMp(u)<heroSkillCost(u,skill)))skill=null;
 if(skill){if(!options.followup)setHeroMp(u,heroMp(u)-heroSkillCost(u,skill));if(skill.cooldown)heroCooldowns(b,u)[skill.id]=skill.cooldown+1}
 const original=skill,definition=MYTHIC_SERIAL_SPECIES[u.speciesId];skill=skill??{id:'attack',name:'たたかう',power:1,type:'attack'};
 if(options.followup)skill=scaleHeroResonanceSkill(skill);
 const actorId=heroId(u),emit=(kind,target,value=0,extra={})=>events.push({kind,actorId,actorName:u.name??definition?.name,targetId:heroId(target),targetKind:enemies.includes(target)?(opposite==='enemy'?'enemy':'player'):(side==='enemy'?'enemy':'player'),value,label:skill.name,...extra});
 emit('heroAction',u,0,{followup:Boolean(options.followup),skillId:skill.id});
 const heal=(target,rate)=>{const max=stats(target).hp??target.maxHp,before=heroHp(target),request=Math.floor(1e-9+max*rate*Math.max(.1,1-heroEffect(b,target,side,'healDown'))*(1+Math.max(0,stats(u)._affixes?.healPower??0)/100));setHeroHp(target,Math.min(max,before+request));const shield=heroOverheal(b,side,target,request-(heroHp(target)-before),max);emit('heal',target,heroHp(target)-before);if(shield)emit('shield',target,shield)};
 if(skill.type==='revive'){
  const eligible=allies.filter(x=>heroHp(x)<=0&&!heroEffects(b,x,side).some(e=>e.kind==='reviveSeal'&&(e.turns??1)>0)),target=eligible.find(x=>heroId(x)===options.targetId)??eligible[0];if(target){setHeroHp(target,Math.max(1,Math.floor((stats(target).hp??target.maxHp)*skill.revive)));setHeroMp(target,Math.floor(target.maxMp*(skill.reviveMp??0)));emit('revive',target,heroHp(target));}
 }else if(skill.type==='allHeal')for(const target of alive()){heal(target,skill.heal??0);if(skill.cleanse){const list=heroEffects(b,target,side);list.splice(0,list.length,...list.filter(e=>HERO_POSITIVE.has(e.kind)));env.cleanse?.(target,side)}}
 if(skill.partyShieldRate)for(const target of alive()){const amount=Math.floor((stats(target).hp??target.maxHp)*skill.partyShieldRate);target.heroShield348=Math.max(target.heroShield348??0,amount);emit('shield',target,amount)}
 let killed=false,affectedTargets=[];const signature=u.heroSignature348??u.signatureResonance;const buffs=heroEffects(b,u,side),guaranteed=Boolean(skill.guaranteedCritical)||buffs.some(e=>e.kind==='guaranteedCritical'&&(e.turns??1)>0);
 const hit=(target,power,finisher=false)=>{
  const a=stats(u),d=stats(target),magic=skill.damageClass==='magic',af=Math.max(.2,1+heroEffect(b,u,side,'atkUp')-heroEffect(b,u,side,'atkDown')),df=Math.max(.2,1+heroEffect(b,target,opposite,'defUp')-heroEffect(b,target,opposite,'defDown'));
  const dodge=Math.max(0,Math.min(.6,((d.evasion??0)/100)+heroEffect(b,u,side,'accuracyDown')-heroEffect(b,target,opposite,'evasionDown')));
  if(!guaranteed&&!skill.guaranteedHit&&random()<dodge){emit('miss',target);return}
  const chain=signature?.id==='yori-chain'?(u.heroChain348?.targetId===heroId(target)?Math.min(signature.maxStacks??4,(u.heroChain348.stacks??0)+1):1):0;if(chain)u.heroChain348={targetId:heroId(target),stacks:chain};
  const critical=guaranteed||random()<Math.min(.95,(a.crit??10)/100+(signature?.critBonus??0)+chain*(signature?.critPerStack??0)),ignore=Math.min(.9,skill.defenseIgnore??0),bonus=skill.bonusVsEffect&&heroEffect(b,target,opposite,skill.bonusVsEffect.kind)>0?skill.bonusVsEffect.multiplier:1;
  const weakness=skill.bonusPerDebuff?1+Math.min(skill.debuffBonusCap??1,heroEffects(b,target,opposite).filter(e=>!HERO_POSITIVE.has(e.kind)&&(e.turns??1)>0).length*skill.bonusPerDebuff):1;
  const raw=Math.max(1,(magic?(a.matk??a.atk):a.atk)*af*power-(magic?(d.mdef??d.def):d.def)*df*(1-ignore)*.3);
  const element=skill.element??definition?.element??u.element??'neutral',targetElement=target.element??target.attribute??MYTHIC_SERIAL_SPECIES[target.speciesId]?.element??'neutral';
  const damage=Math.max(1,Math.floor(raw*bonus*weakness*((signature?.damageMultiplier??1)+chain*(signature?.damagePerStack??0))*(critical?1.65+(a._affixes?.critDamage??0)/100:1)*attributeDamageMultiplier(element,targetElement)*(1+heroEffect(b,target,opposite,'vulnerable'))*(1+(a._affixes?.skillPower??0)/100)));
  const targetSignature=target.heroSignature348??target.signatureResonance,defenderAffixes=d._affixes??target.equipmentCombatEffects??{};
  const protector=heroSideUnits(b,opposite).find(x=>x!==target&&heroHp(x)>0&&(x.heroSignature348??x.signatureResonance)?.id==='hide-guardian'&&heroHp(target)/Math.max(1,d.hp??target.maxHp)<=(x.heroSignature348??x.signatureResonance).lowHpThreshold);
  const reduction=Math.min(.75,(Math.max(0,defenderAffixes.damageReduction??0)/100)+(targetSignature?.damageReduction??0));
  const received=Math.max(1,Math.floor(damage*(1-reduction)*(protector?1-((protector.heroSignature348??protector.signatureResonance).damageReduction??0):1)*((target.guard||b.guards?.[heroId(target)])?.45:1)*(1-Math.min(.8,heroEffect(b,target,opposite,'guard')))));
  const before=heroHp(target);let dealt;
  if(env.damage)dealt=env.damage(target,opposite,received,{source:u,element,damageClass:magic?'magic':'physical',critical,skill});
  else{const amount=mitigateHeroDamage(b,opposite,target,received),absorbed=Math.min(target.shield??0,amount);target.shield=Math.max(0,(target.shield??0)-absorbed);setHeroHp(target,Math.max(0,before-amount+absorbed));tryHeroLastStand(b,opposite,target,before);dealt=Math.max(0,before-heroHp(target))}
  emit('damage',target,dealt,{critical,finisher});if(protector&&heroHp(u)>0){const sig=protector.heroSignature348??protector.signatureResonance,amount=Math.max(1,Math.floor((stats(protector).atk-a.def*.25)*(sig.counterPower??0))),old=heroHp(u);if(env.damage)env.damage(u,side,amount,{source:protector,element:protector.element,damageClass:'physical'});else{setHeroHp(u,Math.max(0,old-mitigateHeroDamage(b,side,u,amount)));tryHeroLastStand(b,side,u,old)}events.push({kind:'damage',actorId:heroId(protector),targetId:heroId(u),targetKind:side==='ally'?'player':'enemy',value:Math.max(0,old-heroHp(u)),label:'守護反撃'});}if(before>0&&heroHp(target)<=0){killed=true;emit('ko',target)}
 };
 if(!['buff','allHeal','revive'].includes(skill.type)){
  const ordered=foes().sort((a,c)=>{const bonus=skill.bonusVsEffect?.kind;return (bonus?Number(heroEffect(b,c,opposite,bonus)>0)-Number(heroEffect(b,a,opposite,bonus)>0):0)||heroHp(a)-heroHp(c)}),chosen=options.targetId?ordered.find(x=>heroId(x)===options.targetId):null;
  const targets=affectedTargets=skill.allEnemies?ordered:[chosen??ordered[0]].filter(Boolean);
  for(const target of targets)for(let i=0;i<(skill.hits??1)&&heroHp(target)>0&&heroHp(u)>0;i++){hit(target,skill.power??1);drainHeroReactions(b,env)}
  if(guaranteed)for(let i=buffs.length-1;i>=0;i--)if(buffs[i].kind==='guaranteedCritical')buffs.splice(i,1);
  if(killed&&heroHp(u)>0&&u.speciesId==='myth_yori'&&foes().length)hit(foes().sort((a,c)=>heroHp(a)-heroHp(c))[0],1.5*(options.followup?.7:1),true);
 }
 for(const effect of skill.effects??[]){const targetSide=effect.enemy?opposite:side,targets=effect.enemy?affectedTargets.filter(x=>heroHp(x)>0):effect.allies?alive():[u];for(const target of targets)putEffect(b,target,targetSide,effect,u)}
 if(skill.reducePartyCooldowns&&!state.shortened){state.shortened=true;for(const target of alive()){const cd=heroCooldowns(b,target);for(const id of Object.keys(cd))cd[id]=Math.max(0,cd[id]-1)}emit('heroUtility',u,1,{label:'いこうぜ！ 再使用を1ターン短縮'})}
 if(skill.extendPartyBuffs&&!state.extended){state.extended=true;for(const target of alive())for(const e of heroEffects(b,target,side))if(HERO_POSITIVE.has(e.kind)&&(e.turns??0)>0)e.turns=Math.min(5,e.turns+1);emit('heroUtility',u,1,{label:'強化を1ターン延長'})}
 // Existing signature support/chain powers use the same scaled definition.
 if(signature?.id==='rion-care'&&['revive','allHeal'].includes(skill.type))for(const target of alive()){target.heroShield348=Math.max(target.heroShield348??0,Math.floor((stats(target).hp??target.maxHp)*(signature.shieldRate??0)*(options.followup?.7:1)));setHeroMp(target,Math.min(target.maxMp,heroMp(target)+Math.floor(target.maxMp*(signature.mpRate??0)*(options.followup?.7:1))))}
 env.onSkill?.(u,original,options);drainHeroReactions(b,env);
 if(!options.followup&&foes().length){triggerHeroAlliance(b,side,u,env);if(original&&heroHp(u)>0&&(signature?.extraActionChance??0)>0&&!state.signatureExtra.includes(actorId)&&random()<signature.extraActionChance){state.signatureExtra.push(actorId);runHeroAllianceAction(b,side,u,chooseHeroAllianceSkill(b,side,u,{free:true}),env,{followup:true})}}
 return true;
}
export function triggerHeroAlliance(b,side,source,env={},memberIds=null){
 if(!isHeroResonanceSpecies(source?.speciesId))return;const units=heroSideUnits(b,side),profile=heroResonanceProfile(units);if(profile.count<2)return;
 const ordered=heroResonanceMembers(units).filter(x=>heroId(x)!==heroId(source)&&(!memberIds||memberIds.includes(heroId(x)))).sort((a,c)=>HERO_ORDER.indexOf(a.speciesId)-HERO_ORDER.indexOf(c.speciesId));
 for(const member of ordered){if(!heroSideUnits(b,side==='ally'?'enemy':'ally').some(x=>heroHp(x)>0))break;if(heroHp(member)<=0)continue;const skill=chooseHeroAllianceSkill(b,side,member,{free:true});runHeroAllianceAction(b,side,member,skill,env,{followup:true})}
}
export function drainHeroReactions(b,env={}){
 if(b._heroReaction348)return;b._heroReaction348=true;
 try{for(const side of ['ally','enemy']){const state=heroAllianceState(b,side);while(state.pending.length){const reaction=state.pending.shift(),source=heroSideUnits(b,side).find(x=>heroId(x)===reaction.sourceId);if(source){env.events?.push({kind:'heroLastStand',actorId:heroId(source),targetId:heroId(source),targetKind:side==='enemy'?'enemy':'player',value:1,label:'まだ終わってへんやろ'});triggerHeroAlliance(b,side,source,env,reaction.members)}}}}finally{b._heroReaction348=false}
}
