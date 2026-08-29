import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { renderOnlineGuildPanel, renderOnlineSocialPanel } from "../src/ui/screens/OnlinePartyScreen.js?v=2.11.65-build239";
import {
  normalizeGuildActivity, normalizeGuildSharedGoal, normalizeGuildState, OnlinePartyController,
} from "../src/online/OnlinePartyClient.js?v=2.11.65-build239";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SELF = "AD-ABCD-AAAA";

const sharedGoals = [
  { id: "expedition", current: 2, target: 3, completed: false },
  { id: "boss", current: 3, target: 3, completed: true },
  { id: "raid", current: 0, target: 1, completed: false },
  { id: "team", current: 1, target: 3, completed: false },
  { id: "resonance", current: 1, target: 1, completed: true },
];

function activity(index, overrides = {}) {
  return {
    activityId: `activity-${index}`,
    kind: ["checkIn", "expedition", "floorBoss", "coopBoss", "raid", "team", "resonance"][index % 7],
    at: 1_800_000_000_000 + index,
    points: index + 1,
    floor: 321,
    partySize: 2,
    guildMemberCount: 2,
    actors: [{ displayName: `冒険者${index}`, fallbackEmoji: "魔" }],
    ...overrides,
  };
}

function state({ guildId = "GD-ABC234", activities = [], goals = sharedGoals } = {}) {
  return {
    guild: {
      guildId, name: "深淵旅団", tag: "ABYS", description: "共闘ギルド", role: "leader",
      level: 3, memberCount: 1, maxMembers: 20, leaderId: SELF, checkedInToday: false,
      week: { weekId: "2026-08-24", points: 250, goals: [50, 200, 500, 1000], tier: 2, sharedGoals: goals },
      members: [{ playerId: SELF, displayName: "団長", monsterName: "スライム", fallbackEmoji: "魔", online: true, role: "leader", weekPoints: 250 }],
      applications: [], chat: [], recruitments: [], activities,
    },
    invitations: [], applications: [], lookup: null,
  };
}

test("build244 keeps the five compatible shared-goal ids while presenting Resonance as shared exploration", () => {
  assert.equal(normalizeGuildSharedGoal({ id: "unknown", current: 1, target: 1 }), null);
  assert.deepEqual(normalizeGuildSharedGoal({ id: "raid", current: 99, target: 2, completed: false }), {
    id: "raid", current: 2, target: 2, completed: true,
  });
  const normalized = normalizeGuildState(state({ goals: [
    sharedGoals[4], sharedGoals[0], { ...sharedGoals[0], current: 3 }, { id: "other", current: 1, target: 1 },
    sharedGoals[3], sharedGoals[1], sharedGoals[2],
  ] }));
  assert.deepEqual(normalized.guild.week.sharedGoals.map(entry => entry.id), ["expedition", "boss", "raid", "team", "resonance"]);
  assert.equal(normalized.guild.week.sharedGoals[0].current, 2);
  const publicOnly = normalizeGuildState({
    guild: null, invitations: [{ inviteId: "invite-public", guild: state().guild, from: state().guild.members[0], expiresAt: 1_900_000_000_000 }],
    applications: [state().guild], lookup: state().guild,
  });
  assert.equal("sharedGoals" in publicOnly.lookup.week, false);
  assert.equal("sharedGoals" in publicOnly.applications[0].week, false);
  assert.equal("sharedGoals" in publicOnly.invitations[0].guild.week, false);
});

test("build235 treats activity DTOs as untrusted and retains only the member-safe contract", () => {
  assert.equal(normalizeGuildActivity(activity(1, { kind: "unknown" })), null);
  assert.equal(normalizeGuildActivity(activity(1, { activityId: "", at: 1 })), null);
  const raw = activity(1, {
    activityId: `act-${"x".repeat(120)}`, kind: "checkIn", at: Number.MAX_SAFE_INTEGER,
    points: 1e20, partySize: 99, guildMemberCount: 99, floor: 99_999,
    roomId: "SECRET", guildId: "GD-SECRET", playerId: SELF, source: "server text",
    title: "<script>alert(1)</script>", detail: "unsafe",
    actors: Array.from({ length: 25 }, (_, index) => ({
      displayName: index ? `参加者${index}` : "<img src=x onerror=alert(1)>", fallbackEmoji: "魔", playerId: SELF, roomId: "SECRET",
    })),
  });
  const normalized = normalizeGuildActivity(raw);
  assert.equal(normalized.activityId.length, 96);
  assert.equal(normalized.actors.length, 20);
  assert.equal(normalized.partySize, 20);
  assert.equal(normalized.guildMemberCount, 20);
  assert.equal(normalized.floor, 10_000);
  assert.equal(normalized.points, 1_000_000_000);
  assert.deepEqual(Object.keys(normalized).sort(), ["activityId", "actors", "at", "floor", "guildMemberCount", "kind", "partySize", "points"]);
  assert.deepEqual(Object.keys(normalized.actors[0]).sort(), ["displayName", "fallbackEmoji"]);
  assert.doesNotMatch(JSON.stringify(normalized), /roomId|guildId|playerId|source|title|detail|SECRET/);
});

test("build235 caps history at 40, removes duplicate activity ids, and sorts newest first", () => {
  const rows = Array.from({ length: 48 }, (_, index) => activity(index));
  rows.splice(3, 0, activity(47, { at: 9_000_000_000_000, points: 777 }));
  rows.push(activity(99, { kind: "not-a-kind" }));
  const normalized = normalizeGuildState(state({ activities: rows.reverse() }));
  assert.equal(normalized.guild.activities.length, 40);
  assert.equal(new Set(normalized.guild.activities.map(entry => entry.activityId)).size, 40);
  assert.equal(normalized.guild.activities.find(entry => entry.activityId === "activity-47")?.points, 777);
  for (let index = 1; index < normalized.guild.activities.length; index += 1) {
    assert.ok(normalized.guild.activities[index - 1].at >= normalized.guild.activities[index].at);
  }
});

test("build235 renders shared goals and recent activity in the specified Guild-tab order", () => {
  const normalized = normalizeGuildState(state({ activities: Array.from({ length: 12 }, (_, index) => activity(index)) }));
  const html = renderOnlineGuildPanel(normalized, {
    selfId: SELF, connected: true, capability: true, recruitmentCapability: true, activityCapability: true,
  });
  const order = ["online-guild-hero", "online-guild-week\"", "online-guild-shared-goals", "online-guild-recruitment", "online-guild-chat", "online-guild-activities", "online-guild-roster"]
    .map(token => html.indexOf(token));
  assert.ok(order.every((position, index) => position >= 0 && (!index || position > order[index - 1])), `unexpected section order: ${order}`);
  for (const label of ["共同探索を完了", "階層／共闘ボスを討伐", "ワールドレイドに勝利", "自由チーム戦を完了", "仲間と共同探索を完了"]) assert.match(html, new RegExp(label));
  assert.match(html, /共同探索（旧記録）を完了/);
  assert.doesNotMatch(html, /共鳴迷宮を踏破/);
  assert.equal((html.match(/class="online-guild-activity-card"/g) ?? []).length, 8);
  assert.match(html, /data-online-guild-activity-more/);
  assert.match(html, /data-online-social-focus-key="guild-activity-more"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="online-guild-activity-list"/);

  const expanded = renderOnlineGuildPanel(normalized, {
    selfId: SELF, connected: true, capability: true, recruitmentCapability: true, activityCapability: true, activitiesExpanded: true,
  });
  assert.equal((expanded.match(/class="online-guild-activity-card"/g) ?? []).length, 12);
  assert.match(expanded, /data-online-guild-activity-more[^>]*>8件だけ表示</);
  assert.match(expanded, /aria-expanded="true"/);

  const unsupported = renderOnlineGuildPanel(normalized, { selfId: SELF, connected: true, capability: true, activityCapability: false });
  assert.doesNotMatch(unsupported, /online-guild-(?:shared-goals|activities)/);
  assert.doesNotMatch(unsupported, /今週の共同目標|最近の活動/);
});

test("build235 activity rendering escapes actors and never renders remote narrative fields", () => {
  const normalized = normalizeGuildState(state({ activities: [activity(1, {
    actors: [{ displayName: "<script>alert(1)</script>", fallbackEmoji: "<svg>" }],
    source: "REMOTE SOURCE", title: "REMOTE TITLE", detail: "REMOTE DETAIL", roomId: "ABC123",
  })] }));
  const html = renderOnlineGuildPanel(normalized, { selfId: SELF, activityCapability: true });
  assert.match(html, /&lt;script&gt;alert\(1\)/);
  assert.match(html, /&lt;svg&gt;/);
  assert.doesNotMatch(html, /<(?:script|svg)(?:\s|>)/i);
  assert.doesNotMatch(html, /REMOTE SOURCE|REMOTE TITLE|REMOTE DETAIL|ABC123/);
  assert.match(html, /が共同探索を完了/);
});

test("build235 show-more is local-only and survives same-guild state redraws", () => {
  const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
  controller.guildState = normalizeGuildState(state({ activities: Array.from({ length: 12 }, (_, index) => activity(index)) }));
  let renders = 0;
  controller._renderFriendPanel = () => { renders += 1; };
  const button = { dataset: {}, matches: selector => selector === "[data-online-guild-activity-more]" };
  controller._handleClick({ target: { closest: selector => selector === "button" ? button : null } });
  assert.equal(controller.guildActivitiesExpanded, true);
  assert.equal(renders, 1);

  controller._handleMessage({ type: "guildState", state: state({ activities: [activity(20)] }) });
  assert.equal(controller.guildActivitiesExpanded, true);
  controller._handleClick({ target: { closest: selector => selector === "button" ? button : null } });
  assert.equal(controller.guildActivitiesExpanded, false);
  controller._handleClick({ target: { closest: selector => selector === "button" ? button : null } });
  assert.equal(controller.guildActivitiesExpanded, true);
  controller._handleMessage({ type: "guildState", state: state({ guildId: "GD-DEF234", activities: [activity(21)] }) });
  assert.equal(controller.guildActivitiesExpanded, false);
});

test("build244 preserves one Social FAB, two tabs, focus/scroll state, and the five online routes", async () => {
  const normalized = normalizeGuildState(state());
  const closed = renderOnlineSocialPanel({}, normalized, { open: false, selfId: SELF });
  assert.equal((closed.match(/data-online-friends-toggle/g) ?? []).length, 1);
  const open = renderOnlineSocialPanel({}, normalized, {
    open: true, tab: "guild", selfId: SELF, guildOptions: { activityCapability: true },
  });
  assert.equal((open.match(/role="tab"/g) ?? []).length, 2);
  assert.match(open, /data-online-social-content-tab="guild"/);
  const [screen, client] = await Promise.all([
    readFile(resolve(root, "src/ui/screens/OnlinePartyScreen.js"), "utf8"),
    readFile(resolve(root, "src/online/OnlinePartyClient.js"), "utf8"),
  ]);
  assert.equal((screen.match(/data-online-route=/g) ?? []).length, 5);
  for (const token of ["guildActivityHistoryV1", "guildActivitiesExpanded", "socialScrollByTab", "guildChatScroll", "data-online-social-focus-key", "preventScroll: true"]) assert.match(client, new RegExp(token));
});

test("build235 CSS and cache boundary are mobile-safe and complete", async () => {
  const [index, main, client, views, css] = await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"), readFile(resolve(root, "src/main.js"), "utf8"),
    readFile(resolve(root, "src/online/OnlinePartyClient.js"), "utf8"), readFile(resolve(root, "src/online/OnlineViews.js"), "utf8"),
    readFile(resolve(root, "src/Styles/build235.css"), "utf8"),
  ]);
  assert.match(css, /\.online-guild-shared-goals/);
  assert.match(css, /\.online-guild-activities/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /@media\(max-width:420px\)/);
  assert.match(css, /@media\(max-width:350px\)/);
  assert.doesNotMatch(css, /min-width:\s*[4-9][0-9]{2}px/);
  assert.match(index, /build239\.css\?v=2\.11\.65-build239/);
  assert.match(index, /ASSET_VERSION\s*\=\s*"2\.11\.70"/);
  assert.match(index, /ASSET_BUILD\s*\=\s*"build246"/);
  assert.match(main, /OnlinePartyScreen\.js\?v=2\.11\.70-build246/);
  assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.70-build246/);
  assert.match(client, /OnlinePartyScreen\.js\?v=2\.11\.70-build246/);
  assert.match(client, /OnlineViews\.js\?v=2\.11\.70-build246/);
  assert.match(views, /OnlinePartyScreen\.js\?v=2\.11\.70-build246/);
});
