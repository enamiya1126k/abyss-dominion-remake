import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?build255-online-guest-progress-isolation-test");
const clientSource = await readFile(new URL("../src/online/OnlinePartyClient.js", import.meta.url), "utf8");
const mainSource = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

function lifecycleController(events) {
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    selfId: "guest",
    guestProgressIsolationContext: null,
    recoverySettlementFailed: false,
    onGuestProgressIsolation: event => { events.push(event); return { ok: true }; },
  });
  return controller;
}

test("build255 brackets a guest room across enter, resume, and clear without trusting leader fallback", () => {
  const events = [], controller = lifecycleController(events);
  const room = {
    roomId: "AB12CD", ownerId: "host", leaderId: "guest", selectedFloor: 80,
    coopRun: { runId: "run-80", startFloor: 80 },
    expedition: { id: "floor-80", hostOwnerId: "host", floor: 80 },
  };

  assert.equal(controller._canonicalRoomOwnerId({ leaderId: "guest" }), "", "leaderId alone is never world ownership");
  assert.equal(controller._syncGuestProgressIsolation(room), true);
  assert.equal(controller._syncGuestProgressIsolation(room), true);
  assert.deepEqual(events.map(event => event.phase), ["enter"], "ordinary room refreshes do not duplicate the snapshot");
  assert.equal(controller._syncGuestProgressIsolation(room, { reconnected: true }), true);
  assert.deepEqual(events.map(event => event.phase), ["enter", "reconnect"]);
  assert.equal(controller._syncGuestProgressIsolation({ roomId: room.roomId, leaderId: "guest" }), true);
  assert.deepEqual(events.map(event => event.phase), ["enter", "reconnect"], "an ownerless partial snapshot fails closed and retains the guest guard");

  Object.assign(controller, {
    roomState: room, roomId: room.roomId, pendingExpeditionReturnResult: null,
    processedCoopTechniqueEvents: new Set(), root: null, ws: null,
    _clearMoveInputs: () => {}, _closeAllBattleMenus: () => {}, _clearInteractionPending: () => {},
    _clearTradeUi: () => {}, _unmountExploreCanvas: () => {}, _query: () => null,
    _showConnectionStep: () => {}, _requestRoomListings: () => {},
  });
  controller._clearRoom({ reason: "leftRoom" });
  assert.deepEqual(events.map(event => event.phase), ["enter", "reconnect", "exit"]);
  assert.equal(events.at(-1).reason, "leftRoom");
  assert.equal(controller.guestProgressIsolationContext, null);
});

test("build255 refuses a room update when the guest progression guard cannot be saved", () => {
  const sent = [], notices = [];
  const previousRoom = { roomId: "OLD123", ownerId: "host-old" };
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    roomState: previousRoom,
    roomId: previousRoom.roomId,
    recoverySettlementFailed: false,
    _syncGuestProgressIsolation: () => false,
    _syncActiveExpeditionRun: () => { throw new Error("must not start an expedition without a guard"); },
    _setStatus: (...args) => notices.push(["status", ...args]),
    toast: message => notices.push(["toast", message]),
    _send: (type, payload) => { sent.push({ type, payload }); return true; },
  });

  assert.equal(controller._applyRoomState({ roomId: "NEW123", ownerId: "host-new", phase: "lobby" }), false);
  assert.equal(controller.roomState, previousRoom, "the last protected room context remains available for recovery");
  assert.equal(controller.roomId, previousRoom.roomId);
  assert.equal(controller.recoverySettlementFailed, true);
  assert.deepEqual(sent.map(entry => entry.type), ["leaveRoom"]);
  assert.ok(notices.some(entry => entry[0] === "status" && entry[1] === "error"));
});

test("build255 keeps room and guard context when exit restoration cannot be persisted", () => {
  const events = [], controller = lifecycleController(events);
  const room = { roomId: "AB12CD", ownerId: "host" };
  Object.assign(controller, {
    roomState: room, roomId: room.roomId,
    guestProgressIsolationContext: { roomId: room.roomId, ownerId: "host", selfId: "guest", runId: "run" },
    onGuestProgressIsolation: event => { events.push(event); return { ok: false }; },
    _setStatus: () => {}, toast: () => {},
  });

  assert.equal(controller._clearRoom({ reason: "disconnect" }), false);
  assert.equal(controller.roomState, room);
  assert.equal(controller.roomId, room.roomId);
  assert.equal(controller.guestProgressIsolationContext.roomId, room.roomId);
  assert.deepEqual(events.map(event => [event.phase, event.reason]), [["exit", "disconnect"]]);
});

test("build255 host-world mutations fail closed unless an explicit owner exactly matches self", () => {
  const calls = [], sent = [];
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    selfId: "guest", roomState: { roomId: "AB12CD", ownerId: "host", members: [{ playerId: "guest" }, { playerId: "host" }] },
    capabilities: new Set(["hostWorldReceiptsV1"]), hostWorldRevision: 0,
    processedHostWorldDeltas: new Set(), recoverySettlementFailed: false,
    onHostWorldUpdate: event => { calls.push(event); return { ok: true }; },
    onFloorBossDefeated: event => { calls.push({ kind: "floorBossCallback", ...event }); return { ok: true }; },
    _send: (type, payload) => { sent.push({ type, payload }); return true; },
    _notifyTutorialGuide: () => {}, _announceExpeditionEvent: () => {},
    _closeBattleMenus: () => {}, toast: () => {}, _render: () => {},
  });

  const hostWorld = { revision: 1, openedChestIds: {}, floorSeeds: {}, defeatedBossFloors: [] };
  assert.equal(controller._applyHostWorldDelta({ mutationId: "missing", revision: 1, hostWorld, delta: {} }).ignored, true);
  assert.equal(controller._applyHostWorldDelta({ mutationId: "other", ownerId: "host", revision: 1, hostWorld, delta: {} }).ignored, true);
  assert.equal(calls.length, 0);
  controller._applyHostWorldDelta({ mutationId: "self", ownerId: "guest", revision: 1, hostWorld, delta: {} });
  assert.equal(calls.filter(event => event.kind === "hostWorldSnapshot").length, 1);
  assert.deepEqual(sent.map(entry => entry.payload.mutationId), ["missing", "other", "self"]);

  controller._handleMessage({ type: "expeditionEvent", event: { kind: "hostChestOpened", chestId: "ownerless" } });
  controller._handleMessage({ type: "expeditionEvent", event: { kind: "hostChestOpened", ownerId: "host", chestId: "host" } });
  controller._handleMessage({ type: "expeditionEvent", event: { kind: "hostChestOpened", ownerId: "guest", chestId: "self" } });
  assert.deepEqual(calls.filter(event => event.kind === "hostChestOpened").map(event => event.chestId), ["self"]);

  controller._handleMessage({ type: "floorBossDefeated", floor: 80, firstClear: true });
  controller._handleMessage({ type: "floorBossDefeated", ownerId: "host", floor: 80, firstClear: true });
  controller._handleMessage({ type: "floorBossDefeated", ownerId: "guest", floor: 80, firstClear: true });
  assert.equal(calls.filter(event => event.kind === "floorBossDefeated").length, 1);
  assert.equal(calls.filter(event => event.kind === "floorBossCallback").length, 0,
    "Build308 settles the reward at the per-boss trophy rather than the defeat event");
});

test("build255 expedition results expose progression eligibility only for explicit self ownership", async () => {
  const received = [], sent = [];
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    selfId: "guest", roomState: { roomId: "AB12CD", ownerId: "guest", leaderId: "guest" },
    capabilities: new Set(["expeditionResultsV1"]), expeditionResultInFlight: new Set(),
    presentedExpeditionResultIds: new Set(), recoverySettlementBatch: 1, recoverySettlementFailed: false,
    onExpeditionResult: async event => { received.push(event); return { ok: true, duplicate: true }; },
    _send: (type, payload) => { sent.push({ type, payload }); return true; },
  });
  const base = { runId: "run", recipientId: "guest", startFloor: 10, endFloor: 11, floorsCleared: 1 };
  await controller._receiveExpeditionResult({ ...base, resultId: "ownerless", summary: {} }, 1);
  await controller._receiveExpeditionResult({ ...base, resultId: "owned-no-flag", ownerId: "guest", summary: {} }, 1);
  await controller._receiveExpeditionResult({ ...base, resultId: "owned", ownerId: "guest", progressionEligible: true, summary: {} }, 1);
  await controller._receiveExpeditionResult({ ...base, resultId: "hosted", ownerId: "host", summary: {} }, 1);
  await controller._receiveExpeditionResult({
    runId: "assisted-run", resultId: "assisted", recipientId: "guest", ownerId: "host", progressionEligible: false,
    assistedWorld: { ownerId: "host", startFloor: 20, endFloor: 23, floorsCleared: 3, nextFloor: 24 },
    summary: { multiplayer: true, nextFloor: 24, ownerFloorUnlock: 24, leaderFloorUnlock: 24, floorUnlock: 24, unlockFloor: 24, unlockedFloor: 24, maxFloorUnlock: 24, maxFloor: 24, assistedWorld: { ownerId: "host", startFloor: 20, endFloor: 23, floorsCleared: 3, ownerFloorUnlock: 24 } },
  }, 1);

  assert.deepEqual(received.map(event => event.progressionEligible), [false, false, true, false, false]);
  assert.deepEqual(received.map(event => event.summary.progressionEligible), [false, false, true, false, false]);
  const assisted = received.at(-1);
  assert.deepEqual(assisted.assistedWorld, { ownerId: "host", startFloor: 20, endFloor: 23, floorsCleared: 3 });
  assert.deepEqual(assisted.summary.assistedWorld, assisted.assistedWorld);
  for (const field of ["startFloor", "endFloor", "floorsCleared", "floor", "nextFloor", "ownerFloorUnlock", "leaderFloorUnlock", "floorUnlock", "unlockFloor", "unlockedFloor", "maxFloorUnlock", "maxFloor"]) {
    assert.equal(Object.hasOwn(assisted, field), false, `guest callback omits progression field ${field}`);
    assert.equal(Object.hasOwn(assisted.summary, field), false, `guest summary omits progression field ${field}`);
  }
  assert.equal(sent.filter(entry => entry.type === "expeditionResultAck").length, 5);

  await controller._receiveExpeditionResult({ runId: "bad-owner", resultId: "bad-owner", recipientId: "guest", ownerId: "guest", progressionEligible: true, summary: {} }, 1);
  assert.equal(received.length, 5, "an owner result without its required top-level progression span fails closed");
  assert.equal(sent.filter(entry => entry.type === "expeditionResultAck").length, 5, "a malformed owner result is not ACKed away");
  assert.equal(controller.recoverySettlementFailed, true);
});

test("build255 completed guest expedition toast reads the assisted world floor", () => {
  const notices = [];
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    selfId: "guest", roomState: { roomId: "AB12CD", ownerId: "host", members: [{ playerId: "host" }, { playerId: "guest" }] },
    presentationKoIds: { explore: new Set() }, _closeAllBattleMenus: () => {}, toast: message => notices.push(message), _render: () => {},
  });
  controller._handleMessage({
    type: "expeditionEnded",
    summary: { completed: true, multiplayer: true, progressionEligible: false, assistedWorld: { ownerId: "host", startFloor: 20, endFloor: 23, floorsCleared: 3 } },
  });
  assert.deepEqual(notices, ["23F 踏破！"]);
  assert.equal(notices.some(message => message.includes("undefinedF")), false);
});

test("build255 guest result modal labels assisted-world floors without implying local progress", () => {
  const from = mainSource.indexOf("function showOnlineExpeditionSummary"), to = mainSource.indexOf("function showOnlineExpeditionResult", from);
  assert.ok(from >= 0 && to > from);
  let rendered = "";
  const primary = {}, modal = { classList: { add: () => {} }, querySelector: () => primary, remove: () => {} };
  const context = {
    app: { insertAdjacentHTML: (_position, html) => { rendered = html; } },
    Modal: (_title, body) => body, topModal: () => modal,
    escapeAttribute: value => String(value ?? ""), pixelIcon: () => "",
  };
  vm.runInNewContext(`${mainSource.slice(from, to)}\nthis.show=showOnlineExpeditionSummary;`, context);
  context.show({
    guest: true, reason: "return",
    summary: { progressionEligible: false, completed: true, ranking: [], assistedWorld: { ownerId: "host", startFloor: 20, endFloor: 23, floorsCleared: 3 } },
  });
  assert.match(rendered, /部屋主の出発/);
  assert.match(rendered, /20F/);
  assert.match(rendered, /部屋主の帰還地点/);
  assert.match(rendered, /23F/);
  assert.match(rendered, /お手伝い踏破/);
  assert.match(rendered, /3階/);
});

test("build255 wires guest isolation through room resume, disconnect, and completed leave paths", () => {
  assert.match(clientSource, /OnlineViews\.js\?v=3\.0\.9-build309/);
  assert.match(clientSource, /onGuestProgressIsolation = \(\) => \(\{ ok: true \}\)/);
  assert.match(clientSource, /_applyRoomState\(message\.room, \{ reconnected: Boolean\(message\.resumed\) \}\)/);
  assert.match(clientSource, /this\._syncGuestProgressIsolation\(room, \{ reconnected \}\)/);
  assert.match(clientSource, /this\._clearRoom\(\{ reason: message\.resumed \? "resumeWithoutRoom" : "helloWithoutRoom" \}\)/);
  assert.match(clientSource, /this\._clearRoom\(\{ reason: leave \? "disconnectLeave" : "disconnect" \}\)/);
  assert.match(clientSource, /this\._clearRoom\(\{ reason: "leaveComplete" \}\)/);
  assert.match(clientSource, /_clearRoom\(\{ reason = "roomClear" \} = \{\}\) \{\n    if \(!this\._exitGuestProgressIsolation\(reason\)\)/);
  const applyStart = clientSource.indexOf("  _applyRoomState(room, { reconnected = false } = {}) {");
  const applyEnd = clientSource.indexOf("\n  _self()", applyStart);
  const applySource = clientSource.slice(applyStart, applyEnd);
  const guardIndex = applySource.indexOf("this._syncGuestProgressIsolation(room, { reconnected })");
  const acceptIndex = applySource.indexOf("this.roomState = room; this.roomId = room.roomId");
  const expeditionIndex = applySource.indexOf("this._syncActiveExpeditionRun(room)");
  assert.ok(guardIndex >= 0 && guardIndex < acceptIndex && acceptIndex < expeditionIndex,
    "guest restore/capture completes before a room is accepted and before owner expedition state starts");
});
