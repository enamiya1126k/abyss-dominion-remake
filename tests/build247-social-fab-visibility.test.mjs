import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { shouldShowOnlineSocialFab } from "../src/online/OnlinePartyClient.js?build247-social-fab-test";
import { renderOnlineSocialPanel } from "../src/ui/screens/OnlinePartyScreen.js?build247-social-fab-test";

test("build247 shows the Social FAB only on room-safe social routes", () => {
  for (const connectionStep of [undefined, "entry", "gate"]) {
    assert.equal(shouldShowOnlineSocialFab({ connectionStep, route: "explore" }), false, String(connectionStep));
  }
  for (const route of ["home", "chat"]) {
    assert.equal(shouldShowOnlineSocialFab({ connectionStep: "room", route }), true, route);
  }
  for (const route of ["explore", "raid", "team", "resonance", "resonanceMaze", "resonance-maze"]) {
    assert.equal(shouldShowOnlineSocialFab({ connectionStep: "room", route }), false, route);
  }
});

test("build247 omits the closed Social surface when the current screen is interactive", () => {
  const visible = renderOnlineSocialPanel({}, {}, { open: false, showFab: true });
  const hidden = renderOnlineSocialPanel({}, {}, { open: false, showFab: false });
  assert.match(visible, /data-online-friends-toggle/);
  assert.equal(hidden, "");
});

test("build247 wires route visibility while preserving the existing chat controls", async () => {
  const [client, screen, views] = await Promise.all([
    readFile(new URL("../src/online/OnlinePartyClient.js", import.meta.url), "utf8"),
    readFile(new URL("../src/ui/screens/OnlinePartyScreen.js", import.meta.url), "utf8"),
    readFile(new URL("../src/online/OnlineViews.js", import.meta.url), "utf8"),
  ]);
  assert.match(client, /const showSocialFab = shouldShowOnlineSocialFab\(\{ connectionStep: this\.connectionStep, route: this\.route \}\)/);
  assert.match(client, /if \(!showSocialFab\) this\.friendPanelOpen = false/);
  assert.match(client, /showFab: showSocialFab/);
  assert.match(screen, /data-online-route="chat"[\s\S]*?<b>掲示板<\/b>/);
  assert.match(views, /data-online-chat-toggle/);
  assert.match(views, /<small>チャット<\/small>/);
});

test("build247 keeps the Social FAB iPhone-safe wherever it is allowed", async () => {
  const [baseCss, socialCss] = await Promise.all([
    readFile(new URL("../src/Styles/build232.css", import.meta.url), "utf8"),
    readFile(new URL("../src/Styles/build233.css", import.meta.url), "utf8"),
  ]);
  assert.match(baseCss, /\.online-friend-fab\{[^}]*right:max\(14px,env\(safe-area-inset-right\)\)[^}]*bottom:max\(86px,calc\(env\(safe-area-inset-bottom\) \+ 76px\)\)[^}]*min-height:46px/);
  assert.match(socialCss, /\.online-social-fab\{[^}]*min-height:48px/);
  assert.match(socialCss, /@media\(max-width:420px\)[\s\S]*?\.online-social-fab\{[^}]*right:max\(10px,env\(safe-area-inset-right\)\)/);
});
