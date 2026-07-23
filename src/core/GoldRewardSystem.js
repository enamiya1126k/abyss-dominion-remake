import{abyssGoldReward}from"./AbyssSkillTreeSystem.js?v=0.9.15-alpha.95.1-stability-audit";

export function partyEquipmentAffixTotal(state,affixId,cap=300){
 const monstersById=new Map((state.monsters??[]).map(monster=>[monster.id,monster]));
 const total=(state.party??[]).reduce((sum,id)=>{
  const monster=monstersById.get(id);
  return sum+Math.max(0,Number(monster?._equipmentAffixes?.[affixId])||0);
 },0);
 return Math.max(0,Math.min(cap,total));
}

export function modifiedGoldReward(state,amount,source="generic"){
 const abyssAdjusted=abyssGoldReward(state,amount,source);
 const equipmentRate=partyEquipmentAffixTotal(state,"goldGain")/100;
 return Math.max(0,Math.round(abyssAdjusted*(1+equipmentRate)));
}
