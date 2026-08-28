import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { RoomStore } from "../src/RoomStore.js";
import { chooseRareEvent, prepareOnlineExpansionV207, rareEventChance } from "../src/OnlineExpansion207.js";
import * as expansion208 from "../src/OnlineExpansion208.js";
import { ResonanceMazeCoordinator, resonanceSnapshot } from "../src/ResonanceMazeCoordinator.js";

const INTEGRATED_MESSAGE = /共同探索へ統合/;
const LEGACY_RARE_TYPES = new Set([
  "rareGoldenMonster",
  "rareMerchant",
  "rarePortal",
  "rarePortalGuardian",
  "rarePortalChest",
  "rareReturnPortal",
]);

function fixture() {
  const rows = 15, cols = 15;
  return {
    id: "build245-legacy-cleanup",
    floor: 321,
    rows,
    cols,
    tiles: Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => (
      x > 0 && y > 0 && x < cols - 1 && y < rows - 1 ? "." : "#"
    ))),
    start: { x: 1, y: 1 },
    exit: { x: 13, y: 13 },
    objects: [{ id: "normal-chest", type: "chest", x: 2, y: 2, resolved: false }],
    decorations: [{ id: "normal-bones", type: "bones", x: 3, y: 2 }],
    totalDiscoveries: 1,
  };
}

test("build245 forced legacy rare options cannot generate or replace a normal floor", () => {
  assert.equal(rareEventChance({ floor: 1001, participants: 4, resonance: 5 }), 0);
  assert.equal(chooseRareEvent({ forceRare: "hiddenPortal", participants: 4 }), null);
  for (const forceRare of ["goldenMonster", "otherworldMerchant", "hiddenPortal"]) {
    const expedition = fixture();
    const tiles = expedition.tiles.map(row => [...row]);
    const ordinaryObjects = expedition.objects.map(({ id, type, x, y, resolved }) => ({ id, type, x, y, resolved }));
    prepareOnlineExpansionV207(expedition, {
      ownerId: "AD-LG45-AABA",
      hostWorld: { openedChestIds: {} },
      participants: 2,
      forceRare,
    });
    assert.deepEqual(expedition.tiles, tiles);
    assert.deepEqual(
      expedition.objects.filter(object => !object.onlineAdded).map(({ id, type, x, y, resolved }) => ({ id, type, x, y, resolved })),
      ordinaryObjects,
    );
    assert.equal(expedition.objects.some(object => object.rare || LEGACY_RARE_TYPES.has(object.type)), false);
    assert.deepEqual(expedition.coop.rare, {
      kind: null,
      resolved: true,
      merchantClaims: {},
      portalEntered: false,
      guardianDefeated: false,
      realmActive: false,
      portalReturned: false,
    });
  }
});

test("build245 retired rare-realm factory and dedicated maze implementation are absent", async () => {
  assert.equal("createRareTreasureRealm208" in expansion208, false);
  const source = await readFile(new URL("../src/ResonanceMazeCoordinator.js", import.meta.url), "utf8");
  for (const retiredToken of ["MAZE_TILES", "deadlineAt", "7*60_000", "rare-realm-guardian", "resonanceEnded"]) {
    assert.equal(source.includes(retiredToken), false, `${retiredToken} must stay retired`);
  }
});

test("build245 coordinator compatibility adapter cannot enter a dedicated mode or queue rewards", () => {
  let broadcasts = 0, rewards = 0;
  const coordinator = new ResonanceMazeCoordinator({
    broadcast: () => { broadcasts++; },
    queueReward: () => { rewards++; },
  });
  const expedition = fixture();
  const room = { phase: "expedition", expedition, resonance: null };
  const before = structuredClone(expedition);
  for (const response of [
    coordinator.start(room, { playerId: "owner" }),
    coordinator.move(room, { playerId: "owner" }, { direction: "right" }),
    coordinator.action(room, { playerId: "owner" }, { kind: "interact" }),
  ]) {
    assert.equal(response.ok, false);
    assert.equal(response.code, "RESONANCE_INTEGRATED");
    assert.match(response.message, INTEGRATED_MESSAGE);
  }
  coordinator.playerLeft(room, "owner");
  coordinator.advance(room);
  coordinator.tick(room);
  assert.equal(room.phase, "expedition");
  assert.equal(room.resonance, null);
  assert.deepEqual(room.expedition, before);
  assert.equal(resonanceSnapshot({ legacy: true }), null);
  assert.equal(broadcasts, 0);
  assert.equal(rewards, 0);

  const staleExpedition = fixture();
  const staleRoom = { phase: "resonance", expedition: staleExpedition, resonance: { deadlineAt: 1 } };
  assert.equal(coordinator.move(staleRoom).code, "RESONANCE_INTEGRATED");
  assert.equal(staleRoom.phase, "expedition");
  assert.equal(staleRoom.resonance, null);
  assert.equal(staleRoom.expedition, staleExpedition);
});

test("build245 RoomStore legacy resonance commands keep the current normal expedition intact", () => {
  const store = new RoomStore();
  const room = { phase: "expedition", expedition: fixture(), resonance: null };
  const before = structuredClone(room);
  for (const response of [store.startResonance(), store.moveResonance(), store.resonanceAction()]) {
    assert.equal(response.ok, false);
    assert.equal(response.code, "RESONANCE_INTEGRATED");
    assert.match(response.message, INTEGRATED_MESSAGE);
  }
  assert.deepEqual(room, before);
});
