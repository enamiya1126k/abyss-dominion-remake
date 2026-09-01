import assert from "node:assert/strict";
import test from "node:test";

import {
  OnlinePartyController,
  normalizePowerRankingProfile,
  normalizePowerRankingSnapshot,
  normalizePowerRankingState,
} from "../src/online/OnlinePartyClient.js?build253-power-ranking-client";
import { verifiedMonsterPower } from "../online-server/src/PlayerPowerRanking.js";

const PLAYER_A = "AD-ABCD-EFGH";
const PLAYER_B = "AD-JKLM-NPQR";

function rankingController() {
  const sent = [], states = [], profiles = [];
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    connectionReady: true,
    capabilities: new Set(["powerRankingsV1", "backgroundConnectionV1"]),
    powerRankingState: normalizePowerRankingState(null, { supported: true }),
    powerRankingProfile: null,
    powerRankingRequests: new Map(),
    powerRankingRequestSequence: 0,
    latestPowerRankingListRequestId: "",
    latestPowerRankingProfileRequestId: "",
    powerRankingWanted: false,
    powerRankingWantedOptions: { limit: 100 },
    powerRankingProfileWanted: "",
    latestPowerRankingSnapshot: null,
    lastPowerRankingSnapshotSignature: "",
    lastPowerRankingSnapshotAt: 0,
    backgroundActive: false,
    backgroundConnectionBusy: false,
    onPowerRankingState: state => states.push(state),
    onPowerRankingProfile: profile => profiles.push(profile),
    onPowerRankingCapability: () => {},
    _send(type, payload) { sent.push({ type, ...payload }); return true; },
  });
  return { controller, sent, states, profiles };
}

test("ranking snapshot is bounded to four unique slots and safe public fields", () => {
  const equipment = Array.from({ length: 9 }, (_, index) => ({ slot: `slot-${index}`, name: `装備${index}`, rarity: "LR", level: 1e12, plus: index, visualAsset: index ? `./assets/item-${index}.png` : "javascript:alert(1)" }));
  const party = Array.from({ length: 6 }, (_, index) => ({
    slot: index === 1 ? 1 : index === 5 ? 2 : index + 1,
    monsterId: `monster-${index}`,
    speciesId: `species-${index}`,
    name: `魔物${index}`,
    customVisualAsset: index ? `./assets/monster-${index}.png` : "data:image/png;base64,AAAA",
    level: 1e12,
    power: 1e20,
    battleStats: { hp: 120, atk: 10, mag: 11, def: 12, res: 13, spd: 14, crit: 15, evasion: 16 },
    equipment,
    magicCircle: { name: "深淵陣", level: 500 },
  }));
  const snapshot = normalizePowerRankingSnapshot({ displayName: "\u202e冒険者", maxFloor: 9999999, power: 1e30, party });

  assert.equal(snapshot.party.length, 4);
  assert.deepEqual(snapshot.party.map(member => member.slot), [1, 2, 3, 4]);
  assert.equal(snapshot.party[0].customVisualAsset, null);
  assert.equal(snapshot.party[0].equipment[0].visualAsset, null);
  assert.equal(snapshot.party[0].equipment.length, 6);
  assert.equal(snapshot.party[0].battleStats.matk, 11);
  assert.equal(snapshot.party[0].battleStats.mdef, 13);
  assert.equal(snapshot.party[0].magicCircle.level, 99);
  assert.equal(snapshot.party[0].level, 99_999_999);
  assert.equal(snapshot.maxFloor, 10_000);
  assert.equal(snapshot.displayName.includes("\u202e"), false);
});

test("snapshot preserves fractional combat stats for exact server verification", () => {
  const stats = { hp: 987, atk: 123, matk: 98, def: 87, mdef: 76, spd: 54, crit: 19.75, evasion: 7.125 };
  const expectedPower = verifiedMonsterPower(stats);
  const snapshot = normalizePowerRankingSnapshot({
    displayName: "小数戦力",
    maxFloor: 120,
    power: expectedPower,
    party: [{ slot: 1, speciesId: "slime", name: "ぷるん", level: 25, power: expectedPower, battleStats: stats }],
  });

  assert.equal(snapshot.party[0].battleStats.crit, stats.crit);
  assert.equal(snapshot.party[0].battleStats.evasion, stats.evasion);
  assert.equal(verifiedMonsterPower(snapshot.party[0].battleStats), expectedPower);
  assert.equal(snapshot.party[0].power, expectedPower);
});

test("ranking list and public profile resolve matching request promises", async () => {
  const { controller, sent, states, profiles } = rankingController();
  const listPromise = controller.requestPowerRankings({ limit: 500 });
  const listRequest = sent.at(-1);
  assert.equal(listRequest.type, "powerRankingList");
  assert.equal(listRequest.limit, 100);

  controller._handleMessage({
    type: "powerRankingState",
    requestId: listRequest.requestId,
    serverNow: 123456,
    staleAfterMs: 30 * 86400000,
    total: 2,
    entries: [
      { rank: 2, playerId: PLAYER_B, displayName: "B", power: 500, maxFloor: 20, updatedAt: 120, icon: { speciesId: "wolf", name: "狼" } },
      { rank: 1, playerId: PLAYER_A, displayName: "A", power: 800, maxFloor: 30, updatedAt: 122, icon: { speciesId: "slime", name: "ぷるん" } },
    ],
    self: { rank: 2, playerId: PLAYER_B, displayName: "B", power: 500, maxFloor: 20, updatedAt: 120, icon: { speciesId: "wolf", name: "狼" } },
  });
  const listResult = await listPromise;
  assert.equal(listResult.ok, true);
  assert.equal(listResult.state.entries[0].playerId, PLAYER_A);
  assert.equal(listResult.state.selfRank, 2);
  assert.equal(states.at(-1).loading, false);

  const profilePromise = controller.requestPowerRankingProfile(PLAYER_A);
  const profileRequest = sent.at(-1);
  controller._handleMessage({
    type: "powerRankingProfileResult",
    requestId: profileRequest.requestId,
    profile: { playerId: PLAYER_A, displayName: "A", power: 800, maxFloor: 30, updatedAt: 122, party: [{ slot: 1, speciesId: "slime", name: "ぷるん", level: 10, battleStats: { hp: 100 } }] },
  });
  const profileResult = await profilePromise;
  assert.equal(profileResult.ok, true);
  assert.equal(profileResult.profile.party.length, 1);
  assert.equal(profiles.at(-1).playerId, PLAYER_A);
});

test("out-of-order ranking responses only publish the latest list and profile", async () => {
  const { controller, sent, states, profiles } = rankingController();
  const oldListPromise = controller.requestPowerRankings({ limit: 10 });
  const oldListRequest = sent.at(-1);
  const newListPromise = controller.requestPowerRankings({ limit: 20 });
  const newListRequest = sent.at(-1);

  const listMessage = (requestId, power, displayName) => ({
    type: "powerRankingState", requestId, serverNow: power, total: 1,
    entries: [{ rank: 1, playerId: PLAYER_A, displayName, power, maxFloor: 10, updatedAt: power, icon: { speciesId: "slime", name: "ぷるん" } }],
    self: null,
  });
  controller._handleMessage(listMessage(newListRequest.requestId, 900, "NEW"));
  controller._handleMessage(listMessage(oldListRequest.requestId, 100, "OLD"));

  assert.equal(controller.powerRankingState.entries[0].power, 900);
  assert.equal(states.at(-1).entries[0].displayName, "NEW");
  assert.equal((await newListPromise).state.entries[0].power, 900);
  assert.equal((await oldListPromise).state.entries[0].power, 100);

  const oldProfilePromise = controller.requestPowerRankingProfile(PLAYER_A);
  const oldProfileRequest = sent.at(-1);
  const newProfilePromise = controller.requestPowerRankingProfile(PLAYER_B);
  const newProfileRequest = sent.at(-1);
  const profileMessage = (requestId, playerId, power) => ({
    type: "powerRankingProfileResult", requestId,
    profile: { playerId, displayName: playerId === PLAYER_A ? "A" : "B", power, maxFloor: 10, updatedAt: power, party: [{ slot: 1, speciesId: "slime", name: "ぷるん", level: 1, battleStats: { hp: 1 } }] },
  });
  controller._handleMessage(profileMessage(newProfileRequest.requestId, PLAYER_B, 800));
  controller._handleMessage(profileMessage(oldProfileRequest.requestId, PLAYER_A, 200));

  assert.equal(controller.powerRankingProfile.playerId, PLAYER_B);
  assert.equal(profiles.at(-1).playerId, PLAYER_B);
  assert.equal((await newProfilePromise).profile.playerId, PLAYER_B);
  assert.equal((await oldProfilePromise).profile.playerId, PLAYER_A);
});

test("snapshot uses nested server payload and unsupported server degrades quietly", async () => {
  const { controller, sent } = rankingController();
  const snapshot = { displayName: "えなみ", maxFloor: 100, power: 3000, party: [{ slot: 1, speciesId: "slime", name: "ぷるん", level: 10, battleStats: { hp: 100, atk: 20 } }] };
  const promise = controller.publishPowerRankingSnapshot(snapshot);
  const request = sent.at(-1);
  assert.equal(request.type, "powerSnapshotSubmit");
  assert.equal(request.snapshot.party.length, 1);
  controller._handleMessage({ type: "powerSnapshotAck", requestId: request.requestId, ok: true });
  assert.equal((await promise).ok, true);

  controller.capabilities.clear();
  const unsupported = await controller.requestPowerRankings();
  assert.deepEqual({ ok: unsupported.ok, reason: unsupported.reason }, { ok: false, reason: "unsupported" });
  assert.equal(controller.powerRankingState.supported, false);
});

test("background lifecycle reuses an open socket and busy ownership blocks retries", () => {
  const originalWebSocket = globalThis.WebSocket;
  globalThis.WebSocket = { OPEN: 1, CONNECTING: 0 };
  try {
    const { controller, sent } = rankingController();
    controller.ws = { readyState: 1 };
    controller.supersededConnection = false;
    controller.mounted = false;
    controller.backgroundOnly = false;
    controller.desiredBackgroundOnly = false;
    controller.connectionModePending = false;
    controller.backgroundBound = [];
    controller._bindBackgroundLifecycle = () => {};
    const result = controller.startBackground();
    assert.equal(result.connected, true);
    assert.equal(controller.backgroundOnly, false);
    assert.equal(controller.desiredBackgroundOnly, true);
    assert.equal(controller.connectionModePending, true);
    assert.equal(sent.at(-1).type, "setConnectionMode");
    assert.equal(sent.at(-1).backgroundOnly, true);

    controller.backgroundConnectionBusy = true;
    assert.equal(controller.startBackground().reason, "busy");
  } finally {
    globalThis.WebSocket = originalWebSocket;
  }
});

test("foreground mode synchronizes the latest profile once after the stable acknowledgement", () => {
  const originalWebSocket = globalThis.WebSocket;
  globalThis.WebSocket = { OPEN: 1, CONNECTING: 0 };
  try {
    const sent = [], modeRequests = [];
    let profileRevision = 0;
    const controller = Object.create(OnlinePartyController.prototype);
    Object.assign(controller, {
      connectionReady: true,
      ws: { readyState: 1 },
      capabilities: new Set(["powerRankingsV1", "backgroundConnectionV1"]),
      backgroundActive: true,
      backgroundOnly: true,
      desiredBackgroundOnly: true,
      backgroundConnectionBusy: false,
      connectionModePending: false,
      foregroundProfileSyncPending: false,
      supersededConnection: false,
      roomState: null,
      unmount: () => {},
      _refreshProfile() { profileRevision += 1; this.profile = { revision: profileRevision }; },
      _bindStaticUi: () => {},
      _renderTradeRecoveryStatus: () => {},
      _renderRoomBoard: () => {},
      _startLoops: () => {},
      _requestConnectionMode(backgroundOnly) { modeRequests.push(backgroundOnly); this.connectionModePending = true; return true; },
      _send(type, payload) { sent.push({ type, ...payload }); return true; },
      _normalizeFriendState: source => source,
      _purgeHiddenSocial: () => {},
      _syncGuildServerClock: () => {},
      _renderFriendPanel: () => {},
      _setStatus: () => {},
      _showConnectionStep: () => {},
      _clearRoom: () => true,
      _requestRoomListings: () => {},
    });

    controller.mount({});
    assert.equal(controller.foregroundProfileSyncPending, true);
    assert.deepEqual(modeRequests, [false]);
    assert.equal(profileRevision, 1);

    // A delayed ACK for the earlier background request must be compensated;
    // it must not consume the one-shot foreground profile synchronization.
    controller._handleMessage({ type: "connectionModeAck", backgroundOnly: true });
    assert.deepEqual(modeRequests, [false, false]);
    assert.equal(sent.some(message => message.type === "profile"), false);

    controller._handleMessage({ type: "connectionModeAck", backgroundOnly: false, friendState: {}, guildState: {}, activeTradeIds: [] });
    assert.deepEqual(sent.filter(message => message.type === "profile"), [{ type: "profile", profile: { revision: 2 } }]);
    assert.equal(controller.foregroundProfileSyncPending, false);

    controller._handleMessage({ type: "connectionModeAck", backgroundOnly: false, friendState: {}, guildState: {}, activeTradeIds: [] });
    assert.equal(sent.filter(message => message.type === "profile").length, 1, "duplicate ACKs cannot resend the profile");
  } finally {
    globalThis.WebSocket = originalWebSocket;
  }
});

test("an open pre-ACK background socket still synchronizes once after foregrounding", () => {
  const originalWebSocket = globalThis.WebSocket;
  globalThis.WebSocket = { OPEN: 1, CONNECTING: 0 };
  try {
    const sent = [], modeRequests = [];
    let profileRevision = 0;
    const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
    Object.assign(controller, {
      ws: { readyState: 1 },
      connectionReady: false,
      helloAckPending: true,
      backgroundActive: true,
      backgroundOnly: true,
      desiredBackgroundOnly: true,
      unmount: () => {},
      _refreshProfile() { profileRevision += 1; this.profile = { revision: profileRevision }; },
      _bindStaticUi: () => {},
      _renderTradeRecoveryStatus: () => {},
      _renderRoomBoard: () => {},
      _startLoops: () => {},
      _requestConnectionMode(backgroundOnly) { modeRequests.push(backgroundOnly); this.connectionModePending = true; return true; },
      _send(type, payload) { sent.push({ type, ...payload }); return true; },
      _currentResumeEndpoint: () => "wss://party.example/party",
      _storeResumeTokenForEndpoint: () => true,
      _flushPowerRankingAfterHandshake: () => {},
      _exitGuestProgressIsolation: () => true,
      _normalizeFriendState: source => source,
      _purgeHiddenSocial: () => {},
      _syncGuildServerClock: () => {},
      _clearGuildPending: () => {},
      _renderFriendPanel: () => {},
      _setStatus: () => {},
      _showConnectionStep: () => {},
      _clearRoom: () => true,
      _settlePendingExpeditionStart: () => {},
      _requestRoomListings: () => {},
      _flushExpeditionProfileSync: () => {},
    });

    controller.mount({});
    assert.equal(controller.foregroundProfileSyncPending, true);
    assert.equal(sent.some(message => message.type === "profile"), false);

    controller._handleMessage({
      type: "helloAck", protocol: "1.16.0", capabilities: { powerRankingsV1: true, backgroundConnectionV1: true },
      playerId: PLAYER_A, resumeToken: "pre-ack-token", backgroundOnly: true, resumed: false, activeTradeIds: [],
    });
    assert.deepEqual(modeRequests, [false]);
    assert.equal(sent.some(message => message.type === "profile"), false);

    controller._handleMessage({ type: "connectionModeAck", backgroundOnly: false, friendState: {}, guildState: {}, activeTradeIds: [] });
    assert.deepEqual(sent.filter(message => message.type === "profile"), [{ type: "profile", profile: { revision: 2 } }]);
  } finally {
    globalThis.WebSocket = originalWebSocket;
  }
});

test("a fresh socket carries the latest profile in hello without a redundant update", () => {
  const originalWebSocket = globalThis.WebSocket;
  class FakeWebSocket {
    static OPEN = 1;
    static CONNECTING = 0;
    static instances = [];
    constructor(url) { this.url = url; this.readyState = 0; this.listeners = new Map(); this.sent = []; FakeWebSocket.instances.push(this); }
    addEventListener(type, listener) { const list = this.listeners.get(type) ?? []; list.push(listener); this.listeners.set(type, list); }
    emit(type, event = {}) { for (const listener of this.listeners.get(type) ?? []) listener(event); }
    open() { this.readyState = FakeWebSocket.OPEN; this.emit("open"); }
    send(payload) { this.sent.push(JSON.parse(payload)); }
    close() { this.readyState = 3; }
  }
  globalThis.WebSocket = FakeWebSocket;
  try {
    let profileRevision = 0;
    const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
    Object.assign(controller, {
      mounted: false,
      backgroundActive: true,
      backgroundOnly: true,
      desiredBackgroundOnly: true,
      _query: selector => selector === "[data-online-server-url]" ? { value: "https://party.example" } : null,
      unmount: () => {},
      _refreshProfile() { profileRevision += 1; this.profile = { revision: profileRevision }; },
      _bindStaticUi: () => {},
      _renderTradeRecoveryStatus: () => {},
      _renderRoomBoard: () => {},
      _startLoops: () => {},
      _refreshResumeTokenFromStorage: () => "",
      _clearGuildPlanTransitionTimer: () => {},
      _clearMoveInputs: () => {},
      _setStatus: () => {},
      _currentResumeEndpoint: () => "wss://party.example/party",
      _storeResumeTokenForEndpoint: () => true,
      _flushPowerRankingAfterHandshake: () => {},
      _normalizeFriendState: source => source,
      _purgeHiddenSocial: () => {},
      _syncGuildServerClock: () => {},
      _clearGuildPending: () => {},
      _renderFriendPanel: () => {},
      _showConnectionStep: () => {},
      _clearRoom: () => true,
      _settlePendingExpeditionStart: () => {},
      _requestRoomListings: () => {},
      _flushExpeditionProfileSync: () => {},
    });

    controller.connect();
    const socket = FakeWebSocket.instances.at(-1);
    controller.mount({});
    assert.equal(controller.foregroundProfileSyncPending, false, "a CONNECTING socket does not schedule a redundant profile update");
    assert.equal(profileRevision, 1);

    socket.open();
    assert.equal(controller.foregroundProfileSyncPending, false);
    assert.deepEqual(socket.sent.map(message => message.type), ["hello"]);
    assert.deepEqual(socket.sent[0].profile, { revision: 2 });
    assert.equal(socket.sent[0].backgroundOnly, false);

    controller._handleMessage({
      type: "helloAck", protocol: "1.16.0", capabilities: { powerRankingsV1: true, backgroundConnectionV1: true },
      playerId: PLAYER_A, resumeToken: "fresh-token", backgroundOnly: false, resumed: false,
      friendState: {}, guildState: {}, activeTradeIds: [], room: null,
    }, socket);
    assert.equal(socket.sent.filter(message => message.type === "profile").length, 0);
  } finally {
    globalThis.WebSocket = originalWebSocket;
  }
});

test("background mode serializes hello/mount/unmount acknowledgement races", () => {
  const originalWebSocket = globalThis.WebSocket;
  globalThis.WebSocket = { OPEN: 1, CONNECTING: 0 };
  try {
    const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
    const sent = [];
    controller.ws = { readyState: 1 };
    controller._send = (type, payload) => { sent.push({ type, ...payload }); return true; };
    controller._setStatus = () => {};
    controller._showConnectionStep = () => {};
    controller.mounted = true;
    controller.backgroundActive = true;
    controller.backgroundOnly = true;
    controller.desiredBackgroundOnly = false;
    controller._handleMessage({
      type: "helloAck",
      protocol: "1.16.0",
      capabilities: { powerRankingsV1: true, backgroundConnectionV1: true },
      playerId: PLAYER_A,
      resumeToken: "resume-token-build253",
      backgroundOnly: true,
      resumed: false,
      activeTradeIds: [],
    });
    assert.equal(sent.at(-1).type, "setConnectionMode");
    assert.equal(sent.at(-1).backgroundOnly, false);
    assert.equal(controller.connectionModePending, true);

    // The screen closes before the foreground ACK arrives. The ACK must be
    // followed by a compensating background request, not leave a headless
    // foreground session behind.
    controller.mounted = false;
    controller._handleMessage({ type: "connectionModeAck", backgroundOnly: false, room: null });
    assert.equal(sent.at(-1).type, "setConnectionMode");
    assert.equal(sent.at(-1).backgroundOnly, true);
    assert.equal(controller.desiredBackgroundOnly, true);
    assert.equal(controller.connectionModePending, true);
  } finally {
    globalThis.WebSocket = originalWebSocket;
  }
});

test("profile normalizer rejects invalid player IDs and caps public party size", () => {
  assert.equal(normalizePowerRankingProfile({ playerId: "bad", party: [] }), null);
  const profile = normalizePowerRankingProfile({
    playerId: PLAYER_A,
    displayName: "A",
    party: Array.from({ length: 8 }, (_, index) => ({ slot: index + 1, speciesId: `m-${index}`, name: `M${index}`, battleStats: { hp: 1 } })),
  });
  assert.equal(profile.party.length, 4);
});
