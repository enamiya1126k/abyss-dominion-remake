import{SaveService,normalizeRaidJuvenileContract}from"./services/SaveService.js?v=3.1.7-build326";
import{CONTENT_TEST_MODE,BATTLE_SPEED_OPTIONS,CAMERA_DRAG_THRESHOLD_PX,WATER_RULES,MONSTER_STAR_MAX,MONSTER_STORAGE_CAP,ENDGAME_MAX_LEVEL,premiumCrystalCost,normalizeBattleSpeed,contentUnlockFloor,isContentUnlocked}from"./core/config.js?v=3.1.7-build326";
import{AudioSystem}from"./core/AudioSystem.js?v=3.1.1-build311";
import{endgameCharacter}from"./data/endgameCharacters.js?v=3.1.1-build311";
import{SPECIES}from"./data/species.js?v=3.1.1-build314";
import{heroResonanceMembers,heroResonanceProfile,isHeroResonanceSpecies,scaleHeroResonanceSkill,heroPersonalPressure,HERO_INVINCIBLE_PRESSURE}from"./core/HeroResonanceSystem.js?v=3.1.1-build314";
import{currentExplorePerformanceProfile,shouldPaintExploreFrame}from"./core/ExplorePerformanceSystem.js?v=3.1.1-build315";
import{captureStatusBonus,normalizePersistentAilments}from"./data/statusEffects.js?v=3.1.1-build311";
import{attributeDamageMultiplier,attributeGuideRows,canonicalAttribute,compactAttributeChart,ATTRIBUTES,ATTRIBUTE_RELATIONS}from"./data/attributes.js?v=3.1.1-build311";
import{orderedMonsterSpecies}from"./data/monsterCatalog.js?v=3.1.1-build311";
import{HomeScreen,homePartySlots}from"./ui/screens/HomeScreen.js?v=3.1.7-build326";
import{CampaignIntelScreen}from"./ui/screens/CampaignIntelScreen.js?v=3.1.7-build326";
import{createCampaignInvasionIntelModel}from"./core/CampaignInvasionIntelSystem.js?v=3.1.7-build326";
import{StoryArchiveScreen}from"./ui/screens/StoryArchiveScreen.js?v=3.1.5-build324";
import{FormationScreen}from"./ui/screens/FormationScreen.js?v=3.1.1-build311";
import{OnlinePartyScreen,ONLINE_STORAGE_KEYS}from"./ui/screens/OnlinePartyScreen.js?v=3.1.1-build311";
import{OnlinePartyController,resetCurrentWeeklyRaidForFullReset}from"./online/OnlinePartyClient.js?v=3.1.1-build317";
import{reconcileOnlineMotion,onlineMotionSpeed}from"./online/OnlineMovement.js?v=3.1.1-build311";
import{beginGuestProgressIsolation,finishGuestProgressIsolation,onlineProgressionAllowed,legacyProgressRecoveryCandidate,applyLegacyProgressRecovery,dismissLegacyProgressRecovery,undoLegacyProgressRecovery}from"./online/OnlineProgressIsolation.js?v=3.1.1-build311";
import{MonsterListScreen}from"./ui/screens/MonsterListScreen.js?v=3.1.1-build311";
import{MonsterDetailScreen}from"./ui/screens/MonsterDetailScreen.js?v=3.1.1-build311";
import{SettingsScreen}from"./ui/screens/SettingsScreen.js?v=3.1.1-build311";
import{ExploreScreen}from"./ui/screens/ExploreScreen.js?v=3.1.1-build311";
import{CampaignFinalFloorScreen}from"./ui/screens/CampaignFinalFloorScreen.js?v=3.1.1-build320";
import{GauntletScreen}from"./ui/screens/GauntletScreen.js?v=3.1.1-build311";
import{BattleScreen}from"./ui/screens/BattleScreen.js?v=3.1.6-build325";
import{Modal}from"./ui/components/Modal.js?v=3.1.1-build311";
import{pixelIcon}from"./ui/components/GameChrome.js?v=3.1.1-build311";
import{equipmentVisual}from"./ui/components/EquipmentVisual.js?v=3.1.1-build311";
import{attributeCycleVisual,attributeVisual}from"./ui/components/AttributeVisual.js?v=3.1.1-build311";
import{createMonster,displayName,calculatedStats,TRAITS,expNeedFor,experienceCrystalValue,limitBreakGrowth,affectionBonuses,totalExperience,applyTotalExperience}from"./models/Monster.js?v=3.1.1-build311";
import{EXPERIENCE_PACK_TYPES,experiencePackType,availableExperiencePackTypes,consumeExperiencePacks,experiencePackCapacity,previewExperiencePacks}from"./core/ExperiencePackSystem.js?v=3.1.1-build311";
import{createEquipment,equipmentPower,equipmentStatMultiplier,equipmentRequiredMonsterLevel}from"./models/Equipment.js?v=3.1.1-build311";
import{equipmentExpNeed,equipmentMaterialExp,enhancementMaterialCandidates,consumeEquipmentMaterials,projectEquipmentGrowth}from"./services/EquipmentEnhancement.js?v=3.1.1-build311";
import{recordWeaponKill,weaponMasteryDamageMultiplier,weaponMasterySummary}from"./services/WeaponMastery.js?v=3.1.1-build311";
import{normalizeSeriesMastery,recordSeriesBattle,seriesMasteryBonusForMonster,seriesMasterySummary}from"./services/SeriesMastery.js?v=3.1.1-build311";
import{receiveEquipment,takeFromStorage,equipmentSellPrice,slotLabel}from"./services/EquipmentStorage.js?v=3.1.1-build311";
import{RARITY_ORDER,EQUIPMENT_BASES,equipmentDisplayRarity,equipmentRarityColor,equipmentStatLabel,equipmentSubslotLabel,compatibleSubslots,SLOT_UNLOCK_LEVEL}from"./data/equipment.js?v=3.1.1-build311";
import{EQUIPMENT_SERIES,aggregateSeriesEffects}from"./data/equipmentSeries.js?v=3.1.1-build311";
import{AFFIX_QUALITY,aggregateAffixes,affixQuality,formatAffix,affixDefinition}from"./data/equipmentAffixes.js?v=3.1.1-build311";
import{EquipmentScreen}from"./ui/screens/EquipmentScreen.js?v=3.1.1-build311";
import{initialAffixCount,lockedAffixCount,maxLockableAffixes,normalizeEquipmentAffixLocks,rerollGoldCost,rerollUnlockedAffixes,toggleAffixLock}from"./services/EquipmentAffixCrafting.js?v=3.1.1-build311";
import{assignEquipmentToSubslot,canEquipInSubslot,emptyEquipmentLoadout,normalizeEquipmentLoadouts}from"./services/EquipmentLoadoutSystem.js?v=3.1.1-build311";
import{ShopScreen}from"./ui/screens/ShopScreen.js?v=3.1.1-build311";
import{SkillScreen}from"./ui/screens/SkillScreen.js?v=3.1.1-build311";
import{AbyssSkillTreeScreen}from"./ui/screens/AbyssSkillTreeScreen.js?v=3.1.1-build316";
import{InventoryScreen,ArmoryScreen}from"./ui/screens/InventoryScreen.js?v=3.1.1-build311";
import{abyssEquipmentRarityBonus,abyssExplorationChance,abyssSkillEffectTotal,abyssSkillEffects,abyssSkillMultiplier,abyssSkillNodeById,abyssSkillTreeSummary,learnAbyssSkill}from"./core/AbyssSkillTreeSystem.js?v=3.1.1-build316";
import{Ending1000Screen}from"./ui/screens/Ending1000Screen.js?v=3.1.1-build311";
import{Ending10000Screen}from"./ui/screens/Ending10000Screen.js?v=3.1.1-build311";
import{SecondWorldIntroScreen}from"./ui/screens/SecondWorldIntroScreen.js?v=3.1.1-build311";
import{worldPresentationForFloor,shouldPlaySecondWorldIntro,markSecondWorldEntered}from"./core/WorldSystem.js?v=3.1.1-build311";
import{randomEventForFloor,markRandomEventResolved,randomEventCosts}from"./core/SecondWorldEventSystem.js?v=3.1.1-build311";
import{shouldSpawnSecondWorldElite,createEliteEncounter,applyEliteModifiers,recordEliteEncounter,recordEliteDefeat,eliteRewards}from"./core/SecondWorldEliteSystem.js?v=3.1.1-build311";
import{shouldPlayTenGodFirstContact,tenGodContactChoices,resolveTenGodFirstContact}from"./core/TenGodContactSystem.js?v=3.1.1-build311";
import{TenGodContactScreen}from"./ui/screens/TenGodContactScreen.js?v=3.1.1-build311";
import{maxMp,learnedSkills,allLearnedSkills,equipSkill,skillById,skillElementLabel,canUseSkill,effectiveSkillMpCost,skillMpCostBreakdown,skillDamage,affixOutgoingDamageMultiplier,chooseAutoBattleDecision,skillProgressFor,recordSkillUse,skillEffectSummary,skillCombatKeywords,applySkillMastery,recommendedSkills,recommendedSkillLoadout}from"./battle/SkillSystem.js?v=3.1.1-build311";
import{ENEMY_ACTIONS,createEnemyBattleState,chooseEnemyAction,enemyActionMpCost,enemyDamageMultiplier,enemyDamageAfterDefense,enemyHealAmount,enemyAttackMultiplier,specialActionMultiplier,specialActionInfo}from"./battle/EnemyAI.js?v=3.1.1-build316";
import{createBattleRulesState,cooldownRemaining,setSkillCooldown,tickCooldowns,addBattleLog,applyEnemyStatus,applyEnemyDamage,processEnemyStatuses,applyBattleEffect,effectStackBreakdown,effectValue,hasEffect,clearNegativeAllyEffects,clearPersistentAilments,syncPersistentAilments,tickBattleEffects,processAllyEffects}from"./battle/BattleRules.js?v=3.1.1-build311";
import{attackHits}from"./battle/HitSystem.js?v=3.1.1-build311";
import{buildTurnQueue,currentTurnEntry,currentAlly,currentEnemy,aliveEnemies,selectedEnemy,advanceQueue,queueFinished,skipInvalidEntries}from"./battle/TurnSystem.js?v=3.1.1-build311";
import{dangerConfig}from"./core/DangerSystem.js?v=3.1.1-build311";
import{bossLevelForFloor,enemyLevelForFloor as scaledEnemyLevelForFloor,enemyHiddenProfileForFloor,enemyEquipmentLevelForFloor,equipmentHolderRateForFloor,equipmentSlotsForFloor,rollEnemyEquipmentRarity}from"./core/EnemyScalingSystem.js?v=3.1.1-build311";
import{MAGIC_CIRCLES,equippedMagicCircle,magicCircleLevel,magicCirclePrice,magicCircleNextEffect,buyOrUpgradeMagicCircle,equipMagicCircle,magicCircleOwner,magicCircleMarkup,rollEnemyMagicCircle,enemyMagicCircleMarkup,slotDamageMultiplier,createMagicCircleInstance,goldPowerDamageMultiplier,goldPowerActionCost,magicCircleLevelEffect,magicCircleProgressionStatus}from"./core/MagicCircleSystem.js?v=3.1.2-build321";
import{biomeForFloor,battleEnvironmentForFloor,biomeProgress,recordBiomeFloor,recordBiomeEncounter,recordBiomeChest,recordBiomeBoss}from"./data/biomes.js?v=3.1.1-build311";
import{recordEncounterHistory,rollAttributeEncounterGroup}from"./core/EncounterPoolSystem.js?v=3.1.1-build311";
import{dungeonThemeForFloor,dungeonThemeForAttribute}from"./data/dungeonThemes.js?v=3.1.1-build311";
import{WORLD_MAX_FLOOR,TEAM_BATTLE_UNLOCK_FLOOR,GAUNTLET_UNLOCK_FLOOR,EMERGENCY_UNLOCK_FLOOR,ENDGAME_TRIAL_BATTLE_COUNT,ENDGAME_BOSSES,ENDGAME_TRIALS,normalizeEndgameState,dailyTeamAttempts,dailyGauntletAttempts,teamBattleDayKey,createTeamBattleEncounter,createEndgameTrialEncounter,recordEndgameTrialResult,recordTeamBattleResult,teamBattleRewardEntitlements,safeCurrencyGrant,shouldTriggerEmergency,createEmergencyEncounter,recordEmergencyResult,awardEmergencyFragments,emergencyFragmentStatus,endgameContractStatus,craftEndgameEquipment,endgamePreludeOptions,resolveEndgamePrelude,applyPreludeToEncounter,attemptEndgameContract,specialBattleSettlement,recordSpecialBattleSettlement,hasCleared1000,mark1000FloorCleared,mark10000FloorCleared,worldRegionForFloor,endgameFactionStatMultiplier,manualEndgameChallengeStatus,manualEndgameTierStatus,consumeManualEndgameChallenge,recordManualEndgameClear,teamBattleRewardPreview}from"./core/EndgameSystem.js?v=3.1.1-build316";
import{balanceTeamBattleEnemies}from"./core/TeamBattleBalanceSystem.js?v=3.1.1-build316";
import{NORMAL_SUMMON_RATES,GUARANTEED_SUMMON_RATES,GACHA_PITY_LIMITS,rollSummonRarity,rollSummonRarityWithPity,normalizeGachaPityState,normalizeGachaDrawHistory,selectBalancedGachaEntry,recordGachaDraw}from"./core/GachaBalanceSystem.js?v=3.1.1-build311";
import{CAMPAIGN_MAX_FLOOR,CAMPAIGN_KEYS_PER_FLOOR,HERO_PARTY_IDS,campaignFloorToLegacyFloor,campaignFloorState,campaignBossProgress,campaignBossProgressList,campaignDefeatedBossIds,campaignKeysHeld,beginCampaignFloorRun,beginCampaignFloorReplay,collectCampaignKey,defeatCampaignBoss,trophyChestEntitlements,claimTrophyChest,roomCountForRandom,roomAttributesForFloor,campaignRoomProfile,campaignEndingForResult,recordCampaignEnding,normalizeCampaignState,floorBossCampaignDisplayFloor,campaignMilestoneBossIds,isCampaignMultiBossFloor}from"./core/Campaign100System.js?v=3.1.1-build319";
import{CAMPAIGN_STORY_OPENING_ID,acknowledgeCampaignStoryScene,nextCampaignStoryScene,campaignHeroVoiceLine,campaignHeroFinalVoiceLines}from"./core/CampaignStorySystem.js?v=3.1.3-build322";
import{isLionelAvatar,lionelAvatarProtectionReason}from"./core/CampaignProtagonistSystem.js?v=3.1.3-build322";
import{CAMPAIGN_HERO_IDS,CAMPAIGN_HERO_PROFILES,normalizeCampaignHeroInvasion,scheduledCampaignHeroForFloor,beginCampaignHeroFieldEncounter,recordCampaignHeroWound,settleCampaignHeroEncounter,campaignRemainingHeroes,advanceCampaignRewindFloor}from"./core/CampaignHeroEncounterSystem.js?v=3.1.5-build324";
import{nextCampaignHeroBranchStoryScene,acknowledgeCampaignHeroBranchStoryScene,queueCampaignHeroAftermathStories}from"./core/CampaignHeroBranchStorySystem.js?v=3.1.5-build324";
import{createCampaignStoryArchiveModel,recordCampaignStoryArchiveScene}from"./core/CampaignStoryArchiveSystem.js?v=3.1.5-build324";
import{normalizeCampaignReincarnationState,campaignCanonicalEnding,recordCampaignConclusion,beginOptionalCampaignReincarnation,campaignReincarnationDifficultyMultiplier,campaignReincarnationRewardMultiplier,campaignReincarnationFloorLimit,recordCampaignReincarnationFloor}from"./core/CampaignReincarnationSystem.js?v=3.1.5-build324";
import{campaignTrophyFragmentAwards}from"./core/CampaignRewardSystem.js?v=3.1.1-build311";
import{bossRewardIdentity,bossRewardEquipmentIdentity,bossFragmentVisualIdentity}from"./core/BossRewardMappingSystem.js?v=3.1.1-build311";
import{campaignBossChestReward}from"./core/CampaignBossRewardSystem.js?v=3.1.1-build311";
import{generateSectionDungeon,sectionIdAt,sectionRoute,portalTowardSection,sectionBounds,safeSectionExitCandidates,chooseSafeSectionExitCell}from"./core/DungeonSectionSystem.js?v=3.1.1-build318";
import{requiredCampaignBossSectionCount,shouldRegenerateCampaignBossSnapshot}from"./core/CampaignBossWorldSystem.js?v=3.1.1-build311";
import{buildSectionMiniMapModel,fitMiniMapTransform,projectMiniMapPoint}from"./core/DungeonMiniMapSystem.js?v=3.1.1-build311";
import{beginManualExpedition,recordManualFloorClear,claimManualReturn,abandonManualExpedition,idleReturnPreview,claimIdleReturn,returnRarityRates,returnRewardGrade,goldForClearedFloor}from"./core/ReturnRewardSystem.js?v=3.1.1-build311";
import{modifiedGoldReward}from"./core/GoldRewardSystem.js?v=3.1.1-build311";
import{battleGoldBase,chestGoldBase,secondWorldEventGoldBase,specialBattleGoldBase}from"./core/GoldEconomySystem.js?v=3.1.1-build311";
import{monsterCombatPower,partyCombatPower,partyCombatPowerBreakdown,formatCombatPower,recordPartyCombatPower}from"./core/CombatPower.js?v=3.1.1-build311";
import{beginSecretRoomExpedition,ensureSecretRoomExpedition,secretRoomPlan,enterSecretRoom,activeSecretRoom,spinSecretRoomCasino,casinoBetLimit,useSecretRoomInn,buyDarkMarketOffer,buyDarkMarketRecovery,isDarkMarketBargain,SECRET_ROOM_RECOVERY_ITEMS,DARK_MARKET_ITEM_LIMIT,CASINO_CRYSTAL_COST,CASINO_MULTIPLIER_RATES}from"./core/SecretRoomSystem.js?v=3.1.1-build311";
import{applyGameMasterReward,applySerialReward,commitSerialRedemption,validateGameMasterCode,validateSerialCode}from"./core/SerialCodeSystem.js?v=3.1.1-build314";
import{runConfirmedFullReset}from"./core/FullResetSystem.js?v=3.1.1-build311";
import{DAILY_NOTICE_GIFT,activeNoticeDefinitions,setServerMaintenanceState,markNoticeRead,normalizeNoticeState,dailyNoticeGiftStatus,claimDailyNoticeGift,noticeAttentionCount,pendingNoticeRewards,claimNoticeReward,enqueueNoticeReward}from"./core/NoticeSystem.js?v=3.1.1-build317";
import{COMPLETE_MONSTER_CODEX,codexCollectionSummary,syncCollectionRewardInbox,rewardDescription}from"./core/CollectionRewardSystem.js?v=3.1.1-build316";
import{achievementSummary,syncAchievementRewardInbox,achievementIconKeyForId}from"./core/AchievementRewardSystem.js?v=3.1.1-build316";
import{CONTEXT_GUIDE_STEPS,completeGuideStep,normalizeContextualGuide,setGuidePending,guidePending,guideStepDone,bumpGuideCounter,snoozeGuideStep,guideStepSnoozed,resetContextualGuide,contextualGuideProgress}from"./core/ContextualGuideSystem.js?v=3.1.1-build311";
import{weekdayGachaSchedule,weekdayGachaCost,WEEKDAY_GACHA_CALENDAR,WEEKDAY_ENDGAME_RATE,rollWeekdayEndgameHit}from"./core/WeekdayGachaSystem.js?v=3.1.1-build311";
import{bossExperiencePackReward}from"./core/BossRewardSystem.js?v=3.1.1-build311";
import{enemyExperienceReward}from"./core/ProgressionSystem.js?v=3.1.1-build311";
import{treasureRoomRateForFloor,treasureRoomChestCount,shouldPlaceTreasureMimic,rollTreasureChestReward,mimicVictoryGold,mimicExperienceMultiplier,mimicVictoryCrystals}from"./core/TreasureSystem.js?v=3.1.1-build311";
import{FLOOR_BOSS_CATALOG,floorBossDefinitionForFloor,floorBossDefinitionById,floorBossEquipmentDesignByPiece,milestoneBossIdsForFloor}from"./data/floorBosses.js?v=3.1.1-build311";
import{FLOOR_BOSS_CONTRACT_COST,FLOOR_BOSS_EQUIPMENT_COST,normalizeFloorBossChallengeState,recordFloorBossDiscovery,floorBossChallengeStatus,createFloorBossChallengeEncounter,awardFloorBossChallengeFragments,spendFloorBossFragments,restoreFloorBossFragments}from"./core/FloorBossChallengeSystem.js?v=3.1.1-build311";
import{equipmentDropLevelForFloor}from"./core/EquipmentDropSystem.js?v=3.1.1-build311";
import{monsterSpriteUrl,monsterVisual,setMonsterVisualFrame}from"./ui/MonsterVisual.js?v=3.1.1-build311";
import{activeSignatureResonances,signatureSetState,signatureStatBonuses,signatureEquipmentOwnerId,signatureEquipmentOwnerName,signatureEquipmentMatchesMonster,signatureEligibleOwners,permanentSignatureOwners,rollPermanentSignatureHit,PERMANENT_SIGNATURE_RATE,createSignatureEquipment,normalizeSignatureWeaponItem,signatureWeaponGrantedSkill}from"./core/SignatureWeaponSystem.js?v=3.1.1-build311";

const TILE=88,COLS=39,ROWS=39,app=document.getElementById("app"),save=new SaveService(),audio=new AudioSystem(()=>save.state.settings);
if(typeof MutationObserver!=="undefined")new MutationObserver(()=>app.classList.toggle("battle-active",Boolean(app.querySelector(".battle-screen")))).observe(app,{childList:true});
const STANDARD_ENCOUNTER_SPECIES=Object.freeze(Object.values(SPECIES).filter(species=>species.id!=="baby_slime"));
let screen="home",selected=null,equipmentTarget=null,equipmentFocusItemId=null,skillTarget=null,skillSlotSelection=0,abyssSkillCategory="economy",inventoryCategory="all",inventorySort="rarity",storyArchiveCategory="prologue",storyArchiveModel=null,campaignIntelTab="map",campaignIntelLocationIndex=null,campaignIntelModel=null,game=null,battle=null,snapshot=null,activeEnemy=null,navigationOrigin="home",skillNavigationOrigin="home",inventoryNavigationOrigin="home",settingsNavigationOrigin="home",detailNavigationOrigin="monsters",formationOrigin="home",lastExploreCombatPower=null,battleBiomePanelTimer=null;

function floorBossWasDefeated(player,floor){
 const key=String(Math.max(1,Math.floor(Number(floor)||1))),hasOwn=(record)=>Object.prototype.hasOwnProperty.call(record??{},key);
 return Number(player?.bossKills?.[key]??0)>0||hasOwn(player?.bossRewards)||hasOwn(player?.pendingBossRewards)
}
function campaignBattleBossWasDefeated(state,floor,boss){
 const bossId=String(boss?.campaignBossId??boss?.endgameBossId??boss?.floorBossCatalogId??"");
 if(isCampaignMultiBossFloor(floor))return Boolean(campaignBossProgress(state,floor,bossId,{create:false})?.defeated);
 return floorBossWasDefeated(state?.player,floor)
}
function floorBossDisplayFloor(definition){return floorBossCampaignDisplayFloor(definition)??Math.max(1,Math.floor(Number(definition?.floor)||1))}
const SCREEN_SESSION_KEY="abyss-dominion:current-screen",INVITE_SESSION_KEY="abyss-dominion:last-party-invite",REFRESHABLE_SCREENS=new Set(["home","formation","onlineParty","monsters","settings","explore","campaignFinalFloor","gauntlet","equipment","shop","skills","abyssSkills","inventory","armory","storyArchive","campaignIntel"]);
let exploreActionGeneration=0,secretRoomAutoRunning=false;
let onlinePartyController=null,onlineSecretRoomContext=null,fullResetInFlight=false;
let homeServerStatus={state:"checking",label:"サーバー確認中",checkedAt:0};
let powerRankingUi={state:null,profile:null,selectedPlayerId:null,loadingList:false,loadingProfile:false,listTimedOut:false};
let powerRankingPublishTimer=null,powerRankingScheduledSignature="",powerRankingLastSignature="",powerRankingLastPublishedAt=0,powerRankingLastConnectAttempt=0;
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
 ["‼️","notice"],["‼","notice"],["↔️","formation"],["↔","formation"],["▶️","event"],["▶","event"],
 ["☺️","event"],["☺","event"],["♟️","event"],["♟","event"],["♛","event"],["✚","growth"],["♥️","growth"],["♥","growth"],
 ["🏆","event"],["👋","event"],["👍","event"],["👏","event"],["😄","event"],["👾","event"],["📭","notice"],
 ["📕","skills"],["📗","skills"],["📘","skills"],["📙","skills"],
 ["⚪","attribute-neutral"],["🔥","attribute-fire"],["💧","attribute-water"],["🌊","attribute-water"],
 ["❄️","attribute-ice"],["❄","attribute-ice"],["⚡","attribute-lightning"],["🪨","attribute-earth"],
 ["🌪️","attribute-wind"],["🌪","attribute-wind"],["✨","attribute-light"],["🌑","attribute-dark"],["🌘","attribute-dark"],
 ["☠️","attribute-poison"],["☠","attribute-poison"],["🌿","attribute-nature"]
]);
const UI_EMOJI_TOKENS=[...UI_EMOJI_ICONS.keys()].sort((a,b)=>b.length-a.length);
// Known symbols use their semantic pixel icon. This final cluster matcher
// keeps future copy from leaking platform emoji into the pixel-art UI.
const UI_EMOJI_PATTERN=/(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?)*)/u;
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
  if(!parent||parent.closest("script,style,textarea,input,[data-keep-emoji]")||!UI_EMOJI_TOKENS.some(token=>text.includes(token))&&!UI_EMOJI_PATTERN.test(text))continue;
  const fragment=document.createDocumentFragment();
  let cursor=0;
  while(cursor<text.length){
   const token=UI_EMOJI_TOKENS.find(entry=>text.startsWith(entry,cursor));
   if(token){fragment.append(pixelIconElement(UI_EMOJI_ICONS.get(token)));cursor+=token.length;continue}
   const emoji=text.slice(cursor).match(UI_EMOJI_PATTERN);
   if(emoji?.index===0){fragment.append(pixelIconElement("event"));cursor+=emoji[0].length;continue}
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
function showExploreNotice(text,tone="normal",{live=false}={}){document.querySelector(".explore-notice-mini")?.remove();const el=document.createElement("div");el.className=`explore-notice-mini ${tone}`;el.textContent=text;if(live){el.setAttribute("role","status");el.setAttribute("aria-live",tone==="warning"?"assertive":"polite");el.setAttribute("aria-atomic","true")}document.body.appendChild(el);setTimeout(()=>el.remove(),1050)}
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
 const guide=contextualGuideState();if(guide.disabled||campaignStoryPresenting||nextCampaignStoryScene(save.state)||document.querySelector(".context-guide,.game-modal,.campaign-story-modal,.battle-screen"))return;
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
class Entity{constructor(x,y){this.x=x;this.y=y;this.rx=x;this.ry=y;this.path=[];this.p=0}setPath(p){this.path=p;this.p=0}move(dt,s){if(!this.path.length)return false;const t=this.path[0];this.p+=dt*s;const n=Math.min(1,this.p);this.rx=this.x+(t.x-this.x)*n;this.ry=this.y+(t.y-this.y)*n;if(this.p>=1){this.x=t.x;this.y=t.y;this.rx=this.x;this.ry=this.y;this.path.shift();this.p=0;return true}return false}}
class Camera{constructor(c){this.c=c;this.x=TILE;this.y=TILE;this.z=.85;this.ox=0;this.oy=0;this.manual=false}world(wx,wy){return{x:(wx-this.x)*this.z+this.c.width/2+this.ox,y:(wy-this.y)*this.z+this.c.height/2+this.oy}}screen(sx,sy){return{x:(sx-this.c.width/2-this.ox)/this.z+this.x,y:(sy-this.c.height/2-this.oy)/this.z+this.y}}pan(dx,dy){this.ox+=dx;this.oy+=dy;this.manual=true}reset(px,py){this.x=px;this.y=py;this.ox=0;this.oy=0;this.z=.85;this.manual=false}follow(px,py,dt=1/60){if(this.manual)return;const p=this.world(px,py),l=this.c.width*.34,r=this.c.width*.66,t=this.c.height*.34,b=this.c.height*.66,alpha=1-Math.pow(.88,Math.max(.25,Math.min(4,(Number(dt)||1/60)*60)));if(p.x<l)this.x+=(p.x-l)/this.z*alpha;if(p.x>r)this.x+=(p.x-r)/this.z*alpha;if(p.y<t)this.y+=(p.y-t)/this.z*alpha;if(p.y>b)this.y+=(p.y-b)/this.z*alpha}clamp(w){const bounds=w?.sections?.length?sectionBounds(w,w.currentSectionId,2):{minX:0,minY:0,maxX:(w.cols??1)-1,maxY:(w.rows??1)-1},edge=30,left=bounds.minX*TILE,top=bounds.minY*TILE,mw=(bounds.maxX-bounds.minX+1)*TILE*this.z,mh=(bounds.maxY-bounds.minY+1)*TILE*this.z,baseLeft=this.c.width/2+(left-this.x)*this.z,baseTop=this.c.height/2+(top-this.y)*this.z,minOx=this.c.width-edge-(baseLeft+mw),maxOx=edge-baseLeft,minOy=this.c.height-edge-(baseTop+mh),maxOy=edge-baseTop;this.ox=mw<=this.c.width-edge*2?(this.c.width-mw)/2-baseLeft:Math.max(minOx,Math.min(maxOx,this.ox));this.oy=mh<=this.c.height-edge*2?(this.c.height-mh)/2-baseTop:Math.max(minOy,Math.min(maxOy,this.oy))}}
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
 app.classList.toggle("battle-active",Boolean(battle));
 normalizeEquipmentState();
 if(screen==="campaignFinalFloor"&&campaignHeroLedger().rewind?.active)screen="home";
 const powerRecord=recordPartyCombatPower(save.state),collectionSync=syncCollectionRewardInbox(save.state),achievementSync=syncAchievementRewardInbox(save.state);if(powerRecord.changed||collectionSync.added||achievementSync.added)save.save();
 try{const refreshScreen=screen==="shop"&&onlineSecretRoomContext?"onlineParty":screen;if(REFRESHABLE_SCREENS.has(refreshScreen))sessionStorage.setItem(SCREEN_SESSION_KEY,refreshScreen)}catch{}
 schedulePowerRankingPublish();
 document.body.classList.toggle("phase2",hasCleared1000(save.state));
 if(!battle)audio.setScene(["explore","gauntlet"].includes(screen)?"explore":screen==="campaignFinalFloor"?"divine":"home");
 if(screen==="home"){app.innerHTML=HomeScreen(save.state,{serverStatus:homeServerStatus});bindHome()}
 else if(screen==="campaignIntel"){campaignIntelModel=createCampaignInvasionIntelModel(save.state);app.innerHTML=CampaignIntelScreen(campaignIntelModel,{tab:campaignIntelTab,selectedLocationIndex:campaignIntelLocationIndex});bindCampaignIntel()}
 else if(screen==="storyArchive"){storyArchiveModel=createCampaignStoryArchiveModel(save.state);app.innerHTML=StoryArchiveScreen(storyArchiveModel,{category:storyArchiveCategory});bindStoryArchive()}
 else if(screen==="formation"){app.innerHTML=FormationScreen(save.state,{origin:formationOrigin});bindFormation()}
 else if(screen==="onlineParty"){app.innerHTML=OnlinePartyScreen(save.state);bindOnlineParty()}
 else if(screen==="monsters"){app.innerHTML=MonsterListScreen(save.state,{...monsterManage,...monsterListState});bindList()}
 else if(screen==="detail"){const m=save.state.monsters.find(x=>x.id===selected);app.innerHTML=MonsterDetailScreen(m,save.state);bindDetail(m)}
 else if(screen==="settings"){app.innerHTML=SettingsScreen(save.state);bindSettings()}
 else if(screen==="explore"){app.innerHTML=ExploreScreen(save.state);bindExplore()}
 else if(screen==="campaignFinalFloor"){renderCampaignFinalFloor()}
 else if(screen==="gauntlet"){app.innerHTML=GauntletScreen(save.state);bindGauntlet()}
 else if(screen==="equipment"){if(!save.state.party.includes(equipmentTarget))equipmentTarget=save.state.party[0]??save.state.monsters[0]?.id;app.innerHTML=EquipmentScreen(save.state,equipmentTarget,{home:navigationOrigin==="home",focusItemId:equipmentFocusItemId,...equipmentManage});bindEquipment()}
 else if(screen==="shop"){app.innerHTML=ShopScreen(save.state);bindShop()}
 else if(screen==="skills"){skillTarget=save.state.monsters.some(m=>m.id===skillTarget)?skillTarget:(save.state.party[0]??save.state.monsters[0]?.id);app.innerHTML=SkillScreen(save.state,skillTarget);bindSkills()}
 else if(screen==="abyssSkills"){app.innerHTML=AbyssSkillTreeScreen(save.state,abyssSkillCategory);bindAbyssSkills()}
 else if(screen==="inventory"){app.innerHTML=InventoryScreen(save.state,inventoryCategory);bindInventory()}
 else if(screen==="armory"){app.innerHTML=ArmoryScreen(save.state,inventoryCategory,inventorySort);bindInventory()}
 bindSharedUi();
 pixelizeUiEmoji(app);
 const legacyPromptOpen=showLegacyCampaignResetPrompt();
 if(!legacyPromptOpen){requestAnimationFrame(scheduleContextGuide);queueCampaignStoryScenes({delay:220})}
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
function finishOnlinePartyNavigation(target="home"){
 if(screen!=="onlineParty")return;
 onlinePartyController?.unmount({disconnect:false});
 try{const clean=new URL(location.href);clean.searchParams.delete("partyServer");clean.searchParams.delete("partyRoom");history.replaceState(history.state,"",`${clean.pathname}${clean.search}${clean.hash}`)}catch{}
 screen=target;render();setTimeout(()=>ensurePowerRankingConnection(),250)
}
function go(s){
 if(s==="home"&&expeditionActive()){
  if(screen!=="explore")showToast("探索中は「帰還」から拠点へ戻れます");
  s="explore";
 }
 if(screen==="explore"&&["formation","equipment","skills","inventory","armory","settings"].includes(s))rememberExpeditionMenuHistory();
 if(screen==="onlineParty"&&s!=="onlineParty"){
  if(onlinePartyController?.requestExit){onlinePartyController.requestExit(()=>finishOnlinePartyNavigation(s));return}
  finishOnlinePartyNavigation(s);return
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
 if(!stageBossStatus?.unlocked)return showToast(`${floorBossDisplayFloor(stageBoss)}階で${stageBoss.name}に遭遇すると第${team.stage}試練が解禁されます`);
 if(save.state.party.length!==4)return alert(`4 VS 4には出撃メンバーが4体必要です（現在 ${save.state.party.length}/4体）`);
 if(team.remaining<=0)return showToast("本日の4 VS 4は終了");
 const reward=teamBattleRewardPreview(team.stage,save.state.player.maxFloor),experience=bossExperiencePackReward(save.state.player.maxFloor),experienceAmount=experience.amount*reward.experienceMultiplier;
 app.insertAdjacentHTML("beforeend",Modal("4対4",`<div class="team-battle-intro"><small>深淵闘技場${CONTENT_TEST_MODE?"・試遊解放":""}</small><h2>第${team.stage}試練</h2><p>${floorBossDisplayFloor(stageBoss)}階・${stageBoss.name}をリーダーにした専用編成。4体対4体で、10戦ごとに敵編成と補正が跳ね上がります。</p><div class="team-reward-preview"><b>通常勝利　GOLD ×${reward.goldMultiplier}</b><span>${pixelIcon("crystal")} ${reward.crystals}個</span><span>初回　${experience.name} ×${experienceAmount}</span>${reward.guaranteedRarity?`<em>${reward.guaranteedRarity}装備確定</em>`:""}</div>${reward.breakthrough?`<div class="team-breakthrough-preview"><b>10試練突破ボーナス</b><span>${pixelIcon("crystal")} 100個・捕獲結晶 50個・${experience.name} ×${experienceAmount}</span></div>`:""}<div class="daily-attempt-plaque"><b>本日 残り${team.remaining}回</b><small>${team.dailyAttempts}/${team.limit}・敗北時は回数返却／日本時間0時更新</small></div></div>`,`挑戦する`));
 const modal=topModal();modal.classList.add("ornate-team-modal");
 modal.querySelector("[data-modal-primary]").onclick=()=>{if(save.state.party.length!==4)return alert("出撃メンバーを4体編成してください");const live=dailyTeamAttempts(save.state);if(live.remaining<=0)return showToast("本日の4 VS 4は終了");const encounter=createTeamBattleEncounter(save.state);if(!encounter)return showToast("この階層ボスはまだ本編で未遭遇です");const chargedStage=Math.max(1,Number(live.stage)||1),chargedDayKey=live.dailyKey;modal.remove();const prior=capturePartyVitals();fullyRecoverParty();live.dailyAttempts++;dailyTeamAttempts(save.state);save.save();startSpecialBattle(encounter,{type:"team",title:`TEAM BATTLE・第${chargedStage}試練`,subtitle:"4 VS 4 / 敗北時は挑戦回数返却",priorVitals:prior,returnScreen:"home",teamStage:chargedStage,teamAttemptCharged:true,teamAttemptDayKey:chargedDayKey})};
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
 app.insertAdjacentHTML("beforeend",Modal(event.boss.faction==="tenGod"?"――神が降臨しました。":"――深淵反応を検知。",`<div class="emergency-warning ${event.boss.faction}"><div class="warning-icon">${monsterVisual(event.boss.id,event.boss.icon,{className:"endgame-warning-monster-visual"})}</div><small>${event.boss.faction==="tenGod"?"十神基礎能力：深淵の10倍":"深淵基礎能力：旧設定の10倍"}</small><h2>${event.boss.name}</h2><p>${event.boss.title}</p><p>味方は開始時に全回復。戦闘中はいつでも撤退できます。撤退した戦闘の報酬は獲得できません。</p>${manual?`<div class="manual-attempt-counter"><b>本日の共通挑戦回数 ${tierStatus.limit-tierStatus.remaining}/${tierStatus.limit}</b><small>深淵・十神の全挑戦で共有／日本時間0時更新</small></div>`:""}</div><div class="endgame-prelude-grid four-tier">${optionHtml}</div>`,`段階を選択してください`));
 const modal=topModal(),primary=modal.querySelector("[data-modal-primary]");if(primary)primary.disabled=true;
 modal.querySelectorAll("[data-endgame-prelude]").forEach(button=>button.onclick=()=>{const prelude=resolveEndgamePrelude(save.state,event.boss.id,button.dataset.endgamePrelude);if(manual){const consumed=consumeManualEndgameChallenge(save.state,event.boss.id,prelude.id);if(!consumed.ok)return showToast(consumed.message)}applyPreludeToEncounter(event,prelude);if(emergencyState.pendingEncounter?.bossId===event.boss.id)emergencyState.pendingEncounter=null;fullyRecoverParty();save.save();modal.remove();if(wasExploring){snapshot=currentSnapshot();stopGame()}startSpecialBattle(event.enemies,{waves:event.waves,type:"emergency",title:event.boss.name,subtitle:prelude.title,priorVitals:prior,bossId:event.boss.id,powerPercent:prelude.percent,fragmentReward:prelude.fragmentReward,manualChallenge:manual,preludeChoiceId:prelude.id,preludeResultText:prelude.resultText,returnScreen:returnScreen??(wasExploring?"explore":"home")})});
}
function resumePendingEmergency(){const pending=normalizeEndgameState(save.state).emergency.pendingEncounter;if(!pending||battle||!save.state.player.inRun||document.querySelector(".game-modal,.battle-screen"))return false;if(game?.running){game.paused=true;game.world.encountering=false}triggerEmergencyEncounter(pending.bossId,{returnScreen:"explore"});return true}
function startSpecialBattle(enemies,options={}){
 const waves=(Array.isArray(options.waves)&&options.waves.length?options.waves:[enemies]).filter(wave=>Array.isArray(wave)&&wave.length),waveIndex=Math.max(0,Math.min(waves.length-1,Math.floor(Number(options.waveIndex)||0))),waveTotal=waves.length,baseSubtitle=options.baseSubtitle??options.subtitle??"敗北ペナルティなし",waveLabel=waveTotal>1?(waveIndex===waveTotal-1?`FINAL WAVE ${waveTotal}/${waveTotal}`:`WAVE ${waveIndex+1}/${waveTotal}`):null;
 const battleOptions={specialBattle:true,specialBattleType:options.type,specialTitle:options.title,specialSubtitle:waveLabel?`${waveLabel}・${baseSubtitle}`:baseSubtitle,specialBaseSubtitle:baseSubtitle,specialWaves:waves,specialWaveIndex:waveIndex,specialWaveTotal:waveTotal,continuingSpecialWave:Boolean(options.continuingSpecialWave),priorVitals:options.priorVitals,specialBossId:options.bossId,powerPercent:options.powerPercent,specialFragmentReward:Math.max(0,Number(options.fragmentReward)||0),manualEndgameChallenge:Boolean(options.manualChallenge),preludeChoiceId:options.preludeChoiceId??null,preludeResultText:options.preludeResultText??null,specialTrialNumber:options.trialNumber??null,specialTrialLoop:options.trialLoop??null,specialTeamStage:options.teamStage??null,teamAttemptCharged:Boolean(options.teamAttemptCharged),teamAttemptDayKey:options.teamAttemptDayKey??null,specialReturnScreen:options.returnScreen??null,campaignStage:options.campaignStage??null,campaignHeroId:options.campaignHeroId??null,campaignHeroEncounterId:options.campaignHeroEncounterId??null,explorationAuto:Boolean(options.explorationAuto),auto:Boolean(options.explorationAuto)||save.state.settings.autoBattle};
 if(options.battleId)battleOptions.battleId=options.battleId;if(options.performance)battleOptions.performance=options.performance;if(Number.isFinite(options.reviveCount))battleOptions.reviveCount=options.reviveCount;
 startBattle(waves[waveIndex],battleOptions);
}
function advanceSpecialBattleWave(){
 if(!battle?.specialBattle||!Array.isArray(battle.specialWaves))return false;const nextIndex=Math.max(0,Number(battle.specialWaveIndex)||0)+1;if(nextIndex>=battle.specialWaves.length)return false;
 const current=battle,options={waves:current.specialWaves,waveIndex:nextIndex,continuingSpecialWave:true,battleId:current.battleId,performance:current.performance,reviveCount:current.reviveCount,type:current.specialBattleType,title:current.specialTitle,baseSubtitle:current.specialBaseSubtitle??current.specialSubtitle,priorVitals:current.priorVitals,bossId:current.specialBossId,powerPercent:current.powerPercent,fragmentReward:current.specialFragmentReward,manualChallenge:current.manualEndgameChallenge,preludeChoiceId:current.preludeChoiceId,preludeResultText:current.preludeResultText,trialNumber:current.specialTrialNumber,trialLoop:current.specialTrialLoop,teamStage:current.specialTeamStage,teamAttemptCharged:current.teamAttemptCharged,teamAttemptDayKey:current.teamAttemptDayKey,returnScreen:current.specialReturnScreen};
 current.busy=true;clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();activeEnemy=null;battle=null;startSpecialBattle(current.specialWaves[nextIndex],options);return true;
}
function createContractedEndgameMonster(boss,bossId,level,floor){
 const monster=createMonster(boss.speciesId,{nickname:boss.name,title:boss.title,level:Math.max(1,Math.min(ENDGAME_MAX_LEVEL,Number(level)||Number(floor)||1)),stars:MONSTER_STAR_MAX,rank:4,favorite:true,locked:true,attribute:boss.element??SPECIES[boss.speciesId]?.element,obtainedFloor:Math.max(1,Number(floor)||1),obtainedMethod:"endgameContract",endgameBossId:bossId,endgameFaction:boss.faction,isContractedEndgame:true,allowEndgameLevel:true,tags:[SPECIES[boss.speciesId]?.race,boss.faction,bossId].filter(Boolean)});
 monster.endgameBossId=bossId;monster.endgameFaction=boss.faction;monster.contractSignature=boss.signature;monster.contractSeriesId=boss.seriesId;monster.isContractedEndgame=true;monster.currentHp=calculatedStats(monster).hp;monster.currentMp=maxMp(monster);return monster;
}
function campaignHeroLedger({saveNow=false}={}){
 const state=normalizeCampaignHeroInvasion(save.state);normalizeCampaignState(save.state).heroEncounters310=state;if(saveNow)save.save();return state
}
function campaignHeroCheckpointResumable(checkpoint=save.state.activeBattle,ledger=campaignHeroLedger()){
 if(checkpoint?.specialBattleType!=="campaignHero"||!Array.isArray(checkpoint.enemies)||!checkpoint.enemies.length)return false;const enemy=checkpoint.enemies.find(entry=>entry?.campaignHeroId)??checkpoint.enemies[0],encounterId=String(checkpoint.campaignHeroEncounterId??enemy?.campaignHeroEncounterId??""),heroId=String(checkpoint.campaignHeroId??enemy?.campaignHeroId??""),event=ledger.events?.[encounterId],hasParty=(save.state.party??[]).some(id=>(save.state.monsters??[]).some(monster=>monster?.id===id));return Boolean(encounterId&&heroId&&hasParty&&ledger.activeEncounterId===encounterId&&event?.status==="active"&&event.heroId===heroId)
}
function queueCampaignHeroAftermath(ledger,{encounterId,outcome,floor,heroHpRate=1}={}){
 const storyCycle=normalizeCampaignReincarnationState(save.state).cycle,queued=queueCampaignHeroAftermathStories(ledger,{encounterId,outcome,floor,heroHpRate,storyCycle});normalizeCampaignState(save.state).heroEncounters310=queued.state;return queued
}
function settleAbandonedCampaignHeroPursuit(reason="field-abandoned"){
 const ledger=campaignHeroLedger(),encounterId=ledger.activeEncounterId;
 if(!encounterId||battle?.specialBattleType==="campaignHero"||campaignHeroCheckpointResumable(save.state.activeBattle,ledger))return false;
 const event=ledger.events?.[encounterId],actor=game?.world?.campaignHeroPursuit??snapshot?.world?.campaignHeroPursuit??save.state.expeditionSnapshot?.world?.campaignHeroPursuit,heroId=event?.heroId??actor?.heroId;
 if(!event||!heroId)return false;
 const floor=Math.max(1,Math.min(CAMPAIGN_MAX_FLOOR,Math.floor(Number(save.state.player.currentFloor)||Number(event.activatedFloor)||Number(event.floor)||1))),resultId=`${encounterId}:${reason}:${floor}`,settled=settleCampaignHeroEncounter(ledger,{encounterId,resultId,heroId,outcome:"escaped",floor});
 queueCampaignHeroAftermath(settled.state,{encounterId,outcome:"escaped",floor,heroHpRate:settled.hero?.remainingHpRate??1});
 if(game?.world)game.world.campaignHeroPursuit=null;if(snapshot?.world)snapshot.world.campaignHeroPursuit=null;if(save.state.expeditionSnapshot?.world)save.state.expeditionSnapshot.world.campaignHeroPursuit=null;
 return settled.recorded||settled.duplicate
}
function campaignHeroName(heroId){return SPECIES[heroId]?.name??({myth_enami:"えなみ",myth_yori:"より",myth_hide:"ひで",myth_rion:"りおん"}[heroId]??"勇者")}
function campaignHeroEncounterCycle(encounterId){const match=String(encounterId??"").match(/-(\d+)$/);return Math.max(1,Math.min(2,Number(match?.[1])||1))}
function campaignHeroVoiceQuoteHtml(heroId,moment,options={}){const text=campaignHeroVoiceLine(heroId,moment,options);return text?`<p class="campaign-hero-voice"><b>${escapeAttribute(campaignHeroName(heroId))}</b><span>「${escapeAttribute(text)}」</span></p>`:""}
function campaignHeroFinalVoiceHtml(moment,heroIds){const lines=campaignHeroFinalVoiceLines(moment,heroIds);return lines.length?`<div class="campaign-hero-final-voices">${lines.map(entry=>campaignHeroVoiceQuoteHtml(entry.heroId,moment)).join("")}</div>`:""}
function campaignHeroBattleEntry(heroId,{encounterId=null,carryHpRate=1,final=false}={}){
 return prepareEnemyEntry({speciesId:heroId,visualSpeciesId:heroId,nameOverride:campaignHeroName(heroId),combatRarity:"神話",level:CAMPAIGN_HERO_PROFILES[heroId]?.fixedLevel??1000,boss:true,uncapturable:true,noItemDrops:true,statMultiplier:campaignReincarnationDifficultyMultiplier(save.state),fixedTrialScaling:true,carryHpRate,campaignHeroId:heroId,campaignHeroEncounterId:encounterId,campaignHeroFinal:Boolean(final),enemyLoadoutVersion:4,equipped:false,enemyGear:[],enemyMagicCircle:null},CAMPAIGN_MAX_FLOOR,{economyFloor:campaignFloorToLegacyFloor(CAMPAIGN_MAX_FLOOR)})
}
function campaignHeroEncounter({heroId=null,encounterId=null,final=false}={}){
 const ledger=campaignHeroLedger(),entries=final?campaignRemainingHeroes(ledger):heroId?[{heroId,carryHpRate:ledger.heroes?.[heroId]?.remainingHpRate??1}]:[];
 return entries.map(entry=>campaignHeroBattleEntry(entry.heroId,{encounterId,carryHpRate:entry.carryHpRate,final}))
}
function campaignFinalVitals(ids){return Object.fromEntries(ids.map(id=>{const monster=save.state.monsters.find(entry=>entry.id===id);return monster?[id,{hp:monster.currentHp,mp:monster.currentMp,ailments:normalizePersistentAilments(monster.ailments)}]:null}).filter(Boolean))}
function restoreCampaignFinalParty(){
 const campaign=normalizeCampaignState(save.state),backup=Array.isArray(campaign.finalPartyBackup)?campaign.finalPartyBackup:[],temporaryIds=new Set([campaign.sairanMonsterId].filter(Boolean));
 save.state.monsters=save.state.monsters.filter(monster=>!temporaryIds.has(monster.id)&&monster.obtainedMethod!=="campaignFinalTemporary"&&!monster.campaignFinalTemporary);
 for(const[id,vitals]of Object.entries(campaign.finalVitals??{})){const monster=save.state.monsters.find(entry=>entry.id===id);if(!monster)continue;monster.currentHp=vitals.hp;monster.currentMp=vitals.mp;monster.ailments=normalizePersistentAilments(vitals.ailments)}
 const restoredParty=backup.filter(id=>save.state.monsters.some(monster=>monster.id===id)).slice(0,4),survivingParty=(save.state.party??[]).filter(id=>save.state.monsters.some(monster=>monster.id===id)).slice(0,4);save.state.party=restoredParty.length?restoredParty:survivingParty.length?survivingParty:save.state.monsters.slice(0,4).map(monster=>monster.id);
 delete campaign.sairanMonsterId;campaign.finalPartyBackup=[];campaign.finalVitals={};campaign.finalBattleLevel=null;campaign.finalStage=null;delete campaign.heroCarry;delete campaign.finalSessionPending
}
function retireLegacyCampaignSairanBattle(){
 const raw=save.state.campaign100&&typeof save.state.campaign100==="object"?save.state.campaign100:{},checkpoint=save.state.activeBattle,rawSairanId=String(raw.sairanMonsterId??""),temporary=save.state.monsters?.some(monster=>monster?.campaignFinalTemporary||monster?.obtainedMethod==="campaignFinalTemporary"||rawSairanId&&monster?.id===rawSairanId),legacyStage=checkpoint?.specialBattleType==="campaignFinal"&&checkpoint?.campaignStage==="sairan"||raw.finalStage==="sairan"||raw.finalSessionPending==="sairan";
 // A stale Sairan marker may survive beside a newer, unrelated checkpoint.
 // Defer cleanup until that battle has settled so no live run is discarded.
 if(checkpoint&&checkpoint.specialBattleType!=="campaignFinal")return false;
 if(!legacyStage&&!rawSairanId&&!temporary)return false;
 const rawBackup=Array.isArray(raw.finalPartyBackup)?[...raw.finalPartyBackup]:[],rawVitals=raw.finalVitals&&typeof raw.finalVitals==="object"?{...raw.finalVitals}:{};
 const campaign=normalizeCampaignState(save.state);if(!campaign.finalPartyBackup?.length&&rawBackup.length)campaign.finalPartyBackup=rawBackup;if(!Object.keys(campaign.finalVitals??{}).length&&Object.keys(rawVitals).length)campaign.finalVitals=rawVitals;if(!campaign.sairanMonsterId&&rawSairanId)campaign.sairanMonsterId=rawSairanId;
 restoreCampaignFinalParty();delete save.state.activeBattle;clearExpeditionSnapshot();save.state.player.inRun=false;return true
}
function configureCampaignOutcomeModal(modal,id){
 if(!modal)return null;modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");const title=modal.querySelector(".game-modal-card>h2"),dismiss=modal.querySelector("[data-modal-dismiss]");if(title){title.id=id;modal.setAttribute("aria-labelledby",id)}modal.addEventListener("keydown",event=>{if(event.key!=="Tab")return;const controls=[...modal.querySelectorAll("button:not([disabled])")].filter(control=>control.offsetParent!==null);if(!controls.length)return;const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});requestAnimationFrame(()=>dismiss?.focus({preventScroll:true}));return modal
}
function showCampaignEnding(ending,{variant=null,resultId=`campaign-final:${Date.now()}`}={}){
 const canonical=["complete","narrow","defeat"].includes(ending)?ending:"defeat",outcome=recordCampaignEnding(save.state,canonical),ledger=campaignHeroLedger(),finalHeroIds=campaignRemainingHeroes(ledger).map(entry=>entry.heroId),voices=outcome.victorious?campaignHeroFinalVoiceHtml("finalPlayerWin",finalHeroIds):campaignHeroFinalVoiceHtml("finalHeroesWin",finalHeroIds),special=variant==="all-preempted",copy=special?{title:"予言外の完全制圧",lead:"勇者四人は魔王城へ着く前に、全員が道中で退けられた。",detail:"王室に戦う者はいない。『完全勝利』の中でも、予言そのものを空振りさせた特別な結末だ。"}:{complete:{title:"完全勝利",lead:"四体すべてが立ったまま、勇者一行を正面から退けた。",detail:"傷の引き継ぎと十日間の準備、そのすべてが予言を打ち破る力になった。"},narrow:{title:"辛勝",lead:"最後に立っていた仲間が戦線をつなぎ、勇者一行を退けた。",detail:"倒れた仲間の一撃まで含め、紙一重で共鳴『無敵』を断ち切った。"},defeat:{title:"勇者の勝利",lead:"現在の部隊は勇者一行の共鳴に届かなかった。",detail:"これも三つの結末の一つ。育成・所持品・道中の傷はそのまま残り、王室からいつでも再挑戦できる。"}}[canonical];
 recordCampaignConclusion(save.state,{ending:canonical,variant,resultId});ledger.finalArena={...ledger.finalArena,completed:outcome.victorious,lastEnding:canonical,lastEndingVariant:variant,battleStarted:false};normalizeCampaignState(save.state).heroEncounters310=ledger;if(outcome.victorious){mark10000FloorCleared(save.state);save.state.flags.ending10000Played=true}restoreCampaignFinalParty();clearPartySynergy();clearBattleCheckpoint({saveNow:false});document.querySelector(".battle-screen")?.remove();activeEnemy=null;battle=null;save.state.player.inRun=false;clearExpeditionSnapshot();try{sessionStorage.setItem(SCREEN_SESSION_KEY,"home")}catch{}
 let persisted=Boolean(save.save());app.insertAdjacentHTML("beforeend",Modal(`予言の十日間・${copy.title}`,`<div class="campaign-ending ending-${canonical}${special?" ending-preemptive":""}"><small>ENDING ${canonical==="complete"?"I":canonical==="narrow"?"II":"III"}・予言10日目</small><h2>${copy.title}</h2><p>${copy.lead}</p><p>${copy.detail}</p>${voices}<b>${persisted?`${outcome.victorious?"クリア後も探索・育成を継続できます。輪廻はホームから任意で選択できます。":"敗北記録を保存しました。強制巻き戻しはありません。"}`:"記録をまだ保存できていません。空き容量を確認して再試行してください。"}</b></div>`,persisted?"魔王城へ戻る":"保存して魔王城へ戻る"));const modal=configureCampaignOutcomeModal(topModal(),"campaignEndingTitle"),finish=()=>{if(!persisted){persisted=Boolean(save.save());if(!persisted){showToast("結末を保存できませんでした。容量を確認してください");return}}modal?.remove();go("home")};modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish
}
function finishCampaignFinalBattle(won){
 const current=battle,ledger=campaignHeroLedger(),survivingAllies=(current?.party??[]).filter(monster=>Number(monster?.currentHp)>0).length,resultId=`${current?.battleId??Date.now()}:final`,resolved=campaignCanonicalEnding(ledger,{partyWon:Boolean(won),partySurvivors:survivingAllies,partySize:4,remainingHeroes:campaignRemainingHeroes(ledger).length});audio.setScene(resolved.victorious?"victory":"defeat");audio.sfx(resolved.victorious?"victory":"defeat");return showCampaignEnding(resolved.ending,{variant:resolved.variant,resultId})
}
function enterCampaignFinalFloor(){
 const ledger=campaignHeroLedger();if(ledger.rewind?.active){screen="home";render();showToast(`予言9日目・${ledger.rewind.currentFloor}階から再踏破してください`);return false}if(!ledger.finalArena?.unlocked||ledger.finalArena?.completed){screen="home";render();showToast(ledger.finalArena?.completed?"勇者軍最終決戦は決着済みです":"100階を踏破すると最終決戦階層が開きます");return false}
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state));let returnResult=null;try{if(save.state.returnRewards?.manual?.active===true)returnResult=claimManualReturn(save.state);ledger.finalArena={...ledger.finalArena,entered:true};normalizeCampaignState(save.state).heroEncounters310=ledger;save.state.player.inRun=false;delete save.state.expeditionAffectionDeaths;clearExpeditionSnapshot();if(!save.save())throw new Error("campaign-final-save-failed")}catch(error){save.state=backup;if(game)game.paused=false;showToast("探索報酬を保存できないため、最終決戦への門を開けません。容量を確認して再試行してください");return false}stopGame();go("campaignFinalFloor");if(returnResult)showManualReturnResult(returnResult,{title:"100階踏破・探索精算",primaryLabel:"最終決戦階層へ",onClose:()=>{}});return true
}
function renderCampaignFinalFloor(){
 const ledger=campaignHeroLedger();if(ledger.rewind?.active||!ledger.finalArena?.unlocked||ledger.finalArena?.completed){screen="home";render();return}const party=(save.state.party??[]).map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean).slice(0,4),heroes=CAMPAIGN_HERO_IDS.map(id=>({id,name:campaignHeroName(id),...(ledger.heroes?.[id]??{})})),reincarnation=normalizeCampaignReincarnationState(save.state);app.innerHTML=CampaignFinalFloorScreen({heroes,party,audienceCompleted:ledger.finalArena?.audienceCompleted===true,reincarnationCycle:reincarnation.cycle});
 document.querySelector("[data-final-floor-return]")?.addEventListener("click",()=>go("home"));document.querySelector("[data-final-floor-formation]")?.addEventListener("click",()=>{formationOrigin="campaignFinalFloor";go("formation")});document.querySelector("[data-final-floor-approach]")?.addEventListener("click",()=>openCampaignFinalPreparation());const stage=document.querySelector("[data-final-floor=\"royal-audience\"]"),next=stage?.querySelector("[data-final-audience-next]"),lines=[...(stage?.querySelectorAll("[data-final-dialogue-line]")??[])];next?.addEventListener("click",()=>{let index=Math.max(0,Number(stage.dataset.finalDialogueIndex)||0);if(index>=lines.length-1){ledger.finalArena={...ledger.finalArena,audienceCompleted:true};normalizeCampaignState(save.state).heroEncounters310=ledger;if(!save.save()){showToast("王室の会話状態を保存できませんでした");return}next.hidden=true;stage.querySelector("[data-final-floor-approach]").hidden=false;return}lines[index].hidden=true;index++;lines[index].hidden=false;stage.dataset.finalDialogueIndex=String(index);if(index>=lines.length-1)next.textContent="決着へ進む"})
}
function openCampaignFinalPreparation(){
 const ledger=campaignHeroLedger();if(ledger.rewind?.active||!ledger.finalArena?.unlocked||ledger.finalArena?.completed){screen="home";render();showToast(ledger.rewind?.active?`予言9日目・${ledger.rewind.currentFloor}階から再踏破してください`:ledger.finalArena?.completed?"勇者軍最終決戦は決着済みです":"100階を踏破すると最終決戦階層が開きます");return}if(save.state.returnRewards?.manual?.active===true){enterCampaignFinalFloor();return}
 const unreadStory=nextCampaignStoryScene(save.state,{clearedFloor:CAMPAIGN_MAX_FLOOR});if(unreadStory){queueCampaignStoryScenes({clearedFloor:CAMPAIGN_MAX_FLOOR,delay:0,onComplete:openCampaignFinalPreparation});return}
 const campaign=normalizeCampaignState(save.state),liveIds=(save.state.party??[]).filter(id=>save.state.monsters.some(monster=>monster.id===id)).slice(0,4),remaining=campaignRemainingHeroes(ledger);if(ledger.finalArena?.audienceCompleted!==true)return showToast("王室で勇者一行との会話を最後まで進めてください");if(!remaining.length)return showCampaignEnding("complete",{variant:"all-preempted",resultId:`campaign-final:preemptive:${normalizeCampaignReincarnationState(save.state).cycle}`});if(liveIds.length!==4)return showToast("現在パーティを4体編成してください");const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state));campaign.finalPartyBackup=[...liveIds];campaign.finalVitals=campaignFinalVitals(liveIds);campaign.finalStage="party";campaign.finalSessionPending="party";ledger.finalArena={...ledger.finalArena,unlocked:true,entered:true,battleStarted:true,attempts:(ledger.finalArena?.attempts??0)+1};campaign.heroEncounters310=ledger;fullyRecoverParty();save.state.player.inRun=false;clearExpeditionSnapshot();if(!save.save()){save.state=backup;showToast("最終決戦の開始状態を保存できません。容量を確認して再試行してください");return}startSpecialBattle(campaignHeroEncounter({final:true}),{type:"campaignFinal",campaignStage:"party",title:"王室・勇者軍最終決戦",subtitle:`魔王軍4体 対 残った勇者${remaining.length}人`,returnScreen:"campaignFinalFloor"})
}
function finishFloorBossChallengeBattle(won,contributionSnapshot){
 const bossId=battle.specialBossId,status=floorBossChallengeStatus(save.state,bossId),reward=awardFloorBossChallengeFragments(save.state,bossId,won,battle.battleId),prior=battle.priorVitals,boss=status?.boss;
 restorePartyVitals(prior);clearPartySynergy();clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();save.save();activeEnemy=null;
 const body=won?`<div class="special-result win floor-boss-fragment-result">${monsterVisual({speciesId:boss.speciesId,visualSpeciesId:boss.visualSpeciesId},SPECIES[boss.speciesId]?.emoji??"BOSS",{className:"floor-boss-result-visual"})}<small>${floorBossDisplayFloor(boss)}階・階層支配者</small><h2>${boss.name}を突破！</h2><div class="fragment-reward"><b>${boss.name}の欠片 ×${reward.amount}</b><small>${reward.firstVictory?"初回討伐ボーナス":"再戦報酬"}・所持 ${reward.fragments}</small></div><button type="button" class="fragment-altar-open" data-floor-boss-result-exchange="${boss.id}">欠片交換を見る</button></div>`:`<div class="special-result lose"><h2>${boss?.name??"階層ボス"}には届かなかった…</h2><p>所持品・階層・仲間へのペナルティはありません。欠片は勝利時のみ獲得します。</p></div>`;
 app.insertAdjacentHTML("beforeend",Modal(won?"階層ボス再戦勝利":"階層ボス再戦敗北",body,"挑戦門へ戻る"));const modal=topModal();modal.hidden=true;const finish=()=>{modal.remove();battle=null;openEndgameTrialPicker()};modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish;modal.querySelector("[data-floor-boss-result-exchange]")?.addEventListener("click",()=>{const id=boss.id;modal.remove();battle=null;openFloorBossExchange(id)});openBattleContributionReport(contributionSnapshot,()=>{modal.hidden=false});
}
function retreatCampaignFinalBattle(current){
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state));current.resultSettled=true;current.escapePending=false;restoreCampaignFinalParty();const ledger=campaignHeroLedger();ledger.finalArena={...ledger.finalArena,battleStarted:false};normalizeCampaignState(save.state).heroEncounters310=ledger;save.state.player.inRun=false;delete save.state.activeBattle;clearExpeditionSnapshot();if(!save.save()){save.state=backup;current.resultSettled=false;showToast("撤退状態を保存できません。容量を確認して再試行してください");return false}clearPartySynergy();document.querySelector(".battle-screen")?.remove();activeEnemy=null;battle=null;snapshot=null;go("campaignFinalFloor");showToast("勇者軍最終決戦から撤退しました");return true
}
function finishCampaignHeroEncounterBattle(won,{retreated=false}={}){
 const current=battle,enemy=(current?.enemies??[]).find(entry=>entry.campaignHeroId)??current?.enemies?.[0],heroId=current?.campaignHeroId??enemy?.campaignHeroId,encounterId=current?.campaignHeroEncounterId??enemy?.campaignHeroEncounterId,resultId=`${current?.battleId??Date.now()}:hero-field:${retreated?"retreat":won?"repelled":"overwhelmed"}`,outcome=won?"repelled":retreated?"escaped":"hero-victory",hpRate=won?0:Math.max(0,Math.min(1,Number(enemy?.hp)/Math.max(1,Number(enemy?.maxHp)||1))),settled=settleCampaignHeroEncounter(campaignHeroLedger(),{encounterId,resultId,heroId,outcome,floor:save.state.player.currentFloor,hpRate,repelled:won});queueCampaignHeroAftermath(settled.state,{encounterId,outcome,floor:save.state.player.currentFloor,heroHpRate:settled.hero?.remainingHpRate??hpRate});
 if(snapshot?.world){snapshot.world.campaignHeroPursuit=null;snapshot.world.nextEncounter=(Number(snapshot.world.steps)||0)+8;persistExpeditionSnapshot(snapshot,{saveNow:false})}restorePartyVitals(current?.priorVitals);clearPartySynergy();clearBattleCheckpoint({saveNow:false});document.querySelector(".battle-screen")?.remove();activeEnemy=null;battle=null;let persisted=Boolean(save.save());
 const name=campaignHeroName(heroId),hurt=Math.max(0,Math.round((1-(settled.hero?.remainingHpRate??1))*100)),voiceMoment=won?"repelled":retreated?"retreated":"heroVictory",voice=campaignHeroVoiceQuoteHtml(heroId,voiceMoment,{cycle:campaignHeroEncounterCycle(encounterId)}),body=won?`<div class="campaign-hero-result is-repelled">${monsterVisual({speciesId:heroId,visualSpeciesId:heroId},name,{frame:"down",className:"campaign-hero-result-visual"})}<small>途中撃退・ルート分岐</small><h2>${name}を退けた</h2><p>${name}は最終決戦から離脱します。</p>${voice}<b>与えた傷は永久保存されました</b></div>`:`<div class="campaign-hero-result is-wounded">${monsterVisual({speciesId:heroId,visualSpeciesId:heroId},name,{className:"campaign-hero-result-visual"})}<small>${retreated?"追跡から離脱":"圧倒的戦力差"}</small><h2>${retreated?`${name}から退いた`:`${name}に押し切られた`}</h2><p>この戦闘で刻んだ傷は、最終決戦の残存HPへ引き継がれます。</p>${voice}<b>累積損傷 ${hurt}%・育成や所持品の損失なし</b></div>`;
 app.insertAdjacentHTML("beforeend",Modal(won?"勇者を途中撃退":"勇者との遭遇",`${body}${persisted?"":'<p class="save-retry-warning">遭遇結果をまだ保存できていません。空き容量を確認して再試行してください。</p>'}`,persisted?"探索を続ける":"保存して探索を続ける"));const modal=topModal(),finish=()=>{if(!persisted){persisted=Boolean(save.save());if(!persisted){showToast("勇者との遭遇結果を保存できませんでした");return}}modal.remove();screen="explore";render()};modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish;if(current?.explorationAuto)setTimeout(()=>{if(modal.isConnected)finish()},1800);return true
}
function retreatSpecialBattle(){
 if(!battle?.specialBattle)return false;
 const current=battle,type=current.specialBattleType,prior=current.priorVitals,returnScreen=current.specialReturnScreen??(["team","gauntlet"].includes(type)?"home":"explore");
 current.resultSettled=true;current.escapePending=false;
 if(type==="campaignFinal")return retreatCampaignFinalBattle(current);
 if(type==="campaignHero")return finishCampaignHeroEncounterBattle(false,{retreated:true});
 if(type==="gauntlet"){
  const trials=normalizeEndgameState(save.state).trials,run=trials.run;if(run?.active){run.lastResult="return";run.lastBattle=Math.max(1,Number(current.specialTrialNumber)||1)}
  const settlement=settleGauntletRun("return");clearPartySynergy();clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();activeEnemy=null;battle=null;showGauntletSettlement(settlement);return true
 }
 restorePartyVitals(prior);clearPartySynergy();clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();save.save();activeEnemy=null;battle=null;
 if(type==="floorBoss"){openEndgameTrialPicker();showToast("階層ボス戦から撤退しました");return true}
 if(returnScreen==="home"){snapshot=null;go("home")}else if(returnScreen==="gauntlet"){screen="gauntlet";render()}else{screen="explore";render()}
 showToast("戦闘から撤退しました");return true
}
function finishSpecialBattle(won){
 if(!battle||battle.resultSettled)return;battle.resultSettled=true;
 if(battle.specialBattleType==="campaignFinal")return finishCampaignFinalBattle(won);
 if(battle.specialBattleType==="campaignHero")return finishCampaignHeroEncounterBattle(won);
 const contributionSnapshot=battleContributionSnapshot();
 if(won)recordSeriesBattle(save.state,battle.party,null,{boss:true,battleId:battle.battleId});
 audio.setScene(won?"victory":"defeat");audio.sfx(won?"victory":"defeat");
 const type=battle.specialBattleType,prior=battle.priorVitals,bossId=battle.specialBossId,trialNumber=Math.max(1,Number(battle.specialTrialNumber)||1),floor=save.state.player.currentFloor,returnScreen=battle.specialReturnScreen??(["team","gauntlet"].includes(type)?"home":"explore"),leader=battle.enemies?.find(enemy=>enemy.endgameBossId===bossId),team=type==="team"?dailyTeamAttempts(save.state):null,teamStage=team?Math.max(1,Math.floor(Number(battle.specialTeamStage)||Number(team.stage)||1)):null,rewardFloor=["team","gauntlet"].includes(type)?Math.max(1,save.state.player.maxFloor||floor):floor;
 if(type==="floorBoss")return finishFloorBossChallengeBattle(won,contributionSnapshot);
 const priorSettlement=specialBattleSettlement(save.state,battle.battleId);let specialGold=Number(priorSettlement?.specialGold)||0,specialCrystals=Number(priorSettlement?.specialCrystals)||0,specialEquipment=priorSettlement?.specialEquipment??null,fragments=Number(priorSettlement?.fragments)||0,contract=priorSettlement?.contractResult?{...priorSettlement.contractResult,boss:ENDGAME_BOSSES[bossId]}:null,contractedMonster=priorSettlement?.contractResult?.joined?true:null,trialProgress=priorSettlement?.trialProgress??null,teamProgress=priorSettlement?.teamProgress??null,teamBaseCrystals=Number(priorSettlement?.teamBaseCrystals)||0,teamBonusCrystals=Number(priorSettlement?.teamBonusCrystals)||0,teamCaptureCrystals=Number(priorSettlement?.teamCaptureCrystals)||0,teamFirstClearPack=priorSettlement?.teamFirstClearPack??null,teamBreakthroughPack=priorSettlement?.teamBreakthroughPack??null,gauntletSettlement=null;
 if(!priorSettlement){
  const teamReward=team?teamBattleRewardPreview(teamStage,rewardFloor):null;
  const rewardDepth=campaignFloorToLegacyFloor(rewardFloor),teamGoldBase=team?Math.max(1,Math.min(Number.MAX_SAFE_INTEGER,Math.round(goldForClearedFloor(rewardDepth)*teamReward.goldMultiplier))):0,calculatedGold=type==="gauntlet"?0:type==="team"?(won?modifiedGoldReward(save.state,teamGoldBase,"battle"):0):modifiedGoldReward(save.state,specialBattleGoldBase(rewardDepth,{type,won,stage:1,powerPercent:battle.powerPercent}),"battle");
  specialGold=safeCurrencyGrant(save.state.player.gold,calculatedGold);
  if(team){
   teamProgress=recordTeamBattleResult(save.state,won,{stage:teamStage,attemptCharged:Boolean(battle.teamAttemptCharged),attemptDayKey:battle.teamAttemptDayKey});
   if(won){
    const entitlement=teamBattleRewardEntitlements(teamStage,{firstClear:teamProgress.firstClear}),currentCrystals=Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(save.state.player.crystals)||0)));teamBaseCrystals=safeCurrencyGrant(currentCrystals,entitlement.baseCrystals);teamBonusCrystals=safeCurrencyGrant(currentCrystals+teamBaseCrystals,entitlement.bonusCrystals);specialCrystals=teamBaseCrystals+teamBonusCrystals;save.state.player.crystals=currentCrystals+specialCrystals;
    save.state.inventory??={};const currentCapture=Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(save.state.inventory.captureCrystals)||0)));teamCaptureCrystals=safeCurrencyGrant(currentCapture,entitlement.captureCrystals);save.state.inventory.captureCrystals=currentCapture+teamCaptureCrystals;
    const pack=bossExperiencePackReward(rewardFloor),packAmount=Math.max(1,pack.amount*entitlement.experienceMultiplier),grantPack=()=>{const current=Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(save.state.inventory[pack.inventoryKey])||0))),amount=safeCurrencyGrant(current,packAmount);save.state.inventory[pack.inventoryKey]=current+amount;return amount?{name:pack.name,inventoryKey:pack.inventoryKey,tier:pack.tier,amount}:null};
    if(entitlement.firstClear)teamFirstClearPack=grantPack();if(entitlement.breakthroughReward)teamBreakthroughPack=grantPack();
    if(entitlement.guaranteedRarity){const slots=["weapon","armor","accessory"],item=createEquipment(slots[(teamStage-1)%slots.length],{rarity:entitlement.guaranteedRarity});item.level=Math.max(1,Math.min(ENDGAME_MAX_LEVEL,Math.max(teamStage*10,Math.round(rewardDepth*.8))));item.plus=Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(teamStage/5)));const received=receiveEquipment(save.state,item,{bossReward:true});specialEquipment={name:item.name,rarity:item.rarity,level:item.level,plus:item.plus,message:received.message};}
   }
  }
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
  recordSpecialBattleSettlement(save.state,battle.battleId,{type,won:Boolean(won),bossId:bossId??null,specialGold,specialCrystals,specialEquipment,fragments,contractResult,trialProgress,teamProgress,teamBaseCrystals,teamBonusCrystals,teamCaptureCrystals,teamFirstClearPack,teamBreakthroughPack});save.save();
 }
 if(!(type==="gauntlet"&&returnScreen==="gauntlet"))restorePartyVitals(prior);clearPartySynergy();clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();const boss=bossId?ENDGAME_BOSSES[bossId]:null,status=bossId?emergencyFragmentStatus(save.state,bossId):null;
 let contractHtml="";if(type==="emergency"&&won)contractHtml=`<button type="button" class="fragment-altar-open" data-open-fragment-altar>${pixelIcon("summon")} 欠片祭壇へ　人物契約／神装顕現</button>`;
 if(type==="gauntlet"&&!won){save.save();activeEnemy=null;openBattleContributionReport(contributionSnapshot,()=>{battle=null;showGauntletSettlement(gauntletSettlement??normalizeEndgameState(save.state).trials.lastSettlement)});return}
 const trialName=ENDGAME_TRIALS[trialNumber-1]?.name??`第${trialNumber}戦`,subject=type==="gauntlet"?`奈落回廊 第${trialNumber}戦`:type==="team"?`4対4 第${teamStage}試練`:boss?.name??"チームバトル",progressText=type==="gauntlet"?(trialProgress?.loopCompleted?`${ENDGAME_TRIAL_BATTLE_COUNT}戦を踏破。精算せず${trialProgress.loop}周目へ進めます。`:`次は第${trialProgress?.battle??trialNumber}戦「${ENDGAME_TRIALS[(trialProgress?.battle??trialNumber)-1]?.name??trialName}」。`):type==="team"?`第${teamStage}試練を初突破。第${teamProgress?.stage??team?.stage??teamStage+1}試練が解放されました。`:"世界異変を退けました。";
 const teamLoot=type==="team"&&won?`<div class="team-victory-loot"><b>通常勝利　${pixelIcon("crystal")} 魔晶石 ×${teamBaseCrystals}</b>${teamFirstClearPack?`<b>初回クリア　${teamFirstClearPack.name} ×${teamFirstClearPack.amount}</b>`:""}${teamBonusCrystals||teamCaptureCrystals||teamBreakthroughPack?`<div class="team-breakthrough-loot"><strong>10試練突破ボーナス</strong>${teamBonusCrystals?`<span>${pixelIcon("crystal")} 魔晶石 ×${teamBonusCrystals}</span>`:""}${teamCaptureCrystals?`<span>捕獲結晶 ×${teamCaptureCrystals}</span>`:""}${teamBreakthroughPack?`<span>${teamBreakthroughPack.name} ×${teamBreakthroughPack.amount}</span>`:""}</div>`:""}${specialEquipment?`<b>確定装備　[${specialEquipment.rarity}] ${specialEquipment.name} Lv.${specialEquipment.level} +${specialEquipment.plus}</b><small>${specialEquipment.message??"報酬保管済み"}</small>`:""}</div>`:"",title=won?"特別戦勝利":"敗北",body=type==="gauntlet"?`<div class="special-result win gauntlet-chain-result"><small>深淵回廊・連勝継続</small><h2>${subject}を突破！</h2><p>${progressText}</p><div class="gauntlet-bank-note"><b>戦利品は回廊内に蓄積中</b><span>帰還・全滅時にGOLD／欠片／希少武器を一括精算</span></div></div>`:won?`<div class="special-result win"><h2>${subject}を突破！</h2><p>${progressText}</p><div class="fragment-reward"><b>${pixelIcon("coin")} 深層討伐報奨 +${specialGold.toLocaleString()}G</b><small>${rewardFloor}階のGOLD基準で算出</small></div>${teamLoot}${battle.preludeResultText?`<small>${battle.preludeResultText}</small>`:""}${type==="emergency"?`<div class="fragment-reward"><b>${monsterVisual(boss.id,boss.icon,{className:"fragment-boss-visual"})} ${boss.name}の欠片 ×${fragments}</b><small>所持 ${status.count}/${status.required}${status.canCraft?"　製作可能！":""}</small></div>${contractHtml}`:""}</div>`:type==="team"?`<div class="team-defeat-report"><small>部隊戦・第${teamStage}試練</small><span class="team-defeat-seal" aria-hidden="true"></span><h2>試練、未突破</h2><p>編成・属性・装備を組み直し、次の挑戦で深淵を越えてください。所持品や進行度への損失はありません。</p><div class="team-defeat-daily"><b>本日 残り${team?.remaining??teamProgress?.remaining??0}回</b><small>敗北分の挑戦回数は消費しません／日本時間0時更新</small></div></div>`:`<div class="special-result lose"><h2>${subject}には届かなかった…</h2><p>所持品・階層・仲間へのペナルティはありません。</p>${type==="emergency"?`<div class="fragment-reward"><b>${monsterVisual(boss.id,boss.icon,{className:"fragment-boss-visual"})} ${boss.name}の欠片 ×${fragments}</b><small>${fragments?"10%抽選に成功":"今回は欠片なし"}・所持 ${status.count}/${status.required}</small></div>`:""}</div>`;
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
 app.insertAdjacentHTML("beforeend",Modal("世界の記録",`<div class="world-record-modal"><small class="eyebrow">RECORD I / ${region}</small><h2>予言の十日間</h2><p>一日につき十階。百階の迷宮を制し、魔王軍を完成させる。</p><p>深淵と十神も、この戦いを見届けている。</p><hr><p>十日目の終わりには、勇者一行が魔王城へ到着する。</p><p class="muted">現在確認された最深部：${floor}階</p></div>`,`閉じる`));
}
function returnRarityTable(){return`<div class="return-rarity-table"><div class="return-rarity-head"><b>装備ドロップ確率</b><small>装備1枠ごとの抽選</small></div>${returnRarityRates(save.state).map(row=>`<p class="rarity-${row.rarity}"><span>${row.rarity}</span><b>${row.label}</b></p>`).join("")}</div>`}
function returnGradeBadge(grade){const tone=["SSS","SS","S"].includes(grade)?"gold":grade==="A"?"red":grade==="B"?"purple":"silver";return`<div class="return-grade-medal tone-${tone}"><i class="return-rune-ring" aria-hidden="true"><u></u><u></u><u></u><u></u></i><small>EXPEDITION RANK</small><strong>${grade}</strong><em>探索評価</em></div>`}
function compactElapsedText(elapsedMs){
 const minutes=Math.floor(Math.max(0,elapsedMs)/60000),hours=Math.floor(minutes/60),minutePart=minutes%60;
 return hours>0?`${hours}時間${minutePart}分`:`${minutePart}分`;
}
function powerRankingDisplayName(){
 const live=String(onlinePartyController?.profile?.displayName??"").trim();if(live)return live.slice(0,16);
 let stored="";try{stored=String(localStorage.getItem(ONLINE_STORAGE_KEYS.displayName)??"").trim()}catch{}
 return(stored||"冒険者").slice(0,16)
}
function powerRankingPublicSnapshot(){
 const allEquipment=[...(save.state.equipment??[]),...(save.state.reserveEquipment??[]),...(save.state.bossEquipmentVault??[])],byId=new Map(allEquipment.map(item=>[item.id,item]));
 const party=(save.state.party??[]).slice(0,4).map((id,index)=>{
  const monster=save.state.monsters?.find(entry=>entry.id===id);if(!monster)return null;
  const stats=calculatedStats(monster),species=SPECIES[monster.speciesId]??{},circle=equippedMagicCircle(monster,save.state);
  const equipment=Object.values(monster.equipment??{}).map(itemId=>{const item=byId.get(itemId);if(!item)return null;return{slot:item.slot,name:String(item.name??"装備").slice(0,48),rarity:equipmentDisplayRarity(item),level:Math.max(1,Math.floor(Number(item.level)||1)),plus:Math.max(0,Math.floor(Number(item.plus)||0)),visualAsset:item.visualAsset??null}}).filter(Boolean).slice(0,6);
  return{slot:index+1,speciesId:monster.speciesId,visualSpeciesId:monster.visualSpeciesId??null,endgameBossId:monster.endgameBossId??null,floorBossCatalogId:monster.floorBossCatalogId??null,customVisualAsset:monster.customVisualAsset??null,customVisualBase:monster.customVisualBase??null,name:String(displayName(monster)).slice(0,32),level:Math.max(1,Math.floor(Number(monster.level)||1)),rarity:monsterVisibleRarity(monster),power:monsterCombatPower(monster),battleStats:{hp:Math.max(1,Number(stats.hp)||1),atk:Math.max(1,Number(stats.atk)||1),matk:Math.max(1,Number(stats.matk??stats.atk)||1),def:Math.max(0,Number(stats.def)||0),mdef:Math.max(0,Number(stats.mdef??stats.def)||0),spd:Math.max(1,Number(stats.spd)||1),crit:Math.max(0,Number(stats.crit)||0),evasion:Math.max(0,Number(stats.evasion)||0)},equipment,magicCircle:{name:String(circle?.name??"魔法陣なし").slice(0,40),level:Math.max(0,Math.floor(Number(circle?.level)||0))}}
 }).filter(Boolean);
 return{displayName:powerRankingDisplayName(),maxFloor:Math.max(1,Math.floor(Number(save.state.player?.maxFloor)||1)),power:partyCombatPower(save.state),party}
}
function powerRankingSnapshotSignature(snapshot=powerRankingPublicSnapshot()){
 return JSON.stringify(snapshot);
}
function powerRankingSupported(){
 if(!onlinePartyController)return false;
 if(typeof onlinePartyController.supportsPowerRankings==="function")return Boolean(onlinePartyController.supportsPowerRankings());
 return Boolean(onlinePartyController.capabilities?.has?.("powerRankingsV1"));
}
function publishPowerRankingSnapshot({force=false}={}){
 const controller=ensureOnlinePartyController(),snapshot=powerRankingPublicSnapshot(),signature=powerRankingSnapshotSignature(snapshot);
 if(!force&&signature===powerRankingLastSignature&&Date.now()-powerRankingLastPublishedAt<300000)return;
 if(typeof controller?.publishPowerRankingSnapshot!=="function"||controller.connectionReady&&!powerRankingSupported())return;
 let request;try{request=controller.publishPowerRankingSnapshot(snapshot,{force})}catch{return}
 Promise.resolve(request).then(result=>{if(result===false||result?.ok===false)return;powerRankingLastSignature=signature;powerRankingLastPublishedAt=Date.now()}).catch(()=>{});
}
function schedulePowerRankingPublish({initial=false}={}){
 const signature=powerRankingSnapshotSignature();
 if(!initial&&signature===powerRankingLastSignature)return;
 if(powerRankingPublishTimer&&signature===powerRankingScheduledSignature&&!initial)return;
 clearTimeout(powerRankingPublishTimer);
 powerRankingScheduledSignature=signature;
 powerRankingPublishTimer=setTimeout(()=>{powerRankingPublishTimer=null;powerRankingScheduledSignature="";publishPowerRankingSnapshot({force:initial})},initial?1800:30000);
}
function ensurePowerRankingConnection({force=false}={}){
 const controller=ensureOnlinePartyController();
 if(typeof WebSocket==="undefined"||controller.supersededConnection)return controller;
 if(!controller.ws||![WebSocket.OPEN,WebSocket.CONNECTING].includes(controller.ws.readyState)){const now=Date.now();if(force||now-powerRankingLastConnectAttempt>=30000){powerRankingLastConnectAttempt=now;if(typeof controller.startBackground==="function")controller.startBackground({connect:true});else controller.connect?.({reconnect:true})}}
 return controller
}
function updateHomeServerStatus(){
 const node=document.querySelector("[data-home-server-status]");if(!node)return;
 node.dataset.serverState=homeServerStatus.state;node.className=`home-server-status is-${homeServerStatus.state}`;
 const label=node.querySelector("span");if(label)label.textContent=homeServerStatus.label;
}
function refreshHomeNoticeAttention(){
 const button=document.getElementById("openNoticeCenter");if(!button)return;const count=noticeAttentionCount(save.state),small=button.querySelector("small");
 button.classList.toggle("ready",count>0);if(small)small.textContent=count?`未読 ${count}`:"確認済み";
 if(count&&!button.querySelector(".home-notification-dot"))button.insertAdjacentHTML("afterbegin",'<i class="home-notification-dot"></i>');if(!count)button.querySelector(".home-notification-dot")?.remove();
}
function handleServerConnectionStatus(status={}){
 const availability=String(status.availability??"checking");
 if(availability==="checking"&&homeServerStatus.state==="offline")return;
 const state=availability==="online"?"online":availability==="offline"?"offline":"checking",label=state==="online"?"サーバーオンライン中":state==="offline"?"サーバーオフライン":"サーバー確認中";
 homeServerStatus={state,label,checkedAt:Number(status.checkedAt)||Date.now()};updateHomeServerStatus();
 if(state==="checking")return;
 const result=setServerMaintenanceState(save.state,state==="offline",{now:homeServerStatus.checkedAt});if(result.changed)save.save();
 if(state==="online")document.querySelector('[data-notice-id="server-maintenance-live"]')?.remove();
 refreshHomeNoticeAttention();
}
function handlePowerRankingState(result){
 const state=result?.state??result;if(!state||typeof state!=="object")return;
 state._receivedAt=Date.now();powerRankingUi.state=state;const modal=document.querySelector("[data-power-record-modal]");
 if(state.loading){if(!powerRankingUi.listTimedOut)powerRankingUi.loadingList=true}else{powerRankingUi.loadingList=false;powerRankingUi.listTimedOut=false;clearTimeout(modal?._powerRankingListTimer);if(modal)modal._powerRankingListTimer=null}
 if(modal?.dataset.powerRecordTab==="ranking")renderCombatPowerRecordModal(modal,"ranking")
}
function handlePowerRankingProfile(result,context=null){
 const profile=result?.profile??(result?.playerId?result:null),expected=String(context?.playerId??profile?.playerId??"");
 const modal=context?.modal??[...document.querySelectorAll("[data-power-ranking-profile-modal]")].find(entry=>entry.dataset.playerId===expected);
 if(!modal?.isConnected||modal.dataset.playerId!==expected||profile&&String(profile.playerId)!==expected)return;
 // A missing-profile callback has no playerId on older clients. Only the
 // captured request promise may turn the matching modal into an error state.
 if(!profile&&!context)return;
 if(profile)profile._receivedAt=Date.now();powerRankingUi.profile=profile;powerRankingUi.loadingProfile=false;renderPowerRankingProfileModal(modal,profile)
}
function handlePowerRankingReward(delivery){
 const id=String(delivery?.deliveryId??"").slice(0,160);if(!id||!delivery?.reward)return{ok:false,reason:"invalid"};
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),queued=enqueueNoticeReward(save.state,{id,source:"ranking",kind:"gift",icon:"event",label:"週間ランキング",title:`${delivery.title??"週間戦力ランキング"}・最終 #${Math.max(1,Number(delivery.rank)||1)}`,body:rewardDescription(delivery.reward),reward:delivery.reward,seasonId:delivery.seasonId,rank:delivery.rank,receivedAt:delivery.createdAt??Date.now()});
 if(!queued.ok){save.state=backup;return queued}if(!queued.duplicate&&!save.save()){save.state=backup;return{ok:false,reason:"save"}}
 onlinePartyController?.ackPowerRankingReward?.(id);if(!queued.duplicate)showToast(`週間ランキング #${Math.max(1,Number(delivery.rank)||1)}の報酬が届きました`);return{ok:true,duplicate:queued.duplicate}
}
function rankingReferenceNow(serverNow=0,receivedAt=0){
 const server=Number(serverNow)||0,received=Number(receivedAt)||0;return server>0?server+Math.max(0,Date.now()-received):Date.now()
}
function rankingPresenceRefreshDelay(entries,{serverNow=0,receivedAt=0,presenceOnlineMs=90000}={}){
 const now=rankingReferenceNow(serverNow,receivedAt),freshFor=Math.max(30000,Number(presenceOnlineMs)||90000),delays=[];
 for(const entry of entries??[]){
  const value=entry?.lastActiveAt??entry?.updatedAt,timestamp=typeof value==="number"?value:Date.parse(value);if(!Number.isFinite(timestamp)||timestamp<=0)continue;
  const elapsed=Math.max(0,now-timestamp);if(entry?.online===true&&elapsed<=freshFor)delays.push(freshFor-elapsed+100);else if(elapsed<3600000)delays.push(60000-elapsed%60000+100);else if(elapsed<86400000)delays.push(3600000-elapsed%3600000+100);else if(elapsed<2592000000)delays.push(86400000-elapsed%86400000+100)
 }
 return delays.length?Math.max(1000,Math.min(60000,...delays)):0
}
function schedulePowerRankingPresenceRefresh(modal,entries,options,renderPresence){
 clearTimeout(modal?._powerRankingPresenceTimer);if(!modal?.isConnected)return;const delay=rankingPresenceRefreshDelay(entries,options);if(!delay)return;
 modal._powerRankingPresenceTimer=setTimeout(()=>{modal._powerRankingPresenceTimer=null;if(modal.isConnected)renderPresence()},delay)
}
function rankingPresence(entry,{serverNow=0,receivedAt=0,presenceOnlineMs=90000}={}){
 const value=entry?.lastActiveAt??entry?.updatedAt,timestamp=typeof value==="number"?value:Date.parse(value),now=rankingReferenceNow(serverNow,receivedAt),freshFor=Math.max(30000,Number(presenceOnlineMs)||90000);
 if(!Number.isFinite(timestamp)||timestamp<=0)return{online:false,text:"30日以上前"};
 const elapsed=Math.max(0,now-timestamp),online=entry?.online===true&&elapsed<=freshFor;if(online)return{online:true,text:"ログイン中"};
 const minutes=Math.max(1,Math.floor(elapsed/60000));if(minutes<60)return{online:false,text:`${minutes}分前`};
 const hours=Math.floor(minutes/60);if(hours<24)return{online:false,text:`${hours}時間前`};
 const days=Math.floor(hours/24);return{online:false,text:days<30?`${days}日前`:"30日以上前"}
}
function rankingPresenceMarkup(entry,options){
 const presence=rankingPresence(entry,options);return`<span class="power-ranking-presence ${presence.online?"online":"offline"}" data-online="${presence.online}"><i aria-hidden="true"></i>${presence.text}</span>`
}
function combatPowerOwnMarkup(){
 const current=partyCombatPower(save.state),record=save.state.records?.combatPower??{},highest=Math.max(current,Number(record.highest)||0),history=[...(record.history??[])].reverse(),breakdown=partyCombatPowerBreakdown(save.state);
 const memberBreakdown=breakdown.members.map(row=>`<article><div><b>${escapeAttribute(displayName(row.monster))}</b><small>Lv.${Number(row.monster.level).toLocaleString()}</small></div><span><small>Lv成長</small><strong>+${formatCombatPower(row.level)}</strong></span><span><small>装備関連</small><strong>+${formatCombatPower(row.equipment)}</strong></span><em>${formatCombatPower(row.total)}</em></article>`).join("");
 const rows=history.length?history.slice(0,8).map((entry,index)=>{const date=new Date(entry.at),dateText=Number.isFinite(date.getTime())?date.toLocaleString("ja-JP",{timeZone:"Asia/Tokyo",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}):"記録時刻不明";return`<div class="power-history-row"><span>${pixelIcon(index===0?"event":"skills")}</span><div><b>${formatCombatPower(entry.power)}</b><small>${entry.delta>0?`+${formatCombatPower(entry.delta)}・`:"記録開始・"}${entry.floor}階時点</small></div><time>${dateText}</time></div>`}).join(""):'<p class="muted">戦力更新履歴はまだありません。</p>';
 return`<div class="power-record-summary"><div><small>現在戦力</small><b>${formatCombatPower(current)}</b></div><div><small>歴代最高戦力</small><strong>${formatCombatPower(highest)}</strong></div><div><small>${current>=highest?"最高記録を維持中":"最高更新まで"}</small><b>${current>=highest?pixelIcon("event"):formatCombatPower(highest-current)}</b></div></div><section class="power-source-breakdown"><h3>戦力の内訳</h3><div class="power-source-total"><span>個体基礎 ${formatCombatPower(breakdown.base)}</span><b>Lv成長 +${formatCombatPower(breakdown.level)}</b><strong>装備関連 +${formatCombatPower(breakdown.equipment)}</strong></div>${memberBreakdown}</section><h3 class="power-history-title">最高戦力の更新履歴</h3><div class="power-history-list">${rows}</div><small class="muted">「装備関連」は装備Lv・強化・シリーズ・厳選効果を含む戦力換算値です。前衛／後衛による補正はありません。</small>`
}
function powerRankingEntryMarkup(entry,{self=false,serverNow=0,receivedAt=0,presenceOnlineMs=90000}={}){
 const icon=entry?.icon??entry?.party?.[0]??{},rank=Math.max(1,Math.floor(Number(entry?.rank)||1)),fallback=icon.fallbackEmoji??SPECIES[icon.speciesId]?.emoji??"魔";
 return`<button type="button" class="power-ranking-row ${self?"is-self":""}" data-power-ranking-player="${escapeAttribute(entry?.playerId??"")}"><span class="power-ranking-position ${rank<=3?`rank-${rank}`:""}">${rank<=3?["","Ⅰ","Ⅱ","Ⅲ"][rank]:`#${rank}`}</span><span class="power-ranking-avatar">${monsterVisual(icon,fallback,{className:"power-ranking-monster-visual"})}</span><span class="power-ranking-identity"><small>${self?"YOU・":""}${escapeAttribute(icon.name??"スロット1")}</small><b>${escapeAttribute(entry?.displayName??"冒険者")}</b><em>最高 ${Math.max(1,Math.floor(Number(entry?.maxFloor)||1)).toLocaleString()}階</em>${rankingPresenceMarkup(entry,{serverNow,receivedAt,presenceOnlineMs})}</span><strong>${formatCombatPower(entry?.power)}</strong><i aria-hidden="true">›</i></button>`
}
function combatPowerRankingMarkup(){
 const controller=onlinePartyController,state=powerRankingUi.state,connected=Boolean(controller?.connectionReady),supported=powerRankingSupported();
 const knownUnsupported=!supported&&(connected||state?.supported===false&&Number(controller?.capabilities?.size)>0);
 if(knownUnsupported)return`<div class="power-ranking-unavailable"><span>${pixelIcon("notice")}</span><h3>ランキングは利用できません</h3><p>同梱のRelease 201版オンラインサーバーへ更新すると、全プレイヤーの最新戦力を確認できます。</p></div>`;
 if(powerRankingUi.loadingList&&!state)return`<div class="power-ranking-loading"><i></i><i></i><i></i><p>最新ランキングを取得中…</p></div>`;
 if(powerRankingUi.listTimedOut&&!state)return`<div class="power-ranking-unavailable is-connecting"><span>${pixelIcon("notice")}</span><h3>ランキングを取得できませんでした</h3><p>通信状態を確認して、もう一度お試しください。</p><button type="button" data-power-ranking-retry>再試行する</button></div>`;
 if(!connected&&!state)return`<div class="power-ranking-unavailable is-connecting"><span>${pixelIcon("event")}</span><h3>サーバーへ接続中</h3><p>接続できると、自動で最新ランキングを表示します。</p><button type="button" data-power-ranking-retry>再接続する</button></div>`;
 const source=Array.isArray(state?.entries)?state.entries:[],entries=source.slice(0,100),selfEntry=state?.self??null,ids=new Set(entries.map(entry=>String(entry?.playerId??""))),presenceOptions={serverNow:state?.serverNow,receivedAt:state?._receivedAt,presenceOnlineMs:state?.presenceOnlineMs},rows=entries.map(entry=>powerRankingEntryMarkup(entry,{self:String(entry?.playerId??"")===String(controller?.selfId??""),...presenceOptions})).join(""),selfRow=selfEntry&&!ids.has(String(selfEntry.playerId??""))?`<div class="power-ranking-self-divider"><span>あなたの順位</span></div>${powerRankingEntryMarkup(selfEntry,{self:true,...presenceOptions})}`:"";
 const endsAt=Number(state?.season?.endsAt)||0,settlement=endsAt?new Date(endsAt).toLocaleString("ja-JP",{timeZone:"Asia/Tokyo",month:"numeric",day:"numeric",weekday:"short",hour:"2-digit",minute:"2-digit"}):"毎週月曜 0:00";
 return`<section class="power-ranking-board"><header><div><small>ALL PLAYERS・TOP 100</small><h3>全体戦力ランキング</h3></div><button type="button" data-power-ranking-refresh ${powerRankingUi.loadingList?"disabled":""}>${powerRankingUi.loadingList?"更新中…":powerRankingUi.listTimedOut?"再試行":"更新"}</button></header><div class="power-ranking-season"><span>${pixelIcon("event")}</span><div><b>TOP 100 週間報酬</b><small>${settlement} JSTに順位確定・お知らせへ配布</small></div></div><p class="power-ranking-note ${powerRankingUi.listTimedOut?"is-error":""}">${powerRankingUi.listTimedOut?"更新できませんでした。表示中の順位は前回取得時点です。":`直近30日以内に更新したプレイヤー・全${Math.max(entries.length,Number(state?.total)||0).toLocaleString()}人`}</p><div class="power-ranking-list">${rows||'<p class="muted">ランキング登録者はまだいません。</p>'}${selfRow}</div></section>`
}
function requestPowerRankings({force=false}={}){
 const controller=ensurePowerRankingConnection();if(powerRankingUi.loadingList&&!force)return;
 powerRankingUi.loadingList=true;powerRankingUi.listTimedOut=false;const modal=document.querySelector("[data-power-record-modal]");if(modal?.dataset.powerRecordTab==="ranking")renderCombatPowerRecordModal(modal,"ranking");
 const requestToken=modal?(modal._powerRankingListRequestToken=(Number(modal._powerRankingListRequestToken)||0)+1):0;
 clearTimeout(modal?._powerRankingListTimer);if(modal)modal._powerRankingListTimer=setTimeout(()=>{if(!modal.isConnected||modal.dataset.powerRecordTab!=="ranking"||modal._powerRankingListRequestToken!==requestToken||!powerRankingUi.loadingList)return;powerRankingUi.loadingList=false;powerRankingUi.listTimedOut=true;modal._powerRankingListTimer=null;renderCombatPowerRecordModal(modal,"ranking")},12000);
 const fail=reason=>{if(reason==="unsupported"){powerRankingUi.loadingList=false;powerRankingUi.listTimedOut=false}else if(modal?.isConnected&&modal.dataset.powerRecordTab==="ranking"&&modal._powerRankingListRequestToken===requestToken){powerRankingUi.loadingList=false;powerRankingUi.listTimedOut=true}else return;clearTimeout(modal?._powerRankingListTimer);if(modal)modal._powerRankingListTimer=null;if(modal?.isConnected&&modal.dataset.powerRecordTab==="ranking")renderCombatPowerRecordModal(modal,"ranking")};
 if(typeof controller?.requestPowerRankings!=="function"){fail("unavailable");return}
 try{Promise.resolve(controller.requestPowerRankings()).then(result=>{if(result===false||result?.ok===false&&!result?.queued)fail(result?.reason)}).catch(()=>fail("network"))}catch{fail("network")}
}
function renderCombatPowerRecordModal(modal,tab="own"){
 if(!modal)return;clearTimeout(modal._powerRankingPresenceTimer);modal._powerRankingPresenceTimer=null;const previousList=modal.querySelector(".power-ranking-list");if(previousList)modal._powerRankingScrollTop=previousList.scrollTop;modal.dataset.powerRecordTab=tab;const body=modal.querySelector(".game-modal-body");if(!body)return;if(tab!=="ranking"){clearTimeout(modal._powerRankingListTimer);modal._powerRankingListTimer=null;powerRankingUi.loadingList=false}
 body.innerHTML=`<div class="power-record-tabs" role="tablist" aria-label="戦力記録の表示"><button type="button" role="tab" data-power-record-tab="own" aria-selected="${tab==="own"}">自分の記録</button><button type="button" role="tab" data-power-record-tab="ranking" aria-selected="${tab==="ranking"}">全体ランキング</button></div><div class="power-record-panel">${tab==="ranking"?combatPowerRankingMarkup():combatPowerOwnMarkup()}</div>`;
 const rankingList=body.querySelector(".power-ranking-list");if(rankingList){rankingList.scrollTop=Math.max(0,Number(modal._powerRankingScrollTop)||0);rankingList.addEventListener("scroll",()=>{modal._powerRankingScrollTop=rankingList.scrollTop},{passive:true})}
 body.querySelectorAll("[data-power-record-tab]").forEach(button=>button.onclick=()=>{const next=button.dataset.powerRecordTab;renderCombatPowerRecordModal(modal,next);if(next==="ranking")requestPowerRankings({force:Boolean(powerRankingUi.state)})});
 body.querySelector("[data-power-ranking-refresh]")?.addEventListener("click",()=>requestPowerRankings({force:true}));
 body.querySelector("[data-power-ranking-retry]")?.addEventListener("click",()=>{ensurePowerRankingConnection({force:true});requestPowerRankings({force:true})});
 body.querySelectorAll("[data-power-ranking-player]").forEach(button=>button.onclick=()=>openPowerRankingProfile(button.dataset.powerRankingPlayer));
 if(tab==="ranking"&&powerRankingUi.state){const rankingState=powerRankingUi.state,entries=[...(rankingState.entries??[]),rankingState.self].filter(Boolean),options={serverNow:rankingState.serverNow,receivedAt:rankingState._receivedAt,presenceOnlineMs:rankingState.presenceOnlineMs};schedulePowerRankingPresenceRefresh(modal,entries,options,()=>renderCombatPowerRecordModal(modal,"ranking"))}
}
function rankingEquipmentMarkup(item){
 const rarity=String(item?.rarity??"N"),slot=slotLabel(item?.slot??"装備");return`<li><span>${equipmentVisual(item,{className:"power-ranking-equipment-art",label:"公開装備"})}</span><div><small>${escapeAttribute(slot)}・${escapeAttribute(rarity)}</small><b>${escapeAttribute(item?.name??"装備")}</b><em>Lv.${Math.max(1,Math.floor(Number(item?.level)||1)).toLocaleString()}${Number(item?.plus)>0?`・+${Math.floor(Number(item.plus))}`:""}</em></div></li>`
}
function renderPowerRankingProfileModal(modal,profile){
 if(!modal)return;clearTimeout(modal._powerRankingPresenceTimer);modal._powerRankingPresenceTimer=null;const body=modal.querySelector(".game-modal-body");if(!body)return;
 if(powerRankingUi.loadingProfile&&!profile){body.innerHTML='<div class="power-ranking-profile-loading"><i></i><p>公開パーティーを読み込み中…</p></div>';return}
 clearTimeout(modal._powerRankingProfileTimer);modal._powerRankingProfileTimer=null;
 if(!profile){body.innerHTML='<div class="power-ranking-unavailable"><h3>パーティー情報を取得できませんでした</h3><p>相手がランキング更新後に編成を変更した可能性があります。</p></div>';return}
 const party=Array.isArray(profile.party)?profile.party.slice(0,4):[],cards=party.map((monster,index)=>{const fallback=monster?.fallbackEmoji??SPECIES[monster?.speciesId]?.emoji??"魔",equipment=(monster.equipment??[]).slice(0,6).map(rankingEquipmentMarkup).join(""),circle=monster.magicCircle??{};return`<article class="power-ranking-party-card"><header><span>${index+1}</span>${monsterVisual(monster,fallback,{className:"power-ranking-profile-monster"})}<div><small>${escapeAttribute(monster.rarity??"N")}・Lv.${Math.max(1,Math.floor(Number(monster.level)||1)).toLocaleString()}</small><b>${escapeAttribute(monster.name??"仲間")}</b><strong>戦力 ${formatCombatPower(monster.power)}</strong></div></header><div class="power-ranking-circle"><span>${pixelIcon("event")}</span><div><small>魔法陣</small><b>${escapeAttribute(circle.name??"魔法陣なし")}${Number(circle.level)>0?` Lv.${Math.floor(Number(circle.level))}`:""}</b></div></div><ul>${equipment||'<li class="empty"><div><b>装備なし</b><small>公開装備はありません</small></div></li>'}</ul></article>`}).join("");
 const presenceOptions={serverNow:profile.serverNow,receivedAt:profile._receivedAt,presenceOnlineMs:profile.presenceOnlineMs};body.innerHTML=`<div class="power-ranking-profile-head"><span>${pixelIcon("formation")}</span><div><small>PUBLIC PARTY・最高 ${Math.max(1,Math.floor(Number(profile.maxFloor)||1)).toLocaleString()}階</small><h3>${escapeAttribute(profile.displayName??"冒険者")}</h3><b>部隊戦力 ${formatCombatPower(profile.power)}</b></div>${rankingPresenceMarkup(profile,presenceOptions)}</div><div class="power-ranking-party-list">${cards||'<p class="muted">公開パーティーはありません。</p>'}</div>`;schedulePowerRankingPresenceRefresh(modal,[profile],presenceOptions,()=>renderPowerRankingProfileModal(modal,profile))
}
function openPowerRankingProfile(playerId){
 const id=String(playerId??"").slice(0,32);if(!id)return;powerRankingUi.selectedPlayerId=id;powerRankingUi.profile=null;powerRankingUi.loadingProfile=true;
 app.insertAdjacentHTML("beforeend",Modal("公開パーティー",'<div class="power-ranking-profile-loading"><i></i><p>公開パーティーを読み込み中…</p></div>',"ランキングへ戻る"));const modal=topModal(),close=()=>{clearTimeout(modal._powerRankingProfileTimer);clearTimeout(modal._powerRankingPresenceTimer);modal.remove()};modal.dataset.powerRankingProfileModal="1";modal.dataset.playerId=id;modal.querySelector("[data-modal-primary]").onclick=close;modal.querySelector("[data-modal-dismiss]").onclick=close;
 modal._powerRankingProfileTimer=setTimeout(()=>{if(modal.isConnected&&modal.dataset.playerId===id){powerRankingUi.loadingProfile=false;renderPowerRankingProfileModal(modal,null)}},12000);
 const controller=ensurePowerRankingConnection();if(typeof controller?.requestPowerRankingProfile!=="function"||controller.connectionReady&&!powerRankingSupported()){powerRankingUi.loadingProfile=false;renderPowerRankingProfileModal(modal,null);return}
 try{Promise.resolve(controller.requestPowerRankingProfile(id)).then(result=>{if(!modal.isConnected||modal.dataset.playerId!==id)return;if(result?.queued)return;if(result?.profile||result===null||result?.ok===false)handlePowerRankingProfile(result,{modal,playerId:id})}).catch(()=>handlePowerRankingProfile(null,{modal,playerId:id}))}catch{handlePowerRankingProfile(null,{modal,playerId:id})}
}
function openCombatPowerHistory(){
 app.insertAdjacentHTML("beforeend",Modal("戦力記録",'<div class="power-record-panel"></div>',"閉じる"));const modal=topModal(),close=()=>{clearTimeout(modal._powerRankingListTimer);clearTimeout(modal._powerRankingPresenceTimer);powerRankingUi.loadingList=false;modal.remove()};modal.dataset.powerRecordModal="1";renderCombatPowerRecordModal(modal,"own");modal._onDismiss=close;modal.querySelector("[data-modal-primary]").onclick=close
}
function idleReturnPreviewBody(preview){
 const capText=preview.capped&&preview.equipmentCapped?"・両方とも上限到達":preview.capped?"・GOLD上限到達":preview.equipmentCapped?"・装備上限到達":"";
 return`<div class="idle-reward-v2"><div class="idle-v2-hero"><div><small>放置探索時間</small><strong>GOLD ${compactElapsedText(preview.goldElapsedMs)}</strong><p>装備 ${compactElapsedText(preview.equipmentElapsedMs)} / 最大${preview.maxHours}時間${capText}</p></div><span class="home-pixel-icon icon-chest idle-v2-chest-icon" aria-hidden="true"></span></div><div class="idle-v2-reward-grid"><article><i>${pixelIcon("coin")}</i><small>受取GOLD</small><b>${preview.gold.toLocaleString()}G</b></article><article><i>${pixelIcon("equipment")}</i><small>装備ドロップ</small><b>${preview.equipmentCount}個</b></article><article><i>${pixelIcon("dungeon")}</i><small>探索地点</small><b>${preview.expeditionFloor}階層帯</b></article><article><i>${pixelIcon("event")}</i><small>換算探索量</small><b>${preview.floorUnits}階層分</b></article></div><div class="idle-v2-route"><span>最高到達階層の${Math.round(preview.expeditionRate*100)}%</span><i style="--idle-progress:${Math.min(100,preview.goldElapsedMs/(preview.maxHours*3600000)*100)}%"></i><small>GOLDは5分ごと／装備は2時間ごとに蓄積（装備は最大12個）。受取時計は別々に保持されます。</small></div>${returnRarityTable()}</div>`;
}
function showIdleReturnReport(result){
 const best=result.equipment.reduce((current,entry)=>!current||(RARITY_ORDER[equipmentDisplayRarity(entry.item)]??0)>(RARITY_ORDER[equipmentDisplayRarity(current.item)]??0)?entry:current,null);
 const equipmentRows=result.equipment.length?result.equipment.map(({item,receipt})=>{const rarity=equipmentDisplayRarity(item);return`<div class="return-reward-item rarity-${rarity}"><b>${rarity} ${item.name}</b><small>${receipt.message}</small></div>`}).join(""):'<p class="muted">今回は装備ドロップなし</p>';
 const bestRarity=best?equipmentDisplayRarity(best.item):null,highlight=best&&(RARITY_ORDER[bestRarity]??0)>=RARITY_ORDER.SSR?`<div class="return-reward-highlight rarity-${bestRarity}"><strong>${bestRarity} IDLE DROP!</strong><span>${best.item.name}</span></div>`:"";
 const grade=returnRewardGrade(result.floorUnits,result.equipment);
 app.insertAdjacentHTML("beforeend",Modal("放置帰還報告",`<div class="return-reward-report idle-return-report">${highlight}${returnGradeBadge(grade)}<div class="idle-return-emblem">🕯️</div><p><span>GOLD探索時間</span><b>${compactElapsedText(result.goldElapsedMs)}</b></p><p><span>装備探索時間</span><b>${compactElapsedText(result.equipmentElapsedMs)}</b></p><p><span>探索地点</span><b>最高到達の${Math.round(result.expeditionRate*100)}%・${result.expeditionFloor}階層帯</b></p><p><span>換算探索量</span><b>${result.floorUnits}階層分</b></p><p class="return-reward-gold"><span>獲得GOLD</span><b>${result.gold.toLocaleString()}G</b></p><h3>獲得装備 ${result.equipment.length}個</h3><div class="return-reward-items">${equipmentRows}</div>${returnRarityTable()}</div>`,"確認"));
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
  ?`<i class="claim-chest">🎁</i><span><strong>報酬をすべて受け取る</strong><small>${preview.gold.toLocaleString()}G ＋ 装備${preview.equipmentCount}個</small></span><em>${preview.capped&&preview.equipmentCapped?"MAX報酬":"受取可能"}</em>`
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
function openCampaignReincarnationDialog(){
 const progress=normalizeCampaignReincarnationState(save.state);if(!progress.available||save.state.campaign100?.finalCompleted!==true){showToast("勇者軍最終決戦を制すると輪廻を選べます");return}const next=progress.cycle+1,difficulty=1+next*.28,reward=1+next*.12;
 app.insertAdjacentHTML("beforeend",Modal("任意の輪廻",`<div class="reincarnation-confirm"><section class="reincarnation-cycle"><small>NEXT PROPHECY</small><b>輪廻 ${next}</b><span>敵戦力 ×${difficulty.toFixed(2)}・通常GOLD/EXP ×${reward.toFixed(2)}</span></section><p>現在の世界で探索と育成を続けるなら、何もせず閉じてください。輪廻は任意です。</p><ul><li class="keep">保持：仲間・装備・通貨・所持品・図鑑・エンディング記録</li><li class="reset">再始動：1階からの踏破・勇者遭遇・王室会話</li><li>固有ボス装備など一度きりの報酬は再配布されません</li></ul></div>`,`輪廻${next}を始める`));const modal=topModal();modal.classList.add("reincarnation-modal");modal.querySelector("[data-modal-primary]").onclick=()=>{const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),result=beginOptionalCampaignReincarnation(save.state,{resultId:`reincarnation:${next}:${Date.now()}`});if(!result.ok){showToast("輪廻を開始できませんでした");return}if(!save.save()){save.state=backup;showToast("輪廻状態を保存できませんでした");return}modal.remove();showToast(`輪廻${result.cycle}を開始・1階から再踏破`);go("home")}
}
function openExploreFloorSelector(){
 const heroLedger=campaignHeroLedger(),rewindMax=heroLedger.rewind?.active?Math.max(81,Math.min(CAMPAIGN_MAX_FLOOR,Number(heroLedger.rewind.currentFloor)||81)):null,reachedMax=rewindMax??campaignReincarnationFloorLimit(save.state);
 const gmMax=Math.min(9998,Math.max(0,Number(save.state.settings?.gmFloorUnlockMax??save.state.gameMaster?.floorUnlockMax)||0));
 const max=rewindMax??Math.max(reachedMax,gmMax),minimum=rewindMax??1,gmNotice=rewindMax?`<p class="departure-gm-notice">予言の巻き戻し中：${rewindMax}階から再攻略します</p>`:gmMax>reachedMax?`<p class="departure-gm-notice">GM出発権限：1〜${gmMax.toLocaleString()}階（最高到達階 ${reachedMax.toLocaleString()} は変更されません）</p>`:"";
 const party=save.state.party.map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean);
 const partyCards=party.map(monster=>{const species=SPECIES[monster.speciesId]??{};return`<article class="departure-party-card">${monsterVisual(monster,species.emoji??"👹",{className:"departure-monster-visual"})}<b>${displayName(monster)}</b><small>Lv.${monster.level}・+${monster.plus??0}</small></article>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal("探索開始",`<div class="departure-dialog"><small class="departure-eyebrow">ABYSS DOMINION</small><p>再開する階層を選択</p><div class="departure-floor-control"><button type="button" data-floor-step="-1" aria-label="1階戻る">−</button><input id="floorSelect" type="number" inputmode="numeric" min="${minimum}" max="${max}" value="${max}" aria-label="出発階層"><button type="button" data-floor-step="1" aria-label="1階進む">＋</button></div><p class="muted">${rewindMax?`${max.toLocaleString()}階から再開`:`1〜${max.toLocaleString()}階から出発できます`}</p>${gmNotice}<h3>現在の部隊</h3><div class="departure-party-grid">${partyCards}</div></div>`,`出発する`));
 const modal=topModal(),button=modal.querySelector("[data-modal-primary]"),input=modal.querySelector("#floorSelect");
 modal.classList.add("departure-modal");
 modal.querySelector(".game-modal-card")?.classList.add("departure-modal-card");
 const normalizeFloor=()=>{input.value=String(Math.max(minimum,Math.min(max,Number(input.value)||max)))};
 modal.querySelectorAll("[data-floor-step]").forEach(step=>step.addEventListener("click",()=>{input.value=String((Number(input.value)||max)+Number(step.dataset.floorStep));normalizeFloor()}));
 input.addEventListener("change",normalizeFloor);
 button.onclick=()=>{const floor=Math.max(minimum,Math.min(max,Number(modal.querySelector("#floorSelect").value)||max));completeContextGuide("dungeon_departure",{quiet:true});save.state.settings.exploreAutoMode="off";save.state.settings.exploreAutoMenuOpen=false;save.state.player.currentFloor=floor;save.state.player.inRun=true;save.state.expeditionAffectionDeaths={};beginManualExpedition(save.state,floor);if(heroLedger.rewind?.active){normalizeCampaignState(save.state).floors[String(floor)]=beginCampaignFloorReplay(save.state,floor,save.state.player.exploreRun?.id)}const online=onlinePartyPersistentState();online.activeExpeditionRunId=null;online.activeManualExploreRunId=null;beginSecretRoomExpedition(save.state);clearExpeditionSnapshot();save.save();snapshot=null;modal.remove();go("explore")};
 requestAnimationFrame(()=>showContextGuide({id:"dungeon_departure",title:"1階から出発しよう",text:"最初は1階のままでOK。「出発する」を押して探索を始めよう。",target:button,placement:"bottom"}));
}
function openUnavailableHomeFeature(title,icon){
 app.insertAdjacentHTML("beforeend",Modal(title,`<div class="home-unavailable ornate-unavailable">${icon?`<span>${icon}</span>`:'<i class="unavailable-party-emblem" aria-hidden="true"></i>'}<small>COMING SOON</small><h3>現在準備中です</h3><p>完成したコンテンツから順次解放されます。</p></div>`,"閉じる"));
 const modal=topModal();modal.classList.add("ornate-unavailable-modal");topModalButton().onclick=closeTopModal;
}
function grantNoticeMythicEquipment({plus=20,entry}={}){
 const slots=["weapon","armor","accessory"],seed=[...String(entry?.id??"reward")].reduce((sum,char)=>sum+char.charCodeAt(0),0),slot=slots[seed%slots.length],item=createEquipment(slot,{rarity:"神話"});
 item.level=Math.max(1,Math.min(100000,Math.round((Number(save.state.player.maxFloor)||1)*1.35)));item.plus=Math.max(0,Math.min(999,Math.floor(Number(plus)||20)));item.obtainedMethod=entry?.source==="ranking"?"onlineRankingReward":entry?.source==="achievement"?"achievementReward":"codexMilestoneReward";item.obtainedFloor=Math.max(1,Number(save.state.player.maxFloor)||1);item.favorite=true;
 const receipt=receiveEquipment(save.state,item,{bossReward:true}),stored=Boolean(receipt&&receipt.location!=="sold"&&receipt.location!=="discarded"&&receipt.ok!==false);return{ok:stored,item,receipt};
}
function claimRewardInboxEntry(id){
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),result=claimNoticeReward(save.state,id,{grantMythicEquipment:grantNoticeMythicEquipment});
 if(!result.ok){save.state=backup;return result}if(!save.save()){save.state=backup;return{ok:false,reason:"save"}}return result;
}
function rewardInboxCard(entry){
 const claimed=Boolean(entry.claimedAt),rank=entry.rank?`・最終順位 #${entry.rank}`:"",received=entry.receivedAt?new Date(entry.receivedAt).toLocaleDateString("ja-JP",{timeZone:"Asia/Tokyo",month:"numeric",day:"numeric"}):"到着";
 const semanticIcons=new Set(["map","summon","event","crossed-swords","capture","chest","notice","formation","growth","equipment"]),iconKey=entry.source==="achievement"?achievementIconKeyForId(entry):semanticIcons.has(String(entry.icon??""))?String(entry.icon):null,icon=iconKey?pixelIcon(iconKey):escapeAttribute(entry.icon??"🎁");
 return`<article class="home-notice-card inbox-reward ${claimed?"read":"unread"}" data-notice-kind="gift" data-inbox-reward="${escapeAttribute(entry.id)}"><span class="notice-card-icon">${icon}</span><div class="notice-card-copy"><span class="notice-card-meta"><small class="notice-type gift">${escapeAttribute(entry.label??"達成報酬")}${rank}</small><time>${received}</time></span><b>${escapeAttribute(entry.title??"報酬が届きました")}</b><small>${escapeAttribute(entry.body||rewardDescription(entry.reward))}</small></div>${claimed?'<em class="notice-gift-claimed">受取済</em>':`<button type="button" class="notice-gift-claim" data-claim-inbox-reward="${escapeAttribute(entry.id)}">受け取る</button>`}</article>`;
}
function openNoticeCenter(){
 syncCollectionRewardInbox(save.state);
 syncAchievementRewardInbox(save.state);
 const noticeState=normalizeNoticeState(save.state),readIds=new Set(noticeState.readIds),noticeDefinitions=activeNoticeDefinitions(save.state);
 const daily=dailyNoticeGiftStatus(save.state),dailyRow=`<article class="home-notice-card daily-gift ${daily.available?"unread":"read"}" data-notice-kind="gift"><span class="notice-card-icon">🎁</span><div class="notice-card-copy"><span class="notice-card-meta"><small class="notice-type gift">毎日配布</small><time>本日 23:59まで</time></span><b>本日のログイン支援物資</b><small>捕獲結晶 ×${DAILY_NOTICE_GIFT.captureCrystals}・魔晶石 ×${DAILY_NOTICE_GIFT.crystals}<br>当日分のみ受け取れます。未受取分は翌日に持ち越されません。</small></div>${daily.available?'<button type="button" class="notice-gift-claim" data-claim-daily-gift>受け取る</button>':'<em class="notice-gift-claimed">受取済</em>'}</article>`;
 const inboxRows=noticeState.rewardInbox.map(rewardInboxCard).join(""),pendingCount=pendingNoticeRewards(save.state).length,claimAll=pendingCount?`<button type="button" class="notice-claim-all" data-claim-all-inbox>未受取 ${pendingCount}件を一括受取</button>`:"";
 const rows=dailyRow+inboxRows+noticeDefinitions.map(notice=>{
  const unread=!readIds.has(notice.id),details=(notice.details??[]).map(line=>`<li>${line}</li>`).join("");
  return`<article class="home-notice-card notice-entry ${unread?"unread":"read"}" data-notice-id="${notice.id}" data-notice-kind="${notice.kind}"><button type="button" class="notice-card-toggle" data-notice-toggle="${notice.id}" aria-expanded="false"><span class="notice-card-icon">${notice.icon}</span><span class="notice-card-copy"><span class="notice-card-meta"><small class="notice-type ${notice.kind}">${notice.label}</small><time>${String(notice.publishedAt??"").replaceAll("-",".")}</time></span><b>${notice.title}</b><small>${notice.body}</small></span><em>${unread?"NEW":"＋"}</em></button><div class="notice-card-detail" data-notice-detail="${notice.id}" hidden><p>${notice.body}</p>${details?`<ul>${details}</ul>`:""}${notice.action?`<button type="button" class="notice-detail-action" data-home-notice="${notice.action}">${notice.action==="tutorial"?"遊び方を開く":"図鑑を開く"}</button>`:""}</div></article>`;
 }).join("");
 const counts={gift:1+noticeState.rewardInbox.length,event:noticeDefinitions.filter(notice=>notice.kind==="event").length,update:noticeDefinitions.filter(notice=>notice.kind==="update").length,maintenance:noticeDefinitions.filter(notice=>notice.kind==="maintenance").length},tab=(id,label,count)=>`<button type="button" role="tab" data-notice-filter="${id}" class="${id==="all"?"active":""}" aria-selected="${id==="all"}"><span>${label}</span><small>${count}</small></button>`;
 app.insertAdjacentHTML("beforeend",Modal("お知らせ",`<div class="notice-center-v2">${claimAll}<div class="notice-tabs" role="tablist" aria-label="お知らせ区分">${tab("all","すべて",1+noticeState.rewardInbox.length+noticeDefinitions.length)}${tab("gift","配布",counts.gift)}${tab("event","イベント",counts.event)}${tab("update","更新",counts.update)}${tab("maintenance","保守",counts.maintenance)}</div><div class="home-notice-list">${rows}<div class="notice-empty" hidden><span>📭</span><b>該当するお知らせはありません</b><small>別の区分を選んでください。</small></div></div><small class="notice-footer">配布報酬はセーブ完了後に受取済みになります。</small></div>`,"閉じる"));
 const modal=topModal();
 modal.classList.add("notice-modal-v2");
 const homeNoticeButton=document.getElementById("openNoticeCenter");
 const refreshNoticeButton=()=>{const count=noticeAttentionCount(save.state);homeNoticeButton?.classList.toggle("ready",count>0);if(homeNoticeButton?.querySelector("small"))homeNoticeButton.querySelector("small").textContent=count?`未読 ${count}`:"確認済み";if(count&&!homeNoticeButton?.querySelector(".home-notification-dot"))homeNoticeButton?.insertAdjacentHTML("afterbegin",'<i class="home-notification-dot"></i>');if(!count)homeNoticeButton?.querySelector(".home-notification-dot")?.remove()};refreshNoticeButton();
 const syncNoticeEmpty=()=>{const visible=[...modal.querySelectorAll("[data-notice-kind]")].filter(entry=>!entry.hidden);modal.querySelector(".notice-empty").hidden=visible.length>0};
 modal.querySelectorAll("[data-notice-filter]").forEach(filterTab=>filterTab.addEventListener("click",()=>{modal.querySelectorAll("[data-notice-filter]").forEach(entry=>{const active=entry===filterTab;entry.classList.toggle("active",active);entry.setAttribute("aria-selected",String(active))});modal.querySelectorAll("[data-notice-kind]").forEach(entry=>entry.hidden=filterTab.dataset.noticeFilter!=="all"&&entry.dataset.noticeKind!==filterTab.dataset.noticeFilter);syncNoticeEmpty()}));
 modal.querySelectorAll("[data-notice-toggle]").forEach(toggle=>toggle.addEventListener("click",()=>{const id=toggle.dataset.noticeToggle,detail=modal.querySelector(`[data-notice-detail="${id}"]`),open=toggle.getAttribute("aria-expanded")!=="true";modal.querySelectorAll("[data-notice-toggle]").forEach(other=>{if(other===toggle)return;other.setAttribute("aria-expanded","false");const otherDetail=modal.querySelector(`[data-notice-detail="${other.dataset.noticeToggle}"]`);if(otherDetail)otherDetail.hidden=true});toggle.setAttribute("aria-expanded",String(open));if(detail)detail.hidden=!open;const card=toggle.closest(".home-notice-card");if(card?.classList.contains("unread")){markNoticeRead(save.state,id);save.save();card.classList.remove("unread");card.classList.add("read");toggle.querySelector(":scope > em").textContent=open?"−":"＋";refreshNoticeButton()}else toggle.querySelector(":scope > em").textContent=open?"−":"＋"}));
 modal.querySelector('[data-home-notice="tutorial"]')?.addEventListener("click",()=>{modal.remove();openTutorialBook()});
 modal.querySelector('[data-home-notice="codex"]')?.addEventListener("click",()=>{modal.remove();openCodexHub()});
 modal.querySelector("[data-claim-daily-gift]")?.addEventListener("click",event=>{const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),result=claimDailyNoticeGift(save.state);if(!result.ok)return showToast("本日分は受取済みです");if(!save.save()){save.state=backup;return showToast("セーブできなかったため、配布は受け取っていません")};event.currentTarget.outerHTML='<em class="notice-gift-claimed">受取済</em>';refreshNoticeButton();showResourceToast("capture",DAILY_NOTICE_GIFT.captureCrystals);setTimeout(()=>showResourceToast("crystal",DAILY_NOTICE_GIFT.crystals),380);showToast(`毎日配布：捕獲結晶×${DAILY_NOTICE_GIFT.captureCrystals}・魔晶石×${DAILY_NOTICE_GIFT.crystals}`)});
 modal.querySelectorAll("[data-claim-inbox-reward]").forEach(button=>button.addEventListener("click",()=>{const result=claimRewardInboxEntry(button.dataset.claimInboxReward);if(!result.ok)return showToast("報酬を受け取れませんでした");modal.remove();showToast(`${result.entry.title}を受け取りました`);openNoticeCenter()}));
 modal.querySelector("[data-claim-all-inbox]")?.addEventListener("click",()=>{let claimed=0;for(const entry of pendingNoticeRewards(save.state)){const result=claimRewardInboxEntry(entry.id);if(!result.ok)break;claimed++}modal.remove();showToast(`${claimed}件の報酬を受け取りました`);openNoticeCenter()});
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
 const gold=victories<=0?0:modifiedGoldReward(save.state,Math.round(chestGoldBase(campaignFloorToLegacyFloor(maxFloor))*Math.pow(victories,1.78)*(1+Math.max(0,(Number(run.maxLoop)||1)-1)*.45)) ,"battle");
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
  equipment=createEquipment("weapon",{rarity,series:owner.seriesId,ruleOverrides:{gauntletEcho:true}});equipment.name=`${owner.name}の回廊残響`;equipment.level=Math.max(1,Math.round(campaignFloorToLegacyFloor(maxFloor)*(.75+Math.random()*.75)));equipment.plus=Math.max(0,Math.floor(victories/5));equipment.endgameBossId=ownerId;equipment.endgameFaction=owner.faction;equipment.obtainedMethod="gauntletSettlement";equipmentReceiptResult=receiveEquipment(save.state,equipment,{bossReward:true});
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
 const encounter=createEndgameTrialEncounter(save.state,active?state.run.battle:1),trial=encounter.trial;if(encounter.locked)return showToast(`${encounter.requiredFloorBoss?floorBossDisplayFloor(encounter.requiredFloorBoss):"次"}階の階層ボスに本編で遭遇すると第${trial.number}戦が解禁されます`);const floorBoss=trial.floorBossId?floorBossDefinitionById(trial.floorBossId):null,bosses=floorBoss?[{...floorBoss,visualId:floorBoss.visualSpeciesId??floorBoss.speciesId,icon:SPECIES[floorBoss.speciesId]?.emoji??"BOSS"}]:trial.bossIds.map(id=>({...ENDGAME_BOSSES[id],visualId:id}));
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
 const encounter=createEndgameTrialEncounter(save.state,run.battle),trial=encounter.trial;if(encounter.locked)return showToast(`${encounter.requiredFloorBoss?floorBossDisplayFloor(encounter.requiredFloorBoss):"次"}階の階層ボスへ本編で遭遇すると解禁されます`);run.fights=Math.max(0,Number(run.fights)||0)+1;save.save();
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
 const monster=createMonster(definition.speciesId,{nickname:definition.name,title:definition.title,level:definition.floor,rank:4,favorite:true,locked:true,attribute:definition.element,obtainedFloor:floorBossDisplayFloor(definition),obtainedMethod:"floorBossContract",floorBossCatalogId:definition.id,floorBossStatProfile:definition.stats,tags:[SPECIES[definition.speciesId]?.race,"階層ボス",definition.id].filter(Boolean)});
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
 app.insertAdjacentHTML("beforeend",Modal(`${floorBossDisplayFloor(boss)}階・欠片交換`, `<div class="floor-boss-exchange"><header><b>${boss.name}の欠片</b><strong>${status.fragments}</strong><small>討伐 ${status.victories}回・初勝利10個／再勝利2～5個</small></header><div>${rows}</div></div>`,"挑戦門へ戻る"));const modal=topModal();modal.classList.add("floor-boss-exchange-modal");modal.querySelectorAll("[data-floor-boss-exchange]").forEach(button=>button.onclick=()=>{const reward=button.dataset.floorBossExchange;modal.remove();confirmFloorBossExchange(bossId,reward)});modal.querySelector("[data-modal-primary]").onclick=()=>{modal.remove();openEndgameTrialPicker()};
}
function triggerFloorBossChallenge(bossId){
 const event=createFloorBossChallengeEncounter(save.state,bossId);if(!event)return showToast("ダンジョンでこの階層ボスに出会うと解禁されます");
 if(!save.state.party.length)return showToast("出撃メンバーを編成してください");
 const prior=capturePartyVitals();fullyRecoverParty();save.save();startSpecialBattle(event.enemies,{type:"floorBoss",title:`${floorBossDisplayFloor(event.definition)}階・${event.definition.name}`,subtitle:"階層ボス欠片試練 / 捕獲不可",priorVitals:prior,bossId:event.definition.id,returnScreen:"bossGate"});
}
function openEndgameTrialPicker(){
 normalizeFloorBossChallengeState(save.state);
 const daily=manualEndgameChallengeStatus(save.state),floorRows=FLOOR_BOSS_CATALOG.map(boss=>{const status=floorBossChallengeStatus(save.state,boss.id),tone=({UR:"ur",LR:"lr","神話":"mythic"})[boss.rarity]??"",displayFloor=floorBossDisplayFloor(boss),band=Math.floor(displayFloor/10)*10;return`<article class="floor-boss-gate-entry ${status.unlocked?"unlocked":"locked"} ${tone?`rank-${tone}`:""}" data-floor-boss-band="${band}"><button type="button" data-floor-boss-challenge="${boss.id}" ${status.unlocked?"":"disabled"}><span class="${status.unlocked?"":"undiscovered"}">${status.unlocked?monsterVisual({speciesId:boss.speciesId,visualSpeciesId:boss.visualSpeciesId},SPECIES[boss.speciesId]?.emoji??"BOSS",{className:"floor-boss-gate-visual"}):pixelIcon("lock")}</span><div><small>${displayFloor}階・${status.unlocked?boss.rarity:"未遭遇"}</small><b>${status.unlocked?boss.name:"？？？？？？"}</b><em>${status.unlocked?`欠片 ${status.fragments}・討伐 ${status.victories}`:"探索で遭遇すると解禁"}</em></div></button><button type="button" data-floor-boss-exchange-open="${boss.id}" ${status.unlocked?"":"disabled"}>欠片交換</button></article>`}).join(""),endgameRows=Object.values(ENDGAME_BOSSES).map(boss=>{const tier=manualEndgameTierStatus(save.state,boss.id);return`<article class="endgame-gate-entry ${daily.remaining?"":"exhausted"}"><button type="button" data-endgame-challenge="${boss.id}" ${daily.remaining?"":"disabled"}><span>${monsterVisual(boss.id,boss.icon,{className:"endgame-gate-monster-visual"})}</span><b>${boss.name}</b><small>${boss.faction==="tenGod"?"十神":"深淵"}・第${tier.highestUnlocked}段階まで解禁</small></button><button type="button" data-endgame-detail="${boss.id}">人物・権能・装備</button></article>`}).join(""),unlockedCount=FLOOR_BOSS_CATALOG.filter(boss=>floorBossChallengeStatus(save.state,boss.id)?.unlocked).length;
 const bands=[0,10,20,30,40,50,60,70,80,90];
 app.insertAdjacentHTML("beforeend",Modal("ボス・深淵・十神　挑戦門",`<div class="boss-gate-v2"><nav class="boss-gate-tabs"><button type="button" class="active" data-boss-gate-tab="floor">階層ボス <em>${unlockedCount}/90</em></button><button type="button" data-boss-gate-tab="endgame">深淵・十神 <em>残${daily.remaining}</em></button></nav><section data-boss-gate-panel="floor"><div class="floor-boss-gate-head"><b>一度出会った支配者と再戦</b><small>捕獲不可・勝利で固有欠片／本体50・各装備20</small></div><nav class="floor-boss-band-filter"><button type="button" class="active" data-floor-boss-band-filter="all">全て</button>${bands.map(value=>`<button type="button" data-floor-boss-band-filter="${value}">${value+1}–${value+9}階</button>`).join("")}</nav><div class="floor-boss-gate-list">${floorRows}</div></section><section data-boss-gate-panel="endgame" hidden><div class="manual-attempt-counter"><b>本日の挑戦　${daily.limit-daily.remaining}/${daily.limit}</b><small>深淵・十神の全段階で共通／日本時間0時更新</small></div><button type="button" class="fragment-altar-open" data-open-fragment-altar>${pixelIcon("summon")} 深淵・十神 欠片祭壇</button><p>各キャラクターは4段階。ひとつ前を討伐すると次段階が解禁されます。</p>${endgameRows}</section></div>`,"閉じる"));
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
function openMemoryArchiveHub(){
 const memory=save.state.recentBattleMemory,hasBattleMemory=Boolean(memory?.entries?.length),archive=createCampaignStoryArchiveModel(save.state);
 app.insertAdjacentHTML("beforeend",Modal("記憶の間",`<div class="memory-archive-hub">
  <button type="button" data-memory-room="battle"><span>${pixelIcon("memory")}</span><div><small>BATTLE MEMORY</small><b>戦闘の記憶</b><em>${hasBattleMemory?`直前の敵編成・${memory.entries.length}体を再現`:"敵と戦うと記録されます"}</em></div><strong>${hasBattleMemory?"挑戦する":"未記録"}</strong></button>
  <button type="button" data-memory-room="story"><span>${pixelIcon("event")}</span><div><small>PROPHECY ARCHIVE</small><b>予言録・物語回想</b><em>序章／魔王軍／勇者一行</em></div><strong>${archive.read} / ${archive.total}</strong></button>
  <p>戦闘の再現と物語の回想を、ここから選べます。</p>
 </div>`,"閉じる"));
 const modal=topModal();modal.classList.add("memory-archive-hub-modal");
 modal.querySelector('[data-memory-room="battle"]').onclick=()=>{modal.remove();openBattleMemory()};
 modal.querySelector('[data-memory-room="story"]').onclick=()=>{modal.remove();storyArchiveCategory="prologue";go("storyArchive")};
 modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove();
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
  <small>直前の戦闘・${memory.recordedFloor}階・${memory.entries.length}体編成</small>
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
  <small>ボスの記憶・${memory.recordedFloor}階</small><h2>${name} <em>Lv.${memory.level}</em></h2>
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
 const campaignFinal=document.getElementById("openCampaignFinal"),campaignIntel=document.getElementById("openCampaignIntel"),openCampaignIntel=()=>{campaignIntelTab="map";campaignIntelLocationIndex=null;go("campaignIntel")};
 campaignFinal?.addEventListener("click",event=>{event.stopPropagation();enterCampaignFinalFloor()});
 campaignIntel?.addEventListener("click",event=>{if(event.target.closest("#openCampaignFinal"))return;openCampaignIntel()});
 campaignIntel?.addEventListener("keydown",event=>{if(!["Enter"," "].includes(event.key)||event.target.closest("#openCampaignFinal"))return;event.preventDefault();openCampaignIntel()});
 document.getElementById("openCampaignReincarnation")?.addEventListener("click",openCampaignReincarnationDialog);
 document.getElementById("openIdleReturn")?.addEventListener("click",openIdleReturnPreview);
 document.getElementById("openCombatPowerHistory")?.addEventListener("click",openCombatPowerHistory);
 document.getElementById("openFormation")?.addEventListener("click",openFormationFromHome);
 document.querySelectorAll("[data-open-home-formation]").forEach(button=>button.addEventListener("click",openFormationFromHome));
 document.querySelectorAll("[data-home-attribute-help]").forEach(button=>button.addEventListener("click",event=>{event.stopPropagation();openAttributeHelp()}));
 document.getElementById("openMonsters").onclick=()=>go("monsters");
 document.getElementById("openSkills")?.addEventListener("click",()=>{completeContextGuide("skills_open",{quiet:true});skillNavigationOrigin="home";skillTarget=save.state.party[0]??save.state.monsters[0]?.id;skillSlotSelection=0;go("skills")});
 document.getElementById("openBattleMemory")?.addEventListener("click",openMemoryArchiveHub);
 document.getElementById("openStoryArchive")?.addEventListener("click",()=>{storyArchiveCategory="prologue";go("storyArchive")});
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
function bindCampaignIntel(){
 document.querySelector("[data-campaign-intel-back]")?.addEventListener("click",()=>go("home"));
 document.querySelectorAll("[data-campaign-intel-tab-button]").forEach(button=>button.addEventListener("click",()=>{campaignIntelTab=button.dataset.campaignIntelTabButton==="heroes"?"heroes":"map";campaignIntelLocationIndex=null;render()}));
 document.querySelectorAll("[data-campaign-route-index]").forEach(button=>button.addEventListener("click",()=>{campaignIntelLocationIndex=Math.max(0,Number(button.dataset.campaignRouteIndex)||0);render()}));
}
function bindStoryArchive(){
 document.querySelector("[data-story-archive-back]")?.addEventListener("click",()=>go("home"));
 document.querySelectorAll("[data-story-archive-category-button]").forEach(button=>button.addEventListener("click",()=>{storyArchiveCategory=button.dataset.storyArchiveCategoryButton||"prologue";render()}));
 document.querySelectorAll("[data-story-archive-entry]").forEach(button=>button.addEventListener("click",()=>{const category=storyArchiveModel?.categories?.find(entry=>entry.id===storyArchiveCategory),entry=category?.entries?.find(item=>item.id===button.dataset.storyArchiveEntry);if(!entry)return;const scenes=entry.type==="branch"?entry.variants.find(variant=>variant.outcome===button.dataset.storyArchiveOutcome&&variant.available)?.scenes:entry.scenes;if(Array.isArray(scenes)&&scenes.length)showCampaignStoryReplaySequence(scenes)}));
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
  modal.querySelectorAll("[data-skill-pick]").forEach(button=>button.onclick=()=>{if(choosing)return;choosing=true;if(!equipSkill(monster,button.dataset.skillPick,slot)){choosing=false;return}monster.skillRecommendationProfileVersion=199;modal.remove();persist(`SLOT ${slot+1} に装着`)});
  modal.querySelector("[data-skill-remove]")?.addEventListener("click",()=>{monster.equippedSkills=Array.from({length:4},(_,index)=>index===slot?null:(monster.equippedSkills?.[index]??null));monster.skillLoadoutInitialized=true;monster.skillRecommendationProfileVersion=199;modal.remove();persist(`SLOT ${slot+1} から外しました`)});
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
  monster.equippedSkills=recommendedSkillLoadout(monster);
  monster.skillLoadoutInitialized=true;
  monster.skillRecommendationProfileVersion=199;
  persist("おすすめスキルを一括設定しました");
 });
 document.querySelector("[data-skill-clear]")?.addEventListener("click",()=>{app.insertAdjacentHTML("beforeend",Modal("全スキル解除",`<div class="skill-clear-confirm"><span>${pixelIcon("skills")}</span><h3>4枠すべてを空にしますか？</h3><p>空欄は保存され、更新しても自動補充されません。再設定は各枠または「おすすめ一括設定」から行えます。</p></div>`,"解除する"));const modal=topModal();modal.classList.add("skill-clear-confirm-modal");modal.querySelector("[data-modal-primary]").onclick=()=>{monster.equippedSkills=[null,null,null,null];monster.skillLoadoutInitialized=true;monster.skillRecommendationProfileVersion=199;modal.remove();persist("スキルを全解除しました")}});
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
function workshopProtected(monster){return save.state.party.includes(monster.id)||monster.favorite||monster.locked||isLionelAvatar(monster)}
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
  const materials=ranked.filter(monster=>monster.id!==target.id&&!partyIds.has(monster.id)&&!monster.favorite&&!monster.locked&&!isLionelAvatar(monster)&&(order[monsterVisibleRarity(monster)]??1)<=limit),usable=materials.slice(0,Math.floor(materials.length/2)*2);
  if(!usable.length)continue;speciesCount++;pairs+=usable.length/2;target.plus=Math.max(0,target.plus??0)+usable.length/2;target.affection=Math.min(1000,Math.max(target.affection??target.bond??0,...usable.map(monster=>monster.affection??monster.bond??0)));target.bond=target.affection;
  usable.forEach(monster=>{removeIds.add(monster.id);Object.values(monster.equipment??{}).filter(Boolean).forEach(id=>{const item=save.state.equipment.find(entry=>entry.id===id);if(item)item.equippedBy=null})});
  target.currentHp=Math.min(calculatedStats(target).hp,target.currentHp??calculatedStats(target).hp);target.currentMp=Math.min(maxMp(target),target.currentMp??maxMp(target));
 }
 if(!removeIds.size)return{ok:false,message:`${maxRarity}以下で合成できる同名素材がありません。`};
 save.state.monsters=save.state.monsters.filter(monster=>!removeIds.has(monster.id));save.save();return{ok:true,message:`${speciesCount}種・${removeIds.size}体を素材にして、＋を合計${pairs}上げました。`};
}
function bindList(){
 document.getElementById("backHome")?.addEventListener("click",()=>go("home"));
 document.getElementById("openCompleteMonsterCodex")?.addEventListener("click",()=>openCodex("monster"));
 const input=document.getElementById("monsterSearch"),applySearch=()=>{const query=(input?.value??"").trim().toLowerCase();monsterListState.search=input?.value??"";document.querySelectorAll(".monster-species-card").forEach(card=>card.hidden=Boolean(query&&!card.dataset.speciesSearch.includes(query)))};
 input?.addEventListener("input",applySearch);applySearch();
 document.querySelectorAll("[data-monster-species]").forEach(card=>card.addEventListener("click",()=>openMonsterWorkshop(card.dataset.monsterSpecies)));
 document.getElementById("bulkSynthesizeMonsters")?.addEventListener("click",()=>{const rarity=document.getElementById("bulkSynthesisRarity")?.value??"SSR";if(!confirm(`${rarity}以下の保護されていない同名素材を一括合成しますか？\n各種族の最良個体・編成中・お気に入り・ロック個体は残ります。`))return;const result=bulkSynthesizeMonsters(rarity);showToast(result.message);if(result.ok)render()});
}

function selectableMonsters(){return save.state.monsters.filter(m=>!save.state.party.includes(m.id)&&!m.favorite&&!m.locked&&!isLionelAvatar(m))}
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
function showLegacyCampaignResetPrompt(){
 const notice=save.state.migrationNotices?.legacyCampaignReset;
 if(!notice?.pending)return false;
 const existing=document.querySelector(".legacy-campaign-reset-modal");if(existing)return true;
 clearContextGuide();
 app.insertAdjacentHTML("beforeend",Modal("大幅アップデートのお知らせ",`<div class="legacy-campaign-reset-copy"><small>NEW STORY UPDATE</small><h3>新しい探索と物語が追加されました</h3><p>旧1000階層版の進行データでは、一部の物語やイベントを正常な順番で体験できない可能性があります。</p><strong>新しい内容を最初から楽しむため、セーブデータの初期化を強くおすすめします。</strong><button type="button" data-legacy-campaign-reset>初期化して最初から始める</button><em>初期化すると、所持仲間・装備・通貨・進行記録が削除されます。次の確認画面で中止できます。</em></div>`,`現在のデータで続ける`));
 const modal=topModal();if(!modal)return false;modal.classList.add("legacy-campaign-reset-modal");modal.querySelector("[data-modal-dismiss]")?.remove();modal._onDismiss=()=>{};
 const continueButton=modal.querySelector("[data-modal-primary]"),resetButton=modal.querySelector("[data-legacy-campaign-reset]");
 continueButton?.addEventListener("click",()=>{notice.pending=false;notice.dismissedAt=new Date().toISOString();if(!save.save()){notice.pending=true;delete notice.dismissedAt;return showToast("選択を保存できませんでした")}modal.remove();queueCampaignStoryScenes({delay:80});requestAnimationFrame(scheduleContextGuide)});
 resetButton?.addEventListener("click",async()=>{resetButton.disabled=true;await requestFullGameReset();if(modal.isConnected)resetButton.disabled=false});
 requestAnimationFrame(()=>resetButton?.focus({preventScroll:true}));return true
}
async function requestFullGameReset(){
 if(fullResetInFlight)return showToast("初期化処理を確認中です。しばらくお待ちください。");
 const result=runConfirmedFullReset({
  state:save.state,
  confirm:typeof globalThis.confirm==="function"?message=>globalThis.confirm(message):null,
  prompt:typeof globalThis.prompt==="function"?message=>globalThis.prompt(message):null,
  reset:()=>true
 });
 if(!result.ok){
  if(result.reason==="tradePending")return showToast("交換品を預けているため初期化できません。オンラインへ戻り、交換を完了または中止してください。");
  if(result.reason==="mismatch")return showToast("「初期化」の入力が一致しないため中止しました。");
  if(result.reason==="saveFailed")return showToast("初期データを保存できなかったため、初期化を完了できませんでした。");
  if(result.reason==="unavailable")return showToast("このブラウザでは初期化の確認画面を開けません。");
  return showToast("初期化を中止しました。");
 }
 fullResetInFlight=true;
 showToast("オンラインのレイド記録を安全に初期化しています…");
 onlinePartyController?.disconnect({leave:true,quiet:true});
 onlinePartyController?.stopBackground?.({disconnect:false});
 let onlineReset;
 try{onlineReset=await resetCurrentWeeklyRaidForFullReset(save.state)}catch(error){onlineReset={ok:false,reason:"offline",message:error?.message}}
 if(!onlineReset.ok){
  fullResetInFlight=false;
  if(onlineReset.reason==="tradePending")return showToast("オンライン交換を完了または中止してから初期化してください。");
  if(onlineReset.reason==="unsupported")return showToast("オンラインサーバーを最新版へ更新してから、もう一度初期化してください。");
  if(onlineReset.reason==="auth")return showToast("オンライン本人確認に失敗しました。オンラインへ接続し直してから再試行してください。");
  return showToast("オンラインサーバーへ初期化を届けられませんでした。ゲームデータは変更していません。通信復旧後にもう一度お試しください。");
 }
 if(!save.reset()){fullResetInFlight=false;return showToast("初期データを保存できなかったため、初期化を完了できませんでした。もう一度お試しください。");}
 onlinePartyController=null;powerRankingUi={state:null,profile:null,selectedPlayerId:null,loadingList:false,loadingProfile:false,listTimedOut:false};powerRankingLastSignature="";powerRankingLastPublishedAt=0;game=null;battle=null;snapshot=null;activeEnemy=null;selected=null;equipmentTarget=null;skillTarget=null;
 monsterManage={editing:false,selected:new Set()};equipmentManage={editing:false,selected:new Set()};
 fullResetInFlight=false;screen="home";render();showToast("ゲームデータ・シリアルコード・今週のレイド記録を初期化しました");
}
async function redeemSettingsGameMasterCode(event){
 event?.preventDefault();
 const input=document.getElementById("gameMasterCodeInput"),button=document.getElementById("redeemGameMasterCode");if(!input||!button)return;
 button.disabled=true;const oldText=button.textContent;button.textContent="認証中…";
 const validation=await validateGameMasterCode(save.state,input.value);
 if(!validation.ok){button.disabled=false;button.textContent=oldText;return showToast(validation.message)}
 if(validation.kind==="reset"){button.disabled=false;button.textContent=oldText;return requestFullGameReset()}
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
 document.getElementById("resetSave").onclick=()=>requestFullGameReset();
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
  const level=magicCircleLevel(save.state,circle.id),owned=circle.id==="none"||level>0,price=magicCirclePrice(save.state,circle.id),equipped=current.id===circle.id,owner=magicCircleOwner(save.state,circle.id,{excludeMonsterId:monster.id}),inUse=Boolean(owner),progression=owned&&circle.id!=="none"?magicCircleProgressionStatus(save.state,level):null,progressText=progression?.atCap?(progression.nextFloor?`${progression.nextFloor}階で強化上限を更新`:`到達階層の強化上限 Lv.${progression.cap}`):null;
  return`<article class="magic-circle-row tone-${circle.tone} ${equipped?"equipped":""} ${inUse?"in-use":""} ${owned?"owned":"locked"}"><span class="magic-circle-list-art"><img src="${circle.asset}" alt=""></span><div><b>${circle.name}${level?` Lv.${level}`:""}</b><small>${circle.summary}</small><em>${circle.id==="none"?"いつでも選択可能":inUse?`${displayName(owner)}が装着中`:owned?(progressText??magicCircleNextEffect(circle,level)):"深淵ツリーで解禁"}</em>${owned&&circle.id!=="none"?`<strong>${progression?.atCap?`現在の強化上限 Lv.${progression.cap}`:`次の強化 ${price.toLocaleString()}G`}</strong>`:""}</div><div><button type="button" data-circle-equip="${circle.id}" ${equipped||inUse?"disabled":""}>${equipped?"装着中":inUse?"使用中":"装着"}</button>${circle.id!=="none"&&owned?`<button type="button" data-circle-buy="${circle.id}" ${gold<price||progression?.atCap?"disabled":""}>${progression?.atCap?"階層上限":"GOLD強化"}</button>`:""}</div></article>`
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
 experienceItemsMedium:["📗","経験値パック（中）","30階到達で解禁。N標準で約3Lv分のEXP。"],
 experienceItemsLarge:["📙","経験値パック（大）","50階到達で解禁。N標準で約6Lv分のEXP。"],
 experienceItemsUltra:["📕","経験値パック（超）","70階到達で解禁。N標準で最大約10Lv分のEXP。"],
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
  if(m){m.equipment=emptyEquipmentLoadout();m.magicCircleId="none";m.magicCircleInstanceId=null;preserveVitals(m,beforeStats,beforeMp)}
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
 outgoing.magicCircleId="none";outgoing.magicCircleInstanceId=null;
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

const ONLINE_RAID_EXCHANGE_PRICES=Object.freeze({character:240,equipment:180,circle:120,crystals:30});
const ONLINE_WEEKLY_RAID_REWARDS=Object.freeze({
 "abyss-amalga":Object.freeze({name:"終焉融骸・アビス＝マルガ",contractName:"融骸幼体アマルガ",speciesId:"juvenile_amalga",attribute:"dark",visualBase:"./assets/online/raid/juvenile-amalga",equipmentName:"終焉喰らいの大刃",circleId:"death_mirror",circleName:"即死返鏡陣"}),
 "zero-sovereign":Object.freeze({name:"零界凍皇・ニヴル＝レギア",contractName:"零界皇ニヴルシア",speciesId:"frost_sovereign",attribute:"ice",visualBase:"./assets/monsters/169_frost_sovereign",equipmentName:"凍星断界剣"}),
 "vajra-beast":Object.freeze({name:"雷獄天獣・ヴァジュリオン",contractName:"雷帝獣ヴァジュラ",speciesId:"thunder_emperor",attribute:"lightning",visualBase:"./assets/monsters/104_thunder_emperor",equipmentName:"天雷轟断牙"})
});
function onlinePartyPersistentState(){
 const online=save.state.onlineParty&&typeof save.state.onlineParty==="object"?save.state.onlineParty:{};save.state.onlineParty=online;
 online.claimedRewards=Array.isArray(online.claimedRewards)?online.claimedRewards:[];
 online.processedVitalMutationIds=Array.isArray(online.processedVitalMutationIds)?online.processedVitalMutationIds:[];
 online.processedBattleEventIds=Array.isArray(online.processedBattleEventIds)?online.processedBattleEventIds:[];
 online.processedExpeditionResultIds=Array.isArray(online.processedExpeditionResultIds)?online.processedExpeditionResultIds:[];
 online.completedExpeditionRunIds=Array.isArray(online.completedExpeditionRunIds)?online.completedExpeditionRunIds:[];
 online.coopContributionHistory=Array.isArray(online.coopContributionHistory)?online.coopContributionHistory.slice(-128):[];
 online.activeExpeditionRunId=online.activeExpeditionRunId==null?null:String(online.activeExpeditionRunId).slice(0,120)||null;
 online.activeManualExploreRunId=online.activeManualExploreRunId==null?null:String(online.activeManualExploreRunId).slice(0,120)||null;
 online.activeExpeditionOwnerId=online.activeExpeditionOwnerId==null?null:String(online.activeExpeditionOwnerId).slice(0,24)||null;
 online.hostWorld=online.hostWorld&&typeof online.hostWorld==="object"?online.hostWorld:{openedChestIds:{},floorSeeds:{}};
 online.hostWorld.ownerId=online.hostWorld.ownerId==null?null:String(online.hostWorld.ownerId).slice(0,24)||null;
 return online
}
function persistOnlineStateMutation(event={}){
 const sideEffectBackup={appVersion:save.state.appVersion,flags:typeof structuredClone==="function"?structuredClone(save.state.flags??{}):JSON.parse(JSON.stringify(save.state.flags??{})),codex:typeof structuredClone==="function"?structuredClone(save.state.codex??{encounters:{},captures:{},equipment:{}}):JSON.parse(JSON.stringify(save.state.codex??{encounters:{},captures:{},equipment:{}}))};
 try{
  const received=event?.received??event?.asset??null;
  if(event?.kind==="tradeCommit"&&received){
   save.state.codex??={encounters:{},captures:{},equipment:{}};save.state.codex.encounters??={};save.state.codex.equipment??={};
   if(received.kind==="monster"&&received.payload?.speciesId){const incomingId=String(received.payload.id??""),monster=save.state.monsters.find(entry=>entry.id===incomingId)??[...save.state.monsters].reverse().find(entry=>entry.speciesId===received.payload.speciesId&&entry.weeklyRaidBossId===received.payload.weeklyRaidBossId);if(monster)normalizeRaidJuvenileContract(monster);const speciesId=monster?.speciesId??received.payload.speciesId;save.state.codex.encounters[speciesId]=(Number(save.state.codex.encounters[speciesId])||0)+1;if(monster?.speciesId==="juvenile_amalga"){save.state.codex.captures??={};save.state.codex.captures[speciesId]=Math.max(1,Number(save.state.codex.captures[speciesId])||0)}}
   if(received.kind==="equipment"&&received.payload?.name)save.state.codex.equipment[received.payload.name]=(Number(save.state.codex.equipment[received.payload.name])||0)+1;
  }
  if(!save.save())throw new Error("save failed");
  return{ok:true}
 }catch{
  try{event?.rollback?.()}catch{}
  save.state.appVersion=sideEffectBackup.appVersion;save.state.flags=sideEffectBackup.flags;save.state.codex=sideEffectBackup.codex;
  return{ok:false,message:"交換データを保存できませんでした"}
 }
}
function persistOnlineRaidWorld(event={}){
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),online=onlinePartyPersistentState(),source=event?.raidWorld;
 if(!source||typeof source!=="object"){online.raidWorld={};if(!save.save()){save.state=backup;return{ok:false,message:"レイド進行を保存できませんでした"}}return{ok:true}}
 const maxHp=Math.max(0,Math.floor(Number(source.maxHp)||0)),hp=Math.max(0,Math.min(maxHp||Number.MAX_SAFE_INTEGER,Math.floor(Number(source.hp)||0)));
 const cleanContribution=value=>({damage:Math.max(0,Math.floor(Number(value?.damage)||0)),taken:Math.max(0,Math.floor(Number(value?.taken)||0)),healing:Math.max(0,Math.floor(Number(value?.healing)||0)),mpHealing:Math.max(0,Math.floor(Number(value?.mpHealing)||0)),revives:Math.max(0,Math.floor(Number(value?.revives)||0)),guards:Math.max(0,Math.floor(Number(value?.guards)||0)),support:Math.max(0,Math.floor(Number(value?.support)||0))});
 const contribution=source.contribution&&typeof source.contribution==="object"&&!Array.isArray(source.contribution)?Object.fromEntries(Object.entries(source.contribution).slice(0,32).map(([playerId,value])=>[String(playerId).slice(0,24),cleanContribution(value)])):{};
	 const ranking=(Array.isArray(source.ranking)?source.ranking:[]).slice(0,32).map((entry,index)=>({playerId:String(entry?.playerId??"").slice(0,24),name:String(entry?.name??"挑戦者").slice(0,24),rank:Math.max(1,Math.min(32,Math.floor(Number(entry?.rank)||index+1))),score:Math.max(0,Math.floor(Number(entry?.score)||0)),...cleanContribution(entry)}));
	 const personalMilestonesClaimed=source.personalMilestonesClaimed&&typeof source.personalMilestonesClaimed==="object"&&!Array.isArray(source.personalMilestonesClaimed)?Object.fromEntries(Object.entries(source.personalMilestonesClaimed).slice(0,32).map(([playerId,list])=>[String(playerId).slice(0,24),[...new Set((Array.isArray(list)?list:[]).map(Number).filter(value=>[5,15,30].includes(value)))]])):{};
	 const juvenileRewardClaimedBy=source.juvenileRewardClaimedBy&&typeof source.juvenileRewardClaimedBy==="object"&&!Array.isArray(source.juvenileRewardClaimedBy)?Object.fromEntries(Object.entries(source.juvenileRewardClaimedBy).map(([playerId,claimed])=>[String(playerId).slice(0,24),claimed===true]).filter(([playerId,claimed])=>playerId&&claimed).slice(0,32).map(([playerId])=>[playerId,true])):{};
	 online.raidWorld={campaignId:source.campaignId==null?null:String(source.campaignId).slice(0,120),weekId:source.weekId==null?null:String(source.weekId).slice(0,80),weekStartsAt:Math.max(0,Math.floor(Number(source.weekStartsAt)||0)),weekEndsAt:Math.max(0,Math.floor(Number(source.weekEndsAt)||0)),bossId:source.bossId==null?null:String(source.bossId).slice(0,80),modifierId:source.modifierId==null?null:String(source.modifierId).slice(0,80),maxHp,hp,attempts:Math.max(0,Math.floor(Number(source.attempts)||0)),totalDamage:Math.max(0,Math.floor(Number(source.totalDamage)||0)),milestonesClaimed:[...new Set((Array.isArray(source.milestonesClaimed)?source.milestonesClaimed:[]).map(Number).filter(value=>[5,10,25,50,75,100].includes(value)))],personalMilestonesClaimed,juvenileRewardClaimedBy,lastAttemptAt:Math.max(0,Math.floor(Number(source.lastAttemptAt)||0)),completedAt:Math.max(0,Math.floor(Number(source.completedAt)||0)),contribution,ranking};
 if(!save.save()){save.state=backup;return{ok:false,message:"レイド進行を保存できませんでした"}}return{ok:true}
}
function persistOnlineTeamBattleResult(event={}){
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),online=onlinePartyPersistentState(),resultId=String(event?.resultId??event?.summary?.resultId??"").slice(0,160),selfId=String(onlinePartyController?.selfId??"");
 online.processedTeamBattleResultIds=Array.isArray(online.processedTeamBattleResultIds)?online.processedTeamBattleResultIds:[];
 if(!resultId)return{ok:false,message:"対戦結果IDがありません"};if(online.processedTeamBattleResultIds.includes(resultId))return{ok:true,duplicate:true};
 const ranking=Array.isArray(event?.summary?.ranking)?event.summary.ranking:[],self=ranking.find(entry=>String(entry?.playerId??"")===selfId);if(!self||!["sun","moon"].includes(self.side))return{ok:true,spectator:true};
 const winner=["sun","moon"].includes(event?.summary?.winner)?event.summary.winner:null,draw=!winner,won=winner===self.side;
 const source=online.teamBattleRecords&&typeof online.teamBattleRecords==="object"?online.teamBattleRecords:{};
 const records=online.teamBattleRecords={matches:Math.max(0,Math.floor(Number(source.matches)||0))+1,wins:Math.max(0,Math.floor(Number(source.wins)||0))+(won?1:0),losses:Math.max(0,Math.floor(Number(source.losses)||0))+(!draw&&!won?1:0),draws:Math.max(0,Math.floor(Number(source.draws)||0))+(draw?1:0),currentStreak:won?Math.max(0,Math.floor(Number(source.currentStreak)||0))+1:0,bestStreak:Math.max(0,Math.floor(Number(source.bestStreak)||0)),lastResult:draw?"draw":won?"win":"loss",lastAt:new Date().toISOString()};
 records.bestStreak=Math.max(records.bestStreak,records.currentStreak);online.processedTeamBattleResultIds.push(resultId);online.processedTeamBattleResultIds=online.processedTeamBattleResultIds.slice(-128);if(!save.save()){save.state=backup;return{ok:false,message:"対戦結果を保存できませんでした"}}return{ok:true,records}
}
function applyOnlineVitalsUpdate(event={},{persist=true,allowMissing=false,skipApply=false}={}){
 const backup=persist?(typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state))):null,online=onlinePartyPersistentState(),mutationId=String(event.mutationId??"").slice(0,160);
 if(mutationId&&online.processedVitalMutationIds.includes(mutationId))return{ok:true,duplicate:true};
 const sourceRows=(Array.isArray(event.rosterVitals)?event.rosterVitals:[]).filter(entry=>entry&&typeof entry==="object").slice(0,16);if(event.monsterId!=null)sourceRows.push({mutationId:event.mutationId,monsterId:event.monsterId,hp:event.hp,mp:event.mp});
 const rows=[],seenMonsters=new Set(),seenMutations=new Set(online.processedVitalMutationIds);for(const source of sourceRows){const monsterId=String(source.monsterId??"").slice(0,120),rawMutationId=String(source.mutationId??"").slice(0,160),rowMutationId=rawMutationId===mutationId?"":rawMutationId;if(!monsterId||seenMonsters.has(monsterId)||rowMutationId&&seenMutations.has(rowMutationId))continue;seenMonsters.add(monsterId);if(rowMutationId)seenMutations.add(rowMutationId);rows.push({mutationId:rowMutationId,monsterId,hp:source.hp,mp:source.mp});if(rows.length>=4)break}
 const suppliedMonsterId=sourceRows.some(row=>String(row?.monsterId??"").slice(0,120));const pending=rows.map(row=>({...row,monster:skipApply?null:save.state.monsters.find(entry=>entry.id===row.monsterId)}));if(!skipApply&&!allowMissing&&(!suppliedMonsterId||pending.some(row=>!row.monster)))return{ok:false,message:"出撃中の仲間が見つかりません"};
 const rosterVitals=[];for(const row of pending){const monster=row.monster;if(monster){const hpMax=Math.max(1,calculatedStats(monster).hp),mpMax=Math.max(0,maxMp(monster)),hp=Number(row.hp),mp=Number(row.mp);if(Number.isFinite(hp))monster.currentHp=Math.max(0,Math.min(hpMax,Math.floor(hp)));if(Number.isFinite(mp))monster.currentMp=Math.max(0,Math.min(mpMax,Math.floor(mp)))}if(row.mutationId)online.processedVitalMutationIds.push(row.mutationId);rosterVitals.push({monsterId:row.monsterId,hp:monster?.currentHp??null,mp:monster?.currentMp??null,missing:!monster})}
 if(mutationId)online.processedVitalMutationIds.push(mutationId);online.processedVitalMutationIds=[...new Set(online.processedVitalMutationIds)].slice(-256);
 if(persist&&!save.save()){save.state=backup;return{ok:false,message:"HP・MPを保存できなかったため再試行します"}}const primary=rosterVitals.find(row=>row.monsterId===String(event.monsterId??""))??rosterVitals[0]??null;return{ok:true,hp:primary?.hp??null,mp:primary?.mp??null,missing:primary?.missing??true,rosterVitals}
}
function beginOnlineExpeditionResultRun(event={}){
 const runId=String(event.runId??"").slice(0,120),ownerId=String(event.ownerId??"").slice(0,24),selfId=String(onlinePartyController?.selfId??"");if(!runId||ownerId!==selfId)return{ok:true,guest:true};const online=onlinePartyPersistentState(),manual=save.state.returnRewards?.manual,currentExploreRunId=String(save.state.player.exploreRun?.id??"");
 if(online.activeExpeditionRunId===runId&&manual?.active&&online.activeManualExploreRunId&&online.activeManualExploreRunId===currentExploreRunId)return{ok:true,duplicate:true};
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),startFloor=Math.max(1,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(event.startFloor)||1)));beginManualExpedition(save.state,startFloor);online.activeExpeditionRunId=runId;online.activeManualExploreRunId=String(save.state.player.exploreRun?.id??"").slice(0,120)||null;online.activeExpeditionOwnerId=ownerId;if(!save.save()){save.state=backup;return{ok:false,message:"探索開始状態を保存できませんでした"}}return{ok:true}
}
function settleOnlineExpeditionResult(event={}){
 const runId=String(event.runId??"").slice(0,120),resultId=String(event.resultId??"").slice(0,160),ownerId=String(event.ownerId??"").slice(0,24),recipientId=String(event.recipientId??"").slice(0,24),selfId=String(onlinePartyController?.selfId??"");if(!resultId||!ownerId||recipientId!==selfId)return{ok:false,message:"探索結果の対象を確認できません"};
 const online=onlinePartyPersistentState();if(online.processedExpeditionResultIds.includes(resultId))return{ok:true,duplicate:true};const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),clone=value=>typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value)),manual=save.state.returnRewards?.manual,currentExploreRunId=String(save.state.player.exploreRun?.id??""),progressionEligible=event.progressionEligible===true&&ownerId===selfId,active=Boolean(progressionEligible&&runId&&online.activeExpeditionRunId===runId&&online.activeExpeditionOwnerId===selfId&&manual?.active&&online.activeManualExploreRunId&&online.activeManualExploreRunId===currentExploreRunId),unrelatedRunActive=Boolean(save.state.player.inRun&&!active);
 const finalVitals=event.finalVitals&&typeof event.finalVitals==="object"&&!Array.isArray(event.finalVitals)?event.finalVitals:null,rosterVitals=[...(Array.isArray(finalVitals?.rosterVitals)?finalVitals.rosterVitals.slice(0,16):[]),...(Array.isArray(event.rosterVitals)?event.rosterVitals.slice(0,16):[])],vitalsPayload=finalVitals||rosterVitals.length?{...(finalVitals??{}),mutationId:finalVitals?.mutationId??event.vitalsMutationId??event.mutationId??"",rosterVitals}:null;
 if(vitalsPayload){const vitals=applyOnlineVitalsUpdate(vitalsPayload,{persist:false,allowMissing:true,skipApply:unrelatedRunActive});if(!vitals.ok){save.state=backup;return vitals}}
 if(ownerId!==selfId&&Boolean(event.multiplayer||event.summary?.multiplayer)){
  const nestedAssisted=event.assistedWorld&&typeof event.assistedWorld==="object"&&!Array.isArray(event.assistedWorld)?event.assistedWorld:event.summary?.assistedWorld&&typeof event.summary.assistedWorld==="object"&&!Array.isArray(event.summary.assistedWorld)?event.summary.assistedWorld:null,assistedOwnerId=String(nestedAssisted?.ownerId??"").slice(0,24),historySource=nestedAssisted&&assistedOwnerId===ownerId?nestedAssisted:!nestedAssisted?event:{};
  const ranking=Array.isArray(event.summary?.ranking)?event.summary.ranking.slice(0,32):[],entry=ranking.find(value=>String(value?.playerId??"")===selfId);
  if(entry){const count=(value,max=Number.MAX_SAFE_INTEGER)=>Math.max(0,Math.min(max,Math.floor(Number(value)||0))),historyStartFloor=Math.max(1,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(historySource.startFloor)||1))),historyEndFloor=Math.max(historyStartFloor,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(historySource.endFloor)||historyStartFloor))),titles=[...new Set((Array.isArray(entry.mvpTitles)?entry.mvpTitles:[]).map(value=>String(value??"").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,32)).filter(Boolean))].slice(0,8),record={resultId,runId,ownerId,startFloor:historyStartFloor,endFloor:historyEndFloor,floorsCleared:count(historySource.floorsCleared,WORLD_MAX_FLOOR),completed:Boolean(event.completed),reason:String(event.reason??"return").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,40)||"return",finishedAt:count(event.finishedAt),rank:Math.max(1,Math.min(32,Math.floor(Number(entry.rank)||1))),name:String(entry.name??"冒険者").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,24)||"冒険者",exploration:count(entry.exploration),combat:count(entry.combat),rescue:count(entry.rescue,9999),chests:count(entry.chests,9999),switches:count(entry.switches,9999),gimmicks:count(entry.gimmicks,9999),pings:count(entry.pings,9999),support:count(entry.support),score:count(entry.score),mvpTitles:titles};online.coopContributionHistory=[...online.coopContributionHistory.filter(value=>String(value?.resultId??"")!==resultId),record].slice(-128)}
 }
 let returnResult=null,defeat=null;if(progressionEligible){const startFloor=Math.max(1,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(event.startFloor)||1))),endFloor=Math.max(startFloor,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(event.endFloor)||startFloor))),floorsCleared=Math.max(0,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(event.floorsCleared)||0))),reachedFloor=Math.min(endFloor,startFloor+floorsCleared);
  if(event.reason==="defeat"){if(active){abandonManualExpedition(save.state);save.state.player.currentFloor=Math.max(1,Number(save.state.player.checkpoint)||1);save.state.player.inRun=false}const lossCap=Math.max(100,goldForClearedFloor(campaignFloorToLegacyFloor(endFloor))),lost=Math.min(Math.floor((Number(save.state.player.gold)||0)*.10),lossCap);save.state.player.gold=Math.max(0,(Number(save.state.player.gold)||0)-lost);const defeatedMonsterIds=[...new Set([vitalsPayload?.monsterId,...(Array.isArray(vitalsPayload?.rosterVitals)?vitalsPayload.rosterVitals.map(row=>row?.monsterId):[])].map(value=>String(value??"").slice(0,120)).filter(Boolean))].slice(0,4);if(!unrelatedRunActive)for(const monsterId of defeatedMonsterIds){const monster=save.state.monsters.find(entry=>entry.id===monsterId);if(monster){monster.currentHp=1;monster.currentMp=0;monster.history??={};monster.history.defeats=(Number(monster.history.defeats)||0)+1;monster.history.consecutiveDeployments=0}}defeat={lost,checkpoint:active?save.state.player.currentFloor:Math.max(1,Number(save.state.player.checkpoint)||1),preservedRun:!active}}
  else if(active){if(reachedFloor>Number(save.state.returnRewards.manual.lastFloor||startFloor))recordManualFloorClear(save.state,reachedFloor);save.state.player.currentFloor=Math.max(Number(save.state.player.currentFloor)||1,reachedFloor);save.state.player.maxFloor=Math.max(Number(save.state.player.maxFloor)||1,reachedFloor);save.state.player.inRun=false;returnResult=claimManualReturn(save.state)}
  else{const preservedManual=save.state.returnRewards?.manual?clone(save.state.returnRewards.manual):null,preservedExploreRun=clone(save.state.player.exploreRun??{id:null,floors:{}}),preservedFloor=save.state.player.currentFloor,preservedInRun=Boolean(save.state.player.inRun);beginManualExpedition(save.state,startFloor);if(floorsCleared>0)recordManualFloorClear(save.state,reachedFloor);save.state.player.currentFloor=reachedFloor;save.state.player.maxFloor=Math.max(Number(save.state.player.maxFloor)||1,reachedFloor);returnResult=claimManualReturn(save.state);if(preservedManual)save.state.returnRewards.manual=preservedManual;save.state.player.exploreRun=preservedExploreRun;save.state.player.currentFloor=preservedFloor;save.state.player.inRun=preservedInRun}
  if(online.activeExpeditionRunId===runId){online.activeExpeditionRunId=null;online.activeManualExploreRunId=null;online.activeExpeditionOwnerId=null}online.completedExpeditionRunIds.push(runId);online.completedExpeditionRunIds=[...new Set(online.completedExpeditionRunIds.filter(Boolean))].slice(-2048)
 }
 online.processedExpeditionResultIds.push(resultId);online.processedExpeditionResultIds=[...new Set(online.processedExpeditionResultIds)].slice(-2048);if(!save.save()){save.state=backup;return{ok:false,message:"探索結果を保存できなかったため再試行します"}}return{ok:true,returnResult,defeat,guest:!progressionEligible}
}
function recoverOrphanedOnlineExpedition(){
 const online=onlinePartyPersistentState(),runId=String(online.activeExpeditionRunId??"").slice(0,120);if(!runId)return{ok:true,active:false};
 const selfId=String(onlinePartyController?.selfId??"").slice(0,24),ownerId=String(online.activeExpeditionOwnerId??"").slice(0,24);if(!selfId||!ownerId||ownerId!==selfId)return{ok:true,active:false,guest:true};
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),manual=save.state.returnRewards?.manual,currentExploreRunId=String(save.state.player.exploreRun?.id??""),exact=Boolean(manual?.active&&online.activeManualExploreRunId&&online.activeManualExploreRunId===currentExploreRunId),resultId=`${runId}:client-recovery`,startFloor=Math.max(1,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(manual?.startFloor)||Number(save.state.player.currentFloor)||1))),endFloor=Math.max(startFloor,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(manual?.lastFloor)||startFloor)),Math.min(WORLD_MAX_FLOOR,Math.max(1,Math.floor(Number(save.state.player.currentFloor)||startFloor)))),floorsCleared=exact?Math.max(0,Math.floor(Number(manual?.floorsCleared)||0)):0;
 let returnResult=null;if(exact){save.state.player.currentFloor=endFloor;save.state.player.maxFloor=Math.max(Number(save.state.player.maxFloor)||1,endFloor);save.state.player.inRun=false;returnResult=claimManualReturn(save.state)}
 online.activeExpeditionRunId=null;online.activeManualExploreRunId=null;online.activeExpeditionOwnerId=null;online.completedExpeditionRunIds.push(runId);online.completedExpeditionRunIds=[...new Set(online.completedExpeditionRunIds.filter(Boolean))].slice(-2048);online.processedExpeditionResultIds.push(resultId);online.processedExpeditionResultIds=[...new Set(online.processedExpeditionResultIds)].slice(-2048);
 if(!save.save()){save.state=backup;return{ok:false,message:"中断された共同探索を保存できませんでした"}}
 const summary={id:resultId,runId,resultId,startFloor,endFloor,floor:endFloor,floorsCleared,completed:false,reason:"serverRestart",multiplayer:false,ranking:[]},context={resultId,summary,reason:"serverRestart",guest:false,recovered:true};return{ok:true,active:exact,returnResult,summary,context}
}
function persistOnlineBattleDefeated(event={}){
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),online=onlinePartyPersistentState(),eventId=String(event.eventId??"").slice(0,160);if(!eventId||online.processedBattleEventIds.includes(eventId))return{ok:Boolean(eventId),duplicate:Boolean(eventId)};
 const worldOwnerId=String(event.worldOwnerId??"").slice(0,24),selfId=String(onlinePartyController?.selfId??"").slice(0,24),roomOwnerId=String(onlinePartyController?.roomState?.expedition?.hostOwnerId??onlinePartyController?.roomState?.ownerId??"").slice(0,24),ownsWorld=Boolean(worldOwnerId)&&worldOwnerId===selfId&&(!roomOwnerId||roomOwnerId===selfId);
 if(!ownsWorld){online.processedBattleEventIds.push(eventId);online.processedBattleEventIds=online.processedBattleEventIds.slice(-512);if(!save.save()){save.state=backup;return{ok:false,message:"討伐結果の受取状態を保存できませんでした"}}return{ok:true,guest:true}}
 const floor=Math.max(1,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(event.floor)||1))),defeated=(Array.isArray(event.defeated)?event.defeated:[]).filter(entry=>entry&&typeof entry==="object").slice(0,12),kills=defeated.filter(entry=>!entry.captured),boss=Boolean(event.boss)||kills.some(entry=>entry.boss),floorBoss=event.floorBoss===true,progressionEligible=floorBoss&&event.progressionEligible===true;
 save.state.records??={};save.state.records.kills=(Number(save.state.records.kills)||0)+kills.length;save.state.codex??={encounters:{},captures:{},equipment:{}};save.state.codex.encounters??={};recordBiomeFloor(save.state,floor);
 for(const enemy of defeated){const speciesId=String(enemy.speciesId??"");if(speciesId&&SPECIES[speciesId]){save.state.codex.encounters[speciesId]=(Number(save.state.codex.encounters[speciesId])||0)+1;recordBiomeEncounter(save.state,floor,speciesId)}}
 const monster=save.state.monsters.find(entry=>entry.id===String(event.monsterId??""));
 if(monster){const affectionGain=boss?5:2;monster.affection=Math.min(1000,(Number(monster.affection??monster.bond)||0)+affectionGain);monster.bond=monster.affection;monster.history??={};monster.history.adventures=(Number(monster.history.adventures)||0)+1;monster.history.battles=(Number(monster.history.battles)||0)+1;monster.history.victories=(Number(monster.history.victories)||0)+1;monster.history.kills=(Number(monster.history.kills)||0)+kills.length;monster.history.bossDefeats=(Number(monster.history.bossDefeats)||0)+(boss?1:0);monster.history.highestFloor=Math.max(Number(monster.history.highestFloor)||1,floor);monster.history.lastDeployedAt=new Date().toISOString();monster.history.consecutiveDeployments=(Number(monster.history.consecutiveDeployments)||0)+1;monster.history.longestConsecutiveDeployments=Math.max(Number(monster.history.longestConsecutiveDeployments)||0,monster.history.consecutiveDeployments);monster.battles=(Number(monster.battles)||0)+1;for(const enemy of kills)recordWeaponKill(save.state,monster.id,enemy);recordSeriesBattle(save.state,[monster],null,{boss,battleId:`online:${eventId}`})}
 if(progressionEligible){recordBiomeBoss(save.state,floor);save.state.player.bossKills??={};save.state.player.bossKills[floor]=Math.max(0,Number(save.state.player.bossKills[floor])||0)+1}online.processedBattleEventIds.push(eventId);online.processedBattleEventIds=online.processedBattleEventIds.slice(-512);if(!save.save()){save.state=backup;return{ok:false,message:"討伐記録を保存できませんでした"}}return{ok:true}
}

function currentOnlineWorldOwnerId(){return String(onlinePartyController?.roomState?.expedition?.hostOwnerId??onlinePartyController?.roomState?.ownerId??"").slice(0,24)}
function ownsOnlineWorldProgress(source={}){return onlineProgressionAllowed(source,{selfId:String(onlinePartyController?.selfId??"").slice(0,24),roomOwnerId:currentOnlineWorldOwnerId()})}

function stableRewardIndex(value,length){
 const size=Math.max(1,Math.floor(Number(length)||1));let hash=2166136261;for(const char of String(value??"")){hash^=char.codePointAt(0);hash=Math.imul(hash,16777619)}return(hash>>>0)%size
}
function campaignTrophyEquipment({floor,boss=null,bosses=[],rewardId="",obtainedMethod="campaignTrophyChest",level=null}={}){
 const current=Math.max(1,Math.min(CAMPAIGN_MAX_FLOOR,Math.floor(Number(floor)||1))),profiles=(Array.isArray(bosses)&&bosses.length?bosses:boss?[boss]:[]).filter(entry=>entry&&typeof entry==="object"),profile=profiles[0]??boss??null,identity=bossRewardIdentity(profile,{floor:current});
 if(!identity)return null;
 const pieceIndex=stableRewardIndex(`${rewardId}:${identity.id}:piece`,identity.equipment.length),piece=bossRewardEquipmentIdentity(identity.id,pieceIndex,{floor:current});
 let item=null;if(identity.kind==="endgame")item=createSignatureEquipment(identity.ownerId,pieceIndex);
 else item=dedicatedFloorBossEquipment(current,{...profile,floorBossCatalogId:identity.id},piece?.piece);
 if(!item)return null;item.level=Math.max(1,Math.min(100_000,Math.floor(Number(level)||equipmentDropLevelForFloor(campaignFloorToLegacyFloor(current),{boss:true}))));item.obtainedFloor=current;item.obtainedMethod=obtainedMethod;return item
}
function applyOnlineCampaignTrophyFragments({rewardId,floor,source}={}){
 const authoritative=Array.isArray(source?.fragmentAwards)?source.fragmentAwards:campaignTrophyFragmentAwards({floor,boss:source?.boss??null,bosses:source?.bosses??[],fragmentPacks:source?.fragmentPacks??0}),seen=new Set();
 for(const raw of authoritative.slice(0,16)){if(!raw||typeof raw!=="object")continue;const fragmentId=String(raw.id??raw.boss?.endgameBossId??raw.boss?.floorBossCatalogId??"").slice(0,100),amount=Math.max(0,Math.min(1000,Math.floor(Number(raw.amount)||0)));if(!fragmentId||!amount||seen.has(fragmentId))continue;seen.add(fragmentId);const endgameId=String(raw.boss?.endgameBossId??(ENDGAME_BOSSES[fragmentId]?fragmentId:"")).slice(0,100);if(endgameId)awardEmergencyFragments(save.state,endgameId,true,`online-campaign:${rewardId}:${fragmentId}`,amount);else{save.state.floorBossChallenges??={};save.state.floorBossChallenges.fragments??={};save.state.floorBossChallenges.fragments[fragmentId]=(Number(save.state.floorBossChallenges.fragments[fragmentId])||0)+amount}}
}

function claimOnlinePartyReward({rewardId,reward={},source={}}={}){
 const id=String(rewardId??"").slice(0,160),backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),online=onlinePartyPersistentState();if(!id)return{ok:false};if(online.claimedRewards.includes(id))return{ok:true,duplicate:true};
 const requestedGold=Math.max(0,Math.floor(Number(reward.gold)||0)),requestedGoldCost=Math.max(0,Math.floor(Number(reward.goldCost)||0)),requestedKeys=Math.max(0,Math.floor(Number(reward.abyssKeys)||0)),requestedKeyCost=Math.max(0,Math.floor(Number(reward.abyssKeyCost)||0));if((Number(save.state.player.gold)||0)+requestedGold<requestedGoldCost)return{ok:false,message:"GOLD消費の前に未受取報酬を保存します"};if((Number(save.state.inventory.abyssKeys)||0)+requestedKeys<requestedKeyCost)return{ok:false,message:"深淵の鍵の獲得処理を先に完了します"};
 const kind=String(source.kind??""),explorationBattleKinds=new Set(["battle","coopBoss"]);
 if(explorationBattleKinds.has(kind)){
  const applySkillUses=(monsterId,skillUses)=>{const masteryMonster=save.state.monsters.find(monster=>monster.id===monsterId);if(!masteryMonster||!skillUses||typeof skillUses!=="object"||Array.isArray(skillUses))return;const learnedIds=new Set(allLearnedSkills(masteryMonster).filter(Boolean).map(skill=>String(skill.id??"")).filter(Boolean)),bonus=Math.max(0,Number(masteryMonster._equipmentAffixes?.skillMasteryGain)||0);for(const[rawSkillId,rawCount]of Object.entries(skillUses).slice(0,32)){const skillId=String(rawSkillId).slice(0,120);if(!learnedIds.has(skillId))continue;for(let use=0,count=Math.max(0,Math.min(32,Math.floor(Number(rawCount)||0)));use<count;use++)recordSkillUse(masteryMonster,skillId,1+bonus/100)}};
  const hasSkillUsesRoster=Object.prototype.hasOwnProperty.call(reward,"skillUsesRoster");
  if(hasSkillUsesRoster&&Array.isArray(reward.skillUsesRoster)){const seenMonsterIds=new Set();for(const row of reward.skillUsesRoster.slice(0,16)){const monsterId=String(row?.monsterId??"").slice(0,120);if(!monsterId||seenMonsterIds.has(monsterId))continue;seenMonsterIds.add(monsterId);applySkillUses(monsterId,row?.skillUses);if(seenMonsterIds.size>=4)break}}
  else if(!hasSkillUsesRoster&&source.monsterId)applySkillUses(String(source.monsterId).slice(0,120),reward.skillUses);
 }
 const cap=(value,max)=>Math.max(0,Math.min(max,Math.floor(Number(value)||0))),gold=cap(reward.gold,Number.MAX_SAFE_INTEGER),goldCost=cap(reward.goldCost,Number.MAX_SAFE_INTEGER),captureCrystals=cap(reward.captureCrystals,999),crystals=cap(reward.crystals,50_000),abyssKeys=cap(reward.abyssKeys,999),abyssKeyCost=cap(reward.abyssKeyCost,99),potions=cap(reward.potions,999),raidMaterials=cap(reward.raidMaterials,50_000),experience=cap(reward.experience,1_000_000_000),equipmentRarity=!source.bossFirstClear&&["N","R","SR","SSR","UR","LR","神話"].includes(String(reward.randomEquipmentRarity))?String(reward.randomEquipmentRarity):null,battleCapture=kind==="battleCapture"&&Boolean(reward.captureAttempted),captureCost=battleCapture?Math.max(1,cap(reward.captureCrystalCost??1,99)):0;
 let captureSuccess=false,captureStorageFull=false,captureNoCrystal=false,captureName="",experienceTarget="",equipmentName="",equipmentSlot=null,equipmentAcquired=false;
 if(battleCapture){if((Number(save.state.inventory.captureCrystals)||0)<captureCost)captureNoCrystal=true;else{save.state.inventory.captureCrystals-=captureCost;const contract=reward.capture,speciesId=String(contract?.speciesId??"");if(reward.captureSuccess&&SPECIES[speciesId]){if(save.state.monsters.length>=MONSTER_STORAGE_CAP){save.state.inventory.captureCrystals+=captureCost;captureStorageFull=true}else{const monster=createMonster(speciesId,{nickname:String(contract?.name??SPECIES[speciesId].name).slice(0,40),level:Math.max(1,Math.min(10000,Number(contract?.level)||1)),attribute:contract?.attribute??SPECIES[speciesId].element,obtainedMethod:"onlineCoopCapture",obtainedFloor:Math.max(1,Math.min(10000,Number(contract?.floor??source.floor)||1))});save.state.monsters.push(monster);save.state.records??={};save.state.records.captures=(Number(save.state.records.captures)||0)+1;save.state.codex??={encounters:{},captures:{},equipment:{}};save.state.codex.encounters??={};save.state.codex.captures??={};save.state.codex.encounters[speciesId]=(Number(save.state.codex.encounters[speciesId])||0)+1;save.state.codex.captures[speciesId]=(Number(save.state.codex.captures[speciesId])||0)+1;online.captures=(Number(online.captures)||0)+1;captureSuccess=true;captureName=displayName(monster)}}}}
 if(equipmentRarity){const floor=Math.max(1,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(source.floor)||1))),slots=["weapon","armor","accessory"],campaignFirstClaim=kind==="campaignTrophy"&&source.firstClaim===true;let item=campaignFirstClaim?campaignTrophyEquipment({floor,boss:source.boss??null,bosses:source.bosses??[],rewardId:id,obtainedMethod:"onlineCampaignTrophy",level:reward.equipmentLevel}):null;if(!item){equipmentSlot=slots.includes(String(reward.equipmentSlot))?String(reward.equipmentSlot):slots[stableRewardIndex(id,slots.length)];item=createEquipment(equipmentSlot,{rarity:equipmentRarity});item.level=Math.max(1,Math.min(100_000,Math.floor(Number(reward.equipmentLevel)||floor)));item.obtainedMethod="onlineCoopBonus";item.obtainedFloor=floor}else equipmentSlot=item.slot;item.plus=Math.max(0,Math.min(999,Math.floor(Number(reward.equipmentPlus??item.plus)||0)));const received=receiveEquipment(save.state,item,{bossReward:campaignFirstClaim});equipmentAcquired=received?.location!=="sold";save.state.codex??={encounters:{},captures:{},equipment:{}};save.state.codex.equipment??={};save.state.codex.equipment[item.name]=(Number(save.state.codex.equipment[item.name])||0)+1;equipmentName=`${equipmentDisplayRarity(item)} ${item.name} Lv.${Math.max(1,Number(item.level)||1)}${Number(item.plus)>0?` +${Math.floor(Number(item.plus))}`:""}${received?.message?`（${received.message}）`:""}`}
 save.state.player.gold=Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,(Number(save.state.player.gold)||0)-goldCost+gold));save.state.player.crystals=Math.min(Number.MAX_SAFE_INTEGER,(Number(save.state.player.crystals)||0)+crystals);save.state.inventory.captureCrystals=Math.min(Number.MAX_SAFE_INTEGER,(Number(save.state.inventory.captureCrystals)||0)+captureCrystals);save.state.inventory.abyssKeys=Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,(Number(save.state.inventory.abyssKeys)||0)-abyssKeyCost+abyssKeys));save.state.inventory.potions=Math.min(Number.MAX_SAFE_INTEGER,(Number(save.state.inventory.potions)||0)+potions);online.raidMaterials=Math.min(Number.MAX_SAFE_INTEGER,(Number(online.raidMaterials)||0)+raidMaterials);
 if(kind==="campaignTrophy")applyOnlineCampaignTrophyFragments({rewardId:id,floor:Math.max(1,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(source.floor)||1))),source});
 const raidKinds=new Set(["raid","raidMilestone","raidJuvenile","raidPersonal"]),experienceRoster=[];if((explorationBattleKinds.has(kind)||raidKinds.has(kind))&&Array.isArray(reward.experienceRoster)){const seenMonsterIds=new Set();for(const row of reward.experienceRoster.slice(0,16)){const monsterId=String(row?.monsterId??"").slice(0,120);if(!monsterId||seenMonsterIds.has(monsterId))continue;seenMonsterIds.add(monsterId);experienceRoster.push({monsterId,experience:cap(row?.experience,1_000_000_000)});if(experienceRoster.length>=4)break}}
 const appliedExperienceRoster=[];if(experienceRoster.length){for(const row of experienceRoster){const target=save.state.monsters.find(monster=>monster.id===row.monsterId);if(!target)continue;if(row.experience)applyTotalExperience(target,totalExperience(target)+row.experience);target.currentHp=Math.min(calculatedStats(target).hp,Math.max(0,Number(target.currentHp)||0));target.currentMp=Math.min(maxMp(target),Math.max(0,Number(target.currentMp)||0));appliedExperienceRoster.push({monsterId:row.monsterId,experience:row.experience,experienceTarget:displayName(target)})}experienceTarget=appliedExperienceRoster.map(row=>row.experienceTarget).join("・")}else{let target=null;if(explorationBattleKinds.has(kind)&&source.monsterId)target=save.state.monsters.find(monster=>monster.id===String(source.monsterId));else if(raidKinds.has(kind)){const targetId=onlinePartyController?.selectedMonsterId??save.state.party?.[0];target=save.state.monsters.find(monster=>monster.id===String(targetId))}if(target&&experience){applyTotalExperience(target,totalExperience(target)+experience);target.currentHp=Math.min(calculatedStats(target).hp,Math.max(0,Number(target.currentHp)||0));target.currentMp=Math.min(maxMp(target),Math.max(0,Number(target.currentMp)||0));experienceTarget=displayName(target)}}if(kind==="raid")online.raidWins=(Number(online.raidWins)||0)+1;
 const worldOwnerId=String(source.worldOwnerId??source.ownerId??"").slice(0,24),selfId=String(onlinePartyController?.selfId??"").slice(0,24),roomOwnerId=String(onlinePartyController?.roomState?.expedition?.hostOwnerId??onlinePartyController?.roomState?.ownerId??"").slice(0,24),progressionEligible=Boolean(worldOwnerId)&&worldOwnerId===selfId&&(!roomOwnerId||roomOwnerId===selfId)&&source.progressionEligible!==false,leaderFloorUnlock=progressionEligible?cap(reward.leaderFloorUnlock??source.leaderFloorUnlock,WORLD_MAX_FLOOR):0;if(kind==="floorClear"&&leaderFloorUnlock>0){const clearedFloor=Math.max(1,Math.floor(Number(source.floor)||leaderFloorUnlock-1)),expeditionRunId=String(source.expeditionRunId??"").slice(0,120),manual=save.state.returnRewards?.manual,activeRunId=String(online.activeExpeditionRunId??""),completed=Boolean(expeditionRunId&&online.completedExpeditionRunIds.includes(expeditionRunId)),sameRun=Boolean(expeditionRunId&&activeRunId===expeditionRunId&&online.activeExpeditionOwnerId===worldOwnerId&&manual?.active&&online.activeManualExploreRunId&&online.activeManualExploreRunId===String(save.state.player.exploreRun?.id??"")),unrelatedManual=Boolean(manual?.active&&!sameRun),previousMax=Math.max(1,Number(save.state.player.maxFloor)||1);if(!completed&&!sameRun&&!unrelatedManual){beginManualExpedition(save.state,clearedFloor);if(expeditionRunId){online.activeExpeditionRunId=expeditionRunId;online.activeManualExploreRunId=String(save.state.player.exploreRun?.id??"").slice(0,120)||null;online.activeExpeditionOwnerId=worldOwnerId}}const attached=!completed&&!unrelatedManual&&Boolean(save.state.returnRewards?.manual?.active)&&(!expeditionRunId||online.activeExpeditionRunId===expeditionRunId&&online.activeExpeditionOwnerId===worldOwnerId&&online.activeManualExploreRunId===String(save.state.player.exploreRun?.id??""));if(attached&&leaderFloorUnlock>Number(save.state.returnRewards.manual.lastFloor||clearedFloor))recordManualFloorClear(save.state,leaderFloorUnlock);if(attached)save.state.player.currentFloor=Math.max(Number(save.state.player.currentFloor)||1,leaderFloorUnlock);save.state.player.maxFloor=Math.max(previousMax,leaderFloorUnlock);if(leaderFloorUnlock>previousMax)recordBiomeFloor(save.state,leaderFloorUnlock);if(leaderFloorUnlock===1001)markSecondWorldEntered(save.state)}
 online.claimedRewards.push(id);online.claimedRewards=online.claimedRewards.slice(-2048);online.totalGold=(Number(online.totalGold)||0)+gold;online.totalCaptureCrystals=(Number(online.totalCaptureCrystals)||0)+captureCrystals;if(kind==="completion"||kind==="floorClear")online.expeditionsCompleted=(Number(online.expeditionsCompleted)||0)+1;if(explorationBattleKinds.has(kind))online.battlesWon=(Number(online.battlesWon)||0)+1;if(!save.save()){save.state=backup;return{ok:false,message:"オンライン報酬を保存できなかったため再試行します"}}
 const importantRarities=new Set(["LR","神話","深淵","十神"]),isWeapon=Boolean(equipmentAcquired&&equipmentName&&equipmentSlot==="weapon"),isImportantEquipment=Boolean(equipmentAcquired&&equipmentName&&(isWeapon||importantRarities.has(equipmentRarity))),equipmentKindLabel=equipmentSlot==="weapon"?"武器":equipmentSlot==="armor"?"防具":equipmentSlot==="accessory"?"装飾品":"装備";
 const compact=value=>{const number=Math.max(0,Number(value)||0);if(number>=1e9)return`${Number((number/1e9).toFixed(1))}B`;if(number>=1e6)return`${Number((number/1e6).toFixed(1))}M`;if(number>=1e4)return`${Number((number/1e3).toFixed(1))}K`;return Math.floor(number).toLocaleString()},goldHud=document.getElementById("goldHud"),crystalHud=document.getElementById("crystalHud"),captureHud=document.getElementById("captureHud");if(goldHud)goldHud.textContent=compact(save.state.player.gold);if(crystalHud)crystalHud.textContent=compact(save.state.player.crystals);if(captureHud)captureHud.textContent=compact(save.state.inventory.captureCrystals);if(gold)showResourceToast("gold",gold);if(crystals)setTimeout(()=>showResourceToast("crystal",crystals),180);if(captureCrystals)setTimeout(()=>showResourceToast("capture",captureCrystals),300);if(abyssKeys)setTimeout(()=>showResourceToast("key",abyssKeys),360);if(potions)setTimeout(()=>showToast(`回復薬 ×${potions} 獲得`),380);if(raidMaterials)setTimeout(()=>showToast(`レイド核片 ×${raidMaterials} 獲得`),420);if(equipmentName&&!isImportantEquipment)setTimeout(()=>showToast(`装備獲得：${equipmentName}`),460);if(leaderFloorUnlock)showToast(`${leaderFloorUnlock}階が解放されました！`);
 return{ok:true,gold,goldCost,captureCrystals,crystals,abyssKeys,abyssKeyCost,potions,raidMaterials,experience,experienceRoster:appliedExperienceRoster,experienceTarget,equipmentName,equipmentSlot,equipmentKindLabel,isWeapon,isImportantEquipment,captureSuccess,captureStorageFull,captureNoCrystal,captureName,leaderFloorUnlock}
}
function exchangeOnlineRaidReward(kind,cost){
 const raw=String(kind??"").slice(0,120),parts=raw.split(":"),base=parts[0],bossId=parts[1]&&ONLINE_WEEKLY_RAID_REWARDS[parts[1]]?parts[1]:"abyss-amalga",rewardDef=ONLINE_WEEKLY_RAID_REWARDS[bossId],price=ONLINE_RAID_EXCHANGE_PRICES[base],online=onlinePartyPersistentState();if(!price)return{ok:false,message:"交換報酬が見つかりません"};const materials=Math.max(0,Math.floor(Number(online.raidMaterials)||0));if(materials<price)return{ok:false,message:`レイド核片が足りません（${materials}/${price}）`};online.raidExchange??={};const exchangeKey=base==="crystals"?base:`${base}:${bossId}`;if(["character","circle"].includes(base)&&Number(online.raidExchange[exchangeKey]??(bossId==="abyss-amalga"?online.raidExchange[base]:0))>0)return{ok:false,message:"この限定報酬は交換済みです"};let message="";
 if(base==="character"){if(save.state.monsters.length>=MONSTER_STORAGE_CAP)return{ok:false,message:"魔物庫が満杯です。先に整理してください"};const level=Math.max(1,Math.min(ENDGAME_MAX_LEVEL,Number(save.state.player.maxFloor)||1)),monster=createMonster(rewardDef.speciesId,{nickname:rewardDef.contractName,level,stars:MONSTER_STAR_MAX,rank:4,plus:12,attribute:rewardDef.attribute,obtainedMethod:"onlineWeeklyRaidExchange",obtainedFloor:save.state.player.maxFloor});monster.customVisualBase=rewardDef.visualBase;monster.raidLimited=true;monster.weeklyRaidBossId=bossId;monster.summonTier="神話";monster.summonRarity="神話";monster.tags=[...(monster.tags??[]),"raid","weekly",bossId,"raidJuvenile"];monster.equippedSkills=allLearnedSkills(monster).slice(0,4).map(skill=>skill.id);while(monster.equippedSkills.length<4)monster.equippedSkills.push(null);monster.skillLoadoutInitialized=true;monster.raidContractProfileVersion=1;monster.currentHp=calculatedStats(monster).hp;monster.currentMp=maxMp(monster);save.state.monsters.push(monster);save.state.codex??={encounters:{},captures:{},equipment:{}};save.state.codex.encounters??={};save.state.codex.captures??={};save.state.codex.encounters[monster.speciesId]=(Number(save.state.codex.encounters[monster.speciesId])||0)+1;save.state.codex.captures[monster.speciesId]=(Number(save.state.codex.captures[monster.speciesId])||0)+1;message=`限定仲間「${rewardDef.contractName}」と契約しました`}
 else if(base==="equipment"){const item=createEquipment("weapon",{rarity:"神話"});item.name=rewardDef.equipmentName;item.level=Math.max(1,Math.min(10000,Math.round((Number(save.state.player.maxFloor)||1)*1.35)));item.plus=30;item.raidLimited=true;item.weeklyRaidBossId=bossId;item.ruleOverrides={...(item.ruleOverrides??{}),unsellable:true,raidResonance:true,weeklyRaidBossId:bossId};const result=receiveEquipment(save.state,item,{bossReward:true});message=`限定神話武器「${rewardDef.equipmentName}」を獲得（${result.message}）`}
 else if(base==="circle"){if(!rewardDef.circleId)return{ok:false,message:"このボスに交換可能な魔法陣はありません"};const instance=createMagicCircleInstance(save.state,rewardDef.circleId,{level:1,source:"weeklyRaidExchange",locked:false});if(!instance)return{ok:false,message:"魔法陣の現物を追加できませんでした"};message=`「${rewardDef.circleName}」の現物を1個獲得しました`}
 else if(base==="crystals"){save.state.player.crystals=Math.min(Number.MAX_SAFE_INTEGER,(Number(save.state.player.crystals)||0)+100);message="魔晶石 ×100を獲得しました"}
 online.raidMaterials=materials-price;online.raidExchange[exchangeKey]=(Number(online.raidExchange[exchangeKey])||0)+1;save.save();return{ok:true,message,price}
}
function retireLegacyCampaignBossRewardChoices(){
 const pending=save.state.player?.pendingBossRewards;if(!pending||typeof pending!=="object"||Array.isArray(pending))return false;let changed=false;for(const[floor,reward]of Object.entries(pending)){const current=Number(floor);if(Number.isInteger(current)&&current>=1&&current<=CAMPAIGN_MAX_FLOOR&&reward?.rewardFormat==="build194-floor-boss-three-choice"){delete pending[floor];changed=true}}return changed
}
let legacyOnlineProgressRecoveryPromptOpen=false;
function showLegacyOnlineProgressRecovery(){
 if(legacyOnlineProgressRecoveryPromptOpen)return false;if(topModal()||save.state.activeBattle){setTimeout(showLegacyOnlineProgressRecovery,1200);return false}const candidate=legacyProgressRecoveryCandidate(save.state,{selfId:ensureOnlinePartyController().selfId});if(!candidate)return false;if(save.state.player?.inRun&&!candidate.onlineRunAttached){setTimeout(showLegacyOnlineProgressRecovery,1200);return false}legacyOnlineProgressRecoveryPromptOpen=true;
 const body=`<div class="legacy-online-progress-recovery"><p>共同探索のゲスト参加により、本編の到達階層が上書きされた可能性があります。</p><dl><div><dt>現在の最高階層</dt><dd>${candidate.currentMax.toLocaleString()}階</dd></div><div><dt>確認できた本編進行</dt><dd>${candidate.suggestedMax.toLocaleString()}階</dd></div></dl><label>戻す最高階層<input type="number" data-legacy-progress-floor min="1" max="${candidate.currentMax}" value="${candidate.suggestedMax}" inputmode="numeric"></label><p class="note">GOLD・魔晶石・装備・仲間・経験値など、オンラインで得た報酬は残ります。修復直後なら元に戻せます。</p><button type="button" class="ghost" data-legacy-progress-dismiss style="width:100%">変更しない</button></div>`;
 app.insertAdjacentHTML("beforeend",Modal("オンライン進行データの修復",body,"この階層へ修復"));const modal=topModal(),close=()=>{legacyOnlineProgressRecoveryPromptOpen=false;modal?.remove()};modal._onDismiss=close;
 modal.querySelector("[data-legacy-progress-dismiss]").onclick=()=>{const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state));dismissLegacyProgressRecovery(save.state,candidate);if(!save.save())save.state=backup;close()};
 modal.querySelector("[data-modal-primary]").onclick=()=>{const input=modal.querySelector("[data-legacy-progress-floor]"),target=Math.max(1,Math.min(candidate.currentMax,Math.floor(Number(input?.value)||candidate.suggestedMax))),backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),result=applyLegacyProgressRecovery(save.state,candidate,target);if(!result.ok||!save.save()){save.state=backup;showToast("進行データを修復できませんでした");return}close();render();showToast(`本編の最高階層を ${result.targetFloor}階 に修復しました`);app.insertAdjacentHTML("beforeend",Modal("修復完了",`<p>オンライン報酬を残したまま、本編進行だけを ${result.targetFloor.toLocaleString()}階 へ戻しました。</p><button type="button" class="ghost" data-legacy-progress-undo style="width:100%">修復前へ戻す</button>`,"閉じる"));const done=topModal(),finish=()=>done?.remove();done._onDismiss=finish;done.querySelector("[data-modal-primary]").onclick=finish;done.querySelector("[data-legacy-progress-undo]").onclick=()=>{const undoBackup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),undo=undoLegacyProgressRecovery(save.state);if(!undo.ok||!save.save()){save.state=undoBackup;showToast("修復前の状態へ戻せませんでした");return}finish();render();showToast("修復前の進行データへ戻しました")}};return true
}
function notifyInterruptedGuestProgressRecovery(){
 const recovery=save.state.onlineParty?.progressIsolation?.interruptedRecovery;if(recovery?.reason!=="reload"||recovery.notifiedAt)return false;recovery.notifiedAt=Date.now();save.save();showToast("再読み込み前の本編進行を復元しました。オンライン報酬は保持されています");return true
}
function enterOnlineSecretRoom(event={}){
 const playerId=String(event.playerId??""),roomId=String(event.roomId??"").trim().slice(0,160),floor=Math.max(1,Math.min(WORLD_MAX_FLOOR,Math.floor(Number(event.floor)||1)));
 if(!onlinePartyController||playerId!==onlinePartyController.selfId||!roomId)return false;
 if(onlineSecretRoomContext?.roomId===roomId&&screen==="shop")return true;
 ensureSecretRoomExpedition(save.state);enterSecretRoom(save.state,roomId,floor);save.save();
 onlineSecretRoomContext={roomId,floor,onlineRoomId:onlinePartyController.roomId,route:onlinePartyController.route};
 onlinePartyController.unmount({disconnect:false});screen="shop";render();return true
}
function persistGuestProgressIsolation(event={}){
 const phase=String(event.phase??"").slice(0,20);if(!["enter","reconnect","exit"].includes(phase))return{ok:false,message:"ゲスト進行の分離操作を確認できません"};
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),result=phase==="exit"?finishGuestProgressIsolation(save.state,{reason:event.reason??"leave"}):beginGuestProgressIsolation(save.state,{roomId:event.roomId,ownerId:event.ownerId,selfId:onlinePartyController?.selfId,runId:event.runId,startFloor:event.startFloor});
 if(!result?.ok){save.state=backup;return{ok:false,message:"ゲスト進行を安全に分離できませんでした"}}if(!save.save()){save.state=backup;return{ok:false,message:"ゲスト進行の保護状態を保存できませんでした"}}return result
}
function ensureOnlinePartyController(){
 onlinePartyController??=new OnlinePartyController({
	  getState:()=>save.state,toast:showToast,onReward:claimOnlinePartyReward,onExpeditionStarted:beginOnlineExpeditionResultRun,onExpeditionResult:settleOnlineExpeditionResult,onExpeditionOrphaned:recoverOrphanedOnlineExpedition,onGuestProgressIsolation:persistGuestProgressIsolation,onShowExpeditionResult:showOnlineExpeditionResult,onBack:()=>finishOnlinePartyNavigation("home"),
  onExploreCanvasMount:mountOnlineExploreCanvas,
	  onExploreCanvasUpdate:updateOnlineExploreCanvas,
	  onExploreCanvasUnmount:unmountOnlineExploreCanvas,
	  onHostWorldUpdate:persistOnlineHostWorld,
	  onOnlineStateMutation:persistOnlineStateMutation,
	  onRaidWorldUpdate:persistOnlineRaidWorld,
	  onRaidExchange:exchangeOnlineRaidReward,
	  onOnlineVitalsUpdate:applyOnlineVitalsUpdate,
	  onBattleDefeated:persistOnlineBattleDefeated,
	  onTeamBattleResult:persistOnlineTeamBattleResult,
	  onSecretRoomEntered:enterOnlineSecretRoom,
	  onBeginSecretRoomExpedition:candidate=>{let run;if(candidate&&String(candidate.id??"").trim()&&Number(candidate.seed)>0){ensureSecretRoomExpedition(save.state);run={id:String(candidate.id).slice(0,120),seed:Math.max(1,Math.min(0x7fffffff,Math.floor(Number(candidate.seed)||1))),startedAt:Math.max(1,Math.floor(Number(candidate.startedAt)||Date.now()))};save.state.secretRooms.run=run;save.state.secretRooms.activeRoom=null}else run=beginSecretRoomExpedition(save.state);save.save();return run},
	  onTutorialGuide:id=>{if(["explore_move","explore_pickup"].includes(id))completeContextGuide(id,{quiet:true})},
	  onScene:scene=>audio.setScene(scene),
	  onPowerRankingState:handlePowerRankingState,
	  onPowerRankingProfile:handlePowerRankingProfile,
	  onPowerRankingReward:handlePowerRankingReward,
	  onConnectionStatus:handleServerConnectionStatus
 });
 return onlinePartyController
}
function bindOnlineParty(){
 ensureSecretRoomExpedition(save.state);save.save();
 ensureOnlinePartyController().mount(app);
}

function normalizedOnlineCampaignBossIds(source){
 return[...new Set((Array.isArray(source)?source:[]).map(value=>String(value??"").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,100)).filter(Boolean))].slice(0,16)
}
function normalizedOnlineCampaignBossPacks(source){
 const result={};if(!source||typeof source!=="object"||Array.isArray(source))return result;
 for(const[rawBossId,rawCount]of Object.entries(source).slice(0,16)){const[bossId]=normalizedOnlineCampaignBossIds([rawBossId]),count=Math.max(0,Math.min(CAMPAIGN_KEYS_PER_FLOOR,Math.floor(Number(rawCount)||0)));if(bossId&&count>0)result[bossId]=count}return result
}
function normalizedOnlineCampaignProgress(source={}){
 const ids=[...new Set((Array.isArray(source?.collectedKeyIds)?source.collectedKeyIds:[]).map(value=>String(value??"").slice(0,80)).filter(Boolean))].slice(0,CAMPAIGN_KEYS_PER_FLOOR);
 const rawLocks=Math.max(0,Math.min(CAMPAIGN_KEYS_PER_FLOOR,Math.floor(Number(source?.trophyLocksOpened)||0)));
 const trophyFragmentPacksClaimed=Math.max(rawLocks,Math.max(0,Math.min(CAMPAIGN_KEYS_PER_FLOOR,Math.floor(Number(source?.trophyFragmentPacksClaimed)||0))));
 const keysCollected=Math.max(ids.length,rawLocks,Math.max(0,Math.min(CAMPAIGN_KEYS_PER_FLOOR,Math.floor(Number(source?.keysCollected)||0))));
 const hasLegacyOpenedLedger=Object.prototype.hasOwnProperty.call(source??{},"claimedBossIds"),hasOpenedLedger=Object.prototype.hasOwnProperty.call(source??{},"openedBossIds")||hasLegacyOpenedLedger,hasMythicLedger=Object.prototype.hasOwnProperty.call(source??{},"mythicClaimedBossIds")||hasLegacyOpenedLedger,hasPackLedger=Object.prototype.hasOwnProperty.call(source??{},"fragmentPacksClaimedByBoss"),hasDefeatLedger=Object.prototype.hasOwnProperty.call(source??{},"defeatedBossIds")||hasOpenedLedger;
 const legacyOpenedBossIds=normalizedOnlineCampaignBossIds(source?.claimedBossIds),openedBossIds=normalizedOnlineCampaignBossIds(Object.prototype.hasOwnProperty.call(source??{},"openedBossIds")?source.openedBossIds:legacyOpenedBossIds),mythicClaimedBossIds=normalizedOnlineCampaignBossIds(Object.prototype.hasOwnProperty.call(source??{},"mythicClaimedBossIds")?source.mythicClaimedBossIds:legacyOpenedBossIds),fragmentPacksClaimedByBoss=normalizedOnlineCampaignBossPacks(source?.fragmentPacksClaimedByBoss);
 for(const bossId of openedBossIds)fragmentPacksClaimedByBoss[bossId]=CAMPAIGN_KEYS_PER_FLOOR;
 const defeatedBossIds=normalizedOnlineCampaignBossIds([...(Array.isArray(source?.defeatedBossIds)?source.defeatedBossIds:[]),...openedBossIds]),legacyMythic=!hasMythicLedger&&rawLocks>=CAMPAIGN_KEYS_PER_FLOOR;
 const state={runId:String(source?.runId??"").slice(0,120)||null,keysCollected,trophyLocksOpened:rawLocks>=CAMPAIGN_KEYS_PER_FLOOR?CAMPAIGN_KEYS_PER_FLOOR:0,trophyFragmentPacksClaimed,collectedKeyIds:ids,hotSpringUsed:Boolean(source?.hotSpringUsed),trophyMythicClaimed:Boolean(source?.trophyMythicClaimed)||mythicClaimedBossIds.length>0||legacyMythic,replayActive:Boolean(source?.replayActive),bossDefeatedThisRun:Boolean(source?.bossDefeatedThisRun)||defeatedBossIds.length>0};
 if(hasDefeatLedger)state.defeatedBossIds=defeatedBossIds;if(hasOpenedLedger){state.openedBossIds=openedBossIds;state.claimedBossIds=[...openedBossIds]}if(hasMythicLedger)state.mythicClaimedBossIds=mythicClaimedBossIds;if(hasPackLedger||Object.keys(fragmentPacksClaimedByBoss).length)state.fragmentPacksClaimedByBoss=fragmentPacksClaimedByBoss;return state
}
function mergeOnlineCampaignProgress(currentSource,incomingSource){
 const current=normalizedOnlineCampaignProgress(currentSource),incoming=normalizedOnlineCampaignProgress(incomingSource),newReplay=Boolean(incoming.replayActive&&incoming.runId&&incoming.runId!==current.runId),hasDefeatLedger=Object.prototype.hasOwnProperty.call(current,"defeatedBossIds")||Object.prototype.hasOwnProperty.call(incoming,"defeatedBossIds"),hasOpenedLedger=Object.prototype.hasOwnProperty.call(current,"openedBossIds")||Object.prototype.hasOwnProperty.call(incoming,"openedBossIds"),hasMythicLedger=Object.prototype.hasOwnProperty.call(current,"mythicClaimedBossIds")||Object.prototype.hasOwnProperty.call(incoming,"mythicClaimedBossIds"),hasPackLedger=Object.prototype.hasOwnProperty.call(current,"fragmentPacksClaimedByBoss")||Object.prototype.hasOwnProperty.call(incoming,"fragmentPacksClaimedByBoss");
 const mythicClaimedBossIds=normalizedOnlineCampaignBossIds([...(current.mythicClaimedBossIds??[]),...(incoming.mythicClaimedBossIds??[])]);
 if(newReplay){const defeatedBossIds=normalizedOnlineCampaignBossIds(incoming.defeatedBossIds??[]),openedBossIds=normalizedOnlineCampaignBossIds(incoming.openedBossIds??[]),fragmentPacksClaimedByBoss=normalizedOnlineCampaignBossPacks(incoming.fragmentPacksClaimedByBoss),result={...incoming,trophyMythicClaimed:current.trophyMythicClaimed||incoming.trophyMythicClaimed||mythicClaimedBossIds.length>0,bossDefeatedThisRun:Boolean(incoming.bossDefeatedThisRun)||defeatedBossIds.length>0};for(const bossId of openedBossIds)fragmentPacksClaimedByBoss[bossId]=CAMPAIGN_KEYS_PER_FLOOR;if(hasDefeatLedger)result.defeatedBossIds=normalizedOnlineCampaignBossIds([...defeatedBossIds,...openedBossIds]);if(hasOpenedLedger){result.openedBossIds=openedBossIds;result.claimedBossIds=[...openedBossIds]}if(hasMythicLedger)result.mythicClaimedBossIds=mythicClaimedBossIds;if(hasPackLedger)result.fragmentPacksClaimedByBoss=fragmentPacksClaimedByBoss;return result}
 const ids=[...new Set([...current.collectedKeyIds,...incoming.collectedKeyIds])].slice(0,CAMPAIGN_KEYS_PER_FLOOR),keysCollected=Math.max(ids.length,current.keysCollected,incoming.keysCollected),openedBossIds=normalizedOnlineCampaignBossIds([...(current.openedBossIds??[]),...(incoming.openedBossIds??[])]),defeatedBossIds=normalizedOnlineCampaignBossIds([...(current.defeatedBossIds??[]),...(incoming.defeatedBossIds??[]),...openedBossIds]),fragmentPacksClaimedByBoss=normalizedOnlineCampaignBossPacks(current.fragmentPacksClaimedByBoss);
 for(const[bossId,count]of Object.entries(normalizedOnlineCampaignBossPacks(incoming.fragmentPacksClaimedByBoss)))fragmentPacksClaimedByBoss[bossId]=Math.max(fragmentPacksClaimedByBoss[bossId]??0,count);for(const bossId of openedBossIds)fragmentPacksClaimedByBoss[bossId]=CAMPAIGN_KEYS_PER_FLOOR;
 const sameRun=!current.runId||!incoming.runId||current.runId===incoming.runId,result={runId:incoming.runId||current.runId,keysCollected,trophyLocksOpened:Math.max(current.trophyLocksOpened,incoming.trophyLocksOpened)>=CAMPAIGN_KEYS_PER_FLOOR?CAMPAIGN_KEYS_PER_FLOOR:0,trophyFragmentPacksClaimed:Math.max(current.trophyFragmentPacksClaimed,incoming.trophyFragmentPacksClaimed),collectedKeyIds:ids,hotSpringUsed:current.hotSpringUsed||incoming.hotSpringUsed,trophyMythicClaimed:current.trophyMythicClaimed||incoming.trophyMythicClaimed||mythicClaimedBossIds.length>0,replayActive:sameRun?current.replayActive||incoming.replayActive:incoming.replayActive,bossDefeatedThisRun:current.bossDefeatedThisRun||incoming.bossDefeatedThisRun||defeatedBossIds.length>0};if(hasDefeatLedger)result.defeatedBossIds=defeatedBossIds;if(hasOpenedLedger){result.openedBossIds=openedBossIds;result.claimedBossIds=[...openedBossIds]}if(hasMythicLedger)result.mythicClaimedBossIds=mythicClaimedBossIds;if(hasPackLedger)result.fragmentPacksClaimedByBoss=fragmentPacksClaimedByBoss;return result
}
function ensureOnlineCampaignKeyCount(entry,floor,count){
 entry.keyIds=[...new Set((entry.keyIds??[]).map(String).filter(Boolean))].slice(0,CAMPAIGN_KEYS_PER_FLOOR);for(let index=entry.keyIds.length;index<Math.min(CAMPAIGN_KEYS_PER_FLOOR,count);index++){const id=`online:${floor}:campaign-key:${index+1}`;if(!entry.keyIds.includes(id))entry.keyIds.push(id)}entry.keysCollected=entry.keyIds.length
}
function mergeOnlineCampaignProgressIntoLocal(floor,source){
 const incoming=normalizedOnlineCampaignProgress(source),currentFloor=Math.max(1,Math.min(CAMPAIGN_MAX_FLOOR,Math.floor(Number(floor)||1))),entry=campaignFloorState(save.state,currentFloor),bossIds=campaignMilestoneBossIds(currentFloor),hasDefeatLedger=Object.prototype.hasOwnProperty.call(incoming,"defeatedBossIds"),hasOpenedLedger=Object.prototype.hasOwnProperty.call(incoming,"openedBossIds"),hasMythicLedger=Object.prototype.hasOwnProperty.call(incoming,"mythicClaimedBossIds"),hasPackLedger=Object.prototype.hasOwnProperty.call(incoming,"fragmentPacksClaimedByBoss"),newReplay=Boolean(incoming.replayActive&&incoming.runId&&incoming.runId!==entry.runId),existingClaims=new Set(campaignBossProgressList(entry).filter(progress=>progress.trophyClaimed).map(progress=>progress.bossId)),existingAreas=Object.fromEntries(campaignBossProgressList(entry).map(progress=>[progress.bossId,progress.bossAreaId??null]));
 const defeatedBossIds=hasDefeatLedger?incoming.defeatedBossIds.filter(id=>bossIds.includes(id)):(!newReplay&&(incoming.bossDefeatedThisRun||incoming.trophyFragmentPacksClaimed>0||incoming.hotSpringUsed)?bossIds:[]),openedBossIds=hasOpenedLedger?incoming.openedBossIds.filter(id=>bossIds.includes(id)):(!newReplay&&incoming.trophyLocksOpened>=CAMPAIGN_KEYS_PER_FLOOR?bossIds:[]),mythicClaimedBossIds=hasMythicLedger?incoming.mythicClaimedBossIds.filter(id=>bossIds.includes(id)):(!newReplay&&incoming.trophyMythicClaimed?bossIds:[]),fragmentPacksClaimedByBoss=normalizedOnlineCampaignBossPacks(incoming.fragmentPacksClaimedByBoss);
 for(const bossId of mythicClaimedBossIds)existingClaims.add(bossId);
 if(newReplay){entry.runId=incoming.runId;entry.keyIds=[...incoming.collectedKeyIds];ensureOnlineCampaignKeyCount(entry,currentFloor,incoming.keysCollected);entry.keysConsumed=0;entry.bossDiscovered=false;entry.bossDefeated=false;entry.bossProgress=Object.fromEntries(bossIds.map(bossId=>[bossId,{bossId,discovered:false,defeated:false,trophyLocksOpened:0,trophyFragmentPacksClaimed:0,trophyClaimed:existingClaims.has(bossId),bossAreaId:existingAreas[bossId],trophySpawn:null}]));entry.trophyLocksOpened=0;entry.trophyFragmentPacksClaimed=0;entry.trophyClaimed=bossIds.length?bossIds.every(id=>existingClaims.has(id)):Boolean(entry.trophyClaimed||incoming.trophyMythicClaimed);entry.hotSpringUsed=incoming.hotSpringUsed;entry.exitUnlocked=false;entry.cleared=false;entry.visitedRoomIds=[];entry.postBossSpawns=null;entry.replayActive=true}else{entry.runId=incoming.runId||entry.runId||"";entry.keyIds=[...new Set([...(entry.keyIds??[]),...incoming.collectedKeyIds])].slice(0,CAMPAIGN_KEYS_PER_FLOOR);ensureOnlineCampaignKeyCount(entry,currentFloor,Math.max(Number(entry.keysCollected)||0,incoming.keysCollected));entry.hotSpringUsed=Boolean(entry.hotSpringUsed||incoming.hotSpringUsed);entry.replayActive=incoming.replayActive}
 if(bossIds.length){for(const bossId of defeatedBossIds)defeatCampaignBoss(save.state,currentFloor,bossId);for(const bossId of bossIds){const progress=campaignBossProgress(save.state,currentFloor,bossId);if(!progress)continue;const fragmentCount=Math.max(0,Math.min(CAMPAIGN_KEYS_PER_FLOOR,Number(fragmentPacksClaimedByBoss[bossId])||0));if(fragmentCount)progress.trophyFragmentPacksClaimed=Math.max(progress.trophyFragmentPacksClaimed,fragmentCount);if(openedBossIds.includes(bossId)){progress.trophyLocksOpened=CAMPAIGN_KEYS_PER_FLOOR;progress.trophyFragmentPacksClaimed=CAMPAIGN_KEYS_PER_FLOOR}if(existingClaims.has(bossId))progress.trophyClaimed=true}}else{if(incoming.bossDefeatedThisRun||incoming.trophyFragmentPacksClaimed>0||incoming.hotSpringUsed)defeatCampaignBoss(save.state,currentFloor);entry.trophyLocksOpened=Math.max(Number(entry.trophyLocksOpened)||0,incoming.trophyLocksOpened)>=CAMPAIGN_KEYS_PER_FLOOR?CAMPAIGN_KEYS_PER_FLOOR:0;entry.trophyFragmentPacksClaimed=Math.max(Number(entry.trophyFragmentPacksClaimed)||0,incoming.trophyFragmentPacksClaimed);entry.trophyClaimed=Boolean(entry.trophyClaimed||incoming.trophyMythicClaimed);entry.keysConsumed=entry.trophyLocksOpened>=CAMPAIGN_KEYS_PER_FLOOR?CAMPAIGN_KEYS_PER_FLOOR:0}
 const normalized=campaignFloorState(save.state,currentFloor);if(bossIds.length)normalized.keysConsumed=0;
 save.state.player.bossRewards??={};if(normalized.trophyClaimed)save.state.player.bossRewards[currentFloor]="CAMPAIGN_TROPHY_COMPLETE";else if(!isCampaignMultiBossFloor(currentFloor)&&normalized.trophyFragmentPacksClaimed>0)save.state.player.bossRewards[currentFloor]=`CAMPAIGN_TROPHY_${Math.min(2,normalized.trophyFragmentPacksClaimed)}`;return{entry:normalized,incoming,newReplay,hasDefeatLedger,hasOpenedLedger,hasMythicLedger,defeatedBossIds,openedBossIds,mythicClaimedBossIds,fragmentPacksClaimedByBoss,defeatedEvidence:normalized.bossDefeated||defeatedBossIds.length>0}
}
function persistOnlineHostWorld(event){
 const ownerId=String(event?.ownerId??event?.hostOwnerId??"").slice(0,24);if(!ownsOnlineWorldProgress({worldOwnerId:ownerId,progressionEligible:true}))return{ok:true,ignored:true,guest:true};
 const backup=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),online=onlinePartyPersistentState(),host=online.hostWorld,source=event?.kind==="hostWorldSnapshot"&&event.hostWorld&&typeof event.hostWorld==="object"?event.hostWorld:{};host.revision=Math.max(Number(host.revision)||0,Number(source.revision)||0,Number(event?.revision)||0);host.openedChestIds??={};host.floorSeeds??={};host.campaignFloorStates??={};save.state.player.openedChests??={};save.state.player.floorSeeds??={};save.state.player.bossKills??={};save.state.records??={};normalizeCampaignState(save.state);host.ownerId=ownerId;
 const opened={...(source.openedChestIds&&typeof source.openedChestIds==="object"?source.openedChestIds:{})};if(event?.chestId){const floor=String(Math.max(1,Math.floor(Number(event.floor)||1)));opened[floor]=[...(Array.isArray(opened[floor])?opened[floor]:[]),String(event.chestId)]}for(const[floor,ids]of Object.entries(opened)){if(!Array.isArray(ids))continue;host.openedChestIds[floor]=Array.isArray(host.openedChestIds[floor])?host.openedChestIds[floor]:[];save.state.player.openedChests[floor]=Array.isArray(save.state.player.openedChests[floor])?save.state.player.openedChests[floor]:[];for(const rawId of ids.map(String).filter(Boolean).slice(0,200)){if(!host.openedChestIds[floor].includes(rawId))host.openedChestIds[floor].push(rawId);if(!save.state.player.openedChests[floor].includes(rawId)){save.state.player.openedChests[floor].push(rawId);save.state.records.chests=(Number(save.state.records.chests)||0)+1;recordBiomeChest(save.state,Number(floor)||1,rawId)}}}
 const floorSeeds={...(source.floorSeeds&&typeof source.floorSeeds==="object"?source.floorSeeds:{})};if(event?.floorSeed!=null)floorSeeds[String(Math.max(1,Math.floor(Number(event.floor)||1)))]=event.floorSeed;for(const[floor,rawSeed]of Object.entries(floorSeeds)){const seed=Math.max(0,Math.floor(Number(rawSeed)||0))>>>0;host.floorSeeds[floor]=seed;save.state.player.floorSeeds[floor]=seed}
 const localMergeByFloor=new Map(),defeatedEvidence=new Set(),campaignStates=source.campaignFloorStates&&typeof source.campaignFloorStates==="object"&&!Array.isArray(source.campaignFloorStates)?source.campaignFloorStates:{};for(const[rawFloor,state]of Object.entries(campaignStates).slice(0,CAMPAIGN_MAX_FLOOR)){const floor=Number(rawFloor);if(!Number.isInteger(floor)||floor<1||floor>CAMPAIGN_MAX_FLOOR)continue;host.campaignFloorStates[String(floor)]=mergeOnlineCampaignProgress(host.campaignFloorStates[String(floor)],state);const merged=mergeOnlineCampaignProgressIntoLocal(floor,host.campaignFloorStates[String(floor)]);localMergeByFloor.set(floor,merged);if(merged.defeatedEvidence)defeatedEvidence.add(floor)}
 const explicitFloor=event?.kind==="floorBossDefeated"?Number(event.floor):null;if(Number.isInteger(explicitFloor)&&explicitFloor>=1&&explicitFloor<=CAMPAIGN_MAX_FLOOR){const currentState=normalizedOnlineCampaignProgress(host.campaignFloorStates[String(explicitFloor)]),profiles=[event?.boss,...(Array.isArray(event?.bosses)?event.bosses:[])].filter(value=>value&&typeof value==="object"),profileBossIds=profiles.flatMap(profile=>[profile.campaignBossId,profile.bossId,profile.endgameBossId,profile.floorBossCatalogId]),explicitBossIds=normalizedOnlineCampaignBossIds([...(Array.isArray(event?.defeatedBossIds)?event.defeatedBossIds:[]),event?.bossId,...profileBossIds]).filter(id=>campaignMilestoneBossIds(explicitFloor).includes(id)),explicitState={runId:currentState.runId,replayActive:currentState.replayActive,bossDefeatedThisRun:true,defeatedBossIds:explicitBossIds,openedBossIds:currentState.openedBossIds??currentState.claimedBossIds??[],mythicClaimedBossIds:currentState.mythicClaimedBossIds??[],fragmentPacksClaimedByBoss:currentState.fragmentPacksClaimedByBoss??{}};host.campaignFloorStates[String(explicitFloor)]=mergeOnlineCampaignProgress(currentState,explicitState);const merged=mergeOnlineCampaignProgressIntoLocal(explicitFloor,host.campaignFloorStates[String(explicitFloor)]);localMergeByFloor.set(explicitFloor,merged);defeatedEvidence.add(explicitFloor)}
 const defeated=[...(Array.isArray(source.defeatedBossFloors)?source.defeatedBossFloors:[]),...defeatedEvidence,...(Number.isInteger(explicitFloor)?[explicitFloor]:[])].map(Number).filter(floor=>Number.isInteger(floor)&&floor>=1&&floor<=CAMPAIGN_MAX_FLOOR);host.defeatedBossFloors=Array.isArray(host.defeatedBossFloors)?host.defeatedBossFloors:[];online.firstCoopBossClears=Array.isArray(online.firstCoopBossClears)?online.firstCoopBossClears:[];for(const floor of [...new Set(defeated)]){const runState=normalizedOnlineCampaignProgress(host.campaignFloorStates[String(floor)]),merged=localMergeByFloor.get(floor),replayPending=runState.replayActive&&!runState.bossDefeatedThisRun&&floor!==explicitFloor;if(replayPending)continue;if(!merged&&Object.prototype.hasOwnProperty.call(runState,"defeatedBossIds")){for(const bossId of runState.defeatedBossIds)defeatCampaignBoss(save.state,floor,bossId)}else if(!merged)defeatCampaignBoss(save.state,floor);if(!host.defeatedBossFloors.includes(floor))host.defeatedBossFloors.push(floor);const firstHistoricalClear=(Number(save.state.player.bossKills[floor])||0)<=0;save.state.player.bossKills[floor]=Math.max(1,Number(save.state.player.bossKills[floor])||0);if(!online.firstCoopBossClears.includes(floor))online.firstCoopBossClears.push(floor);if(firstHistoricalClear)recordBiomeBoss(save.state,floor);if(floor===CAMPAIGN_MAX_FLOOR)mark1000FloorCleared(save.state)}
 if(Number.isInteger(explicitFloor)&&explicitFloor>=1&&explicitFloor<=CAMPAIGN_MAX_FLOOR){const profile=event?.boss??event?.bosses?.[0]??null;if(profile){const entry=campaignFloorState(save.state,explicitFloor);entry.lastBossInfo={speciesId:profile.speciesId??null,name:profile.name??null,floorBossCatalogId:profile.floorBossCatalogId??null,endgameBossId:profile.endgameBossId??null,milestoneBossIds:milestoneBossIdsForFloor(explicitFloor)}}}
 const claimed=(Array.isArray(source.claimedBossRewardFloors)?source.claimedBossRewardFloors:[]).map(Number).filter(floor=>Number.isInteger(floor)&&floor>=1&&floor<=CAMPAIGN_MAX_FLOOR);host.claimedBossRewardFloors=[...new Set([...(Array.isArray(host.claimedBossRewardFloors)?host.claimedBossRewardFloors:[]),...claimed])].slice(0,CAMPAIGN_MAX_FLOOR);if(!save.save()){save.state=backup;return{ok:false,message:"主の世界の進行を保存できませんでした"}}return{ok:true}
}

function onlineExploreMonster(member){
 const profile=member?.profile??{},vitals=member?.coopVitals??profile.battleStats??{},stats=profile.battleStats??{};
 return{id:member.playerId,speciesId:profile.speciesId??"slime",visualSpeciesId:profile.visualSpeciesId??null,endgameBossId:profile.endgameBossId??null,floorBossCatalogId:profile.floorBossCatalogId??null,customVisualAsset:profile.customVisualAsset??null,nickname:profile.monsterName??profile.displayName??"冒険者",level:Math.max(1,Number(profile.level)||1),stars:Math.max(1,Number(profile.stars)||1),rank:1,plus:Math.max(0,Number(profile.plus)||0),attribute:profile.attribute??"neutral",currentHp:Math.max(0,Number(vitals.hp??stats.hp)||0),currentMp:Math.max(0,Number(vitals.mp??stats.mp)||0),onlineStats:{...stats,hp:Math.max(1,Number(vitals.maxHp??stats.hp)||1)},onlineMaxMp:Math.max(0,Number(vitals.maxMp??stats.mp)||0),equipment:{},equippedSkills:[],skillLoadoutInitialized:true}
}
function onlineExploreBossMonster(object,floor){
 const profile=object?.bossProfile??object?.bossProfiles?.[0]??null;if(!profile)return null;
 return{speciesId:profile.speciesId??"ancient_dragon",visualSpeciesId:profile.visualSpeciesId??profile.endgameBossId??null,endgameBossId:profile.endgameBossId??null,floorBossCatalogId:profile.floorBossCatalogId??null,campaignBossId:object?.bossId??profile.endgameBossId??profile.floorBossCatalogId??null,nickname:profile.name??"階層支配者",attribute:profile.element??profile.attribute??"neutral",level:Math.max(1,Number(profile.level)||floor),currentHp:Math.max(1,Number(profile.hp)||1),onlineStats:{hp:Math.max(1,Number(profile.hp)||1)}}
}
function onlineExploreWorld(room){
	 const expedition=room?.expedition,objects=expedition?.objects??[],multiplayer=(room?.members?.length??0)>=2&&expedition?.coop?.enabled===true,floor=Math.max(1,Number(expedition?.floor)||1),bossObjects=objects.filter(object=>object.type==="floorBoss"&&!object.hidden&&!object.resolved),bosses=bossObjects.map(object=>({...object,active:true,campaignBossId:object.bossId??object.bossProfile?.endgameBossId??object.bossProfile?.floorBossCatalogId??null,onlineBossMonster:onlineExploreBossMonster(object,floor)})),trophyChests=objects.filter(object=>object.type==="campaignTrophy"&&!object.hidden).map(object=>({...object,active:true,open:Boolean(object.resolved),claimed:Boolean(object.resolved),locksOpened:object.resolved?CAMPAIGN_KEYS_PER_FLOOR:Math.max(0,Number(object.locksOpened)||0)})),hotSpringObject=objects.find(object=>object.type==="hotSpring"&&!object.hidden),secretRoomObject=objects.find(object=>object.type==="secretRoom"&&!object.hidden&&!object.resolved),exitObject=objects.find(object=>object.type==="exit");
	 // A shrine is a recovery altar, not a mineable purple crystal. Keeping the
	 // two visuals distinct prevents crystal gathering from looking like a heal.
	 const decorations=[...(expedition?.decorations??[]).map(entry=>({...entry})),...objects.filter(object=>["bone","shrine"].includes(object.type)).map((object,index)=>({...object,id:`online-object-${object.id??index}`,type:object.type==="bone"?"bones":"water",used:Boolean(object.resolved),destroyed:Boolean(object.resolved),phase:index*31}))];
	return{cols:Math.max(1,Number(expedition?.cols)||1),rows:Math.max(1,Number(expedition?.rows)||1),shape:"onlineShared",treasureRoom:Boolean(expedition?.treasureRoom),treasureRealm:Boolean(multiplayer&&expedition?.coop?.rare?.realmActive),tiles:(expedition?.tiles??[]).map(row=>[...row].map(tile=>tile==="."?0:1)),start:{...(expedition?.start??{x:1,y:1})},exit:{...(expedition?.exit??{x:1,y:1}),active:exitObject?!exitObject.hidden:Boolean(expedition?.exitReached)},shop:secretRoomObject?{x:secretRoomObject.x,y:secretRoomObject.y,roomId:secretRoomObject.roomId??secretRoomObject.id,active:true,rotation:secretRoomObject.rotation??0}:null,bosses,boss:bosses[0]??null,onlineBossMonster:bosses[0]?.onlineBossMonster??null,trophyChests,trophyChest:trophyChests.find(chest=>!chest.open)??trophyChests[0]??null,chests:objects.filter(object=>!object.hidden&&object.type==="chest").map(object=>({...object,open:Boolean(object.resolved),locked:Boolean(object.locked),onlineType:object.type})),decorations,onlineObjects:objects.filter(object=>!object.hidden&&["campaignKey","resonanceChest","deluxeChest","coopSwitch","resonanceVault","coopElite","relaySeal","keyFragment","combinedKey","rareGoldenMonster","rareMerchant","rarePortal","rarePortalGuardian","rarePortalChest","rareReturnPortal"].includes(object.type)).map(object=>({...object})),hotSpring:hotSpringObject?{...hotSpringObject,active:true,used:Boolean(hotSpringObject.used||hotSpringObject.resolved)}:null,encountering:false}
}
function syncOnlineExploreMembers(room,selfId,{snap=false}={}){
 if(!game?.online)return;
 game.onlineRoom=room;game.onlineFloor=Math.max(1,Number(room?.expedition?.floor)||1);game.onlineMembers=(room?.members??[]).map(member=>({member,monster:onlineExploreMonster(member)}));
 const active=new Set();
 for(const entry of game.onlineMembers){const position=entry.member.dungeonPosition??room?.expedition?.start;if(!position)continue;active.add(entry.member.playerId);let entity=game.onlineEntities.get(entry.member.playerId);if(!entity){entity=new Entity(position.x,position.y);game.onlineEntities.set(entry.member.playerId,entity)}else reconcileOnlineMotion(entity,position,{snap});if(entry.member.playerId===selfId)game.player=entity}
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
 if(!game?.online||!game.running)return;game.performanceProfile??=currentExplorePerformanceProfile();const dt=Math.min(.05,(now-game.last)/1000||0);game.last=now;
 for(const entity of game.onlineEntities.values())entity.move(dt,onlineMotionSpeed(entity));
 game.camera.follow(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world);if(shouldPaintExploreFrame(game,now,game.performanceProfile?.frameInterval??1000/30))draw();requestAnimationFrame(onlineExploreLoop)
}
const onlineExploreCameraStates=new Map();
function mountOnlineExploreCanvas(room,selfId,onDestination,chatBubbles=[],pings=[],socialBubbles=[]){
 const canvas=document.querySelector("[data-online-dungeon-canvas]");if(!canvas||!room?.expedition)return;stopGame();const rect=canvas.getBoundingClientRect(),performanceProfile=currentExplorePerformanceProfile(),density=performanceProfile.pixelRatio;canvas.width=Math.max(1,Math.round(rect.width*density));canvas.height=Math.max(1,Math.round(rect.height*density));const mini=document.getElementById("miniMap");if(mini){mini.width=132*density;mini.height=132*density}
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
function limitBreakCandidates(m){const key=monsterIdentityKey(m);return save.state.monsters.filter(x=>x.id!==m.id&&monsterIdentityKey(x)===key&&!save.state.party.includes(x.id)&&!x.favorite&&!x.locked&&!isLionelAvatar(x))}
function performLimitBreak(id,options={}){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const materials=limitBreakCandidates(m);if(materials.length<2)return alert("限界突破には、控えにいる同名モンスターが2体必要です。\nお気に入り・ロック・出撃中の個体は素材にできません。");const growth=limitBreakGrowth(m.speciesId),before=m.plus??0,consumed=materials.slice(0,2),inheritedAffection=Math.min(1000,Math.max(m.affection??m.bond??0,...consumed.map(monster=>monster.affection??monster.bond??0)));if(!confirm(`${displayName(m)}を +${before+1}へ限界突破する？\n\n素材：同名モンスター2体\nなつき度：${m.affection??0} → ${inheritedAffection}\nLv1基礎補正：HP+${growth.hp} / ATK+${growth.atk} / DEF+${growth.def} / SPD+${growth.spd}`))return;const ids=new Set(consumed.map(x=>x.id));save.state.monsters=save.state.monsters.filter(x=>!ids.has(x.id));m.plus=before+1;m.affection=inheritedAffection;m.bond=inheritedAffection;save.save();document.querySelectorAll(".game-modal").forEach(x=>x.remove());app.insertAdjacentHTML("beforeend",Modal("✨ 限界突破 ✨",`<div class="limit-break-result"><span>${monsterVisual(m,SPECIES[m.speciesId]?.emoji??"👹",{className:"limit-break-monster-visual"})}</span><h2>${displayName(m)}</h2><div><b>+${before}</b><i>→</i><strong>+${m.plus}</strong></div><p>なつき度 ${m.affection}/1000<br>Lv.1基礎値：HP +${growth.hp} / ATK +${growth.atk} / DEF +${growth.def} / SPD +${growth.spd}</p></div>`,"育成画面へ"));topModalButton().onclick=()=>{closeTopModal();if(options.returnToDetail){selected=id;screen="detail";render()}else openPartyMonsterDetail(id)}}
function openPartyMonsterDetail(id){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const sp=SPECIES[m.speciesId],st=calculatedStats(m),growth=limitBreakGrowth(m.speciesId),aff=m.affection??0,h=m.history??{},materials=limitBreakCandidates(m).length,friend=aff>=1000?" ❤️ 親友":"";app.insertAdjacentHTML("beforeend",Modal(displayName(m),`<div class="codex-detail monster-growth-detail"><div class="modal-monster-hero">${monsterVisual(m,sp.emoji??"👹",{className:"modal-monster-visual"})}<p><b>${monsterVisibleRarity(m)} / ${elementLabel(sp.element)} / ${sp.role??"不明"}</b></p></div><div class="detail-stat-grid"><span>Lv.${m.level}</span><span>限界突破 +${m.plus??0}</span><span>なつき ${aff}/1000${friend}</span><span>HP ${st.hp}</span><span>ATK ${st.atk}</span><span>DEF ${st.def}</span><span>SPD ${st.spd}</span></div><section class="growth-panel"><b>＋限界突破</b><p>同名2体で＋1・上限なし。Lv1基礎値へ毎回 HP+${growth.hp} / ATK+${growth.atk} / DEF+${growth.def} / SPD+${growth.spd}</p><button id="limitBreakButton" ${materials<2?"disabled":""}>＋${(m.plus??0)+1}へ限界突破（素材 ${materials}/2）</button></section><section class="growth-panel"><b>❤️ なつき度ボーナス</b><p>${aff>=1000?"全段階解放・親友":`現在 ${aff}/1000　次のボーナスまで ${Math.ceil((aff+1)/100)*100-aff}`}</p></section><div class="party-detail-quick-actions"><button id="openGrowthFromPartyDetail">💪 育成画面へ</button><button id="openEquipmentFromPartyDetail">⚔️ 装備を変更</button></div><section class="growth-panel history-panel"><b>📖 このモンスターの歴史</b><p>初獲得：${formatObtainedDate(m.obtainedAt??m.capturedAt)} / ${m.obtainedFloor??1}階 / ${m.obtainedMethod==="summon"?"召喚":"捕獲"}<br>冒険 ${h.adventures??0}回 / 戦闘 ${h.battles??0}回 / 勝利 ${h.victories??0}回<br>撃破 ${h.kills??0}体 / ボス撃破 ${h.bossDefeats??0}体 / 最高到達 ${h.highestFloor??m.obtainedFloor??1}階</p></section><p class="muted">種族 ${sp.race??"不明"}<br>特性 ${TRAITS[m.traitId]?.name??"なし"}</p></div>`,"戻る"));const modal=topModal();modal.querySelector("#limitBreakButton")?.addEventListener("click",()=>performLimitBreak(id));modal.querySelector("#openGrowthFromPartyDetail")?.addEventListener("click",()=>{document.querySelectorAll(".game-modal").forEach(x=>x.remove());selected=id;screen="detail";render()});modal.querySelector("#openEquipmentFromPartyDetail")?.addEventListener("click",()=>{document.querySelectorAll(".game-modal").forEach(x=>x.remove());equipmentTarget=id;navigationOrigin="monsters";screen="equipment";render()});topModalButton().onclick=closeTopModal}
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
function summonRatePercent(rarity,mode="normal",digits=2){const rates=mode==="guaranteed"?GUARANTEED_SUMMON_RATES:NORMAL_SUMMON_RATES,rate=Number(rates[rarity])||0;return`${(rate*100).toFixed(digits)}%`}
function paidGachaPityStatus(){
 const pity=normalizeGachaPityState(save.state.gacha?.pity);
 return{pity,urRemaining:GACHA_PITY_LIMITS.urPlus-pity.urPlus,lrRemaining:GACHA_PITY_LIMITS.lrPlus-pity.lrPlus,mythicRemaining:GACHA_PITY_LIMITS.mythic-pity.mythic};
}
function paidGachaPityMarkup(){
 const status=paidGachaPityStatus();
 return`<div class="gacha-pity-status"><small>有料通常召喚の保証</small><span><b>UR以上</b>あと${status.urRemaining}回</span><span><b>LR以上</b>あと${status.lrRemaining}回</span><span><b>神話</b>あと${status.mythicRemaining}回</span></div>`;
}
function balancedGachaEntry(pool,poolKey,keyOf=entry=>entry?.id??entry?.name??entry){
 save.state.gacha??={};save.state.gacha.drawHistory=normalizeGachaDrawHistory(save.state.gacha.drawHistory);
 const selected=selectBalancedGachaEntry(pool,{recentKeys:save.state.gacha.drawHistory[poolKey]??[],keyOf});if(selected===null||selected===undefined)return null;
 save.state.gacha.drawHistory=recordGachaDraw(save.state.gacha.drawHistory,poolKey,keyOf(selected));return selected;
}
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
  {id:"standard",badge:"常設",title:"神話級との邂逅",copy:"魔物50%・装備50%／神話0.12%・10連最後はSR以上",tone:"violet",mode:"mixed"},
  {id:"beginner",badge:"初心者限定",title:"スタートダッシュ召喚",copy:"初回のみ10連無料・SR以上1体確定・神話/LRは合計最大1体",tone:"green",mode:"monster"},
  rotatingGachaCampaign(),
  {id:"permanent-signature",badge:"常設・天井なし",title:"専用装備契約",copy:"SSR以上の仲間の専用装備が総率0.1%。外れは通常装備。",tone:"red",mode:"signaturePermanent"},
  {id:"weekday",badge:`${weekday.dayName}曜限定・0:00まで`,title:weekday.title,copy:weekday.copy,tone:weekday.kind==="sunday"?"abyss":weekday.kind==="signature"?"red":"green",mode:"weekday",weekdayKind:weekday.kind},
  {id:"event-preview",badge:"COMING SOON",title:"イベント装備シリーズ",copy:"イベント開催時はここへ新しい召喚が追加されます",tone:"red",disabled:true,mode:"equipment"}
 ];
}
const SUMMON_RARITY_INFO=[
 {id:"N",name:"ノーマル",note:`通常時 ${summonRatePercent("N","normal",3)}`},
 {id:"R",name:"レア",note:`通常時 ${summonRatePercent("R","normal",3)}`},
 {id:"SR",name:"スーパーレア",note:`通常時 ${summonRatePercent("SR","normal",3)}・10連最後はSR以上`},
 {id:"SSR",name:"スペシャルスーパーレア",note:`通常時 ${summonRatePercent("SSR","normal",3)}`},
 {id:"UR",name:"ウルトラレア",note:`通常時 ${summonRatePercent("UR","normal",3)}`},
 {id:"LR",name:"レジェンドレア",note:`通常時 ${summonRatePercent("LR","normal",3)}`},
 {id:"神話",name:"神話級",note:`通常時 ${summonRatePercent("神話","normal",3)}`},
 {id:"深淵",name:"深淵級",note:"通常時 0%・毎週日曜にカテゴリ全体で0.100%"},
 {id:"十神",name:"十神",note:"全召喚から排出なし・欠片契約限定"}
];
function rarityCssClass(rarity){return({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity??"N").toLowerCase()}
function summonOne({mode="mixed",guaranteedMonster=false,guaranteedEquipment=false,guaranteedRare=false,forcedRarity=null,deep=false,equipmentSlot=null,monsterRate=.5}={}){
 const requestedSlot=equipmentSlot??(["weapon","armor","accessory"].includes(mode)?mode:null),mixedMonsterRate=Math.max(0,Math.min(1,Number(monsterRate)||0)),isMonster=guaranteedMonster||(!guaranteedEquipment&&!requestedSlot&&(mode==="monster"||Math.random()<mixedMonsterRate)),rarity=forcedRarity??(deep?"LR":rollSummonRarity(guaranteedRare?"guaranteed":"normal"));
 if(isMonster){
  const eligible=species=>species&&species.id!=="dev_familiar_chappy"&&species.rarity!=="十神"&&!species.isTenGod&&!species.tags?.includes?.("tenGod")&&!species.isAbyss&&!species.tags?.includes?.("abyss")&&!species.serialOnly&&!species.gachaExcluded;
  let pool=Object.values(SPECIES).filter(eligible);
  if(deep)pool=pool.filter(species=>(species.minFloor??0)>=70&&species.rarity!=="神話");
  else pool=pool.filter(species=>species.rarity===rarity);
  if(!pool.length)pool=Object.values(SPECIES).filter(species=>eligible(species)&&species.rarity===rarity);
  if(!pool.length)pool=[SPECIES.slime];
  const selected=balancedGachaEntry(pool,deep?"monster:deep":`monster:${rarity}`,species=>species.id),speciesId=selected?.id??"slime",isNew=!save.state.monsters.some(entry=>entry.speciesId===speciesId);
  const monster=createMonster(speciesId,{nickname:SPECIES[speciesId].name,obtainedMethod:deep?"deepSummon":"summon",obtainedFloor:save.state.player.maxFloor});
  monster.summonRarity=rarity;if(deep)monster.summonTier="深淵";
  save.state.monsters.push(monster);save.state.codex.captures[speciesId]=(save.state.codex.captures[speciesId]??0)+1;save.state.codex.encounters[speciesId]=(save.state.codex.encounters[speciesId]??0)+1;
  return{type:"monster",rarity,displayRarity:deep?"深淵":rarity,name:displayName(monster),icon:SPECIES[speciesId].emoji,speciesId,item:monster,isNew};
 }
 const slot=requestedSlot??balancedGachaEntry(["weapon","armor","accessory"],"equipment:slot",entry=>entry),base=balancedGachaEntry(EQUIPMENT_BASES[slot],`equipment:base:${slot}`,entry=>entry.name),item=createEquipment(slot,{rarity,base});
 if(deep){item.summonTier="深淵";item.name=`深淵・${item.name}`}
 const isNew=!(save.state.codex.equipment[item.name]??0);
 receiveEquipment(save.state,item);save.state.codex.equipment[item.name]=(save.state.codex.equipment[item.name]??0)+1;
 return{type:"equipment",rarity,displayRarity:deep?"深淵":rarity,name:item.name,icon:{weapon:"⚔️",armor:"🛡️",accessory:"💍"}[slot],item,isNew};
}
function summonEndgameGacha(faction){
 if(faction==="tenGod")return null;
 const pool=Object.values(ENDGAME_BOSSES).filter(boss=>boss.faction===faction),boss=balancedGachaEntry(pool,`endgame:${faction}`,entry=>entry.id);if(!boss)return null;const isNew=!save.state.monsters.some(monster=>monster.endgameBossId===boss.id),monster=createMonster(boss.speciesId,{nickname:boss.name,title:boss.title,rank:4,attribute:boss.element??SPECIES[boss.speciesId]?.element,obtainedFloor:save.state.player.maxFloor,obtainedMethod:"guerrillaGacha",endgameBossId:boss.id,endgameFaction:boss.faction,isContractedEndgame:true,allowEndgameLevel:true,tags:[SPECIES[boss.speciesId]?.race,boss.faction,boss.id,"contractedEndgame"].filter(Boolean)});
 monster.endgameBossId=boss.id;monster.endgameFaction=boss.faction;monster.visualSpeciesId=boss.id;monster.isContractedEndgame=true;monster.contractProfileVersion=3;monster.contractSignature=boss.signature;monster.contractSeriesId=boss.seriesId;monster.summonRarity=faction==="tenGod"?"十神":"深淵";monster.currentHp=calculatedStats(monster).hp;monster.currentMp=maxMp(monster);save.state.monsters.push(monster);save.state.codex.captures[monster.speciesId]=(save.state.codex.captures[monster.speciesId]??0)+1;save.state.codex.encounters[monster.speciesId]=(save.state.codex.encounters[monster.speciesId]??0)+1;
 return{type:"monster",rarity:monster.summonRarity,displayRarity:monster.summonRarity,name:boss.name,icon:boss.icon,speciesId:monster.speciesId,item:monster,isNew,endgameBossId:boss.id};
}
function summonExperiencePack(){
 const floor=Math.max(1,Number(save.state.player.maxFloor)||1),available=availableExperiencePackTypes(floor),weights=floor>=70?{small:30,medium:35,large:25,ultra:10}:floor>=50?{small:45,medium:40,large:15}:floor>=30?{small:70,medium:30}:{small:100};
 const weighted=available.map(type=>[type,weights[type.id]??0]),total=weighted.reduce((sum,[,weight])=>sum+weight,0);let cursor=Math.random()*Math.max(1,total),type=weighted[0]?.[0]??EXPERIENCE_PACK_TYPES.small;
 for(const[entry,weight]of weighted){cursor-=weight;if(cursor<0){type=entry;break}}
 save.state.inventory[type.inventoryKey]=(save.state.inventory[type.inventoryKey]??0)+1;
 const rarity={small:"R",medium:"SR",large:"SSR",ultra:"UR"}[type.id];
 return{type:"experience",rarity,displayRarity:rarity,name:type.name,amount:1,packTier:type.id,inventoryKey:type.inventoryKey,item:{slot:"experience",name:type.name},isNew:false};
}
function summonSignatureGear(){
 const owners=signatureEligibleOwners(save.state);if(!owners.length)return null;
 const owner=balancedGachaEntry(owners,"signature:weekday-owner",entry=>entry.ownerId),ownedPieces=new Set(save.state.equipment.filter(item=>signatureEquipmentOwnerId(item)===owner.ownerId).map(item=>Number(item.ruleOverrides?.signaturePieceIndex)).filter(Number.isInteger)),missing=[0,1,2,3,4,5].filter(index=>!ownedPieces.has(index)),piecePool=missing.length&&Math.random()<.82?missing:[0,1,2,3,4,5],pieceIndex=balancedGachaEntry(piecePool,`signature:weekday-piece:${owner.ownerId}`,entry=>entry);
 const item=createSignatureEquipment(owner.ownerId,pieceIndex);if(!item)return null;
 receiveEquipment(save.state,item);save.state.codex.equipment[item.name]=(save.state.codex.equipment[item.name]??0)+1;
 return{type:"equipment",rarity:equipmentDisplayRarity(item),displayRarity:equipmentDisplayRarity(item),name:item.name,icon:"⚔️",item,isNew:!ownedPieces.has(pieceIndex),signatureOwner:owner.ownerName};
}
function summonPermanentSignatureGear(){
 const owners=permanentSignatureOwners();if(!owners.length)return null;
 const owner=balancedGachaEntry(owners,"signature:permanent-owner",entry=>entry.ownerId),ownedPieces=new Set(save.state.equipment.filter(item=>signatureEquipmentOwnerId(item)===owner.ownerId).map(item=>Number(item.ruleOverrides?.signaturePieceIndex)).filter(Number.isInteger)),missing=[0,1,2,3,4,5].filter(index=>!ownedPieces.has(index)),piecePool=missing.length&&Math.random()<.72?missing:[0,1,2,3,4,5],pieceIndex=balancedGachaEntry(piecePool,`signature:permanent-piece:${owner.ownerId}`,entry=>entry),item=createSignatureEquipment(owner.ownerId,pieceIndex);if(!item)return null;
 receiveEquipment(save.state,item);save.state.codex.equipment[item.name]=(save.state.codex.equipment[item.name]??0)+1;
 return{type:"equipment",rarity:equipmentDisplayRarity(item),displayRarity:equipmentDisplayRarity(item),name:item.name,icon:"⚔️",item,isNew:!ownedPieces.has(pieceIndex),signatureOwner:owner.ownerName};
}
function openPermanentSignatureGacha(){
 const pool=permanentSignatureOwners(),counts=[1,10],rate=(PERMANENT_SIGNATURE_RATE*100).toFixed(1);if(!pool.length)return showToast("専用装備の対象がありません");
 const poolRows=pool.map(owner=>`<span><b>[${owner.rarity}]</b> ${owner.ownerName}</span>`).join("");
 app.insertAdjacentHTML("beforeend",Modal("常設・専用装備契約",`<div class="gacha-count-picker permanent-signature-picker"><div class="gacha-count-copy"><small>PERMANENT SIGNATURE EQUIPMENT</small><h3>専用装備契約</h3><p>1枠ごとの専用装備当選率はカテゴリ全体で <strong>${rate}%</strong>。外れは通常装備です。</p><p>当選キャラは均等抽選。未所持部位がある場合は、その部位を72%で優先します。</p><p><b>確定枠・天井・10連保証はありません。</b></p></div><div class="gacha-count-grid">${counts.map(count=>`<button type="button" data-permanent-signature-count="${count}"><b>${count}連</b><small>${pixelIcon("crystal")} ${gachaCost(count,"standard").toLocaleString()}</small></button>`).join("")}</div><details class="signature-pool-list"><summary>対象キャラ ${pool.length}体を確認</summary><div>${poolRows}</div></details><small>深淵・十神・シリアル限定の「えなみ／より／りおん／ひで」は排出対象外です。</small></div>`,"戻る"));
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
 const title=kind==="experience"?"経験値パック召喚":kind==="signature"?"専用装備召喚":"日曜・深淵召喚",counts=[1,10],rateCopy=kind==="abyss"?`<strong>当選率 ${(WEEKDAY_ENDGAME_RATE*100).toFixed(1)}%（深淵カテゴリ全体）</strong><small>外れた場合は通常モンスターが召喚されます。確定・天井はありません。</small>`:kind==="signature"?"<small>対象キャラは均等抽選。未所持部位がある場合は、その部位を82%で優先します。</small>":"";
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
function summonGuerrillaOne({guaranteedRare=false}={}){const rarity=rollSummonRarity(guaranteedRare?"guaranteed":"normal");return summonOne({mode:"monster",guaranteedMonster:true,forcedRarity:rarity})}
function summonGoldOne(){const roll=Math.random()*100,amount=roll<.02?99_999_999:roll<.5?10_000_000:roll<3?1_000_000:roll<8?100_000:roll<20?10_000:roll<45?1_000:100,rarity=amount===99_999_999?"神話":amount>=10_000_000?"LR":amount>=1_000_000?"UR":amount>=100_000?"SSR":amount>=10_000?"SR":amount>=1_000?"R":"N";save.state.player.gold=Math.min(Number.MAX_SAFE_INTEGER,(save.state.player.gold??0)+amount);return{type:"gold",rarity,displayRarity:rarity,name:`${amount.toLocaleString()}G`,amount,item:{slot:"gold",name:`${amount.toLocaleString()}G`},isNew:false}}
function rarityGuideHtml(){return`<div class="rarity-guide">${SUMMON_RARITY_INFO.map((r,i)=>{const key=rarityCssClass(r.id);return`<div class="rarity-guide-row rarity-guide-${key}"><span>${i+1}</span><b class="rarity-name-${key}">${r.id}</b><strong class="rarity-name-${key}">${r.name}</strong><small>${r.note}</small></div>`}).join("")}</div><p class="rarity-guide-note">下に行くほど上位です。深淵は毎週日曜にカテゴリ全体0.1%。十神召喚は廃止され、欠片契約のみで入手できます。</p>`}
function openRarityGuide(){app.insertAdjacentHTML("beforeend",Modal("レア度一覧",rarityGuideHtml(),"閉じる"));topModalButton().onclick=closeTopModal}
function normalSummonRateGuideHtml(){
 const rates=[
  ["神話",summonRatePercent("神話"),summonRatePercent("神話","guaranteed")],
  ["LR",summonRatePercent("LR"),summonRatePercent("LR","guaranteed")],
  ["UR",summonRatePercent("UR"),summonRatePercent("UR","guaranteed")],
  ["SSR",summonRatePercent("SSR"),summonRatePercent("SSR","guaranteed")],
  ["SR",summonRatePercent("SR"),summonRatePercent("SR","guaranteed")],
  ["R","32.00%","—"],
  ["N","49.90%","—"],
  ["深淵","通常0%／毎週日曜0.10%","外れは通常モンスター"],
  ["十神","全召喚 0%","欠片契約限定"]
 ];
 return`<div class="summon-rate-guide">${paidGachaPityMarkup()}<div class="summon-rate-head"><span>レア度</span><b>通常枠</b><b>限定・保証枠</b></div>${rates.map(([rarity,normal,guaranteed])=>{const key=rarityCssClass(rarity);return`<div class="summon-rate-row rarity-${key}"><strong class="rarity-name-${key}">${rarity}</strong><span>${normal}</span><span>${guaranteed}</span></div>`}).join("")}<div class="summon-rate-notes"><p><b>単発・10連の通常枠</b>は上記「通常枠」で抽選します。</p><p><b>有料通常召喚</b>はUR以上50回・LR以上150回・神話300回以内に必ず排出。該当レア以上を引くと、その保証カウントだけリセットされます。</p><p><b>モンスター召喚／装備召喚</b>は選択した種類が100%排出されます。有料の常設混合は魔物50%・装備50%、1日1回無料のみ魔物30%・装備70%です。</p><p><b>同レア度内</b>の魔物は全対象を一巡するまで重複を抑える均等抽選。装備は3部位を各1/3で選び、その部位内も同じ方式です。抽選袋をまたいでも同じ結果は3回連続しません。</p><p><b>曜日限定</b>は月・水・金が経験値、火・木・土が専用装備、深淵は毎週日曜です。十神は全召喚から排出されず、欠片契約限定です。</p></div></div>`;
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
  ${mode==="gold"?"":paidGachaPityMarkup()}
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
 const pityEligible=cost>0&&!['gold','guerrilla'].includes(mode);let beginnerTopTierSeen=false;
 const results=Array.from({length:count},(_,index)=>{
  const guarantee=(index+1)%10===0;
  if(mode==="guerrilla")return summonGuerrillaOne({guaranteedRare:guarantee});
  if(mode==="gold")return summonGoldOne();
  let pityRarity=null;
  if(campaign==="beginner"){
   pityRarity=rollSummonRarity(guarantee?"guaranteed":"normal");
   if(["神話","LR"].includes(pityRarity)){if(beginnerTopTierSeen)pityRarity="UR";else beginnerTopTierSeen=true}
  }else if(pityEligible){const pityRoll=rollSummonRarityWithPity(guarantee?"guaranteed":"normal",save.state.gacha.pity);save.state.gacha.pity=pityRoll.pity;pityRarity=pityRoll.rarity}
  const effectiveMode=mode==="mixed"
   ?save.state.monsters.length>=MONSTER_STORAGE_CAP?"equipment":save.state.equipment.length>=500?"monster":"mixed"
   :mode;
  const forcedSlot=["weapon","armor","accessory"].includes(effectiveMode)?effectiveMode:null;
  return summonOne({mode:effectiveMode,guaranteedMonster:effectiveMode==="monster",guaranteedEquipment:effectiveMode==="equipment"||Boolean(forcedSlot),equipmentSlot:forcedSlot,guaranteedRare:guarantee,forcedRarity:pityRarity,monsterRate:campaign==="daily"?.3:.5});
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
function openDeepGacha(){if(!hasCleared1000(save.state))return alert("深淵召喚は70階・七深淵制覇後に解放されます");const single=premiumCrystalCost(25),ten=premiumCrystalCost(225),body=`<div class="gacha-head deep"><b>深淵の力を召喚する</b><div class="gacha-head-actions"><span>${pixelIcon("crystal")} ${save.state.player.crystals}</span><button type="button" id="openRarityGuide" class="rarity-help">？</button></div></div><div class="gacha-menu deep-gacha-menu"><button data-deep-gacha="monster-single"><b>${pixelIcon("summon")} 深淵モンスター召喚　${pixelIcon("crystal")} ${single}</b><small>深層モンスターの深淵個体を召喚</small></button><button data-deep-gacha="monster-ten"><b>${pixelIcon("summon")} 深淵モンスター10連　${pixelIcon("crystal")} ${ten}</b><small>10体すべて深淵個体</small></button><button data-deep-gacha="equipment-single"><b>${pixelIcon("equipment")} 深淵装備召喚　${pixelIcon("crystal")} ${single}</b><small>深淵の名を冠するLR装備</small></button><button data-deep-gacha="equipment-ten"><b>${pixelIcon("equipment")} 深淵装備10連　${pixelIcon("crystal")} ${ten}</b><small>10個すべて深淵装備</small></button></div><p class="gacha-footnote">十神は深淵召喚からも排出されません。</p>`;app.insertAdjacentHTML("beforeend",Modal("深淵召喚",body,"閉じる"));document.querySelectorAll("[data-deep-gacha]").forEach(b=>b.onclick=()=>performDeepGacha(b.dataset.deepGacha));document.getElementById("openRarityGuide")?.addEventListener("click",openRarityGuide);topModalButton().onclick=closeTopModal}
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
function openAchievementLedger(){
 const synced=syncAchievementRewardInbox(save.state);if(synced.added)save.save();const summary=achievementSummary(save.state),groups=["all",...Object.keys(summary.groups)],pending=pendingNoticeRewards(save.state).filter(entry=>entry.source==="achievement").length;
 const rows=summary.statuses.map(entry=>{const value=`${Math.min(entry.current,entry.target).toLocaleString()} / ${entry.target.toLocaleString()}`,status=entry.claimed?"受取済":entry.queued?"お知らせに配布済み":entry.complete&&!entry.rewardReady?`${entry.rewardUnlockFloor}階で報酬解放`:entry.complete?"配布準備中":value;return`<article class="achievement-card ${entry.complete?"complete":"locked"}" data-achievement-group="${escapeAttribute(entry.group)}"><span class="achievement-icon">${pixelIcon(entry.iconKey??achievementIconKeyForId(entry))}</span><div class="achievement-copy"><small>${escapeAttribute(entry.group)}</small><b>${escapeAttribute(entry.title)}</b><p>${escapeAttribute(entry.description)}</p><i style="--achievement-progress:${Math.round(entry.progress*100)}%"></i><em>${escapeAttribute(rewardDescription(entry.reward))}</em></div><strong>${status}</strong></article>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal("実績",`<section class="achievement-summary"><div><small>ACHIEVEMENT RECORD</small><strong>${summary.unlocked}<em> / ${summary.total}</em></strong><span>${summary.complete?"ALL COMPLETE":"達成時に報酬を安全配布"}</span></div><i style="--achievement-progress:${Math.round(summary.unlocked/Math.max(1,summary.total)*100)}%"></i></section><div class="achievement-filters">${groups.map((group,index)=>`<button type="button" data-achievement-filter="${escapeAttribute(group)}" class="${index?"":"active"}">${group==="all"?"すべて":escapeAttribute(group)}</button>`).join("")}</div>${pending?`<button type="button" class="achievement-open-rewards" data-achievement-open-rewards>未受取の実績報酬 ${pending}件</button>`:""}<div class="achievement-list">${rows}</div>`,"閉じる"));
 const modal=topModal();modal.classList.add("achievement-modal");modal.querySelectorAll("[data-achievement-filter]").forEach(button=>button.onclick=()=>{const group=button.dataset.achievementFilter;modal.querySelectorAll("[data-achievement-filter]").forEach(item=>item.classList.toggle("active",item===button));modal.querySelectorAll("[data-achievement-group]").forEach(card=>card.hidden=group!=="all"&&card.dataset.achievementGroup!==group)});modal.querySelector("[data-achievement-open-rewards]")?.addEventListener("click",()=>{modal.remove();openNoticeCenter()});modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove()
}
function openCodexHub(){
 const achievements=achievementSummary(save.state);app.insertAdjacentHTML("beforeend",Modal("魔物記録",`<div class="codex-hub"><button data-open-complete-codex><span>${pixelIcon("event")}</span><b>全魔物図鑑</b><small>通常・階層ボス・深淵・十神・限定魔物の収集記録</small></button><button data-open-achievements><span>${pixelIcon("notice")}</span><b>実績</b><small>探索・戦闘・捕獲・ボス・オンライン・育成　${achievements.unlocked}/${achievements.total}</small></button><button data-open-monster-index><span>${pixelIcon("skills")}</span><b>魔物一覧へ</b><small>所持数・合成・逃すをまとめて管理</small></button><p class="muted">一度獲得した本体は手放しても図鑑に残り、図鑑・実績の達成報酬はお知らせへ届きます。</p></div>`,"閉じる"));const modal=topModal();modal.querySelector("[data-open-complete-codex]").onclick=()=>{modal.remove();openCodex("monster")};modal.querySelector("[data-open-achievements]").onclick=()=>{modal.remove();openAchievementLedger()};modal.querySelector("[data-open-monster-index]").onclick=()=>{modal.remove();go("monsters")};modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove()
}
function codexVisibleRarity(rarity){return rarity}
function openMonsterCodexDetail(speciesId,seen,index){
 const sp=SPECIES[speciesId];if(!sp)return;
 if(!seen){app.insertAdjacentHTML("beforeend",Modal(`No.${String(index+1).padStart(3,"0")} 未遭遇`,`<div class="codex-detail unknown-detail"><div class="codex-detail-icon">❔</div><p>このモンスターの情報はまだ記録されていません。</p></div>`,"図鑑へ戻る"));topModalButton().onclick=closeTopModal;return}
 const owned=save.state.monsters.filter(monster=>monster.speciesId===speciesId),captured=save.state.codex.captures[speciesId]??owned.length,base=sp.baseStats??{},fieldEncounter=sp.fieldEncounter!==false;
 const sources=Array.isArray(sp.acquisition)&&sp.acquisition.length?sp.acquisition:(fieldEncounter?["探索","召喚","闇市場"]:["召喚","闇市場"]);
 const ownedHistory=owned.length?owned.map(monster=>{const history=monster.history??{};return`<details class="codex-owned-history"><summary><span>${monsterVisual(monster,sp.emoji,{className:"codex-owned-monster-visual"})}</span><b>${displayName(monster)} Lv.${monster.level}</b><small>冒険 ${history.adventures??0}回・勝利 ${history.victories??0}回</small></summary><div><p><b>初獲得</b>${formatObtainedDate(monster.obtainedAt??monster.capturedAt)}・${sourceLabelForCodex(monster.obtainedMethod)}・${monster.obtainedFloor??1}階</p><p><b>戦闘 / 勝利</b>${history.battles??0} / ${history.victories??0}</p><p><b>撃破 / ボス</b>${history.kills??0} / ${history.bossDefeats??0}</p><p><b>最高到達</b>${history.highestFloor??monster.obtainedFloor??1}階</p><p><b>MVP / 最大ダメージ</b>${history.mvp??0} / ${history.maxDamage??0}</p><p><b>最終出撃</b>${formatObtainedDate(history.lastDeployedAt)}</p></div></details>`}).join(""):'<p class="muted">現在所持している個体はいません。</p>';
 app.insertAdjacentHTML("beforeend",Modal(`No.${String(index+1).padStart(3,"0")} ${sp.name}`,`<div class="codex-detail"><div class="codex-detail-head"><span>${monsterVisual(speciesId,sp.emoji,{className:"codex-detail-monster-visual"})}</span><div><b>${codexVisibleRarity(sp.rarity)} / ${elementLabel(sp.element)}</b><small>${sp.race??"不明"} / ${sp.role??"不明"} / ${sp.growthLabel??"標準"}成長</small></div></div><div class="detail-stat-grid"><span>HP ${base.hp??"-"}</span><span>ATK ${base.atk??"-"}</span><span>DEF ${base.def??"-"}</span><span>SPD ${base.spd??"-"}</span></div><div class="codex-info-list"><p><b>遭遇</b>${save.state.codex.encounters[speciesId]??0}回</p><p><b>捕獲</b>${captured}回</p><p><b>出現階層</b>${fieldEncounter?`${sp.minFloor??"?"}階以降・近い階層帯ほど出現しやすい`:"通常探索には出現しない"}</p><p><b>入手方法</b>${sources.join("・")}</p><p><b>捕獲率</b>${fieldEncounter?`${Math.round((sp.captureRate??0)*100)}%`:"販売・召喚限定"}</p><p><b>主なスキル</b>${(sp.skills??[]).map(skill=>skill.name).join("、")||"不明"}</p></div><h3>📖 所持個体の冒険記録</h3><div class="codex-owned-history-list">${ownedHistory}</div></div>`,"図鑑へ戻る"));
 topModalButton().onclick=closeTopModal;
}
function sourceLabelForCodex(method){return({capture:"探索・捕獲",summon:"召喚",market:"闇市場",darkMarket:"闇市場",endgameContract:"契約",deepSummon:"深淵召喚",guerrillaGacha:"曜日限定召喚",onlineWeeklyRaidExchange:"週間レイド・核片交換",achievementReward:"実績報酬"}[method]??method??"不明")}
function completeCodexOwnedMonsters(entry){
 return(save.state.monsters??[]).filter(monster=>entry.kind==="floorBoss"?monster.floorBossCatalogId===entry.floorBossCatalogId:["abyss","tenGod"].includes(entry.kind)?monster.endgameBossId===entry.endgameBossId:monster.speciesId===entry.speciesId)
}
function openCompleteCodexDetail(entry,index,owned){
 if(!owned){app.insertAdjacentHTML("beforeend",Modal(`No.${String(index+1).padStart(3,"0")} 未契約`,`<div class="codex-detail unknown-detail"><div class="codex-detail-icon">❔</div><p>本体を獲得すると、名前・姿・入手方法が開示されます。</p></div>`,"図鑑へ戻る"));topModalButton().onclick=closeTopModal;return}
 if(["ordinary","limited"].includes(entry.kind))return openMonsterCodexDetail(entry.speciesId,true,index);
 const monsters=completeCodexOwnedMonsters(entry),species=SPECIES[entry.speciesId]??{},base=species.baseStats??{},visual={speciesId:entry.speciesId,visualSpeciesId:entry.visualId,endgameBossId:entry.endgameBossId??null,floorBossCatalogId:entry.floorBossCatalogId??null};
 const history=monsters.map(monster=>{const record=monster.history??{};return`<details class="codex-owned-history"><summary><span>${monsterVisual(monster,entry.emoji,{className:"codex-owned-monster-visual"})}</span><b>${escapeAttribute(displayName(monster))} Lv.${Math.max(1,Number(monster.level)||1).toLocaleString()}</b><small>冒険 ${record.adventures??0}回・勝利 ${record.victories??0}回</small></summary><div><p><b>初獲得</b>${formatObtainedDate(monster.obtainedAt??monster.capturedAt)}・${sourceLabelForCodex(monster.obtainedMethod)}・${monster.obtainedFloor??1}階</p><p><b>戦闘 / 勝利</b>${record.battles??0} / ${record.victories??0}</p><p><b>撃破 / ボス</b>${record.kills??0} / ${record.bossDefeats??0}</p><p><b>最高到達</b>${record.highestFloor??monster.obtainedFloor??1}階</p></div></details>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal(`No.${String(index+1).padStart(3,"0")} ${escapeAttribute(entry.name)}`,`<div class="codex-detail complete-codex-detail"><div class="codex-detail-head"><span>${monsterVisual(visual,entry.emoji,{className:"codex-detail-monster-visual"})}</span><div><small>${escapeAttribute(entry.group)}</small><b>${codexVisibleRarity(entry.rarity)} / ${elementLabel(entry.element)}</b><small>${escapeAttribute(entry.title??species.race??"特殊個体")}</small></div></div><div class="detail-stat-grid"><span>HP ${base.hp??"-"}</span><span>ATK ${base.atk??"-"}</span><span>DEF ${base.def??"-"}</span><span>SPD ${base.spd??"-"}</span></div><div class="codex-info-list"><p><b>区分</b>${escapeAttribute(entry.group)}</p>${entry.floor?`<p><b>支配階層</b>${entry.floor}階</p>`:""}<p><b>入手方法</b>${escapeAttribute(entry.source)}</p><p><b>所持数</b>${monsters.length}体</p></div><h3>📖 所持個体の冒険記録</h3><div class="codex-owned-history-list">${history}</div></div>`,"図鑑へ戻る"));topModalButton().onclick=closeTopModal
}
function openCompleteMonsterCodex(){
 const summary=codexCollectionSummary(save.state),groups=["all","通常魔物","限定魔物","階層ボス","深淵","十神"],groupLabel={all:"すべて"},rows=COMPLETE_MONSTER_CODEX.map((entry,index)=>{const owned=summary.ownedKeys.has(entry.key),count=owned?completeCodexOwnedMonsters(entry).length:0,visual={speciesId:entry.speciesId,visualSpeciesId:entry.visualId,endgameBossId:entry.endgameBossId??null,floorBossCatalogId:entry.floorBossCatalogId??null};return`<button type="button" class="codex-row complete-codex-row ${owned?"owned":"unknown"}" data-complete-codex="${escapeAttribute(entry.key)}" data-codex-group="${escapeAttribute(entry.group)}" data-codex-search="${owned?escapeAttribute(`${entry.name} ${entry.group} ${entry.rarity} ${index+1}`.toLowerCase()):""}"><span>${owned?monsterVisual(visual,entry.emoji,{className:"codex-row-monster-visual"}):"❔"}</span><b>No.${String(index+1).padStart(3,"0")} ${owned?escapeAttribute(entry.name):"？？？？？"}</b><small>${owned?`${entry.group} / ${entry.rarity} / 所持 ${count}`:"未契約・情報非公開"}</small></button>`}).join("");
 const groupSummary=groups.slice(1).map(group=>{const value=summary.byGroup[group]??{owned:0,total:0};return`<span><b>${group}</b>${value.owned}/${value.total}</span>`}).join("");
 app.insertAdjacentHTML("beforeend",Modal("全魔物図鑑",`<section class="complete-codex-summary"><div><small>COMPLETE MONSTER ARCHIVE</small><strong>${summary.owned}<em> / ${summary.total}</em></strong><span>${summary.complete?"COMPLETE":"10種ごとに達成報酬"}</span></div><i style="--codex-progress:${Math.min(100,summary.owned/Math.max(1,summary.total)*100)}%"></i><div class="complete-codex-groups">${groupSummary}</div></section><div class="complete-codex-tools"><input type="search" data-complete-codex-search placeholder="名前・区分・レア度で検索"><div>${groups.map((group,index)=>`<button type="button" data-complete-codex-filter="${group}" class="${index?"":"active"}">${groupLabel[group]??group}</button>`).join("")}</div></div><div class="codex-list complete-codex-list">${rows}<p class="complete-codex-empty" hidden>該当する記録はありません。</p></div>`,"閉じる"));
 const modal=topModal(),input=modal.querySelector("[data-complete-codex-search]");let selectedGroup="all";const filter=()=>{const query=String(input?.value??"").trim().toLowerCase();let visible=0;modal.querySelectorAll("[data-complete-codex]").forEach(row=>{const show=(selectedGroup==="all"||row.dataset.codexGroup===selectedGroup)&&(!query||row.dataset.codexSearch.includes(query));row.hidden=!show;if(show){row.style.removeProperty("display");visible++}else row.style.setProperty("display","none","important")});const empty=modal.querySelector(".complete-codex-empty");empty.hidden=visible>0;if(visible>0)empty.style.setProperty("display","none","important");else empty.style.removeProperty("display")};
 input?.addEventListener("input",filter);modal.querySelectorAll("[data-complete-codex-filter]").forEach(button=>button.onclick=()=>{selectedGroup=button.dataset.completeCodexFilter;modal.querySelectorAll("[data-complete-codex-filter]").forEach(item=>item.classList.toggle("active",item===button));filter()});modal.querySelectorAll("[data-complete-codex]").forEach(button=>button.onclick=()=>{const index=COMPLETE_MONSTER_CODEX.findIndex(entry=>entry.key===button.dataset.completeCodex),entry=COMPLETE_MONSTER_CODEX[index];if(entry)openCompleteCodexDetail(entry,index,summary.ownedKeys.has(entry.key))});modal.querySelector("[data-modal-primary]").onclick=closeTopModal
}
function openEquipmentCodexDetail(name){const all=[...save.state.equipment,...save.state.reserveEquipment,...save.state.bossEquipmentVault],items=all.filter(i=>i.name===name);if(!items.length)return;const best=[...items].sort((a,b)=>(RARITY_ORDER[equipmentDisplayRarity(b)]??0)-(RARITY_ORDER[equipmentDisplayRarity(a)]??0)||(b.plus??0)-(a.plus??0))[0],displayRarity=equipmentDisplayRarity(best),stats=Object.entries(best.stats??{}).map(([k,v])=>`<span>${equipmentStatLabel(k)} +${v}</span>`).join("");app.insertAdjacentHTML("beforeend",Modal(name,`<div class="codex-detail"><div class="equipment-codex-hero">${equipmentVisual(best,{className:"equipment-codex-art"})}<p><b>[${codexVisibleRarity(displayRarity)}] ${slotLabel(best.slot)}</b></p></div><div class="detail-stat-grid">${stats||"<span>能力補正なし</span>"}</div><div class="codex-info-list"><p><b>所持数</b>${items.length}</p><p><b>最高強化</b>+${Math.max(...items.map(i=>i.plus??0))}</p><p><b>シリーズ</b>${best.series??"なし"}</p><p><b>装備規則</b>${best.slot==="weapon"?"右手・左手どちらでも装備可能":"通常"}</p></div></div>`,"図鑑へ戻る"));topModalButton().onclick=closeTopModal}
function openCodex(type){if(type==="monster")return openCompleteMonsterCodex();const all=[...save.state.equipment,...save.state.reserveEquipment,...save.state.bossEquipmentVault],names=[...new Set(all.map(i=>i.name))],rows=names.length?names.map(name=>{const items=all.filter(i=>i.name===name),best=[...items].sort((a,b)=>(RARITY_ORDER[equipmentDisplayRarity(b)]??0)-(RARITY_ORDER[equipmentDisplayRarity(a)]??0))[0],displayRarity=equipmentDisplayRarity(best);return`<button class="codex-row" data-codex-equipment="${name.replaceAll('"','&quot;')}"><span>${equipmentVisual(best,{className:"equipment-codex-row-art"})}</span><b>[${codexVisibleRarity(displayRarity)}] ${name}</b><small>${slotLabel(best.slot)} / 所持 ${items.length}</small></button>`}).join(""):'<div class="empty">まだ装備を発見していません</div>';app.insertAdjacentHTML("beforeend",Modal("装備図鑑",`<div class="codex-summary">発見 ${names.length}種</div><div class="codex-list">${rows}</div>`,"閉じる"));const modal=topModal();modal.querySelectorAll("[data-codex-equipment]").forEach(b=>b.onclick=()=>openEquipmentCodexDetail(b.dataset.codexEquipment));topModalButton().onclick=closeTopModal}
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
function releaseMonster(m){if(isLionelAvatar(m))return alert(lionelAvatarProtectionReason(m));if(save.state.party.includes(m.id))return alert("出撃中のモンスターは解放できません");if(m.favorite||m.locked)return alert("お気に入り・ロック中は解放できません");if(save.state.monsters.length<=1)return alert("最後の1体は解放できません");if(!confirm(`${displayName(m)}を解放する？\n魂として魔晶石1個を獲得します。`))return;Object.values(m.equipment??{}).forEach(id=>{const i=save.state.equipment.find(x=>x.id===id);if(i)i.equippedBy=null});save.state.monsters=save.state.monsters.filter(x=>x.id!==m.id);save.state.player.crystals++;save.save();go("monsters")}
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
function campaignSectionEnvironment(floor,attribute=game?.world?.currentAttribute){
 const profile=campaignRoomProfile(attribute),theme=dungeonThemeForAttribute(profile.id,floor),primary=profile.combatAttribute,adverse=[...new Set(ATTRIBUTE_RELATIONS[primary]?.weak??[])];
 return{id:`campaign-section-${profile.id}`,name:`${profile.name}属性区画`,theme:profile.battleTheme,accent:theme.accent,primary,favorable:[primary],adverse,boost:1.22,penalty:.84,matchupOnly:true,roomProfile:profile}
}
function biomeElementMultiplier(environment,element){
 if(!environment||environment.matchupOnly)return 1;const key=normalizedElement(element);
 if(environment.favorable.includes(key))return environment.boost;
 if(environment.adverse.includes(key))return environment.penalty;
 return 1;
}
function applyEnemyMultiplier(enemy,multiplier){
 if(!enemy||multiplier===1)return enemy;
 const carriedHp=Number.isFinite(Number(enemy.campaignCarryHp))?Math.max(1,Math.floor(Number(enemy.campaignCarryHp))):null;
 for(const key of["maxHp","atk","matk","def","mdef"])enemy[key]=Math.max(1,Math.round((enemy[key]??1)*multiplier));
 enemy.spd=Math.max(1,Math.round((enemy.spd??1)*(multiplier>1?1+(multiplier-1)*.55:1-(1-multiplier)*.45)));
 enemy.hp=carriedHp==null?enemy.maxHp:Math.min(enemy.maxHp,carriedHp);return enemy;
}
async function runSecretRoomAuto(){
 if(onlineSecretRoomContext||secretRoomAutoRunning||!exploreAutoActive()||screen!=="shop")return;
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
   // AUTO探索は賭博を行わない。深淵スロットはプレイヤーの明示操作だけで決済する。
  }
  save.save();
  if(notes.length)showToast(`AUTO｜${notes.join(" / ")}`);else showToast("AUTO｜無料休憩後、探索を続行");
  await wait(520);
 }finally{
  secretRoomAutoRunning=false;
  if(!onlineSecretRoomContext&&save.state.player.inRun&&screen==="shop"){screen="explore";render()}
 }
}
function leaveSecretRoom(){
 if(!onlineSecretRoomContext)return go("explore");
 onlinePartyController?.syncExpeditionProfile();onlineSecretRoomContext=null;screen="onlineParty";render()
}
function bindShop(){
 document.getElementById("leaveShop")?.addEventListener("click",leaveSecretRoom);
 document.querySelectorAll("[data-shop-menu]").forEach(b=>b.onclick=()=>openShopMenu(b.dataset.shopMenu));
 if(!onlineSecretRoomContext&&exploreAutoActive())requestAnimationFrame(runSecretRoomAuto);
}
function openShopMenu(type){
 if(type==="casino")return openSecretRoomCasino();
 if(type==="inn")return openSecretRoomInn();
 if(type==="market")return openDarkMarket();
}
let casinoSpinBusy=false,casinoFastMode=false,casinoSpinEpoch=0;
function casinoRateText(rate){const percent=rate*100;return`${percent>=1?Number(percent.toFixed(3)):percent>=.01?Number(percent.toFixed(3)):percent.toFixed(3)}%`}
function casinoModalBody(selectedBet=null){
 const room=activeSecretRoom(save.state),casino=room?.casino??{},entryPaid=Boolean(casino.entryPaid),last=casino.lastResult,digits=last?.digits??["❔","❔","❔"],limit=casinoBetLimit(save.state),canEnter=entryPaid||save.state.player.crystals>=CASINO_CRYSTAL_COST,canPlay=save.state.player.gold>0&&limit>0&&canEnter;
 const preferred=selectedBet??casino.lastBet??Math.min(100,limit),betValue=Math.max(0,Math.min(limit,Number(preferred)||Math.min(100,limit)));
 const rateRows=CASINO_MULTIPLIER_RATES.map(bucket=>`<span><b>${bucket.label}</b><small>${casinoRateText(bucket.rate)}</small></span>`).join("");
 const lastResult=last?`<strong>${String(last.multiplier).padStart(3,"0")}・${last.multiplier}倍</strong><small>${last.payout.toLocaleString()}G獲得 / 収支 ${last.net>=0?"+":""}${last.net.toLocaleString()}G${last.crystalCost?` / 入場料 💎${last.crystalCost}`:""}</small>`:`<small>所持 ${save.state.player.gold.toLocaleString()}G・💎${save.state.player.crystals.toLocaleString()}</small>`;
 const history=(casino.history??[]).slice(-20).reverse(),historyRows=history.length?history.map((result,index)=>`<div class="casino-history-row ${result.multiplier>1?"win":result.multiplier===1?"draw":"lose"}"><b>#${Math.max(1,(casino.spins??history.length)-index)}・${result.multiplier}倍</b><strong>${result.net>=0?"+":""}${result.net.toLocaleString()}G</strong><small>BET ${result.bet.toLocaleString()}G</small></div>`).join(""):`<div class="casino-history-empty">まだ結果はありません</div>`;
 const heat=Math.min(100,Math.max(0,((casino.spins??0)%20)*5));
 return`<div class="casino-panel" aria-live="polite">
  <div class="casino-entry"><span>入場料 <b>${entryPaid?"支払済み":`💎${CASINO_CRYSTAL_COST}`}</b></span><span>挑戦回数 <b>何度でも</b></span><span>BET上限 <b>${limit.toLocaleString()}G</b></span></div>
  <div class="casino-session-stats"><span>SPIN<b>${(casino.spins??0).toLocaleString()}</b></span><span>WIN<b>${(casino.wins??0).toLocaleString()}</b></span><span>SESSION<b>${casino.netGold>=0?"+":""}${(casino.netGold??0).toLocaleString()}G</b></span><span>BEST<b>${casino.bestMultiplier??0}倍</b></span></div>
  <div class="casino-jackpot-meter" title="セッションヒート（当選率は変化しません）"><i style="--casino-meter:${heat}%"></i></div>
  <div class="casino-rate-table">${rateRows}</div>
  <div class="casino-reels ${last?"finished":""}" id="casinoReels">${digits.map(digit=>`<i>${digit}</i>`).join("")}</div>
  <label class="casino-bet"><small>BET（この階の上限 ${limit.toLocaleString()}G）</small><input id="casinoBet" type="number" inputmode="numeric" min="1" max="${limit}" value="${betValue}" ${canPlay?"":"disabled"}><b>G</b></label>
  <div class="casino-presets"><button data-casino-bet="100" ${canPlay?"":"disabled"}>100G</button><button data-casino-bet="1000" ${canPlay?"":"disabled"}>1,000G</button><button data-casino-bet="10000" ${canPlay?"":"disabled"}>10,000G</button><button data-casino-bet="10pct" ${canPlay?"":"disabled"}>10%</button><button data-casino-bet="max" ${canPlay?"":"disabled"}>MAX</button></div>
  <button id="casinoSpeed" type="button">演出：${casinoFastMode?"高速":"通常"}</button>
  <button id="spinCasino" class="primary casino-spin" ${canPlay?"":"disabled"}>${entryPaid?"もう一度回す":`💎${CASINO_CRYSTAL_COST}で入場して回す`}</button>
  <div id="casinoResult" class="casino-result ${last?(last.multiplier>1?"win":last.multiplier===1?"draw":"lose"):""}">${lastResult}</div>
  <p class="casino-repeat-note">初回だけ入場料。以後はこの裏街にいる間、GOLDで繰り返し遊べます。抽選は毎回独立です。</p>
  <section class="casino-history"><h4>RECENT SPINS</h4><div class="casino-history-list">${historyRows}</div></section>
 </div>`;
}
function refreshSecretRoomCasinoModal(modal,selectedBet,scrollTop=0){
 const body=modal.querySelector(".game-modal-body");if(!body)return;
 body.innerHTML=casinoModalBody(selectedBet);bindSecretRoomCasinoModal(modal);
 requestAnimationFrame(()=>{const card=modal.querySelector(".game-modal-card");if(card)card.scrollTop=scrollTop});
}
function bindSecretRoomCasinoModal(modal){
 const input=modal.querySelector("#casinoBet"),spin=modal.querySelector("#spinCasino"),speed=modal.querySelector("#casinoSpeed"),limit=casinoBetLimit(save.state);
 modal.querySelectorAll("[data-casino-bet]").forEach(button=>button.onclick=()=>{
  const key=button.dataset.casinoBet,value=key==="max"?limit:key==="10pct"?Math.max(1,Math.floor(limit*.1)):Number(key);
  input.value=Math.max(1,Math.min(limit,value||1));
 });
 speed?.addEventListener("click",()=>{casinoFastMode=!casinoFastMode;const card=modal.querySelector(".game-modal-card"),scrollTop=card?.scrollTop??0;refreshSecretRoomCasinoModal(modal,Number(input?.value),scrollTop)});
 spin?.addEventListener("click",async()=>{
  if(casinoSpinBusy)return;
  casinoSpinBusy=true;const spinEpoch=++casinoSpinEpoch;
  const room=activeSecretRoom(save.state),pageScroll=window.scrollY,card=modal.querySelector(".game-modal-card"),cardScroll=card?.scrollTop??0,bet=Math.floor(Number(input.value)||0),checkpoint={gold:save.state.player.gold,crystals:save.state.player.crystals,casino:JSON.parse(JSON.stringify(room.casino))};
  const holdScroll=()=>requestAnimationFrame(()=>{window.scrollTo(0,pageScroll);if(card)card.scrollTop=cardScroll});
  modal.setAttribute("aria-busy","true");modal.querySelector(".casino-panel")?.classList.add("busy");modal.querySelectorAll("button,input").forEach(control=>{if(!control.matches("[data-modal-primary],[data-modal-dismiss]"))control.disabled=true});
  const spinId=`casino-ui-${Date.now().toString(36)}-${Math.floor(Math.random()*0x7fffffff).toString(36)}`,result=spinSecretRoomCasino(save.state,bet,{spinId,random:Math.random});
  if(!result.ok){if(spinEpoch===casinoSpinEpoch)casinoSpinBusy=false;modal.removeAttribute("aria-busy");if(modal.isConnected)refreshSecretRoomCasinoModal(modal,bet,cardScroll);showToast(result.message);return}
  if(!save.save()){
   save.state.player.gold=checkpoint.gold;save.state.player.crystals=checkpoint.crystals;room.casino=checkpoint.casino;if(spinEpoch===casinoSpinEpoch)casinoSpinBusy=false;modal.removeAttribute("aria-busy");if(modal.isConnected)refreshSecretRoomCasinoModal(modal,bet,cardScroll);showToast("保存できなかったため、スロット決済を取り消しました");return;
  }
  input.blur();holdScroll();
  try{
   const reels=modal.querySelector("#casinoReels"),resultBox=modal.querySelector("#casinoResult"),reelElements=[...reels.querySelectorAll("i")],pause=ms=>new Promise(resolve=>setTimeout(resolve,ms)),step=casinoFastMode?100:360;
   reels.className="casino-reels";resultBox.className="casino-result";resultBox.innerHTML=`<b>${result.bet.toLocaleString()}G BET・運命確定…</b><small>${result.crystalCost?`入場料 💎${result.crystalCost} / `:""}決済・保存済み</small>`;
   reelElements.forEach(reel=>{reel.textContent="✦";reel.className="rolling"});
   for(let index=0;index<reelElements.length;index++){
    await pause(step);if(!modal.isConnected)return;
    reelElements[index].className="landed";reelElements[index].textContent=result.digits[index];holdScroll();
   }
   reels.classList.add("finished");if(result.multiplier>=100)reels.classList.add("jackpot");else if(result.multiplier>=10)reels.classList.add("big-win");
   resultBox.className=`casino-result ${result.multiplier>1?"win":result.multiplier===1?"draw":"lose"}`;
   resultBox.innerHTML=result.multiplier===0?`<strong>000・全額消失</strong><small>−${result.bet.toLocaleString()}G</small>`:result.multiplier===1?`<strong>001・1倍</strong><small>${result.bet.toLocaleString()}G返還・GOLD収支±0</small>`:`<strong>${String(result.multiplier).padStart(3,"0")}・${result.multiplier}倍！</strong><small>${result.payout.toLocaleString()}G獲得 / 収支 +${result.net.toLocaleString()}G</small>`;
   if(result.multiplier>=50)navigator.vibrate?.(result.multiplier>=999?[80,40,120]:[50,30,70]);
   await pause(casinoFastMode?80:260);
  }catch(error){console.warn("Casino result animation skipped",error);if(modal.isConnected)showToast("抽選結果は保存済みです")}
  finally{if(spinEpoch===casinoSpinEpoch)casinoSpinBusy=false;modal.removeAttribute("aria-busy");if(modal.isConnected)refreshSecretRoomCasinoModal(modal,Math.min(bet,casinoBetLimit(save.state)),cardScroll)}
 });
}
function openSecretRoomCasino(){
 const returnState={x:window.scrollX,y:window.scrollY,screenScroll:document.querySelector(".secret-room-screen")?.scrollTop??0,pageScroll:document.querySelector(".secret-room-screen .page")?.scrollTop??0,focusMenu:document.activeElement?.closest?.("[data-shop-menu]")?.dataset.shopMenu??"casino"};
 casinoSpinEpoch++;casinoSpinBusy=false;app.insertAdjacentHTML("beforeend",Modal("🎰 深淵スロット",casinoModalBody(),"裏街へ戻る"));
 const modal=topModal(),title=modal.querySelector("h2"),dismiss=modal.querySelector("[data-modal-dismiss]");modal.classList.add("casino-modal-v2");modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");if(title){title.id="casinoModalTitle";modal.setAttribute("aria-labelledby",title.id)}if(dismiss){dismiss.disabled=false;dismiss.setAttribute("aria-label","深淵スロットを閉じて裏街へ戻る");dismiss.setAttribute("title","閉じる")};bindSecretRoomCasinoModal(modal);
 let closed=false;const close=()=>{if(closed)return;closed=true;casinoSpinEpoch++;casinoSpinBusy=false;modal.removeAttribute("aria-busy");modal.querySelector(".casino-panel")?.classList.remove("busy");if(modal.contains(document.activeElement))document.activeElement.blur();modal.remove();render();requestAnimationFrame(()=>requestAnimationFrame(()=>{const nextScreen=document.querySelector(".secret-room-screen"),nextPage=nextScreen?.querySelector(".page");document.querySelector(`[data-shop-menu="${returnState.focusMenu}"]`)?.focus({preventScroll:true});if(nextScreen)nextScreen.scrollTop=returnState.screenScroll;if(nextPage)nextPage.scrollTop=returnState.pageScroll;window.scrollTo({left:returnState.x,top:returnState.y,behavior:"auto"})}))};modal._onDismiss=close;modal.querySelector("[data-modal-primary]").onclick=close;if(dismiss)dismiss.onclick=close;bindBackdropTapClose(modal,close);dismiss?.focus({preventScroll:true});
}
function openSecretRoomInn(){
 const room=activeSecretRoom(save.state);
 if(room?.rested)return showToast("この🚪の無料宿は利用済みです");
 if(!confirm("無料の宿でパーティーを完全回復しますか？\nこの🚪では1回だけ利用できます。"))return;
 const result=useSecretRoomInn(save.state);if(!result.ok)return showToast(result.message);
 save.save();if(onlineSecretRoomContext)onlinePartyController?.syncExpeditionProfile();app.insertAdjacentHTML("beforeend",Modal("🛏️ 無料宿・完全回復",`<div class="secret-inn-result"><span>✨</span><h3>パーティー完全回復！</h3><p>HP ${result.hp.toLocaleString()} / MP ${result.mp.toLocaleString()}</p><small>状態異常 ${result.ailments}件を解除</small></div>`,"裏街へ戻る"));
 topModalButton().onclick=()=>{closeTopModal();render()};
}
function darkMarketBody(){
 const room=activeSecretRoom(save.state),offers=room?.offers??[];
 const offerRows=offers.map(offer=>{const rarity=String(offer.rarity??"SR"),rarityClass=({"神話":"mythic","深淵":"abyss","十神":"ten-god"}[rarity]??rarity).toLowerCase(),grade=offer.mystery&&!offer.revealed?"未鑑定":offer.powerLabel??"出所不明",hidden=offer.mystery&&!offer.revealed,showMonster=offer.kind==="monster"&&offer.payload&&!hidden,species=showMonster?SPECIES[offer.payload.speciesId]:null,icon=showMonster?monsterVisual(offer.payload,species?.emoji??offer.icon,{className:"market-list-monster-visual"}):offer.kind==="equipment"&&offer.payload&&!hidden?equipmentVisual(offer.payload,{className:"market-list-equipment-visual"}):offer.icon;return`<article class="dark-market-offer rarity-name-${rarityClass} ${offer.sold?"sold":""} ${offer.priceTone} grade-${offer.powerGrade??"standard"}"><span>${icon}</span><div><small>${offer.kind==="monster"?"MONSTER":"EQUIPMENT"}・${rarity}・${grade}</small><b>${offer.name}</b><p>${offer.description}</p><em class="market-price-label">${offer.priceLabel}</em></div><div class="dark-market-offer-actions"><button type="button" data-market-detail="${offer.id}">詳細</button><button type="button" data-market-offer="${offer.id}" ${offer.sold?"disabled":""}>${offer.sold?"売切":`${offer.price.toLocaleString()}G`}</button></div></article>`}).join("");
 const recoveryRows=SECRET_ROOM_RECOVERY_ITEMS.map(item=>{const purchased=room?.recoveryPurchased?.[item.id]??0,remaining=Math.max(0,DARK_MARKET_ITEM_LIMIT-purchased);return`<article class="dark-market-recovery"><span>${item.icon}</span><div><b>${item.name}</b><small>${item.description}<br>所持 ${save.state.inventory[item.id]??0}</small></div><button data-market-recovery="${item.id}" ${remaining?"":"disabled"}>${remaining?`${item.price}G`:"完売"}<small>${purchased}/${DARK_MARKET_ITEM_LIMIT}</small></button></article>`}).join("");
 return`<div class="dark-market"><div class="dark-market-wallet">所持 <b>${save.state.player.gold.toLocaleString()}G</b></div><small class="muted">装備・モンスターは各1点限り。階層の3倍以内は完全ランダム価格、超高Lv魔物だけ能力相応の最低価格が付きます。</small><h3>一点物</h3><div class="dark-market-offers">${offerRows}</div><h3>激安回復用品</h3><div class="dark-market-recovery-list">${recoveryRows}</div></div>`;
}
function darkMarketOfferDetail(offer){
 if(offer.mystery&&!offer.revealed)return`<div class="market-mystery-detail"><span>❔</span><h3>${offer.name}</h3><p>商人すら鑑定していない一点物。種類と中身は購入した瞬間に判明します。</p><small>${offer.kind==="monster"?"モンスター契約":"装備"} / 表示ランク ${offer.rarity} / 返品不可</small></div>`;
 const payload=offer.payload;if(!payload)return`<div class="empty">売却済みの商品です。</div>`;
 if(offer.kind==="equipment"){
  const multiplier=equipmentStatMultiplier(payload),stats=Object.entries(payload.stats??{}).map(([key,value])=>`<span><small>${equipmentStatLabel(key)}</small><b>+${Math.round(value*multiplier)}</b></span>`).join("");
  const affixes=(payload.affixes??[]).map(affix=>`<p><i style="background:${affixQuality(affix).color}"></i><b>${formatAffix(affix)}</b><small>${affixQuality(affix).name}</small></p>`).join("")||'<p class="muted">ランダムオプションなし</p>';
  return`<div class="market-item-detail"><div class="market-detail-hero"><span>${equipmentVisual(payload,{className:"market-detail-equipment-visual"})}</span><div><small>${offer.rarity}・${offer.powerLabel??"出所不明"}</small><h3>${payload.name}${payload.plus?` +${payload.plus}`:""}</h3><p>${slotLabel(payload.slot)}・Lv.${payload.level??1}</p></div></div><div class="market-detail-stats">${stats}</div><div class="market-detail-affixes">${affixes}</div></div>`;
 }
 const species=SPECIES[payload.speciesId]??{},stats=calculatedStats(payload),skills=(payload.equippedSkills?.map(skillById).filter(Boolean)??recommendedSkills(payload,4));
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
function refreshDarkMarketModal(modal,scrollState={}){
 const body=modal.querySelector(".game-modal-body");if(!body)return;
 body.innerHTML=darkMarketBody();bindDarkMarketModal(modal);
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const card=modal.querySelector(".game-modal-card"),nextBody=modal.querySelector(".game-modal-body");if(card)card.scrollTop=scrollState.card??0;if(nextBody)nextBody.scrollTop=scrollState.body??0}));
}
function bindDarkMarketModal(modal){
 modal.querySelectorAll("[data-market-detail]").forEach(button=>button.onclick=()=>openDarkMarketOfferDetail(button.dataset.marketDetail));
 modal.querySelectorAll("[data-market-offer]").forEach(button=>button.onclick=()=>purchaseDarkMarketOffer(button.dataset.marketOffer,modal));
 modal.querySelectorAll("[data-market-recovery]").forEach(button=>button.onclick=()=>{
  const card=modal.querySelector(".game-modal-card"),body=modal.querySelector(".game-modal-body"),scrollState={card:card?.scrollTop??0,body:body?.scrollTop??0},room=activeSecretRoom(save.state),itemId=button.dataset.marketRecovery,checkpoint={gold:save.state.player.gold,count:save.state.inventory[itemId]??0,purchased:room.recoveryPurchased[itemId]??0,purchaseRecords:save.state.records?.purchases??0};
  button.disabled=true;const result=buyDarkMarketRecovery(save.state,itemId);if(!result.ok){button.disabled=false;return showToast(result.message)}
  if(!save.save()){save.state.player.gold=checkpoint.gold;save.state.inventory[itemId]=checkpoint.count;room.recoveryPurchased[itemId]=checkpoint.purchased;save.state.records.purchases=checkpoint.purchaseRecords;button.disabled=false;return showToast("保存できなかったため購入を取り消しました")}
  showToast(result.message);refreshDarkMarketModal(modal,scrollState);
 });
}
function openDarkMarket(){
 app.insertAdjacentHTML("beforeend",Modal("🕶️ 闇市場",darkMarketBody(),"裏街へ戻る"));
 const modal=topModal();modal.classList.add("dark-market-modal-v2");bindDarkMarketModal(modal);
 const close=()=>{modal.remove();render()};modal._onDismiss=close;modal.querySelector("[data-modal-primary]").onclick=close;
}
function equipmentReceipt(item,options={}){
 if(options.scaleToFloor!==false&&(Number(item.level)||1)<=1&&!item.endgameBossId&&!item.ruleOverrides?.fixedLevel){
  const floor=Math.max(1,Number(options.floor)||Number(save.state.player.currentFloor)||1);
  item.level=equipmentDropLevelForFloor(campaignFloorToLegacyFloor(floor),{elite:Boolean(options.elite),boss:Boolean(options.bossReward)});
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
 // One floor is four to six independent dungeon sections.  Their logical
 // graph, rather than the old carved hallways, carries the route structure.
 const bossIds=campaignBossIdsForFloor(floor);
 return{shape:"section-dungeons",roomCount:requiredCampaignBossSectionCount(floor,bossIds,roomCountForRandom(rng))}
}
function campaignBossIdsForFloor(floor){
 const milestoneIds=milestoneBossIdsForFloor(floor);if(milestoneIds.length)return milestoneIds;
 const definition=floorBossDefinitionForFloor(floor)??FLOOR_BOSS_CATALOG.find(entry=>Number(entry.floor)===campaignFloorToLegacyFloor(floor));
 return definition?.id?[definition.id]:[]
}
function campaignWorldBosses(world){return Array.isArray(world?.bosses)?world.bosses:world?.boss?[world.boss]:[]}
function campaignWorldTrophyChests(world){return Array.isArray(world?.trophyChests)?world.trophyChests:world?.trophyChest?[world.trophyChest]:[]}
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
  pointKey(world.start),pointKey(world.exit),pointKey(world.shop),
  ...campaignWorldBosses(world).map(pointKey),...(world.chests??[]).map(pointKey),...(world.campaignKeys??[]).map(pointKey),...campaignWorldTrophyChests(world).map(pointKey),pointKey(world.hotSpring)
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
  const entry={id:`${floor}-decor-${decorations.length}`,x:cell.x,y:cell.y,sectionId:sectionIdAt(world,cell.x,cell.y),type,rotation:options.rotation??cell.rotation??0,scale:options.scale??1,phase:Math.floor(rng()*997),used:false,destroyed:false};
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
 // A section should always justify the trip. Existing keys, chests, the ruler,
 // the shop and post-boss facilities count as value; otherwise place one of
 // the existing guaranteed crystal pickups instead of inventing a new system.
 const meaningfulSections=new Set([...campaignWorldBosses(world),world.shop,...campaignWorldTrophyChests(world),world.hotSpring,world.exit,...(world.campaignKeys??[]),...(world.chests??[])].filter(Boolean).map(entry=>String(campaignObjectSection(world,entry)??"")));
 decorations.filter(entry=>["crystal","water"].includes(entry.type)).forEach(entry=>meaningfulSections.add(String(entry.sectionId??"")));
 for(const section of world.sections??[]){
  if(meaningfulSections.has(String(section.id)))continue;
  const reward=add("crystal",cells,{scale:1.18,predicate:cell=>sectionIdAt(world,cell.x,cell.y)===section.id&&Math.abs(cell.x-section.center.x)+Math.abs(cell.y-section.center.y)>=3});
  if(reward){reward.sectionReward=true;reward.id=`${floor}-section-reward-${section.index+1}`;meaningfulSections.add(String(section.id))}
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
 const origin=world.start??{x:1,y:1},occupied=new Set([...(world.chests??[]),...(world.campaignKeys??[]),...campaignWorldTrophyChests(world),world.hotSpring,world.exit,world.shop,...campaignWorldBosses(world),...decorations].filter(Boolean).map(entry=>`${entry.x}:${entry.y}`));
 const originSection=campaignObjectSection(world,origin),cells=[];for(let y=1;y<world.rows-1;y++)for(let x=1;x<world.cols-1;x++)if(!world.tiles[y]?.[x]&&sectionIdAt(world,x,y)===originSection&&!occupied.has(`${x}:${y}`)&&(x!==origin.x||y!==origin.y))cells.push({x,y,sectionId:originSection,distance:Math.abs(x-origin.x)+Math.abs(y-origin.y)});
 const cell=cells.sort((left,right)=>left.distance-right.distance)[0];if(!cell)return null;
 const pickup={id:"1-guide-first-pickup",x:cell.x,y:cell.y,type:"crystal",rotation:0,scale:1.15,phase:199,used:false,destroyed:false,tutorialGuide:"firstPickup"};decorations.push(pickup);world.decorations=decorations;return pickup
}
function campaignObjectSection(world,point){return point?.sectionId??sectionIdAt(world,point?.x,point?.y)}
function pointDistance(a,b){return Math.abs(Number(a?.x)-Number(b?.x))+Math.abs(Number(a?.y)-Number(b?.y))}
function validCampaignSpawn(world,point,sectionId){return Boolean(point&&campaignObjectSection(world,point)===sectionId&&!world.tiles?.[point.y]?.[point.x])}
function chooseSectionCell(section,used,random,{awayFrom=[],minimumDistance=2,wall=false}={}){
 const source=(section?.cells??[]).filter(cell=>!used.has(`${cell.x},${cell.y}`)&&awayFrom.every(point=>pointDistance(cell,point)>=minimumDistance)&&(!wall||[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>!section.cellKeys.includes(`${cell.x+dx},${cell.y+dy}`))));
 const fallback=(section?.cells??[]).filter(cell=>!used.has(`${cell.x},${cell.y}`));if(!source.length&&!fallback.length)return{...section.center,sectionId:section.id};const pool=source.length?source:fallback,cell=pool[Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*pool.length)];used.add(`${cell.x},${cell.y}`);return{...cell,sectionId:section.id}
}
function campaignBossStateAtFloor(entry,floor,bossId){
 const milestones=milestoneBossIdsForFloor(floor);if(milestones.includes(bossId)){const progress=entry?.bossProgress?.[bossId]??{};return{discovered:Boolean(progress.discovered),defeated:Boolean(progress.defeated),trophyClaimed:Boolean(progress.trophyClaimed),trophyLocksOpened:Number(progress.trophyLocksOpened)||0,bossAreaId:progress.bossAreaId??null,trophySpawn:progress.trophySpawn??null}}
 return{discovered:Boolean(entry?.bossDiscovered),defeated:Boolean(entry?.bossDefeated),trophyClaimed:Boolean(entry?.trophyClaimed),trophyLocksOpened:Number(entry?.trophyLocksOpened)||0,bossAreaId:entry?.bossAreaId??null,trophySpawn:entry?.postBossSpawns?.trophy??null}
}
function campaignBossInfoForId(floor,bossId){
 const endgame=ENDGAME_BOSSES[bossId];if(endgame)return{speciesId:endgame.speciesId,visualSpeciesId:endgame.id,name:endgame.name,endgameBossId:endgame.id,faction:endgame.faction,campaignBossId:endgame.id};
 const definition=floorBossDefinitionById(bossId)??floorBossDefinitionForFloor(floor);return definition?{speciesId:definition.speciesId,visualSpeciesId:definition.visualSpeciesId??definition.speciesId,name:definition.name,floorBossCatalogId:definition.id,campaignBossId:definition.id}:null
}
function ensurePostBossSpawns(world,campaignState,bossPoint,bossSectionId,random=Math.random,{bossId=null,used:sharedUsed=null}={}){
 const section=(world.sections??[]).find(entry=>entry.id===bossSectionId)??world.sections?.at(-1),portalCells=(world.sectionPortals??[]).flatMap(portal=>[{x:portal.x,y:portal.y,sectionId:portal.sectionId},{x:portal.arrivalX,y:portal.arrivalY,sectionId:portal.targetSectionId}]).filter(point=>point.sectionId===bossSectionId),used=sharedUsed??new Set();for(const point of portalCells)used.add(`${point.x},${point.y}`);used.add(`${bossPoint.x},${bossPoint.y}`);
 const progress=campaignBossStateAtFloor(campaignState,campaignState.floor,bossId),legacySaved=campaignState.postBossSpawns??{},savedTrophy=progress.trophySpawn??(campaignBossIdsForFloor(campaignState.floor).length===1?legacySaved.trophy:null),safeExitKeys=new Set(safeSectionExitCandidates(section).map(cell=>`${cell.x},${cell.y}`));
 const select=(name,awayFrom)=>{const existing=name==="trophy"?savedTrophy:null,existingKey=`${existing?.x},${existing?.y}`,existingIsSafe=name!=="exit"||safeExitKeys.has(existingKey);if(existingIsSafe&&validCampaignSpawn(world,existing,bossSectionId)&&!used.has(existingKey)){used.add(existingKey);return{...existing,sectionId:bossSectionId}}if(name==="exit"){const safe=chooseSafeSectionExitCell(section,{reserved:[...used],awayFrom,minimumDistance:3,random});if(safe){used.add(`${safe.x},${safe.y}`);return safe}}return chooseSectionCell(section,used,random,{awayFrom,minimumDistance:3,wall:name==="exit"})};
 const trophy=select("trophy",[bossPoint]),spring=select("spring",[bossPoint,trophy]),exit=select("exit",[bossPoint,trophy,spring]);return{trophy,spring,exit}
}
function applyCampaignBossClearToWorld(world,boss,floor){
 if(!world)return null;const firstFloorBossDefeat=!world.bossDefeated,bossId=String(boss?.campaignBossId??boss?.endgameBossId??boss?.floorBossCatalogId??""),target=campaignWorldBosses(world).find(entry=>entry.campaignBossId===bossId)??campaignWorldBosses(world).find(entry=>entry.active!==false),bossSectionId=target?.sectionId??campaignObjectSection(world,target)??world.sections?.at(-1)?.id,bossPoint=target??world.sections?.find(section=>section.id===bossSectionId)?.center??world.start,spawns=target?.postBossSpawns??ensurePostBossSpawns(world,campaignFloorState(save.state,floor),bossPoint,bossSectionId,seeded((floorSeed(floor)^0x308b055)>>>0),{bossId}),wasDefeated=Boolean(campaignBossStateAtFloor(campaignFloorState(save.state,floor),floor,bossId).defeated),state=defeatCampaignBoss(save.state,floor,bossId),bossInfo={...campaignBossInfoForId(floor,bossId),speciesId:boss?.speciesId,name:boss?.name??boss?.nameOverride,floorBossCatalogId:boss?.floorBossCatalogId??null,endgameBossId:boss?.endgameBossId??null,campaignBossId:bossId};
 if(target){target.active=false;target.hidden=true}state.lastBossInfo=bossInfo;state.aftermathBossId=state.aftermathBossId||bossId;if(state.bossProgress?.[bossId]){state.bossProgress[bossId].bossAreaId=bossSectionId;state.bossProgress[bossId].trophySpawn={...spawns.trophy}}else{state.bossAreaId=bossSectionId;state.postBossSpawns={...spawns}}
 world.bosses=campaignWorldBosses(world);world.boss=world.bosses.find(entry=>entry.active!==false)??null;world.bossDefeated=true;world.nextEncounter=Number.MAX_SAFE_INTEGER;world.trophyChests=campaignWorldTrophyChests(world);if(!world.trophyChests.some(entry=>entry.bossId===bossId))world.trophyChests.push({id:`${floor}-trophy-${bossId}`,...spawns.trophy,bossId,open:false,locksOpened:0,label:"支配者の戦利品",bossInfo});world.trophyChest=world.trophyChests[0]??null;
 if(!world.hotSpring){world.hotSpring={...spawns.spring,active:true,used:Boolean(state.hotSpringUsed),scale:5.9,radius:.8};world.exit={...spawns.exit,locked:false,active:true,kind:floor>=CAMPAIGN_MAX_FLOOR?"final-gate":"next-floor",label:floor>=CAMPAIGN_MAX_FLOOR?"勇者決戦へ":"次の階層へ"}}else{world.hotSpring.active=true;world.hotSpring.used=Boolean(state.hotSpringUsed);world.exit.locked=false;world.exit.active=true}
 world.postBossRevealPending=!wasDefeated;world.postBossRevealBossId=bossId;world.postBossRevealFirstUnlock=firstFloorBossDefeat;world.allBossesDefeated=campaignWorldBosses(world).every(entry=>entry.active===false);return state
}
function recentDungeonShapeSignatures(floor){return(save.state.player.dungeonShapeHistory??[]).filter(entry=>entry&&Number(entry.floor)!==Number(floor)&&Array.isArray(entry.signatures)).slice(-3).flatMap(entry=>entry.signatures).slice(-18)}
function rememberDungeonShapeSignatures(floor,signatures){const history=(save.state.player.dungeonShapeHistory??[]).filter(entry=>entry&&Number(entry.floor)!==Number(floor)&&Array.isArray(entry.signatures));history.push({floor:Number(floor),signatures:[...(signatures??[])].slice(-6)});save.state.player.dungeonShapeHistory=history.slice(-4)}
function maze(){
 const floor=save.state.player.currentFloor,rng=seeded(floorSeed(floor)),cfg=floorConfig(floor,rng),attributes=roomAttributesForFloor(floor,cfg.roomCount,rng),layout=generateSectionDungeon({count:cfg.roomCount,attributes,random:rng,recentSignatures:recentDungeonShapeSignatures(floor)}),{cols,rows,tiles,sections}=layout,rooms=sections,startCell={...layout.start};rememberDungeonShapeSignatures(floor,layout.shapeSignatures);
 const campaignState=beginCampaignFloorRun(save.state,floor,save.state.player.exploreRun?.id),used=new Set([`${startCell.x},${startCell.y}`]);
 for(const portal of layout.sectionPortals){used.add(`${portal.x},${portal.y}`);used.add(`${portal.arrivalX},${portal.arrivalY}`)}
 const bossIds=campaignBossIdsForFloor(floor),availableBossSections=sections.filter(section=>section.id!==layout.startSectionId),assignedSections=new Set(),bossPlans=[];
 for(const bossId of bossIds){const progress=campaignBossStateAtFloor(campaignState,floor,bossId),saved=availableBossSections.find(section=>section.id===progress.bossAreaId&&!assignedSections.has(section.id)),candidates=availableBossSections.filter(section=>!assignedSections.has(section.id)),section=saved??candidates[Math.floor(rng()*Math.max(1,candidates.length))]??availableBossSections[0]??sections.at(-1);assignedSections.add(section.id);const point=chooseSectionCell(section,used,rng,{awayFrom:[startCell],minimumDistance:5});bossPlans.push({bossId,section,point,progress})}
 for(const plan of bossPlans){plan.spawns=ensurePostBossSpawns({...layout,sections},campaignState,plan.point,plan.section.id,rng,{bossId:plan.bossId,used});if(campaignState.bossProgress?.[plan.bossId]){campaignState.bossProgress[plan.bossId].bossAreaId=plan.section.id;campaignState.bossProgress[plan.bossId].trophySpawn={...plan.spawns.trophy}}else{campaignState.bossAreaId=plan.section.id;campaignState.postBossSpawns={...plan.spawns}}}
 const bossPoints=bossPlans.map(plan=>plan.point),shuffledSections=sections.map(section=>({section,roll:rng()})).sort((a,b)=>a.roll-b.roll).map(entry=>entry.section),keySections=shuffledSections.slice(0,CAMPAIGN_KEYS_PER_FLOOR),campaignKeys=keySections.map((section,index)=>{const id=`${floor}-campaign-key-${index+1}`,point=chooseSectionCell(section,used,rng,{awayFrom:[startCell,...bossPoints],minimumDistance:4});return{id,...point,roomId:section.id,collected:campaignState.keyIds.includes(id)}});
 const allCells=sections.flatMap(section=>section.cells.map(cell=>({...cell,sectionId:section.id}))),pickAny=()=>{const section=shuffledSections[Math.floor(rng()*shuffledSections.length)]??sections[0];return chooseSectionCell(section,used,rng,{awayFrom:[startCell,...bossPoints],minimumDistance:3})};
 const chestSpawnBonus=abyssSkillEffectTotal(save.state,"chestSpawnRate"),opened=save.state.player.openedChests[floor]??[],chests=[],treasureRoom=floor%10!==0&&rng()<treasureRoomRateForFloor(campaignFloorToLegacyFloor(floor)),chestCount=treasureRoom?treasureRoomChestCount(rng):(rng()<Math.max(0,.12-chestSpawnBonus)?0:rng()<.68?1:2);let treasureMimics=0;
 for(let i=0;i<chestCount;i++){const roll=rng(),kind=treasureRoom?(roll>.48?"radiant":"cabinet"):roll>.96?"radiant":roll>.78?"cabinet":roll>.25?"box":"apple",locked=kind==="radiant"&&rng()<(treasureRoom?.58:.45),mimic=!locked&&shouldPlaceTreasureMimic({treasureRoom,mimicsPlaced:treasureMimics,random:rng}),point=pickAny();if(mimic)treasureMimics++;chests.push({...point,id:`${floor}-${i}`,kind,locked,mimic,open:opened.includes(`${floor}-${i}`)})}
 const roomPlan=secretRoomPlan(save.state,floor),shopPoint=roomPlan.appears?pickAny():null,shop=shopPoint?{...shopPoint,active:true,roomId:roomPlan.id,sectionId:shopPoint.sectionId}:null;
 if(shop){const directions=[{dx:0,dy:-1,rotation:0},{dx:1,dy:0,rotation:Math.PI/2},{dx:0,dy:1,rotation:Math.PI},{dx:-1,dy:0,rotation:-Math.PI/2}];shop.rotation=directions.find(direction=>tiles[shop.y+direction.dy]?.[shop.x+direction.dx]===1)?.rotation??0}
 const bosses=bossPlans.map(plan=>({...plan.point,active:!plan.progress.defeated,roomId:plan.section.id,sectionId:plan.section.id,hidden:!plan.progress.discovered,campaignBossId:plan.bossId,postBossSpawns:plan.spawns})),defeatedPlans=bossPlans.filter(plan=>plan.progress.defeated),postBoss=defeatedPlans.length>0,trophyChests=defeatedPlans.map(plan=>{const bossInfo=campaignBossInfoForId(floor,plan.bossId);return{id:`${floor}-trophy-${plan.bossId}`,...plan.spawns.trophy,bossId:plan.bossId,open:plan.progress.trophyLocksOpened>=CAMPAIGN_KEYS_PER_FLOOR,locksOpened:plan.progress.trophyLocksOpened,label:"支配者の戦利品",bossInfo}}),aftermathId=bossIds.includes(campaignState.aftermathBossId)?campaignState.aftermathBossId:defeatedPlans[0]?.bossId,aftermath= bossPlans.find(plan=>plan.bossId===aftermathId)?.spawns??bossPlans[0]?.spawns??{spring:startCell,exit:startCell},hotSpring=postBoss?{...aftermath.spring,active:true,used:campaignState.hotSpringUsed,scale:5.9,radius:.8}:null,exit={...aftermath.exit,locked:!postBoss,active:postBoss,kind:floor>=CAMPAIGN_MAX_FLOOR?"final-gate":"next-floor",label:floor>=CAMPAIGN_MAX_FLOOR?"勇者決戦へ":"次の階層へ"};campaignState.aftermathBossId=aftermathId??null;
 const discoveredSections=new Set(campaignState.visitedRoomIds);discoveredSections.add(layout.startSectionId);const discoveredCells=sections.filter(section=>discoveredSections.has(section.id)).flatMap(section=>section.cellKeys);
 const world={...layout,layoutVersion:318,shape:layout.shape,rooms,sections,allCells,start:startCell,currentSectionId:layout.startSectionId,currentRoomId:layout.startSectionId,currentAttribute:sections[0].attribute,exit,shop,bosses,boss:bosses.find(entry=>entry.active!==false)??null,bossPoint:bossPlans[0]?.point??null,bossSectionId:bossPlans[0]?.section.id??null,chests,treasureRoom,campaignKeys,trophyChests,trophyChest:trophyChests[0]??null,hotSpring,bossDefeated:postBoss,allBossesDefeated:bosses.every(entry=>entry.active===false),roomAttributes:sections.map(section=>({id:section.id,attribute:section.attribute})),discoveredSections:[...discoveredSections],discoveredCells,steps:0,heroStepsSinceBattle:0,campaignHeroPursuit:null,nextEncounter:postBoss?Number.MAX_SAFE_INTEGER:10+Math.floor(rng()*23),encountering:false};
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
 // Older disconnected-section snapshots stay playable. Build318 adds shape
 // fingerprints and passage metadata without requiring them on an active run.
 const bossIds=campaignBossIdsForFloor(source.floor);if(!game?.online&&![303,307,308,310,318].includes(Number(world.layoutVersion)))return null;
 if(!game?.online&&shouldRegenerateCampaignBossSnapshot({floor:source.floor,world},{floor:source.floor,bossIds}))return null;
 const floorState=campaignFloorState(save.state,source.floor),savedBossDefeated=Boolean(floorState.bossDefeated),snapshotBossDefeated=Boolean(world.bossDefeated),savedSpringUsed=Boolean(floorState.hotSpringUsed),snapshotSpringUsed=Boolean(world.hotSpring?.used||world.hotSpring&&world.hotSpring.active===false);
 // Campaign progress is the durable authority. A stale field snapshot must
 // never resurrect a boss or a chest, nor preserve a false legacy clear.
 if([308,310,318].includes(Number(world.layoutVersion))){const savedDefeated=new Set(milestoneBossIdsForFloor(source.floor).length?campaignDefeatedBossIds(floorState):savedBossDefeated?bossIds:[]),activeBossIds=new Set(campaignWorldBosses(world).filter(entry=>entry.active!==false).map(entry=>entry.campaignBossId??entry.bossId)),trophyByBoss=new Map(campaignWorldTrophyChests(world).map(entry=>[entry.bossId??entry.bossInfo?.campaignBossId,entry]));if(savedBossDefeated!==snapshotBossDefeated)return null;for(const bossId of bossIds){if(activeBossIds.has(bossId)===savedDefeated.has(bossId)||trophyByBoss.has(bossId)!==savedDefeated.has(bossId))return null;const expectedOpen=campaignBossStateAtFloor(floorState,source.floor,bossId).trophyLocksOpened>=CAMPAIGN_KEYS_PER_FLOOR;if(savedDefeated.has(bossId)&&Boolean(trophyByBoss.get(bossId)?.open)!==expectedOpen)return null}if(savedBossDefeated&&(!world.hotSpring||!world.exit||world.exit.locked||world.exit.active===false)||savedBossDefeated&&savedSpringUsed!==snapshotSpringUsed)return null}
 else{const savedTrophyOpened=floorState.trophyLocksOpened>=CAMPAIGN_KEYS_PER_FLOOR,snapshotTrophyOpened=Boolean(world.trophyChest?.open);if(savedBossDefeated!==snapshotBossDefeated||savedBossDefeated&&Boolean(world.boss)||savedBossDefeated&&(!world.trophyChest||!world.hotSpring||!world.exit||world.exit.locked||world.exit.active===false)||savedBossDefeated&&(savedTrophyOpened!==snapshotTrophyOpened||savedSpringUsed!==snapshotSpringUsed))return null}
 const player=new Entity(Number(playerData.x)||world.start.x,Number(playerData.y)||world.start.y);player.rx=Number.isFinite(Number(playerData.rx))?Number(playerData.rx):player.x;player.ry=Number.isFinite(Number(playerData.ry))?Number(playerData.ry):player.y;
 world.currentSectionId=sectionIdAt(world,player.x,player.y);world.encountering=false;return{world,player,partyTrail:cloneSerializable(source.partyTrail)??[],cameraData:cloneSerializable(source.cameraData)??null,paused:false,running:true,input:createInputState()}
}
function clearExpeditionSnapshot({saveNow=false,settleHeroPursuit=true}={}){if(settleHeroPursuit)settleAbandonedCampaignHeroPursuit("snapshot-cleared");if(expeditionSaveTimer){clearTimeout(expeditionSaveTimer);expeditionSaveTimer=null}save.state.expeditionSnapshot=null;normalizeEndgameState(save.state).emergency.pendingEncounter=null;if(saveNow)save.save()}
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
  <div class="return-confirm-route"><span><small>出発地点</small><b>${startFloor}階</b></span><i></i><span><small>現在地点</small><b>${floor}階</b></span><strong>踏破 ${cleared}階</strong></div>
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
function showOnlineExpeditionDefeatResult({lost=0,checkpoint=1}={}){
 app.insertAdjacentHTML("beforeend",Modal("共同探索・敗北",`<div class="defeat-cinematic"><div class="defeat-mark">☠</div><h2>深淵に敗れた…</h2><p><b>${Math.max(0,Number(lost)||0).toLocaleString()}G</b>を失い、${Math.max(1,Number(checkpoint)||1).toLocaleString()}階の拠点へ救出されました。</p><small>通常探索と同じ敗北結果をセーブしました。</small></div>`,"オンライン受付へ戻る"));const modal=topModal(),finish=()=>modal?.remove();modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish
}
function showOnlineExpeditionSummary(context={}){
 const summary=context?.summary&&typeof context.summary==="object"?context.summary:{},guest=Boolean(context?.guest||summary.progressionEligible===false),assistedWorld=summary.assistedWorld&&typeof summary.assistedWorld==="object"&&!Array.isArray(summary.assistedWorld)?summary.assistedWorld:null,floorSource=guest&&assistedWorld?assistedWorld:summary,startFloor=Math.max(1,Math.floor(Number(floorSource.startFloor)||1)),endFloor=Math.max(startFloor,Math.floor(Number(floorSource.endFloor??floorSource.floor)||startFloor)),floorsCleared=Math.max(0,Math.floor(Number(floorSource.floorsCleared)||0)),reason=String(context?.reason??summary.reason??"return"),completed=Boolean(summary.completed),ranking=(Array.isArray(summary.ranking)?summary.ranking:[]).slice(0,4);
 const title=completed?"共同探索を踏破":reason==="defeat"?"共同探索は敗北":reason==="serverRestart"?"共同探索を安全に回収":"共同探索から帰還",reasonLabels={leader:"部屋主が帰還を確定しました",vote:"帰還投票が成立しました",worldOwnerLeft:"部屋主の退出により帰還しました",worldOwnerTimeout:"部屋主の再接続期限を迎えました",serverRestart:"サーバー再起動で中断された進行と報酬を端末へ回収しました",maxFloor:"最深部を踏破しました",return:"共同探索を終了しました"},detail=reasonLabels[reason]??(completed?"共同探索の踏破結果を保存しました":"共同探索の結果を保存しました");
 const rankingRows=ranking.map((entry,index)=>`<div class="return-reward-item"><b>#${Math.max(1,Math.floor(Number(entry?.rank)||index+1))} ${escapeAttribute(entry?.name||"冒険者")}</b><small>共闘貢献 ${Math.max(0,Math.floor(Number(entry?.score)||0)).toLocaleString()}</small></div>`).join("");
 const receipt=context?.duplicate?"保存済みの結果を再確認しました。":context?.guest?"参加結果と最終HP・MPを保存しました。":"共同探索の進行と最終HP・MPを保存しました。";
 const body=`<div class="return-reward-report return-reward-v2 online-expedition-summary"><small>ONLINE EXPEDITION RESULT</small><h2>${escapeAttribute(title)}</h2><p>${escapeAttribute(detail)}</p><div class="return-result-summary"><article>${pixelIcon("dungeon")}<small>${guest&&assistedWorld?"部屋主の出発":"出発"}</small><b>${startFloor.toLocaleString()}階</b></article><article>${pixelIcon("map")}<small>${guest&&assistedWorld?"部屋主の帰還地点":"帰還地点"}</small><b>${endFloor.toLocaleString()}階</b></article><article>${pixelIcon("event")}<small>${guest&&assistedWorld?"お手伝い踏破":"踏破階層"}</small><b>${floorsCleared.toLocaleString()}階</b></article></div>${rankingRows?`<h3>共闘貢献</h3><div class="return-reward-items">${rankingRows}</div>`:""}<p class="muted">${escapeAttribute(receipt)}</p></div>`;
 app.insertAdjacentHTML("beforeend",Modal("共同探索・結果",body,"オンライン受付へ戻る"));const modal=topModal(),finish=()=>modal?.remove();modal.classList.add("return-result-modal-v2");modal._onDismiss=finish;modal.querySelector("[data-modal-primary]").onclick=finish;return modal
}
function showOnlineExpeditionResult(result,context={}){
 if(context?.defeat)return showOnlineExpeditionDefeatResult(context.defeat);
 if(result&&Array.isArray(result.equipment))return showManualReturnResult(result,{title:"共同探索・帰還報告",primaryLabel:"オンライン受付へ戻る",onClose:()=>{}});
 return showOnlineExpeditionSummary(context)
}
function showManualReturnResult(result,{title="探索帰還報告",primaryLabel="拠点へ戻る",onClose=null}={}){
 const guide=contextualGuideState();bumpGuideCounter(guide,"returns");if(!contextGuideDone("first_return")){completeGuideStep(guide,"first_return");if(save.state.gacha?.firstTenUsed){completeGuideStep(guide,"starter_gacha_open");completeGuideStep(guide,"starter_gacha_pull")}else setGuidePending(guide,"starterGacha",true);save.save()}
 const best=result.equipment.reduce((a,x)=>!a||(RARITY_ORDER[equipmentDisplayRarity(x.item)]??0)>(RARITY_ORDER[equipmentDisplayRarity(a.item)]??0)?x:a,null);
 const equipmentRows=result.equipment.length?result.equipment.map(({item,receipt})=>`<div class="return-reward-item rarity-${equipmentDisplayRarity(item)}"><span>${pixelIcon("equipment")}</span><div><b>[${equipmentDisplayRarity(item)}] ${item.name}</b><small>${receipt.message}</small></div></div>`).join(""):'<p class="muted return-no-drop">今回は装備ドロップなし</p>';
 const bestRarity=best?equipmentDisplayRarity(best.item):null;
 const highlight=best&&(RARITY_ORDER[bestRarity]??0)>=RARITY_ORDER.SSR?`<div class="return-reward-highlight rarity-${bestRarity}"><small>RARE DROP</small><strong>${bestRarity}</strong><span>${best.item.name}</span></div>`:"";
 const grade=returnRewardGrade(result.floorsCleared,result.equipment);
 const body=`<div class="return-reward-report return-reward-v2">
  <div class="return-result-embers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>${highlight}${returnGradeBadge(grade)}
  <div class="return-floor-progress"><header><span>${result.startFloor}階</span><small>踏破経路</small><strong>${result.endFloor}階</strong></header><i><u></u></i></div>
  <div class="return-result-summary">
   <article>${pixelIcon("dungeon")}<small>踏破階層</small><b data-count-to="${result.floorsCleared}" data-count-suffix="階">0階</b></article>
   <article>${pixelIcon("coin")}<small>獲得GOLD</small><b data-count-to="${result.gold}" data-count-suffix="G">0G</b></article>
   <article>${pixelIcon("equipment")}<small>装備獲得</small><b data-count-to="${result.equipment.length}" data-count-suffix="個">0個</b></article>
  </div>
  <h3>獲得装備</h3><div class="return-reward-items">${equipmentRows}</div>${returnRarityTable()}
 </div>`;
 app.insertAdjacentHTML("beforeend",Modal(title,body,primaryLabel));
 const modal=topModal();modal.classList.add("return-result-modal-v2");countUpReturnValues(modal);
 let closed=false,finish=()=>{if(closed)return;closed=true;modal?.remove();if(typeof onClose==="function")onClose();else go("home")};
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
  save.state.player.inRun=false;cancelPendingExploreActions();settleAbandonedCampaignHeroPursuit("manual-return");stopGame();activeEnemy=null;battle=null;delete save.state.activeBattle;snapshot=null;clearExpeditionSnapshot({settleHeroPursuit:false});const result=claimManualReturn(save.state);delete save.state.expeditionAffectionDeaths;save.save();modal.remove();showManualReturnResult(result);
 };
}
function syncMiniMapBackingStore(map=document.getElementById("miniMap")){
 if(!map)return false;const rect=map.getBoundingClientRect(),style=getComputedStyle(map),cssWidth=Math.max(1,rect.width||parseFloat(style.width)||172),cssHeight=Math.max(1,rect.height||parseFloat(style.height)||cssWidth),density=currentExplorePerformanceProfile().pixelRatio,width=Math.max(1,Math.round(cssWidth*density)),height=Math.max(1,Math.round(cssHeight*density));
 if(map.width===width&&map.height===height)return false;map.width=width;map.height=height;return true
}
let campaignStoryQueueTimer=null,campaignStoryPresenting=false,campaignStoryRequestedFloor=null,campaignStoryCompletionCallback=null;
function orderedCampaignStoryCharacters(scene){
 const preferred=scene.kind==="opening"||scene.storyPart==="report"?["lionel","sairan"]:HERO_PARTY_IDS,order=new Map(preferred.map((id,index)=>[id,index]));
 return[...(scene.characters??[])].sort((left,right)=>(order.get(left?.id)??99)-(order.get(right?.id)??99))
}
function campaignStoryCharacterArt(character){
 const portrait=character?.portrait??{},speciesId=String(portrait.speciesId??character?.id??""),subject={speciesId,visualSpeciesId:speciesId,customVisualAsset:portrait.asset??null};
 const original=monsterVisual(subject,"人物",{frame:"idle1",className:"campaign-story-character-art"});
 if(character?.id!=="lionel")return original;
 const avatar=monsterVisual({speciesId:"slime",nickname:"リオネル",storyIdentity:"lionel-avatar"},"リオネル",{frame:"idle1",className:"campaign-story-lionel-slime-art"});
 return`<span class="campaign-story-lionel-human">${original}</span><span class="campaign-story-lionel-avatar" aria-hidden="true">${avatar}</span>`
}
function campaignStoryPresentationBody(scene){
 const progress=Math.max(0,Math.min(100,Number(scene.routeProgress)||0)),castleScale=(.52+progress*.0052).toFixed(3),castleOpacity=(.12+progress*.0075).toFixed(3),background=escapeAttribute(scene.backgroundAsset??"./assets/ui/trials/abyss-corridor-room.png"),characters=orderedCampaignStoryCharacters(scene),cast=characters.map((character,index)=>`<figure data-story-character-id="${escapeAttribute(character.id)}" class="${character.id==="sairan"?"is-right":""}" style="--story-character-order:${index}"><i>${campaignStoryCharacterArt(character)}</i><figcaption>${escapeAttribute(character.name)}</figcaption></figure>`).join("");
 const heading=scene.title??(scene.kind==="opening"?"予言の十日間":`予言 ${scene.day}日目`),eyebrow=scene.eyebrow??(scene.kind==="opening"?"PROLOGUE / 魔王城":"HEROES ON THE ROAD"),route=scene.kind==="opening"?`<div class="campaign-story-countdown"><span>予言の日まで</span><b>残り10日</b></div>`:scene.routeHidden?"":`<div class="campaign-story-route"><span>西の大陸</span><i role="progressbar" aria-label="魔王城への進軍度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><em style="width:${progress}%"></em></i><b>魔王城</b></div>`;
 return`<section class="campaign-story-presentation variant-${escapeAttribute(scene.variant??"default")}" data-story-kind="${escapeAttribute(scene.kind)}" data-story-track="${escapeAttribute(scene.storyTrack??"campaign")}" data-story-part="${escapeAttribute(scene.storyPart??"")}" style="--story-backdrop:url('${background}');--story-progress:${progress}%;--story-castle-scale:${castleScale};--story-castle-opacity:${castleOpacity}"><header><small>${escapeAttribute(eyebrow)}</small><h3>${escapeAttribute(heading)}</h3><b>${escapeAttribute(scene.location??"")}</b><p>${escapeAttribute(scene.summary??"")}</p></header>${route}<div class="campaign-story-stage"><div class="campaign-story-scenery" aria-hidden="true"><i></i><u></u></div><div class="campaign-story-cast" data-story-cast>${cast}</div><article class="campaign-story-dialogue" data-story-dialogue aria-live="polite"><small data-story-speaker-title></small><b data-story-speaker></b><p data-story-text></p></article></div><nav class="campaign-story-line-progress" data-story-line-progress aria-label="会話の進行"></nav></section>`
}
function showCampaignStoryScene(scene){
 if(!scene||campaignStoryPresenting)return false;
 clearContextGuide();
 const campaign=normalizeCampaignState(save.state),branchStory=scene.storyTrack==="hero-encounter",ledgerKey=branchStory?"heroEncounters310":"story309",hadStory=Object.prototype.hasOwnProperty.call(campaign,ledgerKey),storyBefore=hadStory?(typeof structuredClone==="function"?structuredClone(campaign[ledgerKey]):JSON.parse(JSON.stringify(campaign[ledgerKey]))):null,hadArchive=Object.prototype.hasOwnProperty.call(campaign,"storyArchive324"),archiveBefore=hadArchive?(typeof structuredClone==="function"?structuredClone(campaign.storyArchive324):JSON.parse(JSON.stringify(campaign.storyArchive324))):null,seenAt=new Date().toISOString(),receipt=branchStory?acknowledgeCampaignHeroBranchStoryScene(campaignHeroLedger(),{sceneId:scene.id}):acknowledgeCampaignStoryScene(save.state,scene.id,{seenAt});
 if(branchStory)campaign.heroEncounters310=receipt.state;
 const archived=receipt.recorded?recordCampaignStoryArchiveScene(save.state,scene,{seenAt}):{recorded:false};if(!receipt.recorded||!archived.recorded||!save.save()){if(hadStory)campaign[ledgerKey]=storyBefore;else delete campaign[ledgerKey];if(hadArchive)campaign.storyArchive324=archiveBefore;else delete campaign.storyArchive324;if(receipt.recorded)showToast("物語の記録を保存できませんでした");return false}
 campaignStoryPresenting=true;const resumeRunningGame=Boolean(game?.running&&!game.paused);if(game?.running)game.paused=true;
 app.insertAdjacentHTML("beforeend",Modal(scene.modalTitle??(scene.kind==="opening"?"序章":branchStory?"勇者遭遇・分岐":"勇者一行の道中"),campaignStoryPresentationBody(scene),"次へ"));
 const modal=topModal(),primary=modal.querySelector("[data-modal-primary]"),dialogue=Array.isArray(scene.dialogue)&&scene.dialogue.length?scene.dialogue:[{speakerId:null,text:scene.summary??"物語は次の章へ進んだ。",tone:"narration"}],castCharacters=orderedCampaignStoryCharacters(scene),characters=new Map((scene.characters??[]).map(character=>[character.id,character])),castIndex=new Map(castCharacters.map((character,index)=>[character.id,index]));let lineIndex=0,closed=false,autoTimer=null;
 modal.classList.add("campaign-story-modal");modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");primary.insertAdjacentHTML("beforebegin",'<button type="button" class="campaign-story-skip" data-story-skip>この場面をスキップ</button>');
 const clearAuto=()=>{if(autoTimer){clearTimeout(autoTimer);autoTimer=null}},finish=({continueQueue=true}={})=>{if(closed)return;closed=true;clearAuto();modal.remove();campaignStoryPresenting=false;if(resumeRunningGame&&game?.running&&!document.querySelector(".game-modal")){game.paused=false;if(exploreAutoActive())requestAnimationFrame(applyExploreAutoPath)}if(continueQueue||campaignStoryCompletionCallback)queueCampaignStoryScenes({delay:260})},scheduleAuto=()=>{clearAuto();if(scene.id===CAMPAIGN_STORY_OPENING_ID||branchStory||!exploreAutoActive())return;autoTimer=setTimeout(()=>{if(!modal.isConnected)return;lineIndex<dialogue.length-1?advance():finish()},2400)},renderLine=()=>{const line=dialogue[lineIndex]??dialogue[0],speaker=characters.get(line.speakerId),box=modal.querySelector("[data-story-dialogue]"),speakerIndex=castIndex.get(line.speakerId),presentation=modal.querySelector(".campaign-story-presentation");if(line.stageEffect)presentation.dataset.storyEffect=line.stageEffect;box.className=`campaign-story-dialogue tone-${String(line.tone??"normal").replace(/[^a-z-]/gi,"")||"normal"}${speaker?"":" is-narration"}`;if(speaker&&Number.isInteger(speakerIndex)&&castCharacters.length)box.style.setProperty("--story-speaker-x",`${(speakerIndex+.5)*100/castCharacters.length}%`);else box.style.removeProperty("--story-speaker-x");box.querySelector("[data-story-speaker-title]").textContent=speaker?.title??(speaker?"":"NARRATION");box.querySelector("[data-story-speaker]").textContent=speaker?.name??"語り";box.querySelector("[data-story-text]").textContent=String(line.text??"");modal.querySelectorAll("[data-story-character-id]").forEach(node=>node.classList.toggle("is-speaking",Boolean(line.speakerId)&&node.dataset.storyCharacterId===line.speakerId));const progress=modal.querySelector("[data-story-line-progress]");progress.innerHTML=dialogue.map((_,index)=>`<i class="${index===lineIndex?"current":index<lineIndex?"passed":""}"></i>`).join("");primary.textContent=lineIndex===dialogue.length-1?(scene.completeLabel??(scene.kind==="opening"?"第一階へ進む":"探索を続ける")):"次の会話";scheduleAuto()},advance=()=>{clearAuto();if(lineIndex<dialogue.length-1){lineIndex++;renderLine();return}finish()};
 modal._onDismiss=()=>finish({continueQueue:false});primary.onclick=advance;modal.querySelector("[data-story-skip]").onclick=()=>finish({continueQueue:false});modal.addEventListener("keydown",event=>{if(["ArrowRight","Enter"," "].includes(event.key)&&event.target===modal){event.preventDefault();advance()}});renderLine();requestAnimationFrame(()=>primary.focus());return true
}
function showCampaignStoryReplaySequence(sourceScenes,index=0){
 const scenes=(Array.isArray(sourceScenes)?sourceScenes:[]).filter(scene=>scene&&Array.isArray(scene.dialogue));if(campaignStoryPresenting||!scenes[index])return false;const scene=scenes[index],resumeRunningGame=Boolean(game?.running&&!game.paused);campaignStoryPresenting=true;if(game?.running)game.paused=true;
 const replayTitle=scene.kind==="opening"?"序章・回想":scene.storyPart==="report"?"魔王軍・回想":"勇者一行・回想";app.insertAdjacentHTML("beforeend",Modal(replayTitle,campaignStoryPresentationBody(scene),"次へ"));const modal=topModal(),primary=modal.querySelector("[data-modal-primary]"),dialogue=scene.dialogue.length?scene.dialogue:[{speakerId:null,text:scene.summary??"記録は静かに閉じられた。",tone:"narration"}],castCharacters=orderedCampaignStoryCharacters(scene),characters=new Map((scene.characters??[]).map(character=>[character.id,character])),castIndex=new Map(castCharacters.map((character,castIndex)=>[character.id,castIndex]));let lineIndex=0,closed=false;
 modal.classList.add("campaign-story-modal","is-story-replay");modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");primary.insertAdjacentHTML("beforebegin",'<button type="button" class="campaign-story-skip" data-story-replay-close>回想を閉じる</button>');
 const finish=({continueSequence=true}={})=>{if(closed)return;closed=true;modal.remove();campaignStoryPresenting=false;if(resumeRunningGame&&game?.running&&!document.querySelector(".game-modal"))game.paused=false;if(continueSequence&&index<scenes.length-1)setTimeout(()=>showCampaignStoryReplaySequence(scenes,index+1),0)},renderLine=()=>{const storyLine=dialogue[lineIndex]??dialogue[0],speaker=characters.get(storyLine.speakerId),box=modal.querySelector("[data-story-dialogue]"),speakerIndex=castIndex.get(storyLine.speakerId),presentation=modal.querySelector(".campaign-story-presentation");if(storyLine.stageEffect)presentation.dataset.storyEffect=storyLine.stageEffect;box.className=`campaign-story-dialogue tone-${String(storyLine.tone??"normal").replace(/[^a-z-]/gi,"")||"normal"}${speaker?"":" is-narration"}`;if(speaker&&Number.isInteger(speakerIndex)&&castCharacters.length)box.style.setProperty("--story-speaker-x",`${(speakerIndex+.5)*100/castCharacters.length}%`);else box.style.removeProperty("--story-speaker-x");box.querySelector("[data-story-speaker-title]").textContent=speaker?.title??(speaker?"":"NARRATION");box.querySelector("[data-story-speaker]").textContent=speaker?.name??"語り";box.querySelector("[data-story-text]").textContent=String(storyLine.text??"");modal.querySelectorAll("[data-story-character-id]").forEach(node=>node.classList.toggle("is-speaking",Boolean(storyLine.speakerId)&&node.dataset.storyCharacterId===storyLine.speakerId));modal.querySelector("[data-story-line-progress]").innerHTML=dialogue.map((_,line)=>`<i class="${line===lineIndex?"current":line<lineIndex?"passed":""}"></i>`).join("");primary.textContent=lineIndex===dialogue.length-1?(index<scenes.length-1?"次の場面":"回想へ戻る"):"次の会話"},advance=()=>{if(lineIndex<dialogue.length-1){lineIndex++;renderLine();return}finish()};
 modal._onDismiss=()=>finish({continueSequence:false});primary.onclick=advance;modal.querySelector("[data-story-replay-close]").onclick=()=>finish({continueSequence:false});modal.addEventListener("keydown",event=>{if(["ArrowRight","Enter"," "].includes(event.key)&&event.target===modal){event.preventDefault();advance()}});renderLine();requestAnimationFrame(()=>primary.focus());return true
}
function queueCampaignStoryScenes({clearedFloor=null,delay=180,onComplete=null}={}){
 if(Number.isFinite(Number(clearedFloor)))campaignStoryRequestedFloor=Math.max(Number(campaignStoryRequestedFloor)||0,Math.floor(Number(clearedFloor)));
 if(typeof onComplete==="function")campaignStoryCompletionCallback=onComplete;
 if(campaignStoryPresenting)return;if(campaignStoryQueueTimer)clearTimeout(campaignStoryQueueTimer);
 const attempt=()=>{campaignStoryQueueTimer=null;if(campaignStoryPresenting||battle||document.querySelector(".battle-screen"))return;if(!["home","explore"].includes(screen))return;if(document.querySelector(".game-modal")){campaignStoryQueueTimer=setTimeout(attempt,420);return}const options=campaignStoryRequestedFloor==null?{}:{clearedFloor:campaignStoryRequestedFloor},scene=nextCampaignStoryScene(save.state,options)??nextCampaignHeroBranchStoryScene(campaignHeroLedger(),{floor:save.state.player.currentFloor});if(!scene){campaignStoryRequestedFloor=null;const complete=campaignStoryCompletionCallback;campaignStoryCompletionCallback=null;if(complete)complete();setTimeout(scheduleContextGuide,80);return}if(!showCampaignStoryScene(scene))campaignStoryQueueTimer=setTimeout(attempt,900)};
 campaignStoryQueueTimer=setTimeout(attempt,Math.max(0,Number(delay)||0))
}
function bindExplore(){
 ensureSecretRoomExpedition(save.state);recordBiomeFloor(save.state,save.state.player.currentFloor);save.save();
 explorationTexture("floor");explorationTexture("wall");explorationTexture("stairs");explorationTexture("props");
 if(save.state.player.currentFloor>=70&&!save.state.flags.secondWorldEntered){markSecondWorldEntered(save.state);save.save()}
 animateExploreCombatPower();
 const canvas=document.getElementById("gameCanvas"),r=canvas.getBoundingClientRect(),performanceProfile=currentExplorePerformanceProfile(),d=performanceProfile.pixelRatio;
 canvas.width=r.width*d;canvas.height=r.height*d;
 const mini=document.getElementById("miniMap");syncMiniMapBackingStore(mini);
 if(!snapshot)snapshot=hydrateExpeditionSnapshot(save.state.expeditionSnapshot);
 game=snapshot??{world:maze(),player:null,camera:null,paused:false,running:true,input:createInputState()};
 ensureExploreDecorations(game.world);ensureFirstTutorialPickup(game.world);
 game.performanceProfile=performanceProfile;game.lastPaintAt=0;game.lastMiniMapPaintAt=0;game.lastTutorialMarkerAt=0;
 game.input=createInputState();game.player??=new Entity(game.world.start.x,game.world.start.y);game.world.encountering=false;game.player.path=[];game.player.p=0;game.partyTrail=Array.isArray(game.partyTrail)&&game.partyTrail.length?game.partyTrail:[{x:game.player.rx??game.player.x,y:game.player.ry??game.player.y}];
 if(!Number.isFinite(game.player.x)||!Number.isFinite(game.player.y)){game.player.x=game.world.start.x;game.player.y=game.world.start.y}
 game.player.rx=game.player.x;game.player.ry=game.player.y;game.camera=new Camera(canvas);
 if(snapshot?.cameraData)Object.assign(game.camera,snapshot.cameraData);else game.camera.reset(game.player.x*TILE,game.player.y*TILE);
 game.camera.clamp(game.world);game.ctx=canvas.getContext("2d");game.running=true;game.paused=false;game.world.heroStepsSinceBattle=Math.max(0,Number(game.world.heroStepsSinceBattle)||0);const heroLedger=campaignHeroLedger(),activeHeroId=heroLedger.activeEncounterId,pursuit=game.world.campaignHeroPursuit,pursuitEvent=heroLedger.events?.[pursuit?.encounterId];if(pursuit&&(pursuit.encounterId!==activeHeroId||pursuitEvent?.status!=="active"||pursuitEvent?.heroId!==pursuit.heroId))game.world.campaignHeroPursuit=null;else if(pursuit)repairCampaignHeroPursuit(pursuit);const resumableHeroBattle=campaignHeroCheckpointResumable(save.state.activeBattle,heroLedger);if(activeHeroId&&!game.world.campaignHeroPursuit&&!resumableHeroBattle){if(save.state.activeBattle?.specialBattleType==="campaignHero")delete save.state.activeBattle;settleAbandonedCampaignHeroPursuit("orphan-recovery");save.save()}revealCampaignArea();syncExploreSectionPresentation();bindInput(canvas);game.last=performance.now();requestAnimationFrame(loop);requestAnimationFrame(refreshCampaignHeroChaseHud);
 if(typeof ResizeObserver!=="undefined"){game.miniMapResizeObserver?.disconnect?.();game.miniMapResizeObserver=new ResizeObserver(()=>syncMiniMapBackingStore(mini));game.miniMapResizeObserver.observe(document.querySelector(".explore-stage")??mini);game.miniMapResizeObserver.observe(mini)}
 const elapsed=document.querySelector("[data-explore-elapsed]");
 if(elapsed){
  const startedAt=Number(elapsed.dataset.startedAt)||Date.now(),tickElapsed=()=>{const seconds=Math.floor(Math.max(0,Date.now()-startedAt)/1000),hours=Math.floor(seconds/3600),minutes=Math.floor(seconds/60)%60,rest=seconds%60;elapsed.textContent=`${hours?`${String(hours).padStart(2,"0")}:`:""}${String(minutes).padStart(2,"0")}:${String(rest).padStart(2,"0")}`};
  tickElapsed();game.elapsedTimer=setInterval(tickElapsed,1000);
 }
 bindMovableMapToggle();bindExploreMonsterLongPress();updateExploreAutoToggleState();if(save.state.settings.exploreAutoMode!=="off")requestAnimationFrame(applyExploreAutoPath);requestAnimationFrame(scheduleContextGuide);if(game.world.postBossRevealPending){game.world.postBossRevealPending=false;persistExpeditionSnapshot(expeditionSnapshotFromGame(),{saveNow:false});setTimeout(showPostBossFieldUnlocks,240)}if(game.world.treasureRoom&&!game.world.treasureNoticeShown){game.world.treasureNoticeShown=true;game.paused=true;setTimeout(()=>{pauseModal("💰 宝物庫を発見",`<p>部屋中に上質な宝箱が並んでいる。</p><p class="muted">ミミックは少数だけ潜む。鍵付き宝箱からは必ず神話装備が手に入る。</p>`);},420)}
 document.getElementById("toggleExplorePartyHud")?.addEventListener("click",()=>{save.state.settings.explorePartyHudCollapsed=!save.state.settings.explorePartyHudCollapsed;save.save();snapshot=currentSnapshot();stopGame();render()});
 document.getElementById("centerCamera").onclick=()=>{game.camera.reset(game.player.rx*TILE,game.player.ry*TILE);game.camera.clamp(game.world);queueExpeditionCheckpoint()};
 document.getElementById("pauseParty").onclick=()=>{snapshot=currentSnapshot();stopGame();formationOrigin="explore";go("formation")};
 document.getElementById("resourceHelp")?.addEventListener("click",openResourceHelp);
 document.getElementById("fieldEquipment").onclick=()=>{snapshot=currentSnapshot();stopGame();navigationOrigin="explore";go("equipment")};
 document.getElementById("pauseItems").onclick=openFieldItems;
 document.getElementById("returnHome").onclick=openManualReturnConfirmation;
}

function campaignHeroPartyHpRate(){const members=explorationPartyMembers();if(!members.length)return 0;return members.reduce((sum,monster)=>sum+Math.max(0,Number(monster.currentHp)||0)/Math.max(1,calculatedStats(monster).hp),0)/members.length}
function campaignHeroSectionCells(section){return(section?.cellKeys??[]).map(key=>{const[x,y]=String(key).split(",").map(Number);return{x,y}}).filter(point=>Number.isFinite(point.x)&&Number.isFinite(point.y)&&game?.world?.tiles?.[point.y]?.[point.x]===0)}
function campaignHeroSpawnPoint(section,{near=false}={}){const cells=campaignHeroSectionCells(section),player=game.player,candidates=cells.map(point=>({...point,distance:Math.abs(point.x-player.x)+Math.abs(point.y-player.y),route:path(game.world,point,player)})).filter(entry=>entry.route.length&&entry.distance>=(near?3:6));candidates.sort((a,b)=>near?a.distance-b.distance:b.distance-a.distance);return candidates[Math.min(candidates.length-1,Math.floor(Math.random()*Math.min(6,candidates.length)))]??cells[0]??{x:player.x,y:player.y}}
function repairCampaignHeroPursuit(pursuit){
 if(!pursuit||!game?.world)return false;const x=Math.round(Number(pursuit.x)),y=Math.round(Number(pursuit.y)),key=`${x},${y}`,actualSectionId=Number.isFinite(x)&&Number.isFinite(y)&&game.world.tiles?.[y]?.[x]===0?game.world.sectionByCell?.[key]:null,actualSection=game.world.sections?.find(section=>section.id===actualSectionId);if(actualSection){pursuit.x=x;pursuit.y=y;pursuit.rx=x;pursuit.ry=y;pursuit.sectionId=actualSection.id;return false}const section=activeExploreSection()??game.world.sections?.[0],point=campaignHeroSpawnPoint(section,{near:pursuit.heroId==="myth_rion"});pursuit.x=point.x;pursuit.y=point.y;pursuit.rx=point.x;pursuit.ry=point.y;pursuit.sectionId=section?.id??game.world.currentSectionId;pursuit.portalGraceSteps=Math.max(1,Number(pursuit.portalGraceSteps)||0);return true
}
function campaignHeroTouchesPlayer(pursuit){return Boolean(pursuit&&pursuit.sectionId===game?.world?.currentSectionId&&pursuit.x===game?.player?.x&&pursuit.y===game?.player?.y)}
function showCampaignHeroFieldReveal(heroId){
 const stage=document.querySelector(".explore-stage"),name=campaignHeroName(heroId);if(!stage)return;stage.querySelector(".campaign-hero-field-reveal")?.remove();const reveal=document.createElement("div");reveal.className="campaign-hero-field-reveal";reveal.setAttribute("aria-live","assertive");reveal.innerHTML=`<span class="campaign-hero-field-reveal-lines" aria-hidden="true"></span><span class="campaign-hero-field-reveal-portrait">${monsterVisual({speciesId:heroId,visualSpeciesId:heroId},name,{className:"campaign-hero-field-reveal-visual"})}</span><span class="campaign-hero-field-reveal-copy"><small>WARNING / INTRUDER</small><b>勇者接近</b><strong>${escapeAttribute(name)}</strong><em>こちらを発見した</em></span>`;stage.appendChild(reveal);requestAnimationFrame(()=>reveal.classList.add("is-visible"));setTimeout(()=>{reveal.classList.remove("is-visible");setTimeout(()=>reveal.remove(),360)},1350)
}
function refreshCampaignHeroChaseHud(){
 const stage=document.querySelector(".explore-stage"),pursuit=game?.world?.campaignHeroPursuit;if(!stage)return;if(!pursuit||pursuit.state==="resolved"){stage.classList.remove("is-hero-hunt");delete stage.dataset.heroHuntState;stage.querySelectorAll(".campaign-hero-chase-hud,.campaign-hero-edge-chip").forEach(node=>node.remove());return}
 const heroId=pursuit.heroId,name=campaignHeroName(heroId),record=campaignHeroLedger().heroes?.[heroId],percent=Math.round(Math.max(0,Math.min(1,record?.remainingHpRate??1))*100),profile=CAMPAIGN_HERO_PROFILES[heroId]?.field??{},maxSteps=Math.max(12,Number(profile.maxPursuitPlayerSteps)||24),chaseSteps=Math.max(0,Number(pursuit.chaseSteps)||0),sameSection=pursuit.sectionId===game?.world?.currentSectionId,distance=sameSection?Math.abs(pursuit.x-game.player.x)+Math.abs(pursuit.y-game.player.y):null,stateLabel=pursuit.state==="observing"?"索敵中":pursuit.state==="contact"?"接触":"追跡中";stage.classList.add("is-hero-hunt");stage.dataset.heroHuntState=pursuit.state;let hud=stage.querySelector(".campaign-hero-chase-hud");if(!hud){hud=document.createElement("div");hud.className="campaign-hero-chase-hud is-discovered";stage.appendChild(hud)}hud.classList.toggle("is-tracking",pursuit.state==="pursuing");hud.classList.toggle("is-contact",pursuit.state==="contact");hud.classList.toggle("is-observing",pursuit.state==="observing");hud.innerHTML=`<span class="campaign-hero-chase-portrait">${monsterVisual({speciesId:heroId,visualSpeciesId:heroId},name,{className:"campaign-hero-chase-visual"})}</span><span class="campaign-hero-chase-copy"><small>HERO HUNT / ${stateLabel}</small><b>${escapeAttribute(name)}</b><em>${pursuit.state==="observing"?"まだ位置は悟られていない":pursuit.state==="contact"?"戦闘圏内へ侵入":"こちらへ迫っている"}</em></span><span class="campaign-hero-chase-state"><b>${distance==null?"別区画":`距離 ${distance}`}</b><small>追跡 ${Math.min(chaseSteps,maxSteps)}/${maxSteps}</small><i class="campaign-hero-chase-timer" style="--hero-chase:${Math.min(100,Math.round(chaseSteps/maxSteps*100))}%"><i></i></i><small>残存HP ${percent}%</small><i class="campaign-hero-wound-meter" style="--hero-hp:${percent}%"><i></i></i></span>`;
 const canvas=game.canvas,screenPoint=game.camera.world(pursuit.rx*TILE,pursuit.ry*TILE),inside=pursuit.sectionId===game.world.currentSectionId&&screenPoint.x>16&&screenPoint.y>16&&screenPoint.x<canvas.width-16&&screenPoint.y<canvas.height-16;stage.querySelector(".campaign-hero-edge-chip")?.remove();if(!inside){const chip=document.createElement("span"),dx=pursuit.x-game.player.x,dy=pursuit.y-game.player.y,direction=Math.abs(dx)>Math.abs(dy)?dx>0?"east":"west":dy>0?"south":"north";chip.className=`campaign-hero-edge-chip is-${direction} is-tracking`;chip.innerHTML=monsterVisual({speciesId:heroId,visualSpeciesId:heroId},name,{className:"campaign-hero-edge-visual"});stage.appendChild(chip)}
}
function armCampaignHeroEncounter(){
 if(game?.online||game?.world?.campaignHeroPursuit||game?.world?.bossDefeated)return false;const floor=save.state.player.currentFloor,floorState=campaignFloorState(save.state,floor),encounterRoll=seeded((floorSeed(floor)^0x3190a11)>>>0)(),candidate=scheduledCampaignHeroForFloor(campaignHeroLedger(),{floor,encounterRoll,online:false,bossDefeated:Boolean(floorState.bossDefeated),postBoss:Boolean(game.world.bossDefeated),modalOpen:Boolean(document.querySelector(".game-modal")),battleOpen:Boolean(battle),visitedSections:new Set(game.world.discoveredSections??[]).size,stepsSinceBattle:Number(game.world.heroStepsSinceBattle)||0,partyHpRate:campaignHeroPartyHpRate()});if(!candidate)return false;
 const activated=beginCampaignHeroFieldEncounter(campaignHeroLedger(),{...candidate,floor});if(!activated.activated)return false;normalizeCampaignState(save.state).heroEncounters310=activated.state;const section=activeExploreSection(),point=campaignHeroSpawnPoint(section),profile=CAMPAIGN_HERO_PROFILES[candidate.heroId]?.field??{};game.world.campaignHeroPursuit={encounterId:candidate.id,heroId:candidate.heroId,state:profile.initialState??"pursuing",x:point.x,y:point.y,rx:point.x,ry:point.y,sectionId:section.id,observeSteps:Math.max(0,Number(profile.observePlayerSteps)||0),chaseSteps:0,portalTransfers:0,portalGraceSteps:1,revealed:true};game.world.nextEncounter=Number.MAX_SAFE_INTEGER;const voice=campaignHeroVoiceLine(candidate.heroId,"spotted",{cycle:candidate.cycle});showCampaignHeroFieldReveal(candidate.heroId);showExploreNotice(`${campaignHeroName(candidate.heroId)}「${voice}」――逃げ切るか、迎え撃て`,"warning",{live:true});audio.sfx?.("boss");persistExpeditionSnapshot(expeditionSnapshotFromGame());refreshCampaignHeroChaseHud();return true
}
function resolveEscapedCampaignHeroPursuit(){const pursuit=game?.world?.campaignHeroPursuit;if(!pursuit)return false;const resultId=`${pursuit.encounterId}:field-escape:${save.state.player.currentFloor}`,settled=settleCampaignHeroEncounter(campaignHeroLedger(),{encounterId:pursuit.encounterId,resultId,heroId:pursuit.heroId,outcome:"escaped",floor:save.state.player.currentFloor});queueCampaignHeroAftermath(settled.state,{encounterId:pursuit.encounterId,outcome:"escaped",floor:save.state.player.currentFloor,heroHpRate:settled.hero?.remainingHpRate??1});const voice=campaignHeroVoiceLine(pursuit.heroId,"retreated",{cycle:campaignHeroEncounterCycle(pursuit.encounterId)}),name=campaignHeroName(pursuit.heroId);game.world.campaignHeroPursuit=null;game.world.nextEncounter=(Number(game.world.steps)||0)+8;showExploreNotice(`${name}「${voice}」――勇者の気配が遠ざかった`,"info",{live:true});persistExpeditionSnapshot(expeditionSnapshotFromGame());refreshCampaignHeroChaseHud();queueCampaignStoryScenes({delay:260});return true}
function updateCampaignHeroPursuitOnStep(){
 const pursuit=game?.world?.campaignHeroPursuit;if(!pursuit){armCampaignHeroEncounter();return false}const profile=CAMPAIGN_HERO_PROFILES[pursuit.heroId]?.field??{};pursuit.chaseSteps=(Number(pursuit.chaseSteps)||0)+1;if(campaignHeroTouchesPlayer(pursuit)){pursuit.state="contact";refreshCampaignHeroChaseHud();beginCampaignHeroContactBattle(pursuit);return true}if(pursuit.chaseSteps>=Math.max(12,Number(profile.maxPursuitPlayerSteps)||24)){resolveEscapedCampaignHeroPursuit();return false}if(pursuit.portalGraceSteps>0){pursuit.portalGraceSteps--;refreshCampaignHeroChaseHud();return false}if(pursuit.observeSteps>0){pursuit.observeSteps--;pursuit.state="observing";refreshCampaignHeroChaseHud();return false}pursuit.state="pursuing";
 const playerPath=game.player.path??[],ahead=pursuit.heroId==="myth_rion"?Math.min(playerPath.length-1,3):pursuit.heroId==="myth_yori"?Math.min(playerPath.length-1,1):-1,target=ahead>=0?playerPath[ahead]:game.player,distance=Math.abs(pursuit.x-game.player.x)+Math.abs(pursuit.y-game.player.y),enamiHunts=Object.values(campaignHeroLedger().heroes??{}).some(hero=>hero.heroId!==pursuit.heroId&&(1-hero.remainingHpRate)>=.2);if(pursuit.heroId==="myth_enami"&&!enamiHunts&&distance>3){pursuit.state="observing";refreshCampaignHeroChaseHud();return false}
 const route=path(game.world,pursuit,target),moves=1+(pursuit.heroId==="myth_hide"&&pursuit.chaseSteps%4===0?1:0);for(const step of route.slice(0,moves)){pursuit.x=step.x;pursuit.y=step.y;pursuit.rx=step.x;pursuit.ry=step.y}if(campaignHeroTouchesPlayer(pursuit)){pursuit.state="contact";refreshCampaignHeroChaseHud();beginCampaignHeroContactBattle(pursuit);return true}refreshCampaignHeroChaseHud();return false
}
function transferCampaignHeroPursuit(section){const pursuit=game?.world?.campaignHeroPursuit;if(!pursuit)return;const point=campaignHeroSpawnPoint(section,{near:pursuit.heroId==="myth_rion"});pursuit.x=point.x;pursuit.y=point.y;pursuit.rx=point.x;pursuit.ry=point.y;pursuit.sectionId=section.id;pursuit.portalTransfers=(Number(pursuit.portalTransfers)||0)+1;pursuit.portalGraceSteps=pursuit.heroId==="myth_hide"?1:2;if(pursuit.portalTransfers>3)resolveEscapedCampaignHeroPursuit();else refreshCampaignHeroChaseHud()}
function beginCampaignHeroContactBattle(pursuit){if(!pursuit||game.world.encountering)return;const enemy=campaignHeroEncounter({heroId:pursuit.heroId,encounterId:pursuit.encounterId})[0];if(!enemy)return resolveEscapedCampaignHeroPursuit();beginEncounter([enemy],{campaignHero:true,heroId:pursuit.heroId,encounterId:pursuit.encounterId,priorVitals:capturePartyVitals()})}

function nearestAutoTarget(candidates){
 if(!candidates.length||!game?.player)return null;
 const current=game.world.currentSectionId??sectionIdAt(game.world,game.player.x,game.player.y);
 return candidates.map(target=>{
  const targetSection=campaignObjectSection(game.world,target);
  if(!game.world.sections?.length||targetSection===current){const route=path(game.world,game.player,target);return{target,route,score:route.length}}
  const sections=sectionRoute(game.world,current,targetSection),portal=portalTowardSection(game.world,current,targetSection),route=portal?path(game.world,game.player,portal):[];return{target,route,portal,score:sections.length*1000+route.length}
 }).filter(entry=>entry.route?.length).sort((a,b)=>a.score-b.score)[0]??null;
}
function explorationPartyNeedsRecovery(){
 return explorationPartyMembers().some(monster=>{const hp=calculatedStats(monster).hp,mp=maxMp(monster);return Number(monster.currentHp??hp)<hp||Number(monster.currentMp??mp)<mp})
}
function fullFloorAutoTargets(){
 const world=game?.world;if(!world)return[];
 const floorState=campaignFloorState(save.state,save.state.player.currentFloor),discovered=new Set(world.discoveredSections??[world.startSectionId]);
 const keys=(world.campaignKeys??[]).filter(entry=>!entry.collected),chests=(world.chests??[]).filter(entry=>!entry.open&&!entry.autoSkipped),unvisited=(world.sections??[]).filter(section=>!discovered.has(section.id)).map(section=>({...section.center,sectionId:section.id,autoSectionTarget:true}));
 const remaining=[...keys,...chests,...unvisited];if(remaining.length)return remaining;
 const bosses=campaignWorldBosses(world).filter(entry=>entry.active!==false);if(bosses.length)return bosses;
 const trophies=campaignWorldTrophyChests(world).filter(entry=>!entry.open);if(trophies.length&&campaignKeysHeld(floorState)>=CAMPAIGN_KEYS_PER_FLOOR)return trophies;
 if(world.hotSpring?.active&&!world.hotSpring.used&&explorationPartyNeedsRecovery())return[world.hotSpring];
 return world.exit?.active!==false&&!world.exit?.locked?[world.exit]:[]
}
function applyExploreAutoPath(){
 if(!game?.running||game.paused||game.world.encountering||save.state.settings.exploreAutoMode==="off"||game.player.path?.length)return;
 const mode=save.state.settings.exploreAutoMode,targets=[];
 if(mode==="floor")targets.push(...fullFloorAutoTargets());
 if(mode==="items"){
  (game.world.chests??[]).filter(entry=>!entry.open&&!entry.autoSkipped).forEach(entry=>targets.push(entry));
  (game.world.campaignKeys??[]).filter(entry=>!entry.collected).forEach(entry=>targets.push(entry));
  campaignWorldTrophyChests(game.world).filter(entry=>!entry.open&&Number(entry.locksOpened||0)<Number(campaignFloorState(save.state,save.state.player.currentFloor)?.keysCollected||0)).forEach(entry=>targets.push(entry));
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
 if(!targets.length)targets.push(campaignWorldBosses(game.world).find(entry=>entry.active!==false)??game.world.exit);
 const best=nearestAutoTarget(targets.filter(Boolean));if(best)game.player.setPath(best.route);else stopExploreAuto("AUTO停止：到達できる進路がありません")
}
function updateExploreAutoToggleState(){
 const button=document.getElementById("exploreAutoToggle");if(!button)return;
 const active=exploreAutoActive();button.classList.toggle("active",active);button.dataset.state=active?"on":"off";button.setAttribute("aria-pressed",String(active));button.setAttribute("aria-label",`自動攻略を${active?"停止":"開始"}`);const label=button.querySelector("[data-explore-auto-state]");if(label)label.textContent=active?"ON":"OFF"
}
function setExploreAutoMode(mode){
 const next=mode==="off"?"off":"floor";save.state.settings.exploreAutoMode=next;save.state.settings.exploreAutoMenuOpen=false;
 if(game?.player){game.player.path=[];game.player.p=0}save.save();updateExploreAutoToggleState();if(next!=="off"&&game?.running)requestAnimationFrame(applyExploreAutoPath);return next
}
function stopExploreAuto(reason=""){
 if(save.state.settings?.exploreAutoMode==="off"){updateExploreAutoToggleState();return}
 setExploreAutoMode("off");if(reason)showExploreNotice(reason);
}
function openResourceHelp(){
 const body=`<div class="dungeon-guide">
  <section><h3>100階・予言の十日間</h3><p>1日10階、全100階。日数は10階ごとの節目を倒した時だけ進み、時間や歩数では減りません。</p><p>各階は4〜6個の独立したダンジョン区画で構成されます。区画ごとに属性が変わり、支配者の居場所も毎回変わります。</p></section>
  <section><h3>鍵・支配者・戦利品</h3><p>各階に落ちている3本の鍵は、上を歩くだけで共有取得します。鍵がなくても支配者とは戦えます。</p><p>撃破後は雑魚が湧かなくなり、3本すべて揃えると戦利品宝箱を一度だけ開けられます。初回は専用神話装備が確定。温泉は一度だけ全回復します。</p></section>
  <section><h3>明かりと発見</h3><p>暗所は部隊の周囲と燭台の灯りで確認できます。階段と燭台は遠くからでも見失わないよう表示されます。</p><p>樽・木箱・骨・魔晶石・水場は触れると調べられます。一度採取した物は、同じ探索中に再読込しても復活しません。</p></section>
  <section><h3>🚪 秘密の入口</h3><p>壁に設けられた入口だけが秘密の裏街へ通じます。見つけた入口には必ず入れますが、探索ごとに出現する階と場所が変わります。</p></section>
  <section><h3>地図と帰還</h3><p>ミニマップボタンと開いた地図は、長押しせずそのままドラッグして好きな位置へ移動できます。</p><p>帰還すると探索中のGOLD・装備などを確定します。帰還前にホームへ直接移動することはできません。</p></section>
  ${attributeHelpSection()}
  <section class="resource-help-list"><h3>資源</h3><p><b>${pixelIcon("coin")} GOLD</b><span>ショップ・装備・育成に使用</span></p><p><b>${pixelIcon("crystal")} 魔晶石</b><span>召喚・戦闘の記憶などに使用</span></p><p><b>${pixelIcon("capture")} 捕獲結晶</b><span>弱らせた魔物の捕獲に使用</span></p><p><b>${pixelIcon("key")} 深淵の鍵</b><span>鍵付き宝箱に使用</span></p></section>
 </div>`;
 app.insertAdjacentHTML("beforeend",Modal("ダンジョン案内",body,"閉じる"));
 topModalButton().onclick=closeTopModal;
}
function attributeHelpSection(){const rows=attributeGuideRows().map(row=>`<p><b>${attributeVisual(row.id,{label:`${ATTRIBUTES[row.id]?.name??row.name}属性`})}${ATTRIBUTES[row.id]?.name??row.name}</b><span><em>攻撃有利 ${row.strong.join("・")||"なし"}</em><i>被攻撃不利 ${row.weak.join("・")||"なし"}</i></span></p>`).join("");return`<section class="attribute-help"><h3>属性相性</h3><small>矢印方向への攻撃は1.25倍、逆方向は0.8倍。光と闇は互いに1.25倍、無属性に相性はありません。</small><section class="attribute-formal-cycle">${attributeCycleVisual()}<b>矢印方向が攻撃有利</b></section><div>${rows}</div></section>`}
function openAttributeHelp(){app.insertAdjacentHTML("beforeend",Modal("属性相性",`<div class="dungeon-guide">${attributeHelpSection()}</div>`,"閉じる"));topModalButton().onclick=closeTopModal}
function openTutorialBook(){
 const guide=contextualGuideState(),progress=contextualGuideProgress(guide),rows=CONTEXT_GUIDE_STEPS.map(step=>`<p class="${guideStepDone(guide,step.id)?"done":""}"><small>${step.group}</small><span>${step.label}</span><em>${guideStepDone(guide,step.id)?"完了":"未完了"}</em></p>`).join("");
 app.insertAdjacentHTML("beforeend",Modal("実践ガイド",`<div class="context-guide-book"><div class="context-guide-summary"><strong>${progress.rate}%</strong><div><b>${progress.completed}/${progress.total} 完了</b><span><i style="width:${progress.rate}%"></i></span><small>${guide.disabled?"自動案内は停止中":"初めての操作だけ、1つずつ案内します"}</small></div></div><div class="context-guide-book-actions"><button type="button" class="primary" data-context-guide-toggle>${guide.disabled?"自動案内を再開":"自動案内を停止"}</button><button type="button" data-context-guide-reset>最初からやり直す</button></div><div class="context-guide-step-list">${rows}</div></div>`,`閉じる`));
 const modal=topModal();modal.querySelector("[data-context-guide-toggle]")?.addEventListener("click",()=>{guide.disabled=!guide.disabled;guide.updatedAt=new Date().toISOString();save.save();modal.remove();clearContextGuide();showToast(guide.disabled?"実践ガイドを停止しました":"実践ガイドを再開しました");render()});modal.querySelector("[data-context-guide-reset]")?.addEventListener("click",()=>{if(!confirm("実践ガイドの進行をすべて未完了へ戻しますか？\nゲームのセーブや所持品は変わりません。"))return;resetContextualGuide(guide,save.state.monsters?.length??1);save.save();modal.remove();showToast("実践ガイドを最初から再開します");render()});modal.querySelector("[data-modal-primary]").onclick=()=>modal.remove()
}
function exploreMonsterDetail(id){const m=save.state.monsters.find(x=>x.id===id);if(!m)return;const sp=SPECIES[m.speciesId],st=calculatedStats(m),need=expNeed(m),remain=Math.max(0,need-m.exp),gear=Object.entries(m.equipment??{}).map(([slot,itemId])=>`${slotLabel(slot)}：${save.state.equipment.find(i=>i.id===itemId)?.name??"なし"}`).join("<br>");app.insertAdjacentHTML("beforeend",Modal(displayName(m),`<div class="explore-detail"><div class="modal-monster-hero">${monsterVisual(m,sp.emoji??"👹",{className:"modal-monster-visual"})}<p><b>Lv.${m.level}　+${m.plus}</b></p></div><p>HP ${m.currentHp??st.hp}/${st.hp}<br>MP ${m.currentMp??maxMp(m)}/${maxMp(m)}<br>ATK ${st.atk} / DEF ${st.def} / SPD ${st.spd}<br>会心 ${st.crit}% / 回避 ${st.evasion}%<br><b>${sp.race}族 / ${sp.role}</b><br>特性：${TRAITS[m.traitId]?.name??"安定"}（${TRAITS[m.traitId]?.description??""}）</p><p><b>EXP ${m.exp.toLocaleString()} / ${need.toLocaleString()}</b><br><small>次のレベルまであと ${remain.toLocaleString()}</small></p><p>${gear}</p><p><b>スキル</b><br>${learnedSkills(m).map(x=>`${x.name}（MP${effectiveSkillMpCost(m,x)}）`).join("<br>")||"なし"}</p></div>`,`閉じる`));topModalButton().onclick=()=>{const mods=document.querySelectorAll(".game-modal");mods[mods.length-1]?.remove()}}
function bindExploreMonsterLongPress(){document.querySelectorAll("[data-explore-monster]").forEach(el=>el.onclick=()=>{
 const id=el.dataset.exploreMonster;if(!save.state.monsters.some(monster=>monster.id===id))return;
 snapshot=currentSnapshot();stopGame();equipmentTarget=id;equipmentFocusItemId=null;navigationOrigin="explore";go("equipment");
})}
function bindMovableMapToggle(){
 const button=document.getElementById("miniMapToggle"),map=document.getElementById("miniMap"),autoButton=document.getElementById("exploreAutoToggle");if(!button||!map)return;
 const stage=button.closest(".explore-stage");if(!stage)return;
 stage.append(button,map);if(autoButton)stage.append(autoButton);
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
   const start={x:event.clientX,y:event.clientY},origin=place(element,save.state.settings[settingKey],fallback);let moved=false,last={...start};element.classList.add("dragging");
   const move=moveEvent=>{last={x:moveEvent.clientX,y:moveEvent.clientY};const dx=last.x-start.x,dy=last.y-start.y;if(Math.hypot(dx,dy)>7)moved=true;place(element,{x:origin.x+dx,y:origin.y+dy},fallback)};
   const finish=upEvent=>{element.removeEventListener("pointermove",move);element.removeEventListener("pointerup",finish);element.removeEventListener("pointercancel",finish);element.classList.remove("dragging");if(Number.isFinite(upEvent.clientX)&&Number.isFinite(upEvent.clientY))last={x:upEvent.clientX,y:upEvent.clientY};const final=place(element,{x:origin.x+last.x-start.x,y:origin.y+last.y-start.y},fallback);if(moved){save.state.settings[settingKey]=final;save.save();suppressClick=true;setTimeout(()=>suppressClick=false,0)}else if(upEvent.type!=="pointercancel"&&onTap){suppressClick=true;onTap();setTimeout(()=>suppressClick=false,0)}};
   element.addEventListener("pointermove",move);element.addEventListener("pointerup",finish);element.addEventListener("pointercancel",finish);
  });
  element.addEventListener("click",event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation()}},true);
 };
 const sync=()=>{const visible=save.state.settings.minimapVisible!==false;map.classList.toggle("visible",visible);button.classList.toggle("active",visible);button.setAttribute("aria-pressed",String(visible));if(visible)requestAnimationFrame(()=>{syncMiniMapBackingStore(map);place(map,save.state.settings.minimapPanelPosition,{x:Math.max(8,stage.clientWidth-map.offsetWidth-10),y:10})})};
 sync();
 bindDrag(button,"mapTogglePosition",{x:Math.max(8,stage.clientWidth-72),y:Math.max(8,stage.clientHeight*.48-29)},{onTap:()=>{save.state.settings.minimapVisible=save.state.settings.minimapVisible===false;save.save();sync()}});
 bindDrag(map,"minimapPanelPosition",{x:Math.max(8,stage.clientWidth-208),y:10});
 if(autoButton){
  const toggleAuto=()=>{const next=exploreAutoMode()==="off"?"floor":"off";setExploreAutoMode(next);showToast(`自動攻略 ${next==="off"?"OFF":"ON"}`)};
  const autoFallback=()=>({x:Math.max(8,stage.clientWidth-autoButton.offsetWidth-10),y:Math.max(8,stage.clientHeight-autoButton.offsetHeight-10)});
  bindDrag(autoButton,"autoExploreButtonPosition",autoFallback(),{onTap:toggleAuto});
  autoButton.addEventListener("keydown",event=>{if(event.key!=="Enter"&&event.key!==" ")return;event.preventDefault();toggleAuto()});
  game.movableControlsResizeObserver?.disconnect?.();
  if(typeof ResizeObserver!=="undefined"){game.movableControlsResizeObserver=new ResizeObserver(()=>{place(button,save.state.settings.mapTogglePosition,{x:Math.max(8,stage.clientWidth-72),y:Math.max(8,stage.clientHeight*.48-29)});if(map.classList.contains("visible"))place(map,save.state.settings.minimapPanelPosition,{x:Math.max(8,stage.clientWidth-map.offsetWidth-10),y:10});place(autoButton,save.state.settings.autoExploreButtonPosition,autoFallback())});game.movableControlsResizeObserver.observe(stage)}
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
function enemyLevelForFloor(floor){return scaledEnemyLevelForFloor(campaignFloorToLegacyFloor(floor))}
const ENEMY_EQUIPMENT_SUBSLOTS=Object.freeze([
 ["weaponRight","weapon"],["weaponLeft","weapon"],["armorBody","armor"],["armorSupport","armor"],["accessoryNeck","accessory"],["accessoryFinger","accessory"]
]);
function prepareEnemyEntry(entry,floor,{forceGear=false,economyFloor=null}={}){
 const source={...entry},f=Math.max(1,Math.floor(Number(floor)||1)),gearDepth=Math.max(1,Math.floor(Number(economyFloor)||f)),species=SPECIES[source.speciesId]??{},rank=source.faction??species.rarity??"N";
 const reroll=source.enemyLoadoutVersion!==4,holder=forceGear||source.equipped===true||(!reroll?Boolean(source.equipped):Math.random()<equipmentHolderRateForFloor(gearDepth));
 const slots=holder?equipmentSlotsForFloor(gearDepth):0,rarity=holder?rollEnemyEquipmentRarity(gearDepth,rank):null,gearLevel=holder?enemyEquipmentLevelForFloor(gearDepth,{rank,boss:Boolean(source.boss)}):0;
 let enemyGear=Array.isArray(source.enemyGear)?source.enemyGear:[];
 if(holder&&(!enemyGear.length||reroll))enemyGear=ENEMY_EQUIPMENT_SUBSLOTS.slice(0,slots).map(([subslot,slot])=>{
  const item=createEquipment(slot,{rarity});item.level=gearLevel;item.plus=gearDepth<250?0:Math.min(30,Math.floor(gearDepth/300));item.enemySubslot=subslot;item.enemySocketRarity=rarity;item.obtainedFloor=f;item.obtainedMethod="enemyLoadout";return item
 });
  const circle=Object.prototype.hasOwnProperty.call(source,"enemyMagicCircle")?source.enemyMagicCircle:rollEnemyMagicCircle(gearDepth,{rank});
 return{...source,enemyFloor:f,enemyEconomyFloor:gearDepth,equipped:holder,gear:holder?(source.gear??enemyGear[0]??null):null,enemyGear:holder?enemyGear:[],enemyEquipmentSlots:slots,enemyEquipmentLevel:holder?gearLevel:0,enemyEquipmentRarity:rarity,enemySocketRarity:rarity,enemyMagicCircle:circle,enemyLoadoutVersion:4};
}
function ensureUniqueEnemyMagicCircles(entries,floor){
 const used=new Set(),f=Math.max(1,Math.floor(Number(floor)||1));
 return entries.map(entry=>{
  const species=SPECIES[entry?.speciesId]??{},rank=entry?.faction??species.rarity??"N";
  let circle=entry?.enemyMagicCircle??null;
  if(circle?.id&&used.has(circle.id)){
   const depth=Math.max(1,Math.floor(Number(entry?.enemyEconomyFloor)||f));circle=rollEnemyMagicCircle(depth,{rank,force:true,excludeIds:[...used]});
  }
  if(circle?.id)used.add(circle.id);
  return circle===entry?.enemyMagicCircle?entry:{...entry,enemyMagicCircle:circle};
 });
}
function recordFieldEncounter(species){
 const entries=(Array.isArray(species)?species:[species]).map(entry=>typeof entry==="string"?SPECIES[entry]:entry).filter(Boolean);
 if(entries.length)save.state.encounterHistory=recordEncounterHistory(save.state.encounterHistory,entries)
}
function specialFieldEncounter(floor,legacyDepth,rareEncounterRate){
 if(legacyDepth>=777&&Math.random()<Math.min(.0012,.00025*(1+rareEncounterRate)))return{speciesId:"ochuki",rareExp:true,fleeAfterTurns:2+Math.floor(Math.random()*3),uncapturable:false};
 if(floor>=2&&Math.random()<Math.min(.03,.006*(1+rareEncounterRate)))return{speciesId:"baby_slime",rareExp:true};
 return null
}
function randomEnemyGroup({forcedCount=null}={}){
 const floor=save.state.player.currentFloor,legacyDepth=campaignFloorToLegacyFloor(floor),fixedCount=forcedCount==null?NaN:Number(forcedCount);
 if(floor===1){recordFieldEncounter(SPECIES.slime);return[prepareEnemyEntry({speciesId:"slime",level:1,boss:false},floor,{economyFloor:legacyDepth})]}
 const roll=Math.random();let count=Number.isInteger(fixedCount)?Math.max(1,Math.min(4,fixedCount)):1;
 // 通常戦でも深層ほど4体編成が増える。1体編成も残して探索の緩急は保つ。
 if(!Number.isInteger(fixedCount)){if(floor<10)count=roll<.18?2:1;else if(floor<50)count=roll<.05?3:roll<.34?2:1;else if(floor<100)count=roll<.05?1:roll<.38?2:roll<.73?3:4;else count=roll<.01?1:roll<.09?2:roll<.27?3:4}
 const rareEncounterRate=(save.state.party??[]).map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean).reduce((sum,monster)=>sum+seriesEffectValue(monster,"rareEncounter",.5),0),special=specialFieldEncounter(floor,legacyDepth,rareEncounterRate);
 if(special){recordFieldEncounter(SPECIES[special.speciesId]);return[prepareEnemyEntry({...special,level:Math.max(1,enemyLevelForFloor(floor)),boss:false},floor,{economyFloor:legacyDepth})]}
 const attribute=game?.world?.currentAttribute??"neutral",rolled=rollAttributeEncounterGroup(STANDARD_ENCOUNTER_SPECIES,floor,attribute,{count,history:save.state.encounterHistory,rng:Math.random,campaign:true}),picked=rolled.species.length?rolled.species:[SPECIES.slime];
 save.state.encounterHistory=rolled.species.length?rolled.history:recordEncounterHistory(save.state.encounterHistory,picked);
 const group=picked.map(species=>prepareEnemyEntry({speciesId:species.id,level:enemyLevelForFloor(floor),boss:false},floor,{economyFloor:legacyDepth}));
 if(group.length===1&&shouldSpawnSecondWorldElite(floor))group[0]=createEliteEncounter(group[0],floor);return group
}
function randomEnemy(){return randomEnemyGroup({forcedCount:1})[0]}
function milestoneBossEntry(bossId,campaignFloor,index=0){
 const floor=Math.max(1,Math.min(CAMPAIGN_MAX_FLOOR,Math.floor(Number(campaignFloor)||1))),legacyFloor=campaignFloorToLegacyFloor(floor),profile=ENDGAME_BOSSES[bossId],final=floor===WORLD_MAX_FLOOR&&bossId==="ten_divinity";
 return prepareEnemyEntry({speciesId:profile.speciesId,level:Math.max(14,bossLevelForFloor(legacyFloor)),boss:true,endgameBossId:bossId,campaignBossId:bossId,visualSpeciesId:bossId,faction:profile.faction,nameOverride:final?`${profile.name}〈真なる顕現〉`:profile.name,powerRate:1,manifestationLabel:final?"真なる顕現":"階層顕現",uncapturable:true,noItemDrops:true,floorMilestoneId:bossId,statMultiplier:1,bossPassive:profile.passive,elementMultipliers:profile.elementMultipliers,statusProfile:profile.statusProfile},floor,{forceGear:true,economyFloor:legacyFloor})
}
function floorBossEnemy(source=null){
 const floor=save.state.player.currentFloor,requested=String(source?.campaignBossId??source?.bossId??source??""),milestones=milestoneBossIdsForFloor(floor),milestoneId=milestones.includes(requested)?requested:!requested?milestones[0]:null;
 if(milestoneId)return milestoneBossEntry(milestoneId,floor);
 const legacyFloor=campaignFloorToLegacyFloor(floor),definition=floorBossDefinitionForFloor(floor)??FLOOR_BOSS_CATALOG.find(entry=>Number(entry.floor)===legacyFloor);
 const selected=requested?floorBossDefinitionById(requested)??definition:definition;if(selected)return prepareEnemyEntry({speciesId:selected.speciesId,visualSpeciesId:selected.visualSpeciesId??selected.speciesId,level:Math.max(14,bossLevelForFloor(campaignFloorToLegacyFloor(floor))),boss:true,nameOverride:selected.name,floorBossCatalogId:selected.id,campaignBossId:selected.id,floorBossTitle:selected.title,floorBossQuote:selected.quote,floorBossStats:selected.stats,floorBossActionIds:selected.actionIds,floorBossPassive:selected.passive,floorBossDomain:selected.domain,floorBossAi:selected.ai,dedicatedWeapon:selected.dedicatedWeapon,combatRarity:selected.rarity,attribute:selected.element,trialElement:selected.element,role:selected.role,uncapturable:true},floor,{forceGear:floor>=5,economyFloor:legacyFloor});
 const emergencyDefinition=FLOOR_BOSS_CATALOG[(floor-1)%Math.max(1,FLOOR_BOSS_CATALOG.length)];if(!emergencyDefinition)throw new Error(`公式階層ボスが未登録です: campaign ${floor}階 / legacy ${legacyFloor}階`);
 console.error("Official floor boss mapping missing",{floor,legacyFloor});return prepareEnemyEntry({speciesId:emergencyDefinition.speciesId,visualSpeciesId:emergencyDefinition.visualSpeciesId??emergencyDefinition.speciesId,level:Math.max(14,bossLevelForFloor(legacyFloor)),boss:true,nameOverride:emergencyDefinition.name,floorBossCatalogId:emergencyDefinition.id,uncapturable:true},floor,{forceGear:true,economyFloor:legacyFloor})
}
function floorBossParty(bossInfo,floor){
 return[bossInfo]
}
function openFloorBossChallenge(bossInfo,floor){
 const species=SPECIES[bossInfo.speciesId]??SPECIES.slime,endgame=bossInfo.endgameBossId?ENDGAME_BOSSES[bossInfo.endgameBossId]:null,name=bossInfo.nameOverride??endgame?.name??species.name,quote=bossInfo.floorBossQuote??endgame?.encounterText??["ここより先へ進む資格を、その力で示せ。","幾度挑もうと構わぬ。深淵は覚悟だけを量る。","この階層を越えるなら、恐れごと剣に変えてみせろ。"][Math.floor(Math.random()*3)],preview=createMonster(bossInfo.speciesId,{level:bossInfo.level,stars:1,rank:1}),partyPower=partyCombatPower(save.state),bossPower=Math.max(1,Math.round(monsterCombatPower(preview)*(bossInfo.statMultiplier??1.45))),tone=endgame?.faction==="tenGod"?"divine":endgame?.faction==="abyss"?"abyss":"floor",mechanics=bossInfo.floorBossPassive&&bossInfo.floorBossDomain?`<div class="floor-boss-mechanics"><span><small>固有能力</small><b>${bossInfo.floorBossPassive.name}</b><em>${bossInfo.floorBossPassive.description}</em></span><span><small>専用領域</small><b>${bossInfo.floorBossDomain.name}</b><em>${bossInfo.floorBossDomain.description}</em></span></div>`:"";
 app.insertAdjacentHTML("beforeend",Modal("階層支配者",`<div class="floor-boss-challenge-v3 tone-${tone}"><div class="boss-chain-frame" aria-hidden="true"><i></i><i></i></div><div class="boss-crest-v3"><span>階層</span><strong>${floor}</strong><em>支配者</em></div><div class="boss-visual-stage-v3"><div class="boss-fog-v3"></div>${monsterVisual({...bossInfo,visualSpeciesId:bossInfo.visualSpeciesId??bossInfo.endgameBossId},species.emoji??"BOSS",{className:"floor-boss-monster-visual-v3"})}</div><small>${bossInfo.floorBossTitle??endgame?.title??`第${floor}階層の支配者`}</small><h2>${name}</h2><b>Lv.${bossInfo.level}</b><blockquote>${quote}</blockquote>${mechanics}<div class="boss-power-versus-v3"><span><small>部隊戦力</small><b>${formatCombatPower(partyPower)}</b></span><i>対</i><span><small>ボス戦力</small><b>${formatCombatPower(bossPower)}</b></span></div><button type="button" class="boss-retreat-v3" data-boss-retreat>いったん退く</button></div>`,"支配者へ挑む"));
 const modal=topModal();modal.classList.add("floor-boss-modal-v3");const retreat=()=>{modal.remove();if(game)game.paused=false};modal._onDismiss=retreat;modal.querySelector("[data-boss-retreat]").onclick=retreat;const challenge=modal.querySelector("[data-modal-primary]");challenge.onclick=()=>{modal.remove();if(game)game.paused=false;beginEncounter([bossInfo])};if(exploreAutoActive()){const generation=exploreActionGeneration;setTimeout(()=>{if(generation===exploreActionGeneration&&modal.isConnected&&exploreAutoActive())challenge.click()},420)}
}
function loop(now){
 if(!game?.running)return;
 const dt=Math.min(.05,(now-game.last)/1000||0);game.last=now;
 if(!game.paused)update(dt);
 if(!game?.running)return;
 if(shouldPaintExploreFrame(game,now,game.performanceProfile?.frameInterval??1000/30))draw();
 requestAnimationFrame(loop)
}
async function beginEncounter(enemyOverride=null,encounterOptions={}){
 if(!game?.running||game.world.encountering)return;
 const originGame=game,generation=exploreActionGeneration;
 game.world.encountering=true;
 game.player.path=[];
 game.paused=true;
 const heroEncounter=encounterOptions.campaignHero===true,emergency=!enemyOverride&&shouldTriggerEmergency(save.state,game.world.steps),encounterEnemies=enemyOverride?(Array.isArray(enemyOverride)?enemyOverride:[enemyOverride]):emergency?[]:randomEnemyGroup(),bossTone=!heroEncounter&&(emergency||encounterEnemies.some(enemy=>enemy?.boss)),eliteTone=!heroEncounter&&!bossTone&&encounterEnemies.some(enemy=>enemy?.elite||enemy?.forcedElite),tone=heroEncounter?"hero":bossTone?"boss":eliteTone?"elite":"normal";game.world.heroStepsSinceBattle=0;
 if(emergency){const pending=normalizeEndgameState(save.state).emergency.pendingEncounter;if(pending&&!pending.priorVitals)pending.priorVitals=capturePartyVitals();save.save()}
 const canvas=document.getElementById("gameCanvas");
 const stage=document.querySelector(".explore-stage");
 if(canvas)canvas.classList.add("encounter-shake");
 const fx=document.createElement("div");
 fx.className=`encounter-transition encounter-${tone}`;
 fx.innerHTML=`<div class="encounter-mist"></div><div class="encounter-vignette"></div><div class="encounter-sparks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="encounter-slashes" aria-hidden="true"><i></i><i></i></div><div class="encounter-warning"><small>${heroEncounter?"勇者に接触された":"深淵との遭遇"}</small><strong>${heroEncounter?campaignHeroName(encounterOptions.heroId):"敵影接近"}</strong><em></em></div><div class="encounter-curtain left"></div><div class="encounter-curtain right"></div>`;
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
 if(heroEncounter){const voice=campaignHeroVoiceLine(encounterOptions.heroId,"contact",{cycle:campaignHeroEncounterCycle(encounterOptions.encounterId)});startSpecialBattle(activeEnemy,{type:"campaignHero",title:`勇者・${campaignHeroName(encounterOptions.heroId)}`,subtitle:`「${voice}」 / 与えた傷は永久保存`,priorVitals:encounterOptions.priorVitals,campaignHeroId:encounterOptions.heroId,campaignHeroEncounterId:encounterOptions.encounterId,returnScreen:"explore",explorationAuto:save.state.settings.exploreAutoMode!=="off"})}else startBattle(activeEnemy);
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
  ...(game.world.campaignKeys??[]).filter(entry=>!entry.collected).map(entry=>`${entry.x}:${entry.y}`),
  ...campaignWorldTrophyChests(game.world).filter(entry=>!entry.open).map(entry=>`${entry.x}:${entry.y}`),
  game.world.exit?`${game.world.exit.x}:${game.world.exit.y}`:"",
  game.world.shop?`${game.world.shop.x}:${game.world.shop.y}`:"",
  ...campaignWorldBosses(game.world).filter(entry=>entry.active!==false).map(entry=>`${entry.x}:${entry.y}`)
 ].filter(Boolean));
 if(explorationPartyTiles().some(position=>objectKeys.has(`${position.x}:${position.y}`)))return true;
 const spring=game.world.hotSpring;
 return Boolean(spring?.active&&!spring.used&&explorationPartyTiles().some(position=>Math.hypot(position.x-spring.x,position.y-spring.y)<=Number(spring.radius??1.75)))
}
function bossHotSpringContainsPlayer(){
 const spring=game?.world?.hotSpring;if(!spring?.active||spring.used||!game?.player)return false;
 return Math.hypot((game.player.rx??game.player.x)-spring.x,(game.player.ry??game.player.y)-spring.y)<=Number(spring.radius??1.75)
}
function applyBossHotSpringRecovery(now=performance.now()){
 const spring=game?.world?.hotSpring;if(!spring?.active||spring.used||!bossHotSpringContainsPlayer())return false;
 const checkpoint=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),springCheckpoint={...spring};
 let hpRecovered=0,mpRecovered=0;
 explorationPartyMembers().forEach(monster=>{
  const hpMax=calculatedStats(monster).hp,mpMax=maxMp(monster),beforeHp=Math.max(0,Number(monster.currentHp)||0),beforeMp=Math.max(0,Number(monster.currentMp)||0);
  monster.currentHp=hpMax;monster.currentMp=mpMax;
  hpRecovered+=monster.currentHp-beforeHp;mpRecovered+=monster.currentMp-beforeMp;
 });
 spring.active=true;spring.used=true;const floorState=campaignFloorState(save.state,save.state.player.currentFloor);floorState.hotSpringUsed=true;
 refreshExplorePartyHud();persistExpeditionSnapshot(expeditionSnapshotFromGame(),{saveNow:false});if(!save.save()){save.state=checkpoint;Object.assign(spring,springCheckpoint);refreshExplorePartyHud();showExploreNotice("温泉の加護を保存できませんでした","warning");return false}
 game.hotSpringRecoveryFx={x:spring.x,y:spring.y,startedAt:now,until:now+1900};audio.sfx?.("heal");showExploreNotice(`温泉の加護　全員のHP・MPを完全回復`,"heal");
 return true
}
function refreshCampaignKeyCounter(){const counter=document.querySelector("[data-campaign-key-counter]"),entry=campaignFloorState(save.state,save.state.player.currentFloor),held=campaignKeysHeld(entry);if(!counter)return;counter.querySelector("b").textContent=`${held}/${CAMPAIGN_KEYS_PER_FLOOR}`;counter.classList.toggle("complete",held>=CAMPAIGN_KEYS_PER_FLOOR);counter.setAttribute("aria-label",`戦利品の鍵 ${held}/${CAMPAIGN_KEYS_PER_FLOOR}`)}
function revealCampaignArea(){
 if(!game?.world||game.online)return;const world=game.world,seen=new Set(Array.isArray(world.discoveredCells)?world.discoveredCells:[]),px=Math.round(game.player.x),py=Math.round(game.player.y),sectionId=world.currentSectionId??sectionIdAt(world,px,py),room=(world.sections??world.rooms??[]).find(entry=>entry.id===sectionId)||(world.rooms??[]).find(entry=>px>=entry.x&&px<entry.x+entry.w&&py>=entry.y&&py<entry.y+entry.h);
 for(let y=Math.max(0,py-2);y<=Math.min(world.rows-1,py+2);y++)for(let x=Math.max(0,px-2);x<=Math.min(world.cols-1,px+2);x++)seen.add(`${x},${y}`);
 if(room){if(Array.isArray(room.cellKeys))room.cellKeys.forEach(key=>seen.add(key));else for(let y=Math.max(0,room.y-1);y<=Math.min(world.rows-1,room.y+room.h);y++)for(let x=Math.max(0,room.x-1);x<=Math.min(world.cols-1,room.x+room.w);x++)seen.add(`${x},${y}`);const floorState=campaignFloorState(save.state,save.state.player.currentFloor),firstVisit=!floorState.visitedRoomIds.includes(room.id);if(firstVisit)floorState.visitedRoomIds.push(room.id);world.currentSectionId=room.id;world.currentRoomId=room.id;world.currentAttribute=room.attribute;world.discoveredSections=[...new Set([...(world.discoveredSections??[]),room.id])];if(firstVisit&&room.id!==world.startSectionId)showExploreNotice(`${campaignRoomProfile(room.attribute).name}属性区画へ`,"info")}
 world.discoveredCells=[...seen]
}
function showCampaignKeyPickup(count){
 const stage=document.querySelector(".explore-stage");if(!stage)return showExploreNotice(`戦利品の鍵 ${count}/${CAMPAIGN_KEYS_PER_FLOOR}`,"reward");stage.querySelector(".campaign-key-pickup")?.remove();const node=document.createElement("div");node.className="campaign-key-pickup";node.innerHTML=`<span>⚿</span><small>FLOOR TROPHY KEY</small><strong>戦利品の鍵を発見！</strong><b>${count} / ${CAMPAIGN_KEYS_PER_FLOOR}</b>`;stage.appendChild(node);setTimeout(()=>node.remove(),1500)
}
function collectFieldCampaignKey(key){
 if(!key||key.collected)return false;const floor=save.state.player.currentFloor,result=collectCampaignKey(save.state,floor,key.id);key.collected=true;if(!result.collected)return false;
 audio.sfx?.("reward");refreshCampaignKeyCounter();showCampaignKeyPickup(result.count);persistExpeditionSnapshot(expeditionSnapshotFromGame());return true
}
function campaignEquipmentEffectText(item){
 const stats=Object.entries(item?.stats??{}).filter(([,value])=>Number(value)).map(([key,value])=>`${equipmentStatLabel(key)} +${Number(value).toLocaleString()}`).slice(0,6);const special=item?.dedicatedWeapon?.skill?.name??(item?.ruleOverrides?.floorBossDedicated?"階層支配者の固有神装":"高位の神話補正");return{stats,special}
}
function showCampaignTrophyReveal({equipment,fragmentRows,locks,gold=0,crystals=0,keysReusable=false}){
 game.paused=true;const gear=equipment?campaignEquipmentEffectText(equipment):null,rewardRows=[...(fragmentRows??[])];if(gold>0)rewardRows.push({name:"GOLD",amount:gold,total:save.state.player.gold,currencyIcon:"coin"});if(crystals>0)rewardRows.push({name:"魔晶石",amount:crystals,total:save.state.player.crystals,currencyIcon:"crystal"});const fragments=rewardRows.map((row,index)=>{const visual=row.currencyIcon?pixelIcon(row.currencyIcon):monsterVisual(row.visual??row.id,row.visual?.fallback??"BOSS",{className:"campaign-fragment-boss-art"});return`<section class="campaign-fragment-get${row.currencyIcon?" is-currency":""}" style="--reward-order:${index}"><i>${visual}</i><span><small>${row.currencyIcon?row.name:`${row.name}の欠片`}</small><b>+${row.amount.toLocaleString()}${row.currencyIcon==="coin"?"G":""}</b><em>所持合計 ${row.total.toLocaleString()}</em></span></section>`}).join(""),body=`<div class="campaign-loot-reveal ${equipment?"mythic":"fragment"}"><div class="campaign-loot-rays" aria-hidden="true"></div><small>${equipment?"MYTHIC TREASURE":"BOSS TROPHY"}</small><h3>${equipment?"MYTHIC GET!":"GET!"}</h3>${equipment?`<section class="campaign-mythic-item"><div>${equipmentVisual(equipment,{className:"campaign-mythic-art",label:equipment.name})}</div><span><small>[${equipmentDisplayRarity(equipment)}] ${slotLabel(equipment.slot)}・Lv.${Math.max(1,Number(equipment.level)||1)}</small><b>${equipment.name}</b><em>${gear.special}</em></span></section><div class="campaign-loot-stats">${gear.stats.map(text=>`<span>${text}</span>`).join("")}</div>`:""}<div class="campaign-fragment-list">${fragments}</div><footer><b>${locks}/3 錠を解放</b><small>${keysReusable?"3本の鍵は同じ階の支配者宝箱すべてに使えます（消費なし）":"報酬はすでに所持品へ追加されています"}</small></footer></div>`;app.insertAdjacentHTML("beforeend",Modal("支配者の戦利品",body,"探索へ戻る"));const modal=topModal();modal.classList.add("campaign-loot-modal");let closed=false,autoCloseTimer=null;const close=()=>{if(closed)return;closed=true;if(autoCloseTimer)clearTimeout(autoCloseTimer);modal.remove();if(game){game.paused=false;if(exploreAutoActive())requestAnimationFrame(applyExploreAutoPath)}};modal._onDismiss=close;modal.querySelector("[data-modal-primary]").onclick=close;if(exploreAutoActive()){const generation=exploreActionGeneration;autoCloseTimer=setTimeout(()=>{if(generation===exploreActionGeneration&&modal.isConnected&&exploreAutoActive())close()},2200)}
}
function openCampaignTrophyChest(chest){
 if(!chest||chest.open)return false;const floor=save.state.player.currentFloor,bossId=String(chest.bossId??chest.bossInfo?.campaignBossId??chest.bossInfo?.endgameBossId??chest.bossInfo?.floorBossCatalogId??""),preview=trophyChestEntitlements(save.state,floor,bossId);if(!preview.available){const message=!preview.missingKeys?"この戦利品は受取済み":`戦利品の鍵があと${preview.missingKeys}本必要`;showExploreNotice(message,"warning");return false}
 const checkpoint=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),chestCheckpoint={open:chest.open,locksOpened:chest.locksOpened};let reveal=null;
 try{
  const bossInfo={...(chest.bossInfo??{}),campaignBossId:bossId},claim=claimTrophyChest(save.state,floor,bossId);if(!claim.claimed)throw new Error("trophy claim rejected");const definition=floorBossDefinitionById(bossInfo.floorBossCatalogId??bossId)??floorBossDefinitionForFloor(floor),milestoneIds=ENDGAME_BOSSES[bossId]?[bossId]:[],fragmentRows=[],rewardRunId=String(campaignFloorState(save.state,floor).runId||"first").slice(0,120),fragmentPacks=Math.max(0,Number(claim.fragmentPacks)||0),suppressReplayRewards=claim.repeatRewardSuppressed===true;
  if(milestoneIds.length&&fragmentPacks>0){for(const id of milestoneIds){const profile=ENDGAME_BOSSES[id],perLock=profile.faction==="tenGod"?10:5,amount=perLock*fragmentPacks;awardEmergencyFragments(save.state,id,true,`campaign:${floor}:run:${rewardRunId}:complete:${id}`,amount);fragmentRows.push({id,name:profile.name,amount,total:emergencyFragmentStatus(save.state,id).count,visual:bossFragmentVisualIdentity(id,{floor})})}}
  else if(fragmentPacks>0){const fragmentId=definition?.id??bossInfo.floorBossCatalogId??bossId,perLock=floor<=30?4:floor<=60?5:6,amount=perLock*fragmentPacks;save.state.floorBossChallenges??={};save.state.floorBossChallenges.fragments??={};save.state.floorBossChallenges.fragments[fragmentId]=(Number(save.state.floorBossChallenges.fragments[fragmentId])||0)+amount;fragmentRows.push({id:fragmentId,name:bossInfo.name??definition?.name??"階層支配者",amount,total:Number(save.state.floorBossChallenges.fragments[fragmentId])||0,visual:bossFragmentVisualIdentity(fragmentId,{floor})})}
  const currency=claim.currencyGuaranteed===true?campaignBossChestReward({floor,bossId:bossInfo,faction:ENDGAME_BOSSES[bossId]?.faction}):{gold:0,crystals:0},currentGold=Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(save.state.player.gold)||0))),currentCrystals=Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(save.state.player.crystals)||0))),gold=safeCurrencyGrant(currentGold,currency?.gold??0),crystals=safeCurrencyGrant(currentCrystals,currency?.crystals??0);save.state.player.gold=currentGold+gold;save.state.player.crystals=currentCrystals+crystals;
  let equipment=null;if(claim.equipmentGuaranteed){equipment=campaignTrophyEquipment({floor,boss:bossInfo,rewardId:`offline-campaign-trophy:${floor}:${bossId}`,obtainedMethod:"campaignTrophyChest"});if(!equipment)throw new Error("guaranteed boss equipment unavailable");receiveEquipment(save.state,equipment,{bossReward:true})}
  chest.locksOpened=CAMPAIGN_KEYS_PER_FLOOR;chest.open=true;save.state.player.bossRewards??={};const settled=campaignFloorState(save.state,floor);if(!isCampaignMultiBossFloor(floor)||settled.trophyClaimed)save.state.player.bossRewards[floor]="CAMPAIGN_TROPHY_COMPLETE";persistExpeditionSnapshot(expeditionSnapshotFromGame(),{saveNow:false});
  if(!save.save())throw new Error("save failed");reveal={equipment,fragmentRows,locks:CAMPAIGN_KEYS_PER_FLOOR,gold,crystals,keysReusable:isCampaignMultiBossFloor(floor),replaySuppressed:suppressReplayRewards}
 }catch(error){save.state=checkpoint;chest.open=chestCheckpoint.open;chest.locksOpened=chestCheckpoint.locksOpened;showExploreNotice("戦利品を保存できなかったため、鍵と報酬を元に戻しました","warning");return false}
 try{refreshCampaignKeyCounter();if(reveal?.replaySuppressed){if(game)game.paused=false;showExploreNotice("この戦利品は元の時間軸ですでに回収済みです","info")}else showCampaignTrophyReveal(reveal)}catch(error){console.warn("Campaign trophy reveal skipped after a successful save",error);if(game)game.paused=false;showToast("戦利品は所持品へ保存済みです")}return true
}
function interactExploreDecoration(decoration){
 if(!decoration||decoration.used||decoration.destroyed||!EXPLORE_INTERACTIVE_DECORATIONS.has(decoration.type))return false;
 const floor=save.state.player.currentFloor,roll=Math.random();
 let message="",resourceToast=null;
 if(decoration.type==="barrel"||decoration.type==="crate"){
  decoration.destroyed=true;decoration.used=true;
  if(roll<.34){
   const gold=modifiedGoldReward(save.state,Math.max(8,Math.round(chestGoldBase(campaignFloorToLegacyFloor(floor))*(.07+Math.random()*.05))),"exploration");
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
	   const gold=modifiedGoldReward(save.state,Math.max(5,Math.round(chestGoldBase(campaignFloorToLegacyFloor(floor))*.045)),"exploration");
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
 if(!game||game.world.steps%8!==0)return;const environment=game.world?.currentAttribute?campaignSectionEnvironment(save.state.player.currentFloor,game.world.currentAttribute):battleBiomeForFloor(save.state.player.currentFloor);
 if(!["fire","lava","poison"].includes(environment.theme))return;
 let total=0;for(const monster of explorationPartyMembers()){
  const element=normalizedElement(monster.attribute??SPECIES[monster.speciesId]?.element);if(!environment.adverse.includes(element)||monster.currentHp<=1)continue;
  const max=calculatedStats(monster).hp,damage=Math.max(1,Math.floor(max*.002));monster.currentHp=Math.max(1,monster.currentHp-damage);total+=damage;
 }
 if(total){refreshExplorePartyHud();showExploreNotice(`${environment.theme==="poison"?"瘴気":"灼熱"} −${total.toLocaleString()} HP`,"hazard")}
}
function syncExploreSectionPresentation(section=activeExploreSection()){
 if(game?.online||!section)return;const floor=save.state.player.currentFloor,profile=campaignRoomProfile(section.attribute),theme=dungeonThemeForAttribute(profile.id,floor),screenNode=document.querySelector(".explore-screen"),badge=document.querySelector("[data-section-scenery]");
 if(screenNode){screenNode.dataset.scenery=theme.id;screenNode.dataset.sectionAttribute=profile.id;screenNode.style.setProperty("--scenery-accent",theme.accent);screenNode.style.setProperty("--scenery-dark",theme.minimapWall)}
 if(badge){badge.setAttribute("aria-label",`現在の区画 ${profile.name}属性 ${theme.name}`);const logo=badge.querySelector("[data-section-attribute-logo]"),name=badge.querySelector("[data-section-attribute-name]"),themeName=badge.querySelector("[data-section-theme-name]");if(logo)logo.innerHTML=attributeVisual(profile.logoAttribute,{label:`${profile.name}属性`});if(name)name.textContent=`${profile.name}属性区画`;if(themeName)themeName.textContent=theme.name;badge.dataset.attribute=profile.id}
}
function showSectionTransition(section){
 syncExploreSectionPresentation(section);const stage=document.querySelector(".explore-stage");if(!stage)return;const profile=campaignRoomProfile(section?.attribute),previous=stage.querySelector(".section-transition-curtain, .section-passage-fade");previous?.remove();const node=document.createElement("div");node.className="section-passage-fade";node.setAttribute("role","status");node.innerHTML=`<span><small>区画移動</small><b>${profile.name}属性区画</b></span>`;stage.appendChild(node);setTimeout(()=>node.remove(),720)
}
function showPostBossFieldUnlocks(){
 const stage=document.querySelector(".explore-stage");if(!stage)return;stage.querySelector(".post-boss-field-unlocks")?.remove();const firstUnlock=game?.world?.postBossRevealFirstUnlock!==false,node=document.createElement("div");node.className="post-boss-field-unlocks";node.setAttribute("role","status");node.innerHTML=`<small>支配者討伐完了</small><strong>${firstUnlock?"この階の封印が解けた":"新たな神の戦利品が現れた"}</strong><div><span class="trophy">${pixelIcon("chest")}<b>この支配者の戦利品宝箱</b><em>解放</em></span><span class="spring">${pixelIcon("rest")}<b>全回復の温泉</b><em>${firstUnlock?"出現":"利用状態を維持"}</em></span><span class="route">${pixelIcon("dungeon")}<b>${save.state.player.currentFloor>=CAMPAIGN_MAX_FLOOR?"勇者決戦への門":"次階層への道"}</b><em>${firstUnlock?"開通":"開通済み"}</em></span></div>`;stage.appendChild(node);setTimeout(()=>node.remove(),2600)
}
function transitionCampaignSection(){
 if(game?.online||!game?.world?.sectionPortals?.length)return false;const portal=game.world.sectionPortals.find(entry=>entry.sectionId===game.world.currentSectionId&&entry.x===game.player.x&&entry.y===game.player.y);if(!portal)return false;
 const section=game.world.sections.find(entry=>entry.id===portal.targetSectionId);game.player.x=portal.arrivalX;game.player.y=portal.arrivalY;game.player.rx=portal.arrivalX;game.player.ry=portal.arrivalY;game.player.path=[];game.player.p=0;game.world.currentSectionId=portal.targetSectionId;game.world.currentRoomId=portal.targetSectionId;game.world.currentAttribute=section?.attribute??"neutral";game.partyTrail=[{x:game.player.x,y:game.player.y}];game.camera.reset(game.player.x*TILE,game.player.y*TILE);game.camera.clamp(game.world);revealCampaignArea();transferCampaignHeroPursuit(section);showSectionTransition(section);persistExpeditionSnapshot(expeditionSnapshotFromGame());return true
}
function update(dt){
 if(game.world.encountering)return;
 applyBossHotSpringRecovery();
 if(transitionCampaignSection())return;
 applyExploreAutoPath();
 if(game.player.move(dt,7.5)){
  game.world.steps++;
  game.world.heroStepsSinceBattle=(Number(game.world.heroStepsSinceBattle)||0)+1;
  revealCampaignArea();
  applyWalkingStratumHazard();
  queueExpeditionCheckpoint();
  if(updateCampaignHeroPursuitOnStep())return;
  for(const key of game.world.campaignKeys??[])if(!key.collected&&key.x===game.player.x&&key.y===game.player.y){collectFieldCampaignKey(key);return}
  const trophyChest=campaignWorldTrophyChests(game.world).find(chest=>!chest.open&&chest.x===game.player.x&&chest.y===game.player.y);
  if(trophyChest){openCampaignTrophyChest(trophyChest);return}
  for(const c of game.world.chests)if(!c.open&&c.x===game.player.x&&c.y===game.player.y){openChest(c);return}
  const decoration=exploreDecorationAt(game.player.x,game.player.y);
  if(decoration&&!decoration.used&&interactExploreDecoration(decoration)){
   game.world.nextEncounter=Math.max(game.world.nextEncounter??0,game.world.steps+2)
  }
  const fieldBoss=campaignWorldBosses(game.world).find(entry=>entry.active!==false&&game.player.x===entry.x&&game.player.y===entry.y);
  if(fieldBoss){
   game.player.path=[];const floor=save.state.player.currentFloor,entry=campaignFloorState(save.state,floor),bossId=String(fieldBoss.campaignBossId??"");const progress=campaignBossProgress(save.state,floor,bossId,{create:true});if(progress)progress.discovered=true;else entry.bossDiscovered=true;fieldBoss.hidden=false;persistExpeditionSnapshot(expeditionSnapshotFromGame());beginEncounter(floorBossParty(floorBossEnemy(fieldBoss),floor));return
  }
  if(game.world.shop&&game.player.x===game.world.shop.x&&game.player.y===game.world.shop.y){
   if(exploreAutoActive())game.world.shop.autoVisited=true;
   stopGame();
   snapshot=currentSnapshot();
   enterSecretRoom(save.state,game.world.shop.roomId??`${save.state.secretRooms?.run?.id??"run"}:${save.state.player.currentFloor}`,save.state.player.currentFloor);
   save.save();screen="shop";render();return
  }
  if(game.world.exit?.active!==false&&!game.world.exit.locked&&game.player.x===game.world.exit.x&&game.player.y===game.world.exit.y){
   if(game.world.exit.locked||!campaignFloorState(save.state,save.state.player.currentFloor).bossDefeated){game.player.path=[];showExploreNotice("支配者を倒すと次階への扉が開く","warning");return}
   const clearedFloor=save.state.player.currentFloor;
   if(clearedFloor>=WORLD_MAX_FLOOR){game.player.path=[];game.paused=true;if(exploreAutoActive())stopExploreAuto("AUTO完了：100階を踏破しました");recordCampaignReincarnationFloor(save.state,clearedFloor);const ledger=campaignHeroLedger();ledger.finalArena={...ledger.finalArena,unlocked:true};if(ledger.rewind?.active){const advanced=advanceCampaignRewindFloor(ledger,{clearedFloor});normalizeCampaignState(save.state).heroEncounters310=advanced.state}else normalizeCampaignState(save.state).heroEncounters310=ledger;save.save();queueCampaignStoryScenes({clearedFloor,delay:0,onComplete:()=>{if(!battle&&!document.querySelector(".game-modal"))enterCampaignFinalFloor()}});return}
   settleAbandonedCampaignHeroPursuit("floor-transition");stopGame();snapshot=null;clearExpeditionSnapshot({settleHeroPursuit:false});const rewindAdvance=advanceCampaignRewindFloor(campaignHeroLedger(),{clearedFloor});normalizeCampaignState(save.state).heroEncounters310=rewindAdvance.state;save.state.player.currentFloor++;
   if(rewindAdvance.state.rewind?.active)normalizeCampaignState(save.state).floors[String(save.state.player.currentFloor)]=beginCampaignFloorReplay(save.state,save.state.player.currentFloor,save.state.player.exploreRun?.id);
   recordManualFloorClear(save.state,save.state.player.currentFloor);recordCampaignReincarnationFloor(save.state,save.state.player.currentFloor);
   save.state.player.maxFloor=Math.min(WORLD_MAX_FLOOR,Math.max(save.state.player.maxFloor,save.state.player.currentFloor));
   if(save.state.player.currentFloor===1001)markSecondWorldEntered(save.state);save.save();go("explore");if(clearedFloor%10===0)queueCampaignStoryScenes({clearedFloor,delay:160});return
  }
  if(!game.world.campaignHeroPursuit&&!game.world.bossDefeated&&game.world.steps>=game.world.nextEncounter){
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
 game.camera.follow(game.player.rx*TILE,game.player.ry*TILE,dt);
 game.camera.clamp(game.world)
}
function showChestRewardReveal({chest,gold=0,potions=0,crystals=0,receipt=null}){
 const title=chest.locked?"鍵付き宝箱":chest.kind==="radiant"?"輝く宝箱":chest.kind==="cabinet"?"古い収納箱":chest.kind==="apple"?"深淵の果実":"宝箱",rows=[gold?`<article>${pixelIcon("coin")}<span><small>GOLD</small><b>+${gold.toLocaleString()}</b></span></article>`:"",potions?`<article>${pixelIcon("growth")}<span><small>回復薬</small><b>+${potions.toLocaleString()}</b></span></article>`:"",crystals?`<article>${pixelIcon("crystal")}<span><small>魔晶石</small><b>+${crystals.toLocaleString()}</b></span></article>`:""].filter(Boolean).join(""),item=receipt?.item,itemStats=item?Object.entries(item.stats??{}).filter(([,value])=>Number(value)).slice(0,6).map(([key,value])=>`<span>${equipmentStatLabel(key)} +${Number(value).toLocaleString()}</span>`).join(""):"";
 const equipment=item?`<section class="dungeon-chest-equipment"><div>${equipmentVisual(item,{className:"dungeon-chest-equipment-art",label:item.name})}</div><span><small>[${equipmentDisplayRarity(item)}] ${slotLabel(item.slot)}・Lv.${Math.max(1,Number(item.level)||1)}</small><b>${item.name}</b><em>${receipt.message??equipmentReceiptText(receipt)}</em></span></section><div class="dungeon-chest-stats">${itemStats}</div>`:"";
 const body=`<div class="dungeon-chest-reveal ${chest.locked?"locked":""}"><div class="dungeon-chest-rays" aria-hidden="true"></div><small>${chest.locked?"SEALED TREASURE":"TREASURE ACQUIRED"}</small><h3>獲得！</h3><strong>${title}</strong>${rows?`<div class="dungeon-chest-resource-grid">${rows}</div>`:""}${equipment}<footer>報酬は所持品へ保存されています</footer></div>`;
 game.paused=true;app.insertAdjacentHTML("beforeend",Modal(title,body,"探索へ戻る"));const modal=topModal();modal.classList.add("dungeon-chest-reward-modal");let closed=false;const close=()=>{if(closed)return;closed=true;modal.remove();if(game){game.paused=false;if(exploreAutoActive())requestAnimationFrame(applyExploreAutoPath)}};modal._onDismiss=close;modal.querySelector("[data-modal-primary]").onclick=close;if(exploreAutoActive()){const generation=exploreActionGeneration;setTimeout(()=>{if(generation===exploreActionGeneration&&modal.isConnected&&exploreAutoActive())close()},1350)}
}
function openChest(c){
 const floor=save.state.player.currentFloor;save.state.player.openedChests[floor]??=[];if(save.state.player.openedChests[floor].includes(c.id)){c.open=true;persistExpeditionSnapshot(expeditionSnapshotFromGame(),{saveNow:false});save.save();return false}
 if(c.locked&&(save.state.inventory.abyssKeys??0)<=0){game.player.path=[];if(exploreAutoActive())c.autoSkipped=true;return pauseModal("鍵付き宝箱",'<p>深淵の鍵が必要だ。</p><p class="muted">鍵は強敵やごく稀な敵ドロップから入手できます。</p>')}
 const checkpoint=typeof structuredClone==="function"?structuredClone(save.state):JSON.parse(JSON.stringify(save.state)),chestCheckpoint={open:Boolean(c.open),autoSkipped:Boolean(c.autoSkipped)};let reward=null,gold=0,receipt=null;
 try{
  if(c.locked)save.state.inventory.abyssKeys--;c.open=true;if(!save.state.player.openedChests[floor].includes(c.id))save.state.player.openedChests[floor].push(c.id);recordBiomeChest(save.state,floor,c.id);save.state.records.chests++;
  if(!c.mimic){const economyDepth=campaignFloorToLegacyFloor(floor);reward=rollTreasureChestReward({floor:economyDepth,kind:c.kind,locked:Boolean(c.locked),treasureRoom:Boolean(game.world.treasureRoom),luck:abyssEquipmentRarityBonus(save.state),baseGold:chestGoldBase(economyDepth),random:Math.random});gold=modifiedGoldReward(save.state,reward.gold,"exploration");if(gold)save.state.player.gold+=gold;if(reward.potions)save.state.inventory.potions=(save.state.inventory.potions??0)+reward.potions;if(reward.crystals)save.state.player.crystals=(save.state.player.crystals??0)+reward.crystals;if(reward.equipment){const item=createEquipment(reward.equipment.slot,{rarity:reward.equipment.rarity});item.level=reward.equipment.level;item.plus=reward.equipment.plus;item.obtainedFloor=floor;item.obtainedMethod=c.locked?"lockedTreasureChest":"explorationChest";receipt=equipmentReceipt(item,{scaleToFloor:false})}}
  persistExpeditionSnapshot(expeditionSnapshotFromGame(),{saveNow:false});if(!save.save())throw new Error("save failed")
 }catch(error){save.state=checkpoint;c.open=chestCheckpoint.open;c.autoSkipped=chestCheckpoint.autoSkipped;showExploreNotice("宝箱の報酬を保存できなかったため、開封を取り消しました","warning");return false}
 if(c.mimic){game.player.path=[];const warning=pauseModal("ミミック出現",'<p>宝箱が牙を剥いた！</p><p class="muted">倒せば大量のGOLD・EXP・魔晶石を獲得できます。</p>');game.world.encountering=true;const generation=exploreActionGeneration;setTimeout(()=>{if(generation!==exploreActionGeneration||!game?.running||!save.state.player.inRun)return;warning?.remove();game.world.encountering=false;game.paused=false;beginEncounter(prepareEnemyEntry({speciesId:"mimic",level:enemyLevelForFloor(floor),boss:false,treasureMimic:true},floor,{forceGear:true,economyFloor:campaignFloorToLegacyFloor(floor)}))},650);return true}
 showChestRewardReveal({chest:c,gold,potions:reward?.potions??0,crystals:reward?.crystals??0,receipt});return true
}
function explorationPartyMembers(){return game?.online?(game.onlineMembers??[]).map(entry=>entry.monster).filter(Boolean):(save.state.party??[]).map(id=>save.state.monsters?.find(monster=>monster.id===id)).filter(Boolean)}
const explorationSpriteCache=new Map();
const explorationTextureCache=new Map();
const EXPLORE_TEXTURE_URLS={
 floor:"assets/ui/explore/dungeon-floor.png?v=2.11.2-build166",
 wall:"assets/ui/explore/dungeon-wall.png?v=2.11.2-build166",
 stairs:"assets/ui/explore/dungeon-stairs-arch.png?v=2.11.2-build166",
 props:"assets/ui/explore/dungeon-props-atlas.png?v=2.11.2-build166",
 usedWater:"assets/ui/explore/empty-water-basin.png?v=2.11.2-build166",
 campaignKey:"assets/ui/items/abyssKeys.png?v=3.1.1-build311"
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
function exploreBandTheme(floor,attribute=game?.world?.currentAttribute){return!game?.online&&attribute?dungeonThemeForAttribute(attribute,floor):dungeonThemeForFloor(floor)}
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
 count=Math.max(1,Math.ceil(count*(game.performanceProfile?.particleScale??1)));const p=game.camera.world(position.x*TILE,position.y*TILE),tileSize=TILE*game.camera.z,frame=Math.floor(performance.now()/280)%3;
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
function activeExploreSection(world=game?.world){return(world?.sections??[]).find(section=>section.id===world.currentSectionId)??null}
function visibleExploreObject(world,object){return!world?.sections?.length||campaignObjectSection(world,object)===world.currentSectionId}
function sectionRenderContains(world,x,y,padding=1){const bounds=sectionBounds(world,world.currentSectionId,padding);return x>=bounds.minX&&x<=bounds.maxX&&y>=bounds.minY&&y<=bounds.maxY}
function drawExploreRaisedWalls(world,theme,wallTexture){
 const c=game.ctx,size=TILE*game.camera.z,depth=size*Math.max(.22,Math.min(.42,Number(theme.wallDepth)||.31)),side=depth*.46,bevel=Math.max(2,size*.075),entries=[],bounds=sectionBounds(world,world.currentSectionId,1);
 for(let y=bounds.minY;y<=bounds.maxY;y++)for(let x=bounds.minX;x<=bounds.maxX;x++){
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
 c.strokeStyle=theme.wallRim;c.lineWidth=Math.max(1,game.camera.z*1.25);c.shadowColor=theme.light;c.shadowBlur=Math.max(0,game.camera.z*2.2*(game.performanceProfile?.shadowScale??1));traceEdges();c.stroke();c.restore()
}
function drawExploreWallArchitecture(world,theme){
 if(!theme.architecture||game.performanceProfile?.constrained)return;const bounds=sectionBounds(world,world.currentSectionId,1);
 for(let y=bounds.minY;y<=bounds.maxY;y++)for(let x=bounds.minX;x<=bounds.maxX;x++){
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
 const c=game.ctx,bounds=sectionBounds(world,world.currentSectionId,1),shadowScale=game.performanceProfile?.shadowScale??1;c.save();c.strokeStyle=theme.line;c.lineWidth=Math.max(1,game.camera.z*1.15);c.shadowColor=theme.light;c.shadowBlur=Math.max(0,game.camera.z*1.8*shadowScale);
 for(let y=bounds.minY;y<=bounds.maxY;y++)for(let x=bounds.minX;x<=bounds.maxX;x++){
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
 const now=performance.now(),used=Boolean(spring.used),pulse=.92+Math.sin(now/360)*.08,p=game.camera.world(spring.x*TILE,spring.y*TILE),size=TILE*game.camera.z;
 drawExploreGlow(spring,used?"#587985":"#87e8ff",6.8,(used?.075:.2)*pulse);
 drawExploreAtlas(spring,EXPLORE_ATLAS.water,{scale:Number(spring.scale??5.9),alpha:used?.58:.96,shadowColor:used?"#315361":"#8beaff",shadowBlur:used?4:12});
 const c=game.ctx;c.save();c.globalCompositeOperation="screen";
 const water=c.createRadialGradient(p.x+size*.5,p.y+size*.53,size*.15,p.x+size*.5,p.y+size*.53,size*2.05);
 water.addColorStop(0,used?"rgba(126,164,172,.38)":"rgba(190,250,255,.82)");water.addColorStop(.3,used?"rgba(32,93,108,.3)":"rgba(45,185,222,.55)");water.addColorStop(.72,used?"rgba(11,47,59,.22)":"rgba(17,91,128,.32)");water.addColorStop(1,"rgba(0,24,40,0)");
 c.fillStyle=water;c.beginPath();c.ellipse(p.x+size*.5,p.y+size*.54,size*1.95,size*1.12,0,0,Math.PI*2);c.fill();
 c.strokeStyle="rgba(204,252,255,.62)";c.lineWidth=Math.max(1,game.camera.z*.85);
 for(let ring=0;ring<(used?1:3);ring++){const wave=(now/900+ring*.29)%1;c.globalAlpha=(used?.2:.65)*(1-wave);c.beginPath();c.ellipse(p.x+size*.5,p.y+size*.54,size*(.45+wave*1.45),size*(.2+wave*.72),0,0,Math.PI*2);c.stroke()}
 for(let steam=0;steam<(used?2:5);steam++){const phase=(now/1700+steam*.19)%1,x=p.x+size*(-1.15+steam*(used?2.3:.58)),y=p.y+size*(.05-phase*.95);c.globalAlpha=(used?.12:.32)*(1-phase);c.beginPath();c.arc(x+Math.sin(phase*Math.PI*2+steam)*size*.12,y,size*(.13+.12*phase),0,Math.PI*2);c.fillStyle="#d9fbff";c.fill()}
 c.restore();if(used){c.save();c.textAlign="center";c.textBaseline="middle";c.font=`900 ${Math.max(8,size*.12)}px serif`;c.strokeStyle="#081015";c.lineWidth=Math.max(2,size*.045);c.strokeText("加護を受けた",p.x+size*.5,p.y-size*.72);c.fillStyle="#a9cbd2";c.fillText("加護を受けた",p.x+size*.5,p.y-size*.72);c.restore()}
 const fx=game?.hotSpringRecoveryFx;if(fx&&fx.until>now&&fx.x===spring.x&&fx.y===spring.y){const progress=Math.max(0,Math.min(1,(now-fx.startedAt)/Math.max(1,fx.until-fx.startedAt))),fade=Math.sin(progress*Math.PI),label="HP・MP 完全回復";c.save();c.globalCompositeOperation="screen";const beam=c.createLinearGradient(0,p.y-size*3,0,p.y+size);beam.addColorStop(0,"rgba(185,248,255,0)");beam.addColorStop(.5,`rgba(185,248,255,${.5*fade})`);beam.addColorStop(1,"rgba(89,213,255,0)");c.fillStyle=beam;c.fillRect(p.x-size*.8,p.y-size*3,size*2.1,size*4);c.globalCompositeOperation="source-over";c.textAlign="center";c.textBaseline="middle";c.font=`900 ${Math.max(13,size*.2)}px serif`;c.strokeStyle="#071016";c.lineWidth=Math.max(3,size*.07);c.strokeText(label,p.x+size*.5,p.y-size*(.7+progress*.8));c.fillStyle="#d9fcff";c.fillText(label,p.x+size*.5,p.y-size*(.7+progress*.8));c.restore()}
}
function drawExploreExit(position,image,theme){
 if(position?.active===false)return;
 const pulse=.92+Math.sin(performance.now()/240)*.08;
 drawExploreGlow(position,position.kind==="final-gate"?"#fff0a2":theme.light,4.1,.18*pulse);
 if(!drawExplorationTileAsset(position,image,1.66)){
  drawExploreAtlas(position,EXPLORE_ATLAS.entrance,{scale:1.64,shadowColor:theme.light,shadowBlur:5})
 }
 drawExploreParticles(position,theme.light,7,17,.78);const c=game.ctx,p=game.camera.world(position.x*TILE,position.y*TILE),size=TILE*game.camera.z;c.save();c.textAlign="center";c.textBaseline="middle";c.strokeStyle="#09070b";c.lineWidth=Math.max(3,size*.08);c.font=`900 ${Math.max(10,size*.16)}px serif`;c.strokeText(position.label??"次の階層へ",p.x+size*.5,p.y-size*.34);c.fillStyle="#ffe9a8";c.fillText(position.label??"次の階層へ",p.x+size*.5,p.y-size*.34);c.restore()
}
function drawCampaignSectionPortal(portal){
 if(!portal)return;const c=game.ctx,p=game.camera.world(portal.x*TILE,portal.y*TILE),size=TILE*game.camera.z,angle={north:0,east:Math.PI/2,south:Math.PI,west:-Math.PI/2}[portal.direction]??0,passageDepth=Math.max(3.15,Math.min(4.35,Number(portal.passageDepth)||3.8)),layers=game.performanceProfile?.constrained?3:4,fadeSlices=layers*8;// Regression marker: fadeSlices=layers*2
 // Top-down view: the passage keeps one width instead of using a perspective
 // trapezoid. Flat slices darken only the distance, keeping this cheap on iOS.
 c.save();c.translate(p.x+size*.5,p.y+size*.5);c.rotate(angle);
 const nearY=size*.76,farY=-size*passageDepth,passageWidth=size*.68,wallWidth=size*.14,totalHeight=nearY-farY;
 c.fillStyle="rgba(4,4,6,.94)";c.fillRect(-passageWidth-wallWidth,farY-size*.18,(passageWidth+wallWidth)*2,totalHeight+size*.36);
 c.fillStyle="#3b3832";c.fillRect(-passageWidth,farY,passageWidth*2,totalHeight);
 for(let slice=0;slice<fadeSlices;slice++){
  const t0=slice/fadeSlices,t1=(slice+1)/fadeSlices,y0=nearY+(farY-nearY)*t0,y1=nearY+(farY-nearY)*t1,darkness=.06+Math.pow(t1,1.72)*.91;
  c.fillStyle=`rgba(0,0,0,${darkness.toFixed(3)})`;c.fillRect(-passageWidth,y1,passageWidth*2,y0-y1+.5);
  if(slice%4===3||slice===fadeSlices-1){c.strokeStyle=`rgba(151,139,113,${Math.max(.025,.23*(1-t1)).toFixed(3)})`;c.lineWidth=Math.max(.7,size*.018*(1-t1*.55));c.beginPath();c.moveTo(-passageWidth,y1);c.lineTo(passageWidth,y1);c.stroke()}
 }
 c.strokeStyle="rgba(112,103,87,.2)";c.lineWidth=Math.max(.7,size*.014);for(const x of[-.34,.35]){c.beginPath();c.moveTo(passageWidth*x,nearY);c.lineTo(passageWidth*x,farY);c.stroke()}
 c.fillStyle="rgba(0,0,0,.99)";c.fillRect(-passageWidth,farY-size*.24,passageWidth*2,size*.42);
 c.strokeStyle="rgba(202,166,88,.48)";c.lineWidth=Math.max(1,size*.03);c.beginPath();c.moveTo(-passageWidth,nearY);c.lineTo(-passageWidth,farY);c.moveTo(passageWidth,nearY);c.lineTo(passageWidth,farY);c.stroke();
 c.strokeStyle="rgba(241,211,139,.76)";c.lineWidth=Math.max(1,size*.025);c.beginPath();c.moveTo(-size*.74,nearY);c.lineTo(size*.74,nearY);c.stroke();c.restore()
}
function drawCampaignKey(key){
 if(!key||key.collected)return;const c=game.ctx,p=game.camera.world(key.x*TILE,key.y*TILE),size=TILE*game.camera.z,pulse=.85+Math.sin(performance.now()/180)*.15;drawExploreGlow(key,"#ffe46b",2.2,.34*pulse);const image=explorationTexture("campaignKey");if(drawExplorationTileAsset(key,image,1.05))return;c.save();c.translate(p.x+size*.5,p.y+size*.48);c.rotate(-Math.PI/5);c.shadowColor="#fff3a2";c.shadowBlur=Math.max(5,size*.2);c.strokeStyle="#ffd84c";c.fillStyle="#8d5b13";c.lineWidth=Math.max(3,size*.09);c.beginPath();c.arc(-size*.2,0,size*.19,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(-size*.02,0);c.lineTo(size*.34,0);c.lineTo(size*.34,size*.15);c.lineTo(size*.2,size*.15);c.lineTo(size*.2,size*.05);c.stroke();c.restore()
}
function drawCampaignTrophy(chest){
 if(!chest)return;const c=game.ctx,p=game.camera.world(chest.x*TILE,chest.y*TILE),size=TILE*game.camera.z,pulse=.82+Math.sin(performance.now()/210)*.18,opened=Math.max(0,Math.min(3,Number(chest.locksOpened)||0));drawExploreGlow(chest,chest.open?"#6f6676":"#c262ff",4.8,chest.open?.12:.4*pulse);c.save();c.translate(p.x+size*.5,p.y+size*.68);c.strokeStyle=chest.open?"#8b8290":`rgba(245,202,92,${.55+.35*pulse})`;c.lineWidth=Math.max(1,size*.035);for(let ring=0;ring<3;ring++){c.beginPath();c.ellipse(0,0,size*(.7+ring*.22),size*(.23+ring*.08),0,0,Math.PI*2);c.stroke()}c.restore();if(!chest.open){const beam=c.createLinearGradient(0,p.y-size*1.8,0,p.y+size);beam.addColorStop(0,"rgba(255,232,144,0)");beam.addColorStop(.62,"rgba(221,129,255,.22)");beam.addColorStop(1,"rgba(221,129,255,0)");c.save();c.globalCompositeOperation="screen";c.fillStyle=beam;c.fillRect(p.x-size*.55,p.y-size*1.8,size*2.1,size*2.8);c.restore()}drawExploreParticles(chest,chest.open?"#8d8197":"#e0a1ff",10,31,1.05);drawExploreAtlas(chest,chest.open?EXPLORE_ATLAS.chestOpen:EXPLORE_ATLAS.chestClosed,{scale:3.05,shadowColor:chest.open?"#000":"#b24cff",shadowBlur:chest.open?6:24});c.save();c.textAlign="center";c.textBaseline="middle";c.strokeStyle="#08050c";c.lineWidth=Math.max(3,size*.075);c.font=`900 ${Math.max(10,size*.17)}px serif`;c.strokeText(chest.label??"支配者の戦利品",p.x+size*.5,p.y-size*.65);c.fillStyle="#ffe5a0";c.fillText(chest.label??"支配者の戦利品",p.x+size*.5,p.y-size*.65);
 const lockY=p.y+size*1.14,lockSize=Math.max(5,size*.13);for(let index=0;index<3;index++){const x=p.x+size*(.25+index*.25),unlocked=index<opened;c.strokeStyle=unlocked?"#83ffc0":"#f0c766";c.fillStyle=unlocked?"#163c2b":"#3a280d";c.lineWidth=Math.max(1,size*.025);c.beginPath();c.arc(x,lockY-lockSize*.26,lockSize*.42,Math.PI,0);c.stroke();c.fillRect(x-lockSize*.48,lockY-lockSize*.18,lockSize*.96,lockSize*.72);c.strokeRect(x-lockSize*.48,lockY-lockSize*.18,lockSize*.96,lockSize*.72);c.fillStyle=unlocked?"#83ffc0":"#ffe39a";c.beginPath();c.arc(x,lockY+lockSize*.11,Math.max(1,lockSize*.09),0,Math.PI*2);c.fill()}c.restore()
}
function exploreParticleUnit(seed,index,salt=0){const value=Math.sin((seed+index*97+salt*131)*12.9898)*43758.5453;return value-Math.floor(value)}
function drawExploreAmbientParticles(theme){
 const c=game.ctx,width=game.canvas.width,height=game.canvas.height,time=performance.now()/1000,particleScale=game.performanceProfile?.particleScale??1,count=Math.max(4,Math.ceil(Math.max(10,Math.min(24,Math.round(width/46)))*particleScale)),motion=theme.particle,seed=theme.ambienceSeed??1,density=game.performanceProfile?.pixelRatio??Math.min(devicePixelRatio||1,2);
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
 const ground=new Set(["campaignKey","campaignTrophy","resonanceChest","deluxeChest","coopSwitch","relaySeal","keyFragment","rarePortalChest"]),wall=new Set(["resonanceVault","rarePortal","rareReturnPortal"]);
 return Number(object?.y||0)+(wall.has(object?.type)?.96:ground.has(object?.type)?.72:.9)
}
function drawOnlineExploreObject(object,expedition){
 const c=game.ctx,size=TILE*game.camera.z,point=game.camera.world(object.x*TILE,object.y*TILE),cx=point.x+size/2,cy=point.y+size/2;
 const chestAsset=(entry,open=Boolean(entry.resolved))=>{const wanted=String(entry.rewardTier||expedition?.coop?.floorTier||"black-iron"),tier=["black-iron","silver","gold","abyss"].includes(wanted)?wanted:"black-iron";return onlineCoopAsset(`chest-${tier}-${open?"open":"closed"}`)??onlineCoopAsset(`chest-black-iron-${open?"open":"closed"}`)};
 const merchantTalking=expedition?.interactions?.[game.onlineSelfId]?.action==="browseRareMerchant",merchantClaimed=Boolean(expedition?.coop?.rare?.merchantClaims?.[game.onlineSelfId]),merchantFrames=["idle1","idle2","idle3","idle2"],merchantFrame=merchantClaimed?"idle1":merchantTalking?"talk":merchantFrames[Math.floor(performance.now()/360)%merchantFrames.length];
 c.save();c.textAlign="center";c.textBaseline="middle";
 if(object.type==="campaignKey"&&!object.resolved)drawCampaignKey(object)
 if(object.type==="campaignTrophy"){drawExploreGlow(object,"#ffd86a",2.5,.28);drawExploreAtlas(object,object.resolved?EXPLORE_ATLAS.chestOpen:EXPLORE_ATLAS.chestClosed,{scale:2,shadowColor:"#ffd86a",shadowBlur:14})}
 if(object.type==="resonanceChest"){if(!object.resolved){const nearby=Math.min(2,Number(object.nearbyCount)||0),ready=nearby>=2;c.fillStyle=ready?"rgba(255,205,78,.17)":"rgba(101,72,255,.13)";c.strokeStyle=ready?"#ffd15c":"#73d9ff";c.lineWidth=Math.max(1,2*game.camera.z);c.setLineDash([Math.max(3,5*game.camera.z),Math.max(2,4*game.camera.z)]);c.fillRect(point.x-size,point.y-size,size*3,size*3);c.strokeRect(point.x-size,point.y-size,size*3,size*3);c.setLineDash([]);c.fillStyle=ready?"#ffe8a3":"#e8f8ff";c.font=`900 ${Math.max(9,12*game.camera.z)}px sans-serif`;c.fillText(ready?"開封可能":nearby===1?"あと1人":"2人で共鳴",cx,point.y-size*.72)}drawExplorationGroundAsset(object,chestAsset(object),object.resolved?1.26:1.34)}
 if(object.type==="deluxeChest"){if(!object.resolved)drawExploreGlow(object,"#ffd86a",2.4,.22);drawExplorationGroundAsset(object,chestAsset(object),object.resolved?1.4:1.56)}
 if(object.type==="coopSwitch"){const progress=Math.max(0,Math.min(1,Number(object.holdProgress)||0)),pressed=Boolean(object.pressedBy),asset=object.activated?"switch-activated":progress>.05?"switch-charging":pressed?"switch-pressed":"switch-idle";drawExplorationTileAsset(object,onlineCoopAsset(asset),1.18);if(progress>0&&!object.activated){c.fillStyle="#120d18";c.fillRect(point.x+size*.1,point.y+size*.93,size*.8,Math.max(3,size*.08));c.fillStyle="#64efff";c.fillRect(point.x+size*.1,point.y+size*.93,size*.8*progress,Math.max(3,size*.08))}}
 if(object.type==="relaySeal"){drawExplorationTileAsset(object,onlineCoopAsset(object.active?"switch-activated":"switch-idle"),1.18);c.fillStyle=object.active?"#8dffc0":"#ffe6ab";c.font=`900 ${Math.max(10,size*.2)}px serif`;c.fillText(object.seal,cx,cy)}
 if(object.type==="keyFragment"){drawExploreGlow(object,object.fragment==="cyan"?"#75edff":"#c887ff",1.8,.24);drawExplorationTileAsset(object,onlineCoopAsset(`key-fragment-${object.fragment}`),1.2)}
 if(object.type==="resonanceVault"&&!object.unlocked){drawExploreGlow(object,"#bb73ff",2,.17);drawExplorationWallAsset(object,onlineCoopAsset("vault-sealed"),2.02);c.fillStyle="#f3dcff";c.font=`900 ${Math.max(8,size*.14)}px sans-serif`;c.fillText("共鳴封印",cx,point.y-size*.62)}
 if(object.type==="coopElite"&&!object.resolved){drawExploreGlow(object,object.accent||"#ff4f7d",2.8,.24);drawExplorationMonster(object,{speciesId:object.speciesId||"dark_knight",visualSpeciesId:object.visualSpeciesId||object.speciesId||"dark_knight",level:Math.max(40,Number(expedition?.floor)||1),currentHp:1,onlineStats:{hp:1}},true,1.58,31);c.fillStyle="#ffe9f2";c.strokeStyle="#180710";c.lineWidth=Math.max(2,size*.045);c.font=`900 ${Math.max(8,size*.14)}px serif`;const label=String(object.bossName||"共闘ボス").slice(0,16);c.strokeText(label,cx,point.y-size*.53);c.fillText(label,cx,point.y-size*.53)}
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
	 return(expedition?.objects??[]).filter(object=>!object.hidden&&(!object.resolved||object.persistent)).filter(object=>["campaignKey","resonanceChest","deluxeChest","coopSwitch","resonanceVault","coopElite","relaySeal","keyFragment","rareGoldenMonster","rareMerchant","rarePortal","rarePortalGuardian","rarePortalChest","rareReturnPortal"].includes(object.type)).map((object,index)=>({y:onlineExploreObjectFoot(object),order:44+index,draw:()=>drawOnlineExploreObject(object,expedition)}))
}
function drawExploreSceneObjects(world,floor,theme,stairsTexture){
 const objects=[];
 const add=(y,order,drawObject)=>objects.push({y:Number(y)||0,order,draw:drawObject});
 ensureExploreDecorations(world).filter(item=>item.type!=="water"&&item.type!=="entrance"&&visibleExploreObject(world,item)).forEach((item,index)=>add(item.y+(item.type==="candelabrum"?.84:.7),10+index,()=>drawExploreDecoration(item,theme)));
 (world.sectionPortals??[]).filter(portal=>portal.sectionId===world.currentSectionId).forEach((portal,index)=>add(portal.y+.15,22+index,()=>drawCampaignSectionPortal(portal)));
 if(!world.treasureRealm&&world.exit?.active!==false&&visibleExploreObject(world,world.exit))add(world.exit.y+.9,30,()=>drawExploreExit(world.exit,stairsTexture,theme));
 if(world.shop&&visibleExploreObject(world,world.shop))add(world.shop.y+.86,40,()=>drawExploreAtlas(world.shop,EXPLORE_ATLAS.entrance,{scale:1.72,rotation:world.shop.rotation??0,shadowColor:"#000",shadowBlur:6}));
	 campaignWorldBosses(world).filter(fieldBoss=>fieldBoss.active!==false&&visibleExploreObject(world,fieldBoss)).forEach((fieldBoss,index)=>{const boss=game?.online?(fieldBoss.onlineBossMonster??world.onlineBossMonster):floorBossEnemy(fieldBoss);if(boss)add(fieldBoss.y+.9,60+index,()=>drawExplorationMonster(fieldBoss,{...boss,speciesId:boss.speciesId,visualSpeciesId:boss.visualSpeciesId,level:boss.level},true,1.92,9+index))});
	 const pursuit=world.campaignHeroPursuit;if(!game?.online&&pursuit&&pursuit.sectionId===world.currentSectionId&&pursuit.state!=="resolved")add(pursuit.y+.9,72,()=>drawExplorationMonster(pursuit,{speciesId:pursuit.heroId,visualSpeciesId:pursuit.heroId,currentHp:1,onlineStats:{hp:1}},true,1.36,27));
	 (world.chests??[]).filter(chest=>visibleExploreObject(world,chest)).forEach((chest,index)=>add(chest.y+.72,50+index,()=>drawExploreAtlas(chest,chest.open?EXPLORE_ATLAS.chestOpen:EXPLORE_ATLAS.chestClosed,{scale:1.7,shadowColor:chest.locked?"#f2cf72":"#000",shadowBlur:chest.locked?13:7})));
	 (world.campaignKeys??[]).filter(key=>!key.collected&&visibleExploreObject(world,key)).forEach((key,index)=>add(key.y+.76,54+index,()=>drawCampaignKey(key)));
	 campaignWorldTrophyChests(world).filter(chest=>visibleExploreObject(world,chest)).forEach((chest,index)=>add(chest.y+.74,58+index,()=>drawCampaignTrophy(chest)));
	 objects.push(...onlineExploreSceneObjects());
	 objects.push(...explorationPartySceneObjects());
 objects.sort((a,b)=>a.y-b.y||a.order-b.order).forEach(entry=>entry.draw())
}
function showTutorialPickupMarker(){
 const markerNow=performance.now(),markerInterval=game?.performanceProfile?.tutorialMarkerInterval??180;if(game?.lastTutorialMarkerAt&&markerNow-game.lastTutorialMarkerAt<markerInterval)return;if(game)game.lastTutorialMarkerAt=markerNow;
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
  if(object.type==="coopElite"&&!object.resolved){drawExploreGlow(object,object.accent||"#ff4f7d",2.8,.24);drawExplorationMonster(object,{speciesId:object.speciesId||"dark_knight",visualSpeciesId:object.visualSpeciesId||object.speciesId||"dark_knight",level:Math.max(40,Number(expedition?.floor)||1),currentHp:1,onlineStats:{hp:1}},true,1.58,31);c.fillStyle="#ffe9f2";c.strokeStyle="#180710";c.lineWidth=Math.max(2,size*.045);c.font=`900 ${Math.max(8,size*.14)}px serif`;const label=String(object.bossName||"共闘ボス").slice(0,16);c.strokeText(label,cx,point.y-size*.53);c.fillText(label,cx,point.y-size*.53)}
  if(object.type==="rareGoldenMonster"&&!object.resolved){drawExploreGlow(object,"#ffd34d",2.6,.24);drawExplorationMonster(object,{speciesId:"rare_golden_beast",level:Math.max(20,Number(expedition?.floor)||1),currentHp:1,onlineStats:{hp:1}},true,1.2,17);c.fillStyle="#fff0a8";c.font=`900 ${Math.max(9,size*.16)}px serif`;c.fillText("黄金乱入",cx,point.y-size*.48)}
  if(object.type==="rareMerchant"){const used=merchantClaimed||object.resolved;c.save();c.globalAlpha=used ? 0.48 : 1;if(!used)drawExploreGlow(object,"#b979ff",2.1,.17);drawExplorationTileAsset(object,onlineCoopAsset(`merchant-${merchantFrame}`),1.34);c.fillStyle=used?"#9d929f":"#f2d8ff";c.font=`900 ${Math.max(9,size*.15)}px serif`;c.fillText(used?"支援受取済":"異界商人",cx,point.y-size*.38);c.restore()}
  if(object.type==="rarePortal"){c.save();c.globalAlpha=object.resolved ? .58 : .84+Math.sin(performance.now()/260)*.12;if(!object.resolved)drawExploreGlow(object,"#a84dff",3,.24);drawExplorationWallAsset(object,onlineCoopAsset(object.resolved?"portal-dormant":"portal-active"),2.16,{active:!object.resolved});c.restore()}
  if(object.type==="rarePortalGuardian"&&!object.resolved){drawExploreGlow(object,"#ff416f",2.4,.22);drawExplorationMonster(object,{speciesId:"dark_knight",level:Math.max(40,Number(expedition?.floor)||1),currentHp:1,onlineStats:{hp:1}},true,1.4,29);c.fillStyle="#ffe0ed";c.font=`900 ${Math.max(9,size*.16)}px serif`;c.fillText("異界の番人",cx,point.y-size*.5)}
  if(object.type==="rarePortalChest"){if(!object.resolved)drawExploreGlow(object,"#d894ff",2.7,.25);drawExplorationGroundAsset(object,chestAsset({...object,rewardTier:"abyss"}),object.resolved?1.45:1.62)}
  if(object.type==="rareReturnPortal"){c.save();c.globalAlpha=.84+Math.sin(performance.now()/260)*.12;drawExploreGlow(object,"#a84dff",2.8,.24);drawExplorationWallAsset(object,onlineCoopAsset("portal-active"),2.08,{active:true});c.restore();c.fillStyle="#efd8ff";c.font=`900 ${Math.max(8,size*.13)}px serif`;c.fillText("主の世界へ帰還",cx,point.y-size*.55)}
 }
 const drawBubble=(cx,cy,text,color="#9f7cff")=>{text=String(text??"").slice(0,28);const font=Math.max(10,13*game.camera.z),padding=Math.max(5,7*game.camera.z);c.font=`800 ${font}px sans-serif`;const width=Math.min(game.canvas.width*.48,Math.max(size*1.2,c.measureText(text).width+padding*2)),height=font+padding*1.7,x=Math.max(4,Math.min(game.canvas.width-width-4,cx-width/2)),y=Math.max(4,cy-height-size*.46);c.fillStyle="rgba(250,247,255,.96)";c.strokeStyle=color;c.lineWidth=Math.max(1,2*game.camera.z);c.beginPath();c.roundRect(x,y,width,height,Math.max(4,8*game.camera.z));c.fill();c.stroke();c.beginPath();c.moveTo(cx-5,y+height);c.lineTo(cx,y+height+7);c.lineTo(cx+5,y+height);c.fill();c.fillStyle="#16101d";c.fillText(text,x+width/2,y+height/2)};
 for(const entry of game.onlineMembers??[]){const entity=game.onlineEntities?.get(entry.member.playerId);if(!entity)continue;const point=game.camera.world(entity.rx*TILE,entity.ry*TILE),cx=point.x+size/2,cy=point.y,hp=Number(entry.member.coopVitals?.hp??1),maxHp=Math.max(1,Number(entry.member.coopVitals?.maxHp??1));if(hp<=0){c.fillStyle="#ff587d";c.strokeStyle="#2b0610";c.lineWidth=Math.max(2,size*.04);c.font=`900 ${Math.max(15,size*.32)}px sans-serif`;c.strokeText("救",cx,cy-size*.18);c.fillText("救",cx,cy-size*.18)}const bubble=(game.onlineChatBubbles??[]).find(item=>item.playerId===entry.member.playerId&&Number(item.expiresAt)>now),social=(game.onlineSocialBubbles??[]).find(item=>item.playerId===entry.member.playerId&&Number(item.expiresAt)>now);if(bubble)drawBubble(cx,cy,bubble.text,entry.member.playerId===game.onlineSelfId?"#79e9ff":"#9f7cff");else if(social)drawBubble(cx,cy,social.label??social.emoji,"#ffd86c");if(entry.member.playerId===game.onlineSelfId)continue;const outside=cx<-8||cy<-8||cx>game.canvas.width+8||cy>game.canvas.height+8;if(outside){const center={x:game.canvas.width/2,y:game.canvas.height/2},dx=cx-center.x,dy=cy-center.y,length=Math.max(1,Math.hypot(dx,dy)),edge={x:center.x+dx/length*(Math.min(game.canvas.width,game.canvas.height)*.42),y:center.y+dy/length*(Math.min(game.canvas.width,game.canvas.height)*.42)},distance=selfEntity?Math.round(Math.hypot(entity.rx-selfEntity.rx,entity.ry-selfEntity.ry)):0,color=hp<=0?"#ff456f":hp/maxHp<=.3?"#ffd34f":"#7deaff";c.fillStyle=color;c.font=`900 ${Math.max(10,size*.14)}px sans-serif`;c.fillText(`${hp<=0?"救助 ":""}${entry.member.profile?.displayName??"仲間"} ${distance}マス`,edge.x,edge.y);c.beginPath();c.moveTo(edge.x+dx/length*12,edge.y+dy/length*12);c.lineTo(edge.x-dy/length*6,edge.y+dx/length*6);c.lineTo(edge.x+dy/length*6,edge.y-dx/length*6);c.fill()}}
 for(const ping of game.onlinePings??[]){if(Number(ping.expiresAt)<=now)continue;const point=game.camera.world(Number(ping.position?.x)*TILE,Number(ping.position?.y)*TILE),cx=point.x+size/2,cy=point.y+size/2,inside=cx>=0&&cy>=0&&cx<=game.canvas.width&&cy<=game.canvas.height;c.fillStyle="#61f2ff";c.strokeStyle="#071118";c.lineWidth=Math.max(2,size*.04);c.font=`900 ${Math.max(14,size*.26)}px sans-serif`;if(inside){c.strokeText("◆",cx,cy-size*.36);c.fillText("◆",cx,cy-size*.36);drawBubble(cx,cy-size*.12,`${ping.name??"仲間"}：${ping.label}`,"#61f2ff")}else{const dx=cx-game.canvas.width/2,dy=cy-game.canvas.height/2,length=Math.max(1,Math.hypot(dx,dy)),radius=Math.min(game.canvas.width,game.canvas.height)*.38;c.fillText(`◆ ${ping.label}`,game.canvas.width/2+dx/length*radius,game.canvas.height/2+dy/length*radius)}}
 c.restore()
}
function draw(){
 const c=game.ctx,w=game.world,floor=game?.online?game.onlineFloor:save.state.player.currentFloor,palette=worldPresentationForFloor(floor),theme=exploreBandTheme(floor),floorTexture=explorationTexture("floor",theme),wallTexture=explorationTexture("wall",theme),stairsTexture=explorationTexture("stairs",theme);
 c.fillStyle="#06070a";c.fillRect(0,0,game.canvas.width,game.canvas.height);c.imageSmoothingEnabled=false;
 const bounds=w.sections?.length?sectionBounds(w,w.currentSectionId,1):{minX:0,minY:0,maxX:w.cols-1,maxY:w.rows-1};for(let y=bounds.minY;y<=bounds.maxY;y++)for(let x=bounds.minX;x<=bounds.maxX;x++){
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
 decorations.filter(item=>(item.type==="water"||item.type==="entrance")&&visibleExploreObject(w,item)).sort((a,b)=>a.y-b.y).forEach(item=>drawExploreDecoration(item,theme));
 if(visibleExploreObject(w,w.hotSpring))drawBossHotSpring(w.hotSpring,theme);
 drawExploreSceneObjects(w,floor,theme,stairsTexture);
 drawExploreAtmosphere(theme);
 drawOnlineExploreOverlays();
 // Only broad, feathered light is repainted above the fog. The actual props
 // stay in the Y-sorted scene so party members can naturally pass in front.
 if(!w.treasureRealm&&w.exit?.active!==false&&visibleExploreObject(w,w.exit))drawExploreSoftAura(w.exit,theme.light,3.25,.075);
 decorations.filter(item=>item.type==="candelabrum"&&visibleExploreObject(w,item)).forEach(item=>drawExploreSoftAura(item,theme.light,2.85,.065));
 drawMini(theme);
 showTutorialPickupMarker();
}
function drawMini(theme=exploreBandTheme(game?.online?game.onlineFloor:save.state.player.currentFloor)){
 const m=document.getElementById("miniMap");
 if(!m||!game?.running)return;
 const w=game.world;
 if(save.state.settings.minimapVisible===false){m.style.opacity=0;return}
 const miniNow=performance.now(),miniInterval=game.performanceProfile?.miniMapInterval??140;if(game.lastMiniMapPaintAt&&miniNow-game.lastMiniMapPaintAt<miniInterval)return;game.lastMiniMapPaintAt=miniNow;
 m.style.opacity=1;
 const c=m.getContext("2d");
 c.fillStyle=theme.dark;c.fillRect(0,0,m.width,m.height);
 if(!game.online&&w.sections?.length){
  const model=buildSectionMiniMapModel(w,{currentSectionId:w.currentSectionId}),transform=fitMiniMapTransform(model,m.width,m.height,Math.max(8,m.width*.045)),markerSignature=model.markers.map(marker=>`${marker.kind}:${marker.x},${marker.y}`).join("|"),cacheKey=`${m.width}x${m.height}:${model.layoutSignature}:${model.visitedIds.sort().join(",")}:${model.frontierIds.sort().join(",")}:${model.currentSectionId}:${markerSignature}`;
  if(game.miniMapTerrainCache?.key!==cacheKey){
   const layer=document.createElement("canvas");layer.width=m.width;layer.height=m.height;const map=layer.getContext("2d");map.fillStyle="rgba(2,3,7,.97)";map.fillRect(0,0,layer.width,layer.height);map.lineCap="round";map.lineJoin="round";
   for(const edge of model.edges){const from=projectMiniMapPoint(transform,{x:edge.from.x+.5,y:edge.from.y+.5}),to=projectMiniMapPoint(transform,{x:edge.to.x+.5,y:edge.to.y+.5}),outerWidth=Math.max(4,transform.scale*1.65),innerWidth=Math.max(2,transform.scale*.74);map.save();map.strokeStyle="#08070c";map.lineWidth=outerWidth;map.beginPath();map.moveTo(from.x,from.y);map.lineTo(to.x,to.y);map.stroke();map.strokeStyle=edge.discovered?"#756184":"#302b38";map.lineWidth=innerWidth;if(!edge.discovered)map.setLineDash([Math.max(2,transform.scale*.8),Math.max(2,transform.scale*.72)]);map.beginPath();map.moveTo(from.x,from.y);map.lineTo(to.x,to.y);map.stroke();map.restore()}
   for(const section of model.sections){const sectionTheme=dungeonThemeForAttribute(section.attribute,save.state.player.currentFloor),cells=new Set(section.cells.map(cell=>`${cell.x},${cell.y}`)),frontier=section.mode==="frontier",active=section.id===model.currentSectionId;map.save();map.globalAlpha=frontier?.52:1;map.fillStyle=frontier?"#121119":sectionTheme.minimapFloor;for(const cell of section.cells){const point=projectMiniMapPoint(transform,cell),x0=Math.floor(point.x),y0=Math.floor(point.y),x1=Math.ceil(point.x+transform.scale+.15),y1=Math.ceil(point.y+transform.scale+.15);map.fillRect(x0,y0,Math.max(1,x1-x0),Math.max(1,y1-y0))}map.strokeStyle=active?"#f7d986":frontier?"#514a59":"#877b66";map.lineWidth=active?Math.max(2,transform.scale*.62):Math.max(1,transform.scale*.34);map.beginPath();for(const cell of section.cells){const point=projectMiniMapPoint(transform,cell),s=transform.scale;if(!cells.has(`${cell.x},${cell.y-1}`)){map.moveTo(point.x,point.y);map.lineTo(point.x+s,point.y)}if(!cells.has(`${cell.x+1},${cell.y}`)){map.moveTo(point.x+s,point.y);map.lineTo(point.x+s,point.y+s)}if(!cells.has(`${cell.x},${cell.y+1}`)){map.moveTo(point.x+s,point.y+s);map.lineTo(point.x,point.y+s)}if(!cells.has(`${cell.x-1},${cell.y}`)){map.moveTo(point.x,point.y+s);map.lineTo(point.x,point.y)}}map.stroke();if(frontier){const point=projectMiniMapPoint(transform,{x:section.center.x+.5,y:section.center.y+.5});map.globalAlpha=.92;map.fillStyle="#9f95a8";map.textAlign="center";map.textBaseline="middle";map.font=`900 ${Math.max(8,transform.scale*2.7)}px serif`;map.fillText("?",point.x,point.y)}map.restore()}
   const markerColor={key:"#ffe266",chest:"#e6b75a",boss:"#ff536f",trophy:"#d980ff",spring:"#69e5ff",exit:"#fff0a2"};for(const marker of model.markers){const point=projectMiniMapPoint(transform,{x:marker.x+.5,y:marker.y+.5}),radius=Math.max(2.2,transform.scale*.82);map.fillStyle=markerColor[marker.kind]??"#fff";map.strokeStyle="#08070c";map.lineWidth=Math.max(1,radius*.34);map.beginPath();if(["chest","trophy","exit"].includes(marker.kind)){map.rect(point.x-radius,point.y-radius,radius*2,radius*2)}else{map.arc(point.x,point.y,radius,0,Math.PI*2)}map.fill();map.stroke()}
   game.miniMapTerrainCache={key:cacheKey,canvas:layer,model,transform}
  }
  c.drawImage(game.miniMapTerrainCache.canvas,0,0);const playerPoint=projectMiniMapPoint(transform,{x:Number(game.player.x)+.5,y:Number(game.player.y)+.5}),playerRadius=Math.max(2.5,Math.min(5,transform.scale*.62));c.save();c.fillStyle="#72efa0";c.strokeStyle="#fff0b5";c.lineWidth=Math.max(1,playerRadius*.34);c.beginPath();c.arc(playerPoint.x,playerPoint.y,playerRadius,0,Math.PI*2);c.fill();c.stroke();const pursuit=w.campaignHeroPursuit;if(pursuit&&pursuit.sectionId===w.currentSectionId){const heroPoint=projectMiniMapPoint(transform,{x:Number(pursuit.x)+.5,y:Number(pursuit.y)+.5}),radius=Math.max(3.5,transform.scale*1.25);c.fillStyle="#e4475e";c.strokeStyle="#ffe2a0";c.beginPath();c.arc(heroPoint.x,heroPoint.y,radius,0,Math.PI*2);c.fill();c.stroke()}c.restore();m.setAttribute("aria-label",`ミニマップ：訪問 ${model.visitedIds.length}/${w.sections.length}区画、隣接する未探索 ${model.frontierIds.length}区画${pursuit?"、勇者追跡中":""}`);return
 }
 const cell=Math.min(m.width/w.cols,m.height/w.rows),ox=(m.width-w.cols*cell)/2,oy=(m.height-w.rows*cell)/2;
 const discovered=new Set(Array.isArray(w.discoveredCells)?w.discoveredCells:[]);
 for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++){
  if(!game.online&&discovered.size&&!discovered.has(`${x},${y}`)){c.fillStyle=theme.dark;c.fillRect(ox+x*cell,oy+y*cell,cell,cell);continue}
  c.fillStyle=w.tiles[y][x]?theme.minimapWall:theme.minimapFloor;
  c.fillRect(ox+x*cell,oy+y*cell,cell,cell)
 }
 if(!w.treasureRealm&&w.exit?.active!==false&&(!discovered.size||discovered.has(`${w.exit.x},${w.exit.y}`))){c.fillStyle=theme.light;c.fillRect(ox+w.exit.x*cell,oy+w.exit.y*cell,cell,cell)}
 if(game.online){for(const entry of game.onlineMembers??[]){const entity=game.onlineEntities?.get(entry.member.playerId);if(!entity)continue;const hp=Number(entry.member.coopVitals?.hp??1),maxHp=Math.max(1,Number(entry.member.coopVitals?.maxHp??1));c.fillStyle=entry.member.playerId===game.onlineSelfId?"#5dff82":hp<=0?"#ff3d68":hp/maxHp<=.3?"#ffd34f":"#74dff4";c.fillRect(ox+entity.x*cell,oy+entity.y*cell,cell,cell)}for(const ping of game.onlinePings??[]){if(Number(ping.expiresAt)<=Date.now())continue;c.fillStyle="#fffb82";c.beginPath();c.arc(ox+(Number(ping.position?.x)+.5)*cell,oy+(Number(ping.position?.y)+.5)*cell,Math.max(2,cell*.8),0,Math.PI*2);c.fill()}}else{c.fillStyle="#5dff82";c.fillRect(ox+game.player.x*cell,oy+game.player.y*cell,cell,cell)}
}
function path(w,s,g){
 const goalIsExit=Boolean(w.exit&&g.x===w.exit.x&&g.y===w.exit.y);
 const exitBlocksPassage=Boolean(w.exit&&w.exit.active!==false&&!w.exit.locked);
 const walk=(x,y)=>{
  if(x<0||y<0||x>=w.cols||y>=w.rows||w.tiles[y][x])return false;
  if(!goalIsExit&&exitBlocksPassage&&x===w.exit.x&&y===w.exit.y)return false;
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
  if(save.state.settings.exploreAutoMode!=="off")stopExploreAuto("手動操作へ切り替え");
  if(decoration){
   const distance=Math.abs(game.player.x-g.x)+Math.abs(game.player.y-g.y);
   if(distance<=1){game.player.path=[];interactExploreDecoration(decoration);return}
  }
  const route=path(game.world,game.player,g);game.player.setPath(route);if(route.length)completeContextGuide("explore_move",{quiet:true})
 };
 c.onpointercancel=c.onlostpointercapture=finish
}
function stopGame(){if(!game)return;game.running=false;if(game.elapsedTimer)clearInterval(game.elapsedTimer);game.miniMapResizeObserver?.disconnect?.();game.miniMapResizeObserver=null;const c=game.canvas;if(c)c.onpointerdown=c.onpointermove=c.onpointerup=c.onpointercancel=c.onlostpointercapture=null}
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
 const visible=type==="critical"?1800:type==="skill"?1650:1450;setTimeout(()=>n.remove(),scaledBattleDelay(visible));await wait(650);
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
function battleSkillMechanics(skill){return skillCombatKeywords(skill).join("・")||"特殊効果"}
async function battleBanner(title,subtitle="",type="normal",duration=700,source=null){
 const arena=document.querySelector(".battle-arena");if(!arena)return;
 arena.querySelector(".battle-cinematic-banner")?.remove();
 const skillBanner=String(type).split(/\s+/).includes("skill"),actorName=source?displayName(source):"",displayTitle=skillBanner?conciseBattleSkillTitle(title,source):String(title??"");
 const sourceArt=source?`<span class="battle-banner-source">${monsterVisual(source,source.emoji??SPECIES[source.speciesId]?.emoji??"●",{className:"battle-banner-source-visual"})}${skillBanner?"":`<em>${actorName}</em>`}</span>`:"";
 const titleClass=[...displayTitle].length>15?" very-long-title":[...displayTitle].length>10?" long-title":"";
 const el=document.createElement("div");el.className=`battle-cinematic-banner ${type}${titleClass}`;el.innerHTML=`${sourceArt}<span class="battle-banner-copy">${skillBanner&&actorName?`<small class="battle-banner-actor">${actorName}</small>`:""}<strong>${displayTitle}</strong>${subtitle?`<small class="battle-banner-effect">${subtitle}</small>`:""}</span>`;arena.appendChild(el);
 const kind=String(type),minimum=kind.includes("biome")?1100:kind.includes("boss")?850:/skill|synergy|capture/.test(kind)?720:duration;
 await wait(Math.max(duration,minimum));el.classList.add("leaving");await wait(kind.includes("biome")?350:minimum>=700?280:200);el.remove();
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
 else if(battle?.specialBattle){const isEmergency=battle.specialBattleType==="emergency",isGauntlet=battle.specialBattleType==="gauntlet",isCampaignFinal=battle.specialBattleType==="campaignFinal",waveTotal=Math.max(1,Number(battle.specialWaveTotal)||1),waveIndex=Math.max(0,Number(battle.specialWaveIndex)||0),waveTitle=waveTotal>1?(waveIndex===waveTotal-1?"FINAL WAVE":`WAVE ${waveIndex+1}/${waveTotal}`):isEmergency?"世界異変":isGauntlet?"深淵の試練":isCampaignFinal?"予言の最終決戦":"部隊戦";battleFlash(isEmergency||isCampaignFinal?"boss":"hit");await battleBanner(waveTitle,battle.specialTitle??(isGauntlet?"奈落回廊":isCampaignFinal?"勇者軍最終決戦":"4対4"),isEmergency||isCampaignFinal?"boss":"encounter",1100)}
 else if(boss){battleFlash("boss");await battleBanner("ボス戦",boss.name,"boss",900)}
 else if(enemies.length>1)await battleBanner("敵部隊",`${enemies.length}体が立ちはだかった`,"encounter",620);
 else await battleBanner("遭遇",enemies[0]?.name??"敵が現れた","encounter",520);
 if(battle?.biomeBattle)await battleBanner(battle.biomeBattle.name,`正式相性：有利 ×1.25 / 不利 ×0.80`,`biome ${battle.biomeBattle.theme}`,650);
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
 const hiddenFloor=Math.max(1,Number(e.enemyFloor??(e.memorySourceFloor||save.state.player.currentFloor))||1),prepared=e.enemyLoadoutVersion===4?e:prepareEnemyEntry(e,hiddenFloor,{forceGear:Boolean(e.boss&&hiddenFloor>=50)}),sp=SPECIES[prepared.speciesId],scaled={...prepared,level:Math.max(1,prepared.level??1)},battleFloor=prepared.fixedTrialScaling?hiddenFloor:save.state.player.currentFloor,enemy=createEnemyBattleState(sp,scaled,battleFloor),profile=prepared.endgameBossId?endgameCharacter(prepared.endgameBossId):null,endgameBase=endgameFactionStatMultiplier(prepared.faction??profile?.faction),mult=(Number(prepared.statMultiplier)||1)*endgameBase;
 enemy.dangerLevel=prepared.boss?5:prepared.speciesId==="mimic"?5:prepared.equipped?4:((prepared.level??1)>save.state.player.currentFloor+4?2:1);
 if(prepared.nameOverride)enemy.name=prepared.nameOverride;
 applyEnemyMultiplier(enemy,mult);
 enemy.fixedTrialScaling=Boolean(prepared.fixedTrialScaling);
 if(enemy.fixedTrialScaling){
  const hpMultiplier=Math.max(1,Number(prepared.fixedTrialHpMultiplier)||1);
  enemy.maxHp=Math.max(1,Math.round(enemy.maxHp*hpMultiplier));enemy.hp=enemy.maxHp;
 }
	 enemy.endgameBossId=prepared.endgameBossId??null;enemy.faction=prepared.faction??profile?.faction??null;enemy.powerRate=prepared.powerRate??null;enemy.manifestationLabel=prepared.manifestationLabel??null;enemy.endgameSupport=Boolean(prepared.endgameSupport);enemy.uncapturable=Boolean(prepared.uncapturable);enemy.trialElement=normalizedElement(prepared.trialElement??prepared.attribute??profile?.element??sp?.element);enemy.id=`enemy-${Date.now()}-${index}-${Math.random().toString(36).slice(2,7)}`;
	 enemy.campaignHeroId=prepared.campaignHeroId??null;enemy.campaignHeroEncounterId=prepared.campaignHeroEncounterId??null;enemy.campaignHeroFinal=Boolean(prepared.campaignHeroFinal);if(enemy.campaignHeroId)enemy.role=CAMPAIGN_HERO_PROFILES[enemy.campaignHeroId]?.combat?.role??enemy.role;
 applyEliteModifiers(enemy,prepared);hydrateEndgameEnemy(enemy,prepared);
 const hidden=enemyHiddenProfileForFloor(hiddenFloor,{rank:prepared.faction??sp?.rarity??"N",faction:prepared.faction,boss:Boolean(prepared.boss),equipped:Boolean(prepared.equipped),slots:prepared.enemyEquipmentSlots,gearLevel:prepared.enemyEquipmentLevel,rarity:prepared.enemyEquipmentRarity});enemy.hiddenProfile=hidden;enemy.hiddenDamageTaken=hidden.damageTaken??1;enemy.hiddenStatusResist=hidden.statusResist??0;enemy.hiddenCapturePressure=hidden.capturePressure??1;enemy.hiddenAi=hidden.ai??0;
 if(hidden.active){enemy.maxHp=Math.max(1,Math.floor(enemy.maxHp*hidden.hp));enemy.hp=enemy.maxHp;enemy.atk=Math.max(1,Math.floor(enemy.atk*hidden.atk));enemy.matk=Math.max(1,Math.floor((enemy.matk??enemy.atk)*hidden.atk));enemy.def=Math.max(0,Math.floor(enemy.def*hidden.def));enemy.mdef=Math.max(0,Math.floor((enemy.mdef??enemy.def)*hidden.def));enemy.spd=Math.max(1,Math.floor(enemy.spd*hidden.spd));enemy.crit=Math.max(enemy.crit??0,hidden.crit??0)}
 if(prepared.equipped){
  enemy.gear=prepared.gear;enemy.enemyGear=prepared.enemyGear;enemy.enemyEquipmentSlots=prepared.enemyEquipmentSlots;enemy.enemyEquipmentLevel=prepared.enemyEquipmentLevel;enemy.enemyEquipmentRarity=prepared.enemyEquipmentRarity;enemy.enemySocketRarity=prepared.enemySocketRarity;enemy.name=`⚔️ ${enemy.name}`;
  for(const item of prepared.enemyGear??[]){const factor=equipmentStatMultiplier(item);enemy.atk+=Math.round((item.stats?.atk??0)*factor);enemy.matk=(enemy.matk??enemy.atk)+Math.round((item.stats?.matk??0)*factor);enemy.def+=Math.round((item.stats?.def??0)*factor);enemy.mdef=(enemy.mdef??enemy.def)+Math.round((item.stats?.mdef??0)*factor);enemy.spd+=Math.round((item.stats?.spd??0)*factor);enemy.maxHp+=Math.round((item.stats?.hp??0)*factor)}enemy.hp=enemy.maxHp;
 }
 applyEnemyMagicCircleProfile(enemy,prepared.enemyMagicCircle);
 applyFloorBossSignatureProfile(enemy);
 // Apply authored carry-over only after every max-HP and magic-circle mutation,
 // so any persistent encounter damage is not silently healed back to full.
 if(Number.isFinite(Number(prepared.carryHp))){enemy.hp=Math.max(1,Math.min(enemy.maxHp,Math.floor(Number(prepared.carryHp))));enemy.campaignCarryHp=enemy.hp}
 else if(Number.isFinite(Number(prepared.carryHpRate))){const carryRate=Math.max(0,Math.min(1,Number(prepared.carryHpRate))),carryHp=Math.min(enemy.maxHp,Math.round(enemy.maxHp*carryRate));enemy.hp=carryRate<=0?0:Math.max(1,carryHp);enemy.campaignCarryHp=enemy.hp}
 // The treasure-room Mimic's impossible offence/armour only exists while it is
 // an enemy. Capturing creates a normal species instance and never copies these.
 if(prepared.speciesId==="mimic"&&!prepared.endgameBossId){enemy.enemyMimicArmor=true;enemy.enemyOnlyMimicProfile=true;enemy.treasureMimic=Boolean(prepared.treasureMimic);enemy.captureRateOverride=.01;enemy.maxHp=5;enemy.hp=5;enemy.atk=Math.max(1,Math.round(enemy.atk*.55));enemy.matk=Math.max(1,Math.round((enemy.matk??enemy.atk)*.55));enemy.def=Math.max(9_999_999,Math.round(enemy.def*500));enemy.mdef=Math.max(9_999_999,Math.round((enemy.mdef??enemy.def)*500));enemy.spd=Math.max(1,Math.round(enemy.spd*.12));enemy.evasion=24;enemy.accuracy=88;enemy.role="財宝を守る奇襲箱"}
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
	 if(battle.specialBattleType==="campaignHero"){const enemy=(battle.enemies??[]).find(entry=>entry.campaignHeroId);if(enemy){const wound=recordCampaignHeroWound(campaignHeroLedger(),{heroId:enemy.campaignHeroId,woundId:`${battle.battleId}:checkpoint:${Math.max(0,Math.floor(enemy.hp))}`,currentHp:enemy.hp,maxHp:enemy.maxHp});normalizeCampaignState(save.state).heroEncounters310=wound.state}}
	 const explorationSnapshot=persistExpeditionSnapshot(snapshot??expeditionSnapshotFromGame(),{saveNow:false})??save.state.expeditionSnapshot??null;
 save.state.activeBattle={
  battleId:battle.battleId,floor:save.state.player.currentFloor,enemies:battle.enemies,turn:battle.turn,turnQueue:battle.turnQueue,queueIndex:battle.queueIndex,
  targetEnemyId:battle.targetEnemyId,auto:battle.auto,explorationAuto:Boolean(battle.explorationAuto),escapePending:Boolean(battle.escapePending),actionCommitted:Boolean(battle.actionCommitted),guards:battle.guards,cooldowns:battle.cooldowns,
  enemyStatuses:battle.enemyStatuses,allyAilments:battle.allyAilments,allyEffects:battle.allyEffects,enemyEffects:battle.enemyEffects,lastStatusTurn:battle.lastStatusTurn,log:battle.log,explorationSnapshot,
	  specialBattle:battle.specialBattle,specialBattleType:battle.specialBattleType,specialTitle:battle.specialTitle,specialSubtitle:battle.specialSubtitle,campaignStage:battle.specialBattleType==="campaignFinal"?(battle.campaignStage==="party"?"party":null):battle.campaignStage??null,campaignHeroId:battle.campaignHeroId??null,campaignHeroEncounterId:battle.campaignHeroEncounterId??null,
  priorVitals:battle.priorVitals,specialBossId:battle.specialBossId,powerPercent:battle.powerPercent,specialFragmentReward:battle.specialFragmentReward??0,manualEndgameChallenge:Boolean(battle.manualEndgameChallenge),
  preludeChoiceId:battle.preludeChoiceId,preludeResultText:battle.preludeResultText,specialTrialNumber:battle.specialTrialNumber??null,specialTrialLoop:battle.specialTrialLoop??null,specialTeamStage:battle.specialTeamStage??null,teamAttemptCharged:Boolean(battle.teamAttemptCharged),teamAttemptDayKey:battle.teamAttemptDayKey??null,specialReturnScreen:battle.specialReturnScreen??null,specialBaseSubtitle:battle.specialBaseSubtitle??null,specialWaves:battle.specialWaves??null,specialWaveIndex:battle.specialWaveIndex??0,specialWaveTotal:battle.specialWaveTotal??1,continuingSpecialWave:Boolean(battle.continuingSpecialWave),
  allySynergy:battle.allySynergy??null,enemySynergy:battle.enemySynergy??null,biomeBattle:battle.biomeBattle??null,battleTheme:battle.battleTheme??"default",
  memoryBattle:Boolean(battle.memoryBattle),bossMemoryBattle:Boolean(battle.bossMemoryBattle),memorySourceFloor:battle.memorySourceFloor??null,memorySpeciesId:battle.memorySpeciesId??null,tutorialCaptureEligible:Boolean(battle.tutorialCaptureEligible),tutorialAttributeBattle:Boolean(battle.tutorialAttributeBattle)
  ,reviveCount:battle.reviveCount??0,delayedSkillEchoes:battle.delayedSkillEchoes??[],performance:battle.performance??{},affectionDeathRecorded:battle.affectionDeathRecorded??{},circleTurnMultipliers:battle.circleTurnMultipliers??{},circleTurnKeys:battle.circleTurnKeys??{},circleCueKeys:battle.circleCueKeys??{},enemyCircleTurnKeys:battle.enemyCircleTurnKeys??{},circleShields:battle.circleShields??{},signatureShields:battle.signatureShields??{},signatureChains:battle.signatureChains??{},signatureExtraRounds:battle.signatureExtraRounds??{},openingCircleBuff:Boolean(battle.openingCircleBuff),magicCircleProfiles:battle.magicCircleProfiles??{},magicCircleArt:battle.magicCircleArt??{},floorBossAliveState:battle.floorBossAliveState??{},floorBossTargetMarks:battle.floorBossTargetMarks??{},floorBossBellMarks:battle.floorBossBellMarks??{}
 };
 if(battle.specialBattleType==="campaignFinal"){
  const campaign=normalizeCampaignState(save.state),stage=battle.campaignStage==="party"?"party":campaign.finalStage;
  if(stage==="party")campaign.finalSessionPending="party";
 }
 save.save()
}
function clearBattleCheckpoint(){const options=arguments[0]&&typeof arguments[0]==="object"?arguments[0]:{},saveNow=options.saveNow!==false;delete save.state.activeBattle;if(saveNow)save.save()}
function resumeSavedBattle(){
 const data=save.state.activeBattle;if(data?.specialBattleType==="campaignHero"&&!campaignHeroCheckpointResumable(data)){delete save.state.activeBattle;settleAbandonedCampaignHeroPursuit("invalid-battle-recovery");save.save();return false}if(!data?.enemies?.length)return false;
 const party=save.state.party.map(id=>save.state.monsters.find(m=>m.id===id)).filter(Boolean);if(!party.length)return false;
 save.state.player.currentFloor=data.floor??save.state.player.currentFloor;snapshot=hydrateExpeditionSnapshot(data.explorationSnapshot??save.state.expeditionSnapshot);
 const explorationAuto=data.specialBattleType==="campaignHero"?Boolean(data.explorationAuto):save.state.settings.exploreAutoMode!=="off"&&!data.specialBattle&&!data.memoryBattle;
 battle={...data,battleId:data.battleId??crypto.randomUUID?.()??`${Date.now()}-${Math.random()}`,party,species:SPECIES,busy:false,guideReady:true,skillMenu:false,itemMenu:false,enemy:data.enemies[0],auto:explorationAuto||data.auto,explorationAuto,reviveCount:data.reviveCount??0,delayedSkillEchoes:data.delayedSkillEchoes??[],performance:data.performance??Object.fromEntries(party.map(monster=>[monster.id,{damage:0,taken:0,healing:0,revives:0,kills:0}])),affectionDeathRecorded:data.affectionDeathRecorded??Object.fromEntries(party.map(monster=>[monster.id,monster.currentHp<=0])),circleTurnMultipliers:data.circleTurnMultipliers??{},circleTurnKeys:data.circleTurnKeys??{},circleCueKeys:data.circleCueKeys??{},enemyCircleTurnKeys:data.enemyCircleTurnKeys??{},circleShields:data.circleShields??{},signatureShields:data.signatureShields??{},signatureChains:data.signatureChains??{},signatureExtraRounds:data.signatureExtraRounds??{},signatureResonances:Object.fromEntries(activeSignatureResonances(save.state,party).map(entry=>[entry.monster.id,entry.definition])),magicCircleProfiles:data.magicCircleProfiles??Object.fromEntries(party.map(monster=>[monster.id,equippedMagicCircle(monster,save.state)])),magicCircleArt:data.magicCircleArt??Object.fromEntries(party.map(monster=>[monster.id,magicCircleMarkup(monster,save.state,{className:"battle-magic-circle"})])),enemyMagicCircleArt:Object.fromEntries((data.enemies??[]).map(enemy=>[enemy.id,enemyMagicCircleMarkup(enemy.enemyMagicCircle)])),openingCircleBuff:Boolean(data.openingCircleBuff),...createBattleRulesState(party),cooldowns:data.cooldowns??{},enemyStatuses:data.enemyStatuses??{},allyAilments:data.allyAilments??Object.fromEntries(party.map(monster=>[monster.id,normalizePersistentAilments(monster.ailments)])),allyEffects:data.allyEffects??{},enemyEffects:data.enemyEffects??{},lastStatusTurn:data.lastStatusTurn??0,log:data.log??[]};
 battle.hpDisplayRates={};battle.hpTrails={};if(!battle.floorBossAliveState)initializeFloorBossDeathTracking();battle.heroResonanceCount=heroResonanceProfile(battle.party).count;battle.invincibleAlliance=invincibleAllianceReady();
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
function circleInfo(monster){
 if(!monster)return null;
 const profile=battle?.magicCircleProfiles&&Object.prototype.hasOwnProperty.call(battle.magicCircleProfiles,monster.id)?battle.magicCircleProfiles[monster.id]:equippedMagicCircle(monster,save.state);if(!profile||profile.id==="none"||profile.levelEffect)return profile;
 const levelEffect=magicCircleLevelEffect(profile,profile.level??1);if(Object.isExtensible(profile)){profile.levelEffect=levelEffect;return profile}return{...profile,levelEffect};
}
function hasCircleEffect(monster,effect){return circleInfo(monster)?.effect===effect}
function circleEffectNumber(monster,key,fallback=0){const value=Number(circleInfo(monster)?.levelEffect?.[key]);return Number.isFinite(value)?value:fallback}
function openingCircleRate(key,fallback=.2){
 if(!battle?.openingCircleBuff)return 0;const values=(battle.party??[]).filter(monster=>hasCircleEffect(monster,"openingBuff")).map(monster=>circleEffectNumber(monster,key,fallback));return values.length?Math.max(...values):fallback;
}
function rageCircleValues(monster){return{damagePerHit:circleEffectNumber(monster,"damagePerHit",.08),maxDamageBonus:circleEffectNumber(monster,"maxDamageBonus",1),firstChainHits:Math.max(1,Math.floor(circleEffectNumber(monster,"firstChainHits",4))),secondChainHits:Math.max(2,Math.floor(circleEffectNumber(monster,"secondChainHits",9)))}}
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
function skillHealingRate(skill,fallback=0){const heal=Number(skill?.heal),selfHeal=Number(skill?.selfHeal);return heal>0?heal:selfHeal>0?selfHeal:fallback}
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
function recoverEnemyBattleMp(enemy,amount){
 if(!enemy||enemy.hp<=0)return 0;const maximum=Math.max(0,Number(enemy.maxMp)||0),before=Math.max(0,Number(enemy.currentMp)||0),rate=battle?Math.max(0,1-Math.min(1,effectValue(battle,enemy.id,"mpRecoveryDown","enemy"))):1,gain=Math.max(0,Math.floor((Number(amount)||0)*rate));enemy.currentMp=Math.min(maximum,before+gain);queueBattleRecovery(enemy,"mp",before,enemy.currentMp);return enemy.currentMp-before;
}
function magicCircleDamageMultiplier(monster){
 if(!monster||!battle)return 1;let value=Math.max(.5,Number(battle.circleTurnMultipliers?.[monster.id])||1),level=circleInfo(monster)?.level??1;
 if(hasCircleEffect(monster,"manaReversal"))value*=circleEffectNumber(monster,"damageMultiplier",1.12+Math.min(.18,level*.004));
 if(battle.openingCircleBuff)value*=1+openingCircleRate("damageRate",.2);
 if(hasCircleEffect(monster,"rage")){const rage=rageCircleValues(monster);value*=1+Math.min(rage.maxDamageBonus,(monster._circleRage??0)*rage.damagePerHit)}
 if(hasCircleEffect(monster,"lowHpPower")){const ratio=monster.currentHp/Math.max(1,calculatedStats(monster).hp);value*=1+(1-ratio)*circleEffectNumber(monster,"maximumDamageBonus",1.25)}
 if(hasCircleEffect(monster,"soleSurvivor")&&battle.party.filter(member=>member.currentHp>0).length===1)value*=circleEffectNumber(monster,"damageMultiplier",2);
 if(hasCircleEffect(monster,"randomSkill")&&monster._randomCircleSkill)value*=1+circleEffectNumber(monster,"randomSkillDamageRate",0);
 if(hasCircleEffect(monster,"goldPower"))value*=goldPowerDamageMultiplier(save.state.player.gold,level);
 return value;
}
function magicCircleCriticalBonus(monster,power=1){let bonus=openingCircleRate("criticalRate",.2);if(hasCircleEffect(monster,"weakCrit"))bonus+=Math.max(circleEffectNumber(monster,"minimumCriticalBonus",.05),circleEffectNumber(monster,"criticalCeiling",.48)-Math.max(0,Number(power)||1)*.1);return bonus}
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
 if(hasCircleEffect(monster,"inheritance")){const attackRate=circleEffectNumber(monster,"attackRate",.3),defenseRate=circleEffectNumber(monster,"defenseRate",.3),speedRate=circleEffectNumber(monster,"speedRate",.2),turns=Math.max(1,Math.floor(circleEffectNumber(monster,"turns",5)));for(const ally of battle.party.filter(member=>member.currentHp>0)){applyBattleEffect(battle,ally.id,{kind:"atkUp",value:attackRate,turns},"ally");applyBattleEffect(battle,ally.id,{kind:"defUp",value:defenseRate,turns},"ally");applyBattleEffect(battle,ally.id,{kind:"spdUp",value:speedRate,turns},"ally")}queueMagicCircleEvent(monster,"力を生存者へ継承",`ATK +${Math.round(attackRate*100)}% / DEF +${Math.round(defenseRate*100)}% / SPD +${Math.round(speedRate*100)}%・${turns}ターン`)}
 if(hasCircleEffect(monster,"deathDrain")){const drainRate=circleEffectNumber(monster,"enemyMpDrainRate",.65);for(const enemy of aliveEnemies(battle))enemy.currentMp=Math.max(0,(enemy.currentMp??0)-Math.floor((enemy.maxMp??0)*drainRate));queueMagicCircleEvent(monster,`敵全体のMPを${Math.round(drainRate*100)}%吸収`,"戦闘不能を魔力枯渇へ変換")}
 syncInvincibleAllianceState();
}
function magicCircleInstantDeath(target,source=null,{force=false}={}){
 if(!target)return false;
 const ally=Object.prototype.hasOwnProperty.call(target,"currentHp"),alive=ally?target.currentHp>0:target.hp>0;if(!alive)return false;
 if(ally&&hasCircleEffect(target,"deathMirror")&&!target._circleDeathMirrorUsed){
  target._circleDeathMirrorUsed=true;
  if(source){if(Object.prototype.hasOwnProperty.call(source,"currentHp")){source.currentHp=0;handleMagicCircleDeath(source)}else if(Object.prototype.hasOwnProperty.call(source,"hp"))applyEnemyDamage(battle,source,source.hp)}
  const healRate=circleEffectNumber(target,"reflectedHealRate",0),beforeHp=target.currentHp;if(healRate>0)recoverBattleHp(target,Math.max(1,Math.floor(calculatedStats(target).hp*healRate)),calculatedStats(target).hp);addBattleLog(battle,`${displayName(target)}の死返しが即死を反射`);queueMagicCircleEvent(target,"即死を無効化・反射",healRate>0?`HP${Math.round(healRate*100)}%回復・最初の即死だけ発動`:"最初の即死だけ発動");if(target.currentHp>beforeHp)recordBattleHealing(target,target.currentHp-beforeHp);return true;
 }
 if(ally){target.currentHp=0;handleMagicCircleDeath(target)}else if(force)target.hp=0;else applyEnemyDamage(battle,target,target.hp);return false;
}
function captureCrystalCost(){return 1}
function tryUnyielding(monster){
 const passive=SPECIES[monster.speciesId]?.passive;
 if(passive?.kind==="onceRevive"&&!monster._speciesReviveUsed&&canBattleRevive()){const beforeHp=monster.currentHp,beforeMp=monster.currentMp;monster._speciesReviveUsed=true;battle.reviveCount++;monster.currentHp=Math.max(1,Math.floor(calculatedStats(monster).hp*(passive.hp??.5)));monster.currentMp=Math.max(0,Math.floor(maxMp(monster)*(passive.mp??.5)));queueBattleRecovery(monster,"hp",beforeHp,monster.currentHp);queueBattleRecovery(monster,"mp",beforeMp,monster.currentMp);battleContribution(monster).revives++;syncInvincibleAllianceState();return true}
 if(hasCircleEffect(monster,"revive")&&!monster._circleReviveUsed&&canBattleRevive()){const beforeHp=monster.currentHp,beforeMp=monster.currentMp,hpRate=circleEffectNumber(monster,"reviveHpRate",.4),mpRate=circleEffectNumber(monster,"reviveMpRate",.25);monster._circleReviveUsed=true;battle.reviveCount++;monster.currentHp=Math.max(1,Math.floor(calculatedStats(monster).hp*hpRate));monster.currentMp=Math.max(0,Math.floor(maxMp(monster)*mpRate));queueBattleRecovery(monster,"hp",beforeHp,monster.currentHp);queueBattleRecovery(monster,"mp",beforeMp,monster.currentMp);battleContribution(monster).revives++;queueMagicCircleEvent(monster,"輪廻転生",`HP${Math.round(hpRate*100)}%・MP${Math.round(mpRate*100)}%で蘇生`);syncInvincibleAllianceState();return true}
 if(hasCircleEffect(monster,"lastLife")&&!monster._circleLastLifeUsed){const surviveHpRate=circleEffectNumber(monster,"surviveHpRate",0),minimumHp=Math.max(1,Math.floor(circleEffectNumber(monster,"minimumHp",1)));monster._circleLastLifeUsed=true;monster.currentHp=Math.max(minimumHp,Math.floor(calculatedStats(monster).hp*surviveHpRate));queueMagicCircleEvent(monster,"致死ダメージを耐えた",surviveHpRate>0?`HP${Math.round(surviveHpRate*1000)/10}%で踏みとどまる・戦闘中1回`:`HP${minimumHp}で踏みとどまる・戦闘中1回`);return true}
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
 const shieldOwner=battle.party.find(monster=>hasCircleEffect(monster,"shield"));if(shieldOwner){const rate=circleEffectNumber(shieldOwner,"shieldRate",.5);await magicCircleActivationFx(shieldOwner,circleInfo(shieldOwner),`最大HP${Math.round(rate*100)}%の障壁を展開`,`味方全体を保護`,{duration:580})}
 const opener=battle.party.find(monster=>hasCircleEffect(monster,"openingBuff"));if(opener){const damageRate=openingCircleRate("damageRate",.2),criticalRate=openingCircleRate("criticalRate",.2);await magicCircleActivationFx(opener,circleInfo(opener),`最終ダメージ +${Math.round(damageRate*100)}%・会心率 +${Math.round(criticalRate*100)}%`,`味方全体・戦闘開始時`,{duration:620})}
 for(const owner of battle.party.filter(monster=>monster.currentHp>0&&hasCircleEffect(monster,"sacrifice"))){
  const allies=battle.party.filter(monster=>monster.currentHp>0),foes=aliveEnemies(battle);if(allies.length<2||!foes.length)continue;
  const victim=allies[Math.floor(Math.random()*allies.length)],foe=foes[Math.floor(Math.random()*foes.length)];magicCircleInstantDeath(victim,owner);magicCircleInstantDeath(foe,owner);registerWeaponFinisher(owner,foe,1);const survivorShieldRate=circleEffectNumber(owner,"survivorShieldRate",0);if(survivorShieldRate>0){battle.circleShields??={};for(const survivor of battle.party.filter(monster=>monster.currentHp>0)){const amount=Math.max(1,Math.floor(calculatedStats(survivor).hp*survivorShieldRate));battle.circleShields[survivor.id]=Math.max(Math.max(0,Number(battle.circleShields[survivor.id])||0),amount)}}await magicCircleActivationFx(owner,circleInfo(owner),"味方1体 ⇄ 敵1体",`${displayName(victim)} / ${foe.name}へ即死判定${survivorShieldRate>0?`・生存者へHP${Math.round(survivorShieldRate*100)}%障壁`:""}`,{danger:true,duration:800});await flushMagicCircleEvents();
 }
 if(!aliveEnemies(battle).length)return win(false,null);if(!battle.party.some(monster=>monster.currentHp>0))return lose();renderBattle();
}
function allyMagicCircleTurnCue(monster,circle){
 const level=Math.max(1,Number(circle?.level)||1),effect=circle?.levelEffect??magicCircleLevelEffect(circle,level),hpRatio=monster.currentHp/Math.max(1,calculatedStats(monster).hp);
 if(circle.effect==="manaReversal"){const multiplier=Number(effect.damageMultiplier)||(1.12+Math.min(.18,level*.004));return{headline:`与ダメージ ×${multiplier.toFixed(2)}`,detail:"MP回復時は回復量に応じてHPを消費"}}
 if(circle.effect==="rage"&&(monster._circleRage??0)>0){const hits=monster._circleRage??0,damagePerHit=Number(effect.damagePerHit)||.08,maxDamageBonus=Number(effect.maxDamageBonus)||1,multiplier=1+Math.min(maxDamageBonus,hits*damagePerHit),first=Math.max(1,Math.floor(Number(effect.firstChainHits)||4)),second=Math.max(first+1,Math.floor(Number(effect.secondChainHits)||9)),chains=hits>=second?2:hits>=first?1:0;return{headline:`被弾 ${hits}回・最終ダメージ ×${multiplier.toFixed(2)}`,detail:`追加連撃 ${chains}回`}}
 if(circle.effect==="weakCrit"){const bonus=Math.max(Number(effect.minimumCriticalBonus)||.05,(Number(effect.criticalCeiling)||.48)-.1);return{headline:`弱攻撃の会心率 +${Math.round(bonus*100)}%`,detail:"攻撃倍率が低いほど会心補正が上昇"}}
 if(circle.effect==="goldPower"){const gold=Math.max(0,Number(save.state.player.gold)||0),multiplier=goldPowerDamageMultiplier(gold,circle.level),cost=Math.min(gold,goldPowerActionCost(gold)),cap=Math.round((.18+(Math.max(1,circle.level)-1)/98*.12)*100);return{headline:`所持GOLD換力 ×${multiplier.toFixed(2)}`,detail:`強い逓減・最大+${cap}% / 行動後 ${cost.toLocaleString()}G消費`}}
 if(circle.effect==="soleSurvivor"&&battle.party.filter(member=>member.currentHp>0).length===1){const multiplier=Number(effect.damageMultiplier)||2,reduction=Number(effect.damageReductionRate)||.4;return{headline:`孤王覚醒・最終ダメージ ×${multiplier.toFixed(2)}`,detail:`被ダメージ${Math.round(reduction*100)}%軽減・最後の生存者`}}
 if(circle.effect==="lowHpPower"&&hpRatio<.9){const multiplier=1+(1-hpRatio)*(Number(effect.maximumDamageBonus)||1.25);return{headline:`残HP ${Math.round(hpRatio*100)}%・最終ダメージ ×${multiplier.toFixed(2)}`,detail:"HPが少ないほど威力上昇"}}
 if(circle.effect==="endgameNoCrit"&&aliveEnemies(battle).some(enemy=>enemy.endgameBossId||["abyss","tenGod"].includes(enemy.faction))){const reduction=Number(effect.damageReductionRate)||0;return{headline:"深淵・十神の会心を封殺",detail:`対象から受ける攻撃はクリティカルにならない${reduction?`・被ダメージ${Math.round(reduction*100)}%軽減`:""}`}}
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
  const roll=Math.floor(Math.random()*1000),multiplier=slotDamageMultiplier(roll,circle.level),digits=String(roll).padStart(3,"0"),instantKill=roll===999,victim=instantKill?(selectedEnemy(battle)??aliveEnemies(battle)[0]):null;battle.circleTurnMultipliers[monster.id]=multiplier;battle.busy=true;renderBattle();
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
 const roomProfile=!options.specialBattle&&!options.memoryBattle&&game?.world?.currentAttribute?campaignRoomProfile(game.world.currentAttribute):null,party=save.state.party.map(id=>save.state.monsters.find(monster=>monster.id===id)).filter(Boolean),synergy=partySynergy(),biomeBattle=!options.specialBattle&&!options.memoryBattle?(roomProfile?campaignSectionEnvironment(save.state.player.currentFloor,roomProfile.id):battleBiomeForFloor(save.state.player.currentFloor)):null;
 party.forEach(monster=>{
  delete monster._synergy;
  const previousMaxHp=Math.max(1,Number(calculatedStats(monster).hp)||1),wasAlive=monster.currentHp==null||Number(monster.currentHp)>0;
  const element=normalizedElement(monster.attribute??SPECIES[monster.speciesId]?.element),matches=synergy&&element===synergy.element,terrain=biomeElementMultiplier(biomeBattle,element)-1;
  monster._synergy={atk:(matches?synergy.atk??0:0)+terrain,def:(matches?synergy.def??0:0)+terrain,hp:(matches?synergy.hp??0:0)+terrain,spd:(matches?synergy.spd??0:0)+terrain,crit:matches?synergy.crit??0:0,evasion:matches?synergy.evasion??0:0};
  if(!options.continuingSpecialWave){monster._unyieldingUsed=false;monster._speciesReviveUsed=false;monster._guardianPassiveUsed=false;monster._circleReviveUsed=false;monster._circleLastLifeUsed=false;monster._circleDeathMirrorUsed=false;monster._circleJudgmentUsed=false;monster._circleRage=0;monster._circleDeathHandled=false;monster._randomCircleSkill=false}
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
 const reincarnation=normalizeCampaignReincarnationState(save.state);if(reincarnation.cycle>0&&!options.memoryBattle&&!options.specialBattle){const cycleMultiplier=campaignReincarnationDifficultyMultiplier(save.state);enemies.forEach(enemy=>{applyEnemyMultiplier(enemy,cycleMultiplier);enemy.reincarnationCycle=reincarnation.cycle;enemy.reincarnationMultiplier=cycleMultiplier})}
 if(options.specialBattleType==="team")balanceTeamBattleEnemies(enemies,party.map(monster=>calculatedStats(monster)),options.specialTeamStage??1);
 enemies.filter(enemy=>enemy.elite).forEach(enemy=>recordEliteEncounter(save.state,enemy));save.save();
 const endgameFaction=enemies.find(enemy=>enemy.faction)?.faction,battleTheme=endgameFaction==="tenGod"?"ten-gods":endgameFaction==="abyss"?"abyss":roomProfile?.battleTheme??(enemies.some(enemy=>enemy.boss)?"boss":biomeBattle?.theme??"default");
 const explorationAuto=!tutorialCaptureEligible&&!tutorialAttributeBattle&&save.state.settings.exploreAutoMode!=="off"&&!options.specialBattle&&!options.memoryBattle;
 battle={battleId:crypto.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`,enemies,enemy:enemies[0],targetEnemyId:enemies[0]?.id,party,species:SPECIES,turn:1,busy:false,guideReady:false,auto:explorationAuto||save.state.settings.autoBattle,explorationAuto,guards:{},escapePending:false,actionCommitted:false,skillMenu:false,itemMenu:false,allySynergy:synergy,enemySynergy,biomeBattle,battleTheme,battleRoomAttribute:roomProfile?.id??null,biomePanelCollapsed:false,biomePanelCollapseAt:Date.now()+(explorationAuto?900:1800),reviveCount:0,delayedSkillEchoes:[],equipmentAuthorityCueKeys:{},performance:Object.fromEntries(party.map(monster=>[monster.id,{damage:0,taken:0,healing:0,revives:0,kills:0}])),affectionDeathRecorded:Object.fromEntries(party.map(monster=>[monster.id,monster.currentHp<=0])),circleTurnMultipliers:{},circleTurnKeys:{},circleCueKeys:{},enemyCircleTurnKeys:{},circleShields:{},signatureShields:{},signatureChains:{},signatureExtraRounds:{},signatureResonances:Object.fromEntries(activeSignatureResonances(save.state,party).map(entry=>[entry.monster.id,entry.definition])),hpDisplayRates:{},hpTrails:{},magicCircleProfiles:Object.fromEntries(party.map(monster=>[monster.id,equippedMagicCircle(monster,save.state)])),magicCircleArt:Object.fromEntries(party.map(monster=>[monster.id,magicCircleMarkup(monster,save.state,{className:"battle-magic-circle"})])),enemyMagicCircleArt:Object.fromEntries(enemies.map(enemy=>[enemy.id,enemyMagicCircleMarkup(enemy.enemyMagicCircle)])),openingCircleBuff:party.some(monster=>hasCircleEffect(monster,"openingBuff")),...createBattleRulesState(party),...options};
 battle.tutorialCaptureEligible=tutorialCaptureEligible;battle.tutorialAttributeBattle=tutorialAttributeBattle;
 if(tutorialCaptureEligible){battle.auto=false;save.state.settings.autoBattle=false;save.state.settings.exploreAutoMode="off";const target=enemies[0];if(target){const oldHp=Math.max(1,target.maxHp);target.maxHp=Math.max(oldHp,Math.round(oldHp*6));target.hp=target.maxHp;target.atk=Math.max(1,Math.floor(target.atk*.28));target.matk=Math.max(1,Math.floor((target.matk??target.atk)*.28));save.state.inventory.captureCrystals=Math.max(Number(save.state.inventory.captureCrystals)||0,captureCrystalCost(target))}save.state.inventory.potions=Math.max(1,Number(save.state.inventory.potions)||0);save.save()}
 if(tutorialAttributeBattle){battle.auto=false;save.state.settings.autoBattle=false;save.save()}
 initializeFloorBossDeathTracking();battle.heroResonanceCount=heroResonanceProfile(battle.party).count;battle.invincibleAlliance=invincibleAllianceReady();
 const shieldOwner=party.find(monster=>hasCircleEffect(monster,"shield"));if(shieldOwner){const shieldRate=circleEffectNumber(shieldOwner,"shieldRate",.5);party.forEach(monster=>battle.circleShields[monster.id]=Math.floor(calculatedStats(monster).hp*shieldRate))}
 audio.setScene(enemies.some(enemy=>enemy.faction==="tenGod")?"divine":enemies.some(enemy=>enemy.faction==="abyss")?"abyss":enemies.some(enemy=>enemy.elite)?"elite":enemies.some(enemy=>enemy.boss)?"boss":"battle");audio.sfx(enemies.some(enemy=>enemy.endgameBossId||enemy.boss)?"boss":"select");
 buildTurnQueue(battle);
 if(tutorialCaptureEligible||tutorialAttributeBattle){const firstAlly=battle.turnQueue.findIndex(entry=>entry.type==="ally");if(firstAlly>0)battle.turnQueue.unshift(...battle.turnQueue.splice(firstAlly,1))}
 if(synergy)addBattleLog(battle,`${synergy.name}が発動！`);
 if(enemySynergy)addBattleLog(battle,`敵軍の${enemySynergy.name}が発動！`);
 if(biomeBattle)addBattleLog(battle,`${biomeBattle.name}：属性ダメージは正式な循環相性で判定`);
 for(const{monster,authority}of battleEquipmentAuthorityRows(party))addBattleLog(battle,`装備固有能力｜${displayName(monster)}・${authority.name} 有効：${authority.description}`);
 if(options.memoryBattle)addBattleLog(battle,`深淵の記憶から${enemies[0]?.name??"魔物"}が現れた`);
 for(const enemy of enemies.filter(unit=>unit.floorBossPassive&&unit.floorBossDomain)){addBattleLog(battle,`${enemy.floorBossPassive.name}／${enemy.floorBossDomain.name}が発動`)}
 {const resonance=heroResonanceProfile(battle.party);if(resonance.count>=2)addBattleLog(battle,`${resonance.name}・${resonance.count}神話共鳴が発動！ 最大${resonance.totalActions}回行動`)}
 for(const monster of party){const resonance=signatureResonance(monster);if(!resonance)continue;if(resonance.awakened)battle.signatureShields[monster.id]=Math.max(1,Math.floor(calculatedStats(monster).hp*.25));addBattleLog(battle,`${displayName(monster)}：専用共鳴「${resonance.name}」${resonance.awakened?"6点・完全覚醒":`${resonance.pieces}/6`} 発動中`)}
 addBattleLog(battle,`行動順：${battle.turnQueue.map(entry=>entry.name).join(" → ")}`);
 saveBattleCheckpoint();renderBattle();setTimeout(async()=>{await battleIntro(enemies);const authorityRows=battleEquipmentAuthorityRows(party);if(authorityRows.length){const labels=authorityRows.slice(0,3).map(({monster,authority})=>`${displayName(monster)}・${authority.name}`),remaining=authorityRows.length-labels.length;await battleBanner("装備固有能力 有効",`${labels.join("／")}${remaining?`／ほか${remaining}種`:""}`,"equipment-authority",650)}const heroResonance=heroResonanceProfile(battle?.party??[]);if(heroResonance.count>=2)await battleBanner(heroResonance.name,`${heroResonance.count}神話共鳴・1ラウンド最大${heroResonance.totalActions}回発動`,`synergy invincible`,900,party[0]);for(const monster of party){const resonance=signatureResonance(monster);if(resonance)await battleBanner(resonance.awakened?"専用6点・完全覚醒":"専用共鳴 発動中",`${displayName(monster)}・${resonance.name} ${resonance.pieces}/6`,"synergy",resonance.awakened?720:480,monster)}await applyOpeningMagicCircles();if(!battle)return;battle.guideReady=true;renderBattle();continueBattleFlow()},scaledBattleDelay(120))
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
function scheduleBattleBiomePanelCollapse(){
 clearTimeout(battleBiomePanelTimer);battleBiomePanelTimer=null;
 const activeBattle=battle;if(!activeBattle?.biomeBattle||activeBattle.biomePanelCollapsed||activeBattle.biomePanelManual)return;
 const deadline=Number(activeBattle.biomePanelCollapseAt)||Date.now()+1800;activeBattle.biomePanelCollapseAt=deadline;const remaining=deadline-Date.now();
 if(remaining<=0){activeBattle.biomePanelCollapsed=true;requestAnimationFrame(()=>{if(battle===activeBattle)renderBattle()});return}
 battleBiomePanelTimer=setTimeout(()=>{battleBiomePanelTimer=null;if(battle!==activeBattle||activeBattle.biomePanelManual)return;activeBattle.biomePanelCollapsed=true;renderBattle()},remaining)
}
function renderBattle(){
 if(!battle)return;
 sanitizeBattleParty();
 clearContextGuide();
 refreshBattleHpTrails();
 app.classList.add("battle-active");document.querySelector(".battle-screen")?.remove();app.insertAdjacentHTML("beforeend",BattleScreen(battle,save.state.inventory,save.state.settings,save.state.player.currentFloor));
 document.querySelectorAll("[data-command]").forEach(button=>button.onclick=()=>command(button.dataset.command));
 document.querySelectorAll("[data-skill-id]").forEach(button=>button.onclick=()=>command("skill",button.dataset.skillId));
 document.querySelectorAll("[data-battle-item]").forEach(button=>button.onclick=()=>openBattleItemTarget(button.dataset.battleItem));
 document.querySelectorAll("[data-battle-detail]").forEach(button=>button.onclick=()=>showBattleMonsterDetail(button.dataset.battleDetail));
 document.querySelectorAll("[data-status-detail]").forEach(button=>button.onclick=event=>{event.stopPropagation();openBattleStatusDetail(button.dataset.statusDetail)});
 document.querySelector("[data-battle-biome-toggle]")?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();if(!battle)return;battle.biomePanelCollapsed=!battle.biomePanelCollapsed;battle.biomePanelManual=true;battle.biomePanelCollapseAt=0;renderBattle()});
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
 scheduleBattleBiomePanelCollapse();
 requestAnimationFrame(scheduleBattleContextGuide);
}
async function requestEscape(){
 if(!battle||battle.escapePending)return;
 const special=Boolean(battle.specialBattle);
 if(special&&!confirm("この戦闘から撤退しますか？\n撤退した戦闘の報酬は獲得できず、消費済みの挑戦回数は戻りません。"))return;
 battle.auto=false;save.state.settings.autoBattle=false;save.save();
 battle.escapePending=true;addBattleLog(battle,special?(battle.busy?"オートを停止。現在の行動後に撤退します":"撤退を選択した"):(battle.busy?"オートを停止。現在の行動後に逃走します":"逃走を試みる"));saveBattleCheckpoint();renderBattle();
 if(!battle.busy)await resolveEscape();
}
async function resolveEscape(){
 if(!battle?.escapePending||battle.busy)return false;
 battle.busy=true;battle.escapePending=false;
 if(battle.specialBattle)return retreatSpecialBattle();
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
	 if(Number(passive.mpOnDodgeRate)>0){const maximum=Math.max(0,Number(enemy.maxMp)||0),gain=recoverEnemyBattleMp(enemy,Math.max(1,Math.floor(maximum*Math.min(.5,Number(passive.mpOnDodgeRate)))));if(gain)addBattleLog(battle,`${enemy.name}：${passive.name}でMP${gain}回収`)}
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
async function resolveCompositeSkillRevive(skill,source){
 if(!(Number(skill?.revive)>0||Number(skill?.reviveTransferRate)>0))return null;
 const target=battle.party.filter(monster=>monster.currentHp<=0&&!hasEffect(battle,monster.id,"reviveSeal")).sort((left,right)=>calculatedStats(right).hp-calculatedStats(left).hp)[0];
 if(!target||!reviveBattleMonster(target,skill.revive??.01,skill.reviveMp??.25,source,{transferRate:skill.reviveTransferRate}))return null;
 applyRevivedSkillEffects(skill,target,source);await flushBattleRecoveries();addBattleLog(battle,`${displayName(source)}：${skill.name}の追加効果で${displayName(target)}が復帰`);return target;
}
const RANDOM_SKILL_ELEMENTS=Object.freeze(Object.keys(ATTRIBUTES).filter(id=>id!=="neutral"&&id!=="thunder"));
function resolveRandomSkillElement(skill){return skill?.randomElement?{...skill,element:RANDOM_SKILL_ELEMENTS[Math.floor(Math.random()*RANDOM_SKILL_ELEMENTS.length)]??"neutral"}:skill}
function turnPowerMultiplier(skill){const step=Math.max(0,Number(skill?.turnPowerStep)||0),cap=Math.max(0,Number(skill?.turnPowerCap)||0),elapsed=Math.max(0,(Number(battle?.turn)||1)-1);return 1+Math.min(cap,elapsed*step)}
function invincibleAllianceReady(){return heroResonanceProfile(battle?.party??[]).invincible}
function initializeFloorBossDeathTracking(){
 if(!battle)return;battle.floorBossAliveState={};for(const monster of battle.party??[])battle.floorBossAliveState[`ally:${monster.id}`]=monster.currentHp>0;for(const enemy of battle.enemies??[])battle.floorBossAliveState[`enemy:${enemy.id}`]=enemy.hp>0;
}
function syncFloorBossDeathEvents(){
 if(!battle)return 0;if(!battle.floorBossAliveState){initializeFloorBossDeathTracking();return 0}let deaths=0;
 const units=[...(battle.party??[]).map(unit=>({key:`ally:${unit.id}`,alive:unit.currentHp>0})),...(battle.enemies??[]).map(unit=>({key:`enemy:${unit.id}`,alive:unit.hp>0}))];
 for(const unit of units){const previous=battle.floorBossAliveState[unit.key];if(previous===true&&!unit.alive)deaths++;battle.floorBossAliveState[unit.key]=unit.alive}
 if(!deaths)return 0;
 for(const enemy of(battle.enemies??[]).filter(unit=>unit.hp>0&&unit.floorBossDomain?.effect==="deathCompost")){const domain=enemy.floorBossDomain,healed=recoverFloorBossHp(enemy,Math.max(1,Math.floor(enemy.maxHp*Math.max(0,Number(domain.healRate)||0)*deaths))),gain=recoverEnemyBattleMp(enemy,Math.max(1,Math.floor((enemy.maxMp??1)*Math.max(0,Number(domain.mpRate)||0)*deaths)));addBattleLog(battle,`${domain.name}：死${deaths}体を菌糧化 HP+${healed.toLocaleString()}・MP+${gain}`)}
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
 if(!battle)return false;syncFloorBossDeathEvents();const previous=Math.max(0,Number(battle.heroResonanceCount)||0),profile=heroResonanceProfile(battle.party??[]),next=profile.count;battle.heroResonanceCount=next;battle.invincibleAlliance=profile.invincible;
 if(announce&&previous!==next){const label=next>=2?`${profile.name}：${next}神話共鳴・1ラウンド最大${profile.totalActions}回発動`:next===1?"勇者共鳴が消失した":"四勇者が戦線を離脱した";addBattleLog(battle,label);setTimeout(()=>{if(battle)battleBanner(profile.name,next>=2?`${next}神話が生存・最大${profile.totalActions}回発動`:"仲間が復帰すると共鳴が再開","synergy invincible",620,battle.party.find(monster=>monster.currentHp>0&&isHeroResonanceSpecies(monster.speciesId)))},0)}
 return profile.invincible;
}
function shuffledBattleEntries(entries){const next=[...entries];for(let index=next.length-1;index>0;index--){const swap=Math.floor(Math.random()*(index+1));[next[index],next[swap]]=[next[swap],next[index]]}return next}
function usefulHeroResonanceSkill(member,skill){
 if(!skill||Number(skill.selfSacrificeHpDamage)>0||cooldownRemaining(battle,member.id,skill.id)>0)return false;
 const living=(battle.party??[]).filter(ally=>ally.currentHp>0),fallen=(battle.party??[]).filter(ally=>ally.currentHp<=0&&!hasEffect(battle,ally.id,"reviveSeal"));
 if(skill.type==="revive")return fallen.length>0;
 if(skill.type==="mpHeal")return living.some(ally=>(ally.currentMp??0)<maxMp(ally));
 if(skill.type==="cleanse")return living.some(ally=>(ally.ailments??[]).length||(battle.allyEffects?.[ally.id]??[]).some(effect=>String(effect.kind).endsWith("Down")||String(effect.kind).startsWith("status:")));
 if(skill.type==="allHeal")return living.some(ally=>ally.currentHp<calculatedStats(ally).hp)||Boolean(skill.cleanse)||fallen.length>0&&Boolean(skill.revive||skill.reviveTransferRate)||Boolean(skill.effects?.length);
 if(skill.type==="selfHeal")return member.currentHp<calculatedStats(member).hp||Boolean(skill.cleanse)||Boolean(skill.effects?.length)||Number(skill.selfShieldRate)>0;
 return true;
}
function applyHeroResonancePressure(member,count){
 const enemies=aliveEnemies(battle);for(const enemy of enemies)for(const effect of heroPersonalPressure(member.speciesId,count))applyBattleEffect(battle,enemy.id,{...effect,chance:1,sourceKey:`hero-resonance:${member.speciesId}:${effect.kind}`,sourceMonsterId:member.id,sourceName:displayName(member),sourceSkillName:"勇者共鳴"},"enemy");
 if(member.speciesId==="myth_rion")for(const enemy of enemies){const drain=Math.min(enemy.currentMp??0,Math.max(1,Math.floor((enemy.maxMp??1)*.1)));enemy.currentMp=Math.max(0,(enemy.currentMp??0)-drain);enemy.specialCooldown=Math.max(0,Number(enemy.specialCooldown)||0)+1}
}
function applyInvinciblePressure(){
 if(!battle||battle._heroInvinciblePressureTurn===battle.turn)return;battle._heroInvinciblePressureTurn=battle.turn;
 battle.enemyEffects??={};
 for(const enemy of aliveEnemies(battle)){for(const effect of HERO_INVINCIBLE_PRESSURE.effects)applyBattleEffect(battle,enemy.id,{...effect,chance:1,sourceKey:`hero-invincible:${effect.kind}`,sourceName:"四勇者",sourceSkillName:"無敵"},"enemy");const effects=battle.enemyEffects?.[enemy.id]??[];for(const effect of effects)if(POSITIVE_ENEMY_EFFECTS.has(effect.kind))effect.turns=Math.max(0,(Number(effect.turns)||0)-HERO_INVINCIBLE_PRESSURE.buffTurnPenalty);battle.enemyEffects[enemy.id]=effects.filter(effect=>(Number(effect.turns)||0)>0)}
 addBattleLog(battle,"無敵圧：敵全体の攻撃・防御・速度-25%、HP/MP回復-50%、強化を1ターン短縮");
}
async function performInvincibleAllianceSkill(member,skill){
 if(!member||member.currentHp<=0||!skill||!aliveEnemies(battle).length)return;
 setSkillCooldown(battle,member.id,skill);skill=applySkillMastery(member,scaleHeroResonanceSkill(resolveRandomSkillElement(skill)));
 const target=aliveEnemies(battle)[Math.floor(Math.random()*aliveEnemies(battle).length)],stats=convertedAttackStats(calculatedStats(member),member.id);
 addBattleLog(battle,`勇者共鳴：${displayName(member)}が${skill.name}を70%威力・MP消費なしで追加発動`);
 await battleBanner(skill.name,"共鳴追加発動・威力70%・MP消費なし","synergy",460,member);
 applyHeroResonancePressure(member,heroResonanceProfile(battle.party).count);
 if(skill.type==="selfHeal"||skill.type==="stance"&&skill.heal){const amount=Math.max(1,Math.floor(stats.hp*skillHealingRate(skill,.2)*healMultiplier(member))),gained=recoverBattleHp(member,amount,stats.hp);recordBattleHealing(member,gained);if(skill.cleanse){clearNegativeAllyEffects(battle,member.id);clearAilments(member)}applySkillEffects(skill,member,target);await flushBattleRecoveries();await floatText(`+${gained}`,member.id,"heal");return}
 if(skill.type==="allHeal"){let maximum=0;for(const ally of battle.party.filter(entry=>entry.currentHp>0)){const max=calculatedStats(ally).hp,amount=Math.max(1,Math.floor(max*(skill.heal??.25)*healMultiplier(member))),gained=recoverBattleHp(ally,amount,max);maximum=Math.max(maximum,gained);recordBattleHealing(member,gained)}if(skill.cleanse)battle.party.forEach(ally=>{clearNegativeAllyEffects(battle,ally.id);clearAilments(ally)});applySkillEffects(skill,member,target);await flushBattleRecoveries();await floatText(`全体 +${maximum}`,"party","heal");return}
 if(skill.type==="buff"||skill.type==="stance"){applySkillEffects(skill,member,target);await floatText("連携強化","party","guard");return}
 if(skill.type==="cleanse"){battle.party.forEach(ally=>{clearNegativeAllyEffects(battle,ally.id);clearAilments(ally)});await floatText("状態回復","party","heal");return}
 if(skill.type==="mpHeal"){battle.party.filter(ally=>ally.currentHp>0).forEach(ally=>recoverBattleMp(ally,Math.floor(maxMp(ally)*(skill.mpHeal??.2)),member));await flushBattleRecoveries();await floatText("MP回復","party","heal");return}
 if(skill.type==="revive"){const ally=battle.party.filter(entry=>entry.currentHp<=0).sort((left,right)=>calculatedStats(right).hp-calculatedStats(left).hp)[0];if(ally&&reviveBattleMonster(ally,skill.revive??.35,skill.reviveMp??.25,member,{transferRate:skill.reviveTransferRate})){applyRevivedSkillEffects(skill,ally,member);await flushBattleRecoveries()}return}
 await animateAttack(member.id,true);
 const targets=skill.allEnemies?aliveEnemies(battle):[target],hits=Math.max(1,Number(skill.hits)||1);
  for(const enemy of targets){let dealt=0;for(let hit=0;hit<hits&&enemy.hp>0;hit++){const critical=Boolean(skill.guaranteedCritical)||Math.random()<Math.min(.82,.12+(skill.critBonus??0)+(stats.spd??0)*.003),ignore=Math.max(0,Math.min(.9,Number(skill.defenseIgnore)||0)),statusBonus=skill.bonusVsStatus?.id&&(battle.enemyStatuses?.[enemy.id]??[]).some(status=>status.id===skill.bonusVsStatus.id)?Math.max(1,Number(skill.bonusVsStatus.multiplier)||1):1,effectBonus=skill.bonusVsEffect?.kind&&hasEffect(battle,enemy.id,skill.bonusVsEffect.kind,"enemy")?Math.max(1,Number(skill.bonusVsEffect.multiplier)||1):1,raw=skillDamage({...stats,_currentHpRatio:member.currentHp/Math.max(1,stats.hp)},{...enemy,def:enemy.def*(1-ignore),mdef:(enemy.mdef??enemy.def)*(1-ignore)},skill,critical)*statusBonus*effectBonus*turnPowerMultiplier(skill),damage=Math.max(1,Math.floor(raw*attributeDamageMultiplier(skill.element??member.attribute??SPECIES[member.speciesId]?.element??"neutral",enemy.trialElement??enemy.element??SPECIES[enemy.speciesId]?.element??"neutral")*enemyDamageMultiplier(enemy)*(enemy.hiddenDamageTaken??1)*magicCircleDamageMultiplier(member))),applied=applyEnemyDamage(battle,enemy,damage,{sourceId:member.id,element:skill.element??SPECIES[member.speciesId]?.element??"neutral",damageClass:skill.damageClass??"physical"});dealt+=applied.damage;recordBattleDamage(member,applied.damage);registerWeaponFinisher(member,enemy,applied.beforeHp);await animateHit(enemy.id,critical);await floatText(applied.damage?`${critical?"会心 ":""}-${applied.damage}`:"完全ガード",enemy.id,applied.damage?(critical?"critical":"skill"):"guard")}if(dealt&&skill.status&&enemy.hp>0&&Math.random()<(skill.status.chance??0))applyEnemyStatus(battle,{...skill.status,sourceMonsterId:member.id},enemy.id)}
 applySkillEffects(skill,member,target);await resolveCompositeSkillRevive(skill,member);
}
async function triggerInvincibleAlliance(source){
 if(!battle||battle._invincibleAllianceRunning||!isHeroResonanceSpecies(source?.speciesId))return;const opening=heroResonanceProfile(battle.party??[]);if(opening.count<2)return;
 battle._invincibleAllianceRunning=true;
 try{if(opening.invincible)applyInvinciblePressure();battleFlash("critical");await battleBanner(opening.name,`${displayName(source)}に続き、残る${opening.followupsPerAction}人が共鳴発動`,`synergy invincible`,720,source);const used=new Set([source.speciesId]);while(aliveEnemies(battle).length){const profile=heroResonanceProfile(battle.party??[]);if(profile.count<2)break;const candidates=shuffledBattleEntries(heroResonanceMembers(battle.party).filter(member=>!used.has(member.speciesId))).map(member=>({member,skills:allLearnedSkills(member).filter(skill=>usefulHeroResonanceSkill(member,skill))})).filter(entry=>entry.skills.length);if(!candidates.length)break;const{member,skills}=candidates[0],skill=skills[Math.floor(Math.random()*skills.length)];used.add(member.speciesId);await performInvincibleAllianceSkill(member,skill)}}finally{battle._invincibleAllianceRunning=false;syncInvincibleAllianceState({announce:false})}
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
   const attackElement=a.attribute??SPECIES[a.speciesId]?.element??"neutral",targetElement=e.trialElement??e.element??SPECIES[e.speciesId]?.element??"neutral",critMult=1.7+affixValue(a,"critDamage",150)/100,damageStats={...combatStats,_currentHpRatio:a.currentHp/Math.max(1,combatStats.hp)},raw=(critical?Math.floor(base*critMult):base)*formationMultiplier*affixOutgoingDamageMultiplier(damageStats,e,attackElement)*affixExecutionMultiplier(a,e)*signatureBonus.damageMultiplier,d=Math.max(1,Math.floor(raw*attributeDamageMultiplier(attackElement,targetElement)*abyssBattleMultiplier(a,"partyDamageRate")*enemyDamageMultiplier(e)*(e.hiddenDamageTaken??1)*endgameIncomingDamageMultiplier(e,attackElement)*weaponMasteryDamageMultiplier(save.state,a,e)*magicCircleDamageMultiplier(a))),applied=applyEnemyDamage(battle,e,d,{sourceId:a.id,element:attackElement,damageClass:magicWeapon?"magic":"physical"});recordBattleDamage(a,applied.damage);registerWeaponFinisher(a,e,applied.beforeHp);consumeMagicCircleActionCost(a);const steal=outgoingLifeSteal(a);if(steal&&applied.damage){const h=Math.max(1,Math.floor(applied.damage*steal)),gained=recoverBattleHp(a,h,s.hp);recordBattleHealing(a,gained)}
   await animateHit(e.id,critical);if(critical&&applied.damage)burstParticles(e.id,"critical",16);await floatText(applied.damage?`${critical?"会心 ":""}-${applied.damage}`:"完全ガード",e.id,applied.damage?(critical?"critical":"damage"):"guard");await trySeriesChainAttack(a,e,applied.damage);
   const rageProfile=hasCircleEffect(a,"rage")?rageCircleValues(a):null,rageHits=rageProfile?(a._circleRage>=rageProfile.secondChainHits?2:a._circleRage>=rageProfile.firstChainHits?1:0):0;
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
   const h=Math.max(1,Math.floor(s.hp*skillHealingRate(skill)*healMultiplier(a))),gained=recoverBattleHp(a,h,s.hp);recordBattleHealing(a,gained);if(skill.cleanse){clearNegativeAllyEffects(battle,a.id);clearAilments(a)}await flushBattleRecoveries();if(gained>0)await floatText(`+${gained}`,a.id,"heal");applySkillEffects(skill,a,e);
  }else if(skill.type==="allHeal"){
   const healed=[];battle.party.filter(m=>m.currentHp>0).forEach(m=>{const max=calculatedStats(m).hp,h=Math.max(1,Math.floor(max*skill.heal*healMultiplier(a))),gained=recoverBattleHp(m,h,max);healed.push(gained);recordBattleHealing(a,gained)});
   if(skill.revive||skill.reviveTransferRate){const target=battle.party.filter(m=>m.currentHp<=0&&!hasEffect(battle,m.id,"reviveSeal")).sort((x,y)=>calculatedStats(y).hp-calculatedStats(x).hp)[0];if(target&&reviveBattleMonster(target,skill.revive??.01,skill.reviveMp??.25,a,{transferRate:skill.reviveTransferRate})){applyRevivedSkillEffects(skill,target,a);healed.push(target.currentHp)}}
   await flushBattleRecoveries();await floatText(`全体 +${Math.max(0,...healed)}`,"party","heal");if(skill.cleanse)battle.party.forEach(m=>{clearNegativeAllyEffects(battle,m.id);clearAilments(m)});applySkillEffects(skill,a,e);
  }else if(skill.type==="buff"||skill.type==="stance"){applySkillEffects(skill,a,e);if(skill.heal){const targets=skill.target==="味方全体"?battle.party.filter(m=>m.currentHp>0):[a];targets.forEach(m=>{const mx=calculatedStats(m).hp;recoverBattleHp(m,Math.floor(mx*skill.heal*healMultiplier(a)),mx)})}await flushBattleRecoveries();await floatText("強化発動","party","guard");
  }else if(skill.type==="cleanse"){battle.party.forEach(m=>{clearNegativeAllyEffects(battle,m.id);clearAilments(m)});await floatText("状態回復","party","heal");
  }else if(skill.type==="mpHeal"){battle.party.filter(m=>m.currentHp>0).forEach(m=>recoverBattleMp(m,Math.floor(maxMp(m)*(skill.mpHeal??.2)),a));await flushBattleRecoveries();await floatText("MP回復","party","heal");
  }else if(skill.type==="revive"){const target=battle.party.filter(m=>m.currentHp<=0&&!hasEffect(battle,m.id,"reviveSeal")).sort((x,y)=>calculatedStats(y).hp-calculatedStats(x).hp)[0];if(target&&reviveBattleMonster(target,skill.revive??.35,skill.reviveMp??.25,a,{transferRate:skill.reviveTransferRate})){applyRevivedSkillEffects(skill,target,a);await flushBattleRecoveries()}else{skillCompleted=false;const beforeRefund=a.currentMp;a.currentMp=Math.min(maxMp(a),a.currentMp+mpCost);queueBattleRecovery(a,"mp",beforeRefund,a.currentMp);if(battle.cooldowns?.[a.id])delete battle.cooldowns[a.id][skill.id]}
  }else if(skill.fillHpDrain){
   await animateAttack(a.id,true);const maximum=calculatedStats(a).hp,missing=Math.max(0,maximum-a.currentHp),amount=Math.min(missing,Math.max(0,e.hp));if(amount>0){const applied=applyEnemyDamage(battle,e,amount,{sourceId:a.id,bypassMimicArmor:true,element:skill.element??a.attribute??SPECIES[a.speciesId]?.element??"neutral",damageClass:skill.damageClass??"physical"}),gained=recoverBattleHp(a,applied.damage,maximum);recordBattleDamage(a,applied.damage);recordBattleHealing(a,gained);registerWeaponFinisher(a,e,applied.beforeHp);addBattleLog(battle,`${displayName(a)}：防御無視でHP${applied.damage.toLocaleString()}を満命吸収`);await animateHit(e.id,true);await flushBattleRecoveries();await floatText(`吸葬 -${applied.damage}`,e.id,"critical");await floatText(`+${gained}`,a.id,"heal")}else{addBattleLog(battle,`${displayName(a)}は既に満命のため吸収できなかった`);await floatText("満命",a.id,"guard")}applySkillEffects(skill,a,e);
  }else if(Number(skill.selfSacrificeHpDamage)>0){
   await animateAttack(a.id,true);const amount=Math.max(1,Math.floor(a.currentHp*Math.min(2,Number(skill.selfSacrificeHpDamage)))),applied=applyEnemyDamage(battle,e,amount,{sourceId:a.id,bypassMimicArmor:true,element:skill.element??a.attribute??SPECIES[a.speciesId]?.element??"neutral",damageClass:skill.damageClass??"physical"});recordBattleDamage(a,applied.damage);registerWeaponFinisher(a,e,applied.beforeHp);a.currentHp=0;handleMagicCircleDeath(a);syncInvincibleAllianceState();addBattleLog(battle,`${displayName(a)}は命を代価に${applied.damage.toLocaleString()}ダメージ`);await animateHit(e.id,true);await floatText(`生命 -${applied.damage}`,e.id,"critical");applySkillEffects(skill,a,e);
  }else{
   await animateAttack(a.id,true);const hits=skill.hits??1;let total=0,signatureBonus=signatureOffenseBonus(a,e);const skillTargets=skill.allEnemies?aliveEnemies(battle):[e];if(signatureBonus.stacks)addBattleLog(battle,`${displayName(a)}：照準連鎖 ×${signatureBonus.stacks}`);
   for(const targetEnemy of skillTargets){const e=targetEnemy;let targetTotal=0;for(let i=0;i<hits&&e.hp>0;i++){
    if(!attackHits({accuracy:s.accuracy??100,accuracyUp:effectValue(battle,a.id,"accuracyUp"),accuracyDown:effectValue(battle,a.id,"accuracyDown"),evasion:e.evasion??0,evasionUp:effectValue(battle,e.id,"evasionUp","enemy"),evasionDown:effectValue(battle,e.id,"evasionDown","enemy"),guaranteedHit:Boolean(skill.guaranteedHit)||hasEffect(battle,a.id,"guaranteedHit")})){registerFloorBossDodge(e);addBattleLog(battle,`${e.name}が${skill.name}を回避した`);await floatText("MISS / 回避",e.id,"miss");continue}
    const converted=convertedAttackStats(s,a.id),critical=Boolean(skill.guaranteedCritical)||hasEffect(battle,a.id,"guaranteedCritical")||Math.random()<Math.min(.95,affixCriticalChance(converted,Math.min(.9,.1+(skill.critBonus??0)+(converted.spd??0)*.004+effectValue(battle,a.id,"critUp")))+magicCircleCriticalBonus(a,skill.power??1)+signatureBonus.critBonus),ignore=Math.max(0,Math.min(.9,Number(skill.defenseIgnore)||0)),boosted={...converted,atk:converted.atk*allyAttackFactor(a.id),matk:(converted.matk??converted.atk)*allyAttackFactor(a.id),_currentHpRatio:a.currentHp/Math.max(1,converted.hp)},execute=(skill.execute&&e.hp/e.maxHp<=skill.execute)?2:1,statusBonus=skill.bonusVsStatus?.id&&(battle.enemyStatuses?.[e.id]??[]).some(status=>status.id===skill.bonusVsStatus.id)?Math.max(1,Number(skill.bonusVsStatus.multiplier)||1):1,effectBonus=skill.bonusVsEffect?.kind&&hasEffect(battle,e.id,skill.bonusVsEffect.kind,"enemy")?Math.max(1,Number(skill.bonusVsEffect.multiplier)||1):1,enemyBuffBonus=skill.bonusVsEnemyBuff&&(battle.enemyEffects?.[e.id]??[]).some(effect=>POSITIVE_ENEMY_EFFECTS.has(effect.kind))?Math.max(1,Number(skill.bonusVsEnemyBuff.multiplier)||1):1,lowHpSkillBonus=Number(skill.lowHpBonus)>0&&a.currentHp/Math.max(1,converted.hp)<=Number(skill.lowHpThreshold??.5)?1+Number(skill.lowHpBonus):1,raw=skillDamage(boosted,{...e,def:e.def*enemyDefenseFactor(e.id)*(1-ignore),mdef:(e.mdef??e.def)*enemyDefenseFactor(e.id)*(1-ignore)},skill,critical)*execute*statusBonus*effectBonus*enemyBuffBonus*lowHpSkillBonus*turnPowerMultiplier(skill)*affixExecutionMultiplier(a,e)*(1+affixValue(a,"skillPower",200)/100)*signatureBonus.damageMultiplier,d=Math.max(1,Math.floor(raw*attributeDamageMultiplier(skill.element??a.attribute??SPECIES[a.speciesId]?.element??"neutral",e.trialElement??e.element??SPECIES[e.speciesId]?.element??"neutral")*abyssBattleMultiplier(a,"partyDamageRate")*enemyDamageMultiplier(e)*(e.hiddenDamageTaken??1)*endgameIncomingDamageMultiplier(e,skill.element)*weaponMasteryDamageMultiplier(save.state,a,e)*magicCircleDamageMultiplier(a))),applied=applyEnemyDamage(battle,e,d,{sourceId:a.id,element:skill.element??a.attribute??SPECIES[a.speciesId]?.element??"neutral",damageClass:skill.damageClass??"physical"});
    recordBattleDamage(a,applied.damage);registerWeaponFinisher(a,e,applied.beforeHp);total+=applied.damage;targetTotal+=applied.damage;await animateHit(e.id,critical);if(critical&&applied.damage)burstParticles(e.id,"critical",14);await floatText(applied.damage?`${critical?"会心 ":""}-${applied.damage}`:"完全ガード",e.id,applied.damage?(critical?"critical":"skill"):"guard")
   }
    if(skill.currentHpDamage&&e.hp>0){const percentDamage=Math.max(1,Math.floor(e.hp*Math.min(.25,skill.currentHpDamage))),applied=applyEnemyDamage(battle,e,percentDamage,{sourceId:a.id,element:skill.element??a.attribute??SPECIES[a.speciesId]?.element??"neutral",damageClass:skill.damageClass??"physical"});registerWeaponFinisher(a,e,applied.beforeHp);recordBattleDamage(a,applied.damage);total+=applied.damage;targetTotal+=applied.damage;await floatText(applied.damage?`割合 -${applied.damage}`:"完全ガード",e.id,applied.damage?"skill":"guard")}
    if(skill.status&&e.hp>0&&Math.random()<Math.min(1,skill.status.chance*(1+affixValue(a,"statusChance",100)/100))){const applied=applyEnemyStatus(battle,{...skill.status,power:(skill.status.power??0)*(1+affixValue(a,"dotDamage",150)/100)*abyssBattleMultiplier(a,"partyDamageRate"),sourceMonsterId:a.id},e.id);if(applied){addBattleLog(battle,`${e.name}は${skill.status.name}状態になった`);await floatText(skill.status.name,e.id,skill.status.id)}}
    await trySeriesChainAttack(a,e,targetTotal);await trySeriesBurn(a,e,skill);if(Number(skill.repeatDelay)>0&&targetTotal>0){battle.delayedSkillEchoes??=[];battle.delayedSkillEchoes.push({dueTurn:Math.max(1,Number(battle.turn)||1)+Math.max(1,Math.floor(Number(skill.repeatDelay)||0)),sourceId:a.id,targetId:e.id,amount:targetTotal,skillName:skill.name,element:skill.element??a.attribute??SPECIES[a.speciesId]?.element??"neutral",damageClass:skill.damageClass??"physical"});addBattleLog(battle,`${displayName(a)}：${skill.name}の残響を${Math.max(1,Math.floor(Number(skill.repeatDelay)||0))}ラウンド後へ刻んだ`)}
   }
   if(!skill.noLifeSteal&&(skill.type==="drain"||hasEffect(battle,a.id,"lifeSteal")||outgoingLifeSteal(a)>0)){const rate=(skill.drain??0)+effectValue(battle,a.id,"lifeSteal")+outgoingLifeSteal(a),h=Math.max(1,Math.floor(total*Math.min(1.25,rate))),gained=recoverBattleHp(a,h,s.hp);await flushBattleRecoveries();await floatText(`+${gained}`,a.id,"heal")}
   if(skill.selfHeal){const h=Math.max(1,Math.floor(s.hp*skill.selfHeal)),gained=recoverBattleHp(a,h,s.hp);await flushBattleRecoveries();await floatText(`+${gained}`,a.id,"heal")}if(skill.mpDrain){let drained=0;for(const targetEnemy of skillTargets.filter(enemy=>enemy.hp>0)){const amount=Math.min(Math.max(0,targetEnemy.currentMp??0),Math.max(1,Math.floor((targetEnemy.maxMp??1)*Math.min(.8,skill.mpDrain))));targetEnemy.currentMp=Math.max(0,(targetEnemy.currentMp??0)-amount);drained+=amount}const gain=Math.max(1,drained||Math.floor(maxMp(a)*Math.min(.25,skill.mpDrain))),beforeMp=a.currentMp;a.currentMp=Math.min(maxMp(a),a.currentMp+gain);queueBattleRecovery(a,"mp",beforeMp,a.currentMp);await flushBattleRecoveries();await floatText(`MP吸収 +${a.currentMp-beforeMp}`,a.id,"heal")}applySkillEffects(skill,a,e);await resolveCompositeSkillRevive(skill,a)
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
 const st=calculatedStats(target),guard=Boolean(battle.guards[target.id]),endgameNoCrit=hasCircleEffect(target,"endgameNoCrit")&&Boolean(e.endgameBossId||["abyss","tenGod"].includes(e.faction)),endgameCircleReduction=endgameNoCrit?circleEffectNumber(target,"damageReductionRate",0):0,criticalStatus=e.floorBossPassive?.criticalAgainstStatus,criticalEffects=e.floorBossPassive?.criticalAgainstEffects,critical=!endgameNoCrit&&(Boolean(rules.guaranteedCritical)||hasEffect(battle,e.id,"guaranteedCritical","enemy")||Boolean(e._floorBossForceCritical)||Boolean(criticalStatus&&allyAilment(target,criticalStatus))||Boolean(Array.isArray(criticalEffects)&&criticalEffects.length&&criticalEffects.every(kind=>hasEffect(battle,target.id,kind)))||Math.random()<Math.min(.9,criticalChance+(e.crit??0)+effectValue(battle,e.id,"critUp","enemy")));
 syncInvincibleAllianceState();if(battle.invincibleAlliance){addBattleLog(battle,`${displayName(target)}：四神話共鳴・無敵`);await floatText("無敵",target.id,"guard");return 0}
 const guaranteedStatus=e.floorBossPassive?.guaranteedHitAgainstStatus,guaranteedBuff=e.floorBossPassive?.guaranteedHitAgainstBuff&&(battle.allyEffects?.[target.id]??[]).some(effect=>POSITIVE_ENEMY_EFFECTS.has(effect.kind));if(!attackHits({accuracy:e.accuracy??100,accuracyUp:effectValue(battle,e.id,"accuracyUp","enemy"),accuracyDown:effectValue(battle,e.id,"accuracyDown","enemy"),evasion:st.evasion??0,evasionUp:effectValue(battle,target.id,"evasionUp"),evasionDown:effectValue(battle,target.id,"evasionDown"),guaranteedHit:Boolean(rules.guaranteedHit||hasEffect(battle,e.id,"guaranteedHit","enemy")||e.endgameUnavoidable||guaranteedBuff||(guaranteedStatus&&allyAilment(target,guaranteedStatus)))})){addBattleLog(battle,`${displayName(target)}が攻撃を回避した`);await floatText("MISS / 回避",target.id,"miss");return 0}
 const protector=battle.party.find(monster=>monster.id!==target.id&&monster.currentHp>0&&signatureResonance(monster)?.id==="hide-guardian"&&target.currentHp/Math.max(1,st.hp)<=signatureResonance(monster).lowHpThreshold),protection=protector?1-(signatureResonance(protector).damageReduction??.4):1;
 const ailmentIgnore=allyAilment(target)?Number(e.floorBossPassive?.defenseIgnoreAgainstAilment)||0:0,ignore=Math.max(0,Math.min(.9,(Number(rules.defenseIgnore)||0)+(Number(e.floorBossPassive?.defenseIgnoreBonus)||0)+ailmentIgnore)),execute=rules.execute&&target.currentHp/Math.max(1,st.hp)<=rules.execute?2:1;
 const guardRuin=guard&&e.floorBossDomain?.effect==="guardRuin",guardPierce=guardRuin?Math.max(0,Math.min(1,Number(e.floorBossDomain.guardPierce)||0)):0,guardFxBase=Math.min(.85,effectValue(battle,target.id,"guard")*(1+affixValue(target,"guardPower",100)/100)),guardFx=guardFxBase*(1-guardPierce),guardBase=guard&&!rules.guaranteedHit?Math.max(.15,.45-affixValue(target,"guardPower",100)/200):1,guardMultiplier=guardRuin?1-(1-guardBase)*(1-guardPierce):guardBase;
 const vulnerable=effectValue(battle,target.id,"vulnerable"),reduction=Math.min(.75,affixValue(target,"damageReduction",75)/100+(signatureResonance(target)?.damageReduction??0)),attackElement=element??SPECIES[e.speciesId]?.element??null,targetElement=target.attribute??SPECIES[target.speciesId]?.element??"neutral",resistance=elementalResistance(target,attackElement),magic=rules.damageClass==="magic",hybrid=rules.damageClass==="hybrid",split=rules.damageClass==="split",conversionRate=e.endgameBossId?Math.max(0,Math.min(1,effectValue(battle,e.id,"magicToPhysical","enemy"))):0,convertedAtk=e.atk+(e.matk??e.atk)*conversionRate,convertedMatk=(e.matk??e.atk)*(1-conversionRate),attackValue=split?((convertedAtk+convertedMatk)/2):hybrid?Math.max(convertedAtk,convertedMatk):magic?convertedMatk:convertedAtk,defenseValue=split?((st.def+(st.mdef??st.def))/2):hybrid?Math.min(st.def,st.mdef??st.def):magic?(st.mdef??st.def):st.def,debuffPursuit=e.floorBossDomain?.effect==="debuffPursuit"&&hasEffect(battle,target.id,e.floorBossDomain.kind)?Math.max(1,Number(e.floorBossDomain.powerMultiplier)||1):1,convergenceDomain=e.floorBossDomain?.effect==="dualDebuffConvergence"?e.floorBossDomain:null,convergenceBonus=convergenceDomain?Math.min(Number(convergenceDomain.maxPower)||.26,(convergenceDomain.kinds??[]).filter(kind=>hasEffect(battle,target.id,kind)).length*Math.max(0,Number(convergenceDomain.perEffect)||0)):0,gravityBonus=e.floorBossDomain?.effect==="gravityPressure"?Math.min(Number(e.floorBossDomain.maxPower)||.30,(1-target.currentHp/Math.max(1,st.hp))*Math.max(0,Number(e.floorBossDomain.maxPower)||.30)):0,frozenBonus=e.floorBossDomain?.effect==="frozenShatter"&&allyAilment(target,"freeze")?Math.max(1,Number(e.floorBossDomain.powerMultiplier)||1):1,defenseImbalance=e.floorBossDomain?.effect==="defenseImbalance"?Math.min(Number(e.floorBossDomain.maxPower)||.26,Math.abs(st.def-(st.mdef??st.def))/Math.max(1,st.def,st.mdef??st.def)*Math.max(0,Number(e.floorBossDomain.maxPower)||.26)):0;
 const attackPower=attackValue*enemyAttackFactor(e.id),defensePower=defenseValue*(1-ignore)*allyDefenseFactor(target.id)*.55,baseDamage=enemyDamageAfterDefense(attackPower,defensePower);
 let d=Math.max(1,Math.floor(baseDamage*multiplier*debuffPursuit*(1+convergenceBonus)*(1+gravityBonus)*(1+defenseImbalance)*frozenBonus*attributeDamageMultiplier(attackElement,targetElement)*execute*guardMultiplier*(1-guardFx)*(1+vulnerable)*(1-reduction)*(1-resistance)*(1-endgameCircleReduction)*abyssBattleMultiplier(target,"partyDamageTakenRate")*protection));if(rules.currentHpDamage)d+=Math.max(1,Math.floor(target.currentHp*Math.min(.25,rules.currentHpDamage))*protection);if(critical)d=Math.floor(d*Math.max(1,Number(e.floorBossPassive?.critDamageMultiplier)||1.55));if(hasCircleEffect(target,"soleSurvivor")&&battle.party.filter(member=>member.currentHp>0).length===1)d=Math.max(1,Math.floor(d*(1-circleEffectNumber(target,"damageReductionRate",.4))));d=absorbSignatureShield(target,d);d=absorbMagicCircleShield(target,d);if(critical&&d>0&&e.floorBossDomain?.effect==="criticalCharge")e._floorBossCriticalReady=true;
 target.currentHp=Math.max(0,target.currentHp-d);recordBattleTaken(target,d);if(hasCircleEffect(target,"rage")&&d>0){const rage=rageCircleValues(target),cap=Math.max(rage.secondChainHits,Math.ceil(rage.maxDamageBonus/Math.max(.001,rage.damagePerHit)));target._circleRage=Math.min(cap,(target._circleRage??0)+1)}if(target.currentHp<=0&&tryUnyielding(target))addBattleLog(battle,`${displayName(target)}の復活・耐久効果が発動（${battle.reviveCount}/99）`);else addBattleLog(battle,`${displayName(target)}に${d}ダメージ`);await flushMagicCircleEvents();
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
	  if(Number(info.selfMpHealRate)>0){const maximum=Math.max(1,Number(e.maxMp)||1),gain=recoverEnemyBattleMp(e,Math.max(1,Math.floor(maximum*Math.min(.8,Number(info.selfMpHealRate)))));if(gain){addBattleLog(battle,`${e.name}：磁力再充填 MP+${gain}`);await flushBattleRecoveries();await floatText(`MP +${gain}`,e.id,"heal")}}
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
 if(info.fillHpDrain){const target=targets[0];if(!target)return true;syncInvincibleAllianceState();if(battle.invincibleAlliance){addBattleLog(battle,`${displayName(target)}：四神話共鳴で満命吸葬を無効化`);await floatText("無敵",target.id,"guard");return true}const missing=Math.max(0,e.maxHp-e.hp),amount=Math.min(missing,Math.max(0,target.currentHp)),before=e.hp;target.currentHp=Math.max(0,target.currentHp-amount);e.hp=Math.min(e.maxHp,e.hp+amount);if(amount&&e.floorBossDomain?.effect==="healingFlare")e._floorBossHealedPowerReady=true;recordBattleTaken(target,amount);queueBattleRecovery(e,"hp",before,e.hp);addBattleLog(battle,`${e.name}は防御を無視してHP${amount.toLocaleString()}を吸収`);if(target.currentHp<=0&&tryUnyielding(target))addBattleLog(battle,`${displayName(target)}は吸葬を耐えた`);if(target.currentHp<=0){handleMagicCircleDeath(target);syncInvincibleAllianceState()}await animateHit(target.id,true);if(target.currentHp<=0)await animateDefeat(target.id);await flushBattleRecoveries();await floatText(`吸収 -${amount}`,target.id,"critical");await floatText(`+${amount}`,e.id,"heal");return true}
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
  const target=chooseEnemyTarget(e,e.teamBattleTargetMode??e.campaignHeroTargetMode??(e.endgameBossId?"threat":"normal"));if(!target){battle.busy=false;return lose()};await animateAttack(e.id,action===ENEMY_ACTIONS.power);
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
 const dueSkillEchoes=(battle.delayedSkillEchoes??[]).filter(entry=>Math.max(0,Number(entry.dueTurn)||0)<=Math.max(1,Number(battle.turn)||1));battle.delayedSkillEchoes=(battle.delayedSkillEchoes??[]).filter(entry=>!dueSkillEchoes.includes(entry));
 for(const echo of dueSkillEchoes){const source=battle.party.find(monster=>monster.id===echo.sourceId),target=(battle.enemies??[]).find(enemy=>enemy.id===echo.targetId&&enemy.hp>0)??aliveEnemies(battle)[0];if(!target)continue;const applied=applyEnemyDamage(battle,target,Math.max(1,Math.floor(Number(echo.amount)||0)),{sourceId:echo.sourceId,element:echo.element??source?.attribute??"neutral",damageClass:echo.damageClass??"physical"});if(source){recordBattleDamage(source,applied.damage);registerWeaponFinisher(source,target,applied.beforeHp)}addBattleLog(battle,`${source?displayName(source):"時の残響"}：${echo.skillName??"残響"}が再来し ${applied.damage.toLocaleString()}ダメージ`);await animateHit(target.id,true);await floatText(applied.damage?`残響 -${applied.damage}`:"完全ガード",target.id,applied.damage?"skill":"guard")}
 const statusResults=processEnemyStatuses(battle);
	 for(const enemy of(battle.enemies??[]).filter(entry=>entry.hp>0&&entry.floorBossDomain?.effect==="healingChorusChannel"&&entry._floorBossHealingChorus)){const domain=enemy.floorBossDomain,pending=enemy._floorBossHealingChorus;if(Math.max(0,Number(pending.dueTurn)||0)>Math.max(1,Number(battle.turn)||1))continue;delete enemy._floorBossHealingChorus;const threshold=Math.max(1,Math.floor(enemy.maxHp*Math.max(.01,Math.min(.8,Number(domain.thresholdRate)||.10)))),damage=Math.max(0,Math.floor(Number(pending.damage)||0));if(damage>=threshold){const rate=Math.max(0,Math.min(.8,Number(domain.interruptDefDown)||.18));applyBattleEffect(battle,enemy.id,{kind:"defDown",value:rate,turns:3,chance:1,selfCost:true,sourceKey:`${enemy.id}:chorus-interrupt`,sourceSkillName:domain.name},"enemy");addBattleLog(battle,`${domain.name}：詠唱阻止 ${damage.toLocaleString()}/${threshold.toLocaleString()}・物理／魔法DEF-${Math.round(rate*100)}%`);await floatText("聖歌阻止",enemy.id,"critical")}else{const gained=recoverFloorBossHp(enemy,Math.max(1,Math.floor(enemy.maxHp*Math.max(0,Math.min(.8,Number(domain.healRate)||.30)))));enemy.divineBarrier=Math.max(Number(enemy.divineBarrier)||0,Math.max(0,Math.floor(Number(domain.barrier)||1)));addBattleLog(battle,`${domain.name}：詠唱成立 ${damage.toLocaleString()}/${threshold.toLocaleString()}・HP+${gained.toLocaleString()}`);await flushBattleRecoveries();await floatText(`聖歌 +${gained}`,enemy.id,"heal")}}
	 for(const enemy of(battle.enemies??[]).filter(entry=>entry.hp>0&&entry.floorBossDomain?.effect==="eclipseDeadline")){const domain=enemy.floorBossDomain,threshold=Math.max(1,Math.floor(enemy.maxHp*Math.max(.01,Math.min(.8,Number(domain.thresholdRate)||.08)))),damage=enemy._floorBossEclipseDamageRound===Math.max(0,Number(battle.turn)||0)?Math.max(0,Math.floor(Number(enemy._floorBossEclipseRoundDamage)||0)):0,cap=Math.max(1,Math.floor(Number(domain.maxStacks)||3)),before=Math.max(0,Math.floor(Number(enemy._floorBossEclipseStacks)||0));if(damage>=threshold){enemy._floorBossEclipseStacks=Math.max(0,before-1);addBattleLog(battle,`${domain.name}：火力試験成功 ${damage.toLocaleString()}/${threshold.toLocaleString()}・日蝕${enemy._floorBossEclipseStacks}/${cap}`)}else{enemy._floorBossEclipseStacks=Math.min(cap,before+1);addBattleLog(battle,`${domain.name}：火力試験未達 ${damage.toLocaleString()}/${threshold.toLocaleString()}・日蝕${enemy._floorBossEclipseStacks}/${cap}`);if(enemy._floorBossEclipseStacks>=cap&&!enemy._floorBossEclipseReady){enemy._floorBossEclipseReady=true;addBattleLog(battle,`${domain.name}：三段日蝕完成・次の終幕技が確定会心`)}}enemy._floorBossEclipseRoundDamage=0}
	 for(const enemy of(battle.enemies??[]).filter(entry=>entry._floorBossPuppetLink&&Math.max(0,Number(entry._floorBossPuppetLink.expiresTurn)||0)<=Math.max(1,Number(battle.turn)||1))){delete enemy._floorBossPuppetLink;addBattleLog(battle,`${enemy.floorBossDomain?.name??enemy.name}：双糸連結が終演`)}
	 for(const enemy of(battle.enemies??[]).filter(entry=>entry.hp>0&&entry.floorBossDomain?.effect==="dreamEcho")){const pending=enemy._floorBossDreamEchoes??[],due=pending.filter(entry=>Math.max(0,Number(entry.dueTurn)||0)<=Math.max(1,Number(battle.turn)||1));enemy._floorBossDreamEchoes=pending.filter(entry=>!due.includes(entry));for(const echo of due){const target=battle.party.find(monster=>monster.id===echo.targetId&&monster.currentHp>0);if(!target)continue;syncInvincibleAllianceState();let damage=0;if(!battle.invincibleAlliance){damage=Math.min(target.currentHp,Math.max(1,Math.floor(Number(echo.amount)||0)));target.currentHp=Math.max(0,target.currentHp-damage);recordBattleTaken(target,damage);if(target.currentHp<=0&&tryUnyielding(target))addBattleLog(battle,`${displayName(target)}は夢鐘余韻を耐えた`);if(target.currentHp<=0){handleMagicCircleDeath(target);syncInvincibleAllianceState()}}addBattleLog(battle,`${enemy.floorBossDomain.name}：${displayName(target)}へ${battle.invincibleAlliance?"無敵":"防御無視"}余韻 ${damage.toLocaleString()}ダメージ`);await animateHit(target.id,true);await floatText(battle.invincibleAlliance?"無敵":`余韻 -${damage}`,target.id,battle.invincibleAlliance?"guard":"critical");if(target.currentHp<=0)await animateDefeat(target.id)}}
 for(const enemy of(battle.enemies??[]).filter(entry=>entry.hp>0)){const maximum=Math.max(0,Number(enemy.maxMp)||0),rate=enemy.floorBossDomain?.effect==="sealTide"?Math.max(.08,Number(enemy.floorBossDomain.mpRegen)||0):.08;recoverEnemyBattleMp(enemy,Math.max(1,Math.floor(maximum*rate)))}
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
 const judge=battle.party.find(monster=>monster.currentHp>0&&hasCircleEffect(monster,"turn20")&&!monster._circleJudgmentUsed&&battle.turn>=Math.max(1,Math.floor(circleEffectNumber(monster,"triggerTurn",20))));if(judge){const triggerTurn=Math.max(1,Math.floor(circleEffectNumber(judge,"triggerTurn",20)));judge._circleJudgmentUsed=true;for(const ally of battle.party)if(ally.id!==judge.id)magicCircleInstantDeath(ally,judge);for(const enemy of aliveEnemies(battle)){const before=enemy.hp;magicCircleInstantDeath(enemy,judge);registerWeaponFinisher(judge,enemy,before)}await magicCircleActivationFx(judge,circleInfo(judge),triggerTurn===20?"二十刻終焉":`${triggerTurn}刻終焉`,`${displayName(judge)}以外へ即死判定`,{danger:true,duration:900});await flushMagicCircleEvents();if(!aliveEnemies(battle).length)return win(false,null);if(!battle.party.some(monster=>monster.currentHp>0))return lose()}
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
 if(entry?.type==="ally"){const current=currentAlly(battle);if(current&&await prepareMagicCircleTurn(current))return;if(battle.auto){await wait(220);const a=currentAlly(battle);if(a){for(const member of battle.party??[])member._maxHp=calculatedStats(member).hp;const hpRate=a.currentHp/Math.max(1,a._maxHp),rageFirstHit=hasCircleEffect(a,"rage")?rageCircleValues(a).firstChainHits:Infinity;if(hasCircleEffect(a,"rage")&&(a._circleRage??0)>=rageFirstHit&&Math.random()<Math.min(.75,(a._circleRage??0)*.06))return command("attack");const decision=chooseAutoBattleDecision(a,{...battle,autoBattleStats:{...(battle.autoBattleStats??{}),[a.id]:calculatedStats(a)}});if(decision.targetId&&(battle.enemies??[]).some(enemy=>enemy.id===decision.targetId&&enemy.hp>0))battle.targetEnemyId=decision.targetId;if(decision.kind==="skill"&&decision.skill&&["selfHeal","allHeal","revive","cleanse","mpHeal"].includes(decision.skill.type))return command("skill",decision.skill.id);if(hpRate<=.25){const item=["fullHeals","highPotions","potions"].find(type=>(save.state.inventory[type]??0)>0);if(item)return useBattleItem(item,a.id)}if(decision.kind==="guard")return command("guard");if(decision.kind==="skill"&&decision.skill)return command("skill",decision.skill.id)}return command("attack")}}
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
 const memoryBattle=Boolean(battle?.memoryBattle),defeated=(battle.enemies??[battle.enemy]).filter(Boolean),floor=memoryBattle?(battle.memorySourceFloor??save.state.player.currentFloor):save.state.player.currentFloor,boss=defeated.find(e=>e.boss),eliteDefeated=defeated.filter(e=>e.elite&&!e.captured),firstBoss=!!boss&&!memoryBattle&&!campaignBattleBossWasDefeated(save.state,floor,boss),suppressItemDrops=defeated.some(e=>e.noItemDrops);
 if(!memoryBattle&&boss&&floor===10)completeContextGuide("floor10_defeat",{quiet:true});
 const economyDepth=campaignFloorToLegacyFloor(floor),mimics=defeated.filter(enemy=>enemy.speciesId==="mimic"&&!enemy.captured),cycleRewardMult=memoryBattle?1:campaignReincarnationRewardMultiplier(save.state),rewardMult=(eliteDefeated.length?1.65:1)*cycleRewardMult,baseGold=battleGoldBase(economyDepth,defeated,{firstBoss}),mimicBonusGold=mimics.reduce(sum=>sum+modifiedGoldReward(save.state,mimicVictoryGold(economyDepth,chestGoldBase(economyDepth)),"battle"),0),gold=Math.round((modifiedGoldReward(save.state,baseGold,"battle")+mimicBonusGold)*cycleRewardMult);
 save.state.player.gold+=gold;
 save.state.records.kills+=defeated.filter(e=>!e.captured).length;
 const baseGain=defeated.reduce((sum,e)=>sum+enemyExperienceReward(e.level,{boss:Boolean(e.boss),firstBoss:Boolean(firstBoss&&e===boss),rare:Boolean(e.rareExp)})*(e.speciesId==="mimic"?mimicExperienceMultiplier():1),0);
 const totalExp=Math.round(baseGain*battle.party.length*rewardMult*abyssSkillMultiplier(save.state,"explorationRewardRate"));
 const crystalRoll=defeated.reduce((sum,e)=>{if(e.speciesId==="mimic"&&!e.captured)return sum+mimicVictoryCrystals(economyDepth,Math.random);const chance=e.boss?1:e.gear?.25:.06;if(Math.random()<abyssExplorationChance(save.state,chance,null,{max:1}))return sum+(e.boss?20+Math.floor(e.level/10):1);return sum},0);if(crystalRoll){const current=Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(save.state.player.crystals)||0)));save.state.player.crystals=current+safeCurrencyGrant(current,crystalRoll)}
 const eliteAmountRate=abyssSkillEffectTotal(save.state,"eliteRewardRate")+abyssSkillEffectTotal(save.state,"explorationRewardRate");
 let eliteBonusGold=0,eliteBonusCrystals=0,eliteKeyDrop=false;for(const elite of eliteDefeated){const reward=eliteRewards(elite,floor);eliteBonusGold+=Math.round(modifiedGoldReward(save.state,reward.gold,"elite")*cycleRewardMult);eliteBonusCrystals+=Math.max(0,Math.round(reward.crystals*(1+eliteAmountRate)));eliteKeyDrop=eliteKeyDrop||Math.random()<abyssExplorationChance(save.state,reward.keyChance,"abyssKeyDropRate",{max:.95});recordEliteDefeat(save.state,elite)}save.state.player.gold+=eliteBonusGold;save.state.player.crystals+=eliteBonusCrystals;
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

 if(boss&&!memoryBattle){if(snapshot?.world)applyCampaignBossClearToWorld(snapshot.world,boss,floor);else{const bossId=boss.campaignBossId??boss.endgameBossId??boss.floorBossCatalogId??null,campaignState=defeatCampaignBoss(save.state,floor,bossId);campaignState.lastBossInfo={speciesId:boss.speciesId,name:boss.name??boss.nameOverride,floorBossCatalogId:boss.floorBossCatalogId??null,endgameBossId:boss.endgameBossId??null,campaignBossId:bossId,milestoneBossIds:milestoneBossIdsForFloor(floor)}}}
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
  ${mimicBonusGold?`<p class="elite-reward">${pixelIcon("coin")} ミミック討伐ボーナス <b>+${mimicBonusGold.toLocaleString()}G・EXP ×${mimicExperienceMultiplier()}</b></p>`:""}
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

 let bossProgressSaved=true;
 if(boss&&!memoryBattle){battle.enemy=boss;save.state.player.bossKills[floor]=(save.state.player.bossKills[floor]??0)+1;if(floor===WORLD_MAX_FLOOR)mark1000FloorCleared(save.state);recordBiomeBoss(save.state,floor);persistExpeditionSnapshot(snapshot,{saveNow:false});bossProgressSaved=Boolean(save.save())}
 const playEnding=false,playTrueEnding=false;
 app.insertAdjacentHTML("beforeend",Modal(caught?"捕獲成功！":"戦闘結果",result,memoryBattle?"拠点へ戻る":"探索を続ける"));
 const resultModal=topModal(),resumeExplorationAuto=Boolean(battle.explorationAuto&&!memoryBattle);let resultClosed=false,autoResultTimer=null;resultModal.hidden=true;
 const primary=resultModal.querySelector("[data-modal-primary]"),showBossSaveWarning=()=>{if(bossProgressSaved||!boss||memoryBattle)return;primary.textContent="討伐状態を保存して続ける";if(!resultModal.querySelector("[data-boss-save-warning]"))resultModal.querySelector(".game-modal-body")?.insertAdjacentHTML("beforeend",'<p class="boss-save-warning" data-boss-save-warning>討伐状態をまだ保存できていません。容量とブラウザ設定を確認し、再試行してください。</p>')};
 const ensureBossProgressSaved=()=>{if(bossProgressSaved||!boss||memoryBattle)return true;persistExpeditionSnapshot(snapshot,{saveNow:false});bossProgressSaved=Boolean(save.save());if(!bossProgressSaved){showBossSaveWarning();showToast("討伐状態を保存できませんでした");return false}resultModal.querySelector("[data-boss-save-warning]")?.remove();primary.textContent="探索を続ける";return true};
 const returnToExplore=()=>{if(resultClosed||!ensureBossProgressSaved())return;resultClosed=true;resultModal?.remove();battle=null;if(playEnding){play1000EndingSequence();return}if(playTrueEnding){play10000EndingSequence();return}screen=memoryBattle?"home":"explore";render()};
 resultModal._onDismiss=returnToExplore;
 primary.onclick=()=>{if(autoResultTimer)clearTimeout(autoResultTimer);returnToExplore()};
 const revealReward=()=>{resultModal.hidden=false;showBossSaveWarning();if(resumeExplorationAuto&&bossProgressSaved)autoResultTimer=setTimeout(returnToExplore,1000)};
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
 const requestedId=String(boss?.floorBossCatalogId??""),definition=(requestedId?floorBossDefinitionById(requestedId):null)??floorBossDefinitionForFloor(floor);if(!definition||requestedId&&requestedId!==definition.id)return null;
 const design=floorBossEquipmentDesignByPiece(definition.id,piece);if(!design)return null;
 const inputFloor=Math.max(1,Math.floor(Number(floor)||1)),economicFloor=Math.max(1,Math.floor(Number(definition.floor)||inputFloor)),displayFloor=inputFloor===economicFloor?Math.max(1,Math.min(CAMPAIGN_MAX_FLOOR,Math.round(economicFloor/10))):Math.max(1,Math.min(CAMPAIGN_MAX_FLOOR,inputFloor));
 const slot=design.slot??piece,pool=slot==="weapon"?EQUIPMENT_BASES.weapon.filter(base=>design.weaponType?base.weaponType===design.weaponType:true):EQUIPMENT_BASES[slot],base=randomFrom(pool.length?pool:EQUIPMENT_BASES[slot]),item=createEquipment(slot,{rarity:"神話",base,weaponType:design.weaponType,ruleOverrides:{floorBossDedicated:true,floorBossPiece:piece,bossCatalogId:definition.id,cycleFloor:definition.cycleFloor,subslot:design.subslot??undefined,preferredSubslot:design.subslot??undefined}});
 item.name=`${design.name}${displayFloor!==Math.round(Number(definition.cycleFloor||economicFloor)/10)?`〈${displayFloor}階〉`:""}`;
 for(const[key,value]of Object.entries(design.stats??{})){const current=Number(item.stats?.[key])||0,addition=Number(value)||0;item.stats[key]=current+addition}
 item.series=null;item.level=equipmentDropLevelForFloor(economicFloor,{boss:true});item.plus=Math.min(10,Math.floor(economicFloor/1000));item.obtainedFloor=displayFloor;item.obtainedMethod="floorBossDedicated";normalizeFloorBossDedicatedItem(item);
 return item
}
function dedicatedFloorBossWeapon(floor,boss){return dedicatedFloorBossEquipment(floor,boss,"weapon")}

function lose(){
 if(battle?.specialBattle)return finishSpecialBattle(false);
 audio.setScene("defeat");audio.sfx("defeat");
 if(battle?.memoryBattle){
  clearPartySynergy();syncPersistentAilments(battle);battle.party.forEach(monster=>{monster.currentHp=Math.max(1,monster.currentHp??1);monster.currentMp=Math.max(0,monster.currentMp??0)});
  clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();
  app.insertAdjacentHTML("beforeend",Modal("記憶から離脱",`<div class="defeat-cinematic memory-defeat">${pixelIcon("memory")}<h2>記憶の魔物に敗れた</h2><p>所持GOLDと探索進行には影響しません。</p><small>挑戦時に消費した魔晶石は返還されません。</small></div>`,"拠点へ戻る"));
  const memoryModal=topModal(),finish=()=>{memoryModal?.remove();battle=null;go("home")};memoryModal._onDismiss=finish;memoryModal.querySelector("[data-modal-primary]").onclick=finish;return
 }
 if((battle?.enemies??[]).some(enemy=>enemy?.boss)&&snapshot?.world){
  clearPartySynergy();stopExploreAuto("AUTO停止：支配者戦で敗北");syncPersistentAilments(battle);const lost=Math.min(Math.floor(save.state.player.gold*.05),Math.max(100,goldForClearedFloor(campaignFloorToLegacyFloor(save.state.player.currentFloor))));save.state.player.gold-=lost;battle.party.forEach(monster=>{monster.currentHp=Math.max(1,Math.round(calculatedStats(monster).hp*.3));monster.currentMp=Math.max(0,Math.round(maxMp(monster)*.2));clearAilments(monster)});snapshot.player.x=snapshot.world.start.x;snapshot.player.y=snapshot.world.start.y;snapshot.player.rx=snapshot.world.start.x;snapshot.player.ry=snapshot.world.start.y;snapshot.player.path=[];snapshot.world.encountering=false;persistExpeditionSnapshot(snapshot);clearBattleCheckpoint();document.querySelector(".battle-screen")?.remove();activeEnemy=null;save.save();app.insertAdjacentHTML("beforeend",Modal("支配者戦・敗北",`<div class="defeat-cinematic"><div class="defeat-mark">☠</div><h2>入口まで退いた</h2><p>${lost.toLocaleString()}Gを失ったが、地図と拾った鍵は保持されています。</p><small>部隊はHP30%・MP20%で救出。支配者へ再挑戦できます。</small></div>`,`同じ階の入口から再開`));const modal=topModal(),resume=()=>{modal.remove();battle=null;screen="explore";render()};modal._onDismiss=resume;modal.querySelector("[data-modal-primary]").onclick=resume;return
 }
 clearPartySynergy();stopExploreAuto("AUTO停止：部隊が全滅しました");cancelPendingExploreActions();const lossCap=Math.max(100,goldForClearedFloor(campaignFloorToLegacyFloor(save.state.player.currentFloor))),lost=Math.min(Math.floor(save.state.player.gold*.10),lossCap),guide=contextualGuideState();bumpGuideCounter(guide,"defeats");setGuidePending(guide,"bedRecovery",true);save.state.player.gold-=lost;save.state.player.currentFloor=save.state.player.checkpoint;save.state.player.inRun=false;abandonManualExpedition(save.state);
 syncPersistentAilments(battle);battle.party.forEach(m=>{m.currentHp=1;m.currentMp=0;m.history??={};m.history.defeats=(m.history.defeats??0)+1;m.history.consecutiveDeployments=0});delete save.state.expeditionAffectionDeaths;clearExpeditionSnapshot();clearBattleCheckpoint();snapshot=null;document.querySelector(".battle-screen")?.remove();
 save.save();app.insertAdjacentHTML("beforeend",Modal("敗北",`<div class="defeat-cinematic"><div class="defeat-mark">☠</div><h2>深淵に敗れた…</h2><p><b>${lost}G</b>を失い、${save.state.player.checkpoint}階の拠点へ帰還します。</p><small>仲間はHP1で救出されました。拠点の寝台で回復できます。</small></div>`,"拠点へ戻る"));
 const modal=topModal(),returnHome=()=>{modal?.remove();battle=null;go("home")};modal._onDismiss=returnHome;modal.querySelector("[data-modal-primary]").onclick=returnHome
}
if(retireLegacyCampaignSairanBattle())save.save();
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
if(screen==="campaignFinalFloor"){const finalLedger=campaignHeroLedger();if(finalLedger.rewind?.active||!finalLedger.finalArena?.unlocked||finalLedger.finalArena?.completed)screen="home"}
if(retireLegacyCampaignBossRewardChoices())save.save();
const resumedSavedBattle=resumeSavedBattle();
if(!resumedSavedBattle)render();
if(!resumedSavedBattle)setTimeout(()=>resumePendingEmergency(),180);
if(!resumedSavedBattle)setTimeout(()=>{notifyInterruptedGuestProgressRecovery();showLegacyOnlineProgressRecovery()},720);
const skillRebalance=save.state.abyssSkillRebalance;
if(skillRebalance?.refund>0&&!skillRebalance.notifiedAt){
 skillRebalance.notifiedAt=new Date().toISOString();
 save.save();
 setTimeout(()=>showToast(`🪙 深淵ツリー価格差額 ${Number(skillRebalance.refund).toLocaleString()}Gを返還しました`),120);
}
// 戦力ランキングはゲーム画面と同じ OnlinePartyController / WebSocket を
// 共有する。二重接続を作らず、編成差分は30秒まとめ、定期更新は5分ごと。
ensureOnlinePartyController();
queueMicrotask(()=>{ensurePowerRankingConnection({force:true});schedulePowerRankingPublish({initial:true})});
setInterval(()=>{
 if(document.visibilityState==="hidden")return;
 ensurePowerRankingConnection();
 schedulePowerRankingPublish();
 if(Date.now()-powerRankingLastPublishedAt>=300000)publishPowerRankingSnapshot({force:true});
},5000);
document.addEventListener("visibilitychange",()=>{
 if(document.visibilityState!=="visible")return;
 ensurePowerRankingConnection({force:true});
 setTimeout(()=>publishPowerRankingSnapshot({force:true}),900);
});
