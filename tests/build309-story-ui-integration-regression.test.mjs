import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  CAMPAIGN_STORY_CHARACTERS,
  CAMPAIGN_STORY_MILESTONES,
  CAMPAIGN_STORY_OPENING_ID,
  CAMPAIGN_STORY_POLICY,
  CAMPAIGN_STORY_SCENES,
  acknowledgeCampaignStoryScene,
  nextCampaignStoryScene,
  normalizeCampaignStoryState,
  pendingCampaignStoryScenes,
} from "../src/core/CampaignStorySystem.js";
import { campaignEndingForResult } from "../src/core/Campaign100System.js";
import { recoverPendingCampaignFinalFlow } from "../src/services/SaveService.js";
import { hasMonsterSprite } from "../src/ui/MonsterVisual.js";

const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const css = await readFile(new URL("../src/Styles/build309-story.css", import.meta.url), "utf8");
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");

function between(start, end) {
  const from = main.indexOf(start);
  const to = main.indexOf(end, from + start.length);
  assert.ok(from >= 0, `missing source marker: ${start}`);
  assert.ok(to > from, `missing source marker: ${end}`);
  return main.slice(from, to);
}

test("Build309 presents the opening and milestone scenes through the receipt-safe story queue", () => {
  assert.match(main, /from"\.\/core\/CampaignStorySystem\.js/);
  const story = between("let campaignStoryQueueTimer", "function bindExplore()");
  const render = between("function render()", "function expeditionActive()");

  assert.match(render, /queueCampaignStoryScenes\(\{delay:220\}\)/);
  assert.match(story, /nextCampaignStoryScene\(save\.state,options\)/);
  assert.match(story, /acknowledgeCampaignStoryScene\(save\.state,scene\.id,\{seenAt:new Date\(\)\.toISOString\(\)\}\)/);
  assert.ok(
    story.indexOf("acknowledgeCampaignStoryScene") < story.indexOf("app.insertAdjacentHTML"),
    "the durable receipt is created before the scene is presented",
  );
  assert.match(story, /if\(!receipt\.recorded\|\|!save\.save\(\)\)/);
  assert.match(story, /scene\.id===CAMPAIGN_STORY_OPENING_ID\|\|!exploreAutoActive\(\)/,
    "the opening never auto-closes while AUTO may advance later road dialogue");
  assert.doesNotMatch(story, /bindBackdropTapClose/,
    "an accidental backdrop tap must not dismiss a story scene");
});

test("Build309 opening is shown once and every road scene is unlocked once only after its own boss clear", () => {
  const state = { player: { maxFloor: 1 }, campaign100: { floors: {} } };
  assert.equal(nextCampaignStoryScene(state, { clearedFloor: 0 })?.id, CAMPAIGN_STORY_OPENING_ID);
  assert.equal(acknowledgeCampaignStoryScene(state, CAMPAIGN_STORY_OPENING_ID).recorded, true);
  assert.equal(acknowledgeCampaignStoryScene(state, CAMPAIGN_STORY_OPENING_ID).recorded, false);
  assert.equal(nextCampaignStoryScene(state, { clearedFloor: 0 }), null);

  for (const floor of CAMPAIGN_STORY_MILESTONES) {
    const id = `road-${String(floor).padStart(3, "0")}`;
    state.player.maxFloor = floor;
    state.campaign100.floors[floor] = { bossDefeated: false, cleared: false };
    assert.equal(
      pendingCampaignStoryScenes(state).some(scene => scene.id === id),
      false,
      `${floor}Fに立っただけでは会話を解禁しない`,
    );
    state.campaign100.floors[floor].bossDefeated = true;
    assert.equal(nextCampaignStoryScene(state)?.id, id);
    assert.equal(acknowledgeCampaignStoryScene(state, id).recorded, true);
    assert.equal(acknowledgeCampaignStoryScene(state, id).recorded, false);
  }

  const story = normalizeCampaignStoryState(state);
  assert.equal(story.seenSceneIds.length, 11);
  assert.equal(new Set(story.seenSceneIds).size, 11);
  assert.deepEqual(pendingCampaignStoryScenes(state), []);
});

test("Build309 fires road scenes only from completed ten-floor milestones and gates the finale behind road-100", () => {
  const update = between("function update(dt)", "function showChestRewardReveal(");

  assert.match(update, /const clearedFloor=save\.state\.player\.currentFloor/);
  assert.match(update, /clearedFloor%10===0\)queueCampaignStoryScenes\(\{clearedFloor,delay:160\}\)/);
  assert.match(update, /queueCampaignStoryScenes\(\{clearedFloor,delay:0,onComplete:\(\)=>\{if\(!battle&&!document\.querySelector\("\.game-modal"\)\)openCampaignFinalPreparation\(\)\}\}\)/);
  assert.doesNotMatch(main, /queueCampaignInvasionDay|showCampaignInvasionDay|campaignInvasionPendingDay/);
});

test("Build309 story UI uses real authored assets, speech bubbles, approaching scenery and iPhone-safe controls", async () => {
  const story = between("let campaignStoryQueueTimer", "function bindExplore()");

  assert.match(story, /monsterVisual\(subject,"人物",\{frame:"idle1",className:"campaign-story-character-art"\}\)/);
  assert.match(story, /campaign-story-dialogue/);
  assert.match(story, /campaign-story-scenery/);
  assert.match(story, /campaign-story-skip/);
  assert.match(css, /var\(--story-backdrop\)/);
  assert.match(css, /boss-throne\.png/);
  assert.match(css, /\.campaign-story-dialogue::before/);
  assert.match(story, /--story-speaker-x/,
    "the speech-bubble pointer follows the active character portrait");
  assert.match(css, /max-height:calc\(100dvh/);
  assert.match(css, /safe-area-inset-top/);
  assert.match(css, /-webkit-overflow-scrolling:touch/);
  assert.match(css, /\.campaign-story-cast>figure\.is-right \.campaign-story-character-art>img\{transform:scaleX\(-1\)\}/);
  assert.match(index, /build309-story\.css/);

  assert.deepEqual(CAMPAIGN_STORY_SCENES.map(scene => scene.routeProgress), CAMPAIGN_STORY_MILESTONES);
  assert.ok(new Set(CAMPAIGN_STORY_SCENES.map(scene => scene.backgroundAsset)).size >= 5,
    "the road must visibly progress through several authored locations");
  for (const character of Object.values(CAMPAIGN_STORY_CHARACTERS)) {
    assert.equal(hasMonsterSprite(character.portrait.speciesId), true,
      `${character.name} must resolve through the established character sprite catalog`);
    assert.match(character.portrait.asset, /^\.\/assets\/monsters\/.+\/idle1\.png\?v=/);
  }
});

test("Build309 AUTO advances only road dialogue, then resumes exploration without trapping the player", () => {
  const story = between("let campaignStoryQueueTimer", "function bindExplore()");
  assert.match(story, /if\(scene\.id===CAMPAIGN_STORY_OPENING_ID\|\|!exploreAutoActive\(\)\)return/);
  assert.match(story, /autoTimer=setTimeout\(\(\)=>\{/);
  assert.match(story, /lineIndex<dialogue\.length-1\?advance\(\):finish\(\)/);
  assert.match(story, /if\(exploreAutoActive\(\)\)requestAnimationFrame\(applyExploreAutoPath\)/);
  assert.match(css, /overflow-y:auto/);
  assert.match(css, /touch-action:pan-y/);
  assert.match(css, /@media\(max-width:560px\)/);
  assert.match(css, /@media\(orientation:landscape\) and \(max-height:540px\)/);
});

test("Build309 final battle is one party fight with three survivor-based endings and no Sairan combat generation", () => {
  const finalFlow = between("function campaignHeroEncounter(", "function finishFloorBossChallengeBattle(");
  const checkpoint = between("function saveBattleCheckpoint()", "function clearBattleCheckpoint()");

  assert.match(finalFlow, /campaignEndingForResult\(\{partyWon:true,partySurvivors:survivingAllies,partySize:4\}\)/);
  assert.match(finalFlow, /現在パーティ4体 対 勇者4人の一戦で決着/);
  assert.match(finalFlow, /敗北しても/);
  assert.match(finalFlow, /nextCampaignStoryScene\(save\.state,\{clearedFloor:CAMPAIGN_MAX_FLOOR\}\)/,
    "the finale cannot bypass an unread opening or road-100 scene");
  assert.match(finalFlow, /onComplete:openCampaignFinalPreparation/,
    "the finale resumes only after all pending campaign story scenes are acknowledged");
  assert.doesNotMatch(finalFlow, /createMonster\("abyss_dominion"/);
  assert.doesNotMatch(finalFlow, /campaign-sairan-/);
  assert.doesNotMatch(finalFlow, /campaignStage:"sairan"/);
  assert.doesNotMatch(finalFlow, /campaignHeroSurvivors/);
  assert.doesNotMatch(checkpoint, /\["party","sairan"\]/);
  assert.match(checkpoint, /specialBattleType==="campaignFinal"\?\(battle\.campaignStage==="party"\?"party":null\)/,
    "a retired Sairan stage can never be written back to a final-battle checkpoint");
  assert.doesNotMatch(finalFlow, /campaign\.heroCarry=\[\]/);
  assert.match(main, /function retireLegacyCampaignSairanBattle\(\)/,
    "old interrupted Sairan checkpoints still receive runtime cleanup");
  assert.match(finalFlow, /if\(checkpoint&&checkpoint\.specialBattleType!=="campaignFinal"\)return false/,
    "runtime Sairan cleanup must never discard an unrelated live battle checkpoint");
  assert.equal(CAMPAIGN_STORY_POLICY.sairan.storyOnly, true);
  assert.equal(CAMPAIGN_STORY_POLICY.sairan.finalBattleParticipant, false);
  assert.equal(CAMPAIGN_STORY_POLICY.finalBattle.allowSairan, false);
  assert.equal((finalFlow.match(/startSpecialBattle\(/g) ?? []).length, 1,
    "the finale has one and only one battle start");
  assert.equal(campaignEndingForResult({ won: true, partySurvivors: 4, partySize: 4 }), "complete");
  assert.equal(campaignEndingForResult({ won: true, partySurvivors: 2, partySize: 4 }), "comeback");
  assert.equal(campaignEndingForResult({ won: false, partySurvivors: 4, partySize: 4 }), "defeat");
  assert.equal(campaignEndingForResult({ partyWon: false, sairanWon: true }), "defeat");
});

test("Build309 safely retires an old Sairan checkpoint and preserves the real party for a retry", () => {
  const party = [1, 2, 3, 4].map(index => ({ id: `party-${index}`, currentHp: 1, currentMp: 0, ailments: [] }));
  const state = {
    player: { inRun: true },
    expeditionSnapshot: { marker: "legacy-final" },
    monsters: [...party, { id: "legacy-sairan", campaignFinalTemporary: true, obtainedMethod: "campaignFinalTemporary" }],
    party: ["legacy-sairan"],
    activeBattle: {
      specialBattle: true,
      specialBattleType: "campaignFinal",
      campaignStage: "sairan",
      enemies: [{ id: "hero-enami", hp: 10 }],
    },
    campaign100: {
      finalUnlocked: true,
      finalPartyBackup: party.map(monster => monster.id),
      finalVitals: Object.fromEntries(party.map((monster, index) => [monster.id, { hp: 10 + index, mp: 2 + index, ailments: [] }])),
      finalStage: "sairan",
      finalSessionPending: "sairan",
      sairanMonsterId: "legacy-sairan",
      heroCarry: [{ speciesId: "myth_enami", hp: 10 }],
    },
  };

  const result = recoverPendingCampaignFinalFlow(state);
  assert.equal(result.recovered, true);
  assert.equal(result.stage, "sairan");
  assert.deepEqual(state.party, party.map(monster => monster.id));
  assert.equal(state.monsters.some(monster => monster.id === "legacy-sairan"), false);
  assert.equal(Object.hasOwn(state, "activeBattle"), false);
  assert.equal(state.expeditionSnapshot, null);
  assert.equal(state.player.inRun, false);
  assert.equal(state.campaign100.finalUnlocked, true);
  assert.equal(state.campaign100.finalFlowRecovery.reason, "sairan-story-only");
  for (const key of ["sairanMonsterId", "finalStage", "finalSessionPending", "heroCarry"]) {
    assert.equal(Object.hasOwn(state.campaign100, key), false);
  }
});
