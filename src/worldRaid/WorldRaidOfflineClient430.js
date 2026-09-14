import {prepareOfflineCache430,warmTicketImages430} from './WorldRaidOfflineCache430.js';
import {raidResultDelay438,raidCommandDelay438} from './WorldRaidSpeed438.js';
import {replayOffline430} from './WorldRaidReplay430.js';
import {acceptsWorldRaidState431} from './WorldRaidState431.js';
const clone=structuredClone,uid=()=>globalThis.crypto?.randomUUID?.()??`request-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export class WorldRaidOfflineClient430{
 constructor({transport,getBank,setBank,now=()=>Date.now(),toast=()=>{},onUpdate=()=>{},prepare=prepareOfflineCache430}){
  Object.assign(this,{transport,getBank,setBank,now,toast,onUpdate,prepare});this.queue=Promise.resolve();this.sending=new Map();this.error='';this.busy=false;
  const original=transport._handleMessage.bind(transport);transport._handleMessage=(message,socket)=>{
   if(socket&&socket!==transport.ws)return;
   if(['worldRaidTickets430','worldRaidOfflineReceipt430','worldRaidOfflineError430'].includes(message?.type)){this.enqueue(()=>this.receive(message));return;}
   original(message,socket);if(message?.type==='helloAck')this.flush(true);
  };
  this.retry=setInterval(()=>this.flush(),10000);this.retry.unref?.();
 }
 bank(){const bank=this.getBank();return bank?.owner===this.transport.selfId?bank:{version:1,owner:this.transport.selfId,ledgerId:null,tickets:{}};}
 write(bank){if(!this.setBank(bank))throw new Error('挑戦記録を保存できません。保存領域を確認してください。');}
 enqueue(fn){const result=this.queue.then(fn);this.queue=result.catch(error=>{this.error=error.message;this.toast(error.message);this.onUpdate();});return result;}
 ready(){return this.transport.connectionReady&&this.transport.ws?.readyState===1&&this.transport.capabilities.has('worldRaidOfflineV1');}
 time(){return this.now()+(this.bank().clockOffset??0);}
 available(){return Object.values(this.bank().tickets).filter(e=>e.ticket.status==='reserved'&&e.phase==='ready'&&e.ticket.ledgerId===this.bank().ledgerId&&e.ticket.expiresAt>this.time());}
 active(){return Object.values(this.bank().tickets).find(e=>e.phase==='playing'&&e.ticket.expiresAt>this.time())??null;}
 cacheState(state){const b=clone(this.bank());if(!acceptsWorldRaidState431(b.cachedState,state))return;
  if(state.attempt?.status==='active'&&b.cachedState?.attempt?.id===state.attempt.id&&this.now()-(this.lastCacheAt??0)<10000)return;
  b.cachedState=state;b.clockOffset=state.serverNow-this.now();this.write(b);this.lastCacheAt=this.now();
 }
 reserve(count,profile,campaignId){return this.enqueue(async()=>{
  if(!this.ready())throw new Error('挑戦権の取得には接続が必要です。');let b=clone(this.bank());if(b.pendingReserve)return this.flush(true);
  this.preparing=true;this.onUpdate();try{await this.prepare();}finally{this.preparing=false;this.onUpdate();}
  b=clone(this.bank());if(b.pendingReserve)return this.flush(true);
  b.pendingReserve={requestId:uid(),count,profile:clone(profile),campaignId};this.write(b);this.flush(true);this.onUpdate();
 });}
 start(ticketId){return this.enqueue(()=>{
  if(this.active())throw new Error('進行中の挑戦を再開してください。');const b=clone(this.bank()),e=b.tickets[ticketId];
  if(!e||e.phase!=='ready'||e.ticket.status!=='reserved'||e.ticket.expiresAt<=this.time()||e.ticket.ledgerId!==b.ledgerId)throw new Error('この挑戦権は使用できません。');
  e.phase='playing';e.commands=[];e.nextAt=this.now()+1200;this.write(b);this.onUpdate(ticketId,[]);return ticketId;
 });}
 command(ticketId,command){return this.enqueue(()=>{
  const b=clone(this.bank()),e=b.tickets[ticketId];if(e?.phase!=='playing')return false;
  if(e.ticket.expiresAt<=this.time())throw new Error('挑戦権の有効期限を過ぎました。接続して確認してください。');
  const replay=replayOffline430(e.ticket,e.commands,{complete:false}),snapshot=replay.step(command);e.commands=clone(replay.commands);
  if(snapshot.ended){e.phase='pending';e.result={damage:snapshot.damage,result:snapshot.result,rounds:snapshot.raid.round};}
  const auto=snapshot.raid.autoPlayers.includes(this.transport.selfId);e.nextAt=this.now()+(snapshot.raid.phase==='result'?raidResultDelay438(snapshot.raid.speed):auto?raidCommandDelay438(snapshot.raid.speed):18000);
  this.write(b);this.onUpdate(ticketId,snapshot.events);if(snapshot.ended)this.flush();return true;
 });}
 tick(){const e=this.active();if(!e||e.nextAt>this.now()||this.busy||e.ticket.expiresAt<=this.time())return;this.busy=true;
  const replay=replayOffline430(e.ticket,e.commands,{complete:false});this.command(e.ticket.id,{kind:'advance',round:replay.room.raid.round}).catch(()=>{}).finally(()=>{this.busy=false;});
 }
 view(ticketId){const e=this.bank().tickets[ticketId];if(!e?.ticket.initialRoom)return null;const replay=replayOffline430(e.ticket,e.commands??[],{complete:false}),snapshot=replay.snapshot();snapshot.raid.deadlineAt=e.nextAt;snapshot.raid.nextRoundAt=e.nextAt;return {entry:e,...snapshot};}
 flush(force=false){
  if(!this.ready())return false;const b=this.bank(),now=this.now();
  if(force)this.transport._send('worldRaidTicketList430');
  if(b.pendingReserve&&(force||now-(this.reserveSent??0)>5000)){this.reserveSent=now;this.transport._send('worldRaidReserve430',b.pendingReserve);}
  for(const e of Object.values(b.tickets))if(e.phase==='pending'&&e.ticket.ledgerId===b.ledgerId&&(force||!this.sending.has(e.ticket.id)||now-this.sending.get(e.ticket.id)>5000)){
   this.sending.set(e.ticket.id,now);this.transport._send('worldRaidSubmit430',{ticketId:e.ticket.id,commands:e.commands});break;
  }return true;
 }
 receive(message){
  const b=clone(this.bank());
  if(message.type==='worldRaidOfflineError430'){
   this.error=message.message;if(message.requestId===b.pendingReserve?.requestId&&['BAD_REQUEST','BAD_COUNT','WORLD_RAID_LIMIT','WORLD_RAID_CHANGED','WORLD_RAID_PARTY','WORLD_RAID_BUSY'].includes(message.code)){delete b.pendingReserve;this.write(b);}this.onUpdate();return;
  }
  if(message.type==='worldRaidTickets430'){
   const changedLedger=Boolean(b.ledgerId&&b.ledgerId!==message.ledgerId);b.ledgerId=message.ledgerId;
   if(changedLedger||acceptsWorldRaidState431(b.cachedState,message.state)){b.cachedState=message.state;b.clockOffset=message.state.serverNow-this.now();}
   for(const t of message.tickets){if(t.playerId!==this.transport.selfId||t.ledgerId!==message.ledgerId)continue;const e=b.tickets[t.id];
    if(t.requestId===b.pendingReserve?.requestId)delete b.pendingReserve;
    if(t.status==='reserved'){if(!e){b.tickets[t.id]={ticket:t,phase:'ready',commands:[]};warmTicketImages430(t);}}
    else if(e){e.receipt=t.receipt;e.phase='synced';e.ticket.status=t.status;}
   }
  }else{
   const r=message.receipt,e=b.tickets[r?.ticketId];if(!e)return;e.receipt=r;e.phase='synced';e.ticket.status=r.status==='accepted'?'submitted':'expired';this.sending.delete(r.ticketId);
  }
  for(const e of Object.values(b.tickets))if(e.phase==='synced'){delete e.ticket.initialRoom;delete e.ticket.campaign;delete e.commands;}
  this.write(b);this.error='';this.onUpdate();this.flush();
 }
}
