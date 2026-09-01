import test from "node:test";
import assert from "node:assert/strict";

import { WEEKLY_RAID_BOSSES, raidBossById, weeklyRaidState } from "../src/WeeklyRaidCatalog.js";

test("build258 Amalga catalog grants the dedicated juvenile species and bounded respawn contract", () => {
  const boss = raidBossById("abyss-amalga");
  assert.equal(boss.contractSpeciesId, "juvenile_amalga");
  assert.equal(boss.contractVisualBase, "./assets/online/raid/juvenile-amalga");
  assert.equal(boss.subBoss.id, "juvenile-amalga");
  assert.equal(boss.subBoss.respawnDelayRounds, 1);
  assert.equal(boss.subBoss.maxRespawnsPerAttempt, 2);
  assert.equal(boss.subBoss.rewardableKillsPerCampaign, 1);
  assert.equal(WEEKLY_RAID_BOSSES.filter(entry => entry.subBoss?.maxRespawnsPerAttempt != null).length, 1, "only Amalga enables the repeatable juvenile role");
});

test("build258 weekly raid snapshots preserve juvenile identity and respawn settings", () => {
  const snapshot = weeklyRaidState(Date.UTC(2026, 0, 5));
  assert.equal(snapshot.boss.id, "abyss-amalga");
  assert.equal(snapshot.boss.contractSpeciesId, "juvenile_amalga");
  assert.deepEqual({
    delay: snapshot.boss.subBoss.respawnDelayRounds,
    maximum: snapshot.boss.subBoss.maxRespawnsPerAttempt,
    rewarded: snapshot.boss.subBoss.rewardableKillsPerCampaign,
  }, { delay: 1, maximum: 2, rewarded: 1 });
  assert.notEqual(snapshot.boss.subBoss, raidBossById("abyss-amalga").subBoss, "callers receive a detached snapshot");
});
