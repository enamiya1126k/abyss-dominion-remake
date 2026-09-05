import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

import { APP_VERSION } from "../src/core/config.js";
import { createCampaignDungeonLayout } from "../src/core/CampaignDungeonLayoutSystem.js";
import { createSoloStyleDungeon } from "../online-server/src/OfflineDungeonRules.js";
import { CampaignIntelScreen } from "../src/ui/screens/CampaignIntelScreen.js";

const read = path => readFile(new URL(path, import.meta.url), "utf8");
const seeded = seed => {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 0x100000000;
  };
};

test("Build333 version and browser cache edge are current", async () => {
  const index = await read("../index.html");
  assert.equal(APP_VERSION, "3.1.14");
  assert.match(index, /ASSET_VERSION = "3\.1\.14"/);
  assert.match(index, /ASSET_BUILD = "build333"/);
  assert.match(index, /build333-online-parity-raid\.css\?v=3\.1\.14-build333/);
});

test("offline and shared exploration use the same canonical floor layout", () => {
  for (const seed of [1, 17, 333, 20260905]) {
    const input = { floor: 9, bossIds: ["boss-a", "boss-b"], recentSignatures: ["old-shape"] };
    const offline = createCampaignDungeonLayout({ ...input, random: seeded(seed) });
    const shared = createSoloStyleDungeon({ roomId: "ROOM", floor: input.floor, runId: "RUN", now: 1, random: seeded(seed), bossIds: input.bossIds, recentSignatures: input.recentSignatures });
    assert.deepEqual(shared.tiles, offline.tiles.map(row => row.map(tile => tile === 0 ? "." : "#").map(String).join("")));
    assert.deepEqual(shared.sectionGraph, offline.sectionGraph);
    assert.deepEqual(shared.sectionPortals, offline.sectionPortals);
    assert.deepEqual(shared.shapeSignatures, offline.shapeSignatures);
    assert.equal(shared.layoutVersion, offline.layoutVersion);
  }
});

test("shared exploration carries section metadata and distributes three campaign keys", () => {
  const dungeon = createSoloStyleDungeon({ roomId: "ROOM", floor: 50, runId: "RUN", now: 1, random: seeded(50), bossIds: ["one", "two", "three"] });
  assert.ok(dungeon.sections.length >= 4);
  assert.ok(dungeon.sectionPortals.length >= dungeon.sections.length - 1);
  const keys = dungeon.objects.filter(object => object.type === "campaignKey");
  assert.equal(keys.length, 3);
  assert.equal(new Set(keys.map(object => object.sectionId)).size, 3);
});

test("online exploration reuses the offline five-button screen and removes the long-press control", async () => {
  const [views, screen] = await Promise.all([read("../src/online/OnlineViews.js"), read("../src/ui/screens/ExploreScreen.js")]);
  assert.match(views, /return ExploreScreen\(base/);
  assert.doesNotMatch(views, /class="online-explore-emote"/);
  assert.doesNotMatch(views, /navHtml:/);
  for (const id of ["pauseParty", "fieldEquipment", "pauseItems", "centerCamera", "returnHome"]) assert.match(screen, new RegExp(`id="${id}"`));
});

test("connection state stays in document flow and clears the profile drawer", async () => {
  const css = await read("../src/Styles/build333-online-parity-raid.css");
  assert.match(css, /online-v3-connection-banner[\s\S]*position:static!important/);
  assert.match(css, /online-v3-profile-drawer:not\(\[hidden\]\)\+\.online-v3-connection-banner\{display:none!important\}/);
});

test("hero intelligence is Japanese, portrait-led, and skill-card based", () => {
  const hero = { id: "myth_yori", name: "より", title: "微笑む蒼拳", role: "物理勇者", status: "未遭遇", remainingHpPercent: 100, woundPercent: 0, encounters: 0, field: "二歩あとを追う", combat: "低HPを狙う", counter: "物理防御を優先", decisionRules: [{ when: "奥義が使用可能", action: "最優先で奥義" }] };
  const model = { heroes: [hero], route: [{ id: "start", x: 1, y: 1, name: "王都門", shortName: "王都門", detail: "" }], currentIndex: 0, current: { id: "start", x: 1, y: 1, name: "王都門" }, next: { shortName: "王都門" }, day: 1, progress: 0, remainingDays: 10 };
  const html = CampaignIntelScreen(model, { tab: "heroes", heroPresentation: { myth_yori: { visual: '<img class="campaign-intel-hero-visual" src="hero.png">', attribute: "水", speciesRole: "物理勇者", skills: [{ name: "蒼拳", tag: "attack", element: "water", target: "enemy", mp: 20, cooldown: 2, effect: "物理ダメージ" }] } } });
  for (const text of ["戦闘特性", "登録済みの技能", "使用スキル", "効果", "対象", "消費MP", "再使用", "発動条件・行動優先", "水属性", "敵単体"]) assert.match(html, new RegExp(text));
  assert.doesNotMatch(html, /TACTICAL IDENTITY|REGISTERED SKILLS|COMBAT PRIORITY/);
  assert.match(html, /campaign-intel-hero-visual/);
});

test("raid bosses keep finite mythic profiles and static artwork", async () => {
  const [coordinator, views] = await Promise.all([read("../online-server/src/RaidCoordinator.js"), read("../src/online/OnlineViews.js")]);
  assert.match(coordinator, /level:Math\.max\(1,Number\(bossDef\.level\)\|\|1\)/);
  assert.match(coordinator, /summonRarity:"神話"/);
  assert.match(coordinator, /heroAsset:bossDef\.heroAsset,asset:bossDef\.heroAsset/);
  assert.match(views, /staticRaidAsset = raidUnit \? enemy\.heroAsset \?\? enemy\.asset/);
  assert.match(views, /magicCircleLevel: Math\.max\(1, Number\(enemy\.magicCircleLevel \?\? enemy\.circleLevel\) \|\| 1\)/);
});

test("each weekly raid boss exchanges its own magic circle instead of crystals", async () => {
  const [main, views] = await Promise.all([read("../src/main.js"), read("../src/online/OnlineViews.js")]);
  for (const id of ["death_mirror", "raid_zero_sovereign", "raid_vajra_beast"]) assert.match(main, new RegExp(`circleId:"${id}"`));
  for (const name of ["即死返鏡陣", "零界凍結陣", "天雷轟界陣"]) assert.match(main, new RegExp(name));
  assert.match(views, /\[`circle:\$\{boss\.id\}`/);
  assert.doesNotMatch(views, /魔晶石 ×100|魔晶石×100/);
});

test("new raid magic-circle images are packaged as real files", async () => {
  await Promise.all([
    access(new URL("../assets/magic-circles/raid-zero-sovereign.png", import.meta.url)),
    access(new URL("../assets/magic-circles/raid-vajra-beast.png", import.meta.url)),
  ]);
});

test("host shape history is sent and reused across shared floors", async () => {
  const [client, server] = await Promise.all([read("../src/online/OnlinePartyClient.js"), read("../online-server/src/RoomStore.js")]);
  assert.match(client, /dungeonShapeHistory: full\.dungeonShapeHistory/);
  assert.match(server, /recentHostShapeSignatures\(room\.hostWorld,room\.selectedFloor\)/);
  assert.match(server, /rememberHostShapeSignatures\(nextHostWorld,nextFloor,next\.shapeSignatures\)/);
});
