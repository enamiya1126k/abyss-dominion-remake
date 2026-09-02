import test from "node:test";
import assert from "node:assert/strict";

import {
  migrateLegacyCampaignFinalFlow,
  recoverPendingCampaignFinalFlow,
} from "../src/services/SaveService.js";

const clone = value => structuredClone(value);
const unit = (id, currentHp = 10, currentMp = 5, ailments = []) => ({
  id,
  currentHp,
  currentMp,
  ailments,
});

test("Build304 rescues a schema-73 campaign-final battle and removes the temporary Sairan", () => {
  const state = {
    player: { inRun: true },
    activeBattle: {
      specialBattle: true,
      specialBattleType: "campaignFinal",
      campaignStage: "sairan",
    },
    expeditionSnapshot: { marker: "old-final-checkpoint" },
    monsters: [
      unit("m1", 1, 0, ["burn"]),
      unit("m2", 2, 1),
      null,
      {
        ...unit("old-sairan", 999, 999),
        obtainedMethod: "campaignFinalTemporary",
        campaignFinalTemporary: true,
      },
    ],
    party: ["old-sairan"],
    campaign100: {
      version: 3,
      finalUnlocked: true,
      endings: ["defeat"],
      finalPartyBackup: ["m1", "m2"],
      finalVitals: {
        m1: { hp: 71, mp: 19, ailments: ["poison", "atkUp"] },
        m2: { hp: 52, mp: 11, ailments: [] },
      },
      sairanMonsterId: "old-sairan",
      finalBattleLevel: 100,
      finalStage: "sairan",
      heroCarry: [{ speciesId: "myth_yori", hp: 9 }],
      finalSessionPending: "sairan",
      selectedSairanType: "fortress",
      generalIds: ["m1", "m2"],
    },
  };

  const result = migrateLegacyCampaignFinalFlow(state, 73);

  assert.deepEqual(result, {
    migrated: true,
    recoveredBattle: true,
    recoveredRoster: true,
    restoredParty: ["m1", "m2"],
  });
  assert.deepEqual(state.party, ["m1", "m2"]);
  assert.equal(state.monsters.some(monster => monster?.id === "old-sairan"), false);
  assert.equal(state.monsters.find(monster => monster?.id === "m1").currentHp, 71);
  assert.equal(state.monsters.find(monster => monster?.id === "m1").currentMp, 19);
  assert.deepEqual(
    state.monsters.find(monster => monster?.id === "m1").ailments.map(entry => entry.id),
    ["poison"],
  );
  assert.equal(Object.hasOwn(state, "activeBattle"), false);
  assert.equal(state.expeditionSnapshot, null);
  assert.equal(state.player.inRun, false);
  assert.equal(state.campaign100.finalUnlocked, true, "permanent campaign progress survives rescue");
  assert.deepEqual(state.campaign100.endings, ["defeat"]);
  for (const key of [
    "selectedSairanType",
    "generalIds",
    "sairanMonsterId",
    "finalPartyBackup",
    "finalVitals",
    "finalBattleLevel",
    "finalStage",
    "heroCarry",
    "finalSessionPending",
  ]) assert.equal(Object.hasOwn(state.campaign100, key), false, `${key} must be cleared`);
});

test("Build304 legacy migration does not overwrite an ordinary exploration run", () => {
  const snapshot = { marker: "ordinary-exploration" };
  const state = {
    player: { inRun: true },
    expeditionSnapshot: snapshot,
    monsters: [unit("m1", 13, 7, ["burn"]), unit("m2", 21, 9)],
    party: ["m2"],
    campaign100: {
      finalPartyBackup: ["m1"],
      finalVitals: { m1: { hp: 999, mp: 999, ailments: ["poison"] } },
      finalStage: "party",
    },
  };
  const runtimeBefore = clone({
    player: state.player,
    expeditionSnapshot: state.expeditionSnapshot,
    monsters: state.monsters,
    party: state.party,
  });

  const result = migrateLegacyCampaignFinalFlow(state, 73);

  assert.equal(result.recoveredBattle, false);
  assert.equal(result.recoveredRoster, false);
  assert.deepEqual(
    { player: state.player, expeditionSnapshot: state.expeditionSnapshot, monsters: state.monsters, party: state.party },
    runtimeBefore,
  );
});

test("Build304 migration never hijacks another active special battle", () => {
  const state = {
    player: { inRun: true },
    activeBattle: { specialBattle: true, specialBattleType: "gauntlet", battleId: "gauntlet-7" },
    expeditionSnapshot: { marker: "gauntlet-checkpoint" },
    monsters: [unit("m1", 13, 7), unit("m2", 21, 9)],
    party: ["m2"],
    campaign100: {
      finalSessionPending: "party",
      finalPartyBackup: ["m1"],
      finalVitals: { m1: { hp: 999, mp: 999, ailments: ["poison"] } },
    },
  };
  const runtimeBefore = clone({
    player: state.player,
    activeBattle: state.activeBattle,
    expeditionSnapshot: state.expeditionSnapshot,
    monsters: state.monsters,
    party: state.party,
  });

  const result = migrateLegacyCampaignFinalFlow(state, 73);

  assert.equal(result.recoveredBattle, false);
  assert.equal(result.recoveredRoster, false);
  assert.deepEqual(
    {
      player: state.player,
      activeBattle: state.activeBattle,
      expeditionSnapshot: state.expeditionSnapshot,
      monsters: state.monsters,
      party: state.party,
    },
    runtimeBefore,
  );
});

for (const stage of ["party", "sairan"]) {
  test(`Build304 recovers a schema-74 orphaned ${stage} handoff`, () => {
    const temporary = {
      ...unit("pending-sairan", 999, 999),
      obtainedMethod: "campaignFinalTemporary",
      campaignFinalTemporary: true,
    };
    const state = {
      player: { inRun: true },
      expeditionSnapshot: { marker: `${stage}-handoff` },
      monsters: [unit("m1", 1, 0), unit("m2", 2, 1), null, temporary],
      party: stage === "sairan" ? ["pending-sairan"] : ["m1", "m2"],
      campaign100: {
        finalSessionPending: stage,
        finalStage: stage,
        finalPartyBackup: ["m1", "m2"],
        finalVitals: {
          m1: { hp: 81, mp: 31, ailments: ["poison"] },
          m2: { hp: 72, mp: 22, ailments: [] },
        },
        sairanMonsterId: "pending-sairan",
        heroCarry: [{ speciesId: "myth_enami", hp: 5 }],
      },
    };

    const result = recoverPendingCampaignFinalFlow(state);

    assert.equal(result.recovered, true);
    assert.equal(result.stage, stage);
    assert.deepEqual(result.restoredParty, ["m1", "m2"]);
    assert.deepEqual(state.party, ["m1", "m2"]);
    assert.equal(state.monsters.some(monster => monster?.id === "pending-sairan"), false);
    assert.equal(state.monsters.find(monster => monster?.id === "m1").currentHp, 81);
    assert.equal(state.monsters.find(monster => monster?.id === "m1").currentMp, 31);
    assert.equal(state.expeditionSnapshot, null);
    assert.equal(state.player.inRun, false);
    assert.equal(state.campaign100.finalFlowRecovery.stage, stage);
    for (const key of [
      "sairanMonsterId",
      "finalPartyBackup",
      "finalVitals",
      "finalStage",
      "heroCarry",
      "finalSessionPending",
    ]) assert.equal(Object.hasOwn(state.campaign100, key), false, `${key} must be cleared`);
  });
}

test("Build304 keeps a valid final-battle checkpoint byte-for-byte unchanged", () => {
  const state = {
    player: { inRun: true },
    activeBattle: {
      specialBattle: true,
      specialBattleType: "campaignFinal",
      campaignStage: "sairan",
      battleId: "final-sairan-checkpoint",
      enemies: [{ id: "hero-enami", hp: 1 }],
    },
    expeditionSnapshot: { marker: "final-checkpoint" },
    monsters: [
      unit("m1", 7, 3),
      {
        ...unit("checkpoint-sairan", 444, 55),
        obtainedMethod: "campaignFinalTemporary",
        campaignFinalTemporary: true,
      },
    ],
    party: ["checkpoint-sairan"],
    campaign100: {
      finalSessionPending: "sairan",
      finalStage: "sairan",
      finalPartyBackup: ["m1"],
      finalVitals: { m1: { hp: 33, mp: 14, ailments: [] } },
      sairanMonsterId: "checkpoint-sairan",
    },
  };
  const before = clone(state);

  const result = recoverPendingCampaignFinalFlow(state);

  assert.deepEqual(result, { recovered: false, checkpointReady: true });
  assert.deepEqual(state, before);
});

test("Build304 pending recovery never destroys a different special-battle checkpoint", () => {
  const state = {
    player: { inRun: true },
    activeBattle: { specialBattle: true, specialBattleType: "floorBoss", battleId: "boss-checkpoint" },
    expeditionSnapshot: { marker: "floor-boss-checkpoint" },
    monsters: [unit("m1", 8, 4), unit("m2", 19, 6)],
    party: ["m2"],
    campaign100: {
      finalSessionPending: "party",
      finalStage: "party",
      finalPartyBackup: ["m1"],
      finalVitals: { m1: { hp: 91, mp: 41, ailments: ["poison"] } },
    },
  };
  const before = clone(state);

  const result = recoverPendingCampaignFinalFlow(state);

  assert.equal(result.recovered, false);
  assert.deepEqual(state, before);
});

test("Build304 final-flow migration and recovery tolerate null and malformed remnants", () => {
  assert.deepEqual(migrateLegacyCampaignFinalFlow(null, 73), { migrated: false, recoveredBattle: false });
  assert.deepEqual(recoverPendingCampaignFinalFlow(null), { recovered: false });

  const legacy = {
    player: null,
    monsters: [null, {}, { id: "temp", campaignFinalTemporary: true }],
    party: [null, "missing"],
    campaign100: {
      finalSessionPending: "party",
      finalPartyBackup: [null, "missing", "missing"],
      finalVitals: { missing: null },
      sairanMonsterId: "temp",
    },
  };
  assert.doesNotThrow(() => migrateLegacyCampaignFinalFlow(legacy, 73));

  const pending = {
    player: null,
    monsters: [null, {}, { id: "temp", campaignFinalTemporary: true }],
    party: ["temp"],
    campaign100: {
      finalSessionPending: "sairan",
      finalPartyBackup: [null, "missing"],
      finalVitals: null,
      sairanMonsterId: "temp",
    },
  };
  assert.doesNotThrow(() => recoverPendingCampaignFinalFlow(pending));
  assert.equal(pending.player.inRun, false);
  assert.equal(pending.monsters.some(monster => monster?.id === "temp"), false);
});
