import test from "node:test";
import assert from "node:assert/strict";
import { RaidCoordinator, isLegacyOneHpRaidCompletion, isLegacyOneHpRaidProgress } from "../src/RaidCoordinator.js";
import { weeklyRaidState } from "../src/WeeklyRaidCatalog.js";

const EPOCH = Date.UTC(2026, 0, 5);

function monster(owner, index, overrides = {}) {
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
    attribute: "neutral",
    battleStats: { hp: 1_000, mp: 100, atk: 200 + index, matk: 180, def: 150, mdef: 140, spd: 100 + index, crit: 5, evasion: 0, accuracy: 120 },
    circleEffect: "none",
    circleName: "魔法陣なし",
    circleLevel: 0,
    skills: [{ id: `strike-${index}`, name: `攻撃${index}`, kind: "attack", mp: 5, power: 1, hits: 1 }],
    ...overrides,
  };
}

function participant(index, rosterSize = 4, { legacy = false } = {}) {
  const playerId = `RAID-PLAYER-${index}`;
  const primary = monster(`冒険者${index}`, 1);
  return {
    playerId,
    connected: true,
    ready: true,
    profile: {
      ...primary,
      displayName: `冒険者${index}`,
      ...(legacy ? {} : { battleRoster: Array.from({ length: rosterSize }, (_, offset) => monster(`冒険者${index}`, offset + 1)) }),
    },
  };
}

function setup(count = 1, rosterSize = 4) {
  let now = EPOCH + 1_000;
  const members = Array.from({ length: count }, (_, offset) => participant(offset + 1, rosterSize));
  const sessions = new Map(members.map(member => [member.playerId, member]));
  const rewards = [];
  const messages = [];
  const coordinator = new RaidCoordinator({
    now: () => now,
    random: () => .1,
    sessions,
    queueReward: (session, reward) => rewards.push({ playerId: session?.playerId, reward }),
    broadcast: (_room, message) => messages.push(message),
  });
  const room = {
    roomId: "RAID248",
    ownerId: members[0].playerId,
    leaderId: members[0].playerId,
    phase: "lobby",
    members: new Set(members.map(member => member.playerId)),
    selectedFloor: 300,
    raidProgress: null,
    raid: null,
  };
  return { coordinator, room, members, sessions, rewards, messages, setNow(value) { now = value; } };
}

function progress(overrides = {}) {
  const weekly = weeklyRaidState(EPOCH + 1_000);
  return {
    campaignId: "saved-campaign",
    weekId: weekly.weekId,
    weekStartsAt: weekly.startsAt,
    weekEndsAt: weekly.endsAt,
    bossId: weekly.boss.id,
    modifierId: weekly.modifier.id,
    maxHp: weekly.boss.maxHp,
    hp: weekly.boss.maxHp,
    attempts: 0,
    totalDamage: 0,
    milestonesClaimed: [],
    personalMilestonesClaimed: {},
    lastAttemptAt: 0,
    completedAt: 0,
    contribution: {},
    ranking: [],
    ...overrides,
  };
}

test("legacy imported 1 HP fingerprint is repaired to a fresh full-health weekly raid", () => {
  const { coordinator, room, members } = setup(1, 1);
  room.raidProgress = progress({
    hp: 1,
    totalDamage: 49_999,
    contribution: { [members[0].playerId]: { damage: 0, taken: 0, healing: 0, mpHealing: 0, revives: 0, guards: 0, support: 0 } },
  });
  assert.equal(isLegacyOneHpRaidProgress(room.raidProgress, weeklyRaidState(EPOCH + 1_000)), true);
  room.raidProgress.contribution[members[0].playerId].damage = 12_500;
  assert.equal(isLegacyOneHpRaidProgress(room.raidProgress, weeklyRaidState(EPOCH + 1_000)), true, "minor-only damage after the bad import is still repairable");
  const oldCampaign = room.raidProgress.campaignId;
  const result = coordinator.start(room, members[0]);
  assert.equal(result.ok, true);
  assert.equal(room.raid.boss.hp, 50_000);
  assert.equal(room.raid.progress.hp, 50_000);
  assert.equal(room.raid.progress.totalDamage, 0);
  assert.equal(room.raid.progress.attempts, 1);
  assert.notEqual(room.raid.progress.campaignId, oldCampaign);
});

test("a legitimate current-week raid retained at 1 HP is never reset", () => {
  const { coordinator, room, members } = setup(1, 1);
  room.raidProgress = progress({
    hp: 1,
    totalDamage: 49_999,
    attempts: 3,
    milestonesClaimed: [5, 10, 25, 50, 75],
    contribution: { [members[0].playerId]: { damage: 49_999, taken: 100, healing: 0, mpHealing: 0, revives: 0, guards: 0, support: 0 } },
  });
  assert.equal(isLegacyOneHpRaidProgress(room.raidProgress, weeklyRaidState(EPOCH + 1_000)), false);
  assert.equal(coordinator.start(room, members[0]).ok, true);
  assert.equal(room.raid.boss.hp, 1);
  assert.equal(room.raid.progress.campaignId, "saved-campaign");
  assert.equal(room.raid.progress.attempts, 4);
});

test("a completed derivative of the old 1 HP receipt is repaired but a genuine clear stays cleared", () => {
  {
    const { coordinator, room, members } = setup(1, 1);
    room.raidProgress = progress({
      hp: 0,
      totalDamage: 50_000,
      completedAt: EPOCH + 500,
      milestonesClaimed: [5, 10, 25, 50, 75, 100],
      contribution: { [members[0].playerId]: { damage: 1, taken: 0, healing: 0, mpHealing: 0, revives: 0, guards: 0, support: 0 } },
    });
    assert.equal(isLegacyOneHpRaidCompletion(room.raidProgress, weeklyRaidState(EPOCH + 1_000)), true);
    assert.equal(coordinator.start(room, members[0]).ok, true);
    assert.equal(room.raid.progress.hp, 50_000);
    assert.equal(room.raid.progress.completedAt, 0);
  }
  {
    const { coordinator, room, members } = setup(1, 1);
    room.raidProgress = progress({ hp: 0, totalDamage: 50_000, completedAt: EPOCH + 500, contribution: { [members[0].playerId]: { damage: 50_000 } } });
    assert.equal(isLegacyOneHpRaidCompletion(room.raidProgress, weeklyRaidState(EPOCH + 1_000)), false);
    assert.equal(coordinator.start(room, members[0]).code, "WEEKLY_RAID_CLEARED");
  }
});

test("stale, completed, and fully reset progress remain distinct", () => {
  {
    const { coordinator, room, members } = setup(1, 1);
    room.raidProgress = progress({ weekId: "weekly-stale", hp: 1, totalDamage: 49_999 });
    assert.equal(coordinator.start(room, members[0]).ok, true);
    assert.equal(room.raid.boss.hp, 50_000);
  }
  {
    const { coordinator, room, members } = setup(1, 1);
    room.raidProgress = progress({ hp: 0, totalDamage: 50_000, completedAt: EPOCH + 500, contribution: { [members[0].playerId]: { damage: 50_000 } } });
    const result = coordinator.start(room, members[0]);
    assert.equal(result.ok, false);
    assert.equal(result.code, "WEEKLY_RAID_CLEARED");
  }
  {
    const { coordinator, room, members } = setup(1, 1);
    room.raidProgress = null;
    assert.equal(coordinator.start(room, members[0]).ok, true);
    assert.equal(room.raid.progress.hp, 50_000);
    assert.equal(room.raid.progress.totalDamage, 0);
  }
});

test("raid allocates at most four actors globally while preserving one slot per participant", () => {
  const expected = new Map([[1, [4]], [2, [2, 2]], [3, [2, 1, 1]], [4, [1, 1, 1, 1]]]);
  for (const [count, allocation] of expected) {
    const { coordinator, room, members } = setup(count, 4);
    const result = coordinator.start(room, members[0]);
    assert.equal(result.ok, true);
    assert.equal(result.raid.players.length, 4);
    assert.deepEqual(members.map(member => result.raid.players.filter(actor => actor.ownerPlayerId === member.playerId).length), allocation);
    for (const actor of result.raid.players) {
      assert.equal(actor.playerId, actor.combatantId);
      assert.equal(typeof actor.ownerPlayerId, "string");
      assert.equal(typeof actor.monsterId, "string");
      assert.equal(Number.isInteger(actor.rosterIndex), true);
      assert.equal(typeof actor.isPrimary, "boolean");
      assert.equal(Object.hasOwn(actor, "stats"), false);
      assert.equal(Object.hasOwn(actor, "skills"), false);
    }
  }
});

test("explicit and omitted actorId commands use each actor's own skills and aggregate contribution by owner", () => {
  const { coordinator, room, members } = setup(1, 4);
  assert.equal(coordinator.start(room, members[0]).ok, true);
  const ownerId = members[0].playerId;
  const actorIds = Object.keys(room.raid.players);
  assert.deepEqual(actorIds, [ownerId, `${ownerId}:m2`, `${ownerId}:m3`, `${ownerId}:m4`]);

  const second = `${ownerId}:m2`;
  let result = coordinator.action(room, members[0], { actorId: second, kind: "skill", skillId: "strike-2", enemyTargetId: room.raid.boss.id });
  assert.equal(result.ok, true);
  assert.equal(room.raid.actions[second].actorId, second);
  assert.equal(coordinator.action(room, members[0], { actorId: second, kind: "attack" }).duplicate, true);

  result = coordinator.action(room, members[0], { kind: "attack", enemyTargetId: room.raid.boss.id });
  assert.equal(result.ok, true);
  assert.equal(room.raid.actions[ownerId].actorId, ownerId);
  result = coordinator.action(room, members[0], { kind: "attack", enemyTargetId: room.raid.boss.id });
  assert.equal(result.ok, true);
  assert.equal(room.raid.actions[`${ownerId}:m3`].actorId, `${ownerId}:m3`);
  result = coordinator.action(room, members[0], { kind: "attack", enemyTargetId: room.raid.boss.id });
  assert.equal(result.ok, true);
  assert.equal(room.raid.phase, "result");
  assert.equal(room.raid.players[second].mp, 95);
  assert.deepEqual(Object.keys(room.raid.contribution), [ownerId]);
  assert.ok(room.raid.contribution[ownerId].damage > 0);
  assert.equal(result.raid.actions[second].actorId, second);
});

test("an owner cannot command another participant's actor and leaving removes every owned actor", () => {
  const { coordinator, room, members } = setup(2, 4);
  assert.equal(coordinator.start(room, members[0]).ok, true);
  const foreign = Object.values(room.raid.players).find(actor => actor.ownerPlayerId === members[1].playerId);
  assert.equal(coordinator.action(room, members[0], { actorId: foreign.playerId, kind: "attack" }).code, "BAD_ACTOR");
  coordinator.playerLeft(room, members[0].playerId);
  assert.equal(Object.values(room.raid.players).some(actor => actor.ownerPlayerId === members[0].playerId), false);
  assert.equal(Object.values(room.raid.players).every(actor => actor.ownerPlayerId === members[1].playerId), true);
});

test("connected owner controls all actors, disconnected owner receives actor-specific auto actions", () => {
  const { coordinator, room, members } = setup(1, 4);
  assert.equal(coordinator.start(room, members[0]).ok, true);
  coordinator.advance(room);
  assert.equal(Object.keys(room.raid.actions).length, 0);
  members[0].connected = false;
  coordinator.advance(room);
  assert.equal(room.raid.phase, "result");
  assert.equal(Object.keys(room.raid.actions).length, 4);
  for (const [actorId, action] of Object.entries(room.raid.actions)) assert.equal(action.actorId, actorId);
});

test("damage received by an extra actor is recorded on its owner ledger", () => {
  const { coordinator, room, members } = setup(1, 4);
  assert.equal(coordinator.start(room, members[0]).ok, true);
  const ownerId = members[0].playerId;
  const extra = room.raid.players[`${ownerId}:m2`];
  coordinator._damagePlayer(room.raid, room.raid.minions[0], extra, 100, [], "test");
  assert.equal(room.raid.contribution[ownerId].taken, 100);
  assert.equal(room.raid.contribution[extra.playerId], undefined);
});

test("milestone and final rewards are queued once per owner with deployed-roster EXP", () => {
  const { coordinator, room, members, rewards } = setup(1, 4);
  assert.equal(coordinator.start(room, members[0]).ok, true);
  const raid = room.raid;
  raid.progress.hp = raid.progress.maxHp * .95;
  raid.boss.hp = raid.progress.hp;
  coordinator._awardMilestones(room, raid, []);
  const milestone = rewards.filter(entry => entry.reward.source.kind === "raidMilestone");
  assert.equal(milestone.length, 1);
  assert.equal(milestone[0].reward.reward.experienceRoster.length, 4);
  assert.ok(milestone[0].reward.reward.experienceRoster.every(entry => entry.experience === milestone[0].reward.reward.experience));
  assert.equal(milestone[0].reward.source.monsterId, `${members[0].profile.displayName}-monster-1`);

  raid.contribution[members[0].playerId].damage = raid.progress.maxHp;
  raid.boss.hp = 0;
  raid.progress.hp = 0;
  raid.outcome = "victory";
  coordinator._finish(room, raid);
  const final = rewards.filter(entry => entry.reward.source.kind === "raid");
  assert.equal(final.length, 1);
  assert.equal(final[0].reward.reward.experienceRoster.length, 4);
  assert.equal(new Set(final[0].reward.reward.experienceRoster.map(entry => entry.monsterId)).size, 4);
});

test("personal and juvenile rewards also carry deployed-roster EXP once per owner", () => {
  {
    const { coordinator, room, members, rewards } = setup(1, 4);
    assert.equal(coordinator.start(room, members[0]).ok, true);
    room.raid.contribution[members[0].playerId].damage = 2_500;
    coordinator._awardPersonalMilestones(room, room.raid, []);
    const personal = rewards.filter(entry => entry.reward.source.kind === "raidPersonal");
    assert.equal(personal.length, 1);
    assert.equal(personal[0].reward.reward.experienceRoster.length, 4);
  }
  {
    const { coordinator, room, members, rewards } = setup(1, 4);
    assert.equal(coordinator.start(room, members[0]).ok, true);
    room.raid.minionsDefeated = 1;
    room.raid.outcome = "defeat";
    coordinator._finish(room, room.raid);
    const juvenile = rewards.filter(entry => entry.reward.source.kind === "raidJuvenile");
    assert.equal(juvenile.length, 1);
    assert.equal(juvenile[0].reward.reward.experienceRoster.length, 4);
  }
});
