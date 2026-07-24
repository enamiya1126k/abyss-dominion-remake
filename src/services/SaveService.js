import{SAVE_KEY,APP_VERSION,MAX_PARTY_SIZE,TRUE_MAX_LEVEL}from"../core/config.js?v=1.4.1";
import{createMonster,totalExperience,applyTotalExperience}from"../models/Monster.js?v=1.3.0";
import{maxMp,normalizeSkillProgress,allLearnedSkills}from"../battle/SkillSystem.js?v=1.3.0";
import{normalizeEndgameState,ENDGAME_BOSSES}from"../core/EndgameSystem.js?v=1.0.0";
import{normalizeSecondWorldEvents}from"../core/SecondWorldEventSystem.js?v=1.1.0";
import{normalizeEliteRecords}from"../core/SecondWorldEliteSystem.js?v=1.1.0";
import{normalizeTenGodContact}from"../core/TenGodContactSystem.js?v=0.9.15-alpha.32-phase10-10-release-audit";
import{SPECIES}from"../data/species.js?v=1.3.0";

import{normalizeReturnRewards}from"../core/ReturnRewardSystem.js?v=1.4.0";
import{createAbyssSkillTreeState,normalizeAbyssSkillTree}from"../core/AbyssSkillTreeSystem.js?v=1.4.0";
import{normalizeEquipmentLoadouts}from"./EquipmentLoadoutSystem.js?v=0.9.15-alpha.95.1-stability-audit";
import{normalizeEquipmentAffixLocks,normalizeEquipmentCraftingState}from"./EquipmentAffixCrafting.js?v=1.2.0";
import{normalizeSecretRoomState}from"../core/SecretRoomSystem.js?v=1.4.0";
import{normalizeCombatPowerRecord}from"../core/CombatPower.js?v=1.3.0";
function finiteNumber(value,fallback=0,min=-Infinity,max=Infinity){
 const number=Number(value);
 return Number.isFinite(number)?Math.max(min,Math.min(max,number)):fallback;
}
function normalizeInventory(inventory){
 const normalized=inventory&&typeof inventory==="object"&&!Array.isArray(inventory)?inventory:{};
 for(const key of["potions","highPotions","partyPotions","manaPotions","highManaPotions","partyManaPotions","fullManaPotions","partyFullManaPotions","reviveLeaves","statusCures","partyStatusCures","fullHeals","partyFullHeals","captureCrystals","abyssKeys"]){
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
 if(Number(monster.contractProfileVersion??0)>=1)return;
 const divine=boss.faction==="tenGod",minimumIv=divine?100:95;monster.ivs??={};for(const key of["hp","atk","def","spd"])monster.ivs[key]=Math.max(minimumIv,Math.min(100,Number(monster.ivs[key])||minimumIv));
 monster.stars=5;monster.plus=Math.max(Number(monster.plus)||0,divine?50:25);monster.affection=Math.max(Number(monster.affection??monster.bond)||0,divine?1000:750);monster.bond=monster.affection;monster.favorite=true;monster.locked=true;
 const strongest=allLearnedSkills(monster).slice(-4);monster.equippedSkills=strongest.map(skill=>skill.id);monster.skillProgress=monster.skillProgress&&typeof monster.skillProgress==="object"&&!Array.isArray(monster.skillProgress)?monster.skillProgress:{};
 for(const skill of strongest){const current=monster.skillProgress[skill.id]??{};const level=Math.max(Number(current.level)||1,divine?5:3);monster.skillProgress[skill.id]={...current,level,exp:Math.max(0,Number(current.exp)||0),uses:Math.max(0,Number(current.uses)||0),need:level>=10?0:25*level}}
 monster.contractProfileVersion=1;
}
function initialState(){
 const monsters=[
  createMonster("slime",{nickname:"ぷるん",colorId:"green",personalityId:"bold"})
 ];
 return{schemaVersion:37,appVersion:APP_VERSION,flags:{abyssUnlocked:false,trueLevelCapRevealed:false,deepAbyssUnlocked:false,gameClear1000:false,ending1000Played:false,gameClear10000:false,ending10000Played:false,secondWorldEntered:false,tenGodObserved:false},worldPhase:0,player:{gold:1000,crystals:20,maxFloor:1,currentFloor:1,checkpoint:1,inRun:false,nextShopFloor:4,floorSeeds:{},openedChests:{},bossRewards:{},bossKills:{},dangerLevel:1},monsters,party:monsters.map(m=>m.id),equipment:[],reserveEquipment:[],bossEquipmentVault:[],equipmentCrafting:{rerolls:0,goldSpent:0,maxLocksUsed:0},inventory:{potions:3,highPotions:0,partyPotions:1,manaPotions:1,highManaPotions:0,partyManaPotions:0,fullManaPotions:0,partyFullManaPotions:0,reviveLeaves:1,statusCures:1,partyStatusCures:0,fullHeals:0,partyFullHeals:0,captureCrystals:5,abyssKeys:0},settings:{minimapVisible:true,shopDiscountSeed:null,autoBattle:true,equipmentSort:"rarity",battleSpeed:1,mapTogglePosition:null,tutorialSeen:{}},gacha:{firstTenUsed:false,lastDailyKey:null},codex:{encounters:{slime:1},captures:{slime:1},equipment:{}},biomeProgress:{},achievements:{},quests:{},rest:{lastFreeKey:null},records:{kills:0,captures:0,chests:0,purchases:0,combatPower:{highest:0,previous:0,updatedAt:null,history:[]}},secretRooms:{run:null,activeRoom:null},abyssSkillTree:createAbyssSkillTreeState(),secondWorld:{randomEvents:{resolvedFloors:[],counts:{}},elites:{encountered:0,defeated:0,byAffix:{},bySpecies:{}}},endgame:{teamBattle:{unlocked:false,stage:1,totalWins:0,totalLosses:0,dailyKey:null,dailyAttempts:0},emergency:{encounters:0,wins:0,losses:0,lastFloor:0,lastRollStep:0,records:{},fragments:{},craftCounts:{},craftedGear:[],rescue:{post1000Encounters:0,consecutiveLosses:0,lastResult:null}}}};
}
export class SaveService{
 constructor(){this.state=this.load();this.save()}
 load(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?this.migrate(JSON.parse(raw)):initialState()}catch(e){console.error(e);return initialState()}}
 migrate(s){
  const from=Number(s.schemaVersion??1);
  s.flags??={};s.flags.abyssUnlocked??=false;s.flags.trueLevelCapRevealed??=false;s.flags.deepAbyssUnlocked??=false;s.flags.abyssKeyExchangePreviewUnlocked??=false;
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
  s.player.bossKills??={};
  s.player.dangerLevel??=1;
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
  s.settings??={};
  s.settings.minimapVisible??=true;
  s.settings.shopDiscountSeed??=null;
  s.settings.autoBattle??=true;
  s.settings.equipmentSort??="rarity";
  s.settings.equipmentSlot??="weapon";
  s.settings.equipmentStorage??="inventory";
  s.settings.battleSpeed??=1;
  s.settings.mapTogglePosition??=null;
  s.settings.tutorialSeen??={};
  s.gacha??={};s.gacha.firstTenUsed??=false;s.gacha.lastDailyKey??=null;
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
  normalizeSecretRoomState(s);
  normalizeAbyssSkillTree(s);
  normalizeReturnRewards(s);
  normalizeEndgameState(s);
  normalizeSecondWorldEvents(s);
  normalizeEliteRecords(s);
  normalizeTenGodContact(s);
  s.monsters.forEach(m=>{
   m.level=Math.floor(finiteNumber(m.level,1,1,TRUE_MAX_LEVEL));
   m.exp=Math.floor(finiteNumber(m.exp,0,0,Number.MAX_SAFE_INTEGER));
   const canonicalTotal=Number.isFinite(Number(m.totalExp))
    ? Math.floor(finiteNumber(m.totalExp,0,0,Number.MAX_SAFE_INTEGER))
    : totalExperience({...m,totalExp:undefined});
   applyTotalExperience(m,canonicalTotal);
   m.rank=Math.floor(finiteNumber(m.rank,1,1,Number.MAX_SAFE_INTEGER));
   m.stars=Math.floor(finiteNumber(m.stars,1,1,5));
   m.plus=Math.floor(finiteNumber(m.plus,0,0,Number.MAX_SAFE_INTEGER));
   m.traitId??="steady";
   m.personalityId??="bold";
   m.colorId??="green";
   const mpMax=maxMp(m);
   m.currentMp=finiteNumber(m.currentMp,mpMax,0,mpMax);
   m.currentHp=m.currentHp==null?null:finiteNumber(m.currentHp,null,0,Number.MAX_SAFE_INTEGER);
   m.equippedSkills=Array.isArray(m.equippedSkills)?m.equippedSkills.filter(Boolean).slice(0,4):[];
   normalizeContractedEndgameMonster(m);
   normalizeSkillProgress(m);
   const oldGear=m.equipment??{};
   m.equipment={weaponRight:oldGear.weaponRight??oldGear.weapon??null,weaponLeft:oldGear.weaponLeft??null,armorBody:oldGear.armorBody??oldGear.armor??null,armorSupport:oldGear.armorSupport??null,accessoryNeck:oldGear.accessoryNeck??oldGear.accessory??null,accessoryFinger:oldGear.accessoryFinger??null};
   m.attribute??=null;m.resistances??={};m.tags??=[];m.isBoss??=false;m.sealedPower??=null;
   m.stars=Math.max(1,Math.min(5,Number(m.stars??1)));
   m.plus=Math.max(0,Number(m.plus??0));
   m.affection=Math.max(0,Math.min(1000,Number(m.affection??m.bond??0)));
   m.bond=m.affection;
   m.obtainedAt??=m.capturedAt??new Date(0).toISOString();
   m.obtainedFloor??=1;m.obtainedMethod??="capture";
   m.history={adventures:0,battles:Number(m.battles??0),victories:0,defeats:Number(m.defeats??0),bossDefeats:0,kills:0,mvp:0,maxDamage:0,lastDeployedAt:null,consecutiveDeployments:0,longestConsecutiveDeployments:0,highestFloor:Number(m.obtainedFloor??1),...(m.history??{})};
  });
  for(const list of[s.equipment,s.reserveEquipment,s.bossEquipmentVault])list.forEach(i=>{
   i.favorite??=false;
   i.locked??=false;
   i.equippedBy??=null;
   i.plus??=0;
   const savedLevel=Number(i.level??1);
   i.level=Number.isFinite(savedLevel)?Math.max(1,Math.floor(savedLevel)):1;
   i.exp=Math.max(0,Number(i.exp??0));
   i.createdAt??=new Date(0).toISOString();
   i.series??=null;
   i.handedness??=i.slot==="weapon"?"either":null;
   i.ruleOverrides??={};
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
  s.schemaVersion=37;
  s.appVersion=APP_VERSION;
  if(from<37)s.lastMigration={from,to:37,at:new Date().toISOString()};
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
