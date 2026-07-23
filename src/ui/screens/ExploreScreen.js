import{APP_VERSION}from"../../core/config.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{calculatedStats,displayName}from"../../models/Monster.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{maxMp}from"../../battle/SkillSystem.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{biomeForFloor,biomeProgress}from"../../data/biomes.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{worldPresentationForFloor}from"../../core/WorldSystem.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=0.9.15-alpha.34-combat-power";
export function ExploreScreen(state){const combatPower=partyCombatPower(state),biome=biomeForFloor(state.player.currentFloor),progress=biomeProgress(state,biome),world=worldPresentationForFloor(state.player.currentFloor);const p=state.party
  .map(id=>state.monsters.find(m=>m.id===id))
  .filter(Boolean);

const leader=p[0]??null;return`<section class="screen explore-screen world-${world.id}" data-biome="${biome.theme}" data-world="${world.id}" data-music-profile="${world.musicProfile}" style="--biome-accent:${world.phase===1?world.accent:biome.accent}"><div class="biome-banner"><span>${world.phase===1?"🌌":biome.icon}</span><div><b>${world.phase===1?`${world.subtitle}・${world.name}`:biome.name}</b><small>${world.phase===1?`${state.player.currentFloor}階・${biome.name}`:`${biome.from}〜${biome.to}階・探索率 ${progress}%`}</small></div><i><em style="width:${progress}%"></em></i></div><header class="explore-hud"><button type="button" data-resource-help="floor" aria-label="現在階層"><b>${state.player.currentFloor}階</b></button><button type="button" data-resource-help="gold" aria-label="ゴールド"><span>🪙</span><b id="goldHud">${state.player.gold.toLocaleString()}</b></button><button type="button" data-resource-help="crystal" aria-label="魔晶石"><span>💎</span><b>${state.player.crystals}</b></button><button type="button" data-resource-help="capture" aria-label="捕獲結晶"><span>📀</span><b id="captureHud">${state.inventory.captureCrystals}</b></button><button type="button" data-resource-help="key" aria-label="深淵の鍵"><span>🔑</span><b>${state.inventory.abyssKeys??0}</b></button><div class="explore-combat-power" aria-label="パーティー戦力"><small>戦力</small><b>${formatCombatPower(combatPower)}</b></div><button type="button" id="resourceHelp" class="resource-help" aria-label="アイコン説明">?</button>${
leader
?`
<button
type="button"
class="leader-status"
data-explore-monster="${leader.id}">
<span class="leader-icon">${leader.icon??"👿"}</span>
<div class="leader-meta">
<b>${displayName(leader)}</b>
<small>Lv.${leader.level}</small>
</div>
</button>
`
:""
}<div class="version">v${APP_VERSION}</div></header><div class="explore-party-strip">${p.map(m=>{const s=calculatedStats(m),hp=Math.max(0,m.currentHp??s.hp),mp=Math.max(0,m.currentMp??maxMp(m));return`<button type="button" data-explore-monster="${m.id}"><b>${displayName(m)}</b><span>Lv.${m.level}</span><small class="growth-mini"><i>⭐${m.stars??1}</i><i>+${m.plus??0}</i><i>❤️${m.affection??0}</i></small><i class="hud-bar hp"><em style="width:${Math.min(100,hp/s.hp*100)}%"></em><small>HP:${hp}/${s.hp}</small></i><i class="hud-bar mp"><em style="width:${Math.min(100,mp/maxMp(m)*100)}%"></em><small>MP:${mp}/${maxMp(m)}</small></i></button>`}).join("")}</div><div class="explore-stage"><canvas id="gameCanvas"></canvas><canvas id="miniMap"></canvas><button id="miniMapToggle" class="minimap-toggle" style="${state.settings.mapTogglePosition?`left:${state.settings.mapTogglePosition.x}px;top:${state.settings.mapTogglePosition.y}px;right:auto`:``}">${state.settings.minimapVisible?"MAP ON":"MAP OFF"}</button></div><nav class="explore-nav"><button id="pauseParty">編成</button><button id="fieldEquipment">装備</button><button id="pauseItems">持ち物</button><button id="centerCamera">現在地</button><button id="returnHome" class="danger">帰還</button></nav></section>`}

export function bindExploreLeaderEvents(state){

    document.querySelectorAll("[data-explore-monster]").forEach(btn=>{

        btn.addEventListener("click",()=>{

            const id=btn.dataset.exploreMonster;

            if(!id)return;

            window.dispatchEvent(new CustomEvent("open-monster-detail",{
                detail:{id}
            }));

        });

    });

}