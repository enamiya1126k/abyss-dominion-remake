import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("Build323 bumps the cache and save schema exactly once",async()=>{
 const[index,config,save,home]=await Promise.all([read("../index.html"),read("../src/core/config.js"),read("../src/services/SaveService.js"),read("../src/ui/screens/HomeScreen.js")]);
 assert.match(index,/build323-hero-story\.css\?v=3\.1\.4-build323/);
 assert.match(index,/const ASSET_VERSION = "3\.1\.4"/);
 assert.match(index,/const ASSET_BUILD = "build323"/);
 assert.match(config,/SAVE_SCHEMA_VERSION=81/);
 assert.match(config,/APP_VERSION="3\.1\.4"/);
 assert.match(save,/CampaignHeroEncounterSystem\.js\?v=3\.1\.4-build323/);
 assert.match(save,/CampaignReincarnationSystem\.js\?v=3\.1\.4-build323/);
 assert.match(home,/CampaignHeroEncounterSystem\.js\?v=3\.1\.4-build323/);
});

test("Build323 locks encounter rolls until each authored solo prelude is acknowledged",async()=>{
 const[encounters,branch]=await Promise.all([read("../src/core/CampaignHeroEncounterSystem.js"),read("../src/core/CampaignHeroBranchStorySystem.js")]);
 assert.match(encounters,/CAMPAIGN_HERO_ENCOUNTER_VERSION=3/);
 assert.match(encounters,/preludeSeen:false/);
 assert.match(encounters,/event\.preludeSeen===true&&\["scheduled","armed"\]\.includes\(event\.status\)/);
 assert.match(encounters,/reason:"prelude-required"/);
 assert.match(branch,/event\?\.preludeSeen!==true/);
 assert.match(branch,/preludeSeen:true,status:event\.status==="scheduled"\?"armed":event\.status/);
 const preludeKeys=branch.match(/"myth_(?:yori|hide|enami|rion):[12]":Object\.freeze/g)??[];
 assert.equal(preludeKeys.length,8,"every hero has a first and second solo prelude");
 assert.match(branch,/いや、4人で行く必要ある？/);
 assert.match(branch,/誰かがやられたら、その後を引き継ぐ者が要る/);
 assert.match(branch,/オレが偵察してくるわ！！/);
 assert.match(branch,/おい待て待て！！/);
});

test("Build323 queues result, Lionel report, and same-timeline hero chatter for all outcomes",async()=>{
 const[branch,main]=await Promise.all([read("../src/core/CampaignHeroBranchStorySystem.js"),read("../src/main.js")]);
 assert.match(branch,/CAMPAIGN_HERO_BRANCH_OUTCOMES=Object\.freeze\(\["repelled","hero-victory","escaped"\]\)/);
 assert.match(branch,/entries=\["result","report","party"\]\.map/);
 assert.match(branch,/title:"玉座への進捗報告"/);
 assert.match(branch,/title:"同じ頃、勇者一行は"/);
 assert.match(branch,/stageEffect:"lionel-slime"/);
 assert.match(branch,/十日目まで/);
 assert.match(branch,/fallen\.map/);
 assert.match(main,/queueCampaignHeroAftermath\(settled\.state/);
 assert.match(main,/nextCampaignStoryScene\(save\.state,options\)\?\?nextCampaignHeroBranchStoryScene/);
 assert.match(main,/branchStory\?acknowledgeCampaignHeroBranchStoryScene/);
 assert.match(main,/scene\.id===CAMPAIGN_STORY_OPENING_ID\|\|branchStory\|\|!exploreAutoActive\(\)/);
});

test("Build323 makes a hero visibly appear, pursue, contact, and leave",async()=>{
 const[main,css]=await Promise.all([read("../src/main.js"),read("../src/Styles/build323-hero-story.css")]);
 assert.match(main,/function showCampaignHeroFieldReveal/);
 assert.match(main,/WARNING \/ INTRUDER/);
 assert.match(main,/勇者接近/);
 assert.match(main,/距離 \$\{distance\}/);
 assert.match(main,/追跡 \$\{Math\.min\(chaseSteps,maxSteps\)\}\/\$\{maxSteps\}/);
 assert.match(main,/queueCampaignStoryScenes\(\{delay:260\}\)/);
 assert.match(css,/\.campaign-hero-field-reveal/);
 assert.match(css,/\.campaign-hero-chase-timer/);
 assert.match(css,/data-hero-hunt-state="contact"/);
 assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
});

test("Build323 starts every reincarnation with a fresh branch ledger",async()=>{
 const reincarnation=await read("../src/core/CampaignReincarnationSystem.js");
 assert.match(reincarnation,/CAMPAIGN_REINCARNATION_VERSION=2/);
 assert.match(reincarnation,/progress\.cycle=Math\.min\(999,progress\.cycle\+1\);campaign\.heroEncounters310=createCampaignHeroEncounterState\(\{storyCycle:progress\.cycle\}\)/);
});
