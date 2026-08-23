import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";
import { coopRewardTier } from "../src/CoopGimmicks.js";
import { prepareOnlineExpansionV208 } from "../src/OnlineExpansion208.js";

function fixture(floor = 1) {
  const rows = 15, cols = 15;
  return {
    id: `build209-fixture-${floor}`, floor, rows, cols,
    tiles: Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => x > 0 && y > 0 && x < cols - 1 && y < rows - 1 ? "." : "#")),
    start: { x: 1, y: 1 }, exit: { x: 13, y: 13 },
    objects: [{ id: "host-chest", type: "chest", x: 2, y: 2, resolved: false }],
    totalDiscoveries: 1,
  };
}

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function hello(store, index) {
  const conn = connection();
  const result = store.hello(conn, {
    friendId: `AD-DY29-AA${"BCDE"[index - 1]}A`,
    clientKey: `build209-client-key-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `共闘209-${index}`,
      speciesId: "slime",
      maxFloor: 1200,
      battleStats: { hp: 10_000, mp: 500, atk: 2_500, matk: 2_000, def: 1_200, mdef: 1_200, spd: 100, crit: 5, evasion: 3 },
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session };
}

function startRoom(count = 2, { forceRare = null } = {}) {
  const store = new RoomStore({ randomRoomCode: () => "SAFE29", random: () => .99 });
  const players = Array.from({ length: count }, (_, index) => hello(store, index + 1));
  const created = store.createRoom(players[0].session);
  for (const player of players.slice(1)) assert.equal(store.joinRoom(player.session, created.room.roomId).ok, true);
  for (const player of players) assert.equal(store.setReady(player.session, true).ok, true);
  assert.equal(store.startExpedition(players[0].session, { hostWorld: { openedChestIds: {} }, forceRare }).ok, true);
  return { store, players, room: store.rooms.get(created.room.roomId) };
}

test("build209 fixes special chest appearance to the higher floor or starting-party tier", () => {
  const fourAtFloorOne = fixture(1);
  prepareOnlineExpansionV208(fourAtFloorOne, { ownerId: "AD-DY29-AABA", hostWorld: { openedChestIds: {} }, participants: 4, forceRare: null });
  assert.equal(fourAtFloorOne.coop.floorTier, "black-iron");
  assert.equal(fourAtFloorOne.coop.participantTier, "abyss");
  assert.equal(fourAtFloorOne.coop.rewardTier, "abyss");
  assert.equal(fourAtFloorOne.coop.rewardTierLabel, "深淵級");
  assert.equal(fourAtFloorOne.coop.partySize, 4);
  assert.ok(fourAtFloorOne.objects.filter(object => object.id.startsWith("coop-")).every(object => object.rewardTier === "abyss"));

  const soloAtFloorFiveHundred = fixture(500);
  prepareOnlineExpansionV208(soloAtFloorFiveHundred, { ownerId: "AD-DY29-AABA", hostWorld: { openedChestIds: {} }, participants: 1, forceRare: null });
  assert.equal(soloAtFloorFiveHundred.coop.rewardTier, "gold");
  assert.equal(coopRewardTier(100, 3).id, "gold");
});

test("build209 keeps starting-party quality after a member disconnects", () => {
  const { store, players, room } = startRoom(4);
  assert.equal(room.expedition.coop.partySize, 4);
  assert.equal(room.expedition.coop.rewardTier, "abyss");
  store.disconnect(players[3].session);
  store._syncCoopInteractions(room);
  assert.equal(players[3].session.connected, false);
  assert.equal(room.expedition.coop.partySize, 4);
  assert.equal(room.expedition.coop.rewardTier, "abyss");
});

test("build209 counts an AI proxy inside the visible 3x3 resonance guide", () => {
  const { store, players, room } = startRoom(2);
  for (const object of room.expedition.objects) if (object.type !== "chest") object.resolved = true;
  const chest = { id: "build209-resonance", type: "resonanceChest", x: 6, y: 6, resolved: false, hidden: false, persistent: true, rewardTier: room.expedition.coop.rewardTier };
  room.expedition.objects.push(chest);
  players[0].session.dungeonPosition = { x: 6, y: 6, facing: "down" };
  players[1].session.dungeonPosition = { x: 7, y: 6, facing: "left" };
  players[1].session.connected = false;
  store._syncCoopInteractions(room);
  assert.equal(chest.nearbyCount, 2);
  assert.equal(room.expedition.interactions[players[0].session.playerId].action, "openResonanceChest");
  assert.match(room.expedition.interactions[players[0].session.playerId].hint, /開封可能/);
});

test("build209 exposes only the nearest interaction and keeps a tied target stable", () => {
  const { store, players, room } = startRoom(1, { forceRare: "otherworldMerchant" });
  const member = players[0].session, merchant = room.expedition.objects.find(object => object.type === "rareMerchant");
  for (const object of room.expedition.objects) if (object !== merchant) object.resolved = true;
  const chest = { id: "build209-near-chest", type: "resonanceChest", x: 5, y: 4, resolved: false, hidden: false, persistent: true, rewardTier: "black-iron" };
  room.expedition.objects.push(chest);
  member.dungeonPosition = { x: 5, y: 5, facing: "up" };
  Object.assign(merchant, { x: 6, y: 5, resolved: false, hidden: false });
  room.expedition.interactions = { [member.playerId]: { action: "browseRareMerchant", targetId: merchant.id } };
  store._syncCoopInteractions(room);
  assert.equal(room.expedition.interactions[member.playerId].targetId, merchant.id, "a tied prior target should remain stable");

  Object.assign(chest, { x: 5, y: 5 });
  store._syncCoopInteractions(room);
  assert.equal(room.expedition.interactions[member.playerId].targetId, chest.id, "a closer target must replace the prior target");
});
