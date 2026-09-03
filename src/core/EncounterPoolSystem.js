import{ATTRIBUTE_RELATIONS,canonicalAttribute}from"../data/attributes.js?v=3.0.9-build309";

export const BIOME_ENCOUNTER_RATES=Object.freeze({theme:.8,adjacent:.15,exception:.05});

export const STANDARD_RARITY_WEIGHTS=Object.freeze({N:18,R:12,SR:7,SSR:4,UR:2,LR:1});
export const STANDARD_RARITY_RATES=Object.freeze({N:18/44,R:12/44,SR:7/44,SSR:4/44,UR:2/44,LR:1/44});
export const HIGH_RARITY_ENCOUNTERS=Object.freeze(["SSR","UR","LR"]);
export const ENCOUNTER_ROTATION_VERSION=1;
export const ENCOUNTER_RECENT_WINDOW=5;
export const ENCOUNTER_RARE_PITY=Object.freeze({softStart:10,hardLimit:18,maxSoftChance:.56});
export const CAMPAIGN_RARITY_UNLOCK_FLOORS=Object.freeze({N:1,R:1,SR:4,SSR:10,UR:31,LR:61});
export const ENCOUNTER_ATTRIBUTE_AFFINITIES=Object.freeze({
 neutral:Object.freeze(["fire","water","lightning","earth","wind","ice","light","dark"]),
 fire:Object.freeze(["fire","earth","dark","lightning"]),
 water:Object.freeze(["water","ice","wind","earth"]),
 lightning:Object.freeze(["lightning","wind","light","fire"]),
 earth:Object.freeze(["earth","fire","dark","water"]),
 wind:Object.freeze(["wind","light","water","earth"]),
 ice:Object.freeze(["ice","water","wind","light"]),
 light:Object.freeze(["light","lightning","wind","dark"]),
 dark:Object.freeze(["dark","earth","ice","light"]),
 // Species data is canonicalized to the nine combat attributes.  Poison and
 // nature rooms keep their own visual identity while drawing from deliberate
 // combat-attribute families instead of collapsing to a single monster.
 poison:Object.freeze(["dark","earth","water","ice"]),
 nature:Object.freeze(["wind","earth","light","ice"])
});
const STANDARD_RARITY_ORDER=Object.freeze(["N","R","SR","SSR","UR","LR"]);
const EXCEPTION_RARITY_WEIGHTS=Object.freeze({N:1,R:2,SR:4,SSR:8,UR:12,LR:16});
const EXCEPTION_RARITIES=new Set(["SR","SSR","UR","LR"]);
const HIGH_RARITY_SET=new Set(HIGH_RARITY_ENCOUNTERS);

function uniqueSpecies(list){
 const ids=new Set(),names=new Set();
 return list.filter(species=>{
  if(!species?.id||ids.has(species.id))return false;
  const name=String(species.name??species.id).trim();
  if(name&&names.has(name))return false;
  ids.add(species.id);if(name)names.add(name);return true
 });
}

function sourceValues(source){return Array.isArray(source)?source:Object.values(source??{})}

export function eligibleEncounterSpecies(source,floor){
 const f=Math.max(1,Math.floor(Number(floor)||1));
 return sourceValues(source).filter(species=>species?.fieldEncounter!==false&&!species?.ultraRareEncounter&&!species?.isAbyss&&!species?.isTenGod&&!['深淵','十神'].includes(species?.rarity)&&(species?.minFloor??1)<=f).sort((a,b)=>(a.minFloor??1)-(b.minFloor??1));
}

export function campaignEncounterUnlockFloor(species){
 const legacyFloor=Math.max(1,Math.floor(Number(species?.minFloor)||1)),rarityGate=CAMPAIGN_RARITY_UNLOCK_FLOORS[species?.rarity]??1;
 return Math.max(rarityGate,Math.ceil(legacyFloor/100))
}

export function eligibleCampaignEncounterSpecies(source,floor){
 const f=Math.max(1,Math.min(100,Math.floor(Number(floor)||1)));
 return sourceValues(source).filter(species=>species?.fieldEncounter!==false&&!species?.ultraRareEncounter&&!species?.isAbyss&&!species?.isTenGod&&!['深淵','十神'].includes(species?.rarity)&&campaignEncounterUnlockFloor(species)<=f).sort((a,b)=>campaignEncounterUnlockFloor(a)-campaignEncounterUnlockFloor(b)||(a.minFloor??1)-(b.minFloor??1))
}

export function localEncounterCandidates(unlocked,floor){
 const list=Array.isArray(unlocked)?unlocked:[],f=Math.max(1,Math.floor(Number(floor)||1));
 if(!list.length)return[];
 const nearby=list.filter(species=>(species.minFloor??1)>=Math.max(1,f-300));
 return nearby.length>=8?nearby:list.slice(-24);
}

function localCampaignEncounterCandidates(unlocked,floor){
 const list=Array.isArray(unlocked)?unlocked:[],f=Math.max(1,Math.min(100,Math.floor(Number(floor)||1)));
 if(!list.length)return[];
 const nearby=list.filter(species=>campaignEncounterUnlockFloor(species)>=Math.max(1,f-30));
 return nearby.length>=8?nearby:list.slice(-32)
}

function encounterAttributeId(attribute){
 const raw=String(attribute??"neutral").toLowerCase();
 return raw==="poison"||raw==="nature"?raw:canonicalAttribute(raw,`encounter-room:${raw}`)
}

export function encounterAttributeAffinity(attribute){
 const id=encounterAttributeId(attribute);
 return Object.freeze({id,elements:ENCOUNTER_ATTRIBUTE_AFFINITIES[id]??ENCOUNTER_ATTRIBUTE_AFFINITIES.neutral})
}

function scopedAttributeBucket(unlocked,local,elements,{minimum=8,limit=28}={}){
 const accepted=new Set(elements),belongs=species=>accepted.has(canonicalAttribute(species?.element,species?.id));
 return expandedBucket(local,unlocked,belongs,{minimum,limit})
}

/*
 * A campaign room is allowed to prefer its own element without becoming a
 * one-species room.  Each attribute has a reviewed family: the first element
 * is the primary pool, the remaining elements are compatible support pools.
 * The global pool remains a final safety net for very early floors.
 */
export function encounterCandidatesForAttribute(source,floor,attribute,{campaign=false}={}){
 const unlocked=campaign?eligibleCampaignEncounterSpecies(source,floor):eligibleEncounterSpecies(source,floor),local=campaign?localCampaignEncounterCandidates(unlocked,floor):localEncounterCandidates(unlocked,floor),affinity=encounterAttributeAffinity(attribute),primaryElements=affinity.id==="neutral"?affinity.elements:[affinity.elements[0]],supportElements=affinity.id==="neutral"?[]:affinity.elements.slice(1);
 const primary=scopedAttributeBucket(unlocked,local,primaryElements,{minimum:8,limit:32});
 const support=scopedAttributeBucket(unlocked,local,supportElements,{minimum:8,limit:32});
 const all=uniqueSpecies([...primary,...support,...local,...unlocked.slice(-32)]);
 return Object.freeze({attribute:affinity.id,affinity:affinity.elements,unlocked:Object.freeze(unlocked),primary:Object.freeze(primary),support:Object.freeze(support),all:Object.freeze(all)})
}

export function isHighRarityEncounter(species){return HIGH_RARITY_SET.has(species?.rarity)}

export function normalizeEncounterHistory(value){
 const source=value&&typeof value==="object"&&!Array.isArray(value)?value:{},clean=value=>String(value??"").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,120),recentIds=[...new Set((Array.isArray(source.recentSpeciesIds)?source.recentSpeciesIds:[]).map(clean).filter(Boolean))].slice(-ENCOUNTER_RECENT_WINDOW),recentNames=[...new Set((Array.isArray(source.recentSpeciesNames)?source.recentSpeciesNames:[]).map(clean).filter(Boolean))].slice(-ENCOUNTER_RECENT_WINDOW),count=(entry,max=Number.MAX_SAFE_INTEGER)=>{const number=Number(entry);return Number.isFinite(number)?Math.max(0,Math.min(max,Math.floor(number))):0};
 return{version:ENCOUNTER_ROTATION_VERSION,missesSinceHighRare:count(source.missesSinceHighRare,ENCOUNTER_RARE_PITY.hardLimit),recentSpeciesIds:recentIds,recentSpeciesNames:recentNames,totalEncounters:count(source.totalEncounters),highRareEncounters:count(source.highRareEncounters)}
}

export function encounterRarePityChance(history){
 const misses=normalizeEncounterHistory(history).missesSinceHighRare;
 if(misses>=ENCOUNTER_RARE_PITY.hardLimit)return 1;
 if(misses<ENCOUNTER_RARE_PITY.softStart)return 0;
 const steps=ENCOUNTER_RARE_PITY.hardLimit-ENCOUNTER_RARE_PITY.softStart;
 return Math.min(ENCOUNTER_RARE_PITY.maxSoftChance,(misses-ENCOUNTER_RARE_PITY.softStart+1)/Math.max(1,steps)*ENCOUNTER_RARE_PITY.maxSoftChance)
}

export function recordEncounterHistory(history,species){
 const next=normalizeEncounterHistory(history),entries=uniqueSpecies(Array.isArray(species)?species:[species]),highRare=entries.some(isHighRarityEncounter);
 next.totalEncounters=Math.min(Number.MAX_SAFE_INTEGER,next.totalEncounters+1);
 next.highRareEncounters=Math.min(Number.MAX_SAFE_INTEGER,next.highRareEncounters+(highRare?1:0));
 next.missesSinceHighRare=highRare?0:Math.min(ENCOUNTER_RARE_PITY.hardLimit,next.missesSinceHighRare+1);
 for(const entry of entries){const id=String(entry?.id??"").slice(0,120),name=String(entry?.name??id).slice(0,120);next.recentSpeciesIds=[...next.recentSpeciesIds.filter(value=>value!==id),id].filter(Boolean).slice(-ENCOUNTER_RECENT_WINDOW);next.recentSpeciesNames=[...next.recentSpeciesNames.filter(value=>value!==name),name].filter(Boolean).slice(-ENCOUNTER_RECENT_WINDOW)}
 return next
}

export function biomeAttributeGroups(biome){
 const theme=[...new Set((biome?.elements??[]).map((element,index)=>canonicalAttribute(element,`${biome?.id??"biome"}:${index}`)))];
 const themed=new Set(theme.length?theme:["neutral"]),adjacent=new Set();
 themed.forEach(element=>{
  const relation=ATTRIBUTE_RELATIONS[element]??ATTRIBUTE_RELATIONS.neutral;
  [...relation.strong,...relation.weak].forEach(candidate=>{if(!themed.has(candidate))adjacent.add(candidate)});
 });
 return Object.freeze({theme:Object.freeze([...themed]),adjacent:Object.freeze([...adjacent])});
}

export function encounterElementBucket(element,groups){
 const canonical=canonicalAttribute(element,element);
 if(groups.theme.includes(canonical))return"theme";
 if(groups.adjacent.includes(canonical))return"adjacent";
 return"exception";
}

function expandedBucket(local,unlocked,predicate,{minimum=1,limit=24}={}){
 const localMatches=local.filter(predicate);
 const allMatches=unlocked.filter(predicate);
 // 最近の敵を主役にしつつ、解禁済みの各ランクを最低1体ずつ残す。
 // これで高階層でも低ランクが候補から消えず、固定比率を維持できる。
 const anchors=STANDARD_RARITY_ORDER.map(rarity=>allMatches.findLast(species=>species.rarity===rarity)).filter(Boolean);
 if(localMatches.length>=minimum)return uniqueSpecies([...anchors,...localMatches]);
 return uniqueSpecies([...anchors,...allMatches.slice(-limit),...localMatches]);
}

function isRareException(species){return species?.id==="mimic"||EXCEPTION_RARITIES.has(species?.rarity)}

export function encounterPoolsForFloor(source,floor,biome){
 const unlocked=eligibleEncounterSpecies(source,floor),local=localEncounterCandidates(unlocked,floor),groups=biomeAttributeGroups(biome);
 const belongs=bucket=>species=>encounterElementBucket(species.element,groups)===bucket;
 const theme=expandedBucket(local,unlocked,belongs("theme"),{minimum:8,limit:24});
 const adjacent=expandedBucket(local,unlocked,belongs("adjacent"),{minimum:4,limit:18});
 let exception=expandedBucket(local,unlocked,species=>belongs("exception")(species)&&isRareException(species),{minimum:4,limit:16});
 if(!exception.length)exception=expandedBucket(local,unlocked,belongs("exception"),{minimum:2,limit:12});
 return Object.freeze({unlocked:Object.freeze(unlocked),local:Object.freeze(local),theme:Object.freeze(theme),adjacent:Object.freeze(adjacent),exception:Object.freeze(exception),groups});
}

export function encounterBucketForRoll(roll){
 const value=Math.max(0,Math.min(.999999,Number(roll)||0));
 if(value<BIOME_ENCOUNTER_RATES.theme)return"theme";
 if(value<.95)return"adjacent";
 return"exception";
}

function weightedExceptionSpecies(pool,roll){
 if(!pool.length)return null;
 const total=pool.reduce((sum,species)=>sum+(EXCEPTION_RARITY_WEIGHTS[species.rarity]??1),0);
 let cursor=Math.max(0,Math.min(.999999,Number(roll)||0))*Math.max(1,total);
 for(const species of pool){cursor-=EXCEPTION_RARITY_WEIGHTS[species.rarity]??1;if(cursor<0)return species}
 return pool.at(-1)??null;
}

/*
 * 通常枠は「個体ごと」に重みを掛けない。まずランクを固定比率で選び、
 * そのランク内だけを均等抽選するため、同属性へキャラを追加しても
 * N/R/SR/SSR/UR/LR の出現比率が崩れない。
 */
export function weightedStandardSpecies(pool,roll){
 if(!pool.length)return null;
 const groups=new Map(STANDARD_RARITY_ORDER.map(rarity=>[rarity,pool.filter(species=>species.rarity===rarity)]));
 const available=STANDARD_RARITY_ORDER.filter(rarity=>groups.get(rarity).length);
 if(!available.length)return pool[Math.floor(Math.max(0,Math.min(.999999,Number(roll)||0))*pool.length)]??pool.at(-1)??null;
 const total=available.reduce((sum,rarity)=>sum+STANDARD_RARITY_WEIGHTS[rarity],0);
 let cursor=Math.max(0,Math.min(.999999,Number(roll)||0))*total;
 for(const rarity of available){
  const weight=STANDARD_RARITY_WEIGHTS[rarity];
  if(cursor<weight){
   const group=groups.get(rarity),within=cursor/weight;
   return group[Math.min(group.length-1,Math.floor(within*group.length))]??group[0];
  }
  cursor-=weight;
 }
 return groups.get(available.at(-1)).at(-1)??pool.at(-1)??null;
}

function withoutSpecies(pool,ids,names){
 return uniqueSpecies(pool).filter(species=>!ids.has(species.id)&&!names.has(String(species.name??species.id)))
}

function attributeBucketOrder(requested){
 return requested==="primary"?["primary","support","all"]:requested==="support"?["support","primary","all"]:["all","primary","support"]
}

function requestedAttributeBucket(roll,hasPrimary,hasSupport){
 if(!hasPrimary)return hasSupport?"support":"all";
 if(!hasSupport)return"primary";
 const value=Math.max(0,Math.min(.999999,Number(roll)||0));
 if(value<.72)return"primary";
 if(value<.95)return"support";
 return"all"
}

export function rollAttributeEncounter(source,floor,attribute,{history=null,rng=Math.random,excludeIds=[],excludeNames=[],campaign=false,pityEligible=true,recordHistory=true}={}){
 const pools=encounterCandidatesForAttribute(source,floor,attribute,{campaign}),prior=normalizeEncounterHistory(history),groupIds=new Set((Array.isArray(excludeIds)?excludeIds:[]).map(String)),groupNames=new Set((Array.isArray(excludeNames)?excludeNames:[]).map(String)),recentIds=new Set(prior.recentSpeciesIds),recentNames=new Set(prior.recentSpeciesNames),strictIds=new Set([...groupIds,...recentIds]),strictNames=new Set([...groupNames,...recentNames]);
 const strict={primary:withoutSpecies(pools.primary,strictIds,strictNames),support:withoutSpecies(pools.support,strictIds,strictNames),all:withoutSpecies(pools.all,strictIds,strictNames)},groupOnly={primary:withoutSpecies(pools.primary,groupIds,groupNames),support:withoutSpecies(pools.support,groupIds,groupNames),all:withoutSpecies(pools.all,groupIds,groupNames)};
 const pityChance=pityEligible?encounterRarePityChance(prior):0,pityRoll=pityChance>=1?true:pityChance>0&&rng()<pityChance;
 let species=null,bucket=null,pityTriggered=false;
 if(pityRoll){
  const strictRare=uniqueSpecies([...strict.primary,...strict.support,...strict.all]).filter(isHighRarityEncounter),groupRare=uniqueSpecies([...groupOnly.primary,...groupOnly.support,...groupOnly.all]).filter(isHighRarityEncounter),rarePool=strictRare.length?strictRare:groupRare;
  if(rarePool.length){species=weightedStandardSpecies(rarePool,rng());bucket="pity";pityTriggered=true}
 }
 let requestedBucket=null;
 if(!species){
  requestedBucket=requestedAttributeBucket(rng(),strict.primary.length>0,strict.support.length>0);
  bucket=attributeBucketOrder(requestedBucket).find(name=>strict[name].length)??attributeBucketOrder(requestedBucket).find(name=>groupOnly[name].length)??null;
  const pool=bucket?(strict[bucket].length?strict[bucket]:groupOnly[bucket]):[];
  species=weightedStandardSpecies(pool,rng())??null
 }
 const nextHistory=species&&recordHistory?recordEncounterHistory(prior,species):prior;
 return Object.freeze({species,bucket,requestedBucket,pityTriggered,pityChance,history:nextHistory,pools})
}

export function rollAttributeEncounterGroup(source,floor,attribute,{count=1,history=null,rng=Math.random,campaign=false}={}){
 const wanted=Math.max(1,Math.min(4,Math.floor(Number(count)||1))),species=[],buckets=[],ids=[],names=[],prior=normalizeEncounterHistory(history);let pityTriggered=false;
 for(let index=0;index<wanted;index++){
  const roll=rollAttributeEncounter(source,floor,attribute,{history:prior,rng,excludeIds:ids,excludeNames:names,campaign,pityEligible:index===0,recordHistory:false});
  if(!roll.species)break;
  species.push(roll.species);buckets.push(roll.bucket);ids.push(roll.species.id);names.push(String(roll.species.name??roll.species.id));pityTriggered=pityTriggered||roll.pityTriggered
 }
 const nextHistory=species.length?recordEncounterHistory(prior,species):prior;
 return Object.freeze({species:Object.freeze(species),buckets:Object.freeze(buckets),history:nextHistory,pityTriggered,attribute:encounterAttributeId(attribute)})
}

export function encounterPoolAudit(source,floor,{campaign=false}={}){
 const attributes=Object.keys(ENCOUNTER_ATTRIBUTE_AFFINITIES),rows=attributes.map(attribute=>{
  const pools=encounterCandidatesForAttribute(source,floor,attribute,{campaign}),names=new Set(pools.all.map(species=>String(species.name??species.id))),rarities=Object.fromEntries(STANDARD_RARITY_ORDER.map(rarity=>[rarity,pools.all.filter(species=>species.rarity===rarity).length]));
  return Object.freeze({attribute,primary:pools.primary.length,support:pools.support.length,total:pools.all.length,uniqueNames:names.size,highRare:pools.all.filter(isHighRarityEncounter).length,rarities:Object.freeze(rarities)})
 });
 return Object.freeze(rows)
}

export function rollBiomeEncounter(source,floor,biome,rng=Math.random){
 const pools=encounterPoolsForFloor(source,floor,biome),requestedBucket=encounterBucketForRoll(rng());
 const fallbackOrder=requestedBucket==="theme"?["theme","adjacent","exception"]:requestedBucket==="adjacent"?["adjacent","theme","exception"]:["exception","theme","adjacent"];
 const bucket=fallbackOrder.find(name=>pools[name].length)??"theme",roll=rng(),species=(bucket==="exception"?weightedExceptionSpecies(pools[bucket],roll):weightedStandardSpecies(pools[bucket],roll))??pools.unlocked.at(-1)??null;
 return Object.freeze({species,bucket,requestedBucket,pools});
}

export function pickBiomeEncounterSpecies(source,floor,biome,rng=Math.random){return rollBiomeEncounter(source,floor,biome,rng).species}
