/** Presentation scale only. Keep v4 scores on persisted ranking/wire records. */
export function expandedPower445(value){
 const n=Number(value);if(!Number.isFinite(n)||n<=0)return 0;
 return Math.min(Number.MAX_SAFE_INTEGER,Math.max(1,Math.round(n*n/100)));
}
export function expandedPartyPower445(party){return Math.min(Number.MAX_SAFE_INTEGER,(party??[]).reduce((sum,m)=>sum+expandedPower445(m?.power),0));}
