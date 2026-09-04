import{CAMPAIGN_STORY_OPENING,CAMPAIGN_STORY_SCENES,normalizeCampaignStoryState,resolveCampaignStoryScene}from"./CampaignStorySystem.js?v=3.1.3-build322";
import{CAMPAIGN_HERO_ENCOUNTER_SCHEDULE,normalizeCampaignHeroInvasion}from"./CampaignHeroEncounterSystem.js?v=3.1.5-build324";
import{CAMPAIGN_HERO_BRANCH_OUTCOMES,campaignHeroBranchStorySceneById,normalizeCampaignHeroBranchStoryState}from"./CampaignHeroBranchStorySystem.js?v=3.1.5-build324";

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

function storedScene(records,sceneId){const record=[...records].reverse().find(entry=>entry.sceneId===sceneId);return record?.scene?cloneSerializable(record.scene):null}
function sceneEntry({id,title,subtitle,sortKey,scene,available}){return{id,type:"scene",title,subtitle,sortKey,available:Boolean(available),scenes:available&&scene?[scene]:[]}}
function branchEntry({id,title,subtitle,sortKey,variants}){return{id,type:"branch",title,subtitle,sortKey,available:variants.some(entry=>entry.available),variants}}
function seenScene({records,receipts,sceneId,fallback}){const stored=storedScene(records,sceneId);if(stored)return stored;if(!receipts.has(sceneId))return null;return fallback()}
function branchVariants({ledger,records,receipts,definition,parts}){
 return CAMPAIGN_HERO_BRANCH_OUTCOMES.map(outcome=>{const scenes=[];for(const part of parts){const sceneId=`branch-${part}-${definition.id}-${outcome}`,scene=seenScene({records,receipts,sceneId,fallback:()=>campaignHeroBranchStorySceneById(ledger,sceneId)});if(scene)scenes.push(scene)}return{outcome,label:OUTCOME_LABELS[outcome],available:scenes.length>0,scenes}})
}
function categoryModel(definition,entries){const sorted=[...entries].sort((left,right)=>left.sortKey-right.sortKey||left.title.localeCompare(right.title,"ja")),total=sorted.reduce((sum,entry)=>sum+(entry.type==="branch"?entry.variants.length:1),0),read=sorted.reduce((sum,entry)=>sum+(entry.type==="branch"?entry.variants.filter(variant=>variant.available).length:entry.available?1:0),0);return{...definition,entries:sorted,total,read}}

export function createCampaignStoryArchiveModel(state){
 const snapshot=cloneSerializable(state)??{},records=archiveRecords(snapshot),story=normalizeCampaignStoryState(snapshot),ledger=normalizeCampaignHeroBranchStoryState(normalizeCampaignHeroInvasion(snapshot)),canonicalReceipts=new Set(story.seenSceneIds??[]),branchReceipts=new Set(ledger.branchStories323?.receipts??[]),prologue=[],demon=[],heroes=[];
 const openingStored=storedScene(records,CAMPAIGN_STORY_OPENING.id),openingRead=Boolean(openingStored||canonicalReceipts.has(CAMPAIGN_STORY_OPENING.id)),openingScene=openingStored??(openingRead?resolveCampaignStoryScene(CAMPAIGN_STORY_OPENING.id,snapshot):null);prologue.push(sceneEntry({id:"archive-opening",title:"滅びた世界、最弱の器",subtitle:"魔王サイラーンと預言者リオネル",sortKey:0,scene:openingScene,available:openingRead}));
 for(const definition of CAMPAIGN_STORY_SCENES){const stored=storedScene(records,definition.id),available=Boolean(stored||canonicalReceipts.has(definition.id)),scene=stored??(available?resolveCampaignStoryScene(definition.id,snapshot):null);heroes.push(sceneEntry({id:`archive-${definition.id}`,title:`予言 ${definition.day}日目`,subtitle:definition.location,sortKey:definition.floor*10,scene,available}))}
 for(const definition of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE){const heroName=HERO_NAMES[definition.heroId]??"勇者",preludeId=`branch-prelude-${definition.id}`,preludeStored=storedScene(records,preludeId),preludeRead=Boolean(preludeStored||branchReceipts.has(preludeId)),prelude=preludeStored??(preludeRead?campaignHeroBranchStorySceneById(ledger,preludeId):null),sortBase=definition.floor*10;
  heroes.push(sceneEntry({id:`archive-prelude-${definition.id}`,title:`${heroName}、単独行動`,subtitle:`予言 ${definition.day}日目・遭遇前`,sortKey:sortBase+1,scene:prelude,available:preludeRead}));
  heroes.push(branchEntry({id:`archive-encounter-${definition.id}`,title:`${heroName}との遭遇`,subtitle:`第${definition.floor}〜${definition.windowEnd}階・結果分岐`,sortKey:sortBase+2,variants:branchVariants({ledger,records,receipts:branchReceipts,definition,parts:["result","party"]})}));
  demon.push(branchEntry({id:`archive-report-${definition.id}`,title:`${heroName}・進捗報告`,subtitle:`リオネルからサイラーンへ`,sortKey:sortBase,variants:branchVariants({ledger,records,receipts:branchReceipts,definition,parts:["report"]})}));
 }
 const categoryEntries={prologue,demon,heroes},categories=CAMPAIGN_STORY_ARCHIVE_CATEGORIES.map(category=>categoryModel(category,categoryEntries[category.id]));return{version:CAMPAIGN_STORY_ARCHIVE_VERSION,categories,total:categories.reduce((sum,category)=>sum+category.total,0),read:categories.reduce((sum,category)=>sum+category.read,0)}
}
