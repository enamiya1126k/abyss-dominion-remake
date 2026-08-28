import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("build229 restores Resonance as one modern online route and renderer", async () => {
  const [screen, client, views] = await Promise.all([
    read("src/ui/screens/OnlinePartyScreen.js"),
    read("src/online/OnlinePartyClient.js"),
    read("src/online/OnlineViews.js"),
  ]);

  assert.equal((screen.match(/data-online-route="resonance"/g) ?? []).length, 1);
  assert.match(client, /const ROUTES = new Set\(\[[^\]]*"resonance"[^\]]*\]\)/);
  assert.match(client, /renderOnlineHome, renderOnlineExplore, renderOnlineRaid, renderOnlineTeam, renderOnlineResonance, renderOnlineChat/);
  assert.match(client, /this\.route === "resonance" \? renderOnlineResonance\(this\.roomState, this\.selfId, state\)/);
  assert.match(views, /export function renderOnlineResonance\(room, selfId, state = \{\}\)/);
  assert.match(views, /data-online-resonance-view/);
  assert.match(views, /data-online-resonance-countdown/);
  assert.match(views, /members\.length >= 2 && members\.every\(member => member\.connected && member\.ready\)/);
  assert.match(views, /class="online-resonance-chat/);
  assert.match(views, /data-online-chat-toggle/);
  assert.match(views, /data-online-explore-chat-form/);
  assert.match(views, /chatHistory \?\? \[\]\)\.slice\(-5\)/);
});

test("build229 wires every Resonance control to the canonical protocol command", async () => {
  const [client, views] = await Promise.all([
    read("src/online/OnlinePartyClient.js"),
    read("src/online/OnlineViews.js"),
  ]);

  for (const selector of [
    "data-online-start-resonance",
    "data-online-resonance-move",
    "data-online-resonance-action",
    "data-online-resonance-choice",
    "data-online-resonance-return",
  ]) {
    assert.match(client, new RegExp(`button\\.matches\\(\"\\[${selector}\\]\\"\\)`));
    assert.match(views, new RegExp(selector));
  }

  assert.match(client, /this\._send\("startResonance"\)/);
  assert.match(client, /this\._send\("resonanceMove", \{ direction: button\.dataset\.onlineResonanceMove \}\)/);
  assert.match(client, /this\._send\("resonanceAction", \{ kind: "choose", choice: button\.dataset\.onlineResonanceChoice \}\)/);
  assert.match(client, /this\._send\("resonanceAction", \{ kind: button\.dataset\.onlineResonanceAction \}\)/);
  assert.match(client, /this\._send\("resonanceAction", \{ kind: "return" \}\)/);
  assert.match(views, /data-online-resonance-choice="gold"/);
  assert.match(views, /data-online-resonance-choice="crystal"/);
  assert.match(views, /data-online-resonance-choice="capture"/);
});

test("build229 consumes all three Resonance messages and restores a reconnect snapshot", async () => {
  const client = await read("src/online/OnlinePartyClient.js");

  assert.match(client, /\["resonanceStarted", "resonanceState", "resonanceEnded"\]\.includes\(message\.type\) && message\.resonance/);
  assert.match(client, /this\.roomState = \{ \.\.\.this\.roomState,[^}]*resonance: message\.resonance \}/);
  assert.match(client, /this\.route = "resonance"/);
  assert.match(client, /message\.type === "resonanceEnded"/);
  assert.match(client, /this\._render\(\); return/);
  assert.match(client, /room\.phase === "resonance" \|\| room\.resonance && room\.resonance\.phase !== "result"/);
  assert.match(client, /this\.route === "resonance" && this\.roomState\?\.phase === "resonance"/);
  assert.match(client, /this\._send\("resonanceMove", \{ direction \}\)/);
});

test("build229 keeps Resonance mobile-safe behind one cache and protocol boundary", async () => {
  const [index, main, client, styles, server] = await Promise.all([
    read("index.html"),
    read("src/main.js"),
    read("src/online/OnlinePartyClient.js"),
    read("src/Styles/build229.css"),
    read("online-server/server.js"),
  ]);

  assert.match(index, /Styles\/build239\.css\?v=2\.11\.65-build239/);
  assert.match(index, /ASSET_VERSION = "2\.11\.65"/);
  assert.match(index, /ASSET_BUILD = "build239"/);
  assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.65-build239/);
  assert.match(client, /OnlineViews\.js\?v=2\.11\.65-build239/);
  assert.match(client, /const ONLINE_PROTOCOL = "1\.16\.0"/);
  assert.match(server, /message\.protocol!=="1\.16\.0"/);
  assert.match(server, /protocol:"1\.16\.0"/);

  for (const selector of [
    ".online-resonance-lobby",
    ".online-resonance-game",
    ".online-resonance-board",
    ".online-resonance-controls",
  ]) assert.match(styles, new RegExp(selector.replaceAll(".", "\\.")));
  assert.match(styles, /@media\(max-width:600px\)\{[^]*\.online-resonance-game/);
  assert.match(styles, /@media\(max-height:667px\)\{[^]*\.online-resonance-game/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)\{[^]*\.online-resonance-game \*/);
});

console.log("ABYSS DOMINION build229 Resonance restoration regression: PASS");
