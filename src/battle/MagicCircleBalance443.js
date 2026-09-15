import {magicCircleLevelEffect,goldPowerDamageMultiplier} from '../core/MagicCircleSystem.js';
// Shared player-side arithmetic; does not draw randomness or alter battle state.
export function circleOffense443(profile,{hits=0,hpRatio=1,aliveCount=2,gold=0,randomSkill=false}={}){
 if(!profile||profile.id==='none')return 1;
 const e=magicCircleLevelEffect(profile,profile.level??1),effect=e.effect;
 let value=1+(e.baseDamageRate??0);
 if(effect==='rage')return value+Math.min(e.maxDamageBonus,Math.max(0,Number(hits)||0)*e.damagePerHit);
 if(effect==='manaReversal')value*=e.damageMultiplier;
 if(effect==='weakCrit')value*=1+e.damageRate;
 if(effect==='lowHpPower')value*=1+Math.max(0,Math.min(1,1-hpRatio))*e.maximumDamageBonus;
 if(effect==='soleSurvivor'&&aliveCount===1)value*=e.damageMultiplier;
 if(effect==='goldPower')value*=goldPowerDamageMultiplier(gold,profile.level??1);
 if(effect==='randomSkill'&&randomSkill)value*=1+e.randomSkillDamageRate;
 return value;
}
export function circleExtraHits443(profile,hits=0){
 if(profile?.effect!=='rage')return 0;
 const e=magicCircleLevelEffect(profile,profile.level??1);return hits>=e.secondChainHits?2:hits>=e.firstChainHits?1:0;
}
