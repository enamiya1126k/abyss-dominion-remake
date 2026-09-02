import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clientPath = resolve(root, "src/online/OnlinePartyClient.js");
const serverPath = resolve(root, "online-server/server.js");
const packagePath = resolve(root, "online-server/package.json");
const lockPath = resolve(root, "online-server/package-lock.json");
const clientSource = await readFile(clientPath, "utf8");
const serverSource = await readFile(serverPath, "utf8");
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
const packageLock = JSON.parse(await readFile(lockPath, "utf8"));
const {
  OnlinePartyController,
  onlineBattlePresentationDelay,
  onlineBattlePresentationSpeed,
} = await import("../src/online/OnlinePartyClient.js?build305-online-presentation-timers");

function withFakeTimers(run) {
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  const scheduled = [];
  let serial = 0;
  globalThis.setTimeout = (callback, delay) => {
    const timer = { id: ++serial, callback, delay, cleared: false };
    scheduled.push(timer);
    return timer;
  };
  globalThis.clearTimeout = timer => { if (timer) timer.cleared = true; };
  try { return run(scheduled); }
  finally {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
}

test("build305 keeps package, lock, client, and server protocol metadata at 1.16.0", () => {
  const clientProtocol = clientSource.match(/const ONLINE_PROTOCOL = "([^"]+)"/)?.[1];
  assert.equal(clientProtocol, "1.16.0");
  assert.equal(packageJson.version, clientProtocol);
  assert.equal(packageLock.version, clientProtocol);
  assert.equal(packageLock.packages?.[""]?.version, clientProtocol);
  assert.match(serverSource, /message\.protocol!=="1\.16\.0"/);
  assert.match(serverSource, /protocol:"1\.16\.0"/);
});

test("build305 battle presentation delay follows current speed and caps acceleration at x2", () => {
  assert.equal(onlineBattlePresentationSpeed(undefined), 1);
  assert.equal(onlineBattlePresentationSpeed(0), 1);
  assert.equal(onlineBattlePresentationSpeed(.5), .5);
  assert.equal(onlineBattlePresentationSpeed(2), 2);
  assert.equal(onlineBattlePresentationSpeed(4), 2);
  assert.equal(onlineBattlePresentationDelay(1_000, .5), 2_000);
  assert.equal(onlineBattlePresentationDelay(1_000, 1), 1_000);
  assert.equal(onlineBattlePresentationDelay(1_000, 2), 500);
  assert.equal(onlineBattlePresentationDelay(1_000, 4), 500);
});

test("build305 queues presentation timers at battle speed and cancels tracked nested work on the next round", () => withFakeTimers(scheduled => {
  const played = [];
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    presentationTimers: new Set(),
    presentationKoIds: { explore: new Set(), raid: new Set(), team: new Set() },
    roomState: { expedition: { battle: { speed: 2 } } },
    _playBattleEvent: (event, mode, speed) => played.push({ event, mode, speed }),
  });

  const firstEvents = [{ kind: "damage", id: "first" }, { kind: "heal", id: "second" }];
  controller._queueBattlePresentation("explore", firstEvents);
  assert.deepEqual(scheduled.slice(0, 2).map(timer => timer.delay), [40, 85]);
  scheduled[0].callback();
  assert.deepEqual(played, [{ event: firstEvents[0], mode: "explore", speed: 2 }]);
  assert.equal(controller.presentationTimers.has(scheduled[0]), false);

  let nestedRan = false;
  controller._schedulePresentation(() => {
    controller._schedulePresentation(() => { nestedRan = true; }, 800, 2);
  }, 1_000, 2);
  const outer = scheduled.at(-1);
  assert.equal(outer.delay, 500);
  outer.callback();
  const nested = scheduled.at(-1);
  assert.equal(nested.delay, 400);
  assert.equal(controller.presentationTimers.has(nested), true);

  const pendingBeforeNextRound = [...controller.presentationTimers];
  controller._queueBattlePresentation("explore", [{ kind: "guard", id: "next-round" }]);
  assert.ok(pendingBeforeNextRound.length >= 2);
  assert.ok(pendingBeforeNextRound.every(timer => timer.cleared), "every pending and nested timer must be cancelled");
  assert.equal(nestedRan, false);
  assert.equal(controller.presentationTimers.size, 1);
  assert.equal(scheduled.at(-1).delay, 40);
}));

test("build305 HP trails use the same presentation-speed scale", () => {
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    selfId: "AD-AAAA-BBBB",
    hpTrails: { explore: {}, raid: {}, team: {} },
    presentationKoIds: { explore: new Set(), raid: new Set(), team: new Set() },
  });
  const previous = {
    speed: 1,
    players: [{ playerId: "AD-AAAA-BBBB", hp: 100, maxHp: 100 }],
    enemies: [{ id: "enemy", hp: 100, maxHp: 100 }],
  };
  const next = {
    speed: 2,
    players: [{ playerId: "AD-AAAA-BBBB", hp: 80, maxHp: 100 }],
    enemies: [{ id: "enemy", hp: 50, maxHp: 100 }],
  };
  controller._captureHpTrails("explore", previous, next);
  assert.equal(controller.hpTrails.explore["ally:AD-AAAA-BBBB"].delay, 150);
  assert.equal(controller.hpTrails.explore["ally:AD-AAAA-BBBB"].duration, 360);
  assert.equal(controller.hpTrails.explore["enemy:enemy"].delay, 150);
  assert.equal(controller.hpTrails.explore["enemy:enemy"].duration, 360);
});

test("build305 battle event presentation contains no untracked setTimeout", () => {
  const start = clientSource.indexOf("  _playBattleEvent(");
  const end = clientSource.indexOf("\n  _sendPreset(", start);
  assert.ok(start >= 0 && end > start);
  const method = clientSource.slice(start, end);
  assert.doesNotMatch(method, /\bsetTimeout\s*\(/);
  assert.match(method, /_schedulePresentation/);
});
