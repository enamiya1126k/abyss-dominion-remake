import {renderSharedBattle} from '../online/OnlineViews.js';
import {escapeOnlineHtml} from '../ui/screens/OnlinePartyScreen.js';
import {raidSpriteBase} from '../core/RaidPresentation.js';
const number=n=>String(Math.max(0,Math.floor(Number(n)||0)));
export function worldRaidShell428(){return '<section class="world-raid428"><header class="world-raid-header428"><button type="button" data-world-back>ホームへ</button><h1>共闘レイド</h1><span data-world-connection></span></header><div data-world-content data-online-stage></div></section>';}
export function worldRaidProgress428(state){const c=state?.campaign;if(!c)return '';return `<section class="world-raid-progress428"><header><b>サーバー全員共通HP</b><span>第${number(c.sequence)}戦</span></header><div class="world-raid-hp428" role="progressbar" aria-label="共通HP" aria-valuemin="0" aria-valuemax="${c.maxHp}" aria-valuenow="${c.hp}"><i style="width:${Math.max(0,Math.min(100,c.hp/c.maxHp*100))}%"></i><b>${number(c.hp)}／${number(c.maxHp)}</b></div><p>今日の残り挑戦 <strong>${number(state.remaining)}／3回</strong><span>日本時間0時に回復</span></p>${c.myRank?`<p>あなた：${number(c.myRank)}位 ／ 累計 ${number(c.myDamage)} ダメージ</p>`:""}</section>`;}
export function worldRaidLobby428(state,{connected=false,supported=false,pending=false,error='',dismissedReport=null}={}){
 const c=state?.campaign,a=state?.attempt,report=a?.report&&a.id!==dismissedReport?a.report:null;
 const notice=error||(!connected?'サーバーへ接続しています。接続後に挑戦できます。':!supported?'共闘レイドは開催準備中です。':!state?'戦況を確認しています。':state.available===false?'共闘レイドは現在調整中です。':'');
 if(!c)return `<div class="world-raid-notice428" role="status">${escapeOnlineHtml(notice)}</div><button type="button" data-world-refresh>戦況を確認</button>`;
 const boss=c.boss,base=raidSpriteBase(boss.id),asset=base?`${base}-idle1.png`:boss.heroAsset;
 const reportTitle={victory:'討伐成功！',sharedVictory:'みんなの力で討伐成功！',limit:'10ラウンド終了',defeat:'今回の挑戦終了',retreat:'挑戦を中断'}[report?.result]??'挑戦結果';
 return `${notice?`<p class="world-raid-notice428" role="status">${escapeOnlineHtml(notice)}</p>`:''}${report?`<section class="world-raid-report428"><h2>${reportTitle}</h2><p>${escapeOnlineHtml(report.bossName)}</p><small>今回ボスに与えたダメージ</small><strong>${number(report.damage)}</strong><p>攻撃の成果はサーバー共通HPへ反映済みです。</p><button type="button" data-world-report-close>レイド受付へ</button></section>`:''}
 ${worldRaidProgress428(state)}<article class="world-raid-boss428"><img src="${escapeOnlineHtml(asset)}" alt="${escapeOnlineHtml(boss.name)}"><div><small>Lv.${number(boss.level)}</small><h2>${escapeOnlineHtml(boss.name)}</h2><p>倒すまで、全員で同じ一体に挑む。</p></div></article>
 <section class="world-raid-rules428"><p><b>1〜5ラウンド：</b>ボスは待機。Lv.100の取り巻き2体は行動する。</p><p><b>6〜10ラウンド：</b>ボスも攻撃開始。10ラウンドで今回の挑戦終了。</p><p>手動・自動で挑戦可能。討伐されると次のボスが出現する。</p><p>巨体耐性：割合攻撃・継続ダメージはHP160万を上限に計算。即死は最大40万ダメージに変換。</p><p>このボスへの累積ダメージ：${number(c.myDamage)}</p></section>
 <button type="button" class="world-raid-start428" data-world-start ${!connected||!supported||!state.available||state.remaining<=0||pending?'disabled':''}>${pending?'挑戦を確認中…':state.remaining<=0?'本日の挑戦は終了':'挑戦する（1回消費）'}</button>${pending?'<button type="button" data-world-retry>受付状況を再確認</button>':''}<button type="button" data-world-refresh>戦況を更新</button>`;
}
export function worldRaidBattleView428(state,presentation,{ending=false}={}){
 const a=state.attempt,raid=structuredClone(a.raid),room={...presentation.roomState,raid};
 if(a.campaignId===state.campaign.id){raid.boss.hp=Math.min(raid.boss.hp,state.campaign.hp);raid.progress.hp=raid.boss.hp;}
 if(ending)raid.phase='result';
 return `<div class="world-raid-battle-meta428"><b>今回 ${number(a.damage)} ダメージ</b><span>ラウンド ${number(raid.round)}／10</span></div>${worldRaidProgress428(state)}${renderSharedBattle({mode:'raid',room,battle:raid,selfId:presentation.selfId,title:raid.name,enemies:[raid.boss,...raid.minions],selectedTarget:presentation.selectedTarget.raid,selectedAlly:presentation.selectedAlly.raid,skillMenu:presentation.skillMenu.raid,itemMenu:presentation.itemMenu.raid,itemTargetMenu:presentation.itemTargetMenu.raid,hpTrails:presentation.hpTrails.raid,presentationKoIds:[...presentation.presentationKoIds.raid],autoSupported:true,readOnly:ending,biomePanelCollapsed:true})}<button type="button" data-world-retreat ${ending?'disabled':''}>この挑戦を中断する</button>`;
}
