import{SPECIES}from"../data/species.js";
import{SKILLS}from"../data/skills.js";

export function maxMp(monster){
 const base={slime:16,goblin:13,fairy:24,dragon:18,mushroom:17}[monster.speciesId]??15;
 return Math.floor(base+(monster.level-1)*.7+(monster.rank-1)*5+(monster.stars-1));
}
export function learnedSkills(monster){
 return SPECIES[monster.speciesId].skills
  .filter(entry=>entry.unlock.type==="level"?monster.level>=entry.unlock.value:monster.rank>=entry.unlock.value)
  .map(entry=>({...entry,...SKILLS[entry.id]}))
  .filter(skill=>skill.id&&skill.type);
}
export function skillById(id){return SKILLS[id]??null}
export function canUseSkill(monster,skill,cooldown=0){return Boolean(skill)&&monster.currentMp>=skill.mp&&cooldown<=0}
export function skillDamage(stats,enemy,skill,critical=false){
 const base=Math.max(1,Math.floor(stats.atk*skill.power-enemy.def*.3));
 return critical?Math.floor(base*1.65):base;
}
