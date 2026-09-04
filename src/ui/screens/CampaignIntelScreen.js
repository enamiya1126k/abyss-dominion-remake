const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character]));

function routePath(route){return route.map((entry,index)=>`${index?"L":"M"} ${entry.x} ${entry.y}`).join(" ")}

function mapPanel(model,selectedIndex){
 const route=model.route??[],selected=route[selectedIndex]??model.current??route[0],currentIndex=model.currentIndex??0,path=routePath(route);
 return`<section class="campaign-intel-map-panel" aria-label="勇者一行の進軍地図">
  <div class="campaign-world-map">
   <img class="campaign-world-map-image" src="./assets/world/campaign-invasion-map-build326.webp?v=3.1.7-build326" alt="" aria-hidden="true">
   <svg class="campaign-world-map-art" viewBox="0 0 100 80" role="img" aria-label="西の大陸から魔王城までの進軍経路">
    <defs>
     <filter id="campaignRouteGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.1" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <path class="campaign-route-shadow" d="${path}"/>
    <path class="campaign-route-line" d="${path}" filter="url(#campaignRouteGlow)"/>
   </svg>
   <span class="campaign-map-region west">西の大陸</span><span class="campaign-map-region demon">魔王領</span>
   ${route.map((entry,index)=>`<button type="button" class="campaign-route-node ${index<currentIndex?"is-past":index===currentIndex?"is-current":"is-future"} ${index===selectedIndex?"is-selected":""}" style="--map-x:${entry.x}%;--map-y:${entry.y/80*100}%" data-campaign-route-index="${index}" aria-label="${escapeHtml(entry.name)}${index===currentIndex?"・勇者一行の現在地":""}"><i></i><small>${entry.day?`${entry.day}日目`:"出発"}</small></button>`).join("")}
   <span class="campaign-map-party" style="--map-x:${model.current.x}%;--map-y:${model.current.y/80*100}%"><i aria-hidden="true"></i><b>勇者一行</b></span>
   <span class="campaign-map-castle"><i aria-hidden="true"></i><b>魔王城</b></span>
  </div>
  <article class="campaign-location-detail">
   <header><small>${selected.id===model.current.id?"CURRENT POSITION":selected.day?`ROUTE / DAY ${selected.day}`:"DEPARTURE POINT"}</small><b>${escapeHtml(selected.name)}</b>${selected.id===model.current.id?'<em>現在地</em>':""}</header>
   <p>${escapeHtml(selected.detail)}</p>
   <div><span><small>勇者侵攻</small><b>${model.progress}%</b></span><span><small>${model.completed?"予言の結果":"魔王城まで"}</small><b>${model.completed?"到達済み":`残り${model.remainingDays}日`}</b></span><span><small>次の地点</small><b>${model.completed?"決着":escapeHtml(model.next.shortName)}</b></span></div>
  </article>
  <div class="campaign-route-strip" aria-label="進軍経路一覧">${route.map((entry,index)=>`<button type="button" data-campaign-route-index="${index}" class="${index===selectedIndex?"is-selected":""} ${index===currentIndex?"is-current":""}"><small>${entry.day?`${entry.day}日目`:"出発"}</small><b>${escapeHtml(entry.shortName)}</b></button>`).join("")}</div>
 </section>`
}

function heroPanel(model){
 const heroes=model.heroes??[];
 return`<section class="campaign-hero-intel-panel" aria-label="勇者一行の攻略情報">
  <header><small>ROYAL HERO PARTY</small><h2>勇者一行・観測記録</h2><p>迷宮内での追跡傾向と戦闘特性。遭遇後の傷も十日目まで記録されます。</p></header>
  <div class="campaign-hero-intel-grid">${heroes.map((hero,index)=>`<details class="campaign-hero-card ${hero.status==="撃退済み"?"is-defeated":hero.status==="遭遇済み"?"is-met":"is-unknown"}" ${index===0?"open":""}>
   <summary><span class="campaign-hero-sigil" aria-hidden="true">${index+1}</span><span><small>${escapeHtml(hero.title)}</small><b>${escapeHtml(hero.name)}</b><em>${escapeHtml(hero.role)}</em></span><strong>${escapeHtml(hero.status)}<i></i></strong></summary>
   <div class="campaign-hero-card-body">
    <div class="campaign-hero-vital"><span><small>予言上の残存HP</small><b>${hero.remainingHpPercent}%</b></span><i style="--hero-hp:${hero.remainingHpPercent}%"><em></em></i><small>${hero.encounters?`遭遇 ${hero.encounters}回・傷 ${hero.woundPercent}%`:"まだ直接の戦闘記録なし"}</small></div>
    <dl><div><dt>追跡</dt><dd>${escapeHtml(hero.field)}</dd></div><div><dt>戦闘</dt><dd>${escapeHtml(hero.combat)}</dd></div><div class="campaign-hero-counter"><dt>対策</dt><dd>${escapeHtml(hero.counter)}</dd></div></dl>
   </div>
  </details>`).join("")}</div>
 </section>`
}

export function CampaignIntelScreen(model,{tab="map",selectedLocationIndex=null}={}){
 const activeTab=tab==="heroes"?"heroes":"map",currentIndex=Math.max(0,Number(model?.currentIndex)||0),selectedIndex=selectedLocationIndex==null?currentIndex:Math.max(0,Math.min((model?.route?.length??1)-1,Number(selectedLocationIndex)||0));
 return`<section class="screen campaign-intel-screen" data-campaign-intel-tab="${activeTab}">
  <header class="campaign-intel-header">
   <button type="button" data-campaign-intel-back aria-label="ホームへ戻る"><i aria-hidden="true"></i></button>
   <span><small>INVASION OBSERVATORY</small><h1>予言・勇者侵攻情報</h1><p>${escapeHtml(model?.partyStatus??"魔王城へ進軍中")}・予言 ${model?.day??1}/10</p></span>
   <div><small>侵攻度</small><b>${model?.progress??0}<em>%</em></b></div>
  </header>
  <nav class="campaign-intel-tabs" aria-label="侵攻情報の分類"><button type="button" data-campaign-intel-tab-button="map" class="${activeTab==="map"?"is-active":""}" aria-selected="${activeTab==="map"}"><small>WORLD ROUTE</small><b>進軍マップ</b></button><button type="button" data-campaign-intel-tab-button="heroes" class="${activeTab==="heroes"?"is-active":""}" aria-selected="${activeTab==="heroes"}"><small>TACTICAL FILE</small><b>勇者の特性・対策</b></button></nav>
  <main class="campaign-intel-content">${activeTab==="map"?mapPanel(model,selectedIndex):heroPanel(model)}</main>
  <footer class="campaign-intel-footer"><i aria-hidden="true"></i><p>閲覧専用です。この画面では階層・報酬・進軍度・遭遇抽選は変化しません。</p></footer>
 </section>`
}
