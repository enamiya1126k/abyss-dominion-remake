import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{spawnSync}from"node:child_process";
import{fileURLToPath}from"node:url";
import{StoryArchiveScreen}from"../src/ui/screens/StoryArchiveScreen.js";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("Build324 exposes the Prophecy Archive with phone-safe categories and hidden branches",async()=>{
 const[index,config,home,main,css]=await Promise.all([read("../index.html"),read("../src/core/config.js"),read("../src/ui/screens/HomeScreen.js"),read("../src/main.js"),read("../src/Styles/build324-story-archive.css")]);
 assert.match(index,/build324-story-archive\.css\?v=3\.1\.5-build324/);assert.match(index,/const ASSET_BUILD = "build324"/);assert.match(config,/SAVE_SCHEMA_VERSION=82/);assert.match(config,/APP_VERSION="3\.1\.5"/);
 assert.match(home,/id:"openStoryArchive"/);assert.match(home,/title:"予言録"/);assert.match(main,/screen==="storyArchive"/);assert.match(main,/createCampaignStoryArchiveModel\(save\.state\)/);
 assert.match(css,/min-height: 44px/);assert.match(css,/env\(safe-area-inset-top\)/);assert.match(css,/env\(safe-area-inset-bottom\)/);assert.match(css,/@media \(max-width: 430px\)/);assert.match(css,/prefers-reduced-motion: reduce/);
 const html=StoryArchiveScreen({read:1,total:4,categories:[{id:"prologue",label:"序章",eyebrow:"PROLOGUE",read:1,total:1,entries:[{id:"one",type:"scene",title:"序章",subtitle:"玉座",available:true,scenes:[{}]}]},{id:"demon",label:"魔王軍",eyebrow:"DEMON",read:0,total:3,entries:[{id:"branch",type:"branch",title:"報告",subtitle:"玉座",available:false,variants:[{outcome:"repelled",label:"迷宮側勝利",available:false},{outcome:"hero-victory",label:"勇者側勝利",available:false},{outcome:"escaped",label:"逃走",available:false}]}]},{id:"heroes",label:"勇者一行",eyebrow:"HEROES",read:0,total:0,entries:[]}]},{category:"demon"});
assert.match(html,/序章/);assert.match(html,/魔王軍/);assert.match(html,/勇者一行/);assert.ok((html.match(/？？？/g)??[]).length>=4);
});

test("Build324 replay is isolated from acknowledgements, saving, rewards and encounter state",async()=>{
 const[main,archive]=await Promise.all([read("../src/main.js"),read("../src/core/CampaignStoryArchiveSystem.js")]),start=main.indexOf("function showCampaignStoryReplaySequence"),end=main.indexOf("function queueCampaignStoryScenes",start),replay=main.slice(start,end);
 assert.match(replay,/campaignStoryPresentationBody\(scene\)/);assert.match(replay,/回想を閉じる/);assert.doesNotMatch(replay,/save\.save|acknowledgeCampaign|recordCampaignStoryArchiveScene|queueCampaignStoryScenes|reward|player\./);
 assert.match(archive,/const snapshot=cloneSerializable\(state\)\?\?\{\}/);assert.match(archive,/createCampaignStoryArchiveModel/);assert.match(main,/recordCampaignStoryArchiveScene\(save\.state,scene,\{seenAt\}\)/);
});

test("Build324 executes all four heroes through win, loss and escape archive branches",()=>{
 const cwd=fileURLToPath(new URL("..",import.meta.url)),script=String.raw`
import fs from'node:fs/promises';import vm from'node:vm';import assert from'node:assert/strict';
const context=vm.createContext({console,Date,Math,Number,Object,Array,Set,Map,String,Boolean,JSON,structuredClone});
const stub=new vm.SourceTextModule('export const CAMPAIGN_MAX_FLOOR=100;export const HERO_PARTY_IDS=Object.freeze(["myth_enami","myth_yori","myth_hide","myth_rion"]);',{context,identifier:'Campaign100System.js'});
const load=async(file,id)=>new vm.SourceTextModule(await fs.readFile(file,'utf8'),{context,identifier:id});
const hero=await load('src/core/CampaignHeroEncounterSystem.js','CampaignHeroEncounterSystem.js');await hero.link(async spec=>spec.includes('Campaign100System')?stub:Promise.reject(new Error(spec)));await hero.evaluate();
const story=await load('src/core/CampaignStorySystem.js','CampaignStorySystem.js');await story.link(async spec=>spec.includes('Campaign100System')?stub:Promise.reject(new Error(spec)));await story.evaluate();
const branch=await load('src/core/CampaignHeroBranchStorySystem.js','CampaignHeroBranchStorySystem.js');await branch.link(async spec=>spec.includes('Campaign100System')?stub:spec.includes('CampaignHeroEncounterSystem')?hero:Promise.reject(new Error(spec)));await branch.evaluate();
const archive=await load('src/core/CampaignStoryArchiveSystem.js','CampaignStoryArchiveSystem.js');await archive.link(async spec=>spec.includes('CampaignStorySystem')?story:spec.includes('CampaignHeroBranchStorySystem')?branch:spec.includes('CampaignHeroEncounterSystem')?hero:Promise.reject(new Error(spec)));await archive.evaluate();
const H=hero.namespace,B=branch.namespace,A=archive.namespace,heroes=['myth_enami','myth_yori','myth_hide','myth_rion'],outcomes=['repelled','hero-victory','escaped'];
for(const heroId of heroes)for(const outcome of outcomes){let ledger=H.createCampaignHeroEncounterState(),definition=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(entry=>entry.heroId===heroId),prelude=B.nextCampaignHeroBranchStoryScene(ledger,{floor:definition.floor});ledger=B.acknowledgeCampaignHeroBranchStoryScene(ledger,{sceneId:prelude.id}).state;assert.ok(H.campaignHeroEncounterCandidate(ledger,{floor:definition.floor,encounterRoll:0,visitedSections:2,stepsSinceBattle:6,partyHpRate:1}));ledger=H.activateCampaignHeroEncounter(ledger,{encounterId:definition.id,floor:definition.floor}).state;const rate=outcome==='repelled'?0:outcome==='hero-victory'?0.54:0.82,settled=H.settleCampaignHeroEncounter(ledger,{encounterId:definition.id,resultId:heroId+'-'+outcome,heroId,outcome,floor:definition.floor,hpRate:rate,repelled:outcome==='repelled'});ledger=B.queueCampaignHeroAftermathStories(settled.state,{encounterId:definition.id,outcome,floor:definition.floor,heroHpRate:rate,storyCycle:0}).state;const state={player:{maxFloor:definition.floor,currentFloor:definition.floor},campaign100:{heroEncounters310:ledger}};while(ledger.branchStories323.pending.length){const scene=B.nextCampaignHeroBranchStoryScene(ledger,{floor:definition.floor});A.recordCampaignStoryArchiveScene(state,scene,{seenAt:'2026-09-04T00:00:00.000Z'});ledger=B.acknowledgeCampaignHeroBranchStoryScene(ledger,{sceneId:scene.id}).state;state.campaign100.heroEncounters310=ledger}const before=JSON.stringify(state),model=A.createCampaignStoryArchiveModel(state);assert.equal(JSON.stringify(state),before);const heroEntry=model.categories.find(category=>category.id==='heroes').entries.find(entry=>entry.id==='archive-encounter-'+definition.id),demonEntry=model.categories.find(category=>category.id==='demon').entries.find(entry=>entry.id==='archive-report-'+definition.id);assert.equal(heroEntry.variants.filter(variant=>variant.available).length,1);assert.equal(demonEntry.variants.filter(variant=>variant.available).length,1);assert.equal(heroEntry.variants.find(variant=>variant.outcome===outcome).available,true);assert.equal(demonEntry.variants.find(variant=>variant.outcome===outcome).available,true)}
const fresh={player:{maxFloor:1,currentFloor:1},campaign100:{}},freshBefore=JSON.stringify(fresh),freshModel=A.createCampaignStoryArchiveModel(fresh);assert.equal(freshModel.read,0);assert.equal(JSON.stringify(fresh),freshBefore);
let legacy=H.createCampaignHeroEncounterState(),def=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE[0],pre=B.nextCampaignHeroBranchStoryScene(legacy,{floor:def.floor});legacy=B.acknowledgeCampaignHeroBranchStoryScene(legacy,{sceneId:pre.id}).state;legacy=H.activateCampaignHeroEncounter(legacy,{encounterId:def.id,floor:def.floor}).state;legacy=H.settleCampaignHeroEncounter(legacy,{encounterId:def.id,resultId:'legacy',heroId:def.heroId,outcome:'escaped',floor:def.floor,hpRate:.9}).state;legacy.version=3;delete legacy.events[def.id].heroHpRate;delete legacy.events[def.id].hurtPercent;legacy.branchStories323.receipts.push('branch-result-'+def.id+'-escaped');delete legacy.branchStories323.history;const legacyState={player:{maxFloor:def.floor,currentFloor:def.floor},campaign100:{heroEncounters310:legacy}},legacyModel=A.createCampaignStoryArchiveModel(legacyState);assert.equal(legacyModel.categories.find(category=>category.id==='heroes').entries.find(entry=>entry.id==='archive-encounter-'+def.id).variants.find(variant=>variant.outcome==='escaped').available,true);
console.log('12 hero outcome branches + fresh + legacy: ok');`;
 const result=spawnSync(process.execPath,["--experimental-vm-modules","--input-type=module","-e",script],{cwd,encoding:"utf8"});assert.equal(result.status,0,`${result.stdout}\n${result.stderr}`);assert.match(result.stdout,/12 hero outcome branches \+ fresh \+ legacy: ok/);
});

test("Build324 reset starts empty while reincarnation preserves accumulated archive records",async()=>{
 const[save,reincarnation]=await Promise.all([read("../src/services/SaveService.js"),read("../src/core/CampaignReincarnationSystem.js")]);
 assert.match(save,/reset\(\)\{/);assert.match(save,/this\.state=initialState\(\)/);assert.doesNotMatch(save.slice(save.indexOf("function initialState"),save.indexOf("export class SaveService")),/storyArchive324/);
 const begin=reincarnation.slice(reincarnation.indexOf("export function beginOptionalCampaignReincarnation"));assert.doesNotMatch(begin,/delete campaign\.storyArchive324/);assert.match(begin,/createCampaignHeroEncounterState\(\{storyCycle:progress\.cycle\}\)/);
});
