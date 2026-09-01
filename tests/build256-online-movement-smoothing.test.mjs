import assert from "node:assert/strict";
import test from "node:test";

import {
  ONLINE_EXPEDITION_MOVE_INTERVAL_MS,
  ONLINE_MOTION_BASE_SPEED,
  onlineMotionSpeed,
  reconcileOnlineMotion,
} from "../src/online/OnlineMovement.js?build256-online-movement";
import { OnlinePartyController } from "../src/online/OnlinePartyClient.js?build256-online-movement";

function entity(source = {}) {
  return { x: 0, y: 0, rx: 0, ry: 0, path: [], p: 0, ...source };
}

test("build256 queues consecutive authoritative steps instead of replacing active interpolation", () => {
  const moving = entity({ rx: .4, path: [{ x: 1, y: 0 }], p: .4 });

  assert.equal(reconcileOnlineMotion(moving, { x: 2, y: 0 }), "queued");
  assert.deepEqual(moving.path, [{ x: 1, y: 0 }, { x: 2, y: 0 }]);
  assert.equal(moving.rx, .4);
  assert.equal(moving.p, .4, "an in-flight animation is not restarted by the next network step");
  assert.equal(reconcileOnlineMotion(moving, { x: 1, y: 0 }), "unchanged", "duplicate acknowledgements do not create a backwards hop");
});

test("build256 compacts a delayed queue from the rendered position and only snaps true discontinuities", () => {
  const delayed = entity({ rx: .65, path: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }], p: .65 });
  assert.equal(reconcileOnlineMotion(delayed, { x: 5, y: 0 }), "compacted");
  assert.equal(delayed.x, .65);
  assert.equal(delayed.rx, .65);
  assert.deepEqual(delayed.path, [{ x: 5, y: 0 }]);
  assert.equal(delayed.p, 0);

  assert.equal(reconcileOnlineMotion(delayed, { x: 20, y: 20 }), "snapped");
  assert.deepEqual({ x: delayed.x, y: delayed.y, rx: delayed.rx, ry: delayed.ry, path: delayed.path }, { x: 20, y: 20, rx: 20, ry: 20, path: [] });
});

test("build256 movement cadence and catch-up speed stay bounded", () => {
  assert.equal(ONLINE_EXPEDITION_MOVE_INTERVAL_MS, 140);
  assert.equal(ONLINE_MOTION_BASE_SPEED, 1000 / 140);
  assert.equal(onlineMotionSpeed(entity({ path: [{ x: 1, y: 0 }] })), ONLINE_MOTION_BASE_SPEED);
  assert.ok(onlineMotionSpeed(entity({ path: [{}, {}, {}] })) > ONLINE_MOTION_BASE_SPEED);
  assert.equal(onlineMotionSpeed(entity({ path: Array.from({ length: 20 }, () => ({})) })), ONLINE_MOTION_BASE_SPEED * 1.42);
});

test("build256 coalesces duplicate movement and room snapshots into one canvas update", () => {
  const originalRaf = globalThis.requestAnimationFrame, originalCancel = globalThis.cancelAnimationFrame;
  const frames = [], cancelled = [], updates = [];
  globalThis.requestAnimationFrame = callback => { frames.push(callback); return frames.length; };
  globalThis.cancelAnimationFrame = id => cancelled.push(id);
  try {
    const controller = Object.create(OnlinePartyController.prototype);
    Object.assign(controller, {
      exploreCanvasMounted: true,
      exploreCanvasUpdateFrame: null,
      pendingExploreCanvasUpdate: null,
      roomState: { roomId: "SMOOTH", members: [] },
      selfId: "AD-SMOOTH-01",
      onExploreCanvasUpdate: (...args) => updates.push(args),
      onExploreCanvasUnmount: () => {},
    });

    controller._queueExploreCanvasUpdate({ pings: ["first"] });
    controller._queueExploreCanvasUpdate({ chatBubbles: ["latest"] });
    assert.equal(frames.length, 1);
    frames[0](16);
    assert.equal(updates.length, 1);
    assert.deepEqual(updates[0][2], { pings: ["first"], chatBubbles: ["latest"] });

    controller._queueExploreCanvasUpdate();
    controller._unmountExploreCanvas();
    assert.deepEqual(cancelled, [2]);
    assert.equal(controller.pendingExploreCanvasUpdate, null);
  } finally {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCancel;
  }
});
