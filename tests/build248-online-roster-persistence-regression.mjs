import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

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
const claimFunction = between("function claimOnlinePartyReward", "function exchangeOnlineRaidReward");

function monster(id, { hp = 100, mp = 30, hpMax = 100, mpMax = 30, experience = 0 } = {}) {
  return { id, name: id.toUpperCase(), currentHp: hp, currentMp: mp, hpMax, mpMax, experience };
}

function resultFixture({ monsters = [monster("m1"), monster("m2"), monster("m3"), monster("m4")] } = {}) {
  let saveCalls = 0;
  const state = {
    onlineParty: {
      claimedRewards: [], processedVitalMutationIds: [], processedBattleEventIds: [], processedExpeditionResultIds: [], completedExpeditionRunIds: [],
      coopContributionHistory: [], activeExpeditionRunId: null, activeManualExploreRunId: null, hostWorld: { openedChestIds: {}, floorSeeds: {} },
    },
    player: { gold: 1_000, checkpoint: 1, currentFloor: 1, maxFloor: 1, inRun: false, exploreRun: { id: null, floors: {} } },
    returnRewards: { manual: { active: false, startFloor: 1, lastFloor: 1, floorsCleared: 0, pendingGold: 0 } },
    monsters,
  };
  const save = { state, save: () => { saveCalls += 1; return true; } };
  const context = {
    save, structuredClone: undefined, WORLD_MAX_FLOOR: 10_000,
    onlinePartyController: { selfId: "SELF" },
    onlinePartyPersistentState: () => save.state.onlineParty,
    calculatedStats: value => ({ hp: value.hpMax }), maxMp: value => value.mpMax,
    goldForClearedFloor: floor => floor * 10,
    beginManualExpedition(target, floor) {
      target.returnRewards.manual = { active: true, startFloor: floor, lastFloor: floor, floorsCleared: 0, pendingGold: 0 };
      target.player.exploreRun = { id: `generated-${floor}`, floors: {} };
    },
    recordManualFloorClear(target, floor) { target.returnRewards.manual.lastFloor = floor; target.returnRewards.manual.floorsCleared += 1; },
    claimManualReturn(target) { target.returnRewards.manual.active = false; return { ok: true }; },
    abandonManualExpedition(target) { target.returnRewards.manual.active = false; },
  };
  vm.runInNewContext(`${resultFunctions}\nthis.api={applyOnlineVitalsUpdate,settleOnlineExpeditionResult};`, context);
  return { state, save, api: context.api, saveCalls: () => saveCalls };
}

function rewardFixture() {
  let saveCalls = 0, saveSucceeds = true;
  const monsters = [monster("m1", { experience: 100 }), monster("m2", { experience: 200 })];
  const state = {
    onlineParty: { claimedRewards: [], processedVitalMutationIds: [], processedBattleEventIds: [], processedExpeditionResultIds: [], completedExpeditionRunIds: [], raidMaterials: 0 },
    player: { gold: 1_000, crystals: 0, maxFloor: 1, currentFloor: 1, inRun: false, exploreRun: { id: null, floors: {} } },
    inventory: { captureCrystals: 0, abyssKeys: 0, potions: 0 },
    returnRewards: { manual: { active: false } },
    monsters, party: ["m1", "m2"],
  };
  const save = { state, save: () => { saveCalls += 1; return saveSucceeds; } };
  const context = {
    save, structuredClone: undefined, WORLD_MAX_FLOOR: 10_000, MONSTER_STORAGE_CAP: 500, SPECIES: {},
    onlinePartyController: { selectedMonsterId: "m1" },
    onlinePartyPersistentState: () => save.state.onlineParty,
    allLearnedSkills: target => (target.learnedSkillIds ?? []).map(id => ({ id })),
    recordSkillUse(target, skillId, amount) { target.skillMastery ??= {}; target.skillMastery[skillId] = (Number(target.skillMastery[skillId]) || 0) + amount; },
    createMonster() { throw new Error("unexpected capture"); },
    createEquipment() { throw new Error("unexpected equipment"); }, receiveEquipment() { throw new Error("unexpected equipment"); },
    applyTotalExperience(target, value) { target.experience = value; }, totalExperience: target => target.experience,
    calculatedStats: target => ({ hp: target.hpMax }), maxMp: target => target.mpMax, displayName: target => target.name,
    beginManualExpedition() { throw new Error("unexpected expedition"); }, recordManualFloorClear() { throw new Error("unexpected floor clear"); },
    recordBiomeFloor() {}, markSecondWorldEntered() {}, prepareOnlineFloorBossReward() { throw new Error("unexpected boss reward"); },
    document: { getElementById: () => null }, showResourceToast() {}, showToast() {}, setTimeout() {},
  };
  vm.runInNewContext(`${claimFunction}\nthis.api={claimOnlinePartyReward};`, context);
  return {
    state, save, api: context.api, saveCalls: () => saveCalls,
    setSaveSucceeds(value) { saveSucceeds = value; },
  };
}

test("build248 roster vitals update four distinct monsters once and clamp each value", () => {
  const { state, api, saveCalls } = resultFixture({ monsters: [
    monster("m1", { hpMax: 100, mpMax: 20 }), monster("m2", { hpMax: 110, mpMax: 25 }),
    monster("m3", { hpMax: 120, mpMax: 30 }), monster("m4", { hpMax: 130, mpMax: 35 }),
  ] });
  const event = {
    mutationId: "vitals-parent",
    monsterId: "m1", hp: 1, mp: 1,
    rosterVitals: [
      { mutationId: "vitals-1", monsterId: "m1", hp: 80, mp: 10 },
      { mutationId: "vitals-2", monsterId: "m2", hp: -5, mp: 7 },
      { mutationId: "vitals-3", monsterId: "m3", hp: 999, mp: 21 },
      { mutationId: "vitals-4", monsterId: "m4", hp: 99, mp: 999 },
    ],
  };
  const first = api.applyOnlineVitalsUpdate(event);
  assert.equal(first.ok, true);
  assert.deepEqual(state.monsters.map(value => [value.id, value.currentHp, value.currentMp]), [
    ["m1", 80, 10], ["m2", 0, 7], ["m3", 120, 21], ["m4", 99, 35],
  ]);
  assert.deepEqual(new Set(state.onlineParty.processedVitalMutationIds), new Set(["vitals-parent", "vitals-1", "vitals-2", "vitals-3", "vitals-4"]));
  assert.equal(saveCalls(), 1);

  event.rosterVitals[0].hp = 2;
  const duplicate = api.applyOnlineVitalsUpdate(event);
  assert.equal(duplicate.duplicate, true, "the parent mutation protects the complete roster transaction");
  assert.equal(state.monsters[0].currentHp, 80);
  assert.equal(saveCalls(), 1, "a redelivery never creates another save transaction");
});

test("build248 child mutation replay skips only that child and legacy single vitals remain supported", () => {
  const { state, api } = resultFixture();
  assert.equal(api.applyOnlineVitalsUpdate({ mutationId: "child-old", monsterId: "m1", hp: 70, mp: 9 }).ok, true);
  assert.equal(api.applyOnlineVitalsUpdate({
    mutationId: "parent-new",
    rosterVitals: [
      { mutationId: "child-old", monsterId: "m1", hp: 1, mp: 1 },
      { mutationId: "child-new", monsterId: "m2", hp: 55, mp: 8 },
    ],
  }).ok, true);
  assert.deepEqual(state.monsters.slice(0, 2).map(value => [value.currentHp, value.currentMp]), [[70, 9], [55, 8]]);
  assert.ok(state.onlineParty.processedVitalMutationIds.includes("parent-new"));
  assert.ok(state.onlineParty.processedVitalMutationIds.includes("child-new"));

  const allChildrenReplayed = api.applyOnlineVitalsUpdate({
    mutationId: "parent-after-children",
    rosterVitals: [{ mutationId: "child-old", monsterId: "m1", hp: 2, mp: 2 }, { mutationId: "child-new", monsterId: "m2", hp: 3, mp: 3 }],
  });
  assert.equal(allChildrenReplayed.ok, true, "a new parent ACK can safely cover children already persisted separately");
  assert.ok(state.onlineParty.processedVitalMutationIds.includes("parent-after-children"));
  assert.deepEqual(state.monsters.slice(0, 2).map(value => [value.currentHp, value.currentMp]), [[70, 9], [55, 8]]);
});

test("build248 expedition result accepts top-level rosterVitals and settles it once", () => {
  const { state, api, saveCalls } = resultFixture();
  const event = {
    runId: "run-roster", resultId: "result-roster", mutationId: "result-vitals-parent",
    ownerId: "OTHER", recipientId: "SELF", startFloor: 20, endFloor: 21, floorsCleared: 1, reason: "return",
    rosterVitals: [
      { mutationId: "result-vitals-1", monsterId: "m1", hp: 41, mp: 11 },
      { mutationId: "result-vitals-2", monsterId: "m2", hp: 42, mp: 12 },
    ],
  };
  const first = api.settleOnlineExpeditionResult(event);
  assert.equal(first.ok, true);
  assert.equal(first.guest, true);
  assert.deepEqual(state.monsters.slice(0, 2).map(value => [value.currentHp, value.currentMp]), [[41, 11], [42, 12]]);
  assert.ok(state.onlineParty.processedVitalMutationIds.includes("result-vitals-parent"));
  assert.ok(state.onlineParty.processedExpeditionResultIds.includes("result-roster"));
  assert.equal(saveCalls(), 1, "result, roster vitals and their idempotency ids share one save");
  assert.equal(api.settleOnlineExpeditionResult(event).duplicate, true);
  assert.equal(saveCalls(), 1);
});

test("build248 battle and raid experienceRoster award each monster once without duplicating resources", () => {
  const { state, api, saveCalls } = rewardFixture();
  const battle = {
    rewardId: "battle-roster",
    reward: {
      gold: 100, raidMaterials: 5, experience: 999,
      experienceRoster: [
        { monsterId: "m1", experience: 10 },
        { monsterId: "m2", experience: 20 },
        { monsterId: "m1", experience: 9_999 },
      ],
    },
    source: { kind: "battle", monsterId: "m1" },
  };
  const first = api.claimOnlinePartyReward(battle);
  assert.equal(first.ok, true);
  assert.deepEqual(state.monsters.map(value => value.experience), [110, 220], "roster EXP is authoritative over the scalar compatibility value");
  assert.equal(state.player.gold, 1_100);
  assert.equal(state.onlineParty.raidMaterials, 5);
  assert.deepEqual(JSON.parse(JSON.stringify(first.experienceRoster)), [
    { monsterId: "m1", experience: 10, experienceTarget: "M1" },
    { monsterId: "m2", experience: 20, experienceTarget: "M2" },
  ]);
  assert.equal(saveCalls(), 1);

  assert.equal(api.claimOnlinePartyReward(battle).duplicate, true);
  assert.deepEqual(state.monsters.map(value => value.experience), [110, 220]);
  assert.equal(state.player.gold, 1_100);
  assert.equal(state.onlineParty.raidMaterials, 5);
  assert.equal(saveCalls(), 1);

  const raid = api.claimOnlinePartyReward({
    rewardId: "raid-roster",
    reward: { raidMaterials: 2, experience: 888, experienceRoster: [{ monsterId: "m1", experience: 7 }, { monsterId: "m2", experience: 8 }] },
    source: { kind: "raid", monsterId: "m1" },
  });
  assert.equal(raid.ok, true);
  assert.deepEqual(state.monsters.map(value => value.experience), [117, 228]);
  assert.equal(state.onlineParty.raidMaterials, 7);
  assert.equal(state.onlineParty.raidWins, 1);
});

test("build248 scalar experience fallback and failed-save rollback stay backward compatible", () => {
  const { state, save, api, setSaveSucceeds } = rewardFixture();
  const legacy = api.claimOnlinePartyReward({ rewardId: "legacy-exp", reward: { gold: 5, experience: 30 }, source: { kind: "battle", monsterId: "m1" } });
  assert.equal(legacy.ok, true);
  assert.equal(state.monsters[0].experience, 130);
  assert.equal(state.monsters[1].experience, 200);
  assert.equal(state.player.gold, 1_005);
  assert.deepEqual(JSON.parse(JSON.stringify(legacy.experienceRoster)), []);

  const before = JSON.parse(JSON.stringify(save.state));
  setSaveSucceeds(false);
  const failed = api.claimOnlinePartyReward({
    rewardId: "failed-roster",
    reward: { gold: 500, raidMaterials: 50, experienceRoster: [{ monsterId: "m1", experience: 500 }, { monsterId: "m2", experience: 500 }] },
    source: { kind: "battle", monsterId: "m1" },
  });
  assert.equal(failed.ok, false);
  assert.deepEqual(JSON.parse(JSON.stringify(save.state)), before, "resources, per-monster EXP and reward id all roll back together");
});

test("build248 skillUsesRoster persists primary and secondary mastery once without scalar double application", () => {
  const { state, api, saveCalls } = rewardFixture();
  state.monsters[0].learnedSkillIds = ["primary-slash"];
  state.monsters[1].learnedSkillIds = ["secondary-flare"];
  const event = {
    rewardId: "battle-skill-roster",
    reward: {
      skillUses: { "primary-slash": 30 },
      skillUsesRoster: [
        { monsterId: "m1", rosterIndex: 0, skillUses: { "primary-slash": 2, "secondary-flare": 9 } },
        { monsterId: "m2", rosterIndex: 1, skillUses: { "secondary-flare": 3, unknown: 20 } },
        { monsterId: "m1", rosterIndex: 0, skillUses: { "primary-slash": 32 } },
        { monsterId: "missing", rosterIndex: 2, skillUses: { "primary-slash": 32 } },
      ],
    },
    source: { kind: "battle", monsterId: "m1" },
  };

  assert.equal(api.claimOnlinePartyReward(event).ok, true);
  assert.deepEqual(JSON.parse(JSON.stringify(state.monsters.map(value => value.skillMastery ?? {}))), [
    { "primary-slash": 2 }, { "secondary-flare": 3 },
  ], "roster rows apply only learned skills to their matching monster and override the scalar compatibility payload");
  assert.equal(saveCalls(), 1);

  assert.equal(api.claimOnlinePartyReward(event).duplicate, true);
  assert.deepEqual(JSON.parse(JSON.stringify(state.monsters.map(value => value.skillMastery ?? {}))), [
    { "primary-slash": 2 }, { "secondary-flare": 3 },
  ], "reward replay never grants mastery twice");
  assert.equal(saveCalls(), 1);

  assert.equal(api.claimOnlinePartyReward({
    rewardId: "coop-boss-legacy-skill-uses",
    reward: { skillUses: { "primary-slash": 4 } },
    source: { kind: "coopBoss", monsterId: "m1" },
  }).ok, true);
  assert.equal(state.monsters[0].skillMastery["primary-slash"], 6, "legacy scalar mastery remains a primary-monster fallback when the roster field is absent");
  assert.equal(state.monsters[1].skillMastery["secondary-flare"], 3);
});
