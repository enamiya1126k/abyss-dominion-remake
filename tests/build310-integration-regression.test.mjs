import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  CAMPAIGN_HERO_FINAL_LEVEL,
  CAMPAIGN_HERO_REWIND_FLOOR,
  beginCampaignDay9Rewind,
  beginCampaignHeroFieldEncounter,
  campaignFinalHeroEntries,
  campaignHeroEndingForResult,
  createCampaignHeroEncounterState,
  normalizeCampaignHeroEncounterState,
  recordCampaignHeroWound,
  scheduledCampaignHeroForFloor,
  settleCampaignHeroEncounter,
} from "../src/core/CampaignHeroEncounterSystem.js";
import { resolveCampaignStoryScene } from "../src/core/CampaignStorySystem.js";

const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const home = await readFile(new URL("../src/ui/screens/HomeScreen.js", import.meta.url), "utf8");
const saveService = await readFile(new URL("../src/services/SaveService.js", import.meta.url), "utf8");
const finalScreen = await readFile(new URL("../src/ui/screens/CampaignFinalFloorScreen.js", import.meta.url), "utf8");
const enemyAi = await readFile(new URL("../src/battle/EnemyAI.js", import.meta.url), "utf8");
const heroCss = await readFile(new URL("../src/Styles/build310-hero-final.css", import.meta.url), "utf8");
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");

function occurrences(source, expression) {
  return source.match(expression)?.length ?? 0;
}

function between(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0, `missing source marker: ${start}`);
  assert.ok(to > from, `missing source marker: ${end}`);
  return source.slice(from, to);
}

function preparedEncounter(state, encounterId, floor) {
  const candidate = scheduledCampaignHeroForFloor(state, {
    floor,
    visitedSections: 2,
    stepsSinceBattle: 6,
    partyHpRate: 1,
  });
  assert.equal(candidate?.id, encounterId);
  return beginCampaignHeroFieldEncounter(state, { encounterId, floor }).state;
}

test("Build310 hero wounds remain monotonic across encounters, reload normalization, and final-roster creation", () => {
  let state = createCampaignHeroEncounterState();
  state = preparedEncounter(state, "hero-ambush-yori-1", 15);
  state = settleCampaignHeroEncounter(state, {
    encounterId: "hero-ambush-yori-1",
    resultId: "field-yori-1",
    outcome: "escaped",
    hpRate: 0.71,
    floor: 15,
  }).state;
  state = recordCampaignHeroWound(state, {
    heroId: "myth_yori",
    woundId: "field-yori-2-checkpoint",
    hpRate: 0.43,
  }).state;

  const reloaded = normalizeCampaignHeroEncounterState(structuredClone(state));
  const attemptedHeal = recordCampaignHeroWound(reloaded, {
    heroId: "myth_yori",
    woundId: "field-yori-heal-attempt",
    hpRate: 0.96,
  }).state;
  const yori = campaignFinalHeroEntries(attemptedHeal).find(entry => entry.heroId === "myth_yori");

  assert.equal(yori?.carryHpRate, 0.43);
  assert.equal(yori?.level, CAMPAIGN_HERO_FINAL_LEVEL);
  assert.equal(yori?.fixedTrialScaling, true);
});

test("Build310 settlement receipts prevent duplicate wounds, encounter counts, and pre-emptive removals", () => {
  const active = preparedEncounter(createCampaignHeroEncounterState(), "hero-ambush-hide-1", 25);
  const result = {
    encounterId: "hero-ambush-hide-1",
    resultId: "field-hide-win",
    outcome: "repelled",
    currentHp: 0,
    maxHp: 999,
    floor: 25,
  };
  const first = settleCampaignHeroEncounter(active, result);
  const second = settleCampaignHeroEncounter(first.state, result);

  assert.equal(first.recorded, true);
  assert.equal(first.state.heroes.myth_hide.defeated, true);
  assert.equal(first.state.heroes.myth_hide.encounters, 1);
  assert.equal(second.duplicate, true);
  assert.equal(second.state.heroes.myth_hide.encounters, 1);
  assert.equal(campaignFinalHeroEntries(second.state).some(entry => entry.heroId === "myth_hide"), false);
});

test("Build310 final outcomes are distinct and all pre-emptively defeated heroes bypass combat", () => {
  const fresh = createCampaignHeroEncounterState();
  const outcomes = [
    campaignHeroEndingForResult(fresh, { partyWon: true, partySurvivors: 4 }),
    campaignHeroEndingForResult(fresh, { partyWon: true, partySurvivors: 1 }),
    campaignHeroEndingForResult(fresh, { partyWon: false, partySurvivors: 0 }),
  ];
  assert.deepEqual(outcomes, ["complete", "narrow", "defeat"]);

  let allDefeated = fresh;
  for (const [heroId, encounterId] of [
    ["myth_yori", "hero-ambush-yori-1"],
    ["myth_hide", "hero-ambush-hide-1"],
    ["myth_enami", "hero-ambush-enami-1"],
    ["myth_rion", "hero-ambush-rion-1"],
  ]) {
    allDefeated = settleCampaignHeroEncounter(allDefeated, {
      encounterId,
      resultId: `preempt-${heroId}`,
      heroId,
      outcome: "repelled",
      hpRate: 0,
    }).state;
  }
  const preemptive = campaignHeroEndingForResult(allDefeated, { partyWon: false, partySurvivors: 0 });
  assert.notEqual(preemptive, "complete");
  assert.notEqual(preemptive, "narrow");
  assert.notEqual(preemptive, "defeat");
  assert.equal(campaignFinalHeroEntries(allDefeated).length, 0);
});

test("Build310 final defeat rewinds once to prophecy day nine without healing heroes or losing receipts", () => {
  let state = recordCampaignHeroWound(createCampaignHeroEncounterState(), {
    heroId: "myth_enami",
    woundId: "enami-wound-before-final",
    hpRate: 0.38,
  }).state;
  const receiptCount = state.processedWoundIds.length;
  const first = beginCampaignDay9Rewind(state, { resultId: "final-defeat-310" });
  const duplicate = beginCampaignDay9Rewind(first.state, { resultId: "final-defeat-310" });

  assert.equal(first.recorded, true);
  assert.equal(first.state.rewind.active, true);
  assert.equal(first.state.rewind.currentFloor, CAMPAIGN_HERO_REWIND_FLOOR);
  assert.equal(first.state.heroes.myth_enami.remainingHpRate, 0.38);
  assert.equal(first.state.processedWoundIds.length, receiptCount);
  assert.equal(first.state.rewind.suppressFirstClearRewards, true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.state.rewind.count, 1);
});

test("Build310 main wires scheduling, contact settlement, the dedicated final floor, and the Lionel rewind", () => {
  assert.match(main, /CampaignHeroEncounterSystem\.js\?v=3\.1\.0-build310/);
  assert.ok(occurrences(main, /scheduledCampaignHeroForFloor/g) >= 2, "the scheduler must be imported and called");
  assert.ok(occurrences(main, /beginCampaignHeroFieldEncounter/g) >= 2, "field pursuit must durably begin");
  assert.ok(occurrences(main, /settleCampaignHeroEncounter/g) >= 2, "field combat must durably settle");
  assert.ok(occurrences(main, /campaignRemainingHeroes/g) >= 2, "the final roster must come from the permanent ledger");
  assert.ok(occurrences(main, /beginCampaignDay9Rewind/g) >= 2, "final defeat must start the rewind transition");
  assert.ok(occurrences(main, /advanceCampaignRewindFloor/g) >= 2, "replay floors must advance the rewind ceiling");
  assert.match(main, /specialBattleType\s*(?:===|==|[:=])\s*["']campaignHero["']/);
  assert.match(main, /campaignFinalFloor/);
  assert.match(main, /CampaignFinalFloorScreen\s*\(/);
});

test("Build310 pursuit is step-driven, crosses section links, and is visibly drawn in the field and minimap", () => {
  const update = between(main, "function update(dt)", "function showChestRewardReveal(");
  const fieldDraw = between(main, "function drawExploreSceneObjects(", "function showTutorialPickupMarker(");
  const minimap = between(main, "function drawMini(", "function path(");

  assert.match(update, /heroStepsSinceBattle/);
  assert.match(update, /updateCampaignHeroPursuitOnStep\s*\(/);
  assert.match(main, /transferCampaignHeroPursuit\s*\(section\)/);
  assert.match(fieldDraw, /campaignHeroPursuit/);
  assert.match(fieldDraw, /drawExplorationMonster\s*\(pursuit/);
  assert.match(minimap, /campaignHeroPursuit/);
});

test("Build310 uses all four authored combat personalities in the real enemy decision path", () => {
  assert.match(enemyAi, /function campaignHeroAction\s*\(/);
  for (const heroId of ["myth_yori", "myth_hide", "myth_enami", "myth_rion"]) {
    assert.match(enemyAi, new RegExp(`hero===['\"]${heroId}['\"]`));
  }
  assert.match(enemyAi, /campaignHeroTargetMode\s*=\s*["']weak["']/);
  assert.match(enemyAi, /campaignHeroTargetMode\s*=\s*["']threat["']/);
  assert.match(enemyAi, /enemy\.campaignHeroId\s*\?\s*campaignHeroAction\s*\(/);
});

test("Build310 save migration owns one canonical hero ledger and the home timeline honors rewind state", () => {
  assert.match(saveService, /CampaignHeroEncounterSystem\.js\?v=3\.1\.0-build310/);
  assert.match(saveService, /normalizeCampaignHeroInvasion\s*\(/);
  assert.match(saveService, /heroEncounters310/);
  assert.match(saveService, /heroByEncounter/);
  assert.match(saveService, /expectedHero===heroId/);

  assert.match(home, /CampaignHeroEncounterSystem\.js\?v=3\.1\.0-build310/);
  assert.match(home, /normalizeCampaignHeroInvasion\s*\(/);
  assert.match(home, /rewind\??\.active|rewind\.active/);
  assert.match(home, /currentFloor/);
  assert.match(home, /finalArena/);
});

test("Build310 permanent hero wounds feed the existing ten-floor dialogue branches", () => {
  const state = {
    campaign100: {
      heroEncounters310: {
        heroes: {
          myth_yori: {
            heroId: "myth_yori",
            remainingHpRate: 0.4,
            lowestHpRate: 0.4,
            defeated: false,
            encounters: 1,
            lastOutcome: "escaped",
          },
        },
      },
    },
  };
  const scene = resolveCampaignStoryScene("road-050", state);

  assert.equal(scene?.variant, "wounded");
  assert.equal(scene?.focusHeroId, "myth_yori");
  assert.equal(scene?.heroContinuity?.myth_yori?.damageRatio, 0.6);
  assert.equal(scene?.dialogue.at(-1)?.continuity, true);
});

test("Build310 reload preserves exploration auto through an active hero encounter", () => {
  const checkpoint = between(main, "function saveBattleCheckpoint()", "function clearBattleCheckpoint()");
  const resume = between(main, "function resumeSavedBattle()", "function affixValue(");

  assert.match(checkpoint, /explorationAuto:Boolean\(battle\.explorationAuto\)/);
  assert.match(resume, /specialBattleType===["']campaignHero["']/);
  assert.match(resume, /Boolean\(data\.explorationAuto\)/);
});

test("Build310 final-floor and chase presentation reuse authored sprites and remain iPhone-safe", () => {
  assert.match(finalScreen, /monsterVisual\s*\(/);
  assert.match(finalScreen, /campaign-final-floor/);
  assert.match(finalScreen, /campaign-final-hero/);
  assert.doesNotMatch(finalScreen, /[\u{1F300}-\u{1FAFF}]/u, "new final UI must not use emoji art");

  assert.match(heroCss, /\.campaign-hero-chase-hud/);
  assert.match(heroCss, /\.campaign-final-floor-screen/);
  assert.match(heroCss, /\.lionel-rewind/);
  assert.match(heroCss, /safe-area-inset-top/);
  assert.match(heroCss, /safe-area-inset-bottom/);
  assert.match(heroCss, /prefers-reduced-motion/);
  assert.match(heroCss, /\.campaign-final-floor-hero-visual\{/);
  assert.match(heroCss, /\.campaign-hero-edge-chip>\.campaign-hero-edge-visual\{/);
  assert.match(heroCss, /\.lionel-rewind-visual\{/);
  assert.doesNotMatch(finalScreen, /MonsterVisual\.js\?v=3\.1\.0-build310/,
    "the new screen must reuse the existing MonsterVisual module instance instead of starting a second idle timer");
  assert.match(index, /build310-hero-final\.css\?v=3\.1\.0-build310/);
});
