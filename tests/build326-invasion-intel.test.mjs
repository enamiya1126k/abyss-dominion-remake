import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{spawnSync}from"node:child_process";
import{fileURLToPath}from"node:url";
import{CampaignIntelScreen}from"../src/ui/screens/CampaignIntelScreen.js";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("Build326 opens the full prophecy card as a keyboard-safe detail route",async()=>{
 const[home,main]=await Promise.all([read("../src/ui/screens/HomeScreen.js"),read("../src/main.js")]);
 assert.match(home,/id="openCampaignIntel"/);assert.match(home,/data-open-campaign-intel role="button" tabindex="0"/);assert.match(home,/予言と勇者侵攻の詳細を見る/);assert.match(home,/home-intel-cue/);
 assert.match(main,/screen==="campaignIntel"/);assert.match(main,/createCampaignInvasionIntelModel\(save\.state\)/);assert.match(main,/event\.target\.closest\("#openCampaignFinal"\)/);assert.match(main,/\["Enter"," "\]/);
});

test("Build326 models the eleven-point route and hero wounds without mutating saves",()=>{
 const cwd=fileURLToPath(new URL("..",import.meta.url)),script=String.raw`
import fs from'node:fs/promises';import vm from'node:vm';import assert from'node:assert/strict';
const context=vm.createContext({console,Date,Math,Number,Object,Array,Set,Map,String,Boolean,JSON,structuredClone});
const stub=new vm.SourceTextModule('export const CAMPAIGN_MAX_FLOOR=100;export const HERO_PARTY_IDS=Object.freeze(["myth_enami","myth_yori","myth_hide","myth_rion"]);',{context,identifier:'Campaign100System.js'});await stub.link(()=>{});await stub.evaluate();
const hero=new vm.SourceTextModule(await fs.readFile('src/core/CampaignHeroEncounterSystem.js','utf8'),{context,identifier:'CampaignHeroEncounterSystem.js'});await hero.link(async spec=>spec.includes('Campaign100System')?stub:Promise.reject(new Error(spec)));await hero.evaluate();
const intel=new vm.SourceTextModule(await fs.readFile('src/core/CampaignInvasionIntelSystem.js','utf8'),{context,identifier:'CampaignInvasionIntelSystem.js'});await intel.link(async spec=>spec.includes('CampaignHeroEncounterSystem')?hero:Promise.reject(new Error(spec)));await intel.evaluate();
const I=intel.namespace,H=hero.namespace,fresh={player:{currentFloor:1,maxFloor:1},campaign100:{}},before=JSON.stringify(fresh),first=I.createCampaignInvasionIntelModel(fresh);assert.equal(JSON.stringify(fresh),before);assert.equal(first.route.length,11);assert.equal(first.current.name,'西の大陸・王都門');assert.equal(first.next.name,'西の大陸・港湾街');assert.equal(first.remainingDays,10);
const ledger=H.createCampaignHeroEncounterState();ledger.heroes.myth_yori.remainingHpRate=.58;ledger.heroes.myth_yori.lowestHpRate=.58;ledger.heroes.myth_yori.encounters=2;ledger.heroes.myth_hide.defeated=true;ledger.heroes.myth_hide.remainingHpRate=0;const state={player:{currentFloor:43,maxFloor:43},campaign100:{heroEncounters310:ledger}},model=I.createCampaignInvasionIntelModel(state),yori=model.heroes.find(entry=>entry.id==='myth_yori'),hide=model.heroes.find(entry=>entry.id==='myth_hide');assert.equal(yori.status,'遭遇済み');assert.equal(yori.woundPercent,42);assert.equal(hide.status,'撃退済み');assert.equal(hide.remainingHpPercent,0);assert.equal(model.current.name,'境界砦');assert.equal(model.progress,42);
console.log('route + live hero records: ok');`;
 const result=spawnSync(process.execPath,["--experimental-vm-modules","--input-type=module","-e",script],{cwd,encoding:"utf8"});assert.equal(result.status,0,`${result.stdout}\n${result.stderr}`);assert.match(result.stdout,/route \+ live hero records: ok/);
});

test("Build326 renders generated map art, tappable locations and all four strategy files",()=>{
 const route=Array.from({length:11},(_,index)=>({id:`p${index}`,day:index,progress:index*10,x:8+index*8,y:66-index*5,name:index?`地点${index}`:"西の大陸・王都門",shortName:index?`地点${index}`:"王都門",detail:"地点の説明"})),heroes=["より","ひで","えなみ","りおん"].map((name,index)=>({id:`h${index}`,name,title:`称号${index}`,role:"役割",field:"追跡情報",combat:"戦闘情報",counter:"攻略対策",status:"未遭遇",remainingHpPercent:100,woundPercent:0,encounters:0})),model={route,currentIndex:0,current:route[0],next:route[1],day:1,progress:0,remainingDays:10,partyStatus:"魔王城へ進軍中",heroes};
 const map=CampaignIntelScreen(model,{tab:"map"});assert.match(map,/campaign-invasion-map-build326\.webp/);assert.equal((map.match(/data-campaign-route-index=/g)??[]).length,22);assert.match(map,/勇者一行/);assert.match(map,/魔王城/);assert.match(map,/西の大陸・王都門/);assert.match(map,/残り10日/);
 const files=CampaignIntelScreen(model,{tab:"heroes"});for(const name of["より","ひで","えなみ","りおん"])assert.match(files,new RegExp(name));for(const label of["追跡","戦闘","対策"])assert.match(files,new RegExp(label));
});

test("Build326 is phone-safe, read-only, asset-backed and versioned",async()=>{
 const[index,config,css,main,asset]=await Promise.all([read("../index.html"),read("../src/core/config.js"),read("../src/Styles/build326-invasion-intel.css"),read("../src/main.js"),readFile(new URL("../assets/world/campaign-invasion-map-build326.webp",import.meta.url))]);
 assert.ok(asset.length>100000);assert.match(index,/build326-invasion-intel\.css\?v=3\.1\.7-build326/);assert.match(index,/const ASSET_VERSION = "3\.1\.7"/);assert.match(index,/const ASSET_BUILD = "build326"/);assert.match(config,/SAVE_SCHEMA_VERSION=84/);assert.match(config,/APP_VERSION="3\.1\.7"/);
 assert.match(css,/100dvh/);assert.match(css,/env\(safe-area-inset-top\)/);assert.match(css,/min-height:44px/);assert.match(css,/@media\(max-width:430px\)/);assert.match(css,/prefers-reduced-motion:reduce/);
 const start=main.indexOf("function bindCampaignIntel"),end=main.indexOf("function bindStoryArchive",start),binder=main.slice(start,end);assert.doesNotMatch(binder,/save\.save|reward|encounterRoll|player\./);
});
