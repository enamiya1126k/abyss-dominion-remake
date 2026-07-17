import{EQUIPMENT_BASES}from"../data/equipment.js";

function uid(){return crypto.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`}
export function createEquipment(slot,options={}){
 const pool=EQUIPMENT_BASES[slot];
 const base=options.base??pool[Math.floor(Math.random()*pool.length)];
 const rarity=options.rarity??rollRarity();
 const mult={N:.8,R:1,SR:1.45,SSR:2.05,LR:3}[rarity];
 const stats={};
 for(const[key,value]of Object.entries(base.stats))stats[key]=Math.max(1,Math.round(value*mult));
 return{
  id:uid(),slot,name:base.name,rarity,level:1,plus:0,stats,
  favorite:false,locked:false,equippedBy:null,createdAt:new Date().toISOString()
 };
}
export function rollRarity(){
 const r=Math.random();
 if(r<.01)return"LR";
 if(r<.07)return"SSR";
 if(r<.27)return"SR";
 if(r<.82)return"R";
 return"N";
}
export function equipmentPower(item){
 return Object.values(item.stats).reduce((a,b)=>a+b,0)+item.plus*3+item.level;
}
