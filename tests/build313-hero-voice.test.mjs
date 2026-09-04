import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  CAMPAIGN_HERO_CATCHPHRASES,
  CAMPAIGN_STORY_SCENES,
  campaignHeroFinalVoiceLines,
  campaignHeroVoiceLine,
} from "../src/core/CampaignStorySystem.js";

const HERO_IDS = ["myth_yori", "myth_hide", "myth_rion", "myth_enami"];
const MOMENTS = ["spotted", "contact", "repelled", "retreated", "heroVictory", "finalPlayerWin", "finalHeroesWin"];

test("Build313 preserves every supplied catchphrase and uses each in authored game dialogue", () => {
  assert.deepEqual(CAMPAIGN_HERO_CATCHPHRASES.myth_yori, ["イージー！！","開けんかいコラァ！","ディフィカルト","ユーアービューティフォー！！","おっと〜！？"]);
  assert.deepEqual(CAMPAIGN_HERO_CATCHPHRASES.myth_hide, ["フォー！！！！","いいゾ〜！コレ〜！","いやいやいや笑","待ってくださいよ〜！","いいんすか！！"]);
  assert.deepEqual(CAMPAIGN_HERO_CATCHPHRASES.myth_rion, ["おつかれナス","また今度やな","いこうぜ！","やったぜ！","最高やな","今日は豪遊するぞ！"]);
  assert.deepEqual(CAMPAIGN_HERO_CATCHPHRASES.myth_enami, ["メンタル！！","なんやコイツ","もうちょっとどこか行きたい","おいおい！そんなもんか？！","塩ください","まかセロリ"]);

  const storyText = CAMPAIGN_STORY_SCENES.flatMap(scene => scene.dialogue.map(entry => entry.text)).join("\n");
  const voiceText = HERO_IDS.flatMap(heroId => MOMENTS.flatMap(moment => [
    campaignHeroVoiceLine(heroId, moment, { cycle: 1 }),
    campaignHeroVoiceLine(heroId, moment, { cycle: 2 }),
  ])).join("\n");
  const allAuthoredText = `${storyText}\n${voiceText}`;
  for (const phrases of Object.values(CAMPAIGN_HERO_CATCHPHRASES)) {
    for (const phrase of phrases) assert.ok(allAuthoredText.includes(phrase), `${phrase} is used in story or encounter dialogue`);
  }
});

test("Build313 encounter voices change by hero, cycle, and battle result", () => {
  for (const heroId of HERO_IDS) {
    assert.notEqual(campaignHeroVoiceLine(heroId, "spotted", { cycle: 1 }), campaignHeroVoiceLine(heroId, "spotted", { cycle: 2 }));
    assert.notEqual(campaignHeroVoiceLine(heroId, "contact", { cycle: 1 }), campaignHeroVoiceLine(heroId, "contact", { cycle: 2 }));
    for (const moment of MOMENTS) assert.ok(campaignHeroVoiceLine(heroId, moment, { cycle: 1 }).length > 0, `${heroId} has ${moment}`);
  }
  assert.match(campaignHeroVoiceLine("より", "heroVictory"), /イージー！！/);
  assert.match(campaignHeroVoiceLine("ひで", "retreated"), /待ってくださいよ〜！/);
  assert.match(campaignHeroVoiceLine("りおん", "repelled"), /おつかれナス.*また今度やな/);
  assert.match(campaignHeroVoiceLine("えなみ", "heroVictory"), /おいおい！そんなもんか？！/);
  assert.deepEqual(campaignHeroFinalVoiceLines("finalHeroesWin", ["りおん", "unknown", "えなみ"]).map(entry => entry.heroId), ["myth_rion", "myth_enami"]);
});

test("Build313 loads the new voice layer and wires it into encounter and ending screens", () => {
  const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/Styles/build313-hero-voice.css", import.meta.url), "utf8");
  assert.match(index, /ASSET_BUILD = "build31[3-5]"/);
  assert.match(index, /build313-hero-voice\.css\?v=3\.1\.1-build313/);
  assert.match(main, /CampaignStorySystem\.js\?v=3\.1\.1-build313/);
  for (const moment of ["spotted", "contact", "repelled", "retreated", "heroVictory", "finalPlayerWin", "finalHeroesWin"]) assert.ok(main.includes(`"${moment}"`), `${moment} is wired into main`);
  assert.match(css, /\.campaign-hero-final-voices/);
  assert.match(css, /@media\(max-width:560px\)/);
});
