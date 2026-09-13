import {WorldRaidClient428} from './WorldRaidClient428.js';
import {worldRaidTabs429,worldRaidRankingView429} from './WorldRaidRankingView429.js';
import {worldRaidLobby428,worldRaidBattleView428} from './WorldRaidView428.js';
import {worldRaidOfflineView430} from './WorldRaidOfflineView430.js';
import {buildOnlinePartyProfile} from '../ui/screens/OnlinePartyScreen.js';
import {mountBattleBossLayout} from '../ui/BattleBossLayout.js';
import {acceptsWorldRaidState431} from './WorldRaidState431.js';
export class WorldRaidClient430 extends WorldRaidClient428{
 constructor(options){super(options);this.offline=options.transport.worldRaidOffline430;this.localTicket430=null;this.onlineState430=null;}
 mount(root){this.state=this.offline.bank().cachedState??this.state;this.onlineState430=this.state;this.localTicket430=this.offline.active()?.ticket.id??null;super.mount(root);this.offline.flush(true);this.offlineUpdated();this.localClock430=setInterval(()=>{if(this.root){const selected=this.offline.bank().tickets[this.localTicket430];if(selected?.phase==='playing'&&selected.ticket.expiresAt<=this.offline.time())this.offlineUpdated();else this.offline.tick();}},250);}
 unmount(){clearInterval(this.localClock430);super.unmount();}
 receive(message){
  if(message.state){if(!acceptsWorldRaidState431(this.onlineState430,message.state))return;try{this.offline?.cacheState(message.state);}catch(error){this.toast(error.message);}this.onlineState430=message.state;}
  if(this.localTicket430){this.offlineUpdated();return;}super.receive(message);
 }
 receiveRanking429(message){super.receiveRanking429(message);if(this.ranking429===message){const b=structuredClone(this.offline.bank());b.cachedRanking=message;try{this.offline.write(b);}catch{}}}
 offlineUpdated(ticketId=null,events=[]){
  const cached=this.offline.bank().cachedState;
  if(acceptsWorldRaidState431(this.onlineState430,cached))this.onlineState430=cached;
  if(ticketId)this.localTicket430=ticketId;
  const selected=this.offline.bank().tickets[this.localTicket430];if(selected?.phase==='playing'&&selected.ticket.expiresAt<=this.offline.time())this.localTicket430=null;
  if(!this.localTicket430)this.localTicket430=this.offline.active()?.ticket.id??null;
  const view=this.localTicket430?this.offline.view(this.localTicket430):null;
  if(!view){this.localTicket430=null;
   if(this.state?.attempt?.id!==this.onlineState430?.attempt?.id){clearTimeout(this.endTimer);this.endTimer=null;this.ending=null;}
   if(this.onlineState430)return super.receive({type:'worldRaidState',state:this.onlineState430});
   this.render();return;
  }
  const e=view.entry,t=e.ticket,base=this.onlineState430??this.offline.bank().cachedState??{};
  const state={...base,revision:Math.max(this.state?.revision??0,base.revision??0),campaign:{...t.campaign,hp:view.raid.boss.hp,myDamage:view.damage},attempt:{id:t.id,requestId:t.requestId,campaignId:t.campaignId,status:e.phase==='playing'?'active':'ended',damage:view.damage,raid:view.raid,report:e.phase==='playing'?null:{bossName:t.campaign.boss.name,damage:view.damage,result:view.result}}};
  super.receive({type:'worldRaidState',state,events});
 }
 sendBattle(type,payload={}){
  if(!this.localTicket430)return super.sendBattle(type,payload);
  const kind={raidAction:'action',raidSpeed:'speed',battleAuto:'auto',requestReturn:'retreat'}[type];if(!kind)return false;
  const view=this.offline.view(this.localTicket430);if(!view||view.entry.phase!=='playing')return false;
  this.offline.command(this.localTicket430,{kind,round:view.raid.round,...(kind==='action'?{action:payload}:{enabled:payload.enabled,speed:payload.speed})}).catch(()=>{});return true;
 }
 handleClick(event){
  const b=event.target.closest?.('button');if(b?.disabled)return;
  if(b?.matches('[data-world-reserve430]'))return this.offline.reserve(Number(b.dataset.worldReserve430),buildOnlinePartyProfile(this.getState()),this.state?.campaign.id).catch(()=>{});
  if(b?.matches('[data-world-ticket430]')){const id=b.dataset.worldTicket430;if(this.offline.active()?.ticket.id===id)return this.offlineUpdated(id);return this.offline.start(id).catch(()=>{});}
  if(b?.matches('[data-world-sync430]'))return this.offline.flush(true);
  if(this.localTicket430&&b?.matches('[data-world-back]'))return this.onBack();
  if(this.localTicket430&&b?.matches('[data-world-report-close]')){this.localTicket430=null;this.ending=null;clearTimeout(this.endTimer);return this.offlineUpdated();}
  return super.handleClick(event);
 }
 render(){
  if(!this.root||!this.offline)return;
  const p=this.presentation,connected=this.connected(),local=Boolean(this.localTicket430),a=this.state?.attempt,active=a?.status==='active'||this.ending===a?.id;
  p.connectionReady=connected||local;p.ws=local?{readyState:1}:this.transport.ws;p.backgroundOnly=false;p.capabilities=new Set(['battleAutoV1']);
  const status=this.root.querySelector('[data-world-connection]');if(status)status.textContent=local?'持ち出し挑戦中':connected?'オンライン':'オフライン';
  const content=this.root.querySelector('[data-world-content]');if(!content)return;
  const rewards=this.transport.worldRaidRewards429,bank=this.offline.bank();this.ranking429??=bank.cachedRanking??null;
  if(active&&a?.raid){content.innerHTML=(local?'<p class="world-raid-notice428">取得済みの挑戦権で戦闘中。結果は保存し、接続時に反映する。</p>':'')+worldRaidBattleView428(this.state,p,{ending:Boolean(this.ending)});}
  else{
   let lobby=worldRaidLobby428(this.state,{connected,supported:this.supported(),pending:Boolean(this.pending),error:this.error,dismissedReport:this.dismissedReport});
   if(local)lobby=lobby.replace('攻撃の成果はサーバー共通HPへ反映済みです。','結果を端末に保存しました。サーバーへの反映は、受付確認後に確定します。').replace('サーバー全員共通HP','この挑戦でのボスHP（未反映）').replace('data-world-start ', 'data-world-start disabled ');
   if(!connected)lobby=lobby.replace('サーバーへ接続しています。接続後に挑戦できます。','オフラインです。取得済みの挑戦権を使って遊べます。');
   content.innerHTML=worldRaidTabs429(this.panel429,rewards?.pending??0)+(this.panel429==='ranking'?worldRaidRankingView429(this.ranking429,{connected,supported:this.transport.capabilities.has('worldRaidRewardsV1')||Boolean(this.ranking429),loading:Boolean(this.rankRequest429),playerId:this.transport.selfId,received:id=>Boolean(this.getState().onlineParty?.worldRaidReceipts429?.[id]),error:this.error||rewards?.lastError||''}):worldRaidOfflineView430(this.offline,this.onlineState430??this.state)+lobby);
  }
  if(local){for(const el of content.querySelectorAll('.world-raid-progress428 header b'))el.textContent='この挑戦でのボスHP（未反映）';}
  mountBattleBossLayout(content.querySelector('.battle-screen'));this.onScene(active?'battle':'home');if(active){p._decorateBattleState();if(!connected&&!local){const notice=document.createElement('p');notice.className='world-raid-notice428';notice.textContent='このオンライン挑戦は再接続後に再開します。';content.prepend(notice);}}
 }
}
