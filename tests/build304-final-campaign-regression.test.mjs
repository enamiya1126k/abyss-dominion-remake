import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  HERO_PARTY_IDS,
  campaignEndingForResult,
  campaignHeroAdvance,
  normalizeCampaignState,
  recordCampaignEnding,
} from "../src/core/Campaign100System.js";
import {
  CAMPAIGN_STORY_CHARACTERS,
  CAMPAIGN_STORY_MILESTONES,
  CAMPAIGN_STORY_SCENES,
} from "../src/core/CampaignStorySystem.js";

const source = async path => readFile(new URL(path, import.meta.url), "utf8");
const section = (text, start, end) => {
  const from = text.indexOf(start);
  const to = text.indexOf(end, from + start.length);
  assert.notEqual(from, -1, `missing source section: ${start}`);
  assert.notEqual(to, -1, `missing source section terminator: ${end}`);
  return text.slice(from, to);
};

test("Build304 advances the four heroes once per prophecy day and arrives only after floor 100 is cleared", () => {
  assert.deepEqual(HERO_PARTY_IDS, ["myth_enami", "myth_yori", "myth_hide", "myth_rion"]);

  const day1 = campaignHeroAdvance({ player: { currentFloor: 1, maxFloor: 1 }, campaign100: {} });
  assert.deepEqual(
    { day: day1.day, progress: day1.progress, daysRemaining: day1.daysRemaining, arrived: day1.arrived },
    { day: 1, progress: 0, daysRemaining: 9, arrived: false },
  );
  assert.equal(day1.location, "西の大陸・王都門");

  const day6 = campaignHeroAdvance({ player: { currentFloor: 56, maxFloor: 56 }, campaign100: {} });
  assert.equal(day6.day, 6);
  assert.equal(day6.location, "七罪の荒野");
  assert.equal(day6.daysRemaining, 4);

  const beforeClear = campaignHeroAdvance({ player: { currentFloor: 100, maxFloor: 100 }, campaign100: {} });
  assert.equal(beforeClear.arrived, false);
  assert.equal(beforeClear.status, "決戦は目前");
  assert.equal(beforeClear.floorsRemaining, 1);

  const afterClear = campaignHeroAdvance({
    player: { currentFloor: 100, maxFloor: 100 },
    campaign100: { finalUnlocked: true },
  });
  assert.deepEqual(
    { day: afterClear.day, progress: afterClear.progress, daysRemaining: afterClear.daysRemaining, floorsRemaining: afterClear.floorsRemaining },
    { day: 10, progress: 100, daysRemaining: 0, floorsRemaining: 0 },
  );
  assert.equal(afterClear.arrived, true);
  assert.equal(afterClear.location, "魔王城・正門");
  assert.equal(afterClear.status, "勇者一行が到着");
});

test("Build304 migration permanently removes the detached eight-general roster and selectable Sairan type", () => {
  const state = {
    campaign100: {
      version: 3,
      selectedSairanType: "fortress",
      generalIds: ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8"],
      activeGeneralIds: ["g1", "g2", "g3", "g4"],
      reserveGeneralIds: ["g5", "g6", "g7", "g8"],
      storyDaysSeen: [1, 2],
      finalPartyBackup: ["m1", "m2", "m3", "m4", "m5"],
      heroCarry: [
        { speciesId: "myth_enami", hp: 321.9 },
        { speciesId: "myth_yori", hp: 0 },
        { speciesId: "not-a-hero", hp: 999 },
      ],
    },
  };

  const campaign = normalizeCampaignState(state);
  for (const key of ["selectedSairanType", "generalIds", "activeGeneralIds", "reserveGeneralIds", "storyDaysSeen"])
    assert.equal(Object.hasOwn(campaign, key), false, `${key} must not survive migration`);
  assert.deepEqual(campaign.finalPartyBackup, ["m1", "m2", "m3", "m4"]);
  assert.equal(Object.hasOwn(campaign, "heroCarry"), false, "retired Sairan HP carry cannot survive Build309 normalization");
});

test("Build304 final preparation deploys exactly the current four party members with no extra roster UI", async () => {
  const main = await source("../src/main.js");
  const core = await source("../src/core/Campaign100System.js");
  const preparation = section(main, "function openCampaignFinalPreparation()", "function finishFloorBossChallengeBattle");

  assert.match(preparation, /save\.state\.party\?\?\[\]\)\.filter\([^;]+\)\.slice\(0,4\)/);
  assert.match(preparation, /ready=party\.length===4/);
  assert.match(preparation, /現在パーティ \$\{party\.length\}\/4体/);
  assert.match(preparation, /現在パーティ4体 対 勇者4人/);
  assert.match(preparation, /現在の4体で迎え撃つ/);
  assert.match(preparation, /if\(liveIds\.length!==4\)return showToast\("現在パーティを4体編成してください"\)/);
  assert.match(preparation, /campaignStage:"party"/);

  for (const obsolete of [
    "SAIRAN_TYPES",
    "applyCampaignSairanType",
    "selectedSairanType",
    "generalIds",
    "activeGeneralIds",
    "reserveGeneralIds",
    "魔軍将軍",
    "控え4",
  ]) {
    assert.doesNotMatch(preparation, new RegExp(obsolete), `${obsolete} must not return to final preparation`);
  }
  assert.doesNotMatch(core, /export\s+(?:const|function)\s+(?:SAIRAN_TYPES|applyCampaignSairanType)\b/);
});

test("Build309 resolves the finale in one current-party battle with no Sairan stage or hero carry", async () => {
  const main = await source("../src/main.js");
  const encounter = section(main, "function campaignHeroEncounter", "function campaignFinalVitals");
  const finish = section(main, "function finishCampaignFinalBattle", "function openCampaignFinalPreparation");

  assert.match(encounter, /return HERO_PARTY_IDS\.map\(\(speciesId,index\)=>prepareEnemyEntry/);
  assert.doesNotMatch(encounter, /carryHp|campaignHeroSurvivors|heroCarry|sairan/i);
  assert.match(finish, /const survivingAllies=\(battle\?\.party\?\?\[\]\)\.filter/);
  assert.match(finish, /if\(!won\)return showCampaignEnding\("defeat"\)/);
  assert.match(finish, /campaignEndingForResult\(\{partyWon:true,partySurvivors:survivingAllies,partySize:4\}\)/);
  assert.doesNotMatch(finish, /createMonster\(|campaignStage:"sairan"|campaignHeroEncounter|heroCarry/i);
});

test("Build309 exposes complete, comeback and defeat from the current party result", async () => {
  assert.equal(campaignEndingForResult({ partyWon: true, partySurvivors: 4 }), "complete");
  assert.equal(campaignEndingForResult({ won: true, partySurvivors: 2 }), "comeback");
  assert.equal(campaignEndingForResult({ partyWon: false, sairanWon: true }), "defeat");

  for (const [ending, victorious] of [["complete", true], ["comeback", true], ["defeat", false]]) {
    const state = {};
    const result = recordCampaignEnding(state, ending);
    assert.equal(result.ending, ending);
    assert.equal(result.victorious, victorious);
    assert.deepEqual(state.campaign100.endings, [ending]);
  }

  const main = await source("../src/main.js");
  const ending = section(main, "function showCampaignEnding", "function finishCampaignFinalBattle");
  assert.match(ending, /complete:\{title:"完全勝利"/);
  assert.match(ending, /comeback:\{title:"逆転勝利"/);
  assert.match(ending, /defeat:\{title:"敗北"/);
});

test("Build309 renders ten authored road conversations with portraits, bubbles, and an approaching castle", async () => {
  const main = await source("../src/main.js");
  const home = await source("../src/ui/screens/HomeScreen.js");
  const styles = await source("../src/Styles/build309-story.css");
  const story = section(main, "let campaignStoryQueueTimer", "function bindExplore");

  assert.deepEqual(CAMPAIGN_STORY_MILESTONES, [10,20,30,40,50,60,70,80,90,100]);
  assert.equal(CAMPAIGN_STORY_SCENES.length, 10);
  assert.deepEqual(new Set(CAMPAIGN_STORY_SCENES.flatMap(scene => scene.dialogue.map(line => line.speakerId))), new Set(HERO_PARTY_IDS));
  assert.deepEqual(HERO_PARTY_IDS.map(id => CAMPAIGN_STORY_CHARACTERS[id].name), ["えなみ","より","ひで","りおん"]);
  assert.match(story, /campaign-story-route/);
  assert.match(story, /campaign-story-dialogue/);
  assert.match(story, /campaign-story-character-art/);
  assert.match(story, /西の大陸/);
  assert.match(story, /魔王城/);
  assert.match(story, /--story-progress:\$\{progress\}%/);
  assert.match(home, /campaignHeroAdvance\(state\)/);
  assert.match(home, /id="openCampaignFinal"/);
  assert.match(styles, /\.campaign-story-dialogue::before/);
  assert.match(styles, /var\(--story-backdrop\)/);
  assert.match(styles, /var\(--story-castle-opacity\)/);
  assert.match(styles, /@keyframes storyRouteAdvance/);
});

test("Build304 final presentation loads after Build303 dungeon presentation", async () => {
  const index = await source("../index.html");
  const dungeon = index.indexOf("build303-dungeon.css?v=3.0.3-build303");
  const finale = index.indexOf("build304-final.css?v=3.0.4-build304");
  assert.ok(dungeon >= 0 && finale > dungeon);
});
