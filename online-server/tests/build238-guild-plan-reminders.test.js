import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
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
  return { friendId: playerCode(9_000 + index), clientKey: `build238-reminder-client-${index}`.padEnd(32, "x"), profile: { displayName: `通知者${index + 1}`, monsterName: `相棒${index + 1}`, speciesId: "slime", fallbackEmoji: "🔔", level: 40, maxFloor: 800, ...source } };
}

function connection() { return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} }; }
function hello(store, index, profile = {}) { const conn = connection(), result = store.hello(conn, identity(index, profile)); assert.equal(result.ok, true, result.message); return { index, conn, session: conn.session, result }; }
function createGuild(store, owner, suffix = "A") { const result = store.createGuild(owner.session, { name: `通知旅団${suffix}`, tag: `N${suffix}`, description: "遠征予定を忘れない" }); assert.equal(result.ok, true, result.message); return result.guild; }
function joinGuild(store, owner, member, guildId) { assert.equal(store.applyGuild(member.session, guildId).ok, true); assert.equal(store.respondGuildApplication(owner.session, member.session.playerId, true).ok, true); }
function createPlan(store, owner, scheduledAt, source = {}) { const result = store.createGuildPlan(owner.session, { purpose: "explore", style: "casual", note: "時間になったら集合", floor: 456, scheduledAt, ...source }); assert.equal(result.ok, true, result.message); return result.plan; }
function reminders(player, phase = null) { return player.conn.messages.filter(message => message.type === "guildPlanReminder" && (!phase || message.phase === phase)); }
function clearMessages(...players) { for (const player of players.flat()) player.conn.messages.length = 0; }

test("build238 exposes authoritative serverNow and sends one sanitized window reminder at the exact T-30 boundary", () => {
  let now = Date.UTC(2026, 7, 30, 0, 0, 0); const store = new RoomStore({ now: () => now }), owner = hello(store, 0), going = hello(store, 1), maybe = hello(store, 2), silent = hello(store, 3), outsider = hello(store, 4), guild = createGuild(store, owner);
  for (const member of [going, maybe, silent]) joinGuild(store, owner, member, guild.guildId);
  const plan = createPlan(store, owner, now + 31 * MINUTE); assert.equal(store.respondGuildPlan(going.session, plan.planId, "going").ok, true); assert.equal(store.respondGuildPlan(maybe.session, plan.planId, "maybe").ok, true);
  clearMessages(owner, going, maybe, silent, outsider);

  now = plan.gatherOpensAt - 1; assert.equal(store.guildState(owner.session).state.serverNow, now); store.pruneExpired();
  for (const player of [owner, going, maybe, silent, outsider]) assert.equal(reminders(player).length, 0);

  now = plan.gatherOpensAt; store.pruneExpired();
  for (const player of [owner, going, maybe]) {
    const [message] = reminders(player, "window"); assert.ok(message); assert.equal(message.serverNow, now);
    assert.deepEqual(Object.keys(message).sort(), ["phase", "plan", "serverNow", "type"]);
    assert.deepEqual(Object.keys(message.plan).sort(), ["floor", "organizer", "planId", "purpose", "scheduledAt", "style"]);
    assert.deepEqual(Object.keys(message.plan.organizer).sort(), ["displayName", "fallbackEmoji"]);
    assert.equal(message.plan.planId, plan.planId); assert.equal(message.plan.floor, 456); assert.equal(message.plan.scheduledAt, plan.scheduledAt);
    for (const forbidden of ["roomId", "guildId", "creatorId", "playerId", "attendees", "responses", "hostPlayerId"]) assert.equal(JSON.stringify(message).includes(`\"${forbidden}\"`), false);
  }
  assert.equal(reminders(silent).length, 0); assert.equal(reminders(outsider).length, 0);

  store.pruneExpired(); for (const player of [owner, going, maybe]) assert.equal(reminders(player, "window").length, 1, "heartbeat retries must not repeat a phase");
  now -= 5 * MINUTE; store.pruneExpired(); now += 5 * MINUTE; store.pruneExpired(); for (const player of [owner, going, maybe]) assert.equal(reminders(player, "window").length, 1, "clock rollback must not reopen a received phase");

  const resumeToken = going.session.resumeToken; store.disconnect(going.session, going.conn); const reconnected = connection(), resumed = store.hello(reconnected, { ...identity(going.index), resumeToken }); assert.equal(resumed.ok, true); going.conn = reconnected; going.session = reconnected.session; clearMessages(owner, going, maybe, silent, outsider); store.pruneExpired();
  assert.equal(reminders(going).length, 0, "a resumed session retains bounded reminder receipts");
  assert.ok(going.session.guildPlanReminderReceipts.length <= 48);
});

test("build238 live reminders reach every joinable guild member once and skip joined, full, busy, removed and trading members", () => {
  let now = Date.UTC(2026, 7, 30, 2, 0, 0), roomCodes = ["REM238", "BUS238"], roomCursor = 0;
  const store = new RoomStore({ now: () => now, maxMembers: 2, randomRoomCode: () => roomCodes[roomCursor++] ?? `R${roomCursor}0238` }), owner = hello(store, 10), joined = hello(store, 11), going = hello(store, 12), silent = hello(store, 13), busy = hello(store, 14), removed = hello(store, 15), trading = hello(store, 16), guild = createGuild(store, owner, "B");
  for (const member of [joined, going, silent, busy, removed, trading]) joinGuild(store, owner, member, guild.guildId);
  const plan = createPlan(store, owner, now + 10 * MINUTE, { purpose: "raid", floor: 700 }); assert.equal(store.respondGuildPlan(going.session, plan.planId, "going").ok, true);
  const targetRoom = store.createRoom(owner.session).room, gathered = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(gathered.ok, true); assert.equal(store.joinGuildRecruitment(joined.session, gathered.gathering.recruitmentId).ok, true);
  const busyRoom = store.createRoom(busy.session).room; store.rooms.get(busyRoom.roomId).phase = "raid"; store.rooms.get(targetRoom.roomId).removedMemberIds.add(removed.session.playerId);
  const originalBlocksContent = store.trade.blocksContent.bind(store.trade); store.trade.blocksContent = id => id === trading.session.playerId || originalBlocksContent(id);
  clearMessages(owner, joined, going, silent, busy, removed, trading);

  store.pruneExpired();
  for (const player of [owner, joined, going, silent, busy, removed, trading]) assert.equal(reminders(player, "live").length, 0, "a full gathering is not joinable");

  assert.equal(store.leaveRoom(joined.session).ok, true); clearMessages(owner, joined, going, silent, busy, removed, trading); store.pruneExpired();
  for (const player of [joined, going, silent]) {
    const [message] = reminders(player, "live"); assert.ok(message, `${player.session.playerId} should receive a live reminder`);
    assert.deepEqual(Object.keys(message.plan.gathering).sort(), ["count", "expiresAt", "joined", "max", "recruitmentId", "slots"]);
    assert.equal(message.plan.gathering.joined, false); assert.equal(message.plan.gathering.count, 1); assert.equal(message.plan.gathering.slots, 1);
    for (const forbidden of ["roomId", "guildId", "creatorId", "playerId", "hostPlayerId", "attendees", "responses"]) assert.equal(JSON.stringify(message).includes(`\"${forbidden}\"`), false);
  }
  for (const player of [owner, busy, removed, trading]) assert.equal(reminders(player, "live").length, 0);
  store.pruneExpired(); for (const player of [joined, going, silent]) assert.equal(reminders(player, "live").length, 1);

  store.rooms.get(busyRoom.roomId).phase = "lobby"; store.trade.blocksContent = originalBlocksContent; clearMessages(busy, trading); store.pruneExpired();
  assert.equal(reminders(busy, "live").length, 1, "returning to a lobby makes the live gathering joinable");
  assert.equal(reminders(trading, "live").length, 1, "finishing a trade makes the live gathering joinable");
  assert.equal(reminders(removed, "live").length, 0, "a removed player cannot be reminded to rejoin the same room");

  assert.equal(store.closeGuildRecruitment(owner.session, gathered.gathering.recruitmentId).ok, true); now += 10_001; const reopened = store.gatherGuildPlan(owner.session, plan.planId); assert.equal(reopened.ok, true); clearMessages(joined, going, silent, busy, removed, trading); store.pruneExpired();
  for (const player of [joined, going, silent, busy, trading]) assert.equal(reminders(player, "live").length, 0, "reopening the same plan does not repeat its live phase");

  now = reopened.gathering.expiresAt; clearMessages(joined, going, silent, busy, removed, trading); store.pruneExpired();
  for (const player of [joined, going, silent, busy, removed, trading]) assert.equal(reminders(player, "live").length, 0, "expired gathering reminders stop at the exact boundary");
});

test("build238 reminder dispatch is transient, bounded and never changes guild persistence, economy or activity", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-guild-reminder-")), stateFile = join(folder, "guilds.json"); let now = Date.UTC(2026, 7, 30, 4, 0, 0);
  const store = new RoomStore({ now: () => now, guildStateFile: stateFile }), owner = hello(store, 30), member = hello(store, 31), guild = createGuild(store, owner, "C"); joinGuild(store, owner, member, guild.guildId); const plan = createPlan(store, owner, now + 10 * MINUTE); assert.equal(store.respondGuildPlan(member.session, plan.planId, "going").ok, true);
  const internal = store.guilds.guilds.get(guild.guildId), beforeFile = readFileSync(stateFile, "utf8"), before = { totalXp: internal.totalXp, week: structuredClone(internal.week), activity: structuredClone(internal.activity), plans: structuredClone(internal.plans) };
  owner.session.guildPlanReminderReceipts = Array.from({ length: 100 }, (_, index) => ({ key: `old:${index}`, expiresAt: now + 3 * HOUR })); clearMessages(owner, member); store.pruneExpired();
  assert.equal(reminders(owner, "window").length, 1); assert.equal(reminders(member, "window").length, 1); assert.ok(owner.session.guildPlanReminderReceipts.length <= 48);
  assert.equal(readFileSync(stateFile, "utf8"), beforeFile); assert.deepEqual({ totalXp: internal.totalXp, week: structuredClone(internal.week), activity: structuredClone(internal.activity), plans: structuredClone(internal.plans) }, before);

  assert.equal(store.cancelGuildPlan(owner.session, plan.planId).ok, true); clearMessages(owner, member); store.pruneExpired(); assert.equal(reminders(owner).length, 0); assert.equal(reminders(member).length, 0);
  assert.equal(store.guildState(owner.session).state.guild.plans.length, 0); assert.equal(store.guildState(owner.session).state.serverNow, now);

  const departingPlan = createPlan(store, member, now + 10 * MINUTE); clearMessages(owner, member); assert.equal(store.kickGuild(owner.session, member.session.playerId).ok, true); store.pruneExpired();
  assert.equal(reminders(member).length, 0); assert.equal(store.guilds.guilds.get(guild.guildId).plans.some(entry => entry.planId === departingPlan.planId), false, "removing an organizer also removes their pending reminder source");
});
