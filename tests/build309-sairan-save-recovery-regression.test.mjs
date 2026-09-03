import test from "node:test";
import assert from "node:assert/strict";

import {
  SaveService,
  recoverPendingCampaignFinalFlow,
} from "../src/services/SaveService.js";

const memory = new Map();
globalThis.localStorage = {
  getItem(key) { return memory.has(key) ? memory.get(key) : null; },
  setItem(key, value) { memory.set(key, String(value)); },
  removeItem(key) { memory.delete(key); },
  clear() { memory.clear(); },
};

const clone = value => structuredClone(value);

function fullMonster(source, id, overrides = {}) {
  return {
    ...clone(source),
    id,
    nickname: id,
    currentHp: 1,
    currentMp: 0,
    ailments: [],
    ...overrides,
  };
}

test("Build309 migrates a valid schema-75 Sairan checkpoint back to the original party", () => {
  memory.clear();
  const service = new SaveService();
  const state = clone(service.state);
  const template = state.monsters[0];
  const party = [1, 2, 3, 4].map(index => fullMonster(template, `party-${index}`));
  const legitimateDominion = fullMonster(template, "legitimate-dominion", {
    speciesId: "abyss_dominion",
    obtainedMethod: "capture",
  });
  const idOnlySairan = fullMonster(template, "legacy-sairan", {
    speciesId: "abyss_dominion",
    obtainedMethod: "capture",
  });
  const markedSairan = fullMonster(template, "stale-sairan", {
    speciesId: "abyss_dominion",
    obtainedMethod: "campaignFinalTemporary",
    campaignFinalTemporary: true,
  });

  state.schemaVersion = 75;
  state.appVersion = "3.0.8";
  state.monsters = [...party, legitimateDominion, idOnlySairan, markedSairan];
  state.party = [idOnlySairan.id];
  state.player.inRun = true;
  state.expeditionSnapshot = { marker: "schema-75-sairan-final" };
  state.activeBattle = {
    specialBattle: true,
    specialBattleType: "campaignFinal",
    campaignStage: "sairan",
    enemies: [{ id: "hero-enami", speciesId: "myth_enami", hp: 123 }],
  };
  state.campaign100 = {
    ...state.campaign100,
    finalUnlocked: true,
    finalCompleted: false,
    endings: ["defeat"],
    floors: { ...state.campaign100.floors, 100: { bossDefeated: true, cleared: true } },
    finalPartyBackup: party.map(monster => monster.id),
    finalVitals: {
      "party-1": { hp: 7, mp: 3, ailments: ["poison", "atkUp"] },
      "party-2": { hp: 6, mp: 2, ailments: [] },
      "party-3": { hp: 5, mp: 1, ailments: [] },
      "party-4": { hp: 4, mp: 0, ailments: [] },
    },
    sairanMonsterId: idOnlySairan.id,
    finalBattleLevel: 100,
    finalStage: "sairan",
    finalSessionPending: "sairan",
    heroCarry: [{ speciesId: "myth_enami", hp: 123 }],
  };

  const migrated = service.migrate(state);

  assert.deepEqual(migrated.party, party.map(monster => monster.id));
  assert.equal(migrated.monsters.some(monster => monster.id === idOnlySairan.id), false, "the explicit legacy Sairan ID is temporary even without a marker");
  assert.equal(migrated.monsters.some(monster => monster.id === markedSairan.id), false, "marked temporary Sairan must be removed");
  assert.equal(migrated.monsters.some(monster => monster.id === legitimateDominion.id), true, "a legitimate abyss_dominion is unrelated and must survive");
  assert.equal(migrated.monsters.find(monster => monster.id === "party-1").currentHp, 7);
  assert.equal(migrated.monsters.find(monster => monster.id === "party-1").currentMp, 3);
  assert.deepEqual(migrated.monsters.find(monster => monster.id === "party-1").ailments.map(entry => entry.id), ["poison"]);
  assert.equal(Object.hasOwn(migrated, "activeBattle"), false);
  assert.equal(migrated.expeditionSnapshot, null);
  assert.equal(migrated.player.inRun, false);
  assert.equal(migrated.campaign100.finalUnlocked, true);
  assert.equal(migrated.campaign100.finalCompleted, false);
  assert.deepEqual(migrated.campaign100.endings, ["defeat"]);
  assert.equal(migrated.campaign100.floors[100].bossDefeated, true);
  assert.deepEqual(migrated.campaign100.finalFlowRecovery, {
    version: 2,
    stage: "sairan",
    reason: "sairan-story-only",
    recoveredAt: migrated.campaign100.finalFlowRecovery.recoveredAt,
  });
  assert.equal(migrated.campaign100.sairanMonsterId ?? null, null);
  assert.deepEqual(migrated.campaign100.heroCarry ?? [], []);
  assert.deepEqual(migrated.campaign100.finalPartyBackup ?? [], []);
  assert.deepEqual(migrated.campaign100.finalVitals ?? {}, {});
  assert.equal(migrated.campaign100.finalBattleLevel ?? null, null);
  assert.equal(migrated.campaign100.finalStage ?? null, null);
  assert.equal(migrated.campaign100.finalSessionPending ?? null, null);
});

test("Build309 keeps a valid current-party final checkpoint byte-for-byte unchanged", () => {
  const state = {
    player: { inRun: true },
    expeditionSnapshot: { marker: "party-final" },
    monsters: [{ id: "m1" }, { id: "m2" }, { id: "m3" }, { id: "m4" }],
    party: ["m1", "m2", "m3", "m4"],
    activeBattle: {
      specialBattle: true,
      specialBattleType: "campaignFinal",
      campaignStage: "party",
      enemies: [{ id: "hero-1", hp: 10 }],
    },
    campaign100: {
      finalUnlocked: true,
      finalSessionPending: "party",
      finalStage: "party",
      finalPartyBackup: ["m1", "m2", "m3", "m4"],
      finalVitals: { m1: { hp: 9, mp: 2, ailments: [] } },
    },
  };
  const before = clone(state);

  assert.deepEqual(recoverPendingCampaignFinalFlow(state), { recovered: false, checkpointReady: true });
  assert.deepEqual(state, before);
});

test("Build309 does not disturb an unrelated live special battle", () => {
  const state = {
    player: { inRun: true },
    expeditionSnapshot: { marker: "gauntlet" },
    monsters: [
      { id: "m1" },
      { id: "legacy-sairan", obtainedMethod: "campaignFinalTemporary", campaignFinalTemporary: true },
    ],
    party: ["m1"],
    activeBattle: {
      specialBattle: true,
      specialBattleType: "gauntlet",
      enemies: [{ id: "trial-enemy", hp: 10 }],
    },
    campaign100: {
      finalSessionPending: "sairan",
      finalPartyBackup: ["m1"],
      sairanMonsterId: "legacy-sairan",
    },
  };
  const before = clone(state);

  assert.deepEqual(recoverPendingCampaignFinalFlow(state), { recovered: false, protectedBattle: true });
  assert.deepEqual(state, before);
});

test("Build309 uses legitimate monsters as a safe fallback when the old backup is corrupt", () => {
  const state = {
    player: { inRun: true },
    expeditionSnapshot: { marker: "broken-backup" },
    monsters: [
      { id: "normal-1", speciesId: "slime" },
      { id: "normal-dominion", speciesId: "abyss_dominion", obtainedMethod: "capture" },
      { id: "temp", speciesId: "abyss_dominion", campaignFinalTemporary: true },
    ],
    party: ["temp"],
    activeBattle: {
      specialBattle: true,
      specialBattleType: "campaignFinal",
      campaignStage: "sairan",
      enemies: [{ id: "hero", hp: 1 }],
    },
    campaign100: {
      finalUnlocked: true,
      finalPartyBackup: ["missing"],
      finalVitals: { missing: null },
      sairanMonsterId: "temp",
      finalStage: "sairan",
    },
  };

  const result = recoverPendingCampaignFinalFlow(state);

  assert.equal(result.recovered, true);
  assert.deepEqual(state.party, ["normal-1", "normal-dominion"]);
  assert.deepEqual(state.monsters.map(monster => monster.id), ["normal-1", "normal-dominion"]);
  assert.equal(Object.hasOwn(state, "activeBattle"), false);
  assert.equal(state.player.inRun, false);
  assert.equal(state.campaign100.finalUnlocked, true);
});
