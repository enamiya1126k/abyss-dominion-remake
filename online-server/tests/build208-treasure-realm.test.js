import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";
import { COOP_GIMMICK_TYPES } from "../src/CoopGimmicks.js";
import { prepareOnlineExpansionV208 } from "../src/OnlineExpansion208.js";

const LEGACY_RARE_TYPES = new Set([
  "rareGoldenMonster",
  "rareMerchant",
  "rarePortal",
  "rarePortalGuardian",
  "rarePortalChest",
  "rareReturnPortal",
]);

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function player(store, index = 1) {
  const conn = connection();
  const result = store.hello(conn, {
    friendId: `AD-CX28-AA${"BCDE"[index - 1]}A`,
    clientKey: `build208-client-key-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `共闘208-${index}`,
      speciesId: "slime",
      maxFloor: 500,
      battleStats: { hp: 10_000, mp: 500, atk: 2_500, matk: 2_000, def: 1_200, mdef: 1_200, spd: 100, crit: 5, evasion: 3 },
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session };
}

function assertSingleNormalMapGimmick(expedition) {
  assert.ok(COOP_GIMMICK_TYPES.includes(expedition.coop.gimmickType));
  assert.equal(expedition.coop.rare.kind, null);
  assert.equal(expedition.objects.some(object => object.rare || LEGACY_RARE_TYPES.has(object.type)), false);
  const optionalObjects = expedition.objects.filter(object => object.onlineAdded);
  assert.ok(optionalObjects.length > 0);
  assert.deepEqual([...new Set(optionalObjects.map(object => object.gimmickType))], [expedition.coop.gimmickType]);
  assert.equal([expedition.coop.gimmickType, expedition.coop.rare.kind].filter(Boolean).length, 1);
}

function injectLegacyRareObject(expedition, kind, type) {
  Object.assign(expedition.coop.rare, {
    kind,
    resolved: false,
    merchantClaims: {},
    portalEntered: false,
    guardianDefeated: false,
    realmActive: false,
    portalReturned: false,
  });
  const object = {
    id: `legacy-${type}`,
    type,
    ...expedition.start,
    resolved: false,
    hidden: false,
    persistent: true,
    rare: true,
  };
  expedition.objects.push(object);
  return object;
}

function startLegacyRareRequest(kind) {
  const store = new RoomStore({ randomRoomCode: () => "REAL28", random: () => .99 });
  const first = player(store, 1), second = player(store, 2);
  const created = store.createRoom(first.session);
  assert.equal(store.joinRoom(second.session, created.room.roomId).ok, true);
  assert.equal(store.setFloor(first.session, 499).ok, true);
  assert.equal(store.setReady(first.session, true).ok, true);
  assert.equal(store.setReady(second.session, true).ok, true);
  assert.equal(store.startExpedition(first.session, { hostWorld: { openedChestIds: {} }, forceRare: kind }).ok, true);
  const room = store.rooms.get(created.room.roomId);
  assertSingleNormalMapGimmick(room.expedition);
  return { store, room, players: [first, second] };
}

test("build208 keeps dungeon state, one normal-map gimmick, and persistent special chests", () => {
  const rows = 15, cols = 15;
  const expedition = {
    id: "build208-fixture", floor: 1001, rows, cols,
    tiles: Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => x > 0 && y > 0 && x < cols - 1 && y < rows - 1 ? "." : "#")),
    start: { x: 1, y: 1 }, exit: { x: 13, y: 13 },
    objects: [{ id: "host-chest", type: "chest", x: 2, y: 2, resolved: false }], totalDiscoveries: 1,
  };
  const originalTiles = expedition.tiles.map(row => [...row]);
  prepareOnlineExpansionV208(expedition, { ownerId: "AD-CX28-AABA", hostWorld: { openedChestIds: {} }, participants: 4, forceRare: "hiddenPortal" });
  assert.equal(expedition.coop.floorTier, "abyss");
  assert.deepEqual(expedition.tiles, originalTiles);
  assertSingleNormalMapGimmick(expedition);
  for (const chest of expedition.objects.filter(object => ["resonanceChest", "deluxeChest"].includes(object.type))) assert.equal(chest.persistent, true);
});

test("build208 legacy hidden-portal requests stay on the normal expedition map", () => {
  const { store, room, players } = startLegacyRareRequest("hiddenPortal");
  const mainExpedition = room.expedition;
  const originalTiles = structuredClone(mainExpedition.tiles);
  const originalObjects = mainExpedition.objects.map(object => ({ ...object }));
  const portal = injectLegacyRareObject(mainExpedition, "hiddenPortal", "rarePortal");
  originalObjects.push({ ...portal });
  players[0].session.dungeonPosition = { x: portal.x, y: portal.y, facing: "up" };
  store._syncCoopInteractions(room);
  const response = store.expeditionInteract(players[0].session, { action: "enterRarePortal", targetId: portal.id });
  assert.equal(response.ok, false);
  assert.equal(response.code, "FEATURE_INTEGRATED");
  assert.match(response.message, /共同探索へ統合/);
  assert.deepEqual(room.expedition.tiles, originalTiles);
  assert.equal(room.expedition.coop.rare.realmActive, false);
  assert.equal(room._rareMainWorld ?? null, null);
  assert.deepEqual(room.expedition.objects, originalObjects);
  assert.equal(room.phase, "expedition");
});

test("build208 legacy merchant fixtures remain individual, one-use support", () => {
  const { store, room, players } = startLegacyRareRequest("otherworldMerchant");
  const merchant = injectLegacyRareObject(room.expedition, "otherworldMerchant", "rareMerchant");
  players[0].session.dungeonPosition = { x: merchant.x, y: merchant.y, facing: "down" };
  store._syncCoopInteractions(room);
  assert.equal(store.rareMerchantClaim(players[0].session, { offer: "crystal" }).ok, true);
  const reward = players[0].session.pendingRewards.find(entry => entry.source?.kind === "rareMerchant");
  assert.deepEqual(reward.reward, { captureCrystals: 2, crystals: 3 });
  assert.equal(store.rareMerchantClaim(players[0].session, { offer: "rest" }).code, "ALREADY_CLAIMED");
  assert.equal(merchant.resolved, false);
  players[1].session.dungeonPosition = { x: merchant.x, y: merchant.y, facing: "down" };
  assert.equal(store.rareMerchantClaim(players[1].session, { offer: "rest" }).ok, true);
  assert.equal(merchant.resolved, true);
});

test("build208 no longer exports the dedicated rare-realm factory", async () => {
  const expansion = await import("../src/OnlineExpansion208.js");
  assert.equal("createRareTreasureRealm208" in expansion, false);
});
