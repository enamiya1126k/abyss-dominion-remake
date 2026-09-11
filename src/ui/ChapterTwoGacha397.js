import {CHAPTER_TWO_GACHA_RATES397,CHAPTER_TWO_GACHA_POOLS397,chapterTwoGachaUnlocked397} from '../chapterTwo/ChapterTwoGacha397.js?v=3.1.82-build402';
import {SPECIES} from '../data/species.js?v=3.1.86-build406';
import {monsterVisual} from './MonsterVisual.js?v=3.1.82-build402';
import {pixelIcon} from './components/GameChrome.js?v=3.1.1-build311';
import {chapterTwoPairMember406} from '../data/chapterTwoPairNames406.js?v=3.1.86-build406';
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function chapterTwoGachaTabs397(state,active='normal'){
 if(!chapterTwoGachaUnlocked397(state))return '';
 return `<nav class="chapter397-gacha-tabs" aria-label="召喚の種類"><button type="button" data-gacha-tab397="normal" aria-current="${active==='normal'?'page':'false'}">通常・特別召喚</button><button type="button" data-gacha-tab397="chapterTwo" aria-current="${active==='chapterTwo'?'page':'false'}">第二章</button></nav>`;
}
export function chapterTwoGachaRates397(){
 return `<section class="chapter397-rates"><p>第二章限定の70体から、仲間1体を抽選します。各ランク10体・同ランク内は均等です。</p><table><thead><tr><th>ランク</th><th>合計</th><th>1体ごと</th></tr></thead><tbody>${Object.entries(CHAPTER_TWO_GACHA_RATES397).map(([rank,percent])=>`<tr><th>${rank}</th><td>${percent}%</td><td>${percent/10}%</td></tr>`).join('')}</tbody></table><p>単発も10連も、各回が同じ割合の独立抽選です。10連のレア保証・天井はありません。</p><p>通常召喚の保証カウントには影響しません。装備・第一章の魔物・勇者・深淵・十神は含まれません。</p><p>同じ【共通名】の2体がペアです。相方は下の一覧で確認できます。</p>${Object.entries(CHAPTER_TWO_GACHA_POOLS397).map(([rank,ids])=>`<details><summary>${rank}・対象10体（各 ${CHAPTER_TWO_GACHA_RATES397[rank]/10}%）</summary><ul>${ids.map(id=>{const member=chapterTwoPairMember406(id);return `<li data-summon-species406="${id}"><b>${esc(SPECIES[id].name)}</b>${member?`<small>相方：${esc(member.partner.name)}</small>`:''}</li>`;}).join('')}</ul></details>`).join('')}</section>`;
}
function featuredPair406(id){
 const member=chapterTwoPairMember406(id),ids=[id,member.partner.id];
 return `<section class="chapter406-featured-pair" aria-label="${esc(member.group)}のペア"><div class="chapter406-pair-members">${ids.map(id=>`<figure>${monsterVisual({speciesId:id},SPECIES[id].name,{className:'chapter397-banner-sprite'})}<figcaption>${esc(SPECIES[id].name)}</figcaption></figure>`).join('')}</div><small>【${esc(member.group)}】の2体で共鳴</small></section>`;
}
export function chapterTwoGachaBody397(state){
 const crystals=Math.max(0,Number(state.player?.crystals)||0);
 return `${chapterTwoGachaTabs397(state,'chapterTwo')}<div class="gacha-festival-v3 chapter406-summon">
  <div class="gacha-v2-wallet"><span>所持魔晶石</span><b>${pixelIcon('crystal')}${crystals}</b><button type="button" class="rarity-help" data-gacha-rarity406 aria-label="レア度一覧">？</button></div>
  <div class="gacha-campaign-carousel chapter406-banner-frame"><article class="gacha-campaign-slide chapter406-summon-banner">
   <header><small>第二章限定</small><h3>境界の召喚</h3><p>限定70体／全7ランク・仲間のみ</p></header>
   <div class="chapter406-featured-pairs">${featuredPair406('ch2_nemesia')}${featuredPair406('ch2_sephira')}</div>
   <p class="chapter406-pair-note">同じ【共通名】の2体を編成して、ペア共鳴を発動。<small>登場する仲間の一例です。ペアでの排出保証はありません。</small></p>
  </article></div>
  <section class="gacha-category-section chapter406-pull-section"><div class="spread"><h3>召喚を選ぶ</h3><button type="button" data-chapter397-rates>提供割合・登場する仲間</button></div>
   <div class="chapter397-pulls"><button type="button" data-chapter397-pull="1" ${crystals<100?'disabled':''}><b>1回召喚</b><span>魔晶石 100個</span></button><button type="button" data-chapter397-pull="10" ${crystals<1000?'disabled':''}><b>10回召喚</b><span>魔晶石 1000個</span></button></div>
  </section>
  <p class="chapter397-gacha-note">神話1%・LR4%・UR15%<br>単発も10連も同じ割合／レア保証・天井なし</p>
 </div>`;
}
