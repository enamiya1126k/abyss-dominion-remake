import{SAVE_KEY,APP_VERSION}from"../core/config.js?v=0.9.15-alpha.1-part1";
import{createMonster}from"../models/Monster.js?v=0.9.11-alpha.1";
import{maxMp}from"../battle/SkillSystem.js?v=0.9.14-alpha.2";
import{normalizeEndgameState}from"../core/EndgameSystem.js?v=0.9.15-alpha.1-part1";
function initialState(){
 const monsters=[
  createMonster("slime",{nickname:"ぷるん",colorId:"green",personalityId:"bold"})
 ];
 return{schemaVersion:20,appVersion:APP_VERSION,flags:{abyssUnlocked:false,trueLevelCapRevealed:false,deepAbyssUnlocked:false,gameClear1000:false},worldPhase:0,player:{gold:1000,crystals:20,maxFloor:1,currentFloor:1,checkpoint:1,inRun:false,nextShopFloor:4,floorSeeds:{},openedChests:{},bossRewards:{},bossKills:{},dangerLevel:1},monsters,party:monsters.map(m=>m.id),equipment:[],reserveEquipment:[],bossEquipmentVault:[],inventory:{potions:3,highPotions:0,partyPotions:1,manaPotions:1,partyManaPotions:0,reviveLeaves:1,statusCures:1,partyStatusCures:0,fullHeals:0,partyFullHeals:0,captureCrystals:5,abyssKeys:0},settings:{minimapVisible:true,shopDiscountSeed:null,autoBattle:true,equipmentSort:"rarity",battleSpeed:1,mapTogglePosition:null,tutorialSeen:{}},gacha:{firstTenUsed:false,lastDailyKey:null},codex:{encounters:{slime:1},captures:{slime:1},equipment:{}},biomeProgress:{},achievements:{},quests:{},rest:{lastFreeKey:null},records:{kills:0,captures:0,chests:0,purchases:0},endgame:{teamBattle:{unlocked:false,stage:1,totalWins:0,totalLosses:0,dailyKey:null,dailyAttempts:0},emergency:{encounters:0,wins:0,losses:0,lastFloor:0,lastRollStep:0,records:{},fragments:{},craftCounts:{},craftedGear:[]}}};
}
export class SaveService{
 constructor(){this.state=this.load();this.save()}
 load(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?this.migrate(JSON.parse(raw)):initialState()}catch(e){console.error(e);return initialState()}}
 migrate(s){
  const from=Number(s.schemaVersion??1);
  s.flags??={};s.flags.abyssUnlocked??=false;s.flags.trueLevelCapRevealed??=false;s.flags.deepAbyssUnlocked??=false;
  const legacy1000Clear=Number(s.player?.maxFloor??0)>1000||Boolean(s.player?.bossRewards?.[1000])||Number(s.player?.bossKills?.[1000]??0)>0||Boolean(s.flags.deepAbyssUnlocked);
  s.flags.gameClear1000??=legacy1000Clear;
  s.worldPhase=s.flags.gameClear1000?1:Math.max(0,Math.min(1,Number(s.worldPhase)||0));
  s.player??={};
  s.player.gold??=1000;
  s.player.crystals??=20;
  s.player.maxFloor=Math.max(1,Math.min(10000,Number(s.player.maxFloor??1)));
  s.player.currentFloor=Math.max(1,Math.min(10000,Number(s.player.currentFloor??1)));
  s.player.checkpoint??=1;
  s.player.inRun??=false;
  s.player.nextShopFloor??=4;
  s.player.floorSeeds??={};
  s.player.openedChests??={};
  s.player.bossRewards??={};
  s.player.bossKills??={};
  s.player.dangerLevel??=1;
  s.monsters??=[];
  s.party??=[];
  s.equipment??=[];
  s.reserveEquipment??=[];
  s.bossEquipmentVault??=[];
  s.inventory??={potions:0,captureCrystals:0};
  s.inventory.potions??=0;
  s.inventory.highPotions??=0;
  s.inventory.partyPotions??=0;
  s.inventory.manaPotions??=0;
  s.inventory.partyManaPotions??=0;
  s.inventory.reviveLeaves??=0;
  s.inventory.statusCures??=0;
  s.inventory.partyStatusCures??=0;
  s.inventory.fullHeals??=0;
  s.inventory.partyFullHeals??=0;
  s.inventory.captureCrystals??=0;
  s.inventory.abyssKeys??=0;
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
  s.records.kills??=0;
  s.records.captures??=0;
  s.records.chests??=0;
  s.records.purchases??=0;
  normalizeEndgameState(s);
  s.monsters.forEach(m=>{
   m.traitId??="steady";
   m.currentMp??=maxMp(m);
   m.currentMp=Math.min(m.currentMp,maxMp(m));
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
   i.level??=1;
   i.createdAt??=new Date(0).toISOString();
   i.series??=null;
   i.handedness??=i.slot==="weapon"?"either":null;
   i.ruleOverrides??={};
  });
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
  s.schemaVersion=20;
  s.appVersion=APP_VERSION;
  if(from<20)s.lastMigration={from,to:20,at:new Date().toISOString()};
  return s
 }
 save(){this.state.appVersion=APP_VERSION;localStorage.setItem(SAVE_KEY,JSON.stringify(this.state))}
 reset(){localStorage.removeItem(SAVE_KEY);this.state=initialState();this.save()}
}
