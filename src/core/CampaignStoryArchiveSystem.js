import{CAMPAIGN_STORY_OPENING,CAMPAIGN_STORY_SCENES,normalizeCampaignStoryState,resolveCampaignStoryScene}from"./CampaignStorySystem.js?v=3.1.21-build340";
import{CAMPAIGN_HERO_ENCOUNTER_SCHEDULE,normalizeCampaignHeroInvasion,createCampaignHeroEncounterState}from"./CampaignHeroEncounterSystem.js?v=3.1.22-build341";
import{CAMPAIGN_HERO_BRANCH_OUTCOMES,campaignHeroBranchStorySceneById,normalizeCampaignHeroBranchStoryState}from"./CampaignHeroBranchStorySystem.js?v=3.1.22-build341";

export const CAMPAIGN_STORY_ARCHIVE_VERSION=1;
export const CAMPAIGN_STORY_ARCHIVE_CATEGORIES=Object.freeze([
 Object.freeze({id:"prologue",label:"序章",eyebrow:"PROLOGUE"}),
 Object.freeze({id:"demon",label:"魔王軍",eyebrow:"DEMON LORD"}),
 Object.freeze({id:"heroes",label:"勇者一行",eyebrow:"HEROES"})
]);

const HERO_NAMES=Object.freeze({myth_enami:"えなみ",myth_yori:"より",myth_hide:"ひで",myth_rion:"りおん"});
const OUTCOME_LABELS=Object.freeze({repelled:"迷宮側勝利","hero-victory":"勇者側勝利",escaped:"逃走"});
const plainRecord=value=>Boolean(value&&typeof value==="object"&&!Array.isArray(value));
const cleanText=(value,max=180)=>typeof value==="string"?value.replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,max):"";
const boundedInteger=(value,fallback=0,min=0,max=Number.MAX_SAFE_INTEGER)=>{const number=Number(value);return Number.isFinite(number)?Math.max(min,Math.min(max,Math.floor(number))):fallback};
const cloneSerializable=value=>{try{return typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value))}catch{return null}};

function storyCycle(state){return boundedInteger(state?.campaign100?.reincarnation319?.cycle,0,0,999)}
function archiveRecords(state){
 const source=state?.campaign100?.storyArchive324,records=[];for(const entry of Array.isArray(source?.records)?source.records:[]){const sceneId=cleanText(entry?.sceneId),scene=cloneSerializable(entry?.scene);if(!sceneId||!plainRecord(scene)||scene.id!==sceneId)continue;records.push({key:cleanText(entry.key,240)||`${boundedInteger(entry.cycle,0,0,999)}:${sceneId}`,sceneId,cycle:boundedInteger(entry.cycle,0,0,999),recordedAt:cleanText(entry.recordedAt,40)||null,scene})}return records.slice(-256)
}

export function recordCampaignStoryArchiveScene(state,scene,{seenAt=null}={}){
 if(!plainRecord(state)||!plainRecord(scene))return{recorded:false,reason:"invalid-state"};const sceneId=cleanText(scene.id),snapshot=cloneSerializable(scene);if(!sceneId||!snapshot)return{recorded:false,reason:"invalid-scene"};state.campaign100=plainRecord(state.campaign100)?state.campaign100:{};const cycle=storyCycle(state),archive=plainRecord(state.campaign100.storyArchive324)?state.campaign100.storyArchive324:{},records=archiveRecords(state),key=`${cycle}:${sceneId}`,entry={key,sceneId,cycle,recordedAt:cleanText(seenAt,40)||new Date().toISOString(),scene:snapshot},index=records.findIndex(record=>record.key===key);if(index>=0)records.splice(index,1);records.push(entry);state.campaign100.storyArchive324={version:CAMPAIGN_STORY_ARCHIVE_VERSION,records:records.slice(-256)};return{recorded:true,key,sceneId,cycle}
}

function archivedHeroContext(record,records){
 const ids=Object.keys(HERO_NAMES),healthy=()=>Object.fromEntries(ids.map(id=>[id,{defeated:false,remainingHpRate:1}]));
 let context={heroes:healthy(),awayHeroIds:[]};
 const adopt=scene=>{
  const source=scene.heroStoryState?.heroes??scene.heroContinuity;if(!plainRecord(source))return false;
  context={heroes:Object.fromEntries(ids.map(id=>{const hero=source[id]??{},rate=hero.remainingHpRate??(1-(Number(hero.damageRatio)||0));return[id,{...hero,defeated:hero.defeated===true||(Number(hero.repelledCount)||0)>0||rate<=0,remainingHpRate:Math.max(0,Math.min(1,rate))}]})),awayHeroIds:[...(scene.heroStoryState?.awayHeroIds??[])]};return true;
 };
 for(const prior of records){
  if(prior.cycle!==record.cycle)continue;
  const scene=prior.scene,isTarget=prior===record;
  adopt(scene);
  // Old branch scenes did not store their cast. Reconstruct from their own
  // cycle's recorded events, never today's roster or another reincarnation.
  for(const entry of scene.dialogue??[])if(!entry.speakerId&&/戻らない|戻らなかった|帰路を失った/.test(entry.text??""))for(const id of ids)if(String(entry.text).includes(HERO_NAMES[id]))context.heroes[id]={...context.heroes[id],defeated:true,remainingHpRate:0};
  if(isTarget)break;
  const definition=CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(event=>event.id===scene.encounterId);
  if(scene.storyPart==="prelude"&&definition&&Number(record.scene.floor)<=definition.windowEnd)context.awayHeroIds=[definition.heroId];
  if(["result","party"].includes(scene.storyPart)&&definition){
   context.awayHeroIds=context.awayHeroIds.filter(id=>id!==definition.heroId);
   if(scene.variant==="repelled")context.heroes[definition.heroId]={...context.heroes[definition.heroId],defeated:true,remainingHpRate:0};
  }
 }
 return context;
}
function repairArchivedScene(record,records){
 const original=cloneSerializable(record.scene);if(!original||original.castVersion>=340)return original;
 const context=archivedHeroContext(record,records),definition=CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(event=>event.id===original.encounterId);
 if(original.kind==="hero-branch"&&definition){
  const ledger=createCampaignHeroEncounterState({storyCycle:record.cycle});ledger.heroes={...ledger.heroes,...context.heroes};
  const away=CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(event=>context.awayHeroIds.includes(event.heroId));
  if(away){ledger.activeEncounterId=away.id;ledger.events[away.id]={...ledger.events[away.id],status:"active"}}
  const percentage=(original.dialogue??[]).map(line=>String(line.text??"").match(/(?:損傷は |損傷は|損傷|刻まれた|相手へ)(\d+)%/)).find(Boolean);
  if(percentage)ledger.heroes[definition.heroId].remainingHpRate=Math.max(0,1-Number(percentage[1])/100);
  if(original.storyPart!=="prelude"&&original.variant==="repelled")ledger.heroes[definition.heroId]={...ledger.heroes[definition.heroId],defeated:true,remainingHpRate:0};
  return campaignHeroBranchStorySceneById(ledger,original.id)??original;
 }
 const away=CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(event=>context.awayHeroIds.includes(event.heroId));
 const state={campaign100:{story309:{heroContinuity:context.heroes},heroEncounters310:{heroes:context.heroes,activeEncounterId:away?.id,events:away?{[away.id]:{heroId:away.heroId,status:"active"}}:{}}}};
 return resolveCampaignStoryScene(original.id,state)??original;
}
function storedScene(records,sceneId){const record=[...records].reverse().find(entry=>entry.sceneId===sceneId);return record?.scene?repairArchivedScene(record,records):null}
function historicalLedger(ledger,floor,{beforeEncounterId=null}={}){
 const result=createCampaignHeroEncounterState({storyCycle:ledger.storyCycle});
 for(const definition of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE){
  const event=ledger.events?.[definition.id];
  if(!event||event.status!=="resolved"||definition.id===beforeEncounterId||Number(event.resolvedFloor??definition.floor)>floor)continue;
  const rate=event.heroHpRate??(event.outcome==="repelled"?0:1),old=result.heroes[definition.heroId];
  result.heroes[definition.heroId]={...old,remainingHpRate:Math.min(old.remainingHpRate,rate),defeated:old.defeated||event.outcome==="repelled"||rate<=0,lastOutcome:event.outcome,lastSeenFloor:event.resolvedFloor};
  result.events[definition.id]={...event};
 }
 result.branchStories323={...ledger.branchStories323,history:(ledger.branchStories323?.history??[]).filter(entry=>entry.storyCycle===ledger.storyCycle&&entry.encounterId!==beforeEncounterId&&entry.floor<=floor)};
 return result;
}
function historicalBranchScene(ledger,sceneId){
 const definition=CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(entry=>sceneId.includes(entry.id));if(!definition)return null;
 const prelude=sceneId===`branch-prelude-${definition.id}`,event=ledger.events?.[definition.id],floor=prelude?definition.floor:event?.resolvedFloor??definition.floor;
 return campaignHeroBranchStorySceneById(historicalLedger(ledger,floor,{beforeEncounterId:prelude?definition.id:null}),sceneId);
}
function historicalMilestoneScene(ledger,definition){
 const past=historicalLedger(ledger,definition.floor);
 return resolveCampaignStoryScene(definition.id,{campaign100:{story309:{heroContinuity:past.heroes},heroEncounters310:past}});
}
function sceneEntry({id,title,subtitle,sortKey,scene,available}){return{id,type:"scene",title,subtitle,sortKey,available:Boolean(available),scenes:available&&scene?[scene]:[]}}
function branchEntry({id,title,subtitle,sortKey,variants}){return{id,type:"branch",title,subtitle,sortKey,available:variants.some(entry=>entry.available),variants}}
function seenScene({records,receipts,sceneId,fallback}){const stored=storedScene(records,sceneId);if(stored)return stored;if(!receipts.has(sceneId))return null;return fallback()}
function branchVariants({ledger,records,receipts,definition,parts}){
 return CAMPAIGN_HERO_BRANCH_OUTCOMES.map(outcome=>{const scenes=[];for(const part of parts){const sceneId=`branch-${part}-${definition.id}-${outcome}`,scene=seenScene({records,receipts,sceneId,fallback:()=>historicalBranchScene(ledger,sceneId)});if(scene)scenes.push(scene)}return{outcome,label:OUTCOME_LABELS[outcome],available:scenes.length>0,scenes}})
}
function categoryModel(definition,entries){const sorted=[...entries].sort((left,right)=>left.sortKey-right.sortKey||left.title.localeCompare(right.title,"ja")),total=sorted.reduce((sum,entry)=>sum+(entry.type==="branch"?entry.variants.length:1),0),read=sorted.reduce((sum,entry)=>sum+(entry.type==="branch"?entry.variants.filter(variant=>variant.available).length:entry.available?1:0),0);return{...definition,entries:sorted,total,read}}

export function createCampaignStoryArchiveModel(state){
 const snapshot=cloneSerializable(state)??{},records=archiveRecords(snapshot),story=normalizeCampaignStoryState(snapshot),ledger=normalizeCampaignHeroBranchStoryState(normalizeCampaignHeroInvasion(snapshot)),canonicalReceipts=new Set(story.seenSceneIds??[]),branchReceipts=new Set(ledger.branchStories323?.receipts??[]),prologue=[],demon=[],heroes=[];
 const openingStored=storedScene(records,CAMPAIGN_STORY_OPENING.id),openingRead=Boolean(openingStored||canonicalReceipts.has(CAMPAIGN_STORY_OPENING.id)),openingScene=openingStored??(openingRead?resolveCampaignStoryScene(CAMPAIGN_STORY_OPENING.id,snapshot):null);prologue.push(sceneEntry({id:"archive-opening",title:"滅びた世界、最弱の器",subtitle:"魔王サイラーンと預言者リオネル",sortKey:0,scene:openingScene,available:openingRead}));
 for(const definition of CAMPAIGN_STORY_SCENES){const stored=storedScene(records,definition.id),available=Boolean(stored||canonicalReceipts.has(definition.id)),scene=stored??(available?historicalMilestoneScene(ledger,definition):null);heroes.push(sceneEntry({id:`archive-${definition.id}`,title:`予言 ${definition.day}日目`,subtitle:definition.location,sortKey:definition.floor*10,scene,available}))}
 for(const definition of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE){const heroName=HERO_NAMES[definition.heroId]??"勇者",preludeId=`branch-prelude-${definition.id}`,preludeStored=storedScene(records,preludeId),preludeRead=Boolean(preludeStored||branchReceipts.has(preludeId)),prelude=preludeStored??(preludeRead?historicalBranchScene(ledger,preludeId):null),sortBase=definition.floor*10;
  heroes.push(sceneEntry({id:`archive-prelude-${definition.id}`,title:`${heroName}、単独行動`,subtitle:`予言 ${definition.day}日目・遭遇前`,sortKey:sortBase+1,scene:prelude,available:preludeRead}));
  heroes.push(branchEntry({id:`archive-encounter-${definition.id}`,title:`${heroName}との遭遇`,subtitle:`第${definition.floor}〜${definition.windowEnd}階・結果分岐`,sortKey:sortBase+2,variants:branchVariants({ledger,records,receipts:branchReceipts,definition,parts:["result","party"]})}));
  demon.push(branchEntry({id:`archive-report-${definition.id}`,title:`${heroName}・進捗報告`,subtitle:`リオネルからサイラーンへ`,sortKey:sortBase,variants:branchVariants({ledger,records,receipts:branchReceipts,definition,parts:["report"]})}));
 }
 const categoryEntries={prologue,demon,heroes},categories=CAMPAIGN_STORY_ARCHIVE_CATEGORIES.map(category=>categoryModel(category,categoryEntries[category.id]));return{version:CAMPAIGN_STORY_ARCHIVE_VERSION,categories,total:categories.reduce((sum,category)=>sum+category.total,0),read:categories.reduce((sum,category)=>sum+category.read,0)}
}
