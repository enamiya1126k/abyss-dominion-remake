import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const profile = Object.freeze({
  displayName: "冒険者", monsterName: "スライム", speciesId: "slime", fallbackEmoji: "魔", level: 10, maxFloor: 100,
});

const member = (playerId, extra = {}) => ({ playerId, connected: true, ready: true, teamReady: true, profile, ...extra });

test("build230 exposes live connection state throughout the room and blocks unsafe sends", async () => {
  const [screen, client] = await Promise.all([
    read("src/ui/screens/OnlinePartyScreen.js"),
    read("src/online/OnlinePartyClient.js"),
  ]);
  assert.match(screen, /data-online-connection-banner[^>]*role="status"[^>]*aria-live="polite"[^>]*aria-atomic="true"/);
  assert.match(screen, /data-online-route="home"[^>]*aria-current="page"/);
  assert.match(client, /this\.connectionReady = false/);
  assert.match(client, /_canMutateOnline\(\)/);
  assert.match(client, /ONLINE_STATE_CONTROL_SELECTOR/);
  assert.match(client, /const ONLINE_PROTOCOL = "1\.16\.0"/);
  assert.match(client, /dataset\.onlineConnectionDisabled = "1"/);
  assert.match(client, /_clearMoveInputs\(\)/);
  assert.match(client, /_confirmRoomExit\(\)/);
  assert.match(client, /globalThis\.confirm/);
  assert.match(client, /helloAckPending/);
  assert.match(client, /_handleHandshakeError\(message\)/);
  assert.match(client, /pendingLeaveOnReconnect/);
  assert.match(client, /dataset\.onlineForceCloseLeave = "1"/);
});

test("build230 makes lobby authority and readiness visible before start", async () => {
  const { renderOnlineExplore, renderOnlineRaid, renderOnlineTeam } = await import("../src/online/OnlineViews.js?v=2.11.56-build230-test");
  const readyRoom = {
    roomId: "AB12CD", leaderId: "host", phase: "lobby", selectedFloor: 50,
    members: [member("host", { leader: true, teamSide: "sun" }), member("guest", { teamSide: "moon" })],
    weeklyRaid: { weekId: "week", boss: { id: "boss", name: "ボス", level: 1, maxHp: 100, heroAsset: "./boss.png" }, modifier: {} },
  };
  const guestExplore = renderOnlineExplore(readyRoom, "guest");
  assert.match(guestExplore, /data-online-floor[^>]*readonly[^>]*aria-readonly="true"/);
  assert.match(guestExplore, /data-online-start-explore disabled/);
  assert.match(guestExplore, /出発操作は部屋主/);
  assert.match(guestExplore, /data-online-ready aria-pressed="true"/);

  const waitingExplore = renderOnlineExplore({ ...readyRoom, members: [member("host", { leader: true, ready: false }), member("guest")] }, "host");
  assert.match(waitingExplore, /data-online-start-explore disabled/);
  assert.match(waitingExplore, /全員が接続し、準備完了/);
  assert.doesNotMatch(renderOnlineExplore(readyRoom, "host"), /data-online-start-explore disabled/);

  assert.doesNotMatch(renderOnlineRaid(readyRoom, "host"), /data-online-start-raid disabled/);
  assert.doesNotMatch(renderOnlineTeam(readyRoom, "host"), /data-online-start-team disabled/);
  assert.match(renderOnlineTeam({ ...readyRoom, members: [member("host", { leader: true, teamSide: "sun" }), member("guest", { teamSide: "spectator" })] }, "host"), /data-online-start-team disabled/);
  assert.match(renderOnlineTeam(readyRoom, "host"), /data-online-team-side="sun"[^>]*aria-pressed="true"/);
  for (const markup of [renderOnlineExplore(readyRoom, "host", { trade: { tradeId: "trade" } }), renderOnlineRaid(readyRoom, "host", { trade: { tradeId: "trade" } }), renderOnlineTeam(readyRoom, "host", { trade: { tradeId: "trade" } })]) {
    assert.match(markup, /data-online-start-(?:explore|raid|team) disabled/);
    assert.match(markup, /交換を完了または中止/);
  }
});

test("build244 keeps hold-to-move on the normal exploration map only", async () => {
  const client = await read("src/online/OnlinePartyClient.js");
  assert.match(client, /event\.target\.closest\?\.\("\[data-online-move\]"\)/);
  assert.match(client, /this\.movePointers\.set\(pointerId/);
  assert.match(client, /for \(const target of \[window, document\]\) for \(const type of \["pointerup", "pointercancel"\]\)/);
  assert.match(client, /this\.route === "explore" && this\.roomState\?\.phase === "expedition"/);
  assert.doesNotMatch(client, /data-online-resonance-move|_send\("resonanceMove"/);
});

test("build244 keeps standalone maze pointer state removed and safely redirects legacy events", async () => {
  const client = await read("src/online/OnlinePartyClient.js");
  assert.doesNotMatch(client, /resonanceClickSuppressions|RESONANCE_MOVE_STOP_CODES|lastResonanceMoveError/);
  assert.match(client, /storedRoute === "resonance" \? "explore"/);
  assert.match(client, /errorCode === "RESONANCE_INTEGRATED"/);
  assert.match(client, /共鳴迷宮は共同探索へ統合されました/);
});

test("build230 handshake recovery is bounded and tokenless hello ACK loss can retry", async () => {
  const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?v=2.11.56-build230-handshake-test");
  const previousStorage = globalThis.localStorage;
  const values = new Map([["abyss-dominion-online-server-url", "https://party.example"], ["abyss-dominion-online-auto-connect", "0"], ["abyss-dominion-online-resume-token", "fresh-token"]]);
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
  try {
    const controller = Object.create(OnlinePartyController.prototype);
    Object.assign(controller, { resumeToken: "stale-token", resumeTokenStorageSnapshot: "stale-token", helloAckPending: true, mounted: true, manualClose: false, ws: null, reconnectTimer: null });
    assert.equal(controller._refreshResumeTokenFromStorage(), "fresh-token");
    controller.resumeToken = "intentional-token"; controller.resumeTokenStorageSnapshot = "fresh-token";
    assert.equal(controller._refreshResumeTokenFromStorage(), "intentional-token", "unchanged storage does not overwrite an intentional in-memory token");
    controller.resumeToken = ""; controller.resumeTokenStorageSnapshot = ""; values.set("abyss-dominion-online-resume-token", "");
    let reconnects = 0; controller.connect = ({ reconnect }) => { if (reconnect) reconnects += 1; };
    controller._refreshResumeTokenFromStorage = () => "";
    controller._ensureConnectionAfterResume();
    assert.equal(reconnects, 1, "only an outstanding tokenless hello may bypass normal auto-connect requirements");
    controller.helloAckPending = false;
    controller._ensureConnectionAfterResume();
    assert.equal(reconnects, 1, "an ordinary blank-token screen does not auto-connect");
  } finally { if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage; }
});

test("build230 scopes resume tokens to normalized endpoints across A-B-A and invite switches", async () => {
  const previousStorage = globalThis.localStorage, previousWebSocket = globalThis.WebSocket;
  const keys = {
    global: "abyss-dominion-online-resume-token", map: "abyss-dominion-online-resume-token-map-v1",
    migrated: "abyss-dominion-online-resume-token-map-migrated-v1", server: "abyss-dominion-online-server-url",
  };
  const values = new Map([[keys.global, "token-A"], [keys.server, "https://a.example"]]);
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
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
    const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?v=2.11.56-build230-endpoint-token-test");
    const controller = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
    assert.equal(controller.resumeToken, "token-A", "the legacy token migrates only to its previously saved server A");
    assert.equal(JSON.parse(values.get(keys.map))["wss://a.example/party"], "token-A");
    assert.equal(values.get(keys.migrated), "1");
    controller._storeResumeTokenForEndpoint("wss://b.example/party", "token-B");
    let currentInput = "https://a.example";
    controller._query = selector => selector === "[data-online-server-url]" ? { value: currentInput } : null;
    controller._refreshProfile = () => { controller.profile = {}; };
    controller._clearMoveInputs = () => {};
    controller._setStatus = () => {};
    controller.toast = message => { throw new Error(message); };
    const connectAndReadHello = () => {
      controller.connect();
      const socket = FakeWebSocket.instances.at(-1); socket.open();
      const hello = socket.sent.find(message => message.type === "hello");
      return { socket, hello };
    };

    const firstA = connectAndReadHello();
    assert.equal(firstA.socket.url, "wss://a.example/party");
    assert.equal(firstA.hello.resumeToken, "token-A");
    firstA.socket.readyState = 3; controller.ws = null;

    currentInput = "https://b.example/invite?partyRoom=ABCDEF";
    const inviteB = connectAndReadHello();
    assert.equal(inviteB.socket.url, "wss://b.example/party", "the visible invite server selects endpoint B instead of saved A");
    assert.equal(inviteB.hello.resumeToken, "token-B");
    const beforeLateAck = values.get(keys.map);
    controller._handleMessage({ type: "helloAck", protocol: "1.16.0", resumeToken: "late-token-A" }, firstA.socket);
    assert.equal(values.get(keys.map), beforeLateAck, "a delayed socket A ACK cannot overwrite endpoint B or its compatibility token");
    inviteB.socket.readyState = 3; controller.ws = null;

    currentInput = "https://a.example";
    const secondA = connectAndReadHello();
    assert.equal(secondA.hello.resumeToken, "token-A", "returning B to A restores A's original recovery credential");
    assert.equal(JSON.parse(values.get(keys.map))["wss://b.example/party"], "token-B");
    secondA.socket.readyState = 3; controller.ws = null;
    const reloadedA = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
    assert.equal(reloadedA.resumeToken, "token-A", "the one-time migration marker prevents global token-B from replacing mapped token-A");

    values.set(keys.map, JSON.stringify({
      "wss://a.example/party": "x".repeat(513),
      "javascript:alert(1)": "unsafe",
      "wss://b.example/not-party": "wrong-path",
    }));
    values.set(keys.server, "https://a.example"); values.set(keys.migrated, "1");
    const invalid = new OnlinePartyController({ getState: () => ({ monsters: [], party: [] }) });
    assert.equal(invalid.resumeToken, "", "oversized tokens and noncanonical endpoints are ignored at the storage boundary");
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage;
    if (previousWebSocket === undefined) delete globalThis.WebSocket; else globalThis.WebSocket = previousWebSocket;
  }
});

test("build230 stops only a superseded tab while ordinary disconnects still retry", async () => {
  const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?v=2.11.56-build230-superseded-test");
  const previousStorage = globalThis.localStorage;
  const values = new Map([["abyss-dominion-online-auto-connect", "1"]]);
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
  const makeController = socket => {
    const controller = Object.create(OnlinePartyController.prototype), calls = [];
    Object.assign(controller, {
      ws: socket, connectionReady: true, manualClose: false, supersededConnection: false, helloAckPending: true,
      mounted: true, reconnectTimer: null, reconnectAttempts: 0, pendingLeaveOnReconnect: null, pendingLeaveTimer: null,
      merchantPendingTimer: null, merchantPending: false, roomState: { roomId: "AB12CD" },
      _clearMoveInputs: () => calls.push("clearMoves"), _clearInteractionPending: () => {},
      _clearRoom: () => calls.push("clearRoom"), _setStatus: (...args) => calls.push(["status", ...args]),
      connect: () => calls.push("connect"),
    });
    return { controller, calls };
  };
  try {
    const replacedSocket = {}, replaced = makeController(replacedSocket);
    replaced.controller._handleClose(replacedSocket, { code: 4001, reason: "replaced by reconnect" });
    assert.equal(replaced.controller.manualClose, true);
    assert.equal(replaced.controller.supersededConnection, true);
    assert.equal(replaced.controller.reconnectTimer, null, "a replaced tab never starts the reconnect/kick loop");
    assert.equal(values.get("abyss-dominion-online-auto-connect"), "1", "the surviving tab's shared auto-connect preference is preserved");
    assert.ok(replaced.calls.includes("clearRoom"));

    const droppedSocket = {}, dropped = makeController(droppedSocket);
    dropped.controller._handleClose(droppedSocket, { code: 1006, reason: "network lost" });
    assert.ok(dropped.controller.reconnectTimer, "an ordinary network loss still receives a bounded reconnect timer");
    clearTimeout(dropped.controller.reconnectTimer);
  } finally { if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage; }
});

test("build230 never replays an old room leave against a different resumed room", async () => {
  const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?v=2.11.56-build230-leave-room-id-test");
  const previousStorage = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
  try {
    const controller = Object.create(OnlinePartyController.prototype), sent = [], applied = [], settled = [];
    Object.assign(controller, {
      connectionReady: false, helloAckPending: true, reconnectAttempts: 2, handshakeTokenRetries: 1,
      capabilities: new Set(), selfId: "host", resumeToken: "token", resumeTokenStorageSnapshot: "token",
      pendingLeaveOnReconnect: { roomId: "AAAAAA", exitAfter: true, sent: false }, pendingLeaveTimer: null,
      pendingExpeditionStart: false, getState: () => ({}), onOnlineStateMutation: () => {}, toast: () => {},
      _showConnectionStep: () => {}, _setStatus: () => {}, _applyRoomState: room => applied.push(room.roomId),
      _settlePendingExpeditionStart: (room, options) => settled.push([room?.roomId ?? null, options]),
      _flushExpeditionProfileSync: () => {}, _send: type => { sent.push(type); return true; },
    });
    controller._handleMessage({ type: "helloAck", protocol: "1.16.0", resumed: true, playerId: "host", resumeToken: "token", room: { roomId: "BBBBBB", phase: "lobby" } });
    assert.equal(sent.includes("leaveRoom"), false, "room A's pending intent cannot leave room B");
    assert.equal(controller.pendingLeaveOnReconnect, null);
    assert.deepEqual(applied, ["BBBBBB"], "the authoritative room B remains active for a fresh confirmation");
    assert.equal(settled.at(-1)[0], null, "pending start state from the old room is rejected too");

    controller.pendingLeaveOnReconnect = { roomId: "AAAAAA", exitAfter: false, sent: false };
    controller._handleMessage({ type: "helloAck", protocol: "1.16.0", resumed: true, playerId: "host", resumeToken: "token", room: { roomId: "AAAAAA", phase: "lobby" } });
    assert.equal(sent.filter(type => type === "leaveRoom").length, 1, "the leave is replayed only for its captured room A");
  } finally { if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage; }
});

test("build230 queues an offline room leave and offers an explicit airplane-mode escape", async () => {
  const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?v=2.11.56-build230-leave-test");
  const previousStorage = globalThis.localStorage, previousConfirm = globalThis.confirm;
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
  globalThis.confirm = () => true;
  try {
    const controller = Object.create(OnlinePartyController.prototype), calls = [];
    Object.assign(controller, {
      roomState: { roomId: "AB12CD", phase: "lobby" }, roomId: "AB12CD", connectionReady: false, ws: null,
      pendingLeaveOnReconnect: null, pendingLeaveTimer: null, heldDirections: new Set(), keyboardMoveMode: "",
      movePointers: new Map(), resonanceClickSuppressions: [], path: [], manualClose: false,
      _setStatus: (...args) => calls.push(["status", ...args]), connect: () => calls.push(["connect"]),
      disconnect: options => calls.push(["disconnect", options]), toast: message => calls.push(["toast", message]), onBack: () => calls.push(["back"]),
    });
    controller._requestRoomLeave({ exitAfter: true });
    assert.equal(controller.pendingLeaveOnReconnect.roomId, "AB12CD");
    assert.equal(values.get("abyss-dominion-online-auto-connect"), "1");
    assert.ok(calls.some(([kind]) => kind === "connect"), "offline leave reconnects before clearing local room state");
    controller.pendingLeaveOnReconnect.allowOfflineExit = true;
    controller._forceClosePendingRoomLeave();
    assert.equal(controller.pendingLeaveOnReconnect, null);
    assert.ok(calls.some(([kind]) => kind === "disconnect"));
    assert.ok(calls.some(([kind]) => kind === "back"));
    clearTimeout(controller.pendingLeaveTimer);
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage;
    if (previousConfirm === undefined) delete globalThis.confirm; else globalThis.confirm = previousConfirm;
  }
});

test("build230 commits a staged secret-room run only after accepted start and clears reconnect rejection", async () => {
  const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?v=2.11.56-build230-start-test");
  const controller = Object.create(OnlinePartyController.prototype), committed = [];
  Object.assign(controller, { selfId: "host", pendingExpeditionStart: true, pendingSecretRoomRun: { id: "candidate", seed: 123, startedAt: 1 }, onBeginSecretRoomExpedition: run => committed.push(run) });
  assert.equal(controller._settlePendingExpeditionStart({ phase: "lobby", leaderId: "host" }, { rejected: true }), false);
  assert.equal(controller.pendingExpeditionStart, false);
  assert.equal(controller.pendingSecretRoomRun, null);
  assert.equal(committed.length, 0, "rejected or lost start never mutates the local secret-room run");
  controller.pendingExpeditionStart = true; controller.pendingSecretRoomRun = { id: "accepted", seed: 456, startedAt: 2 };
  assert.equal(controller._settlePendingExpeditionStart({ phase: "expedition", leaderId: "host" }), true);
  assert.deepEqual(committed, [{ id: "accepted", seed: 456, startedAt: 2 }]);
  controller.getState = () => ({ secretRooms: { run: { id: "old-after-reload", seed: 1 } } });
  assert.equal(controller._commitAuthoritativeSecretRoomRun({ id: "accepted-on-server", seed: 789 }), true);
  assert.equal(committed.at(-1).id, "accepted-on-server", "reconnect converges the local run to the authoritative active expedition");
});

test("build230 idempotently resumes terminal trade commits without releasing escrow", async () => {
  const [client, styles] = await Promise.all([
    read("src/online/OnlinePartyClient.js"), read("src/Styles/build230.css"),
  ]);
  assert.match(client, /message\.type === "tradeRecoveryPending"/);
  assert.match(client, /this\._commitTrade\(message, \{ recovery: true \}\)/);
  assert.match(client, /commitOnlineTrade\(this\.getState\?\.\(\) \?\? \{\}, tradeId, message\.incomingAsset/);
  assert.match(client, /this\._send\("tradeAck", \{ tradeId, success: true \}\)/);
  assert.match(client, /cancelled && this\.terminalTradeRecoveries\.has\(id\)/);
  assert.match(client, /交換を安全に復旧しています/);
  assert.match(client, /交換の復旧が完了しました/);
  assert.match(client, /dataset\.onlineTradeRecoveryStatus = "1"/);
  assert.match(styles, /\.online-trade-recovery-status/);
});

test("build230 keeps iPhone fields readable, room facts visible, and touch targets safe", async () => {
  const styles = await read("src/Styles/build230.css");
  assert.match(styles, /\.online-v3-screen :is\(input,select,textarea\)\{font-size:16px!important\}/);
  assert.match(styles, /online-room-listing-card dl>div:first-child,[^]*online-room-listing-card dl>div:nth-child\(2\)\{display:grid!important\}/);
  assert.match(styles, /online-room-board-gate :is\(button,select,input\)[^]*min-height:44px/);
  assert.match(styles, /online-v3-roombar \[data-copy-invite\]\{display:block!important\}/);
  assert.match(styles, /online-resonance-dpad button\{[^}]*min-width:44px!important[^}]*min-height:44px!important/);
  assert.match(styles, /env\(safe-area-inset-top\)/);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
  assert.match(styles, /orientation:portrait/);
  assert.match(styles, /touch-action:none!important/);
});

test("build237 uses one client cache boundary", async () => {
  const [index, main, client, views] = await Promise.all([
    read("index.html"), read("src/main.js"), read("src/online/OnlinePartyClient.js"), read("src/online/OnlineViews.js"),
  ]);
  assert.match(index, /build239\.css\?v=2\.11\.65-build239/);
  assert.match(index, /ASSET_VERSION = "2\.11\.69"/);
  assert.match(index, /ASSET_BUILD = "build245"/);
  assert.match(main, /OnlinePartyScreen\.js\?v=2\.11\.69-build245/);
  assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.69-build245/);
  assert.match(client, /OnlineViews\.js\?v=2\.11\.69-build245/);
  assert.match(views, /OnlinePartyScreen\.js\?v=2\.11\.69-build245/);
});

console.log("ABYSS DOMINION build230 mobile connection regression: PASS");
