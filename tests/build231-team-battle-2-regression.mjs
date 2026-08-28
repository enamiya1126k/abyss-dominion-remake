import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderOnlineTeam } from "../src/online/OnlineViews.js?v=2.11.65-build239";

const root = new URL("../", import.meta.url);
const profile = (name, power) => ({ displayName: name, monsterName: `${name}の魔物`, speciesId: "slime", fallbackEmoji: "魔", level: 80, power, circleId: "none", skills: [] });

function lobby() {
  return {
    roomId: "T2VIEW", ownerId: "p1", leaderId: "p1", phase: "lobby",
    teamSettings: { ruleset: "balanced", series: "bo3" },
    members: [
      { playerId: "p1", leader: true, connected: true, teamSide: "sun", teamReady: true, profile: profile("紅", 12_000) },
      { playerId: "p2", connected: true, teamSide: "moon", teamReady: true, profile: profile("蒼", 8_000) },
    ],
  };
}

test("build231 lobby exposes three rules, series selection, balance and saved record", () => {
  const html = renderOnlineTeam(lobby(), "p1", { gameState: { onlineParty: { teamBattleRecords: { matches: 7, wins: 4, losses: 2, draws: 1, bestStreak: 3 } } } });
  for (const rule of ["standard", "balanced", "blitz"]) assert.match(html, new RegExp(`data-online-team-ruleset="${rule}"`));
  assert.match(html, /data-online-team-series="bo1"/);
  assert.match(html, /data-online-team-series="bo3" class="selected"/);
  assert.match(html, /戦力・人数補正 ON/);
  assert.match(html, /4勝 2敗 1分/);
  assert.match(html, /data-online-team-swap/);
});

test("build231 active series shows live score and final report shows MVP metrics", () => {
  const room = { ...lobby(), phase: "team", teamBattle: { format: "1 vs 1", ruleset: "blitz", series: "bo3", game: 2, score: { sun: 1, moon: 0 }, phase: "command", speed: 1, deadlineAt: Date.now() + 9000, actions: {}, players: [
    { playerId: "p1", side: "sun", name: "紅", monsterName: "紅の魔物", hp: 100, maxHp: 100, mp: 20, maxMp: 20 },
    { playerId: "p2", side: "moon", name: "蒼", monsterName: "蒼の魔物", hp: 100, maxHp: 100, mp: 20, maxMp: 20 },
  ] } };
  const battleHtml = renderOnlineTeam(room, "p1");
  assert.match(battleHtml, /BLITZ・2本先取/);
  assert.match(battleHtml, /紅 1/);
  assert.match(battleHtml, /GAME 2/);

  const summary = { winner: "sun", score: { sun: 2, moon: 1 }, mvpPlayerId: "p1", ranking: [
    { rank: 1, playerId: "p1", side: "sun", name: "紅", monsterName: "紅の魔物", damage: 1200, healing: 200, kos: 2, score: 3340 },
    { rank: 2, playerId: "p2", side: "moon", name: "蒼", monsterName: "蒼の魔物", damage: 900, healing: 0, kos: 1, score: 1900 },
  ] };
  const reportHtml = renderOnlineTeam(lobby(), "p1", { teamBattleReport: { resultId: "team:t1", summary } });
  assert.match(reportHtml, /TEAM BATTLE RESULT/);
  assert.match(reportHtml, /紅組 勝利/);
  assert.match(reportHtml, /MVP/);
  assert.match(reportHtml, /与 1,200・回 200・KO 2/);
  assert.match(reportHtml, /data-online-close-team-report/);
});

test("build231 connects protocol messages, idempotent record persistence and mobile CSS", async () => {
  const [client, main, server, index, css] = await Promise.all([
    readFile(new URL("src/online/OnlinePartyClient.js", root), "utf8"), readFile(new URL("src/main.js", root), "utf8"),
    readFile(new URL("online-server/server.js", root), "utf8"), readFile(new URL("index.html", root), "utf8"), readFile(new URL("src/Styles/build231.css", root), "utf8"),
  ]);
  assert.match(client, /this\._send\("teamSettings"/);
  assert.match(client, /this\._send\("teamSwapSides"/);
  assert.match(client, /onTeamBattleResult\(this\.teamBattleReport\)/);
  assert.match(main, /processedTeamBattleResultIds\.includes\(resultId\)/);
  assert.match(main, /onTeamBattleResult:persistOnlineTeamBattleResult/);
  assert.match(server, /message\.type==="teamSettings"/);
  assert.match(server, /message\.type==="teamSwapSides"/);
  assert.match(index, /build231\.css\?v=2\.11\.57-build231/);
  assert.match(index, /ASSET_BUILD = "build239"/);
  assert.match(css, /@media\(max-width:520px\)/);
});
