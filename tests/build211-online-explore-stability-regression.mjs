import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { OnlinePartyController } from "../src/online/OnlinePartyClient.js";
import { APP_VERSION, SAVE_SCHEMA_VERSION } from "../src/core/config.js";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const html = read("index.html"), main = read("src/main.js"), client = read("src/online/OnlinePartyClient.js"), css = read("src/Styles/build211.css");

assert.match(html, /build211\.css\?v=2\.11\.46-build211/);
assert.match(html, /ASSET_BUILD\s*=\s*"build211"/);
assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.46-build211/);
assert.equal(APP_VERSION, "2.11.46");
assert.equal(SAVE_SCHEMA_VERSION, 58);

assert.match(css, /online-explore-emote[\s\S]*position:absolute!important/);
assert.match(css, /online-explore-chat-bar input[\s\S]*font-size:16px!important/);
assert.match(client, /ONLINE_EXPLORE_EMOTE_POSITION/);
assert.match(client, /Math\.hypot\(dx, dy\) > 8/);
assert.match(client, /storageSet\(ONLINE_EXPLORE_EMOTE_POSITION/);
assert.match(client, /keepExploreCanvas/);

const room = {
  roomId: "ABC123", phase: "expedition", leaderId: "p1", chatHistory: [],
  members: [{ playerId: "p1", connected: true, profile: { battleStats: { hp: 100, maxHp: 100, mp: 40, maxMp: 40 } }, dungeonPosition: { x: 2, y: 2 } }],
  expedition: {
    id: "run-1", floor: 31, discoveries: 0, encountersCleared: 0, totalDiscoveries: 3, totalEncounters: 2,
    interactions: {}, coop: { resonance: { level: 0 }, rare: null }, objects: [], battle: null,
  },
};
const controller = Object.create(OnlinePartyController.prototype);
Object.assign(controller, {
  selfId: "p1", route: "explore", roomState: structuredClone(room), roomId: room.roomId,
  exploreCanvasMounted: true, interactionPending: null, merchantPending: false, merchantPendingTimer: null,
  merchantResult: null, rareMerchantOpen: false, unread: 0, chatBubbles: new Map(), coopPings: new Map(), socialBubbles: new Map(),
});
let renders = 0, updates = 0;
controller._showConnectionStep = () => {};
controller._render = () => { renders += 1; };
controller.onExploreCanvasUpdate = () => { updates += 1; };

const moved = structuredClone(room);
moved.members[0].dungeonPosition = { x: 3, y: 2 };
controller._applyRoomState(moved);
assert.equal(updates, 1, "movement-only room states must update the existing canvas");
assert.equal(renders, 0, "movement-only room states must not rebuild the explore screen");

const interactive = structuredClone(moved);
interactive.expedition.interactions.p1 = { action: "openChest", targetId: "chest-1", label: "開ける", hint: "宝箱を調べる" };
controller._applyRoomState(interactive);
assert.equal(renders, 1, "an interaction prompt change must still rebuild the surrounding HUD");

const listeners = new Map(), stored = new Map(), styleValues = {}, classes = new Set();
globalThis.window = {
  innerWidth: 390, innerHeight: 844,
  addEventListener(type, listener) { listeners.set(type, listener); },
  removeEventListener(type, listener) { if (listeners.get(type) === listener) listeners.delete(type); },
};
globalThis.document = { documentElement: { clientWidth: 390, clientHeight: 844 } };
globalThis.localStorage = { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, String(value)) };
const stage = { clientWidth: 370, clientHeight: 600, getBoundingClientRect: () => ({ left: 10, top: 100 }) };
const anchor = {
  dataset: {}, style: { setProperty: (key, value) => { styleValues[key] = value; } },
  classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
  matches: selector => selector === ".online-explore-emote", closest: selector => selector === ".explore-stage" ? stage : null,
  getBoundingClientRect: () => ({ left: 92, top: 112, width: 52, height: 48 }),
};
controller._beginEmoteGesture({ button: 0, pointerId: 7, clientX: 100, clientY: 130, preventDefault() {} }, anchor);
listeners.get("pointermove")?.({ pointerId: 7, clientX: 145, clientY: 150, preventDefault() {} });
listeners.get("pointerup")?.({ pointerId: 7, clientX: 145, clientY: 150 });
const savedPosition = JSON.parse(stored.get("abyss-online-explore-emote-position"));
assert.ok(savedPosition.x > 82, "a short slide must move and persist the explore emote button");
assert.ok(Number.parseFloat(styleValues.left) >= 82, "the button must stay inside the radial safe area");
assert.equal(classes.has("dragging"), false, "drag styling must be cleared after release");

console.log("build211 online explore stability regression: PASS");
