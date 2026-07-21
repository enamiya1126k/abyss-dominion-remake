import{APP_VERSION}from"../../core/config.js?v=0.9.8-alpha.1";
import{MonsterCard}from"../components/MonsterCard.js?v=0.9.8-alpha.1";
import{calculatedStats,displayName}from"../../models/Monster.js?v=0.9.8-alpha.1";
import{maxMp}from"../../battle/SkillSystem.js?v=0.9.8-alpha.1";
import{SPECIES}from"../../data/species.js?v=0.9.14-alpha.1";
import{dailyTeamAttempts,TEAM_BATTLE_UNLOCK_FLOOR,EMERGENCY_UNLOCK_FLOOR}from"../../core/EndgameSystem.js?v=0.9.14-alpha.1";

export function HomeScreen(state){
  const party=state.party.map(id=>state.monsters.find(m=>m.id===id)).filter(Boolean);
  const team=dailyTeamAttempts(state),teamUnlocked=state.player.maxFloor>=TEAM_BATTLE_UNLOCK_FLOOR,emergencyUnlocked=state.player.maxFloor>=EMERGENCY_UNLOCK_FLOOR;
  return`
    <section class="screen home-screen">
      <div class="page">
        <div class="eyebrow">ABYSS DOMINION / PRODUCTION EDITION</div>
        <h1 class="hero-title">地下10000階の魔王</h1>
        <p class="muted">最強のモンスター軍団を、何百時間も育て続ける。</p>

        <div class="panel home-status-panel">
          <div class="spread"><div><div class="gold">REMAKE v${APP_VERSION}</div><h2>モンスター基盤</h2></div><div class="muted">最高 ${state.player.maxFloor}階</div></div>
          <div class="subline" style="margin-top:10px">GOLD ${state.player.gold}　魔晶石 ${state.player.crystals}</div>
        </div>

        <div class="home-main-menu">
          <button id="openExplore" class="primary">🗺️ 探索</button><button id="openGacha" class="primary summon-button">🔮 ガチャ</button>
          <button id="openMonsters">💪 魔物強化</button><button id="openEquipment">⚔️ 装備</button>
          <button id="openCodexHub">📖 図鑑</button><button id="openSettings">⚙️ 設定</button>
        </div>
        <div class="home-utility-row"><button id="openRest" class="compact-button">🛏️ 休息</button>${state.player.maxFloor>=1000?`<button id="openDeepGacha" class="compact-button deep-summon-button">🌌 深淵召喚</button>`:""}</div>
        ${teamUnlocked?`<div class="panel endgame-entry-panel"><div><small class="eyebrow">4 VS 4 / NO PENALTY</small><h2>⚔️ チームバトル</h2><p class="muted">第${team.stage}試練・本日 ${team.dailyAttempts}/50戦</p></div><button id="openTeamBattle" class="primary">挑戦する</button></div>`:`<div class="panel endgame-entry-panel locked"><div><small class="eyebrow">LOCKED</small><h2>⚔️ チームバトル</h2><p class="muted">${TEAM_BATTLE_UNLOCK_FLOOR}階突破で解放</p></div></div>`}
        ${emergencyUnlocked?`<div class="panel anomaly-panel"><small class="eyebrow">WORLD ANOMALY</small><h2>🌑 深淵反応が観測されている</h2><p class="muted">探索中、極低確率で4対4の緊急戦闘が発生します。</p><small>遭遇 ${state.endgame?.emergency?.encounters??0} / 撃退 ${state.endgame?.emergency?.wins??0}</small></div>`:""}

        <div class="panel home-party-panel">
          <div class="spread"><div><h2>現在のパーティー</h2><small class="muted">育てる4体が、このゲームの主人公。</small></div><span class="muted">${party.length}/4</span></div>
          <button id="editHomeParty" class="home-edit-party-button"><span>⚔️</span><b>パーティーを編成する</b><small>組み合わせ・役割・育成状況を比較</small></button>
          <div class="home-vitals">${party.map(m=>{const s=calculatedStats(m),hp=m.currentHp??s.hp,mp=m.currentMp??maxMp(m),sp=SPECIES[m.speciesId];return`<div class="home-party-unit"><span>${sp?.emoji??"👹"}</span><section><b>${displayName(m)} Lv.${m.level}</b><small>⭐${m.stars??1}　+${m.plus??0}　❤️${m.affection??0}</small><small>HP ${hp}/${s.hp}　MP ${mp}/${maxMp(m)}</small></section></div>`}).join("")||'<div class="empty">パーティーなし</div>'}</div>
          <div class="monster-list" style="margin-top:12px">${party.map(MonsterCard).join("")}</div>
        </div>
        <p class="footer-note">探索・育成・召喚を繰り返し、地下10000階を目指そう。</p>
      </div>
    </section>`;
}
