import{EQUIPMENT_BASES}from"../data/equipment.js?v=0.9.15-alpha.10-affix";
import{rollEquipmentAffixes,equipmentAffixPower}from"../data/equipmentAffixes.js?v=0.9.15-alpha.10-affix";

function uid(){return crypto.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`}
export function createEquipment(slot,options={}){
 const pool=EQUIPMENT_BASES[slot];
 const base=options.base??pool[Math.floor(Math.random()*pool.length)];
 const rarity=options.rarity??rollRarity();
 const mult={N:.8,R:1,SR:1.45,SSR:2.05,LR:3}[rarity];
 const stats={};
 for(const[key,value]of Object.entries(base.stats))stats[key]=Math.max(1,Math.round(value*mult));
 return{
  id:uid(),slot,name:base.name,rarity,level:1,plus:0,stats,handedness:options.handedness??base.handedness??(slot==="weapon"?"either":null),ruleOverrides:options.ruleOverrides??{},series:options.series??seriesForName(base.name),
  favorite:false,locked:false,equippedBy:null,exp:0,limitBreak:0,affixes:options.affixes??rollEquipmentAffixes(slot,rarity),createdAt:new Date().toISOString()
 };
}
export function seriesForName(name){
 if(/炎|竜鱗/.test(name))return"flame";
 if(/守護者|革鎧|鉄の剣/.test(name))return"guardian";
 if(/旅人|幸運/.test(name))return"traveler";
 if(/捕獲師/.test(name))return"capturer";
 return null
}
export function rollRarity(){
 const r=Math.random();
 if(r<.01)return"LR";
 if(r<.07)return"SSR";
 if(r<.27)return"SR";
 if(r<.82)return"R";
 return"N";
}
export function equipmentStatMultiplier(item){
 const level=Math.max(1,Number(item.level??1));
 return(1+(item.plus??0)*.08)*(1+(level-1)*.025);
}
export function equipmentPower(item){
 return Object.values(item.stats).reduce((a,b)=>a+b,0)*equipmentStatMultiplier(item)+(item.plus??0)*3+(item.level??1)*2+equipmentAffixPower(item);
}
