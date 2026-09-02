import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  beginCampaignFloorReplay,
  campaignRegionProgress,
  defeatCampaignBoss,
  normalizeCampaignState,
} from "../src/core/Campaign100System.js";

test("legacy reach and biome exploration never count as campaign floor clears", () => {
  const state = {
    player: { maxFloor: 100, currentFloor: 8, bossKills: Object.fromEntries(Array.from({ length: 10 }, (_, index) => [index + 1, 1])) },
    biomeProgress: {
      origin_cave: {
        visitedFloors: Array.from({ length: 10 }, (_, index) => index + 1),
        encounters: Object.fromEntries(Array.from({ length: 10 }, (_, index) => [`enemy-${index}`, 1])),
        openedChests: Array.from({ length: 5 }, (_, index) => `chest-${index}`),
        bossDefeated: true,
      },
    },
    campaign100: {
      version: 1,
      floors: Object.fromEntries(Array.from({ length: 10 }, (_, index) => [String(index + 1), {
        floor: index + 1,
        bossDiscovered: true,
        bossDefeated: true,
        exitUnlocked: true,
      }])),
    },
  };

  normalizeCampaignState(state);
  assert.equal(state.player.maxFloor, 100, "legacy access remains available");
  assert.deepEqual(state.campaign100.legacyBossClearRescue.floors, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(campaignRegionProgress(state, 8), { from: 1, to: 10, cleared: 0, total: 10, percent: 0, complete: false });
});

test("v2 rescue preserves supported clears and is idempotent", () => {
  const state = {
    campaign100: {
      version: 1,
      floors: {
        1: { bossDefeated: true, bossClearVersion: 1 },
        2: { bossDefeated: true, clearRecordedAt: "2026-09-01T00:00:00.000Z" },
        3: { bossDefeated: true, lastBossInfo: { speciesId: "boss" } },
        4: { bossDefeated: true, hotSpringUsed: true },
        5: { bossDefeated: true, trophyLocksOpened: 1, keysCollected: 1 },
        6: { bossDefeated: true, trophyClaimed: true, keysCollected: 3 },
        7: { bossDefeated: true, runId: "campaign-run", keysCollected: 2, keyIds: ["key-1", "key-2"], visitedRoomIds: ["room-7"], bossAreaId: "boss-room", postBossSpawns: {} },
        8: { bossDiscovered: true, bossDefeated: true, exitUnlocked: true },
      },
    },
  };

  normalizeCampaignState(state);
  assert.deepEqual(campaignRegionProgress(state, 10), { from: 1, to: 10, cleared: 6, total: 10, percent: 60, complete: false });
  assert.equal(state.campaign100.floors["7"].bossDefeated, false, "pre-boss map/run data is not clear evidence");
  assert.equal(state.campaign100.floors["7"].cleared, false);
  assert.equal(state.campaign100.floors["8"].bossDefeated, false);
  assert.equal(state.campaign100.floors["8"].cleared, false);
  const once = structuredClone(state);
  normalizeCampaignState(state);
  assert.deepEqual(state, once);
});

test("historical clear count survives an explicit floor replay", () => {
  const state = {};
  defeatCampaignBoss(state, 12);
  assert.equal(campaignRegionProgress(state, 12).cleared, 1);
  beginCampaignFloorReplay(state, 12, "replay-12");
  assert.equal(state.campaign100.floors["12"].bossDefeated, false, "replay boss may spawn again");
  assert.equal(campaignRegionProgress(state, 12).cleared, 1, "historical region clear remains recorded");
});

test("campaign progress always uses the current ten-floor prophecy day", () => {
  const state = { campaign100: { version: 3, floors: {} } };
  for (let floor = 61; floor <= 67; floor++) defeatCampaignBoss(state, floor);
  assert.deepEqual(campaignRegionProgress(state, 68), { from: 61, to: 70, cleared: 7, total: 10, percent: 70, complete: false });
});

test("explore header renders campaign clear count instead of legacy exploration percent", () => {
  const source = fs.readFileSync(new URL("../src/ui/screens/ExploreScreen.js", import.meta.url), "utf8");
  assert.match(source, /campaignRegionProgress\(state,floor\)/);
  assert.match(source, /攻略 \$\{regionProgress\.cleared\}\/\$\{regionProgress\.total\}/);
  assert.doesNotMatch(source, /探索率 \$\{progress\}%/);
});
