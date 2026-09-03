import test from "node:test";
import assert from "node:assert/strict";
import { OnlinePartyController } from "../src/online/OnlinePartyClient.js?build308-online-campaign-client-ledger";

function hostSnapshot({ onlineFloor, localFloor }) {
  const state = {
    player: { floorSeeds: {}, openedChests: {}, bossKills: {}, bossRewards: {} },
    campaign100: { floors: localFloor ? { 80: localFloor } : {} },
    onlineParty: {
      firstCoopBossClears: [],
      hostWorld: {
        revision: 1,
        floorSeeds: {},
        openedChestIds: {},
        defeatedBossFloors: [],
        claimedBossRewardFloors: [],
        campaignFloorStates: onlineFloor ? { 80: onlineFloor } : {},
      },
    },
  };
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, { getState: () => state, hostWorldRevision: 1, roomState: { selectedFloor: 80 } });
  return controller._hostWorldSnapshot().campaignFloorStates["80"];
}

test("Build308 normal reentry merges per-boss receipts even when run identifiers differ", () => {
  const floor = hostSnapshot({
    onlineFloor: {
      runId: "network-entry-a", replayActive: false,
      defeatedBossIds: ["ten_time"], openedBossIds: ["ten_time"],
      mythicClaimedBossIds: ["ten_time"], fragmentPacksClaimedByBoss: { ten_time: 3 },
    },
    localFloor: {
      runId: "local-entry-b", replayActive: false, keyIds: [],
      bossProgress: {
        ten_time: { defeated: false, trophyLocksOpened: 0, trophyFragmentPacksClaimed: 0, trophyClaimed: true },
        ten_space: { defeated: true, trophyLocksOpened: 0, trophyFragmentPacksClaimed: 1, trophyClaimed: false },
      },
    },
  });
  assert.equal(floor.runId, "local-entry-b");
  assert.deepEqual(floor.defeatedBossIds, ["ten_time", "ten_space"]);
  assert.deepEqual(floor.openedBossIds, ["ten_time"]);
  assert.deepEqual(floor.claimedBossIds, floor.openedBossIds, "legacy alias follows current-run chest openings");
  assert.deepEqual(floor.mythicClaimedBossIds, ["ten_time"]);
  assert.deepEqual(floor.fragmentPacksClaimedByBoss, { ten_time: 3, ten_space: 1 });
});

test("Build308 local replay resets run receipts while retaining lifetime mythic ownership", () => {
  const floor = hostSnapshot({
    onlineFloor: {
      runId: "clear-run", replayActive: false, keysCollected: 3,
      defeatedBossIds: ["ten_time"], openedBossIds: ["ten_time"],
      mythicClaimedBossIds: ["ten_time"], fragmentPacksClaimedByBoss: { ten_time: 3 },
    },
    localFloor: {
      runId: "replay-run", replayActive: true, keyIds: [], hotSpringUsed: false,
      bossProgress: {
        ten_time: { defeated: false, trophyLocksOpened: 0, trophyFragmentPacksClaimed: 0, trophyClaimed: true },
        ten_space: { defeated: false, trophyLocksOpened: 0, trophyFragmentPacksClaimed: 0, trophyClaimed: false },
      },
    },
  });
  assert.equal(floor.runId, "replay-run");
  assert.equal(floor.keysCollected, 0);
  assert.deepEqual(floor.defeatedBossIds, []);
  assert.deepEqual(floor.openedBossIds, []);
  assert.deepEqual(floor.claimedBossIds, []);
  assert.deepEqual(floor.fragmentPacksClaimedByBoss, {});
  assert.deepEqual(floor.mythicClaimedBossIds, ["ten_time"]);
});

test("Build308 an explicit server replay is authoritative over a stale local replay", () => {
  const floor = hostSnapshot({
    onlineFloor: {
      runId: "server-replay", replayActive: true,
      defeatedBossIds: [], openedBossIds: [], mythicClaimedBossIds: ["ten_time"], fragmentPacksClaimedByBoss: {},
    },
    localFloor: {
      runId: "stale-local-replay", replayActive: true, keyIds: ["stale-key"],
      bossProgress: {
        ten_space: { defeated: true, trophyLocksOpened: 3, trophyFragmentPacksClaimed: 3, trophyClaimed: true },
      },
    },
  });
  assert.equal(floor.runId, "server-replay");
  assert.equal(floor.keysCollected, 0);
  assert.deepEqual(floor.defeatedBossIds, []);
  assert.deepEqual(floor.openedBossIds, []);
  assert.deepEqual(floor.fragmentPacksClaimedByBoss, {});
  assert.deepEqual(floor.mythicClaimedBossIds, ["ten_time", "ten_space"]);
});

test("Build308 legacy claimedBossIds safely seeds both split receipt ledgers", () => {
  const floor = hostSnapshot({ onlineFloor: { runId: "legacy", claimedBossIds: ["ten_time"] } });
  assert.deepEqual(floor.openedBossIds, ["ten_time"]);
  assert.deepEqual(floor.claimedBossIds, ["ten_time"]);
  assert.deepEqual(floor.mythicClaimedBossIds, ["ten_time"]);
  assert.deepEqual(floor.defeatedBossIds, ["ten_time"]);
});

test("Build308 save normalization preserves split ledgers and clears only explicit replay runs", async () => {
  const previousStorage = globalThis.localStorage, values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
  try {
    const { SaveService } = await import("../src/services/SaveService.js?build308-online-campaign-client-ledger");
    const service = new SaveService(), replay = structuredClone(service.state);
    replay.onlineParty.hostWorld.campaignFloorStates = {
      80: {
        runId: "old-run", replayActive: false, defeatedBossIds: ["ten_time"], openedBossIds: ["ten_time"],
        mythicClaimedBossIds: ["ten_time"], fragmentPacksClaimedByBoss: { ten_time: 3 },
      },
      "080": {
        runId: "new-replay", replayActive: true, defeatedBossIds: [], openedBossIds: [],
        mythicClaimedBossIds: ["ten_time"], fragmentPacksClaimedByBoss: {},
      },
    };
    const replayFloor = service.migrate(replay).onlineParty.hostWorld.campaignFloorStates["80"];
    assert.equal(replayFloor.runId, "new-replay");
    assert.deepEqual(replayFloor.defeatedBossIds, []);
    assert.deepEqual(replayFloor.openedBossIds, []);
    assert.deepEqual(replayFloor.claimedBossIds, []);
    assert.deepEqual(replayFloor.fragmentPacksClaimedByBoss, {});
    assert.deepEqual(replayFloor.mythicClaimedBossIds, ["ten_time"]);

    const reentry = structuredClone(service.state);
    reentry.onlineParty.hostWorld.campaignFloorStates = {
      80: {
        runId: "entry-a", replayActive: false, defeatedBossIds: ["ten_time"], openedBossIds: ["ten_time"],
        mythicClaimedBossIds: ["ten_time"], fragmentPacksClaimedByBoss: { ten_time: 3 },
      },
      "080": {
        runId: "entry-b", replayActive: false, defeatedBossIds: ["ten_space"], openedBossIds: [],
        mythicClaimedBossIds: [], fragmentPacksClaimedByBoss: { ten_space: 1 },
      },
    };
    const reentryFloor = service.migrate(reentry).onlineParty.hostWorld.campaignFloorStates["80"];
    assert.equal(reentryFloor.runId, "entry-b");
    assert.deepEqual(reentryFloor.defeatedBossIds, ["ten_time", "ten_space"]);
    assert.deepEqual(reentryFloor.openedBossIds, ["ten_time"]);
    assert.deepEqual(reentryFloor.mythicClaimedBossIds, ["ten_time"]);
    assert.deepEqual(reentryFloor.fragmentPacksClaimedByBoss, { ten_time: 3, ten_space: 1 });
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});
