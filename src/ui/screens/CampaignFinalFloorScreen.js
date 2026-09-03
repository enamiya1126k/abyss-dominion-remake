import{monsterVisual}from"../MonsterVisual.js?v=3.0.9-build309";
import{pixelIcon}from"../components/GameChrome.js?v=3.0.9-build309";

const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[character]);

function heroCard(hero){
 const savedRate=Number(hero.remainingHpRate),rate=Math.max(0,Math.min(1,Number.isFinite(savedRate)?savedRate:1)),roundedPercent=Math.round(rate*100),percent=rate>0?Math.max(1,roundedPercent):0,percentLabel=rate>0&&roundedPercent===0?"1%未満":`${percent}%`,defeated=hero.defeated===true||rate<=0;
 return`<article class="campaign-final-hero-card ${defeated?"is-defeated":percent<100?"is-wounded":""}" data-final-hero="${escapeHtml(hero.id)}">
  <small>${defeated?"途中撃退済み":"最終決戦へ引き継ぎ"}</small>
  <span class="campaign-final-hero-art">${monsterVisual({speciesId:hero.id,visualSpeciesId:hero.id},hero.name,{frame:defeated?"down":"idle",className:"campaign-final-floor-hero-visual"})}</span>
  <span class="campaign-final-hero-copy"><b>${escapeHtml(hero.name)}</b><span>${defeated?"勇者軍から離脱":percent<100?`道中の傷 ${100-percent}%`:"無傷で到着"}</span></span>
  <i class="campaign-final-hero-hp" style="--hero-hp:${percent}%"><i></i><em>残存HP ${percentLabel}</em></i>
 </article>`
}

export function CampaignFinalFloorScreen({heroes=[],party=[],rewindCount=0}={}){
 const remaining=heroes.filter(hero=>!hero.defeated&&Number(hero.remainingHpRate)>0),allRepelled=remaining.length===0;
 return`<section class="screen campaign-final-floor-screen" data-final-floor="castle-gate">
  <header class="campaign-final-floor-header">
   <div><small>予言10日目・最終決戦専用階層</small><h1>魔王城・正門</h1></div>
   <span class="campaign-final-floor-progress"><small>勇者軍・残存戦力</small><b>${remaining.length}/4人</b></span>
  </header>
  <main class="campaign-final-floor-stage">
   <header><small>THE LAST GATE</small><h2>${allRepelled?"静寂の城門":"勇者一行、到着"}</h2><p>${allRepelled?"四人はすでに道中で退けた。予言にはなかった結末が、扉の向こうで待つ。":"探索中に刻んだ傷と撃退の記録をそのまま引き継ぎ、残った勇者だけが最後の戦場へ立つ。"}</p></header>
   <section class="campaign-final-hero-grid" aria-label="勇者一行の状態">${heroes.map(heroCard).join("")}</section>
   <div class="campaign-final-floor-actions"><p><b>現在パーティ ${party.length}/4体</b><br>${party.map(monster=>escapeHtml(monster.name??monster.nickname??"魔物")).join("・")||"出撃中の仲間なし"}${rewindCount?`<br>巻き戻し ${Math.max(0,Number(rewindCount)||0)}回・道中の傷は保持`:""}</p><button type="button" data-final-floor-approach ${party.length===4||allRepelled?"":"disabled"}>${allRepelled?"静かな城門へ進む":`残り${remaining.length}人と決着`}</button></div>
  </main>
  <footer class="campaign-final-floor-footer"><p>ここは通常の101階ではありません。鍵・雑魚敵・通常報酬のない、勇者決戦だけの専用階層です。</p><nav><button type="button" data-final-floor-formation>${pixelIcon("formation")} 編成</button><button type="button" data-final-floor-return>${pixelIcon("home")} 戻る</button></nav></footer>
 </section>`
}
