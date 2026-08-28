import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("build244 keeps the standalone Resonance destination removed and shared exploration intact", async () => {
  const [screen, client, views] = await Promise.all([
    read("src/ui/screens/OnlinePartyScreen.js"),
    read("src/online/OnlinePartyClient.js"),
    read("src/online/OnlineViews.js"),
  ]);

  assert.match(screen, /id: "explore", label: "共同探索"/);
  assert.equal((screen.match(/data-online-route="explore"/g) ?? []).length, 1);
  assert.doesNotMatch(screen, /data-online-route="resonance"|id: "resonance", label: "共鳴迷宮"/);
  assert.match(client, /const ROUTES = new Set\(\["home", "explore", "raid", "team", "chat"\]\)/);
  assert.match(client, /renderOnlineHome, renderOnlineExplore, renderOnlineRaid, renderOnlineTeam, renderOnlineChat/);
  assert.doesNotMatch(client, /renderOnlineResonance|_send\("(?:startResonance|resonanceMove|resonanceAction)"/);
  assert.doesNotMatch(views, /export function renderOnlineResonance|data-online-resonance-view|data-online-start-resonance/);
  assert.match(views, /SHARED HOST EXPEDITION/);
  assert.match(views, />共同探索へ出発</);
});

test("build244 maps legacy Resonance state to shared exploration without restoring the maze", async () => {
  const client = await read("src/online/OnlinePartyClient.js");

  assert.match(client, /if \(purpose === "resonance"\) return "explore"/);
  assert.match(client, /storedRoute === "resonance" \? "explore"/);
  assert.match(client, /if \(room\.phase === "resonance"\) \{/);
  assert.match(client, /room = \{ \.\.\.room, phase: "lobby", resonance: null \}/);
  assert.match(client, /\["resonanceStarted", "resonanceState", "resonanceEnded"\]\.includes\(message\.type\)/);
  assert.match(client, /共鳴迷宮は共同探索へ統合されました/);
  assert.match(client, /errorCode === "RESONANCE_INTEGRATED"/);
  assert.doesNotMatch(client, /this\.route = "resonance"|this\.route === "resonance"/);
});

test("build244 keeps normal-map cooperative state but presents only optional map gimmicks", async () => {
  const [client, views] = await Promise.all([
    read("src/online/OnlinePartyClient.js"),
    read("src/online/OnlineViews.js"),
  ]);

  assert.match(client, /expedition\.coop\?\.resonance/);
  assert.match(views, /COOP_GIMMICK_GUIDES/);
  assert.match(views, /任意・無視して出口へ進行可/);
  assert.match(views, /waitResonanceChest/);
  assert.doesNotMatch(client, /data-online-resonance-(?:move|choice|action|return)/);
  assert.doesNotMatch(views, /data-online-resonance-(?:move|choice|action|return)/);
});

console.log("ABYSS DOMINION build244 expedition integration regression: PASS");
