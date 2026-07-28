import{APP_VERSION}from"../../core/config.js?v=1.14.0-alpha124";
import{calculatedStats,displayName}from"../../models/Monster.js?v=1.14.0-alpha124";
import{maxMp}from"../../battle/SkillSystem.js?v=1.14.0-alpha124";
import{biomeForFloor,biomeProgress}from"../../data/biomes.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{worldPresentationForFloor}from"../../core/WorldSystem.js?v=1.0.0";
import{partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=1.14.0-alpha124";
import{manualReturnPreview}from"../../core/ReturnRewardSystem.js?v=1.14.0-alpha124";
import{monsterVisual}from"../MonsterVisual.js?v=1.9.1-endgame-sprites";
import{SPECIES}from"../../data/species.js?v=1.9.0-monster-catalog";
import{resourceHud}from"../components/GameChrome.js?v=1.14.0-alpha124";

function runTime(startedAt){
 const elapsed=Math.max(0,Date.now()-(Number(startedAt)||Date.now()));
 const hours=Math.floor(elapsed/3600000),minutes=Math.floor(elapsed/60000)%60,seconds=Math.floor(elapsed/1000)%60;
 return`${hours?`${String(hours).padStart(2,"0")}:`:""}${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}

export function ExploreScreen(state){
 const combatPower=partyCombatPower(state),returnReward=manualReturnPreview(state);
 const biome=biomeForFloor(state.player.currentFloor),progress=biomeProgress(state,biome);
 const world=worldPresentationForFloor(state.player.currentFloor);
 const party=(state.party??[]).map(id=>state.monsters.find(monster=>monster.id===id)).filter(Boolean);
 return`<section class="screen explore-screen explore-screen-dungeon world-${world.id}" data-biome="${biome.theme}" data-world="${world.id}" data-music-profile="${world.musicProfile}" style="--biome-accent:${world.phase===1?world.accent:biome.accent}">
  ${resourceHud(state,{title:`探索・${state.player.currentFloor}階`,settings:false})}
  <div class="explore-command-header">
   <div id="exploreCombatPower" class="explore-power-record" data-power="${combatPower}">
    <small>モンスター基盤</small><b>最高 ${state.player.maxFloor.toLocaleString()}階</b>
    <span>戦力・記録</span><strong data-combat-power-value>${formatCombatPower(combatPower)}</strong><em data-combat-power-delta hidden></em>
   </div>
   <div class="explore-biome-card"><span>${world.phase===1?"🌌":biome.icon}</span><div><b>${world.phase===1?`${world.subtitle} ${world.name}`:biome.name}</b><small>${biome.from}〜${biome.to}階・探索率 ${progress}%</small><i><em style="width:${progress}%"></em></i></div></div>
   <div class="explore-return-reward"><small>帰還報酬</small><b>${returnReward.floorsCleared}階・${returnReward.gold.toLocaleString()}G</b></div>
   <button type="button" id="resourceHelp" class="resource-help" aria-label="アイコン説明">?</button>
  </div>
  <div class="explore-party-strip">${party.map((monster,index)=>{
   const stats=calculatedStats(monster),hp=Math.max(0,monster.currentHp??stats.hp),monsterMp=maxMp(monster),mp=Math.max(0,monster.currentMp??monsterMp),species=SPECIES[monster.speciesId]??{};
   return`<button type="button" data-explore-monster="${monster.id}">
    <em>${index+1}</em>${monsterVisual(monster,species.emoji??"👹",{className:"explore-party-monster-visual"})}
    <div><b>${displayName(monster)}</b><small>Lv.${monster.level}・★${monster.stars??1}・+${monster.plus??0}・❤️${monster.affection??0}</small>
    <i class="hud-bar hp"><em style="width:${Math.min(100,hp/Math.max(1,stats.hp)*100)}%"></em><small>HP ${hp}/${stats.hp}</small></i>
    <i class="hud-bar mp"><em style="width:${Math.min(100,mp/Math.max(1,monsterMp)*100)}%"></em><small>MP ${mp}/${monsterMp}</small></i></div>
   </button>`;
  }).join("")}</div>
  <div class="explore-stage">
   <canvas id="gameCanvas"></canvas>
   <span class="explore-floor-plate">${state.player.currentFloor}階</span>
   <aside class="explore-stage-tools">
    <button type="button" id="exploreLog">🔎<b>探索ログ</b></button>
    <button type="button" id="miniMapToggle" class="minimap-toggle">🗺<b>ミニマップ</b></button>
   </aside>
   <canvas id="miniMap"></canvas>
   <div class="explore-run-clock"><b>探索中…</b><span data-explore-elapsed data-started-at="${returnReward.startedAt??Date.now()}">${runTime(returnReward.startedAt)}</span></div>
  </div>
  <nav class="explore-nav">
   <button id="pauseParty"><i>♟</i>編成</button>
   <button id="fieldEquipment"><i>⚔</i>装備</button>
   <button id="pauseItems"><i>🎒</i>持ち物</button>
   <button id="centerCamera"><i>⌖</i>現在地</button>
   <button id="returnHome" class="danger"><i>♨</i>帰還</button>
  </nav>
  <small class="explore-version">v${APP_VERSION}</small>
 </section>`;
}
