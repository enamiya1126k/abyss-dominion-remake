import test from "node:test";
import assert from "node:assert/strict";

import {
  CAMPAIGN_KEYS_PER_FLOOR,
  beginCampaignFloorRun,
  campaignFloorState,
  campaignMilestoneBossIds,
  claimTrophyChest,
  collectCampaignKey,
  defeatCampaignBoss,
  roomAttributesForFloor,
  roomCountForRandom,
  trophyChestEntitlements,
} from "../src/core/Campaign100System.js";
import {
  applyCampaignBossDefeatToWorld,
  createCampaignBossPlacements,
  requiredCampaignBossSectionCount,
} from "../src/core/CampaignBossWorldSystem.js";
import {
  generateSectionDungeon,
  sectionRoute,
} from "../src/core/DungeonSectionSystem.js";
import { floorBossDefinitionForFloor } from "../src/data/floorBosses.js";

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1_664_525) + 1_013_904_223) >>> 0;
    return value / 4_294_967_296;
  };
}

function seedForFloor(floor) {
  return (0x31100000 ^ Math.imul(floor, 2_654_435_761)) >>> 0;
}

function generatedCampaignFloor(floor) {
  const seed = seedForFloor(floor);
  const random = seeded(seed);
  const milestones = campaignMilestoneBossIds(floor);
  const bossIds = milestones.length
    ? milestones
    : [floorBossDefinitionForFloor(floor)?.id].filter(Boolean);
  const requested = roomCountForRandom(random);
  const count = requiredCampaignBossSectionCount(floor, bossIds, requested);
  const attributes = roomAttributesForFloor(floor, count, random);
  const world = generateSectionDungeon({ count, attributes, random });
  const bosses = createCampaignBossPlacements(world, bossIds, { floor, seed });
  return { world, bosses, bossIds };
}

test("Build311 all campaign floors 1-100 reproduce deterministically and keep every boss reachable", () => {
  for (let floor = 1; floor <= 100; floor += 1) {
    const first = generatedCampaignFloor(floor);
    const second = generatedCampaignFloor(floor);
    const context = `${floor}F`;

    assert.deepEqual(second, first, `${context} reproduces from the same stored seed`);
    assert.ok(first.bossIds.length >= 1, `${context} has an authored boss identity`);
    assert.equal(first.bosses.length, first.bossIds.length, `${context} places every authored boss`);
    assert.equal(new Set(first.bosses.map(boss => boss.bossId)).size, first.bossIds.length);

    for (const section of first.world.sections) {
      const route = sectionRoute(first.world, first.world.startSectionId, section.id);
      assert.equal(route[0], first.world.startSectionId, `${context} route starts in the entry section`);
      assert.equal(route.at(-1), section.id, `${context} can reach ${section.id}`);
    }
    for (const boss of first.bosses) {
      const route = sectionRoute(first.world, first.world.startSectionId, boss.sectionId);
      assert.equal(route.at(-1), boss.sectionId, `${context} can reach boss ${boss.bossId}`);
      const section = first.world.sections.find(entry => entry.id === boss.sectionId);
      assert.ok(section?.cellKeys.includes(`${boss.x},${boss.y}`), `${context} boss ${boss.bossId} occupies walkable ground`);
    }
  }
});

test("Build311 AUTO-equivalent planner can clear all 100 floors and every reward settles once", () => {
  const state = { player: { bossRewards: {} }, campaign100: {} };
  let defeated = 0;
  let opened = 0;

  for (let floor = 1; floor <= 100; floor += 1) {
    const generated = generatedCampaignFloor(floor);
    let world = { ...generated.world, bosses: generated.bosses };
    beginCampaignFloorRun(state, floor, `build311-auto-${floor}`);

    // Full-floor AUTO visits every linked section before taking objectives.
    for (const section of world.sections) {
      const route = sectionRoute(world, world.startSectionId, section.id);
      assert.equal(route.at(-1), section.id, `${floor}階 AUTO reaches ${section.id}`);
    }
    for (let key = 1; key <= CAMPAIGN_KEYS_PER_FLOOR; key += 1) {
      assert.equal(collectCampaignKey(state, floor, `${floor}-auto-key-${key}`).collected, true);
    }

    for (const bossId of generated.bossIds) {
      defeatCampaignBoss(state, floor, bossId);
      const progress = campaignFloorState(state, floor);
      world = applyCampaignBossDefeatToWorld(world, {
        floor,
        bossId,
        bossIds: generated.bossIds,
        progress,
        keysHeld: CAMPAIGN_KEYS_PER_FLOOR,
        seed: seedForFloor(floor),
      });
      defeated += 1;

      assert.equal(world.exit?.active, true, `${floor}階 first defeated boss opens the route`);
      assert.equal(world.exit?.locked, false);
      assert.equal(world.trophyChests.some(chest => chest.bossId === bossId), true);
      assert.equal(trophyChestEntitlements(state, floor, bossId).available, true);
      assert.equal(claimTrophyChest(state, floor, bossId).claimed, true);
      opened += 1;
      const duplicate = claimTrophyChest(state, floor, bossId);
      assert.equal(duplicate.available, false, `${floor}階/${bossId} cannot pay twice`);
      assert.equal(duplicate.equipmentGuaranteed, false);
    }

    const settled = campaignFloorState(state, floor);
    assert.equal(settled.cleared, true);
    assert.equal(settled.exitUnlocked, true);
  }

  assert.equal(defeated, 107, "80/90/100階 add seven extra Ten-God fights");
  assert.equal(opened, 107, "every authored boss has one independently receipted chest");
});
