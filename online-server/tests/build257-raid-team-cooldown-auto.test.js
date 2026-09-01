import test from "node:test";
import assert from "node:assert/strict";

import { RaidCoordinator, chooseRaidAutoAction, raidSnapshot } from "../src/RaidCoordinator.js";
import { TeamBattleCoordinator, chooseTeamAutoAction, teamBattleSnapshot } from "../src/TeamBattleCoordinator.js";

const BASE_SKILL = Object.freeze({ id: "burst", name: "Burst", kind: "attack", mp: 8, power: 1.2, hits: 1, cooldown: 3, element: "fire" });

function profile(owner, index = 1, overrides = {}) {
  return {
    displayName: owner,
    monsterId: `${owner}-${index}`,
    rosterIndex: index - 1,
    isPrimary: index === 1,
    monsterName: `${owner}魔物${index}`,
    speciesId: `slime_${index}`,
    fallbackEmoji: "魔",
    level: 30,
    stars: 1,
    plus: 0,
    power: 1_000,
    attribute: "water",
    battleStats: { hp: 20_000, mp: 100, atk: 220, matk: 220, def: 180, mdef: 180, spd: 100 + index, crit: 0, evasion: 0, accuracy: 120 },
    circleEffect: "none",
    circleName: "魔法陣なし",
    circleLevel: 0,
    skills: [
      { ...BASE_SKILL },
      { id: "guard", name: "Guard", kind: "guard", mp: 5, cooldown: 1, effects: [{ kind: "defUp", value: .1, turns: 1 }] },
      { id: "heal", name: "Heal", kind: "heal", mp: 12, cooldown: 2, heal: .25 },
      { id: "revive", name: "Revive", kind: "revive", mp: 20, cooldown: 4, revive: .35, revivedEffects: [{ kind: "atkUp", value: .1, turns: 1 }], status: { id: "blessing", chance: 1, power: 0, turns: 1 } },
    ],
    ...overrides,
  };
}

function raidSetup(rosterSize = 1) {
  let now = 257_000;
  const playerId = "RAID257-OWNER", first = profile("Owner", 1), session = {
    playerId,
    connected: true,
    ready: true,
    profile: { ...first, battleRoster: Array.from({ length: rosterSize }, (_, index) => profile("Owner", index + 1)) },
  };
  const sessions = new Map([[playerId, session]]), messages = [];
  const coordinator = new RaidCoordinator({ now: () => now, random: () => .99, sessions, broadcast: (_room, message) => messages.push(message) });
  const room = { roomId: "RAID257", ownerId: playerId, leaderId: playerId, phase: "lobby", members: new Set([playerId]), selectedFloor: 300, raidProgress: null, raid: null };
  return { coordinator, room, session, messages, setNow(value) { now = value; } };
}

function teamSetup() {
  let now = 357_000;
  const sunId = "TEAM257-SUN", moonId = "TEAM257-MOON", sunProfile = profile("Sun"), moonProfile = profile("Moon", 1, { attribute: "ice" });
  const sun = { playerId: sunId, connected: true, teamSide: "spectator", teamReady: false, profile: { ...sunProfile, battleRoster: [sunProfile] } };
  const moon = { playerId: moonId, connected: true, teamSide: "spectator", teamReady: false, profile: { ...moonProfile, battleRoster: [moonProfile] } };
  const sessions = new Map([[sunId, sun], [moonId, moon]]), messages = [];
  const coordinator = new TeamBattleCoordinator({ now: () => now, random: () => .99, sessions, broadcast: (_room, message) => messages.push(message) });
  const room = { roomId: "TEAM257", leaderId: sunId, phase: "lobby", members: new Set([sunId, moonId]), teamSettings: { ruleset: "standard", series: "bo1" }, teamBattle: null };
  coordinator.setSide(room, sun, "sun");
  coordinator.setSide(room, moon, "moon");
  coordinator.setReady(room, sun, true);
  coordinator.setReady(room, moon, true);
  return { coordinator, room, sun, moon, messages, setNow(value) { now = value; } };
}

test("build257 raid validates and snapshots per-actor CT across command rounds", () => {
  const { coordinator, room, session, setNow } = raidSetup();
  const started = coordinator.start(room, session);
  assert.equal(started.ok, true);
  assert.deepEqual(started.raid.players[0].cooldowns, {});
  assert.deepEqual(started.raid.players[0].skills.map(skill => skill.cooldown), [3, 1, 2, 4]);
  assert.notEqual(started.raid.players[0].skills, room.raid.players[session.playerId].skills);
  assert.notEqual(started.raid.players[0].skills[1].effects, room.raid.players[session.playerId].skills[1].effects);

  const used = coordinator.action(room, session, { actorId: session.playerId, kind: "skill", skillId: "burst", enemyTargetId: room.raid.boss.id });
  assert.equal(used.ok, true);
  assert.equal(room.raid.phase, "result");
  assert.equal(room.raid.players[session.playerId].cooldowns.burst, 4, "internal +1 preserves the advertised CT after the round transition");
  assert.equal(used.raid.players[0].cooldowns.burst, 4);

  setNow(room.raid.nextRoundAt + 1);
  coordinator.advance(room);
  assert.equal(room.raid.phase, "command");
  assert.equal(room.raid.players[session.playerId].cooldowns.burst, 3);
  const blocked = coordinator.action(room, session, { actorId: session.playerId, kind: "skill", skillId: "burst", enemyTargetId: room.raid.boss.id });
  assert.equal(blocked.code, "SKILL_COOLDOWN");
  assert.equal(blocked.remainingCooldown, 3);
  assert.equal(raidSnapshot(room.raid).players[0].cooldowns.burst, 3);
});

test("build257 connected raid auto controls every owned actor and remains owner-scoped", () => {
  const { coordinator, room, session } = raidSetup(4);
  coordinator.start(room, session);
  const enabled = coordinator.setAuto(room, session, true);
  assert.equal(enabled.ok, true);
  assert.deepEqual(enabled.raid.autoPlayers, [session.playerId]);
  assert.equal(room.raid.phase, "result");
  assert.equal(Object.keys(room.raid.actions).length, 4);
  assert.equal(Object.values(room.raid.actions).every(action => action.auto), true);
  assert.equal(Object.values(room.raid.actions).every(action => room.raid.players[action.actorId].ownerPlayerId === session.playerId), true);
});

test("build257 raid deterministic AI prioritizes revive and excludes active CT", () => {
  const revive = { id: "revive", name: "Revive", kind: "revive", mp: 20, cooldown: 3, revive: .35 };
  const heal = { id: "heal", name: "Heal", kind: "allHeal", mp: 15, cooldown: 2, heal: .3, allAllies: true };
  const actor = { playerId: "owner", ownerPlayerId: "owner", hp: 1_000, maxHp: 1_000, mp: 100, maxMp: 100, itemCharges: 1, attribute: "water", stats: { atk: 220, matk: 220 }, skills: [revive, heal, { ...BASE_SKILL }], cooldowns: {} };
  const ally = { ...actor, playerId: "ally", ownerPlayerId: "ally", hp: 0, maxHp: 2_000, skills: [] };
  const boss = { id: "boss", boss: true, raidMainBoss: true, hp: 10_000, maxHp: 10_000, atk: 300, matk: 300, def: 100, mdef: 100, spd: 100, element: "ice" };
  const raid = { players: { owner: actor, ally }, actions: {}, minions: [], boss };
  assert.equal(chooseRaidAutoAction(raid, actor, 1).skillId, "revive");
  actor.cooldowns.revive = 2;
  const withoutRevive = chooseRaidAutoAction(raid, actor, 1);
  assert.notEqual(withoutRevive.skillId, "revive");
});

// Team battle coverage is kept in the same file so both online coordinators
// must preserve the exact same CT and owner-auto contract.
test("build257 team validates and snapshots per-actor CT across command rounds", () => {
  const { coordinator, room, sun, moon, setNow } = teamSetup();
  const started = coordinator.start(room, sun);
  assert.equal(started.ok, true);
  const publicSun = started.teamBattle.players.find(actor => actor.ownerPlayerId === sun.playerId), internalSun = Object.values(room.teamBattle.players).find(actor => actor.ownerPlayerId === sun.playerId);
  assert.deepEqual(publicSun.cooldowns, {});
  assert.deepEqual(publicSun.skills.map(skill => skill.cooldown), [3, 1, 2, 4]);
  assert.notEqual(publicSun.skills, internalSun.skills);
  assert.notEqual(publicSun.skills[1].effects, internalSun.skills[1].effects);
  assert.notEqual(publicSun.skills[3].revivedEffects, internalSun.skills[3].revivedEffects);
  assert.notEqual(publicSun.skills[3].status, internalSun.skills[3].status);
  const sunActor = Object.values(room.teamBattle.players).find(actor => actor.ownerPlayerId === sun.playerId), moonActor = Object.values(room.teamBattle.players).find(actor => actor.ownerPlayerId === moon.playerId);
  coordinator.action(room, moon, { actorId: moonActor.playerId, kind: "guard", targetId: moonActor.playerId });
  const used = coordinator.action(room, sun, { actorId: sunActor.playerId, kind: "skill", skillId: "burst", targetId: moonActor.playerId });
  assert.equal(used.ok, true);
  assert.equal(room.teamBattle.phase, "result");
  assert.equal(sunActor.cooldowns.burst, 4);
  assert.equal(used.battle.players.find(actor => actor.playerId === sunActor.playerId).cooldowns.burst, 4);

  setNow(room.teamBattle.nextRoundAt + 1);
  coordinator.advance(room);
  assert.equal(room.teamBattle.phase, "command");
  assert.equal(sunActor.cooldowns.burst, 3);
  const blocked = coordinator.action(room, sun, { actorId: sunActor.playerId, kind: "skill", skillId: "burst", targetId: moonActor.playerId });
  assert.equal(blocked.code, "SKILL_COOLDOWN");
  assert.equal(blocked.remainingCooldown, 3);
  assert.equal(teamBattleSnapshot(room.teamBattle).players.find(actor => actor.playerId === sunActor.playerId).cooldowns.burst, 3);
});

test("build257 connected team auto fills only the enabled owner's actors", () => {
  const { coordinator, room, sun } = teamSetup();
  coordinator.start(room, sun);
  const enabled = coordinator.setAuto(room, sun, true);
  assert.equal(enabled.ok, true);
  assert.deepEqual(enabled.battle.autoPlayers, [sun.playerId]);
  const actions = Object.values(room.teamBattle.actions);
  assert.equal(actions.length, 1);
  assert.equal(actions[0].auto, true);
  assert.equal(room.teamBattle.players[actions[0].actorId].ownerPlayerId, sun.playerId);
});

test("build257 team AI prioritizes revive and deterministically values elemental finishers", () => {
  const actor = { playerId: "sun", ownerPlayerId: "sun-owner", side: "sun", hp: 1_000, maxHp: 1_000, mp: 100, maxMp: 100, itemCharges: 1, attribute: "water", stats: { atk: 250, matk: 250 }, cooldowns: {}, skills: [] };
  const ally = { ...actor, playerId: "sun-ally", hp: 0, maxHp: 2_000 };
  const enemy = { ...actor, playerId: "moon", ownerPlayerId: "moon-owner", side: "moon", hp: 5_000, maxHp: 5_000, attribute: "ice", stats: { atk: 100, matk: 100, def: 100, mdef: 100, spd: 100 } };
  actor.skills = [{ id: "revive", kind: "revive", mp: 20, cooldown: 3, revive: .35 }, { id: "fire", kind: "attack", mp: 10, cooldown: 2, power: 1.5, hits: 1, element: "fire" }, { id: "water", kind: "attack", mp: 10, cooldown: 2, power: 1.5, hits: 1, element: "water" }];
  const battle = { players: { sun: actor, "sun-ally": ally, moon: enemy }, actions: {} };
  assert.equal(chooseTeamAutoAction(battle, actor, 1).skillId, "revive");
  ally.hp = ally.maxHp;
  assert.equal(chooseTeamAutoAction(battle, actor, 1).skillId, "fire");
  actor.cooldowns.fire = 2;
  assert.notEqual(chooseTeamAutoAction(battle, actor, 1).skillId, "fire");
});
