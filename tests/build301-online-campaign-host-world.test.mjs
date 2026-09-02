import test from "node:test";
import assert from "node:assert/strict";
import { OnlinePartyController } from "../src/online/OnlinePartyClient.js?build301-campaign-host-world";
import { campaignTrophyFragmentAwards } from "../src/core/CampaignRewardSystem.js";

function campaignState() {
  return {
    player: {
      floorSeeds: { 1: 301_001, 6: 301_006 },
      openedChests: {},
      bossKills: { 3: 1, 9: 2, 101: 1, 4.5: 1 },
      bossRewards: { 4: true, 100: true, 200: true },
    },
    campaign100: {
      floors: {
        4: { runId: "offline-4", keyIds: ["offline-key-1"], keysCollected: 1, trophyLocksOpened: 1, trophyClaimed: false, hotSpringUsed: true, bossDefeated: true },
      },
    },
    onlineParty: {
      firstCoopBossClears: [2, 99, 110],
      hostWorld: {
        revision: 7,
        floorSeeds: {},
        openedChestIds: {},
        defeatedBossFloors: [1, 6, "7", 100, 0, 101, 6, 2.5],
        claimedBossRewardFloors: [1, 6, "8", 100, -1, 101, 8.5],
        campaignFloorStates: {
          6: { keysCollected: 2, trophyLocksOpened: 1, collectedKeyIds: ["campaignKey-2", "campaignKey-3"], hotSpringUsed: true },
          7: { keysCollected: 99, trophyLocksOpened: 99, collectedKeyIds: ["a", "a", "b", "c", "d"] },
          101: { keysCollected: 1 },
        },
      },
    },
  };
}

function sorted(values) {
  return [...values].sort((left, right) => left - right);
}

test("build301 campaign trophy fragments use every milestone boss and offline per-lock values", () => {
  const normal30 = campaignTrophyFragmentAwards({ floor: 30, boss: { floorBossCatalogId: "floor-boss-300", name: "通常30" }, fragmentPacks: 2 });
  const normal31 = campaignTrophyFragmentAwards({ floor: 31, boss: { floorBossCatalogId: "floor-boss-310", name: "通常31" }, fragmentPacks: 1 });
  const normal61 = campaignTrophyFragmentAwards({ floor: 61, boss: { floorBossCatalogId: "floor-boss-610", name: "通常61" }, fragmentPacks: 3 });
  assert.deepEqual(normal30.map(entry => entry.amount), [8]);
  assert.deepEqual(normal31.map(entry => entry.amount), [5]);
  assert.deepEqual(normal61.map(entry => entry.amount), [18]);

  const abyss = campaignTrophyFragmentAwards({ floor: 70, bosses: [{ endgameBossId: "abyss_pride", faction: "abyss", name: "傲慢" }], fragmentPacks: 2 });
  assert.deepEqual(abyss.map(entry => [entry.id, entry.amount]), [["abyss_pride", 10]]);
  const tenGods = campaignTrophyFragmentAwards({ floor: 100, bosses: ["ten_dominion", "ten_creation", "ten_end", "ten_divinity"].map(id => ({ endgameBossId: id, faction: "tenGod", name: id })), fragmentPacks: 1 });
  assert.deepEqual(tenGods.map(entry => [entry.id, entry.amount]), [
    ["ten_dominion", 10], ["ten_creation", 10], ["ten_end", 10], ["ten_divinity", 10],
  ]);
});

test("build301 host-world snapshots preserve every campaign floor from 1 through 100", () => {
  const state = campaignState();
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    getState: () => state,
    hostWorldRevision: 9,
    roomState: { selectedFloor: 6 },
  });

  const full = controller._hostWorldSnapshot();
  assert.equal(full.revision, 9);
  assert.deepEqual(sorted(full.defeatedBossFloors), [1, 2, 3, 4, 6, 7, 9, 99, 100]);
  assert.deepEqual(sorted(full.claimedBossRewardFloors), [1, 6, 8, 100]);
  assert.equal(full.defeatedBossFloors.includes(101), false);
  assert.equal(full.claimedBossRewardFloors.includes(200), false);
  assert.equal(full.defeatedBossFloors.includes(2.5), false);
  assert.deepEqual(full.campaignFloorStates["4"], { runId: "offline-4", keysCollected: 1, trophyLocksOpened: 1, collectedKeyIds: ["offline-key-1"], hotSpringUsed: true, trophyMythicClaimed: false, replayActive: false, bossDefeatedThisRun: true });
  assert.deepEqual(full.campaignFloorStates["6"], { runId: null, keysCollected: 2, trophyLocksOpened: 1, collectedKeyIds: ["campaignKey-2", "campaignKey-3"], hotSpringUsed: true, trophyMythicClaimed: false, replayActive: false, bossDefeatedThisRun: false });
  assert.deepEqual(full.campaignFloorStates["7"], { runId: null, keysCollected: 3, trophyLocksOpened: 3, collectedKeyIds: ["a", "b", "c"], hotSpringUsed: false, trophyMythicClaimed: true, replayActive: false, bossDefeatedThisRun: false });
  assert.equal(full.campaignFloorStates["101"], undefined);

  const network = controller._hostWorldNetworkSnapshot();
  assert.deepEqual(sorted(network.defeatedBossFloors), sorted(full.defeatedBossFloors));
  assert.deepEqual(sorted(network.claimedBossRewardFloors), sorted(full.claimedBossRewardFloors));
  assert.deepEqual(network.campaignFloorStates, full.campaignFloorStates);
  assert.equal(network.floorSeeds["6"], 301_006);
});

test("build301 host-world delta fallback keeps legacy claims separate from explicit trophy state", () => {
  const state = campaignState();
  state.onlineParty.hostWorld = {
    revision: 0,
    floorSeeds: {},
    openedChestIds: {},
    defeatedBossFloors: [],
    claimedBossRewardFloors: [],
    campaignFloorStates: {},
  };
  state.onlineParty.firstCoopBossClears = [];
  state.player.bossKills = {};
  state.player.bossRewards = {};
  const updates = [], sent = [];
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    selfId: "AD-B3ZZ-TESX",
    getState: () => state,
    hostWorldRevision: 0,
    processedHostWorldDeltas: new Set(),
    capabilities: new Set(["hostWorldReceiptsV1"]),
    recoverySettlementFailed: false,
    onHostWorldUpdate(event) {
      updates.push(structuredClone(event));
      state.onlineParty.hostWorld = structuredClone(event.hostWorld);
      return { ok: true };
    },
    _send(type, payload) { sent.push({ type, ...payload }); return true; },
  });

  controller._applyHostWorldDelta({
    type: "hostWorldDelta",
    mutationId: "build301-defeated-1",
    ownerId: controller.selfId,
    revision: 1,
    delta: { defeatedBoss: { floor: 1 } },
  });
  controller._applyHostWorldDelta({
    type: "hostWorldDelta",
    mutationId: "build301-claimed-1",
    ownerId: controller.selfId,
    revision: 2,
    delta: { claimedBossReward: { floor: 1 } },
  });
  controller._applyHostWorldDelta({
    type: "hostWorldDelta",
    mutationId: "build301-campaign-state-2",
    ownerId: controller.selfId,
    revision: 3,
    delta: { campaignFloorState: { floor: 2, state: { keysCollected: 2, trophyLocksOpened: 1, collectedKeyIds: ["campaignKey-3"], hotSpringUsed: true } } },
  });

  assert.equal(updates.length, 3);
  assert.deepEqual(sorted(state.onlineParty.hostWorld.defeatedBossFloors), [1, 4]);
  assert.deepEqual(state.onlineParty.hostWorld.claimedBossRewardFloors, [1]);
  assert.equal(state.onlineParty.hostWorld.campaignFloorStates["1"], undefined);
  assert.deepEqual(state.onlineParty.hostWorld.campaignFloorStates["2"], { runId: null, keysCollected: 2, trophyLocksOpened: 1, collectedKeyIds: ["campaignKey-3"], hotSpringUsed: true, trophyMythicClaimed: false, replayActive: false, bossDefeatedThisRun: false });
  assert.deepEqual(sent.map(message => message.mutationId), ["build301-defeated-1", "build301-claimed-1", "build301-campaign-state-2"]);
  assert.equal(controller.recoverySettlementFailed, false);
});

test("build301 save migration converts every schema70 online ledger without corrupting offline campaign floors", async () => {
  const previousStorage = globalThis.localStorage, values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
  try {
    const { SaveService } = await import("../src/services/SaveService.js?build301-online-ledger-migration");
    const service = new SaveService();

    const build300 = structuredClone(service.state);
    build300.schemaVersion = 70;
    delete build300.lastMigration;
    Object.assign(build300.flags, { gameClear1000: false, gameClear10000: false, deepAbyssUnlocked: false, secondWorldEntered: false });
    Object.assign(build300.player, {
      maxFloor: 6, currentFloor: 6, checkpoint: 6,
      floorSeeds: { 6: 606 }, openedChests: { 6: ["offline-6-0"] },
      bossKills: { 6: 7, 100: 9, 1000: 1 },
      bossRewards: { 6: "gold-6", 100: "gold-100", 1000: "gold-1000" },
      pendingBossRewards: { 100: { rewardFormat: "build194-floor-boss-three-choice", options: ["a", "b", "c"] } },
    });
    build300.campaign100 = { version: 1, floors: { 6: { floor: 6, bossDefeated: true, bossDiscovered: true, exitUnlocked: true, keyIds: ["6-campaign-key-1", "6-campaign-key-2"], keysCollected: 2, trophyLocksOpened: 2, trophyClaimed: false } } };
    build300.onlineParty.firstCoopBossClears = [6, 100];
    build300.onlineParty.hostWorld = {
      ownerId: "AD-B3ZZ-TESX",
      revision: 4,
      floorSeeds: { 6: 6006, 100: 100100 },
      openedChestIds: { 6: ["6-0"], 100: ["100-1"] },
      defeatedBossFloors: [6, 100],
      claimedBossRewardFloors: [6],
      campaignFloorStates: {},
    };
    const repaired300 = service.migrate(build300);
    assert.deepEqual([repaired300.player.maxFloor, repaired300.player.currentFloor, repaired300.player.checkpoint], [6, 6, 6]);
    assert.deepEqual(repaired300.player.floorSeeds, { 6: 606 });
    assert.deepEqual(repaired300.player.openedChests, { 6: ["offline-6-0"] });
    assert.deepEqual(repaired300.onlineParty.firstCoopBossClears, [1, 10]);
    assert.deepEqual(repaired300.onlineParty.hostWorld.floorSeeds, {});
    assert.deepEqual(repaired300.onlineParty.hostWorld.openedChestIds, { 1: ["1-0"], 10: ["10-1"] });
    assert.deepEqual(repaired300.onlineParty.hostWorld.defeatedBossFloors, [1, 10]);
    assert.deepEqual(repaired300.onlineParty.hostWorld.claimedBossRewardFloors, [1]);
    assert.deepEqual(repaired300.player.bossKills, { 1: 1, 6: 7, 10: 1 });
    assert.deepEqual(repaired300.player.bossRewards, { 6: "CAMPAIGN_TROPHY_2" });
    assert.deepEqual(repaired300.player.pendingBossRewards, {});
    assert.equal(repaired300.campaign100.floors["1"].bossDefeated, true);
    assert.equal(repaired300.campaign100.floors["1"].trophyLocksOpened, 0);
    assert.equal(repaired300.campaign100.floors["10"].bossDefeated, true);
    assert.equal(repaired300.campaign100.floors["10"].trophyLocksOpened, 0);
    assert.equal(repaired300.campaign100.floors["6"].trophyLocksOpened, 2);
    assert.equal(repaired300.flags.gameClear1000, false);
    assert.equal(repaired300.flags.gameClear10000, false);
    assert.equal(repaired300.flags.deepAbyssUnlocked, false);
    assert.equal(repaired300.worldPhase, 0);

    const idempotent = service.migrate(structuredClone(repaired300));
    assert.deepEqual(idempotent.onlineParty.hostWorld, repaired300.onlineParty.hostWorld);
    assert.deepEqual(idempotent.campaign100.floors, repaired300.campaign100.floors);
    assert.deepEqual(idempotent.player.bossKills, repaired300.player.bossKills);
    assert.deepEqual(idempotent.player.bossRewards, repaired300.player.bossRewards);

    const legacy = structuredClone(service.state);
    legacy.schemaVersion = 69;
    legacy.onlineParty.firstCoopBossClears = [9, 10, 11, 600];
    legacy.onlineParty.hostWorld = {
      ownerId: "AD-B3ZZ-TESX",
      revision: 8,
      floorSeeds: { 9: 9, 10: 10, 600: 600 },
      openedChestIds: { 9: ["9-0", "shared"], 10: ["10-1", "shared"], 599: ["599-2"], 600: ["600-3"] },
      defeatedBossFloors: [9, 10, 11, 800],
      claimedBossRewardFloors: [10, 1000],
    };
    const repaired = service.migrate(legacy);
    assert.deepEqual(repaired.onlineParty.firstCoopBossClears, [1, 2, 60]);
    assert.deepEqual(repaired.onlineParty.hostWorld.floorSeeds, {}, "legacy seeds are discarded so 100-floor maps regenerate safely");
    assert.deepEqual(repaired.onlineParty.hostWorld.openedChestIds["1"], ["1-0", "shared", "1-1"]);
    assert.deepEqual(repaired.onlineParty.hostWorld.openedChestIds["60"], ["60-2", "60-3"]);
    assert.deepEqual(repaired.onlineParty.hostWorld.defeatedBossFloors, [1, 2, 80]);
    assert.deepEqual(repaired.onlineParty.hostWorld.claimedBossRewardFloors, [1, 100]);

    const current = structuredClone(service.state);
    current.schemaVersion = 71;
    current.lastMigration = { from: 69, to: 70, at: "2026-08-31T00:00:00.000Z" };
    current.onlineParty.firstCoopBossClears = [6, 100];
    current.onlineParty.hostWorld = { ownerId: "AD-B3ZZ-TESX", revision: 4, floorSeeds: { 6: 6 }, openedChestIds: { 6: ["6-0"] }, defeatedBossFloors: [6, 100], claimedBossRewardFloors: [6], campaignFloorStates: { 6: { runId: "current", keysCollected: 2, trophyLocksOpened: 1, collectedKeyIds: ["key-1", "key-2"] } } };
    const preserved71 = service.migrate(current);
    assert.deepEqual(preserved71.onlineParty.firstCoopBossClears, [6, 100]);
    assert.deepEqual(preserved71.onlineParty.hostWorld.floorSeeds, { 6: 6 });
    assert.deepEqual(preserved71.onlineParty.hostWorld.openedChestIds, { 6: ["6-0"] });
    assert.equal(preserved71.onlineParty.hostWorld.campaignFloorStates["6"].trophyLocksOpened, 1);

    const canonical = structuredClone(service.state);
    canonical.schemaVersion = 70;
    canonical.player.bossKills = {};
    canonical.player.bossRewards = { 42: "CAMPAIGN_TROPHY_COMPLETE", 43: "gold-43" };
    canonical.campaign100 = { version: 1, floors: {} };
    const rescued = service.migrate(canonical);
    assert.equal(rescued.campaign100.floors["42"].bossDefeated, true);
    assert.equal(rescued.campaign100.floors["42"].keysCollected, 3);
    assert.equal(rescued.campaign100.floors["42"].trophyLocksOpened, 3);
    assert.equal(rescued.campaign100.floors["42"].trophyClaimed, true);
    assert.equal(rescued.campaign100.floors["43"], undefined);
    assert.deepEqual(rescued.player.bossRewards, { 42: "CAMPAIGN_TROPHY_COMPLETE" });
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});
