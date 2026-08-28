import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderOnlineGuildPanel } from "../src/ui/screens/OnlinePartyScreen.js?v=2.11.65-build239";

const root = new URL("../", import.meta.url);

function guildMember(overrides = {}) {
  return {
    playerId: "AD-ABCD-BBBB",
    displayName: "冒険者",
    monsterName: "相棒",
    fallbackEmoji: "魔",
    online: true,
    role: "member",
    weekPoints: 12,
    ...overrides,
  };
}

function guildState(role = "leader") {
  return {
    guild: {
      guildId: "GD-ABC234",
      name: "深淵調査団",
      tag: "ABYS",
      description: "いっしょに探索します",
      level: 4,
      memberCount: 3,
      maxMembers: 20,
      leaderId: "AD-ABCD-AAAA",
      role,
      members: [
        guildMember({ playerId: "AD-ABCD-AAAA", displayName: "団長", role: "leader" }),
        guildMember({ playerId: "AD-ABCD-BBBB", displayName: "幹部", role: "officer" }),
        guildMember({ playerId: "AD-ABCD-CCCC", displayName: "<script>member</script>", role: "member", online: false }),
      ],
      applications: [guildMember({ playerId: "AD-ABCD-DDDD", displayName: "<img src=x onerror=1>", role: "member" })],
      chat: [{ id: "chat-1", playerId: "AD-ABCD-BBBB", name: "幹部", text: "<svg onload=alert(1)>", at: 1_700_000_000_000 }],
      week: { weekId: "2026-08-24", points: 245, goals: [50, 200, 500, 1000], tier: 2 },
      checkedInToday: false,
    },
    invitations: [],
    applications: [],
    lookup: null,
  };
}

test("build233 guild guest flow escapes remote and draft values", () => {
  const html = renderOnlineGuildPanel({
    guild: null,
    invitations: [{
      inviteId: "invite-1\" autofocus",
      guild: { guildId: "GD-AAAAAA", name: "<script>guild</script>", tag: "<GD>", description: "<img src=x>" , memberCount: 2, maxMembers: 20 },
      from: { displayName: "<svg onload=alert(1)>" },
    }],
    applications: [{ guildId: "GD-BBBBBB", name: "申請中" }],
    lookup: { guildId: "GD-CCCCCC", name: "検索結果", tag: "SEA", description: "参加者募集中", memberCount: 1, maxMembers: 20 },
  }, {
    connected: true,
    selfId: "AD-ABCD-ZZZZ",
    guildIdDraft: "\"><img src=x>",
    createDraft: { name: "<b>name</b>", tag: "<T>", description: "<textarea>break" },
  });

  assert.doesNotMatch(html, /<(?:script|svg|img)(?:\s|>)/i);
  assert.match(html, /&lt;script&gt;guild&lt;\/script&gt;/);
  assert.match(html, /&lt;svg onload=alert\(1\)&gt;/);
  assert.match(html, /&quot;&gt;&lt;img/);
  assert.match(html, /&lt;b&gt;name&lt;\/b&gt;/);
  assert.match(html, /&lt;textarea&gt;break/);
  for (const control of [
    "data-online-guild-lookup-form", "data-online-guild-id", "data-online-guild-apply",
    "data-online-guild-create-form", "data-online-guild-create-name", "data-online-guild-create-tag",
    "data-online-guild-create-description", "data-online-guild-invite-accept", "data-online-guild-invite-decline",
  ]) assert.match(html, new RegExp(control));
});

test("build233 guild roles expose only their authorized controls", () => {
  const leaderHtml = renderOnlineGuildPanel(guildState("leader"), {
    connected: true,
    selfId: "AD-ABCD-AAAA",
    friends: [guildMember({ playerId: "AD-ABCD-EEEE", displayName: "招待候補" })],
    chatDraft: "返信 <script>",
  });
  assert.doesNotMatch(leaderHtml, /<(?:script|svg|img)(?:\s|>)/i);
  assert.match(leaderHtml, /&lt;script&gt;member&lt;\/script&gt;/);
  assert.match(leaderHtml, /&lt;svg onload=alert\(1\)&gt;/);
  assert.match(leaderHtml, /マスター/);
  assert.match(leaderHtml, /幹部/);
  assert.match(leaderHtml, /メンバー/);
  for (const control of [
    "data-copy-guild-id", "data-online-guild-check-in", "data-online-guild-chat-form",
    "data-online-guild-application-accept", "data-online-guild-application-decline", "data-online-guild-invite",
    "data-online-guild-set-role", "data-online-guild-transfer", "data-online-guild-kick", "data-online-guild-disband",
  ]) assert.match(leaderHtml, new RegExp(control));
  assert.doesNotMatch(leaderHtml, /data-online-guild-leave/);

  const officer = guildState("officer");
  officer.guild.members[0].playerId = "AD-ABCD-ZZZZ";
  officer.guild.members[1].playerId = "AD-ABCD-BBBB";
  const officerHtml = renderOnlineGuildPanel(officer, { connected: true, selfId: "AD-ABCD-BBBB", friends: [] });
  assert.match(officerHtml, /data-online-guild-kick/);
  assert.match(officerHtml, /data-online-guild-leave/);
  assert.doesNotMatch(officerHtml, /data-online-guild-(?:set-role|transfer|disband)/);

  const member = guildState("member");
  member.guild.applications = [];
  const memberHtml = renderOnlineGuildPanel(member, { connected: true, selfId: "AD-ABCD-CCCC", friends: [] });
  assert.match(memberHtml, /data-online-guild-chat-form/);
  assert.match(memberHtml, /data-online-guild-leave/);
  assert.doesNotMatch(memberHtml, /data-online-guild-(?:application-accept|invite=|set-role|transfer|kick|disband)/);
});

test("build233 client and server connect the complete guild protocol", async () => {
  const files = [
    "index.html", "src/main.js", "src/online/OnlinePartyClient.js", "src/ui/screens/OnlinePartyScreen.js",
    "online-server/server.js", "online-server/src/RoomStore.js", "online-server/src/GuildCoordinator.js",
  ];
  const [index, main, client, screen, server, roomStore, coordinator] = await Promise.all(
    files.map(file => readFile(new URL(file, root), "utf8")),
  );

  assert.match(index, /ASSET_BUILD\s*\=\s*"build239"/);
  assert.match(index, /build239\.css\?v=2\.11\.65-build239/);
  assert.match(main, /OnlinePartyClient\.js\?v=2\.11\.65-build239/);
  assert.match(client, /OnlinePartyScreen\.js\?v=2\.11\.65-build239/);
  assert.match(client, /guildState/);
  assert.match(client, /guildLookupResult/);
  assert.match(client, /data-online-social-tab/);
  assert.match(screen, /renderOnlineGuildPanel/);
  assert.match(screen, /data-online-friend-layer/);

  const routes = [
    "guildList", "guildLookup", "guildCreate", "guildApply", "guildApplicationRespond",
    "guildInvite", "guildInviteRespond", "guildSetRole", "guildTransfer", "guildKick",
    "guildLeave", "guildDisband", "guildCheckIn", "guildChat",
  ];
  for (const route of routes) {
    assert.match(server, new RegExp(`message\\.type===\"${route}\"`), `missing server route ${route}`);
    assert.match(client, new RegExp(`\"${route}\"`), `missing client message ${route}`);
  }
  assert.match(server, /guildsV1:true/);
  assert.match(server, /GUILD_STATE_FILE/);
  assert.match(server, /\.\/data\/guilds\.json/);
  assert.match(roomStore, /recordRoomActivity\(room,message\)/);
  assert.match(coordinator, /eligible\.size\s*<\s*2/);
  assert.match(coordinator, /WEEK_GOALS\s*=\s*Object\.freeze\(\[50,\s*200,\s*500,\s*1_?000\]\)/);
  assert.doesNotMatch(coordinator, /\b(?:inventory|wallet|gold|crystal|grantReward|giveItem)\b/i);
});

test("build233 guild stylesheet keeps small iPhone controls inside safe boundaries", async () => {
  const css = await readFile(new URL("src/Styles/build233.css", root), "utf8");
  assert.match(css, /\.online-social-panel/);
  assert.match(css, /\.online-guild-view/);
  assert.match(css, /@media\s*\(\s*max-width:\s*420px\s*\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /overflow(?:-y)?:\s*(?:auto|scroll)/);
});
