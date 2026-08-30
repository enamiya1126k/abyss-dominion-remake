import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { renderOnlineHome } from "../src/online/OnlineViews.js?build248-hall-social-ux";

const room = {
  roomId: "HALL48",
  members: [
    { playerId: "self", connected: true, position: { x: 50, y: 76 }, profile: { displayName: "自分", speciesId: "slime" } },
    { playerId: "friend", connected: true, position: { x: 54, y: 74 }, profile: { displayName: "仲間", speciesId: "slime" } },
  ],
  chatHistory: [
    { id: "1", playerId: "friend", name: "仲間", text: "古い発言", createdAt: 1 },
    { id: "2", playerId: "muted", name: "非表示", text: "見えない発言", createdAt: 2 },
    { id: "3", playerId: "self", name: "自分", text: "準備OK", createdAt: 3 },
    { id: "4", playerId: "friend", name: "仲間", text: "出発しよう", createdAt: 4 },
    { id: "5", playerId: "friend", name: "仲間", text: "よろしく", createdAt: 5 },
  ],
};

test("build248 opens a three-message quick chat without leaving the hall", () => {
  const closed = renderOnlineHome(room, "self", { exploreChatOpen: false });
  assert.doesNotMatch(closed, /data-online-hall-quick-chat/);

  const open = renderOnlineHome(room, "self", { exploreChatOpen: true, chatDraft: "入力中", mutedPlayerIds: ["muted"] });
  assert.match(open, /online-hall-world chat-open/);
  assert.match(open, /data-online-hall-quick-chat/);
  assert.match(open, /data-online-explore-chat-form/);
  assert.match(open, /data-online-explore-chat-input[^>]*value="入力中"/);
  assert.match(open, /data-online-hall-full-chat/);
  assert.match(open, /準備OK/);
  assert.match(open, /出発しよう/);
  assert.match(open, /よろしく/);
  assert.doesNotMatch(open, /古い発言/);
  assert.doesNotMatch(open, /見えない発言/);
  assert.equal((open.match(/<article class=/g) ?? []).length, 3);
});

test("build248 fixes the hall emote launcher and keeps its radial center stable", async () => {
  const [client, css] = await Promise.all([
    readFile(new URL("../src/online/OnlinePartyClient.js", import.meta.url), "utf8"),
    readFile(new URL("../src/Styles/build248.css", import.meta.url), "utf8"),
  ]);
  assert.match(css, /\.online-hall-emote-tool\{[^}]*left:50%!important;[^}]*top:\d+px!important;[^}]*transform:translateX\(-50%\)!important;[^}]*touch-action:none!important;/s);
  assert.match(client, /if \(anchor\.matches\("\.online-hall-emote-tool"\)\) \{[\s\S]*?anchor\.style\.removeProperty/);
  assert.doesNotMatch(client, /ONLINE_HALL_EMOTE_POSITION/);
  assert.match(client, /const anchorCenter = \{ x: anchorRect\.left \+ anchorRect\.width \/ 2, y: anchorRect\.top \+ anchorRect\.height \/ 2 \}/);
  assert.match(client, /const wheelOrigin = isHallGame[\s\S]*?: isHall[\s\S]*?\? anchorCenter/);
});

test("build248 captures hall emote gestures and only sends a selected option", async () => {
  const client = await readFile(new URL("../src/online/OnlinePartyClient.js", import.meta.url), "utf8");
  assert.match(client, /anchor\.setPointerCapture\?\.\(pointerId\)/);
  assert.match(client, /window\.addEventListener\("touchmove", blockTouch, \{ capture: true, passive: false \}\)/);
  assert.match(client, /selected = next; paintSelection\(\)/);
  assert.match(client, /if \(selected != null\) \{ const \[id\] = choices\[selected\]; this\._send\("social", \{ kind: "emote", id \}\); \}/);
  assert.match(client, /this\.emoteGestureActive = true/);
  assert.match(client, /this\.emoteGestureActive = false/);
});

test("build248 pauses hall movement for quick chat and emote interaction", async () => {
  const [client, css] = await Promise.all([
    readFile(new URL("../src/online/OnlinePartyClient.js", import.meta.url), "utf8"),
    readFile(new URL("../src/Styles/build248.css", import.meta.url), "utf8"),
  ]);
  assert.match(client, /if \(this\.exploreChatOpen \|\| this\.hallGamesOpen \|\| this\.emoteGestureActive\) \{ this\.hallDestination = null; return; \}/);
  assert.match(client, /data-online-hall-full-chat/);
  assert.match(client, /this\.exploreChatOpen = false; this\._setRoute\("chat"\)/);
  assert.match(client, /\.online-hall-party-strip,\.online-hall-quick-chat/);
  assert.match(css, /\.online-hall-world\.chat-open\{[^}]*touch-action:pan-y;/s);
  assert.match(css, /\.online-hall-world\.chat-open :is\(\.online-hall-zone,\.online-hall-player\.tradeable,\.online-hall-emote-tool\)\{[^}]*pointer-events:none!important;/s);
  assert.match(css, /\.online-hall-quick-chat\{[^}]*touch-action:pan-y;/s);
});
