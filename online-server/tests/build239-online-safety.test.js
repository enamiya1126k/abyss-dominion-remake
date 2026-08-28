import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { RoomStore } from "../src/RoomStore.js";

const IDS = [
  "AD-SAFE-BBBB", "AD-SAFE-CCCC", "AD-SAFE-DDDD", "AD-SAFE-EEEE",
  "AD-SAFE-FFFF", "AD-SAFE-GGGG", "AD-SAFE-HHHH", "AD-SAFE-JJJJ",
  "AD-SAFE-KKKK", "AD-SAFE-LLLL", "AD-SAFE-MMMM", "AD-SAFE-NNNN",
];

function identity(index, profile = {}) {
  return {
    friendId: IDS[index],
    clientKey: `build239-online-safety-client-${index}`.padEnd(40, "x"),
    profile: {
      displayName: `安全確認${index + 1}`,
      monsterName: `相棒${index + 1}`,
      speciesId: "slime",
      fallbackEmoji: "🫧",
      level: 20,
      maxFloor: 500,
      ...profile,
    },
  };
}

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function hello(store, index, options = {}) {
  const conn = connection();
  const result = store.hello(conn, { ...identity(index), ...options });
  assert.equal(result.ok, true, result.message);
  return { conn, session: conn.session, result, index };
}

function clear(...players) { for (const player of players) player.conn.messages.length = 0; }
function messages(player, type) { return player.conn.messages.filter(message => message.type === type); }
function latest(player, type) { return messages(player, type).at(-1) ?? null; }

function befriend(store, left, right) {
  assert.equal(store.requestFriend(left.session, right.session.playerId).ok, true);
  assert.equal(store.respondFriend(right.session, left.session.playerId, true).ok, true);
}

function createGuild(store, owner, suffix = "A") {
  const result = store.createGuild(owner.session, {
    name: `安全旅団${suffix}`,
    tag: `S${suffix}`,
    description: "公開オンライン安全機能の確認",
  });
  assert.equal(result.ok, true, result.message);
  return result.guild;
}

function joinGuild(store, owner, member, guildId) {
  assert.equal(store.applyGuild(member.session, guildId).ok, true);
  assert.equal(store.respondGuildApplication(owner.session, member.session.playerId, true).ok, true);
}

const gold = amount => ({
  assetId: `currency:gold:${amount}`,
  kind: "currency",
  name: "GOLD",
  payload: { key: "gold", amount },
});

function beginTrade(store, left, right, { commit = false } = {}) {
  const requested = store.requestTrade(left.session, right.session.playerId);
  assert.equal(requested.ok, true, requested.message);
  const tradeId = requested.trade.tradeId;
  assert.equal(store.respondTrade(right.session, tradeId, true).ok, true);
  assert.equal(store.offerTrade(left.session, tradeId, gold(100)).ok, true);
  assert.equal(store.offerTrade(right.session, tradeId, gold(200)).ok, true);
  if (commit) {
    assert.equal(store.readyTrade(left.session, tradeId, true).ok, true);
    assert.equal(store.readyTrade(right.session, tradeId, true).ok, true);
    assert.equal(store.confirmTrade(left.session, tradeId).ok, true);
    const result = store.confirmTrade(right.session, tradeId);
    assert.equal(result.ok, true);
    assert.equal(result.trade.state, "committing");
  }
  return tradeId;
}

test("build239 loads friends v1, writes v2, and durably restores private block and mute lists", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-build239-friends-"));
  const stateFile = join(folder, "friends.json");
  let store = new RoomStore({ friendStateFile: stateFile });
  let left = hello(store, 0), right = hello(store, 1);

  assert.equal(store.blockFriend(left.session, right.session.playerId).ok, true);
  const legacy = JSON.parse(readFileSync(stateFile, "utf8"));
  legacy.version = 1;
  delete legacy.muted;
  writeFileSync(stateFile, JSON.stringify(legacy));

  store = new RoomStore({ friendStateFile: stateFile });
  left = hello(store, 0); right = hello(store, 1);
  let leftState = store.friendState(left.session).state;
  assert.deepEqual(leftState.blocked.map(entry => entry.playerId), [right.session.playerId]);
  assert.deepEqual(leftState.muted, []);
  assert.deepEqual(store.friendState(right.session).state.blocked, [], "being blocked must not appear in the target's own list");
  assert.deepEqual(Object.keys(leftState.blocked[0]).sort(), ["displayName", "fallbackEmoji", "monsterName", "playerId", "speciesId"].sort());
  for (const privateKey of ["credentialHash", "lastSeen", "online", "roomId", "roomJoinable"]) assert.equal(privateKey in leftState.blocked[0], false);

  assert.equal(store.muteFriend(left.session, right.session.playerId).ok, true);
  let saved = JSON.parse(readFileSync(stateFile, "utf8"));
  assert.equal(saved.version, 2);
  assert.deepEqual(saved.blocked[left.session.playerId], [right.session.playerId]);
  assert.deepEqual(saved.muted[left.session.playerId], [right.session.playerId]);

  store = new RoomStore({ friendStateFile: stateFile });
  left = hello(store, 0); right = hello(store, 1);
  leftState = store.friendState(left.session).state;
  assert.deepEqual(leftState.blocked.map(entry => entry.playerId), [right.session.playerId]);
  assert.deepEqual(leftState.muted.map(entry => entry.playerId), [right.session.playerId]);
  assert.equal(store.unblockFriend(left.session, right.session.playerId).ok, true);
  assert.equal(store.unmuteFriend(left.session, right.session.playerId).ok, true);

  store = new RoomStore({ friendStateFile: stateFile });
  left = hello(store, 0);
  assert.deepEqual(store.friendState(left.session).state.blocked, []);
  assert.deepEqual(store.friendState(left.session).state.muted, []);
});

test("build239 hides every room member from blocked directory viewers and seals direct, listed and quick joins", () => {
  const store = new RoomStore({ randomRoomCode: () => "SAFE39" });
  const host = hello(store, 0), member = hello(store, 1), viewerBlockedByMember = hello(store, 2), viewerBlockedByHost = hello(store, 3), cleanViewer = hello(store, 4);
  const created = store.createRoom(host.session, { published: true, purpose: "explore", style: "anyone" });
  assert.equal(created.ok, true);
  assert.equal(store.joinRoom(member.session, created.room.roomId).ok, true);
  const room = store.rooms.get(created.room.roomId), listingId = room.listing.listingId;

  assert.equal(store.blockFriend(viewerBlockedByMember.session, member.session.playerId).ok, true);
  assert.equal(store.blockFriend(host.session, viewerBlockedByHost.session.playerId).ok, true);
  assert.deepEqual(store.listRoomListings(viewerBlockedByMember.session).listings, []);
  assert.deepEqual(store.listRoomListings(viewerBlockedByHost.session).listings, []);
  assert.equal(store.listRoomListings(cleanViewer.session).listings[0].roomId, room.roomId);

  const directDenied = store.joinRoom(viewerBlockedByMember.session, room.roomId);
  const directMissing = store.joinRoom(viewerBlockedByMember.session, "NONE39");
  assert.deepEqual({ code: directDenied.code, message: directDenied.message }, { code: directMissing.code, message: directMissing.message });
  assert.equal(directDenied.code, "ROOM_NOT_FOUND");

  const listedDenied = store.joinListedRoom(viewerBlockedByMember.session, { roomId: room.roomId, listingId });
  const listedMissing = store.joinListedRoom(viewerBlockedByMember.session, { roomId: "NONE39", listingId: "missing" });
  assert.deepEqual({ code: listedDenied.code, message: listedDenied.message }, { code: listedMissing.code, message: listedMissing.message });
  assert.equal(listedDenied.code, "LISTING_UNAVAILABLE");
  assert.equal(store.quickJoin(viewerBlockedByMember.session, { purpose: "explore", style: "anyone" }).code, "NO_OPEN_ROOMS");
  assert.equal(viewerBlockedByMember.session.roomId, null);

  assert.equal(store.quickJoin(cleanViewer.session, { purpose: "explore", style: "anyone" }).ok, true);
  assert.equal(cleanViewer.session.roomId, room.roomId);
});

test("build239 rechecks a stale listing after block and quick join skips to a safe candidate", () => {
  const codes = ["BLK239", "OKY239"];
  const store = new RoomStore({ randomRoomCode: () => codes.shift() ?? "END239" });
  const blockedHost = hello(store, 5), safeHost = hello(store, 6), viewer = hello(store, 7);
  const blockedRoom = store.createRoom(blockedHost.session, { published: true, purpose: "explore", style: "anyone" }).room;
  const safeRoom = store.createRoom(safeHost.session, { published: true, purpose: "explore", style: "anyone" }).room;
  const before = store.listRoomListings(viewer.session, { purpose: "explore", style: "anyone" }).listings;
  const stale = before.find(entry => entry.roomId === blockedRoom.roomId);
  assert.ok(stale);
  assert.ok(before.some(entry => entry.roomId === safeRoom.roomId));

  assert.equal(store.blockFriend(blockedHost.session, viewer.session.playerId).ok, true);
  assert.equal(store.joinListedRoom(viewer.session, stale).code, "LISTING_UNAVAILABLE", "admission must recheck after an already-rendered listing becomes blocked");
  const joined = store.quickJoin(viewer.session, { purpose: "explore", style: "anyone" });
  assert.equal(joined.ok, true);
  assert.equal(viewer.session.roomId, safeRoom.roomId);
});

test("build239 invalidates stale friend and guild invitations without disclosing which side blocked", () => {
  const store = new RoomStore({ randomRoomCode: () => "INV239" });
  const owner = hello(store, 0), target = hello(store, 1);
  befriend(store, owner, target);
  store.createRoom(owner.session);
  const friendInvite = store.inviteFriend(owner.session, target.session.playerId);
  assert.equal(friendInvite.ok, true);
  const guild = createGuild(store, owner, "I");
  const guildInvite = store.inviteGuild(owner.session, target.session.playerId);
  assert.equal(guildInvite.ok, true);

  assert.equal(store.blockFriend(target.session, owner.session.playerId).ok, true);
  assert.equal(store.respondFriendInvite(target.session, friendInvite.inviteId, true).code, "FRIEND_INVITE_MISSING");
  assert.equal(store.respondGuildInvite(target.session, guildInvite.inviteId, true).code, "GUILD_INVITE_MISSING");
  assert.equal(store.inviteFriend(owner.session, target.session.playerId).ok, false);
  assert.equal(store.inviteGuild(owner.session, target.session.playerId).ok, false);
  assert.equal(store.guilds.memberships.get(owner.session.playerId), guild.guildId);
});

test("build239 cancels pre-commit exchanges on block but never rolls back a committing settlement", () => {
  {
    const store = new RoomStore({ randomRoomCode: () => "TRP239" });
    const left = hello(store, 0), right = hello(store, 1), room = store.createRoom(left.session).room;
    assert.equal(store.joinRoom(right.session, room.roomId).ok, true);
    const tradeId = beginTrade(store, left, right);
    clear(left, right);
    assert.equal(store.blockFriend(left.session, right.session.playerId).ok, true);
    assert.equal(store.trade.activeFor(left.session.playerId), null);
    assert.equal(store.trade.activeFor(right.session.playerId), null);
    for (const player of [left, right]) {
      const cancelled = messages(player, "tradeCancelled").find(message => message.tradeId === tradeId);
      assert.equal(cancelled?.reason, "unavailable");
    }
    assert.equal(store.requestTrade(left.session, right.session.playerId).code, "TRADE_TARGET");
  }

  {
    const store = new RoomStore({ randomRoomCode: () => "TRC239" });
    const left = hello(store, 2), right = hello(store, 3), room = store.createRoom(left.session).room;
    assert.equal(store.joinRoom(right.session, room.roomId).ok, true);
    const tradeId = beginTrade(store, left, right, { commit: true });
    clear(left, right);
    assert.equal(store.blockFriend(left.session, right.session.playerId).ok, true);
    assert.equal(store.trade.trades.get(tradeId)?.state, "committing");
    assert.deepEqual(store.trade.protectedTradeIdsFor(left.session.playerId), [tradeId]);
    assert.deepEqual(store.trade.protectedTradeIdsFor(right.session.playerId), [tradeId]);
    assert.equal(messages(left, "tradeCancelled").some(message => message.tradeId === tradeId), false);
    assert.equal(messages(right, "tradeCancelled").some(message => message.tradeId === tradeId), false);
    assert.equal(store.ackTrade(left.session, tradeId, true).ok, true);
    assert.equal(store.ackTrade(right.session, tradeId, true).ok, true);
    assert.deepEqual(store.trade.protectedTradeIdsFor(left.session.playerId), []);
    assert.deepEqual(store.trade.protectedTradeIdsFor(right.session.playerId), []);
  }
});

test("build239 separates blocked lobby pairs and refuses a blocked room recovery", () => {
  {
    const store = new RoomStore({ randomRoomCode: () => "SEP239" });
    const host = hello(store, 0), guest = hello(store, 1), room = store.createRoom(host.session).room;
    assert.equal(store.joinRoom(guest.session, room.roomId).ok, true);
    assert.equal(store.blockFriend(guest.session, host.session.playerId).ok, true);
    assert.equal(host.session.roomId === guest.session.roomId, false);
    assert.equal(store.rooms.get(room.roomId).members.size, 1);
  }
  {
    const store = new RoomStore({ randomRoomCode: () => "LEA239" });
    const host = hello(store, 2), guest = hello(store, 3), room = store.createRoom(host.session).room;
    assert.equal(store.joinRoom(guest.session, room.roomId).ok, true);
    assert.equal(store.blockFriend(host.session, guest.session.playerId).ok, true);
    assert.equal(host.session.roomId === guest.session.roomId, false);
    assert.equal(store.rooms.get(room.roomId).leaderId, host.session.playerId);
  }
  {
    const store = new RoomStore({ randomRoomCode: () => "REC239" });
    const host = hello(store, 4), guest = hello(store, 5), room = store.createRoom(host.session).room;
    assert.equal(store.joinRoom(guest.session, room.roomId).ok, true);
    store.disconnect(guest.session, guest.conn);
    assert.equal(store.friends.block(host.session, guest.session.playerId).ok, true, "create a persisted blocked pair without invoking lobby separation");
    assert.equal(guest.session.roomId, room.roomId);
    const replacement = connection();
    const resumed = store.hello(replacement, { ...identity(5), resumeToken: guest.result.resumeToken });
    assert.equal(resumed.ok, true);
    assert.equal(resumed.resumed, false);
    assert.equal(resumed.room, null);
    assert.equal(replacement.session.roomId, null);
    assert.equal(store.rooms.get(room.roomId).members.has(guest.session.playerId), false);
  }
});

test("build239 applies one-way mute and active-content block only to room chat and social delivery", () => {
  const store = new RoomStore({ randomRoomCode: () => "MUT239" });
  const author = hello(store, 0), mutedViewer = hello(store, 1), observer = hello(store, 2), roomDto = store.createRoom(author.session).room;
  assert.equal(store.joinRoom(mutedViewer.session, roomDto.roomId).ok, true);
  assert.equal(store.joinRoom(observer.session, roomDto.roomId).ok, true);
  const room = store.rooms.get(roomDto.roomId);
  assert.equal(store.muteFriend(mutedViewer.session, author.session.playerId).ok, true);
  clear(author, mutedViewer, observer);

  assert.equal(store.chat(author.session, { text: "ミュート対象の発言" }).ok, true);
  assert.equal(store.social(author.session, { kind: "emote", id: "wave" }).ok, true);
  assert.equal(messages(author, "chatMessage").length, 1);
  assert.equal(messages(observer, "chatMessage").length, 1);
  assert.equal(messages(observer, "social").length, 1);
  assert.equal(messages(mutedViewer, "chatMessage").length, 0);
  assert.equal(messages(mutedViewer, "social").length, 0);
  assert.equal(store.roomSnapshot(room, mutedViewer.session.playerId).chatHistory.length, 0);
  assert.equal(store.roomSnapshot(room, observer.session.playerId).chatHistory.length, 1);

  assert.equal(store.move(author.session, { x: 51, y: 76, facing: "right" }).ok, true);
  assert.equal(messages(mutedViewer, "memberMoved").length, 1, "mute must not hide gameplay movement");
  assert.equal(store.unmuteFriend(mutedViewer.session, author.session.playerId).ok, true);

  room.phase = "raid";
  assert.equal(store.blockFriend(mutedViewer.session, author.session.playerId).ok, true);
  assert.equal(room.members.has(author.session.playerId), true);
  assert.equal(room.members.has(mutedViewer.session.playerId), true, "active content must not be destroyed by a block");
  author.session.lastChatAt = 0;
  clear(author, mutedViewer, observer);
  assert.equal(store.chat(author.session, { text: "ブロック対象の発言" }).ok, true);
  assert.equal(store.social(author.session, { kind: "emote", id: "cheer" }).ok, true);
  assert.equal(messages(mutedViewer, "chatMessage").length, 0);
  assert.equal(messages(mutedViewer, "social").length, 0);
  assert.equal(messages(observer, "chatMessage").length, 1);
  room.phase = "lobby";
  store._broadcastRoom(room);
  assert.equal(author.session.roomId === mutedViewer.session.roomId, false, "the pair must separate on return to the lobby");
});

test("build239 filters guild chat per viewer while retaining membership, roles, plans and RSVP", () => {
  const now = Date.UTC(2026, 7, 29, 8, 0, 0);
  const store = new RoomStore({ now: () => now });
  const owner = hello(store, 0), member = hello(store, 1), guild = createGuild(store, owner, "G");
  joinGuild(store, owner, member, guild.guildId);
  const planResult = store.createGuildPlan(owner.session, {
    purpose: "explore", style: "casual", note: "安全確認", floor: 100, scheduledAt: now + 60 * 60_000,
  });
  assert.equal(planResult.ok, true);
  assert.equal(store.respondGuildPlan(member.session, planResult.plan.planId, "going").ok, true);

  assert.equal(store.muteFriend(member.session, owner.session.playerId).ok, true);
  clear(owner, member);
  assert.equal(store.guildChat(owner.session, "ミュート対象のギルド発言").ok, true);
  assert.equal(latest(member, "guildState").state.guild.chat.length, 0);
  assert.equal(store.guildState(owner.session).state.guild.chat.length, 1);
  assert.equal(store.unmuteFriend(member.session, owner.session.playerId).ok, true);
  assert.equal(store.guildState(member.session).state.guild.chat.length, 1);

  assert.equal(store.blockFriend(member.session, owner.session.playerId).ok, true);
  assert.equal(store.guildChat(owner.session, "ブロック後のギルド発言").ok, true);
  const memberGuild = store.guildState(member.session).state.guild;
  assert.equal(memberGuild.guildId, guild.guildId);
  assert.equal(memberGuild.members.length, 2);
  assert.equal(memberGuild.members.find(entry => entry.playerId === owner.session.playerId).online, false);
  assert.equal(memberGuild.plans.length, 1);
  assert.equal(memberGuild.plans[0].myStatus, "going");
  assert.equal(memberGuild.chat.length, 0);
  const internalGuild = store.guilds.guilds.get(guild.guildId);
  assert.equal(internalGuild.memberIds.has(owner.session.playerId), true);
  assert.equal(internalGuild.memberIds.has(member.session.playerId), true);
  assert.equal(internalGuild.plans[0].responses[member.session.playerId], "going");
});

test("build239 hides blocked guild recruitments and planned gatherings and rejects their opaque join tokens", () => {
  {
    const store = new RoomStore({ randomRoomCode: () => "GRP239" });
    const owner = hello(store, 0), roomMember = hello(store, 1), joiner = hello(store, 2), guild = createGuild(store, owner, "R");
    joinGuild(store, owner, roomMember, guild.guildId);
    joinGuild(store, owner, joiner, guild.guildId);
    const room = store.createRoom(owner.session).room;
    assert.equal(store.joinRoom(roomMember.session, room.roomId).ok, true);
    const recruitment = store.createGuildRecruitment(owner.session, { purpose: "raid", style: "help", note: "安全募集" });
    assert.equal(recruitment.ok, true);
    assert.equal(store.blockFriend(joiner.session, roomMember.session.playerId).ok, true);
    assert.deepEqual(store.guildState(joiner.session).state.guild.recruitments, []);
    assert.equal(store.joinGuildRecruitment(joiner.session, recruitment.recruitment.recruitmentId).code, "GUILD_RECRUITMENT_UNAVAILABLE");
    assert.equal(joiner.session.roomId, null);
  }

  {
    const now = Date.UTC(2026, 7, 29, 9, 0, 0);
    const store = new RoomStore({ now: () => now, randomRoomCode: () => "GPL239" });
    const owner = hello(store, 3), roomMember = hello(store, 4), joiner = hello(store, 5), guild = createGuild(store, owner, "P");
    joinGuild(store, owner, roomMember, guild.guildId);
    joinGuild(store, owner, joiner, guild.guildId);
    const plan = store.createGuildPlan(owner.session, { purpose: "explore", style: "casual", note: "予定集合", floor: 200, scheduledAt: now + 10 * 60_000 }).plan;
    const room = store.createRoom(owner.session).room;
    assert.equal(store.joinRoom(roomMember.session, room.roomId).ok, true);
    const gathered = store.gatherGuildPlan(owner.session, plan.planId);
    assert.equal(gathered.ok, true);
    assert.equal(store.blockFriend(joiner.session, roomMember.session.playerId).ok, true);
    const joinerPlan = store.guildState(joiner.session).state.guild.plans.find(entry => entry.planId === plan.planId);
    assert.ok(joinerPlan, "the persistent schedule and RSVP surface must remain");
    assert.equal(joinerPlan.gathering, null, "only the blocked gathering route is hidden");
    assert.equal(store.joinGuildRecruitment(joiner.session, gathered.gathering.recruitmentId).code, "GUILD_RECRUITMENT_UNAVAILABLE");
    assert.equal(joiner.session.roomId, null);
  }
});

test("build239 exposes only additive protocol routes and the onlineSafetyV1 capability", () => {
  const server = readFileSync(new URL("../server.js", import.meta.url), "utf8");
  for (const route of ["friendBlock", "friendUnblock", "friendMute", "friendUnmute"]) assert.match(server, new RegExp(route));
  assert.match(server, /onlineSafetyV1:true/);
  assert.match(server, /protocol:\"1\.16\.0\"/);
});
