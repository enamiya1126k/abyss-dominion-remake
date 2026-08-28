import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
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

function playerCode(index) {
  let value = Math.max(0, Number(index) || 0), code = "";
  for (let position = 0; position < 8; position++) { code = ALPHABET[value % ALPHABET.length] + code; value = Math.floor(value / ALPHABET.length); }
  return `AD-${code.slice(0, 4)}-${code.slice(4)}`;
}

function identity(index, source = {}) {
  return { friendId: playerCode(7_000 + index), clientKey: `build237-gather-client-${index}`.padEnd(32, "x"), profile: { displayName: `集合者${index + 1}`, monsterName: `相棒${index + 1}`, speciesId: "slime", fallbackEmoji: "🫧", level: 30, maxFloor: 500, ...source } };
}

function connection() { return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} }; }
function hello(store, index, profile = {}) { const conn = connection(), result = store.hello(conn, identity(index, profile)); assert.equal(result.ok, true, result.message); return { conn, session: conn.session, result }; }
function createGuild(store, owner, suffix = "A") { const result = store.createGuild(owner.session, { name: `集合旅団${suffix}`, tag: `G${suffix}`, description: "予定から安全に集合する" }); assert.equal(result.ok, true, result.message); return result.guild; }
function joinGuild(store, owner, member, guildId) { assert.equal(store.applyGuild(member.session, guildId).ok, true); assert.equal(store.respondGuildApplication(owner.session, member.session.playerId, true).ok, true); }
function createPlan(store, owner, scheduledAt, source = {}) { const result = store.createGuildPlan(owner.session, { purpose: "explore", style: "casual", note: "深層へ集合", floor: 321, scheduledAt, ...source }); assert.equal(result.ok, true, result.message); return result.plan; }

test("build237 gathers an existing creator-owned lobby with a strict member-only plan DTO", () => {
  let now = Date.UTC(2026, 7, 29, 1, 0, 0); const store = new RoomStore({ now: () => now, randomRoomCode: () => "GAT237" }), owner = hello(store, 0), member = hello(store, 1), outsider = hello(store, 2), guild = createGuild(store, owner); joinGuild(store, owner, member, guild.guildId);
  const plan = createPlan(store, owner, now + 10 * MINUTE), room = store.createRoom(owner.session).room;
  let memberPlan = store.guildState(member.session).state.guild.plans[0];
  assert.equal(memberPlan.canGather, false); assert.equal(memberPlan.gatherOpensAt, plan.scheduledAt - 30 * MINUTE); assert.equal(memberPlan.gatherClosesAt, plan.scheduledAt + 2 * HOUR); assert.equal(memberPlan.gathering, null);
  const gathered = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(gathered.ok, true); assert.equal(store.rooms.get(room.roomId).selectedFloor, 321);
  memberPlan = store.guildState(member.session).state.guild.plans[0];
  assert.deepEqual(Object.keys(memberPlan.gathering).sort(), ["count", "expiresAt", "hostPlayerId", "joined", "max", "recruitmentId", "slots"]);
  assert.equal(memberPlan.gathering.hostPlayerId, owner.session.playerId);
  assert.equal(memberPlan.gathering.count, 1); assert.equal(memberPlan.gathering.max, 4); assert.equal(memberPlan.gathering.slots, 3); assert.equal(memberPlan.gathering.joined, false);
  assert.deepEqual(store.guildState(member.session).state.guild.recruitments, [], "plan-linked gathering must not duplicate the generic recruitment list");
  for (const forbidden of ["creatorId", "guildId", "roomId", "sourcePlanId", "host"]) assert.equal(JSON.stringify(memberPlan).includes(`\"${forbidden}\"`), false);
  assert.equal(store.lookupGuild(outsider.session, guild.guildId).guild.plans, undefined);
  assert.equal(memberPlan.myStatus, "none", "RSVP must not gate joining");
  assert.equal(store.joinGuildRecruitment(member.session, memberPlan.gathering.recruitmentId).ok, true); assert.equal(member.session.roomId, room.roomId);
  memberPlan = store.guildState(member.session).state.guild.plans[0]; assert.equal(memberPlan.gathering.joined, true); assert.equal(memberPlan.gathering.count, 2);
});

test("build237 keeps a full planned gathering guild-scoped and reopens its slot after a member leaves", () => {
  const now = Date.UTC(2026, 7, 29, 1, 30, 0), store = new RoomStore({ now: () => now, maxMembers: 2, randomRoomCode: () => "FULPLN" }), owner = hello(store, 3), member = hello(store, 4), outsider = hello(store, 5), guild = createGuild(store, owner, "W"); joinGuild(store, owner, member, guild.guildId); const plan = createPlan(store, owner, now + 10 * MINUTE), room = store.createRoom(owner.session).room;
  const gathered = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(gathered.ok, true); assert.equal(store.joinGuildRecruitment(member.session, gathered.gathering.recruitmentId).ok, true);
  let state = store.guildState(owner.session).state.guild.plans[0].gathering; assert.equal(state.count, 2); assert.equal(state.slots, 0); assert.equal(store.rooms.get(room.roomId).guildAudienceId, guild.guildId); assert.equal(store.joinRoom(outsider.session, room.roomId).code, "GUILD_RECRUITMENT_FORBIDDEN");
  owner.conn.messages.length = 0; member.conn.messages.length = 0; const fullRetry = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(fullRetry.ok, true); assert.equal(fullRetry.duplicate, true); assert.equal(fullRetry.gathering.recruitmentId, gathered.gathering.recruitmentId); assert.equal(fullRetry.gathering.expiresAt, gathered.gathering.expiresAt); assert.equal(store.guilds.recruitments.size, 1); assert.equal(owner.conn.messages.filter(message => message.type === "guildState").length, 1); assert.equal(owner.conn.messages.filter(message => message.type === "roomState").length, 1); assert.equal(member.conn.messages.length, 0, "a full-room retry must stay requester-only");
  assert.equal(store.leaveRoom(member.session).ok, true); state = store.guildState(owner.session).state.guild.plans[0].gathering; assert.equal(state.count, 1); assert.equal(state.slots, 1); assert.equal(store.rooms.get(room.roomId).guildAudienceId, guild.guildId); assert.equal(store.joinRoom(outsider.session, room.roomId).code, "GUILD_RECRUITMENT_FORBIDDEN", "a full-then-open planned room must never become raw-ID public");
});

test("build237 binds explore gatherings to the planned floor and closes scope if the host changes it", () => {
  const now = Date.UTC(2026, 7, 29, 1, 45, 0), store = new RoomStore({ now: () => now, randomRoomCode: () => "FLR237" }), owner = hello(store, 6), outsider = hello(store, 7); createGuild(store, owner, "X"); const plan = createPlan(store, owner, now + 10 * MINUTE, { floor: 321 }), room = store.createRoom(owner.session).room;
  assert.equal(store.gatherGuildPlan(owner.session, plan.planId).ok, true); assert.equal(store.rooms.get(room.roomId).selectedFloor, 321); assert.equal(store.guildState(owner.session).state.guild.plans[0].gathering != null, true);
  assert.equal(store.setFloor(owner.session, 320).ok, true); assert.equal(store.rooms.get(room.roomId).selectedFloor, 320); assert.equal(store.guilds.recruitments.size, 0); assert.equal(store.rooms.get(room.roomId).guildAudienceId, null); assert.equal(store.guildState(owner.session).state.guild.plans[0].gathering, null); assert.equal(store.joinRoom(outsider.session, room.roomId).ok, true, "explicit floor changes end the plan-linked guild scope instead of silently changing its target");
});

test("build237 uses persisted plan fields, rejects locked explore floors, and leaves non-explore floors unchanged", () => {
  const now = Date.UTC(2026, 7, 29, 2, 0, 0);
  {
    const store = new RoomStore({ now: () => now, randomRoomCode: () => "LOCKED" }), owner = hello(store, 10, { maxFloor: 120 }); createGuild(store, owner, "B"); const plan = createPlan(store, owner, now + 10 * MINUTE, { floor: 121 }), room = store.createRoom(owner.session).room, before = store.rooms.get(room.roomId).selectedFloor;
    const rejected = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(rejected.code, "GUILD_PLAN_FLOOR_LOCKED"); assert.equal(store.rooms.get(room.roomId).selectedFloor, before); assert.equal(store.guilds.recruitments.size, 0);
  }
  {
    const store = new RoomStore({ now: () => now, randomRoomCode: () => "AUTHFL" }), owner = hello(store, 11); createGuild(store, owner, "C"); const plan = createPlan(store, owner, now + 10 * MINUTE, { floor: 444, style: "help", note: "保存済みの内容" }); const room = store.createRoom(owner.session).room;
    const result = store.guilds.gatherPlan(owner.session, store.rooms.get(room.roomId), plan.planId, { purpose: "raid", floor: 1, note: "偽装" }); assert.equal(result.ok, true);
    const entry = [...store.guilds.recruitments.values()][0]; assert.equal(entry.purpose, "explore"); assert.equal(entry.style, "help"); assert.equal(entry.note, "保存済みの内容"); assert.equal(store.rooms.get(room.roomId).selectedFloor, 444);
  }
  {
    const store = new RoomStore({ now: () => now, randomRoomCode: () => "RAIDFL" }), owner = hello(store, 12); createGuild(store, owner, "D"); const plan = createPlan(store, owner, now + 10 * MINUTE, { purpose: "raid", floor: 499 }), room = store.createRoom(owner.session).room; store.rooms.get(room.roomId).selectedFloor = 73;
    assert.equal(store.gatherGuildPlan(owner.session, plan.planId).ok, true); assert.equal(store.rooms.get(room.roomId).selectedFloor, 73, "non-explore plans must not rewrite the lobby floor");
  }
});

test("build237 enforces opening and closing boundaries and computes bounded gathering TTLs", () => {
  let now = Date.UTC(2026, 7, 29, 3, 0, 0); const store = new RoomStore({ now: () => now, randomRoomCode: () => "TIM237" }), owner = hello(store, 20); createGuild(store, owner, "E"); const scheduledAt = now + HOUR, plan = createPlan(store, owner, scheduledAt); store.createRoom(owner.session);
  now = scheduledAt - 30 * MINUTE - 1; assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "GUILD_PLAN_GATHER_EARLY");
  now = scheduledAt - 30 * MINUTE; let result = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(result.ok, true); assert.equal(result.gathering.expiresAt, scheduledAt + 30 * MINUTE); assert.equal(store.closeGuildRecruitment(owner.session, result.gathering.recruitmentId).ok, true);
  now = scheduledAt + 45 * MINUTE; result = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(result.ok, true); assert.equal(result.gathering.expiresAt, scheduledAt + 75 * MINUTE); assert.equal(store.closeGuildRecruitment(owner.session, result.gathering.recruitmentId).ok, true);
  now = scheduledAt + 110 * MINUTE; result = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(result.ok, true); assert.equal(result.gathering.expiresAt, scheduledAt + 2 * HOUR); assert.equal(store.closeGuildRecruitment(owner.session, result.gathering.recruitmentId).ok, true);
  now = scheduledAt + 2 * HOUR; assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "GUILD_PLAN_GATHER_CLOSED");
});

test("build237 retries the same plan and room idempotently without rotating or extending the gathering", () => {
  let now = Date.UTC(2026, 7, 29, 4, 0, 0); const store = new RoomStore({ now: () => now, randomRoomCode: () => "IDM237" }), owner = hello(store, 30), member = hello(store, 31), guild = createGuild(store, owner, "F"); joinGuild(store, owner, member, guild.guildId); const plan = createPlan(store, owner, now + 10 * MINUTE); store.createRoom(owner.session);
  const first = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(first.ok, true); now += 5 * MINUTE; owner.conn.messages.length = 0; member.conn.messages.length = 0; const retry = store.gatherGuildPlan(owner.session, plan.planId);
  assert.equal(retry.ok, true); assert.equal(retry.duplicate, true); assert.equal(retry.gathering.recruitmentId, first.gathering.recruitmentId); assert.equal(retry.gathering.expiresAt, first.gathering.expiresAt); assert.equal(store.guilds.recruitments.size, 1);
  assert.equal(owner.conn.messages.filter(message => message.type === "guildState").length, 1); assert.equal(owner.conn.messages.filter(message => message.type === "roomState").length, 1); assert.equal(member.conn.messages.length, 0, "duplicate retries must not fan out to the whole guild or room");
  for (let retryCount = 0; retryCount < 3; retryCount++) assert.equal(store.gatherGuildPlan(owner.session, plan.planId).duplicate, true);
  const ownerMessageCount = owner.conn.messages.length; assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "GUILD_PLAN_GATHER_RATE"); assert.equal(owner.conn.messages.length, ownerMessageCount); assert.equal(member.conn.messages.length, 0); assert.equal(Object.keys(owner.session.guildRates).filter(key => key === "planGatherRetry").length, 1);
  now += 10_000; assert.equal(store.gatherGuildPlan(owner.session, plan.planId).duplicate, true, "the bounded retry bucket reopens after ten seconds");
  assert.equal(store.createGuildRecruitment(owner.session, {}).code, "GUILD_PLAN_GATHERING_CONFLICT", "generic recruitment must never silently replace a linked gathering");
});

test("build237 rate-limits gathering creation while keeping live retries idempotent", () => {
  let now = Date.UTC(2026, 7, 29, 4, 30, 0); const store = new RoomStore({ now: () => now, randomRoomCode: () => "RAT237" }), owner = hello(store, 35); createGuild(store, owner, "V"); const plan = createPlan(store, owner, now + 10 * MINUTE); store.createRoom(owner.session);
  let result = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(result.ok, true); const recruitmentId = result.gathering.recruitmentId;
  result = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(result.duplicate, true); assert.equal(result.gathering.recruitmentId, recruitmentId, "an idempotent network retry must bypass creation rate limits");
  assert.equal(store.closeGuildRecruitment(owner.session, recruitmentId).ok, true); assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "GUILD_PLAN_GATHER_RATE");
  for (let attempt = 1; attempt <= 3; attempt++) { now += 10_001; result = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(result.ok, true); assert.equal(store.closeGuildRecruitment(owner.session, result.gathering.recruitmentId).ok, true); }
  now += 10_001; assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "GUILD_PLAN_GATHER_RATE", "a fixed overall four-per-minute bucket must bound plan switching without dynamic rate keys");
  assert.deepEqual(Object.keys(owner.session.guildRates).filter(key => key.startsWith("planGather")).sort(), ["planGather", "planGatherRetry"]); assert.ok(owner.session.guildPlanGatherRecent.length <= 4);
});

test("build237 rejects unauthorized, foreign, non-owner, busy, full, mixed, public, traded and conflicting lobbies", () => {
  const now = Date.UTC(2026, 7, 29, 5, 0, 0);
  {
    const store = new RoomStore({ now: () => now }), owner = hello(store, 40), member = hello(store, 41), foreign = hello(store, 42), guild = createGuild(store, owner, "H"); joinGuild(store, owner, member, guild.guildId); createGuild(store, foreign, "I"); const plan = createPlan(store, owner, now + 10 * MINUTE);
    assert.equal(store.gatherGuildPlan(member.session, plan.planId).code, "GUILD_PLAN_GATHER_CREATOR_ONLY"); assert.equal(store.gatherGuildPlan(foreign.session, plan.planId).code, "GUILD_PLAN_MISSING"); assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "NOT_IN_ROOM");
  }
  {
    const store = new RoomStore({ now: () => now, randomRoomCode: () => "OWN237" }), owner = hello(store, 43), member = hello(store, 44), guild = createGuild(store, owner, "J"); joinGuild(store, owner, member, guild.guildId); const plan = createPlan(store, owner, now + 10 * MINUTE), room = store.createRoom(member.session).room; assert.equal(store.joinRoom(owner.session, room.roomId).ok, true); assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "GUILD_PLAN_GATHER_OWNER_ONLY");
  }
  {
    const store = new RoomStore({ now: () => now, randomRoomCode: () => "BUS237" }), owner = hello(store, 45); createGuild(store, owner, "K"); const plan = createPlan(store, owner, now + 10 * MINUTE), room = store.createRoom(owner.session).room; store.rooms.get(room.roomId).phase = "raid"; assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "ROOM_BUSY");
  }
  {
    const store = new RoomStore({ now: () => now, maxMembers: 2, randomRoomCode: () => "FUL237" }), owner = hello(store, 46), member = hello(store, 47), guild = createGuild(store, owner, "L"); joinGuild(store, owner, member, guild.guildId); const plan = createPlan(store, owner, now + 10 * MINUTE), room = store.createRoom(owner.session).room; assert.equal(store.joinRoom(member.session, room.roomId).ok, true); assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "ROOM_FULL");
  }
  {
    const store = new RoomStore({ now: () => now, randomRoomCode: () => "MIX237" }), owner = hello(store, 48), outsider = hello(store, 49); createGuild(store, owner, "M"); const plan = createPlan(store, owner, now + 10 * MINUTE), room = store.createRoom(owner.session).room; assert.equal(store.joinRoom(outsider.session, room.roomId).ok, true); assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "GUILD_RECRUITMENT_MIXED_ROOM");
  }
  {
    const store = new RoomStore({ now: () => now, randomRoomCode: () => "PUB237" }), owner = hello(store, 50); createGuild(store, owner, "N"); const plan = createPlan(store, owner, now + 10 * MINUTE); store.createRoom(owner.session, { published: true }); assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "RECRUITMENT_MODE_CONFLICT");
  }
  {
    const store = new RoomStore({ now: () => now, randomRoomCode: () => "TRD237" }), owner = hello(store, 51); createGuild(store, owner, "O"); const plan = createPlan(store, owner, now + 10 * MINUTE); store.createRoom(owner.session); store.trade.blocksContent = id => id === owner.session.playerId; assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "TRADE_ACTIVE");
  }
  {
    const store = new RoomStore({ now: () => now, randomRoomCode: () => "CON237" }), owner = hello(store, 52); createGuild(store, owner, "P"); const plan = createPlan(store, owner, now + 10 * MINUTE); store.createRoom(owner.session); assert.equal(store.createGuildRecruitment(owner.session, {}).ok, true); assert.equal(store.gatherGuildPlan(owner.session, plan.planId).code, "GUILD_PLAN_GATHERING_CONFLICT");
  }
});

test("build237 keeps gathering transient and does not alter guild economy, activity or persisted plans", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-gather-persist-")), stateFile = join(folder, "guilds.json"), now = Date.UTC(2026, 7, 29, 6, 0, 0); let store = new RoomStore({ now: () => now, guildStateFile: stateFile, randomRoomCode: () => "PER237" }), owner = hello(store, 60); const guild = createGuild(store, owner, "Q"), plan = createPlan(store, owner, now + 10 * MINUTE); store.createRoom(owner.session);
  const internal = store.guilds.guilds.get(guild.guildId), beforeFile = readFileSync(stateFile, "utf8"), beforeEconomy = { totalXp: internal.totalXp, points: internal.week.points, memberPoints: { ...internal.week.memberPoints }, activity: structuredClone(internal.activity), receipts: structuredClone(internal.recentEventReceipts) };
  assert.equal(store.gatherGuildPlan(owner.session, plan.planId).ok, true); assert.equal(readFileSync(stateFile, "utf8"), beforeFile); assert.deepEqual({ totalXp: internal.totalXp, points: internal.week.points, memberPoints: { ...internal.week.memberPoints }, activity: structuredClone(internal.activity), receipts: structuredClone(internal.recentEventReceipts) }, beforeEconomy);
  assert.equal([...store.guilds.recruitments.values()][0].sourcePlanId, plan.planId); const saved = JSON.parse(readFileSync(stateFile, "utf8")); assert.equal("recruitments" in saved, false); assert.equal(JSON.stringify(saved).includes("sourcePlanId"), false);
  store = new RoomStore({ now: () => now, guildStateFile: stateFile }); owner = hello(store, 60); assert.equal(store.guilds.recruitments.size, 0); assert.equal(store.guildState(owner.session).state.guild.plans[0].gathering, null);
});

test("build237 closes links after durable cancel, creator removal and disband, while rollback preserves them", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-gather-cleanup-")), stateFile = join(folder, "guilds.json"); let now = Date.UTC(2026, 7, 29, 7, 0, 0); const store = new RoomStore({ now: () => now, guildStateFile: stateFile, randomRoomCode: () => "CLN237" }), leader = hello(store, 70), creator = hello(store, 71), guild = createGuild(store, leader, "R"); joinGuild(store, leader, creator, guild.guildId); const plan = createPlan(store, creator, now + 10 * MINUTE); const room = store.createRoom(creator.session).room; assert.equal(store.gatherGuildPlan(creator.session, plan.planId).ok, true);
  const originalSave = store.guilds._save.bind(store.guilds), failSave = () => { store.guilds.lastPersistenceError = new Error("injected"); return false; };
  store.guilds._save = failSave; assert.equal(store.cancelGuildPlan(leader.session, plan.planId).code, "PERSISTENCE_ERROR"); store.guilds._save = originalSave;
  assert.equal(store.rooms.get(room.roomId).guildRecruitmentId != null, true); assert.equal(store.guilds.recruitments.size, 1); assert.equal(store.guildState(leader.session).state.guild.plans.length, 1);
  assert.equal(store.cancelGuildPlan(leader.session, plan.planId).ok, true); assert.equal(store.rooms.get(room.roomId).guildRecruitmentId, null); assert.equal(store.guilds.recruitments.size, 0);

  now += MINUTE; const plan2 = createPlan(store, creator, now + 10 * MINUTE); assert.equal(store.gatherGuildPlan(creator.session, plan2.planId).ok, true); store.guilds._save = failSave; assert.equal(store.kickGuild(leader.session, creator.session.playerId).code, "PERSISTENCE_ERROR"); store.guilds._save = originalSave; assert.equal(store.guilds.recruitments.size, 1);
  assert.equal(store.kickGuild(leader.session, creator.session.playerId).ok, true); assert.equal(store.guilds.recruitments.size, 0); assert.equal(store.rooms.get(room.roomId).guildAudienceId, null);

  const solo = new RoomStore({ now: () => now, guildStateFile: join(folder, "solo.json"), randomRoomCode: () => "DSB237" }), owner = hello(solo, 72), soloGuild = createGuild(solo, owner, "S"), soloPlan = createPlan(solo, owner, now + 10 * MINUTE), soloRoom = solo.createRoom(owner.session).room; assert.equal(solo.gatherGuildPlan(owner.session, soloPlan.planId).ok, true); assert.equal(solo.disbandGuild(owner.session, soloGuild.name).ok, true); assert.equal(solo.guilds.recruitments.size, 0); assert.equal(solo.rooms.get(soloRoom.roomId).guildAudienceId, null);
});

test("build237 closes an expired transient gathering even while durable plan expiry retries", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-gather-expiry-")), stateFile = join(folder, "guilds.json"); let now = Date.UTC(2026, 7, 29, 8, 0, 0); const store = new RoomStore({ now: () => now, guildStateFile: stateFile, randomRoomCode: () => "EXP237" }), owner = hello(store, 80); createGuild(store, owner, "T"); const plan = createPlan(store, owner, now + 10 * MINUTE); const room = store.createRoom(owner.session).room; assert.equal(store.gatherGuildPlan(owner.session, plan.planId).ok, true);
  const originalSave = store.guilds._save.bind(store.guilds); now = plan.scheduledAt + 2 * HOUR; store.guilds._save = () => { store.guilds.lastPersistenceError = new Error("injected"); return false; }; store.pruneExpired(); store.guilds._save = originalSave;
  assert.equal(store.guilds.guilds.values().next().value.plans.length, 1); assert.equal(store.guilds.recruitments.size, 0); assert.equal(store.rooms.get(room.roomId).guildRecruitmentId, null, "the transient gathering TTL is independent from the durable plan retry");
  store.pruneExpired(); assert.equal(store.guilds.guilds.values().next().value.plans.length, 0); assert.equal(store.guilds.recruitments.size, 0); assert.equal(store.rooms.get(room.roomId).guildAudienceId, null);
});

test("build237 closes a gathering on room invalidation without deleting its plan", () => {
  const now = Date.UTC(2026, 7, 29, 9, 0, 0), store = new RoomStore({ now: () => now, randomRoomCode: () => "INV237" }), owner = hello(store, 90); createGuild(store, owner, "U"); const plan = createPlan(store, owner, now + 10 * MINUTE); const room = store.createRoom(owner.session).room; assert.equal(store.gatherGuildPlan(owner.session, plan.planId).ok, true);
  assert.equal(store.setReady(owner.session, true).ok, true); assert.equal(store.startExpedition(owner.session).ok, true); assert.equal(store.guilds.recruitments.size, 0); assert.equal(store.rooms.get(room.roomId).guildAudienceId, null); assert.equal(store.guildState(owner.session).state.guild.plans.length, 1);
});

async function freePort() { const socket = net.createServer(); await new Promise((ok, no) => { socket.once("error", no); socket.listen(0, "127.0.0.1", ok); }); const port = socket.address().port; await new Promise(ok => socket.close(ok)); return port; }
function wsClient(url) {
  const socket = new WebSocket(url), inbox = [], waiters = [];
  socket.on("message", raw => { const message = JSON.parse(raw), index = waiters.findIndex(entry => entry.test(message)); if (index < 0) inbox.push(message); else { const [entry] = waiters.splice(index, 1); clearTimeout(entry.timer); entry.ok(message); } });
  return { socket, open: () => new Promise((ok, no) => { socket.once("open", ok); socket.once("error", no); }), send: message => socket.send(JSON.stringify(message)), wait(testMessage, label) { const index = inbox.findIndex(testMessage); if (index >= 0) return Promise.resolve(inbox.splice(index, 1)[0]); return new Promise((ok, no) => { const entry = { test: testMessage, ok, timer: setTimeout(() => no(new Error(`${label} timeout; inbox=${JSON.stringify(inbox)}`)), 4_000) }; waiters.push(entry); }); }, close: () => socket.close() };
}

test("build237 advertises guildPlanGatheringV1 and gathers over a real websocket", { timeout: 20_000 }, async () => {
  const port = await freePort(), serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), ".."), folder = mkdtempSync(join(tmpdir(), "abyss-guild-gather-ws-")); const child = spawn(process.execPath, ["server.js"], { cwd: serverDirectory, env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), FRIEND_STATE_FILE: join(folder, "friends.json"), GUILD_STATE_FILE: join(folder, "guilds.json") }, stdio: ["ignore", "pipe", "pipe"] }); let client = null, stderr = ""; child.stderr.on("data", chunk => stderr += chunk);
  try {
    await Promise.race([new Promise((ok, no) => { child.stdout.on("data", chunk => { if (String(chunk).includes("Online home, exploration, raid")) ok(); }); child.once("exit", code => no(new Error(`server ${code}: ${stderr}`))); }), new Promise((_, no) => { const timer = setTimeout(() => no(new Error("startup timeout")), 5_000); timer.unref?.(); })]);
    client = wsClient(`ws://127.0.0.1:${port}/party`); await client.open(); client.send({ type: "hello", protocol: "1.16.0", ...identity(100, { maxFloor: 500 }) }); const ack = await client.wait(message => message.type === "helloAck", "hello"); assert.equal(ack.protocol, "1.16.0"); assert.equal(ack.capabilities.guildPlanGatheringV1, true);
    client.send({ type: "guildCreate", name: "通信集合団", tag: "WS" }); await client.wait(message => message.type === "guildState" && message.state.guild?.guildId, "guild create");
    client.send({ type: "guildPlanCreate", purpose: "explore", style: "help", note: "通信集合", floor: 123, scheduledAt: Date.now() + 11 * MINUTE }); const planState = await client.wait(message => message.type === "guildState" && message.state.guild?.plans?.length === 1, "plan create"); const planId = planState.state.guild.plans[0].planId;
    client.send({ type: "createRoom" }); await client.wait(message => message.type === "roomState" && message.room?.ownerId === ack.playerId, "room create"); client.send({ type: "guildPlanGather", planId });
    const gathered = await client.wait(message => message.type === "guildState" && message.state.guild?.plans?.[0]?.gathering?.recruitmentId, "plan gather"); assert.equal(gathered.state.guild.plans[0].gathering.count, 1); assert.equal(gathered.state.guild.recruitments.length, 0);
    const roomState = await client.wait(message => message.type === "roomState" && message.room?.selectedFloor === 123, "authoritative floor"); assert.equal(roomState.room.ownerId, ack.playerId);
  } finally { client?.close(); if (child.exitCode === null) { child.kill("SIGTERM"); await Promise.race([new Promise(ok => child.once("exit", ok)), new Promise(ok => setTimeout(ok, 1_500))]); } }
});
