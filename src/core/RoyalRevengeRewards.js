import { revengeExperience } from './Postgame361System.js';
import { applyTotalExperience, totalExperience, displayName } from '../models/Monster.js?v=3.1.46-build366';

export function royalRevengeRewards(stage=1){
 const n=Math.max(1,Math.floor(Number(stage)||1));
 return {experience:revengeExperience(n),gold:Math.min(1e12,Math.round(250000*Math.pow(1.15,n-1))),crystals:Math.min(5000,100+25*(n-1))};
}
function grantCurrency(player,key,amount){
 const before=Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(player[key])||0)));
 const granted=Math.min(amount,Number.MAX_SAFE_INTEGER-before);player[key]=before+granted;return granted;
}
// Called inside the same save transaction as the settled attempt, after supplies are restored.
export function grantRoyalRevengeRewards(state,result,resultId){
 const room=state.campaign100?.royal360;
 if(!room||!resultId||room.lastResultId!==resultId||!result?.memory||!result.won||result.duplicate||result.missing)return null;
 if(room.rewardReceipt365?.resultId===resultId)return room.rewardReceipt365;
 const reward=royalRevengeRewards(result.stage),members=[];
 for(const id of [...new Set(result.partyIds??[])].slice(0,4)){
  const m=state.monsters.find(unit=>unit.id===id);if(!m)continue;
  const beforeLevel=m.level,beforeExp=totalExperience(m);
  applyTotalExperience(m,Math.min(Number.MAX_SAFE_INTEGER,beforeExp+reward.experience));
  members.push({id,name:displayName(m),beforeLevel,afterLevel:m.level,experience:Math.max(0,totalExperience(m)-beforeExp)});
 }
 const receipt={resultId,stage:result.stage,experience:reward.experience,members,gold:grantCurrency(state.player,'gold',reward.gold),crystals:grantCurrency(state.player,'crystals',reward.crystals),titleAwarded:Boolean(result.awarded)};
 room.rewardReceipt365=receipt;return receipt;
}
