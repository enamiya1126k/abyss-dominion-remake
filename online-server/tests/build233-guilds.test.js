import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import net from "node:net";
import { WebSocket } from "ws";
import { RoomStore } from "../src/RoomStore.js";

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DAY_MS = 24 * 60 * 60_000;

function playerCode(index) {
  let value = Math.max(0, Number(index) || 0), code = "";
  for (let position = 0; position < 8; position++) {
    code = ID_ALPHABET[value % ID_ALPHABET.length] + code;
    value = Math.floor(value / ID_ALPHABET.length);
  }
  return `AD-${code.slice(0, 4)}-${code.slice(4)}`;
}

function identity(index) {
  return {
    friendId: playerCode(index),
    clientKey: `build233-guild-client-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `探索者${index + 1}`,
      monsterName: `相棒${index + 1}`,
      speciesId: "slime",
      fallbackEmoji: "🫧"
    }
  };
}

function connection() {
  return {
    messages: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close() {}
  };
}

function hello(store, index, source = {}) {
  const conn = connection(), result = store.hello(conn, { ...identity(index), ...source });
  assert.equal(result.ok, true, `hello failed for player ${index}: ${result.code ?? "unknown"}`);
  return { conn, session: conn.session, result };
}

function createGuild(store, owner, source = {}) {
  const result = store.createGuild(owner.session, { name: "深淵旅団", tag: "ABYS", description: "みんなで深淵を踏破するギルド" , ...source });
  assert.equal(result.ok, true, result.message);
  return result.guild;
}

function joinByApplication(store, owner, applicant, guildId) {
  assert.equal(store.applyGuild(applicant.session, guildId).ok, true);
  const result = store.respondGuildApplication(owner.session, applicant.session.playerId, true);
  assert.equal(result.ok, true, result.message);
}

function befriend(store, left, right) {
  assert.equal(store.requestFriend(left.session, right.session.playerId).ok, true);
  assert.equal(store.respondFriend(right.session, left.session.playerId, true).ok, true);
}

test("build233 guild creation, exact lookup, application approval and persistence survive restart", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-persist-"));
  const friendStateFile = join(folder, "friends.json"), guildStateFile = join(folder, "guilds.json");
  const first = new RoomStore({ friendStateFile, guildStateFile }), owner = hello(first, 0), applicant = hello(first, 1);
  const guild = createGuild(first, owner);

  assert.match(guild.guildId, /^GD-[A-Z2-9]{6}$/);
  assert.equal(first.lookupGuild(applicant.session, guild.guildId.toLowerCase()).guild.guildId, guild.guildId);
  assert.equal(first.lookupGuild(applicant.session, "GD-AAAAAA").code, "GUILD_NOT_FOUND");
  assert.equal(first.applyGuild(applicant.session, guild.guildId).ok, true);
  assert.equal(first.guildState(owner.session).state.guild.applications[0].playerId, applicant.session.playerId);
  assert.equal(first.respondGuildApplication(applicant.session, owner.session.playerId, true).code, "GUILD_OFFICER_ONLY");
  assert.equal(first.respondGuildApplication(owner.session, applicant.session.playerId, true).ok, true);
  assert.equal(first.guildState(applicant.session).state.guild.memberCount, 2);
  assert.equal(first.guildChat(owner.session, "再起動後も残る伝言").ok, true);

  const stored = JSON.parse(readFileSync(guildStateFile, "utf8"));
  assert.equal(stored.version, 3);
  assert.equal(stored.guilds[0].guildId, guild.guildId);
  assert.equal(JSON.stringify(stored).includes(identity(0).clientKey), false, "guild data must not store device credentials");

  const restarted = new RoomStore({ friendStateFile, guildStateFile });
  assert.equal(restarted.hello(connection(), { ...identity(0), clientKey: "different-device-key".padEnd(32, "x") }).code, "ID_IN_USE");
  const resumed = hello(restarted, 0), resumedState = restarted.guildState(resumed.session).state.guild;
  assert.equal(resumedState.guildId, guild.guildId);
  assert.equal(resumedState.memberCount, 2);
  assert.equal(resumedState.chat.at(-1).text, "再起動後も残る伝言");
  assert.equal("credentialHash" in resumedState.members[0], false);
});

test("build233 enforces one guild, 20 members, role hierarchy, transfer, leave and name-confirmed disband", () => {
  const store = new RoomStore(), players = Array.from({ length: 22 }, (_, index) => hello(store, index));
  const guild = createGuild(store, players[0]);
  for (let index = 1; index < 20; index++) joinByApplication(store, players[0], players[index], guild.guildId);
  assert.equal(store.guildState(players[0].session).state.guild.memberCount, 20);
  assert.equal(store.applyGuild(players[20].session, guild.guildId).code, "GUILD_FULL");

  const second = createGuild(store, players[20], { name: "別働旅団", tag: "BETA" });
  assert.equal(store.applyGuild(players[1].session, second.guildId).code, "GUILD_ALREADY_MEMBER");
  assert.equal(store.setGuildRole(players[1].session, players[2].session.playerId, "officer").code, "GUILD_LEADER_ONLY");
  assert.equal(store.setGuildRole(players[0].session, players[1].session.playerId, "officer").ok, true);
  assert.equal(store.guildState(players[1].session).state.guild.role, "officer");
  assert.equal(store.kickGuild(players[1].session, players[2].session.playerId).ok, true);
  assert.equal(store.guildState(players[2].session).state.guild, null);
  assert.equal(store.kickGuild(players[1].session, players[0].session.playerId).code, "GUILD_ROLE");

  assert.equal(store.transferGuild(players[0].session, players[1].session.playerId).ok, true);
  assert.equal(store.guildState(players[1].session).state.guild.role, "leader");
  assert.equal(store.guildState(players[0].session).state.guild.role, "officer");
  assert.equal(store.leaveGuild(players[1].session).code, "GUILD_TRANSFER_REQUIRED");
  assert.equal(store.leaveGuild(players[0].session).ok, true);
  assert.equal(store.guildState(players[0].session).state.guild, null);
  assert.equal(store.disbandGuild(players[1].session, "wrong name").code, "GUILD_CONFIRM_NAME");
  assert.equal(store.disbandGuild(players[1].session, "深淵旅団").ok, true);
  assert.equal(store.guildState(players[1].session).state.guild, null);
  assert.equal(store.lookupGuild(players[21].session, guild.guildId).code, "GUILD_NOT_FOUND");

  assert.equal(store.leaveGuild(players[20].session).ok, true, "a lone leader leaving should disband the guild");
  assert.equal(store.lookupGuild(players[21].session, second.guildId).code, "GUILD_NOT_FOUND");
});

test("build233 guild invitations are officer-only, friend-only, persistent while offline, accepted once and expire after seven days", () => {
  let now = Date.UTC(2026, 7, 20, 0, 0, 0);
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-invite-"));
  const store = new RoomStore({ now: () => now, friendStateFile: join(folder, "friends.json"), guildStateFile: join(folder, "guilds.json") });
  const owner = hello(store, 0), friend = hello(store, 1), stranger = hello(store, 2), expiringFriend = hello(store, 3);
  const guild = createGuild(store, owner);

  assert.equal(store.inviteGuild(owner.session, stranger.session.playerId).code, "GUILD_FRIEND_REQUIRED");
  befriend(store, owner, friend);
  befriend(store, owner, expiringFriend);
  store.disconnect(friend.session, friend.conn);
  const invitation = store.inviteGuild(owner.session, friend.session.playerId);
  assert.equal(invitation.ok, true);

  const replacement = connection(), resumed = store.hello(replacement, { ...identity(1), resumeToken: friend.result.resumeToken });
  assert.equal(resumed.ok, true);
  assert.equal(resumed.guildState.invitations[0].guild.guildId, guild.guildId);
  assert.equal(store.respondGuildInvite(replacement.session, invitation.inviteId, true).ok, true);
  assert.equal(store.respondGuildInvite(replacement.session, invitation.inviteId, true).code, "GUILD_INVITE_MISSING");
  assert.equal(store.guildState(replacement.session).state.guild.guildId, guild.guildId);

  assert.equal(store.setGuildRole(owner.session, replacement.session.playerId, "officer").ok, true);
  assert.equal(store.inviteGuild(stranger.session, expiringFriend.session.playerId).code, "GUILD_OFFICER_ONLY");
  const expiring = store.inviteGuild(owner.session, expiringFriend.session.playerId);
  assert.equal(expiring.ok, true);
  now += 7 * DAY_MS + 1;
  assert.equal(store.respondGuildInvite(expiringFriend.session, expiring.inviteId, true).code, "GUILD_INVITE_MISSING");
  assert.equal(store.guildState(expiringFriend.session).state.guild, null);
});

test("build233 revokes an officer invitation after demotion or departure", () => {
  const store = new RoomStore(), owner = hello(store, 0), officer = hello(store, 1), target = hello(store, 2);
  const guild = createGuild(store, owner);
  joinByApplication(store, owner, officer, guild.guildId);
  befriend(store, officer, target);
  assert.equal(store.setGuildRole(owner.session, officer.session.playerId, "officer").ok, true);
  const invitation = store.inviteGuild(officer.session, target.session.playerId);
  assert.equal(invitation.ok, true);
  assert.equal(store.setGuildRole(owner.session, officer.session.playerId, "member").ok, true);
  assert.equal(store.respondGuildInvite(target.session, invitation.inviteId, true).code, "GUILD_INVITE_MISSING");
  assert.equal(store.guildState(target.session).state.guild, null);
});

test("build233 guild chat sanitizes text, rate-limits bursts and retains only the newest 80 messages", () => {
  let now = Date.UTC(2026, 7, 20, 0, 0, 0);
  const store = new RoomStore({ now: () => now }), owner = hello(store, 0);
  createGuild(store, owner);

  assert.equal(store.guildChat(owner.session, "Ａ\u0000Ｂ\u202eＣ").ok, true);
  assert.equal(store.guildState(owner.session).state.guild.chat[0].text, "ABC");
  for (let index = 1; index <= 84; index++) {
    if (index % 5 === 0) now += 5_000;
    const result = store.guildChat(owner.session, `msg${String(index).padStart(2, "0")}`);
    assert.equal(result.ok, true, `message ${index} was unexpectedly rejected`);
  }
  assert.equal(store.guildChat(owner.session, "sixth-in-window").code, "GUILD_CHAT_RATE");
  const chat = store.guildState(owner.session).state.guild.chat;
  assert.equal(chat.length, 80);
  assert.equal(chat[0].text, "msg05");
  assert.equal(chat.at(-1).text, "msg84");
});

test("build233 daily check-in is idempotent and weekly progress resets Monday 09:00 JST without granting inventory", () => {
  let now = Date.UTC(2026, 7, 21, 14, 30, 0); // Friday 23:30 JST
  const store = new RoomStore({ now: () => now }), owner = hello(store, 0);
  createGuild(store, owner);

  assert.deepEqual(store.checkInGuild(owner.session), { ok: true, points: 10 });
  assert.deepEqual(store.checkInGuild(owner.session), { ok: true, duplicate: true });
  let state = store.guildState(owner.session).state.guild;
  assert.equal(state.week.weekId, "2026-08-17");
  assert.equal(state.week.points, 10);
  assert.deepEqual(state.week.goals, [50, 200, 500, 1000]);

  now += 60 * 60_000; // Saturday 00:30 JST, same guild week
  assert.deepEqual(store.checkInGuild(owner.session), { ok: true, points: 10 });
  assert.equal(store.guildState(owner.session).state.guild.week.points, 20);

  now = Date.UTC(2026, 7, 24, 0, 1, 0); // Monday 09:01 JST
  assert.deepEqual(store.checkInGuild(owner.session), { ok: true, points: 10 });
  state = store.guildState(owner.session).state.guild;
  assert.equal(state.week.weekId, "2026-08-24");
  assert.equal(state.week.points, 10);
  assert.equal(state.members[0].weekPoints, 10);
  assert.equal(state.level, 1);
  assert.equal(owner.session.pendingRewards.length, 0, "guild activity must not mint items or currency");
});

test("build233 check-in cannot be repeated by leaving and rejoining on the same day", () => {
  const store = new RoomStore(), owner = hello(store, 0), member = hello(store, 1);
  const guild = createGuild(store, owner);
  joinByApplication(store, owner, member, guild.guildId);
  assert.deepEqual(store.checkInGuild(member.session), { ok: true, points: 10 });
  assert.equal(store.kickGuild(owner.session, member.session.playerId).ok, true);
  joinByApplication(store, owner, member, guild.guildId);
  assert.deepEqual(store.checkInGuild(member.session), { ok: true, duplicate: true });
  assert.equal(store.guildState(owner.session).state.guild.week.points, 10);
});

test("build233 multiplayer online activities add guild progress once per participant and event", () => {
  const store = new RoomStore(), owner = hello(store, 0), member = hello(store, 1);
  const guild = createGuild(store, owner);
  joinByApplication(store, owner, member, guild.guildId);
  const room = { members: new Set([owner.session.playerId, member.session.playerId]) };
  const ranking = [...room.members].map(playerId => ({ playerId }));
  const activities = [
    { type: "expeditionEnded", summary: { id: "expedition-1", completed: true, ranking } },
    { type: "floorBossDefeated", summary: { id: "floor-boss-1", ranking } },
    { type: "expeditionEvent", event: { id: "coop-boss-1", kind: "coopBossDefeated" } },
    { type: "raidEnded", result: "victory", raid: { progress: { campaignId: "raid-week-1" } }, ranking },
    { type: "teamBattleEnded", resultId: "team-result-1", summary: { ranking } },
    { type: "resonanceEnded", result: { victory: true }, resonance: { id: "resonance-1", players: [{ playerId: owner.session.playerId }, { playerId: member.session.playerId }] } }
  ];

  for (const activity of activities) store._broadcast(room, activity);
  let state = store.guildState(owner.session).state.guild;
  assert.equal(state.week.points, 136);
  assert.equal(state.members.find(entry => entry.playerId === owner.session.playerId).weekPoints, 68);
  assert.equal(state.members.find(entry => entry.playerId === member.session.playerId).weekPoints, 68);
  for (const activity of activities) store._broadcast(room, activity);
  assert.equal(store.guildState(owner.session).state.guild.week.points, 136, "replayed event IDs must not add progress twice");

  store._broadcast({ members: new Set([owner.session.playerId]) }, { type: "expeditionEnded", summary: { id: "solo-expedition", completed: true } });
  store._broadcast(room, { type: "raidEnded", result: "defeat", raid: { progress: { campaignId: "raid-defeat" } }, ranking });
  store._broadcast(room, { type: "expeditionEnded", summary: { id: "abandoned-expedition", completed: false, ranking } });
  state = store.guildState(owner.session).state.guild;
  assert.equal(state.week.points, 136, "solo, failed and abandoned activity must not add progress");
  assert.equal(owner.session.pendingRewards.length, 0);
  assert.equal(member.session.pendingRewards.length, 0);
});

test("build233 historical rankings cannot turn a solo room into multiplayer activity", () => {
  const store = new RoomStore(), owner = hello(store, 0), historical = hello(store, 1);
  const guild = createGuild(store, owner);
  joinByApplication(store, owner, historical, guild.guildId);
  const room = { members: new Set([owner.session.playerId]) };
  store._broadcast(room, { type: "raidEnded", result: "victory", raid: { progress: { campaignId: "historical-raid" } }, ranking: [{ playerId: owner.session.playerId }, { playerId: historical.session.playerId }] });
  assert.equal(store.guildState(owner.session).state.guild.week.points, 0);
});

test("build233 fails closed for corrupt state and rolls back an unwritable mutation", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-corrupt-")), corrupt = join(folder, "guilds.json");
  writeFileSync(corrupt, "{not-json", "utf8");
  assert.throws(() => new RoomStore({ guildStateFile: corrupt }), /Guild state could not be loaded/);

  const blocker = join(folder, "not-a-directory"); writeFileSync(blocker, "block", "utf8");
  const store = new RoomStore({ guildStateFile: join(folder, "writable-guilds.json") }), owner = hello(store, 0);
  store.guilds.stateFile = join(blocker, "guilds.json");
  const result = store.createGuild(owner.session, { name: "保存失敗旅団", tag: "FAIL", description: "" });
  assert.equal(result.code, "PERSISTENCE_ERROR");
  assert.equal(store.guildState(owner.session).state.guild, null);
  assert.equal(store.guilds.persistenceHealthy(), false);
});

test("build233 refuses a new online identity when its credential cannot be persisted", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-friend-write-")), blocker = join(folder, "not-a-directory");
  writeFileSync(blocker, "block", "utf8");
  const store = new RoomStore({ friendStateFile: join(folder, "writable-friends.json") });
  store.friends.stateFile = join(blocker, "friends.json");
  const conn = connection(), source = identity(80), result = store.hello(conn, source);
  assert.equal(result.code, "PERSISTENCE_ERROR");
  assert.equal(store.sessions.has(source.friendId), false);
  assert.equal(store.friends.hasPersistentAccount(source.friendId), false);
  assert.equal(store.friends.persistenceHealthy(), false);
});

async function freePort() {
  const socket = net.createServer();
  await new Promise((resolveListen, rejectListen) => { socket.once("error", rejectListen); socket.listen(0, "127.0.0.1", resolveListen); });
  const port = socket.address().port;
  await new Promise(resolveClose => socket.close(resolveClose));
  return port;
}

function wsClient(url) {
  const socket = new WebSocket(url), inbox = [], waiters = [];
  socket.on("message", raw => {
    const message = JSON.parse(raw), index = waiters.findIndex(entry => entry.test(message));
    if (index < 0) inbox.push(message);
    else {
      const [entry] = waiters.splice(index, 1);
      clearTimeout(entry.timer);
      entry.resolve(message);
    }
  });
  return {
    socket,
    open: () => new Promise((resolveOpen, rejectOpen) => { socket.once("open", resolveOpen); socket.once("error", rejectOpen); }),
    send: message => socket.send(JSON.stringify(message)),
    wait(testMessage, label) {
      const index = inbox.findIndex(testMessage);
      if (index >= 0) return Promise.resolve(inbox.splice(index, 1)[0]);
      return new Promise((resolveMessage, rejectMessage) => {
        const entry = { test: testMessage, resolve: resolveMessage, timer: setTimeout(() => rejectMessage(new Error(`${label} timeout; inbox=${JSON.stringify(inbox)}`)), 4_000) };
        waiters.push(entry);
      });
    },
    close: () => socket.close()
  };
}

test("build233 create, lookup, application approval and chat work over a real websocket", { timeout: 20_000 }, async () => {
  const port = await freePort(), serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), ".."), folder = mkdtempSync(join(tmpdir(), "abyss-guild-ws-"));
  const child = spawn(process.execPath, ["server.js"], {
    cwd: serverDirectory,
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), FRIEND_STATE_FILE: join(folder, "friends.json"), GUILD_STATE_FILE: join(folder, "guilds.json") },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const clients = []; let stderr = "";
  child.stderr.on("data", chunk => stderr += chunk);
  try {
    await Promise.race([
      new Promise((resolveReady, rejectReady) => {
        child.stdout.on("data", chunk => { if (String(chunk).includes("Online home, exploration, raid")) resolveReady(); });
        child.once("exit", code => rejectReady(new Error(`server ${code}: ${stderr}`)));
      }),
      new Promise((_, rejectReady) => setTimeout(() => rejectReady(new Error("startup timeout")), 5_000))
    ]);
    const url = `ws://127.0.0.1:${port}/party`;
    for (let index = 0; index < 2; index++) {
      const client = wsClient(url); clients.push(client); await client.open();
      client.send({ type: "hello", protocol: "1.16.0", ...identity(index + 40) });
      const ack = await client.wait(message => message.type === "helloAck", "hello");
      assert.equal(ack.capabilities.guildsV1, true);
      assert.equal(ack.guildState.guild, null);
    }

    clients[0].send({ type: "guildCreate", name: "通信旅団", tag: "WS", description: "実通信テスト" });
    const created = await clients[0].wait(message => message.type === "guildState" && message.state.guild?.name === "通信旅団", "guild create");
    const guildId = created.state.guild.guildId;
    clients[1].send({ type: "guildLookup", guildId });
    const lookup = await clients[1].wait(message => message.type === "guildLookupResult" && message.guild?.guildId === guildId, "guild lookup");
    assert.equal(lookup.guild.memberCount, 1);

    clients[1].send({ type: "guildApply", guildId });
    await clients[0].wait(message => message.type === "guildState" && message.state.guild?.applications?.length === 1, "guild application");
    clients[0].send({ type: "guildApplicationRespond", targetId: identity(41).friendId, accepted: true });
    await clients[1].wait(message => message.type === "guildState" && message.state.guild?.memberCount === 2, "guild approval");
    clients[0].send({ type: "guildChat", text: "深淵で会おう！" });
    const chatted = await clients[1].wait(message => message.type === "guildState" && message.state.guild?.chat?.at(-1)?.text === "深淵で会おう!", "guild chat");
    assert.equal(chatted.state.guild.members.length, 2);
  } finally {
    for (const client of clients) client.close();
    if (child.exitCode === null) child.kill("SIGTERM");
    await Promise.race([new Promise(resolveExit => child.once("exit", resolveExit)), new Promise(resolveExit => setTimeout(resolveExit, 1_500))]);
  }
});
