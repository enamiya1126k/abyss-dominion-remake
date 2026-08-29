import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";
import { coopGimmickFor, resolveDualSwitch } from "../src/CoopGimmicks.js";

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function hello(store, index, resumeToken = undefined) {
  const conn = connection();
  const friendId = `AD-SWCH-TES${String.fromCharCode(64 + index)}`;
  const clientKey = `build248-switch-client-${index}`.padEnd(32, "x");
  const profile = {
    displayName: `スイッチ${index}`,
    speciesId: "slime",
    maxFloor: 30,
    currentHp: 1_000,
    currentMp: 100,
    battleStats: { hp: 1_000, mp: 100, atk: 180, matk: 160, def: 90, mdef: 90, spd: 70, crit: 5, evasion: 3 },
  };
  const result = store.hello(conn, { friendId, clientKey, resumeToken, profile });
  assert.equal(result.ok, true);
  return { conn, session: conn.session, result, profile, friendId, clientKey };
}

function adjacentFloorCell(expedition, object) {
  for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
    const candidate = { x: object.x + dx, y: object.y + dy, facing: "down" };
    if (expedition.tiles[candidate.y]?.[candidate.x] === ".") return candidate;
  }
  throw new Error(`switch ${object.id} has no adjacent floor cell`);
}

function startDualSwitchRoom() {
  let now = 248_000;
  const store = new RoomStore({
    now: () => now,
    random: () => .8,
    randomRoomCode: () => "SW248X",
    reconnectGraceMs: 5_000,
  });
  const owner = hello(store, 1);
  const guest = hello(store, 2);
  const created = store.createRoom(owner.session);
  const room = store.rooms.get(created.room.roomId);
  assert.equal(store.joinRoom(guest.session, room.roomId).ok, true);
  const floor = Array.from({ length: 30 }, (_, index) => index + 1)
    .find(value => value % 10 !== 0 && coopGimmickFor({ leaderId: owner.session.playerId, floor: value }) === "dualSwitch");
  assert.ok(floor);
  assert.equal(store.setFloor(owner.session, floor).ok, true);
  assert.equal(store.setReady(owner.session, true).ok, true);
  assert.equal(store.setReady(guest.session, true).ok, true);
  assert.equal(store.startExpedition(owner.session, { hostWorld: { openedChestIds: {} } }).ok, true);
  room.expedition.nextEncounter = 1_000_000;
  return { store, room, owner, guest, advance(ms = 250) { now += ms; } };
}

test("build248 dual switch resolves immediately from two authoritative positions and only once", () => {
  const { store, room, owner, guest } = startDualSwitchRoom();
  const expedition = room.expedition;
  const switches = expedition.objects.filter(object => object.type === "coopSwitch");
  owner.session.dungeonPosition = adjacentFloorCell(expedition, switches[0]);
  guest.session.dungeonPosition = adjacentFloorCell(expedition, switches[1]);

  assert.equal(store.moveExpedition(owner.session, { x: switches[0].x, y: switches[0].y }).ok, true);
  assert.equal(expedition.coop.switchUnlocked, false);
  assert.equal(store.moveExpedition(guest.session, { x: switches[1].x, y: switches[1].y }).ok, true);
  assert.equal(expedition.coop.switchUnlocked, true);
  assert.equal(expedition.objects.find(object => object.type === "resonanceVault").unlocked, true);
  assert.equal(expedition.objects.find(object => object.type === "coopElite").hidden, false);
  assert.deepEqual(expedition.coop.switchResolution.actorIds, [owner.session.playerId, guest.session.playerId]);

  store._updateCoopSwitch(room);
  store.advanceBattles();
  store.roomSnapshot(room);
  for (const player of [owner, guest]) {
    const events = player.conn.messages.filter(message => (
      message.type === "expeditionEvent" && message.event?.id === expedition.coop.switchResolution.id
    ));
    assert.equal(events.length, 1, "room refreshes and clock ticks must not replay the unlock event");
    assert.equal(expedition.contribution[player.session.playerId].switches, 1);
    assert.equal(expedition.contribution[player.session.playerId].gimmicks, 1);
  }
});

test("build248 a player already on a switch can reconnect before the other switch resolves", () => {
  const { store, room, owner, guest, advance } = startDualSwitchRoom();
  const expedition = room.expedition;
  const switches = expedition.objects.filter(object => object.type === "coopSwitch");
  owner.session.dungeonPosition = { x: switches[0].x, y: switches[0].y, facing: "down" };
  guest.session.dungeonPosition = { x: switches[1].x, y: switches[1].y, facing: "down" };
  const oldToken = guest.result.resumeToken;
  store.disconnect(guest.session, guest.conn);
  store._updateCoopSwitch(room);
  assert.equal(expedition.coop.switchUnlocked, false, "a disconnected avatar cannot satisfy a switch");

  const reconnected = connection();
  const resumed = store.hello(reconnected, {
    friendId: guest.friendId,
    clientKey: guest.clientKey,
    resumeToken: oldToken,
    profile: guest.profile,
  });
  assert.equal(resumed.ok, true);
  assert.equal(resumed.resumed, true);
  assert.deepEqual(reconnected.session.dungeonPosition, { x: switches[1].x, y: switches[1].y, facing: "down" });
  advance();
  store.advanceBattles();
  assert.equal(expedition.coop.switchUnlocked, true);
  assert.equal(expedition.coop.switchResolution.actorIds.includes(reconnected.session.playerId), true);
  store.advanceBattles();
  assert.equal(expedition.contribution[owner.session.playerId].switches, 1);
  assert.equal(expedition.contribution[reconnected.session.playerId].switches, 1);
});

test("build248 pure resolver rejects solo/dead/disconnected occupants and persists an idempotency receipt", () => {
  const expedition = {
    id: "switch-pure-248",
    coop: { enabled: true, switchUnlocked: false, switchHoldStartedAt: 0 },
    objects: [
      { id: "coop-switch-a", type: "coopSwitch", x: 2, y: 3, active: false, progress: 0 },
      { id: "coop-switch-b", type: "coopSwitch", x: 9, y: 7, active: false, progress: 0 },
      { id: "coop-vault", type: "resonanceVault", unlocked: false },
      { id: "coop-elite", type: "coopElite", hidden: true },
    ],
  };
  const left = { playerId: "LEFT", connected: true, coopVitals: { hp: 10 }, dungeonPosition: { x: 2, y: 3 } };
  const right = { playerId: "RIGHT", connected: false, coopVitals: { hp: 10 }, dungeonPosition: { x: 9, y: 7 } };
  assert.equal(resolveDualSwitch(expedition, [left, right], { now: 10 }).changed, false);
  right.connected = true;
  right.coopVitals.hp = 0;
  assert.equal(resolveDualSwitch(expedition, [left, right], { now: 11 }).changed, false);
  right.coopVitals.hp = 10;
  const first = resolveDualSwitch(expedition, [left, right], { now: 12 });
  assert.equal(first.changed, true);
  const receipt = structuredClone(expedition.coop.switchResolution);
  const replay = resolveDualSwitch(expedition, [left, right], { now: 99 });
  assert.equal(replay.changed, false);
  assert.deepEqual(expedition.coop.switchResolution, receipt);
});
