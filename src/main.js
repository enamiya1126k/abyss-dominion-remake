import{SaveService}from"./services/SaveService.js?v=2.11.45-build210";
import{CONTENT_TEST_MODE,BATTLE_SPEED_OPTIONS,CAMERA_DRAG_THRESHOLD_PX,WATER_RULES,MONSTER_STAR_MAX,MONSTER_STORAGE_CAP,ENDGAME_MAX_LEVEL,premiumCrystalCost,normalizeBattleSpeed,contentUnlockFloor,isContentUnlocked}from"./core/config.js?v=2.11.50-build215";
import{AudioSystem}from"./core/AudioSystem.js?v=2.11.37-build202";
import{endgameCharacter}from"./data/endgameCharacters.js?v=2.11.24-build188";
import{SPECIES}from"./data/species.js?v=2.11.33-build198";
import{captureStatusBonus,normalizePersistentAilments}from"./data/statusEffects.js?v=2.11.2-build166";
import{attributeDamageMultiplier,attributeGuideRows,canonicalAttribute,compactAttributeChart,ATTRIBUTES}from"./data/attributes.js?v=2.11.2-build166";
import{orderedMonsterSpecies}from"./data/monsterCatalog.js?v=2.11.44-build209";
import{HomeScreen,homePartySlots}from"./ui/screens/HomeScreen.js?v=2.11.30-build195";
import{FormationScreen}from"./ui/screens/FormationScreen.js?v=2.11.30-build195";
import{OnlinePartyScreen}from"./ui/screens/OnlinePartyScreen.js?v=2.11.42-build207";
import{OnlinePartyController}from"./online/OnlinePartyClient.js?v=2.11.50-build215";
import{MonsterListScreen}from"./ui/screens/MonsterListScreen.js?v=2.11.29-build194";
import{MonsterDetailScreen}from"./ui/screens/MonsterDetailScreen.js?v=2.11.30-build195";
import{SettingsScreen}from"./ui/screens/SettingsScreen.js?v=2.11.34-build199";
import{ExploreScreen}from"./ui/screens/ExploreScreen.js?v=2.11.42-build207";
import{GauntletScreen}from"./ui/screens/GauntletScreen.js?v=2.11.30-build195";
import{BattleScreen}from"./ui/screens/BattleScreen.js?v=2.11.50-build215";
import{Modal}from"./ui/components/Modal.js?v=2.11.2-build166";
import{pixelIcon}from"./ui/components/GameChrome.js?v=2.11.2-build166";
import{equipmentVisual}from"./ui/components/EquipmentVisual.js?v=2.11.2-build166";
import{attributeVisual}from"./ui/components/AttributeVisual.js?v=2.11.2-build166";
import{createMonster,displayName,calculatedStats,TRAITS,expNeedFor,experienceCrystalValue,limitBreakGrowth,affectionBonuses,totalExperience,applyTotalExperience}from"./models/Monster.js?v=2.11.50-build215";
import{EXPERIENCE_PACK_TYPES,experiencePackType,availableExperiencePackTypes,consumeExperiencePacks,experiencePackCapacity,previewExperiencePacks}from"./core/ExperiencePackSystem.js?v=2.11.24-build188";
import{createEquipment,equipmentPower,equipmentStatMultiplier,equipmentRequiredMonsterLevel}from"./models/Equipment.js?v=2.11.45-build210";
import{equipmentExpNeed,equipmentMaterialExp,enhancementMaterialCandidates,consumeEquipmentMaterials,projectEquipmentGrowth}from"./services/EquipmentEnhancement.js?v=2.11.2-build166";
import{recordWeaponKill,weaponMasteryDamageMultiplier,weaponMasterySummary}from"./services/WeaponMastery.js?v=2.11.2-build166";
import{normalizeSeriesMastery,recordSeriesBattle,seriesMasteryBonusForMonster,seriesMasterySummary}from"./services/SeriesMastery.js?v=2.11.24-build188";
import{receiveEquipment,takeFromStorage,equipmentSellPrice,slotLabel}from"./services/EquipmentStorage.js?v=2.11.2-build166";
import{RARITY_ORDER,EQUIPMENT_BASES,equipmentDisplayRarity,equipmentRarityColor,equipmentStatLabel,equipmentSubslotLabel,compatibleSubslots,SLOT_UNLOCK_LEVEL}from"./data/equipment.js?v=2.11.45-build210";
import{EQUIPMENT_SERIES,aggregateSeriesEffects}from"./data/equipmentSeries.js?v=2.11.24-build188";
import{AFFIX_QUALITY,aggregateAffixes,affixQuality,formatAffix,affixDefinition}from"./data/equipmentAffixes.js?v=2.11.2-build166";
import{EquipmentScreen}from"./ui/screens/EquipmentScreen.js?v=2.11.45-build210";
import{initialAffixCount,lockedAffixCount,maxLockableAffixes,normalizeEquipmentAffixLocks,rerollGoldCost,rerollUnlockedAffixes,toggleAffixLock}from"./services/EquipmentAffixCrafting.js?v=2.11.2-build166";
import{assignEquipmentToSubslot,canEquipInSubslot,emptyEquipmentLoadout,normalizeEquipmentLoadouts}from"./services/EquipmentLoadoutSystem.js?v=2.11.45-build210";
import{ShopScreen}from"./ui/screens/ShopScreen.js?v=2.11.24-build188";
import{SkillScreen}from"./ui/screens/SkillScreen.js?v=2.11.30-build195";
import{AbyssSkillTreeScreen}from"./ui/screens/AbyssSkillTreeScreen.js?v=2.11.2-build166";
import{InventoryScreen,ArmoryScreen}from"./ui/screens/InventoryScreen.js?v=2.11.48-build213";
import{abyssEquipmentRarityBonus,abyssExplorationChance,abyssSkillEffectTotal,abyssSkillEffects,abyssSkillMultiplier,abyssSkillNodeById,abyssSkillTreeSummary,learnAbyssSkill}from"./core/AbyssSkillTreeSystem.js?v=2.11.2-build166";
import{Ending1000Screen}from"./ui/screens/Ending1000Screen.js?v=2.11.2-build166";
import{Ending10000Screen}from"./ui/screens/Ending10000Screen.js?v=2.11.2-build166";
import{SecondWorldIntroScreen}from"./ui/screens/SecondWorldIntroScreen.js?v=2.11.2-build166";
import{worldPresentationForFloor,shouldPlaySecondWorldIntro,markSecondWorldEntered}from"./core/WorldSystem.js?v=2.11.24-build188";
import{randomEventForFloor,markRandomEventResolved,randomEventCosts}from"./core/SecondWorldEventSystem.js?v=2.11.24-build188";
import{shouldSpawnSecondWorldElite,createEliteEncounter,applyEliteModifiers,recordEliteEncounter,recordEliteDefeat,eliteRewards}from"./core/SecondWorldEliteSystem.js?v=2.11.2-build166";
import{shouldPlayTenGodFirstContact,tenGodContactChoices,resolveTenGodFirstContact}from"./core/TenGodContactSystem.js?v=2.11.2-build166";
import{TenGodContactScreen}from"./ui/screens/TenGodContactScreen.js?v=2.11.2-build166";
import{maxMp,learnedSkills,allLearnedSkills,equipSkill,skillById,skillElementLabel,canUseSkill,effectiveSkillMpCost,skillMpCostBreakdown,skillDamage,affixOutgoingDamageMultiplier,chooseAutoSkill,skillProgressFor,recordSkillUse,skillEffectDetails,skillEffectSummary,applySkillMastery}from"./battle/SkillSystem.js?v=2.11.50-build215";
import{ENEMY_ACTIONS,createEnemyBattleState,chooseEnemyAction,enemyActionMpCost,enemyDamageMultiplier,enemyDamageAfterDefense,enemyHealAmount,enemyAttackMultiplier,specialActionMultiplier,specialActionInfo}from"./battle/EnemyAI.js?v=2.11.30-build195";
import{createBattleRulesState,cooldownRemaining,setSkillCooldown,tickCooldowns,addBattleLog,applyEnemyStatus,applyEnemyDamage,processEnemyStatuses,applyBattleEffect,effectStackBreakdown,effectValue,hasEffect,clearNegativeAllyEffects,clearPersistentAilments,syncPersistentAilments,tickBattleEffects,processAllyEffects}from"./battle/BattleRules.js?v=2.11.24-build188";
import{attackHits}from"./battle/HitSystem.js?v=2.11.2-build166";
import{buildTurnQueue,currentTurnEntry,currentAlly,currentEnemy,aliveEnemies,selectedEnemy,advanceQueue,queueFinished,skipInvalidEntries}from"./battle/TurnSystem.js?v=2.11.50-build215";
import{dangerConfig}from"./core/DangerSystem.js?v=2.11.2-build166";
import{bossLevelForFloor,enemyLevelForFloor as scaledEnemyLevelForFloor,enemyHiddenProfileForFloor,enemyEquipmentLevelForFloor,equipmentHolderRateForFloor,equipmentSlotsForFloor,rollEnemyEquipmentRarity}from"./core/EnemyScalingSystem.js?v=2.11.2-build166";
import{MAGIC_CIRCLES,equippedMagicCircle,magicCircleLevel,magicCirclePrice,magicCircleNextEffect,buyOrUpgradeMagicCircle,equipMagicCircle,magicCircleOwner,magicCircleMarkup,rollEnemyMagicCircle,enemyMagicCircleMarkup,slotDamageMultiplier,createMagicCircleInstance,goldPowerDamageMultiplier,goldPowerActionCost}from"./core/MagicCircleSystem.js?v=2.11.2-build166";
import{biomeForFloor,battleEnvironmentForFloor,biomeProgress,recordBiomeFloor,recordBiomeEncounter,recordBiomeChest,recordBiomeBoss}from"./data/biomes.js?v=2.11.49-build214";
import{pickBiomeEncounterSpecies}from"./core/EncounterPoolSystem.js?v=2.11.33-build198";
import{dungeonThemeForFloor}from"./data/dungeonThemes.js?v=2.11.2-build166";
import{WORLD_MAX_FLOOR,TEAM_BATTLE_UNLOCK_FLOOR,GAUNTLET_UNLOCK_FLOOR,EMERGENCY_UNLOCK_FLOOR,ENDGAME_TRIAL_BATTLE_COUNT,ENDGAME_BOSSES,ENDGAME_TRIALS,normalizeEndgameState,dailyTeamAttempts,dailyGauntletAttempts,teamBattleDayKey,createTeamBattleEncounter,createEndgameTrialEncounter,recordEndgameTrialResult,shouldTriggerEmergency,createEmergencyEncounter,recordEmergencyResult,awardEmergencyFragments,emergencyFragmentStatus,endgameContractStatus,craftEndgameEquipment,endgamePreludeOptions,resolveEndgamePrelude,applyPreludeToEncounter,attemptEndgameContract,specialBattleSettlement,recordSpecialBattleSettlement,hasCleared1000,mark1000FloorCleared,mark10000FloorCleared,worldRegionForFloor,endgameFactionStatMultiplier,manualEndgameChallengeStatus,manualEndgameTierStatus,consumeManualEndgameChallenge,recordManualEndgameClear,teamBattleRewardPreview}from"./core/EndgameSystem.js?v=2.11.30-build195";
import{beginManualExpedition,recordManualFloorClear,claimManualReturn,abandonManualExpedition,idleReturnPreview,claimIdleReturn,returnRarityRates,returnRewardGrade,goldForClearedFloor}from"./core/ReturnRewardSystem.js?v=2.11.2-build166";
import{modifiedGoldReward}from"./core/GoldRewardSystem.js?v=2.11.2-build166";
import{battleGoldBase,chestGoldBase,secondWorldEventGoldBase,specialBattleGoldBase}from"./core/GoldEconomySystem.js?v=2.11.2-build166";
import{monsterCombatPower,partyCombatPower,partyCombatPowerBreakdown,formatCombatPower,recordPartyCombatPower}from"./core/CombatPower.js?v=2.11.30-build195";
import{beginSecretRoomExpedition,ensureSecretRoomExpedition,secretRoomPlan,enterSecretRoom,activeSecretRoom,spinSecretRoomCasino,useSecretRoomInn,buyDarkMarketOffer,buyDarkMarketRecovery,isDarkMarketBargain,SECRET_ROOM_RECOVERY_ITEMS,DARK_MARKET_ITEM_LIMIT,CASINO_CRYSTAL_COST,CASINO_MULTIPLIER_RATES}from"./core/SecretRoomSystem.js?v=2.11.30-build195";
import{applyGameMasterReward,applySerialReward,commitSerialRedemption,validateGameMasterCode,validateSerialCode}from"./core/SerialCodeSystem.js?v=2.11.30-build195";
import{NOTICE_DEFINITIONS,DAILY_NOTICE_GIFT,markNoticeRead,normalizeNoticeState,dailyNoticeGiftStatus,claimDailyNoticeGift,noticeAttentionCount}from"./core/NoticeSystem.js?v=2.11.34-build199";
import{CONTEXT_GUIDE_STEPS,completeGuideStep,normalizeContextualGuide,setGuidePending,guidePending,guideStepDone,bumpGuideCounter,snoozeGuideStep,guideStepSnoozed,resetContextualGuide,contextualGuideProgress}from"./core/ContextualGuideSystem.js?v=2.11.34-build199";
import{weekdayGachaSchedule,weekdayGachaCost,WEEKDAY_GACHA_CALENDAR,WEEKDAY_ENDGAME_RATE,rollWeekdayEndgameHit}from"./core/WeekdayGachaSystem.js?v=2.11.30-build195";
import{bossExperiencePackReward}from"./core/BossRewardSystem.js?v=2.11.2-build166";
import{enemyExperienceReward}from"./core/ProgressionSystem.js?v=2.11.24-build188";
import{FLOOR_BOSS_CATALOG,floorBossDefinitionForFloor,floorBossDefinitionById,floorBossEquipmentDesignByPiece,milestoneBossIdsForFloor}from"./data/floorBosses.js?v=2.11.28-build193";
import{FLOOR_BOSS_CONTRACT_COST,FLOOR_BOSS_EQUIPMENT_COST,normalizeFloorBossChallengeState,recordFloorBossDiscovery,floorBossChallengeStatus,createFloorBossChallengeEncounter,awardFloorBossChallengeFragments,spendFloorBossFragments,restoreFloorBossFragments}from"./core/FloorBossChallengeSystem.js?v=2.11.30-build195";
import{equipmentDropLevelForFloor}from"./core/EquipmentDropSystem.js?v=2.11.24-build188";
import{monsterSpriteUrl,monsterVisual,setMonsterVisualFrame}from"./ui/MonsterVisual.js?v=2.11.44-build209";
import{activeSignatureResonances,signatureSetState,signatureStatBonuses,signatureEquipmentOwnerId,signatureEquipmentOwnerName,signatureEquipmentMatchesMonster,signatureEligibleOwners,permanentSignatureOwners,rollPermanentSignatureHit,PERMANENT_SIGNATURE_RATE,createSignatureEquipment,normalizeSignatureWeaponItem,signatureWeaponGrantedSkill}from"./core/SignatureWeaponSystem.js?v=2.11.24-build188";

const TILE=88,COLS=39,ROWS=39,app=document.getElementById("app"),save=new SaveService(),audio=new AudioSystem(()=>save.state.settings);
const STANDARD_ENCOUNTER_SPECIES=Object.freeze(Object.values(SPECIES).filter(species=>species.id!=="baby_slime"));
let screen="home",selected=null,equipmentTarget=null,equipmentFocusItemId=null,skillTarget=null,skillSlotSelection=0,abyssSkillCategory="economy",inventoryCategory="all",inventorySort="rarity",game=null,battle=null,snapshot=null,activeEnemy=null,navigationOrigin="home",skillNavigationOrigin="home",inventoryNavigationOrigin="home",settingsNavigationOrigin="home",detailNavigationOrigin="monsters",formationOrigin="home",lastExploreCombatPower=null;

function floorBossWasDefeated(player,floor){
 const key=String(Math.max(1,Math.floor(Number(floor)||1))),hasOwn=(record)=>Object.prototype.hasOwnProperty.call(record??{},key);
 return Number(player?.bossKills?.[key]??0)>0||hasOwn(player?.bossRewards)||hasOwn(player?.pendingBossRewards)
}
const SCREEN_SESSION_KEY="abyss-dominion:current-screen",INVITE_SESSION_KEY="abyss-dominion:last-party-invite",REFRESHABLE_SCREENS=new Set(["home","formation","onlineParty","monsters","settings","explore","gauntlet","equipment","shop","skills","abyssSkills","inventory","armory"]);
let exploreActionGeneration=0,secretRoomAutoRunning=false;
let onlinePartyController=null;
document.addEventListener("pointerdown",()=>audio.unlock(),{once:true,passive:true});
let secondWorldIntroPlaying=false;
let tenGodContactPlaying=false;
let monsterManage={editing:false,selected:new Set()},equipmentManage={editing:false,selected:new Set()};
let partyEditorState={search:"",element:"all",status:"all",sort:"rarity",direction:"desc"};
let monsterListState={search:"",sort:"power",direction:"desc"};
let formationPickerState={search:"",sort:"power",direction:"desc",attribute:"all"};
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
 ["⚠","notice"],["❔","notice"],["❓","notice"],["📣","notice"],["✉️","notice"],["✉","notice"],
 ["🏛️","dungeon"],["🏛","dungeon"],["🎰","event"],["🕶️","event"],["🕶","event"],["◉","event"],
 ["⚙️","settings"],["⚙","settings"],["❤️","growth"],["❤","growth"],["💗","growth"],["💪","growth"],
 ["📚","skills"],["📒","skills"],["📌","map"],["🔒","notice"],["🔓","notice"],["🏅","event"],
 ["👐","formation"],["👁️","notice"],["👁","notice"],["🏹","equipment"],["🔱","equipment"],["🛠️","equipment"],["🛠","equipment"],
 ["🧳","chest"],["🧭","map"],["📈","event"],["📀","event"],["⛰️","dungeon"],["⛰","dungeon"],
 ["⚪","attribute-neutral"],["🔥","attribute-fire"],["💧","attribute-water"],["🌊","attribute-water"],
 ["❄️","attribute-ice"],["❄","attribute-ice"],["⚡","attribute-lightning"],["🪨","attribute-earth"],
 ["🌪️","attribute-wind"],["🌪","attribute-wind"],["✨","attribute-light"],["🌑","attribute-dark"],["🌘","attribute-dark"],
 ["☠️","attribute-poison"],["☠","attribute-poison"],["🌿","attribute-nature"]
]);
const UI_EMOJI_TOKENS=[...UI_EMOJI_ICONS.keys()].sort((a,b)=>b.length-a.length);
function pixelIconElement(name){
 if(name.startsWith("attribute-")){
  const holder=document.createElement("span");
  holder.innerHTML=attributeVisual(name.slice(10),{className:"inline-attribute-icon"});
  return holder.firstElementChild;
 }
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
function bindBackdropTapClose(modal,onClose=closeTopModal){
 if(!modal)return;
 let pointer=null;
 modal.addEventListener("pointerdown",event=>{
  if(event.target!==modal)return;
  pointer={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
 });
 modal.addEventListener("pointermove",event=>{
  if(!pointer||event.pointerId!==pointer.id)return;
  if(Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>10)pointer.moved=true;
 });
 modal.addEventListener("pointerup",event=>{
  if(!pointer||event.pointerId!==pointer.id)return;
  const shouldClose=!pointer.moved&&event.target===modal;pointer=null;
  if(shouldClose)onClose();
 });
 modal.addEventListener("pointercancel",()=>pointer=null);
}
// Battle details close on a genuine tap anywhere, while a vertical drag keeps
// scrolling the sheet. This is intentionally separate from backdrop-only modals.
function bindTapAnywhereClose(modal,onClose=closeTopModal){
 if(!modal)return;
 let pointer=null;
 modal.addEventListener("pointerdown",event=>{
  const scrollBody=modal.querySelector(".game-modal-card"),body=modal.querySelector(".game-modal-body");
  pointer={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false,cardScroll:scrollBody?.scrollTop??0,bodyScroll:body?.scrollTop??0};
 },{passive:true});
 modal.addEventListener("pointermove",event=>{
  if(!pointer||event.pointerId!==pointer.id)return;
  if(Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>10)pointer.moved=true;
 },{passive:true});
 modal.addEventListener("pointerup",event=>{
  if(!pointer||event.pointerId!==pointer.id)return;
  const card=modal.querySelector(".game-modal-card"),body=modal.querySelector(".game-modal-body"),scrolled=Math.abs((card?.scrollTop??0)-pointer.cardScroll)>2||Math.abs((body?.scrollTop??0)-pointer.bodyScroll)>2;
  const shouldClose=!pointer.moved&&!scrolled&&!event.target.closest?.("a,input,select,textarea");pointer=null;
  if(shouldClose)onClose();
 },{passive:true});
 modal.addEventListener("pointercancel",()=>pointer=null,{passive:true});
}
function exploreAutoMode(){return save.state.settings?.exploreAutoMode??"off"}
function exploreAutoActive(){return Boolean(save.state.player?.inRun&&exploreAutoMode()!=="off")}
function cancelPendingExploreActions(){
 exploreActionGeneration++;
 if(game){game.world.encountering=false;game.player.path=[];game.player.p=0}
 document.querySelectorAll(".encounter-transition").forEach(node=>node.remove());
 document.getElementById("gameCanvas")?.classList.remove("encounter-shake");
}
function showToast(text){document.querySelector(".game-toast")?.remove();const el=document.createElement("div");el.className="game-toast";el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),1400)}
function showResourceToast(icon,amount){document.querySelector(".resource-toast-mini")?.remove();const el=document.createElement("div");el.className="resource-toast-mini";el.innerHTML=`${pixelIcon(icon)}<b>+${Math.max(1,Number(amount)||1)}</b>`;document.body.appendChild(el);setTimeout(()=>el.remove(),1100)}
function showExploreNotice(text,tone="normal"){document.querySelector(".explore-notice-mini")?.remove();const el=document.createElement("div");el.className=`explore-notice-mini ${tone}`;el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),1050)}
function contextualGuideState(){
 save.state.settings??={};
 save.state.settings.contextualGuide=normalizeContextualGuide(save.state.settings.contextualGuide,{monsterCount:save.state.monsters?.length??1});
 return save.state.settings.contextualGuide;
}
function contextGuideDone(id){return guideStepDone(contextualGuideState(),id)}
function contextGuidePending(key){return guidePending(contextualGuideState(),key)}
function clearContextGuide(){
 document.querySelectorAll(".context-guide-target").forEach(node=>node.classList.remove("context-guide-target"));
 document.querySelector(".context-guide")?.remove();
 document.querySelector(".tutorial-world-marker")?.remove();
}
function completeContextGuide(id,{quiet=false}={}){
 const guide=contextualGuideState(),changed=completeGuideStep(guide,id);clearContextGuide();
 if(changed){save.save();if(!quiet)showToast("ガイド完了");setTimeout(scheduleContextGuide,180)}
 return changed;
}
function setContextGuidePending(key,value=true){setGuidePending(contextualGuideState(),key,value);save.save()}
function contextualGuideTarget(target){return typeof target==="string"?document.querySelector(target):target}
function showContextGuide({id,title,text,target=null,confirmLabel=null,onConfirm=null,placement=null}){
 const guide=contextualGuideState();if(guide.disabled||contextGuideDone(id)||guideStepSnoozed(guide,id))return false;
 const existing=document.querySelector(".context-guide");if(existing?.dataset.guideId===id)return true;clearContextGuide();
 const node=contextualGuideTarget(target);if(target&&!node)return false;
 node?.classList.add("context-guide-target");
 if(node&&!node.closest(".battle-screen,.explore-stage"))node.scrollIntoView?.({behavior:"smooth",block:"center",inline:"center"});
 const rect=node?.getBoundingClientRect(),place=placement??(rect&&rect.top>innerHeight*.58?"top":rect&&rect.bottom<innerHeight*.42?"bottom":"bottom"),progress=contextualGuideProgress(guide);
 const card=document.createElement("aside");card.className=`context-guide place-${place}`;card.dataset.guideId=id;card.setAttribute("role","status");card.setAttribute("aria-live","polite");
 card.innerHTML=`<button type="button" class="context-guide-close" aria-label="あとで見る">×</button><small>FIRST ACTION GUIDE</small><b>${title}</b><p>${text}</p>${confirmLabel?`<button type="button" class="context-guide-confirm">${confirmLabel}</button>`:""}<span class="context-guide-progress">${progress.completed}/${progress.total}</span>`;
 card.querySelector(".context-guide-close").onclick=()=>{snoozeGuideStep(guide,id,60000);save.save();clearContextGuide();showToast("この案内は1分後に再表示します")};
 card.querySelector(".context-guide-confirm")?.addEventListener("click",()=>{if(onConfirm)onConfirm();else completeContextGuide(id)});
 document.body.appendChild(card);return true;
}
function tutorialNewMonsterId(){const id=contextualGuideState().newestMonsterId;return save.state.monsters?.some(monster=>monster.id===id)?id:null}
function markNewMonsterForGuide(monster){
 if(!monster?.id||contextGuideDone("party_add"))return;
 const guide=contextualGuideState();guide.newestMonsterId=monster.id;setGuidePending(guide,"partyAdd",true);save.save();
}
function completePartyAddGuide(){
 const guide=contextualGuideState();setGuidePending(guide,"partyAdd",false);guide.newestMonsterId=null;completeContextGuide("party_add",{quiet:true});save.save();
}
function scheduleContextGuide(){
 const guide=contextualGuideState();if(guide.disabled||document.querySelector(".context-guide,.game-modal,.battle-screen"))return;
 if(screen==="home"){
  if(!contextGuideDone("home_dungeon"))return showContextGuide({id:"home_dungeon",title:"さっそくダンジョンへ挑戦しよう",text:"下の「ダンジョン」を押して、最初の探索へ進もう。",target:"#openExplore",placement:"top"});
  if(contextGuidePending("bedRecovery")&&!contextGuideDone("bed_recover"))return showContextGuide({id:"bed_recover",title:"寝台で仲間を回復しよう",text:"敗北した仲間はHP1。光っている寝台でHP・MP・状態異常を戻そう。",target:"#openRest",placement:"top"});
  if(contextGuidePending("starterGacha")&&!contextGuideDone("starter_gacha_open"))return showContextGuide({id:"starter_gacha_open",title:"帰還記念の無料10連！",text:"「召喚」を開いて、スタートダッシュガチャを回そう。",target:"#openGacha"});
  if(contextGuidePending("partyAdd")&&contextGuideDone("starter_gacha_pull")&&!contextGuideDone("party_open"))return showContextGuide({id:"party_open",title:"新しい仲間を部隊へ",text:"「部隊編成」を開いて、空いている枠へ仲間を入れてみよう。",target:"#openFormation"});
  if(save.state.player.maxFloor>=3&&(save.state.equipment?.length??0)>0&&!contextGuideDone("equipment_open"))return showContextGuide({id:"equipment_open",title:"拾った装備を身につけよう",text:"装備管理を開き、仲間の空き枠へ装備してみよう。",target:"#openEquipment"});
  if(save.state.player.maxFloor>=5&&contextGuideDone("equipment_equip")&&!contextGuideDone("skills_open"))return showContextGuide({id:"skills_open",title:"使うスキルを整えよう",text:"スキル画面で、戦闘に持ち込む4枠を設定できるよ。",target:"#openSkills"});
 }
 if(screen==="explore"){
  if(save.state.player.currentFloor===1&&!contextGuideDone("explore_move"))return showContextGuide({id:"explore_move",title:"タップで歩きます",text:"近くの床を1回タップして、実際に移動してみよう。",target:"#gameCanvas",placement:"top"});
  if(save.state.player.currentFloor===1&&contextGuideDone("explore_move")&&!contextGuideDone("explore_pickup")){const shown=showContextGuide({id:"explore_pickup",title:"近くの魔晶石を拾おう",text:"「ここ」と光っている魔晶石まで歩いて、触れてみよう。",target:"#gameCanvas",placement:"top"});showTutorialPickupMarker();return shown}
  if(save.state.player.currentFloor===10&&!contextGuideDone("floor10_prepare"))return showContextGuide({id:"floor10_prepare",title:"10階の支配者戦へ備えよう",text:"HP・編成・装備を確認。足りなければ帰還、準備できたら支配者へ進もう。",target:"#fieldEquipment",confirmLabel:"準備できた",onConfirm:()=>completeContextGuide("floor10_prepare")});
 }
 if(screen==="formation"&&contextGuidePending("partyAdd")&&!contextGuideDone("party_slot")){
  const target=document.querySelector("[data-formation-add]")??document.querySelector("[data-formation-replace]");
  if(target)return showContextGuide({id:"party_slot",title:"出撃枠を1つ選ぼう",text:target.matches("[data-formation-add]")?"空いているSLOTを押して、控えの仲間を表示しよう。":"満員なので、交代する仲間を選ぼう。",target});
 }
 if(screen==="equipment"&&contextGuideDone("equipment_open")&&!contextGuideDone("equipment_equip")){
  const target=document.querySelector("[data-equip]")??document.querySelector("[data-open-equipment-slot]");
  if(target)return showContextGuide({id:"equipment_equip",title:"この装備を装着しよう",text:"光っている「装備」または空き枠を押して、能力を反映させよう。",target});
 }
 if(screen==="equipment"&&contextGuideDone("equipment_equip")&&(save.state.equipment?.length??0)>=2&&!contextGuideDone("equipment_enhance")){
  const target=document.querySelector("[data-enhance-equipment]");if(target)return showContextGuide({id:"equipment_enhance",title:"不要装備を素材に強化",text:"装備育成を開くと、余った装備のEXPを引き継げるよ。",target});
 }
 if(screen==="skills"&&contextGuideDone("skills_open")&&!contextGuideDone("skills_set")){
  const target=document.querySelector("[data-skill-slot]");if(target)return showContextGuide({id:"skills_set",title:"スキル枠を選ぼう",text:"枠を押して、覚えている技から1つ設定しよう。",target});
 }
 if(screen==="skills"&&save.state.player.maxFloor>=7&&contextGuideDone("skills_set")&&!contextGuideDone("abyss_tree_open")){
  const target=document.querySelector("[data-open-abyss-skill-tree]");if(target)return showContextGuide({id:"abyss_tree_open",title:"恒久強化の深淵ツリー",text:"GOLDで探索・戦闘・育成をずっと強化できるよ。開いてみよう。",target});
 }
 if(screen==="abyssSkills"&&contextGuideDone("abyss_tree_open")&&!contextGuideDone("abyss_tree_learn")){
  const target=document.querySelector("[data-learn-abyss-skill]:not([disabled])");if(target)return showContextGuide({id:"abyss_tree_learn",title:"最初の強化を習得しよう",text:"購入可能なノードを1つ選ぶと、効果が永続で反映されるよ。",target});
 }
}
function scheduleBattleContextGuide(){
 if(!battle||battle.busy||battle.guideReady===false||currentTurnEntry(battle)?.type!=="ally")return;
 if(battle.tutorialCaptureEligible){
  if(!contextGuideDone("battle_attack"))return showContextGuide({id:"battle_attack",title:"まずは攻撃してみよう",text:"「攻撃」を押すと、選択中の敵へ通常攻撃します。",target:'[data-command="attack"]',placement:"top"});
  if(!contextGuideDone("battle_skill_open"))return showContextGuide({id:"battle_skill_open",title:"次はスキルを開こう",text:"スキルはMPを使う代わりに、強力な効果を発揮します。",target:'[data-command="skill"]',placement:"top"});
  if(!contextGuideDone("battle_skill_use")){
   const target=battle.skillMenu?document.querySelector("[data-skill-id]:not([disabled])"):document.querySelector('[data-command="skill"]');
   return showContextGuide({id:"battle_skill_use",title:battle.skillMenu?"使うスキルを1つ選ぼう":"スキル一覧をもう一度開こう",text:battle.skillMenu?"光っている技を押して、実際に発動してみよう。":"スキル一覧から使える技を選ぼう。",target,placement:"top"});
  }
  if(!contextGuideDone("battle_capture"))return showContextGuide({id:"battle_capture",title:"捕獲結晶を使ってみよう",text:"この初回捕獲は必ず成功します。「捕獲」で仲間にしよう。",target:'[data-command="capture"]',placement:"top"});
 }
 if(battle.tutorialAttributeBattle&&!contextGuideDone("attribute_check")){
  const target=document.querySelector(".battle-enemies .unit-attribute-logo,.enemy-unit .unit-attribute-logo,.unit-attribute-logo");
  if(target)return showContextGuide({id:"attribute_check",title:"属性マークを見比べよう",text:"有利は1.25倍、不利は0.8倍。光と闇は互いに大ダメージです。",target,confirmLabel:"属性を確認した",onConfirm:()=>completeContextGuide("attribute_check"),placement:"bottom"});
 }
 if(battle.tutorialAttributeBattle&&contextGuideDone("attribute_check")&&!contextGuideDone("attribute_skill"))return showContextGuide({id:"attribute_skill",title:"属性を見て技を選ぼう",text:"敵の属性を見て、相性のよいスキルを選んでみよう。",target:'[data-command="skill"]',placement:"top"});
 const wounded=battle.party.some(monster=>monster.currentHp>0&&monster.currentHp/calculatedStats(monster).hp<=.5);
 if(wounded&&!contextGuideDone("battle_heal_item")){
  if(!contextGuideDone("battle_item_open"))return showContextGuide({id:"battle_item_open",title:"HPが半分以下です",text:"「アイテム」を開いて、回復薬を使ってみよう。",target:'[data-command="item"]',placement:"top"});
  const target=battle.itemMenu?document.querySelector('[data-battle-item="potions"]:not([disabled]),[data-battle-item="highPotions"]:not([disabled]),[data-battle-item="partyPotions"]:not([disabled])'):document.querySelector('[data-command="item"]');
  if(target)return showContextGuide({id:"battle_heal_item",title:"回復薬を選ぼう",text:"回復したい仲間を選ぶと、このターンに薬を使います。",target,placement:"top"});
 }
}
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
 const enter=overlay.querySelector("[data-second-world-enter]");enter.classList.add("is-visible");if(exploreAutoActive())setTimeout(()=>enter.click(),360);
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
 if(exploreAutoActive())setTimeout(()=>overlay.querySelector('[data-ten-god-choice="submission"]')?.click(),360);
 const choiceId=await new Promise(resolve=>overlay.querySelectorAll("[data-ten-god-choice]").forEach(button=>button.addEventListener("click",()=>resolve(button.dataset.tenGodChoice),{once:true})));
 const result=resolveTenGodFirstContact(save.state,choiceId,{recoverParty:fullyRecoverParty});save.save();
 overlay.classList.add("is-resolved");const content=overlay.querySelector(".ten-god-contact-content");
 content.innerHTML=`<small>CONTACT RECORDED</small><div class="ten-god-contact-sigil"><span class="ten-god-contact-emblem" role="img" aria-label="十神降臨"></span></div><p class="ten-god-voice is-visible">${result.message}</p><button type="button" class="primary" data-ten-god-close>探索へ戻る</button>`;
 if(exploreAutoActive())setTimeout(()=>content.querySelector("[data-ten-god-close]")?.click(),360);
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
 modal.querySelectorAll("[data-second-world-choice]").forEach(button=>button.onclick=()=>finish(button.dataset.secondWorldChoice));modal.querySelector("[data-modal-primary]").onclick=()=>finish("leave");modal._onDismiss=()=>finish("leave");if(exploreAutoActive()){const choice=({"abyss-altar":"pray","lost-merchant":"leave","abyss-crystal":"harvest","warped-rift":"challenge"})[event.id]??"leave";setTimeout(()=>{const button=modal.querySelector(`[data-second-world-choice="${choice}"]`);if(button)button.click();else finish(choice)},380)}return true;
}

async function play1000EndingSequence(){
 document.querySelector(".ending1000")?.remove();
 app.insertAdjacentHTML("beforeend",Ending1000Screen());
 const overlay=document.querySelector(".ending1000");if(!overlay)return;
 document.querySelectorAll("audio").forEach(audio=>{try{audio.pause()}catch{}});
 let skipResolve;const skipPromise=new Promise(resolve=>skipResolve=resolve),skip=overlay.querySelector(".ending1000-skip");
 skip.onclick=()=>skipResolve("skip");
 if(exploreAutoActive())setTimeout(()=>skipResolve("skip"),420);
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
 if(exploreAutoActive())setTimeout(()=>skipResolve("skip"),420);
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
document.addEventListener("keydown",event=>{if(event.key!=="Escape")return;const open=document.querySelectorAll(".equipment-screen-v2 .equipped-slot-card[open]");if(open.length){open.forEach(detail=>detail.removeAttribute("open"));event.preventDefault();return}const modal=topModal();if(modal){event.preventDefault();if(typeof modal._onDismiss==="function")modal._onDismiss();else modal.remove()}});
let lastTouchEnd=0;document.addEventListener("touchend",e=>{const now=Date.now();if(now-lastTouchEnd<320&&!e.target.closest("input,textarea"))e.preventDefault();lastTouchEnd=now},{passive:false});

class Entity{constructor(x,y){this.x=x;this.y=y;this.rx=x;this.ry=y;this.path=[];this.p=0}setPath(p){this.path=p;this.p=0}move(dt,s){if(!this.path.length)return false;const t=this.path[0];this.p+=dt*s;const n=Math.min(1,this.p);this.rx=this.x+(t.x-this.x)*n;this.ry=this.y+(t.y-this.y)*n;if(this.p>=1){this.x=t.x;this.y=t.y;this.rx=this.x;this.ry=this.y;this.path.shift();this.p=0;return true}return false}}
class Camera{constructor(c){this.c=c;this.x=TILE;this.y=TILE;this.z=.85;this.ox=0;this.oy=0;this.manual=false}world(wx,wy){return{x:(wx-this.x)*this.z+this.c.width/2+this.ox,y:(wy-this.y)*this.z+this.c.height/2+this.oy}}screen(sx,sy){return{x:(sx-this.c.width/2-this.ox)/this.z+this.x,y:(sy-this.c.height/2-this.oy)/this.z+this.y}}pan(dx,dy){this.ox+=dx;this.oy+=dy;this.manual=true}reset(px,py){this.x=px;this.y=py;this.ox=0;this.oy=0;this.z=.85;this.manual=false}follow(px,py){if(this.manual)return;const p=this.world(px,py),l=this.c.width*.34,r=this.c.width*.66,t=this.c.height*.34,b=this.c.height*.66;if(p.x<l)this.x+=(p.x-l)/this.z*.12;if(p.x>r)this.x+=(p.x-r)/this.z*.12;if(p.y<t)this.y+=(p.y-t)/this.z*.12;if(p.y>b)this.y+=(p.y-b)/this.z*.12}clamp(w){const edge=30,mw=w.cols*TILE*this.z,mh=w.rows*TILE*this.z,ml=this.c.width/2-this.x*this.z,mt=this.c.height/2-this.y*this.z,minX=edge-(ml+mw),maxX=this.c.width-edge-ml,minY=edge-(mt+mh),maxY=this.c.height-edge-mt;this.ox=mw<=this.c.width-edge*2?(this.c.width-mw)/2-ml:Math.max(minX,Math.min(maxX,this.ox));this.oy=mh<=this.c.height-edge*2?(this.c.height-mh)/2-mt:Math.max(minY,Math.min(maxY,this.oy))}}
normalizeEndgameState(save.state);
function equipmentAffixesWithSeries(items,seriesEffects){
 const result=aggregateAffixes(items);
 const appliedAuthorities=new Set();
 for(const item of items??[]){
  // Two different weapon instances may share one authored authority. Their
  // normal stats/affixes both count, but the named fixed authority only fires
  // once so equipping a duplicate in both hands cannot double it.
  const authorityId=item?.floorBossWeaponEffectId??item?.signatureWeaponEffectId??null;
  if(authorityId&&appliedAuthorities.has(authorityId))continue;
  if(authorityId)appliedAuthorities.add(authorityId);
  for(const[key,value]of Object.entries(item.fixedEffects??{})){const amount=Number(value);if(Number.isFinite(amount))result[key]=(result[key]??0)+amount}
 }
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
function normalizeFloorBossDedicatedItem(item){
 const definition=item?.ruleOverrides?.floorBossDedicated?floorBossDefinitionById(item.ruleOverrides.bossCatalogId):null;
 const piece=item?.ruleOverrides?.floorBossPiece??(item?.slot==="armor"?"armor":item?.slot==="accessory"?"accessory":"weapon"),design=definition?floorBossEquipmentDesignByPiece(definition.id,piece):null;if(!design)return null;
 item.name=design.name??item.name;item.rarity="神話";item.rewardTier="神話";if(design.visualAsset)item.visualAsset=design.visualAsset;
 if(design.effect){item.fixedEffects={...design.effect.fixedEffects,...(item.fixedEffects??{})};item.floorBossEquipmentEffectId=design.effect.id;if(piece==="weapon"){item.floorBossWeaponEffectId=design.effect.id;item.handedness="either"}}
 if(design.skill)item.grantedSkillId=design.skill.id;
 item.fixedEffectText=`${design.effect?.name??"階層固有装備"}：${design.effect?.description??`${definition.element}属性と${definition.role}戦術へ最適化`}${design.skill?`／装備中限定技「${design.skill.name}」` :""}`;
 return design;
}
function normalizeEquipmentState(){
 save.state.equipment??=[];save.state.reserveEquipment??=[];save.state.bossEquipmentVault??=[];save.state.settings??={};
 save.state.settings.equipmentSort??="rarity";save.state.settings.equipmentSlot??="weapon";save.state.settings.equipmentStorage??="inventory";
 save.state.gacha??={firstTenUsed:false,lastDailyKey:null};save.state.codex??={encounters:{},captures:{},equipment:{}};save.state.codex.encounters??={};save.state.codex.captures??={};save.state.codex.equipment??={};save.state.rest??={lastFreeKey:null};
  for(const item of[...save.state.equipment,...save.state.reserveEquipment,...save.state.bossEquipmentVault]){if(item?.slot==="weapon")item.handedness="either";normalizeFloorBossDedicatedItem(item);normalizeSignatureWeaponItem(item)}
 const{byId}=normalizeEquipmentLoadouts(save.state);
 const abyssEffects=abyssSkillEffects(save.state);
 save.state.monsters.forEach(m=>{
  m.traitId??="steady";
  const counts={},stats={},equippedItems=[],equipmentSkills=[],equipmentAuthorities=[],seenSkillIds=new Set(),seenAuthorityIds=new Set();Object.values(m.equipment).forEach(id=>{const item=byId.get(id);if(!item)return;equippedItems.push(item);const design=normalizeFloorBossDedicatedItem(item),signatureSkill=signatureWeaponGrantedSkill(item);if(design?.skill&&!seenSkillIds.has(design.skill.id)){seenSkillIds.add(design.skill.id);equipmentSkills.push({...design.skill,equipmentGranted:true,equipmentAuthorityId:design.effect?.id??null,equipmentAuthorityName:design.effect?.name??"階層固有能力"})}if(signatureSkill&&!seenSkillIds.has(signatureSkill.id)){seenSkillIds.add(signatureSkill.id);equipmentSkills.push({...signatureSkill,equipmentGranted:true,equipmentAuthorityId:item.signatureWeaponEffectId??null,equipmentAuthorityName:item.signatureSkill??"装備固有能力"})}if(item.floorBossWeaponEffectId&&design?.effect&&!seenAuthorityIds.has(item.floorBossWeaponEffectId)){seenAuthorityIds.add(item.floorBossWeaponEffectId);equipmentAuthorities.push({id:item.floorBossWeaponEffectId,name:design.effect.name??"階層固有能力",description:String(design.effect.description??"").replace(/。$/,""),fixedEffects:{...(design.effect.fixedEffects??{})},skillId:design.skill?.id??null,skillName:design.skill?.name??null,itemName:item.name})}const mult=equipmentStatMultiplier(item);Object.entries(item.stats??{}).forEach(([k,v])=>stats[k]=(stats[k]??0)+Math.round(v*mult));if(item.series)counts[item.series]=(counts[item.series]??0)+1});
  const seriesEffects=aggregateSeriesEffects(counts);
  m._equipmentStats=stats;m._equipmentAffixes=equipmentAffixesWithSeries(equippedItems,seriesEffects);m._seriesCounts=counts;m._seriesEffects=seriesEffects;m._seriesMasteryBonus=seriesMasteryBonusForMonster(save.state,counts);m._signatureBonuses=signatureStatBonuses(save.state,m);
  Object.defineProperty(m,"_equipmentSkills",{value:equipmentSkills,writable:true,configurable:true,enumerable:false});
  Object.defineProperty(m,"_equipmentAuthorities",{value:equipmentAuthorities,writable:true,configurable:true,enumerable:false});
  Object.defineProperty(m,"_abyssSkillEffects",{value:abyssEffects,writable:true,configurable:true,enumerable:false});
  const natural=calculatedStats(m),mp=maxMp(m);
  if(m.currentHp==null||!Number.isFinite(m.currentHp))m.currentHp=natural.hp;else m.currentHp=Math.max(0,Math.min(natural.hp,m.currentHp));
  if(m.currentMp==null||!Number.isFinite(m.currentMp))m.currentMp=mp;else m.currentMp=Math.max(0,Math.min(mp,m.currentMp));
 });
}
function render(){
 clearContextGuide();
 closeInventoryContext();
 normalizeEquipmentState();
 try{if(REFRESHABLE_SCREENS.has(screen))sessionStorage.setItem(SCREEN_SESSION_KEY,screen)}catch{}
 const powerRecord=recordPartyCombatPower(save.state);if(powerRecord.changed)save.save();
 document.body.classList.toggle("phase2",hasCleared1000(save.state));
 if(!battle)audio.setScene(["explore","gauntlet"].includes(screen)?"explore":"home");
 if(screen==="home"){app.innerHTML=HomeScreen(save.state);bindHome()}
 else if(screen==="formation"){app.innerHTML=FormationScreen(save.state,{origin:formationOrigin});bindFormation()}
 else if(screen==="onlineParty"){app.innerHTML=OnlinePartyScreen(save.state);bindOnlineParty()}
 else if(screen==="monsters"){app.innerHTML=MonsterListScreen(save.state,{...monsterManage,...monsterListState});bindList()}
 else if(screen==="detail"){const m=save.state.monsters.find(x=>x.id===selected);app.innerHTML=MonsterDetailScreen(m,save.state);bindDetail(m)}
 else if(screen==="settings"){app.innerHTML=SettingsScreen(save.state);bindSettings()}
 else if(screen==="explore"){app.innerHTML=ExploreScreen(save.state);bindExplore()}
 else if(screen==="gauntlet"){app.innerHTML=GauntletScreen(save.state);bindGauntlet()}
 else if(screen==="equipment"){if(!save.state.party.includes(equipmentTarget))equipmentTarget=save.state.party[0]??save.state.monsters[0]?.id;app.innerHTML=EquipmentScreen(save.state,equipmentTarget,{home:navigationOrigin==="home",focusItemId:equipmentFocusItemId,...equipmentManage});bindEquipment()}
 else if(screen==="shop"){app.innerHTML=ShopScreen(save.state);bindShop()}
 else if(screen==="skills"){skillTarget=save.state.monsters.some(m=>m.id===skillTarget)?skillTarget:(save.state.party[0]??save.state.monsters[0]?.id);app.innerHTML=SkillScreen(save.state,skillTarget);bindSkills()}
 else if(screen==="abyssSkills"){app.innerHTML=AbyssSkillTreeScreen(save.state,abyssSkillCategory);bindAbyssSkills()}
 else if(screen==="inventory"){app.innerHTML=InventoryScreen(save.state,inventoryCategory);bindInventory()}
 else if(screen==="armory"){app.innerHTML=ArmoryScreen(save.state,inventoryCategory,inventorySort);bindInventory()}
 bindSharedUi();
 pixelizeUiEmoji(app);
 requestAnimationFrame(scheduleContextGuide);
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
 if(screen==="onlineParty"&&s!=="onlineParty"){
  onlinePartyController?.unmount({disconnect:true});
  try{const clean=new URL(location.href);clean.searchParams.delete("partyServer");clean.searchParams.delete("partyRoom");history.replaceState(history.state,"",`${clean.pathname}${clean.search}${clean.hash}`)}catch{}
 }
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
 document.querySelectorAll(".attribute-chip").forEach(chip=>{chip.setAttribute("role","button");chip.setAttribute("tabindex","0");chip.title="属性相性を見る";chip.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();openAttributeHelp()})});
 document.querySelectorAll("[data-exact-number]").forEach(node=>node.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();showToast(node.dataset.exactNumber)}));
}
function capturePartyVitals(){return Object.fromEntries(save.state.party.map(id=>{const m=save.state.monsters.find(x=>x.id===id);return m?[id,{hp:m.currentHp,mp:m.currentMp,ailments:normalizePersistentAilments(m.ailments)}]:null}).filter(Boolean))}
function restorePartyVitals(vitals){if(!vitals)return;save.state.party.forEach(id=>{const m=save.state.monsters.find(x=>x.id===id),v=vitals[id];if(!m||!v)return;m.currentHp=v.hp;m.currentMp=v.mp;m.ailments=normalizePersistentAilments(v.ailments)})}
function fullyRecoverParty(){save.state.party.forEach(id=>{const m=save.state.monsters.find(x=>x.id===id);if(!m)return;m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)})}
function openTeamBattle(){
 const team=dailyTeamAttempts(save.state),unlockFloor=contentUnlockFloor(TEAM_BATTLE_UNLOCK_FLOOR),stageBoss=FLOOR_BOSS_CATALOG[(Math.max(1,Number(team.stage)||1)-1)%FLOOR_BOSS_CATALOG.length],stageBossStatus=floorBossChallengeStatus(save.state,stageBoss.id);
 if(!isContentUnlocked(save.state,TEAM_BATTLE_UNLOCK_FLOOR))return alert(`${unlockFloor}階突破で解放されます`);
 if(!stageBossStatus?.unlocked)return showToast(`${stageBoss.floor}階で${stageBoss.name}に遭遇すると第${team.stage}試練が解禁されます`);
 if(save.state.party.length!==4)return alert(`4 VS 4には出撃メンバーが4体必要です（現在 ${save.state.party.length}/4体）`);
 if(team.remaining<=0)return showToast("本日の4 VS 4は終了");
 const reward=teamBattleRewardPreview(team.stage,save.state.player.maxFloor);
 app.insertAdjacentHTML("beforeend",Modal("4対4",`<div class="team-battle-intro"><small>深淵闘技場${CONTENT_TEST_MODE?"・試遊解放":""}</small><h2>第${team.stage}試練</h2><p>${stageBoss.floor}F・${stageBoss.name}をリーダーにした専用編成。4体対4体で、10戦ごとに敵編成と補正が跳ね上がります。</p><div class="team-reward-preview"><b>勝利GOLD ×${reward.goldMultiplier}</b><span>${pixelIcon("crystal")} ${reward.crystals}個</span>${reward.guaranteedRarity?`<em>${reward.guaranteedRarity}装備確定</em>`:""}</div><div class="daily-attempt-plaque"><b>本日 残り${team.remaining}回</b><small>${team.dailyAttempts}/${team.limit}・日本時間0時更新</small></div></div>`,`挑戦する`));
 const modal=topModal();modal.classList.add("ornate-team-modal");
 modal.querySelector("[data-modal-primary]").onclick=()=>{if(save.state.party.length!==4)return alert("出撃メンバーを4体編成してください");const encounter=createTeamBattleEncounter(save.state);if(!encounter)return showToast("この階層ボスはまだ本編で未遭遇です");modal.remove();const prior=capturePartyVitals();fullyRecoverParty();team.dailyAttempts++;save.save();startSpecialBattle(encounter,{type:"team",title:`TEAM BATTLE・第${team.stage}試練`,subtitle:"4 VS 4 / 敗北ペナルティなし",priorVitals:prior,returnScreen:"home"})};
}
function testScaleEmergency(event){
 if(!CONTENT_TEST_MODE||!event?.enemies?.length)return event;
 const base=Math.max(10,Math.min(45,(save.state.player.maxFloor||10)+4));
 event.manifestation={rate:.1,label:"試遊投影体",percent:10};
 event.rescue={...(event.rescue??{}),active:true,label:"試遊保護"};
 const waves=Array.isArray(event.waves)&&event.waves.length?event.waves:[event.enemies];event.waves=waves.map((wave,waveIndex)=>wave.slice(0,3).map((enemy,index)=>({...enemy,level:base+Math.max(0,5-index*2+waveIndex*2),statMultiplier:index===0?1.55:1.08,nameOverride:waveIndex===waves.length-1&&index===0?`${event.boss.name}〈試遊投影〉`:enemy.nameOverride})));event.enemies=event.waves[event.waves.length-1];
 return event;
}
function triggerEmergencyEncounter(forcedId=null,{testPreview=false,returnScreen=null,manual=false}={}){
 const wasExploring=Boolean(game?.running),emergencyState=normalizeEndgameState(save.state).emergency,pending=emergencyState.pendingEncounter,effectiveBossId=forcedId??pending?.bossId??null,event=testPreview?testScaleEmergency(createEmergencyEncounter(save.state,effectiveBossId)):createEmergencyEncounter(save.state,effectiveBossId),prior=pending?.priorVitals??capturePartyVitals(),options=endgamePreludeOptions(event.boss),tierStatus=manual?manualEndgameTierStatus(save.state,event.boss.id):null;
 if(wasExploring&&!manual&&!testPreview){
  const manifestation=event.manifestation??{percent:40,label:"投影体"},fragmentReward=manifestation.percent>=100?5:manifestation.percent>50?3:1;
  if(emergencyState.pendingEncounter?.bossId===event.boss.id)emergencyState.pendingEncounter=null;
  fullyRecoverParty();snapshot=currentSnapshot();stopGame();save.save();audio.sfx(event.boss.faction==="tenGod"?"divineReveal":"abyssReveal");
  startSpecialBattle(event.enemies,{waves:event.waves,type:"emergency",title:event.boss.name,subtitle:`${manifestation.label} / ${manifestation.percent}%`,priorVitals:prior,bossId:event.boss.id,powerPercent:manifestation.percent,fragmentReward,returnScreen:returnScreen??"explore"});return;
 }
 const optionHtml=options.map((option,index)=>{const locked=manual&&(index+1)>tierStatus.highestUnlocked;return`<button data-endgame-prelude="${option.id}" class="endgame-tier ${locked?"locked":""}" ${locked?"disabled":""}><span>${locked?pixelIcon("lock"):monsterVisual(event.boss.id,event.boss.icon,{className:"endgame-tier-visual"})}</span><b>${option.title}</b><small>推奨 ${option.recommended}</small><em>討伐報酬　欠片 ×${option.fragmentReward}</em>${locked?`<i>前段階の討伐で解禁</i>`:""}</button>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal(event.boss.faction==="tenGod"?"――神が降臨しました。":"――深淵反応を検知。",`<div class="emergency-warning ${event.boss.faction}"><div class="warning-icon">${monsterVisual(event.boss.id,event.boss.icon,{className:"endgame-warning-monster-visual"})}</div><small>${event.boss.faction==="tenGod"?"十神基礎能力：深淵の10倍":"深淵基礎能力：旧設定の10倍"}</small><h2>${event.boss.name}</h2><p>${event.boss.title}</p><p>味方は開始時に全回復。逃走不可。敗北ペナルティはありません。</p>${manual?`<div class="manual-attempt-counter"><b>本日の共通挑戦回数 ${tierStatus.limit-tierStatus.remaining}/${tierStatus.limit}</b><small>深淵・十神の全挑戦で共有／日本時間0時更新</small></div>`:""}</div><div class="endgame-prelude-grid four-tier">${optionHtml}</div>`,`段階を選択してください`));
 const modal=topModal(),primary=modal.querySelector("[data-modal-primary]");if(primary)primary.disabled=true;
 modal.querySelectorAll("[data-endgame-prelude]").forEach(button=>button.onclick=()=>{const prelude=resolveEndgamePrelude(save.state,event.boss.id,button.dataset.endgamePrelude);if(manual){const consumed=consumeManualEndgameChallenge(save.state,event.boss.id,prelude.id);if(!consumed.ok)return showToast(consumed.message)}applyPreludeToEncounter(event,prelude);if(emergencyState.pendingEncounter?.bossId===event.boss.id)emergencyState.pendingEncounter=null;fullyRecoverParty();save.save();modal.remove();if(wasExploring){snapshot=currentSnapshot();stopGame()}startSpecialBattle(event.enemies,{waves:event.waves,type:"emergency",title:event.boss.name,subtitle:prelude.title,priorVitals:prior,bossId:event.boss.id,powerPercent:prelude.percent,fragmentReward:prelude.fragmentReward,manualChallenge:manual,preludeChoiceId:prelude.id,preludeResultText:prelude.resultText,returnScreen:returnScreen??(wasExploring?"explore":"home")})});
}
function resumePendingEmergency(){const pending=normalizeEndgameState(save.state).emergency.pendingEncounter;if(!pending||battle||!save.state.player.inRun||document.querySelector(".game-modal,.battle-screen"))return false;if(game?.running){game.paused=true;game.world.encountering=false}triggerEmergencyEncounter(pending.bossId,{returnScreen:"explore"});return true}
function startSpecialBattle(enemies,options={}){
 const waves=(Array.isArray(options.waves)&&options.waves.length?options.waves:[enemies]).filter(wave=>Array.isArray(wave)&&wave.length),waveIndex=Math.max(0,Math.min(waves.length-1,Math.floor(Number(options.waveIndex)||0))),waveTotal=waves.length,baseSubtitle=options.baseSubtitle??options.subtitle??"敗北ペナルティなし",waveLabel=waveTotal>1?(waveIndex===waveTotal-1?`FINAL WAVE ${waveTotal}/${waveTotal}`:`WAVE ${waveIndex+1}/${waveTotal}`):null;
 const battleOptions={specialBattle:true,specialBattleType:options.type,specialTitle:options.title,specialSubtitle:waveLabel?`${waveLabel}・${baseSubtitle}`:baseSubtitle,specialBaseSubtitle:baseSubtitle,specialWaves:waves,specialWaveIndex:waveIndex,specialWaveTotal:waveTotal,continuingSpecialWave:Boolean(options.continuingSpecialWave),priorVitals:options.priorVitals,specialBossId:options.bossId,powerPercent:options.powerPercent,specialFragmentReward:Math.max(0,Number(options.fragmentReward)||0),manualEndgameChallenge:Boolean(options.manualChallenge),preludeChoiceId:options.preludeChoiceId??null,preludeResultText:options.preludeResultText??null,specialTrialNumber:options.trialNumber??null,specialTrialLoop:options.trialLoop??null,specialReturnScreen:options.returnScreen??null};
 if(options.battleId)battleOptions.battleId=options.battleId;if(options.performance)battleOptions.performance=options.performance;if(Number.isFinite(options.reviveCount))battleOptions.reviveCount=options.reviveCount;
 startBattle(waves[waveIndex],battleOptions);
}
function advanceSpecialBattleWave(){
 if(!battle?.specialBattle||!Array.isArray(battle.specialWaves))return false;const nextIndex=Math.max(0,Number(battle.specialWaveIndex)||0)+1;if(nextIndex>=battle.specialWaves.length)return false;
 const current=battle,options={waves:current.specialWaves,waveIndex:nextIndex,continuingSpecialWave:true,battleId:current.battleId,performance:current.performance,reviveCount:current.reviveCount,type:current.specialBattleType,title:current.specialTitle,baseSubtitle:current.specialBaseSubtitle??current.specialSubtitle,priorVitals:current.priorVitals,bossId:current.specialBossId,powerPercent:current.powerPercent,fragmentReward:current.specialFragmentReward,manualChallenge:current.manualEndgameChallenge,preludeChoiceId:current.preludeChoiceId,preludeResultText:current.preludeResultText,trialNumber:current.specialTrialNumber,trialLoop:current.specialTrialLoop,returnScreen:current.specialReturnScreen};
 current.busy=true;clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();activeEnemy=null;battle=null;startSpecialBattle(current.specialWaves[nextIndex],options);return true;
}
function createContractedEndgameMonster(boss,bossId,level,floor){
 const monster=createMonster(boss.speciesId,{nickname:boss.name,title:boss.title,level:Math.max(1,Math.min(ENDGAME_MAX_LEVEL,Number(level)||Number(floor)||1)),stars:MONSTER_STAR_MAX,rank:4,favorite:true,locked:true,attribute:boss.element??SPECIES[boss.speciesId]?.element,obtainedFloor:Math.max(1,Number(floor)||1),obtainedMethod:"endgameContract",endgameBossId:bossId,endgameFaction:boss.faction,isContractedEndgame:true,allowEndgameLevel:true,tags:[SPECIES[boss.speciesId]?.race,boss.faction,bossId].filter(Boolean)});
 monster.endgameBossId=bossId;monster.endgameFaction=boss.faction;monster.contractSignature=boss.signature;monster.contractSeriesId=boss.seriesId;monster.isContractedEndgame=true;monster.currentHp=calculatedStats(monster).hp;monster.currentMp=maxMp(monster);return monster;
}
function finishFloorBossChallengeBattle(won,contributionSnapshot){
 const bossId=battle.specialBossId,status=floorBossChallengeStatus(save.state,bossId),reward=awardFloorBossChallengeFragments(save.state,bossId,won,battle.battleId),prior=battle.priorVitals,boss=status?.boss;
 restorePartyVitals(prior);clearPartySynergy();clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();save.save();activeEnemy=null;
 const body=won?`<div class="special-result win floor-boss-fragment-result">${monsterVisual({speciesId:boss.speciesId,visualSpeciesId:boss.visualSpeciesId},SPECIES[boss.speciesId]?.emoji??"BOSS",{className:"floor-boss-result-visual"})}<small>${boss.floor}F・階層支配者</small><h2>${boss.name}を突破！</h2><div class="fragment-reward"><b>${boss.name}の欠片 ×${reward.amount}</b><small>${reward.firstVictory?"初回討伐ボーナス":"再戦報酬"}・所持 ${reward.fragments}</small></div><button type="button" class="fragment-altar-open" data-floor-boss-result-exchange="${boss.id}">欠片交換を見る</button></div>`:`<div class="special-result lose"><h2>${boss?.name??"階層ボス"}には届かなかった…</h2><p>所持品・階層・仲間へのペナルティはありません。欠片は勝利時のみ獲得します。</p></div>`;
 app.insertAdjacentHTML("beforeend",Modal(won?"階層ボス再戦勝利":"階層ボス再戦敗北",body,"挑戦門へ戻る"));const modal=topModal();modal.hidden=true;const finish=()=>{modal.remove();battle=null;openEndgameTrialPicker()};modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish;modal.querySelector("[data-floor-boss-result-exchange]")?.addEventListener("click",()=>{const id=boss.id;modal.remove();battle=null;openFloorBossExchange(id)});openBattleContributionReport(contributionSnapshot,()=>{modal.hidden=false});
}
function finishSpecialBattle(won){
 if(!battle||battle.resultSettled)return;battle.resultSettled=true;
 const contributionSnapshot=battleContributionSnapshot();
 if(won)recordSeriesBattle(save.state,battle.party,null,{boss:true,battleId:battle.battleId});
 audio.setScene(won?"victory":"defeat");audio.sfx(won?"victory":"defeat");
 const type=battle.specialBattleType,prior=battle.priorVitals,bossId=battle.specialBossId,trialNumber=Math.max(1,Number(battle.specialTrialNumber)||1),floor=save.state.player.currentFloor,returnScreen=battle.specialReturnScreen??(["team","gauntlet"].includes(type)?"home":"explore"),leader=battle.enemies?.find(enemy=>enemy.endgameBossId===bossId),team=type==="team"?dailyTeamAttempts(save.state):null,rewardFloor=["team","gauntlet"].includes(type)?Math.max(1,save.state.player.maxFloor||floor):floor;
 if(type==="floorBoss")return finishFloorBossChallengeBattle(won,contributionSnapshot);
 const priorSettlement=specialBattleSettlement(save.state,battle.battleId);let specialGold=Number(priorSettlement?.specialGold)||0,specialCrystals=Number(priorSettlement?.specialCrystals)||0,specialEquipment=priorSettlement?.specialEquipment??null,fragments=Number(priorSettlement?.fragments)||0,contract=priorSettlement?.contractResult?{...priorSettlement.contractResult,boss:ENDGAME_BOSSES[bossId]}:null,contractedMonster=priorSettlement?.contractResult?.joined?true:null,trialProgress=priorSettlement?.trialProgress??null,gauntletSettlement=null;
 if(!priorSettlement){
  specialGold=type==="gauntlet"?0:modifiedGoldReward(save.state,specialBattleGoldBase(rewardFloor,{type,won,stage:team?.stage??1,powerPercent:battle.powerPercent}),"battle");
  if(type==="team")specialGold=won?Math.max(1,Math.floor(specialGold/100)):0;
  if(team){const reward=teamBattleRewardPreview(team.stage,rewardFloor);if(won){specialCrystals=Math.max(1,Math.floor(reward.crystals/100));save.state.player.crystals+=specialCrystals;if(reward.guaranteedRarity){const slots=["weapon","armor","accessory"],item=createEquipment(slots[(team.stage-1)%slots.length],{rarity:reward.guaranteedRarity});item.level=Math.max(1,team.stage*10);item.plus=Math.max(0,Math.floor(team.stage/5));const received=receiveEquipment(save.state,item);specialEquipment={name:item.name,rarity:item.rarity,level:item.level,plus:item.plus,message:received.message};}team.totalWins++;team.stage=Math.max(1,team.stage+1)}else team.totalLosses++}
  if(type==="gauntlet"){
   const trials=normalizeEndgameState(save.state).trials,run=trials.run;
   if(won){trialProgress=recordEndgameTrialResult(save.state,trialNumber,true);if(run?.active){const trial=ENDGAME_TRIALS[trialNumber-1];run.defeated=true;run.victories=Math.max(0,Number(run.victories)||0)+1;run.score=Math.max(0,Number(run.score)||0)+Math.round(Math.pow(trialNumber,1.72)*Math.pow(Math.max(1,Number(run.loop)||1),1.35)*100);run.defeatedBossIds=[...(run.defeatedBossIds??[]),...(trial?.bossIds??[])];if(trial?.floorBossId)run.defeatedFloorBossIds=[...(run.defeatedFloorBossIds??[]),trial.floorBossId];run.maxLoop=Math.max(Number(run.maxLoop)||1,Number(trialProgress.loop)||1);run.lastResult="win";run.lastBattle=trialNumber;run.lastSettledAt=new Date().toISOString()}}
   else{if(run?.active){run.lastResult="loss";run.lastBattle=trialNumber}gauntletSettlement=settleGauntletRun("defeat")}
  }
  if(specialGold)save.state.player.gold+=specialGold;
  if(type==="emergency"){
   recordEmergencyResult(save.state,battle,won);fragments=awardEmergencyFragments(save.state,bossId,won,battle.battleId,battle.specialFragmentReward||null);if(battle.manualEndgameChallenge)recordManualEndgameClear(save.state,bossId,battle.preludeChoiceId,won);
  }
  const contractResult=contract?{success:Boolean(contract.success),contracted:Boolean(contract.contracted),remaining:Number(contract.remaining)||0,availableFragments:Number(contract.availableFragments)||0,required:Number(contract.required)||0,spent:Number(contract.spent)||0,joined:Boolean(contractedMonster)}:null;
  recordSpecialBattleSettlement(save.state,battle.battleId,{type,won:Boolean(won),bossId:bossId??null,specialGold,specialCrystals,specialEquipment,fragments,contractResult,trialProgress});save.save();
 }
 if(!(type==="gauntlet"&&returnScreen==="gauntlet"))restorePartyVitals(prior);clearPartySynergy();clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();const boss=bossId?ENDGAME_BOSSES[bossId]:null,status=bossId?emergencyFragmentStatus(save.state,bossId):null;
 let contractHtml="";if(type==="emergency"&&won)contractHtml=`<button type="button" class="fragment-altar-open" data-open-fragment-altar>${pixelIcon("summon")} 欠片祭壇へ　人物契約／神装顕現</button>`;
 if(type==="gauntlet"&&!won){save.save();activeEnemy=null;openBattleContributionReport(contributionSnapshot,()=>{battle=null;showGauntletSettlement(gauntletSettlement??normalizeEndgameState(save.state).trials.lastSettlement)});return}
 const trialName=ENDGAME_TRIALS[trialNumber-1]?.name??`第${trialNumber}戦`,subject=type==="gauntlet"?`奈落回廊 第${trialNumber}戦`:boss?.name??"チームバトル",progressText=type==="gauntlet"?(trialProgress?.loopCompleted?`${ENDGAME_TRIAL_BATTLE_COUNT}戦を踏破。精算せず${trialProgress.loop}周目へ進めます。`:`次は第${trialProgress?.battle??trialNumber}戦「${ENDGAME_TRIALS[(trialProgress?.battle??trialNumber)-1]?.name??trialName}」。`):type==="team"?"次の試練が解放されました。":"世界異変を退けました。";
 const teamLoot=type==="team"?`<div class="team-victory-loot"><b>${pixelIcon("crystal")} 魔晶石 ×${specialCrystals}</b>${specialEquipment?`<b>[${specialEquipment.rarity}] ${specialEquipment.name} Lv.${specialEquipment.level} +${specialEquipment.plus}</b>`:""}</div>`:"",title=won?"特別戦勝利":"敗北",body=type==="gauntlet"?`<div class="special-result win gauntlet-chain-result"><small>深淵回廊・連勝継続</small><h2>${subject}を突破！</h2><p>${progressText}</p><div class="gauntlet-bank-note"><b>戦利品は回廊内に蓄積中</b><span>帰還・全滅時にGOLD／欠片／希少武器を一括精算</span></div></div>`:won?`<div class="special-result win"><h2>${subject}を突破！</h2><p>${progressText}</p><div class="fragment-reward"><b>${pixelIcon("coin")} 深層討伐報奨 +${specialGold.toLocaleString()}G</b><small>${rewardFloor}階のGOLD基準で算出</small></div>${teamLoot}${battle.preludeResultText?`<small>${battle.preludeResultText}</small>`:""}${type==="emergency"?`<div class="fragment-reward"><b>${monsterVisual(boss.id,boss.icon,{className:"fragment-boss-visual"})} ${boss.name}の欠片 ×${fragments}</b><small>所持 ${status.count}/${status.required}${status.canCraft?"　製作可能！":""}</small></div>${contractHtml}`:""}</div>`:type==="team"?`<div class="team-defeat-report"><small>部隊戦・第${team?.stage??1}試練</small><span class="team-defeat-seal" aria-hidden="true"></span><h2>試練、未突破</h2><p>編成・属性・装備を組み直し、次の挑戦で深淵を越えてください。所持品や進行度への損失はありません。</p><div class="team-defeat-daily"><b>本日 残り${team?.remaining??0}回</b><small>日本時間0時に回復</small></div></div>`:`<div class="special-result lose"><h2>${subject}には届かなかった…</h2><p>所持品・階層・仲間へのペナルティはありません。</p>${type==="emergency"?`<div class="fragment-reward"><b>${monsterVisual(boss.id,boss.icon,{className:"fragment-boss-visual"})} ${boss.name}の欠片 ×${fragments}</b><small>${fragments?"10%抽選に成功":"今回は欠片なし"}・所持 ${status.count}/${status.required}</small></div>`:""}</div>`;
 save.save();activeEnemy=null;app.insertAdjacentHTML("beforeend",Modal(title,body,returnScreen==="home"?"拠点へ戻る":returnScreen==="gauntlet"?"回廊へ戻る":"探索へ戻る"));const modal=topModal();modal.hidden=true;if(type==="team"&&!won)modal.classList.add("team-defeat-modal");modal.querySelector("[data-open-fragment-altar]")?.addEventListener("click",()=>{modal.remove();battle=null;openEndgameForge()});const finish=()=>{modal.remove();battle=null;if(returnScreen==="home"){snapshot=null;go("home")}else if(returnScreen==="gauntlet"){screen="gauntlet";render()}else{screen="explore";render()}};modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish;openBattleContributionReport(contributionSnapshot,()=>{modal.hidden=false},{auto:Boolean(battle?.explorationAuto)})
}

function openEndgameForge(){
 const rows=Object.values(ENDGAME_BOSSES).map(b=>{const gear=emergencyFragmentStatus(save.state,b.id),contract=endgameContractStatus(save.state,b.id),record=save.state.endgame?.emergency?.records?.[b.id]??{},count=contract.availableFragments;return`<article class="endgame-forge-card ${b.faction}"><div class="fragment-card-aura"></div><div class="spread"><div><small>${b.faction==="tenGod"?"TEN GODS / 十神":"ABYSS / 深淵"}</small><h3>${monsterVisual(b.id,b.icon,{className:"endgame-forge-monster-visual"})}<span>${b.name}</span></h3></div><b>欠片 ${count}</b></div><div class="fragment-meter"><i style="width:${Math.min(100,count/Math.max(1,Math.min(contract.required,gear.required))*100)}%"></i></div><small>遭遇 ${record.encounters??0} / 討伐 ${record.wins??0} / 神装 ${gear.crafted}/6</small><div class="fragment-altar-actions"><button data-contract-endgame="${b.id}" ${contract.canContract?"":"disabled"}>${contract.contracted?"人物契約済み":contract.canContract?`人物を呼び出す　−${contract.required}`:`人物契約 ${count}/${contract.required}`}</button><button data-craft-endgame="${b.id}" ${gear.canCraft?"":"disabled"}>${gear.canCraft?`専用装備を顕現　−${gear.required}`:`神装 ${count}/${gear.required}`}</button></div></article>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal("欠片祭壇",`<div class="fragment-altar-head"><span class="trial-pixel-emblem endgame"></span><div><small>FRAGMENT ALTAR</small><h2>存在を、欠片から再構成する</h2><p>人物との契約、または6部位の専用装備顕現を選択できます。</p></div></div><div class="endgame-forge-list">${rows}</div>`,"閉じる"));
 const modal=topModal();modal.classList.add("fragment-altar-modal");modal.querySelector("[data-modal-primary]").onclick=closeTopModal;modal.querySelectorAll("[data-contract-endgame]").forEach(b=>b.onclick=()=>contractEndgameCharacter(b.dataset.contractEndgame));modal.querySelectorAll("[data-craft-endgame]").forEach(b=>b.onclick=()=>craftEndgameGear(b.dataset.craftEndgame));
}
function contractEndgameCharacter(bossId){
 if(save.state.monsters.length>=MONSTER_STORAGE_CAP)return showToast(`所持上限 ${MONSTER_STORAGE_CAP}体です。先に魔物を整理してください`);
 if(save.state.monsters.some(monster=>monster.endgameBossId===bossId&&monster.isContractedEndgame))return showToast("この存在とはすでに契約済みです");
 const result=attemptEndgameContract(save.state,bossId,save.state.player.maxFloor);if(!result.success)return showToast(result.reason??"欠片が不足しています");
 const level=Math.max(999,Math.min(ENDGAME_MAX_LEVEL,save.state.player.maxFloor||999)),monster=createContractedEndgameMonster(result.boss,bossId,level,save.state.player.maxFloor);
 save.state.monsters.push(monster);save.state.codex.encounters[monster.speciesId]=(save.state.codex.encounters[monster.speciesId]??0)+1;save.state.codex.captures[monster.speciesId]=(save.state.codex.captures[monster.speciesId]??0)+1;save.save();closeTopModal();audio.sfx(result.boss.faction==="tenGod"?"divineReveal":"abyssReveal");
 app.insertAdjacentHTML("beforeend",Modal(result.boss.faction==="tenGod"?"世界法則、顕現":"深淵契約、成立",`<div class="fragment-contract-result ${result.boss.faction}"><div class="contract-reality-rings"><i></i><i></i><i></i></div>${monsterVisual(result.boss.id,result.boss.icon,{className:"fragment-contract-monster"})}<small>${result.boss.title}</small><h2>${result.boss.name}</h2><b>Lv.${level.toLocaleString()}</b><p>欠片${result.spent}個を代償に、存在の再構成が完了しました。</p></div>`,`魔物一覧へ`));topModal().querySelector("[data-modal-primary]").onclick=()=>{closeTopModal();go("monsters")};
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
 const breakdown=partyCombatPowerBreakdown(save.state);
 const memberBreakdown=breakdown.members.map(row=>`<article><div><b>${displayName(row.monster)}</b><small>Lv.${row.monster.level}</small></div><span><small>Lv成長</small><strong>+${formatCombatPower(row.level)}</strong></span><span><small>装備関連</small><strong>+${formatCombatPower(row.equipment)}</strong></span><em>${formatCombatPower(row.total)}</em></article>`).join("");
 const rows=history.length?history.slice(0,8).map((entry,index)=>{
  const date=new Date(entry.at),dateText=Number.isFinite(date.getTime())?date.toLocaleString("ja-JP",{timeZone:"Asia/Tokyo",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}):"記録時刻不明";
  return`<div class="power-history-row"><span>${pixelIcon(index===0?"event":"skills")}</span><div><b>${formatCombatPower(entry.power)}</b><small>${entry.delta>0?`+${formatCombatPower(entry.delta)}・`:"記録開始・"}${entry.floor}階時点</small></div><time>${dateText}</time></div>`;
 }).join(""):'<p class="muted">戦力更新履歴はまだありません。</p>';
 app.insertAdjacentHTML("beforeend",Modal("戦力記録",`<div class="power-record-summary"><div><small>現在戦力</small><b>${formatCombatPower(current)}</b></div><div><small>歴代最高戦力</small><strong>${formatCombatPower(highest)}</strong></div><div><small>${current>=highest?"最高記録を維持中":"最高更新まで"}</small><b>${current>=highest?pixelIcon("event"):formatCombatPower(highest-current)}</b></div></div><section class="power-source-breakdown"><h3>戦力の内訳</h3><div class="power-source-total"><span>個体基礎 ${formatCombatPower(breakdown.base)}</span><b>Lv成長 +${formatCombatPower(breakdown.level)}</b><strong>装備関連 +${formatCombatPower(breakdown.equipment)}</strong></div>${memberBreakdown}</section><h3 class="power-history-title">最高戦力の更新履歴</h3><div class="power-history-list">${rows}</div><small class="muted">「装備関連」は装備Lv・強化・シリーズ・厳選効果を含む戦力換算値です。前衛／後衛による補正はありません。</small>`,"閉じる"));
 topModalButton().onclick=closeTopModal;
}
function idleReturnPreviewBody(preview){
 return`<div class="idle-reward-v2"><div class="idle-v2-hero"><div><small>放置探索時間</small><strong>${compactElapsedText(preview.elapsedMs)}</strong><p>最大${preview.maxHours}時間まで蓄積${preview.capped?"・上限到達":""}</p></div><span class="home-pixel-icon icon-chest idle-v2-chest-icon" aria-hidden="true"></span></div><div class="idle-v2-reward-grid"><article><i>${pixelIcon("coin")}</i><small>受取GOLD</small><b>${preview.gold.toLocaleString()}G</b></article><article><i>${pixelIcon("equipment")}</i><small>装備ドロップ</small><b>${preview.equipmentCount}個</b></article><article><i>${pixelIcon("dungeon")}</i><small>探索地点</small><b>${preview.expeditionFloor}階層帯</b></article><article><i>${pixelIcon("event")}</i><small>換算探索量</small><b>${preview.floorUnits}階層分</b></article></div><div class="idle-v2-route"><span>最高到達階層の${Math.round(preview.expeditionRate*100)}%</span><i style="--idle-progress:${Math.min(100,preview.elapsedMs/(preview.maxHours*3600000)*100)}%"></i><small>5分ごとにGOLDと装備抽選が増加します。</small></div>${returnRarityTable()}</div>`;
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
 {id:"captureCrystals",icon:"",name:"捕獲結晶",description:"希少な捕獲触媒。1日3個まで購入可",price:5000000,dailyLimit:3},
 {id:"potions",icon:"🌿",name:"薬草",description:"単体HPを100＋最大HP10%回復",price:300},
 {id:"highPotions",icon:"🧪",name:"上級回復薬",description:"単体HPを300＋最大HP25%回復",price:1800},
 {id:"partyPotions",icon:"💚",name:"全体回復薬",description:"味方全員のHPを回復",price:4500},
 {id:"manaPotions",icon:"💧",name:"魔力水",description:"単体MPを30＋最大MP10%回復",price:450},
 {id:"highManaPotions",icon:"🔷",name:"上級魔力水",description:"単体MPを100＋最大MP25%回復",price:2500},
 {id:"partyManaPotions",icon:"🌊",name:"全体魔力水",description:"味方全員のMPを回復",price:6000},
 {id:"fullManaPotions",icon:"💠",name:"魔力全快薬",description:"単体のMPを全回復",price:12000},
 {id:"partyFullManaPotions",icon:"🌀",name:"全体魔力全快薬",description:"味方全員のMPを全回復",price:50000},
 {id:"reviveLeaves",icon:"🍃",name:"蘇生の葉",description:"戦闘不能の仲間を蘇生",price:60000},
 {id:"statusCures",icon:"🩹",name:"浄化薬",description:"単体の状態異常を解除",price:1800},
 {id:"partyStatusCures",icon:"💨",name:"全体浄化薬",description:"味方全員の状態異常を解除",price:9000},
 {id:"fullHeals",icon:"✨",name:"万能霊薬",description:"単体のHP・MP・状態異常を全回復",price:30000},
 {id:"partyFullHeals",icon:"🌟",name:"全体万能霊薬",description:"味方全員を完全回復",price:150000}
];
function shopItemArt(item){
 return`<span class="home-shop-item-art" style="--shop-item-art:url('../../assets/ui/items/${item.id}.png')"><i>${item.icon}</i></span>`;
}
function openHomeItemShop(){
 const gold=Math.max(0,Number(save.state.player.gold)||0);
 save.state.shop??={};const today=localDayKey();if(save.state.shop.captureDaily?.key!==today)save.state.shop.captureDaily={key:today,count:0};
 const rows=HOME_ITEM_SHOP.map(item=>{const remaining=item.dailyLimit?Math.max(0,item.dailyLimit-(save.state.shop.captureDaily?.count??0)):null,maxByGold=Math.floor(gold/item.price),maximum=Math.max(0,Math.min(999,remaining??999,maxByGold)),disabled=maximum<=0;return`<article class="home-item-shop-row" data-home-shop-row="${item.id}" data-unit-price="${item.price}" data-max-purchase="${maximum}">${shopItemArt(item)}<div class="home-shop-item-copy"><b>${item.name}</b><small>${item.description}</small><em>所持 ${save.state.inventory[item.id]??0}個${remaining!=null?`・本日あと${remaining}個`:""}</em></div><div class="home-shop-buy-actions"><div class="home-shop-quantity" aria-label="${item.name}の購入数"><button type="button" data-shop-qty-step="-1" aria-label="1個減らす" ${disabled?"disabled":""}>−</button><input type="number" inputmode="numeric" min="1" max="${Math.max(1,maximum)}" value="1" data-shop-qty aria-label="購入数" ${disabled?"disabled":""}><button type="button" data-shop-qty-step="1" aria-label="1個増やす" ${disabled?"disabled":""}>＋</button><button type="button" data-shop-qty-max ${disabled?"disabled":""}>MAX</button></div><button type="button" data-home-item-buy="${item.id}" ${disabled?"disabled":""}><span data-shop-buy-label>${disabled?"購入不可":"1個購入"}</span><b data-shop-total>${item.price.toLocaleString()}G</b></button></div></article>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal("アイテムショップ",`<div class="home-item-shop"><div class="home-item-shop-wallet"><span>所持GOLD</span><b>${gold.toLocaleString()}G</b></div><p class="muted">探索前でも帰還後でも、いつでも利用できます。闇市場の限定品とは別の常設店です。</p><div class="home-item-shop-list">${rows}</div></div>`,"閉じる"));
 const modal=topModal();
 modal.classList.add("ornate-shop-modal");
 modal.querySelectorAll("[data-home-shop-row]").forEach(row=>{
  const input=row.querySelector("[data-shop-qty]"),maximum=Math.max(0,Number(row.dataset.maxPurchase)||0),unitPrice=Math.max(0,Number(row.dataset.unitPrice)||0),buy=row.querySelector("[data-home-item-buy]"),label=row.querySelector("[data-shop-buy-label]"),total=row.querySelector("[data-shop-total]");
  const normalize=()=>{if(!input||maximum<=0)return 0;const count=Math.max(1,Math.min(maximum,Math.floor(Number(input.value)||1)));input.value=String(count);if(label)label.textContent=`${count}個購入`;if(total)total.textContent=`${(unitPrice*count).toLocaleString()}G`;return count};
  row.querySelectorAll("[data-shop-qty-step]").forEach(button=>button.addEventListener("click",()=>{input.value=String((Number(input.value)||1)+Number(button.dataset.shopQtyStep));normalize()}));
  row.querySelector("[data-shop-qty-max]")?.addEventListener("click",()=>{input.value=String(maximum);normalize()});
  input?.addEventListener("input",normalize);input?.addEventListener("change",normalize);if(buy)buy._selectedPurchaseCount=normalize;
 });
 modal.querySelectorAll("[data-home-item-buy]").forEach(button=>button.onclick=()=>{
  const item=HOME_ITEM_SHOP.find(entry=>entry.id===button.dataset.homeItemBuy),count=Math.max(1,Number(button._selectedPurchaseCount?.())||1);
  if(!item)return;
  if(item.dailyLimit){const daily=save.state.shop.captureDaily;if(daily.key!==localDayKey()){daily.key=localDayKey();daily.count=0}if(daily.count+count>item.dailyLimit)return showToast("捕獲結晶は1日3個までです")}
  const cost=item.price*count;
  if(save.state.player.gold<cost)return showToast("GOLDが足りません");
  save.state.player.gold-=cost;
  save.state.inventory[item.id]=(save.state.inventory[item.id]??0)+count;
  if(item.dailyLimit)save.state.shop.captureDaily.count+=count;
  save.state.records??={};
  save.state.records.purchases=(save.state.records.purchases??0)+count;
  save.save();modal.remove();showToast(`${item.name} ×${count}を購入`);openHomeItemShop();
 });
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function openFormationFromHome(){if(contextGuidePending("partyAdd"))completeContextGuide("party_open",{quiet:true});formationOrigin="home";go("formation")}
function openExploreFloorSelector(){
 const reachedMax=Math.min(WORLD_MAX_FLOOR,Math.max(1,Number(save.state.player.maxFloor)||1));
 const gmMax=Math.min(9998,Math.max(0,Number(save.state.settings?.gmFloorUnlockMax??save.state.gameMaster?.floorUnlockMax)||0));
 const max=Math.max(reachedMax,gmMax),gmNotice=gmMax>reachedMax?`<p class="departure-gm-notice">GM出発権限：1〜${gmMax.toLocaleString()}階（最高到達階 ${reachedMax.toLocaleString()} は変更されません）</p>`:"";
 const party=save.state.party.map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean);
 const partyCards=party.map(monster=>{const species=SPECIES[monster.speciesId]??{};return`<article class="departure-party-card">${monsterVisual(monster,species.emoji??"👹",{className:"departure-monster-visual"})}<b>${displayName(monster)}</b><small>Lv.${monster.level}・+${monster.plus??0}</small></article>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal("探索開始",`<div class="departure-dialog"><small class="departure-eyebrow">ABYSS DOMINION</small><p>再開する階層を選択</p><div class="departure-floor-control"><button type="button" data-floor-step="-1" aria-label="1階戻る">−</button><input id="floorSelect" type="number" inputmode="numeric" min="1" max="${max}" value="${max}" aria-label="出発階層"><button type="button" data-floor-step="1" aria-label="1階進む">＋</button></div><p class="muted">1〜${max.toLocaleString()}階から出発できます</p>${gmNotice}<h3>現在の部隊</h3><div class="departure-party-grid">${partyCards}</div></div>`,`出発する`));
 const modal=topModal(),button=modal.querySelector("[data-modal-primary]"),input=modal.querySelector("#floorSelect");
 modal.classList.add("departure-modal");
 modal.querySelector(".game-modal-card")?.classList.add("departure-modal-card");
 const normalizeFloor=()=>{input.value=String(Math.max(1,Math.min(max,Number(input.value)||max)))};
 modal.querySelectorAll("[data-floor-step]").forEach(step=>step.addEventListener("click",()=>{input.value=String((Number(input.value)||max)+Number(step.dataset.floorStep));normalizeFloor()}));
 input.addEventListener("change",normalizeFloor);
 button.onclick=()=>{const floor=Math.max(1,Math.min(max,Number(modal.querySelector("#floorSelect").value)||max));completeContextGuide("dungeon_departure",{quiet:true});if(!contextGuideDone("explore_move"))save.state.settings.exploreAutoMode="off";save.state.player.currentFloor=floor;save.state.player.inRun=true;save.state.expeditionAffectionDeaths={};beginManualExpedition(save.state,floor);beginSecretRoomExpedition(save.state);clearExpeditionSnapshot();save.save();snapshot=null;modal.remove();go("explore")};
 requestAnimationFrame(()=>showContextGuide({id:"dungeon_departure",title:"1階から出発しよう",text:"最初は1階のままでOK。「出発する」を押して探索を始めよう。",target:button,placement:"bottom"}));
}
function openUnavailableHomeFeature(title,icon){
 app.insertAdjacentHTML("beforeend",Modal(title,`<div class="home-unavailable ornate-unavailable">${icon?`<span>${icon}</span>`:'<i class="unavailable-party-emblem" aria-hidden="true"></i>'}<small>COMING SOON</small><h3>現在準備中です</h3><p>完成したコンテンツから順次解放されます。</p></div>`,"閉じる"));
 const modal=topModal();modal.classList.add("ornate-unavailable-modal");topModalButton().onclick=closeTopModal;
}
function openNoticeCenter(){
 const noticeState=normalizeNoticeState(save.state),readIds=new Set(noticeState.readIds);
 const daily=dailyNoticeGiftStatus(save.state),dailyRow=`<article class="home-notice-card daily-gift ${daily.available?"unread":"read"}" data-notice-kind="gift"><span class="notice-card-icon">🎁</span><div class="notice-card-copy"><span class="notice-card-meta"><small class="notice-type gift">毎日配布</small><time>本日 23:59まで</time></span><b>本日のログイン支援物資</b><small>捕獲結晶 ×${DAILY_NOTICE_GIFT.captureCrystals}・魔晶石 ×${DAILY_NOTICE_GIFT.crystals}<br>当日分のみ受け取れます。未受取分は翌日に持ち越されません。</small></div>${daily.available?'<button type="button" class="notice-gift-claim" data-claim-daily-gift>受け取る</button>':'<em class="notice-gift-claimed">受取済</em>'}</article>`;
 const rows=dailyRow+NOTICE_DEFINITIONS.map(notice=>{
  const unread=!readIds.has(notice.id),details=(notice.details??[]).map(line=>`<li>${line}</li>`).join("");
  return`<article class="home-notice-card notice-entry ${unread?"unread":"read"}" data-notice-id="${notice.id}" data-notice-kind="${notice.kind}"><button type="button" class="notice-card-toggle" data-notice-toggle="${notice.id}" aria-expanded="false"><span class="notice-card-icon">${notice.icon}</span><span class="notice-card-copy"><span class="notice-card-meta"><small class="notice-type ${notice.kind}">${notice.label}</small><time>${String(notice.publishedAt??"").replaceAll("-",".")}</time></span><b>${notice.title}</b><small>${notice.body}</small></span><em>${unread?"NEW":"＋"}</em></button><div class="notice-card-detail" data-notice-detail="${notice.id}" hidden><p>${notice.body}</p>${details?`<ul>${details}</ul>`:""}${notice.action?`<button type="button" class="notice-detail-action" data-home-notice="${notice.action}">${notice.action==="tutorial"?"遊び方を開く":"図鑑を開く"}</button>`:""}</div></article>`;
 }).join("");
 const counts={gift:1,event:NOTICE_DEFINITIONS.filter(notice=>notice.kind==="event").length,update:NOTICE_DEFINITIONS.filter(notice=>notice.kind==="update").length,maintenance:NOTICE_DEFINITIONS.filter(notice=>notice.kind==="maintenance").length},tab=(id,label,count)=>`<button type="button" role="tab" data-notice-filter="${id}" class="${id==="all"?"active":""}" aria-selected="${id==="all"}"><span>${label}</span><small>${count}</small></button>`;
 app.insertAdjacentHTML("beforeend",Modal("お知らせ",`<div class="notice-center-v2"><div class="notice-tabs" role="tablist" aria-label="お知らせ区分">${tab("all","すべて",1+NOTICE_DEFINITIONS.length)}${tab("gift","配布",counts.gift)}${tab("event","イベント",counts.event)}${tab("update","更新",counts.update)}${tab("maintenance","保守",counts.maintenance)}</div><div class="home-notice-list">${rows}<div class="notice-empty" hidden><span>📭</span><b>該当するお知らせはありません</b><small>別の区分を選んでください。</small></div></div><small class="notice-footer">お知らせをタップすると詳細を確認できます。</small></div>`,"閉じる"));
 const modal=topModal();
 modal.classList.add("notice-modal-v2");
 const homeNoticeButton=document.getElementById("openNoticeCenter");
 const refreshNoticeButton=()=>{const count=noticeAttentionCount(save.state);homeNoticeButton?.classList.toggle("ready",count>0);if(homeNoticeButton?.querySelector("small"))homeNoticeButton.querySelector("small").textContent=count?`未読 ${count}`:"確認済み";if(count&&!homeNoticeButton?.querySelector(".home-notification-dot"))homeNoticeButton?.insertAdjacentHTML("afterbegin",'<i class="home-notification-dot"></i>');if(!count)homeNoticeButton?.querySelector(".home-notification-dot")?.remove()};refreshNoticeButton();
 const syncNoticeEmpty=()=>{const visible=[...modal.querySelectorAll("[data-notice-kind]")].filter(entry=>!entry.hidden);modal.querySelector(".notice-empty").hidden=visible.length>0};
 modal.querySelectorAll("[data-notice-filter]").forEach(filterTab=>filterTab.addEventListener("click",()=>{modal.querySelectorAll("[data-notice-filter]").forEach(entry=>{const active=entry===filterTab;entry.classList.toggle("active",active);entry.setAttribute("aria-selected",String(active))});modal.querySelectorAll("[data-notice-kind]").forEach(entry=>entry.hidden=filterTab.dataset.noticeFilter!=="all"&&entry.dataset.noticeKind!==filterTab.dataset.noticeFilter);syncNoticeEmpty()}));
 modal.querySelectorAll("[data-notice-toggle]").forEach(toggle=>toggle.addEventListener("click",()=>{const id=toggle.dataset.noticeToggle,detail=modal.querySelector(`[data-notice-detail="${id}"]`),open=toggle.getAttribute("aria-expanded")!=="true";modal.querySelectorAll("[data-notice-toggle]").forEach(other=>{if(other===toggle)return;other.setAttribute("aria-expanded","false");const otherDetail=modal.querySelector(`[data-notice-detail="${other.dataset.noticeToggle}"]`);if(otherDetail)otherDetail.hidden=true});toggle.setAttribute("aria-expanded",String(open));if(detail)detail.hidden=!open;const card=toggle.closest(".home-notice-card");if(card?.classList.contains("unread")){markNoticeRead(save.state,id);save.save();card.classList.remove("unread");card.classList.add("read");toggle.querySelector(":scope > em").textContent=open?"−":"＋";refreshNoticeButton()}else toggle.querySelector(":scope > em").textContent=open?"−":"＋"}));
 modal.querySelector('[data-home-notice="tutorial"]')?.addEventListener("click",()=>{modal.remove();openTutorialBook()});
 modal.querySelector('[data-home-notice="codex"]')?.addEventListener("click",()=>{modal.remove();openCodexHub()});
 modal.querySelector("[data-claim-daily-gift]")?.addEventListener("click",event=>{const result=claimDailyNoticeGift(save.state);if(!result.ok)return showToast("本日分は受取済みです");save.save();event.currentTarget.outerHTML='<em class="notice-gift-claimed">受取済</em>';refreshNoticeButton();showResourceToast("capture",DAILY_NOTICE_GIFT.captureCrystals);setTimeout(()=>showResourceToast("crystal",DAILY_NOTICE_GIFT.crystals),380);showToast(`毎日配布：捕獲結晶×${DAILY_NOTICE_GIFT.captureCrystals}・魔晶石×${DAILY_NOTICE_GIFT.crystals}`)});
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function resetGauntletAttempt(trials){
 trials.bestBattle=Math.max(Number(trials.bestBattle)||0,Number(trials.run?.battle)||0);
 trials.bestVictories=Math.max(Number(trials.bestVictories)||0,Number(trials.run?.victories)||0);
 trials.battle=1;trials.loop=1;trials.cleared=[];trials.run=null;
}
function settleGauntletRun(reason="return"){
 const trials=normalizeEndgameState(save.state).trials,run=trials.run;if(!run?.active)return null;
 const victories=Math.max(0,Math.floor(Number(run.victories)||0)),score=Math.max(0,Math.floor(Number(run.score)||0)),maxFloor=Math.max(1,Number(save.state.player.maxFloor)||1),bossIds=(run.defeatedBossIds??[]).filter(id=>ENDGAME_BOSSES[id]),floorBossIds=(run.defeatedFloorBossIds??[]).filter(id=>floorBossDefinitionById(id));
 const gold=victories<=0?0:modifiedGoldReward(save.state,Math.round(chestGoldBase(maxFloor)*Math.pow(victories,1.78)*(1+Math.max(0,(Number(run.maxLoop)||1)-1)*.45)) ,"battle");
 if(gold)save.state.player.gold+=gold;
 const emergency=normalizeEndgameState(save.state).emergency,fragmentMap={};
 const fragmentRolls=victories<2?0:Math.max(1,Math.floor(Math.pow(victories-1,1.18)/2.1));
 for(let index=0;index<fragmentRolls&&bossIds.length;index++){
  const id=bossIds[Math.floor(Math.random()*bossIds.length)],boss=ENDGAME_BOSSES[id],deepBonus=Math.floor(victories/18),amount=Math.max(1,1+deepBonus-(boss?.faction==="tenGod"&&Math.random()<.55?1:0));
  emergency.fragments[id]=(emergency.fragments[id]??0)+amount;fragmentMap[id]=(fragmentMap[id]??0)+amount;
 }
 const floorBossFragmentMap={},floorChallenge=normalizeFloorBossChallengeState(save.state),floorRolls=Math.min(floorBossIds.length,Math.floor(victories/5));
 for(let index=0;index<floorRolls&&floorBossIds.length;index++){const id=floorBossIds[Math.floor(index*floorBossIds.length/Math.max(1,floorRolls))];floorChallenge.fragments[id]=(floorChallenge.fragments[id]??0)+1;floorBossFragmentMap[id]=(floorBossFragmentMap[id]??0)+1}
 let equipment=null,equipmentReceiptResult=null;
 const gearChance=victories<=2?0:Math.min(.48,.0045*Math.pow(victories,1.42));
 if(bossIds.length&&Math.random()<gearChance){
  const ownerId=bossIds[Math.floor(Math.random()*bossIds.length)],owner=ENDGAME_BOSSES[ownerId],rarity=victories>=22?"神話":victories>=10?"LR":"SSR";
  equipment=createEquipment("weapon",{rarity,series:owner.seriesId,ruleOverrides:{gauntletEcho:true}});equipment.name=`${owner.name}の回廊残響`;equipment.level=Math.max(1,Math.round(maxFloor*(.75+Math.random()*.75)));equipment.plus=Math.max(0,Math.floor(victories/5));equipment.endgameBossId=ownerId;equipment.endgameFaction=owner.faction;equipment.obtainedMethod="gauntletSettlement";equipmentReceiptResult=receiveEquipment(save.state,equipment,{bossReward:true});
 }
 const settlement={reason,victories,score,gold,fragments:fragmentMap,floorBossFragments:floorBossFragmentMap,equipment,equipmentReceipt:equipmentReceiptResult,maxLoop:Math.max(1,Number(run.maxLoop)||Number(run.loop)||1),endedAt:new Date().toISOString()};
 trials.lastSettlement=settlement;resetGauntletAttempt(trials);save.save();return settlement;
}
function showGauntletSettlement(settlement){
 if(!settlement){screen="home";render();return}
 const fragmentRows=[...Object.entries(settlement.fragments??{}).map(([id,count])=>{const boss=ENDGAME_BOSSES[id];return`<article>${monsterVisual(id,boss?.icon??"MONSTER",{className:"gauntlet-settlement-fragment"})}<span><b>${boss?.name??id}の欠片 ×${count}</b><small>欠片祭壇へ追加</small></span></article>`}),...Object.entries(settlement.floorBossFragments??{}).map(([id,count])=>{const boss=floorBossDefinitionById(id);return`<article>${monsterVisual({speciesId:boss?.speciesId,visualSpeciesId:boss?.visualSpeciesId},SPECIES[boss?.speciesId]?.emoji??"BOSS",{className:"gauntlet-settlement-fragment"})}<span><b>${boss?.name??id}の欠片 ×${count}</b><small>階層ボス交換へ追加</small></span></article>`})].join("");
 const reasonLabel=settlement.reason==="defeat"?"全滅":settlement.reason==="complete"?"最終審理突破":"自主帰還";
 const body=`<div class="gauntlet-settlement"><div class="gauntlet-settlement-crest"><span class="trial-pixel-emblem corridor"></span><small>ABYSS CORRIDOR / RUN SETTLEMENT</small><h2>${reasonLabel}・連続${settlement.victories}勝</h2><b>RUN SCORE ${settlement.score.toLocaleString()}</b></div><div class="gauntlet-settlement-reward"><article>${pixelIcon("coin")}<small>深層精算GOLD</small><strong>+${settlement.gold.toLocaleString()}G</strong></article><article>${pixelIcon("event")}<small>最高周回</small><strong>${settlement.maxLoop}周目</strong></article></div>${fragmentRows?`<h3>回収された存在の欠片</h3><div class="gauntlet-settlement-fragments">${fragmentRows}</div>`:'<p class="gauntlet-no-loot">浅層撤退のため、今回は欠片を持ち帰れませんでした。</p>'}${settlement.equipment?`<div class="gauntlet-rare-drop"><small>RARE ECHO DROP</small><b>[${settlement.equipment.rarity}] ${settlement.equipment.name}</b><span>Lv.${settlement.equipment.level.toLocaleString()} +${settlement.equipment.plus}・${settlement.equipmentReceipt?.message??"獲得"}</span></div>`:""}<p>次回の奈落回廊は第1戦から始まります。深く踏破するほど精算量と希少抽選が指数的に上昇します。</p></div>`;
 app.insertAdjacentHTML("beforeend",Modal("奈落回廊・最終精算",body,"拠点へ戻る"));const modal=topModal();modal.classList.add("gauntlet-settlement-modal");modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();screen="home";render()};
}
function openGauntletTrial(){
 if(!isContentUnlocked(save.state,GAUNTLET_UNLOCK_FLOOR))return showToast(`${contentUnlockFloor(GAUNTLET_UNLOCK_FLOOR)}階突破で解放されます`);
 if(save.state.party.length!==4)return alert(`奈落回廊には出撃メンバーが4体必要です（現在 ${save.state.party.length}/4体）`);
 const state=normalizeEndgameState(save.state).trials,daily=dailyGauntletAttempts(save.state),active=Boolean(state.run?.active);
 if(!active&&daily.remaining<=0)return showToast("本日の奈落回廊は終了");
 if(!active){state.battle=1;state.loop=1;state.cleared=[]}
 const encounter=createEndgameTrialEncounter(save.state,active?state.run.battle:1),trial=encounter.trial;if(encounter.locked)return showToast(`${encounter.requiredFloorBoss?.floor??"次"}階の階層ボスに本編で遭遇すると第${trial.number}戦が解禁されます`);const floorBoss=trial.floorBossId?floorBossDefinitionById(trial.floorBossId):null,bosses=floorBoss?[{...floorBoss,visualId:floorBoss.visualSpeciesId??floorBoss.speciesId,icon:SPECIES[floorBoss.speciesId]?.emoji??"BOSS"}]:trial.bossIds.map(id=>({...ENDGAME_BOSSES[id],visualId:id}));
 app.insertAdjacentHTML("beforeend",Modal("奈落回廊",`<div class="gauntlet-brief"><span class="trial-pixel-emblem corridor"></span><small>ABYSS CORRIDOR・${active?state.run.loop:state.loop}周目</small><h2>第${trial.number}/${ENDGAME_TRIAL_BATTLE_COUNT}戦　${trial.name}</h2><div class="gauntlet-opponents">${bosses.map(boss=>`<article>${monsterVisual({speciesId:boss.speciesId,visualSpeciesId:boss.visualId},boss.icon,{className:"gauntlet-boss-visual"})}<b>${boss.name}</b><small>${boss.role}</small></article>`).join("")}</div><p>入口から歩き、中央の法廷主へ触れると戦闘開始。勝利後は部屋奥の奈落門へ進みます。</p><p><b>戦闘前後に持ち物使用・いつでも帰還可能</b></p><div class="daily-attempt-plaque"><b>${active?"連続踏破中":`本日 残り${daily.remaining}回`}</b><small>${active?"帰還・全滅まで1回の挑戦として継続":`${daily.limit-daily.remaining}/${daily.limit}・日本時間0時更新`}</small></div></div>`,active?"回廊へ戻る":"奈落回廊へ入る"));
 const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();if(!active){state.dailyAttempts=Math.min(daily.limit,(Number(state.dailyAttempts)||0)+1);state.run={active:true,battle:1,loop:1,maxLoop:1,defeated:false,x:50,y:88,startedAt:new Date().toISOString(),fights:0,victories:0,score:0,defeatedBossIds:[],defeatedFloorBossIds:[]};save.save()}screen="gauntlet";render()};
}
let gauntletWalkToken=0;
function currentGauntletRun(){const trials=normalizeEndgameState(save.state).trials;return trials.run?.active?trials.run:null}
function gauntletObjectPosition(){const run=currentGauntletRun();return{x:50,y:run?.defeated?14:45}}
function walkGauntletTo(targetX,targetY,action=null){
 const run=currentGauntletRun(),token=document.querySelector("[data-gauntlet-token]"),floor=document.querySelector("[data-gauntlet-floor]");if(!run||!token||!floor)return;
 const animation=++gauntletWalkToken,startX=Number(run.x)||16,startY=Number(run.y)||80,endX=Math.max(7,Math.min(93,Number(targetX)||startX)),endY=Math.max(8,Math.min(92,Number(targetY)||startY)),distance=Math.hypot(endX-startX,endY-startY),started=performance.now(),duration=Math.max(280,Math.min(1500,distance*17));
 floor.classList.add("is-walking");
 const step=now=>{if(animation!==gauntletWalkToken||!token.isConnected)return;const progress=Math.min(1,(now-started)/duration),eased=progress<.5?2*progress*progress:1-Math.pow(-2*progress+2,2)/2,x=startX+(endX-startX)*eased,y=startY+(endY-startY)*eased;token.style.setProperty("--gx",x);token.style.setProperty("--gy",y);if(progress<1)return requestAnimationFrame(step);floor.classList.remove("is-walking");run.x=endX;run.y=endY;save.save();if(action==="enemy")beginGauntletEncounter();else if(action==="exit")advanceGauntletFloor()};requestAnimationFrame(step);
}
function beginGauntletEncounter(){
 const run=currentGauntletRun();if(!run||run.defeated)return;const living=save.state.party.some(id=>(save.state.monsters.find(monster=>monster.id===id)?.currentHp??0)>0);if(!living)return showToast("戦える仲間がいません。持ち物で蘇生するか帰還してください");
 const encounter=createEndgameTrialEncounter(save.state,run.battle),trial=encounter.trial;if(encounter.locked)return showToast(`${encounter.requiredFloorBoss?.floor??"次"}階の階層ボスへ本編で遭遇すると解禁されます`);run.fights=Math.max(0,Number(run.fights)||0)+1;save.save();
 startSpecialBattle(encounter.enemies,{type:"gauntlet",title:`奈落回廊・第${trial.number}戦`,subtitle:`${trial.name} / ${run.loop}周目`,priorVitals:null,trialNumber:trial.number,trialLoop:run.loop,returnScreen:"gauntlet"});
}
function advanceGauntletFloor(){
 const trials=normalizeEndgameState(save.state).trials,run=currentGauntletRun();if(!run?.defeated)return;
 run.battle=trials.battle;run.loop=trials.loop;run.maxLoop=Math.max(Number(run.maxLoop)||1,Number(run.loop)||1);run.defeated=false;run.x=50;run.y=88;run.enteredAt=new Date().toISOString();save.save();screen="gauntlet";render();
}
function bindGauntlet(){
 const run=currentGauntletRun();if(!run){screen="home";render();return}
 const floor=document.querySelector("[data-gauntlet-floor]"),object=document.querySelector("[data-gauntlet-object]"),position=gauntletObjectPosition();
 floor?.addEventListener("click",event=>{if(event.target.closest("button"))return;const rect=floor.getBoundingClientRect(),x=(event.clientX-rect.left)/Math.max(1,rect.width)*100,y=(event.clientY-rect.top)/Math.max(1,rect.height)*100;walkGauntletTo(x,y)});
 object?.addEventListener("click",event=>{event.stopPropagation();walkGauntletTo(position.x,position.y,object.dataset.gauntletObject)});
 document.querySelector("[data-gauntlet-party-toggle]")?.addEventListener("click",()=>{save.state.settings.gauntletPartyCollapsed=!save.state.settings.gauntletPartyCollapsed;save.save();render()});
 document.querySelector("[data-gauntlet-items]")?.addEventListener("click",()=>{inventoryNavigationOrigin="gauntlet";inventoryCategory="consumable";go("inventory")});
 document.querySelector("[data-gauntlet-return]")?.addEventListener("click",()=>{app.insertAdjacentHTML("beforeend",Modal("奈落回廊から帰還",`<p>ここまでの連続${run.victories??0}勝を精算して帰還しますか？</p><p class="muted">GOLD・討伐対象の欠片・希少武器をまとめて抽選します。次回は第1戦からです。</p>`,"精算して帰還"));const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{const settlement=settleGauntletRun("return");modal.remove();showGauntletSettlement(settlement)}});
}
function createContractedFloorBoss(definition){
 const monster=createMonster(definition.speciesId,{nickname:definition.name,title:definition.title,level:definition.floor,rank:4,favorite:true,locked:true,attribute:definition.element,obtainedFloor:definition.floor,obtainedMethod:"floorBossContract",floorBossCatalogId:definition.id,floorBossStatProfile:definition.stats,tags:[SPECIES[definition.speciesId]?.race,"階層ボス",definition.id].filter(Boolean)});
 monster.visualSpeciesId=definition.visualSpeciesId??definition.speciesId;monster.summonTier="神話";monster.summonRarity="神話";monster.skillLoadoutInitialized=false;monster.currentHp=calculatedStats(monster).hp;monster.currentMp=maxMp(monster);return monster;
}
function confirmFloorBossExchange(bossId,reward){
 const status=floorBossChallengeStatus(save.state,bossId);if(!status)return;
 const labels={monster:`${status.boss.name}本体`,weapon:"専用武器",armor:"専用防具",accessory:"専用アクセ"},cost=reward==="monster"?FLOOR_BOSS_CONTRACT_COST:FLOOR_BOSS_EQUIPMENT_COST;
 app.insertAdjacentHTML("beforeend",Modal("欠片交換の確認",`<div class="floor-boss-exchange-confirm">${monsterVisual({speciesId:status.boss.speciesId,visualSpeciesId:status.boss.visualSpeciesId},SPECIES[status.boss.speciesId]?.emoji??"BOSS",{className:"floor-boss-exchange-visual"})}<h3>${labels[reward]}</h3><p>${status.boss.name}の欠片を <b>${cost}個</b> 消費します。</p><small>所持 ${status.fragments}個 → ${Math.max(0,status.fragments-cost)}個</small></div>`,"交換する"));
 const modal=topModal();modal.classList.add("floor-boss-exchange-confirm-modal");modal.querySelector("[data-modal-primary]").onclick=()=>{if(reward==="monster"&&save.state.monsters.length>=MONSTER_STORAGE_CAP)return showToast(`所持上限 ${MONSTER_STORAGE_CAP}体です`);const result=spendFloorBossFragments(save.state,bossId,reward);if(!result.ok)return showToast(result.message);let obtained=null;try{if(reward==="monster"){obtained=createContractedFloorBoss(result.boss);save.state.monsters.push(obtained);save.state.codex.encounters[obtained.speciesId]=(save.state.codex.encounters[obtained.speciesId]??0)+1;save.state.codex.captures[obtained.speciesId]=(save.state.codex.captures[obtained.speciesId]??0)+1}else{obtained=dedicatedFloorBossEquipment(result.boss.floor,{floorBossCatalogId:result.boss.id},reward);if(!obtained)throw new Error("equipment-design-missing");receiveEquipment(save.state,obtained,{bossReward:true})}}catch(error){restoreFloorBossFragments(save.state,bossId,result.cost,{contract:reward==="monster"});return showToast("交換を完了できなかったため欠片を返却しました")};save.save();modal.remove();showToast(`${labels[reward]}を獲得！`);openFloorBossExchange(bossId)};
}
function openFloorBossExchange(bossId){
 const status=floorBossChallengeStatus(save.state,bossId);if(!status?.unlocked)return showToast("ダンジョンでこの階層ボスに出会うと解禁されます");
 const boss=status.boss,pieces=[["monster",boss.name,FLOOR_BOSS_CONTRACT_COST,status.contracted],["weapon",boss.dedicatedWeapon?.name??"専用武器",FLOOR_BOSS_EQUIPMENT_COST,false],["armor",boss.dedicatedArmor?.name??"専用防具",FLOOR_BOSS_EQUIPMENT_COST,false],["accessory",boss.dedicatedAccessory?.name??"専用アクセ",FLOOR_BOSS_EQUIPMENT_COST,false]],rows=pieces.map(([id,name,cost,claimed])=>`<button type="button" data-floor-boss-exchange="${id}" ${claimed||status.fragments<cost?"disabled":""}><span>${id==="monster"?monsterVisual({speciesId:boss.speciesId,visualSpeciesId:boss.visualSpeciesId},SPECIES[boss.speciesId]?.emoji??"BOSS",{className:"floor-boss-exchange-mini"}):equipmentVisual(floorBossEquipmentDesignByPiece(boss.id,id),{className:"floor-boss-exchange-equipment"})}</span><div><small>${id==="monster"?"階層支配者との契約":"神話ランク・固有装備"}</small><b>${name}</b><em>${claimed?"契約済み":`欠片 ${cost}個`}</em></div></button>`).join("");
 app.insertAdjacentHTML("beforeend",Modal(`${boss.floor}階・欠片交換`, `<div class="floor-boss-exchange"><header><b>${boss.name}の欠片</b><strong>${status.fragments}</strong><small>討伐 ${status.victories}回・初勝利10個／再勝利2～5個</small></header><div>${rows}</div></div>`,"挑戦門へ戻る"));const modal=topModal();modal.classList.add("floor-boss-exchange-modal");modal.querySelectorAll("[data-floor-boss-exchange]").forEach(button=>button.onclick=()=>{const reward=button.dataset.floorBossExchange;modal.remove();confirmFloorBossExchange(bossId,reward)});modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();openEndgameTrialPicker()};
}
function triggerFloorBossChallenge(bossId){
 const event=createFloorBossChallengeEncounter(save.state,bossId);if(!event)return showToast("ダンジョンでこの階層ボスに出会うと解禁されます");
 if(!save.state.party.length)return showToast("出撃メンバーを編成してください");
 const prior=capturePartyVitals();fullyRecoverParty();save.save();startSpecialBattle(event.enemies,{type:"floorBoss",title:`${event.definition.floor}階・${event.definition.name}`,subtitle:"階層ボス欠片試練 / 捕獲不可",priorVitals:prior,bossId:event.definition.id,returnScreen:"bossGate"});
}
function openEndgameTrialPicker(){
 normalizeFloorBossChallengeState(save.state);
 const daily=manualEndgameChallengeStatus(save.state),floorRows=FLOOR_BOSS_CATALOG.map(boss=>{const status=floorBossChallengeStatus(save.state,boss.id),tone=({UR:"ur",LR:"lr","神話":"mythic"})[boss.rarity]??"";return`<article class="floor-boss-gate-entry ${status.unlocked?"unlocked":"locked"} ${tone?`rank-${tone}`:""}" data-floor-boss-band="${Math.floor(boss.floor/100)*100}"><button type="button" data-floor-boss-challenge="${boss.id}" ${status.unlocked?"":"disabled"}><span class="${status.unlocked?"":"undiscovered"}">${status.unlocked?monsterVisual({speciesId:boss.speciesId,visualSpeciesId:boss.visualSpeciesId},SPECIES[boss.speciesId]?.emoji??"BOSS",{className:"floor-boss-gate-visual"}):pixelIcon("lock")}</span><div><small>${boss.floor}F・${status.unlocked?boss.rarity:"未遭遇"}</small><b>${status.unlocked?boss.name:"？？？？？？"}</b><em>${status.unlocked?`欠片 ${status.fragments}・討伐 ${status.victories}`:"探索で遭遇すると解禁"}</em></div></button><button type="button" data-floor-boss-exchange-open="${boss.id}" ${status.unlocked?"":"disabled"}>欠片交換</button></article>`}).join(""),endgameRows=Object.values(ENDGAME_BOSSES).map(boss=>{const tier=manualEndgameTierStatus(save.state,boss.id);return`<article class="endgame-gate-entry ${daily.remaining?"":"exhausted"}"><button type="button" data-endgame-challenge="${boss.id}" ${daily.remaining?"":"disabled"}><span>${monsterVisual(boss.id,boss.icon,{className:"endgame-gate-monster-visual"})}</span><b>${boss.name}</b><small>${boss.faction==="tenGod"?"十神":"深淵"}・第${tier.highestUnlocked}段階まで解禁</small></button><button type="button" data-endgame-detail="${boss.id}">人物・権能・装備</button></article>`}).join(""),unlockedCount=FLOOR_BOSS_CATALOG.filter(boss=>floorBossChallengeStatus(save.state,boss.id)?.unlocked).length;
 const bands=[0,100,200,300,400,500,600,700,800,900];
 app.insertAdjacentHTML("beforeend",Modal("ボス・深淵・十神　挑戦門",`<div class="boss-gate-v2"><nav class="boss-gate-tabs"><button type="button" class="active" data-boss-gate-tab="floor">階層ボス <em>${unlockedCount}/90</em></button><button type="button" data-boss-gate-tab="endgame">深淵・十神 <em>残${daily.remaining}</em></button></nav><section data-boss-gate-panel="floor"><div class="floor-boss-gate-head"><b>一度出会った支配者と再戦</b><small>捕獲不可・勝利で固有欠片／本体50・各装備20</small></div><nav class="floor-boss-band-filter"><button type="button" class="active" data-floor-boss-band-filter="all">全て</button>${bands.map(value=>`<button type="button" data-floor-boss-band-filter="${value}">${value+10}–${value+90}F</button>`).join("")}</nav><div class="floor-boss-gate-list">${floorRows}</div></section><section data-boss-gate-panel="endgame" hidden><div class="manual-attempt-counter"><b>本日の挑戦　${daily.limit-daily.remaining}/${daily.limit}</b><small>深淵・十神の全段階で共通／日本時間0時更新</small></div><button type="button" class="fragment-altar-open" data-open-fragment-altar>${pixelIcon("summon")} 深淵・十神 欠片祭壇</button><p>各キャラクターは4段階。ひとつ前を討伐すると次段階が解禁されます。</p>${endgameRows}</section></div>`,"閉じる"));
 const modal=topModal();modal.classList.add("test-endgame-modal","boss-gate-modal-v2");modal.querySelectorAll("[data-boss-gate-tab]").forEach(button=>button.onclick=()=>{modal.querySelectorAll("[data-boss-gate-tab]").forEach(entry=>entry.classList.toggle("active",entry===button));modal.querySelectorAll("[data-boss-gate-panel]").forEach(panel=>panel.hidden=panel.dataset.bossGatePanel!==button.dataset.bossGateTab)});modal.querySelectorAll("[data-floor-boss-band-filter]").forEach(button=>button.onclick=()=>{modal.querySelectorAll("[data-floor-boss-band-filter]").forEach(entry=>entry.classList.toggle("active",entry===button));modal.querySelectorAll("[data-floor-boss-band]").forEach(card=>card.hidden=button.dataset.floorBossBandFilter!=="all"&&card.dataset.floorBossBand!==button.dataset.floorBossBandFilter)});modal.querySelector("[data-open-fragment-altar]").onclick=()=>{modal.remove();openEndgameForge()};modal.querySelectorAll("[data-floor-boss-challenge]").forEach(button=>button.onclick=()=>{const id=button.dataset.floorBossChallenge;modal.remove();triggerFloorBossChallenge(id)});modal.querySelectorAll("[data-floor-boss-exchange-open]").forEach(button=>button.onclick=()=>{const id=button.dataset.floorBossExchangeOpen;modal.remove();openFloorBossExchange(id)});modal.querySelectorAll("[data-endgame-challenge]").forEach(button=>button.onclick=()=>{const id=button.dataset.endgameChallenge;modal.remove();triggerEmergencyEncounter(id,{returnScreen:"home",manual:true})});modal.querySelectorAll("[data-endgame-detail]").forEach(button=>button.onclick=()=>openEndgameDossier(button.dataset.endgameDetail));modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function openEndgameDossier(bossId){
 const boss=endgameCharacter(bossId);if(!boss)return;
 const resist=Object.entries(boss.elementMultipliers).map(([key,value])=>`<span><small>${key}</small><b>${Math.round(value*100)}%</b></span>`).join(""),skills=boss.skills.map(skill=>`<article><small>${skill.tag}・MP${skill.mp}${skill.mpRate?`＋最大MP${Math.round(skill.mpRate*100)}%基準`:""}・CT${skill.cooldown}</small><b>${skill.name}</b><p>${skillEffectSummary(skill," / ")}</p></article>`).join(""),gear=boss.gear.map(item=>`<article><small>${equipmentSubslotLabel(item.subslot)}</small><b>${item.name}</b><p>${item.effectText}</p></article>`).join("");
 const labels={hp:"HP",atk:"物理ATK",matk:"魔法ATK",def:"物理DEF",mdef:"魔法DEF",spd:"SPD",crit:"会心",evasion:"回避",accuracy:"命中"},statProfile=Object.entries(boss.statProfile??{}).map(([key,value])=>`<span><small>${labels[key]??key}</small><b>${["crit","evasion","accuracy"].includes(key)?`${value>=0?"+":""}${value}`:`×${Number(value).toFixed(2)}`}</b></span>`).join("");
 const weaponSkill=boss.signatureWeapon?.skill,weaponCard=weaponSkill?`<article><small>装備中限定・最大MP基準${Math.round((weaponSkill.mpRate??0)*100)}%・CT${weaponSkill.cooldown}</small><b>${weaponSkill.name}</b><p>${skillEffectSummary(weaponSkill," / ")}</p></article>`:"";
 app.insertAdjacentHTML("beforeend",Modal(`${boss.icon} ${boss.name}`,`<div class="endgame-character-bible ${boss.faction}">${monsterVisual(boss.id,boss.icon,{className:"endgame-bible-visual"})}<small>${boss.role}</small><h3>${boss.title}</h3><blockquote>${boss.encounterText}</blockquote><p>${boss.lore}</p><section><h4>戦闘思想</h4><p>${boss.ai}</p><b>${boss.passive}</b><small>${boss.awakening}</small></section>${statProfile?`<h4>固有ステータス倍率</h4><div class="endgame-resistance-grid endgame-stat-profile">${statProfile}</div>`:""}<div class="endgame-resistance-grid">${resist}</div><div class="endgame-status-note"><b>無効：${boss.statusProfile.immune.join("・")||"なし"}</b><span>耐性：${boss.statusProfile.resistant.join("・")||"なし"}</span>${boss.statusProfile.weak.length?`<em>弱点：${boss.statusProfile.weak.join("・")}</em>`:""}</div><h4>固有技</h4><div class="endgame-bible-grid">${skills}</div>${weaponCard?`<h4>固有武器技</h4><div class="endgame-bible-grid">${weaponCard}</div>`:""}<h4>固有装備 6部位</h4><div class="endgame-bible-grid gear">${gear}</div><div class="endgame-set-list"><b>2部位：${boss.setText[2]}</b><b>4部位：${boss.setText[4]}</b><b>6部位：${boss.setText[6]}</b></div></div>`,"戻る"));topModalButton().onclick=closeTopModal
}
function openEventHub(){
 const teamUnlocked=isContentUnlocked(save.state,TEAM_BATTLE_UNLOCK_FLOOR),emergencyUnlocked=isContentUnlocked(save.state,EMERGENCY_UNLOCK_FLOOR),gauntletUnlocked=isContentUnlocked(save.state,GAUNTLET_UNLOCK_FLOOR),floorBossUnlocked=FLOOR_BOSS_CATALOG.some(boss=>floorBossChallengeStatus(save.state,boss.id)?.unlocked),bossGateUnlocked=emergencyUnlocked||floorBossUnlocked,testLabel=CONTENT_TEST_MODE?`試遊条件 ${contentUnlockFloor(9999)}階`:"",team=dailyTeamAttempts(save.state),trials=normalizeEndgameState(save.state).trials,gauntlet=dailyGauntletAttempts(save.state),manual=manualEndgameChallengeStatus(save.state);
 app.insertAdjacentHTML("beforeend",Modal("試練",`<div class="trial-access-note ${CONTENT_TEST_MODE?"is-test":""}"><b>${CONTENT_TEST_MODE?"TEST ACCESS":"CHALLENGE GATE"}</b><small>${CONTENT_TEST_MODE?"完成時は正式な解放条件へ自動復帰します。":"編成・属性・装備の完成度を測る最深部への門"}</small></div><div class="home-event-grid trial-gate-grid brain-rush">
  <button type="button" data-home-trial="team" class="team ${teamUnlocked?"unlocked":"locked"}"><span class="trial-pixel-emblem arena"></span><div><b>4 VS 4</b><small>${teamUnlocked?`指数強化・第50試練は編成完成が必須 ${testLabel}`:`${contentUnlockFloor(TEAM_BATTLE_UNLOCK_FLOOR)}階突破で解放`}</small></div><em>残${team.remaining}/${team.limit}</em></button>
  <button type="button" data-home-trial="gauntlet" class="corridor ${gauntletUnlocked?"unlocked":"locked"}"><span class="trial-pixel-emblem corridor"></span><div><b>奈落回廊</b><small>${gauntletUnlocked?`歩行式・全${ENDGAME_TRIAL_BATTLE_COUNT}法廷・戦闘前後に道具使用可 ${testLabel}`:`${contentUnlockFloor(GAUNTLET_UNLOCK_FLOOR)}階突破で解放`}</small></div><em>${trials.run?.active?"踏破中":`残${gauntlet.remaining}/${gauntlet.limit}`}</em></button>
  <button type="button" data-home-trial="endgame" class="endgame ${bossGateUnlocked?"unlocked":"locked"}"><span class="trial-pixel-emblem endgame"></span><div><b>ボス・深淵・十神</b><small>${bossGateUnlocked?`遭遇ボス再戦・欠片交換／深淵・十神は1日3戦 ${testLabel}`:"階層ボスと一度遭遇すると解放"}</small></div><em>${floorBossUnlocked?"BOSS登録済":`本日 残${manual.remaining}`}</em></button>
 </div>`,"閉じる"));
 const modal=topModal();modal.classList.add("trial-hub-modal-v3");
 modal.querySelectorAll("[data-home-trial]").forEach(button=>button.onclick=()=>{
  const action=button.dataset.homeTrial;
  if(action==="team"&&teamUnlocked){modal.remove();return openTeamBattle()}
  if(action==="gauntlet"&&gauntletUnlocked){modal.remove();return openGauntletTrial()}
  if(action==="endgame"&&bossGateUnlocked){modal.remove();return openEndgameTrialPicker()}
  if(action==="endgame")return showToast("階層ボスと一度遭遇すると解放されます");const required=action==="gauntlet"?contentUnlockFloor(GAUNTLET_UNLOCK_FLOOR):contentUnlockFloor(TEAM_BATTLE_UNLOCK_FLOOR);showToast(`${required}階突破で解放されます`);
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
 if(!memory?.entries?.length)return premiumCrystalCost(10);
 const signature=memory.signature??memorySignature(memory.entries),attempts=Math.max(0,Math.floor(Number(save.state.battleMemoryAttempts?.[signature])||0));
 const base=Math.min(Number.MAX_SAFE_INTEGER,10*2**Math.min(attempts,49));
 return premiumCrystalCost(Math.min(Number.MAX_SAFE_INTEGER,memory.entries.some(entry=>entry.boss)?Math.ceil(base*1.5):base));
}
function openBattleMemory(){
 const memory=save.state.recentBattleMemory;
 if(!memory?.entries?.length){
  app.insertAdjacentHTML("beforeend",Modal("戦闘の記憶",`<div class="battle-memory-empty">${pixelIcon("memory")}<p>まだ呼び戻せる戦闘の記憶がありません。</p><small>敵と戦うと、最後の敵パーティー全体がここへ記録されます。</small></div>`,"閉じる"));
  topModalButton().onclick=closeTopModal;return;
 }
 const signature=memory.signature??memorySignature(memory.entries),cost=battleMemoryCost(memory),enough=(save.state.player.crystals??0)>=cost,hasBoss=memory.entries.some(entry=>entry.boss),attempts=Math.max(0,Math.floor(Number(save.state.battleMemoryAttempts?.[signature])||0));
 const previews=memory.entries.map((entry,index)=>{const species=SPECIES[entry.speciesId],preview={...entry,stars:entry.boss?5:1,plus:0,affection:0};return`<article class="battle-memory-enemy ${entry.boss?"boss":""}"><span>${monsterVisual(preview,species?.emoji??"MONSTER",{className:"battle-memory-monster-visual"})}</span><div><small>${entry.boss?"ボス":entry.elite?"強敵":`敵 ${index+1}`}</small><b>${entry.nameOverride??species?.name??"魔物"}</b><em>Lv.${entry.level}${entry.equipped?"・装備個体":""}</em></div></article>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal("戦闘の記憶",`<div class="battle-memory-preview">
  <div class="battle-memory-party">${previews}</div>
  <small>直前の戦闘・${memory.recordedFloor}F・${memory.entries.length}体編成</small>
  <p>直前に戦った敵編成を、ボス・装備・補正までまとめて再現します。</p>
  <div class="battle-memory-cost">${pixelIcon("crystal")}<b>魔晶石 ${cost.toLocaleString()}個</b><span>所持 ${(save.state.player.crystals??0).toLocaleString()}個</span></div>
  <small class="muted">同じ記憶への挑戦は 100→200→400… と倍増。ボスを含む場合は1.5倍です。現在 ${attempts}回挑戦済み。</small>
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
  const encounter=memory.entries.map(entry=>({...cloneSerializable(entry),uncapturable:Boolean(entry.uncapturable||entry.endgameBossId||["abyss","tenGod"].includes(entry.faction))}));
  startBattle(encounter,{memoryBattle:true,bossMemoryBattle:hasBoss,memorySourceFloor:memory.recordedFloor,memorySignature:signature});
 };
}
function openBossMemory(){
 const memory=save.state.recentBossEncounter,species=memory?.speciesId?SPECIES[memory.speciesId]:null;
 if(!memory||!species){
  app.insertAdjacentHTML("beforeend",Modal("深淵の記憶",`<div class="battle-memory-empty boss-memory-empty"><img src="assets/ui/v2/memory-rift.png" alt=""><p>記録された階層支配者はいません。</p><small>階層ボスを撃破すると、最後の1体が深淵へ刻まれます。</small></div>`,"閉じる"));
  topModalButton().onclick=closeTopModal;return;
 }
 const bossMemoryCost=premiumCrystalCost(10),enough=(save.state.player.crystals??0)>=bossMemoryCost,name=memory.nameOverride??species.name;
 const preview={speciesId:memory.speciesId,level:memory.level,stars:5,plus:0,affection:0};
 app.insertAdjacentHTML("beforeend",Modal("深淵の記憶",`<div class="battle-memory-preview boss-memory-preview">
  <div class="battle-memory-rift"><img src="assets/ui/v2/memory-rift.png" alt="" class="boss-memory-rift-art">${monsterVisual(preview,species.emoji??"MONSTER",{className:"battle-memory-monster-visual"})}</div>
  <small>ボスの記憶・${memory.recordedFloor}F</small><h2>${name} <em>Lv.${memory.level}</em></h2>
  <p>撃破した階層支配者を再現します。深淵・十神以外は、この再戦で捕獲できます。</p>
  <div class="battle-memory-cost">${pixelIcon("crystal")}<b>${bossMemoryCost.toLocaleString()}個</b><span>所持 ${(save.state.player.crystals??0).toLocaleString()}個</span></div>
  <small class="muted">撃破報酬の再選択・階層進行はありません。挑戦開始後の魔晶石は返還されません。</small>
 </div>`,enough?"深淵へ挑む":"魔晶石が足りない"));
 const modal=topModal(),primary=modal.querySelector("[data-modal-primary]");
 if(!enough){primary.disabled=true;return}
 let started=false;
 primary.onclick=()=>{
  if(started)return;started=true;primary.disabled=true;
  if((save.state.player.crystals??0)<bossMemoryCost){showToast("魔晶石が足りません");modal.remove();return}
  save.state.player.crystals-=bossMemoryCost;save.save();modal.remove();
  const encounter={
   speciesId:memory.speciesId,level:memory.level,boss:true,uncapturable:Boolean(memory.uncapturable||memory.endgameBossId||["abyss","tenGod"].includes(memory.faction)),
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
 document.querySelectorAll("[data-home-attribute-help]").forEach(button=>button.addEventListener("click",event=>{event.stopPropagation();openAttributeHelp()}));
 document.getElementById("openMonsters").onclick=()=>go("monsters");
 document.getElementById("openSkills")?.addEventListener("click",()=>{completeContextGuide("skills_open",{quiet:true});skillNavigationOrigin="home";skillTarget=save.state.party[0]??save.state.monsters[0]?.id;skillSlotSelection=0;go("skills")});
 document.getElementById("openBattleMemory")?.addEventListener("click",openBattleMemory);
 document.getElementById("openItemShop")?.addEventListener("click",openHomeItemShop);
 document.getElementById("openTeamBattle")?.addEventListener("click",openTeamBattle);
 document.getElementById("openRest")?.addEventListener("click",openRest);
 document.getElementById("openGacha")?.addEventListener("click",()=>{if(contextGuidePending("starterGacha"))completeContextGuide("starter_gacha_open",{quiet:true});openGacha()});
 document.getElementById("openNoticeCenter")?.addEventListener("click",openNoticeCenter);
 document.getElementById("openOnlineParty")?.addEventListener("click",()=>go("onlineParty"));
 document.getElementById("openEventHub")?.addEventListener("click",openEventHub);
 document.getElementById("openSettings").onclick=()=>go("settings");
 document.getElementById("openExplore").onclick=()=>{completeContextGuide("home_dungeon",{quiet:true});openExploreFloorSelector()};
 document.getElementById("openEquipment").onclick=()=>{completeContextGuide("equipment_open",{quiet:true});equipmentTarget=save.state.party[0]??save.state.monsters[0]?.id;equipmentFocusItemId=null;navigationOrigin="home";go("equipment")};
 bindHomePartyDrag();
}

function bindSkills(){
 document.getElementById("backSkillHome")?.addEventListener("click",()=>{const target=skillNavigationOrigin;skillNavigationOrigin="home";returnFromMenu(target)});
 document.querySelector("[data-open-abyss-skill-tree]")?.addEventListener("click",()=>{completeContextGuide("abyss_tree_open",{quiet:true});go("abyssSkills")});
 document.querySelectorAll("[data-skill-monster]").forEach(button=>button.addEventListener("click",()=>{skillTarget=button.dataset.skillMonster;skillSlotSelection=0;render()}));
 const monster=save.state.monsters.find(m=>m.id===skillTarget);if(!monster)return;
 const describe=skill=>{
  const value=skillEffectSummary(skill," / ");
  const progress=skillProgressFor(monster,skill.id);
  return`${value} / 熟練Lv.${progress.level}${progress.need?`（${Math.floor(progress.exp)}/${progress.need}）`:"・MASTER"} / MP ${effectiveSkillMpCost(monster,skill)} / CT ${skill.cooldown??0}`;
 };
 const persist=(message)=>{completeContextGuide("skills_set",{quiet:true});save.save();showToast(message);render()};
 const openSlotPicker=slot=>{
  const learned=allLearnedSkills(monster),current=monster.equippedSkills?.[slot]??null;
  const category=skill=>{
   if(["allHeal","selfHeal","mpHeal","revive","cleanse"].includes(skill.type))return"recovery";
   if(["guard","defense","barrier","counter"].includes(skill.type)||String(skill.tag??"").includes("防御"))return"defense";
   if(["buff","stance"].includes(skill.type))return"buff";
   return"attack";
  };
  const categoryLabel={attack:"攻撃",recovery:"回復",buff:"強化",defense:"防御"};
  const rows=learned.map(skill=>{const kind=category(skill),progress=skillProgressFor(monster,skill.id),effect=skillEffectSummary(skill," / ");return`<button type="button" class="skill-picker-card ${skill.id===current?"current":""}" data-skill-pick="${skill.id}" data-skill-picker-category="${kind}">
   <span class="skill-picker-check" aria-hidden="true">${skill.id===current?"✓":""}</span>
   <div class="skill-picker-card-head"><small>${categoryLabel[kind]}</small><em>${skillElementLabel(skill)}属性</em><b>${skill.name}</b></div>
   <p>${effect}</p>
   <div class="skill-picker-chips"><span>${skill.target??"敵単体"}</span><span>熟練Lv.${progress.level}${progress.need?` ${Math.floor(progress.exp)}/${progress.need}`:" MASTER"}</span><span>MP ${effectiveSkillMpCost(monster,skill)}</span><span>CT ${skill.cooldown??0}</span></div>
   ${skill.id===current?'<strong>設定中</strong>':""}
  </button>`}).join("");
  app.insertAdjacentHTML("beforeend",Modal(`SLOT ${slot+1}に設定するスキル`,`<div class="skill-slot-picker-v2"><nav class="skill-picker-filters"><button type="button" class="active" data-skill-picker-filter="all">すべて</button><button type="button" data-skill-picker-filter="attack">攻撃</button><button type="button" data-skill-picker-filter="recovery">回復</button><button type="button" data-skill-picker-filter="buff">強化</button><button type="button" data-skill-picker-filter="defense">防御</button></nav>${current?`<button type="button" class="skill-picker-remove-v2" data-skill-remove>スロットを空にする</button>`:""}<div class="skill-picker-card-list">${rows||'<p class="empty">習得済みスキルがありません</p>'}</div></div>`,"閉じる"));
  const modal=topModal();
  modal.classList.add("skill-picker-modal-v2");
  modal.querySelectorAll("[data-skill-picker-filter]").forEach(button=>button.onclick=()=>{modal.querySelectorAll("[data-skill-picker-filter]").forEach(entry=>entry.classList.toggle("active",entry===button));modal.querySelectorAll("[data-skill-picker-category]").forEach(card=>card.hidden=button.dataset.skillPickerFilter!=="all"&&card.dataset.skillPickerCategory!==button.dataset.skillPickerFilter)});
  let choosing=false;
  modal.querySelectorAll("[data-skill-pick]").forEach(button=>button.onclick=()=>{if(choosing)return;choosing=true;if(!equipSkill(monster,button.dataset.skillPick,slot)){choosing=false;return}modal.remove();persist(`SLOT ${slot+1} に装着`)});
  modal.querySelector("[data-skill-remove]")?.addEventListener("click",()=>{monster.equippedSkills=Array.from({length:4},(_,index)=>index===slot?null:(monster.equippedSkills?.[index]??null));monster.skillLoadoutInitialized=true;modal.remove();persist(`SLOT ${slot+1} から外しました`)});
  modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
 };
 const openReservePicker=()=>{
  const reserve=save.state.monsters.filter(entry=>!save.state.party.includes(entry.id));
  const tone=rarity=>({UR:"ur",LR:"lr","神話":"mythic","深淵":"abyss","十神":"ten-god"})[rarity]??"",elements=["all",...new Set(reserve.map(entry=>entry.attribute??SPECIES[entry.speciesId]?.element??"neutral"))],ranks=["all","UR","LR","神話","深淵","十神"];
  const rows=reserve.map(entry=>{const species=SPECIES[entry.speciesId]??{},rarity=entry.endgameFaction==="tenGod"?"十神":entry.endgameFaction==="abyss"?"深淵":entry.summonTier??entry.summonRarity??species.rarity??"N",attribute=entry.attribute??species.element??"neutral",rankTone=tone(rarity),protectedMarks=`${entry.favorite?'<i title="お気に入り">♥</i>':""}${entry.locked?'<i title="ロック">🔒</i>':""}`;return`<button type="button" class="skill-reserve-row-v2 ${rankTone?`rank-${rankTone}`:""}" data-skill-reserve-pick="${entry.id}" data-name="${escapeAttribute(`${displayName(entry)} ${species.name??""} ${species.race??""}`.toLowerCase())}" data-level="${entry.level??1}" data-power="${monsterCombatPower(entry)}" data-rarity="${RARITY_ORDER[rarity]??0}" data-rank-label="${rarity}" data-attribute="${attribute}"><span class="skill-reserve-portrait">${monsterVisual(entry,species.emoji??"👹",{className:"skill-reserve-monster-visual"})}</span><div><span><b>${displayName(entry)}</b>${protectedMarks}</span><small><em class="reserve-rank-badge ${rankTone?`rank-${rankTone}`:""}">${rarity}</em>${attributeVisual(attribute,{label:true})}</small><u>Lv.${entry.level}　戦力 ${formatCombatPower(monsterCombatPower(entry))}</u></div></button>`}).join("");
  app.insertAdjacentHTML("beforeend",Modal("控えから選ぶ",`<div class="skill-reserve-picker-modal v2"><div class="skill-reserve-tools"><input type="search" data-skill-reserve-search placeholder="名前・種族で検索"><div><select data-skill-reserve-sort><option value="power">戦闘力順</option><option value="rarity">レア度順</option><option value="level">レベル順</option></select><select data-skill-reserve-attribute>${elements.map(value=>`<option value="${value}">${value==="all"?"全属性":`${elementLabel(value)}属性`}</option>`).join("")}</select><select data-skill-reserve-rank>${ranks.map(value=>`<option value="${value}">${value==="all"?"全ランク":`${value}以上`}</option>`).join("")}</select></div></div><div data-skill-reserve-list>${rows||'<p class="empty">控えモンスターがいません</p>'}</div></div>`,"閉じる"));
  const modal=topModal(),list=modal.querySelector("[data-skill-reserve-list]"),filter=()=>{
   const query=(modal.querySelector("[data-skill-reserve-search]")?.value??"").trim().toLowerCase(),sort=modal.querySelector("[data-skill-reserve-sort]")?.value??"power",attribute=modal.querySelector("[data-skill-reserve-attribute]")?.value??"all",rank=modal.querySelector("[data-skill-reserve-rank]")?.value??"all",rankMinimum=rank==="all"?0:RARITY_ORDER[rank]??0;
   const entries=[...modal.querySelectorAll("[data-skill-reserve-pick]")];
   entries.sort((a,b)=>Number(b.dataset[sort])-Number(a.dataset[sort])).forEach(entry=>{entry.hidden=(Boolean(query)&&!entry.dataset.name.includes(query))||(attribute!=="all"&&entry.dataset.attribute!==attribute)||(rankMinimum>0&&Number(entry.dataset.rarity)<rankMinimum);list?.appendChild(entry)});
  };
  modal.classList.add("skill-reserve-modal-v2");modal.querySelector("[data-skill-reserve-search]")?.addEventListener("input",filter);modal.querySelectorAll("[data-skill-reserve-sort],[data-skill-reserve-attribute],[data-skill-reserve-rank]").forEach(select=>select.addEventListener("change",filter));filter();
  modal.querySelectorAll("[data-skill-reserve-pick]").forEach(button=>button.onclick=()=>{skillTarget=button.dataset.skillReservePick;skillSlotSelection=0;modal.remove();render()});
  modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
 };
 document.querySelectorAll("[data-skill-slot]").forEach(card=>card.addEventListener("click",()=>openSlotPicker(Number(card.dataset.skillSlot))));
 document.querySelector("[data-open-skill-reserve]")?.addEventListener("click",openReservePicker);
 document.querySelector("[data-skill-recommend]")?.addEventListener("click",()=>{
  const score=skill=>(skill.type==="revive"?600:skill.type==="allHeal"?500:skill.type==="buff"||skill.type==="stance"?380:0)+(skill.power??0)*100+(skill.heal??0)*150-(skill.mp??0)*.1;
  monster.equippedSkills=[...allLearnedSkills(monster)].sort((a,b)=>score(b)-score(a)).slice(0,4).map(skill=>skill.id);
  while(monster.equippedSkills.length<4)monster.equippedSkills.push(null);
  monster.skillLoadoutInitialized=true;
  persist("おすすめスキルを一括設定しました");
 });
 document.querySelector("[data-skill-clear]")?.addEventListener("click",()=>{app.insertAdjacentHTML("beforeend",Modal("全スキル解除",`<div class="skill-clear-confirm"><span>${pixelIcon("skills")}</span><h3>4枠すべてを空にしますか？</h3><p>空欄は保存され、更新しても自動補充されません。再設定は各枠または「おすすめ一括設定」から行えます。</p></div>`,"解除する"));const modal=topModal();modal.classList.add("skill-clear-confirm-modal");modal.querySelector("[data-modal-primary]").onclick=()=>{monster.equippedSkills=[null,null,null,null];monster.skillLoadoutInitialized=true;modal.remove();persist("スキルを全解除しました")}});
}

function bindAbyssSkills(){
 document.getElementById("backAbyssSkillHome")?.addEventListener("click",()=>go("skills"));
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
  completeContextGuide("abyss_tree_learn",{quiet:true});
  normalizeEquipmentState();
  vitals.forEach(([monster,snapshot])=>restoreVitalSnapshot(monster,snapshot));
  save.save();
  showToast(result.circleUnlock&&!result.circleUnlock.already?`${node.name}を習得！ ${result.circleUnlock.circle.name} Lv.1解禁！`:`${node.name}を習得！`);
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
}

const MONSTER_RELEASE_REWARDS={
 N:{gold:60,crystals:1},R:{gold:140,crystals:1},SR:{gold:360,crystals:1},SSR:{gold:900,crystals:1},
 UR:{gold:2400,crystals:1},LR:{gold:6500,crystals:1},"神話":{gold:18000,crystals:1},"深淵":{gold:50000,crystals:1},"十神":{gold:150000,crystals:1}
};
function workshopRarity(monster){return monster.summonTier??monster.summonRarity??SPECIES[monster.speciesId]?.rarity??"N"}
function monsterIdentityKey(monster){return monster?.endgameBossId??monster?.speciesId??null}
function workshopIdentityMeta(identity){const boss=ENDGAME_BOSSES[identity],species=boss?SPECIES[boss.speciesId]:SPECIES[identity];return{boss,species,name:boss?.name??species?.name??"不明",visualId:boss?.id??species?.id,rarity:boss?.faction==="tenGod"?"十神":boss?.faction==="abyss"?"深淵":species?.rarity??"N"}}
function workshopProtected(monster){return save.state.party.includes(monster.id)||monster.favorite||monster.locked}
function workshopMonsterCard(monster,{selected=false,targetCandidate=false,release=false}={}){
 const species=SPECIES[monster.speciesId]??{},rarity=workshopRarity(monster),stats=calculatedStats(monster);
 return`<article class="monster-workshop-card rarity-${rarity} ${selected?"selected":""} ${workshopProtected(monster)?"protected":""}" data-workshop-monster="${monster.id}" ${targetCandidate?'data-workshop-drag-target="1"':""}>
  <span>${monsterVisual(monster,species.emoji??"👹",{className:"monster-workshop-visual"})}</span>
  <div><b>${displayName(monster)}＋${monster.plus??0} <i>Lv.${monster.level}</i></b><small>なつき ❤️${monster.affection??0}</small><small>HP ${stats.hp.toLocaleString()} / ATK ${stats.atk.toLocaleString()} / DEF ${stats.def.toLocaleString()} / SPD ${stats.spd.toLocaleString()}</small></div>
  ${workshopProtected(monster)?'<em>保護中</em>':selected?"<em>選択中</em>":release?"<em>逃す候補</em>":"<em>素材候補</em>"}
 </article>`;
}
function workshopReleaseReward(monster){
 const base=MONSTER_RELEASE_REWARDS[workshopRarity(monster)]??MONSTER_RELEASE_REWARDS.N;
 return{gold:Math.round(base.gold*(1+Math.max(0,(monster.level??1)-1)*.025+Math.max(0,monster.plus??0)*.08)),crystals:base.crystals};
}
function monsterWorkshopBody(){
 const meta=workshopIdentityMeta(monsterWorkshop.speciesId),species=meta.species,owned=save.state.monsters.filter(monster=>monsterIdentityKey(monster)===monsterWorkshop.speciesId);
 if(!species||!owned.length)return'<div class="empty">この魔物は所持していません。</div>';
 let target=owned.find(monster=>monster.id===monsterWorkshop.targetId);
 if(!target){target=[...owned].sort((a,b)=>totalExperience(b)-totalExperience(a)||(b.plus??0)-(a.plus??0))[0];monsterWorkshop.targetId=target.id}
 const selected=owned.filter(monster=>monsterWorkshop.selected.has(monster.id));
 if(monsterWorkshop.tab==="release"){
  const reward=selected.reduce((sum,monster)=>{const value=workshopReleaseReward(monster);sum.gold+=value.gold;sum.crystals+=value.crystals;return sum},{gold:0,crystals:0});
  return`<div class="monster-workshop">
   <div class="monster-workshop-tabs"><button data-workshop-tab="combine">合成</button><button class="active" data-workshop-tab="release">逃す</button></div>
   <div class="workshop-guide"><b>${meta.name}を整理</b><span>タップで複数選択。出撃中・お気に入り・ロック中は保護されます。</span></div>
   <div class="monster-workshop-grid">${owned.map(monster=>workshopMonsterCard(monster,{selected:monsterWorkshop.selected.has(monster.id),release:true})).join("")}</div>
   <div class="workshop-sticky-action workshop-release-action"><div><small>選択 ${selected.length}体の受取報酬</small><b>${reward.gold.toLocaleString()} GOLD</b><strong>魔晶石 ×${reward.crystals.toLocaleString()}</strong></div><button type="button" class="danger" data-workshop-release ${selected.length?"":"disabled"}>選択した魔物を<br>逃す</button></div>
  </div>`;
 }
 const materials=owned.filter(monster=>monster.id!==target.id),transfer=selected.filter(monster=>monster.id!==target.id),plusGain=Math.floor(transfer.length/2),inheritedAffection=Math.max(target.affection??target.bond??0,...transfer.map(monster=>monster.affection??monster.bond??0));
 return`<div class="monster-workshop">
  <div class="monster-workshop-tabs"><button class="active" data-workshop-tab="combine">合成</button><button data-workshop-tab="release">逃す</button></div>
  <div class="workshop-target-wrap"><small>強化するメイン個体</small><div class="workshop-target-slot" data-workshop-target-slot>${workshopMonsterCard(target)}<span>長押しした同名カードをここへ移動</span></div></div>
  <div class="workshop-guide"><b>同名素材 ${materials.length}体</b><span>タップで複数選択 / 長押し移動でメイン個体と交換</span></div>
  <div class="monster-workshop-grid">${materials.map(monster=>workshopMonsterCard(monster,{selected:monsterWorkshop.selected.has(monster.id),targetCandidate:true})).join("")||'<div class="empty">同名素材がありません。</div>'}</div>
  <div class="workshop-sticky-action"><div><small>素材 ${transfer.length}体・2体ごとに限界突破+1</small><b>＋${plusGain} / EXP維持 / なつき ${target.affection??0}→${inheritedAffection}</b></div><button type="button" data-workshop-combine ${transfer.length>=2&&transfer.length%2===0?"":"disabled"}>合成する</button></div>
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
  const target=save.state.monsters.find(monster=>monster.id===monsterWorkshop.targetId),materials=save.state.monsters.filter(monster=>monsterWorkshop.selected.has(monster.id)&&monsterIdentityKey(monster)===monsterWorkshop.speciesId&&monster.id!==target?.id&&!workshopProtected(monster));
  if(!target||materials.length<2||materials.length%2)return showToast("素材は2体単位で選択してください");
  const ids=new Set(materials.map(monster=>monster.id)),plusGain=Math.floor(materials.length/2),inheritedAffection=Math.max(target.affection??target.bond??0,...materials.map(monster=>monster.affection??monster.bond??0));
  materials.forEach(monster=>Object.values(monster.equipment??{}).filter(Boolean).forEach(id=>{const item=save.state.equipment.find(entry=>entry.id===id);if(item)item.equippedBy=null}));
  save.state.monsters=save.state.monsters.filter(monster=>!ids.has(monster.id));target.plus=Math.max(0,target.plus??0)+plusGain;target.affection=Math.min(1000,inheritedAffection);target.bond=target.affection;target.currentHp=Math.min(calculatedStats(target).hp,target.currentHp??calculatedStats(target).hp);target.currentMp=Math.min(maxMp(target),target.currentMp??maxMp(target));
  monsterWorkshop.selected.clear();save.save();showToast(`合成成功！ ＋${plusGain}・レベルとEXPは維持`);refreshMonsterWorkshop(modal);
 });
 modal.querySelector("[data-workshop-release]")?.addEventListener("click",()=>{
  const targets=save.state.monsters.filter(monster=>monsterWorkshop.selected.has(monster.id)&&monsterIdentityKey(monster)===monsterWorkshop.speciesId&&!workshopProtected(monster));
  if(!targets.length)return;if(save.state.monsters.length-targets.length<1)return showToast("最後の1体は逃せません");
  const reward=targets.reduce((sum,monster)=>{const value=workshopReleaseReward(monster);sum.gold+=value.gold;sum.crystals+=value.crystals;return sum},{gold:0,crystals:0}),ids=new Set(targets.map(monster=>monster.id));
  targets.forEach(monster=>Object.values(monster.equipment??{}).filter(Boolean).forEach(id=>{const item=save.state.equipment.find(entry=>entry.id===id);if(item)item.equippedBy=null}));
  save.state.monsters=save.state.monsters.filter(monster=>!ids.has(monster.id));save.state.player.gold+=reward.gold;save.state.player.crystals+=reward.crystals;monsterWorkshop.selected.clear();save.save();showToast(`${targets.length}体を逃し、${reward.gold.toLocaleString()}G・魔晶石${reward.crystals}個を獲得`);
  if(!save.state.monsters.some(monster=>monsterIdentityKey(monster)===monsterWorkshop.speciesId)){modal.remove();render()}else refreshMonsterWorkshop(modal);
 });
}
function openMonsterWorkshop(speciesId){
 const meta=workshopIdentityMeta(speciesId);if(!meta.species||!save.state.monsters.some(monster=>monsterIdentityKey(monster)===speciesId))return;
 const ordinary=orderedMonsterSpecies(SPECIES),bossIndex=Object.keys(ENDGAME_BOSSES).indexOf(speciesId),index=bossIndex>=0?ordinary.length+bossIndex:Math.max(0,ordinary.findIndex(entry=>entry.id===speciesId));
 monsterWorkshop={speciesId,tab:"combine",targetId:null,selected:new Set()};app.insertAdjacentHTML("beforeend",Modal(`No.${String(index+1).padStart(3,"0")} ${meta.name}`,monsterWorkshopBody(),"閉じる"));
 const modal=topModal();modal.classList.add("monster-workshop-modal");modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();render()};refreshMonsterWorkshop(modal);
}
function bulkSynthesizeMonsters(maxRarity="SSR"){
 const order={N:1,R:2,SR:3,SSR:4,UR:5,LR:6,"神話":7,"深淵":8,"十神":9},limit=order[maxRarity]??4,partyIds=new Set(save.state.party??[]),removeIds=new Set();let pairs=0,speciesCount=0;
 const groups=new Map();for(const monster of save.state.monsters??[]){const key=monsterIdentityKey(monster),list=groups.get(key)??[];list.push(monster);groups.set(key,list)}
 for(const group of groups.values()){
  if(group.length<3)continue;
  const ranked=[...group].sort((a,b)=>(b.level??1)-(a.level??1)||(b.plus??0)-(a.plus??0)||(b.affection??0)-(a.affection??0)),target=ranked[0];
  const materials=ranked.filter(monster=>monster.id!==target.id&&!partyIds.has(monster.id)&&!monster.favorite&&!monster.locked&&(order[monsterVisibleRarity(monster)]??1)<=limit),usable=materials.slice(0,Math.floor(materials.length/2)*2);
  if(!usable.length)continue;speciesCount++;pairs+=usable.length/2;target.plus=Math.max(0,target.plus??0)+usable.length/2;target.affection=Math.min(1000,Math.max(target.affection??target.bond??0,...usable.map(monster=>monster.affection??monster.bond??0)));target.bond=target.affection;
  usable.forEach(monster=>{removeIds.add(monster.id);Object.values(monster.equipment??{}).filter(Boolean).forEach(id=>{const item=save.state.equipment.find(entry=>entry.id===id);if(item)item.equippedBy=null})});
  target.currentHp=Math.min(calculatedStats(target).hp,target.currentHp??calculatedStats(target).hp);target.currentMp=Math.min(maxMp(target),target.currentMp??maxMp(target));
 }
 if(!removeIds.size)return{ok:false,message:`${maxRarity}以下で合成できる同名素材がありません。`};
 save.state.monsters=save.state.monsters.filter(monster=>!removeIds.has(monster.id));save.save();return{ok:true,message:`${speciesCount}種・${removeIds.size}体を素材にして、＋を合計${pairs}上げました。`};
}
function bindList(){
 document.getElementById("backHome")?.addEventListener("click",()=>go("home"));
 const input=document.getElementById("monsterSearch"),applySearch=()=>{const query=(input?.value??"").trim().toLowerCase();monsterListState.search=input?.value??"";document.querySelectorAll(".monster-species-card").forEach(card=>card.hidden=Boolean(query&&!card.dataset.speciesSearch.includes(query)))};
 input?.addEventListener("input",applySearch);applySearch();
 document.querySelectorAll("[data-monster-species]").forEach(card=>card.addEventListener("click",()=>openMonsterWorkshop(card.dataset.monsterSpecies)));
 document.getElementById("bulkSynthesizeMonsters")?.addEventListener("click",()=>{const rarity=document.getElementById("bulkSynthesisRarity")?.value??"SSR";if(!confirm(`${rarity}以下の保護されていない同名素材を一括合成しますか？\n各種族の最良個体・編成中・お気に入り・ロック個体は残ります。`))return;const result=bulkSynthesizeMonsters(rarity);showToast(result.message);if(result.ok)render()});
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
async function requestGameMasterReset(rawCode=""){
 let code=rawCode;
 if(!code)code=globalThis.prompt?.("GM RESET専用コードを入力してください。")??"";
 const validation=await validateGameMasterCode(save.state,code);
 if(!validation.ok)return showToast(validation.message);
 if(validation.kind!=="reset")return showToast("このコードはRESET専用コードではありません。");
 const literal=globalThis.prompt?.("全セーブを初期化します。確認のため RESET と入力してください。")??"";
 if(String(literal).trim().toUpperCase()!=="RESET")return showToast("RESETの入力が一致しないため中止しました。");
 if(!globalThis.confirm?.("最終確認：この端末のABYSS DOMINIONセーブを完全に初期化します。元に戻せません。実行しますか？"))return showToast("初期化を中止しました。");
 save.reset();snapshot=null;showToast("セーブを初期化しました");go("home");
}
async function redeemSettingsGameMasterCode(event){
 event?.preventDefault();
 const input=document.getElementById("gameMasterCodeInput"),button=document.getElementById("redeemGameMasterCode");if(!input||!button)return;
 button.disabled=true;const oldText=button.textContent;button.textContent="認証中…";
 const validation=await validateGameMasterCode(save.state,input.value);
 if(!validation.ok){button.disabled=false;button.textContent=oldText;return showToast(validation.message)}
 if(validation.kind==="reset"){button.disabled=false;button.textContent=oldText;return requestGameMasterReset(input.value)}
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state));
 const result=applyGameMasterReward(save.state);
 if(!result.ok||!save.save()){save.state=backup;button.disabled=false;button.textContent=oldText;return showToast(result.message??"保存できなかったため、GM支援を取り消しました")}
 normalizeEquipmentState();input.value="";
 app.insertAdjacentHTML("beforeend",Modal("GM支援パック認証完了",`<div class="serial-reward-result"><div>🛠️</div><p><b>${result.message}</b></p><small>出発階層の解放は最高到達階・実績・クリア状態を変更しません。</small></div>`,`確認`));
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
 document.getElementById("gameMasterCodeForm")?.addEventListener("submit",redeemSettingsGameMasterCode);
 document.getElementById("resetSave").onclick=()=>requestGameMasterReset();
}


function equipmentAffixCraftingBody(item){
 const affixes=normalizeEquipmentAffixLocks(item),locked=lockedAffixCount(item),maximum=maxLockableAffixes(item),cost=rerollGoldCost(save.state,item),gold=Math.max(0,Number(save.state.player.gold)||0),targetCount=affixes.length||initialAffixCount(item),rerollCount=Math.max(1,targetCount-locked),rarity=equipmentDisplayRarity(item);
 const rows=affixes.length?affixes.map((affix,index)=>{
  const quality=affixQuality(affix),fixed=affix.locked,definition=affixDefinition(affix.id),disabled=!fixed&&locked>=maximum;
  return`<article class="affix-forge-slot ${fixed?"is-fixed":""}" style="--affix-quality:${quality.color}"><span class="affix-forge-index">${String(index+1).padStart(2,"0")}</span><i class="affix-forge-rune" aria-hidden="true"></i><div><small>${quality.name.toUpperCase()} SLOT${definition?.legendaryOnly?"・固有":""}</small><b>${formatAffix(affix)}</b><em>${fixed?"固定済み・再抽選から保護":"未固定・再抽選対象"}</em></div><button type="button" class="affix-lock-toggle ${fixed?"locked":""}" data-affix-lock-index="${index}" ${disabled?"disabled":""}><i aria-hidden="true"></i><span>${fixed?"固定解除":"枠を固定"}</span></button></article>`
 }).join(""):Array.from({length:targetCount},(_,index)=>`<article class="affix-forge-slot is-empty"><span class="affix-forge-index">${String(index+1).padStart(2,"0")}</span><i class="affix-forge-rune" aria-hidden="true"></i><div><small>EMPTY SLOT</small><b>未鑑定</b><em>初回抽選で効果を付与</em></div><span class="affix-forge-pending">待機</span></article>`).join("");
 const sockets=Array.from({length:targetCount},(_,index)=>`<i class="${index<affixes.length?"filled":"empty"}"></i>`).join("");
 return`<div class="affix-forge-content">
  <section class="affix-forge-equipment"><div class="affix-forge-art"><i aria-hidden="true"></i>${equipmentVisual(item,{className:"affix-forge-equipment-art"})}</div><div><small>${rarity}・${slotLabel(item.slot)}・Lv.${Math.max(1,Number(item.level)||1)} ∞</small><h3>${item.name}${item.plus?` +${item.plus}`:""}</h3><div class="affix-forge-sockets" aria-label="スロット ${affixes.length}/${targetCount}">${sockets}</div><p>${affixes.length?`${rerollCount}枠が再抽選対象です。固定した能力はそのまま残ります。`:`旧装備を含む空スロット装備です。初回抽選で${targetCount}枠すべてに能力を付与します。`}</p></div></section>
  <section class="affix-forge-ledger" aria-label="厳選費用"><article><img src="assets/ui/items/gold.png?v=2.11.2-build166" alt=""><span><small>所持GOLD</small><b>${gold.toLocaleString()}G</b></span></article><article class="${gold<cost?"insufficient":""}"><i>${pixelIcon("summon")}</i><span><small>${affixes.length?"再抽選費用":"初回抽選費用"}</small><b>${cost.toLocaleString()}G</b></span></article><article><i>${pixelIcon("key")}</i><span><small>固定枠</small><b>${locked}/${maximum}</b></span></article></section>
  <section class="affix-forge-slots"><header><div><small>OPTION SOCKETS</small><b>能力スロット</b></div><span>${affixes.length?`${rerollCount}枠を更新`:`${targetCount}枠を新規生成`}</span></header><div>${rows}</div></section>
  <p class="affix-forge-guide">固定・解除は無料。固定数が増えるほど必要GOLDが上昇します。魔晶石や専用アイテムは消費しません。</p>
  ${gold<cost?`<p class="affix-forge-warning">GOLD不足・あと ${(cost-gold).toLocaleString()}G 必要</p>`:""}
  <footer class="affix-forge-footer"><div><small>EXECUTION COST</small><b>${cost.toLocaleString()}G</b></div><button type="button" data-affix-reroll ${gold<cost?'disabled aria-disabled="true"':""}><i>${pixelIcon("summon")}</i><span><b>${affixes.length?`${rerollCount}枠を再抽選`:`${targetCount}枠を初回抽選`}</b><small>${gold<cost?"GOLDが不足しています":"タップして厳選を実行"}</small></span></button></footer>
 </div>`
}
function equipmentAffixCraftingModal(item){
 const rarity=equipmentDisplayRarity(item),color=equipmentRarityColor(rarity)??"#d6b767";
 return`<div class="game-modal equipment-affix-forge-modal" role="dialog" aria-modal="true" aria-labelledby="equipmentAffixForgeTitle"><section class="equipment-affix-forge" style="--forge-rarity:${color}"><header class="affix-forge-header"><div><small>ABYSS BLACKSMITH・GOLD CRAFT</small><h2 id="equipmentAffixForgeTitle">装備スロット厳選</h2></div><button type="button" data-modal-dismiss aria-label="厳選画面を閉じる">×</button></header>${equipmentAffixCraftingBody(item)}</section></div>`;
}
function openEquipmentAffixHelp(){
 const qualities=Object.values(AFFIX_QUALITY).map(quality=>`<p class="affix-quality-row"><b style="color:${quality.color}">${quality.name}</b><span>同じ効果でも数値品質が変化</span></p>`).join("");
 app.insertAdjacentHTML("beforeend",Modal("ランダムオプションと厳選",`<div class="affix-help">${qualities}<small>「GOLD厳選」では未固定のオプションを別種類へ再抽選します。📌固定は無料で最大3枠ですが、必ず1枠以上を再抽選対象に残します。固定数が増えるほど必要GOLDも上昇します。〈固有〉はSSR以上に出現します。</small></div>`,"閉じる"));
 topModalButton().onclick=closeTopModal;
}
function openEquipmentAffixCrafting(itemId){
 const item=save.state.equipment.find(entry=>entry.id===itemId);
 if(!item)return showToast("装備が見つかりません");
 app.insertAdjacentHTML("beforeend",equipmentAffixCraftingModal(item));
 const modal=topModal(),primary=modal.querySelector("[data-affix-reroll]");
 modal._onDismiss=()=>{modal.remove();render()};
 modal.querySelectorAll("[data-affix-lock-index]").forEach(button=>button.onclick=()=>{
  const result=toggleAffixLock(item,Number(button.dataset.affixLockIndex));
  if(!result.ok){showToast(result.message);return}
  save.save();modal.remove();openEquipmentAffixCrafting(itemId);
 });
 primary?.addEventListener("click",()=>{
  const owner=item.equippedBy?save.state.monsters.find(monster=>monster.id===item.equippedBy):null,vital=owner?captureVitalSnapshot(owner):null;
  const result=rerollUnlockedAffixes(save.state,item);
  if(!result.ok){showToast(result.message);return}
  normalizeEquipmentState();
  if(owner&&vital)restoreVitalSnapshot(owner,vital);
  save.save();modal._onDismiss=null;modal.remove();render();showToast(`${result.rerolledCount}枠を${result.initialized?"初回抽選":"再抽選"}・${result.cost.toLocaleString()}G消費`);openEquipmentAffixCrafting(itemId);
 });
}
function openEquipmentSlotPicker(subslot){
 const target=save.state.monsters.find(monster=>monster.id===equipmentTarget);if(!target)return;
 const currentId=target.equipment?.[subslot]??null;
 const candidates=save.state.equipment.filter(item=>canEquipInSubslot(item,target,subslot)&&(!item.equippedBy||item.equippedBy===target.id)).sort((a,b)=>Number(signatureEquipmentMatchesMonster(b,target))-Number(signatureEquipmentMatchesMonster(a,target))||(RARITY_ORDER[equipmentDisplayRarity(b)]??0)-(RARITY_ORDER[equipmentDisplayRarity(a)]??0)||equipmentPower(b)-equipmentPower(a));
 const rows=candidates.map(item=>{
  const rarity=equipmentDisplayRarity(item),stats=Object.entries(item.stats??{}).map(([key,value])=>`${equipmentStatLabel(key)}+${Math.round(value*equipmentStatMultiplier(item))}`).join(" / "),filled=Math.min(4,item.affixes?.length??0),diamonds=Array.from({length:4},(_,index)=>index<filled?"◆":"◇").join("");
  const owner=signatureEquipmentOwnerName(item);return`<button type="button" class="equipment-slot-picker-row rarity-${rarityCssClass(rarity)} ${item.id===currentId?"current":""}" data-equipment-picker-item="${item.id}"><span class="equipment-picker-visual">${equipmentVisual(item,{className:"equipment-picker-art"})}</span><div><small>${rarity}・Lv.${item.level??1}${owner?`・${owner}専用`:""}</small><b>${item.name}</b><span>${stats||"能力補正なし"}</span><em>${diamonds}</em></div><strong>${item.id===currentId?"装備中":"装備"}</strong></button>`;
 }).join("");
 app.insertAdjacentHTML("beforeend",Modal(`${equipmentSubslotLabel(subslot)}を選択`,`<div class="equipment-slot-picker"><p class="muted">装備可能な所持品だけを表示しています。</p>${rows||'<p class="empty">装備できる所持品がありません。</p>'}<button type="button" class="equipment-picker-armory" data-open-armory>武器庫で確認する</button></div>`,"閉じる"));
 const modal=topModal();
 bindBackdropTapClose(modal,()=>modal.remove());
 modal.querySelectorAll("[data-equipment-picker-item]").forEach(button=>button.onclick=()=>{if(button.dataset.equipmentPickerItem===currentId){modal.remove();return}modal.remove();equipItem(button.dataset.equipmentPickerItem,target.id,subslot)});
 modal.querySelector("[data-open-armory]")?.addEventListener("click",()=>{modal.remove();inventoryNavigationOrigin="equipment";inventoryCategory=subslot.startsWith("weapon")?"weapon":subslot.startsWith("armor")?"armor":"accessory";inventorySort="rarity";go("armory")});
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function bindEquipment(){
 const focusedItemId=equipmentFocusItemId;
 document.getElementById("backEquipmentHome").onclick=()=>{const target=navigationOrigin;navigationOrigin="home";equipmentFocusItemId=null;returnFromMenu(target)};
 document.getElementById("openAffixHelp")?.addEventListener("click",openEquipmentAffixHelp);
 document.querySelector("[data-open-magic-circle]")?.addEventListener("click",event=>openMagicCircleWorkshop(event.currentTarget.dataset.openMagicCircle));
 document.querySelector("[data-affection-info]")?.addEventListener("click",event=>{
  const monster=save.state.monsters.find(entry=>entry.id===event.currentTarget.dataset.affectionInfo);if(!monster)return;
  const affection=Math.max(0,Math.min(1000,monster.affection??monster.bond??0)),bonus=affectionBonuses(affection),pct=value=>`${Math.round((Number(value)||0)*100)}%`,next=affection>=1000?null:Math.min(1000,(Math.floor(affection/100)+1)*100);
  app.insertAdjacentHTML("beforeend",Modal("なつき度ボーナス",`<div class="affection-bonus-quick"><strong>${displayName(monster)}　${affection}/1000</strong><div><span>HP <b>+${pct(bonus.hp)}</b></span><span>ATK <b>+${pct(bonus.atk)}</b></span><span>DEF <b>+${pct(bonus.def)}</b></span><span>SPD <b>+${pct(bonus.spd)}</b></span></div><small>${next?`次のボーナスまで あと${next-affection}`:"全段階解放・親友ボーナス適用中"}</small></div>`,"閉じる"));topModalButton().onclick=closeTopModal;
 });
 document.querySelectorAll("[data-equipment-target]").forEach(b=>b.onclick=()=>{equipmentFocusItemId=null;equipmentTarget=b.dataset.equipmentTarget;render()});
 document.getElementById("equipmentSort")?.addEventListener("change",e=>{save.state.settings.equipmentSort=e.target.value;save.save();render()});
 document.querySelectorAll("[data-equipment-slot]").forEach(b=>b.onclick=()=>{save.state.settings.equipmentSlot=b.dataset.equipmentSlot;save.save();render()});
 document.querySelectorAll("[data-equipment-storage]").forEach(b=>b.onclick=()=>{if(b.disabled)return;save.state.settings.equipmentStorage=b.dataset.equipmentStorage;if(b.dataset.equipmentStorage!=="inventory"){equipmentManage.editing=false;equipmentManage.selected.clear()}save.save();render()});
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
 const equipmentScreen=document.querySelector(".equipment-screen-v2");if(equipmentScreen){let outsideStart=null;equipmentScreen.addEventListener("pointerdown",event=>{outsideStart={x:event.clientX,y:event.clientY}},{passive:true});equipmentScreen.addEventListener("pointerup",event=>{if(!outsideStart)return;const moved=Math.hypot(event.clientX-outsideStart.x,event.clientY-outsideStart.y),inside=event.target.closest(".equipped-slot-card");outsideStart=null;if(moved>CAMERA_DRAG_THRESHOLD_PX||inside)return;document.querySelectorAll(".equipment-screen-v2 .equipped-slot-card[open]").forEach(detail=>detail.removeAttribute("open"))},{passive:true})}
 if(focusedItemId)requestAnimationFrame(()=>{
  const card=[...document.querySelectorAll("[data-equipment-card-id]")].find(entry=>entry.dataset.equipmentCardId===focusedItemId)
   ??[...document.querySelectorAll("[data-equipped-item]")].find(entry=>entry.dataset.equippedItem===focusedItemId);
  card?.scrollIntoView({behavior:"smooth",block:"center"});
  equipmentFocusItemId=null;
 });
}

function magicCircleWorkshopBody(monster){
 const current=equippedMagicCircle(monster,save.state),gold=Math.max(0,Number(save.state.player.gold)||0);
 return`<div class="magic-circle-workshop"><header>${magicCircleMarkup(monster,save.state,{className:"workshop-circle"})}<div><small>装着中</small><h3>${current.name}${current.level?` Lv.${current.level}`:""}</h3><p>${current.summary}</p><strong>所持 ${gold.toLocaleString()}G</strong></div></header><div class="magic-circle-list">${MAGIC_CIRCLES.map(circle=>{
  const level=magicCircleLevel(save.state,circle.id),owned=circle.id==="none"||level>0,price=magicCirclePrice(save.state,circle.id),equipped=current.id===circle.id,owner=magicCircleOwner(save.state,circle.id,{excludeMonsterId:monster.id}),inUse=Boolean(owner);
  return`<article class="magic-circle-row tone-${circle.tone} ${equipped?"equipped":""} ${inUse?"in-use":""} ${owned?"owned":"locked"}"><span class="magic-circle-list-art"><img src="${circle.asset}" alt=""></span><div><b>${circle.name}${level?` Lv.${level}`:""}</b><small>${circle.summary}</small><em>${circle.id==="none"?"いつでも選択可能":inUse?`${displayName(owner)}が装着中`:owned?magicCircleNextEffect(circle,level):"深淵ツリーで解禁"}</em>${owned&&circle.id!=="none"?`<strong>次の強化 ${price.toLocaleString()}G</strong>`:""}</div><div><button type="button" data-circle-equip="${circle.id}" ${equipped||inUse?"disabled":""}>${equipped?"装着中":inUse?"使用中":"装着"}</button>${circle.id!=="none"&&owned?`<button type="button" data-circle-buy="${circle.id}" ${gold<price?"disabled":""}>GOLD強化</button>`:""}</div></article>`
 }).join("")}</div><p class="muted">魔法陣は1個につき1人だけ装着できます。別の仲間が使用中の魔法陣は、その仲間から外すまで選べません。</p></div>`;
}
function openMagicCircleWorkshop(monsterId){
 const monster=save.state.monsters.find(entry=>entry.id===monsterId);if(!monster)return;
 app.insertAdjacentHTML("beforeend",Modal("魔法陣",magicCircleWorkshopBody(monster),"閉じる"));const modal=topModal();modal.classList.add("magic-circle-modal");
 modal.querySelectorAll("[data-circle-buy]").forEach(button=>button.onclick=()=>{const result=buyOrUpgradeMagicCircle(save.state,button.dataset.circleBuy);if(!result.ok)return showToast(result.message);save.save();modal.remove();showToast(`${result.circle.name} Lv.${result.level}`);openMagicCircleWorkshop(monsterId)});
 modal.querySelectorAll("[data-circle-equip]").forEach(button=>button.onclick=()=>{const result=equipMagicCircle(save.state,monster,button.dataset.circleEquip);if(!result.ok)return showToast(result.message);save.save();modal.remove();render();showToast(`${result.circle.name}を装着`);openMagicCircleWorkshop(monsterId)});
 modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();render()};
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
 experienceItems:["📘","経験値パック（小）","対象の現在Lvを基準に、N標準で約1Lv分のEXP。"],
 experienceItemsMedium:["📗","経験値パック（中）","300階到達で解禁。N標準で約3Lv分のEXP。"],
 experienceItemsLarge:["📙","経験値パック（大）","750階到達で解禁。N標準で約6Lv分のEXP。"],
 experienceItemsUltra:["📕","経験値パック（超）","1000階到達で解禁。N標準で最大約10Lv分のEXP。"],
 captureCrystals:["🔮","捕獲結晶","捕獲1回につき1個消費します。"],
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
 return`<div class="inventory-context-copy"><b style="color:${equipmentRarityColor(item)}">[${rarity}] ${item.name}</b><span>装備Lv.${item.level??1}${item.plus?`・+${item.plus}`:""} / 必要モンスターLv.${equipmentRequiredMonsterLevel(item)} / ${slotLabel(item.slot)}</span><p>${stats}</p><div>${affixes}</div></div><div class="inventory-context-actions"><button data-context-equip="${item.id}">${item.equippedBy?"移動・外す":"装備"}</button><button data-context-enhance="${item.id}">強化</button><button data-context-affix="${item.id}" ${(item.affixes??[]).length?"":"disabled"}>厳選</button><button data-context-lock="${item.id}">${item.locked?"ロック解除":"ロック"}</button><button class="danger" data-context-sell="${item.id}" ${item.equippedBy||item.locked||item.ruleOverrides?.unsellable?"disabled":""}>売却</button></div>`;
}
const INLINE_EQUIPMENT_SLOT_LABELS={weaponRight:"右手",weaponLeft:"左手",armorBody:"胴",armorSupport:"胴",accessoryNeck:"アクセ",accessoryFinger:"アクセ"};
function openInventoryEquipPicker(item){
 closeInventoryContext();
 const party=save.state.party.map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean);
 const rows=party.map(monster=>`<article class="inventory-equip-target"><div><b>${displayName(monster)}</b><small>Lv.${monster.level}</small></div><div>${compatibleSubslots(item).map(subslot=>{const required=Math.max(SLOT_UNLOCK_LEVEL[subslot]??1,equipmentRequiredMonsterLevel(item)),allowed=canEquipInSubslot(item,monster,subslot);return`<button type="button" data-inline-equip="${item.id}" data-inline-target="${monster.id}" data-inline-subslot="${subslot}" ${allowed?"":"disabled"}>${INLINE_EQUIPMENT_SLOT_LABELS[subslot]??equipmentSubslotLabel(subslot)}${allowed?"":` 必要Lv.${required}`}</button>`}).join("")}</div></article>`).join("");
 const remove=item.equippedBy?`<button type="button" class="danger inventory-inline-unequip" data-inline-unequip="${item.id}">現在の装備先から外す</button>`:"";
 app.insertAdjacentHTML("beforeend",Modal("装備先を選択",`<div class="inventory-inline-equip"><p>この画面のまま装備先を変更できます。</p>${rows||'<div class="empty">パーティーに魔物がいません。</div>'}${remove}</div>`,"戻る"));
 const modal=topModal();
 modal.querySelectorAll("[data-inline-equip]").forEach(button=>button.onclick=()=>equipItem(button.dataset.inlineEquip,button.dataset.inlineTarget,button.dataset.inlineSubslot));
 modal.querySelector("[data-inline-unequip]")?.addEventListener("click",()=>unequipItem(item.id));
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function inventoryStackContext(id){
 const [icon,name,description]=INVENTORY_STACK_INFO[id]??["◆",id,"所持アイテム"],amount=save.state.inventory?.[id]??0,price=INVENTORY_SELL_PRICE[id]??0;
 const usable=price>0||Object.values(EXPERIENCE_PACK_TYPES).some(type=>type.inventoryKey===id);
 return`<div class="inventory-context-copy"><b>${icon} ${name}</b><span>所持 ${amount.toLocaleString()}個</span><p>${description}</p></div><div class="inventory-context-actions">${usable?`<button data-context-use="${id}" ${amount<=0?"disabled":""}>使用する</button>${price?`<button class="danger" data-context-stack-sell="${id}" ${amount<=0?"disabled":""}>売却 ${price}G</button>`:""}`:'<button disabled>大切な素材</button>'}</div>`;
}
function openInventoryContext(anchor,body){
 closeInventoryContext();anchor.classList.add("context-open");
 const popover=document.createElement("aside");popover.className="inventory-context-popover";popover.innerHTML=body;document.body.appendChild(popover);positionInventoryContext(popover,anchor);
 const dismiss=event=>{if(popover.contains(event.target)||anchor.contains(event.target))return;closeInventoryContext();document.removeEventListener("pointerdown",dismiss,true)};
 requestAnimationFrame(()=>document.addEventListener("pointerdown",dismiss,true));
 return popover;
}
function openExperiencePackTarget(tier="small"){
 const type=experiencePackType(tier),owned=itemCount(type.inventoryKey),party=save.state.party.map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean);
 if(!party.length)return alert("先に部隊へ仲間を編成してください");
 const cards=party.map(monster=>{
  const species=SPECIES[monster.speciesId]??{},stats=calculatedStats(monster),hp=monster.currentHp??stats.hp,dead=hp<=0,need=Math.max(1,expNeedFor(monster)),current=Math.max(0,Number(monster.exp)||0),progress=Math.max(0,Math.min(100,current/need*100)),plan=previewExperiencePacks(monster,1,owned,type.id),capacity=experiencePackCapacity(monster,owned);
  return`<button type="button" class="experience-pack-target ${dead?"is-defeated":""}" data-experience-target="${escapeAttribute(monster.id)}" ${capacity?"":"disabled"}>
   <span class="experience-pack-target-art">${monsterVisual(monster,species.emoji??"👹",{frame:dead?"down":"idle",className:"experience-pack-target-monster"})}</span>
   <span class="experience-pack-target-copy"><small>${dead?"戦闘不能・使用可能":"育成対象"}</small><b>${escapeAttribute(displayName(monster))} <em>Lv.${monster.level.toLocaleString()}</em></b><span>EXP ${current.toLocaleString()} / ${need.toLocaleString()}</span><i style="--exp-target-progress:${progress}%"><u></u></i></span>
   <span class="experience-pack-target-result"><small>1個使用</small><b>${plan.gain?`＋${plan.gain.toLocaleString()} EXP`:"上限到達"}</b><em>${plan.levelAfter>plan.levelBefore?`Lv.${plan.levelBefore.toLocaleString()} → ${plan.levelAfter.toLocaleString()}`:"選択"}</em></span>
  </button>`;
 }).join("");
 closeInventoryContext();app.insertAdjacentHTML("beforeend",Modal(`${type.name}・使用対象`,`<section class="experience-pack-target-panel"><header><span>${type.icon}</span><div><small>EXPERIENCE ARCHIVE・${type.shortName}</small><b>倒れている仲間にも使用できます</b><p>N標準で約${type.levelSpan}Lv分。経験値だけを付与し、戦闘不能は解除されません。</p></div><strong>所持 ${owned.toLocaleString()}個</strong></header><div class="experience-pack-target-grid">${cards}</div></section>`,"やめる"));
 const modal=topModal();modal.classList.add("experience-pack-target-modal");modal.querySelectorAll("[data-experience-target]").forEach(button=>button.onclick=()=>{const target=save.state.monsters.find(monster=>monster.id===button.dataset.experienceTarget);if(!target)return;modal.remove();openExperiencePackQuantity(target,type.id)});modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
}
function openInventoryUseTarget(type){
 if((save.state.inventory?.[type]??0)<=0)return showToast("所持していません");
 const pack=Object.values(EXPERIENCE_PACK_TYPES).find(entry=>entry.inventoryKey===type);if(pack)return openExperiencePackTarget(pack.id);
 const single=["potions","highPotions","manaPotions","highManaPotions","fullManaPotions","reviveLeaves","statusCures","fullHeals","experienceItems"].includes(type);
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
 document.querySelectorAll("[data-open-fragment-altar],[data-endgame-fragment]").forEach(button=>button.addEventListener("click",event=>{event.stopPropagation();openEndgameForge()}));
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
 const rows=reserve.map(monster=>{const species=SPECIES[monster.speciesId]??{},stats=calculatedStats(monster),power=monsterCombatPower(monster),attribute=monster.attribute??species.element??"neutral",searchText=escapeAttribute(`${displayName(monster)} ${species.name??""} ${species.race??""}`.toLowerCase());return`<button class="formation-picker-row" data-formation-pick="${monster.id}" data-search="${searchText}" data-formation-attribute="${attribute}"><span>${monsterVisual(monster,species.emoji??"👹",{className:"formation-picker-monster-visual"})}${attributeVisual(attribute,{label:`${elementLabel(attribute)}属性`})}</span><div><b>${displayName(monster)}</b><small>${monsterVisibleRarity(monster)}・${elementLabel(attribute)}・Lv.${monster.level}・+${monster.plus??0}</small><em>累計EXP ${totalExperience(monster).toLocaleString()} / HP ${stats.hp} / ATK ${stats.atk} / DEF ${stats.def} / SPD ${stats.spd}</em></div><strong><b>戦力 ${formatCombatPower(power)}</b><small>${replacingId?"交代":"編成"}</small></strong></button>`}).join("");
 return`<div class="formation-picker">
  <input id="formationPickerSearch" value="${escapeAttribute(formationPickerState.search)}" placeholder="名前・種族で検索">
  <nav class="formation-attribute-filter"><button type="button" data-formation-attribute-filter="all" class="${formationPickerState.attribute==="all"?"active":""}">すべて</button>${Object.entries(ATTRIBUTES).filter(([id])=>id!=="thunder").map(([id,attribute])=>`<button type="button" data-formation-attribute-filter="${id}" class="${formationPickerState.attribute===id?"active":""}">${attributeVisual(id,{label:`${attribute.name}属性`})}<span>${attribute.name}</span></button>`).join("")}</nav>
  <div class="formation-picker-sort"><select id="formationPickerSort">
   <option value="power" ${formationPickerState.sort==="power"?"selected":""}>戦闘力順</option><option value="rarity" ${formationPickerState.sort==="rarity"?"selected":""}>レア度順</option><option value="level" ${formationPickerState.sort==="level"?"selected":""}>レベル順</option>
   <option value="affection" ${formationPickerState.sort==="affection"?"selected":""}>なつき度順</option><option value="experience" ${formationPickerState.sort==="experience"?"selected":""}>累計EXP順</option><option value="obtained" ${formationPickerState.sort==="obtained"?"selected":""}>入手順</option><option value="name" ${formationPickerState.sort==="name"?"selected":""}>名前順</option>
  </select><button type="button" id="formationPickerDirection">${formationPickerState.direction==="desc"?"降順 ↓":"昇順 ↑"}</button></div>
  <div class="formation-picker-list">${rows||'<div class="empty">控えモンスターがいません</div>'}<div class="empty formation-filter-empty" hidden>条件に合う魔物がいません</div></div>
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
  <section><b>装備を引き継ぐ</b><p>${gearCount?`${gearCount}個の装備をそのまま移動します。`:"引き継ぐ装備はありません。"}</p><small>限界突破＋・なつき度・個別スキルは各個体のままです。</small></section>
  <button type="button" class="formation-plain-replace" data-formation-plain-replace>引き継がず、そのまま交代</button>
 </div>`,"EXP・装備を引き継いで交代"));
 const modal=topModal(),finish=inherit=>{
  if(!replacePartyMember(outgoingId,incomingId,inherit))return showToast("交代できませんでした");
  if(contextGuidePending("partyAdd"))completePartyAddGuide();
  modal.remove();render();showToast(inherit?"累計EXPと装備を引き継ぎました":"メンバーを交代しました");
 };
 modal.querySelector("[data-modal-primary]").onclick=()=>finish(true);
 modal.querySelector("[data-formation-plain-replace]").onclick=()=>finish(false);
}
function openFormationPicker(replacingId=null){
 if(!replacingId&&save.state.party.length>=4)return showToast("編成は4体まで");
 app.insertAdjacentHTML("beforeend",Modal(replacingId?"交代するモンスターを選択":"＋ モンスターを編成",formationPickerBody(replacingId),"閉じる"));
 const modal=topModal();modal.classList.add("formation-picker-modal-premium");bindFormationPickerModal(modal,replacingId);
 requestAnimationFrame(()=>{if(!contextGuidePending("partyAdd")||contextGuideDone("party_add"))return;const newest=tutorialNewMonsterId(),target=newest?modal.querySelector(`[data-formation-pick="${newest}"]`):modal.querySelector("[data-formation-pick]");if(target)showContextGuide({id:"party_add",title:"新しい仲間を選ぼう",text:"このカードを押すと、選んだ出撃枠へ編成されます。",target,placement:"top"})});
}
function bindFormationPickerModal(modal,replacingId=null){
 const input=modal.querySelector("#formationPickerSearch"),applySearch=()=>{const query=formationPickerState.search.trim().toLowerCase(),attribute=formationPickerState.attribute,buttons=[...modal.querySelectorAll("[data-formation-pick]")];buttons.forEach(button=>button.hidden=Boolean(query&&!button.dataset.search.includes(query))||attribute!=="all"&&button.dataset.formationAttribute!==attribute);const empty=modal.querySelector(".formation-filter-empty");if(empty)empty.hidden=buttons.some(button=>!button.hidden)};
 if(input){input.addEventListener("input",()=>{formationPickerState.search=input.value;applySearch()});applySearch()}
 modal.querySelectorAll("[data-formation-attribute-filter]").forEach(button=>button.onclick=()=>{formationPickerState.attribute=button.dataset.formationAttributeFilter;modal.querySelectorAll("[data-formation-attribute-filter]").forEach(entry=>entry.classList.toggle("active",entry===button));applySearch()});
 const sort=modal.querySelector("#formationPickerSort");if(sort)sort.onchange=()=>{formationPickerState.sort=sort.value;refreshFormationPicker(modal,replacingId)};
 modal.querySelector("#formationPickerDirection")?.addEventListener("click",()=>{formationPickerState.direction=formationPickerState.direction==="desc"?"asc":"desc";refreshFormationPicker(modal,replacingId)});
 modal.querySelectorAll("[data-formation-pick]").forEach(button=>button.onclick=()=>{
 if(replacingId){const incomingId=button.dataset.formationPick;modal.remove();confirmFormationReplacement(replacingId,incomingId);return}
  if(save.state.party.length>=4)return;
  save.state.party.push(button.dataset.formationPick);delete save.state.player.homePartySlots;if(contextGuidePending("partyAdd"))completePartyAddGuide();save.save();modal.remove();render();showToast("パーティーに編成しました");
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
  <div class="formation-gear-detail-head"><span>${equipmentVisual(item,{className:"formation-gear-art"})}</span><div><small>${rarity}・Lv.${item.level??1}${item.plus?`・+${item.plus}`:""}</small><h3>${item.name}</h3></div></div>
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
 document.querySelector('[data-party-tab="online"]')?.addEventListener("click",()=>go("onlineParty"));
 const rarityDrawer=document.querySelector("[data-formation-rarity-drawer]");
 const setRarityDrawer=open=>{
  if(!rarityDrawer)return;
  rarityDrawer.classList.toggle("open",open);
  rarityDrawer.setAttribute("aria-hidden",open?"false":"true");
 };
 document.querySelector("[data-formation-rarity-help]")?.addEventListener("click",()=>setRarityDrawer(true));
 document.querySelector("[data-formation-rarity-close]")?.addEventListener("click",()=>setRarityDrawer(false));
 document.querySelectorAll("[data-formation-add]").forEach(button=>button.onclick=()=>{completeContextGuide("party_slot",{quiet:true});openFormationPicker()});
 document.querySelectorAll("[data-formation-remove]").forEach(button=>button.onclick=()=>{togglePartyMember(button.dataset.formationRemove);render()});
 document.querySelectorAll("[data-formation-replace]").forEach(button=>button.onclick=()=>{completeContextGuide("party_slot",{quiet:true});openFormationPicker(button.dataset.formationReplace)});
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

function claimOnlinePartyReward({rewardId,reward={},source={}}={}){
 const masteryRewardId=String(rewardId??"").slice(0,160),masteryKind=String(source.kind??"");
 if(masteryRewardId&&["battle","raid"].includes(masteryKind)){
  const masteryParty=(save.state.party??[]).map(monsterId=>save.state.monsters.find(monster=>monster.id===monsterId)).filter(Boolean);
  recordSeriesBattle(save.state,masteryParty,null,{boss:masteryKind==="raid",battleId:`online:${masteryRewardId}`});
 }
 const id=String(rewardId??"").slice(0,160);if(!id)return{ok:false};const online=save.state.onlineParty??={claimedRewards:[],totalGold:0,totalCaptureCrystals:0,expeditionsCompleted:0,battlesWon:0,captures:0,raidWins:0,raidMaterials:0,raidExchange:{},tradeEscrow:{},completedTradeIds:[],tradeHistory:[]};online.claimedRewards=Array.isArray(online.claimedRewards)?online.claimedRewards:[];if(online.claimedRewards.includes(id))return{ok:true,duplicate:true};
 const gold=Math.max(0,Math.min(50_000_000,Math.floor(Number(reward.gold)||0))),captureCrystals=Math.max(0,Math.min(99,Math.floor(Number(reward.captureCrystals)||0))),crystals=Math.max(0,Math.min(50_000,Math.floor(Number(reward.crystals)||0))),raidMaterials=Math.max(0,Math.min(50_000,Math.floor(Number(reward.raidMaterials)||0))),experience=Math.max(0,Math.min(1_000_000_000,Math.floor(Number(reward.experience)||0))),equipmentRarity=["N","R","SR","SSR","UR","LR"].includes(String(reward.randomEquipmentRarity))?String(reward.randomEquipmentRarity):null,battleCapture=source.kind==="battleCapture"&&Boolean(reward.captureAttempted),captureCost=battleCapture?1:0;let captureSuccess=false,captureStorageFull=false,captureNoCrystal=false,captureName="",experienceTarget="",equipmentName="";
 if(battleCapture){if((Number(save.state.inventory.captureCrystals)||0)<captureCost)captureNoCrystal=true;else{save.state.inventory.captureCrystals-=captureCost;const contract=reward.capture,speciesId=String(contract?.speciesId??"");if(reward.captureSuccess&&SPECIES[speciesId]){if(save.state.monsters.length>=MONSTER_STORAGE_CAP){save.state.inventory.captureCrystals+=captureCost;captureStorageFull=true}else{const monster=createMonster(speciesId,{nickname:String(contract?.name??SPECIES[speciesId].name).slice(0,40),level:Math.max(1,Math.min(10000,Number(contract?.level)||1)),attribute:contract?.attribute??SPECIES[speciesId].element,obtainedMethod:"onlineCoopCapture",obtainedFloor:Math.max(1,Math.min(10000,Number(contract?.floor??source.floor)||1))});save.state.monsters.push(monster);save.state.records??={};save.state.records.captures=(Number(save.state.records.captures)||0)+1;save.state.codex??={encounters:{},captures:{},equipment:{}};save.state.codex.encounters??={};save.state.codex.captures??={};save.state.codex.encounters[speciesId]=(Number(save.state.codex.encounters[speciesId])||0)+1;save.state.codex.captures[speciesId]=(Number(save.state.codex.captures[speciesId])||0)+1;online.captures=(Number(online.captures)||0)+1;captureSuccess=true;captureName=displayName(monster)}}}}
 if(equipmentRarity){const floor=Math.max(1,Math.min(10000,Number(source.floor)||1)),slots=["weapon","armor","accessory"],slot=slots[[...id].reduce((sum,char)=>sum+char.charCodeAt(0),0)%slots.length],definition=source.bossFirstClear?floorBossDefinitionForFloor(floor):null;let item=definition?dedicatedFloorBossEquipment(floor,{floorBossCatalogId:definition.id},slot):null;if(!item)item=createEquipment(slot,{rarity:equipmentRarity});item.level=Math.max(Number(item.level)||1,floor);item.obtainedMethod=source.bossFirstClear?"onlineCoopBossFirstClear":"onlineCoopBonus";item.obtainedFloor=floor;const received=receiveEquipment(save.state,item,{bossReward:Boolean(source.bossFirstClear)});equipmentName=`${item.rarity??equipmentRarity} ${item.name}${received?.message?`（${received.message}）`:""}`}
 save.state.player.gold=Math.min(Number.MAX_SAFE_INTEGER,(Number(save.state.player.gold)||0)+gold);save.state.player.crystals=Math.min(Number.MAX_SAFE_INTEGER,(Number(save.state.player.crystals)||0)+crystals);save.state.inventory.captureCrystals=Math.min(Number.MAX_SAFE_INTEGER,(Number(save.state.inventory.captureCrystals)||0)+captureCrystals);online.raidMaterials=Math.min(Number.MAX_SAFE_INTEGER,(Number(online.raidMaterials)||0)+raidMaterials);if(source.kind==="raid"){online.raidWins=(Number(online.raidWins)||0)+1;const targetId=onlinePartyController?.selectedMonsterId??save.state.party?.[0],target=save.state.monsters.find(monster=>monster.id===targetId);if(target&&experience){applyTotalExperience(target,totalExperience(target)+experience);experienceTarget=displayName(target)}}const leaderFloorUnlock=Math.max(0,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(reward.leaderFloorUnlock??source.leaderFloorUnlock)||0)));if(source.kind==="floorClear"&&leaderFloorUnlock>0)save.state.player.maxFloor=Math.max(Number(save.state.player.maxFloor)||1,leaderFloorUnlock);if(source.bossFirstClear){const floor=Math.max(10,Math.floor(Number(source.floor)||10));save.state.player.bossKills??={};save.state.player.bossKills[floor]=Math.max(1,Number(save.state.player.bossKills[floor])||0);online.firstCoopBossClears=Array.isArray(online.firstCoopBossClears)?online.firstCoopBossClears:[];if(!online.firstCoopBossClears.includes(floor))online.firstCoopBossClears.push(floor)}online.claimedRewards.push(id);online.claimedRewards=online.claimedRewards.slice(-200);online.totalGold=(Number(online.totalGold)||0)+gold;online.totalCaptureCrystals=(Number(online.totalCaptureCrystals)||0)+captureCrystals;if(source.kind==="completion"||source.kind==="floorClear")online.expeditionsCompleted=(Number(online.expeditionsCompleted)||0)+1;if(source.kind==="battle")online.battlesWon=(Number(online.battlesWon)||0)+1;save.save();const compact=value=>{const number=Math.max(0,Number(value)||0);if(number>=1e9)return`${Number((number/1e9).toFixed(1))}B`;if(number>=1e6)return`${Number((number/1e6).toFixed(1))}M`;if(number>=1e4)return`${Number((number/1e3).toFixed(1))}K`;return Math.floor(number).toLocaleString()};const goldHud=document.getElementById("goldHud"),crystalHud=document.getElementById("crystalHud"),captureHud=document.getElementById("captureHud");if(goldHud)goldHud.textContent=compact(save.state.player.gold);if(crystalHud)crystalHud.textContent=compact(save.state.player.crystals);if(captureHud)captureHud.textContent=compact(save.state.inventory.captureCrystals);if(gold)showResourceToast("gold",gold);if(crystals)setTimeout(()=>showResourceToast("crystal",crystals),180);if(captureCrystals)setTimeout(()=>showResourceToast("capture",captureCrystals),300);if(equipmentName)setTimeout(()=>showToast(`装備獲得：${equipmentName}`),420);if(leaderFloorUnlock)showToast(`${leaderFloorUnlock}階が解放されました！`);return{ok:true,gold,captureCrystals,crystals,raidMaterials,experience,experienceTarget,equipmentName,captureSuccess,captureStorageFull,captureNoCrystal,captureName,leaderFloorUnlock}
}
function exchangeOnlineRaidReward(kind,cost){
 const online=save.state.onlineParty??={},price=Math.max(0,Math.floor(Number(cost)||0)),materials=Math.max(0,Math.floor(Number(online.raidMaterials)||0));if(materials<price)return{ok:false,message:`融骸核片が足りません（${materials}/${price}）`};let message="";
 if(kind==="character"){if(save.state.monsters.length>=MONSTER_STORAGE_CAP)return{ok:false,message:"魔物庫が満杯です。先に整理してください"};const level=Math.max(1,Math.min(ENDGAME_MAX_LEVEL,Number(save.state.player.maxFloor)||1)),monster=createMonster("ancient_dragon",{nickname:"融骸幼体アマルガ",level,stars:MONSTER_STAR_MAX,rank:4,plus:12,attribute:"dark",obtainedMethod:"onlineRaidExchange",obtainedFloor:save.state.player.maxFloor});monster.customVisualAsset="./assets/online/raid/juvenile-amalga.png";monster.raidLimited=true;monster.tags=[...(monster.tags??[]),"raid","amalgam"];save.state.monsters.push(monster);message="限定仲間「融骸幼体アマルガ」と契約しました"}
 else if(kind==="equipment"){const item=createEquipment("weapon",{rarity:"神話"});item.name="終焉喰らいの大刃";item.level=Math.max(1,Math.min(10000,Math.round((Number(save.state.player.maxFloor)||1)*1.35)));item.plus=30;item.raidLimited=true;item.ruleOverrides={...(item.ruleOverrides??{}),unsellable:true,raidResonance:true};const result=receiveEquipment(save.state,item,{bossReward:true});message=`限定神話装備を獲得（${result.message}）`}
 else if(kind==="circle"){const instance=createMagicCircleInstance(save.state,"death_mirror",{level:1,source:"raidExchange",locked:false});if(!instance)return{ok:false,message:"魔法陣の現物を追加できませんでした"};message="「即死返鏡陣」の現物を1個獲得しました。術式未解禁なら装備・強化はできません"}
 else return{ok:false,message:"交換報酬が見つかりません"};online.raidMaterials=materials-price;online.raidExchange??={};online.raidExchange[kind]=(Number(online.raidExchange[kind])||0)+1;save.save();return{ok:true,message}
}
function bindOnlineParty(){
 onlinePartyController??=new OnlinePartyController({
  getState:()=>save.state,toast:showToast,onReward:claimOnlinePartyReward,onBack:()=>go("home"),
  onExploreCanvasMount:mountOnlineExploreCanvas,
	  onExploreCanvasUpdate:updateOnlineExploreCanvas,
	  onExploreCanvasUnmount:unmountOnlineExploreCanvas,
	  onHostWorldUpdate:persistOnlineHostWorld,
	  onScene:scene=>audio.setScene(scene)
 });
 onlinePartyController.mount(app);
}

function persistOnlineHostWorld(event){
 if(!event?.chestId||event.hostOwnerId&&event.hostOwnerId!==onlinePartyController?.selfId)return;
 const online=save.state.onlineParty??=( {} ),host=online.hostWorld??=( {openedChestIds:{}} ),floor=String(Math.max(1,Number(event.floor)||1)),chestId=String(event.chestId);
 host.openedChestIds??={};host.openedChestIds[floor]=Array.isArray(host.openedChestIds[floor])?host.openedChestIds[floor]:[];
 save.state.player.openedChests??={};save.state.player.openedChests[floor]=Array.isArray(save.state.player.openedChests[floor])?save.state.player.openedChests[floor]:[];
 if(!host.openedChestIds[floor].includes(chestId))host.openedChestIds[floor].push(chestId);
 if(!save.state.player.openedChests[floor].includes(chestId))save.state.player.openedChests[floor].push(chestId);
 save.save()
}

function onlineExploreMonster(member){
 const profile=member?.profile??{},vitals=member?.coopVitals??profile.battleStats??{},stats=profile.battleStats??{};
 return{id:member.playerId,speciesId:profile.speciesId??"slime",visualSpeciesId:profile.visualSpeciesId??null,endgameBossId:profile.endgameBossId??null,floorBossCatalogId:profile.floorBossCatalogId??null,customVisualAsset:profile.customVisualAsset??null,nickname:profile.monsterName??profile.displayName??"冒険者",level:Math.max(1,Number(profile.level)||1),stars:Math.max(1,Number(profile.stars)||1),rank:1,plus:Math.max(0,Number(profile.plus)||0),attribute:profile.attribute??"neutral",currentHp:Math.max(0,Number(vitals.hp??stats.hp)||0),currentMp:Math.max(0,Number(vitals.mp??stats.mp)||0),onlineStats:{...stats,hp:Math.max(1,Number(vitals.maxHp??stats.hp)||1)},onlineMaxMp:Math.max(0,Number(vitals.maxMp??stats.mp)||0),equipment:{},equippedSkills:[],skillLoadoutInitialized:true}
}
function onlineExploreWorld(room){
 const expedition=room?.expedition,objects=expedition?.objects??[],floor=Math.max(1,Number(expedition?.floor)||1),bossObject=floor%10===0?objects.find(object=>object.type==="encounter"&&!object.resolved):null;
	 // A shrine is a recovery altar, not a mineable purple crystal. Keeping the
	 // two visuals distinct prevents crystal gathering from looking like a heal.
	 const decorations=[...(expedition?.decorations??[]).map(entry=>({...entry})),...objects.filter(object=>["bone","shrine"].includes(object.type)).map((object,index)=>({...object,id:`online-object-${object.id??index}`,type:object.type==="bone"?"bones":"water",used:Boolean(object.resolved),destroyed:Boolean(object.resolved),phase:index*31}))];
 return{cols:Math.max(1,Number(expedition?.cols)||1),rows:Math.max(1,Number(expedition?.rows)||1),shape:"onlineShared",treasureRealm:Boolean(expedition?.coop?.rare?.realmActive),tiles:(expedition?.tiles??[]).map(row=>[...row].map(tile=>tile==="."?0:1)),start:{...(expedition?.start??{x:1,y:1})},exit:{...(expedition?.exit??{x:1,y:1})},shop:null,boss:bossObject?{x:bossObject.x,y:bossObject.y}:null,onlineBossMonster:bossObject?{speciesId:"ancient_dragon",level:Math.max(14,floor),currentHp:1,onlineStats:{hp:1}}:null,chests:objects.filter(object=>!object.hidden&&object.type==="chest").map(object=>({...object,open:Boolean(object.resolved),locked:false,onlineType:object.type})),decorations,onlineObjects:objects.filter(object=>!object.hidden&&["resonanceChest","deluxeChest","coopSwitch","resonanceVault","coopElite","relaySeal","keyFragment","combinedKey","rareGoldenMonster","rareMerchant","rarePortal","rarePortalGuardian","rarePortalChest","rareReturnPortal"].includes(object.type)).map(object=>({...object})),hotSpring:null,encountering:false}
}
function syncOnlineExploreMembers(room,selfId,{snap=false}={}){
 if(!game?.online)return;
 game.onlineRoom=room;game.onlineFloor=Math.max(1,Number(room?.expedition?.floor)||1);game.onlineMembers=(room?.members??[]).map(member=>({member,monster:onlineExploreMonster(member)}));
 const active=new Set();
 for(const entry of game.onlineMembers){const position=entry.member.dungeonPosition??room?.expedition?.start;if(!position)continue;active.add(entry.member.playerId);let entity=game.onlineEntities.get(entry.member.playerId);if(!entity){entity=new Entity(position.x,position.y);game.onlineEntities.set(entry.member.playerId,entity)}else if(snap||Math.hypot(entity.x-position.x,entity.y-position.y)>2.1){entity.x=position.x;entity.y=position.y;entity.rx=position.x;entity.ry=position.y;entity.path=[];entity.p=0}else if(entity.x!==position.x||entity.y!==position.y){const last=entity.path.at(-1);if(last?.x!==position.x||last?.y!==position.y)entity.setPath([{x:position.x,y:position.y}])}if(entry.member.playerId===selfId)game.player=entity}
 for(const id of game.onlineEntities.keys())if(!active.has(id))game.onlineEntities.delete(id);
 if(!game.player){const start=room?.expedition?.start??{x:1,y:1};game.player=new Entity(start.x,start.y)}
}
function bindOnlineExploreInput(canvas,onDestination){
 const input=createInputState(),scalePoint=event=>{const rect=canvas.getBoundingClientRect();return{x:(event.clientX-rect.left)*(canvas.width/Math.max(1,rect.width)),y:(event.clientY-rect.top)*(canvas.height/Math.max(1,rect.height))}},finish=event=>{input.pts.delete(event.pointerId);if(input.pts.size<2)input.pinch=null;if(!input.pts.size)input.drag=false};
 game.input=input;
 canvas.onpointerdown=event=>{canvas.setPointerCapture?.(event.pointerId);const point=scalePoint(event);input.pts.set(event.pointerId,{...point,startClientX:event.clientX,startClientY:event.clientY});if(input.pts.size===2){const[a,b]=[...input.pts.values()];input.pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:game.camera.z};input.drag=true}};
 canvas.onpointermove=event=>{const prior=input.pts.get(event.pointerId);if(!prior||!game?.online)return;const point=scalePoint(event),dx=point.x-prior.x,dy=point.y-prior.y;prior.x=point.x;prior.y=point.y;if(input.pts.size>=2){const[a,b]=[...input.pts.values()],distance=Math.hypot(a.x-b.x,a.y-b.y),center={x:(a.x+b.x)/2,y:(a.y+b.y)/2},before=game.camera.screen(center.x,center.y);game.camera.z=Math.max(.45,Math.min(2.25,input.pinch.zoom*distance/Math.max(1,input.pinch.distance)));const after=game.camera.world(before.x,before.y);game.camera.ox+=center.x-after.x;game.camera.oy+=center.y-after.y;game.camera.manual=true;game.camera.clamp(game.world);input.drag=true;return}if(Math.hypot(event.clientX-prior.startClientX,event.clientY-prior.startClientY)>=CAMERA_DRAG_THRESHOLD_PX)input.drag=true;if(input.drag){game.camera.pan(dx,dy);game.camera.clamp(game.world)}};
 canvas.onpointerup=event=>{const prior=input.pts.get(event.pointerId),multiple=input.pinch,drag=input.drag;finish(event);if(!prior||multiple||drag||!game?.online)return;const point=scalePoint(event),worldPoint=game.camera.screen(point.x,point.y),target={x:Math.floor(worldPoint.x/TILE),y:Math.floor(worldPoint.y/TILE)};onDestination?.(target)};
 canvas.onpointercancel=canvas.onlostpointercapture=finish;
}
function onlineExploreLoop(now){
 if(!game?.online||!game.running)return;const dt=Math.min(.05,(now-game.last)/1000||0);game.last=now;
 for(const entity of game.onlineEntities.values())entity.move(dt,7.5);
 game.camera.follow(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world);draw();requestAnimationFrame(onlineExploreLoop)
}
const onlineExploreCameraStates=new Map();
function mountOnlineExploreCanvas(room,selfId,onDestination,chatBubbles=[],pings=[],socialBubbles=[]){
 const canvas=document.querySelector("[data-online-dungeon-canvas]");if(!canvas||!room?.expedition)return;stopGame();const rect=canvas.getBoundingClientRect(),density=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(rect.width*density));canvas.height=Math.max(1,Math.round(rect.height*density));const mini=document.getElementById("miniMap");if(mini){mini.width=132*density;mini.height=132*density}
 const viewKey=`${room.expedition.id}:${room.expedition.floor}:${room.expedition.coop?.rare?.realmActive?"realm":"world"}`;game={online:true,onlineViewKey:viewKey,onlineSelfId:selfId,onlineFloor:room.expedition.floor,onlineMembers:[],onlineEntities:new Map(),onlineChatBubbles:[...chatBubbles],onlinePings:[...pings],onlineSocialBubbles:[...socialBubbles],world:onlineExploreWorld(room),player:null,camera:null,canvas,ctx:canvas.getContext("2d"),paused:false,running:true,input:createInputState(),last:performance.now()};syncOnlineExploreMembers(room,selfId,{snap:true});game.camera=new Camera(canvas);const savedView=onlineExploreCameraStates.get(viewKey);if(savedView){game.camera.x=savedView.x;game.camera.y=savedView.y;game.camera.z=savedView.z;game.camera.ox=savedView.ox;game.camera.oy=savedView.oy;game.camera.manual=savedView.manual}else game.camera.reset(game.player.x*TILE,game.player.y*TILE);game.camera.clamp(game.world);bindOnlineExploreInput(canvas,onDestination);requestAnimationFrame(()=>bindMovableMapToggle());requestAnimationFrame(onlineExploreLoop)
}
function updateOnlineExploreCanvas(room,selfId,options={}){if(!game?.online)return;syncOnlineExploreMembers(room,selfId);game.world=onlineExploreWorld(room);if(Array.isArray(options.chatBubbles))game.onlineChatBubbles=[...options.chatBubbles];if(Array.isArray(options.pings))game.onlinePings=[...options.pings];if(Array.isArray(options.socialBubbles))game.onlineSocialBubbles=[...options.socialBubbles];if(options.center){game.camera.reset(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world)}}
function unmountOnlineExploreCanvas(){if(game?.online){onlineExploreCameraStates.set(game.onlineViewKey,{x:game.camera.x,y:game.camera.y,z:game.camera.z,ox:game.camera.ox,oy:game.camera.oy,manual:game.camera.manual});if(onlineExploreCameraStates.size>12)onlineExploreCameraStates.delete(onlineExploreCameraStates.keys().next().value);stopGame();game=null}}
function rarityValue(rarity){return ({N:1,R:2,SR:3,SSR:4,UR:5,LR:6,"神話":7,"深淵":8,"十神":9}[rarity]??0)}
function elementLabel(element){if(element==="all")return"全属性";const id=canonicalAttribute(element,`label:${element??"neutral"}`);return ATTRIBUTES[id]?.name??"無"}
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
 const get=m=>{const st=calculatedStats(m),sp=SPECIES[m.speciesId];switch(partyEditorState.sort){case"level":return m.level;case"plus":return m.plus??0;case"affection":return m.affection??0;case"hp":return st.hp;case"atk":return st.atk;case"def":return st.def;case"spd":return st.spd;case"name":return displayName(m);case"obtained":return m.createdAt??m.id;default:return rarityValue(m.summonTier??m.summonRarity??sp.rarity)}};
 return list.sort((a,b)=>{const av=get(a),bv=get(b),cmp=typeof av==="string"?String(av).localeCompare(String(bv),"ja"):av-bv;return partyEditorState.direction==="asc"?cmp:-cmp});
}
function partyEditorBody(mode="home"){
 const current=save.state.party.map((id,i)=>{const m=save.state.monsters.find(x=>x.id===id);return m?`<button data-party-slot="${m.id}"><span>${i+1}</span><b>${monsterVisual(m,SPECIES[m.speciesId].emoji)} ${displayName(m)}</b><small>Lv.${m.level}</small></button>`:`<button disabled><span>${i+1}</span><b>空き</b></button>`}).join("");
 const elements=["all","neutral","fire","water","lightning","earth","wind","ice","light","dark"];
 const rows=partyEditorMonsters().map(m=>{const sp=SPECIES[m.speciesId],st=calculatedStats(m),active=save.state.party.includes(m.id),rarity=monsterVisibleRarity(m);return`<article class="party-compare-card ${active?"selected":""}"><button class="party-card-main" data-home-party-toggle="${m.id}"><span class="party-monster-icon">${monsterVisual(m,sp.emoji)}</span><div><div class="party-card-title"><b>${displayName(m)}</b></div><small>${rarity} / ${elementLabel(sp.element)} / Lv.${m.level} / +${m.plus??0}</small><small>なつき ${m.affection??0}</small><div class="party-stat-line"><span>HP ${st.hp}</span><span>ATK ${st.atk}</span><span>DEF ${st.def}</span><span>SPD ${st.spd}</span></div></div></button><button class="party-detail-button" data-party-detail="${m.id}">詳細</button></article>`}).join("")||'<div class="empty">条件に合うモンスターがいません</div>';
 const intro=mode==="field"?"その場で1〜4体を選択できます。捕獲直後の仲間もすぐ使用可能です。":"情報を比較しながら1〜4体を選択できます。";
 return`<p class="muted">${intro}</p><div class="party-current-slots">${current}</div><div class="party-tools"><input id="partySearch" value="${partyEditorState.search}" placeholder="名前で検索"><div class="party-filter-scroll">${elements.map(e=>`<button data-party-element="${e}" class="${partyEditorState.element===e?"active":""}">${elementLabel(e)}</button>`).join("")}</div><div class="party-tool-row"><select id="partyStatus"><option value="all">全員</option><option value="active">出撃中</option><option value="reserve">控え</option><option value="favorite">お気に入り</option></select><select id="partySort"><option value="rarity">レア度</option><option value="level">レベル</option><option value="plus">+強化</option><option value="affection">なつき度</option><option value="hp">HP</option><option value="atk">ATK</option><option value="def">DEF</option><option value="spd">SPD</option><option value="obtained">入手順</option><option value="name">名前順</option></select><button id="partyDirection">${partyEditorState.direction==="desc"?"降順 ↓":"昇順 ↑"}</button></div></div><div class="party-compare-list">${rows}</div>`;
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
function limitBreakCandidates(m){const key=monsterIdentityKey(m);return save.state.monsters.filter(x=>x.id!==m.id&&monsterIdentityKey(x)===key&&!save.state.party.includes(x.id)&&!x.favorite&&!x.locked)}
function performLimitBreak(id,options={}){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const materials=limitBreakCandidates(m);if(materials.length<2)return alert("限界突破には、控えにいる同名モンスターが2体必要です。\nお気に入り・ロック・出撃中の個体は素材にできません。");const growth=limitBreakGrowth(m.speciesId),before=m.plus??0,consumed=materials.slice(0,2),inheritedAffection=Math.min(1000,Math.max(m.affection??m.bond??0,...consumed.map(monster=>monster.affection??monster.bond??0)));if(!confirm(`${displayName(m)}を +${before+1}へ限界突破する？\n\n素材：同名モンスター2体\nなつき度：${m.affection??0} → ${inheritedAffection}\nLv1基礎補正：HP+${growth.hp} / ATK+${growth.atk} / DEF+${growth.def} / SPD+${growth.spd}`))return;const ids=new Set(consumed.map(x=>x.id));save.state.monsters=save.state.monsters.filter(x=>!ids.has(x.id));m.plus=before+1;m.affection=inheritedAffection;m.bond=inheritedAffection;save.save();document.querySelectorAll(".game-modal").forEach(x=>x.remove());app.insertAdjacentHTML("beforeend",Modal("✨ 限界突破 ✨",`<div class="limit-break-result"><span>${monsterVisual(m,SPECIES[m.speciesId]?.emoji??"👹",{className:"limit-break-monster-visual"})}</span><h2>${displayName(m)}</h2><div><b>+${before}</b><i>→</i><strong>+${m.plus}</strong></div><p>なつき度 ${m.affection}/1000<br>Lv.1基礎値：HP +${growth.hp} / ATK +${growth.atk} / DEF +${growth.def} / SPD +${growth.spd}</p></div>`,"育成画面へ"));topModalButton().onclick=()=>{closeTopModal();if(options.returnToDetail){selected=id;screen="detail";render()}else openPartyMonsterDetail(id)}}
function openPartyMonsterDetail(id){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const sp=SPECIES[m.speciesId],st=calculatedStats(m),growth=limitBreakGrowth(m.speciesId),aff=m.affection??0,h=m.history??{},materials=limitBreakCandidates(m).length,friend=aff>=1000?" ❤️ 親友":"";app.insertAdjacentHTML("beforeend",Modal(displayName(m),`<div class="codex-detail monster-growth-detail"><div class="modal-monster-hero">${monsterVisual(m,sp.emoji??"👹",{className:"modal-monster-visual"})}<p><b>${monsterVisibleRarity(m)} / ${elementLabel(sp.element)} / ${sp.role??"不明"}</b></p></div><div class="detail-stat-grid"><span>Lv.${m.level}</span><span>限界突破 +${m.plus??0}</span><span>なつき ${aff}/1000${friend}</span><span>HP ${st.hp}</span><span>ATK ${st.atk}</span><span>DEF ${st.def}</span><span>SPD ${st.spd}</span></div><section class="growth-panel"><b>＋限界突破</b><p>同名2体で＋1・上限なし。Lv1基礎値へ毎回 HP+${growth.hp} / ATK+${growth.atk} / DEF+${growth.def} / SPD+${growth.spd}</p><button id="limitBreakButton" ${materials<2?"disabled":""}>＋${(m.plus??0)+1}へ限界突破（素材 ${materials}/2）</button></section><section class="growth-panel"><b>❤️ なつき度ボーナス</b><p>${aff>=1000?"全段階解放・親友":`現在 ${aff}/1000　次のボーナスまで ${Math.ceil((aff+1)/100)*100-aff}`}</p></section><div class="party-detail-quick-actions"><button id="openGrowthFromPartyDetail">💪 育成画面へ</button><button id="openEquipmentFromPartyDetail">⚔️ 装備を変更</button></div><section class="growth-panel history-panel"><b>📖 このモンスターの歴史</b><p>初獲得：${formatObtainedDate(m.obtainedAt??m.capturedAt)} / ${m.obtainedFloor??1}F / ${m.obtainedMethod==="summon"?"召喚":"捕獲"}<br>冒険 ${h.adventures??0}回 / 戦闘 ${h.battles??0}回 / 勝利 ${h.victories??0}回<br>撃破 ${h.kills??0}体 / ボス撃破 ${h.bossDefeats??0}体 / 最高到達 ${h.highestFloor??m.obtainedFloor??1}F</p></section><p class="muted">種族 ${sp.race??"不明"}<br>特性 ${TRAITS[m.traitId]?.name??"なし"}</p></div>`,"戻る"));const modal=topModal();modal.querySelector("#limitBreakButton")?.addEventListener("click",()=>performLimitBreak(id));modal.querySelector("#openGrowthFromPartyDetail")?.addEventListener("click",()=>{document.querySelectorAll(".game-modal").forEach(x=>x.remove());selected=id;screen="detail";render()});modal.querySelector("#openEquipmentFromPartyDetail")?.addEventListener("click",()=>{document.querySelectorAll(".game-modal").forEach(x=>x.remove());equipmentTarget=id;navigationOrigin="monsters";screen="equipment";render()});topModalButton().onclick=closeTopModal}
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
 completeContextGuide("equipment_equip",{quiet:true});save.save();render();
}
function autoEquipMonster(monsterId){
 const monster=save.state.monsters.find(m=>m.id===monsterId);if(!monster||!save.state.party.includes(monsterId))return;
 const snapshot=captureVitalSnapshot(monster),pairs=[["weaponRight","weapon"],["armorBody","armor"],["accessoryNeck","accessory"],["armorSupport","armor"],["accessoryFinger","accessory"],["weaponLeft","weapon"]];
 for(const[subslot,slot]of pairs){
  const candidates=save.state.equipment.filter(item=>item.slot===slot&&canEquipInSubslot(item,monster,subslot)&&(!item.equippedBy||item.equippedBy===monsterId)&&!Object.values(monster.equipment??{}).includes(item.id)).sort((a,b)=>Number(signatureEquipmentMatchesMonster(b,monster))-Number(signatureEquipmentMatchesMonster(a,monster))||equipmentPower(b)-equipmentPower(a));
  const best=candidates[0];if(!best)continue;
  const current=save.state.equipment.find(item=>item.id===monster.equipment?.[subslot]);
  if(current&&signatureEquipmentMatchesMonster(current,monster)&&!signatureEquipmentMatchesMonster(best,monster))continue;
  if(current&&signatureEquipmentMatchesMonster(current,monster)===signatureEquipmentMatchesMonster(best,monster)&&equipmentPower(current)>=equipmentPower(best))continue;
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
function restGoldCost(recovery){if(!recovery||recovery.total<=0&&!recovery.ailments)return 0;return Math.max(20,Math.ceil((Number(recovery.hp)||0)/250+(Number(recovery.mp)||0)/8+(Number(recovery.ailments)||0)*50))}
function ensureGold(cost,onReady){const gold=save.state.player.gold??0;if(gold>=cost){onReady();return}const shortage=cost-gold,baseUnits=Math.ceil(shortage/1000),crystals=premiumCrystalCost(baseUnits),convertedGold=baseUnits*1000;if((save.state.player.crystals??0)<crystals){alert(`GOLDが不足しています。\n不足：${shortage.toLocaleString()}G\n必要な魔晶石：${crystals.toLocaleString()}個（所持 ${save.state.player.crystals??0}個）`);return}if(!confirm(`GOLDが不足しています。\n\n魔晶石をGOLDへ変換しますか？\n${crystals.toLocaleString()}個 → ${convertedGold.toLocaleString()}G\n（魔晶石10個 = 1000G）`))return;save.state.player.crystals-=crystals;save.state.player.gold+=convertedGold;save.save();onReady()}
function openRest(){
 const key=localDayKey(),free=save.state.rest.lastFreeKey!==key,recovery=ownedRecoveryBreakdown(),cost=restGoldCost(recovery);
 if(recovery.total<=0&&recovery.ailments<=0){app.insertAdjacentHTML("beforeend",Modal("安息の寝台",`<div class="rest-sanctuary-v3 is-full"><div class="rest-bed-stage-v3"><i></i><img src="assets/ui/items/bed.png" alt="宿屋の寝台"></div><small>REST COMPLETE</small><h3>所持仲間は全員万全です</h3><p>HP・MPは満タンで、状態異常もありません。</p></div>`,"閉じる"));const ready=topModal();ready.classList.add("rest-modal-v3");ready.querySelector("[data-modal-primary]").onclick=closeTopModal;return}
 app.insertAdjacentHTML("beforeend",Modal("深淵の休息",`<div class="rest-sanctuary-v3"><div class="rest-bed-stage-v3"><i></i><img src="assets/ui/items/bed.png" alt="宿屋の寝台"></div><small>ABYSS SANCTUARY</small><h3>旅の傷を癒やす</h3><p>所持仲間全員のHP・MP・状態異常を完全回復します。</p><div class="rest-breakdown-v3"><article><small>HP RECOVERY</small><b>${recovery.hp.toLocaleString()}</b><i style="--rest-fill:${recovery.hp?100:0}%"></i></article><article><small>MP RECOVERY</small><b>${recovery.mp.toLocaleString()}</b><i style="--rest-fill:${recovery.mp?100:0}%"></i></article><article><small>CONDITION</small><b>${recovery.ailments?`${recovery.ailments}件解除`:"異常なし"}</b></article></div><div class="rest-price-v3 ${free?"is-free":""}"><small>${free?"DAILY BLESSING":"RECOVERY COST"}</small><b>${free?"本日1回 無料":`${cost.toLocaleString()}G`}</b><span>HP ${recovery.hp.toLocaleString()} ＋ MP ${recovery.mp.toLocaleString()} ＝ ${cost.toLocaleString()}G</span><em>所持 ${save.state.player.gold.toLocaleString()}G</em></div></div>`,free?"無料の安息を受ける":`${cost.toLocaleString()}Gで休む`));
 const modal=topModal();modal.classList.add("rest-modal-v3");
 modal.querySelector("[data-modal-primary]").onclick=()=>{
  const latest=ownedRecoveryBreakdown(),latestCost=restGoldCost(latest);
  if(!free&&save.state.player.gold<latestCost){modal.remove();return ensureGold(latestCost,openRest)}
  if(!confirm(free?"本日の無料休息を使いますか？":`${latestCost.toLocaleString()}Gで休息しますか？`))return;
  if(free)save.state.rest.lastFreeKey=key;else save.state.player.gold-=latestCost;
  healOwnedMonsters();const guide=contextualGuideState();setGuidePending(guide,"bedRecovery",false);completeContextGuide("bed_recover",{quiet:true});save.save();modal.remove();render();
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
 if(roll<.0012)return"神話";
 if(roll<.003)return"LR";
 if(roll<.011)return"UR";
 if(roll<.051)return"SSR";
 if(roll<.181)return"SR";
 if(roll<.501)return"R";
 return"N";
}
const NORMAL_SUMMON_RATES=Object.freeze({N:49.9,R:32,SR:13,SSR:4,UR:.8,LR:.18,"神話":.12,"深淵":0,"十神":0});
function stableHash(text){let hash=2166136261;for(const char of String(text))hash=Math.imul(hash^char.charCodeAt(0),16777619);return hash>>>0}
function jstDayNumber(date=new Date()){const key=teamBattleDayKey(date);return Math.floor(Date.parse(`${key}T00:00:00Z`)/86400000)}
function guerrillaGachaStatus(date=new Date()){
 save.state.gacha??={};save.state.gacha.guerrilla??={salt:null,lastCycle:null};if(!save.state.gacha.guerrilla.salt)save.state.gacha.guerrilla.salt=crypto.randomUUID?.()??`${Date.now()}-${Math.random()}`;
 const day=jstDayNumber(date),cycle=Math.floor(day/7),dayInCycle=((day%7)+7)%7,eventDay=stableHash(`${save.state.gacha.guerrilla.salt}:${cycle}`)%7,active=dayInCycle===eventDay;
 return{active,cycle,eventDay,dayInCycle,remainingDays:(eventDay-dayInCycle+7)%7};
}
function rotatingGachaCampaign(date=new Date()){
 const index=Math.floor(jstDayNumber(date)/3)%4,entries=[
  {id:"rotation-weapon",badge:"3日限定",title:"武器系召喚",copy:"排出される装備は武器のみ。役割に合う一本を狙え。",tone:"red",mode:"weapon"},
  {id:"rotation-armor",badge:"3日限定",title:"防具系召喚",copy:"排出される装備は防具のみ。守りの構成を完成させる。",tone:"blue",mode:"armor"},
  {id:"rotation-accessory",badge:"3日限定",title:"アクセサリー召喚",copy:"排出される装備はアクセサリーのみ。希少効果に特化。",tone:"violet",mode:"accessory"},
  {id:"rotation-gold",badge:"3日限定",title:"GOLD召喚",copy:"100G〜99,999,999G。最高額の出現率は0.02%。",tone:"gold",mode:"gold"}
 ];return entries[(index+entries.length)%entries.length];
}
function currentGachaCampaigns(){
 const weekday=weekdayGachaSchedule();return[
  {id:"standard",badge:"常設",title:"神話級との邂逅",copy:"通常枠 神話0.12%・10連最後はSR以上",tone:"violet",mode:"mixed"},
  {id:"beginner",badge:"初心者限定",title:"スタートダッシュ召喚",copy:"初回のみ10連無料・最後の1体はSR以上",tone:"green",mode:"monster"},
  rotatingGachaCampaign(),
  {id:"permanent-signature",badge:"常設・天井なし",title:"専用装備契約",copy:"SSR以上の仲間の専用装備が総率0.1%。外れは通常装備。",tone:"red",mode:"signaturePermanent"},
  {id:"weekday",badge:`${weekday.dayName}曜限定・0:00まで`,title:weekday.title,copy:weekday.copy,tone:weekday.kind==="sunday"?"abyss":weekday.kind==="signature"?"red":"green",mode:"weekday",weekdayKind:weekday.kind},
  {id:"event-preview",badge:"COMING SOON",title:"イベント装備シリーズ",copy:"イベント開催時はここへ新しい召喚が追加されます",tone:"red",disabled:true,mode:"equipment"}
 ];
}
const SUMMON_RARITY_INFO=[
 {id:"N",name:"ノーマル",note:"通常時 49.900%"},
 {id:"R",name:"レア",note:"通常時 32.000%"},
 {id:"SR",name:"スーパーレア",note:"通常時 13.000%・10連最後はSR以上"},
 {id:"SSR",name:"スペシャルスーパーレア",note:"通常時 4.000%"},
 {id:"UR",name:"ウルトラレア",note:"通常時 0.800%"},
 {id:"LR",name:"レジェンドレア",note:"通常時 0.180%"},
 {id:"神話",name:"神話級",note:"通常時 0.120%"},
 {id:"深淵",name:"深淵級",note:"通常時 0%・毎週日曜にカテゴリ全体で0.100%"},
 {id:"十神",name:"十神",note:"全召喚から排出なし・欠片契約限定"}
];
function rarityCssClass(rarity){return({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity??"N").toLowerCase()}
function summonOne({mode="mixed",guaranteedMonster=false,guaranteedEquipment=false,guaranteedRare=false,forcedRarity=null,deep=false,equipmentSlot=null}={}){
 const requestedSlot=equipmentSlot??(["weapon","armor","accessory"].includes(mode)?mode:null),isMonster=guaranteedMonster||(!guaranteedEquipment&&!requestedSlot&&(mode==="monster"||Math.random()<.30)),rarity=forcedRarity??(deep?"LR":rarityRoll(guaranteedRare?"guaranteed":"normal"));
 if(isMonster){
  let pool=Object.values(SPECIES).filter(species=>species.rarity!=="十神"&&!species.isTenGod&&!species.tags?.includes?.("tenGod")&&!species.isAbyss&&!species.tags?.includes?.("abyss")&&!species.serialOnly&&!species.gachaExcluded);
  if(deep)pool=pool.filter(species=>(species.minFloor??0)>=70&&species.rarity!=="神話");
  else pool=pool.filter(species=>species.rarity===rarity);
  if(!pool.length)pool=Object.values(SPECIES).filter(species=>species.rarity===rarity&&!species.isTenGod&&!species.isAbyss&&!species.serialOnly&&!species.gachaExcluded);
  if(!pool.length)pool=[SPECIES.slime];
  const newArrivalIds=new Set(["eraser_slime","pushpin_roller","pencil_mouse","stapler_crab","compass_beetle","gluepot_mimic","fountain_pen_mage","correction_ghost","scissor_mantis","pencilcase_parade","chalkboard_dragon","forbidden_paper_cutter","ochuki","bechi","kiara","roxy","milim","ai","eris","golden_darkness"]);
  const featured=pool.filter(species=>newArrivalIds.has(species.id)),unownedFeatured=featured.filter(species=>!save.state.monsters.some(entry=>entry.speciesId===species.id));
  const selectedPool=unownedFeatured.length&&Math.random()<.6?unownedFeatured:featured.length&&Math.random()<.28?featured:pool;
  const speciesId=selectedPool[Math.floor(Math.random()*selectedPool.length)].id,isNew=!save.state.monsters.some(entry=>entry.speciesId===speciesId);
  const monster=createMonster(speciesId,{nickname:SPECIES[speciesId].name,obtainedMethod:deep?"deepSummon":"summon",obtainedFloor:save.state.player.maxFloor});
  monster.summonRarity=rarity;if(deep)monster.summonTier="深淵";
  save.state.monsters.push(monster);save.state.codex.captures[speciesId]=(save.state.codex.captures[speciesId]??0)+1;save.state.codex.encounters[speciesId]=(save.state.codex.encounters[speciesId]??0)+1;
  return{type:"monster",rarity,displayRarity:deep?"深淵":rarity,name:displayName(monster),icon:SPECIES[speciesId].emoji,speciesId,item:monster,isNew};
 }
 const slot=requestedSlot??["weapon","armor","accessory"][Math.floor(Math.random()*3)],item=createEquipment(slot,{rarity});
 if(deep){item.summonTier="深淵";item.name=`深淵・${item.name}`}
 const isNew=!(save.state.codex.equipment[item.name]??0);
 receiveEquipment(save.state,item);save.state.codex.equipment[item.name]=(save.state.codex.equipment[item.name]??0)+1;
 return{type:"equipment",rarity,displayRarity:deep?"深淵":rarity,name:item.name,icon:{weapon:"⚔️",armor:"🛡️",accessory:"💍"}[slot],item,isNew};
}
function summonEndgameGacha(faction){
 if(faction==="tenGod")return null;
 const pool=Object.values(ENDGAME_BOSSES).filter(boss=>boss.faction===faction),boss=pool[Math.floor(Math.random()*pool.length)],isNew=!save.state.monsters.some(monster=>monster.endgameBossId===boss.id),monster=createMonster(boss.speciesId,{nickname:boss.name,title:boss.title,rank:4,attribute:boss.element??SPECIES[boss.speciesId]?.element,obtainedFloor:save.state.player.maxFloor,obtainedMethod:"guerrillaGacha",endgameBossId:boss.id,endgameFaction:boss.faction,isContractedEndgame:true,allowEndgameLevel:true,tags:[SPECIES[boss.speciesId]?.race,boss.faction,boss.id,"contractedEndgame"].filter(Boolean)});
 monster.endgameBossId=boss.id;monster.endgameFaction=boss.faction;monster.visualSpeciesId=boss.id;monster.isContractedEndgame=true;monster.contractProfileVersion=3;monster.contractSignature=boss.signature;monster.contractSeriesId=boss.seriesId;monster.summonRarity=faction==="tenGod"?"十神":"深淵";monster.currentHp=calculatedStats(monster).hp;monster.currentMp=maxMp(monster);save.state.monsters.push(monster);save.state.codex.captures[monster.speciesId]=(save.state.codex.captures[monster.speciesId]??0)+1;save.state.codex.encounters[monster.speciesId]=(save.state.codex.encounters[monster.speciesId]??0)+1;
 return{type:"monster",rarity:monster.summonRarity,displayRarity:monster.summonRarity,name:boss.name,icon:boss.icon,speciesId:monster.speciesId,item:monster,isNew,endgameBossId:boss.id};
}
function summonExperiencePack(){
 const floor=Math.max(1,Number(save.state.player.maxFloor)||1),available=availableExperiencePackTypes(floor),weights=floor>=1000?{small:30,medium:35,large:25,ultra:10}:floor>=750?{small:45,medium:40,large:15}:floor>=300?{small:70,medium:30}:{small:100};
 const weighted=available.map(type=>[type,weights[type.id]??0]),total=weighted.reduce((sum,[,weight])=>sum+weight,0);let cursor=Math.random()*Math.max(1,total),type=weighted[0]?.[0]??EXPERIENCE_PACK_TYPES.small;
 for(const[entry,weight]of weighted){cursor-=weight;if(cursor<0){type=entry;break}}
 save.state.inventory[type.inventoryKey]=(save.state.inventory[type.inventoryKey]??0)+1;
 const rarity={small:"R",medium:"SR",large:"SSR",ultra:"UR"}[type.id];
 return{type:"experience",rarity,displayRarity:rarity,name:type.name,amount:1,packTier:type.id,inventoryKey:type.inventoryKey,item:{slot:"experience",name:type.name},isNew:false};
}
function summonSignatureGear(){
 const owners=signatureEligibleOwners(save.state);if(!owners.length)return null;
 const owner=owners[Math.floor(Math.random()*owners.length)],ownedPieces=new Set(save.state.equipment.filter(item=>signatureEquipmentOwnerId(item)===owner.ownerId).map(item=>Number(item.ruleOverrides?.signaturePieceIndex)).filter(Number.isInteger)),missing=[0,1,2,3,4,5].filter(index=>!ownedPieces.has(index)),piecePool=missing.length&&Math.random()<.82?missing:[0,1,2,3,4,5],pieceIndex=piecePool[Math.floor(Math.random()*piecePool.length)];
 const item=createSignatureEquipment(owner.ownerId,pieceIndex);if(!item)return null;
 receiveEquipment(save.state,item);save.state.codex.equipment[item.name]=(save.state.codex.equipment[item.name]??0)+1;
 return{type:"equipment",rarity:equipmentDisplayRarity(item),displayRarity:equipmentDisplayRarity(item),name:item.name,icon:"⚔️",item,isNew:!ownedPieces.has(pieceIndex),signatureOwner:owner.ownerName};
}
function summonPermanentSignatureGear(){
 const owners=permanentSignatureOwners();if(!owners.length)return null;
 const owner=owners[Math.floor(Math.random()*owners.length)],ownedPieces=new Set(save.state.equipment.filter(item=>signatureEquipmentOwnerId(item)===owner.ownerId).map(item=>Number(item.ruleOverrides?.signaturePieceIndex)).filter(Number.isInteger)),missing=[0,1,2,3,4,5].filter(index=>!ownedPieces.has(index)),piecePool=missing.length&&Math.random()<.72?missing:[0,1,2,3,4,5],pieceIndex=piecePool[Math.floor(Math.random()*piecePool.length)],item=createSignatureEquipment(owner.ownerId,pieceIndex);if(!item)return null;
 receiveEquipment(save.state,item);save.state.codex.equipment[item.name]=(save.state.codex.equipment[item.name]??0)+1;
 return{type:"equipment",rarity:equipmentDisplayRarity(item),displayRarity:equipmentDisplayRarity(item),name:item.name,icon:"⚔️",item,isNew:!ownedPieces.has(pieceIndex),signatureOwner:owner.ownerName};
}
function openPermanentSignatureGacha(){
 const pool=permanentSignatureOwners(),counts=[1,10],rate=(PERMANENT_SIGNATURE_RATE*100).toFixed(1);if(!pool.length)return showToast("専用装備の対象がありません");
 const poolRows=pool.map(owner=>`<span><b>[${owner.rarity}]</b> ${owner.ownerName}</span>`).join("");
 app.insertAdjacentHTML("beforeend",Modal("常設・専用装備契約",`<div class="gacha-count-picker permanent-signature-picker"><div class="gacha-count-copy"><small>PERMANENT SIGNATURE EQUIPMENT</small><h3>専用装備契約</h3><p>1枠ごとの専用装備当選率はカテゴリ全体で <strong>${rate}%</strong>。外れは通常装備です。</p><p><b>確定枠・天井・10連保証はありません。</b></p></div><div class="gacha-count-grid">${counts.map(count=>`<button type="button" data-permanent-signature-count="${count}"><b>${count}連</b><small>${pixelIcon("crystal")} ${gachaCost(count,"standard").toLocaleString()}</small></button>`).join("")}</div><details class="signature-pool-list"><summary>対象キャラ ${pool.length}体を確認</summary><div>${poolRows}</div></details><small>深淵・十神・シリアル限定の「えなみ／より／りおん／ひで」は排出対象外です。</small></div>`,"戻る"));
 const modal=topModal();modal.classList.add("gacha-count-modal");modal.querySelectorAll("[data-permanent-signature-count]").forEach(button=>button.onclick=()=>performPermanentSignatureGacha(button.dataset.permanentSignatureCount));modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove();
}
function performPermanentSignatureGacha(count=1){
 count=[1,10].includes(Number(count))?Number(count):1;const cost=gachaCost(count,"standard");
 if(save.state.equipment.length+count>500)return showToast(`装備所持枠が不足しています（${save.state.equipment.length}/500）`);
 if((save.state.player.crystals??0)<cost)return showToast(`魔晶石が足りません（必要 ${cost}個）`);
 save.state.player.crystals-=cost;
 const results=Array.from({length:count},()=>rollPermanentSignatureHit()?summonPermanentSignatureGear():summonOne({mode:"equipment",guaranteedEquipment:true}));
 if(results.some(result=>!result)){save.state.player.crystals+=cost;return showToast("召喚対象を準備できませんでした")}
 showSummonResults(results,false,{campaign:"permanent-signature"});
}
function weekdayGachaKindAllowed(kind,schedule=weekdayGachaSchedule()){if(kind==="tenGod")return false;return schedule.kind==="sunday"?schedule.factions.includes(kind):schedule.kind===kind}
function openWeekdayGachaPicker(kind){
 const schedule=weekdayGachaSchedule();if(!weekdayGachaKindAllowed(kind,schedule))return showToast("この曜日の限定召喚は終了しました");
 if(kind==="signature"&&!signatureEligibleOwners(save.state).length)return showToast("LR以上の仲間を所持すると専用装備召喚を利用できます");
 const title=kind==="experience"?"経験値パック召喚":kind==="signature"?"専用装備召喚":"日曜・深淵召喚",counts=[1,10],rateCopy=kind==="abyss"?`<strong>当選率 ${(WEEKDAY_ENDGAME_RATE*100).toFixed(1)}%（深淵カテゴリ全体）</strong><small>外れた場合は通常モンスターが召喚されます。確定・天井はありません。</small>`:"";
 app.insertAdjacentHTML("beforeend",Modal(title,`<div class="gacha-count-picker weekday-gacha-picker"><div class="gacha-count-copy"><small>${schedule.dayName}曜限定</small><h3>${title}</h3><p>${schedule.copy}</p>${rateCopy}</div><div class="gacha-count-grid">${counts.map(count=>`<button type="button" data-weekday-count="${count}"><b>${count}連</b><small>${pixelIcon("crystal")} ${weekdayGachaCost(kind,count).toLocaleString()}</small></button>`).join("")}</div><small>毎日0:00（日本時間）に開催内容が切り替わります。</small></div>`,"戻る"));
 const modal=topModal();modal.classList.add("gacha-count-modal");modal.querySelectorAll("[data-weekday-count]").forEach(button=>button.onclick=()=>performWeekdayGacha(kind,button.dataset.weekdayCount));modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove();
}
function performWeekdayGacha(kind,count=1){
 if(kind==="tenGod")return showToast("十神召喚は廃止されました。欠片契約から入手できます");
 const schedule=weekdayGachaSchedule();if(!weekdayGachaKindAllowed(kind,schedule))return showToast("日付が変わりました。召喚画面を開き直してください");count=Math.max(1,Math.min(10,Math.floor(Number(count)||1)));
 if(kind==="signature"&&!signatureEligibleOwners(save.state).length)return showToast("LR以上の仲間が必要です");
 if(kind==="abyss"&&save.state.monsters.length+count>MONSTER_STORAGE_CAP)return showToast(`モンスター所持枠が不足しています（${save.state.monsters.length}/${MONSTER_STORAGE_CAP}）`);
 if(kind==="signature"&&save.state.equipment.length+count>500)return showToast(`装備所持枠が不足しています（${save.state.equipment.length}/500）`);
 const cost=weekdayGachaCost(kind,count);if((save.state.player.crystals??0)<cost)return showToast(`魔晶石が足りません（必要 ${cost}個）`);save.state.player.crystals-=cost;
 const results=Array.from({length:count},()=>kind==="experience"?summonExperiencePack():kind==="signature"?summonSignatureGear():rollWeekdayEndgameHit()?summonEndgameGacha(kind):summonOne({mode:"monster",guaranteedMonster:true}));if(results.some(result=>!result)){save.state.player.crystals+=cost;return showToast("召喚対象を準備できませんでした")}
 showSummonResults(results,false,{campaign:`weekday-${kind}`});
}
function guerrillaRarityRoll(){const roll=Math.random()*100;if(roll<.12)return"神話";if(roll<.30)return"LR";if(roll<1.10)return"UR";if(roll<5.10)return"SSR";if(roll<18.10)return"SR";if(roll<50.10)return"R";return"N"}
function summonGuerrillaOne({guaranteedRare=false}={}){let rarity=guerrillaRarityRoll();if(guaranteedRare&&(rarity==="N"||rarity==="R"))rarity=rarityRoll("guaranteed");return summonOne({mode:"monster",guaranteedMonster:true,forcedRarity:rarity})}
function summonGoldOne(){const roll=Math.random()*100,amount=roll<.02?99_999_999:roll<.5?10_000_000:roll<3?1_000_000:roll<8?100_000:roll<20?10_000:roll<45?1_000:100,rarity=amount===99_999_999?"神話":amount>=10_000_000?"LR":amount>=1_000_000?"UR":amount>=100_000?"SSR":amount>=10_000?"SR":amount>=1_000?"R":"N";save.state.player.gold=Math.min(Number.MAX_SAFE_INTEGER,(save.state.player.gold??0)+amount);return{type:"gold",rarity,displayRarity:rarity,name:`${amount.toLocaleString()}G`,amount,item:{slot:"gold",name:`${amount.toLocaleString()}G`},isNew:false}}
function rarityGuideHtml(){return`<div class="rarity-guide">${SUMMON_RARITY_INFO.map((r,i)=>{const key=rarityCssClass(r.id);return`<div class="rarity-guide-row rarity-guide-${key}"><span>${i+1}</span><b class="rarity-name-${key}">${r.id}</b><strong class="rarity-name-${key}">${r.name}</strong><small>${r.note}</small></div>`}).join("")}</div><p class="rarity-guide-note">下に行くほど上位です。深淵は毎週日曜にカテゴリ全体0.1%。十神召喚は廃止され、欠片契約のみで入手できます。</p>`}
function openRarityGuide(){app.insertAdjacentHTML("beforeend",Modal("レア度一覧",rarityGuideHtml(),"閉じる"));topModalButton().onclick=closeTopModal}
function normalSummonRateGuideHtml(){
 const rates=[
  ["神話","0.12%","0.20%"],
  ["LR","0.18%","1.80%"],
  ["UR","0.80%","6.00%"],
  ["SSR","4.00%","22.00%"],
  ["SR","13.00%","70.00%"],
  ["R","32.00%","—"],
  ["N","49.90%","—"],
  ["深淵","通常0%／毎週日曜0.10%","外れは通常モンスター"],
  ["十神","全召喚 0%","欠片契約限定"]
 ];
 return`<div class="summon-rate-guide"><div class="summon-rate-head"><span>レア度</span><b>通常枠</b><b>限定・保証枠</b></div>${rates.map(([rarity,normal,guaranteed])=>{const key=rarityCssClass(rarity);return`<div class="summon-rate-row rarity-${key}"><strong class="rarity-name-${key}">${rarity}</strong><span>${normal}</span><span>${guaranteed}</span></div>`}).join("")}<div class="summon-rate-notes"><p><b>単発・10連の通常枠</b>は上記「通常枠」で抽選します。</p><p><b>モンスター召喚／装備召喚</b>は選択した種類が100%排出されます。1日1回無料召喚のみ、モンスター30%・装備70%です。</p><p><b>曜日限定</b>は月・水・金が経験値、火・木・土が専用装備、深淵は毎週日曜です。十神は全召喚から排出されず、欠片契約限定です。</p></div></div>`;
}
function openNormalSummonRates(){app.insertAdjacentHTML("beforeend",Modal("通常召喚・提供割合",normalSummonRateGuideHtml(),"閉じる"));topModalButton().onclick=closeTopModal}
function gachaCampaignSlides(campaigns=currentGachaCampaigns()){
 const daily=save.state.gacha.lastDailyKey!==localDayKey();
 return campaigns.map((campaign,index)=>{
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
 const campaigns=currentGachaCampaigns(),weekday=weekdayGachaSchedule(),tutorialFree=Math.max(0,Number(save.state.gacha?.tutorialFreeSummons)||0);save.save();const weekdayButtons=weekday.kind==="sunday"
  ?weekday.factions.map(kind=>`<button type="button" class="guerrilla-entry active" data-weekday-gacha="${kind}"><span class="gacha-event-mark"></span><b>日曜・深淵召喚</b><small>カテゴリ全体 0.1%・外れは通常モンスター</small><em>${weekdayGachaCost(kind)}個</em></button>`).join("")
  :`<button type="button" class="guerrilla-entry active" data-weekday-gacha="${weekday.kind}"><span class="gacha-event-mark"></span><b>${weekday.title}</b><small>${weekday.copy}</small><em>${weekdayGachaCost(weekday.kind)}個</em></button>`;const body=`<div class="gacha-festival-v3">
  <div class="gacha-v2-wallet"><span>所持魔晶石</span><b>${pixelIcon("crystal")}${save.state.player.crystals.toLocaleString()}</b><button type="button" id="openRarityGuide" class="rarity-help" aria-label="レア度一覧">？</button></div>
  ${tutorialFree?`<button type="button" class="tutorial-free-summon" data-gacha-tutorial-free><b>敗北指南・無料モンスター召喚</b><small>残り ${tutorialFree}回 / 魔晶石消費なし</small></button>`:""}
  <div class="gacha-campaign-carousel" data-gacha-carousel>${gachaCampaignSlides(campaigns)}</div>
  <div class="gacha-carousel-dots">${campaigns.map((_,index)=>`<button type="button" data-gacha-dot="${index}" class="${index===0?"active":""}" aria-label="${index+1}枚目"></button>`).join("")}</div>
  <section class="gacha-category-section"><div class="spread"><h3>召喚を選ぶ</h3><button type="button" id="gachaBannerGuide">提供割合</button></div>
   <button type="button" class="gacha-category-card monster" data-gacha-category="monster"><span class="gacha-category-art monster-art" aria-hidden="true"></span><div><small>MONSTER SUMMON</small><b>モンスター召喚</b><p>仲間だけを召喚。1連・10連・任意回数から選択。</p></div><i>›</i></button>
   <button type="button" class="gacha-category-card equipment" data-gacha-category="equipment"><span class="gacha-category-art equipment-art" aria-hidden="true"></span><div><small>EQUIPMENT SUMMON</small><b>装備召喚</b><p>武器・防具・アクセだけを召喚。</p></div><i>›</i></button>
  </section>
  <section class="gacha-event-list"><h3>常設特別召喚</h3><button type="button" class="guerrilla-entry active" data-permanent-signature><span class="gacha-event-mark signature-mark"></span><b>専用装備契約</b><small>SSR以上の対象キャラ専用装備・総率0.1%・天井なし</small><em>1 / 10連</em></button></section>
  <section class="gacha-event-list"><h3>曜日限定召喚</h3>${weekdayButtons}<div class="weekday-gacha-calendar">${WEEKDAY_GACHA_CALENDAR.map(entry=>`<span><b>${entry.days}</b>${entry.label}</span>`).join("")}</div></section>
  <p class="gacha-v2-note">大量召喚は演出を1回にまとめ、結果を順番に開示します。</p>
 </div>`;
 app.insertAdjacentHTML("beforeend",Modal("召喚の祭壇",body,"閉じる"));
 const modal=topModal();modal.classList.add("gacha-modal-v2");
 const carousel=modal.querySelector("[data-gacha-carousel]"),setDot=index=>modal.querySelectorAll("[data-gacha-dot]").forEach(dot=>dot.classList.toggle("active",Number(dot.dataset.gachaDot)===index));
 modal.querySelectorAll("[data-gacha-dot]").forEach(dot=>dot.onclick=()=>{const index=Number(dot.dataset.gachaDot),slide=carousel.children[index];slide?.scrollIntoView({behavior:"smooth",inline:"start",block:"nearest"});setDot(index)});
 carousel?.addEventListener("scroll",()=>{const width=carousel.clientWidth||1;setDot(Math.max(0,Math.min(campaigns.length-1,Math.round(carousel.scrollLeft/width))))},{passive:true});
 modal.querySelectorAll("[data-gacha-category]").forEach(button=>button.onclick=()=>openGachaCountPicker(button.dataset.gachaCategory,"standard"));
 modal.querySelectorAll("[data-gacha-campaign]").forEach(button=>button.onclick=()=>{const campaign=button.dataset.gachaCampaign;if(campaign==="beginner")return performGachaBatch("monster",10,{campaign:"beginner",cost:0});if(campaign==="event-preview")return;const entry=campaigns.find(row=>row.id===campaign);if(entry?.mode==="weekday")return openWeekdayGachaPicker(entry.weekdayKind);if(entry?.mode==="signaturePermanent")return openPermanentSignatureGacha();openGachaCountPicker(entry?.mode??"mixed",campaign)});
 modal.querySelector("[data-permanent-signature]")?.addEventListener("click",openPermanentSignatureGacha);
 modal.querySelectorAll("[data-weekday-gacha]").forEach(button=>button.onclick=()=>openWeekdayGachaPicker(button.dataset.weekdayGacha));
 modal.querySelector("[data-gacha-daily]")?.addEventListener("click",()=>performGachaBatch("mixed",1,{campaign:"daily",cost:0}));
 modal.querySelector("[data-gacha-tutorial-free]")?.addEventListener("click",()=>performGachaBatch("monster",1,{campaign:"tutorial",cost:0}));
 modal.querySelector("#openRarityGuide")?.addEventListener("click",openRarityGuide);
 modal.querySelector("#gachaBannerGuide")?.addEventListener("click",openNormalSummonRates);
 modal.querySelector("[data-modal-primary]").onclick=closeTopModal;
 requestAnimationFrame(()=>{if(contextGuidePending("starterGacha")&&!contextGuideDone("starter_gacha_pull")){const target=modal.querySelector('[data-gacha-campaign="beginner"]');if(target)showContextGuide({id:"starter_gacha_pull",title:"無料10連を回してみよう",text:"初心者限定「スタートダッシュ召喚」は初回だけ無料。実際に押してみよう。",target,placement:"bottom"})}});
}
function gachaCost(count,campaign="standard"){
 if(campaign==="beginner"||campaign==="daily"||campaign==="tutorial")return 0;
 const base=count===1?5:Math.ceil(count*4.5);
 return premiumCrystalCost(base);
}
function openGachaCountPicker(mode,campaignId="standard"){
 const campaigns=currentGachaCampaigns(),campaign=campaigns.find(entry=>entry.id===campaignId)??campaigns[0],label=mode==="monster"?"モンスター召喚":mode==="equipment"?"装備召喚":campaign.title;
 const counts=[1,10,20,30,50,100];
 app.insertAdjacentHTML("beforeend",Modal(label,`<div class="gacha-count-picker">
  <div class="gacha-count-copy"><small>${campaign.badge}</small><h3>${campaign.title}</h3><p>${campaign.copy}</p></div>
  <div class="gacha-count-grid">${counts.map(count=>`<button type="button" data-gacha-count="${count}"><b>${count}連</b><small>${pixelIcon("crystal")} ${gachaCost(count,campaignId).toLocaleString()}</small></button>`).join("")}</div>
  <label class="gacha-custom-count"><span>その他の回数（1〜100）</span><input id="gachaCustomCount" type="number" inputmode="numeric" min="1" max="100" value="15"><button type="button" data-gacha-custom>この回数で召喚</button></label>
  <small>所持 ${pixelIcon("crystal")} ${save.state.player.crystals.toLocaleString()} / 10連ごとの最後の枠にレア保証を適用</small>
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
 if(campaign==="tutorial"&&(save.state.gacha.tutorialFreeSummons??0)<=0)return showToast("無料チュートリアル召喚は使用済みです");
 const equipmentMode=["equipment","weapon","armor","accessory"].includes(mode),monsterMode=["monster","guerrilla"].includes(mode);
 if(monsterMode&&save.state.monsters.length+count>MONSTER_STORAGE_CAP)return showToast(`モンスター所持枠が不足しています（${save.state.monsters.length}/${MONSTER_STORAGE_CAP}）`);
 if(equipmentMode&&save.state.equipment.length+count>500)return showToast(`装備所持枠が不足しています（${save.state.equipment.length}/500）`);
 const monsterSpace=Math.max(0,MONSTER_STORAGE_CAP-save.state.monsters.length),equipmentSpace=Math.max(0,500-save.state.equipment.length);
 if(mode==="mixed"&&monsterSpace+equipmentSpace<count)return showToast(`所持枠が不足しています（空き ${monsterSpace+equipmentSpace}枠 / 必要 ${count}枠）`);
 if(save.state.player.crystals<cost)return showToast(`魔晶石が足りません（必要 ${cost}個）`);
 save.state.player.crystals-=cost;if(campaign==="beginner")save.state.gacha.firstTenUsed=true;if(campaign==="daily")save.state.gacha.lastDailyKey=localDayKey();if(campaign==="tutorial")save.state.gacha.tutorialFreeSummons=Math.max(0,(save.state.gacha.tutorialFreeSummons??0)-1);
 const results=Array.from({length:count},(_,index)=>{
  const guarantee=(index+1)%10===0;
  if(mode==="guerrilla")return summonGuerrillaOne({guaranteedRare:guarantee});
  if(mode==="gold")return summonGoldOne();
  const effectiveMode=mode==="mixed"
   ?save.state.monsters.length>=MONSTER_STORAGE_CAP?"equipment":save.state.equipment.length>=500?"monster":"mixed"
   :mode;
  const forcedSlot=["weapon","armor","accessory"].includes(effectiveMode)?effectiveMode:null;
  return summonOne({mode:effectiveMode,guaranteedMonster:effectiveMode==="monster",guaranteedEquipment:effectiveMode==="equipment"||Boolean(forcedSlot),equipmentSlot:forcedSlot,guaranteedRare:guarantee});
 });
 if(campaign==="beginner"){
  const guide=contextualGuideState();setGuidePending(guide,"starterGacha",false);completeContextGuide("starter_gacha_pull",{quiet:true});
 }
 showSummonResults(results,false,{campaign});
}
function performGacha(type){
 if(type==="first")return performGachaBatch("monster",10,{campaign:"beginner",cost:0});
 if(type==="daily")return performGachaBatch("mixed",1,{campaign:"daily",cost:0});
 const mode=type.startsWith("monster")?"monster":"equipment",count=type.endsWith("ten")?10:1;performGachaBatch(mode,count,{campaign:"standard"});
}
function openDeepGacha(){if(!hasCleared1000(save.state))return alert("深淵召喚は1000階の支配者撃破後に解放されます");const single=premiumCrystalCost(25),ten=premiumCrystalCost(225),body=`<div class="gacha-head deep"><b>深淵の力を召喚する</b><div class="gacha-head-actions"><span>${pixelIcon("crystal")} ${save.state.player.crystals}</span><button type="button" id="openRarityGuide" class="rarity-help">？</button></div></div><div class="gacha-menu deep-gacha-menu"><button data-deep-gacha="monster-single"><b>${pixelIcon("summon")} 深淵モンスター召喚　${pixelIcon("crystal")} ${single}</b><small>深層モンスターの深淵個体を召喚</small></button><button data-deep-gacha="monster-ten"><b>${pixelIcon("summon")} 深淵モンスター10連　${pixelIcon("crystal")} ${ten}</b><small>10体すべて深淵個体</small></button><button data-deep-gacha="equipment-single"><b>${pixelIcon("equipment")} 深淵装備召喚　${pixelIcon("crystal")} ${single}</b><small>深淵の名を冠するLR装備</small></button><button data-deep-gacha="equipment-ten"><b>${pixelIcon("equipment")} 深淵装備10連　${pixelIcon("crystal")} ${ten}</b><small>10個すべて深淵装備</small></button></div><p class="gacha-footnote">十神は深淵召喚からも排出されません。</p>`;app.insertAdjacentHTML("beforeend",Modal("深淵召喚",body,"閉じる"));document.querySelectorAll("[data-deep-gacha]").forEach(b=>b.onclick=()=>performDeepGacha(b.dataset.deepGacha));document.getElementById("openRarityGuide")?.addEventListener("click",openRarityGuide);topModalButton().onclick=closeTopModal}
function performDeepGacha(type){
 const mode=type.startsWith("monster")?"monster":"equipment",count=type.endsWith("ten")?10:1,cost=premiumCrystalCost(count===10?225:25);
 if(mode==="monster"&&save.state.monsters.length+count>MONSTER_STORAGE_CAP)return showToast(`モンスター所持枠が不足しています（${save.state.monsters.length}/${MONSTER_STORAGE_CAP}）`);
 if(mode==="equipment"&&save.state.equipment.length+count>500)return showToast(`装備所持枠が不足しています（${save.state.equipment.length}/500）`);
 if(save.state.player.crystals<cost)return alert("魔晶石が足りない");
 save.state.player.crystals-=cost;
 const results=Array.from({length:count},()=>summonOne({mode,guaranteedMonster:mode==="monster",guaranteedEquipment:mode==="equipment",deep:true}));
 showSummonResults(results,true);
}
function showSummonResults(results,deep=false,{campaign="standard"}={}){
 const newest=[...results].reverse().find(result=>result.type==="monster")?.item;if(newest)markNewMonsterForGuide(newest);save.save();if(deep)closeTopModal();document.querySelectorAll(".gacha-modal-v2,.gacha-count-modal").forEach(modal=>modal.remove());
 app.insertAdjacentHTML("beforeend",Modal(deep?"深淵召喚結果":"召喚結果",`<div class="gacha-reveal">
  <div class="gacha-reveal-stage"><i></i><span>${deep?"ABYSS":"SUMMON"}</span><b>運命の扉が開く――</b></div>
  <button type="button" class="gacha-reveal-skip" data-gacha-skip>通常演出をSKIP ›</button>
  <div class="gacha-premium-reveal" data-gacha-premium hidden></div>
  <div class="gacha-results gacha-results-sequential" data-gacha-results hidden></div>
  <p class="muted">全${results.length}件・残り 魔晶石 ${save.state.player.crystals.toLocaleString()}</p>
 </div>`,"閉じる"));
 const modal=topModal(),container=modal.querySelector("[data-gacha-results]"),premiumStage=modal.querySelector("[data-gacha-premium]"),stage=modal.querySelector(".gacha-reveal-stage"),skip=modal.querySelector("[data-gacha-skip]"),primary=modal.querySelector("[data-modal-primary]"),dismiss=modal.querySelector("[data-modal-dismiss]");
 const visual=result=>result.type==="monster"?monsterVisual(result.item??result,result.icon,{className:"gacha-result-monster-visual"}):result.type==="gold"?pixelIcon("coin","gacha-result-gold-art"):result.type==="experience"?pixelIcon("present","gacha-result-gold-art"):equipmentVisual(result.item,{className:"gacha-result-equipment-art"});
 const row=(result,index)=>{const rarity=result.displayRarity??result.rarity,key=rarityCssClass(rarity),typeLabel=result.type==="monster"?"魔物":result.type==="gold"?"GOLD":result.type==="experience"?"育成":"装備";return`<article class="gacha-result-card rarity-${key}" style="--reveal-index:${index}"><span>${visual(result)}</span><div><small>${typeLabel} ${String(index+1).padStart(2,"0")}</small><b class="rarity-name-${key}">[${rarity}] ${result.name}</b><em>${result.isNew?"新規":result.type==="equipment"?"重複":"獲得"}</em></div></article>`};
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
  const {result,index}=premium[premiumIndex],rarity=result.displayRarity??result.rarity,key=rarityCssClass(rarity),position=premiumIndex+1,worldClass=rarity==="十神"?"world-law":rarity==="深淵"?"abyss-break":"";if(worldClass)audio.sfx(rarity==="十神"?"divineReveal":"abyssReveal");
  stage.hidden=true;skip.hidden=true;premiumStage.hidden=false;
  premiumStage.innerHTML=`<article class="gacha-premium-card rarity-${key} ${worldClass}" data-gacha-premium-next tabindex="0">
   <div class="gacha-premium-aura" aria-hidden="true"></div><div class="gacha-ultimate-flash" aria-hidden="true"></div><small>${worldClass?rarity==="十神"?"世界法則、降臨":"深淵からの応答":"SSR以上"} ${position}/${premium.length}</small>
   <span class="gacha-premium-visual">${visual(result)}</span>
   <em>${result.isNew?"新規獲得":"重複"}</em><b class="rarity-name-${key}">[${rarity}]</b><h3>${result.name}</h3>
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
 const returnToSummonTop=()=>{if(!completed)return;modal.remove();document.querySelectorAll(".gacha-modal-v2,.gacha-count-modal").forEach(entry=>entry.remove());if(campaign==="beginner")return go("home");openGacha();requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"auto"}))};
 primary.onclick=returnToSummonTop;dismiss.onclick=returnToSummonTop;
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
function openEquipmentCodexDetail(name){const all=[...save.state.equipment,...save.state.reserveEquipment,...save.state.bossEquipmentVault],items=all.filter(i=>i.name===name);if(!items.length)return;const best=[...items].sort((a,b)=>(RARITY_ORDER[equipmentDisplayRarity(b)]??0)-(RARITY_ORDER[equipmentDisplayRarity(a)]??0)||(b.plus??0)-(a.plus??0))[0],displayRarity=equipmentDisplayRarity(best),stats=Object.entries(best.stats??{}).map(([k,v])=>`<span>${equipmentStatLabel(k)} +${v}</span>`).join("");app.insertAdjacentHTML("beforeend",Modal(name,`<div class="codex-detail"><div class="equipment-codex-hero">${equipmentVisual(best,{className:"equipment-codex-art"})}<p><b>[${codexVisibleRarity(displayRarity)}] ${slotLabel(best.slot)}</b></p></div><div class="detail-stat-grid">${stats||"<span>能力補正なし</span>"}</div><div class="codex-info-list"><p><b>所持数</b>${items.length}</p><p><b>最高強化</b>+${Math.max(...items.map(i=>i.plus??0))}</p><p><b>シリーズ</b>${best.series??"なし"}</p><p><b>装備規則</b>${best.slot==="weapon"?"右手・左手どちらでも装備可能":"通常"}</p></div></div>`,"図鑑へ戻る"));topModalButton().onclick=closeTopModal}
function openCodex(type){if(type==="monster"){const owned=new Set(save.state.monsters.map(m=>m.speciesId)),sorted=orderedMonsterSpecies(SPECIES),rows=sorted.map((sp,i)=>{const seen=(save.state.codex.encounters[sp.id]??0)>0||owned.has(sp.id),captured=save.state.codex.captures[sp.id]??save.state.monsters.filter(m=>m.speciesId===sp.id).length,rarity=seen?codexVisibleRarity(sp.rarity):"";return`<button class="codex-row ${seen?"":"unknown"}" data-codex-monster="${sp.id}" data-codex-index="${i}" data-codex-seen="${seen?1:0}"><span>${seen?monsterVisual(sp.id,sp.emoji,{className:"codex-row-monster-visual"}):"❔"}</span><b>No.${String(i+1).padStart(3,"0")} ${seen?sp.name:"？？？？？"}</b><small>${seen?`${rarity} / ${elementLabel(sp.element)} / 遭遇 ${save.state.codex.encounters[sp.id]??0} / 捕獲 ${captured}`:"未遭遇"}</small></button>`}).join("");app.insertAdjacentHTML("beforeend",Modal("魔物図鑑",`<div class="codex-summary">発見 ${sorted.filter(sp=>(save.state.codex.encounters[sp.id]??0)>0||owned.has(sp.id)).length} / ${sorted.length}</div><div class="codex-list">${rows}</div>`,"閉じる"));const modal=topModal();modal.querySelectorAll("[data-codex-monster]").forEach(b=>b.onclick=()=>openMonsterCodexDetail(b.dataset.codexMonster,b.dataset.codexSeen==="1",Number(b.dataset.codexIndex)))}else{const all=[...save.state.equipment,...save.state.reserveEquipment,...save.state.bossEquipmentVault],names=[...new Set(all.map(i=>i.name))],rows=names.length?names.map(name=>{const items=all.filter(i=>i.name===name),best=[...items].sort((a,b)=>(RARITY_ORDER[equipmentDisplayRarity(b)]??0)-(RARITY_ORDER[equipmentDisplayRarity(a)]??0))[0],displayRarity=equipmentDisplayRarity(best);return`<button class="codex-row" data-codex-equipment="${name.replaceAll('"','&quot;')}"><span>${equipmentVisual(best,{className:"equipment-codex-row-art"})}</span><b>[${codexVisibleRarity(displayRarity)}] ${name}</b><small>${slotLabel(best.slot)} / 所持 ${items.length}</small></button>`}).join(""):'<div class="empty">まだ装備を発見していません</div>';app.insertAdjacentHTML("beforeend",Modal("装備図鑑",`<div class="codex-summary">発見 ${names.length}種</div><div class="codex-list">${rows}</div>`,"閉じる"));const modal=topModal();modal.querySelectorAll("[data-codex-equipment]").forEach(b=>b.onclick=()=>openEquipmentCodexDetail(b.dataset.codexEquipment))}topModalButton().onclick=closeTopModal}
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
 modal.querySelector("#executeEquipmentEnhancement")?.addEventListener("click",()=>{const ids=[...selectedMaterials];if(!ids.length)return;const materials=ids.map(mid=>save.state.equipment.find(i=>i.id===mid)).filter(Boolean),total=materials.reduce((sum,m)=>sum+equipmentMaterialExp(m,item),0);if(!confirm(`${materials.length}個を素材にしますか？\n獲得EXP ${total.toLocaleString()}\n育成済みEXPは100%引き継がれます。`))return;const beforeOwner=item.equippedBy?save.state.monsters.find(m=>m.id===item.equippedBy):null,beforeStats=beforeOwner?calculatedStats(beforeOwner):null,beforeMp=beforeOwner?maxMp(beforeOwner):null,result=consumeEquipmentMaterials(save.state,item.id,ids);if(!result.ok)return alert(result.message);if(beforeOwner)preserveVitals(beforeOwner,beforeStats,beforeMp);completeContextGuide("equipment_enhance",{quiet:true});save.save();modal.remove();showToast(result.gained?`${item.name} Lv.${item.level}へ！`:`${result.amount.toLocaleString()} EXP獲得`);render();openEquipmentEnhancement(item.id)});
 modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove();refreshPreview();
}
function bulkSellEquipment(){const targets=save.state.equipment.filter(i=>!i.equippedBy&&!i.locked&&!i.favorite&&!i.ruleOverrides?.unsellable&&["N","R"].includes(i.rarity));if(!targets.length)return alert("売却対象がありません");const total=targets.reduce((n,i)=>n+equipmentSellPrice(i,save.state),0);if(!confirm(`${targets.length}個を一括売却して ${total}G獲得する？`))return;const ids=new Set(targets.map(i=>i.id));save.state.equipment=save.state.equipment.filter(i=>!ids.has(i.id));save.state.player.gold+=total;save.save();render()}
function releaseMonster(m){if(save.state.party.includes(m.id))return alert("出撃中のモンスターは解放できません");if(m.favorite||m.locked)return alert("お気に入り・ロック中は解放できません");if(save.state.monsters.length<=1)return alert("最後の1体は解放できません");if(!confirm(`${displayName(m)}を解放する？\n魂として魔晶石1個を獲得します。`))return;Object.values(m.equipment??{}).forEach(id=>{const i=save.state.equipment.find(x=>x.id===id);if(i)i.equippedBy=null});save.state.monsters=save.state.monsters.filter(x=>x.id!==m.id);save.state.player.crystals++;save.save();go("monsters")}
function attributeSynergyFor(elements=[]){
 const counts={};elements.filter(Boolean).forEach(element=>{const key=canonicalAttribute(element,element);counts[key]=(counts[key]??0)+1});const [element,count]=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]??[null,0];if(count<2)return null;
 const rate=count>=4?.28:count===3?.16:.08,names=Object.fromEntries(Object.entries(ATTRIBUTES).map(([id,row])=>[id,row.name])),effects={neutral:{atk:rate*.7,def:rate*.7,hp:rate*.7},fire:{atk:rate},water:{def:rate,hp:rate*.7},ice:{def:rate,spd:rate*.35},lightning:{spd:rate,crit:count>=4?18:count===3?10:5},earth:{def:rate,hp:rate},wind:{spd:rate,evasion:count>=4?14:count===3?8:4},light:{def:rate*.75,hp:rate*.75},dark:{atk:rate*.8,crit:count>=4?16:count===3?9:4}};
 return{element,count,name:`${names[element]??element}属性効果`,full:count>=4,...(effects[element]??{atk:rate*.6,def:rate*.6})};
}
function partySynergy(){const party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);return attributeSynergyFor(party.map(m=>m.attribute??SPECIES[m.speciesId]?.element??"neutral"))}
function clearPartySynergy(){save.state.monsters.forEach(m=>delete m._synergy)}
function normalizedElement(element){return canonicalAttribute(element,element)}
function battleBiomeForFloor(floor){
 return battleEnvironmentForFloor(floor);
}
function biomeElementMultiplier(environment,element){
 if(!environment)return 1;const key=normalizedElement(element);
 if(environment.favorable.includes(key))return environment.boost;
 if(environment.adverse.includes(key))return environment.penalty;
 return 1;
}
function applyEnemyMultiplier(enemy,multiplier){
 if(!enemy||multiplier===1)return enemy;
 for(const key of["maxHp","atk","matk","def","mdef"])enemy[key]=Math.max(1,Math.round((enemy[key]??1)*multiplier));
 enemy.spd=Math.max(1,Math.round((enemy.spd??1)*(multiplier>1?1+(multiplier-1)*.55:1-(1-multiplier)*.45)));
 enemy.hp=enemy.maxHp;return enemy;
}
async function runSecretRoomAuto(){
 if(secretRoomAutoRunning||!exploreAutoActive()||screen!=="shop")return;
 secretRoomAutoRunning=true;
 const mode=exploreAutoMode(),room=activeSecretRoom(save.state),notes=[];
 try{
  if(room&&!room.rested){const rest=useSecretRoomInn(save.state);if(rest.ok)notes.push(`無料休憩：HP/MPを完全回復`)}
  if(mode==="items"){
   for(const offer of(room?.offers??[]).filter(isDarkMarketBargain)){
    if(offer.price>save.state.player.gold)continue;
    const result=buyDarkMarketOffer(save.state,offer.id);
    if(result.ok)notes.push(`異常特価：${result.offer.name}を購入`);
    else if(/満杯|所持数/.test(result.message)){save.save();stopExploreAuto(`AUTO停止：${result.message}`);showToast(result.message);return}
   }
   if(room&&!room.casino?.used&&save.state.player.crystals>=CASINO_CRYSTAL_COST&&save.state.player.gold>=2){
    const bet=Math.max(1,Math.floor(save.state.player.gold/2)),casino=spinSecretRoomCasino(save.state,bet);
    if(casino.ok)notes.push(`深淵スロット：${bet.toLocaleString()}G → ${casino.multiplier}倍`)
   }
  }
  save.save();
  if(notes.length)showToast(`AUTO｜${notes.join(" / ")}`);else showToast("AUTO｜無料休憩後、探索を続行");
  await wait(520);
 }finally{
  secretRoomAutoRunning=false;
  if(save.state.player.inRun&&screen==="shop"){screen="explore";render()}
 }
}
function bindShop(){
 document.getElementById("leaveShop").onclick=()=>go("explore");
 document.querySelectorAll("[data-shop-menu]").forEach(b=>b.onclick=()=>openShopMenu(b.dataset.shopMenu));
 if(exploreAutoActive())requestAnimationFrame(runSecretRoomAuto);
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
 const offerRows=offers.map(offer=>{const rarity=String(offer.rarity??"SR"),rarityClass=({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity).toLowerCase(),grade=offer.mystery&&!offer.revealed?"未鑑定":offer.powerLabel??"出所不明",hidden=offer.mystery&&!offer.revealed,showMonster=offer.kind==="monster"&&offer.payload&&!hidden,species=showMonster?SPECIES[offer.payload.speciesId]:null,icon=showMonster?monsterVisual(offer.payload,species?.emoji??offer.icon,{className:"market-list-monster-visual"}):offer.kind==="equipment"&&offer.payload&&!hidden?equipmentVisual(offer.payload,{className:"market-list-equipment-visual"}):offer.icon;return`<article class="dark-market-offer rarity-name-${rarityClass} ${offer.sold?"sold":""} ${offer.priceTone} grade-${offer.powerGrade??"standard"}"><span>${icon}</span><div><small>${offer.kind==="monster"?"MONSTER":"EQUIPMENT"}・${rarity}・${grade}</small><b>${offer.name}</b><p>${offer.description}</p><em class="market-price-label">${offer.priceLabel}</em></div><div class="dark-market-offer-actions"><button type="button" data-market-detail="${offer.id}">詳細</button><button type="button" data-market-offer="${offer.id}" ${offer.sold?"disabled":""}>${offer.sold?"売切":`${offer.price.toLocaleString()}G`}</button></div></article>`}).join("");
 const recoveryRows=SECRET_ROOM_RECOVERY_ITEMS.map(item=>{const purchased=room?.recoveryPurchased?.[item.id]??0,remaining=Math.max(0,DARK_MARKET_ITEM_LIMIT-purchased);return`<article class="dark-market-recovery"><span>${item.icon}</span><div><b>${item.name}</b><small>${item.description}<br>所持 ${save.state.inventory[item.id]??0}</small></div><button data-market-recovery="${item.id}" ${remaining?"":"disabled"}>${remaining?`${item.price}G`:"完売"}<small>${purchased}/${DARK_MARKET_ITEM_LIMIT}</small></button></article>`}).join("");
 return`<div class="dark-market"><div class="dark-market-wallet">所持 <b>${save.state.player.gold.toLocaleString()}G</b></div><small class="muted">装備・モンスターは各1点限り。価格は相応から法外まで変動し、極稀に異常特価が紛れます。</small><h3>一点物</h3><div class="dark-market-offers">${offerRows}</div><h3>激安回復用品</h3><div class="dark-market-recovery-list">${recoveryRows}</div></div>`;
}
function darkMarketOfferDetail(offer){
 if(offer.mystery&&!offer.revealed)return`<div class="market-mystery-detail"><span>❔</span><h3>${offer.name}</h3><p>商人すら鑑定していない一点物。種類と中身は購入した瞬間に判明します。</p><small>${offer.kind==="monster"?"モンスター契約":"装備"} / 表示ランク ${offer.rarity} / 返品不可</small></div>`;
 const payload=offer.payload;if(!payload)return`<div class="empty">売却済みの商品です。</div>`;
 if(offer.kind==="equipment"){
  const multiplier=equipmentStatMultiplier(payload),stats=Object.entries(payload.stats??{}).map(([key,value])=>`<span><small>${equipmentStatLabel(key)}</small><b>+${Math.round(value*multiplier)}</b></span>`).join("");
  const affixes=(payload.affixes??[]).map(affix=>`<p><i style="background:${affixQuality(affix).color}"></i><b>${formatAffix(affix)}</b><small>${affixQuality(affix).name}</small></p>`).join("")||'<p class="muted">ランダムオプションなし</p>';
  return`<div class="market-item-detail"><div class="market-detail-hero"><span>${equipmentVisual(payload,{className:"market-detail-equipment-visual"})}</span><div><small>${offer.rarity}・${offer.powerLabel??"出所不明"}</small><h3>${payload.name}${payload.plus?` +${payload.plus}`:""}</h3><p>${slotLabel(payload.slot)}・Lv.${payload.level??1}</p></div></div><div class="market-detail-stats">${stats}</div><div class="market-detail-affixes">${affixes}</div></div>`;
 }
 const species=SPECIES[payload.speciesId]??{},stats=calculatedStats(payload),skills=(payload.equippedSkills?.map(skillById).filter(Boolean)??allLearnedSkills(payload).slice(-4));
 const skillRows=skills.map(skill=>{const progress=payload.skillProgress?.[skill.id];return`<p><b>${skill.name}</b><small>${skill.tag??skill.type}${progress?`・熟練Lv.${progress.level}`:""}</small></p>`}).join("")||'<p class="muted">スキル情報なし</p>';
 return`<div class="market-item-detail"><div class="market-detail-hero"><span>${monsterVisual(payload,species.emoji??offer.icon,{className:"market-monster-visual"})}</span><div><small>${offer.rarity}・${offer.powerLabel??"階層相応"}</small><h3>${displayName(payload)}</h3><p>Lv.${payload.level}・+${payload.plus??0}・❤️${payload.affection??0}</p></div></div><div class="market-detail-stats"><span><small>HP</small><b>${stats.hp}</b></span><span><small>ATK</small><b>${stats.atk}</b></span><span><small>DEF</small><b>${stats.def}</b></span><span><small>SPD</small><b>${stats.spd}</b></span></div><div class="market-detail-skills"><h4>設定スキル</h4>${skillRows}</div></div>`;
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
 if(options.scaleToFloor!==false&&(Number(item.level)||1)<=1&&!item.endgameBossId&&!item.ruleOverrides?.fixedLevel){
  const floor=Math.max(1,Number(options.floor)||Number(save.state.player.currentFloor)||1);
  item.level=equipmentDropLevelForFloor(floor,{elite:Boolean(options.elite),boss:Boolean(options.bossReward)});
  item.obtainedFloor=floor;item.obtainedMethod=item.obtainedMethod??"explorationDrop";
 }
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
 if(game?.online&&Array.isArray(world.decorations))return world.decorations;
 const floor=save.state.player.currentFloor,seed=(floorSeed(floor)^0x5f3759df)>>>0;
 return populateExploreDecorations(world,floor,seeded(seed))
}
function ensureFirstTutorialPickup(world){
 if(!world||save.state.player.currentFloor!==1||contextGuideDone("explore_pickup"))return null;
 const decorations=ensureExploreDecorations(world),existing=decorations.find(entry=>entry.tutorialGuide==="firstPickup"||entry.id==="1-guide-first-pickup");if(existing)return existing;
 const origin=world.start??{x:1,y:1},occupied=new Set([...(world.chests??[]),world.exit,world.shop,world.boss,...decorations].filter(Boolean).map(entry=>`${entry.x}:${entry.y}`));
 const cells=[];for(let y=1;y<world.rows-1;y++)for(let x=1;x<world.cols-1;x++)if(!world.tiles[y]?.[x]&&!occupied.has(`${x}:${y}`)&&(x!==origin.x||y!==origin.y))cells.push({x,y,distance:Math.abs(x-origin.x)+Math.abs(y-origin.y)});
 const cell=cells.sort((left,right)=>left.distance-right.distance)[0];if(!cell)return null;
 const pickup={id:"1-guide-first-pickup",x:cell.x,y:cell.y,type:"crystal",rotation:0,scale:1.15,phase:199,used:false,destroyed:false,tutorialGuide:"firstPickup"};decorations.push(pickup);world.decorations=decorations;return pickup
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
  deltaLabel.textContent=`${delta>0?"+":"-"}${formatCombatPower(Math.abs(delta))}`;
  hud.classList.add(delta>0?"power-up":"power-down");
 }
 if(start===target){value.textContent=formatCombatPower(target);return}
 const started=performance.now(),duration=650;
 const step=now=>{
  if(!value.isConnected)return;
  const progress=Math.min(1,(now-started)/duration),eased=1-Math.pow(1-progress,3);
  value.textContent=formatCombatPower(Math.round(start+(target-start)*eased));
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
 const guide=contextualGuideState();bumpGuideCounter(guide,"returns");if(!contextGuideDone("first_return")){completeGuideStep(guide,"first_return");if(save.state.gacha?.firstTenUsed){completeGuideStep(guide,"starter_gacha_open");completeGuideStep(guide,"starter_gacha_pull")}else setGuidePending(guide,"starterGacha",true);save.save()}
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
 stopExploreAuto();
 cancelPendingExploreActions();
 game.paused=true;app.insertAdjacentHTML("beforeend",Modal("帰還する",returnConfirmationBody(),"帰還して報酬を受け取る"));
 const modal=topModal();modal.classList.add("return-confirm-modal-v2");
 let settled=false;
 const cancel=()=>{if(settled)return;settled=true;modal?.remove();if(game)game.paused=false};
 modal._onDismiss=cancel;modal.querySelector("[data-return-cancel]")?.addEventListener("click",cancel);
 const primary=modal.querySelector("[data-modal-primary]");
 primary.onclick=()=>{
  if(settled)return;settled=true;primary.disabled=true;modal.querySelectorAll("button").forEach(button=>button.disabled=true);
  // inRunを先に落とし、予約済み遭遇の世代も破棄してから精算する。
  save.state.player.inRun=false;cancelPendingExploreActions();stopGame();activeEnemy=null;battle=null;delete save.state.activeBattle;snapshot=null;clearExpeditionSnapshot();const result=claimManualReturn(save.state);delete save.state.expeditionAffectionDeaths;save.save();modal.remove();showManualReturnResult(result);
 };
}
function bindExplore(){
 ensureSecretRoomExpedition(save.state);recordBiomeFloor(save.state,save.state.player.currentFloor);save.save();
 explorationTexture("floor");explorationTexture("wall");explorationTexture("stairs");explorationTexture("props");
 if(save.state.player.currentFloor>1000&&!save.state.flags.secondWorldEntered){markSecondWorldEntered(save.state);save.save()}
 animateExploreCombatPower();
 const canvas=document.getElementById("gameCanvas"),r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
 canvas.width=r.width*d;canvas.height=r.height*d;
 const mini=document.getElementById("miniMap");mini.width=132*d;mini.height=132*d;
 if(!snapshot)snapshot=hydrateExpeditionSnapshot(save.state.expeditionSnapshot);
 game=snapshot??{world:maze(),player:null,camera:null,paused:false,running:true,input:createInputState()};
 ensureExploreDecorations(game.world);ensureFirstTutorialPickup(game.world);
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
 bindMovableMapToggle();bindExploreMonsterLongPress();if(save.state.settings.exploreAutoMode!=="off")requestAnimationFrame(applyExploreAutoPath);requestAnimationFrame(scheduleContextGuide);if(game.world.treasureRoom&&!game.world.treasureNoticeShown){game.world.treasureNoticeShown=true;game.paused=true;setTimeout(()=>{pauseModal("💰 宝物庫を発見",`<p>部屋中に宝箱が並んでいる。</p><p class="muted">約半数は強力なミミック。鍵付きの箱には高レア装備が眠る。</p>`);},420)}
 document.getElementById("toggleExplorePartyHud")?.addEventListener("click",()=>{save.state.settings.explorePartyHudCollapsed=!save.state.settings.explorePartyHudCollapsed;save.save();snapshot=currentSnapshot();stopGame();render()});
 document.querySelectorAll("[data-explore-auto-mode]").forEach(button=>button.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();const mode=button.dataset.exploreAutoMode,controller=button.closest(".explore-auto-controller");save.state.settings.exploreAutoMode=mode;save.state.settings.exploreAutoMenuOpen=false;if(controller){controller.open=false;controller.querySelector("summary")?.setAttribute("aria-expanded","false")}save.save();if(game){game.player.path=[];game.player.p=0;if(mode!=="off")applyExploreAutoPath()}showToast(mode==="off"?"AUTO 停止":`AUTO｜${({floor:"階層攻略",items:"回収優先",exp:"経験値優先"})[mode]}`)}));
 document.getElementById("centerCamera").onclick=()=>{game.camera.reset(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world);queueExpeditionCheckpoint()};
 document.getElementById("pauseParty").onclick=()=>{snapshot=currentSnapshot();stopGame();formationOrigin="explore";go("formation")};
 document.getElementById("resourceHelp")?.addEventListener("click",openResourceHelp);
 document.querySelectorAll("[data-resource-help]").forEach(b=>b.addEventListener("click",openResourceHelp));
 document.getElementById("fieldEquipment").onclick=()=>{snapshot=currentSnapshot();stopGame();navigationOrigin="explore";go("equipment")};
 document.getElementById("pauseItems").onclick=openFieldItems;
 document.getElementById("returnHome").onclick=openManualReturnConfirmation;
}

function nearestAutoTarget(candidates){
 if(!candidates.length||!game?.player)return null;
 return candidates.map(target=>({target,route:path(game.world,game.player,target)})).filter(entry=>entry.route?.length).sort((a,b)=>a.route.length-b.route.length)[0]??null;
}
function applyExploreAutoPath(){
 if(!game?.running||game.paused||game.world.encountering||save.state.settings.exploreAutoMode==="off"||game.player.path?.length)return;
 const mode=save.state.settings.exploreAutoMode,targets=[];
 if(mode==="items"){
  (game.world.chests??[]).filter(entry=>!entry.open&&!entry.autoSkipped).forEach(entry=>targets.push(entry));
  ensureExploreDecorations(game.world).filter(entry=>!entry.destroyed&&!entry.used&&EXPLORE_INTERACTIVE_DECORATIONS.has(entry.type)).forEach(entry=>targets.push(entry));
  // A secret room is resolved once per visit.  Without this guard the AUTO
  // controller returns from the shop on the same tile, finds a zero-length
  // route back to that shop, and incorrectly stops instead of heading onward.
  if(game.world.shop&&!game.world.shop.autoVisited)targets.push(game.world.shop);
 }
 if(mode==="exp"){
  const open=[];for(let y=1;y<game.world.rows-1;y++)for(let x=1;x<game.world.cols-1;x++)if(!game.world.tiles[y][x]&&Math.abs(x-game.player.x)+Math.abs(y-game.player.y)>8)open.push({x,y});
  open.sort((a,b)=>(Math.abs(b.x-game.player.x)+Math.abs(b.y-game.player.y))-(Math.abs(a.x-game.player.x)+Math.abs(a.y-game.player.y)));targets.push(...open.slice(0,18));
 }
 if(!targets.length)targets.push(game.world.boss?.active?game.world.boss:game.world.exit);
 const best=nearestAutoTarget(targets.filter(Boolean));if(best)game.player.setPath(best.route);else stopExploreAuto("AUTO停止：到達できる進路がありません")
}
function stopExploreAuto(reason=""){
 if(save.state.settings?.exploreAutoMode==="off")return;
 save.state.settings.exploreAutoMode="off";save.save();if(reason)showExploreNotice(reason);
}
function openResourceHelp(){
 const body=`<div class="dungeon-guide">
  <section><h3>探索の基本</h3><p>床をタップすると部隊が移動します。先頭の魔物に仲間が追従し、歩数に応じて敵と遭遇します。</p><p>階段へ到達すると次の階へ進みます。10階ごとの支配者を倒すまでは、その階の階段は封鎖されます。</p></section>
  <section><h3>明かりと発見</h3><p>暗所は部隊の周囲と燭台の灯りで確認できます。階段と燭台は遠くからでも見失わないよう表示されます。</p><p>樽・木箱・骨・魔晶石・水場は触れると調べられます。一度採取した物は、同じ探索中に再読込しても復活しません。</p></section>
  <section><h3>🚪 秘密の入口</h3><p>壁に設けられた入口だけが秘密の裏街へ通じます。見つけた入口には必ず入れますが、探索ごとに出現する階と場所が変わります。</p></section>
  <section><h3>地図と帰還</h3><p>ミニマップボタンと開いた地図は、長押しせずそのままドラッグして好きな位置へ移動できます。</p><p>帰還すると探索中のGOLD・装備などを確定します。帰還前にホームへ直接移動することはできません。</p></section>
  ${attributeHelpSection()}
  <section class="resource-help-list"><h3>資源</h3><p><b>${pixelIcon("coin")} GOLD</b><span>ショップ・装備・育成に使用</span></p><p><b>${pixelIcon("crystal")} 魔晶石</b><span>召喚・戦闘の記憶などに使用</span></p><p><b>${pixelIcon("capture")} 捕獲結晶</b><span>弱らせた魔物の捕獲に使用</span></p><p><b>${pixelIcon("key")} 深淵の鍵</b><span>鍵付き宝箱に使用</span></p></section>
 </div>`;
 app.insertAdjacentHTML("beforeend",Modal("ダンジョン案内",body,"閉じる"));
 topModalButton().onclick=closeTopModal;
}
function attributeHelpSection(){const rows=attributeGuideRows().map(row=>`<p><b>${attributeVisual(row.id,{label:`${ATTRIBUTES[row.id]?.name??row.name}属性`})}${ATTRIBUTES[row.id]?.name??row.name}</b><span><em>有利 ${row.strong.join("・")||"なし"}</em><i>不利 ${row.weak.join("・")||"なし"}</i></span></p>`).join("");return`<section class="attribute-help"><h3>属性相性</h3><small>有利属性の攻撃は1.25倍、不利属性は0.8倍。光と闇は互いに大ダメージです。</small><div>${rows}</div></section>`}
function openAttributeHelp(){app.insertAdjacentHTML("beforeend",Modal("属性相性",`<div class="dungeon-guide">${attributeHelpSection()}</div>`,"閉じる"));topModalButton().onclick=closeTopModal}
function openTutorialBook(){
 const guide=contextualGuideState(),progress=contextualGuideProgress(guide),rows=CONTEXT_GUIDE_STEPS.map(step=>`<p class="${guideStepDone(guide,step.id)?"done":""}"><small>${step.group}</small><span>${step.label}</span><em>${guideStepDone(guide,step.id)?"完了":"未完了"}</em></p>`).join("");
 app.insertAdjacentHTML("beforeend",Modal("実践ガイド",`<div class="context-guide-book"><div class="context-guide-summary"><strong>${progress.rate}%</strong><div><b>${progress.completed}/${progress.total} 完了</b><span><i style="width:${progress.rate}%"></i></span><small>${guide.disabled?"自動案内は停止中":"初めての操作だけ、1つずつ案内します"}</small></div></div><div class="context-guide-book-actions"><button type="button" class="primary" data-context-guide-toggle>${guide.disabled?"自動案内を再開":"自動案内を停止"}</button><button type="button" data-context-guide-reset>最初からやり直す</button></div><div class="context-guide-step-list">${rows}</div></div>`,`閉じる`));
 const modal=topModal();modal.querySelector("[data-context-guide-toggle]")?.addEventListener("click",()=>{guide.disabled=!guide.disabled;guide.updatedAt=new Date().toISOString();save.save();modal.remove();clearContextGuide();showToast(guide.disabled?"実践ガイドを停止しました":"実践ガイドを再開しました");render()});modal.querySelector("[data-context-guide-reset]")?.addEventListener("click",()=>{if(!confirm("実践ガイドの進行をすべて未完了へ戻しますか？\nゲームのセーブや所持品は変わりません。"))return;resetContextualGuide(guide,save.state.monsters?.length??1);save.save();modal.remove();showToast("実践ガイドを最初から再開します");render()});modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove()
}
function exploreMonsterDetail(id){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const sp=SPECIES[m.speciesId],st=calculatedStats(m),need=expNeed(m),remain=Math.max(0,need-m.exp),gear=Object.entries(m.equipment??{}).map(([slot,itemId])=>`${slotLabel(slot)}：${save.state.equipment.find(i=>i.id===itemId)?.name??"なし"}`).join("<br>");app.insertAdjacentHTML("beforeend",Modal(displayName(m),`<div class="explore-detail"><div class="modal-monster-hero">${monsterVisual(m,sp.emoji??"👹",{className:"modal-monster-visual"})}<p><b>Lv.${m.level}　+${m.plus}</b></p></div><p>HP ${m.currentHp??st.hp}/${st.hp}<br>MP ${m.currentMp??maxMp(m)}/${maxMp(m)}<br>ATK ${st.atk} / DEF ${st.def} / SPD ${st.spd}<br>会心 ${st.crit}% / 回避 ${st.evasion}%<br><b>${sp.race}族 / ${sp.role}</b><br>特性：${TRAITS[m.traitId]?.name??"安定"}（${TRAITS[m.traitId]?.description??""}）</p><p><b>EXP ${m.exp.toLocaleString()} / ${need.toLocaleString()}</b><br><small>次のレベルまであと ${remain.toLocaleString()}</small></p><p>${gear}</p><p><b>スキル</b><br>${learnedSkills(m).map(x=>`${x.name}（MP${x.mp}）`).join("<br>")||"なし"}</p></div>`,`閉じる`));topModalButton().onclick=()=>{const mods=document.querySelectorAll(".game-modal");mods[mods.length-1]?.remove()}}
function bindExploreMonsterLongPress(){document.querySelectorAll("[data-explore-monster]").forEach(el=>el.onclick=()=>{
 const id=el.dataset.exploreMonster;if(!save.state.monsters.some(monster=>monster.id===id))return;
 snapshot=currentSnapshot();stopGame();equipmentTarget=id;equipmentFocusItemId=null;navigationOrigin="explore";go("equipment");
})}
function bindMovableMapToggle(){
 const button=document.getElementById("miniMapToggle"),map=document.getElementById("miniMap"),auto=document.querySelector(".explore-auto-controller");if(!button||!map)return;
 const stage=button.closest(".explore-stage");if(!stage)return;
 stage.append(button,map);if(auto)stage.append(auto);
 const clampPosition=(element,position,fallback)=>{
  const stageRect=stage.getBoundingClientRect(),rect=element.getBoundingClientRect(),source=position&&Number.isFinite(position.x)&&Number.isFinite(position.y)?position:fallback,safeX=10,safeTop=10,safeBottom=14;
  return{x:Math.max(safeX,Math.min(stageRect.width-rect.width-safeX,source.x)),y:Math.max(safeTop,Math.min(stageRect.height-rect.height-safeBottom,source.y))};
 };
 const place=(element,position,fallback)=>{const next=clampPosition(element,position,fallback);element.style.setProperty("left",`${next.x}px`,"important");element.style.setProperty("top",`${next.y}px`,"important");element.style.setProperty("right","auto","important");element.style.setProperty("bottom","auto","important");element.style.setProperty("transform","none","important");return next};
 const bindDrag=(element,settingKey,fallback,{onTap=null,handle=null}={})=>{
  let suppressClick=false;
  requestAnimationFrame(()=>place(element,save.state.settings[settingKey],fallback));
  element.addEventListener("pointerdown",event=>{
   if(event.button!=null&&event.button!==0)return;
   if(handle&&!event.target.closest(handle))return;
   event.preventDefault();event.stopPropagation();element.setPointerCapture?.(event.pointerId);
   const start={x:event.clientX,y:event.clientY},origin=place(element,save.state.settings[settingKey],fallback);let moved=false,last={...start};
   const move=moveEvent=>{last={x:moveEvent.clientX,y:moveEvent.clientY};const dx=last.x-start.x,dy=last.y-start.y;if(Math.hypot(dx,dy)>5)moved=true;place(element,{x:origin.x+dx,y:origin.y+dy},fallback)};
   const finish=upEvent=>{element.removeEventListener("pointermove",move);element.removeEventListener("pointerup",finish);element.removeEventListener("pointercancel",finish);if(Number.isFinite(upEvent.clientX)&&Number.isFinite(upEvent.clientY))last={x:upEvent.clientX,y:upEvent.clientY};const final=place(element,{x:origin.x+last.x-start.x,y:origin.y+last.y-start.y},fallback);if(moved){save.state.settings[settingKey]=final;save.save();suppressClick=true;setTimeout(()=>suppressClick=false,0)}else if(upEvent.type!=="pointercancel"&&onTap){suppressClick=true;onTap();setTimeout(()=>suppressClick=false,0)}};
   element.addEventListener("pointermove",move);element.addEventListener("pointerup",finish);element.addEventListener("pointercancel",finish);
  });
  element.addEventListener("click",event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation()}},true);
 };
 const sync=()=>{const visible=save.state.settings.minimapVisible!==false;map.classList.toggle("visible",visible);button.classList.toggle("active",visible);button.setAttribute("aria-pressed",String(visible));if(visible)requestAnimationFrame(()=>place(map,save.state.settings.minimapPanelPosition,{x:Math.max(8,stage.clientWidth-208),y:10}))};
 sync();
 bindDrag(button,"mapTogglePosition",{x:Math.max(8,stage.clientWidth-72),y:Math.max(8,stage.clientHeight*.48-29)},{onTap:()=>{save.state.settings.minimapVisible=save.state.settings.minimapVisible===false;save.save();sync()}});
 bindDrag(map,"minimapPanelPosition",{x:Math.max(8,stage.clientWidth-208),y:10});
 if(auto){
  const summary=auto.querySelector("summary"),setAutoMenuOpen=next=>{next=Boolean(next);save.state.settings.exploreAutoMenuOpen=next;auto.open=next;summary?.setAttribute("aria-expanded",String(next));save.save()};
  summary?.setAttribute("role","button");summary?.setAttribute("tabindex","0");summary?.setAttribute("aria-expanded",String(auto.open));
  summary?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation()});
  summary?.addEventListener("keydown",event=>{if(event.key!=="Enter"&&event.key!==" ")return;event.preventDefault();event.stopPropagation();setAutoMenuOpen(!auto.open)});
  bindDrag(auto,"autoExploreButtonPosition",{x:Math.max(8,stage.clientWidth-122),y:Math.max(8,stage.clientHeight*.58)},{handle:"summary",onTap:()=>setAutoMenuOpen(!auto.open)});
  auto.addEventListener("toggle",()=>{const next=Boolean(auto.open);if(Boolean(save.state.settings.exploreAutoMenuOpen)===next)return;save.state.settings.exploreAutoMenuOpen=next;save.save()});
 }
}
function itemCount(type){return save.state.inventory[type]??0}
function openFieldItems(){
 if(!game?.running)return;
 snapshot=currentSnapshot();stopGame();inventoryNavigationOrigin="explore";inventoryCategory="consumable";go("inventory");
}
function clearAilments(m){m.statuses=[];m.status=null;m.ailments=[];if(battle?.party?.some(monster=>monster.id===m.id))clearPersistentAilments(battle,m.id)}
function scaledRecovery(base,max,rate){return Math.max(1,Math.floor(base+max*rate))}
function openExperiencePackQuantity(target,tier="small"){
 const type=experiencePackType(tier),owned=itemCount(type.inventoryKey),capacity=experiencePackCapacity(target,owned);if(!capacity)return alert("これ以上レベルを上げられません");
 const species=SPECIES[target.speciesId]??{},stats=calculatedStats(target),hp=target.currentHp??stats.hp,dead=hp<=0;
 app.insertAdjacentHTML("beforeend",Modal("経験値パックをまとめて使用",`<div class="experience-pack-picker"><div class="experience-pack-hero ${dead?"is-defeated":""}"><span>${monsterVisual(target,species.emoji??"👹",{frame:dead?"down":"idle",className:"experience-pack-hero-monster"})}</span><div><small>${dead?"戦闘不能のまま育成":"育成対象"}・${type.name}</small><b>${escapeAttribute(displayName(target))} Lv.${target.level.toLocaleString()}</b><em>所持 ${owned.toLocaleString()}個・使用可能 ${capacity.toLocaleString()}個</em></div></div><div class="experience-pack-step"><button type="button" data-exp-step="-10">−10</button><button type="button" data-exp-step="-1">−1</button><input id="experiencePackAmount" type="number" inputmode="numeric" min="1" max="${capacity}" value="${Math.min(10,capacity)}"><button type="button" data-exp-step="1">＋1</button><button type="button" data-exp-step="10">＋10</button></div><div class="experience-pack-presets"><button type="button" data-exp-half>半分</button><button type="button" data-exp-max>MAX</button></div><div id="experiencePackPreview" class="experience-pack-preview"></div><button type="button" id="confirmExperiencePacks" class="primary">この個数を使用</button></div>`,`やめる`));
 const modal=topModal();modal.classList.add("experience-pack-quantity-modal");const input=modal.querySelector("#experiencePackAmount"),preview=modal.querySelector("#experiencePackPreview"),confirm=modal.querySelector("#confirmExperiencePacks"),clamp=value=>Math.max(1,Math.min(capacity,Math.floor(Number(value)||1))),refresh=()=>{input.value=String(clamp(input.value));const plan=type.id==="small"?previewExperiencePacks(target,input.value,owned):previewExperiencePacks(target,input.value,owned,type.id),need=Math.max(1,expNeedFor({...target,level:plan.levelAfter})),progress=Math.max(0,Math.min(100,plan.expAfter/need*100));preview.innerHTML=`<small>確定後の育成結果・1個あたりN標準約${type.levelSpan}Lv分</small><strong>${plan.count.toLocaleString()}個 → ${plan.gain.toLocaleString()} EXP</strong><span>Lv.${plan.levelBefore.toLocaleString()} → <b>Lv.${plan.levelAfter.toLocaleString()}</b>${plan.capped?"（上限到達）":""}</span><i style="--exp-preview-progress:${progress}%"><u></u></i>`;confirm.disabled=!plan.count};
 modal.querySelectorAll("[data-exp-step]").forEach(button=>button.onclick=()=>{input.value=String(clamp(Number(input.value)+Number(button.dataset.expStep)));refresh()});modal.querySelector("[data-exp-half]").onclick=()=>{input.value=String(Math.max(1,Math.floor(capacity/2)));refresh()};modal.querySelector("[data-exp-max]").onclick=()=>{input.value=String(capacity);refresh()};input.oninput=refresh;confirm.onclick=()=>{if(confirm.disabled)return;confirm.disabled=true;const wasDefeated=target.currentHp!=null&&Number(target.currentHp)<=0,result=consumeExperiencePacks(target,input.value,save.state.inventory,type.id);if(!result.ok){confirm.disabled=false;return alert(result.reason==="LEVEL_CAP"?"レベル上限です":"使用数を確認してください")}target.currentHp=wasDefeated?0:Math.min(calculatedStats(target).hp,target.currentHp??calculatedStats(target).hp);target.currentMp=Math.min(maxMp(target),target.currentMp??maxMp(target));save.save();modal.remove();showToast(`${displayName(target)}：${type.shortName}${result.count.toLocaleString()}個で ${result.gain.toLocaleString()} EXP`);render()};modal.querySelector("[data-modal-primary]").onclick=closeTopModal;refresh();
}
function useFieldItem(type,targetId){if(itemCount(type)<=0)return;const target=save.state.monsters.find(m=>m.id===targetId),party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean),single=["potions","highPotions","manaPotions","highManaPotions","fullManaPotions","statusCures","fullHeals","experienceItems"].includes(type);if(single&&!target)return;const list=single?[target]:party;if(single&&type!=="experienceItems"&&target.currentHp<=0)return alert("戦闘不能の仲間には使用できません");if(type==="experienceItems"){const wasDefeated=target.currentHp!=null&&Number(target.currentHp)<=0,gain=Math.floor(experienceCrystalValue(target));applyTotalExperience(target,totalExperience(target)+gain);target.currentHp=wasDefeated?0:Math.min(calculatedStats(target).hp,target.currentHp??calculatedStats(target).hp);target.currentMp=Math.min(maxMp(target),target.currentMp??maxMp(target));save.state.inventory.experienceItems--;save.save();closeTopModal();showToast(`${displayName(target)}が${gain.toLocaleString()} EXPを獲得`);render();return}const hasAilment=m=>(m.statuses?.length??0)||(m.ailments?.length??0)||m.status;const usable=["potions","highPotions"].includes(type)?target.currentHp<calculatedStats(target).hp:type==="partyPotions"?list.some(m=>m.currentHp>0&&m.currentHp<calculatedStats(m).hp):["manaPotions","highManaPotions","fullManaPotions"].includes(type)?target.currentMp<maxMp(target):["partyManaPotions","partyFullManaPotions"].includes(type)?list.some(m=>m.currentHp>0&&m.currentMp<maxMp(m)):type==="statusCures"?hasAilment(target):type==="partyStatusCures"?list.some(hasAilment):type==="fullHeals"?(target.currentHp<calculatedStats(target).hp||target.currentMp<maxMp(target)||hasAilment(target)):list.some(m=>m.currentHp>0&&(m.currentHp<calculatedStats(m).hp||m.currentMp<maxMp(m)||hasAilment(m)));if(!usable)return alert("もう元気だよ！");if(type==="potions"){const max=calculatedStats(target).hp;target.currentHp=Math.min(max,target.currentHp+scaledRecovery(100,max,.10))}if(type==="highPotions"){const max=calculatedStats(target).hp;target.currentHp=Math.min(max,target.currentHp+scaledRecovery(300,max,.25))}if(type==="partyPotions")list.filter(m=>m.currentHp>0).forEach(m=>{const max=calculatedStats(m).hp;m.currentHp=Math.min(max,m.currentHp+scaledRecovery(50,max,.07))});if(type==="manaPotions"){const max=maxMp(target);target.currentMp=Math.min(max,target.currentMp+scaledRecovery(30,max,.10))}if(type==="highManaPotions"){const max=maxMp(target);target.currentMp=Math.min(max,target.currentMp+scaledRecovery(100,max,.25))}if(type==="partyManaPotions")list.filter(m=>m.currentHp>0).forEach(m=>{const max=maxMp(m);m.currentMp=Math.min(max,m.currentMp+scaledRecovery(30,max,.07))});if(type==="fullManaPotions")target.currentMp=maxMp(target);if(type==="partyFullManaPotions")list.filter(m=>m.currentHp>0).forEach(m=>m.currentMp=maxMp(m));if(type==="statusCures"||type==="partyStatusCures")list.forEach(clearAilments);if(type==="fullHeals"||type==="partyFullHeals")list.filter(m=>m.currentHp>0).forEach(m=>{m.currentHp=calculatedStats(m).hp;m.currentMp=maxMp(m);clearAilments(m)});save.state.inventory[type]--;save.save();closeTopModal();snapshot=currentSnapshot();stopGame();render()}
function openPartyEditor(){game.paused=true;app.insertAdjacentHTML("beforeend",Modal("フィールド編成",partyEditorBody("field"),"閉じる"));const modal=topModal();modal.dataset.partyEditorMode="field";bindPartyEditor(modal);const close=()=>{modal.remove();snapshot=currentSnapshot();stopGame();render()};modal._onDismiss=close;modal.querySelector("[data-modal-primary]").onclick=close}
function enemyLevelForFloor(floor){return scaledEnemyLevelForFloor(floor)}
const ENEMY_EQUIPMENT_SUBSLOTS=Object.freeze([
 ["weaponRight","weapon"],["weaponLeft","weapon"],["armorBody","armor"],["armorSupport","armor"],["accessoryNeck","accessory"],["accessoryFinger","accessory"]
]);
function prepareEnemyEntry(entry,floor,{forceGear=false}={}){
 const source={...entry},f=Math.max(1,Math.floor(Number(floor)||1)),species=SPECIES[source.speciesId]??{},rank=source.faction??species.rarity??"N";
 const reroll=source.enemyLoadoutVersion!==4,holder=forceGear||source.equipped===true||(!reroll?Boolean(source.equipped):Math.random()<equipmentHolderRateForFloor(f));
 const slots=holder?equipmentSlotsForFloor(f):0,rarity=holder?rollEnemyEquipmentRarity(f,rank):null,gearLevel=holder?enemyEquipmentLevelForFloor(f,{rank,boss:Boolean(source.boss)}):0;
 let enemyGear=Array.isArray(source.enemyGear)?source.enemyGear:[];
 if(holder&&(!enemyGear.length||reroll))enemyGear=ENEMY_EQUIPMENT_SUBSLOTS.slice(0,slots).map(([subslot,slot])=>{
  const item=createEquipment(slot,{rarity});item.level=gearLevel;item.plus=f<250?0:Math.min(30,Math.floor(f/300));item.enemySubslot=subslot;item.enemySocketRarity=rarity;item.obtainedFloor=f;item.obtainedMethod="enemyLoadout";return item
 });
 const circle=Object.prototype.hasOwnProperty.call(source,"enemyMagicCircle")?source.enemyMagicCircle:rollEnemyMagicCircle(f,{rank});
 return{...source,enemyFloor:f,equipped:holder,gear:holder?(source.gear??enemyGear[0]??null):null,enemyGear:holder?enemyGear:[],enemyEquipmentSlots:slots,enemyEquipmentLevel:holder?gearLevel:0,enemyEquipmentRarity:rarity,enemySocketRarity:rarity,enemyMagicCircle:circle,enemyLoadoutVersion:4};
}
function ensureUniqueEnemyMagicCircles(entries,floor){
 const used=new Set(),f=Math.max(1,Math.floor(Number(floor)||1));
 return entries.map(entry=>{
  const species=SPECIES[entry?.speciesId]??{},rank=entry?.faction??species.rarity??"N";
  let circle=entry?.enemyMagicCircle??null;
  if(circle?.id&&used.has(circle.id)){
   circle=rollEnemyMagicCircle(f,{rank,force:true,excludeIds:[...used]});
  }
  if(circle?.id)used.add(circle.id);
  return circle===entry?.enemyMagicCircle?entry:{...entry,enemyMagicCircle:circle};
 });
}
function speciesPoolForFloor(floor){
 const biome=biomeForFloor(floor);
 const unlocked=Object.values(SPECIES).filter(species=>species.fieldEncounter!==false&&!species.ultraRareEncounter&&!species.isAbyss&&!species.isTenGod&&!['深淵','十神'].includes(species.rarity)&&(species.minFloor??1)<=floor).sort((a,b)=>(a.minFloor??1)-(b.minFloor??1));
 if(!unlocked.length)return[SPECIES.slime];
 const nearby=unlocked.filter(species=>(species.minFloor??1)>=Math.max(1,floor-300));
 const candidates=nearby.length>=8?nearby:unlocked.slice(-24);
 const weights={N:18,R:12,SR:7,SSR:4,UR:2,LR:1};
 return candidates.flatMap(species=>{
  const rarityWeight=weights[species.rarity]??1,biomeWeight=biome.elements.includes(species.element)?(floor>=101?6:3):1;
  return Array.from({length:rarityWeight*biomeWeight},()=>species);
 });
}
function randomEnemy(){
 const floor=save.state.player.currentFloor;
 if(floor===1)return prepareEnemyEntry({speciesId:"slime",level:1,boss:false},floor);
 const rareEncounterRate=(save.state.party??[]).map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean).reduce((sum,monster)=>sum+seriesEffectValue(monster,"rareEncounter",.5),0);
 if(floor>=777&&Math.random()<Math.min(.0012,.00025*(1+rareEncounterRate)))return prepareEnemyEntry({speciesId:"ochuki",level:Math.max(1,enemyLevelForFloor(floor)),boss:false,rareExp:true,fleeAfterTurns:2+Math.floor(Math.random()*3),uncapturable:false},floor);
 if(floor>=2&&Math.random()<Math.min(.03,.006*(1+rareEncounterRate)))return prepareEnemyEntry({speciesId:"baby_slime",level:Math.max(1,enemyLevelForFloor(floor)),boss:false,rareExp:true},floor);
 const picked=pickBiomeEncounterSpecies(STANDARD_ENCOUNTER_SPECIES,floor,biomeForFloor(floor),Math.random)??SPECIES.slime;
 return prepareEnemyEntry({speciesId:picked.id,level:enemyLevelForFloor(floor),boss:false},floor)
}
function randomEnemyGroup(){
 const floor=save.state.player.currentFloor;if(floor<=4)return[randomEnemy()];
 const roll=Math.random();let count=1;
 // 通常戦でも深層ほど4体編成が増える。1体編成も残して探索の緩急は保つ。
 if(floor<10)count=roll<.18?2:1;
 else if(floor<50)count=roll<.05?3:roll<.34?2:1;
 else if(floor<100)count=roll<.05?1:roll<.38?2:roll<.73?3:4;
 else count=roll<.01?1:roll<.09?2:roll<.27?3:4;
 const group=Array.from({length:count},randomEnemy),ochuki=group.find(enemy=>enemy.speciesId==="ochuki");if(ochuki)return[ochuki];if(group.length===1&&shouldSpawnSecondWorldElite(floor))group[0]=createEliteEncounter(group[0],floor);return group
}
function milestoneBossEntry(bossId,floor,index=0){
 const profile=ENDGAME_BOSSES[bossId],final=floor===WORLD_MAX_FLOOR&&bossId==="ten_divinity";
 return prepareEnemyEntry({speciesId:profile.speciesId,level:Math.max(14,bossLevelForFloor(floor)),boss:true,endgameBossId:bossId,visualSpeciesId:bossId,faction:profile.faction,nameOverride:final?`${profile.name}〈真なる顕現〉`:profile.name,powerRate:1,manifestationLabel:final?"真なる顕現":"階層顕現",uncapturable:true,noItemDrops:true,floorMilestoneId:bossId,statMultiplier:index?Math.max(.72,1-index*.12):1,bossPassive:profile.passive,elementMultipliers:profile.elementMultipliers,statusProfile:profile.statusProfile},floor,{forceGear:true})
}
function floorBossEnemy(){
 const floor=save.state.player.currentFloor,milestones=milestoneBossIdsForFloor(floor);
 if(milestones.length)return milestoneBossEntry(milestones[0],floor);
 const definition=floorBossDefinitionForFloor(floor);
 if(definition)return prepareEnemyEntry({speciesId:definition.speciesId,visualSpeciesId:definition.visualSpeciesId??definition.speciesId,level:Math.max(14,bossLevelForFloor(floor)),boss:true,nameOverride:definition.name,floorBossCatalogId:definition.id,floorBossTitle:definition.title,floorBossQuote:definition.quote,floorBossStats:definition.stats,floorBossActionIds:definition.actionIds,floorBossPassive:definition.passive,floorBossDomain:definition.domain,floorBossAi:definition.ai,dedicatedWeapon:definition.dedicatedWeapon,combatRarity:definition.rarity,attribute:definition.element,trialElement:definition.element,role:definition.role,uncapturable:true},floor,{forceGear:floor>=50});
 const pool=speciesPoolForFloor(Math.max(floor,10)).filter(s=>s.minFloor<=floor),speciesId=(pool[Math.floor(seeded(floorSeed(floor)+991)()*pool.length)]??SPECIES.slime).id;
 return prepareEnemyEntry({speciesId,level:Math.max(14,bossLevelForFloor(floor)),boss:true,uncapturable:true},floor,{forceGear:floor>=50})
}
function floorBossParty(bossInfo,floor){
 const milestones=milestoneBossIdsForFloor(floor);if(milestones.length)return milestones.map((id,index)=>index===0&&bossInfo.endgameBossId===id?bossInfo:milestoneBossEntry(id,floor,index));
 return[bossInfo]
}
function openFloorBossChallenge(bossInfo,floor){
 const species=SPECIES[bossInfo.speciesId]??SPECIES.slime,endgame=bossInfo.endgameBossId?ENDGAME_BOSSES[bossInfo.endgameBossId]:null,name=bossInfo.nameOverride??endgame?.name??species.name,quote=bossInfo.floorBossQuote??endgame?.encounterText??["ここより先へ進む資格を、その力で示せ。","幾度挑もうと構わぬ。深淵は覚悟だけを量る。","この階層を越えるなら、恐れごと剣に変えてみせろ。"][Math.floor(Math.random()*3)],preview=createMonster(bossInfo.speciesId,{level:bossInfo.level,stars:1,rank:1}),partyPower=partyCombatPower(save.state),bossPower=Math.max(1,Math.round(monsterCombatPower(preview)*(bossInfo.statMultiplier??1.45))),tone=endgame?.faction==="tenGod"?"divine":endgame?.faction==="abyss"?"abyss":"floor",mechanics=bossInfo.floorBossPassive&&bossInfo.floorBossDomain?`<div class="floor-boss-mechanics"><span><small>固有能力</small><b>${bossInfo.floorBossPassive.name}</b><em>${bossInfo.floorBossPassive.description}</em></span><span><small>専用領域</small><b>${bossInfo.floorBossDomain.name}</b><em>${bossInfo.floorBossDomain.description}</em></span></div>`:"";
 app.insertAdjacentHTML("beforeend",Modal("階層支配者",`<div class="floor-boss-challenge-v3 tone-${tone}"><div class="boss-chain-frame" aria-hidden="true"><i></i><i></i></div><div class="boss-crest-v3"><span>階層</span><strong>${floor}</strong><em>支配者</em></div><div class="boss-visual-stage-v3"><div class="boss-fog-v3"></div>${monsterVisual({...bossInfo,visualSpeciesId:bossInfo.visualSpeciesId??bossInfo.endgameBossId},species.emoji??"BOSS",{className:"floor-boss-monster-visual-v3"})}</div><small>${bossInfo.floorBossTitle??endgame?.title??`第${floor}階層の支配者`}</small><h2>${name}</h2><b>Lv.${bossInfo.level}</b><blockquote>${quote}</blockquote>${mechanics}<div class="boss-power-versus-v3"><span><small>部隊戦力</small><b>${formatCombatPower(partyPower)}</b></span><i>対</i><span><small>ボス戦力</small><b>${formatCombatPower(bossPower)}</b></span></div><button type="button" class="boss-retreat-v3" data-boss-retreat>いったん退く</button></div>`,"支配者へ挑む"));
 const modal=topModal();modal.classList.add("floor-boss-modal-v3");const retreat=()=>{modal.remove();if(game)game.paused=false};modal._onDismiss=retreat;modal.querySelector("[data-boss-retreat]").onclick=retreat;const challenge=modal.querySelector("[data-modal-primary]");challenge.onclick=()=>{modal.remove();if(game)game.paused=false;beginEncounter(floorBossParty(bossInfo,floor))};if(exploreAutoActive()){const generation=exploreActionGeneration;setTimeout(()=>{if(generation===exploreActionGeneration&&modal.isConnected&&exploreAutoActive())challenge.click()},420)}
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
 const originGame=game,generation=exploreActionGeneration;
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
 fx.innerHTML='<div class="encounter-mist"></div><div class="encounter-vignette"></div><div class="encounter-sparks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="encounter-slashes" aria-hidden="true"><i></i><i></i></div><div class="encounter-warning"><small>深淵との遭遇</small><strong>敵影接近</strong><em></em></div><div class="encounter-curtain left"></div><div class="encounter-curtain right"></div>';
 (stage??document.body).appendChild(fx);
 requestAnimationFrame(()=>fx.classList.add("is-awake"));
 await wait(180);fx.classList.add("is-struck");
 await wait(390);fx.classList.add("is-closing");
 await wait(280);
 if(generation!==exploreActionGeneration||game!==originGame||!game?.running||!save.state.player.inRun||screen!=="explore"){fx.remove();canvas?.classList.remove("encounter-shake");return}
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
  card.querySelectorAll("[data-hud-hp-fill]").forEach(fill=>fill.style.width=`${Math.min(100,hp/Math.max(1,stats.hp)*100)}%`);
  card.querySelectorAll("[data-hud-mp-fill]").forEach(fill=>fill.style.width=`${Math.min(100,mp/Math.max(1,monsterMp)*100)}%`);
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
 if(explorationPartyTiles().some(position=>objectKeys.has(`${position.x}:${position.y}`)))return true;
 const spring=game.world.hotSpring;
 return Boolean(spring?.active&&explorationPartyTiles().some(position=>Math.hypot(position.x-spring.x,position.y-spring.y)<=Number(spring.radius??1.75)))
}
function bossHotSpringContainsPlayer(){
 const spring=game?.world?.hotSpring;if(!spring?.active||!game?.player)return false;
 return Math.hypot((game.player.rx??game.player.x)-spring.x,(game.player.ry??game.player.y)-spring.y)<=Number(spring.radius??1.75)
}
function applyBossHotSpringRecovery(now=performance.now()){
 const spring=game?.world?.hotSpring;if(!spring?.active||!bossHotSpringContainsPlayer())return false;
 const last=Number(spring.lastRecoveryAt)||0;if(last&&now-last<200)return false;
 spring.lastRecoveryAt=now;let hpRecovered=0,mpRecovered=0;
 explorationPartyMembers().forEach(monster=>{
  if((Number(monster.currentHp)||0)<=0)return;
  const hpMax=calculatedStats(monster).hp,mpMax=maxMp(monster),beforeHp=Math.max(0,Number(monster.currentHp)||0),beforeMp=Math.max(0,Number(monster.currentMp)||0);
  monster.currentHp=Math.min(hpMax,beforeHp+Math.max(1,Math.round(hpMax*.2)));
  monster.currentMp=Math.min(mpMax,beforeMp+Math.max(1,Math.round(mpMax*.2)));
  hpRecovered+=monster.currentHp-beforeHp;mpRecovered+=monster.currentMp-beforeMp;
 });
 if(!hpRecovered&&!mpRecovered)return false;
 refreshExplorePartyHud();queueExpeditionCheckpoint();
 if(!spring.lastNoticeAt||now-spring.lastNoticeAt>=800){spring.lastNoticeAt=now;showExploreNotice(`温泉の加護　HP +${hpRecovered.toLocaleString()} / MP +${mpRecovered.toLocaleString()}`,"heal")}
 return true
}
function interactExploreDecoration(decoration){
 if(!decoration||decoration.used||decoration.destroyed||!EXPLORE_INTERACTIVE_DECORATIONS.has(decoration.type))return false;
 const floor=save.state.player.currentFloor,roll=Math.random();
 let message="",resourceToast=null;
 if(decoration.type==="barrel"||decoration.type==="crate"){
  decoration.destroyed=true;decoration.used=true;
  if(roll<.34){
   const gold=modifiedGoldReward(save.state,Math.max(8,Math.round(chestGoldBase(floor)*(.07+Math.random()*.05))),"exploration");
   save.state.player.gold+=gold;resourceToast={icon:"coin",amount:gold};
  }else if(roll<.48){
   save.state.inventory.potions=(save.state.inventory.potions??0)+1;message="回復薬を拾った";
  }else if(roll<.53){
   save.state.player.crystals=(save.state.player.crystals??0)+1;resourceToast={icon:"crystal",amount:1};
  }else message=decoration.type==="barrel"?"樽を壊したが、中は空だった":"木箱を壊したが、中は空だった";
 }else if(decoration.type==="bones"){
  decoration.destroyed=true;decoration.used=true;
  const foundCaptureCrystal=Math.random()<.01;
  if(roll<.005){
   save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+1;resourceToast={icon:"key",amount:1};
	  }else if(roll<.24){
	   const gold=modifiedGoldReward(save.state,Math.max(5,Math.round(chestGoldBase(floor)*.045)),"exploration");
	   save.state.player.gold+=gold;resourceToast={icon:"coin",amount:gold};
	  }else message="骨は静かに崩れた";
	  if(foundCaptureCrystal){save.state.inventory.captureCrystals=(save.state.inventory.captureCrystals??0)+1;resourceToast={icon:"capture",amount:1};message="骨の隙間から捕獲結晶を拾った"}
	 }else if(decoration.type==="crystal"){
  decoration.used=true;
  const amount=roll<.08?2:1;
  save.state.player.crystals=(save.state.player.crystals??0)+amount;resourceToast={icon:"crystal",amount};
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
  if(recovered>0)message="HP・MP 2%回復";
 }
 persistExploreDecorationState(decoration,floor);
 persistExpeditionSnapshot(expeditionSnapshotFromGame(),{saveNow:false});
 save.save();
 refreshExploreResourceHud();
 refreshExplorePartyHud();
 if(resourceToast)showResourceToast(resourceToast.icon,resourceToast.amount);else if(message)showExploreNotice(message);
 if(decoration.tutorialGuide==="firstPickup"){completeContextGuide("explore_pickup",{quiet:true});if(game?.world)game.world.nextEncounter=Math.min(Number(game.world.nextEncounter)||Infinity,game.world.steps+2)}
 return true
}
function applyWalkingStratumHazard(){
 if(!game||game.world.steps%8!==0)return;const environment=battleBiomeForFloor(save.state.player.currentFloor);
 if(!["fire","lava","poison"].includes(environment.theme))return;
 let total=0;for(const monster of explorationPartyMembers()){
  const element=normalizedElement(monster.attribute??SPECIES[monster.speciesId]?.element);if(!environment.adverse.includes(element)||monster.currentHp<=1)continue;
  const max=calculatedStats(monster).hp,damage=Math.max(1,Math.floor(max*.002));monster.currentHp=Math.max(1,monster.currentHp-damage);total+=damage;
 }
 if(total){refreshExplorePartyHud();showExploreNotice(`${environment.theme==="poison"?"瘴気":"灼熱"} −${total.toLocaleString()} HP`,"hazard")}
}
function update(dt){
 if(game.world.encountering)return;
 applyBossHotSpringRecovery();
 applyExploreAutoPath();
 if(game.player.move(dt,7.5)){
  game.world.steps++;
  applyWalkingStratumHazard();
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
   if(exploreAutoActive())game.world.shop.autoVisited=true;
   stopGame();
   snapshot=currentSnapshot();
   enterSecretRoom(save.state,game.world.shop.roomId??`${save.state.secretRooms?.run?.id??"run"}:${save.state.player.currentFloor}`,save.state.player.currentFloor);
   save.save();screen="shop";render();return
  }
  if(game.player.x===game.world.exit.x&&game.player.y===game.world.exit.y){
   if(save.state.player.currentFloor%10===0&&game.world.boss&&!floorBossWasDefeated(save.state.player,save.state.player.currentFloor)){
    game.player.path=[];game.paused=true;pauseModal("まだ先へは進めない","<p>この階層の支配者が道を封じている。</p>");return
   }
   if(save.state.player.currentFloor>=WORLD_MAX_FLOOR){game.player.path=[];game.paused=true;if(exploreAutoActive())stopExploreAuto("AUTO完了：10000階へ到達しました");const cleared=Boolean(save.state.flags?.ending10000Played);app.insertAdjacentHTML("beforeend",Modal(cleared?"10000階・世界の底":"10000階・最後の境界",cleared?"<p>真なる深淵は、あなたの領域となった。</p><p class=\"muted\">ここからは育成・装備厳選・十神との再戦を続けられます。</p>":"<p>最後の境界は、まだ閉ざされている。</p><p class=\"muted\">この階層の支配者を倒してください。</p>","探索を続ける"));const modal=topModal();modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();game.paused=false};return}
   stopGame();snapshot=null;clearExpeditionSnapshot();save.state.player.currentFloor++;
   recordManualFloorClear(save.state,save.state.player.currentFloor);
   save.state.player.maxFloor=Math.min(WORLD_MAX_FLOOR,Math.max(save.state.player.maxFloor,save.state.player.currentFloor));
   if(save.state.player.currentFloor===1001)markSecondWorldEntered(save.state);save.save();go("explore");return
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
 if(c.locked&&(save.state.inventory.abyssKeys??0)<=0){game.player.path=[];if(exploreAutoActive())c.autoSkipped=true;return pauseModal("🔒 鍵付き宝箱",'<p>深淵の鍵が必要だ。</p><p class="muted">鍵は強敵やごく稀な敵ドロップから入手できます。</p>')}
 if(c.locked)save.state.inventory.abyssKeys--;
 c.open=true;save.state.player.openedChests[floor]??=[];
 if(!save.state.player.openedChests[floor].includes(c.id))save.state.player.openedChests[floor].push(c.id);
 recordBiomeChest(save.state,floor,c.id);save.state.records.chests++;
 if(c.mimic){save.save();game.player.path=[];const warning=pauseModal("！？",'<p>宝箱が牙を剥いた！</p><p class="muted">HPはわずか5。仲間ごとに一巡1しか削れず、噛みつきは致命的だ。</p>');game.world.encountering=true;const generation=exploreActionGeneration;setTimeout(()=>{if(generation!==exploreActionGeneration||!game?.running||!save.state.player.inRun)return;warning?.remove();game.world.encountering=false;game.paused=false;beginEncounter(prepareEnemyEntry({speciesId:"mimic",level:enemyLevelForFloor(floor),boss:false},floor,{forceGear:true}))},650);return}
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
function explorationPartyMembers(){return game?.online?(game.onlineMembers??[]).map(entry=>entry.monster).filter(Boolean):(save.state.party??[]).map(id=>save.state.monsters?.find(monster=>monster.id===id)).filter(Boolean)}
const explorationSpriteCache=new Map();
const explorationTextureCache=new Map();
const EXPLORE_TEXTURE_URLS={
 floor:"assets/ui/explore/dungeon-floor.png?v=2.11.2-build166",
 wall:"assets/ui/explore/dungeon-wall.png?v=2.11.2-build166",
 stairs:"assets/ui/explore/dungeon-stairs-arch.png?v=2.11.2-build166",
 props:"assets/ui/explore/dungeon-props-atlas.png?v=2.11.2-build166",
 usedWater:"assets/ui/explore/empty-water-basin.png?v=2.11.2-build166"
};
const EXPLORE_ATLAS=Object.freeze({
 floor:0,wall:1,corner:2,pillar:3,entrance:4,chestClosed:5,chestOpen:6,barrel:7,
 crate:8,bones:9,candelabrum1:10,candelabrum2:11,crystal1:12,crystal2:13,crystal3:14,water:15
});
const ONLINE_COOP_ASSET_URLS=Object.freeze({
 "switch-idle":"assets/online/coop/switch-idle.png?v=2.11.41-build206","switch-pressed":"assets/online/coop/switch-pressed.png?v=2.11.41-build206","switch-charging":"assets/online/coop/switch-charging.png?v=2.11.41-build206","switch-activated":"assets/online/coop/switch-activated.png?v=2.11.41-build206",
 "chest-black-iron-closed":"assets/online/coop/chests/black-iron-closed.png?v=2.11.44-build209","chest-black-iron-open":"assets/online/coop/chests/black-iron-open.png?v=2.11.44-build209",
 "chest-silver-closed":"assets/online/coop/chests/silver-closed.png?v=2.11.44-build209","chest-silver-open":"assets/online/coop/chests/silver-open.png?v=2.11.44-build209",
 "chest-gold-closed":"assets/online/coop/chests/gold-closed.png?v=2.11.44-build209","chest-gold-open":"assets/online/coop/chests/gold-open.png?v=2.11.44-build209",
 "chest-abyss-closed":"assets/online/coop/chests/abyss-closed.png?v=2.11.44-build209","chest-abyss-open":"assets/online/coop/chests/abyss-open.png?v=2.11.44-build209",
 "key-fragment-cyan":"assets/online/coop/keys/key-fragment-cyan.png?v=2.11.44-build209","key-fragment-violet":"assets/online/coop/keys/key-fragment-violet.png?v=2.11.44-build209","key-combined":"assets/online/coop/keys/key-combined.png?v=2.11.44-build209","vault-sealed":"assets/online/coop/keys/vault-sealed.png?v=2.11.44-build209",
 "merchant-idle1":"assets/online/coop/merchant/idle1.png?v=2.11.44-build209","merchant-idle2":"assets/online/coop/merchant/idle2.png?v=2.11.44-build209","merchant-idle3":"assets/online/coop/merchant/idle3.png?v=2.11.44-build209","merchant-talk":"assets/online/coop/merchant/talk.png?v=2.11.44-build209",
 "portal-dormant":"assets/online/coop/portal/portal-dormant.png?v=2.11.44-build209","portal-active":"assets/online/coop/portal/portal-active.png?v=2.11.44-build209"
});
function exploreBandTheme(floor){return dungeonThemeForFloor(floor)}
function cachedExplorationImage(url){if(!url)return null;let entry=explorationTextureCache.get(url);if(!entry){const image=new Image();entry={image,ready:false,failed:false};explorationTextureCache.set(url,entry);image.onload=()=>entry.ready=true;image.onerror=()=>entry.failed=true;image.decoding="async";image.src=url}return entry.ready&&!entry.failed?entry.image:null}
function explorationTexture(kind,theme){
 const url=kind==="floor"?theme?.floorAsset??EXPLORE_TEXTURE_URLS.floor:kind==="wall"?theme?.wallAsset??EXPLORE_TEXTURE_URLS.wall:EXPLORE_TEXTURE_URLS[kind];if(!url)return null;
 return cachedExplorationImage(url);
}
function onlineCoopAsset(id){return cachedExplorationImage(ONLINE_COOP_ASSET_URLS[id])}
function drawOnlineExploreCircle(position,profile){if(!profile?.circleId||profile.circleId==="none")return;const circle=MAGIC_CIRCLES.find(entry=>entry.id===profile.circleId),image=cachedExplorationImage(circle?.asset);if(!image)return;const p=game.camera.world(position.x*TILE,position.y*TILE),tile=TILE*game.camera.z,size=tile*1.34,c=game.ctx;c.save();c.translate(p.x+tile/2,p.y+tile*.94);c.scale(1,.31);c.rotate(performance.now()/4800+(String(profile.circleId).length%7));c.globalAlpha=.58;c.globalCompositeOperation="screen";c.shadowColor="#8eeeff";c.shadowBlur=9*game.camera.z;c.drawImage(image,-size/2,-size/2,size,size);c.restore()}
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
 const maximumHp=Math.max(1,Number(monster?.onlineStats?.hp??monster?.maxHp??calculatedStats(monster)?.hp)||1),currentHp=monster?.currentHp==null?maximumHp:Math.max(0,Number(monster.currentHp)||0),down=currentHp<=0,critical=!down&&currentHp/maximumHp<=.1;
 const frame=down?"down":sequence[Math.floor(performance.now()/(moving?170:320)+index)%sequence.length];
 const image=explorationSpriteImage(monster,frame);
 if(!image){
  const species=SPECIES[monster.speciesId]??{},elementColor={fire:"#ff725e",water:"#61bfff",earth:"#c9995d",wind:"#7ee0b0",light:"#ffe082",dark:"#a57ad9",thunder:"#e6d65d",ice:"#a9e8ff",poison:"#9ad65f"}[species.element]??"#b79bd2";
  const p=game.camera.world(position.x*TILE,position.y*TILE),tileSize=TILE*game.camera.z,cx=p.x+tileSize/2,cy=p.y+tileSize*.75,size=Math.max(13,26*game.camera.z*scale);
  game.ctx.save();game.ctx.imageSmoothingEnabled=false;if(critical)game.ctx.globalAlpha=Math.floor(performance.now()/230)%2?.22:1;
  if(glow){game.ctx.shadowColor=elementColor;game.ctx.shadowBlur=16}
  game.ctx.fillStyle="#08070d";game.ctx.strokeStyle=elementColor;game.ctx.lineWidth=Math.max(2,game.camera.z*2);
  game.ctx.beginPath();game.ctx.moveTo(cx,cy-size*.72);game.ctx.lineTo(cx+size*.62,cy);game.ctx.lineTo(cx,cy+size*.45);game.ctx.lineTo(cx-size*.62,cy);game.ctx.closePath();game.ctx.fill();game.ctx.stroke();
  game.ctx.fillStyle=elementColor;game.ctx.globalAlpha=.8;game.ctx.fillRect(cx-size*.18,cy-size*.08,size*.36,Math.max(2,size*.12));game.ctx.restore();return
 }
 const p=game.camera.world(position.x*TILE,position.y*TILE),pixelScale=game.camera.z*2.65*scale,contactX=p.x+TILE*game.camera.z/2,contactY=p.y+TILE*game.camera.z*.9;
 game.ctx.save();game.ctx.imageSmoothingEnabled=false;if(critical)game.ctx.globalAlpha=Math.floor(performance.now()/230)%2?.22:1;
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
function drawExplorationGroundAsset(position,image,scale=1.45){
 if(!image)return false;
 const p=game.camera.world(position.x*TILE,position.y*TILE),tile=TILE*game.camera.z,height=tile*scale,width=height*(image.width/Math.max(1,image.height)),bottom=p.y+tile*.94;
 game.ctx.save();game.ctx.imageSmoothingEnabled=false;game.ctx.shadowColor="#000";game.ctx.shadowBlur=8*game.camera.z;
 game.ctx.drawImage(image,p.x+tile/2-width/2,bottom-height,width,height);game.ctx.restore();return true
}
function drawExplorationWallAsset(position,image,scale=2.05,{active=false}={}){
 if(!image)return false;
 const p=game.camera.world(position.x*TILE,position.y*TILE),tile=TILE*game.camera.z,size=tile*scale,bottom=p.y+tile*1.08;
 game.ctx.save();game.ctx.imageSmoothingEnabled=false;game.ctx.shadowColor=active?"#a64dff":"#000";game.ctx.shadowBlur=(active?18:8)*game.camera.z;
 game.ctx.drawImage(image,p.x+tile/2-size/2,bottom-size,size,size);game.ctx.restore();return true
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
function exploreTextureSample(image,blocked,theme,x,y){
 if(!image)return null;
 const split=Boolean(theme.atlasSplit),panelWidth=split?Math.floor(image.width/2):image.width,sourceX=split&&blocked?panelWidth:0,crop=Math.min(64,panelWidth-2,image.height-2),spanX=Math.max(1,panelWidth-crop-1),spanY=Math.max(1,image.height-crop-1),offsetX=Number(theme.cropOffsetX)||0,offsetY=Number(theme.cropOffsetY)||0;
 return{sx:sourceX+(x*crop+offsetX)%spanX,sy:(y*crop+offsetY)%spanY,crop}
}
function drawExploreTextureSample(image,blocked,theme,x,y,dx,dy,dw,dh){
 const sample=exploreTextureSample(image,blocked,theme,x,y);if(!sample)return false;
 game.ctx.drawImage(image,sample.sx,sample.sy,sample.crop,sample.crop,dx,dy,dw,dh);return true
}
function exploreWallExposure(world,x,y){
 return{
  top:world.tiles[y-1]?.[x]===0,right:world.tiles[y]?.[x+1]===0,
  bottom:world.tiles[y+1]?.[x]===0,left:world.tiles[y]?.[x-1]===0
 }
}
function drawExploreRaisedWalls(world,theme,wallTexture){
 const c=game.ctx,size=TILE*game.camera.z,depth=size*Math.max(.22,Math.min(.42,Number(theme.wallDepth)||.31)),side=depth*.46,bevel=Math.max(2,size*.075),entries=[];
 for(let y=0;y<world.rows;y++)for(let x=0;x<world.cols;x++){
  if(!world.tiles[y]?.[x])continue;
  const open=exploreWallExposure(world,x,y),sides=Object.values(open).filter(Boolean).length;if(!sides)continue;
  const p=game.camera.world(x*TILE,y*TILE),margin=depth+side;
  if(p.x>game.canvas.width+margin||p.y>game.canvas.height+margin||p.x+size<-margin||p.y+size<-margin)continue;
  entries.push({x,y,p,open,sides})
 }
 if(!entries.length)return;
 c.save();c.imageSmoothingEnabled=false;

 // Contact shadows are painted onto the walkable side first, so the themed
 // wall faces remain crisp while still reading as solid height at a glance.
 for(const{p,open}of entries){
  c.fillStyle="rgba(0,0,0,.2)";
  if(open.bottom)c.fillRect(p.x-side*.15,p.y+size+depth*.72,size+side*.3,depth*.62);
  if(open.top)c.fillRect(p.x-side*.08,p.y-depth*.24,size+side*.16,depth*.24);
  if(open.left)c.fillRect(p.x-side*1.36,p.y+depth*.12,side*1.36,size+depth*.34);
  if(open.right)c.fillRect(p.x+size,p.y+depth*.12,side*1.36,size+depth*.34);
  c.fillStyle="rgba(0,0,0,.38)";
  if(open.bottom)c.fillRect(p.x,p.y+size+depth*.62,size,depth*.18);
  if(open.top)c.fillRect(p.x,p.y-depth*.08,size,depth*.1);
  if(open.left)c.fillRect(p.x-side*.28,p.y+bevel,side*.28,size-bevel);
  if(open.right)c.fillRect(p.x+size,p.y+bevel,side*.28,size-bevel)
 }

 for(const{x,y,p,open,sides}of entries){
  // Front face: reuse the current biome's wall art instead of covering it
  // with a generic stone tile. This preserves magma, ice, roots, fungi, etc.
  if(open.bottom){
   if(!drawExploreTextureSample(wallTexture,true,theme,x,y,p.x,p.y+size-.5,size,depth+.5)){c.fillStyle=theme.wallFace;c.fillRect(p.x,p.y+size-.5,size,depth+.5)}
   c.save();c.globalAlpha=.58;c.fillStyle=theme.wallFace;c.fillRect(p.x,p.y+size-.5,size,depth+.5);c.restore();
   c.fillStyle="rgba(0,0,0,.24)";c.fillRect(p.x,p.y+size+depth*.7,size,depth*.3)
  }
  const drawSide=(direction)=>{
   const left=direction==="left",edge=left?p.x:p.x+size,outer=left?edge-side:edge+side;
   c.save();c.beginPath();c.moveTo(edge,p.y+bevel*.38);c.lineTo(edge,p.y+size);c.lineTo(outer,p.y+size+depth*.3);c.lineTo(outer,p.y+depth*.3);c.closePath();c.clip();
   const dx=left?outer:edge;if(!drawExploreTextureSample(wallTexture,true,theme,x,y,dx,p.y,side,size+depth*.32)){c.fillStyle=theme.wallFace;c.fillRect(dx,p.y,side,size+depth*.32)}
   c.globalAlpha=.68;c.fillStyle=theme.wallFace;c.fillRect(dx,p.y,side,size+depth*.32);c.restore()
  };
  if(open.left)drawSide("left");if(open.right)drawSide("right");

  // A bevel on the wall top makes every boundary readable, including walls
  // below the party where a tall front face would point away from the camera.
  c.save();c.globalAlpha=.34;
  if(open.top){c.fillStyle=theme.wallRim;c.fillRect(p.x,p.y,size,bevel*.5)}
  if(open.left){c.fillStyle=theme.wallRim;c.fillRect(p.x,p.y,bevel*.46,size)}
  if(open.bottom){c.fillStyle=theme.wallFace;c.fillRect(p.x,p.y+size-bevel,size,bevel)}
  if(open.right){c.fillStyle=theme.wallFace;c.fillRect(p.x+size-bevel,p.y,bevel,size)}
  c.restore();

  // Three- and four-sided cells become capped pillars instead of floating
  // squares. Adjacent exposed edges receive a compact masonry corner joint.
  const joints=[];
  if(open.top&&open.left)joints.push([p.x,p.y]);if(open.top&&open.right)joints.push([p.x+size,p.y]);
  if(open.bottom&&open.left)joints.push([p.x,p.y+size]);if(open.bottom&&open.right)joints.push([p.x+size,p.y+size]);
  const joint=Math.max(3,size*.09);c.fillStyle=theme.wallJoint;c.strokeStyle=theme.wallRim;c.lineWidth=Math.max(1,game.camera.z*.85);
  joints.forEach(([jx,jy])=>{c.fillRect(jx-joint/2,jy-joint/2,joint,joint);c.strokeRect(jx-joint/2,jy-joint/2,joint,joint)});
  if(sides>=3){const inset=size*.19;c.save();c.fillStyle=theme.wallFace;c.globalAlpha=.76;c.fillRect(p.x+inset,p.y+inset,size-inset*2,size-inset*2);c.globalAlpha=1;c.strokeStyle=theme.wallRim;c.lineWidth=Math.max(1,game.camera.z);c.strokeRect(p.x+inset,p.y+inset,size-inset*2,size-inset*2);c.fillStyle=theme.wallJoint;const core=size*.16;c.fillRect(p.x+(size-core)/2,p.y+(size-core)/2,core,core);c.restore()}
 }

 // Continuous double-stroked rims remove tile seams and make straight runs,
 // inner corners and pillars join as one structure at every zoom level.
 const traceEdges=()=>{c.beginPath();for(const{p,open}of entries){if(open.top){c.moveTo(p.x,p.y);c.lineTo(p.x+size,p.y)}if(open.bottom){c.moveTo(p.x,p.y+size);c.lineTo(p.x+size,p.y+size)}if(open.left){c.moveTo(p.x,p.y);c.lineTo(p.x,p.y+size)}if(open.right){c.moveTo(p.x+size,p.y);c.lineTo(p.x+size,p.y+size)}}};
 c.lineCap="square";c.lineJoin="miter";c.strokeStyle="rgba(0,0,0,.86)";c.lineWidth=Math.max(2,game.camera.z*3.2);traceEdges();c.stroke();
 c.strokeStyle=theme.wallRim;c.lineWidth=Math.max(1,game.camera.z*1.25);c.shadowColor=theme.light;c.shadowBlur=Math.max(0,game.camera.z*2.2);traceEdges();c.stroke();c.restore()
}
function drawExploreWallArchitecture(world,theme){
 if(!theme.architecture)return;
 for(let y=0;y<world.rows;y++)for(let x=0;x<world.cols;x++){
  if(!world.tiles[y]?.[x])continue;
  const open=exploreWallExposure(world,x,y);
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
function drawExploreWallEdges(world,theme){
 const c=game.ctx;c.save();c.strokeStyle=theme.line;c.lineWidth=Math.max(1,game.camera.z*1.15);c.shadowColor=theme.light;c.shadowBlur=Math.max(0,game.camera.z*1.8);
 for(let y=0;y<world.rows;y++)for(let x=0;x<world.cols;x++){
  if(!world.tiles[y]?.[x])continue;
  const p=game.camera.world(x*TILE,y*TILE),size=TILE*game.camera.z;c.beginPath();
  if(world.tiles[y-1]?.[x]===0){c.moveTo(p.x,p.y);c.lineTo(p.x+size,p.y)}
  if(world.tiles[y+1]?.[x]===0){c.moveTo(p.x,p.y+size);c.lineTo(p.x+size,p.y+size)}
  if(world.tiles[y]?.[x-1]===0){c.moveTo(p.x,p.y);c.lineTo(p.x,p.y+size)}
  if(world.tiles[y]?.[x+1]===0){c.moveTo(p.x+size,p.y);c.lineTo(p.x+size,p.y+size)}
  c.stroke()
 }
 c.restore()
}
function drawExploreDecoration(decoration,theme){
 const frameTime=performance.now(),pulse=.92+Math.sin(frameTime/310+decoration.phase)*.08,usedAlpha=decoration.used?.48:1;
 if(decoration.type==="water"){
  const basinScale=(decoration.scale??1.2)*1.48;
  // 使用前後で石枠の位置・大きさを完全に固定し、中身だけを空にする。
  if(decoration.used&&drawExplorationTileAsset(decoration,explorationTexture("usedWater"),basinScale))return;
  drawExploreAtlas(decoration,EXPLORE_ATLAS.water,{scale:basinScale,alpha:decoration.used?.84:.78});
  const p=game.camera.world(decoration.x*TILE,decoration.y*TILE),size=TILE*game.camera.z;
  game.ctx.save();
  if(decoration.used){game.ctx.fillStyle="#070b0dcc";game.ctx.beginPath();game.ctx.ellipse(p.x+size*.5,p.y+size*.53,size*.32,size*.17,0,0,Math.PI*2);game.ctx.fill()}
  else{game.ctx.strokeStyle="#8ce9ff66";game.ctx.lineWidth=Math.max(1,game.camera.z*.7);for(let line=0;line<2;line++){const y=p.y+size*(.42+line*.18);game.ctx.beginPath();game.ctx.moveTo(p.x+size*(.22+line*.08),y);game.ctx.lineTo(p.x+size*(.72-line*.06),y);game.ctx.stroke()}}
  game.ctx.restore();return
 }
 if(decoration.type==="entrance"){drawExploreAtlas(decoration,EXPLORE_ATLAS.entrance,{scale:(decoration.scale??1.3)*1.5,rotation:decoration.rotation,shadowColor:"#000",shadowBlur:5});return}
 if(decoration.type==="candelabrum"){
  drawExploreGlow(decoration,theme.light,2.72,.1*pulse);drawExploreAtlas(decoration,EXPLORE_ATLAS.candelabrum1,{scale:1.3,shadowColor:theme.light,shadowBlur:2});return
 }
 if(decoration.type==="crystal"){
  if(!decoration.used)drawExploreGlow(decoration,theme.light,1.4,.38*pulse);
  drawExploreAtlas(decoration,EXPLORE_ATLAS.crystal1,{scale:decoration.used?1.22:1.58,alpha:decoration.used?.24:1,shadowColor:decoration.used?"#000":theme.light,shadowBlur:decoration.used?2:9});if(!decoration.used)drawExploreParticles(decoration,theme.light,3,decoration.phase,.45);return
 }
 const index={barrel:EXPLORE_ATLAS.barrel,crate:EXPLORE_ATLAS.crate,bones:EXPLORE_ATLAS.bones}[decoration.type];
 if(index!=null){
  drawExploreAtlas(decoration,index,{scale:(decoration.scale??1)*(decoration.destroyed?1.28:1.62),alpha:decoration.destroyed?.38:usedAlpha,rotation:decoration.destroyed?.16:decoration.rotation,shadowColor:"#000",shadowBlur:decoration.destroyed?2:7});
  if(decoration.destroyed){const p=game.camera.world(decoration.x*TILE,decoration.y*TILE),size=TILE*game.camera.z;game.ctx.save();game.ctx.strokeStyle="#c39a6255";game.ctx.lineWidth=Math.max(1,game.camera.z*.8);game.ctx.beginPath();game.ctx.moveTo(p.x+size*.27,p.y+size*.67);game.ctx.lineTo(p.x+size*.73,p.y+size*.43);game.ctx.moveTo(p.x+size*.3,p.y+size*.43);game.ctx.lineTo(p.x+size*.7,p.y+size*.68);game.ctx.stroke();game.ctx.restore()}
 }
}
function drawBossHotSpring(spring,theme){
 if(!spring?.active)return;
 const pulse=.92+Math.sin(performance.now()/360)*.08,p=game.camera.world(spring.x*TILE,spring.y*TILE),size=TILE*game.camera.z;
 drawExploreGlow(spring,"#87e8ff",6.8,.2*pulse);
 drawExploreAtlas(spring,EXPLORE_ATLAS.water,{scale:Number(spring.scale??5.9),alpha:.96,shadowColor:"#8beaff",shadowBlur:12});
 const c=game.ctx;c.save();c.globalCompositeOperation="screen";
 const water=c.createRadialGradient(p.x+size*.5,p.y+size*.53,size*.15,p.x+size*.5,p.y+size*.53,size*2.05);
 water.addColorStop(0,"rgba(190,250,255,.82)");water.addColorStop(.3,"rgba(45,185,222,.55)");water.addColorStop(.72,"rgba(17,91,128,.32)");water.addColorStop(1,"rgba(0,24,40,0)");
 c.fillStyle=water;c.beginPath();c.ellipse(p.x+size*.5,p.y+size*.54,size*1.95,size*1.12,0,0,Math.PI*2);c.fill();
 c.strokeStyle="rgba(204,252,255,.62)";c.lineWidth=Math.max(1,game.camera.z*.85);
 for(let ring=0;ring<3;ring++){const wave=(performance.now()/900+ring*.29)%1;c.globalAlpha=.65*(1-wave);c.beginPath();c.ellipse(p.x+size*.5,p.y+size*.54,size*(.45+wave*1.45),size*(.2+wave*.72),0,0,Math.PI*2);c.stroke()}
 for(let steam=0;steam<5;steam++){const phase=(performance.now()/1700+steam*.19)%1,x=p.x+size*(-1.15+steam*.58),y=p.y+size*(.05-phase*.95);c.globalAlpha=.32*(1-phase);c.beginPath();c.arc(x+Math.sin(phase*Math.PI*2+steam)*size*.12,y,size*(.13+.12*phase),0,Math.PI*2);c.fillStyle="#d9fbff";c.fill()}
 c.restore()
}
function drawExploreExit(position,image,theme){
 const pulse=.92+Math.sin(performance.now()/240)*.08;
 drawExploreGlow(position,theme.light,3.08,.1*pulse);
 if(!drawExplorationTileAsset(position,image,1.66)){
  drawExploreAtlas(position,EXPLORE_ATLAS.entrance,{scale:1.64,shadowColor:theme.light,shadowBlur:5})
 }
 drawExploreParticles(position,theme.light,4,17,.58)
}
function exploreParticleUnit(seed,index,salt=0){const value=Math.sin((seed+index*97+salt*131)*12.9898)*43758.5453;return value-Math.floor(value)}
function drawExploreAmbientParticles(theme){
 const c=game.ctx,width=game.canvas.width,height=game.canvas.height,time=performance.now()/1000,count=Math.max(10,Math.min(24,Math.round(width/46))),motion=theme.particle,seed=theme.ambienceSeed??1,density=Math.min(devicePixelRatio||1,2);
 c.save();c.globalCompositeOperation="screen";c.fillStyle=theme.light;c.strokeStyle=theme.light;
 for(let index=0;index<count;index++){
  const ux=exploreParticleUnit(seed,index,1),uy=exploreParticleUnit(seed,index,2),speed=.025+exploreParticleUnit(seed,index,3)*.045,wave=Math.sin(time*(.55+speed*4)+index*1.73),size=Math.max(1,Math.round((1+exploreParticleUnit(seed,index,4)*1.7)*density));
  let x=ux*width,y=uy*height,alpha=.13+exploreParticleUnit(seed,index,5)*.32;
  if(motion==="ember"||motion==="spore"||motion==="bubble")y=height-((uy*height+time*height*speed)%height);
  else if(motion==="snow"||motion==="dust")y=(uy*height+time*height*speed)%height;
  x+=wave*(motion==="snow"?18:motion==="firefly"?25:8)*density;
  if(motion==="firefly")y+=Math.cos(time*.8+index)*18*density;
  c.globalAlpha=motion==="spark"?(Math.sin(time*7+index*2.1)>.72?alpha*.95:.035):motion==="star"?alpha*(.55+.45*Math.sin(time*1.8+index)):alpha;
  if(motion==="spark"){
   c.lineWidth=Math.max(1,size*.42);c.beginPath();c.moveTo(x-size*2,y+size);c.lineTo(x+size*2,y-size);c.stroke()
  }else if(motion==="snow"){
   c.fillRect(Math.round(x),Math.round(y),size*1.6,Math.max(1,size*.45))
  }else{
   c.beginPath();c.arc(x,y,motion==="bubble"?size*1.25:size*.65,0,Math.PI*2);motion==="bubble"?c.stroke():c.fill()
  }
 }
 c.restore()
}
function drawExploreAtmosphere(theme){
 const p=game.camera.world(game.player.rx*TILE,game.player.ry*TILE),size=TILE*game.camera.z,cx=p.x+size/2,cy=p.y+size/2;
 game.ctx.fillStyle=theme.floor;game.ctx.fillRect(0,0,game.canvas.width,game.canvas.height);
 const radius=Math.max(game.canvas.width,game.canvas.height)*.64,gradient=game.ctx.createRadialGradient(cx,cy,size*.55,cx,cy,radius);
 gradient.addColorStop(0,"rgba(0,0,0,.04)");gradient.addColorStop(.28,"rgba(0,0,0,.14)");gradient.addColorStop(.63,"rgba(0,0,0,.58)");gradient.addColorStop(1,"rgba(0,0,0,.88)");
 game.ctx.fillStyle=gradient;game.ctx.fillRect(0,0,game.canvas.width,game.canvas.height);drawExploreAmbientParticles(theme)
}
function explorationPartySceneObjects(){
 if(game?.online){return(game.onlineMembers??[]).map((entry,index)=>{const entity=game.onlineEntities?.get(entry.member.playerId),position=entity?{x:entity.rx,y:entity.ry}:entry.member.dungeonPosition??game.world.start;return{y:position.y+.88,order:80+index,draw:()=>{drawOnlineExploreCircle(position,entry.member.profile);drawExplorationMonster(position,entry.monster,false,entry.member.playerId===game.onlineSelfId?1:.95,index)}}})}
 const members=explorationPartyMembers();
 const entries=members.map((monster,index)=>{
  const position=index?explorationFollowerPosition(index):{x:game.player.rx,y:game.player.ry};
  return{y:position.y+.88,order:80+index,draw:()=>drawExplorationMonster(position,monster,false,index ? .95 : 1,index)};
 });
 if(!entries.length){const position={x:game.player.rx,y:game.player.ry};entries.push({y:position.y+.88,order:80,draw:()=>drawExplorationMonster(position,{speciesId:"slime"},false,1,0)})}
 return entries
}
function onlineExploreObjectFoot(object){
 const ground=new Set(["resonanceChest","deluxeChest","coopSwitch","relaySeal","keyFragment","rarePortalChest"]),wall=new Set(["resonanceVault","rarePortal","rareReturnPortal"]);
 return Number(object?.y||0)+(wall.has(object?.type)?.96:ground.has(object?.type)?.72:.9)
}
function drawOnlineExploreObject(object,expedition){
 const c=game.ctx,size=TILE*game.camera.z,point=game.camera.world(object.x*TILE,object.y*TILE),cx=point.x+size/2,cy=point.y+size/2;
 const chestAsset=(entry,open=Boolean(entry.resolved))=>{const wanted=String(entry.rewardTier||expedition?.coop?.floorTier||"black-iron"),tier=["black-iron","silver","gold","abyss"].includes(wanted)?wanted:"black-iron";return onlineCoopAsset(`chest-${tier}-${open?"open":"closed"}`)??onlineCoopAsset(`chest-black-iron-${open?"open":"closed"}`)};
 const merchantTalking=expedition?.interactions?.[game.onlineSelfId]?.action==="browseRareMerchant",merchantClaimed=Boolean(expedition?.coop?.rare?.merchantClaims?.[game.onlineSelfId]),merchantFrames=["idle1","idle2","idle3","idle2"],merchantFrame=merchantClaimed?"idle1":merchantTalking?"talk":merchantFrames[Math.floor(performance.now()/360)%merchantFrames.length];
 c.save();c.textAlign="center";c.textBaseline="middle";
 if(object.type==="resonanceChest"){if(!object.resolved){const nearby=Math.min(2,Number(object.nearbyCount)||0),ready=nearby>=2;c.fillStyle=ready?"rgba(255,205,78,.17)":"rgba(101,72,255,.13)";c.strokeStyle=ready?"#ffd15c":"#73d9ff";c.lineWidth=Math.max(1,2*game.camera.z);c.setLineDash([Math.max(3,5*game.camera.z),Math.max(2,4*game.camera.z)]);c.fillRect(point.x-size,point.y-size,size*3,size*3);c.strokeRect(point.x-size,point.y-size,size*3,size*3);c.setLineDash([]);c.fillStyle=ready?"#ffe8a3":"#e8f8ff";c.font=`900 ${Math.max(9,12*game.camera.z)}px sans-serif`;c.fillText(ready?"開封可能":nearby===1?"あと1人":"2人で共鳴",cx,point.y-size*.72)}drawExplorationGroundAsset(object,chestAsset(object),object.resolved?1.26:1.34)}
 if(object.type==="deluxeChest"){if(!object.resolved)drawExploreGlow(object,"#ffd86a",2.4,.22);drawExplorationGroundAsset(object,chestAsset(object),object.resolved?1.4:1.56)}
 if(object.type==="coopSwitch"){const progress=Math.max(0,Math.min(1,Number(object.holdProgress)||0)),pressed=Boolean(object.pressedBy),asset=object.activated?"switch-activated":progress>.05?"switch-charging":pressed?"switch-pressed":"switch-idle";drawExplorationTileAsset(object,onlineCoopAsset(asset),1.18);if(progress>0&&!object.activated){c.fillStyle="#120d18";c.fillRect(point.x+size*.1,point.y+size*.93,size*.8,Math.max(3,size*.08));c.fillStyle="#64efff";c.fillRect(point.x+size*.1,point.y+size*.93,size*.8*progress,Math.max(3,size*.08))}}
 if(object.type==="relaySeal"){drawExplorationTileAsset(object,onlineCoopAsset(object.active?"switch-activated":"switch-idle"),1.18);c.fillStyle=object.active?"#8dffc0":"#ffe6ab";c.font=`900 ${Math.max(10,size*.2)}px serif`;c.fillText(object.seal,cx,cy)}
 if(object.type==="keyFragment"){drawExploreGlow(object,object.fragment==="cyan"?"#75edff":"#c887ff",1.8,.24);drawExplorationTileAsset(object,onlineCoopAsset(`key-fragment-${object.fragment}`),1.2)}
 if(object.type==="resonanceVault"&&!object.unlocked){drawExploreGlow(object,"#bb73ff",2,.17);drawExplorationWallAsset(object,onlineCoopAsset("vault-sealed"),2.02);c.fillStyle="#f3dcff";c.font=`900 ${Math.max(8,size*.14)}px sans-serif`;c.fillText("共鳴封印",cx,point.y-size*.62)}
 if(object.type==="coopElite"&&!object.resolved){c.beginPath();c.arc(cx,cy,size*.48,0,Math.PI*2);c.fillStyle="rgba(222,36,89,.22)";c.fill();c.strokeStyle="#ff4f7d";c.lineWidth=Math.max(2,size*.06);c.stroke();c.fillStyle="#ffe3ec";c.font=`900 ${Math.max(9,size*.16)}px serif`;c.fillText("共闘強敵",cx,point.y-size*.18)}
 if(object.type==="rareGoldenMonster"&&!object.resolved){drawExploreGlow(object,"#ffd34d",2.6,.24);drawExplorationMonster(object,{speciesId:"rare_golden_beast",level:Math.max(20,Number(expedition?.floor)||1),currentHp:1,onlineStats:{hp:1}},true,1.2,17);c.fillStyle="#fff0a8";c.font=`900 ${Math.max(9,size*.16)}px serif`;c.fillText("黄金乱入",cx,point.y-size*.48)}
 if(object.type==="rareMerchant"){const used=merchantClaimed||object.resolved;c.globalAlpha=used ? .48 : 1;if(!used)drawExploreGlow(object,"#b979ff",2.1,.17);drawExplorationTileAsset(object,onlineCoopAsset(`merchant-${merchantFrame}`),1.34);c.fillStyle=used?"#9d929f":"#f2d8ff";c.font=`900 ${Math.max(9,size*.15)}px serif`;c.fillText(used?"支援受取済":"異界商人",cx,point.y-size*.38)}
 if(object.type==="rarePortal"){c.globalAlpha=object.resolved ? .58 : .84+Math.sin(performance.now()/260)*.12;if(!object.resolved)drawExploreGlow(object,"#a84dff",3,.24);drawExplorationWallAsset(object,onlineCoopAsset(object.resolved?"portal-dormant":"portal-active"),2.16,{active:!object.resolved})}
 if(object.type==="rarePortalGuardian"&&!object.resolved){drawExploreGlow(object,"#ff416f",2.4,.22);drawExplorationMonster(object,{speciesId:"dark_knight",level:Math.max(40,Number(expedition?.floor)||1),currentHp:1,onlineStats:{hp:1}},true,1.4,29);c.fillStyle="#ffe0ed";c.font=`900 ${Math.max(9,size*.16)}px serif`;c.fillText("異界の番人",cx,point.y-size*.5)}
 if(object.type==="rarePortalChest"){if(!object.resolved)drawExploreGlow(object,"#d894ff",2.7,.25);drawExplorationGroundAsset(object,chestAsset({...object,rewardTier:"abyss"}),object.resolved?1.45:1.62)}
 if(object.type==="rareReturnPortal"){c.globalAlpha=.84+Math.sin(performance.now()/260)*.12;drawExploreGlow(object,"#a84dff",2.8,.24);drawExplorationWallAsset(object,onlineCoopAsset("portal-active"),2.08,{active:true});c.fillStyle="#efd8ff";c.font=`900 ${Math.max(8,size*.13)}px serif`;c.fillText("主の世界へ帰還",cx,point.y-size*.55)}
 c.restore()
}
function onlineExploreSceneObjects(){
 if(!game?.online)return[];const expedition=game.onlineRoom?.expedition;
 return(expedition?.objects??[]).filter(object=>!object.hidden&&(!object.resolved||object.persistent)).filter(object=>["resonanceChest","deluxeChest","coopSwitch","resonanceVault","coopElite","relaySeal","keyFragment","rareGoldenMonster","rareMerchant","rarePortal","rarePortalGuardian","rarePortalChest","rareReturnPortal"].includes(object.type)).map((object,index)=>({y:onlineExploreObjectFoot(object),order:44+index,draw:()=>drawOnlineExploreObject(object,expedition)}))
}
function drawExploreSceneObjects(world,floor,theme,stairsTexture){
 const objects=[];
 const add=(y,order,drawObject)=>objects.push({y:Number(y)||0,order,draw:drawObject});
 ensureExploreDecorations(world).filter(item=>item.type!=="water"&&item.type!=="entrance").forEach((item,index)=>add(item.y+(item.type==="candelabrum"?.84:.7),10+index,()=>drawExploreDecoration(item,theme)));
 if(!world.treasureRealm)add(world.exit.y+.9,30,()=>drawExploreExit(world.exit,stairsTexture,theme));
 if(world.shop)add(world.shop.y+.86,40,()=>drawExploreAtlas(world.shop,EXPLORE_ATLAS.entrance,{scale:1.72,rotation:world.shop.rotation??0,shadowColor:"#000",shadowBlur:6}));
 if(world.boss){const boss=game?.online?world.onlineBossMonster:floorBossEnemy();if(boss)add(world.boss.y+.9,60,()=>drawExplorationMonster(world.boss,{...boss,speciesId:boss.speciesId,visualSpeciesId:boss.visualSpeciesId,level:boss.level},true,1.92,9))}
	 (world.chests??[]).forEach((chest,index)=>add(chest.y+.72,50+index,()=>drawExploreAtlas(chest,chest.open?EXPLORE_ATLAS.chestOpen:EXPLORE_ATLAS.chestClosed,{scale:1.7,shadowColor:chest.locked?"#f2cf72":"#000",shadowBlur:chest.locked?13:7})));
	 objects.push(...onlineExploreSceneObjects());
	 objects.push(...explorationPartySceneObjects());
 objects.sort((a,b)=>a.y-b.y||a.order-b.order).forEach(entry=>entry.draw())
}
function showTutorialPickupMarker(){
 if(game?.online){document.querySelector(".tutorial-world-marker")?.remove();return}
 const stage=document.querySelector(".explore-stage"),canvas=game?.canvas??document.getElementById("gameCanvas"),pickup=ensureFirstTutorialPickup(game?.world);if(!stage||!canvas||!pickup||pickup.used||contextGuideDone("explore_pickup")){document.querySelector(".tutorial-world-marker")?.remove();return}
 let marker=stage.querySelector(".tutorial-world-marker");if(!marker){marker=document.createElement("span");marker.className="tutorial-world-marker";marker.setAttribute("aria-hidden","true");stage.appendChild(marker)}
 const stageRect=stage.getBoundingClientRect(),canvasRect=canvas.getBoundingClientRect(),point=game.camera.world(pickup.x*TILE,pickup.y*TILE),tile=TILE*game.camera.z,scaleX=canvasRect.width/Math.max(1,canvas.width),scaleY=canvasRect.height/Math.max(1,canvas.height);
 marker.style.left=`${canvasRect.left-stageRect.left+(point.x+tile/2)*scaleX-17}px`;marker.style.top=`${canvasRect.top-stageRect.top+(point.y+tile/2)*scaleY-17}px`;
}
function drawOnlineExploreOverlays(){
	 if(!game?.online)return;
	 const c=game.ctx,size=TILE*game.camera.z,expedition=game.onlineRoom?.expedition,objects=[],now=Date.now(),selfEntity=game.onlineEntities?.get(game.onlineSelfId);c.save();c.textAlign="center";c.textBaseline="middle";
 const chestAsset=(object,open=Boolean(object.resolved))=>{const wanted=String(object.rewardTier||expedition?.coop?.floorTier||"black-iron"),tier=["black-iron","silver","gold","abyss"].includes(wanted)?wanted:"black-iron";return onlineCoopAsset(`chest-${tier}-${open?"open":"closed"}`)??onlineCoopAsset(`chest-black-iron-${open?"open":"closed"}`)};
 const merchantTalking=expedition?.interactions?.[game.onlineSelfId]?.action==="browseRareMerchant",merchantClaimed=Boolean(expedition?.coop?.rare?.merchantClaims?.[game.onlineSelfId]),merchantFrames=["idle1","idle2","idle3","idle2"],merchantFrame=merchantClaimed?"idle1":merchantTalking?"talk":merchantFrames[Math.floor(performance.now()/360)%merchantFrames.length];
 for(const object of objects){if(object.hidden||object.resolved&&!object.persistent)continue;const point=game.camera.world(object.x*TILE,object.y*TILE),cx=point.x+size/2,cy=point.y+size/2;
  if(object.type==="resonanceChest"){if(!object.resolved){const nearby=Math.min(2,Number(object.nearbyCount)||0),ready=nearby>=2;c.fillStyle=ready?"rgba(255,205,78,.17)":"rgba(101,72,255,.13)";c.strokeStyle=ready?"#ffd15c":"#73d9ff";c.lineWidth=Math.max(1,2*game.camera.z);c.setLineDash([Math.max(3,5*game.camera.z),Math.max(2,4*game.camera.z)]);c.fillRect(point.x-size,point.y-size,size*3,size*3);c.strokeRect(point.x-size,point.y-size,size*3,size*3);c.setLineDash([]);c.fillStyle=ready?"#ffe8a3":"#e8f8ff";c.font=`900 ${Math.max(9,12*game.camera.z)}px sans-serif`;c.fillText(ready?"開封可能":nearby===1?"あと1人":"2人で共鳴",cx,point.y-size*.72)}drawExplorationGroundAsset(object,chestAsset(object),object.resolved?1.26:1.34)}
  if(object.type==="deluxeChest"){if(!object.resolved)drawExploreGlow(object,"#ffd86a",2.4,.22);drawExplorationGroundAsset(object,chestAsset(object),object.resolved?1.4:1.56)}
  if(object.type==="coopSwitch"){const progress=Math.max(0,Math.min(1,Number(object.progress)||0)),asset=object.active?"switch-activated":progress>0?"switch-charging":object.occupied?"switch-pressed":"switch-idle";drawExplorationTileAsset(object,onlineCoopAsset(asset),1.22);if(progress>0&&!object.active){c.beginPath();c.arc(cx,cy,size*.46,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);c.strokeStyle="#fff3a2";c.lineWidth=Math.max(2,size*.08);c.stroke()}}
  if(object.type==="relaySeal"){drawExplorationTileAsset(object,onlineCoopAsset(object.active?"switch-activated":"switch-idle"),1.18);c.fillStyle=object.active?"#8dffc0":"#ffe6ab";c.font=`900 ${Math.max(10,size*.2)}px serif`;c.fillText(object.seal,cx,cy)}
  if(object.type==="keyFragment"){drawExploreGlow(object,object.fragment==="cyan"?"#75edff":"#c887ff",1.8,.24);drawExplorationTileAsset(object,onlineCoopAsset(`key-fragment-${object.fragment}`),1.2)}
  if(object.type==="resonanceVault"&&!object.unlocked){drawExploreGlow(object,"#bb73ff",2,.17);drawExplorationWallAsset(object,onlineCoopAsset("vault-sealed"),2.02);c.fillStyle="#f3dcff";c.font=`900 ${Math.max(8,size*.14)}px sans-serif`;c.fillText("共鳴封印",cx,point.y-size*.62)}
  if(object.type==="coopElite"&&!object.resolved){c.beginPath();c.arc(cx,cy,size*.48,0,Math.PI*2);c.fillStyle="rgba(222,36,89,.22)";c.fill();c.strokeStyle="#ff4f7d";c.lineWidth=Math.max(2,size*.06);c.stroke();c.fillStyle="#ffe3ec";c.font=`900 ${Math.max(9,size*.16)}px serif`;c.fillText("共闘強敵",cx,point.y-size*.18)}
  if(object.type==="rareGoldenMonster"&&!object.resolved){drawExploreGlow(object,"#ffd34d",2.6,.24);drawExplorationMonster(object,{speciesId:"rare_golden_beast",level:Math.max(20,Number(expedition?.floor)||1),currentHp:1,onlineStats:{hp:1}},true,1.2,17);c.fillStyle="#fff0a8";c.font=`900 ${Math.max(9,size*.16)}px serif`;c.fillText("黄金乱入",cx,point.y-size*.48)}
  if(object.type==="rareMerchant"){const used=merchantClaimed||object.resolved;c.save();c.globalAlpha=used ? 0.48 : 1;if(!used)drawExploreGlow(object,"#b979ff",2.1,.17);drawExplorationTileAsset(object,onlineCoopAsset(`merchant-${merchantFrame}`),1.34);c.fillStyle=used?"#9d929f":"#f2d8ff";c.font=`900 ${Math.max(9,size*.15)}px serif`;c.fillText(used?"支援受取済":"異界商人",cx,point.y-size*.38);c.restore()}
  if(object.type==="rarePortal"){c.save();c.globalAlpha=object.resolved ? .58 : .84+Math.sin(performance.now()/260)*.12;if(!object.resolved)drawExploreGlow(object,"#a84dff",3,.24);drawExplorationWallAsset(object,onlineCoopAsset(object.resolved?"portal-dormant":"portal-active"),2.16,{active:!object.resolved});c.restore()}
  if(object.type==="rarePortalGuardian"&&!object.resolved){drawExploreGlow(object,"#ff416f",2.4,.22);drawExplorationMonster(object,{speciesId:"dark_knight",level:Math.max(40,Number(expedition?.floor)||1),currentHp:1,onlineStats:{hp:1}},true,1.4,29);c.fillStyle="#ffe0ed";c.font=`900 ${Math.max(9,size*.16)}px serif`;c.fillText("異界の番人",cx,point.y-size*.5)}
  if(object.type==="rarePortalChest"){if(!object.resolved)drawExploreGlow(object,"#d894ff",2.7,.25);drawExplorationGroundAsset(object,chestAsset({...object,rewardTier:"abyss"}),object.resolved?1.45:1.62)}
  if(object.type==="rareReturnPortal"){c.save();c.globalAlpha=.84+Math.sin(performance.now()/260)*.12;drawExploreGlow(object,"#a84dff",2.8,.24);drawExplorationWallAsset(object,onlineCoopAsset("portal-active"),2.08,{active:true});c.restore();c.fillStyle="#efd8ff";c.font=`900 ${Math.max(8,size*.13)}px serif`;c.fillText("主の世界へ帰還",cx,point.y-size*.55)}
 }
 const drawBubble=(cx,cy,text,color="#9f7cff")=>{text=String(text??"").slice(0,28);const font=Math.max(10,13*game.camera.z),padding=Math.max(5,7*game.camera.z);c.font=`800 ${font}px sans-serif`;const width=Math.min(game.canvas.width*.48,Math.max(size*1.2,c.measureText(text).width+padding*2)),height=font+padding*1.7,x=Math.max(4,Math.min(game.canvas.width-width-4,cx-width/2)),y=Math.max(4,cy-height-size*.46);c.fillStyle="rgba(250,247,255,.96)";c.strokeStyle=color;c.lineWidth=Math.max(1,2*game.camera.z);c.beginPath();c.roundRect(x,y,width,height,Math.max(4,8*game.camera.z));c.fill();c.stroke();c.beginPath();c.moveTo(cx-5,y+height);c.lineTo(cx,y+height+7);c.lineTo(cx+5,y+height);c.fill();c.fillStyle="#16101d";c.fillText(text,x+width/2,y+height/2)};
 for(const entry of game.onlineMembers??[]){const entity=game.onlineEntities?.get(entry.member.playerId);if(!entity)continue;const point=game.camera.world(entity.rx*TILE,entity.ry*TILE),cx=point.x+size/2,cy=point.y,hp=Number(entry.member.coopVitals?.hp??1),maxHp=Math.max(1,Number(entry.member.coopVitals?.maxHp??1));if(hp<=0){c.fillStyle="#ff587d";c.strokeStyle="#2b0610";c.lineWidth=Math.max(2,size*.04);c.font=`900 ${Math.max(15,size*.32)}px sans-serif`;c.strokeText("✚",cx,cy-size*.18);c.fillText("✚",cx,cy-size*.18)}const bubble=(game.onlineChatBubbles??[]).find(item=>item.playerId===entry.member.playerId&&Number(item.expiresAt)>now),social=(game.onlineSocialBubbles??[]).find(item=>item.playerId===entry.member.playerId&&Number(item.expiresAt)>now);if(bubble)drawBubble(cx,cy,bubble.text,entry.member.playerId===game.onlineSelfId?"#79e9ff":"#9f7cff");else if(social)drawBubble(cx,cy,social.emoji,"#ffd86c");if(entry.member.playerId===game.onlineSelfId)continue;const outside=cx<-8||cy<-8||cx>game.canvas.width+8||cy>game.canvas.height+8;if(outside){const center={x:game.canvas.width/2,y:game.canvas.height/2},dx=cx-center.x,dy=cy-center.y,length=Math.max(1,Math.hypot(dx,dy)),edge={x:center.x+dx/length*(Math.min(game.canvas.width,game.canvas.height)*.42),y:center.y+dy/length*(Math.min(game.canvas.width,game.canvas.height)*.42)},distance=selfEntity?Math.round(Math.hypot(entity.rx-selfEntity.rx,entity.ry-selfEntity.ry)):0,color=hp<=0?"#ff456f":hp/maxHp<=.3?"#ffd34f":"#7deaff";c.fillStyle=color;c.font=`900 ${Math.max(10,size*.14)}px sans-serif`;c.fillText(`${hp<=0?"救助 ":""}${entry.member.profile?.displayName??"仲間"} ${distance}マス`,edge.x,edge.y);c.beginPath();c.moveTo(edge.x+dx/length*12,edge.y+dy/length*12);c.lineTo(edge.x-dy/length*6,edge.y+dx/length*6);c.lineTo(edge.x+dy/length*6,edge.y-dx/length*6);c.fill()}}
 for(const ping of game.onlinePings??[]){if(Number(ping.expiresAt)<=now)continue;const point=game.camera.world(Number(ping.position?.x)*TILE,Number(ping.position?.y)*TILE),cx=point.x+size/2,cy=point.y+size/2,inside=cx>=0&&cy>=0&&cx<=game.canvas.width&&cy<=game.canvas.height;c.fillStyle="#61f2ff";c.strokeStyle="#071118";c.lineWidth=Math.max(2,size*.04);c.font=`900 ${Math.max(14,size*.26)}px sans-serif`;if(inside){c.strokeText("◆",cx,cy-size*.36);c.fillText("◆",cx,cy-size*.36);drawBubble(cx,cy-size*.12,`${ping.name??"仲間"}：${ping.label}`,"#61f2ff")}else{const dx=cx-game.canvas.width/2,dy=cy-game.canvas.height/2,length=Math.max(1,Math.hypot(dx,dy)),radius=Math.min(game.canvas.width,game.canvas.height)*.38;c.fillText(`◆ ${ping.label}`,game.canvas.width/2+dx/length*radius,game.canvas.height/2+dy/length*radius)}}
 c.restore()
}
function draw(){
 const c=game.ctx,w=game.world,floor=game?.online?game.onlineFloor:save.state.player.currentFloor,palette=worldPresentationForFloor(floor),theme=exploreBandTheme(floor),floorTexture=explorationTexture("floor",theme),wallTexture=explorationTexture("wall",theme),stairsTexture=explorationTexture("stairs",theme);
 c.fillStyle="#06070a";c.fillRect(0,0,game.canvas.width,game.canvas.height);c.imageSmoothingEnabled=false;
 for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++){
  const p=game.camera.world(x*TILE,y*TILE),s=TILE*game.camera.z,blocked=Boolean(w.tiles[y][x]),image=blocked?wallTexture:floorTexture;
  if(image){
   // Keep neighbouring source samples continuous. Random crop offsets made each
   // logical cell edge visible as an unintended square grid on the dungeon.
   drawExploreTextureSample(image,blocked,theme,x,y,p.x,p.y,s+1,s+1);
   c.fillStyle=blocked?theme.wall:theme.floor;c.fillRect(p.x,p.y,s+1,s+1)
  }else{c.fillStyle=blocked?palette.wall:palette.floor;c.fillRect(p.x,p.y,s+1,s+1)}
 }
 drawExploreRaisedWalls(w,theme,wallTexture);
 drawExploreWallArchitecture(w,theme);
 drawExploreWallEdges(w,theme);
 if(w.treasureRealm){const realmShade=c.createRadialGradient(game.canvas.width/2,game.canvas.height*.48,0,game.canvas.width/2,game.canvas.height*.48,Math.max(game.canvas.width,game.canvas.height)*.72);realmShade.addColorStop(0,"rgba(108,38,145,.04)");realmShade.addColorStop(.58,"rgba(52,10,71,.17)");realmShade.addColorStop(1,"rgba(4,1,8,.5)");c.save();c.fillStyle=realmShade;c.fillRect(0,0,game.canvas.width,game.canvas.height);c.restore()}
 const decorations=ensureExploreDecorations(w);
 decorations.filter(item=>item.type==="water"||item.type==="entrance").sort((a,b)=>a.y-b.y).forEach(item=>drawExploreDecoration(item,theme));
 drawBossHotSpring(w.hotSpring,theme);
 drawExploreSceneObjects(w,floor,theme,stairsTexture);
 drawExploreAtmosphere(theme);
 drawOnlineExploreOverlays();
 // Only broad, feathered light is repainted above the fog. The actual props
 // stay in the Y-sorted scene so party members can naturally pass in front.
 if(!w.treasureRealm)drawExploreSoftAura(w.exit,theme.light,3.25,.075);
 decorations.filter(item=>item.type==="candelabrum").forEach(item=>drawExploreSoftAura(item,theme.light,2.85,.065));
 drawMini(theme);
 showTutorialPickupMarker();
}
function drawMini(theme=exploreBandTheme(game?.online?game.onlineFloor:save.state.player.currentFloor)){
 const m=document.getElementById("miniMap");
 if(!m||!game?.running)return;
 const w=game.world;
 if(save.state.settings.minimapVisible===false){m.style.opacity=0;return}
 m.style.opacity=1;
 const c=m.getContext("2d"),cell=Math.min(m.width/w.cols,m.height/w.rows),ox=(m.width-w.cols*cell)/2,oy=(m.height-w.rows*cell)/2;
 c.fillStyle=theme.dark;c.fillRect(0,0,m.width,m.height);
 for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++){
  c.fillStyle=w.tiles[y][x]?theme.minimapWall:theme.minimapFloor;
  c.fillRect(ox+x*cell,oy+y*cell,cell,cell)
 }
 if(!w.treasureRealm){c.fillStyle=theme.light;c.fillRect(ox+w.exit.x*cell,oy+w.exit.y*cell,cell,cell)}
 if(game.online){for(const entry of game.onlineMembers??[]){const entity=game.onlineEntities?.get(entry.member.playerId);if(!entity)continue;const hp=Number(entry.member.coopVitals?.hp??1),maxHp=Math.max(1,Number(entry.member.coopVitals?.maxHp??1));c.fillStyle=entry.member.playerId===game.onlineSelfId?"#5dff82":hp<=0?"#ff3d68":hp/maxHp<=.3?"#ffd34f":"#74dff4";c.fillRect(ox+entity.x*cell,oy+entity.y*cell,cell,cell)}for(const ping of game.onlinePings??[]){if(Number(ping.expiresAt)<=Date.now())continue;c.fillStyle="#fffb82";c.beginPath();c.arc(ox+(Number(ping.position?.x)+.5)*cell,oy+(Number(ping.position?.y)+.5)*cell,Math.max(2,cell*.8),0,Math.PI*2);c.fill()}}else{c.fillStyle="#5dff82";c.fillRect(ox+game.player.x*cell,oy+game.player.y*cell,cell,cell)}
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
  if(save.state.settings.exploreAutoMode!=="off"){save.state.settings.exploreAutoMode="off";save.save();showExploreNotice("手動操作へ切り替え")}
  const route=path(game.world,game.player,g);game.player.setPath(route);if(route.length)completeContextGuide("explore_move",{quiet:true})
 };
 c.onpointercancel=c.onlostpointercapture=finish
}
function stopGame(){if(!game)return;game.running=false;if(game.elapsedTimer)clearInterval(game.elapsedTimer);const c=game.canvas;if(c)c.onpointerdown=c.onpointermove=c.onpointerup=c.onpointercancel=c.onlostpointercapture=null}
function pauseModal(title,body){game.paused=true;app.insertAdjacentHTML("beforeend",Modal(title,body));const modal=topModal(),close=()=>{modal?.remove();if(game&&!document.querySelector(".game-modal")){game.paused=false;if(exploreAutoActive())requestAnimationFrame(applyExploreAutoPath)}};modal._onDismiss=close;modal.querySelector("[data-modal-primary]").onclick=close;if(exploreAutoActive()){const generation=exploreActionGeneration;setTimeout(()=>{if(generation!==exploreActionGeneration||!modal.isConnected||!exploreAutoActive())return;modal.querySelector("[data-modal-primary]")?.click()},360)}return modal}


function battleSpeed(){return normalizeBattleSpeed(save.state.settings.battleSpeed)}
function scaledBattleDelay(ms){return Math.max(20,Math.round(Math.max(0,Number(ms)||0)/battleSpeed()))}
function wait(ms){return new Promise(r=>setTimeout(r,scaledBattleDelay(ms)))}
function battleTarget(target){
 if(target==="enemy")return document.querySelector(".enemy-combatant.targeted")??document.querySelector(".enemy-combatant");if(String(target).startsWith("enemy-"))return document.getElementById(`enemy-${target}`);
 if(target==="party")return document.querySelector(".battle-party");
 return document.getElementById(`ally-${target}`);
}
function battleHpState(target){
 const id=String(target??"");
 if(id.startsWith("enemy-")){
  const unit=(battle?.enemies??[]).find(enemy=>enemy.id===id);if(!unit)return null;
  const max=Math.max(1,Number(unit.maxHp)||1),current=Math.max(0,Math.min(max,Number(unit.hp)||0));
  return{key:`enemy:${id}`,current,max,rate:current/max*100};
 }
 const unit=(battle?.party??[]).find(monster=>monster.id===id);if(!unit)return null;
 const max=Math.max(1,calculatedStats(unit).hp),current=Math.max(0,Math.min(max,Number(unit.currentHp)||0));
 return{key:`ally:${id}`,current,max,rate:current/max*100};
}
function battleResourceState(target,resource="hp"){
 if(resource==="hp")return battleHpState(target);
 const id=String(target??"");
 if(id.startsWith("enemy-")){
  const unit=(battle?.enemies??[]).find(enemy=>enemy.id===id);if(!unit)return null;
  const max=Math.max(0,Number(unit.maxMp)||0),current=Math.max(0,Math.min(max,Number(unit.currentMp)||0));
  return{key:`enemy:${id}:mp`,current,max,rate:max?current/max*100:0};
 }
 const unit=(battle?.party??[]).find(monster=>monster.id===id);if(!unit)return null;
 const max=Math.max(0,maxMp(unit)),current=Math.max(0,Math.min(max,Number(unit.currentMp)||0));
 return{key:`ally:${id}:mp`,current,max,rate:max?current/max*100:0};
}
function queueBattleRecovery(target,resource,before,after){
 if(!battle)return;const id=typeof target==="object"?target?.id:target,from=Math.max(0,Number(before)||0),to=Math.max(0,Number(after)||0);if(!id||to<=from)return;
 battle._pendingRecoveries??={};const key=`${resource}:${id}`,current=battle._pendingRecoveries[key];battle._pendingRecoveries[key]={target:String(id),resource,from:current?Math.min(current.from,from):from,to:Math.max(current?.to??0,to)};
}
async function animateBattleRecoveryGauge(entry){
 const {target,resource,from}=entry,state=battleResourceState(target,resource),element=battleTarget(target),bar=resource==="hp"?element?.querySelector(".battle-bar.enemy-hp,.battle-bar.ally"):element?.querySelector(".battle-bar.mp"),fill=resource==="hp"?bar?.querySelector(".hp-fill"):bar?.querySelector(".resource-fill, i"),label=bar?.querySelector(".bar-label");
 if(!state||!state.max||!element||!bar||!fill||!label||state.current<=from)return;
 const fromValue=Math.max(0,Math.min(state.max,from)),fromRate=fromValue/state.max*100,toRate=state.rate,gain=state.current-fromValue,duration=scaledBattleDelay(Math.min(1050,Math.max(520,430+(toRate-fromRate)*7))),kind=resource==="hp"?"hp":"mp",reduceMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
 element.classList.remove(`fx-${kind}-recover`);bar.classList.add(`is-${kind}-recovering`);void element.offsetWidth;element.classList.add(`fx-${kind}-recover`);
 const flash=document.createElement("span");flash.className=`battle-unit-recovery-flash ${kind}`;flash.setAttribute("aria-hidden","true");element.appendChild(flash);burstParticles(target,kind==="hp"?"heal":"mana",12);
 fill.style.animation="none";fill.style.transition="none";fill.style.width=`${fromRate}%`;label.textContent=`${resource.toUpperCase()} ${Math.round(fromValue)}/${state.max}`;void fill.offsetWidth;
 if(reduceMotion){fill.style.width=`${toRate}%`;label.textContent=`${resource.toUpperCase()} ${state.current}/${state.max}`;bar.classList.remove(`is-${kind}-recovering`);setTimeout(()=>{element.classList.remove(`fx-${kind}-recover`);flash.remove()},20);return}
 fill.style.transition=`width ${duration}ms cubic-bezier(.2,.76,.18,1)`;fill.style.width=`${toRate}%`;
 await new Promise(resolve=>{const started=performance.now(),finish=()=>{fill.style.transition="none";fill.style.width=`${toRate}%`;label.textContent=`${resource.toUpperCase()} ${state.current}/${state.max}`;bar.classList.remove(`is-${kind}-recovering`);element.classList.remove(`fx-${kind}-recover`);flash.remove();resolve()},tick=now=>{if(!bar.isConnected)return finish();const progress=Math.min(1,(now-started)/Math.max(1,duration)),eased=1-Math.pow(1-progress,3),shown=Math.min(state.current,Math.round(fromValue+gain*eased));label.textContent=`${resource.toUpperCase()} ${shown}/${state.max}`;if(progress<1)requestAnimationFrame(tick);else finish()};requestAnimationFrame(tick)});
}
async function playBattleResurrectionFx(revives,recoveries){
 const arena=document.querySelector(".battle-arena");
 if(!arena||!revives.length){await Promise.all(recoveries.map(animateBattleRecoveryGauge));return}
 const arenaRect=arena.getBoundingClientRect(),enemyCount=revives.filter(entry=>(battle.enemies??[]).some(enemy=>enemy.id===entry.target)).length,enemySide=enemyCount===revives.length,sideTotal=enemySide?(battle.enemies??[]).length:(battle.party??[]).length,allSide=revives.length>1&&revives.length===sideTotal,title=allSide?"全軍復活":revives.length>1?"連鎖蘇生":enemySide?"再構成":"蘇生";
 const fx=document.createElement("div");fx.className=`battle-resurrection-fx ${enemySide?"enemy-revival":"ally-revival"} ${revives.length>1?"multi-revival":"single-revival"}`;fx.setAttribute("role","status");fx.setAttribute("aria-live","assertive");fx.style.setProperty("--revive-rise",`${scaledBattleDelay(920)}ms`);fx.innerHTML=`<span class="resurrection-screen-dim"></span><strong class="resurrection-title"><small>${enemySide?"ABYSS RECONSTRUCTION":"SOUL RETURN"}</small>${title}<em>${revives.length>1?`${revives.length}体 同時帰還`:"生命反応、再点火"}</em></strong>`;
 for(const [index,entry] of revives.entries()){
  const element=battleTarget(entry.target);if(!element)continue;setMonsterVisualFrame(element,"down");element.classList.add("is-reviving");const rect=element.getBoundingClientRect(),x=rect.left-arenaRect.left+rect.width/2,y=rect.top-arenaRect.top+rect.height*.58,column=document.createElement("span"),isEnemy=(battle.enemies??[]).some(enemy=>enemy.id===entry.target);column.className=`resurrection-column ${isEnemy?"enemy":"ally"}`;column.style.setProperty("--revive-x",`${x}px`);column.style.setProperty("--revive-y",`${y}px`);column.style.setProperty("--revive-delay",`${index*45}ms`);column.innerHTML=`<i class="resurrection-pillar"></i><i class="resurrection-sigil"><u></u><u></u><u></u></i><i class="resurrection-ground-ring"></i><span class="resurrection-particles">${Array.from({length:10},(_,particle)=>`<u style="--particle-index:${particle}"></u>`).join("")}</span>`;fx.appendChild(column);
 }
 arena.appendChild(fx);audio.sfx(enemySide?"boss":"heal");requestAnimationFrame(()=>fx.classList.add("is-active"));await wait(300);fx.classList.add("is-awakening");battleFlash("revive");
 for(const entry of revives){const element=battleTarget(entry.target);if(!element)continue;setMonsterVisualFrame(element,"idle");element.classList.add("is-revived");burstParticles(entry.target,(battle.enemies??[]).some(enemy=>enemy.id===entry.target)?"enemy":"heal",18)}
 const gauges=Promise.all(recoveries.map(animateBattleRecoveryGauge));await Promise.all([gauges,wait(920)]);fx.classList.add("is-leaving");await wait(260);fx.remove();for(const entry of revives)battleTarget(entry.target)?.classList.remove("is-reviving","is-revived");
}
async function flushBattleRecoveries(){
 const entries=Object.values(battle?._pendingRecoveries??{});if(battle)battle._pendingRecoveries={};
 if(entries.length){const revives=entries.filter(entry=>entry.resource==="hp"&&entry.from<=0&&entry.to>0),reviveIds=new Set(revives.map(entry=>entry.target)),reviveRecoveries=entries.filter(entry=>reviveIds.has(entry.target)),ordinary=entries.filter(entry=>!reviveIds.has(entry.target));if(revives.length)await Promise.all([playBattleResurrectionFx(revives,reviveRecoveries),...ordinary.map(animateBattleRecoveryGauge)]);else{audio.sfx("heal");await Promise.all(entries.map(animateBattleRecoveryGauge))}}
 await flushMagicCircleEvents();
}
function hpDrainDuration(fromRate,toRate){
 const loss=Math.max(0,Number(fromRate)-Number(toRate));
 return scaledBattleDelay(Math.min(1150,Math.max(520,440+loss*7.1)));
}
function animateBattleHpGauge(target,element=battleTarget(target)){
 const state=battleHpState(target),bar=element?.querySelector(".battle-bar.enemy-hp,.battle-bar.ally"),fill=bar?.querySelector(".hp-fill"),label=bar?.querySelector(".bar-label");
 if(!state||!bar||!fill||!label)return Promise.resolve();
 battle.hpDisplayRates??={};battle.hpTrails??={};
 const labelHp=Number(String(label.textContent).match(/HP\s*([\d,]+)/)?.[1]?.replaceAll(",","")??NaN),tracked=Number(battle.hpDisplayRates[state.key]),inline=Number.parseFloat(fill.style.width),fromRate=Number.isFinite(tracked)?tracked:Number.isFinite(inline)?inline:state.rate,fromHp=Number.isFinite(labelHp)?labelHp:Math.round(state.max*fromRate/100),toRate=Math.max(0,Math.min(100,state.rate));
 if(toRate>=fromRate-.01||state.current>=fromHp){battle.hpDisplayRates[state.key]=toRate;delete battle.hpTrails[state.key];fill.style.width=`${toRate}%`;label.textContent=`HP ${state.current}/${state.max}`;return Promise.resolve()}
 const duration=hpDrainDuration(fromRate,toRate),reduceMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
 if(reduceMotion){battle.hpDisplayRates[state.key]=toRate;delete battle.hpTrails[state.key];fill.style.width=`${toRate}%`;label.textContent=`HP ${state.current}/${state.max}`;return Promise.resolve()}
 bar.classList.add("is-hp-draining");fill.classList.remove("hp-fill-draining");fill.style.animation="none";fill.style.transition="none";fill.style.width=`${fromRate}%`;label.textContent=`HP ${fromHp}/${state.max}`;void fill.offsetWidth;
 fill.style.transition=`width ${duration}ms cubic-bezier(.18,.72,.2,1)`;fill.style.width=`${toRate}%`;
 return new Promise(resolve=>{
  const started=performance.now(),finish=()=>{battle.hpDisplayRates[state.key]=toRate;delete battle.hpTrails[state.key];bar.classList.remove("is-hp-draining");fill.style.transition="none";fill.style.width=`${toRate}%`;label.textContent=`HP ${state.current}/${state.max}`;resolve()};
  const tick=now=>{if(!bar.isConnected)return finish();const progress=Math.min(1,(now-started)/Math.max(1,duration)),eased=1-Math.pow(1-progress,3),shown=Math.max(state.current,Math.round(fromHp+(state.current-fromHp)*eased));label.textContent=`HP ${shown}/${state.max}`;if(progress<1)requestAnimationFrame(tick);else finish()};
  requestAnimationFrame(tick);
 });
}
function triggerBattleImpact(element,critical=false){
 const arena=document.querySelector(".battle-arena");
 if(arena){arena.classList.remove("fx-impact-shake","fx-impact-shake-critical");void arena.offsetWidth;arena.classList.add(critical?"fx-impact-shake-critical":"fx-impact-shake");setTimeout(()=>arena.classList.remove("fx-impact-shake","fx-impact-shake-critical"),scaledBattleDelay(critical?420:300))}
 if(element){const flash=document.createElement("span");flash.className=`battle-unit-hit-flash ${critical?"critical":""}`;flash.setAttribute("aria-hidden","true");element.appendChild(flash);setTimeout(()=>flash.remove(),scaledBattleDelay(critical?440:320))}
 battleFlash(critical?"critical":"hit");
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
 triggerBattleImpact(el,critical);
 await Promise.all([wait(critical?320:280),animateBattleHpGauge(target,el)]);
 el.classList.remove("fx-hit","fx-critical-hit");
 if((battleHpState(target)?.current??1)>0)setMonsterVisualFrame(el,"idle");
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
 const source=String(text),amount=Math.max(0,...(source.match(/\d+/g)??[]).map(Number)),formatted=source.replace(/\d{4,}/g,value=>Number(value).toLocaleString());
 n.className=`floating-number ${type}${amount>=1e6?" mega":""}${amount>=1e9?" colossal":""}`;n.setAttribute("aria-label",formatted);
 const match=formatted.match(/^(.*?)([\d,]+)([^\d]*)$/);
 if(match&&["damage","critical","skill","enemy"].includes(type)){
  const [,prefix,digits,suffix]=match;n.innerHTML=`<span class="damage-prefix">${prefix}</span><span class="damage-slot-digits">${[...digits].map((digit,index)=>digit===","?'<i class="comma">,</i>':`<i data-final-digit="${digit}" style="--digit-index:${index}">0</i>`).join("")}</span><span class="damage-suffix">${suffix}</span>`;
  const slots=[...n.querySelectorAll("[data-final-digit]")],started=performance.now(),settle=300;
  const spin=now=>{const elapsed=now-started;slots.forEach((slot,index)=>{const local=elapsed-index*24;if(local>=settle){slot.textContent=slot.dataset.finalDigit;slot.classList.add("settled")}else slot.textContent=String(Math.floor(Math.random()*10))});if(slots.some(slot=>!slot.classList.contains("settled")))requestAnimationFrame(spin)};requestAnimationFrame(spin);
 }else n.textContent=formatted;
 n.style.left=`${r.left-lr.left+r.width/2}px`;n.style.top=`${r.top-lr.top+r.height*.35}px`;
 const glyphs=[...formatted].length,baseSize=type==="critical"?glyphs>20?1.05:glyphs>16?1.22:glyphs>12?1.48:1.9:glyphs>18?.85:glyphs>14?1.02:glyphs>10?1.22:1.5;
 n.style.setProperty("font-size",`${baseSize}rem`,"important");n.style.setProperty("max-width","94%","important");
 layer.appendChild(n);requestAnimationFrame(()=>{
  if(!n.isConnected)return;const available=Math.max(80,lr.width*.68),natural=Math.max(n.scrollWidth,n.getBoundingClientRect().width);
  if(natural>available){const current=parseFloat(getComputedStyle(n).fontSize)||16;n.style.setProperty("font-size",`${Math.max(9,current*available/natural)}px`,"important")}
  requestAnimationFrame(()=>{if(!n.isConnected)return;const fixedWidth=Math.min(available,Math.max(n.scrollWidth,n.getBoundingClientRect().width)),half=fixedWidth/2,center=Math.max(half+4,Math.min(lr.width-half-4,parseFloat(n.style.left)||lr.width/2));n.style.left=`${center}px`});
 });
 const visible=type==="critical"?1800:type==="skill"?1650:1450;setTimeout(()=>n.remove(),scaledBattleDelay(visible));await wait(1000);
}
function battleFlash(type="hit"){
 const arena=document.querySelector(".battle-arena");if(!arena)return;
 const flash=document.createElement("div");flash.className=`battle-screen-flash ${type}`;arena.appendChild(flash);setTimeout(()=>flash.remove(),scaledBattleDelay(420));
}
function conciseBattleSkillTitle(title,source){
 let value=String(title??"スキル").trim();const names=[displayName(source),source?.name,SPECIES[source?.speciesId]?.name].filter(Boolean).sort((a,b)=>String(b).length-String(a).length);
 for(const name of names)for(const separator of["・","：",":","／"]){const prefix=`${name}${separator}`;if(value.startsWith(prefix)){value=value.slice(prefix.length).trim();return value||String(title)}}
 return value;
}
function battleSkillMechanics(skill){const details=skillEffectDetails(skill);return(details.length?details.slice(0,2):[skill?.description??"特殊効果を発動"]).join("｜")}
async function battleBanner(title,subtitle="",type="normal",duration=700,source=null){
 const arena=document.querySelector(".battle-arena");if(!arena)return;
 arena.querySelector(".battle-cinematic-banner")?.remove();
 const skillBanner=String(type).split(/\s+/).includes("skill"),actorName=source?displayName(source):"",displayTitle=skillBanner?conciseBattleSkillTitle(title,source):String(title??"");
 const sourceArt=source?`<span class="battle-banner-source">${monsterVisual(source,source.emoji??SPECIES[source.speciesId]?.emoji??"●",{className:"battle-banner-source-visual"})}${skillBanner?"":`<em>${actorName}</em>`}</span>`:"";
 const titleClass=[...displayTitle].length>15?" very-long-title":[...displayTitle].length>10?" long-title":"";
 const el=document.createElement("div");el.className=`battle-cinematic-banner ${type}${titleClass}`;el.innerHTML=`${sourceArt}<span class="battle-banner-copy">${skillBanner&&actorName?`<small class="battle-banner-actor">${actorName}</small>`:""}<strong>${displayTitle}</strong>${subtitle?`<small class="battle-banner-effect">${subtitle}</small>`:""}</span>`;arena.appendChild(el);
 const minimum=String(type).includes("biome")?1500:/skill|boss|synergy|capture/.test(String(type))?1000:duration;
 await wait(Math.max(duration,minimum));el.classList.add("leaving");await wait(String(type).includes("biome")?500:Math.max(220,minimum>=1000?500:220));el.remove();
}
function battleEquipmentAuthorityRows(party=battle?.party??[]){return party.flatMap(monster=>(monster?._equipmentAuthorities??[]).map(authority=>({monster,authority})))}
function equipmentAuthorityActivation(monster,{element="neutral",target=null,isSkill=false}={}){
 const raw=String(element??"neutral"),elementKeys=raw==="lightning"?["lightningDamage","thunderDamage"]:raw==="water"?["waterDamage"]:raw==="ice"?["iceDamage","waterDamage"]:[`${raw}Damage`];
 const elementName=raw==="poison"?"毒":raw==="thunder"||raw==="lightning"?"雷":ATTRIBUTES[normalizedElement(raw)]?.name??raw;
 for(const authority of monster?._equipmentAuthorities??[]){
  if(battle?.equipmentAuthorityCueKeys?.[`${monster.id}:${authority.id}`])continue;
  const effects=authority.fixedEffects??{},labels=[];
  if(Number(effects.allElementDamage)>0)labels.push(`全属性威力+${Number(effects.allElementDamage)}%`);
  for(const key of elementKeys)if(Number(effects[key])>0)labels.push(`${elementName}属性威力+${Number(effects[key])}%`);
  if(target?.boss&&Number(effects.bossDamage)>0)labels.push(`ボスダメージ+${Number(effects.bossDamage)}%`);
  if(target&&!target.boss&&Number(effects.normalDamage)>0)labels.push(`通常敵ダメージ+${Number(effects.normalDamage)}%`);
  if(isSkill&&Number(effects.skillPower)>0)labels.push(`スキル威力+${Number(effects.skillPower)}%`);
  if(!labels.length)continue;
  return{authority,labels:[...new Set(labels)]};
 }
 return null;
}
function showEquipmentAuthorityActivation(monster,context){
 const activation=equipmentAuthorityActivation(monster,context);if(!activation||!battle)return;
 battle.equipmentAuthorityCueKeys??={};battle.equipmentAuthorityCueKeys[`${monster.id}:${activation.authority.id}`]=true;
 addBattleLog(battle,`装備固有能力｜${activation.authority.name}：${activation.labels.join("・")}`);
 const target=document.getElementById(`ally-${monster.id}`);if(target){target.querySelector(".equipment-authority-activation")?.remove();const cue=document.createElement("span");cue.className="equipment-authority-activation";cue.textContent=`◆ ${activation.authority.name}`;target.appendChild(cue);requestAnimationFrame(()=>cue.classList.add("active"));setTimeout(()=>cue.remove(),scaledBattleDelay(1200))}
 burstParticles(monster.id,"gold",10);
}
async function magicCircleActivationFx(source,profile,headline,detail="",{digits=null,danger=false,duration=620}={}){
 const arena=document.querySelector(".battle-arena");if(!arena||!profile||profile.id==="none")return;
 arena.querySelector(".magic-circle-activation")?.remove();
 const sourceId=typeof source==="object"?source?.id:source,target=battleTarget(sourceId),enemySide=Boolean((battle?.enemies??[]).some(enemy=>enemy.id===sourceId)),name=typeof source==="object"?(source.name??displayName(source)):"魔法陣";
 const tone=String(profile.tone??"violet").replace(/[^a-z0-9-]/gi,""),finalDigits=digits==null?null:String(digits).padStart(3,"0").slice(-3),instantKill=finalDigits==="999",jackpot=Boolean(finalDigits&&finalDigits!=="000"&&(new Set(finalDigits).size===1||Number(finalDigits)>=900));
 const digitMarkup=finalDigits?`<div class="magic-circle-roulette" aria-label="抽選結果 ${finalDigits}">${[...finalDigits].map((digit,index)=>`<i data-circle-final-digit="${digit}" style="--circle-digit-index:${index}">0</i>`).join("")}</div>`:"";
 const el=document.createElement("div");el.className=`magic-circle-activation tone-${tone} ${enemySide?"enemy-circle":"ally-circle"} ${danger?"danger":""} ${finalDigits?"slot-result":""} ${jackpot?"jackpot":""} ${instantKill?"instant-kill":""}`;el.setAttribute("role","status");el.setAttribute("aria-live","assertive");el.innerHTML=`<span class="magic-circle-activation-sigil"><img src="${escapeAttribute(profile.asset)}" alt=""><i></i></span><span class="magic-circle-activation-copy"><small>${enemySide?"敵魔法陣 発動":"味方魔法陣 発動"}・${escapeAttribute(name)}</small><strong>${escapeAttribute(profile.name)}${profile.level?` Lv.${profile.level}`:""}</strong>${digitMarkup}<b>${escapeAttribute(headline)}</b>${detail?`<em>${escapeAttribute(detail)}</em>`:""}</span>`;
 arena.appendChild(el);target?.querySelector(".magic-circle")?.classList.add("is-activating");
 if(target){const wave=document.createElement("span");wave.className=`magic-circle-activation-wave ${enemySide?"enemy":"ally"}`;wave.setAttribute("aria-hidden","true");target.appendChild(wave);setTimeout(()=>wave.remove(),scaledBattleDelay(760))}
 audio.sfx(enemySide||danger?"boss":"select");battleFlash(enemySide||danger?"danger":"magic");if(sourceId)burstParticles(sourceId,enemySide?"enemy":"mana",finalDigits?20:14);
 const reduceMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,digitNodes=[...el.querySelectorAll("[data-circle-final-digit]")];
 if(digitNodes.length){
  if(reduceMotion)digitNodes.forEach(node=>{node.textContent=node.dataset.circleFinalDigit;node.classList.add("settled")});
  else{
   const started=performance.now(),spinDuration=scaledBattleDelay(430),stagger=scaledBattleDelay(75),spin=now=>{const elapsed=now-started;digitNodes.forEach((node,index)=>{if(node.classList.contains("settled"))return;if(elapsed>=spinDuration+index*stagger){node.textContent=node.dataset.circleFinalDigit;node.classList.add("settled")}else node.textContent=String(Math.floor(Math.random()*10))});if(digitNodes.some(node=>!node.classList.contains("settled")))requestAnimationFrame(spin)};requestAnimationFrame(spin);
  }
 }
 await wait(Math.max(1300,duration));el.classList.add("leaving");await wait(200);target?.querySelector(".magic-circle")?.classList.remove("is-activating");el.remove();
}
function queueMagicCircleEvent(source,headline,detail="",options={}){
 if(!battle||!source)return;const profile=options.profile??(source.enemyMagicCircle||circleInfo(source));if(!profile||profile.id==="none")return;
 battle._pendingMagicCircleEvents??=[];const key=`${source.id}:${headline}:${detail}`;if(battle._pendingMagicCircleEvents.some(event=>event.key===key))return;
 battle._pendingMagicCircleEvents.push({key,source,profile,headline,detail,options});
}
async function flushMagicCircleEvents(){
 const events=battle?._pendingMagicCircleEvents??[];if(battle)battle._pendingMagicCircleEvents=[];
 for(const event of events)await magicCircleActivationFx(event.source,event.profile,event.headline,event.detail,event.options);
}
function burstParticles(target,type="gold",count=12){
 const layer=document.getElementById("battleFxLayer"),el=battleTarget(target);if(!layer||!el)return;
 const lr=layer.getBoundingClientRect(),r=el.getBoundingClientRect();
 for(let i=0;i<count;i++){const p=document.createElement("i");p.className=`fx-particle ${type}`;const angle=Math.PI*2*i/count+(Math.random()-.5)*.35,dist=42+Math.random()*46;p.style.left=`${r.left-lr.left+r.width/2}px`;p.style.top=`${r.top-lr.top+r.height*.42}px`;p.style.setProperty("--dx",`${Math.cos(angle)*dist}px`);p.style.setProperty("--dy",`${Math.sin(angle)*dist}px`);p.style.animationDelay=`${Math.random()*scaledBattleDelay(80)}ms`;layer.appendChild(p);setTimeout(()=>p.remove(),scaledBattleDelay(800))}
}
async function battleIntro(enemies){
 const elite=enemies.find(e=>e.elite),boss=enemies.find(e=>e.boss);
 if(elite){battleFlash("danger");await battleBanner("深淵の強敵",`${elite.eliteAffixIcon} ${elite.eliteAffixName}・${elite.name}`,"boss",1050)}
 else if(battle?.specialBattle){const isEmergency=battle.specialBattleType==="emergency",isGauntlet=battle.specialBattleType==="gauntlet",waveTotal=Math.max(1,Number(battle.specialWaveTotal)||1),waveIndex=Math.max(0,Number(battle.specialWaveIndex)||0),waveTitle=waveTotal>1?(waveIndex===waveTotal-1?"FINAL WAVE":`WAVE ${waveIndex+1}/${waveTotal}`):isEmergency?"世界異変":isGauntlet?"深淵の試練":"部隊戦";battleFlash(isEmergency?"boss":"hit");await battleBanner(waveTitle,battle.specialTitle??(isGauntlet?"奈落回廊":"4対4"),isEmergency?"boss":"encounter",1100)}
 else if(boss){battleFlash("boss");await battleBanner("ボス戦",boss.name,"boss",900)}
 else if(enemies.length>1)await battleBanner("敵部隊",`${enemies.length}体が立ちはだかった`,"encounter",620);
 else await battleBanner("遭遇",enemies[0]?.name??"敵が現れた","encounter",520);
 if(battle?.biomeBattle)await battleBanner(battle.biomeBattle.name,`適性属性 +22% / 不適性属性 −16%`,`biome ${battle.biomeBattle.theme}`,650);
 if(battle?.allySynergy?.full){battleFlash("hit");await battleBanner(battle.allySynergy.name,"味方4体の完全共鳴","synergy ally",720)}
 if(battle?.enemySynergy?.full){battleFlash("danger");await battleBanner(battle.enemySynergy.name,"敵軍4体の完全共鳴","synergy enemy",720)}
}
function hydrateEndgameEnemy(enemy,source={}){
 const profile=endgameCharacter(source.endgameBossId??enemy?.endgameBossId);if(!profile||!enemy)return enemy;enemy.endgameBossId=profile.id;enemy.faction=source.faction??enemy.faction??profile.faction;enemy.elementMultipliers=source.elementMultipliers??enemy.elementMultipliers??profile.elementMultipliers;enemy.statusProfile=source.statusProfile??enemy.statusProfile??profile.statusProfile;enemy.bossPassive=source.bossPassive??enemy.bossPassive??profile.passive;
 if(enemy._endgameStatProfileApplied!==profile.id&&profile.statProfile){const rates=profile.statProfile,hpRatio=enemy.hp/Math.max(1,enemy.maxHp);for(const key of["maxHp","atk","matk","def","mdef","spd"]){const sourceKey=key==="maxHp"?"hp":key,rate=Math.max(.25,Math.min(3,Number(rates[sourceKey])||1));enemy[key]=Math.max(["maxHp","atk","matk","spd"].includes(key)?1:0,Math.floor((Number(enemy[key])||0)*rate))}enemy.hp=Math.max(1,Math.min(enemy.maxHp,Math.round(enemy.maxHp*hpRatio)));enemy.crit=Math.max(0,(Number(enemy.crit)||0)+(Number(rates.crit)||0)/100);enemy.evasion=Math.max(0,Math.min(75,(Number(enemy.evasion)||0)+(Number(rates.evasion)||0)));enemy.accuracy=Math.max(20,Math.min(180,(Number(enemy.accuracy)||100)+(Number(rates.accuracy)||0)));enemy._endgameStatProfileApplied=profile.id}
 return enemy
}
function applyEnemyMagicCircleProfile(enemy,circle){
 if(!enemy||!circle)return enemy;
 const trackedKeys=["maxHp","atk","matk","def","mdef","spd","crit"],before=Object.fromEntries(trackedKeys.map(key=>[key,enemy[key]]));enemy._preMagicCircleStats??={...before};
 enemy.enemyMagicCircle=circle;enemy.magicCircleName=circle.name;enemy.magicCircleLevel=circle.level;
 const level=Math.max(1,Number(circle.level)||1),base=1+Math.min(.42,level*.0042);
 enemy.maxHp=Math.max(1,Math.round(enemy.maxHp*base));enemy.hp=enemy.maxHp;
 enemy.atk=Math.max(1,Math.round(enemy.atk*base));enemy.matk=Math.max(1,Math.round((enemy.matk??enemy.atk)*base));
 enemy.def=Math.max(0,Math.round(enemy.def*base));enemy.mdef=Math.max(0,Math.round((enemy.mdef??enemy.def)*base));
 if(["rage","weakCrit","lowHpPower","goldPower","slot"].includes(circle.effect)){enemy.atk=Math.round(enemy.atk*1.18);enemy.matk=Math.round(enemy.matk*1.18);enemy.crit=Math.max(enemy.crit??0,.12)}
 if(["shield","lastLife","revive","soleSurvivor"].includes(circle.effect)){enemy.maxHp=Math.round(enemy.maxHp*1.2);enemy.hp=enemy.maxHp;enemy.def=Math.round(enemy.def*1.18);enemy.mdef=Math.round(enemy.mdef*1.18)}
 if(circle.effect==="openingBuff")enemy.spd=Math.max(1,Math.round(enemy.spd*1.18));
 enemy._enemyMagicCircleApplied={rates:Object.fromEntries(trackedKeys.filter(key=>key!=="crit").map(key=>[key,Math.max(.000001,(Number(enemy[key])||0)/Math.max(.000001,Number(before[key])||0))])),critDelta:(Number(enemy.crit)||0)-(Number(before.crit)||0)};
 return enemy;
}
function applyFloorBossSignatureProfile(enemy){
 if(!enemy?.floorBossPassive||enemy._floorBossSignatureApplied)return enemy;enemy._floorBossSignatureApplied=true;
 const passive=enemy.floorBossPassive,domain=enemy.floorBossDomain??{};
 if(Number(passive.speedRate)>0)enemy.spd=Math.max(1,Math.floor(enemy.spd*passive.speedRate));
 if(Number(passive.balanceAttackRate)>0){const rate=Math.max(0,Math.min(1,Number(passive.balanceAttackRate))),high=Math.max(Number(enemy.atk)||1,Number(enemy.matk)||1),minimum=Math.max(1,Math.floor(high*rate));enemy.atk=Math.max(enemy.atk,minimum);enemy.matk=Math.max(enemy.matk??enemy.atk,minimum)}
 enemy.evasion=Math.max(0,Math.min(75,(Number(enemy.evasion)||0)+(Number(passive.evasionBonus)||0)));enemy.accuracy=Math.max(20,Math.min(180,(Number(enemy.accuracy)||100)+(Number(passive.accuracyBonus)||0)));
 if(Number(passive.convertMagicToPhysical)>0){const rate=Math.max(0,Math.min(1,Number(passive.convertMagicToPhysical))),magic=Math.max(0,Number(enemy.matk)||0);enemy.atk=Math.max(1,Math.floor(enemy.atk+magic*rate));enemy.matk=Math.max(1,Math.floor(magic*(1-rate)))}
 if(Number(passive.statusResistBonus)>0)enemy.bossStatusResist=Math.min(.9,(Number(enemy.bossStatusResist)||0)+passive.statusResistBonus);
 if(Number(passive.mpMultiplier)>0){enemy.maxMp=Math.max(1,Math.floor(enemy.maxMp*passive.mpMultiplier));enemy.currentMp=enemy.maxMp}
 if(Number(passive.startingBarrier)>0)enemy.divineBarrier=Math.max(Number(enemy.divineBarrier)||0,Math.floor(passive.startingBarrier));
 if(Number(passive.startingArmorLayers)>0&&enemy._floorBossArmorLayers==null)enemy._floorBossArmorLayers=Math.max(0,Math.floor(passive.startingArmorLayers));
 if(domain.effect==="lifePulse")enemy.eliteRegen=Math.max(Number(enemy.eliteRegen)||0,Number(domain.regen)||0);
 return enemy;
}
function makeBattleEnemy(e,index=0){
 const hiddenFloor=Math.max(1,Number(e.enemyFloor??(e.memorySourceFloor||save.state.player.currentFloor))||1),prepared=e.enemyLoadoutVersion===3?e:prepareEnemyEntry(e,hiddenFloor,{forceGear:Boolean(e.boss&&hiddenFloor>=50)}),sp=SPECIES[prepared.speciesId],scaled={...prepared,level:Math.max(1,prepared.level??1)},battleFloor=prepared.fixedTrialScaling?hiddenFloor:save.state.player.currentFloor,enemy=createEnemyBattleState(sp,scaled,battleFloor),profile=prepared.endgameBossId?endgameCharacter(prepared.endgameBossId):null,endgameBase=endgameFactionStatMultiplier(prepared.faction??profile?.faction),mult=(Number(prepared.statMultiplier)||1)*endgameBase;
 enemy.dangerLevel=prepared.boss?5:prepared.speciesId==="mimic"?5:prepared.equipped?4:((prepared.level??1)>save.state.player.currentFloor+4?2:1);
 if(prepared.nameOverride)enemy.name=prepared.nameOverride;
 applyEnemyMultiplier(enemy,mult);
 enemy.fixedTrialScaling=Boolean(prepared.fixedTrialScaling);
 if(enemy.fixedTrialScaling){
  const hpMultiplier=Math.max(1,Number(prepared.fixedTrialHpMultiplier)||1);
  enemy.maxHp=Math.max(1,Math.round(enemy.maxHp*hpMultiplier));enemy.hp=enemy.maxHp;
 }
 enemy.endgameBossId=prepared.endgameBossId??null;enemy.faction=prepared.faction??profile?.faction??null;enemy.powerRate=prepared.powerRate??null;enemy.manifestationLabel=prepared.manifestationLabel??null;enemy.endgameSupport=Boolean(prepared.endgameSupport);enemy.uncapturable=Boolean(prepared.uncapturable);enemy.trialElement=normalizedElement(prepared.trialElement??prepared.attribute??profile?.element??sp?.element);enemy.id=`enemy-${Date.now()}-${index}-${Math.random().toString(36).slice(2,7)}`;
 applyEliteModifiers(enemy,prepared);hydrateEndgameEnemy(enemy,prepared);
 const hidden=enemyHiddenProfileForFloor(hiddenFloor,{rank:prepared.faction??sp?.rarity??"N",faction:prepared.faction,boss:Boolean(prepared.boss),equipped:Boolean(prepared.equipped),slots:prepared.enemyEquipmentSlots,gearLevel:prepared.enemyEquipmentLevel,rarity:prepared.enemyEquipmentRarity});enemy.hiddenProfile=hidden;enemy.hiddenDamageTaken=hidden.damageTaken??1;enemy.hiddenStatusResist=hidden.statusResist??0;enemy.hiddenCapturePressure=hidden.capturePressure??1;enemy.hiddenAi=hidden.ai??0;
 if(hidden.active){enemy.maxHp=Math.max(1,Math.floor(enemy.maxHp*hidden.hp));enemy.hp=enemy.maxHp;enemy.atk=Math.max(1,Math.floor(enemy.atk*hidden.atk));enemy.matk=Math.max(1,Math.floor((enemy.matk??enemy.atk)*hidden.atk));enemy.def=Math.max(0,Math.floor(enemy.def*hidden.def));enemy.mdef=Math.max(0,Math.floor((enemy.mdef??enemy.def)*hidden.def));enemy.spd=Math.max(1,Math.floor(enemy.spd*hidden.spd));enemy.crit=Math.max(enemy.crit??0,hidden.crit??0)}
 if(prepared.equipped){
  enemy.gear=prepared.gear;enemy.enemyGear=prepared.enemyGear;enemy.enemyEquipmentSlots=prepared.enemyEquipmentSlots;enemy.enemyEquipmentLevel=prepared.enemyEquipmentLevel;enemy.enemyEquipmentRarity=prepared.enemyEquipmentRarity;enemy.enemySocketRarity=prepared.enemySocketRarity;enemy.name=`⚔️ ${enemy.name}`;
  for(const item of prepared.enemyGear??[]){const factor=equipmentStatMultiplier(item);enemy.atk+=Math.round((item.stats?.atk??0)*factor);enemy.matk=(enemy.matk??enemy.atk)+Math.round((item.stats?.matk??0)*factor);enemy.def+=Math.round((item.stats?.def??0)*factor);enemy.mdef=(enemy.mdef??enemy.def)+Math.round((item.stats?.mdef??0)*factor);enemy.spd+=Math.round((item.stats?.spd??0)*factor);enemy.maxHp+=Math.round((item.stats?.hp??0)*factor)}enemy.hp=enemy.maxHp;
 }
 applyEnemyMagicCircleProfile(enemy,prepared.enemyMagicCircle);
 applyFloorBossSignatureProfile(enemy);
 // The treasure-room Mimic's impossible offence/armour only exists while it is
 // an enemy. Capturing creates a normal species instance and never copies these.
 if(prepared.speciesId==="mimic"&&!prepared.endgameBossId){enemy.enemyMimicArmor=true;enemy.enemyOnlyMimicProfile=true;enemy.captureRateOverride=.01;enemy.maxHp=8;enemy.hp=8;enemy.atk=Math.max(1,Math.round(enemy.atk*.7));enemy.matk=Math.max(1,Math.round((enemy.matk??enemy.atk)*.7));enemy.def=Math.max(9_999_999,Math.round(enemy.def*500));enemy.mdef=Math.max(9_999_999,Math.round((enemy.mdef??enemy.def)*500));enemy.spd=Math.max(1,Math.round(enemy.spd*.12));enemy.evasion=70;enemy.accuracy=90;enemy.role="鈍重回避要塞"}
 return enemy;
}
function validBattlePartyMember(monster){return Boolean(monster&&typeof monster==="object"&&monster.id&&monster.speciesId)}
function sanitizeBattleParty(){
 if(!battle)return[];
 const source=Array.isArray(battle.party)?battle.party:[],canonical=(save.state.party??[]).map(id=>(save.state.monsters??[]).find(monster=>monster?.id===id)).filter(validBattlePartyMember);
 const repaired=source.map((monster,index)=>validBattlePartyMember(monster)?monster:canonical[index]).filter(validBattlePartyMember),seen=new Set(repaired.map(monster=>monster.id));
 if(!battle.onlineMode)for(const monster of canonical)if(!seen.has(monster.id)){repaired.push(monster);seen.add(monster.id)}
 if(repaired.length!==source.length||repaired.some((monster,index)=>monster!==source[index]))battle.party=repaired;
 return repaired;
}
function saveBattleCheckpoint(){
 if(!battle)return;
 sanitizeBattleParty();
 syncPersistentAilments(battle);
 const explorationSnapshot=persistExpeditionSnapshot(snapshot??expeditionSnapshotFromGame(),{saveNow:false})??save.state.expeditionSnapshot??null;
 save.state.activeBattle={
  battleId:battle.battleId,floor:save.state.player.currentFloor,enemies:battle.enemies,turn:battle.turn,turnQueue:battle.turnQueue,queueIndex:battle.queueIndex,
  targetEnemyId:battle.targetEnemyId,auto:battle.auto,escapePending:false,actionCommitted:Boolean(battle.actionCommitted),guards:battle.guards,cooldowns:battle.cooldowns,
  enemyStatuses:battle.enemyStatuses,allyAilments:battle.allyAilments,allyEffects:battle.allyEffects,enemyEffects:battle.enemyEffects,lastStatusTurn:battle.lastStatusTurn,log:battle.log,explorationSnapshot,
  specialBattle:battle.specialBattle,specialBattleType:battle.specialBattleType,specialTitle:battle.specialTitle,specialSubtitle:battle.specialSubtitle,
  priorVitals:battle.priorVitals,specialBossId:battle.specialBossId,powerPercent:battle.powerPercent,specialFragmentReward:battle.specialFragmentReward??0,manualEndgameChallenge:Boolean(battle.manualEndgameChallenge),
  preludeChoiceId:battle.preludeChoiceId,preludeResultText:battle.preludeResultText,specialTrialNumber:battle.specialTrialNumber??null,specialTrialLoop:battle.specialTrialLoop??null,specialReturnScreen:battle.specialReturnScreen??null,specialBaseSubtitle:battle.specialBaseSubtitle??null,specialWaves:battle.specialWaves??null,specialWaveIndex:battle.specialWaveIndex??0,specialWaveTotal:battle.specialWaveTotal??1,continuingSpecialWave:Boolean(battle.continuingSpecialWave),
  allySynergy:battle.allySynergy??null,enemySynergy:battle.enemySynergy??null,biomeBattle:battle.biomeBattle??null,battleTheme:battle.battleTheme??"default",
  memoryBattle:Boolean(battle.memoryBattle),bossMemoryBattle:Boolean(battle.bossMemoryBattle),memorySourceFloor:battle.memorySourceFloor??null,memorySpeciesId:battle.memorySpeciesId??null,tutorialCaptureEligible:Boolean(battle.tutorialCaptureEligible),tutorialAttributeBattle:Boolean(battle.tutorialAttributeBattle)
  ,reviveCount:battle.reviveCount??0,performance:battle.performance??{},affectionDeathRecorded:battle.affectionDeathRecorded??{},circleTurnMultipliers:battle.circleTurnMultipliers??{},circleTurnKeys:battle.circleTurnKeys??{},circleCueKeys:battle.circleCueKeys??{},enemyCircleTurnKeys:battle.enemyCircleTurnKeys??{},circleShields:battle.circleShields??{},signatureShields:battle.signatureShields??{},signatureChains:battle.signatureChains??{},signatureExtraRounds:battle.signatureExtraRounds??{},openingCircleBuff:Boolean(battle.openingCircleBuff),magicCircleProfiles:battle.magicCircleProfiles??{},magicCircleArt:battle.magicCircleArt??{},floorBossAliveState:battle.floorBossAliveState??{},floorBossTargetMarks:battle.floorBossTargetMarks??{},floorBossBellMarks:battle.floorBossBellMarks??{}
 };
 save.save()
}
function clearBattleCheckpoint(){delete save.state.activeBattle;save.save()}
function resumeSavedBattle(){
 const data=save.state.activeBattle;if(!data?.enemies?.length)return false;
 const party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);if(!party.length)return false;
 save.state.player.currentFloor=data.floor??save.state.player.currentFloor;snapshot=hydrateExpeditionSnapshot(data.explorationSnapshot??save.state.expeditionSnapshot);
 const explorationAuto=save.state.settings.exploreAutoMode!=="off"&&!data.specialBattle&&!data.memoryBattle;
 battle={...data,battleId:data.battleId??crypto.randomUUID?.()??`${Date.now()}-${Math.random()}`,party,species:SPECIES,busy:false,guideReady:true,skillMenu:false,itemMenu:false,enemy:data.enemies[0],auto:explorationAuto||data.auto,explorationAuto,reviveCount:data.reviveCount??0,performance:data.performance??Object.fromEntries(party.map(monster=>[monster.id,{damage:0,taken:0,healing:0,revives:0,kills:0}])),affectionDeathRecorded:data.affectionDeathRecorded??Object.fromEntries(party.map(monster=>[monster.id,monster.currentHp<=0])),circleTurnMultipliers:data.circleTurnMultipliers??{},circleTurnKeys:data.circleTurnKeys??{},circleCueKeys:data.circleCueKeys??{},enemyCircleTurnKeys:data.enemyCircleTurnKeys??{},circleShields:data.circleShields??{},signatureShields:data.signatureShields??{},signatureChains:data.signatureChains??{},signatureExtraRounds:data.signatureExtraRounds??{},signatureResonances:Object.fromEntries(activeSignatureResonances(save.state,party).map(entry=>[entry.monster.id,entry.definition])),magicCircleProfiles:data.magicCircleProfiles??Object.fromEntries(party.map(monster=>[monster.id,equippedMagicCircle(monster,save.state)])),magicCircleArt:data.magicCircleArt??Object.fromEntries(party.map(monster=>[monster.id,magicCircleMarkup(monster,save.state,{className:"battle-magic-circle"})])),enemyMagicCircleArt:Object.fromEntries((data.enemies??[]).map(enemy=>[enemy.id,enemyMagicCircleMarkup(enemy.enemyMagicCircle)])),openingCircleBuff:Boolean(data.openingCircleBuff),...createBattleRulesState(party),cooldowns:data.cooldowns??{},enemyStatuses:data.enemyStatuses??{},allyAilments:data.allyAilments??Object.fromEntries(party.map(monster=>[monster.id,normalizePersistentAilments(monster.ailments)])),allyEffects:data.allyEffects??{},enemyEffects:data.enemyEffects??{},lastStatusTurn:data.lastStatusTurn??0,log:data.log??[]};
 battle.hpDisplayRates={};battle.hpTrails={};if(!battle.floorBossAliveState)initializeFloorBossDeathTracking();battle.invincibleAlliance=invincibleAllianceReady();
 battle.enemies.forEach(enemy=>hydrateEndgameEnemy(enemy));battle.enemy=battle.enemies[0];syncPersistentAilments(battle);battle.turnQueue=data.turnQueue??[];battle.queueIndex=data.queueIndex??0;battle.targetEnemyId=data.targetEnemyId??aliveEnemies(battle)[0]?.id??null;screen="explore";renderBattle();setTimeout(()=>data.actionCommitted?finishCurrentAction():continueBattleFlow(),scaledBattleDelay(250));return true
}
function affixValue(monster,id,cap=Infinity){return Math.max(0,Math.min(cap,Number(monster?._equipmentAffixes?.[id]??0)))}
function equipmentStatValue(monster,id,cap=Infinity){return Math.max(0,Math.min(cap,Number(monster?._equipmentStats?.[id]??0)))}
function seriesEffectValue(monster,id,cap=Infinity){return Math.max(0,Math.min(cap,Number(monster?._seriesEffects?.[id]??0)))}
function partyAffixTotal(id,cap=Infinity){return Math.max(0,Math.min(cap,(battle?.party??[]).reduce((sum,m)=>sum+affixValue(m,id),0)))}
function abyssBattleMultiplier(monster,key){return Math.max(0,1+(Number(monster?._abyssSkillEffects?.[key])||0))}
function healMultiplier(monster){const stats=calculatedStats(monster),magicBonus=Math.min(.5,Math.max(0,(stats.matk??stats.atk)-stats.atk*.75)/Math.max(1,stats.atk)*.25);return(1+Math.min(150,affixValue(monster,"healPower",150)+equipmentStatValue(monster,"heal",150))/100)*(1+magicBonus)}
function outgoingLifeSteal(monster){return affixValue(monster,"lifeSteal",30)/100}
function equipmentRegenRate(monster){return affixValue(monster,"regen",20)/100}
function circleInfo(monster){if(!monster)return null;return battle?.magicCircleProfiles&&Object.prototype.hasOwnProperty.call(battle.magicCircleProfiles,monster.id)?battle.magicCircleProfiles[monster.id]:equippedMagicCircle(monster,save.state)}
function hasCircleEffect(monster,effect){return circleInfo(monster)?.effect===effect}
function signatureResonance(monster){return monster&&battle?.signatureResonances?.[monster.id]||null}
function signatureOffenseBonus(monster,enemy){
 const resonance=signatureResonance(monster);if(!resonance||!enemy)return{damageMultiplier:1,critBonus:0,stacks:0};
 const baseDamage=resonance.damageMultiplier??1,baseCrit=resonance.critBonus??0;if(resonance.id!=="yori-chain")return{damageMultiplier:baseDamage,critBonus:baseCrit,stacks:0};
 battle.signatureChains??={};const previous=battle.signatureChains[monster.id],sameTarget=previous?.targetId===enemy.id,stacks=sameTarget?Math.min(resonance.maxStacks??4,(previous.stacks??0)+1):1;
 battle.signatureChains[monster.id]={targetId:enemy.id,stacks};
 return{damageMultiplier:baseDamage+stacks*(resonance.damagePerStack??.1),critBonus:baseCrit+stacks*(resonance.critPerStack??.05),stacks};
}
function absorbSignatureShield(monster,damage){
 const available=Math.max(0,Math.floor(battle?.signatureShields?.[monster.id]||0));if(!available)return damage;
 const absorbed=Math.min(available,damage);battle.signatureShields[monster.id]-=absorbed;if(absorbed)addBattleLog(battle,`${displayName(monster)}の支援共鳴障壁が${absorbed.toLocaleString()}吸収`);return Math.max(0,damage-absorbed);
}
async function triggerRionSignature(source){
 const resonance=signatureResonance(source);if(resonance?.id!=="rion-care")return false;
 battle.signatureShields??={};let shieldTotal=0,mpTotal=0;
 for(const ally of battle.party.filter(monster=>monster.currentHp>0)){
  const shield=Math.max(1,Math.floor(calculatedStats(ally).hp*(resonance.shieldRate??.12))),mp=recoverBattleMp(ally,Math.max(1,Math.floor(maxMp(ally)*(resonance.mpRate??.08))),source);
  battle.signatureShields[ally.id]=Math.max(Math.max(0,Number(battle.signatureShields[ally.id])||0),shield);shieldTotal+=shield;mpTotal+=mp;
 }
 addBattleLog(battle,`${displayName(source)}：支援共鳴が発動（障壁${shieldTotal.toLocaleString()}・MP${mpTotal.toLocaleString()}）`);await battleBanner("支援共鳴","味方全体へ障壁＋MP回復","synergy",620,source);await flushBattleRecoveries();await floatText("障壁＋MP回復","party","heal");return true;
}
function signatureHealingSkill(skill){return Boolean(skill&&(["selfHeal","allHeal","revive"].includes(skill.type)||skill.type==="stance"&&skill.heal));}
function battleContribution(monster){
 if(!battle||!monster)return null;
 battle.performance??={};
 return battle.performance[monster.id]??=( {damage:0,taken:0,healing:0,revives:0,kills:0} );
}
function recordBattleDamage(monster,amount){const row=battleContribution(monster);if(row)row.damage+=Math.max(0,Math.floor(Number(amount)||0))}
function recordBattleTaken(monster,amount){const row=battleContribution(monster);if(row)row.taken+=Math.max(0,Math.floor(Number(amount)||0))}
function recordBattleHealing(monster,amount){const row=battleContribution(monster);if(row)row.healing+=Math.max(0,Math.floor(Number(amount)||0))}
function battleContributionSnapshot(source=battle){
 if(!source)return{party:[],performance:{},reviveCount:0};
 return{party:(source.party??[]).map(monster=>monster),performance:Object.fromEntries(Object.entries(source.performance??{}).map(([id,row])=>[id,{damage:Math.max(0,Math.floor(Number(row?.damage)||0)),taken:Math.max(0,Math.floor(Number(row?.taken)||0)),healing:Math.max(0,Math.floor(Number(row?.healing)||0)),revives:Math.max(0,Math.floor(Number(row?.revives)||0)),kills:Math.max(0,Math.floor(Number(row?.kills)||0))}])),reviveCount:Math.max(0,Math.floor(Number(source.reviveCount)||0))};
}
function battleContributionBody(snapshot){
 const rows=(snapshot.party??[]).map(monster=>{const row=snapshot.performance?.[monster.id]??{damage:0,taken:0,healing:0,revives:0,kills:0},score=row.damage+row.healing*1.15+row.kills*10000+row.revives*20000;return{monster,row,score}}),best=Math.max(0,...rows.map(entry=>entry.score));
 return`<div class="battle-contribution"><div class="contribution-heading"><span>${pixelIcon("crossed-swords")}</span><div><small>戦闘分析</small><h3>今回の活躍表</h3></div><em>蘇生 ${snapshot.reviveCount}/99</em></div><div class="contribution-list">${rows.map(({monster,row,score})=>`<article class="${best>0&&score===best?"mvp":""}"><div class="contribution-portrait">${monsterVisual(monster,SPECIES[monster.speciesId]?.emoji??"●",{className:"contribution-monster-visual"})}${best>0&&score===best?"<b>最高殊勲</b>":""}</div><div class="contribution-name"><strong>${displayName(monster)}</strong><small>Lv.${Number(monster.level).toLocaleString()}</small></div><dl><div><dt>与ダメージ</dt><dd>${row.damage.toLocaleString()}</dd></div><div><dt>被ダメージ</dt><dd>${row.taken.toLocaleString()}</dd></div><div><dt>回復</dt><dd>${row.healing.toLocaleString()}</dd></div><div><dt>蘇生</dt><dd>${row.revives}</dd></div><div><dt>撃破</dt><dd>${row.kills}</dd></div></dl></article>`).join("")}</div></div>`;
}
function openBattleContributionReport(snapshot,onClose,{auto=false}={}){
 app.insertAdjacentHTML("beforeend",Modal("活躍表",battleContributionBody(snapshot),"報酬を確認"));const modal=topModal();modal.classList.add("battle-contribution-modal");let closed=false,timer=null;
 const finish=()=>{if(closed)return;closed=true;if(timer)clearTimeout(timer);modal?.remove();onClose?.()};modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish;modal.querySelector("[data-modal-dismiss]").onclick=finish;if(auto)timer=setTimeout(finish,1500);return modal;
}
function canBattleRevive(){return Boolean(battle&&(battle.reviveCount??0)<99)}
function reviveBattleMonster(target,hpRate=.35,mpRate=.25,source=null,{transferRate=0}={}){
 if(!target||target.currentHp>0||!canBattleRevive())return false;
 if(hasEffect(battle,target.id,"reviveSeal")){addBattleLog(battle,`${displayName(target)}は蘇生封印中のため復帰できない`);return false}
 const rate=Math.max(0,Math.min(.95,Number(transferRate)||0)),transfer=rate&&source?Math.floor(Math.max(0,source.currentHp)*rate):0;if(rate&&transfer<1)return false;
 const beforeHp=Math.max(0,target.currentHp??0),beforeMp=Math.max(0,target.currentMp??0);battle.reviveCount=(battle.reviveCount??0)+1;if(transfer){source.currentHp=Math.max(1,source.currentHp-transfer);target.currentHp=Math.max(1,Math.min(calculatedStats(target).hp,transfer));addBattleLog(battle,`${displayName(source)}：現在HP${transfer.toLocaleString()}を${displayName(target)}へ分与`)}else target.currentHp=Math.max(1,Math.floor(calculatedStats(target).hp*Math.max(0,hpRate)));target.currentMp=Math.max(0,Math.floor(maxMp(target)*Math.max(0,mpRate)));queueBattleRecovery(target,"hp",beforeHp,target.currentHp);queueBattleRecovery(target,"mp",beforeMp,target.currentMp);
 if(battle?.affectionDeathRecorded)battle.affectionDeathRecorded[target.id]=false;const row=battleContribution(source);if(row)row.revives++;syncInvincibleAllianceState();return true;
}
function recoverBattleHp(target,amount,maximum=null){
 if(!target)return 0;const enemy=Object.prototype.hasOwnProperty.call(target,"hp")&&!Object.prototype.hasOwnProperty.call(target,"currentHp"),max=Math.max(1,Number(maximum??(enemy?target.maxHp:calculatedStats(target).hp))||1),before=Math.max(0,Number(enemy?target.hp:target.currentHp)||0),healFactor=battle?Math.max(.1,1-Math.min(.9,effectValue(battle,target.id,"healDown",enemy?"enemy":"ally"))):1,after=Math.min(max,before+Math.max(0,Math.floor((Number(amount)||0)*healFactor)));
 if(enemy)target.hp=after;else target.currentHp=after;queueBattleRecovery(target,"hp",before,after);const gained=after-before;
	 if(!enemy&&gained>0&&battle)for(const mirror of(battle.enemies??[]).filter(entry=>entry.hp>0&&entry.floorBossDomain?.effect==="healingReflection")){const domain=mirror.floorBossDomain,cap=Math.max(0,Math.min(.8,Number(domain.cap)||.24)),beforeLight=Math.max(0,Number(mirror._floorBossHealingReflection)||0),stored=gained/max*Math.max(0,Number(domain.storeRate)||.45);mirror._floorBossHealingReflection=Math.min(cap,beforeLight+stored);if(mirror._floorBossHealingReflection>beforeLight)addBattleLog(battle,`${domain.name}：${displayName(target)}の回復を花光${Math.round(mirror._floorBossHealingReflection*100)}%まで反照`)}
	 return gained;
}
function recoverFloorBossHp(enemy,amount){
 const passive=enemy?.floorBossPassive??{},baseRequested=Math.max(0,Math.floor(Number(amount)||0)),requested=Math.max(0,Math.floor(baseRequested*Math.max(0,Number(passive.healPowerMultiplier)||1))),gained=recoverBattleHp(enemy,requested,enemy.maxHp),overflow=Math.max(0,requested-gained);
 if(overflow>0&&Number(passive.overhealShieldRate)>0){const cap=Math.max(1,Math.floor(enemy.maxHp*Math.min(.8,Number(passive.shieldCapRate)||.18))),added=Math.min(cap-Math.max(0,Number(enemy._floorBossHpShield)||0),Math.floor(overflow*Math.min(1,Number(passive.overhealShieldRate))));if(added>0){enemy._floorBossHpShield=Math.max(0,Number(enemy._floorBossHpShield)||0)+added;addBattleLog(battle,`${enemy.name}：${passive.name}で余命障壁 ${added.toLocaleString()}`)}}
	 const domain=enemy?.floorBossDomain??{};if(gained>0&&domain.effect==="healingWard"&&Number(domain.healingShieldRate)>0){const cap=Math.max(1,Math.floor(enemy.maxHp*Math.min(.8,Number(domain.shieldCapRate)||.14))),current=Math.max(0,Number(enemy._floorBossHpShield)||0),added=Math.max(0,Math.min(cap-current,Math.floor(gained*Math.min(1,Number(domain.healingShieldRate)))));if(added){enemy._floorBossHpShield=current+added;addBattleLog(battle,`${domain.name}：実回復から根障壁 ${added.toLocaleString()}`)}}
 if(gained>0&&domain.effect==="lifeEmberReserve"){const cap=Math.max(1,Math.floor(enemy.maxHp*Math.min(.8,Number(domain.capRate)||.22))),before=Math.max(0,Math.floor(Number(enemy._floorBossLifeEmber)||0)),stored=Math.max(1,Math.floor(gained*Math.min(1,Math.max(0,Number(domain.storeRate)||.60))));enemy._floorBossLifeEmber=Math.min(cap,before+stored);if(enemy._floorBossLifeEmber>before)addBattleLog(battle,`${domain.name}：命火${enemy._floorBossLifeEmber.toLocaleString()}/${cap.toLocaleString()}`)}
	 if(overflow>0&&domain.effect==="lifeSeedNursery"){const threshold=Math.max(1,Math.floor(enemy.maxHp*Math.max(.01,Math.min(.5,Number(domain.seedThresholdRate)||.10)))),maxSeeds=Math.max(1,Math.floor(Number(domain.maxSeeds)||2));enemy._floorBossLifeSeedOverflow=Math.max(0,Math.floor(Number(enemy._floorBossLifeSeedOverflow)||0))+overflow;let seeds=Math.max(0,Math.floor(Number(enemy._floorBossLifeSeeds)||0)),grown=0;while(seeds<maxSeeds&&enemy._floorBossLifeSeedOverflow>=threshold){enemy._floorBossLifeSeedOverflow-=threshold;seeds++;grown++}enemy._floorBossLifeSeeds=seeds;if(seeds>=maxSeeds)enemy._floorBossLifeSeedOverflow=Math.min(enemy._floorBossLifeSeedOverflow,threshold-1);if(grown)addBattleLog(battle,`${domain.name}：余剰回復から命花種${grown}個を育成（${seeds}/${maxSeeds}）`)}
 if((gained>0||overflow>0)&&enemy?.floorBossDomain?.effect==="healingFlare")enemy._floorBossHealedPowerReady=true;
 return gained;
}
function storeFloorBossManaNocturne(source,spent){
 const paid=Math.max(0,Math.floor(Number(spent)||0));if(!battle||!source||!paid)return 0;let storedTotal=0;
 for(const enemy of(battle.enemies??[]).filter(entry=>entry.hp>0&&entry.floorBossDomain?.effect==="manaNocturne")){const domain=enemy.floorBossDomain,cap=Math.max(0,Math.min(.8,Number(domain.cap)||.30)),before=Math.max(0,Math.min(cap,Number(enemy._floorBossManaNocturne)||0)),gain=paid/Math.max(1,maxMp(source))*Math.max(0,Number(domain.storeRate)||.80);enemy._floorBossManaNocturne=Math.min(cap,before+gain);storedTotal+=Math.max(0,enemy._floorBossManaNocturne-before);if(enemy._floorBossManaNocturne>before)addBattleLog(battle,`${domain.name}：${displayName(source)}の消費MPを夜想音${Math.round(enemy._floorBossManaNocturne*100)}%まで記譜`)}
 return storedTotal;
}
function storeFloorBossSacrifice(enemy,amount){
 const domain=enemy?.floorBossDomain??{},paid=Math.max(0,Math.floor(Number(amount)||0));if(domain.effect!=="broodSacrifice"||!paid)return 0;
 const cap=Math.max(1,Math.floor(enemy.maxHp*Math.min(.8,Number(domain.capRate)||.24))),before=Math.max(0,Math.floor(Number(enemy._floorBossBroodSacrifice)||0));enemy._floorBossBroodSacrifice=Math.min(cap,before+paid);const stored=enemy._floorBossBroodSacrifice-before;if(stored)addBattleLog(battle,`${domain.name}：胎命${enemy._floorBossBroodSacrifice.toLocaleString()}/${cap.toLocaleString()}`);return stored;
}
function recoverBattleMp(target,amount,source=null){
 if(!target||target.currentHp<=0)return 0;const maximum=maxMp(target),before=Math.max(0,target.currentMp??0);target.currentMp=Math.min(maximum,before+Math.max(0,Math.floor(amount)));const gained=target.currentMp-before;queueBattleRecovery(target,"mp",before,target.currentMp);
 if(gained&&hasCircleEffect(target,"manaReversal")){const hpCost=Math.max(1,Math.floor(gained*calculatedStats(target).hp/Math.max(1,maximum)*.08));target.currentHp=Math.max(1,target.currentHp-hpCost);addBattleLog(battle,`${displayName(target)}：魔力反転でHP-${hpCost}`);queueMagicCircleEvent(target,`MP +${gained.toLocaleString()} → HP -${hpCost.toLocaleString()}`,"回復した魔力の一部を生命力で支払った")}
 return gained;
}
function magicCircleDamageMultiplier(monster){
 if(!monster||!battle)return 1;let value=Math.max(.5,Number(battle.circleTurnMultipliers?.[monster.id])||1),level=circleInfo(monster)?.level??1;
 if(hasCircleEffect(monster,"manaReversal"))value*=1.12+Math.min(.18,level*.004);
 if(battle.openingCircleBuff)value*=1.2;
 if(hasCircleEffect(monster,"rage"))value*=1+Math.min(1,(monster._circleRage??0)*.08);
 if(hasCircleEffect(monster,"lowHpPower")){const ratio=monster.currentHp/Math.max(1,calculatedStats(monster).hp);value*=1+(1-ratio)*1.25}
 if(hasCircleEffect(monster,"soleSurvivor")&&battle.party.filter(member=>member.currentHp>0).length===1)value*=2;
 if(hasCircleEffect(monster,"goldPower")){const circle=equippedMagicCircle(monster,save.state);value*=goldPowerDamageMultiplier(save.state.player.gold,circle.level)}
 return value;
}
function magicCircleCriticalBonus(monster,power=1){let bonus=battle?.openingCircleBuff ? .2 : 0;if(hasCircleEffect(monster,"weakCrit"))bonus+=Math.max(.05,.48-Math.max(0,Number(power)||1)*.1);return bonus}
function consumeMagicCircleActionCost(monster){if(!hasCircleEffect(monster,"goldPower"))return;const cost=Math.min(Math.max(0,Number(save.state.player.gold)||0),goldPowerActionCost(save.state.player.gold));save.state.player.gold=Math.max(0,Math.floor(save.state.player.gold-cost));addBattleLog(battle,`${displayName(monster)}：黄金換力 -${cost.toLocaleString()}G`)}
function absorbMagicCircleShield(monster,damage){const available=Math.max(0,Math.floor(battle?.circleShields?.[monster.id]||0));if(!available)return damage;const absorbed=Math.min(available,damage);battle.circleShields[monster.id]-=absorbed;if(absorbed){addBattleLog(battle,`${displayName(monster)}の障壁が${absorbed.toLocaleString()}吸収`);queueMagicCircleEvent(monster,`${absorbed.toLocaleString()} ダメージ吸収`,`障壁残量 ${Math.max(0,battle.circleShields[monster.id]).toLocaleString()}`)}return Math.max(0,damage-absorbed)}
function recordExpeditionAffectionDeath(monster){
 if(!monster||monster.currentHp>0||!battle||battle.memoryBattle||battle.specialBattle||!save.state.player.inRun)return 0;
 battle.affectionDeathRecorded??={};if(battle.affectionDeathRecorded[monster.id])return 0;battle.affectionDeathRecorded[monster.id]=true;
 save.state.expeditionAffectionDeaths??={};const count=(Math.max(0,Number(save.state.expeditionAffectionDeaths[monster.id])||0)+1);save.state.expeditionAffectionDeaths[monster.id]=count;
 const penalty=count===1?100:count===2?150:200,before=Math.max(0,Math.min(1000,Number(monster.affection??monster.bond)||0));monster.affection=Math.max(0,before-penalty);monster.bond=monster.affection;
 addBattleLog(battle,`${displayName(monster)}は戦闘不能になり、なつき度 -${penalty}`);save.save();return penalty;
}
function handleMagicCircleDeath(monster){
 if(!monster||monster.currentHp>0)return;recordExpeditionAffectionDeath(monster);if(monster._circleDeathHandled)return;monster._circleDeathHandled=true;
 if(hasCircleEffect(monster,"inheritance")){for(const ally of battle.party.filter(member=>member.currentHp>0)){applyBattleEffect(battle,ally.id,{kind:"atkUp",value:.3,turns:5},"ally");applyBattleEffect(battle,ally.id,{kind:"defUp",value:.3,turns:5},"ally");applyBattleEffect(battle,ally.id,{kind:"spdUp",value:.2,turns:5},"ally")}queueMagicCircleEvent(monster,"力を生存者へ継承","ATK・DEF +30% / SPD +20%・5ターン")}
 if(hasCircleEffect(monster,"deathDrain")){for(const enemy of aliveEnemies(battle))enemy.currentMp=Math.max(0,(enemy.currentMp??0)-Math.floor((enemy.maxMp??0)*.65));queueMagicCircleEvent(monster,"敵全体のMPを65%吸収","戦闘不能を魔力枯渇へ変換")}
 syncInvincibleAllianceState();
}
function magicCircleInstantDeath(target,source=null,{force=false}={}){
 if(!target)return false;
 const ally=Object.prototype.hasOwnProperty.call(target,"currentHp"),alive=ally?target.currentHp>0:target.hp>0;if(!alive)return false;
 if(ally&&hasCircleEffect(target,"deathMirror")&&!target._circleDeathMirrorUsed){
  target._circleDeathMirrorUsed=true;
  if(source){if(Object.prototype.hasOwnProperty.call(source,"currentHp")){source.currentHp=0;handleMagicCircleDeath(source)}else if(Object.prototype.hasOwnProperty.call(source,"hp"))applyEnemyDamage(battle,source,source.hp)}
  addBattleLog(battle,`${displayName(target)}の死返しが即死を反射`);queueMagicCircleEvent(target,"即死を無効化・反射","最初の即死だけ発動");return true;
 }
 if(ally){target.currentHp=0;handleMagicCircleDeath(target)}else if(force)target.hp=0;else applyEnemyDamage(battle,target,target.hp);return false;
}
function captureCrystalCost(){return 1}
function tryUnyielding(monster){
 const passive=SPECIES[monster.speciesId]?.passive;
 if(passive?.kind==="onceRevive"&&!monster._speciesReviveUsed&&canBattleRevive()){const beforeHp=monster.currentHp,beforeMp=monster.currentMp;monster._speciesReviveUsed=true;battle.reviveCount++;monster.currentHp=Math.max(1,Math.floor(calculatedStats(monster).hp*(passive.hp??.5)));monster.currentMp=Math.max(0,Math.floor(maxMp(monster)*(passive.mp??.5)));queueBattleRecovery(monster,"hp",beforeHp,monster.currentHp);queueBattleRecovery(monster,"mp",beforeMp,monster.currentMp);battleContribution(monster).revives++;syncInvincibleAllianceState();return true}
 if(hasCircleEffect(monster,"revive")&&!monster._circleReviveUsed&&canBattleRevive()){const beforeHp=monster.currentHp,beforeMp=monster.currentMp;monster._circleReviveUsed=true;battle.reviveCount++;monster.currentHp=Math.max(1,Math.floor(calculatedStats(monster).hp*.4));monster.currentMp=Math.max(0,Math.floor(maxMp(monster)*.25));queueBattleRecovery(monster,"hp",beforeHp,monster.currentHp);queueBattleRecovery(monster,"mp",beforeMp,monster.currentMp);battleContribution(monster).revives++;queueMagicCircleEvent(monster,"輪廻転生","HP40%・MP25%で蘇生");syncInvincibleAllianceState();return true}
 if(hasCircleEffect(monster,"lastLife")&&!monster._circleLastLifeUsed){monster._circleLastLifeUsed=true;monster.currentHp=1;queueMagicCircleEvent(monster,"致死ダメージを耐えた","HP1で踏みとどまる・戦闘中1回");return true}
 const guaranteed=seriesEffectValue(monster,"lastStand")>0,chance=affixValue(monster,"unyielding",60)/100;if(monster._unyieldingUsed||!guaranteed&&(!chance||Math.random()>=chance))return false;monster._unyieldingUsed=true;monster.currentHp=1;return true
}
async function tryGuardianPassive(){
 const guardian=battle?.party?.find(monster=>monster.currentHp>0&&SPECIES[monster.speciesId]?.passive?.kind==="nearDeathPartyHealOnce"&&!monster._guardianPassiveUsed),wounded=battle?.party?.some(monster=>monster.currentHp>0&&monster.currentHp/calculatedStats(monster).hp<=.25);
 if(!guardian||!wounded)return false;guardian._guardianPassiveUsed=true;const rate=SPECIES[guardian.speciesId].passive.heal??.35;
 for(const ally of battle.party.filter(monster=>monster.currentHp>0)){const maximum=calculatedStats(ally).hp,amount=Math.max(1,Math.floor(maximum*rate));recoverBattleHp(ally,amount,maximum);clearNegativeAllyEffects(battle,ally.id);clearAilments(ally)}
 addBattleLog(battle,`${displayName(guardian)}：氷華の自動聖歌が発動`);await battleBanner("氷華の自動聖歌","瀕死の仲間を守る一度限りの奇跡","skill",1000,guardian);await flushBattleRecoveries();await floatText("全体回復","party","heal");return true
}
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
  const follow=Math.max(1,Math.floor(damage*.5)),hit=applyEnemyDamage(battle,enemy,follow,{sourceId:monster?.id,element:monster?.attribute??SPECIES[monster?.speciesId]?.element??"neutral",damageClass:"physical"});
 registerWeaponFinisher(monster,enemy,hit.beforeHp);recordBattleDamage(monster,hit.damage);
 addBattleLog(battle,`${displayName(monster)}の追撃 ${hit.damage}ダメージ`);
 await floatText(hit.damage?`追撃 -${hit.damage}`:"完全ガード",enemy.id,hit.damage?"skill":"guard");
 return hit.damage;
}
async function trySeriesBurn(monster,enemy,skill){
 const chance=affixValue(monster,"burnChance",80)/100;
 if(!chance||skill?.element!=="fire"||!enemy||enemy.hp<=0||Math.random()>=chance)return false;
 const applied=applyEnemyStatus(battle,{id:"burn",name:"炎上",chance:1,turns:3,power:.04,sourceMonsterId:monster.id},enemy.id);
 if(!applied)return false;
 addBattleLog(battle,`${enemy.name}は炎上した`);await floatText("炎上",enemy.id,"burn");return true;
}
async function applyOpeningMagicCircles(){
 if(!battle)return;
 const shieldOwner=battle.party.find(monster=>(battle.circleShields?.[monster.id]??0)>0);if(shieldOwner)await magicCircleActivationFx(shieldOwner,circleInfo(shieldOwner),"最大HP50%の障壁を展開",`味方全体を保護`,{duration:580});
 const opener=battle.party.find(monster=>hasCircleEffect(monster,"openingBuff"));if(opener)await magicCircleActivationFx(opener,circleInfo(opener),"最終ダメージ・会心率 +20%",`味方全体・戦闘開始時`,{duration:620});
 for(const owner of battle.party.filter(monster=>monster.currentHp>0&&hasCircleEffect(monster,"sacrifice"))){
  const allies=battle.party.filter(monster=>monster.currentHp>0),foes=aliveEnemies(battle);if(allies.length<2||!foes.length)continue;
  const victim=allies[Math.floor(Math.random()*allies.length)],foe=foes[Math.floor(Math.random()*foes.length)];magicCircleInstantDeath(victim,owner);magicCircleInstantDeath(foe,owner);registerWeaponFinisher(owner,foe,1);await magicCircleActivationFx(owner,circleInfo(owner),"味方1体 ⇄ 敵1体",`${displayName(victim)} / ${foe.name}へ即死判定`,{danger:true,duration:800});await flushMagicCircleEvents();
 }
 if(!aliveEnemies(battle).length)return win(false,null);if(!battle.party.some(monster=>monster.currentHp>0))return lose();renderBattle();
}
function allyMagicCircleTurnCue(monster,circle){
 const level=Math.max(1,Number(circle?.level)||1),hpRatio=monster.currentHp/Math.max(1,calculatedStats(monster).hp);
 if(circle.effect==="manaReversal"){const multiplier=1.12+Math.min(.18,level*.004);return{headline:`与ダメージ ×${multiplier.toFixed(2)}`,detail:"MP回復時は回復量に応じてHPを消費"}}
 if(circle.effect==="rage"&&(monster._circleRage??0)>0){const hits=monster._circleRage??0,multiplier=1+Math.min(1,hits*.08),chains=hits>=9?2:hits>=4?1:0;return{headline:`被弾 ${hits}回・最終ダメージ ×${multiplier.toFixed(2)}`,detail:`追加連撃 ${chains}回`}}
 if(circle.effect==="weakCrit")return{headline:"弱攻撃の会心率 +38%",detail:"攻撃倍率が低いほど会心補正が上昇"};
 if(circle.effect==="goldPower"){const gold=Math.max(0,Number(save.state.player.gold)||0),multiplier=goldPowerDamageMultiplier(gold,circle.level),cost=Math.min(gold,goldPowerActionCost(gold)),cap=Math.round((.18+(Math.max(1,circle.level)-1)/98*.12)*100);return{headline:`所持GOLD換力 ×${multiplier.toFixed(2)}`,detail:`強い逓減・最大+${cap}% / 行動後 ${cost.toLocaleString()}G消費`}}
 if(circle.effect==="soleSurvivor"&&battle.party.filter(member=>member.currentHp>0).length===1)return{headline:"孤王覚醒・最終ダメージ ×2.00",detail:"被ダメージ40%軽減・最後の生存者"};
 if(circle.effect==="lowHpPower"&&hpRatio<.9){const multiplier=1+(1-hpRatio)*1.25;return{headline:`残HP ${Math.round(hpRatio*100)}%・最終ダメージ ×${multiplier.toFixed(2)}`,detail:"HPが少ないほど威力上昇"}}
 if(circle.effect==="endgameNoCrit"&&aliveEnemies(battle).some(enemy=>enemy.endgameBossId||["abyss","tenGod"].includes(enemy.faction)))return{headline:"深淵・十神の会心を封殺",detail:"対象から受ける攻撃はクリティカルにならない"};
 return null;
}
function enemyMagicCircleTurnCue(enemy,profile){
 const level=Math.max(1,Number(profile?.level)||1),base=Math.round(Math.min(.42,level*.0042)*100),offensive=["rage","weakCrit","lowHpPower","goldPower"].includes(profile.effect),defensive=["shield","lastLife","revive","soleSurvivor"].includes(profile.effect);
 if(offensive)return{headline:`全能力 +${base}%・攻撃性能 +18%`,detail:"敵専用補正として常時発動"};
 if(defensive)return{headline:`全能力 +${base}%・HP／防御 +18%`,detail:"敵専用補正として常時発動"};
 if(profile.effect==="openingBuff")return{headline:`全能力 +${base}%・速度 +18%`,detail:"開戦共鳴が常時発動"};
 return{headline:`全能力 +${base}%`,detail:"装着魔法陣の敵専用補正が発動"};
}
async function prepareMagicCircleTurn(monster){
 if(!battle||!monster)return false;const circle=circleInfo(monster);if(!circle||circle.id==="none")return false;
 const actionKey=`${battle.turn}:${battle.queueIndex}:${monster.id}`;
 if(circle.effect==="slot"){
  if(battle.circleTurnKeys?.[monster.id]===actionKey)return false;battle.circleTurnKeys[monster.id]=actionKey;
  const roll=Math.floor(Math.random()*1000),multiplier=slotDamageMultiplier(roll),digits=String(roll).padStart(3,"0"),instantKill=roll===999,victim=instantKill?(selectedEnemy(battle)??aliveEnemies(battle)[0]):null;battle.circleTurnMultipliers[monster.id]=multiplier;battle.busy=true;renderBattle();
  await magicCircleActivationFx(monster,circle,instantKill?"999・即死確定":multiplier===0?"行動休止":`最終ダメージ ×${multiplier.toFixed(2)}`,instantKill&&victim?`${victim.name}の命運を断つ`:multiplier===0?"000停止・この行動はスキップ":"000〜999抽選結果",{digits,danger:multiplier===0||instantKill,duration:820});addBattleLog(battle,`${displayName(monster)}：運命の三桁環 ${digits}${instantKill?"（即死確定）":multiplier?`（×${multiplier.toFixed(2)}）`:"（行動休止）"}`);
  if(instantKill&&victim?.hp>0){const beforeHp=victim.hp;magicCircleInstantDeath(victim,monster,{force:true});recordBattleDamage(monster,beforeHp);registerWeaponFinisher(monster,victim,beforeHp);addBattleLog(battle,`${victim.name}は999の運命に呑まれた`);await floatText("999・即死",victim.id,"critical");await animateDefeat(victim.id);battle.busy=false;battle.actionCommitted=true;renderBattle();if(!aliveEnemies(battle).length){await win(false,null);return true}await finishCurrentAction();return true}
  battle.busy=false;
  if(multiplier===0){battle.actionCommitted=true;renderBattle();await wait(220);await finishCurrentAction();return true}renderBattle();return false;
 }
 const cue=allyMagicCircleTurnCue(monster,circle),cueKey=`${monster.id}:${circle.effect}`;if(!cue||battle.circleCueKeys?.[cueKey])return false;
 battle.circleCueKeys??={};battle.circleCueKeys[cueKey]=true;battle.busy=true;renderBattle();await magicCircleActivationFx(monster,circle,cue.headline,cue.detail,{duration:560});addBattleLog(battle,`${displayName(monster)}：${circle.name}（${cue.headline}）`);battle.busy=false;renderBattle();return false;
}
async function prepareEnemyMagicCircleTurn(enemy){
 if(!battle||!enemy?.enemyMagicCircle)return false;const profile=enemy.enemyMagicCircle,actionKey=`${battle.turn}:${battle.queueIndex}:${enemy.id}`;
 if(profile.effect==="slot"){
  if(battle.enemyCircleTurnKeys?.[enemy.id]===actionKey)return false;battle.enemyCircleTurnKeys??={};battle.enemyCircleTurnKeys[enemy.id]=actionKey;
  const roll=Math.floor(Math.random()*1000),multiplier=slotDamageMultiplier(roll),digits=String(roll).padStart(3,"0");enemy._circleActionMultiplier=multiplier;battle.busy=true;renderBattle();await magicCircleActivationFx(enemy,profile,multiplier===0?"行動休止":`行動威力 ×${multiplier.toFixed(2)}`,multiplier===0?"000停止・敵の行動をスキップ":"敵側の三桁抽選結果",{digits,danger:true,duration:820});addBattleLog(battle,`${enemy.name}：${profile.name} ${digits}${multiplier?`（×${multiplier.toFixed(2)}）`:"（行動休止）"}`);battle.busy=false;
  if(multiplier===0){battle.actionCommitted=true;renderBattle();await wait(220);await finishCurrentAction();return true}renderBattle();return false;
 }
 if(enemy._circleActivationShown)return false;enemy._circleActivationShown=true;const cue=enemyMagicCircleTurnCue(enemy,profile);battle.busy=true;renderBattle();await magicCircleActivationFx(enemy,profile,cue.headline,cue.detail,{danger:true,duration:560});addBattleLog(battle,`${enemy.name}：${profile.name}（${cue.headline}）`);battle.busy=false;renderBattle();return false;
}
function startBattle(encounter,options={}){
 const rawEntries=Array.isArray(encounter)?encounter:[encounter],normalGuideBattle=!options.memoryBattle&&!options.specialBattle&&!rawEntries.some(entry=>entry?.boss||entry?.floorBossCatalogId||entry?.uncapturable||entry?.endgameBossId),guide=contextualGuideState();
 let tutorialCaptureEligible=false,tutorialAttributeBattle=false;if(normalGuideBattle&&!guide.disabled){bumpGuideCounter(guide,"normalBattles");tutorialCaptureEligible=["battle_attack","battle_skill_open","battle_skill_use","battle_capture"].some(id=>!guideStepDone(guide,id));tutorialAttributeBattle=!tutorialCaptureEligible&&!guideStepDone(guide,"attribute_skill");save.save()}
 const entries=tutorialCaptureEligible?rawEntries.slice(0,1):rawEntries;
 if(!options.memoryBattle&&!options.specialBattle)rememberBattleEncounter(entries);
 if(!options.memoryBattle&&!options.specialBattle)for(const entry of entries)if(entry.floorBossCatalogId)recordFloorBossDiscovery(save.state,entry.floorBossCatalogId);
 entries.forEach(entry=>recordBiomeEncounter(save.state,options.memoryBattle?(options.memorySourceFloor??save.state.player.currentFloor):save.state.player.currentFloor,entry.speciesId));
 const party=save.state.party.map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean),synergy=partySynergy(),biomeBattle=!options.specialBattle&&!options.memoryBattle?battleBiomeForFloor(save.state.player.currentFloor):null;
 party.forEach(monster=>{
  delete monster._synergy;
  const previousMaxHp=Math.max(1,Number(calculatedStats(monster).hp)||1),wasAlive=monster.currentHp==null||Number(monster.currentHp)>0;
  const element=normalizedElement(monster.attribute??SPECIES[monster.speciesId]?.element),matches=synergy&&element===synergy.element,terrain=biomeElementMultiplier(biomeBattle,element)-1;
  monster._synergy={atk:(matches?synergy.atk??0:0)+terrain,def:(matches?synergy.def??0:0)+terrain,hp:(matches?synergy.hp??0:0)+terrain,spd:(matches?synergy.spd??0:0)+terrain,crit:matches?synergy.crit??0:0,evasion:matches?synergy.evasion??0:0};
  if(!options.continuingSpecialWave){monster._unyieldingUsed=false;monster._speciesReviveUsed=false;monster._guardianPassiveUsed=false;monster._circleReviveUsed=false;monster._circleLastLifeUsed=false;monster._circleDeathMirrorUsed=false;monster._circleRage=0;monster._circleDeathHandled=false}
  const hp=calculatedStats(monster).hp,mp=maxMp(monster);
  if(monster.currentHp==null)monster.currentHp=hp;
  else if(wasAlive&&hp>previousMaxHp)monster.currentHp+=hp-previousMaxHp;
  if(monster.currentMp==null)monster.currentMp=mp;
  monster.currentHp=Math.min(monster.currentHp,hp);monster.currentMp=Math.min(monster.currentMp,mp);if(options.specialBattleType!=="gauntlet"&&!options.continuingSpecialWave)applyStartMpAffix(monster)
 });
 entries.forEach(entry=>save.state.codex.encounters[entry.speciesId]=(save.state.codex.encounters[entry.speciesId]??0)+1);
 save.save();
 const enemies=ensureUniqueEnemyMagicCircles(entries.map(makeBattleEnemy),options.memorySourceFloor??save.state.player.currentFloor);
 const enemySynergy=attributeSynergyFor(enemies.map(enemy=>enemy.trialElement));
 enemies.forEach(enemy=>{
  const matches=enemySynergy&&normalizedElement(enemy.trialElement)===enemySynergy.element,terrain=biomeElementMultiplier(biomeBattle,enemy.trialElement),resonance=matches?1+Math.max(enemySynergy.atk??0,enemySynergy.def??0,enemySynergy.hp??0,enemySynergy.spd??0):1;
  applyEnemyMultiplier(enemy,terrain*resonance);if(matches){enemy.crit=(enemy.crit??0)+(enemySynergy.crit??0);enemy.evasion=(enemy.evasion??0)+(enemySynergy.evasion??0)}
 });
 enemies.filter(enemy=>enemy.elite).forEach(enemy=>recordEliteEncounter(save.state,enemy));save.save();
 const endgameFaction=enemies.find(enemy=>enemy.faction)?.faction,battleTheme=endgameFaction==="tenGod"?"ten-gods":endgameFaction==="abyss"?"abyss":enemies.some(enemy=>enemy.boss)?"boss":biomeBattle?.theme??"default";
 const explorationAuto=!tutorialCaptureEligible&&!tutorialAttributeBattle&&save.state.settings.exploreAutoMode!=="off"&&!options.specialBattle&&!options.memoryBattle;
 battle={battleId:crypto.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`,enemies,enemy:enemies[0],targetEnemyId:enemies[0]?.id,party,species:SPECIES,turn:1,busy:false,guideReady:false,auto:explorationAuto||save.state.settings.autoBattle,explorationAuto,guards:{},escapePending:false,actionCommitted:false,skillMenu:false,itemMenu:false,allySynergy:synergy,enemySynergy,biomeBattle,battleTheme,reviveCount:0,equipmentAuthorityCueKeys:{},performance:Object.fromEntries(party.map(monster=>[monster.id,{damage:0,taken:0,healing:0,revives:0,kills:0}])),affectionDeathRecorded:Object.fromEntries(party.map(monster=>[monster.id,monster.currentHp<=0])),circleTurnMultipliers:{},circleTurnKeys:{},circleCueKeys:{},enemyCircleTurnKeys:{},circleShields:{},signatureShields:{},signatureChains:{},signatureExtraRounds:{},signatureResonances:Object.fromEntries(activeSignatureResonances(save.state,party).map(entry=>[entry.monster.id,entry.definition])),hpDisplayRates:{},hpTrails:{},magicCircleProfiles:Object.fromEntries(party.map(monster=>[monster.id,equippedMagicCircle(monster,save.state)])),magicCircleArt:Object.fromEntries(party.map(monster=>[monster.id,magicCircleMarkup(monster,save.state,{className:"battle-magic-circle"})])),enemyMagicCircleArt:Object.fromEntries(enemies.map(enemy=>[enemy.id,enemyMagicCircleMarkup(enemy.enemyMagicCircle)])),openingCircleBuff:party.some(monster=>hasCircleEffect(monster,"openingBuff")),...createBattleRulesState(party),...options};
 battle.tutorialCaptureEligible=tutorialCaptureEligible;battle.tutorialAttributeBattle=tutorialAttributeBattle;
 if(tutorialCaptureEligible){battle.auto=false;save.state.settings.autoBattle=false;save.state.settings.exploreAutoMode="off";const target=enemies[0];if(target){const oldHp=Math.max(1,target.maxHp);target.maxHp=Math.max(oldHp,Math.round(oldHp*6));target.hp=target.maxHp;target.atk=Math.max(1,Math.floor(target.atk*.28));target.matk=Math.max(1,Math.floor((target.matk??target.atk)*.28));save.state.inventory.captureCrystals=Math.max(Number(save.state.inventory.captureCrystals)||0,captureCrystalCost(target))}save.state.inventory.potions=Math.max(1,Number(save.state.inventory.potions)||0);save.save()}
 if(tutorialAttributeBattle){battle.auto=false;save.state.settings.autoBattle=false;save.save()}
 initializeFloorBossDeathTracking();battle.invincibleAlliance=invincibleAllianceReady();
 const shieldOwner=party.find(monster=>hasCircleEffect(monster,"shield"));if(shieldOwner)party.forEach(monster=>battle.circleShields[monster.id]=Math.floor(calculatedStats(monster).hp*.5));
 audio.setScene(enemies.some(enemy=>enemy.faction==="tenGod")?"divine":enemies.some(enemy=>enemy.faction==="abyss")?"abyss":enemies.some(enemy=>enemy.elite)?"elite":enemies.some(enemy=>enemy.boss)?"boss":"battle");audio.sfx(enemies.some(enemy=>enemy.endgameBossId||enemy.boss)?"boss":"select");
 buildTurnQueue(battle);
 if(tutorialCaptureEligible||tutorialAttributeBattle){const firstAlly=battle.turnQueue.findIndex(entry=>entry.type==="ally");if(firstAlly>0)battle.turnQueue.unshift(...battle.turnQueue.splice(firstAlly,1))}
 if(synergy)addBattleLog(battle,`${synergy.name}が発動！`);
 if(enemySynergy)addBattleLog(battle,`敵軍の${enemySynergy.name}が発動！`);
 if(biomeBattle)addBattleLog(battle,`${biomeBattle.name}：適性属性は強化、不適性属性は弱体化`);
 for(const{monster,authority}of battleEquipmentAuthorityRows(party))addBattleLog(battle,`装備固有能力｜${displayName(monster)}・${authority.name} 有効：${authority.description}`);
 if(options.memoryBattle)addBattleLog(battle,`深淵の記憶から${enemies[0]?.name??"魔物"}が現れた`);
 for(const enemy of enemies.filter(unit=>unit.floorBossPassive&&unit.floorBossDomain)){addBattleLog(battle,`${enemy.floorBossPassive.name}／${enemy.floorBossDomain.name}が発動`)}
 if(battle.invincibleAlliance)addBattleLog(battle,"無敵・四LR連携が発動！");
 for(const monster of party){const resonance=signatureResonance(monster);if(!resonance)continue;if(resonance.awakened)battle.signatureShields[monster.id]=Math.max(1,Math.floor(calculatedStats(monster).hp*.25));addBattleLog(battle,`${displayName(monster)}：専用共鳴「${resonance.name}」${resonance.awakened?"6点・完全覚醒":`${resonance.pieces}/6`} 発動中`)}
 addBattleLog(battle,`行動順：${battle.turnQueue.map(entry=>entry.name).join(" → ")}`);
 saveBattleCheckpoint();renderBattle();setTimeout(async()=>{await battleIntro(enemies);const authorityRows=battleEquipmentAuthorityRows(party);if(authorityRows.length){const labels=authorityRows.slice(0,3).map(({monster,authority})=>`${displayName(monster)}・${authority.name}`),remaining=authorityRows.length-labels.length;await battleBanner("装備固有能力 有効",`${labels.join("／")}${remaining?`／ほか${remaining}種`:""}`,"equipment-authority",650)}if(battle?.invincibleAlliance)await battleBanner("無敵","えなみ・りおん・より・ひで　四LR連携","synergy invincible",900,party[0]);for(const monster of party){const resonance=signatureResonance(monster);if(resonance)await battleBanner(resonance.awakened?"専用6点・完全覚醒":"専用共鳴 発動中",`${displayName(monster)}・${resonance.name} ${resonance.pieces}/6`,"synergy",resonance.awakened?720:480,monster)}await applyOpeningMagicCircles();if(!battle)return;battle.guideReady=true;renderBattle();continueBattleFlow()},scaledBattleDelay(120))
}
function actor(){return currentAlly(battle)}
function protectTutorialCaptureTarget(){
 const target=battle?.enemies?.find(enemy=>!enemy.captured);if(!battle?.tutorialCaptureEligible||contextGuideDone("battle_capture")||!target||target.hp>0)return false;target.hp=Math.max(1,Math.floor(target.maxHp*.18));addBattleLog(battle,`${target.name}は捕獲できる程度の力を残して踏みとどまった`);return true
}
function refreshBattleHpTrails(){
 if(!battle)return;
 sanitizeBattleParty();
 const now=Date.now(),rates={};
 for(const enemy of battle.enemies??[])rates[`enemy:${enemy.id}`]=Math.max(0,Math.min(100,enemy.hp/Math.max(1,enemy.maxHp)*100));
 for(const monster of battle.party??[])rates[`ally:${monster.id}`]=Math.max(0,Math.min(100,monster.currentHp/Math.max(1,calculatedStats(monster).hp)*100));
 battle.hpDisplayRates??={};battle.hpTrails??={};
 for(const [id,rate] of Object.entries(rates)){
 const previous=Number(battle.hpDisplayRates[id]);
  if(Number.isFinite(previous)&&rate<previous-.01)battle.hpTrails[id]={from:previous,to:rate,startedAt:now,duration:hpDrainDuration(previous,rate)};
  else if(Number.isFinite(previous)&&rate>previous+.01)delete battle.hpTrails[id];
  battle.hpDisplayRates[id]=rate;
 }
 for(const [id,trail] of Object.entries(battle.hpTrails))if(now-(Number(trail.startedAt)||0)>Math.max(250,Number(trail.duration)||0)+250)delete battle.hpTrails[id];
}
const BATTLE_EFFECT_DETAIL=Object.freeze({atkUp:["物理・魔法ATK","atk",1],atkDown:["物理・魔法ATK","atk",-1],defUp:["物理・魔法DEF","def",1],defDown:["物理・魔法DEF","def",-1],spdUp:["SPD","spd",1],spdDown:["SPD","spd",-1],critUp:["会心率",null,1],healDown:["回復量",null,-1],reviveSeal:["蘇生封印",null,-1],guaranteedHit:["必中",null,1],guaranteedCritical:["確定会心",null,1],guard:["被ダメージ軽減",null,1],vulnerable:["被ダメージ増加",null,-1],regen:["HP自動回復",null,1],counter:["反撃倍率",null,1],lifeSteal:["吸収率",null,1],taunt:["挑発",null,1],stun:["行動不能",null,-1]});
function formatBattleInteger(value){return Math.round(Number(value)||0).toLocaleString("ja-JP")}
function openBattleStatusDetail(id){
 const ally=battle.party.find(entry=>entry.id===id),enemy=battle.enemies.find(entry=>entry.id===id),target=ally??enemy,targetType=ally?"ally":"enemy";if(!target)return;
 const rawEffects=targetType==="ally"?(battle.allyEffects?.[id]??[]):(battle.enemyEffects?.[id]??[]),ailments=targetType==="ally"?(battle.allyAilments?.[id]??[]):(battle.enemyStatuses?.[id]??[]),kinds=[...new Set(rawEffects.map(effect=>effect.kind))],stats=ally?calculatedStats(ally):target,sourceName=ally?displayName(ally):target.name,percent=value=>`${(Number(value)*100).toLocaleString("ja-JP",{maximumFractionDigits:1})}%`;
 const groups=kinds.map(kind=>{const detail=BATTLE_EFFECT_DETAIL[kind]??[kind,null,1],stack=effectStackBreakdown(battle,id,kind,targetType),total=stack.reduce((sum,effect)=>sum+effect.applied,0),base=detail[1]?Number(stats[detail[1]])||0:null,opposite=kind.endsWith("Up")?kind.replace(/Up$/,"Down"):kind.endsWith("Down")?kind.replace(/Down$/,"Up"):null,oppositeTotal=opposite?effectValue(battle,id,opposite,targetType):0,final=base==null?null:base*Math.max(.2,1+(kind.endsWith("Up")?total-oppositeTotal:oppositeTotal-total));return`<section class="battle-status-detail-group ${detail[2]<0?"negative":"positive"}"><header><span><small>${detail[2]<0?"DEBUFF":"BUFF"}</small><b>${detail[0]}</b></span><strong>${detail[2]<0?"−":"＋"}${percent(total)}</strong></header>${base==null?"":`<p class="battle-status-final"><span><small>基礎値</small>${formatBattleInteger(base)}</span><b><small>効果反映後</small>${formatBattleInteger(final)}</b></p>`}<div class="battle-status-effect-entries">${stack.map(effect=>`<article><header><b>${effect.sourceSkillName??effect.name??kind}</b><em>残り${Math.max(0,Number(effect.turns)||0)}ターン</em></header><small class="battle-status-effect-source">発動元：${effect.sourceName??"効果元不明"}</small><dl><div><dt>元効果</dt><dd>${percent(effect.original)}</dd></div><div><dt>減衰率</dt><dd>${percent(effect.attenuation)}</dd></div><div class="applied"><dt>最終効果</dt><dd>${percent(effect.applied)}</dd></div></dl></article>`).join("")}</div><footer><span>この項目の合計</span><strong>${detail[2]<0?"−":"＋"}${percent(total)}</strong></footer></section>`}).join("");
 const ailmentRows=ailments.map(effect=>`<article class="battle-status-ailment"><header><small>状態異常</small><b>${effect.name??effect.id??effect.kind}</b></header><strong>残り${Math.max(0,Number(effect.turns)||0)}ターン</strong><small>発動元：${effect.sourceName??effect.sourceSkillName??"継続状態"}</small></article>`).join("");
 app.insertAdjacentHTML("beforeend",Modal(`${sourceName}・状態効果`,`<div class="battle-status-detail-list detailed">${groups}${ailmentRows||""}${groups||ailmentRows?"":"<p>状態効果はありません</p>"}</div>`,"閉じる"));const modal=topModal(),close=()=>modal.remove();modal.classList.add("battle-status-detail-modal");modal.querySelector("[data-modal-primary]").onclick=close;bindTapAnywhereClose(modal,close)
}
function renderBattle(){
 if(!battle)return;
 sanitizeBattleParty();
 clearContextGuide();
 refreshBattleHpTrails();
 document.querySelector(".battle-screen")?.remove();app.insertAdjacentHTML("beforeend",BattleScreen(battle,save.state.inventory,save.state.settings,save.state.player.currentFloor));
 document.querySelectorAll("[data-command]").forEach(button=>button.onclick=()=>command(button.dataset.command));
 document.querySelectorAll("[data-skill-id]").forEach(button=>button.onclick=()=>command("skill",button.dataset.skillId));
 document.querySelectorAll("[data-battle-item]").forEach(button=>button.onclick=()=>openBattleItemTarget(button.dataset.battleItem));
 document.querySelectorAll("[data-battle-detail]").forEach(button=>button.onclick=()=>showBattleMonsterDetail(button.dataset.battleDetail));
 document.querySelectorAll("[data-status-detail]").forEach(button=>button.onclick=event=>{event.stopPropagation();openBattleStatusDetail(button.dataset.statusDetail)});
 document.querySelectorAll("[data-enemy-target]").forEach(button=>button.onclick=()=>{if(battle.busy)return;battle.targetEnemyId=button.dataset.enemyTarget;renderBattle()});
 document.querySelector(".battle-arena")?.addEventListener("click",event=>{
  if(!battle.auto||event.target.closest("button,.combatant")||battle.explorationAuto)return;
  battle.auto=false;save.state.settings.autoBattle=false;saveBattleCheckpoint();showToast("手動操作へ切替");renderBattle();
 });
 const closeSkill=document.getElementById("closeSkillMenu");if(closeSkill)closeSkill.onclick=()=>{battle.skillMenu=false;renderBattle()};
 const closeItem=document.getElementById("closeItemMenu");if(closeItem)closeItem.onclick=()=>{battle.itemMenu=false;renderBattle()};
 document.getElementById("battleSpeed").onclick=()=>{const index=BATTLE_SPEED_OPTIONS.indexOf(battleSpeed());save.state.settings.battleSpeed=BATTLE_SPEED_OPTIONS[(index+1)%BATTLE_SPEED_OPTIONS.length];save.save();renderBattle()};
 const autoButton=document.getElementById("toggleBattleAuto"),toggleBattleAuto=()=>{
  if(!battle)return;
  battle.auto=!battle.auto;save.state.settings.autoBattle=battle.auto;save.save();showToast(`自動戦闘 ${battle.auto?"有効":"無効"}`);renderBattle();if(battle.auto&&!battle.busy)continueBattleFlow();
 };
 // Battle rendering can replace the header between touchstart and click on
 // mobile Safari. Toggle on pointerdown so one deliberate tap always lands.
 autoButton?.addEventListener("pointerdown",event=>{if(event.button!=null&&event.button!==0)return;event.preventDefault();event.stopPropagation();toggleBattleAuto()},{passive:false});
 autoButton?.addEventListener("keydown",event=>{if(event.key!=="Enter"&&event.key!==" ")return;event.preventDefault();toggleBattleAuto()});
 document.getElementById("escapeBattle")?.addEventListener("click",requestEscape);
 requestAnimationFrame(scheduleBattleContextGuide);
}
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
 if(type==="reviveLeaves"&&!canBattleRevive())return alert("この戦闘の蘇生上限99回に達しました");
 battle.busy=true;battle.itemMenu=false;battle.actionCommitted=true;save.state.inventory[type]--;
 if(type==="potions"){const max=calculatedStats(target).hp;recordBattleHealing(a,recoverBattleHp(target,scaledRecovery(100,max,.10),max))}
 if(type==="highPotions"){const max=calculatedStats(target).hp;recordBattleHealing(a,recoverBattleHp(target,scaledRecovery(300,max,.25),max))}
 if(type==="partyPotions")list.filter(m=>m.currentHp>0).forEach(m=>{const max=calculatedStats(m).hp;recordBattleHealing(a,recoverBattleHp(m,scaledRecovery(50,max,.07),max))});
 if(type==="manaPotions"){const max=maxMp(target);recoverBattleMp(target,scaledRecovery(30,max,.10),a)}
 if(type==="highManaPotions"){const max=maxMp(target);recoverBattleMp(target,scaledRecovery(100,max,.25),a)}
 if(type==="partyManaPotions")list.filter(m=>m.currentHp>0).forEach(m=>{const max=maxMp(m);recoverBattleMp(m,scaledRecovery(30,max,.07),a)});
 if(type==="fullManaPotions")recoverBattleMp(target,maxMp(target),a);
 if(type==="partyFullManaPotions")list.filter(m=>m.currentHp>0).forEach(m=>recoverBattleMp(m,maxMp(m),a));
 if(type==="reviveLeaves")reviveBattleMonster(target,.3,0,a);
 if(type==="statusCures"||type==="partyStatusCures")list.filter(Boolean).forEach(clearAilments);
 if(type==="fullHeals"||type==="partyFullHeals")list.filter(m=>m.currentHp>0).forEach(m=>{const hpMax=calculatedStats(m).hp,mpMax=maxMp(m),beforeMp=m.currentMp;recordBattleHealing(a,recoverBattleHp(m,hpMax,hpMax));m.currentMp=mpMax;queueBattleRecovery(m,"mp",beforeMp,m.currentMp);clearAilments(m)});
 completeContextGuide("battle_heal_item",{quiet:true});
 addBattleLog(battle,`${displayName(a)}：アイテム使用`);await flushBattleRecoveries();saveBattleCheckpoint();renderBattle();await wait(220);battle.busy=false;await finishCurrentAction()
}

function showBattleMonsterDetail(id){
 const m=battle.party.find(x=>x.id===id);if(!m)return;
 const st=calculatedStats(m),mp=maxMp(m),need=expNeedFor(m),exp=Math.max(0,Number(m.exp)||0),sp=SPECIES[m.speciesId]??{},element=normalizedElement(m.attribute??sp.element),affection=Math.max(0,Math.min(1000,Number(m.affection??m.bond)||0)),bonus=affectionBonuses(affection),percent=value=>`${Math.round((Number(value)||0)*100)}%`,circle=equippedMagicCircle(m,save.state);
 const affectionEffects=[["HP",bonus.hp],["物理・魔法ATK",bonus.atk],["物理・魔法DEF",bonus.def],["SPD",bonus.spd]].filter(([,value])=>value>0).map(([label,value])=>`${label}+${percent(value)}`).join(" / ")||"まだボーナスなし";
 const gear=Object.entries(m.equipment??{}).map(([slot,itemId])=>{const item=save.state.equipment.find(entry=>entry.id===itemId);return`<div><small>${slotLabel(slot)}</small><b>${item?`[${equipmentDisplayRarity(item)}] ${item.name} Lv.${item.level}`:"なし"}</b></div>`}).join("");
 const skills=learnedSkills(m).map(skill=>`<div><b>${skill.name}</b><small>${skill.tag??skill.type??"スキル"}・MP ${effectiveSkillMpCost(m,skill)}・CT ${skill.cooldown??0}<br>${skillEffectSummary(skill," / ")}</small></div>`).join("")||'<p class="muted">習得スキルなし</p>';
 const roleLabels={balanced:"万能型",burst:"高火力型",controller:"妨害型",support:"支援型",speed:"高速型",tank:"防御型",healer:"回復型",magic:"魔法型",physical:"物理型",debuffer:"弱体型",poison:"毒撃型",burner:"炎撃型",creator:"創造者",ambush:"奇襲型"},trait=TRAITS[m.traitId]??TRAITS.steady;
 const body=`<div class="battle-detail battle-detail-v2">
  <div class="battle-detail-hero">${monsterVisual(m,sp.emoji??"👹",{className:"modal-monster-visual"})}<div><small>PARTY MEMBER</small><h3>${displayName(m)}</h3><b>Lv.${m.level}　+${m.plus}</b><span>${attributeVisual(element,{label:`${ATTRIBUTES[element]?.name??element}属性`})}<strong>${ATTRIBUTES[element]?.name??element}属性</strong></span></div></div>
  <section><h4>現在値</h4><div class="battle-detail-vitals"><span><small>HP</small><b>${m.currentHp??st.hp} / ${st.hp}</b></span><span><small>MP</small><b>${m.currentMp??mp} / ${mp}</b></span></div></section>
  <section><h4>戦闘能力</h4><div class="battle-detail-stat-grid"><span><small>物理ATK</small><b>${st.atk.toLocaleString()}</b></span><span><small>魔法ATK</small><b>${(st.matk??st.atk).toLocaleString()}</b></span><span><small>物理DEF</small><b>${st.def.toLocaleString()}</b></span><span><small>魔法DEF</small><b>${(st.mdef??st.def).toLocaleString()}</b></span><span><small>SPD</small><b>${st.spd.toLocaleString()}</b></span><span><small>会心 / 回避</small><b>${st.crit}% / ${st.evasion}%</b></span></div></section>
  <section class="battle-affection-detail"><h4>なつき度 <b>${affection}/1000</b></h4><div class="battle-bar affection"><i style="width:${affection/10}%"></i></div><p>${affectionEffects}</p></section>
  <section><h4>個体情報</h4><div class="battle-detail-profile"><p><small>種族</small><b>${sp.race??"不明"}族</b></p><p><small>役割</small><b>${roleLabels[sp.role]??sp.role??"万能型"}</b></p><p><small>特性</small><b>${trait.name}</b><span>${trait.description}</span></p><p><small>魔法陣</small><b>${circle.name}${circle.level?` Lv.${circle.level}`:""}</b><span>${circle.summary}</span></p></div></section>
  <section><h4>EXP ${exp.toLocaleString()} / ${need.toLocaleString()}</h4><div class="battle-bar exp"><i style="width:${Math.min(100,exp/Math.max(1,need)*100)}%"></i></div></section>
  <section><h4>装備</h4><div class="battle-detail-gear">${gear}</div></section>
  <section><h4>スキル</h4><div class="battle-detail-skills">${skills}</div></section>
  <p class="battle-detail-tap-hint">上下にスライドできます・短くタップすると閉じます</p>
 </div>`;
 app.insertAdjacentHTML("beforeend",Modal(displayName(m),body,"閉じる"));const modal=topModal();modal.classList.add("battle-detail-modal","battle-detail-modal-v2");const close=()=>modal.remove();modal._onDismiss=close;bindTapAnywhereClose(modal,close);modal.querySelector("[data-modal-primary]").onclick=close
}
function registerWeaponFinisher(monster,enemy,beforeHp){
 if(!monster||!enemy||beforeHp<=0||enemy.hp>0||enemy.captured||enemy.weaponKillRecorded)return;
 enemy.weaponKillRecorded=true;enemy.defeatedByMonsterId=monster.id;
 const row=battleContribution(monster);if(row)row.kills++;
 recordWeaponKill(save.state,monster.id,enemy)
}
function allyAttackFactor(id){return(1+effectValue(battle,id,"atkUp")-effectValue(battle,id,"atkDown"))}
function allyDefenseFactor(id){return Math.max(.2,1+effectValue(battle,id,"defUp")-effectValue(battle,id,"defDown"))}
function enemyAttackFactor(id){return Math.max(.2,1+effectValue(battle,id,"atkUp","enemy")-effectValue(battle,id,"atkDown","enemy"))}
function enemyDefenseFactor(id){return Math.max(.2,1+effectValue(battle,id,"defUp","enemy")-effectValue(battle,id,"defDown","enemy"))}
function allyAilment(target,statusId=null){
 const ailments=battle?.allyAilments?.[target?.id]??[],effects=battle?.allyEffects?.[target?.id]??[];
 if(statusId)return ailments.find(status=>status.id===statusId)||effects.find(effect=>effect.sourceStatusId===statusId||effect.statusId===statusId||effect.kind===statusId)||null;
 return ailments[0]??effects.find(effect=>effect.sourceStatusId||["stun","spdDown","atkDown","defDown","evasionDown","accuracyDown","vulnerable","healDown","reviveSeal"].includes(effect.kind))??null;
}
function registerFloorBossDodge(enemy){
 const passive=enemy?.floorBossPassive??{},afterimageGain=Math.max(0,Math.floor(Number(passive.afterimageOnDodge)||0)),afterimageCap=Math.max(0,Math.floor(Number(passive.afterimageCap)||0));
 if(afterimageGain&&afterimageCap){const stacks=Math.max(0,Number(enemy._floorBossAfterimages)||0);enemy._floorBossAfterimages=Math.min(afterimageCap,stacks+afterimageGain);if(enemy._floorBossAfterimages>stacks)addBattleLog(battle,`${enemy.name}：${passive.name} 残像${enemy._floorBossAfterimages}/${afterimageCap}`)}
	 if(Number(passive.mpOnDodgeRate)>0){const maximum=Math.max(0,Number(enemy.maxMp)||0),before=Math.max(0,Number(enemy.currentMp)||0),gain=Math.max(1,Math.floor(maximum*Math.min(.5,Number(passive.mpOnDodgeRate))));enemy.currentMp=Math.min(maximum,before+gain);if(enemy.currentMp>before)addBattleLog(battle,`${enemy.name}：${passive.name}でMP${enemy.currentMp-before}回収`)}
	 if(Number(passive.cooldownOnDodge)>0){const amount=Math.max(1,Math.floor(Number(passive.cooldownOnDodge)));enemy.specialCooldown=Math.max(0,Number(enemy.specialCooldown)||0)-amount;enemy.specialCooldown=Math.max(0,enemy.specialCooldown)}
	 if(enemy.floorBossDomain?.effect==="undertowRiposte"){enemy._floorBossRiposteReady=true;addBattleLog(battle,`${enemy.floorBossDomain.name}：返潮反撃が成立`)}
 const momentum=passive.dodgeMomentum,cap=Math.max(0,Math.floor(Number(momentum?.cap)||0));if(!momentum||!cap)return;
 const stacks=Math.max(0,Number(enemy._floorBossDodgeMomentum)||0);if(stacks>=cap)return;enemy._floorBossDodgeMomentum=stacks+1;enemy.spd=Math.max(1,Math.floor(enemy.spd*(1+Math.max(0,Number(momentum.spd)||0))));enemy.evasion=Math.min(75,Math.max(0,Number(enemy.evasion)||0)+Math.max(0,Number(momentum.evasion)||0));addBattleLog(battle,`${enemy.name}：${passive.name} ${enemy._floorBossDodgeMomentum}/${cap}`);
}
function convertedAttackStats(stats,monsterId){
 const monster=battle?.party?.find(member=>member.id===monsterId),equipmentRate=(Number(monster?._equipmentAffixes?.magicToPhysical)||0)/100,rate=Math.max(0,Math.min(1,effectValue(battle,monsterId,"magicToPhysical")+equipmentRate)),magic=Math.max(0,Number(stats.matk??stats.atk)||0);
 return rate?{...stats,atk:(Number(stats.atk)||0)+magic*rate,matk:magic*(1-rate)}:stats;
}
const POSITIVE_ENEMY_EFFECTS=new Set(["atkUp","defUp","spdUp","evasionUp","accuracyUp","critUp","guaranteedHit","guaranteedCritical","regen","taunt","guard","counter","lifeSteal","magicToPhysical"]);
const INVERTED_BATTLE_EFFECTS=Object.freeze({atkUp:"atkDown",defUp:"defDown",spdUp:"spdDown",evasionUp:"evasionDown",accuracyUp:"accuracyDown",critUp:"accuracyDown",guaranteedHit:"accuracyDown",guaranteedCritical:"atkDown",regen:"vulnerable",taunt:"vulnerable",guard:"defDown",counter:"atkDown",lifeSteal:"atkDown",magicToPhysical:"atkDown"});
function dispelRandomEnemyBuff(source){
 const candidates=[];
 for(const enemy of aliveEnemies(battle))for(const [index,effect] of (battle.enemyEffects?.[enemy.id]??[]).entries())if(POSITIVE_ENEMY_EFFECTS.has(effect.kind))candidates.push({enemy,index,effect});
 if(candidates.length){const picked=candidates[Math.floor(Math.random()*candidates.length)];battle.enemyEffects[picked.enemy.id].splice(picked.index,1);addBattleLog(battle,`${displayName(source)}：${picked.enemy.name}の${picked.effect.name??picked.effect.kind}を解除`);return{...picked.effect}}
 const fallback=aliveEnemies(battle).filter(enemy=>enemy.guard||enemy.charging||enemy.enraged||(enemy.divineBarrier??0)>0);
 if(!fallback.length)return null;const enemy=fallback[Math.floor(Math.random()*fallback.length)];if(enemy.divineBarrier>0)enemy.divineBarrier=0;else if(enemy.enraged)enemy.enraged=false;else if(enemy.charging)enemy.charging=false;else enemy.guard=false;addBattleLog(battle,`${displayName(source)}：${enemy.name}の戦闘強化を解除`);return{kind:"combatBoost",value:0,turns:0};
}
function invertRandomEnemyBuff(source,rate=1){
 const candidates=[];for(const enemy of aliveEnemies(battle))for(const[index,effect]of(battle.enemyEffects?.[enemy.id]??[]).entries())if(POSITIVE_ENEMY_EFFECTS.has(effect.kind))candidates.push({enemy,index,effect});if(!candidates.length)return null;
 const picked=candidates[Math.floor(Math.random()*candidates.length)],kind=INVERTED_BATTLE_EFFECTS[picked.effect.kind]??"vulnerable";battle.enemyEffects[picked.enemy.id].splice(picked.index,1);const value=Math.max(.01,Number(picked.effect.value)||.10)*Math.max(0,Math.min(1,Number(rate)||1)),inverted={kind,value,turns:Math.max(1,Math.min(3,Number(picked.effect.turns)||2)),chance:1,sourceKey:`${source.id}:buff-inversion`,sourceMonsterId:source.id,sourceName:displayName(source)};applyBattleEffect(battle,picked.enemy.id,inverted,"enemy");addBattleLog(battle,`${displayName(source)}：${picked.enemy.name}の${picked.effect.name??picked.effect.kind}を${kind}へ反転`);return inverted;
}
function removeRandomEnemyMagicCircle(source){
 const candidates=aliveEnemies(battle).filter(enemy=>enemy.enemyMagicCircle);if(!candidates.length)return false;
 const enemy=candidates[Math.floor(Math.random()*candidates.length)],before=enemy._preMagicCircleStats,applied=enemy._enemyMagicCircleApplied,ratio=enemy.hp/Math.max(1,enemy.maxHp);
 if(applied?.rates){for(const key of["maxHp","atk","matk","def","mdef","spd"]){const rate=Math.max(.000001,Number(applied.rates[key])||1);enemy[key]=Math.max(key==="maxHp"||key==="atk"||key==="matk"||key==="spd"?1:0,Math.round((Number(enemy[key])||0)/rate))}enemy.crit=Math.max(0,(Number(enemy.crit)||0)-(Number(applied.critDelta)||0));enemy.hp=Math.max(1,Math.min(enemy.maxHp,Math.round(enemy.maxHp*ratio)))}
 else if(before){for(const key of["maxHp","atk","matk","def","mdef","spd","crit"])if(before[key]!=null)enemy[key]=before[key];enemy.hp=Math.max(1,Math.min(enemy.maxHp,Math.round(enemy.maxHp*ratio)))}
 const name=enemy.enemyMagicCircle.name??"魔法陣";enemy.enemyMagicCircle=null;enemy.magicCircleName=null;enemy.magicCircleLevel=0;enemy._circleActivationShown=true;if(battle.enemyMagicCircleArt)battle.enemyMagicCircleArt[enemy.id]="";addBattleLog(battle,`${displayName(source)}：${enemy.name}の${name}を破壊`);return true;
}
function dispelRandomAllyBuff(enemy){
 const candidates=[];for(const monster of battle.party.filter(member=>member.currentHp>0))for(const[index,effect]of(battle.allyEffects?.[monster.id]??[]).entries())if(POSITIVE_ENEMY_EFFECTS.has(effect.kind))candidates.push({monster,index,effect});
 if(!candidates.length)return null;const picked=candidates[Math.floor(Math.random()*candidates.length)];battle.allyEffects[picked.monster.id].splice(picked.index,1);addBattleLog(battle,`${enemy.name}：${displayName(picked.monster)}の${picked.effect.name??picked.effect.kind}を封印`);return{...picked.effect};
}
function invertRandomAllyBuff(enemy,rate=1){
 const candidates=[];for(const monster of battle.party.filter(member=>member.currentHp>0))for(const[index,effect]of(battle.allyEffects?.[monster.id]??[]).entries())if(POSITIVE_ENEMY_EFFECTS.has(effect.kind))candidates.push({monster,index,effect});if(!candidates.length)return null;
 const picked=candidates[Math.floor(Math.random()*candidates.length)],kind=INVERTED_BATTLE_EFFECTS[picked.effect.kind]??"vulnerable";battle.allyEffects[picked.monster.id].splice(picked.index,1);const value=Math.max(.01,Number(picked.effect.value)||.10)*Math.max(0,Math.min(1,Number(rate)||1)),inverted={kind,value,turns:Math.max(1,Math.min(3,Number(picked.effect.turns)||2)),chance:1,sourceKey:`${enemy.id}:buff-inversion`,sourceSkillName:enemy.floorBossPassive?.name};applyBattleEffect(battle,picked.monster.id,inverted,"ally");addBattleLog(battle,`${enemy.name}：${displayName(picked.monster)}の${picked.effect.name??picked.effect.kind}を${kind}へ反転`);return inverted;
}
function breakRandomAllyMagicCircle(enemy){
 const candidates=battle.party.filter(monster=>monster.currentHp>0&&battle.magicCircleProfiles?.[monster.id]?.id&&battle.magicCircleProfiles[monster.id].id!=="none");if(!candidates.length)return false;
 const target=candidates[Math.floor(Math.random()*candidates.length)],profile=battle.magicCircleProfiles[target.id],name=profile.name??"魔法陣";battle.magicCircleProfiles[target.id]={id:"none",name:"魔法陣なし",effect:"none",level:0};battle.magicCircleArt[target.id]="";delete battle.circleShields?.[target.id];delete battle.circleTurnMultipliers?.[target.id];battle.openingCircleBuff=battle.party.some(member=>battle.magicCircleProfiles?.[member.id]?.effect==="openingBuff");addBattleLog(battle,`${enemy.name}：${displayName(target)}の${name}を戦闘中封印`);return true;
}
function applySkillEffects(skill,a,e){
 const sourced=effect=>({...effect,sourceKey:`${a.id}:${skill.id}`,sourceMonsterId:a.id,sourceName:displayName(a),sourceSkillId:skill.id,sourceSkillName:skill.name});
 for(const effect of skill.effects??[]){
  if(effect.enemy){const targets=skill.allEnemies?aliveEnemies(battle):[e].filter(Boolean),adjusted=sourced(effect.chance==null?effect:{...effect,chance:Math.min(1,effect.chance*(1+affixValue(a,"statusChance",100)/100))});targets.forEach(target=>applyBattleEffect(battle,target.id,adjusted,"enemy"))}
  else if(effect.allies)battle.party.filter(m=>m.currentHp>0).forEach(m=>applyBattleEffect(battle,m.id,sourced(effect),"ally"));
  else applyBattleEffect(battle,a.id,sourced(effect),"ally");
 }
 if(Number(skill.partyShieldRate)>0){
  battle.circleShields??={};
  let total=0;
  for(const ally of battle.party.filter(monster=>monster.currentHp>0)){
   const amount=Math.max(1,Math.floor(calculatedStats(ally).hp*Math.min(.8,Number(skill.partyShieldRate))));
   battle.circleShields[ally.id]=Math.max(Math.max(0,Number(battle.circleShields[ally.id])||0),amount);total+=amount;
  }
  addBattleLog(battle,`${displayName(a)}：味方全体へ障壁 ${total.toLocaleString()}`);
 }
 if(Number(skill.selfShieldRate)>0){battle.circleShields??={};const amount=Math.max(1,Math.floor(calculatedStats(a).hp*Math.min(.8,Number(skill.selfShieldRate))));battle.circleShields[a.id]=Math.max(Math.max(0,Number(battle.circleShields[a.id])||0),amount);addBattleLog(battle,`${displayName(a)}：自分へ障壁 ${amount.toLocaleString()}`)}
 if(Number(skill.invertEnemyBuffRate)>0)invertRandomEnemyBuff(a,skill.invertEnemyBuffRate);
 if(Number(skill.stealEnemyBuffRate)>0){const stolen=dispelRandomEnemyBuff(a),rate=Math.max(0,Math.min(1,Number(skill.stealEnemyBuffRate)));if(stolen&&POSITIVE_ENEMY_EFFECTS.has(stolen.kind)){applyBattleEffect(battle,a.id,sourced({...stolen,value:Number(stolen.value||0)*rate,turns:Math.max(1,Math.min(3,Number(stolen.turns)||1))}),"ally");addBattleLog(battle,`${displayName(a)}：解除した強化を${Math.round(rate*100)}%で複写`)}}
 else if(skill.dispelEnemyBuff)dispelRandomEnemyBuff(a);
	 if(Number(skill.increaseEnemyCooldowns)>0){const amount=Math.max(1,Math.floor(skill.increaseEnemyCooldowns));for(const enemy of aliveEnemies(battle))enemy.specialCooldown=Math.max(0,Number(enemy.specialCooldown)||0)+amount;addBattleLog(battle,`${displayName(a)}：敵の固有技再使用を${amount}ターン延長`)}
	 if(Number(skill.reducePartyCooldowns)>0){const amount=Math.max(1,Math.floor(skill.reducePartyCooldowns));let reduced=0;for(const ally of battle.party){const cooldowns=battle.cooldowns?.[ally.id]??{};for(const skillId of Object.keys(cooldowns)){const before=Math.max(0,Number(cooldowns[skillId])||0);cooldowns[skillId]=Math.max(0,before-amount);if(cooldowns[skillId]<before)reduced++;if(cooldowns[skillId]===0)delete cooldowns[skillId]}}if(reduced)addBattleLog(battle,`${displayName(a)}：味方スキル${reduced}件の再使用を${amount}ターン短縮`)}
 if(skill.removeEnemyMagicCircle)removeRandomEnemyMagicCircle(a);
}
function applyRevivedSkillEffects(skill,target,source){
 if(!target)return;for(const effect of skill?.revivedEffects??[])applyBattleEffect(battle,target.id,{...effect,sourceKey:`${source.id}:${skill.id}:revive`,sourceMonsterId:source.id,sourceName:displayName(source),sourceSkillId:skill.id,sourceSkillName:skill.name},"ally");
}
const INVINCIBLE_ALLIANCE_IDS=Object.freeze(["myth_enami","myth_rion","myth_yori","myth_hide"]);
const RANDOM_SKILL_ELEMENTS=Object.freeze(Object.keys(ATTRIBUTES).filter(id=>id!=="neutral"&&id!=="thunder"));
function resolveRandomSkillElement(skill){return skill?.randomElement?{...skill,element:RANDOM_SKILL_ELEMENTS[Math.floor(Math.random()*RANDOM_SKILL_ELEMENTS.length)]??"neutral"}:skill}
function turnPowerMultiplier(skill){const step=Math.max(0,Number(skill?.turnPowerStep)||0),cap=Math.max(0,Number(skill?.turnPowerCap)||0),elapsed=Math.max(0,(Number(battle?.turn)||1)-1);return 1+Math.min(cap,elapsed*step)}
function invincibleAllianceReady(){const ids=new Set((battle?.party??[]).filter(monster=>monster.currentHp>0).map(monster=>monster.speciesId));return INVINCIBLE_ALLIANCE_IDS.every(id=>ids.has(id))}
function initializeFloorBossDeathTracking(){
 if(!battle)return;battle.floorBossAliveState={};for(const monster of battle.party??[])battle.floorBossAliveState[`ally:${monster.id}`]=monster.currentHp>0;for(const enemy of battle.enemies??[])battle.floorBossAliveState[`enemy:${enemy.id}`]=enemy.hp>0;
}
function syncFloorBossDeathEvents(){
 if(!battle)return 0;if(!battle.floorBossAliveState){initializeFloorBossDeathTracking();return 0}let deaths=0;
 const units=[...(battle.party??[]).map(unit=>({key:`ally:${unit.id}`,alive:unit.currentHp>0})),...(battle.enemies??[]).map(unit=>({key:`enemy:${unit.id}`,alive:unit.hp>0}))];
 for(const unit of units){const previous=battle.floorBossAliveState[unit.key];if(previous===true&&!unit.alive)deaths++;battle.floorBossAliveState[unit.key]=unit.alive}
 if(!deaths)return 0;
 for(const enemy of(battle.enemies??[]).filter(unit=>unit.hp>0&&unit.floorBossDomain?.effect==="deathCompost")){const domain=enemy.floorBossDomain,healed=recoverFloorBossHp(enemy,Math.max(1,Math.floor(enemy.maxHp*Math.max(0,Number(domain.healRate)||0)*deaths))),before=enemy.currentMp??0,gain=Math.max(1,Math.floor((enemy.maxMp??1)*Math.max(0,Number(domain.mpRate)||0)*deaths));enemy.currentMp=Math.min(enemy.maxMp??0,before+gain);queueBattleRecovery(enemy,"mp",before,enemy.currentMp);addBattleLog(battle,`${domain.name}：死${deaths}体を菌糧化 HP+${healed.toLocaleString()}・MP+${enemy.currentMp-before}`)}
 for(const enemy of(battle.enemies??[]).filter(unit=>unit.hp>0&&unit.floorBossDomain?.effect==="deathStack"))for(let count=0;count<deaths;count++){
  const domain=enemy.floorBossDomain,stacks=Math.max(0,Number(enemy._floorBossDeathStacks)||0),step=Number(domain.steps?.[stacks])||0,oldBonus=Math.min(Number(domain.cap)||1,Number(enemy._floorBossDeathBonus)||0),newBonus=Math.min(Number(domain.cap)||1,oldBonus+step);if(newBonus<=oldBonus)continue;
  const ratio=(1+newBonus)/(1+oldBonus);enemy.atk=Math.max(1,Math.floor(enemy.atk*ratio));enemy.matk=Math.max(1,Math.floor((enemy.matk??enemy.atk)*ratio));enemy.def=Math.max(0,Math.floor(enemy.def*ratio));enemy.mdef=Math.max(0,Math.floor((enemy.mdef??enemy.def)*ratio));enemy._floorBossDeathStacks=stacks+1;enemy._floorBossDeathBonus=newBonus;addBattleLog(battle,`${domain.name}：死を刻み攻防+${Math.round(newBonus*100)}%`)
 }
	 for(const enemy of(battle.enemies??[]).filter(unit=>unit.hp>0&&unit.floorBossDomain?.effect==="deathVoltage"))for(let count=0;count<deaths;count++){
	  const domain=enemy.floorBossDomain,cap=Math.max(1,Math.floor(Number(domain.cap)||7)),stacks=Math.max(0,Math.floor(Number(enemy._floorBossDeathVoltage)||0));if(stacks>=cap)continue;const next=stacks+1,step=Math.max(0,Number(domain.step)||.05),oldBonus=stacks*step,newBonus=next*step,ratio=(1+newBonus)/(1+oldBonus);enemy.atk=Math.max(1,Math.floor(enemy.atk*ratio));enemy.matk=Math.max(1,Math.floor((enemy.matk??enemy.atk)*ratio));enemy.def=Math.max(0,Math.floor(enemy.def*ratio));enemy.mdef=Math.max(0,Math.floor((enemy.mdef??enemy.def)*ratio));enemy._floorBossDeathVoltage=next;if(next===cap&&Number(domain.barrierOnFull)>0)enemy.divineBarrier=Math.max(Number(enemy.divineBarrier)||0,Math.max(1,Math.floor(Number(domain.barrierOnFull))));addBattleLog(battle,`${domain.name}：死電圧${next}/${cap}・攻防+${Math.round(newBonus*100)}%`)
	 }
 return deaths;
}
function syncInvincibleAllianceState({announce=true}={}){
 if(!battle)return false;syncFloorBossDeathEvents();const previous=Boolean(battle.invincibleAlliance),next=invincibleAllianceReady();battle.invincibleAlliance=next;
 if(announce&&previous!==next){const label=next?"無敵・四LR連携が再発動！":"四LRの一角が倒れ、無敵が解除された";addBattleLog(battle,label);setTimeout(()=>{if(battle)battleBanner(next?"無敵・再発動":"無敵・解除",next?"四LR全員が戦線へ復帰":"四LR全員の生存が発動条件","synergy invincible",620,battle.party.find(monster=>monster.currentHp>0))},0)}
 return next;
}
function shuffledBattleEntries(entries){const next=[...entries];for(let index=next.length-1;index>0;index--){const swap=Math.floor(Math.random()*(index+1));[next[index],next[swap]]=[next[swap],next[index]]}return next}
async function performInvincibleAllianceSkill(member,skill){
 if(!member||member.currentHp<=0||!skill||!aliveEnemies(battle).length)return;
 skill=applySkillMastery(member,resolveRandomSkillElement(skill));
 const target=aliveEnemies(battle)[Math.floor(Math.random()*aliveEnemies(battle).length)],stats=convertedAttackStats(calculatedStats(member),member.id);
 addBattleLog(battle,`無敵連携：${displayName(member)}が${skill.name}を追加発動`);
 await battleBanner(skill.name,"連携追加発動・MP消費なし","synergy",460,member);
 if(skill.type==="selfHeal"||skill.type==="stance"&&skill.heal){const amount=Math.max(1,Math.floor(stats.hp*(skill.heal??.2)*healMultiplier(member))),gained=recoverBattleHp(member,amount,stats.hp);recordBattleHealing(member,gained);if(skill.cleanse){clearNegativeAllyEffects(battle,member.id);clearAilments(member)}applySkillEffects(skill,member,target);await flushBattleRecoveries();await floatText(`+${gained}`,member.id,"heal");return}
 if(skill.type==="allHeal"){let maximum=0;for(const ally of battle.party.filter(entry=>entry.currentHp>0)){const max=calculatedStats(ally).hp,amount=Math.max(1,Math.floor(max*(skill.heal??.25)*healMultiplier(member))),gained=recoverBattleHp(ally,amount,max);maximum=Math.max(maximum,gained);recordBattleHealing(member,gained)}if(skill.cleanse)battle.party.forEach(ally=>{clearNegativeAllyEffects(battle,ally.id);clearAilments(ally)});applySkillEffects(skill,member,target);await flushBattleRecoveries();await floatText(`全体 +${maximum}`,"party","heal");return}
 if(skill.type==="buff"||skill.type==="stance"){applySkillEffects(skill,member,target);await floatText("連携強化","party","guard");return}
 if(skill.type==="cleanse"){battle.party.forEach(ally=>{clearNegativeAllyEffects(battle,ally.id);clearAilments(ally)});await floatText("状態回復","party","heal");return}
 if(skill.type==="mpHeal"){battle.party.filter(ally=>ally.currentHp>0).forEach(ally=>recoverBattleMp(ally,Math.floor(maxMp(ally)*(skill.mpHeal??.2)),member));await flushBattleRecoveries();await floatText("MP回復","party","heal");return}
 if(skill.type==="revive"){const ally=battle.party.filter(entry=>entry.currentHp<=0).sort((left,right)=>calculatedStats(right).hp-calculatedStats(left).hp)[0];if(ally&&reviveBattleMonster(ally,skill.revive??.35,skill.reviveMp??.25,member,{transferRate:skill.reviveTransferRate})){applyRevivedSkillEffects(skill,ally,member);await flushBattleRecoveries()}return}
 await animateAttack(member.id,true);
 const targets=skill.allEnemies?aliveEnemies(battle):[target],hits=Math.max(1,Number(skill.hits)||1);
  for(const enemy of targets){let dealt=0;for(let hit=0;hit<hits&&enemy.hp>0;hit++){const critical=Boolean(skill.guaranteedCritical)||Math.random()<Math.min(.82,.12+(skill.critBonus??0)+(stats.spd??0)*.003),ignore=Math.max(0,Math.min(.9,Number(skill.defenseIgnore)||0)),statusBonus=skill.bonusVsStatus?.id&&(battle.enemyStatuses?.[enemy.id]??[]).some(status=>status.id===skill.bonusVsStatus.id)?Math.max(1,Number(skill.bonusVsStatus.multiplier)||1):1,effectBonus=skill.bonusVsEffect?.kind&&hasEffect(battle,enemy.id,skill.bonusVsEffect.kind,"enemy")?Math.max(1,Number(skill.bonusVsEffect.multiplier)||1):1,raw=skillDamage({...stats,_currentHpRatio:member.currentHp/Math.max(1,stats.hp)},{...enemy,def:enemy.def*(1-ignore),mdef:(enemy.mdef??enemy.def)*(1-ignore)},skill,critical)*statusBonus*effectBonus*turnPowerMultiplier(skill),damage=Math.max(1,Math.floor(raw*.72*attributeDamageMultiplier(skill.element??SPECIES[member.speciesId]?.element??"neutral",SPECIES[enemy.speciesId]?.element??"neutral")*enemyDamageMultiplier(enemy)*(enemy.hiddenDamageTaken??1)*magicCircleDamageMultiplier(member))),applied=applyEnemyDamage(battle,enemy,damage,{sourceId:member.id,element:skill.element??SPECIES[member.speciesId]?.element??"neutral",damageClass:skill.damageClass??"physical"});dealt+=applied.damage;recordBattleDamage(member,applied.damage);registerWeaponFinisher(member,enemy,applied.beforeHp);await animateHit(enemy.id,critical);await floatText(applied.damage?`${critical?"会心 ":""}-${applied.damage}`:"完全ガード",enemy.id,applied.damage?(critical?"critical":"skill"):"guard")}if(dealt&&skill.status&&enemy.hp>0&&Math.random()<(skill.status.chance??0))applyEnemyStatus(battle,{...skill.status,sourceMonsterId:member.id},enemy.id)}
 applySkillEffects(skill,member,target);
}
async function triggerInvincibleAlliance(source){
 if(!battle||battle._invincibleAllianceRunning||!invincibleAllianceReady())return;
 const partners=shuffledBattleEntries(battle.party.filter(member=>member.id!==source.id&&member.currentHp>0&&INVINCIBLE_ALLIANCE_IDS.includes(member.speciesId)));if(!partners.length)return;
 battle._invincibleAllianceRunning=true;
 try{battleFlash("critical");await battleBanner("無敵",`${displayName(source)}に続き、三神話が連続発動`,`synergy invincible`,720,source);for(const member of partners){if(!aliveEnemies(battle).length)break;const skills=allLearnedSkills(member).filter(Boolean),skill=skills[Math.floor(Math.random()*skills.length)];await performInvincibleAllianceSkill(member,skill)}}finally{battle._invincibleAllianceRunning=false}
}
async function command(type,skillId=null,{skipRandomCircle=false}={}){
 if(!battle)return;
 sanitizeBattleParty();
 if(battle.busy||battle.guideReady===false)return;
 const entry=currentTurnEntry(battle),a=actor();
 if(entry?.type!=="ally"||!a)return;
 battle.busy=true;
 const s=calculatedStats(a),e=selectedEnemy(battle);if(!e){battle.busy=false;return win(false,null)};battle.enemy=e;let triggerAlliance=false,signatureExtraAction=false;

 if(!skipRandomCircle&&hasCircleEffect(a,"randomSkill")&&(type==="attack"||type==="skill"&&!skillId)){
  const unique=new Map();for(const member of save.state.monsters??[])for(const skill of allLearnedSkills(member))unique.set(skill.id,skill);const pool=[...unique.values()].filter(skill=>canUseSkill(a,skill,cooldownRemaining(battle,a.id,skill.id)));
  if(pool.length){const randomSkill=pool[Math.floor(Math.random()*pool.length)];type="skill";skillId=randomSkill.id;a._randomCircleSkill=true;await magicCircleActivationFx(a,circleInfo(a),`抽選結果：${randomSkill.name}`,"全習得スキル候補から1つを発動",{duration:620});addBattleLog(battle,`${displayName(a)}：万象抽選陣 → ${randomSkill.name}`)}
 }

 if(type==="attack"){
  addBattleLog(battle,`${displayName(a)}：たたかう`);await animateAttack(a.id);
  battle.actionCommitted=true;triggerAlliance=true;
  const signatureBonus=signatureOffenseBonus(a,e);if(signatureBonus.stacks)addBattleLog(battle,`${displayName(a)}：照準連鎖 ×${signatureBonus.stacks}`);
  if(!attackHits({accuracy:s.accuracy??100,accuracyUp:effectValue(battle,a.id,"accuracyUp"),accuracyDown:effectValue(battle,a.id,"accuracyDown"),evasion:e.evasion??0,evasionUp:effectValue(battle,e.id,"evasionUp","enemy"),evasionDown:effectValue(battle,e.id,"evasionDown","enemy"),guaranteedHit:hasEffect(battle,a.id,"guaranteedHit")})){registerFloorBossDodge(e);addBattleLog(battle,`${e.name}が攻撃を回避した`);await floatText("MISS / 回避",e.id,"miss");}
  else{
   const combatStats=convertedAttackStats(s,a.id),conversionActive=effectValue(battle,a.id,"magicToPhysical")>0,critical=hasEffect(battle,a.id,"guaranteedCritical")||Math.random()<Math.min(.95,affixCriticalChance(combatStats,Math.min(.65,.08+(combatStats.spd??0)*.005+effectValue(battle,a.id,"critUp")))+magicCircleCriticalBonus(a,1)+signatureBonus.critBonus),weapons=[a.equipment?.weaponRight,a.equipment?.weaponLeft].map(id=>save.state.equipment.find(item=>item.id===id)).filter(Boolean),magicWeapon=!conversionActive&&(weapons.some(weapon=>["staff","book"].includes(weapon.weaponType)||(weapon.stats?.matk??0)>(weapon.stats?.atk??0))||(combatStats.matk??0)>combatStats.atk),formationMultiplier=1,attackStat=(magicWeapon?(combatStats.matk??combatStats.atk):combatStats.atk)*allyAttackFactor(a.id),defenseStat=magicWeapon?(e.mdef??e.def):e.def;
   showEquipmentAuthorityActivation(a,{element:a.attribute??SPECIES[a.speciesId]?.element??"neutral",target:e,isSkill:false});
   const base=Math.max(1,Math.floor(attackStat*(.9+Math.random()*.2)-defenseStat*.4));
   const attackElement=a.attribute??SPECIES[a.speciesId]?.element??"neutral",targetElement=SPECIES[e.speciesId]?.element??"neutral",critMult=1.7+affixValue(a,"critDamage",150)/100,damageStats={...combatStats,_currentHpRatio:a.currentHp/Math.max(1,combatStats.hp)},raw=(critical?Math.floor(base*critMult):base)*formationMultiplier*affixOutgoingDamageMultiplier(damageStats,e,attackElement)*affixExecutionMultiplier(a,e)*signatureBonus.damageMultiplier,d=Math.max(1,Math.floor(raw*attributeDamageMultiplier(attackElement,targetElement)*abyssBattleMultiplier(a,"partyDamageRate")*enemyDamageMultiplier(e)*(e.hiddenDamageTaken??1)*endgameIncomingDamageMultiplier(e,attackElement)*weaponMasteryDamageMultiplier(save.state,a,e)*magicCircleDamageMultiplier(a))),applied=applyEnemyDamage(battle,e,d,{sourceId:a.id,element:attackElement,damageClass:magicWeapon?"magic":"physical"});recordBattleDamage(a,applied.damage);registerWeaponFinisher(a,e,applied.beforeHp);consumeMagicCircleActionCost(a);const steal=outgoingLifeSteal(a);if(steal&&applied.damage){const h=Math.max(1,Math.floor(applied.damage*steal)),gained=recoverBattleHp(a,h,s.hp);recordBattleHealing(a,gained)}
   await animateHit(e.id,critical);if(critical&&applied.damage)burstParticles(e.id,"critical",16);await floatText(applied.damage?`${critical?"会心 ":""}-${applied.damage}`:"完全ガード",e.id,applied.damage?(critical?"critical":"damage"):"guard");await trySeriesChainAttack(a,e,applied.damage);
   const rageHits=hasCircleEffect(a,"rage")?(a._circleRage>=9?2:a._circleRage>=4?1:0):0;
   for(let hit=0;hit<rageHits&&e.hp>0;hit++){const follow=Math.max(1,Math.floor(applied.damage*(hit?0.45:0.65))),extra=applyEnemyDamage(battle,e,follow,{sourceId:a.id,element:attackElement,damageClass:magicWeapon?"magic":"physical"});recordBattleDamage(a,extra.damage);registerWeaponFinisher(a,e,extra.beforeHp);await animateHit(e.id,false);await floatText(extra.damage?`連撃 -${extra.damage}`:"完全ガード",e.id,extra.damage?"skill":"guard")}
  }
  completeContextGuide("battle_attack",{quiet:true});
 }

 if(type==="skill"&&!skillId){completeContextGuide("battle_skill_open",{quiet:true});battle.busy=false;battle.skillMenu=true;renderBattle();return}

 if(type==="skill"&&skillId){
  const equippedSkill=learnedSkills(a).find(candidate=>candidate.id===skillId);let skill=equippedSkill??skillById(skillId);skill=resolveRandomSkillElement(skill);const cd=cooldownRemaining(battle,a.id,skillId),randomCircleSkill=Boolean(a._randomCircleSkill),knownSkill=randomCircleSkill||Boolean(equippedSkill);
  if(!knownSkill||!canUseSkill(a,skill,cd)){a._randomCircleSkill=false;battle.busy=false;if(battle.auto){addBattleLog(battle,`${displayName(a)}：使用できないスキルを通常攻撃へ切替`);return command("attack",null,{skipRandomCircle:true})}return alert(cd>0?`あと${cd}ラウンド使用できない`:skill?"MPが足りない":"スキルを使用できない")}
  const mpBreakdown=skillMpCostBreakdown(a,skill),listedMpCost=mpBreakdown.final,freeSkill=listedMpCost>0&&Math.random()<affixValue(a,"freeSkillChance",60)/100,mpCost=freeSkill?0:listedMpCost;skill=applySkillMastery(a,skill);battle.skillMenu=false;let skillCompleted=true;addBattleLog(battle,`${displayName(a)}：${skill.name}（${freeSkill?"MP消費なし":`MP-${mpCost}`}）`);if(!freeSkill&&mpBreakdown.equipmentReduction>0&&mpBreakdown.beforeEquipment>mpBreakdown.final){const mpAuthorities=(a._equipmentAuthorities??[]).filter(authority=>Number(authority.fixedEffects?.mpCostReduction)>0),authorityRate=Math.min(50,mpAuthorities.reduce((sum,authority)=>sum+Number(authority.fixedEffects.mpCostReduction||0),0)),rateLabel=authorityRate===mpBreakdown.equipmentReduction?`-${authorityRate}%`:`固有-${authorityRate}%・装備合計-${mpBreakdown.equipmentReduction}%`;if(mpAuthorities.length)addBattleLog(battle,`装備固有能力｜${mpAuthorities.map(authority=>authority.name).join("・")}：MP ${mpBreakdown.beforeEquipment}→${mpBreakdown.final}（${rateLabel}）`)}showEquipmentAuthorityActivation(a,{element:skill.element??a.attribute??SPECIES[a.speciesId]?.element??"neutral",target:e,isSkill:true});await battleBanner(skill.name,battleSkillMechanics(skill),"skill",430,a);battle.actionCommitted=true;a.currentMp=Math.max(0,a.currentMp-mpCost);setSkillCooldown(battle,a.id,skill);
  if(Number(skill.selfHpCostRate)>0&&a.currentHp>1){const cost=Math.min(a.currentHp-1,Math.max(1,Math.floor(a.currentHp*Math.min(.8,Number(skill.selfHpCostRate)))));a.currentHp=Math.max(1,a.currentHp-cost);addBattleLog(battle,`${displayName(a)}：${skill.name}の代価 HP-${cost.toLocaleString()}`);await floatText(`代価 -${cost}`,a.id,"enemy")}
  if(skill.type==="selfHeal"||skill.type==="stance"&&skill.heal){
   const h=Math.max(1,Math.floor(s.hp*(skill.heal??0)*healMultiplier(a))),gained=recoverBattleHp(a,h,s.hp);recordBattleHealing(a,gained);if(skill.cleanse){clearNegativeAllyEffects(battle,a.id);clearAilments(a)}await flushBattleRecoveries();if(gained>0)await floatText(`+${gained}`,a.id,"heal");applySkillEffects(skill,a,e);
  }else if(skill.type==="allHeal"){
   const healed=[];battle.party.filter(m=>m.currentHp>0).forEach(m=>{const max=calculatedStats(m).hp,h=Math.max(1,Math.floor(max*skill.heal*healMultiplier(a))),gained=recoverBattleHp(m,h,max);healed.push(gained);recordBattleHealing(a,gained)});
   if(skill.revive||skill.reviveTransferRate){const target=battle.party.filter(m=>m.currentHp<=0).sort((x,y)=>calculatedStats(y).hp-calculatedStats(x).hp)[0];if(target&&reviveBattleMonster(target,skill.revive??.01,skill.reviveMp??.25,a,{transferRate:skill.reviveTransferRate})){applyRevivedSkillEffects(skill,target,a);healed.push(target.currentHp)}}
   await flushBattleRecoveries();await floatText(`全体 +${Math.max(0,...healed)}`,"party","heal");if(skill.cleanse)battle.party.forEach(m=>{clearNegativeAllyEffects(battle,m.id);clearAilments(m)});applySkillEffects(skill,a,e);
  }else if(skill.type==="buff"||skill.type==="stance"){applySkillEffects(skill,a,e);if(skill.heal){const targets=skill.target==="味方全体"?battle.party.filter(m=>m.currentHp>0):[a];targets.forEach(m=>{const mx=calculatedStats(m).hp;recoverBattleHp(m,Math.floor(mx*skill.heal*healMultiplier(a)),mx)})}await flushBattleRecoveries();await floatText("強化発動","party","guard");
  }else if(skill.type==="cleanse"){battle.party.forEach(m=>{clearNegativeAllyEffects(battle,m.id);clearAilments(m)});await floatText("状態回復","party","heal");
  }else if(skill.type==="mpHeal"){battle.party.filter(m=>m.currentHp>0).forEach(m=>recoverBattleMp(m,Math.floor(maxMp(m)*(skill.mpHeal??.2)),a));await flushBattleRecoveries();await floatText("MP回復","party","heal");
  }else if(skill.type==="revive"){const target=battle.party.filter(m=>m.currentHp<=0).sort((x,y)=>calculatedStats(y).hp-calculatedStats(x).hp)[0];if(target&&reviveBattleMonster(target,skill.revive??.35,skill.reviveMp??.25,a,{transferRate:skill.reviveTransferRate})){applyRevivedSkillEffects(skill,target,a);await flushBattleRecoveries()}else{skillCompleted=false;const beforeRefund=a.currentMp;a.currentMp=Math.min(maxMp(a),a.currentMp+mpCost);queueBattleRecovery(a,"mp",beforeRefund,a.currentMp);if(battle.cooldowns?.[a.id])delete battle.cooldowns[a.id][skill.id]}
  }else if(skill.fillHpDrain){
   await animateAttack(a.id,true);const maximum=calculatedStats(a).hp,missing=Math.max(0,maximum-a.currentHp),amount=Math.min(missing,Math.max(0,e.hp));if(amount>0){const applied=applyEnemyDamage(battle,e,amount,{sourceId:a.id,bypassMimicArmor:true,element:skill.element??a.attribute??SPECIES[a.speciesId]?.element??"neutral",damageClass:skill.damageClass??"physical"}),gained=recoverBattleHp(a,applied.damage,maximum);recordBattleDamage(a,applied.damage);recordBattleHealing(a,gained);registerWeaponFinisher(a,e,applied.beforeHp);addBattleLog(battle,`${displayName(a)}：防御無視でHP${applied.damage.toLocaleString()}を満命吸収`);await animateHit(e.id,true);await flushBattleRecoveries();await floatText(`吸葬 -${applied.damage}`,e.id,"critical");await floatText(`+${gained}`,a.id,"heal")}else{addBattleLog(battle,`${displayName(a)}は既に満命のため吸収できなかった`);await floatText("満命",a.id,"guard")}applySkillEffects(skill,a,e);
  }else if(Number(skill.selfSacrificeHpDamage)>0){
   await animateAttack(a.id,true);const amount=Math.max(1,Math.floor(a.currentHp*Math.min(2,Number(skill.selfSacrificeHpDamage)))),applied=applyEnemyDamage(battle,e,amount,{sourceId:a.id,bypassMimicArmor:true,element:skill.element??a.attribute??SPECIES[a.speciesId]?.element??"neutral",damageClass:skill.damageClass??"physical"});recordBattleDamage(a,applied.damage);registerWeaponFinisher(a,e,applied.beforeHp);a.currentHp=0;handleMagicCircleDeath(a);syncInvincibleAllianceState();addBattleLog(battle,`${displayName(a)}は命を代価に${applied.damage.toLocaleString()}ダメージ`);await animateHit(e.id,true);await floatText(`生命 -${applied.damage}`,e.id,"critical");applySkillEffects(skill,a,e);
  }else{
   await animateAttack(a.id,true);const hits=skill.hits??1;let total=0,signatureBonus=signatureOffenseBonus(a,e);const skillTargets=skill.allEnemies?aliveEnemies(battle):[e];if(signatureBonus.stacks)addBattleLog(battle,`${displayName(a)}：照準連鎖 ×${signatureBonus.stacks}`);
   for(const targetEnemy of skillTargets){const e=targetEnemy;let targetTotal=0;for(let i=0;i<hits&&e.hp>0;i++){
    if(!attackHits({accuracy:s.accuracy??100,accuracyUp:effectValue(battle,a.id,"accuracyUp"),accuracyDown:effectValue(battle,a.id,"accuracyDown"),evasion:e.evasion??0,evasionUp:effectValue(battle,e.id,"evasionUp","enemy"),evasionDown:effectValue(battle,e.id,"evasionDown","enemy"),guaranteedHit:Boolean(skill.guaranteedHit)||hasEffect(battle,a.id,"guaranteedHit")})){registerFloorBossDodge(e);addBattleLog(battle,`${e.name}が${skill.name}を回避した`);await floatText("MISS / 回避",e.id,"miss");continue}
    const converted=convertedAttackStats(s,a.id),critical=Boolean(skill.guaranteedCritical)||hasEffect(battle,a.id,"guaranteedCritical")||Math.random()<Math.min(.95,affixCriticalChance(converted,Math.min(.9,.1+(skill.critBonus??0)+(converted.spd??0)*.004+effectValue(battle,a.id,"critUp")))+magicCircleCriticalBonus(a,skill.power??1)+signatureBonus.critBonus),ignore=Math.max(0,Math.min(.9,Number(skill.defenseIgnore)||0)),boosted={...converted,atk:converted.atk*allyAttackFactor(a.id),matk:(converted.matk??converted.atk)*allyAttackFactor(a.id),_currentHpRatio:a.currentHp/Math.max(1,converted.hp)},execute=(skill.execute&&e.hp/e.maxHp<=skill.execute)?2:1,statusBonus=skill.bonusVsStatus?.id&&(battle.enemyStatuses?.[e.id]??[]).some(status=>status.id===skill.bonusVsStatus.id)?Math.max(1,Number(skill.bonusVsStatus.multiplier)||1):1,effectBonus=skill.bonusVsEffect?.kind&&hasEffect(battle,e.id,skill.bonusVsEffect.kind,"enemy")?Math.max(1,Number(skill.bonusVsEffect.multiplier)||1):1,enemyBuffBonus=skill.bonusVsEnemyBuff&&(battle.enemyEffects?.[e.id]??[]).some(effect=>POSITIVE_ENEMY_EFFECTS.has(effect.kind))?Math.max(1,Number(skill.bonusVsEnemyBuff.multiplier)||1):1,lowHpSkillBonus=Number(skill.lowHpBonus)>0&&a.currentHp/Math.max(1,converted.hp)<=Number(skill.lowHpThreshold??.5)?1+Number(skill.lowHpBonus):1,raw=skillDamage(boosted,{...e,def:e.def*enemyDefenseFactor(e.id)*(1-ignore),mdef:(e.mdef??e.def)*enemyDefenseFactor(e.id)*(1-ignore)},skill,critical)*execute*statusBonus*effectBonus*enemyBuffBonus*lowHpSkillBonus*turnPowerMultiplier(skill)*affixExecutionMultiplier(a,e)*(1+affixValue(a,"skillPower",200)/100)*signatureBonus.damageMultiplier,d=Math.max(1,Math.floor(raw*attributeDamageMultiplier(skill.element,SPECIES[e.speciesId]?.element??"neutral")*abyssBattleMultiplier(a,"partyDamageRate")*enemyDamageMultiplier(e)*(e.hiddenDamageTaken??1)*endgameIncomingDamageMultiplier(e,skill.element)*weaponMasteryDamageMultiplier(save.state,a,e)*magicCircleDamageMultiplier(a))),applied=applyEnemyDamage(battle,e,d,{sourceId:a.id,element:skill.element??a.attribute??SPECIES[a.speciesId]?.element??"neutral",damageClass:skill.damageClass??"physical"});
    recordBattleDamage(a,applied.damage);registerWeaponFinisher(a,e,applied.beforeHp);total+=applied.damage;targetTotal+=applied.damage;await animateHit(e.id,critical);if(critical&&applied.damage)burstParticles(e.id,"critical",14);await floatText(applied.damage?`${critical?"会心 ":""}-${applied.damage}`:"完全ガード",e.id,applied.damage?(critical?"critical":"skill"):"guard")
   }
    if(skill.currentHpDamage&&e.hp>0){const percentDamage=Math.max(1,Math.floor(e.hp*Math.min(.25,skill.currentHpDamage))),applied=applyEnemyDamage(battle,e,percentDamage,{sourceId:a.id,element:skill.element??a.attribute??SPECIES[a.speciesId]?.element??"neutral",damageClass:skill.damageClass??"physical"});registerWeaponFinisher(a,e,applied.beforeHp);recordBattleDamage(a,applied.damage);total+=applied.damage;targetTotal+=applied.damage;await floatText(applied.damage?`割合 -${applied.damage}`:"完全ガード",e.id,applied.damage?"skill":"guard")}
    if(skill.status&&e.hp>0&&Math.random()<Math.min(1,skill.status.chance*(1+affixValue(a,"statusChance",100)/100))){const applied=applyEnemyStatus(battle,{...skill.status,power:(skill.status.power??0)*(1+affixValue(a,"dotDamage",150)/100)*abyssBattleMultiplier(a,"partyDamageRate"),sourceMonsterId:a.id},e.id);if(applied){addBattleLog(battle,`${e.name}は${skill.status.name}状態になった`);await floatText(skill.status.name,e.id,skill.status.id)}}
    await trySeriesChainAttack(a,e,targetTotal);await trySeriesBurn(a,e,skill);
   }
   if(!skill.noLifeSteal&&(skill.type==="drain"||hasEffect(battle,a.id,"lifeSteal")||outgoingLifeSteal(a)>0)){const rate=(skill.drain??0)+effectValue(battle,a.id,"lifeSteal")+outgoingLifeSteal(a),h=Math.max(1,Math.floor(total*Math.min(1.25,rate))),gained=recoverBattleHp(a,h,s.hp);await flushBattleRecoveries();await floatText(`+${gained}`,a.id,"heal")}
   if(skill.selfHeal){const h=Math.max(1,Math.floor(s.hp*skill.selfHeal)),gained=recoverBattleHp(a,h,s.hp);await flushBattleRecoveries();await floatText(`+${gained}`,a.id,"heal")}if(skill.mpDrain){let drained=0;for(const targetEnemy of skillTargets.filter(enemy=>enemy.hp>0)){const amount=Math.min(Math.max(0,targetEnemy.currentMp??0),Math.max(1,Math.floor((targetEnemy.maxMp??1)*Math.min(.8,skill.mpDrain))));targetEnemy.currentMp=Math.max(0,(targetEnemy.currentMp??0)-amount);drained+=amount}const gain=Math.max(1,drained||Math.floor(maxMp(a)*Math.min(.25,skill.mpDrain))),beforeMp=a.currentMp;a.currentMp=Math.min(maxMp(a),a.currentMp+gain);queueBattleRecovery(a,"mp",beforeMp,a.currentMp);await flushBattleRecoveries();await floatText(`MP吸収 +${a.currentMp-beforeMp}`,a.id,"heal")}applySkillEffects(skill,a,e)
  }
  if(skillCompleted){
   storeFloorBossManaNocturne(a,mpCost);
   triggerAlliance=true;consumeMagicCircleActionCost(a);
   if(signatureHealingSkill(skill))await triggerRionSignature(a);
   const actionResonance=signatureResonance(a);if((actionResonance?.extraActionChance??0)>0&&battle.signatureExtraRounds?.[a.id]!==battle.turn&&Math.random()<actionResonance.extraActionChance){battle.signatureExtraRounds??={};battle.signatureExtraRounds[a.id]=battle.turn;signatureExtraAction=true;addBattleLog(battle,`${displayName(a)}：${actionResonance.awakened?"専用完全覚醒":"多動共鳴"}で追加行動`)}
   const echoChance=affixValue(a,"arcaneEcho",60)/100;if(mpCost>0&&echoChance&&Math.random()<echoChance){recoverBattleMp(a,mpCost,a);addBattleLog(battle,`${displayName(a)}：MP還元が発動`);await floatText(`MP +${mpCost}`,a.id,"heal")}
   const beforeMasteryLevel=skillProgressFor(a,skill.id).level,masteryBonus=Math.max(0,Number(a._equipmentAffixes?.skillMasteryGain??0)),mastery=recordSkillUse(a,skill.id,1+masteryBonus/100);if(mastery.level>beforeMasteryLevel){addBattleLog(battle,`${displayName(a)}：${skill.name} 熟練Lv.${mastery.level}へ上昇`);await floatText(`熟練 Lv.${mastery.level}`,a.id,"skill")}
   completeContextGuide("battle_skill_use",{quiet:true});if(battle.tutorialAttributeBattle)completeContextGuide("attribute_skill",{quiet:true});
  }
  a._randomCircleSkill=false;
 }

 if(type==="guard"){
  battle.actionCommitted=true;battle.guards[a.id]=true;addBattleLog(battle,`${displayName(a)}：ガード`);await floatText("防御",a.id,"guard")
 }

 if(type==="item"){completeContextGuide("battle_item_open",{quiet:true});battle.busy=false;battle.auto=false;save.state.settings.autoBattle=false;battle.itemMenu=true;save.save();renderBattle();return}

 if(type==="capture"){
  if((save.state.monsters?.length??0)>=MONSTER_STORAGE_CAP){battle.busy=false;return alert(`モンスター所持数が${MONSTER_STORAGE_CAP}体で満杯です。先に整理してください。`)}
  if(e.boss&&!battle.bossMemoryBattle){battle.busy=false;return alert("階層ボスの捕獲は、撃破後に「深淵の記憶」から再戦した時だけ挑戦できます。")}
  if(e.floorBossCatalogId||e.uncapturable||e.endgameBossId||["abyss","tenGod"].includes(e.faction)){battle.busy=false;return alert(e.floorBossCatalogId?"階層ボスは捕獲できません。挑戦門の欠片交換で本体と契約できます。":"深淵・十神は捕獲できません。討伐時に欠片を落とすことがあります。")}
  const cost=captureCrystalCost(e);if(save.state.inventory.captureCrystals<cost){battle.busy=false;return alert(`この敵の捕獲には捕獲結晶が${cost}個必要です（所持${save.state.inventory.captureCrystals}個）`)}
  battle.actionCommitted=true;addBattleLog(battle,`捕獲を試みた（成功時${cost}個）`);
  const equipmentCaptureBonus=Math.min(50,affixValue(a,"captureRate",50)+equipmentStatValue(a,"capture",50))/100,statusCaptureBonus=captureStatusBonus(battle.enemyStatuses?.[e.id]??[]),baseCapture=e.boss?(.01+(1-e.hp/e.maxHp)*.04)*currentDanger().bossCapture+equipmentCaptureBonus+statusCaptureBonus:.18+(1-e.hp/e.maxHp)*.48+(Math.max(...battle.party.map(m=>m.level+m.plus))-e.level)*.009+equipmentCaptureBonus+statusCaptureBonus,pressure=Math.max(1,e.hiddenCapturePressure??1),chance=battle.tutorialCaptureEligible?1:e.enemyOnlyMimicProfile?.01:e.boss?Math.max(.005,abyssExplorationChance(save.state,baseCapture/pressure,null,{max:.12})):Math.max(.01,abyssExplorationChance(save.state,baseCapture/pressure,null,{max:.65}));
  await floatText(`捕獲 ${Math.round(chance*100)}%`,e.id,"capture");await wait(500);
  if(Math.random()<chance){save.state.inventory.captureCrystals-=cost;const m=createMonster(e.speciesId,{level:e.level,isBoss:e.boss,floorBossCatalogId:e.floorBossCatalogId??null,sealedPower:e.boss?{state:"sealed",originalDanger:e.dangerLevel??1,awakening:0}:null,obtainedMethod:"capture",obtainedFloor:battle.memorySourceFloor??save.state.player.currentFloor,nickname:e.boss?`封印 ${SPECIES[e.speciesId].name}`:undefined});save.state.monsters.push(m);save.state.records.captures++;save.state.codex.captures[e.speciesId]=(save.state.codex.captures[e.speciesId]??0)+1;e.captured=true;e.hp=0;completeContextGuide("battle_capture",{quiet:true});markNewMonsterForGuide(m);save.save();battleFlash("capture");burstParticles(e.id,"capture",22);await battleBanner("捕獲成功！",`${e.name}が仲間になった・結晶${cost}個消費`,"capture",760,a);await animateDefeat(e.id,true);battle.targetEnemyId=aliveEnemies(battle)[0]?.id??null;if(!aliveEnemies(battle).length)return win(true,m);addBattleLog(battle,`${e.name}を捕獲した`)}else{save.state.inventory.captureCrystals--;addBattleLog(battle,"捕獲失敗・捕獲結晶1個を消費")}
 }

 protectTutorialCaptureTarget();
 await flushBattleRecoveries();if(triggerAlliance&&aliveEnemies(battle).length)await triggerInvincibleAlliance(a);await flushBattleRecoveries();
 saveBattleCheckpoint();renderBattle();await wait(260);
 if(e.hp<=0){await animateDefeat(e.id);battle.targetEnemyId=aliveEnemies(battle)[0]?.id??null;if(!aliveEnemies(battle).length)return win(false,null)}
 if(signatureExtraAction&&aliveEnemies(battle).length){battle.actionCommitted=false;battle.busy=false;renderBattle();await battleBanner("多動共鳴","追加行動を獲得","synergy",620,a);return continueBattleFlow()}
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
 return alive[Math.floor(Math.random()*alive.length)];
}
async function dealEnemyHit(e,target,multiplier=1,label="",criticalChance=.08,element=null,rules={}){
 const st=calculatedStats(target),guard=Boolean(battle.guards[target.id]),endgameNoCrit=hasCircleEffect(target,"endgameNoCrit")&&Boolean(e.endgameBossId||["abyss","tenGod"].includes(e.faction)),criticalStatus=e.floorBossPassive?.criticalAgainstStatus,criticalEffects=e.floorBossPassive?.criticalAgainstEffects,critical=!endgameNoCrit&&(Boolean(rules.guaranteedCritical)||hasEffect(battle,e.id,"guaranteedCritical","enemy")||Boolean(e._floorBossForceCritical)||Boolean(criticalStatus&&allyAilment(target,criticalStatus))||Boolean(Array.isArray(criticalEffects)&&criticalEffects.length&&criticalEffects.every(kind=>hasEffect(battle,target.id,kind)))||Math.random()<Math.min(.9,criticalChance+(e.crit??0)+effectValue(battle,e.id,"critUp","enemy")));
 syncInvincibleAllianceState();if(battle.invincibleAlliance){addBattleLog(battle,`${displayName(target)}：四LR連携・無敵`);await floatText("無敵",target.id,"guard");return 0}
 const guaranteedStatus=e.floorBossPassive?.guaranteedHitAgainstStatus,guaranteedBuff=e.floorBossPassive?.guaranteedHitAgainstBuff&&(battle.allyEffects?.[target.id]??[]).some(effect=>POSITIVE_ENEMY_EFFECTS.has(effect.kind));if(!attackHits({accuracy:e.accuracy??100,accuracyUp:effectValue(battle,e.id,"accuracyUp","enemy"),accuracyDown:effectValue(battle,e.id,"accuracyDown","enemy"),evasion:st.evasion??0,evasionUp:effectValue(battle,target.id,"evasionUp"),evasionDown:effectValue(battle,target.id,"evasionDown"),guaranteedHit:Boolean(rules.guaranteedHit||hasEffect(battle,e.id,"guaranteedHit","enemy")||e.endgameUnavoidable||guaranteedBuff||(guaranteedStatus&&allyAilment(target,guaranteedStatus)))})){addBattleLog(battle,`${displayName(target)}が攻撃を回避した`);await floatText("MISS / 回避",target.id,"miss");return 0}
 const protector=battle.party.find(monster=>monster.id!==target.id&&monster.currentHp>0&&signatureResonance(monster)?.id==="hide-guardian"&&target.currentHp/Math.max(1,st.hp)<=signatureResonance(monster).lowHpThreshold),protection=protector?1-(signatureResonance(protector).damageReduction??.4):1;
 const ailmentIgnore=allyAilment(target)?Number(e.floorBossPassive?.defenseIgnoreAgainstAilment)||0:0,ignore=Math.max(0,Math.min(.9,(Number(rules.defenseIgnore)||0)+(Number(e.floorBossPassive?.defenseIgnoreBonus)||0)+ailmentIgnore)),execute=rules.execute&&target.currentHp/Math.max(1,st.hp)<=rules.execute?2:1;
 const guardRuin=guard&&e.floorBossDomain?.effect==="guardRuin",guardPierce=guardRuin?Math.max(0,Math.min(1,Number(e.floorBossDomain.guardPierce)||0)):0,guardFxBase=Math.min(.85,effectValue(battle,target.id,"guard")*(1+affixValue(target,"guardPower",100)/100)),guardFx=guardFxBase*(1-guardPierce),guardBase=guard&&!rules.guaranteedHit?Math.max(.15,.45-affixValue(target,"guardPower",100)/200):1,guardMultiplier=guardRuin?1-(1-guardBase)*(1-guardPierce):guardBase;
 const vulnerable=effectValue(battle,target.id,"vulnerable"),reduction=Math.min(.75,affixValue(target,"damageReduction",75)/100+(signatureResonance(target)?.damageReduction??0)),attackElement=element??SPECIES[e.speciesId]?.element??null,targetElement=target.attribute??SPECIES[target.speciesId]?.element??"neutral",resistance=elementalResistance(target,attackElement),magic=rules.damageClass==="magic",hybrid=rules.damageClass==="hybrid",split=rules.damageClass==="split",conversionRate=e.endgameBossId?Math.max(0,Math.min(1,effectValue(battle,e.id,"magicToPhysical","enemy"))):0,convertedAtk=e.atk+(e.matk??e.atk)*conversionRate,convertedMatk=(e.matk??e.atk)*(1-conversionRate),attackValue=split?((convertedAtk+convertedMatk)/2):hybrid?Math.max(convertedAtk,convertedMatk):magic?convertedMatk:convertedAtk,defenseValue=split?((st.def+(st.mdef??st.def))/2):hybrid?Math.min(st.def,st.mdef??st.def):magic?(st.mdef??st.def):st.def,debuffPursuit=e.floorBossDomain?.effect==="debuffPursuit"&&hasEffect(battle,target.id,e.floorBossDomain.kind)?Math.max(1,Number(e.floorBossDomain.powerMultiplier)||1):1,convergenceDomain=e.floorBossDomain?.effect==="dualDebuffConvergence"?e.floorBossDomain:null,convergenceBonus=convergenceDomain?Math.min(Number(convergenceDomain.maxPower)||.26,(convergenceDomain.kinds??[]).filter(kind=>hasEffect(battle,target.id,kind)).length*Math.max(0,Number(convergenceDomain.perEffect)||0)):0,gravityBonus=e.floorBossDomain?.effect==="gravityPressure"?Math.min(Number(e.floorBossDomain.maxPower)||.30,(1-target.currentHp/Math.max(1,st.hp))*Math.max(0,Number(e.floorBossDomain.maxPower)||.30)):0,frozenBonus=e.floorBossDomain?.effect==="frozenShatter"&&allyAilment(target,"freeze")?Math.max(1,Number(e.floorBossDomain.powerMultiplier)||1):1,defenseImbalance=e.floorBossDomain?.effect==="defenseImbalance"?Math.min(Number(e.floorBossDomain.maxPower)||.26,Math.abs(st.def-(st.mdef??st.def))/Math.max(1,st.def,st.mdef??st.def)*Math.max(0,Number(e.floorBossDomain.maxPower)||.26)):0;
 const attackPower=attackValue*enemyAttackFactor(e.id),defensePower=defenseValue*(1-ignore)*allyDefenseFactor(target.id)*.55,baseDamage=enemyDamageAfterDefense(attackPower,defensePower);
 let d=Math.max(1,Math.floor(baseDamage*multiplier*debuffPursuit*(1+convergenceBonus)*(1+gravityBonus)*(1+defenseImbalance)*frozenBonus*attributeDamageMultiplier(attackElement,targetElement)*execute*guardMultiplier*(1-guardFx)*(1+vulnerable)*(1-reduction)*(1-resistance)*abyssBattleMultiplier(target,"partyDamageTakenRate")*protection));if(rules.currentHpDamage)d+=Math.max(1,Math.floor(target.currentHp*Math.min(.25,rules.currentHpDamage))*protection);if(critical)d=Math.floor(d*Math.max(1,Number(e.floorBossPassive?.critDamageMultiplier)||1.55));if(hasCircleEffect(target,"soleSurvivor")&&battle.party.filter(member=>member.currentHp>0).length===1)d=Math.max(1,Math.floor(d*.6));d=absorbSignatureShield(target,d);d=absorbMagicCircleShield(target,d);if(critical&&d>0&&e.floorBossDomain?.effect==="criticalCharge")e._floorBossCriticalReady=true;
 target.currentHp=Math.max(0,target.currentHp-d);recordBattleTaken(target,d);if(hasCircleEffect(target,"rage")&&d>0)target._circleRage=Math.min(12,(target._circleRage??0)+1);if(target.currentHp<=0&&tryUnyielding(target))addBattleLog(battle,`${displayName(target)}の復活・耐久効果が発動（${battle.reviveCount}/99）`);else addBattleLog(battle,`${displayName(target)}に${d}ダメージ`);await flushMagicCircleEvents();
 if(guard&&d>0&&e.floorBossDomain?.effect==="curtainGuardOpening"){const hits=Math.max(1,Math.floor(Number(e.floorBossDomain.openHits)||2));e._floorBossCurtainOpenHits=Math.max(Math.max(0,Math.floor(Number(e._floorBossCurtainOpenHits)||0)),hits);addBattleLog(battle,`${e.floorBossDomain.name}：${displayName(target)}のガードで聖幕開放・反撃${hits}撃`)}
 if(guardRuin&&d>0){battle.guards[target.id]=false;battle.allyEffects[target.id]=(battle.allyEffects?.[target.id]??[]).filter(effect=>effect.kind!=="guard");addBattleLog(battle,`${e.floorBossDomain.name}：${displayName(target)}のガードを破砕`)}
 await animateHit(target.id,critical);if(critical)burstParticles(target.id,"enemy",14);await floatText(`${label}${critical?"会心 ":""}-${d}`,target.id,critical?"critical":"enemy");
 if(protector&&e.hp>0){const resonance=signatureResonance(protector),stats=calculatedStats(protector),counter=Math.max(1,Math.floor((stats.atk-e.def*.25)*(resonance.counterPower??.75)*abyssBattleMultiplier(protector,"partyDamageRate")*magicCircleDamageMultiplier(protector))),applied=applyEnemyDamage(battle,e,counter,{sourceId:protector.id,damageClass:"physical"});recordBattleDamage(protector,applied.damage);registerWeaponFinisher(protector,e,applied.beforeHp);addBattleLog(battle,`${displayName(protector)}：守護反撃 ${applied.damage.toLocaleString()}ダメージ`);await battleBanner("守護反撃",`${displayName(target)}をかばい40%軽減`,"synergy",480,protector);await floatText(applied.damage?`反撃 -${applied.damage}`:"完全ガード",e.id,applied.damage?"skill":"guard")}
 if(target.currentHp<=0){handleMagicCircleDeath(target);syncInvincibleAllianceState();await flushMagicCircleEvents();await animateDefeat(target.id)}else if(hasEffect(battle,target.id,"counter")){const cs=calculatedStats(target),counterBoost=1+affixValue(target,"counterDamage",150)/100,counter=Math.max(1,Math.floor((cs.atk*effectValue(battle,target.id,"counter")-e.def*.25)*counterBoost*abyssBattleMultiplier(target,"partyDamageRate")*magicCircleDamageMultiplier(target))),applied=applyEnemyDamage(battle,e,counter,{sourceId:target.id,damageClass:"physical"});recordBattleDamage(target,applied.damage);registerWeaponFinisher(target,e,applied.beforeHp);addBattleLog(battle,`${displayName(target)}が${applied.damage}反撃ダメージ`);await floatText(applied.damage?`反撃 -${applied.damage}`:"完全ガード",e.id,applied.damage?"skill":"guard")}await tryGuardianPassive();return d;
}
function floorBossDomainActionMultiplier(e,info,action=null){
 if(!e?.floorBossDomain)return 1;const domain=e.floorBossDomain;let value=1,label="";
 if(domain.effect==="everyNth"){
  e._floorBossDomainActions=(e._floorBossDomainActions??0)+1;
  if(e._floorBossDomainActions%Math.max(1,Number(domain.every)||3)===0)e._floorBossNthReady=true;
 }
 if(info?.utility)return 1;
	 if(domain.effect==="tideCycle"){e._floorBossTideActions=Math.max(0,Math.floor(Number(e._floorBossTideActions)||0))+1;if(e._floorBossTideActions%2===1){e._floorBossTideEbbReady=true;label="引潮・魔力吸収"}else{e._floorBossTideFloodReady=true;value*=Number(domain.powerMultiplier)||1;label="満潮・威力増幅"}}
	 if(domain.effect==="thermalCycle"){e._floorBossThermalActions=Math.max(0,Math.floor(Number(e._floorBossThermalActions)||0))+1;if(e._floorBossThermalActions%2===1){e.divineBarrier=Math.max(Number(e.divineBarrier)||0,Math.max(1,Math.floor(Number(domain.barrierOnCold)||1)));label="冷殻相・障壁展開"}else{value*=Number(domain.powerMultiplier)||1;label="黒炉相・威力増幅"}}
	 if(domain.effect==="reflectionBurst"&&e._floorBossReflectionReady){e._floorBossReflectionReady=false;value*=Number(domain.powerMultiplier)||1;label="初照返火"}
	 if(domain.effect==="armorBreakCounter"&&e._floorBossArmorBreakReady){e._floorBossArmorBreakReady=false;value*=Number(domain.powerMultiplier)||1;e.divineBarrier=Math.max(Number(e.divineBarrier)||0,Math.max(1,Math.floor(Number(domain.barrierOnBreak)||1)));label="破甲反城"}
	 if(domain.effect==="furnaceSprint"){const maxStacks=Math.max(1,Math.floor(Number(domain.maxStacks)||4)),stacks=Math.min(maxStacks,Math.max(0,Math.floor(Number(e._floorBossSprintStacks)||0))+1),bonus=Math.min(Number(domain.cap)||.24,stacks*Math.max(0,Number(domain.step)||.06));value*=1+bonus;if(stacks>=maxStacks){e._floorBossSprintStacks=0;e._floorBossSprintBonusHits=Math.max(1,Math.floor(Number(domain.bonusHits)||1));label=`百脚炉環 ${stacks}/${maxStacks}・追撃解放`}else{e._floorBossSprintStacks=stacks;label=`百脚炉環 ${stacks}/${maxStacks}`}}
	 if(domain.effect==="lifeEmberReserve"&&info?.consumeLifeEmber){const reserve=Math.max(0,Math.floor(Number(e._floorBossLifeEmber)||0)),bonus=Math.min(Number(domain.capRate)||.22,reserve/Math.max(1,e.maxHp));e._floorBossLifeEmber=0;if(bonus){value*=1+bonus;label=`命火爆開+${Math.round(bonus*100)}%`}}
		 if(domain.effect==="iceSealArchive"&&info?.consumeIceSeals){const maxStacks=Math.max(1,Math.floor(Number(domain.maxStacks)||3)),stacks=Math.min(maxStacks,Math.max(0,Math.floor(Number(e._floorBossIceSeals)||0))),bonus=Math.min(Number(domain.cap)||.27,stacks*Math.max(0,Number(domain.step)||.09));e._floorBossIceSeals=0;e._floorBossIceSealMpTax=stacks*Math.max(0,Number(domain.mpTaxStep)||0);if(stacks>=maxStacks)e._floorBossForceCritical=true;if(bonus){value*=1+bonus;label=`六鎖解封+${Math.round(bonus*100)}%`}}
		 if(domain.effect==="absoluteZeroLaw"){e._floorBossZeroLaw=(Math.max(0,Math.floor(Number(e._floorBossZeroLaw)||0))%3)+1;if(e._floorBossZeroLaw===1){e.divineBarrier=Math.max(Number(e.divineBarrier)||0,Math.max(1,Math.floor(Number(domain.barrierOnFirst)||1)));label="第一律・凍冠"}else if(e._floorBossZeroLaw===2){e._floorBossZeroMpTax=Math.max(0,Number(domain.mpTaxRate)||0);label="第二律・凍刻"}else{value*=Number(domain.powerMultiplier)||1;e._floorBossForceCritical=true;label="第三律・零皇"}}
		 if(domain.effect==="toxinDoseHarvest"&&info?.consumeToxinDoses){const maxStacks=Math.max(1,Math.floor(Number(domain.maxStacks)||3)),stacks=Math.min(maxStacks,Math.max(0,Math.floor(Number(e._floorBossToxinDoses)||0))),bonus=Math.min(Number(domain.cap)||.30,stacks*Math.max(0,Number(domain.step)||.10));e._floorBossToxinDoses=0;if(stacks>=maxStacks)e._floorBossForceCritical=true;if(bonus){value*=1+bonus;label=`毒量刈取+${Math.round(bonus*100)}%`}}
		 if(domain.effect==="sporeNetwork"&&info?.networkBurst){const poisoned=battle.party.filter(monster=>monster.currentHp>0&&allyAilment(monster,"poison")).length,bonus=Math.min(Number(domain.maxPower)||.32,poisoned*Math.max(0,Number(domain.perTarget)||.08)),perHit=Math.max(1,Math.floor(Number(domain.targetsPerHit)||2));e._floorBossSporeNetworkBonusHits=Math.min(Math.max(0,Math.floor(Number(domain.maxBonusHits)||2)),Math.floor(poisoned/perHit));if(bonus){value*=1+bonus;label=`毒者網${poisoned}体+${Math.round(bonus*100)}%`}}
		 if(domain.effect==="sporeCellBattery"&&info?.consumeSporeCells){const maxStacks=Math.max(1,Math.floor(Number(domain.maxStacks)||4)),stacks=Math.min(maxStacks,Math.max(0,Math.floor(Number(e._floorBossSporeCells)||0))),bonus=Math.min(Number(domain.cap)||.28,stacks*Math.max(0,Number(domain.step)||.07));e._floorBossSporeCells=0;if(stacks>=maxStacks&&Number(domain.barrierOnFull)>0)e.divineBarrier=Math.max(Number(e.divineBarrier)||0,Math.max(1,Math.floor(Number(domain.barrierOnFull))));if(bonus){value*=1+bonus;label=`繁胞室解放+${Math.round(bonus*100)}%`}}
		 if(domain.effect==="miasmaSlipstream"){const maxStacks=Math.max(1,Math.floor(Number(domain.maxStacks)||4)),stacks=Math.min(maxStacks,Math.max(0,Math.floor(Number(e._floorBossFlightStacks)||0))),bonus=Math.min(Number(domain.cap)||.20,stacks*Math.max(0,Number(domain.step)||.05));if(bonus)value*=1+bonus;if(info?.consumeFlightStacks){const perHit=Math.max(1,Math.floor(Number(domain.stacksPerHit)||2));e._floorBossSlipstreamBonusHits=Math.min(Math.max(0,Math.floor(Number(domain.maxBonusHits)||2)),Math.floor(stacks/perHit));e._floorBossFlightStacks=0;if(stacks)label=`瘴翼${stacks}層解放+${Math.round(bonus*100)}%`}else if(stacks)label=`瘴翼滑空${stacks}/${maxStacks}`}
		 if(domain.effect==="broodSacrifice"&&info?.consumeBroodSacrifice){const reserve=Math.max(0,Math.floor(Number(e._floorBossBroodSacrifice)||0)),capRate=Math.min(.8,Number(domain.capRate)||.24),bonus=Math.min(capRate,reserve/Math.max(1,e.maxHp));e._floorBossBroodSacrifice=0;if(bonus>=capRate-.0001)e._floorBossForceCritical=true;if(bonus){value*=1+bonus;label=`胎命還生+${Math.round(bonus*100)}%`}}
		 if(domain.effect==="manaVacuum"&&info?.manaVacuum){const targets=battle.party.filter(monster=>monster.currentHp>0),low=targets.filter(monster=>(monster.currentMp??0)/Math.max(1,maxMp(monster))<=Math.max(0,Number(domain.threshold)||.30)),bonus=Math.min(Number(domain.maxPower)||.36,low.length*Math.max(0,Number(domain.perTarget)||.09));if(low.some(monster=>(monster.currentMp??0)<=0))e._floorBossForceCritical=true;if(bonus){value*=1+bonus;label=`魔力真空${low.length}体+${Math.round(bonus*100)}%`}}
		 if(domain.effect==="magicZeroOverdrive"&&e._floorBossActionConversion&&info?.damageClass==="physical"){value*=Number(domain.powerMultiplier)||1;label="白零黒牙過給"}
		 if(domain.effect==="crystalManaDecay"){const maximum=Math.max(1,Number(e.maxMp)||1),missing=1-Math.max(0,Number(e.currentMp)||0)/maximum,bonus=Math.min(Number(domain.maxPower)||.32,Math.max(0,missing)*Math.max(0,Number(domain.maxPower)||.32));if(bonus){value*=1+bonus;label=`枯葬+${Math.round(bonus*100)}%`}}
		 if(domain.effect==="deathVoltage"&&info?.deathVoltageStrike){const stacks=Math.max(0,Math.floor(Number(e._floorBossDeathVoltage)||0)),cap=Math.max(1,Math.floor(Number(domain.cap)||7)),bonus=Math.min(Number(domain.strikeCap)||.35,stacks*Math.max(0,Number(domain.strikeStep)||.05));if(stacks>=cap)e._floorBossForceCritical=true;if(bonus){value*=1+bonus;label=`死電圧${stacks}/${cap}+${Math.round(bonus*100)}%`}}
		 if(domain.effect==="gardenDuelRiposte"&&e._floorBossDuelRiposteReady){e._floorBossDuelRiposteReady=false;value*=Number(domain.powerMultiplier)||1;label="白晶剣礼返し"}
		 if(domain.effect==="healingReflection"&&info?.consumeHealingReflection){const light=Math.max(0,Math.min(Number(domain.cap)||.24,Number(e._floorBossHealingReflection)||0));e._floorBossHealingReflection=0;if(light){value*=1+light;label=`回生花光+${Math.round(light*100)}%`}}
		 if(domain.effect==="gemVelocity"){const stacks=Math.min(Math.max(1,Math.floor(Number(domain.maxStacks)||5)),Math.max(0,Math.floor(Number(e._floorBossGemVelocity)||0))),bonus=Math.min(Number(domain.cap)||.20,stacks*Math.max(0,Number(domain.step)||.04));if(bonus){value*=1+bonus;label=`瑠璃速${stacks}層+${Math.round(bonus*100)}%`}}
		 if(domain.effect==="fourSeasonCrown"){const cap=Math.max(1,Math.floor(Number(domain.maxPetals)||4)),opened=Math.min(cap,new Set(e._floorBossOpenedElements??[]).size),remaining=Math.max(0,cap-opened),bonus=Math.min(Number(domain.maxPower)||.20,remaining*Math.max(0,Number(domain.perPetal)||.05));if(bonus){value*=1+bonus;label=`未開花${remaining}枚+${Math.round(bonus*100)}%`}}
		 if(domain.effect==="mirrorMemory"&&info?.consumeDamageMemory){const memory=Math.max(0,Math.min(.8,Number(e._floorBossDamageMemory)||0));e._floorBossDamageMemory=0;if(memory){value*=1+memory;label=`被弾反照+${Math.round(memory*100)}%`}}
	 if(domain.effect==="defenseSwap"){const physical=Math.max(0,Number(e.def)||0),magic=Math.max(0,Number(e.mdef)||0);e.def=magic;e.mdef=physical;e._floorBossDefenseSide=e.def>=e.mdef?"物理":"魔法";label=`${e._floorBossDefenseSide}城壁へ転換`}
	 if(domain.effect==="undertowRiposte"&&e._floorBossRiposteReady){e._floorBossRiposteReady=false;e._floorBossForceCritical=true;value*=Number(domain.powerMultiplier)||1;label="返潮・必中会心"}
	 if(domain.effect==="cooldownDebt"&&info?.consumeCooldownDebt){const debt=Object.values(battle.cooldowns??{}).reduce((sum,map)=>sum+Object.values(map??{}).reduce((total,turns)=>total+Math.max(0,Number(turns)||0),0),0),bonus=Math.min(Number(domain.maxPower)||.28,debt*Math.max(0,Number(domain.perTurn)||0));if(bonus){value*=1+bonus;label=`再唱負債+${Math.round(bonus*100)}%`}}
	 if(domain.effect==="polarityOverload"){const maxStacks=Math.max(1,Math.floor(Number(domain.maxStacks)||3));if(info?.consumePolarity){const stacks=Math.max(0,Math.floor(Number(e._floorBossPolarityStacks)||0)),bonus=Math.min(Number(domain.cap)||.30,stacks*Math.max(0,Number(domain.step)||0));e._floorBossPolarityStacks=0;if(stacks>=maxStacks)e._floorBossForceCritical=true;if(bonus){value*=1+bonus;label=`交極解放+${Math.round(bonus*100)}%`}}else if(["physical","magic"].includes(info?.damageClass)){const previous=e._floorBossPolarityType;if(previous&&previous!==info.damageClass)e._floorBossPolarityStacks=Math.min(maxStacks,Math.max(0,Math.floor(Number(e._floorBossPolarityStacks)||0))+1);e._floorBossPolarityType=info.damageClass;if(e._floorBossPolarityStacks)label=`交極${e._floorBossPolarityStacks}/${maxStacks}`}}
	 if(domain.effect==="combustionConsume"&&info?.consumeAilment&&battle.party.some(monster=>monster.currentHp>0&&allyAilment(monster,info.consumeAilment))){value*=Number(domain.powerMultiplier)||1;label="火傷燃葬+35%"}
 if(domain.effect==="stellarArchive"&&info?.consumeArchive){const stacks=Math.max(0,Math.floor(Number(e._floorBossArchiveStacks)||0)),bonus=Math.min(Number(domain.cap)||.27,stacks*Math.max(0,Number(domain.step)||0));e._floorBossArchiveStacks=0;e._floorBossArchiveBonusHits=stacks>=Math.max(1,Number(domain.bonusHitAt)||3)?1:0;if(bonus){value*=1+bonus;label=`星刻反照+${Math.round(bonus*100)}%`}}
 if(domain.effect==="shieldAuthority"&&Number(e._floorBossHpShield)>0){value*=Number(domain.powerMultiplier)||1;label="礼壁聖威"}
 if(domain.effect==="afterimageBurst"){const stacks=Math.max(0,Math.floor(Number(e._floorBossAfterimages)||0)),bonus=Math.min(Number(domain.cap)||.24,stacks*Math.max(0,Number(domain.step)||0));e._floorBossAfterimages=0;e._floorBossAfterimageBonusHits=stacks>=Math.max(1,Number(domain.bonusHitAt)||2)?1:0;if(bonus){value*=1+bonus;label=`残像解放+${Math.round(bonus*100)}%`}}
 if(domain.effect==="inversionRelease"&&info?.consumeInversion){const stacks=Math.max(0,Math.floor(Number(e._floorBossInversionStacks)||0)),bonus=Math.min(Number(domain.cap)||.30,stacks*Math.max(0,Number(domain.step)||0));e._floorBossInversionStacks=0;if(bonus){value*=1+bonus;label=`反律解放+${Math.round(bonus*100)}%`}}
 if(domain.effect==="voidLawCycle"){e._floorBossVoidLaw=(Math.max(0,Math.floor(Number(e._floorBossVoidLaw)||0))%4)+1;if(e._floorBossVoidLaw===1){e._floorBossVoidDispel=true;label="第一法・消去"}else if(e._floorBossVoidLaw===2){e._floorBossVoidMpTax=Math.max(0,Number(domain.mpTaxRate)||0);label="第二法・枯渇"}else if(e._floorBossVoidLaw===3){e._floorBossVoidDrain=Math.max(0,Number(domain.drainRate)||0);label="第三法・吸命"}else{value*=Number(domain.powerMultiplier)||1;e.divineBarrier=Math.max(Number(e.divineBarrier)||0,Number(domain.barrierOnCrown)||1);label="第四法・冠臨"}}
 if(domain.effect==="faultCycle"){e._floorBossFaultActions=(e._floorBossFaultActions??0)+1;if(e._floorBossFaultActions%Math.max(1,Number(domain.every)||2)===0){value*=Number(domain.powerMultiplier)||1;label="火脈断層"}}
 if(domain.effect==="poisonedPursuit"&&battle.party.some(monster=>monster.currentHp>0&&allyAilment(monster,"poison"))){value*=Number(domain.powerMultiplier)||1;label="湿毒追圧"}
 if(domain.effect==="ailmentMirror"&&e._floorBossAilmentMirrorReady){e._floorBossAilmentMirrorReady=false;value*=Number(domain.powerMultiplier)||1;label="病理反照"}
 if(domain.effect==="shieldBreakCounter"&&e._floorBossShieldBrokenReady){e._floorBossShieldBrokenReady=false;value*=Number(domain.powerMultiplier)||1;label="胞殻破城"}
 if(domain.effect==="manaOvercharge"&&Number(e._floorBossManaCharge)>0){const charge=Math.min(Number(domain.cap)||.25,Math.max(0,Number(e._floorBossManaCharge)||0));e._floorBossManaCharge=0;value*=1+charge;label=`吸魔蓄雷+${Math.round(charge*100)}%`}
 if(domain.effect==="criticalCharge"&&e._floorBossCriticalReady){e._floorBossCriticalReady=false;value*=Number(domain.powerMultiplier)||1;label="会心蓄電"}
 if(domain.effect==="stormCounter"&&e._floorBossStormCounterReady){e._floorBossStormCounterReady=false;value*=Number(domain.powerMultiplier)||1;label="雷晶反響"}
 if(domain.effect==="stormCycle"){e._floorBossStormActions=(Number(e._floorBossStormActions)||0)+1;if(e._floorBossStormActions%Math.max(1,Number(domain.every)||3)===0){value*=Number(domain.powerMultiplier)||1;e.divineBarrier=Math.max(Number(e.divineBarrier)||0,Number(domain.barrierOnBurst)||0);label="三律万雷"}}
 if(domain.effect==="mirrorScars"){const statusCount=(battle.enemyStatuses?.[e.id]??[]).length,effectCount=(battle.enemyEffects?.[e.id]??[]).filter(effect=>!POSITIVE_ENEMY_EFFECTS.has(effect.kind)).length,bonus=Math.min(Number(domain.maxPower)||.24,(statusCount+effectCount)*Math.max(0,Number(domain.perEffect)||0));if(bonus){value*=1+bonus;label=`鏡痕+${Math.round(bonus*100)}%`}}
 if(domain.effect==="impactRelease"&&info?.consumeImpact){const stacks=Math.max(0,Math.floor(Number(e._floorBossImpactStacks)||0)),bonus=Math.min(Number(domain.cap)||.30,stacks*Math.max(0,Number(domain.step)||0));e._floorBossImpactStacks=0;if(bonus){value*=1+bonus;label=`瓦礫反城+${Math.round(bonus*100)}%`}if(stacks&&Number(domain.shieldOnReleaseRate)>0){const amount=Math.max(1,Math.floor(e.maxHp*Math.min(.8,Number(domain.shieldOnReleaseRate))));e._floorBossHpShield=Math.max(Number(e._floorBossHpShield)||0,amount)}}
 if(domain.effect==="sealRelease"&&e._floorBossSealReady){e._floorBossSealReady=false;value*=Number(domain.powerMultiplier)||1;label="封律逆流"}
 if(domain.effect==="growthCycle"){e._floorBossGrowthActions=(Number(e._floorBossGrowthActions)||0)+1;const phase=(e._floorBossGrowthActions-1)%3;if(phase===0){e.divineBarrier=Math.max(Number(e.divineBarrier)||0,Number(domain.barrierOnRoot)||1);label="根相・護界"}else if(phase===1){e._floorBossGrowthDrainRate=Math.max(0,Number(domain.drainRate)||0);label="幹相・吸命"}else{value*=Number(domain.powerMultiplier)||1;label="樹冠相・万葉"}}
 if(domain.effect==="siegeHeat"&&e._floorBossPowerReady){value*=Number(domain.powerMultiplier)||1;e._floorBossPowerReady=false;e._floorBossHeat=0;label="蓄熱解放"}
 if(domain.effect==="buffMirror"){const count=battle.party.filter(monster=>monster.currentHp>0&&(battle.allyEffects?.[monster.id]??[]).some(effect=>POSITIVE_ENEMY_EFFECTS.has(effect.kind))).length,bonus=Math.min(Number(domain.maxPower)||0,count*(Number(domain.perBuff)||0));value*=1+bonus;if(bonus)label=`反照+${Math.round(bonus*100)}%`}
 if(domain.effect==="speedAdvantage"){const average=battle.party.filter(monster=>monster.currentHp>0).reduce((sum,monster)=>sum+calculatedStats(monster).spd,0)/Math.max(1,battle.party.filter(monster=>monster.currentHp>0).length);if(e.spd>average){value*=Number(domain.powerMultiplier)||1;label="速度優位"}}
 if(domain.effect==="poisonPressure"){const count=battle.party.filter(monster=>(battle.allyAilments?.[monster.id]??[]).some(status=>status.id==="poison")).length,bonus=Math.min(Number(domain.maxPower)||0,count*(Number(domain.perTarget)||0));value*=1+bonus;if(bonus)label=`毒圧+${Math.round(bonus*100)}%`}
 if(domain.effect==="cappedCounter"&&e._floorBossDamageCapped){e._floorBossDamageCapped=false;value*=Number(domain.powerMultiplier)||1;label="反城砲撃"}
 if(domain.effect==="variedCombo"){const changed=Boolean(e._floorBossVariedLastAction&&e._floorBossVariedLastAction!==action);e._floorBossVariedBonus=changed?Math.min(Number(domain.cap)||.18,(Number(e._floorBossVariedBonus)||0)+(Number(domain.step)||.06)):0;e._floorBossVariedLastAction=action;if(e._floorBossVariedBonus){value*=1+e._floorBossVariedBonus;label=`残熱連携+${Math.round(e._floorBossVariedBonus*100)}%`}}
 if(domain.effect==="healingFlare"&&e._floorBossHealedPowerReady){e._floorBossHealedPowerReady=false;value*=Number(domain.powerMultiplier)||1;label="再燃命炉"}
 if(domain.effect==="cooldownPunish"&&battle.party.some(monster=>monster.currentHp>0&&Object.values(battle.cooldowns?.[monster.id]??{}).some(turns=>Number(turns)>0))){value*=Number(domain.powerMultiplier)||1;label="再唱封刻"}
 if(domain.effect==="twinPolarity"&&["physical","magic"].includes(info?.damageClass)){if(e._floorBossPolarity&&e._floorBossPolarity!==info.damageClass){value*=Number(domain.powerMultiplier)||1;label="双極連携"}e._floorBossPolarity=info.damageClass}
 if(domain.effect==="firstBeatTempo"){const entries=battle.turnQueue??[],enemyIndex=entries.findIndex(entry=>entry.type==="enemy"&&entry.id===e.id),allyIndices=entries.map((entry,index)=>entry.type==="ally"&&battle.party.some(monster=>monster.id===entry.id&&monster.currentHp>0)?index:-1).filter(index=>index>=0);if(enemyIndex>=0&&allyIndices.length&&allyIndices.every(index=>enemyIndex<index)){value*=Number(domain.powerMultiplier)||1;label="第一拍子・先奏"}}
 if(domain.effect==="manaNocturne"&&info?.consumeManaNocturne){const stored=Math.max(0,Math.min(Number(domain.cap)||.30,Number(e._floorBossManaNocturne)||0));e._floorBossManaNocturne=0;if(stored){value*=1+stored;label=`夜想音解放+${Math.round(stored*100)}%`}}
 if(domain.effect==="eclipseDeadline"&&info?.eclipseFinale&&e._floorBossEclipseReady){e._floorBossEclipseReady=false;e._floorBossEclipseStacks=0;e._floorBossForceCritical=true;value*=Number(domain.powerMultiplier)||1;label="三段日蝕・冠位終幕"}
 if(domain.effect==="everyNth"&&e._floorBossNthReady){e._floorBossNthReady=false;value*=Number(domain.powerMultiplier)||1;label="九律共鳴"}
 if(label)addBattleLog(battle,`${domain.name}：${label}`);return value;
}
async function applyFloorBossActionTax(enemy){
 const domain=enemy?.floorBossDomain;if(domain?.effect!=="actionMpTax")return;const rate=Math.max(0,Math.min(.25,Number(domain.mpRate)||0));let total=0,largest=0;
 for(const target of battle.party.filter(monster=>monster.currentHp>0)){const drained=Math.min(Math.max(0,target.currentMp??0),Math.max(1,Math.floor(maxMp(target)*rate)));target.currentMp=Math.max(0,(target.currentMp??0)-drained);total+=drained;largest=Math.max(largest,drained)}
 if(total){addBattleLog(battle,`${domain.name}：味方全体のMPを計${total.toLocaleString()}凍結消費`);await floatText(`MP -${largest}`,"party","enemy")}
}
async function advancePhosphorCountdown(enemy,target,marks=1){
 const domain=enemy?.floorBossDomain;if(domain?.effect!=="phosphorCountdown"||!target||target.currentHp<=0)return false;const threshold=Math.max(2,Math.floor(Number(domain.threshold)||3));battle.floorBossBellMarks??={};battle.floorBossBellMarks[enemy.id]??={};const current=Math.max(0,Math.floor(Number(battle.floorBossBellMarks[enemy.id][target.id])||0)),next=current+Math.max(1,Math.floor(Number(marks)||1));
 if(next<threshold){battle.floorBossBellMarks[enemy.id][target.id]=next;addBattleLog(battle,`${domain.name}：${displayName(target)} ${next}/${threshold}刻`);return false}battle.floorBossBellMarks[enemy.id][target.id]=0;syncInvincibleAllianceState();let hpDamage=0,mpDamage=0;
 if(!battle.invincibleAlliance){hpDamage=Math.min(target.currentHp,Math.max(1,Math.floor(target.currentHp*Math.min(.25,Number(domain.currentHpRate)||.07))));target.currentHp=Math.max(0,target.currentHp-hpDamage);recordBattleTaken(target,hpDamage);mpDamage=Math.min(Math.max(0,target.currentMp??0),Math.max(1,Math.floor(maxMp(target)*Math.min(.8,Number(domain.mpDrainRate)||.10))));target.currentMp=Math.max(0,(target.currentMp??0)-mpDamage);if(target.currentHp<=0&&tryUnyielding(target))addBattleLog(battle,`${displayName(target)}は三刻燐葬を耐えた`);if(target.currentHp<=0)handleMagicCircleDeath(target)}
 const healRate=Math.max(0,Number(enemy.floorBossPassive?.healOnBellDetonationRate)||0),healed=healRate?recoverFloorBossHp(enemy,Math.max(1,Math.floor(enemy.maxHp*healRate))):0;addBattleLog(battle,`${domain.name}：${displayName(target)}を起爆 HP-${hpDamage.toLocaleString()}・MP-${mpDamage.toLocaleString()}${healed?`・吸命+${healed.toLocaleString()}`:""}`);await floatText(battle.invincibleAlliance?"無敵":`燐葬 -${hpDamage}`,target.id,battle.invincibleAlliance?"guard":"critical");if(mpDamage)await floatText(`MP -${mpDamage}`,target.id,"enemy");if(target.currentHp<=0){syncInvincibleAllianceState();await animateDefeat(target.id)}return true
}
function grantEnemyAuthorityShield(source,rate,label="権能障壁"){
 const safeRate=Math.max(0,Math.min(.8,Number(rate)||0));if(!safeRate)return 0;
 let total=0;for(const ally of battle.enemies.filter(enemy=>enemy.hp>0)){const amount=Math.max(1,Math.floor(ally.maxHp*safeRate)),before=Math.max(0,Number(ally._floorBossHpShield)||0);ally._floorBossHpShield=Math.max(before,amount);total+=Math.max(0,ally._floorBossHpShield-before)}
 if(total)addBattleLog(battle,`${source.name}：${label} ${total.toLocaleString()}`);return total;
}
async function resolveEnemySpecialAction(e,action){
 const sourceInfo=specialActionInfo(action);if(!sourceInfo)return false;const info=sourceInfo.randomElement?{...sourceInfo,element:RANDOM_SKILL_ELEMENTS[Math.floor(Math.random()*RANDOM_SKILL_ELEMENTS.length)]??"neutral"}:sourceInfo;
 await battleBanner(info.label,e.name,e.faction==="tenGod"?"boss":"skill",720,e);battleFlash(e.faction==="tenGod"?"boss":"danger");
 await applyFloorBossActionTax(e);
 if(Number(info.selfHpCostRate)>0&&e.hp>1){const cost=Math.min(e.hp-1,Math.max(1,Math.floor(e.hp*Math.min(.8,Number(info.selfHpCostRate)))));e.hp=Math.max(1,e.hp-cost);storeFloorBossSacrifice(e,cost);addBattleLog(battle,`${e.name}：${info.label}の代価 HP-${cost.toLocaleString()}`);await floatText(`代価 -${cost}`,e.id,"enemy")}
 if(info.utility){
  const allies=info.type==="allHeal"||info.target==="味方全体"||info.effects?.some(effect=>effect.allies)?battle.enemies.filter(enemy=>enemy.hp>0):[e];
  if(info.heal){for(const ally of allies){const amount=Math.max(1,Math.floor(ally.maxHp*info.heal)),gained=recoverFloorBossHp(ally,amount);await flushBattleRecoveries();await floatText(`+${gained}`,ally.id,"heal")}}
  if(info.revive&&canBattleRevive()){
	   const validReviveTarget=enemy=>enemy.hp<=0&&(!info.slimeOnly||enemy.race==="slime"||String(enemy.speciesId).includes("slime")),fallen=battle.enemies.find(enemy=>validReviveTarget(enemy)&&!hasEffect(battle,enemy.id,"reviveSeal","enemy")),sealed=battle.enemies.find(enemy=>validReviveTarget(enemy)&&hasEffect(battle,enemy.id,"reviveSeal","enemy"));
	   if(fallen){const before=fallen.hp,transfer=info.reviveTransferRate?Math.floor(e.hp*Math.min(.9,info.reviveTransferRate)):0;if(transfer>0){e.hp=Math.max(1,e.hp-transfer);storeFloorBossSacrifice(e,transfer);fallen.hp=Math.max(1,Math.min(fallen.maxHp,transfer));addBattleLog(battle,`${e.name}はHP${transfer.toLocaleString()}を${fallen.name}へ分与`)}else fallen.hp=Math.max(1,Math.floor(fallen.maxHp*info.revive));battle.reviveCount++;queueBattleRecovery(fallen,"hp",before,fallen.hp);for(const effect of info.revivedEffects??info.reviveEffects??[])applyBattleEffect(battle,fallen.id,{...effect,sourceKey:`${e.id}:${action}:revive`,sourceSkillName:info.label},"enemy");if(e.floorBossDomain?.effect==="healingFlare")e._floorBossHealedPowerReady=true;await flushBattleRecoveries()}
	   else if(sealed)addBattleLog(battle,`${sealed.name}は蘇生封印中のため再構成できない`)
   else if(info.fallbackHeal){const gained=recoverFloorBossHp(e,Math.max(1,Math.floor(e.maxHp*info.fallbackHeal)));await flushBattleRecoveries();await floatText(`+${gained}`,e.id,"heal")}
  }
	  if(info.consumePrayerHeal&&e.floorBossDomain?.effect==="prayerReserve"){const reserve=Math.max(0,Math.floor(Number(e._floorBossPrayerReserve)||0));e._floorBossPrayerReserve=0;if(reserve){const gained=recoverFloorBossHp(e,reserve);addBattleLog(battle,`${e.floorBossDomain.name}：祈光${reserve.toLocaleString()}を命へ変換`);await flushBattleRecoveries();await floatText(`祈光 +${gained}`,e.id,"heal")}}
	  if(info.consumePearlHeal&&e.floorBossDomain?.effect==="pearlRebirth"&&e._floorBossPearlReady){e._floorBossPearlReady=false;const rate=Math.max(0,Math.min(.8,Number(e.floorBossDomain.healRate)||.12)),gained=recoverFloorBossHp(e,Math.max(1,Math.floor(e.maxHp*rate)));e.divineBarrier=Math.max(Number(e.divineBarrier)||0,Math.max(1,Math.floor(Number(e.floorBossDomain.barrier)||1)));addBattleLog(battle,`${e.floorBossDomain.name}：真珠心を追加回復と障壁へ変換`);await flushBattleRecoveries();await floatText(`真珠 +${gained}`,e.id,"heal")}
  if(info.cleanse){battle.enemyStatuses??={};battle.enemyEffects??={};let removed=0;for(const ally of allies){removed+=(battle.enemyStatuses[ally.id]??[]).length+(battle.enemyEffects[ally.id]??[]).filter(effect=>!POSITIVE_ENEMY_EFFECTS.has(effect.kind)).length;battle.enemyStatuses[ally.id]=[];battle.enemyEffects[ally.id]=(battle.enemyEffects[ally.id]??[]).filter(effect=>POSITIVE_ENEMY_EFFECTS.has(effect.kind))}if(removed)addBattleLog(battle,`${e.name}：${info.label}で味方の状態異常・弱体${removed}件を清浄`)}
  if(info.clearNegativeSelf){const removed=(battle.enemyStatuses?.[e.id]??[]).length+(battle.enemyEffects?.[e.id]??[]).filter(effect=>!POSITIVE_ENEMY_EFFECTS.has(effect.kind)).length;battle.enemyStatuses[e.id]=[];battle.enemyEffects[e.id]=(battle.enemyEffects?.[e.id]??[]).filter(effect=>POSITIVE_ENEMY_EFFECTS.has(effect.kind));if(removed)addBattleLog(battle,`${e.name}：${info.label}で状態異常・弱体${removed}件を清浄`)}
	  for(const effect of info.effects??[])for(const ally of(effect.allies?allies:[e])){if(e.floorBossCatalogId||e.endgameBossId)applyBattleEffect(battle,ally.id,{...effect,sourceKey:`${e.id}:${action}`,sourceSkillName:info.label},"enemy");else{if(effect.kind==="atkUp")ally.atk=Math.floor(ally.atk*(1+(effect.value??.2)));if(effect.kind==="defUp")ally.def=Math.floor(ally.def*(1+(effect.value??.2)));if(effect.kind==="spdUp")ally.spd=Math.floor(ally.spd*(1+(effect.value??.2)))}if(effect.kind==="guard")ally.divineBarrier=Math.max(ally.divineBarrier??0,Math.max(1,effect.turns??2));if(effect.kind==="regen")ally.eliteRegen=Math.max(ally.eliteRegen??0,effect.value??.1);if(effect.kind==="magicToPhysical"&&!ally.endgameBossId&&!ally._floorBossActionConversion){ally._floorBossActionConversion=true;const rate=Math.max(0,Math.min(1,Number(effect.value)||0)),magic=Math.max(0,Number(ally.matk)||0);ally.atk=Math.max(1,Math.floor(ally.atk+magic*rate));ally.matk=Math.max(1,Math.floor(magic*(1-rate)))}}
	  if(info.dispelOne||Number(info.stealOneBuffRate)>0){const stolen=dispelRandomAllyBuff(e);if(stolen&&Number(info.stealOneBuffRate)>0&&POSITIVE_ENEMY_EFFECTS.has(stolen.kind)){const rate=Math.max(0,Math.min(1,Number(info.stealOneBuffRate)));applyBattleEffect(battle,e.id,{...stolen,value:Number(stolen.value||0)*rate,turns:Math.max(1,Math.min(3,Number(stolen.turns)||1)),sourceKey:`${e.id}:${action}:utility-theft`,sourceSkillName:info.label},"enemy");addBattleLog(battle,`${e.name}：解除した加護を${Math.round(rate*100)}%で複写`)}}
	  if(info.invertOneBuff)invertRandomAllyBuff(e,info.invertRate);
	  if(info.breakAllyMagicCircle)breakRandomAllyMagicCircle(e);
	  if(Number(info.partyShieldRate)>0)grantEnemyAuthorityShield(e,info.partyShieldRate,"味方全体障壁");
	  if(Number(info.reducePartyCooldowns)>0){const amount=Math.max(1,Math.floor(info.reducePartyCooldowns)),targets=battle.enemies.filter(enemy=>enemy.hp>0);for(const ally of targets)ally.specialCooldown=Math.max(0,Number(ally.specialCooldown)||0)-amount;addBattleLog(battle,`${e.name}：味方固有技の再使用を${amount}ターン短縮`)}
	  if(Number(info.hpShieldRate)>0){const amount=Math.max(1,Math.floor(e.maxHp*Math.min(.8,Number(info.hpShieldRate))));e._floorBossHpShield=Math.max(Math.max(0,Number(e._floorBossHpShield)||0),amount);addBattleLog(battle,`${e.name}：増殖障壁 ${amount.toLocaleString()}`)}
	  if(Number(info.restoreArmorLayers)>0){const cap=Math.max(1,Math.floor(Number(e.floorBossPassive?.startingArmorLayers)||Number(info.restoreArmorLayers))),before=Math.max(0,Math.floor(Number(e._floorBossArmorLayers)||0));e._floorBossArmorLayers=Math.min(cap,Math.max(before,Math.floor(Number(info.restoreArmorLayers))));if(e._floorBossArmorLayers>before)addBattleLog(battle,`${e.name}：${e.floorBossPassive?.name??"城甲"} ${e._floorBossArmorLayers}/${cap}層へ再構築`)}
	  if(Number(info.selfMpHealRate)>0){const maximum=Math.max(1,Number(e.maxMp)||1),before=Math.max(0,Number(e.currentMp)||0),gain=Math.max(1,Math.floor(maximum*Math.min(.8,Number(info.selfMpHealRate))));e.currentMp=Math.min(maximum,before+gain);queueBattleRecovery(e,"mp",before,e.currentMp);if(e.currentMp>before){addBattleLog(battle,`${e.name}：磁力再充填 MP+${e.currentMp-before}`);await flushBattleRecoveries();await floatText(`MP +${e.currentMp-before}`,e.id,"heal")}}
	  if(info.beginHealingChorus&&e.floorBossDomain?.effect==="healingChorusChannel"){e._floorBossHealingChorus={dueTurn:Math.max(1,Number(battle.turn)||1)+1,damage:0};addBattleLog(battle,`${e.floorBossDomain.name}：一巡後の満命聖歌を詠唱・最大HP${Math.round((Number(e.floorBossDomain.thresholdRate)||.10)*100)}%で阻止可能`)}
	  if(info.applyPuppetLink&&e.floorBossDomain?.effect==="puppetLink"){const candidates=[...battle.party.filter(monster=>monster.currentHp>0)].sort(()=>Math.random()-.5).slice(0,2);if(candidates.length>=2){const duration=Math.max(1,Math.floor(Number(info.linkDuration)||Number(e.floorBossDomain.duration)||3));e._floorBossPuppetLink={ids:candidates.map(monster=>monster.id),expiresTurn:Math.max(1,Number(battle.turn)||1)+duration};addBattleLog(battle,`${e.floorBossDomain.name}：${candidates.map(displayName).join(" ↔ ")}を${duration}ターン連結`)}}
	  if(info.selfHeal){const amount=Math.max(1,Math.floor(e.maxHp*info.selfHeal)),gained=recoverFloorBossHp(e,amount);await flushBattleRecoveries();await floatText(`+${gained}`,e.id,"heal")}if(info.barrier)e.divineBarrier=Math.max(Number(e.divineBarrier)||0,Math.max(1,Math.floor(Number(info.barrier)||1)));return true;
 }
 const alive=battle.party.filter(monster=>monster.currentHp>0);
 let targets=[];
 if(info.pattern==="all")targets=alive;
 else if(info.pattern==="random3")targets=[...alive].sort(()=>Math.random()-.5).slice(0,Math.min(3,alive.length));
 else if(info.pattern==="singleWeak")targets=[chooseEnemyTarget(e,"weak")].filter(Boolean);
 else if(info.pattern==="singleStrong")targets=[chooseEnemyTarget(e,"threat")].filter(Boolean);
 else targets=[chooseEnemyTarget(e,"normal")].filter(Boolean);
 if(info.consumeMark&&targets.length===1){const marks=battle.floorBossTargetMarks?.[e.id]??{},marked=alive.filter(target=>marks[target.id]===info.consumeMark);if(marked.length)targets=[marked[Math.floor(Math.random()*marked.length)]]}
 if(info.fillHpDrain){const target=targets[0];if(!target)return true;syncInvincibleAllianceState();if(battle.invincibleAlliance){addBattleLog(battle,`${displayName(target)}：四LR連携で満命吸葬を無効化`);await floatText("無敵",target.id,"guard");return true}const missing=Math.max(0,e.maxHp-e.hp),amount=Math.min(missing,Math.max(0,target.currentHp)),before=e.hp;target.currentHp=Math.max(0,target.currentHp-amount);e.hp=Math.min(e.maxHp,e.hp+amount);if(amount&&e.floorBossDomain?.effect==="healingFlare")e._floorBossHealedPowerReady=true;recordBattleTaken(target,amount);queueBattleRecovery(e,"hp",before,e.hp);addBattleLog(battle,`${e.name}は防御を無視してHP${amount.toLocaleString()}を吸収`);if(target.currentHp<=0&&tryUnyielding(target))addBattleLog(battle,`${displayName(target)}は吸葬を耐えた`);if(target.currentHp<=0){handleMagicCircleDeath(target);syncInvincibleAllianceState()}await animateHit(target.id,true);if(target.currentHp<=0)await animateDefeat(target.id);await flushBattleRecoveries();await floatText(`吸収 -${amount}`,target.id,"critical");await floatText(`+${amount}`,e.id,"heal");return true}
 if(info.selfSacrificeHpDamage){const target=targets[0];if(!target)return true;const amount=Math.max(1,Math.floor(e.hp*Math.min(2,Number(info.selfSacrificeHpDamage)))),before=e.hp;syncInvincibleAllianceState();let dealt=0;if(!battle.invincibleAlliance){dealt=Math.min(target.currentHp,amount);target.currentHp=Math.max(0,target.currentHp-amount);recordBattleTaken(target,dealt);if(target.currentHp<=0&&tryUnyielding(target))addBattleLog(battle,`${displayName(target)}は自壊撃を耐えた`);if(target.currentHp<=0)handleMagicCircleDeath(target)}e.hp=0;addBattleLog(battle,`${e.name}は残HP${before.toLocaleString()}を自壊固定ダメージへ変換`);await animateHit(target.id,true);await floatText(battle.invincibleAlliance?"無敵":`自壊 -${dealt}`,target.id,battle.invincibleAlliance?"guard":"critical");await animateDefeat(e.id);syncInvincibleAllianceState();return true}
 if(e.enemyMimicArmor&&targets.length>1){const limit=Math.min(alive.length,Math.random()<.72?1:2);targets=[...targets].sort(()=>Math.random()-.5).slice(0,limit);addBattleLog(battle,`${e.name}の致死奇襲：対象 ${targets.length}体`)}
 const elements={inferno:"fire",tidal:"water",thunderstorm:"lightning",tempest:"wind",quake:"earth",radiance:"light",eclipse:"dark",absoluteZero:"ice",timeStop:"light",starfall:"wind"};
	 let multiplier=specialActionMultiplier(action)*(e.enraged?1.25:1)*Math.max(.5,Number(e._circleActionMultiplier)||1)*floorBossDomainActionMultiplier(e,info,action)*(Number(info.lowHpBonus)>0&&e.hp/Math.max(1,e.maxHp)<=Number(info.lowHpThreshold??.5)?1+Number(info.lowHpBonus):1)*turnPowerMultiplier(info),totalDamage=0,totalMpDrained=0,consumedAilments=0;
 if(info.copyAtk){
  const strongest=Math.max(1,...alive.map(monster=>{const stats=calculatedStats(monster);return Math.max(stats.atk,stats.matk??0)}));
  multiplier*=Math.max(1,Math.min(2,strongest/Math.max(1,e.atk)));
 }
	 let inflictedStatus=false,slipstreamApplied=false,puppetEchoed=false;
 for(const target of targets){let targetDamage=0;
	  const bonusRule=info.bonusVsStatus,bonusActive=Boolean(bonusRule?.id&&allyAilment(target,bonusRule.id)),statusBonusMultiplier=bonusActive?Math.max(1,Number(bonusRule.multiplier)||1):1,effectBonusRule=info.bonusVsEffect,effectBonusActive=Boolean(effectBonusRule?.kind&&hasEffect(battle,target.id,effectBonusRule.kind)),effectBonusMultiplier=effectBonusActive?Math.max(1,Number(effectBonusRule.multiplier)||1):1,buffBonusMultiplier=info.bonusVsEnemyBuff&&(battle.allyEffects?.[target.id]??[]).some(effect=>POSITIVE_ENEMY_EFFECTS.has(effect.kind))?Math.max(1,Number(info.bonusVsEnemyBuff.multiplier)||1):1;
  const pursuit=e.floorBossPassive?.bonusHitsOnAilment,pursuitHits=pursuit?.id&&allyAilment(target,pursuit.id)?Math.max(0,Math.floor(Number(pursuit.hits)||0)):0,effectPursuit=e.floorBossPassive?.bonusHitsOnEffect,effectPursuitHits=effectPursuit?.kind&&hasEffect(battle,target.id,effectPursuit.kind)?Math.max(0,Math.floor(Number(effectPursuit.hits)||0)):0;
	  const marks=battle.floorBossTargetMarks?.[e.id]??{},markActive=Boolean(info.consumeMark&&marks[target.id]===info.consumeMark),markDomainActive=markActive&&["rootWindRelay","markRelay","frostMarkRelay"].includes(e.floorBossDomain?.effect),markBonusHits=markDomainActive?Math.max(0,Math.floor(Number(e.floorBossDomain.bonusHits)||0)):0,markBonusMultiplier=markDomainActive?Math.max(1,Number(e.floorBossDomain.powerMultiplier)||1):1,domainBonusHits=Math.max(0,Math.floor(Number(e._floorBossArchiveBonusHits)||0))+Math.max(0,Math.floor(Number(e._floorBossAfterimageBonusHits)||0))+Math.max(0,Math.floor(Number(e._floorBossSprintBonusHits)||0))+Math.max(0,Math.floor(Number(e._floorBossSporeNetworkBonusHits)||0))+Math.max(0,Math.floor(Number(e._floorBossSlipstreamBonusHits)||0)),totalHits=Math.max(1,Number(info.hits)||1)+pursuitHits+effectPursuitHits+markBonusHits+domainBonusHits;
  if(pursuitHits+effectPursuitHits+markBonusHits+domainBonusHits)addBattleLog(battle,`${e.name}：${e.floorBossPassive?.name??e.floorBossDomain?.name}で${pursuitHits+effectPursuitHits+markBonusHits+domainBonusHits}回追撃`);
	  let previousDuetHit=false;for(let hit=0;hit<totalHits&&target.currentHp>0;hit++){await animateAttack(e.id,true);const acceleration=e.floorBossDomain?.effect==="acceleratingHits"?1+Math.min(Number(e.floorBossDomain.cap)||.2,hit*(Number(e.floorBossDomain.step)||.05)):1,classes=Array.isArray(info.alternatingDamageClasses)?info.alternatingDamageClasses:null,hitRules=classes?.length?{...info,damageClass:classes[hit%classes.length]}:info,duetBonus=e.floorBossDomain?.effect==="sunMoonDuet"&&hit>0&&previousDuetHit?1+Math.max(0,Number(e.floorBossDomain.secondHitBonus)||0):1,dealt=await dealEnemyHit(e,target,multiplier*statusBonusMultiplier*effectBonusMultiplier*buffBonusMultiplier*markBonusMultiplier*acceleration*duetBonus,`${info.label}${totalHits>1?` ${hit+1}撃目`:""} `,e.faction==="tenGod"?.16:.11,info.element??elements[action]??null,hitRules);previousDuetHit=dealt>0;targetDamage+=dealt;totalDamage+=dealt}
	  if(targetDamage&&info.triggerPuppetLink&&!puppetEchoed&&e.floorBossDomain?.effect==="puppetLink"){const link=e._floorBossPuppetLink,ids=link?.ids??[];if(Math.max(0,Number(link?.expiresTurn)||0)>=Math.max(1,Number(battle.turn)||1)&&ids.includes(target.id)){const other=battle.party.find(monster=>monster.id===ids.find(id=>id!==target.id)&&monster.currentHp>0);if(other){puppetEchoed=true;syncInvincibleAllianceState();let echo=0;if(!battle.invincibleAlliance){const cap=Math.max(1,Math.floor(calculatedStats(other).hp*Math.min(.25,Number(e.floorBossDomain.targetCapRate)||.06)));echo=Math.min(other.currentHp,cap,Math.max(1,Math.floor(targetDamage*Math.min(1,Number(e.floorBossDomain.echoRate)||.28))));other.currentHp=Math.max(0,other.currentHp-echo);recordBattleTaken(other,echo);if(other.currentHp<=0&&tryUnyielding(other))addBattleLog(battle,`${displayName(other)}は双糸余波を耐えた`);if(other.currentHp<=0){handleMagicCircleDeath(other);syncInvincibleAllianceState()}}addBattleLog(battle,`${e.floorBossDomain.name}：${displayName(target)}から${displayName(other)}へ${battle.invincibleAlliance?"無敵":`${echo.toLocaleString()}固定余波`}`);await animateHit(other.id,true);await floatText(battle.invincibleAlliance?"無敵":`双糸 -${echo}`,other.id,battle.invincibleAlliance?"guard":"critical");if(other.currentHp<=0)await animateDefeat(other.id)}}}
  if(targetDamage&&info.mpDrain){const drained=Math.max(0,Math.floor((target.currentMp??0)*Math.min(.8,info.mpDrain))),beforeMp=e.currentMp??0;target.currentMp=Math.max(0,(target.currentMp??0)-drained);e.currentMp=Math.min(e.maxMp??0,beforeMp+drained);totalMpDrained+=drained;queueBattleRecovery(e,"mp",beforeMp,e.currentMp);if(drained){await flushBattleRecoveries();await floatText(`MP +${e.currentMp-beforeMp}`,e.id,"heal")}}
  if(info.dispel){const positive=new Set(["atkUp","defUp","spdUp","regen","taunt","guard","counter","lifeSteal"]);battle.allyEffects[target.id]=(battle.allyEffects?.[target.id]??[]).filter(effect=>!positive.has(effect.kind));await floatText("強化解除",target.id,"skill")}
  if(targetDamage&&info.status){const persistent=["poison","burn","bleed","curse","paralysis","freeze","shock","sleep"].includes(info.status.id),effect=persistent?{...info.status,kind:info.status.id}:{kind:"stun",statusId:info.status.id,chance:info.status.chance,turns:info.status.turns??1};if(applyBattleEffect(battle,target.id,effect,"ally")){inflictedStatus=true;await floatText(info.status.name,target.id,info.status.id)}}
  if(info.amplifyAilment?.id){const ailment=allyAilment(target,info.amplifyAilment.id);if(ailment){const before=Number(ailment.power)||0;ailment.power=Math.min(Number(info.amplifyAilment.cap)||.05,before+Math.max(0,Number(info.amplifyAilment.power)||0));if(ailment.power>before)addBattleLog(battle,`${displayName(target)}の${ailment.name??info.amplifyAilment.id}が${Math.round(ailment.power*1000)/10}%へ深化`)}}
	  if(info.consumeAilment){const ailments=battle.allyAilments?.[target.id]??[],before=ailments.length;battle.allyAilments[target.id]=ailments.filter(status=>status.id!==info.consumeAilment);if(battle.allyAilments[target.id].length<before){consumedAilments++;addBattleLog(battle,`${e.name}：${info.consumeAilment}を燃焼威力へ消費`);syncPersistentAilments(battle,target.id)}}
	  if(targetDamage&&info.shatterFreeze){const ailments=battle.allyAilments?.[target.id]??[],before=ailments.length;battle.allyAilments[target.id]=ailments.filter(status=>status.id!=="freeze");battle.allyEffects[target.id]=(battle.allyEffects?.[target.id]??[]).filter(effect=>effect.sourceStatusId!=="freeze"&&effect.statusId!=="freeze");if(battle.allyAilments[target.id].length<before){addBattleLog(battle,`${e.floorBossDomain?.name??e.name}：${displayName(target)}の凍結を砕界`);syncPersistentAilments(battle,target.id)}}
	  for(const effect of info.effects??[])if(effect.enemy){const applied=applyBattleEffect(battle,target.id,{...effect,statusId:effect.statusId??effect.kind},"ally");if(applied&&effect.kind==="spdDown"&&e.floorBossDomain?.effect==="miasmaSlipstream")slipstreamApplied=true}
	  if(targetDamage&&info.harvestToxinDose&&e.floorBossDomain?.effect==="toxinDoseHarvest"&&allyAilment(target,"poison")){const cap=Math.max(1,Math.floor(Number(e.floorBossDomain.maxStacks)||3)),before=Math.max(0,Math.floor(Number(e._floorBossToxinDoses)||0));e._floorBossToxinDoses=Math.min(cap,before+1);if(e._floorBossToxinDoses>before)addBattleLog(battle,`${e.floorBossDomain.name}：毒量${e._floorBossToxinDoses}/${cap}`)}
  if(targetDamage&&markActive){delete battle.floorBossTargetMarks[e.id][target.id];addBattleLog(battle,`${e.floorBossDomain.name}：${displayName(target)}の${e.floorBossDomain.markName??"根印"}を消費`)}
  if(targetDamage&&info.applyMark&&target.currentHp>0){battle.floorBossTargetMarks??={};battle.floorBossTargetMarks[e.id]??={};battle.floorBossTargetMarks[e.id][target.id]=info.applyMark;addBattleLog(battle,`${e.name}：${displayName(target)}へ${e.floorBossDomain?.markName??"根印"}を刻印`)}
  if(targetDamage&&Number(info.bellMarks)>0)await advancePhosphorCountdown(e,target,info.bellMarks);
	  if(targetDamage&&Number(info.delayedEchoRate)>0&&e.floorBossDomain?.effect==="dreamEcho"&&target.currentHp>0){const cap=Math.max(1,Math.floor(calculatedStats(target).hp*Math.min(.25,Number(e.floorBossDomain.targetCapRate)||.08))),amount=Math.min(cap,Math.max(1,Math.floor(targetDamage*Math.min(1,Number(info.delayedEchoRate))))),dueTurn=Math.max(1,Number(battle.turn)||1)+1;e._floorBossDreamEchoes??=[];const existing=e._floorBossDreamEchoes.find(entry=>entry.targetId===target.id&&entry.dueTurn===dueTurn);if(existing)existing.amount=Math.min(cap,Math.max(0,Number(existing.amount)||0)+amount);else e._floorBossDreamEchoes.push({targetId:target.id,amount,dueTurn});addBattleLog(battle,`${e.floorBossDomain.name}：${displayName(target)}へ一巡後の余韻${amount.toLocaleString()}を記譜`)}
	 }
	 if(info.shuffleNextRound&&e.floorBossDomain?.effect==="pageShuffle"){e._floorBossShuffleNextRound=true;addBattleLog(battle,`${e.floorBossDomain.name}：次ラウンドの頁順を無字化`)}
	 if(slipstreamApplied&&e.floorBossDomain?.effect==="miasmaSlipstream"){const cap=Math.max(1,Math.floor(Number(e.floorBossDomain.maxStacks)||4)),before=Math.max(0,Math.floor(Number(e._floorBossFlightStacks)||0));e._floorBossFlightStacks=Math.min(cap,before+1);if(e._floorBossFlightStacks>before)addBattleLog(battle,`${e.floorBossDomain.name}：瘴翼${e._floorBossFlightStacks}/${cap}`)}
	 e._floorBossForceCritical=false;
	 if(e._floorBossTideEbbReady){e._floorBossTideEbbReady=false;const rate=Math.max(0,Math.min(.25,Number(e.floorBossDomain?.mpDrainRate)||0));let drained=0;for(const target of battle.party.filter(monster=>monster.currentHp>0)){const amount=Math.min(Math.max(0,target.currentMp??0),Math.max(1,Math.floor(maxMp(target)*rate)));target.currentMp=Math.max(0,(target.currentMp??0)-amount);drained+=amount}if(drained){const before=e.currentMp??0;e.currentMp=Math.min(e.maxMp??0,before+drained);queueBattleRecovery(e,"mp",before,e.currentMp);addBattleLog(battle,`${e.floorBossDomain.name}：引潮でMP${drained.toLocaleString()}を吸収`);await flushBattleRecoveries()}}
	 if(e._floorBossTideFloodReady){e._floorBossTideFloodReady=false;const rate=Math.max(0,Math.min(.5,Number(e.floorBossDomain?.healRate)||0)),gained=rate&&e.hp>0?recoverFloorBossHp(e,Math.max(1,Math.floor(e.maxHp*rate))):0;if(gained){addBattleLog(battle,`${e.floorBossDomain.name}：満潮でHP${gained.toLocaleString()}回復`);await flushBattleRecoveries();await floatText(`満潮 +${gained}`,e.id,"heal")}}
 if(info.spreadAilment){const source=battle.party.map(target=>allyAilment(target,info.spreadAilment)).find(Boolean);if(source){let spread=0;for(const target of battle.party.filter(monster=>monster.currentHp>0&&!allyAilment(monster,info.spreadAilment)))if(applyBattleEffect(battle,target.id,{...source,id:info.spreadAilment,kind:info.spreadAilment,chance:1,sourceKey:`${e.id}:${action}:spread`},"ally"))spread++;if(spread)addBattleLog(battle,`${e.name}：${info.label}が${spread}体へ${source.name??"病理"}を伝播`)}}
 if(totalMpDrained>0&&e.floorBossDomain?.effect==="manaOvercharge"){const domain=e.floorBossDomain,gain=totalMpDrained/Math.max(1,e.maxMp??1)*Math.max(0,Number(domain.chargeRate)||1);e._floorBossManaCharge=Math.min(Number(domain.cap)||.25,(Number(e._floorBossManaCharge)||0)+gain);addBattleLog(battle,`${domain.name}：雷力${Math.round(e._floorBossManaCharge*100)}%蓄積`)}
	 e._floorBossArchiveBonusHits=0;e._floorBossAfterimageBonusHits=0;e._floorBossSprintBonusHits=0;e._floorBossSporeNetworkBonusHits=0;e._floorBossSlipstreamBonusHits=0;
	 if(Number(e._floorBossIceSealMpTax)>0){const rate=Math.min(.20,Math.max(0,Number(e._floorBossIceSealMpTax)||0));e._floorBossIceSealMpTax=0;let drained=0,largest=0;for(const target of battle.party.filter(monster=>monster.currentHp>0)){const amount=Math.min(Math.max(0,target.currentMp??0),Math.max(1,Math.floor(maxMp(target)*rate)));target.currentMp=Math.max(0,(target.currentMp??0)-amount);drained+=amount;largest=Math.max(largest,amount)}if(drained){addBattleLog(battle,`${e.floorBossDomain.name}：解封でMP${drained.toLocaleString()}を凍結消費`);await floatText(`MP -${largest}`,"party","enemy")}}
	 if(Number(e._floorBossZeroMpTax)>0){const rate=Math.min(.20,Math.max(0,Number(e._floorBossZeroMpTax)||0));e._floorBossZeroMpTax=0;let drained=0,largest=0;for(const target of battle.party.filter(monster=>monster.currentHp>0)){const amount=Math.min(Math.max(0,target.currentMp??0),Math.max(1,Math.floor(maxMp(target)*rate)));target.currentMp=Math.max(0,(target.currentMp??0)-amount);drained+=amount;largest=Math.max(largest,amount)}if(drained){addBattleLog(battle,`${e.floorBossDomain.name}：第二律がMP${drained.toLocaleString()}を凍結消費`);await floatText(`MP -${largest}`,"party","enemy")}}
	 let disrupted=false,disruptedCount=0,stolen=null,inverted=null;if(info.dispelOne){stolen=dispelRandomAllyBuff(e);if(stolen){disrupted=true;disruptedCount++}}if(info.breakAllyMagicCircle&&breakRandomAllyMagicCircle(e)){disrupted=true;disruptedCount++}if(info.invertOneBuff){inverted=invertRandomAllyBuff(e,info.invertRate);if(inverted){disrupted=true;disruptedCount++}}
 if(stolen&&Number(info.stealOneBuffRate)>0&&POSITIVE_ENEMY_EFFECTS.has(stolen.kind)){const rate=Math.max(0,Math.min(1,Number(info.stealOneBuffRate)));applyBattleEffect(battle,e.id,{...stolen,value:Number(stolen.value||0)*rate,turns:Math.max(1,Math.min(3,Number(stolen.turns)||1)),sourceKey:`${e.id}:${action}:authority-theft`,sourceSkillName:info.label},"enemy");addBattleLog(battle,`${e.name}：解除した加護を${Math.round(rate*100)}%で所有`)}
 if(stolen&&e.floorBossDomain?.effect==="buffTheft"&&POSITIVE_ENEMY_EFFECTS.has(stolen.kind)){const rate=Math.max(0,Math.min(1,Number(e.floorBossDomain.copyRate)||0));applyBattleEffect(battle,e.id,{...stolen,value:Number(stolen.value||0)*rate,turns:Math.max(1,Math.min(3,Number(stolen.turns)||1)),sourceKey:`${e.id}:${action}:theft`,sourceSkillName:info.label},"enemy");addBattleLog(battle,`${e.name}：解除した加護を${Math.round(rate*100)}%で複写`)}
	 if(disruptedCount&&e.floorBossDomain?.effect==="stellarArchive"){const cap=Math.max(1,Math.floor(Number(e.floorBossPassive?.archiveCap)||3)),gain=Math.max(1,Math.floor(Number(e.floorBossPassive?.archiveOnDispel)||1))*disruptedCount;e._floorBossArchiveStacks=Math.min(cap,Math.max(0,Number(e._floorBossArchiveStacks)||0)+gain);addBattleLog(battle,`${e.floorBossDomain.name}：星刻${e._floorBossArchiveStacks}/${cap}`)}
	 if(disruptedCount&&e.floorBossDomain?.effect==="iceSealArchive"){const cap=Math.max(1,Math.floor(Number(e.floorBossDomain.maxStacks)||3));e._floorBossIceSeals=Math.min(cap,Math.max(0,Math.floor(Number(e._floorBossIceSeals)||0))+disruptedCount);addBattleLog(battle,`${e.floorBossDomain.name}：氷封${e._floorBossIceSeals}/${cap}`)}
 if(inverted&&e.floorBossDomain?.effect==="inversionRelease"){const cap=Math.max(1,Math.floor(Number(e.floorBossPassive?.inversionCap)||3)),gain=Math.max(1,Math.floor(Number(e.floorBossPassive?.inversionCharge)||1));e._floorBossInversionStacks=Math.min(cap,Math.max(0,Number(e._floorBossInversionStacks)||0)+gain);addBattleLog(battle,`${e.floorBossDomain.name}：反律${e._floorBossInversionStacks}/${cap}`)}
 if(disrupted&&e.floorBossDomain?.effect==="sealRelease")e._floorBossSealReady=true;
 if(disrupted&&Number(e.floorBossPassive?.healOnDispelRate)>0){const gained=recoverFloorBossHp(e,Math.max(1,Math.floor(e.maxHp*e.floorBossPassive.healOnDispelRate)));await flushBattleRecoveries();await floatText(`+${gained}`,e.id,"heal")}
 if(disrupted&&Number(e.floorBossPassive?.mpOnDispelRate)>0){const before=e.currentMp??0,gain=Math.max(1,Math.floor((e.maxMp??1)*e.floorBossPassive.mpOnDispelRate));e.currentMp=Math.min(e.maxMp??0,before+gain);queueBattleRecovery(e,"mp",before,e.currentMp);await flushBattleRecoveries();await floatText(`MP +${e.currentMp-before}`,e.id,"heal")}
 if(disrupted&&Number(e.floorBossPassive?.shieldOnDispelRate)>0){const cap=Math.max(1,Math.floor(e.maxHp*Math.min(.8,Number(e.floorBossPassive.shieldCapRate)||.12))),current=Math.max(0,Number(e._floorBossHpShield)||0),added=Math.max(0,Math.min(cap-current,Math.floor(e.maxHp*Math.min(.5,Number(e.floorBossPassive.shieldOnDispelRate)))));if(added){e._floorBossHpShield=current+added;addBattleLog(battle,`${e.name}：${e.floorBossPassive.name}で封力障壁 ${added.toLocaleString()}`)}}
 if(inflictedStatus&&Number(e.floorBossPassive?.mpOnStatusRate)>0){const before=e.currentMp??0,gain=Math.max(1,Math.floor((e.maxMp??1)*e.floorBossPassive.mpOnStatusRate));e.currentMp=Math.min(e.maxMp??0,before+gain);queueBattleRecovery(e,"mp",before,e.currentMp);await flushBattleRecoveries();await floatText(`MP +${e.currentMp-before}`,e.id,"heal")}
	 if(Number(info.increaseAllyCooldowns)>0){const amount=Math.max(1,Math.floor(info.increaseAllyCooldowns));let extended=0;for(const target of battle.party.filter(monster=>monster.currentHp>0))for(const skillId of Object.keys(battle.cooldowns?.[target.id]??{})){battle.cooldowns[target.id][skillId]+=amount;extended++}if(extended){addBattleLog(battle,`${e.name}：味方スキル${extended}件の再使用を${amount}ターン延長`);if(Number(e.floorBossPassive?.mpOnCooldownExtendedRate)>0){const before=e.currentMp??0,gain=Math.max(1,Math.floor((e.maxMp??1)*Math.min(.25,Number(e.floorBossPassive.mpOnCooldownExtendedRate))*extended));e.currentMp=Math.min(e.maxMp??0,before+gain);queueBattleRecovery(e,"mp",before,e.currentMp);await flushBattleRecoveries();if(e.currentMp>before)await floatText(`MP +${e.currentMp-before}`,e.id,"heal")}}}
	 if(consumedAilments>0&&e.hp>0){const healRate=Math.max(0,Number(e.floorBossPassive?.healOnConsumeAilmentRate)||0),shieldRate=Math.max(0,Number(e.floorBossPassive?.shieldOnConsumeAilmentRate)||0);if(healRate){const gained=recoverFloorBossHp(e,Math.max(1,Math.floor(e.maxHp*healRate*consumedAilments)));await flushBattleRecoveries();if(gained)await floatText(`喰火 +${gained}`,e.id,"heal")}if(shieldRate){const cap=Math.max(1,Math.floor(e.maxHp*Math.min(.8,Number(e.floorBossPassive?.shieldCapRate)||.15))),current=Math.max(0,Number(e._floorBossHpShield)||0),added=Math.max(0,Math.min(cap-current,Math.floor(e.maxHp*shieldRate*consumedAilments)));if(added){e._floorBossHpShield=current+added;addBattleLog(battle,`${e.name}：喰火障壁 ${added.toLocaleString()}`)}}}
 const statusVictim=targets.some(target=>(battle.allyAilments?.[target.id]??[]).length||(battle.allyEffects?.[target.id]??[]).some(effect=>effect.sourceStatusId||["stun","spdDown","atkDown","defDown","vulnerable"].includes(effect.kind)));
 if(Number(e.floorBossPassive?.statusDrainRate)>0&&totalDamage>0&&(inflictedStatus||statusVictim)){const gained=recoverFloorBossHp(e,Math.max(1,Math.floor(totalDamage*e.floorBossPassive.statusDrainRate)));await flushBattleRecoveries();await floatText(`病喰 +${gained}`,e.id,"heal")}
 if(info.drain&&totalDamage>0){const amount=Math.max(1,Math.floor(totalDamage*info.drain)),gained=recoverFloorBossHp(e,amount);await flushBattleRecoveries();await floatText(`+${gained}`,e.id,"heal")}
 if(e._floorBossVoidDispel){e._floorBossVoidDispel=false;dispelRandomAllyBuff(e)}
 if(Number(e._floorBossVoidMpTax)>0){const rate=Math.min(.25,Math.max(0,Number(e._floorBossVoidMpTax)||0));e._floorBossVoidMpTax=0;let drained=0,largest=0;for(const target of battle.party.filter(monster=>monster.currentHp>0)){const amount=Math.min(Math.max(0,target.currentMp??0),Math.max(1,Math.floor(maxMp(target)*rate)));target.currentMp=Math.max(0,(target.currentMp??0)-amount);drained+=amount;largest=Math.max(largest,amount)}if(drained){addBattleLog(battle,`${e.floorBossDomain.name}：第二法がMP${drained.toLocaleString()}を枯渇`);await floatText(`MP -${largest}`,"party","enemy")}}
 if(Number(e._floorBossVoidDrain)>0){const rate=Math.min(1,Math.max(0,Number(e._floorBossVoidDrain)||0));e._floorBossVoidDrain=0;if(totalDamage>0){const gained=recoverFloorBossHp(e,Math.max(1,Math.floor(totalDamage*rate)));await flushBattleRecoveries();await floatText(`虚命 +${gained}`,e.id,"heal")}}
 if(totalDamage>0&&Number(e._floorBossGrowthDrainRate)>0){const rate=Math.max(0,Math.min(1,Number(e._floorBossGrowthDrainRate))),gained=recoverFloorBossHp(e,Math.max(1,Math.floor(totalDamage*rate)));e._floorBossGrowthDrainRate=0;await flushBattleRecoveries();await floatText(`幹相 +${gained}`,e.id,"heal")}
 if(info.selfHeal){const amount=Math.max(1,Math.floor(e.maxHp*info.selfHeal)),gained=recoverFloorBossHp(e,amount);await flushBattleRecoveries();await floatText(`+${gained}`,e.id,"heal")}
 if(info.selfAtk)e.atk=Math.max(1,Math.floor(e.atk*(1+info.selfAtk)));
 if(info.selfDef)e.def=Math.max(0,Math.floor(e.def*(1+info.selfDef)));
 if(info.selfSpd)e.spd=Math.max(1,Math.floor(e.spd*(1+info.selfSpd)));
 if(info.barrier)e.divineBarrier=Math.max(e.divineBarrier??0,info.barrier);
 if(Number(info.partyShieldRate)>0)grantEnemyAuthorityShield(e,info.partyShieldRate,"味方全体障壁");
 if(Number(info.hpShieldRate)>0){const amount=Math.max(1,Math.floor(e.maxHp*Math.min(.8,Number(info.hpShieldRate))));e._floorBossHpShield=Math.max(Math.max(0,Number(e._floorBossHpShield)||0),amount);addBattleLog(battle,`${e.name}：権能障壁 ${amount.toLocaleString()}`)}
 if(info.slow)for(const target of targets.filter(monster=>monster.currentHp>0))applyBattleEffect(battle,target.id,{kind:"spdDown",value:info.slow,turns:3,chance:1},"ally");
 return true;
}
async function resolveEnemyFlee(e){
 const explorationAuto=Boolean(battle?.explorationAuto);addBattleLog(battle,`${e.name}は盾を転がして逃げ出した！`);await floatText("逃走",e.id,"miss");e.fled=true;e.hp=0;syncPersistentAilments(battle);persistExpeditionSnapshot(snapshot);clearPartySynergy();clearBattleCheckpoint();activeEnemy=null;document.querySelector(".battle-screen")?.remove();
 const body=`<div class="battle-result-cinematic escape-result"><div class="victory-crest">💨</div><small>希少遭遇</small><div class="victory-title"><span>逃走</span><em>逃げられた</em></div><div class="victory-subtitle">おちゅきは戦利品を残さず逃げ切った</div></div>`;
 app.insertAdjacentHTML("beforeend",Modal("逃げられた！",body,"探索を続ける"));const modal=topModal();let closed=false;const finish=()=>{if(closed)return;closed=true;modal?.remove();battle=null;screen="explore";render()};modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish;if(explorationAuto)setTimeout(finish,1000)
}
async function enemyTurn(){
 if(battle.busy)return;const entry=currentTurnEntry(battle);if(entry?.type!=="enemy")return continueBattleFlow();
 battle.busy=true;const e=currentEnemy(battle);if(!e){battle.busy=false;return finishCurrentAction()}battle.enemy=e;if(e.fleeAfterTurns&&battle.turn>=e.fleeAfterTurns)return resolveEnemyFlee(e);let action=chooseEnemyAction(e,{allies:battle.enemies,opponents:battle.party,battle}),mpCost=enemyActionMpCost(e,action);if(mpCost>(e.currentMp??0)){e.intent="魔力不足で通常攻撃へ切替";action=ENEMY_ACTIONS.attack;mpCost=0}e.currentMp=Math.max(0,(e.currentMp??0)-mpCost);addBattleLog(battle,`${e.name}：${e.intent}${mpCost?`（内部MP -${mpCost}）`:""}`);battle.actionCommitted=true;
 if(action===ENEMY_ACTIONS.guard){await floatText("防御",e.id,"guard")}
 else if(action===ENEMY_ACTIONS.charge){await floatText("力溜め",e.id,"charge")}
 else if(action===ENEMY_ACTIONS.heal){const h=recoverFloorBossHp(e,enemyHealAmount(e));await flushBattleRecoveries();await floatText(`+${h}`,e.id,"heal")}
 else if(action===ENEMY_ACTIONS.enrage){e.atk=Math.floor(e.atk*1.18);e.def=Math.floor(e.def*1.08);await battleBanner(e.endgameBossId?"権能解放":"狂暴化",e.intent,e.faction==="tenGod"?"boss":"skill",620);await floatText("狂暴化",e.id,"enrage");await animateHit(e.id,true)}
 else if(action===ENEMY_ACTIONS.divineBarrier){await battleBanner("神域障壁","受けるダメージを大幅軽減","boss",650);await floatText("障壁",e.id,"guard")}
 else if(specialActionInfo(action)){await resolveEnemySpecialAction(e,action)}
 else{
  const target=chooseEnemyTarget(e,e.endgameBossId?"threat":"normal");if(!target){battle.busy=false;return lose()};await animateAttack(e.id,action===ENEMY_ACTIONS.power);
  await dealEnemyHit(e,target,enemyAttackMultiplier(e,action)*Math.max(.5,Number(e._circleActionMultiplier)||1),action===ENEMY_ACTIONS.power?"強撃 ":"",e.enraged?.13:.08);
 }
 await flushBattleRecoveries();saveBattleCheckpoint();renderBattle();await wait(300);battle.busy=false;if(!battle.party.some(m=>m.currentHp>0))return lose();await finishCurrentAction();
}
async function finishCurrentAction(){
 if(battle?.escapePending){battle.busy=false;const escaped=await resolveEscape();if(escaped||!battle)return;if(!battle.escapePending&&battle.busy)return}
 const finished=currentTurnEntry(battle);if(finished?.type==="ally"&&battle.circleTurnMultipliers)delete battle.circleTurnMultipliers[finished.id];if(finished?.type==="enemy"){const enemy=(battle.enemies??[]).find(entry=>entry.id===finished.id);if(enemy)delete enemy._circleActionMultiplier}
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
	 for(const enemy of(battle.enemies??[]).filter(entry=>entry.hp>0&&entry.floorBossDomain?.effect==="healingChorusChannel"&&entry._floorBossHealingChorus)){const domain=enemy.floorBossDomain,pending=enemy._floorBossHealingChorus;if(Math.max(0,Number(pending.dueTurn)||0)>Math.max(1,Number(battle.turn)||1))continue;delete enemy._floorBossHealingChorus;const threshold=Math.max(1,Math.floor(enemy.maxHp*Math.max(.01,Math.min(.8,Number(domain.thresholdRate)||.10)))),damage=Math.max(0,Math.floor(Number(pending.damage)||0));if(damage>=threshold){const rate=Math.max(0,Math.min(.8,Number(domain.interruptDefDown)||.18));applyBattleEffect(battle,enemy.id,{kind:"defDown",value:rate,turns:3,chance:1,selfCost:true,sourceKey:`${enemy.id}:chorus-interrupt`,sourceSkillName:domain.name},"enemy");addBattleLog(battle,`${domain.name}：詠唱阻止 ${damage.toLocaleString()}/${threshold.toLocaleString()}・物理／魔法DEF-${Math.round(rate*100)}%`);await floatText("聖歌阻止",enemy.id,"critical")}else{const gained=recoverFloorBossHp(enemy,Math.max(1,Math.floor(enemy.maxHp*Math.max(0,Math.min(.8,Number(domain.healRate)||.30)))));enemy.divineBarrier=Math.max(Number(enemy.divineBarrier)||0,Math.max(0,Math.floor(Number(domain.barrier)||1)));addBattleLog(battle,`${domain.name}：詠唱成立 ${damage.toLocaleString()}/${threshold.toLocaleString()}・HP+${gained.toLocaleString()}`);await flushBattleRecoveries();await floatText(`聖歌 +${gained}`,enemy.id,"heal")}}
	 for(const enemy of(battle.enemies??[]).filter(entry=>entry.hp>0&&entry.floorBossDomain?.effect==="eclipseDeadline")){const domain=enemy.floorBossDomain,threshold=Math.max(1,Math.floor(enemy.maxHp*Math.max(.01,Math.min(.8,Number(domain.thresholdRate)||.08)))),damage=enemy._floorBossEclipseDamageRound===Math.max(0,Number(battle.turn)||0)?Math.max(0,Math.floor(Number(enemy._floorBossEclipseRoundDamage)||0)):0,cap=Math.max(1,Math.floor(Number(domain.maxStacks)||3)),before=Math.max(0,Math.floor(Number(enemy._floorBossEclipseStacks)||0));if(damage>=threshold){enemy._floorBossEclipseStacks=Math.max(0,before-1);addBattleLog(battle,`${domain.name}：火力試験成功 ${damage.toLocaleString()}/${threshold.toLocaleString()}・日蝕${enemy._floorBossEclipseStacks}/${cap}`)}else{enemy._floorBossEclipseStacks=Math.min(cap,before+1);addBattleLog(battle,`${domain.name}：火力試験未達 ${damage.toLocaleString()}/${threshold.toLocaleString()}・日蝕${enemy._floorBossEclipseStacks}/${cap}`);if(enemy._floorBossEclipseStacks>=cap&&!enemy._floorBossEclipseReady){enemy._floorBossEclipseReady=true;addBattleLog(battle,`${domain.name}：三段日蝕完成・次の終幕技が確定会心`)}}enemy._floorBossEclipseRoundDamage=0}
	 for(const enemy of(battle.enemies??[]).filter(entry=>entry._floorBossPuppetLink&&Math.max(0,Number(entry._floorBossPuppetLink.expiresTurn)||0)<=Math.max(1,Number(battle.turn)||1))){delete enemy._floorBossPuppetLink;addBattleLog(battle,`${enemy.floorBossDomain?.name??enemy.name}：双糸連結が終演`)}
	 for(const enemy of(battle.enemies??[]).filter(entry=>entry.hp>0&&entry.floorBossDomain?.effect==="dreamEcho")){const pending=enemy._floorBossDreamEchoes??[],due=pending.filter(entry=>Math.max(0,Number(entry.dueTurn)||0)<=Math.max(1,Number(battle.turn)||1));enemy._floorBossDreamEchoes=pending.filter(entry=>!due.includes(entry));for(const echo of due){const target=battle.party.find(monster=>monster.id===echo.targetId&&monster.currentHp>0);if(!target)continue;syncInvincibleAllianceState();let damage=0;if(!battle.invincibleAlliance){damage=Math.min(target.currentHp,Math.max(1,Math.floor(Number(echo.amount)||0)));target.currentHp=Math.max(0,target.currentHp-damage);recordBattleTaken(target,damage);if(target.currentHp<=0&&tryUnyielding(target))addBattleLog(battle,`${displayName(target)}は夢鐘余韻を耐えた`);if(target.currentHp<=0){handleMagicCircleDeath(target);syncInvincibleAllianceState()}}addBattleLog(battle,`${enemy.floorBossDomain.name}：${displayName(target)}へ${battle.invincibleAlliance?"無敵":"防御無視"}余韻 ${damage.toLocaleString()}ダメージ`);await animateHit(target.id,true);await floatText(battle.invincibleAlliance?"無敵":`余韻 -${damage}`,target.id,battle.invincibleAlliance?"guard":"critical");if(target.currentHp<=0)await animateDefeat(target.id)}}
 for(const enemy of(battle.enemies??[]).filter(entry=>entry.hp>0)){const maximum=Math.max(0,Number(enemy.maxMp)||0),before=Math.max(0,Number(enemy.currentMp)||0),rate=enemy.floorBossDomain?.effect==="sealTide"?Math.max(.08,Number(enemy.floorBossDomain.mpRegen)||0):.08,gain=Math.max(1,Math.floor(maximum*rate));enemy.currentMp=Math.min(maximum,before+gain);queueBattleRecovery(enemy,"mp",before,enemy.currentMp)}
 for(const enemy of(battle.enemies??[]).filter(entry=>entry.hp>0&&entry.floorBossDomain?.effect==="frostAttrition")){const domain=enemy.floorBossDomain,cap=Math.max(1,Math.floor(Number(domain.cap)||5)),stacks=Math.max(0,Number(enemy._floorBossFrostStacks)||0);if(stacks<cap){enemy._floorBossFrostStacks=stacks+1;enemy.def=Math.max(0,Math.floor(enemy.def*(1+Math.max(0,Number(domain.defStep)||0))));enemy.mdef=Math.max(0,Math.floor((enemy.mdef??enemy.def)*(1+Math.max(0,Number(domain.defStep)||0))));enemy.spd=Math.max(1,Math.floor(enemy.spd*(1-Math.min(.5,Math.max(0,Number(domain.spdStep)||0)))));addBattleLog(battle,`${domain.name}：葬鐘 ${enemy._floorBossFrostStacks}/${cap}`)}}
 for(const enemy of(battle.enemies??[]).filter(entry=>entry.hp>0&&Number(entry.floorBossPassive?.healPerPoisonedRate)>0)){const count=battle.party.filter(monster=>monster.currentHp>0&&allyAilment(monster,"poison")).length;if(count){const healed=recoverFloorBossHp(enemy,Math.max(1,Math.floor(enemy.maxHp*enemy.floorBossPassive.healPerPoisonedRate*count)));addBattleLog(battle,`${enemy.name}：${enemy.floorBossPassive.name}で${healed.toLocaleString()}回復`);await floatText(`菌糧 +${healed}`,enemy.id,"heal")}}
 for(const enemy of(battle.enemies??[]).filter(e=>e.hp>0&&e.eliteRegen>0)){const healed=recoverFloorBossHp(enemy,Math.max(1,Math.floor(enemy.maxHp*enemy.eliteRegen)));addBattleLog(battle,`${enemy.name}は${healed}回復した`);await floatText(`+${healed}`,enemy.id,"heal")}
 await flushBattleRecoveries();
 for(const result of statusResults){if(result.enemy.hp<=0&&result.sourceMonsterId){const source=battle.party.find(monster=>monster.id===result.sourceMonsterId);registerWeaponFinisher(source,result.enemy,result.beforeHp)}addBattleLog(battle,`${result.enemy.name}に${result.name} ${result.damage}ダメージ`);await animateHit(result.enemy.id,false);await floatText(`-${result.damage}`,result.enemy.id,result.id)}
 const partyRegen=Math.min(.08,battle.party.reduce((sum,monster)=>sum+seriesEffectValue(monster,"partyHpRegen",.08),0));
 for(const monster of battle.party.filter(m=>m.currentHp>0)){
  const max=calculatedStats(monster).hp,lowRegen=monster.currentHp/max<=.35?seriesEffectValue(monster,"lowHpRegen",.12):0,rate=Math.min(.25,equipmentRegenRate(monster)+lowRegen+partyRegen);
  if(rate){const amount=Math.max(1,Math.floor(max*rate)),healed=recoverBattleHp(monster,amount,max);if(healed){addBattleLog(battle,`${displayName(monster)}の装備再生 +${healed}`);await floatText(`+${healed}`,monster.id,"heal")}}
  const mpGain=Math.max(0,Math.floor(seriesEffectValue(monster,"mpRegen",20)));if(mpGain){const gained=recoverBattleMp(monster,mpGain,monster);if(gained)await floatText(`MP +${gained}`,monster.id,"heal")}
 }
 const allyResults=processAllyEffects(battle,calculatedStats);for(const result of allyResults){addBattleLog(battle,`${displayName(result.monster)} ${result.kind==="heal"?"回復":"継続ダメージ"} ${result.amount}`);if(result.kind==="heal")queueBattleRecovery(result.monster,"hp",Math.max(0,result.monster.currentHp-result.amount),result.monster.currentHp);else{await animateHit(result.monster.id,false);if(result.monster.currentHp<=0)handleMagicCircleDeath(result.monster)}await floatText(`${result.kind==="heal"?"+":"-"}${result.amount}`,result.monster.id,result.kind==="heal"?"heal":result.kind)}syncInvincibleAllianceState();await flushBattleRecoveries();
 tickCooldowns(battle);tickBattleEffects(battle);
 battle.guards={};
 for(const e of(battle.enemies??[]).filter(x=>x.hp<=0))await animateDefeat(e.id);if(!aliveEnemies(battle).length)return win(false,null)
 if(!battle.party.some(m=>m.currentHp>0))return lose();
 const judge=battle.party.find(monster=>monster.currentHp>0&&hasCircleEffect(monster,"turn20")&&!monster._circleJudgmentUsed&&battle.turn>=20);if(judge){judge._circleJudgmentUsed=true;for(const ally of battle.party)if(ally.id!==judge.id)magicCircleInstantDeath(ally,judge);for(const enemy of aliveEnemies(battle)){const before=enemy.hp;magicCircleInstantDeath(enemy,judge);registerWeaponFinisher(judge,enemy,before)}await magicCircleActivationFx(judge,circleInfo(judge),"二十刻終焉",`${displayName(judge)}以外へ即死判定`,{danger:true,duration:900});await flushMagicCircleEvents();if(!aliveEnemies(battle).length)return win(false,null);if(!battle.party.some(monster=>monster.currentHp>0))return lose()}
 battle.turn++;
 buildTurnQueue(battle);
	 const pageEditor=(battle.enemies??[]).find(enemy=>enemy.hp>0&&enemy._floorBossShuffleNextRound);if(pageEditor){for(const enemy of battle.enemies??[])enemy._floorBossShuffleNextRound=false;battle.turnQueue=shuffledBattleEntries(battle.turnQueue);addBattleLog(battle,`${pageEditor.floorBossDomain?.name??pageEditor.name}：第${battle.turn}ラウンドの行動頁を並べ替え`)}
 addBattleLog(battle,`第${battle.turn}ラウンド：${battle.turnQueue.map(entry=>entry.name).join(" → ")}`);
 battle.busy=false;saveBattleCheckpoint();renderBattle();
 await wait(260);
 return continueBattleFlow();
}
async function continueBattleFlow(){
 if(!battle||battle.busy)return;
 sanitizeBattleParty();
 if(battle.escapePending)return resolveEscape();
 skipInvalidEntries(battle);
 if(queueFinished(battle))return endRound();
 const entry=currentTurnEntry(battle);
 renderBattle();
 if(entry?.type==="enemy"){const current=currentEnemy(battle);if(current&&await prepareEnemyMagicCircleTurn(current))return;return enemyTurn()}
 if(entry?.type==="ally"){const current=currentAlly(battle);if(current&&await prepareMagicCircleTurn(current))return;if(battle.auto){await wait(220);const a=currentAlly(battle);if(a){a._maxHp=calculatedStats(a).hp;const hpRate=a.currentHp/Math.max(1,a._maxHp);if(hpRate<=.5){const recovery=learnedSkills(a).filter(skill=>canUseSkill(a,skill,battle?.cooldowns?.[a.id]?.[skill.id]??0)&&(skill.type==="selfHeal"||skill.heal&&skill.target==="自分")).sort((left,right)=>(right.heal??right.selfHeal??0)-(left.heal??left.selfHeal??0))[0];if(recovery)return command("skill",recovery.id);const item=["fullHeals","highPotions","potions"].find(type=>(save.state.inventory[type]??0)>0);if(item)return useBattleItem(item,a.id);if(hpRate<=.35)return command("guard")}if(hasCircleEffect(a,"rage")&&(a._circleRage??0)>=4&&Math.random()<Math.min(.75,(a._circleRage??0)*.06))return command("attack");const skill=chooseAutoSkill(a,battle);if(skill)return command("skill",skill.id)}return command("attack")}}
}
function expNeed(m){return expNeedFor(m)}
function finishBossMemoryVictory(caught,monster){
 const enemy=(battle?.enemies??[battle?.enemy]).filter(Boolean)[0],name=enemy?.name??SPECIES[enemy?.speciesId]?.name??"階層支配者";
 syncPersistentAilments(battle);clearPartySynergy();clearBattleCheckpoint();activeEnemy=null;
 document.querySelector(".battle-screen")?.remove();
 save.save();
 const body=`<div class="memory-victory-result">
  <img src="assets/ui/v2/memory-rift.png" alt="" class="memory-victory-rift">
  <small>ボスの記憶を制覇</small>
  <h2>${caught?"深淵の契約成立":"記憶を制覇"}</h2>
  <p>${caught?`${displayName(monster)}を深淵の記憶から連れ帰りました。`:`${name}の記憶を打ち破りました。`}</p>
  <div class="memory-victory-note">${caught?`${pixelIcon("event")} 捕獲個体は魔物一覧へ追加済みです。`:"この再戦ではGOLD・EXP・撃破報酬・階層進行は発生しません。"}</div>
 </div>`;
 app.insertAdjacentHTML("beforeend",Modal(caught?"捕獲成功！":"深淵の記憶",body,"拠点へ戻る"));
 const modal=topModal(),finish=()=>{modal?.remove();battle=null;go("home")};
 modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish
}
function win(caught,m){
 if(battle?.specialBattle&&advanceSpecialBattleWave())return;
 if(battle?.specialBattle)return finishSpecialBattle(true);
 audio.setScene("victory");audio.sfx("victory");
 const contributionSnapshot=battleContributionSnapshot();
 const memoryBattle=Boolean(battle?.memoryBattle),defeated=(battle.enemies??[battle.enemy]).filter(Boolean),floor=memoryBattle?(battle.memorySourceFloor??save.state.player.currentFloor):save.state.player.currentFloor,boss=defeated.find(e=>e.boss),eliteDefeated=defeated.filter(e=>e.elite&&!e.captured),firstBoss=!!boss&&!memoryBattle&&!floorBossWasDefeated(save.state.player,floor),suppressItemDrops=defeated.some(e=>e.noItemDrops);
 if(!memoryBattle&&boss&&floor===10)completeContextGuide("floor10_defeat",{quiet:true});
 const rewardMult=eliteDefeated.length?1.65:1,baseGold=battleGoldBase(floor,defeated,{firstBoss}),gold=modifiedGoldReward(save.state,baseGold,"battle");
 save.state.player.gold+=gold;
 save.state.records.kills+=defeated.filter(e=>!e.captured).length;
 const baseGain=defeated.reduce((sum,e)=>sum+enemyExperienceReward(e.level,{boss:Boolean(e.boss),firstBoss:Boolean(firstBoss&&e===boss),rare:Boolean(e.rareExp)}),0);
 const totalExp=Math.round(baseGain*battle.party.length*rewardMult*abyssSkillMultiplier(save.state,"explorationRewardRate"));
 const crystalRoll=defeated.reduce((sum,e)=>{const chance=e.boss?1:e.speciesId==="mimic"?1:e.gear?.25:.06;if(Math.random()<abyssExplorationChance(save.state,chance,null,{max:1}))return sum+(e.boss?20+Math.floor(e.level/10):e.speciesId==="mimic"?3+Math.floor(Math.random()*8):1);return sum},0);if(crystalRoll)save.state.player.crystals+=crystalRoll;
 const eliteAmountRate=abyssSkillEffectTotal(save.state,"eliteRewardRate")+abyssSkillEffectTotal(save.state,"explorationRewardRate");
 let eliteBonusGold=0,eliteBonusCrystals=0,eliteKeyDrop=false;for(const elite of eliteDefeated){const reward=eliteRewards(elite,floor);eliteBonusGold+=modifiedGoldReward(save.state,reward.gold,"elite");eliteBonusCrystals+=Math.max(0,Math.round(reward.crystals*(1+eliteAmountRate)));eliteKeyDrop=eliteKeyDrop||Math.random()<abyssExplorationChance(save.state,reward.keyChance,"abyssKeyDropRate",{max:.95});recordEliteDefeat(save.state,elite)}save.state.player.gold+=eliteBonusGold;save.state.player.crystals+=eliteBonusCrystals;
 const keyDrop=!suppressItemDrops&&(eliteKeyDrop||defeated.some(e=>!e.boss&&Math.random()<abyssExplorationChance(save.state,.002*currentDanger().keyRate,"abyssKeyDropRate",{max:.95}))||(firstBoss&&floor%50===0));
 if(keyDrop)save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+1;
 const fragmentDrops=[];
 for(const enemy of defeated.filter(entry=>entry.endgameBossId&&!entry.captured&&!entry.noItemDrops)){
  const bossData=ENDGAME_BOSSES[enemy.endgameBossId],chance=bossData?.faction==="tenGod"?.12:.18;
  if(!bossData||Math.random()>=chance)continue;
  const resultId=`roaming:${battle.battleId}:${bossData.id}`;
  const amount=awardEmergencyFragments(save.state,bossData.id,true,resultId,1);
  if(amount)fragmentDrops.push({boss:bossData,amount});
 }
 const survivors=battle.party.filter(monster=>monster.currentHp>0);
 const share=survivors.length?Math.floor(totalExp/survivors.length):0;
 let remainder=survivors.length?totalExp%survivors.length:0;

 const participationKills=defeated.filter(e=>!e.captured).length;
 const seriesMasteryResults=recordSeriesBattle(save.state,battle.party,null,{boss:!!boss,battleId:battle.battleId});
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
 if(!suppressItemDrops&&geared&&Math.random()<gearedDropChance){drop={...geared.gear,id:crypto.randomUUID?.()??`${Date.now()}-${Math.random()}`,equippedBy:null,createdAt:new Date().toISOString()};dropReceipt=equipmentReceipt(drop)}else if(!suppressItemDrops&&Math.random()<genericDropChance){const rarityRoll=Math.random(),rarity=rarityRoll<Math.min(.35,.04+rareBonus*.12+rarityLuck*.01)?"LR":rarityRoll<Math.min(.70,.18+rareBonus*.22+rarityLuck*.04)?"SSR":rarityRoll<.60?"SR":undefined;drop=createEquipment(["weapon","armor","accessory"][Math.floor(Math.random()*3)],rarity?{rarity}:undefined);dropReceipt=equipmentReceipt(drop)}

 if(boss&&!memoryBattle&&snapshot?.world){
  const defeatedBossPosition=snapshot.world.boss;
  if(defeatedBossPosition)snapshot.world.hotSpring={x:defeatedBossPosition.x,y:defeatedBossPosition.y,active:true,scale:5.9,radius:1.75,lastRecoveryAt:0,lastNoticeAt:0};
  snapshot.world.boss=null
 }
 syncPersistentAilments(battle);persistExpeditionSnapshot(snapshot,{saveNow:false});clearPartySynergy();clearBattleCheckpoint();
 activeEnemy=null;
 document.querySelector(".battle-screen")?.remove();

 const resultTitle=boss?"討伐":caught?"捕獲成功":"勝利",resultCaption=boss?"ボス撃破":caught?"契約成立":"戦闘勝利";
 const victorySubtitle=boss?`${String(boss.name??SPECIES[boss.speciesId]?.name??"BOSS").replace(/^⚔️\s*/,"")}を撃破`:caught?`${displayName(m)}と契約成立`:"探索戦闘を制圧";
 const result=`<div class="battle-result-cinematic ${boss?"boss-clear":""} ${caught?"capture-clear":""}">
  <div class="victory-particles" aria-hidden="true"></div><div class="victory-crest">${pixelIcon("crossed-swords")}</div>
  <small>戦闘結果</small><div class="victory-title"><span>${resultTitle}</span><em>${resultCaption}</em></div><div class="victory-subtitle">${victorySubtitle}</div>
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
  ${fragmentDrops.map(row=>`<p class="fragment-roaming-drop">${monsterVisual(row.boss.id,row.boss.icon,{className:"fragment-boss-visual"})}<b>${row.boss.name}の欠片 ×${row.amount}</b></p>`).join("")}
  ${suppressItemDrops?`<p class="muted"><b>顕現規則：アイテムドロップなし</b></p>`:""}
  ${caught?`<p>${pixelIcon("capture")} <b>${displayName(m)}を捕獲</b></p>`:""}
  ${firstBoss?`<p>${pixelIcon("event")} <b>初回ボス撃破ボーナス</b></p>`:""}
  ${seriesMasteryResults.length?`<div class="series-mastery-result">${seriesMasteryResults.map(row=>`<small>${row.leveled?`${pixelIcon("skills")} `:""}${EQUIPMENT_SERIES[row.seriesId]?.name??row.seriesId}熟練度 +${row.amount}${row.leveled?`　Lv.${row.after.level} ${row.after.label}へ！`:""}</small>`).join("")}</div>`:""}
 </div>
 <div class="exp-results compact result-party-grid">${progress.map(p=>{const hpMax=p.afterStats.hp,mpMax=maxMp(p.x),remaining=Math.max(0,p.need-p.x.exp),diff=k=>p.afterStats[k]-(p.before.stats[k]??0);return`<div class="${p.alive?"":"exp-defeated"} ${p.levels?"level-up-card level-up-reveal":""}">${p.levels?`<strong class="result-level-up-badge">LEVEL UP +${p.levels}</strong>`:""}<span>${monsterVisual(p.x,SPECIES[p.x.speciesId].emoji,{frame:p.alive?"idle":"down",className:"battle-result-monster-visual"})}</span><section><b>${displayName(p.x)} ${p.levels?`Lv.${p.before.level} → ${p.x.level}`:`Lv.${p.x.level}`}</b><div class="result-vitals"><small>HP ${p.x.currentHp}/${hpMax}</small><small>MP ${p.x.currentMp}/${mpMax}</small><small>${p.alive?`あと${remaining}EXP`:"戦闘不能・EXP 0"}</small></div><i class="result-exp"><u style="width:${Math.min(100,p.x.exp/Math.max(1,p.need)*100)}%"></u></i>${p.levels?`<div class="level-gains"><span>HP <strong>+${diff("hp")}</strong></span><span>ATK <strong>+${diff("atk")}</strong></span><span>DEF <strong>+${diff("def")}</strong></span><span>SPD <strong>+${diff("spd")}</strong></span></div>`:""}</section></div>`}).join("")}</div>`;

 if(boss&&!memoryBattle){battle.enemy=boss;save.state.player.bossKills[floor]=(save.state.player.bossKills[floor]??0)+1;if(floor===1000)mark1000FloorCleared(save.state);if(floor===WORLD_MAX_FLOOR)mark10000FloorCleared(save.state);recordBiomeBoss(save.state,floor);if(snapshot?.world)snapshot.world.boss=null;persistExpeditionSnapshot(snapshot);if(firstBoss){if(suppressItemDrops){save.state.player.bossRewards[floor]="NO_ITEM_DROP";save.save()}else return showBossRewards(result,contributionSnapshot)}}
 const playEnding=Boolean(!memoryBattle&&boss&&floor===1000&&!save.state.flags?.ending1000Played),playTrueEnding=Boolean(!memoryBattle&&boss&&floor===WORLD_MAX_FLOOR&&!save.state.flags?.ending10000Played);
 app.insertAdjacentHTML("beforeend",Modal(caught?"捕獲成功！":"戦闘結果",result,memoryBattle?"拠点へ戻る":"探索を続ける"));
 const resultModal=topModal(),resumeExplorationAuto=Boolean(battle.explorationAuto&&!memoryBattle);let resultClosed=false,autoResultTimer=null;resultModal.hidden=true;
 const returnToExplore=()=>{if(resultClosed)return;resultClosed=true;resultModal?.remove();battle=null;if(playEnding){play1000EndingSequence();return}if(playTrueEnding){play10000EndingSequence();return}screen=memoryBattle?"home":"explore";render()};
 resultModal._onDismiss=returnToExplore;
 resultModal.querySelector("[data-modal-primary]").onclick=()=>{if(autoResultTimer)clearTimeout(autoResultTimer);returnToExplore()};
 const revealReward=()=>{resultModal.hidden=false;if(resumeExplorationAuto)autoResultTimer=setTimeout(returnToExplore,1000)};
 openBattleContributionReport(contributionSnapshot,revealReward,{auto:resumeExplorationAuto});
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
 item.level=equipmentDropLevelForFloor(floor,{boss:true});item.obtainedFloor=floor;item.obtainedMethod="bossReward";
 return item
}
function dedicatedFloorBossEquipment(floor,boss,piece="weapon"){
 const definition=floorBossDefinitionForFloor(floor);if(!definition||boss?.floorBossCatalogId!==definition.id)return null;
 const design=floorBossEquipmentDesignByPiece(definition.id,piece);if(!design)return null;
 const slot=design.slot??piece,pool=slot==="weapon"?EQUIPMENT_BASES.weapon.filter(base=>design.weaponType?base.weaponType===design.weaponType:true):EQUIPMENT_BASES[slot],base=randomFrom(pool.length?pool:EQUIPMENT_BASES[slot]),item=createEquipment(slot,{rarity:"神話",base,weaponType:design.weaponType,ruleOverrides:{floorBossDedicated:true,floorBossPiece:piece,bossCatalogId:definition.id,cycleFloor:definition.cycleFloor,subslot:design.subslot??undefined,preferredSubslot:design.subslot??undefined}});
 item.name=`${design.name}${floor!==definition.cycleFloor?`〈${floor}F〉`:""}`;
 for(const[key,value]of Object.entries(design.stats??{})){const current=Number(item.stats?.[key])||0,addition=Number(value)||0;item.stats[key]=current+addition}
 item.series=null;item.level=equipmentDropLevelForFloor(floor,{boss:true});item.plus=Math.min(10,Math.floor(floor/1000));item.obtainedFloor=floor;item.obtainedMethod="floorBossDedicated";normalizeFloorBossDedicatedItem(item);
 return item
}
function dedicatedFloorBossWeapon(floor,boss){return dedicatedFloorBossEquipment(floor,boss,"weapon")}
function floorBossExplorationPack(floor){
 const depth=Math.max(1,Math.floor(Number(floor)||1)),experience=bossExperiencePackReward(depth),gold=Math.max(30000,Math.round((25000+depth*400)/1000)*1000),keys=Math.min(5,1+Math.floor(depth/250)),captureCrystals=Math.min(60,8+Math.ceil(depth/25)),heals=Math.min(6,2+Math.floor(depth/250)),mana=Math.min(4,1+Math.floor(depth/400)),reviveLeaves=Math.min(2,1+Math.floor(depth/750)),experienceAmount=Math.max(2,experience.amount+1);
 return{id:`exploration-pack-${depth}`,type:"explorationPack",icon:"chest",gold,keys,captureCrystals,heals,mana,reviveLeaves,experienceAmount,packTier:experience.tier,inventoryKey:experience.inventoryKey,experienceName:experience.name,title:"豪華探検パック",desc:`${gold.toLocaleString()}G・深淵の鍵×${keys}・捕獲結晶×${captureCrystals}・${experience.name}×${experienceAmount}・上級HP薬×${heals}・上級MP薬×${mana}・命の葉×${reviveLeaves}`};
}
function createBossRewardOptions(floor,boss){
 const gold=Math.max(300000,Math.round((floor+50)*9000*(.9+Math.random()*.35)/1000)*1000),crystals=Math.max(120,Math.round((90+floor*2.2)/10)*10),keys=Math.max(1,Math.min(5,1+Math.floor(floor/1200))),captureCrystals=Math.max(3,Math.min(50,3+Math.floor(floor/120))),experience=bossExperiencePackReward(floor);
 const pool=[
  {id:`gold-${floor}`,type:"gold",icon:"coin",amount:gold,title:`潤沢なGOLD ${gold.toLocaleString()}G`,desc:"深淵ツリー・装備厳選へ回せる大量資金"},
  {id:`crystal-${floor}`,type:"crystal",icon:"crystal",amount:crystals,title:`魔晶石 ×${crystals.toLocaleString()}`,desc:"召喚・育成・記憶再戦に使える希少資源"},
  {id:`experience-${floor}`,type:"experience",icon:"skills",amount:experience.amount,packTier:experience.tier,inventoryKey:experience.inventoryKey,title:`${experience.name} ×${experience.amount}`,desc:`N標準で合計約${experience.levelSpan*experience.amount}Lv分。好きな仲間へ使用可能`},
  {id:`treasure-${floor}`,type:"treasure",icon:"chest",keys,captureCrystals,title:"宝箱探索セット",desc:`深淵の鍵×${keys}・捕獲結晶×${captureCrystals}`}
 ];
 const pieces=["weapon","armor","accessory"],piece=pieces[Math.floor(Math.random()*pieces.length)],dedicated=dedicatedFloorBossEquipment(floor,boss,piece);
 if(dedicated){const partLabel={weapon:"武器",armor:"防具",accessory:"アクセ"}[piece],bossName=String(boss?.name??floorBossDefinitionForFloor(floor)?.name??"階層支配者").replace(/^⚔️\s*/,""),diamondAmount=Math.max(200,Math.round((150+Math.max(1,Number(floor)||1)*3.2)/10)*10),equipment={id:`dedicated-${piece}-${floor}`,type:"equipment",icon:"equipment",item:dedicated,title:`専用${partLabel} [神話] ${dedicated.name}`,desc:`3種から抽選された${bossName}の固有${partLabel}・装備Lv.${dedicated.level}`},pack=floorBossExplorationPack(floor),diamond={id:`floor-boss-crystal-${floor}`,type:"crystal",icon:"crystal",amount:diamondAmount,title:`魔晶石 ×${diamondAmount.toLocaleString()}`,desc:"装備を見送る代わりに、召喚・育成へ回せる増量資源"};return[equipment,pack,diamond]}
 return pool.map(value=>({value,sort:Math.random()})).sort((a,b)=>a.sort-b.sort).slice(0,3).map(entry=>entry.value)
}
function bossRewardIcon(option){return`<span class="boss-reward-icon">${pixelIcon(option.icon)}</span>`}
function awardBossReward(option){
 if(option.type==="equipment")receiveEquipment(save.state,option.item,{bossReward:true});
 if(option.type==="gold")save.state.player.gold+=option.amount;
 if(option.type==="crystal")save.state.player.crystals+=option.amount;
 if(option.type==="experience"){const key=option.inventoryKey??experiencePackType(option.packTier).inventoryKey;save.state.inventory[key]=(save.state.inventory[key]??0)+Math.max(1,Number(option.amount)||1)}
 if(option.type==="treasure"){save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+(option.keys??1);save.state.inventory.captureCrystals=(save.state.inventory.captureCrystals??0)+(option.captureCrystals??3)}
 if(option.type==="explorationPack"){
  save.state.player.gold+=Math.max(0,Number(option.gold)||0);
  save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+Math.max(0,Number(option.keys)||0);
  save.state.inventory.captureCrystals=(save.state.inventory.captureCrystals??0)+Math.max(0,Number(option.captureCrystals)||0);
  save.state.inventory[option.inventoryKey??experiencePackType(option.packTier).inventoryKey]=(save.state.inventory[option.inventoryKey??experiencePackType(option.packTier).inventoryKey]??0)+Math.max(1,Number(option.experienceAmount)||1);
  save.state.inventory.highPotions=(save.state.inventory.highPotions??0)+Math.max(0,Number(option.heals)||0);
  save.state.inventory.highManaPotions=(save.state.inventory.highManaPotions??0)+Math.max(0,Number(option.mana)||0);
  save.state.inventory.reviveLeaves=(save.state.inventory.reviveLeaves??0)+Math.max(0,Number(option.reviveLeaves)||0);
 }
 if(option.type==="supply"){
  save.state.inventory.experienceItems=(save.state.inventory.experienceItems??0)+(option.expItems??0);
  save.state.inventory.highPotions=(save.state.inventory.highPotions??0)+option.heals;
  save.state.inventory.abyssKeys=(save.state.inventory.abyssKeys??0)+option.keys
 }
}
function openBossRewardModal(floor,result=""){
 const pending=save.state.player.pendingBossRewards?.[floor];if(!pending?.options?.length)return false;
 app.insertAdjacentHTML("beforeend",`<div class="game-modal boss-reward-modal"><div class="game-modal-card boss-reward">${result?`<div class="boss-reward-result">${result}</div>`:""}<div class="boss-clear-emblem">${pixelIcon("event")}</div><small class="boss-choice-kicker">ABYSS TREASURE・${floor}F</small><h2 class="boss-choice-title">初回撃破報酬を選択</h2><p class="muted">この階で受け取れるのは初回撃破時のひとつだけ。選択前の更新では保留されます。</p><div class="boss-reward-grid">${pending.options.map((option,index)=>`<button data-boss-reward="${option.id}"><i>CHOICE ${index+1}</i>${bossRewardIcon(option)}<b>${option.title}</b><small>${option.desc}</small></button>`).join("")}</div></div></div>`);
 const modal=topModal(),claim=(button,{automatic=false}={})=>{
  const option=pending.options.find(entry=>entry.id===button.dataset.bossReward);if(!option)return;
  if(!automatic&&!confirm(`${option.title}を選びますか？\nこの階の他の報酬は失われます。`))return;
  awardBossReward(option);
  const playEnding=floor===1000&&!save.state.flags?.ending1000Played,playTrueEnding=floor===WORLD_MAX_FLOOR&&!save.state.flags?.ending10000Played;
  save.state.player.bossRewards[floor]=option.id;
  delete save.state.player.pendingBossRewards[floor];
  save.save();modal.remove();battle=null;
  if(playEnding){play1000EndingSequence();return}
  if(playTrueEnding){play10000EndingSequence();return}
  screen=save.state.player.inRun?"explore":"home";render()
 };
 modal.querySelectorAll("[data-boss-reward]").forEach(button=>button.onclick=()=>claim(button));
 if(exploreAutoActive()){
  const autoClaim=()=>{if(!modal.isConnected||!exploreAutoActive())return;if(modal.hidden)return setTimeout(autoClaim,180);const preferred=["crystal","explorationPack","equipment","gold","treasure","experience"].map(type=>pending.options.find(option=>option.type===type)).find(Boolean),button=preferred&&modal.querySelector(`[data-boss-reward="${preferred.id}"]`);if(button)claim(button,{automatic:true})};
  setTimeout(autoClaim,420);
 }
 return true
}
function showBossRewards(result,contributionSnapshot=null){
 const floor=save.state.player.currentFloor,boss=battle.enemy;
 save.state.player.pendingBossRewards??={};
 const definition=floorBossDefinitionForFloor(floor),format=definition&&boss.floorBossCatalogId===definition.id?"build194-floor-boss-three-choice":"legacy";
 if(!save.state.player.pendingBossRewards[floor]||format!=="legacy"&&save.state.player.pendingBossRewards[floor].rewardFormat!==format)save.state.player.pendingBossRewards[floor]={floor,speciesId:boss.speciesId,rewardFormat:format,createdAt:new Date().toISOString(),options:createBossRewardOptions(floor,boss)};
 save.save();openBossRewardModal(floor,result);const rewardModal=topModal();if(contributionSnapshot&&rewardModal){rewardModal.hidden=true;openBattleContributionReport(contributionSnapshot,()=>{rewardModal.hidden=false},{auto:Boolean(battle?.explorationAuto)})}
}
function resumePendingBossReward(){
 if(document.querySelector(".game-modal,.battle-screen"))return;
 const entries=Object.entries(save.state.player.pendingBossRewards??{}).filter(([floor,reward])=>reward?.options?.length&&!save.state.player.bossRewards?.[floor]);
 if(!entries.length)return;
 entries.sort((a,b)=>Number(b[0])-Number(a[0]));
 const[floorKey,pending]=entries[0],floor=Number(floorKey),definition=floorBossDefinitionForFloor(floor);if(definition&&pending.rewardFormat!=="build194-floor-boss-three-choice"){const boss={speciesId:pending.speciesId??definition.speciesId,name:definition.name,floorBossCatalogId:definition.id};save.state.player.pendingBossRewards[floor]={floor,speciesId:boss.speciesId,rewardFormat:"build194-floor-boss-three-choice",createdAt:pending.createdAt??new Date().toISOString(),options:createBossRewardOptions(floor,boss)};save.save()}
 openBossRewardModal(floor)
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
 clearPartySynergy();stopExploreAuto("AUTO停止：部隊が全滅しました");cancelPendingExploreActions();const lossCap=Math.max(100,goldForClearedFloor(save.state.player.currentFloor)),lost=Math.min(Math.floor(save.state.player.gold*.10),lossCap),guide=contextualGuideState();bumpGuideCounter(guide,"defeats");setGuidePending(guide,"bedRecovery",true);save.state.player.gold-=lost;save.state.player.currentFloor=save.state.player.checkpoint;save.state.player.inRun=false;abandonManualExpedition(save.state);
 syncPersistentAilments(battle);battle.party.forEach(m=>{m.currentHp=1;m.currentMp=0;m.history??={};m.history.defeats=(m.history.defeats??0)+1;m.history.consecutiveDeployments=0});delete save.state.expeditionAffectionDeaths;clearExpeditionSnapshot();clearBattleCheckpoint();snapshot=null;document.querySelector(".battle-screen")?.remove();
 save.save();app.insertAdjacentHTML("beforeend",Modal("敗北",`<div class="defeat-cinematic"><div class="defeat-mark">☠</div><h2>深淵に敗れた…</h2><p><b>${lost}G</b>を失い、${save.state.player.checkpoint}Fの拠点へ帰還します。</p><small>仲間はHP1で救出されました。拠点の寝台で回復できます。</small></div>`,"拠点へ戻る"));
 const modal=topModal(),returnHome=()=>{modal?.remove();battle=null;go("home")};modal._onDismiss=returnHome;modal.querySelector("[data-modal-primary]").onclick=returnHome
}
normalizeEquipmentState();
if(save.state.player.inRun&&!save.state.activeBattle)screen="explore";
else if(!save.state.activeBattle){
 try{
  const invite=new URLSearchParams(location.search),server=invite.get("partyServer"),room=invite.get("partyRoom"),inviteKey=server&&room?`${server}|${room}`:"",lastInvite=sessionStorage.getItem(INVITE_SESSION_KEY)??"",restored=sessionStorage.getItem(SCREEN_SESSION_KEY);
  // 同じ招待URLのままホームへ戻って更新しても、古いqueryでオンラインへ
  // 引き戻さない。別の招待URLを明示的に開いた時だけ招待を優先する。
  if(inviteKey&&inviteKey!==lastInvite){screen="onlineParty";sessionStorage.setItem(INVITE_SESSION_KEY,inviteKey)}
  else if(restored&&REFRESHABLE_SCREENS.has(restored))screen=restored;
 }catch{}
}
const resumedSavedBattle=resumeSavedBattle();
if(!resumedSavedBattle)render();
if(!resumedSavedBattle)setTimeout(()=>{if(!resumePendingEmergency())resumePendingBossReward()},180);
const skillRebalance=save.state.abyssSkillRebalance;
if(skillRebalance?.refund>0&&!skillRebalance.notifiedAt){
 skillRebalance.notifiedAt=new Date().toISOString();
 save.save();
 setTimeout(()=>showToast(`🪙 深淵ツリー価格差額 ${Number(skillRebalance.refund).toLocaleString()}Gを返還しました`),120);
}
