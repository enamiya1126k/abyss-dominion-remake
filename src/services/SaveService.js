import{SAVE_KEY,APP_VERSION}from"../core/config.js";
import{createMonster}from"../models/Monster.js";
import{maxMp}from"../battle/SkillSystem.js";
function initialState(){
 const monsters=[
  createMonster("slime",{nickname:"ぷるん",colorId:"green",personalityId:"bold"})
 ];
 return{schemaVersion:10,appVersion:APP_VERSION,player:{gold:1000,crystals:20,maxFloor:1,currentFloor:1,checkpoint:1,inRun:false,nextShopFloor:4,floorSeeds:{},openedChests:{},bossRewards:{},bossKills:{}},monsters,party:monsters.map(m=>m.id),equipment:[],reserveEquipment:[],bossEquipmentVault:[],inventory:{potions:3,partyPotions:1,statusCures:1,partyStatusCures:0,fullHeals:0,partyFullHeals:0,captureCrystals:5},settings:{minimapVisible:true,shopDiscountSeed:null,autoBattle:true,equipmentSort:"rarity",battleSpeed:1,mapTogglePosition:null,tutorialSeen:{}},gacha:{firstTenUsed:false,lastDailyKey:null},rest:{lastFreeKey:null},records:{kills:0,captures:0,chests:0,purchases:0}};
}
export class SaveService{
 constructor(){this.state=this.load();this.save()}
 load(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?this.migrate(JSON.parse(raw)):initialState()}catch(e){console.error(e);return initialState()}}
 migrate(s){
  const from=Number(s.schemaVersion??1);
  s.player??={};
  s.player.gold??=1000;
  s.player.crystals??=20;
  s.player.maxFloor??=1;
  s.player.currentFloor??=1;
  s.player.checkpoint??=1;
  s.player.inRun??=false;
  s.player.nextShopFloor??=4;
  s.player.floorSeeds??={};
  s.player.openedChests??={};
  s.player.bossRewards??={};
  s.player.bossKills??={};
  s.monsters??=[];
  s.party??=[];
  s.equipment??=[];
  s.reserveEquipment??=[];
  s.bossEquipmentVault??=[];
  s.inventory??={potions:0,captureCrystals:0};
  s.inventory.potions??=0;
  s.inventory.partyPotions??=0;
  s.inventory.statusCures??=0;
  s.inventory.partyStatusCures??=0;
  s.inventory.fullHeals??=0;
  s.inventory.partyFullHeals??=0;
  s.inventory.captureCrystals??=0;
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
  s.rest??={};s.rest.lastFreeKey??=null;
  s.records??={kills:0,captures:0,chests:0,purchases:0};
  s.records.kills??=0;
  s.records.captures??=0;
  s.records.chests??=0;
  s.records.purchases??=0;
  s.monsters.forEach(m=>{
   m.traitId??="steady";
   m.currentMp??=maxMp(m);
   m.currentMp=Math.min(m.currentMp,maxMp(m));
   m.equipment??={weapon:null,armor:null,accessory:null};
   m.equipment.weapon??=null;
   m.equipment.armor??=null;
   m.equipment.accessory??=null;
  });
  for(const list of[s.equipment,s.reserveEquipment,s.bossEquipmentVault])list.forEach(i=>{
   i.favorite??=false;
   i.locked??=false;
   i.equippedBy??=null;
   i.plus??=0;
   i.level??=1;
   i.createdAt??=new Date(0).toISOString();
   i.series??=null;
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
  s.schemaVersion=10;
  s.appVersion=APP_VERSION;
  if(from<10)s.lastMigration={from,to:10,at:new Date().toISOString()};
  return s
 }
 save(){this.state.appVersion=APP_VERSION;localStorage.setItem(SAVE_KEY,JSON.stringify(this.state))}
 reset(){localStorage.removeItem(SAVE_KEY);this.state=initialState();this.save()}
}
