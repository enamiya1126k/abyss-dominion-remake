import{APP_VERSION}from"../../core/config.js?v=1.7.0";
import{displayName}from"../../models/Monster.js?v=1.9.0-monster-catalog";
import{SPECIES}from"../../data/species.js?v=1.9.0-monster-catalog";
import{dailyTeamAttempts,TEAM_BATTLE_UNLOCK_FLOOR,EMERGENCY_UNLOCK_FLOOR,hasCleared1000,worldPhase}from"../../core/EndgameSystem.js?v=1.0.0";
import{partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=1.9.0-monster-catalog";
import{idleReturnPreview}from"../../core/ReturnRewardSystem.js?v=1.4.0";
import{monsterVisual}from"../MonsterVisual.js?v=1.9.1-endgame-sprites";

function scenePartySlot(monster,index){
  const positions=["front-left","front-right","back-left","back-right"];
  if(!monster)return`
    <button type="button" class="home-scene-unit ${positions[index]} empty" data-open-home-formation aria-label="空き枠を編成">
      <span>＋</span><small>編成</small>
    </button>`;
  const species=SPECIES[monster.speciesId];
  return`
    <button type="button" class="home-scene-unit ${positions[index]}" data-open-home-formation aria-label="${displayName(monster)}の編成を開く">
      ${monsterVisual(monster,species?.emoji??"👹",{className:"home-scene-monster-visual"})}
      <span class="home-scene-name">${displayName(monster)}</span>
      <small>Lv.${monster.level}</small>
    </button>`;
}

function menuButton({id,icon,title,sub,className=""}){
  return`<button type="button" id="${id}" class="home-command-button ${className}">
    <span class="home-command-icon">${icon}</span>
    <span class="home-command-copy"><b>${title}</b><small>${sub}</small></span>
  </button>`;
}

function utilityButton({id,icon,title,value="",ready=false}){
  return`<button type="button" id="${id}" class="home-utility-button${ready?" ready":""}">
    ${ready?'<i class="home-notification-dot"></i>':""}
    <span>${icon}</span><b>${title}</b>${value?`<small>${value}</small>`:""}
  </button>`;
}

export function HomeScreen(state){
  const party=state.party.map(id=>state.monsters.find(monster=>monster.id===id)).filter(Boolean);
  const combatPower=partyCombatPower(state);
  const idleReward=idleReturnPreview(state);
  const team=dailyTeamAttempts(state);
  const teamUnlocked=state.player.maxFloor>=TEAM_BATTLE_UNLOCK_FLOOR;
  const endgameUnlocked=state.player.maxFloor>=EMERGENCY_UNLOCK_FLOOR;
  const revealed=hasCleared1000(state);
  const completed=Boolean(state.flags?.gameClear10000);
  const phase=worldPhase(state);
  const sceneSlots=Array.from({length:4},(_,index)=>scenePartySlot(party[index],index)).join("");
  const teamSub=teamUnlocked?`第${team.stage}試練・本日 ${team.dailyAttempts}/50戦`:`${TEAM_BATTLE_UNLOCK_FLOOR}階突破で解放`;
  const eventReady=endgameUnlocked||revealed;
  const title=completed?"深淵を統べる魔王":revealed?"地下10000階の魔王":"地下1000階の魔王";

  return`
    <section class="screen home-command-screen world-phase-${phase}${phase===1?" phase2":""}" data-world-phase="${phase}">
      <div class="home-command-shade" aria-hidden="true"></div>

      <header class="home-title-card">
        <small>ABYSS DOMINION</small>
        <h1>${title}</h1>
      </header>

      <div class="home-resource-bar" aria-label="所持資源">
        <span title="GOLD">🪙 <b>${state.player.gold.toLocaleString()}</b></span>
        <span title="魔晶石">💎 <b>${state.player.crystals.toLocaleString()}</b></span>
        <span title="捕獲結晶">📀 <b>${(state.inventory?.captureCrystals??0).toLocaleString()}</b></span>
        <span title="深淵の鍵">🔑 <b>${(state.inventory?.abyssKeys??0).toLocaleString()}</b></span>
        <button type="button" id="openSettings" aria-label="設定">⚙️</button>
      </div>

      <button type="button" id="openCombatPowerHistory" class="home-record-card">
        <small>モンスター基盤</small>
        <strong>最高 <em>${state.player.maxFloor.toLocaleString()}</em> 階</strong>
        <i></i>
        <span>戦力・記録</span>
        <b>♟ ${formatCombatPower(combatPower)}</b>
      </button>

      <nav class="home-left-menu" aria-label="主要メニュー">
        ${menuButton({id:"openTeamBattle",icon:"⚔️",title:"チームバトル",sub:`4 VS 4 / NO PENALTY　${teamSub}`,className:teamUnlocked?"team-ready":"locked"})}
        ${menuButton({id:"openGacha",icon:"🔮",title:"召喚",sub:"仲間・装備を獲得"})}
        ${menuButton({id:"openMonsters",icon:"💪",title:"魔物育成",sub:"強化して部隊を強化"})}
        ${menuButton({id:"openEquipment",icon:"🗡️",title:"装備管理",sub:"装備の確認・強化"})}
        ${menuButton({id:"openSkills",icon:"📖",title:"スキル設定",sub:"スキルの確認・強化"})}
      </nav>

      <aside class="home-right-menu" aria-label="お知らせと報酬">
        ${utilityButton({id:"openIdleReturn",icon:"🧰",title:"放置報酬",value:idleReward.available?`${idleReward.gold.toLocaleString()}G`:"探索中",ready:idleReward.available})}
        ${utilityButton({id:"openNoticeCenter",icon:"✉️",title:"お知らせ"})}
        ${utilityButton({id:"openPresentUnavailable",icon:"🎁",title:"プレゼント"})}
      </aside>

      <button type="button" id="openFormation" class="home-formation-banner">
        <span>⚔️</span><b>部隊編成</b><strong>${party.length}/4</strong>
      </button>

      <button type="button" id="openRest" class="home-rest-hotspot" aria-label="休息">
        <span>🛏️</span><b>休息</b>
      </button>

      <div class="home-party-stage" aria-label="現在の編成パーティ">
        ${sceneSlots}
      </div>

      <nav class="home-bottom-nav" aria-label="画面メニュー">
        <button type="button" class="active" aria-current="page"><span>🏰</span><b>ホーム</b></button>
        <button type="button" id="openOnlineParty"><span>🧑‍🤝‍🧑</span><b>パーティ</b></button>
        <button type="button" id="openExplore"><span>🚪</span><b>ダンジョン</b></button>
        <button type="button" id="openItemShop"><span>🏪</span><b>ショップ</b></button>
        <button type="button" id="openEventHub" class="${eventReady?"ready":""}">${eventReady?'<i class="home-notification-dot"></i>':""}<span>🎟️</span><b>イベント</b></button>
      </nav>

      <small class="home-version">v${APP_VERSION}</small>
    </section>`;
}
