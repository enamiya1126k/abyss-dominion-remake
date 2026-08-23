import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function player(store, index, profile = {}) {
  const conn = connection();
  const suffix = ["AAAB", "AAAC", "AAAD", "AAAE"][index - 1];
  const result = store.hello(conn, {
    friendId: `AD-TEAM-${suffix}`,
    clientKey: `team-client-secret-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `冒険者${index}`,
      speciesId: "slime",
      monsterName: `テスト魔物${index}`,
      maxFloor: 100,
      battleStats: { hp: 10_000, mp: 100, atk: 1_000, matk: 900, def: 800, mdef: 750, spd: 100 + index, crit: 5, evasion: 8, accuracy: 100 },
      skills: [{ id: "strike", name: "連携撃", kind: "attack", mp: 5, power: 1.1, hits: 1 }],
      ...profile,
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session };
}

test("team battle carries equipped magic circles into the shared battle", () => {
  const store = new RoomStore({ now: () => 35_000, randomRoomCode: () => "TCIRCL", random: () => 0.3 });
  const first = player(store, 1, { circleId: "guardian", circleName: "守護結界陣", circleLevel: 8, circleEffect: "shield" });
  const second = player(store, 2);
  const created = store.createRoom(first.session);
  assert.equal(store.joinRoom(second.session, created.room.roomId).ok, true);
  assert.equal(store.setTeamSide(first.session, "sun").ok, true);
  assert.equal(store.setTeamSide(second.session, "moon").ok, true);
  assert.equal(store.setTeamReady(first.session, true).ok, true);
  assert.equal(store.setTeamReady(second.session, true).ok, true);
  const started = store.startTeamBattle(first.session);
  assert.equal(started.ok, true);
  const actor = started.teamBattle.players.find(entry => entry.playerId === first.session.playerId);
  assert.equal(actor.shield, 5_000);
  assert.ok(started.teamBattle.lastEvents.some(event => event.kind === "circleActivate" && event.label === "守護結界陣"));
});

function roomWithFour(store) {
  const players = [1, 2, 3, 4].map(index => player(store, index));
  const created = store.createRoom(players[0].session);
  for (const entry of players.slice(1)) assert.equal(store.joinRoom(entry.session, created.room.roomId).ok, true);
  return { roomId: created.room.roomId, players };
}

function roomWithCount(store, count) {
  const players = Array.from({ length: count }, (_, index) => player(store, index + 1));
  const created = store.createRoom(players[0].session);
  for (const entry of players.slice(1)) assert.equal(store.joinRoom(entry.session, created.room.roomId).ok, true);
  return { roomId: created.room.roomId, players };
}

test("free team battle accepts 1vs1 and 1vs2 without padding either side", () => {
  for (const [count, expected] of [[2, "1 vs 1"], [3, "1 vs 2"]]) {
    const store = new RoomStore({ now: () => 40_000, randomRoomCode: () => `T13${count}AB`, random: () => 0.3 });
    const { players } = roomWithCount(store, count);
    assert.equal(store.setTeamSide(players[0].session, "sun").ok, true);
    for (const entry of players.slice(1)) assert.equal(store.setTeamSide(entry.session, "moon").ok, true);
    for (const entry of players) assert.equal(store.setTeamReady(entry.session, true).ok, true);
    const started = store.startTeamBattle(players[0].session);
    assert.equal(started.ok, true);
    assert.equal(started.teamBattle.format, expected);
    assert.equal(started.teamBattle.players.length, count);
  }
});

test("free team battle accepts 1vs3 and resolves synchronized commands", () => {
  let now = 50_000;
  const store = new RoomStore({ now: () => now, randomRoomCode: () => "TEAM13", random: () => 0.2 });
  const { roomId, players } = roomWithFour(store);
  assert.equal(store.setTeamSide(players[0].session, "sun").ok, true);
  for (const entry of players.slice(1)) assert.equal(store.setTeamSide(entry.session, "moon").ok, true);
  for (const entry of players) assert.equal(store.setTeamReady(entry.session, true).ok, true);
  const started = store.startTeamBattle(players[0].session);
  assert.equal(started.ok, true);
  assert.equal(started.teamBattle.format, "1 vs 3");
  assert.equal(started.teamBattle.players.length, 4);
  assert.equal(store.rooms.get(roomId).phase, "team");

  const sunId = players[0].session.playerId;
  const moonId = players[1].session.playerId;
  assert.equal(store.submitTeamAction(players[0].session, { kind: "skill", skillId: "strike", targetId: moonId }).ok, true);
  for (const entry of players.slice(1)) assert.equal(store.submitTeamAction(entry.session, { kind: "attack", targetId: sunId }).ok, true);
  const battle = store.rooms.get(roomId).teamBattle;
  assert.equal(battle.phase, "result");
  assert.ok(battle.lastEvents.some(event => ["damage", "miss"].includes(event.kind)));

  now = battle.nextRoundAt + 1;
  store.advanceBattles();
  if (store.rooms.get(roomId).phase === "team") assert.equal(store.rooms.get(roomId).teamBattle.phase, "command");
});

test("2vs2 supports reconnect autopilot, spectators and clean mid-match exits", () => {
  let now = 80_000;
  const store = new RoomStore({ now: () => now, randomRoomCode: () => "TEAM22", random: () => 0.25 });
  const { roomId, players } = roomWithFour(store);
  for (const entry of players.slice(0, 2)) store.setTeamSide(entry.session, "sun");
  for (const entry of players.slice(2)) store.setTeamSide(entry.session, "moon");
  for (const entry of players) store.setTeamReady(entry.session, true);
  assert.equal(store.startTeamBattle(players[0].session).teamBattle.format, "2 vs 2");
  const battle = store.rooms.get(roomId).teamBattle;
  store.disconnect(players[3].session);
  for (const entry of players.slice(0, 3)) {
    const actor = battle.players[entry.session.playerId];
    const target = Object.values(battle.players).find(candidate => candidate.side !== actor.side && candidate.hp > 0);
    store.submitTeamAction(entry.session, { kind: "attack", targetId: target.playerId });
  }
  store.advanceBattles();
  assert.equal(battle.actions[players[3].session.playerId].auto, true);
  assert.equal(battle.phase, "result");

  now = battle.nextRoundAt + 1;
  store.advanceBattles();
  if (store.rooms.get(roomId).phase === "team") {
    store.leaveRoom(players[0].session);
    store.leaveRoom(players[1].session);
    const remaining = store.rooms.get(roomId).teamBattle;
    assert.equal(remaining.phase, "result");
    assert.equal(remaining.winner, "moon");
    assert.equal(remaining.players[players[0].session.playerId], undefined);
    assert.equal(remaining.players[players[1].session.playerId], undefined);
  }
});
