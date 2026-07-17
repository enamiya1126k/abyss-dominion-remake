import{SAVE_KEY,APP_VERSION}from"../core/config.js";
import{createMonster}from"../models/Monster.js";

function initialState(){
  const monsters=[
    createMonster("slime",{nickname:"ぷるん",colorId:"green",personalityId:"bold"}),
    createMonster("goblin",{nickname:"グリム",colorId:"orange",personalityId:"swift"}),
    createMonster("fairy",{nickname:"ルナ",colorId:"cyan",personalityId:"calm"}),
    createMonster("dragon",{nickname:"炎帝",colorId:"red",personalityId:"brave"})
  ];
  return{
    schemaVersion:1,
    appVersion:APP_VERSION,
    player:{gold:1000,crystals:20,maxFloor:1},
    monsters,
    party:monsters.map(m=>m.id),
    equipment:[],
    inventory:{potions:3,captureCrystals:5},
    settings:{minimapVisible:true,autoBattle:true}
  };
}
export class SaveService{
  constructor(){
    this.state=this.load();
  }
  load(){
    try{
      const raw=localStorage.getItem(SAVE_KEY);
      if(!raw)return initialState();
      const parsed=JSON.parse(raw);
      return this.migrate(parsed);
    }catch(error){
      console.error("Save load failed",error);
      return initialState();
    }
  }
  migrate(state){
    state.schemaVersion??=1;
    state.appVersion=APP_VERSION;
    state.monsters??=[];
    state.party??=[];
    state.equipment??=[];
    state.inventory??={potions:0,captureCrystals:0};
    state.settings??={minimapVisible:true,autoBattle:true};
    return state;
  }
  save(){
    this.state.appVersion=APP_VERSION;
    localStorage.setItem(SAVE_KEY,JSON.stringify(this.state));
  }
  reset(){
    localStorage.removeItem(SAVE_KEY);
    this.state=initialState();
    this.save();
  }
}
