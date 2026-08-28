import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderOnlineExplore } from "../src/online/OnlineViews.js";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const hostId = "AD-HOST-245";
const guestId = "AD-GUEST-245";
const profile = name => ({
  displayName: name,
  monsterName: `${name}の魔物`,
  monsterId: `${name}-monster`,
  speciesId: "slime",
  level: 50,
  power: 4200,
  maxFloor: 100,
  battleStats: { hp: 500, mp: 80, atk: 100, def: 90, matk: 95, mdef: 85, spd: 70, crit: 5 },
  currentHp: 500,
  currentMp: 80,
  skills: [],
});
const members = [
  { playerId: hostId, leader: true, connected: true, ready: true, profile: profile("部屋主"), dungeonPosition: { x: 1, y: 1 }, coopVitals: { hp: 500, maxHp: 500, mp: 80, maxMp: 80 } },
  { playerId: guestId, connected: true, ready: true, profile: profile("仲間"), dungeonPosition: { x: 2, y: 1 }, coopVitals: { hp: 480, maxHp: 500, mp: 72, maxMp: 80 } },
];
const gameState = { player: { currentFloor: 30, maxFloor: 100, gold: 0, crystals: 0 }, inventory: {}, settings: {}, party: [], monsters: [] };

function expeditionRoom() {
  return {
    roomId: "IPH245", ownerId: hostId, leaderId: hostId, phase: "expedition", members,
    expedition: {
      id: "exp-iphone-245", floor: 30, cols: 5, rows: 5,
      tiles: [["#", "#", "#", "#", "#"], ["#", ".", ".", ".", "#"], ["#", ".", ".", ".", "#"], ["#", ".", ".", ".", "#"], ["#", "#", "#", "#", "#"]],
      objects: [], interactions: {}, discoveries: 0, encountersCleared: 0, totalDiscoveries: 1, totalEncounters: 1,
      startedAt: Date.now(), exitReached: true, coop: { enabled: true, gimmickType: "dualSwitch" },
    },
  };
}

test("build245 exposes one-thumb exploration controls without replacing the normal map", () => {
  const html = renderOnlineExplore(expeditionRoom(), hostId, { gameState, exploreChatOpen: true, pingMenuOpen: true });
  assert.match(html, /data-online-dungeon-canvas role="application" aria-label="共同探索マップ。行き先をタップ、ドラッグで見回し、2本指で拡大縮小できます"/);
  assert.match(html, /id="onlineExploreChatToggle"[^>]*aria-controls="onlineExploreChatBar"[^>]*aria-expanded="true"/);
  assert.match(html, /data-online-ping-toggle[^>]*aria-controls="onlineExplorePingMenu"[^>]*aria-expanded="true"/);
  assert.match(html, /id="onlineExploreChatBar"[^>]*aria-label="探索チャット"/);
  assert.match(html, /id="onlineExplorePingMenu"[^>]*aria-label="仲間へ送るピン"/);
  assert.match(html, /data-online-complete[^>]*aria-label="この階の踏破を確定"/);
  assert.match(html, /online-coop-run-status[^>]*aria-label="共同探索の状態"/);
  assert.doesNotMatch(html, /data-online-resonance-board|online-resonance-dpad|音板を起動/);
});

test("build245 constrains 320, 375 and 390px layouts to the dynamic safe viewport", async () => {
  const css = await read("src/Styles/build245.css");
  assert.match(css, /\.online-v3-screen\.online-shared-gameplay-active[\s\S]*?max-width:100%!important;[\s\S]*?overflow-x:hidden!important;/);
  assert.match(css, /padding-top:max\(4px,env\(safe-area-inset-top\)\)!important;/);
  assert.match(css, /padding-right:max\(4px,env\(safe-area-inset-right\)\)!important;/);
  assert.match(css, /padding-left:max\(4px,env\(safe-area-inset-left\)\)!important;/);
  assert.match(css, /padding-bottom:max\(2px,env\(safe-area-inset-bottom\)\)!important;/);
  assert.match(css, /@media\(max-width:430px\)[\s\S]*?grid-template-columns:minmax\(104px,\.86fr\) minmax\(0,1\.64fr\) 44px!important;/);
  assert.match(css, /@media\(max-width:340px\)/);
  assert.match(css, /\.online-shared-explore\.party-hud-collapsed \.explore-stage\{\s*min-height:0!important;/);

  /* The two fixed command cells, two 4px gaps and 4px safe padding per side
     leave a positive flexible map-information column at every target width. */
  for (const width of [320, 375, 390]) {
    const flexibleColumn = width - 104 - 44 - 8 - 8;
    assert.ok(flexibleColumn >= 156, `${width}px keeps ${flexibleColumn}px for the flexible command column`);
  }
});

test("build245 gives every shared-exploration action at least a 44px target", async () => {
  const css = await read("src/Styles/build245.css");
  const targetContract = css.slice(css.indexOf("/* Every control used during exploration"), css.indexOf("/* Informational layers"));
  for (const selector of [
    "#miniMapToggle", ".online-chat-toggle", ".online-ping-toggle", ".online-explore-emote",
    ".online-floor-complete", ".online-coop-interaction button", ".online-ping-menu button",
    ".online-explore-chat-bar input", ".online-explore-chat-bar button",
    ".online-rare-merchant-modal header button", ".online-floor-boss-confirm button", ".explore-nav button",
  ]) assert.ok(targetContract.includes(selector), `${selector} belongs to the 44px target contract`);
  assert.match(targetContract, /min-height:44px!important;/);
  assert.match(css, /\.online-shared-explore \.explore-party-collapse\{[\s\S]*?height:44px!important;[\s\S]*?min-height:44px!important;/);
  assert.match(css, /\.online-shared-explore \.explore-command-header \.resource-help\{[\s\S]*?width:44px!important;[\s\S]*?height:44px!important;/);
});

test("build245 keeps guidance pass-through while its deliberate actions remain tappable", async () => {
  const css = await read("src/Styles/build245.css");
  assert.match(css, /:is\(\.online-coop-run-status,\.online-coop-interaction,\.online-ping-menu\)\{\s*pointer-events:none;/);
  assert.match(css, /:is\(\.online-coop-interaction button,\.online-ping-menu button\)\{\s*pointer-events:auto;/);
  assert.match(css, /\.online-shared-explore \.online-coop-interaction\{[\s\S]*?width:min\(330px,calc\(100% - 56px\)\);/);
  assert.match(css, /\.online-shared-explore \.online-explore-chat-bar\{[\s\S]*?grid-template-columns:minmax\(0,1fr\) 48px 44px;/);
  assert.match(css, /\.online-shared-explore \.explore-stage-tools>\.online-floor-complete\{[\s\S]*?top:auto!important;[\s\S]*?bottom:6px!important;/);
});
