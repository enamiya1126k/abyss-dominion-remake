import {MYTHIC_SERIAL_SPECIES} from '../data/mythicSerialSpecies.js?v=3.1.37-build357';

const PREFIX='campaignHero:';
const skills=Object.values(MYTHIC_SERIAL_SPECIES).flatMap(species=>species.authoredSkills.map(skill=>({...skill,element:species.element})));
const byAction=new Map(skills.map(skill=>[PREFIX+skill.id,skill]));
export function campaignHeroSkillInfo(action){
 const skill=byAction.get(action);if(!skill)return null;
 return {...skill,label:skill.name,multiplier:skill.power??0,utility:['buff','allHeal','revive'].includes(skill.type),pattern:skill.allEnemies?'all':skill.target==='自分'||skill.target==='味方全体'||skill.type==='revive'?'self':'singleWeak'};
}
export function campaignHeroSkillCost(enemy,action){
 const skill=byAction.get(action);return skill?Math.max(Math.ceil(Number(skill.mp)||0),Math.ceil((Number(enemy.maxMp)||0)*(Number(skill.mpRate)||0))):null;
}
export function commitCampaignHeroSkill(enemy,action,turn){
 const skill=byAction.get(action);if(!skill)return;
 enemy.campaignHeroSkillReadyTurns??={};
 // Same-round extra actions cannot bypass the normal skill cooldown.
 if(skill.cooldown)enemy.campaignHeroSkillReadyTurns[skill.id]=Math.max(1,Number(turn)||1)+skill.cooldown+1;
}
export function chooseCampaignHeroSkill(enemy,context={}){
 const species=MYTHIC_SERIAL_SPECIES[enemy.campaignHeroId];if(!species)return null;
 const turn=Math.max(1,Number(context.battle?.turn)||1),battle=context.battle??{},allies=context.allies??[enemy],living=allies.filter(unit=>unit.hp>0),opponents=(context.opponents??[]).filter(unit=>unit.currentHp>0);
 const effect=(side,id,kind)=>(battle[side]?.[id]??[]).some(entry=>entry.kind===kind&&(entry.turns??1)>0);
 const fallen=allies.some(unit=>unit.hp<=0&&!effect('enemyEffects',unit.id,'reviveSeal'));
 const scored=species.authoredSkills.filter(skill=>(skill.unlock?.value??1)<=(enemy.level??1)&&(enemy.campaignHeroSkillReadyTurns?.[skill.id]??0)<=turn&&campaignHeroSkillCost(enemy,PREFIX+skill.id)<=(enemy.currentMp??0)).map(skill=>{
  let score=0;
  if(skill.type==='revive')score=fallen?1000:-1;
  else if(skill.type==='allHeal'){
   const missing=Math.max(0,...living.map(unit=>1-unit.hp/Math.max(1,unit.maxHp)));
   const dirty=skill.cleanse&&living.some(unit=>(battle.enemyStatuses?.[unit.id]??[]).length||(battle.enemyEffects?.[unit.id]??[]).some(entry=>entry.kind.endsWith('Down')||entry.kind==='vulnerable'));
   score=missing>=.2?100+missing*100:dirty?90:-1;
  }else if(skill.type==='buff'){
   const targets=skill.target==='味方全体'?living:[enemy];
   score=targets.some(unit=>(skill.effects??[]).some(entry=>!effect('enemyEffects',unit.id,entry.kind)))?75:-1;
  }else{
   const setup=(skill.effects??[]).filter(entry=>entry.enemy&&['defDown','vulnerable','spdDown'].includes(entry.kind));
   const needed=opponents.some(unit=>setup.some(entry=>!effect('allyEffects',unit.id,entry.kind)));
   const bonus=opponents.some(unit=>effect('allyEffects',unit.id,skill.bonusVsEffect?.kind));
   score=(skill.power??1)*(skill.hits??1)*(skill.allEnemies?Math.max(1,opponents.length):1)*(bonus?(skill.bonusVsEffect.multiplier??1):1)+(needed?85:0)+(bonus?50:0);
  }
  return {skill,score};
 }).filter(entry=>entry.score>=0).sort((a,b)=>b.score-a.score);
 const chosen=scored[0]?.skill;
 if(!chosen)return null;
 enemy.intent=chosen.name;return PREFIX+chosen.id;
}
