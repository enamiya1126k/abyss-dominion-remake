import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";
import { createRareTreasureRealm208, prepareOnlineExpansionV208 } from "../src/OnlineExpansion208.js";

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

function startForcedRare(kind) {
  const store = new RoomStore({ randomRoomCode: () => "REAL28", random: () => .99 });
  const first = player(store, 1), second = player(store, 2);
  const created = store.createRoom(first.session);
  assert.equal(store.joinRoom(second.session, created.room.roomId).ok, true);
  assert.equal(store.setReady(first.session, true).ok, true);
  assert.equal(store.setReady(second.session, true).ok, true);
  assert.equal(store.startExpedition(first.session, { hostWorld: { openedChestIds: {} }, forceRare: kind }).ok, true);
  return { store, room: store.rooms.get(created.room.roomId), players: [first, second] };
}

test("build208 special assets keep dungeon state and four persistent chest tiers", () => {
  const rows = 15, cols = 15;
  const expedition = {
    id: "build208-fixture", floor: 1000, rows, cols,
    tiles: Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => x > 0 && y > 0 && x < cols - 1 && y < rows - 1 ? "." : "#")),
    start: { x: 1, y: 1 }, exit: { x: 13, y: 13 },
    objects: [{ id: "host-chest", type: "chest", x: 2, y: 2, resolved: false }], totalDiscoveries: 1,
  };
  prepareOnlineExpansionV208(expedition, { ownerId: "AD-CX28-AABA", hostWorld: { openedChestIds: {} }, participants: 4, forceRare: "hiddenPortal" });
  assert.equal(expedition.coop.floorTier, "abyss");
  assert.equal(expedition.objects.some(object => object.type === "rarePortalGuardian"), false);
  assert.equal(expedition.objects.some(object => object.type === "rarePortalChest"), false);
  const portal = expedition.objects.find(object => object.type === "rarePortal");
  assert.equal(portal.wallSide, "top");
  assert.equal(expedition.tiles[portal.y - 1][portal.x], "#");
  for (const chest of expedition.objects.filter(object => ["resonanceChest", "deluxeChest"].includes(object.type))) assert.equal(chest.persistent, true);
});

test("build208 hidden portal enters a dedicated realm, unlocks its chest, and restores the host dungeon", () => {
  const { store, room, players } = startForcedRare("hiddenPortal");
  const mainExpedition = room.expedition;
  const originalTiles = mainExpedition.tiles.map(row => [...row]);
  const portal = mainExpedition.objects.find(object => object.type === "rarePortal");
  players[0].session.dungeonPosition = { x: portal.x, y: portal.y, facing: "up" };
  store._syncCoopInteractions(room);
  assert.equal(store.expeditionInteract(players[0].session, { action: "enterRarePortal", targetId: portal.id }).ok, true);
  assert.equal(room.expedition.coop.rare.realmActive, true);
  assert.ok(room._rareMainWorld);
  assert.notDeepEqual(room.expedition.tiles, originalTiles);
  assert.deepEqual(room.expedition.objects.map(object => object.type), ["rarePortalGuardian", "rarePortalChest", "rareReturnPortal"]);

  const guardian = room.expedition.objects.find(object => object.type === "rarePortalGuardian");
  players[0].session.dungeonPosition = { x: guardian.x, y: guardian.y, facing: "up" };
  store._syncCoopInteractions(room);
  assert.equal(store.expeditionInteract(players[0].session, { action: "challengeRareGuardian", targetId: guardian.id }).ok, true);
  const battle = room.expedition.battle;
  assert.equal(battle.rareKind, "portalGuardian");
  battle.enemies.forEach(enemy => { enemy.hp = 0; });
  store._finishBattleVictory(room, battle);
  const chest = room.expedition.objects.find(object => object.type === "rarePortalChest");
  assert.equal(chest.hidden, false);
  assert.equal(chest.persistent, true);

  players[0].session.dungeonPosition = { x: chest.x, y: chest.y, facing: "up" };
  store._syncCoopInteractions(room);
  assert.equal(store.expeditionInteract(players[0].session, { action: "openRarePortalChest", targetId: chest.id }).ok, true);
  assert.equal(chest.resolved, true);
  const returnPortal = room.expedition.objects.find(object => object.type === "rareReturnPortal");
  assert.equal(returnPortal.hidden, false);

  players[0].session.dungeonPosition = { x: returnPortal.x, y: returnPortal.y, facing: "down" };
  store._syncCoopInteractions(room);
  assert.equal(store.expeditionInteract(players[0].session, { action: "leaveRareRealm", targetId: returnPortal.id }).ok, true);
  assert.deepEqual(room.expedition.tiles, originalTiles);
  assert.equal(room.expedition.coop.rare.realmActive, false);
  assert.equal(room._rareMainWorld, null);
  const restoredPortal = room.expedition.objects.find(object => object.type === "rarePortal");
  assert.equal(restoredPortal.resolved, true);
  assert.equal(restoredPortal.persistent, true);
});

test("build208 free merchant support is individual, one-use, and never opens a separate route", () => {
  const { store, room, players } = startForcedRare("otherworldMerchant");
  const merchant = room.expedition.objects.find(object => object.type === "rareMerchant");
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

test("build208 realm factory keeps guardian, chest and return portal in a deterministic order", () => {
  const realm = createRareTreasureRealm208({ floor: 777 });
  assert.equal(realm.floor, 777);
  assert.equal(realm.tiles[0].every(tile => tile === "#"), true);
  assert.equal(realm.objects[0].type, "rarePortalGuardian");
  assert.equal(realm.objects[1].hidden, true);
  assert.equal(realm.objects[2].type, "rareReturnPortal");
  assert.equal(realm.objects[2].hidden, true);
});
