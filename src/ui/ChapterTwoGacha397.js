import {CHAPTER_TWO_GACHA_RATES397,CHAPTER_TWO_GACHA_POOLS397,chapterTwoGachaUnlocked397} from '../chapterTwo/ChapterTwoGacha397.js?v=3.1.82-build402';
import {SPECIES} from '../data/species.js';
import {monsterVisual} from './MonsterVisual.js?v=3.1.82-build402';
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function chapterTwoGachaTabs397(state,active='normal'){
 if(!chapterTwoGachaUnlocked397(state))return '';
 return `<nav class="chapter397-gacha-tabs" aria-label="召喚の種類"><button type="button" data-gacha-tab397="normal" aria-current="${active==='normal'?'page':'false'}">通常・特別召喚</button><button type="button" data-gacha-tab397="chapterTwo" aria-current="${active==='chapterTwo'?'page':'false'}">第二章</button></nav>`;
}
export function chapterTwoGachaRates397(){
 return `<section class="chapter397-rates"><p>第二章限定の70体から、仲間1体を抽選します。各ランク10体・同ランク内は均等です。</p><table><thead><tr><th>ランク</th><th>合計</th><th>1体ごと</th></tr></thead><tbody>${Object.entries(CHAPTER_TWO_GACHA_RATES397).map(([rank,percent])=>`<tr><th>${rank}</th><td>${percent}%</td><td>${percent/10}%</td></tr>`).join('')}</tbody></table><p>単発も10連も、各回が同じ割合の独立抽選です。10連のレア保証・天井はありません。</p><p>通常召喚の保証カウントには影響しません。装備・第一章の魔物・勇者・深淵・十神は含まれません。</p>${Object.entries(CHAPTER_TWO_GACHA_POOLS397).map(([rank,ids])=>`<details><summary>${rank}・対象10体（各 ${CHAPTER_TWO_GACHA_RATES397[rank]/10}%）</summary><ul>${ids.map(id=>`<li>${esc(SPECIES[id].name)}</li>`).join('')}</ul></details>`).join('')}</section>`;
}
export function chapterTwoGachaBody397(state){
 const pair=ids=>ids.map(id=>`<figure>${monsterVisual({speciesId:id},SPECIES[id].name,{className:'chapter397-banner-sprite'})}<figcaption>${esc(SPECIES[id].name)}</figcaption></figure>`).join('');
 const crystals=Number(state.player?.crystals)||0;
 return `${chapterTwoGachaTabs397(state,'chapterTwo')}<section class="chapter397-gacha"><header><small>理の外に生きる者たち</small><h3>第二章・境界の召喚</h3><p>限定70体／全7ランク・仲間のみ</p></header><div class="chapter397-banner">${pair(['ch2_nemesia','ch2_everia','ch2_sephira','ch2_astrelle'])}</div><p class="chapter397-pair-copy">双子をそろえて、専用の連携を解き放とう。<br><small>画像は登場する仲間の一例です。ペアでの排出保証はありません。</small></p><div class="chapter397-wallet">所持魔晶石 <b>${crystals}</b></div><div class="chapter397-pulls"><button type="button" data-chapter397-pull="1" ${crystals<100?'disabled':''}><b>1回召喚</b><span>魔晶石 100個</span></button><button type="button" data-chapter397-pull="10" ${crystals<1000?'disabled':''}><b>10回召喚</b><span>魔晶石 1000個</span></button></div><p class="chapter397-gacha-note">神話1%・LR4%・UR15%<br>単発も10連も同じ割合／レア保証・天井なし</p><button type="button" class="chapter397-rates-button" data-chapter397-rates>提供割合・登場する70体を見る</button></section>`;
}
