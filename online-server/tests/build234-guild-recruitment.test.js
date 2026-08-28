import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import net from "node:net";
import { WebSocket } from "ws";
import { GUILD_RECRUITMENT_TTL_MS } from "../src/GuildCoordinator.js";
import { RoomStore } from "../src/RoomStore.js";

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function playerCode(index) {
  let value = Math.max(0, Number(index) || 0), code = "";
  for (let position = 0; position < 8; position++) { code = ID_ALPHABET[value % ID_ALPHABET.length] + code; value = Math.floor(value / ID_ALPHABET.length); }
  return `AD-${code.slice(0, 4)}-${code.slice(4)}`;
}

function identity(index) {
  return { friendId: playerCode(2_000 + index), clientKey: `build234-recruitment-client-${index}`.padEnd(32, "x"), profile: { displayName: `募集者${index + 1}`, monsterName: `相棒${index + 1}`, speciesId: "slime", fallbackEmoji: "🫧", level: index + 1, maxFloor: 120 } };
}

function connection() { return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} }; }
function hello(store, index) { const conn = connection(), result = store.hello(conn, identity(index)); assert.equal(result.ok, true, result.message); return { conn, session: conn.session, result }; }
function createGuild(store, owner) { const result = store.createGuild(owner.session, { name: "募集旅団", tag: "RECR", description: "ギルド限定募集のテスト" }); assert.equal(result.ok, true, result.message); return result.guild; }
function joinGuild(store, owner, member, guildId) { assert.equal(store.applyGuild(member.session, guildId).ok, true); assert.equal(store.respondGuildApplication(owner.session, member.session.playerId, true).ok, true); }
function befriend(store, left, right) { assert.equal(store.requestFriend(left.session, right.session.playerId).ok, true); assert.equal(store.respondFriend(right.session, left.session.playerId, true).ok, true); }

test("build234 creates a sanitized member-only guild recruitment without leaking room or guild IDs", () => {
  let now = 100_000; const store = new RoomStore({ now: () => now, randomRoomCode: () => "GUILD1" }), owner = hello(store, 0), member = hello(store, 1), outsider = hello(store, 2), guild = createGuild(store, owner);
  joinGuild(store, owner, member, guild.guildId);
  const room = store.createRoom(owner.session, { published: true, purpose: "raid", style: "fast" }).room;
  const publicListingId = store.rooms.get(room.roomId).listing.listingId;
  const conflict = store.createGuildRecruitment(owner.session, { purpose: "raid", style: "help" });
  assert.equal(conflict.code, "RECRUITMENT_MODE_CONFLICT");
  assert.equal(store.rooms.get(room.roomId).listing.listingId, publicListingId, "a rejected mode switch must not mutate the public listing");
  assert.equal(store.guildState(member.session).state.guild.recruitments.length, 0);
  assert.equal(store.setRoomListing(owner.session, { published: false }).ok, true);
  const created = store.createGuildRecruitment(owner.session, { purpose: "raid", style: "help", note: `Ａ\u0000Ｂ\u202eＣ${"長".repeat(60)}` });
  assert.equal(created.ok, true);
  assert.match(created.recruitment.recruitmentId, /^[A-Za-z0-9_-]{18,}$/);
  assert.equal(created.recruitment.note.length, 48);
  assert.match(created.recruitment.note, /^ABC/);
  assert.equal(created.recruitment.expiresAt - created.recruitment.createdAt, GUILD_RECRUITMENT_TTL_MS);
  assert.equal(store.rooms.get(room.roomId).listing.published, false, "guild and public recruitment must be mutually exclusive");
  const state = store.guildState(member.session).state.guild, card = state.recruitments[0];
  assert.equal(card.purpose, "raid"); assert.equal(card.style, "help"); assert.equal(card.count, 1); assert.equal(card.slots, 3);
  assert.equal("roomId" in card, false); assert.equal("guildId" in card, false);
  assert.equal(store.guildState(outsider.session).state.guild, null);
  const lookup = store.lookupGuild(outsider.session, guild.guildId).guild;
  assert.equal("recruitments" in lookup, false, "public guild DTOs must never expose recruitment data");
  assert.equal(store.updateProfile(owner.session, { ...identity(0).profile, displayName: "更新した募集主" }).ok, true);
  assert.equal(store.guildState(member.session).state.guild.recruitments[0].host.displayName, "更新した募集主");

  now += 2_000;
  const guildRecruitmentId = created.recruitment.recruitmentId;
  assert.equal(store.setRoomListing(owner.session, { published: true, purpose: "explore", style: "anyone" }).code, "RECRUITMENT_MODE_CONFLICT");
  assert.equal(store.guildState(member.session).state.guild.recruitments[0].recruitmentId, guildRecruitmentId, "a rejected mode switch must not close the guild recruitment");
  assert.equal(store.closeGuildRecruitment(owner.session, guildRecruitmentId).ok, true);
  assert.equal(store.setRoomListing(owner.session, { published: true, purpose: "explore", style: "anyone" }).ok, true, "a rejected conflict must not consume the public-listing cooldown");
});

test("build234 same-guild admission cannot be bypassed with raw room IDs or friend invitations", () => {
  const store = new RoomStore({ randomRoomCode: () => "GUARD1" }), owner = hello(store, 10), member = hello(store, 11), outsider = hello(store, 12), guild = createGuild(store, owner);
  joinGuild(store, owner, member, guild.guildId); befriend(store, owner, member); befriend(store, owner, outsider);
  const room = store.createRoom(owner.session).room;
  const invitationBeforeScope = store.inviteFriend(owner.session, outsider.session.playerId); assert.equal(invitationBeforeScope.ok, true);
  const recruitment = store.createGuildRecruitment(owner.session, { note: "ギルドだけ" }); assert.equal(recruitment.ok, true);

  assert.equal(store.friendState(outsider.session).state.friends[0].roomId, null);
  assert.equal(store.friendState(outsider.session).state.invites.length, 0, "an older friend invite must not leak a newly scoped room");
  assert.equal(store.inviteFriend(owner.session, outsider.session.playerId).code, "GUILD_RECRUITMENT_FORBIDDEN");
  assert.equal(store.respondFriendInvite(outsider.session, invitationBeforeScope.inviteId, true).code, "GUILD_RECRUITMENT_FORBIDDEN");
  assert.equal(store.joinRoom(outsider.session, room.roomId).code, "GUILD_RECRUITMENT_FORBIDDEN");
  assert.equal(store.joinGuildRecruitment(outsider.session, recruitment.recruitment.recruitmentId).code, "GUILD_RECRUITMENT_UNAVAILABLE");

  const memberInvite = store.inviteFriend(owner.session, member.session.playerId); assert.equal(memberInvite.ok, true);
  assert.equal(store.friendState(member.session).state.friends[0].roomId, room.roomId);
  assert.equal(store.respondFriendInvite(member.session, memberInvite.inviteId, true).ok, true);
  assert.equal(member.session.roomId, room.roomId);
});

test("build234 opaque join reuses room admission and a rejected join never leaves current active content", () => {
  let code = 0; const store = new RoomStore({ randomRoomCode: () => `R${String(++code).padStart(5, "0")}` }), owner = hello(store, 20), member = hello(store, 21), guild = createGuild(store, owner);
  joinGuild(store, owner, member, guild.guildId);
  const target = store.createRoom(owner.session).room, recruitment = store.createGuildRecruitment(owner.session, { purpose: "explore" }).recruitment;
  const current = store.createRoom(member.session).room; store.rooms.get(current.roomId).phase = "expedition";
  const blocked = store.joinGuildRecruitment(member.session, recruitment.recruitmentId);
  assert.equal(blocked.code, "CURRENT_ROOM_BUSY"); assert.equal(member.session.roomId, current.roomId); assert.equal(store.rooms.get(current.roomId).members.has(member.session.playerId), true);
  store.rooms.get(current.roomId).phase = "lobby";
  assert.equal(store.joinGuildRecruitment(member.session, "wrong-token").code, "GUILD_RECRUITMENT_UNAVAILABLE");
  assert.equal(member.session.roomId, current.roomId, "a bad opaque ID must not move the player");
  assert.equal(store.joinGuildRecruitment(member.session, recruitment.recruitmentId).ok, true);
  assert.equal(member.session.roomId, target.roomId);
});

test("build234 recreation rotates the nonce, close bypasses create cooldown, and stale close cannot close a newer post", () => {
  let now = 1_000; const store = new RoomStore({ now: () => now, randomRoomCode: () => "ROTATE" }), owner = hello(store, 30); createGuild(store, owner); store.createRoom(owner.session);
  const first = store.createGuildRecruitment(owner.session, { note: "first" }); assert.equal(first.ok, true);
  assert.equal(store.createGuildRecruitment(owner.session, { note: "too soon" }).code, "GUILD_RECRUITMENT_RATE");
  assert.equal(store.closeGuildRecruitment(owner.session, first.recruitment.recruitmentId).ok, true, "close must not be rate limited");
  now += 2_000;
  const second = store.createGuildRecruitment(owner.session, { note: "second" }); assert.equal(second.ok, true); assert.notEqual(second.recruitment.recruitmentId, first.recruitment.recruitmentId);
  assert.equal(store.closeGuildRecruitment(owner.session, first.recruitment.recruitmentId).code, "GUILD_RECRUITMENT_UNAVAILABLE");
  assert.equal(store.guildState(owner.session).state.guild.recruitments[0].recruitmentId, second.recruitment.recruitmentId);
  assert.equal(store.closeGuildRecruitment(owner.session, second.recruitment.recruitmentId).ok, true);
  assert.equal(store.guildState(owner.session).state.guild.recruitments.length, 0);
});

test("build234 automatically closes recruitment and admission scope on TTL, full rooms and content start", () => {
  let now = 50_000, code = 0; const store = new RoomStore({ now: () => now, randomRoomCode: () => `A${String(++code).padStart(5, "0")}` });
  const owner = hello(store, 40), members = [hello(store, 41), hello(store, 42), hello(store, 43)], outsider = hello(store, 44), guild = createGuild(store, owner); for (const member of members) joinGuild(store, owner, member, guild.guildId);

  const ttlRoom = store.createRoom(owner.session).room; store.createGuildRecruitment(owner.session, {}); now += GUILD_RECRUITMENT_TTL_MS + 1; store.pruneExpired();
  assert.equal(store.rooms.get(ttlRoom.roomId).guildAudienceId, null); assert.equal(store.guildState(owner.session).state.guild.recruitments.length, 0);
  assert.equal(store.joinRoom(outsider.session, ttlRoom.roomId).ok, true, "scope ends when the recruitment expires"); store.leaveRoom(outsider.session);

  const fullRoom = ttlRoom; now += 2_000; store.createGuildRecruitment(owner.session, {});
  for (const member of members) assert.equal(store.joinGuildRecruitment(member.session, store.guildState(owner.session).state.guild.recruitments[0].recruitmentId).ok, true);
  assert.equal(store.rooms.get(fullRoom.roomId).members.size, 4); assert.equal(store.rooms.get(fullRoom.roomId).guildAudienceId, null); assert.equal(store.guildState(owner.session).state.guild.recruitments.length, 0);
  for (const member of members) store.leaveRoom(member.session);

  now += 2_000; const started = store.createGuildRecruitment(owner.session, {}); assert.equal(started.ok, true); assert.equal(store.setReady(owner.session, true).ok, true); assert.equal(store.startExpedition(owner.session, {}).ok, true);
  assert.equal(store.rooms.get(fullRoom.roomId).guildAudienceId, null); assert.equal(store.guildState(owner.session).state.guild.recruitments.length, 0);
});

test("build234 closes recruitment on host disconnect, leader departure, room deletion and guild membership invalidation", () => {
  let now = 90_000, code = 0; const store = new RoomStore({ now: () => now, randomRoomCode: () => `L${String(++code).padStart(5, "0")}` }), leader = hello(store, 50), host = hello(store, 51), member = hello(store, 52), outsider = hello(store, 53), guild = createGuild(store, leader);
  joinGuild(store, leader, host, guild.guildId); joinGuild(store, leader, member, guild.guildId);
  befriend(store, host, outsider);

  let room = store.createRoom(host.session).room; store.createGuildRecruitment(host.session, {}); store.disconnect(host.session, host.conn);
  assert.equal(store.rooms.get(room.roomId).guildAudienceId, null); assert.equal(store.guildState(leader.session).state.guild.recruitments.length, 0);
  const replacement = connection(), resumed = store.hello(replacement, { ...identity(51), resumeToken: host.result.resumeToken }); assert.equal(resumed.ok, true); host.conn = replacement; host.session = replacement.session;

  now += 2_000; store.createGuildRecruitment(host.session, {}); assert.equal(store.joinGuildRecruitment(member.session, store.guildState(leader.session).state.guild.recruitments[0].recruitmentId).ok, true); store.leaveRoom(host.session);
  assert.equal(store.rooms.get(room.roomId).guildAudienceId, null, "leader change closes the post"); store.leaveRoom(member.session);

  room = store.createRoom(host.session).room; now += 2_000; store.createGuildRecruitment(host.session, {}); store.leaveRoom(host.session);
  assert.equal(store.rooms.has(room.roomId), false); assert.equal(store.guildState(leader.session).state.guild.recruitments.length, 0);

  room = store.createRoom(host.session).room; now += 2_000; store.createGuildRecruitment(host.session, {});
  assert.equal(store.friendState(outsider.session).state.friends.find(entry => entry.playerId === host.session.playerId).roomId, null);
  outsider.conn.messages.length = 0;
  assert.equal(store.kickGuild(leader.session, host.session.playerId).ok, true);
  assert.equal(store.rooms.get(room.roomId).guildAudienceId, null); assert.equal(store.guildState(leader.session).state.guild.recruitments.length, 0);
  const pushed = outsider.conn.messages.filter(message => message.type === "friendState");
  assert.ok(pushed.length > 0, "membership invalidation must immediately fan out friend visibility");
  assert.equal(pushed.at(-1).state.friends.find(entry => entry.playerId === host.session.playerId).roomId, room.roomId);
});

test("build234 persistence rollback preserves guild membership, recruitment nonce and room scope", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-recruit-rollback-")), store = new RoomStore({ guildStateFile: join(folder, "guilds.json"), randomRoomCode: () => "ROLLBK" });
  const leader = hello(store, 60), host = hello(store, 61), guild = createGuild(store, leader); joinGuild(store, leader, host, guild.guildId);
  const room = store.createRoom(host.session).room, recruitment = store.createGuildRecruitment(host.session, {}).recruitment;
  const originalSave = store.guilds._save.bind(store.guilds);
  store.guilds._save = () => { store.guilds.lastPersistenceError = new Error("injected save failure"); return false; };
  const failed = store.kickGuild(leader.session, host.session.playerId);
  store.guilds._save = originalSave;
  assert.equal(failed.code, "PERSISTENCE_ERROR");
  assert.equal(store.guilds.memberships.get(host.session.playerId), guild.guildId);
  assert.equal(store.rooms.get(room.roomId).guildAudienceId, guild.guildId);
  assert.equal(store.rooms.get(room.roomId).guildRecruitmentId, recruitment.recruitmentId);
  assert.equal(store.guildState(leader.session).state.guild.recruitments[0].recruitmentId, recruitment.recruitmentId);
});

async function freePort() { const socket = net.createServer(); await new Promise((ok, no) => { socket.once("error", no); socket.listen(0, "127.0.0.1", ok); }); const port = socket.address().port; await new Promise(ok => socket.close(ok)); return port; }
function wsClient(url) {
  const socket = new WebSocket(url), inbox = [], waiters = [];
  socket.on("message", raw => { const message = JSON.parse(raw), index = waiters.findIndex(entry => entry.test(message)); if (index < 0) inbox.push(message); else { const [entry] = waiters.splice(index, 1); clearTimeout(entry.timer); entry.ok(message); } });
  return { socket, open: () => new Promise((ok, no) => { socket.once("open", ok); socket.once("error", no); }), send: message => socket.send(JSON.stringify(message)), wait(testMessage, label) { const index = inbox.findIndex(testMessage); if (index >= 0) return Promise.resolve(inbox.splice(index, 1)[0]); return new Promise((ok, no) => { const entry = { test: testMessage, ok, timer: setTimeout(() => no(new Error(`${label} timeout; inbox=${JSON.stringify(inbox)}`)), 4_000) }; waiters.push(entry); }); }, close: () => socket.close() };
}

test("build234 capability and guild recruitment create/close routes work over a real websocket", { timeout: 20_000 }, async () => {
  const port = await freePort(), serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), ".."), folder = mkdtempSync(join(tmpdir(), "abyss-guild-recruit-ws-"));
  const child = spawn(process.execPath, ["server.js"], { cwd: serverDirectory, env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), FRIEND_STATE_FILE: join(folder, "friends.json"), GUILD_STATE_FILE: join(folder, "guilds.json") }, stdio: ["ignore", "pipe", "pipe"] });
  let client = null, stderr = ""; child.stderr.on("data", chunk => stderr += chunk);
  try {
    await Promise.race([new Promise((ok, no) => { child.stdout.on("data", chunk => { if (String(chunk).includes("Online home, exploration, raid")) ok(); }); child.once("exit", code => no(new Error(`server ${code}: ${stderr}`))); }), new Promise((_, no) => { const timer = setTimeout(() => no(new Error("startup timeout")), 5_000); timer.unref?.(); })]);
    client = wsClient(`ws://127.0.0.1:${port}/party`); await client.open(); client.send({ type: "hello", protocol: "1.16.0", ...identity(90) }); const ack = await client.wait(message => message.type === "helloAck", "hello"); assert.equal(ack.capabilities.guildPartyRecruitmentV1, true);
    client.send({ type: "guildCreate", name: "通信募集団", tag: "WS" }); await client.wait(message => message.type === "guildState" && message.state.guild?.guildId, "guild create");
    client.send({ type: "createRoom" }); await client.wait(message => message.type === "roomState", "room create");
    client.send({ type: "guildRecruitmentCreate", purpose: "raid", style: "help", note: "通信募集" }); const state = await client.wait(message => message.type === "guildState" && message.state.guild?.recruitments?.length === 1, "recruitment create");
    const recruitmentId = state.state.guild.recruitments[0].recruitmentId; client.send({ type: "guildRecruitmentClose", recruitmentId }); await client.wait(message => message.type === "guildState" && message.state.guild?.recruitments?.length === 0, "recruitment close");
  } finally { client?.close(); if (child.exitCode === null) { child.kill("SIGTERM"); await Promise.race([new Promise(ok => child.once("exit", ok)), new Promise(ok => setTimeout(ok, 1_500))]); } }
});
