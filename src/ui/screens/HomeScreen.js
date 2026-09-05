import{APP_VERSION,isContentUnlocked}from"../../core/config.js?v=3.1.19-build338";
// Regression marker only: config.js?v=3.1.10-build329
// Regression history: CampaignHeroEncounterSystem.js?v=3.1.4-build323
import{displayName,calculatedStats}from"../../models/Monster.js?v=3.1.1-build311";
import{maxMp}from"../../battle/SkillSystem.js?v=3.1.1-build311";
import{SPECIES}from"../../data/species.js?v=3.1.1-build311";
import{TEAM_BATTLE_UNLOCK_FLOOR,GAUNTLET_UNLOCK_FLOOR,EMERGENCY_UNLOCK_FLOOR,hasCleared1000,worldPhase}from"../../core/EndgameSystem.js?v=3.1.1-build311";
import{monsterCombatPower,partyCombatPower,formatCombatPower}from"../../core/CombatPower.js?v=3.1.1-build311";
import{idleReturnPreview}from"../../core/ReturnRewardSystem.js?v=3.1.1-build311";
import{noticeAttentionCount}from"../../core/NoticeSystem.js?v=3.1.1-build317";
import{monsterVisual}from"../MonsterVisual.js?v=3.1.1-build311";
import{attributeCycleVisual,attributeVisual}from"../components/AttributeVisual.js?v=3.1.1-build311";
import{magicCircleMarkup}from"../../core/MagicCircleSystem.js?v=3.1.19-build338";
import{campaignDayForFloor,campaignHeroAdvance}from"../../core/Campaign100System.js?v=3.1.1-build311";
import{normalizeCampaignHeroInvasion}from"../../core/CampaignHeroEncounterSystem.js?v=3.1.5-build324";
import{normalizeCampaignReincarnationState,campaignReincarnationDifficultyMultiplier,campaignReincarnationFloorLimit}from"../../core/CampaignReincarnationSystem.js?v=3.1.5-build324";

function homeAttributeChart(){
 return attributeCycleVisual({className:"home-attribute-chart",decorative:true});
}

export function homeCriticalVitals(monster){
  if(!monster)return{critical:false,hpRate:1,mpRate:1};
  const hpMax=Math.max(1,calculatedStats(monster).hp),mpMax=Math.max(1,maxMp(monster)),hp=Math.max(0,Math.min(hpMax,Number(monster.currentHp??hpMax)||0)),mp=Math.max(0,Math.min(mpMax,Number(monster.currentMp??mpMax)||0)),hpRate=hp/hpMax,mpRate=mp/mpMax;
  return{critical:hp<=0||hpRate<=.05||mpRate<=.05,hpRate,mpRate,hp,mp,hpMax,mpMax};
}

function scenePartySlot(monster,index,state){
  // Formation order is shared with battle: slots 1–2 are the front row and
  // slots 3–4 are the rear row. Keep the scene positions deterministic so a
  // saved party never appears to change rows after returning home.
  const positions=["front-left","front-right","back-left","back-right"];
  if(!monster)return`
    <button type="button" class="home-scene-unit ${positions[index]} empty" data-open-home-formation data-home-party-slot="${index}" aria-label="スロット${index+1}を編成">
      <em class="home-slot-badge">${index+1}</em><span>＋</span>
    </button>`;
  const species=SPECIES[monster.speciesId];
  const attribute=monster.attribute??species?.element??"neutral";
  const vitals=homeCriticalVitals(monster),criticalReason=vitals.hp<=0?"戦闘不能":vitals.hpRate<=.05?"HP残量わずか":"MP残量わずか",formerFloorBoss=Boolean(monster.floorBossCatalogId||monster.floorBossId||monster.obtainedMethod==="floorBossContract");
  return`
    <button type="button" class="home-scene-unit ${positions[index]} ${vitals.critical?"is-exhausted":""} ${formerFloorBoss?"is-floor-boss":""}" data-open-home-formation data-home-party-slot="${index}" data-home-party-member="${monster.id}" aria-label="${displayName(monster)}・編成スロット${index+1}${vitals.critical?`・${criticalReason}`:""}">
      <em class="home-slot-badge">${index+1}</em><span class="home-slot-attribute" data-home-attribute-help="${attribute}" title="属性相性を確認">${attributeVisual(attribute,{label:`${attribute}属性`})}</span>
      ${magicCircleMarkup(monster,state,{className:"home-character-circle"})}
      ${monsterVisual(monster,species?.emoji??"MONSTER",{frame:vitals.critical?"down":"idle",className:"home-scene-monster-visual"})}
      ${vitals.critical?`<span class="home-exhausted-state" aria-hidden="true">${criticalReason}</span>`:""}
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
  // Keep the satisfying full number for as long as the available HUD space
  // can hold it; compact only genuinely large values.
  if(number<1_000_000)return Math.floor(number).toLocaleString();
  if(number>=1_000_000_000_000_000)return number.toExponential(2).replace("e+0","e+");
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

function menuButton({id,icon,title,sub,className="",asset=null}){
  return`<button type="button" id="${id}" class="home-command-button ${className}">
    <span class="home-command-icon">${asset?`<img src="assets/ui/v2/${asset}" alt="" class="home-command-asset">`:pixelIcon(icon)}</span>
    <span class="home-command-copy"><b>${title}</b><small>${sub}</small></span>
  </button>`;
}

function utilityButton({id,icon,title,value="",ready=false}){
  return`<button type="button" id="${id}" class="home-utility-button${ready?" ready":""}">
    ${ready?'<i class="home-notification-dot"></i>':""}
    ${pixelIcon(icon)}<b>${title}</b>${value?`<small>${value}</small>`:""}
  </button>`;
}
// Build324 regression marker: id:"openStoryArchive" / title:"予言録".
// Build325 exposes that destination from the non-overlapping Memory Room hub.

function homeMemorySignature(entries){
  const source=JSON.stringify(entries??[]);let hash=2166136261;
  for(let index=0;index<source.length;index++)hash=Math.imul(hash^source.charCodeAt(index),16777619);
  return`party-${entries?.length??0}-${(hash>>>0).toString(36)}`;
}
function homeMemoryCost(state,memory){
  if(!memory?.entries?.length)return 10;
  const signature=memory.signature??homeMemorySignature(memory.entries),attempts=Math.max(0,Math.floor(Number(state.battleMemoryAttempts?.[signature])||0));
  const base=Math.min(Number.MAX_SAFE_INTEGER,10*2**Math.min(attempts,49));
  return Math.min(Number.MAX_SAFE_INTEGER,memory.entries.some(entry=>entry.boss)?Math.ceil(base*1.5):base);
}

export function HomeScreen(state,options={}){
  const slotIds=homePartySlots(state);
  const party=slotIds.map(id=>id?state.monsters.find(monster=>monster.id===id):null);
  const activeParty=party.filter(Boolean);
  const combatPower=partyCombatPower(state);
  const idleReward=idleReturnPreview(state);
  const teamUnlocked=isContentUnlocked(state,TEAM_BATTLE_UNLOCK_FLOOR);
  const gauntletUnlocked=isContentUnlocked(state,GAUNTLET_UNLOCK_FLOOR);
  const endgameUnlocked=isContentUnlocked(state,EMERGENCY_UNLOCK_FLOOR);
  const revealed=Math.max(1,Number(state.player?.maxFloor)||1)>=70;
  // The campaign floor ledger unlocks its exit as soon as one of the four
  // 100階 gods fall. The final arena is unlocked only after the player
  // actually reaches that exit, so its durable receipt owns this CTA.
  const heroInvasion=normalizeCampaignHeroInvasion(state),reincarnation=normalizeCampaignReincarnationState(state),completed=Boolean(state.campaign100?.finalCompleted||heroInvasion.finalArena?.completed),finalReady=Boolean(heroInvasion.finalArena?.unlocked&&!completed);
  const phase=worldPhase(state);
  const sceneSlots=Array.from({length:4},(_,index)=>scenePartySlot(party[index],index,state)).join("");
  const criticalCount=activeParty.filter(monster=>homeCriticalVitals(monster).critical).length;
  const eventReady=teamUnlocked||gauntletUnlocked||endgameUnlocked||revealed;
  const noticeCount=noticeAttentionCount(state);
  const recentMemory=state.recentBattleMemory,memoryEntries=recentMemory?.entries??[],memoryCost=homeMemoryCost(state,recentMemory);
  const memoryNames=memoryEntries.slice(0,2).map(entry=>entry.nameOverride??SPECIES[entry.speciesId]?.name??"魔物").join("＋");
  const memorySub=memoryEntries.length?`${memoryNames}${memoryEntries.length>2?`ほか${memoryEntries.length-2}体`:""}・${memoryCost.toLocaleString()}晶石`:"直近の敵編成を丸ごと記録";
  const cycleFloor=campaignReincarnationFloorLimit(state),timelineFloor=heroInvasion.rewind?.active?heroInvasion.rewind.currentFloor:reincarnation.active?cycleFloor:Math.max(state.player?.currentFloor??1,state.player?.maxFloor??1),day=campaignDayForFloor(timelineFloor),remainingDays=Math.max(1,11-day),baseInvasion=campaignHeroAdvance(reincarnation.active?timelineFloor:state),invasion=heroInvasion.rewind?.active?{...baseInvasion,progress:Math.min(99,Math.max(80,timelineFloor-1)),location:`予言9日目・${timelineFloor}階`,status:"旧予言の再踏破中"}:baseInvasion,countdownTitle=day>=10?"勇者、魔王城へ到達":`魔王城まで残り${remainingDays}日`,title=completed?"勇者一行を撃退":reincarnation.active?`輪廻${reincarnation.cycle}・${countdownTitle}`:countdownTitle,prophecyLabel=completed?"予言達成・勇者軍撃退":`${reincarnation.active?`輪廻 ${reincarnation.cycle}・`:""}予言 ${day}/10・勇者侵攻 ${invasion.progress}%`,meterLabel=completed?"迎撃完了・勝利の記録":finalReady&&!heroInvasion.rewind?.active?"王室・勇者軍最終決戦へ ›":invasion.location,meterTag=finalReady&&!heroInvasion.rewind?.active?"button":"span",meterAction=finalReady&&!heroInvasion.rewind?.active?' id="openCampaignFinal" type="button" aria-label="勇者軍最終決戦へ"':"";
  const requestedServerState=String(options.serverStatus?.state??"checking"),serverState=["online","offline"].includes(requestedServerState)?requestedServerState:"checking",serverLabel=serverState==="online"?"サーバーオンライン中":serverState==="offline"?"サーバーオフライン":"サーバー確認中";

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

      <header class="home-title-card" id="openCampaignIntel" data-open-campaign-intel role="button" tabindex="0" aria-label="予言と勇者侵攻の詳細を見る">
        <small>${prophecyLabel}</small>
        <h1>${title}</h1>
        <${meterTag}${meterAction} class="home-invasion-meter ${completed?"is-complete":""} ${finalReady?"is-ready":""}"><i role="progressbar" aria-label="勇者の進軍度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${invasion.progress}"><em style="width:${invasion.progress}%"></em></i><b>${meterLabel}</b></${meterTag}>
        <span class="home-intel-cue" aria-hidden="true">詳細 ›</span>
      </header>

      ${completed?`<section class="home-postgame-strip" aria-label="クリア後の進行"><span>クリア後もそのまま継続中</span><button type="button" id="openCampaignReincarnation">輪廻を選ぶ</button></section>`:reincarnation.active?`<section class="home-postgame-strip" aria-label="輪廻進行"><span>輪廻${reincarnation.cycle}・敵戦力 ×${campaignReincarnationDifficultyMultiplier(state).toFixed(2)}</span></section>`:""}

      <div class="home-resource-bar" aria-label="所持資源">
        <span title="GOLD：${state.player.gold.toLocaleString()}" data-exact-number="${state.player.gold.toLocaleString()}G">${pixelIcon("coin")}<b>${compactHomeNumber(state.player.gold)}</b></span>
        <span title="魔晶石：${state.player.crystals.toLocaleString()}" data-exact-number="魔晶石 ${state.player.crystals.toLocaleString()}">${pixelIcon("crystal")}<b>${compactHomeNumber(state.player.crystals)}</b></span>
        <span title="捕獲結晶：${(state.inventory?.captureCrystals??0).toLocaleString()}" data-exact-number="捕獲結晶 ${(state.inventory?.captureCrystals??0).toLocaleString()}">${pixelIcon("capture")}<b>${compactHomeNumber(state.inventory?.captureCrystals??0)}</b></span>
        <span title="深淵の鍵：${(state.inventory?.abyssKeys??0).toLocaleString()}" data-exact-number="深淵の鍵 ${(state.inventory?.abyssKeys??0).toLocaleString()}">${pixelIcon("key")}<b>${compactHomeNumber(state.inventory?.abyssKeys??0)}</b></span>
        <button type="button" id="openSettings" aria-label="設定">${pixelIcon("settings")}</button>
      </div>

      <div class="home-server-status is-${serverState}" data-home-server-status data-server-state="${serverState}" role="status" aria-live="polite"><i aria-hidden="true"></i><span>${serverLabel}</span></div>

      <button type="button" class="home-attribute-orbit" data-home-attribute-help="neutral" aria-label="属性相性を確認">
        <small>属性相関</small>${homeAttributeChart()}<em>矢印方向が有利</em>
      </button>

      <button type="button" id="openCombatPowerHistory" class="home-record-card">
        <small>モンスター基盤</small>
        <strong title="最高 ${state.player.maxFloor.toLocaleString()}階">最高 <em>${compactHomeNumber(state.player.maxFloor)}</em> 階</strong>
        <i></i>
        <span>戦力・記録</span>
        <b title="戦力 ${formatCombatPower(combatPower)}">${pixelIcon("crossed-swords","record-power-icon")} ${compactHomeNumber(combatPower)}</b>
      </button>

      <nav class="home-left-menu" aria-label="主要メニュー">
        ${menuButton({id:"openGacha",icon:"summon",title:"召喚",sub:"仲間・装備を獲得"})}
        ${menuButton({id:"openMonsters",icon:"growth",title:"魔物一覧",sub:"図鑑・合成・逃す"})}
        ${menuButton({id:"openEquipment",icon:"equipment",title:"装備管理",sub:"装備の確認・強化"})}
        ${menuButton({id:"openSkills",icon:"skills",title:"スキル・深淵ツリー",sub:"戦闘スキル／恒久育成"})}
        ${menuButton({id:"openBattleMemory",icon:"memory",title:"記憶の間",sub:memoryEntries.length?`${memorySub}／物語回想`:"戦闘・物語を振り返る",className:memoryEntries.length?"memory-ready":""})}
      </nav>

      <aside class="home-right-menu" aria-label="お知らせと報酬">
        ${utilityButton({id:"openIdleReturn",icon:"chest",title:"放置報酬",value:idleReward.available?`${compactHomeNumber(idleReward.gold)}G`:"探索中",ready:idleReward.available})}
        ${utilityButton({id:"openNoticeCenter",icon:"notice",title:"お知らせ",value:noticeCount?`未読 ${noticeCount}`:"確認済み",ready:noticeCount>0})}
      </aside>

      <button type="button" id="openFormation" class="home-formation-banner">
        ${pixelIcon("formation")}<b>部隊編成</b><strong>${activeParty.length}/4</strong>
      </button>

      <button type="button" id="openRest" class="home-rest-hotspot home-rest-bed ${criticalCount?`needs-rest rest-level-${Math.min(4,criticalCount)}`:""}" aria-label="${criticalCount?`${criticalCount}体が限界です。ベッドで休息`:`ベッドで休息`}">
        <span class="home-rest-bed-art" aria-hidden="true"></span>
        ${criticalCount?`<span class="home-rest-callout"><b>休息できます</b><small>限界 ${criticalCount}体</small></span>`:""}
      </button>

      <div class="home-party-stage" aria-label="現在の編成パーティ">
        ${sceneSlots}
        <div class="home-party-drop-grid" aria-hidden="true">
          ${["front-left","front-right","back-left","back-right"].map((position,index)=>`<span class="${position}" data-home-party-drop="${index}"><b>${index+1}</b><small>${index<2?"前衛":"後衛"}</small></span>`).join("")}
        </div>
      </div>

      <nav class="home-bottom-nav" aria-label="画面メニュー">
        <button type="button" class="active" aria-current="page">${pixelIcon("home")}<b>ホーム</b></button>
        <button type="button" id="openOnlineParty">${pixelIcon("party")}<b>パーティ</b></button>
        <button type="button" id="openExplore">${pixelIcon("dungeon")}<b>ダンジョン</b></button>
        <button type="button" id="openItemShop">${pixelIcon("shop")}<b>ショップ</b></button>
        <button type="button" id="openEventHub" class="${eventReady?"ready":""}">${eventReady?'<i class="home-notification-dot"></i>':""}${pixelIcon("event")}<b>試練</b></button>
      </nav>

      <small class="home-version">v${APP_VERSION}</small>
    </section>`;
}
