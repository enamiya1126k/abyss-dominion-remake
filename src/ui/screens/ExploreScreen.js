import{APP_VERSION}from"../../core/config.js?v=3.0.5-build305";
import{calculatedStats,displayName}from"../../models/Monster.js?v=3.0.5-build305";
import{maxMp}from"../../battle/SkillSystem.js?v=3.0.5-build305";
import{biomeForFloor}from"../../data/biomes.js?v=2.11.0-build164";
import{dungeonThemeForFloor,dungeonThemeForAttribute}from"../../data/dungeonThemes.js?v=3.0.5-build305";
import{worldPresentationForFloor}from"../../core/WorldSystem.js?v=3.0.5-build305";
import{partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=3.0.5-build305";
import{manualReturnPreview}from"../../core/ReturnRewardSystem.js?v=3.0.5-build305";
import{monsterVisual}from"../MonsterVisual.js?v=3.0.5-build305";
import{SPECIES}from"../../data/species.js?v=2.11.82-build258";
import{resourceHud,pixelIcon}from"../components/GameChrome.js?v=3.0.5-build305";
import{attributeVisual}from"../components/AttributeVisual.js?v=2.11.0-build164";
import{CAMPAIGN_KEYS_PER_FLOOR,campaignDayDefinition,campaignFloorState,campaignKeysHeld,campaignRegionProgress,campaignRoomProfile}from"../../core/Campaign100System.js?v=3.0.5-build305";

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
 const floor=Math.max(1,Number(options.floor??state.player.currentFloor)||1),combatPower=options.combatPower??partyCombatPower(state),run=options.run??manualReturnPreview(state),biome=biomeForFloor(floor),world=worldPresentationForFloor(floor),savedAttribute=options.currentAttribute??state.expeditionSnapshot?.world?.currentAttribute??null,roomProfile=campaignRoomProfile(savedAttribute),scenery=savedAttribute?dungeonThemeForAttribute(savedAttribute,floor):dungeonThemeForFloor(floor);
 const day=campaignDayDefinition(floor),regionProgress=campaignRegionProgress(state,floor),progress=regionProgress.percent,floorState=campaignFloorState(state,floor),keys=Math.max(0,Math.min(CAMPAIGN_KEYS_PER_FLOOR,Number(options.campaignKeys??campaignKeysHeld(floorState))||0));
 const party=options.party??(state.party??[]).map(id=>state.monsters.find(monster=>monster.id===id)).filter(Boolean),hudCollapsed=Boolean(options.hudCollapsed??state.settings?.explorePartyHudCollapsed),autoMode=state.settings?.exploreAutoMode??"off",autoActive=autoMode!=="off",online=Boolean(options.online);
 const partyHtml=options.partyHtml??party.map(partyCard).join(""),stageContent=options.stageContentHtml??'<canvas id="gameCanvas"></canvas>',stageTools=options.stageToolsHtml??`<button type="button" id="miniMapToggle" class="minimap-toggle">${pixelIcon("event")}<b>ミニマップ</b></button>`,autoToggle=options.autoToggleHtml??(online?"":`<button type="button" id="exploreAutoToggle" class="explore-auto-toggle ${autoActive?"active":""}" data-explore-auto-toggle data-state="${autoActive?"on":"off"}" aria-pressed="${autoActive}" aria-label="自動攻略を${autoActive?"停止":"開始"}">${pixelIcon("formation")}<span><b>自動攻略</b><small data-explore-auto-state>${autoActive?"ON":"OFF"}</small></span></button>`),miniMap=options.miniMapHtml??'<canvas id="miniMap" role="img" aria-label="ミニマップ：現在の区画形状と接続を表示"></canvas>',nav=options.navHtml??`<button id="pauseParty"><i>${pixelIcon("formation")}</i>編成</button><button id="fieldEquipment"><i>${pixelIcon("equipment")}</i>装備</button><button id="pauseItems"><i>${pixelIcon("growth")}</i>持ち物</button><button id="centerCamera"><i>${pixelIcon("event")}</i>現在地</button><button id="returnHome" class="danger"><i>${pixelIcon("rest")}</i>帰還</button>`;
 return`<section class="screen explore-screen explore-screen-dungeon world-${world.id} scenery-${scenery.id} ${hudCollapsed?"party-hud-collapsed":""} ${online?"online-shared-explore":""} ${options.className??""}" ${online?'data-online-explore-view="shared"':""} data-biome="${biome.theme}" data-scenery="${scenery.id}" data-scenery-variant="${scenery.variant}" data-world="${world.id}" data-music-profile="${world.musicProfile}" style="--biome-accent:${world.phase===1?world.accent:biome.accent};--scenery-accent:${scenery.accent};--scenery-dark:${scenery.minimapWall}">
  ${resourceHud(state,{title:options.title??`予言${day.day}日目・${floor}階`,settings:false,showFloor:false})}
  <div class="explore-command-header"><div id="exploreCombatPower" class="explore-power-record" data-power="${combatPower}"><span><small>PARTY COMBAT POWER</small><strong data-combat-power-value title="${combatPower.toLocaleString()}">${formatCombatPower(combatPower)}</strong></span><em data-combat-power-delta hidden></em></div><div class="explore-biome-card"><span class="explore-biome-icon">${pixelIcon(world.phase===1?"event":"dungeon")}</span><div><b>${world.phase===1?`${world.subtitle} ${world.name}`:biome.name}</b><small>第${day.day}区間 ${regionProgress.from}〜${regionProgress.to}階・攻略 ${regionProgress.cleared}/${regionProgress.total}</small><i><em style="width:${progress}%"></em></i></div></div><button type="button" id="resourceHelp" class="resource-help" aria-label="ダンジョンガイド">?</button></div>
  <section class="explore-party-hud"><button type="button" ${online?'data-online-party-hud-toggle': 'id="toggleExplorePartyHud"'} class="explore-party-collapse" aria-expanded="${hudCollapsed?"false":"true"}"><span>${hudCollapsed?"部隊状況を開く":"部隊状況を閉じる"}</span><b>${hudCollapsed?"⌄":"⌃"}</b></button><div class="explore-party-strip">${partyHtml}</div></section>
  <div class="explore-stage">${stageContent}<span class="campaign-key-counter" data-campaign-key-counter><small>戦利品の鍵</small><span class="campaign-key-locks">${Array.from({length:CAMPAIGN_KEYS_PER_FLOOR},(_,index)=>`<i data-key-lock class="${index<keys?"acquired":""}">⚿</i>`).join("")}</span><b>${keys}/${CAMPAIGN_KEYS_PER_FLOOR}</b></span><span class="explore-scenery-badge" data-section-scenery aria-label="現在の区画 ${roomProfile.name}属性 ${scenery.name}"><i data-section-attribute-logo>${attributeVisual(roomProfile.logoAttribute,{label:`${roomProfile.name}属性`})}</i><span><small>現在の属性ダンジョン</small><b data-section-attribute-name>${roomProfile.name}属性区画</b><em data-section-theme-name>${scenery.name}</em></span></span>
   <aside class="explore-stage-tools">${stageTools}</aside>${autoToggle}
   ${miniMap}<div class="explore-run-clock"><b>${online?"共闘中…":"探索中…"}</b><span data-explore-elapsed data-started-at="${run.startedAt??Date.now()}">${runTime(run.startedAt)}</span></div></div>
  <nav class="explore-nav">${nav}</nav><small class="explore-version">v${APP_VERSION}</small>
 </section>`;
}
