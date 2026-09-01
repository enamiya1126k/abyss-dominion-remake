import{APP_VERSION}from"../../core/config.js?v=2.11.39-build204";
import{calculatedStats,displayName}from"../../models/Monster.js?v=2.11.82-build258";
import{maxMp}from"../../battle/SkillSystem.js?v=2.11.83-build259";
import{biomeForFloor,biomeProgress}from"../../data/biomes.js?v=2.11.0-build164";
import{dungeonThemeForFloor}from"../../data/dungeonThemes.js?v=2.11.0-build164";
import{worldPresentationForFloor}from"../../core/WorldSystem.js?v=2.11.82-build258";
import{partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=2.11.82-build258";
import{manualReturnPreview}from"../../core/ReturnRewardSystem.js?v=2.11.0-build164";
import{monsterVisual}from"../MonsterVisual.js?v=2.11.82-build258";
import{SPECIES}from"../../data/species.js?v=2.11.82-build258";
import{resourceHud,pixelIcon}from"../components/GameChrome.js?v=2.11.0-build164";
import{attributeVisual}from"../components/AttributeVisual.js?v=2.11.0-build164";

const RARITY_TONE={N:"n",R:"r",SR:"sr",SSR:"ssr",UR:"ur",LR:"lr","神話":"mythic","深淵":"abyss","十神":"ten-god"};
function runTime(startedAt){
 const elapsed=Math.max(0,Date.now()-(Number(startedAt)||Date.now()));
 const hours=Math.floor(elapsed/3600000),minutes=Math.floor(elapsed/60000)%60,seconds=Math.floor(elapsed/1000)%60;
 return`${hours?`${String(hours).padStart(2,"0")}:`:""}${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}
function partyCard(monster,index){
 const stats=monster?.onlineStats??calculatedStats(monster),hp=Math.max(0,monster.currentHp??stats.hp),mpMax=Math.max(0,Number(monster?.onlineMaxMp??maxMp(monster))||0),mp=Math.max(0,monster.currentMp??mpMax),species=SPECIES[monster.speciesId]??{};
 const name=displayName(monster),attribute=monster.attribute??species.element??"neutral",rarity=monster.summonTier??monster.summonRarity??species.rarity??"N";
 return`<button type="button" data-explore-monster="${monster.id}" data-explore-hud-id="${monster.id}" class="${name.length>=9?"long-name":""}" aria-label="${name}の装備画面を開く">
  <span class="explore-slot-badge">${index+1}</span><span class="explore-party-portrait">${monsterVisual(monster,species.emoji??"MONSTER",{className:"explore-party-monster-visual"})}</span>
  <div class="explore-party-copy"><div class="explore-party-name"><b class="rarity-name-${RARITY_TONE[rarity]??"n"}">${name}</b>${attributeVisual(attribute,{label:`${attribute}属性`})}</div>
   <i class="hud-bar hp"><span data-hud-hp-fill style="width:${Math.min(100,hp/Math.max(1,stats.hp)*100)}%"></span><small data-hud-hp-label>HP ${Math.round(hp).toLocaleString()} / ${stats.hp.toLocaleString()}</small></i>
   <i class="hud-bar mp"><span data-hud-mp-fill style="width:${Math.min(100,mp/Math.max(1,mpMax)*100)}%"></span><small data-hud-mp-label>MP ${Math.round(mp).toLocaleString()} / ${mpMax.toLocaleString()}</small></i>
  </div></button>`;
}

export function ExploreScreen(state,options={}){
 const floor=Math.max(1,Number(options.floor??state.player.currentFloor)||1),combatPower=options.combatPower??partyCombatPower(state),run=options.run??manualReturnPreview(state),biome=biomeForFloor(floor),progress=options.progress??biomeProgress(state,biome),world=worldPresentationForFloor(floor),scenery=dungeonThemeForFloor(floor);
 const party=options.party??(state.party??[]).map(id=>state.monsters.find(monster=>monster.id===id)).filter(Boolean),hudCollapsed=Boolean(options.hudCollapsed??state.settings?.explorePartyHudCollapsed),autoMode=state.settings?.exploreAutoMode??"off",autoMenuOpen=Boolean(state.settings?.exploreAutoMenuOpen),online=Boolean(options.online);
 const partyHtml=options.partyHtml??party.map(partyCard).join(""),stageContent=options.stageContentHtml??'<canvas id="gameCanvas"></canvas>',stageTools=options.stageToolsHtml??`<button type="button" id="miniMapToggle" class="minimap-toggle">${pixelIcon("event")}<b>ミニマップ</b></button><details class="explore-auto-controller" ${autoMenuOpen?"open":""}><summary>${pixelIcon("formation")}<b>${autoMode==="off"?"自動探索":"自動探索中"}</b></summary><div><button type="button" data-explore-auto-mode="floor" class="${autoMode==="floor"?"active":""}"><b>階層攻略</b><small>出口まで最短</small></button><button type="button" data-explore-auto-mode="items" class="${autoMode==="items"?"active":""}"><b>回収優先</b><small>宝箱・資源を巡回</small></button><button type="button" data-explore-auto-mode="exp" class="${autoMode==="exp"?"active":""}"><b>経験値優先</b><small>敵を探して進む</small></button><button type="button" data-explore-auto-mode="off" class="danger"><b>自動停止</b></button></div></details>`,miniMap=options.miniMapHtml??'<canvas id="miniMap"></canvas>',nav=options.navHtml??`<button id="pauseParty"><i>${pixelIcon("formation")}</i>編成</button><button id="fieldEquipment"><i>${pixelIcon("equipment")}</i>装備</button><button id="pauseItems"><i>${pixelIcon("growth")}</i>持ち物</button><button id="centerCamera"><i>${pixelIcon("event")}</i>現在地</button><button id="returnHome" class="danger"><i>${pixelIcon("rest")}</i>帰還</button>`;
 return`<section class="screen explore-screen explore-screen-dungeon world-${world.id} scenery-${scenery.id} ${hudCollapsed?"party-hud-collapsed":""} ${online?"online-shared-explore":""} ${options.className??""}" ${online?'data-online-explore-view="shared"':""} data-biome="${biome.theme}" data-scenery="${scenery.id}" data-scenery-variant="${scenery.variant}" data-world="${world.id}" data-music-profile="${world.musicProfile}" style="--biome-accent:${world.phase===1?world.accent:biome.accent};--scenery-accent:${scenery.accent};--scenery-dark:${scenery.minimapWall}">
  ${resourceHud(state,{title:options.title??`探索・${floor}階`,settings:false,showFloor:false})}
  <div class="explore-command-header"><div id="exploreCombatPower" class="explore-power-record" data-power="${combatPower}"><span><small>PARTY COMBAT POWER</small><strong data-combat-power-value title="${combatPower.toLocaleString()}">${formatCombatPower(combatPower)}</strong></span><em data-combat-power-delta hidden></em></div><div class="explore-biome-card"><span class="explore-biome-icon">${pixelIcon(world.phase===1?"event":"dungeon")}</span><div><b>${world.phase===1?`${world.subtitle} ${world.name}`:biome.name}</b><small>${biome.from}〜${biome.to}階・探索率 ${progress}%・${scenery.name}</small><i><em style="width:${progress}%"></em></i></div></div><button type="button" id="resourceHelp" class="resource-help" aria-label="ダンジョンガイド">?</button></div>
  <section class="explore-party-hud"><button type="button" ${online?'data-online-party-hud-toggle': 'id="toggleExplorePartyHud"'} class="explore-party-collapse" aria-expanded="${hudCollapsed?"false":"true"}"><span>${hudCollapsed?"部隊状況を開く":"部隊状況を閉じる"}</span><b>${hudCollapsed?"⌄":"⌃"}</b></button><div class="explore-party-strip">${partyHtml}</div></section>
  <div class="explore-stage">${stageContent}<span class="explore-floor-plate">${floor}階</span><span class="explore-scenery-badge" aria-label="現在の景観 ${scenery.name} ${scenery.variantName}"><i></i><span><small>ENVIRONMENT</small><b>${scenery.name}</b><em>${scenery.variantName}</em></span></span>
   <aside class="explore-stage-tools">${stageTools}</aside>
   ${miniMap}<div class="explore-run-clock"><b>${online?"共闘中…":"探索中…"}</b><span data-explore-elapsed data-started-at="${run.startedAt??Date.now()}">${runTime(run.startedAt)}</span></div></div>
  <nav class="explore-nav">${nav}</nav><small class="explore-version">v${APP_VERSION}</small>
 </section>`;
}
