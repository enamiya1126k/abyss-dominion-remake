import {chapterTwoProgress401} from '../chapterTwo/ChapterTwoProgress401.js?v=3.1.82-build402';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function chapterTwoHomeCard401(state){
 const m=chapterTwoProgress401(state);if(!m)return '';
 return `<header class="home-title-card home-chapter380 home-progress401" id="chapterTwoHome380" role="button" tabindex="0" aria-label="第二章の進行・次の目的を見る">
 <small>第二章${m.completed?' 読了':''} · 地域解放 ${m.cleared} / ${m.total}</small><h1>${esc(m.name)}</h1><p>${esc(m.title)}</p><span>進行・次の目的を見る ›</span></header>`;
}
export function chapterTwoProgressMarkup401(m){
 if(!m)return '';
 return `<div class="chapter-progress401">
  <div class="chapter-progress401-hero"><img src="assets/ui/home-skins400/${esc(m.skin)}-thumb.webp?v=3.1.80-build400" alt=""><div><small>CHAPTER II${m.completed?' · 読了':''}</small><h3>${esc(m.name)}</h3><p>理の外に生きる者たち</p></div></div>
  <section class="chapter-progress401-objective" aria-label="次の目的"><small>次の目的</small><h3>${esc(m.title)}</h3><p>${esc(m.detail)}</p>
   <button type="button" class="primary" data-chapter-progress-primary ${m.blocked?'disabled':''}>${esc(m.action.label)}</button>
   ${m.blocked?'<p class="chapter-progress401-blocked">戦闘・探索を終えてから出発できます。</p>':''}</section>
  <div class="chapter-progress401-count"><b>地域の歩み</b><span>${m.cleared} / ${m.total} 解放</span></div>
  <ol class="chapter-progress401-areas">${m.areas.map(a=>`<li class="${a.id===m.area?'is-current ':''}${a.unlocked?'':'is-locked'}">${a.unlocked?`<button type="button" data-chapter-progress-area="${a.id}" ${m.blocked?'disabled':''} ${a.id===m.area?'aria-current="step"':''}><span class="chapter-progress401-number">${a.cleared?'✓':a.id+1}</span><span><b>${esc(a.name)}</b><small>目安 Lv.${a.level.toLocaleString()}</small></span><em>${a.cleared?'踏破済み':a.run?'探索中':'出発可能'} ›</em></button>`:`<span class="chapter-progress401-locked"><span class="chapter-progress401-number">${a.id+1}</span><span><b>？？？</b><small>前の地域を踏破すると解放</small></span><em>未解放</em></span>`}</li>`).join('')}</ol>
  <button type="button" class="chapter-progress401-memory" data-chapter-progress-archive><span><b>第二章の物語を振り返る</b><small>記憶の間・予言録</small></span><strong>${m.read} / ${m.storyTotal} ›</strong></button>
 </div>`;
}
export function chapterTwoMemoryCard401(archive){
 if(!archive)return '';
 return `<button type="button" data-memory-room="chapterTwo"><span class="chapter-memory401-mark" aria-hidden="true">Ⅱ</span><div><small>CHAPTER II ARCHIVE</small><b>第二章の物語</b><em>理の外に生きる者たち</em></div><strong>${archive.read} / ${archive.total}</strong></button>`;
}
