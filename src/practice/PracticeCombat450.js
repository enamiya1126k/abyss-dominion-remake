import {circleOffense443} from '../battle/MagicCircleBalance443.js';
import {conditionalCircleMultiplier398} from '../data/magicCircles398.js';
import {ultimateCircle,ultimateIsolated} from '../core/EndgameUltimateSystem.js';

const living=b=>(b.enemies??[]).filter(u=>u.hp>0&&!ultimateIsolated(b,u));
const circle=(b,u)=>ultimateCircle(b,u,u.enemyMagicCircle);
export function prepareDuelCircles450(b){
 if(b.specialBattleType!=='practice450')return;
 const allies=living(b),shield=Math.max(0,...allies.map(u=>u.enemyMagicCircle?.effect==='shield'?Number(u.enemyMagicCircle.levelEffect?.shieldRate)||.5:0));
 for(const u of allies){const c=u.enemyMagicCircle,e=c?.levelEffect??{},personal=c?.effect==='deathMirror'?e.openingShieldRate??.25:0;
  u._floorBossHpShield=Math.max(u._floorBossHpShield??0,Math.floor(u.maxHp*Math.max(shield,personal)),u.heroSignature348?.awakened?Math.floor(u.maxHp*.25):0);
 }
}
export function duelOffense450(b,u,target,{kind='direct'}={}){
 if(!u?.duel450||kind==='excluded'||ultimateIsolated(b,u))return 1;
 const c=circle(b,u),allies=living(b),opening=Math.max(0,...allies.map(a=>circle(b,a)?.effect==='openingBuff'?Number(circle(b,a).levelEffect?.damageRate)||0:0));
 let rate=(1+opening)*circleOffense443(c,{hits:u._circleRage??0,hpRatio:u.hp/Math.max(1,u.maxHp),aliveCount:allies.length});
 if(c?.effect==='goldPower')rate*=u.duel450.goldRate??1;
 return rate*conditionalCircleMultiplier398(c?.id,c?.level,{elements:allies.map(a=>a.element),statuses:b.allyAilments?.[target?.id]??[],mp:u.currentMp,maxMp:u.maxMp});
}
export function duelIncoming450(b,u,amount,{source=null}={}){
 if(!u?.duel450)return amount;
 const c=circle(b,u),e=c?.levelEffect??{};let rate=Math.max(0,1+(Number(u.duel450.abyss?.partyDamageTakenRate)||0));
 if(c?.effect==='soleSurvivor'&&living(b).length===1)rate*=1-(e.damageReductionRate??.4);
 if(c?.effect==='endgameNoCrit'&&source?.endgameBossId)rate*=1-(e.damageReductionRate??0);
 return Math.max(0,Math.floor(amount*rate));
}
export function duelAfterHit450(b,u,before){
 if(!u?.duel450||before<=0||u.hp>=before)return;
 const c=circle(b,u),e=c?.levelEffect??{};
 if(c?.effect==='rage')u._circleRage=(u._circleRage??0)+1;
 if(u.hp>0)return;
 if(c?.effect==='lastLife'&&!u._circleLastLifeUsed){u._circleLastLifeUsed=true;u.hp=Math.max(1,Math.floor(u.maxHp*(e.surviveHpRate??0)));}
 else if(c?.effect==='revive'&&!u._circleReviveUsed&&(b.reviveCount??0)<99&&!(b.enemyEffects?.[u.id]??[]).some(x=>x.kind==='reviveSeal'&&x.turns>0)){
  u._circleReviveUsed=true;b.reviveCount=(b.reviveCount??0)+1;u.hp=Math.max(1,Math.floor(u.maxHp*(e.reviveHpRate??.4)));u.currentMp=Math.max(u.currentMp,Math.floor(u.maxMp*(e.reviveMpRate??.25)));
  return true;
 }
}
