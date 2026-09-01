import test from "node:test";
import assert from "node:assert/strict";

import { RaidCoordinator, raidSnapshot } from "../src/RaidCoordinator.js";

const EPOCH = Date.UTC(2026, 0, 5);

function participant(id = "leader", skills = []) {
  return {
    playerId: id,
    connected: true,
    ready: true,
    profile: {
      displayName: id,
      monsterId: `${id}-monster`,
      monsterName: `${id}魔物`,
      speciesId: "slime",
      attribute: "neutral",
      level: 50,
      battleStats: { hp: 1_000, mp: 100, atk: 300, matk: 280, def: 180, mdef: 170, spd: 120, crit: 0, evasion: 0, accuracy: 120 },
      skills,
    },
  };
}

function setup({ random = () => .1, skills = [] } = {}) {
  let now = EPOCH + 1_000;
  const leader = participant("leader", skills);
  const sessions = new Map([[leader.playerId, leader]]);
  const rewards = [];
  const messages = [];
  const coordinator = new RaidCoordinator({
    now: () => now,
    random,
    sessions,
	    queueReward: (session, reward) => { rewards.push({ playerId: session?.playerId, reward }); return true; },
    broadcast: (_room, message) => messages.push(message),
  });
  const room = {
    roomId: "BUILD258",
    ownerId: leader.playerId,
    leaderId: leader.playerId,
    phase: "lobby",
    members: new Set([leader.playerId]),
    selectedFloor: 300,
    raidProgress: null,
    raid: null,
  };
  assert.equal(coordinator.start(room, leader).ok, true);
  return {
    coordinator,
    room,
    leader,
    rewards,
    messages,
    advanceRound() {
      room.raid.phase = "result";
      room.raid.outcome = null;
      room.raid.nextRoundAt = now;
      now += 1;
      coordinator.advance(room);
    },
  };
}

function configureJuvenile(raid, overrides = {}) {
  raid.weeklyBoss = {
    ...raid.weeklyBoss,
    subBoss: {
      ...raid.weeklyBoss.subBoss,
      respawnDelayRounds: 1,
      maxRespawnsPerAttempt: 2,
      rewardableKillsPerCampaign: 1,
      ...overrides,
    },
  };
  raid.minionRespawnsUsed = 0;
  raid.minionNextRespawnRound = null;
  raid.minionRespawnTargetId = null;
}

function removeJuvenileRules(raid) {
  const subBoss = { ...raid.weeklyBoss.subBoss };
  delete subBoss.respawnDelayRounds;
  delete subBoss.maxRespawnsPerAttempt;
  delete subBoss.rewardableKillsPerCampaign;
  raid.weeklyBoss = { ...raid.weeklyBoss, subBoss };
  raid.minionRespawnsUsed = 0;
  raid.minionNextRespawnRound = null;
  raid.minionRespawnTargetId = null;
}

function directKill(coordinator, room, leader) {
  const raid = room.raid;
  const actor = raid.players[leader.playerId];
  const minion = raid.minions[0];
  minion.hp = 1;
  const events = [];
  coordinator._resolvePlayer(room, raid, actor, { kind: "attack", targetId: actor.playerId, enemyTargetId: minion.id }, leader, events);
  return events;
}

test("build258 direct juvenile KO schedules one-round respawn and exposes explicit snapshot/events", () => {
  const context = setup();
  configureJuvenile(context.room.raid);
  const raid = context.room.raid;
  const minion = raid.minions[0];

  const defeatEvents = directKill(context.coordinator, context.room, context.leader);
  assert.equal(minion.hp, 0, "the defeated juvenile is not restored in the attack resolution");
  assert.equal(raid.minionsDefeated, 1);
  assert.equal(defeatEvents.filter(event => event.kind === "ko" && event.targetId === minion.id).length, 1);
  assert.equal(defeatEvents.some(event => event.kind === "minionRespawnScheduled"), true);
  assert.deepEqual(
    {
      used: raidSnapshot(raid).minionRespawnsUsed,
      due: raidSnapshot(raid).minionNextRespawnRound,
      delay: raidSnapshot(raid).minionRespawnDelayRounds,
      maximum: raidSnapshot(raid).minionMaxRespawns,
    },
    { used: 0, due: 2, delay: 1, maximum: 2 },
  );

  context.advanceRound();
  assert.equal(minion.hp, minion.maxHp);
  assert.equal(raid.minionRespawnsUsed, 1);
  assert.equal(raid.minionNextRespawnRound, null);
  assert.equal(raid.lastEvents.some(event => event.kind === "minionRespawn" && event.targetId === minion.id), true);
  const roundMessage = context.messages.filter(message => message.type === "raidRound").at(-1);
  assert.equal(roundMessage.events.some(event => event.kind === "minionRespawn"), true, "clients receive the respawn as an explicit round event");
});

test("build258 respawn remains single-instance and stops at the per-attempt cap", () => {
  const context = setup();
  configureJuvenile(context.room.raid, { maxRespawnsPerAttempt: 2 });
  const raid = context.room.raid;
  const minion = raid.minions[0];

  directKill(context.coordinator, context.room, context.leader);
  context.advanceRound();
  assert.equal(raid.minions.filter(entry => entry.hp > 0).length, 1);
  directKill(context.coordinator, context.room, context.leader);
  context.advanceRound();
  assert.equal(raid.minions.filter(entry => entry.hp > 0).length, 1);
  assert.equal(raid.minionRespawnsUsed, 2);

  const finalDefeat = directKill(context.coordinator, context.room, context.leader);
  assert.equal(finalDefeat.some(event => event.kind === "minionRespawnScheduled"), false);
  assert.equal(raid.minionNextRespawnRound, null);
  context.advanceRound();
  assert.equal(minion.hp, 0);
  assert.equal(raid.minionsDefeated, 3, "the initial body plus two bounded respawns can be defeated");
  assert.equal(raid.minionRespawnsUsed, 2);
});

test("build258 a main-boss KO cancels a pending juvenile respawn", () => {
  const context = setup();
  configureJuvenile(context.room.raid);
  const raid = context.room.raid;
  const minion = raid.minions[0];
  directKill(context.coordinator, context.room, context.leader);
  assert.equal(raid.minionNextRespawnRound, 2);

  raid.boss.hp = 0;
  raid.progress.hp = 0;
  context.advanceRound();
  assert.equal(raid.outcome, "victory");
  assert.equal(minion.hp, 0);
  assert.equal(raid.minionNextRespawnRound, null);
  assert.equal(raid.lastEvents.some(event => event.kind === "minionRespawn"), false);
});

test("build258 percentage-only and DOT juvenile KOs share the same one-time accounting", () => {
  const percentSkill = { id: "percent", name: "割合", kind: "attack", mp: 0, power: .01, hits: 1, currentHpDamage: .25 };
  const percent = setup({ random: () => .99, skills: [percentSkill] });
  configureJuvenile(percent.room.raid);
  const percentRaid = percent.room.raid;
  const percentActor = percentRaid.players[percent.leader.playerId];
  const percentMinion = percentRaid.minions[0];
  percentActor.stats.accuracy = 20;
  percentMinion.evasion = 75;
  percentMinion.hp = 1;
  const percentEvents = [];
  percent.coordinator._resolvePlayer(percent.room, percentRaid, percentActor, { kind: "skill", skillId: percentSkill.id, targetId: percentActor.playerId, enemyTargetId: percentMinion.id }, percent.leader, percentEvents);
  assert.equal(percentEvents.some(event => event.kind === "miss"), true);
  assert.equal(percentEvents.some(event => event.kind === "damage" && event.label.endsWith("・割合")), true);
  assert.equal(percentRaid.minionsDefeated, 1);
  assert.equal(percentEvents.filter(event => event.kind === "ko" && event.targetId === percentMinion.id).length, 1);

  const dot = setup();
  configureJuvenile(dot.room.raid);
  const dotRaid = dot.room.raid;
  const dotMinion = dotRaid.minions[0];
  dotMinion.hp = 10;
  dotMinion.effects = [{ kind: "status:poison", name: "毒", value: 1, turns: 2, sourcePlayerId: dot.leader.playerId, sourceOwnerId: dot.leader.playerId }];
  dot.advanceRound();
  assert.equal(dotMinion.hp, 0);
  assert.equal(dotRaid.minionsDefeated, 1);
  assert.equal(dotRaid.lastEvents.filter(event => event.kind === "ko" && event.targetId === dotMinion.id).length, 1);
  assert.equal(dotRaid.lastEvents.some(event => event.kind === "minionRespawnScheduled"), true);
  assert.equal(dotRaid.minionNextRespawnRound, 3, "a DOT KO during round transition waits through the following round");
});

test("build258 sub-bosses without respawn fields keep the legacy one-body behavior", () => {
  const context = setup();
  removeJuvenileRules(context.room.raid);
  const raid = context.room.raid;
  const minion = raid.minions[0];
  const events = directKill(context.coordinator, context.room, context.leader);
  assert.equal(events.some(event => event.kind === "minionRespawnScheduled"), false);
  assert.equal(raidSnapshot(raid).minionMaxRespawns, null);
  assert.equal(raidSnapshot(raid).minionNextRespawnRound, null);
  context.advanceRound();
  assert.equal(minion.hp, 0);
  assert.equal(raid.lastEvents.some(event => event.kind === "minionRespawn"), false);
});

test("build258 configured partial reward is fixed and claimable once per campaign and player", () => {
  const context = setup();
  configureJuvenile(context.room.raid, { rewardableKillsPerCampaign: 1 });
  const first = context.room.raid;
  const campaignId = first.progress.campaignId;
  first.minionsDefeated = 3;
  first.contribution[context.leader.playerId].damage = 1;
  first.outcome = "defeat";
  context.coordinator._finish(context.room, first);

  let partial = context.rewards.filter(entry => entry.reward.source.kind === "raidJuvenile");
  assert.equal(partial.length, 1);
  assert.equal(partial[0].reward.rewardId, `${campaignId}:juvenile:${context.leader.playerId}`);
  assert.deepEqual(
    { gold: partial[0].reward.reward.gold, experience: partial[0].reward.reward.experience, raidMaterials: partial[0].reward.reward.raidMaterials },
    { gold: 18_000, experience: 1_200, raidMaterials: 3 },
    "respawn kills do not multiply the fixed anti-farm package",
  );
  assert.equal(context.room.raidProgress.juvenileRewardClaimedBy[context.leader.playerId], true);

  context.leader.ready = true;
  assert.equal(context.coordinator.start(context.room, context.leader).ok, true);
  configureJuvenile(context.room.raid, { rewardableKillsPerCampaign: 1 });
  assert.equal(raidSnapshot(context.room.raid).progress.juvenileRewardClaimedBy[context.leader.playerId], true, "claim state survives attempt snapshots and resume");
  context.room.raid.minionsDefeated = 2;
  context.room.raid.outcome = "defeat";
  context.coordinator._finish(context.room, context.room.raid);
  partial = context.rewards.filter(entry => entry.reward.source.kind === "raidJuvenile");
  assert.equal(partial.length, 1, "a failed retry in the same campaign cannot farm the juvenile package");
});

test("build258 leaves the juvenile reward unclaimed when durable reward queuing fails", () => {
  const context = setup();
  configureJuvenile(context.room.raid, { rewardableKillsPerCampaign: 1 });
  const campaignId = context.room.raid.progress.campaignId;
  context.coordinator.queueReward = () => false;
  context.room.raid.minionsDefeated = 1;
  context.room.raid.contribution[context.leader.playerId].damage = 1;
  context.room.raid.outcome = "defeat";
  context.coordinator._finish(context.room, context.room.raid);
  assert.equal(context.room.raidProgress.juvenileRewardClaimedBy[context.leader.playerId], undefined);

  context.leader.ready = true;
	  context.coordinator.queueReward = (session, reward) => { context.rewards.push({ playerId: session?.playerId, reward }); return true; };
  assert.equal(context.coordinator.start(context.room, context.leader).ok, true);
  configureJuvenile(context.room.raid, { rewardableKillsPerCampaign: 1 });
  context.room.raid.minionsDefeated = 1;
  context.room.raid.contribution[context.leader.playerId].damage = 1;
  context.room.raid.outcome = "defeat";
  context.coordinator._finish(context.room, context.room.raid);
  assert.equal(context.rewards.filter(entry => entry.reward.rewardId === `${campaignId}:juvenile:${context.leader.playerId}`).length, 1);
  assert.equal(context.room.raidProgress.juvenileRewardClaimedBy[context.leader.playerId], true);
});

test("build258 an unconfigured sub-boss retains the legacy per-attempt multiplied partial reward", () => {
  const context = setup();
  removeJuvenileRules(context.room.raid);
  const raid = context.room.raid;
  raid.minionsDefeated = 2;
  raid.contribution[context.leader.playerId].damage = 1;
  raid.outcome = "defeat";
  context.coordinator._finish(context.room, raid);
  const partial = context.rewards.find(entry => entry.reward.source.kind === "raidJuvenile");
  assert.equal(partial.reward.rewardId, `${raid.id}:juvenile:${context.leader.playerId}`);
  assert.deepEqual(
    { gold: partial.reward.reward.gold, experience: partial.reward.reward.experience, raidMaterials: partial.reward.reward.raidMaterials },
    { gold: 36_000, experience: 2_400, raidMaterials: 6 },
  );
});
