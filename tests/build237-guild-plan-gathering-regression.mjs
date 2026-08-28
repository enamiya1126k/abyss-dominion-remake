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
const { renderOnlineGuildPanel } = await import("../src/ui/screens/OnlinePartyScreen.js?v=2.11.65-build239-test");
const { renderOnlineChat } = await import("../src/online/OnlineViews.js?v=2.11.65-build239-test");
const { currentGuildRoomRecruitmentLock, normalizeGuildPlan, normalizeGuildState, OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?v=2.11.65-build239-test");

const FIXED_NOW = Date.UTC(2026, 7, 28, 12, 0, 0);
const SELF_ID = "AD-AAAA-2222";
const HOST_ID = "AD-BBBB-2222";

function rawPlan(index = 0, overrides = {}) {
  const createdAt = FIXED_NOW - 2 * 60 * 60_000 + index * 1000;
  const scheduledAt = FIXED_NOW + (index + 1) * 60 * 60_000;
  return {
    planId: `plan_${String(index).padStart(18, "0")}`,
    purpose: "explore", style: "casual", note: `PLAN-${index}`, floor: 120 + index,
    scheduledAt, createdAt,
    organizer: { displayName: `主催${index}`, fallbackEmoji: "竜" },
    attendees: [], goingCount: 0, maybeCount: 0, myStatus: "none", canCancel: false,
    canGather: false, gatherOpensAt: scheduledAt - 30 * 60_000, gatherClosesAt: scheduledAt + 2 * 60 * 60_000,
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

function guildState(plans = [], recruitments = []) {
  return {
    guild: {
      guildId: "GD-ABC234", name: "深淵隊", tag: "ABYS", description: "集合テスト", level: 3,
      memberCount: 2, maxMembers: 20, leaderId: SELF_ID, role: "leader",
      members: [
        { playerId: SELF_ID, displayName: "自分", monsterName: "竜", fallbackEmoji: "竜", online: true, role: "leader" },
        { playerId: HOST_ID, displayName: "主催", monsterName: "魔", fallbackEmoji: "魔", online: true, role: "member" },
      ],
      applications: [], chat: [], plans, recruitments, activities: [],
      week: { weekId: "2026-08-24", points: 20, goals: [50, 200], tier: 0, sharedGoals: [] },
    },
    invitations: [], applications: [], lookup: null,
  };
}

function renderOptions(roomState = null, overrides = {}) {
  return {
    selfId: SELF_ID, connected: true, capability: true, activityCapability: true,
    planCapability: true, planGatheringCapability: true, recruitmentCapability: true,
    roomState, ...overrides,
  };
}

function ownerLobby(overrides = {}) {
  return {
    roomId: "ABC234", ownerId: SELF_ID, leaderId: SELF_ID, phase: "lobby",
    members: [{ playerId: SELF_ID }], listing: { published: false },
    ...overrides,
  };
}

function withFixedNow(action) {
  const original = Date.now;
  Date.now = () => FIXED_NOW;
  try { return action(); } finally { Date.now = original; }
}

test("build237 keeps only the validated member gathering contract", () => {
  const source = rawPlan(0, { canGather: true });
  source.gathering = { ...liveGathering(source), roomId: "SECRET", creatorId: "AD-LEAK-LEAK", guildId: "GD-LEAK22", host: { playerId: "AD-LEAK-LEAK" } };
  const normalized = normalizeGuildPlan(source);
  assert.ok(normalized);
  assert.deepEqual(Object.keys(normalized.gathering), ["recruitmentId", "hostPlayerId", "count", "max", "slots", "expiresAt", "joined"]);
  assert.equal(normalized.canGather, true);
  assert.equal(normalized.gatherOpensAt, source.gatherOpensAt);
  assert.equal(normalized.gatherClosesAt, source.gatherClosesAt);
  assert.doesNotMatch(JSON.stringify(normalized), /SECRET|creatorId|guildId|AD-LEAK-LEAK/);

  assert.equal(normalizeGuildPlan({ ...source, gathering: { ...source.gathering, hostPlayerId: "bad" } }).gathering, null);
  assert.equal(normalizeGuildPlan({ ...source, gathering: { ...source.gathering, slots: 2 } }).gathering, null);
  assert.equal(normalizeGuildPlan({ ...source, gathering: { ...source.gathering, max: 9 } }).gathering, null);
  const badWindow = normalizeGuildPlan({ ...source, gatherOpensAt: source.scheduledAt + 1 });
  assert.equal(badWindow.canGather, false);
  assert.equal(badWindow.gathering, null);
});

test("build237 gives the organizer one local launch action and concise prerequisite hints", () => withFixedNow(() => {
  const plan = rawPlan(0, {
    canGather: true,
    scheduledAt: FIXED_NOW + 10 * 60_000,
    gatherOpensAt: FIXED_NOW - 20 * 60_000,
    gatherClosesAt: FIXED_NOW + 130 * 60_000,
  });
  const state = normalizeGuildState(guildState([plan]));
  const ready = renderOnlineGuildPanel(state, renderOptions(ownerLobby()));
  assert.match(ready, /data-online-guild-plan-gather=/);
  assert.match(ready, /この部屋で集合できます/);
  assert.match(renderOnlineGuildPanel(state, renderOptions(null)), /先に自分のオンライン部屋を作ってください/);
  assert.match(renderOnlineGuildPanel(state, renderOptions(ownerLobby({ ownerId: HOST_ID, leaderId: HOST_ID }))), /現在のプレイを終了し、自分の部屋を作ってください/);
  assert.match(renderOnlineGuildPanel(state, renderOptions(ownerLobby({ phase: "expedition" }))), /現在のプレイを終了してロビーへ戻ってください/);
  assert.match(renderOnlineGuildPanel(state, renderOptions(ownerLobby({ members: [{ playerId: SELF_ID }, {}, {}, {}] }))), /現在の部屋は満員です/);
  assert.match(renderOnlineGuildPanel(state, renderOptions(ownerLobby({ listing: { published: true } }))), /公開募集を終了してから集合を開始してください/);
  assert.match(renderOnlineGuildPanel(state, renderOptions(ownerLobby({ members: [{ playerId: SELF_ID }, { playerId: "AD-CCCC-2222" }] }))), /ギルドメンバーだけの部屋で集合を開始してください/);
  const existingRecruitment = {
    recruitmentId: "recruit_existing_001", purpose: "explore", style: "casual", note: "既存募集", floor: 1,
    count: 1, max: 4, slots: 3, createdAt: FIXED_NOW - 1_000, expiresAt: FIXED_NOW + 30 * 60_000,
    host: { playerId: SELF_ID, displayName: "自分", monsterName: "竜", speciesId: "slime", fallbackEmoji: "竜", level: 10 },
  };
  const stateWithRecruitment = normalizeGuildState(guildState([plan], [existingRecruitment]));
  assert.match(renderOnlineGuildPanel(stateWithRecruitment, renderOptions(ownerLobby())), /先に現在のギルド募集を終了してください/);
  const disabled = renderOnlineGuildPanel(state, renderOptions(ownerLobby(), { connected: false }));
  assert.match(disabled.match(/<button[^>]*data-online-guild-plan-gather=[^>]*>/)?.[0] ?? "", /disabled/);
}));

test("build237 prioritizes live gatherings into the first three plans", () => withFixedNow(() => {
  const plans = Array.from({ length: 6 }, (_, index) => {
    const scheduledAt = FIXED_NOW + (index + 1) * 5 * 60_000;
    return rawPlan(index, { scheduledAt, gatherOpensAt: scheduledAt - 30 * 60_000, gatherClosesAt: scheduledAt + 2 * 60 * 60_000 });
  });
  plans[5] = { ...plans[5], note: "LIVE-LATE" };
  plans[5].gathering = liveGathering(plans[5], { expiresAt: FIXED_NOW + 30 * 60_000 });
  const html = renderOnlineGuildPanel(normalizeGuildState(guildState(plans)), renderOptions());
  assert.equal((html.match(/<article class="online-guild-plan-card/g) ?? []).length, 3);
  assert.ok(html.indexOf("LIVE-LATE") < html.indexOf("PLAN-0"));
  assert.match(html, /LIVE GATHERING/);
}));

test("build237 shows live, joined, full and expired gathering states without gating RSVP", () => withFixedNow(() => {
  const base = rawPlan(0, { myStatus: "none" });
  const render = gathering => renderOnlineGuildPanel(normalizeGuildState(guildState([{ ...base, gathering }])), renderOptions());
  const live = render(liveGathering(base));
  assert.match(live, /1 \/ 4人/);
  assert.match(live, /data-online-guild-recruitment-join=/);
  assert.match(live, /data-online-guild-plan-respond="going"/);
  assert.match(live, /role="status" aria-live="polite"/);
  assert.match(render(liveGathering(base, { joined: true })), /この部屋に参加中/);
  assert.match(render(liveGathering(base, { count: 4, slots: 0 })), /満員/);
  const expiredPlan = rawPlan(0, {
    scheduledAt: FIXED_NOW - 10 * 60_000,
    gatherOpensAt: FIXED_NOW - 40 * 60_000,
    gatherClosesAt: FIXED_NOW + 110 * 60_000,
  });
  expiredPlan.gathering = liveGathering(expiredPlan, { expiresAt: FIXED_NOW - 1 });
  assert.match(renderOnlineGuildPanel(normalizeGuildState(guildState([expiredPlan])), renderOptions()), /受付終了/);
}));

test("build237 removes a linked gathering from the generic recruitment list", () => withFixedNow(() => {
  const plan = rawPlan(0), gathering = liveGathering(plan); plan.gathering = gathering;
  const recruitment = {
    recruitmentId: gathering.recruitmentId, purpose: plan.purpose, style: plan.style, note: plan.note, floor: plan.floor,
    count: 1, max: 4, slots: 3, createdAt: FIXED_NOW - 1_000, expiresAt: gathering.expiresAt,
    host: { playerId: HOST_ID, displayName: "主催", monsterName: "魔", speciesId: "slime", fallbackEmoji: "魔", level: 10 },
  };
  const html = renderOnlineGuildPanel(normalizeGuildState(guildState([plan], [recruitment])), renderOptions());
  assert.equal((html.match(new RegExp(`data-online-guild-recruitment-join="${gathering.recruitmentId}"`, "g")) ?? []).length, 1);
  assert.equal((html.match(/online-guild-recruitment-card/g) ?? []).length, 0);
}));

test("build237 suppresses another launch while the organizer already has one live gathering", () => withFixedNow(() => {
  const activeScheduledAt = FIXED_NOW + 10 * 60_000;
  const active = rawPlan(0, { canGather: true, note: "ACTIVE-PLAN", scheduledAt: activeScheduledAt, gatherOpensAt: activeScheduledAt - 30 * 60_000, gatherClosesAt: activeScheduledAt + 2 * 60 * 60_000 });
  active.gathering = liveGathering(active, { hostPlayerId: SELF_ID, joined: true });
  const otherScheduledAt = FIXED_NOW + 20 * 60_000;
  const other = rawPlan(1, { canGather: true, note: "OTHER-PLAN", scheduledAt: otherScheduledAt, gatherOpensAt: otherScheduledAt - 30 * 60_000, gatherClosesAt: otherScheduledAt + 2 * 60 * 60_000 });
  const html = renderOnlineGuildPanel(normalizeGuildState(guildState([active, other])), renderOptions(ownerLobby()));
  assert.match(html, /ACTIVE-PLAN/);
  assert.match(html, /この部屋に参加中/);
  assert.match(html, /OTHER-PLAN/);
  assert.match(html, /別の遠征予定で集合中です/);
  assert.doesNotMatch(html, /data-online-guild-plan-gather=/);
}));

test("build237 keeps a current planned gathering guild-only in room listing UI and handler", () => withFixedNow(() => {
  const plan = rawPlan(0);
  plan.gathering = liveGathering(plan, { hostPlayerId: SELF_ID, joined: true });
  const state = normalizeGuildState(guildState([plan]));
  const room = ownerLobby();
  const lock = currentGuildRoomRecruitmentLock(state, room, FIXED_NOW);
  assert.deepEqual(lock, { active: true, kind: "planned" });
  const html = renderOnlineChat({ ...room, chatHistory: [] }, SELF_ID, { guildRecruitmentActive: lock.active, guildRecruitmentLock: lock });
  assert.match(html, /online-room-listing-guild-lock/);
  assert.match(html, /遠征予定の集合中/);
  assert.match(html, /遠征予定カードで集合状況を確認／予定取消できます/);
  assert.doesNotMatch(html, /ギルド共闘募集.*募集を終了/);
  assert.doesNotMatch(html, /data-online-room-listing-toggle/);

  const unrelatedPlan = rawPlan(1);
  unrelatedPlan.gathering = liveGathering(unrelatedPlan, { joined: true });
  assert.deepEqual(currentGuildRoomRecruitmentLock(normalizeGuildState(guildState([unrelatedPlan])), room, FIXED_NOW), { active: false, kind: "none" });
  plan.gathering.joined = false;
  assert.deepEqual(currentGuildRoomRecruitmentLock(normalizeGuildState(guildState([plan])), room, FIXED_NOW), { active: false, kind: "none" });

  plan.gathering.joined = true;
  const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }), toast: message => notices.push(message) });
  const sent = [], notices = [];
  controller.guildState = normalizeGuildState(guildState([plan]));
  controller.roomState = room;
  controller._query = selector => selector === "[data-online-room-listing-toggle]" ? { checked: true } : null;
  controller._send = (type, payload) => { sent.push({ type, payload }); return true; };
  let renders = 0;
  controller._render = () => { renders += 1; };
  controller._handleChange({ target: { matches: selector => selector.includes("[data-online-room-listing-toggle]") } });
  assert.deepEqual(sent, []);
  assert.equal(controller.roomListingPending, false);
  assert.equal(renders, 1);
  assert.match(notices[0] ?? "", /遠征予定の集合中.*予定カード.*予定取消/);
}));

test("build237 refreshes an open Guild panel at the nearest gathering boundary", () => {
  const originalNow = Date.now, originalSetTimeout = globalThis.setTimeout, originalClearTimeout = globalThis.clearTimeout;
  let now = FIXED_NOW, sequence = 0;
  const scheduled = new Map();
  Date.now = () => now;
  globalThis.setTimeout = (callback, delay) => {
    const id = ++sequence;
    scheduled.set(id, { callback, delay, cleared: false });
    return id;
  };
  globalThis.clearTimeout = id => { const entry = scheduled.get(id); if (entry) entry.cleared = true; };
  try {
    const scheduledAt = FIXED_NOW + 10 * 60_000;
    const plan = rawPlan(0, { scheduledAt, gatherOpensAt: FIXED_NOW - 20 * 60_000, gatherClosesAt: FIXED_NOW + 130 * 60_000 });
    plan.gathering = liveGathering(plan, { hostPlayerId: SELF_ID, joined: true, expiresAt: FIXED_NOW + 1_000 });
    const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
    controller.guildState = normalizeGuildState(guildState([plan]));
    controller.mounted = true;
    controller.connectionReady = true;
    controller.friendPanelOpen = true;
    controller.socialTab = "guild";
    let renders = 0;
    controller._renderFriendPanel = () => { renders += 1; controller._scheduleGuildPlanTransitionRender(); };
    controller._scheduleGuildPlanTransitionRender();
    const firstId = controller.guildPlanTransitionTimer, first = scheduled.get(firstId);
    assert.ok(first);
    assert.ok(first.delay >= 1_000 && first.delay <= 1_100);
    assert.equal([...scheduled.values()].filter(entry => !entry.cleared).length, 1);

    now = FIXED_NOW + 1_025;
    first.cleared = true;
    first.callback();
    assert.equal(renders, 1);
    const secondId = controller.guildPlanTransitionTimer, second = scheduled.get(secondId);
    assert.ok(second && secondId !== firstId);
    assert.ok(second.delay > 60 * 60_000);
    assert.equal([...scheduled.values()].filter(entry => !entry.cleared).length, 1);

    controller.friendPanelOpen = false;
    controller._scheduleGuildPlanTransitionRender();
    assert.equal(controller.guildPlanTransitionTimer, null);
    assert.equal(second.cleared, true);
  } finally {
    Date.now = originalNow;
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});

test("build237 sends one gather request only with the dedicated capability", () => withFixedNow(() => {
  const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) }), sent = [];
  const plan = rawPlan(0, {
    canGather: true,
    scheduledAt: FIXED_NOW + 10 * 60_000,
    gatherOpensAt: FIXED_NOW - 20 * 60_000,
    gatherClosesAt: FIXED_NOW + 130 * 60_000,
  });
  controller.connectionReady = true;
  controller.selfId = SELF_ID;
  controller.ws = { readyState: WebSocket.OPEN, send: value => sent.push(JSON.parse(value)) };
  controller.capabilities = new Set(["guildsV1", "guildPlansV1", "guildPartyRecruitmentV1", "guildPlanGatheringV1"]);
  controller.guildState = normalizeGuildState(guildState([plan]));
  controller.roomState = ownerLobby();
  controller._renderFriendPanel = () => {};
  const button = { dataset: { onlineGuildPlanGather: plan.planId }, matches: selector => selector.includes("[data-online-guild-plan-gather]") };
  const event = { target: { closest: selector => selector === "button" ? button : null } };
  controller._handleClick(event);
  controller._handleClick(event);
  assert.deepEqual(sent, [{ type: "guildPlanGather", planId: plan.planId }]);
  controller._clearGuildPending();
  controller.capabilities.delete("guildPlanGatheringV1");
  assert.equal(controller._sendGuild("planGather", "guildPlanGather", { planId: plan.planId }), false);
}));

test("build237 settles plan gather pending only from its authoritative plan update", () => withFixedNow(() => {
  const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
  const plan = rawPlan(0), other = rawPlan(1);
  controller.guildState = normalizeGuildState(guildState([plan, other]));
  controller.guildPending = { kind: "planGather", planId: plan.planId };
  controller._renderFriendPanel = () => {};

  controller._handleMessage({ type: "guildState", state: guildState([plan, { ...other, myStatus: "going" }]) });
  assert.deepEqual(controller.guildPending, { kind: "planGather", planId: plan.planId });

  const gathered = { ...plan, gathering: liveGathering(plan, { hostPlayerId: SELF_ID, joined: true }) };
  controller._handleMessage({ type: "guildState", state: guildState([gathered, other]) });
  assert.equal(controller.guildPending, null);

  controller.guildPending = { kind: "planGather", planId: plan.planId };
  controller._handleMessage({ type: "guildState", state: guildState([other]) });
  assert.equal(controller.guildPending, null);
}));

test("build237 verifies the gathering host before settling a nested recruitment join", () => withFixedNow(() => {
  const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) }), sent = [];
  const plan = rawPlan(0); plan.gathering = liveGathering(plan);
  controller.connectionReady = true;
  controller.selfId = SELF_ID;
  controller.ws = { readyState: WebSocket.OPEN, send: value => sent.push(JSON.parse(value)) };
  controller.capabilities = new Set(["guildsV1", "guildPlansV1", "guildPartyRecruitmentV1", "guildPlanGatheringV1"]);
  controller.guildState = normalizeGuildState(guildState([plan]));
  controller._renderFriendPanel = () => {};
  controller._render = () => {};
  controller._showConnectionStep = () => {};
  const button = { dataset: { onlineGuildRecruitmentJoin: plan.gathering.recruitmentId }, matches: selector => selector.includes("[data-online-guild-recruitment-join]") };
  controller._handleClick({ target: { closest: selector => selector === "button" ? button : null } });
  assert.equal(controller.guildPending?.targetId, HOST_ID);
  assert.equal(sent[0]?.type, "guildRecruitmentJoin");
  controller._applyRoomState({ roomId: "WRONG1", ownerId: "AD-CCCC-2222", leaderId: "AD-CCCC-2222", phase: "lobby", members: [{ playerId: SELF_ID }], chatHistory: [] });
  assert.equal(controller.guildPending?.kind, "recruitmentJoin");
  controller._applyRoomState({ roomId: "RIGHT1", ownerId: HOST_ID, leaderId: HOST_ID, phase: "lobby", members: [{ playerId: SELF_ID }], chatHistory: [] });
  assert.equal(controller.guildPending, null);
}));

test("build237 keeps cache, protocol, save schema and mobile accessibility boundaries", async () => {
  const [index, main, client, views, css, config] = await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"), readFile(resolve(root, "src/main.js"), "utf8"),
    readFile(resolve(root, "src/online/OnlinePartyClient.js"), "utf8"), readFile(resolve(root, "src/online/OnlineViews.js"), "utf8"),
    readFile(resolve(root, "src/Styles/build237.css"), "utf8"), readFile(resolve(root, "src/core/config.js"), "utf8"),
  ]);
  assert.match(index, /build239\.css\?v=2\.11\.65-build239/);
  assert.match(index, /ASSET_VERSION\s*\=\s*"2\.11\.65"/);
  assert.match(index, /ASSET_BUILD\s*\=\s*"build239"/);
  assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.65-build239/);
  assert.match(main, /OnlinePartyScreen\.js\?v=2\.11\.65-build239/);
  assert.match(client, /OnlinePartyScreen\.js\?v=2\.11\.65-build239/);
  assert.match(client, /OnlineViews\.js\?v=2\.11\.65-build239/);
  assert.match(client, /const ONLINE_PROTOCOL = "1\.16\.0"/);
  assert.match(client, /guildPlanGatheringV1/);
  assert.match(views, /OnlinePartyScreen\.js\?v=2\.11\.65-build239/);
  assert.match(config, /SAVE_SCHEMA_VERSION=58/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /font-size:11px/);
  assert.match(css, /@media\(max-width:390px\)/);
  assert.match(css, /@media\(max-width:320px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css, /min-width:\s*(?:4\d{2}|[5-9]\d{2,})px/);
});

console.log("ABYSS DOMINION build237 guild plan gathering regression: PASS");
