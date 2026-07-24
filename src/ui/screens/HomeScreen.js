import{APP_VERSION}from"../../core/config.js?v=1.7.0";
import{calculatedStats,displayName}from"../../models/Monster.js?v=1.7.0";
import{maxMp}from"../../battle/SkillSystem.js?v=1.7.0";
import{SPECIES}from"../../data/species.js?v=1.7.0";
import{dailyTeamAttempts,TEAM_BATTLE_UNLOCK_FLOOR,EMERGENCY_UNLOCK_FLOOR,ENDGAME_BOSSES,emergencyFragmentStatus,hasCleared1000,worldPhase}from"../../core/EndgameSystem.js?v=1.0.0";
import{partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=1.7.0";
import{idleReturnPreview}from"../../core/ReturnRewardSystem.js?v=1.4.0";
import{monsterVisual}from"../MonsterVisual.js?v=1.7.0";

function monsterRarity(monster){return monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N"}
function rarityNameClass(rarity){return ({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity).toLowerCase()}

export function HomeScreen(state){
  const party=state.party.map(id=>state.monsters.find(m=>m.id===id)).filter(Boolean);
  const combatPower=partyCombatPower(state);
  const idleReward=idleReturnPreview(state);
  const idleMinutes=Math.floor(idleReward.elapsedMs/60000),idleHours=Math.floor(idleMinutes/60),idleMinutePart=idleMinutes%60;
  const idleTimeText=idleHours>0?`${idleHours}時間${idleMinutePart}分`:`${idleMinutePart}分`;
  const team=dailyTeamAttempts(state),teamUnlocked=state.player.maxFloor>=TEAM_BATTLE_UNLOCK_FLOOR,emergencyUnlocked=state.player.maxFloor>=EMERGENCY_UNLOCK_FLOOR,revealed=hasCleared1000(state),completed=Boolean(state.flags?.gameClear10000),phase=worldPhase(state);
  const fragmentTotal=Object.keys(ENDGAME_BOSSES).reduce((n,id)=>n+emergencyFragmentStatus(state,id).count,0);
  const region=completed?"世界最深部":phase===1?(state.player.maxFloor>=7001?"神域":state.player.maxFloor>=3001?"深淵領域":"未知領域"):"通常領域";
  const equipmentById=new Map((state.equipment??[]).map(item=>[item.id,item]));
  const slots=Array.from({length:4},(_,index)=>{
    const m=party[index];
    if(!m)return`<div class="home-squad-slot empty"><span class="home-squad-number">${index+1}</span><strong>＋</strong><small>編成する</small></div>`;
    const stats=calculatedStats(m),hp=Math.max(0,m.currentHp??stats.hp),mp=Math.max(0,m.currentMp??maxMp(m)),hpRatio=Math.max(0,Math.min(100,(hp/Math.max(1,stats.hp))*100)),mpMax=maxMp(m),mpRatio=Math.max(0,Math.min(100,(mp/Math.max(1,mpMax))*100)),sp=SPECIES[m.speciesId];
    const stars="⭐".repeat(Math.max(1,Math.min(5,m.stars??1)));
    const equipmentIcons=["weaponRight","armorBody","accessoryNeck","armorSupport","accessoryFinger","weaponLeft"].map(slot=>{const id=m.equipment?.[slot],item=id?equipmentById.get(id):null,icon=slot.startsWith("weapon")?"⚔️":slot.startsWith("armor")?"🛡️":"💍";return`<i class="${item?"equipped":"empty"}" title="${item?.name??"未装備"}">${icon}</i>`}).join("");
    const rarity=monsterRarity(m),rarityClass=rarityNameClass(rarity);
    return`<div class="home-squad-slot"><span class="home-squad-number">${index+1}</span><div class="home-squad-head">${monsterVisual(m.speciesId,sp?.emoji??"👹",{className:"home-monster-visual"})}<section><b class="monster-rarity-name rarity-name-${rarityClass}">${displayName(m)}</b><small>Lv.${m.level} <em>+${m.plus??0}</em></small></section></div><div class="home-squad-growth"><span>${stars}</span><span>❤️${m.affection??0}</span></div><div class="home-squad-bar hp"><i style="width:${hpRatio}%"></i><small>HP ${hp}/${stats.hp}</small></div><div class="home-squad-bar mp"><i style="width:${mpRatio}%"></i><small>MP ${mp}/${mpMax}</small></div><div class="home-squad-equipment" aria-label="装備">${equipmentIcons}</div></div>`;
  }).join("");
  return`
    <section class="screen home-screen world-phase-${phase}${phase===1?" phase2":""}" data-world-phase="${phase}">
      ${phase===1?`<div class="phase2-atmosphere" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><span class="phase2-castle"></span></div>`:""}
      <div class="page">
        <div class="eyebrow">ABYSS DOMINION</div>
        <h1 class="hero-title">${completed?"深淵を統べる魔王":revealed?"地下10000階の魔王":"地下1000階の魔王"}</h1>

        <div class="panel home-status-panel compact-home-status">
          <div class="compact-status-primary"><div><small>モンスター基盤</small><b>最高 ${state.player.maxFloor}階</b></div><button type="button" id="openCombatPowerHistory" class="home-combat-power"><small>戦力・記録</small><strong>${formatCombatPower(combatPower)}</strong><em>履歴 ›</em></button><span>${phase===1?region:"通常領域"}</span></div>
          <div class="compact-status-resources"><span>🪙 ${state.player.gold.toLocaleString()}</span><span>💎 ${state.player.crystals}</span><span>📀 ${state.inventory?.captureCrystals??0}</span><span>🔑 ${state.inventory?.abyssKeys??0}</span><small>v${APP_VERSION}</small></div>
        </div>

        <button type="button" id="openFormation" class="panel home-party-panel compact-home-party">
          <div class="spread home-party-heading"><h2>現在の部隊</h2><div><span class="muted">${party.length}/4</span><b>部隊編成へ ›</b></div></div>
          <div class="home-squad-grid">${slots}</div>
        </button>

        <div class="home-reward-tag-row"><button type="button" id="openIdleReturn" class="home-idle-return-tag${idleReward.available?" ready":""}"><span>🎁</span><div><small>放置帰還報酬</small><b>${idleReward.available?`${idleReward.gold.toLocaleString()}G`:`${idleTimeText}探索中`}</b></div>${idleReward.available?"<i></i>":""}</button></div>

        <div class="home-primary-actions">
          <button id="openExplore" class="primary">🗺️<span><b>探索へ</b><small>階層を選んで出発</small></span></button>
          <button id="openGacha" class="primary summon-button">🔮<span><b>召喚</b><small>仲間・装備を獲得</small></span></button>
        </div>
        <div class="home-management-menu">
          <button id="openMonsters"><span>💪</span><b>魔物育成</b></button><button id="openEquipment"><span>⚔️</span><b>装備管理</b></button>
          <button id="openSkills"><span>✨</span><b>スキル設定</b></button><button id="openItemShop"><span>🧪</span><b>アイテムショップ</b></button>
          <button id="openAbyssSkillTree"><span>🌑</span><b>深淵ツリー</b></button>
        </div>
        <div class="home-utility-row"><button id="openRest" class="compact-button">🛏️ 休息</button><button id="openCodexHub" class="compact-button">📖 図鑑</button><button id="openSettings" class="compact-button">⚙️ 設定</button>${revealed?`<button id="openDeepGacha" class="compact-button deep-summon-button">🌌 深淵召喚</button><button id="openWorldRecord" class="compact-button world-record-button">📖 世界の記録</button>`:""}</div>
        ${teamUnlocked?`<div class="panel endgame-entry-panel"><div><small class="eyebrow">4 VS 4 / NO PENALTY</small><h2>⚔️ チームバトル</h2><p class="muted">第${team.stage}試練・本日 ${team.dailyAttempts}/50戦</p></div><button id="openTeamBattle" class="primary">挑戦する</button></div>`:`<div class="panel endgame-entry-panel locked"><div><small class="eyebrow">LOCKED</small><h2>⚔️ チームバトル</h2><p class="muted">${TEAM_BATTLE_UNLOCK_FLOOR}階突破で解放</p></div></div>`}
        ${emergencyUnlocked?`<div class="panel anomaly-panel"><small class="eyebrow">WORLD ANOMALY</small><h2>🌑 深淵反応が観測されている</h2><p class="muted">探索中、極低確率で4対4の緊急戦闘が発生します。</p><div class="spread"><small>遭遇 ${state.endgame?.emergency?.encounters??0} / 撃退 ${state.endgame?.emergency?.wins??0} / 欠片 ${fragmentTotal}</small><button id="openEndgameForge" class="compact-button">欠片・神装</button></div></div>`:""}
        <p class="footer-note">${completed?"真エンディング達成。育成・装備厳選・十神との再戦はここからも続く。":`探索・育成・召喚を繰り返し、${revealed?"地下10000階を目指そう。":"地下1000階を目指そう。"}`}</p>
      </div>
    </section>`;
}
