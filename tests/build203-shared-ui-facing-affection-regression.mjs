import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderOnlineExplore, renderOnlineRaid, renderOnlineTeam } from "../src/online/OnlineViews.js?v=2.11.38-build203-test";
import { sanitizeProfile } from "../online-server/src/RoomStore.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = file => readFileSync(join(root, file), "utf8");
const css = read("src/Styles/build203.css"), main = read("src/main.js"), index = read("index.html"), config = read("src/core/config.js");

assert.match(css, /\.monster-visual\[data-monster-species\]>img\[data-monster-sprite\]/);
assert.match(css, /\.battle-ally-visual\{\s*transform:scaleX\(1\)!important/);
assert.match(css, /\.battle-enemy-visual\{\s*transform:scaleX\(-1\)!important/);
assert.match(css, /\.side-party \.side-unit-sprite\{bottom:70px!important\}/);
assert.match(css, /\.side-enemies \.side-unit-sprite\{bottom:60px!important\}/);
assert.match(css, /\.floor-boss-enemy \.side-unit-sprite\{bottom:50px!important\}/);
assert.match(main, /const penalty=count===1\?100:count===2\?150:200/);
assert.match(main, /if\(hpRate<=\.35\)return command\("guard"\)/);
assert.doesNotMatch(main, /m\.affection=Math\.max\(0,\(m\.affection\?\?m\.bond\?\?0\)-1\)/);
assert.match(index, /build203\.css\?v=2\.11\.38-build203/);
assert.match(index, /const ASSET_BUILD = "build203"/);
assert.match(config, /APP_VERSION="2\.11\.38"/);

const profile = {
  displayName: "自分", monsterName: "右向き勇者", speciesId: "slime", fallbackEmoji: "魔", level: 20,
  stars: 4, plus: 2, power: 2000, maxFloor: 100, attribute: "fire", circleId: "none",
  circleName: "魔法陣なし", circleLevel: 0, battleStats: { hp: 500, mp: 80, atk: 50, matk: 45, def: 30, mdef: 28, spd: 40 },
  skills: [{ id: "strike", name: "連携撃", description: "敵単体へ攻撃", mp: 5, kind: "attack" }], captureStock: 5,
  floorBossCatalogId: "floor_boss_020", summonTier: "LR",
};
const other = { ...profile, displayName: "友達", monsterName: "友達の魔物", speciesId: "goblin", floorBossCatalogId: null };
const members = [
  { playerId: "p1", leader: true, connected: true, profile, dungeonPosition: { x: 1, y: 1 }, coopVitals: { hp: 500, maxHp: 500, mp: 80, maxMp: 80 }, teamSide: "sun" },
  { playerId: "p2", connected: true, profile: other, dungeonPosition: { x: 2, y: 1 }, coopVitals: { hp: 450, maxHp: 500, mp: 70, maxMp: 80 }, teamSide: "moon" },
];
const base = { roomId: "ABC123", leaderId: "p1", members, selectedFloor: 10 };
const battle = { round: 1, phase: "command", speed: 1, deadlineAt: Date.now() + 10_000, actions: {}, lastEvents: [], players: [
  { playerId: "p1", side: "sun", hp: 500, maxHp: 500, mp: 80, maxMp: 80 },
  { playerId: "p2", side: "moon", hp: 450, maxHp: 500, mp: 70, maxMp: 80 },
] };
const gameState = { player: { currentFloor: 10, gold: 1000, crystals: 20, maxFloor: 100 }, inventory: { captureCrystals: 5, abyssKeys: 0 }, settings: {}, party: [], monsters: [], magicCircles: { owned: {} } };
const expedition = { ...base, phase: "expedition", expedition: { floor: 10, cols: 4, rows: 3, tiles: [["#", "#", "#", "#"], ["#", ".", ".", "#"], ["#", "#", "#", "#"]], objects: [], discoveries: 0, encountersCleared: 0, totalDiscoveries: 1, totalEncounters: 1, startedAt: Date.now() } };

const explore = renderOnlineExplore(expedition, "p1", { gameState });
assert.match(explore, /explore-screen-dungeon[^"]*online-shared-explore/);
assert.match(explore, /class="online-shared-map"/);
assert.match(explore, /data-online-map-player="p2"/);

const encounter = renderOnlineExplore({ ...expedition, expedition: { ...expedition.expedition, battle: { ...battle, enemies: [{ id: "e1", name: "敵", speciesId: "slime", hp: 100, maxHp: 100, level: 4 }] } } }, "p1");
const raid = renderOnlineRaid({ ...base, phase: "raid", raid: { ...battle, name: "レイド", boss: { id: "abyss-amalga", name: "ボス", asset: "./assets/online/raid.png", hp: 1000, maxHp: 1000, boss: true }, minions: [] } }, "p1");
const team = renderOnlineTeam({ ...base, phase: "team", teamBattle: { ...battle, format: "1 vs 1" } }, "p1");
for (const html of [encounter, raid, team]) {
  assert.match(html, /battle-screen side-battle-v2/);
  assert.match(html, /class="battle-party side-party"/);
  assert.match(html, /class="enemy-party side-enemies"/);
  assert.match(html, /data-command="attack"/);
  assert.ok(html.indexOf('class="battle-party side-party"') < html.indexOf('class="enemy-party side-enemies"'), "local side must render left before opponent side");
  assert.doesNotMatch(html, /class="online-v3-battle"/);
}

const sanitized = sanitizeProfile(profile);
assert.equal(sanitized.floorBossCatalogId, "floor_boss_020");
assert.equal(sanitized.summonTier, "LR");

console.log("build203 shared UI/facing/affection regression: PASS");
