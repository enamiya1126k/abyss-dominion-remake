import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("build228 renders LINK ARTS from the new snapshot with a legacy fallback", async () => {
  const views = await read("src/online/OnlineViews.js");
  const renderer = views.slice(views.indexOf("function renderLinkArts"), views.indexOf("export function renderSharedBattle"));
  assert.match(renderer, /battle\?\.coopTechnique \?\? battle\?\.coopBreak/);
  assert.match(renderer, /state\.enabled === false/);
  assert.match(renderer, /state\.lastLabel/);
  assert.match(renderer, /state\.lastTechnique/);
  assert.match(renderer, /state\.totalUses/);
  for (const field of ["technique.id", "technique.name", "technique.shortLabel", "technique.effectText"]) assert.match(renderer, new RegExp(field.replace(".", "\\.")));
  assert.match(renderer, /role="progressbar"/);
  assert.match(renderer, /aria-valuemin="0"/);
  assert.match(renderer, /aria-valuemax="\$\{maximum\}"/);
  assert.match(renderer, /aria-valuenow="\$\{Math\.min\(gauge, maximum\)\}"/);
  assert.match(renderer, /直近 \$\{latest\}/);
  assert.doesNotMatch(renderer, /<button/);
});

test("build228 keeps LINK ARTS visible beside the co-op boss mechanic", async () => {
  const [views, styles] = await Promise.all([read("src/online/OnlineViews.js"), read("src/Styles/build228.css")]);
  assert.match(views, /const linkArts = renderLinkArts\(battle\)/);
  assert.match(views, /\$\{screen\}\$\{linkArts\}\$\{coopBossMechanic\}/);
  assert.doesNotMatch(views, /coopBreak && !battle\?\.coopBoss/);
  assert.match(styles, /is-coop-boss>\.online-link-arts/);
  assert.match(styles, /is-coop-boss>\.online-coop-boss-mechanic/);
});

test("build228 renders an accessible live snapshot and its legacy state", async () => {
  const { renderSharedBattle } = await import("../src/online/OnlineViews.js?v=2.11.54-build228-test");
  const profile = { displayName: "冒険者", monsterName: "スライム", speciesId: "slime", level: 20, battleStats: { hp: 300, atk: 40, def: 35, spd: 30 }, skills: [] };
  const room = { selectedFloor: 50, members: [{ playerId: "p1", connected: true, profile }, { playerId: "p2", connected: true, profile }] };
  const battle = {
    floor: 50, round: 3, phase: "command", speed: 1, actions: {}, lastEvents: [],
    players: [{ playerId: "p1", hp: 300, maxHp: 300, mp: 30, maxMp: 30 }, { playerId: "p2", hp: 300, maxHp: 300, mp: 30, maxMp: 30 }],
    enemies: [{ id: "boss", name: "共鳴獣", speciesId: "slime", hp: 900, maxHp: 900, boss: true }],
    coopBoss: { name: "共鳴獣", title: "連携試練", mechanic: { name: "双撃", dueRound: 3, shortLabel: "攻撃×2" } },
    coopTechnique: { enabled: true, gauge: 4, max: 6, lastLabel: "AEGIS LINK", lastTechnique: { id: "aegis-cross", name: "護刃結界" }, totalUses: 2, techniques: [{ id: "aegis-cross", name: "護刃結界", shortLabel: "攻撃＋防御", effectText: "全員へ障壁" }] },
  };
  const html = renderSharedBattle({ mode: "explore", room, battle, selfId: "p1", enemies: battle.enemies });
  assert.match(html, /online-link-arts charging/);
  assert.match(html, /aria-valuemax="6" aria-valuenow="4"/);
  assert.match(html, /直近 AEGIS LINK → 護刃結界/);
  assert.match(html, /攻撃＋防御/);
  assert.match(html, /online-coop-boss-mechanic active/);

  const legacy = renderSharedBattle({ mode: "explore", room, battle: { ...battle, coopBoss: null, coopTechnique: null, coopBreak: { gauge: 2, max: 6 } }, selfId: "p1", enemies: battle.enemies });
  assert.match(legacy, /online-link-arts charging/);
  assert.match(legacy, /aria-valuemax="6" aria-valuenow="2"/);

  const waiting = renderSharedBattle({ mode: "explore", room, battle: { ...battle, coopBoss: null, coopTechnique: { ...battle.coopTechnique, availablePlayers: 1 } }, selfId: "p1", enemies: battle.enemies });
  assert.match(waiting, /online-link-arts waiting/);
  assert.match(waiting, /仲間の復帰待ち（ゲージは保持）/);
});

test("build228 presents a co-op technique once and lights every participating actor", async () => {
  const client = await read("src/online/OnlinePartyClient.js");
  const presenter = client.slice(client.indexOf("_playBattleEvent(event"), client.indexOf("_sendPreset(text)"));
  assert.match(client, /this\.processedCoopTechniqueEvents = new Set\(\)/);
  assert.match(presenter, /event\?\.kind === "coopBreak"/);
  assert.match(presenter, /String\(event\?\.id \?\? ""\)/);
  assert.match(presenter, /processedCoopTechniqueEvents\.has\(techniqueEventId\)/);
  assert.match(presenter, /Array\.isArray\(event\.actorIds\)/);
  assert.match(presenter, /Array\.isArray\(event\.autoIncluded\)/);
  assert.match(presenter, /fx-link-arts/);
  assert.match(presenter, /online-link-arts-actor-fx/);
  assert.match(presenter, /event\.techniqueId/);
  assert.match(presenter, /link-arts-kicker/);
  assert.match(presenter, /banner\.dataset\.techniqueId/);
  assert.match(client, /featured = \[\.\.\.rows\]\.reverse\(\)\.find\(event => event\?\.kind === "coopBreak"\)/);
  assert.match(client, /recent\.splice\(0, Math\.max\(0, recent\.length - 7\), featured\)/);
});

test("build228 loads its cache boundary and compact motion-safe presentation", async () => {
  const [index, main, client, styles] = await Promise.all([
    read("index.html"), read("src/main.js"), read("src/online/OnlinePartyClient.js"), read("src/Styles/build228.css"),
  ]);
  assert.match(index, /build228\.css\?v=2\.11\.54-build228/);
  assert.match(index, /build230\.css\?v=2\.11\.56-build230/);
  assert.match(index, /ASSET_BUILD = "build239"/);
  assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.65-build239/);
  assert.match(client, /OnlineViews\.js\?v=2\.11\.65-build239/);
  assert.match(styles, /@media\(max-width:390px\)/);
  assert.match(styles, /@media\(max-height:667px\)/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(styles, /\.online-link-arts\.waiting/);
});

console.log("ABYSS DOMINION build228 LINK ARTS regression: PASS");
