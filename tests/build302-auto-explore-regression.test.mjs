import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";
import {ExploreScreen} from "../src/ui/screens/ExploreScreen.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");

test("solo exploration exposes one persistent 自動攻略 ON/OFF control",()=>{
 const screen=read("src/ui/screens/ExploreScreen.js");
 assert.match(screen,/id="exploreAutoToggle"/);
 assert.match(screen,/>自動攻略</);
 assert.match(screen,/data-explore-auto-state/);
 assert.match(screen,/aria-pressed="\$\{autoActive\}"/);
 assert.doesNotMatch(screen,/data-explore-auto-mode=/,"old three-mode menu must not remain exposed");
 assert.doesNotMatch(screen,/<details class="explore-auto-controller"/);
});

test("rendered button accurately reflects OFF and ON state",()=>{
 const state={player:{currentFloor:8,maxFloor:8,gold:0,crystals:0,inRun:true},inventory:{},settings:{exploreAutoMode:"off"},party:[],monsters:[]};
 const options={floor:8,party:[],combatPower:0,progress:0,run:{startedAt:Date.now()}};
 const off=ExploreScreen(state,options);
 assert.match(off,/id="exploreAutoToggle"[^>]*data-state="off"[^>]*aria-pressed="false"/);
 assert.match(off,/data-explore-auto-state>OFF</);
 state.settings.exploreAutoMode="floor";
 const on=ExploreScreen(state,options);
 assert.match(on,/id="exploreAutoToggle"[^>]*class="explore-auto-toggle active"[^>]*data-state="on"[^>]*aria-pressed="true"/);
 assert.match(on,/data-explore-auto-state>ON</);
});

test("the control is fixed inside the stage and cannot inherit an old off-screen position",()=>{
 const css=read("src/Styles/build302-auto.css"),main=read("src/main.js"),index=read("index.html");
 assert.match(css,/\.explore-stage>\.explore-auto-toggle\{/);
 assert.match(css,/right:7px!important/);
 assert.match(css,/bottom:64px!important/);
 assert.match(css,/top:auto!important/);
 assert.match(css,/z-index:50!important/);
 assert.match(css,/touch-action:manipulation!important/);
 assert.match(main,/autoExploreButtonPosition!=null.*autoExploreButtonPosition=null/s);
 assert.match(index,/build302-auto\.css\?v=3\.0\.3-build303/);
});

test("one tap uses the existing floor auto mode and state is stopped safely",()=>{
 const main=read("src/main.js");
 assert.match(main,/exploreAutoMode\(\)==="off"\?"floor":"off"/);
 assert.match(main,/autoToggle\?\.addEventListener\("click"/);
 assert.match(main,/function setExploreAutoMode\(mode\)/);
 assert.match(main,/const next=mode==="off"\?"off":"floor"/);
 assert.match(main,/stopExploreAuto\("手動操作へ切り替え"\)/);
 assert.match(main,/function openManualReturnConfirmation\(\)\{[\s\S]*?stopExploreAuto\(\)/);
 assert.match(main,/completeContextGuide\("dungeon_departure"[\s\S]*?exploreAutoMode="off"/);
});

test("floor auto performs the complete current-floor loop",()=>{
 const main=read("src/main.js"),start=main.indexOf("function fullFloorAutoTargets()"),end=main.indexOf("function applyExploreAutoPath()",start);
 assert.ok(start>=0&&end>start,"full-floor planner must exist");
 const planner=main.slice(start,end);
 const keys=planner.indexOf("world.campaignKeys"),chests=planner.indexOf("world.chests"),unvisited=planner.indexOf("world.sections"),boss=planner.indexOf("world.bossDefeated"),trophy=planner.indexOf("world.trophyChest"),spring=planner.indexOf("world.hotSpring"),exit=planner.indexOf("world.exit");
 for(const [label,index] of Object.entries({keys,chests,unvisited,boss,trophy,spring,exit}))assert.ok(index>=0,`${label} step must exist`);
 assert.ok(Math.max(keys,chests,unvisited)<boss,"exploration pickups must be planned before a deliberate boss route");
 assert.ok(boss<trophy&&trophy<spring&&spring<exit,"post-boss order must be trophy, optional spring, then exit");
 assert.match(planner,/campaignKeysHeld\(floorState\)>=CAMPAIGN_KEYS_PER_FLOOR/,"trophy must never be targeted below three held keys");
 assert.match(main,/if\(mode==="floor"\)targets\.push\(\.\.\.fullFloorAutoTargets\(\)\)/);
});
