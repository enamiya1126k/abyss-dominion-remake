import{SAVE_KEY,APP_VERSION}from"../core/config.js";
import{createMonster}from"../models/Monster.js";
function initialState(){
 const monsters=[
  createMonster("slime",{nickname:"ぷるん",colorId:"green",personalityId:"bold"}),
  createMonster("goblin",{nickname:"グリム",colorId:"orange",personalityId:"swift"}),
  createMonster("fairy",{nickname:"ルナ",colorId:"cyan",personalityId:"calm"}),
  createMonster("dragon",{nickname:"炎帝",colorId:"red",personalityId:"brave"})
 ];
 return{schemaVersion:2,appVersion:APP_VERSION,player:{gold:1000,crystals:20,maxFloor:1,currentFloor:1,checkpoint:1,inRun:false},monsters,party:monsters.map(m=>m.id),equipment:[],inventory:{potions:3,captureCrystals:5},settings:{minimapVisible:true,autoBattle:true},records:{kills:0,captures:0,chests:0}};
}
export class SaveService{
 constructor(){this.state=this.load()}
 load(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?this.migrate(JSON.parse(raw)):initialState()}catch(e){console.error(e);return initialState()}}
 migrate(s){s.schemaVersion=2;s.appVersion=APP_VERSION;s.player??={};s.player.currentFloor??=1;s.player.checkpoint??=1;s.player.inRun??=false;s.monsters??=[];s.party??=[];s.equipment??=[];s.inventory??={potions:0,captureCrystals:0};s.settings??={};s.settings.minimapVisible??=true;s.settings.autoBattle??=true;s.records??={kills:0,captures:0,chests:0};s.monsters.forEach(m=>m.currentHp??=null);return s}
 save(){this.state.appVersion=APP_VERSION;localStorage.setItem(SAVE_KEY,JSON.stringify(this.state))}
 reset(){localStorage.removeItem(SAVE_KEY);this.state=initialState();this.save()}
}
