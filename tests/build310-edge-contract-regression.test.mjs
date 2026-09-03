import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  beginCampaignDay9Rewind,
  beginCampaignHeroFieldEncounter,
  campaignFinalHeroEntries,
  campaignHeroEndingForResult,
  createCampaignHeroEncounterState,
  recordCampaignHeroWound,
  scheduledCampaignHeroForFloor,
  settleCampaignHeroEncounter,
} from "../src/core/CampaignHeroEncounterSystem.js";

const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const finalScreen = await readFile(new URL("../src/ui/screens/CampaignFinalFloorScreen.js", import.meta.url), "utf8");
const heroCss = await readFile(new URL("../src/Styles/build310-hero-final.css", import.meta.url), "utf8");

function between(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0, `missing source marker: ${start}`);
  assert.ok(to > from, `missing source marker: ${end}`);
  return source.slice(from, to);
}

function campaignHeroPursuitFunctions(source) {
  const matches = [...source.matchAll(/function\s+([\w$]*CampaignHeroPursuit[\w$]*)\s*\(/g)];
  return matches.map((match, index) => ({
    name: match[1],
    source: source.slice(match.index, matches[index + 1]?.index ?? source.length),
  }));
}

function defeatAllHeroes(state) {
  let next = state;
  for (const [heroId, encounterId] of [
    ["myth_yori", "hero-ambush-yori-1"],
    ["myth_hide", "hero-ambush-hide-1"],
    ["myth_enami", "hero-ambush-enami-1"],
    ["myth_rion", "hero-ambush-rion-1"],
  ]) {
    next = settleCampaignHeroEncounter(next, {
      encounterId,
      resultId: `edge-preempt-${heroId}`,
      heroId,
      outcome: "repelled",
      hpRate: 0,
    }).state;
  }
  return next;
}

test("Build310 leaving a field pursuit settles its durable event so a later ambush can arm", () => {
  const candidate = scheduledCampaignHeroForFloor(createCampaignHeroEncounterState(), {
    floor: 15,
    visitedSections: 2,
    stepsSinceBattle: 6,
    partyHpRate: 1,
  });
  const active = beginCampaignHeroFieldEncounter(createCampaignHeroEncounterState(), {
    encounterId: candidate.id,
    floor: 15,
  }).state;
  assert.equal(active.activeEncounterId, "hero-ambush-yori-1");

  const left = settleCampaignHeroEncounter(active, {
    encounterId: active.activeEncounterId,
    resultId: "edge-manual-return-yori",
    outcome: "escaped",
    floor: 15,
    hpRate: 0.74,
  }).state;
  assert.equal(left.activeEncounterId, null);
  assert.equal(left.events["hero-ambush-yori-1"].status, "resolved");

  const later = scheduledCampaignHeroForFloor(left, {
    floor: 25,
    visitedSections: 2,
    stepsSinceBattle: 6,
    partyHpRate: 1,
  });
  assert.equal(later?.id, "hero-ambush-hide-1");
  assert.equal(beginCampaignHeroFieldEncounter(left, { encounterId: later.id, floor: 25 }).activated, true);
});

test("Build310 manual return and floor transition use orphan-safe pursuit settlement", () => {
  const cleanup = campaignHeroPursuitFunctions(main).find(entry =>
    entry.source.includes("activeEncounterId") && entry.source.includes("settleCampaignHeroEncounter"));
  assert.ok(cleanup, "pursuit cleanup must fall back to the durable activeEncounterId when field state is missing");

  const manualReturn = between(main, "function openManualReturnConfirmation()", "function syncMiniMapBackingStore(");
  const floorExit = between(
    main,
    "if(game.world.exit?.active!==false&&!game.world.exit.locked",
    "if(!game.world.campaignHeroPursuit&&!game.world.bossDefeated",
  );
  const cleanupCall = new RegExp(`\\b${cleanup.name}\\s*\\(`);
  assert.match(manualReturn, cleanupCall, "manual return must settle before clearing the expedition snapshot");
  assert.match(floorExit, cleanupCall, "floor transition must settle before constructing the next floor");
});

test("Build310 active day-nine rewind blocks final-floor render, preparation, and restored routing", () => {
  const rewind = beginCampaignDay9Rewind(createCampaignHeroEncounterState(), {
    resultId: "edge-final-defeat",
  }).state;
  assert.equal(rewind.rewind.active, true);

  const renderFinal = between(main, "function renderCampaignFinalFloor()", "function openCampaignFinalPreparation()");
  const prepareFinal = between(main, "function openCampaignFinalPreparation()", "function finishFloorBossChallengeBattle(");
  const renderRouter = between(main, "function render()", "function expeditionActive()");

  assert.match(renderFinal, /if\([^\n{}]*rewind\?*\.active[^\n{}]*\)/,
    "the dedicated floor renderer must reject an active rewind before drawing the arena");
  assert.ok(renderFinal.indexOf("rewind") < renderFinal.indexOf("CampaignFinalFloorScreen"),
    "the rewind guard must run before final-floor markup is created");
  assert.match(prepareFinal, /if\([^\n{}]*rewind\?*\.active[^\n{}]*\)/,
    "the final battle start path must reject an active rewind");
  const restoredRouteGuard = renderRouter.indexOf('screen==="campaignFinalFloor"&&campaignHeroLedger().rewind?.active');
  const finalRouteDispatch = renderRouter.indexOf('else if(screen==="campaignFinalFloor")');
  assert.ok(restoredRouteGuard >= 0 && finalRouteDispatch > restoredRouteGuard,
    "the shared render router must reject a restored campaignFinalFloor session before dispatch");
});

test("Build310 all-preempted ending is resolved before enforcing a four-member party", () => {
  const allPreempted = defeatAllHeroes(createCampaignHeroEncounterState());
  assert.equal(campaignFinalHeroEntries(allPreempted).length, 0);
  assert.equal(campaignHeroEndingForResult(allPreempted, {
    partyWon: false,
    partySurvivors: 0,
    partySize: 1,
  }), "all-preempted");

  const prepareFinal = between(main, "function openCampaignFinalPreparation()", "function finishFloorBossChallengeBattle(");
  const noHeroes = prepareFinal.indexOf("if(!remaining.length)");
  const partyGate = prepareFinal.indexOf("if(liveIds.length!==4)");
  assert.ok(noHeroes >= 0, "missing all-preempted branch");
  assert.ok(partyGate >= 0, "missing four-member party gate");
  assert.ok(noHeroes < partyGate, "all-preempted must not ask the player to assemble a battle that will not happen");
});

test("Build310 permanent carry HP below one percent is preserved without a one-percent heal floor", () => {
  const wounded = recordCampaignHeroWound(createCampaignHeroEncounterState(), {
    heroId: "myth_rion",
    woundId: "edge-rion-sub-percent",
    hpRate: 0.004,
  }).state;
  assert.equal(wounded.heroes.myth_rion.remainingHpRate, 0.004);
  assert.equal(campaignFinalHeroEntries(wounded).find(entry => entry.heroId === "myth_rion")?.carryHpRate, 0.004);

  const makeEnemy = between(main, "function makeBattleEnemy(e,index=0)", "function validBattlePartyMember(");
  const carryRateBranch = between(
    makeEnemy,
    "else if(Number.isFinite(Number(prepared.carryHpRate)))",
    "// The treasure-room Mimic",
  );
  assert.doesNotMatch(carryRateBranch, /Math\.max\(\s*0?\.0?1\s*,/,
    "a 0.4% permanent remainder must not be healed to 1% when battle HP is built");
  assert.match(carryRateBranch, /prepared\.carryHpRate/);
  assert.match(finalScreen, /defeated=hero\.defeated===true\|\|rate<=0/,
    "sub-percent HP must not make a surviving hero look defeated in the final-floor UI");
  assert.match(finalScreen, /1%未満/,
    "sub-percent HP must remain visibly distinct from zero in the final-floor UI");
});

test("Build310 final overlays dismiss consistently and edge markers remain inside every screen edge", () => {
  const ending = between(main, "function showCampaignEnding(ending)", "function showCampaignDefeatRewind(resultId)");
  const rewind = between(main, "function showCampaignDefeatRewind(resultId)", "function finishCampaignFinalBattle(won)");
  for (const source of [ending, rewind]) {
    assert.match(source, /modal\._onDismiss=finish/);
    assert.match(source, /finish=.*go\(["']home["']\)/);
    assert.match(source, /data-modal-primary\]["']\)\.onclick=finish/);
  }
  assert.match(heroCss, /is-north\{[^}]*transform:translate\(-50%,0\)/);
  assert.match(heroCss, /is-east\{[^}]*transform:translate\(0,-50%\)/);
  assert.match(heroCss, /is-south\{[^}]*transform:translate\(-50%,0\)/);
  assert.match(heroCss, /is-west\{[^}]*transform:translate\(0,-50%\)/);
  assert.match(rewind, /lionel-rewind-defeat[^`]*敗北/,
    "the defeat ending must be visibly presented before the day-nine rewind");
  assert.match(main, /configureCampaignOutcomeModal\(topModal\(\),["']campaignEndingTitle["']\)/);
  assert.match(main, /configureCampaignOutcomeModal\(topModal\(\),["']campaignRewindTitle["']\)/);
  const focusGuard = between(main, "function configureCampaignOutcomeModal(modal,id)", "function showCampaignEnding(ending)");
  assert.match(focusGuard, /event\.key!==["']Tab["']/);
  assert.match(focusGuard, /button:not\(\[disabled\]\)/);
  assert.match(focusGuard, /data-modal-dismiss/);
  assert.match(focusGuard, /dismiss\?\.focus/);
  assert.doesNotMatch(heroCss, /campaign-final-hero-card\.is-defeated\{[^}]*opacity:/);
});
