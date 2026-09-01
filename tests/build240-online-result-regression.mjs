import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) };
globalThis.location = { search: "", protocol: "https:" };
globalThis.WebSocket = { OPEN: 1, CONNECTING: 0 };

const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?build240-result-barrier");

function between(start, end) {
  const from = main.indexOf(start), to = main.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `source block ${start}`);
  return main.slice(from, to);
}

const resultFunctions = [
  between("function applyOnlineVitalsUpdate", "function beginOnlineExpeditionResultRun"),
  between("function beginOnlineExpeditionResultRun", "function settleOnlineExpeditionResult"),
  between("function settleOnlineExpeditionResult", "function persistOnlineBattleDefeated"),
].join("\n");

function fixture({ owner = true, defeat = false, inRun = true } = {}) {
  let generated = 0, saveCalls = 0;
  const state = {
    onlineParty: {
      claimedRewards: [], processedVitalMutationIds: [], processedBattleEventIds: [], processedExpeditionResultIds: [], completedExpeditionRunIds: [],
      coopContributionHistory: [],
      activeExpeditionRunId: "run-A", activeManualExploreRunId: "explore-A", activeExpeditionOwnerId: "SELF", hostWorld: { openedChestIds: {}, floorSeeds: {} },
    },
    player: { gold: 10_000, checkpoint: 3, currentFloor: 500, maxFloor: 500, inRun, exploreRun: { id: "solo-B", floors: { 500: true } } },
    returnRewards: { manual: { active: true, startFloor: 500, lastFloor: 500, floorsCleared: 0, pendingGold: 777, startedAt: 1 } },
    monsters: [],
  };
  const save = { state, save: () => { saveCalls += 1; return true; } };
  const context = {
    save, structuredClone: undefined, WORLD_MAX_FLOOR: 10_000,
    onlinePartyController: { selfId: "SELF" },
    onlinePartyPersistentState: () => save.state.onlineParty,
    calculatedStats: () => ({ hp: 100 }), maxMp: () => 20,
    goldForClearedFloor: floor => floor * 10,
    beginManualExpedition(target, floor) {
      target.returnRewards.manual = { active: true, startFloor: floor, lastFloor: floor, floorsCleared: 0, pendingGold: 0, startedAt: 2 };
      target.player.exploreRun = { id: `generated-${++generated}`, floors: {} };
    },
    recordManualFloorClear(target, floor) { target.returnRewards.manual.lastFloor = floor; target.returnRewards.manual.floorsCleared += 1; target.returnRewards.manual.pendingGold += 50; },
    claimManualReturn(target) { const result = { pendingGold: target.returnRewards.manual.pendingGold }; target.returnRewards.manual.active = false; return result; },
    abandonManualExpedition(target) { target.returnRewards.manual.active = false; },
  };
  vm.runInNewContext(`${resultFunctions}\nthis.api={applyOnlineVitalsUpdate,beginOnlineExpeditionResultRun,settleOnlineExpeditionResult,recoverOrphanedOnlineExpedition};`, context);
  const event = {
    runId: "run-A", resultId: `result-${defeat ? "defeat" : "return"}`, ownerId: owner ? "SELF" : "OTHER", recipientId: "SELF",
    progressionEligible: owner,
    startFloor: 10, endFloor: 12, floorsCleared: 2, reason: defeat ? "defeat" : "return",
    finalVitals: { mutationId: "vitals-A", monsterId: "released-monster", hp: 1, mp: 0 },
  };
  return { state, save, api: context.api, event, saveCalls: () => saveCalls };
}

test("build240 delayed online success preserves a newer offline manual run", () => {
  const { state, api, event } = fixture();
  const manual = JSON.parse(JSON.stringify(state.returnRewards.manual)), exploreRun = JSON.parse(JSON.stringify(state.player.exploreRun));
  const result = api.settleOnlineExpeditionResult(event);
  assert.equal(result.ok, true);
  assert.deepEqual(JSON.parse(JSON.stringify(state.returnRewards.manual)), manual);
  assert.deepEqual(JSON.parse(JSON.stringify(state.player.exploreRun)), exploreRun);
  assert.equal(state.player.currentFloor, 500);
  assert.equal(state.player.inRun, true);
  assert.ok(state.onlineParty.processedVitalMutationIds.includes("vitals-A"));
  assert.ok(state.onlineParty.completedExpeditionRunIds.includes("run-A"));
});

test("build240 delayed defeat preserves the newer run and settles once", () => {
  const { state, api, event } = fixture({ defeat: true });
  const manual = JSON.parse(JSON.stringify(state.returnRewards.manual)), exploreRun = JSON.parse(JSON.stringify(state.player.exploreRun));
  const first = api.settleOnlineExpeditionResult(event), gold = state.player.gold;
  assert.equal(first.ok, true);
  assert.equal(first.defeat.preservedRun, true);
  assert.deepEqual(JSON.parse(JSON.stringify(state.returnRewards.manual)), manual);
  assert.deepEqual(JSON.parse(JSON.stringify(state.player.exploreRun)), exploreRun);
  assert.equal(state.player.currentFloor, 500);
  assert.equal(state.player.inRun, true);
  assert.equal(api.settleOnlineExpeditionResult(event).duplicate, true);
  assert.equal(state.player.gold, gold);
});

test("build240 a released expedition monster becomes an idempotent vitals tombstone", () => {
  const { state, api, event } = fixture({ owner: false, inRun: false });
  const result = api.settleOnlineExpeditionResult(event);
  assert.equal(result.ok, true);
  assert.equal(result.guest, true);
  assert.ok(state.onlineParty.processedVitalMutationIds.includes("vitals-A"));
  assert.ok(state.onlineParty.processedExpeditionResultIds.includes(event.resultId));
});

test("build244 guest contribution is saved exactly once without advancing normal progression", () => {
  const { state, api, event, saveCalls } = fixture({ owner: false, inRun: false });
  state.onlineParty.coopContributionHistory = Array.from({ length: 128 }, (_, index) => ({ resultId: `old-${index}`, pings: index }));
  const before = { currentFloor: state.player.currentFloor, maxFloor: state.player.maxFloor };
  Object.assign(event, {
    multiplayer: true, completed: true, finishedAt: 244_000,
    assistedWorld: { ownerId: "OTHER", startFloor: 200, endFloor: 203, floorsCleared: 3 },
    summary: { multiplayer: true, ranking: [
      { playerId: "OTHER", name: "部屋主", rank: 1, score: 999 },
      { playerId: "SELF", name: "お手伝い", rank: 2, exploration: 3, combat: 700, rescue: 1, chests: 2, switches: 1, gimmicks: 2, pings: 4, support: 25, score: 2440, mvpTitles: ["救助王"] },
    ] },
  });
  delete event.startFloor; delete event.endFloor; delete event.floorsCleared;

  const first = api.settleOnlineExpeditionResult(event);
  assert.equal(first.ok, true);
  assert.equal(first.guest, true);
  assert.deepEqual({ currentFloor: state.player.currentFloor, maxFloor: state.player.maxFloor }, before);
  assert.equal(state.onlineParty.coopContributionHistory.length, 128, "guest history remains capped");
  assert.equal(state.onlineParty.coopContributionHistory.some(entry => entry.resultId === "old-0"), false);
  const record = state.onlineParty.coopContributionHistory.at(-1);
  assert.deepEqual(JSON.parse(JSON.stringify({ resultId: record.resultId, startFloor: record.startFloor, endFloor: record.endFloor, floorsCleared: record.floorsCleared, pings: record.pings, rescue: record.rescue, score: record.score, mvpTitles: record.mvpTitles })), { resultId: event.resultId, startFloor: 200, endFloor: 203, floorsCleared: 3, pings: 4, rescue: 1, score: 2440, mvpTitles: ["救助王"] });
  assert.ok(state.onlineParty.processedExpeditionResultIds.includes(event.resultId));
  assert.equal(saveCalls(), 1, "contribution and processed result id share one save transaction");

  const duplicate = api.settleOnlineExpeditionResult(event);
  assert.equal(duplicate.duplicate, true);
  assert.equal(state.onlineParty.coopContributionHistory.filter(entry => entry.resultId === event.resultId).length, 1);
  assert.equal(state.onlineParty.coopContributionHistory.at(-1).pings, 4);
  assert.equal(saveCalls(), 1, "duplicate delivery does not save or add contribution again");
  assert.deepEqual({ currentFloor: state.player.currentFloor, maxFloor: state.player.maxFloor }, before);
});

test("build240 server-restart recovery settles the exact bound manual run", () => {
  const { state, api } = fixture();
  state.player.exploreRun.id = "explore-A";
  state.returnRewards.manual = { active: true, startFloor: 10, lastFloor: 12, floorsCleared: 2, pendingGold: 150, startedAt: 1 };
  state.player.currentFloor = 12;
  const result = api.recoverOrphanedOnlineExpedition();
  assert.equal(result.ok, true);
  assert.equal(result.active, true);
  assert.equal(result.returnResult.pendingGold, 150);
  assert.equal(result.context.reason, "serverRestart");
  assert.equal(state.player.inRun, false);
  assert.equal(state.onlineParty.activeExpeditionRunId, null);
  assert.ok(state.onlineParty.completedExpeditionRunIds.includes("run-A"));
  assert.equal(api.recoverOrphanedOnlineExpedition().active, false);
});

test("build240 restart recovery waits for every earlier reward save", async () => {
  let rewardSucceeds = false, orphanCalls = 0;
  const controller = new OnlinePartyController({
    getState: () => ({ monsters: [], party: [] }),
    onReward: async () => ({ ok: rewardSucceeds }),
    onExpeditionOrphaned: async () => { orphanCalls += 1; return { ok: true, active: false }; },
  });
  controller.selfId = "AD-PZ25-AABA";
  controller.capabilities = new Set(["expeditionResultsV1"]);
  controller.connectionReady = true;
  controller.ws = { readyState: WebSocket.OPEN, send() {} };
  controller.recoverySettlementBatch = 1;
  controller.recoverySettlementTasks = new Set();
  controller.recoverySettlementFailed = false;
  controller._handleMessage({ type: "onlineReward", rewardId: "run-A:floor-clear", reward: {}, source: { kind: "floorClear", expeditionRunId: "run-A", leaderFloorUnlock: 12 } });
  controller._handleMessage({ type: "recoveryComplete", orphanedExpedition: true });
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(orphanCalls, 0);
  assert.equal(controller.recoverySettlementFailed, true);

  rewardSucceeds = true;
  controller.recoverySettlementBatch = 2;
  controller.recoverySettlementTasks = new Set();
  controller.recoverySettlementFailed = false;
  controller._handleMessage({ type: "onlineReward", rewardId: "run-A:floor-clear", reward: {}, source: { kind: "floorClear", expeditionRunId: "run-A", leaderFloorUnlock: 12 } });
  controller._handleMessage({ type: "recoveryComplete", orphanedExpedition: true });
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(orphanCalls, 1);
  assert.equal(controller.recoverySettlementFailed, false);
});

test("build240 source keeps durable ACKs and exact run binding", () => {
  assert.match(main, /activeManualExploreRunId===currentExploreRunId/);
  assert.match(main, /allowMissing:true,skipApply:unrelatedRunActive/);
  assert.match(main, /processedExpeditionResultIds=\[\.\.\.new Set\([^]*slice\(-2048\)/);
  assert.match(main, /onExpeditionOrphaned:recoverOrphanedOnlineExpedition/);
});
