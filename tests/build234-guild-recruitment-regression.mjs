import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { renderOnlineGuildPanel, renderOnlineSocialPanel } from "../src/ui/screens/OnlinePartyScreen.js?v=2.11.65-build239";
import { normalizeGuildRecruitment, OnlinePartyController } from "../src/online/OnlinePartyClient.js?v=2.11.65-build239";
import { renderOnlineChat } from "../src/online/OnlineViews.js?v=2.11.65-build239";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SELF = "AD-ABCD-AAAA";
const OTHER = "AD-ABCD-BBBB";

function member(playerId, overrides = {}) {
  return {
    playerId, displayName: playerId === SELF ? "団長" : "仲間", monsterName: "スライム",
    fallbackEmoji: "魔", online: true, role: playerId === SELF ? "leader" : "member",
    weekPoints: 12, ...overrides,
  };
}

function recruitment(recruitmentId, playerId, overrides = {}) {
  return {
    recruitmentId, purpose: "explore", style: "casual", note: "一緒に探索しよう",
    floor: 321, count: 2, max: 4, slots: 2, createdAt: Date.now() - 1_000,
    expiresAt: Date.now() + 30 * 60_000,
    host: { ...member(playerId), speciesId: "slime", level: 123 },
    ...overrides,
  };
}

function guildState(recruitments = []) {
  return {
    guild: {
      guildId: "GD-ABC234", name: "深淵旅団", tag: "ABYS", description: "共闘ギルド",
      role: "leader", level: 3, memberCount: 2, maxMembers: 20, leaderId: SELF,
      week: { points: 250, goals: [50, 200, 500, 1000], tier: 2 }, checkedInToday: false,
      members: [member(SELF), member(OTHER)], applications: [], chat: [], recruitments,
    },
    invitations: [], applications: [], lookup: null,
  };
}

const eligibleRoom = {
  roomId: "ABC123", leaderId: SELF, phase: "lobby", selectedFloor: 321,
  listing: { published: false, purpose: "explore", style: "anyone" },
  members: [{ playerId: SELF }, { playerId: OTHER }],
};

test("build234 renders guild-only recruitment in the existing Guild tab", () => {
  const rows = [
    recruitment("rec-own", SELF),
    recruitment("rec-other", OTHER, { note: "<img src=x onerror=alert(1)>", roomId: "SECRET" }),
  ];
  const html = renderOnlineGuildPanel(guildState(rows), {
    selfId: SELF, connected: true, capability: true, recruitmentCapability: true,
    roomState: eligibleRoom, recruitmentDraft: { purpose: "raid", style: "help", note: "21時から" },
  });

  assert.ok(html.indexOf("online-guild-week") < html.indexOf("online-guild-recruitment"));
  assert.ok(html.indexOf("online-guild-recruitment") < html.indexOf("online-guild-chat"));
  assert.match(html, /data-online-guild-recruitment-form/);
  assert.match(html, /data-online-guild-recruitment-purpose/);
  assert.match(html, /data-online-guild-recruitment-style/);
  assert.match(html, /<textarea[^>]*maxlength="48"[^>]*data-online-guild-recruitment-note/);
  assert.match(html, /data-online-guild-recruitment-close="rec-own"/);
  assert.match(html, /data-online-guild-recruitment-join="rec-other"/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /SECRET/);
});

test("build234 recruitment composer enforces client-side eligibility without becoming authority", () => {
  const noRoom = renderOnlineGuildPanel(guildState(), { selfId: SELF, connected: true, capability: true, recruitmentCapability: true });
  assert.doesNotMatch(noRoom, /data-online-guild-recruitment-form/);
  assert.match(noRoom, /オンライン部屋を作ると/);

  const mixedRoom = renderOnlineGuildPanel(guildState(), {
    selfId: SELF, connected: true, capability: true, recruitmentCapability: true,
    roomState: { ...eligibleRoom, members: [{ playerId: SELF }, { playerId: "AD-ABCD-CCCC" }] },
  });
  assert.doesNotMatch(mixedRoom, /data-online-guild-recruitment-form/);
  assert.match(mixedRoom, /ギルド外の参加者/);

  const publicRoom = renderOnlineGuildPanel(guildState(), {
    selfId: SELF, connected: true, capability: true, recruitmentCapability: true,
    roomState: { ...eligibleRoom, listing: { ...eligibleRoom.listing, published: true } },
  });
  assert.doesNotMatch(publicRoom, /data-online-guild-recruitment-form/);
  assert.match(publicRoom, /公開掲示板の募集を終了してから/);

  const unsupported = renderOnlineGuildPanel(guildState(), {
    selfId: SELF, connected: true, capability: true, recruitmentCapability: false, roomState: eligibleRoom,
  });
  assert.doesNotMatch(unsupported, /data-online-guild-recruitment-form/);
  assert.match(unsupported, /ギルド共闘募集に未対応/);

  const joined = renderOnlineGuildPanel(guildState([recruitment("same-room", SELF)]), {
    selfId: OTHER, connected: true, capability: true, recruitmentCapability: true,
    roomState: eligibleRoom,
  });
  assert.match(joined, /data-online-guild-recruitment-join="same-room"[^>]*disabled[^>]*>参加中</);
});

test("build234 keeps public and guild recruitment mutually exclusive in the room UI", () => {
  const html = renderOnlineChat(
    { ...eligibleRoom, chatHistory: [] },
    SELF,
    { guildRecruitmentActive: true },
  );
  assert.match(html, /online-room-listing-guild-lock/);
  assert.match(html, /ギルド限定で募集中/);
  assert.match(html, /募集を終了すると、公開掲示板へ切り替えられます/);
  assert.doesNotMatch(html, /data-online-room-listing-toggle/);
});

test("build234 safely normalizes recruitment DTOs and does not retain room ids", () => {
  assert.equal(normalizeGuildRecruitment({ recruitmentId: "bad", expiresAt: Date.now() + 1_000, host: { playerId: "INVALID" } }), null);
  const normalized = normalizeGuildRecruitment({
    recruitmentId: `rec-${"x".repeat(120)}`,
    purpose: "unknown", style: "unknown", note: `${"あ".repeat(60)}\u202e<script>`,
    floor: 99_999, count: -5, max: 99, slots: 99, roomId: "ABC123",
    createdAt: -1, expiresAt: Date.now() + 60_000,
    host: { playerId: OTHER, displayName: "\u0000<script>", monsterName: "\u0007魔物", speciesId: "../bad", fallbackEmoji: "魔", level: 1e12 },
  });
  assert.ok(normalized);
  assert.equal(normalized.recruitmentId.length, 96);
  assert.equal(normalized.purpose, "explore");
  assert.equal(normalized.style, "anyone");
  assert.ok(normalized.note.length <= 48);
  assert.doesNotMatch(normalized.note, /\u202e/);
  assert.equal(normalized.floor, 10_000);
  assert.equal(normalized.count, 1);
  assert.equal(normalized.max, 4);
  assert.equal(normalized.slots, 3);
  assert.equal(normalized.host.speciesId, "slime");
  assert.equal(normalized.host.level, 99_999_999);
  assert.equal(Object.hasOwn(normalized, "roomId"), false);
});

test("build234 keeps one Social FAB, two Social tabs, and the existing six online routes", async () => {
  const closed = renderOnlineSocialPanel({}, guildState(), { open: false, selfId: SELF });
  assert.equal((closed.match(/data-online-friends-toggle/g) ?? []).length, 1);
  const open = renderOnlineSocialPanel({}, guildState(), { open: true, tab: "guild", selfId: SELF, guildOptions: { connected: true, capability: true, recruitmentCapability: true } });
  assert.equal((open.match(/role="tab"/g) ?? []).length, 2);
  assert.match(open, /data-online-social-content-tab="guild"/);
  const screen = await readFile(resolve(root, "src/ui/screens/OnlinePartyScreen.js"), "utf8");
  assert.equal((screen.match(/data-online-route=/g) ?? []).length, 6);
});

test("build234 client wires opaque recruitment actions and preserves Social interaction state", async () => {
  const client = await readFile(resolve(root, "src/online/OnlinePartyClient.js"), "utf8");
  for (const token of [
    "guildPartyRecruitmentV1", "guildRecruitmentCreate", "guildRecruitmentClose", "guildRecruitmentJoin",
    "guildRecruitmentDraft", "socialScrollByTab", "guildChatScroll", "data-online-social-focus-key", "preventScroll: true",
  ]) assert.match(client, new RegExp(token));
  assert.match(client, /guildRecruitmentJoin", \{ recruitmentId \}, \{ targetId \}/);
  assert.match(client, /this\._confirmRoomExit\(\)/);
  assert.doesNotMatch(client, /guildRecruitmentJoin"[^\n]*roomId/);
});

test("build234 clears recruitment join pending only on a matching room or any join error", () => {
  const notices = [], controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }), toast: message => notices.push(message) });
  controller.friendPanelOpen = true;
  controller.guildPending = { kind: "recruitmentJoin", recruitmentId: "rec-1", targetId: OTHER };
  controller._showConnectionStep = () => {};
  controller._render = () => {};
  controller._applyRoomState({ roomId: "ABC123", leaderId: OTHER, phase: "lobby", selectedFloor: 1, members: [], chatHistory: [] });
  assert.equal(controller.guildPending, null);
  assert.equal(controller.friendPanelOpen, false);
  assert.match(notices.at(-1), /参加しました/);

  controller.connectionReady = true;
  controller.guildPending = { kind: "recruitmentJoin", recruitmentId: "rec-2", targetId: OTHER };
  controller._renderFriendPanel = () => {};
  controller._handleMessage({ type: "error", code: "ROOM_FULL", message: "満員です" });
  assert.equal(controller.guildPending, null);
  assert.match(notices.at(-1), /満員です/);
});

test("build234 CSS remains usable at 320/390 widths with iPhone-safe 44px controls", async () => {
  const [base, css] = await Promise.all([
    readFile(resolve(root, "src/Styles/build233.css"), "utf8"),
    readFile(resolve(root, "src/Styles/build234.css"), "utf8"),
  ]);
  assert.match(base, /env\(safe-area-inset-(?:top|right|bottom|left)\)/);
  assert.match(base, /width:min\(430px,100vw\)/);
  assert.match(css, /\.online-guild-recruitment-form/);
  assert.match(css, /\.online-guild-recruitment-card/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /font-size:16px/);
  assert.match(css, /@media\(max-width:420px\)/);
  assert.match(css, /@media\(max-width:350px\)/);
  assert.doesNotMatch(css, /min-width:\s*[4-9][0-9]{2}px/);
});

test("build234 cache boundary is complete", async () => {
  const [index, main, client, views] = await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"), readFile(resolve(root, "src/main.js"), "utf8"),
    readFile(resolve(root, "src/online/OnlinePartyClient.js"), "utf8"), readFile(resolve(root, "src/online/OnlineViews.js"), "utf8"),
  ]);
  assert.match(index, /build239\.css\?v=2\.11\.65-build239/);
  assert.match(index, /ASSET_VERSION\s*\=\s*"2\.11\.65"/);
  assert.match(index, /ASSET_BUILD\s*\=\s*"build239"/);
  assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.65-build239/);
  assert.match(client, /OnlinePartyScreen\.js\?v=2\.11\.65-build239/);
  assert.match(client, /OnlineViews\.js\?v=2\.11\.65-build239/);
  assert.match(views, /OnlinePartyScreen\.js\?v=2\.11\.65-build239/);
});
