import {worldRaidTabs429,worldRaidRankingView429} from './WorldRaidRankingView429.js';
import {OnlinePartyController} from '../online/OnlinePartyClient.js';
import {buildOnlinePartyProfile} from '../ui/screens/OnlinePartyScreen.js';
import {mountBattleBossLayout} from '../ui/BattleBossLayout.js';
import {worldRaidShell428,worldRaidLobby428,worldRaidBattleView428} from './WorldRaidView428.js';

const pendingKey='abyss-world-raid-pending428';
const requestId=()=>globalThis.crypto?.randomUUID?.()??`wr-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
export class WorldRaidClient428{
 constructor({transport,getState,toast=()=>{},onBack=()=>{},onScene=()=>{}}){
  this.transport=transport;this.getState=getState;this.toast=toast;this.onBack=onBack;this.onScene=onScene;this.state=null;this.root=null;this.error='';this.pending=null;this.dismissedReport=null;this.ending=null;this.endTimer=null;this.panel429='challenge';this.ranking429=null;this.rankRequest429=null;this.rankSequence429=null;this.rankPage429=0;this.rankTimer429=null;
  // A presentation-only controller: it opens no socket or online room.
  this.presentation=new OnlinePartyController({getState,toast});const p=this.presentation;
  p.route='raid';p._render=()=>this.render();p._send=(type,payload)=>this.sendBattle(type,payload);
  const original=transport._handleMessage.bind(transport);transport._handleMessage=(message,socket)=>{
   if(socket&&socket!==transport.ws)return;
   if(message?.type==='worldRaidRanking429'){this.receiveRanking429(message);return;}
   if(message?.type==='worldRaidRewardsError429'&&message.requestId===this.rankRequest429){clearTimeout(this.rankTimer429);this.rankRequest429=null;this.error=message.message;this.render();return;}
   if(['worldRaidState','worldRaidError'].includes(message?.type)){this.receive(message);return;}
   original(message,socket);if(message?.type==='helloAck'&&this.root)this.refresh();
  };
  const availability=transport._notifyServerAvailability.bind(transport);transport._notifyServerAvailability=(...args)=>{availability(...args);if(this.root)this.render();};
  this.click=event=>this.handleClick(event);
 }
 connected(){return Boolean(this.transport.connectionReady&&this.transport.ws?.readyState===1);}
 supported(){return this.transport.capabilities.has('worldRaidV1');}
 mount(root){
  this.unmount();this.root=root;root.innerHTML=worldRaidShell428();root.addEventListener('click',this.click);
  const p=this.presentation;p.root=root;p.mounted=true;p.selfId=this.transport.selfId;
  try{const pending=JSON.parse(localStorage.getItem(pendingKey)||'null');if(pending?.playerId===p.selfId)this.pending=pending;}catch{}
  this.transport.startBackground();this.refresh();this.render();
  this.clock=setInterval(()=>{if(this.root)this.presentation._updateClock();},250);
  this.poll=setInterval(()=>{if(this.root&&this.connected()&&this.supported())this.refresh();},10000);
 }
 unmount(){
  clearTimeout(this.rankTimer429);this.rankRequest429=null;clearInterval(this.clock);clearInterval(this.poll);clearTimeout(this.endTimer);this.poll=null;this.endTimer=null;this.ending=null;
  this.root?.removeEventListener('click',this.click);this.presentation._clearPresentationTimers();this.presentation.root=null;this.presentation.mounted=false;
  if(this.root&&this.connected()&&this.supported())this.transport._send('worldRaidStatus',{subscribe:false});this.root=null;
 }
 refresh(){
  if(this.connected()&&this.supported()){this.transport._send('worldRaidStatus',{subscribe:true});if(this.panel429==='ranking')this.requestRanking429();return true;}
  if(!this.connected())this.transport.startBackground();this.render();return false;
 }
 savePending(pending){this.pending=pending;try{if(pending)localStorage.setItem(pendingKey,JSON.stringify(pending));else localStorage.removeItem(pendingKey);return true;}catch{this.toast('挑戦の受付記録を保存できません。保存領域を確認してください。');return false;}}
 start(){
  if(!this.connected()||!this.supported())return this.toast('接続後に挑戦できます。');
  if(!this.state?.available||this.state.remaining<=0||this.state.attempt?.status==='active'||this.pending)return;
  const profile=buildOnlinePartyProfile(this.getState());
  if(!profile.battleRoster?.length)return this.toast('先に部隊を編成してください。');
  const pending={requestId:requestId(),campaignId:this.state.campaign.id,playerId:this.transport.selfId};
  if(!this.savePending(pending)){this.pending=null;return;}
  this.transport._send('worldRaidStart',{...pending,profile});this.error='';this.render();
 }
 retry(){
  if(!this.connected()||!this.supported())return this.refresh();
  if(!this.pending)return this.refresh();
  this.transport._send('worldRaidStart',{...this.pending,profile:buildOnlinePartyProfile(this.getState())});
 }
 receive(message){
  const next=message.state;if(!next)return;
  if(this.state&&next.revision<this.state.revision&&next.available!==false)return;
  const previous=this.state?.attempt,attempt=next.attempt;this.state=next;
  if(this.pending&&(attempt?.requestId===this.pending.requestId||this.pending.campaignId!==next.campaign.id||message.type==='worldRaidError'&&message.requestId===this.pending.requestId))this.savePending(null);
  if(message.type==='worldRaidError'){this.error=message.message||'戦況を再確認してください。';if(this.root)this.toast(this.error);}else this.error='';
  const p=this.presentation;p.selfId=this.transport.selfId;p.profile=this.transport.profile;
  if(attempt?.raid){
   p._captureHpTrails('raid',previous?.raid,attempt.raid);p.roomState={roomId:attempt.id,leaderId:p.selfId,ownerId:p.selfId,selectedFloor:100,phase:attempt.status==='active'?'raid':'lobby',raid:structuredClone(attempt.raid),members:[{playerId:p.selfId,connected:true,ready:true,isLeader:true,profile:p.profile}]};p.roomId=attempt.id;
   if(previous?.id!==attempt.id){p.presentationKoIds.raid.clear();p._closeBattleMenus('raid');p.selectedTarget.raid=attempt.raid.boss.id;this.dismissedReport=null;}
   if(previous?.raid?.round!==attempt.raid.round)p._closeBattleMenus('raid');
  }
  if(!this.root)return;
  if(this.backAfterRetreat&&attempt?.status==='ended'){this.backAfterRetreat=false;this.onBack();return;}
  const events=message.events??[];
  if(previous?.status==='active'&&attempt?.status==='ended'&&events.length&&!this.ending){
   this.ending=attempt.id;this.render();p._queueBattlePresentation('raid',events);
   this.endTimer=setTimeout(()=>{this.ending=null;this.endTimer=null;this.render();},1600);return;
  }
  if(this.ending)return;
  if(previous&&attempt&&previous.status==='active'&&attempt.status==='active'&&previous.id===attempt.id&&JSON.stringify(previous.raid)===JSON.stringify(attempt.raid)&&message.type!=='worldRaidError'&&!message.refresh){
   // Other players' hits update the shared meter without resetting an attack animation or menu.
   this.updateSharedMeter();return;
  }
  this.render();if(events.length)p._queueBattlePresentation('raid',events);
 }
 updateSharedMeter(){
  if(!this.root||!this.state)return;
  const c=this.state.campaign;
  for(const meter of this.root.querySelectorAll('.world-raid-hp428')){meter.setAttribute('aria-valuenow',c.hp);meter.setAttribute('aria-valuemax',c.maxHp);meter.querySelector('i').style.width=`${c.hp/c.maxHp*100}%`;meter.querySelector('b').textContent=`${c.hp}／${c.maxHp}`;}
 }
 sendBattle(type,payload={}){
  if(!this.connected()||!this.supported()||this.state?.attempt?.status!=='active')return false;
  const names={raidAction:'worldRaidAction',raidSpeed:'worldRaidSpeed',battleAuto:'worldRaidAuto',requestReturn:'worldRaidRetreat'};
  const target=names[type];if(!target)return false;
  const a=this.state.attempt;return this.transport._send(target,{...payload,attemptId:a.id,round:a.raid.round});
 }
 requestRanking429(sequence=this.rankSequence429,page=this.rankPage429){
  if(!this.connected()||!this.transport.capabilities.has('worldRaidRewardsV1'))return false;
  this.rankSequence429=sequence;this.rankPage429=page;this.rankRequest429=requestId();
  clearTimeout(this.rankTimer429);this.rankTimer429=setTimeout(()=>{this.rankRequest429=null;this.error='順位を取得できませんでした。再確認してください。';this.render();},8000);this.rankTimer429.unref?.();
  this.transport._send('worldRaidRanking429',{requestId:this.rankRequest429,...(sequence==null?{}:{sequence}),page});return true;
 }
 receiveRanking429(message){
  if(message.requestId!==this.rankRequest429)return;
  clearTimeout(this.rankTimer429);this.rankRequest429=null;this.ranking429=message;this.rankPage429=message.page;this.error='';this.render();
 }
 handleClick(event){
  const button=event.target.closest?.('button');if(button?.disabled)return;
  if(button?.matches('[data-world-panel429]')){this.panel429=button.dataset.worldPanel429;if(this.panel429==='ranking')this.requestRanking429();return this.render();}
  if(button?.matches('[data-world-sequence429]')){this.requestRanking429(Number(button.dataset.worldSequence429),0);return this.render();}
  if(button?.matches('[data-world-page429]')){this.requestRanking429(this.ranking429?.campaign.sequence,Number(button.dataset.worldPage429));return this.render();}
  if(button?.matches('[data-world-ranking-refresh429]')){this.requestRanking429();return this.render();}
  if(button?.matches('[data-world-rewards-retry429]')){this.transport.worldRaidRewards429?.refresh();this.requestRanking429();return;}
  if(button?.matches('[data-world-start]'))return this.start();
  if(button?.matches('[data-world-retry]'))return this.retry();
  if(button?.matches('[data-world-refresh]'))return this.refresh();
  if(button?.matches('[data-world-report-close]')){this.dismissedReport=this.state.attempt.id;return this.render();}
  if(button?.matches('[data-world-back]')){
   if(this.state?.attempt?.status==='active'&&this.connected()){this.backAfterRetreat=true;return this.sendBattle('requestReturn');}
   return this.onBack();
  }
  if(button?.matches('[data-world-retreat]')||button?.id==='returnHome')return this.sendBattle('requestReturn');
  this.presentation._handleClick(event);
 }
 render(){
  if(!this.root)return;
  const p=this.presentation,connected=this.connected();p.connectionReady=connected;p.ws=this.transport.ws;p.backgroundOnly=false;p.capabilities=new Set(['battleAutoV1']);
  const status=this.root.querySelector('[data-world-connection]');if(status)status.textContent=connected?'オンライン':'接続待ち';
  const a=this.state?.attempt,active=a?.status==='active'||this.ending===a?.id;
  const content=this.root.querySelector('[data-world-content]');if(!content)return;
  const rewardBridge=this.transport.worldRaidRewards429,pendingRewards=rewardBridge?.pending??this.state?.pendingRewards429??0;
  content.innerHTML=active&&a?.raid?worldRaidBattleView428(this.state,p,{ending:Boolean(this.ending)}):worldRaidTabs429(this.panel429,pendingRewards)+(this.panel429==='ranking'?worldRaidRankingView429(this.ranking429,{connected,supported:this.transport.capabilities.has('worldRaidRewardsV1'),loading:Boolean(this.rankRequest429),playerId:this.transport.selfId,received:id=>Boolean(this.getState().onlineParty?.worldRaidReceipts429?.[id]),error:this.error||rewardBridge?.lastError||''}):worldRaidLobby428(this.state,{connected,supported:this.supported(),pending:Boolean(this.pending),error:this.error,dismissedReport:this.dismissedReport}));
  mountBattleBossLayout(content.querySelector('.battle-screen'));this.onScene(active?'battle':'home');
  if(active){p._decorateBattleState();if(!connected){const notice=document.createElement('p');notice.className='world-raid-notice428';notice.textContent='通信が戻ると同じ挑戦を再開します。挑戦回数は追加消費されません。';content.prepend(notice);}}
 }
}
