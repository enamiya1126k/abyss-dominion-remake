import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { APP_VERSION } from "../src/core/config.js";
import { ABYSS_SKILL_NODES, canLearnAbyssSkill, learnAbyssSkill } from "../src/core/AbyssSkillTreeSystem.js";
import { ENDGAME_BOSSES, createEmergencyEncounter } from "../src/core/EndgameSystem.js";
import { campaignBossSupportCount, campaignEncounterPartySize } from "../src/core/EncounterPoolSystem.js";
import { AbyssSkillTreeScreen } from "../src/ui/screens/AbyssSkillTreeScreen.js";
import { CampaignIntelScreen } from "../src/ui/screens/CampaignIntelScreen.js";
import { BattleScreen } from "../src/ui/screens/BattleScreen.js";
import { FULL_RESET_WARNING } from "../src/core/FullResetSystem.js";
import { GuildCoordinator } from "../online-server/src/GuildCoordinator.js";

const root = new URL("..", import.meta.url);
const source = path => readFileSync(new URL(path, root), "utf8");

test("Build332 version and cache edge are current", () => {
  const index = source("index.html");
  assert.equal(APP_VERSION, "3.1.13");
  assert.match(index, /ASSET_VERSION = "3\.1\.13"/);
  assert.match(index, /ASSET_BUILD = "build332"/);
  assert.match(index, /build332-request-fixes\.css\?v=3\.1\.13-build332/);
});

test("every abyss node can be bought directly when GOLD is sufficient", () => {
  for (const node of ABYSS_SKILL_NODES) {
    const state = { player: { gold: node.cost, maxFloor: 1 } };
    assert.equal(canLearnAbyssSkill(state, node.id).ok, true, node.id);
    assert.equal(learnAbyssSkill(state, node.id).ok, true, node.id);
    assert.equal(state.player.gold, 0, node.id);
  }
  const state = { player: { gold: 0, maxFloor: 100 } };
  const html = AbyssSkillTreeScreen(state, "economy");
  assert.doesNotMatch(html, /階で解放|階到達で解放|ルート未到達/);
  assert.match(html, /購入条件<\/small><b>GOLDのみ/);
});

test("all Deep Abyss and Ten-God selections open with the selected identity", () => {
  const base = { player: { currentFloor: 50, maxFloor: 50 }, floorBossChallenges: { discovered: {} }, monsters: [], party: [] };
  for (const [id, boss] of Object.entries(ENDGAME_BOSSES)) {
    const encounter = createEmergencyEncounter(structuredClone(base), id);
    assert.equal(encounter.boss.id, id);
    assert.equal(encounter.waves.length, 1, id);
    assert.equal(encounter.enemies[0].endgameBossId, id);
    assert.match(encounter.enemies[0].nameOverride, new RegExp(boss.name));
    assert.equal(encounter.preludeBossIds.length, 0);
  }
});

test("campaign hero intel uses portraits, authored skills, and a stable SVG back icon", () => {
  const heroes = ["より", "ひで", "えなみ", "りおん"].map((name, index) => ({ id: `hero-${index}`, name, title: "勇者", role: "役割", status: "未遭遇", remainingHpPercent: 100, field: "追跡", combat: "戦闘", counter: "対策", decisionRules: [{ when: "条件", action: "行動" }] }));
  const model = { heroes, route: [{ id: "p", x: 1, y: 1, name: "地点", shortName: "地点", detail: "詳細" }], current: { id: "p", x: 1, y: 1, name: "地点" }, currentIndex: 0 };
  const presentation = Object.fromEntries(heroes.map(hero => [hero.id, { visual: `<img src="${hero.id}.png">`, skills: [{ name: "固有技", tag: "固有", element: "光", target: "敵単体", mp: 4, cooldown: 1, effect: "効果" }] }]));
  const html = CampaignIntelScreen(model, { tab: "heroes", heroPresentation: presentation });
  assert.equal((html.match(/campaign-hero-summary-portrait/g) ?? []).length, 4);
  assert.equal((html.match(/固有技/g) ?? []).length, 4);
  assert.match(html, /<svg viewBox="0 0 24 24"/);
  assert.doesNotMatch(html, /campaign-hero-sigil/);
  assert.match(source("src/main.js"), /species\.authoredSkills\?\?species\.skills/);
});

test("encounter sizes favor parties and bosses bring support", () => {
  assert.equal(campaignEncounterPartySize(1, .9), 1);
  assert.equal(campaignEncounterPartySize(10, .9), 4);
  assert.ok([3, 4].includes(campaignEncounterPartySize(50, .5)));
  assert.equal(campaignEncounterPartySize(100, 0), 4);
  assert.deepEqual([campaignBossSupportCount(5), campaignBossSupportCount(10), campaignBossSupportCount(30)], [1, 2, 3]);
  assert.match(source("src/main.js"), /beginEncounter\(floorBossParty\(bossInfo,floor\)\)/);
  assert.match(source("src/main.js"), /return\[bossInfo,\.\.\.supports\]/);
});

test("boss cards never fall back to base-species R and show the full name twice", () => {
  const name = "黒鉄の剣王・正式なる階層支配者名";
  const enemy = { id: "boss", speciesId: "slime", name, level: 82, hp: 5107, maxHp: 5107, boss: true, floorBossCatalogId: "floor-boss", campaignBossId: "floor-boss", color: "#fff", role: "tank", element: "dark" };
  const battle = { party: [], enemies: [enemy], turnQueue: [], queueIndex: 0, turn: 1, species: { slime: { rarity: "R", element: "water" } }, selectedEnemyId: "boss", auto: true, biomePanelCollapsed: true };
  const html = BattleScreen(battle, { captureCrystals: 0 }, { battleSpeed: 1 }, 8);
  assert.match(html, /階層BOSS/);
  assert.match(html, /enemy-card-name/);
  assert.ok(html.split(name).length >= 3);
  assert.doesNotMatch(html, /rank-r">R/);
});

test("AUTO rules avoid immediate portal reversal and manual taps still disable AUTO", () => {
  const main = source("src/main.js");
  assert.match(main, /if\(currentObjects\.length\)return currentObjects;\s*if\(unvisited\.length\)return unvisited;/);
  assert.match(main, /entry\.portal\?\.targetSectionId===last\.from/);
  assert.match(main, /navigation\.reverseCount>=2/);
  assert.match(main, /pauseUntil=Date\.now\(\)\+360/);
  assert.match(main, /stopExploreAuto\("手動操作へ切り替え"\)/);
});

test("only the requested gathering-hall long-press overlay is removed", () => {
  const views = source("src/online/OnlineViews.js");
  assert.doesNotMatch(views, /class="online-hall-emote-tool"/);
  assert.match(views, /online-hall-chat-tool/);
  assert.match(views, /online-hall-game-emote-tool/);
  assert.match(views, /online-explore-emote/);
});

test("full reset warning includes guild membership and server exposes the required capability", () => {
  assert.match(FULL_RESET_WARNING, /ギルド所属・役職・加入申請・招待/);
  assert.match(source("src/online/OnlinePartyClient.js"), /fullResetGuildV1/);
  assert.match(source("online-server/server.js"), /fullResetGuildV1:true/);
  assert.match(source("online-server/src/RoomStore.js"), /this\.guilds\.fullReset\(session\)/);
});

test("full reset removes a guild leader without orphaning the remaining guild", () => {
  const directory = mkdtempSync(join(tmpdir(), "abyss-build332-"));
  try {
    const leader = { playerId: "AD-AAAA-BBBB", connected: true }, member = { playerId: "AD-CCCC-DDDD", connected: true };
    const sessions = new Map([[leader.playerId, leader], [member.playerId, member]]);
    const coordinator = new GuildCoordinator({ sessions, rooms: new Map(), stateFile: join(directory, "guilds.json"), playerExists: () => true, areFriends: () => true, profileOf: id => ({ playerId: id, displayName: id }) });
    assert.equal(coordinator.create(leader, { name: "検証団", tag: "TEST" }).ok, true);
    const guild = coordinator._guildFor(leader.playerId);
    assert.equal(coordinator._join(guild, member.playerId).ok, true);
    guild.officerIds.add(member.playerId); guild.week.memberPoints[leader.playerId] = 10; guild.week.checkIns[leader.playerId] = "2026-09-04"; coordinator.checkIns.set(leader.playerId, "2026-09-04"); coordinator._commit();
    const result = coordinator.fullReset(leader);
    assert.equal(result.ok, true);
    assert.equal(coordinator.memberships.has(leader.playerId), false);
    assert.equal(coordinator._guildFor(member.playerId).leaderId, member.playerId);
    assert.equal(coordinator.checkIns.has(leader.playerId), false);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
