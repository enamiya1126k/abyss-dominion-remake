import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { renderOnlineHome } from "../src/online/OnlineViews.js?build250-hall-trade";
import { onlineSocialNotificationSummary, renderOnlineSocialPanel } from "../src/ui/screens/OnlinePartyScreen.js?build250-hall-trade";

const room = {
  roomId: "HALL50",
  members: [
    { playerId: "self", connected: true, position: { x: 50, y: 49 }, profile: { displayName: "自分", speciesId: "slime" } },
    { playerId: "friend", connected: true, position: { x: 56, y: 56 }, profile: { displayName: "仲間", speciesId: "slime" } },
  ],
  chatHistory: [{ id: "1", playerId: "friend", name: "仲間", text: "履歴本文", createdAt: 1 }],
};

test("build250 turns Social into a walk-up hall facility", async () => {
  const html = renderOnlineHome(room, "self", { exploreChatOpen: false, socialNotice: { badge: 3, attentionCount: 1 } });
  assert.match(html, /data-online-hall-destination="social"/);
  assert.match(html, /assets\/online\/hall\/build250\/social-lodge\.png/);
  assert.match(html, /data-online-hall-social-notice[^>]*><span>遠征<\/span><span>3<\/span>/);
  assert.match(html, /aria-label="交流所へ移動。お知らせ3件、遠征あり"/);
  assert.match(html, /<small>交流所<\/small><button type="button" data-online-friends-toggle>交流所へ入る<\/button>/);

  const closed = renderOnlineSocialPanel({}, {}, { open: false, showFab: true, hallFacilityMode: true });
  const opened = renderOnlineSocialPanel({}, {}, { open: true, showFab: true, hallFacilityMode: true });
  assert.equal(closed, "", "the floating Social button must be absent in the hall");
  assert.match(opened, /online-social-panel/);

  const image = await readFile(new URL("../assets/online/hall/build250/social-lodge.png", import.meta.url));
  assert.equal(image.subarray(1, 4).toString(), "PNG");
});

test("build250 keeps Social notifications on the lodge after removing the floating button", () => {
  const notice = onlineSocialNotificationSummary({ incoming: [{ playerId: "a" }], invites: [{ inviteId: "b" }] }, {}, { connected: true });
  assert.deepEqual({ friendBadge: notice.friendBadge, guildBadge: notice.guildBadge, badge: notice.badge }, { friendBadge: 2, guildBadge: 0, badge: 2 });
  const html = renderOnlineHome(room, "self", { socialNotice: notice });
  assert.match(html, /data-online-hall-social-notice[^>]*><span>2<\/span>/);
});

test("build250 hall quick chat exposes only the bottom composer", () => {
  const html = renderOnlineHome(room, "self", { exploreChatOpen: true, chatDraft: "入力中" });
  assert.match(html, /online-hall-quick-chat/);
  assert.match(html, /<header hidden aria-hidden="true">/);
  assert.match(html, /online-hall-quick-chat-log[^>]*hidden aria-hidden="true"/);
  assert.match(html, /<footer hidden aria-hidden="true">/);
  assert.match(html, /data-online-explore-chat-input[^>]*value="入力中"/);
  assert.match(html, /data-online-chat-close/);
});

test("build250 balances hall emotes and removes the stray center disc", async () => {
  const css = await readFile(new URL("../src/Styles/build250.css", import.meta.url), "utf8");
  assert.match(css, /\.online-emote-wheel-hall::before\{display:none!important;content:none!important\}/);
  assert.match(css, /\.online-emote-wheel-hall i\{[\s\S]*?width:44px;[\s\S]*?translateY\(-64px\)/);
});

test("build250 enlarges player taps and the mobile trade catalog", async () => {
  const [css, client] = await Promise.all([
    readFile(new URL("../src/Styles/build250.css", import.meta.url), "utf8"),
    readFile(new URL("../src/online/OnlinePartyClient.js", import.meta.url), "utf8"),
  ]);
  assert.match(css, /\.online-hall-player\.tradeable:not\(\.offline\)::before\{[\s\S]*?inset:-14px -17px -12px;/);
  assert.match(css, /\.online-hall-player\.tradeable\.offline\{pointer-events:none!important\}/);
  assert.match(css, /\.online-trade-catalog\{[\s\S]*?display:block!important;[\s\S]*?flex:1 1 0;[\s\S]*?min-height:142px;/);
  assert.match(css, /@media\(max-width:520px\)[\s\S]*?\.online-trade-search\{[\s\S]*?grid-template-columns:minmax\(0,1fr\) auto;/);
  assert.match(css, /\.online-trade-search>input\{font-size:16px!important\}/);
  assert.match(client, /data-online-trade-player[\s\S]*?this\._send\("tradeInvite", \{ targetId \}\)/);
});

test("build250 patches hall bubbles without replacing the focused quick-chat composer", async () => {
  const client = await readFile(new URL("../src/online/OnlinePartyClient.js", import.meta.url), "utf8");
  assert.match(client, /_refreshHallSocialDom\(\) \{[\s\S]*?data-online-explore-chat-input[\s\S]*?data-online-hall-player[\s\S]*?return true;/);
  assert.match(client, /_receiveChat\(message\) \{[\s\S]*?if \(!this\._refreshHallSocialDom\(\)\) this\._render\(\);/);
  assert.match(client, /_receiveSocial\(message\) \{[\s\S]*?if \(!this\._refreshHallSocialDom\(\)\) this\._render\(\);/);
});

test("build250 keeps the Social facility coordinates synchronized", async () => {
  const [views, client] = await Promise.all([
    readFile(new URL("../src/online/OnlineViews.js", import.meta.url), "utf8"),
    readFile(new URL("../src/online/OnlinePartyClient.js", import.meta.url), "utf8"),
  ]);
  assert.match(views, /route: "social", x: 50, y: 49/);
  assert.match(client, /route: "social", x: 50, y: 49/);
  assert.match(client, /hallFacilityMode = this\.connectionStep === "room" && this\.route === "home"/);
});
