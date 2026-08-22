import{ATTRIBUTE_RELATIONS,canonicalAttribute}from"../data/attributes.js?v=2.11.32-build197";

export const BIOME_ENCOUNTER_RATES=Object.freeze({theme:.8,adjacent:.15,exception:.05});

export const STANDARD_RARITY_WEIGHTS=Object.freeze({N:18,R:12,SR:7,SSR:4,UR:2,LR:1});
export const STANDARD_RARITY_RATES=Object.freeze({N:18/44,R:12/44,SR:7/44,SSR:4/44,UR:2/44,LR:1/44});
const STANDARD_RARITY_ORDER=Object.freeze(["N","R","SR","SSR","UR","LR"]);
const EXCEPTION_RARITY_WEIGHTS=Object.freeze({N:1,R:2,SR:4,SSR:8,UR:12,LR:16});
const EXCEPTION_RARITIES=new Set(["SR","SSR","UR","LR"]);

function uniqueSpecies(list){
 const seen=new Set();
 return list.filter(species=>species?.id&&!seen.has(species.id)&&seen.add(species.id));
}

function sourceValues(source){return Array.isArray(source)?source:Object.values(source??{})}

export function eligibleEncounterSpecies(source,floor){
 const f=Math.max(1,Math.floor(Number(floor)||1));
 return sourceValues(source).filter(species=>species?.fieldEncounter!==false&&!species?.ultraRareEncounter&&!species?.isAbyss&&!species?.isTenGod&&!['深淵','十神'].includes(species?.rarity)&&(species?.minFloor??1)<=f).sort((a,b)=>(a.minFloor??1)-(b.minFloor??1));
}

export function localEncounterCandidates(unlocked,floor){
 const list=Array.isArray(unlocked)?unlocked:[],f=Math.max(1,Math.floor(Number(floor)||1));
 if(!list.length)return[];
 const nearby=list.filter(species=>(species.minFloor??1)>=Math.max(1,f-300));
 return nearby.length>=8?nearby:list.slice(-24);
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

export function rollBiomeEncounter(source,floor,biome,rng=Math.random){
 const pools=encounterPoolsForFloor(source,floor,biome),requestedBucket=encounterBucketForRoll(rng());
 const fallbackOrder=requestedBucket==="theme"?["theme","adjacent","exception"]:requestedBucket==="adjacent"?["adjacent","theme","exception"]:["exception","theme","adjacent"];
 const bucket=fallbackOrder.find(name=>pools[name].length)??"theme",roll=rng(),species=(bucket==="exception"?weightedExceptionSpecies(pools[bucket],roll):weightedStandardSpecies(pools[bucket],roll))??pools.unlocked.at(-1)??null;
 return Object.freeze({species,bucket,requestedBucket,pools});
}

export function pickBiomeEncounterSpecies(source,floor,biome,rng=Math.random){return rollBiomeEncounter(source,floor,biome,rng).species}
