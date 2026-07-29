import{APP_VERSION}from"../../core/config.js?v=1.14.0-alpha124";
import{displayName}from"../../models/Monster.js?v=1.14.0-alpha124";
import{SPECIES}from"../../data/species.js?v=1.9.0-monster-catalog";
import{dailyTeamAttempts,TEAM_BATTLE_UNLOCK_FLOOR,EMERGENCY_UNLOCK_FLOOR,hasCleared1000,worldPhase}from"../../core/EndgameSystem.js?v=1.0.0";
import{monsterCombatPower,partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=1.14.0-alpha124";
import{idleReturnPreview}from"../../core/ReturnRewardSystem.js?v=1.14.0-alpha124";
import{unreadNoticeIds}from"../../core/NoticeSystem.js?v=1.7.3";
import{monsterVisual}from"../MonsterVisual.js?v=1.9.1-endgame-sprites";

function scenePartySlot(monster,index){
  const positions=["front-left","front-right","back-left","back-right"];
  if(!monster)return`
    <button type="button" class="home-scene-unit ${positions[index]} empty" data-open-home-formation data-home-party-slot="${index}" aria-label="スロット${index+1}を編成">
      <em class="home-slot-badge">${index+1}</em><span>＋</span>
    </button>`;
  const species=SPECIES[monster.speciesId];
  return`
    <button type="button" class="home-scene-unit ${positions[index]}" data-open-home-formation data-home-party-slot="${index}" data-home-party-member="${monster.id}" aria-label="${displayName(monster)}・編成スロット${index+1}">
      <em class="home-slot-badge">${index+1}</em>
      ${monsterVisual(monster,species?.emoji??"👹",{className:"home-scene-monster-visual"})}
      <span class="home-scene-name">${displayName(monster)}</span>
      <small>Lv.${monster.level}</small>
      <strong class="home-scene-power"><i>戦力</i>${formatCombatPower(monsterCombatPower(monster))}</strong>
    </button>`;
}

export function homePartySlots(state){
  const partyIds=(state.party??[]).filter(Boolean).slice(0,4);
  const partySet=new Set(partyIds),seen=new Set(),slots=Array(4).fill(null);
  const saved=Array.isArray(state.player?.homePartySlots)?state.player.homePartySlots.slice(0,4):[];
  saved.forEach((id,index)=>{
    if(id&&partySet.has(id)&&!seen.has(id)){slots[index]=id;seen.add(id)}
  });
  partyIds.forEach(id=>{
    if(seen.has(id))return;
    const empty=slots.indexOf(null);
    if(empty>=0){slots[empty]=id;seen.add(id)}
  });
  return slots;
}

const HOME_NUMBER_UNITS=Object.freeze([
  [1_000_000_000_000,1_000_000_000_000,"T"],
  [1_000_000_000,1_000_000_000,"B"],
  [1_000_000,1_000_000,"M"],
  [10_000,1_000,"K"],
]);

export function compactHomeNumber(value){
  const number=Math.max(0,Number(value)||0);
  const unit=HOME_NUMBER_UNITS.find(([threshold])=>number>=threshold);
  if(!unit)return Math.floor(number).toLocaleString();
  const [,divisor,suffix]=unit;
  const scaled=number/divisor;
  const digits=scaled>=100?0:scaled>=10?1:2;
  return`${Number(scaled.toFixed(digits)).toLocaleString()}${suffix}`;
}

function pixelIcon(name,className=""){
  return`<span class="home-pixel-icon icon-${name}${className?` ${className}`:""}" aria-hidden="true"></span>`;
}

function menuButton({id,icon,title,sub,className=""}){
  return`<button type="button" id="${id}" class="home-command-button ${className}">
    <span class="home-command-icon">${pixelIcon(icon)}</span>
    <span class="home-command-copy"><b>${title}</b><small>${sub}</small></span>
  </button>`;
}

function utilityButton({id,icon,title,value="",ready=false}){
  return`<button type="button" id="${id}" class="home-utility-button${ready?" ready":""}">
    ${ready?'<i class="home-notification-dot"></i>':""}
    ${pixelIcon(icon)}<b>${title}</b>${value?`<small>${value}</small>`:""}
  </button>`;
}

export function HomeScreen(state){
  const slotIds=homePartySlots(state);
  const party=slotIds.map(id=>id?state.monsters.find(monster=>monster.id===id):null);
  const activeParty=party.filter(Boolean);
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
  const noticeCount=unreadNoticeIds(state).length;
  const title=completed?"深淵を統べる魔王":revealed?"地下10000階の魔王":"地下1000階の魔王";

  return`
    <section class="screen home-command-screen world-phase-${phase}${phase===1?" phase2":""}" data-world-phase="${phase}">
      <div class="home-command-shade" aria-hidden="true"></div>
      <div class="home-environment-motion" aria-hidden="true">
        <i class="home-moving-sky sky-left"></i>
        <i class="home-moving-sky sky-right"></i>
        <i class="home-moving-foliage foliage-left"></i>
        <i class="home-moving-foliage foliage-right"></i>
        <i class="home-river-shimmer river-frame-1"></i>
        <i class="home-river-shimmer river-frame-2"></i>
        <i class="home-river-shimmer river-frame-3"></i>
      </div>

      <header class="home-title-card">
        <small>ABYSS DOMINION</small>
        <h1>${title}</h1>
      </header>

      <div class="home-resource-bar" aria-label="所持資源">
        <span title="GOLD：${state.player.gold.toLocaleString()}">${pixelIcon("coin")}<b>${compactHomeNumber(state.player.gold)}</b></span>
        <span title="魔晶石：${state.player.crystals.toLocaleString()}">${pixelIcon("crystal")}<b>${compactHomeNumber(state.player.crystals)}</b></span>
        <span title="捕獲結晶：${(state.inventory?.captureCrystals??0).toLocaleString()}">${pixelIcon("capture")}<b>${compactHomeNumber(state.inventory?.captureCrystals??0)}</b></span>
        <span title="深淵の鍵：${(state.inventory?.abyssKeys??0).toLocaleString()}">${pixelIcon("key")}<b>${compactHomeNumber(state.inventory?.abyssKeys??0)}</b></span>
        <button type="button" id="openSettings" aria-label="設定">${pixelIcon("settings")}</button>
      </div>

      <button type="button" id="openCombatPowerHistory" class="home-record-card">
        <small>モンスター基盤</small>
        <strong title="最高 ${state.player.maxFloor.toLocaleString()}階">最高 <em>${compactHomeNumber(state.player.maxFloor)}</em> 階</strong>
        <i></i>
        <span>戦力・記録</span>
        <b title="戦力 ${formatCombatPower(combatPower)}">${pixelIcon("crossed-swords","record-power-icon")} ${compactHomeNumber(combatPower)}</b>
      </button>

      <nav class="home-left-menu" aria-label="主要メニュー">
        ${menuButton({id:"openTeamBattle",icon:"crossed-swords",title:"チームバトル",sub:`4 VS 4 / NO PENALTY　${teamSub}`,className:teamUnlocked?"team-ready":"locked"})}
        ${menuButton({id:"openGacha",icon:"summon",title:"召喚",sub:"仲間・装備を獲得"})}
        ${menuButton({id:"openMonsters",icon:"growth",title:"魔物一覧",sub:"図鑑・合成・逃す"})}
        ${menuButton({id:"openEquipment",icon:"equipment",title:"装備管理",sub:"装備の確認・強化"})}
        ${menuButton({id:"openSkills",icon:"skills",title:"スキル設定",sub:"スキルの確認・強化"})}
      </nav>

      <aside class="home-right-menu" aria-label="お知らせと報酬">
        ${utilityButton({id:"openIdleReturn",icon:"chest",title:"放置報酬",value:idleReward.available?`${compactHomeNumber(idleReward.gold)}G`:"探索中",ready:idleReward.available})}
        ${utilityButton({id:"openNoticeCenter",icon:"notice",title:"お知らせ",value:noticeCount?`未読 ${noticeCount}`:"確認済み",ready:noticeCount>0})}
      </aside>

      <button type="button" id="openFormation" class="home-formation-banner">
        ${pixelIcon("formation")}<b>部隊編成</b><strong>${activeParty.length}/4</strong>
      </button>

      <button type="button" id="openRest" class="home-rest-hotspot home-rest-bed" aria-label="ベッドで休息">
        <span class="home-rest-bed-art" aria-hidden="true"></span><b>休息</b>
      </button>

      <div class="home-party-stage" aria-label="現在の編成パーティ">
        ${sceneSlots}
        <div class="home-party-drop-grid" aria-hidden="true">
          ${["front-left","front-right","back-left","back-right"].map((position,index)=>`<span class="${position}" data-home-party-drop="${index}"><b>${index+1}</b><small>ここへ移動</small></span>`).join("")}
        </div>
      </div>

      <nav class="home-bottom-nav" aria-label="画面メニュー">
        <button type="button" class="active" aria-current="page">${pixelIcon("home")}<b>ホーム</b></button>
        <button type="button" id="openOnlineParty">${pixelIcon("party")}<b>パーティ</b></button>
        <button type="button" id="openExplore">${pixelIcon("dungeon")}<b>ダンジョン</b></button>
        <button type="button" id="openItemShop">${pixelIcon("shop")}<b>ショップ</b></button>
        <button type="button" id="openEventHub" class="${eventReady?"ready":""}">${eventReady?'<i class="home-notification-dot"></i>':""}${pixelIcon("event")}<b>イベント</b></button>
      </nav>

      <small class="home-version">v${APP_VERSION}</small>
    </section>`;
}
