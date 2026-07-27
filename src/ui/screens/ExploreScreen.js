import{APP_VERSION}from"../../core/config.js?v=1.7.3-alpha112";
import{calculatedStats,displayName}from"../../models/Monster.js?v=1.9.0-monster-catalog";
import{maxMp}from"../../battle/SkillSystem.js?v=1.13.0-alpha115";
import{biomeForFloor,biomeProgress}from"../../data/biomes.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{worldPresentationForFloor}from"../../core/WorldSystem.js?v=1.0.0";
import{partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=1.9.0-monster-catalog";
import{manualReturnPreview}from"../../core/ReturnRewardSystem.js?v=1.4.0";
import{resourceHud}from"../components/GameChrome.js?v=1.13.0-alpha115";

export function ExploreScreen(state){
 const combatPower=partyCombatPower(state);
 const returnReward=manualReturnPreview(state);
 const biome=biomeForFloor(state.player.currentFloor);
 const progress=biomeProgress(state,biome);
 const world=worldPresentationForFloor(state.player.currentFloor);
 const party=state.party.map(id=>state.monsters.find(monster=>monster.id===id)).filter(Boolean);

 return`<section class="screen explore-screen world-${world.id}" data-biome="${biome.theme}" data-world="${world.id}" data-music-profile="${world.musicProfile}" style="--biome-accent:${world.phase===1?world.accent:biome.accent}">
  <div class="biome-banner">
   <span>${world.phase===1?"🌌":biome.icon}</span>
   <div><b>${world.phase===1?`${world.subtitle}・${world.name}`:biome.name}</b><small>${world.phase===1?`${state.player.currentFloor}階・${biome.name}`:`${biome.from}〜${biome.to}階・探索率 ${progress}%`}</small></div>
   <i><em style="width:${progress}%"></em></i>
  </div>
  ${resourceHud(state,{title:`探索・${state.player.currentFloor}階`,settings:false})}
  <header class="explore-hud explore-hud-status">
   <div id="exploreCombatPower" class="explore-combat-power" data-power="${combatPower}" aria-label="パーティー総戦力">
    <span class="combat-power-sigil">✦</span>
    <div><small>TOTAL POWER</small><b data-combat-power-value>${formatCombatPower(combatPower)}</b></div>
    <em data-combat-power-delta hidden></em>
   </div>
   <div class="explore-return-reward" aria-label="現在の帰還報酬"><small>帰還報酬</small><b>${returnReward.floorsCleared}階・${returnReward.gold.toLocaleString()}G</b></div>
   <button type="button" id="resourceHelp" class="resource-help" aria-label="アイコン説明">?</button>
   <div class="version">v${APP_VERSION}</div>
  </header>
  <div class="explore-party-strip">${party.map(monster=>{
   const stats=calculatedStats(monster);
   const hp=Math.max(0,monster.currentHp??stats.hp);
   const monsterMp=maxMp(monster);
   const mp=Math.max(0,monster.currentMp??monsterMp);
   return`<button type="button" data-explore-monster="${monster.id}">
    <b>${displayName(monster)}</b>
    <span>Lv.${monster.level}</span>
    <small class="growth-mini"><i>⭐${monster.stars??1}</i><i>+${monster.plus??0}</i><i>❤️${monster.affection??0}</i></small>
    <i class="hud-bar hp"><em style="width:${Math.min(100,hp/stats.hp*100)}%"></em><small>HP:${hp}/${stats.hp}</small></i>
    <i class="hud-bar mp"><em style="width:${Math.min(100,mp/monsterMp*100)}%"></em><small>MP:${mp}/${monsterMp}</small></i>
   </button>`;
  }).join("")}</div>
  <div class="explore-stage">
   <canvas id="gameCanvas"></canvas>
   <canvas id="miniMap"></canvas>
   <button id="miniMapToggle" class="minimap-toggle" style="${state.settings.mapTogglePosition?`left:${state.settings.mapTogglePosition.x}px;top:${state.settings.mapTogglePosition.y}px;right:auto`:""}">${state.settings.minimapVisible?"MAP ON":"MAP OFF"}</button>
  </div>
  <nav class="explore-nav">
   <button id="pauseParty">編成</button>
   <button id="fieldEquipment">装備</button>
   <button id="pauseItems">持ち物</button>
   <button id="centerCamera">現在地</button>
   <button id="returnHome" class="danger">帰還</button>
  </nav>
 </section>`;
}
