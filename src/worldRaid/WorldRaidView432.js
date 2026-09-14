import{worldRaidRankingCard441}from"./WorldRaidRankingView429.js";
import {raidRoundLimit437} from './WorldRaidLimit437.js';
import {raidQuota435} from './WorldRaidQuota435.js';
import {escapeOnlineHtml as esc} from '../ui/screens/OnlinePartyScreen.js';
import {raidSpriteBase} from '../core/RaidPresentation.js';
import {Modal} from '../ui/components/Modal.js';
import {pixelIcon} from '../ui/components/GameChrome.js';
import {worldRaidOfflineView430} from './WorldRaidOfflineView430.js';
const n=value=>String(Math.max(0,Math.floor(Number(value)||0)));
export function raidFrame432(body,extra=''){return `<section class="raid-frame432 ${extra}">${body}</section>`;}
export function raidHeader432(status){return `<header class="raid-head432"><button data-world-back aria-label="ホームへ戻る">‹ ホーム</button><h1>共闘レイド</h1><small data-world-connection>${esc(status)}</small></header>`;}
export function raidSummary432(state){
 const c=state?.campaign;if(!c)return '';
 return `<div class="world-raid-hp428" role="progressbar" aria-label="全員共通のボスHP" aria-valuemin="0" aria-valuemax="${n(c.maxHp)}" aria-valuenow="${n(c.hp)}"><i style="width:${Math.min(100,Math.max(0,c.hp/Math.max(1,c.maxHp)*100))}%"></i><b>HP ${n(c.hp)} / ${n(c.maxHp)}</b></div>${c.circle432?.shield>0?`<div class="raid-shield432">障壁 ${n(c.circle432.shield)} / ${n(c.circle432.maxShield)}</div>`:''}`;
}
export function raidLobby432(client){
 const state=client.onlineState430??client.state,c=state?.campaign,bank=client.offline.bank(),tickets=client.offline.available(),connected=client.connected();
 if(!c)return raidFrame432(`<p>${connected?'ボスを確認中…':'接続待ち。オフライン用の挑戦があれば下から再開できます。'}</p><button data-world-refresh>更新</button>`)+`<details class="raid-offline432" open><summary>オフラインで遊ぶ</summary>${worldRaidOfflineView430(client.offline,state)}</details>`;
 const boss=c.boss,base=raidSpriteBase(boss.id),asset=base?`${base}-idle1.png`:boss.heroAsset;
 const rank=client.ranking429?.campaign?.id===c.id?client.ranking429:null,mine=rank?.mine;
 const rows=(rank?.page===0?rank.rows:[]).slice(0,3),remaining=state.remaining??0,materials=client.getState().onlineParty?.raidMaterials??0;
 const quota=raidQuota435(state,tickets,client.offline.time()),playable=tickets[0],disabled=connected?(!client.supported()||!state.available||remaining<=0||client.pending):!playable;
 const start=connected&&remaining>0?'data-world-start':playable?`data-world-ticket430="${esc(playable.ticket.id)}"`:'data-world-start';
 const canUseTicket=Boolean(playable)&&(!connected||remaining<=0);
 const buttonDisabled=canUseTicket?false:disabled;
 return `${client.error?`<p class="raid-message432" role="alert">${esc(client.error)}</p>`:''}
 ${raidFrame432(`<div class="raid-boss-stage432"><small>第${n(c.sequence)}戦</small><img src="${esc(asset)}" alt="${esc(boss.name)}"><h2>${esc(boss.name)}</h2></div>${raidSummary432(state)}<div class="raid-quota432"><span>今日の残り <b>${quota.fresh?`${n(quota.remaining)} / 3回`:`${quota.today}回 保存済み`}</b></span><small>${quota.fresh?"毎日0時に回復":"本日の枠は接続後に確認"}</small></div><button class="raid-challenge432" ${start} ${buttonDisabled?'disabled':''}>${client.pending?'受付を確認中…':canUseTicket?'保存した挑戦で遊ぶ':remaining<=0?'本日の挑戦は終了':'挑戦する'}</button>${tickets.length?`<small class="raid-ticket-count432">保存分：本日 ${quota.today}回${quota.older?` ＋ 前日分 ${quota.older}回`:""}</small>`:''}${client.pending?'<button data-world-retry>受付を再確認</button>':''}`,'raid-boss-panel432')}
 ${raidFrame432(`<header class="raid-section-head432"><h2>ダメージランキング</h2><button data-world-panel429="ranking">全順位 ›</button></header><div class="raid-ranking-list439 raid-lobby-ranking441">${rows.map(r=>worldRaidRankingCard441(r,{playerId:client.transport.selfId})).join('')||`<p class="raid-empty432">${rank?'まだ参加者はいません':connected?'順位を確認中…':'最後に取得した順位はありません'}</p>`}</div><div class="raid-mine432"><span>あなた <b>${mine?`${n(mine.rank)}位`:c.myRank?`${n(c.myRank)}位`:'—'}</b></span><strong>${n(mine?.damage??c.myDamage)} <small>ダメージ</small></strong></div>`)}
 <div class="raid-footer432"><button data-raid-exchange432>カケラ交換所 <b>${n(materials)}個 ›</b></button><button data-world-panel429="ranking">討伐報酬${client.transport.worldRaidRewards429?.pending?'・未受取あり':''} ›</button></div>
 <details class="raid-offline432" data-raid-details432="offline" ${client.details432?.offline?'open':''}><summary>オフラインで遊ぶ${tickets.length?`（${tickets.length}回分）`:''}</summary>${worldRaidOfflineView430(client.offline,state)}</details>
 <details class="raid-rules432" data-raid-details432="rules" ${client.details432?.rules?'open':''}><summary>遊び方</summary><p>1日3回、みんなで同じボスに挑戦。1回最大${n(state.rules?.maxRounds??99)}ラウンド。</p><p>ボスは6ラウンド目から攻撃。Lv100の子分2体は最初から行動します。</p><p>討伐後、参加・順位・最後の一撃の報酬を受け取れます。送信待ちの挑戦がある間は集計中になります。</p></details>`;
}
export function raidExchange432(state,catalog,prices,{bossId,pending=''}={}){
 const keys=Object.keys(catalog),id=keys.includes(bossId)?bossId:keys[0],boss=catalog[id],online=state.onlineParty??{},count=online.raidMaterials??0,used=online.raidExchange??{};
 const options=keys.map(key=>`<button data-raid-shop-boss432="${esc(key)}" aria-pressed="${key===id}">${esc(catalog[key].name.split('・')[0])}</button>`).join('');
 const rows=[['character','限定仲間',boss.contractName],['equipment','専用武器',boss.equipmentName],['circle','専用魔法陣',boss.circleName]].map(([kind,label,name])=>{
  const key=`${kind}:${id}`,done=kind!=='equipment'&&Number(used[key]??(id==='abyss-amalga'?used[kind]:0))>0;
  return `<article><div><small>${label}</small><h3>${esc(name)}</h3><p>${kind==='equipment'?'何度でも交換可能':'このボスにつき1回'}</p></div><button data-raid-buy432="${esc(key)}" ${done||pending||count<prices[kind]?'disabled':''}>${done?'交換済み':pending===key?'交換中…':`カケラ ${prices[kind]}個で交換`}</button></article>`;
 }).join('');
 return `<button data-raid-lobby432>‹ レイドへ戻る</button>${raidFrame432(`<header class="raid-section-head432"><h2>カケラ交換所</h2><strong>所持 ${n(count)}個</strong></header><nav class="raid-shop-tabs432">${options}</nav><div class="raid-shop-items432">${rows}</div>`,'raid-shop432')}`;
}
export function raidResult432(client){
 const a=client.state.attempt,report=a.report,rank=client.ranking429?.campaign?.id===a.campaignId?client.ranking429:null;

 const reward=rank?.myReward,received=reward&&(reward.acknowledgedAt!=null||client.getState().onlineParty?.worldRaidReceipts429?.[reward.rewardId]);
 const labels={victory:'討伐成功',sharedVictory:'討伐成功',limit:`${n(report?.rounds||raidRoundLimit437(a.raid))}ラウンド終了`,defeat:'挑戦終了',retreat:'挑戦を中断'};
 const local=client.localTicket430&&client.offline.bank().tickets[client.localTicket430],receipt=local?.receipt;
 const reflection=local?(receipt?.status==='accepted'?'ダメージを反映しました。':receipt?.status==='expired'?'期限切れのため、今回の結果は集計対象外です。':'結果を保存しました。接続後に自動送信します。'):'ダメージを反映しました。';
 const rewardStatus=reward?(received?'受取済み':'受取待ち'):rank?.campaign?.provisional430?'集計中':rank?.campaign?.completedAt&&!rank?.mine?'今回の討伐報酬はありません。':'討伐後に報酬が確定します。';
 const totals=reward?.reward,items=totals?[[null,'カケラ',totals.raidMaterials],['crystal','魔晶石',totals.crystals],['gold','GOLD',totals.gold],['growth','経験値パック（超）',totals.experienceItemsUltra]]:[];
 return Modal('戦闘結果',`<div class="raid-result437"><header class="raid-result-hero437"><small>${esc(report?.bossName??a.raid?.name)}</small><h2>${labels[report?.result]??'挑戦終了'}</h2>${report?.result!=="limit"?`<span>${n(report?.rounds??a.raid?.round)}ラウンド</span>`:""}<p>今回のボスへのダメージ<strong>${Number(report?.damage??a.damage??0).toLocaleString('ja-JP')}</strong></p></header>${client.contributionBody432?.(a.raid)??'<p>活躍記録はありません。</p>'}<small class="raid-result-note437">活躍表の与ダメージには取り巻きへの攻撃も含みます。</small><section class="raid-result-status437"><p>${reflection}</p><p><b>討伐報酬</b> ${rewardStatus}</p>${items.length?`<details><summary>報酬の内訳</summary>${items.map(([icon,label,amount])=>`<p>${icon?pixelIcon(icon):''} ${label} <b>×${n(amount)}</b></p>`).join('')}</details>`:''}<small>参加・順位・最後の一撃の報酬は、ボスごとに1度だけ受け取れます。</small></section></div>`,'レイドへ戻る');
}
