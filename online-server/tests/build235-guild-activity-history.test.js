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

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function playerCode(index) {
  let value = Math.max(0, Number(index) || 0), code = "";
  for (let position = 0; position < 8; position++) { code = ALPHABET[value % ALPHABET.length] + code; value = Math.floor(value / ALPHABET.length); }
  return `AD-${code.slice(0, 4)}-${code.slice(4)}`;
}

function identity(index) {
  return { friendId: playerCode(4_000 + index), clientKey: `build235-activity-client-${index}`.padEnd(32, "x"), profile: { displayName: `活動者${index + 1}`, monsterName: `相棒${index + 1}`, speciesId: "slime", fallbackEmoji: "🫧", level: 10, maxFloor: 500 } };
}

function connection() { return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} }; }
function hello(store, index) { const conn = connection(), result = store.hello(conn, identity(index)); assert.equal(result.ok, true, result.message); return { conn, session: conn.session, result }; }
function createGuild(store, owner, suffix = "A") { const result = store.createGuild(owner.session, { name: `活動旅団${suffix}`, tag: `A${suffix}`, description: "共有目標と活動履歴" }); assert.equal(result.ok, true, result.message); return result.guild; }
function joinGuild(store, owner, member, guildId) { assert.equal(store.applyGuild(member.session, guildId).ok, true); assert.equal(store.respondGuildApplication(owner.session, member.session.playerId, true).ok, true); }
function ranking(...players) { return players.map(player => ({ playerId: player.session.playerId })); }
function completedExpedition(id, players, floor = 123) { return { type: "expeditionEnded", summary: { id, completed: true, floor, ranking: ranking(...players) } }; }

test("build235 migrates v1 goal counts once, writes the current schema, keeps shared data member-only and rejects future schemas", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-activity-v1-")), stateFile = join(folder, "guilds.json"), now = Date.UTC(2026, 7, 27, 0, 0, 0), ownerId = identity(0).friendId;
  const eventIds = ["expeditionEnded:e1", "expeditionEnded:e1", "expeditionEnded:e2", "floorBossDefeated:b1", "expeditionEvent:b2", "raidEnded:r1", "teamBattleEnded:t1", "teamBattleEnded:t2", "teamBattleEnded:t3", "resonanceEnded:z1"];
  writeFileSync(stateFile, JSON.stringify({ version: 1, guilds: [{ guildId: "GD-ABCD23", name: "旧活動旅団", tag: "OLD", description: "v1", leaderId: ownerId, officerIds: [], memberIds: [ownerId], joinedAt: { [ownerId]: now - 1_000 }, createdAt: now - 1_000, totalXp: 99, week: { weekId: "2026-08-24", points: 99, memberPoints: { [ownerId]: 99 }, eventIds, checkIns: {} }, chat: [] }], applications: {}, invites: [], checkIns: {} }), "utf8");
  const store = new RoomStore({ now: () => now, guildStateFile: stateFile }), owner = hello(store, 0), outsider = hello(store, 1), state = store.guildState(owner.session).state.guild;
  assert.deepEqual(state.week.sharedGoals.map(goal => [goal.id, goal.current, goal.target, goal.completed]), [["expedition", 2, 3, false], ["boss", 2, 3, false], ["raid", 1, 1, true], ["team", 3, 3, true], ["resonance", 1, 1, true]]);
  assert.deepEqual(state.activities, []);
  const publicGuild = store.lookupGuild(outsider.session, state.guildId).guild;
  assert.equal("sharedGoals" in publicGuild.week, false); assert.equal("activities" in publicGuild, false); assert.equal("activity" in publicGuild, false);
  assert.equal(store.guildChat(owner.session, "v2へ保存").ok, true);
  const saved = JSON.parse(readFileSync(stateFile, "utf8")); assert.equal(saved.version, 3); assert.deepEqual(saved.guilds[0].week.goalCounts, { expedition: 2, boss: 2, raid: 1, team: 3, resonance: 1 }); assert.deepEqual(saved.guilds[0].activity, []);

  for (const [index, version] of [4, 1.5, 0, -1, "3"].entries()) { const invalidVersion = join(folder, `version-invalid-${index}.json`); writeFileSync(invalidVersion, JSON.stringify({ version, guilds: [] }), "utf8"); assert.throws(() => new RoomStore({ guildStateFile: invalidVersion }), /Guild state could not be loaded/); }
  const invalidDates = structuredClone(saved); invalidDates.guilds[0].week.weekId = "9999-99-99"; invalidDates.guilds[0].week.points = 777; invalidDates.guilds[0].week.checkIns = { [ownerId]: "9999-99-99" }; invalidDates.checkIns = { [ownerId]: "9999-99-99" }; const invalidDateFile = join(folder, "invalid-dates.json"); writeFileSync(invalidDateFile, JSON.stringify(invalidDates), "utf8");
  const recovered = new RoomStore({ now: () => now, guildStateFile: invalidDateFile }), recoveredOwner = hello(recovered, 0), recoveredState = recovered.guildState(recoveredOwner.session).state.guild; assert.equal(recoveredState.week.weekId, "2026-08-24"); assert.equal(recoveredState.week.points, 0); assert.equal(recoveredState.checkedInToday, false); assert.equal(recovered.checkInGuild(recoveredOwner.session).points, 10);
});

test("build235 records grouped check-ins and all six multiplayer activity kinds with exact points and private DTOs", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-activity-all-")), stateFile = join(folder, "guilds.json"), now = Date.UTC(2026, 7, 27, 3, 0, 0), store = new RoomStore({ now: () => now, guildStateFile: stateFile }), owner = hello(store, 10), member = hello(store, 11), outsider = hello(store, 12), guild = createGuild(store, owner);
  joinGuild(store, owner, member, guild.guildId); assert.equal(store.checkInGuild(owner.session).points, 10); assert.equal(store.checkInGuild(member.session).points, 10);
  const room = { members: new Set([owner.session.playerId, member.session.playerId]), selectedFloor: 321 }, list = ranking(owner, member), messages = [
    completedExpedition("exp-all", [owner, member], 321),
    { type: "floorBossDefeated", floor: 321, summary: { id: "floor-all", floor: 321, ranking: list } },
    { type: "expeditionEvent", event: { id: "coop-all", kind: "coopBossDefeated", floor: 321 } },
    { type: "raidEnded", result: "victory", raid: { progress: { campaignId: "raid-all", floor: 321 } }, ranking: list },
    { type: "teamBattleEnded", resultId: "team-all", result: "draw", summary: { ranking: list } },
    { type: "resonanceEnded", result: { victory: true }, resonance: { id: "res-all", players: list } }
  ];
  store._broadcast(room, messages[0]);
  assert.equal(store.guildState(owner.session).state.guild.week.sharedGoals.find(goal => goal.id === "resonance").current, 1, "a completed multiplayer expedition advances the legacy co-op goal");
  for (const message of messages.slice(1)) store._broadcast(room, message);
  let state = store.guildState(owner.session).state.guild;
  assert.equal(state.week.points, 156); assert.equal(state.members.find(entry => entry.playerId === owner.session.playerId).weekPoints, 78); assert.equal(state.members.find(entry => entry.playerId === member.session.playerId).weekPoints, 78);
  assert.deepEqual(state.week.sharedGoals.map(goal => goal.current), [1, 2, 1, 1, 1]);
  assert.deepEqual(state.activities.map(entry => entry.kind), ["resonance", "team", "raid", "coopBoss", "floorBoss", "expedition", "checkIn"]);
  const checkIn = state.activities.at(-1); assert.equal(checkIn.points, 20); assert.equal(checkIn.actors.length, 2); assert.equal("weekId" in checkIn, false); assert.equal("day" in checkIn, false);
  for (const activity of state.activities) {
    assert.match(activity.activityId, /^[A-Za-z0-9_-]{18,}$/); assert.ok(activity.at > 0); assert.deepEqual(Object.keys(activity.actors[0]).sort(), ["displayName", "fallbackEmoji"]);
    for (const forbidden of ["roomId", "guildId", "playerId", "sourceId", "eventId", "text", "message"]) assert.equal(forbidden in activity, false);
  }
  assert.equal(JSON.stringify(state.activities).includes("exp-all"), false); assert.equal(JSON.stringify(state.activities).includes(owner.session.playerId), false);
  const publicGuild = store.lookupGuild(outsider.session, guild.guildId).guild; assert.equal("activities" in publicGuild, false); assert.equal("sharedGoals" in publicGuild.week, false);
  for (const message of messages) store._broadcast(room, message); state = store.guildState(owner.session).state.guild; assert.equal(state.week.points, 156); assert.equal(state.activities.length, 7);
  const saved = JSON.parse(readFileSync(stateFile, "utf8")); assert.deepEqual(saved.guilds[0].activity.map(entry => entry.kind), ["checkIn", "expedition", "floorBoss", "coopBoss", "raid", "team", "resonance"]); assert.equal(JSON.stringify(saved.guilds[0].activity).includes("exp-all"), false);
});

test("build235 resets exactly Monday 09:00 JST, rejects a cross-week replay after restart and never rolls a future week backward", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-week-boundary-")), stateFile = join(folder, "guilds.json"); let now = Date.UTC(2026, 7, 23, 23, 59, 59);
  let store = new RoomStore({ now: () => now, guildStateFile: stateFile }), owner = hello(store, 20), member = hello(store, 21), guild = createGuild(store, owner); joinGuild(store, owner, member, guild.guildId);
  const room = { members: new Set([owner.session.playerId, member.session.playerId]), selectedFloor: 50 }, event = completedExpedition("boundary-event", [owner, member], 50);
  store._broadcast(room, event); assert.equal(store.guildState(owner.session).state.guild.week.weekId, "2026-08-17"); assert.equal(store.guildState(owner.session).state.guild.week.points, 10);
  now += 2_000; store = new RoomStore({ now: () => now, guildStateFile: stateFile }); owner = hello(store, 20); member = hello(store, 21); const restartedRoom = { members: new Set([owner.session.playerId, member.session.playerId]), selectedFloor: 50 };
  store._broadcast(restartedRoom, event); let state = store.guildState(owner.session).state.guild; assert.equal(state.week.weekId, "2026-08-24"); assert.equal(state.week.points, 0); assert.deepEqual(state.week.sharedGoals.map(goal => goal.current), [0, 0, 0, 0, 0]); assert.equal(state.activities.length, 1);
  store._broadcast(restartedRoom, completedExpedition("boundary-new", [owner, member], 50)); state = store.guildState(owner.session).state.guild; assert.equal(state.week.points, 10);
  now = Date.UTC(2026, 7, 23, 23, 0, 0); state = store.guildState(owner.session).state.guild; assert.equal(state.week.weekId, "2026-08-24"); assert.equal(state.week.points, 10, "a clock rollback must not resurrect the previous guild week");
});

test("build235 stops points at receipt limits but still records activity, and blocks clock-rollback check-in replay", () => {
  let now = Date.UTC(2026, 7, 27, 0, 0, 0); const store = new RoomStore({ now: () => now }), owner = hello(store, 30), member = hello(store, 31), guild = createGuild(store, owner); joinGuild(store, owner, member, guild.guildId);
  const room = { members: new Set([owner.session.playerId, member.session.playerId]), selectedFloor: 100 }, internal = store.guilds.guilds.get(guild.guildId);
  internal.week.eventIds = Array.from({ length: 512 }, (_, index) => `expeditionEnded:receipt-${index}`); internal.recentEventReceipts = [];
  store._broadcast(room, completedExpedition("receipt-new", [owner, member])); assert.equal(internal.week.points, 0); assert.equal(internal.week.eventIds.length, 512); assert.equal(internal.activity.length, 1); assert.equal(internal.activity[0].kind, "expedition"); assert.equal(internal.activity[0].points, 0);
  store._broadcast(room, completedExpedition("receipt-new", [owner, member])); assert.equal(internal.activity.length, 1, "a capped activity receipt must still be idempotent");
  internal.week.eventIds = Array.from({ length: 20 }, (_, index) => `teamBattleEnded:team-${index}`); internal.recentEventReceipts = [];
  store._broadcast(room, { type: "teamBattleEnded", resultId: "team-21", result: "victory", summary: { ranking: ranking(owner, member) } }); assert.equal(internal.week.points, 0); assert.equal(internal.activity.length, 2); assert.equal(internal.activity.at(-1).kind, "team"); assert.equal(internal.activity.at(-1).points, 0);
  internal.week.eventIds = []; assert.equal(store.checkInGuild(owner.session).points, 10); const firstDay = store.guilds.checkIns.get(owner.session.playerId); now -= 24 * 60 * 60_000; assert.deepEqual(store.checkInGuild(owner.session), { ok: true, duplicate: true }); assert.equal(store.guilds.checkIns.get(owner.session.playerId), firstDay);
});

test("build235 retains 80 oldest-to-newest activities while protecting and regrouping today's check-in row, and sends only newest 40", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-activity-cap-")), stateFile = join(folder, "guilds.json"), now = Date.UTC(2026, 7, 27, 5, 0, 0), store = new RoomStore({ now: () => now, guildStateFile: stateFile }), owner = hello(store, 40), member = hello(store, 41), late = hello(store, 42), guild = createGuild(store, owner);
  joinGuild(store, owner, member, guild.guildId); joinGuild(store, owner, late, guild.guildId); assert.equal(store.checkInGuild(owner.session).points, 10);
  const room = { members: new Set([owner.session.playerId, member.session.playerId]), selectedFloor: 200 };
  for (let index = 0; index < 85; index++) store._broadcast(room, completedExpedition(`cap-${index}`, [owner, member], 200));
  let internal = store.guilds.guilds.get(guild.guildId); assert.equal(internal.activity.length, 80); assert.equal(internal.activity.filter(entry => entry.kind === "checkIn").length, 1);
  assert.equal(store.checkInGuild(late.session).points, 10); internal = store.guilds.guilds.get(guild.guildId); const grouped = internal.activity.filter(entry => entry.kind === "checkIn"); assert.equal(internal.activity.length, 80); assert.equal(grouped.length, 1); assert.equal(grouped[0].points, 20); assert.equal(grouped[0].actorIds.length, 2); assert.equal(internal.activity.at(-1).kind, "checkIn");
  assert.equal(store.guildState(owner.session).state.guild.activities.length, 40); const saved = JSON.parse(readFileSync(stateFile, "utf8")); assert.equal(saved.guilds[0].activity.length, 80); assert.equal(saved.guilds[0].activity.filter(entry => entry.kind === "checkIn").length, 1);
});

test("build235 isolates mixed guilds, rejects solo/defeat/abandon/history, and rolls back both guilds without losing recruitment", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-activity-rollback-")), stateFile = join(folder, "guilds.json"), store = new RoomStore({ guildStateFile: stateFile, randomRoomCode: () => "ACT235" }), a = hello(store, 50), a2 = hello(store, 51), b = hello(store, 52), b2 = hello(store, 53), guildA = createGuild(store, a, "A"), guildB = createGuild(store, b, "B");
  joinGuild(store, a, a2, guildA.guildId); joinGuild(store, b, b2, guildB.guildId); const hosted = store.createRoom(a.session).room, recruitment = store.createGuildRecruitment(a.session, { purpose: "explore" }).recruitment;
  const mixed = { members: new Set([a.session.playerId, a2.session.playerId, b.session.playerId, b2.session.playerId]), selectedFloor: 400 }, all = [a, a2, b, b2]; store._broadcast(mixed, completedExpedition("mixed-one", all, 400));
  for (const player of [a, b]) { const state = store.guildState(player.session).state.guild, activity = state.activities[0]; assert.equal(state.week.points, 10); assert.equal(activity.points, 10); assert.equal(activity.partySize, 4); assert.equal(activity.guildMemberCount, 2); assert.equal(activity.actors.length, 2); }
  store._broadcast({ members: new Set([a.session.playerId]), selectedFloor: 400 }, { type: "raidEnded", result: "victory", raid: { progress: { campaignId: "history" } }, ranking: ranking(a, a2) });
  store._broadcast(mixed, { type: "raidEnded", result: "defeat", raid: { progress: { campaignId: "defeat" } }, ranking: ranking(...all) }); store._broadcast(mixed, { type: "expeditionEnded", summary: { id: "abandon", completed: false, ranking: ranking(...all) } });
  assert.equal(store.guildState(a.session).state.guild.week.points, 10); assert.equal(store.guildState(b.session).state.guild.week.points, 10);
  const originalSave = store.guilds._save.bind(store.guilds); store.guilds._save = () => { store.guilds.lastPersistenceError = new Error("injected"); return false; }; store._broadcast(mixed, completedExpedition("mixed-rollback", all, 400)); store.guilds._save = originalSave;
  assert.equal(store.guildState(a.session).state.guild.week.points, 10); assert.equal(store.guildState(b.session).state.guild.week.points, 10); assert.equal(store.guildState(a.session).state.guild.activities.length, 1); assert.equal(store.guildState(b.session).state.guild.activities.length, 1);
  assert.equal(store.rooms.get(hosted.roomId).guildRecruitmentId, recruitment.recruitmentId); assert.equal(store.guildState(a.session).state.guild.recruitments[0].recruitmentId, recruitment.recruitmentId);
  assert.equal(store.kickGuild(a.session, a2.session.playerId).ok, true); const preserved = store.guildState(a.session).state.guild.activities[0]; assert.equal(preserved.actors.length, 2, "departure must not rewrite historical participants"); assert.equal(preserved.guildMemberCount, 2);
});

async function freePort() { const socket = net.createServer(); await new Promise((ok, no) => { socket.once("error", no); socket.listen(0, "127.0.0.1", ok); }); const port = socket.address().port; await new Promise(ok => socket.close(ok)); return port; }
function wsClient(url) { const socket = new WebSocket(url), inbox = [], waiters = []; socket.on("message", raw => { const message = JSON.parse(raw), index = waiters.findIndex(entry => entry.test(message)); if (index < 0) inbox.push(message); else { const [entry] = waiters.splice(index, 1); clearTimeout(entry.timer); entry.ok(message); } }); return { socket, open: () => new Promise((ok, no) => { socket.once("open", ok); socket.once("error", no); }), send: message => socket.send(JSON.stringify(message)), wait(testMessage, label) { const index = inbox.findIndex(testMessage); if (index >= 0) return Promise.resolve(inbox.splice(index, 1)[0]); return new Promise((ok, no) => { const entry = { test: testMessage, ok, timer: setTimeout(() => no(new Error(`${label} timeout; inbox=${JSON.stringify(inbox)}`)), 4_000) }; waiters.push(entry); }); }, close: () => socket.close() }; }

test("build235 advertises guildActivityHistoryV1 over a real protocol 1.16.0 websocket", { timeout: 20_000 }, async () => {
  const port = await freePort(), serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), ".."), folder = mkdtempSync(join(tmpdir(), "abyss-guild-activity-ws-")), child = spawn(process.execPath, ["server.js"], { cwd: serverDirectory, env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), FRIEND_STATE_FILE: join(folder, "friends.json"), GUILD_STATE_FILE: join(folder, "guilds.json") }, stdio: ["ignore", "pipe", "pipe"] });
  let client, stderr = ""; child.stderr.on("data", chunk => stderr += chunk);
  try {
    await Promise.race([new Promise((ok, no) => { child.stdout.on("data", chunk => { if (String(chunk).includes("Online home, exploration, raid")) ok(); }); child.once("exit", code => no(new Error(`server ${code}: ${stderr}`))); }), new Promise((_, no) => setTimeout(() => no(new Error("startup timeout")), 5_000))]);
    client = wsClient(`ws://127.0.0.1:${port}/party`); await client.open(); client.send({ type: "hello", protocol: "1.16.0", ...identity(90) }); const ack = await client.wait(message => message.type === "helloAck", "hello"); assert.equal(ack.protocol, "1.16.0"); assert.equal(ack.capabilities.guildActivityHistoryV1, true);
  } finally { client?.close(); if (child.exitCode === null) child.kill("SIGTERM"); await Promise.race([new Promise(ok => child.once("exit", ok)), new Promise(ok => setTimeout(ok, 1_500))]); }
});
