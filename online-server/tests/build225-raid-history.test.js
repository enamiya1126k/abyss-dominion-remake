import test from "node:test";
import assert from "node:assert/strict";
import { RaidCoordinator } from "../src/RaidCoordinator.js";

function session(playerId, displayName) {
  return {
    playerId,
    connected: true,
    ready: true,
    profile: {
      displayName,
      speciesId: "slime",
      battleStats: { hp: 1_000, mp: 80, atk: 400, matk: 350, def: 220, mdef: 210, spd: 90, crit: 5, evasion: 3, accuracy: 100 },
      skills: [],
    },
  };
}

test("build225 raid history ranks departed contributors without rewarding them again", () => {
  const leader = session("leader", "Leader");
  const departed = session("departed", "Departed");
  const historical = session("historical", "Historical");
  const sessions = new Map([leader, departed, historical].map(entry => [entry.playerId, entry]));
  const rewards = [];
  const messages = [];
  const coordinator = new RaidCoordinator({
    now: () => 10_000,
    random: () => .5,
    sessions,
    queueReward: (recipient, reward) => rewards.push({ playerId: recipient.playerId, reward }),
    broadcast: (_room, message) => messages.push(message),
  });
  const room = {
    roomId: "RAID-HISTORY",
    ownerId: leader.playerId,
    leaderId: leader.playerId,
    phase: "lobby",
    members: new Set([leader.playerId, departed.playerId]),
    selectedFloor: 150,
    raidProgress: {
      campaignId: "campaign-history",
      maxHp: 50_000,
      hp: 1,
      attempts: 2,
      totalDamage: 49_999,
      milestonesClaimed: [5, 10, 25, 50, 75],
      lastAttemptAt: 5_000,
      contribution: {
        historical: { damage: 30_000, healing: 25 },
        departed: { damage: 12_000 },
      },
    },
  };

  assert.equal(coordinator.start(room, leader).ok, true);
  assert.deepEqual(room.raid.contribution.historical, { damage: 30_000, healing: 25 }, "start retains nonmember history unchanged");
  assert.equal(room.raid.contribution.leader.damage, 0, "start initializes the current member missing from history");

  coordinator.playerLeft(room, departed.playerId);
  assert.equal(room.raid.players[departed.playerId], undefined);
  assert.equal(room.raid.contribution[departed.playerId].damage, 12_000, "leaving does not erase cumulative contribution");

  const raid = room.raid;
  raid.outcome = "victory";
  coordinator._finish(room, raid);

  assert.deepEqual(raid.ranking.map(entry => entry.playerId), [historical.playerId, departed.playerId, leader.playerId]);
  assert.deepEqual(raid.progress.ranking.map(entry => entry.playerId), [historical.playerId, departed.playerId, leader.playerId]);
  assert.deepEqual(raid.progress.contribution.historical, { damage: 30_000, healing: 25 }, "saved progress keeps the nonparticipant ledger entry");
  assert.deepEqual(rewards.map(entry => entry.playerId), [leader.playerId], "only a current raid player receives the victory reward");
  const ended = messages.find(message => message.type === "raidEnded");
  assert.deepEqual(ended.ranking.map(entry => entry.playerId), [historical.playerId, departed.playerId, leader.playerId]);
  assert.deepEqual(ended.raid.progress.contribution.historical, { damage: 30_000, healing: 25, score: 30_017 });
});

test("build225 partial raid rewards exclude historical and departed contributors", () => {
  const leader = session("leader", "Leader"), departed = session("departed", "Departed"), historical = session("historical", "Historical"), rewards = [];
  const sessions = new Map([leader, departed, historical].map(entry => [entry.playerId, entry]));
  const coordinator = new RaidCoordinator({
    now: () => 20_000,
    random: () => .5,
    sessions,
    queueReward: (recipient, reward) => rewards.push({ playerId: recipient.playerId, reward }),
  });
  const room = {
    roomId: "RAID-PARTIAL-HISTORY",
    ownerId: leader.playerId,
    leaderId: leader.playerId,
    phase: "lobby",
    members: new Set([leader.playerId, departed.playerId]),
    selectedFloor: 150,
    raidProgress: {
      campaignId: "campaign-partial-history",
      maxHp: 50_000,
      hp: 25_000,
      attempts: 1,
      totalDamage: 25_000,
      milestonesClaimed: [5, 10, 25, 50],
      contribution: { historical: { damage: 20_000 }, departed: { damage: 5_000 } },
    },
  };
  assert.equal(coordinator.start(room, leader).ok, true);
  coordinator.playerLeft(room, departed.playerId);
  room.raid.minionsDefeated = 2;
  room.raid.outcome = "defeat";
  coordinator._finish(room, room.raid);
  assert.deepEqual(rewards.map(entry => entry.playerId), [leader.playerId]);
  assert.equal(rewards[0].reward.source.kind, "raidJuvenile");
});
