import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { normalizeCampaignState } from "../src/core/Campaign100System.js";
import { OnlinePartyController } from "../src/online/OnlinePartyClient.js?build302-persistence-integration";

test("Build301 complete compatibility markers restore a settled chest without minting rewards", () => {
  for (const marker of ["CAMPAIGN_TROPHY_COMPLETE", "CAMPAIGN_TROPHY_3"]) {
    const state = { player: { bossRewards: { 8: marker } }, campaign100: { version: 1, floors: {} } };
    normalizeCampaignState(state);
    const floor = state.campaign100.floors["8"];
    assert.equal(floor.bossDefeated, true);
    assert.equal(floor.cleared, true);
    assert.equal(floor.keysCollected, 3);
    assert.equal(floor.keysConsumed, 3);
    assert.equal(floor.trophyLocksOpened, 3);
    assert.equal(floor.trophyFragmentPacksClaimed, 3);
    assert.equal(floor.trophyClaimed, true);
  }
});

test("schema 72 migrates to 75, discards stale field snapshots, and keeps prior AUTO rescue", async () => {
  const previousStorage = globalThis.localStorage, values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
  try {
    const { SaveService } = await import("../src/services/SaveService.js?build306-position-preservation-regression");
    const service = new SaveService(), legacy = structuredClone(service.state);
    legacy.schemaVersion = 72;
    legacy.appVersion = "3.0.2";
    legacy.campaign100 = { version: 1, floors: {} };
    legacy.player.bossRewards = { 8: "CAMPAIGN_TROPHY_COMPLETE" };
    legacy.expeditionSnapshot = { floor: 8, world: { layoutVersion: 301, bossDefeated: false }, player: { x: 1, y: 1 } };
    legacy.settings.exploreAutoMode = "items";
    legacy.settings.exploreAutoMenuOpen = true;
    legacy.settings.autoExploreButtonPosition = { x: -900, y: 4000 };
    const equipmentBefore = legacy.equipment.length;

    const migrated = service.migrate(legacy);
    assert.equal(migrated.schemaVersion, 75);
    assert.equal(migrated.appVersion, "3.0.9");
    assert.equal(migrated.expeditionSnapshot, null);
    assert.equal(migrated.settings.exploreAutoMode, "floor");
    assert.equal(migrated.settings.exploreAutoMenuOpen, false);
    assert.deepEqual(migrated.settings.autoExploreButtonPosition, { x: -900, y: 4000 });
    assert.equal(migrated.campaign100.floors["8"].trophyClaimed, true);
    assert.equal(migrated.equipment.length, equipmentBefore, "migration records receipts but never creates a reward");
    const migratedAgain = service.migrate(structuredClone(migrated));
    assert.deepEqual(migratedAgain.campaign100, migrated.campaign100, "campaign receipt migration remains idempotent");
    assert.deepEqual(migratedAgain.player.bossRewards, migrated.player.bossRewards);
    assert.equal(migratedAgain.expeditionSnapshot, null);
    assert.equal(migratedAgain.settings.exploreAutoMode, "floor");
    assert.deepEqual(migratedAgain.settings.autoExploreButtonPosition, { x: -900, y: 4000 });
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

test("offline partial-fragment receipts survive the online host snapshot", () => {
  const state = {
    player: { floorSeeds: { 8: 302008 }, openedChests: {}, bossKills: { 8: 1 }, bossRewards: {} },
    campaign100: { floors: { 8: { runId: "partial-run", keyIds: ["8-campaign-key-1", "8-campaign-key-2"], keysCollected: 2, trophyLocksOpened: 0, trophyFragmentPacksClaimed: 2, trophyClaimed: false, hotSpringUsed: false, bossDefeated: true } } },
    onlineParty: { firstCoopBossClears: [], hostWorld: { revision: 0, floorSeeds: {}, openedChestIds: {}, defeatedBossFloors: [], claimedBossRewardFloors: [], campaignFloorStates: {} } },
  };
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, { getState: () => state, hostWorldRevision: 0, roomState: { selectedFloor: 8 } });
  const floor = controller._hostWorldSnapshot().campaignFloorStates["8"];
  assert.equal(floor.trophyLocksOpened, 0);
  assert.equal(floor.trophyFragmentPacksClaimed, 2);
  assert.equal(floor.trophyMythicClaimed, false);
});

test("field resume and boss victory both keep campaign state authoritative", () => {
  const main = fs.readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  const saveService = fs.readFileSync(new URL("../src/services/SaveService.js", import.meta.url), "utf8");
  assert.match(main, /savedBossDefeated!==snapshotBossDefeated/);
  assert.match(main, /!world\.trophyChest\|\|!world\.hotSpring\|\|!world\.exit/);
  assert.match(saveService, /if\(from<73\)\{s\.expeditionSnapshot=null/);
  assert.match(main, /bossProgressSaved=Boolean\(save\.save\(\)\)/);
  assert.match(main, /if\(resultClosed\|\|!ensureBossProgressSaved\(\)\)return/);
  assert.match(main, /討伐状態をまだ保存できていません/);
});

test("a saved trophy settlement is never rolled back because its reveal UI failed", () => {
  const main = fs.readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  const start = main.indexOf("function openCampaignTrophyChest"), end = main.indexOf("function interactExploreDecoration", start);
  const source = main.slice(start, end), saveIndex = source.indexOf('if(!save.save())throw new Error("save failed")'), transactionCatch = source.indexOf("}catch(error){save.state=checkpoint"), revealTry = source.indexOf("try{refreshCampaignKeyCounter();showCampaignTrophyReveal(reveal)");
  assert.ok(saveIndex >= 0 && transactionCatch > saveIndex && revealTry > transactionCatch);
  assert.match(source, /Campaign trophy reveal skipped after a successful save/);
});

test("Build308 release identity reaches the entry point and changed modules", () => {
  const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const config = fs.readFileSync(new URL("../src/core/config.js", import.meta.url), "utf8");
  assert.match(index, /ASSET_VERSION = "3\.0\.9"/);
  assert.match(index, /ASSET_BUILD = "build309"/);
  assert.match(index, /build306-ui\.css\?v=3\.0\.6-build306/);
  assert.match(config, /SAVE_SCHEMA_VERSION=75/);
  assert.match(config, /APP_VERSION="3\.0\.9"/);
});
