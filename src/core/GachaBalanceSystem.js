export const NORMAL_SUMMON_RATES=Object.freeze({
 "神話":.0012,
 LR:.0018,
 UR:.008,
 SSR:.04,
 SR:.13,
 R:.32,
 N:.499
});

export const GUARANTEED_SUMMON_RATES=Object.freeze({
 "神話":.002,
 LR:.018,
 UR:.06,
 SSR:.22,
 SR:.70
});

const HISTORY_POOL_LIMIT=64;
const HISTORY_ENTRY_LIMIT=4;
const HISTORY_KEY_LIMIT=120;

function safeRoll(random=Math.random){
 const value=Number(typeof random==="function"?random():0);
 if(!Number.isFinite(value))return 0;
 return Math.max(0,Math.min(.999999999999,value));
}

export function rollSummonRarity(mode="normal",random=Math.random){
 const rates=mode==="guaranteed"?GUARANTEED_SUMMON_RATES:NORMAL_SUMMON_RATES;
 let cursor=safeRoll(random);
 for(const[rarity,rate]of Object.entries(rates)){
  if(cursor<rate)return rarity;
  cursor-=rate;
 }
 return Object.keys(rates).at(-1)??"N";
}

export function normalizeGachaDrawHistory(source){
 if(!source||typeof source!=="object"||Array.isArray(source))return{};
 const result={};
 for(const[rawPool,rawEntries]of Object.entries(source).slice(-HISTORY_POOL_LIMIT)){
  const pool=String(rawPool).slice(0,HISTORY_KEY_LIMIT);
  if(!pool||!Array.isArray(rawEntries))continue;
  const entries=rawEntries.map(value=>String(value).slice(0,HISTORY_KEY_LIMIT)).filter(Boolean).slice(-HISTORY_ENTRY_LIMIT);
  if(entries.length)result[pool]=entries;
 }
 return result;
}

export function selectBalancedGachaEntry(entries,{random=Math.random,recentKeys=[],keyOf=entry=>entry?.id??entry?.name??entry,maxConsecutive=2}={}){
 const pool=Array.isArray(entries)?entries.filter(entry=>entry!==null&&entry!==undefined):[];
 if(!pool.length)return null;
 const recent=Array.isArray(recentKeys)?recentKeys.map(String):[];
 const last=recent.at(-1),run=last?recent.slice().reverse().findIndex(key=>key!==last):-1;
 const consecutive=last?(run<0?recent.length:run):0;
 const candidates=consecutive>=Math.max(1,Math.floor(Number(maxConsecutive)||2))&&pool.length>1
  ?pool.filter(entry=>String(keyOf(entry))!==last)
  :pool;
 return candidates[Math.floor(safeRoll(random)*candidates.length)]??candidates.at(-1)??null;
}

export function recordGachaDraw(history,poolKey,itemKey){
 const normalized=normalizeGachaDrawHistory(history),pool=String(poolKey??"").slice(0,HISTORY_KEY_LIMIT),item=String(itemKey??"").slice(0,HISTORY_KEY_LIMIT);
 if(!pool||!item)return normalized;
 normalized[pool]=[...(normalized[pool]??[]),item].slice(-HISTORY_ENTRY_LIMIT);
 const entries=Object.entries(normalized).slice(-HISTORY_POOL_LIMIT);
 return Object.fromEntries(entries);
}
