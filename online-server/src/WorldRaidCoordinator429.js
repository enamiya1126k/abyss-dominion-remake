import {randomBytes} from 'node:crypto';
import {WorldRaidCoordinator428} from './WorldRaidCoordinator428.js';
import {worldRaidBoss428} from './WorldRaidStore428.js';
import {worldRaidRanking429,worldRaidRewardBreakdown429,totalWorldRaidReward429,worldRaidRewardId429,WORLD_RAID_REWARD_FIELDS429} from '../../src/worldRaid/WorldRaidRewards429.js';

function validateRewardLedger429(s){
 if(s.ledgerId429==null){if(s.rewards429||s.history.some(c=>c.settlement429))throw new Error('Missing reward ledger identity');return;}
 if(!/^[a-f0-9]{16}$/.test(s.ledgerId429)||!s.rewards429||Array.isArray(s.rewards429))throw new Error('Invalid reward ledger');
 const histories=new Map(s.history.map(c=>[c.id,c])),counts=new Map();
 for(const [id,r]of Object.entries(s.rewards429)){
  const c=histories.get(r.campaignId),v=r.source;
  if(!c||!v||id!==r.rewardId||id!==worldRaidRewardId429(s.ledgerId429,c.sequence,r.playerId)||r.sequence!==c.sequence||v.playerId!==r.playerId||v.ledgerId!==s.ledgerId429||v.campaignId!==c.id||v.sequence!==c.sequence||v.rewardVersion!==1||v.kind!=='worldRaid429'||v.damage!==c.contribution[r.playerId]?.damage||!Number.isSafeInteger(v.rank)||v.rank<1||!(v.damage>0)||v.lastHit!==(c.killerId===r.playerId)||r.acknowledgedAt!=null&&(!Number.isSafeInteger(r.acknowledgedAt)||r.acknowledgedAt<0))throw new Error('Invalid reward receipt');
  const expected=totalWorldRaidReward429(r.breakdown??[]);if(WORLD_RAID_REWARD_FIELDS429.some(k=>!Number.isSafeInteger(r.reward?.[k])||r.reward[k]<0||r.reward[k]!==expected[k]))throw new Error('Invalid reward contents');
  counts.set(c.id,(counts.get(c.id)??0)+1);
 }
 for(const c of s.history)if(c.settlement429&&(c.settlement429.version!==1||c.settlement429.rankedPlayers!==(counts.get(c.id)??0)||c.settlement429.rankedPlayers!==Object.values(c.contribution).filter(r=>r.damage>0).length))throw new Error('Incomplete reward settlement');
}

export class WorldRaidCoordinator429 extends WorldRaidCoordinator428{
 constructor(options={}){
  super(options);this.rankingCache429=new Map();
  try{if(this.healthy())validateRewardLedger429(this.ledger.state);}catch(error){this.ledger.error=error;}
  if(this.healthy()&&(!this.ledger.state.ledgerId429||this.ledger.state.history.some(c=>!c.settlement429))){
   const result=this.ledger.transact(s=>{s.ledgerId429??=randomBytes(8).toString('hex');s.rewards429??={};for(const c of s.history)this._settleRewards429(s,c);return {ok:true};});
   if(!result.ok)this.ledger.error=new Error('Reward migration could not be saved');
  }
 }
 _settleRewards429(s,c){
  if(c.settlement429)return;
  const rows=worldRaidRanking429(c);s.rewards429??={};
  for(const row of rows){
   const rewardId=worldRaidRewardId429(s.ledgerId429,c.sequence,row.playerId),parts=worldRaidRewardBreakdown429(row.rank,row.lastHit);
   s.rewards429[rewardId]??={rewardId,playerId:row.playerId,campaignId:c.id,sequence:c.sequence,createdAt:c.completedAt,acknowledgedAt:null,breakdown:parts,reward:totalWorldRaidReward429(parts),source:{kind:'worldRaid429',rewardVersion:1,ledgerId:s.ledgerId429,playerId:row.playerId,campaignId:c.id,sequence:c.sequence,bossId:c.bossId,bossName:worldRaidBoss428(c.sequence).name,rank:row.rank,damage:row.damage,share:row.share,lastHit:row.lastHit}};
  }
  c.settlement429={version:1,settledAt:this.now(),rankedPlayers:rows.length};
 }
 _settleDamage(s,a,before,battle){
  const sequence=s.current.sequence;super._settleDamage(s,a,before,battle);
  if(s.current.sequence!==sequence)this._settleRewards429(s,s.history.at(-1));
 }
 _rows429(c){
  const cache=this.rankingCache429.get(c.id),revision=c.completedAt?'final':this.ledger.state.revision;
  if(cache?.revision===revision)return cache.rows;
  const rows=worldRaidRanking429(c);this.rankingCache429.set(c.id,{revision,rows});if(this.rankingCache429.size>12)this.rankingCache429.delete(this.rankingCache429.keys().next().value);return rows;
 }
 snapshot(playerId){
  const snapshot=super.snapshot(playerId),rows=this._rows429(this.ledger.state.current),mine=rows.find(r=>r.playerId===playerId);
  return {...snapshot,rewardsAvailable429:true,pendingRewards429:this._pending429(playerId).length,campaign:{...snapshot.campaign,myRank:mine?.rank??null,myShare:mine?.share??0,rankedPlayers:rows.length}};
 }
 _pending429(playerId){return Object.values(this.ledger.state.rewards429??{}).filter(r=>r.playerId===playerId&&r.acknowledgedAt==null).sort((a,b)=>a.sequence-b.sequence);}
 _publicReward429(r){if(!r)return null;return {rewardId:r.rewardId,reward:structuredClone(r.reward),source:structuredClone(r.source),breakdown:structuredClone(r.breakdown),acknowledgedAt:r.acknowledgedAt,createdAt:r.createdAt};}
 deliverRewards429(session){
  if(!this._authenticated(session)||!this.healthy())return {ok:false,code:'WORLD_RAID_REWARDS_UNAVAILABLE',message:'共闘レイド報酬は現在確認中です。'};
  const pending=this._pending429(session.playerId);
  this.send(session.playerId,{type:'worldRaidRewards429',entries:pending.slice(0,20).map(r=>this._publicReward429(r)),hasMore:pending.length>20,pending:pending.length});return {ok:true};
 }
 acknowledgeReward429(session,message){
  if(!this._authenticated(session))return {ok:false,code:'NOT_READY',message:'先に接続してください。'};
  const reward=this.ledger.state.rewards429?.[message.rewardId];
  if(!reward||reward.playerId!==session.playerId)return {ok:false,code:'WORLD_RAID_REWARD_OWNER',message:'この報酬は受け取れません。'};
  const result=this.ledger.transact(s=>{const r=s.rewards429[reward.rewardId];if(r.acknowledgedAt!=null)return {ok:true,unchanged:true,duplicate:true};r.acknowledgedAt=this.now();return {ok:true};});
  if(result.ok)this.send(session.playerId,{type:'worldRaidRewardAck429',rewardId:reward.rewardId,pending:this._pending429(session.playerId).length});return result;
 }
 ranking429(session,message={}){
  if(!this._authenticated(session))return {ok:false,code:'NOT_READY',message:'先に接続してください。'};
  const s=this.ledger.state,sequence=message.sequence??s.current.sequence;
  if(!Number.isSafeInteger(sequence)||sequence<1||sequence>s.current.sequence)return {ok:false,code:'WORLD_RAID_RANKING_MISSING',message:'この討伐記録は見つかりません。'};
  const c=sequence===s.current.sequence?s.current:s.history.find(h=>h.sequence===sequence);if(!c)return {ok:false,code:'WORLD_RAID_RANKING_MISSING',message:'この討伐記録は見つかりません。'};
  const rows=this._rows429(c),pageSize=20,page=Math.min(Math.max(0,Math.floor(Number(message.page)||0)),Math.max(0,Math.ceil(rows.length/pageSize)-1)),mine=rows.find(r=>r.playerId===session.playerId)??null;
  const result={type:'worldRaidRanking429',requestId:message.requestId,revision:s.revision,serverNow:this.now(),campaign:{id:c.id,sequence:c.sequence,bossName:worldRaidBoss428(c.sequence).name,hp:c.hp,maxHp:c.maxHp,completedAt:c.completedAt??null,killerId:c.killerId??null},latestSequence:s.current.sequence,total:rows.length,totalDamage:rows.reduce((n,r)=>n+r.damage,0),page,pageSize,rows:rows.slice(page*pageSize,(page+1)*pageSize),mine,myReward:this._publicReward429(s.rewards429?.[worldRaidRewardId429(s.ledgerId429,c.sequence,session.playerId)])};
  this.send(session.playerId,result);return {ok:true};
 }
 _operate(session,kind,message={}){
  const sequence=this.ledger.state.current.sequence,result=super._operate(session,kind,message);
  if(result.ok&&this.ledger.state.current.sequence!==sequence){const ids=new Set(Object.values(this.ledger.state.rewards429??{}).filter(r=>r.sequence===sequence).map(r=>r.playerId));for(const id of ids){const s=this.sessions.get(id);if(s?.connected)this.deliverRewards429(s);}}
  return result;
 }
 handle(session,message){
  const method={worldRaidRanking429:'ranking429',worldRaidRewardList429:'deliverRewards429',worldRaidRewardAck429:'acknowledgeReward429'}[message.type];
  if(!method)return super.handle(session,message);
  const result=this[method](session,message);if(!result.ok&&this._authenticated(session))this.send(session.playerId,{type:'worldRaidRewardsError429',requestId:message.requestId,rewardId:message.rewardId,...result});return result;
 }
}
