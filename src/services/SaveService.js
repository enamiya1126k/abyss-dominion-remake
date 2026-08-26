import{SAVE_KEY,APP_VERSION,SAVE_SCHEMA_VERSION,MAX_PARTY_SIZE,TRUE_MAX_LEVEL,ENDGAME_MAX_LEVEL,MONSTER_STAR_MAX,normalizeBattleSpeed}from"../core/config.js?v=2.11.54-build225";
import{createMonster,totalExperience,applyTotalExperience,expNeedFor}from"../models/Monster.js?v=2.11.30-build195";
import{maxMp,normalizeSkillProgress,allLearnedSkills,skillMasteryNeedForLevel}from"../battle/SkillSystem.js?v=2.11.36-build201";
import{normalizeEndgameState,ENDGAME_BOSSES}from"../core/EndgameSystem.js?v=2.11.30-build195";
import{normalizeFloorBossChallengeState}from"../core/FloorBossChallengeSystem.js?v=2.11.30-build195";
import{FLOOR_BOSS_CATALOG,floorBossDefinitionById}from"../data/floorBosses.js?v=2.11.30-build195";
import{normalizeSecondWorldEvents}from"../core/SecondWorldEventSystem.js?v=2.11.0-build164";
import{normalizeEliteRecords}from"../core/SecondWorldEliteSystem.js?v=2.11.0-build164";
import{normalizeTenGodContact}from"../core/TenGodContactSystem.js?v=2.11.0-build164";
import{SPECIES}from"../data/species.js?v=2.11.0-build164";
import{isPersistentStatus,normalizePersistentAilments}from"../data/statusEffects.js?v=2.11.0-build164";
import{normalizeWeaponMastery}from"./WeaponMastery.js?v=2.11.0-build164";

import{normalizeReturnRewards}from"../core/ReturnRewardSystem.js?v=2.11.0-build164";
import{createAbyssSkillTreeState,normalizeAbyssSkillTree}from"../core/AbyssSkillTreeSystem.js?v=2.11.0-build164";
import{normalizeEquipmentLoadouts}from"./EquipmentLoadoutSystem.js?v=2.11.45-build210";
import{normalizeEquipmentAffixLocks,normalizeEquipmentCraftingState}from"./EquipmentAffixCrafting.js?v=2.11.0-build164";
import{normalizeSecretRoomState}from"../core/SecretRoomSystem.js?v=2.11.30-build195";
import{normalizeCombatPowerRecord}from"../core/CombatPower.js?v=2.11.30-build195";
import{normalizeSerialCodeState}from"../core/SerialCodeSystem.js?v=2.11.30-build195";
import{normalizeNoticeState}from"../core/NoticeSystem.js?v=2.11.34-build199";
import{normalizeMagicCircleState}from"../core/MagicCircleSystem.js?v=2.11.0-build164";
import{canonicalAttribute,normalizedResistances}from"../data/attributes.js?v=2.11.0-build164";
import{normalizeEquipmentIdentity}from"../data/equipment.js?v=2.11.30-build195";
import{createContextualGuideState,normalizeContextualGuide}from"../core/ContextualGuideSystem.js?v=2.11.34-build199";
const LR_SERIAL_CHARACTER_IDS=new Set(["myth_enami","myth_yori","myth_rion","myth_hide"]);
function finiteNumber(value,fallback=0,min=-Infinity,max=Infinity){
 const number=Number(value);
 return Number.isFinite(number)?Math.max(min,Math.min(max,number)):fallback;
}
function normalizeRecentEncounter(value){
 if(!value||typeof value!=="object"||!SPECIES[value.speciesId])return null;
 const entry={
  speciesId:String(value.speciesId),
  level:Math.floor(finiteNumber(value.level,1,1,TRUE_MAX_LEVEL)),
  equipped:Boolean(value.equipped),
  elite:Boolean(value.elite),
  recordedFloor:Math.floor(finiteNumber(value.recordedFloor,1,1,10000)),
  recordedAt:typeof value.recordedAt==="string"?value.recordedAt:new Date(0).toISOString()
 };
 if(value.gear&&typeof value.gear==="object"&&!Array.isArray(value.gear))entry.gear=value.gear;
 return entry;
}
function normalizeBossEncounter(value){
 const entry=normalizeRecentEncounter(value);
 if(!entry)return null;
 entry.boss=true;
 entry.uncapturable=Boolean(value.uncapturable||value.endgameBossId||["abyss","tenGod"].includes(value.faction));
 entry.nameOverride=typeof value.nameOverride==="string"?value.nameOverride.slice(0,80):null;
 entry.endgameBossId=typeof value.endgameBossId==="string"?value.endgameBossId:null;
 entry.faction=typeof value.faction==="string"?value.faction:null;
 entry.powerRate=finiteNumber(value.powerRate,1,.1,100);
 entry.manifestationLabel=typeof value.manifestationLabel==="string"?value.manifestationLabel.slice(0,40):null;
 return entry;
}
function normalizeBattleMemoryEntry(value){
 if(!value||typeof value!=="object"||!SPECIES[value.speciesId])return null;
 const entry={...value};
 entry.speciesId=String(value.speciesId);
 const endgame=Boolean(value.endgameBossId||["abyss","tenGod"].includes(value.faction));
 entry.level=Math.floor(finiteNumber(value.level,1,1,endgame?ENDGAME_MAX_LEVEL:TRUE_MAX_LEVEL));
 entry.boss=Boolean(value.boss);
 entry.elite=Boolean(value.elite);
 entry.equipped=Boolean(value.equipped&&value.gear);
 entry.uncapturable=Boolean(value.uncapturable||endgame);
 if(value.gear&&typeof value.gear==="object"&&!Array.isArray(value.gear))entry.gear=value.gear;
 else delete entry.gear;
 return entry;
}
function normalizeBattleMemory(value){
 if(!value||typeof value!=="object")return null;
 const source=Array.isArray(value.entries)?value.entries:(value.speciesId?[value]:[]);
 const entries=source.map(normalizeBattleMemoryEntry).filter(Boolean).slice(0,8);
 if(!entries.length)return null;
 return{
  entries,
  signature:typeof value.signature==="string"?value.signature.slice(0,2000):null,
  recordedFloor:Math.floor(finiteNumber(value.recordedFloor,1,1,10000)),
  recordedAt:typeof value.recordedAt==="string"?value.recordedAt:new Date(0).toISOString()
 };
}
function normalizeExploreRun(value){
 const run=value&&typeof value==="object"&&!Array.isArray(value)?value:{};
 const floors=run.floors&&typeof run.floors==="object"&&!Array.isArray(run.floors)?run.floors:{};
 const normalizedFloors={};
 for(const [floorKey,floorValue]of Object.entries(floors).slice(-3)){
  if(!floorValue||typeof floorValue!=="object"||Array.isArray(floorValue))continue;
  const decorations=floorValue.decorations&&typeof floorValue.decorations==="object"&&!Array.isArray(floorValue.decorations)?floorValue.decorations:{};
  normalizedFloors[String(Math.floor(finiteNumber(floorKey,1,1,10000)))]={decorations:Object.fromEntries(Object.entries(decorations).slice(0,120).map(([id,state])=>[String(id).slice(0,100),{used:Boolean(state?.used),destroyed:Boolean(state?.destroyed)}]))};
 }
 return{id:typeof run.id==="string"?run.id.slice(0,100):null,floors:normalizedFloors};
}
function normalizeExpeditionSnapshot(value){
 if(!value||typeof value!=="object"||Array.isArray(value))return null;
 const sourceWorld=value.world;
 if(!sourceWorld||typeof sourceWorld!=="object"||!Array.isArray(sourceWorld.tiles)||!sourceWorld.start||!sourceWorld.exit)return null;
 const world={...sourceWorld};
 world.cols=Math.floor(finiteNumber(world.cols,world.tiles[0]?.length??1,1,100));
 world.rows=Math.floor(finiteNumber(world.rows,world.tiles.length,1,100));
 world.encountering=false;
 world.steps=Math.floor(finiteNumber(world.steps,0,0,Number.MAX_SAFE_INTEGER));
 world.nextEncounter=Math.floor(finiteNumber(world.nextEncounter,8,0,Number.MAX_SAFE_INTEGER));
 world.chests=Array.isArray(world.chests)?world.chests.slice(0,120):[];
 world.decorations=Array.isArray(world.decorations)?world.decorations.slice(0,180):[];
 const x=finiteNumber(value.player?.x,world.start.x,0,world.cols-1),y=finiteNumber(value.player?.y,world.start.y,0,world.rows-1);
 const player={x,y,rx:finiteNumber(value.player?.rx,x,0,world.cols-1),ry:finiteNumber(value.player?.ry,y,0,world.rows-1),path:[],p:0};
 const cameraData={
  x:finiteNumber(value.cameraData?.x,x,Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER),
  y:finiteNumber(value.cameraData?.y,y,Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER),
  z:finiteNumber(value.cameraData?.z,1,.45,2.25),
  ox:finiteNumber(value.cameraData?.ox,0,Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER),
  oy:finiteNumber(value.cameraData?.oy,0,Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER),
  manual:Boolean(value.cameraData?.manual)
 };
 const partyTrail=(Array.isArray(value.partyTrail)?value.partyTrail:[]).slice(0,512).map(point=>({x:finiteNumber(point?.x,x,-100,100),y:finiteNumber(point?.y,y,-100,100)}));
 return{floor:Math.floor(finiteNumber(value.floor,1,1,10000)),world,player,partyTrail,cameraData,savedAt:typeof value.savedAt==="string"?value.savedAt:new Date(0).toISOString()};
}
function normalizeInventory(inventory){
 const normalized=inventory&&typeof inventory==="object"&&!Array.isArray(inventory)?inventory:{};
 for(const key of["potions","highPotions","partyPotions","manaPotions","highManaPotions","partyManaPotions","fullManaPotions","partyFullManaPotions","reviveLeaves","statusCures","partyStatusCures","fullHeals","partyFullHeals","experienceItems","experienceItemsMedium","experienceItemsLarge","experienceItemsUltra","captureCrystals","abyssKeys"]){
  normalized[key]=Math.floor(finiteNumber(normalized[key],0,0,Number.MAX_SAFE_INTEGER));
 }
 return normalized;
}
function normalizeEquipmentCollections(state){
 const collections=["equipment","reserveEquipment","bossEquipmentVault"];
 const seen=new Set();
 for(const name of collections){
  const source=Array.isArray(state[name])?state[name]:[];
  state[name]=source.filter(item=>{
   if(!item||typeof item!=="object")return false;
   if(!item.id)item.id=`equipment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
   if(seen.has(item.id))return false;
   seen.add(item.id);
   return true;
  });
 }
}
function reconcilePartyAndEquipment(state){
 const monsterIds=new Set(state.monsters.map(monster=>monster.id));
 const party=[];
 for(const id of Array.isArray(state.party)?state.party:[]){
  if(monsterIds.has(id)&&!party.includes(id)&&party.length<MAX_PARTY_SIZE)party.push(id);
 }
 if(!party.length&&state.monsters[0])party.push(state.monsters[0].id);
 state.party=party;
 normalizeEquipmentLoadouts(state);
}

function normalizeContractedEndgameMonster(monster){
 if(!monster?.isContractedEndgame&&!monster?.endgameBossId)return;
 const boss=ENDGAME_BOSSES[monster.endgameBossId];if(!boss)return;
 monster.isContractedEndgame=true;monster.endgameFaction=boss.faction;monster.contractSignature=boss.signature;monster.contractSignatureName??=boss.signatureName??boss.skills?.[0]??boss.signature;monster.contractSeriesId=boss.seriesId;
 monster.tags=Array.from(new Set([...(Array.isArray(monster.tags)?monster.tags:[]),boss.faction,boss.id,"contractedEndgame"].filter(Boolean)));
 if(Number(monster.contractProfileVersion??0)>=2)return;
 const divine=boss.faction==="tenGod";monster.plus=Math.max(Number(monster.plus)||0,divine?50:25);monster.affection=Math.max(Number(monster.affection??monster.bond)||0,divine?1000:750);monster.bond=monster.affection;monster.favorite=true;monster.locked=true;
 const strongest=allLearnedSkills(monster).slice(-4);monster.equippedSkills=strongest.map(skill=>skill.id);monster.skillProgress=monster.skillProgress&&typeof monster.skillProgress==="object"&&!Array.isArray(monster.skillProgress)?monster.skillProgress:{};
 for(const skill of strongest){const current=monster.skillProgress[skill.id]??{};const level=Math.max(Number(current.level)||1,divine?5:3);monster.skillProgress[skill.id]={...current,level,exp:Math.max(0,Number(current.exp)||0),uses:Math.max(0,Number(current.uses)||0),need:skillMasteryNeedForLevel(level)}}
 monster.skillLoadoutInitialized=true;monster.contractProfileVersion=2;
}
function initialState(){
 const monsters=[
  createMonster("slime",{nickname:"ぷるん",colorId:"green",personalityId:"bold"})
 ];
const state={schemaVersion:SAVE_SCHEMA_VERSION,appVersion:APP_VERSION,flags:{abyssUnlocked:false,trueLevelCapRevealed:false,deepAbyssUnlocked:false,gameClear1000:false,ending1000Played:false,gameClear10000:false,ending10000Played:false,secondWorldEntered:false,tenGodObserved:false,individualValuesDisabled:true},worldPhase:0,player:{gold:1000,crystals:20,maxFloor:1,currentFloor:1,checkpoint:1,inRun:false,nextShopFloor:4,floorSeeds:{},openedChests:{},bossRewards:{},pendingBossRewards:{},bossKills:{},dangerLevel:1,exploreRun:{id:null,floors:{}}},expeditionSnapshot:null,monsters,party:monsters.map(m=>m.id),recentEncounter:null,recentBossEncounter:null,recentBattleMemory:null,battleMemoryAttempts:{},equipment:[],reserveEquipment:[],bossEquipmentVault:[],equipmentCrafting:{rerolls:0,goldSpent:0,maxLocksUsed:0},inventory:{potions:3,highPotions:0,partyPotions:1,manaPotions:1,highManaPotions:0,partyManaPotions:0,fullManaPotions:0,partyFullManaPotions:0,reviveLeaves:1,statusCures:1,partyStatusCures:0,fullHeals:0,partyFullHeals:0,experienceItems:0,experienceItemsMedium:0,experienceItemsLarge:0,experienceItemsUltra:0,captureCrystals:5,abyssKeys:0},onlineParty:{claimedRewards:[],totalGold:0,totalCaptureCrystals:0,expeditionsCompleted:0,battlesWon:0,captures:0,raidWins:0,raidMaterials:0,raidExchange:{},raidWorld:{},tradeEscrow:{},completedTradeIds:[],tradeHistory:[],processedVitalMutationIds:[],processedBattleEventIds:[],hostWorld:{openedChestIds:{},floorSeeds:{},defeatedBossFloors:[],claimedBossRewardFloors:[]}},shop:{captureDaily:{key:null,count:0}},magicCircles:{unlocked:{},instances:[],owned:{},goldSpent:0,version:3},settings:{minimapVisible:false,shopDiscountSeed:null,autoBattle:true,equipmentSort:"rarity",battleSpeed:1,audioEnabled:true,musicVolume:.28,sfxVolume:.45,mapTogglePosition:null,minimapPanelPosition:null,autoExploreButtonPosition:null,minimapPanelPosition:null,autoExploreButtonPosition:null,explorePartyHudCollapsed:false,exploreAutoMode:"off",exploreAutoMenuOpen:false,gauntletPartyCollapsed:false,tutorialSeen:{},tutorialDefeatsSeen:0,contextualGuide:createContextualGuideState(monsters.length),gmFloorUnlockMax:0},gameMaster:{claimedAt:null,floorUnlockMax:0},gacha:{firstTenUsed:false,tutorialFreeSummons:0,lastDailyKey:null,guerrilla:{salt:null,lastCycle:null}},notices:{readIds:[],dailyGift:{dayKey:null,claimedDayKey:null,claimedAt:null}},codex:{encounters:{slime:1},captures:{slime:1},equipment:{}},biomeProgress:{},achievements:{},quests:{},rest:{lastFreeKey:null},records:{kills:0,captures:0,chests:0,purchases:0,combatPower:{highest:0,previous:0,updatedAt:null,history:[]}},serialCodes:{redeemed:{}},secretRooms:{run:null,activeRoom:null},abyssSkillTree:createAbyssSkillTreeState(),secondWorld:{randomEvents:{resolvedFloors:[],counts:{}},elites:{encountered:0,defeated:0,byAffix:{},bySpecies:{}}},floorBossChallenges:{discovered:{},encounters:{},fragments:{},victories:{},contracts:{},processedResults:{}},endgame:{processedSpecialResults:{},teamBattle:{unlocked:false,stage:1,totalWins:0,totalLosses:0,dailyKey:null,dailyAttempts:0},trials:{battle:1,loop:1,cleared:[],run:null,dailyKey:null,dailyAttempts:0},emergency:{encounters:0,wins:0,losses:0,lastFloor:0,lastTriggeredFloor:0,records:{},fragments:{},craftCounts:{},craftedGear:[],processedFragmentResults:{},manualChallenges:{dailyKey:null,dailyAttempts:0,unlocks:{}},rescue:{post1000Encounters:0,consecutiveLosses:0,lastResult:null}}}};
 state.onlineParty.firstCoopBossClears=[];
 state.onlineParty.hostWorld.defeatedBossFloors=[];
 normalizeSerialCodeState(state);
 normalizeMagicCircleState(state);
 return state;
}
export class SaveService{
 constructor(){this.state=this.load();this.save()}
 load(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?this.migrate(JSON.parse(raw)):initialState()}catch(e){console.error(e);return initialState()}}
 migrate(s){
  const from=Number(s.schemaVersion??1);
  s.flags??={};s.flags.abyssUnlocked??=false;s.flags.trueLevelCapRevealed??=false;s.flags.deepAbyssUnlocked??=false;s.flags.abyssKeyExchangePreviewUnlocked??=false;
  s.flags.individualValuesDisabled=true;
  const legacy1000Clear=Number(s.player?.maxFloor??0)>1000||Boolean(s.player?.bossRewards?.[1000])||Number(s.player?.bossKills?.[1000]??0)>0||Boolean(s.flags.deepAbyssUnlocked);
  s.flags.gameClear1000=Boolean(s.flags.gameClear1000||legacy1000Clear);
  s.flags.ending1000Played??=false;
  const legacy10000Clear=Boolean(s.player?.bossRewards?.[10000])||Number(s.player?.bossKills?.[10000]??0)>0;
  s.flags.gameClear10000=Boolean(s.flags.gameClear10000||legacy10000Clear);
  s.flags.ending10000Played??=false;
  s.flags.secondWorldEntered=Boolean(s.flags.secondWorldEntered||Number(s.player?.maxFloor??0)>=1001);
  s.flags.tenGodObserved??=false;
  s.flags.deepAbyssUnlocked=Boolean(s.flags.deepAbyssUnlocked||s.flags.gameClear1000||s.flags.secondWorldEntered);
  s.worldPhase=s.flags.gameClear1000?1:Math.max(0,Math.min(1,Number(s.worldPhase)||0));
  s.player??={};
  s.player.gold=Math.floor(finiteNumber(s.player.gold,1000,0,Number.MAX_SAFE_INTEGER));
  s.player.crystals=Math.floor(finiteNumber(s.player.crystals,20,0,Number.MAX_SAFE_INTEGER));
  s.player.maxFloor=Math.floor(finiteNumber(s.player.maxFloor,1,1,10000));
  s.player.currentFloor=Math.floor(finiteNumber(s.player.currentFloor,1,1,10000));
  s.player.checkpoint=Math.floor(finiteNumber(s.player.checkpoint,1,1,10000));
  s.player.inRun??=false;
  s.player.nextShopFloor??=4;
  s.player.floorSeeds??={};
  s.player.openedChests??={};
  s.player.bossRewards??={};
  s.player.pendingBossRewards=s.player.pendingBossRewards&&typeof s.player.pendingBossRewards==="object"&&!Array.isArray(s.player.pendingBossRewards)?s.player.pendingBossRewards:{};
  s.player.bossKills??={};
  s.player.dangerLevel??=1;
  s.player.exploreRun=normalizeExploreRun(s.player.exploreRun);
  s.expeditionSnapshot=normalizeExpeditionSnapshot(s.expeditionSnapshot);
  if(!s.player.inRun&&!s.activeBattle)s.expeditionSnapshot=null;
  if(s.activeBattle&&typeof s.activeBattle==="object"){s.activeBattle.explorationSnapshot=normalizeExpeditionSnapshot(s.activeBattle.explorationSnapshot??s.expeditionSnapshot);s.activeBattle.actionCommitted=Boolean(s.activeBattle.actionCommitted)}
  s.recentEncounter=normalizeRecentEncounter(s.recentEncounter);
  s.recentBossEncounter=normalizeBossEncounter(s.recentBossEncounter);
  s.recentBattleMemory=normalizeBattleMemory(s.recentBattleMemory)??normalizeBattleMemory(s.recentBossEncounter)??normalizeBattleMemory(s.recentEncounter);
  s.battleMemoryAttempts=s.battleMemoryAttempts&&typeof s.battleMemoryAttempts==="object"&&!Array.isArray(s.battleMemoryAttempts)?s.battleMemoryAttempts:{};
  for(const [signature,count]of Object.entries(s.battleMemoryAttempts))s.battleMemoryAttempts[signature]=Math.floor(finiteNumber(count,0,0,60));
  s.monsters=(Array.isArray(s.monsters)?s.monsters:[]).filter(monster=>monster&&typeof monster==="object"&&SPECIES[monster.speciesId]);
  const monsterIds=new Set();
  s.monsters=s.monsters.filter(monster=>{if(!monster.id||monsterIds.has(monster.id))return false;monsterIds.add(monster.id);return true});
  if(!s.monsters.length)s.monsters=[createMonster("slime",{nickname:"ぷるん",colorId:"green",personalityId:"bold"})];
  s.party=Array.isArray(s.party)?s.party:[];
  s.equipment=Array.isArray(s.equipment)?s.equipment:[];
  s.reserveEquipment=Array.isArray(s.reserveEquipment)?s.reserveEquipment:[];
  s.bossEquipmentVault=Array.isArray(s.bossEquipmentVault)?s.bossEquipmentVault:[];
  normalizeEquipmentCollections(s);
  s.inventory=normalizeInventory(s.inventory);
  s.onlineParty=s.onlineParty&&typeof s.onlineParty==="object"&&!Array.isArray(s.onlineParty)?s.onlineParty:{};
  s.onlineParty.claimedRewards=Array.isArray(s.onlineParty.claimedRewards)?[...new Set(s.onlineParty.claimedRewards.map(String).filter(Boolean))].slice(-200):[];
  s.onlineParty.totalGold=Math.floor(finiteNumber(s.onlineParty.totalGold,0,0,Number.MAX_SAFE_INTEGER));
  s.onlineParty.totalCaptureCrystals=Math.floor(finiteNumber(s.onlineParty.totalCaptureCrystals,0,0,Number.MAX_SAFE_INTEGER));
  s.onlineParty.expeditionsCompleted=Math.floor(finiteNumber(s.onlineParty.expeditionsCompleted,0,0,Number.MAX_SAFE_INTEGER));
  s.onlineParty.battlesWon=Math.floor(finiteNumber(s.onlineParty.battlesWon,0,0,Number.MAX_SAFE_INTEGER));
  s.onlineParty.captures=Math.floor(finiteNumber(s.onlineParty.captures,0,0,Number.MAX_SAFE_INTEGER));
  s.onlineParty.raidWins=Math.floor(finiteNumber(s.onlineParty.raidWins,0,0,Number.MAX_SAFE_INTEGER));
  s.onlineParty.raidMaterials=Math.floor(finiteNumber(s.onlineParty.raidMaterials,0,0,Number.MAX_SAFE_INTEGER));
  s.onlineParty.raidExchange=s.onlineParty.raidExchange&&typeof s.onlineParty.raidExchange==="object"&&!Array.isArray(s.onlineParty.raidExchange)?s.onlineParty.raidExchange:{};
  const raidWorld=s.onlineParty.raidWorld&&typeof s.onlineParty.raidWorld==="object"&&!Array.isArray(s.onlineParty.raidWorld)?s.onlineParty.raidWorld:{};
  const cleanRaidContribution=value=>({damage:Math.floor(finiteNumber(value?.damage,0,0,Number.MAX_SAFE_INTEGER)),taken:Math.floor(finiteNumber(value?.taken,0,0,Number.MAX_SAFE_INTEGER)),healing:Math.floor(finiteNumber(value?.healing,0,0,Number.MAX_SAFE_INTEGER)),mpHealing:Math.floor(finiteNumber(value?.mpHealing,0,0,Number.MAX_SAFE_INTEGER)),revives:Math.floor(finiteNumber(value?.revives,0,0,Number.MAX_SAFE_INTEGER)),guards:Math.floor(finiteNumber(value?.guards,0,0,Number.MAX_SAFE_INTEGER)),support:Math.floor(finiteNumber(value?.support,0,0,Number.MAX_SAFE_INTEGER))});
  const raidContribution=raidWorld.contribution&&typeof raidWorld.contribution==="object"&&!Array.isArray(raidWorld.contribution)?Object.fromEntries(Object.entries(raidWorld.contribution).slice(0,4).map(([playerId,value])=>[String(playerId).slice(0,24),cleanRaidContribution(value)])):{};
  const raidRanking=(Array.isArray(raidWorld.ranking)?raidWorld.ranking:[]).slice(0,4).map((entry,index)=>({playerId:String(entry?.playerId??"").slice(0,24),name:String(entry?.name??"挑戦者").slice(0,24),rank:Math.max(1,Math.min(4,Math.floor(Number(entry?.rank)||index+1))),score:Math.floor(finiteNumber(entry?.score,0,0,Number.MAX_SAFE_INTEGER)),...cleanRaidContribution(entry)}));
  s.onlineParty.raidWorld={
   campaignId:raidWorld.campaignId==null?null:String(raidWorld.campaignId).slice(0,120),
   maxHp:Math.floor(finiteNumber(raidWorld.maxHp,0,0,Number.MAX_SAFE_INTEGER)),
   hp:Math.floor(finiteNumber(raidWorld.hp,0,0,Number.MAX_SAFE_INTEGER)),
   attempts:Math.floor(finiteNumber(raidWorld.attempts,0,0,Number.MAX_SAFE_INTEGER)),
   totalDamage:Math.floor(finiteNumber(raidWorld.totalDamage,0,0,Number.MAX_SAFE_INTEGER)),
   milestonesClaimed:Array.isArray(raidWorld.milestonesClaimed)?[...new Set(raidWorld.milestonesClaimed.map(value=>Math.floor(Number(value))).filter(value=>value>0&&value<=100))].slice(0,20):[],
   lastAttemptAt:Math.floor(finiteNumber(raidWorld.lastAttemptAt,0,0,Number.MAX_SAFE_INTEGER)),
   contribution:raidContribution,
   ranking:raidRanking,
  };
  s.onlineParty.tradeEscrow=s.onlineParty.tradeEscrow&&typeof s.onlineParty.tradeEscrow==="object"&&!Array.isArray(s.onlineParty.tradeEscrow)?s.onlineParty.tradeEscrow:{};
  s.onlineParty.completedTradeIds=Array.isArray(s.onlineParty.completedTradeIds)?[...new Set(s.onlineParty.completedTradeIds.map(String).filter(Boolean))].slice(-100):[];
  s.onlineParty.tradeHistory=Array.isArray(s.onlineParty.tradeHistory)?s.onlineParty.tradeHistory.filter(entry=>entry&&typeof entry==="object").slice(-50):[];
  s.onlineParty.processedVitalMutationIds=Array.isArray(s.onlineParty.processedVitalMutationIds)?[...new Set(s.onlineParty.processedVitalMutationIds.map(String).filter(Boolean))].slice(-256):[];
  s.onlineParty.processedBattleEventIds=Array.isArray(s.onlineParty.processedBattleEventIds)?[...new Set(s.onlineParty.processedBattleEventIds.map(String).filter(Boolean))].slice(-512):[];
  s.onlineParty.firstCoopBossClears=Array.isArray(s.onlineParty.firstCoopBossClears)?[...new Set(s.onlineParty.firstCoopBossClears.map(value=>Math.floor(Number(value))).filter(value=>value>0&&value%10===0))].slice(0,1000):[];
  s.onlineParty.hostWorld=s.onlineParty.hostWorld&&typeof s.onlineParty.hostWorld==="object"&&!Array.isArray(s.onlineParty.hostWorld)?s.onlineParty.hostWorld:{openedChestIds:{}};
  s.onlineParty.hostWorld.revision=Math.floor(finiteNumber(s.onlineParty.hostWorld.revision,0,0,Number.MAX_SAFE_INTEGER));
  s.onlineParty.hostWorld.openedChestIds=s.onlineParty.hostWorld.openedChestIds&&typeof s.onlineParty.hostWorld.openedChestIds==="object"&&!Array.isArray(s.onlineParty.hostWorld.openedChestIds)?s.onlineParty.hostWorld.openedChestIds:{};
  for(const floor of Object.keys(s.onlineParty.hostWorld.openedChestIds))s.onlineParty.hostWorld.openedChestIds[floor]=Array.isArray(s.onlineParty.hostWorld.openedChestIds[floor])?[...new Set(s.onlineParty.hostWorld.openedChestIds[floor].map(String).filter(Boolean))].slice(0,200):[];
  s.onlineParty.hostWorld.floorSeeds=s.onlineParty.hostWorld.floorSeeds&&typeof s.onlineParty.hostWorld.floorSeeds==="object"&&!Array.isArray(s.onlineParty.hostWorld.floorSeeds)?Object.fromEntries(Object.entries(s.onlineParty.hostWorld.floorSeeds).map(([floor,seed])=>[String(Math.max(1,Math.floor(Number(floor)||1))),Math.floor(finiteNumber(seed,0,0,0xffffffff))]).slice(0,10000)):{};
  s.onlineParty.hostWorld.defeatedBossFloors=Array.isArray(s.onlineParty.hostWorld.defeatedBossFloors)?[...new Set(s.onlineParty.hostWorld.defeatedBossFloors.map(value=>Math.floor(Number(value))).filter(value=>value>0&&value%10===0))].slice(0,1000):[];
  s.onlineParty.hostWorld.claimedBossRewardFloors=Array.isArray(s.onlineParty.hostWorld.claimedBossRewardFloors)?[...new Set(s.onlineParty.hostWorld.claimedBossRewardFloors.map(value=>Math.floor(Number(value))).filter(value=>value>0&&value%10===0))].slice(0,1000):[];
  s.shop=s.shop&&typeof s.shop==="object"&&!Array.isArray(s.shop)?s.shop:{};
  s.shop.captureDaily=s.shop.captureDaily&&typeof s.shop.captureDaily==="object"&&!Array.isArray(s.shop.captureDaily)?s.shop.captureDaily:{key:null,count:0};
  s.shop.captureDaily.count=Math.max(0,Math.min(3,Math.floor(finiteNumber(s.shop.captureDaily.count??s.shop.captureDaily.bought,0,0,3))));
  delete s.shop.captureDaily.bought;
  // Schema 49's GM pack accidentally granted 10,000 EXP crystals. Replace
  // only that grant with the intended 50 while preserving prior stock and use.
  if(from<50&&s.gameMaster?.claimedAt&&s.inventory.experienceItems>=9950){
   s.inventory.experienceItems=Math.max(0,s.inventory.experienceItems-9950);
  }
  // Correct the already-migrated saves that kept the faulty 10,000-item grant.
  // The marker makes the rescue idempotent for all future loads.
  s.flags.expCrystalGrantCorrectedV2=Boolean(s.flags.expCrystalGrantCorrectedV2);
  if(!s.flags.expCrystalGrantCorrectedV2&&s.gameMaster?.claimedAt&&s.inventory.experienceItems>=9900){
   s.inventory.experienceItems=Math.max(0,s.inventory.experienceItems-9950);
   s.flags.expCrystalGrantCorrectedV2=true;
  }
  s.settings??={};
  s.settings.minimapVisible??=true;
  s.settings.shopDiscountSeed??=null;
  s.settings.autoBattle??=true;
  s.settings.equipmentSort??="rarity";
  s.settings.equipmentSlot??="weapon";
  s.settings.equipmentStorage??="inventory";
  s.settings.battleSpeed=normalizeBattleSpeed(s.settings.battleSpeed);
  s.settings.audioEnabled=s.settings.audioEnabled!==false;
  s.settings.musicVolume=finiteNumber(s.settings.musicVolume,.28,0,1);
  s.settings.sfxVolume=finiteNumber(s.settings.sfxVolume,.45,0,1);
  s.settings.mapTogglePosition??=null;
  s.settings.minimapPanelPosition??=null;
  s.settings.autoExploreButtonPosition??=null;
  s.settings.explorePartyHudCollapsed=Boolean(s.settings.explorePartyHudCollapsed);
  s.settings.exploreAutoMode=["off","floor","items","exp"].includes(s.settings.exploreAutoMode)?s.settings.exploreAutoMode:"off";
  s.settings.exploreAutoMenuOpen=Boolean(s.settings.exploreAutoMenuOpen);
  s.settings.gauntletPartyCollapsed=Boolean(s.settings.gauntletPartyCollapsed);
  s.settings.tutorialSeen??={};
  s.settings.tutorialDefeatsSeen=Math.floor(finiteNumber(s.settings.tutorialDefeatsSeen,0,0,2));
  const contextualGuideMissing=!s.settings.contextualGuide||typeof s.settings.contextualGuide!=="object";
  const legacyGuideAdvanced=contextualGuideMissing&&(Number(s.player.maxFloor)>10||Boolean(s.settings.tutorialSeen?.[5]));
  s.settings.contextualGuide=normalizeContextualGuide(s.settings.contextualGuide,{monsterCount:s.monsters.length,legacyAdvanced:legacyGuideAdvanced});
  s.settings.gmFloorUnlockMax=Math.floor(finiteNumber(s.settings.gmFloorUnlockMax,0,0,9998));
  s.gameMaster=s.gameMaster&&typeof s.gameMaster==="object"&&!Array.isArray(s.gameMaster)?s.gameMaster:{claimedAt:null,floorUnlockMax:0};
  s.gameMaster.floorUnlockMax=Math.floor(finiteNumber(s.gameMaster.floorUnlockMax??s.settings.gmFloorUnlockMax,0,0,9998));
  s.gacha??={};s.gacha.firstTenUsed??=false;s.gacha.tutorialFreeSummons=Math.floor(finiteNumber(s.gacha.tutorialFreeSummons,0,0,1));s.gacha.lastDailyKey??=null;s.gacha.guerrilla=s.gacha.guerrilla&&typeof s.gacha.guerrilla==="object"&&!Array.isArray(s.gacha.guerrilla)?s.gacha.guerrilla:{salt:null,lastCycle:null};
  normalizeNoticeState(s);
  s.codex??={};s.codex.encounters??={};s.codex.captures??={};s.codex.equipment??={};s.biomeProgress??={};
  Object.values(s.biomeProgress).forEach(data=>{if(!data||typeof data!=="object")return;data.visitedFloors=Array.isArray(data.visitedFloors)?data.visitedFloors:[];data.encounters=data.encounters&&typeof data.encounters==="object"?data.encounters:{};data.openedChests=Array.isArray(data.openedChests)?data.openedChests:[];data.events=Array.isArray(data.events)?data.events:[];data.bossDefeated=Boolean(data.bossDefeated)});
  s.achievements??={};s.quests??={};
  s.rest??={};s.rest.lastFreeKey??=null;
  s.records??={kills:0,captures:0,chests:0,purchases:0};
  s.records.kills=Math.floor(finiteNumber(s.records.kills,0,0,Number.MAX_SAFE_INTEGER));
  s.records.captures=Math.floor(finiteNumber(s.records.captures,0,0,Number.MAX_SAFE_INTEGER));
  s.records.chests=Math.floor(finiteNumber(s.records.chests,0,0,Number.MAX_SAFE_INTEGER));
  s.records.purchases=Math.floor(finiteNumber(s.records.purchases,0,0,Number.MAX_SAFE_INTEGER));
  normalizeCombatPowerRecord(s,0);
  normalizeSerialCodeState(s);
  normalizeSecretRoomState(s);
  normalizeAbyssSkillTree(s);
  normalizeReturnRewards(s);
  normalizeEndgameState(s);
  // build195 prepends 90 authored floor-boss courts. Preserve an in-progress
  // build194 corridor by moving its old 1-22 court number behind that block.
  if(from<57&&s.endgame?.trials?.run?.active){const trials=s.endgame.trials,shift=value=>Math.max(91,Math.min(112,(Math.floor(Number(value)||1))+90));trials.battle=shift(trials.battle);trials.run.battle=shift(trials.run.battle);trials.cleared=(trials.cleared??[]).map(shift);if(s.activeBattle?.specialBattleType==="gauntlet")s.activeBattle.specialTrialNumber=shift(s.activeBattle.specialTrialNumber)}
  const floorBossChallenges=normalizeFloorBossChallengeState(s);
  // Existing players have already met rulers recorded by old boss kills/rewards.
  // Carry those encounters into the new challenge gate instead of forcing a
  // second dungeon visit merely because the gate did not exist in that build.
  if(from<57)for(const boss of FLOOR_BOSS_CATALOG){
   const defeated=Number(s.player.bossKills?.[boss.floor]??0)>0||Boolean(s.player.bossRewards?.[boss.floor]);
   if(defeated){floorBossChallenges.discovered[boss.id]=true;floorBossChallenges.encounters[boss.id]=Math.max(1,Number(floorBossChallenges.encounters[boss.id])||0)}
  }
  normalizeSecondWorldEvents(s);
  normalizeEliteRecords(s);
  normalizeTenGodContact(s);
  s.monsters.forEach(m=>{
   const authoredEndgame=Boolean(m.isContractedEndgame||m.endgameBossId);
   m.level=Math.floor(finiteNumber(m.level,1,1,authoredEndgame?ENDGAME_MAX_LEVEL:TRUE_MAX_LEVEL));
   m.exp=Math.floor(finiteNumber(m.exp,0,0,Number.MAX_SAFE_INTEGER));
   // build164 changed the EXP curve. Older saves keep their visible level and
   // current in-level progress instead of being reinterpreted by the new curve.
   const migratedProgress=from<56?Math.min(m.exp,Math.max(0,expNeedFor(m)-1)):m.exp;
   const canonicalTotal=from<56
    ?totalExperience({...m,totalExp:undefined,exp:migratedProgress})
    :Number.isFinite(Number(m.totalExp))
     ?Math.floor(finiteNumber(m.totalExp,0,0,Number.MAX_SAFE_INTEGER))
     :totalExperience({...m,totalExp:undefined});
   applyTotalExperience(m,canonicalTotal);
   m.rank=Math.floor(finiteNumber(m.rank,1,1,Number.MAX_SAFE_INTEGER));
   // Schema 45 expands innate aptitude from ★1–5 to ★1–10. Existing
   // characters retain their relative position by mapping each old star to two.
   const migratedStars=from<45?Number(m.stars??1)*2:Number(m.stars??1);
   m.stars=Math.floor(finiteNumber(migratedStars,1,1,MONSTER_STAR_MAX));
   m.plus=Math.floor(finiteNumber(m.plus,0,0,Number.MAX_SAFE_INTEGER));
   m.ivs=m.ivs&&typeof m.ivs==="object"&&!Array.isArray(m.ivs)?m.ivs:{};
   for(const key of["hp","atk","def","spd"])m.ivs[key]=Math.floor(finiteNumber(m.ivs[key],75,0,100));
   if(LR_SERIAL_CHARACTER_IDS.has(m.speciesId)){
    m.summonTier="LR";m.summonRarity="LR";
    for(const key of["hp","atk","def","spd"])m.ivs[key]=Math.min(94,m.ivs[key]);
    if(m.speciesId==="myth_rion")m.attribute="nature";
   }
   if(m.floorBossCatalogId){
    const floorBoss=floorBossDefinitionById(m.floorBossCatalogId);
    if(floorBoss){m.visualSpeciesId=floorBoss.visualSpeciesId??floorBoss.speciesId;m.floorBossStatProfile={...floorBoss.stats};m.summonTier="神話";m.summonRarity="神話"}
   }
   m.traitId??="steady";
   m.personalityId??="bold";
   m.colorId??="green";
   const mpMax=maxMp(m);
   m.currentMp=finiteNumber(m.currentMp,mpMax,0,mpMax);
   m.currentHp=m.currentHp==null?null:finiteNumber(m.currentHp,null,0,Number.MAX_SAFE_INTEGER);
   m.ailments=normalizePersistentAilments([m.ailments,m.statuses,m.status]);
   m.statuses=[];m.status=null;
   if(typeof m.skillLoadoutInitialized!=="boolean")m.skillLoadoutInitialized=Boolean(Array.isArray(m.equippedSkills)&&m.equippedSkills.length);
   m.equippedSkills=Array.isArray(m.equippedSkills)&&m.equippedSkills.length
    ?Array.from({length:4},(_,index)=>m.equippedSkills[index]??null)
    :[];
   normalizeContractedEndgameMonster(m);
   normalizeSkillProgress(m);
   const oldGear=m.equipment??{};
   m.equipment={weaponRight:oldGear.weaponRight??oldGear.weapon??null,weaponLeft:oldGear.weaponLeft??null,armorBody:oldGear.armorBody??oldGear.armor??null,armorSupport:oldGear.armorSupport??null,accessoryNeck:oldGear.accessoryNeck??oldGear.accessory??null,accessoryFinger:oldGear.accessoryFinger??null};
   m.attribute=m.attribute==null?null:canonicalAttribute(m.attribute,m.speciesId??m.id);m.resistances=normalizedResistances(m.resistances);m.tags??=[];m.isBoss??=false;m.sealedPower??=null;
   m.stars=Math.max(1,Math.min(MONSTER_STAR_MAX,Number(m.stars??1)));
   m.plus=Math.max(0,Number(m.plus??0));
   m.affection=Math.max(0,Math.min(1000,Number(m.affection??m.bond??0)));
   m.bond=m.affection;
   m.obtainedAt??=m.capturedAt??new Date(0).toISOString();
   m.obtainedFloor??=1;m.obtainedMethod??="capture";
   m.history={adventures:0,battles:Number(m.battles??0),victories:0,defeats:Number(m.defeats??0),bossDefeats:0,kills:0,mvp:0,maxDamage:0,lastDeployedAt:null,consecutiveDeployments:0,longestConsecutiveDeployments:0,highestFloor:Number(m.obtainedFloor??1),...(m.history??{})};
  });
  if(s.activeBattle&&typeof s.activeBattle==="object"){
   const active=s.activeBattle,ailmentMap=active.allyAilments&&typeof active.allyAilments==="object"&&!Array.isArray(active.allyAilments)?active.allyAilments:{},effectMap=active.allyEffects&&typeof active.allyEffects==="object"&&!Array.isArray(active.allyEffects)?active.allyEffects:{};
   active.allyAilments={};active.allyEffects={...effectMap};
   for(const monster of s.monsters.filter(entry=>s.party.includes(entry.id))){
    const effects=Array.isArray(effectMap[monster.id])?effectMap[monster.id]:[],legacyPersistent=effects.filter(effect=>isPersistentStatus(effect?.id??effect?.kind));
    active.allyAilments[monster.id]=normalizePersistentAilments([monster.ailments,ailmentMap[monster.id],legacyPersistent]);
    active.allyEffects[monster.id]=effects.filter(effect=>!isPersistentStatus(effect?.id??effect?.kind));
   }
  }
  const equippedSubslotByItemId=new Map();
  for(const monster of s.monsters)for(const[subslot,itemId]of Object.entries(monster.equipment??{}))if(itemId&&!equippedSubslotByItemId.has(itemId))equippedSubslotByItemId.set(itemId,subslot);
  for(const list of[s.equipment,s.reserveEquipment,s.bossEquipmentVault])list.forEach(i=>{
   i.favorite??=false;
   i.locked??=false;
   i.equippedBy??=null;
   i.plus=Math.floor(finiteNumber(i.plus,0,0,Number.MAX_SAFE_INTEGER));
   const savedLevel=Number(i.level??1);
   i.level=Number.isFinite(savedLevel)?Math.max(1,Math.floor(savedLevel)):1;
   i.exp=finiteNumber(i.exp,0,0,Number.MAX_SAFE_INTEGER);
   i.limitBreak=Math.floor(finiteNumber(i.limitBreak,0,0,Number.MAX_SAFE_INTEGER));
   i.stats=i.stats&&typeof i.stats==="object"&&!Array.isArray(i.stats)?i.stats:{};
   for(const[key,value]of Object.entries(i.stats)){
    const normalized=finiteNumber(value,0,-Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER);
    if(normalized===0)delete i.stats[key];else i.stats[key]=normalized;
   }
   if(Array.isArray(i.affixes))i.affixes=i.affixes.filter(affix=>affix&&typeof affix==="object"&&affix.id).map(affix=>({
    ...affix,
    id:String(affix.id),
    value:finiteNumber(affix.value,0,-Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER),
    quality:typeof affix.quality==="string"?affix.quality:"normal",
    locked:Boolean(affix.locked)
   }));else delete i.affixes;
   i.createdAt??=new Date(0).toISOString();
   i.series??=null;
   // build210: handedness restrictions were retired. Keep the property only
   // as a backwards-compatible save field and migrate every weapon to either.
   i.handedness=i.slot==="weapon"?"either":null;
   if(i.slot==="weapon"&&!i.weaponType&&/(杖|ワンド|ロッド|staff|wand|rod)/i.test(String(i.name??"")))i.weaponType="staff";
   if(i.slot==="weapon"&&!i.weaponType&&/(弓|ボウ|bow)/i.test(String(i.name??"")))i.weaponType="bow";
   i.ruleOverrides??={};
   normalizeEquipmentIdentity(i,{equippedSubslot:equippedSubslotByItemId.get(i.id)??null});
   const signatureOwner=String(i.ruleOverrides?.signatureOwnerId??i.ruleOverrides?.mythicOwner??i.signatureOwnerId??"");
   if(signatureOwner){
    i.ruleOverrides.signatureOwnerId=signatureOwner;
    i.ruleOverrides.signature=true;
    const endgameOwner=ENDGAME_BOSSES[signatureOwner],ownerName=({myth_enami:"えなみ",myth_rion:"りおん",myth_yori:"より",myth_hide:"ひで"})[signatureOwner]??endgameOwner?.name??SPECIES[signatureOwner]?.name??i.ruleOverrides.signatureOwnerName??"専用装備";
    i.series=endgameOwner?.seriesId??`signature-${signatureOwner}`;
    i.seriesName=endgameOwner?.seriesName??`${ownerName}専用`;
   }
   normalizeWeaponMastery(i);
   normalizeEquipmentAffixLocks(i);
  });
  normalizeEquipmentCraftingState(s);
  // Old versions occasionally left equipped items outside the main equipment list.
  const mainIds=new Set(s.equipment.map(i=>i.id));
  s.monsters.forEach(m=>Object.values(m.equipment).forEach(id=>{
   if(!id)return;
   const stored=[...s.reserveEquipment,...s.bossEquipmentVault].find(i=>i.id===id);
   if(stored&&!mainIds.has(id)){
    s.reserveEquipment=s.reserveEquipment.filter(i=>i.id!==id);
    s.bossEquipmentVault=s.bossEquipmentVault.filter(i=>i.id!==id);
    s.equipment.push(stored);
    mainIds.add(id);
   }
  }));
  reconcilePartyAndEquipment(s);
  normalizeMagicCircleState(s);
  s.schemaVersion=SAVE_SCHEMA_VERSION;
  s.appVersion=APP_VERSION;
  if(from<SAVE_SCHEMA_VERSION)s.lastMigration={from,to:SAVE_SCHEMA_VERSION,at:new Date().toISOString()};
  return s
 }
 save(){
  this.state.appVersion=APP_VERSION;
  this.state.flags??={};
  this.state.flags.abyssKeyExchangePreviewUnlocked=(this.state.inventory?.abyssKeys??0)>=250;
  let serialized;
  try{
   serialized=JSON.stringify(this.state);
   localStorage.setItem(SAVE_KEY,serialized);
   const bytes=typeof TextEncoder!=="undefined"?new TextEncoder().encode(serialized).length:serialized.length*2;
   this.lastSaveSizeBytes=bytes;
   this.lastSaveError=null;
   this.lastSavedAt=Date.now();
   if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent("abyss-save-success",{detail:{bytes,at:this.lastSavedAt}}));
   return true
  }catch(error){
   console.error("Save failed",error);
   const quota=error?.name==="QuotaExceededError"||error?.name==="NS_ERROR_DOM_QUOTA_REACHED"||error?.code===22||error?.code===1014;
   this.lastSaveError={name:error?.name??"SaveError",message:String(error?.message??error),quota,bytes:serialized?.length??0,at:Date.now()};
   if(typeof window!=="undefined"){
    window.dispatchEvent(new CustomEvent("abyss-save-error",{detail:{...this.lastSaveError}}));
   }
   return false
  }
 }
 reset(){
  try{localStorage.removeItem(SAVE_KEY)}catch(error){console.error("Save reset failed",error)}
  this.state=initialState();
  return this.save()
 }
}
