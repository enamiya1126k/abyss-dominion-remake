import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  campaignKeysHeld,
  campaignMilestoneBossIds,
  claimTrophyChest,
  collectCampaignKey,
  defeatCampaignBoss,
  trophyChestEntitlements,
} from "../src/core/Campaign100System.js";
import {
  bossRewardIdentity,
  campaignBossRewardIdentities,
} from "../src/core/BossRewardMappingSystem.js";

const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

function between(start, end) {
  const from = main.indexOf(start);
  const to = main.indexOf(end, from + start.length);
  assert.ok(from >= 0, `missing source marker: ${start}`);
  assert.ok(to > from, `missing source marker: ${end}`);
  return main.slice(from, to);
}

test("Build308 main creates one field boss and one durable trophy object per authored god", () => {
  const generation = between("function floorConfig(", "let expeditionSaveTimer");

  assert.match(generation, /requiredCampaignBossSectionCount\(floor,bossIds,roomCountForRandom\(rng\)\)/);
  assert.match(generation, /assignedSections=new Set\(\),bossPlans=\[\]/);
  assert.match(generation, /availableBossSections\.filter\(section=>!assignedSections\.has\(section\.id\)\)/);
  assert.match(generation, /bosses=bossPlans\.map/);
  assert.match(generation, /trophyChests=defeatedPlans\.map/);
  assert.match(generation, /layoutVersion:308/);

  const draw = between("function drawExploreSceneObjects(", "function showTutorialPickupMarker(");
  assert.match(draw, /campaignWorldBosses\(world\)\.filter/);
  assert.match(draw, /campaignWorldTrophyChests\(world\)\.filter/);
});

test("Build308 online exploration renders every live boss and every per-boss trophy", () => {
  const source = between("function onlineExploreBossMonster(", "function syncOnlineExploreMembers(");
  const onlineExploreWorld = new Function(
    "CAMPAIGN_KEYS_PER_FLOOR",
    `${source}; return onlineExploreWorld;`,
  )(3);
  const profiles = [
    { id: "ten_time", name: "時の神", endgameBossId: "ten_time", speciesId: "god", hp: 1000, level: 800 },
    { id: "ten_space", name: "空間の神", endgameBossId: "ten_space", speciesId: "god", hp: 1200, level: 800 },
  ];
  const world = onlineExploreWorld({
    members: [{}, {}],
    expedition: {
      floor: 80, cols: 7, rows: 7, start: { x: 1, y: 1 }, exit: { x: 5, y: 5 },
      tiles: Array.from({ length: 7 }, () => "......."),
      objects: [
        ...profiles.map((bossProfile, index) => ({ id: `boss-${index}`, type: "floorBoss", bossId: bossProfile.id, bossProfile, x: 2 + index, y: 2 })),
        { id: "trophy-time", type: "campaignTrophy", bossId: "ten_time", x: 2, y: 3, resolved: true },
        { id: "trophy-space", type: "campaignTrophy", bossId: "ten_space", x: 3, y: 3, resolved: false },
        { id: "exit", type: "exit", x: 5, y: 5, hidden: false },
      ],
    },
  });
  assert.deepEqual(world.bosses.map(entry => entry.campaignBossId), ["ten_time", "ten_space"]);
  assert.deepEqual(world.bosses.map(entry => entry.onlineBossMonster.campaignBossId), ["ten_time", "ten_space"]);
  assert.equal(world.boss, world.bosses[0], "the compatibility alias does not replace the complete boss list");
  assert.deepEqual(world.trophyChests.map(entry => [entry.bossId, entry.open]), [["ten_time", true], ["ten_space", false]]);
  assert.equal(world.trophyChest.bossId, "ten_space", "the compatibility alias points to the next unopened trophy");
});

test("Build308 field collision and victory settlement preserve the other active gods", () => {
  const update = between("function update(dt)", "function showChestRewardReveal(");
  const clear = between("function applyCampaignBossClearToWorld(", "function maze()");
  const victory = between("function win(caught,m)", "function randomFrom(");

  assert.match(update, /campaignWorldTrophyChests\(game\.world\)\.find\(chest=>!chest\.open/);
  assert.match(update, /campaignWorldBosses\(game\.world\)\.find\(entry=>entry\.active!==false/);
  assert.match(update, /floorBossEnemy\(fieldBoss\)/, "the touched boss identity must enter battle");

  assert.match(clear, /target\.active=false;target\.hidden=true/);
  assert.match(clear, /world\.boss=world\.bosses\.find\(entry=>entry\.active!==false\)\?\?null/);
  assert.match(clear, /world\.trophyChests\.some\(entry=>entry\.bossId===bossId\)/);
  assert.match(clear, /bossId:`\$\{floor\}-trophy-|id:`\$\{floor\}-trophy-/, "the trophy receipt is boss-specific");
  assert.match(clear, /world\.exit\.locked=false;world\.exit\.active=true/);
  assert.match(victory, /campaignBattleBossWasDefeated\(save\.state,floor,boss\)/);
  assert.match(victory, /applyCampaignBossClearToWorld\(snapshot\.world,boss,floor\)/);
  assert.doesNotMatch(victory, /snapshot\.world\.boss\s*=\s*null/, "one clear must not erase the remaining gods");
});

test("Build308 trophy settlement uses the chest boss for equipment, portrait, currency, and AUTO close", () => {
  const equipment = between("function campaignTrophyEquipment(", "function applyOnlineCampaignTrophyFragments(");
  const trophy = between("function showCampaignTrophyReveal(", "function interactExploreDecoration(");

  assert.match(equipment, /identity=bossRewardIdentity\(profile,\{floor:current\}\)/);
  assert.match(equipment, /createSignatureEquipment\(identity\.ownerId,pieceIndex\)/);
  assert.match(trophy, /bossId=String\(chest\.bossId/);
  assert.match(trophy, /trophyChestEntitlements\(save\.state,floor,bossId\)/);
  assert.match(trophy, /claimTrophyChest\(save\.state,floor,bossId\)/);
  assert.match(trophy, /bossFragmentVisualIdentity\(id,\{floor\}\)/);
  assert.match(trophy, /campaignBossChestReward\(\{floor,bossId:bossInfo/);
  assert.match(trophy, /rewardId:`offline-campaign-trophy:\$\{floor\}:\$\{bossId\}`/);
  assert.match(trophy, /keysReusable:isCampaignMultiBossFloor\(floor\)/);
  assert.match(trophy, /if\(exploreAutoActive\(\)\).*setTimeout/s);
  assert.match(trophy, /autoCloseTimer=setTimeout\(.*?,2200\)/s);
});

test("Build308 used hot spring remains on the field and saves before showing recovery feedback", () => {
  const recovery = between("function bossHotSpringContainsPlayer(", "function refreshCampaignKeyCounter(");
  const drawing = between("function drawBossHotSpring(", "function drawExploreExit(");

  assert.match(recovery, /spring\.active=true;spring\.used=true/);
  assert.match(recovery, /floorState\.hotSpringUsed=true/);
  assert.match(recovery, /persistExpeditionSnapshot\(expeditionSnapshotFromGame\(\),\{saveNow:false\}\)/);
  assert.match(recovery, /if\(!save\.save\(\)\)\{save\.state=checkpoint;Object\.assign\(spring,springCheckpoint\)/);
  assert.match(recovery, /game\.hotSpringRecoveryFx=/);
  assert.match(drawing, /const now=performance\.now\(\),used=Boolean\(spring\.used\)/);
  assert.match(drawing, /if\(used\)/, "the used spring has a persistent rendered state");
  assert.match(drawing, /HP・MP 完全回復/);
});

test("Build308 three reusable keys independently settle every defeated god chest", () => {
  for (const floor of [80, 90, 100]) {
    const state = {};
    const ids = campaignMilestoneBossIds(floor);
    const mapped = campaignBossRewardIdentities(floor);
    assert.equal(mapped.length, ids.length);
    assert.deepEqual(mapped.map(entry => entry.id), ids);

    for (let index = 1; index <= 3; index += 1) {
      collectCampaignKey(state, floor, `${floor}-campaign-key-${index}`);
    }

    for (const bossId of ids) {
      defeatCampaignBoss(state, floor, bossId);
      const preview = trophyChestEntitlements(state, floor, bossId);
      assert.equal(preview.available, true, `${floor}F/${bossId} is claimable after its own defeat`);
      assert.equal(preview.equipmentGuaranteed, true);
      assert.equal(bossRewardIdentity({ endgameBossId: bossId }).ownerId, bossId);
      const claim = claimTrophyChest(state, floor, bossId);
      assert.equal(claim.claimed, true);
      assert.equal(claim.keysConsumed, 0);
      assert.equal(campaignKeysHeld(state, floor), 3, `${floor}F keys remain reusable`);
      assert.equal(trophyChestEntitlements(state, floor, bossId).available, false, "the same chest cannot pay twice");
    }
  }
});

test("Build308 host events retain modern per-boss ledgers and object-shaped boss identity", () => {
  const persistence = between("function persistOnlineHostWorld(", "function onlineExploreMonster(");
  assert.match(persistence, /profile\.campaignBossId,profile\.bossId,profile\.endgameBossId,profile\.floorBossCatalogId/);
  assert.match(persistence, /openedBossIds:currentState\.openedBossIds/);
  assert.match(persistence, /mythicClaimedBossIds:currentState\.mythicClaimedBossIds/);
  assert.match(persistence, /fragmentPacksClaimedByBoss:currentState\.fragmentPacksClaimedByBoss/);
  assert.match(persistence, /replayActive:currentState\.replayActive/);
  assert.doesNotMatch(persistence, /event\?\.boss\]\)\.filter/, "an object must never be coerced to [object Object] as a boss id");
});
