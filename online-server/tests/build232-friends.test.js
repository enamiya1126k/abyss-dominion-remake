import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import net from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { WebSocket } from "ws";
import { RoomStore } from "../src/RoomStore.js";

function connection() { return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} }; }
function identity(index) {
  const suffixes = ["BBBB", "CCCC", "DDDD", "EEEE", "FFFF", "GGGG"];
  return { friendId: `AD-ABCD-${suffixes[index]}`, clientKey: `build232-friend-client-${index}`.padEnd(32, "x"), profile: { displayName: `冒険者${index + 1}`, monsterName: `相棒${index + 1}`, speciesId: "slime", fallbackEmoji: "🫧" } };
}
function hello(store, index) { const conn = connection(), result = store.hello(conn, identity(index)); assert.equal(result.ok, true); return { conn, session: conn.session, result }; }

test("build232 friend requests require approval and persist across a server restart", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-friends-")), stateFile = join(folder, "friends.json");
  const first = new RoomStore({ friendStateFile: stateFile }), left = hello(first, 0), right = hello(first, 1);
  assert.equal(first.requestFriend(left.session, right.session.playerId).ok, true);
  assert.equal(first.friendState(right.session).state.incoming[0].playerId, left.session.playerId);
  assert.equal(first.respondFriend(right.session, left.session.playerId, true).ok, true);
  assert.equal(first.friendState(left.session).state.friends[0].playerId, right.session.playerId);
  const stored = JSON.parse(readFileSync(stateFile, "utf8")); assert.equal(stored.version, 2);
  const restarted = new RoomStore({ friendStateFile: stateFile });
  assert.equal(restarted.hello(connection(), { ...identity(0), clientKey: "attacker-client-secret".padEnd(32, "x") }).code, "ID_IN_USE");
  const resumed = hello(restarted, 0);
  assert.equal(restarted.friendState(resumed.session).state.friends[0].playerId, identity(1).friendId);
  assert.equal(restarted.friendState(resumed.session).state.friends[0].online, false);
  assert.equal("credentialHash" in restarted.friendState(resumed.session).state.friends[0], false);
});

test("build232 supports offline pending requests, removal and blocking", () => {
  const store = new RoomStore(), left = hello(store, 0), right = hello(store, 1);
  store.disconnect(right.session, right.conn);
  assert.equal(store.requestFriend(left.session, right.session.playerId).ok, true);
  const replacement = connection(), resumed = store.hello(replacement, { ...identity(1), resumeToken: right.result.resumeToken });
  assert.equal(resumed.friendState.incoming[0].playerId, left.session.playerId);
  assert.equal(store.blockFriend(replacement.session, left.session.playerId).ok, true);
  assert.equal(store.requestFriend(left.session, replacement.session.playerId).code, "FRIEND_NOT_FOUND");
  assert.equal(store.friendState(left.session).state.friends.length, 0);
});

test("build232 room invitations are friend-only, expire and can join exactly once", () => {
  let now = 10_000, code = 0; const store = new RoomStore({ now: () => now, randomRoomCode: () => `FRND${++code}X`.slice(0, 6) });
  const host = hello(store, 0), guest = hello(store, 1), stranger = hello(store, 2);
  const created = store.createRoom(host.session); assert.equal(created.ok, true);
  assert.equal(store.inviteFriend(host.session, guest.session.playerId).code, "FRIEND_REQUIRED");
  store.requestFriend(host.session, guest.session.playerId); store.respondFriend(guest.session, host.session.playerId, true);
  const invitation = store.inviteFriend(host.session, guest.session.playerId); assert.equal(invitation.ok, true);
  const state = store.friendState(guest.session).state; assert.equal(state.invites[0].roomId, created.room.roomId);
  assert.equal(store.respondFriendInvite(guest.session, invitation.inviteId, true).ok, true);
  assert.equal(guest.session.roomId, created.room.roomId);
  assert.equal(store.respondFriendInvite(guest.session, invitation.inviteId, true).code, "FRIEND_INVITE_MISSING");
  assert.equal(store.inviteFriend(host.session, stranger.session.playerId).code, "FRIEND_REQUIRED");
  store.requestFriend(host.session, stranger.session.playerId); store.respondFriend(stranger.session, host.session.playerId, true);
  const expiring = store.inviteFriend(host.session, stranger.session.playerId); now += 120_001;
  assert.equal(store.respondFriendInvite(stranger.session, expiring.inviteId, true).code, "FRIEND_INVITE_MISSING");
});

test("build232 pushes online and joinable presence without leaking non-friend rooms", () => {
  const store = new RoomStore({ randomRoomCode: () => "PRES23" }), left = hello(store, 0), right = hello(store, 1), stranger = hello(store, 2);
  store.requestFriend(left.session, right.session.playerId); store.respondFriend(right.session, left.session.playerId, true);
  store.createRoom(left.session);
  const friend = store.friendState(right.session).state.friends[0]; assert.equal(friend.online, true); assert.equal(friend.roomJoinable, true); assert.equal(friend.roomId, "PRES23");
  const outsider = store.friendState(stranger.session).state; assert.equal(outsider.friends.length, 0);
  store.disconnect(left.session, left.conn);
  assert.equal(store.friendState(right.session).state.friends[0].online, false);
});

async function freePort() { const socket = net.createServer(); await new Promise((ok, no) => { socket.once("error", no); socket.listen(0, "127.0.0.1", ok); }); const port = socket.address().port; await new Promise(ok => socket.close(ok)); return port; }
function wsClient(url) {
  const socket = new WebSocket(url), inbox = [], waiters = [];
  socket.on("message", raw => { const message = JSON.parse(raw); const index = waiters.findIndex(entry => entry.test(message)); if (index < 0) inbox.push(message); else { const [entry] = waiters.splice(index, 1); clearTimeout(entry.timer); entry.ok(message); } });
  return { socket, open: () => new Promise((ok, no) => { socket.once("open", ok); socket.once("error", no); }), send: message => socket.send(JSON.stringify(message)), wait(test, label) { const index = inbox.findIndex(test); if (index >= 0) return Promise.resolve(inbox.splice(index, 1)[0]); return new Promise((ok, no) => { const entry = { test, ok, timer: setTimeout(() => no(new Error(`${label} timeout`)), 4000) }; waiters.push(entry); }); }, close: () => socket.close() };
}

test("build232 friend request, approval and room invitation work over real websocket", { timeout: 20_000 }, async () => {
  const port = await freePort(), serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), ".."), folder = mkdtempSync(join(tmpdir(), "abyss-friend-ws-"));
  const child = spawn(process.execPath, ["server.js"], { cwd: serverDirectory, env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), FRIEND_STATE_FILE: join(folder, "friends.json") }, stdio: ["ignore", "pipe", "pipe"] });
  const clients = []; let stderr = ""; child.stderr.on("data", chunk => stderr += chunk);
  try {
    await Promise.race([new Promise((ok, no) => { child.stdout.on("data", chunk => { if (String(chunk).includes("Online home, exploration, raid")) ok(); }); child.once("exit", code => no(new Error(`server ${code}: ${stderr}`))); }), new Promise((_, no) => setTimeout(() => no(new Error("startup timeout")), 5000))]);
    const url = `ws://127.0.0.1:${port}/party`;
    for (let index = 0; index < 2; index++) { const client = wsClient(url); clients.push(client); await client.open(); client.send({ type: "hello", protocol: "1.16.0", ...identity(index) }); const ack = await client.wait(message => message.type === "helloAck", "hello"); assert.equal(ack.capabilities.friendsV1, true); }
    clients[0].send({ type: "friendRequest", targetId: identity(1).friendId }); await clients[1].wait(message => message.type === "friendState" && message.state.incoming.length === 1, "request");
    clients[1].send({ type: "friendRespond", targetId: identity(0).friendId, accepted: true }); await clients[0].wait(message => message.type === "friendState" && message.state.friends.length === 1, "approval");
    clients[0].send({ type: "createRoom" }); const room = await clients[0].wait(message => message.type === "roomState", "room");
    clients[0].send({ type: "friendRoomInvite", targetId: identity(1).friendId }); const invite = await clients[1].wait(message => message.type === "friendState" && message.state.invites.length === 1, "invite");
    clients[1].send({ type: "friendInviteRespond", inviteId: invite.state.invites[0].inviteId, accepted: true }); const joined = await clients[1].wait(message => message.type === "roomState" && message.room.members.length === 2, "join"); assert.equal(joined.room.roomId, room.room.roomId);
  } finally { for (const client of clients) client.close(); if (child.exitCode === null) child.kill("SIGTERM"); await Promise.race([new Promise(ok => child.once("exit", ok)), new Promise(ok => setTimeout(ok, 1500))]); }
});
