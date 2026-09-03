import test from "node:test";
import assert from "node:assert/strict";

import {
  SaveService,
  recoverPendingCampaignFinalFlow,
} from "../src/services/SaveService.js?build305-migration";
import {
  collectCampaignKey,
  normalizeCampaignState,
  trophyChestEntitlements,
} from "../src/core/Campaign100System.js?build305-migration";
import {
  beginGuestProgressIsolation,
  captureLocalProgress,
  finishGuestProgressIsolation,
  recoverInterruptedGuestProgress,
} from "../src/online/OnlineProgressIsolation.js?build305-migration";
import { APP_VERSION, SAVE_SCHEMA_VERSION } from "../src/core/config.js?build305-migration";

const previousStorage = globalThis.localStorage;
const stored = new Map();
globalThis.localStorage = {
  getItem: key => stored.get(key) ?? null,
  setItem: (key, value) => stored.set(key, String(value)),
  removeItem: key => stored.delete(key),
};
test.after(() => {
  if (previousStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = previousStorage;
});

const fresh = () => {
  stored.clear();
  return new SaveService();
};
const isRecord = value => Boolean(value && typeof value === "object" && !Array.isArray(value));

test("Build305 rejects phantom campaign keys and non-string pickup identifiers", () => {
  for (const floorState of [
    { keysCollected: "3", keyIds: [] },
    { keysCollected: Infinity, keyIds: [] },
    { keysCollected: 3, keyIds: [null, 1, {}] },
  ]) {
    const state = {
      player: { bossRewards: {} },
      campaign100: {
        version: 4,
        floors: { 8: { bossDefeated: true, bossClearVersion: 2, trophyRewardVersion: 2, ...floorState } },
      },
    };
    normalizeCampaignState(state);
    assert.equal(state.campaign100.floors[8].keysCollected, 0);
    assert.equal(trophyChestEntitlements(state, 8).available, false);
    assert.equal(collectCampaignKey(state, 8, {} ).collected, false);
  }

  const legitimate = {
    player: { bossRewards: {} },
    campaign100: { version: 4, floors: { 8: { bossDefeated: true, bossClearVersion: 2, trophyRewardVersion: 2 } } },
  };
  for (let index = 1; index <= 3; index += 1) {
    assert.equal(collectCampaignKey(legitimate, 8, `8-campaign-key-${index}`).collected, true);
  }
  assert.equal(collectCampaignKey(legitimate, 8, "8-campaign-key-4").collected, false);
  assert.equal(trophyChestEntitlements(legitimate, 8).available, true);

  const missingVersion = {
    player: { bossRewards: {} },
    campaign100: { version: 4, floors: { 8: { bossDefeated: true, keysCollected: 3 } } },
  };
  normalizeCampaignState(missingVersion);
  assert.equal(missingVersion.campaign100.floors[8].keysCollected, 0);
  assert.equal(trophyChestEntitlements(missingVersion, 8).available, false);

  const service = fresh(), onlinePhantom = structuredClone(service.state);
  onlinePhantom.schemaVersion = 74;
  onlinePhantom.onlineParty.hostWorld.campaignFloorStates = { 8: { keysCollected: 3, collectedKeyIds: [] } };
  const onlineContained = service.migrate(onlinePhantom);
  assert.equal(onlineContained.onlineParty.hostWorld.campaignFloorStates[8].keysCollected, 0);
});

test("Build305 reconciles complete and partial trophy receipts without minting a reward", () => {
  const service = fresh();
  const complete = structuredClone(service.state);
  complete.schemaVersion = 74;
  complete.equipment.push({ id: "sentinel-gear", slot: "weapon", name: "既存装備" });
  complete.player.bossRewards = { 8: "CAMPAIGN_TROPHY_COMPLETE" };
  complete.campaign100 = {
    version: 4,
    floors: {
      8: {
        bossDefeated: true,
        bossClearVersion: 2,
        trophyRewardVersion: 2,
        trophyClaimed: false,
        trophyLocksOpened: 0,
        keyIds: ["8-campaign-key-1", "8-campaign-key-2", "8-campaign-key-3"],
        keysCollected: 3,
      },
    },
  };
  const equipmentBefore = complete.equipment.length;
  const settled = service.migrate(complete);
  assert.equal(SAVE_SCHEMA_VERSION, 75);
  assert.equal(APP_VERSION, "3.0.9");
  assert.equal(settled.schemaVersion, 75);
  assert.equal(settled.appVersion, "3.0.9");
  assert.equal(settled.campaign100.floors[8].trophyClaimed, true);
  assert.equal(settled.campaign100.floors[8].trophyLocksOpened, 3);
  assert.equal(settled.campaign100.floors[8].keysConsumed, 3);
  assert.equal(trophyChestEntitlements(settled, 8).available, false);
  assert.equal(settled.equipment.length, equipmentBefore);

  const partial = structuredClone(service.state);
  partial.schemaVersion = 74;
  partial.player.bossRewards = { 9: "CAMPAIGN_TROPHY_2" };
  partial.campaign100 = { version: 4, floors: {} };
  const rescued = service.migrate(partial);
  assert.equal(rescued.campaign100.floors[9].bossDefeated, true);
  assert.equal(rescued.campaign100.floors[9].trophyLocksOpened, 0);
  assert.equal(rescued.campaign100.floors[9].trophyFragmentPacksClaimed, 2);
  assert.equal(trophyChestEntitlements(rescued, 9).missingKeys, 1);
  collectCampaignKey(rescued, 9, "9-campaign-key-3");
  const entitlement = trophyChestEntitlements(rescued, 9);
  assert.equal(entitlement.available, true);
  assert.equal(entitlement.fragmentPacks, 1);
  assert.equal(entitlement.equipmentGuaranteed, true);

  const twice = service.migrate(structuredClone(settled));
  assert.deepEqual(twice.campaign100, settled.campaign100);
  assert.deepEqual(twice.player.bossRewards, settled.player.bossRewards);
  assert.equal(twice.equipment.length, equipmentBefore);
});

test("Build305 rebuilds the compatibility receipt from authoritative campaign settlement", () => {
  const state = {
    player: { bossRewards: {} },
    campaign100: {
      version: 4,
      floors: {
        12: {
          bossDefeated: true,
          bossClearVersion: 2,
          trophyRewardVersion: 2,
          trophyClaimed: true,
          trophyLocksOpened: 3,
          keyIds: ["12-campaign-key-1", "12-campaign-key-2", "12-campaign-key-3"],
        },
      },
    },
  };
  normalizeCampaignState(state);
  assert.equal(state.player.bossRewards[12], "CAMPAIGN_TROPHY_COMPLETE");
  assert.equal(trophyChestEntitlements(state, 12).available, false);
});

test("Build305 merges floor aliases and keeps the strongest trophy receipt", () => {
  const state = {
    player: {
      bossRewards: {
        8: "CAMPAIGN_TROPHY_COMPLETE",
        "08": "CAMPAIGN_TROPHY_1",
      },
    },
    campaign100: {
      version: 4,
      floors: {
        8: {
          bossDefeated: true,
          trophyClaimed: true,
          trophyLocksOpened: 3,
          trophyRewardVersion: 2,
          keyIds: ["8-campaign-key-1", "8-campaign-key-2", "8-campaign-key-3"],
        },
        "08": { bossDefeated: false, trophyClaimed: false },
      },
    },
  };
  normalizeCampaignState(state);
  assert.deepEqual(Object.keys(state.campaign100.floors), ["8"]);
  assert.equal(state.campaign100.floors[8].bossDefeated, true);
  assert.equal(state.campaign100.floors[8].trophyClaimed, true);
  assert.equal(state.campaign100.floors[8].trophyLocksOpened, 3);
  assert.equal(state.player.bossRewards[8], "CAMPAIGN_TROPHY_COMPLETE");
  assert.equal(trophyChestEntitlements(state, 8).available, false);
});

test("Build305 rescues broken schema metadata and safely merges legacy floor collisions", () => {
  const service = fresh();
  const legacy = structuredClone(service.state);
  legacy.schemaVersion = "broken";
  Object.assign(legacy.player, { maxFloor: 1000, currentFloor: 1000, checkpoint: 991 });
  legacy.player.bossKills = { 1: 1, 10: 0, 1000: 1, invalid: 999 };
  legacy.player.bossRewards = { 1000: "legacy-final-reward", invalid: "bad" };
  legacy.onlineParty.firstCoopBossClears = [null, "invalid", 1000];
  legacy.onlineParty.hostWorld = {
    openedChestIds: {}, floorSeeds: {}, campaignFloorStates: {},
    defeatedBossFloors: [null, "invalid", 1000], claimedBossRewardFloors: [],
  };

  const migrated = service.migrate(legacy);
  assert.equal(migrated.player.maxFloor, 100);
  assert.equal(migrated.player.currentFloor, 100);
  assert.equal(migrated.flags.gameClear1000, true);
  assert.equal(migrated.player.bossKills[1], 1, "a later zero must not erase an earlier clear in the same ten-floor bucket");
  assert.equal(migrated.player.bossKills[100], 1);
  assert.equal(migrated.player.bossKills.invalid, undefined);
  assert.deepEqual(migrated.onlineParty.firstCoopBossClears, [100]);
  assert.deepEqual(migrated.onlineParty.hostWorld.defeatedBossFloors, [100]);
  assert.equal(migrated.campaign100.floors[1].bossDefeated, true);
  assert.equal(migrated.campaign100.floors[100].bossDefeated, true);

  const twice = service.migrate(structuredClone(migrated));
  assert.deepEqual(twice.campaign100, migrated.campaign100);
  assert.deepEqual(twice.onlineParty.hostWorld, migrated.onlineParty.hostWorld);

  const invalidCoordinates = structuredClone(service.state);
  invalidCoordinates.schemaVersion = "broken";
  invalidCoordinates.player.maxFloor = Infinity;
  invalidCoordinates.player.currentFloor = "Infinity";
  invalidCoordinates.player.checkpoint = "not-a-floor";
  invalidCoordinates.flags.gameClear1000 = "false";
  invalidCoordinates.flags.secondWorldEntered = "false";
  const contained = service.migrate(invalidCoordinates);
  assert.equal(contained.player.maxFloor, 1);
  assert.equal(contained.player.currentFloor, 1);
  assert.equal(contained.player.checkpoint, 1);
  assert.equal(contained.flags.gameClear1000, false);
  assert.equal(contained.flags.secondWorldEntered, false);
});

test("Build305 contains malformed root records instead of losing the whole save", () => {
  const service = fresh();
  const malformed = structuredClone(service.state);
  malformed.schemaVersion = 74;
  malformed.flags = "bad-flags";
  malformed.campaign100 = [];
  malformed.settings = 42;
  malformed.gacha = true;
  malformed.codex = [];
  malformed.biomeProgress = "bad-biomes";
  malformed.achievements = [];
  malformed.quests = false;
  malformed.rest = "bad-rest";
  malformed.records = [];
  malformed.endgame = "bad-endgame";
  malformed.monsters[0].nickname = "残す仲間";

  const migrated = service.migrate(malformed);
  for (const key of ["flags", "campaign100", "settings", "gacha", "codex", "biomeProgress", "achievements", "quests", "rest", "records", "endgame"]) {
    assert.equal(isRecord(migrated[key]), true, `${key} must be a JSON record`);
  }
  assert.equal(migrated.monsters[0].nickname, "残す仲間");
  const roundTrip = JSON.parse(JSON.stringify(migrated));
  assert.equal(isRecord(roundTrip.campaign100), true);
  assert.equal(isRecord(roundTrip.settings), true);

  const badPlayer = structuredClone(service.state);
  badPlayer.schemaVersion = 74;
  badPlayer.player = "bad-player";
  assert.doesNotThrow(() => service.migrate(badPlayer));
});

test("Build305 contains primitive nested ledgers without resetting the player's save", () => {
  const service = fresh();
  const paths = [
    ["returnRewards"],
    ["returnRewards", "manual"],
    ["returnRewards", "history"],
    ["returnRewards", "idle"],
    ["secondWorld"],
    ["secondWorld", "randomEvents"],
    ["secondWorld", "elites"],
    ["endgame", "teamBattle"],
    ["endgame", "trials"],
    ["endgame", "emergency"],
    ["endgame", "emergency", "rescue"],
  ];
  const setAtPath = (root, path, value) => {
    let cursor = root;
    for (const key of path.slice(0, -1)) cursor = cursor[key];
    cursor[path.at(-1)] = value;
  };
  const valueAtPath = (root, path) => path.reduce((value, key) => value?.[key], root);

  for (const path of paths) {
    for (const primitive of ["broken", 7, true]) {
      const malformed = structuredClone(service.state);
      malformed.schemaVersion = 74;
      malformed.monsters[0].nickname = "残す仲間";
      setAtPath(malformed, path, primitive);
      const migrated = service.migrate(malformed);
      assert.equal(migrated.monsters[0].nickname, "残す仲間", `${path.join(".")} must not trigger a full reset`);
      assert.equal(isRecord(valueAtPath(migrated, path)), true, `${path.join(".")} must become a JSON record`);
    }
  }
});

test("Build305 infers current and legacy coordinates when schema metadata is corrupt", () => {
  const service = fresh();
  for (const metadata of [
    { schemaVersion: "broken", appVersion: "3.0.4" },
    { schemaVersion: Infinity, appVersion: "unknown" },
  ]) {
    const current = structuredClone(service.state);
    Object.assign(current, metadata);
    current.campaign100.version = 4;
    Object.assign(current.player, { maxFloor: 80, currentFloor: 80, checkpoint: 75 });
    const migrated = service.migrate(current);
    assert.equal(migrated.player.maxFloor, 80);
    assert.equal(migrated.player.currentFloor, 80);
    assert.equal(migrated.player.checkpoint, 75);
  }

  const pollutedCurrent = structuredClone(service.state);
  pollutedCurrent.schemaVersion = "broken";
  pollutedCurrent.appVersion = "3.0.4";
  pollutedCurrent.campaign100.version = 4;
  Object.assign(pollutedCurrent.player, {
    maxFloor: 80,
    currentFloor: 80,
    checkpoint: 75,
    bossKills: { 80: 1, 1000: 1 },
    bossRewards: { 80: "CAMPAIGN_TROPHY_COMPLETE", 1000: "stale-pollution" },
  });
  const cleanedCurrent = service.migrate(pollutedCurrent);
  assert.equal(cleanedCurrent.player.maxFloor, 80, "a stale high ledger must not divide a modern coordinate by ten");
  assert.equal(cleanedCurrent.player.bossKills[80], 1);
  assert.equal(Object.hasOwn(cleanedCurrent.player.bossKills, "1000"), false);
  assert.equal(Object.hasOwn(cleanedCurrent.player.bossRewards, "1000"), false);

  for (const appVersion of ["2.11.87", undefined]) {
    const legacy = structuredClone(service.state);
    legacy.schemaVersion = 999;
    if (appVersion === undefined) delete legacy.appVersion;
    else legacy.appVersion = appVersion;
    delete legacy.campaign100;
    Object.assign(legacy.player, {
      maxFloor: 1000,
      currentFloor: 1000,
      checkpoint: 991,
      bossKills: { 1000: 1 },
      bossRewards: { 1000: "legacy-final" },
    });
    const migrated = service.migrate(legacy);
    assert.equal(migrated.player.maxFloor, 100);
    assert.equal(migrated.player.currentFloor, 100);
    assert.equal(migrated.player.checkpoint, 100);
    assert.equal(migrated.flags.gameClear1000, true);
    assert.equal(migrated.player.bossKills[100], 1);
    assert.equal(Object.hasOwn(migrated.player.bossKills, "1000"), false);
  }
});

test("Build305 preserves a valid runtime final checkpoint and recovers an empty one", () => {
  const valid = {
    player: { inRun: true },
    monsters: [{ id: "m1" }],
    party: ["m1"],
    activeBattle: {
      specialBattle: true,
      specialBattleType: "campaignFinal",
      campaignStage: "party",
      enemies: [{ id: "hero-1", hp: 10 }],
    },
    campaign100: {
      finalPartyBackup: ["m1"],
      finalVitals: { m1: { hp: 70, mp: 9, ailments: [] } },
      finalStage: "party",
    },
  };
  const validBefore = structuredClone(valid);
  assert.deepEqual(recoverPendingCampaignFinalFlow(valid), { recovered: false, checkpointReady: true });
  assert.deepEqual(valid, validBefore);

  const broken = structuredClone(validBefore);
  delete broken.activeBattle.enemies;
  broken.expeditionSnapshot = { marker: "broken-final" };
  broken.monsters[0].currentHp = 1;
  const recovered = recoverPendingCampaignFinalFlow(broken);
  assert.equal(recovered.recovered, true);
  assert.equal(recovered.stage, "party");
  assert.equal(Object.hasOwn(broken, "activeBattle"), false);
  assert.equal(broken.expeditionSnapshot, null);
  assert.equal(broken.player.inRun, false);
  assert.equal(broken.monsters[0].currentHp, 70);

  const protectedBattle = structuredClone(validBefore);
  protectedBattle.activeBattle = { specialBattle: true, specialBattleType: "gauntlet", enemies: [] };
  const protectedBefore = structuredClone(protectedBattle);
  assert.deepEqual(recoverPendingCampaignFinalFlow(protectedBattle), { recovered: false, protectedBattle: true });
  assert.deepEqual(protectedBattle, protectedBefore);
});

test("Build305 snapshot v2 restores campaign100 and every current co-op floor while keeping earned assets", () => {
  const service = fresh();
  const state = structuredClone(service.state);
  state.player.gold = 1200;
  state.onlineParty.firstCoopBossClears = [1, 2, 8, 10, 20, 100];
  state.campaign100 = {
    version: 4,
    floors: { 8: { bossDefeated: true, bossClearVersion: 2, cleared: true } },
    endings: ["comeback"],
    finalUnlocked: false,
    finalCompleted: true,
  };
  const campaignBefore = structuredClone(state.campaign100);
  const entered = beginGuestProgressIsolation(state, { roomId: "ROOM", ownerId: "host", selfId: "guest", runId: "run-1" });
  assert.equal(entered.captured, true);
  assert.equal(entered.session.snapshot.version, 2);

  state.campaign100 = { version: 4, floors: { 99: { bossDefeated: true } }, endings: ["defeat"] };
  state.onlineParty.firstCoopBossClears = [99];
  state.player.gold += 77;
  state.monsters[0].level += 3;
  const reconnected = beginGuestProgressIsolation(state, { roomId: "ROOM", ownerId: "host", selfId: "guest", runId: "run-1" });
  assert.equal(reconnected.restored, true);
  assert.deepEqual(state.campaign100, campaignBefore);
  assert.deepEqual(state.onlineParty.firstCoopBossClears, [1, 2, 8, 10, 20, 100]);
  assert.equal(state.player.gold, 1277, "earned GOLD is deliberately outside the progression rollback");
  assert.equal(state.monsters[0].level, service.state.monsters[0].level + 3);

  state.campaign100.floors = { 77: { bossDefeated: true } };
  assert.equal(finishGuestProgressIsolation(state, { reason: "leave" }).restored, true);
  assert.deepEqual(state.campaign100, campaignBefore);
});

test("Build305 keeps v1 guest snapshots readable without overwriting campaign100", () => {
  const service = fresh();
  const state = structuredClone(service.state);
  state.onlineParty.firstCoopBossClears = [10, 20];
  const current = captureLocalProgress(state);
  const legacy = { ...current, version: 1 };
  delete legacy.campaign100;
  const campaignCurrent = { version: 4, floors: { 33: { bossDefeated: true } }, endings: ["defeat"] };
  state.campaign100 = structuredClone(campaignCurrent);
  state.player.maxFloor = 99;
  state.onlineParty.progressIsolation = {
    version: 1,
    activeGuestSession: {
      version: 1,
      roomId: "OLD",
      ownerId: "host",
      selfId: "guest",
      runId: "legacy-run",
      capturedAt: 1,
      snapshot: legacy,
    },
  };
  const result = recoverInterruptedGuestProgress(state, 2);
  assert.equal(result.restored, true);
  assert.deepEqual(state.campaign100, campaignCurrent, "v1 had no campaign receipt and must not erase the current one");
  assert.equal(state.player.maxFloor, current.player.maxFloor);
});

test("Build305 remaps old 1000-floor progression restored from a v1 guest snapshot", () => {
  const service = fresh(), state = structuredClone(service.state), snapshot = captureLocalProgress(state);
  snapshot.version = 1;
  delete snapshot.campaign100;
  Object.assign(snapshot.player, {
    maxFloor: 1000,
    currentFloor: 1000,
    checkpoint: 991,
    bossKills: { 1000: 1 },
    bossRewards: { 1000: "legacy-final-reward" },
  });
  snapshot.onlineWorld.firstCoopBossClears = [1000];
  state.campaign100 = { version: 4, floors: { 5: { bossDefeated: true, bossClearVersion: 2 } } };
  state.onlineParty.progressIsolation = {
    version: 1,
    activeGuestSession: {
      version: 1,
      roomId: "OLD1000",
      ownerId: "host",
      selfId: "guest",
      runId: "legacy-1000",
      capturedAt: 1,
      snapshot,
    },
  };

  const migrated = service.migrate(state);
  assert.equal(migrated.player.maxFloor, 100);
  assert.equal(migrated.player.currentFloor, 100);
  assert.equal(migrated.player.checkpoint, 100);
  assert.equal(migrated.player.bossKills[100], 1);
  assert.equal(migrated.campaign100.floors[5].bossDefeated, true);
  assert.equal(migrated.campaign100.floors[100].bossDefeated, true);
  assert.deepEqual(migrated.onlineParty.firstCoopBossClears, [100]);
});
