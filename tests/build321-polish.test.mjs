import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { normalizeMagicCircleState } from "../src/core/MagicCircleSystem.js";

test("Build321 keeps magic circles on active party members only", () => {
  const state = {
    player: { gold: 0 },
    party: ["active"],
    monsters: [
      { id: "active", magicCircleId: "aegis", magicCircleInstanceId: "mc:aegis:1" },
      { id: "reserve", magicCircleId: "last_life", magicCircleInstanceId: "mc:last_life:1" },
    ],
    magicCircles: {
      version: 4,
      goldSpent: 0,
      unlocked: { aegis: true, last_life: true },
      instances: [
        { instanceId: "mc:aegis:1", circleId: "aegis", level: 2 },
        { instanceId: "mc:last_life:1", circleId: "last_life", level: 3 },
      ],
    },
  };
  normalizeMagicCircleState(state);
  assert.equal(state.monsters[0].magicCircleId, "aegis");
  assert.equal(state.monsters[0].magicCircleInstanceId, "mc:aegis:1");
  assert.equal(state.monsters[1].magicCircleId, "none");
  assert.equal(state.monsters[1].magicCircleInstanceId, null);
});

test("Build321 wires every requested UI and migration guard", async () => {
  const [index, main, saveService, home, battle, story, css] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/main.js", import.meta.url), "utf8"),
    readFile(new URL("../src/services/SaveService.js", import.meta.url), "utf8"),
    readFile(new URL("../src/ui/screens/HomeScreen.js", import.meta.url), "utf8"),
    readFile(new URL("../src/ui/screens/BattleScreen.js", import.meta.url), "utf8"),
    readFile(new URL("../src/core/CampaignStorySystem.js", import.meta.url), "utf8"),
    readFile(new URL("../src/Styles/build321-polish.css", import.meta.url), "utf8"),
  ]);

  assert.match(index, /build321-polish\.css\?v=3\.1\.2-build321/);
  assert.match(index, /const ASSET_BUILD = "build321"/);
  assert.match(home, /3\.1\.2-build321/);
  assert.match(css, /left:50%!important/);
  assert.match(css, /text-overflow:clip!important/);

  assert.match(main, /showLegacyCampaignResetPrompt/);
  assert.match(main, /初期化して最初から始める/);
  assert.match(saveService, /legacyCampaignSource=progressFrom<70/);
  assert.match(saveService, /migrationNotices\.legacyCampaignReset/);

  assert.match(main, /m\.magicCircleId="none";m\.magicCircleInstanceId=null/);
  assert.match(main, /outgoing\.magicCircleId="none";outgoing\.magicCircleInstanceId=null/);
  assert.match(main, /nextCampaignStoryScene\(save\.state\)/);
  assert.match(main, /<small>区画移動<\/small>/);
  assert.match(main, /outerWidth=Math\.max\(4,transform\.scale\*1\.65\)/);
  assert.match(main, /playerRadius=Math\.max\(2\.5,Math\.min\(5,transform\.scale\*\.62\)\)/);

  assert.doesNotMatch(battle, /class="enemy-card-name"/);
  assert.doesNotMatch(battle, /class="battle-mini-stats enemy-mini-stats"/);
  assert.match(battle, /HP \$\{battleInteger\(enemy\.hp\)\}/);

  assert.match(story, /name:"魔王サイラーン"/);
  assert.match(story, /name:"預言者リオネル"/);
  assert.match(story, /campaign-sairan\.png\?v=3\.1\.2-build321/);
  assert.match(story, /campaign-lionel\.png\?v=3\.1\.2-build321/);
  assert.match(story, /lionel:Object\.freeze\(\{storyOnly:true,recurring:true,battleEligible:false/);
  assert.match(story, /allowLionel:false/);
});

test("Build321 dedicated story portraits are present and non-trivial", async () => {
  const [sairan, lionel] = await Promise.all([
    stat(new URL("../assets/story/campaign-sairan.png", import.meta.url)),
    stat(new URL("../assets/story/campaign-lionel.png", import.meta.url)),
  ]);
  assert.ok(sairan.size > 100_000);
  assert.ok(lionel.size > 100_000);
});
