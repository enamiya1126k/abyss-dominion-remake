import test from "node:test";
import assert from "node:assert/strict";
import {
  createTeamBattleEncounter,
  teamBattleRewardPreview,
  teamBattleStageMultiplier,
} from "../src/core/EndgameSystem.js";
import { FLOOR_BOSS_CATALOG } from "../src/data/floorBosses.js";

test("build301 4v4 difficulty is monotonic without a stage-50 cliff", () => {
  const stages = [1, 2, 49, 50, 51, 100];
  let previous = 0;
  for (const stage of stages) {
    const value = teamBattleStageMultiplier(stage);
    assert.ok(value > previous, `difficulty must rise at stage ${stage}`);
    previous = value;
  }
  assert.ok(teamBattleStageMultiplier(50) / teamBattleStageMultiplier(49) < 1.15);
  assert.ok(teamBattleStageMultiplier(51) / teamBattleStageMultiplier(50) < 1.15);
});

test("build301 4v4 rewards stay useful and bounded", () => {
  assert.deepEqual(
    { gold: teamBattleRewardPreview(1).goldMultiplier, crystals: teamBattleRewardPreview(1).crystals },
    { gold: .5, crystals: 25 },
  );
  assert.deepEqual(
    { gold: teamBattleRewardPreview(50).goldMultiplier, crystals: teamBattleRewardPreview(50).crystals },
    { gold: 1.84, crystals: 48 },
  );
  assert.deepEqual(
    { gold: teamBattleRewardPreview(100).goldMultiplier, crystals: teamBattleRewardPreview(100).crystals },
    { gold: 3.27, crystals: 64 },
  );
  for (let stage = 2; stage <= 200; stage++) {
    assert.ok(teamBattleRewardPreview(stage).goldMultiplier >= teamBattleRewardPreview(stage - 1).goldMultiplier);
    assert.ok(teamBattleRewardPreview(stage).crystals >= teamBattleRewardPreview(stage - 1).crystals);
  }
});

test("build301 live 4v4 encounter uses the shared difficulty curve", () => {
  const discovered = Object.fromEntries(FLOOR_BOSS_CATALOG.map(boss => [boss.id, true]));
  const state = {
    player: { maxFloor: 100 },
    floorBossChallenges: { discovered },
    endgame: { teamBattle: { stage: 50, dailyAttempts: 0, totalWins: 0, totalLosses: 0 } },
  };
  const encounter = createTeamBattleEncounter(state);
  assert.equal(encounter.length, 4);
  assert.equal(encounter[0].statMultiplier, teamBattleStageMultiplier(50));
  assert.equal(encounter[1].statMultiplier, .7 * teamBattleStageMultiplier(50));
});
