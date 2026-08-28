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
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function playerCode(index) {
  let value = Math.max(0, Number(index) || 0), code = "";
  for (let position = 0; position < 8; position++) { code = ALPHABET[value % ALPHABET.length] + code; value = Math.floor(value / ALPHABET.length); }
  return `AD-${code.slice(0, 4)}-${code.slice(4)}`;
}

function identity(index) {
  return { friendId: playerCode(5_000 + index), clientKey: `build236-plan-client-${index}`.padEnd(32, "x"), profile: { displayName: `予定者${index + 1}`, monsterName: `相棒${index + 1}`, speciesId: "slime", fallbackEmoji: "🫧", level: 20, maxFloor: 1_000 } };
}

function connection() { return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} }; }
function hello(store, index) { const conn = connection(), result = store.hello(conn, identity(index)); assert.equal(result.ok, true, result.message); return { conn, session: conn.session, result }; }
function createGuild(store, owner, suffix = "A") { const result = store.createGuild(owner.session, { name: `遠征旅団${suffix}`, tag: `P${suffix}`, description: "次の冒険を相談するギルド" }); assert.equal(result.ok, true, result.message); return result.guild; }
function joinGuild(store, owner, member, guildId) { assert.equal(store.applyGuild(member.session, guildId).ok, true); assert.equal(store.respondGuildApplication(owner.session, member.session.playerId, true).ok, true); }
function planSource(now, offset = HOUR, source = {}) { return { purpose: "explore", style: "casual", note: "一緒に深層へ", floor: 321, scheduledAt: now + offset, ...source }; }

test("build236 creates sorted private guild plans with strict DTOs and RSVP/cancel authorization", () => {
  const now = Date.UTC(2026, 7, 28, 3, 0, 0), store = new RoomStore({ now: () => now }), owner = hello(store, 0), member = hello(store, 1), outsider = hello(store, 2), guild = createGuild(store, owner);
  joinGuild(store, owner, member, guild.guildId);

  assert.equal(store.createGuildPlan(outsider.session, planSource(now)).code, "GUILD_NOT_MEMBER");
  assert.equal(store.createGuildPlan(owner.session, planSource(now, 10 * MINUTE - 1)).code, "GUILD_PLAN_TIME");
  assert.equal(store.createGuildPlan(owner.session, planSource(now, 14 * DAY + 1)).code, "GUILD_PLAN_TIME");
  assert.equal(store.createGuildPlan(owner.session, planSource(now, HOUR, { purpose: "unknown" })).code, "GUILD_PLAN_PURPOSE");
  assert.equal(store.createGuildPlan(owner.session, planSource(now, HOUR, { style: "unknown" })).code, "GUILD_PLAN_STYLE");
  assert.equal(store.createGuildPlan(owner.session, planSource(now, HOUR, { floor: 0 })).code, "GUILD_PLAN_FLOOR");
  assert.equal(store.createGuildPlan(owner.session, planSource(now, HOUR, { note: "長".repeat(49) })).code, "GUILD_PLAN_NOTE");

  const late = store.createGuildPlan(owner.session, planSource(now, 3 * HOUR, { purpose: "raid", style: "fast", floor: 999 }));
  const early = store.createGuildPlan(member.session, planSource(now, HOUR, { purpose: "resonance", style: "help", note: "初参加歓迎", floor: 50 }));
  assert.equal(late.ok, true); assert.equal(early.ok, true);
  assert.equal(early.plan.purpose, "explore", "legacy resonance plans migrate to co-op exploration");
  let state = store.guildState(owner.session).state.guild;
  assert.deepEqual(state.plans.map(entry => entry.planId), [early.plan.planId, late.plan.planId]);
  const exactKeys = ["attendees", "canCancel", "canGather", "createdAt", "floor", "gatherClosesAt", "gatherOpensAt", "gathering", "goingCount", "maybeCount", "myStatus", "note", "organizer", "planId", "purpose", "scheduledAt", "style"];
  assert.deepEqual(Object.keys(state.plans[0]).sort(), exactKeys);
  assert.deepEqual(Object.keys(state.plans[0].organizer).sort(), ["displayName", "fallbackEmoji"]);
  assert.deepEqual(Object.keys(state.plans[0].attendees[0]).sort(), ["displayName", "fallbackEmoji", "status"]);
  for (const forbidden of ["creatorId", "guildId", "roomId", "playerId", "eventId"]) assert.equal(JSON.stringify(state.plans).includes(`\"${forbidden}\"`), false);
  assert.equal(state.plans[0].myStatus, "none"); assert.equal(state.plans[0].canCancel, true, "leader may cancel another member's plan");
  assert.equal(store.lookupGuild(outsider.session, guild.guildId).guild.plans, undefined, "plans must never leak through public lookup");

  assert.equal(store.respondGuildPlan(member.session, late.plan.planId, "maybe").ok, true);
  state = store.guildState(member.session).state.guild; const joined = state.plans.find(entry => entry.planId === late.plan.planId);
  assert.equal(joined.myStatus, "maybe"); assert.equal(joined.goingCount, 1); assert.equal(joined.maybeCount, 1);
  assert.equal(store.respondGuildPlan(member.session, late.plan.planId, "declined").code, "GUILD_PLAN_STATUS");
  assert.equal(store.respondGuildPlan(member.session, late.plan.planId, "maybe").duplicate, true);
  assert.equal(store.respondGuildPlan(member.session, late.plan.planId, "none").ok, true);
  assert.equal(store.guildState(member.session).state.guild.plans.find(entry => entry.planId === late.plan.planId).myStatus, "none");
  assert.equal(store.cancelGuildPlan(member.session, late.plan.planId).code, "GUILD_PLAN_FORBIDDEN");
  assert.equal(store.cancelGuildPlan(member.session, early.plan.planId).ok, true, "creator may cancel their own plan");
  assert.equal(store.setGuildRole(owner.session, member.session.playerId, "officer").ok, true); assert.equal(store.cancelGuildPlan(member.session, late.plan.planId).ok, true, "an officer may cancel another member's plan");
  assert.deepEqual(store.guildState(owner.session).state.guild.plans, []);
});

test("build236 enforces two plans per creator and eight plans per guild", () => {
  const now = Date.UTC(2026, 7, 28, 4, 0, 0), store = new RoomStore({ now: () => now }), players = Array.from({ length: 5 }, (_, index) => hello(store, 10 + index)), guild = createGuild(store, players[0], "L");
  for (const member of players.slice(1)) joinGuild(store, players[0], member, guild.guildId);
  for (let index = 0; index < 2; index++) assert.equal(store.createGuildPlan(players[0].session, planSource(now, (index + 1) * HOUR)).ok, true);
  assert.equal(store.createGuildPlan(players[0].session, planSource(now, 3 * HOUR)).code, "GUILD_PLAN_CREATOR_LIMIT");
  let serial = 3; for (const member of players.slice(1, 4)) for (let count = 0; count < 2; count++) assert.equal(store.createGuildPlan(member.session, planSource(now, serial++ * HOUR, { floor: serial })).ok, true);
  assert.equal(store.guildState(players[0].session).state.guild.plans.length, 8);
  assert.equal(store.createGuildPlan(players[4].session, planSource(now, 12 * HOUR)).code, "GUILD_PLAN_LIMIT");
});

test("build236 accepts the exact ten-minute and fourteen-day scheduling boundaries", () => {
  const now = Date.UTC(2026, 7, 28, 4, 15, 0), store = new RoomStore({ now: () => now }), owner = hello(store, 15); createGuild(store, owner, "T");
  assert.equal(store.createGuildPlan(owner.session, planSource(now, 10 * MINUTE - 1)).code, "GUILD_PLAN_TIME");
  const earliest = store.createGuildPlan(owner.session, planSource(now, 10 * MINUTE)), latest = store.createGuildPlan(owner.session, planSource(now, 14 * DAY)); assert.equal(earliest.ok, true); assert.equal(latest.ok, true);
  assert.deepEqual(store.guildState(owner.session).state.guild.plans.map(entry => entry.scheduledAt), [now + 10 * MINUTE, now + 14 * DAY]);
  assert.equal(store.createGuildPlan(owner.session, planSource(now, 14 * DAY + 1)).code, "GUILD_PLAN_TIME");
});

test("build236 scopes known plan IDs to the caller's own guild", () => {
  const now = Date.UTC(2026, 7, 28, 4, 20, 0), store = new RoomStore({ now: () => now }), ownerA = hello(store, 16), ownerB = hello(store, 17), guildA = createGuild(store, ownerA, "U"); createGuild(store, ownerB, "V");
  const created = store.createGuildPlan(ownerA.session, planSource(now)); assert.equal(created.ok, true);
  assert.equal(store.respondGuildPlan(ownerB.session, created.plan.planId, "going").code, "GUILD_PLAN_MISSING"); assert.equal(store.cancelGuildPlan(ownerB.session, created.plan.planId).code, "GUILD_PLAN_MISSING");
  const unchanged = store.guildState(ownerA.session).state.guild; assert.equal(unchanged.guildId, guildA.guildId); assert.equal(unchanged.plans.length, 1); assert.equal(unchanged.plans[0].goingCount, 1);
});

test("build236 rate-limits create, response and cancellation persistence fan-out", () => {
  const now = Date.UTC(2026, 7, 28, 4, 30, 0);
  {
    const store = new RoomStore({ now: () => now }), owner = hello(store, 60); createGuild(store, owner, "C");
    for (let count = 0; count < 4; count++) { const created = store.createGuildPlan(owner.session, planSource(now, HOUR + count)); assert.equal(created.ok, true); assert.equal(store.cancelGuildPlan(owner.session, created.plan.planId).ok, true); }
    assert.equal(store.createGuildPlan(owner.session, planSource(now, 2 * HOUR)).code, "GUILD_PLAN_CREATE_RATE");
  }
  {
    const store = new RoomStore({ now: () => now }), owner = hello(store, 70), member = hello(store, 71), guild = createGuild(store, owner, "S"); joinGuild(store, owner, member, guild.guildId); const created = store.createGuildPlan(owner.session, planSource(now));
    for (let count = 0; count < 12; count++) assert.equal(store.respondGuildPlan(member.session, created.plan.planId, "going").ok, true);
    assert.equal(store.respondGuildPlan(member.session, created.plan.planId, "going").code, "GUILD_PLAN_RESPONSE_RATE");
  }
  {
    const store = new RoomStore({ now: () => now }), players = Array.from({ length: 8 }, (_, index) => hello(store, 80 + index)), guild = createGuild(store, players[0], "X"); for (const member of players.slice(1)) joinGuild(store, players[0], member, guild.guildId);
    const plans = players.slice(1).map((member, index) => store.createGuildPlan(member.session, planSource(now, HOUR + index))).map(result => (assert.equal(result.ok, true), result.plan));
    for (const plan of plans.slice(0, 6)) assert.equal(store.cancelGuildPlan(players[0].session, plan.planId).ok, true);
    assert.equal(store.cancelGuildPlan(players[0].session, plans[6].planId).code, "GUILD_PLAN_CANCEL_RATE");
  }
});

test("build236 keeps capped activity receipts idempotent beyond the former 256-entry window", () => {
  let now = Date.UTC(2026, 7, 28, 4, 45, 0); const store = new RoomStore({ now: () => now }), owner = hello(store, 100), member = hello(store, 101), guild = createGuild(store, owner, "I"); joinGuild(store, owner, member, guild.guildId);
  const room = { members: new Set([owner.session.playerId, member.session.playerId]), selectedFloor: 100 }, ranking = [owner, member].map(player => ({ playerId: player.session.playerId })), internal = store.guilds.guilds.get(guild.guildId); internal.week.eventIds = Array.from({ length: 512 }, (_, index) => `expeditionEnded:full-${index}`); internal.recentEventReceipts = [];
  const send = id => store._broadcast(room, { type: "expeditionEnded", summary: { id, completed: true, floor: 100, ranking } });
  send("overflow-original"); for (let index = 0; index < 300; index++) { now++; send(`overflow-${index}`); }
  const lastActivityAt = internal.activity.at(-1).at; assert.equal(internal.recentEventReceipts.length, 301); assert.equal(internal.recentEventReceipts.filter(entry => entry.eventId === "expeditionEnded:overflow-original").length, 1);
  now++; send("overflow-original"); assert.equal(internal.activity.at(-1).at, lastActivityAt); assert.equal(internal.recentEventReceipts.length, 301); assert.equal(internal.recentEventReceipts.filter(entry => entry.eventId === "expeditionEnded:overflow-original").length, 1);
});

test("build236 writes schema v3, reloads valid plans safely and expires them exactly two hours after start", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-plans-persist-")), stateFile = join(folder, "guilds.json"); let now = Date.UTC(2026, 7, 28, 5, 0, 0);
  let store = new RoomStore({ now: () => now, guildStateFile: stateFile }), owner = hello(store, 20), member = hello(store, 21), guild = createGuild(store, owner, "R"); joinGuild(store, owner, member, guild.guildId);
  const created = store.createGuildPlan(owner.session, planSource(now, HOUR)); assert.equal(created.ok, true); assert.equal(store.respondGuildPlan(member.session, created.plan.planId, "maybe").ok, true);
  const saved = JSON.parse(readFileSync(stateFile, "utf8")); assert.equal(saved.version, 3); assert.equal(saved.guilds[0].plans.length, 1); assert.equal(saved.guilds[0].plans[0].creatorId, owner.session.playerId);

  store = new RoomStore({ now: () => now, guildStateFile: stateFile }); owner = hello(store, 20); member = hello(store, 21); let plan = store.guildState(member.session).state.guild.plans[0]; assert.equal(plan.planId, created.plan.planId); assert.equal(plan.myStatus, "maybe");

  const legacyV2 = structuredClone(saved); legacyV2.version = 2; delete legacyV2.guilds[0].plans; writeFileSync(stateFile, JSON.stringify(legacyV2), "utf8"); const migratedV2 = new RoomStore({ now: () => now, guildStateFile: stateFile }), migratedOwner = hello(migratedV2, 20); assert.deepEqual(migratedV2.guildState(migratedOwner.session).state.guild.plans, []);
  writeFileSync(stateFile, JSON.stringify(saved), "utf8");

  const hardened = structuredClone(saved), valid = hardened.guilds[0].plans[0]; valid.responses[member.session.playerId] = "declined";
  hardened.guilds[0].plans.push(
    { ...valid, planId: "AAAAAAAAAAAAAAAAAA", createdAt: now - 4 * HOUR, scheduledAt: now - 2 * HOUR, responses: {} },
    { ...valid, planId: "BBBBBBBBBBBBBBBBBB", scheduledAt: valid.createdAt + 15 * DAY, responses: {} },
    { ...valid, planId: "CCCCCCCCCCCCCCCCCC", createdAt: 0, responses: {} },
    { ...valid, planId: "DDDDDDDDDDDDDDDDDD", creatorId: identity(99).friendId, responses: {} },
    { ...valid, planId: "EEEEEEEEEEEEEEEEEE", scheduledAt: valid.createdAt + 10 * MINUTE - 1, responses: {} }
  );
  writeFileSync(stateFile, JSON.stringify(hardened), "utf8"); store = new RoomStore({ now: () => now, guildStateFile: stateFile }); owner = hello(store, 20); member = hello(store, 21); plan = store.guildState(member.session).state.guild.plans[0]; assert.equal(store.guildState(member.session).state.guild.plans.length, 1); assert.equal(plan.myStatus, "none", "unknown persisted statuses must be discarded");

  writeFileSync(stateFile, JSON.stringify(saved), "utf8"); now = valid.createdAt - 7 * DAY; store = new RoomStore({ now: () => now, guildStateFile: stateFile }); owner = hello(store, 20); assert.equal(store.guildState(owner.session).state.guild.plans.length, 1, "clock rollback must not delete a structurally valid future plan");
  now = valid.scheduledAt + 2 * HOUR; store.pruneExpired(); assert.equal(store.guildState(owner.session).state.guild.plans.length, 0); assert.deepEqual(JSON.parse(readFileSync(stateFile, "utf8")).guilds[0].plans, []);
});

test("build236 removes departed responses and organizer plans", () => {
  const now = Date.UTC(2026, 7, 28, 6, 0, 0), store = new RoomStore({ now: () => now }), owner = hello(store, 30), organizer = hello(store, 31), responder = hello(store, 32), guild = createGuild(store, owner, "D"); joinGuild(store, owner, organizer, guild.guildId); joinGuild(store, owner, responder, guild.guildId);
  const ownerPlan = store.createGuildPlan(owner.session, planSource(now, HOUR)), memberPlan = store.createGuildPlan(organizer.session, planSource(now, 2 * HOUR));
  assert.equal(store.respondGuildPlan(organizer.session, ownerPlan.plan.planId, "maybe").ok, true); assert.equal(store.respondGuildPlan(responder.session, ownerPlan.plan.planId, "going").ok, true); assert.equal(store.respondGuildPlan(responder.session, memberPlan.plan.planId, "maybe").ok, true);
  assert.equal(store.kickGuild(owner.session, responder.session.playerId).ok, true); let state = store.guildState(owner.session).state.guild; assert.equal(state.plans.find(entry => entry.planId === ownerPlan.plan.planId).goingCount, 1); assert.equal(state.plans.find(entry => entry.planId === memberPlan.plan.planId).maybeCount, 0);
  assert.equal(store.leaveGuild(organizer.session).ok, true); state = store.guildState(owner.session).state.guild; assert.deepEqual(state.plans.map(entry => entry.planId), [ownerPlan.plan.planId]); assert.equal(state.plans[0].maybeCount, 0);
});

test("build236 heartbeat expiry pushes the removal to every connected guild member", () => {
  let now = Date.UTC(2026, 7, 28, 6, 30, 0); const store = new RoomStore({ now: () => now }), owner = hello(store, 35), member = hello(store, 36), guild = createGuild(store, owner, "H"); joinGuild(store, owner, member, guild.guildId);
  const created = store.createGuildPlan(owner.session, planSource(now, HOUR)); assert.equal(created.ok, true); owner.conn.messages.length = 0; member.conn.messages.length = 0;
  now = created.plan.scheduledAt + 2 * HOUR;
  assert.deepEqual(store.guilds.snapshot(owner.session.playerId).guild.plans, [], "a direct snapshot may hide an expired row but must not consume its broadcast");
  assert.equal(store.guilds.guilds.get(guild.guildId).plans.length, 1); assert.equal(owner.conn.messages.length, 0); assert.equal(member.conn.messages.length, 0);
  store.pruneExpired(); assert.equal(store.guilds.guilds.get(guild.guildId).plans.length, 0);
  for (const player of [owner, member]) { const updates = player.conn.messages.filter(message => message.type === "guildState"); assert.ok(updates.length > 0); assert.deepEqual(updates.at(-1).state.guild.plans, []); }
});

test("build236 persistence rollback restores plans without losing transient guild recruitment", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-plans-rollback-")), stateFile = join(folder, "guilds.json"); let now = Date.UTC(2026, 7, 28, 7, 0, 0); const store = new RoomStore({ now: () => now, guildStateFile: stateFile, randomRoomCode: () => "PLN236" }), owner = hello(store, 40), member = hello(store, 41), guild = createGuild(store, owner, "B"); joinGuild(store, owner, member, guild.guildId);
  const room = store.createRoom(owner.session).room, recruitment = store.createGuildRecruitment(owner.session, { purpose: "explore" }).recruitment, created = store.createGuildPlan(owner.session, planSource(now, HOUR)); assert.equal(created.ok, true);
  const originalSave = store.guilds._save.bind(store.guilds), failSave = () => { store.guilds.lastPersistenceError = new Error("injected"); return false; };
  store.guilds._save = failSave; assert.equal(store.respondGuildPlan(member.session, created.plan.planId, "maybe").code, "PERSISTENCE_ERROR"); store.guilds._save = originalSave;
  let state = store.guildState(member.session).state.guild, plan = state.plans.find(entry => entry.planId === created.plan.planId); assert.equal(plan.myStatus, "none"); assert.equal(store.rooms.get(room.roomId).guildRecruitmentId, recruitment.recruitmentId); assert.equal(state.recruitments[0].recruitmentId, recruitment.recruitmentId);
  store.guilds._save = failSave; assert.equal(store.createGuildPlan(member.session, planSource(now, 2 * HOUR)).code, "PERSISTENCE_ERROR"); store.guilds._save = originalSave; assert.equal(store.guilds.guilds.get(guild.guildId).plans.length, 1);
  store.guilds._save = failSave; assert.equal(store.cancelGuildPlan(owner.session, created.plan.planId).code, "PERSISTENCE_ERROR"); store.guilds._save = originalSave; assert.equal(store.guilds.guilds.get(guild.guildId).plans.length, 1);
  state = store.guildState(member.session).state.guild; assert.equal(state.plans.length, 1); assert.equal(store.rooms.get(room.roomId).guildRecruitmentId, recruitment.recruitmentId); assert.equal(state.recruitments[0].recruitmentId, recruitment.recruitmentId);
});

test("build236 retries a failed expiry commit before broadcasting removal", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-plan-expiry-rollback-")), stateFile = join(folder, "guilds.json"); let now = Date.UTC(2026, 7, 28, 7, 30, 0); const store = new RoomStore({ now: () => now, guildStateFile: stateFile }), owner = hello(store, 45), member = hello(store, 46), guild = createGuild(store, owner, "E"); joinGuild(store, owner, member, guild.guildId); const created = store.createGuildPlan(owner.session, planSource(now, HOUR));
  const originalSave = store.guilds._save.bind(store.guilds), failSave = () => { store.guilds.lastPersistenceError = new Error("injected expiry"); return false; }; owner.conn.messages.length = 0; member.conn.messages.length = 0; now = created.plan.scheduledAt + 2 * HOUR; store.guilds._save = failSave; store.pruneExpired(); store.guilds._save = originalSave;
  assert.equal(store.guilds.guilds.get(guild.guildId).plans.length, 1, "failed expiry persistence must remain retryable"); assert.equal(owner.conn.messages.filter(message => message.type === "guildState").length, 0); assert.equal(member.conn.messages.filter(message => message.type === "guildState").length, 0);
  store.pruneExpired(); assert.equal(store.guilds.guilds.get(guild.guildId).plans.length, 0); for (const player of [owner, member]) assert.deepEqual(player.conn.messages.filter(message => message.type === "guildState").at(-1).state.guild.plans, []);
});

async function freePort() { const socket = net.createServer(); await new Promise((ok, no) => { socket.once("error", no); socket.listen(0, "127.0.0.1", ok); }); const port = socket.address().port; await new Promise(ok => socket.close(ok)); return port; }
function wsClient(url) { const socket = new WebSocket(url), inbox = [], waiters = []; socket.on("message", raw => { const message = JSON.parse(raw), index = waiters.findIndex(entry => entry.test(message)); if (index < 0) inbox.push(message); else { const [entry] = waiters.splice(index, 1); clearTimeout(entry.timer); entry.ok(message); } }); return { socket, open: () => new Promise((ok, no) => { socket.once("open", ok); socket.once("error", no); }), send: message => socket.send(JSON.stringify(message)), wait(testMessage, label) { const index = inbox.findIndex(testMessage); if (index >= 0) return Promise.resolve(inbox.splice(index, 1)[0]); return new Promise((ok, no) => { const entry = { test: testMessage, ok, timer: setTimeout(() => no(new Error(`${label} timeout; inbox=${JSON.stringify(inbox)}`)), 4_000) }; waiters.push(entry); }); }, close: () => socket.close() }; }

test("build236 advertises guildPlansV1 and serves create/respond/cancel over protocol 1.16.0", { timeout: 20_000 }, async () => {
  const port = await freePort(), serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), ".."), folder = mkdtempSync(join(tmpdir(), "abyss-guild-plans-ws-")), child = spawn(process.execPath, ["server.js"], { cwd: serverDirectory, env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), FRIEND_STATE_FILE: join(folder, "friends.json"), GUILD_STATE_FILE: join(folder, "guilds.json") }, stdio: ["ignore", "pipe", "pipe"] });
  let client, stderr = ""; child.stderr.on("data", chunk => stderr += chunk);
  try {
    await Promise.race([new Promise((ok, no) => { child.stdout.on("data", chunk => { if (String(chunk).includes("Online home, exploration, raid")) ok(); }); child.once("exit", code => no(new Error(`server ${code}: ${stderr}`))); }), new Promise((_, no) => setTimeout(() => no(new Error("startup timeout")), 5_000))]);
    client = wsClient(`ws://127.0.0.1:${port}/party`); await client.open(); client.send({ type: "hello", protocol: "1.16.0", ...identity(90) }); const ack = await client.wait(message => message.type === "helloAck", "hello"); assert.equal(ack.protocol, "1.16.0"); assert.equal(ack.capabilities.guildPlansV1, true);
    client.send({ type: "guildCreate", name: "予定通信団", tag: "WS", description: "作戦会議" }); await client.wait(message => message.type === "guildState" && message.state.guild?.name === "予定通信団", "guild create");
    client.send({ type: "guildPlanCreate", ...planSource(Date.now(), HOUR) }); const created = await client.wait(message => message.type === "guildState" && message.state.guild?.plans?.length === 1, "plan create"); const planId = created.state.guild.plans[0].planId;
    client.send({ type: "guildPlanRespond", planId, status: "declined" }); const rejected = await client.wait(message => message.type === "error" && message.code === "GUILD_PLAN_STATUS", "plan status validation"); assert.equal(rejected.code, "GUILD_PLAN_STATUS");
    client.send({ type: "guildPlanRespond", planId, status: "none" }); await client.wait(message => message.type === "guildState" && message.state.guild?.plans?.[0]?.myStatus === "none", "plan response");
    client.send({ type: "guildPlanCancel", planId }); await client.wait(message => message.type === "guildState" && message.state.guild?.plans?.length === 0, "plan cancel");
  } finally { client?.close(); if (child.exitCode === null) child.kill("SIGTERM"); await Promise.race([new Promise(ok => child.once("exit", ok)), new Promise(ok => setTimeout(ok, 1_500))]); }
});
