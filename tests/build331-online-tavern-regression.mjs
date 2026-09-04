import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { renderAdventureTavern, renderOnlineChat, renderOnlineHome } from "../src/online/OnlineViews.js?build331-online-tavern";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const read = path => fs.readFileSync(join(root, path), "utf8");

const room = {
  roomId: "AB12CD",
  ownerId: "self",
  leaderId: "self",
  phase: "lobby",
  listing: { published: false, purpose: "social", style: "anyone" },
  chatHistory: [],
  members: [{
    playerId: "self", connected: true, leader: true, ready: false,
    position: { x: 50, y: 25 },
    profile: { displayName: "えなみ", monsterName: "リオネル", speciesId: "slime", level: 18, battleRoster: [] },
  }],
};

const tavernState = {
  tavernOpen: true,
  roomListings: [],
  roomListingsStatus: "ready",
  roomListingPurposeFilter: "all",
  roomListingPending: false,
  mutedPlayerIds: [],
  blockedPlayerIds: [],
  safetyCapability: true,
};

test("Build331 version and save compatibility remain explicit", () => {
  const config = read("src/core/config.js");
  const index = read("index.html");
  assert.match(config, /SAVE_SCHEMA_VERSION=84/);
  assert.match(config, /APP_VERSION="3\.1\.12"/);
  assert.match(index, /build331-online-tavern\.css\?v=3\.1\.12-build331/);
});

test("online entry is automatic and contains no editable server setup", () => {
  const screen = read("src/ui/screens/OnlinePartyScreen.js");
  assert.match(screen, /冒険者集会所へ接続中/);
  assert.match(screen, /回線の確認から前回の部屋への復帰まで、自動で行います/);
  assert.match(screen, /type="hidden" data-online-server-url/);
  assert.doesNotMatch(screen, /サーバーURL（固定）/);
  assert.doesNotMatch(screen, />サーバーへ接続</);
  assert.doesNotMatch(screen, /data-online-disconnect/);
  assert.match(screen, /data-online-profile-panel/);
  assert.match(screen, /旅人手帳/);
});

test("leaving the Online screen preserves the authenticated room session", () => {
  const client = read("src/online/OnlinePartyClient.js");
  assert.match(client, /_ensurePersonalHub\(\)/);
  assert.match(client, /createRoom", \{ published: false, purpose: "social", style: "anyone", autoHub: true \}/);
  assert.match(client, /requestExit\(onComplete = null\) \{\s*const complete[\s\S]*?complete\(\);\s*return true;/);
  const requestExitBody = client.match(/requestExit\(onComplete = null\) \{([\s\S]*?)\n  \}\n\n  leaveRoom/);
  assert.ok(requestExitBody);
  assert.doesNotMatch(requestExitBody[1], /leaveRoom|disconnect/);
  assert.match(client, /unmount\(\{ disconnect = true, backgroundTransition = true \}/);
  assert.match(client, /_requestConnectionMode\(true\)/);
  assert.match(client, /if \(message\.room\) this\._applyRoomState\(message\.room\)/);
});

test("adventurer tavern owns recruitment, joining, and invitations", () => {
  const html = renderAdventureTavern(room, "self", tavernState);
  assert.match(html, /冒険者酒場/);
  assert.match(html, /この部屋の募集/);
  assert.match(html, /仲間を探す/);
  assert.match(html, /合言葉で合流/);
  assert.match(html, /data-online-room-listing-toggle/);
  assert.match(html, /data-online-room-board-content/);
  assert.match(html, /data-online-join-form/);
  assert.match(html, /通常ゲームの進行とは分離/);
});

test("gathering hall replaces the old minigame facility with the tavern", () => {
  const html = renderOnlineHome(room, "self", tavernState);
  assert.match(html, /data-online-hall-destination="tavern"/);
  assert.match(html, /adventurer-tavern\.png/);
  assert.match(html, /online-tavern-overlay/);
  assert.doesNotMatch(html, /遊戯広場/);
  assert.doesNotMatch(html, /data-online-hall-game/);
});

test("talk board no longer duplicates public recruitment controls", () => {
  const html = renderOnlineChat(room, "self", tavernState);
  assert.match(html, /PARTY TALK/);
  assert.match(html, /募集と部屋移動は冒険者酒場にまとまりました/);
  assert.doesNotMatch(html, /ROOM RECRUITMENT/);
  assert.doesNotMatch(html, /data-online-room-listing-toggle/);
});

test("server advertises Tavern and no longer accepts hall minigame commands", () => {
  const server = read("online-server/server.js");
  assert.match(server, /adventurerTavernV1:true/);
  assert.doesNotMatch(server, /hallMinigamesV1:true/);
  for (const type of ["hallGameJoin", "hallGameReady", "hallGameStart", "hallGameAction", "hallGameLeave", "hallGameReset"]) {
    assert.doesNotMatch(server, new RegExp(`message\\.type===\\"${type}\\"`));
  }
});

test("new tavern art is a substantial transparent PNG asset", () => {
  const path = join(root, "assets/online/hall/build331/adventurer-tavern.png");
  const image = fs.readFileSync(path);
  assert.ok(image.length > 200_000);
  assert.equal(image.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(image.readUInt32BE(16), 512);
  assert.equal(image.readUInt32BE(20), 468);
  assert.equal(image[25], 6, "PNG must use RGBA color type");
});

