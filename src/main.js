import{SaveService}from"./services/SaveService.js?v=2.0.0-release";
import{CONTENT_TEST_MODE,BATTLE_SPEED_OPTIONS,CAMERA_DRAG_THRESHOLD_PX,WATER_RULES,normalizeBattleSpeed,contentUnlockFloor,isContentUnlocked}from"./core/config.js?v=2.0.0-release";
import{AudioSystem}from"./core/AudioSystem.js?v=2.0.0-release";
import{endgameCharacter}from"./data/endgameCharacters.js?v=2.0.0-release";
import{SPECIES}from"./data/species.js?v=1.9.0-monster-catalog";
import{captureStatusBonus,normalizePersistentAilments}from"./data/statusEffects.js?v=1.8.0-gdd-v1";
import{orderedMonsterSpecies}from"./data/monsterCatalog.js?v=2.0.0-release";
import{HomeScreen,homePartySlots}from"./ui/screens/HomeScreen.js?v=1.8.0-gdd-v1";
import{FormationScreen}from"./ui/screens/FormationScreen.js?v=1.8.0-gdd-v1";
import{MonsterListScreen}from"./ui/screens/MonsterListScreen.js?v=1.7.8-delta120";
import{MonsterDetailScreen}from"./ui/screens/MonsterDetailScreen.js?v=2.0.0-release";
import{SettingsScreen}from"./ui/screens/SettingsScreen.js?v=2.0.0-release";
import{ExploreScreen}from"./ui/screens/ExploreScreen.js?v=1.8.0-gdd-v1";
import{BattleScreen}from"./ui/screens/BattleScreen.js?v=1.8.0-gdd-v1";
import{Modal}from"./ui/components/Modal.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{pixelIcon}from"./ui/components/GameChrome.js?v=1.7.7-final";
import{createMonster,displayName,calculatedStats,TRAITS,expNeedFor,limitBreakGrowth,affectionBonuses,totalExperience,applyTotalExperience}from"./models/Monster.js?v=1.8.0-gdd-v1";
import{createEquipment,equipmentPower,equipmentStatMultiplier}from"./models/Equipment.js?v=1.14.0-alpha124";
import{equipmentExpNeed,equipmentMaterialExp,enhancementMaterialCandidates,consumeEquipmentMaterials,projectEquipmentGrowth}from"./services/EquipmentEnhancement.js?v=1.14.0-alpha124";
import{recordWeaponKill,weaponMasteryDamageMultiplier,weaponMasterySummary}from"./services/WeaponMastery.js?v=1.9.0-monster-catalog";
import{normalizeSeriesMastery,recordSeriesBattle,seriesMasteryBonusForMonster,seriesMasterySummary}from"./services/SeriesMastery.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{receiveEquipment,takeFromStorage,equipmentSellPrice,slotLabel}from"./services/EquipmentStorage.js?v=1.14.0-alpha124";
import{RARITY_ORDER,EQUIPMENT_BASES,equipmentDisplayRarity,equipmentRarityColor,equipmentStatLabel,equipmentSubslotLabel,compatibleSubslots,SLOT_UNLOCK_LEVEL}from"./data/equipment.js?v=2.0.0-release";
import{EQUIPMENT_SERIES,aggregateSeriesEffects}from"./data/equipmentSeries.js?v=2.0.0-release";
import{AFFIX_QUALITY,aggregateAffixes,affixQuality,formatAffix,affixDefinition}from"./data/equipmentAffixes.js?v=1.2.0";
import{EquipmentScreen}from"./ui/screens/EquipmentScreen.js?v=2.0.0-release";
import{lockedAffixCount,maxLockableAffixes,normalizeEquipmentAffixLocks,rerollGoldCost,rerollUnlockedAffixes,toggleAffixLock}from"./services/EquipmentAffixCrafting.js?v=1.14.0-alpha124";
import{assignEquipmentToSubslot,canEquipInSubslot,emptyEquipmentLoadout,normalizeEquipmentLoadouts}from"./services/EquipmentLoadoutSystem.js?v=2.0.0-release";
import{ShopScreen}from"./ui/screens/ShopScreen.js?v=1.8.0-gdd-v1";
import{SkillScreen}from"./ui/screens/SkillScreen.js?v=1.8.0-gdd-v1";
import{AbyssSkillTreeScreen}from"./ui/screens/AbyssSkillTreeScreen.js?v=1.7.3-alpha112";
import{InventoryScreen,ArmoryScreen}from"./ui/screens/InventoryScreen.js?v=1.14.0-alpha124";
import{abyssEquipmentRarityBonus,abyssExplorationChance,abyssSkillEffectTotal,abyssSkillEffects,abyssSkillMultiplier,abyssSkillNodeById,abyssSkillTreeSummary,learnAbyssSkill,resetAbyssSkillTree}from"./core/AbyssSkillTreeSystem.js?v=1.7.3-alpha112";
import{Ending1000Screen}from"./ui/screens/Ending1000Screen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{Ending10000Screen}from"./ui/screens/Ending10000Screen.js?v=1.0.0";
import{SecondWorldIntroScreen}from"./ui/screens/SecondWorldIntroScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{worldPresentationForFloor,shouldPlaySecondWorldIntro,markSecondWorldEntered}from"./core/WorldSystem.js?v=1.8.0-gdd-v1";
import{randomEventForFloor,markRandomEventResolved,randomEventCosts}from"./core/SecondWorldEventSystem.js?v=1.1.0";
import{shouldSpawnSecondWorldElite,createEliteEncounter,applyEliteModifiers,recordEliteEncounter,recordEliteDefeat,eliteRewards}from"./core/SecondWorldEliteSystem.js?v=1.1.0";
import{shouldPlayTenGodFirstContact,tenGodContactChoices,resolveTenGodFirstContact}from"./core/TenGodContactSystem.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{TenGodContactScreen}from"./ui/screens/TenGodContactScreen.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{maxMp,learnedSkills,allLearnedSkills,equipSkill,skillById,skillElementLabel,canUseSkill,effectiveSkillMpCost,skillDamage,affixOutgoingDamageMultiplier,chooseAutoSkill,skillProgressFor,recordSkillUse}from"./battle/SkillSystem.js?v=2.0.0-release";
import{ENEMY_ACTIONS,createEnemyBattleState,chooseEnemyAction,enemyDamageMultiplier,enemyHealAmount,enemyAttackMultiplier,specialActionMultiplier,specialActionInfo}from"./battle/EnemyAI.js?v=2.0.0-release";
import{createBattleRulesState,cooldownRemaining,setSkillCooldown,tickCooldowns,addBattleLog,applyEnemyStatus,processEnemyStatuses,applyBattleEffect,effectValue,hasEffect,clearNegativeAllyEffects,clearPersistentAilments,syncPersistentAilments,tickBattleEffects,processAllyEffects}from"./battle/BattleRules.js?v=2.0.0-release";
import{buildTurnQueue,currentTurnEntry,currentAlly,currentEnemy,aliveEnemies,selectedEnemy,advanceQueue,queueFinished,skipInvalidEntries}from"./battle/TurnSystem.js?v=1.8.0-gdd-v1";
import{dangerConfig}from"./core/DangerSystem.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{bossLevelForFloor}from"./core/EnemyScalingSystem.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{biomeForFloor,biomeProgress,recordBiomeFloor,recordBiomeEncounter,recordBiomeChest,recordBiomeBoss}from"./data/biomes.js?v=0.9.15-alpha.28-phase10-6-consistency";
import{WORLD_MAX_FLOOR,TEAM_BATTLE_UNLOCK_FLOOR,EMERGENCY_UNLOCK_FLOOR,ENDGAME_BOSSES,ENDGAME_TRIALS,normalizeEndgameState,dailyTeamAttempts,createTeamBattleEncounter,createEndgameTrialEncounter,recordEndgameTrialResult,shouldTriggerEmergency,createEmergencyEncounter,recordEmergencyResult,awardEmergencyFragments,emergencyFragmentStatus,craftEndgameEquipment,endgamePreludeOptions,resolveEndgamePrelude,applyPreludeToEncounter,attemptEndgameContract,specialBattleSettlement,recordSpecialBattleSettlement,hasCleared1000,mark1000FloorCleared,mark10000FloorCleared,worldRegionForFloor}from"./core/EndgameSystem.js?v=2.0.0-release";
import{beginManualExpedition,recordManualFloorClear,claimManualReturn,abandonManualExpedition,idleReturnPreview,claimIdleReturn,returnRarityRates,returnRewardGrade,goldForClearedFloor}from"./core/ReturnRewardSystem.js?v=1.14.0-alpha124";
import{modifiedGoldReward}from"./core/GoldRewardSystem.js?v=1.7.3-alpha112";
import{battleGoldBase,chestGoldBase,secondWorldEventGoldBase,specialBattleGoldBase}from"./core/GoldEconomySystem.js?v=1.1.0";
import{monsterCombatPower,partyCombatPower,formatCombatPower,recordPartyCombatPower}from"./core/CombatPower.js?v=1.8.0-gdd-v1";
import{beginSecretRoomExpedition,ensureSecretRoomExpedition,secretRoomPlan,enterSecretRoom,activeSecretRoom,spinSecretRoomCasino,useSecretRoomInn,buyDarkMarketOffer,buyDarkMarketRecovery,SECRET_ROOM_RECOVERY_ITEMS,DARK_MARKET_ITEM_LIMIT,CASINO_CRYSTAL_COST,CASINO_MULTIPLIER_RATES}from"./core/SecretRoomSystem.js?v=1.8.0-gdd-v1";
import{applySerialReward,commitSerialRedemption,validateSerialCode}from"./core/SerialCodeSystem.js?v=1.8.0-gdd-v1";
import{NOTICE_DEFINITIONS,markAllNoticesRead,normalizeNoticeState}from"./core/NoticeSystem.js?v=1.7.3";
import{monsterSpriteUrl,monsterVisual,setMonsterVisualFrame}from"./ui/MonsterVisual.js?v=2.0.0-release";

const TILE=88,COLS=39,ROWS=39,app=document.getElementById("app"),save=new SaveService(),audio=new AudioSystem(()=>save.state.settings);
let screen="home",selected=null,equipmentTarget=null,equipmentFocusItemId=null,skillTarget=null,skillSlotSelection=0,abyssSkillCategory="economy",inventoryCategory="all",inventorySort="rarity",game=null,battle=null,snapshot=null,activeEnemy=null,navigationOrigin="home",skillNavigationOrigin="home",inventoryNavigationOrigin="home",settingsNavigationOrigin="home",detailNavigationOrigin="monsters",formationOrigin="home",lastExploreCombatPower=null;
document.addEventListener("pointerdown",()=>audio.unlock(),{once:true,passive:true});
let secondWorldIntroPlaying=false;
let tenGodContactPlaying=false;
let monsterManage={editing:false,selected:new Set()},equipmentManage={editing:false,selected:new Set()};
let partyEditorState={search:"",element:"all",status:"all",sort:"rarity",direction:"desc"};
let monsterListState={search:"",sort:"power",direction:"desc"};
let formationPickerState={search:"",sort:"power",direction:"desc"};
let monsterWorkshop={speciesId:null,tab:"combine",targetId:null,selected:new Set()};
const UI_EMOJI_ICONS=new Map([
 ["⚔️","crossed-swords"],["⚔","crossed-swords"],["🗡️","equipment"],["🗡","equipment"],["🛡️","equipment"],["🛡","equipment"],
 ["🪙","coin"],["💰","coin"],["💎","crystal"],["🔷","crystal"],["💠","crystal"],["🔑","key"],["🗝️","key"],["🗝","key"],
 ["🔮","summon"],["🌑","summon"],["🌀","summon"],["🎁","present"],["📦","chest"],["🗃️","chest"],["🗃","chest"],
 ["🏰","dungeon"],["🚪","dungeon"],["🗺️","map"],["🗺","map"],["📍","map"],["🏠","home"],["🏡","home"],
 ["📖","skills"],["📜","skills"],["🕯️","skills"],["🕯","skills"],["✨","skills"],["🌟","skills"],["✦","skills"],
 ["🛏️","rest"],["🛏","rest"],["🌿","growth"],["🧪","growth"],["⚗️","growth"],["⚗","growth"],["💚","growth"],
 ["💧","growth"],["🌊","growth"],["🍃","growth"],["🩹","growth"],["💨","growth"],["🔨","equipment"],["⚒️","equipment"],
 ["⚒","equipment"],["🎲","equipment"],["💍","equipment"],["🤝","formation"],["👥","formation"],["👑","event"],
 ["☠️","event"],["☠","event"],["⌛","event"],["⏳","event"],["🎟️","notice"],["🎟","notice"],["⚠️","notice"],
 ["⚠","notice"],["❔","notice"],["❓","notice"],["📣","notice"],["✉️","notice"],["✉","notice"]
]);
const UI_EMOJI_TOKENS=[...UI_EMOJI_ICONS.keys()].sort((a,b)=>b.length-a.length);
function pixelIconElement(name){
 const icon=document.createElement("span");
 icon.className=`home-pixel-icon icon-${name} inline-pixel-icon`;
 icon.setAttribute("aria-hidden","true");
 return icon;
}
function pixelizeUiEmoji(root=app){
 if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  const parent=node.parentElement,text=node.nodeValue??"";
  if(!parent||parent.closest("script,style,textarea,input,[data-keep-emoji]")||!UI_EMOJI_TOKENS.some(token=>text.includes(token)))continue;
  const fragment=document.createDocumentFragment();
  let cursor=0;
  while(cursor<text.length){
   const token=UI_EMOJI_TOKENS.find(entry=>text.startsWith(entry,cursor));
   if(token){fragment.append(pixelIconElement(UI_EMOJI_ICONS.get(token)));cursor+=token.length;continue}
   const next=cursor+([...text.slice(cursor)][0]?.length??1);
   fragment.append(document.createTextNode(text.slice(cursor,next)));cursor=next;
  }
  node.replaceWith(fragment);
 }
}
const uiEmojiObserver=new MutationObserver(records=>{
 for(const record of records)for(const node of record.addedNodes){
  if(node.nodeType===Node.TEXT_NODE)pixelizeUiEmoji(node.parentElement);
  else if(node.nodeType===Node.ELEMENT_NODE)pixelizeUiEmoji(node);
 }
});
uiEmojiObserver.observe(app,{childList:true,subtree:true});
function escapeAttribute(value){return String(value??"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
function topModal(){const mods=document.querySelectorAll(".game-modal");return mods[mods.length-1]??null}
function topModalButton(){return topModal()?.querySelector("[data-modal-primary]")??null}
function closeTopModal(){topModal()?.remove()}
function showToast(text){document.querySelector(".game-toast")?.remove();const el=document.createElement("div");el.className="game-toast";el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),1400)}
let lastSaveErrorNotice=0;window.addEventListener("abyss-save-error",event=>{const now=Date.now();if(now-lastSaveErrorNotice<5000)return;lastSaveErrorNotice=now;const quota=Boolean(event.detail?.quota),message=quota?"セーブ容量が上限に達しました。不要な装備やモンスターを整理してください。":"セーブに失敗しました。空き容量を確認して、画面を閉じずに再度操作してください。";showToast("⚠️ "+message);setTimeout(()=>{if(document.querySelector("[data-save-error-modal]"))return;app.insertAdjacentHTML("beforeend",Modal("⚠️ セーブ失敗",`<div data-save-error-modal><p><b>${message}</b></p><p class="muted">直前まで正常に保存されていたデータは維持されています。現在の変更は保存されていない可能性があります。</p></div>`,`確認`));topModalButton().onclick=closeTopModal},50)});
let lastCapacityNotice={save:0,equipment:0,keys:0};window.addEventListener("abyss-save-success",event=>{const now=Date.now(),bytes=Math.max(0,Number(event.detail?.bytes)||0),equipmentTotal=(save.state.equipment?.length??0)+(save.state.reserveEquipment?.length??0)+(save.state.bossEquipmentVault?.length??0),keys=Math.max(0,Number(save.state.inventory?.abyssKeys)||0);save.state.flags??={};save.state.flags.abyssKeyExchangePreviewUnlocked=keys>=250;if(bytes>=4500000&&now-lastCapacityNotice.save>60000){lastCapacityNotice.save=now;showToast("⚠️ セーブ容量が4.5MBを超えています。装備整理を強く推奨します")}else if(bytes>=4000000&&now-lastCapacityNotice.save>60000){lastCapacityNotice.save=now;showToast("⚠️ セーブ容量が4MBを超えました。装備を整理してください")}if(equipmentTotal>=900&&now-lastCapacityNotice.equipment>60000){lastCapacityNotice.equipment=now;showToast("⚠️ 装備が900個以上あります。セーブ保護のため整理してください")}else if(equipmentTotal>=700&&now-lastCapacityNotice.equipment>60000){lastCapacityNotice.equipment=now;showToast("⚠️ 装備が700個以上あります")}if(keys>=500&&now-lastCapacityNotice.keys>60000){lastCapacityNotice.keys=now;showToast("🔑 深淵の鍵がかなり余っています（500個以上）")}else if(keys>=250&&now-lastCapacityNotice.keys>60000){lastCapacityNotice.keys=now;showToast("🔑 深淵の鍵が250個以上あります")}});
async function playSecondWorldIntro(){
 if(secondWorldIntroPlaying||!shouldPlaySecondWorldIntro(save.state))return false;
 secondWorldIntroPlaying=true;stopGame();document.querySelector(".second-world-intro")?.remove();
 app.insertAdjacentHTML("beforeend",SecondWorldIntroScreen());const overlay=document.querySelector(".second-world-intro");if(!overlay){secondWorldIntroPlaying=false;return false}
 requestAnimationFrame(()=>overlay.classList.add("is-visible"));
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));await wait(500);
 for(const line of overlay.querySelectorAll("[data-second-world-line]")){line.classList.add("is-visible");await wait(850)}
 overlay.querySelector("[data-second-world-title]")?.classList.add("is-awakened");await wait(1100);
 const enter=overlay.querySelector("[data-second-world-enter]");enter.classList.add("is-visible");
 await new Promise(resolve=>enter.addEventListener("click",resolve,{once:true}));
 markSecondWorldEntered(save.state);save.save();overlay.classList.add("is-closing");await wait(650);overlay.remove();secondWorldIntroPlaying=false;screen="explore";render();return true;
}


async function playTenGodFirstContact(){
 if(tenGodContactPlaying||!game||!shouldPlayTenGodFirstContact(save.state))return false;
 tenGodContactPlaying=true;game.paused=true;document.querySelector(".ten-god-contact")?.remove();
 app.insertAdjacentHTML("beforeend",TenGodContactScreen(tenGodContactChoices()));
 const overlay=document.querySelector(".ten-god-contact"),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 if(!overlay){tenGodContactPlaying=false;game.paused=false;return false}
 requestAnimationFrame(()=>overlay.classList.add("is-visible"));await wait(500);
 for(const line of overlay.querySelectorAll("[data-ten-god-line]")){line.classList.add("is-visible");await wait(900)}
 overlay.querySelector("[data-ten-god-choices]")?.classList.add("is-visible");
 const choiceId=await new Promise(resolve=>overlay.querySelectorAll("[data-ten-god-choice]").forEach(button=>button.addEventListener("click",()=>resolve(button.dataset.tenGodChoice),{once:true})));
 const result=resolveTenGodFirstContact(save.state,choiceId,{recoverParty:fullyRecoverParty});save.save();
 overlay.classList.add("is-resolved");const content=overlay.querySelector(".ten-god-contact-content");
 content.innerHTML=`<small>CONTACT RECORDED</small><div class="ten-god-contact-sigil">◉</div><p class="ten-god-voice is-visible">${result.message}</p><button type="button" class="primary" data-ten-god-close>探索へ戻る</button>`;
 await new Promise(resolve=>content.querySelector("[data-ten-god-close]").addEventListener("click",resolve,{once:true}));
 overlay.classList.add("is-closing");await wait(600);overlay.remove();tenGodContactPlaying=false;game.paused=false;return true;
}

function secondWorldEventChoiceBody(event){
 const costs=randomEventCosts(event,event.floor);
 const descriptions={
  "buy-key":`ゴールド ${costs.keyGold?.toLocaleString()??0}G`,
  "buy-rest":`魔晶石 ${costs.restCrystals??0}個`,
  "seal":`魔晶石 ${costs.sealCrystals??0}個`
 };
 return`<div class="second-world-event"><div class="second-world-event-icon">${event.icon}</div><p>${event.text}</p><div class="second-world-event-choices">${event.choices.map(choice=>`<button type="button" data-second-world-choice="${choice.id}"><b>${choice.label}</b><small>${descriptions[choice.id]??choice.description}</small></button>`).join("")}</div></div>`;
}
function resolveSecondWorldRandomEvent(event,choice){
 const floor=event.floor,costs=randomEventCosts(event,floor),party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);
 let result="何も起こらなかった。",elite=false;
 if(event.id==="abyss-altar"&&choice==="offer"){let lost=0;party.filter(m=>(m.currentHp??calculatedStats(m).hp)>1).forEach(m=>{const max=calculatedStats(m).hp,damage=Math.max(1,Math.floor(max*.2));m.currentHp=Math.max(1,(m.currentHp??max)-damage);lost+=damage});const gain=2+Math.floor((floor-1000)/250);save.state.player.crystals+=gain;result=`生命力を${lost}失い、魔晶石を${gain}個得た。`}
 else if(event.id==="abyss-altar"&&choice==="pray"){party.filter(m=>(m.currentHp??0)>0).forEach(m=>{const st=calculatedStats(m);m.currentHp=Math.min(st.hp,(m.currentHp??st.hp)+Math.max(1,Math.floor(st.hp*.25)));m.currentMp=Math.min(maxMp(m),(m.currentMp??maxMp(m))+Math.max(1,Math.floor(maxMp(m)*.25)))});result="祭壇の火が揺らぎ、パーティーのHP・MPが回復した。"}
 else if(event.id==="lost-merchant"&&choice==="buy-key"){if(save.state.player.gold<costs.keyGold)return{ok:false,message:`ゴールドが足りない。必要：${costs.keyGold.toLocaleString()}G`};save.state.player.gold-=costs.keyGold;save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+1;result="顔のない商人から、深淵の鍵を1個受け取った。"}
 else if(event.id==="lost-merchant"&&choice==="buy-rest"){if(save.state.player.crystals<costs.restCrystals)return{ok:false,message:`魔晶石が足りない。必要：${costs.restCrystals}個`};save.state.player.crystals-=costs.restCrystals;party.forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)});result="黒い香が燃え尽き、パーティーは完全回復した。"}
 else if(event.id==="abyss-crystal"&&choice==="harvest"){const gain=1+Math.floor(((floor*7)%4));save.state.player.crystals+=gain;result=`深淵結晶から魔晶石を${gain}個採取した。`}
 else if(event.id==="abyss-crystal"&&choice==="break"){const gold=modifiedGoldReward(save.state,secondWorldEventGoldBase(floor,"break"),"exploration");save.state.player.gold+=gold;if(game)game.world.nextEncounter=Math.min(game.world.nextEncounter,game.world.steps+2);result=`結晶を砕き、${gold.toLocaleString()}Gを得た。遠くで何かが目覚めた……。`}
 else if(event.id==="warped-rift"&&choice==="challenge"){result="裂け目の向こうから、強大な魔物が現れた。";elite=true}
 else if(event.id==="warped-rift"&&choice==="seal"){if(save.state.player.crystals<costs.sealCrystals)return{ok:false,message:`魔晶石が足りない。必要：${costs.sealCrystals}個`};save.state.player.crystals-=costs.sealCrystals;const gold=modifiedGoldReward(save.state,secondWorldEventGoldBase(floor,"seal"),"exploration");save.state.player.gold+=gold;save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+1;result=`裂け目を封じ、${gold.toLocaleString()}Gと深淵の鍵を1個得た。`}
 markRandomEventResolved(save.state,floor,event.id);save.save();return{ok:true,message:result,elite};
}
function showSecondWorldRandomEvent(){
 const event=randomEventForFloor(save.state,save.state.player.currentFloor);if(!event||!game)return false;
 game.paused=true;app.insertAdjacentHTML("beforeend",Modal(`${event.icon} ${event.title}`,secondWorldEventChoiceBody(event),"立ち去る"));
 const modal=topModal(),finish=(choice="leave")=>{const outcome=resolveSecondWorldRandomEvent(event,choice);if(!outcome.ok){showToast(outcome.message);return}modal.remove();game.paused=false;if(outcome.elite){pauseModal("⚠️ 裂け目の番人",`<p>${outcome.message}</p><p class="muted">通常より強い敵だ。勝利すれば高い報酬が期待できる。</p>`);const warning=topModal();warning.querySelector("[data-modal-primary]").textContent="戦う";warning.querySelector("[data-modal-primary]").onclick=()=>{warning.remove();game.paused=false;beginEncounter(createEliteEncounter({...randomEnemy(),level:enemyLevelForFloor(event.floor)+18,boss:false,equipped:true},event.floor,{forced:true}))};return}pauseModal(event.title,`<p>${outcome.message}</p>`)};
 modal.querySelectorAll("[data-second-world-choice]").forEach(button=>button.onclick=()=>finish(button.dataset.secondWorldChoice));modal.querySelector("[data-modal-primary]").onclick=()=>finish("leave");modal._onDismiss=()=>finish("leave");return true;
}

async function play1000EndingSequence(){
 document.querySelector(".ending1000")?.remove();
 app.insertAdjacentHTML("beforeend",Ending1000Screen());
 const overlay=document.querySelector(".ending1000");if(!overlay)return;
 document.querySelectorAll("audio").forEach(audio=>{try{audio.pause()}catch{}});
 let skipResolve;const skipPromise=new Promise(resolve=>skipResolve=resolve),skip=overlay.querySelector(".ending1000-skip");
 skip.onclick=()=>skipResolve("skip");
 const pause=ms=>Promise.race([new Promise(resolve=>setTimeout(resolve,ms)),skipPromise]);
 requestAnimationFrame(()=>overlay.classList.add("is-visible"));
 await pause(650);
 for(const line of overlay.querySelectorAll("[data-ending-line]")){line.classList.add("is-visible");const result=await pause(1700);if(result==="skip")break}
 if(!overlay.isConnected)return;
 overlay.classList.add("show-credits");
 let result=await pause(9000);
 if(!overlay.isConnected)return;
 overlay.classList.remove("show-credits");overlay.classList.add("show-anomaly");
 if(result!=="skip")await pause(3200);
 save.state.flags??={};save.state.flags.ending1000Played=true;save.save();
 overlay.classList.add("is-closing");await new Promise(resolve=>setTimeout(resolve,650));overlay.remove();
 battle=null;snapshot=null;screen="explore";render();
}
async function play10000EndingSequence(){
 document.querySelector(".ending10000")?.remove();
 app.insertAdjacentHTML("beforeend",Ending10000Screen());
 const overlay=document.querySelector(".ending10000");if(!overlay)return false;
 document.querySelectorAll("audio").forEach(audio=>{try{audio.pause()}catch{}});
 let skipResolve;const skipPromise=new Promise(resolve=>skipResolve=resolve),skip=overlay.querySelector(".ending10000-skip"),pause=ms=>Promise.race([new Promise(resolve=>setTimeout(resolve,ms)),skipPromise]);
 skip.onclick=()=>skipResolve("skip");
 requestAnimationFrame(()=>overlay.classList.add("is-visible"));await pause(650);
 for(const line of overlay.querySelectorAll("[data-true-ending-line]")){line.classList.add("is-visible");const result=await pause(1550);if(result==="skip")break}
 if(!overlay.isConnected)return false;
 overlay.classList.add("show-dominion");let result=await pause(3600);
 if(!overlay.isConnected)return false;
 overlay.classList.remove("show-dominion");overlay.classList.add("show-credits");if(result!=="skip")await pause(8000);
 save.state.flags??={};mark10000FloorCleared(save.state);save.state.flags.ending10000Played=true;save.save();
 overlay.classList.add("is-closing");await new Promise(resolve=>setTimeout(resolve,650));overlay.remove();
 battle=null;activeEnemy=null;screen="explore";render();return true;
}
document.addEventListener("click",e=>{const b=e.target.closest?.("[data-modal-dismiss]");if(!b)return;const modal=b.closest(".game-modal");if(typeof modal?._onDismiss==="function"){modal._onDismiss();return}modal?.remove();if(game?.paused&&!document.querySelector(".game-modal"))game.paused=false});
// Mobile game controls: prevent accidental selection/callout/zoom while preserving scrolling.
document.addEventListener("contextmenu",e=>{if(!e.target.closest("input,textarea"))e.preventDefault()});
document.addEventListener("selectstart",e=>{if(!e.target.closest("input,textarea"))e.preventDefault()});
let lastTouchEnd=0;document.addEventListener("touchend",e=>{const now=Date.now();if(now-lastTouchEnd<320&&!e.target.closest("input,textarea"))e.preventDefault();lastTouchEnd=now},{passive:false});

class Entity{constructor(x,y){this.x=x;this.y=y;this.rx=x;this.ry=y;this.path=[];this.p=0}setPath(p){this.path=p;this.p=0}move(dt,s){if(!this.path.length)return false;const t=this.path[0];this.p+=dt*s;const n=Math.min(1,this.p);this.rx=this.x+(t.x-this.x)*n;this.ry=this.y+(t.y-this.y)*n;if(this.p>=1){this.x=t.x;this.y=t.y;this.rx=this.x;this.ry=this.y;this.path.shift();this.p=0;return true}return false}}
class Camera{constructor(c){this.c=c;this.x=TILE;this.y=TILE;this.z=.85;this.ox=0;this.oy=0;this.manual=false}world(wx,wy){return{x:(wx-this.x)*this.z+this.c.width/2+this.ox,y:(wy-this.y)*this.z+this.c.height/2+this.oy}}screen(sx,sy){return{x:(sx-this.c.width/2-this.ox)/this.z+this.x,y:(sy-this.c.height/2-this.oy)/this.z+this.y}}pan(dx,dy){this.ox+=dx;this.oy+=dy;this.manual=true}reset(px,py){this.x=px;this.y=py;this.ox=0;this.oy=0;this.z=.85;this.manual=false}follow(px,py){if(this.manual)return;const p=this.world(px,py),l=this.c.width*.34,r=this.c.width*.66,t=this.c.height*.34,b=this.c.height*.66;if(p.x<l)this.x+=(p.x-l)/this.z*.12;if(p.x>r)this.x+=(p.x-r)/this.z*.12;if(p.y<t)this.y+=(p.y-t)/this.z*.12;if(p.y>b)this.y+=(p.y-b)/this.z*.12}clamp(w){const edge=30,mw=w.cols*TILE*this.z,mh=w.rows*TILE*this.z,ml=this.c.width/2-this.x*this.z,mt=this.c.height/2-this.y*this.z,minX=edge-(ml+mw),maxX=this.c.width-edge-ml,minY=edge-(mt+mh),maxY=this.c.height-edge-mt;this.ox=mw<=this.c.width-edge*2?(this.c.width-mw)/2-ml:Math.max(minX,Math.min(maxX,this.ox));this.oy=mh<=this.c.height-edge*2?(this.c.height-mh)/2-mt:Math.max(minY,Math.min(maxY,this.oy))}}
normalizeEndgameState(save.state);
function equipmentAffixesWithSeries(items,seriesEffects){
 const result=aggregateAffixes(items);
 for(const item of items??[])for(const[key,value]of Object.entries(item.fixedEffects??{})){const amount=Number(value);if(Number.isFinite(amount))result[key]=(result[key]??0)+amount}
 const addRate=(target,key=target)=>{
  const rate=Number(seriesEffects[key])||0;
  if(rate)result[target]=(result[target]??0)+rate*100;
 };
 for(const key of["fireDamage","healPower","guardPower","dropRate","critDamage","skillPower","freeSkillChance","chainChance","burnChance","execution"])addRate(key);
 addRate("captureRate","capture");
 addRate("regen","hpRegen");
 addRate("mpPct","mp");
 addRate("fireRes");
 addRate("statusResistance","statusRes");
 const mpCost=Number(seriesEffects.mpCost)||0;
 if(mpCost<0)result.mpCostReduction=(result.mpCostReduction??0)+Math.abs(mpCost)*100;
 return result;
}
function normalizeEquipmentState(){
 save.state.equipment??=[];save.state.reserveEquipment??=[];save.state.bossEquipmentVault??=[];save.state.settings??={};
 save.state.settings.equipmentSort??="rarity";save.state.settings.equipmentSlot??="weapon";save.state.settings.equipmentStorage??="inventory";
 save.state.gacha??={firstTenUsed:false,lastDailyKey:null};save.state.codex??={encounters:{},captures:{},equipment:{}};save.state.codex.encounters??={};save.state.codex.captures??={};save.state.codex.equipment??={};save.state.rest??={lastFreeKey:null};
 const{byId}=normalizeEquipmentLoadouts(save.state);
 const abyssEffects=abyssSkillEffects(save.state);
 save.state.monsters.forEach(m=>{
  m.traitId??="steady";
  const counts={},stats={},equippedItems=[];Object.values(m.equipment).forEach(id=>{const item=byId.get(id);if(!item)return;equippedItems.push(item);const mult=equipmentStatMultiplier(item);Object.entries(item.stats??{}).forEach(([k,v])=>stats[k]=(stats[k]??0)+Math.round(v*mult));if(item.series)counts[item.series]=(counts[item.series]??0)+1});
  const seriesEffects=aggregateSeriesEffects(counts);
  m._equipmentStats=stats;m._equipmentAffixes=equipmentAffixesWithSeries(equippedItems,seriesEffects);m._seriesCounts=counts;m._seriesEffects=seriesEffects;m._seriesMasteryBonus=seriesMasteryBonusForMonster(save.state,counts);
  Object.defineProperty(m,"_abyssSkillEffects",{value:abyssEffects,writable:true,configurable:true,enumerable:false});
  const natural=calculatedStats(m),mp=maxMp(m);
  if(m.currentHp==null||!Number.isFinite(m.currentHp))m.currentHp=natural.hp;else m.currentHp=Math.max(0,Math.min(natural.hp,m.currentHp));
  if(m.currentMp==null||!Number.isFinite(m.currentMp))m.currentMp=mp;else m.currentMp=Math.max(0,Math.min(mp,m.currentMp));
 });
}
function render(){
 closeInventoryContext();
 normalizeEquipmentState();
 const powerRecord=recordPartyCombatPower(save.state);if(powerRecord.changed)save.save();
 document.body.classList.toggle("phase2",hasCleared1000(save.state));
 audio.setScene(screen==="explore"?"explore":"home");
 if(screen==="home"){app.innerHTML=HomeScreen(save.state);bindHome()}
 else if(screen==="formation"){app.innerHTML=FormationScreen(save.state,{origin:formationOrigin});bindFormation()}
 else if(screen==="monsters"){app.innerHTML=MonsterListScreen(save.state,{...monsterManage,...monsterListState});bindList()}
 else if(screen==="detail"){const m=save.state.monsters.find(x=>x.id===selected);app.innerHTML=MonsterDetailScreen(m,save.state);bindDetail(m)}
 else if(screen==="settings"){app.innerHTML=SettingsScreen(save.state);bindSettings()}
 else if(screen==="explore"){app.innerHTML=ExploreScreen(save.state);bindExplore()}
 else if(screen==="equipment"){if(!save.state.party.includes(equipmentTarget))equipmentTarget=save.state.party[0]??save.state.monsters[0]?.id;app.innerHTML=EquipmentScreen(save.state,equipmentTarget,{home:navigationOrigin==="home",focusItemId:equipmentFocusItemId,...equipmentManage});bindEquipment()}
 else if(screen==="shop"){app.innerHTML=ShopScreen(save.state);bindShop()}
 else if(screen==="skills"){skillTarget=save.state.monsters.some(m=>m.id===skillTarget)?skillTarget:(save.state.party[0]??save.state.monsters[0]?.id);app.innerHTML=SkillScreen(save.state,skillTarget);bindSkills()}
 else if(screen==="abyssSkills"){app.innerHTML=AbyssSkillTreeScreen(save.state,abyssSkillCategory);bindAbyssSkills()}
 else if(screen==="inventory"){app.innerHTML=InventoryScreen(save.state,inventoryCategory);bindInventory()}
 else if(screen==="armory"){app.innerHTML=ArmoryScreen(save.state,inventoryCategory,inventorySort);bindInventory()}
 bindSharedUi();
 pixelizeUiEmoji(app);
}
function expeditionActive(){return Boolean(save.state.player.inRun)}
function expeditionMenuOrigin(){return expeditionActive()?"explore":"home"}
function rememberExpeditionMenuHistory(){
 // Screen routing is handled inside the application. Browser history entries here
 // used to send the player to Home after closing equipment/skills mid-expedition.
}
function menuBackTarget(origin="home"){
 if(["formation","equipment","skills","detail","monsters"].includes(origin))return origin;
 return expeditionActive()?"explore":origin;
}
function returnFromMenu(origin="home"){
 const target=menuBackTarget(origin);
 go(target);
}
function go(s){
 if(s==="home"&&expeditionActive()){
  if(screen!=="explore")showToast("探索中は「帰還」から拠点へ戻れます");
  s="explore";
 }
 if(screen==="explore"&&["formation","equipment","skills","inventory","armory","settings"].includes(s))rememberExpeditionMenuHistory();
 screen=s;render();
}
window.addEventListener("popstate",()=>{if(expeditionActive()&&!battle&&screen!=="explore"){screen="explore";render()}});
function bindSharedUi(){
 const runOrigin=expeditionMenuOrigin(),homeButton=document.querySelector('[data-ui-route="home"]');
 if(expeditionActive()&&homeButton){homeButton.querySelector("i").innerHTML=pixelIcon("map");homeButton.querySelector("b").textContent="探索へ"}
 document.querySelector("[data-ui-settings]")?.addEventListener("click",()=>{settingsNavigationOrigin=runOrigin;go("settings")});
 document.querySelectorAll("[data-ui-route]").forEach(button=>button.addEventListener("click",()=>{
 const route=button.dataset.uiRoute;
  if(route==="home")return expeditionActive()?returnFromMenu("explore"):go("home");
  if(route==="formation"){formationOrigin=runOrigin;return go("formation")}
  if(route==="equipment"){equipmentTarget=save.state.party[0]??save.state.monsters[0]?.id;navigationOrigin=runOrigin;return go("equipment")}
  if(route==="skills"){skillNavigationOrigin=runOrigin;skillTarget=save.state.party[0]??save.state.monsters[0]?.id;skillSlotSelection=0;return go("skills")}
  if(route==="inventory"){inventoryNavigationOrigin=runOrigin;inventoryCategory="all";return go("inventory")}
  if(route==="armory"){inventoryNavigationOrigin=runOrigin;inventoryCategory="all";inventorySort="rarity";return go("armory")}
 }));
}
function capturePartyVitals(){return Object.fromEntries(save.state.party.map(id=>{const m=save.state.monsters.find(x=>x.id===id);return m?[id,{hp:m.currentHp,mp:m.currentMp,ailments:normalizePersistentAilments(m.ailments)}]:null}).filter(Boolean))}
function restorePartyVitals(vitals){if(!vitals)return;save.state.party.forEach(id=>{const m=save.state.monsters.find(x=>x.id===id),v=vitals[id];if(!m||!v)return;m.currentHp=v.hp;m.currentMp=v.mp;m.ailments=normalizePersistentAilments(v.ailments)})}
function fullyRecoverParty(){save.state.party.forEach(id=>{const m=save.state.monsters.find(x=>x.id===id);if(!m)return;m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)})}
function openTeamBattle(){
 const team=dailyTeamAttempts(save.state),unlockFloor=contentUnlockFloor(TEAM_BATTLE_UNLOCK_FLOOR);
 if(!isContentUnlocked(save.state,TEAM_BATTLE_UNLOCK_FLOOR))return alert(`${unlockFloor}階突破で解放されます`);
 if(save.state.party.length!==4)return alert(`4 VS 4には出撃メンバーが4体必要です（現在 ${save.state.party.length}/4体）`);
 if(team.dailyAttempts>=50)return alert("本日の挑戦回数50回を使い切りました");
 app.insertAdjacentHTML("beforeend",Modal("⚔️ チームバトル",`<div class="team-battle-intro"><small>ABYSS ARENA${CONTENT_TEST_MODE?"・TEST ACCESS":""}</small><h2>第${team.stage}試練</h2><p>4体対4体。戦闘前に全回復します。</p><p><b>敗北ペナルティなし</b> / 本日 ${team.dailyAttempts}/50戦</p></div>`,`挑戦する`));
 const modal=topModal();modal.classList.add("ornate-team-modal");
 modal.querySelector("[data-modal-primary]").onclick=()=>{if(save.state.party.length!==4)return alert("出撃メンバーを4体編成してください");modal.remove();const prior=capturePartyVitals();fullyRecoverParty();team.dailyAttempts++;save.save();startSpecialBattle(createTeamBattleEncounter(save.state),{type:"team",title:`TEAM BATTLE・第${team.stage}試練`,subtitle:"4 VS 4 / 敗北ペナルティなし",priorVitals:prior,returnScreen:"home"})};
}
function testScaleEmergency(event){
 if(!CONTENT_TEST_MODE||!event?.enemies?.length)return event;
 const base=Math.max(10,Math.min(45,(save.state.player.maxFloor||10)+4));
 event.manifestation={rate:.1,label:"試遊投影体",percent:10};
 event.rescue={...(event.rescue??{}),active:true,label:"試遊保護"};
 event.enemies=event.enemies.slice(0,3).map((enemy,index)=>({...enemy,level:base+Math.max(0,5-index*2),statMultiplier:index===0?1.55:1.08,nameOverride:index===0?`${event.boss.name}〈試遊投影〉`:enemy.nameOverride}));
 return event;
}
function triggerEmergencyEncounter(forcedId=null,{testPreview=false,returnScreen=null}={}){
 const wasExploring=Boolean(game?.running),emergencyState=normalizeEndgameState(save.state).emergency,pending=emergencyState.pendingEncounter,effectiveBossId=forcedId??pending?.bossId??null,event=testPreview?testScaleEmergency(createEmergencyEncounter(save.state,effectiveBossId)):createEmergencyEncounter(save.state,effectiveBossId),prior=pending?.priorVitals??capturePartyVitals(),options=endgamePreludeOptions(event.boss);fullyRecoverParty();save.save();
 const optionHtml=options.map(option=>`<button data-endgame-prelude="${option.id}"><span>${option.icon}</span><b>${option.title}</b><small>${option.desc}</small></button>`).join("");
 app.insertAdjacentHTML("beforeend",Modal(event.boss.faction==="tenGod"?"――神が降臨しました。":"――深淵反応を検知。",`<div class="emergency-warning ${event.boss.faction}"><div class="warning-icon">${monsterVisual(event.boss.id,event.boss.icon,{className:"endgame-warning-monster-visual"})}</div><small>${event.manifestation.label} / ${event.manifestation.percent}%</small><h2>${event.boss.name}</h2><p>${event.boss.title}</p><p>味方は全回復。逃走不可。敗北ペナルティはありません。</p>${event.rescue?.active?`<div class="emergency-rescue-note"><b>🛡 ${event.rescue.label}</b><small>1000階直後・連敗時の救済補正が適用中。眷属数が抑制されています。</small></div>`:""}</div><div class="endgame-prelude-grid">${optionHtml}</div>`,`選択してください`));
 const modal=topModal(),primary=modal.querySelector("[data-modal-primary]");if(primary)primary.disabled=true;
 modal.querySelectorAll("[data-endgame-prelude]").forEach(button=>button.onclick=()=>{const prelude=resolveEndgamePrelude(save.state,event.boss.id,button.dataset.endgamePrelude);applyPreludeToEncounter(event,prelude);if(emergencyState.pendingEncounter?.bossId===event.boss.id)emergencyState.pendingEncounter=null;save.save();modal.remove();if(wasExploring){snapshot=currentSnapshot();stopGame()}startSpecialBattle(event.enemies,{type:"emergency",title:event.boss.name,subtitle:`${event.manifestation.label}・${prelude.title}`,priorVitals:prior,bossId:event.boss.id,powerPercent:event.manifestation.percent,bonusFragments:prelude.bonusFragments,preludeChoiceId:prelude.id,preludeResultText:prelude.resultText,returnScreen:returnScreen??(wasExploring?"explore":"home")})});
}
function resumePendingEmergency(){const pending=normalizeEndgameState(save.state).emergency.pendingEncounter;if(!pending||battle||!save.state.player.inRun||document.querySelector(".game-modal,.battle-screen"))return false;if(game?.running){game.paused=true;game.world.encountering=false}triggerEmergencyEncounter(pending.bossId,{returnScreen:"explore"});return true}
function startSpecialBattle(enemies,options={}){startBattle(enemies,{specialBattle:true,specialBattleType:options.type,specialTitle:options.title,specialSubtitle:options.subtitle,priorVitals:options.priorVitals,specialBossId:options.bossId,powerPercent:options.powerPercent,bonusFragments:Math.max(0,Number(options.bonusFragments)||0),preludeChoiceId:options.preludeChoiceId??null,preludeResultText:options.preludeResultText??null,specialTrialNumber:options.trialNumber??null,specialTrialLoop:options.trialLoop??null,specialReturnScreen:options.returnScreen??null})}
function createContractedEndgameMonster(boss,bossId,level,floor){
 const monster=createMonster(boss.speciesId,{nickname:boss.name,title:boss.title,level:Math.max(1,Math.min(9999,Number(level)||Number(floor)||1)),stars:5,rank:4,favorite:true,locked:true,attribute:boss.element??SPECIES[boss.speciesId]?.element,obtainedFloor:Math.max(1,Number(floor)||1),obtainedMethod:"endgameContract",tags:[SPECIES[boss.speciesId]?.race,boss.faction,bossId].filter(Boolean)});
 monster.endgameBossId=bossId;monster.endgameFaction=boss.faction;monster.contractSignature=boss.signature;monster.contractSeriesId=boss.seriesId;monster.isContractedEndgame=true;monster.currentHp=calculatedStats(monster).hp;monster.currentMp=maxMp(monster);return monster;
}
function finishSpecialBattle(won){
 if(!battle||battle.resultSettled)return;battle.resultSettled=true;
 audio.setScene(won?"victory":"defeat");audio.sfx(won?"victory":"defeat");
 const type=battle.specialBattleType,prior=battle.priorVitals,bossId=battle.specialBossId,trialNumber=Math.max(1,Number(battle.specialTrialNumber)||1),floor=save.state.player.currentFloor,returnScreen=battle.specialReturnScreen??(["team","gauntlet"].includes(type)?"home":"explore"),leader=battle.enemies?.find(enemy=>enemy.endgameBossId===bossId),team=type==="team"?dailyTeamAttempts(save.state):null,rewardFloor=["team","gauntlet"].includes(type)?Math.max(1,save.state.player.maxFloor||floor):floor;
 const priorSettlement=specialBattleSettlement(save.state,battle.battleId);let specialGold=Number(priorSettlement?.specialGold)||0,fragments=Number(priorSettlement?.fragments)||0,contract=priorSettlement?.contractResult?{...priorSettlement.contractResult,boss:ENDGAME_BOSSES[bossId]}:null,contractedMonster=priorSettlement?.contractResult?.joined?true:null,trialProgress=priorSettlement?.trialProgress??null;
 if(!priorSettlement){
  specialGold=modifiedGoldReward(save.state,specialBattleGoldBase(rewardFloor,{type,won,stage:type==="gauntlet"?trialNumber:team?.stage??1,powerPercent:battle.powerPercent}),"battle");
  if(team)won?(team.totalWins++,team.stage++):team.totalLosses++;
  if(type==="gauntlet")trialProgress=recordEndgameTrialResult(save.state,trialNumber,won);
  if(specialGold)save.state.player.gold+=specialGold;
  if(type==="emergency"){
   recordEmergencyResult(save.state,battle,won);fragments=awardEmergencyFragments(save.state,bossId,won,battle.battleId);
   if(won){
    contract=attemptEndgameContract(save.state,bossId,floor);
    if(contract.success){
     const duplicate=save.state.monsters.some(monster=>monster.endgameBossId===bossId||monster.isContractedEndgame&&monster.nickname===contract.boss?.name);
     if(!duplicate){contractedMonster=createContractedEndgameMonster(contract.boss,bossId,leader?.level,floor);save.state.monsters.push(contractedMonster);save.state.codex.encounters[contractedMonster.speciesId]=(save.state.codex.encounters[contractedMonster.speciesId]??0)+1;save.state.codex.captures[contractedMonster.speciesId]=(save.state.codex.captures[contractedMonster.speciesId]??0)+1}
    }
   }
  }
  const contractResult=contract?{success:Boolean(contract.success),contracted:Boolean(contract.contracted),remaining:Number(contract.remaining)||0,availableFragments:Number(contract.availableFragments)||0,required:Number(contract.required)||0,spent:Number(contract.spent)||0,joined:Boolean(contractedMonster)}:null;
  recordSpecialBattleSettlement(save.state,battle.battleId,{type,won:Boolean(won),bossId:bossId??null,specialGold,fragments,contractResult,trialProgress});save.save();
 }
 restorePartyVitals(prior);clearPartySynergy();clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();const boss=bossId?ENDGAME_BOSSES[bossId]:null,status=bossId?emergencyFragmentStatus(save.state,bossId):null;
 let contractHtml="";if(type==="emergency"&&won&&contract){if(contract.success)contractHtml=`<div class="fragment-reward contract-success"><b>🤝 ${boss.name}との契約成立</b><small>欠片${contract.spent}個を消費。${contractedMonster?"星5・ロック状態で仲間に加入しました。":"すでに仲間にいるため重複加入はありません。"}</small></div>`;else if(!contract.contracted)contractHtml=`<div class="fragment-reward"><b>${boss.name}との契約まであと${contract.remaining}個</b><small>所持欠片 ${contract.availableFragments}/${contract.required}</small></div>`}
 const trialName=ENDGAME_TRIALS[trialNumber-1]?.name??`第${trialNumber}戦`,subject=type==="gauntlet"?`奈落回廊 第${trialNumber}戦`:boss?.name??"チームバトル",progressText=type==="gauntlet"?(trialProgress?.loopCompleted?`全22戦制覇。${trialProgress.loop}周目が解放されました。`:`次は第${trialProgress?.battle??trialNumber}戦「${ENDGAME_TRIALS[(trialProgress?.battle??trialNumber)-1]?.name??trialName}」。`):type==="team"?"次の試練が解放されました。":"世界異変を退けました。";
 const title=won?"SPECIAL VICTORY":"DEFEAT",body=won?`<div class="special-result win"><h2>${subject}を突破！</h2><p>${progressText}</p><div class="fragment-reward"><b>🪙 深層討伐報奨 +${specialGold.toLocaleString()}G</b><small>${rewardFloor}階のGOLD基準で算出</small></div>${battle.preludeResultText?`<small>${battle.preludeResultText}</small>`:""}${type==="emergency"?`<div class="fragment-reward"><b>${boss.icon} ${boss.name}の欠片 ×${fragments}</b><small>所持 ${status.count}/${status.required}${status.canCraft?"　製作可能！":""}</small></div>${contractHtml}`:""}</div>`:`<div class="special-result lose"><h2>${subject}には届かなかった…</h2><p>所持品・階層・仲間へのペナルティはありません。${type==="gauntlet"?` 第${trialNumber}戦から再挑戦できます。`:""}</p>${type==="emergency"?`<div class="fragment-reward"><b>${boss.icon} ${boss.name}の欠片 ×${fragments}</b><small>${fragments?"10%抽選に成功":"今回は欠片なし"}・所持 ${status.count}/${status.required}</small></div>`:""}</div>`;
 save.save();battle=null;activeEnemy=null;app.insertAdjacentHTML("beforeend",Modal(title,body,returnScreen==="home"?"拠点へ戻る":"探索へ戻る"));const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();if(returnScreen==="home"){snapshot=null;go("home")}else{screen="explore";render()}}
}

function openEndgameForge(){
 const rows=Object.values(ENDGAME_BOSSES).map(b=>{const s=emergencyFragmentStatus(save.state,b.id),record=save.state.endgame?.emergency?.records?.[b.id]??{};return`<article class="endgame-forge-card ${b.faction}"><div class="spread"><div><small>${b.faction==="tenGod"?"十神":"深淵"}</small><h3>${monsterVisual(b.id,b.icon,{className:"endgame-forge-monster-visual"})} ${b.name}</h3></div><b>${s.count}/${s.required}</b></div><div class="fragment-meter"><i style="width:${Math.min(100,s.count/s.required*100)}%"></i></div><small>遭遇 ${record.encounters??0} / 討伐 ${record.wins??0} / 製作 ${s.crafted}</small><button data-craft-endgame="${b.id}" ${s.canCraft?"":"disabled"}>${s.canCraft?"最強装備を製作":"欠片を集める"}</button></article>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal("欠片・神装鍛造",`<p class="muted">欠片でCharacter Bible準拠の専用装備を製作します。右手→左手→首→指→胴→補助の順に6部位が完成します。</p><div class="endgame-forge-list">${rows}</div>`,"閉じる"));
 const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=closeTopModal;modal.querySelectorAll("[data-craft-endgame]").forEach(b=>b.onclick=()=>craftEndgameGear(b.dataset.craftEndgame));
}
function craftEndgameGear(bossId){
 const result=craftEndgameEquipment(save.state,bossId);if(!result.ok)return showToast(result.message);
 const received=receiveEquipment(save.state,result.item,{bossReward:true});save.save();closeTopModal();
 app.insertAdjacentHTML("beforeend",Modal("神装顕現",`<div class="crafted-endgame-gear"><div class="warning-icon">${monsterVisual(result.boss.id,result.boss.icon,{className:"endgame-crafted-monster-visual"})}</div><small>${result.boss.name}シリーズ・${equipmentSubslotLabel(result.item.ruleOverrides.subslot)}</small><h2>[${equipmentDisplayRarity(result.item)}] ${result.item.name}</h2><p>${Object.entries(result.item.stats).map(([k,v])=>`${equipmentStatLabel(k)} +${v}`).join(" / ")}</p><div class="equipment-fixed-authority"><b>固有能力</b><span>${result.item.fixedEffectText}</span></div><b>欠片 ${result.spent}個を消費</b><small>${received.message}</small></div>`,`受け取る`));
 topModal().querySelector("[data-modal-primary]").onclick=()=>{closeTopModal();openEndgameForge()};
}

function openWorldRecord(){
 const floor=save.state.player.maxFloor||1;
 const region=floor>=7001?"神域":floor>=3001?"深淵領域":"未知領域";
 app.insertAdjacentHTML("beforeend",Modal("世界の記録",`<div class="world-record-modal"><small class="eyebrow">RECORD I / ${region}</small><h2>地下1000階の向こう側</h2><p>地下1000階。そこは人類が知る世界の終点。</p><p>誰もが、そう信じていた。</p><hr><p>しかし、そのさらに下には──誰にも語られなかった世界が存在する。</p><p class="muted">現在確認された最深部：${floor}階</p></div>`,`閉じる`));
}
function returnRarityTable(){return`<div class="return-rarity-table"><div class="return-rarity-head"><b>装備ドロップ確率</b><small>装備1枠ごとの抽選</small></div>${returnRarityRates(save.state).map(row=>`<p class="rarity-${row.rarity}"><span>${row.rarity}</span><b>${row.label}</b></p>`).join("")}</div>`}
function returnGradeBadge(grade){const tone=["SSS","SS","S"].includes(grade)?"gold":grade==="A"?"red":grade==="B"?"purple":"silver";return`<div class="return-grade-medal tone-${tone}"><i class="return-rune-ring" aria-hidden="true"><u></u><u></u><u></u><u></u></i><small>EXPEDITION RANK</small><strong>${grade}</strong><em>探索評価</em></div>`}
function compactElapsedText(elapsedMs){
 const minutes=Math.floor(Math.max(0,elapsedMs)/60000),hours=Math.floor(minutes/60),minutePart=minutes%60;
 return hours>0?`${hours}時間${minutePart}分`:`${minutePart}分`;
}
function openCombatPowerHistory(){
 const current=partyCombatPower(save.state),record=save.state.records?.combatPower??{},highest=Math.max(current,Number(record.highest)||0),history=[...(record.history??[])].reverse();
 const rows=history.length?history.slice(0,8).map((entry,index)=>{
  const date=new Date(entry.at),dateText=Number.isFinite(date.getTime())?date.toLocaleString("ja-JP",{timeZone:"Asia/Tokyo",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}):"記録時刻不明";
  return`<div class="power-history-row"><span>${index===0?"👑":"✦"}</span><div><b>${formatCombatPower(entry.power)}</b><small>${entry.delta>0?`+${formatCombatPower(entry.delta)}・`:"記録開始・"}${entry.floor}階時点</small></div><time>${dateText}</time></div>`;
 }).join(""):'<p class="muted">戦力更新履歴はまだありません。</p>';
 app.insertAdjacentHTML("beforeend",Modal("⚔️ 戦力記録",`<div class="power-record-summary"><div><small>現在戦力</small><b>${formatCombatPower(current)}</b></div><div><small>歴代最高戦力</small><strong>${formatCombatPower(highest)}</strong></div><div><small>${current>=highest?"最高記録を維持中":"最高更新まで"}</small><b>${current>=highest?"👑":formatCombatPower(highest-current)}</b></div></div><h3 class="power-history-title">最高戦力の更新履歴</h3><div class="power-history-list">${rows}</div><small class="muted">装備・育成・スキル効果を反映した部隊4体の合計値です。</small>`,"閉じる"));
 topModalButton().onclick=closeTopModal;
}
function idleReturnPreviewBody(preview){
 return`<div class="idle-reward-v2"><div class="idle-v2-hero"><div><small>放置探索時間</small><strong>${compactElapsedText(preview.elapsedMs)}</strong><p>最大${preview.maxHours}時間まで蓄積${preview.capped?"・上限到達":""}</p></div><span class="home-pixel-icon icon-chest idle-v2-chest-icon" aria-hidden="true"></span></div><div class="idle-v2-reward-grid"><article><i>◉</i><small>受取GOLD</small><b>${preview.gold.toLocaleString()}G</b></article><article><i>⚔️</i><small>装備ドロップ</small><b>${preview.equipmentCount}個</b></article><article><i>🏰</i><small>探索地点</small><b>${preview.expeditionFloor}階層帯</b></article><article><i>⌛</i><small>換算探索量</small><b>${preview.floorUnits}階層分</b></article></div><div class="idle-v2-route"><span>最高到達階層の${Math.round(preview.expeditionRate*100)}%</span><i style="--idle-progress:${Math.min(100,preview.elapsedMs/(preview.maxHours*3600000)*100)}%"></i><small>5分ごとにGOLDと装備抽選が増加します。</small></div>${returnRarityTable()}</div>`;
}
function showIdleReturnReport(result){
 const best=result.equipment.reduce((current,entry)=>!current||(RARITY_ORDER[equipmentDisplayRarity(entry.item)]??0)>(RARITY_ORDER[equipmentDisplayRarity(current.item)]??0)?entry:current,null);
 const equipmentRows=result.equipment.length?result.equipment.map(({item,receipt})=>{const rarity=equipmentDisplayRarity(item);return`<div class="return-reward-item rarity-${rarity}"><b>${rarity} ${item.name}</b><small>${receipt.message}</small></div>`}).join(""):'<p class="muted">今回は装備ドロップなし</p>';
 const bestRarity=best?equipmentDisplayRarity(best.item):null,highlight=best&&(RARITY_ORDER[bestRarity]??0)>=RARITY_ORDER.SSR?`<div class="return-reward-highlight rarity-${bestRarity}"><strong>${bestRarity} IDLE DROP!</strong><span>${best.item.name}</span></div>`:"";
 const grade=returnRewardGrade(result.floorUnits,result.equipment);
 app.insertAdjacentHTML("beforeend",Modal("放置帰還報告",`<div class="return-reward-report idle-return-report">${highlight}${returnGradeBadge(grade)}<div class="idle-return-emblem">🕯️</div><p><span>放置探索時間</span><b>${compactElapsedText(result.elapsedMs)}</b></p><p><span>探索地点</span><b>最高到達の${Math.round(result.expeditionRate*100)}%・${result.expeditionFloor}階層帯</b></p><p><span>換算探索量</span><b>${result.floorUnits}階層分</b></p><p class="return-reward-gold"><span>獲得GOLD</span><b>${result.gold.toLocaleString()}G</b></p><h3>獲得装備 ${result.equipment.length}個</h3><div class="return-reward-items">${equipmentRows}</div>${returnRarityTable()}</div>`,"確認"));
 const modal=topModal(),finish=()=>{modal?.remove();render()};modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish;
}
function openIdleReturnPreview(){
 const preview=idleReturnPreview(save.state);
 app.insertAdjacentHTML("beforeend",Modal("🎁 放置帰還報酬",idleReturnPreviewBody(preview),"受け取る"));
 const modal=topModal(),primary=modal.querySelector("[data-modal-primary]");
 modal.classList.add("idle-reward-modal-v2");
 primary.classList.add("idle-reward-claim");
 primary.disabled=!preview.available;
 primary.innerHTML=preview.available
  ?`<i class="claim-chest">🎁</i><span><strong>報酬をすべて受け取る</strong><small>${preview.gold.toLocaleString()}G ＋ 装備${preview.equipmentCount}個</small></span><em>${preview.capped?"MAX報酬":"受取可能"}</em>`
  :'<i class="claim-chest">⌛</i><span><strong>あと少しで報酬解禁</strong><small>5分経過後に受取可能</small></span><em>蓄積中</em>';
 primary.onclick=()=>{
  if(primary.dataset.claiming==="1")return;
  const latest=idleReturnPreview(save.state);if(!latest.available)return;
  primary.dataset.claiming="1";primary.disabled=true;
  const result=claimIdleReturn(save.state);save.save();modal.remove();showIdleReturnReport(result);
 };
}
const HOME_ITEM_SHOP=[
 {id:"captureCrystals",icon:"",name:"捕獲結晶",description:"捕獲玉。戦闘中の捕獲1回につき1個消費",price:300},
 {id:"potions",icon:"🌿",name:"薬草",description:"単体HPを100＋最大HP10%回復",price:160},
 {id:"highPotions",icon:"🧪",name:"上級回復薬",description:"単体HPを300＋最大HP25%回復",price:480},
 {id:"partyPotions",icon:"💚",name:"全体回復薬",description:"味方全員のHPを回復",price:620},
 {id:"manaPotions",icon:"💧",name:"魔力水",description:"単体MPを30＋最大MP10%回復",price:240},
 {id:"highManaPotions",icon:"🔷",name:"上級魔力水",description:"単体MPを100＋最大MP25%回復",price:680},
 {id:"partyManaPotions",icon:"🌊",name:"全体魔力水",description:"味方全員のMPを回復",price:900},
 {id:"fullManaPotions",icon:"💠",name:"魔力全快薬",description:"単体のMPを全回復",price:1200},
 {id:"partyFullManaPotions",icon:"🌀",name:"全体魔力全快薬",description:"味方全員のMPを全回復",price:3600},
 {id:"reviveLeaves",icon:"🍃",name:"蘇生の葉",description:"戦闘不能の仲間を蘇生",price:900},
 {id:"statusCures",icon:"🩹",name:"浄化薬",description:"単体の状態異常を解除",price:300},
 {id:"partyStatusCures",icon:"💨",name:"全体浄化薬",description:"味方全員の状態異常を解除",price:980},
 {id:"fullHeals",icon:"✨",name:"万能霊薬",description:"単体のHP・MP・状態異常を全回復",price:1800},
 {id:"partyFullHeals",icon:"🌟",name:"全体万能霊薬",description:"味方全員を完全回復",price:6500}
];
function shopItemArt(item){
 return`<span class="home-shop-item-art" style="--shop-item-art:url('../../assets/ui/items/${item.id}.png')"><i>${item.icon}</i></span>`;
}
function openHomeItemShop(){
 const gold=Math.max(0,Number(save.state.player.gold)||0);
 const rows=HOME_ITEM_SHOP.map(item=>`<article class="home-item-shop-row">${shopItemArt(item)}<div><b>${item.name}</b><small>${item.description}<br>所持 ${save.state.inventory[item.id]??0}個</small></div><div><button type="button" data-home-item-buy="${item.id}" data-buy-count="1" ${gold<item.price?"disabled":""}>${item.price.toLocaleString()}G</button><button type="button" data-home-item-buy="${item.id}" data-buy-count="10" ${gold<item.price*10?"disabled":""}>10個 ${(item.price*10).toLocaleString()}G</button></div></article>`).join("");
 app.insertAdjacentHTML("beforeend",Modal("アイテムショップ",`<div class="home-item-shop"><div class="home-item-shop-wallet"><span>所持GOLD</span><b>${gold.toLocaleString()}G</b></div><p class="muted">探索前でも帰還後でも、いつでも利用できます。闇市場の限定品とは別の常設店です。</p><div class="home-item-shop-list">${rows}</div></div>`,"閉じる"));
 const modal=topModal();
 modal.classList.add("ornate-shop-modal");
 modal.querySelectorAll("[data-home-item-buy]").forEach(button=>button.onclick=()=>{
  const item=HOME_ITEM_SHOP.find(entry=>entry.id===button.dataset.homeItemBuy),count=Math.max(1,Number(button.dataset.buyCount)||1);
  if(!item)return;
  const cost=item.price*count;
  if(save.state.player.gold<cost)return showToast("GOLDが足りません");
  save.state.player.gold-=cost;
  save.state.inventory[item.id]=(save.state.inventory[item.id]??0)+count;
  save.state.records??={};
  save.state.records.purchases=(save.state.records.purchases??0)+count;
  save.save();modal.remove();showToast(`${item.name} ×${count}を購入`);openHomeItemShop();
 });
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function openFormationFromHome(){formationOrigin="home";go("formation")}
function openExploreFloorSelector(){
 const max=Math.min(WORLD_MAX_FLOOR,save.state.player.maxFloor);
 const party=save.state.party.map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean);
 const partyCards=party.map(monster=>{const species=SPECIES[monster.speciesId]??{};return`<article class="departure-party-card">${monsterVisual(monster,species.emoji??"👹",{className:"departure-monster-visual"})}<b>${displayName(monster)}</b><small>Lv.${monster.level}</small><span>${"★".repeat(Math.max(1,Math.min(5,monster.stars??1)))}</span></article>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal("探索開始",`<div class="departure-dialog"><small class="departure-eyebrow">ABYSS DOMINION</small><p>再開する階層を選択</p><div class="departure-floor-control"><button type="button" data-floor-step="-1" aria-label="1階戻る">−</button><input id="floorSelect" type="number" inputmode="numeric" min="1" max="${max}" value="${max}" aria-label="出発階層"><button type="button" data-floor-step="1" aria-label="1階進む">＋</button></div><p class="muted">1〜${max.toLocaleString()}階・到達済みの階層から再開できます</p><h3>現在の部隊</h3><div class="departure-party-grid">${partyCards}</div></div>`,`出発する`));
 const modal=topModal(),button=modal.querySelector("[data-modal-primary]"),input=modal.querySelector("#floorSelect");
 modal.classList.add("departure-modal");
 modal.querySelector(".game-modal-card")?.classList.add("departure-modal-card");
 const normalizeFloor=()=>{input.value=String(Math.max(1,Math.min(max,Number(input.value)||max)))};
 modal.querySelectorAll("[data-floor-step]").forEach(step=>step.addEventListener("click",()=>{input.value=String((Number(input.value)||max)+Number(step.dataset.floorStep));normalizeFloor()}));
 input.addEventListener("change",normalizeFloor);
 button.onclick=()=>{const floor=Math.max(1,Math.min(max,Number(modal.querySelector("#floorSelect").value)||max));save.state.player.currentFloor=floor;save.state.player.inRun=true;beginManualExpedition(save.state,floor);beginSecretRoomExpedition(save.state);clearExpeditionSnapshot();save.save();snapshot=null;modal.remove();go("explore")};
}
function openUnavailableHomeFeature(title,icon){
 app.insertAdjacentHTML("beforeend",Modal(title,`<div class="home-unavailable ornate-unavailable">${icon?`<span>${icon}</span>`:'<i class="unavailable-party-emblem" aria-hidden="true"></i>'}<small>COMING SOON</small><h3>現在準備中です</h3><p>完成したコンテンツから順次解放されます。</p></div>`,"閉じる"));
 const modal=topModal();modal.classList.add("ornate-unavailable-modal");topModalButton().onclick=closeTopModal;
}
function openNoticeCenter(){
 const noticeState=normalizeNoticeState(save.state),readIds=new Set(noticeState.readIds);
 const rows=NOTICE_DEFINITIONS.map(notice=>{
  const unread=!readIds.has(notice.id),tag=notice.action?"button":"article";
  return`<${tag}${tag==="button"?' type="button"':""} class="home-notice-card ${unread?"unread":"read"}" data-notice-id="${notice.id}" data-notice-kind="${notice.kind}"${notice.action?` data-home-notice="${notice.action}"`:""}><span>${notice.icon}</span><div><small class="notice-type ${notice.kind}">${notice.label}</small><b>${notice.title}</b><small>${notice.body}</small></div><em>${unread?"NEW":notice.action?"›":"✓"}</em></${tag}>`;
 }).join("");
 app.insertAdjacentHTML("beforeend",Modal("お知らせ",`<div class="notice-center-v2"><div class="notice-tabs"><button type="button" data-notice-filter="all" class="active">すべて</button><button type="button" data-notice-filter="event">イベント</button><button type="button" data-notice-filter="update">アップデート</button><button type="button" data-notice-filter="maintenance">メンテナンス</button></div><div class="home-notice-list">${rows}</div><small class="notice-footer">開いたお知らせは、この端末のセーブに既読として保存されます。</small></div>`,"閉じる"));
 const modal=topModal();
 modal.classList.add("notice-modal-v2");
 markAllNoticesRead(save.state);save.save();
 const homeNoticeButton=document.getElementById("openNoticeCenter");
 homeNoticeButton?.classList.remove("ready");
 homeNoticeButton?.querySelector(".home-notification-dot")?.remove();
 if(homeNoticeButton?.querySelector("small"))homeNoticeButton.querySelector("small").textContent="確認済み";
 modal.querySelectorAll("[data-notice-filter]").forEach(tab=>tab.addEventListener("click",()=>{modal.querySelectorAll("[data-notice-filter]").forEach(entry=>entry.classList.toggle("active",entry===tab));modal.querySelectorAll("[data-notice-kind]").forEach(entry=>entry.hidden=tab.dataset.noticeFilter!=="all"&&entry.dataset.noticeKind!==tab.dataset.noticeFilter)}));
 modal.querySelector('[data-home-notice="tutorial"]')?.addEventListener("click",()=>{modal.remove();openTutorialBook()});
 modal.querySelector('[data-home-notice="codex"]')?.addEventListener("click",()=>{modal.remove();openCodexHub()});
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function openGauntletTrial(){
 if(!isContentUnlocked(save.state,TEAM_BATTLE_UNLOCK_FLOOR))return showToast(`${contentUnlockFloor(TEAM_BATTLE_UNLOCK_FLOOR)}階突破で解放されます`);
 if(save.state.party.length!==4)return alert(`奈落回廊には出撃メンバーが4体必要です（現在 ${save.state.party.length}/4体）`);
 const state=normalizeEndgameState(save.state).trials,encounter=createEndgameTrialEncounter(save.state,state.battle),trial=encounter.trial,bosses=trial.bossIds.map(id=>ENDGAME_BOSSES[id]);
 app.insertAdjacentHTML("beforeend",Modal("🏛️ 奈落回廊",`<div class="gauntlet-brief"><small>ABYSS CORRIDOR・${state.loop}周目</small><h2>第${trial.number}/22戦　${trial.name}</h2><div class="gauntlet-opponents">${bosses.map(boss=>`<article>${monsterVisual(boss.id,boss.icon,{className:"gauntlet-boss-visual"})}<b>${boss.name}</b><small>${boss.role}</small></article>`).join("")}</div><p>4体編成で挑戦。開始時に全回復し、戦闘後は挑戦前の状態へ戻ります。</p><p><b>敗北ペナルティなし</b> / 周回補正 ×${(1+(state.loop-1)*.5).toFixed(1)}</p></div>`,"この試練へ挑む"));
 const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();const prior=capturePartyVitals();fullyRecoverParty();save.save();startSpecialBattle(encounter.enemies,{type:"gauntlet",title:`奈落回廊・第${trial.number}戦`,subtitle:`${trial.name} / ${state.loop}周目`,priorVitals:prior,trialNumber:trial.number,trialLoop:state.loop,returnScreen:"home"})};
}
function openEndgameTrialPicker(){
 const rows=Object.values(ENDGAME_BOSSES).map(boss=>`<article class="endgame-gate-entry"><button type="button" data-endgame-challenge="${boss.id}"><span>${boss.icon}</span><b>${boss.name}</b><small>${boss.faction==="tenGod"?"十神":"深淵"}・${boss.title}</small></button><button type="button" data-endgame-detail="${boss.id}">人物・権能・装備</button></article>`).join("");
 app.insertAdjacentHTML("beforeend",Modal("深淵・十神　挑戦門",`<div class="test-endgame-picker"><p>現在階層の正式な顕現率で手動挑戦します。味方は開始時に全回復し、戦闘後は挑戦前の状態へ戻ります。</p>${rows}</div>`,"閉じる"));
 const modal=topModal();modal.classList.add("test-endgame-modal");modal.querySelectorAll("[data-endgame-challenge]").forEach(button=>button.onclick=()=>{const id=button.dataset.endgameChallenge;modal.remove();triggerEmergencyEncounter(id,{returnScreen:"home"})});modal.querySelectorAll("[data-endgame-detail]").forEach(button=>button.onclick=()=>openEndgameDossier(button.dataset.endgameDetail));modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function openEndgameDossier(bossId){const boss=endgameCharacter(bossId);if(!boss)return;const resist=Object.entries(boss.elementMultipliers).map(([key,value])=>`<span><small>${key}</small><b>${Math.round(value*100)}%</b></span>`).join(""),skills=boss.skills.map(skill=>`<article><small>${skill.tag}・MP${skill.mp}・CT${skill.cooldown}</small><b>${skill.name}</b><p>${skill.description}</p></article>`).join(""),gear=boss.gear.map(item=>`<article><small>${equipmentSubslotLabel(item.subslot)}</small><b>${item.name}</b><p>${item.effectText}</p></article>`).join("");app.insertAdjacentHTML("beforeend",Modal(`${boss.icon} ${boss.name}`,`<div class="endgame-character-bible ${boss.faction}">${monsterVisual(boss.id,boss.icon,{className:"endgame-bible-visual"})}<small>${boss.role}</small><h3>${boss.title}</h3><blockquote>${boss.encounterText}</blockquote><p>${boss.lore}</p><section><h4>戦闘思想</h4><p>${boss.ai}</p><b>${boss.passive}</b><small>${boss.awakening}</small></section><div class="endgame-resistance-grid">${resist}</div><div class="endgame-status-note"><b>無効：${boss.statusProfile.immune.join("・")||"なし"}</b><span>耐性：${boss.statusProfile.resistant.join("・")||"なし"}</span>${boss.statusProfile.weak.length?`<em>弱点：${boss.statusProfile.weak.join("・")}</em>`:""}</div><h4>固有技</h4><div class="endgame-bible-grid">${skills}</div><h4>固有装備 6部位</h4><div class="endgame-bible-grid gear">${gear}</div><div class="endgame-set-list"><b>2部位：${boss.setText[2]}</b><b>4部位：${boss.setText[4]}</b><b>6部位：${boss.setText[6]}</b></div></div>`,"戻る"));topModalButton().onclick=closeTopModal}
function openEventHub(){
 const teamUnlocked=isContentUnlocked(save.state,TEAM_BATTLE_UNLOCK_FLOOR),emergencyUnlocked=isContentUnlocked(save.state,EMERGENCY_UNLOCK_FLOOR),gauntletUnlocked=isContentUnlocked(save.state,TEAM_BATTLE_UNLOCK_FLOOR),testLabel=CONTENT_TEST_MODE?`試遊条件 ${contentUnlockFloor(9999)}階`:"";
 app.insertAdjacentHTML("beforeend",Modal("⚔️ 試練",`<div class="trial-access-note ${CONTENT_TEST_MODE?"is-test":""}"><b>${CONTENT_TEST_MODE?"TEST ACCESS":"CHALLENGE GATE"}</b><small>${CONTENT_TEST_MODE?"完成時は正式な解放条件へ自動復帰します。":"高難度コンテンツへの門"}</small></div><div class="home-event-grid trial-gate-grid">
  <button type="button" data-home-trial="team" class="${teamUnlocked?"unlocked":"locked"}"><span>⚔️</span><b>4 VS 4</b><small>${teamUnlocked?`四体編成で挑むチーム試練 ${testLabel}`:`${contentUnlockFloor(TEAM_BATTLE_UNLOCK_FLOOR)}階突破で解放`}</small></button>
  <button type="button" data-home-trial="gauntlet" class="${gauntletUnlocked?"unlocked":"locked"}"><span>🏛️</span><b>奈落回廊</b><small>${gauntletUnlocked?`全22戦・周回制 ${testLabel}`:`${contentUnlockFloor(TEAM_BATTLE_UNLOCK_FLOOR)}階突破で解放`}</small></button>
  <button type="button" data-home-trial="endgame" class="${emergencyUnlocked?"unlocked":"locked"}"><span>🌑</span><b>深淵・十神</b><small>${emergencyUnlocked?`手動挑戦・緊急戦 ${testLabel}`:`${contentUnlockFloor(EMERGENCY_UNLOCK_FLOOR)}階突破で解放`}</small></button>
 </div>`,"閉じる"));
 const modal=topModal();modal.classList.add("trial-hub-modal-v3");
 modal.querySelectorAll("[data-home-trial]").forEach(button=>button.onclick=()=>{
  const action=button.dataset.homeTrial;
  if(action==="team"&&teamUnlocked){modal.remove();return openTeamBattle()}
  if(action==="gauntlet"&&gauntletUnlocked){modal.remove();return openGauntletTrial()}
  if(action==="endgame"&&emergencyUnlocked){modal.remove();return openEndgameTrialPicker()}
  const required=action==="endgame"?contentUnlockFloor(EMERGENCY_UNLOCK_FLOOR):contentUnlockFloor(TEAM_BATTLE_UNLOCK_FLOOR);showToast(`${required}階突破で解放されます`);
 });
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function bindHomePartyDrag(){
 const dropTargetAt=(x,y)=>{
  const direct=document.elementFromPoint(x,y)?.closest?.("[data-home-party-drop]");
  if(direct)return direct;
  const targets=[...document.querySelectorAll("[data-home-party-drop]")];
  const candidates=targets.map(target=>{
   const rect=target.getBoundingClientRect(),padding=22;
   const inside=x>=rect.left-padding&&x<=rect.right+padding&&y>=rect.top-padding&&y<=rect.bottom+padding;
   return{target,inside,distance:Math.hypot(x-(rect.left+rect.width/2),y-(rect.top+rect.height/2))};
  }).filter(entry=>entry.inside).sort((a,b)=>a.distance-b.distance);
  return candidates[0]?.target??null;
 };
 document.querySelectorAll("[data-home-party-member]").forEach(unit=>{
  unit.addEventListener("click",event=>{
   if(unit.dataset.homeDragSuppress!=="1")return;
   event.preventDefault();event.stopImmediatePropagation();delete unit.dataset.homeDragSuppress;
  },true);
  unit.addEventListener("pointerdown",event=>{
   if(event.button!=null&&event.button!==0)return;
   const memberId=unit.dataset.homePartyMember,slots=homePartySlots(save.state),sourceIndex=slots.indexOf(memberId);
   if(sourceIndex<0)return;
   const start={x:event.clientX,y:event.clientY};
   let active=false,ghost=null,lastTarget=null,timer=setTimeout(()=>{
    active=true;unit.dataset.homeDragSuppress="1";unit.classList.add("home-party-dragging");document.body.classList.add("home-party-drag-active");
    ghost=unit.cloneNode(true);ghost.classList.add("home-party-drag-ghost");document.body.appendChild(ghost);
    ghost.style.left=`${start.x}px`;ghost.style.top=`${start.y}px`;navigator.vibrate?.(20);
   },350);
   const move=moveEvent=>{
    if(!active&&Math.hypot(moveEvent.clientX-start.x,moveEvent.clientY-start.y)>10){clearTimeout(timer);timer=null;return}
    if(!active||!ghost)return;
    moveEvent.preventDefault();ghost.style.left=`${moveEvent.clientX}px`;ghost.style.top=`${moveEvent.clientY}px`;
    lastTarget?.classList.remove("drop-ready");
    lastTarget=dropTargetAt(moveEvent.clientX,moveEvent.clientY);
    lastTarget?.classList.add("drop-ready");
   };
   const finish=upEvent=>{
    if(timer)clearTimeout(timer);
    document.removeEventListener("pointermove",move,true);document.removeEventListener("pointerup",finish,true);document.removeEventListener("pointercancel",finish,true);
    unit.classList.remove("home-party-dragging");document.body.classList.remove("home-party-drag-active");ghost?.remove();lastTarget?.classList.remove("drop-ready");
    if(!active||upEvent.type==="pointercancel")return;
    const target=dropTargetAt(upEvent.clientX,upEvent.clientY)??lastTarget;
    if(!target)return;
    const targetIndex=Number(target.dataset.homePartyDrop);
    if(!Number.isInteger(targetIndex)||targetIndex===sourceIndex)return;
    const destination=Math.max(0,Math.min(targetIndex,3)),next=homePartySlots(save.state),replaced=next[destination];
    [next[sourceIndex],next[destination]]=[next[destination],next[sourceIndex]];
    save.state.player.homePartySlots=next;
    save.state.party=next.filter(Boolean);
    save.save();showToast(replaced?`スロット ${sourceIndex+1} ↔ ${destination+1} を交換`:`スロット ${destination+1} へ移動`);render();
   };
   document.addEventListener("pointermove",move,{capture:true,passive:false});document.addEventListener("pointerup",finish,true);document.addEventListener("pointercancel",finish,true);
  });
 });
}
function cloneSerializable(value){
 try{return JSON.parse(JSON.stringify(value))}catch{return null}
}
function normalizedMemoryEncounterEntry(entry){
 if(!entry||!SPECIES[entry.speciesId])return null;
 const memory=cloneSerializable(entry)??{};
 for(const key of["id","hp","maxHp","currentHp","currentMp","status","statuses","ailments","captured","defeated","intent","turnState"])delete memory[key];
 memory.speciesId=entry.speciesId;
 memory.level=Math.max(1,Math.floor(Number(entry.level)||1));
 memory.boss=Boolean(entry.boss);
 memory.elite=Boolean(entry.elite);
 memory.equipped=Boolean(entry.equipped&&entry.gear);
 if(!memory.equipped)delete memory.gear;
 return memory;
}
function memorySignature(entries){
 const source=JSON.stringify(entries??[]);
 let hash=2166136261;
 for(let index=0;index<source.length;index++)hash=Math.imul(hash^source.charCodeAt(index),16777619);
 return`party-${entries?.length??0}-${(hash>>>0).toString(36)}`;
}
function rememberBattleEncounter(entries){
 const recorded=(entries??[]).map(normalizedMemoryEncounterEntry).filter(Boolean).slice(0,8);
 if(!recorded.length)return;
 save.state.recentBattleMemory={entries:recorded,signature:memorySignature(recorded),recordedFloor:save.state.player.currentFloor,recordedAt:new Date().toISOString()};
}
function battleMemoryCost(memory){
 if(!memory?.entries?.length)return 10;
 const signature=memory.signature??memorySignature(memory.entries),attempts=Math.max(0,Math.floor(Number(save.state.battleMemoryAttempts?.[signature])||0));
 const base=Math.min(Number.MAX_SAFE_INTEGER,10*2**Math.min(attempts,49));
 return Math.min(Number.MAX_SAFE_INTEGER,memory.entries.some(entry=>entry.boss)?Math.ceil(base*1.5):base);
}
function openBattleMemory(){
 const memory=save.state.recentBattleMemory;
 if(!memory?.entries?.length){
  app.insertAdjacentHTML("beforeend",Modal("戦闘の記憶",`<div class="battle-memory-empty">${pixelIcon("memory")}<p>まだ呼び戻せる戦闘の記憶がありません。</p><small>敵と戦うと、最後の敵パーティー全体がここへ記録されます。</small></div>`,"閉じる"));
  topModalButton().onclick=closeTopModal;return;
 }
 const signature=memory.signature??memorySignature(memory.entries),cost=battleMemoryCost(memory),enough=(save.state.player.crystals??0)>=cost,hasBoss=memory.entries.some(entry=>entry.boss),attempts=Math.max(0,Math.floor(Number(save.state.battleMemoryAttempts?.[signature])||0));
 const previews=memory.entries.map((entry,index)=>{const species=SPECIES[entry.speciesId],preview={...entry,stars:entry.boss?5:1,plus:0,affection:0};return`<article class="battle-memory-enemy ${entry.boss?"boss":""}"><span>${monsterVisual(preview,species?.emoji??"MONSTER",{className:"battle-memory-monster-visual"})}</span><div><small>${entry.boss?"BOSS":entry.elite?"ELITE":`ENEMY ${index+1}`}</small><b>${entry.nameOverride??species?.name??"魔物"}</b><em>Lv.${entry.level}${entry.equipped?"・装備個体":""}</em></div></article>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal("戦闘の記憶",`<div class="battle-memory-preview">
  <div class="battle-memory-party">${previews}</div>
  <small>LAST BATTLE・${memory.recordedFloor}F・${memory.entries.length}体編成</small>
  <p>直前に戦った敵編成を、ボス・装備・補正までまとめて再現します。</p>
  <div class="battle-memory-cost">${pixelIcon("crystal")}<b>魔晶石 ${cost.toLocaleString()}個</b><span>所持 ${(save.state.player.crystals??0).toLocaleString()}個</span></div>
  <small class="muted">同じ記憶への挑戦は 10→20→40… と倍増。ボスを含む場合は1.5倍です。現在 ${attempts}回挑戦済み。</small>
 </div>`,enough?"記憶に挑む":"魔晶石が足りない"));
 const modal=topModal(),primary=modal.querySelector("[data-modal-primary]");
 if(!enough){primary.disabled=true;return}
 let started=false;
 primary.onclick=()=>{
  if(started)return;started=true;primary.disabled=true;
  const currentCost=battleMemoryCost(memory);
  if((save.state.player.crystals??0)<currentCost){showToast("魔晶石が足りません");modal.remove();return}
  save.state.player.crystals-=currentCost;
  save.state.battleMemoryAttempts??={};save.state.battleMemoryAttempts[signature]=attempts+1;
  save.save();modal.remove();
  const encounter=memory.entries.map(entry=>({...cloneSerializable(entry),uncapturable:entry.boss?false:Boolean(entry.uncapturable)}));
  startBattle(encounter,{memoryBattle:true,bossMemoryBattle:hasBoss,memorySourceFloor:memory.recordedFloor,memorySignature:signature});
 };
}
function openBossMemory(){
 const memory=save.state.recentBossEncounter,species=memory?.speciesId?SPECIES[memory.speciesId]:null;
 if(!memory||!species){
  app.insertAdjacentHTML("beforeend",Modal("深淵の記憶",`<div class="battle-memory-empty boss-memory-empty"><img src="assets/ui/v2/memory-rift.png" alt=""><p>記録された階層支配者はいません。</p><small>階層ボスを撃破すると、最後の1体が深淵へ刻まれます。</small></div>`,"閉じる"));
  topModalButton().onclick=closeTopModal;return;
 }
 const enough=(save.state.player.crystals??0)>=10,name=memory.nameOverride??species.name;
 const preview={speciesId:memory.speciesId,level:memory.level,stars:5,plus:0,affection:0};
 app.insertAdjacentHTML("beforeend",Modal("深淵の記憶",`<div class="battle-memory-preview boss-memory-preview">
  <div class="battle-memory-rift"><img src="assets/ui/v2/memory-rift.png" alt="" class="boss-memory-rift-art">${monsterVisual(preview,species.emoji??"MONSTER",{className:"battle-memory-monster-visual"})}</div>
  <small>BOSS MEMORY・${memory.recordedFloor}F</small><h2>${name} <em>Lv.${memory.level}</em></h2>
  <p>撃破した階層支配者を再現します。この再戦でのみ捕獲できます。</p>
  <div class="battle-memory-cost">${pixelIcon("crystal")}<b>魔晶石 10個</b><span>所持 ${(save.state.player.crystals??0).toLocaleString()}個</span></div>
  <small class="muted">撃破報酬の再選択・階層進行はありません。挑戦開始後の魔晶石は返還されません。</small>
 </div>`,enough?"深淵へ挑む":"魔晶石が足りない"));
 const modal=topModal(),primary=modal.querySelector("[data-modal-primary]");
 if(!enough){primary.disabled=true;return}
 let started=false;
 primary.onclick=()=>{
  if(started)return;started=true;primary.disabled=true;
  if((save.state.player.crystals??0)<10){showToast("魔晶石が足りません");modal.remove();return}
  save.state.player.crystals-=10;save.save();modal.remove();
  const encounter={
   speciesId:memory.speciesId,level:memory.level,boss:true,uncapturable:false,
   nameOverride:memory.nameOverride??undefined,endgameBossId:memory.endgameBossId??undefined,
   faction:memory.faction??undefined,powerRate:memory.powerRate??1,
   manifestationLabel:memory.manifestationLabel??undefined
  };
  startBattle(encounter,{memoryBattle:true,bossMemoryBattle:true,memorySourceFloor:memory.recordedFloor,memorySpeciesId:memory.speciesId});
 };
}
function bindHome(){
 document.getElementById("openIdleReturn")?.addEventListener("click",openIdleReturnPreview);
 document.getElementById("openCombatPowerHistory")?.addEventListener("click",openCombatPowerHistory);
 document.getElementById("openFormation")?.addEventListener("click",openFormationFromHome);
 document.querySelectorAll("[data-open-home-formation]").forEach(button=>button.addEventListener("click",openFormationFromHome));
 document.getElementById("openMonsters").onclick=()=>go("monsters");
 document.getElementById("openSkills")?.addEventListener("click",()=>{skillNavigationOrigin="home";skillTarget=save.state.party[0]??save.state.monsters[0]?.id;skillSlotSelection=0;go("skills")});
 document.getElementById("openBattleMemory")?.addEventListener("click",openBattleMemory);
 document.getElementById("openItemShop")?.addEventListener("click",openHomeItemShop);
 document.getElementById("openTeamBattle")?.addEventListener("click",openTeamBattle);
 document.getElementById("openRest")?.addEventListener("click",openRest);
 document.getElementById("openGacha")?.addEventListener("click",openGacha);
 document.getElementById("openNoticeCenter")?.addEventListener("click",openNoticeCenter);
 document.getElementById("openOnlineParty")?.addEventListener("click",()=>openUnavailableHomeFeature("パーティー",""));
 document.getElementById("openEventHub")?.addEventListener("click",openEventHub);
 document.getElementById("openSettings").onclick=()=>go("settings");
 document.getElementById("openExplore").onclick=openExploreFloorSelector;
 document.getElementById("openEquipment").onclick=()=>{equipmentTarget=save.state.party[0]??save.state.monsters[0]?.id;equipmentFocusItemId=null;navigationOrigin="home";go("equipment")};
 bindHomePartyDrag();
}

function bindSkills(){
 document.getElementById("backSkillHome")?.addEventListener("click",()=>{const target=skillNavigationOrigin;skillNavigationOrigin="home";returnFromMenu(target)});
 document.querySelectorAll("[data-skill-monster]").forEach(button=>button.addEventListener("click",()=>{skillTarget=button.dataset.skillMonster;skillSlotSelection=0;render()}));
 const monster=save.state.monsters.find(m=>m.id===skillTarget);if(!monster)return;
 const describe=skill=>{
  const value=skill.type==="allHeal"||skill.type==="selfHeal"?`回復 ${Math.round((skill.heal??0)*100)}%`:skill.type==="mpHeal"?`MP回復 ${Math.round((skill.mpHeal??0)*100)}%`:["buff","stance","cleanse"].includes(skill.type)?"能力強化":`威力 ${Math.round((skill.power??0)*100)}%${skill.hits?`×${skill.hits}`:""}`;
  const progress=skillProgressFor(monster,skill.id);
  return`${value} / 熟練Lv.${progress.level} / MP ${effectiveSkillMpCost(monster,skill)} / CT ${skill.cooldown??0}`;
 };
 const persist=(message)=>{save.save();showToast(message);render()};
 const openSlotPicker=slot=>{
  const learned=allLearnedSkills(monster),current=monster.equippedSkills?.[slot]??null;
  const category=skill=>{
   if(["allHeal","selfHeal","mpHeal","revive","cleanse"].includes(skill.type))return"recovery";
   if(["guard","defense","barrier","counter"].includes(skill.type)||String(skill.tag??"").includes("防御"))return"defense";
   if(["buff","stance"].includes(skill.type))return"buff";
   return"attack";
  };
  const categoryLabel={attack:"攻撃",recovery:"回復",buff:"強化",defense:"防御"};
  const rows=learned.map(skill=>{const kind=category(skill),progress=skillProgressFor(monster,skill.id),effect=skill.type==="allHeal"||skill.type==="selfHeal"?`回復 ${Math.round((skill.heal??0)*100)}%`:skill.type==="mpHeal"?`MP回復 ${Math.round((skill.mpHeal??0)*100)}%`:["buff","stance","cleanse"].includes(skill.type)?"能力強化・特殊効果":`威力 ${Math.round((skill.power??0)*100)}%${skill.hits?` ×${skill.hits}`:""}`;return`<button type="button" class="skill-picker-card ${skill.id===current?"current":""}" data-skill-pick="${skill.id}" data-skill-picker-category="${kind}">
   <span class="skill-picker-check" aria-hidden="true">${skill.id===current?"✓":""}</span>
   <div class="skill-picker-card-head"><small>${categoryLabel[kind]}</small><em>${skillElementLabel(skill)}属性</em><b>${skill.name}</b></div>
   <p>${skill.description??`${skill.target??"敵単体"}に使用する${categoryLabel[kind]}スキル`}</p>
   <div class="skill-picker-chips"><span>${effect}</span><span>熟練Lv.${progress.level}</span><span>MP ${effectiveSkillMpCost(monster,skill)}</span><span>CT ${skill.cooldown??0}</span></div>
   ${skill.id===current?'<strong>設定中</strong>':""}
  </button>`}).join("");
  app.insertAdjacentHTML("beforeend",Modal(`SLOT ${slot+1}に設定するスキル`,`<div class="skill-slot-picker-v2"><nav class="skill-picker-filters"><button type="button" class="active" data-skill-picker-filter="all">すべて</button><button type="button" data-skill-picker-filter="attack">攻撃</button><button type="button" data-skill-picker-filter="recovery">回復</button><button type="button" data-skill-picker-filter="buff">強化</button><button type="button" data-skill-picker-filter="defense">防御</button></nav>${current?`<button type="button" class="skill-picker-remove-v2" data-skill-remove>スロットを空にする</button>`:""}<div class="skill-picker-card-list">${rows||'<p class="empty">習得済みスキルがありません</p>'}</div></div>`,"閉じる"));
  const modal=topModal();
  modal.classList.add("skill-picker-modal-v2");
  modal.querySelectorAll("[data-skill-picker-filter]").forEach(button=>button.onclick=()=>{modal.querySelectorAll("[data-skill-picker-filter]").forEach(entry=>entry.classList.toggle("active",entry===button));modal.querySelectorAll("[data-skill-picker-category]").forEach(card=>card.hidden=button.dataset.skillPickerFilter!=="all"&&card.dataset.skillPickerCategory!==button.dataset.skillPickerFilter)});
  let choosing=false;
  modal.querySelectorAll("[data-skill-pick]").forEach(button=>button.onclick=()=>{if(choosing)return;choosing=true;if(!equipSkill(monster,button.dataset.skillPick,slot)){choosing=false;return}modal.remove();persist(`SLOT ${slot+1} に装着`)});
  modal.querySelector("[data-skill-remove]")?.addEventListener("click",()=>{monster.equippedSkills=Array.from({length:4},(_,index)=>index===slot?null:(monster.equippedSkills?.[index]??null));modal.remove();persist(`SLOT ${slot+1} から外しました`)});
  modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
 };
 const openReservePicker=()=>{
  const reserve=save.state.monsters.filter(entry=>!save.state.party.includes(entry.id));
  const rows=reserve.map(entry=>{const species=SPECIES[entry.speciesId]??{},rarity=entry.summonTier??entry.summonRarity??species.rarity??"N";return`<button type="button" class="skill-reserve-row" data-skill-reserve-pick="${entry.id}" data-name="${escapeAttribute(`${displayName(entry)} ${species.name??""} ${species.race??""}`.toLowerCase())}" data-level="${entry.level??1}" data-power="${monsterCombatPower(entry)}" data-rarity="${RARITY_ORDER[rarity]??0}">${monsterVisual(entry,species.emoji??"👹",{className:"skill-reserve-monster-visual"})}<div><b>${displayName(entry)}</b><small>${rarity}・Lv.${entry.level}・戦力 ${formatCombatPower(monsterCombatPower(entry))}</small></div><em>選択</em></button>`}).join("");
  app.insertAdjacentHTML("beforeend",Modal("控えから選ぶ",`<div class="skill-reserve-picker-modal"><input type="search" data-skill-reserve-search placeholder="名前・種族で検索"><select data-skill-reserve-sort><option value="power">戦闘力順</option><option value="rarity">レア度順</option><option value="level">レベル順</option></select><div data-skill-reserve-list>${rows||'<p class="empty">控えモンスターがいません</p>'}</div></div>`,"閉じる"));
  const modal=topModal(),list=modal.querySelector("[data-skill-reserve-list]"),filter=()=>{
   const query=(modal.querySelector("[data-skill-reserve-search]")?.value??"").trim().toLowerCase(),sort=modal.querySelector("[data-skill-reserve-sort]")?.value??"power";
   const entries=[...modal.querySelectorAll("[data-skill-reserve-pick]")];
   entries.sort((a,b)=>Number(b.dataset[sort])-Number(a.dataset[sort])).forEach(entry=>{entry.hidden=Boolean(query)&&!entry.dataset.name.includes(query);list?.appendChild(entry)});
  };
  modal.querySelector("[data-skill-reserve-search]")?.addEventListener("input",filter);modal.querySelector("[data-skill-reserve-sort]")?.addEventListener("change",filter);filter();
  modal.querySelectorAll("[data-skill-reserve-pick]").forEach(button=>button.onclick=()=>{skillTarget=button.dataset.skillReservePick;skillSlotSelection=0;modal.remove();render()});
  modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
 };
 document.querySelectorAll("[data-skill-slot]").forEach(card=>card.addEventListener("click",()=>openSlotPicker(Number(card.dataset.skillSlot))));
 document.querySelector("[data-open-skill-reserve]")?.addEventListener("click",openReservePicker);
 document.querySelector("[data-skill-recommend]")?.addEventListener("click",()=>{
  const score=skill=>(skill.type==="revive"?600:skill.type==="allHeal"?500:skill.type==="buff"||skill.type==="stance"?380:0)+(skill.power??0)*100+(skill.heal??0)*150-(skill.mp??0)*.1;
  monster.equippedSkills=[...allLearnedSkills(monster)].sort((a,b)=>score(b)-score(a)).slice(0,4).map(skill=>skill.id);
  while(monster.equippedSkills.length<4)monster.equippedSkills.push(null);
  persist("おすすめスキルを一括設定しました");
 });
 document.querySelector("[data-skill-clear]")?.addEventListener("click",()=>{if(!confirm("4枠すべてのスキルを外しますか？"))return;monster.equippedSkills=[null,null,null,null];persist("スキルを全解除しました")});
}

function bindAbyssSkills(){
 document.getElementById("backAbyssSkillHome")?.addEventListener("click",()=>go("home"));
 document.querySelectorAll("[data-abyss-category]").forEach(button=>button.addEventListener("click",()=>{
  abyssSkillCategory=button.dataset.abyssCategory;
  render();
 }));
 document.querySelectorAll("[data-learn-abyss-skill]").forEach(button=>button.addEventListener("click",()=>{
  const node=abyssSkillNodeById(button.dataset.learnAbyssSkill);
  if(!node)return;
 if(button.disabled||button.dataset.buying==="1")return;
  button.dataset.buying="1";
  const scrollY=window.scrollY,anchorTop=button.getBoundingClientRect().top;
  const tree=document.querySelector(".abyss-tree-page,.abyss-tree-scroll,[data-abyss-tree-scroll]");
  const treeScroll=tree?.scrollTop??0;
  const vitals=save.state.monsters.map(monster=>[monster,captureVitalSnapshot(monster)]);
  const result=learnAbyssSkill(save.state,node.id);
  if(!result.ok){delete button.dataset.buying;showToast(result.message);return}
  normalizeEquipmentState();
  vitals.forEach(([monster,snapshot])=>restoreVitalSnapshot(monster,snapshot));
  save.save();
  showToast(`${node.name}を習得！`);
  render();
  requestAnimationFrame(()=>{
   window.scrollTo(0,scrollY);
   const restoredTree=document.querySelector(".abyss-tree-page,.abyss-tree-scroll,[data-abyss-tree-scroll]");
   if(restoredTree)restoredTree.scrollTop=treeScroll;
   requestAnimationFrame(()=>{
    const learned=document.querySelector(`[data-learn-abyss-skill="${node.id}"]`);
    if(learned){
     const delta=learned.getBoundingClientRect().top-anchorTop;
     if(Math.abs(delta)>.5)window.scrollBy(0,delta);
     learned.closest(".abyss-node-card,.abyss-skill-node")?.classList.add("just-learned");
    }
   });
  });
 }));
 document.getElementById("resetAbyssSkillTree")?.addEventListener("click",()=>{
  const summary=abyssSkillTreeSummary(save.state);
  if(!summary.learnedCount)return;
  if(!confirm(`深淵スキルをすべてリセットしますか？\n\n習得数：${summary.learnedCount}\n返還GOLD：${summary.investedGold.toLocaleString()}G\n\nリセット料金はかかりません。`))return;
  const vitals=save.state.monsters.map(monster=>[monster,captureVitalSnapshot(monster)]);
  const result=resetAbyssSkillTree(save.state);
  normalizeEquipmentState();
  vitals.forEach(([monster,snapshot])=>restoreVitalSnapshot(monster,snapshot));
  save.save();
  showToast(`${result.refund.toLocaleString()}Gを全額返還！`);
  render();
 });
}

const MONSTER_RELEASE_REWARDS={
 N:{gold:60,crystals:1},R:{gold:140,crystals:1},SR:{gold:360,crystals:1},SSR:{gold:900,crystals:1},
 UR:{gold:2400,crystals:1},LR:{gold:6500,crystals:1},"神話":{gold:18000,crystals:1},"深淵":{gold:50000,crystals:1},"十神":{gold:150000,crystals:1}
};
function workshopRarity(monster){return monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N"}
function workshopProtected(monster){return save.state.party.includes(monster.id)||monster.favorite||monster.locked}
function workshopMonsterCard(monster,{selected=false,targetCandidate=false,release=false}={}){
 const species=SPECIES[monster.speciesId]??{},rarity=workshopRarity(monster),stats=calculatedStats(monster),stars=Math.max(1,Math.min(5,monster.stars??1));
 return`<article class="monster-workshop-card rarity-${rarity} ${selected?"selected":""} ${workshopProtected(monster)?"protected":""}" data-workshop-monster="${monster.id}" ${targetCandidate?'data-workshop-drag-target="1"':""}>
  <span>${monsterVisual(monster,species.emoji??"👹",{className:"monster-workshop-visual"})}</span>
  <div><b>${displayName(monster)}＋${monster.plus??0} <i>Lv.${monster.level}</i></b><small>${"★".repeat(stars)}${"☆".repeat(5-stars)}　❤️${monster.affection??0}</small><small>HP ${stats.hp.toLocaleString()} / ATK ${stats.atk.toLocaleString()} / DEF ${stats.def.toLocaleString()} / SPD ${stats.spd.toLocaleString()}</small></div>
  ${workshopProtected(monster)?'<em>保護中</em>':selected?"<em>選択中</em>":release?"<em>逃す候補</em>":"<em>素材候補</em>"}
 </article>`;
}
function workshopReleaseReward(monster){
 const base=MONSTER_RELEASE_REWARDS[workshopRarity(monster)]??MONSTER_RELEASE_REWARDS.N;
 return{gold:Math.round(base.gold*(1+Math.max(0,(monster.level??1)-1)*.025+Math.max(0,monster.plus??0)*.08)),crystals:base.crystals};
}
function monsterWorkshopBody(){
 const species=SPECIES[monsterWorkshop.speciesId],owned=save.state.monsters.filter(monster=>monster.speciesId===monsterWorkshop.speciesId);
 if(!species||!owned.length)return'<div class="empty">この魔物は所持していません。</div>';
 let target=owned.find(monster=>monster.id===monsterWorkshop.targetId);
 if(!target){target=[...owned].sort((a,b)=>totalExperience(b)-totalExperience(a)||(b.plus??0)-(a.plus??0))[0];monsterWorkshop.targetId=target.id}
 const selected=owned.filter(monster=>monsterWorkshop.selected.has(monster.id));
 if(monsterWorkshop.tab==="release"){
  const reward=selected.reduce((sum,monster)=>{const value=workshopReleaseReward(monster);sum.gold+=value.gold;sum.crystals+=value.crystals;return sum},{gold:0,crystals:0});
  return`<div class="monster-workshop">
   <div class="monster-workshop-tabs"><button data-workshop-tab="combine">合成</button><button class="active" data-workshop-tab="release">逃す</button></div>
   <div class="workshop-guide"><b>${species.name}を整理</b><span>タップで複数選択。出撃中・お気に入り・ロック中は保護されます。</span></div>
   <div class="monster-workshop-grid">${owned.map(monster=>workshopMonsterCard(monster,{selected:monsterWorkshop.selected.has(monster.id),release:true})).join("")}</div>
   <div class="workshop-sticky-action workshop-release-action"><div><small>選択 ${selected.length}体の受取報酬</small><b>${reward.gold.toLocaleString()} GOLD</b><strong>魔晶石 ×${reward.crystals.toLocaleString()}</strong></div><button type="button" class="danger" data-workshop-release ${selected.length?"":"disabled"}>選択した魔物を<br>逃す</button></div>
  </div>`;
 }
 const materials=owned.filter(monster=>monster.id!==target.id),transfer=selected.filter(monster=>monster.id!==target.id),plusGain=Math.floor(transfer.length/2);
 return`<div class="monster-workshop">
  <div class="monster-workshop-tabs"><button class="active" data-workshop-tab="combine">合成</button><button data-workshop-tab="release">逃す</button></div>
  <div class="workshop-target-wrap"><small>強化するメイン個体</small><div class="workshop-target-slot" data-workshop-target-slot>${workshopMonsterCard(target)}<span>長押しした同名カードをここへ移動</span></div></div>
  <div class="workshop-guide"><b>同名素材 ${materials.length}体</b><span>タップで複数選択 / 長押し移動でメイン個体と交換</span></div>
  <div class="monster-workshop-grid">${materials.map(monster=>workshopMonsterCard(monster,{selected:monsterWorkshop.selected.has(monster.id),targetCandidate:true})).join("")||'<div class="empty">同名素材がありません。</div>'}</div>
  <div class="workshop-sticky-action"><div><small>素材 ${transfer.length}体・2体ごとに限界突破+1</small><b>＋${plusGain} / EXPは変化しません</b></div><button type="button" data-workshop-combine ${transfer.length>=2&&transfer.length%2===0?"":"disabled"}>合成する</button></div>
 </div>`;
}
function refreshMonsterWorkshop(modal){
 if(!modal?.isConnected)return;
 modal.querySelector(".game-modal-body").innerHTML=monsterWorkshopBody();
 modal.querySelectorAll("[data-workshop-tab]").forEach(button=>button.onclick=()=>{monsterWorkshop.tab=button.dataset.workshopTab;monsterWorkshop.selected.clear();refreshMonsterWorkshop(modal)});
 modal.querySelectorAll("[data-workshop-monster]").forEach(card=>card.onclick=()=>{
  if(card.dataset.workshopDragged==="1"){card.dataset.workshopDragged="0";return}
  const monster=save.state.monsters.find(entry=>entry.id===card.dataset.workshopMonster);if(!monster||workshopProtected(monster))return showToast("出撃中・お気に入り・ロック中の個体は保護されています");
  if(monsterWorkshop.tab==="combine"&&monster.id===monsterWorkshop.targetId)return;
  monsterWorkshop.selected.has(monster.id)?monsterWorkshop.selected.delete(monster.id):monsterWorkshop.selected.add(monster.id);refreshMonsterWorkshop(modal);
 });
 modal.querySelectorAll("[data-workshop-drag-target]").forEach(card=>card.addEventListener("pointerdown",event=>{
  if(event.button!=null&&event.button!==0)return;
  const monster=save.state.monsters.find(entry=>entry.id===card.dataset.workshopMonster);
  if(!monster||workshopProtected(monster))return;
  const body=modal.querySelector(".game-modal-body"),target=modal.querySelector("[data-workshop-target-slot]");
  const pointerId=event.pointerId,start={x:event.clientX,y:event.clientY};let point={...start},active=false,ghost=null,scrollFrame=0;
  const overTarget=()=>{const rect=target?.getBoundingClientRect();return Boolean(rect&&point.x>=rect.left&&point.x<=rect.right&&point.y>=rect.top&&point.y<=rect.bottom)};
  const positionGhost=()=>{if(!ghost)return;ghost.style.left=`${point.x}px`;ghost.style.top=`${point.y}px`;target?.classList.toggle("drop-ready",overTarget())};
  const scrollWhileDragging=()=>{
   if(!active||!body)return;
   const rect=body.getBoundingClientRect(),edge=Math.min(96,rect.height*.2);
   let delta=0;if(point.y<rect.top+edge)delta=-Math.ceil((rect.top+edge-point.y)/edge*28);else if(point.y>rect.bottom-edge)delta=Math.ceil((point.y-(rect.bottom-edge))/edge*28);
   if(delta){body.scrollTop+=delta;positionGhost()}
   scrollFrame=requestAnimationFrame(scrollWhileDragging);
  };
  const activate=()=>{
   active=true;card.dataset.workshopDragged="1";card.classList.add("dragging");
   card.setPointerCapture?.(pointerId);ghost=card.cloneNode(true);ghost.classList.add("workshop-drag-ghost");document.body.appendChild(ghost);
   positionGhost();scrollFrame=requestAnimationFrame(scrollWhileDragging);navigator.vibrate?.(18);
  };
  let timer=setTimeout(activate,330);
  const cleanup=()=>{
   clearTimeout(timer);cancelAnimationFrame(scrollFrame);document.removeEventListener("pointermove",move,true);document.removeEventListener("pointerup",finish,true);document.removeEventListener("pointercancel",finish,true);
   card.classList.remove("dragging");ghost?.remove();target?.classList.remove("drop-ready");
   try{card.releasePointerCapture?.(pointerId)}catch{}
  };
  const move=moveEvent=>{
   if(moveEvent.pointerId!==pointerId)return;
   point={x:moveEvent.clientX,y:moveEvent.clientY};
   if(!active&&Math.hypot(point.x-start.x,point.y-start.y)>10){clearTimeout(timer);return}
   if(!active)return;moveEvent.preventDefault();positionGhost();
  };
  const finish=upEvent=>{
   if(upEvent.pointerId!==pointerId)return;
   point={x:upEvent.clientX,y:upEvent.clientY};const dropped=active&&overTarget();cleanup();
   if(dropped){monsterWorkshop.targetId=monster.id;monsterWorkshop.selected.clear();refreshMonsterWorkshop(modal)}
  };
  document.addEventListener("pointermove",move,{capture:true,passive:false});document.addEventListener("pointerup",finish,true);document.addEventListener("pointercancel",finish,true);
 }));
 modal.querySelector("[data-workshop-combine]")?.addEventListener("click",()=>{
  const target=save.state.monsters.find(monster=>monster.id===monsterWorkshop.targetId),materials=save.state.monsters.filter(monster=>monsterWorkshop.selected.has(monster.id)&&monster.speciesId===monsterWorkshop.speciesId&&monster.id!==target?.id&&!workshopProtected(monster));
  if(!target||materials.length<2||materials.length%2)return showToast("素材は2体単位で選択してください");
  const ids=new Set(materials.map(monster=>monster.id)),plusGain=Math.floor(materials.length/2);
  materials.forEach(monster=>Object.values(monster.equipment??{}).filter(Boolean).forEach(id=>{const item=save.state.equipment.find(entry=>entry.id===id);if(item)item.equippedBy=null}));
  save.state.monsters=save.state.monsters.filter(monster=>!ids.has(monster.id));target.plus=Math.max(0,target.plus??0)+plusGain;target.currentHp=Math.min(calculatedStats(target).hp,target.currentHp??calculatedStats(target).hp);target.currentMp=Math.min(maxMp(target),target.currentMp??maxMp(target));
  monsterWorkshop.selected.clear();save.save();showToast(`合成成功！ ＋${plusGain}・レベルとEXPは維持`);refreshMonsterWorkshop(modal);
 });
 modal.querySelector("[data-workshop-release]")?.addEventListener("click",()=>{
  const targets=save.state.monsters.filter(monster=>monsterWorkshop.selected.has(monster.id)&&monster.speciesId===monsterWorkshop.speciesId&&!workshopProtected(monster));
  if(!targets.length)return;if(save.state.monsters.length-targets.length<1)return showToast("最後の1体は逃せません");
  const reward=targets.reduce((sum,monster)=>{const value=workshopReleaseReward(monster);sum.gold+=value.gold;sum.crystals+=value.crystals;return sum},{gold:0,crystals:0}),ids=new Set(targets.map(monster=>monster.id));
  targets.forEach(monster=>Object.values(monster.equipment??{}).filter(Boolean).forEach(id=>{const item=save.state.equipment.find(entry=>entry.id===id);if(item)item.equippedBy=null}));
  save.state.monsters=save.state.monsters.filter(monster=>!ids.has(monster.id));save.state.player.gold+=reward.gold;save.state.player.crystals+=reward.crystals;monsterWorkshop.selected.clear();save.save();showToast(`${targets.length}体を逃し、${reward.gold.toLocaleString()}G・魔晶石${reward.crystals}個を獲得`);
  if(!save.state.monsters.some(monster=>monster.speciesId===monsterWorkshop.speciesId)){modal.remove();render()}else refreshMonsterWorkshop(modal);
 });
}
function openMonsterWorkshop(speciesId){
 const species=SPECIES[speciesId];if(!species||!save.state.monsters.some(monster=>monster.speciesId===speciesId))return;
 const index=Math.max(0,orderedMonsterSpecies(SPECIES).findIndex(entry=>entry.id===speciesId));
 monsterWorkshop={speciesId,tab:"combine",targetId:null,selected:new Set()};app.insertAdjacentHTML("beforeend",Modal(`No.${String(index+1).padStart(3,"0")} ${species.name}`,monsterWorkshopBody(),"閉じる"));
 const modal=topModal();modal.classList.add("monster-workshop-modal");modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();render()};refreshMonsterWorkshop(modal);
}
function bindList(){
 document.getElementById("backHome")?.addEventListener("click",()=>go("home"));
 const input=document.getElementById("monsterSearch"),applySearch=()=>{const query=(input?.value??"").trim().toLowerCase();monsterListState.search=input?.value??"";document.querySelectorAll(".monster-species-card").forEach(card=>card.hidden=Boolean(query&&!card.dataset.speciesSearch.includes(query)))};
 input?.addEventListener("input",applySearch);applySearch();
 document.querySelectorAll("[data-monster-species]").forEach(card=>card.addEventListener("click",()=>openMonsterWorkshop(card.dataset.monsterSpecies)));
}

function selectableMonsters(){return save.state.monsters.filter(m=>!save.state.party.includes(m.id)&&!m.favorite&&!m.locked)}
function selectMonstersPreset(mode){const pool=selectableMonsters();if(mode==="none")monsterManage.selected.clear();else{const picks=pool.filter(m=>mode==="all"||mode==="plus0"&&(m.plus??0)===0||mode==="unfavorite"&&!m.favorite||["N","R"].includes(mode)&&(m.summonTier??m.summonRarity??SPECIES[m.speciesId]?.rarity??"N")===mode);picks.forEach(m=>monsterManage.selected.add(m.id))}render()}
function releaseSelectedMonsters(){const targets=selectableMonsters().filter(m=>monsterManage.selected.has(m.id));if(!targets.length)return alert("手放せるモンスターが選択されていません");if(save.state.monsters.length-targets.length<1)return alert("最後の1体は手放せません");if(!confirm(`${targets.length}体を手放します。\n魔晶石 ${targets.length}個を獲得します。`))return;const ids=new Set(targets.map(m=>m.id));targets.forEach(m=>Object.values(m.equipment??{}).forEach(id=>{const i=save.state.equipment.find(x=>x.id===id);if(i)i.equippedBy=null}));save.state.monsters=save.state.monsters.filter(m=>!ids.has(m.id));save.state.player.crystals+=targets.length;monsterManage.selected.clear();save.save();render()}
function detailButtons(origin="monsters"){document.querySelectorAll("[data-monster-id]").forEach(b=>b.onclick=()=>{detailNavigationOrigin=origin;selected=b.dataset.monsterId;go("detail")})}
function bindDetail(m){document.getElementById("backMonsters").onclick=()=>{const target=detailNavigationOrigin;detailNavigationOrigin="monsters";go(target)};document.querySelectorAll("[data-switch-monster]").forEach(b=>b.onclick=()=>{selected=b.dataset.switchMonster;render();window.scrollTo({top:0,behavior:"smooth"})});document.getElementById("releaseMonster")?.addEventListener("click",()=>releaseMonster(m));document.getElementById("toggleFavorite").onclick=()=>{m.favorite=!m.favorite;save.save();render()};document.getElementById("saveNickname")?.addEventListener("click",()=>{const v=document.getElementById("nicknameInput").value.trim();if(v)m.nickname=v.slice(0,12);save.save();render()});document.querySelectorAll("[data-color-id]").forEach(b=>b.onclick=()=>{m.colorId=b.dataset.colorId;save.save();render()});document.getElementById("limitBreakButton")?.addEventListener("click",()=>performLimitBreak(m.id,{returnToDetail:true}));document.getElementById("openMonsterEquipment")?.addEventListener("click",()=>{equipmentTarget=m.id;equipmentFocusItemId=null;navigationOrigin="detail";go("equipment")});document.querySelectorAll("[data-open-codex-species]").forEach(button=>button.onclick=()=>{const sorted=orderedMonsterSpecies(SPECIES),index=Math.max(0,sorted.findIndex(species=>species.id===button.dataset.openCodexSpecies));openMonsterCodexDetail(button.dataset.openCodexSpecies,true,index)})}
async function redeemSettingsSerialCode(event){
 event?.preventDefault();
 const input=document.getElementById("serialCodeInput"),button=document.getElementById("redeemSerialCode");
 if(!input||!button)return;
 button.disabled=true;button.textContent="確認中…";
 const validation=await validateSerialCode(save.state,input.value);
 if(!validation.ok){button.disabled=false;button.textContent="報酬を受け取る";return showToast(validation.message)}
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state));
 const result=applySerialReward(save.state,validation.rewardId);
 if(!result.ok){save.state=backup;button.disabled=false;button.textContent="報酬を受け取る";return showToast(result.message)}
 if(!save.save()){save.state=backup;button.disabled=false;button.textContent="報酬を受け取る";return showToast("保存できなかったため、報酬受取を取り消しました")}
 commitSerialRedemption(validation.rewardId);
 normalizeEquipmentState();input.value="";
 app.insertAdjacentHTML("beforeend",Modal(`${result.icon} ${result.title}`,`<div class="serial-reward-result"><div>${result.monster?monsterVisual(result.monster,result.icon,{className:"serial-reward-monster-visual"}):result.icon}</div><p><b>${result.message}</b></p><small>このコードは使用済みとして記録されました。</small></div>`,"確認"));
 topModalButton().onclick=()=>{closeTopModal();render()};
}
function bindSettings(){
 document.getElementById("backHome").onclick=()=>{const target=settingsNavigationOrigin;settingsNavigationOrigin="home";returnFromMenu(target)};
 document.getElementById("toggleAuto").onclick=()=>{save.state.settings.autoBattle=!save.state.settings.autoBattle;save.save();render()};
 document.getElementById("toggleMinimap").onclick=()=>{save.state.settings.minimapVisible=!save.state.settings.minimapVisible;save.save();render()};
 document.getElementById("toggleAudio").onclick=async()=>{save.state.settings.audioEnabled=save.state.settings.audioEnabled===false;await audio.unlock();audio.applySettings();audio.sfx("select");save.save();render()};
 for(const[id,key]of[["musicVolume","musicVolume"],["sfxVolume","sfxVolume"]])document.getElementById(id)?.addEventListener("input",event=>{save.state.settings[key]=Math.max(0,Math.min(1,Number(event.target.value)/100));const output=document.getElementById(`${id}Output`);if(output)output.textContent=`${event.target.value}%`;audio.applySettings();save.save()});
 document.getElementById("openTutorialBook")?.addEventListener("click",openTutorialBook);
 document.getElementById("serialCodeForm")?.addEventListener("submit",redeemSettingsSerialCode);
 document.getElementById("resetSave").onclick=()=>{if(confirm("初期化する？")){save.reset();snapshot=null;go("home")}};
}


function equipmentAffixCraftingBody(item){
 const affixes=normalizeEquipmentAffixLocks(item),locked=lockedAffixCount(item),maximum=maxLockableAffixes(item),cost=rerollGoldCost(save.state,item),gold=Math.max(0,Number(save.state.player.gold)||0);
 const rows=affixes.map((affix,index)=>{
  const quality=affixQuality(affix),fixed=affix.locked,definition=affixDefinition(affix.id),disabled=!fixed&&locked>=maximum;
  return`<div class="affix-craft-row ${fixed?"is-fixed":""}"><span class="affix-craft-pin">${fixed?"📌":"◇"}</span><div><b style="color:${quality.color}">${formatAffix(affix)}${definition?.legendaryOnly?"〈固有〉":""}</b><small>${quality.name}${fixed?"・再抽選から保護":""}</small></div><button type="button" class="affix-lock-toggle ${fixed?"locked":""}" data-affix-lock-index="${index}" ${disabled?"disabled":""}>${fixed?"固定解除":"この枠を固定"}</button></div>`
 }).join("");
 return`<div class="affix-craft-modal"><div class="affix-craft-summary"><div><small>所持GOLD</small><b>${gold.toLocaleString()}G</b></div><div><small>今回の費用</small><b class="${gold<cost?"insufficient":""}">${cost.toLocaleString()}G</b></div><div><small>固定枠</small><b>${locked}/${maximum}</b></div></div><div class="affix-craft-equipment"><small>${equipmentDisplayRarity(item)} / Lv.${Math.max(1,Number(item.level)||1)}</small><b>${item.name}${item.plus?` +${item.plus}`:""}</b></div><div class="affix-craft-list">${rows}</div><small>固定・解除そのものは無料です。固定枠が増えるほど再抽選費用が上がります。専用アイテムや魔晶石は使わず、必ず1枠以上を再抽選します。</small>${gold<cost?`<p class="affix-craft-warning">あと ${(cost-gold).toLocaleString()}G 必要です。</p>`:""}</div>`
}
function openEquipmentAffixHelp(){
 const qualities=Object.values(AFFIX_QUALITY).map(quality=>`<p class="affix-quality-row"><b style="color:${quality.color}">${quality.name}</b><span>同じ効果でも数値品質が変化</span></p>`).join("");
 app.insertAdjacentHTML("beforeend",Modal("ランダムオプションと厳選",`<div class="affix-help">${qualities}<small>「GOLD厳選」では未固定のオプションを別種類へ再抽選します。📌固定は無料で最大3枠ですが、必ず1枠以上を再抽選対象に残します。固定数が増えるほど必要GOLDも上昇します。〈固有〉はSSR以上に出現します。</small></div>`,"閉じる"));
 topModalButton().onclick=closeTopModal;
}
function openEquipmentAffixCrafting(itemId){
 const item=save.state.equipment.find(entry=>entry.id===itemId);
 if(!item)return showToast("装備が見つかりません");
 if(!normalizeEquipmentAffixLocks(item).length)return showToast("この装備にはランダムオプションがありません");
 app.insertAdjacentHTML("beforeend",Modal("🎲 装備オプション厳選",equipmentAffixCraftingBody(item),"GOLDで再抽選"));
 const modal=topModal(),primary=modal.querySelector("[data-modal-primary]");
 modal._onDismiss=()=>{modal.remove();render()};
 modal.querySelectorAll("[data-affix-lock-index]").forEach(button=>button.onclick=()=>{
  const result=toggleAffixLock(item,Number(button.dataset.affixLockIndex));
  if(!result.ok){showToast(result.message);return}
  save.save();modal.remove();openEquipmentAffixCrafting(itemId);
 });
 primary.onclick=()=>{
  const owner=item.equippedBy?save.state.monsters.find(monster=>monster.id===item.equippedBy):null,vital=owner?captureVitalSnapshot(owner):null;
  const result=rerollUnlockedAffixes(save.state,item);
  if(!result.ok){showToast(result.message);return}
  normalizeEquipmentState();
  if(owner&&vital)restoreVitalSnapshot(owner,vital);
  save.save();modal._onDismiss=null;render();showToast(`${result.rerolledCount}枠を再抽選・${result.cost.toLocaleString()}G消費`);openEquipmentAffixCrafting(itemId);
 };
}
function openEquipmentSlotPicker(subslot){
 const target=save.state.monsters.find(monster=>monster.id===equipmentTarget);if(!target)return;
 const currentId=target.equipment?.[subslot]??null;
 const candidates=save.state.equipment.filter(item=>compatibleSubslots(item).includes(subslot)&&(!item.equippedBy||item.equippedBy===target.id)).sort((a,b)=>(RARITY_ORDER[equipmentDisplayRarity(b)]??0)-(RARITY_ORDER[equipmentDisplayRarity(a)]??0)||equipmentPower(b)-equipmentPower(a));
 const rows=candidates.map(item=>{
  const rarity=equipmentDisplayRarity(item),stats=Object.entries(item.stats??{}).map(([key,value])=>`${equipmentStatLabel(key)}+${Math.round(value*equipmentStatMultiplier(item))}`).join(" / "),filled=Math.min(4,item.affixes?.length??0),diamonds=Array.from({length:4},(_,index)=>index<filled?"◆":"◇").join("");
  return`<button type="button" class="equipment-slot-picker-row ${item.id===currentId?"current":""}" data-equipment-picker-item="${item.id}"><div><small>${rarity}・Lv.${item.level??1}</small><b>${item.name}</b><span>${stats||"能力補正なし"}</span><em>${diamonds}</em></div><strong>${item.id===currentId?"装備中":"装備"}</strong></button>`;
 }).join("");
 app.insertAdjacentHTML("beforeend",Modal(`${equipmentSubslotLabel(subslot)}を選択`,`<div class="equipment-slot-picker"><p class="muted">装備可能な所持品だけを表示しています。</p>${rows||'<p class="empty">装備できる所持品がありません。</p>'}<button type="button" class="equipment-picker-armory" data-open-armory>武器庫で確認する</button></div>`,"閉じる"));
 const modal=topModal();
 modal.querySelectorAll("[data-equipment-picker-item]").forEach(button=>button.onclick=()=>{if(button.dataset.equipmentPickerItem===currentId){modal.remove();return}modal.remove();equipItem(button.dataset.equipmentPickerItem,target.id,subslot)});
 modal.querySelector("[data-open-armory]")?.addEventListener("click",()=>{modal.remove();inventoryNavigationOrigin="equipment";inventoryCategory=subslot.startsWith("weapon")?"weapon":subslot.startsWith("armor")?"armor":"accessory";inventorySort="rarity";go("armory")});
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function bindEquipment(){
 const focusedItemId=equipmentFocusItemId;
 document.getElementById("backEquipmentHome").onclick=()=>{const target=navigationOrigin;navigationOrigin="home";equipmentFocusItemId=null;returnFromMenu(target)};
 document.getElementById("openAffixHelp")?.addEventListener("click",openEquipmentAffixHelp);
 document.querySelectorAll("[data-equipment-target]").forEach(b=>b.onclick=()=>{equipmentFocusItemId=null;equipmentTarget=b.dataset.equipmentTarget;render()});
 document.getElementById("equipmentSort")?.addEventListener("change",e=>{save.state.settings.equipmentSort=e.target.value;save.save();render()});
 document.querySelectorAll("[data-equipment-slot]").forEach(b=>b.onclick=()=>{save.state.settings.equipmentSlot=b.dataset.equipmentSlot;save.save();render()});
 document.querySelectorAll("[data-equipment-storage]").forEach(b=>b.onclick=()=>{if(b.disabled)return;save.state.settings.equipmentStorage=b.dataset.equipmentStorage;save.save();render()});
 document.querySelectorAll("[data-equip]").forEach(b=>b.onclick=()=>equipItem(b.dataset.equip,b.dataset.target,b.dataset.subslot));document.getElementById("autoEquipOne")?.addEventListener("click",()=>{autoEquipMonster(equipmentTarget);save.save();render()});document.getElementById("autoEquipParty")?.addEventListener("click",()=>{save.state.party.forEach(autoEquipMonster);save.save();render()});document.getElementById("unequipOne")?.addEventListener("click",()=>unequipMonsterAll(equipmentTarget));document.getElementById("unequipParty")?.addEventListener("click",()=>{if(!confirm("パーティー全員の装備を解除しますか？"))return;save.state.party.forEach(id=>unequipMonsterAll(id,false));save.save();render()});
 document.querySelectorAll("[data-open-equipment-slot]").forEach(button=>button.onclick=()=>openEquipmentSlotPicker(button.dataset.openEquipmentSlot));
 document.querySelectorAll("[data-unequip]").forEach(b=>b.onclick=()=>unequipItem(b.dataset.unequip));
 document.querySelectorAll("[data-favorite-equipment]").forEach(b=>b.onclick=()=>{const i=save.state.equipment.find(x=>x.id===b.dataset.favoriteEquipment);if(!i)return;i.favorite=!i.favorite;save.save();render()});
 document.querySelectorAll("[data-lock-equipment]").forEach(b=>b.onclick=()=>{const i=save.state.equipment.find(x=>x.id===b.dataset.lockEquipment);if(!i)return;i.locked=!i.locked;save.save();render()});
 document.querySelectorAll("[data-sell]").forEach(b=>b.onclick=()=>sellItem(b.dataset.sell));
 document.querySelectorAll("[data-enhance-equipment]").forEach(b=>b.onclick=()=>enhanceEquipment(b.dataset.enhanceEquipment));
 document.querySelectorAll("[data-reroll-equipment]").forEach(b=>b.onclick=()=>openEquipmentAffixCrafting(b.dataset.rerollEquipment));
 document.getElementById("bulkSellEquipment")?.addEventListener("click",bulkSellEquipment);
 document.getElementById("toggleEquipmentEdit")?.addEventListener("click",()=>{equipmentManage.editing=!equipmentManage.editing;if(!equipmentManage.editing)equipmentManage.selected.clear();render()});
 document.querySelectorAll("[data-select-equipment-id]").forEach(c=>c.onchange=()=>{c.checked?equipmentManage.selected.add(c.dataset.selectEquipmentId):equipmentManage.selected.delete(c.dataset.selectEquipmentId);render()});
 document.querySelectorAll("[data-select-equipment]").forEach(b=>b.onclick=()=>selectEquipmentPreset(b.dataset.selectEquipment));
 document.getElementById("sellSelectedEquipment")?.addEventListener("click",sellSelectedEquipment);
 document.getElementById("lockSelectedEquipment")?.addEventListener("click",lockSelectedEquipment);
 document.querySelectorAll("[data-take-equipment]").forEach(b=>b.onclick=()=>{const result=takeFromStorage(save.state,b.dataset.takeEquipment,b.dataset.storage);if(!result.ok)return alert(result.message);save.save();render()});
 if(focusedItemId)requestAnimationFrame(()=>{
  const card=[...document.querySelectorAll("[data-equipment-card-id]")].find(entry=>entry.dataset.equipmentCardId===focusedItemId)
   ??[...document.querySelectorAll("[data-equipped-item]")].find(entry=>entry.dataset.equippedItem===focusedItemId);
  card?.scrollIntoView({behavior:"smooth",block:"center"});
  equipmentFocusItemId=null;
 });
}

const INVENTORY_STACK_INFO={
 potions:["🧪","薬草","単体のHPを回復します。"],
 highPotions:["⚗️","上級回復薬","単体のHPを大きく回復します。"],
 partyPotions:["💚","全体回復薬","味方全員のHPを回復します。"],
 manaPotions:["💧","魔力水","単体のMPを回復します。"],
 highManaPotions:["🔷","上級魔力水","単体のMPを大きく回復します。"],
 partyManaPotions:["🌊","全体魔力水","味方全員のMPを回復します。"],
 fullManaPotions:["💠","魔力全快薬","単体のMPを全回復します。"],
 partyFullManaPotions:["🌀","全体魔力全快薬","味方全員のMPを全回復します。"],
 reviveLeaves:["🍃","蘇生の葉","戦闘不能の仲間を蘇生します。"],
 statusCures:["🩹","浄化薬","単体の状態異常を解除します。"],
 partyStatusCures:["💨","全体浄化薬","味方全員の状態異常を解除します。"],
 fullHeals:["✨","万能霊薬","単体のHP・MP・状態異常を回復します。"],
 partyFullHeals:["🌟","全体万能霊薬","味方全員を完全回復します。"],
 captureCrystals:["🔮","捕獲結晶","戦闘中の捕獲1回につき1個消費します。"],
 abyssKeys:["🗝️","深淵の鍵","深淵の扉や特別な交換で使う希少素材です。"]
};
const INVENTORY_SELL_PRICE={
 potions:40,highPotions:120,partyPotions:90,manaPotions:55,highManaPotions:150,partyManaPotions:130,
 fullManaPotions:260,partyFullManaPotions:620,reviveLeaves:240,statusCures:70,partyStatusCures:180,
 fullHeals:320,partyFullHeals:880
};
function closeInventoryContext(){
 document.querySelector(".inventory-context-popover")?.remove();
 document.querySelectorAll(".v2-inventory-item.context-open").forEach(card=>card.classList.remove("context-open"));
}
function positionInventoryContext(popover,anchor){
 const rect=anchor.getBoundingClientRect(),width=Math.min(286,Math.max(230,window.innerWidth-24));
 popover.style.width=`${width}px`;
 const measured=popover.getBoundingClientRect(),left=Math.max(8,Math.min(window.innerWidth-width-8,rect.right+8+width<=window.innerWidth?rect.right+8:rect.left-width-8));
 const top=Math.max(8,Math.min(window.innerHeight-measured.height-8,rect.top+(rect.height-measured.height)/2));
 popover.style.left=`${left}px`;popover.style.top=`${top}px`;
}
function inventoryEquipmentContext(item){
 const rarity=equipmentDisplayRarity(item),stats=Object.entries(item.stats??{}).map(([key,value])=>`${equipmentStatLabel(key)} +${Math.round(value*equipmentStatMultiplier(item))}`).join(" / ")||"能力補正なし";
 const affixes=(item.affixes??[]).map(affix=>{const quality=affixQuality(affix);return`<small style="color:${quality.color}">${formatAffix(affix)}</small>`}).join("")||"<small>オプションなし</small>";
 return`<div class="inventory-context-copy"><b style="color:${equipmentRarityColor(item)}">[${rarity}] ${item.name}</b><span>Lv.${item.level??1}${item.plus?`・+${item.plus}`:""} / ${slotLabel(item.slot)}</span><p>${stats}</p><div>${affixes}</div></div><div class="inventory-context-actions"><button data-context-equip="${item.id}">${item.equippedBy?"移動・外す":"装備"}</button><button data-context-enhance="${item.id}">強化</button><button data-context-affix="${item.id}" ${(item.affixes??[]).length?"":"disabled"}>厳選</button><button data-context-lock="${item.id}">${item.locked?"ロック解除":"ロック"}</button><button class="danger" data-context-sell="${item.id}" ${item.equippedBy||item.locked||item.ruleOverrides?.unsellable?"disabled":""}>売却</button></div>`;
}
const INLINE_EQUIPMENT_SLOT_LABELS={weaponRight:"右手",weaponLeft:"左手",armorBody:"胴",armorSupport:"胴",accessoryNeck:"アクセ",accessoryFinger:"アクセ"};
function openInventoryEquipPicker(item){
 closeInventoryContext();
 const party=save.state.party.map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean);
 const rows=party.map(monster=>`<article class="inventory-equip-target"><div><b>${displayName(monster)}</b><small>Lv.${monster.level}</small></div><div>${compatibleSubslots(item).map(subslot=>`<button type="button" data-inline-equip="${item.id}" data-inline-target="${monster.id}" data-inline-subslot="${subslot}" ${monster.level<(SLOT_UNLOCK_LEVEL[subslot]??1)?"disabled":""}>${INLINE_EQUIPMENT_SLOT_LABELS[subslot]??equipmentSubslotLabel(subslot)}${monster.level<(SLOT_UNLOCK_LEVEL[subslot]??1)?` Lv.${SLOT_UNLOCK_LEVEL[subslot]}`:""}</button>`).join("")}</div></article>`).join("");
 const remove=item.equippedBy?`<button type="button" class="danger inventory-inline-unequip" data-inline-unequip="${item.id}">現在の装備先から外す</button>`:"";
 app.insertAdjacentHTML("beforeend",Modal("装備先を選択",`<div class="inventory-inline-equip"><p>この画面のまま装備先を変更できます。</p>${rows||'<div class="empty">パーティーに魔物がいません。</div>'}${remove}</div>`,"戻る"));
 const modal=topModal();
 modal.querySelectorAll("[data-inline-equip]").forEach(button=>button.onclick=()=>equipItem(button.dataset.inlineEquip,button.dataset.inlineTarget,button.dataset.inlineSubslot));
 modal.querySelector("[data-inline-unequip]")?.addEventListener("click",()=>unequipItem(item.id));
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function inventoryStackContext(id){
 const [icon,name,description]=INVENTORY_STACK_INFO[id]??["◆",id,"所持アイテム"],amount=save.state.inventory?.[id]??0,price=INVENTORY_SELL_PRICE[id]??0;
 return`<div class="inventory-context-copy"><b>${icon} ${name}</b><span>所持 ${amount.toLocaleString()}個</span><p>${description}</p></div><div class="inventory-context-actions">${price?`<button data-context-use="${id}" ${amount<=0?"disabled":""}>使用する</button><button class="danger" data-context-stack-sell="${id}" ${amount<=0?"disabled":""}>売却 ${price}G</button>`:'<button disabled>大切な素材</button>'}</div>`;
}
function openInventoryContext(anchor,body){
 closeInventoryContext();anchor.classList.add("context-open");
 const popover=document.createElement("aside");popover.className="inventory-context-popover";popover.innerHTML=body;document.body.appendChild(popover);positionInventoryContext(popover,anchor);
 const dismiss=event=>{if(popover.contains(event.target)||anchor.contains(event.target))return;closeInventoryContext();document.removeEventListener("pointerdown",dismiss,true)};
 requestAnimationFrame(()=>document.addEventListener("pointerdown",dismiss,true));
 return popover;
}
function openInventoryUseTarget(type){
 if((save.state.inventory?.[type]??0)<=0)return showToast("所持していません");
 const single=["potions","highPotions","manaPotions","highManaPotions","fullManaPotions","reviveLeaves","statusCures","fullHeals"].includes(type);
 if(!single){closeInventoryContext();return useFieldItem(type,save.state.party[0])}
 const party=save.state.party.map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean);
 const rows=party.map(monster=>{const stats=calculatedStats(monster);return`<button type="button" data-inventory-use-target="${monster.id}" ${type==="reviveLeaves"?monster.currentHp>0?"disabled":"":monster.currentHp<=0?"disabled":""}><b>${displayName(monster)} Lv.${monster.level}</b><small>HP ${monster.currentHp??stats.hp}/${stats.hp}・MP ${monster.currentMp??maxMp(monster)}/${maxMp(monster)}</small></button>`}).join("");
 closeInventoryContext();app.insertAdjacentHTML("beforeend",Modal("使用対象を選択",`<div class="inventory-use-targets">${rows}</div>`,"やめる"));
 const modal=topModal();modal.querySelectorAll("[data-inventory-use-target]").forEach(button=>button.onclick=()=>{
  const target=save.state.monsters.find(monster=>monster.id===button.dataset.inventoryUseTarget);if(!target)return;
  if(type==="reviveLeaves"){const maximum=calculatedStats(target).hp;target.currentHp=Math.max(1,Math.floor(maximum*.2));save.state.inventory.reviveLeaves--;save.save();modal.remove();showToast(`${displayName(target)}が立ち上がった`);render();return}
  useFieldItem(type,target.id);
 });
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function bindInventory(){
 document.getElementById("backInventory")?.addEventListener("click",()=>{const target=inventoryNavigationOrigin;inventoryNavigationOrigin="home";returnFromMenu(target)});
 document.querySelectorAll("[data-inventory-category]").forEach(button=>button.addEventListener("click",()=>{inventoryCategory=button.dataset.inventoryCategory;render()}));
 document.getElementById("inventorySort")?.addEventListener("change",event=>{inventorySort=event.target.value;render()});
 document.querySelectorAll("[data-inventory-equipment]").forEach(button=>button.addEventListener("click",event=>{
  event.stopPropagation();
  const item=save.state.equipment.find(entry=>entry.id===button.dataset.inventoryEquipment);if(!item)return;
  const popover=openInventoryContext(button,inventoryEquipmentContext(item));
  popover.querySelector("[data-context-equip]")?.addEventListener("click",()=>openInventoryEquipPicker(item));
  popover.querySelector("[data-context-enhance]")?.addEventListener("click",()=>{closeInventoryContext();openEquipmentEnhancement(item.id)});
  popover.querySelector("[data-context-affix]")?.addEventListener("click",()=>{closeInventoryContext();openEquipmentAffixCrafting(item.id)});
  popover.querySelector("[data-context-lock]")?.addEventListener("click",()=>{item.locked=!item.locked;save.save();closeInventoryContext();render()});
  popover.querySelector("[data-context-sell]")?.addEventListener("click",()=>{closeInventoryContext();sellItem(item.id)});
 }));
 document.querySelectorAll("[data-inventory-stack]").forEach(button=>button.addEventListener("click",event=>{
  event.stopPropagation();const id=button.dataset.inventoryStack,popover=openInventoryContext(button,inventoryStackContext(id));
  popover.querySelector("[data-context-use]")?.addEventListener("click",()=>openInventoryUseTarget(id));
  popover.querySelector("[data-context-stack-sell]")?.addEventListener("click",()=>{const price=INVENTORY_SELL_PRICE[id]??0;if(!price||(save.state.inventory[id]??0)<=0)return;save.state.inventory[id]--;save.state.player.gold+=price;save.save();closeInventoryContext();showToast(`${price}Gで売却`);render()});
 }));
}


function selectableEquipment(){return save.state.equipment.filter(i=>!i.equippedBy&&!i.favorite&&!i.locked&&!i.ruleOverrides?.unsellable)}
function selectEquipmentPreset(mode){const slot=save.state.settings.equipmentSlot??"weapon",pool=selectableEquipment().filter(i=>i.slot===slot);if(mode==="none")equipmentManage.selected.clear();else{const counts={};pool.forEach(i=>counts[i.name]=(counts[i.name]??0)+1);pool.filter(i=>mode==="all"||mode==="plus0"&&(i.plus??0)===0||mode==="duplicate"&&counts[i.name]>1||["N","R"].includes(mode)&&i.rarity===mode).forEach(i=>equipmentManage.selected.add(i.id))}render()}
function sellSelectedEquipment(){const targets=selectableEquipment().filter(i=>equipmentManage.selected.has(i.id));if(!targets.length)return alert("売却できる装備が選択されていません");const total=targets.reduce((n,i)=>n+equipmentSellPrice(i,save.state),0);if(!confirm(`${targets.length}個を売却して ${total}G獲得します。`))return;const ids=new Set(targets.map(i=>i.id));save.state.equipment=save.state.equipment.filter(i=>!ids.has(i.id));save.state.player.gold+=total;equipmentManage.selected.clear();save.save();render()}
function lockSelectedEquipment(){const targets=save.state.equipment.filter(i=>equipmentManage.selected.has(i.id)&&!i.equippedBy&&!i.favorite);if(!targets.length)return alert("ロックできる装備が選択されていません");targets.forEach(i=>i.locked=true);equipmentManage.selected.clear();save.save();render()}
function captureVitalSnapshot(monster,beforeStats=calculatedStats(monster),beforeMp=maxMp(monster)){
 return{hp:monster.currentHp??beforeStats.hp,mp:monster.currentMp??beforeMp,hpMax:Math.max(1,beforeStats.hp),mpMax:Math.max(1,beforeMp)};
}
function restoreVitalSnapshot(monster,snapshot){
 const afterStats=calculatedStats(monster),afterMp=maxMp(monster);
 if(snapshot.hp<=0)monster.currentHp=0;
 else monster.currentHp=Math.max(1,Math.min(afterStats.hp,Math.round(snapshot.hp/snapshot.hpMax*afterStats.hp)));
 if(snapshot.mp<=0)monster.currentMp=0;
 else monster.currentMp=Math.max(0,Math.min(afterMp,Math.round(snapshot.mp/snapshot.mpMax*afterMp)));
}
function preserveVitals(monster,beforeStats,beforeMp){
 const snapshot=captureVitalSnapshot(monster,beforeStats,beforeMp);
 normalizeEquipmentState();
 restoreVitalSnapshot(monster,snapshot);
}
function togglePartyMember(id){
 const has=save.state.party.includes(id),m=save.state.monsters.find(x=>x.id===id);
 if(has&&save.state.party.length<=1)return alert("最低1体必要");
 if(!has&&save.state.party.length>=4)return alert("編成は4体まで");
 if(has){
  const beforeStats=m?calculatedStats(m):null,beforeMp=m?maxMp(m):1;
  Object.values(m?.equipment??{}).forEach(itemId=>{const item=save.state.equipment.find(i=>i.id===itemId);if(item)item.equippedBy=null});
  if(m){m.equipment=emptyEquipmentLoadout();preserveVitals(m,beforeStats,beforeMp)}
  save.state.party=save.state.party.filter(x=>x!==id)
 }else save.state.party.push(id);
 delete save.state.player.homePartySlots;
 save.save()
}
function formationPickerBody(replacingId=null){
 const value=monster=>{if(formationPickerState.sort==="rarity")return rarityValue(monsterVisibleRarity(monster));if(formationPickerState.sort==="level")return monster.level??1;if(formationPickerState.sort==="affection")return monster.affection??0;if(formationPickerState.sort==="experience")return totalExperience(monster);if(formationPickerState.sort==="obtained")return Date.parse(monster.obtainedAt??monster.capturedAt??0)||0;if(formationPickerState.sort==="name")return displayName(monster);return monsterCombatPower(monster)};
 const reserve=save.state.monsters.filter(monster=>!save.state.party.includes(monster.id)).sort((a,b)=>{const av=value(a),bv=value(b),comparison=typeof av==="string"?av.localeCompare(bv,"ja"):av-bv;return(formationPickerState.direction==="asc"?comparison:-comparison)||String(a.id).localeCompare(String(b.id))});
 const rows=reserve.map(monster=>{const species=SPECIES[monster.speciesId]??{},stats=calculatedStats(monster),power=monsterCombatPower(monster),searchText=escapeAttribute(`${displayName(monster)} ${species.name??""} ${species.race??""}`.toLowerCase());return`<button class="formation-picker-row" data-formation-pick="${monster.id}" data-search="${searchText}"><span>${monsterVisual(monster,species.emoji??"👹",{className:"formation-picker-monster-visual"})}</span><div><b>${displayName(monster)}</b><small>${monsterVisibleRarity(monster)}・${elementLabel(species.element)}・Lv.${monster.level}・★${monster.stars??1}・+${monster.plus??0}</small><em>累計EXP ${totalExperience(monster).toLocaleString()} / HP ${stats.hp} / ATK ${stats.atk} / DEF ${stats.def} / SPD ${stats.spd}</em></div><strong><b>戦力 ${formatCombatPower(power)}</b><small>${replacingId?"交代":"編成"}</small></strong></button>`}).join("");
 return`<div class="formation-picker">
  <input id="formationPickerSearch" value="${escapeAttribute(formationPickerState.search)}" placeholder="名前・種族で検索">
  <div class="formation-picker-sort"><select id="formationPickerSort">
   <option value="power" ${formationPickerState.sort==="power"?"selected":""}>戦闘力順</option><option value="rarity" ${formationPickerState.sort==="rarity"?"selected":""}>レア度順</option><option value="level" ${formationPickerState.sort==="level"?"selected":""}>レベル順</option>
   <option value="affection" ${formationPickerState.sort==="affection"?"selected":""}>なつき度順</option><option value="experience" ${formationPickerState.sort==="experience"?"selected":""}>累計EXP順</option><option value="obtained" ${formationPickerState.sort==="obtained"?"selected":""}>入手順</option><option value="name" ${formationPickerState.sort==="name"?"selected":""}>名前順</option>
  </select><button type="button" id="formationPickerDirection">${formationPickerState.direction==="desc"?"降順 ↓":"昇順 ↑"}</button></div>
  <div class="formation-picker-list">${rows||'<div class="empty">控えモンスターがいません</div>'}</div>
 </div>`;
}
function replacePartyMember(outgoingId,incomingId,inherit=false){
 const index=save.state.party.indexOf(outgoingId),outgoing=save.state.monsters.find(monster=>monster.id===outgoingId),incoming=save.state.monsters.find(monster=>monster.id===incomingId);
 if(index<0||!outgoing||!incoming||save.state.party.includes(incomingId))return false;
 const outgoingVital=captureVitalSnapshot(outgoing),incomingVital=captureVitalSnapshot(incoming);
 const outgoingTotal=totalExperience(outgoing),incomingTotal=totalExperience(incoming);
 const inheritedLoadout={...emptyEquipmentLoadout(),...(outgoing.equipment??{})};
 for(const item of save.state.equipment)if(item.equippedBy===outgoing.id||item.equippedBy===incoming.id)item.equippedBy=null;
 outgoing.equipment=emptyEquipmentLoadout();
 incoming.equipment=emptyEquipmentLoadout();
 save.state.party[index]=incoming.id;
 if(Array.isArray(save.state.player.homePartySlots)){
  save.state.player.homePartySlots=save.state.player.homePartySlots.map(id=>id===outgoing.id?incoming.id:id);
 }
 if(inherit){
  applyTotalExperience(incoming,outgoingTotal);
  applyTotalExperience(outgoing,incomingTotal);
  incoming.equipment=inheritedLoadout;
  Object.values(inheritedLoadout).filter(Boolean).forEach(itemId=>{const item=save.state.equipment.find(entry=>entry.id===itemId);if(item)item.equippedBy=incoming.id});
 }
 normalizeEquipmentState();
 if(inherit){
  restoreVitalSnapshot(incoming,outgoingVital);
  restoreVitalSnapshot(outgoing,incomingVital);
 }else{
  restoreVitalSnapshot(incoming,incomingVital);
  restoreVitalSnapshot(outgoing,outgoingVital);
 }
 save.save();
 return true;
}
function confirmFormationReplacement(outgoingId,incomingId){
 const outgoing=save.state.monsters.find(monster=>monster.id===outgoingId),incoming=save.state.monsters.find(monster=>monster.id===incomingId);
 if(!outgoing||!incoming)return;
 const outgoingSpecies=SPECIES[outgoing.speciesId]??{},incomingSpecies=SPECIES[incoming.speciesId]??{};
 const outgoingTotal=totalExperience(outgoing),incomingTotal=totalExperience(incoming),projection={...incoming};
 applyTotalExperience(projection,outgoingTotal);
 const gearCount=Object.values(outgoing.equipment??{}).filter(Boolean).length;
 app.insertAdjacentHTML("beforeend",Modal("部隊メンバーを交代",`<div class="formation-transfer">
  <div class="formation-transfer-route"><span>${monsterVisual(outgoing,outgoingSpecies.emoji??"👹",{className:"formation-transfer-monster-visual"})}<b>${displayName(outgoing)}</b><small>Lv.${outgoing.level}</small></span><i>→</i><span>${monsterVisual(incoming,incomingSpecies.emoji??"👹",{className:"formation-transfer-monster-visual"})}<b>${displayName(incoming)}</b><small>現在 Lv.${incoming.level}</small></span></div>
  <section><b>累計EXPを交換</b><p>${outgoingTotal.toLocaleString()} EXPを${displayName(incoming)}の成長曲線で再計算し、<strong>Lv.${projection.level}</strong>になります。</p><small>${incomingSpecies.growthLabel??"種族固有"}成長・レベル値の直接コピーではありません。控え側の ${incomingTotal.toLocaleString()} EXPは交代元へ移るため、EXPの複製・消失はありません。</small></section>
  <section><b>装備を引き継ぐ</b><p>${gearCount?`${gearCount}個の装備をそのまま移動します。`:"引き継ぐ装備はありません。"}</p><small>才能★・限界突破＋・なつき度・個別スキルは各個体のままです。</small></section>
  <button type="button" class="formation-plain-replace" data-formation-plain-replace>引き継がず、そのまま交代</button>
 </div>`,"EXP・装備を引き継いで交代"));
 const modal=topModal(),finish=inherit=>{
  if(!replacePartyMember(outgoingId,incomingId,inherit))return showToast("交代できませんでした");
  modal.remove();render();showToast(inherit?"累計EXPと装備を引き継ぎました":"メンバーを交代しました");
 };
 modal.querySelector("[data-modal-primary]").onclick=()=>finish(true);
 modal.querySelector("[data-formation-plain-replace]").onclick=()=>finish(false);
}
function openFormationPicker(replacingId=null){
 if(!replacingId&&save.state.party.length>=4)return showToast("編成は4体まで");
 app.insertAdjacentHTML("beforeend",Modal(replacingId?"交代するモンスターを選択":"＋ モンスターを編成",formationPickerBody(replacingId),"閉じる"));
 const modal=topModal();bindFormationPickerModal(modal,replacingId);
}
function bindFormationPickerModal(modal,replacingId=null){
 const input=modal.querySelector("#formationPickerSearch"),applySearch=()=>{const query=formationPickerState.search.trim().toLowerCase();modal.querySelectorAll("[data-formation-pick]").forEach(button=>button.hidden=Boolean(query)&&!button.dataset.search.includes(query))};
 if(input){input.addEventListener("input",()=>{formationPickerState.search=input.value;applySearch()});applySearch()}
 const sort=modal.querySelector("#formationPickerSort");if(sort)sort.onchange=()=>{formationPickerState.sort=sort.value;refreshFormationPicker(modal,replacingId)};
 modal.querySelector("#formationPickerDirection")?.addEventListener("click",()=>{formationPickerState.direction=formationPickerState.direction==="desc"?"asc":"desc";refreshFormationPicker(modal,replacingId)});
 modal.querySelectorAll("[data-formation-pick]").forEach(button=>button.onclick=()=>{
  if(replacingId){const incomingId=button.dataset.formationPick;modal.remove();confirmFormationReplacement(replacingId,incomingId);return}
  if(save.state.party.length>=4)return;
  save.state.party.push(button.dataset.formationPick);delete save.state.player.homePartySlots;save.save();modal.remove();render();showToast("パーティーに編成しました");
 });
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function refreshFormationPicker(modal,replacingId=null){
 const body=modal.querySelector(".game-modal-body");if(!body)return;
 body.innerHTML=formationPickerBody(replacingId);bindFormationPickerModal(modal,replacingId);
}
function openFormationGearMenu(itemId,ownerId,subslot){
 const item=save.state.equipment.find(entry=>entry.id===itemId),owner=save.state.monsters.find(monster=>monster.id===ownerId);
 if(!item||!owner)return showToast("装備が見つかりません");
 const multiplier=equipmentStatMultiplier(item),rarity=equipmentDisplayRarity(item);
 const stats=Object.entries(item.stats??{}).map(([key,value])=>`<span><small>${equipmentStatLabel(key)}</small><b>+${Math.round(value*multiplier)}</b></span>`).join("");
 const affixes=(item.affixes??[]).map(affix=>`<p><i style="background:${affixQuality(affix).color}"></i><span>${formatAffix(affix)}</span><small>${affixQuality(affix).name}</small></p>`).join("")||'<p class="muted">ランダムオプションなし</p>';
 app.insertAdjacentHTML("beforeend",Modal(`${equipmentSubslotLabel(subslot)}・${item.name}`,`<div class="formation-gear-detail">
  <div class="formation-gear-detail-head"><span>${item.slot==="weapon"?"⚔️":item.slot==="armor"?"🛡️":"💍"}</span><div><small>${rarity}・Lv.${item.level??1}${item.plus?`・+${item.plus}`:""}</small><h3>${item.name}</h3></div></div>
  <div class="formation-gear-stats">${stats||"<span>補正なし</span>"}</div>
  <div class="formation-gear-affixes">${affixes}</div>
  <div class="formation-gear-menu-actions"><button type="button" data-gear-detail-enhance>強化・スロットへ</button><button type="button" class="danger" data-gear-detail-remove>外す</button></div>
 </div>`,"戻る"));
 const modal=topModal();
 modal.querySelector("[data-gear-detail-enhance]").onclick=()=>{modal.remove();equipmentTarget=owner.id;equipmentFocusItemId=item.id;save.state.settings.equipmentSlot=item.slot;save.state.settings.equipmentStorage="inventory";navigationOrigin="formation";go("equipment")};
 modal.querySelector("[data-gear-detail-remove]").onclick=()=>{if(!confirm(`${item.name}を外しますか？`))return;modal.remove();unequipItem(item.id)};
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function bindFormation(){
 document.getElementById("backFormation")?.addEventListener("click",()=>{const target=formationOrigin;formationOrigin="home";returnFromMenu(target)});
 const rarityDrawer=document.querySelector("[data-formation-rarity-drawer]");
 const setRarityDrawer=open=>{
  if(!rarityDrawer)return;
  rarityDrawer.classList.toggle("open",open);
  rarityDrawer.setAttribute("aria-hidden",open?"false":"true");
 };
 document.querySelector("[data-formation-rarity-help]")?.addEventListener("click",()=>setRarityDrawer(true));
 document.querySelector("[data-formation-rarity-close]")?.addEventListener("click",()=>setRarityDrawer(false));
 document.querySelectorAll("[data-formation-add]").forEach(button=>button.onclick=()=>openFormationPicker());
 document.querySelectorAll("[data-formation-remove]").forEach(button=>button.onclick=()=>{togglePartyMember(button.dataset.formationRemove);render()});
 document.querySelectorAll("[data-formation-replace]").forEach(button=>button.onclick=()=>openFormationPicker(button.dataset.formationReplace));
 document.querySelectorAll("[data-formation-growth]").forEach(button=>button.onclick=()=>{detailNavigationOrigin="formation";selected=button.dataset.formationGrowth;go("detail")});
 document.querySelectorAll("[data-formation-equipment]").forEach(button=>button.onclick=()=>{equipmentFocusItemId=null;equipmentTarget=button.dataset.formationEquipment;navigationOrigin="formation";go("equipment")});
 document.querySelectorAll("[data-formation-skills]").forEach(button=>button.onclick=()=>{skillTarget=button.dataset.formationSkills;skillSlotSelection=0;skillNavigationOrigin="formation";go("skills")});
 document.querySelectorAll("[data-formation-gear-add]").forEach(button=>button.onclick=()=>{const subslot=button.dataset.formationSubslot;equipmentTarget=button.dataset.formationGearAdd;equipmentFocusItemId=null;save.state.settings.equipmentSlot=subslot.startsWith("weapon")?"weapon":subslot.startsWith("armor")?"armor":"accessory";save.state.settings.equipmentStorage="inventory";navigationOrigin="formation";go("equipment")});
 document.querySelectorAll("[data-formation-gear-open]").forEach(button=>button.onclick=()=>openFormationGearMenu(button.dataset.formationGearOpen,button.dataset.owner,button.dataset.formationSubslot));
 document.querySelectorAll("[data-formation-skill]").forEach(button=>button.onclick=()=>{skillTarget=button.dataset.formationSkill;skillSlotSelection=Number(button.dataset.skillSlot)||0;skillNavigationOrigin="formation";go("skills")});
 document.querySelectorAll("[data-formation-member-drag]").forEach(handle=>handle.addEventListener("pointerdown",event=>{
  if(event.button!=null&&event.button!==0)return;
  const memberId=handle.dataset.formationMemberDrag,sourceCard=handle.closest("[data-formation-index]");
  if(!memberId||!sourceCard)return;
  const start={x:event.clientX,y:event.clientY};
  let active=false,ghost=null,lastTarget=null,timer=setTimeout(()=>{
   active=true;
   handle.dataset.formationDragged="1";
   sourceCard.classList.add("formation-dragging");
   ghost=sourceCard.cloneNode(true);
   ghost.classList.add("formation-member-ghost");
   ghost.removeAttribute("data-formation-member");
   document.body.appendChild(ghost);
   ghost.style.left=`${start.x}px`;
   ghost.style.top=`${start.y}px`;
   navigator.vibrate?.(18);
  },360);
  const targetAt=(x,y)=>document.elementFromPoint(x,y)?.closest?.("[data-formation-index]");
  const move=moveEvent=>{
   if(!active&&Math.hypot(moveEvent.clientX-start.x,moveEvent.clientY-start.y)>11){clearTimeout(timer);timer=null;return}
   if(!active||!ghost)return;
   moveEvent.preventDefault();
   ghost.style.left=`${moveEvent.clientX}px`;
   ghost.style.top=`${moveEvent.clientY}px`;
   const target=targetAt(moveEvent.clientX,moveEvent.clientY);
   if(lastTarget!==target){lastTarget?.classList.remove("formation-drop-ready");target?.classList.add("formation-drop-ready");lastTarget=target}
  };
  const finish=upEvent=>{
   if(timer)clearTimeout(timer);
   document.removeEventListener("pointermove",move,true);
   document.removeEventListener("pointerup",finish,true);
   document.removeEventListener("pointercancel",finish,true);
   sourceCard.classList.remove("formation-dragging");
   lastTarget?.classList.remove("formation-drop-ready");
   ghost?.remove();
   if(!active)return;
   const target=targetAt(upEvent.clientX,upEvent.clientY),toIndex=Number(target?.dataset.formationIndex),fromIndex=save.state.party.indexOf(memberId);
   if(Number.isInteger(toIndex)&&fromIndex>=0&&toIndex!==fromIndex){
    const party=[...save.state.party],removed=party.splice(fromIndex,1)[0];
    party.splice(Math.max(0,Math.min(toIndex,party.length)),0,removed);
    save.state.party=party.slice(0,4);
    delete save.state.player.homePartySlots;
    save.save();
    render();
   }
  };
  document.addEventListener("pointermove",move,{capture:true,passive:false});
  document.addEventListener("pointerup",finish,true);
  document.addEventListener("pointercancel",finish,true);
 }));
}
function rarityValue(rarity){return ({N:1,R:2,SR:3,SSR:4,UR:5,LR:6,"神話":7,"深淵":8,"十神":9}[rarity]??0)}
function elementLabel(element){return ({all:"全属性",neutral:"無",fire:"火",water:"水",ice:"氷",wind:"風",earth:"土",lightning:"雷",thunder:"雷",light:"光",dark:"闇",poison:"毒",nature:"自然"}[element]??element)}
function monsterVisibleRarity(monster){return monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N"}
function partyEditorMonsters(){
 const q=partyEditorState.search.trim().toLowerCase();
 const list=save.state.monsters.filter(m=>{
  const sp=SPECIES[m.speciesId];
  if(q&&!`${displayName(m)} ${sp.name}`.toLowerCase().includes(q))return false;
  if(partyEditorState.element!=="all"&&sp.element!==partyEditorState.element)return false;
  const active=save.state.party.includes(m.id);
  if(partyEditorState.status==="active"&&!active)return false;
  if(partyEditorState.status==="reserve"&&active)return false;
  if(partyEditorState.status==="favorite"&&!m.favorite)return false;
  return true;
 });
 const get=m=>{const st=calculatedStats(m),sp=SPECIES[m.speciesId];switch(partyEditorState.sort){case"level":return m.level;case"stars":return m.stars??0;case"plus":return m.plus??0;case"affection":return m.affection??0;case"hp":return st.hp;case"atk":return st.atk;case"def":return st.def;case"spd":return st.spd;case"name":return displayName(m);case"obtained":return m.createdAt??m.id;default:return rarityValue(m.summonTier??m.summonRarity??sp.rarity)}};
 return list.sort((a,b)=>{const av=get(a),bv=get(b),cmp=typeof av==="string"?String(av).localeCompare(String(bv),"ja"):av-bv;return partyEditorState.direction==="asc"?cmp:-cmp});
}
function partyEditorBody(mode="home"){
 const current=save.state.party.map((id,i)=>{const m=save.state.monsters.find(x=>x.id===id);return m?`<button data-party-slot="${m.id}"><span>${i+1}</span><b>${monsterVisual(m,SPECIES[m.speciesId].emoji)} ${displayName(m)}</b><small>Lv.${m.level}</small></button>`:`<button disabled><span>${i+1}</span><b>空き</b></button>`}).join("");
 const elements=["all","neutral","fire","water","wind","earth","lightning","light","dark","poison","nature"];
 const rows=partyEditorMonsters().map(m=>{const sp=SPECIES[m.speciesId],st=calculatedStats(m),active=save.state.party.includes(m.id),rarity=monsterVisibleRarity(m);return`<article class="party-compare-card ${active?"selected":""}"><button class="party-card-main" data-home-party-toggle="${m.id}"><span class="party-monster-icon">${monsterVisual(m,sp.emoji)}</span><div><div class="party-card-title"><b>${displayName(m)}</b></div><small>${rarity} / ${elementLabel(sp.element)} / Lv.${m.level} / +${m.plus??0}</small><small>才能 ${"★".repeat(m.stars??1)}　なつき ${m.affection??0}</small><div class="party-stat-line"><span>HP ${st.hp}</span><span>ATK ${st.atk}</span><span>DEF ${st.def}</span><span>SPD ${st.spd}</span></div></div></button><button class="party-detail-button" data-party-detail="${m.id}">詳細</button></article>`}).join("")||'<div class="empty">条件に合うモンスターがいません</div>';
 const intro=mode==="field"?"その場で1〜4体を選択できます。捕獲直後の仲間もすぐ使用可能です。":"情報を比較しながら1〜4体を選択できます。";
 return`<p class="muted">${intro}</p><div class="party-current-slots">${current}</div><div class="party-tools"><input id="partySearch" value="${partyEditorState.search}" placeholder="名前で検索"><div class="party-filter-scroll">${elements.map(e=>`<button data-party-element="${e}" class="${partyEditorState.element===e?"active":""}">${elementLabel(e)}</button>`).join("")}</div><div class="party-tool-row"><select id="partyStatus"><option value="all">全員</option><option value="active">出撃中</option><option value="reserve">控え</option><option value="favorite">お気に入り</option></select><select id="partySort"><option value="rarity">レア度</option><option value="level">レベル</option><option value="stars">才能</option><option value="plus">+強化</option><option value="affection">なつき度</option><option value="hp">HP</option><option value="atk">ATK</option><option value="def">DEF</option><option value="spd">SPD</option><option value="obtained">入手順</option><option value="name">名前順</option></select><button id="partyDirection">${partyEditorState.direction==="desc"?"降順 ↓":"昇順 ↑"}</button></div></div><div class="party-compare-list">${rows}</div>`;
}
function bindPartyEditor(modal){
 const search=modal.querySelector("#partySearch");search?.addEventListener("input",e=>{partyEditorState.search=e.target.value;refreshPartyEditor(modal)});
 const status=modal.querySelector("#partyStatus");if(status){status.value=partyEditorState.status;status.onchange=e=>{partyEditorState.status=e.target.value;refreshPartyEditor(modal)}}
 const sort=modal.querySelector("#partySort");if(sort){sort.value=partyEditorState.sort;sort.onchange=e=>{partyEditorState.sort=e.target.value;refreshPartyEditor(modal)}}
 modal.querySelector("#partyDirection")?.addEventListener("click",()=>{partyEditorState.direction=partyEditorState.direction==="desc"?"asc":"desc";refreshPartyEditor(modal)});
 modal.querySelectorAll("[data-party-element]").forEach(b=>b.onclick=()=>{partyEditorState.element=b.dataset.partyElement;refreshPartyEditor(modal)});
 modal.querySelectorAll("[data-home-party-toggle]").forEach(b=>b.onclick=()=>{togglePartyMember(b.dataset.homePartyToggle);refreshPartyEditor(modal)});
 modal.querySelectorAll("[data-party-slot]").forEach(b=>b.onclick=()=>{togglePartyMember(b.dataset.partySlot);refreshPartyEditor(modal)});
 modal.querySelectorAll("[data-party-detail]").forEach(b=>b.onclick=()=>openPartyMonsterDetail(b.dataset.partyDetail));
}
function refreshPartyEditor(modal){const body=modal.querySelector(".game-modal-body");if(!body)return;body.innerHTML=partyEditorBody(modal.dataset.partyEditorMode??"home");bindPartyEditor(modal)}
function formatObtainedDate(value){try{return new Date(value).toLocaleDateString("ja-JP")}catch{return"不明"}}
function limitBreakCandidates(m){return save.state.monsters.filter(x=>x.id!==m.id&&x.speciesId===m.speciesId&&!save.state.party.includes(x.id)&&!x.favorite&&!x.locked)}
function performLimitBreak(id,options={}){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const materials=limitBreakCandidates(m);if(materials.length<2)return alert("限界突破には、控えにいる同名モンスターが2体必要です。\nお気に入り・ロック・出撃中の個体は素材にできません。");const growth=limitBreakGrowth(m.speciesId),before=m.plus??0;if(!confirm(`${displayName(m)}を +${before+1}へ限界突破する？\n\n素材：同名モンスター2体\nLv1基礎補正：HP+${growth.hp} / ATK+${growth.atk} / DEF+${growth.def} / SPD+${growth.spd}`))return;const ids=new Set(materials.slice(0,2).map(x=>x.id));save.state.monsters=save.state.monsters.filter(x=>!ids.has(x.id));m.plus=before+1;save.save();document.querySelectorAll(".game-modal").forEach(x=>x.remove());app.insertAdjacentHTML("beforeend",Modal("✨ LIMIT BREAK ✨",`<div class="limit-break-result"><span>${monsterVisual(m,SPECIES[m.speciesId]?.emoji??"👹",{className:"limit-break-monster-visual"})}</span><h2>${displayName(m)}</h2><div><b>+${before}</b><i>→</i><strong>+${m.plus}</strong></div><p>Lv.1基礎値<br>HP +${growth.hp} / ATK +${growth.atk} / DEF +${growth.def} / SPD +${growth.spd}</p></div>`,"育成画面へ"));topModalButton().onclick=()=>{closeTopModal();if(options.returnToDetail){selected=id;screen="detail";render()}else openPartyMonsterDetail(id)}}
function openPartyMonsterDetail(id){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const sp=SPECIES[m.speciesId],st=calculatedStats(m),growth=limitBreakGrowth(m.speciesId),aff=m.affection??0,h=m.history??{},materials=limitBreakCandidates(m).length,friend=aff>=1000?" ❤️ 親友":"";app.insertAdjacentHTML("beforeend",Modal(displayName(m),`<div class="codex-detail monster-growth-detail"><div class="modal-monster-hero">${monsterVisual(m,sp.emoji??"👹",{className:"modal-monster-visual"})}<p><b>${monsterVisibleRarity(m)} / ${elementLabel(sp.element)} / ${sp.role??"不明"}</b></p></div><div class="detail-stat-grid"><span>Lv.${m.level}</span><span>才能 ${"★".repeat(m.stars??1)}${"☆".repeat(5-(m.stars??1))}</span><span>限界突破 +${m.plus??0}</span><span>なつき ${aff}/1000${friend}</span><span>HP ${st.hp}</span><span>ATK ${st.atk}</span><span>DEF ${st.def}</span><span>SPD ${st.spd}</span></div><section class="growth-panel"><b>＋限界突破</b><p>同名2体で＋1・上限なし。Lv1基礎値へ毎回 HP+${growth.hp} / ATK+${growth.atk} / DEF+${growth.def} / SPD+${growth.spd}</p><button id="limitBreakButton" ${materials<2?"disabled":""}>＋${(m.plus??0)+1}へ限界突破（素材 ${materials}/2）</button></section><section class="growth-panel"><b>❤️ なつき度ボーナス</b><p>${aff>=1000?"全段階解放・親友":`現在 ${aff}/1000　次のボーナスまで ${Math.ceil((aff+1)/100)*100-aff}`}</p></section><div class="party-detail-quick-actions"><button id="openGrowthFromPartyDetail">💪 育成画面へ</button><button id="openEquipmentFromPartyDetail">⚔️ 装備を変更</button></div><section class="growth-panel history-panel"><b>📖 このモンスターの歴史</b><p>初獲得：${formatObtainedDate(m.obtainedAt??m.capturedAt)} / ${m.obtainedFloor??1}F / ${m.obtainedMethod==="summon"?"召喚":"捕獲"}<br>冒険 ${h.adventures??0}回 / 戦闘 ${h.battles??0}回 / 勝利 ${h.victories??0}回<br>撃破 ${h.kills??0}体 / ボス撃破 ${h.bossDefeats??0}体 / 最高到達 ${h.highestFloor??m.obtainedFloor??1}F</p></section><p class="muted">種族 ${sp.race??"不明"}<br>特性 ${TRAITS[m.traitId]?.name??"なし"}</p></div>`,"戻る"));const modal=topModal();modal.querySelector("#limitBreakButton")?.addEventListener("click",()=>performLimitBreak(id));modal.querySelector("#openGrowthFromPartyDetail")?.addEventListener("click",()=>{document.querySelectorAll(".game-modal").forEach(x=>x.remove());selected=id;screen="detail";render()});modal.querySelector("#openEquipmentFromPartyDetail")?.addEventListener("click",()=>{document.querySelectorAll(".game-modal").forEach(x=>x.remove());equipmentTarget=id;navigationOrigin="monsters";screen="equipment";render()});topModalButton().onclick=closeTopModal}
function openHomePartyEditor(){app.insertAdjacentHTML("beforeend",Modal("パーティー編成",partyEditorBody("home"),"確定"));const modal=topModal();modal.dataset.partyEditorMode="home";bindPartyEditor(modal);modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();render()}}

function equipItem(itemId,monsterId,subslot){
 const item=save.state.equipment.find(i=>i.id===itemId),monster=save.state.monsters.find(m=>m.id===monsterId);
 if(!item||!monster||!subslot)return;
 if(!save.state.party.includes(monsterId))return alert("控えモンスターには装備できません。");
 const affected=save.state.monsters.filter(owner=>owner.id===monsterId||Object.values(owner.equipment??{}).includes(itemId));
 const snapshots=new Map(affected.map(owner=>[owner.id,captureVitalSnapshot(owner)]));
 const result=assignEquipmentToSubslot(save.state,itemId,monsterId,subslot);
 if(!result.ok)return alert(result.message);
 normalizeEquipmentState();
 affected.forEach(owner=>restoreVitalSnapshot(owner,snapshots.get(owner.id)));
 save.save();render();
}
function autoEquipMonster(monsterId){
 const monster=save.state.monsters.find(m=>m.id===monsterId);if(!monster||!save.state.party.includes(monsterId))return;
 const snapshot=captureVitalSnapshot(monster),pairs=[["weaponRight","weapon"],["armorBody","armor"],["accessoryNeck","accessory"],["armorSupport","armor"],["accessoryFinger","accessory"],["weaponLeft","weapon"]];
 for(const[subslot,slot]of pairs){
  const right=save.state.equipment.find(item=>item.id===monster.equipment?.weaponRight);
  if(subslot==="weaponLeft"&&right?.handedness==="twoHanded")continue;
  const candidates=save.state.equipment.filter(item=>item.slot===slot&&canEquipInSubslot(item,monster,subslot)&&(!item.equippedBy||item.equippedBy===monsterId)&&!Object.values(monster.equipment??{}).includes(item.id)).sort((a,b)=>equipmentPower(b)-equipmentPower(a));
  const best=candidates[0];if(!best)continue;
  const current=save.state.equipment.find(item=>item.id===monster.equipment?.[subslot]);
  if(current&&equipmentPower(current)>=equipmentPower(best))continue;
  assignEquipmentToSubslot(save.state,best.id,monsterId,subslot);
 }
 normalizeEquipmentState();restoreVitalSnapshot(monster,snapshot);
}
function unequipItem(itemId){const item=save.state.equipment.find(i=>i.id===itemId);if(!item?.equippedBy)return;const monster=save.state.monsters.find(m=>m.id===item.equippedBy);if(!monster){item.equippedBy=null;save.save();return render()}const beforeStats=calculatedStats(monster),beforeMp=maxMp(monster);for(const key of Object.keys(monster.equipment??{}))if(monster.equipment[key]===item.id)monster.equipment[key]=null;item.equippedBy=null;preserveVitals(monster,beforeStats,beforeMp);save.save();render()}
function unequipMonsterAll(monsterId,confirmFirst=true){const monster=save.state.monsters.find(m=>m.id===monsterId);if(!monster)return;const ids=Object.values(monster.equipment??{}).filter(Boolean);if(!ids.length){if(confirmFirst)alert("解除する装備がありません");return}if(confirmFirst&&!confirm(`${displayName(monster)}の装備をすべて解除しますか？`))return;const beforeStats=calculatedStats(monster),beforeMp=maxMp(monster);ids.forEach(id=>{const item=save.state.equipment.find(i=>i.id===id);if(item)item.equippedBy=null});monster.equipment=emptyEquipmentLoadout();preserveVitals(monster,beforeStats,beforeMp);save.save();if(confirmFirst)render()}

function sellItem(itemId){
 const item=save.state.equipment.find(i=>i.id===itemId);
 if(!item||item.equippedBy||item.locked||item.ruleOverrides?.unsellable)return alert(item?.ruleOverrides?.unsellable?"この装備は売却できない":item?.locked?"ロック中は売却できない":"装備中は売却できない");
 const price=equipmentSellPrice(item,save.state);
 if(!confirm(`${item.name}を${price}Gで売却する？`))return;
 save.state.equipment=save.state.equipment.filter(i=>i.id!==itemId);save.state.player.gold+=price;save.save();render();
}

function localDayKey(){return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date())}
function ownedRecoveryBreakdown(){return save.state.monsters.reduce((result,monster)=>{const stats=calculatedStats(monster),mpMax=maxMp(monster);result.hp+=Math.max(0,stats.hp-(monster.currentHp??stats.hp));result.mp+=Math.max(0,mpMax-(monster.currentMp??mpMax));result.ailments+=normalizePersistentAilments([monster.ailments,monster.statuses,monster.status]).length;result.total=result.hp+result.mp;return result},{hp:0,mp:0,ailments:0,total:0})}
function healOwnedMonsters(){save.state.monsters.forEach(monster=>{monster.currentHp=calculatedStats(monster).hp;monster.currentMp=maxMp(monster);clearAilments(monster)})}
function ensureGold(cost,onReady){const gold=save.state.player.gold??0;if(gold>=cost){onReady();return}const shortage=cost-gold,crystals=Math.ceil(shortage/1000);if((save.state.player.crystals??0)<crystals){alert(`GOLDが不足しています。\n不足：${shortage.toLocaleString()}G\n必要な魔晶石：${crystals}個（所持 ${save.state.player.crystals??0}個）`);return}if(!confirm(`GOLDが不足しています。\n\n魔晶石をGOLDへ変換しますか？\n${crystals}💎 → ${(crystals*1000).toLocaleString()}G\n（1💎 = 1000G）`))return;save.state.player.crystals-=crystals;save.state.player.gold+=crystals*1000;save.save();onReady()}
function openRest(){
 const key=localDayKey(),free=save.state.rest.lastFreeKey!==key,recovery=ownedRecoveryBreakdown(),cost=recovery.total;
 if(recovery.total<=0&&recovery.ailments<=0){app.insertAdjacentHTML("beforeend",Modal("安息の寝台",`<div class="rest-sanctuary-v3 is-full"><div class="rest-bed-stage-v3"><i></i><img src="assets/ui/items/bed.png" alt="宿屋の寝台"></div><small>REST COMPLETE</small><h3>所持仲間は全員万全です</h3><p>HP・MPは満タンで、状態異常もありません。</p></div>`,"閉じる"));const ready=topModal();ready.classList.add("rest-modal-v3");ready.querySelector("[data-modal-primary]").onclick=closeTopModal;return}
 app.insertAdjacentHTML("beforeend",Modal("深淵の休息",`<div class="rest-sanctuary-v3"><div class="rest-bed-stage-v3"><i></i><img src="assets/ui/items/bed.png" alt="宿屋の寝台"></div><small>ABYSS SANCTUARY</small><h3>旅の傷を癒やす</h3><p>所持仲間全員のHP・MP・状態異常を完全回復します。</p><div class="rest-breakdown-v3"><article><small>HP RECOVERY</small><b>${recovery.hp.toLocaleString()}</b><i style="--rest-fill:${recovery.hp?100:0}%"></i></article><article><small>MP RECOVERY</small><b>${recovery.mp.toLocaleString()}</b><i style="--rest-fill:${recovery.mp?100:0}%"></i></article><article><small>CONDITION</small><b>${recovery.ailments?`${recovery.ailments}件解除`:"異常なし"}</b></article></div><div class="rest-price-v3 ${free?"is-free":""}"><small>${free?"DAILY BLESSING":"RECOVERY COST"}</small><b>${free?"本日1回 無料":`${cost.toLocaleString()}G`}</b><span>HP ${recovery.hp.toLocaleString()} ＋ MP ${recovery.mp.toLocaleString()} ＝ ${cost.toLocaleString()}G</span><em>所持 ${save.state.player.gold.toLocaleString()}G</em></div></div>`,free?"無料の安息を受ける":`${cost.toLocaleString()}Gで休む`));
 const modal=topModal();modal.classList.add("rest-modal-v3");
 modal.querySelector("[data-modal-primary]").onclick=()=>{
  const latest=ownedRecoveryBreakdown(),latestCost=latest.total;
  if(!free&&save.state.player.gold<latestCost){modal.remove();return ensureGold(latestCost,openRest)}
  if(!confirm(free?"本日の無料休息を使いますか？":`${latestCost.toLocaleString()}Gで休息しますか？`))return;
  if(free)save.state.rest.lastFreeKey=key;else save.state.player.gold-=latestCost;
  healOwnedMonsters();save.save();modal.remove();render();
 };
}
function rarityRoll(mode="normal"){
 const roll=Math.random();
 if(mode==="guaranteed"){
  if(roll<.002)return"神話";
  if(roll<.02)return"LR";
  if(roll<.08)return"UR";
  if(roll<.30)return"SSR";
  return"SR";
 }
 if(roll<.0002)return"神話";
 if(roll<.002)return"LR";
 if(roll<.01)return"UR";
 if(roll<.05)return"SSR";
 if(roll<.18)return"SR";
 if(roll<.50)return"R";
 return"N";
}
const SUMMON_RARITY_INFO=[
 {id:"N",name:"ノーマル",note:"基本レア度"},
 {id:"R",name:"レア",note:"通常より希少"},
 {id:"SR",name:"スーパーレア",note:"10連の最後の1枠はSR以上"},
 {id:"SSR",name:"スペシャルスーパーレア",note:"非常に希少"},
 {id:"UR",name:"ウルトラレア",note:"通常召喚でも稀に出現する上位レア度"},
 {id:"LR",name:"レジェンドレア",note:"通常召喚の最高峰クラス"},
 {id:"神話",name:"神話級",note:"通常召喚で0.02%・闇市場でも極低確率"},
 {id:"深淵",name:"深淵級",note:"1000階到達後の深淵召喚で解放"},
 {id:"十神",name:"十神",note:"ガチャ排出なし。専用イベント・高難易度限定"}
];
function rarityCssClass(rarity){return({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity??"N").toLowerCase()}
function summonOne({mode="mixed",guaranteedMonster=false,guaranteedEquipment=false,guaranteedRare=false,forcedRarity=null,deep=false}={}){
 const isMonster=guaranteedMonster||(!guaranteedEquipment&&(mode==="monster"||Math.random()<.30)),rarity=forcedRarity??(deep?"LR":rarityRoll(guaranteedRare?"guaranteed":"normal"));
 if(isMonster){
  let pool=Object.values(SPECIES).filter(species=>species.rarity!=="十神"&&!species.isTenGod&&!species.tags?.includes?.("tenGod")&&!species.isAbyss&&!species.tags?.includes?.("abyss"));
  if(deep)pool=pool.filter(species=>(species.minFloor??0)>=70&&species.rarity!=="神話");
  else pool=pool.filter(species=>species.rarity===rarity);
  if(!pool.length)pool=Object.values(SPECIES).filter(species=>species.rarity===rarity&&!species.isTenGod&&!species.isAbyss);
  if(!pool.length)pool=[SPECIES.slime];
  const speciesId=pool[Math.floor(Math.random()*pool.length)].id,isNew=!save.state.monsters.some(entry=>entry.speciesId===speciesId),stars=deep?5:({N:1,R:1,SR:2,SSR:3,UR:4,LR:5,"神話":5}[rarity]??1);
  const monster=createMonster(speciesId,{stars,nickname:SPECIES[speciesId].name,obtainedMethod:deep?"deepSummon":"summon",obtainedFloor:save.state.player.maxFloor});
  monster.summonRarity=rarity;if(deep)monster.summonTier="深淵";
  save.state.monsters.push(monster);save.state.codex.captures[speciesId]=(save.state.codex.captures[speciesId]??0)+1;save.state.codex.encounters[speciesId]=(save.state.codex.encounters[speciesId]??0)+1;
  return{type:"monster",rarity,displayRarity:deep?"深淵":rarity,name:displayName(monster),icon:SPECIES[speciesId].emoji,speciesId,item:monster,isNew};
 }
 const slot=["weapon","armor","accessory"][Math.floor(Math.random()*3)],item=createEquipment(slot,{rarity});
 if(deep){item.summonTier="深淵";item.name=`深淵・${item.name}`}
 const isNew=!(save.state.codex.equipment[item.name]??0);
 receiveEquipment(save.state,item);save.state.codex.equipment[item.name]=(save.state.codex.equipment[item.name]??0)+1;
 return{type:"equipment",rarity,displayRarity:deep?"深淵":rarity,name:item.name,icon:{weapon:"⚔️",armor:"🛡️",accessory:"💍"}[slot],item,isNew};
}
function rarityGuideHtml(){return`<div class="rarity-guide">${SUMMON_RARITY_INFO.map((r,i)=>{const key=rarityCssClass(r.id);return`<div class="rarity-guide-row rarity-guide-${key}"><span>${i+1}</span><b class="rarity-name-${key}">${r.id}</b><strong class="rarity-name-${key}">${r.name}</strong><small>${r.note}</small></div>`}).join("")}</div><p class="rarity-guide-note">下に行くほど上位です。深淵は専用召喚、十神は専用イベント・高難易度で獲得します。</p>`}
function openRarityGuide(){app.insertAdjacentHTML("beforeend",Modal("レア度一覧",rarityGuideHtml(),"閉じる"));topModalButton().onclick=closeTopModal}
function normalSummonRateGuideHtml(){
 const rates=[
  ["神話","0.02%","0.20%"],
  ["LR","0.18%","1.80%"],
  ["UR","0.80%","6.00%"],
  ["SSR","4.00%","22.00%"],
  ["SR","13.00%","70.00%"],
  ["R","32.00%","—"],
  ["N","50.00%","—"]
 ];
 return`<div class="summon-rate-guide"><div class="summon-rate-head"><span>レア度</span><b>通常枠</b><b>10連・最後の1枠</b></div>${rates.map(([rarity,normal,guaranteed])=>{const key=rarityCssClass(rarity);return`<div class="summon-rate-row rarity-${key}"><strong class="rarity-name-${key}">${rarity}</strong><span>${normal}</span><span>${guaranteed}</span></div>`}).join("")}<div class="summon-rate-notes"><p><b>単発・10連の通常枠</b>は上記「通常枠」で抽選します。</p><p><b>モンスター召喚／装備召喚</b>は選択した種類が100%排出されます。1日1回無料召喚のみ、モンスター30%・装備70%です。</p><p><b>深淵・十神</b>は通常召喚から排出されません。深淵は専用召喚、十神は専用イベント・高難易度で獲得します。</p></div></div>`;
}
function openNormalSummonRates(){app.insertAdjacentHTML("beforeend",Modal("通常召喚・提供割合",normalSummonRateGuideHtml(),"閉じる"));topModalButton().onclick=closeTopModal}
const GACHA_CAMPAIGNS=[
 {id:"standard",badge:"常設",title:"神話級との邂逅",copy:"通常枠 神話0.02%・10連最後はSR以上",tone:"violet",mode:"mixed"},
 {id:"beginner",badge:"初心者限定",title:"スタートダッシュ召喚",copy:"初回のみ10連無料・最後の1体はSR以上",tone:"green",mode:"monster"},
 {id:"ssr",badge:"期間限定",title:"SSR以上確定祭",copy:"10連ごとの最後の1枠はSSR以上確定",tone:"gold",mode:"mixed"},
 {id:"event-preview",badge:"COMING SOON",title:"イベント装備シリーズ",copy:"イベント開催時はここへ新しい召喚が追加されます",tone:"red",disabled:true,mode:"equipment"}
];
function gachaCampaignSlides(){
 const daily=save.state.gacha.lastDailyKey!==localDayKey();
 return GACHA_CAMPAIGNS.map((campaign,index)=>{
  const firstUsed=campaign.id==="beginner"&&save.state.gacha.firstTenUsed,disabled=campaign.disabled||firstUsed;
  return`<article class="gacha-campaign-slide tone-${campaign.tone}" data-gacha-campaign-slide="${index}">
   <div><small>${campaign.badge}</small><h3>${campaign.title}</h3><p>${campaign.copy}</p>
    ${campaign.id==="standard"&&daily?'<button type="button" data-gacha-daily>本日の無料召喚</button>':""}
    <button type="button" data-gacha-campaign="${campaign.id}" ${disabled?"disabled":""}>${firstUsed?"受取済み":campaign.disabled?"準備中":"ガチャページへ"}</button>
   </div><span class="gacha-campaign-sigil sigil-${campaign.id}" aria-hidden="true"></span>
  </article>`;
 }).join("");
}
function openGacha(){
 const body=`<div class="gacha-festival-v3">
  <div class="gacha-v2-wallet"><span>所持魔晶石</span><b>${pixelIcon("crystal")}${save.state.player.crystals.toLocaleString()}</b><button type="button" id="openRarityGuide" class="rarity-help" aria-label="レア度一覧">？</button></div>
  <div class="gacha-campaign-carousel" data-gacha-carousel>${gachaCampaignSlides()}</div>
  <div class="gacha-carousel-dots">${GACHA_CAMPAIGNS.map((_,index)=>`<button type="button" data-gacha-dot="${index}" class="${index===0?"active":""}" aria-label="${index+1}枚目"></button>`).join("")}</div>
  <section class="gacha-category-section"><div class="spread"><h3>召喚を選ぶ</h3><button type="button" id="gachaBannerGuide">提供割合</button></div>
   <button type="button" class="gacha-category-card monster" data-gacha-category="monster"><span class="gacha-category-art monster-art" aria-hidden="true"></span><div><small>MONSTER SUMMON</small><b>モンスター召喚</b><p>仲間だけを召喚。1連・10連・任意回数から選択。</p></div><i>›</i></button>
   <button type="button" class="gacha-category-card equipment" data-gacha-category="equipment"><span class="gacha-category-art equipment-art" aria-hidden="true"></span><div><small>EQUIPMENT SUMMON</small><b>装備召喚</b><p>武器・防具・アクセだけを召喚。</p></div><i>›</i></button>
  </section>
  <section class="gacha-event-list"><h3>イベント召喚</h3><button type="button" disabled><b>限定・装備シリーズ召喚</b><small>イベントデータ追加で自動表示できる枠です</small><em>準備中</em></button></section>
  <p class="gacha-v2-note">大量召喚は演出を1回にまとめ、結果を順番に開示します。</p>
 </div>`;
 app.insertAdjacentHTML("beforeend",Modal("召喚の祭壇",body,"閉じる"));
 const modal=topModal();modal.classList.add("gacha-modal-v2");
 const carousel=modal.querySelector("[data-gacha-carousel]"),setDot=index=>modal.querySelectorAll("[data-gacha-dot]").forEach(dot=>dot.classList.toggle("active",Number(dot.dataset.gachaDot)===index));
 modal.querySelectorAll("[data-gacha-dot]").forEach(dot=>dot.onclick=()=>{const index=Number(dot.dataset.gachaDot),slide=carousel.children[index];slide?.scrollIntoView({behavior:"smooth",inline:"start",block:"nearest"});setDot(index)});
 carousel?.addEventListener("scroll",()=>{const width=carousel.clientWidth||1;setDot(Math.max(0,Math.min(GACHA_CAMPAIGNS.length-1,Math.round(carousel.scrollLeft/width))))},{passive:true});
 modal.querySelectorAll("[data-gacha-category]").forEach(button=>button.onclick=()=>openGachaCountPicker(button.dataset.gachaCategory,"standard"));
 modal.querySelectorAll("[data-gacha-campaign]").forEach(button=>button.onclick=()=>{const campaign=button.dataset.gachaCampaign;if(campaign==="beginner")return performGachaBatch("monster",10,{campaign:"beginner",cost:0});if(campaign==="event-preview")return;openGachaCountPicker(GACHA_CAMPAIGNS.find(entry=>entry.id===campaign)?.mode??"mixed",campaign)});
 modal.querySelector("[data-gacha-daily]")?.addEventListener("click",()=>performGachaBatch("mixed",1,{campaign:"daily",cost:0}));
 modal.querySelector("#openRarityGuide")?.addEventListener("click",openRarityGuide);
 modal.querySelector("#gachaBannerGuide")?.addEventListener("click",openNormalSummonRates);
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function gachaCost(count,campaign="standard"){
 if(campaign==="beginner"||campaign==="daily")return 0;
 const unit=campaign==="ssr"?7.5:4.5;
 return count===1?(campaign==="ssr"?8:5):Math.ceil(count*unit);
}
function openGachaCountPicker(mode,campaignId="standard"){
 const campaign=GACHA_CAMPAIGNS.find(entry=>entry.id===campaignId)??GACHA_CAMPAIGNS[0],label=mode==="monster"?"モンスター召喚":mode==="equipment"?"装備召喚":campaign.title;
 const counts=[1,10,20,30,50,100];
 app.insertAdjacentHTML("beforeend",Modal(label,`<div class="gacha-count-picker">
  <div class="gacha-count-copy"><small>${campaign.badge}</small><h3>${campaign.title}</h3><p>${campaign.copy}</p></div>
  <div class="gacha-count-grid">${counts.map(count=>`<button type="button" data-gacha-count="${count}"><b>${count}連</b><small>魔晶石 ${gachaCost(count,campaignId).toLocaleString()}</small></button>`).join("")}</div>
  <label class="gacha-custom-count"><span>その他の回数（1〜100）</span><input id="gachaCustomCount" type="number" inputmode="numeric" min="1" max="100" value="15"><button type="button" data-gacha-custom>この回数で召喚</button></label>
  <small>所持 魔晶石 ${save.state.player.crystals.toLocaleString()} / 10連ごとの最後の枠にレア保証を適用</small>
 </div>`,"戻る"));
 const modal=topModal();modal.classList.add("gacha-count-modal");
 const run=count=>{count=Math.max(1,Math.min(100,Number(count)||1));performGachaBatch(mode,count,{campaign:campaignId,cost:gachaCost(count,campaignId)})};
 modal.querySelectorAll("[data-gacha-count]").forEach(button=>button.onclick=()=>run(button.dataset.gachaCount));
 modal.querySelector("[data-gacha-custom]").onclick=()=>run(modal.querySelector("#gachaCustomCount").value);
 modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove();
}
function performGachaBatch(mode,count,{campaign="standard",cost=gachaCost(count,campaign)}={}){
 count=Math.max(1,Math.min(100,Number(count)||1));save.state.gacha??={};
 if(campaign==="beginner"&&save.state.gacha.firstTenUsed)return showToast("初回限定召喚は受取済みです");
 if(campaign==="daily"&&save.state.gacha.lastDailyKey===localDayKey())return showToast("本日の無料召喚は受取済みです");
 if(mode==="monster"&&save.state.monsters.length+count>500)return showToast(`モンスター所持枠が不足しています（${save.state.monsters.length}/500）`);
 if(mode==="equipment"&&save.state.equipment.length+count>500)return showToast(`装備所持枠が不足しています（${save.state.equipment.length}/500）`);
 const monsterSpace=Math.max(0,500-save.state.monsters.length),equipmentSpace=Math.max(0,500-save.state.equipment.length);
 if(mode==="mixed"&&monsterSpace+equipmentSpace<count)return showToast(`所持枠が不足しています（空き ${monsterSpace+equipmentSpace}枠 / 必要 ${count}枠）`);
 if(save.state.player.crystals<cost)return showToast(`魔晶石が足りません（必要 ${cost}個）`);
 save.state.player.crystals-=cost;if(campaign==="beginner")save.state.gacha.firstTenUsed=true;if(campaign==="daily")save.state.gacha.lastDailyKey=localDayKey();
 const results=Array.from({length:count},(_,index)=>{
  const guarantee=(index+1)%10===0,forcedRarity=campaign==="ssr"&&guarantee?"SSR":null;
  const effectiveMode=mode==="mixed"
   ?save.state.monsters.length>=500?"equipment":save.state.equipment.length>=500?"monster":"mixed"
   :mode;
  return summonOne({mode:effectiveMode,guaranteedMonster:effectiveMode==="monster",guaranteedEquipment:effectiveMode==="equipment",guaranteedRare:guarantee,forcedRarity});
 });
 showSummonResults(results,false,{campaign});
}
function performGacha(type){
 if(type==="first")return performGachaBatch("monster",10,{campaign:"beginner",cost:0});
 if(type==="daily")return performGachaBatch("mixed",1,{campaign:"daily",cost:0});
 const mode=type.startsWith("monster")?"monster":"equipment",count=type.endsWith("ten")?10:1;performGachaBatch(mode,count,{campaign:"standard"});
}
function openDeepGacha(){if(!hasCleared1000(save.state))return alert("深淵召喚は1000階の支配者撃破後に解放されます");const body=`<div class="gacha-head deep"><b>深淵の力を召喚する</b><div class="gacha-head-actions"><span>💎 ${save.state.player.crystals}</span><button type="button" id="openRarityGuide" class="rarity-help">？</button></div></div><div class="gacha-menu deep-gacha-menu"><button data-deep-gacha="monster-single"><b>🌌 深淵モンスター召喚　💎25</b><small>深層モンスターの深淵個体を召喚</small></button><button data-deep-gacha="monster-ten"><b>🌌 深淵モンスター10連　💎225</b><small>10体すべて深淵個体</small></button><button data-deep-gacha="equipment-single"><b>🗡️ 深淵装備召喚　💎25</b><small>深淵の名を冠するLR装備</small></button><button data-deep-gacha="equipment-ten"><b>🗡️ 深淵装備10連　💎225</b><small>10個すべて深淵装備</small></button></div><p class="gacha-footnote">十神は深淵召喚からも排出されません。</p>`;app.insertAdjacentHTML("beforeend",Modal("🌌 深淵召喚",body,"閉じる"));document.querySelectorAll("[data-deep-gacha]").forEach(b=>b.onclick=()=>performDeepGacha(b.dataset.deepGacha));document.getElementById("openRarityGuide")?.addEventListener("click",openRarityGuide);topModalButton().onclick=closeTopModal}
function performDeepGacha(type){
 const mode=type.startsWith("monster")?"monster":"equipment",count=type.endsWith("ten")?10:1,cost=count===10?225:25;
 if(mode==="monster"&&save.state.monsters.length+count>500)return showToast(`モンスター所持枠が不足しています（${save.state.monsters.length}/500）`);
 if(mode==="equipment"&&save.state.equipment.length+count>500)return showToast(`装備所持枠が不足しています（${save.state.equipment.length}/500）`);
 if(save.state.player.crystals<cost)return alert("魔晶石が足りない");
 save.state.player.crystals-=cost;
 const results=Array.from({length:count},()=>summonOne({mode,guaranteedMonster:mode==="monster",guaranteedEquipment:mode==="equipment",deep:true}));
 showSummonResults(results,true);
}
function showSummonResults(results,deep=false,{campaign="standard"}={}){
 save.save();if(deep)closeTopModal();document.querySelectorAll(".gacha-modal-v2,.gacha-count-modal").forEach(modal=>modal.remove());
 app.insertAdjacentHTML("beforeend",Modal(deep?"深淵召喚結果":"召喚結果",`<div class="gacha-reveal">
  <div class="gacha-reveal-stage"><i></i><span>${deep?"ABYSS":"SUMMON"}</span><b>運命の扉が開く――</b></div>
  <button type="button" class="gacha-reveal-skip" data-gacha-skip>通常演出をSKIP ›</button>
  <div class="gacha-premium-reveal" data-gacha-premium hidden></div>
  <div class="gacha-results gacha-results-sequential" data-gacha-results hidden></div>
  <p class="muted">全${results.length}件・残り 魔晶石 ${save.state.player.crystals.toLocaleString()}</p>
 </div>`,"閉じる"));
 const modal=topModal(),container=modal.querySelector("[data-gacha-results]"),premiumStage=modal.querySelector("[data-gacha-premium]"),stage=modal.querySelector(".gacha-reveal-stage"),skip=modal.querySelector("[data-gacha-skip]"),primary=modal.querySelector("[data-modal-primary]"),dismiss=modal.querySelector("[data-modal-dismiss]");
 const visual=result=>result.type==="monster"?monsterVisual(result.item??result,result.icon,{className:"gacha-result-monster-visual"}):`<i class="gacha-result-equipment-art slot-${result.item?.slot??"accessory"}" aria-hidden="true"></i>`;
 const row=(result,index)=>{const rarity=result.displayRarity??result.rarity,key=rarityCssClass(rarity);return`<article class="gacha-result-card rarity-${key}" style="--reveal-index:${index}"><span>${visual(result)}</span><div><small>${result.type==="monster"?"MONSTER":"EQUIPMENT"} ${String(index+1).padStart(2,"0")}</small><b class="rarity-name-${key}">[${rarity}] ${result.name}</b><em>${result.isNew?"NEW":"重複"}</em></div></article>`};
 const premium=results.map((result,index)=>({result,index})).filter(({result})=>(RARITY_ORDER[result.displayRarity??result.rarity]??0)>=RARITY_ORDER.SSR);
 let premiumIndex=0,completed=false,transitioning=false,introTimer=null;
 const finish=()=>{
  if(completed)return;completed=true;if(introTimer)clearTimeout(introTimer);
  stage.classList.add("finished");stage.hidden=true;premiumStage.hidden=true;skip.hidden=true;
  container.hidden=false;container.innerHTML=results.map(row).join("");
  primary.disabled=false;dismiss.disabled=false;
 };
 const revealPremium=()=>{
  if(completed||transitioning)return;
  if(premiumIndex>=premium.length){finish();return}
  const {result,index}=premium[premiumIndex],rarity=result.displayRarity??result.rarity,key=rarityCssClass(rarity),position=premiumIndex+1;
  stage.hidden=true;skip.hidden=true;premiumStage.hidden=false;
  premiumStage.innerHTML=`<article class="gacha-premium-card rarity-${key}" data-gacha-premium-next tabindex="0">
   <div class="gacha-premium-aura" aria-hidden="true"></div><small>SSR以上 ${position}/${premium.length}</small>
   <span class="gacha-premium-visual">${visual(result)}</span>
   <em>${result.isNew?"NEW ARRIVAL":"DUPLICATE"}</em><b class="rarity-name-${key}">[${rarity}]</b><h3>${result.name}</h3>
   <p>${result.type==="monster"?"新たな魔物との契約が結ばれた":"希少な装備が召喚された"}</p><strong>${position<premium.length?"タップで次のSSR以上へ":"タップで召喚結果へ"}</strong>
  </article>`;
  const next=premiumStage.querySelector("[data-gacha-premium-next]");
  const advance=()=>{if(transitioning||completed)return;transitioning=true;next.classList.add("leaving");setTimeout(()=>{premiumIndex++;transitioning=false;revealPremium()},220)};
  next.onclick=advance;next.onkeydown=event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();advance()}};
 };
 const startPremium=()=>{if(completed||transitioning)return;if(introTimer)clearTimeout(introTimer);stage.classList.add("opening");premium.length?revealPremium():finish()};
 primary.disabled=true;dismiss.disabled=true;
 skip.onclick=startPremium;
 introTimer=setTimeout(()=>{if(!modal.isConnected)return;startPremium()},720);
 primary.onclick=()=>{if(!completed)return;modal.remove();render()};
}
function openCodexHub(){app.insertAdjacentHTML("beforeend",Modal("📖 魔物一覧",`<div class="codex-hub"><button data-open-monster-index><span>📖</span><b>魔物一覧へ</b><small>No.・所持数・合成・逃すをまとめて管理</small></button><p class="muted">装備は「持ち物」と「装備管理」に統合しました。</p></div>`,"閉じる"));const modal=topModal();modal.querySelector("[data-open-monster-index]").onclick=()=>{modal.remove();go("monsters")};modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove()}
function codexVisibleRarity(rarity){return rarity}
function openMonsterCodexDetail(speciesId,seen,index){
 const sp=SPECIES[speciesId];if(!sp)return;
 if(!seen){app.insertAdjacentHTML("beforeend",Modal(`No.${String(index+1).padStart(3,"0")} 未遭遇`,`<div class="codex-detail unknown-detail"><div class="codex-detail-icon">❔</div><p>このモンスターの情報はまだ記録されていません。</p></div>`,"図鑑へ戻る"));topModalButton().onclick=closeTopModal;return}
 const owned=save.state.monsters.filter(monster=>monster.speciesId===speciesId),captured=save.state.codex.captures[speciesId]??owned.length,base=sp.baseStats??{},fieldEncounter=sp.fieldEncounter!==false;
 const sources=Array.isArray(sp.acquisition)&&sp.acquisition.length?sp.acquisition:(fieldEncounter?["探索","召喚","闇市場"]:["召喚","闇市場"]);
 const ownedHistory=owned.length?owned.map(monster=>{const history=monster.history??{};return`<details class="codex-owned-history"><summary><span>${monsterVisual(monster,sp.emoji,{className:"codex-owned-monster-visual"})}</span><b>${displayName(monster)} Lv.${monster.level}</b><small>冒険 ${history.adventures??0}回・勝利 ${history.victories??0}回</small></summary><div><p><b>初獲得</b>${formatObtainedDate(monster.obtainedAt??monster.capturedAt)}・${sourceLabelForCodex(monster.obtainedMethod)}・${monster.obtainedFloor??1}F</p><p><b>戦闘 / 勝利</b>${history.battles??0} / ${history.victories??0}</p><p><b>撃破 / ボス</b>${history.kills??0} / ${history.bossDefeats??0}</p><p><b>最高到達</b>${history.highestFloor??monster.obtainedFloor??1}F</p><p><b>MVP / 最大ダメージ</b>${history.mvp??0} / ${history.maxDamage??0}</p><p><b>最終出撃</b>${formatObtainedDate(history.lastDeployedAt)}</p></div></details>`}).join(""):'<p class="muted">現在所持している個体はいません。</p>';
 app.insertAdjacentHTML("beforeend",Modal(`No.${String(index+1).padStart(3,"0")} ${sp.name}`,`<div class="codex-detail"><div class="codex-detail-head"><span>${monsterVisual(speciesId,sp.emoji,{className:"codex-detail-monster-visual"})}</span><div><b>${codexVisibleRarity(sp.rarity)} / ${elementLabel(sp.element)}</b><small>${sp.race??"不明"} / ${sp.role??"不明"} / ${sp.growthLabel??"標準"}成長</small></div></div><div class="detail-stat-grid"><span>HP ${base.hp??"-"}</span><span>ATK ${base.atk??"-"}</span><span>DEF ${base.def??"-"}</span><span>SPD ${base.spd??"-"}</span></div><div class="codex-info-list"><p><b>遭遇</b>${save.state.codex.encounters[speciesId]??0}回</p><p><b>捕獲</b>${captured}回</p><p><b>出現階層</b>${fieldEncounter?`${sp.minFloor??"?"}階以降・近い階層帯ほど出現しやすい`:"通常探索には出現しない"}</p><p><b>入手方法</b>${sources.join("・")}</p><p><b>捕獲率</b>${fieldEncounter?`${Math.round((sp.captureRate??0)*100)}%`:"販売・召喚限定"}</p><p><b>主なスキル</b>${(sp.skills??[]).map(skill=>skill.name).join("、")||"不明"}</p></div><h3>📖 所持個体の冒険記録</h3><div class="codex-owned-history-list">${ownedHistory}</div></div>`,"図鑑へ戻る"));
 topModalButton().onclick=closeTopModal;
}
function sourceLabelForCodex(method){return({capture:"探索・捕獲",summon:"召喚",market:"闇市場",darkMarket:"闇市場",endgameContract:"契約",deepSummon:"深淵召喚"}[method]??method??"不明")}
function openEquipmentCodexDetail(name){const all=[...save.state.equipment,...save.state.reserveEquipment,...save.state.bossEquipmentVault],items=all.filter(i=>i.name===name);if(!items.length)return;const best=[...items].sort((a,b)=>(RARITY_ORDER[equipmentDisplayRarity(b)]??0)-(RARITY_ORDER[equipmentDisplayRarity(a)]??0)||(b.plus??0)-(a.plus??0))[0],displayRarity=equipmentDisplayRarity(best),stats=Object.entries(best.stats??{}).map(([k,v])=>`<span>${equipmentStatLabel(k)} +${v}</span>`).join("");app.insertAdjacentHTML("beforeend",Modal(`${best.slot==="weapon"?"⚔️":best.slot==="armor"?"🛡️":"💍"} ${name}`,`<div class="codex-detail"><p><b>[${codexVisibleRarity(displayRarity)}] ${slotLabel(best.slot)}</b></p><div class="detail-stat-grid">${stats||"<span>能力補正なし</span>"}</div><div class="codex-info-list"><p><b>所持数</b>${items.length}</p><p><b>最高強化</b>+${Math.max(...items.map(i=>i.plus??0))}</p><p><b>シリーズ</b>${best.series??"なし"}</p><p><b>装備規則</b>${best.handedness??"通常"}</p></div></div>`,"図鑑へ戻る"));topModalButton().onclick=closeTopModal}
function openCodex(type){if(type==="monster"){const owned=new Set(save.state.monsters.map(m=>m.speciesId)),sorted=orderedMonsterSpecies(SPECIES),rows=sorted.map((sp,i)=>{const seen=(save.state.codex.encounters[sp.id]??0)>0||owned.has(sp.id),captured=save.state.codex.captures[sp.id]??save.state.monsters.filter(m=>m.speciesId===sp.id).length,rarity=seen?codexVisibleRarity(sp.rarity):"";return`<button class="codex-row ${seen?"":"unknown"}" data-codex-monster="${sp.id}" data-codex-index="${i}" data-codex-seen="${seen?1:0}"><span>${seen?monsterVisual(sp.id,sp.emoji,{className:"codex-row-monster-visual"}):"❔"}</span><b>No.${String(i+1).padStart(3,"0")} ${seen?sp.name:"？？？？？"}</b><small>${seen?`${rarity} / ${elementLabel(sp.element)} / 遭遇 ${save.state.codex.encounters[sp.id]??0} / 捕獲 ${captured}`:"未遭遇"}</small></button>`}).join("");app.insertAdjacentHTML("beforeend",Modal("📖 モンスター図鑑",`<div class="codex-summary">発見 ${sorted.filter(sp=>(save.state.codex.encounters[sp.id]??0)>0||owned.has(sp.id)).length} / ${sorted.length}</div><div class="codex-list">${rows}</div>`,"閉じる"));const modal=topModal();modal.querySelectorAll("[data-codex-monster]").forEach(b=>b.onclick=()=>openMonsterCodexDetail(b.dataset.codexMonster,b.dataset.codexSeen==="1",Number(b.dataset.codexIndex)))}else{const all=[...save.state.equipment,...save.state.reserveEquipment,...save.state.bossEquipmentVault],names=[...new Set(all.map(i=>i.name))],rows=names.length?names.map(name=>{const items=all.filter(i=>i.name===name),best=[...items].sort((a,b)=>(RARITY_ORDER[equipmentDisplayRarity(b)]??0)-(RARITY_ORDER[equipmentDisplayRarity(a)]??0))[0],displayRarity=equipmentDisplayRarity(best);return`<button class="codex-row" data-codex-equipment="${name.replaceAll('"','&quot;')}"><span>${best.slot==="weapon"?"⚔️":best.slot==="armor"?"🛡️":"💍"}</span><b>[${codexVisibleRarity(displayRarity)}] ${name}</b><small>${slotLabel(best.slot)} / 所持 ${items.length}</small></button>`}).join(""):'<div class="empty">まだ装備を発見していません</div>';app.insertAdjacentHTML("beforeend",Modal("🗡️ 装備図鑑",`<div class="codex-summary">発見 ${names.length}種</div><div class="codex-list">${rows}</div>`,"閉じる"));const modal=topModal();modal.querySelectorAll("[data-codex-equipment]").forEach(b=>b.onclick=()=>openEquipmentCodexDetail(b.dataset.codexEquipment))}topModalButton().onclick=closeTopModal}
function enhanceEquipment(id){openEquipmentEnhancement(id)}
function equipmentEnhancementBody(item){
 const materials=enhancementMaterialCandidates(save.state,item.id),level=Math.max(1,item.level??1),need=equipmentExpNeed(level),progress=Math.floor(((item.exp??0)/need)*100);
 const rows=materials.slice(0,120).map(material=>{const exp=equipmentMaterialExp(material,item),same=material.name===item.name;return`<label class="equipment-material-row ${same?"same-name":""}"><input type="checkbox" data-equipment-material="${material.id}"><span><b>[${equipmentDisplayRarity(material)}] ${material.name}</b><small>Lv.${material.level??1}${material.plus?` / +${material.plus}`:""}${same?" / 同名基礎EXP×5":""}${(material.level??1)>1||material.exp?" / 育成EXP100%継承":""}</small></span><strong>+${exp.toLocaleString()} EXP</strong></label>`}).join("")||'<div class="empty">素材にできる装備がありません。<br><small>装備中・お気に入り・ロック中は表示されません。</small></div>';
 const growthRecords=`<section class="equipment-growth-records"><div class="section-label">育成記録</div>${item.slot==="weapon"?weaponMasterySummary(item):""}${item.series?seriesMasterySummary(save.state,item.series):'<p class="growth-record-empty">シリーズ装備ではありません</p>'}</section>`;
 return`<div class="equipment-enhancement"><div class="enhancement-target compact"><div class="enhancement-title-row"><div><small>INFINITE ENHANCEMENT</small><h3>[${equipmentDisplayRarity(item)}] ${item.name}</h3></div><strong>Lv.${level}<small> ∞</small></strong></div><div class="enhancement-status-row infinite"><span>レベル上限なし</span><span>次Lvまで ${(need-(item.exp??0)).toLocaleString()}</span></div><div class="equipment-exp large"><i style="width:${progress}%"></i></div><p>EXP ${(item.exp??0).toLocaleString()} / ${need.toLocaleString()}</p></div>${growthRecords}<section class="equipment-feed-panel"><div class="section-label">素材を選択</div><div class="enhancement-tools"><button data-material-preset="same">同名</button><button data-material-preset="low">N・R</button><button data-material-preset="all">全選択</button><button data-material-preset="none">解除</button></div><div class="enhancement-preview" id="enhancementPreview"><b>素材 0個</b><span>獲得EXP 0</span><small>強化後 Lv.${level}</small></div><p class="muted compact-note">育成済み装備は投入EXPを100%継承。同名ボーナス×5は基礎素材EXPだけに適用され、EXP増殖は起きません。</p><div class="equipment-material-list">${rows}</div><button id="executeEquipmentEnhancement" class="primary sticky-enhance-button" disabled>選択した装備で強化</button></section></div>`
}
function openEquipmentEnhancement(id){
 const item=save.state.equipment.find(i=>i.id===id);if(!item)return;
 app.insertAdjacentHTML("beforeend",Modal("🔨 装備育成",equipmentEnhancementBody(item),"閉じる"));const modal=topModal(),selectedMaterials=new Set();
 const refreshPreview=()=>{const ids=[...selectedMaterials],materials=ids.map(mid=>save.state.equipment.find(i=>i.id===mid)).filter(Boolean),total=materials.reduce((sum,m)=>sum+equipmentMaterialExp(m,item),0),projected=projectEquipmentGrowth(item,total),preview=modal.querySelector("#enhancementPreview"),execute=modal.querySelector("#executeEquipmentEnhancement");if(!preview||!execute)return;preview.innerHTML=`<b>素材 ${materials.length}個</b><span>獲得EXP ${total.toLocaleString()}</span><small>強化後 Lv.${projected.level}${projected.level>item.level?`（+${projected.level-item.level}）`:""} / 上限なし</small>`;execute.disabled=!materials.length};
 modal.querySelectorAll("[data-equipment-material]").forEach(input=>input.onchange=()=>{input.checked?selectedMaterials.add(input.dataset.equipmentMaterial):selectedMaterials.delete(input.dataset.equipmentMaterial);refreshPreview()});
 modal.querySelectorAll("[data-material-preset]").forEach(button=>button.onclick=()=>{const mode=button.dataset.materialPreset;selectedMaterials.clear();modal.querySelectorAll("[data-equipment-material]").forEach(input=>{const material=save.state.equipment.find(i=>i.id===input.dataset.equipmentMaterial),pick=mode==="all"||mode==="same"&&material?.name===item.name||mode==="low"&&["N","R"].includes(material?.rarity);input.checked=pick;if(pick)selectedMaterials.add(input.dataset.equipmentMaterial)});refreshPreview()});
 modal.querySelector("#executeEquipmentEnhancement")?.addEventListener("click",()=>{const ids=[...selectedMaterials];if(!ids.length)return;const materials=ids.map(mid=>save.state.equipment.find(i=>i.id===mid)).filter(Boolean),total=materials.reduce((sum,m)=>sum+equipmentMaterialExp(m,item),0);if(!confirm(`${materials.length}個を素材にしますか？\n獲得EXP ${total.toLocaleString()}\n育成済みEXPは100%引き継がれます。`))return;const beforeOwner=item.equippedBy?save.state.monsters.find(m=>m.id===item.equippedBy):null,beforeStats=beforeOwner?calculatedStats(beforeOwner):null,beforeMp=beforeOwner?maxMp(beforeOwner):null,result=consumeEquipmentMaterials(save.state,item.id,ids);if(!result.ok)return alert(result.message);if(beforeOwner)preserveVitals(beforeOwner,beforeStats,beforeMp);save.save();modal.remove();showToast(result.gained?`${item.name} Lv.${item.level}へ！`:`${result.amount.toLocaleString()} EXP獲得`);render();openEquipmentEnhancement(item.id)});
 modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove();refreshPreview();
}
function bulkSellEquipment(){const targets=save.state.equipment.filter(i=>!i.equippedBy&&!i.locked&&!i.favorite&&!i.ruleOverrides?.unsellable&&["N","R"].includes(i.rarity));if(!targets.length)return alert("売却対象がありません");const total=targets.reduce((n,i)=>n+equipmentSellPrice(i,save.state),0);if(!confirm(`${targets.length}個を一括売却して ${total}G獲得する？`))return;const ids=new Set(targets.map(i=>i.id));save.state.equipment=save.state.equipment.filter(i=>!ids.has(i.id));save.state.player.gold+=total;save.save();render()}
function releaseMonster(m){if(save.state.party.includes(m.id))return alert("出撃中のモンスターは解放できません");if(m.favorite||m.locked)return alert("お気に入り・ロック中は解放できません");if(save.state.monsters.length<=1)return alert("最後の1体は解放できません");if(!confirm(`${displayName(m)}を解放する？\n魂として魔晶石1個を獲得します。`))return;Object.values(m.equipment??{}).forEach(id=>{const i=save.state.equipment.find(x=>x.id===id);if(i)i.equippedBy=null});save.state.monsters=save.state.monsters.filter(x=>x.id!==m.id);save.state.player.crystals++;save.save();go("monsters")}
function partySynergy(){const counts={};save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean).forEach(m=>{const e=SPECIES[m.speciesId].element??"neutral";counts[e]=(counts[e]??0)+1});const [element,count]=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]??[null,0];if(count<3)return null;const effects={fire:{name:"🔥 火の共鳴",atk:count>=4?.30:.20},water:{name:"💧 水の共鳴",regen:count>=4?.05:.03},dark:{name:"🌑 闇の共鳴",crit:count>=4?20:15},light:{name:"✨ 光の共鳴",def:count>=4?.20:.12},poison:{name:"☠️ 毒の共鳴",atk:count>=4?.18:.10}};return effects[element]?{element,count,...effects[element]}:null}
function clearPartySynergy(){save.state.monsters.forEach(m=>delete m._synergy)}
function bindShop(){
 document.getElementById("leaveShop").onclick=()=>go("explore");
 document.querySelectorAll("[data-shop-menu]").forEach(b=>b.onclick=()=>openShopMenu(b.dataset.shopMenu));
}
function openShopMenu(type){
 if(type==="casino")return openSecretRoomCasino();
 if(type==="inn")return openSecretRoomInn();
 if(type==="market")return openDarkMarket();
}
function casinoModalBody(){
 const room=activeSecretRoom(save.state),casino=room?.casino??{},used=Boolean(casino.used||casino.spins>0),last=casino.lastResult,digits=last?.digits??["❔","❔","❔"],canPlay=!used&&save.state.player.gold>0&&save.state.player.crystals>=CASINO_CRYSTAL_COST;
 const rateRows=CASINO_MULTIPLIER_RATES.map(bucket=>`<span><b>${bucket.label}</b><small>${bucket.rate>=.01?`${bucket.rate*100}%`:`${(bucket.rate*100).toFixed(2)}%`}</small></span>`).join("");
 const lastResult=last?`<strong>${last.multiplier}倍・${last.payout.toLocaleString()}G</strong><small>収支 ${last.net>=0?"+":""}${last.net.toLocaleString()}G / 魔晶石 −${last.crystalCost??CASINO_CRYSTAL_COST}</small>`:`<small>所持 ${save.state.player.gold.toLocaleString()}G・💎${save.state.player.crystals.toLocaleString()}</small>`;
 return`<div class="casino-panel">
  <div class="casino-entry"><span>挑戦料 <b>💎${CASINO_CRYSTAL_COST}</b></span><span>挑戦回数 <b>この🚪で1回</b></span><span>最高配当 <b>999倍</b></span></div>
  <div class="casino-rate-table">${rateRows}</div>
  <div class="casino-reels ${used?"finished":""}" id="casinoReels">${digits.map(digit=>`<i>${digit}</i>`).join("")}</div>
  <label class="casino-bet"><small>賭け金を手入力</small><input id="casinoBet" type="number" inputmode="numeric" min="1" max="${save.state.player.gold}" value="${Math.min(100,save.state.player.gold)}" ${used?"disabled":""}><b>G</b></label>
  <div class="casino-presets"><button data-casino-bet="100" ${used?"disabled":""}>100G</button><button data-casino-bet="1000" ${used?"disabled":""}>1,000G</button><button data-casino-bet="10000" ${used?"disabled":""}>10,000G</button><button data-casino-bet="max" ${used?"disabled":""}>MAX</button></div>
  <button id="spinCasino" class="primary casino-spin" ${canPlay?"":"disabled"}>${used?"この🚪では挑戦済み":`💎${CASINO_CRYSTAL_COST}で運命を回す`}</button>
  <div id="casinoResult" class="casino-result ${last?(last.multiplier>1?"win":last.multiplier===1?"draw":"lose"):""}">${lastResult}</div>
  <p class="muted">${used?"別の🚪を発見すると再挑戦できます。":"30倍以上は合計0.1%。数字が大きいほど急激に出にくくなります。"}</p>
 </div>`;
}
function openSecretRoomCasino(){
 app.insertAdjacentHTML("beforeend",Modal("🎰 深淵スロット",casinoModalBody(),"裏街へ戻る"));
 const modal=topModal(),input=modal.querySelector("#casinoBet"),spin=modal.querySelector("#spinCasino"),reels=modal.querySelector("#casinoReels"),resultBox=modal.querySelector("#casinoResult");
 modal.querySelectorAll("[data-casino-bet]").forEach(button=>button.onclick=()=>{const value=button.dataset.casinoBet==="max"?save.state.player.gold:Number(button.dataset.casinoBet);input.value=Math.max(1,Math.min(save.state.player.gold,value||1))});
 spin?.addEventListener("click",async()=>{
  const pageScroll=window.scrollY,modalBody=modal.querySelector(".game-modal-body"),bodyScroll=modalBody?.scrollTop??0;
  const holdScroll=()=>requestAnimationFrame(()=>{window.scrollTo(0,pageScroll);if(modalBody)modalBody.scrollTop=bodyScroll});
  const result=spinSecretRoomCasino(save.state,Number(input.value));if(!result.ok)return showToast(result.message);
  input.blur();holdScroll();
  save.save();spin.disabled=true;input.disabled=true;modal.querySelectorAll("[data-casino-bet],[data-modal-primary],[data-modal-dismiss]").forEach(button=>button.disabled=true);
  resultBox.className="casino-result";resultBox.innerHTML=`<b>${result.bet.toLocaleString()}G BET・運命確定…</b><small>💎${CASINO_CRYSTAL_COST}消費済み</small>`;
  const reelElements=[...reels.querySelectorAll("i")],pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  reelElements.forEach(reel=>{reel.textContent="✦";reel.classList.add("rolling")});
  for(let index=0;index<reelElements.length;index++){
   await pause(700);if(!modal.isConnected)return;
   reelElements[index].classList.remove("rolling");reelElements[index].textContent=result.digits[index];reelElements[index].classList.add("landed");
   holdScroll();
  }
  reels.classList.add("finished");resultBox.className=`casino-result ${result.multiplier>1?"win":result.multiplier===1?"draw":"lose"}`;
  resultBox.innerHTML=result.multiplier===0
   ?`<strong>000・全額消失</strong><small>−${result.bet.toLocaleString()}G</small>`
   :result.multiplier===1
    ?`<strong>001・1倍</strong><small>${result.bet.toLocaleString()}G返還・GOLD収支±0</small>`
    :`<strong>${String(result.multiplier).padStart(3,"0")}・${result.multiplier}倍！</strong><small>${result.payout.toLocaleString()}G獲得 / 収支 +${result.net.toLocaleString()}G</small>`;
  const footer=modal.querySelector(".casino-panel>p");if(footer)footer.textContent="この🚪での挑戦は終了。別の🚪を探してください。";
  modal.querySelectorAll("[data-modal-primary],[data-modal-dismiss]").forEach(button=>button.disabled=false);
  holdScroll();
 });
 modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();render()};
}
function openSecretRoomInn(){
 const room=activeSecretRoom(save.state);
 if(room?.rested)return showToast("この🚪の無料宿は利用済みです");
 if(!confirm("無料の宿でパーティーを完全回復しますか？\nこの🚪では1回だけ利用できます。"))return;
 const result=useSecretRoomInn(save.state);if(!result.ok)return showToast(result.message);
 save.save();app.insertAdjacentHTML("beforeend",Modal("🛏️ 無料宿・完全回復",`<div class="secret-inn-result"><span>✨</span><h3>パーティー完全回復！</h3><p>HP ${result.hp.toLocaleString()} / MP ${result.mp.toLocaleString()}</p><small>状態異常 ${result.ailments}件を解除</small></div>`,"裏街へ戻る"));
 topModalButton().onclick=()=>{closeTopModal();render()};
}
function darkMarketBody(){
 const room=activeSecretRoom(save.state),offers=room?.offers??[];
 const offerRows=offers.map(offer=>{const rarity=String(offer.rarity??"SR"),rarityClass=({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity).toLowerCase(),grade=offer.mystery&&!offer.revealed?"未鑑定":offer.powerLabel??"階層相応",showMonster=offer.kind==="monster"&&offer.payload&&!(offer.mystery&&!offer.revealed),species=showMonster?SPECIES[offer.payload.speciesId]:null,icon=showMonster?monsterVisual(offer.payload,species?.emoji??offer.icon,{className:"market-list-monster-visual"}):offer.icon;return`<article class="dark-market-offer rarity-name-${rarityClass} ${offer.sold?"sold":""} ${offer.priceTone} grade-${offer.powerGrade??"standard"}"><span>${icon}</span><div><small>${offer.kind==="monster"?"MONSTER":"EQUIPMENT"}・${rarity}・${grade}</small><b>${offer.name}</b><p>${offer.description}</p><em class="market-price-label">${offer.priceLabel}${offer.priceTone==="bargain"?`・相場 ${offer.referencePrice.toLocaleString()}G`:""}</em></div><div class="dark-market-offer-actions"><button type="button" data-market-detail="${offer.id}">詳細</button><button type="button" data-market-offer="${offer.id}" ${offer.sold?"disabled":""}>${offer.sold?"売切":`${offer.price.toLocaleString()}G`}</button></div></article>`}).join("");
 const recoveryRows=SECRET_ROOM_RECOVERY_ITEMS.map(item=>{const purchased=room?.recoveryPurchased?.[item.id]??0,remaining=Math.max(0,DARK_MARKET_ITEM_LIMIT-purchased);return`<article class="dark-market-recovery"><span>${item.icon}</span><div><b>${item.name}</b><small>${item.description}<br>所持 ${save.state.inventory[item.id]??0}</small></div><button data-market-recovery="${item.id}" ${remaining?"":"disabled"}>${remaining?`${item.price}G`:"完売"}<small>${purchased}/${DARK_MARKET_ITEM_LIMIT}</small></button></article>`}).join("");
 return`<div class="dark-market"><div class="dark-market-wallet">所持 <b>${save.state.player.gold.toLocaleString()}G</b></div><small class="muted">装備・モンスターは各1点限り。価格は相応から法外まで変動し、極稀に異常特価が紛れます。</small><h3>一点物</h3><div class="dark-market-offers">${offerRows}</div><h3>激安回復用品</h3><div class="dark-market-recovery-list">${recoveryRows}</div></div>`;
}
function darkMarketOfferDetail(offer){
 if(offer.mystery&&!offer.revealed)return`<div class="market-mystery-detail"><span>❔</span><h3>${offer.name}</h3><p>商人すら鑑定していない一点物。種類と中身は購入した瞬間に判明します。</p><small>${offer.kind==="monster"?"モンスター契約":"装備"} / 表示ランク ${offer.rarity} / 返品不可</small></div>`;
 const payload=offer.payload;if(!payload)return`<div class="empty">売却済みの商品です。</div>`;
 if(offer.kind==="equipment"){
  const multiplier=equipmentStatMultiplier(payload),stats=Object.entries(payload.stats??{}).map(([key,value])=>`<span><small>${equipmentStatLabel(key)}</small><b>+${Math.round(value*multiplier)}</b></span>`).join("");
  const affixes=(payload.affixes??[]).map(affix=>`<p><i style="background:${affixQuality(affix).color}"></i><b>${formatAffix(affix)}</b><small>${affixQuality(affix).name}</small></p>`).join("")||'<p class="muted">ランダムオプションなし</p>';
  return`<div class="market-item-detail"><div class="market-detail-hero"><span>${offer.icon}</span><div><small>${offer.rarity}・${offer.powerLabel??"階層相応"}</small><h3>${payload.name}${payload.plus?` +${payload.plus}`:""}</h3><p>${slotLabel(payload.slot)}・Lv.${payload.level??1}</p></div></div><div class="market-detail-stats">${stats}</div><div class="market-detail-affixes">${affixes}</div></div>`;
 }
 const species=SPECIES[payload.speciesId]??{},stats=calculatedStats(payload),skills=(payload.equippedSkills?.map(skillById).filter(Boolean)??allLearnedSkills(payload).slice(-4));
 const skillRows=skills.map(skill=>{const progress=payload.skillProgress?.[skill.id];return`<p><b>${skill.name}</b><small>${skill.tag??skill.type}${progress?`・熟練Lv.${progress.level}`:""}</small></p>`}).join("")||'<p class="muted">スキル情報なし</p>';
 return`<div class="market-item-detail"><div class="market-detail-hero"><span>${monsterVisual(payload,species.emoji??offer.icon,{className:"market-monster-visual"})}</span><div><small>${offer.rarity}・${offer.powerLabel??"階層相応"}</small><h3>${displayName(payload)}</h3><p>Lv.${payload.level}・${"★".repeat(payload.stars??1)}・+${payload.plus??0}・❤️${payload.affection??0}</p></div></div><div class="market-detail-stats"><span><small>HP</small><b>${stats.hp}</b></span><span><small>ATK</small><b>${stats.atk}</b></span><span><small>DEF</small><b>${stats.def}</b></span><span><small>SPD</small><b>${stats.spd}</b></span></div><div class="market-detail-skills"><h4>設定スキル</h4>${skillRows}</div></div>`;
}
function purchaseDarkMarketOffer(offerId,sourceModal=null){
 const result=buyDarkMarketOffer(save.state,offerId);if(!result.ok)return showToast(result.message);
 save.save();sourceModal?.remove();document.querySelectorAll(".game-modal").forEach(modal=>{if(modal.querySelector(".dark-market"))modal.remove()});showToast(result.message);render();openDarkMarket();
}
function openDarkMarketOfferDetail(offerId){
 const offer=activeSecretRoom(save.state)?.offers?.find(entry=>entry.id===offerId);if(!offer)return showToast("商品が見つかりません");
 app.insertAdjacentHTML("beforeend",Modal(`${offer.icon} ${offer.name}`,`${darkMarketOfferDetail(offer)}<div class="market-detail-price"><span>${offer.priceLabel}</span><b>${offer.price.toLocaleString()}G</b></div>`,offer.sold?"戻る":`${offer.price.toLocaleString()}Gで購入`));
 const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>offer.sold?modal.remove():purchaseDarkMarketOffer(offer.id,modal);
}
function openDarkMarket(){
 app.insertAdjacentHTML("beforeend",Modal("🕶️ 闇市場",darkMarketBody(),"裏街へ戻る"));
 const modal=topModal();
 modal.querySelectorAll("[data-market-detail]").forEach(button=>button.onclick=()=>openDarkMarketOfferDetail(button.dataset.marketDetail));
 modal.querySelectorAll("[data-market-offer]").forEach(button=>button.onclick=()=>purchaseDarkMarketOffer(button.dataset.marketOffer,modal));
 modal.querySelectorAll("[data-market-recovery]").forEach(button=>button.onclick=()=>{const result=buyDarkMarketRecovery(save.state,button.dataset.marketRecovery);if(!result.ok)return showToast(result.message);save.save();modal.remove();showToast(result.message);render();openDarkMarket()});
 modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();render()};
}
function equipmentReceipt(item,options={}){
 const result=receiveEquipment(save.state,item,options);
 return{...result,item,label:`[${item.rarity}] ${item.name}`,slot:slotLabel(item.slot)}
}
function equipmentReceiptText(receipt){
 if(receipt.location==="inventory")return`${receipt.label}（${receipt.slot}）を獲得`;
 if(receipt.location==="reserve")return`${receipt.label}<br>${receipt.message}`;
 if(receipt.location==="bossVault")return`${receipt.label}<br>${receipt.message}`;
 return`${receipt.label}<br>${receipt.message}`;
}
function purchaseResult(title,body){
 app.insertAdjacentHTML("beforeend",Modal(title,`<div class="reward-icon">✨</div><p>${body}</p>`));
 topModalButton().onclick=closeTopModal;
}
function createInputState(){return{pts:new Map(),last:null,pinch:null,drag:false,tap:0}}
function seeded(seed){let n=seed>>>0;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296}}
function floorSeed(floor){const seeds=save.state.player.floorSeeds;seeds[floor]??=Math.floor(Math.random()*2147483647);save.save();return seeds[floor]}
function currentDanger(){return dangerConfig(save.state.player.dangerLevel??1)}
function floorConfig(floor,rng){
 const tier=Math.min(9,Math.floor((floor-1)/10));
 const min=Math.min(31,23+tier),max=Math.min(39,31+tier);
 let cols=(min+Math.floor(rng()*(max-min+1)))|1,rows=(min+Math.floor(rng()*(max-min+1)))|1;
 cols=Math.max(23,Math.min(COLS,cols));rows=Math.max(23,Math.min(ROWS,rows));
 // Three to seven chambers keeps each floor readable as a building plan.
 // Deeper floors may roll more wings, but never become an indistinct maze.
 const roomRange=Math.min(5,3+Math.floor(tier/3)),roomCount=3+Math.floor(rng()*roomRange);
 return{cols,rows,shape:"rooms",roomCount}
}
function exploreRunFloorState(floor,{create=false}={}){
 save.state.player.exploreRun??={id:null,floors:{}};
 const run=save.state.player.exploreRun;
 run.floors??={};
 const key=String(Math.max(1,Math.floor(Number(floor)||1)));
 if(create&&!run.floors[key]){
  // A cleared floor cannot be revisited during the same expedition. Keeping only
  // the current floor prevents a long run from inflating the save file.
  run.floors={[key]:{decorations:{}}};
 }
 return run.floors[key]??null;
}
function applySavedExploreDecorationState(entry,floor){
 const saved=exploreRunFloorState(floor)?.decorations?.[entry.id];
 if(!saved)return entry;
 entry.used=Boolean(saved.used);entry.destroyed=Boolean(saved.destroyed);return entry;
}
function persistExploreDecorationState(entry,floor){
 const floorState=exploreRunFloorState(floor,{create:true});
 floorState.decorations??={};
 floorState.decorations[entry.id]={used:Boolean(entry.used),destroyed:Boolean(entry.destroyed)};
}
function populateExploreDecorations(world,floor,rng){
 if(Array.isArray(world.decorations)){
  world.decorations=world.decorations.filter(entry=>entry?.type!=="entrance");
  world.decorations.forEach((entry,index)=>{
   entry.id??=`${floor}-decor-${index}`;
   entry.phase=Number.isFinite(entry.phase)?entry.phase:index*37;
   entry.used=Boolean(entry.used);
   entry.destroyed=Boolean(entry.destroyed);
   applySavedExploreDecorationState(entry,floor);
  });
  return world.decorations
 }
 const open=(x,y)=>x>=0&&y>=0&&x<world.cols&&y<world.rows&&!world.tiles[y]?.[x];
 const pointKey=point=>`${point?.x},${point?.y}`,reserved=new Set([
  pointKey(world.start),pointKey(world.exit),pointKey(world.shop),pointKey(world.boss),
  ...(world.chests??[]).map(pointKey)
 ]);
 const cells=[],edgeCells=[],corridorCells=[];
 for(let y=1;y<world.rows-1;y++)for(let x=1;x<world.cols-1;x++){
  if(!open(x,y)||reserved.has(`${x},${y}`))continue;
  const neighbors=[[1,0],[-1,0],[0,1],[0,-1]],openCount=neighbors.filter(([dx,dy])=>open(x+dx,y+dy)).length;
  const nearWall=openCount<4;
  const vertical=open(x,y-1)&&open(x,y+1)&&(!open(x-1,y)||!open(x+1,y));
  const horizontal=open(x-1,y)&&open(x+1,y)&&(!open(x,y-1)||!open(x,y+1));
  const cell={x,y,openCount};
  cells.push(cell);if(nearWall)edgeCells.push(cell);if((vertical||horizontal)&&openCount<=3)corridorCells.push({...cell,rotation:horizontal?Math.PI/2:0});
 }
 const decorations=[],used=new Set(reserved);
 const take=(pool,predicate=()=>true)=>{
  const choices=pool.filter(cell=>predicate(cell)&&!used.has(`${cell.x},${cell.y}`));
  if(!choices.length)return null;
  const cell=choices[Math.floor(rng()*choices.length)];used.add(`${cell.x},${cell.y}`);return cell
 };
 const add=(type,pool=edgeCells,options={})=>{
  const cell=take(pool,options.predicate);if(!cell)return null;
  const entry={id:`${floor}-decor-${decorations.length}`,x:cell.x,y:cell.y,type,rotation:options.rotation??cell.rotation??0,scale:options.scale??1,phase:Math.floor(rng()*997),used:false,destroyed:false};
  decorations.push(entry);return entry
 };
 const density=Math.min(30,Math.max(10,Math.round(cells.length/17)));
 const propCycle=["candelabrum","crystal","barrel","crate","bones","crystal","candelabrum","barrel"];
 for(let index=0;index<density;index++)add(propCycle[(index+Math.floor(rng()*propCycle.length))%propCycle.length],edgeCells,{scale:index%5===0?1.12:1});
 const waterCount=Math.max(WATER_RULES.minPerFloor,Math.min(WATER_RULES.maxPerFloor,Math.floor(cells.length/90)));
 for(let index=0;index<waterCount;index++){
  const water=add("water",cells,{scale:1.25,predicate:cell=>cell.openCount>=3});
  if(!water)add("water",cells,{scale:1.25});
 }
 world.decorations=decorations;
 decorations.forEach(entry=>applySavedExploreDecorationState(entry,floor));
 return decorations
}
function ensureExploreDecorations(world){
 if(!world)return[];
 const floor=save.state.player.currentFloor,seed=(floorSeed(floor)^0x5f3759df)>>>0;
 return populateExploreDecorations(world,floor,seeded(seed))
}
function maze(){
 const floor=save.state.player.currentFloor,rng=seeded(floorSeed(floor));
 if(floor%10===0){
  const cols=23,rows=31,tiles=Array.from({length:rows},()=>Array(cols).fill(1)),cx=Math.floor(cols/2);
  for(let y=3;y<rows-3;y++)for(let x=cx-2;x<=cx+2;x++)tiles[y][x]=0;
  for(let y=3;y<=11;y++)for(let x=3;x<cols-3;x++)tiles[y][x]=0;
  const start={x:cx,y:rows-4},boss={x:cx,y:8,active:true},exit={x:cx,y:3};
  const world={cols,rows,shape:"bossCorridor",rooms:[{x:3,y:3,w:cols-6,h:9}],tiles,start,exit,shop:null,boss,chests:[],treasureRoom:false,steps:0,nextEncounter:999999,encountering:false};
  populateExploreDecorations(world,floor,rng);return world
 }
 const cfg=floorConfig(floor,rng),{cols,rows,shape,roomCount}=cfg;
 const tiles=Array.from({length:rows},()=>Array(cols).fill(1)),rooms=[];
 const inside=(x,y)=>x>0&&y>0&&x<cols-1&&y<rows-1;
 const carveCell=(x,y)=>{if(inside(x,y))tiles[y][x]=0};
 const roomCenter=room=>({x:room.x+Math.floor(room.w/2),y:room.y+Math.floor(room.h/2)});
 const overlaps=room=>rooms.some(other=>room.x<other.x+other.w+1&&room.x+room.w+1>other.x&&room.y<other.y+other.h+1&&room.y+room.h+1>other.y);
 let attempts=0;
 while(rooms.length<roomCount&&attempts++<900){
  const maxWidth=Math.min(13,cols-4),maxHeight=Math.min(11,rows-4);
  const w=Math.max(7,Math.min(maxWidth,7+Math.floor(rng()*4)*2)),h=Math.max(7,Math.min(maxHeight,7+Math.floor(rng()*5)));
  const room={x:1+Math.floor(rng()*Math.max(1,cols-w-2)),y:1+Math.floor(rng()*Math.max(1,rows-h-2)),w,h};
  if(!overlaps(room))rooms.push(room);
 }
 if(rooms.length<3){
  rooms.length=0;
  rooms.push(
   {x:1,y:1,w:7,h:7},
   {x:cols-8,y:1,w:7,h:7},
   {x:Math.floor((cols-7)/2),y:rows-8,w:7,h:7}
  );
 }
 for(const room of rooms)for(let y=room.y;y<room.y+room.h;y++)for(let x=room.x;x<room.x+room.w;x++)carveCell(x,y);
 const carveHorizontal=(from,to,y,width)=>{for(let x=Math.min(from,to);x<=Math.max(from,to);x++)for(let offset=0;offset<width;offset++)carveCell(x,y+offset-Math.floor((width-1)/2))};
 const carveVertical=(from,to,x,width)=>{for(let y=Math.min(from,to);y<=Math.max(from,to);y++)for(let offset=0;offset<width;offset++)carveCell(x+offset-Math.floor((width-1)/2),y)};
 const connectRooms=(a,b,width)=>{
  if(rng()<.5){carveHorizontal(a.x,b.x,a.y,width);carveVertical(a.y,b.y,b.x,width)}
  else{carveVertical(a.y,b.y,a.x,width);carveHorizontal(a.x,b.x,b.y,width)}
 };
 for(let index=1;index<rooms.length;index++){
  const current=roomCenter(rooms[index]),prior=rooms.slice(0,index).map(roomCenter),parent=prior.reduce((best,center)=>Math.abs(center.x-current.x)+Math.abs(center.y-current.y)<Math.abs(best.x-current.x)+Math.abs(best.y-current.y)?center:best,prior[0]);
  connectRooms(parent,current,rng()<.62?3:4);
 }
 if(rooms.length>3&&rng()<.6){const a=roomCenter(rooms[Math.floor(rng()*rooms.length)]),b=roomCenter(rooms[Math.floor(rng()*rooms.length)]);connectRooms(a,b,3)}
 const cells=[];for(let y=1;y<rows-1;y++)for(let x=1;x<cols-1;x++)if(!tiles[y][x])cells.push({x,y});
 if(cells.length<2){tiles[1][1]=0;tiles[rows-2][cols-2]=0;cells.push({x:1,y:1},{x:cols-2,y:rows-2})}
 const startCell={...roomCenter(rooms[0])},key=point=>`${point.x},${point.y}`,distances=new Map([[key(startCell),0]]),queue=[startCell];
 for(let cursor=0;cursor<queue.length;cursor++){const current=queue[cursor],distance=distances.get(key(current));for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const next={x:current.x+dx,y:current.y+dy},nextKey=key(next);if(!inside(next.x,next.y)||tiles[next.y][next.x]||distances.has(nextKey))continue;distances.set(nextKey,distance+1);queue.push(next)}}
 const wallAdjacent=cells.filter(cell=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>tiles[cell.y+dy]?.[cell.x+dx]===1));
 const exitPool=wallAdjacent.length?wallAdjacent:cells;
 const exit=exitPool.reduce((farthest,cell)=>(distances.get(key(cell))??-1)>(distances.get(key(farthest))??-1)?cell:farthest,startCell),distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
 const reserved=c=>distance(c,startCell)<=4||distance(c,exit)<=4,candidates=cells.filter(c=>!reserved(c)),used=new Set([`${startCell.x},${startCell.y}`,`${exit.x},${exit.y}`]);
 const takeCell=(randomValue,preferred=null)=>{const source=Array.isArray(preferred)&&preferred.length?preferred:candidates,available=source.filter(c=>!used.has(`${c.x},${c.y}`)),pool=available.length?available:candidates.length?candidates:cells,roll=Math.max(0,Math.min(.999999,Number(randomValue)||0)),p={...pool[Math.floor(roll*pool.length)]};used.add(`${p.x},${p.y}`);return p};
 const pick=()=>takeCell(rng());
 const chestSpawnBonus=abyssSkillEffectTotal(save.state,"chestSpawnRate"),opened=save.state.player.openedChests[floor]??[],chests=[],treasureRoom=rng()<Math.min(.12,.035+Math.floor(floor/10)*.002),count=treasureRoom?7+Math.floor(rng()*4):(rng()<Math.max(0,.16-chestSpawnBonus)?0:rng()<.72?1:2);
 for(let i=0;i<count;i++){const roll=rng(),kind=treasureRoom?(roll>.48?"radiant":"cabinet"):roll>.96?"radiant":roll>.78?"cabinet":roll>.25?"box":"apple",locked=kind==="radiant"&&rng()<(treasureRoom?.58:.45),mimic=treasureRoom&&rng()<.5,p=pick();chests.push({...p,id:`${floor}-${i}`,kind,locked,mimic,open:opened.includes(`${floor}-${i}`)})}
 const roomPlan=secretRoomPlan(save.state,floor),shopCell=roomPlan.appears?takeCell(roomPlan.positionRoll,wallAdjacent.filter(cell=>!reserved(cell))):null;
 const shop=shopCell?{...shopCell,active:true,roomId:roomPlan.id}:null;
 if(shop){
  const directions=[{dx:0,dy:-1,rotation:0},{dx:1,dy:0,rotation:Math.PI/2},{dx:0,dy:1,rotation:Math.PI},{dx:-1,dy:0,rotation:-Math.PI/2}];
  shop.rotation=directions.find(direction=>tiles[shop.y+direction.dy]?.[shop.x+direction.dx]===1)?.rotation??0;
 }
 const boss=floor%10===0?{...pick(),active:true}:null;
 const world={cols,rows,shape,rooms,tiles,start:startCell,exit:{...exit},shop,boss,chests,treasureRoom,steps:0,nextEncounter:10+Math.floor(rng()*23),encountering:false};
 populateExploreDecorations(world,floor,rng);return world
}
let expeditionSaveTimer=null;
function expeditionSnapshotFromGame({halt=false}={}){
 if(!game?.world||!game?.player||!game?.camera)return null;
 if(halt){game.world.encountering=false;game.player.path=[];game.player.p=0;game.player.rx=game.player.x;game.player.ry=game.player.y}
 return{floor:save.state.player.currentFloor,world:game.world,player:game.player,partyTrail:game.partyTrail,cameraData:{x:game.camera.x,y:game.camera.y,z:game.camera.z,ox:game.camera.ox,oy:game.camera.oy,manual:game.camera.manual},savedAt:new Date().toISOString()}
}
function persistExpeditionSnapshot(source,{saveNow=true}={}){
 if(!save.state.player.inRun||!source)return null;
 const serialized=cloneSerializable({...source,floor:save.state.player.currentFloor,savedAt:new Date().toISOString()});
 if(!serialized)return null;
 serialized.world.encountering=false;serialized.player.path=[];serialized.player.p=0;
 save.state.expeditionSnapshot=serialized;
 if(saveNow)save.save();
 return serialized
}
function hydrateExpeditionSnapshot(source){
 if(!source||Number(source.floor)!==Number(save.state.player.currentFloor)||!source.world||!source.player)return null;
 const world=cloneSerializable(source.world),playerData=source.player;if(!world)return null;
 const player=new Entity(Number(playerData.x)||world.start.x,Number(playerData.y)||world.start.y);player.rx=Number.isFinite(Number(playerData.rx))?Number(playerData.rx):player.x;player.ry=Number.isFinite(Number(playerData.ry))?Number(playerData.ry):player.y;
 world.encountering=false;return{world,player,partyTrail:cloneSerializable(source.partyTrail)??[],cameraData:cloneSerializable(source.cameraData)??null,paused:false,running:true,input:createInputState()}
}
function clearExpeditionSnapshot({saveNow=false}={}){if(expeditionSaveTimer){clearTimeout(expeditionSaveTimer);expeditionSaveTimer=null}save.state.expeditionSnapshot=null;normalizeEndgameState(save.state).emergency.pendingEncounter=null;if(saveNow)save.save()}
function queueExpeditionCheckpoint(){if(!save.state.player.inRun||!game?.running)return;if(expeditionSaveTimer)clearTimeout(expeditionSaveTimer);expeditionSaveTimer=setTimeout(()=>{expeditionSaveTimer=null;persistExpeditionSnapshot(expeditionSnapshotFromGame())},350)}
function currentSnapshot(){const result=expeditionSnapshotFromGame({halt:true});persistExpeditionSnapshot(result);return result}
window.addEventListener("pagehide",()=>{if(battle)saveBattleCheckpoint();else if(game?.running)persistExpeditionSnapshot(expeditionSnapshotFromGame())});
function animateExploreCombatPower(){
 const hud=document.getElementById("exploreCombatPower"),value=hud?.querySelector("[data-combat-power-value]"),deltaLabel=hud?.querySelector("[data-combat-power-delta]");
 if(!hud||!value)return;
 const target=Math.max(0,Math.round(Number(hud.dataset.power)||0)),previous=lastExploreCombatPower;
 lastExploreCombatPower=target;
 const start=previous==null?Math.max(0,target-Math.max(12,Math.round(target*.12))):previous;
 const delta=target-start;
 if(previous!=null&&delta&&deltaLabel){
  deltaLabel.hidden=false;
  deltaLabel.textContent=`${delta>0?"+":""}${delta.toLocaleString("ja-JP")}`;
  hud.classList.add(delta>0?"power-up":"power-down");
 }
 if(start===target){value.textContent=target.toLocaleString("ja-JP");return}
 const started=performance.now(),duration=650;
 const step=now=>{
  if(!value.isConnected)return;
  const progress=Math.min(1,(now-started)/duration),eased=1-Math.pow(1-progress,3);
  value.textContent=Math.round(start+(target-start)*eased).toLocaleString("ja-JP");
  if(progress<1)requestAnimationFrame(step);
 };
 requestAnimationFrame(step);
}
function returnConfirmationBody(){
 const floor=Math.max(1,Number(save.state.player.currentFloor)||1),run=save.state.manualReturn??save.state.returnReward??{},startFloor=Math.max(1,Number(run.startFloor)||Number(save.state.player.checkpoint)||floor),cleared=Math.max(0,floor-startFloor);
 return`<div class="return-confirm-v2">
  <div class="return-confirm-sigil">${pixelIcon("return")}</div>
  <small>MANUAL EXPEDITION</small>
  <h3>${floor.toLocaleString()}階から帰還しますか？</h3>
  <p>探索を終了し、今回のGOLDと装備を精算して拠点へ戻ります。</p>
  <div class="return-confirm-route"><span><small>出発地点</small><b>${startFloor}F</b></span><i></i><span><small>現在地点</small><b>${floor}F</b></span><strong>踏破 ${cleared}階</strong></div>
  <small class="return-confirm-note">現在階層の到達記録は残ります。帰還後は拠点から再出発できます。</small>
  <button type="button" class="return-cancel-button" data-return-cancel>探索を続ける</button>
 </div>`;
}
function countUpReturnValues(modal){
 modal?.querySelectorAll("[data-count-to]").forEach(node=>{
  const target=Math.max(0,Number(node.dataset.countTo)||0),suffix=node.dataset.countSuffix??"",started=performance.now(),duration=720;
  const step=now=>{if(!node.isConnected)return;const p=Math.min(1,(now-started)/duration),eased=1-Math.pow(1-p,3);node.textContent=`${Math.round(target*eased).toLocaleString()}${suffix}`;if(p<1)requestAnimationFrame(step)};
  requestAnimationFrame(step);
 });
}
function showManualReturnResult(result){
 const best=result.equipment.reduce((a,x)=>!a||(RARITY_ORDER[equipmentDisplayRarity(x.item)]??0)>(RARITY_ORDER[equipmentDisplayRarity(a.item)]??0)?x:a,null);
 const equipmentRows=result.equipment.length?result.equipment.map(({item,receipt})=>`<div class="return-reward-item rarity-${equipmentDisplayRarity(item)}"><span>${pixelIcon("equipment")}</span><div><b>[${equipmentDisplayRarity(item)}] ${item.name}</b><small>${receipt.message}</small></div></div>`).join(""):'<p class="muted return-no-drop">今回は装備ドロップなし</p>';
 const bestRarity=best?equipmentDisplayRarity(best.item):null;
 const highlight=best&&(RARITY_ORDER[bestRarity]??0)>=RARITY_ORDER.SSR?`<div class="return-reward-highlight rarity-${bestRarity}"><small>RARE DROP</small><strong>${bestRarity}</strong><span>${best.item.name}</span></div>`:"";
 const grade=returnRewardGrade(result.floorsCleared,result.equipment);
 const body=`<div class="return-reward-report return-reward-v2">
  <div class="return-result-embers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>${highlight}${returnGradeBadge(grade)}
  <div class="return-floor-progress"><header><span>${result.startFloor}F</span><small>踏破経路</small><strong>${result.endFloor}F</strong></header><i><u></u></i></div>
  <div class="return-result-summary">
   <article>${pixelIcon("dungeon")}<small>踏破階層</small><b data-count-to="${result.floorsCleared}" data-count-suffix="階">0階</b></article>
   <article>${pixelIcon("coin")}<small>獲得GOLD</small><b data-count-to="${result.gold}" data-count-suffix="G">0G</b></article>
   <article>${pixelIcon("equipment")}<small>装備獲得</small><b data-count-to="${result.equipment.length}" data-count-suffix="個">0個</b></article>
  </div>
  <h3>獲得装備</h3><div class="return-reward-items">${equipmentRows}</div>${returnRarityTable()}
 </div>`;
 app.insertAdjacentHTML("beforeend",Modal("探索帰還報告",body,"拠点へ戻る"));
 const modal=topModal();modal.classList.add("return-result-modal-v2");countUpReturnValues(modal);
 let closed=false,finish=()=>{if(closed)return;closed=true;modal?.remove();go("home")};
 modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish;
}
function openManualReturnConfirmation(){
 if(!game?.running)return;
 game.paused=true;app.insertAdjacentHTML("beforeend",Modal("帰還する",returnConfirmationBody(),"帰還して報酬を受け取る"));
 const modal=topModal();modal.classList.add("return-confirm-modal-v2");
 let settled=false;
 const cancel=()=>{if(settled)return;settled=true;modal?.remove();if(game)game.paused=false};
 modal._onDismiss=cancel;modal.querySelector("[data-return-cancel]")?.addEventListener("click",cancel);
 const primary=modal.querySelector("[data-modal-primary]");
 primary.onclick=()=>{
  if(settled)return;settled=true;primary.disabled=true;modal.querySelectorAll("button").forEach(button=>button.disabled=true);
  stopGame();snapshot=null;const result=claimManualReturn(save.state);save.state.player.inRun=false;clearExpeditionSnapshot();save.save();modal.remove();showManualReturnResult(result);
 };
}
function bindExplore(){
 ensureSecretRoomExpedition(save.state);recordBiomeFloor(save.state,save.state.player.currentFloor);save.save();
 explorationTexture("floor");explorationTexture("wall");explorationTexture("stairs");explorationTexture("props");
 if(shouldPlaySecondWorldIntro(save.state)){setTimeout(()=>playSecondWorldIntro(),80);return}
 animateExploreCombatPower();
 const canvas=document.getElementById("gameCanvas"),r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
 canvas.width=r.width*d;canvas.height=r.height*d;
 const mini=document.getElementById("miniMap");mini.width=132*d;mini.height=132*d;
 if(!snapshot)snapshot=hydrateExpeditionSnapshot(save.state.expeditionSnapshot);
 game=snapshot??{world:maze(),player:null,camera:null,paused:false,running:true,input:createInputState()};
 ensureExploreDecorations(game.world);
 game.input=createInputState();game.player??=new Entity(game.world.start.x,game.world.start.y);game.world.encountering=false;game.player.path=[];game.player.p=0;game.partyTrail=Array.isArray(game.partyTrail)&&game.partyTrail.length?game.partyTrail:[{x:game.player.rx??game.player.x,y:game.player.ry??game.player.y}];
 if(!Number.isFinite(game.player.x)||!Number.isFinite(game.player.y)){game.player.x=game.world.start.x;game.player.y=game.world.start.y}
 game.player.rx=game.player.x;game.player.ry=game.player.y;game.camera=new Camera(canvas);
 if(snapshot?.cameraData)Object.assign(game.camera,snapshot.cameraData);else game.camera.reset(game.player.x*TILE,game.player.y*TILE);
 game.camera.clamp(game.world);game.ctx=canvas.getContext("2d");game.running=true;game.paused=false;bindInput(canvas);game.last=performance.now();requestAnimationFrame(loop);
 const elapsed=document.querySelector("[data-explore-elapsed]");
 if(elapsed){
  const startedAt=Number(elapsed.dataset.startedAt)||Date.now(),tickElapsed=()=>{const seconds=Math.floor(Math.max(0,Date.now()-startedAt)/1000),hours=Math.floor(seconds/3600),minutes=Math.floor(seconds/60)%60,rest=seconds%60;elapsed.textContent=`${hours?`${String(hours).padStart(2,"0")}:`:""}${String(minutes).padStart(2,"0")}:${String(rest).padStart(2,"0")}`};
  tickElapsed();game.elapsedTimer=setInterval(tickElapsed,1000);
 }
 bindMovableMapToggle();bindExploreMonsterLongPress();showFloorTutorial();if(shouldPlayTenGodFirstContact(save.state)&&!game.world.treasureRoom)setTimeout(()=>playTenGodFirstContact(),300);else if(save.state.player.currentFloor>=1002&&!game.world.treasureRoom)setTimeout(()=>showSecondWorldRandomEvent(),260);if(game.world.treasureRoom&&!game.world.treasureNoticeShown){game.world.treasureNoticeShown=true;game.paused=true;setTimeout(()=>{pauseModal("💰 宝物庫を発見",`<p>部屋中に宝箱が並んでいる。</p><p class="muted">約半数は強力なミミック。鍵付きの箱には高レア装備が眠る。</p>`);},420)}
 document.getElementById("centerCamera").onclick=()=>{game.camera.reset(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world);queueExpeditionCheckpoint()};
 document.getElementById("pauseParty").onclick=()=>{snapshot=currentSnapshot();stopGame();formationOrigin="explore";go("formation")};
 document.getElementById("resourceHelp")?.addEventListener("click",openResourceHelp);
 document.querySelectorAll("[data-resource-help]").forEach(b=>b.addEventListener("click",openResourceHelp));
 document.getElementById("fieldEquipment").onclick=()=>{snapshot=currentSnapshot();stopGame();navigationOrigin="explore";go("equipment")};
 document.getElementById("pauseItems").onclick=openFieldItems;
 document.getElementById("returnHome").onclick=openManualReturnConfirmation;
}
function openResourceHelp(){
 const body=`<div class="dungeon-guide">
  <section><h3>探索の基本</h3><p>床をタップすると部隊が移動します。先頭の魔物に仲間が追従し、歩数に応じて敵と遭遇します。</p><p>階段へ到達すると次の階へ進みます。10階ごとの支配者を倒すまでは、その階の階段は封鎖されます。</p></section>
  <section><h3>明かりと発見</h3><p>暗所は部隊の周囲と燭台の灯りで確認できます。階段と燭台は遠くからでも見失わないよう表示されます。</p><p>樽・木箱・骨・魔晶石・水場は触れると調べられます。一度採取した物は、同じ探索中に再読込しても復活しません。</p></section>
  <section><h3>🚪 秘密の入口</h3><p>壁に設けられた入口だけが秘密の裏街へ通じます。見つけた入口には必ず入れますが、探索ごとに出現する階と場所が変わります。</p></section>
  <section><h3>地図と帰還</h3><p>ミニマップボタンと開いた地図は、長押しせずそのままドラッグして好きな位置へ移動できます。</p><p>帰還すると探索中のGOLD・装備などを確定します。帰還前にホームへ直接移動することはできません。</p></section>
  <section class="resource-help-list"><h3>資源</h3><p><b>${pixelIcon("coin")} GOLD</b><span>ショップ・装備・育成に使用</span></p><p><b>${pixelIcon("crystal")} 魔晶石</b><span>召喚・戦闘の記憶などに使用</span></p><p><b>${pixelIcon("capture")} 捕獲結晶</b><span>弱らせた魔物の捕獲に使用</span></p><p><b>${pixelIcon("key")} 深淵の鍵</b><span>鍵付き宝箱に使用</span></p></section>
 </div>`;
 app.insertAdjacentHTML("beforeend",Modal("ダンジョン案内",body,"閉じる"));
 topModalButton().onclick=closeTopModal;
}
const FLOOR_TUTORIALS={
 1:{title:"戦闘の基本",body:"まずは歩いて敵と遭遇しよう。『たたかう』『スキル』『ガード』を使い分け、スライムLv.1を倒して最初のレベルを上げよう。"},
 2:{title:"捕獲",body:"敵はHPを減らすほど捕獲しやすくなる。捕獲結晶には限りがあるので、欲しい相手を弱らせてから使おう。"},
 3:{title:"編成",body:"捕まえた仲間は『編成』から出撃できる。最大4体まで。倒れた仲間にはEXPが入らず、生存者へ再分配される。"},
 4:{title:"装備",body:"武器・防具・アクセで能力が変わる。『装備』の自動装備も使えるが、役割に合わせた手動調整も強力。"},
 5:{title:"複数の敵",body:"この階から敵が2体で現れることがある。敵をタップして攻撃対象を変更し、危険な相手から倒そう。"}
};
function showFloorTutorial(){
 const floor=save.state.player.currentFloor,tutorial=FLOOR_TUTORIALS[floor];
 if(!tutorial||save.state.settings.tutorialSeen?.[floor])return;
 // 表示予約の時点で保存する。戦闘後の探索画面再生成でも二重表示されない。
 save.state.settings.tutorialSeen??={};save.state.settings.tutorialSeen[floor]=true;save.save();
 game.paused=true;setTimeout(()=>{
  if(!game?.running)return;
  app.insertAdjacentHTML("beforeend",Modal(`${floor}階チュートリアル：${tutorial.title}`,`<p>${tutorial.body}</p><p class="muted">自動表示はこの1回だけです。設定の「チュートリアル一覧」からいつでも読み返せます。</p>`,`探索開始`));
  topModalButton().onclick=()=>{closeTopModal();if(game)game.paused=false}
 },120)
}
function openTutorialBook(){
 const rows=Object.entries(FLOOR_TUTORIALS).map(([floor,t])=>`<button class="tutorial-book-row" data-tutorial-floor="${floor}"><span>${floor}F</span><div><b>${t.title}</b><small>${t.body}</small></div><em>›</em></button>`).join("");
 app.insertAdjacentHTML("beforeend",Modal("📖 チュートリアル一覧",`<div class="tutorial-book">${rows}</div><p class="muted">ここで読み返しても、自動表示の状態は変更されません。</p>`,`閉じる`));
 const modal=topModal();modal.querySelectorAll("[data-tutorial-floor]").forEach(button=>button.onclick=()=>{const floor=button.dataset.tutorialFloor,t=FLOOR_TUTORIALS[floor];app.insertAdjacentHTML("beforeend",Modal(`${floor}階：${t.title}`,`<p>${t.body}</p>`,`一覧へ戻る`));topModalButton().onclick=closeTopModal});modal.querySelector("[data-modal-primary]").onclick=closeTopModal
}
function exploreMonsterDetail(id){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const sp=SPECIES[m.speciesId],st=calculatedStats(m),need=expNeed(m),remain=Math.max(0,need-m.exp),gear=Object.entries(m.equipment??{}).map(([slot,itemId])=>`${slotLabel(slot)}：${save.state.equipment.find(i=>i.id===itemId)?.name??"なし"}`).join("<br>");app.insertAdjacentHTML("beforeend",Modal(displayName(m),`<div class="explore-detail"><div class="modal-monster-hero">${monsterVisual(m,sp.emoji??"👹",{className:"modal-monster-visual"})}<p><b>Lv.${m.level}　★${m.stars}　+${m.plus}</b></p></div><p>HP ${m.currentHp??st.hp}/${st.hp}<br>MP ${m.currentMp??maxMp(m)}/${maxMp(m)}<br>ATK ${st.atk} / DEF ${st.def} / SPD ${st.spd}<br>会心 ${st.crit}% / 回避 ${st.evasion}%<br><b>${sp.race}族 / ${sp.role}</b><br>特性：${TRAITS[m.traitId]?.name??"安定"}（${TRAITS[m.traitId]?.description??""}）</p><p><b>EXP ${m.exp.toLocaleString()} / ${need.toLocaleString()}</b><br><small>次のレベルまであと ${remain.toLocaleString()}</small></p><p>${gear}</p><p><b>スキル</b><br>${learnedSkills(m).map(x=>`${x.name}（MP${x.mp}）`).join("<br>")||"なし"}</p></div>`,`閉じる`));topModalButton().onclick=()=>{const mods=document.querySelectorAll(".game-modal");mods[mods.length-1]?.remove()}}
function bindExploreMonsterLongPress(){document.querySelectorAll("[data-explore-monster]").forEach(el=>el.onclick=()=>{
 const id=el.dataset.exploreMonster;if(!save.state.monsters.some(monster=>monster.id===id))return;
 snapshot=currentSnapshot();stopGame();equipmentTarget=id;equipmentFocusItemId=null;navigationOrigin="explore";go("equipment");
})}
function bindMovableMapToggle(){
 const button=document.getElementById("miniMapToggle"),map=document.getElementById("miniMap");if(!button||!map)return;
 const stage=button.closest(".explore-stage");if(!stage)return;
 stage.append(button,map);
 const clampPosition=(element,position,fallback)=>{
  const stageRect=stage.getBoundingClientRect(),rect=element.getBoundingClientRect(),source=position&&Number.isFinite(position.x)&&Number.isFinite(position.y)?position:fallback;
  return{x:Math.max(4,Math.min(stageRect.width-rect.width-4,source.x)),y:Math.max(4,Math.min(stageRect.height-rect.height-4,source.y))};
 };
 const place=(element,position,fallback)=>{const next=clampPosition(element,position,fallback);element.style.setProperty("left",`${next.x}px`,"important");element.style.setProperty("top",`${next.y}px`,"important");element.style.setProperty("right","auto","important");element.style.setProperty("bottom","auto","important");element.style.setProperty("transform","none","important");return next};
 const bindDrag=(element,settingKey,fallback,{onTap=null}={})=>{
  let suppressClick=false;
  requestAnimationFrame(()=>place(element,save.state.settings[settingKey],fallback));
  element.addEventListener("pointerdown",event=>{
   if(event.button!=null&&event.button!==0)return;
   event.preventDefault();event.stopPropagation();element.setPointerCapture?.(event.pointerId);
   const start={x:event.clientX,y:event.clientY},origin=place(element,save.state.settings[settingKey],fallback);let moved=false,last={...start};
   const move=moveEvent=>{last={x:moveEvent.clientX,y:moveEvent.clientY};const dx=last.x-start.x,dy=last.y-start.y;if(Math.hypot(dx,dy)>5)moved=true;place(element,{x:origin.x+dx,y:origin.y+dy},fallback)};
   const finish=upEvent=>{element.removeEventListener("pointermove",move);element.removeEventListener("pointerup",finish);element.removeEventListener("pointercancel",finish);if(Number.isFinite(upEvent.clientX)&&Number.isFinite(upEvent.clientY))last={x:upEvent.clientX,y:upEvent.clientY};const final=place(element,{x:origin.x+last.x-start.x,y:origin.y+last.y-start.y},fallback);if(moved){save.state.settings[settingKey]=final;save.save();suppressClick=true;setTimeout(()=>suppressClick=false,0)}else if(upEvent.type!=="pointercancel")onTap?.()};
   element.addEventListener("pointermove",move);element.addEventListener("pointerup",finish);element.addEventListener("pointercancel",finish);
  });
  element.addEventListener("click",event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation()}},true);
 };
 const sync=()=>{const visible=save.state.settings.minimapVisible!==false;map.classList.toggle("visible",visible);button.classList.toggle("active",visible);button.setAttribute("aria-pressed",String(visible));if(visible)requestAnimationFrame(()=>place(map,save.state.settings.minimapPanelPosition,{x:Math.max(8,stage.clientWidth-208),y:10}))};
 sync();
 bindDrag(button,"mapTogglePosition",{x:Math.max(8,stage.clientWidth-72),y:Math.max(8,stage.clientHeight*.48-29)},{onTap:()=>{save.state.settings.minimapVisible=save.state.settings.minimapVisible===false;save.save();sync()}});
 bindDrag(map,"minimapPanelPosition",{x:Math.max(8,stage.clientWidth-208),y:10});
}
function itemCount(type){return save.state.inventory[type]??0}
function openFieldItems(){
 if(!game?.running)return;
 snapshot=currentSnapshot();stopGame();inventoryNavigationOrigin="explore";inventoryCategory="consumable";go("inventory");
}
function clearAilments(m){m.statuses=[];m.status=null;m.ailments=[];if(battle?.party?.some(monster=>monster.id===m.id))clearPersistentAilments(battle,m.id)}
function scaledRecovery(base,max,rate){return Math.max(1,Math.floor(base+max*rate))}
function useFieldItem(type,targetId){if(itemCount(type)<=0)return;const target=save.state.monsters.find(m=>m.id===targetId),party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean),single=["potions","highPotions","manaPotions","highManaPotions","fullManaPotions","statusCures","fullHeals"].includes(type);if(single&&!target)return;const list=single?[target]:party;if(single&&target.currentHp<=0)return alert("戦闘不能の仲間には使用できません");const hasAilment=m=>(m.statuses?.length??0)||(m.ailments?.length??0)||m.status;const usable=["potions","highPotions"].includes(type)?target.currentHp<calculatedStats(target).hp:type==="partyPotions"?list.some(m=>m.currentHp>0&&m.currentHp<calculatedStats(m).hp):["manaPotions","highManaPotions","fullManaPotions"].includes(type)?target.currentMp<maxMp(target):["partyManaPotions","partyFullManaPotions"].includes(type)?list.some(m=>m.currentHp>0&&m.currentMp<maxMp(m)):type==="statusCures"?hasAilment(target):type==="partyStatusCures"?list.some(hasAilment):type==="fullHeals"?(target.currentHp<calculatedStats(target).hp||target.currentMp<maxMp(target)||hasAilment(target)):list.some(m=>m.currentHp>0&&(m.currentHp<calculatedStats(m).hp||m.currentMp<maxMp(m)||hasAilment(m)));if(!usable)return alert("もう元気だよ！");if(type==="potions"){const max=calculatedStats(target).hp;target.currentHp=Math.min(max,target.currentHp+scaledRecovery(100,max,.10))}if(type==="highPotions"){const max=calculatedStats(target).hp;target.currentHp=Math.min(max,target.currentHp+scaledRecovery(300,max,.25))}if(type==="partyPotions")list.filter(m=>m.currentHp>0).forEach(m=>{const max=calculatedStats(m).hp;m.currentHp=Math.min(max,m.currentHp+scaledRecovery(50,max,.07))});if(type==="manaPotions"){const max=maxMp(target);target.currentMp=Math.min(max,target.currentMp+scaledRecovery(30,max,.10))}if(type==="highManaPotions"){const max=maxMp(target);target.currentMp=Math.min(max,target.currentMp+scaledRecovery(100,max,.25))}if(type==="partyManaPotions")list.filter(m=>m.currentHp>0).forEach(m=>{const max=maxMp(m);m.currentMp=Math.min(max,m.currentMp+scaledRecovery(30,max,.07))});if(type==="fullManaPotions")target.currentMp=maxMp(target);if(type==="partyFullManaPotions")list.filter(m=>m.currentHp>0).forEach(m=>m.currentMp=maxMp(m));if(type==="statusCures"||type==="partyStatusCures")list.forEach(clearAilments);if(type==="fullHeals"||type==="partyFullHeals")list.filter(m=>m.currentHp>0).forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)});save.state.inventory[type]--;save.save();closeTopModal();snapshot=currentSnapshot();stopGame();render()}
function openPartyEditor(){game.paused=true;app.insertAdjacentHTML("beforeend",Modal("フィールド編成",partyEditorBody("field"),"閉じる"));const modal=topModal();modal.dataset.partyEditorMode="field";bindPartyEditor(modal);const close=()=>{modal.remove();snapshot=currentSnapshot();stopGame();render()};modal._onDismiss=close;modal.querySelector("[data-modal-primary]").onclick=close}
function enemyLevelForFloor(floor){const band=Math.floor((floor-1)/10),base=band*10+1,jumps=[0,0,1,2,3,5,7,9],variance=jumps[Math.floor(Math.random()*jumps.length)]-(Math.random()<.28?Math.floor(Math.random()*4):0),milestone=floor%50===1&&floor>1?8:floor%25===1&&floor>1?4:0;return Math.max(1,base+Math.floor((floor-1)%10*.58)+variance+milestone)}
function speciesPoolForFloor(floor){
 const biome=biomeForFloor(floor);
 const unlocked=Object.values(SPECIES).filter(species=>species.fieldEncounter!==false&&(species.minFloor??1)<=floor).sort((a,b)=>(a.minFloor??1)-(b.minFloor??1));
 if(!unlocked.length)return[SPECIES.slime];
 const nearby=unlocked.filter(species=>(species.minFloor??1)>=Math.max(1,floor-300));
 const candidates=nearby.length>=8?nearby:unlocked.slice(-24);
 const weights={N:18,R:12,SR:7,SSR:4,UR:2,LR:1};
 return candidates.flatMap(species=>{
  const rarityWeight=weights[species.rarity]??1,biomeWeight=biome.elements.includes(species.element)?2:1;
  return Array.from({length:rarityWeight*biomeWeight},()=>species);
 });
}
function randomEnemy(){const floor=save.state.player.currentFloor;if(floor===1)return{speciesId:"slime",level:1,boss:false,equipped:false,gear:null};const rareEncounterRate=(save.state.party??[]).map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean).reduce((sum,monster)=>sum+seriesEffectValue(monster,"rareEncounter",.5),0);if(floor>=2&&Math.random()<Math.min(.03,.006*(1+rareEncounterRate)))return{speciesId:"baby_slime",level:Math.max(1,enemyLevelForFloor(floor)),boss:false,equipped:false,gear:null,rareExp:true};const pool=speciesPoolForFloor(floor).filter(s=>s.id!=="baby_slime"),picked=pool[Math.floor(Math.random()*pool.length)],speciesId=picked.id,equipped=floor>=6&&Math.random()<.11,gear=equipped?createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)]):null;return{speciesId,level:enemyLevelForFloor(floor),boss:false,equipped,gear}}
function randomEnemyGroup(){const floor=save.state.player.currentFloor;if(floor<=4)return[randomEnemy()];let count=1,r=Math.random();if(floor<10){if(r<.12)count=2}else if(floor<50){if(r<.03)count=3;else if(r<.25)count=2}else{if(r<.08)count=3;else if(r<.35)count=2}const group=Array.from({length:count},randomEnemy);if(group.length===1&&shouldSpawnSecondWorldElite(floor))group[0]=createEliteEncounter(group[0],floor);return group}
function floorBossEnemy(){const floor=save.state.player.currentFloor;if(floor>=WORLD_MAX_FLOOR){const finalBoss=ENDGAME_BOSSES.ten_divinity;return{speciesId:finalBoss.speciesId,level:Math.max(14,bossLevelForFloor(floor)),boss:true,endgameBossId:"ten_divinity",visualSpeciesId:"ten_divinity",faction:"tenGod",nameOverride:`${finalBoss.name}〈真なる顕現〉`,powerRate:1,manifestationLabel:"真なる顕現",uncapturable:true,elementMultipliers:finalBoss.elementMultipliers,statusProfile:finalBoss.statusProfile}}const pool=speciesPoolForFloor(Math.max(floor,10)).filter(s=>s.minFloor<=floor);const speciesId=(pool[Math.floor(seeded(floorSeed(floor)+991)()*pool.length)]??SPECIES.slime).id;return{speciesId,level:Math.max(14,bossLevelForFloor(floor)),boss:true}}
function openFloorBossChallenge(bossInfo,floor){
 const species=SPECIES[bossInfo.speciesId]??SPECIES.slime,endgame=bossInfo.endgameBossId?ENDGAME_BOSSES[bossInfo.endgameBossId]:null,name=bossInfo.nameOverride??endgame?.name??species.name,quote=endgame?.encounterText??["ここより先へ進む資格を、その力で示せ。","幾度挑もうと構わぬ。深淵は覚悟だけを量る。","この階層を越えるなら、恐れごと剣に変えてみせろ。"][Math.floor(Math.random()*3)],preview=createMonster(bossInfo.speciesId,{level:bossInfo.level,stars:5,rank:4}),partyPower=partyCombatPower(save.state),bossPower=Math.max(1,Math.round(monsterCombatPower(preview)*(bossInfo.statMultiplier??(1.45+Math.min(2,floor/700))))),tone=endgame?.faction==="tenGod"?"divine":endgame?.faction==="abyss"?"abyss":"floor";
 app.insertAdjacentHTML("beforeend",Modal("FLOOR BOSS",`<div class="floor-boss-challenge-v3 tone-${tone}"><div class="boss-chain-frame" aria-hidden="true"><i></i><i></i></div><div class="boss-crest-v3"><span>FLOOR</span><strong>${floor}</strong><em>DOMINATOR</em></div><div class="boss-visual-stage-v3"><div class="boss-fog-v3"></div>${monsterVisual({...bossInfo,visualSpeciesId:bossInfo.endgameBossId},species.emoji??"BOSS",{className:"floor-boss-monster-visual-v3"})}</div><small>${endgame?.title??`第${floor}階層の支配者`}</small><h2>${name}</h2><b>Lv.${bossInfo.level}</b><blockquote>${quote}</blockquote><div class="boss-power-versus-v3"><span><small>PARTY POWER</small><b>${formatCombatPower(partyPower)}</b></span><i>VS</i><span><small>BOSS POWER</small><b>${formatCombatPower(bossPower)}</b></span></div><button type="button" class="boss-retreat-v3" data-boss-retreat>いったん退く</button></div>`,"支配者へ挑む"));
 const modal=topModal();modal.classList.add("floor-boss-modal-v3");const retreat=()=>{modal.remove();if(game)game.paused=false};modal._onDismiss=retreat;modal.querySelector("[data-boss-retreat]").onclick=retreat;modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();if(game)game.paused=false;beginEncounter(bossInfo)};
}
function loop(now){
 if(!game?.running)return;
 const dt=Math.min(.05,(now-game.last)/1000||0);game.last=now;
 if(!game.paused)update(dt);
 if(!game?.running)return;
 draw();
 requestAnimationFrame(loop)
}
async function beginEncounter(enemyOverride=null){
 if(!game?.running||game.world.encountering)return;
 game.world.encountering=true;
 game.player.path=[];
 game.paused=true;
 const emergency=!enemyOverride&&shouldTriggerEmergency(save.state,game.world.steps),encounterEnemies=enemyOverride?(Array.isArray(enemyOverride)?enemyOverride:[enemyOverride]):emergency?[]:randomEnemyGroup(),bossTone=emergency||encounterEnemies.some(enemy=>enemy?.boss),eliteTone=!bossTone&&encounterEnemies.some(enemy=>enemy?.elite||enemy?.forcedElite),tone=bossTone?"boss":eliteTone?"elite":"normal";
 if(emergency){const pending=normalizeEndgameState(save.state).emergency.pendingEncounter;if(pending&&!pending.priorVitals)pending.priorVitals=capturePartyVitals();save.save()}
 const canvas=document.getElementById("gameCanvas");
 const stage=document.querySelector(".explore-stage");
 if(canvas)canvas.classList.add("encounter-shake");
 const fx=document.createElement("div");
 fx.className=`encounter-transition encounter-${tone}`;
 fx.innerHTML='<div class="encounter-mist"></div><div class="encounter-vignette"></div><div class="encounter-sparks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="encounter-slashes" aria-hidden="true"><i></i><i></i></div><div class="encounter-warning"><small>ABYSS ENCOUNTER</small><strong>敵影接近</strong><em></em></div><div class="encounter-curtain left"></div><div class="encounter-curtain right"></div>';
 (stage??document.body).appendChild(fx);
 requestAnimationFrame(()=>fx.classList.add("is-awake"));
 await wait(180);fx.classList.add("is-struck");
 await wait(390);fx.classList.add("is-closing");
 await wait(280);
 if(!game)return;
 if(emergency){fx.remove();game.world.encountering=false;game.paused=true;triggerEmergencyEncounter();return}
 activeEnemy=encounterEnemies;
 snapshot=currentSnapshot();
 stopGame();
 startBattle(activeEnemy);
 setTimeout(()=>fx.remove(),240)
}
const EXPLORE_INTERACTIVE_DECORATIONS=new Set(["barrel","crate","bones","crystal","water"]);
function exploreDecorationAt(x,y){
 return ensureExploreDecorations(game?.world).find(entry=>entry.x===x&&entry.y===y&&EXPLORE_INTERACTIVE_DECORATIONS.has(entry.type)&&!entry.destroyed)??null
}
function refreshExplorePartyHud(){
 if(screen!=="explore")return;
 explorationPartyMembers().forEach(monster=>{
  const card=document.querySelector(`[data-explore-hud-id="${monster.id}"]`);
  if(!card)return;
  const stats=calculatedStats(monster),hp=Math.max(0,Math.min(stats.hp,monster.currentHp??stats.hp)),monsterMp=maxMp(monster),mp=Math.max(0,Math.min(monsterMp,monster.currentMp??monsterMp));
  const hpFill=card.querySelector("[data-hud-hp-fill]"),mpFill=card.querySelector("[data-hud-mp-fill]");
  if(hpFill)hpFill.style.width=`${Math.min(100,hp/Math.max(1,stats.hp)*100)}%`;
  if(mpFill)mpFill.style.width=`${Math.min(100,mp/Math.max(1,monsterMp)*100)}%`;
  const hpLabel=card.querySelector("[data-hud-hp-label]"),mpLabel=card.querySelector("[data-hud-mp-label]");
  if(hpLabel)hpLabel.textContent=`HP ${Math.round(hp)}/${stats.hp}`;
  if(mpLabel)mpLabel.textContent=`MP ${Math.round(mp)}/${monsterMp}`;
 })
}
function refreshExploreResourceHud(){
 const compact=value=>{const number=Math.max(0,Number(value)||0);if(number>=1e9)return`${Number((number/1e9).toFixed(1))}B`;if(number>=1e6)return`${Number((number/1e6).toFixed(1))}M`;if(number>=1e4)return`${Number((number/1e3).toFixed(1))}K`;return Math.floor(number).toLocaleString()};
 const values={goldHud:save.state.player.gold,crystalHud:save.state.player.crystals,captureHud:save.state.inventory?.captureCrystals,keyHud:save.state.inventory?.abyssKeys};
 for(const[id,value]of Object.entries(values)){const node=document.getElementById(id);if(node)node.textContent=compact(value)}
}
function explorationPartyTiles(){
 if(!game?.player)return[];
 return explorationPartyMembers().map((_,index)=>{
  const position=index===0?{x:game.player.rx,y:game.player.ry}:explorationFollowerPosition(index);
  return{x:Math.round(position.x),y:Math.round(position.y)}
 })
}
function partyOverlapsExploreObject(){
 if(!game?.world)return false;
 const objectKeys=new Set([
  ...(game.world.chests??[]).filter(entry=>!entry.open).map(entry=>`${entry.x}:${entry.y}`),
  ...ensureExploreDecorations(game.world).filter(entry=>!entry.destroyed).map(entry=>`${entry.x}:${entry.y}`),
  game.world.exit?`${game.world.exit.x}:${game.world.exit.y}`:"",
  game.world.shop?`${game.world.shop.x}:${game.world.shop.y}`:"",
  game.world.boss?`${game.world.boss.x}:${game.world.boss.y}`:""
 ].filter(Boolean));
 return explorationPartyTiles().some(position=>objectKeys.has(`${position.x}:${position.y}`))
}
function interactExploreDecoration(decoration){
 if(!decoration||decoration.used||decoration.destroyed||!EXPLORE_INTERACTIVE_DECORATIONS.has(decoration.type))return false;
 const floor=save.state.player.currentFloor,roll=Math.random();
 let message="";
 if(decoration.type==="barrel"||decoration.type==="crate"){
  decoration.destroyed=true;decoration.used=true;
  if(roll<.34){
   const gold=modifiedGoldReward(save.state,Math.max(8,Math.round(chestGoldBase(floor)*(.07+Math.random()*.05))),"exploration");
   save.state.player.gold+=gold;message=`${gold.toLocaleString()}Gを拾った`;
  }else if(roll<.48){
   save.state.inventory.potions=(save.state.inventory.potions??0)+1;message="回復薬を拾った";
  }else if(roll<.53){
   save.state.player.crystals=(save.state.player.crystals??0)+1;message="魔晶石を1個拾った";
  }else message=decoration.type==="barrel"?"樽を壊したが、中は空だった":"木箱を壊したが、中は空だった";
 }else if(decoration.type==="bones"){
  decoration.destroyed=true;decoration.used=true;
  if(roll<.24){
   const gold=modifiedGoldReward(save.state,Math.max(5,Math.round(chestGoldBase(floor)*.045)),"exploration");
   save.state.player.gold+=gold;message=`古い硬貨 ${gold.toLocaleString()}Gを拾った`;
  }else if(roll<.28){
   save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+1;message="深淵の鍵を1個拾った";
  }
 }else if(decoration.type==="crystal"){
  decoration.used=true;
  const amount=roll<.08?2:1;
  save.state.player.crystals=(save.state.player.crystals??0)+amount;message=`魔晶石を${amount}個採取した`;
 }else if(decoration.type==="water"){
  decoration.used=true;
  let recovered=0;
  explorationPartyMembers().forEach(monster=>{
   const hpMax=calculatedStats(monster).hp,mpMax=maxMp(monster),beforeHp=monster.currentHp??hpMax,beforeMp=monster.currentMp??mpMax;
   if(beforeHp>0){
    monster.currentHp=Math.min(hpMax,beforeHp+Math.max(1,Math.round(hpMax*WATER_RULES.hpRecoveryRate)));
    monster.currentMp=Math.min(mpMax,beforeMp+Math.max(1,Math.round(mpMax*WATER_RULES.mpRecoveryRate)));
    recovered+=monster.currentHp-beforeHp+monster.currentMp-beforeMp;
   }
  });
  if(recovered>0)message="石枠の水場で生存中の部隊のHP・MPが2%回復した";
 }
 persistExploreDecorationState(decoration,floor);
 persistExpeditionSnapshot(expeditionSnapshotFromGame(),{saveNow:false});
 save.save();
 refreshExploreResourceHud();
 refreshExplorePartyHud();
 if(message)showToast(message);
 return true
}
function update(dt){
 if(game.world.encountering)return;
 if(game.player.move(dt,7.5)){
  game.world.steps++;
  queueExpeditionCheckpoint();
  for(const c of game.world.chests)if(!c.open&&c.x===game.player.x&&c.y===game.player.y){openChest(c);return}
  const decoration=exploreDecorationAt(game.player.x,game.player.y);
  if(decoration&&!decoration.used&&interactExploreDecoration(decoration)){
   game.world.nextEncounter=Math.max(game.world.nextEncounter??0,game.world.steps+2)
  }
  if(game.world.boss&&game.player.x===game.world.boss.x&&game.player.y===game.world.boss.y){
   game.player.path=[];game.paused=true;openFloorBossChallenge(floorBossEnemy(),save.state.player.currentFloor);return
  }
  if(game.world.shop&&game.player.x===game.world.shop.x&&game.player.y===game.world.shop.y){
   stopGame();
   snapshot=currentSnapshot();
   enterSecretRoom(save.state,game.world.shop.roomId??`${save.state.secretRooms?.run?.id??"run"}:${save.state.player.currentFloor}`,save.state.player.currentFloor);
   save.save();screen="shop";render();return
  }
  if(game.player.x===game.world.exit.x&&game.player.y===game.world.exit.y){
   if(save.state.player.currentFloor%10===0&&game.world.boss){
    game.player.path=[];game.paused=true;app.insertAdjacentHTML("beforeend",Modal("まだ先へは進めない","<p>この階層の支配者が道を封じている。</p>","戻る"));const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();game.paused=false};return
   }
   if(save.state.player.currentFloor>=WORLD_MAX_FLOOR){game.player.path=[];game.paused=true;const cleared=Boolean(save.state.flags?.ending10000Played);app.insertAdjacentHTML("beforeend",Modal(cleared?"10000階・世界の底":"10000階・最後の境界",cleared?"<p>真なる深淵は、あなたの領域となった。</p><p class=\"muted\">ここからは育成・装備厳選・十神との再戦を続けられます。</p>":"<p>最後の境界は、まだ閉ざされている。</p><p class=\"muted\">この階層の支配者を倒してください。</p>","探索を続ける"));const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();game.paused=false};return}
   stopGame();snapshot=null;clearExpeditionSnapshot();save.state.player.currentFloor++;
   recordManualFloorClear(save.state,save.state.player.currentFloor);
   save.state.player.maxFloor=Math.min(WORLD_MAX_FLOOR,Math.max(save.state.player.maxFloor,save.state.player.currentFloor));
   save.save();if(save.state.player.currentFloor===1001){playSecondWorldIntro();return}go("explore");return
  }
  if(game.world.steps>=game.world.nextEncounter){
   if(partyOverlapsExploreObject()){
    game.world.nextEncounter=game.world.steps+2;
    return
   }
   game.world.steps=0;
   game.world.nextEncounter=8+Math.floor(Math.random()*24);
   beginEncounter();return
  }
 }
 updateExplorationPartyTrail();
 game.camera.follow(game.player.rx*TILE,game.player.ry*TILE);
 game.camera.clamp(game.world)
}
function openChest(c){
 const floor=save.state.player.currentFloor;
 if(c.locked&&(save.state.inventory.abyssKeys??0)<=0){game.player.path=[];return pauseModal("🔒 鍵付き宝箱",'<p>深淵の鍵が必要だ。</p><p class="muted">鍵は強敵やごく稀な敵ドロップから入手できます。</p>')}
 if(c.locked)save.state.inventory.abyssKeys--;
 c.open=true;save.state.player.openedChests[floor]??=[];
 if(!save.state.player.openedChests[floor].includes(c.id))save.state.player.openedChests[floor].push(c.id);
 recordBiomeChest(save.state,floor,c.id);save.state.records.chests++;
 if(c.mimic){save.save();game.player.path=[];pauseModal("！？","<p>宝箱が牙を剥いた！</p>");setTimeout(()=>{closeTopModal();game.paused=false;beginEncounter({speciesId:"mimic",level:Math.max(enemyLevelForFloor(floor)+12,Math.round(floor*1.5)),boss:false,equipped:true,gear:createEquipment("accessory",{rarity:"SR"})})},650);return}
 let title="宝箱",body="";
 if(c.kind==="apple"){save.state.inventory.potions++;title="🪎 深淵の果実";body="回復薬を1個獲得"}
 else if(c.kind==="box"){
  if(Math.random()<.5){const gold=modifiedGoldReward(save.state,chestGoldBase(floor),"exploration");save.state.player.gold+=gold;body=`${gold.toLocaleString()}Gを獲得`}
  else{const item=createEquipment("weapon"),receipt=equipmentReceipt(item);body=equipmentReceiptText(receipt)}
 }else{
  const luck=abyssEquipmentRarityBonus(save.state),rarity=c.locked?(Math.random()<Math.min(.75,.25+luck*.05)?"LR":"SSR"):c.kind==="radiant"?(Math.random()<Math.min(.85,.35+luck*.05)?"LR":"SSR"):(Math.random()<Math.min(.90,.35+luck*.05)?"SSR":"SR"),item=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)],{rarity}),receipt=equipmentReceipt(item);
  title=c.locked?"🔓 鍵付き宝箱":c.kind==="radiant"?"✨ 輝く宝箱":"🗃️ 古い収納箱";body=`${equipmentReceiptText(receipt)}<br>${Object.entries(item.stats).map(([k,v])=>`${equipmentStatLabel(k)}+${v}`).join(" / ")}`
 }
 save.save();pauseModal(title,body)
}
function explorationPartyMembers(){return(save.state.party??[]).map(id=>save.state.monsters?.find(monster=>monster.id===id)).filter(Boolean)}
const explorationSpriteCache=new Map();
const explorationTextureCache=new Map();
const EXPLORE_TEXTURE_URLS={
 floor:"assets/ui/explore/dungeon-floor.png?v=1.7.6-cachefix",
 wall:"assets/ui/explore/dungeon-wall.png?v=1.7.6-cachefix",
 stairs:"assets/ui/explore/dungeon-stairs-arch.png?v=1.7.6-cachefix",
 props:"assets/ui/explore/dungeon-props-atlas.png?v=1.7.6-cachefix"
};
const EXPLORE_ATLAS=Object.freeze({
 floor:0,wall:1,corner:2,pillar:3,entrance:4,chestClosed:5,chestOpen:6,barrel:7,
 crate:8,bones:9,candelabrum1:10,candelabrum2:11,crystal1:12,crystal2:13,crystal3:14,water:15
});
const EXPLORE_BAND_THEMES=Object.freeze([
 {floor:"#7c6b5030",wall:"#221b1838",line:"#a8875060",light:"#f3b75b",dark:"rgba(3,5,9,.37)"},
 {floor:"#4c756333",wall:"#14251f4d",line:"#74a88455",light:"#8ee6a0",dark:"rgba(2,9,8,.40)"},
 {floor:"#98504430",wall:"#32151252",line:"#d06b4e55",light:"#ff8b59",dark:"rgba(12,3,3,.41)"},
 {floor:"#436d9136",wall:"#111f304f",line:"#74b6dc5c",light:"#7cddff",dark:"rgba(2,7,15,.42)"},
 {floor:"#71489638",wall:"#24103652",line:"#aa72dd5e",light:"#c278ff",dark:"rgba(7,2,13,.44)"},
 {floor:"#8b394332",wall:"#2c0e174f",line:"#c755675c",light:"#ff6f82",dark:"rgba(12,2,6,.45)"},
 {floor:"#9b855133",wall:"#332b1948",line:"#e7c97662",light:"#ffe08a",dark:"rgba(7,6,3,.36)"},
 {floor:"#4e467e3b",wall:"#12102b55",line:"#8176c65f",light:"#9c8dff",dark:"rgba(2,1,12,.48)"}
]);
function exploreBandTheme(floor){return EXPLORE_BAND_THEMES[Math.floor((Math.max(1,floor)-1)/50)%EXPLORE_BAND_THEMES.length]}
function explorationTexture(kind){
 const url=EXPLORE_TEXTURE_URLS[kind];if(!url)return null;
 let entry=explorationTextureCache.get(url);
 if(!entry){const image=new Image();entry={image,ready:false,failed:false};explorationTextureCache.set(url,entry);image.onload=()=>entry.ready=true;image.onerror=()=>entry.failed=true;image.decoding="async";image.src=url}
 return entry.ready&&!entry.failed?entry.image:null;
}
function explorationSpriteImage(monster,frame){
 const url=monsterSpriteUrl(monster,frame);if(!url)return null;
 let entry=explorationSpriteCache.get(url);
 if(!entry){
  const image=new Image();entry={image,ready:false,failed:false};explorationSpriteCache.set(url,entry);
  image.onload=()=>entry.ready=true;image.onerror=()=>entry.failed=true;image.decoding="async";image.src=url;
 }
 return entry.ready&&!entry.failed?entry.image:null;
}
function updateExplorationPartyTrail(){
 if(!game?.player)return;
 const point={x:game.player.rx,y:game.player.ry};
 game.partyTrail??=[point];
 const latest=game.partyTrail[0];
 if(!latest||Math.hypot(point.x-latest.x,point.y-latest.y)>=.025)game.partyTrail.unshift(point);
 if(game.partyTrail.length>260)game.partyTrail.length=260
}
function explorationFollowerPosition(index){
 const spacing=2.25*index,trail=game.partyTrail??[],fallback={x:game.player.rx,y:game.player.ry};
 if(trail.length<2){
  const standby=[null,{x:-1.15,y:.78},{x:1.15,y:.78},{x:0,y:1.72}][index]??{x:0,y:index*.8};
  return{x:fallback.x+standby.x,y:fallback.y+standby.y}
 }
 let remaining=spacing;
 for(let i=0;i<trail.length-1;i++){
  const a=trail[i],b=trail[i+1],segment=Math.hypot(b.x-a.x,b.y-a.y);
  if(segment>=remaining){const ratio=segment?remaining/segment:0;return{x:a.x+(b.x-a.x)*ratio,y:a.y+(b.y-a.y)*ratio}}
  remaining-=segment
 }
 const tail=trail[trail.length-1]??fallback,prior=trail[trail.length-2]??tail,segment=Math.hypot(tail.x-prior.x,tail.y-prior.y);
 if(segment>.001)return{x:tail.x+(tail.x-prior.x)/segment*remaining,y:tail.y+(tail.y-prior.y)/segment*remaining};
 return tail
}
function drawExplorationMonster(position,monster,glow=false,scale=1,index=0){
 const moving=Boolean(game.player.path?.length)||Math.abs((game.player.rx??game.player.x)-game.player.x)>.01||Math.abs((game.player.ry??game.player.y)-game.player.y)>.01;
 const idleFrames=["idle1","idle2","idle3","idle2"],walkFrames=["walk1","idle1","walk2","idle1"],sequence=moving?walkFrames:idleFrames;
 const frame=sequence[Math.floor(performance.now()/(moving?170:320)+index)%sequence.length];
 const image=explorationSpriteImage(monster,frame);
 if(!image){
  const species=SPECIES[monster.speciesId]??{},elementColor={fire:"#ff725e",water:"#61bfff",earth:"#c9995d",wind:"#7ee0b0",light:"#ffe082",dark:"#a57ad9",thunder:"#e6d65d",ice:"#a9e8ff",poison:"#9ad65f"}[species.element]??"#b79bd2";
  const p=game.camera.world(position.x*TILE,position.y*TILE),tileSize=TILE*game.camera.z,cx=p.x+tileSize/2,cy=p.y+tileSize*.75,size=Math.max(13,26*game.camera.z*scale);
  game.ctx.save();game.ctx.imageSmoothingEnabled=false;
  if(glow){game.ctx.shadowColor=elementColor;game.ctx.shadowBlur=16}
  game.ctx.fillStyle="#08070d";game.ctx.strokeStyle=elementColor;game.ctx.lineWidth=Math.max(2,game.camera.z*2);
  game.ctx.beginPath();game.ctx.moveTo(cx,cy-size*.72);game.ctx.lineTo(cx+size*.62,cy);game.ctx.lineTo(cx,cy+size*.45);game.ctx.lineTo(cx-size*.62,cy);game.ctx.closePath();game.ctx.fill();game.ctx.stroke();
  game.ctx.fillStyle=elementColor;game.ctx.globalAlpha=.8;game.ctx.fillRect(cx-size*.18,cy-size*.08,size*.36,Math.max(2,size*.12));game.ctx.restore();return
 }
 const p=game.camera.world(position.x*TILE,position.y*TILE),pixelScale=game.camera.z*2.65*scale,contactX=p.x+TILE*game.camera.z/2,contactY=p.y+TILE*game.camera.z*.9;
 game.ctx.save();game.ctx.imageSmoothingEnabled=false;
 if(glow){game.ctx.shadowColor="#ffe36f";game.ctx.shadowBlur=18}
 game.ctx.drawImage(image,contactX-32*pixelScale,contactY-56*pixelScale,64*pixelScale,64*pixelScale);
 game.ctx.restore();
}
function drawExplorationTileAsset(position,image,scale=1.45){
 if(!image)return false;
 const p=game.camera.world(position.x*TILE,position.y*TILE),tileSize=TILE*game.camera.z,size=tileSize*scale;
 game.ctx.save();game.ctx.imageSmoothingEnabled=false;game.ctx.shadowColor="#000";game.ctx.shadowBlur=8*game.camera.z;
 game.ctx.drawImage(image,p.x+(tileSize-size)/2,p.y+(tileSize-size)/2,size,size);
 game.ctx.restore();return true;
}
function drawExploreAtlas(position,index,{scale=1.25,rotation=0,alpha=1,shadowColor=null,shadowBlur=0,offsetY=0}={}){
 const image=explorationTexture("props");if(!image)return false;
 const cellWidth=image.width/4,cellHeight=image.height/4,column=index%4,row=Math.floor(index/4);
 const p=game.camera.world(position.x*TILE,position.y*TILE),tileSize=TILE*game.camera.z,size=Math.round(tileSize*scale);
 const centerX=Math.round(p.x+tileSize/2),centerY=Math.round(p.y+tileSize/2+offsetY*tileSize);
 game.ctx.save();game.ctx.imageSmoothingEnabled=false;game.ctx.globalAlpha=alpha;
 if(shadowColor){game.ctx.shadowColor=shadowColor;game.ctx.shadowBlur=shadowBlur*game.camera.z}
 game.ctx.translate(centerX,centerY);game.ctx.rotate(rotation);
 game.ctx.drawImage(image,column*cellWidth,row*cellHeight,cellWidth,cellHeight,-size/2,-size/2,size,size);
 game.ctx.restore();return true
}
function drawExploreGlow(position,color,radius=1.7,alpha=.62){
 const p=game.camera.world(position.x*TILE,position.y*TILE),tileSize=TILE*game.camera.z,cx=Math.round(p.x+tileSize/2),cy=Math.round(p.y+tileSize/2);
 const gradient=game.ctx.createRadialGradient(cx,cy,0,cx,cy,tileSize*radius);
 const tone=(strength)=>`${color}${Math.round(Math.max(0,Math.min(1,alpha*strength))*255).toString(16).padStart(2,"0")}`;
 // A wide, feathered aura reads as illumination instead of a coloured disk.
 gradient.addColorStop(0,tone(1));gradient.addColorStop(.18,tone(.72));gradient.addColorStop(.48,tone(.28));gradient.addColorStop(.76,tone(.08));gradient.addColorStop(1,tone(0));
 game.ctx.save();game.ctx.globalCompositeOperation="screen";game.ctx.fillStyle=gradient;game.ctx.fillRect(cx-tileSize*radius,cy-tileSize*radius,tileSize*radius*2,tileSize*radius*2);game.ctx.restore()
}
function drawExploreSoftAura(position,color,radius=2.6,alpha=.1){
 // Lighting is deliberately painted after the fog, but the prop itself is not.
 // This keeps the glow readable without placing stairs or lamps over party sprites.
 drawExploreGlow(position,color,radius,alpha)
}
function drawExploreParticles(position,color,count=7,phase=0,radius=.72){
 const p=game.camera.world(position.x*TILE,position.y*TILE),tileSize=TILE*game.camera.z,frame=Math.floor(performance.now()/280)%3;
 game.ctx.save();game.ctx.globalCompositeOperation="screen";
 for(let index=0;index<count;index++){
  const angle=(index/count)*Math.PI*2+phase*.013,drift=(.25+(index%4)*.1)*radius;
  const x=Math.round(p.x+tileSize*(.5+Math.cos(angle)*drift)),y=Math.round(p.y+tileSize*(.5+Math.sin(angle)*drift*.72));
  game.ctx.globalAlpha=[.28,.72,.46][(frame+index)%3];game.ctx.fillStyle=color;game.ctx.beginPath();game.ctx.arc(x,y,Math.max(1,Math.round(tileSize*(.018+(index%2)*.008))),0,Math.PI*2);game.ctx.fill()
 }
 game.ctx.restore()
}
function drawExploreWallArchitecture(world,theme){
 for(let y=0;y<world.rows;y++)for(let x=0;x<world.cols;x++){
  if(!world.tiles[y]?.[x])continue;
  const open={
   top:world.tiles[y-1]?.[x]===0,right:world.tiles[y]?.[x+1]===0,
   bottom:world.tiles[y+1]?.[x]===0,left:world.tiles[y]?.[x-1]===0
  };
  const sides=Object.values(open).filter(Boolean).length;if(!sides)continue;
  let index=EXPLORE_ATLAS.wall,rotation=0,scale=1.58;
  if(sides>=3){index=EXPLORE_ATLAS.pillar;scale=1.55}
  else if(sides===2&&!(open.top&&open.bottom)&&!(open.left&&open.right)){
   index=EXPLORE_ATLAS.corner;scale=1.65;
   if(open.top&&open.right)rotation=Math.PI/2;
   else if(open.right&&open.bottom)rotation=Math.PI;
   else if(open.bottom&&open.left)rotation=-Math.PI/2;
  }else if(open.left||open.right)rotation=Math.PI/2;
  drawExploreAtlas({x,y},index,{scale,rotation,shadowColor:"#000",shadowBlur:8})
 }
}
function drawExploreDecoration(decoration,theme){
 const frameTime=performance.now(),pulse=.92+Math.sin(frameTime/310+decoration.phase)*.08,usedAlpha=decoration.used?.48:1;
 if(decoration.type==="water"){
  drawExploreAtlas(decoration,EXPLORE_ATLAS.water,{scale:(decoration.scale??1.2)*1.48,alpha:decoration.used?.84:.78});
  const p=game.camera.world(decoration.x*TILE,decoration.y*TILE),size=TILE*game.camera.z;
  game.ctx.save();
  if(decoration.used){game.ctx.fillStyle="#070b0dcc";game.ctx.beginPath();game.ctx.ellipse(p.x+size*.5,p.y+size*.53,size*.32,size*.17,0,0,Math.PI*2);game.ctx.fill()}
  else{game.ctx.strokeStyle="#8ce9ff66";game.ctx.lineWidth=Math.max(1,game.camera.z*.7);for(let line=0;line<2;line++){const y=p.y+size*(.42+line*.18);game.ctx.beginPath();game.ctx.moveTo(p.x+size*(.22+line*.08),y);game.ctx.lineTo(p.x+size*(.72-line*.06),y);game.ctx.stroke()}}
  game.ctx.restore();return
 }
 if(decoration.type==="entrance"){drawExploreAtlas(decoration,EXPLORE_ATLAS.entrance,{scale:(decoration.scale??1.3)*1.5,rotation:decoration.rotation,shadowColor:"#000",shadowBlur:5});return}
 if(decoration.type==="candelabrum"){
  drawExploreGlow(decoration,"#ffd58a",2.72,.1*pulse);drawExploreAtlas(decoration,EXPLORE_ATLAS.candelabrum1,{scale:1.3,shadowColor:"#ffd58a",shadowBlur:2});return
 }
 if(decoration.type==="crystal"){
  if(!decoration.used)drawExploreGlow(decoration,"#a95cff",1.4,.38*pulse);
  drawExploreAtlas(decoration,EXPLORE_ATLAS.crystal1,{scale:decoration.used?1.22:1.58,alpha:decoration.used?.24:1,shadowColor:decoration.used?"#000":"#b46cff",shadowBlur:decoration.used?2:9});if(!decoration.used)drawExploreParticles(decoration,"#d6a5ff",3,decoration.phase,.45);return
 }
 const index={barrel:EXPLORE_ATLAS.barrel,crate:EXPLORE_ATLAS.crate,bones:EXPLORE_ATLAS.bones}[decoration.type];
 if(index!=null){
  drawExploreAtlas(decoration,index,{scale:(decoration.scale??1)*(decoration.destroyed?1.28:1.62),alpha:decoration.destroyed?.38:usedAlpha,rotation:decoration.destroyed?.16:decoration.rotation,shadowColor:"#000",shadowBlur:decoration.destroyed?2:7});
  if(decoration.destroyed){const p=game.camera.world(decoration.x*TILE,decoration.y*TILE),size=TILE*game.camera.z;game.ctx.save();game.ctx.strokeStyle="#c39a6255";game.ctx.lineWidth=Math.max(1,game.camera.z*.8);game.ctx.beginPath();game.ctx.moveTo(p.x+size*.27,p.y+size*.67);game.ctx.lineTo(p.x+size*.73,p.y+size*.43);game.ctx.moveTo(p.x+size*.3,p.y+size*.43);game.ctx.lineTo(p.x+size*.7,p.y+size*.68);game.ctx.stroke();game.ctx.restore()}
 }
}
function drawExploreExit(position,image,theme){
 const pulse=.92+Math.sin(performance.now()/240)*.08;
 drawExploreGlow(position,"#8e78ff",3.08,.1*pulse);
 if(!drawExplorationTileAsset(position,image,1.66)){
  drawExploreAtlas(position,EXPLORE_ATLAS.entrance,{scale:1.64,shadowColor:"#8e78ff",shadowBlur:5})
 }
 drawExploreParticles(position,"#c8bcff",4,17,.58)
}
function drawExploreAtmosphere(theme){
 const p=game.camera.world(game.player.rx*TILE,game.player.ry*TILE),size=TILE*game.camera.z,cx=p.x+size/2,cy=p.y+size/2;
 const radius=Math.max(game.canvas.width,game.canvas.height)*.64,gradient=game.ctx.createRadialGradient(cx,cy,size*.55,cx,cy,radius);
 gradient.addColorStop(0,"rgba(0,0,0,.04)");gradient.addColorStop(.28,"rgba(0,0,0,.14)");gradient.addColorStop(.63,"rgba(0,0,0,.58)");gradient.addColorStop(1,"rgba(0,0,0,.88)");
 game.ctx.fillStyle=gradient;game.ctx.fillRect(0,0,game.canvas.width,game.canvas.height)
}
function explorationPartySceneObjects(){
 const members=explorationPartyMembers();
 const entries=members.map((monster,index)=>{
  const position=index?explorationFollowerPosition(index):{x:game.player.rx,y:game.player.ry};
  return{y:position.y+.88,order:80+index,draw:()=>drawExplorationMonster(position,monster,false,index ? .95 : 1,index)};
 });
 if(!entries.length){const position={x:game.player.rx,y:game.player.ry};entries.push({y:position.y+.88,order:80,draw:()=>drawExplorationMonster(position,{speciesId:"slime"},false,1,0)})}
 return entries
}
function drawExploreSceneObjects(world,floor,theme,stairsTexture){
 const objects=[];
 const add=(y,order,drawObject)=>objects.push({y:Number(y)||0,order,draw:drawObject});
 ensureExploreDecorations(world).filter(item=>item.type!=="water"&&item.type!=="entrance").forEach((item,index)=>add(item.y+(item.type==="candelabrum"?.84:.7),10+index,()=>drawExploreDecoration(item,theme)));
 add(world.exit.y+.9,30,()=>drawExploreExit(world.exit,stairsTexture,theme));
 if(world.shop)add(world.shop.y+.86,40,()=>drawExploreAtlas(world.shop,EXPLORE_ATLAS.entrance,{scale:1.72,rotation:world.shop.rotation??0,shadowColor:"#000",shadowBlur:6}));
 if(world.boss){const boss=floorBossEnemy();add(world.boss.y+.9,60,()=>drawExplorationMonster(world.boss,{speciesId:boss.speciesId,level:boss.level},true,1.92,9))}
 world.chests.forEach((chest,index)=>add(chest.y+.72,50+index,()=>drawExploreAtlas(chest,chest.open?EXPLORE_ATLAS.chestOpen:EXPLORE_ATLAS.chestClosed,{scale:1.7,shadowColor:chest.locked?"#f2cf72":"#000",shadowBlur:chest.locked?13:7})));
 objects.push(...explorationPartySceneObjects());
 objects.sort((a,b)=>a.y-b.y||a.order-b.order).forEach(entry=>entry.draw())
}
function draw(){
 const c=game.ctx,w=game.world,floor=save.state.player.currentFloor,palette=worldPresentationForFloor(floor),theme=exploreBandTheme(floor),floorTexture=explorationTexture("floor"),wallTexture=explorationTexture("wall"),stairsTexture=explorationTexture("stairs");
 c.fillStyle="#06070a";c.fillRect(0,0,game.canvas.width,game.canvas.height);c.imageSmoothingEnabled=false;
 for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++){
  const p=game.camera.world(x*TILE,y*TILE),s=TILE*game.camera.z,blocked=Boolean(w.tiles[y][x]),image=blocked?wallTexture:floorTexture;
  if(image){
   // Keep neighbouring source samples continuous. Random crop offsets made each
   // logical cell edge visible as an unintended square grid on the dungeon.
   const crop=64,spanX=Math.max(1,image.width-crop),spanY=Math.max(1,image.height-crop),sx=x*crop%spanX,sy=y*crop%spanY;
   c.drawImage(image,sx,sy,crop,crop,p.x,p.y,s+1,s+1);
   c.fillStyle=blocked?"#010205aa":theme.floor;c.fillRect(p.x,p.y,s+1,s+1);
   if(blocked){c.fillStyle=theme.wall;c.fillRect(p.x,p.y,s+1,s+1)}
  }else{c.fillStyle=blocked?palette.wall:palette.floor;c.fillRect(p.x,p.y,s+1,s+1)}
 }
 drawExploreWallArchitecture(w,theme);
 const decorations=ensureExploreDecorations(w);
 decorations.filter(item=>item.type==="water"||item.type==="entrance").sort((a,b)=>a.y-b.y).forEach(item=>drawExploreDecoration(item,theme));
 drawExploreSceneObjects(w,floor,theme,stairsTexture);
 drawExploreAtmosphere(theme);
 // Only broad, feathered light is repainted above the fog. The actual props
 // stay in the Y-sorted scene so party members can naturally pass in front.
 drawExploreSoftAura(w.exit,"#8e78ff",3.25,.075);
 decorations.filter(item=>item.type==="candelabrum").forEach(item=>drawExploreSoftAura(item,"#ffd58a",2.85,.065));
 drawMini();
}
function drawMini(){
 const m=document.getElementById("miniMap");
 if(!m||!game?.running)return;
 const w=game.world;
 if(!save.state.settings.minimapVisible){m.style.opacity=0;return}
 m.style.opacity=1;
 const c=m.getContext("2d"),cell=Math.min(m.width/w.cols,m.height/w.rows),ox=(m.width-w.cols*cell)/2,oy=(m.height-w.rows*cell)/2;
 c.fillStyle="#130c18";c.fillRect(0,0,m.width,m.height);
 for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++){
  c.fillStyle=w.tiles[y][x]?"#24192d":"#b178d0";
  c.fillRect(ox+x*cell,oy+y*cell,cell,cell)
 }
 c.fillStyle="#ff5d66";c.fillRect(ox+w.exit.x*cell,oy+w.exit.y*cell,cell,cell);
 c.fillStyle="#5dff82";c.fillRect(ox+game.player.x*cell,oy+game.player.y*cell,cell,cell)
}
function path(w,s,g){
 const goalIsExit=g.x===w.exit.x&&g.y===w.exit.y;
 const walk=(x,y)=>{
  if(x<0||y<0||x>=w.cols||y>=w.rows||w.tiles[y][x])return false;
  if(!goalIsExit&&x===w.exit.x&&y===w.exit.y)return false;
  return true
 };
 const key=p=>p.x+","+p.y;
 if(!walk(g.x,g.y))return[];
 const q=[{x:s.x,y:s.y}],seen=new Set([key(s)]),prev=new Map();
 while(q.length){
  const c=q.shift();
  if(c.x===g.x&&c.y===g.y)break;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
   const n={x:c.x+dx,y:c.y+dy},k=key(n);
   if(walk(n.x,n.y)&&!seen.has(k)){seen.add(k);prev.set(k,c);q.push(n)}
  }
 }
 if(!seen.has(key(g)))return[];
 const out=[];let cur=g;
 while(cur.x!==s.x||cur.y!==s.y){out.unshift(cur);cur=prev.get(key(cur));if(!cur)return[]}
 return out
}
function bindInput(c){
 game.canvas=c;if(!game.input||!(game.input.pts instanceof Map))game.input=createInputState();
 const i=game.input;i.pts.clear();i.pinch=null;i.drag=false;
 const scalePoint=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*(c.width/r.width),y:(e.clientY-r.top)*(c.height/r.height)}};
 const finish=e=>{i.pts.delete(e.pointerId);if(i.pts.size<2)i.pinch=null;if(!i.pts.size)i.drag=false};
 c.onpointerdown=e=>{
  if(game.paused)return;c.setPointerCapture?.(e.pointerId);const q=scalePoint(e);i.pts.set(e.pointerId,{...q,sx:q.x,sy:q.y,startClientX:e.clientX,startClientY:e.clientY});
  if(i.pts.size===2){const[a,b]=[...i.pts.values()];i.pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:game.camera.z};i.drag=true}
 };
 c.onpointermove=e=>{
  const p=i.pts.get(e.pointerId);if(!p||game.paused)return;
  const q=scalePoint(e),dx=q.x-p.x,dy=q.y-p.y;p.x=q.x;p.y=q.y;
  if(i.pts.size>=2){
   const[a,b]=[...i.pts.values()],dist=Math.hypot(a.x-b.x,a.y-b.y);
   if(!i.pinch)i.pinch={distance:dist,zoom:game.camera.z};
   const center={x:(a.x+b.x)/2,y:(a.y+b.y)/2},before=game.camera.screen(center.x,center.y);
   game.camera.z=Math.max(.45,Math.min(2.25,i.pinch.zoom*dist/Math.max(1,i.pinch.distance)));
   const after=game.camera.world(before.x,before.y);game.camera.ox+=center.x-after.x;game.camera.oy+=center.y-after.y;game.camera.manual=true;game.camera.clamp(game.world);i.drag=true;return
  }
  if(Math.hypot(e.clientX-p.startClientX,e.clientY-p.startClientY)>=CAMERA_DRAG_THRESHOLD_PX)i.drag=true;
  if(i.drag){game.camera.pan(dx,dy);game.camera.clamp(game.world)}
 };
 c.onpointerup=e=>{
  const p=i.pts.get(e.pointerId),wasMulti=i.pinch,drag=i.drag;finish(e);
  if(drag||wasMulti)queueExpeditionCheckpoint();
  if(!p||drag||wasMulti||game.paused)return;
  const q=scalePoint(e),w=game.camera.screen(q.x,q.y),g={x:Math.floor(w.x/TILE),y:Math.floor(w.y/TILE)},decoration=exploreDecorationAt(g.x,g.y);
  if(decoration){
   const distance=Math.abs(game.player.x-g.x)+Math.abs(game.player.y-g.y);
   if(distance<=1){game.player.path=[];interactExploreDecoration(decoration);return}
  }
  game.player.setPath(path(game.world,game.player,g))
 };
 c.onpointercancel=c.onlostpointercapture=finish
}
function stopGame(){if(!game)return;game.running=false;if(game.elapsedTimer)clearInterval(game.elapsedTimer);const c=game.canvas;if(c)c.onpointerdown=c.onpointermove=c.onpointerup=c.onpointercancel=c.onlostpointercapture=null}
function pauseModal(title,body){game.paused=true;app.insertAdjacentHTML("beforeend",Modal(title,body));const modal=topModal(),close=()=>{modal?.remove();if(game&&!document.querySelector(".game-modal"))game.paused=false};modal._onDismiss=close;modal.querySelector("[data-modal-primary]").onclick=close}


function battleSpeed(){return normalizeBattleSpeed(save.state.settings.battleSpeed)}
function scaledBattleDelay(ms){return Math.max(20,Math.round(Math.max(0,Number(ms)||0)/battleSpeed()))}
function wait(ms){return new Promise(r=>setTimeout(r,scaledBattleDelay(ms)))}
function battleTarget(target){
 if(target==="enemy")return document.querySelector(".enemy-combatant.targeted")??document.querySelector(".enemy-combatant");if(String(target).startsWith("enemy-"))return document.getElementById(`enemy-${target}`);
 if(target==="party")return document.querySelector(".battle-party");
 return document.getElementById(`ally-${target}`);
}
async function animateAttack(from,skill=false){
 const el=battleTarget(from);if(!el)return;
 audio.sfx("attack");
 setMonsterVisualFrame(el,"attack");
 el.classList.remove("fx-lunge","fx-skill-lunge");void el.offsetWidth;
 el.classList.add(skill?"fx-skill-lunge":"fx-lunge");
 await wait(skill?300:220);
 el.classList.remove("fx-lunge","fx-skill-lunge");
 setMonsterVisualFrame(el,"idle");
}
async function animateHit(target,critical=false){
 const el=battleTarget(target);if(!el)return;
 audio.sfx("hit");
 setMonsterVisualFrame(el,"damage");
 el.classList.remove("fx-hit","fx-critical-hit");void el.offsetWidth;
 el.classList.add(critical?"fx-critical-hit":"fx-hit");
 await wait(260);
 el.classList.remove("fx-hit","fx-critical-hit");
 setMonsterVisualFrame(el,"idle");
}
async function animateDefeat(target,captured=false){
 const el=battleTarget(target);if(!el)return;
 setMonsterVisualFrame(el,"down");
 el.classList.add(captured?"fx-captured":"fx-defeat");
 await wait(500);
}
async function floatText(text,target,type){
 const layer=document.getElementById("battleFxLayer"),el=battleTarget(target);
 if(!layer||!el)return;
 const lr=layer.getBoundingClientRect(),r=el.getBoundingClientRect(),n=document.createElement("div");
 n.className=`floating-number ${type}`;n.textContent=text;
 n.style.left=`${r.left-lr.left+r.width/2}px`;n.style.top=`${r.top-lr.top+r.height*.35}px`;
 layer.appendChild(n);await wait(560);n.remove();
}
function battleFlash(type="hit"){
 const arena=document.querySelector(".battle-arena");if(!arena)return;
 const flash=document.createElement("div");flash.className=`battle-screen-flash ${type}`;arena.appendChild(flash);setTimeout(()=>flash.remove(),scaledBattleDelay(420));
}
async function battleBanner(title,subtitle="",type="normal",duration=700){
 const arena=document.querySelector(".battle-arena");if(!arena)return;
 arena.querySelector(".battle-cinematic-banner")?.remove();
 const el=document.createElement("div");el.className=`battle-cinematic-banner ${type}`;el.innerHTML=`<strong>${title}</strong>${subtitle?`<small>${subtitle}</small>`:""}`;arena.appendChild(el);
 await wait(duration);el.classList.add("leaving");await wait(220);el.remove();
}
function burstParticles(target,type="gold",count=12){
 const layer=document.getElementById("battleFxLayer"),el=battleTarget(target);if(!layer||!el)return;
 const lr=layer.getBoundingClientRect(),r=el.getBoundingClientRect();
 for(let i=0;i<count;i++){const p=document.createElement("i");p.className=`fx-particle ${type}`;const angle=Math.PI*2*i/count+(Math.random()-.5)*.35,dist=42+Math.random()*46;p.style.left=`${r.left-lr.left+r.width/2}px`;p.style.top=`${r.top-lr.top+r.height*.42}px`;p.style.setProperty("--dx",`${Math.cos(angle)*dist}px`);p.style.setProperty("--dy",`${Math.sin(angle)*dist}px`);p.style.animationDelay=`${Math.random()*scaledBattleDelay(80)}ms`;layer.appendChild(p);setTimeout(()=>p.remove(),scaledBattleDelay(800))}
}
async function battleIntro(enemies){
 const elite=enemies.find(e=>e.elite);if(elite){battleFlash("danger");await battleBanner("ABYSS ELITE",`${elite.eliteAffixIcon} ${elite.eliteAffixName}・${elite.name}`,"boss",1050);return}
 if(battle?.specialBattle){const isEmergency=battle.specialBattleType==="emergency",isGauntlet=battle.specialBattleType==="gauntlet";battleFlash(isEmergency?"boss":"hit");await battleBanner(isEmergency?"WORLD ANOMALY":isGauntlet?"ABYSS TRIAL":"TEAM BATTLE",battle.specialTitle??(isGauntlet?"奈落回廊":"4 VS 4"),isEmergency?"boss":"encounter",1100);return}
 const boss=enemies.find(e=>e.boss);if(boss){battleFlash("boss");await battleBanner("BOSS BATTLE",boss.name,"boss",900)}
 else if(enemies.length>1)await battleBanner("ENEMY PARTY",`${enemies.length}体が立ちはだかった`,"encounter",620);
 else await battleBanner("ENCOUNTER",enemies[0]?.name??"敵が現れた","encounter",520);
}
function hydrateEndgameEnemy(enemy,source={}){const profile=endgameCharacter(source.endgameBossId??enemy?.endgameBossId);if(!profile||!enemy)return enemy;enemy.endgameBossId=profile.id;enemy.faction=source.faction??enemy.faction??profile.faction;enemy.elementMultipliers=source.elementMultipliers??enemy.elementMultipliers??profile.elementMultipliers;enemy.statusProfile=source.statusProfile??enemy.statusProfile??profile.statusProfile;enemy.bossPassive=source.bossPassive??enemy.bossPassive??profile.passive;return enemy}
function makeBattleEnemy(e,index=0){const sp=SPECIES[e.speciesId],danger={stats:1},scaled={...e,level:Math.max(1,e.level??1)},enemy=createEnemyBattleState(sp,scaled,save.state.player.currentFloor);enemy.dangerLevel=e.boss?5:e.speciesId==="mimic"?3:e.equipped?3:((e.level??1)>save.state.player.currentFloor+4?2:1);if(e.nameOverride)enemy.name=e.nameOverride;if(e.statMultiplier){const mult=Number(e.statMultiplier)||1;enemy.maxHp=Math.max(1,Math.round(enemy.maxHp*mult));enemy.hp=enemy.maxHp;enemy.atk=Math.max(1,Math.round(enemy.atk*mult));enemy.matk=Math.max(1,Math.round((enemy.matk??enemy.atk)*mult));enemy.def=Math.max(0,Math.round(enemy.def*mult));enemy.mdef=Math.max(0,Math.round((enemy.mdef??enemy.def)*mult));enemy.spd=Math.max(1,Math.round(enemy.spd*Math.sqrt(mult)))}enemy.endgameBossId=e.endgameBossId??null;enemy.faction=e.faction??null;enemy.powerRate=e.powerRate??null;enemy.manifestationLabel=e.manifestationLabel??null;enemy.endgameSupport=Boolean(e.endgameSupport);enemy.uncapturable=Boolean(e.uncapturable);enemy.id=`enemy-${Date.now()}-${index}-${Math.random().toString(36).slice(2,7)}`;enemy.maxHp=Math.max(1,Math.round(enemy.maxHp*danger.stats));enemy.hp=enemy.maxHp;enemy.atk=Math.max(1,Math.round(enemy.atk*danger.stats));enemy.matk=Math.max(1,Math.round((enemy.matk??enemy.atk)*danger.stats));enemy.def=Math.max(0,Math.round(enemy.def*danger.stats));enemy.mdef=Math.max(0,Math.round((enemy.mdef??enemy.def)*danger.stats));enemy.spd=Math.max(1,Math.round(enemy.spd*(1+(danger.stats-1)*.35)));applyEliteModifiers(enemy,e);hydrateEndgameEnemy(enemy,e);if(e.equipped&&e.gear){enemy.gear=e.gear;enemy.name=`⚔️ ${enemy.name}`;enemy.atk+=e.gear.stats.atk??0;enemy.matk=(enemy.matk??enemy.atk)+(e.gear.stats.matk??0);enemy.def+=e.gear.stats.def??0;enemy.mdef=(enemy.mdef??enemy.def)+(e.gear.stats.mdef??0);enemy.spd+=e.gear.stats.spd??0;enemy.maxHp+=e.gear.stats.hp??0;enemy.hp=enemy.maxHp}return enemy}
function saveBattleCheckpoint(){
 if(!battle)return;
 syncPersistentAilments(battle);
 const explorationSnapshot=persistExpeditionSnapshot(snapshot??expeditionSnapshotFromGame(),{saveNow:false})??save.state.expeditionSnapshot??null;
 save.state.activeBattle={
  battleId:battle.battleId,floor:save.state.player.currentFloor,enemies:battle.enemies,turn:battle.turn,turnQueue:battle.turnQueue,queueIndex:battle.queueIndex,
  targetEnemyId:battle.targetEnemyId,auto:battle.auto,escapePending:false,actionCommitted:Boolean(battle.actionCommitted),guards:battle.guards,cooldowns:battle.cooldowns,
  enemyStatuses:battle.enemyStatuses,allyAilments:battle.allyAilments,allyEffects:battle.allyEffects,enemyEffects:battle.enemyEffects,lastStatusTurn:battle.lastStatusTurn,log:battle.log,explorationSnapshot,
  specialBattle:battle.specialBattle,specialBattleType:battle.specialBattleType,specialTitle:battle.specialTitle,specialSubtitle:battle.specialSubtitle,
  priorVitals:battle.priorVitals,specialBossId:battle.specialBossId,powerPercent:battle.powerPercent,bonusFragments:battle.bonusFragments,
  preludeChoiceId:battle.preludeChoiceId,preludeResultText:battle.preludeResultText,specialTrialNumber:battle.specialTrialNumber??null,specialTrialLoop:battle.specialTrialLoop??null,specialReturnScreen:battle.specialReturnScreen??null,
  memoryBattle:Boolean(battle.memoryBattle),bossMemoryBattle:Boolean(battle.bossMemoryBattle),memorySourceFloor:battle.memorySourceFloor??null,memorySpeciesId:battle.memorySpeciesId??null
 };
 save.save()
}
function clearBattleCheckpoint(){delete save.state.activeBattle;save.save()}
function resumeSavedBattle(){const data=save.state.activeBattle;if(!data?.enemies?.length)return false;const party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);if(!party.length)return false;save.state.player.currentFloor=data.floor??save.state.player.currentFloor;snapshot=hydrateExpeditionSnapshot(data.explorationSnapshot??save.state.expeditionSnapshot);battle={...data,battleId:data.battleId??crypto.randomUUID?.()??`${Date.now()}-${Math.random()}`,party,species:SPECIES,busy:false,skillMenu:false,itemMenu:false,enemy:data.enemies[0],...createBattleRulesState(party),cooldowns:data.cooldowns??{},enemyStatuses:data.enemyStatuses??{},allyAilments:data.allyAilments??Object.fromEntries(party.map(monster=>[monster.id,normalizePersistentAilments(monster.ailments)])),allyEffects:data.allyEffects??{},enemyEffects:data.enemyEffects??{},lastStatusTurn:data.lastStatusTurn??0,log:data.log??[]};battle.enemies.forEach(enemy=>hydrateEndgameEnemy(enemy));battle.enemy=battle.enemies[0];syncPersistentAilments(battle);battle.turnQueue=data.turnQueue??[];battle.queueIndex=data.queueIndex??0;battle.targetEnemyId=data.targetEnemyId??aliveEnemies(battle)[0]?.id??null;screen="explore";renderBattle();setTimeout(()=>data.actionCommitted?finishCurrentAction():continueBattleFlow(),scaledBattleDelay(250));return true}
function affixValue(monster,id,cap=Infinity){return Math.max(0,Math.min(cap,Number(monster?._equipmentAffixes?.[id]??0)))}
function equipmentStatValue(monster,id,cap=Infinity){return Math.max(0,Math.min(cap,Number(monster?._equipmentStats?.[id]??0)))}
function seriesEffectValue(monster,id,cap=Infinity){return Math.max(0,Math.min(cap,Number(monster?._seriesEffects?.[id]??0)))}
function partyAffixTotal(id,cap=Infinity){return Math.max(0,Math.min(cap,(battle?.party??[]).reduce((sum,m)=>sum+affixValue(m,id),0)))}
function abyssBattleMultiplier(monster,key){return Math.max(0,1+(Number(monster?._abyssSkillEffects?.[key])||0))}
function healMultiplier(monster){const stats=calculatedStats(monster),magicBonus=Math.min(.5,Math.max(0,(stats.matk??stats.atk)-stats.atk*.75)/Math.max(1,stats.atk)*.25);return(1+Math.min(150,affixValue(monster,"healPower",150)+equipmentStatValue(monster,"heal",150))/100)*(1+magicBonus)}
function outgoingLifeSteal(monster){return affixValue(monster,"lifeSteal",30)/100}
function equipmentRegenRate(monster){return affixValue(monster,"regen",20)/100}
function tryUnyielding(monster){const guaranteed=seriesEffectValue(monster,"lastStand")>0,chance=affixValue(monster,"unyielding",60)/100;if(monster._unyieldingUsed||!guaranteed&&(!chance||Math.random()>=chance))return false;monster._unyieldingUsed=true;monster.currentHp=1;return true}
function applyStartMpAffix(monster){const rate=affixValue(monster,"startMp",60)/100;if(!rate)return;monster.currentMp=Math.min(maxMp(monster),Math.max(0,monster.currentMp??0)+Math.floor(maxMp(monster)*rate))}
function affixCriticalChance(stats,base,cap=.85){return Math.min(cap,base+(stats.crit??0)/100)}
function affixExecutionMultiplier(monster,enemy){return enemy?.maxHp>0&&enemy.hp/enemy.maxHp<=.25?1+affixValue(monster,"execution",100)/100:1}
function elementalResistance(monster,element){
 if(!element)return 0;
 const key=`${element==="lightning"?"thunder":element}Res`;
 return Math.min(.75,(equipmentStatValue(monster,key,75)+affixValue(monster,key,75))/100);
}
function endgameIncomingDamageMultiplier(enemy,element){if(!enemy?.endgameBossId||!element)return 1;const key=element==="thunder"?"lightning":element==="ice"?"water":element;return Math.max(.1,Math.min(2,Number(enemy.elementMultipliers?.[key])||1))}
async function trySeriesChainAttack(monster,enemy,damage){
 const chance=affixValue(monster,"chainChance",60)/100;
 if(!chance||!enemy||enemy.hp<=0||Math.random()>=chance)return 0;
 const beforeHp=enemy.hp,follow=Math.max(1,Math.floor(damage*.5));
 enemy.hp=Math.max(0,enemy.hp-follow);registerWeaponFinisher(monster,enemy,beforeHp);
 addBattleLog(battle,`${displayName(monster)}の追撃 ${follow}ダメージ`);
 await floatText(`追撃 -${follow}`,enemy.id,"skill");
 return follow;
}
async function trySeriesBurn(monster,enemy,skill){
 const chance=affixValue(monster,"burnChance",80)/100;
 if(!chance||skill?.element!=="fire"||!enemy||enemy.hp<=0||Math.random()>=chance)return false;
 const applied=applyEnemyStatus(battle,{id:"burn",name:"炎上",chance:1,turns:3,power:.04,sourceMonsterId:monster.id},enemy.id);
 if(!applied)return false;
 addBattleLog(battle,`${enemy.name}は炎上した`);await floatText("炎上",enemy.id,"burn");return true;
}
function startBattle(encounter,options={}){
 const entries=Array.isArray(encounter)?encounter:[encounter];
 if(!options.memoryBattle&&!options.specialBattle)rememberBattleEncounter(entries);
 entries.forEach(entry=>recordBiomeEncounter(save.state,options.memoryBattle?(options.memorySourceFloor??save.state.player.currentFloor):save.state.player.currentFloor,entry.speciesId));
 const party=save.state.party.map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean),synergy=partySynergy();
 party.forEach(monster=>{
  monster._synergy=synergy?{atk:synergy.atk??0,def:synergy.def??0,spd:synergy.spd??0,crit:synergy.crit??0}:{};
  monster._unyieldingUsed=false;
  const hp=calculatedStats(monster).hp,mp=maxMp(monster);
  if(monster.currentHp==null)monster.currentHp=hp;
  if(monster.currentMp==null)monster.currentMp=mp;
  monster.currentHp=Math.min(monster.currentHp,hp);monster.currentMp=Math.min(monster.currentMp,mp);applyStartMpAffix(monster)
 });
 entries.forEach(entry=>save.state.codex.encounters[entry.speciesId]=(save.state.codex.encounters[entry.speciesId]??0)+1);
 save.save();
 const enemies=entries.map(makeBattleEnemy);
 enemies.filter(enemy=>enemy.elite).forEach(enemy=>recordEliteEncounter(save.state,enemy));save.save();
 battle={battleId:crypto.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`,enemies,enemy:enemies[0],targetEnemyId:enemies[0]?.id,party,species:SPECIES,turn:1,busy:false,auto:save.state.settings.autoBattle,guards:{},escapePending:false,actionCommitted:false,skillMenu:false,itemMenu:false,...createBattleRulesState(party),...options};
 audio.setScene(enemies.some(enemy=>enemy.faction==="tenGod")?"divine":enemies.some(enemy=>enemy.faction==="abyss")?"abyss":"battle");audio.sfx(enemies.some(enemy=>enemy.endgameBossId)?"boss":"select");
 buildTurnQueue(battle);
 if(synergy)addBattleLog(battle,`${synergy.name}が発動！`);
 if(options.memoryBattle)addBattleLog(battle,`深淵の記憶から${enemies[0]?.name??"魔物"}が現れた`);
 addBattleLog(battle,`行動順：${battle.turnQueue.map(entry=>entry.name).join(" → ")}`);
 saveBattleCheckpoint();renderBattle();setTimeout(async()=>{await battleIntro(enemies);continueBattleFlow()},scaledBattleDelay(120))
}
function actor(){return currentAlly(battle)}
function renderBattle(){document.querySelector(".battle-screen")?.remove();app.insertAdjacentHTML("beforeend",BattleScreen(battle,save.state.inventory,save.state.settings,save.state.player.currentFloor));document.querySelectorAll("[data-command]").forEach(b=>b.onclick=()=>command(b.dataset.command));document.querySelectorAll("[data-skill-id]").forEach(b=>b.onclick=()=>command("skill",b.dataset.skillId));document.querySelectorAll("[data-battle-item]").forEach(b=>b.onclick=()=>openBattleItemTarget(b.dataset.battleItem));document.querySelectorAll("[data-battle-detail]").forEach(b=>b.onclick=()=>showBattleMonsterDetail(b.dataset.battleDetail));document.querySelectorAll("[data-enemy-target]").forEach(b=>b.onclick=()=>{if(battle.busy)return;battle.targetEnemyId=b.dataset.enemyTarget;renderBattle()});document.querySelector(".battle-arena")?.addEventListener("click",e=>{if(!battle.auto||e.target.closest("button,.combatant"))return;battle.auto=false;save.state.settings.autoBattle=false;saveBattleCheckpoint();showToast("手動操作へ切り替えました");renderBattle()});const closeSkill=document.getElementById("closeSkillMenu");if(closeSkill)closeSkill.onclick=()=>{battle.skillMenu=false;renderBattle()};const closeItem=document.getElementById("closeItemMenu");if(closeItem)closeItem.onclick=()=>{battle.itemMenu=false;renderBattle()};document.getElementById("battleSpeed").onclick=()=>{const index=BATTLE_SPEED_OPTIONS.indexOf(battleSpeed());save.state.settings.battleSpeed=BATTLE_SPEED_OPTIONS[(index+1)%BATTLE_SPEED_OPTIONS.length];save.save();renderBattle()};document.getElementById("toggleBattleAuto").onclick=()=>{battle.auto=!battle.auto;save.state.settings.autoBattle=battle.auto;save.save();renderBattle();if(battle.auto&&!battle.busy)continueBattleFlow()};document.getElementById("escapeBattle")?.addEventListener("click",requestEscape)}
async function requestEscape(){
 if(!battle||battle.escapePending||battle.specialBattle)return;
 battle.auto=false;save.state.settings.autoBattle=false;save.save();
 battle.escapePending=true;addBattleLog(battle,battle.busy?"オートを停止。現在の行動後に逃走します":"逃走を試みる");saveBattleCheckpoint();renderBattle();
 if(!battle.busy)await resolveEscape();
}
async function resolveEscape(){
 if(!battle?.escapePending||battle.busy)return false;
 battle.busy=true;battle.escapePending=false;
 if(battle.memoryBattle){clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();activeEnemy=null;battle=null;go("home");return true}
 if(Math.random()<.65){clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();activeEnemy=null;battle=null;screen="explore";render();return true}
 addBattleLog(battle,"逃走に失敗した");await floatText("逃走失敗","party","miss");battle.busy=false;saveBattleCheckpoint();renderBattle();return false
}
function openBattleItemTarget(type){if((save.state.inventory[type]??0)<=0)return;const single=["potions","highPotions","manaPotions","highManaPotions","fullManaPotions","reviveLeaves","statusCures","fullHeals"].includes(type);if(!single)return useBattleItem(type,null);const cards=battle.party.map(m=>{const st=calculatedStats(m);return`<button data-battle-item-target="${m.id}" ${type!=="reviveLeaves"&&m.currentHp<=0?"disabled":type==="reviveLeaves"&&m.currentHp>0?"disabled":""}><b>${displayName(m)} Lv.${m.level}</b><small>HP ${m.currentHp}/${st.hp}　MP ${m.currentMp}/${maxMp(m)}</small></button>`}).join("");app.insertAdjacentHTML("beforeend",Modal("使用対象を選択",`<div class="modal-party-vitals selectable">${cards}</div>`,`やめる`));const modal=topModal();modal.querySelectorAll("[data-battle-item-target]").forEach(b=>b.onclick=()=>{modal.remove();useBattleItem(type,b.dataset.battleItemTarget)});modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove()}
async function useBattleItem(type,targetId){
 if(battle.busy)return;const a=actor();if(!a)return;
 const party=battle.party,target=party.find(m=>m.id===targetId),single=["potions","highPotions","manaPotions","highManaPotions","fullManaPotions","reviveLeaves","statusCures","fullHeals"].includes(type),list=single?[target]:party;
 if(single&&!target)return;
 if(type==="reviveLeaves"&&target.currentHp>0)return alert("戦闘不能の仲間を選んでください");
 if(type!=="reviveLeaves"&&single&&target.currentHp<=0)return alert("戦闘不能の仲間には使用できません");
 const hasAilment=m=>(m.statuses?.length??0)||(m.ailments?.length??0)||m.status;
 const usable=type==="potions"?target.currentHp<calculatedStats(target).hp:type==="highPotions"?target.currentHp<calculatedStats(target).hp:type==="partyPotions"?list.some(m=>m.currentHp>0&&m.currentHp<calculatedStats(m).hp):["manaPotions","highManaPotions","fullManaPotions"].includes(type)?target.currentMp<maxMp(target):["partyManaPotions","partyFullManaPotions"].includes(type)?list.some(m=>m.currentHp>0&&m.currentMp<maxMp(m)):type==="reviveLeaves"?target.currentHp<=0:type==="statusCures"?hasAilment(target):type==="partyStatusCures"?list.some(hasAilment):type==="fullHeals"?(target.currentHp<calculatedStats(target).hp||target.currentMp<maxMp(target)||hasAilment(target)):list.some(m=>m.currentHp>0&&(m.currentHp<calculatedStats(m).hp||m.currentMp<maxMp(m)||hasAilment(m)));
 if(!usable)return alert("今は使用する必要がありません");
 battle.busy=true;battle.itemMenu=false;battle.actionCommitted=true;save.state.inventory[type]--;
 if(type==="potions"){const max=calculatedStats(target).hp;target.currentHp=Math.min(max,target.currentHp+scaledRecovery(100,max,.10))}
 if(type==="highPotions"){const max=calculatedStats(target).hp;target.currentHp=Math.min(max,target.currentHp+scaledRecovery(300,max,.25))}
 if(type==="partyPotions")list.filter(m=>m.currentHp>0).forEach(m=>{const max=calculatedStats(m).hp;m.currentHp=Math.min(max,m.currentHp+scaledRecovery(50,max,.07))});
 if(type==="manaPotions"){const max=maxMp(target);target.currentMp=Math.min(max,target.currentMp+scaledRecovery(30,max,.10))}
 if(type==="highManaPotions"){const max=maxMp(target);target.currentMp=Math.min(max,target.currentMp+scaledRecovery(100,max,.25))}
 if(type==="partyManaPotions")list.filter(m=>m.currentHp>0).forEach(m=>{const max=maxMp(m);m.currentMp=Math.min(max,m.currentMp+scaledRecovery(30,max,.07))});
 if(type==="fullManaPotions")target.currentMp=maxMp(target);
 if(type==="partyFullManaPotions")list.filter(m=>m.currentHp>0).forEach(m=>m.currentMp=maxMp(m));
 if(type==="reviveLeaves"){target.currentHp=Math.max(1,Math.floor(calculatedStats(target).hp*.3));target.currentMp=Math.min(maxMp(target),Math.max(0,target.currentMp??0));}
 if(type==="statusCures"||type==="partyStatusCures")list.filter(Boolean).forEach(clearAilments);
 if(type==="fullHeals"||type==="partyFullHeals")list.filter(m=>m.currentHp>0).forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)});
 addBattleLog(battle,`${displayName(a)}：アイテム使用`);saveBattleCheckpoint();renderBattle();await wait(220);battle.busy=false;await finishCurrentAction()
}

function showBattleMonsterDetail(id){
 const m=battle.party.find(x=>x.id===id);if(!m)return;const st=calculatedStats(m),need=expNeed(m),gear=Object.entries(m.equipment??{}).map(([slot,itemId])=>`${slotLabel(slot)}：${save.state.equipment.find(i=>i.id===itemId)?.name??"なし"}`).join("<br>");
 const sp=SPECIES[m.speciesId];app.insertAdjacentHTML("beforeend",Modal(displayName(m),`<div class="battle-detail"><div class="modal-monster-hero">${monsterVisual(m,sp.emoji??"👹",{className:"modal-monster-visual"})}<p><b>Lv.${m.level} ★${m.stars} +${m.plus}</b></p></div><p>HP ${m.currentHp??st.hp}/${st.hp}<br>MP ${m.currentMp??maxMp(m)}/${maxMp(m)}<br>ATK ${st.atk} / DEF ${st.def} / SPD ${st.spd}<br>会心 ${st.crit}% / 回避 ${st.evasion}%<br><b>${sp.race}族 / ${sp.role}</b><br>特性：${TRAITS[m.traitId]?.name??"安定"}（${TRAITS[m.traitId]?.description??""}）</p><p>EXP ${m.exp}/${need}</p><div class="battle-bar exp"><i style="width:${Math.min(100,m.exp/need*100)}%"></i></div><p>${gear}</p><p><b>スキル</b><br>${learnedSkills(m).map(x=>`${x.name}（MP${x.mp}）`).join("<br>")||"なし"}</p></div>`,"閉じる"));topModalButton().onclick=closeTopModal
}
function registerWeaponFinisher(monster,enemy,beforeHp){
 if(!monster||!enemy||beforeHp<=0||enemy.hp>0||enemy.captured||enemy.weaponKillRecorded)return;
 enemy.weaponKillRecorded=true;enemy.defeatedByMonsterId=monster.id;
 recordWeaponKill(save.state,monster.id,enemy)
}
function allyAttackFactor(id){return(1+effectValue(battle,id,"atkUp")-effectValue(battle,id,"atkDown"))}
function allyDefenseFactor(id){return Math.max(.2,1+effectValue(battle,id,"defUp")-effectValue(battle,id,"defDown"))}
function enemyAttackFactor(id){return Math.max(.2,1-effectValue(battle,id,"atkDown","enemy"))}
function enemyDefenseFactor(id){return Math.max(.2,1-effectValue(battle,id,"defDown","enemy"))}
function applySkillEffects(skill,a,e){for(const effect of skill.effects??[]){if(effect.enemy){const targets=skill.allEnemies?aliveEnemies(battle):[e].filter(Boolean),adjusted=effect.chance==null?effect:{...effect,chance:Math.min(1,effect.chance*(1+affixValue(a,"statusChance",100)/100))};targets.forEach(target=>applyBattleEffect(battle,target.id,adjusted,"enemy"))}else if(effect.allies){battle.party.filter(m=>m.currentHp>0).forEach(m=>applyBattleEffect(battle,m.id,effect,"ally"))}else applyBattleEffect(battle,a.id,effect,"ally")}}
async function command(type,skillId=null){
 if(battle.busy)return;
 const entry=currentTurnEntry(battle),a=actor();
 if(entry?.type!=="ally"||!a)return;
 battle.busy=true;
 const s=calculatedStats(a),e=selectedEnemy(battle);if(!e){battle.busy=false;return win(false,null)};battle.enemy=e;

 if(type==="attack"){
  addBattleLog(battle,`${displayName(a)}：たたかう`);await animateAttack(a.id);
  battle.actionCommitted=true;
  if(Math.random()<.06)await floatText("MISS",e.id,"miss");
  else{
   const critical=Math.random()<affixCriticalChance(s,Math.min(.35,.08+(s.spd??0)*.005)),weapon=save.state.equipment.find(item=>item.id===a.equipment?.weaponRight),magicWeapon=weapon?.weaponType==="staff"||(weapon?.stats?.matk??0)>(weapon?.stats?.atk??0),rangedWeapon=magicWeapon||weapon?.weaponType==="bow",rearLine=battle.party.indexOf(a)>=2,formationMultiplier=rearLine?(rangedWeapon?1.08:.78):1.05,attackStat=magicWeapon?(s.matk??s.atk):s.atk,defenseStat=magicWeapon?(e.mdef??e.def):e.def;
   const base=Math.max(1,Math.floor(attackStat*(.9+Math.random()*.2)-defenseStat*.4));
   const attackElement=a.attribute??SPECIES[a.speciesId]?.element??"neutral",critMult=1.7+affixValue(a,"critDamage",150)/100,damageStats={...s,_currentHpRatio:a.currentHp/Math.max(1,s.hp)},raw=(critical?Math.floor(base*critMult):base)*formationMultiplier*affixOutgoingDamageMultiplier(damageStats,e,attackElement)*affixExecutionMultiplier(a,e),beforeHp=e.hp,d=Math.max(1,Math.floor(raw*abyssBattleMultiplier(a,"partyDamageRate")*enemyDamageMultiplier(e)*endgameIncomingDamageMultiplier(e,attackElement)*weaponMasteryDamageMultiplier(save.state,a,e)));e.hp=Math.max(0,e.hp-d);registerWeaponFinisher(a,e,beforeHp);const steal=outgoingLifeSteal(a);if(steal){const h=Math.max(1,Math.floor(d*steal));a.currentHp=Math.min(s.hp,a.currentHp+h)}
   await animateHit(e.id,critical);if(critical){battleFlash("critical");burstParticles(e.id,"critical",16)}await floatText(`${critical?"CRITICAL ":""}-${d}`,e.id,critical?"critical":"damage");await trySeriesChainAttack(a,e,d);
  }
 }

 if(type==="skill"&&!skillId){battle.busy=false;battle.skillMenu=true;renderBattle();return}

 if(type==="skill"&&skillId){
  const skill=skillById(skillId),cd=cooldownRemaining(battle,a.id,skillId);
  if(!learnedSkills(a).some(x=>x.id===skillId)||!canUseSkill(a,skill,cd)){battle.busy=false;return alert(cd>0?`あと${cd}ラウンド使用できない`:"MPが足りない")}
  const listedMpCost=effectiveSkillMpCost(a,skill),freeSkill=listedMpCost>0&&Math.random()<affixValue(a,"freeSkillChance",60)/100,mpCost=freeSkill?0:listedMpCost;battle.skillMenu=false;let skillCompleted=true;addBattleLog(battle,`${displayName(a)}：${skill.name}（${freeSkill?"MP消費なし":`MP-${mpCost}`}）`);await battleBanner(skill.name,skill.description??"","skill",430);battle.actionCommitted=true;a.currentMp=Math.max(0,a.currentMp-mpCost);setSkillCooldown(battle,a.id,skill);
  if(skill.type==="selfHeal"||skill.type==="stance"&&skill.heal){
   const h=Math.max(1,Math.floor(s.hp*(skill.heal??0)*healMultiplier(a)));a.currentHp=Math.min(s.hp,a.currentHp+h);if(h>0)await floatText(`+${h}`,a.id,"heal");applySkillEffects(skill,a,e);
  }else if(skill.type==="allHeal"){
   const healed=[];battle.party.filter(m=>m.currentHp>0).forEach(m=>{const max=calculatedStats(m).hp,h=Math.max(1,Math.floor(max*skill.heal*healMultiplier(a))),before=m.currentHp;m.currentHp=Math.min(max,m.currentHp+h);healed.push(m.currentHp-before)});
   if(skill.revive){const target=battle.party.filter(m=>m.currentHp<=0).sort((x,y)=>calculatedStats(y).hp-calculatedStats(x).hp)[0];if(target){target.currentHp=Math.max(1,Math.floor(calculatedStats(target).hp*skill.revive));target.currentMp=Math.floor(maxMp(target)*(skill.reviveMp??.25));healed.push(target.currentHp)}}
   await floatText(`全体 +${Math.max(...healed)}`,"party","heal");if(skill.cleanse)battle.party.forEach(m=>{clearNegativeAllyEffects(battle,m.id);clearAilments(m)});applySkillEffects(skill,a,e);
  }else if(skill.type==="buff"||skill.type==="stance"){applySkillEffects(skill,a,e);if(skill.heal){const targets=skill.target==="味方全体"?battle.party.filter(m=>m.currentHp>0):[a];targets.forEach(m=>{const mx=calculatedStats(m).hp;m.currentHp=Math.min(mx,m.currentHp+Math.floor(mx*skill.heal*healMultiplier(a)))})}await floatText("EFFECT","party","guard");
  }else if(skill.type==="cleanse"){battle.party.forEach(m=>{clearNegativeAllyEffects(battle,m.id);clearAilments(m)});await floatText("CLEANSE","party","heal");
  }else if(skill.type==="mpHeal"){battle.party.filter(m=>m.currentHp>0).forEach(m=>m.currentMp=Math.min(maxMp(m),m.currentMp+Math.floor(maxMp(m)*(skill.mpHeal??.2))));await floatText("MP回復","party","heal");
  }else if(skill.type==="revive"){const target=battle.party.filter(m=>m.currentHp<=0).sort((x,y)=>calculatedStats(y).hp-calculatedStats(x).hp)[0];if(target){target.currentHp=Math.max(1,Math.floor(calculatedStats(target).hp*(skill.revive??.35)));target.currentMp=Math.floor(maxMp(target)*(skill.reviveMp??.25));await floatText("REVIVE",target.id,"heal")}else{skillCompleted=false;a.currentMp=Math.min(maxMp(a),a.currentMp+mpCost);if(battle.cooldowns?.[a.id])delete battle.cooldowns[a.id][skill.id]}
  }else{
   await animateAttack(a.id,true);const hits=skill.hits??1;let total=0;const skillTargets=skill.allEnemies?aliveEnemies(battle):[e];
   for(const targetEnemy of skillTargets){const e=targetEnemy;let targetTotal=0;for(let i=0;i<hits&&e.hp>0;i++){
    const critical=Boolean(skill.guaranteedCritical)||Math.random()<affixCriticalChance(s,Math.min(.65,.1+(skill.critBonus??0)+(s.spd??0)*.004)),ignore=Math.max(0,Math.min(.9,Number(skill.defenseIgnore)||0)),boosted={...s,atk:s.atk*allyAttackFactor(a.id),matk:(s.matk??s.atk)*allyAttackFactor(a.id),_currentHpRatio:a.currentHp/Math.max(1,s.hp)},execute=(skill.execute&&e.hp/e.maxHp<=skill.execute)?2:1,raw=skillDamage(boosted,{...e,def:e.def*enemyDefenseFactor(e.id)*(1-ignore),mdef:(e.mdef??e.def)*enemyDefenseFactor(e.id)*(1-ignore)},skill,critical)*execute*affixExecutionMultiplier(a,e)*(1+affixValue(a,"skillPower",200)/100),beforeHp=e.hp,d=Math.max(1,Math.floor(raw*abyssBattleMultiplier(a,"partyDamageRate")*enemyDamageMultiplier(e)*endgameIncomingDamageMultiplier(e,skill.element)*weaponMasteryDamageMultiplier(save.state,a,e)));
    e.hp=Math.max(0,e.hp-d);registerWeaponFinisher(a,e,beforeHp);total+=d;targetTotal+=d;await animateHit(e.id,critical);if(critical){battleFlash("critical");burstParticles(e.id,"critical",14)}await floatText(`${critical?"CRITICAL ":""}-${d}`,e.id,critical?"critical":"skill")
   }
    if(skill.currentHpDamage&&e.hp>0){const percentDamage=Math.max(1,Math.floor(e.hp*Math.min(.25,skill.currentHpDamage))),before=e.hp;e.hp=Math.max(0,e.hp-percentDamage);registerWeaponFinisher(a,e,before);total+=percentDamage;targetTotal+=percentDamage;await floatText(`割合 -${percentDamage}`,e.id,"skill")}
    if(skill.status&&e.hp>0&&Math.random()<Math.min(1,skill.status.chance*(1+affixValue(a,"statusChance",100)/100))){const applied=applyEnemyStatus(battle,{...skill.status,power:(skill.status.power??0)*(1+affixValue(a,"dotDamage",150)/100)*abyssBattleMultiplier(a,"partyDamageRate"),sourceMonsterId:a.id},e.id);if(applied){addBattleLog(battle,`${e.name}は${skill.status.name}状態になった`);await floatText(skill.status.name,e.id,skill.status.id)}}
    await trySeriesChainAttack(a,e,targetTotal);await trySeriesBurn(a,e,skill);
   }
   if(skill.type==="drain"||hasEffect(battle,a.id,"lifeSteal")||outgoingLifeSteal(a)>0){const rate=(skill.drain??0)+effectValue(battle,a.id,"lifeSteal")+outgoingLifeSteal(a),h=Math.max(1,Math.floor(total*Math.min(1.25,rate)));a.currentHp=Math.min(s.hp,a.currentHp+h);await floatText(`+${h}`,a.id,"heal")}
   if(skill.selfHeal){const h=Math.max(1,Math.floor(s.hp*skill.selfHeal));a.currentHp=Math.min(s.hp,a.currentHp+h);await floatText(`+${h}`,a.id,"heal")}if(skill.mpDrain){const gain=Math.max(1,Math.floor(maxMp(a)*Math.min(.5,skill.mpDrain)));a.currentMp=Math.min(maxMp(a),a.currentMp+gain);await floatText(`MP +${gain}`,a.id,"heal")}applySkillEffects(skill,a,e)
  }
  if(skillCompleted){const echoChance=affixValue(a,"arcaneEcho",60)/100;if(mpCost>0&&echoChance&&Math.random()<echoChance){a.currentMp=Math.min(maxMp(a),a.currentMp+mpCost);addBattleLog(battle,`${displayName(a)}：MP還元が発動`);await floatText(`MP +${mpCost}`,a.id,"heal")}const beforeMasteryLevel=skillProgressFor(a,skill.id).level,masteryBonus=Math.max(0,Number(a._equipmentAffixes?.skillMasteryGain??0)),mastery=recordSkillUse(a,skill.id,1+masteryBonus/100);if(mastery.level>beforeMasteryLevel){addBattleLog(battle,`${displayName(a)}：${skill.name} 熟練Lv.${mastery.level}へ上昇`);await floatText(`SKILL Lv.${mastery.level}`,a.id,"skill")}}
 }

 if(type==="guard"){
  battle.actionCommitted=true;battle.guards[a.id]=true;addBattleLog(battle,`${displayName(a)}：ガード`);await floatText("GUARD",a.id,"guard")
 }

 if(type==="item"){battle.busy=false;battle.auto=false;save.state.settings.autoBattle=false;battle.itemMenu=true;save.save();renderBattle();return}

 if(type==="capture"){
  if((save.state.monsters?.length??0)>=500){battle.busy=false;return alert("モンスター所持数が500体で満杯です。先に整理してください。")}
  if(e.boss&&!battle.bossMemoryBattle){battle.busy=false;return alert("階層ボスの捕獲は、撃破後に「深淵の記憶」から再戦した時だけ挑戦できます。")}
  if(e.uncapturable&&!battle.bossMemoryBattle){battle.busy=false;return alert("この存在は捕獲できません")}
  if(save.state.inventory.captureCrystals<=0){battle.busy=false;return alert("捕獲結晶がない")}
  battle.actionCommitted=true;save.state.inventory.captureCrystals--;addBattleLog(battle,"捕獲を試みた");
  const equipmentCaptureBonus=Math.min(50,affixValue(a,"captureRate",50)+equipmentStatValue(a,"capture",50))/100,statusCaptureBonus=captureStatusBonus(battle.enemyStatuses?.[e.id]??[]),baseCapture=e.boss?(.01+(1-e.hp/e.maxHp)*.04)*currentDanger().bossCapture+equipmentCaptureBonus+statusCaptureBonus:.2+(1-e.hp/e.maxHp)*.55+(Math.max(...battle.party.map(m=>m.level+m.stars*2+m.plus))-e.level)*.012+equipmentCaptureBonus+statusCaptureBonus,chance=e.boss?Math.max(.01,abyssExplorationChance(save.state,baseCapture,null,{max:.20})):Math.max(.08,abyssExplorationChance(save.state,baseCapture,null,{max:.95}));
  await floatText(`捕獲 ${Math.round(chance*100)}%`,e.id,"capture");await wait(500);
  if(Math.random()<chance){const m=createMonster(e.speciesId,{level:e.level,isBoss:e.boss,sealedPower:e.boss?{state:"sealed",originalDanger:e.dangerLevel??1,awakening:0}:null,obtainedMethod:"capture",obtainedFloor:battle.memorySourceFloor??save.state.player.currentFloor,nickname:e.boss?`封印 ${SPECIES[e.speciesId].name}`:undefined});save.state.monsters.push(m);save.state.records.captures++;save.state.codex.captures[e.speciesId]=(save.state.codex.captures[e.speciesId]??0)+1;e.captured=true;e.hp=0;save.save();battleFlash("capture");burstParticles(e.id,"capture",22);await battleBanner("CAPTURE!",`${e.name}が仲間になった`,"capture",760);await animateDefeat(e.id,true);battle.targetEnemyId=aliveEnemies(battle)[0]?.id??null;if(!aliveEnemies(battle).length)return win(true,m);addBattleLog(battle,`${e.name}を捕獲した`)}
 }

 saveBattleCheckpoint();renderBattle();await wait(260);
 if(e.hp<=0){await animateDefeat(e.id);battle.targetEnemyId=aliveEnemies(battle)[0]?.id??null;if(!aliveEnemies(battle).length)return win(false,null)}
 battle.busy=false;
 await finishCurrentAction();
}
function chooseEnemyTarget(enemy=null,mode="normal"){
 const alive=battle.party.filter(monster=>monster.currentHp>0);if(!alive.length)return null;
 const taunters=alive.filter(monster=>hasEffect(battle,monster.id,"taunt"));if(taunters.length)return taunters[Math.floor(Math.random()*taunters.length)];
 const guarded=alive.filter(monster=>battle.guards[monster.id]);if(guarded.length&&Math.random()<.45)return guarded[Math.floor(Math.random()*guarded.length)];
 if(enemy?.endgameBossId){
  if(mode==="weak")return [...alive].sort((a,b)=>(a.currentHp/calculatedStats(a).hp)-(b.currentHp/calculatedStats(b).hp))[0];
  if(mode==="threat")return [...alive].sort((a,b)=>Math.max(calculatedStats(b).atk,calculatedStats(b).matk??0)-Math.max(calculatedStats(a).atk,calculatedStats(a).matk??0))[0];
 }
 const front=alive.filter(monster=>battle.party.indexOf(monster)<2),rear=alive.filter(monster=>battle.party.indexOf(monster)>=2),role=SPECIES[enemy?.speciesId]?.role??"",ranged=["mage","healer","support","ranged"].includes(role);
 if(front.length&&!enemy?.endgameBossId){
  const pool=ranged&&rear.length&&Math.random()<.3?rear:front;
  return pool[Math.floor(Math.random()*pool.length)];
 }
 return alive[Math.floor(Math.random()*alive.length)];
}
async function dealEnemyHit(e,target,multiplier=1,label="",criticalChance=.08,element=null,rules={}){
 const st=calculatedStats(target),guard=Boolean(battle.guards[target.id]),critical=Boolean(rules.guaranteedCritical)||Math.random()<criticalChance;
 if(!rules.guaranteedHit&&Math.random()<Math.min(.60,(st.evasion??0)/100)){addBattleLog(battle,`${displayName(target)}が回避した`);await floatText("DODGE",target.id,"miss");return 0}
 const ignore=Math.max(0,Math.min(.9,Number(rules.defenseIgnore)||0)),execute=rules.execute&&target.currentHp/Math.max(1,st.hp)<=rules.execute?2:1,guardFx=Math.min(.85,effectValue(battle,target.id,"guard")*(1+affixValue(target,"guardPower",100)/100)),vulnerable=effectValue(battle,target.id,"vulnerable"),reduction=Math.min(.75,affixValue(target,"damageReduction",75)/100),attackElement=element??SPECIES[e.speciesId]?.element??null,resistance=elementalResistance(target,attackElement);let d=Math.max(1,Math.floor((e.atk*enemyAttackFactor(e.id)-st.def*(1-ignore)*allyDefenseFactor(target.id)*.45)*multiplier*execute*(guard&&!rules.guaranteedHit?Math.max(.15,.45-affixValue(target,"guardPower",100)/200):1)*(1-guardFx)*(1+vulnerable)*(1-reduction)*(1-resistance)*abyssBattleMultiplier(target,"partyDamageTakenRate")));if(rules.currentHpDamage)d+=Math.max(1,Math.floor(target.currentHp*Math.min(.25,rules.currentHpDamage)));if(critical)d=Math.floor(d*1.55);
 target.currentHp=Math.max(0,target.currentHp-d);if(target.currentHp<=0&&tryUnyielding(target)){addBattleLog(battle,`${displayName(target)}の致死耐性が発動！`);await floatText("UNYIELDING",target.id,"guard")}else addBattleLog(battle,`${displayName(target)}に${d}ダメージ`);
 await animateHit(target.id,critical);if(critical){battleFlash("danger");burstParticles(target.id,"enemy",14)}await floatText(`${label}${critical?"CRITICAL ":""}-${d}`,target.id,critical?"critical":"enemy");
 if(target.currentHp<=0)await animateDefeat(target.id);else if(hasEffect(battle,target.id,"counter")){const cs=calculatedStats(target),counterBoost=1+affixValue(target,"counterDamage",150)/100,counter=Math.max(1,Math.floor((cs.atk*effectValue(battle,target.id,"counter")-e.def*.25)*counterBoost*abyssBattleMultiplier(target,"partyDamageRate")));e.hp=Math.max(0,e.hp-counter);addBattleLog(battle,`${displayName(target)}が${counter}反撃ダメージ`);await floatText(`COUNTER -${counter}`,e.id,"skill")}return d;
}
async function resolveEnemySpecialAction(e,action){
 const info=specialActionInfo(action);if(!info)return false;
 await battleBanner(info.label,e.name,e.faction==="tenGod"?"boss":"skill",720);battleFlash(e.faction==="tenGod"?"boss":"danger");
 if(info.utility){
  const allies=info.effects?.some(effect=>effect.allies)?battle.enemies.filter(enemy=>enemy.hp>0):[e];
  if(info.heal){for(const ally of allies){const amount=Math.max(1,Math.floor(ally.maxHp*info.heal));ally.hp=Math.min(ally.maxHp,ally.hp+amount);await floatText(`+${amount}`,ally.id,"heal")}}
  if(info.revive){const fallen=battle.enemies.find(enemy=>enemy.hp<=0);if(fallen){fallen.hp=Math.max(1,Math.floor(fallen.maxHp*info.revive));await floatText("RECREATE",fallen.id,"heal")}}
  for(const effect of info.effects??[])for(const ally of(effect.allies?allies:[e])){if(effect.kind==="atkUp")ally.atk=Math.floor(ally.atk*(1+(effect.value??.2)));if(effect.kind==="defUp")ally.def=Math.floor(ally.def*(1+(effect.value??.2)));if(effect.kind==="spdUp")ally.spd=Math.floor(ally.spd*(1+(effect.value??.2)));if(effect.kind==="guard")ally.divineBarrier=Math.max(ally.divineBarrier??0,Math.max(1,effect.turns??2));if(effect.kind==="regen")ally.eliteRegen=Math.max(ally.eliteRegen??0,effect.value??.1)}
  if(info.selfHeal){const amount=Math.max(1,Math.floor(e.maxHp*info.selfHeal));e.hp=Math.min(e.maxHp,e.hp+amount);await floatText(`+${amount}`,e.id,"heal")}return true;
 }
 const alive=battle.party.filter(monster=>monster.currentHp>0);
 let targets=[];
 if(info.pattern==="all")targets=alive;
 else if(info.pattern==="random3")targets=[...alive].sort(()=>Math.random()-.5).slice(0,Math.min(3,alive.length));
 else if(info.pattern==="singleWeak")targets=[chooseEnemyTarget(e,"weak")].filter(Boolean);
 else if(info.pattern==="singleStrong")targets=[chooseEnemyTarget(e,"threat")].filter(Boolean);
 else targets=[chooseEnemyTarget(e,"normal")].filter(Boolean);
 const elements={inferno:"fire",tidal:"water",thunderstorm:"lightning",tempest:"wind",quake:"earth",radiance:"light",eclipse:"dark",absoluteZero:"water",timeStop:"light",starfall:"wind"};
 let multiplier=specialActionMultiplier(action)*(e.enraged?1.25:1),totalDamage=0;
 if(info.copyAtk){
  const strongest=Math.max(1,...alive.map(monster=>{const stats=calculatedStats(monster);return Math.max(stats.atk,stats.matk??0)}));
  multiplier*=Math.max(1,Math.min(2,strongest/Math.max(1,e.atk)));
 }
 for(const target of targets){
  await animateAttack(e.id,true);
  const dealt=await dealEnemyHit(e,target,multiplier,`${info.label} `,e.faction==="tenGod"?.16:.11,info.element??elements[action]??null,info);totalDamage+=dealt;
  if(dealt&&info.mpDrain){const drained=Math.max(0,Math.floor((target.currentMp??0)*Math.min(.8,info.mpDrain)));target.currentMp=Math.max(0,(target.currentMp??0)-drained);e.hp=Math.min(e.maxHp,e.hp+drained)}
  if(dealt&&info.status){const persistent=["poison","burn","bleed","curse","paralysis","freeze","shock","sleep"].includes(info.status.id),effect=persistent?{...info.status,kind:info.status.id}:{kind:"stun",statusId:info.status.id,chance:info.status.chance,turns:info.status.turns??1};if(applyBattleEffect(battle,target.id,effect,"ally"))await floatText(info.status.name,target.id,info.status.id)}
  for(const effect of info.effects??[])if(effect.enemy)applyBattleEffect(battle,target.id,{...effect,statusId:effect.statusId??effect.kind},"ally");
 }
 if(info.drain&&totalDamage>0){const amount=Math.max(1,Math.floor(totalDamage*info.drain));e.hp=Math.min(e.maxHp,e.hp+amount);await floatText(`+${amount}`,e.id,"heal")}
 if(info.selfHeal){const amount=Math.max(1,Math.floor(e.maxHp*info.selfHeal));e.hp=Math.min(e.maxHp,e.hp+amount);await floatText(`+${amount}`,e.id,"heal")}
 if(info.selfAtk)e.atk=Math.max(1,Math.floor(e.atk*(1+info.selfAtk)));
 if(info.selfDef)e.def=Math.max(0,Math.floor(e.def*(1+info.selfDef)));
 if(info.selfSpd)e.spd=Math.max(1,Math.floor(e.spd*(1+info.selfSpd)));
 if(info.barrier)e.divineBarrier=Math.max(e.divineBarrier??0,info.barrier);
 if(info.slow)for(const target of targets.filter(monster=>monster.currentHp>0))applyBattleEffect(battle,target.id,{kind:"spdDown",value:info.slow,turns:3,chance:1},"ally");
 return true;
}
async function enemyTurn(){
 if(battle.busy)return;const entry=currentTurnEntry(battle);if(entry?.type!=="enemy")return continueBattleFlow();
 battle.busy=true;const e=currentEnemy(battle);if(!e){battle.busy=false;return finishCurrentAction()}battle.enemy=e;const action=chooseEnemyAction(e);addBattleLog(battle,`${e.name}：${e.intent}`);battle.actionCommitted=true;
 if(action===ENEMY_ACTIONS.guard){await floatText("GUARD",e.id,"guard")}
 else if(action===ENEMY_ACTIONS.charge){await floatText("CHARGE",e.id,"charge")}
 else if(action===ENEMY_ACTIONS.heal){const h=enemyHealAmount(e);e.hp=Math.min(e.maxHp,e.hp+h);await floatText(`+${h}`,e.id,"heal")}
 else if(action===ENEMY_ACTIONS.enrage){e.atk=Math.floor(e.atk*1.18);e.def=Math.floor(e.def*1.08);await battleBanner(e.endgameBossId?"AUTHORITY RELEASE":"ENRAGE",e.intent,e.faction==="tenGod"?"boss":"skill",620);await floatText("ENRAGE",e.id,"enrage");await animateHit(e.id,true)}
 else if(action===ENEMY_ACTIONS.divineBarrier){await battleBanner("DIVINE BARRIER","受けるダメージを大幅軽減","boss",650);await floatText("BARRIER",e.id,"guard")}
 else if(specialActionInfo(action)){await resolveEnemySpecialAction(e,action)}
 else{
  const target=chooseEnemyTarget(e,e.endgameBossId?"threat":"normal");if(!target){battle.busy=false;return lose()};await animateAttack(e.id,action===ENEMY_ACTIONS.power);
  if(action!==ENEMY_ACTIONS.power&&Math.random()<.05)await floatText("MISS",target.id,"miss");else await dealEnemyHit(e,target,enemyAttackMultiplier(e,action),action===ENEMY_ACTIONS.power?"強撃 ":"",e.enraged?.13:.08);
 }
 saveBattleCheckpoint();renderBattle();await wait(300);battle.busy=false;if(!battle.party.some(m=>m.currentHp>0))return lose();await finishCurrentAction();
}
async function finishCurrentAction(){
 if(battle?.escapePending){battle.busy=false;const escaped=await resolveEscape();if(escaped||!battle)return;if(!battle.escapePending&&battle.busy)return}
 advanceQueue(battle);
 battle.actionCommitted=false;
 if(queueFinished(battle))return endRound();
 renderBattle();
 await wait(180);
 return continueBattleFlow();
}
async function endRound(){
 battle.busy=true;
 const statusResults=processEnemyStatuses(battle);
 for(const enemy of(battle.enemies??[]).filter(e=>e.hp>0&&e.eliteRegen>0)){const healed=Math.max(1,Math.floor(enemy.maxHp*enemy.eliteRegen));enemy.hp=Math.min(enemy.maxHp,enemy.hp+healed);addBattleLog(battle,`${enemy.name}は${healed}回復した`);await floatText(`+${healed}`,enemy.id,"heal")}
 for(const result of statusResults){if(result.enemy.hp<=0&&result.sourceMonsterId){const source=battle.party.find(monster=>monster.id===result.sourceMonsterId);registerWeaponFinisher(source,result.enemy,result.beforeHp)}addBattleLog(battle,`${result.enemy.name}に${result.name} ${result.damage}ダメージ`);renderBattle();await floatText(`-${result.damage}`,result.enemy.id,result.id)}
 const partyRegen=Math.min(.08,battle.party.reduce((sum,monster)=>sum+seriesEffectValue(monster,"partyHpRegen",.08),0));
 for(const monster of battle.party.filter(m=>m.currentHp>0)){
  const max=calculatedStats(monster).hp,lowRegen=monster.currentHp/max<=.35?seriesEffectValue(monster,"lowHpRegen",.12):0,rate=Math.min(.25,equipmentRegenRate(monster)+lowRegen+partyRegen);
  if(rate){const amount=Math.max(1,Math.floor(max*rate)),before=monster.currentHp;monster.currentHp=Math.min(max,monster.currentHp+amount);const healed=monster.currentHp-before;if(healed){addBattleLog(battle,`${displayName(monster)}の装備再生 +${healed}`);await floatText(`+${healed}`,monster.id,"heal")}}
  const mpGain=Math.max(0,Math.floor(seriesEffectValue(monster,"mpRegen",20)));if(mpGain){const before=monster.currentMp;monster.currentMp=Math.min(maxMp(monster),monster.currentMp+mpGain);if(monster.currentMp>before)await floatText(`MP +${monster.currentMp-before}`,monster.id,"heal")}
 }
 const allyResults=processAllyEffects(battle,calculatedStats);for(const result of allyResults){addBattleLog(battle,`${displayName(result.monster)} ${result.kind==="heal"?"回復":"継続ダメージ"} ${result.amount}`);await floatText(`${result.kind==="heal"?"+":"-"}${result.amount}`,result.monster.id,result.kind==="heal"?"heal":result.kind)}
 tickCooldowns(battle);tickBattleEffects(battle);
 battle.guards={};
 for(const e of(battle.enemies??[]).filter(x=>x.hp<=0))await animateDefeat(e.id);if(!aliveEnemies(battle).length)return win(false,null)
 if(!battle.party.some(m=>m.currentHp>0))return lose();
 battle.turn++;
 buildTurnQueue(battle);
 addBattleLog(battle,`ROUND ${battle.turn}：${battle.turnQueue.map(entry=>entry.name).join(" → ")}`);
 battle.busy=false;saveBattleCheckpoint();renderBattle();
 await wait(260);
 return continueBattleFlow();
}
async function continueBattleFlow(){
 if(!battle||battle.busy)return;
 if(battle.escapePending)return resolveEscape();
 skipInvalidEntries(battle);
 if(queueFinished(battle))return endRound();
 const entry=currentTurnEntry(battle);
 renderBattle();
 if(entry?.type==="enemy")return enemyTurn();
 if(entry?.type==="ally"&&battle.auto){await wait(220);const a=currentAlly(battle);if(a){a._maxHp=calculatedStats(a).hp;const skill=chooseAutoSkill(a,battle);if(skill)return command("skill",skill.id)}return command("attack")}
}
function expNeed(m){return expNeedFor(m)}
function finishBossMemoryVictory(caught,monster){
 const enemy=(battle?.enemies??[battle?.enemy]).filter(Boolean)[0],name=enemy?.name??SPECIES[enemy?.speciesId]?.name??"階層支配者";
 syncPersistentAilments(battle);clearPartySynergy();clearBattleCheckpoint();activeEnemy=null;
 document.querySelector(".battle-screen")?.remove();
 save.save();
 const body=`<div class="memory-victory-result">
  <img src="assets/ui/v2/memory-rift.png" alt="" class="memory-victory-rift">
  <small>BOSS MEMORY CLEARED</small>
  <h2>${caught?"深淵の契約成立":"記憶を制覇"}</h2>
  <p>${caught?`${displayName(monster)}を深淵の記憶から連れ帰りました。`:`${name}の記憶を打ち破りました。`}</p>
  <div class="memory-victory-note">${caught?`${pixelIcon("event")} 捕獲個体は魔物一覧へ追加済みです。`:"この再戦ではGOLD・EXP・撃破報酬・階層進行は発生しません。"}</div>
 </div>`;
 app.insertAdjacentHTML("beforeend",Modal(caught?"捕獲成功！":"深淵の記憶",body,"拠点へ戻る"));
 const modal=topModal(),finish=()=>{modal?.remove();battle=null;go("home")};
 modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish
}
function win(caught,m){
 if(battle?.specialBattle)return finishSpecialBattle(true);
 audio.setScene("victory");audio.sfx("victory");
 const memoryBattle=Boolean(battle?.memoryBattle),defeated=(battle.enemies??[battle.enemy]).filter(Boolean),floor=memoryBattle?(battle.memorySourceFloor??save.state.player.currentFloor):save.state.player.currentFloor,boss=defeated.find(e=>e.boss),eliteDefeated=defeated.filter(e=>e.elite&&!e.captured),firstBoss=!!boss&&!memoryBattle&&!save.state.player.bossRewards[floor];
 const rewardMult=eliteDefeated.length?1.65:1,baseGold=battleGoldBase(floor,defeated,{firstBoss}),gold=modifiedGoldReward(save.state,baseGold,"battle");
 save.state.player.gold+=gold;
 save.state.records.kills+=defeated.filter(e=>!e.captured).length;
 const baseGain=defeated.reduce((sum,e)=>{
  if(e.boss)return sum+(firstBoss?Math.round(110+e.level*28):Math.round(24+e.level*8));
  if(e.rareExp)return sum+Math.round(100+e.level*22);
  const difficulty=(e.gear?1.35:1)*(e.level>floor+4?1.2:1);
  return sum+Math.max(6,Math.round((10+e.level*4.4)*difficulty))
 },0);
 const totalExp=Math.round(baseGain*battle.party.length*rewardMult*abyssSkillMultiplier(save.state,"explorationRewardRate"));
 const crystalRoll=defeated.reduce((sum,e)=>{const chance=e.boss?1:e.speciesId==="mimic"?1:e.gear?.25:.06;if(Math.random()<abyssExplorationChance(save.state,chance,null,{max:1}))return sum+(e.boss?20+Math.floor(e.level/10):e.speciesId==="mimic"?3+Math.floor(Math.random()*8):1);return sum},0);if(crystalRoll)save.state.player.crystals+=crystalRoll;
 const eliteAmountRate=abyssSkillEffectTotal(save.state,"eliteRewardRate")+abyssSkillEffectTotal(save.state,"explorationRewardRate");
 let eliteBonusGold=0,eliteBonusCrystals=0,eliteKeyDrop=false;for(const elite of eliteDefeated){const reward=eliteRewards(elite,floor);eliteBonusGold+=modifiedGoldReward(save.state,reward.gold,"elite");eliteBonusCrystals+=Math.max(0,Math.round(reward.crystals*(1+eliteAmountRate)));eliteKeyDrop=eliteKeyDrop||Math.random()<abyssExplorationChance(save.state,reward.keyChance,"abyssKeyDropRate",{max:.95});recordEliteDefeat(save.state,elite)}save.state.player.gold+=eliteBonusGold;save.state.player.crystals+=eliteBonusCrystals;
 const keyDrop=eliteKeyDrop||defeated.some(e=>!e.boss&&Math.random()<abyssExplorationChance(save.state,.002*currentDanger().keyRate,"abyssKeyDropRate",{max:.95}))||(firstBoss&&floor%50===0);
 if(keyDrop)save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+1;
 const survivors=battle.party.filter(monster=>monster.currentHp>0);
 const share=survivors.length?Math.floor(totalExp/survivors.length):0;
 let remainder=survivors.length?totalExp%survivors.length:0;

 const participationKills=defeated.filter(e=>!e.captured).length;
 const seriesMasteryResults=recordSeriesBattle(save.state,battle.party,save.state.equipment,{boss:!!boss});
 battle.party.forEach(monster=>{monster.affection=Math.min(1000,(monster.affection??monster.bond??0)+(boss?5:2));monster.bond=monster.affection;monster.history??={};monster.history.adventures=(monster.history.adventures??0)+1;monster.history.battles=(monster.history.battles??0)+1;monster.history.victories=(monster.history.victories??0)+1;monster.history.kills=(monster.history.kills??0)+participationKills;monster.history.bossDefeats=(monster.history.bossDefeats??0)+(boss?1:0);monster.history.highestFloor=Math.max(monster.history.highestFloor??1,floor);monster.history.lastDeployedAt=new Date().toISOString();monster.history.consecutiveDeployments=(monster.history.consecutiveDeployments??0)+1;monster.history.longestConsecutiveDeployments=Math.max(monster.history.longestConsecutiveDeployments??0,monster.history.consecutiveDeployments);monster.battles=(monster.battles??0)+1;});
 const progress=battle.party.map(monster=>{
  const alive=monster.currentHp>0;
  const before={level:monster.level,exp:monster.exp,need:expNeed(monster),stats:{...calculatedStats(monster)},hp:monster.currentHp,mp:monster.currentMp};
  const personalExpBonus=(affixValue(monster,"expGain",200)+affixValue(monster,"abyssGrowth",200))/100;const gain=alive?Math.round((share+(remainder-->0?1:0))*(1+personalExpBonus)):0;
  const previousLevel=monster.level;
  applyTotalExperience(monster,totalExperience(monster)+gain);
  const levels=Math.max(0,monster.level-previousLevel);
  if(levels){
   // Level changes raise the caps, but are not a formal recovery action.
   // Keep expedition attrition intact and only clamp impossible saved values.
   monster.currentHp=Math.min(calculatedStats(monster).hp,Math.max(0,Number(monster.currentHp)||0));
   monster.currentMp=Math.min(maxMp(monster),Math.max(0,Number(monster.currentMp)||0));
  }

  return{ x:monster,before,gain,levels,need:expNeed(monster),alive,afterStats:{...calculatedStats(monster)} };
 });

 let drop=null,dropReceipt=null;
 const geared=defeated.find(e=>e.gear);
 const dropBonus=partyAffixTotal("dropRate",200)/100,rareBonus=partyAffixTotal("treasureSense",200)/100,rarityLuck=abyssEquipmentRarityBonus(save.state);
 const gearedDropChance=abyssExplorationChance(save.state,.18*(1+dropBonus),"equipmentDropRate",{additive:true,max:.85}),genericDropChance=abyssExplorationChance(save.state,.12*(1+dropBonus),"equipmentDropRate",{additive:true,max:.75});
 if(geared&&Math.random()<gearedDropChance){drop={...geared.gear,id:crypto.randomUUID?.()??`${Date.now()}-${Math.random()}`,equippedBy:null,createdAt:new Date().toISOString()};dropReceipt=equipmentReceipt(drop)}else if(Math.random()<genericDropChance){const rarityRoll=Math.random(),rarity=rarityRoll<Math.min(.35,.04+rareBonus*.12+rarityLuck*.01)?"LR":rarityRoll<Math.min(.70,.18+rareBonus*.22+rarityLuck*.04)?"SSR":rarityRoll<.60?"SR":undefined;drop=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)],rarity?{rarity}:undefined);dropReceipt=equipmentReceipt(drop)}

 if(boss&&!memoryBattle&&snapshot?.world)snapshot.world.boss=null;
 syncPersistentAilments(battle);persistExpeditionSnapshot(snapshot,{saveNow:false});clearPartySynergy();clearBattleCheckpoint();
 activeEnemy=null;
 document.querySelector(".battle-screen")?.remove();

 const resultTitle=boss?"討伐":caught?"捕獲成功":"勝利",resultEnglish=boss?"BOSS DEFEATED":caught?"CAPTURE SUCCESS":"VICTORY";
 const victorySubtitle=boss?`${String(boss.name??SPECIES[boss.speciesId]?.name??"BOSS").replace(/^⚔️\s*/,"")}を撃破`:caught?`${displayName(m)}と契約成立`:"探索戦闘を制圧";
 const result=`<div class="battle-result-cinematic ${boss?"boss-clear":""} ${caught?"capture-clear":""}">
  <div class="victory-particles" aria-hidden="true"></div><div class="victory-crest">${pixelIcon("crossed-swords")}</div>
  <small>BATTLE RESULT</small><div class="victory-title"><span>${resultTitle}</span><em>${resultEnglish}</em></div><div class="victory-subtitle">${victorySubtitle}</div>
 </div>
 <div class="result-reward-grid">
  <article><span>${pixelIcon("coin")}</span><small>獲得GOLD</small><b>+${gold.toLocaleString()}G</b></article>
  <article><span>${pixelIcon("growth")}</span><small>総獲得EXP</small><b>+${totalExp.toLocaleString()}</b></article>
  <article><span>${pixelIcon("formation")}</span><small>生存・分配</small><b>${survivors.length}/${battle.party.length}体</b></article>
 </div>
 <div class="battle-result-bonuses">
  ${crystalRoll+eliteBonusCrystals?`<p>${pixelIcon("crystal")} 魔晶石 <b>+${(crystalRoll+eliteBonusCrystals).toLocaleString()}</b></p>`:""}
  ${eliteBonusGold?`<p class="elite-reward">${pixelIcon("crossed-swords")} エリート討伐 <b>+${eliteBonusGold.toLocaleString()}G</b></p>`:""}
  ${drop?`<p class="equipment-drop">${pixelIcon("equipment")} <b>[${drop.rarity}] ${drop.name} <em class="equipment-drop-level">Lv.${Math.max(1,Number(drop.level)||1)}</em></b><small>${slotLabel(drop.slot)}・${dropReceipt.message}</small></p>`:""}
  ${keyDrop?`<p>${pixelIcon("key")} <b>深淵の鍵を獲得</b></p>`:""}
  ${caught?`<p>${pixelIcon("capture")} <b>${displayName(m)}を捕獲</b></p>`:""}
  ${firstBoss?`<p>${pixelIcon("event")} <b>初回ボス撃破ボーナス</b></p>`:""}
  ${seriesMasteryResults.length?`<div class="series-mastery-result">${seriesMasteryResults.map(row=>`<small>${row.leveled?`${pixelIcon("skills")} `:""}${EQUIPMENT_SERIES[row.seriesId]?.name??row.seriesId}熟練度 +${row.amount}${row.leveled?`　Lv.${row.after.level} ${row.after.label}へ！`:""}</small>`).join("")}</div>`:""}
 </div>
 <div class="exp-results compact result-party-grid">${progress.map(p=>{const hpMax=p.afterStats.hp,mpMax=maxMp(p.x),remaining=Math.max(0,p.need-p.x.exp),diff=k=>p.afterStats[k]-(p.before.stats[k]??0);return`<div class="${p.alive?"":"exp-defeated"} ${p.levels?"level-up-card level-up-reveal":""}">${p.levels?`<strong class="result-level-up-badge">LEVEL UP +${p.levels}</strong>`:""}<span>${monsterVisual(p.x,SPECIES[p.x.speciesId].emoji,{frame:p.alive?"idle":"down",className:"battle-result-monster-visual"})}</span><section><b>${displayName(p.x)} ${p.levels?`Lv.${p.before.level} → ${p.x.level}`:`Lv.${p.x.level}`}</b><div class="result-vitals"><small>HP ${p.x.currentHp}/${hpMax}</small><small>MP ${p.x.currentMp}/${mpMax}</small><small>${p.alive?`あと${remaining}EXP`:"戦闘不能・EXP 0"}</small></div><i class="result-exp"><u style="width:${Math.min(100,p.x.exp/Math.max(1,p.need)*100)}%"></u></i>${p.levels?`<div class="level-gains"><span>HP <strong>+${diff("hp")}</strong></span><span>ATK <strong>+${diff("atk")}</strong></span><span>DEF <strong>+${diff("def")}</strong></span><span>SPD <strong>+${diff("spd")}</strong></span></div>`:""}</section></div>`}).join("")}</div>`;

 if(boss&&!memoryBattle){battle.enemy=boss;save.state.player.bossKills[floor]=(save.state.player.bossKills[floor]??0)+1;if(floor===1000)mark1000FloorCleared(save.state);if(floor===WORLD_MAX_FLOOR)mark10000FloorCleared(save.state);recordBiomeBoss(save.state,floor);if(snapshot?.world)snapshot.world.boss=null;persistExpeditionSnapshot(snapshot);if(firstBoss)return showBossRewards(result)}
 const playTrueEnding=Boolean(!memoryBattle&&boss&&floor===WORLD_MAX_FLOOR&&!save.state.flags?.ending10000Played);
 app.insertAdjacentHTML("beforeend",Modal(caught?"捕獲成功！":"戦闘結果",result,memoryBattle?"拠点へ戻る":"探索を続ける"));
 const resultModal=topModal();let resultClosed=false;
 const returnToExplore=()=>{if(resultClosed)return;resultClosed=true;resultModal?.remove();battle=null;if(playTrueEnding){play10000EndingSequence();return}screen=memoryBattle?"home":"explore";render()};
 resultModal._onDismiss=returnToExplore;
 resultModal.querySelector("[data-modal-primary]").onclick=returnToExplore;
}
function randomFrom(list){return list[Math.floor(Math.random()*list.length)]}
function bossRewardEquipment(floor,boss,slot,weaponType=null){
 const rarity=floor>=1000?"神話":floor>=250?"LR":Math.random()<.55?"LR":"SSR";
 let base;
 if(slot==="weapon"){
  const pool=EQUIPMENT_BASES.weapon.filter(item=>weaponType?item.weaponType===weaponType:true);
  base=randomFrom(pool.length?pool:EQUIPMENT_BASES.weapon)
 }else base=randomFrom(EQUIPMENT_BASES[slot]);
 const item=createEquipment(slot,{rarity,base});
 const bossName=String(boss?.name??SPECIES[boss?.speciesId]?.name??"深淵王").replace(/^⚔️\s*/,"");
 const suffix=slot==="weapon"?(base.weaponType==="staff"?"魔導杖":base.weaponType==="bow"?"魔弓":"王装"):slot==="armor"?"覇装":"秘宝";
 item.name=floor===WORLD_MAX_FLOOR&&slot==="weapon"?"終界神装・神格":`${bossName}の${suffix}`;
 return item
}
function createBossRewardOptions(floor,boss){
 const weaponType=randomFrom(["staff","bow",null]),primary=bossRewardEquipment(floor,boss,"weapon",weaponType);
 const secondarySlot=Math.random()<.5?"armor":"accessory",secondary=bossRewardEquipment(floor,boss,secondarySlot);
 const gold=Math.max(200000,Math.round((floor+30)*6500*(.8+Math.random()*.5)/1000)*1000);
 const crystals=Math.max(100,Math.round((70+floor*1.8)/10)*10);
 const captureCrystals=Math.max(10,8+Math.floor(floor/12)),heals=Math.max(5,4+Math.floor(floor/50));
 const equipmentChoice=item=>({
  id:`equipment-${item.id}`,type:"equipment",icon:"equipment",item,title:`[${item.rarity}] ${item.name}`,
  desc:`${item.weaponType==="staff"?"後衛魔法向け":item.weaponType==="bow"?"後衛物理向け":item.slot==="armor"?"生存力を伸ばす防具":item.slot==="accessory"?"戦術を変える装飾品":"前衛向け武器"} / ${Object.entries(item.stats).map(([key,value])=>`${equipmentStatLabel(key)}+${value}`).join("・")}`
 });
 const economy=[
  {id:`gold-${floor}`,type:"gold",icon:"coin",amount:gold,title:`GOLD ${gold.toLocaleString()}G`,desc:"深淵ツリー・装備厳選に使える大量資金"},
  {id:`crystal-${floor}`,type:"crystal",icon:"crystal",amount:crystals,title:`魔晶石 ×${crystals.toLocaleString()}`,desc:"召喚・育成・記憶再戦に使える希少資源"}
 ];
 const utility=[
  equipmentChoice(secondary),
  {id:`supply-${floor}`,type:"supply",icon:"chest",captureCrystals,heals,keys:1,title:"深淵遠征セット",desc:`捕獲結晶×${captureCrystals}・上級回復薬×${heals}・深淵の鍵×1`}
 ];
 return[equipmentChoice(primary),randomFrom(economy),randomFrom(utility)]
}
function bossRewardIcon(option){return`<span class="boss-reward-icon">${pixelIcon(option.icon)}</span>`}
function awardBossReward(option){
 if(option.type==="equipment")receiveEquipment(save.state,option.item,{bossReward:true});
 if(option.type==="gold")save.state.player.gold+=option.amount;
 if(option.type==="crystal")save.state.player.crystals+=option.amount;
 if(option.type==="supply"){
  save.state.inventory.captureCrystals+=option.captureCrystals;
  save.state.inventory.highPotions=(save.state.inventory.highPotions??0)+option.heals;
  save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+option.keys
 }
}
function openBossRewardModal(floor,result=""){
 const pending=save.state.player.pendingBossRewards?.[floor];if(!pending?.options?.length)return false;
 app.insertAdjacentHTML("beforeend",`<div class="game-modal boss-reward-modal"><div class="game-modal-card boss-reward">${result?`<div class="boss-reward-result">${result}</div>`:""}<div class="boss-clear-emblem">${pixelIcon("event")}</div><small class="boss-choice-kicker">ABYSS TREASURE・${floor}F</small><h2 class="boss-choice-title">撃破報酬を選択</h2><p class="muted">どれも強力です。受け取れるのはひとつだけ。</p><div class="boss-reward-grid">${pending.options.map((option,index)=>`<button data-boss-reward="${option.id}"><i>CHOICE ${index+1}</i>${bossRewardIcon(option)}<b>${option.title}</b><small>${option.desc}</small></button>`).join("")}</div></div></div>`);
 const modal=topModal();
 modal.querySelectorAll("[data-boss-reward]").forEach(button=>button.onclick=()=>{
  const option=pending.options.find(entry=>entry.id===button.dataset.bossReward);if(!option)return;
  if(!confirm(`${option.title}を選びますか？\nこの階の他の報酬は失われます。`))return;
  awardBossReward(option);
  const playEnding=floor===1000&&!save.state.flags?.ending1000Played,playTrueEnding=floor===WORLD_MAX_FLOOR&&!save.state.flags?.ending10000Played;
  save.state.player.bossRewards[floor]=option.id;
  delete save.state.player.pendingBossRewards[floor];
  save.save();modal.remove();battle=null;
  if(playEnding){play1000EndingSequence();return}
  if(playTrueEnding){play10000EndingSequence();return}
  screen=save.state.player.inRun?"explore":"home";render()
 });
 return true
}
function showBossRewards(result){
 const floor=save.state.player.currentFloor,boss=battle.enemy;
 save.state.player.pendingBossRewards??={};
 if(!save.state.player.pendingBossRewards[floor])save.state.player.pendingBossRewards[floor]={floor,speciesId:boss.speciesId,createdAt:new Date().toISOString(),options:createBossRewardOptions(floor,boss)};
 save.save();openBossRewardModal(floor,result)
}
function resumePendingBossReward(){
 if(document.querySelector(".game-modal,.battle-screen"))return;
 const entries=Object.entries(save.state.player.pendingBossRewards??{}).filter(([floor,reward])=>reward?.options?.length&&!save.state.player.bossRewards?.[floor]);
 if(!entries.length)return;
 entries.sort((a,b)=>Number(b[0])-Number(a[0]));
 openBossRewardModal(Number(entries[0][0]))
}

function lose(){
 if(battle?.specialBattle)return finishSpecialBattle(false);
 audio.setScene("defeat");audio.sfx("defeat");
 if(battle?.memoryBattle){
  clearPartySynergy();syncPersistentAilments(battle);battle.party.forEach(monster=>{monster.currentHp=Math.max(1,monster.currentHp??1);monster.currentMp=Math.max(0,monster.currentMp??0)});
  clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();
  app.insertAdjacentHTML("beforeend",Modal("記憶から離脱",`<div class="defeat-cinematic memory-defeat">${pixelIcon("memory")}<h2>記憶の魔物に敗れた</h2><p>所持GOLDと探索進行には影響しません。</p><small>挑戦時に消費した魔晶石は返還されません。</small></div>`,"拠点へ戻る"));
  const memoryModal=topModal(),finish=()=>{memoryModal?.remove();battle=null;go("home")};memoryModal._onDismiss=finish;memoryModal.querySelector("[data-modal-primary]").onclick=finish;return
 }
 clearPartySynergy();const lossCap=Math.max(100,goldForClearedFloor(save.state.player.currentFloor)),lost=Math.min(Math.floor(save.state.player.gold*.10),lossCap);save.state.player.gold-=lost;save.state.player.currentFloor=save.state.player.checkpoint;save.state.player.inRun=false;abandonManualExpedition(save.state);
 syncPersistentAilments(battle);battle.party.forEach(m=>{m.currentHp=1;m.currentMp=0});clearExpeditionSnapshot();clearBattleCheckpoint();snapshot=null;document.querySelector(".battle-screen")?.remove();
 app.insertAdjacentHTML("beforeend",Modal("DEFEAT",`<div class="defeat-cinematic"><div class="defeat-mark">☠</div><h2>深淵に敗れた…</h2><p><b>${lost}G</b>を失い、${save.state.player.checkpoint}Fの拠点へ帰還します。</p><small>仲間はHP1で救出されました。</small></div>`,"拠点へ戻る"));
 const modal=topModal(),returnHome=()=>{modal?.remove();battle=null;go("home")};modal._onDismiss=returnHome;modal.querySelector("[data-modal-primary]").onclick=returnHome
}
normalizeEquipmentState();
if(save.state.player.inRun&&!save.state.activeBattle)screen="explore";
const resumedSavedBattle=resumeSavedBattle();
if(!resumedSavedBattle)render();
if(!resumedSavedBattle)setTimeout(()=>{if(!resumePendingEmergency())resumePendingBossReward()},180);
const skillRebalance=save.state.abyssSkillRebalance;
if(skillRebalance?.refund>0&&!skillRebalance.notifiedAt){
 skillRebalance.notifiedAt=new Date().toISOString();
 save.save();
 setTimeout(()=>showToast(`🪙 深淵ツリー価格差額 ${Number(skillRebalance.refund).toLocaleString()}Gを返還しました`),120);
}
