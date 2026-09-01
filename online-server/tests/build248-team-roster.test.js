import test from "node:test";
import assert from "node:assert/strict";
import { TeamBattleCoordinator, teamBattleSnapshot } from "../src/TeamBattleCoordinator.js";

function monster(owner, index, overrides = {}) {
  const hp = 1_000 + index * 10;
  return {
    displayName: owner,
    monsterId: `${owner}-monster-${index}`,
    rosterIndex: index - 1,
    isPrimary: index === 1,
    monsterName: `${owner}魔物${index}`,
    speciesId: `slime_${index}`,
    fallbackEmoji: "魔",
    level: 10 + index,
    stars: 1,
    plus: 0,
    power: 1_000 + index,
    battleStats: { hp, mp: 100, atk: 200, matk: 180, def: 150, mdef: 140, spd: 100 + index, crit: 5, evasion: 0, accuracy: 100 },
    circleEffect: "none",
    circleName: "魔法陣なし",
    circleLevel: 0,
    skills: [{ id: `strike-${index}`, name: `攻撃${index}`, kind: "attack", mp: 5, power: 1, hits: 1 }],
    ...overrides,
  };
}

function participant(index, rosterSize = 4, { legacy = false } = {}) {
  const playerId = `AD-TEST-000${index}`;
  const primary = monster(`冒険者${index}`, 1);
  const profile = {
    ...primary,
    displayName: `冒険者${index}`,
    ...(legacy ? {} : { battleRoster: Array.from({ length: rosterSize }, (_, offset) => monster(`冒険者${index}`, offset + 1)) }),
  };
  return { playerId, profile, connected: true, teamSide: "spectator", teamReady: false };
}

function setup(count, rosterSize = 4) {
  let now = 100_000;
  const members = Array.from({ length: count }, (_, offset) => participant(offset + 1, rosterSize));
  const sessions = new Map(members.map(member => [member.playerId, member]));
  const messages = [];
  const coordinator = new TeamBattleCoordinator({ now: () => now, random: () => .2, sessions, broadcast: (_room, message) => messages.push(message) });
  const room = { roomId: "TEAM48", leaderId: members[0].playerId, phase: "lobby", members: new Set(members.map(member => member.playerId)), teamSettings: { ruleset: "standard", series: "bo1" }, teamBattle: null };
  return { coordinator, room, members, messages, setNow(value) { now = value; } };
}

function ready(coordinator, room, members, sunCount) {
  members.forEach((member, index) => {
    assert.equal(coordinator.setSide(room, member, index < sunCount ? "sun" : "moon").ok, true);
    assert.equal(coordinator.setReady(room, member, true).ok, true);
  });
}

test("legacy team clients still enter as one monster per player", () => {
  const left = participant(1, 1, { legacy: true }), right = participant(2, 1, { legacy: true });
  const sessions = new Map([[left.playerId, left], [right.playerId, right]]);
  const coordinator = new TeamBattleCoordinator({ now: () => 1_000, random: () => .2, sessions });
  const room = { leaderId: left.playerId, phase: "lobby", members: new Set(sessions.keys()), teamSettings: { ruleset: "standard", series: "bo1" } };
  ready(coordinator, room, [left, right], 1);
  const result = coordinator.start(room, left);
  assert.equal(result.ok, true);
  assert.equal(result.teamBattle.format, "1 vs 1");
  assert.deepEqual(result.teamBattle.players.map(actor => actor.playerId).sort(), [left.playerId, right.playerId].sort());
});

test("one player per side deploys two monsters each within the global four-slot limit", () => {
  const { coordinator, room, members } = setup(2);
  ready(coordinator, room, members, 1);
  const started = coordinator.start(room, members[0]);
  assert.equal(started.ok, true);
  assert.equal(started.teamBattle.format, "2 vs 2");
  assert.equal(started.teamBattle.players.length, 4);
  assert.equal(started.teamBattle.players.filter(actor => actor.side === "sun").length, 2);
  assert.equal(started.teamBattle.players.filter(actor => actor.side === "moon").length, 2);
  assert.equal(started.teamBattle.players.filter(actor => actor.ownerPlayerId === members[0].playerId).length, 2);
  assert.equal(Object.hasOwn(started.teamBattle.players[0], "stats"), false);
  assert.equal(Array.isArray(started.teamBattle.players[0].skills), true);
  assert.equal(started.teamBattle.players[0].skills.length > 0, true);

  const foreign = started.teamBattle.players.find(actor => actor.ownerPlayerId === members[1].playerId);
  assert.equal(coordinator.action(room, members[0], { actorId: foreign.combatantId, kind: "attack" }).code, "BAD_ACTOR");
  let submitted = 0;
  for (const actor of Object.values(room.teamBattle.players)) {
    const owner = members.find(member => member.playerId === actor.ownerPlayerId);
    const target = Object.values(room.teamBattle.players).find(candidate => candidate.side !== actor.side && candidate.hp > 0);
    assert.equal(coordinator.action(room, owner, { actorId: actor.combatantId, kind: "attack", targetId: target.combatantId }).ok, true);
    submitted += 1;
    if (submitted < 4) assert.equal(room.teamBattle.phase, "command");
  }
  assert.equal(room.teamBattle.phase, "result");
  assert.equal(Object.keys(room.teamBattle.actions).length, 4);
});

test("four-player allocation preserves one slot each and never exceeds four monsters globally", () => {
  for (const sunCount of [1, 2]) {
    const { coordinator, room, members } = setup(4);
    ready(coordinator, room, members, sunCount);
    const result = coordinator.start(room, members[0]);
    assert.equal(result.ok, true);
    assert.equal(result.teamBattle.players.length, 4);
    for (const member of members) assert.ok(result.teamBattle.players.some(actor => actor.ownerPlayerId === member.playerId));
    if (sunCount === 1) {
      assert.equal(result.teamBattle.format, "1 vs 3");
      assert.deepEqual(members.map(member => result.teamBattle.players.filter(actor => actor.ownerPlayerId === member.playerId).length), [1, 1, 1, 1]);
    } else {
      assert.deepEqual(members.map(member => result.teamBattle.players.filter(actor => actor.ownerPlayerId === member.playerId).length), [1, 1, 1, 1]);
    }
  }
});

test("a three-player match gives the fourth global slot to the smaller side", () => {
  const { coordinator, room, members } = setup(3);
  members[1].profile.battleRoster = members[1].profile.battleRoster.slice(0, 1);
  ready(coordinator, room, members, 1);
  const result = coordinator.start(room, members[0]);
  assert.equal(result.teamBattle.players.length, 4);
  assert.equal(result.teamBattle.players.filter(actor => actor.ownerPlayerId === members[0].playerId).length, 2);
  assert.equal(result.teamBattle.players.filter(actor => actor.ownerPlayerId === members[1].playerId).length, 1);
  assert.equal(result.teamBattle.players.filter(actor => actor.ownerPlayerId === members[2].playerId).length, 1);
  assert.equal(result.teamBattle.players.filter(actor => actor.side === "moon").length, 2);
});

test("a missing smaller-side reserve never reallocates its fourth slot to the larger team", () => {
  const { coordinator, room, members } = setup(3);
  members[0].profile.battleRoster = members[0].profile.battleRoster.slice(0, 1);
  ready(coordinator, room, members, 1);
  const result = coordinator.start(room, members[0]);
  assert.equal(result.ok, true);
  assert.equal(result.teamBattle.players.length, 3);
  assert.equal(result.teamBattle.players.filter(actor => actor.side === "sun").length, 1);
  assert.equal(result.teamBattle.players.filter(actor => actor.side === "moon").length, 2);
  assert.deepEqual(members.map(member => result.teamBattle.players.filter(actor => actor.ownerPlayerId === member.playerId).length), [1, 1, 1]);
});

test("one player per side is capped at two deployments even when the opponent has no reserve", () => {
  const { coordinator, room, members } = setup(2);
  members[0].profile.battleRoster = members[0].profile.battleRoster.slice(0, 1);
  ready(coordinator, room, members, 1);
  const result = coordinator.start(room, members[0]);
  assert.equal(result.ok, true);
  assert.equal(result.teamBattle.players.length, 3);
  assert.equal(result.teamBattle.players.filter(actor => actor.side === "sun").length, 1);
  assert.equal(result.teamBattle.players.filter(actor => actor.side === "moon").length, 2);
  assert.equal(result.teamBattle.players.filter(actor => actor.ownerPlayerId === members[1].playerId).length, 2);
});

test("balanced rules scale roster combatants and keep each actor identifiable", () => {
  const { coordinator, room, members } = setup(2, 2);
  members[0].profile.battleRoster[0].power = 100;
  members[1].profile.battleRoster[0].power = 1_000_000;
  assert.equal(coordinator.setSettings(room, members[0], { ruleset: "balanced", series: "bo1" }).ok, true);
  ready(coordinator, room, members, 1);
  const result = coordinator.start(room, members[0]);
  assert.equal(result.teamBattle.players.every(actor => actor.balanced), true);
  assert.equal(new Set(result.teamBattle.players.map(actor => actor.combatantId)).size, 4);
  assert.ok(result.teamBattle.players.some(actor => actor.balanceFactor !== 1));
});

test("blitz and best-of-three behavior, aggregated player records and monster records remain available", () => {
  const { coordinator, room, members, setNow } = setup(2, 2);
  assert.equal(coordinator.setSettings(room, members[0], { ruleset: "blitz", series: "bo3" }).ok, true);
  ready(coordinator, room, members, 1);
  const started = coordinator.start(room, members[0]);
  assert.equal(started.teamBattle.ruleset, "blitz");
  assert.equal(started.teamBattle.series, "bo3");
  assert.equal(started.teamBattle.deadlineAt, 109_000);
  assert.equal(room.teamBattle.damageMultiplier, 1.25);

  for (let game = 1; game <= 2; game += 1) {
    for (const actor of Object.values(room.teamBattle.players).filter(actor => actor.side === "moon")) actor.hp = 1;
    for (const actor of Object.values(room.teamBattle.players)) room.teamBattle.actions[actor.playerId] = coordinator._autoAction(room.teamBattle, actor);
    coordinator._resolve(room, room.teamBattle);
    if (game === 1) {
      assert.equal(room.teamBattle.outcome, null);
      assert.equal(room.teamBattle.betweenGames, true);
      setNow(room.teamBattle.nextRoundAt + 1);
      coordinator.advance(room);
      assert.equal(room.teamBattle.game, 2);
    }
  }
  assert.equal(room.teamBattle.outcome, "victory");
  assert.equal(room.teamBattle.winner, "sun");
  assert.equal(room.teamBattle.summary.ranking.length, 2);
  assert.equal(room.teamBattle.summary.monsterRanking.length, 4);
  assert.equal(new Set(room.teamBattle.summary.ranking.map(row => row.playerId)).size, 2);
  const snapshot = teamBattleSnapshot(room.teamBattle);
  snapshot.summary.monsterRanking[0].score = -1;
  assert.notEqual(room.teamBattle.summary.monsterRanking[0].score, -1);
});

test("leaving a battle removes every monster owned by that player", () => {
  const { coordinator, room, members } = setup(2, 4);
  ready(coordinator, room, members, 1);
  coordinator.start(room, members[0]);
  coordinator.playerLeft(room, members[0].playerId);
  assert.equal(Object.values(room.teamBattle.players).some(actor => actor.ownerPlayerId === members[0].playerId), false);
  assert.equal(room.teamBattle.phase, "result");
  assert.equal(room.teamBattle.winner, "moon");
});
