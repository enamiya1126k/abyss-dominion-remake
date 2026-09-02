import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  safeCurrencyGrant,
  teamBattleRewardEntitlements,
  teamBattleRewardPreview,
} from "../src/core/EndgameSystem.js";

test("build305 keeps the first 4v4 reward useful", () => {
  const reward = teamBattleRewardPreview(1);
  assert.deepEqual(
    {
      goldMultiplier: reward.goldMultiplier,
      crystals: reward.crystals,
      experienceMultiplier: reward.experienceMultiplier,
      guaranteedRarity: reward.guaranteedRarity,
    },
    {
      goldMultiplier: 0.5,
      crystals: 25,
      experienceMultiplier: 1,
      guaranteedRarity: null,
    },
  );
});

test("build305 4v4 rewards are monotonic and economically capped through stage 10000", () => {
  let previous = teamBattleRewardPreview(1);

  for (let stage = 1; stage <= 10_000; stage++) {
    const reward = teamBattleRewardPreview(stage);

    assert.ok(Number.isFinite(reward.goldMultiplier), `stage ${stage} GOLD multiplier must be finite`);
    assert.ok(Number.isFinite(reward.crystals), `stage ${stage} crystals must be finite`);
    assert.ok(Number.isFinite(reward.experienceMultiplier), `stage ${stage} EXP multiplier must be finite`);
    assert.ok(reward.goldMultiplier >= 0.5 && reward.goldMultiplier <= 20, `stage ${stage} GOLD multiplier escaped its cap`);
    assert.ok(reward.crystals >= 25 && reward.crystals <= 100, `stage ${stage} crystals escaped their cap`);
    assert.ok(reward.experienceMultiplier >= 1 && reward.experienceMultiplier <= 20, `stage ${stage} EXP multiplier escaped its cap`);

    if (stage > 1) {
      assert.ok(reward.goldMultiplier >= previous.goldMultiplier, `GOLD multiplier decreased at stage ${stage}`);
      assert.ok(reward.crystals >= previous.crystals, `crystals decreased at stage ${stage}`);
      assert.ok(reward.experienceMultiplier >= previous.experienceMultiplier, `EXP multiplier decreased at stage ${stage}`);
    }
    previous = reward;
  }

  assert.deepEqual(
    {
      goldMultiplier: previous.goldMultiplier,
      crystals: previous.crystals,
      experienceMultiplier: previous.experienceMultiplier,
    },
    { goldMultiplier: 20, crystals: 100, experienceMultiplier: 20 },
  );
});

test("build305 grants 4v4 equipment only at the intended first-clear milestones", () => {
  const expectedRarity = stage => {
    if (stage === 10) return "SR";
    if (stage === 25) return "SSR";
    if (stage === 40) return "UR";
    if (stage >= 50 && stage % 10 === 0) return "LR";
    return null;
  };

  for (let stage = 1; stage <= 10_000; stage++) {
    assert.equal(
      teamBattleRewardPreview(stage).guaranteedRarity,
      expectedRarity(stage),
      `unexpected equipment milestone at stage ${stage}`,
    );
  }

  assert.deepEqual(
    [49, 50, 51, 59, 60].map(stage => teamBattleRewardPreview(stage).guaranteedRarity),
    [null, "LR", null, null, "LR"],
  );

  for (const stage of [10, 25, 40, 50, 60, 100]) {
    assert.equal(teamBattleRewardEntitlements(stage, { firstClear: true }).guaranteedRarity, expectedRarity(stage));
    assert.equal(teamBattleRewardEntitlements(stage, { firstClear: false }).guaranteedRarity, null);
  }
  for (const stage of [1, 9, 11, 24, 26, 39, 41, 49, 51, 59, 61]) {
    assert.equal(teamBattleRewardEntitlements(stage, { firstClear: true }).guaranteedRarity, null);
  }
});

test("build305 safeCurrencyGrant saturates without exceeding MAX_SAFE_INTEGER", () => {
  const maximum = Number.MAX_SAFE_INTEGER;

  assert.equal(safeCurrencyGrant(maximum - 2, 10), 2);
  assert.equal((maximum - 2) + safeCurrencyGrant(maximum - 2, 10), maximum);
  assert.equal(safeCurrencyGrant(maximum, 1), 0);
  assert.equal(safeCurrencyGrant(Infinity, 100), 0);
  assert.equal(safeCurrencyGrant(0, Infinity), maximum);
  assert.equal(safeCurrencyGrant(-100, 5), 5);
  assert.equal(safeCurrencyGrant(100, -5), 0);
  assert.equal(safeCurrencyGrant(1.9, 2.9), 2);
});

test("build305 offline campaign trophy pays five crystals per remaining fragment pack and reveals them", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  const start = source.indexOf("function showCampaignTrophyReveal");
  const end = source.indexOf("function interactExploreDecoration", start);

  assert.ok(start >= 0 && end > start, "campaign trophy implementation was not found");
  const trophySource = source.slice(start, end);

  assert.match(trophySource, /function showCampaignTrophyReveal\s*\(\s*\{[^)]*\bcrystals\s*=\s*0/);
  assert.match(trophySource, /if\s*\(\s*crystals\s*>\s*0\s*\)\s*rewardRows\.push/);
  assert.match(trophySource, /pixelIcon\s*\(\s*["']crystal["']/);
  assert.match(trophySource, /魔晶石/);
  assert.match(trophySource, /safeCurrencyGrant\s*\(\s*currentCrystals\s*,\s*5\s*\*\s*claim\.fragmentPacks\s*\)/);
  assert.match(trophySource, /save\.state\.player\.crystals\s*=\s*currentCrystals\s*\+\s*crystals/);
  assert.match(trophySource, /reveal\s*=\s*\{[^}]*\bcrystals\b[^}]*\}/s);
});

test("build305 offline mimic crystals use the converted economy depth", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  const start = source.indexOf("function win(caught,m)");
  const end = source.indexOf("function lose()", start);

  assert.ok(start >= 0 && end > start, "offline victory settlement was not found");
  const winSource = source.slice(start, end);

  assert.match(winSource, /economyDepth\s*=\s*campaignFloorToLegacyFloor\s*\(\s*floor\s*\)/);
  assert.match(winSource, /mimicVictoryGold\s*\(\s*economyDepth\s*,/);
  assert.match(winSource, /mimicVictoryCrystals\s*\(\s*economyDepth\s*,\s*Math\.random\s*\)/);
  assert.doesNotMatch(winSource, /mimicVictoryCrystals\s*\(\s*floor\s*,/);
});
