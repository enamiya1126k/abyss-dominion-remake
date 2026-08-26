import test from "node:test";
import assert from "node:assert/strict";
import { createSoloStyleDungeon } from "../src/OfflineDungeonRules.js";

const CARDINALS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const pointKey = point => `${point.x},${point.y}`;

function floorRandom(seed, trace = []) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    const roll = value / 4294967296;
    trace.push(roll);
    return roll;
  };
}

function secretPlan(run, floor) {
  const safeFloor = Math.max(1, Math.min(10_000, Math.floor(Number(floor) || 1)));
  let value = (Math.max(1, Math.min(0x7fffffff, Math.floor(Number(run.seed) || 1))) ^ (safeFloor * 2654435761)) >>> 0;
  value ^= value >>> 16; value = Math.imul(value, 2246822507); value ^= value >>> 13; value = Math.imul(value, 3266489909); value ^= value >>> 16;
  value >>>= 0;
  const random = () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
  return { id: `${run.id}:${safeFloor}`, appears: safeFloor % 10 !== 0 && random() < .09, positionRoll: random() };
}

function appearingRun(floor) {
  for (let seed = 1; seed < 10_000; seed++) {
    const run = { id: "host-secret-run", seed };
    if (secretPlan(run, floor).appears) return run;
  }
  throw new Error("expected deterministic secret-room seed");
}

function createArgs(random, extra = {}) {
  return { roomId: "ROOM", floor: 7, runId: "floor-run", now: 1234, random, explorePickupDone: true, ...extra };
}

test("build225 secret-room plan matches offline planning without advancing floor RNG", () => {
  const run = appearingRun(7), plan = secretPlan(run, 7), baselineTrace = [], secretTrace = [];
  const baseline = createSoloStyleDungeon(createArgs(floorRandom(0x225, baselineTrace)));
  const dungeon = createSoloStyleDungeon(createArgs(floorRandom(0x225, secretTrace), { secretRoomRun: run }));
  const secret = dungeon.objects.find(object => object.type === "secretRoom");
  assert.ok(secret);
  assert.equal(secret.id, plan.id);
  assert.equal(secret.roomId, plan.id);
  assert.equal(secret.resolved, false);
  assert.equal(secret.persistent, true);
  assert.equal(CARDINALS.some(([dx, dy]) => dungeon.tiles[secret.y + dy]?.[secret.x + dx] === "#"), true);
  assert.equal(dungeon.objects.filter(object => object.x === secret.x && object.y === secret.y).length, 1);
  assert.deepEqual(secretTrace, baselineTrace, "secret planning uses its independent run seed");
  assert.equal(dungeon.nextEncounter, baseline.nextEncounter);
  assert.deepEqual(dungeon.decorations.map(({ id, type, phase, scale }) => ({ id, type, phase, scale })), baseline.decorations.map(({ id, type, phase, scale }) => ({ id, type, phase, scale })));
  assert.deepEqual(dungeon.objects.filter(object => object.type !== "secretRoom"), baseline.objects);
});

test("build225 secret rooms require run data and never appear on boss floors", () => {
  const ordinary = createSoloStyleDungeon(createArgs(floorRandom(17)));
  const boss = createSoloStyleDungeon(createArgs(floorRandom(17), { floor: 10, secretRoomRun: appearingRun(7) }));
  assert.equal(ordinary.objects.some(object => object.type === "secretRoom"), false);
  assert.equal(boss.objects.some(object => object.type === "secretRoom"), false);
});

test("build225 unfinished floor-one guide appends the nearest crystal without consuming RNG", () => {
  const completeTrace = [], guideTrace = [];
  const complete = createSoloStyleDungeon(createArgs(floorRandom(0x1225, completeTrace), { floor: 1, explorePickupDone: true }));
  const guided = createSoloStyleDungeon(createArgs(floorRandom(0x1225, guideTrace), { floor: 1, explorePickupDone: false }));
  const pickup = guided.decorations.at(-1);
  assert.deepEqual(guideTrace, completeTrace);
  assert.deepEqual(guided.decorations.slice(0, -1), complete.decorations);
  assert.deepEqual(pickup, { id: "1-guide-first-pickup", x: pickup.x, y: pickup.y, type: "crystal", rotation: 0, scale: 1.15, phase: 199, used: false, destroyed: false, tutorialGuide: "firstPickup" });
  const occupied = new Set([...complete.objects, ...complete.decorations].map(pointKey)), available = [];
  for (let y = 1; y < complete.rows - 1; y++) for (let x = 1; x < complete.cols - 1; x++) if (complete.tiles[y][x] === "." && !occupied.has(`${x},${y}`) && (x !== complete.start.x || y !== complete.start.y)) available.push({ x, y, distance: Math.abs(x - complete.start.x) + Math.abs(y - complete.start.y) });
  available.sort((left, right) => left.distance - right.distance);
  assert.deepEqual({ x: pickup.x, y: pickup.y }, { x: available[0].x, y: available[0].y });
});
