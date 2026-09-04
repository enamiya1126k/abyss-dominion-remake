const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character]));

function sceneCard(entry){
 const locked=!entry.available;return`<article class="story-archive-card ${locked?"is-locked":"is-read"}">
  <span class="story-archive-card-mark" aria-hidden="true"></span>
  <div class="story-archive-card-copy"><small>${locked?"UNRECORDED":"RECORDED"}</small><b>${locked?"？？？":escapeHtml(entry.title)}</b><em>${locked?"物語を進めると解放されます":escapeHtml(entry.subtitle)}</em></div>
  ${locked?'<span class="story-archive-lock" aria-label="未到達">？？？</span>':`<button type="button" data-story-archive-entry="${escapeHtml(entry.id)}">読む</button>`}
 </article>`
}

function branchCard(entry){
 return`<article class="story-archive-card story-archive-branch ${entry.available?"is-read":"is-locked"}">
  <span class="story-archive-card-mark" aria-hidden="true"></span>
  <div class="story-archive-card-copy"><small>${entry.available?"BRANCH STORY":"UNRECORDED"}</small><b>${entry.available?escapeHtml(entry.title):"？？？"}</b><em>${entry.available?escapeHtml(entry.subtitle):"物語を進めると解放されます"}</em></div>
  <div class="story-archive-variants" aria-label="結果分岐">${entry.variants.map((variant,index)=>variant.available?`<button type="button" data-story-archive-entry="${escapeHtml(entry.id)}" data-story-archive-outcome="${escapeHtml(variant.outcome)}"><small>分岐 ${index+1}</small><b>${escapeHtml(variant.label)}</b></button>`:`<span aria-label="未選択分岐"><small>分岐 ${index+1}</small><b>？？？</b></span>`).join("")}</div>
 </article>`
}

export function StoryArchiveScreen(model,{category="prologue"}={}){
 const categories=Array.isArray(model?.categories)?model.categories:[],active=categories.find(entry=>entry.id===category)??categories[0]??{id:"prologue",label:"序章",entries:[],read:0,total:0},progress=model?.total?Math.round(model.read/model.total*100):0;
 return`<section class="screen story-archive-screen" data-story-archive-category="${escapeHtml(active.id)}">
  <header class="story-archive-header">
   <button type="button" data-story-archive-back aria-label="ホームへ戻る"><i aria-hidden="true"></i></button>
   <span><small>PROPHECY ARCHIVE</small><h1>予言録・物語回想</h1><p>読了した物語だけを、進行に影響なく読み返せます。</p></span>
   <div class="story-archive-progress"><b>${model?.read??0}<small> / ${model?.total??0}</small></b><em>収録 ${progress}%</em></div>
  </header>
  <nav class="story-archive-tabs" aria-label="物語の分類">${categories.map(entry=>`<button type="button" data-story-archive-category-button="${escapeHtml(entry.id)}" class="${entry.id===active.id?"is-active":""}" aria-selected="${entry.id===active.id}"><small>${escapeHtml(entry.eyebrow)}</small><b>${escapeHtml(entry.label)}</b><em>${entry.read}/${entry.total}</em></button>`).join("")}</nav>
  <main class="story-archive-list">
   <div class="story-archive-section-title"><span><small>${escapeHtml(active.eyebrow)}</small><h2>${escapeHtml(active.label)}</h2></span><b>${active.read} / ${active.total} 読了</b></div>
   ${active.entries.length?active.entries.map(entry=>entry.type==="branch"?branchCard(entry):sceneCard(entry)).join(""):'<div class="story-archive-empty"><b>まだ記録はありません</b><p>物語を進めると、ここへ追加されます。</p></div>'}
  </main>
  <footer class="story-archive-footer"><i aria-hidden="true"></i><p>回想は閲覧専用です。階層・報酬・勇者遭遇・分岐結果は変化しません。</p></footer>
 </section>`
}
