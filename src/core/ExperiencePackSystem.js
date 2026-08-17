import{TRUE_MAX_LEVEL}from"./config.js?v=2.10.0-build161";
import{applyTotalExperience,experienceBeforeLevel,experienceCrystalValue,totalExperience}from"../models/Monster.js?v=2.10.0-build161";

function integer(value){return Math.max(0,Math.floor(Number(value)||0))}

export function experiencePackCapacity(monster,owned=0){
 const available=integer(owned),remaining=Math.max(0,experienceBeforeLevel(monster,TRUE_MAX_LEVEL)-totalExperience(monster));
 if(!available||!remaining)return 0;
 return Math.min(available,Math.max(1,Math.ceil(remaining/Math.max(1,experienceCrystalValue(monster)))));
}

export function previewExperiencePacks(monster,requested,owned=0){
 const capacity=experiencePackCapacity(monster,owned),count=Math.min(capacity,integer(requested)),before=totalExperience(monster),maximum=experienceBeforeLevel(monster,TRUE_MAX_LEVEL),after=Math.min(maximum,before+count*Math.max(1,experienceCrystalValue(monster))),copy={...monster};
 applyTotalExperience(copy,after);
 return{requested:integer(requested),count,capacity,gain:Math.max(0,after-before),before,after,levelBefore:monster.level,levelAfter:copy.level,expAfter:copy.exp,capped:after>=maximum};
}

export function consumeExperiencePacks(monster,requested,inventory){
 if(!monster||!inventory)return{ok:false,reason:"INVALID",count:0,gain:0};
 const plan=previewExperiencePacks(monster,requested,inventory.experienceItems);
 if(!plan.count||!plan.gain)return{ok:false,reason:plan.capacity?"EMPTY_REQUEST":"LEVEL_CAP",...plan};
 // 経験値反映と所持数減算を同じ同期処理で確定し、上限到達に不要な分は消費しない。
 applyTotalExperience(monster,plan.after);
 inventory.experienceItems=Math.max(0,integer(inventory.experienceItems)-plan.count);
 return{ok:true,...plan};
}
