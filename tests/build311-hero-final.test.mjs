import test from "node:test";
import assert from "node:assert/strict";

import {
  CAMPAIGN_HERO_ENCOUNTER_SCHEDULE,
  beginCampaignHeroFieldEncounter,
  campaignHeroEndingForResult,
  createCampaignHeroEncounterState,
  normalizeCampaignHeroEncounterState,
  recordCampaignHeroWound,
  settleCampaignHeroEncounter,
} from "../src/core/CampaignHeroEncounterSystem.js";
import {
  campaignEndingForResult,
  normalizeCampaignState,
  recordCampaignEnding,
} from "../src/core/Campaign100System.js";
import { SaveService } from "../src/services/SaveService.js";
import { HomeScreen } from "../src/ui/screens/HomeScreen.js";

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

test("Build311 null hero HP and floors stay absent across pure, idempotent normalization", () => {
  const source = createCampaignHeroEncounterState();
  source.heroes.myth_yori.remainingHpRate = null;
  source.heroes.myth_yori.lowestHpRate = "";
  source.heroes.myth_yori.currentHp = 80;
  source.heroes.myth_yori.maxHp = 100;
  source.heroes.myth_yori.lastSeenFloor = null;
  source.events["hero-ambush-yori-1"].activatedFloor = null;
  source.events["hero-ambush-yori-1"].resolvedFloor = "";
  const snapshot = structuredClone(source);

  const once = normalizeCampaignHeroEncounterState(source, { migrationHighestFloor: null });
  const twice = normalizeCampaignHeroEncounterState(once, { migrationHighestFloor: "" });

  assert.deepEqual(source, snapshot, "normalization does not mutate the supplied save ledger");
  assert.equal(once.heroes.myth_yori.remainingHpRate, 0.8, "valid current/max HP wins over nullable rate placeholders");
  assert.equal(once.heroes.myth_yori.defeated, false);
  assert.equal(once.heroes.myth_yori.lastSeenFloor, null);
  assert.equal(once.events["hero-ambush-yori-1"].activatedFloor, null);
  assert.equal(once.events["hero-ambush-yori-1"].resolvedFloor, null);
  assert.equal(once.legacyMigrationApplied, false, "a null migration floor is not floor one");
  assert.deepEqual(twice, once);
  assert.ok(Object.values(twice.events).every(event => event.activatedFloor === null && event.resolvedFloor === null));
});

test("Build311 null battle HP is missing data, not a zero-HP wound, and null settlement floor uses the encounter floor", () => {
  const fresh = createCampaignHeroEncounterState();
  const missing = recordCampaignHeroWound(fresh, {
    heroId: "myth_yori",
    woundId: "build311-null-hp",
    currentHp: null,
    maxHp: 100,
  });
  assert.equal(missing.recorded, false);
  assert.equal(missing.reason, "missing-hp");
  assert.equal(missing.state.heroes.myth_yori.remainingHpRate, 1);
  assert.equal(missing.state.heroes.myth_yori.defeated, false);
  assert.deepEqual(missing.state.processedWoundIds, []);

  const active = beginCampaignHeroFieldEncounter(fresh, {
    encounterId: "hero-ambush-yori-1",
    floor: 15,
  });
  const first = settleCampaignHeroEncounter(active.state, {
    encounterId: "hero-ambush-yori-1",
    resultId: "build311-null-hp-result",
    outcome: "escaped",
    currentHp: null,
    maxHp: 100,
    floor: null,
  });
  const duplicate = settleCampaignHeroEncounter(first.state, {
    encounterId: "hero-ambush-yori-1",
    resultId: "build311-null-hp-result",
    outcome: "escaped",
    currentHp: 0,
    maxHp: 100,
    floor: 1,
  });

  assert.equal(first.recorded, true);
  assert.equal(first.state.heroes.myth_yori.remainingHpRate, 1);
  assert.equal(first.state.heroes.myth_yori.defeated, false);
  assert.equal(first.state.heroes.myth_yori.lastSeenFloor, 15);
  assert.equal(first.state.events["hero-ambush-yori-1"].resolvedFloor, 15);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.state.heroes.myth_yori.remainingHpRate, 1);
  assert.equal(duplicate.state.heroes.myth_yori.encounters, 1);
  assert.deepEqual(normalizeCampaignHeroEncounterState(first.state), first.state);
});

test("Build311 Home final CTA requires the durable hero-arena unlock, not only a 100F boss flag", () => {
  values.clear();
  const state = structuredClone(new SaveService().state);
  state.player.maxFloor = 100;
  state.player.currentFloor = 100;
  state.campaign100.finalUnlocked = true;
  state.campaign100.floors["100"] = {
    ...(state.campaign100.floors["100"] ?? {}),
    floor: 100,
    bossDefeated: true,
    cleared: true,
    exitUnlocked: true,
  };
  state.campaign100.heroEncounters310.finalArena.unlocked = false;

  const bossOnly = HomeScreen(state);
  assert.doesNotMatch(bossOnly, /id="openCampaignFinal"/);

  state.campaign100.heroEncounters310.finalArena.unlocked = true;
  const arenaReady = HomeScreen(state);
  assert.equal(arenaReady.match(/id="openCampaignFinal"/g)?.length, 1);
  assert.match(arenaReady, /勇者軍最終決戦へ/);

  state.campaign100.heroEncounters310.finalArena.completed = true;
  assert.doesNotMatch(HomeScreen(state), /id="openCampaignFinal"/, "a completed arena cannot reopen from Home");
});

test("Build311 campaign and hero result resolvers use the current four-ending mapping", () => {
  const freshHeroes = createCampaignHeroEncounterState();
  const ordinary = [
    [{ won: false, partySurvivors: 4, partySize: 4 }, "defeat"],
    [{ won: true, partySurvivors: 0, partySize: 4 }, "defeat"],
    [{ won: true, partySurvivors: 1, partySize: 4 }, "narrow"],
    [{ won: true, partySurvivors: 3, partySize: 4 }, "narrow"],
    [{ won: true, partySurvivors: 4, partySize: 4 }, "complete"],
  ];
  for (const [result, ending] of ordinary) {
    assert.equal(campaignEndingForResult(result), ending);
    assert.equal(campaignHeroEndingForResult(freshHeroes, result), ending);
  }
  assert.equal(campaignEndingForResult({ won: false, allPreempted: true }), "all-preempted");
  assert.equal(campaignEndingForResult({ won: false, remainingHeroes: 0 }), "all-preempted");

  let allDown = freshHeroes;
  for (const entry of CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.slice(0, 4)) {
    allDown = settleCampaignHeroEncounter(allDown, {
      encounterId: entry.id,
      heroId: entry.heroId,
      resultId: `build311-preempt-${entry.heroId}`,
      outcome: "repelled",
      hpRate: 0,
    }).state;
  }
  assert.equal(campaignHeroEndingForResult(allDown, { won: false }), "all-preempted");

  const state = { player: { bossRewards: {} }, campaign100: { endings: ["comeback", "narrow", "bogus"] } };
  normalizeCampaignState(state);
  assert.deepEqual(state.campaign100.endings, ["narrow"], "retired comeback IDs normalize to the current narrow ending");
  assert.deepEqual(recordCampaignEnding(state, "comeback"), {
    ending: "narrow",
    victorious: true,
    finalCompleted: true,
  });
  assert.deepEqual(state.campaign100.endings, ["narrow"]);
});
