import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { renderHallGamesOverlay, renderOnlineHome } from "../src/online/OnlineViews.js?build252-hall-minigames";

const members = [
  { playerId: "a", connected: true, position: { x: 50, y: 25 }, profile: { displayName: "蒼", monsterName: "ぷるん", speciesId: "slime", battleRoster: [{ monsterId: "a1", monsterName: "ぷるん", speciesId: "slime", level: 8 }] } },
  { playerId: "b", connected: true, position: { x: 58, y: 35 }, profile: { displayName: "紅", monsterName: "わん", speciesId: "wolf", battleRoster: [{ monsterId: "b1", monsterName: "わん", speciesId: "wolf", level: 12 }] } },
];

const room = { roomId: "PLAY25", phase: "lobby", leaderId: "a", members };

test("build252 adds one walk-up Games facility without adding a bottom route", async () => {
  const html = renderOnlineHome(room, "a", { hallGamesSupported: true });
  assert.match(html, /data-online-hall-destination="games"/);
  assert.match(html, /assets\/monsters\/034_mimic\/idle1\.png/);
  assert.match(html, /data-online-hall-games-toggle>遊びに行く/);

  const [views, client] = await Promise.all([
    readFile(new URL("../src/online/OnlineViews.js", import.meta.url), "utf8"),
    readFile(new URL("../src/online/OnlinePartyClient.js", import.meta.url), "utf8"),
  ]);
  assert.match(views, /route: "games", x: 50, y: 25/);
  assert.match(client, /route: "games", x: 50, y: 25/);
  assert.doesNotMatch(client, /const ROUTES = new Set\([^\n]*"games"/);
});

test("build252 Games overlay degrades safely on an old server", () => {
  const html = renderHallGamesOverlay(room, "a", { hallGamesOpen: true, hallGamesSupported: false });
  assert.match(html, /オンラインサーバーの更新が必要です/);
  assert.match(html, /data-online-hall-game-close/);
  assert.doesNotMatch(html, /data-online-hall-game-start/);
});

test("build252 opens a two-card menu and keeps quick chat inside the game overlay", () => {
  const menu = renderHallGamesOverlay(room, "a", { hallGamesOpen: true, hallGamesSupported: true, hallGameTab: "" });
  assert.match(menu, /爆弾ミミック回し/);
  assert.match(menu, /魔物レース/);
  assert.match(menu, /data-online-hall-game-tab="mimic"/);
  assert.match(menu, /data-online-hall-game-tab="race"/);

  const chat = renderHallGamesOverlay(room, "a", { hallGamesOpen: true, hallGamesSupported: true, hallGameTab: "mimic", exploreChatOpen: true, chatDraft: "いけー" });
  assert.match(chat, /hall-games-chat-bar/);
  assert.match(chat, /data-online-explore-chat-input/);
  assert.match(chat, /value="いけー"/);
  assert.doesNotMatch(chat, /online-hall-quick-chat-log/);
  assert.match(chat, /class="online-hall-game-emote-tool" data-online-emote-anchor/);
});

test("build252 renders the authoritative Bomb Mimic state and only enables the holder", () => {
  const hallGame = {
    id: "bomb1", game: "mimic", phase: "running", organizerId: "a", round: 2, totalRounds: 5,
    holderId: "a", danger: 58, participants: [
      { playerId: "a", connected: true, passes: 3, blasts: 0 },
      { playerId: "b", connected: true, passes: 2, blasts: 1 },
    ],
  };
  const html = renderHallGamesOverlay({ ...room, hallGame }, "a", { hallGamesOpen: true, hallGamesSupported: true });
  assert.match(html, /ROUND 2 \/ 5/);
  assert.match(html, /DANGER 58%/);
  assert.match(html, /PASS 5/);
  assert.match(html, /data-online-hall-game-action="pass" data-online-hall-game-target="b"/);

  const spectator = renderHallGamesOverlay({ ...room, hallGame }, "b", { hallGamesOpen: true, hallGamesSupported: true });
  assert.match(spectator, /data-online-hall-game-target="a" disabled/);

  const result = renderHallGamesOverlay({ ...room, hallGame: { ...hallGame, phase: "result", result: { ranking: [{ playerId: "a", blasts: 0 }, { playerId: "b", blasts: 1 }] }, wins: { a: { mimic: 2 }, b: { mimic: 0 } } } }, "a", { hallGamesOpen: true, hallGamesSupported: true });
  assert.match(result, /被爆 0・通算 2勝/);
});

test("build252 renders synchronized race lanes, reconnect timing and one cheer", () => {
  const hallGame = {
    id: "race1", game: "race", phase: "running", organizerId: "a", startedAt: 10_000, serverNow: 12_000, durationMs: 9_000,
    cheeredIds: ["a"], participants: [{ playerId: "a" }, { playerId: "b" }], racers: [
      { lane: 0, playerId: "a", monster: { monsterId: "a1", name: "ぷるん", speciesId: "slime", level: 8 }, progress: 22, durationMs: 8_000 },
      { lane: 1, playerId: "b", monster: { monsterId: "b1", name: "わん", speciesId: "wolf", level: 12 }, progress: 18, durationMs: 9_000 },
    ],
  };
  const html = renderHallGamesOverlay({ ...room, hallGame }, "a", { hallGamesOpen: true, hallGamesSupported: true });
  assert.match(html, /LANE 1/);
  assert.match(html, /LANE 4/);
  assert.match(html, /空きレーン/);
  assert.match(html, /--race-duration:8000ms;--race-delay:-2000ms/);
  assert.match(html, /応援済み/);
});

test("build252 wires server capability, guarded messages, cache busting and mobile CSS", async () => {
  const [index, client, server, store, css] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/online/OnlinePartyClient.js", import.meta.url), "utf8"),
    readFile(new URL("../online-server/server.js", import.meta.url), "utf8"),
    readFile(new URL("../online-server/src/RoomStore.js", import.meta.url), "utf8"),
    readFile(new URL("../src/Styles/build252.css", import.meta.url), "utf8"),
  ]);
  assert.match(index, /build252\.css\?v=2\.11\.76-build252/);
  assert.match(index, /ASSET_VERSION = "2\.11\.78"/);
  assert.match(index, /ASSET_BUILD = "build254"/);
  assert.match(client, /capabilities\.has\("hallMinigamesV1"\)/);
  const hallCloseCheck = client.indexOf('const closing = button.matches("[data-online-hall-game-close]")');
  const hallCapabilityCheck = client.indexOf('if (!closing && !this.capabilities.has("hallMinigamesV1"))');
  assert.ok(hallCloseCheck >= 0 && hallCapabilityCheck > hallCloseCheck, "the unsupported overlay must always remain closable after reconnecting to an old server");
  assert.match(client, /restoreHallChatFocus/);
  assert.match(client, /input\.focus\(\{ preventScroll: true \}\)/);
  assert.match(client, /isHallGame \|\| anchor\.matches\?\.\("\.online-hall-emote-tool"\)/);
  for (const type of ["hallGameJoin", "hallGameReady", "hallGameStart", "hallGameAction", "hallGameLeave", "hallGameReset"]) {
    assert.ok(client.includes(`"${type}"`), `client sends ${type}`);
    assert.ok(server.includes(`message.type==="${type}"`), `server handles ${type}`);
  }
  assert.match(server, /hallMinigamesV1:true/);
  assert.match(store, /hallGame:this\.hallMinigames\.snapshot\(room\)/);
  assert.match(store, /hallTick\?\.changed/);
  assert.doesNotMatch(css, /overflow-x:auto/);
  assert.match(css, /@media\(max-width:430px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /hall-game-race-run/);
});
