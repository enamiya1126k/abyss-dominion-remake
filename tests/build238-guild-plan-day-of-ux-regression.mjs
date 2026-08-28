import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const values = new Map();
globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
globalThis.location = { search: "", protocol: "https:" };
globalThis.WebSocket = { OPEN: 1, CONNECTING: 0 };

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { onlineGuildPlanAttentions, renderOnlineFriendPanel, renderOnlineGuildPanel } = await import("../src/ui/screens/OnlinePartyScreen.js?build238-day-of-ux-test");
const { normalizeGuildPlanReminder, normalizeGuildState, OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?build238-day-of-ux-test");

const FIXED_NOW = Date.UTC(2026, 7, 28, 12, 0, 0);
const SELF_ID = "AD-AAAA-2222";
const HOST_ID = "AD-BBBB-2222";

function rawPlan(index = 0, overrides = {}) {
  const scheduledAt = FIXED_NOW + (index + 1) * 10 * 60_000;
  return {
    planId: `plan_${String(index).padStart(18, "0")}`,
    purpose: "explore", style: "casual", floor: 120 + index, note: `PLAN-${index}`,
    scheduledAt, createdAt: FIXED_NOW - 60 * 60_000,
    organizer: { displayName: `主催${index}`, fallbackEmoji: "竜" },
    attendees: [], goingCount: 0, maybeCount: 0, myStatus: "none", canCancel: false, canGather: false,
    gatherOpensAt: scheduledAt - 30 * 60_000, gatherClosesAt: scheduledAt + 2 * 60 * 60_000,
    gathering: null,
    ...overrides,
  };
}

function liveGathering(plan, overrides = {}) {
  return {
    recruitmentId: `recruit_${plan.planId.slice(-18)}`,
    hostPlayerId: HOST_ID,
    count: 1, max: 4, slots: 3,
    expiresAt: Math.min(plan.scheduledAt + 30 * 60_000, plan.gatherClosesAt),
    joined: false,
    ...overrides,
  };
}

function guildState(plans = [], serverNow = FIXED_NOW) {
  return {
    serverNow,
    guild: {
      guildId: "GD-ABC234", name: "深淵隊", tag: "ABYS", description: "当日導線テスト", level: 3,
      memberCount: 2, maxMembers: 20, leaderId: SELF_ID, role: "leader",
      members: [
        { playerId: SELF_ID, displayName: "自分", monsterName: "竜", fallbackEmoji: "竜", online: true, role: "leader" },
        { playerId: HOST_ID, displayName: "主催", monsterName: "魔", fallbackEmoji: "魔", online: true, role: "member" },
      ],
      applications: [], chat: [], plans, recruitments: [], activities: [],
      week: { weekId: "2026-08-24", points: 20, goals: [50, 200], tier: 0, sharedGoals: [] },
    },
    invitations: [], applications: [], lookup: null,
  };
}

function panelOptions(roomState = null, overrides = {}) {
  return {
    selfId: SELF_ID, connected: true, capability: true, activityCapability: true,
    planCapability: true, planGatheringCapability: true, recruitmentCapability: true,
    roomState, now: FIXED_NOW, ...overrides,
  };
}

function ownerLobby() {
  return { roomId: "ABC234", ownerId: SELF_ID, leaderId: SELF_ID, phase: "lobby", members: [{ playerId: SELF_ID }], listing: { published: false } };
}

function buttonEvent(attributes) {
  const button = {
    dataset: attributes,
    matches(selector) {
      return Object.keys(attributes).some(key => {
        const name = key.replace(/[A-Z]/g, character => `-${character.toLowerCase()}`);
        return selector.includes(`[data-${name}`);
      });
    },
  };
  return { target: { closest: selector => selector === "button" ? button : null } };
}

test("build238 retains optional serverNow and rejects unsafe reminder DTOs", () => {
  const state = normalizeGuildState(guildState([], FIXED_NOW));
  assert.equal(state.serverNow, FIXED_NOW);
  assert.equal(normalizeGuildState(guildState([], "bad")).serverNow, 0);

  const reminder = normalizeGuildPlanReminder({
    planId: "plan_000000000000000001", purpose: "raid", style: "help", floor: 90,
    scheduledAt: FIXED_NOW + 10 * 60_000, organizer: { displayName: "主催", fallbackEmoji: "魔" },
    gathering: { recruitmentId: "recruit_000000000000000001", count: 1, max: 4, slots: 3, expiresAt: FIXED_NOW + 20 * 60_000, joined: false },
    roomId: "SECRET", guildId: "GD-LEAK22", hostPlayerId: HOST_ID,
  });
  assert.ok(reminder);
  assert.deepEqual(Object.keys(reminder.gathering), ["recruitmentId", "count", "max", "slots", "expiresAt", "joined"]);
  assert.doesNotMatch(JSON.stringify(reminder), /SECRET|GD-LEAK22|hostPlayerId/);
  assert.equal(normalizeGuildPlanReminder({ ...reminder, organizer: null }), null);
  assert.equal(normalizeGuildPlanReminder({ ...reminder, organizer: [] }), null);
  assert.equal(normalizeGuildPlanReminder({ ...reminder, gathering: { ...reminder.gathering, joined: true } }), null);
});

test("build238 derives window and live attention without auto joining", () => {
  const due = rawPlan(0, { myStatus: "going" });
  const live = rawPlan(1, { myStatus: "none" }); live.gathering = liveGathering(live);
  const ignored = rawPlan(2, { myStatus: "none" });
  const state = normalizeGuildState(guildState([due, live, ignored]));
  const attention = onlineGuildPlanAttentions(state, { now: FIXED_NOW, selfId: SELF_ID });
  assert.deepEqual(attention.map(entry => entry.phase), ["live", "window"]);
  assert.deepEqual(attention.map(entry => entry.planId), [live.planId, due.planId]);
  assert.equal(attention.some(entry => entry.planId === ignored.planId), false);
  assert.equal(JSON.stringify(attention).includes("roomId"), false);
  assert.deepEqual(onlineGuildPlanAttentions(state, { now: FIXED_NOW, selfId: SELF_ID, connected: false }), []);
  assert.equal(onlineGuildPlanAttentions(state, { now: FIXED_NOW, selfId: SELF_ID, canJoinGathering: false }).some(entry => entry.planId === live.planId), false);
});

test("build238 exposes attention on the closed FAB, Guild tab, panel banner and target card", () => {
  const plan = rawPlan(0, { myStatus: "going" }); plan.gathering = liveGathering(plan);
  const state = normalizeGuildState(guildState([plan]));
  const closed = renderOnlineFriendPanel({}, { selfId: SELF_ID, guildState: state, guildOptions: panelOptions(), open: false });
  assert.match(closed, /online-guild-plan-attention closed live/);
  assert.match(closed, /data-online-guild-plan-attention=/);
  assert.match(closed, /遠征あり/);
  assert.doesNotMatch(closed, /data-online-guild-recruitment-join=/);

  const open = renderOnlineFriendPanel({}, { selfId: SELF_ID, guildState: state, guildOptions: panelOptions(), open: true, tab: "guild" });
  assert.match(open, /online-guild-plan-attention panel live/);
  assert.match(open, /<span>遠征 1<\/span>/);
  assert.match(open, /online-guild-plan-card going gathering-live attention attention-live/);
  assert.match(open, new RegExp(`data-online-guild-plan-card="${plan.planId}"`));
  assert.match(open, /data-online-guild-recruitment-join=/);
});

test("build238 gives only the planned gathering host an end-only control", () => {
  const hostPlan = rawPlan(0, { canGather: true, myStatus: "going", canCancel: true });
  hostPlan.gathering = liveGathering(hostPlan, { hostPlayerId: SELF_ID, joined: true });
  const hostHtml = renderOnlineGuildPanel(normalizeGuildState(guildState([hostPlan])), panelOptions(ownerLobby()));
  assert.match(hostHtml, /data-online-guild-plan-gathering-close/);
  assert.match(hostHtml, /data-online-guild-recruitment-close=/);
  assert.match(hostHtml, />集合を終了<\/button>/);

  const guestPlan = rawPlan(0, { myStatus: "going" }); guestPlan.gathering = liveGathering(guestPlan);
  const guestHtml = renderOnlineGuildPanel(normalizeGuildState(guildState([guestPlan])), panelOptions());
  assert.doesNotMatch(guestHtml, /data-online-guild-plan-gathering-close/);
  assert.match(guestHtml, /data-online-guild-recruitment-join=/);
});

test("build238 sends the existing close request and never cancels the persistent plan", () => {
  const plan = rawPlan(0, { canGather: true, myStatus: "going" }); plan.gathering = liveGathering(plan, { hostPlayerId: SELF_ID, joined: true });
  const sent = [], controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
  controller.selfId = SELF_ID; controller.connectionReady = true;
  controller.ws = { readyState: WebSocket.OPEN, send: value => sent.push(JSON.parse(value)) };
  controller.capabilities = new Set(["guildsV1", "guildPartyRecruitmentV1", "guildPlansV1", "guildPlanGatheringV1"]);
  controller.guildState = normalizeGuildState(guildState([plan]));
  controller._renderFriendPanel = () => {};
  const previousConfirm = globalThis.confirm; globalThis.confirm = () => true;
  try { controller._handleClick(buttonEvent({ onlineGuildPlanGatheringClose: "", onlineGuildRecruitmentClose: plan.gathering.recruitmentId })); }
  finally { globalThis.confirm = previousConfirm; }
  assert.deepEqual(sent, [{ type: "guildRecruitmentClose", recruitmentId: plan.gathering.recruitmentId }]);
  assert.equal(sent.some(message => message.type === "guildPlanCancel"), false);
});

test("build238 uses a bounded server clock for render and gather validation with local fallback", () => {
  const originalNow = Date.now;
  Date.now = () => FIXED_NOW - 3 * 60 * 60_000;
  try {
    const plan = rawPlan(0, { canGather: true, myStatus: "going" }), sent = [];
    const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
    controller.selfId = SELF_ID; controller.connectionReady = true;
    controller.ws = { readyState: WebSocket.OPEN, send: value => sent.push(JSON.parse(value)) };
    controller.capabilities = new Set(["guildsV1", "guildPlansV1", "guildPartyRecruitmentV1", "guildPlanGatheringV1"]);
    controller.guildState = normalizeGuildState(guildState([plan], FIXED_NOW));
    controller._syncGuildServerClock(controller.guildState.serverNow);
    controller.roomState = ownerLobby(); controller._renderFriendPanel = () => {};
    assert.equal(controller._guildNow(), FIXED_NOW);
    controller._handleClick(buttonEvent({ onlineGuildPlanGather: plan.planId }));
    assert.deepEqual(sent, [{ type: "guildPlanGather", planId: plan.planId }]);
    assert.equal(controller._syncGuildServerClock(FIXED_NOW + 32 * 24 * 60 * 60_000), false);
    assert.equal(controller._guildNow(), Date.now());
  } finally { Date.now = originalNow; }
});

test("build238 transition timer updates closed Social and Friends tab at the nearest boundary", () => {
  const originalNow = Date.now, originalSetTimeout = globalThis.setTimeout, originalClearTimeout = globalThis.clearTimeout;
  let now = FIXED_NOW, sequence = 0; const scheduled = new Map();
  Date.now = () => now;
  globalThis.setTimeout = (callback, delay) => { const id = ++sequence; scheduled.set(id, { callback, delay, cleared: false }); return id; };
  globalThis.clearTimeout = id => { const entry = scheduled.get(id); if (entry) entry.cleared = true; };
  try {
    const scheduledAt = FIXED_NOW + 30 * 60_000 + 1_000;
    const plan = rawPlan(0, { scheduledAt, gatherOpensAt: scheduledAt - 30 * 60_000, gatherClosesAt: scheduledAt + 2 * 60 * 60_000, myStatus: "going" });
    const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
    controller.guildState = normalizeGuildState(guildState([plan], FIXED_NOW));
    controller._syncGuildServerClock(FIXED_NOW);
    controller.capabilities = new Set(["guildPlansV1"]);
    controller.mounted = true; controller.connectionReady = true; controller.friendPanelOpen = false; controller.socialTab = "friends";
    let renders = 0; controller._renderFriendPanel = () => { renders += 1; controller._scheduleGuildPlanTransitionRender(); };
    controller._scheduleGuildPlanTransitionRender();
    const first = scheduled.get(controller.guildPlanTransitionTimer);
    assert.ok(first && first.delay >= 1_000 && first.delay <= 1_100);
    now += 1_025; first.cleared = true; first.callback();
    assert.equal(renders, 1);
    assert.ok(controller.guildPlanTransitionTimer);
  } finally { Date.now = originalNow; globalThis.setTimeout = originalSetTimeout; globalThis.clearTimeout = originalClearTimeout; }
});

test("build238 preserves keyboard focus when a closed Social reminder redraws", () => {
  const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
  controller.mounted = true; controller.connectionReady = true; controller.friendPanelOpen = false;
  controller.capabilities = new Set(["guildPlansV1"]); controller._scheduleGuildPlanTransitionRender = () => {};
  let focused = 0, markup = "";
  const oldToggle = { dataset: {}, matches: selector => selector === "[data-online-friends-toggle]" };
  const newToggle = { disabled: false, focus: options => { assert.equal(options.preventScroll, true); focused += 1; } };
  const layer = {
    contains: target => target === oldToggle,
    querySelector: selector => selector === "[data-online-friends-toggle]" ? newToggle : null,
    querySelectorAll: () => [],
    get innerHTML() { return markup; }, set innerHTML(value) { markup = value; },
  };
  controller._query = selector => selector === "[data-online-friend-layer]" ? layer : null;
  const previousDocument = globalThis.document, previousFrame = globalThis.requestAnimationFrame;
  globalThis.document = { activeElement: oldToggle };
  globalThis.requestAnimationFrame = callback => { callback(); return 1; };
  try { controller._renderFriendPanel(); }
  finally { globalThis.document = previousDocument; globalThis.requestAnimationFrame = previousFrame; }
  assert.ok(markup.includes("data-online-friends-toggle"));
  assert.equal(focused, 1);
});

test("build238 attention tap opens Guild, expands plans, scrolls and focuses the target", () => {
  const plan = rawPlan(0, { myStatus: "going" }), controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
  controller.guildState = normalizeGuildState(guildState([plan])); controller.mounted = true;
  let rendered = 0, focused = 0, scrolled = 0;
  const card = { focus: () => { focused += 1; }, scrollIntoView: options => { assert.equal(options.behavior, "auto"); scrolled += 1; } };
  controller._renderFriendPanel = () => { rendered += 1; };
  controller._query = selector => selector.includes("data-online-guild-plan-card") ? card : null;
  const previousFrame = globalThis.requestAnimationFrame; globalThis.requestAnimationFrame = callback => { callback(); return 1; };
  try { controller._handleClick(buttonEvent({ onlineGuildPlanAttention: plan.planId })); }
  finally { globalThis.requestAnimationFrame = previousFrame; }
  assert.equal(controller.friendPanelOpen, true);
  assert.equal(controller.socialTab, "guild");
  assert.equal(controller.guildPlansExpanded, true);
  assert.equal(rendered, 1); assert.equal(focused, 1); assert.equal(scrolled, 1);
});

test("build238 receipts toast each server reminder phase only once across controller instances", () => {
  values.delete("abyss-dominion-online-guild-plan-reminder-receipts-v1");
  const plan = { planId: "plan_000000000000000001", purpose: "explore", style: "casual", floor: 120, scheduledAt: FIXED_NOW + 10 * 60_000, organizer: { displayName: "主催", fallbackEmoji: "竜" } };
  const notices = [], first = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }), toast: message => notices.push(message) });
  first.selfId = SELF_ID; first._renderFriendPanel = () => {};
  first._handleMessage({ type: "guildPlanReminder", serverNow: FIXED_NOW, phase: "window", plan });
  first._handleMessage({ type: "guildPlanReminder", serverNow: FIXED_NOW, phase: "window", plan });
  first._handleMessage({ type: "guildPlanReminder", serverNow: FIXED_NOW, phase: "live", plan: { ...plan, gathering: { recruitmentId: "recruit_000000000000000001", count: 1, max: 4, slots: 3, expiresAt: FIXED_NOW + 30 * 60_000, joined: false } } });
  assert.equal(notices.length, 2);

  const reconnectNotices = [], second = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }), toast: message => reconnectNotices.push(message) });
  second.selfId = SELF_ID; second._renderFriendPanel = () => {};
  second._handleMessage({ type: "guildPlanReminder", serverNow: FIXED_NOW, phase: "window", plan });
  second._handleMessage({ type: "guildPlanReminder", serverNow: FIXED_NOW, phase: "live", plan: { ...plan, gathering: { recruitmentId: "recruit_000000000000000001", count: 1, max: 4, slots: 3, expiresAt: FIXED_NOW + 30 * 60_000, joined: false } } });
  assert.equal(reconnectNotices.length, 0);
  const saved = values.get("abyss-dominion-online-guild-plan-reminder-receipts-v1");
  assert.ok(saved.length <= 16 * 1024);
  assert.ok(JSON.parse(saved).receipts.length <= 64);
});

test("build238 rejects stale or malformed reminders before changing the trusted clock", () => {
  values.delete("abyss-dominion-online-guild-plan-reminder-receipts-v1");
  const notices = [], controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }), toast: message => notices.push(message) });
  controller.selfId = SELF_ID; controller._renderFriendPanel = () => {};
  const previousNow = Date.now; Date.now = () => FIXED_NOW;
  try {
    controller._syncGuildServerClock(FIXED_NOW + 5_000);
    const offset = controller.guildClockOffsetMs;
    const plan = { planId: "plan_000000000000000001", purpose: "explore", style: "casual", floor: 120, scheduledAt: FIXED_NOW + 10 * 60_000, organizer: { displayName: "主催", fallbackEmoji: "竜" } };
    assert.equal(controller._handleGuildPlanReminder({ type: "guildPlanReminder", serverNow: FIXED_NOW + 2_000, phase: "bogus", plan }), false);
    assert.equal(controller.guildClockOffsetMs, offset);
    assert.equal(controller._handleGuildPlanReminder({ type: "guildPlanReminder", serverNow: FIXED_NOW, phase: "live", plan: { ...plan, gathering: { recruitmentId: "recruit_000000000000000001", count: 1, max: 4, slots: 3, expiresAt: FIXED_NOW, joined: false } } }), false);
    assert.equal(controller.guildClockOffsetMs, offset);
    assert.equal(notices.length, 0);
  } finally { Date.now = previousNow; }
});

test("build238 CSS keeps touch, mobile and reduced-motion boundaries without OS notifications", async () => {
  const [css, screen, client] = await Promise.all([
    readFile(resolve(root, "src/Styles/build238.css"), "utf8"),
    readFile(resolve(root, "src/ui/screens/OnlinePartyScreen.js"), "utf8"),
    readFile(resolve(root, "src/online/OnlinePartyClient.js"), "utf8"),
  ]);
  assert.match(css, /min-height:(?:48|52)px/);
  assert.match(css, /@media\(max-width:390px\)/);
  assert.match(css, /@media\(max-width:320px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(screen, /data-online-guild-plan-gathering-close/);
  assert.match(client, /GUILD_PLAN_REMINDER_RECEIPT_LIMIT = 64/);
  assert.doesNotMatch(`${screen}\n${client}`, /new Notification|Notification\.requestPermission|new Audio|\.play\(\)/);
});

console.log("ABYSS DOMINION build238 guild plan day-of UX regression: PASS");
