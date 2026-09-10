import {magicCircleById,magicCircleLevelEffect,MAGIC_CIRCLES} from '../../src/core/MagicCircleSystem.js';
import {conditionalCircleMultiplier398} from '../../src/data/magicCircles398.js';
import {canonicalAttribute} from '../../src/data/attributes.js';
export function onlineCircleValues398(actor){
 const byId=magicCircleById(actor?.circleId),entry=byId.effect===actor?.circleEffect?byId:MAGIC_CIRCLES.find(c=>c.effect===actor?.circleEffect);
 return magicCircleLevelEffect(entry??'none',actor?.circleLevel??1);
}
export function onlineConditionalCircle398(battle,actor,enemy){
 if(!actor||actor.hp<=0||actor.side||actor.circleEffect!==magicCircleById(actor.circleId).effect)return 1;
 return conditionalCircleMultiplier398(actor.circleId,actor.circleLevel,{elements:Object.values(battle.players??{}).filter(u=>u.hp>0).map(u=>canonicalAttribute(u.element??u.attribute,u.speciesId)),statuses:enemy?.effects??[],mp:actor.mp,maxMp:actor.maxMp});
}
export function onlineMirrorShield398(players){for(const p of Object.values(players??{}))if(p.hp>0&&p.circleEffect==='deathMirror')p.shield=Math.max(p.shield??0,Math.floor(p.maxHp*onlineCircleValues398(p).openingShieldRate));}
export function onlineSacrificeShield398(battle,owner){const rate=onlineCircleValues398(owner).survivorShieldRate??0;for(const p of Object.values(battle.players??{}))if(p.hp>0)p.shield=Math.max(p.shield??0,Math.floor(p.maxHp*rate));}
export function onlineDeathDrain398(battle,owner,events=[],recover=null){
 if(!owner||owner.hp>0||owner.circleEffect!=='deathDrain'||owner.circleDrainUsed398)return;owner.circleDrainUsed398=true;
 const v=onlineCircleValues398(owner),enemies=battle.enemies??[battle.boss,...(battle.minions??[])].filter(Boolean);
 for(const e of enemies.filter(e=>e.hp>0))e.currentMp=Math.max(0,(e.currentMp??0)-Math.floor((e.maxMp??0)*v.enemyMpDrainRate));
 for(const ally of Object.values(battle.players??{}).filter(p=>p.hp>0)){
  const amount=Math.floor(ally.maxMp*v.allyMpRecoveryRate);if(recover){recover(ally,amount);continue;}
  const before=ally.mp;ally.mp=Math.min(ally.maxMp,before+amount);if(ally.circleEffect==='manaReversal'&&ally.mp>before)ally.hp=Math.max(1,ally.hp-Math.max(1,Math.floor((ally.mp-before)*ally.maxHp/Math.max(1,ally.maxMp)*.08)));
  events.push({kind:'mpHeal',actorId:owner.playerId,targetKind:'player',targetId:ally.playerId,value:ally.mp-before,label:'断末吸魔・魔力継承'});
 }
 events.push({kind:'circleDeathDrain',actorId:owner.playerId,targetKind:'enemy',label:'断末吸魔陣'});
}
