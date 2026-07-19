import{APP_VERSION}from"../../core/config.js";
import{MonsterCard}from"../components/MonsterCard.js";
import{calculatedStats,displayName}from"../../models/Monster.js";
import{maxMp}from"../../battle/SkillSystem.js";

export function HomeScreen(state){
  const party=state.party
    .map(id=>state.monsters.find(m=>m.id===id))
    .filter(Boolean);

  return`
    <section class="screen">
      <div class="page">
        <div class="eyebrow">ABYSS DOMINION / PRODUCTION EDITION</div>
        <h1 class="hero-title">地下1000階の魔王</h1>
        <p class="muted">最強のモンスター軍団を、何百時間も育て続ける。</p>

        <div class="panel">
          <div class="spread">
            <div>
              <div class="gold">REMAKE v${APP_VERSION}</div>
              <h2>モンスター基盤</h2>
            </div>
            <div class="muted">最高 ${state.player.maxFloor}階</div>
          </div>
          <div class="subline" style="margin-top:10px">
            GOLD ${state.player.gold}　魔晶石 ${state.player.crystals}
          </div>
        </div>

        <div class="grid">
          <button id="openMonsters" class="primary">モンスター</button>
          <button id="openExplore" class="primary">探索へ</button>
          <button id="openEquipment">装備</button>
          <button id="openSettings">設定</button>
          <button id="openRest">🛏️ 休息</button>
          <button id="openGacha" class="summon-button">🔮 深淵召喚</button>
        </div>

        <div class="panel">
          <div class="spread"><h2>現在のパーティー</h2><div class="home-party-actions"><span class="muted">${party.length}/4</span><button id="editHomeParty" class="compact-button">編成する</button></div></div>
          <div class="home-vitals">${party.map(m=>{const s=calculatedStats(m),hp=m.currentHp??s.hp,mp=m.currentMp??maxMp(m);return`<div><b>${displayName(m)} Lv.${m.level}</b><small>HP ${hp}/${s.hp}　MP ${mp}/${maxMp(m)}</small></div>`}).join("")}</div>
          <div class="monster-list" style="margin-top:12px">
            ${party.map(MonsterCard).join("")||'<div class="empty">パーティーなし</div>'}
          </div>
        </div>

        <p class="footer-note">召喚・休息・装備強化・宝物庫・鍵付き宝箱・ボス捕獲・シリーズ装備が解放された。</p>
      </div>
    </section>
  `;
}
