import{displayPower446}from"./PowerScale446.js";

// Individual display rating only; battle stats and alliance effects are unchanged.
const heroIds=new Set(['myth_rion','myth_yori','myth_enami','myth_hide']);
export function displayPower447(legacyPower,source=null){
 const power=displayPower446(legacyPower);
 return power&&heroIds.has(source?.speciesId)?Math.max(1,Math.round(power*.65)):power;
}
export function displayPartyPower447(party){
 return Math.min(Number.MAX_SAFE_INTEGER,(party??[]).reduce((sum,m)=>sum+displayPower447(m?.power,m),0));
}
