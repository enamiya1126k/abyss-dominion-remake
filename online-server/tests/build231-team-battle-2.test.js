import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function player(store, index, overrides = {}) {
  const conn = connection();
  const friendIds = ["AD-T2AA-B2AA", "AD-T2AB-B2AB", "AD-T2AC-B2AC", "AD-T2AD-B2AD"];
  const result = store.hello(conn, {
    friendId: friendIds[index - 1],
    clientKey: `build231-team-client-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `挑戦者${index}`,
      speciesId: "slime",
      monsterName: `模擬魔物${index}`,
      maxFloor: 500,
      power: 10_000,
      battleStats: { hp: 10_000, mp: 100, atk: 1_000, matk: 900, def: 800, mdef: 750, spd: 120 - index, crit: 5, evasion: 5, accuracy: 100 },
      skills: [{ id: "strike", name: "模擬連撃", kind: "attack", mp: 5, power: 1.2, hits: 1 }],
      ...overrides,
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session };
}

function roomWith(store, count) {
  const players = Array.from({ length: count }, (_, index) => player(store, index + 1));
  const created = store.createRoom(players[0].session);
  for (const entry of players.slice(1)) assert.equal(store.joinRoom(entry.session, created.room.roomId).ok, true);
  return { roomId: created.room.roomId, players };
}

function readySides(store, players, split = 1) {
  players.forEach((entry, index) => assert.equal(store.setTeamSide(entry.session, index < split ? "sun" : "moon").ok, true));
  players.forEach(entry => assert.equal(store.setTeamReady(entry.session, true).ok, true));
}

function finishOneVsOneGame(store, roomId, players, winningIndex = 0) {
  const battle = store.rooms.get(roomId).teamBattle;
  const winner = players[winningIndex].session, loser = players[winningIndex ? 0 : 1].session;
  battle.players[loser.playerId].hp = 1;
  battle.players[winner.playerId].stats.spd = 9999;
  assert.equal(store.submitTeamAction(winner, { kind: "attack", targetId: loser.playerId }).ok, true);
  assert.equal(store.submitTeamAction(loser, { kind: "guard", targetId: loser.playerId }).ok, true);
  assert.equal(battle.phase, "result");
  return battle;
}

test("build231 leader controls rules, series and side swap while every change clears READY", () => {
  const store = new RoomStore({ randomRoomCode: () => "T2RULE", random: () => .2 });
  const { roomId, players } = roomWith(store, 3);
  readySides(store, players, 1);
  assert.equal(store.setTeamSettings(players[1].session, { ruleset: "balanced" }).code, "LEADER_ONLY");
  assert.equal(store.setTeamSettings(players[0].session, { ruleset: "unknown" }).code, "BAD_TEAM_RULESET");
  assert.equal(store.setTeamSettings(players[0].session, { ruleset: "balanced", series: "bo3" }).ok, true);
  assert.deepEqual(store.rooms.get(roomId).teamSettings, { ruleset: "balanced", series: "bo3" });
  assert.ok(players.every(entry => entry.session.teamReady === false));
  players.forEach(entry => store.setTeamReady(entry.session, true));
  assert.equal(store.swapTeamSides(players[0].session).ok, true);
  assert.equal(players[0].session.teamSide, "moon");
  assert.equal(players[1].session.teamSide, "sun");
  assert.ok(players.every(entry => entry.session.teamReady === false));
  assert.deepEqual(store.roomSnapshot(store.rooms.get(roomId)).teamSettings, { ruleset: "balanced", series: "bo3" });
});

test("build231 balanced mode equalizes total endurance for a one-versus-three match", () => {
  let now = 20_000;
  const store = new RoomStore({ now: () => now, randomRoomCode: () => "T2BALN", random: () => .2 });
  const { players } = roomWith(store, 4);
  readySides(store, players, 1);
  store.setTeamSettings(players[0].session, { ruleset: "balanced", series: "bo1" });
  players.forEach(entry => store.setTeamReady(entry.session, true));
  const started = store.startTeamBattle(players[0].session);
  assert.equal(started.ok, true);
  const sun = started.teamBattle.players.filter(entry => entry.side === "sun"), moon = started.teamBattle.players.filter(entry => entry.side === "moon");
  assert.equal(sun.length, 1);
  assert.equal(moon.length, 3);
  assert.equal(sun[0].maxHp, moon.reduce((sum, entry) => sum + entry.maxHp, 0));
  assert.ok(sun[0].stats === undefined, "private combat stats are not exposed in snapshots");
  assert.ok(started.teamBattle.players.every(entry => entry.balanced));
  assert.equal(started.teamBattle.ruleset, "balanced");
});

test("build231 best-of-three keeps score, fully resets game state and emits one final result", () => {
  let now = 50_000;
  const store = new RoomStore({ now: () => now, randomRoomCode: () => "T2BO3X", random: () => .1 });
  const { roomId, players } = roomWith(store, 2);
  readySides(store, players, 1);
  store.setTeamSettings(players[0].session, { ruleset: "standard", series: "bo3" });
  players.forEach(entry => store.setTeamReady(entry.session, true));
  assert.equal(store.startTeamBattle(players[0].session).ok, true);

  let battle = finishOneVsOneGame(store, roomId, players, 0);
  assert.deepEqual(battle.score, { sun: 1, moon: 0 });
  assert.equal(battle.betweenGames, true);
  assert.equal(battle.outcome, null);
  now = battle.nextRoundAt + 1;
  store.advanceBattles();
  battle = store.rooms.get(roomId).teamBattle;
  assert.equal(battle.game, 2);
  assert.equal(battle.round, 1);
  assert.equal(battle.phase, "command");
  assert.ok(Object.values(battle.players).every(entry => entry.hp === entry.maxHp && entry.itemCharges === 1));

  battle = finishOneVsOneGame(store, roomId, players, 0);
  assert.equal(battle.winner, "sun");
  assert.equal(battle.outcome, "victory");
  assert.deepEqual(battle.score, { sun: 2, moon: 0 });
  assert.equal(battle.summary.mvpPlayerId, players[0].session.playerId);
  assert.equal(battle.summary.ranking.length, 2);
  now = battle.nextRoundAt + 1;
  store.advanceBattles();
  assert.equal(store.rooms.get(roomId).phase, "lobby");
  const ended = players[0].conn.messages.filter(message => message.type === "teamBattleEnded");
  assert.equal(ended.length, 1);
  assert.equal(ended[0].resultId, `team:${battle.id}`);
  assert.deepEqual(ended[0].summary.score, { sun: 2, moon: 0 });
});

test("build231 blitz uses a nine-second command window and forfeit ends the whole series", () => {
  let now = 90_000;
  const store = new RoomStore({ now: () => now, randomRoomCode: () => "T2BLTZ", random: () => .3 });
  const { roomId, players } = roomWith(store, 2);
  readySides(store, players, 1);
  store.setTeamSettings(players[0].session, { ruleset: "blitz", series: "bo3" });
  players.forEach(entry => store.setTeamReady(entry.session, true));
  const started = store.startTeamBattle(players[0].session);
  assert.equal(started.teamBattle.deadlineAt - now, 9_000);
  assert.equal(started.teamBattle.series, "bo3");
  store.leaveRoom(players[1].session);
  const battle = store.rooms.get(roomId).teamBattle;
  assert.equal(battle.outcome, "victory");
  assert.equal(battle.winner, "sun");
  assert.deepEqual(battle.score, { sun: 2, moon: 0 });
  assert.equal(battle.summary.games.at(-1).reason, "forfeit");
});
