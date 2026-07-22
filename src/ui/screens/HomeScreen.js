import{APP_VERSION}from"../../core/config.js?v=0.9.15-alpha.1-part3-phase2";
import{MonsterCard}from"../components/MonsterCard.js?v=0.9.8-alpha.1";
import{calculatedStats,displayName}from"../../models/Monster.js?v=0.9.8-alpha.1";
import{maxMp}from"../../battle/SkillSystem.js?v=0.9.8-alpha.1";
import{SPECIES}from"../../data/species.js?v=0.9.14-alpha.2";
import{dailyTeamAttempts,TEAM_BATTLE_UNLOCK_FLOOR,EMERGENCY_UNLOCK_FLOOR,ENDGAME_BOSSES,emergencyFragmentStatus,hasCleared1000,worldPhase}from"../../core/EndgameSystem.js?v=0.9.15-alpha.1-part3-phase2";

export function HomeScreen(state){
  const party=state.party.map(id=>state.monsters.find(m=>m.id===id)).filter(Boolean);
  const team=dailyTeamAttempts(state),teamUnlocked=state.player.maxFloor>=TEAM_BATTLE_UNLOCK_FLOOR,emergencyUnlocked=state.player.maxFloor>=EMERGENCY_UNLOCK_FLOOR,revealed=hasCleared1000(state),phase=worldPhase(state);
  const fragmentTotal=Object.keys(ENDGAME_BOSSES).reduce((n,id)=>n+emergencyFragmentStatus(state,id).count,0);
  const region=phase===1?(state.player.maxFloor>=7001?"神域":state.player.maxFloor>=3001?"深淵領域":"未知領域"):"通常領域";
  const slots=Array.from({length:4},(_,index)=>{
    const m=party[index];
    if(!m)return`<button class="home-squad-slot empty" data-empty-party="true"><span class="home-squad-number">${index+1}</span><strong>＋</strong><small>編成する</small></button>`;
    const s=calculatedStats(m),hp=Math.max(0,m.currentHp??s.hp),ratio=Math.max(0,Math.min(100,(hp/Math.max(1,s.hp))*100)),sp=SPECIES[m.speciesId];
    return`<button class="home-squad-slot" data-monster-id="${m.id}"><span class="home-squad-number">${index+1}</span><div class="home-squad-head"><span>${sp?.emoji??"👹"}</span><section><b>${displayName(m)}</b><small>Lv.${m.level}</small></section></div><div class="home-squad-hp"><i style="width:${ratio}%"></i></div><small class="home-squad-hp-label">HP ${hp}/${s.hp}</small></button>`;
  }).join("");
  return`
    <section class="screen home-screen world-phase-${phase}${phase===1?" phase2":""}" data-world-phase="${phase}">
      ${phase===1?`<div class="phase2-atmosphere" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><span class="phase2-castle"></span></div>`:""}
      <div class="page">
        <div class="eyebrow">ABYSS DOMINION</div>
        <h1 class="hero-title">${revealed?"地下10000階の魔王":"地下1000階の魔王"}</h1>

        <div class="panel home-status-panel compact-home-status">
          <div class="compact-status-primary"><div><small>モンスター基盤</small><b>最高 ${state.player.maxFloor}階</b></div><span>${phase===1?region:"通常領域"}</span></div>
          <div class="compact-status-resources"><span>🪙 ${state.player.gold}</span><span>💎 ${state.player.crystals}</span><small>v${APP_VERSION}</small></div>
        </div>

        <div class="panel home-party-panel compact-home-party">
          <div class="spread"><h2>現在の部隊</h2><span class="muted">${party.length}/4</span></div>
          <div class="home-squad-grid">${slots}</div>
        </div>

        <div class="home-main-menu">
          <button id="openExplore" class="primary">🗺️ 探索</button><button id="openGacha" class="primary summon-button">🔮 ガチャ</button>
          <button id="openMonsters">💪 魔物強化</button><button id="openEquipment">⚔️ 装備</button>
          <button id="openCodexHub">📖 図鑑</button><button id="openSettings">⚙️ 設定</button>
        </div>
        <div class="home-utility-row"><button id="openRest" class="compact-button">🛏️ 休息</button>${revealed?`<button id="openDeepGacha" class="compact-button deep-summon-button">🌌 深淵召喚</button><button id="openWorldRecord" class="compact-button world-record-button">📖 世界の記録</button>`:""}</div>
        ${teamUnlocked?`<div class="panel endgame-entry-panel"><div><small class="eyebrow">4 VS 4 / NO PENALTY</small><h2>⚔️ チームバトル</h2><p class="muted">第${team.stage}試練・本日 ${team.dailyAttempts}/50戦</p></div><button id="openTeamBattle" class="primary">挑戦する</button></div>`:`<div class="panel endgame-entry-panel locked"><div><small class="eyebrow">LOCKED</small><h2>⚔️ チームバトル</h2><p class="muted">${TEAM_BATTLE_UNLOCK_FLOOR}階突破で解放</p></div></div>`}
        ${emergencyUnlocked?`<div class="panel anomaly-panel"><small class="eyebrow">WORLD ANOMALY</small><h2>🌑 深淵反応が観測されている</h2><p class="muted">探索中、極低確率で4対4の緊急戦闘が発生します。</p><div class="spread"><small>遭遇 ${state.endgame?.emergency?.encounters??0} / 撃退 ${state.endgame?.emergency?.wins??0} / 欠片 ${fragmentTotal}</small><button id="openEndgameForge" class="compact-button">欠片・神装</button></div></div>`:""}
        <p class="footer-note">探索・育成・召喚を繰り返し、${revealed?"地下10000階を目指そう。":"地下1000階を目指そう。"}</p>
      </div>
    </section>`;
}
