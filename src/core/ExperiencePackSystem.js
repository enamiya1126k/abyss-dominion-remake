import{TRUE_MAX_LEVEL}from"./config.js?v=3.1.1-build311";
import{applyTotalExperience,experienceBeforeLevel,experienceCrystalValue,totalExperience}from"../models/Monster.js?v=3.1.1-build311";

function integer(value){return Math.max(0,Math.floor(Number(value)||0))}

export const EXPERIENCE_PACK_TYPES=Object.freeze({
 small:{id:"small",inventoryKey:"experienceItems",name:"経験値パック（小）",shortName:"小",levelSpan:1,unlockFloor:1,icon:"📘"},
 medium:{id:"medium",inventoryKey:"experienceItemsMedium",name:"経験値パック（中）",shortName:"中",levelSpan:3,unlockFloor:30,icon:"📗"},
 large:{id:"large",inventoryKey:"experienceItemsLarge",name:"経験値パック（大）",shortName:"大",levelSpan:6,unlockFloor:50,icon:"📙"},
 ultra:{id:"ultra",inventoryKey:"experienceItemsUltra",name:"経験値パック（超）",shortName:"超",levelSpan:10,unlockFloor:70,icon:"📕"}
});

export function experiencePackType(idOrKey="small"){
 return EXPERIENCE_PACK_TYPES[idOrKey]??Object.values(EXPERIENCE_PACK_TYPES).find(entry=>entry.inventoryKey===idOrKey)??EXPERIENCE_PACK_TYPES.small;
}
export function availableExperiencePackTypes(maxFloor=1){const floor=Math.max(1,Math.floor(Number(maxFloor)||1));return Object.values(EXPERIENCE_PACK_TYPES).filter(entry=>floor>=entry.unlockFloor)}

export function experiencePackCapacity(monster,owned=0){
 const available=integer(owned),remaining=Math.max(0,experienceBeforeLevel(monster,TRUE_MAX_LEVEL)-totalExperience(monster));
 return available&&remaining?available:0;
}

export function previewExperiencePacks(monster,requested,owned=0,tier="small"){
 const type=experiencePackType(tier),capacity=experiencePackCapacity(monster,owned),wanted=Math.min(capacity,integer(requested)),before=totalExperience(monster),maximum=experienceBeforeLevel(monster,TRUE_MAX_LEVEL),copy={...monster};
 let after=before,count=0;
 for(;count<wanted&&after<maximum;count++){
  const gain=Math.max(1,experienceCrystalValue(copy,type.id));
  after=Math.min(maximum,after+gain);
  applyTotalExperience(copy,after);
 }
 return{requested:integer(requested),type,count,capacity,gain:Math.max(0,after-before),before,after,totalBefore:before,totalAfter:after,levelBefore:monster.level,levelAfter:copy.level,expAfter:copy.exp,capped:after>=maximum};
}

export function consumeExperiencePacks(monster,requested,inventory,tier="small"){
 if(!monster||!inventory)return{ok:false,reason:"INVALID",count:0,gain:0};
 const type=experiencePackType(tier),plan=previewExperiencePacks(monster,requested,inventory[type.inventoryKey],type.id);
 if(!plan.count||!plan.gain)return{ok:false,reason:plan.capacity?"EMPTY_REQUEST":"LEVEL_CAP",...plan};
 applyTotalExperience(monster,plan.after);
 inventory[type.inventoryKey]=Math.max(0,integer(inventory[type.inventoryKey])-plan.count);
 return{ok:true,...plan};
}
