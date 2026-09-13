export const WORLD_RAID_REWARD_VERSION429=1;
export const WORLD_RAID_REWARD_FIELDS429=Object.freeze(['raidMaterials','crystals','gold','experienceItemsUltra']);
const pack=(raidMaterials,crystals,gold,experienceItemsUltra)=>Object.freeze({raidMaterials,crystals,gold,experienceItemsUltra});
export const WORLD_RAID_PARTICIPATION429=pack(20,200,200000,10);
export const WORLD_RAID_LAST_HIT429=pack(50,1000,1000000,30);
export const WORLD_RAID_RANK_REWARDS429=Object.freeze([
 {through:1,label:'1位',reward:pack(180,3000,5000000,100)},
 {through:2,label:'2位',reward:pack(120,2000,3500000,70)},
 {through:3,label:'3位',reward:pack(90,1500,2500000,50)},
 {through:10,label:'4〜10位',reward:pack(60,1000,1500000,30)},
 {through:50,label:'11〜50位',reward:pack(30,500,800000,20)},
 {through:Number.MAX_SAFE_INTEGER,label:'51位以下',reward:pack(10,200,300000,10)}
].map(Object.freeze));
export function worldRaidRanking429(campaign){
 const rows=Object.entries(campaign?.contribution??{}).filter(([,v])=>Number.isSafeInteger(v?.damage)&&v.damage>0).map(([playerId,v])=>({playerId,name:String(v.name||'冒険者').slice(0,40),damage:v.damage,attempts:v.attempts??0,lastHit:campaign.killerId===playerId}));
 rows.sort((a,b)=>b.damage-a.damage||(a.playerId<b.playerId?-1:a.playerId>b.playerId?1:0));
 const totalDamage=rows.reduce((sum,r)=>sum+r.damage,0);let rank=0;
 return rows.map((row,index)=>{if(index===0||row.damage!==rows[index-1].damage)rank=index+1;return {...row,rank,share:totalDamage?row.damage/totalDamage:0};});
}
export function worldRaidRewardBreakdown429(rank,lastHit=false){
 const tier=WORLD_RAID_RANK_REWARDS429.find(t=>rank>0&&rank<=t.through);
 if(!tier)return [];
 return [{kind:'participation',label:'参加報酬',reward:{...WORLD_RAID_PARTICIPATION429}},{kind:'rank',label:`順位報酬（${rank}位）`,reward:{...tier.reward}},...(lastHit?[{kind:'lastHit',label:'最後の一撃ボーナス',reward:{...WORLD_RAID_LAST_HIT429}}]:[])];
}
export function totalWorldRaidReward429(parts){return Object.fromEntries(WORLD_RAID_REWARD_FIELDS429.map(key=>[key,parts.reduce((sum,p)=>sum+(p.reward[key]??0),0)]));}
export function worldRaidRewardId429(ledgerId,sequence,playerId){return `wr429:${ledgerId}:${sequence}:${playerId}`;}

// Currency, consumable and the durable receipt are saved in one native save.
// Receipts are separate from the legacy 2048-entry online reward ring.
export function claimWorldRaidReward429(save,entry,selfId,{now=Date.now}={}){
 const source=entry?.source,reward=entry?.reward,id=entry?.rewardId;
 if(!source||source.kind!=='worldRaid429'||source.playerId!==selfId||source.rewardVersion!==1||!Number.isSafeInteger(source.sequence)||source.sequence<1||!/^[a-f0-9]{16}$/.test(source.ledgerId??'')||id!==worldRaidRewardId429(source.ledgerId,source.sequence,selfId))return {ok:false,message:'共闘レイド報酬の宛先を確認できません。'};
 if(!reward||WORLD_RAID_REWARD_FIELDS429.some(k=>!Number.isSafeInteger(reward[k])||reward[k]<0||reward[k]>10000000)||Object.keys(reward).some(k=>!WORLD_RAID_REWARD_FIELDS429.includes(k)))return {ok:false,message:'共闘レイド報酬の内容を確認できません。'};
 if(save.state.onlineParty?.worldRaidReceipts429?.[id])return {ok:true,duplicate:true,rewardId:id};
 const backup=structuredClone(save.state);
 try{
  const state=save.state;state.player??={};state.inventory??={};state.onlineParty??={};state.onlineParty.worldRaidReceipts429??={};
  const add=(target,key,amount)=>{const current=Math.max(0,Math.floor(Number(target[key])||0)),next=current+amount;if(!Number.isSafeInteger(next))throw new Error('所持数の上限を超えるため受け取れません。');target[key]=next;};
  add(state.player,'gold',reward.gold);add(state.player,'crystals',reward.crystals);add(state.onlineParty,'raidMaterials',reward.raidMaterials);add(state.inventory,'experienceItemsUltra',reward.experienceItemsUltra);add(state.onlineParty,'totalGold',reward.gold);
  state.onlineParty.worldRaidReceipts429[id]={receivedAt:now(),sequence:source.sequence,rank:source.rank};
  if(!save.save())throw new Error('報酬を保存できませんでした。保存領域を確認して再試行してください。');
  return {ok:true,duplicate:false,rewardId:id,reward:{...reward},rank:source.rank,lastHit:source.lastHit};
 }catch(error){save.state=backup;return {ok:false,message:error.message||'報酬を保存できませんでした。'};}
}
