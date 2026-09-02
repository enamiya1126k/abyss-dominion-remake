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
  assert.deepEqual(campaign.heroCarry, [{ speciesId: "myth_enami", hp: 321 }]);
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

test("Build304 starts fixed Sairan only after party defeat and carries exact surviving hero HP", async () => {
  const main = await source("../src/main.js");
  const encounter = section(main, "function campaignHeroEncounter", "function campaignFinalVitals");
  const finish = section(main, "function finishCampaignFinalBattle", "function openCampaignFinalPreparation");
  const enemyBuilder = section(main, "function makeBattleEnemy", "function validBattlePartyMember");

  assert.match(encounter, /filter\(entry=>Number\(entry\?\.carryHp\)>0\)/, "dead heroes are excluded");
  assert.match(encounter, /carryHp:Math\.max\(1,Math\.floor\(Number\(entry\.carryHp\)\|\|1\)\)/, "the second encounter keeps exact integer HP");
  assert.match(encounter, /filter\(enemy=>HERO_PARTY_IDS\.includes\(enemy\.speciesId\)&&Number\(enemy\.hp\)>0\)/);
  assert.match(encounter, /carryHp:Math\.max\(1,Math\.floor\(Number\(enemy\.hp\)\|\|1\)\)/);

  const winBranch = finish.indexOf("if(won)return showCampaignEnding");
  const defeatBranch = finish.indexOf('if(stage==="party")');
  const sairanCreation = finish.indexOf('createMonster("abyss_dominion"');
  assert.ok(winBranch >= 0 && defeatBranch > winBranch && sairanCreation > defeatBranch, "Sairan is created only inside the party-defeat branch");
  assert.match(finish, /nickname:"魔王サイラーン",title:"万魔の王"/);
  assert.match(finish, /campaign\.heroCarry=survivors\.map\(entry=>\(\{speciesId:entry\.speciesId,hp:entry\.carryHp\}\)\)/);
  assert.match(finish, /campaignHeroEncounter\(level,survivors\)/);
  assert.match(finish, /勇者 \$\{survivors\.length\}\/4人/);
  assert.doesNotMatch(finish, /SAIRAN_TYPES|applyCampaignSairanType|selectedSairanType/);
  assert.ok(
    enemyBuilder.indexOf("if(Number.isFinite(Number(prepared.carryHp)))") > enemyBuilder.indexOf("applyEnemyMagicCircleProfile(enemy,prepared.enemyMagicCircle)"),
    "exact carry HP must be applied after magic-circle max-HP mutations",
  );

  const multiplierSource = section(main, "function applyEnemyMultiplier", "async function runSecretRoomAuto");
  const applyMultiplier = new Function(`${multiplierSource};return applyEnemyMultiplier`)();
  const carried = { maxHp: 100, hp: 7, campaignCarryHp: 7, atk: 10, matk: 10, def: 10, mdef: 10, spd: 10 };
  applyMultiplier(carried, 2);
  assert.equal(carried.maxHp, 200);
  assert.equal(carried.hp, 7, "later terrain or synergy scaling must not heal a carried hero");
  const fresh = { maxHp: 100, hp: 100, atk: 10, matk: 10, def: 10, mdef: 10, spd: 10 };
  applyMultiplier(fresh, 2);
  assert.equal(fresh.hp, 200, "ordinary freshly-created enemies still start at full HP");
});

test("Build304 exposes exactly complete, comeback and defeat endings", async () => {
  assert.equal(campaignEndingForResult({ partyWon: true }), "complete");
  assert.equal(campaignEndingForResult({ partyWon: false, sairanWon: true }), "comeback");
  assert.equal(campaignEndingForResult({ partyWon: false, sairanWon: false }), "defeat");

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

test("Build304 renders the daily invasion hierarchy with route progress and all four hero names", async () => {
  const main = await source("../src/main.js");
  const home = await source("../src/ui/screens/HomeScreen.js");
  const styles = await source("../src/Styles/build304-final.css");
  const invasion = section(main, "function showCampaignInvasionDay", "function bindExplore");

  assert.match(invasion, /予言 \$\{day\.day\}日目・\$\{day\.title\}/);
  assert.match(invasion, /勇者侵攻・\$\{day\.day\}\/10/);
  assert.match(invasion, /campaign-invasion-route/);
  assert.match(invasion, /西の大陸/);
  assert.match(invasion, /魔王城/);
  assert.match(invasion, /\["えなみ","より","ひで","りおん"\]/);
  assert.match(invasion, /--invasion-progress:\$\{advance\.progress\}%/);
  assert.match(home, /campaignHeroAdvance\(state\)/);
  assert.match(home, /id="openCampaignFinal"/);
  assert.match(styles, /\.campaign-invasion-route/);
  assert.match(styles, /@keyframes campaignHeroAdvance/);
});

test("Build304 final presentation loads after Build303 dungeon presentation", async () => {
  const index = await source("../index.html");
  const dungeon = index.indexOf("build303-dungeon.css?v=3.0.3-build303");
  const finale = index.indexOf("build304-final.css?v=3.0.4-build304");
  assert.ok(dungeon >= 0 && finale > dungeon);
});
