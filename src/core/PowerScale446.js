import{expandedPower445}from"./PowerScale445.js";

/** Presentation only: ease the lower range down and keep 100,000+ unchanged. */
export function displayPower446(legacyPower){
 const power=expandedPower445(legacyPower);
 if(!power||power>=100_000)return power;
 return Math.max(1,Math.round(power*power/100_000));
}
export function displayPartyPower446(party){
 return Math.min(Number.MAX_SAFE_INTEGER,(party??[]).reduce((sum,m)=>sum+displayPower446(m?.power),0));
}
