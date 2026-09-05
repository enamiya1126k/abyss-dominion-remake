import{CAMPAIGN_MAX_FLOOR,HERO_PARTY_IDS}from"./Campaign100System.js?v=3.1.1-build319";

import{HERO_PURSUIT_STEPS,normalizeHeroPursuit}from"./CampaignHeroPursuitSystem.js?v=3.1.22-build341";

export const CAMPAIGN_HERO_ENCOUNTER_VERSION=4;// Regression history: CAMPAIGN_HERO_ENCOUNTER_VERSION=3
export const CAMPAIGN_HERO_FINAL_LEVEL=1000;
export const CAMPAIGN_HERO_FINAL_ARENA_ID="prophecy-final-gate";
export const CAMPAIGN_HERO_REWIND_DAY=9;
export const CAMPAIGN_HERO_REWIND_FLOOR=81;
export const CAMPAIGN_HERO_IDS=Object.freeze([...HERO_PARTY_IDS]);
export const CAMPAIGN_HERO_RECEIPT_LIMITS=Object.freeze({results:256,wounds:512,rewinds:64});

const HERO_ID_ALIASES=Object.freeze({
 enami:"myth_enami","えなみ":"myth_enami",myth_enami:"myth_enami",
 yori:"myth_yori","より":"myth_yori",myth_yori:"myth_yori",
 hide:"myth_hide","ひで":"myth_hide",myth_hide:"myth_hide",
 rion:"myth_rion","りおん":"myth_rion",myth_rion:"myth_rion"
});

const deepFreeze=value=>{
 if(value&&typeof value==="object"&&!Object.isFrozen(value)){
  Object.freeze(value);
  for(const child of Object.values(value))deepFreeze(child);
 }
 return value;
};
const plainRecord=value=>Boolean(value&&typeof value==="object"&&!Array.isArray(value));
const cleanId=(value,max=120)=>typeof value==="string"?value.replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,max):"";
const finiteNumber=value=>{
 if(value==null||typeof value==="boolean")return null;
 if(typeof value==="string"&&!value.trim())return null;
 if(typeof value!=="number"&&typeof value!=="string")return null;
 const number=Number(value);
 return Number.isFinite(number)?number:null;
};
const boundedInteger=(value,fallback=0,min=0,max=Number.MAX_SAFE_INTEGER)=>{
 const number=finiteNumber(value);
 return number!=null?Math.max(min,Math.min(max,Math.floor(number))):fallback;
};
const clampRate=(value,fallback=1)=>{
 const number=finiteNumber(value);
 return number!=null?Math.max(0,Math.min(1,number)):fallback;
};
const uniqueIds=(value,limit=512)=>[...new Set((Array.isArray(value)?value:[]).map(entry=>cleanId(typeof entry==="string"?entry:entry?.id)).filter(Boolean))].slice(-Math.max(1,limit));
const appendBoundedId=(list,id,limit)=>{list.push(id);if(list.length>limit)list.splice(0,list.length-limit)};

export function canonicalCampaignHeroId(value){return HERO_ID_ALIASES[cleanId(value,40)]??null}

const scheduleEntry=(heroId,day,cycle)=>deepFreeze({
 id:`hero-ambush-${heroId.slice(5)}-${cycle}`,
 heroId,day,floor:(day-1)*10+1,windowEnd:day*10-1,cycle,
 fixedLevel:CAMPAIGN_HERO_FINAL_LEVEL,
 finalStrength:true,randomized:true
});

// One pursuit window opens in each of days 2-9. The order teaches one hero at
// a time, while the exact floor is a stable random roll inside that day.
export const CAMPAIGN_HERO_ENCOUNTER_SCHEDULE=deepFreeze([
 scheduleEntry("myth_yori",2,1),
 scheduleEntry("myth_hide",3,1),
 scheduleEntry("myth_enami",4,1),
 scheduleEntry("myth_rion",5,1),
 scheduleEntry("myth_yori",6,2),
 scheduleEntry("myth_hide",7,2),
 scheduleEntry("myth_enami",8,2),
 scheduleEntry("myth_rion",9,2)
]);

export const CAMPAIGN_HERO_FIELD_STATES=deepFreeze(["hidden","appearing","observing","pursuing","contact","withdrawing","resolved"]);

export const CAMPAIGN_HERO_FIELD_PROFILES=deepFreeze({
 myth_yori:{
  heroId:"myth_yori",label:"観察してから詰める",initialState:"observing",observePlayerSteps:2,
  detectionRange:10,spawnPathDistance:{min:7,max:11},moveTilesPerPlayerStep:1,predictAheadTiles:2,
  portalGraceSteps:2,maxPursuitPlayerSteps:HERO_PURSUIT_STEPS,maxPortalTransfers:null,canBlockPortalLanding:false,
  chaseRule:"観察後、現在地と直前の移動方向から予測した地点へ最短移動"
 },
 myth_hide:{
  heroId:"myth_hide",label:"真っすぐ精密に追う",initialState:"pursuing",observePlayerSteps:0,
  detectionRange:11,spawnPathDistance:{min:8,max:11},moveTilesPerPlayerStep:1,bonusMoveEveryPlayerSteps:4,
  portalGraceSteps:1,maxPursuitPlayerSteps:HERO_PURSUIT_STEPS,maxPortalTransfers:null,canBlockPortalLanding:false,
  chaseRule:"毎歩再計算した最短経路を追い、四歩ごとに一歩だけ追加移動"
 },
 myth_enami:{
  heroId:"myth_enami",label:"距離を保ち、仲間の傷で豹変",initialState:"observing",observePlayerSteps:1,
  detectionRange:9,spawnPathDistance:{min:7,max:10},preferredDistance:{min:6,max:8},moveTilesPerPlayerStep:1,
  huntDistance:3,huntWhenAnyHeroWoundRateAtLeast:.2,withdrawAfterDistantSteps:6,
  portalGraceSteps:2,maxPursuitPlayerSteps:HERO_PURSUIT_STEPS,maxPortalTransfers:null,canBlockPortalLanding:false,
  chaseRule:"通常は六〜八マスを保ち、接近または仲間の重傷後は最短追跡"
 },
 myth_rion:{
  heroId:"myth_rion",label:"出口を読み、先回りする",initialState:"observing",observePlayerSteps:1,
  detectionRange:10,spawnPathDistance:{min:7,max:11},interceptAheadTiles:{min:3,max:5},moveTilesPerPlayerStep:1,
  portalGraceSteps:2,maxPursuitPlayerSteps:HERO_PURSUIT_STEPS,maxPortalTransfers:null,canBlockPortalLanding:false,
  chaseRule:"進行方向の三〜五マス先か分岐点を狙い、経路変更時に先回り地点を更新"
 }
});

// The action keys intentionally name existing combat concepts. Integration may
// map each key to the hero's already-authored serial skill; no second AI engine
// or new skill is required.
export const CAMPAIGN_HERO_COMBAT_PROFILES=deepFreeze({
 myth_yori:{role:"physical-striker",priorities:["ready-ultimate","self-physical-buff","lowest-hp-single-physical","three-target-aoe","basic"]},
 myth_hide:{role:"magic-tactician",priorities:["ally-average-below-55-heal-or-buff","highest-threat-defense-down","two-target-aoe","double-magic","basic"]},
 myth_enami:{role:"guardian-counter",priorities:["ally-wounded-shield-or-buff","highest-attack-target","three-target-aoe","ready-ultimate","basic"]},
 myth_rion:{role:"support-controller",priorities:["fallen-ally-revive","ally-below-60-heal-or-cleanse","party-buff","highest-threat-defense-down","low-mp-mana-drain","basic"]}
});

export const CAMPAIGN_HERO_PROFILES=deepFreeze(Object.fromEntries(CAMPAIGN_HERO_IDS.map(heroId=>[heroId,{
 heroId,fixedLevel:CAMPAIGN_HERO_FINAL_LEVEL,finalStrength:true,
 field:CAMPAIGN_HERO_FIELD_PROFILES[heroId],combat:CAMPAIGN_HERO_COMBAT_PROFILES[heroId]
}])));

export const CAMPAIGN_HERO_ENCOUNTER_RULES=deepFreeze({
 offlineOnly:true,minimumVisitedSections:2,minimumStepsSinceBattle:6,minimumPartyHpRate:.5,
 excludedFloors:Object.freeze(Array.from({length:10},(_,index)=>(index+1)*10)),
 moveOnlyOnPlayerStep:true,maximumEncounters:CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.length,
 defeatPenalty:"none",retreatPenalty:"none",missedWindowPolicy:"never-backfill",
 randomChance:{opening:.2,closing:.82,guaranteedOnLastFloor:true}
});

export const CAMPAIGN_HERO_UI_COPY=deepFreeze({
 warning:"誰かの気配が近づいている……",
 discovered:heroName=>`${heroName}に発見された`,
 pursuit:"追跡されています",
 escaped:"気配が遠ざかった",
 contact:"勇者が行く手を阻んだ",
 permanentWound:"与えた傷は最終決戦まで残る",
 finalGate:"魔王城の王室が開いた",
 rewind:"リオネルの予言が九日目へ巻き戻る"
});

const VALID_EVENT_STATUSES=new Set(["scheduled","armed","active","resolved","legacy-missed","skipped-defeated"]);
const DEFEAT_OUTCOMES=new Set(["repelled","defeated","hero-defeat","player-win"]);

function emptyHeroRecord(heroId){return{
 heroId,remainingHpRate:1,lowestHpRate:1,defeated:false,encounters:0,
 lastOutcome:null,lastEncounterId:null,lastResultId:null,lastSeenFloor:null
}}
function emptyEventRecord(definition){return{
 ...definition,status:"scheduled",outcome:null,resultId:null,activatedFloor:null,resolvedFloor:null,preludeSeen:false,heroHpRate:null,hurtPercent:null
}}
function emptyFinalArena(){return{
 id:CAMPAIGN_HERO_FINAL_ARENA_ID,unlocked:false,entered:false,audienceCompleted:false,battleStarted:false,completed:false,attempts:0,lastEnding:null,lastEndingVariant:null
}}
function emptyRewind(){return{
 active:false,targetDay:CAMPAIGN_HERO_REWIND_DAY,targetFloor:CAMPAIGN_HERO_REWIND_FLOOR,
 currentFloor:CAMPAIGN_HERO_REWIND_FLOOR,replayThroughFloor:CAMPAIGN_MAX_FLOOR,count:0,resultId:null,reason:null,
 preserveHeroWounds:true,preserveEncounterReceipts:true,suppressFirstClearRewards:true
}}
function emptyState(){return{
 version:CAMPAIGN_HERO_ENCOUNTER_VERSION,storyCycle:0,
 heroes:Object.fromEntries(HERO_PARTY_IDS.map(heroId=>[heroId,emptyHeroRecord(heroId)])),
 events:Object.fromEntries(CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.map(entry=>[entry.id,emptyEventRecord(entry)])),
 activeEncounterId:null,processedResultIds:[],processedWoundIds:[],processedRewindIds:[],
 branchStories323:{version:2,storyCycle:0,receipts:[],pending:[],history:[]},
 finalArena:emptyFinalArena(),rewind:emptyRewind(),legacyMigrationApplied:false,legacyRewindRetired:false
}}

function sourceLedger(value){
 if(!plainRecord(value))return{};
 if(plainRecord(value.campaign100))return plainRecord(value.campaign100.heroEncounters310)?value.campaign100.heroEncounters310:{};
 if(plainRecord(value.heroEncounters310))return value.heroEncounters310;
 return value;
}
function eventSourceById(value){
 const result={};
 if(Array.isArray(value))for(const entry of value){const id=cleanId(entry?.id);if(id)result[id]=entry}
 else if(plainRecord(value))for(const[id,entry]of Object.entries(value))result[cleanId(id)]=entry;
 return result;
}
function isAuthoredLedger(value){
 if(!plainRecord(value))return false;
 const version=finiteNumber(value.version);
 if(Number.isInteger(version)&&version===CAMPAIGN_HERO_ENCOUNTER_VERSION)return true;
 if(value.legacyMigrationApplied===true)return true;
 const rawEvents=eventSourceById(value.events);
 if(CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.some(entry=>plainRecord(rawEvents[entry.id])))return true;
 const activeId=cleanId(value.activeEncounterId,120);
 if(CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.some(entry=>entry.id===activeId))return true;
 if(uniqueIds(value.processedResultIds,1).length||uniqueIds(value.processedWoundIds,1).length||uniqueIds(value.processedRewindIds,1).length)return true;
 const finalArena=plainRecord(value.finalArena)?value.finalArena:null;
 const finalEnding=cleanId(finalArena?.lastEnding,32);
 if(finalArena&&(finalArena.unlocked===true||finalArena.entered===true||finalArena.battleStarted===true||finalArena.completed===true||boundedInteger(finalArena.attempts,0,0,999)>0||["complete","narrow","defeat","all-preempted","preemptive"].includes(finalEnding)))return true;
 const rewind=plainRecord(value.rewind)?value.rewind:null;
 return Boolean(rewind&&(rewind.active===true||boundedInteger(rewind.count,0,0,999)>0||cleanId(rewind.resultId,120)));
}
function deriveHpRate(value){
 if(!plainRecord(value))return null;
 for(const key of["remainingHpRate","lowestHpRate","minHpRate","hpRate"]){const raw=value[key];if(raw==null||raw==="")continue;const number=finiteNumber(raw);if(number!=null)return clampRate(number)}
 const hp=finiteNumber(value.currentHp??value.hp),maxHp=finiteNumber(value.maxHp??value.hpMax);
 if(hp!=null&&maxHp!=null&&maxHp>0)return clampRate(hp/maxHp);
 const damage=finiteNumber(value.damageRatio??value.woundRatio);
 if(damage!=null)return clampRate(1-damage);
 const percent=finiteNumber(value.damagePercent);
 return percent!=null?clampRate(1-percent/100):null;
}
function normalizeHeroRecord(value,heroId){
 const source=plainRecord(value)?value:{},result=emptyHeroRecord(heroId),rate=deriveHpRate(source);
 result.remainingHpRate=Math.min(clampRate(source.remainingHpRate,1),rate??1);
 result.lowestHpRate=Math.min(result.remainingHpRate,clampRate(source.lowestHpRate,result.remainingHpRate));
 result.defeated=source.defeated===true||source.repelled===true||result.remainingHpRate<=0||DEFEAT_OUTCOMES.has(cleanId(source.lastOutcome??source.outcome,32));
 if(result.defeated){result.remainingHpRate=0;result.lowestHpRate=0}
 result.encounters=boundedInteger(source.encounters??source.encounterCount,0,0,999);
 result.lastOutcome=cleanId(source.lastOutcome??source.outcome,32)||null;
 result.lastEncounterId=cleanId(source.lastEncounterId,120)||null;
 result.lastResultId=cleanId(source.lastResultId,120)||null;
 const seenFloor=source.lastSeenFloor==null||source.lastSeenFloor===""?Number.NaN:Number(source.lastSeenFloor);
 result.lastSeenFloor=Number.isFinite(seenFloor)?boundedInteger(seenFloor,1,1,CAMPAIGN_MAX_FLOOR):null;
 return result;
}
function mergeHeroRecord(current,incoming,heroId){
 const left=normalizeHeroRecord(current,heroId),right=normalizeHeroRecord(incoming,heroId),defeated=left.defeated||right.defeated;
 return{
  heroId,remainingHpRate:defeated?0:Math.min(left.remainingHpRate,right.remainingHpRate),
  lowestHpRate:defeated?0:Math.min(left.lowestHpRate,right.lowestHpRate),defeated,
  encounters:Math.max(left.encounters,right.encounters),lastOutcome:right.lastOutcome??left.lastOutcome,
  lastEncounterId:right.lastEncounterId??left.lastEncounterId,lastResultId:right.lastResultId??left.lastResultId,
  lastSeenFloor:right.lastSeenFloor??left.lastSeenFloor
 };
}
function continuityByHero(value){
 const result={};
 const consume=(entry,hint)=>{
  if(!plainRecord(entry))return;
  const heroId=canonicalCampaignHeroId(entry.heroId??entry.speciesId??entry.id??hint);
  if(!heroId)return;
  const normalized=normalizeHeroRecord(entry,heroId);
  if(Array.isArray(value))normalized.encounters=Math.max(1,normalized.encounters);
  result[heroId]=mergeHeroRecord(result[heroId],normalized,heroId);
 };
 if(Array.isArray(value))for(const entry of value)consume(entry,null);
 else if(plainRecord(value))for(const[hint,entry]of Object.entries(value))consume(entry,hint);
 return result;
}

export function createCampaignHeroEncounterState(options={}){
 return normalizeCampaignHeroEncounterState(null,options);
}

export function normalizeCampaignHeroEncounterState(value,{migrationHighestFloor=null,heroContinuity=null,storyCycle=null}={}){
 const source=sourceLedger(value),hasAuthoredLedger=isAuthoredLedger(source),state=emptyState(),rawEvents=eventSourceById(source.events),rawHeroes=continuityByHero(source.heroes),storyHeroes=continuityByHero(value?.campaign100?.story309?.heroContinuity),legacyHeroes=continuityByHero(heroContinuity);
 state.storyCycle=boundedInteger(storyCycle??source.storyCycle??value?.campaign100?.reincarnation319?.cycle,0,0,999);state.branchStories323=plainRecord(source.branchStories323)?source.branchStories323:{version:2,storyCycle:state.storyCycle,receipts:[],pending:[],history:[]};
 for(const heroId of HERO_PARTY_IDS){
  state.heroes[heroId]=mergeHeroRecord(state.heroes[heroId],rawHeroes[heroId],heroId);
  state.heroes[heroId]=mergeHeroRecord(state.heroes[heroId],storyHeroes[heroId],heroId);
  state.heroes[heroId]=mergeHeroRecord(state.heroes[heroId],legacyHeroes[heroId],heroId);
 }
 const migrationNumber=migrationHighestFloor==null||migrationHighestFloor===""?null:finiteNumber(migrationHighestFloor),migrationFloor=migrationNumber!=null?boundedInteger(migrationNumber,1,1,CAMPAIGN_MAX_FLOOR):null;
 for(const definition of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE){
  const sourceEvent=plainRecord(rawEvents[definition.id])?rawEvents[definition.id]:{},event=emptyEventRecord(definition),status=cleanId(sourceEvent.status,32);
  event.status=VALID_EVENT_STATUSES.has(status)?status:"scheduled";
  event.preludeSeen=sourceEvent.preludeSeen===true||["active","resolved","legacy-missed","skipped-defeated"].includes(event.status);
  event.outcome=cleanId(sourceEvent.outcome,32)||null;
  event.resultId=cleanId(sourceEvent.resultId,120)||null;
  const activated=sourceEvent.activatedFloor==null||sourceEvent.activatedFloor===""?null:finiteNumber(sourceEvent.activatedFloor),resolved=sourceEvent.resolvedFloor==null||sourceEvent.resolvedFloor===""?null:finiteNumber(sourceEvent.resolvedFloor);
  event.activatedFloor=activated!=null?boundedInteger(activated,definition.floor,1,CAMPAIGN_MAX_FLOOR):null;
  event.resolvedFloor=resolved!=null?boundedInteger(resolved,definition.floor,1,CAMPAIGN_MAX_FLOOR):null;
  const resolvedHpRate=finiteNumber(sourceEvent.heroHpRate),hurtPercent=finiteNumber(sourceEvent.hurtPercent);event.heroHpRate=resolvedHpRate==null?null:clampRate(resolvedHpRate);event.hurtPercent=hurtPercent==null?null:boundedInteger(hurtPercent,0,0,100);
  if(!hasAuthoredLedger&&migrationFloor!=null&&definition.windowEnd<migrationFloor)event.status="legacy-missed";
  if(state.heroes[definition.heroId].defeated&&!['resolved','legacy-missed'].includes(event.status))event.status="skipped-defeated";
  state.events[definition.id]=event;
 }
 state.processedResultIds=uniqueIds(source.processedResultIds,CAMPAIGN_HERO_RECEIPT_LIMITS.results);
 state.processedWoundIds=uniqueIds(source.processedWoundIds,CAMPAIGN_HERO_RECEIPT_LIMITS.wounds);
 state.processedRewindIds=uniqueIds(source.processedRewindIds,CAMPAIGN_HERO_RECEIPT_LIMITS.rewinds);
 const requestedActiveId=cleanId(source.activeEncounterId,120),requestedActiveEvent=state.events[requestedActiveId],fallbackActive=CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(entry=>state.events[entry.id]?.status==="active"),activeId=requestedActiveEvent?.status==="active"?requestedActiveId:fallbackActive?.id??null;
 state.activeEncounterId=activeId;
 state.fieldPursuit341=normalizeHeroPursuit(source.fieldPursuit341,{encounterId:activeId,heroId:state.events[activeId]?.heroId});
 for(const definition of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE)if(state.events[definition.id].status==="active"&&definition.id!==activeId)state.events[definition.id]={...state.events[definition.id],status:"armed"};
 const finalSource=plainRecord(source.finalArena)?source.finalArena:{};
 state.finalArena={
  ...emptyFinalArena(),unlocked:finalSource.unlocked===true,entered:finalSource.entered===true,
  audienceCompleted:finalSource.audienceCompleted===true,battleStarted:finalSource.battleStarted===true,completed:finalSource.completed===true,
  attempts:boundedInteger(finalSource.attempts,0,0,999),
  lastEnding:["complete","narrow","defeat","all-preempted","preemptive"].includes(finalSource.lastEnding)?(finalSource.lastEnding==="preemptive"?"all-preempted":finalSource.lastEnding):null,
  lastEndingVariant:cleanId(finalSource.lastEndingVariant,40)||null
 };
 const rewindSource=plainRecord(source.rewind)?source.rewind:{};
 state.rewind={
  ...emptyRewind(),active:rewindSource.active===true,count:boundedInteger(rewindSource.count,0,0,999),
  currentFloor:boundedInteger(rewindSource.currentFloor,CAMPAIGN_HERO_REWIND_FLOOR,CAMPAIGN_HERO_REWIND_FLOOR,CAMPAIGN_MAX_FLOOR),
  resultId:cleanId(rewindSource.resultId,120)||null,reason:cleanId(rewindSource.reason,80)||null
 };
 state.legacyMigrationApplied=source.legacyMigrationApplied===true||!hasAuthoredLedger&&migrationFloor!=null;
 state.legacyRewindRetired=source.legacyRewindRetired===true;
 return state;
}

// Build319 retired the forced 81F rewind. A player who saved during that old
// transition must regain the already-unlocked royal audience instead of being
// trapped in a replay flow that the current ending no longer advances.
export function retireLegacyCampaignRewind(value){
 const state=normalizeCampaignHeroEncounterState(value),retired=state.rewind.active===true;
 if(retired){
  state.rewind={...state.rewind,active:false,reason:"retired-build320"};
  state.finalArena={...state.finalArena,unlocked:true,entered:false,battleStarted:false,completed:false,lastEnding:"defeat"};
  state.legacyRewindRetired=true;
 }
 return{state,retired};
}

export function normalizeCampaignHeroInvasion(value,options={}){
 const inferredFloor=finiteNumber(value?.player?.maxFloor??value?.player?.currentFloor),source=sourceLedger(value),hasLedger=isAuthoredLedger(source),hasMigrationOption=Object.prototype.hasOwnProperty.call(options,"migrationHighestFloor");
 return normalizeCampaignHeroEncounterState(value,{
  ...options,
  storyCycle:options.storyCycle??value?.campaign100?.reincarnation319?.cycle,
  migrationHighestFloor:hasMigrationOption?options.migrationHighestFloor:(!hasLedger&&inferredFloor!=null?inferredFloor:null),
  heroContinuity:options.heroContinuity??value?.campaign100?.story309?.heroContinuity
 });
}

export function campaignHeroEncounterDefinition(value){
 const id=cleanId(typeof value==="string"?value:value?.id,120);
 return CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(entry=>entry.id===id)??null;
}

export function campaignHeroEncounterRoll(encounterId,floor){
 const text=`${cleanId(encounterId)}:${boundedInteger(floor,1,1,CAMPAIGN_MAX_FLOOR)}`;let hash=2166136261;
 for(let index=0;index<text.length;index++)hash=Math.imul(hash^text.charCodeAt(index),16777619);
 return(hash>>>0)/4294967296
}

export function campaignHeroEncounterCandidate(value,{floor,encounterRoll=null,online=false,bossDefeated=false,postBoss=false,modalOpen=false,battleOpen=false,visitedSections=2,stepsSinceBattle=6,partyHpRate=1}={}){
 const state=normalizeCampaignHeroEncounterState(value),currentFloor=boundedInteger(floor,0,0,CAMPAIGN_MAX_FLOOR);
 if(!currentFloor||online||bossDefeated||postBoss||modalOpen||battleOpen||currentFloor%10===0)return null;
 if(boundedInteger(visitedSections,0,0,99)<CAMPAIGN_HERO_ENCOUNTER_RULES.minimumVisitedSections)return null;
 if(boundedInteger(stepsSinceBattle,0,0,999)<CAMPAIGN_HERO_ENCOUNTER_RULES.minimumStepsSinceBattle)return null;
 if(clampRate(partyHpRate,0)<CAMPAIGN_HERO_ENCOUNTER_RULES.minimumPartyHpRate)return null;
 for(const definition of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE){
  const event=state.events[definition.id],hero=state.heroes[definition.heroId];
  if(!hero.defeated&&event.preludeSeen===true&&["scheduled","armed"].includes(event.status)&&currentFloor>=definition.floor&&currentFloor<=definition.windowEnd){
   const span=Math.max(1,definition.windowEnd-definition.floor),progress=Math.max(0,Math.min(1,(currentFloor-definition.floor)/span)),chance=CAMPAIGN_HERO_ENCOUNTER_RULES.randomChance.opening+(CAMPAIGN_HERO_ENCOUNTER_RULES.randomChance.closing-CAMPAIGN_HERO_ENCOUNTER_RULES.randomChance.opening)*progress,rawRoll=finiteNumber(encounterRoll),roll=rawRoll==null?campaignHeroEncounterRoll(definition.id,currentFloor):Math.max(0,Math.min(.999999,rawRoll));
   if(currentFloor<definition.windowEnd&&roll>chance)return null;
   return{...definition,triggerFloor:currentFloor,status:event.status,encounterChance:currentFloor===definition.windowEnd?1:chance,encounterRoll:roll,fieldProfile:CAMPAIGN_HERO_FIELD_PROFILES[definition.heroId],combatProfile:CAMPAIGN_HERO_COMBAT_PROFILES[definition.heroId]};
  }
 }
 return null;
}

export function scheduledCampaignHeroForFloor(value,floorOrOptions,options={}){
 const settings=plainRecord(floorOrOptions)?floorOrOptions:{...options,floor:floorOrOptions};
 return campaignHeroEncounterCandidate(value,settings);
}

export function activateCampaignHeroEncounter(value,{encounterId,floor}={}){
 const state=normalizeCampaignHeroEncounterState(value),definition=campaignHeroEncounterDefinition(encounterId),currentFloor=boundedInteger(floor,0,0,CAMPAIGN_MAX_FLOOR);
 if(!definition)return{state,activated:false,reason:"unknown-encounter"};
 const event=state.events[definition.id],hero=state.heroes[definition.heroId];
 if(hero.defeated||event.status==="skipped-defeated")return{state,activated:false,reason:"hero-defeated"};
 if(state.activeEncounterId&&state.activeEncounterId!==definition.id)return{state,activated:false,reason:"another-encounter-active"};
 if(event.status==="active")return{state,activated:false,duplicate:true,encounter:{...event}};
 if(event.preludeSeen!==true)return{state,activated:false,reason:"prelude-required"};
 if(!["scheduled","armed"].includes(event.status))return{state,activated:false,reason:"encounter-settled"};
 if(currentFloor<definition.floor||currentFloor>definition.windowEnd)return{state,activated:false,reason:"outside-window"};
 state.events[definition.id]={...event,status:"active",activatedFloor:currentFloor};
 state.activeEncounterId=definition.id;
 return{state,activated:true,encounter:{...state.events[definition.id]}};
}

export function beginCampaignHeroFieldEncounter(value,encounterOrOptions,options={}){
 const settings=plainRecord(encounterOrOptions)?encounterOrOptions:{...options,encounterId:encounterOrOptions};
 return activateCampaignHeroEncounter(value,{...settings,encounterId:settings.encounterId??settings.id});
}

export function recordCampaignHeroWound(value,{heroId,speciesId,woundId,resultId,minHpRate,hpRate,currentHp,hp,maxHp,damageRatio,woundRatio}={}){
 const state=normalizeCampaignHeroEncounterState(value),id=canonicalCampaignHeroId(heroId??speciesId),receipt=cleanId(woundId??resultId,120);
 if(!id)return{state,recorded:false,reason:"unknown-hero"};
 if(receipt&&state.processedWoundIds.includes(receipt))return{state,recorded:false,duplicate:true,hero:{...state.heroes[id]}};
 const observed=deriveHpRate({minHpRate,hpRate,currentHp:currentHp??hp,maxHp,damageRatio,woundRatio});
 if(observed==null)return{state,recorded:false,reason:"missing-hp"};
 const prior=state.heroes[id],nextRate=Math.min(prior.remainingHpRate,observed),defeated=prior.defeated||nextRate<=0;
 state.heroes[id]={...prior,remainingHpRate:defeated?0:nextRate,lowestHpRate:defeated?0:Math.min(prior.lowestHpRate,nextRate),defeated};
 if(receipt)appendBoundedId(state.processedWoundIds,receipt,CAMPAIGN_HERO_RECEIPT_LIMITS.wounds);
 return{state,recorded:nextRate<prior.remainingHpRate||Boolean(receipt),hero:{...state.heroes[id]}};
}

export function settleCampaignHeroEncounter(value,{encounterId,resultId,heroId,speciesId,outcome="escaped",floor,minHpRate,hpRate,currentHp,hp,maxHp,damageRatio,woundRatio,repelled=false,defeated=false}={}){
 let state=normalizeCampaignHeroEncounterState(value);
 const receipt=cleanId(resultId,120),definition=campaignHeroEncounterDefinition(encounterId??state.activeEncounterId),requestedHero=canonicalCampaignHeroId(heroId??speciesId);
 if(!receipt)return{state,recorded:false,reason:"missing-result-id"};
 if(state.processedResultIds.includes(receipt))return{state,recorded:false,duplicate:true};
 if(!definition)return{state,recorded:false,reason:"unknown-encounter"};
 if(requestedHero&&requestedHero!==definition.heroId)return{state,recorded:false,reason:"hero-mismatch"};
 const event=state.events[definition.id];
 if(event.status==="resolved")return{state,recorded:false,reason:"encounter-settled"};
 const normalizedOutcome=cleanId(outcome,32)||"escaped",observed=deriveHpRate({minHpRate,hpRate,currentHp:currentHp??hp,maxHp,damageRatio,woundRatio}),prior=state.heroes[definition.heroId],explicitDefeat=repelled===true||defeated===true||DEFEAT_OUTCOMES.has(normalizedOutcome),nextRate=observed==null?prior.remainingHpRate:Math.min(prior.remainingHpRate,observed),heroDefeated=prior.defeated||explicitDefeat||nextRate<=0,currentFloor=boundedInteger(floor,event.activatedFloor??definition.floor,1,CAMPAIGN_MAX_FLOOR);
 state.heroes[definition.heroId]={
  ...prior,remainingHpRate:heroDefeated?0:nextRate,lowestHpRate:heroDefeated?0:Math.min(prior.lowestHpRate,nextRate),
  defeated:heroDefeated,encounters:prior.encounters+1,lastOutcome:normalizedOutcome,
  lastEncounterId:definition.id,lastResultId:receipt,lastSeenFloor:currentFloor
 };
 state.events[definition.id]={...event,status:"resolved",outcome:normalizedOutcome,resultId:receipt,resolvedFloor:currentFloor,heroHpRate:heroDefeated?0:nextRate,hurtPercent:Math.round((1-(heroDefeated?0:nextRate))*100)};
 if(heroDefeated)for(const future of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE){
  const futureEvent=state.events[future.id];
  if(future.heroId===definition.heroId&&future.id!==definition.id&&!['resolved','legacy-missed'].includes(futureEvent.status))state.events[future.id]={...futureEvent,status:"skipped-defeated"};
 }
 if(state.activeEncounterId===definition.id){state.activeEncounterId=null;state.fieldPursuit341=null;}
 appendBoundedId(state.processedResultIds,receipt,CAMPAIGN_HERO_RECEIPT_LIMITS.results);
 return{state,recorded:true,hero:{...state.heroes[definition.heroId]},encounter:{...state.events[definition.id]},defeatedNow:!prior.defeated&&heroDefeated};
}

export function campaignRemainingHeroIds(value){
 const state=normalizeCampaignHeroEncounterState(value);
 return HERO_PARTY_IDS.filter(heroId=>!state.heroes[heroId].defeated&&state.heroes[heroId].remainingHpRate>0);
}

export function campaignFinalHeroEntries(value){
 const state=normalizeCampaignHeroEncounterState(value);
 return campaignRemainingHeroIds(state).map(heroId=>({
  heroId,level:CAMPAIGN_HERO_FINAL_LEVEL,carryHpRate:state.heroes[heroId].remainingHpRate,
  fixedTrialScaling:true,battleFloor:CAMPAIGN_MAX_FLOOR
 }));
}

export function campaignRemainingHeroes(value){return campaignFinalHeroEntries(value)}

export const CAMPAIGN_HERO_ENDING_IDS=deepFreeze({
 complete:"complete",narrow:"narrow",defeat:"defeat",preemptive:"all-preempted"
});

export function campaignHeroEndingForResult(value,{won=false,partyWon=false,partySurvivors,partySize=4}={}){
 const remaining=campaignRemainingHeroIds(value);
 if(remaining.length===0)return CAMPAIGN_HERO_ENDING_IDS.preemptive;
 if(won!==true&&partyWon!==true)return CAMPAIGN_HERO_ENDING_IDS.defeat;
 const size=boundedInteger(partySize,4,1,4),survivors=partySurvivors==null?size:Array.isArray(partySurvivors)?partySurvivors.length:boundedInteger(partySurvivors,0,0,size);
 if(survivors<=0)return CAMPAIGN_HERO_ENDING_IDS.defeat;
 return survivors>=size?CAMPAIGN_HERO_ENDING_IDS.complete:CAMPAIGN_HERO_ENDING_IDS.narrow;
}

export function createCampaignDayNineRewind(value,{resultId,reason="final-defeat"}={}){
 const state=normalizeCampaignHeroEncounterState(value),receipt=cleanId(resultId,120);
 if(!receipt)return{state,recorded:false,reason:"missing-result-id"};
 if(state.processedRewindIds.includes(receipt))return{state,recorded:false,duplicate:true,transition:{...state.rewind}};
 appendBoundedId(state.processedRewindIds,receipt,CAMPAIGN_HERO_RECEIPT_LIMITS.rewinds);
 state.rewind={...emptyRewind(),active:true,count:state.rewind.count+1,resultId:receipt,reason:cleanId(reason,80)||"final-defeat"};
 state.finalArena={...state.finalArena,unlocked:true,entered:false,battleStarted:false,completed:false,lastEnding:"defeat"};
 return{
  state,recorded:true,
  transition:{...state.rewind,replayFloors:{from:CAMPAIGN_HERO_REWIND_FLOOR,to:CAMPAIGN_MAX_FLOOR}}
 };
}

export function beginCampaignDay9Rewind(value,options={}){return createCampaignDayNineRewind(value,options)}

export function advanceCampaignRewindFloor(value,floorOrOptions={}){
 const state=normalizeCampaignHeroEncounterState(value),settings=plainRecord(floorOrOptions)?floorOrOptions:{clearedFloor:floorOrOptions};
 if(!state.rewind.active)return{state,advanced:false,reason:"rewind-inactive",currentFloor:state.rewind.currentFloor};
 const clearedFloor=boundedInteger(settings.clearedFloor??settings.floor,state.rewind.currentFloor,1,CAMPAIGN_MAX_FLOOR);
 if(clearedFloor<state.rewind.currentFloor)return{state,advanced:false,reason:"floor-not-cleared",currentFloor:state.rewind.currentFloor};
 if(clearedFloor>=CAMPAIGN_MAX_FLOOR){
  state.rewind={...state.rewind,active:false,currentFloor:CAMPAIGN_MAX_FLOOR};
  state.finalArena={...state.finalArena,unlocked:true,entered:false,battleStarted:false};
  return{state,advanced:true,completed:true,currentFloor:CAMPAIGN_MAX_FLOOR};
 }
 const nextFloor=Math.max(state.rewind.currentFloor,clearedFloor+1);
 state.rewind={...state.rewind,currentFloor:nextFloor};
 return{state,advanced:nextFloor!==clearedFloor,completed:false,currentFloor:nextFloor};
}

export function clearCampaignDayNineRewind(value){
 const state=normalizeCampaignHeroEncounterState(value);
 state.rewind={...state.rewind,active:false};
 return state;
}
