import test from "node:test";
import assert from "node:assert/strict";
import {
  COOP_GIMMICK_TYPES,
  coopFloorTier,
  coopGimmickFor,
  coopParticipantTier,
  coopRewardTier,
  prepareCoopExpeditionV206,
  scaledCoopReward,
} from "../src/CoopGimmicks.js";

function expedition(floor = 1) {
  const rows = 13, cols = 13;
  const tiles = Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => x > 0 && y > 0 && x < cols - 1 && y < rows - 1 ? "." : "#"));
  return {
    id: `fixture-${floor}`, floor, rows, cols, tiles,
    start: { x: 1, y: 1 }, exit: { x: 11, y: 11 },
    objects: [{ id: "host-chest", type: "chest", x: 2, y: 2, resolved: false }],
    totalDiscoveries: 1,
  };
}

test("build206 floor and participant tiers match the approved boundaries", () => {
  assert.equal(coopFloorTier(1).id, "black-iron");
  assert.equal(coopFloorTier(99).id, "black-iron");
  assert.equal(coopFloorTier(100).id, "silver");
  assert.equal(coopFloorTier(499).id, "silver");
  assert.equal(coopFloorTier(500).id, "gold");
  assert.equal(coopFloorTier(999).id, "gold");
  assert.equal(coopFloorTier(1000).id, "abyss");
  assert.equal(coopParticipantTier(2).id, "silver");
  assert.equal(coopParticipantTier(3).multiplier, 1.5);
  assert.equal(coopParticipantTier(4).extraRolls, 1);
});

test("build206 deterministically distributes every optional gimmick type", () => {
  const found = new Set();
  for (let floor = 1; floor <= 400; floor++) found.add(coopGimmickFor({ leaderId: `leader-${floor % 17}`, floor }));
  assert.deepEqual([...found].sort(), [...COOP_GIMMICK_TYPES].sort());
  assert.equal(coopGimmickFor({ leaderId: "same", floor: 237 }), coopGimmickFor({ leaderId: "same", floor: 237 }));
});

test("build206 adds exactly one optional floor gimmick and preserves the host world", () => {
  for (const floor of [1, 100, 500, 1000]) {
    const source = expedition(floor);
    prepareCoopExpeditionV206(source, { leaderId: `leader-${floor}`, hostWorld: { openedChestIds: { [floor]: [`${floor}-0`] } } });
    assert.ok(COOP_GIMMICK_TYPES.includes(source.coop.gimmickType));
    assert.equal(source.objects.find(object => object.hostChestKey === `${floor}-0`)?.resolved, true);
    assert.equal(source.objects.some(object => object.x === source.exit.x && object.y === source.exit.y && object.id?.startsWith("coop-")), false);
    assert.equal(source.totalDiscoveries, 2);
    assert.equal(source.coop.floorTier, coopFloorTier(floor).id);
  }
});

test("build206 reward quality rises with floor and party size without raising the clear requirement", () => {
  const base = { gold: 1_000, crystals: 10, captureCrystals: 1 };
  const two = scaledCoopReward(base, { floor: 100, participants: 2, premium: true });
  const three = scaledCoopReward(base, { floor: 100, participants: 3, premium: true });
  const four = scaledCoopReward(base, { floor: 100, participants: 4, premium: true });
  assert.ok(two.gold < three.gold && three.gold < four.gold);
  assert.equal(two.coopExtraRolls, undefined);
  assert.equal(four.coopExtraRolls, 1);
  assert.equal(coopRewardTier(1000, 4).id, "abyss");
});
