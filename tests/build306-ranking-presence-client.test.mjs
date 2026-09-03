import assert from "node:assert/strict";
import test from "node:test";

import {
  OnlinePartyController,
  normalizePowerRankingProfile,
  normalizePowerRankingState,
} from "../src/online/OnlinePartyClient.js?build306-ranking-presence-client";

const PLAYER_A = "AD-ABCD-EFGH";
const PLAYER_B = "AD-JKLM-NPQR";
const PRESENCE_CAPABILITY = "powerRankingPresenceV1";

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    const listeners = this.listeners.get(type);
    listeners?.delete(listener);
    if (!listeners?.size) this.listeners.delete(type);
  }

  dispatch(type) {
    for (const listener of [...(this.listeners.get(type) ?? [])]) {
      listener({ type, target: this });
    }
  }
}

function replaceGlobal(name, value) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  return () => {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  };
}

test("Build306 ranking normalizers preserve presence metadata and legacy updatedAt fallback", () => {
  const state = normalizePowerRankingState({
    serverNow: 500_000,
    presenceOnlineMs: 90_000,
    total: 2,
    entries: [
      { rank: 2, playerId: PLAYER_A, displayName: "旧DTO", power: 100, maxFloor: 10, updatedAt: 410_000 },
      { rank: 1, playerId: PLAYER_B, displayName: "接続中", power: 200, maxFloor: 20, updatedAt: 420_000, online: true, lastActiveAt: 499_000 },
    ],
    self: { rank: 2, playerId: PLAYER_A, displayName: "旧DTO", power: 100, maxFloor: 10, updatedAt: 410_000 },
  });

  assert.equal(state.serverNow, 500_000);
  assert.equal(state.presenceOnlineMs, 90_000);
  assert.deepEqual(state.entries.map(entry => entry.playerId), [PLAYER_B, PLAYER_A]);
  assert.deepEqual(
    { online: state.entries[0].online, lastActiveAt: state.entries[0].lastActiveAt },
    { online: true, lastActiveAt: 499_000 },
  );
  assert.deepEqual(
    { online: state.entries[1].online, lastActiveAt: state.entries[1].lastActiveAt },
    { online: false, lastActiveAt: 410_000 },
    "an old list DTO without lastActiveAt must retain updatedAt as its last-seen timestamp",
  );
  assert.equal(state.self.lastActiveAt, 410_000);

  const currentProfile = normalizePowerRankingProfile({
    playerId: PLAYER_B,
    displayName: "接続中",
    power: 200,
    maxFloor: 20,
    updatedAt: 420_000,
    online: true,
    lastActiveAt: 499_000,
    serverNow: 500_000,
    presenceOnlineMs: 90_000,
    party: [],
  });
  assert.deepEqual(
    {
      online: currentProfile.online,
      lastActiveAt: currentProfile.lastActiveAt,
      serverNow: currentProfile.serverNow,
      presenceOnlineMs: currentProfile.presenceOnlineMs,
    },
    { online: true, lastActiveAt: 499_000, serverNow: 500_000, presenceOnlineMs: 90_000 },
  );

  const legacyProfile = normalizePowerRankingProfile({
    playerId: PLAYER_A,
    displayName: "旧DTO",
    power: 100,
    maxFloor: 10,
    updatedAt: 410_000,
    party: [],
  });
  assert.equal(legacyProfile.online, false);
  assert.equal(legacyProfile.lastActiveAt, 410_000, "an old profile DTO must also fall back to updatedAt");
});

test("Build306 visible clients send immediately and every 30 seconds, then stop while hidden or offline", t => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 100_000 });
  const fakeDocument = new FakeEventTarget();
  const fakeWindow = new FakeEventTarget();
  fakeDocument.visibilityState = "visible";
  const restoreDocument = replaceGlobal("document", fakeDocument);
  const restoreWindow = replaceGlobal("window", fakeWindow);
  const sent = [];
  let resumeChecks = 0;
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    connectionReady: true,
    capabilities: new Set([PRESENCE_CAPABILITY]),
    mounted: false,
    backgroundActive: true,
    backgroundBound: [],
    powerRankingPresenceTimer: null,
    lastPowerRankingPresenceAt: 0,
    _ensureConnectionAfterResume() { resumeChecks += 1; },
    _send(type, payload = {}) { sent.push({ type, ...payload, at: Date.now() }); return true; },
  });

  try {
    controller._bindBackgroundLifecycle();
    controller._startPowerRankingPresenceLoop();
    assert.deepEqual(sent, [{ type: "powerRankingPresence", at: 100_000 }], "visible startup publishes immediately");

    t.mock.timers.tick(29_999);
    assert.equal(sent.length, 1);
    t.mock.timers.tick(1);
    assert.deepEqual(sent.at(-1), { type: "powerRankingPresence", at: 130_000 });
    assert.notEqual(controller.powerRankingPresenceTimer, null, "the heartbeat reschedules itself");

    fakeDocument.visibilityState = "hidden";
    fakeDocument.dispatch("visibilitychange");
    assert.equal(controller.powerRankingPresenceTimer, null, "hiding the document cancels the pending heartbeat");
    t.mock.timers.tick(60_000);
    assert.equal(sent.length, 2, "hidden clients cannot emit another heartbeat");

    fakeDocument.visibilityState = "visible";
    fakeDocument.dispatch("visibilitychange");
    assert.equal(resumeChecks, 1);
    assert.deepEqual(sent.at(-1), { type: "powerRankingPresence", at: 190_000 }, "becoming visible publishes immediately again");
    assert.notEqual(controller.powerRankingPresenceTimer, null);

    fakeWindow.dispatch("offline");
    assert.equal(controller.powerRankingPresenceTimer, null, "the offline event cancels the pending heartbeat");
    t.mock.timers.tick(60_000);
    assert.equal(sent.length, 3, "offline clients cannot emit another heartbeat");
  } finally {
    controller._removeBackgroundLifecycle();
    controller._stopPowerRankingPresenceLoop();
    restoreWindow();
    restoreDocument();
    t.mock.timers.reset();
  }
});
