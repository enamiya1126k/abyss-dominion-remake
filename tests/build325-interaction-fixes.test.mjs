import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("Build325 moves the Prophecy Archive away from the crowded Home utility rail",async()=>{
 const[home,main,css]=await Promise.all([read("../src/ui/screens/HomeScreen.js"),read("../src/main.js"),read("../src/Styles/build325-fixes.css")]);
 const rightRail=home.slice(home.indexOf('<aside class="home-right-menu"'),home.indexOf("</aside>",home.indexOf('<aside class="home-right-menu"')));
 assert.doesNotMatch(rightRail,/openStoryArchive/);
 assert.match(home,/title:"記憶の間"/);
 assert.match(main,/function openMemoryArchiveHub/);
 assert.match(main,/data-memory-room="battle"/);
 assert.match(main,/data-memory-room="story"/);
 assert.match(main,/go\("storyArchive"\)/);
 assert.match(css,/\.memory-archive-hub > button/);
 assert.match(css,/min-height: 76px/);
});

test("Build325 makes Complete Codex category filtering authoritative",async()=>{
 const[main,css]=await Promise.all([read("../src/main.js"),read("../src/Styles/build325-fixes.css")]);
 const start=main.indexOf("function openCompleteMonsterCodex"),end=main.indexOf("function openEquipmentCodexDetail",start),source=main.slice(start,end);
 assert.match(source,/selectedGroup==="all"\|\|row\.dataset\.codexGroup===selectedGroup/);
 assert.match(source,/row\.style\.setProperty\("display","none","important"\)/);
 assert.match(source,/row\.style\.removeProperty\("display"\)/);
 assert.match(css,/\[data-complete-codex\]\[hidden\]/);
 assert.match(css,/display: none !important/);
});

test("Build325 keeps the first battle item above the arena hit layer on iPhone",async()=>{
 const[battle,css]=await Promise.all([read("../src/ui/screens/BattleScreen.js"),read("../src/Styles/build325-fixes.css")]);
 assert.match(battle,/battle\.itemMenu\|\|battle\.onlineItemTargetMenu\?"has-item-menu"/);
 assert.match(css,/\.battle-command\.has-item-menu \{/);
 assert.match(css,/z-index: 80 !important/);
 assert.match(css,/\.battle-command\.has-item-menu \.battle-item-list/);
 assert.match(css,/max-height: min\(39dvh, 410px\) !important/);
 assert.match(css,/-webkit-overflow-scrolling: touch/);
 assert.match(css,/pointer-events: auto !important/);
});

test("Build325 renders parallel section passages that darken toward the far end",async()=>{
 const main=await read("../src/main.js"),start=main.indexOf("function drawCampaignSectionPortal"),end=main.indexOf("function drawCampaignKey",start),source=main.slice(start,end);
 assert.match(source,/passageWidth=size\*\.68/);
 assert.match(source,/fillRect\(-passageWidth,farY,passageWidth\*2,totalHeight\)/);
 assert.match(source,/Math\.pow\(t1,1\.72\)/);
 assert.match(source,/moveTo\(-passageWidth,nearY\);c\.lineTo\(-passageWidth,farY\)/);
 assert.match(source,/moveTo\(passageWidth,nearY\);c\.lineTo\(passageWidth,farY\)/);
 assert.doesNotMatch(source,/nearWidth|farWidth|createLinearGradient|drawExploreParticles/);
});

test("Build325 bumps cache and save versions exactly once",async()=>{
 const[index,config]=await Promise.all([read("../index.html"),read("../src/core/config.js")]);
 assert.match(index,/build325-fixes\.css\?v=3\.1\.6-build325/);
 assert.match(index,/const ASSET_VERSION = "3\.1\.6"/);
 assert.match(index,/const ASSET_BUILD = "build325"/);
 assert.match(config,/SAVE_SCHEMA_VERSION=83/);
 assert.match(config,/APP_VERSION="3\.1\.6"/);
});
