import{CARD_BY_ID463,SPECIAL_BY_ID463}from'./Catalog463.js';
import{cardBody476,cardClass476,cardStyle476}from'./CardDesign476.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>Math.max(0,n??0).toLocaleString('ja-JP');
export function defenseImpact482(g,q,source,owner,actor){
 const ctx=q.context465??q.context464,mode=ctx?.mode477??source?.crystalMode477,held=owner?.crystals474??0;
 if(mode==='steal'){
  const amount=g.crystalRules480?held:Math.max(0,Math.min(held,Math.max(1,Math.floor((g.economy474?.fee??500)/5)),(g.economy474?.fee??500)*4-(actor?.crystals474??0)));
  return{headline:`💎 ${num(amount)} を奪われる`,detail:`対戦中の持ち金 ${num(held)} → ${num(held-amount)}`,reflect:g.crystalRules480?`反射成功で、相手の 💎${num(actor?.crystals474)} を奪う`:'略奪を相手へ跳ね返す'};
 }
 if(mode==='lose'||mode==='half'){const next=mode==='lose'?0:Math.floor(held/2);return{headline:`💎 ${num(held-next)} を失う`,detail:`対戦中の持ち金 ${num(held)} → ${num(next)}`};}
 return{headline:source?.summary466??source?.name??'相手の効果を受ける',detail:'防御すると、この効果を無効化できます'};
}
export function defenseChoice482(q,u,disabled,{g,source,owner,actor,art}){
 const options=q.options.filter(o=>o.value!=='accept'),selected=options.find(o=>o.value===u.choicePick465)??(options.length===1?options[0]:null),impact=defenseImpact482(g,q,source,owner,actor);
 const reflecting=selected?.value==='passive-reflect'||(selected&&!selected.value.startsWith('cost:')&&CARD_BY_ID463[selected.cardId]?.reflect);
 const ctx=q.context465??q.context464,canReflect=actor&&actor.playerId!==owner?.playerId&&!ctx?.reflected482&&ctx?.source482!=='instant'&&(!ctx?.tile||(ctx.mode477??source?.crystalMode477)==='steal');
 const outcome=selected?reflecting&&canReflect?(impact.reflect??'この攻撃を相手へ跳ね返す'):selected.value.startsWith('cost:')?'選んだ1枚を捨てて、この効果を回避':'この効果を無効化する':'カードをタップして選んでね';
 const action=selected?.value==='passive-reflect'?'ツンデレで跳ね返す':selected?.value.startsWith('cost:')?'捨てて回避':selected?'このカードで'+(reflecting&&canReflect?'反射':'防御'):'防御を確定';
 return`<div class="sg-defense-threat482"><small>${esc(actor&&actor.playerId!==owner?.playerId?actor.name+'からの攻撃':source?.name??'マスの効果')}</small><strong>${esc(impact.headline)}</strong><span>${esc(impact.detail)}</span></div>${source?.text?`<details class="sg-defense-details482"><summary>攻撃の詳細</summary><p>${esc(source.text)}</p></details>`:''}<div class="sg-defense-heading482"><b>守りの一手を選ぼう</b><small>${options.length===1?'選択済み · 下のボタンで確定':'カードを選んで、下のボタンで確定'}</small></div><div class="sg-defense-options477 sg-card-choices465 sg-defense-options482 ${options.length===1?'is-single':''}" data-sg-scroll="choices">${options.map(o=>{
  const special=o.special??(o.value==='passive-reflect'?'tsundere':null),card=special?SPECIAL_BY_ID463[special]:CARD_BY_ID463[o.cardId],picked=selected===o,cost=special?'手札は消費しない · 1手番に1回':o.value.startsWith('cost:')?'このカード1枚を捨てて回避':'使用すると、このカード1枚を消費';
  return`<div class="sg-choice-card465 ${picked?'is-picked':''}"><button class="sg-card ${cardClass476(card,!!special)}" style="${cardStyle476(card,!!special)}" data-sg-action="choicePick" data-value="${esc(o.value)}" aria-label="${esc(o.label)}を選ぶ" aria-pressed="${picked}" ${disabled?'disabled':''}>${cardBody476(card,art,{special:!!special})}</button><small class="sg-defense-cost482">${esc(cost)}</small><details class="sg-defense-details482"><summary>効果を確認</summary><p>${esc(card.text)}</p></details></div>`;
 }).join('')}</div><div class="sg-defense-actions477"><small role="status" aria-live="polite">${esc(outcome)}</small><button class="sg-accept477" data-sg-action="choice" data-value="accept" ${disabled?'disabled':''}>防御せず受ける</button><button class="sg-primary" data-sg-action="choice" data-value="${esc(selected?.value??'')}" ${disabled||!selected?'disabled':''}>${esc(action)}</button></div>`;
}
