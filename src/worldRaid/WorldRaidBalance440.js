import {RAID_CIRCLES432,sharedCircle432} from './WorldRaidRules432.js';

export const WORLD_RAID_HP440=50_000_000;
// Preserve damage already dealt, including consumed shields and the one-time
// resurrection. Completed histories and issued offline tickets are immutable.
export function resizeCampaign440(c){
 if(c.balance440===1&&c.maxHp===WORLD_RAID_HP440)return false;
 const oldMax=c.maxHp,oldCircle=sharedCircle432(c),def=RAID_CIRCLES432[c.bossId];
 let lostHp=Math.max(0,oldMax+(oldCircle.reviveUsed?Math.floor(oldMax*(def.reviveHpRate??0)):0)-c.hp);
 const lostShield=Math.max(0,oldCircle.maxShield-oldCircle.shield);
 c.maxHp=WORLD_RAID_HP440;
 const maxShield=def.effect==='shield'?Math.floor(c.maxHp*def.shieldRate):0;
 lostHp+=Math.max(0,lostShield-maxShield);
 const reviveUsed=Boolean(oldCircle.reviveUsed||def.effect==='revive'&&lostHp>=c.maxHp);
 c.hp=Math.max(0,c.maxHp+(reviveUsed?Math.floor(c.maxHp*(def.reviveHpRate??0)):0)-lostHp);
 c.circle432={...oldCircle,reviveUsed,maxShield,shield:Math.max(0,maxShield-lostShield)};
 c.balance440=1;
 return true;
}
