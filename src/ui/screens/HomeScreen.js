import{APP_VERSION}from"../../core/config.js?v=0.9.15-alpha.33-final-ui-polish";
import{MonsterCard}from"../components/MonsterCard.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{calculatedStats,displayName}from"../../models/Monster.js?v=0.9.15-alpha.33-final-ui-polish";
import{maxMp}from"../../battle/SkillSystem.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{SPECIES}from"../../data/species.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{dailyTeamAttempts,TEAM_BATTLE_UNLOCK_FLOOR,EMERGENCY_UNLOCK_FLOOR,ENDGAME_BOSSES,emergencyFragmentStatus,hasCleared1000,worldPhase}from"../../core/EndgameSystem.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=0.9.15-alpha.34-combat-power";

function monsterRarity(monster){return monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N"}
function rarityNameClass(rarity){return ({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity).toLowerCase()}

export function HomeScreen(state){
  const party=state.party.map(id=>state.monsters.find(m=>m.id===id)).filter(Boolean);
  const combatPower=partyCombatPower(state);
  const team=dailyTeamAttempts(state),teamUnlocked=state.player.maxFloor>=TEAM_BATTLE_UNLOCK_FLOOR,emergencyUnlocked=state.player.maxFloor>=EMERGENCY_UNLOCK_FLOOR,revealed=hasCleared1000(state),phase=worldPhase(state);
  const fragmentTotal=Object.keys(ENDGAME_BOSSES).reduce((n,id)=>n+emergencyFragmentStatus(state,id).count,0);
  const region=phase===1?(state.player.maxFloor>=7001?"神域":state.player.maxFloor>=3001?"深淵領域":"未知領域"):"通常領域";
  const equipmentById=new Map((state.equipment??[]).map(item=>[item.id,item]));
  const slots=Array.from({length:4},(_,index)=>{
    const m=party[index];
    if(!m)return`<button class="home-squad-slot empty" data-empty-party="true"><span class="home-squad-number">${index+1}</span><strong>＋</strong><small>編成する</small></button>`;
    const stats=calculatedStats(m),hp=Math.max(0,m.currentHp??stats.hp),mp=Math.max(0,m.currentMp??maxMp(m)),hpRatio=Math.max(0,Math.min(100,(hp/Math.max(1,stats.hp))*100)),mpMax=maxMp(m),mpRatio=Math.max(0,Math.min(100,(mp/Math.max(1,mpMax))*100)),sp=SPECIES[m.speciesId];
    const stars="⭐".repeat(Math.max(1,Math.min(5,m.stars??1)));
    const equipmentIcons=["weaponRight","armorBody","accessoryNeck","armorSupport","accessoryFinger","weaponLeft"].map(slot=>{const id=m.equipment?.[slot],item=id?equipmentById.get(id):null,icon=slot.startsWith("weapon")?"⚔️":slot.startsWith("armor")?"🛡️":"💍";return`<i class="${item?"equipped":"empty"}" title="${item?.name??"未装備"}">${icon}</i>`}).join("");
    const rarity=monsterRarity(m),rarityClass=rarityNameClass(rarity);
    return`<button class="home-squad-slot" data-monster-id="${m.id}"><span class="home-squad-number">${index+1}</span><div class="home-squad-head"><span>${sp?.emoji??"👹"}</span><section><b class="monster-rarity-name rarity-name-${rarityClass}">${displayName(m)}</b><small>Lv.${m.level} <em>+${m.plus??0}</em></small></section></div><div class="home-squad-growth"><span>${stars}</span><span>❤️${m.affection??0}</span></div><div class="home-squad-bar hp"><i style="width:${hpRatio}%"></i><small>HP ${hp}/${stats.hp}</small></div><div class="home-squad-bar mp"><i style="width:${mpRatio}%"></i><small>MP ${mp}/${mpMax}</small></div><div class="home-squad-equipment" aria-label="装備">${equipmentIcons}</div></button>`;
  }).join("");
  return`
    <section class="screen home-screen world-phase-${phase}${phase===1?" phase2":""}" data-world-phase="${phase}">
      ${phase===1?`<div class="phase2-atmosphere" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><span class="phase2-castle"></span></div>`:""}
      <div class="page">
        <div class="eyebrow">ABYSS DOMINION</div>
        <h1 class="hero-title">${revealed?"地下10000階の魔王":"地下1000階の魔王"}</h1>

        <div class="panel home-status-panel compact-home-status">
          <div class="compact-status-primary"><div><small>モンスター基盤</small><b>最高 ${state.player.maxFloor}階</b></div><div class="home-combat-power"><small>戦力</small><strong>${formatCombatPower(combatPower)}</strong></div><span>${phase===1?region:"通常領域"}</span></div>
          <div class="compact-status-resources"><span>🪙 ${state.player.gold.toLocaleString()}</span><span>💎 ${state.player.crystals}</span><span>📀 ${state.inventory?.captureCrystals??0}</span><span>🔑 ${state.inventory?.abyssKeys??0}</span><small>v${APP_VERSION}</small></div>
        </div>

        <div class="panel home-party-panel compact-home-party">
          <div class="spread home-party-heading"><h2>現在の部隊</h2><div><span class="muted">${party.length}/4</span><button id="editHomeParty" class="compact-button">編成</button></div></div>
          <div class="home-squad-grid">${slots}</div>
        </div>

        <div class="home-main-menu">
          <button id="openExplore" class="primary">🗺️ 探索</button><button id="openGacha" class="primary summon-button">🔮 ガチャ</button>
          <button id="openMonsters">💪 魔物強化</button><button id="openSkills">✨ スキル</button>
          <button id="openEquipment">⚔️ 装備</button>
          <button id="openCodexHub">📖 図鑑</button><button id="openSettings">⚙️ 設定</button>
        </div>
        <div class="home-utility-row"><button id="openRest" class="compact-button">🛏️ 休息</button>${revealed?`<button id="openDeepGacha" class="compact-button deep-summon-button">🌌 深淵召喚</button><button id="openWorldRecord" class="compact-button world-record-button">📖 世界の記録</button>`:""}</div>
        ${teamUnlocked?`<div class="panel endgame-entry-panel"><div><small class="eyebrow">4 VS 4 / NO PENALTY</small><h2>⚔️ チームバトル</h2><p class="muted">第${team.stage}試練・本日 ${team.dailyAttempts}/50戦</p></div><button id="openTeamBattle" class="primary">挑戦する</button></div>`:`<div class="panel endgame-entry-panel locked"><div><small class="eyebrow">LOCKED</small><h2>⚔️ チームバトル</h2><p class="muted">${TEAM_BATTLE_UNLOCK_FLOOR}階突破で解放</p></div></div>`}
        ${emergencyUnlocked?`<div class="panel anomaly-panel"><small class="eyebrow">WORLD ANOMALY</small><h2>🌑 深淵反応が観測されている</h2><p class="muted">探索中、極低確率で4対4の緊急戦闘が発生します。</p><div class="spread"><small>遭遇 ${state.endgame?.emergency?.encounters??0} / 撃退 ${state.endgame?.emergency?.wins??0} / 欠片 ${fragmentTotal}</small><button id="openEndgameForge" class="compact-button">欠片・神装</button></div></div>`:""}
        <p class="footer-note">探索・育成・召喚を繰り返し、${revealed?"地下10000階を目指そう。":"地下1000階を目指そう。"}</p>
      </div>
    </section>`;
}
