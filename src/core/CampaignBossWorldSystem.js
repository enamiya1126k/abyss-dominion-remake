import{safeSectionExitCandidates}from"./DungeonSectionSystem.js?v=3.0.9-build309";

/*
 * Build308 keeps campaign-boss field state separate from reward entitlement
 * state.  This module never mutates the save or consumes a key: it only turns
 * an authoritative list of boss IDs/progress into deterministic world objects.
 * That makes the same operations usable while creating a floor, hydrating a
 * snapshot and applying a battle result.
 */

export const CAMPAIGN_BOSS_WORLD_LAYOUT_VERSION=308;
export const LEGACY_MULTI_BOSS_LAYOUT_VERSIONS=Object.freeze([303,307]);
export const CAMPAIGN_MILESTONE_BOSS_COUNTS=Object.freeze({80:3,90:3,100:4});

const MAX_KEYS=3;
const record=value=>value&&typeof value==="object"&&!Array.isArray(value)?value:{};
const own=(value,key)=>Object.prototype.hasOwnProperty.call(record(value),key);
const integer=(value,fallback=0)=>Number.isFinite(Number(value))?Math.round(Number(value)):fallback;
const pointKey=point=>`${integer(point?.x)},${integer(point?.y)}`;

function bossIdAnalysis(source){
 const raw=Array.isArray(source)?source:[],ids=[],seen=new Set(),duplicates=[];
 for(const value of raw){
  const id=String(value??"").trim();if(!id)continue;
  if(seen.has(id)){duplicates.push(id);continue}
  seen.add(id);ids.push(id)
 }
 return{ids,duplicates:[...new Set(duplicates)]}
}

function stableHash(...parts){
 let hash=2166136261;
 for(const character of parts.map(part=>String(part??"")).join("\u001f")){hash^=character.codePointAt(0);hash=Math.imul(hash,16777619)}
 return hash>>>0
}

function resolveStartSectionId(world,sections){
 const requested=String(world?.startSectionId??world?.start?.sectionId??"");
 return sections.some(section=>String(section.id)===requested)?requested:String(sections[0]?.id??"")
}

function validSections(world){
 const result=[],seen=new Set();
 for(const candidate of Array.isArray(world?.sections)?world.sections:[]){
  const id=String(candidate?.id??"");if(!id||seen.has(id))continue;
  seen.add(id);result.push(candidate)
 }
 return result
}

function sectionCells(section){
 const seen=new Set(),result=[];
 for(const source of Array.isArray(section?.cells)?section.cells:[]){
  if(!Number.isFinite(Number(source?.x))||!Number.isFinite(Number(source?.y)))continue;
  const point={x:integer(source.x),y:integer(source.y)},key=pointKey(point);if(seen.has(key))continue;
  seen.add(key);result.push(point)
 }
 if(!result.length&&Number.isFinite(Number(section?.center?.x))&&Number.isFinite(Number(section?.center?.y)))result.push({x:integer(section.center.x),y:integer(section.center.y)});
 return result
}

function sectionContains(section,point){
 if(!point||!Number.isFinite(Number(point.x))||!Number.isFinite(Number(point.y)))return false;
 const key=pointKey(point),keys=Array.isArray(section?.cellKeys)?section.cellKeys:null;
 return keys?.length?keys.includes(key):sectionCells(section).some(cell=>pointKey(cell)===key)
}

function progressMap(source){
 const value=record(source);return record(value.bossProgress??value)
}

function progressFor(source,bossId){return record(progressMap(source)[bossId])}

function objectBossId(entry,{floor=null,expected=[]}={}){
 const value=record(entry),info=record(value.bossInfo),candidates=[value.bossId,value.rewardOwnerId,value.endgameBossId,value.floorBossCatalogId,info.bossId,info.rewardOwnerId,info.endgameBossId,info.floorBossCatalogId];
 for(const candidate of candidates){const id=String(candidate??"").trim();if(id&&(!expected.length||expected.includes(id)))return id}
 const objectId=String(value.id??""),numericFloor=Math.max(1,integer(floor,1));
 for(const prefix of [`${numericFloor}-boss-`,`${numericFloor}-trophy-`])if(objectId.startsWith(prefix)){const id=objectId.slice(prefix.length);if(id&&(!expected.length||expected.includes(id)))return id}
 return expected.length===1?expected[0]:null
}

function normalizedPoint(entry,sectionId=null){
 if(!Number.isFinite(Number(entry?.x))||!Number.isFinite(Number(entry?.y)))return null;
 const id=String(entry?.sectionId??entry?.roomId??sectionId??"")||null;
 return{x:integer(entry.x),y:integer(entry.y),...(id?{sectionId:id,roomId:id}:{})}
}

function existingBossEntries(world){
 const many=Array.isArray(world?.bosses)?world.bosses:[];
 return many.length?many:world?.boss?[world.boss]:[]
}

function existingTrophyEntries(world){
 const many=Array.isArray(world?.trophyChests)?world.trophyChests:[];
 return many.length?many:world?.trophyChest?[world.trophyChest]:[]
}

function defaultReservedPoints(world,{includeBosses=true}={}){
 return[
  world?.start,world?.shop,world?.exit,world?.hotSpring,
  ...(world?.sectionPortals??[]).flatMap(portal=>[{x:portal.x,y:portal.y},{x:portal.arrivalX,y:portal.arrivalY}]),
  ...(world?.campaignKeys??[]),...(world?.chests??[]),...(world?.decorations??[]),
  ...(includeBosses?existingBossEntries(world):[]),...existingTrophyEntries(world)
 ].filter(point=>Number.isFinite(Number(point?.x))&&Number.isFinite(Number(point?.y)))
}

function chooseStableSectionPoint(section,{seed="",salt="",used=new Set(),awayFrom=[],safeExit=false}={}){
 const safe=safeExit?safeSectionExitCandidates(section):[],base=safe.length?safe:sectionCells(section),candidates=base.filter(point=>!used.has(pointKey(point)));
 if(!candidates.length)throw new RangeError(`Section ${String(section?.id??"?")} has no free campaign-boss spawn cell`);
 const center=section?.center??base[0]??{x:0,y:0};
 candidates.sort((left,right)=>{
  const separation=point=>awayFrom.length?Math.min(...awayFrom.map(other=>Math.abs(point.x-integer(other?.x))+Math.abs(point.y-integer(other?.y)))):99;
  const leftSafety=Math.min(8,separation(left)),rightSafety=Math.min(8,separation(right));if(leftSafety!==rightSafety)return rightSafety-leftSafety;
  const leftCenter=Math.abs(left.x-integer(center.x))+Math.abs(left.y-integer(center.y)),rightCenter=Math.abs(right.x-integer(center.x))+Math.abs(right.y-integer(center.y));if(leftCenter!==rightCenter)return leftCenter-rightCenter;
  return stableHash(seed,salt,left.x,left.y)-stableHash(seed,salt,right.x,right.y)
 });
 const selected={x:integer(candidates[0].x),y:integer(candidates[0].y),sectionId:String(section.id),roomId:String(section.id)};used.add(pointKey(selected));return selected
}

function capacityError(validation){
 const error=new RangeError(validation.errors.join("; ")||"Invalid campaign-boss section capacity");error.code="CAMPAIGN_BOSS_SECTION_CAPACITY";error.validation=validation;return error
}

export function campaignBossWorldObjectId(floor,bossId){
 const id=String(bossId??"").trim();if(!id)throw new TypeError("bossId is required");return`${Math.max(1,integer(floor,1))}-boss-${id}`
}

export function campaignBossTrophyChestId(floor,bossId){
 const id=String(bossId??"").trim();if(!id)throw new TypeError("bossId is required");return`${Math.max(1,integer(floor,1))}-trophy-${id}`
}

export function requiredCampaignBossSectionCount(floor,bossIds,requested=4){
 const value=Math.max(1,integer(floor,1)),count=bossIdAnalysis(bossIds).ids.length,milestoneMinimum=value===100?5:value===80||value===90?4:0;
 return Math.max(4,integer(requested,4),count+1,milestoneMinimum)
}

export function validateCampaignBossSectionCapacity(world,bossIds,{floor=1}={}){
 const value=Math.max(1,integer(floor,1)),analysis=bossIdAnalysis(bossIds),sections=validSections(world),startSectionId=resolveStartSectionId(world,sections),eligible=sections.filter(section=>String(section.id)!==startSectionId),required=requiredCampaignBossSectionCount(value,analysis.ids,4),errors=[];
 if(!sections.length)errors.push("campaign world has no sections");
 if(analysis.duplicates.length)errors.push(`duplicate boss IDs: ${analysis.duplicates.join(", ")}`);
 const expectedCount=CAMPAIGN_MILESTONE_BOSS_COUNTS[value];if(expectedCount&&analysis.ids.length!==expectedCount)errors.push(`${value}階 requires ${expectedCount} campaign bosses`);
 if(sections.length<required)errors.push(`${value}階 requires at least ${required} sections (received ${sections.length})`);
 if(eligible.length<analysis.ids.length)errors.push(`campaign bosses require ${analysis.ids.length} unique non-start sections (received ${eligible.length})`);
 return{valid:errors.length===0,errors,floor:value,bossIds:analysis.ids,duplicateBossIds:analysis.duplicates,startSectionId,totalSections:sections.length,availableBossSections:eligible.length,requiredSections:required}
}

export function createCampaignBossPlacements(world,bossIds,{floor=1,seed=floor,progress=null,reserved=[]}={}){
 const validation=validateCampaignBossSectionCapacity(world,bossIds,{floor});if(!validation.valid)throw capacityError(validation);
 const ids=validation.bossIds,sections=validSections(world),bySectionId=new Map(sections.map(section=>[String(section.id),section])),eligible=sections.filter(section=>String(section.id)!==validation.startSectionId),existing=new Map();
 for(const entry of existingBossEntries(world)){const id=objectBossId(entry,{floor,expected:ids});if(id&&!existing.has(id))existing.set(id,entry)}
 const assigned=new Map(),usedSections=new Set();
 for(const bossId of ids){
  const state=progressFor(progress,bossId),prior=existing.get(bossId),requested=String(state.bossAreaId??prior?.sectionId??prior?.roomId??"");
  if(requested&&requested!==validation.startSectionId&&bySectionId.has(requested)&&!usedSections.has(requested)){assigned.set(bossId,bySectionId.get(requested));usedSections.add(requested)}
 }
 const available=eligible.filter(section=>!usedSections.has(String(section.id))).sort((left,right)=>stableHash(seed,"boss-section",left.id)-stableHash(seed,"boss-section",right.id)||String(left.id).localeCompare(String(right.id)));
 for(const bossId of ids)if(!assigned.has(bossId)){const section=available.shift();assigned.set(bossId,section);usedSections.add(String(section.id))}
 const used=new Set(defaultReservedPoints(world,{includeBosses:false}).concat(reserved??[]).map(pointKey)),placements=[];
 for(const bossId of ids){
  const section=assigned.get(bossId),prior=existing.get(bossId),state=progressFor(progress,bossId),priorPoint=normalizedPoint(prior,section.id),point=priorPoint&&sectionContains(section,priorPoint)&&!used.has(pointKey(priorPoint))?{...priorPoint,sectionId:String(section.id),roomId:String(section.id)}:chooseStableSectionPoint(section,{seed,salt:`boss:${bossId}`,used,awayFrom:[world?.start,...(world?.sectionPortals??[])]});
  used.add(pointKey(point));
  const defeated=own(state,"defeated")?Boolean(state.defeated):Boolean(prior?.defeated||prior?.active===false),discovered=own(state,"discovered")?Boolean(state.discovered):prior?.hidden===false;
  placements.push({...record(prior),id:campaignBossWorldObjectId(floor,bossId),bossId,rewardOwnerId:bossId,...point,active:!defeated,hidden:!discovered,defeated})
 }
 return placements
}

function normalizeBosses(world,{floor,expected}){
 const result=[],seen=new Set();
 for(const source of existingBossEntries(world)){
  const bossId=objectBossId(source,{floor,expected});if(!bossId||seen.has(bossId))continue;
  const point=normalizedPoint(source);if(!point)continue;seen.add(bossId);
  const defeated=Boolean(source?.defeated||source?.active===false);
  result.push({...record(source),id:campaignBossWorldObjectId(floor,bossId),bossId,rewardOwnerId:bossId,...point,active:!defeated&&source?.active!==false,hidden:Boolean(source?.hidden),defeated})
 }
 return result
}

function normalizeTrophyChests(world,{floor,expected}){
 const result=[],seen=new Set();
 for(const source of existingTrophyEntries(world)){
  const bossId=objectBossId(source,{floor,expected});if(!bossId||seen.has(bossId))continue;
  const point=normalizedPoint(source);if(!point)continue;seen.add(bossId);
  const opened=Boolean(source?.open||source?.claimed),locksOpened=Math.max(0,Math.min(MAX_KEYS,integer(source?.locksOpened)));
  result.push({...record(source),id:campaignBossTrophyChestId(floor,bossId),bossId,rewardOwnerId:bossId,...point,active:source?.active!==false,open:opened,claimed:opened,locksOpened,locked:opened?false:Boolean(source?.locked)})
 }
 return result
}

function withLegacyAliases(world){
 const activeBoss=(world.bosses??[]).find(entry=>entry.active!==false&&!entry.defeated)??null,trophyChest=(world.trophyChests??[]).find(entry=>!entry.open)??world.trophyChests?.[0]??null;
 return{...world,boss:activeBoss,bossPoint:activeBoss?{x:activeBoss.x,y:activeBoss.y,sectionId:activeBoss.sectionId,roomId:activeBoss.roomId}:null,bossSectionId:activeBoss?.sectionId??null,trophyChest}
}

export function normalizeCampaignBossWorld(world,{floor=1,bossIds=[]}={}){
 const value=Math.max(1,integer(floor,1)),expected=bossIdAnalysis(bossIds).ids,bosses=normalizeBosses(world,{floor:value,expected}),trophyChests=normalizeTrophyChests(world,{floor:value,expected}),defeatedIds=new Set(trophyChests.map(entry=>entry.bossId));
 bosses.filter(entry=>entry.defeated).forEach(entry=>defeatedIds.add(entry.bossId));
 const bossDefeated=Boolean(world?.bossDefeated||defeatedIds.size),allBossesDefeated=expected.length>0&&expected.every(id=>defeatedIds.has(id));
 return withLegacyAliases({...record(world),bosses,trophyChests,bossDefeated,allBossesDefeated})
}

export function updateCampaignTrophyChestLocks(world,{floor=1,bossIds=[],keysHeld=0}={}){
 const held=Math.max(0,Math.min(MAX_KEYS,integer(keysHeld))),normalized=normalizeCampaignBossWorld(world,{floor,bossIds}),trophyChests=normalized.trophyChests.map(chest=>({...chest,locked:chest.open?false:held<MAX_KEYS,heldKeys:held}));
 return withLegacyAliases({...normalized,trophyChests})
}

function validExistingPoint(point,section){return Boolean(normalizedPoint(point,section?.id)&&sectionContains(section,point))}

function validWorldPoint(world,point){
 if(!normalizedPoint(point))return false;
 const requested=String(point?.sectionId??point?.roomId??""),sections=validSections(world),section=sections.find(entry=>String(entry.id)===requested)??sections.find(entry=>sectionContains(entry,point));
 return Boolean(section&&sectionContains(section,point))
}

function chooseAftermathPoint(section,{preferred=null,world,used,seed,salt,safeExit=false}={}){
 const point=normalizedPoint(preferred,section.id);
 if(point&&sectionContains(section,point)&&!used.has(pointKey(point))){used.add(pointKey(point));return{...point,sectionId:String(section.id),roomId:String(section.id)}}
 return chooseStableSectionPoint(section,{seed,salt,used,awayFrom:defaultReservedPoints(world),safeExit})
}

export function applyCampaignBossDefeatToWorld(world,{floor=1,bossId,bossIds=[],bossInfo=null,progress=null,keysHeld=0,seed=floor,trophyPoint=null,springPoint=null,exitPoint=null,hotSpringUsed=null,finalFloor=100}={}){
 const value=Math.max(1,integer(floor,1)),target=String(bossId??"").trim(),expected=bossIdAnalysis(bossIds.length?bossIds:[target]).ids;
 if(!target||!expected.includes(target))throw new RangeError(`Unknown campaign boss: ${target||"(empty)"}`);
 const normalized=normalizeCampaignBossWorld(world,{floor:value,bossIds:expected}),boss=normalized.bosses.find(entry=>entry.bossId===target);if(!boss)throw new RangeError(`Campaign boss ${target} is not placed in the world`);
 const section=(normalized.sections??[]).find(entry=>String(entry.id)===String(boss.sectionId));if(!section)throw new RangeError(`Campaign boss ${target} has no valid section`);
 const state=progressFor(progress,target),existingChest=normalized.trophyChests.find(entry=>entry.bossId===target),used=new Set(defaultReservedPoints(normalized).map(pointKey));
 // An existing aftermath object owns its cell and may be reused. New objects
 // must avoid every reserved field object, including the defeated boss sprite.
 const trophyPreferred=validExistingPoint(existingChest,section)?existingChest:state.trophySpawn??trophyPoint;
 if(trophyPreferred)used.delete(pointKey(trophyPreferred));
 const trophySpawn=chooseAftermathPoint(section,{preferred:trophyPreferred,world:normalized,used,seed,salt:`trophy:${target}`});
 const claimed=Boolean(state.trophyClaimed||existingChest?.open||existingChest?.claimed),locksOpened=Math.max(0,Math.min(MAX_KEYS,integer(state.trophyLocksOpened??existingChest?.locksOpened))),held=Math.max(0,Math.min(MAX_KEYS,integer(keysHeld))),canonicalBossInfo={...record(boss.bossInfo),...record(bossInfo),bossId:target,rewardOwnerId:target};
 const trophyChest={...record(existingChest),id:campaignBossTrophyChestId(value,target),bossId:target,rewardOwnerId:target,...trophySpawn,active:true,open:claimed,claimed,locked:claimed?false:held<MAX_KEYS,heldKeys:held,locksOpened,label:"支配者の戦利品",bossInfo:canonicalBossInfo};
 const bosses=normalized.bosses.map(entry=>entry.bossId===target?{...entry,active:false,hidden:false,defeated:true}:entry),trophyChests=[...normalized.trophyChests.filter(entry=>entry.bossId!==target),trophyChest];
 let hotSpring=normalized.hotSpring?{...normalized.hotSpring}:null,exit=normalized.exit?{...normalized.exit}:null;
 // A durable defeat may be newer than its field snapshot. In that recovery
 // path bossDefeated is already true although the shared aftermath objects are
 // absent, so repair missing objects regardless of whether this is a new win.
 // Existing valid objects may live in the first defeated god's section and
 // must never move when a later god falls.
 if(!validWorldPoint(normalized,hotSpring))hotSpring=chooseAftermathPoint(section,{preferred:springPoint,world:normalized,used,seed,salt:`spring:${target}`});
 if(!validWorldPoint(normalized,exit))exit=chooseAftermathPoint(section,{preferred:exitPoint,world:normalized,used,seed,salt:`exit:${target}`,safeExit:true});
 const springUsed=hotSpringUsed==null?Boolean(progress?.hotSpringUsed||hotSpring?.used):Boolean(hotSpringUsed);
 // A used spring remains part of the cleared dungeon scenery. `used` blocks
 // another recovery; `active` only controls whether the object is rendered.
 if(hotSpring)hotSpring={...hotSpring,active:true,used:springUsed,scale:Number(hotSpring.scale)||5.9,radius:Number(hotSpring.radius)||.8};
 if(exit)exit={...exit,locked:false,active:true,kind:value>=Math.max(1,integer(finalFloor,100))?"final-gate":"next-floor",label:value>=Math.max(1,integer(finalFloor,100))?"勇者決戦へ":"次の階層へ"};
 const defeatedIds=new Set(trophyChests.map(entry=>entry.bossId)),allBossesDefeated=expected.every(id=>defeatedIds.has(id)),previousSpawns=record(normalized.postBossSpawns),trophies={...record(previousSpawns.trophies),[target]:trophySpawn};
 const next=updateCampaignTrophyChestLocks({...normalized,bosses,trophyChests,bossDefeated:true,allBossesDefeated,hotSpring,exit,nextEncounter:Number.MAX_SAFE_INTEGER,postBossSpawns:{...previousSpawns,trophies,spring:hotSpring?normalizedPoint(hotSpring):null,exit:exit?normalizedPoint(exit):null},postBossRevealPending:!existingChest,postBossRevealBossId:target},{floor:value,bossIds:expected,keysHeld:held});
 return next
}

export function shouldRegenerateCampaignBossSnapshot(source,{floor=null,bossIds=null}={}){
 const snapshot=record(source),world=record(snapshot.world??snapshot),value=Math.max(1,integer(floor??snapshot.floor??world.floor,1)),layoutVersion=integer(world.layoutVersion,-1),expected=bossIds==null?null:bossIdAnalysis(bossIds).ids;
 if(!CAMPAIGN_MILESTONE_BOSS_COUNTS[value]||expected&&expected.length<=1)return false;
 return LEGACY_MULTI_BOSS_LAYOUT_VERSIONS.includes(layoutVersion)
}
