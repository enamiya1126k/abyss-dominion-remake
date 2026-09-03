import test from "node:test";
import assert from "node:assert/strict";

import {
  CAMPAIGN_STATE_VERSION,
  CAMPAIGN_TROPHY_REWARD_VERSION,
  beginCampaignFloorReplay,
  campaignBossProgress,
  campaignDefeatedBossIds,
  campaignFloorState,
  campaignKeysHeld,
  campaignMilestoneBossIds,
  claimTrophyChest,
  collectCampaignKey,
  defeatCampaignBoss,
  normalizeCampaignState,
  trophyChestEntitlements,
} from "../src/core/Campaign100System.js";

function addKeys(state, floor) {
  for (let index = 1; index <= 3; index += 1) {
    collectCampaignKey(state, floor, `${floor}-campaign-key-${index}`);
  }
}

test("Build308 keeps the authored 3 / 3 / 4 Ten God floor roster", () => {
  assert.deepEqual(campaignMilestoneBossIds(80), ["ten_time", "ten_space", "ten_life"]);
  assert.deepEqual(campaignMilestoneBossIds(90), ["ten_death", "ten_fate", "ten_chaos"]);
  assert.deepEqual(campaignMilestoneBossIds(100), ["ten_dominion", "ten_creation", "ten_end", "ten_divinity"]);
});

test("Build307 group victories migrate to every separated boss without minting rewards", () => {
  const state = {
    player: { crystals: 444, bossRewards: { 80: "CAMPAIGN_TROPHY_COMPLETE" } },
    equipment: [{
      id: "legacy-space-gear",
      obtainedFloor: 80,
      obtainedMethod: "campaignTrophyChest",
      ruleOverrides: { signatureOwnerId: "ten_space" },
    }],
    reserveEquipment: [],
    bossEquipmentVault: [],
    endgame: { emergency: { fragments: { ten_time: 30, ten_space: 30, ten_life: 30 } } },
    campaign100: {
      version: 4,
      floors: {
        80: {
          bossDiscovered: true,
          bossDefeated: true,
          bossClearVersion: 2,
          keyIds: ["80-campaign-key-1", "80-campaign-key-2", "80-campaign-key-3"],
          keysCollected: 3,
          keysConsumed: 3,
          trophyLocksOpened: 3,
          trophyFragmentPacksClaimed: 3,
          trophyClaimed: true,
          hotSpringUsed: true,
          lastBossInfo: { endgameBossId: "ten_time" },
        },
      },
    },
  };
  const equipmentBefore = structuredClone(state.equipment);
  const fragmentsBefore = structuredClone(state.endgame.emergency.fragments);

  normalizeCampaignState(state);
  const floor = campaignFloorState(state, 80);
  assert.equal(state.campaign100.version, CAMPAIGN_STATE_VERSION);
  assert.equal(floor.trophyRewardVersion, CAMPAIGN_TROPHY_REWARD_VERSION);
  assert.deepEqual(campaignDefeatedBossIds(floor), campaignMilestoneBossIds(80));
  assert.equal(floor.keysConsumed, 0);
  assert.equal(campaignKeysHeld(floor), 3);
  assert.equal(floor.hotSpringUsed, true);
  assert.equal(campaignBossProgress(state, 80, "ten_space").trophyClaimed, true, "the exact stored gear owner keeps the old claim");
  assert.equal(campaignBossProgress(state, 80, "ten_time").trophyClaimed, false);
  assert.equal(campaignBossProgress(state, 80, "ten_life").trophyClaimed, false);
  for (const bossId of campaignMilestoneBossIds(80)) {
    assert.equal(campaignBossProgress(state, 80, bossId).trophyFragmentPacksClaimed, 3, "old group chest already paid every boss fragment");
  }
  assert.deepEqual(state.equipment, equipmentBefore);
  assert.deepEqual(state.endgame.emergency.fragments, fragmentsBefore);
  assert.equal(state.player.crystals, 444);

  const once = structuredClone(state);
  normalizeCampaignState(state);
  assert.deepEqual(state, once, "the structural migration is idempotent");
});

test("legacy partial fragment receipts apply to every former group member", () => {
  const state = {
    player: { bossRewards: { 90: "CAMPAIGN_TROPHY_2" } },
    campaign100: {
      version: 4,
      floors: {
        90: {
          bossDefeated: true,
          keyIds: ["90-campaign-key-1", "90-campaign-key-2"],
          trophyFragmentPacksClaimed: 2,
        },
      },
    },
  };
  normalizeCampaignState(state);
  for (const bossId of campaignMilestoneBossIds(90)) {
    const progress = campaignBossProgress(state, 90, bossId);
    assert.equal(progress.defeated, true);
    assert.equal(progress.trophyFragmentPacksClaimed, 2);
    assert.equal(progress.trophyLocksOpened, 0);
  }
  collectCampaignKey(state, 90, "90-campaign-key-3");
  assert.equal(trophyChestEntitlements(state, 90, "ten_fate").fragmentPacks, 1);
});

test("one Ten God opens the exit while three shared keys unlock each defeated boss chest", () => {
  const state = {};
  defeatCampaignBoss(state, 100, "ten_creation");
  addKeys(state, 100);
  let floor = campaignFloorState(state, 100);
  assert.deepEqual(campaignDefeatedBossIds(floor), ["ten_creation"]);
  assert.equal(floor.exitUnlocked, true);
  assert.equal(state.campaign100.finalUnlocked, true);

  const first = claimTrophyChest(state, 100, "ten_creation");
  assert.equal(first.claimed, true);
  assert.equal(first.equipmentGuaranteed, true);
  assert.equal(first.keysConsumed, 0);
  assert.equal(campaignKeysHeld(state, 100), 3);
  assert.equal(claimTrophyChest(state, 100, "ten_creation").claimed, undefined, "one chest settles only once per run");
  assert.equal(claimTrophyChest(state, 100, "ten_end").claimed, undefined, "an undefeated boss has no claimable chest");

  defeatCampaignBoss(state, 100, "ten_end");
  const second = claimTrophyChest(state, 100, "ten_end");
  assert.equal(second.claimed, true);
  assert.equal(second.keysConsumed, 0);
  assert.equal(campaignKeysHeld(state, 100), 3);
  floor = campaignFloorState(state, 100);
  assert.equal(floor.trophyClaimed, false, "floor-wide completion waits for every authored boss reward");
});

test("legacy no-boss-id calls still settle the former combined encounter safely", () => {
  const state = {};
  defeatCampaignBoss(state, 80);
  addKeys(state, 80);
  assert.deepEqual(campaignDefeatedBossIds(state, 80), campaignMilestoneBossIds(80));
  const first = claimTrophyChest(state, 80);
  const second = claimTrophyChest(state, 80);
  const third = claimTrophyChest(state, 80);
  assert.deepEqual([first.bossId, second.bossId, third.bossId], campaignMilestoneBossIds(80));
  assert.equal(campaignKeysHeld(state, 80), 3);
  assert.equal(campaignFloorState(state, 80).trophyClaimed, true);
});

test("explicit replay resets per-run boss chests but retains lifetime equipment claims", () => {
  const state = {};
  defeatCampaignBoss(state, 80);
  addKeys(state, 80);
  claimTrophyChest(state, 80, "ten_time");
  claimTrophyChest(state, 80, "ten_space");
  beginCampaignFloorReplay(state, 80, "build308-replay");

  const replay = campaignFloorState(state, 80);
  assert.deepEqual(campaignDefeatedBossIds(replay), []);
  assert.equal(replay.keysCollected, 0);
  assert.equal(replay.keysConsumed, 0);
  assert.equal(replay.hotSpringUsed, false);
  assert.equal(campaignBossProgress(state, 80, "ten_time").trophyClaimed, true);
  assert.equal(campaignBossProgress(state, 80, "ten_space").trophyClaimed, true);
  assert.equal(campaignBossProgress(state, 80, "ten_life").trophyClaimed, false);
  for (const bossId of campaignMilestoneBossIds(80)) {
    assert.equal(campaignBossProgress(state, 80, bossId).trophyLocksOpened, 0);
    assert.equal(campaignBossProgress(state, 80, bossId).trophyFragmentPacksClaimed, 0);
  }

  defeatCampaignBoss(state, 80, "ten_time");
  addKeys(state, 80);
  assert.equal(claimTrophyChest(state, 80, "ten_time").equipmentGuaranteed, false);
});

test("normal floors retain the Build302 consuming single-chest API", () => {
  const state = {};
  defeatCampaignBoss(state, 8);
  addKeys(state, 8);
  assert.deepEqual(trophyChestEntitlements(state, 8), {
    available: true,
    heldKeys: 3,
    missingKeys: 0,
    totalKeys: 3,
    fragmentPacks: 3,
    equipmentGuaranteed: true,
  });
  const claim = claimTrophyChest(state, 8);
  assert.equal(claim.keysConsumed, 3);
  assert.equal(campaignKeysHeld(state, 8), 0);
});

test("malformed boss maps and floor aliases cannot invent Ten God progress", () => {
  const state = {
    campaign100: {
      version: 5,
      floors: {
        80: { bossProgress: { ten_time: { defeated: true }, injected_god: { defeated: true, trophyClaimed: true } } },
        "080": { bossProgress: { ten_space: { defeated: true }, ten_life: { defeated: "yes" } }, hotSpringUsed: true },
      },
    },
  };
  normalizeCampaignState(state);
  const floor = campaignFloorState(state, 80);
  assert.deepEqual(Object.keys(floor.bossProgress), campaignMilestoneBossIds(80));
  assert.deepEqual(campaignDefeatedBossIds(floor), ["ten_time", "ten_space"]);
  assert.equal(floor.hotSpringUsed, true);
  assert.equal(campaignBossProgress(state, 80, "injected_god"), null);
  assert.equal(defeatCampaignBoss(state, 80, "injected_god").bossProgress.injected_god, undefined);
  addKeys(state, 80);
  assert.equal(trophyChestEntitlements(state, 80, "injected_god").available, false);
  assert.equal(claimTrophyChest(state, 80, "injected_god").claimed, undefined);
  assert.equal(campaignBossProgress(state, 80, "ten_time").trophyClaimed, false);
});

test("corrupt campaign version metadata cannot collapse a v5 partial clear into the legacy group clear", () => {
  const state = {
    campaign100: {
      version: "broken",
      floors: {
        100: {
          bossDiscovered: true,
          bossDefeated: true,
          cleared: true,
          exitUnlocked: true,
          bossProgress: {
            ten_creation: { bossId: "ten_creation", discovered: true, defeated: true },
            ten_dominion: { bossId: "ten_dominion", discovered: false, defeated: false },
            ten_end: { bossId: "ten_end", discovered: false, defeated: false },
            ten_divinity: { bossId: "ten_divinity", discovered: false, defeated: false },
          },
        },
        "0100": {
          bossDefeated: true,
          trophyLocksOpened: 3,
          trophyClaimed: true,
        },
      },
    },
  };

  normalizeCampaignState(state);
  assert.deepEqual(campaignDefeatedBossIds(state, 100), ["ten_creation"]);
  assert.equal(campaignBossProgress(state, 100, "ten_creation").defeated, true);
  assert.equal(campaignBossProgress(state, 100, "ten_dominion").defeated, false);
  assert.equal(campaignBossProgress(state, 100, "ten_end").trophyClaimed, false);
  assert.equal(state.campaign100.version, CAMPAIGN_STATE_VERSION);
});
