import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("build229 keeps private creation and direct invitation while adding the room board", async () => {
  const screen = await read("src/ui/screens/OnlinePartyScreen.js");
  assert.match(screen, /ADVENTURER NOTICE BOARD/);
  assert.match(screen, /data-online-room-board-content/);
  assert.match(screen, /data-online-create-listed/);
  assert.match(screen, /初期設定は非公開です/);
  assert.doesNotMatch(screen, /data-online-create-listed[^>]*checked/);
  assert.match(screen, /data-online-create-room/);
  assert.match(screen, /data-online-join-form/);
  assert.match(screen, /data-online-room-code/);
  assert.match(screen, /partyRoom/);
  assert.match(screen, /maxlength="512"[^>]*data-online-room-code/);
  for (const value of ["explore", "raid", "team", "social", "anyone", "casual", "help", "fast"]) assert.match(screen, new RegExp(`id: "${value}"`));
  assert.doesNotMatch(screen, /id: "resonance", label: "共鳴迷宮"/);
});

test("build229 renders escaped compact listings with accessible one-tap actions", async () => {
  const { renderOnlineRoomDirectory } = await import("../src/ui/screens/OnlinePartyScreen.js?v=2.11.56-build230-test");
  const html = renderOnlineRoomDirectory([{
    roomId: "AB12CD", listingId: `listing\" onfocus=\"alert(1)`, purpose: "raid", style: "casual", floor: 100, count: 2, max: 4,
    host: { displayName: `<img src=x onerror=alert(1)>`, monsterName: `<script>alert(1)</script>` },
  }], { status: "ready", purpose: "raid" });
  assert.match(html, /data-online-room-purpose-filter/);
  assert.match(html, /data-online-quick-join/);
  assert.match(html, /data-online-refresh-listings/);
  assert.match(html, /data-online-join-listed-room="AB12CD"/);
  assert.match(html, /data-online-listing-id="listing&amp;quot; onfocus=&amp;quot;alert\(1\)"|data-online-listing-id="listing&quot; onfocus=&quot;alert\(1\)"/);
  assert.match(html, /aria-label="[^"]+に参加"/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(html, /role="list" aria-busy="false"/);
  assert.match(html, /&lt;img src=x onerr/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<img src=x|<script>alert/);
});

test("build229 uses the server-authoritative listing protocol and preserves focus", async () => {
  const client = await read("src/online/OnlinePartyClient.js");
  assert.match(client, /const ONLINE_PROTOCOL = "1\.16\.0"/);
  assert.match(client, /this\.capabilities = new Set\(\)/);
  assert.match(client, /roomListingsV1/);
  for (const command of ["listRoomListings", "setRoomListing", "joinListedRoom", "quickJoin", "removeRoomMember"]) assert.match(client, new RegExp(`_send\\("${command}"`));
  assert.match(client, /message\.type === "roomListings"/);
  assert.match(client, /if \(this\.roomState \|\| this\.connectionStep === "room"\) return/);
  assert.match(client, /generatedAt && generatedAt < this\.roomListingsGeneratedAt/);
  assert.match(client, /partyRoom=\(\[\^&#\]\+\)/);
  assert.match(client, /signature === this\.roomBoardRenderSignature/);
  assert.match(client, /focus\?\.roomId|focus\.roomId/);
  assert.match(client, /this\.pendingRoomJoinId \|\| this\.roomState/);
  assert.match(client, /const hadPendingRoomJoin = Boolean\(this\.pendingRoomJoinId\)/);
  assert.match(client, /createRoom", \{ published, purpose, style \}/);
});

test("build229 makes the in-room board recruitment-aware and leader controlled", async () => {
  const { renderOnlineChat } = await import("../src/online/OnlineViews.js?v=2.11.56-build230-test");
  const room = {
    roomId: "AB12CD", leaderId: "host", phase: "lobby", listing: { published: true, purpose: "team", style: "help" }, chatHistory: [],
    members: [
      { playerId: "host", leader: true, profile: { displayName: "部屋主", monsterName: "ドラゴン" } },
      { playerId: "guest", profile: { displayName: `<b>客</b>`, monsterName: `<i>スライム</i>` } },
    ],
  };
  const leader = renderOnlineChat(room, "host", { chatDraft: "", roomListingPending: false, roomMemberRemovalPendingId: null });
  for (const selector of ["data-online-room-listing-toggle", "data-online-room-listing-purpose", "data-online-room-listing-style", "data-online-remove-room-member=\"guest\""]) assert.match(leader, new RegExp(selector));
  assert.match(leader, /ROOM RECRUITMENT/);
  assert.doesNotMatch(leader, /<b>客<\/b>|<i>スライム<\/i>/);
  const guest = renderOnlineChat(room, "guest", { chatDraft: "" });
  assert.match(guest, /募集設定を変更できるのは部屋主だけです/);
  assert.doesNotMatch(guest, /data-online-remove-room-member/);
});

test("build229 constrains the board to small screens and keeps controls operable", async () => {
  const styles = await read("src/Styles/build229.css");
  assert.match(styles, /grid-template-rows:auto minmax\(150px,1fr\) auto auto/);
  assert.match(styles, /\.online-room-board-list\{[^}]*overflow:auto/);
  assert.match(styles, /overscroll-behavior:contain/);
  assert.match(styles, /\.online-room-listing-card>button\{[^}]*min-height:44px/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /@media\(max-width:390px\)/);
  assert.match(styles, /@media\(max-height:667px\)/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
});

test("build229 loads one coherent client cache boundary", async () => {
  const [index, main, client, views] = await Promise.all([
    read("index.html"), read("src/main.js"), read("src/online/OnlinePartyClient.js"), read("src/online/OnlineViews.js"),
  ]);
  assert.match(index, /build239\.css\?v=2\.11\.65-build239/);
  assert.match(index, /ASSET_VERSION = "2\.11\.69"/);
  assert.match(index, /ASSET_BUILD = "build245"/);
  assert.match(main, /OnlinePartyScreen\.js\?v=2\.11\.69-build245/);
  assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.69-build245/);
  assert.match(client, /OnlineViews\.js\?v=2\.11\.69-build245/);
  assert.match(client, /OnlinePartyScreen\.js\?v=2\.11\.69-build245/);
  assert.match(views, /OnlinePartyScreen\.js\?v=2\.11\.69-build245/);
});

console.log("ABYSS DOMINION build229 room board regression: PASS");
