/**
 * Boss reward packs deliberately grow in clear milestones instead of using
 * the monster's current level.  This keeps the reward predictable while the
 * EXP value inside each pack remains useful for any chosen character.
 */
export function bossExperiencePackAmount(floor){
 const value=Math.max(1,Math.floor(Number(floor)||1));
 if(value<=100)return 1;
 if(value<=500)return Math.min(20,1+Math.ceil((value-100)*19/400));
 if(value<=1000)return Math.min(120,20+Math.ceil((value-500)*100/500));
 return Math.min(300,120+Math.floor((value-1000)/25));
}

