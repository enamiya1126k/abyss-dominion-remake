import{aggregateAffixes}from"../data/equipmentAffixes.js";
export function equipmentAffixesWithSeries(items,seriesEffects){
 const result=aggregateAffixes(items);
 const appliedAuthorities=new Set();
 for(const item of items??[]){
  // Two different weapon instances may share one authored authority. Their
  // normal stats/affixes both count, but the named fixed authority only fires
  // once so equipping a duplicate in both hands cannot double it.
  const authorityId=item?.floorBossWeaponEffectId??item?.signatureWeaponEffectId??null;
  if(authorityId&&appliedAuthorities.has(authorityId))continue;
  if(authorityId)appliedAuthorities.add(authorityId);
  for(const[key,value]of Object.entries(item.fixedEffects??{})){const amount=Number(value);if(Number.isFinite(amount))result[key]=(result[key]??0)+amount}
 }
 const addRate=(target,key=target)=>{
  const rate=Number(seriesEffects[key])||0;
  if(rate)result[target]=(result[target]??0)+rate*100;
 };
 for(const key of["fireDamage","healPower","guardPower","dropRate","critDamage","skillPower","freeSkillChance","chainChance","burnChance","execution"])addRate(key);
 addRate("captureRate","capture");
 addRate("regen","hpRegen");
 addRate("mpPct","mp");
 addRate("fireRes");
 addRate("statusResistance","statusRes");
 const mpCost=Number(seriesEffects.mpCost)||0;
 if(mpCost<0)result.mpCostReduction=(result.mpCostReduction??0)+Math.abs(mpCost)*100;
 return result;
}
