import test from "node:test";
import assert from "node:assert/strict";

import {
  CAMPAIGN_HERO_DIALOGUE_PROFILES,
  CAMPAIGN_STORY_CHARACTERS,
  CAMPAIGN_STORY_SCENES,
  resolveCampaignStoryScene,
} from "../src/core/CampaignStorySystem.js";

const HERO_IDS = ["myth_enami", "myth_yori", "myth_hide", "myth_rion"];

test("Build312 gives all ten road scenes a full four-person conversation", () => {
  assert.equal(CAMPAIGN_STORY_SCENES.length, 10);
  assert.deepEqual(CAMPAIGN_STORY_SCENES.map(scene => scene.floor), [10,20,30,40,50,60,70,80,90,100]);
  for (const scene of CAMPAIGN_STORY_SCENES) {
    assert.ok(scene.dialogue.length >= 10, `${scene.id} has at least ten authored beats`);
    const speakers = new Set(scene.dialogue.map(entry => entry.speakerId).filter(Boolean));
    for (const heroId of HERO_IDS) assert.ok(speakers.has(heroId), `${scene.id} includes ${heroId}`);
    for (const entry of scene.dialogue) {
      assert.equal(typeof entry.text, "string");
      assert.ok(entry.text.trim().length > 0);
      if (entry.speakerId) assert.ok(CAMPAIGN_STORY_CHARACTERS[entry.speakerId]);
    }
  }
});

test("Build312 keeps the four requested personalities distinct in data and dialogue", () => {
  assert.match(CAMPAIGN_HERO_DIALOGUE_PROFILES.myth_enami.core, /寄り添い.*論理/);
  assert.match(CAMPAIGN_HERO_DIALOGUE_PROFILES.myth_enami.flaw, /聞こえなく/);
  assert.match(CAMPAIGN_HERO_DIALOGUE_PROFILES.myth_rion.core, /金.*思いついた瞬間/);
  assert.match(CAMPAIGN_HERO_DIALOGUE_PROFILES.myth_yori.core, /話を聞き.*酔うと/);
  assert.match(CAMPAIGN_HERO_DIALOGUE_PROFILES.myth_hide.flaw, /一番大事な前提/);

  const allLines = CAMPAIGN_STORY_SCENES.flatMap(scene => scene.dialogue);
  const textFor = heroId => allLines.filter(entry => entry.speakerId === heroId).map(entry => entry.text).join("\n");
  assert.match(textFor("myth_enami"), /聞いてへん/);
  assert.match(textFor("myth_enami"), /守る.*盾|理由.*剣/);
  assert.match(textFor("myth_rion"), /旅費|回収|商権|市場/);
  assert.ok(allLines.filter(entry => entry.speakerId === "myth_yori" && entry.tone === "tipsy").length >= 3);
  assert.match(textFor("myth_hide"), /入れ忘れ|失念|最重要項目だけ抜けた/);
});

test("Build312 wound and repel continuity adds a companion reaction without changing receipts", () => {
  const woundedState = {
    player: { maxFloor: 21 },
    campaign100: { story309: { heroContinuity: { myth_yori: { damageRatio: 0.25 } } } },
  };
  const wounded = resolveCampaignStoryScene("road-020", woundedState);
  assert.equal(wounded.variant, "wounded");
  assert.equal(wounded.focusHeroId, "myth_yori");
  assert.equal(wounded.dialogue.length, CAMPAIGN_STORY_SCENES[1].dialogue.length + 2);
  assert.equal(wounded.dialogue.at(-1).speakerId, "myth_hide");
  assert.equal(wounded.dialogue.at(-1).reactionToHeroId, "myth_yori");

  const repelledState = {
    player: { maxFloor: 71 },
    campaign100: { story309: { heroContinuity: { myth_hide: { repelledCount: 1, defeated: true } } } },
  };
  const repelled = resolveCampaignStoryScene("road-070", repelledState);
  assert.equal(repelled.variant, "repelled");
  assert.equal(repelled.focusHeroId, "myth_hide");
  assert.equal(repelled.dialogue.length, CAMPAIGN_STORY_SCENES[6].dialogue.length + 2);
  assert.equal(repelled.dialogue.at(-1).speakerId, "myth_yori");
});
