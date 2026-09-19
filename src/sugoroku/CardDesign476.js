import{rankStyle466,SPECIAL_SHORT466}from'./CardRanks466.js';
import{photoCardArt468}from'./PhotoArt468.js';
import{ATTRS463}from'./Board463.js';
import{CARD_CODES475}from'./CardCodes475.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const isDark476=c=>c.kind==='bad'||c.kind==='curse'||c.set==='dark';
export function cardClass476(c,special=false){return `sg-tcg476 sg-tier476-${special?9:c.rankIndex466??0}${special?' sg-premium476':isDark476(c)?' sg-dark476':''}`}
export function cardStyle476(c,special=false){return special?'--card-accent:#98f5e6;--rank-face:#173e4a':rankStyle466(c)}
const ornaments476=`<span class="sg-ornaments476" aria-hidden="true">${[0,1,2,3].map(i=>`<svg class="sg-corner476 corner-${i}" viewBox="0 0 40 40" fill="none"><path d="M2 38V2h36M6 30V6h24M10 23V10h13M3 14l11-11M8 8l7 2-5 5z" stroke="currentColor"/><path d="M3 3h5L5 8zM19 5l3 3-3 3-3-3zM5 19l3-3 3 3-3 3z" fill="currentColor"/></svg>`).join('')}</span>`;
const skull476='<svg class="sg-sigil476" viewBox="0 0 40 40" aria-hidden="true"><path d="M9 12 5 3l12 5h6l12-5-4 9c3 5 3 13-1 17l-5 2v5H15v-5l-5-2c-4-4-4-12-1-17Z" fill="#240d24" stroke="currentColor" stroke-width="2"/><path d="m11 16 7 3-2 5-5-2zm18 0-7 3 2 5 5-2zM20 23l-3 5h6z" fill="currentColor"/></svg>';
const seal476='<svg class="sg-seal476" viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor"><path d="m20 2 5 12 13 6-13 6-5 12-5-12L2 20l13-6Z"/><circle cx="20" cy="20" r="11"/><path d="m20 9 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="currentColor"/></svg>';
export function cardBody476(c,art,{special=false,state='',usable=false}={}){
 const dark=!special&&isDark476(c),rank=special?'覚醒':c.rank466??'N',code=CARD_CODES475[(special?'special:':'basic:')+c.id]??'';
 const category=special?'特殊カード':dark?(c.kind==='curse'?'呪い':c.set?'闇の切り札':'闇の速攻'):c.category469??'基本';
 const timing=special?'公開の覚醒能力':({pre:'自分の移動前',reaction:'攻撃を受けた時',instant:'引くと発動',passive:'所持中に有効',set:'4種類で発動'})[c.timing]??'';
 const summary=special?SPECIAL_SHORT466[c.id]??c.text:c.summary466??c.text;
 return `${ornaments476}<strong class="sg-title476">${esc(c.name)}</strong><span class="sg-tcg-top476"><b class="sg-gem476">${esc(rank)}</b><small>${esc(code)}</small></span><span class="sg-frame-art476">${special?art(c.art):photoCardArt468(c,art)}${dark?skull476:special?seal476:''}<span class="sg-art-label476">${esc(category)}</span></span><span class="sg-paper476"><span class="sg-card-caption">${esc(summary)}</span><small>${esc(timing)}</small></span><span class="sg-tcg-footer476"><span class="sg-affinities476">${special?'✦ 覚醒能力':c.attrs?.length?c.attrs.map(id=>{const a=ATTRS463.find(x=>x.id===id);return `<i style="--attr476:${a?.color??'#d5c094'}">${esc(a?.name??id)}</i>`}).join(''):'<i>無属性</i>'}</span><span class="sg-foil476" aria-hidden="true">${special?'✦':dark?'☾':(c.rankIndex466??0)>=6?'✧':'◆'}</span></span>${state?`<span class="sg-card-state464">${usable?'✦ ':''}${esc(state)}</span>`:''}`;
}
