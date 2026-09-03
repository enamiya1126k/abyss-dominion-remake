import test from "node:test";
import assert from "node:assert/strict";

import {
  CAMPAIGN_STATE_VERSION,
  campaignBossProgress,
  claimTrophyChest,
  normalizeCampaignState,
  trophyChestEntitlements,
} from "../src/core/Campaign100System.js";
import { normalizeCampaignStoryState } from "../src/core/CampaignStorySystem.js";
import { SaveService } from "../src/services/SaveService.js";
import { SAVE_SCHEMA_VERSION } from "../src/core/config.js";

const previousStorage = globalThis.localStorage;
const values = new Map();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
};

test.after(() => {
  if (previousStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = previousStorage;
});

function freshService() {
  values.clear();
  return new SaveService();
}

test("Build311 accepts every historical schema entry point and converges idempotently", () => {
  for (let schemaVersion = 1; schemaVersion <= SAVE_SCHEMA_VERSION; schemaVersion += 1) {
    const service = freshService();
    const legacy = structuredClone(service.state);
    legacy.schemaVersion = schemaVersion;
    legacy.player.gold = 311_000 + schemaVersion;
    legacy.player.maxFloor = Math.min(100, Math.max(1, schemaVersion));
    const migrated = service.migrate(legacy);
    assert.equal(migrated.schemaVersion, SAVE_SCHEMA_VERSION, `schema ${schemaVersion} reaches the current schema`);
    assert.equal(migrated.player.gold, 311_000 + schemaVersion, `schema ${schemaVersion} preserves inventory value`);
    const once = structuredClone(migrated);
    service.migrate(migrated);
    // The achievement synchronizer intentionally records its latest audit
    // time on each load; compare the durable game state without that clock.
    delete once.achievements?.lastSyncedAt;
    delete migrated.achievements?.lastSyncedAt;
    assert.deepEqual(migrated, once, `schema ${schemaVersion} stays stable on the next load`);
  }
});

test("Build311 carries retired storyDaysSeen receipts through save migration exactly once", () => {
  const service = freshService();
  const legacy = structuredClone(service.state);
  // Schema 73 still runs the retired final-flow cleanup that originally
  // deleted this field before the campaign receipt migrator could read it.
  legacy.schemaVersion = 73;
  legacy.campaign100.version = Math.max(1, CAMPAIGN_STATE_VERSION - 1);
  legacy.campaign100.invasionDaysSeen = [5, 2];
  legacy.campaign100.storyDaysSeen = [2, 4, 10, 4, "3", 0, 11, null];
  delete legacy.campaign100.story309;

  const migrated = service.migrate(legacy);

  assert.equal(Object.hasOwn(migrated.campaign100, "storyDaysSeen"), false);
  assert.deepEqual(
    [...migrated.campaign100.invasionDaysSeen].sort((left, right) => left - right),
    [2, 3, 4, 5, 10],
  );
  const story = normalizeCampaignStoryState(migrated);
  assert.deepEqual(
    story.seenSceneIds,
    ["road-010", "road-020", "road-030", "road-040", "road-090"],
    "legacy day one remains separate from the authored opening and day N maps to the prior ten-floor interlude",
  );
  assert.equal(story.openingSeen, false);

  const once = structuredClone(migrated.campaign100);
  service.migrate(migrated);
  assert.deepEqual(migrated.campaign100, once, "reloading cannot replay or duplicate retired story receipts");
});

test("Build311 owned multi-boss trophy equipment repairs the exact receipt without minting a duplicate", async t => {
  for (const collection of ["equipment", "reserveEquipment", "bossEquipmentVault"]) {
    await t.test(collection, () => {
      const owned = {
        id: `build311-owned-ten-space-${collection}`,
        name: "時空神の受領済み装備",
        slot: "weapon",
        obtainedFloor: 80,
        obtainedMethod: "campaignTrophyChest",
        ruleOverrides: { signatureOwnerId: "ten_space" },
      };
      const state = {
        player: { bossRewards: {} },
        equipment: [],
        reserveEquipment: [],
        bossEquipmentVault: [],
        campaign100: {
          version: CAMPAIGN_STATE_VERSION,
          floors: {
            80: {
              floor: 80,
              keyIds: ["80-key-1", "80-key-2", "80-key-3"],
              keysCollected: 3,
              bossProgress: {
                ten_space: {
                  bossId: "ten_space",
                  discovered: true,
                  defeated: true,
                  trophyLocksOpened: 0,
                  trophyFragmentPacksClaimed: 0,
                  trophyClaimed: false,
                  trophyRewardReceipt: {
                    fragmentPacksClaimed: 0,
                    equipmentClaimed: false,
                    currencyClaimed: false,
                  },
                },
              },
            },
          },
        },
      };
      state[collection].push(owned);

      normalizeCampaignState(state);
      const repaired = campaignBossProgress(state, 80, "ten_space");
      assert.equal(repaired.discovered, true);
      assert.equal(repaired.defeated, true);
      assert.equal(repaired.trophyLocksOpened, 3);
      assert.equal(repaired.trophyFragmentPacksClaimed, 3);
      assert.equal(repaired.trophyClaimed, true);
      assert.deepEqual(repaired.trophyRewardReceipt, {
        fragmentPacksClaimed: 3,
        equipmentClaimed: true,
        currencyClaimed: true,
      });

      const entitlement = trophyChestEntitlements(state, 80, "ten_space");
      assert.equal(entitlement.available, false);
      assert.equal(entitlement.fragmentPacks, 0);
      assert.equal(entitlement.equipmentGuaranteed, false);
      assert.equal(entitlement.currencyGuaranteed, false);
      assert.equal(claimTrophyChest(state, 80, "ten_space").claimed, undefined);

      const beforeReload = structuredClone(state);
      normalizeCampaignState(state);
      assert.deepEqual(state, beforeReload, "receipt repair is idempotent");
      assert.equal(
        state.equipment.length + state.reserveEquipment.length + state.bossEquipmentVault.length,
        1,
        "normalization repairs bookkeeping but never creates another item",
      );
    });
  }
});
