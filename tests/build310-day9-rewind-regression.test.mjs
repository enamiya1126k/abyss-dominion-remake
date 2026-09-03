import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  beginCampaignFloorReplay,
  campaignTrophyRewardReceipt,
  campaignFloorState,
  claimTrophyChest,
  collectCampaignKey,
  defeatCampaignBoss,
  normalizeCampaignState,
  trophyChestEntitlements,
} from "../src/core/Campaign100System.js";
import {
  CAMPAIGN_HERO_REWIND_FLOOR,
  advanceCampaignRewindFloor,
  beginCampaignDay9Rewind,
  createCampaignHeroEncounterState,
  recordCampaignHeroWound,
} from "../src/core/CampaignHeroEncounterSystem.js";

const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

function between(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0, `missing source marker: ${start}`);
  assert.ok(to > from, `missing source marker: ${end}`);
  return source.slice(from, to);
}

test("Build310 day-nine rewind starts at 81F once and preserves permanent hero wounds", () => {
  let ledger = recordCampaignHeroWound(createCampaignHeroEncounterState(), {
    heroId: "myth_yori",
    woundId: "before-final-yori",
    hpRate: 0.42,
  }).state;

  const first = beginCampaignDay9Rewind(ledger, { resultId: "final-defeat-build310" });
  const duplicate = beginCampaignDay9Rewind(first.state, { resultId: "final-defeat-build310" });

  assert.equal(first.recorded, true);
  assert.equal(first.state.rewind.active, true);
  assert.equal(first.state.rewind.currentFloor, CAMPAIGN_HERO_REWIND_FLOOR);
  assert.equal(first.state.rewind.suppressFirstClearRewards, true);
  assert.equal(first.state.heroes.myth_yori.remainingHpRate, 0.42);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.state.rewind.count, 1);
});

test("Build310 replay reset cannot restore a previously claimed mythic entitlement", () => {
  const state = {};
  const floor = CAMPAIGN_HERO_REWIND_FLOOR;

  defeatCampaignBoss(state, floor);
  for (const key of ["original-a", "original-b", "original-c"]) collectCampaignKey(state, floor, key);
  const original = claimTrophyChest(state, floor);
  assert.equal(original.claimed, true);
  assert.equal(original.equipmentGuaranteed, true);

  const replay = beginCampaignFloorReplay(state, floor, "rewind-run-310");
  assert.equal(replay.replayActive, true);
  assert.equal(replay.trophyClaimed, true, "first-clear receipt must survive the replay reset");
  assert.equal(replay.bossDefeated, false);
  assert.equal(replay.keysCollected, 0);

  defeatCampaignBoss(state, floor);
  for (const key of ["rewind-a", "rewind-b", "rewind-c"]) collectCampaignKey(state, floor, key);
  const entitlement = trophyChestEntitlements(state, floor);
  assert.equal(entitlement.available, true);
  assert.equal(entitlement.fragmentPacks, 0, "rewinding must not duplicate claimed fragment packs");
  assert.equal(entitlement.equipmentGuaranteed, false, "rewinding must not duplicate dedicated equipment");
  assert.equal(entitlement.currencyGuaranteed, false, "rewinding must not duplicate boss currency");
  assert.equal(entitlement.repeatRewardSuppressed, true);
  assert.equal(campaignFloorState(state, floor).trophyClaimed, true);
});

test("Build310 replay keeps per-reward receipts while resetting only the playable run", () => {
  const state = {};
  const floor = CAMPAIGN_HERO_REWIND_FLOOR;

  defeatCampaignBoss(state, floor);
  for (const key of ["first-a", "first-b", "first-c"]) collectCampaignKey(state, floor, key);
  assert.equal(claimTrophyChest(state, floor).claimed, true);
  assert.deepEqual(campaignTrophyRewardReceipt(state, floor), {
    fragmentPacksClaimed: 3,
    equipmentClaimed: true,
    currencyClaimed: true,
  });

  const replay = beginCampaignFloorReplay(state, floor, "receipt-replay-a");
  assert.equal(replay.bossDiscovered, false);
  assert.equal(replay.bossDefeated, false);
  assert.equal(replay.cleared, true, "the historical regional clear remains recorded");
  assert.equal(replay.trophyLocksOpened, 0);
  assert.equal(replay.trophyFragmentPacksClaimed, 0);
  assert.deepEqual(replay.trophyRewardReceipt, {
    fragmentPacksClaimed: 3,
    equipmentClaimed: true,
    currencyClaimed: true,
  });

  defeatCampaignBoss(state, floor);
  for (const key of ["second-a", "second-b", "second-c"]) collectCampaignKey(state, floor, key);
  const repeated = claimTrophyChest(state, floor);
  assert.equal(repeated.claimed, true, "the replay chest still opens as part of floor progression");
  assert.equal(repeated.fragmentPacks, 0);
  assert.equal(repeated.equipmentGuaranteed, false);
  assert.equal(repeated.currencyGuaranteed, false);

  beginCampaignFloorReplay(state, floor, "receipt-replay-b");
  const once = structuredClone(normalizeCampaignState(state));
  const twice = structuredClone(normalizeCampaignState(state));
  assert.deepEqual(twice, once, "receipt normalization is idempotent");
  assert.deepEqual(campaignTrophyRewardReceipt(state, floor), {
    fragmentPacksClaimed: 3,
    equipmentClaimed: true,
    currencyClaimed: true,
  });
});

test("Build310 migrates partial fragments into a durable receipt without reviving replay progress", () => {
  const floor = CAMPAIGN_HERO_REWIND_FLOOR;
  const state = {
    player: { bossRewards: { [floor]: "CAMPAIGN_TROPHY_2" } },
    campaign100: {
      version: 6,
      floors: {
        [floor]: {
          floor,
          replayActive: true,
          runId: "legacy-replay",
          bossDiscovered: false,
          bossDefeated: false,
          cleared: false,
          trophyLocksOpened: 0,
          trophyFragmentPacksClaimed: 0,
          trophyClaimed: false,
        },
      },
    },
  };

  normalizeCampaignState(state);
  const replay = campaignFloorState(state, floor);
  assert.equal(replay.bossDiscovered, false, "lifetime reward evidence must not rediscover the replay boss");
  assert.equal(replay.bossDefeated, false);
  assert.equal(replay.cleared, true, "lifetime evidence may restore history, but not live boss discovery");
  assert.equal(replay.trophyFragmentPacksClaimed, 0, "the current replay chest remains unopened");
  assert.deepEqual(campaignTrophyRewardReceipt(state, floor), {
    fragmentPacksClaimed: 2,
    equipmentClaimed: false,
    currencyClaimed: false,
  });

  defeatCampaignBoss(state, floor);
  for (const key of ["legacy-a", "legacy-b", "legacy-c"]) collectCampaignKey(state, floor, key);
  const remaining = trophyChestEntitlements(state, floor);
  assert.equal(remaining.fragmentPacks, 1);
  assert.equal(remaining.equipmentGuaranteed, true);
  assert.equal(remaining.currencyGuaranteed, true);
});

test("Build310 keeps multi-boss lifetime receipts isolated by boss", () => {
  const state = {};
  const floor = 80;
  defeatCampaignBoss(state, floor);
  for (const key of ["multi-a", "multi-b", "multi-c"]) collectCampaignKey(state, floor, key);
  assert.equal(claimTrophyChest(state, floor, "ten_time").claimed, true);

  beginCampaignFloorReplay(state, floor, "multi-replay");
  defeatCampaignBoss(state, floor, "ten_time");
  defeatCampaignBoss(state, floor, "ten_space");
  for (const key of ["multi-replay-a", "multi-replay-b", "multi-replay-c"]) collectCampaignKey(state, floor, key);

  const paid = trophyChestEntitlements(state, floor, "ten_time");
  const fresh = trophyChestEntitlements(state, floor, "ten_space");
  assert.deepEqual([paid.fragmentPacks, paid.equipmentGuaranteed, paid.currencyGuaranteed], [0, false, false]);
  assert.deepEqual([fresh.fragmentPacks, fresh.equipmentGuaranteed, fresh.currencyGuaranteed], [3, true, true]);
});

test("Build310 trophy UI grants only missing lifetime entitlements during rewind replay", () => {
  const rewardBlock = between(main, "function openCampaignTrophyChest(chest)", "function interactExploreDecoration(");

  assert.match(rewardBlock, /fragmentPacks\s*=\s*Math\.max\(0,Number\(claim\.fragmentPacks\)\|\|0\)/);
  assert.match(rewardBlock, /suppressReplayRewards\s*=\s*claim\.repeatRewardSuppressed\s*===\s*true/);
  assert.match(rewardBlock, /currency\s*=\s*claim\.currencyGuaranteed\s*===\s*true\s*\?/);
  assert.match(rewardBlock, /if\(claim\.equipmentGuaranteed\)/);
  assert.match(rewardBlock, /replaySuppressed:suppressReplayRewards/);
  assert.match(rewardBlock, /if\(reveal\?\.replaySuppressed\).*元の時間軸ですでに回収済みです/);
  assert.doesNotMatch(rewardBlock, /campaignHeroLedger\(\)\.rewind\?\.active/);
});

test("Build310 floor selector is locked to the rewind ceiling and explicitly resets that floor", () => {
  const selector = between(main, "function openExploreFloorSelector()", "function openUnavailableHomeFeature(");

  assert.match(selector, /rewindMax\s*=\s*heroLedger\.rewind\?\.active\s*\?/);
  assert.match(selector, /max\s*=\s*rewindMax\s*\?\?/);
  assert.match(selector, /minimum\s*=\s*rewindMax\s*\?\?\s*1/);
  assert.match(selector, /min="\$\{minimum\}"\s+max="\$\{max\}"\s+value="\$\{max\}"/);
  assert.match(selector, /Math\.max\(minimum,Math\.min\(max,/);
  assert.match(selector, /if\(heroLedger\.rewind\?\.active\).*beginCampaignFloorReplay\(save\.state,floor,/s);
});

test("Build310 clearing a rewind floor advances the ceiling and automatically prepares the next replay", () => {
  let ledger = beginCampaignDay9Rewind(createCampaignHeroEncounterState(), {
    resultId: "final-defeat-advance-build310",
  }).state;
  const advanced = advanceCampaignRewindFloor(ledger, { clearedFloor: CAMPAIGN_HERO_REWIND_FLOOR });
  ledger = advanced.state;

  assert.equal(advanced.advanced, true);
  assert.equal(ledger.rewind.active, true);
  assert.equal(ledger.rewind.currentFloor, CAMPAIGN_HERO_REWIND_FLOOR + 1);

  const exitFlow = between(main, "if(game.world.exit?.active!==false", "if(!game.world.campaignHeroPursuit");
  assert.match(exitFlow, /advanceCampaignRewindFloor\(campaignHeroLedger\(\),\{clearedFloor\}\)/);
  assert.match(exitFlow, /save\.state\.player\.currentFloor\+\+/);
  assert.match(exitFlow, /if\(rewindAdvance\.state\.rewind\?\.active\)normalizeCampaignState\(save\.state\)\.floors\[String\(save\.state\.player\.currentFloor\)\]=beginCampaignFloorReplay\(save\.state,save\.state\.player\.currentFloor,/);
});

test("Build310 completing the replay at 100F reopens the dedicated final arena", () => {
  const ledger = beginCampaignDay9Rewind(createCampaignHeroEncounterState(), {
    resultId: "final-defeat-complete-build310",
  }).state;
  const result = advanceCampaignRewindFloor(ledger, { clearedFloor: 100 });

  assert.equal(result.completed, true);
  assert.equal(result.state.rewind.active, false);
  assert.equal(result.state.rewind.currentFloor, 100);
  assert.equal(result.state.finalArena.unlocked, true);
});
