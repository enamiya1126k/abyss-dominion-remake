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
const { renderOnlineFriendPanel, renderOnlineGuildPanel } = await import("../src/ui/screens/OnlinePartyScreen.js?build239-online-safety-test");
const { renderOnlineChat, renderOnlineHome } = await import("../src/online/OnlineViews.js?build239-online-safety-test");
const { OnlinePartyController, normalizeGuildState, normalizeMutedPlayer } = await import("../src/online/OnlinePartyClient.js?build239-online-safety-test");

const SELF_ID = "AD-AAAA-2222";
const MUTED_ID = "AD-BBBB-2222";
const BLOCKED_ID = "AD-CCCC-2222";
const VISIBLE_ID = "AD-DDDD-2222";
const profile = (playerId, name = "冒険者") => ({ playerId, displayName: name, monsterName: "相棒", fallbackEmoji: "魔", online: true });

function controller() {
  const instance = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
  instance.selfId = SELF_ID;
  instance.connectionReady = true;
  instance.capabilities = new Set(["onlineSafetyV1"]);
  instance.friendState = instance._normalizeFriendState({
    friends: [profile(MUTED_ID, "静かな人"), profile(VISIBLE_ID, "見える人")],
    blocked: [{ ...profile(BLOCKED_ID, "遮断した人"), roomId: "SECRET", lastSeenAt: 123, online: true }],
    muted: [profile(MUTED_ID, "静かな人")], incoming: [], outgoing: [], invites: [],
  });
  return instance;
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

function room() {
  return {
    roomId: "ABC234", ownerId: SELF_ID, leaderId: SELF_ID, phase: "lobby",
    members: [
      { playerId: SELF_ID, connected: true, leader: true, profile: profile(SELF_ID, "自分") },
      { playerId: MUTED_ID, connected: true, profile: profile(MUTED_ID, "静かな人") },
      { playerId: VISIBLE_ID, connected: true, profile: profile(VISIBLE_ID, "見える人") },
    ],
    listing: { published: false, purpose: "explore", style: "anyone" },
    chatHistory: [
      { id: "hidden", playerId: MUTED_ID, name: "静かな人", text: "HIDDEN-CHAT", createdAt: 1 },
      { id: "visible", playerId: VISIBLE_ID, name: "見える人", text: "VISIBLE-CHAT", createdAt: 2 },
    ],
  };
}

function guildState() {
  return normalizeGuildState({ guild: {
    guildId: "GD-ABC234", name: "深淵隊", tag: "ABYS", description: "安全設定", level: 1, memberCount: 4, maxMembers: 20,
    leaderId: SELF_ID, role: "leader", checkedInToday: false,
    members: [
      { ...profile(SELF_ID, "自分"), role: "leader", weekPoints: 0 },
      { ...profile(MUTED_ID, "静かな人"), role: "member", weekPoints: 0 },
      { ...profile(BLOCKED_ID, "遮断した人"), role: "member", weekPoints: 0 },
      { ...profile(VISIBLE_ID, "見える人"), role: "member", weekPoints: 0 },
    ],
    applications: [], plans: [], recruitments: [], activities: [],
    chat: [
      { id: "guild-hidden", playerId: MUTED_ID, name: "静かな人", text: "HIDDEN-GUILD", at: 1 },
      { id: "guild-visible", playerId: VISIBLE_ID, name: "見える人", text: "VISIBLE-GUILD", at: 2 },
    ], week: { weekId: "2026-08-24", points: 0, goals: [50], tier: 0, sharedGoals: [] },
  }, invitations: [], applications: [], serverNow: Date.UTC(2026, 7, 28) });
}

test("build239 normalizes private safety DTOs without presence or room metadata", () => {
  const instance = controller();
  assert.deepEqual(instance.friendState.blocked[0], { playerId: BLOCKED_ID, displayName: "遮断した人", monsterName: "相棒", fallbackEmoji: "魔" });
  assert.deepEqual(instance.friendState.muted[0], { playerId: MUTED_ID, displayName: "静かな人", monsterName: "相棒", fallbackEmoji: "魔" });
  assert.equal(normalizeMutedPlayer({ playerId: "BAD", displayName: "x" }), null);
  assert.doesNotMatch(JSON.stringify(instance.friendState.blocked), /SECRET|lastSeen|online/);
});

test("build239 gates safety UX by onlineSafetyV1 and exposes clear management states", () => {
  const source = {
    friends: [profile(MUTED_ID, "<mute>")], incoming: [profile(VISIBLE_ID, "申請者")], outgoing: [], invites: [],
    blocked: [profile(BLOCKED_ID, "<blocked>")], muted: [profile(MUTED_ID, "<mute>")],
  };
  const enabled = renderOnlineFriendPanel(source, { open: true, selfId: SELF_ID, tab: "friends", safetyCapability: true, mutedPlayers: source.muted, guildOptions: { connected: true } });
  assert.match(enabled, /online-safety-settings/);
  assert.match(enabled, /data-online-user-unmute/);
  assert.match(enabled, /data-online-friend-unblock/);
  assert.match(enabled, /data-online-friend-block/);
  assert.match(enabled, /参加・招待・交換は止めません/);
  assert.match(enabled, /同じ部屋にいる場合は自分が退出します/);
  assert.doesNotMatch(enabled, /<blocked>|<mute>/);

  const disabled = renderOnlineFriendPanel(source, { open: true, selfId: SELF_ID, tab: "friends", safetyCapability: false, mutedPlayers: source.muted, guildOptions: { connected: true } });
  assert.doesNotMatch(disabled, /online-safety-settings|data-online-user-mute|data-online-user-unmute|data-online-friend-block|data-online-friend-unblock/);

  const disconnected = renderOnlineFriendPanel(source, { open: true, selfId: SELF_ID, tab: "friends", safetyCapability: true, mutedPlayers: source.muted, guildOptions: { connected: false } });
  assert.match(disconnected, /data-online-user-unmute="AD-BBBB-2222"[^>]*disabled/);
  assert.match(disconnected, /data-online-friend-unblock="AD-CCCC-2222"[^>]*disabled/);
});

test("build239 sends authoritative mute/block routes and requires confirmations", () => {
  const instance = controller(), sent = [], purged = [];
  instance.ws = { readyState: WebSocket.OPEN, send: value => sent.push(JSON.parse(value)) };
  instance._purgePlayerSocial = id => purged.push(id);
  instance._refreshSafetyViews = () => {};
  const previousConfirm = globalThis.confirm;
  try {
    globalThis.confirm = () => false;
    instance._handleClick(buttonEvent({ onlineUserBlock: BLOCKED_ID }));
    assert.equal(sent.length, 0);
    globalThis.confirm = () => true;
    instance._handleClick(buttonEvent({ onlineUserBlock: VISIBLE_ID }));
    instance._handleClick(buttonEvent({ onlineFriendUnblock: BLOCKED_ID }));
    instance._handleClick(buttonEvent({ onlineUserMute: MUTED_ID }));
    instance._handleClick(buttonEvent({ onlineUserUnmute: MUTED_ID }));
  } finally { globalThis.confirm = previousConfirm; }
  assert.deepEqual(sent.map(entry => entry.type), ["friendBlock", "friendUnblock", "friendMute", "friendUnmute"]);
  assert.deepEqual(sent.map(entry => entry.targetId), [VISIBLE_ID, BLOCKED_ID, MUTED_ID, MUTED_ID]);
  assert.deepEqual(purged, [VISIBLE_ID, MUTED_ID]);
});

test("build239 purges and rejects muted or blocked room chat, bubbles, stamps and pings", () => {
  const instance = controller();
  instance.roomState = room(); instance.roomId = "ABC234"; instance.unread = 2;
  instance.chatBubbles.set(MUTED_ID, { playerId: MUTED_ID, text: "hidden", expiresAt: Date.now() + 10_000 });
  instance.socialBubbles.set(BLOCKED_ID, { playerId: BLOCKED_ID, emoji: "✨", expiresAt: Date.now() + 10_000 });
  instance.coopPings.set("hidden-ping", { id: "hidden-ping", playerId: MUTED_ID, expiresAt: Date.now() + 10_000 });
  instance.coopPings.set("visible-ping", { id: "visible-ping", playerId: VISIBLE_ID, expiresAt: Date.now() + 10_000 });
  instance.guildState = guildState();
  instance._purgeHiddenSocial();
  assert.deepEqual(instance.roomState.chatHistory.map(entry => entry.id), ["visible"]);
  assert.equal(instance.chatBubbles.size, 0);
  assert.equal(instance.socialBubbles.size, 0);
  assert.deepEqual(instance._pingSnapshot().map(entry => entry.id), ["visible-ping"]);

  instance._receiveChat({ id: "late", playerId: MUTED_ID, text: "LATE-HIDDEN" });
  instance._receiveSocial({ playerId: BLOCKED_ID, id: "wave" });
  instance._handleMessage({ type: "expeditionPing", ping: { id: "late-ping", playerId: MUTED_ID, expiresAt: Date.now() + 10_000 } });
  assert.equal(instance.roomState.chatHistory.some(entry => entry.id === "late"), false);
  assert.equal(instance.socialBubbles.has(BLOCKED_ID), false);
  assert.equal(instance.coopPings.has("late-ping"), false);
  assert.deepEqual(instance._guildStateForDisplay().guild.chat.map(entry => entry.id), ["guild-visible"]);
});

test("build239 filters safety-hidden content and exposes controls on room and guild surfaces", () => {
  const state = { mutedPlayerIds: [MUTED_ID], blockedPlayerIds: [BLOCKED_ID], safetyCapability: true, roomMemberRemovalPendingId: null, chatDraft: "", chatBubbles: [{ playerId: MUTED_ID, text: "HIDDEN-BUBBLE" }] };
  const chat = renderOnlineChat(room(), SELF_ID, state);
  assert.doesNotMatch(chat, /HIDDEN-CHAT/);
  assert.match(chat, /VISIBLE-CHAT/);
  assert.match(chat, /data-online-user-unmute/);
  assert.match(chat, /data-online-user-block/);
  assert.match(chat, /aria-label="静かな人のチャットとスタンプを表示する"/);
  const oldServerChat = renderOnlineChat(room(), SELF_ID, { ...state, safetyCapability: false });
  assert.doesNotMatch(oldServerChat, /data-online-user-(?:mute|unmute|block)|data-online-friend-unblock/);
  assert.match(oldServerChat, /data-online-remove-room-member/);

  const home = renderOnlineHome(room(), SELF_ID, state);
  assert.doesNotMatch(home, /HIDDEN-BUBBLE/);

  const guild = renderOnlineGuildPanel(guildState(), {
    selfId: SELF_ID, connected: true, capability: true, safetyCapability: true,
    mutedPlayers: [profile(MUTED_ID, "静かな人")], friendState: { friends: [], blocked: [profile(BLOCKED_ID)] },
    roomState: room(), now: Date.UTC(2026, 7, 28), planCapability: true, recruitmentCapability: true,
  });
  assert.doesNotMatch(guild, /HIDDEN-GUILD/);
  assert.match(guild, /VISIBLE-GUILD/);
  assert.match(guild, /data-online-user-unmute/);
  assert.match(guild, /data-online-user-block/);
  assert.match(guild, /online-guild-person offline privacy-hidden/);
  assert.match(guild, /<i>非表示<\/i>/);
  const oldServerGuild = renderOnlineGuildPanel(guildState(), {
    selfId: SELF_ID, connected: true, capability: true, safetyCapability: false,
    mutedPlayers: [profile(MUTED_ID)], friendState: { friends: [], blocked: [profile(BLOCKED_ID)] }, roomState: room(), now: Date.UTC(2026, 7, 28),
  });
  assert.doesNotMatch(oldServerGuild, /data-online-user-(?:mute|unmute|block)|data-online-friend-unblock/);
  assert.match(oldServerGuild, /data-online-guild-kick/);
});

test("build239 safety CSS keeps touch targets, narrow layouts, focus and reduced motion", async () => {
  const css = await readFile(resolve(root, "src/Styles/build239.css"), "utf8");
  assert.match(css, /min-height:44px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /@media\(max-width:420px\)/);
  assert.match(css, /@media\(max-width:320px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});
