// This bridge shares the existing always-connected transport; no extra socket.
export class WorldRaidRewardsClient429{
 constructor({transport,onReward,toast=()=>{},onUpdate=()=>{}}){
  this.transport=transport;this.onReward=onReward;this.toast=toast;this.onUpdate=onUpdate;this.queue=Promise.resolve();this.awaiting=new Set();this.ackSentAt=new Map();this.timer=null;this.pending=0;this.lastError='';
  const handle=transport._handleMessage.bind(transport);
  transport._handleMessage=(message,socket)=>{
   if(socket&&socket!==transport.ws)return;
   if(message?.type==='worldRaidRewards429'){this.queue=this.queue.then(()=>this.receive(message)).catch(()=>{this.lastError='報酬の受取を再試行します。';this.retryLater();});return;}
   if(message?.type==='worldRaidRewardAck429'){this.awaiting.delete(message.rewardId);this.pending=message.pending??this.pending;if(!this.awaiting.size){clearTimeout(this.timer);this.timer=null;}this.onUpdate();return;}
   if(message?.type==='worldRaidRewardsError429'){this.lastError=message.message||'報酬を確認できません。';if(message.rewardId)this.retryLater();this.onUpdate();return handle(message,socket);}
   handle(message,socket);if(message?.type==='helloAck')this.refresh();
  };
 }
 ready(){return this.transport.connectionReady&&this.transport.ws?.readyState===1&&this.transport.capabilities.has('worldRaidRewardsV1');}
 refresh(){if(!this.ready())return false;this.transport._send('worldRaidRewardList429');return true;}
 retryLater(){clearTimeout(this.timer);this.timer=setTimeout(()=>{this.timer=null;if(this.ready())this.refresh();},5000);this.timer.unref?.();}
 async receive(message){
  this.pending=message.pending??0;let fresh=0,failed=false;
  for(const [id,at]of this.ackSentAt)if(Date.now()-at>=1500)this.ackSentAt.delete(id);
  if(!message.hasMore){const pendingIds=new Set((message.entries??[]).map(e=>e.rewardId));for(const id of this.awaiting)if(!pendingIds.has(id))this.awaiting.delete(id);if(!this.awaiting.size){clearTimeout(this.timer);this.timer=null;}}
  for(const entry of message.entries??[]){
   // A hello/retry response can contain an overlapping page. Avoid sending
   // another burst of 20 acknowledgements inside the server's rate window.
   if(this.ackSentAt.has(entry.rewardId))continue;
   let result;try{result=await this.onReward(entry,this.transport.selfId);}catch{result={ok:false,message:'報酬を保存できませんでした。'};}
   if(!result?.ok){failed=true;const error=result?.message||'報酬を保存できませんでした。';if(error!==this.lastError)this.toast(error);this.lastError=error;break;}
   if(!result.duplicate)fresh++;
   this.awaiting.add(entry.rewardId);this.ackSentAt.set(entry.rewardId,Date.now());this.transport._send('worldRaidRewardAck429',{rewardId:entry.rewardId});
  }
  if(fresh)this.toast(`共闘レイドの討伐報酬を${fresh}件受け取った！ ランキングで内訳を確認できます。`);
  if(!failed)this.lastError='';
  if(failed||this.awaiting.size)this.retryLater();
  if(message.hasMore&&!failed){clearTimeout(this.pageTimer);this.pageTimer=setTimeout(()=>this.refresh(),1200);this.pageTimer.unref?.();}this.onUpdate();
 }
}
