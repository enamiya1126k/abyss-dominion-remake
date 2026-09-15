import {WORLD_RAID_HP440} from '../../src/worldRaid/WorldRaidBalance440.js';
import {WEEKLY_RAID_BOSSES} from './WeeklyRaidCatalog.js';
export const WORLD_RAID_RULES428=Object.freeze({dailyLimit:3,quietRounds:5,maxRounds:10,timezone:'Asia/Tokyo'});
const DAY=86400000;
export function worldRaidDay428(now){return new Date(now+9*3600000).toISOString().slice(0,10);}
export function worldRaidReset428(now){return (Math.floor((now+9*3600000)/DAY)+1)*DAY-9*3600000;}
export function worldRaidBoss428(sequence=1){
 const index=(sequence-1)%WEEKLY_RAID_BOSSES.length,base=WEEKLY_RAID_BOSSES[index];
 return {...structuredClone(base),level:5000,maxHp:WORLD_RAID_HP440,subBoss:{...base.subBoss,level:100,maxHp:12500,respawnDelayRounds:null,maxRespawnsPerAttempt:0,rewardableKillsPerCampaign:0}};
}
export function newWorldRaidCampaign428(sequence,now){const boss=worldRaidBoss428(sequence);return {id:`world-${sequence}-${boss.id}`,sequence,bossId:boss.id,balance440:1,maxHp:boss.maxHp,hp:boss.maxHp,startedAt:now,contribution:{}};}
