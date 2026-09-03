import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {fileURLToPath} from "node:url";
import {ExploreScreen} from "../src/ui/screens/ExploreScreen.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");

test("solo exploration exposes one compact 自動 ON/OFF control with assistive semantics",()=>{
 const screen=read("src/ui/screens/ExploreScreen.js");
 assert.match(screen,/id="exploreAutoToggle"/);
 assert.match(screen,/<b>自動<\/b>/);
 assert.match(screen,/data-explore-auto-state/);
 assert.match(screen,/aria-pressed="\$\{autoActive\}"/);
 assert.match(screen,/aria-label="自動攻略を\$\{autoActive\?"停止":"開始"\}"/);
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

test("the compact control is draggable, clamped, and restores its saved position",()=>{
 const css=read("src/Styles/build306-ui.css"),main=read("src/main.js"),saveService=read("src/services/SaveService.js"),index=read("index.html");
 assert.match(css,/\.explore-stage>\.explore-auto-toggle\{/);
 assert.match(css,/width:86px!important/);
 assert.match(css,/height:44px!important/);
 assert.match(css,/touch-action:none!important/);
 assert.match(main,/const clampPosition=\(element,position,fallback\)=>/);
 assert.match(main,/bindDrag\(autoButton,"autoExploreButtonPosition",autoFallback\(\),\{onTap:toggleAuto\}\)/);
 assert.match(main,/save\.state\.settings\[settingKey\]=final;save\.save\(\)/);
 assert.match(main,/place\(autoButton,save\.state\.settings\.autoExploreButtonPosition,autoFallback\(\)\)/);
 assert.match(saveService,/s\.settings\.autoExploreButtonPosition=normalizeUiPosition\(s\.settings\.autoExploreButtonPosition\)/);
 assert.doesNotMatch(main,/autoExploreButtonPosition!=null.*autoExploreButtonPosition=null/s);
 assert.match(index,/build306-ui\.css\?v=3\.0\.6-build306/);
});

test("one generic drag-handler tap uses floor auto mode and state is stopped safely",()=>{
 const main=read("src/main.js");
 assert.match(main,/exploreAutoMode\(\)==="off"\?"floor":"off"/);
 assert.match(main,/const bindDrag=\(element,settingKey,fallback,\{onTap=null,handle=null\}=\{\}\)=>/);
 assert.match(main,/else if\(upEvent\.type!=="pointercancel"&&onTap\)\{suppressClick=true;onTap\(\)/);
 assert.doesNotMatch(main,/autoToggle\?\.addEventListener\("click"/);
 assert.match(main,/function setExploreAutoMode\(mode\)/);
 assert.match(main,/const next=mode==="off"\?"off":"floor"/);
 assert.match(main,/stopExploreAuto\("手動操作へ切り替え"\)/);
 assert.match(main,/function openManualReturnConfirmation\(\)\{[\s\S]*?stopExploreAuto\(\)/);
 assert.match(main,/completeContextGuide\("dungeon_departure"[\s\S]*?exploreAutoMode="off"/);
});

test("build308 floor auto performs the complete current-floor loop for every field boss",()=>{
 const main=read("src/main.js"),start=main.indexOf("function fullFloorAutoTargets()"),end=main.indexOf("function applyExploreAutoPath()",start);
 assert.ok(start>=0&&end>start,"full-floor planner must exist");
 const planner=main.slice(start,end);
 const keys=planner.indexOf("world.campaignKeys"),chests=planner.indexOf("world.chests"),unvisited=planner.indexOf("world.sections"),bosses=planner.indexOf("campaignWorldBosses(world)"),trophies=planner.indexOf("campaignWorldTrophyChests(world)"),spring=planner.indexOf("world.hotSpring"),exit=planner.indexOf("world.exit");
 for(const [label,index] of Object.entries({keys,chests,unvisited,bosses,trophies,spring,exit}))assert.ok(index>=0,`${label} step must exist`);
 assert.ok(Math.max(keys,chests,unvisited)<bosses,"exploration pickups must be planned before deliberate boss routes");
 assert.ok(bosses<trophies&&trophies<spring&&spring<exit,"post-boss order must be every trophy, optional spring, then exit");
 assert.match(planner,/campaignWorldBosses\(world\)\.filter\(entry=>entry\.active!==false\)/,"all still-active floor bosses must remain AUTO targets");
 assert.match(planner,/campaignWorldTrophyChests\(world\)\.filter\(entry=>!entry\.open\)/,"all unopened per-boss trophy chests must remain AUTO targets");
 assert.match(planner,/campaignKeysHeld\(floorState\)>=CAMPAIGN_KEYS_PER_FLOOR/,"trophy must never be targeted below three held keys");
 assert.match(main,/if\(mode==="floor"\)targets\.push\(\.\.\.fullFloorAutoTargets\(\)\)/);
});
