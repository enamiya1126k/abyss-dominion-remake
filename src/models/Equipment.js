import{EQUIPMENT_BASES,equipmentSeriesForItem,inferredEquipmentSubslot,normalizeEquipmentIdentity}from"../data/equipment.js?v=2.10.0-build159";
import{rollEquipmentAffixes,equipmentAffixPower}from"../data/equipmentAffixes.js?v=2.10.0-build159";

function uid(){return crypto.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`}
export function createEquipment(slot,options={}){
 const pool=EQUIPMENT_BASES[slot];
 const rarity=options.rarity??options.base?.nativeRarity??rollRarity();
 const native=pool.filter(entry=>entry.nativeRarity===rarity),base=options.base??(native.length&&Math.random()<.72?native[Math.floor(Math.random()*native.length)]:pool[Math.floor(Math.random()*pool.length)]);
 const mult={N:.8,R:1,SR:1.45,SSR:2.05,UR:2.5,LR:3,"神話":3.65,"深淵":4.4,"十神":5.25}[rarity]??1;
 const stats={};
 for(const[key,value]of Object.entries(base.stats)){const magnitude=Math.max(1,Math.round(Math.abs(value)*mult));stats[key]=Number(value)<0?-magnitude:magnitude}
 const ruleOverrides={...(options.ruleOverrides??{})};
 if(["armor","accessory"].includes(slot)&&!ruleOverrides.subslot)ruleOverrides.preferredSubslot=inferredEquipmentSubslot(base,slot);
 const item={
  id:uid(),slot,name:base.name,rarity,level:1,plus:0,stats,weaponType:options.weaponType??base.weaponType??null,handedness:options.handedness??base.handedness??(slot==="weapon"?"either":null),ruleOverrides:options.ruleOverrides??{},series:options.series??seriesForName(base.name),iconAtlas:options.iconAtlas??base.iconAtlas??slot,iconIndex:options.iconIndex??base.iconIndex??0,iconColumn:options.iconColumn??null,iconRow:options.iconRow??null,
  favorite:false,locked:false,equippedBy:null,exp:0,limitBreak:0,affixes:options.affixes??rollEquipmentAffixes(slot,rarity),createdAt:new Date().toISOString()
 };
 item.ruleOverrides=ruleOverrides;
 return normalizeEquipmentIdentity(item);
}
export function seriesForName(name){
 return equipmentSeriesForItem(name)
}
export function rollRarity(){
 const r=Math.random();
 if(r<.0002)return"神話";
 if(r<.002)return"LR";
 if(r<.01)return"UR";
 if(r<.05)return"SSR";
 if(r<.18)return"SR";
 if(r<.50)return"R";
 return"N";
}
export function equipmentStatMultiplier(item){
 const level=Math.max(1,Number(item.level??1));
 return(1+(item.plus??0)*.08)*(1+(level-1)*.025);
}
export function equipmentPower(item){
 return Object.values(item.stats).reduce((a,b)=>a+b,0)*equipmentStatMultiplier(item)+(item.plus??0)*3+(item.level??1)*2+equipmentAffixPower(item);
}
