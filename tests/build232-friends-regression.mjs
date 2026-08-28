import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderOnlineFriendPanel } from "../src/ui/screens/OnlinePartyScreen.js?v=2.11.65-build239";

const root = new URL("../", import.meta.url);

test("build232 friend panel escapes profiles and exposes complete controls", () => {
  const html = renderOnlineFriendPanel({
    friends: [{ playerId: "AD-ABCD-BBBB", displayName: "<script>", monsterName: "相棒", fallbackEmoji: "🫧", online: true }],
    incoming: [{ playerId: "AD-ABCD-CCCC", displayName: "申請者", monsterName: "魔物" }],
    invites: [{ inviteId: "invite-token", roomId: "ABC234", from: { playerId: "AD-ABCD-DDDD", displayName: "招待者", monsterName: "魔物" } }],
  }, { open: true, selfId: "AD-ABCD-EEEE" });
  assert.doesNotMatch(html, /<script>/); assert.match(html, /&lt;script&gt;/);
  for (const control of ["data-online-friend-request-form", "data-online-friend-accept", "data-online-friend-decline", "data-online-friend-block", "data-online-friend-invite", "data-online-friend-remove", "data-online-friend-invite-accept", "data-online-friend-invite-decline"]) assert.match(html, new RegExp(control));
});

test("build232 friend feature remains connected through the build237 cache boundary", async () => {
  const [index, main, client, screen, server, css] = await Promise.all(["index.html", "src/main.js", "src/online/OnlinePartyClient.js", "src/ui/screens/OnlinePartyScreen.js", "online-server/server.js", "src/Styles/build232.css"].map(file => readFile(new URL(file, root), "utf8")));
  assert.match(index, /ASSET_BUILD = "build239"/); assert.match(index, /build239\.css\?v=2\.11\.65-build239/);
  assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.65-build239/); assert.match(client, /renderOnlineFriendPanel/); assert.match(screen, /data-online-friend-layer/);
  for (const route of ["friendList", "friendRequest", "friendRespond", "friendRemove", "friendBlock", "friendRoomInvite", "friendInviteRespond"]) assert.match(server, new RegExp(route));
  assert.match(server, /friendsV1:true/); assert.match(css, /@media\(max-width:420px\)/); assert.match(css, /env\(safe-area-inset-bottom\)/);
});
