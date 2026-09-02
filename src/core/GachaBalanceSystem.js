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
// The largest ordinary pools contain several dozen entries.  Keeping enough
// draws to reconstruct the active shuffle-bag prevents short histories from
// reintroducing the same few results after every save/load cycle.
export const GACHA_HISTORY_ENTRY_LIMIT=160;
const HISTORY_KEY_LIMIT=120;

export const GACHA_PITY_LIMITS=Object.freeze({urPlus:50,lrPlus:150,mythic:300});
const SUMMON_RARITY_ORDER=Object.freeze({N:0,R:1,SR:2,SSR:3,UR:4,LR:5,"神話":6});

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
  const entries=rawEntries.map(value=>String(value).slice(0,HISTORY_KEY_LIMIT)).filter(Boolean).slice(-GACHA_HISTORY_ENTRY_LIMIT);
  if(entries.length)result[pool]=entries;
 }
 return result;
}

export function selectBalancedGachaEntry(entries,{random=Math.random,recentKeys=[],keyOf=entry=>entry?.id??entry?.name??entry,maxConsecutive=2}={}){
 const pool=Array.isArray(entries)?entries.filter(entry=>entry!==null&&entry!==undefined):[];
 if(!pool.length)return null;
 const keyed=pool.map(entry=>({entry,key:String(keyOf(entry))})),availableKeys=new Set(keyed.map(value=>value.key));
 const recent=Array.isArray(recentKeys)?recentKeys.map(String).filter(key=>availableKeys.has(key)):[];
 const last=recent.at(-1),run=last?recent.slice().reverse().findIndex(key=>key!==last):-1;
 const consecutive=last?(run<0?recent.length:run):0;
 // Reconstruct the current bag from the saved history.  A duplicate or a full
 // set marks a bag boundary, which also lets legacy random histories recover
 // without a migration.  Within a bag every key appears once at most.
 const bagSeen=new Set();
 for(const key of recent){
  if(bagSeen.size>=availableKeys.size||bagSeen.has(key))bagSeen.clear();
  bagSeen.add(key);
 }
 let candidates=keyed.filter(value=>!bagSeen.has(value.key));
 if(!candidates.length)candidates=keyed.filter(value=>pool.length<=1||value.key!==last);
 if(consecutive>=Math.max(1,Math.floor(Number(maxConsecutive)||2))&&candidates.length>1)candidates=candidates.filter(value=>value.key!==last);
 if(!candidates.length)candidates=keyed;
 return candidates[Math.floor(safeRoll(random)*candidates.length)]?.entry??candidates.at(-1)?.entry??null;
}

export function recordGachaDraw(history,poolKey,itemKey){
 const normalized=normalizeGachaDrawHistory(history),pool=String(poolKey??"").slice(0,HISTORY_KEY_LIMIT),item=String(itemKey??"").slice(0,HISTORY_KEY_LIMIT);
 if(!pool||!item)return normalized;
 normalized[pool]=[...(normalized[pool]??[]),item].slice(-GACHA_HISTORY_ENTRY_LIMIT);
 const entries=Object.entries(normalized).slice(-HISTORY_POOL_LIMIT);
 return Object.fromEntries(entries);
}

function pityCount(value,limit){
 const number=Math.floor(Number(value)||0);
 return Math.max(0,Math.min(Math.max(0,limit-1),number));
}

/** Normalizes persisted paid-draw pity without requiring a save migration. */
export function normalizeGachaPityState(source){
 const value=source&&typeof source==="object"&&!Array.isArray(source)?source:{};
 return{
  urPlus:pityCount(value.urPlus??value.ur,GACHA_PITY_LIMITS.urPlus),
  lrPlus:pityCount(value.lrPlus??value.lr,GACHA_PITY_LIMITS.lrPlus),
  mythic:pityCount(value.mythic??value["神話"],GACHA_PITY_LIMITS.mythic)
 };
}

/** Returns the rarity forced on the next paid draw, or null before a ceiling. */
export function gachaPityForcedRarity(source){
 const pity=normalizeGachaPityState(source);
 if(pity.mythic>=GACHA_PITY_LIMITS.mythic-1)return"神話";
 if(pity.lrPlus>=GACHA_PITY_LIMITS.lrPlus-1)return"LR";
 if(pity.urPlus>=GACHA_PITY_LIMITS.urPlus-1)return"UR";
 return null;
}

/** Advances all three ceilings after a paid rarity result. */
export function recordGachaPityDraw(source,rarity){
 const pity=normalizeGachaPityState(source),rank=SUMMON_RARITY_ORDER[rarity]??-1;
 pity.urPlus=rank>=SUMMON_RARITY_ORDER.UR?0:pity.urPlus+1;
 pity.lrPlus=rank>=SUMMON_RARITY_ORDER.LR?0:pity.lrPlus+1;
 pity.mythic=rank>=SUMMON_RARITY_ORDER["神話"]?0:pity.mythic+1;
 return normalizeGachaPityState(pity);
}

/**
 * Optional ceiling-aware wrapper.  Existing callers can keep using
 * rollSummonRarity(); paid banners can persist the returned `pity` object.
 */
export function rollSummonRarityWithPity(mode="normal",source={},random=Math.random){
 const forcedRarity=gachaPityForcedRarity(source),rarity=forcedRarity??rollSummonRarity(mode,random);
 return{rarity,forced:Boolean(forcedRarity),forcedRarity,pity:recordGachaPityDraw(source,rarity)};
}
