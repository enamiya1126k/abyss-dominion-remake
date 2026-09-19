import{SPECIAL_BY_ID463}from'./Catalog463.js';
import{SPECIAL_SHORT466}from'./CardRanks466.js';
import{specialCard470,specialDeck470,specialBack470}from'./Readability470.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// The roster and authoritative choice must use the same endgame identity.
export const pawnChoice473=m=>({...m,speciesId:m.raceSpeciesId??m.speciesId});
export function abilityPresentation473(e,art,height,source,actor){
 const s=SPECIAL_BY_ID463[e.specialId466];if(!s)return'';
 const awake=e.kind==='awaken',small=height<340,portraitH=Math.max(58,Math.min(242,height-(small?44:124))),scale=portraitH/242,w=166*scale;
 const portrait=`<div class="sg-special-frame473" style="--card-scale473:${scale};width:${w}px;height:${portraitH}px">${specialCard470(s.id,art)}</div>`;
 return`<div class="sg-ability473 ${small?'is-compact473':''} ${awake?'is-awaken473':'is-deal473'}"><div class="sg-ability-title473"><small>${esc(awake?actor+'の力が目覚める':source+' · 特殊カード獲得')}</small><b>${awake?'覚 醒':'覚醒の山札'}</b></div><div class="sg-ability-body473"><div class="sg-ability-display473" style="--portrait-w473:${w}px;--portrait-h473:${portraitH}px">${awake?`<div class="sg-ability-aura473" aria-hidden="true"></div>${portrait}`:`${specialDeck470()}<div class="sg-ability-fly473" style="width:${w}px;height:${portraitH}px"><div class="sg-special-flipper470">${specialBack470()}<div class="sg-special-front470">${portrait}</div></div></div>`}</div><div class="sg-ability-copy473"><span>${awake?'✦ 新しい覚醒能力':'特殊カード · 公開'}</span><h2>${esc(s.name)}</h2><p>${esc(SPECIAL_SHORT466[s.id]??s.text)}</p><small>${awake?'上の特殊カードから効果を確認':e.replacing470?'残す特殊カードを、このあと選択':'このあと覚醒！'}</small></div></div></div>`;
}
