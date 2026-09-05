import{goldForClearedFloor}from"./GoldEconomySystem.js?v=2.11.2-build166";

export const CAMPAIGN_BOSS_REWARD_VERSION=1;

/**
 * Boss-class multipliers for the first treasure chest belonging to one boss.
 *
 * The normal amount is already substantially larger than an ordinary battle
 * payout. Abyss and Ten-God victories then remain visibly more valuable
 * without changing the ordinary battle economy.
 */
export const CAMPAIGN_BOSS_REWARD_TIERS=Object.freeze({
 normal:Object.freeze({id:"normal",label:"階層支配者",goldMultiplier:1,crystalMultiplier:1,crystalBonus:0}),
 abyss:Object.freeze({id:"abyss",label:"深淵",goldMultiplier:1.35,crystalMultiplier:1.35,crystalBonus:10}),
 tenGod:Object.freeze({id:"tenGod",label:"十神",goldMultiplier:1.75,crystalMultiplier:1.75,crystalBonus:25})
});

const CAMPAIGN_FLOOR_MAX=100;
const MAX_BOSS_ID_LENGTH=100;

function campaignFloor(value){
 const number=Number(value);
 return Math.max(1,Math.min(CAMPAIGN_FLOOR_MAX,Math.floor(Number.isFinite(number)?number:1)))
}

function cleanBossId(value){
 return String(value??"").replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,MAX_BOSS_ID_LENGTH)
}

function bossIdFrom(value){
 if(typeof value==="string")return cleanBossId(value);
 return cleanBossId(value?.bossId??value?.endgameBossId??value?.floorBossCatalogId??value?.id)
}

function factionFrom(value){
 return typeof value==="object"&&value?String(value.faction??value.endgameFaction??""):""
}

function roundedGold(value){
 const finite=Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Number(value)||0));
 return Math.min(Number.MAX_SAFE_INTEGER,Math.ceil(finite/1000)*1000)
}

function baseGoldForFloor(floor){
 // Campaign floors map to the old ten-floor economy depth. The linear term
 // keeps early bosses rewarding; the economy anchor keeps later floors
 // proportional to existing GOLD costs instead of using an unrelated curve.
 const economyAnchor=goldForClearedFloor(floor*10)*6;
 return Math.max(20_000+floor*7_500,economyAnchor)
}

function baseCrystalsForFloor(floor){return 30+floor*2}

/**
 * Classifies one campaign boss without relying on its display name.
 * Explicit faction metadata wins; canonical ID prefixes provide a safe
 * fallback for restored saves and server reward messages.
 *
 * @param {string|object} boss Boss ID or boss profile.
 * @returns {"normal"|"abyss"|"tenGod"}
 */
export function campaignBossRewardTier(boss){
 const id=bossIdFrom(boss),faction=factionFrom(boss);
 if(faction==="tenGod"||id.startsWith("ten_"))return"tenGod";
 if(faction==="abyss"||id.startsWith("abyss_"))return"abyss";
 return"normal"
}

/**
 * Stable receipt key for a boss's first treasure chest on one campaign floor.
 * The caller must persist this key atomically with the granted currencies.
 * That makes the three, three and four separate Ten-God chests on floors 80,
 * 90 and 100 individually claimable while preventing reload/tap duplication.
 *
 * @param {{floor:number,bossId:string|object}} input
 * @returns {string|null}
 */
export function campaignBossRewardClaimKey({floor,bossId}={}){
 const id=bossIdFrom(bossId);
 return id?`campaign-boss-chest:v${CAMPAIGN_BOSS_REWARD_VERSION}:${campaignFloor(floor)}:${id}`:null
}

/**
 * Calculates the deterministic first-chest currency reward for exactly one
 * campaign boss. No randomness or mutable save state is consulted.
 *
 * @param {{floor:number,bossId:string|object,faction?:string}} input
 * @returns {{version:number,claimKey:string,floor:number,bossId:string,tier:"normal"|"abyss"|"tenGod",tierLabel:string,gold:number,crystals:number}|null}
 */
export function campaignBossChestReward({floor,bossId,faction=null}={}){
 const current=campaignFloor(floor),id=bossIdFrom(bossId);
 if(!id)return null;
 const profile=typeof bossId==="object"&&bossId?{...bossId,id,faction:faction??factionFrom(bossId)}:{id,faction},tier=campaignBossRewardTier(profile),rules=CAMPAIGN_BOSS_REWARD_TIERS[tier],claimKey=campaignBossRewardClaimKey({floor:current,bossId:id});
 const gold=roundedGold(baseGoldForFloor(current)*rules.goldMultiplier),crystals=Math.max(1,Math.round(baseCrystalsForFloor(current)*rules.crystalMultiplier+rules.crystalBonus));
 return Object.freeze({version:CAMPAIGN_BOSS_REWARD_VERSION,claimKey,floor:current,bossId:id,tier,tierLabel:rules.label,gold,crystals})
}

function claimedSet(value){
 if(value instanceof Set)return new Set([...value].map(String));
 if(Array.isArray(value))return new Set(value.map(String));
 if(value&&typeof value==="object")return new Set(Object.entries(value).filter(([,claimed])=>Boolean(claimed)).map(([key])=>key));
 return new Set()
}

/**
 * Returns each unique boss reward at most once and omits already persisted
 * receipt keys. This helper does not mutate the claim collection or grant
 * currency; settlement remains the caller's atomic responsibility.
 *
 * @param {{floor:number,bosses:Array<string|object>,claimedRewardKeys?:Set<string>|string[]|Record<string,boolean>}} input
 * @returns {Array<ReturnType<typeof campaignBossChestReward>>}
 */
export function campaignBossChestRewardsForFloor({floor,bosses=[],claimedRewardKeys=[]}={}){
 const claimed=claimedSet(claimedRewardKeys),seenBosses=new Set(),result=[];
 for(const boss of Array.isArray(bosses)?bosses:[]){
  const id=bossIdFrom(boss);if(!id||seenBosses.has(id))continue;seenBosses.add(id);
  const reward=campaignBossChestReward({floor,bossId:boss,faction:factionFrom(boss)});
  if(reward&&!claimed.has(reward.claimKey))result.push(reward)
 }
 return result
}
