import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the modern online shell keeps one stage and five destinations", async () => {
  const [screen, client, views, styles, index] = await Promise.all([
    read("src/ui/screens/OnlinePartyScreen.js"),
    read("src/online/OnlinePartyClient.js"),
    read("src/online/OnlineViews.js"),
    read("src/Styles/online-v3.css"),
    read("index.html"),
  ]);

  assert.equal((screen.match(/data-online-stage/g) ?? []).length, 1);
  assert.equal((screen.match(/data-online-route=/g) ?? []).length, 5);
  for (const route of ["home", "explore", "raid", "team", "chat"]) {
    assert.match(screen, new RegExp(`data-online-route="${route}"`));
    assert.match(client, new RegExp(`renderOnline${route[0].toUpperCase()}${route.slice(1)}`));
  }
  assert.match(client, /const ROUTES = new Set\(\["home", "explore", "raid", "team", "chat"\]\)/);
  assert.doesNotMatch(screen, /data-online-room-view|data-online-trade/);
  assert.equal((screen.match(/data-online-route="resonance"/g) ?? []).length, 0);
  assert.match(styles, /\.online-v3-room\s*\{[\s\S]*grid-template-rows:\s*auto minmax\(0, 1fr\) auto/);
  assert.match(styles, /\.online-v3-stage\s*\{[\s\S]*overflow:\s*auto/);
  assert.match(index, /online-v3\.css\?v=2\.10\.0-build163/);
  assert.match(index, /build163\.css\?v=2\.10\.0-build163/);
  assert.match(index, /Styles\/build231\.css\?v=2\.11\.57-build231/);
  assert.match(index, /ASSET_BUILD = "build247"/);
  assert.doesNotMatch(views, /export function renderOnlineResonance/);
});

test("exploration supports tap paths, synchronized vitals, critical/down visuals and one shared battle renderer", async () => {
  const [client, views, styles] = await Promise.all([
    read("src/online/OnlinePartyClient.js"),
    read("src/online/OnlineViews.js"),
    read("src/Styles/online-v3.css"),
  ]);

  assert.match(client, /_setDestination\(/);
  assert.match(client, /previous = new Map/);
  assert.match(client, /this\.path = path\.slice\(0, 48\)/);
  assert.match(views, /data-map-x=/);
  assert.match(views, /hp <= 0 \? "down" : hp \/ maxHp <= \.1 \? "critical"/);
  assert.match(styles, /\.online-v3-map-player\.critical/);
  assert.match(styles, /\.online-v3-map-player\.down/);
  assert.equal((views.match(/function renderSharedBattle/g) ?? []).length, 1);
  for (const mode of ["explore", "raid", "team"]) assert.match(views, new RegExp(`mode: "${mode}"`));
});

test("free team battle supports every requested split with server authority and no rewards", async () => {
  const [views, client, coordinator, store, server] = await Promise.all([
    read("src/online/OnlineViews.js"),
    read("src/online/OnlinePartyClient.js"),
    read("online-server/src/TeamBattleCoordinator.js"),
    read("online-server/src/RoomStore.js"),
    read("online-server/server.js"),
  ]);

  assert.match(views, /1vs1、1vs2、1vs3、2vs2/);
  assert.match(views, /最低2人。両チームに1人以上必要です/);
  assert.match(client, /teamSide/);
  assert.match(client, /teamReady/);
  assert.match(client, /startTeamBattle/);
  assert.match(client, /teamAction/);
  assert.match(client, /teamSpeed/);
  assert.match(coordinator, /participants\.length > 4/);
  assert.match(coordinator, /sun\.length/);
  assert.match(coordinator, /moon\.length/);
  assert.match(coordinator, /session\?\.connected/);
  assert.match(coordinator, /effectiveEvasion/);
  assert.doesNotMatch(coordinator, /queueReward|onlineReward/);
  assert.match(store, /teamBattle:teamBattleSnapshot/);
  assert.match(server, /protocol:"1\.16\.0"/);
  for (const command of ["startResonance", "resonanceMove", "resonanceAction", "tradeInvite", "tradeOffer", "tradeConfirm"]) {
    assert.match(server, new RegExp(`message\\.type==="${command}"`));
  }
  assert.doesNotMatch(server, /message\.type==="tradeRequest"/);
});

test("chat is sanitized, rate-limited, retained to fifty messages and reconnect state is restored", async () => {
  const [client, store, views] = await Promise.all([
    read("src/online/OnlinePartyClient.js"),
    read("online-server/src/RoomStore.js"),
    read("src/online/OnlineViews.js"),
  ]);

  assert.match(client, /maxlength="80"|slice\(0, 80\)/);
  assert.match(client, /Date\.now\(\) - this\.lastChatAt < 850/);
  assert.match(client, /this\.chatDraft = event\.target\.value\.slice\(0, 80\)/);
  assert.match(client, /event\.target\.form\?\.requestSubmit\(\)/);
  assert.match(client, /ONLINE_STORAGE_KEYS\.autoConnect/);
  assert.match(store, /room\.chatHistory=room\.chatHistory\.slice\(-50\)/);
  assert.match(store, /reconnectGraceMs=300_000/);
  assert.match(store, /resumed:Boolean\(resumed&&room\)/);
  assert.match(views, /escapeOnlineHtml\(message\.text\)/);
  assert.match(views, /data-online-chat-log role="log"/);
});

test("screen refresh restores the exact current main screen instead of forcing online", async () => {
  const main = await read("src/main.js");
  assert.match(main, /SCREEN_SESSION_KEY="abyss-dominion:current-screen"/);
  assert.match(main, /const refreshScreen=screen==="shop"&&onlineSecretRoomContext\?"onlineParty":screen/);
  assert.match(main, /sessionStorage\.setItem\(SCREEN_SESSION_KEY,refreshScreen\)/);
  assert.match(main, /else if\(restored&&REFRESHABLE_SCREENS\.has\(restored\)\)screen=restored/);
  assert.match(main, /if\(inviteKey&&inviteKey!==lastInvite\)\{screen="onlineParty"/);
});
