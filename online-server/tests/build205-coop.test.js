import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";
import { coopGimmickFor } from "../src/CoopGimmicks.js";

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function hello(store, index, profile = {}) {
  const conn = connection();
  const friendId = `AD-BZ25-AA${"BCDE"[index - 1]}A`;
  const result = store.hello(conn, {
    friendId,
    clientKey: `build205-client-key-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `共闘${index}`,
      speciesId: "slime",
      maxFloor: 21,
      battleStats: { hp: 1_000, mp: 100, atk: 180, matk: 160, def: 90, mdef: 90, spd: 70, crit: 5, evasion: 3 },
      ...profile,
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session };
}

function readyRoom(store, count = 2) {
  const players = Array.from({ length: count }, (_, index) => hello(store, index + 1));
  const created = store.createRoom(players[0].session);
  for (const player of players.slice(1)) assert.equal(store.joinRoom(player.session, created.room.roomId).ok, true);
  for (const player of players) assert.equal(store.setReady(player.session, true).ok, true);
  return { players, room: store.rooms.get(created.room.roomId) };
}

test("build205 first raid is fixed at 50,000 HP and keeps the authored juvenile", () => {
  const store = new RoomStore({ randomRoomCode: () => "R205AA", random: () => .2 });
  const { players, room } = readyRoom(store, 1);
  const result = store.startRaid(players[0].session);
  assert.equal(result.ok, true);
  assert.equal(room.raid.boss.maxHp, 50_000);
  assert.equal(room.raid.boss.hp, 50_000);
  assert.equal(room.raid.boss.level, 50);
  assert.match(room.raid.boss.magicCircleAsset, /death-mirror-raid\.png$/);
  assert.equal(room.raid.minions.length, 1);
  assert.equal(room.raid.minions[0].level, 200);
  assert.equal(room.raid.minions[0].maxHp, 12_500);
});

test("build205 shared exploration reuses the leader world and its opened chests", () => {
  const store = new RoomStore({ randomRoomCode: () => "H205AA", random: () => .2 });
  const { players, room } = readyRoom(store, 1);
  assert.equal(store.setFloor(players[0].session, 1).ok, true);
  assert.equal(store.setReady(players[0].session, true).ok, true);
  const hostWorld = { openedChestIds: { 1: ["1-0"] } };
  assert.equal(store.startExpedition(players[0].session, { hostWorld }).ok, true);
  const firstTiles = [...room.expedition.tiles];
  const firstSpecials = room.expedition.objects.filter(object => object.id.startsWith("coop-")).map(object => [object.id, object.x, object.y]);
  assert.equal(room.expedition.hostOwnerId, players[0].session.playerId);
  assert.equal(room.expedition.objects.find(object => object.hostChestKey === "1-0")?.resolved, true);

  store._finishExpedition(room, { reason: "test" });
  assert.equal(store.setReady(players[0].session, true).ok, true);
  assert.equal(store.startExpedition(players[0].session, { hostWorld }).ok, true);
  assert.deepEqual(room.expedition.tiles, firstTiles);
  assert.deepEqual(room.expedition.objects.filter(object => object.id.startsWith("coop-")).map(object => [object.id, object.x, object.y]), firstSpecials);
});

test("build206 optional switch, rescue and contribution report are authoritative", () => {
  let now = 100_000;
  const store = new RoomStore({ now: () => now, randomRoomCode: () => "C205AA", random: () => .2 });
  const { players, room } = readyRoom(store, 2);
  const switchFloor = Array.from({ length: 21 }, (_, index) => index + 1).find(floor => coopGimmickFor({ leaderId: players[0].session.playerId, floor }) === "dualSwitch");
  assert.ok(switchFloor);
  assert.equal(store.setFloor(players[0].session, switchFloor).ok, true);
  for (const player of players) assert.equal(store.setReady(player.session, true).ok, true);
  assert.equal(store.startExpedition(players[0].session, { hostWorld: { openedChestIds: {} } }).ok, true);
  const expedition = room.expedition;
  const ping = store.expeditionPing(players[0].session, { kind: "switch" });
  assert.equal(ping.ok, true);
  assert.equal(ping.ping.label, "スイッチ");
  assert.equal(ping.ping.expiresAt - ping.ping.createdAt, 7_000);

  const switches = expedition.objects.filter(object => object.type === "coopSwitch");
  assert.equal(switches.length, 2);
  players[0].session.dungeonPosition = { x: switches[0].x, y: switches[0].y, facing: "down" };
  players[1].session.dungeonPosition = { ...expedition.start, facing: "left" };
  store._updateCoopSwitch(room);
  assert.equal(expedition.coop.switchUnlocked, false);
  assert.equal(switches[1].occupied, false);
  assert.equal(switches[1].progress, 0);
  assert.equal(switches[1].active, false);
  assert.equal(expedition.coop.switchHoldStartedAt, 0);
  players[1].session.dungeonPosition = { x: switches[1].x, y: switches[1].y, facing: "down" };
  store._updateCoopSwitch(room);
  assert.equal(expedition.coop.switchUnlocked, true);
  assert.equal(expedition.objects.find(object => object.type === "resonanceVault").unlocked, true);
  assert.equal(expedition.objects.find(object => object.type === "coopElite").hidden, false);

  players[0].session.coopVitals.hp = 100;
  players[1].session.coopVitals.hp = 0;
  players[0].session.dungeonPosition = { x: 4, y: 4, facing: "right" };
  players[1].session.dungeonPosition = { x: 5, y: 4, facing: "left" };
  assert.equal(store.moveExpedition(players[1].session, { x: 5, y: 5 }).code, "ACTOR_DOWN");
  store._syncCoopInteractions(room);
  assert.equal(store.expeditionInteract(players[0].session, { action: "rescue", targetId: players[1].session.playerId }).ok, true);
  assert.equal(players[0].session.coopVitals.hp, 1);
  assert.equal(players[1].session.coopVitals.hp, 99);
  assert.equal(expedition.contribution[players[0].session.playerId].rescue, 1);

  store._finishExpedition(room, { completed: true, reason: "test-clear" });
  const ended = players[0].conn.messages.findLast(message => message.type === "expeditionEnded");
  assert.equal(ended.summary.reason, "test-clear");
  assert.equal(ended.summary.ranking.length, 2);
  assert.equal(ended.summary.ranking[0].rank, 1);
  assert.ok(ended.summary.ranking.every(entry => Number.isFinite(entry.exploration)));
  assert.ok(ended.summary.ranking.flatMap(entry => entry.mvpTitles).includes("救助王"));
  assert.ok(ended.summary.ranking.flatMap(entry => entry.mvpTitles).includes("ギミック貢献王"));
});
