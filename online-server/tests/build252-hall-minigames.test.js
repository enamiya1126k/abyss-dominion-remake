import test from "node:test";
import assert from "node:assert/strict";

import { HallMinigameCoordinator } from "../src/HallMinigameCoordinator.js";

function monster(monsterId, name, speed = 10, level = 1) {
  return {
    monsterId,
    speciesId: "slime",
    monsterName: name,
    level,
    power: speed * 10,
    battleStats: { hp: 100, mp: 10, atk: 10, matk: 10, def: 10, mdef: 10, spd: speed },
  };
}

function fixture() {
  let now = 1_000_000;
  const sessions = new Map([
    ["a", { playerId: "a", connected: true, profile: { displayName: "蒼", primaryMonsterId: "a1", battleRoster: [monster("a1", "ぷるん", 10)] } }],
    ["b", { playerId: "b", connected: true, profile: { displayName: "紅", primaryMonsterId: "b1", battleRoster: [monster("b1", "わん", 25, 80)] } }],
    ["c", { playerId: "c", connected: true, profile: { displayName: "翠", primaryMonsterId: "c1", battleRoster: [monster("c1", "ばさ", 40, 9999)] } }],
  ]);
  const room = { roomId: "HALL25", phase: "lobby", leaderId: "a", members: new Set(["a", "b", "c"]), hallGame: null };
  const coordinator = new HallMinigameCoordinator({ now: () => now, random: () => 0.25, sessions });
  return { coordinator, room, sessions, advance: value => { now += value; return coordinator.advance(room); }, now: () => now };
}

function joinReady(coordinator, room, sessions, game, ids = ["a", "b"]) {
  for (const id of ids) {
    const monsterId = game === "race" ? `${id}1` : undefined;
    assert.equal(coordinator.join(room, sessions.get(id), { game, monsterId }).ok, true);
    assert.equal(coordinator.ready(room, sessions.get(id), true).ok, true);
  }
}

test("build252 bomb mimic is server-authoritative, idempotent and resolves five rounds", () => {
  const { coordinator, room, sessions, advance } = fixture();
  joinReady(coordinator, room, sessions, "mimic", ["a", "b", "c"]);
  assert.equal(coordinator.start(room, sessions.get("a")).ok, true);

  const opened = coordinator.snapshot(room);
  assert.equal(opened.game, "mimic");
  assert.equal(opened.phase, "running");
  assert.equal(opened.totalRounds, 5);
  assert.equal(typeof opened.danger, "number");
  assert.equal(JSON.stringify(opened).includes("explodeAt"), false);
  assert.equal(JSON.stringify(opened).includes("_private"), false);

  const holder = room.hallGame.holderId;
  const target = ["a", "b", "c"].find(id => id !== holder);
  const action = { action: "pass", requestId: "pass-000000000000000001", targetId: target };
  assert.equal(coordinator.action(room, sessions.get(holder), action).ok, true);
  const revision = room.hallGame.revision;
  const duplicate = coordinator.action(room, sessions.get(holder), action);
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(room.hallGame.revision, revision);

  for (let round = 1; round <= 5; round += 1) {
    assert.equal(advance(14_000).changed, true, `round ${round} explodes once`);
    assert.equal(coordinator.snapshot(room).phase, "intermission");
    assert.equal(advance(2_000).changed, true, `round ${round} advances once`);
  }
  const result = coordinator.snapshot(room);
  assert.equal(result.phase, "result");
  assert.equal(result.result.rounds, 5);
  assert.ok(result.result.winnerIds.length >= 1);
  assert.equal(result.participants.length, 3, "nobody is eliminated before the final result");
});

test("build252 mimic keeps reconnectable participants and aborts only after grace", () => {
  const { coordinator, room, sessions, advance } = fixture();
  joinReady(coordinator, room, sessions, "mimic", ["a", "b"]);
  coordinator.start(room, sessions.get("a"));
  sessions.get("b").connected = false;
  assert.equal(advance(250).changed, true);
  let state = coordinator.snapshot(room);
  assert.equal(state.paused, true);
  assert.equal(state.participants.length, 2);
  sessions.get("b").connected = true;
  assert.equal(advance(1_000).changed, true);
  state = coordinator.snapshot(room);
  assert.equal(state.paused, false);
  assert.equal(state.id, room.hallGame.id);

  sessions.get("b").connected = false;
  advance(250);
  assert.equal(advance(15_001).changed, true);
  assert.equal(coordinator.snapshot(room).result.reason, "reconnectTimeout");
});

test("build252 mimic allows the only connected return pass after a third player disconnects", () => {
  const { coordinator, room, sessions, advance } = fixture();
  joinReady(coordinator, room, sessions, "mimic", ["a", "b", "c"]);
  coordinator.start(room, sessions.get("a"));

  const firstHolder = room.hallGame.holderId;
  const secondHolder = ["a", "b", "c"].find(id => id !== firstHolder);
  const disconnected = ["a", "b", "c"].find(id => id !== firstHolder && id !== secondHolder);
  assert.equal(coordinator.action(room, sessions.get(firstHolder), {
    action: "pass", requestId: "pass-before-disconnect", targetId: secondHolder,
  }).ok, true);

  sessions.get(disconnected).connected = false;
  advance(600);
  const returned = coordinator.action(room, sessions.get(secondHolder), {
    action: "pass", requestId: "pass-after-disconnect", targetId: firstHolder,
  });
  assert.equal(returned.ok, true, "two connected players must not be trapped by the three-player return rule");
});

test("build252 race resolves roster entries on the server and keeps cheer cosmetic", () => {
  const { coordinator, room, sessions, advance } = fixture();
  assert.equal(coordinator.join(room, sessions.get("a"), { game: "race", monsterId: "b1", battleStats: { spd: 9e15 } }).ok, false, "another player's monster cannot be selected");
  joinReady(coordinator, room, sessions, "race", ["a", "b", "c"]);
  assert.equal(coordinator.start(room, sessions.get("a")).ok, true);
  const running = coordinator.snapshot(room);
  assert.equal(running.phase, "running");
  assert.equal(running.racers.length, 3);
  assert.ok(running.racers.every(entry => entry.durationMs >= 7_000 && entry.durationMs <= 11_000));
  assert.equal(JSON.stringify(running).includes("randomRoll"), false);
  assert.equal(JSON.stringify(running).includes("performanceBonus"), false);

  const plannedWinner = room.hallGame._private.racePlan[0].playerId;
  const cheer = { action: "cheer", requestId: "cheer-00000000000000001", targetId: plannedWinner };
  assert.equal(coordinator.action(room, sessions.get("b"), cheer).ok, true);
  assert.equal(coordinator.action(room, sessions.get("b"), cheer).duplicate, true);
  assert.equal(room.hallGame._private.racePlan[0].playerId, plannedWinner, "cheer must not alter the plan");

  sessions.get("c").connected = false;
  assert.equal(coordinator.snapshot(room).participants.length, 3, "a short disconnect keeps the runner");
  assert.equal(advance(12_000).changed, true);
  const result = coordinator.snapshot(room);
  assert.equal(result.phase, "result");
  assert.equal(result.result.ranking.length, 3);
  assert.equal(result.result.winnerIds[0], plannedWinner);
});
