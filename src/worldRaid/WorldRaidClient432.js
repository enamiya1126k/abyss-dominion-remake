import {WorldRaidClient430} from './WorldRaidClient430.js';
import {worldRaidBattleView428} from './WorldRaidView428.js';
import {worldRaidRankingView429} from './WorldRaidRankingView429.js';
import {raidHeader432,raidLobby432,raidExchange432,raidResult432} from './WorldRaidView432.js';
import {mountBattleBossLayout} from '../ui/BattleBossLayout.js';

export class WorldRaidClient432 extends WorldRaidClient430 {
 constructor(options){
  super(options);this.exchange432=options.onExchange;this.catalog432=options.exchangeCatalog;this.prices432=options.exchangePrices;this.contributionBody432=options.contributionBody;
  this.details432={};this.resultStep432='contribution';this.resultId432=null;
  const p=this.presentation,queue=p._queueBattlePresentation.bind(p);
  p._queueBattlePresentation=(mode,events)=>queue(mode,events.filter(e=>e.kind!=='raidTelegraph'&&e.kind!=='weeklyRule'));
  this.detailsChanged432=e=>{const key=e.target.dataset?.raidDetails432;if(key)this.details432[key]=e.target.open;};
 }
 mount(root){super.mount(root);root.classList.add('world-raid-active432');root.addEventListener('toggle',this.detailsChanged432,true);this.render();}
 unmount(){this.root?.classList.remove('world-raid-active432');this.root?.removeEventListener('toggle',this.detailsChanged432,true);super.unmount();}
 refresh(){const result=super.refresh();if(this.panel429!=='ranking'&&this.connected()&&!this.rankRequest429)this.requestRanking429(this.showingResult432?this.resultSequence432():this.onlineState430?.campaign?.sequence??null,0);return result;}
 updateSharedMeter(){
  super.updateSharedMeter();
  if(this.localTicket430||!this.root||!this.state?.campaign)return;
  const c=this.state.campaign,a=this.state.attempt;if(a?.campaignId!==c.id)return;
  const boss=this.root.querySelector('.raid-main-boss'),hp=boss?.querySelector('.enemy-hp');
  if(hp){hp.querySelector('.hp-fill').style.width=`${Math.max(0,Math.min(100,c.hp/c.maxHp*100))}%`;hp.querySelector('.bar-label').textContent=`HP ${c.hp}/${c.maxHp}`;}
  const shield=boss?.querySelector('.battle-shield-gauge');
  if(shield&&c.circle432){const {shield:value,maxShield}=c.circle432;shield.setAttribute('aria-valuenow',value);shield.querySelector('i').style.width=`${maxShield?value/maxShield*100:0}%`;shield.querySelector('.bar-label').textContent=`盾 ${value}/${maxShield}`;}
 }
 async handleClick(event){
  const b=event.target.closest?.('button');if(b?.disabled)return;
  if(b?.matches('[data-raid-lobby432]')){this.panel429='challenge';this.rankSequence429=null;this.rankPage429=0;this.requestRanking429(this.onlineState430?.campaign?.sequence??null,0);this.render();this.toTop432();return;}
  if(b?.matches('[data-raid-exchange432]')){this.panel429='exchange';this.shopBoss432=this.onlineState430?.campaign?.boss?.id;this.render();this.toTop432();return;}
  if(b?.matches('[data-raid-shop-boss432]')){this.shopBoss432=b.dataset.raidShopBoss432;this.render();return;}
  if(b?.matches('[data-raid-buy432]')){
   if(this.exchangePending432)return;this.exchangePending432=b.dataset.raidBuy432;this.render();
   try{const r=await this.exchange432?.(this.exchangePending432);this.toast(r?.message??'交換できませんでした。');}catch{this.toast('交換を保存できませんでした。');}
   finally{this.exchangePending432=null;this.render();}return;
  }
  if(this.showingResult432&&b?.matches('[data-modal-primary],[data-modal-dismiss]')){
   if(this.resultStep432==='contribution'){this.resultStep432='reward';this.transport.worldRaidRewards429?.refresh();this.requestRanking429(this.state.attempt.raid?.weeklyBoss?.sequence??this.resultSequence432(),0);this.render();}
   else{this.dismissedReport=this.state.attempt.id;this.resultStep432='contribution';this.panel429='challenge';if(this.localTicket430){this.localTicket430=null;this.ending=null;clearTimeout(this.endTimer);this.offlineUpdated();}else this.render();this.requestRanking429(this.onlineState430?.campaign?.sequence??null,0);}
   this.toTop432();return;
  }
  const panel=b?.matches('[data-world-panel429]');await super.handleClick(event);if(panel)this.toTop432();
 }
 resultSequence432(){const id=this.state?.attempt?.campaignId;return Number(String(id).split('-')[1])||this.state?.campaign?.sequence;}
 toTop432(){const scroller=this.root?.querySelector('[data-world-content]');if(scroller)scroller.scrollTop=0;}
 render(){
  if(!this.root||!this.offline)return;
  const shell=this.root.querySelector('.world-raid428');if(!shell)return;shell.classList.add('world-raid432');
  const p=this.presentation,local=Boolean(this.localTicket430),connected=this.connected(),a=this.state?.attempt,active=a?.status==='active'||this.ending===a?.id;
  p.connectionReady=connected||local;p.ws=local?{readyState:1}:this.transport.ws;p.backgroundOnly=false;p.capabilities=new Set(['battleAutoV1']);
  shell.querySelector('header')?.replaceWith(this.headerNode432(local?'オフライン挑戦':connected?'オンライン':'オフライン'));
  const content=shell.querySelector('[data-world-content]');if(!content)return;content.classList.add('raid-scroll432');
  const oldTop=content.scrollTop,turnScroll=content.querySelector('.turn-order')?.scrollLeft??0;
  this.ranking429??=this.offline.bank().cachedRanking??null;
  const report=Boolean(!active&&a?.report&&a.id!==this.dismissedReport);
  this.showingResult432=report;content.classList.toggle('raid-results432',report);shell.classList.toggle('is-battle432',Boolean(active));
  const pageKey=active?`battle:${a.id}`:report?`result:${a.id}:${this.resultStep432}`:this.panel429;
  if(active&&a?.raid){
   content.innerHTML=`${!connected&&!local?'<p class="raid-message432">接続待ち。つながると同じ戦闘を再開します。</p>':''}${local?'<small class="raid-local432">結果は保存し、接続後に自動送信</small>':''}${worldRaidBattleView428(this.state,p,{ending:Boolean(this.ending),compact432:true})}`;
   mountBattleBossLayout(content.querySelector('.battle-screen'));p._decorateBattleState();
  }else if(report){
   if(this.resultId432!==a.id){this.resultId432=a.id;this.resultStep432='contribution';this.requestRanking429(this.resultSequence432(),0);}
   content.innerHTML=raidResult432(this);
  }else if(this.panel429==='exchange')content.innerHTML=raidExchange432(this.getState(),this.catalog432,this.prices432,{bossId:this.shopBoss432,pending:this.exchangePending432});
  else if(this.panel429==='ranking')content.innerHTML='<button data-raid-lobby432>‹ レイドへ戻る</button>'+worldRaidRankingView429(this.ranking429,{connected,supported:this.transport.capabilities.has('worldRaidRewardsV1')||Boolean(this.ranking429),loading:Boolean(this.rankRequest429),playerId:this.transport.selfId,received:id=>Boolean(this.getState().onlineParty?.worldRaidReceipts429?.[id]),error:this.error||this.transport.worldRaidRewards429?.lastError||''});
  else{
   content.innerHTML=raidLobby432(this);
   const c=this.onlineState430?.campaign??this.state?.campaign;
   if(c&&connected&&!this.rankRequest429&&(!this.ranking429||this.ranking429.campaign?.id!==c.id||this.ranking429.page!==0))this.requestRanking429(c.sequence,0);
  }
  content.scrollTop=this.pageKey432===pageKey?oldTop:0;this.pageKey432=pageKey;
  const strip=content.querySelector('.turn-order');if(strip)strip.scrollLeft=turnScroll;
  this.onScene(active?'battle':'home');
 }
 headerNode432(status){const t=this.root.ownerDocument.createElement('template');t.innerHTML=raidHeader432(status);return t.content.firstElementChild;}
}
