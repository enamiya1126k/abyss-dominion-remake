import {raidPortrait439} from '../../src/worldRaid/WorldRaidPortrait439.js';
import {randomBytes} from 'node:crypto';
import {sanitizeProfile} from './RoomStore.js';
import {WorldRaidCoordinator429} from './WorldRaidCoordinator429.js';
import {worldRaidDay428,worldRaidBoss428,newWorldRaidCampaign428} from './WorldRaidStore428.js';
import {worldRaidRanking429} from '../../src/worldRaid/WorldRaidRewards429.js';
import {createOfflineTicketBattle430,replayOffline430,OFFLINE_LIFETIME430,OFFLINE_RULE_VERSION430} from '../../src/worldRaid/WorldRaidReplay430.js';
const failure=(code,message)=>({ok:false,code,message}),clone=structuredClone;
const requestPattern=/^[A-Za-z0-9_-]{16,96}$/;
export class WorldRaidCoordinator430 extends WorldRaidCoordinator429{
 constructor(options={}){
  super(options);
  try{if(this.healthy()){
   const s=this.ledger.state,counts={};if(s.offline430&&(!s.offline430.tickets||Array.isArray(s.offline430.tickets)||Array.isArray(s.offline430)))throw new Error('Invalid offline ledger');
   for(const [id,t]of Object.entries(s.offline430?.tickets??{})){
    if(t.id!==id||t.ledgerId!==s.ledgerId429||!['reserved','submitted','expired'].includes(t.status)||!Number.isSafeInteger(t.expiresAt)||t.expiresAt-t.issuedAt!==OFFLINE_LIFETIME430||!Number.isInteger(t.seed)||t.seed<0||t.seed>4294967295||!t.playerId||!t.day||!Number.isSafeInteger(t.sequence)||t.sequence<1||![1,2,3].includes(t.ruleVersion)||t.status==='reserved'&&!t.initialRoom?.raid||t.status!=='reserved'&&!t.receipt)throw new Error('Invalid offline ticket');
    const key=t.day+':'+t.playerId;counts[key]=(counts[key]??0)+1;if(counts[key]>(s.days[t.day]?.[t.playerId]??0))throw new Error('Invalid reserved quota');
   }
  }}catch(error){this.ledger.error=error;}
 }
 _tickets430(s=this.ledger.state){return Object.values(s.offline430?.tickets??{});}
 _waiting430(s,c){return this._tickets430(s).filter(t=>t.campaignId===c.id&&t.status==='reserved'&&t.expiresAt>this.now());}
 _settleRewards429(s,c){
  if(c.settlement429)return;
  const waiting=this._waiting430(s,c);
  if(waiting.length){c.closing430={deadlineAt:Math.max(...waiting.map(t=>t.expiresAt))};return;}
  delete c.closing430;super._settleRewards429(s,c);
 }
 _rows429(c){return c.completedAt&&!c.settlement429?worldRaidRanking429(c):super._rows429(c);}
 snapshot(playerId){const state=super.snapshot(playerId);return {...state,offlineAvailable430:true,offline430:{reserved:this._tickets430().filter(t=>t.playerId===playerId&&t.status==='reserved'&&t.expiresAt>this.now()).map(t=>({id:t.id,campaignId:t.campaignId,sequence:t.sequence,expiresAt:t.expiresAt,day:t.day})),closing:this.ledger.state.history.filter(c=>c.closing430).map(c=>({sequence:c.sequence,deadlineAt:c.closing430.deadlineAt}))}};}
 _publicTicket430(t){return clone(t);}
 ticketList430(session){
  if(!this._authenticated(session)||!this.healthy())return failure('NOT_READY','挑戦権を確認できません。');
  this._expire430();
  // Terminal receipts are small and retained for lost replies and other devices.
  this.send(session.playerId,{type:'worldRaidTickets430',ledgerId:this.ledger.state.ledgerId429,tickets:this._tickets430().filter(t=>t.playerId===session.playerId).map(t=>this._publicTicket430(t)),state:this.snapshot(session.playerId)});return {ok:true};
 }
 reserve430(session,message={}){
  if(!this._authenticated(session))return failure('NOT_READY','先に接続してください。');
  if(!requestPattern.test(message.requestId??''))return failure('BAD_REQUEST','挑戦権の受付を確認できません。');
  const existing=this._tickets430().filter(t=>t.playerId===session.playerId&&t.requestId===message.requestId);
  if(existing.length){this.ticketList430(session);return {ok:true,duplicate:true};}
  if(this.active(session.playerId)||session.roomId||this.isBusy(session))return failure('WORLD_RAID_BUSY','進行中のオンライン戦闘を終了してください。');
  const count=message.count;if(!Number.isInteger(count)||count<1||count>3)return failure('BAD_COUNT','挑戦権は1〜3回分を選んでください。');
  const profile=sanitizeProfile(message.profile??session.profile);if(!profile.battleRoster?.length)return failure('WORLD_RAID_PARTY','先に部隊を編成してください。');
  const result=this.ledger.transact(s=>{
   const now=this.now(),day=worldRaidDay428(now),used=s.days[day]?.[session.playerId]??0;
   if(used+count>3)return failure('WORLD_RAID_LIMIT','オンラインと取得済み挑戦権を合わせて1日3回までです。');
   if(message.campaignId!==s.current.id)return failure('WORLD_RAID_CHANGED','ボスが切り替わりました。戦況を更新してください。');
   s.offline430??={tickets:{}};
   for(let i=0;i<count;i++){
    const id='wrt-'+randomBytes(16).toString('hex'),seed=randomBytes(4).readUInt32LE(),member={...session,profile};
    s.offline430.tickets[id]={id,requestId:message.requestId,ruleVersion:this.offlineRuleVersion430??OFFLINE_RULE_VERSION430,ledgerId:s.ledgerId429,playerId:session.playerId,day,campaignId:s.current.id,sequence:s.current.sequence,issuedAt:now,expiresAt:now+OFFLINE_LIFETIME430,seed,status:'reserved',initialRoom:createOfflineTicketBattle430(member,s.current,id,seed,now,this.offlineRuleVersion430??OFFLINE_RULE_VERSION430),campaign:{id:s.current.id,sequence:s.current.sequence,hp:s.current.hp,maxHp:s.current.maxHp,startedAt:s.current.startedAt,circle432:s.current.circle432,boss:worldRaidBoss428(s.current.sequence)},name:profile.displayName,portrait439:raidPortrait439(profile)};
   }
   s.days[day]??={};s.days[day][session.playerId]=used+count;return {ok:true};
  });
  if(result.ok)this.ticketList430(session);return result;
 }
 _expiredReceipt430(t){return {ticketId:t.id,campaignId:t.campaignId,sequence:t.sequence,status:'expired',damage:0,appliedHp:0,lastHit:false,message:'取得から24時間を過ぎたため集計対象外です。取得日の回数は返却されません。'};}
 _notifyFinal430(){for(const session of this.sessions.values())if(session.connected&&this._pending429(session.playerId).length)this.deliverRewards429(session);}
 _expire430(){
  const s=this.ledger.state,now=this.now();
  if(!this.healthy()||!this._tickets430(s).some(t=>t.status==='reserved'&&t.expiresAt<=now)&&!s.history.some(c=>!c.settlement429&&!this._waiting430(s,c).length))return;
  const result=this.ledger.transact(next=>{
   for(const t of this._tickets430(next))if(t.status==='reserved'&&t.expiresAt<=now){t.status='expired';t.receipt=this._expiredReceipt430(t);delete t.initialRoom;delete t.campaign;}
   for(const c of next.history)this._settleRewards429(next,c);return {ok:true};
  });if(result.ok){this._notifyFinal430();this._publish();}return result;
 }
 submit430(session,message={}){
  if(!this._authenticated(session))return failure('NOT_READY','先に接続してください。');
  const ticket=this.ledger.state.offline430?.tickets?.[message.ticketId];
  if(!ticket||ticket.playerId!==session.playerId)return failure('WORLD_RAID_TICKET_OWNER','この挑戦権は使用できません。');
  if(ticket.status!=='reserved'){this.send(session.playerId,{type:'worldRaidOfflineReceipt430',receipt:clone(ticket.receipt)});return {ok:true,duplicate:true};}
  let replay=null;
  if(this.now()<ticket.expiresAt){try{replay=replayOffline430(ticket,message.commands);}catch(error){return failure('WORLD_RAID_REPLAY',error.message);}}
  const result=this.ledger.transact(s=>{
   const t=s.offline430.tickets[ticket.id];
   if(this.now()>=t.expiresAt){t.status='expired';t.receipt=this._expiredReceipt430(t);}
   else{
    const current=s.current.id===t.campaignId,c=current?s.current:s.history.find(c=>c.id===t.campaignId);
    if(!c||c.settlement429)return failure('WORLD_RAID_FINALIZED','このボスの集計は確定済みです。');
    const damage=replay.damage,impact=current?this._applyOfflineImpact432?.(c,damage):null,appliedHp=impact?.appliedHp??(current?Math.min(c.hp,damage):0);
    c.contribution[t.playerId]??={damage:0,attempts:0,name:t.name};c.contribution[t.playerId].name=this.sessions.get(t.playerId)?.profile?.displayName||t.name;c.contribution[t.playerId].playerName441=true;c.contribution[t.playerId].damage+=damage;c.contribution[t.playerId].attempts++;if(t.portrait439)c.contribution[t.playerId].portrait439=t.portrait439;
    if(!impact)c.hp-=appliedHp;const lastHit=current&&c.hp===0;
    t.status='submitted';t.receipt={ticketId:t.id,campaignId:t.campaignId,sequence:t.sequence,status:'accepted',damage,appliedHp,lastHit,result:replay.room.raid.outcome,rounds:replay.room.raid.round,receivedAt:this.now(),late:!current,message:!current?'討伐済みボスの順位へ加算しました。次のボスのHPには影響しません。':'共通HPと順位に反映しました。'};
    if(lastHit){c.completedAt=this.now();c.killerId=t.playerId;s.history.push(clone(c));s.current=newWorldRaidCampaign428(c.sequence+1,this.now());for(const a of Object.values(s.attempts))if(a.status==='active'&&a.campaignId===c.id){if(a.room?.raid){a.room.raid.boss.hp=0;a.room.raid.progress.hp=0;}this._closeAttempt(s,a,'sharedVictory');}}
   }
   delete t.initialRoom;delete t.campaign;for(const c of s.history)this._settleRewards429(s,c);return {ok:true,receipt:clone(t.receipt)};
  });
  if(result.ok){this.rankingCache429.clear();this.send(session.playerId,{type:'worldRaidOfflineReceipt430',receipt:result.receipt});this._publish();this._notifyFinal430();}return result;
 }
 ranking429(session,message){
  this._expire430();const send=this.send;this.send=(id,payload)=>{
   if(payload.type==='worldRaidRanking429'){const c=this.ledger.state.history.find(c=>c.id===payload.campaign.id);payload={...payload,campaign:{...payload.campaign,provisional430:Boolean(c?.closing430),settlementDeadline430:c?.closing430?.deadlineAt??null}};}send(id,payload);
  };try{return super.ranking429(session,message);}finally{this.send=send;}
 }
 advance(){this._expire430();super.advance();}
 handle(session,message){
  const method={worldRaidTicketList430:'ticketList430',worldRaidReserve430:'reserve430',worldRaidSubmit430:'submit430'}[message.type];if(!method)return super.handle(session,message);
  const result=this[method](session,message);if(!result.ok&&this._authenticated(session))this.send(session.playerId,{type:'worldRaidOfflineError430',requestId:message.requestId,ticketId:message.ticketId,...result});return result;
 }
}
