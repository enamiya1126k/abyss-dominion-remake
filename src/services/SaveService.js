import{SAVE_KEY,APP_VERSION,SAVE_SCHEMA_VERSION,MAX_PARTY_SIZE,TRUE_MAX_LEVEL,ENDGAME_MAX_LEVEL,MONSTER_STAR_MAX,normalizeBattleSpeed}from"../core/config.js?v=3.1.15-build334";
// Regression marker only: config.js?v=3.1.10-build329
// Regression history: CampaignHeroEncounterSystem.js?v=3.1.4-build323 / CampaignReincarnationSystem.js?v=3.1.4-build323
import{createMonster,totalExperience,applyTotalExperience,expNeedFor}from"../models/Monster.js?v=3.1.1-build311";
import{maxMp,normalizeSkillProgress,allLearnedSkills,recommendedSkills,recommendedSkillLoadout,skillMasteryNeedForLevel}from"../battle/SkillSystem.js?v=3.1.1-build311";
import{normalizeEndgameState,ENDGAME_BOSSES}from"../core/EndgameSystem.js?v=3.1.1-build311";
import{normalizeFloorBossChallengeState}from"../core/FloorBossChallengeSystem.js?v=3.1.1-build311";
import{FLOOR_BOSS_CATALOG,floorBossDefinitionById,milestoneBossIdsForFloor}from"../data/floorBosses.js?v=3.1.1-build311";
import{normalizeSecondWorldEvents}from"../core/SecondWorldEventSystem.js?v=3.1.1-build311";
import{normalizeEliteRecords}from"../core/SecondWorldEliteSystem.js?v=3.1.1-build311";
import{normalizeTenGodContact}from"../core/TenGodContactSystem.js?v=3.1.1-build311";
import{SPECIES}from"../data/species.js?v=3.1.1-build314";
import{JUVENILE_AMALGA_SKILLS}from"../data/raidSpecies.js?v=3.1.1-build311";
import{isPersistentStatus,normalizePersistentAilments}from"../data/statusEffects.js?v=3.1.1-build311";
import{normalizeWeaponMastery}from"./WeaponMastery.js?v=3.1.1-build311";
import{normalizeOnlineProgressIsolation,recoverInterruptedGuestProgress}from"../online/OnlineProgressIsolation.js?v=3.1.1-build311";

import{normalizeReturnRewards}from"../core/ReturnRewardSystem.js?v=3.1.1-build311";
import{createAbyssSkillTreeState,normalizeAbyssSkillTree}from"../core/AbyssSkillTreeSystem.js?v=3.1.15-build334";
import{normalizeEquipmentLoadouts}from"./EquipmentLoadoutSystem.js?v=3.1.1-build311";
import{normalizeEquipmentAffixLocks,normalizeEquipmentCraftingState}from"./EquipmentAffixCrafting.js?v=3.1.1-build311";
import{normalizeSecretRoomState}from"../core/SecretRoomSystem.js?v=3.1.1-build311";
import{normalizeCombatPowerRecord}from"../core/CombatPower.js?v=3.1.1-build311";
import{clearSerialRedemptionLedgerForFullReset,normalizeSerialCodeState,restoreSerialRedemptionLedgerAfterFailedReset}from"../core/SerialCodeSystem.js?v=3.1.1-build311";
import{normalizeNoticeState}from"../core/NoticeSystem.js?v=3.1.1-build317";
import{syncCollectionRewardInbox}from"../core/CollectionRewardSystem.js?v=3.1.1-build311";
import{normalizeAchievementState,syncAchievementRewardInbox}from"../core/AchievementRewardSystem.js?v=3.1.1-build311";
import{normalizeGachaDrawHistory,normalizeGachaPityState}from"../core/GachaBalanceSystem.js?v=3.1.1-build311";
import{CAMPAIGN_MAX_FLOOR,legacyFloorToCampaignFloor,floorBossCampaignDisplayFloor,normalizeCampaignState,campaignFloorState}from"../core/Campaign100System.js?v=3.1.1-build311";
import{normalizeCampaignHeroInvasion,retireLegacyCampaignRewind}from"../core/CampaignHeroEncounterSystem.js?v=3.1.5-build324";
import{normalizeCampaignReincarnationState}from"../core/CampaignReincarnationSystem.js?v=3.1.5-build324";
import{normalizeMagicCircleState}from"../core/MagicCircleSystem.js?v=3.1.2-build321";
import{canonicalAttribute,normalizedResistances}from"../data/attributes.js?v=3.1.1-build311";
import{normalizeEquipmentIdentity}from"../data/equipment.js?v=3.1.1-build311";
import{createContextualGuideState,normalizeContextualGuide}from"../core/ContextualGuideSystem.js?v=3.1.1-build311";
import{normalizeEncounterHistory}from"../core/EncounterPoolSystem.js?v=3.1.1-build311";
import{applyLionelAvatarIdentity,normalizeLionelAvatarState}from"../core/CampaignProtagonistSystem.js?v=3.1.3-build322";
const MYTHIC_HERO_CHARACTER_IDS=new Set(["myth_enami","myth_yori","myth_rion","myth_hide"]);
const RAID_JUVENILE_SPECIES_ID="juvenile_amalga";
const RAID_JUVENILE_BOSS_ID="abyss-amalga";
const RAID_JUVENILE_VISUAL_BASE="./assets/online/raid/juvenile-amalga";
const SKILL_RECOMMENDATION_PROFILE_VERSION=199;
// build301 section dungeons can span six 27-tile slots plus their outer margin.
// Build303's six expanded sections can form a 258-tile line. Keep the bound
// finite without truncating a legitimate campaign layout.
const EXPEDITION_MAP_MAX_DIMENSION=272;
const LEGACY_RAID_JUVENILE_SKILL_IDS=Object.freeze([
 "ancient_dragon__identity_1","ancient_dragon__identity_2","ancient_dragon__identity_3","ancient_dragon__identity_4"
]);
function finiteNumber(value,fallback=0,min=-Infinity,max=Infinity){
 const number=Number(value);
 return Number.isFinite(number)?Math.max(min,Math.min(max,number)):fallback;
}
function plainRecord(value){return Boolean(value&&typeof value==="object"&&!Array.isArray(value))}
function normalizeDungeonShapeHistory(value){
 const byFloor=new Map();for(const raw of Array.isArray(value)?value.slice(-8):[]){if(!plainRecord(raw))continue;const floor=Math.floor(finiteNumber(raw.floor,0,1,CAMPAIGN_MAX_FLOOR)),signatures=(Array.isArray(raw.signatures)?raw.signatures:[]).map(entry=>String(entry??"").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,96)).filter(entry=>entry.split("|").length===5).slice(-6);if(floor&&signatures.length){byFloor.delete(floor);byFloor.set(floor,{floor,signatures})}}
 return[...byFloor.values()].slice(-4)
}
function normalizeUiPosition(value){
 if(!plainRecord(value)||!Number.isFinite(Number(value.x))||!Number.isFinite(Number(value.y)))return null;
 return{x:finiteNumber(value.x,0,-10000,10000),y:finiteNumber(value.y,0,-10000,10000)}
}
function legacyFloorNumber(value){const number=Number(value);return Number.isFinite(number)&&number>=1?Math.floor(number):null}
function inferredSaveSchema(state,rawSchema){
 const parsed=Number(rawSchema);if(Number.isInteger(parsed)&&parsed>=1&&parsed<=SAVE_SCHEMA_VERSION)return parsed;
 const player=plainRecord(state?.player)?state.player:{},legacyHighFloor=[player.maxFloor,player.currentFloor,player.checkpoint].some(value=>(legacyFloorNumber(value)??0)>CAMPAIGN_MAX_FLOOR),legacyHighLedger=[player.bossKills,player.bossRewards].some(ledger=>plainRecord(ledger)&&Object.keys(ledger).some(key=>(legacyFloorNumber(key)??0)>CAMPAIGN_MAX_FLOOR));
 if(legacyHighFloor)return 1;
 const app=String(state?.appVersion??"").trim(),modernApp=app.match(/^3\.0\.(\d+)(?:\D|$)/);if(modernApp)return Math.max(70,Math.min(SAVE_SCHEMA_VERSION,70+Math.floor(Number(modernApp[1])||0)));
 const campaign=plainRecord(state?.campaign100)?state.campaign100:null,campaignVersion=Number(campaign?.version),modernCampaign=Boolean(campaign&&(Number.isFinite(campaignVersion)&&campaignVersion>=2||plainRecord(campaign.floors)||Array.isArray(campaign.endings)));
 if(modernCampaign)return Math.max(70,SAVE_SCHEMA_VERSION-1);
 if(/^2\./.test(app)||legacyHighLedger)return 1;
 // With no trustworthy metadata, preserving the current 100-floor coordinate
 // is safer than silently dividing an otherwise valid save by ten.
 return Math.max(70,SAVE_SCHEMA_VERSION-1)
}
function legacyRewardRank(value){const text=String(value??"");if(text==="CAMPAIGN_TROPHY_COMPLETE"||text==="CAMPAIGN_TROPHY_3")return 4;const partial=text.match(/^CAMPAIGN_TROPHY_([12])$/);if(partial)return Number(partial[1])+1;return value?1:0}
function remapLegacyFloorLedger(value,{numeric=false}={}){
 const result={};for(const[rawFloor,entry]of Object.entries(plainRecord(value)?value:{})){const legacyFloor=legacyFloorNumber(rawFloor);if(legacyFloor==null)continue;const floor=String(legacyFloorToCampaignFloor(legacyFloor));if(numeric){const count=Math.floor(finiteNumber(entry,0,0,Number.MAX_SAFE_INTEGER));result[floor]=Math.max(Number(result[floor])||0,count)}else if(legacyRewardRank(entry)>legacyRewardRank(result[floor]))result[floor]=entry}
 return result
}
function normalizeCampaignFloorLedger(value,{numeric=false}={}){
 const result={};for(const[rawFloor,entry]of Object.entries(plainRecord(value)?value:{})){const floor=Number(rawFloor);if(!Number.isInteger(floor)||floor<1||floor>CAMPAIGN_MAX_FLOOR)continue;const key=String(floor);if(numeric){const count=Math.floor(finiteNumber(entry,0,0,Number.MAX_SAFE_INTEGER));result[key]=Math.max(Number(result[key])||0,count)}else if(legacyRewardRank(entry)>legacyRewardRank(result[key]))result[key]=entry}
 return result
}
function normalizeCoopContributionHistory(value){
 const byResultId=new Map(),source=Array.isArray(value)?value.slice(-256):[];
 const count=(entry,max=Number.MAX_SAFE_INTEGER)=>Math.floor(finiteNumber(entry,0,0,max));
 for(const raw of source){
  if(!raw||typeof raw!=="object"||Array.isArray(raw))continue;
  const resultId=String(raw.resultId??"").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,160);if(!resultId)continue;
  const startFloor=count(raw.startFloor,10000)||1,endFloor=Math.max(startFloor,count(raw.endFloor,10000)||startFloor);
  const entry={resultId,runId:String(raw.runId??"").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,120),ownerId:String(raw.ownerId??"").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,24),startFloor,endFloor,floorsCleared:count(raw.floorsCleared,10000),completed:Boolean(raw.completed),reason:String(raw.reason??"return").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,40)||"return",finishedAt:count(raw.finishedAt),rank:Math.max(1,Math.min(32,count(raw.rank,32)||1)),name:String(raw.name??"冒険者").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,24)||"冒険者",exploration:count(raw.exploration),combat:count(raw.combat),rescue:count(raw.rescue,9999),chests:count(raw.chests,9999),switches:count(raw.switches,9999),gimmicks:count(raw.gimmicks,9999),pings:count(raw.pings,9999),support:count(raw.support),score:count(raw.score),mvpTitles:[...new Set((Array.isArray(raw.mvpTitles)?raw.mvpTitles:[]).map(title=>String(title??"").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,32)).filter(Boolean))].slice(0,8)};
  byResultId.delete(resultId);byResultId.set(resultId,entry);
 }
 return[...byResultId.values()].slice(-128);
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
 // A partially corrupted snapshot is regenerated from the durable floor
 // ledger. Keeping scalar values in collection fields would crash the map or
 // leave the player in a section with no traversable connection.
 for(const key of["sections","rooms","sectionGraph","sectionPortals","campaignKeys","discoveredSections","discoveredCells","bosses","trophyChests","allCells"]){
  if(sourceWorld[key]!=null&&!Array.isArray(sourceWorld[key]))return null;
 }
 const world={...sourceWorld};
 const sourceTiles=sourceWorld.tiles.slice(0,EXPEDITION_MAP_MAX_DIMENSION),rows=Math.max(1,sourceTiles.length),cols=Math.max(1,Math.min(EXPEDITION_MAP_MAX_DIMENSION,sourceTiles.reduce((max,row)=>Math.max(max,Array.isArray(row)?row.length:0),0)));
 world.tiles=Array.from({length:rows},(_,rowIndex)=>{const row=Array.isArray(sourceTiles[rowIndex])?sourceTiles[rowIndex].slice(0,cols):[];while(row.length<cols)row.push(1);return row});
 // Tile dimensions are authoritative. This also repairs snapshots written with
 // the former 100-tile cols/rows clamp while their complete tiles survived.
 world.cols=cols;
 world.rows=rows;
 const normalizeWorldPoint=(point,fallback={x:0,y:0})=>({...point,x:finiteNumber(point?.x,fallback.x,0,world.cols-1),y:finiteNumber(point?.y,fallback.y,0,world.rows-1)});
 world.start=normalizeWorldPoint(world.start);
 world.exit=normalizeWorldPoint(world.exit,world.start);
 world.encountering=false;
 world.steps=Math.floor(finiteNumber(world.steps,0,0,Number.MAX_SAFE_INTEGER));
 world.nextEncounter=Math.floor(finiteNumber(world.nextEncounter,8,0,Number.MAX_SAFE_INTEGER));
 world.heroStepsSinceBattle=Math.floor(finiteNumber(world.heroStepsSinceBattle,0,0,Number.MAX_SAFE_INTEGER));
 const pursuit=plainRecord(world.campaignHeroPursuit)?world.campaignHeroPursuit:null,heroByEncounter=new Map([["hero-ambush-yori-1","myth_yori"],["hero-ambush-hide-1","myth_hide"],["hero-ambush-enami-1","myth_enami"],["hero-ambush-rion-1","myth_rion"],["hero-ambush-yori-2","myth_yori"],["hero-ambush-hide-2","myth_hide"],["hero-ambush-enami-2","myth_enami"],["hero-ambush-rion-2","myth_rion"]]),encounterId=typeof pursuit?.encounterId==="string"?String(pursuit.encounterId).slice(0,120):"",heroId=String(pursuit?.heroId??""),expectedHero=heroByEncounter.get(encounterId),sectionIds=new Set((Array.isArray(world.sections)?world.sections:[]).map(section=>String(section?.id??"")).filter(Boolean)),sectionId=typeof pursuit?.sectionId==="string"&&sectionIds.has(String(pursuit.sectionId))?String(pursuit.sectionId).slice(0,100):null;world.campaignHeroPursuit=pursuit&&expectedHero===heroId?{...pursuit,encounterId,heroId,state:["appearing","observing","pursuing","contact","withdrawing"].includes(pursuit.state)?pursuit.state:"pursuing",x:finiteNumber(pursuit.x,world.start.x,0,world.cols-1),y:finiteNumber(pursuit.y,world.start.y,0,world.rows-1),rx:finiteNumber(pursuit.rx,pursuit.x,0,world.cols-1),ry:finiteNumber(pursuit.ry,pursuit.y,0,world.rows-1),sectionId,observeSteps:Math.floor(finiteNumber(pursuit.observeSteps,0,0,20)),chaseSteps:Math.floor(finiteNumber(pursuit.chaseSteps,0,0,999)),portalTransfers:Math.floor(finiteNumber(pursuit.portalTransfers,0,0,20)),portalGraceSteps:Math.floor(finiteNumber(pursuit.portalGraceSteps,0,0,20))}:null;
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
 const partyTrail=(Array.isArray(value.partyTrail)?value.partyTrail:[]).slice(0,512).map(point=>({x:finiteNumber(point?.x,x,0,world.cols-1),y:finiteNumber(point?.y,y,0,world.rows-1)}));
 return{floor:Math.floor(finiteNumber(value.floor,1,1,10000)),world,player,partyTrail,cameraData,savedAt:typeof value.savedAt==="string"?value.savedAt:new Date(0).toISOString()};
}
/**
 * Build 307 briefly stored the 80F/90F/100F Ten Gods as one combined active
 * battle. Build 308 makes every god an independent field boss, so such a
 * checkpoint has no single boss id that can safely be committed to the new
 * defeat ledger. Drop only the obsolete battle checkpoint and retain the
 * exploration snapshot so main can regenerate the Build 308 field in place.
 */
export function recoverLegacyCombinedMilestoneBattle(state){
 if(!plainRecord(state)||!plainRecord(state.activeBattle)||state.activeBattle.specialBattle||state.activeBattle.memoryBattle)return{recovered:false};
 const active=state.activeBattle,floor=Math.floor(finiteNumber(active.floor??active.explorationSnapshot?.floor??state.expeditionSnapshot?.floor??state.player?.currentFloor,1,1,CAMPAIGN_MAX_FLOOR)),milestoneIds=milestoneBossIdsForFloor(floor);if(milestoneIds.length<2)return{recovered:false};
 const expected=new Set(milestoneIds),enemyIds=[...new Set((Array.isArray(active.enemies)?active.enemies:[]).filter(enemy=>plainRecord(enemy)&&enemy.boss===true).map(enemy=>String(enemy.campaignBossId??enemy.endgameBossId??enemy.visualSpeciesId??enemy.bossId??"")).filter(id=>expected.has(id)))];if(enemyIds.length<2)return{recovered:false};
 const snapshot=normalizeExpeditionSnapshot(active.explorationSnapshot??state.expeditionSnapshot);delete state.activeBattle;state.player=plainRecord(state.player)?state.player:{};state.player.inRun=true;if(snapshot)state.expeditionSnapshot=snapshot;
 return{recovered:true,floor,bossIds:enemyIds,snapshotRetained:Boolean(snapshot)}
}
function recoverMalformedActiveBattle(state){
 const active=plainRecord(state?.activeBattle)?state.activeBattle:null;
 if(!active)return{recovered:false};
 const enemies=active.enemies;
 if(Array.isArray(enemies)&&enemies.length&&enemies.every(enemy=>plainRecord(enemy)&&typeof enemy.speciesId==="string"&&Boolean(SPECIES[enemy.speciesId])))return{recovered:false};
 const snapshot=normalizeExpeditionSnapshot(active.explorationSnapshot??state.expeditionSnapshot);
 delete state.activeBattle;
 state.player=plainRecord(state.player)?state.player:{};
 if(snapshot){state.expeditionSnapshot=snapshot;state.player.inRun=true}
 else{state.expeditionSnapshot=null;state.player.inRun=false}
 state.lastBattleRecovery={version:1,reason:"malformed-active-battle",snapshotRetained:Boolean(snapshot),at:new Date().toISOString()};
 return{recovered:true,snapshotRetained:Boolean(snapshot)}
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
 const strongest=recommendedSkills(monster,4);monster.equippedSkills=strongest.map(skill=>skill.id);monster.skillProgress=monster.skillProgress&&typeof monster.skillProgress==="object"&&!Array.isArray(monster.skillProgress)?monster.skillProgress:{};
 for(const skill of strongest){const current=monster.skillProgress[skill.id]??{};const level=Math.max(Number(current.level)||1,divine?5:3);monster.skillProgress[skill.id]={...current,level,exp:Math.max(0,Number(current.exp)||0),uses:Math.max(0,Number(current.uses)||0),need:skillMasteryNeedForLevel(level)}}
 monster.skillLoadoutInitialized=true;monster.contractProfileVersion=2;
 monster.skillRecommendationProfileVersion=SKILL_RECOMMENDATION_PROFILE_VERSION;
}
function paddedSkillLoadout(value){return Array.from({length:4},(_,index)=>Array.isArray(value)?value[index]??null:null)}
function sameSkillLoadout(a,b){return paddedSkillLoadout(a).every((id,index)=>id===paddedSkillLoadout(b)[index])}
function normalizeSkillRecommendationProfile(monster){
 if(Number(monster?.skillRecommendationProfileVersion)>=SKILL_RECOMMENDATION_PROFILE_VERSION)return;
 const learned=allLearnedSkills(monster),current=paddedSkillLoadout(monster?.equippedSkills),oldFirst=paddedSkillLoadout(learned.slice(0,4).map(skill=>skill.id)),oldLast=paddedSkillLoadout(learned.slice(-4).map(skill=>skill.id));
 const systemDerived=Boolean(monster?.isContractedEndgame||monster?.endgameBossId||monster?.marketSkillGrade||monster?.serialCodeId||monster?.obtainedMethod==="serialCode");
 if(monster?.speciesId!==RAID_JUVENILE_SPECIES_ID&&(sameSkillLoadout(current,oldFirst)||(systemDerived&&sameSkillLoadout(current,oldLast))))monster.equippedSkills=recommendedSkillLoadout(monster);
 monster.skillRecommendationProfileVersion=SKILL_RECOMMENDATION_PROFILE_VERSION;
}
function isLegacyRaidJuvenile(monster){
 return Boolean(monster
  &&monster.speciesId==="ancient_dragon"
  &&monster.weeklyRaidBossId===RAID_JUVENILE_BOSS_ID
  &&monster.raidLimited===true
  &&monster.obtainedMethod==="onlineWeeklyRaidExchange"
  &&monster.customVisualBase===RAID_JUVENILE_VISUAL_BASE);
}
function masterySnapshot(value){
 const source=value&&typeof value==="object"&&!Array.isArray(value)?value:{};
 const level=Math.floor(finiteNumber(source.level,1,1,10));
 return{...source,level,exp:finiteNumber(source.exp,0,0,Number.MAX_SAFE_INTEGER),uses:Math.floor(finiteNumber(source.uses,0,0,Number.MAX_SAFE_INTEGER)),need:skillMasteryNeedForLevel(level)};
}
function strongestMastery(existing,incoming){
 const current=masterySnapshot(existing),legacy=masterySnapshot(incoming);
 const legacyAhead=legacy.level>current.level||(legacy.level===current.level&&legacy.exp>current.exp),chosen=legacyAhead?legacy:current,level=Math.max(current.level,legacy.level);
 return{...chosen,level,uses:Math.max(current.uses,legacy.uses),need:skillMasteryNeedForLevel(level)};
}
export function normalizeRaidJuvenileContract(monster){
 const legacy=isLegacyRaidJuvenile(monster);
 if(!legacy&&monster?.speciesId!==RAID_JUVENILE_SPECIES_ID)return false;
 const oldSpeciesId=monster.speciesId,oldSlots=Array.from({length:4},(_,index)=>monster.equippedSkills?.[index]??null),progress=monster.skillProgress&&typeof monster.skillProgress==="object"&&!Array.isArray(monster.skillProgress)?monster.skillProgress:{};
 if(legacy){
  const oldLearned=allLearnedSkills(monster);
  oldSlots.forEach((skillId,index)=>{if(!skillId)oldSlots[index]=oldLearned[index]?.id??LEGACY_RAID_JUVENILE_SKILL_IDS[index]});
  monster.speciesId=RAID_JUVENILE_SPECIES_ID;
  // The species rarity changes LR -> 神話. Rebase the cumulative EXP after the
  // identity swap so a second load never changes the visible level or progress.
  monster.totalExp=totalExperience({...monster,totalExp:undefined});
 }
 const newIds=JUVENILE_AMALGA_SKILLS.map(skill=>skill.id),valid=new Set(newIds),hasForeignSkill=oldSlots.some(skillId=>skillId&&!valid.has(skillId)),hasDedicatedSkill=oldSlots.some(skillId=>valid.has(skillId)),needsKitMigration=legacy||Number(monster.raidContractProfileVersion??0)<1||hasForeignSkill||!hasDedicatedSkill;
 if(needsKitMigration){
  newIds.forEach((skillId,index)=>{const oldId=oldSlots[index]??(oldSpeciesId==="ancient_dragon"?LEGACY_RAID_JUVENILE_SKILL_IDS[index]:null);progress[skillId]=strongestMastery(progress[skillId],oldId?progress[oldId]:null)});
  monster.skillProgress=progress;
  const learned=new Set(allLearnedSkills(monster).map(skill=>skill.id));
  monster.equippedSkills=newIds.map(skillId=>learned.has(skillId)?skillId:null);
  monster.skillLoadoutInitialized=true;
 }
 monster.summonTier="神話";
 monster.summonRarity="神話";
 monster.attribute="dark";
 monster.raidLimited=true;
 monster.weeklyRaidBossId=RAID_JUVENILE_BOSS_ID;
 monster.customVisualBase=RAID_JUVENILE_VISUAL_BASE;
 monster.tags=Array.from(new Set([...(Array.isArray(monster.tags)?monster.tags:[]),"raid","weekly",RAID_JUVENILE_BOSS_ID,"raidJuvenile"]));
 monster.raidContractProfileVersion=1;
 return true;
}
function normalizeOnlineCampaignBossIds(value){return[...new Set((Array.isArray(value)?value:[]).filter(entry=>typeof entry==="string").map(entry=>entry.replace(/[\u0000-\u001f\u007f]/g,"").slice(0,100)).filter(Boolean))].slice(0,16)}
function normalizeOnlineCampaignBossPackReceipts(value){const result={};if(!plainRecord(value))return result;for(const[rawBossId,rawCount]of Object.entries(value).slice(0,16)){const bossId=normalizeOnlineCampaignBossIds([rawBossId])[0],count=Math.floor(finiteNumber(rawCount,0,0,3));if(bossId&&count>0)result[bossId]=count}return result}
function mergeOnlineCampaignBossPackReceipts(...sources){const result={};for(const source of sources)for(const[bossId,count]of Object.entries(normalizeOnlineCampaignBossPackReceipts(source)))result[bossId]=Math.max(result[bossId]??0,count);return result}
function normalizeOnlineCampaignFloorState(value={}, {allowLegacyNumeric=false}={}){
 const collectedKeyIds=[...new Set((Array.isArray(value?.collectedKeyIds)?value.collectedKeyIds:[]).filter(entry=>typeof entry==="string").map(entry=>entry.replace(/[\u0000-\u001f\u007f]/g,"").slice(0,80)).filter(Boolean))].slice(0,3),rawLocks=Math.floor(finiteNumber(value?.trophyLocksOpened,0,0,3)),fragmentPacks=Math.max(rawLocks,Math.floor(finiteNumber(value?.trophyFragmentPacksClaimed,0,0,3))),legacyCount=allowLegacyNumeric?Math.floor(finiteNumber(value?.keysCollected,0,0,3)):0,keysCollected=Math.max(collectedKeyIds.length,legacyCount,rawLocks>=3?3:0);
 const owns=key=>Object.prototype.hasOwnProperty.call(value??{},key),trophyLocksOpened=rawLocks>=3?3:0,legacyClaimedBossIds=normalizeOnlineCampaignBossIds(value?.claimedBossIds),includeOpened=owns("openedBossIds")||owns("claimedBossIds"),includeMythic=owns("mythicClaimedBossIds")||owns("claimedBossIds"),includeFragments=owns("fragmentPacksClaimedByBoss"),openedBossIds=normalizeOnlineCampaignBossIds(owns("openedBossIds")?value.openedBossIds:legacyClaimedBossIds),mythicClaimedBossIds=normalizeOnlineCampaignBossIds(owns("mythicClaimedBossIds")?value.mythicClaimedBossIds:legacyClaimedBossIds),fragmentPacksClaimedByBoss=normalizeOnlineCampaignBossPackReceipts(value?.fragmentPacksClaimedByBoss),defeatedBossIds=normalizeOnlineCampaignBossIds([...(Array.isArray(value?.defeatedBossIds)?value.defeatedBossIds:[]),...openedBossIds]),includeDefeated=owns("defeatedBossIds")||includeOpened,result={runId:String(value?.runId??"").slice(0,120)||null,keysCollected,trophyLocksOpened,trophyFragmentPacksClaimed:fragmentPacks,collectedKeyIds,hotSpringUsed:Boolean(value?.hotSpringUsed),trophyMythicClaimed:Boolean(value?.trophyMythicClaimed)||rawLocks>=3,replayActive:Boolean(value?.replayActive),bossDefeatedThisRun:Boolean(value?.bossDefeatedThisRun)||defeatedBossIds.length>0};if(includeDefeated)result.defeatedBossIds=defeatedBossIds;if(includeOpened){result.openedBossIds=openedBossIds;result.claimedBossIds=[...openedBossIds]}if(includeMythic)result.mythicClaimedBossIds=mythicClaimedBossIds;if(includeFragments)result.fragmentPacksClaimedByBoss=fragmentPacksClaimedByBoss;return result
}
function mergeOnlineCampaignFloorState(current,incoming,{allowLegacyNumeric=false}={}){
 if(!current)return incoming;
 const owns=(value,key)=>Object.prototype.hasOwnProperty.call(value,key),includeOpened=owns(current,"openedBossIds")||owns(incoming,"openedBossIds")||owns(current,"claimedBossIds")||owns(incoming,"claimedBossIds"),includeMythic=owns(current,"mythicClaimedBossIds")||owns(incoming,"mythicClaimedBossIds"),includeFragments=owns(current,"fragmentPacksClaimedByBoss")||owns(incoming,"fragmentPacksClaimedByBoss"),includeDefeated=owns(current,"defeatedBossIds")||owns(incoming,"defeatedBossIds")||includeOpened,mythicClaimedBossIds=normalizeOnlineCampaignBossIds([...(current.mythicClaimedBossIds??[]),...(incoming.mythicClaimedBossIds??[])]),runChanged=Boolean(current.runId&&incoming.runId&&current.runId!==incoming.runId&&(current.replayActive||incoming.replayActive));
 if(runChanged){const activeRun=incoming.replayActive||!current.replayActive?incoming:current,next={...activeRun,trophyMythicClaimed:current.trophyMythicClaimed||incoming.trophyMythicClaimed};if(includeMythic)next.mythicClaimedBossIds=mythicClaimedBossIds;if(includeOpened){next.openedBossIds=normalizeOnlineCampaignBossIds(activeRun.openedBossIds??activeRun.claimedBossIds);next.claimedBossIds=[...next.openedBossIds]}if(includeDefeated)next.defeatedBossIds=normalizeOnlineCampaignBossIds([...(activeRun.defeatedBossIds??[]),...(next.openedBossIds??[])]);if(includeFragments)next.fragmentPacksClaimedByBoss=normalizeOnlineCampaignBossPackReceipts(activeRun.fragmentPacksClaimedByBoss);return normalizeOnlineCampaignFloorState(next,{allowLegacyNumeric})}
 const collectedKeyIds=[...new Set([...(current.collectedKeyIds??[]),...(incoming.collectedKeyIds??[])])].slice(0,3),trophyLocksOpened=Math.max(current.trophyLocksOpened,incoming.trophyLocksOpened),trophyFragmentPacksClaimed=Math.max(current.trophyFragmentPacksClaimed,incoming.trophyFragmentPacksClaimed),legacyCount=allowLegacyNumeric?Math.max(current.keysCollected,incoming.keysCollected):0,openedBossIds=normalizeOnlineCampaignBossIds([...(current.openedBossIds??current.claimedBossIds??[]),...(incoming.openedBossIds??incoming.claimedBossIds??[])]),defeatedBossIds=normalizeOnlineCampaignBossIds([...(current.defeatedBossIds??[]),...(incoming.defeatedBossIds??[]),...openedBossIds]),fragmentPacksClaimedByBoss=mergeOnlineCampaignBossPackReceipts(current.fragmentPacksClaimedByBoss,incoming.fragmentPacksClaimedByBoss),result={...current,...incoming,collectedKeyIds,keysCollected:Math.max(collectedKeyIds.length,legacyCount,trophyLocksOpened>=3?3:0),trophyLocksOpened,trophyFragmentPacksClaimed,hotSpringUsed:current.hotSpringUsed||incoming.hotSpringUsed,trophyMythicClaimed:current.trophyMythicClaimed||incoming.trophyMythicClaimed,replayActive:incoming.runId?incoming.replayActive:current.replayActive||incoming.replayActive,bossDefeatedThisRun:current.bossDefeatedThisRun||incoming.bossDefeatedThisRun||defeatedBossIds.length>0};if(includeDefeated)result.defeatedBossIds=defeatedBossIds;if(includeOpened){result.openedBossIds=openedBossIds;result.claimedBossIds=[...openedBossIds]}if(includeMythic)result.mythicClaimedBossIds=mythicClaimedBossIds;if(includeFragments)result.fragmentPacksClaimedByBoss=fragmentPacksClaimedByBoss;return result
}
function normalizeOnlineCampaignFloorStates(value,{allowLegacyNumeric=false}={}){
 const source=plainRecord(value)?value:{},result={};for(const[rawFloor,state]of Object.entries(source)){const floor=Number(rawFloor);if(!Number.isInteger(floor)||floor<1||floor>CAMPAIGN_MAX_FLOOR)continue;const key=String(floor),incoming=normalizeOnlineCampaignFloorState(state,{allowLegacyNumeric});result[key]=mergeOnlineCampaignFloorState(result[key],incoming,{allowLegacyNumeric});if(Object.keys(result).length>=CAMPAIGN_MAX_FLOOR)break}return result
}
function migrateLegacyOnlineCampaignLedgers(state,from){
 if(!Number.isFinite(Number(from))||Number(from)>70)return{migrated:false,defeatedFloors:[],claimedFloors:[]};const online=plainRecord(state.onlineParty)?state.onlineParty:{},host=plainRecord(online.hostWorld)?online.hostWorld:{};
 const remapList=list=>[...new Set((Array.isArray(list)?list:[]).map(legacyFloorNumber).filter(value=>value!=null).map(legacyFloorToCampaignFloor))].slice(0,CAMPAIGN_MAX_FLOOR),opened={};for(const[rawFloor,ids]of Object.entries(plainRecord(host.openedChestIds)?host.openedChestIds:{})){const oldFloor=legacyFloorNumber(rawFloor);if(oldFloor==null)continue;const floor=legacyFloorToCampaignFloor(oldFloor),key=String(floor),prefix=`${oldFloor}-`;opened[key]??=[];for(const rawId of Array.isArray(ids)?ids:[]){if(typeof rawId!=="string")continue;const id=rawId.replace(/[\u0000-\u001f\u007f]/g,"").slice(0,80),mapped=id.startsWith(prefix)?`${floor}-${id.slice(prefix.length)}`:id;if(mapped&&!opened[key].includes(mapped))opened[key].push(mapped)}opened[key]=opened[key].slice(0,200)}
 online.firstCoopBossClears=remapList(online.firstCoopBossClears);host.defeatedBossFloors=remapList(host.defeatedBossFloors);host.claimedBossRewardFloors=remapList(host.claimedBossRewardFloors);host.openedChestIds=opened;host.floorSeeds={};online.hostWorld=host;state.onlineParty=online;return{migrated:true,defeatedFloors:[...new Set([...online.firstCoopBossClears,...host.defeatedBossFloors,...host.claimedBossRewardFloors])],claimedFloors:[...host.claimedBossRewardFloors]}
}
function reconcileLegacyCampaignBossLedgers(state,from,onlineMigration={}){
 if(!(Number(from)<71))return;state.player=plainRecord(state.player)?state.player:{};const sourceKills=plainRecord(state.player.bossKills)?{...state.player.bossKills}:{},sourceRewards=plainRecord(state.player.bossRewards)?{...state.player.bossRewards}:{},rawFloors=plainRecord(state.campaign100?.floors)?state.campaign100.floors:{},offlineTruth=new Set(Object.entries(rawFloors).filter(([,entry])=>entry?.bossDefeated===true).map(([floor])=>Math.floor(Number(floor))).filter(floor=>Number.isInteger(floor)&&floor>=1&&floor<=CAMPAIGN_MAX_FLOOR)),canonicalRewards=new Map();
 for(const[rawFloor,reward]of Object.entries(sourceRewards)){const floor=Math.floor(Number(rawFloor)),partial=String(reward??"").match(/^CAMPAIGN_TROPHY_([123])$/),complete=reward==="CAMPAIGN_TROPHY_COMPLETE";if(floor>=1&&floor<=CAMPAIGN_MAX_FLOOR&&(partial||complete))canonicalRewards.set(floor,complete?3:Number(partial[1]))}
 normalizeCampaignState(state);const defeated=new Set([...(onlineMigration.defeatedFloors??[]).map(Number).filter(floor=>Number.isInteger(floor)&&floor>=1&&floor<=CAMPAIGN_MAX_FLOOR),...offlineTruth,...canonicalRewards.keys()]);if(Number(from)<70){for(const rawFloor of new Set([...Object.keys(sourceKills),...Object.keys(sourceRewards)])){const floor=Math.floor(Number(rawFloor));if(floor>=1&&floor<=CAMPAIGN_MAX_FLOOR&&(Number(sourceKills[rawFloor])>0||sourceRewards[rawFloor]))defeated.add(floor)}}
 for(const floor of defeated){const entry=campaignFloorState(state,floor);entry.bossDiscovered=true;entry.bossDefeated=true;entry.exitUnlocked=true}
 for(const[floor,locks]of canonicalRewards){const entry=campaignFloorState(state,floor),safeLocks=Math.max(0,Math.min(3,Number(locks)||0));entry.bossDiscovered=true;entry.bossDefeated=true;entry.exitUnlocked=true;entry.trophyLocksOpened=Math.max(entry.trophyLocksOpened,safeLocks);entry.trophyFragmentPacksClaimed=Math.max(Number(entry.trophyFragmentPacksClaimed)||0,safeLocks);entry.keysCollected=Math.max(entry.keysCollected,safeLocks);for(let index=1;index<=entry.keysCollected;index++)if(!entry.keyIds.includes(`${floor}-campaign-key-${index}`))entry.keyIds.push(`${floor}-campaign-key-${index}`);if(safeLocks>=3)entry.trophyClaimed=true}
 if(state.campaign100?.floors?.[String(CAMPAIGN_MAX_FLOOR)]?.bossDefeated)state.campaign100.finalUnlocked=true;const nextKills={},nextRewards={};for(let floor=1;floor<=CAMPAIGN_MAX_FLOOR;floor++){const entry=state.campaign100?.floors?.[String(floor)];if(!entry?.bossDefeated)continue;const preserveCount=Number(from)<70||offlineTruth.has(floor);nextKills[String(floor)]=preserveCount?Math.max(1,Math.floor(Number(sourceKills[floor])||0)):1;if(entry.trophyLocksOpened>=3||entry.trophyClaimed)nextRewards[String(floor)]="CAMPAIGN_TROPHY_COMPLETE";else if(Number(entry.trophyFragmentPacksClaimed)>0)nextRewards[String(floor)]=`CAMPAIGN_TROPHY_${Math.min(2,Math.floor(Number(entry.trophyFragmentPacksClaimed)))}`}
 state.player.bossKills=nextKills;state.player.bossRewards=nextRewards;state.player.pendingBossRewards={}
}
export function migrateLegacyCampaignFinalFlow(state,from){
 if(Number(from)>=74||!plainRecord(state))return{migrated:false,recoveredBattle:false};
 const campaign=plainRecord(state.campaign100)?state.campaign100:(state.campaign100={}),monsters=Array.isArray(state.monsters)?state.monsters:[],temporaryIds=new Set([campaign.sairanMonsterId].filter(Boolean)),isTemporary=monster=>temporaryIds.has(monster?.id)||monster?.obtainedMethod==="campaignFinalTemporary"||monster?.campaignFinalTemporary===true,activeFinal=state.activeBattle?.specialBattleType==="campaignFinal",pendingFinal=["party","sairan"].includes(campaign.finalSessionPending)&&(!state.activeBattle||activeFinal),backup=[...new Set((Array.isArray(campaign.finalPartyBackup)?campaign.finalPartyBackup:[]).filter(value=>typeof value==="string"))].slice(0,4),vitals=plainRecord(campaign.finalVitals)?campaign.finalVitals:{},legacyBattleIds=[...(Array.isArray(campaign.activeGeneralIds)?campaign.activeGeneralIds:[]),...(Array.isArray(campaign.reserveGeneralIds)?campaign.reserveGeneralIds:[])].filter(value=>typeof value==="string"),currentParty=(Array.isArray(state.party)?state.party:[]).filter(value=>typeof value==="string"),temporaryPartyActive=!state.activeBattle&&state.player?.inRun!==true&&currentParty.some(id=>isTemporary(monsters.find(monster=>monster?.id===id))),legacyRosterActive=!state.activeBattle&&backup.length>0&&state.player?.inRun!==true&&currentParty.length>0&&currentParty.every(id=>legacyBattleIds.includes(id)),recoverRoster=activeFinal||pendingFinal||temporaryPartyActive||legacyRosterActive;
 state.monsters=monsters.filter(monster=>!isTemporary(monster));const validIds=new Set(state.monsters.map(monster=>monster?.id).filter(Boolean));
 if(recoverRoster){for(const[id,value]of Object.entries(vitals)){const monster=state.monsters.find(entry=>entry?.id===id);if(!monster||!value||typeof value!=="object")continue;monster.currentHp=value.hp;monster.currentMp=value.mp;monster.ailments=normalizePersistentAilments(value.ailments)}const restored=backup.filter(id=>validIds.has(id)),current=currentParty.filter(id=>validIds.has(id));state.party=(restored.length?restored:current).slice(0,4)}
 if(activeFinal){delete state.activeBattle;state.expeditionSnapshot=null;state.player=plainRecord(state.player)?state.player:{};state.player.inRun=false}
 // storyDaysSeen is intentionally kept until Campaign100System folds the old
 // receipt into invasionDaysSeen. The normalizer deletes it afterwards.
 for(const key of["selectedSairanType","generalIds","activeGeneralIds","reserveGeneralIds","sairanMonsterId","finalPartyBackup","finalVitals","finalBattleLevel","finalStage","heroCarry","finalSessionPending"])delete campaign[key];
 campaign.finalFlowMigration={version:1,recoveredBattle:Boolean(activeFinal),recoveredRoster:Boolean(recoverRoster)};
 return{migrated:true,recoveredBattle:Boolean(activeFinal),recoveredRoster:Boolean(recoverRoster),restoredParty:[...(state.party??[])]}
}
export function recoverPendingCampaignFinalFlow(state){
 if(!plainRecord(state))return{recovered:false};
 const campaign=plainRecord(state.campaign100)?state.campaign100:(state.campaign100={}),backup=[...new Set((Array.isArray(campaign.finalPartyBackup)?campaign.finalPartyBackup:[]).filter(value=>typeof value==="string"))].slice(0,4),activeFinal=state.activeBattle?.specialBattleType==="campaignFinal";
 // Never mutate an unrelated live battle. If an impossible legacy Sairan
 // marker coexists with one, it is safer to defer cleanup until that battle
 // has settled than to discard a valid checkpoint.
 if(state.activeBattle&&!activeFinal)return{recovered:false,protectedBattle:true};
 const explicitPending=["party","sairan"].includes(campaign.finalSessionPending)?campaign.finalSessionPending:null,storedStage=["party","sairan"].includes(campaign.finalStage)?campaign.finalStage:null,activeStage=["party","sairan"].includes(state.activeBattle?.campaignStage)?state.activeBattle.campaignStage:null;
 const monsters=Array.isArray(state.monsters)?state.monsters:[],temporaryIds=new Set([campaign?.sairanMonsterId].filter(value=>typeof value==="string"&&value)),isTemporary=monster=>Boolean(monster&&(temporaryIds.has(monster.id)||monster.obtainedMethod==="campaignFinalTemporary"||monster.campaignFinalTemporary===true)),partyIds=(Array.isArray(state.party)?state.party:[]).filter(value=>typeof value==="string"),hasTemporaryMonster=monsters.some(isTemporary),temporaryPartyActive=partyIds.some(id=>isTemporary(monsters.find(monster=>monster?.id===id))),sairanStage=explicitPending==="sairan"||storedStage==="sairan"||activeStage==="sairan",retiredSairan=sairanStage||hasTemporaryMonster||temporaryPartyActive,pendingStage=sairanStage?"sairan":explicitPending??storedStage??(activeFinal?activeStage:retiredSairan?"sairan":null);
 if(!pendingStage)return{recovered:false};
 const validIds=new Set(monsters.map(monster=>monster?.id).filter(Boolean)),hasBattleEnemies=Array.isArray(state.activeBattle?.enemies)&&state.activeBattle.enemies.some(enemy=>plainRecord(enemy)),hasBattleParty=partyIds.some(id=>validIds.has(id)),hasStageParty=backup.length?partyIds.some(id=>backup.includes(id)&&validIds.has(id)):hasBattleParty;
 // Build309 removes Sairan from combat entirely. Even a structurally valid
 // schema-75 Sairan checkpoint must therefore be restored to the original
 // party and returned to the still-undecided finale. Only the one-stage party
 // battle remains resumable.
 if(!retiredSairan&&activeFinal&&activeStage==="party"&&pendingStage==="party"&&hasBattleEnemies&&hasStageParty)return{recovered:false,checkpointReady:true};
 const vitals=plainRecord(campaign?.finalVitals)?campaign.finalVitals:{};
 state.monsters=monsters.filter(monster=>!isTemporary(monster));const restoredValidIds=new Set(state.monsters.map(monster=>monster?.id).filter(Boolean));
 for(const[id,value]of Object.entries(vitals)){const monster=state.monsters.find(entry=>entry?.id===id);if(!monster||!value||typeof value!=="object")continue;monster.currentHp=value.hp;monster.currentMp=value.mp;monster.ailments=normalizePersistentAilments(value.ailments)}
 const restored=backup.filter(id=>restoredValidIds.has(id)),current=partyIds.filter(id=>restoredValidIds.has(id)),fallback=state.monsters.map(monster=>monster?.id).filter(Boolean);state.party=(restored.length?restored:current.length?current:fallback).slice(0,4);
 if(activeFinal)delete state.activeBattle;
 state.expeditionSnapshot=null;state.player=plainRecord(state.player)?state.player:{};state.player.inRun=false;
 for(const key of["sairanMonsterId","finalPartyBackup","finalVitals","finalBattleLevel","finalStage","heroCarry","finalSessionPending"])delete campaign[key];
 campaign.finalFlowRecovery={version:retiredSairan?2:1,stage:pendingStage,...(retiredSairan?{reason:"sairan-story-only"}:{}),recoveredAt:new Date().toISOString()};
 return{recovered:true,stage:pendingStage,restoredParty:[...(state.party??[])]}
}
function initialState(){
 const monsters=[
  applyLionelAvatarIdentity(createMonster("slime",{nickname:"リオネル",colorId:"green",personalityId:"bold",obtainedMethod:"campaignProtagonist",obtainedFloor:1}),{rename:true})
 ];
const state={schemaVersion:SAVE_SCHEMA_VERSION,appVersion:APP_VERSION,flags:{abyssUnlocked:false,trueLevelCapRevealed:false,deepAbyssUnlocked:false,gameClear1000:false,ending1000Played:false,gameClear10000:false,ending10000Played:false,secondWorldEntered:false,tenGodObserved:false,individualValuesDisabled:true},worldPhase:0,player:{gold:1000,crystals:20,maxFloor:1,currentFloor:1,checkpoint:1,inRun:false,nextShopFloor:4,floorSeeds:{},dungeonShapeHistory:[],openedChests:{},bossRewards:{},pendingBossRewards:{},bossKills:{},dangerLevel:1,exploreRun:{id:null,floors:{}}},expeditionSnapshot:null,monsters,party:monsters.map(m=>m.id),recentEncounter:null,recentBossEncounter:null,recentBattleMemory:null,battleMemoryAttempts:{},encounterHistory:normalizeEncounterHistory({}),equipment:[],reserveEquipment:[],bossEquipmentVault:[],equipmentCrafting:{rerolls:0,goldSpent:0,maxLocksUsed:0},inventory:{potions:3,highPotions:0,partyPotions:1,manaPotions:1,highManaPotions:0,partyManaPotions:0,fullManaPotions:0,partyFullManaPotions:0,reviveLeaves:1,statusCures:1,partyStatusCures:0,fullHeals:0,partyFullHeals:0,experienceItems:0,experienceItemsMedium:0,experienceItemsLarge:0,experienceItemsUltra:0,captureCrystals:5,abyssKeys:0},onlineParty:{claimedRewards:[],totalGold:0,totalCaptureCrystals:0,expeditionsCompleted:0,battlesWon:0,captures:0,raidWins:0,raidMaterials:0,raidExchange:{},raidWorld:{},tradeEscrow:{},completedTradeIds:[],tradeHistory:[],processedVitalMutationIds:[],processedBattleEventIds:[],processedExpeditionResultIds:[],activeExpeditionRunId:null,activeManualExploreRunId:null,activeExpeditionOwnerId:null,progressIsolation:{version:1,activeGuestSession:null,interruptedRecovery:{},dismissedLegacyCandidates:[],lastLegacyRepair:null},hostWorld:{ownerId:null,openedChestIds:{},floorSeeds:{},defeatedBossFloors:[],claimedBossRewardFloors:[]}},shop:{captureDaily:{key:null,count:0}},magicCircles:{unlocked:{},instances:[],owned:{},goldSpent:0,version:3},settings:{minimapVisible:false,shopDiscountSeed:null,autoBattle:true,equipmentSort:"rarity",battleSpeed:1,audioEnabled:true,musicVolume:.28,sfxVolume:.45,mapTogglePosition:null,minimapPanelPosition:null,autoExploreButtonPosition:null,explorePartyHudCollapsed:false,exploreAutoMode:"off",exploreAutoMenuOpen:false,gauntletPartyCollapsed:false,tutorialSeen:{},tutorialDefeatsSeen:0,contextualGuide:createContextualGuideState(monsters.length),gmFloorUnlockMax:0},gameMaster:{claimedAt:null,floorUnlockMax:0},gacha:{firstTenUsed:false,tutorialFreeSummons:0,lastDailyKey:null,guerrilla:{salt:null,lastCycle:null},drawHistory:{},pity:normalizeGachaPityState({})},notices:{readIds:[],dailyGift:{dayKey:null,claimedDayKey:null,claimedAt:null},rewardInbox:[]},collectionRewards:{queuedMilestones:[],lastOwnedCount:1,total:0},codex:{encounters:{slime:1},captures:{slime:1},equipment:{}},biomeProgress:{},achievements:{version:1,unlockedIds:[],queuedIds:[],unlockedAt:{}},quests:{},rest:{lastFreeKey:null},records:{kills:0,captures:0,chests:0,purchases:0,combatPower:{highest:0,previous:0,updatedAt:null,history:[]}},serialCodes:{redeemed:{}},secretRooms:{run:null,activeRoom:null},abyssSkillTree:createAbyssSkillTreeState(),secondWorld:{randomEvents:{resolvedFloors:[],counts:{}},elites:{encountered:0,defeated:0,byAffix:{},bySpecies:{}}},floorBossChallenges:{discovered:{},encounters:{},fragments:{},victories:{},contracts:{},processedResults:{}},endgame:{processedSpecialResults:{},teamBattle:{unlocked:false,stage:1,totalWins:0,totalLosses:0,dailyKey:null,dailyAttempts:0,highestRewardedStage:0},trials:{battle:1,loop:1,cleared:[],run:null,dailyKey:null,dailyAttempts:0},emergency:{encounters:0,wins:0,losses:0,lastFloor:0,lastTriggeredFloor:0,records:{},fragments:{},craftCounts:{},craftedGear:[],processedFragmentResults:{},manualChallenges:{dailyKey:null,dailyAttempts:0,unlocks:{}},rescue:{post1000Encounters:0,consecutiveLosses:0,lastResult:null}}}};
 state.migrationNotices={legacyCampaignReset:{version:1,pending:false}};
 state.onlineParty.firstCoopBossClears=[];
 state.onlineParty.completedExpeditionRunIds=[];
 state.onlineParty.coopContributionHistory=[];
 state.onlineParty.hostWorld.defeatedBossFloors=[];
 state.onlineParty.hostWorld.campaignFloorStates={};
 normalizeReturnRewards(state);
 normalizeSerialCodeState(state);
 normalizeMagicCircleState(state);
 normalizeCampaignState(state);
 normalizeLionelAvatarState(state);
 state.campaign100.heroEncounters310=retireLegacyCampaignRewind(normalizeCampaignHeroInvasion(state)).state;normalizeCampaignReincarnationState(state);
 return state;
}
export class SaveService{
 constructor(){this.loadFailed=false;this.state=this.load();if(!this.loadFailed)this.save()}
 load(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return initialState();const parsed=JSON.parse(raw);if(!plainRecord(parsed))throw new TypeError("Saved data root must be an object");return this.migrate(parsed)}catch(e){console.error(e);this.loadFailed=true;this.lastLoadError={name:e?.name??"LoadError",message:String(e?.message??e),at:Date.now()};return initialState()}}
 migrate(s){
  if(!plainRecord(s))return initialState();
  const from=inferredSaveSchema(s,s.schemaVersion);
  // Restore an interrupted guest session before any campaign/run migration.
  // This ensures every field restored from the snapshot passes through the
  // current normalizers instead of reintroducing legacy expedition/battle data.
  s.onlineParty=plainRecord(s.onlineParty)?s.onlineParty:{};
  normalizeOnlineProgressIsolation(s);
  const guestRecovery=recoverInterruptedGuestProgress(s),restoredSnapshotVersion=Number(guestRecovery?.session?.snapshot?.version),progressFrom=guestRecovery?.restored&&restoredSnapshotVersion===1?69:from;
  s.flags=plainRecord(s.flags)?s.flags:{};s.flags.abyssUnlocked=s.flags.abyssUnlocked===true;s.flags.trueLevelCapRevealed=s.flags.trueLevelCapRevealed===true;s.flags.deepAbyssUnlocked=s.flags.deepAbyssUnlocked===true;s.flags.abyssKeyExchangePreviewUnlocked=s.flags.abyssKeyExchangePreviewUnlocked===true;
  s.flags.individualValuesDisabled=true;
  const legacyMaxFloor=legacyFloorNumber(s.player?.maxFloor)??0;
  const previousLegacyOrigin=Number(s.lastMigration?.from),legacyHeroLedger=s.campaign100?.heroEncounters310,legacyMissedEncounter=Object.values(plainRecord(legacyHeroLedger?.events)?legacyHeroLedger.events:{}).some(event=>event?.status==="legacy-missed"),legacyClearWithoutAuthoredFinal=s.flags.gameClear1000===true&&legacyHeroLedger?.legacyMigrationApplied===true&&s.campaign100?.finalCompleted!==true,legacyCampaignSource=progressFrom<70||(Number.isFinite(previousLegacyOrigin)&&previousLegacyOrigin<70)||legacyMissedEncounter||legacyClearWithoutAuthoredFinal;
  s.migrationNotices=plainRecord(s.migrationNotices)?s.migrationNotices:{};
  const legacyNotice=plainRecord(s.migrationNotices.legacyCampaignReset)?s.migrationNotices.legacyCampaignReset:{},dismissedAt=typeof legacyNotice.dismissedAt==="string"?legacyNotice.dismissedAt:null;
  s.migrationNotices.legacyCampaignReset={...legacyNotice,version:1,pending:dismissedAt?false:(legacyCampaignSource||legacyNotice.pending===true),detectedSchema:Math.max(0,Math.floor(Number(legacyNotice.detectedSchema??(legacyCampaignSource?(progressFrom<70?progressFrom:previousLegacyOrigin):from))||0)),legacyMaxFloor:Math.max(0,Math.floor(Number(legacyNotice.legacyMaxFloor??legacyMaxFloor)||0)),dismissedAt};
  const legacy1000Clear=progressFrom<70&&(legacyMaxFloor>1000||Boolean(s.player?.bossRewards?.[1000])||Number(s.player?.bossKills?.[1000]??0)>0||s.flags.deepAbyssUnlocked===true);
  s.flags.gameClear1000=s.flags.gameClear1000===true||legacy1000Clear;
  s.flags.ending1000Played=s.flags.ending1000Played===true;
  const legacy10000Clear=progressFrom<70&&(Boolean(s.player?.bossRewards?.[10000])||Number(s.player?.bossKills?.[10000]??0)>0);
  s.flags.gameClear10000=s.flags.gameClear10000===true||legacy10000Clear;
  s.flags.ending10000Played=s.flags.ending10000Played===true;
  s.flags.secondWorldEntered=s.flags.secondWorldEntered===true||(progressFrom<70&&legacyMaxFloor>=1001);
  s.flags.tenGodObserved=s.flags.tenGodObserved===true;
  s.flags.deepAbyssUnlocked=s.flags.deepAbyssUnlocked===true||s.flags.gameClear1000||s.flags.secondWorldEntered;
 s.worldPhase=s.flags.gameClear1000?1:Math.max(0,Math.min(1,Number(s.worldPhase)||0));
  s.player=plainRecord(s.player)?s.player:{};
  if(s.activeBattle!=null&&!plainRecord(s.activeBattle))s.activeBattle=null;
  migrateLegacyCampaignFinalFlow(s,from);
  recoverPendingCampaignFinalFlow(s);
  if(progressFrom<70){
   // Invalid legacy coordinates are absence, not floor 1/100 evidence.  In
   // particular, Infinity used to be clamped through capFloor() and could
   // falsely promote a damaged save to the campaign finale.
   const oldMax=legacyFloorNumber(s.player.maxFloor)??1,oldCurrent=legacyFloorNumber(s.player.currentFloor)??oldMax,oldCheckpoint=legacyFloorNumber(s.player.checkpoint)??1;
   s.player.maxFloor=legacyFloorToCampaignFloor(oldMax);s.player.currentFloor=legacyFloorToCampaignFloor(oldCurrent);s.player.checkpoint=legacyFloorToCampaignFloor(oldCheckpoint);
   s.player.bossKills=remapLegacyFloorLedger(s.player.bossKills,{numeric:true});s.player.bossRewards=remapLegacyFloorLedger(s.player.bossRewards);s.player.pendingBossRewards={};
   s.player.floorSeeds={};s.player.openedChests={};s.player.exploreRun={id:null,floors:{}};s.expeditionSnapshot=null;if(!s.activeBattle?.specialBattle)s.activeBattle=null;s.player.inRun=false;
  }
  const onlineCampaignMigration=migrateLegacyOnlineCampaignLedgers(s,progressFrom);
  reconcileLegacyCampaignBossLedgers(s,progressFrom,onlineCampaignMigration);
  s.player.gold=Math.floor(finiteNumber(s.player.gold,1000,0,Number.MAX_SAFE_INTEGER));
  s.player.crystals=Math.floor(finiteNumber(s.player.crystals,20,0,Number.MAX_SAFE_INTEGER));
  s.player.maxFloor=Math.floor(finiteNumber(s.player.maxFloor,1,1,CAMPAIGN_MAX_FLOOR));
  s.player.currentFloor=Math.floor(finiteNumber(s.player.currentFloor,1,1,CAMPAIGN_MAX_FLOOR));
  s.player.checkpoint=Math.floor(finiteNumber(s.player.checkpoint,1,1,CAMPAIGN_MAX_FLOOR));
  s.player.inRun=s.player.inRun===true;
  s.player.nextShopFloor??=4;
  s.player.floorSeeds=plainRecord(s.player.floorSeeds)?s.player.floorSeeds:{};
  s.player.dungeonShapeHistory=normalizeDungeonShapeHistory(s.player.dungeonShapeHistory);
  s.player.openedChests=plainRecord(s.player.openedChests)?s.player.openedChests:{};
  s.player.bossRewards=normalizeCampaignFloorLedger(s.player.bossRewards);
  s.player.pendingBossRewards=s.player.pendingBossRewards&&typeof s.player.pendingBossRewards==="object"&&!Array.isArray(s.player.pendingBossRewards)?s.player.pendingBossRewards:{};
  if(progressFrom<=70)s.player.pendingBossRewards={};
  s.player.bossKills=normalizeCampaignFloorLedger(s.player.bossKills,{numeric:true});
  s.player.dangerLevel??=1;
  s.player.exploreRun=normalizeExploreRun(s.player.exploreRun);
  s.expeditionSnapshot=normalizeExpeditionSnapshot(s.expeditionSnapshot);
  if(!s.player.inRun&&!s.activeBattle)s.expeditionSnapshot=null;
  if(s.activeBattle&&typeof s.activeBattle==="object"){s.activeBattle.explorationSnapshot=normalizeExpeditionSnapshot(s.activeBattle.explorationSnapshot??s.expeditionSnapshot);s.activeBattle.actionCommitted=Boolean(s.activeBattle.actionCommitted)}
  recoverLegacyCombinedMilestoneBattle(s);
  recoverMalformedActiveBattle(s);
  s.recentEncounter=normalizeRecentEncounter(s.recentEncounter);
  s.recentBossEncounter=normalizeBossEncounter(s.recentBossEncounter);
  s.recentBattleMemory=normalizeBattleMemory(s.recentBattleMemory)??normalizeBattleMemory(s.recentBossEncounter)??normalizeBattleMemory(s.recentEncounter);
  s.battleMemoryAttempts=s.battleMemoryAttempts&&typeof s.battleMemoryAttempts==="object"&&!Array.isArray(s.battleMemoryAttempts)?s.battleMemoryAttempts:{};
  for(const [signature,count]of Object.entries(s.battleMemoryAttempts))s.battleMemoryAttempts[signature]=Math.floor(finiteNumber(count,0,0,60));
  s.encounterHistory=normalizeEncounterHistory(s.encounterHistory);
  s.monsters=(Array.isArray(s.monsters)?s.monsters:[]).filter(monster=>monster&&typeof monster==="object"&&SPECIES[monster.speciesId]);
  const monsterIds=new Set();
  s.monsters=s.monsters.filter(monster=>{if(!monster.id||monsterIds.has(monster.id))return false;monsterIds.add(monster.id);return true});
  if(!s.monsters.length)s.monsters=[createMonster("slime",{nickname:"リオネル",colorId:"green",personalityId:"bold",obtainedMethod:"campaignProtagonist",obtainedFloor:1})];
  normalizeLionelAvatarState(s,{createAvatar:()=>createMonster("slime",{nickname:"リオネル",colorId:"green",personalityId:"bold",obtainedMethod:"campaignProtagonist",obtainedFloor:1})});
  s.party=Array.isArray(s.party)?s.party:[];
  s.equipment=Array.isArray(s.equipment)?s.equipment:[];
  s.reserveEquipment=Array.isArray(s.reserveEquipment)?s.reserveEquipment:[];
  s.bossEquipmentVault=Array.isArray(s.bossEquipmentVault)?s.bossEquipmentVault:[];
  normalizeEquipmentCollections(s);
  s.inventory=normalizeInventory(s.inventory);
  s.onlineParty=s.onlineParty&&typeof s.onlineParty==="object"&&!Array.isArray(s.onlineParty)?s.onlineParty:{};
  s.onlineParty.claimedRewards=Array.isArray(s.onlineParty.claimedRewards)?[...new Set(s.onlineParty.claimedRewards.map(String).filter(Boolean))].slice(-2048):[];
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
	  const raidContribution=raidWorld.contribution&&typeof raidWorld.contribution==="object"&&!Array.isArray(raidWorld.contribution)?Object.fromEntries(Object.entries(raidWorld.contribution).slice(0,32).map(([playerId,value])=>[String(playerId).slice(0,24),cleanRaidContribution(value)])):{};
	  const raidRanking=(Array.isArray(raidWorld.ranking)?raidWorld.ranking:[]).slice(0,32).map((entry,index)=>({playerId:String(entry?.playerId??"").slice(0,24),name:String(entry?.name??"挑戦者").slice(0,24),rank:Math.max(1,Math.min(32,Math.floor(Number(entry?.rank)||index+1))),score:Math.floor(finiteNumber(entry?.score,0,0,Number.MAX_SAFE_INTEGER)),...cleanRaidContribution(entry)}));
	  const raidPersonalMilestones=raidWorld.personalMilestonesClaimed&&typeof raidWorld.personalMilestonesClaimed==="object"&&!Array.isArray(raidWorld.personalMilestonesClaimed)?Object.fromEntries(Object.entries(raidWorld.personalMilestonesClaimed).slice(0,32).map(([playerId,list])=>[String(playerId).slice(0,24),[...new Set((Array.isArray(list)?list:[]).map(Number).filter(value=>[5,15,30].includes(value)))]])):{};
	  const raidJuvenileRewardClaims=raidWorld.juvenileRewardClaimedBy&&typeof raidWorld.juvenileRewardClaimedBy==="object"&&!Array.isArray(raidWorld.juvenileRewardClaimedBy)?Object.fromEntries(Object.entries(raidWorld.juvenileRewardClaimedBy).map(([playerId,claimed])=>[String(playerId).slice(0,24),claimed===true]).filter(([playerId,claimed])=>playerId&&claimed).slice(0,32).map(([playerId])=>[playerId,true])):{};
  s.onlineParty.raidWorld={
   campaignId:raidWorld.campaignId==null?null:String(raidWorld.campaignId).slice(0,120),
   weekId:raidWorld.weekId==null?null:String(raidWorld.weekId).slice(0,80),
   weekStartsAt:Math.floor(finiteNumber(raidWorld.weekStartsAt,0,0,Number.MAX_SAFE_INTEGER)),
   weekEndsAt:Math.floor(finiteNumber(raidWorld.weekEndsAt,0,0,Number.MAX_SAFE_INTEGER)),
   bossId:raidWorld.bossId==null?null:String(raidWorld.bossId).slice(0,80),
   modifierId:raidWorld.modifierId==null?null:String(raidWorld.modifierId).slice(0,80),
   maxHp:Math.floor(finiteNumber(raidWorld.maxHp,0,0,Number.MAX_SAFE_INTEGER)),
   hp:Math.floor(finiteNumber(raidWorld.hp,0,0,Number.MAX_SAFE_INTEGER)),
   attempts:Math.floor(finiteNumber(raidWorld.attempts,0,0,Number.MAX_SAFE_INTEGER)),
   totalDamage:Math.floor(finiteNumber(raidWorld.totalDamage,0,0,Number.MAX_SAFE_INTEGER)),
	   milestonesClaimed:Array.isArray(raidWorld.milestonesClaimed)?[...new Set(raidWorld.milestonesClaimed.map(value=>Math.floor(Number(value))).filter(value=>[5,10,25,50,75,100].includes(value)))]:[],
	   personalMilestonesClaimed:raidPersonalMilestones,
	   juvenileRewardClaimedBy:raidJuvenileRewardClaims,
	   lastAttemptAt:Math.floor(finiteNumber(raidWorld.lastAttemptAt,0,0,Number.MAX_SAFE_INTEGER)),
   completedAt:Math.floor(finiteNumber(raidWorld.completedAt,0,0,Number.MAX_SAFE_INTEGER)),
   contribution:raidContribution,
   ranking:raidRanking,
  };
  s.onlineParty.tradeEscrow=s.onlineParty.tradeEscrow&&typeof s.onlineParty.tradeEscrow==="object"&&!Array.isArray(s.onlineParty.tradeEscrow)?s.onlineParty.tradeEscrow:{};
  s.onlineParty.tradeEscrowQuarantine=Array.isArray(s.onlineParty.tradeEscrowQuarantine)?s.onlineParty.tradeEscrowQuarantine.filter(entry=>entry&&typeof entry==="object").slice(-20):[];
  s.onlineParty.completedTradeIds=Array.isArray(s.onlineParty.completedTradeIds)?[...new Set(s.onlineParty.completedTradeIds.map(String).filter(Boolean))].slice(-100):[];
  s.onlineParty.tradeHistory=Array.isArray(s.onlineParty.tradeHistory)?s.onlineParty.tradeHistory.filter(entry=>entry&&typeof entry==="object").slice(-50):[];
  s.onlineParty.processedVitalMutationIds=Array.isArray(s.onlineParty.processedVitalMutationIds)?[...new Set(s.onlineParty.processedVitalMutationIds.map(String).filter(Boolean))].slice(-256):[];
  s.onlineParty.processedBattleEventIds=Array.isArray(s.onlineParty.processedBattleEventIds)?[...new Set(s.onlineParty.processedBattleEventIds.map(String).filter(Boolean))].slice(-512):[];
  s.onlineParty.processedExpeditionResultIds=Array.isArray(s.onlineParty.processedExpeditionResultIds)?[...new Set(s.onlineParty.processedExpeditionResultIds.map(String).filter(Boolean))].slice(-2048):[];
  s.onlineParty.coopContributionHistory=normalizeCoopContributionHistory(s.onlineParty.coopContributionHistory);
  s.onlineParty.completedExpeditionRunIds=Array.isArray(s.onlineParty.completedExpeditionRunIds)?[...new Set(s.onlineParty.completedExpeditionRunIds.map(String).filter(Boolean))].slice(-2048):[];
  s.onlineParty.activeExpeditionRunId=s.onlineParty.activeExpeditionRunId==null?null:String(s.onlineParty.activeExpeditionRunId).slice(0,120)||null;
  s.onlineParty.activeManualExploreRunId=s.onlineParty.activeManualExploreRunId==null?null:String(s.onlineParty.activeManualExploreRunId).slice(0,120)||null;
  s.onlineParty.activeExpeditionOwnerId=s.onlineParty.activeExpeditionOwnerId==null?null:String(s.onlineParty.activeExpeditionOwnerId).slice(0,24)||null;
  s.onlineParty.firstCoopBossClears=Array.isArray(s.onlineParty.firstCoopBossClears)?[...new Set(s.onlineParty.firstCoopBossClears.map(value=>Math.floor(Number(value))).filter(value=>value>=1&&value<=CAMPAIGN_MAX_FLOOR))].slice(0,1000):[];
  s.onlineParty.hostWorld=s.onlineParty.hostWorld&&typeof s.onlineParty.hostWorld==="object"&&!Array.isArray(s.onlineParty.hostWorld)?s.onlineParty.hostWorld:{openedChestIds:{}};
  s.onlineParty.hostWorld.ownerId=s.onlineParty.hostWorld.ownerId==null?null:String(s.onlineParty.hostWorld.ownerId).slice(0,24)||null;
  s.onlineParty.hostWorld.revision=Math.floor(finiteNumber(s.onlineParty.hostWorld.revision,0,0,Number.MAX_SAFE_INTEGER));
  s.onlineParty.hostWorld.openedChestIds=s.onlineParty.hostWorld.openedChestIds&&typeof s.onlineParty.hostWorld.openedChestIds==="object"&&!Array.isArray(s.onlineParty.hostWorld.openedChestIds)?s.onlineParty.hostWorld.openedChestIds:{};
  for(const floor of Object.keys(s.onlineParty.hostWorld.openedChestIds))s.onlineParty.hostWorld.openedChestIds[floor]=Array.isArray(s.onlineParty.hostWorld.openedChestIds[floor])?[...new Set(s.onlineParty.hostWorld.openedChestIds[floor].map(String).filter(Boolean))].slice(0,200):[];
  s.onlineParty.hostWorld.floorSeeds=s.onlineParty.hostWorld.floorSeeds&&typeof s.onlineParty.hostWorld.floorSeeds==="object"&&!Array.isArray(s.onlineParty.hostWorld.floorSeeds)?Object.fromEntries(Object.entries(s.onlineParty.hostWorld.floorSeeds).map(([floor,seed])=>[String(Math.max(1,Math.floor(Number(floor)||1))),Math.floor(finiteNumber(seed,0,0,0xffffffff))]).slice(0,10000)):{};
  s.onlineParty.hostWorld.defeatedBossFloors=Array.isArray(s.onlineParty.hostWorld.defeatedBossFloors)?[...new Set(s.onlineParty.hostWorld.defeatedBossFloors.map(value=>Math.floor(Number(value))).filter(value=>value>=1&&value<=CAMPAIGN_MAX_FLOOR))].slice(0,1000):[];
  s.onlineParty.hostWorld.claimedBossRewardFloors=Array.isArray(s.onlineParty.hostWorld.claimedBossRewardFloors)?[...new Set(s.onlineParty.hostWorld.claimedBossRewardFloors.map(value=>Math.floor(Number(value))).filter(value=>value>=1&&value<=CAMPAIGN_MAX_FLOOR))].slice(0,1000):[];
  s.onlineParty.hostWorld.campaignFloorStates=normalizeOnlineCampaignFloorStates(s.onlineParty.hostWorld.campaignFloorStates,{allowLegacyNumeric:progressFrom<=70});
  normalizeOnlineProgressIsolation(s);
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
  s.settings=plainRecord(s.settings)?s.settings:{};
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
  s.settings.mapTogglePosition=normalizeUiPosition(s.settings.mapTogglePosition);
  s.settings.minimapPanelPosition=normalizeUiPosition(s.settings.minimapPanelPosition);
  s.settings.autoExploreButtonPosition=normalizeUiPosition(s.settings.autoExploreButtonPosition);
  s.settings.explorePartyHudCollapsed=Boolean(s.settings.explorePartyHudCollapsed);
  s.settings.exploreAutoMode=s.settings.exploreAutoMode==="off"?"off":["floor","items","exp"].includes(s.settings.exploreAutoMode)?"floor":"off";
  s.settings.exploreAutoMenuOpen=false;
  s.settings.gauntletPartyCollapsed=Boolean(s.settings.gauntletPartyCollapsed);
  s.settings.tutorialSeen=plainRecord(s.settings.tutorialSeen)?s.settings.tutorialSeen:{};
  s.settings.tutorialDefeatsSeen=Math.floor(finiteNumber(s.settings.tutorialDefeatsSeen,0,0,2));
  const contextualGuideMissing=!s.settings.contextualGuide||typeof s.settings.contextualGuide!=="object";
  const legacyGuideAdvanced=contextualGuideMissing&&(Number(s.player.maxFloor)>10||Boolean(s.settings.tutorialSeen?.[5]));
  s.settings.contextualGuide=normalizeContextualGuide(s.settings.contextualGuide,{monsterCount:s.monsters.length,legacyAdvanced:legacyGuideAdvanced});
  s.settings.gmFloorUnlockMax=Math.floor(finiteNumber(s.settings.gmFloorUnlockMax,0,0,9998));
  s.gameMaster=s.gameMaster&&typeof s.gameMaster==="object"&&!Array.isArray(s.gameMaster)?s.gameMaster:{claimedAt:null,floorUnlockMax:0};
  s.gameMaster.floorUnlockMax=Math.floor(finiteNumber(s.gameMaster.floorUnlockMax??s.settings.gmFloorUnlockMax,0,0,9998));
  s.gacha=plainRecord(s.gacha)?s.gacha:{};s.gacha.firstTenUsed??=false;s.gacha.tutorialFreeSummons=Math.floor(finiteNumber(s.gacha.tutorialFreeSummons,0,0,1));s.gacha.lastDailyKey??=null;s.gacha.guerrilla=plainRecord(s.gacha.guerrilla)?s.gacha.guerrilla:{salt:null,lastCycle:null};s.gacha.drawHistory=normalizeGachaDrawHistory(s.gacha.drawHistory);s.gacha.pity=normalizeGachaPityState(s.gacha.pity);
  normalizeNoticeState(s);
  s.codex=plainRecord(s.codex)?s.codex:{};s.codex.encounters=plainRecord(s.codex.encounters)?s.codex.encounters:{};s.codex.captures=plainRecord(s.codex.captures)?s.codex.captures:{};s.codex.equipment=plainRecord(s.codex.equipment)?s.codex.equipment:{};s.biomeProgress=plainRecord(s.biomeProgress)?s.biomeProgress:{};
  Object.values(s.biomeProgress).forEach(data=>{if(!data||typeof data!=="object")return;data.visitedFloors=Array.isArray(data.visitedFloors)?data.visitedFloors:[];data.encounters=data.encounters&&typeof data.encounters==="object"?data.encounters:{};data.openedChests=Array.isArray(data.openedChests)?data.openedChests:[];data.events=Array.isArray(data.events)?data.events:[];data.bossDefeated=Boolean(data.bossDefeated)});
  s.achievements=plainRecord(s.achievements)?s.achievements:{};s.quests=plainRecord(s.quests)?s.quests:{};
  s.rest=plainRecord(s.rest)?s.rest:{};s.rest.lastFreeKey??=null;
  s.records=plainRecord(s.records)?s.records:{kills:0,captures:0,chests:0,purchases:0};
  s.records.kills=Math.floor(finiteNumber(s.records.kills,0,0,Number.MAX_SAFE_INTEGER));
  s.records.captures=Math.floor(finiteNumber(s.records.captures,0,0,Number.MAX_SAFE_INTEGER));
  s.records.chests=Math.floor(finiteNumber(s.records.chests,0,0,Number.MAX_SAFE_INTEGER));
  s.records.purchases=Math.floor(finiteNumber(s.records.purchases,0,0,Number.MAX_SAFE_INTEGER));
  normalizeCombatPowerRecord(s,0);
  normalizeSerialCodeState(s);
  normalizeSecretRoomState(s);
  normalizeAbyssSkillTree(s);
  s.returnRewards=plainRecord(s.returnRewards)?s.returnRewards:{};
  s.returnRewards.manual=plainRecord(s.returnRewards.manual)?s.returnRewards.manual:{};
  s.returnRewards.history=plainRecord(s.returnRewards.history)?s.returnRewards.history:{};
  s.returnRewards.idle=plainRecord(s.returnRewards.idle)?s.returnRewards.idle:{};
  normalizeReturnRewards(s);
  s.endgame=plainRecord(s.endgame)?s.endgame:{};
  s.endgame.teamBattle=plainRecord(s.endgame.teamBattle)?s.endgame.teamBattle:{};
  s.endgame.trials=plainRecord(s.endgame.trials)?s.endgame.trials:{};
  s.endgame.emergency=plainRecord(s.endgame.emergency)?s.endgame.emergency:{};
  s.endgame.emergency.rescue=plainRecord(s.endgame.emergency.rescue)?s.endgame.emergency.rescue:{};
  normalizeEndgameState(s);
  if(from<62&&s.activeBattle?.specialBattleType==="team"){
   const team=s.endgame.teamBattle;
   s.activeBattle.specialTeamStage=Math.max(1,Math.floor(Number(s.activeBattle.specialTeamStage)||Number(team.stage)||1));
   if(s.activeBattle.teamAttemptCharged==null)s.activeBattle.teamAttemptCharged=true;
   if(s.activeBattle.teamAttemptDayKey==null)s.activeBattle.teamAttemptDayKey=team.dailyKey??null;
  }
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
  s.secondWorld=plainRecord(s.secondWorld)?s.secondWorld:{};
  s.secondWorld.randomEvents=plainRecord(s.secondWorld.randomEvents)?s.secondWorld.randomEvents:{};
  s.secondWorld.elites=plainRecord(s.secondWorld.elites)?s.secondWorld.elites:{};
  normalizeSecondWorldEvents(s);
  normalizeEliteRecords(s);
  normalizeTenGodContact(s);
  let ownedRaidJuveniles=0;
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
   if(MYTHIC_HERO_CHARACTER_IDS.has(m.speciesId)){
    const previousNeed=Math.max(1,expNeedFor(m)),previousProgress=Math.max(0,Math.min(.999999,(Number(m.exp)||0)/previousNeed)),preservedLevel=m.level;
    m.summonTier="神話";m.summonRarity="神話";
    if(from<77){const rebasedExp=Math.floor(expNeedFor(m)*previousProgress),rebasedTotal=totalExperience({...m,totalExp:undefined,level:preservedLevel,exp:rebasedExp});applyTotalExperience(m,rebasedTotal)}
    for(const key of["hp","atk","def","spd"])m.ivs[key]=Math.min(94,m.ivs[key]);
    if(m.speciesId==="myth_rion")m.attribute="nature";
   }
   if(m.floorBossCatalogId){
    const floorBoss=floorBossDefinitionById(m.floorBossCatalogId);
    if(floorBoss){
     m.visualSpeciesId=floorBoss.visualSpeciesId??floorBoss.speciesId;m.floorBossStatProfile={...floorBoss.stats};m.summonTier="神話";m.summonRarity="神話";
     // Old floor-boss contracts stored the catalog's 10F-step balance floor as
     // acquisition metadata. Repair only an exact catalog-proven match; level,
     // IDs and every battle/scaling field intentionally remain untouched.
     const legacyObtainedFloor=Number(m.obtainedFloor),campaignObtainedFloor=floorBossCampaignDisplayFloor(floorBoss);
     if(m.obtainedMethod==="floorBossContract"&&campaignObtainedFloor!=null&&legacyObtainedFloor===floorBoss.floor){
      m.obtainedFloor=campaignObtainedFloor;
      const history=m.history&&typeof m.history==="object"&&!Array.isArray(m.history)?m.history:null,highestFloor=Number(history?.highestFloor),unusedContract=history&&["adventures","battles","victories","defeats","bossDefeats","kills"].every(key=>Number(history[key]??0)===0);
      if(history&&highestFloor===legacyObtainedFloor&&(legacyObtainedFloor>CAMPAIGN_MAX_FLOOR||unusedContract))history.highestFloor=campaignObtainedFloor;
     }
    }
   }
   if(normalizeRaidJuvenileContract(m))ownedRaidJuveniles++;
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
   normalizeSkillRecommendationProfile(m);
   // Equipment skills are rehydrated by main after this save pass. Keep their
   // selected IDs intact until `_equipmentSkills` is available again.
   normalizeSkillProgress(m,{normalizeLoadout:false});
   const oldGear=m.equipment??{};
   m.equipment={weaponRight:oldGear.weaponRight??oldGear.weapon??null,weaponLeft:oldGear.weaponLeft??null,armorBody:oldGear.armorBody??oldGear.armor??null,armorSupport:oldGear.armorSupport??null,accessoryNeck:oldGear.accessoryNeck??oldGear.accessory??null,accessoryFinger:oldGear.accessoryFinger??null};
   m.attribute=m.attribute==null?null:canonicalAttribute(m.attribute,m.speciesId??m.id);m.resistances=normalizedResistances(m.resistances);m.tags=Array.isArray(m.tags)?m.tags:[];m.isBoss??=false;m.sealedPower??=null;
   m.stars=Math.max(1,Math.min(MONSTER_STAR_MAX,Number(m.stars??1)));
   m.plus=Math.max(0,Number(m.plus??0));
   m.affection=Math.max(0,Math.min(1000,Number(m.affection??m.bond??0)));
   m.bond=m.affection;
   m.obtainedAt??=m.capturedAt??new Date(0).toISOString();
   m.obtainedFloor??=1;m.obtainedMethod??="capture";
   m.history={adventures:0,battles:Number(m.battles??0),victories:0,defeats:Number(m.defeats??0),bossDefeats:0,kills:0,mvp:0,maxDamage:0,lastDeployedAt:null,consecutiveDeployments:0,longestConsecutiveDeployments:0,highestFloor:Number(m.obtainedFloor??1),...(m.history??{})};
  });
  if(ownedRaidJuveniles>0){
   s.codex.encounters[RAID_JUVENILE_SPECIES_ID]=Math.max(ownedRaidJuveniles,Math.floor(finiteNumber(s.codex.encounters[RAID_JUVENILE_SPECIES_ID],0,0,Number.MAX_SAFE_INTEGER)));
   s.codex.captures[RAID_JUVENILE_SPECIES_ID]=Math.max(ownedRaidJuveniles,Math.floor(finiteNumber(s.codex.captures[RAID_JUVENILE_SPECIES_ID],0,0,Number.MAX_SAFE_INTEGER)));
  }
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
  syncCollectionRewardInbox(s);
  normalizeAchievementState(s);
  syncAchievementRewardInbox(s);
  normalizeCampaignState(s);normalizeLionelAvatarState(s);s.campaign100.heroEncounters310=retireLegacyCampaignRewind(normalizeCampaignHeroInvasion(s)).state;normalizeCampaignReincarnationState(s);
  if(from<73){s.expeditionSnapshot=null;if(s.activeBattle&&!s.activeBattle.specialBattle)s.activeBattle.explorationSnapshot=null}
  s.schemaVersion=SAVE_SCHEMA_VERSION;
  s.appVersion=APP_VERSION;
  if(from<SAVE_SCHEMA_VERSION)s.lastMigration={from,to:SAVE_SCHEMA_VERSION,at:new Date().toISOString()};
  return s
 }
 save(){
  // Never replace an unreadable original save merely because startup fell
  // back to a fresh in-memory state. An explicit full reset is the only path
  // that releases this protection.
  if(this.loadFailed){this.lastSaveError={name:"RecoveryProtectedError",message:"Unreadable save is protected from overwrite",quota:false,bytes:0,at:Date.now()};return false}
  normalizeLionelAvatarState(this.state);
  this.state.appVersion=APP_VERSION;
  this.state.flags??={};
  this.state.flags.abyssKeyExchangePreviewUnlocked=(this.state.inventory?.abyssKeys??0)>=250;
  syncCollectionRewardInbox(this.state);
  syncAchievementRewardInbox(this.state);
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
  const ledgerReceipt=clearSerialRedemptionLedgerForFullReset();
  if(!ledgerReceipt.ok)return false;
  const previousState=this.state,previousLoadFailed=this.loadFailed;
  this.state=initialState();
  this.loadFailed=false;
  if(this.save())return true;
  this.state=previousState;this.loadFailed=previousLoadFailed;
  restoreSerialRedemptionLedgerAfterFailedReset(ledgerReceipt);
  return false
 }
}
