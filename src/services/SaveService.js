import{SAVE_KEY,APP_VERSION}from"../core/config.js";
import{createMonster}from"../models/Monster.js";
import{maxMp}from"../battle/SkillSystem.js";
function initialState(){
 const monsters=[
  createMonster("slime",{nickname:"ぷるん",colorId:"green",personalityId:"bold"}),
  createMonster("goblin",{nickname:"グリム",colorId:"orange",personalityId:"swift"}),
  createMonster("fairy",{nickname:"ルナ",colorId:"cyan",personalityId:"calm"}),
  createMonster("dragon",{nickname:"炎帝",colorId:"red",personalityId:"brave"})
 ];
 return{schemaVersion:4,appVersion:APP_VERSION,player:{gold:1000,crystals:20,maxFloor:1,currentFloor:1,checkpoint:1,inRun:false,nextShopFloor:4},monsters,party:monsters.map(m=>m.id),equipment:[],inventory:{potions:3,captureCrystals:5},settings:{minimapVisible:true,autoBattle:true,equipmentSort:"rarity",battleSpeed:1},records:{kills:0,captures:0,chests:0,purchases:0}};
}
export class SaveService{
 constructor(){this.state=this.load()}
 load(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?this.migrate(JSON.parse(raw)):initialState()}catch(e){console.error(e);return initialState()}}
 migrate(s){s.schemaVersion=4;s.appVersion=APP_VERSION;s.player??={};s.player.currentFloor??=1;s.player.checkpoint??=1;s.player.inRun??=false;s.player.nextShopFloor??=4;s.monsters??=[];s.party??=[];s.equipment??=[];s.inventory??={potions:0,captureCrystals:0};s.settings??={};s.settings.minimapVisible??=true;s.settings.autoBattle??=true;s.settings.equipmentSort??="rarity";s.settings.battleSpeed??=1;s.records??={kills:0,captures:0,chests:0,purchases:0};s.records.purchases??=0;s.monsters.forEach(m=>{m.currentHp??=null;m.currentMp??=maxMp(m);m.currentMp=Math.min(m.currentMp,maxMp(m));m.equipment??={weapon:null,armor:null,accessory:null}});s.equipment.forEach(i=>{i.favorite??=false;i.locked??=false;i.equippedBy??=null;i.plus??=0;i.level??=1});return s}
 save(){this.state.appVersion=APP_VERSION;localStorage.setItem(SAVE_KEY,JSON.stringify(this.state))}
 reset(){localStorage.removeItem(SAVE_KEY);this.state=initialState();this.save()}
}
