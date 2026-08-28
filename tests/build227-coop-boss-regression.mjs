import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("build227 confirms a co-op boss before sending the challenge", async () => {
  const [client, views] = await Promise.all([read("src/online/OnlinePartyClient.js"), read("src/online/OnlineViews.js")]);
  assert.match(client, /this\.coopBossConfirm = null/);
  assert.match(client, /\["challengeCoopElite", "challengeCoopBoss"\]\.includes\(action\)/);
  assert.match(client, /data-online-confirm-coop-boss/);
  assert.match(client, /_send\("expeditionInteract", \{ action, targetId: pending\.targetId \}\)/);
  assert.match(views, /online-coop-boss-confirm/);
  assert.match(views, /仲間と挑む/);
  assert.match(views, /coopBoss\.mechanic\?\.shortLabel/);
});

test("build227 exposes boss identity, its mechanic and capture lock in shared battle", async () => {
  const [views, battleScreen] = await Promise.all([read("src/online/OnlineViews.js"), read("src/ui/screens/BattleScreen.js")]);
  assert.match(views, /function renderCoopBossMechanic\(battle\)/);
  assert.match(views, /online-coop-boss-mechanic/);
  assert.match(views, /coopBoss\?\.name \? `\$\{number\(expedition\.floor\)\}F・共闘ボス/);
  assert.match(views, /allowCapture: !coopBoss && !bossNames\.length/);
  assert.match(views, /boss: Boolean\(enemy\.boss \|\| enemy\.coopBoss/);
  assert.match(battleScreen, /target\.boss\|\|target\.floorBossCatalogId/);
});

test("build227 uses existing monster art and loads a mobile-safe stylesheet", async () => {
  const [main, styles, index] = await Promise.all([read("src/main.js"), read("src/Styles/build227.css"), read("index.html")]);
  assert.match(main, /object\.visualSpeciesId\|\|object\.speciesId\|\|"dark_knight"/);
  assert.match(main, /object\.bossName\|\|"共闘ボス"/);
  assert.match(styles, /@media\(max-width:600px\)/);
  assert.match(styles, /@media\(max-height:700px\)/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(index, /build227\.css\?v=2\.11\.54-build227/);
  assert.match(index, /ASSET_BUILD = "build239"/);
  assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.65-build239/);
  assert.match(main, /BattleScreen\.js\?v=2\.11\.54-build227/);
  const client = await read("src/online/OnlinePartyClient.js");
  assert.match(client, /const ONLINE_PROTOCOL = "1\.16\.0"/);
});

console.log("ABYSS DOMINION build227 co-op boss regression: PASS");
