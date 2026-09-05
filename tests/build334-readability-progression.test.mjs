import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { APP_VERSION } from "../src/core/config.js";
import {
  abyssSkillNodeById,
  canLearnAbyssSkill,
  learnAbyssSkill,
} from "../src/core/AbyssSkillTreeSystem.js";
import { awardFloorBossChallengeFragments } from "../src/core/FloorBossChallengeSystem.js";
import { FLOOR_BOSS_CATALOG } from "../src/data/floorBosses.js";
import { AbyssSkillTreeScreen } from "../src/ui/screens/AbyssSkillTreeScreen.js";
import { BattleScreen } from "../src/ui/screens/BattleScreen.js";

const root = new URL("..", import.meta.url);
const source = path => readFileSync(new URL(path, root), "utf8");

test("Build334 version and browser cache edge are current", () => {
  const index = source("index.html");
  assert.equal(APP_VERSION, "3.1.15");
  assert.match(index, /ASSET_VERSION = "3\.1\.15"/);
  assert.match(index, /ASSET_BUILD = "build334"/);
  assert.match(index, /build334-readability-progression\.css\?v=3\.1\.15-build334/);
  for (const path of [
    "src/main.js",
    "src/services/SaveService.js",
    "src/ui/screens/HomeScreen.js",
    "src/ui/screens/ExploreScreen.js",
    "src/ui/screens/GauntletScreen.js",
    "src/ui/screens/SettingsScreen.js",
    "src/online/OnlineViews.js",
    "src/online/OnlinePartyClient.js",
  ]) assert.match(source(path), /3\.1\.15-build334/, path);
});

test("Abyss tree starts at the root and follows connected prerequisites without floor gates", () => {
  const state = { player: { gold: 100_000, maxFloor: 1 } };
  assert.equal(canLearnAbyssSkill(state, "economy-gold-sense").ok, true);
  const locked = canLearnAbyssSkill(state, "economy-return-ledger");
  assert.equal(locked.ok, false);
  assert.equal(locked.reason, "prerequisite");
  assert.match(locked.message, /黄金の嗅覚/);
  assert.equal(learnAbyssSkill(state, "economy-gold-sense").ok, true);
  assert.equal(canLearnAbyssSkill(state, "economy-return-ledger").ok, true);

  const expansion = abyssSkillNodeById("economy-gold-vein-01");
  assert.ok(expansion);
  assert.equal(canLearnAbyssSkill(state, expansion.id).reason, "prerequisite");

  const html = AbyssSkillTreeScreen({ player: { gold: 100_000, maxFloor: 1 } }, "economy");
  assert.match(html, /前提技能＋GOLD/);
  assert.match(html, /階層到達条件はありません/);
  assert.doesNotMatch(html, /\d+階で解放|\d+階到達で解放/);
  assert.match(html, /abyss-tree-node locked/);
});

test("floor-boss replay fragments roll from two through four and remain idempotent", () => {
  const boss = FLOOR_BOSS_CATALOG[0];
  const createState = () => ({
    floorBossChallenges: {
      discovered: { [boss.id]: true },
      encounters: {},
      fragments: { [boss.id]: 0 },
      victories: { [boss.id]: 1 },
      contracts: {},
      processedResults: {},
    },
  });
  for (const [roll, expected] of [[0, 2], [0.5, 3], [0.999, 4]]) {
    const state = createState();
    const first = awardFloorBossChallengeFragments(state, boss.id, true, `battle-${expected}`, () => roll);
    assert.equal(first.amount, expected);
    const duplicate = awardFloorBossChallengeFragments(state, boss.id, true, `battle-${expected}`, () => 0);
    assert.equal(duplicate.amount, expected);
    assert.equal(duplicate.duplicate, true);
    assert.equal(state.floorBossChallenges.fragments[boss.id], expected);
  }
  assert.match(source("src/main.js"), /再戦勝利で欠片2〜4個（初勝利10個）/);
});

test("boss identity sits above the sprite, is not duplicated, and bruiser is Japanese", () => {
  const name = "深淵・暴食 グラトニー＝終わりなき飢餓";
  const enemy = { id: "boss", speciesId: "slime", name, level: 103, hp: 100, maxHp: 200, boss: true, endgameBossId: "abyss_gluttony", faction: "abyss", color: "#fff", role: "bruiser", element: "dark" };
  const battle = { party: [], enemies: [enemy], turnQueue: [], queueIndex: 0, turn: 1, species: { slime: { rarity: "R", element: "water" } }, selectedEnemyId: "boss", auto: true, biomePanelCollapsed: true };
  const html = BattleScreen(battle, { captureCrystals: 0 }, { battleSpeed: 1 }, 10);
  assert.match(html, /side-unit-sprite enemy-orb[\s\S]*battle-unit-floating-name/);
  assert.doesNotMatch(html, /class="enemy-card-name"/);
  assert.match(html, /戦闘特性<\/span><b>打撃型/);
  assert.equal((html.match(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length, 2, "title and visible heading only");

  const css = source("src/Styles/build334-readability-progression.css");
  assert.match(css, /\.battle-screen \.combat-rank-badge\{[\s\S]*box-shadow:none!important/);
  assert.match(css, /side-unit-sprite>\.battle-unit-floating-name[\s\S]*bottom:calc\(100% - 2px\)/);
});

test("notice claims refresh the visible resource HUD immediately", () => {
  const main = source("src/main.js");
  assert.match(main, /function claimRewardInboxEntry\([\s\S]*save\.save\(\)[\s\S]*refreshExploreResourceHud\(\)/);
  assert.match(main, /data-claim-daily-gift[\s\S]*refreshExploreResourceHud\(\)/);
  assert.match(main, /const values=\{goldHud:[\s\S]*crystalHud:[\s\S]*captureHud:[\s\S]*keyHud:/);
});
