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
const { renderOnlineGuildPanel, renderOnlineSocialPanel } = await import("../src/ui/screens/OnlinePartyScreen.js?v=2.11.65-build239-test");
const { normalizeGuildPlan, normalizeGuildState, OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?v=2.11.65-build239-test");

function rawPlan(index = 0, overrides = {}) {
  const createdAt = Date.now() + index * 1000;
  return {
    planId: `plan_${String(index).padStart(18, "0")}`,
    purpose: "explore",
    style: "casual",
    note: `深層へ${index}`,
    floor: 120 + index,
    scheduledAt: createdAt + (index + 1) * 60 * 60_000,
    createdAt,
    organizer: { displayName: `主催${index}`, fallbackEmoji: "竜", playerId: "AD-LEAK-LEAK" },
    attendees: [
      { displayName: "参加者", fallbackEmoji: "魔", status: "going", playerId: "AD-LEAK-LEAK" },
      { displayName: "検討中", fallbackEmoji: "星", status: "maybe", narrative: "leak" },
    ],
    goingCount: 1,
    maybeCount: 1,
    myStatus: "none",
    canCancel: false,
    creatorId: "AD-LEAK-LEAK",
    guildId: "GD-LEAK22",
    roomId: "SECRET",
    narrative: "remote html",
    ...overrides,
  };
}

function guildState(plans = []) {
  return {
    guild: {
      guildId: "GD-ABC234", name: "深淵隊", tag: "ABYS", description: "予定テスト", level: 3,
      memberCount: 2, maxMembers: 20, leaderId: "AD-AAAA-2222", role: "leader",
      members: [], applications: [], chat: [], recruitments: [], activities: [], plans,
      week: { weekId: "2026-08-24", points: 20, goals: [50, 200], tier: 0, sharedGoals: [] },
    },
    invitations: [], applications: [], lookup: null,
  };
}

test("build236 treats plan DTOs as untrusted and retains only the member-safe contract", () => {
  const normalized = normalizeGuildPlan(rawPlan(1, { myStatus: "going", canCancel: true }));
  assert.ok(normalized);
  assert.deepEqual(Object.keys(normalized), ["planId", "purpose", "style", "note", "floor", "scheduledAt", "createdAt", "organizer", "attendees", "goingCount", "maybeCount", "myStatus", "canCancel", "canGather", "gatherOpensAt", "gatherClosesAt", "gathering"]);
  assert.deepEqual(Object.keys(normalized.organizer), ["displayName", "fallbackEmoji"]);
  assert.deepEqual(Object.keys(normalized.attendees[0]), ["displayName", "fallbackEmoji", "status"]);
  assert.equal(JSON.stringify(normalized).includes("AD-LEAK-LEAK"), false);
  assert.equal(JSON.stringify(normalized).includes("remote html"), false);
  assert.equal(normalizeGuildPlan(rawPlan(2, { purpose: "unknown" })), null);
  assert.equal(normalizeGuildPlan(rawPlan(3, { style: "unknown" })), null);
  assert.equal(normalizeGuildPlan(rawPlan(4, { planId: "../unsafe" })), null);
  assert.equal(normalizeGuildPlan(rawPlan(5, { scheduledAt: Date.now(), createdAt: Date.now() })), null);
});

test("build236 caps plans at eight, removes duplicate ids, and sorts nearest first", () => {
  const plans = Array.from({ length: 12 }, (_, index) => rawPlan(index));
  plans.unshift(rawPlan(5, { note: "duplicate" }));
  const normalized = normalizeGuildState(guildState(plans));
  assert.equal(normalized.guild.plans.length, 8);
  assert.equal(new Set(normalized.guild.plans.map(entry => entry.planId)).size, 8);
  assert.deepEqual(normalized.guild.plans.map(entry => entry.scheduledAt), normalized.guild.plans.map(entry => entry.scheduledAt).slice().sort((a, b) => a - b));
});

test("build236 renders schedules between shared goals and live recruitment, three at first and eight when expanded", () => {
  const normalized = normalizeGuildState(guildState(Array.from({ length: 8 }, (_, index) => rawPlan(index))));
  const options = { selfId: "AD-AAAA-2222", connected: true, capability: true, activityCapability: true, planCapability: true, recruitmentCapability: true, planDraft: { purpose: "explore", style: "help", scheduledAt: "2026-08-28T20:00", floor: 500, note: "集合" } };
  const compact = renderOnlineGuildPanel(normalized, options);
  assert.ok(compact.indexOf("今週の共同目標") < compact.indexOf("ギルド遠征予定"));
  assert.ok(compact.indexOf("ギルド遠征予定") < compact.indexOf("ギルド共闘募集"));
  assert.equal((compact.match(/<article class="online-guild-plan-card/g) ?? []).length, 3);
  assert.match(compact, /id="online-guild-plan-composer"[^>]*hidden/);
  assert.match(compact, /data-online-guild-plan-scheduled-at/);
  assert.match(compact, /data-online-guild-plan-floor/);
  assert.match(compact, /予定そのものに報酬はありません/);
  const expanded = renderOnlineGuildPanel(normalized, { ...options, plansExpanded: true, planComposerOpen: true });
  assert.equal((expanded.match(/<article class="online-guild-plan-card/g) ?? []).length, 8);
  assert.doesNotMatch(expanded, /id="online-guild-plan-composer"[^>]*hidden/);
});

test("build236 escapes plan people and notes and exposes only RSVP/cancel controls", () => {
  const source = normalizeGuildState(guildState([rawPlan(1, {
    note: '<img src=x onerror="alert(1)">',
    organizer: { displayName: "<script>bad</script>", fallbackEmoji: "<" },
    attendees: [{ displayName: "<b>bad</b>", fallbackEmoji: ">", status: "going" }],
    myStatus: "maybe", canCancel: true,
  })]));
  const html = renderOnlineGuildPanel(source, { selfId: "AD-AAAA-2222", connected: true, capability: true, planCapability: true, recruitmentCapability: true });
  assert.doesNotMatch(html, /<script>|<img/i);
  assert.match(html, /&lt;script&gt;bad/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /data-online-guild-plan-respond="going"/);
  assert.match(html, /data-online-guild-plan-respond="maybe"/);
  assert.match(html, /data-online-guild-plan-respond="none"/);
  assert.match(html, /data-online-guild-plan-cancel=/);
  const goingButton = html.match(/<button[^>]*data-online-guild-plan-respond="going"[^>]*>/)?.[0] ?? "";
  const maybeButton = html.match(/<button[^>]*data-online-guild-plan-respond="maybe"[^>]*>/)?.[0] ?? "";
  const noneButton = html.match(/<button[^>]*data-online-guild-plan-respond="none"[^>]*>/)?.[0] ?? "";
  assert.doesNotMatch(goingButton, /disabled/);
  assert.match(maybeButton, /disabled/);
  assert.doesNotMatch(noneButton, /disabled/);
  assert.doesNotMatch(html, /AD-LEAK-LEAK|creatorId|guildId="GD-LEAK|roomId/);
});

test("build236 never sends a duplicate RSVP while another answer remains available", () => {
  const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
  const plan = normalizeGuildPlan(rawPlan(1, { myStatus: "maybe" })), sent = [];
  controller.guildState = { ...guildState([]), guild: { ...guildState([]).guild, plans: [plan] } };
  controller._sendGuild = (...args) => { sent.push(args); return true; };
  const button = {
    dataset: { onlineGuildPlanId: plan.planId, onlineGuildPlanRespond: "maybe" },
    matches: selector => selector === "[data-online-guild-plan-respond]",
  };
  const target = { closest: selector => selector === "button" ? button : null };
  controller._handleClick({ target });
  assert.equal(sent.length, 0);
  button.dataset.onlineGuildPlanRespond = "going";
  controller._handleClick({ target });
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].slice(0, 3), ["planRespond", "guildPlanRespond", { planId: plan.planId, status: "going" }]);
});

test("build236 sends create/respond/cancel only with guildPlansV1", () => {
  const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
  const sent = [];
  controller.connectionReady = true;
  controller.ws = { readyState: WebSocket.OPEN, send: value => sent.push(JSON.parse(value)) };
  controller.capabilities = new Set(["guildsV1", "guildPlansV1"]);
  controller._renderFriendPanel = () => {};
  controller.guildPlanDraft = { ...controller.guildPlanDraft, purpose: "explore", style: "help", floor: 777, note: "集合" };
  const form = { matches: selector => selector.includes("[data-online-guild-plan-form]") };
  controller._handleSubmit({ target: form, preventDefault() {} });
  assert.equal(sent[0]?.type, "guildPlanCreate");
  assert.deepEqual({ purpose: sent[0]?.purpose, style: sent[0]?.style, floor: sent[0]?.floor, note: sent[0]?.note }, { purpose: "explore", style: "help", floor: 777, note: "集合" });
  controller._clearGuildPending();
  assert.equal(controller._sendGuild("planRespond", "guildPlanRespond", { planId: rawPlan(1).planId, status: "going" }), true);
  controller._clearGuildPending();
  assert.equal(controller._sendGuild("planCancel", "guildPlanCancel", { planId: rawPlan(1).planId }), true);
  assert.deepEqual(sent.slice(1).map(entry => entry.type), ["guildPlanRespond", "guildPlanCancel"]);
  controller._clearGuildPending();
  controller.capabilities.delete("guildPlansV1");
  assert.equal(controller._sendGuild("planRespond", "guildPlanRespond", { planId: rawPlan(1).planId, status: "maybe" }), false);
});

test("build236 redraws an open Social panel immediately when the socket closes", () => {
  const controller = Object.create(OnlinePartyController.prototype), calls = [];
  Object.assign(controller, {
    ws: null, connectionReady: true, manualClose: false, mounted: false, friendPanelOpen: true, roomState: {}, merchantPendingTimer: null,
    _clearMoveInputs() {}, _clearInteractionPending() {}, _setStatus(kind, title) { calls.push(["status", kind, title]); },
    _renderFriendPanel() { calls.push(["render"]); }, _renderRoomBoard() {},
  });
  controller._handleClose();
  assert.equal(controller.connectionReady, false);
  assert.match(controller.guildStatus, /再接続中/);
  assert.ok(calls.some(entry => entry[0] === "render"));
});

test("build236 explicitly redraws fresh Social state on a roomless helloAck", () => {
  const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
  let rendered = 0;
  Object.assign(controller, {
    ws: { readyState: WebSocket.OPEN }, connectionEndpoint: "wss://example.invalid/party", lastHelloEndpoint: "wss://example.invalid/party",
    _renderFriendPanel() { rendered++; }, _showConnectionStep() {}, _setStatus() {}, _requestRoomListings() {}, _flushExpeditionProfileSync() {},
    _settlePendingExpeditionStart() {}, _storeResumeTokenForEndpoint() { return true; }, _query() { return null; },
  });
  controller._handleMessage({ type: "helloAck", protocol: "1.16.0", playerId: controller.selfId, resumeToken: "x".repeat(32), resumed: true, room: null, capabilities: ["guildsV1", "guildPlansV1"], friendState: { friends: [{ playerId: "AD-BBBB-2222", displayName: "最新", online: true }] }, guildState: guildState([rawPlan(1)]), activeTradeIds: [] });
  assert.equal(rendered, 1);
  assert.equal(controller.friendState.friends[0].displayName, "最新");
  assert.equal(controller.guildState.guild.plans.length, 1);
});

test("build236 displays reconnect state and disables every friend mutation button", () => {
  const html = renderOnlineSocialPanel({
    friends: [{ playerId: "AD-BBBB-2222", displayName: "友", online: true }],
    incoming: [{ playerId: "AD-CCCC-2222", displayName: "申請", online: true }],
    invites: [{ inviteId: "invite-token", from: { playerId: "AD-DDDD-2222", displayName: "招待", online: true } }],
  }, {}, { open: true, tab: "friends", selfId: "AD-AAAA-2222", guildOptions: { connected: false } });
  assert.match(html, /再接続後にフレンド操作を再開できます/);
  for (const attribute of ["data-online-friend-invite=", "data-online-friend-remove=", "data-online-friend-accept=", "data-online-friend-invite-accept="]) {
    const button = html.match(new RegExp(`<button[^>]*${attribute}[^>]*>`))?.[0] ?? "";
    assert.match(button, /disabled/, attribute);
  }
  assert.match(html.match(/<button type="submit"[^>]*>/)?.[0] ?? "", /disabled/);
});

test("build236 CSS and cache boundary stay safe at 390/320 widths", async () => {
  const [index, main, client, views, css] = await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"), readFile(resolve(root, "src/main.js"), "utf8"),
    readFile(resolve(root, "src/online/OnlinePartyClient.js"), "utf8"), readFile(resolve(root, "src/online/OnlineViews.js"), "utf8"),
    readFile(resolve(root, "src/Styles/build237.css"), "utf8"),
  ]);
  assert.match(index, /build239\.css\?v=2\.11\.65-build239/);
  assert.match(index, /ASSET_VERSION\s*\=\s*"2\.11\.65"/);
  assert.match(index, /ASSET_BUILD\s*\=\s*"build239"/);
  assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.65-build239/);
  assert.match(main, /OnlinePartyScreen\.js\?v=2\.11\.65-build239/);
  assert.match(client, /OnlinePartyScreen\.js\?v=2\.11\.65-build239/);
  assert.match(client, /OnlineViews\.js\?v=2\.11\.65-build239/);
  assert.match(views, /OnlinePartyScreen\.js\?v=2\.11\.65-build239/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /@media\(max-width:390px\)/);
  assert.match(css, /@media\(max-width:320px\)/);
  assert.match(css, /min-width:0/);
  assert.doesNotMatch(css, /min-width:\s*(?:4\d{2}|[5-9]\d{2,})px/);
});
