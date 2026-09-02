// A single boss reward option never exceeds roughly +10 N-standard levels.
// Milestones change the pack tier instead of inflating a fixed item's EXP.
export function bossExperiencePackReward(floor){
 const value=Math.max(1,Math.floor(Number(floor)||1));
 if(value<30)return{tier:"small",inventoryKey:"experienceItems",name:"経験値パック（小）",amount:value>=20?3:value>=10?2:1,levelSpan:1};
 if(value<50)return{tier:"medium",inventoryKey:"experienceItemsMedium",name:"経験値パック（中）",amount:2,levelSpan:3};
 if(value<70)return{tier:"large",inventoryKey:"experienceItemsLarge",name:"経験値パック（大）",amount:1,levelSpan:6};
 return{tier:"ultra",inventoryKey:"experienceItemsUltra",name:"経験値パック（超）",amount:1,levelSpan:10};
}
export function bossExperiencePackAmount(floor){return bossExperiencePackReward(floor).amount}
