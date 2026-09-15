import {magicCircleById,magicCircleLevelEffect,slotDamageMultiplier} from '../../src/core/MagicCircleSystem.js';
import {circleOffense443,circleExtraHits443} from '../../src/battle/MagicCircleBalance443.js';
import {onlineCircleValues398} from './OnlineMagicCircles398.js';
export function onlineProfile443(actor){const e=onlineCircleValues398(actor);return {...magicCircleById(e.id),level:e.level};}
export function onlineOffense443(actor,aliveCount=2){return circleOffense443(onlineProfile443(actor),{hits:actor.circleRageHits??0,hpRatio:actor.hp/Math.max(1,actor.maxHp),aliveCount,gold:actor.goldPowerGold??0});}
export function onlineExtraHits443(actor){return circleExtraHits443(onlineProfile443(actor),actor.circleRageHits??0);}
export function onlineOpeningRate443(players,key='damageRate'){return Math.max(0,...Object.values(players??{}).filter(p=>p.hp>0&&p.circleEffect==='openingBuff').map(p=>onlineCircleValues398(p)[key]??0));}
export function onlineOpeningShield443(players){
 const rate=Math.max(0,...Object.values(players??{}).filter(p=>p.hp>0&&p.circleEffect==='shield').map(p=>onlineCircleValues398(p).shieldRate??0));
 if(rate)for(const p of Object.values(players??{}).filter(p=>p.hp>0)){const value=Math.ceil(p.maxHp*rate);p.circleShieldAmount=value;p.shield=Math.max(p.shield??0,value);}
}
export function onlineRevive443(actor){
 if(!actor||actor.hp>0||actor.circleEffect!=='revive'||actor.circleReviveUsed||(actor.effects??[]).some(e=>e.kind==='reviveSeal'&&e.turns>0))return false;
 const e=onlineCircleValues398(actor);actor.circleReviveUsed=true;actor.hp=Math.max(1,Math.ceil(actor.maxHp*e.reviveHpRate));actor.mp=Math.min(actor.maxMp,Math.ceil(actor.maxMp*e.reviveMpRate));return true;
}
export {slotDamageMultiplier};
