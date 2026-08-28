import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { randomBytes } from "node:crypto";

const GUILD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const GUILD_ID = /^GD-[A-Z2-9]{6}$/;
const PLAYER_ID = /^AD-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const MAX_MEMBERS = 20;
const MAX_GUILDS = 250;
const INVITE_TTL_MS = 7 * 24 * 60 * 60_000;
const CHAT_LIMIT = 80;
const EVENT_RECEIPT_LIMIT = 512;
const ACTIVITY_PERSIST_LIMIT = 80;
const ACTIVITY_DTO_LIMIT = 40;
const RECENT_RECEIPT_LIMIT = 512;
const RECENT_RECEIPT_TTL_MS = 24 * 60 * 60_000;
const WEEK_GOALS = Object.freeze([50, 200, 500, 1_000]);
const SHARED_GOAL_TARGETS = Object.freeze({ expedition: 3, boss: 3, raid: 1, team: 3, resonance: 1 });
const ACTIVITY_KINDS = new Set(["checkIn", "expedition", "floorBoss", "coopBoss", "raid", "team", "resonance"]);
const ACTIVITY_ID = /^[A-Za-z0-9_-]{18,96}$/;
const RECRUITMENT_TTL_MS = 30 * 60_000;
const RECRUITMENT_NOTE_LIMIT = 48;
const RECRUITMENT_PER_GUILD_LIMIT = 20;
const RECRUITMENT_GLOBAL_LIMIT = 1_000;
const RECRUITMENT_PURPOSES = new Set(["explore", "raid", "team", "resonance", "social"]);
const RECRUITMENT_STYLES = new Set(["anyone", "casual", "help", "fast"]);
const PLAN_LIMIT = 8;
const PLAN_CREATOR_LIMIT = 2;
const PLAN_NOTE_LIMIT = 48;
const PLAN_MIN_LEAD_MS = 10 * 60_000;
const PLAN_MAX_LEAD_MS = 14 * 24 * 60 * 60_000;
const PLAN_RETENTION_MS = 2 * 60 * 60_000;
const PLAN_GATHER_OPEN_MS = 30 * 60_000;
const PLAN_GATHER_MIN_TTL_MS = 30 * 60_000;
const PLAN_GATHER_AFTER_START_MS = 30 * 60_000;
const PLAN_REMINDER_RECEIPT_LIMIT = 48;
const PLAN_ID = /^[A-Za-z0-9_-]{18,96}$/;
const PLAN_PURPOSES = RECRUITMENT_PURPOSES;
const PLAN_STYLES = RECRUITMENT_STYLES;
const PLAN_RESPONSES = new Set(["going", "maybe"]);

function text(value, max = 32) { return Array.from(String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "").trim()).slice(0, max).join(""); }
function playerId(value) { const id = text(value, 20).toUpperCase(); return PLAYER_ID.test(id) ? id : ""; }
function guildId(value) { const id = text(value, 10).toUpperCase(); return GUILD_ID.test(id) ? id : ""; }
function inviteToken() { return randomBytes(14).toString("base64url"); }
function guildCode() { const bytes = randomBytes(6); return `GD-${Array.from(bytes, value => GUILD_ALPHABET[value % GUILD_ALPHABET.length]).join("")}`; }
function weekId(now) { const date = new Date(now), day = date.getUTCDay(), monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - (day + 6) % 7)); return monday.toISOString().slice(0, 10); }
function dayId(now) { const date = new Date(now + 9 * 60 * 60_000); return date.toISOString().slice(0, 10); }
function validDayId(value) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const parsed = new Date(`${value}T00:00:00.000Z`); return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value; }
function validWeekId(value) { if (!validDayId(value)) return false; return new Date(`${value}T00:00:00.000Z`).getUTCDay() === 1; }
function roleOf(guild, id) { return guild.leaderId === id ? "leader" : guild.officerIds.has(id) ? "officer" : "member"; }
function roleRank(role) { return role === "leader" ? 3 : role === "officer" ? 2 : 1; }
function emptyGoalCounts() { return Object.fromEntries(Object.keys(SHARED_GOAL_TARGETS).map(key => [key, 0])); }
function saturatedGoalCounts(source = {}) { const result = emptyGoalCounts(); for (const [key, target] of Object.entries(SHARED_GOAL_TARGETS)) result[key] = Math.max(0, Math.min(target, Math.floor(Number(source?.[key]) || 0))); return result; }
function legacyGoalCounts(eventIds = []) {
  const counts = emptyGoalCounts();
  for (const raw of new Set(Array.isArray(eventIds) ? eventIds : [])) {
    const value = String(raw ?? "");
    if (value.startsWith("expeditionEnded:")) counts.expedition++;
    else if (value.startsWith("floorBossDefeated:") || value.startsWith("expeditionEvent:")) counts.boss++;
    else if (value.startsWith("raidEnded:")) counts.raid++;
    else if (value.startsWith("teamBattleEnded:")) counts.team++;
    else if (value.startsWith("resonanceEnded:")) counts.resonance++;
  }
  return saturatedGoalCounts(counts);
}

export class GuildCoordinator {
  constructor({ now = () => Date.now(), sessions, rooms, send = () => {}, profileOf = id => ({ playerId: id }), playerExists = () => false, areFriends = () => false, isContentBlocked = () => false, isInteractionBlocked = () => false, isMuted = () => false, maxRoomMembers = 4, stateFile = null } = {}) {
    this.now = now; this.sessions = sessions; this.rooms = rooms; this.send = send; this.profileOf = profileOf; this.playerExists = playerExists; this.areFriends = areFriends; this.stateFile = stateFile ? String(stateFile) : null;
    this.maxRoomMembers = Math.max(1, Math.min(4, Math.floor(Number(maxRoomMembers) || 4))); this.isContentBlocked = isContentBlocked; this.isInteractionBlocked = isInteractionBlocked; this.isMuted = isMuted;
    this.guilds = new Map(); this.memberships = new Map(); this.applications = new Map(); this.invites = new Map(); this.checkIns = new Map(); this.presenceSignatures = new Map(); this.recruitments = new Map(); this.recruitmentByRoom = new Map(); this.lastPersistenceError = null; this._load();
  }

  _rate(session, key, windowMs, maximum) { const now = this.now(); session.guildRates ??= {}; let state = session.guildRates[key]; if (!state || now < state.startedAt || now - state.startedAt >= windowMs) state = session.guildRates[key] = { startedAt: now, count: 0 }; if (state.count >= maximum) return false; state.count++; return true; }
  _guildFor(playerIdValue) { return this.guilds.get(this.memberships.get(playerIdValue)) ?? null; }
  _blocked(leftId, rightId) { return Boolean(leftId && rightId && leftId !== rightId && this.isInteractionBlocked(leftId, rightId)); }
  _authorized(guild, id, minimum = "officer") { return Boolean(guild?.memberIds.has(id) && roleRank(roleOf(guild, id)) >= roleRank(minimum)); }
  _ensureWeek(guild, at = this.now()) {
    const current = weekId(at), stored = text(guild.week?.weekId, 10), validStored = validWeekId(stored);
    if (!validStored || current > stored) { guild.week = { weekId: current, points: 0, memberPoints: {}, eventIds: [], checkIns: {}, goalCounts: emptyGoalCounts() }; return true; }
    if (!guild.week.goalCounts) { guild.week.goalCounts = legacyGoalCounts(guild.week.eventIds); return true; }
    const normalized = saturatedGoalCounts(guild.week.goalCounts);
    if (JSON.stringify(normalized) !== JSON.stringify(guild.week.goalCounts)) { guild.week.goalCounts = normalized; return true; }
    return false;
  }
  _publicGuild(guild) { if (!guild) return null; this._ensureWeek(guild); return { guildId: guild.guildId, name: guild.name, tag: guild.tag, description: guild.description, level: Math.min(50, 1 + Math.floor(guild.totalXp / 500)), memberCount: guild.memberIds.size, maxMembers: MAX_MEMBERS, leaderId: guild.leaderId, week: { weekId: guild.week.weekId, points: guild.week.points, goals: [...WEEK_GOALS], tier: WEEK_GOALS.filter(goal => guild.week.points >= goal).length } }; }
  _member(guild, id, viewerId = null) { const source = this.profileOf(id) ?? {}, session = this.sessions.get(id), blocked = this._blocked(viewerId, id); return { playerId: id, displayName: text(source.displayName, 16) || "冒険者", monsterName: text(source.monsterName, 32) || "仲間", fallbackEmoji: text(source.fallbackEmoji, 8) || "魔", online: blocked ? false : Boolean(session?.connected), role: roleOf(guild, id), joinedAt: Number(guild.joinedAt[id]) || 0, weekPoints: Math.max(0, Number(guild.week.memberPoints[id]) || 0) }; }
  _sharedGoals(guild) { return Object.entries(SHARED_GOAL_TARGETS).map(([id, target]) => { const current = Math.max(0, Math.min(target, Math.floor(Number(guild.week.goalCounts?.[id]) || 0))); return { id, current, target, completed: current >= target }; }); }
  _planDto(guild, entry, viewerId) {
    if (!entry) return null;
    const organizerProfile = this.profileOf(entry.creatorId) ?? {}, statusRank = status => status === "going" ? 0 : 1;
    const attendees = Object.entries(entry.responses ?? {}).filter(([id, status]) => guild.memberIds.has(id) && PLAN_RESPONSES.has(status)).map(([id, status]) => { const profile = this.profileOf(id) ?? {}; return { displayName: text(profile.displayName, 16) || "冒険者", fallbackEmoji: text(profile.fallbackEmoji, 8) || "魔", status }; }).sort((left, right) => statusRank(left.status) - statusRank(right.status) || left.displayName.localeCompare(right.displayName, "ja"));
    const goingCount = attendees.filter(entry => entry.status === "going").length, maybeCount = attendees.filter(entry => entry.status === "maybe").length;
    const gatherOpensAt = entry.scheduledAt - PLAN_GATHER_OPEN_MS, gatherClosesAt = entry.scheduledAt + PLAN_RETENTION_MS, gathering = this._planGatheringDto(guild, entry, viewerId);
    return { planId: entry.planId, purpose: entry.purpose, style: entry.style, note: entry.note, floor: entry.floor, scheduledAt: entry.scheduledAt, createdAt: entry.createdAt, organizer: { displayName: text(organizerProfile.displayName, 16) || "冒険者", fallbackEmoji: text(organizerProfile.fallbackEmoji, 8) || "魔" }, attendees, goingCount, maybeCount, myStatus: PLAN_RESPONSES.has(entry.responses?.[viewerId]) ? entry.responses[viewerId] : "none", canCancel: entry.creatorId === viewerId || this._authorized(guild, viewerId), canGather: entry.creatorId === viewerId, gatherOpensAt, gatherClosesAt, gathering };
  }
  _plansForGuild(guild, viewerId) { const at = this.now(); return [...(guild?.plans ?? [])].filter(entry => entry.scheduledAt + PLAN_RETENTION_MS > at).sort((left, right) => left.scheduledAt - right.scheduledAt || left.createdAt - right.createdAt || left.planId.localeCompare(right.planId)).slice(0, PLAN_LIMIT).map(entry => this._planDto(guild, entry, viewerId)).filter(Boolean); }
  _activityDto(guild, entry) {
    if (!entry || !ACTIVITY_KINDS.has(entry.kind)) return null;
    const participantLimit = entry.kind === "checkIn" ? MAX_MEMBERS : this.maxRoomMembers, at = Math.max(0, Number(entry.at) || 0), actors = [...new Set(Array.isArray(entry.actorIds) ? entry.actorIds : [])].slice(0, participantLimit).map(id => { const profile = this.profileOf(id) ?? {}; return { displayName: text(profile.displayName, 16) || "冒険者", fallbackEmoji: text(profile.fallbackEmoji, 8) || "魔" }; });
    const dto = { activityId: text(entry.activityId, 96), kind: entry.kind, at, points: Math.max(0, Math.floor(Number(entry.points) || 0)), actors, partySize: Math.max(1, Math.min(participantLimit, Math.floor(Number(entry.partySize) || 1))), guildMemberCount: Math.max(1, Math.min(participantLimit, Math.floor(Number(entry.guildMemberCount) || actors.length || 1))) };
    if (Number.isFinite(Number(entry.floor))) dto.floor = Math.max(1, Math.min(10_000, Math.floor(Number(entry.floor))));
    return ACTIVITY_ID.test(dto.activityId) && dto.at > 0 ? dto : null;
  }
  _guildSnapshot(guild, viewerId) {
    this._ensureWeek(guild);
    const members = [...guild.memberIds].map(id => this._member(guild, id, viewerId)).sort((a, b) => roleRank(b.role) - roleRank(a.role) || Number(b.online) - Number(a.online) || a.joinedAt - b.joinedAt), role = roleOf(guild, viewerId), manager = roleRank(role) >= 2, publicGuild = this._publicGuild(guild);
    const today = dayId(this.now()), lastCheckIn = this.checkIns.get(viewerId) ?? "";
    return { ...publicGuild, week: { ...publicGuild.week, sharedGoals: this._sharedGoals(guild) }, role, members, applications: manager ? [...(this.applications.get(guild.guildId) ?? [])].map(id => this._member(guild, id, viewerId)) : [], chat: guild.chat.filter(entry => !this._blocked(viewerId, entry.playerId) && !this.isMuted(viewerId, entry.playerId)).slice(-CHAT_LIMIT).map(entry => ({ ...entry })), plans: this._plansForGuild(guild, viewerId), recruitments: this._recruitmentsForGuild(guild, viewerId), activities: guild.activity.slice(-ACTIVITY_DTO_LIMIT).reverse().map(entry => this._activityDto(guild, entry)).filter(Boolean), checkedInToday: lastCheckIn >= today };
  }
  snapshot(id) { this.prune({ pushRecruitments: false, pruneRecruitments: false, pushPlans: false, prunePlans: false }); const guild = this._guildFor(id), invitations = [...this.invites.values()].filter(entry => entry.toId === id && !this._blocked(id, entry.fromId)).map(entry => ({ inviteId: entry.inviteId, guild: this._publicGuild(this.guilds.get(entry.guildId)), from: this.profileOf(entry.fromId), expiresAt: entry.expiresAt })).filter(entry => entry.guild); const applications = [...this.applications].filter(([, ids]) => ids.has(id)).map(([targetGuildId]) => this._publicGuild(this.guilds.get(targetGuildId))).filter(Boolean); return { serverNow: this.now(), guild: guild ? this._guildSnapshot(guild, id) : null, invitations, applications, lookup: null } }
  push(id) { if (this.sessions.get(id)?.connected) this.send(id, { type: "guildState", state: this.snapshot(id) }); }
  _pushGuild(guild) { if (!guild) return; for (const id of guild.memberIds) this.push(id); }
  notePresence(session, { pushSelf = true, force = false } = {}) { if (!session) return; const signature = `${Boolean(session.connected)}:${session.roomId || ""}`, changed = force || this.presenceSignatures.get(session.playerId) !== signature; this.presenceSignatures.set(session.playerId, signature); if (!changed) return; const guild = this._guildFor(session.playerId); if (pushSelf) this.push(session.playerId); for (const id of guild?.memberIds ?? []) if (id !== session.playerId) this.push(id); }
  _clearPersistentState() { this.guilds.clear(); this.memberships.clear(); this.applications.clear(); this.invites.clear(); this.checkIns.clear(); }
  _commit() { if (this._save()) return null; const error = this.lastPersistenceError; this._clearPersistentState(); try { this._load(); } catch {} this.lastPersistenceError = error; return { ok: false, code: "PERSISTENCE_ERROR", message: "ギルド情報を保存できません。サーバーの保存先を確認してください" }; }
  persistenceHealthy() { return !this.lastPersistenceError; }

  _planReminderReceipts(session, at = this.now()) {
    const source = Array.isArray(session?.guildPlanReminderReceipts) ? session.guildPlanReminderReceipts : [];
    const receipts = source.filter(entry => entry && typeof entry.key === "string" && Number(entry.expiresAt) > at).slice(-PLAN_REMINDER_RECEIPT_LIMIT);
    if (session) session.guildPlanReminderReceipts = receipts;
    return receipts;
  }
  _hasPlanReminder(session, key, at = this.now()) { return this._planReminderReceipts(session, at).some(entry => entry.key === key); }
  _rememberPlanReminder(session, key, expiresAt, at = this.now()) {
    const receipts = this._planReminderReceipts(session, at).filter(entry => entry.key !== key);
    receipts.push({ key, expiresAt: Math.max(at + 1, Number(expiresAt) || at + 1) });
    session.guildPlanReminderReceipts = receipts.slice(-PLAN_REMINDER_RECEIPT_LIMIT);
  }
  _planReminderDto(plan, phase, at, gathering = null) {
    const organizerProfile = this.profileOf(plan.creatorId) ?? {}, payload = {
      type: "guildPlanReminder", serverNow: at, phase,
      plan: {
        planId: plan.planId, purpose: plan.purpose, style: plan.style,
        floor: Math.max(1, Math.min(10_000, Math.floor(Number(plan.floor) || 1))),
        scheduledAt: plan.scheduledAt,
        organizer: { displayName: text(organizerProfile.displayName, 16) || "冒険者", fallbackEmoji: text(organizerProfile.fallbackEmoji, 8) || "魔" }
      }
    };
    if (phase === "live" && gathering) payload.plan.gathering = {
      recruitmentId: gathering.recruitmentId,
      count: gathering.count, max: gathering.max, slots: gathering.slots,
      expiresAt: gathering.expiresAt, joined: false
    };
    return payload;
  }
  _livePlanReminderFor(active, viewerId) {
    const entry = active?.entry, room = active?.room, viewer = this.sessions.get(viewerId), current = viewer?.roomId ? this.rooms.get(viewer.roomId) : null;
    if (!entry || !room || !viewer?.connected || this._blocked(viewerId, entry.publisherId) || [...room.members].some(id => this._blocked(viewerId, id)) || room.members.has(viewerId) || room.members.size >= this.maxRoomMembers || this.isContentBlocked(viewerId)) return null;
    if (room.removedMemberIds?.has(viewerId) || (current && current.roomId !== room.roomId && current.phase !== "lobby")) return null;
    return { recruitmentId: entry.recruitmentId, count: room.members.size, max: this.maxRoomMembers, slots: this.maxRoomMembers - room.members.size, expiresAt: entry.expiresAt, joined: false };
  }
  dispatchPlanReminders() {
    const at = this.now(), gatheringByPlan = new Map();
    for (const entry of this.recruitments.values()) if (entry.sourcePlanId) gatheringByPlan.set(`${entry.guildId}:${entry.sourcePlanId}`, entry);
    for (const guild of this.guilds.values()) {
      const plans = [...(guild.plans ?? [])].filter(entry => entry.scheduledAt + PLAN_RETENTION_MS > at).sort((left, right) => left.scheduledAt - right.scheduledAt || left.createdAt - right.createdAt || left.planId.localeCompare(right.planId)).slice(0, PLAN_LIMIT);
      for (const entry of plans) {
        const closesAt = entry.scheduledAt + PLAN_RETENTION_MS, recruitment = gatheringByPlan.get(`${guild.guildId}:${entry.planId}`), activeGathering = recruitment && this._recruitmentValid(recruitment) ? { entry: recruitment, room: this.rooms.get(recruitment.roomId) } : null;
        for (const viewerId of guild.memberIds) {
          const viewer = this.sessions.get(viewerId); if (!viewer?.connected || this._blocked(viewerId, entry.creatorId)) continue;
          const windowKey = `window:${entry.planId}`, liveGathering = this._livePlanReminderFor(activeGathering, viewerId);
          if (liveGathering) {
            const liveKey = `live:${entry.planId}`;
            if (this._hasPlanReminder(viewer, liveKey, at)) continue;
            this._rememberPlanReminder(viewer, windowKey, closesAt, at);
            this._rememberPlanReminder(viewer, liveKey, closesAt, at);
            this.send(viewerId, this._planReminderDto(entry, "live", at, liveGathering));
            continue;
          }
          const response = entry.responses?.[viewerId], relevant = entry.creatorId === viewerId || PLAN_RESPONSES.has(response);
          if (!relevant || at < entry.scheduledAt - PLAN_GATHER_OPEN_MS || at >= closesAt || this._hasPlanReminder(viewer, windowKey, at)) continue;
          this._rememberPlanReminder(viewer, windowKey, closesAt, at);
          this.send(viewerId, this._planReminderDto(entry, "window", at));
        }
      }
    }
  }

  _recruitmentSignature(entry, room) {
    const host = this.sessions.get(entry.publisherId), profile = host?.profile ?? {};
    return [room?.phase, room?.leaderId, room?.members?.size, room?.selectedFloor, Boolean(host?.connected), profile.displayName, profile.monsterName, profile.speciesId, profile.fallbackEmoji, profile.level].join(":");
  }
  _recruitmentValid(entry) {
    const room = entry ? this.rooms.get(entry.roomId) : null, host = entry ? this.sessions.get(entry.publisherId) : null;
    const guild = entry ? this.guilds.get(entry.guildId) : null, linkedPlan = entry?.sourcePlanId ? (guild?.plans ?? []).find(plan => plan.planId === entry.sourcePlanId) : null;
    const planValid = !entry?.sourcePlanId || Boolean(linkedPlan && linkedPlan.creatorId === entry.publisherId && room?.ownerId === entry.publisherId && room?.listing?.published !== true && room?.members instanceof Set && ![...room.members].some(id => this.isContentBlocked(id)) && (linkedPlan.purpose !== "explore" || room.selectedFloor === linkedPlan.floor));
    const capacityValid = entry?.sourcePlanId ? room?.members?.size <= this.maxRoomMembers : room?.members?.size < this.maxRoomMembers;
    return Boolean(entry && room && room.guildRecruitmentId === entry.recruitmentId && room.guildAudienceId === entry.guildId && entry.expiresAt > this.now() && room.phase === "lobby" && room.leaderId === entry.publisherId && host?.connected && host.roomId === room.roomId && room.members instanceof Set && room.members.size > 0 && capacityValid && this.memberships.get(entry.publisherId) === entry.guildId && [...room.members].every(id => this.memberships.get(id) === entry.guildId) && planValid);
  }
  _planGatheringDto(guild, plan, viewerId) {
    const entry = [...this.recruitments.values()].find(candidate => candidate.guildId === guild.guildId && candidate.sourcePlanId === plan.planId);
    const room = entry ? this.rooms.get(entry.roomId) : null; if (!entry || [...(room?.members ?? [])].some(id => this._blocked(viewerId, id)) || !this._recruitmentValid(entry)) return null;
    const viewer = this.sessions.get(viewerId), count = room.members.size;
    return { recruitmentId: entry.recruitmentId, hostPlayerId: entry.publisherId, count, max: this.maxRoomMembers, slots: Math.max(0, this.maxRoomMembers - count), expiresAt: entry.expiresAt, joined: Boolean(viewer?.roomId === room.roomId && room.members.has(viewerId)) };
  }
  _dropRecruitment(entry) {
    if (!entry) return null;
    this.recruitments.delete(entry.recruitmentId);
    if (this.recruitmentByRoom.get(entry.roomId) === entry.recruitmentId) this.recruitmentByRoom.delete(entry.roomId);
    const room = this.rooms.get(entry.roomId);
    if (room?.guildRecruitmentId === entry.recruitmentId) { room.guildRecruitmentId = null; room.guildAudienceId = null; }
    return entry.guildId;
  }
  _pushRecruitmentGuilds(ids) { for (const id of ids ?? []) this._pushGuild(this.guilds.get(id)); }
  _pruneRecruitments() {
    const touched = new Set();
    for (const entry of [...this.recruitments.values()]) {
      if (!this._recruitmentValid(entry)) { const id = this._dropRecruitment(entry); if (id) touched.add(id); }
    }
    return touched;
  }
  _dropPlanRecruitments(guildIdValue, planIds) {
    const ids = new Set(planIds ?? []), touched = new Set();
    for (const entry of [...this.recruitments.values()]) if (entry.guildId === guildIdValue && ids.has(entry.sourcePlanId)) { const id = this._dropRecruitment(entry); if (id) touched.add(id); }
    return touched;
  }
  _recruitmentDto(entry, viewerId = null) {
    const room = this.rooms.get(entry.roomId), hostSession = this.sessions.get(entry.publisherId), profile = hostSession?.profile ?? this.profileOf(entry.publisherId) ?? {};
    if (!room || [...room.members].some(id => this._blocked(viewerId, id))) return null;
    return { recruitmentId: entry.recruitmentId, purpose: entry.purpose, style: entry.style, note: entry.note, floor: Math.max(1, Math.min(10_000, Math.floor(Number(room.selectedFloor) || 1))), count: room.members.size, max: this.maxRoomMembers, slots: Math.max(0, this.maxRoomMembers - room.members.size), host: { playerId: entry.publisherId, displayName: text(profile.displayName, 16) || "冒険者", monsterName: text(profile.monsterName, 32) || "仲間", speciesId: text(profile.speciesId, 80) || "slime", fallbackEmoji: text(profile.fallbackEmoji, 8) || "魔", level: Math.max(1, Math.floor(Number(profile.level) || 1)) }, createdAt: entry.createdAt, expiresAt: entry.expiresAt };
  }
  _recruitmentsForGuild(guild, viewerId = null) {
    if (!guild) return [];
    return [...this.recruitments.values()].filter(entry => entry.guildId === guild.guildId && !entry.sourcePlanId && this._recruitmentValid(entry)).sort((left, right) => left.createdAt - right.createdAt || left.recruitmentId.localeCompare(right.recruitmentId)).slice(0, RECRUITMENT_PER_GUILD_LIMIT).map(entry => this._recruitmentDto(entry, viewerId)).filter(Boolean);
  }
  createRecruitment(session, room, source = {}) {
    const guild = this._guildFor(session?.playerId);
    if (!guild) return { ok: false, code: "GUILD_NOT_MEMBER", message: "ギルドへ所属していません" };
    if (!room || session?.roomId !== room.roomId) return { ok: false, code: "NOT_IN_ROOM", message: "部屋に参加していません" };
    if (room.leaderId !== session.playerId) return { ok: false, code: "LEADER_ONLY", message: "募集を作成できるのは部屋主だけです" };
    if (room.phase !== "lobby") return { ok: false, code: "ROOM_BUSY", message: "ロビーに戻ってから募集してください" };
    if (room.members.size >= this.maxRoomMembers) return { ok: false, code: "ROOM_FULL", message: "満員の部屋は募集できません" };
    if (![...room.members].every(id => this.memberships.get(id) === guild.guildId)) return { ok: false, code: "GUILD_RECRUITMENT_MIXED_ROOM", message: "ギルドメンバーだけの部屋で募集してください" };
    this._pushRecruitmentGuilds(this._pruneRecruitments());
    const replacements = new Set();
    const roomRecruitmentId = this.recruitmentByRoom.get(room.roomId); if (roomRecruitmentId) replacements.add(roomRecruitmentId);
    for (const entry of this.recruitments.values()) if (entry.publisherId === session.playerId) replacements.add(entry.recruitmentId);
    if ([...replacements].some(id => this.recruitments.get(id)?.sourcePlanId)) return { ok: false, code: "GUILD_PLAN_GATHERING_CONFLICT", message: "遠征予定の集合を終了してから通常募集を作成してください" };
    if (!this._rate(session, "recruitmentCreate", 2_000, 1)) return { ok: false, code: "GUILD_RECRUITMENT_RATE", message: "少し待ってから募集を更新してください" };
    const guildCount = [...this.recruitments.values()].filter(entry => entry.guildId === guild.guildId && !replacements.has(entry.recruitmentId)).length;
    if (guildCount >= RECRUITMENT_PER_GUILD_LIMIT) return { ok: false, code: "GUILD_RECRUITMENT_LIMIT", message: "このギルドの募集枠はいっぱいです" };
    if (this.recruitments.size - replacements.size >= RECRUITMENT_GLOBAL_LIMIT) return { ok: false, code: "GUILD_RECRUITMENT_CAPACITY", message: "現在は新しい募集を作成できません" };
    for (const id of replacements) this._dropRecruitment(this.recruitments.get(id));
    const createdAt = this.now(), recruitmentId = inviteToken(), entry = { recruitmentId, guildId: guild.guildId, roomId: room.roomId, publisherId: session.playerId, sourcePlanId: null, purpose: RECRUITMENT_PURPOSES.has(String(source.purpose ?? "")) ? String(source.purpose) : "explore", style: RECRUITMENT_STYLES.has(String(source.style ?? "")) ? String(source.style) : "anyone", note: text(source.note, RECRUITMENT_NOTE_LIMIT), createdAt, expiresAt: createdAt + RECRUITMENT_TTL_MS, signature: "" };
    room.guildAudienceId = guild.guildId; room.guildRecruitmentId = recruitmentId; entry.signature = this._recruitmentSignature(entry, room); this.recruitments.set(recruitmentId, entry); this.recruitmentByRoom.set(room.roomId, recruitmentId); this._pushGuild(guild);
    return { ok: true, recruitment: this._recruitmentDto(entry) };
  }
  gatherPlan(session, room, rawPlanId = "") {
    this.prune({ prunePlans: false });
    const guild = this._guildFor(session?.playerId);
    if (!guild) return { ok: false, code: "GUILD_NOT_MEMBER", message: "ギルドへ所属していません" };
    const planId = text(rawPlanId, 96), plan = (guild.plans ?? []).find(entry => entry.planId === planId);
    if (!PLAN_ID.test(planId) || !plan) return { ok: false, code: "GUILD_PLAN_MISSING", message: "その予定は終了しました" };
    if (plan.creatorId !== session.playerId) return { ok: false, code: "GUILD_PLAN_GATHER_CREATOR_ONLY", message: "集合を始められるのは予定の作成者だけです" };
    const at = this.now(), opensAt = plan.scheduledAt - PLAN_GATHER_OPEN_MS, closesAt = plan.scheduledAt + PLAN_RETENTION_MS;
    if (at < opensAt) return { ok: false, code: "GUILD_PLAN_GATHER_EARLY", message: "集合は開始30分前から利用できます" };
    if (at >= closesAt) return { ok: false, code: "GUILD_PLAN_GATHER_CLOSED", message: "この予定の集合時間は終了しました" };
    if (!room || session.roomId !== room.roomId) return { ok: false, code: "NOT_IN_ROOM", message: "先に自分のロビーを作成してください" };
    if (room.ownerId !== session.playerId || room.leaderId !== session.playerId) return { ok: false, code: "GUILD_PLAN_GATHER_OWNER_ONLY", message: "自分が世界主・部屋主のロビーで集合してください" };
    if (room.phase !== "lobby") return { ok: false, code: "ROOM_BUSY", message: "ロビーに戻ってから集合してください" };
    if (!(room.members instanceof Set) || room.members.size <= 0) return { ok: false, code: "ROOM_FULL", message: "空きのあるロビーで集合してください" };
    if (![...room.members].every(id => this.memberships.get(id) === guild.guildId)) return { ok: false, code: "GUILD_RECRUITMENT_MIXED_ROOM", message: "ギルドメンバーだけの部屋で集合してください" };
    if (room.listing?.published) return { ok: false, code: "RECRUITMENT_MODE_CONFLICT", message: "公開募集を停止してから集合してください" };
    if ([...room.members].some(id => this.isContentBlocked(id))) return { ok: false, code: "TRADE_ACTIVE", message: "交換を完了または中止してから集合してください" };
    this._pushRecruitmentGuilds(this._pruneRecruitments());
    const linked = [...this.recruitments.values()].find(entry => entry.guildId === guild.guildId && entry.sourcePlanId === plan.planId);
    if (linked && linked.roomId === room.roomId && linked.publisherId === session.playerId && this._recruitmentValid(linked)) { if (!this._rate(session, "planGatherRetry", 10_000, 4)) return { ok: false, code: "GUILD_PLAN_GATHER_RATE", message: "集合の再確認が多すぎます。少し待ってください" }; this.push(session.playerId); return { ok: true, duplicate: true, gathering: this._planGatheringDto(guild, plan, session.playerId) }; }
    if (linked) return { ok: false, code: "GUILD_PLAN_GATHERING_CONFLICT", message: "この予定ではすでに集合中です" };
    if (room.members.size >= this.maxRoomMembers) return { ok: false, code: "ROOM_FULL", message: "空きのあるロビーで集合してください" };
    const recentGatherAttempts = (Array.isArray(session.guildPlanGatherRecent) ? session.guildPlanGatherRecent : []).filter(entry => entry && entry.at > at - 10_000).slice(-4);
    if (recentGatherAttempts.some(entry => entry.planId === plan.planId) || !this._rate(session, "planGather", 60_000, 4)) return { ok: false, code: "GUILD_PLAN_GATHER_RATE", message: "集合操作が多すぎます。少し待ってください" };
    session.guildPlanGatherRecent = [...recentGatherAttempts, { planId: plan.planId, at }].slice(-4);
    const roomRecruitmentId = this.recruitmentByRoom.get(room.roomId) ?? room.guildRecruitmentId, ownRecruitment = [...this.recruitments.values()].find(entry => entry.publisherId === session.playerId);
    if (roomRecruitmentId || ownRecruitment) return { ok: false, code: "GUILD_PLAN_GATHERING_CONFLICT", message: "現在のギルド募集を終了してから集合してください" };
    if (plan.purpose === "explore" && plan.floor > Math.max(1, Math.floor(Number(session.profile?.maxFloor) || 1))) return { ok: false, code: "GUILD_PLAN_FLOOR_LOCKED", message: "まだ到達していない階層には集合できません" };
    const guildCount = [...this.recruitments.values()].filter(entry => entry.guildId === guild.guildId).length;
    if (guildCount >= RECRUITMENT_PER_GUILD_LIMIT) return { ok: false, code: "GUILD_RECRUITMENT_LIMIT", message: "このギルドの募集枠はいっぱいです" };
    if (this.recruitments.size >= RECRUITMENT_GLOBAL_LIMIT) return { ok: false, code: "GUILD_RECRUITMENT_CAPACITY", message: "現在は新しい募集を作成できません" };
    const expiresAt = Math.min(closesAt, Math.max(at + PLAN_GATHER_MIN_TTL_MS, plan.scheduledAt + PLAN_GATHER_AFTER_START_MS)), recruitmentId = inviteToken();
    const entry = { recruitmentId, guildId: guild.guildId, roomId: room.roomId, publisherId: session.playerId, sourcePlanId: plan.planId, purpose: plan.purpose, style: plan.style, note: plan.note, createdAt: at, expiresAt, signature: "" };
    if (plan.purpose === "explore" && room.selectedFloor !== plan.floor) { room.selectedFloor = plan.floor; for (const id of room.members) { const member = this.sessions.get(id); if (member) member.ready = false; } }
    room.guildAudienceId = guild.guildId; room.guildRecruitmentId = recruitmentId; entry.signature = this._recruitmentSignature(entry, room); this.recruitments.set(recruitmentId, entry); this.recruitmentByRoom.set(room.roomId, recruitmentId); this._pushGuild(guild);
    return { ok: true, gathering: this._planGatheringDto(guild, plan, session.playerId) };
  }
  closeRecruitment(session, room, rawRecruitmentId = "") {
    if (!room || session?.roomId !== room.roomId) return { ok: false, code: "NOT_IN_ROOM", message: "部屋に参加していません" };
    if (room.leaderId !== session.playerId) return { ok: false, code: "LEADER_ONLY", message: "募集を終了できるのは部屋主だけです" };
    const activeId = this.recruitmentByRoom.get(room.roomId) ?? room.guildRecruitmentId, requestedId = text(rawRecruitmentId, 96);
    if (!activeId) return { ok: true, duplicate: true };
    if (requestedId && requestedId !== activeId) return { ok: false, code: "GUILD_RECRUITMENT_UNAVAILABLE", message: "その募集はすでに更新または終了されています" };
    const entry = this.recruitments.get(activeId), guildIdValue = entry?.guildId ?? room.guildAudienceId; if (entry) this._dropRecruitment(entry); else { this.recruitmentByRoom.delete(room.roomId); room.guildRecruitmentId = null; room.guildAudienceId = null; }
    if (guildIdValue) this._pushGuild(this.guilds.get(guildIdValue));
    return { ok: true };
  }
  clearRoomRecruitment(room) {
    if (!room) return false; const activeId = this.recruitmentByRoom.get(room.roomId) ?? room.guildRecruitmentId, entry = activeId ? this.recruitments.get(activeId) : null, guildIdValue = entry?.guildId ?? room.guildAudienceId;
    if (entry) this._dropRecruitment(entry); else { this.recruitmentByRoom.delete(room.roomId); room.guildRecruitmentId = null; room.guildAudienceId = null; }
    if (guildIdValue) this._pushGuild(this.guilds.get(guildIdValue)); return Boolean(activeId || guildIdValue);
  }
  resolveRecruitment(session, rawRecruitmentId) {
    if (!session) return { ok: false, code: "NOT_READY", message: "先に接続してください" };
    if (!this._rate(session, "recruitmentJoin", 10_000, 8)) return { ok: false, code: "GUILD_RECRUITMENT_JOIN_RATE", message: "参加操作が多すぎます。少し待ってください" };
    this._pushRecruitmentGuilds(this._pruneRecruitments());
    const entry = this.recruitments.get(text(rawRecruitmentId, 96));
    if (!entry || !this._recruitmentValid(entry)) return { ok: false, code: "GUILD_RECRUITMENT_UNAVAILABLE", message: "その募集は終了しました" };
    if (this.memberships.get(session.playerId) !== entry.guildId) return { ok: false, code: "GUILD_RECRUITMENT_UNAVAILABLE", message: "その募集は終了しました" };
    const room = this.rooms.get(entry.roomId); if ([...(room?.members ?? [])].some(id => this._blocked(session.playerId, id))) return { ok: false, code: "GUILD_RECRUITMENT_UNAVAILABLE", message: "その募集は終了しました" };
    return { ok: true, roomId: entry.roomId, recruitmentId: entry.recruitmentId };
  }
  authorizeRoomJoin(session, room) { return !room?.guildAudienceId || this.memberships.get(session?.playerId) === room.guildAudienceId ? { ok: true } : { ok: false, code: "GUILD_RECRUITMENT_FORBIDDEN", message: "この部屋はギルドメンバー限定で募集中です" }; }
  canDiscoverRoom(playerIdValue, room) { return !room?.guildAudienceId || this.memberships.get(playerIdValue) === room.guildAudienceId; }
  roomChanged(room) {
    const activeId = room ? this.recruitmentByRoom.get(room.roomId) ?? room.guildRecruitmentId : null, entry = activeId ? this.recruitments.get(activeId) : null; if (!entry) return false;
    if (!this._recruitmentValid(entry)) { const guildIdValue = this._dropRecruitment(entry); if (guildIdValue) this._pushGuild(this.guilds.get(guildIdValue)); return true; }
    const signature = this._recruitmentSignature(entry, room); if (signature === entry.signature) return false; entry.signature = signature; this._pushGuild(this.guilds.get(entry.guildId)); return true;
  }
  roomRemoved(room) { return this.clearRoomRecruitment(room); }

  lookup(session, rawGuildId) { this.prune(); if (!this._rate(session, "lookup", 5_000, 8)) return { ok: false, code: "GUILD_RATE", message: "検索が多すぎます。少し待ってください" }; const guild = this.guilds.get(guildId(rawGuildId)); if (!guild) return { ok: false, code: "GUILD_NOT_FOUND", message: "そのギルドIDは見つかりません" }; return { ok: true, guild: this._publicGuild(guild) } }
  create(session, source = {}) {
    if (this._guildFor(session?.playerId)) return { ok: false, code: "GUILD_ALREADY_MEMBER", message: "すでにギルドへ所属しています" };
    if (!this._rate(session, "create", 60_000, 1)) return { ok: false, code: "GUILD_RATE", message: "少し待ってから作成してください" };
    const name = text(source.name, 16), tag = text(source.tag, 4).toUpperCase().replace(/\s/g, ""), description = text(source.description, 80);
    if (name.length < 2 || !/^[\p{L}\p{N}]{2,4}$/u.test(tag)) return { ok: false, code: "GUILD_NAME", message: "名前は2〜16文字、略称は文字・数字2〜4文字で入力してください" };
    if ([...this.guilds.values()].some(entry => entry.name.toLocaleLowerCase("ja") === name.toLocaleLowerCase("ja") || entry.tag === tag)) return { ok: false, code: "GUILD_NAME_USED", message: "同じ名前または略称が使われています" };
    if (this.guilds.size >= MAX_GUILDS) return { ok: false, code: "GUILD_CAPACITY", message: "現在は新しいギルドを作成できません" };
    let id; do id = guildCode(); while (this.guilds.has(id)); const now = this.now(), guild = { guildId: id, name, tag, description, leaderId: session.playerId, officerIds: new Set(), memberIds: new Set([session.playerId]), joinedAt: { [session.playerId]: now }, createdAt: now, totalXp: 0, week: { weekId: weekId(now), points: 0, memberPoints: {}, eventIds: [], checkIns: {}, goalCounts: emptyGoalCounts() }, chat: [], plans: [], activity: [], recentEventReceipts: [] };
    this.guilds.set(id, guild); this.memberships.set(session.playerId, id); const failure = this._commit(); if (failure) return failure; this.push(session.playerId); return { ok: true, guild: this._guildSnapshot(guild, session.playerId) }
  }
  apply(session, rawGuildId) { const id = guildId(rawGuildId), guild = this.guilds.get(id); if (this._guildFor(session?.playerId)) return { ok: false, code: "GUILD_ALREADY_MEMBER", message: "すでにギルドへ所属しています" }; if (!guild) return { ok: false, code: "GUILD_NOT_FOUND", message: "そのギルドは見つかりません" }; if (guild.memberIds.size >= MAX_MEMBERS) return { ok: false, code: "GUILD_FULL", message: "このギルドは満員です" }; if (!this._rate(session, "apply", 30_000, 3)) return { ok: false, code: "GUILD_RATE", message: "加入申請が多すぎます" }; const pendingCount = [...this.applications.values()].filter(ids => ids.has(session.playerId)).length, ids = this.applications.get(id) ?? new Set(); if (!ids.has(session.playerId) && pendingCount >= 3) return { ok: false, code: "GUILD_APPLICATION_LIMIT", message: "同時に申請できるギルドは3件までです" }; if (ids.size >= 100) return { ok: false, code: "GUILD_APPLICATIONS_FULL", message: "このギルドの申請受付はいっぱいです" }; ids.add(session.playerId); this.applications.set(id, ids); const failure = this._commit(); if (failure) return failure; this.push(session.playerId); this._pushGuild(guild); return { ok: true } }
  respondApplication(session, rawTargetId, accepted) { const guild = this._guildFor(session?.playerId), targetId = playerId(rawTargetId); if (!this._authorized(guild, session?.playerId)) return { ok: false, code: "GUILD_OFFICER_ONLY", message: "幹部以上だけが申請を処理できます" }; const ids = this.applications.get(guild.guildId) ?? new Set(); if (!ids.has(targetId)) return { ok: false, code: "GUILD_APPLICATION_MISSING", message: "この申請はすでに処理されています" }; if (accepted && this._blocked(session.playerId, targetId)) return { ok: false, code: "GUILD_APPLICATION_UNAVAILABLE", message: "この申請は承認できません" }; if (accepted) { const joined = this._join(guild, targetId); if (!joined.ok) return joined; } ids.delete(targetId); const failure = this._commit(); if (failure) return failure; this.push(targetId); this._pushGuild(guild); return { ok: true, accepted: Boolean(accepted) } }
  invite(session, rawTargetId) { const guild = this._guildFor(session?.playerId), targetId = playerId(rawTargetId); if (!this._authorized(guild, session?.playerId)) return { ok: false, code: "GUILD_OFFICER_ONLY", message: "幹部以上だけが招待できます" }; if (!targetId || !this.playerExists(targetId)) return { ok: false, code: "GUILD_PLAYER_MISSING", message: "相手を確認できません" }; if (!this.areFriends(session.playerId, targetId)) return { ok: false, code: "GUILD_FRIEND_REQUIRED", message: "フレンドだけを招待できます" }; if (this._guildFor(targetId)) return { ok: false, code: "GUILD_ALREADY_MEMBER", message: "相手はすでにギルドへ所属しています" }; if (guild.memberIds.size >= MAX_MEMBERS) return { ok: false, code: "GUILD_FULL", message: "このギルドは満員です" }; if (!this._rate(session, "invite", 10_000, 5)) return { ok: false, code: "GUILD_RATE", message: "招待が多すぎます" }; for (const [id, entry] of this.invites) if (entry.guildId === guild.guildId && entry.toId === targetId) this.invites.delete(id); const inviteId = inviteToken(); this.invites.set(inviteId, { inviteId, guildId: guild.guildId, fromId: session.playerId, toId: targetId, createdAt: this.now(), expiresAt: this.now() + INVITE_TTL_MS }); const failure = this._commit(); if (failure) return failure; this.push(session.playerId); this.push(targetId); return { ok: true, inviteId } }
  respondInvite(session, rawInviteId, accepted) { this.prune(); const inviteId = text(rawInviteId, 96), entry = this.invites.get(inviteId); if (!entry || entry.toId !== session?.playerId) return { ok: false, code: "GUILD_INVITE_MISSING", message: "この招待は期限切れです" }; const guild = this.guilds.get(entry.guildId); if (this._blocked(entry.fromId, session.playerId)) { this.invites.delete(inviteId); const failure = this._commit(); if (failure) return failure; return { ok: false, code: "GUILD_INVITE_MISSING", message: "この招待は期限切れです" }; } if (accepted) { if (!this._authorized(guild, entry.fromId) || !this.areFriends(entry.fromId, session.playerId)) return { ok: false, code: "GUILD_INVITE_REVOKED", message: "招待したメンバーの権限を確認できないため、この招待は無効です" }; const joined = this._join(guild, session.playerId); if (!joined.ok) return joined; } this.invites.delete(inviteId); const failure = this._commit(); if (failure) return failure; this.push(session.playerId); if (guild) this._pushGuild(guild); return { ok: true, accepted: Boolean(accepted) } }
  _join(guild, id) { if (!guild) return { ok: false, code: "GUILD_NOT_FOUND", message: "ギルドが見つかりません" }; if (this._guildFor(id)) return { ok: false, code: "GUILD_ALREADY_MEMBER", message: "すでにギルドへ所属しています" }; if (guild.memberIds.size >= MAX_MEMBERS) return { ok: false, code: "GUILD_FULL", message: "このギルドは満員です" }; guild.memberIds.add(id); guild.joinedAt[id] = this.now(); this.memberships.set(id, guild.guildId); for (const ids of this.applications.values()) ids.delete(id); for (const [inviteId, entry] of this.invites) if (entry.toId === id) this.invites.delete(inviteId); return { ok: true } }
  setRole(session, rawTargetId, role) { const guild = this._guildFor(session?.playerId), targetId = playerId(rawTargetId); if (guild?.leaderId !== session?.playerId) return { ok: false, code: "GUILD_LEADER_ONLY", message: "ギルドマスターだけが役職を変更できます" }; if (!guild.memberIds.has(targetId) || targetId === guild.leaderId) return { ok: false, code: "GUILD_MEMBER_MISSING", message: "対象メンバーを確認できません" }; if (!['officer', 'member'].includes(role)) return { ok: false, code: "GUILD_ROLE", message: "役職が正しくありません" }; if (role === "officer") guild.officerIds.add(targetId); else { guild.officerIds.delete(targetId); this._revokeInvitesFrom(guild, targetId); } const failure = this._commit(); if (failure) return failure; this._pushGuild(guild); return { ok: true } }
  transfer(session, rawTargetId) { const guild = this._guildFor(session?.playerId), targetId = playerId(rawTargetId); if (guild?.leaderId !== session?.playerId) return { ok: false, code: "GUILD_LEADER_ONLY", message: "ギルドマスターだけが権限を譲渡できます" }; if (!guild.memberIds.has(targetId) || targetId === guild.leaderId) return { ok: false, code: "GUILD_MEMBER_MISSING", message: "譲渡先を確認できません" }; guild.officerIds.delete(targetId); guild.officerIds.add(guild.leaderId); guild.leaderId = targetId; const failure = this._commit(); if (failure) return failure; this._pushGuild(guild); return { ok: true } }
  kick(session, rawTargetId) { const guild = this._guildFor(session?.playerId), targetId = playerId(rawTargetId); if (!this._authorized(guild, session?.playerId)) return { ok: false, code: "GUILD_OFFICER_ONLY", message: "幹部以上だけが除名できます" }; if (!guild.memberIds.has(targetId) || targetId === guild.leaderId || roleRank(roleOf(guild, session.playerId)) <= roleRank(roleOf(guild, targetId))) return { ok: false, code: "GUILD_ROLE", message: "このメンバーは除名できません" }; this._removeMember(guild, targetId); const failure = this._commit(); if (failure) return failure; this._pushRecruitmentGuilds(this._pruneRecruitments()); this.push(targetId); this._pushGuild(guild); return { ok: true } }
  leave(session) { const guild = this._guildFor(session?.playerId); if (!guild) return { ok: false, code: "GUILD_NOT_MEMBER", message: "ギルドへ所属していません" }; if (guild.leaderId === session.playerId && guild.memberIds.size > 1) return { ok: false, code: "GUILD_TRANSFER_REQUIRED", message: "先にギルドマスターを譲渡してください" }; if (guild.memberIds.size === 1) return this._disbandGuild(guild); this._removeMember(guild, session.playerId); const failure = this._commit(); if (failure) return failure; this._pushRecruitmentGuilds(this._pruneRecruitments()); this.push(session.playerId); this._pushGuild(guild); return { ok: true } }
  disband(session, rawName) { const guild = this._guildFor(session?.playerId); if (guild?.leaderId !== session?.playerId) return { ok: false, code: "GUILD_LEADER_ONLY", message: "ギルドマスターだけが解散できます" }; if (text(rawName, 16) !== guild.name) return { ok: false, code: "GUILD_CONFIRM_NAME", message: "確認のためギルド名を正確に入力してください" }; return this._disbandGuild(guild) }
  _disbandGuild(guild) { const members = [...guild.memberIds], recruitments = [...this.recruitments.values()].filter(entry => entry.guildId === guild.guildId); for (const id of members) this.memberships.delete(id); this.guilds.delete(guild.guildId); this.applications.delete(guild.guildId); for (const [id, entry] of this.invites) if (entry.guildId === guild.guildId) this.invites.delete(id); const failure = this._commit(); if (failure) return failure; for (const entry of recruitments) this._dropRecruitment(entry); for (const id of members) this.push(id); return { ok: true } }
  _revokeInvitesFrom(guild, id) { for (const [inviteId, entry] of this.invites) if (entry.guildId === guild.guildId && entry.fromId === id) this.invites.delete(inviteId); }
  pairBlocked(leftId, rightId) {
    const pair = entry => entry && (entry.fromId === leftId && entry.toId === rightId || entry.fromId === rightId && entry.toId === leftId); let changed = false;
    for (const [inviteId, entry] of this.invites) if (pair(entry)) { this.invites.delete(inviteId); changed = true; }
    const failure = changed ? this._commit() : null; this.push(leftId); this.push(rightId); const leftGuild = this._guildFor(leftId), rightGuild = this._guildFor(rightId); if (leftGuild) this._pushGuild(leftGuild); if (rightGuild && rightGuild !== leftGuild) this._pushGuild(rightGuild); return failure ?? { ok: true, changed };
  }
  _removeMember(guild, id) { this._revokeInvitesFrom(guild, id); guild.memberIds.delete(id); guild.officerIds.delete(id); delete guild.joinedAt[id]; this.memberships.delete(id); delete guild.week.memberPoints[id]; guild.plans = (guild.plans ?? []).filter(entry => entry.creatorId !== id); for (const entry of guild.plans) delete entry.responses[id]; }
  _trimActivity(guild, at = this.now()) {
    const protectedEntry = [...guild.activity].reverse().find(entry => entry.kind === "checkIn" && entry.day === dayId(at)) ?? null;
    while (guild.activity.length > ACTIVITY_PERSIST_LIMIT) { const index = guild.activity.findIndex(entry => entry !== protectedEntry); if (index < 0) break; guild.activity.splice(index, 1); }
  }
  _appendCheckInActivity(guild, id, today, at) {
    const matches = guild.activity.filter(entry => entry.kind === "checkIn" && entry.day === today), existing = matches.at(-1) ?? null, actorIds = [...new Set([...matches.flatMap(entry => entry.actorIds ?? []), id])].slice(0, MAX_MEMBERS), previousPoints = matches.reduce((sum, entry) => sum + Math.max(0, Number(entry.points) || 0), 0);
    if (matches.length) guild.activity = guild.activity.filter(entry => !matches.includes(entry));
    guild.activity.push({ activityId: existing?.activityId || inviteToken(), kind: "checkIn", at, day: today, points: previousPoints + 10, actorIds, partySize: actorIds.length, guildMemberCount: actorIds.length });
    this._trimActivity(guild, at);
  }
  _appendRoomActivity(guild, { kind, actorIds, points, partySize, floor, at }) {
    const currentActors = [...new Set(actorIds)].filter(id => guild.memberIds.has(id)).slice(0, this.maxRoomMembers), entry = { activityId: inviteToken(), kind, at, weekId: guild.week.weekId, points, actorIds: currentActors, partySize: Math.max(1, Math.min(this.maxRoomMembers, Math.floor(Number(partySize) || 1))), guildMemberCount: currentActors.length };
    if (Number.isFinite(Number(floor))) entry.floor = Math.max(1, Math.min(10_000, Math.floor(Number(floor))));
    guild.activity.push(entry); this._trimActivity(guild, at);
  }
  _recentEventReceipts(guild, at) { return (Array.isArray(guild.recentEventReceipts) ? guild.recentEventReceipts : []).filter(entry => entry.at > at - RECENT_RECEIPT_TTL_MS).slice(-RECENT_RECEIPT_LIMIT); }
  checkIn(session) {
    const guild = this._guildFor(session?.playerId); if (!guild) return { ok: false, code: "GUILD_NOT_MEMBER", message: "ギルドへ所属していません" };
    const at = this.now(); this._ensureWeek(guild, at); const today = dayId(at), lastCheckIn = this.checkIns.get(session.playerId) ?? ""; if (lastCheckIn >= today) return { ok: true, duplicate: true };
    this.checkIns.delete(session.playerId); this.checkIns.set(session.playerId, today); guild.week.checkIns[session.playerId] = today; this._addPoints(guild, session.playerId, 10, at); this._appendCheckInActivity(guild, session.playerId, today, at);
    const failure = this._commit(); if (failure) return failure; this._pushGuild(guild); return { ok: true, points: 10 };
  }
  chat(session, rawText) { const guild = this._guildFor(session?.playerId), message = text(rawText, 80); if (!guild) return { ok: false, code: "GUILD_NOT_MEMBER", message: "ギルドへ所属していません" }; if (!message) return { ok: false, code: "GUILD_CHAT_EMPTY", message: "メッセージを入力してください" }; if (!this._rate(session, "chat", 5_000, 5)) return { ok: false, code: "GUILD_CHAT_RATE", message: "少し待ってから送信してください" }; const profile = this.profileOf(session.playerId) ?? {}; guild.chat.push({ id: inviteToken(), playerId: session.playerId, name: text(profile.displayName, 16) || "冒険者", text: message, at: this.now() }); guild.chat = guild.chat.slice(-CHAT_LIMIT); const failure = this._commit(); if (failure) return failure; this._pushGuild(guild); return { ok: true } }
  createPlan(session, source = {}) {
    this.prune({ pruneRecruitments: false });
    const guild = this._guildFor(session?.playerId); if (!guild) return { ok: false, code: "GUILD_NOT_MEMBER", message: "ギルドへ所属していません" };
    const at = this.now(), scheduledAt = Number(source.scheduledAt), floor = Number(source.floor), purpose = String(source.purpose ?? ""), style = String(source.style ?? ""), note = text(source.note, PLAN_NOTE_LIMIT + 1);
    if (!PLAN_PURPOSES.has(purpose)) return { ok: false, code: "GUILD_PLAN_PURPOSE", message: "予定の目的が正しくありません" };
    if (!PLAN_STYLES.has(style)) return { ok: false, code: "GUILD_PLAN_STYLE", message: "予定の遊び方が正しくありません" };
    if (Array.from(note).length > PLAN_NOTE_LIMIT) return { ok: false, code: "GUILD_PLAN_NOTE", message: `ひとことは${PLAN_NOTE_LIMIT}文字以内で入力してください` };
    if (!Number.isSafeInteger(floor) || floor < 1 || floor > 10_000) return { ok: false, code: "GUILD_PLAN_FLOOR", message: "階層は1〜10000で入力してください" };
    if (!Number.isSafeInteger(scheduledAt) || scheduledAt < at + PLAN_MIN_LEAD_MS || scheduledAt > at + PLAN_MAX_LEAD_MS) return { ok: false, code: "GUILD_PLAN_TIME", message: "開催時刻は10分後から14日以内で指定してください" };
    guild.plans ??= [];
    if (guild.plans.length >= PLAN_LIMIT) return { ok: false, code: "GUILD_PLAN_LIMIT", message: `予定はギルド全体で${PLAN_LIMIT}件までです` };
    if (guild.plans.filter(entry => entry.creatorId === session.playerId).length >= PLAN_CREATOR_LIMIT) return { ok: false, code: "GUILD_PLAN_CREATOR_LIMIT", message: `自分で作成できる予定は${PLAN_CREATOR_LIMIT}件までです` };
    if (!this._rate(session, "planCreate", 60_000, 4)) return { ok: false, code: "GUILD_PLAN_CREATE_RATE", message: "予定の作成が多すぎます。少し待ってください" };
    let planId; do planId = inviteToken(); while (guild.plans.some(entry => entry.planId === planId));
    const entry = { planId, creatorId: session.playerId, purpose, style, note, floor, scheduledAt, createdAt: at, responses: { [session.playerId]: "going" } };
    guild.plans.push(entry); guild.plans.sort((left, right) => left.scheduledAt - right.scheduledAt || left.createdAt - right.createdAt || left.planId.localeCompare(right.planId));
    const failure = this._commit(); if (failure) return failure; this._pushGuild(guild); return { ok: true, plan: this._planDto(guild, entry, session.playerId) };
  }
  respondPlan(session, rawPlanId, rawStatus) {
    this.prune({ pruneRecruitments: false });
    const guild = this._guildFor(session?.playerId); if (!guild) return { ok: false, code: "GUILD_NOT_MEMBER", message: "ギルドへ所属していません" };
    const planId = text(rawPlanId, 96), status = text(rawStatus, 10); if (!PLAN_ID.test(planId)) return { ok: false, code: "GUILD_PLAN_MISSING", message: "その予定は終了しました" };
    if (status !== "none" && !PLAN_RESPONSES.has(status)) return { ok: false, code: "GUILD_PLAN_STATUS", message: "参加表明が正しくありません" };
    const entry = (guild.plans ?? []).find(plan => plan.planId === planId); if (!entry) return { ok: false, code: "GUILD_PLAN_MISSING", message: "その予定は終了しました" };
    if (!this._rate(session, "planRespond", 10_000, 12)) return { ok: false, code: "GUILD_PLAN_RESPONSE_RATE", message: "参加表明の変更が多すぎます。少し待ってください" };
    const previous = PLAN_RESPONSES.has(entry.responses?.[session.playerId]) ? entry.responses[session.playerId] : "none"; if (previous === status) return { ok: true, duplicate: true, plan: this._planDto(guild, entry, session.playerId) };
    entry.responses ??= {}; if (status === "none") delete entry.responses[session.playerId]; else entry.responses[session.playerId] = status;
    const failure = this._commit(); if (failure) return failure; this._pushGuild(guild); return { ok: true, plan: this._planDto(guild, entry, session.playerId) };
  }
  cancelPlan(session, rawPlanId) {
    this.prune({ pruneRecruitments: false });
    const guild = this._guildFor(session?.playerId); if (!guild) return { ok: false, code: "GUILD_NOT_MEMBER", message: "ギルドへ所属していません" };
    const planId = text(rawPlanId, 96), index = (guild.plans ?? []).findIndex(entry => entry.planId === planId); if (index < 0) return { ok: false, code: "GUILD_PLAN_MISSING", message: "その予定は終了しました" };
    const entry = guild.plans[index]; if (entry.creatorId !== session.playerId && !this._authorized(guild, session.playerId)) return { ok: false, code: "GUILD_PLAN_FORBIDDEN", message: "作成者または幹部以上だけが予定を取り消せます" };
    if (!this._rate(session, "planCancel", 10_000, 6)) return { ok: false, code: "GUILD_PLAN_CANCEL_RATE", message: "予定の取消操作が多すぎます。少し待ってください" };
    guild.plans.splice(index, 1); const failure = this._commit(); if (failure) return failure; this._dropPlanRecruitments(guild.guildId, [entry.planId]); this._pushGuild(guild); return { ok: true };
  }
  _addPoints(guild, id, points, at = this.now()) { this._ensureWeek(guild, at); guild.week.points = Math.max(0, guild.week.points + points); guild.week.memberPoints[id] = Math.max(0, (Number(guild.week.memberPoints[id]) || 0) + points); guild.totalXp = Math.max(0, guild.totalXp + points); }
  recordRoomActivity(room, message) {
    const coopBoss = message?.type === "expeditionEvent" && message?.event?.kind === "coopBossDefeated", rules = {
      expeditionEnded: { kind: "expedition", goal: "expedition", base: 5, accepted: Boolean(message?.summary?.completed), receipt: message?.summary?.id, floor: message?.summary?.floor },
      floorBossDefeated: { kind: "floorBoss", goal: "boss", base: 10, accepted: true, receipt: message?.summary?.id, floor: message?.floor ?? message?.summary?.floor },
      raidEnded: { kind: "raid", goal: "raid", base: 25, accepted: message?.result === "victory", receipt: message?.raid?.progress?.campaignId ?? message?.raid?.campaignId, floor: message?.raid?.progress?.floor ?? message?.raid?.floor ?? room?.selectedFloor },
      teamBattleEnded: { kind: "team", goal: "team", base: 3, accepted: true, receipt: message?.resultId, floor: room?.selectedFloor },
      resonanceEnded: { kind: "resonance", goal: "resonance", base: 15, accepted: Boolean(message?.result?.victory), receipt: message?.resonance?.id, floor: room?.selectedFloor }
    }, rule = coopBoss ? { kind: "coopBoss", goal: "boss", base: 10, accepted: true, receipt: message?.event?.id, floor: message?.event?.floor ?? room?.selectedFloor } : rules[message?.type];
    if (!rule?.accepted) return;
    const keyBase = text(rule.receipt, 120); if (!keyBase) return;
    const resonancePlayers = message?.resonance?.players, listed = message?.type === "teamBattleEnded" ? message?.summary?.ranking : message?.type === "raidEnded" ? message?.ranking : message?.type === "resonanceEnded" ? (Array.isArray(resonancePlayers) ? resonancePlayers : Object.keys(resonancePlayers ?? {}).map(id => ({ playerId: id }))) : message?.summary?.ranking;
    const eligible = new Set((Array.isArray(listed) && listed.length ? listed.map(entry => playerId(entry?.playerId)) : [...(room?.members ?? [])]).filter(id => id && room?.members?.has(id))); if (eligible.size < 2) return;
    const guildParticipants = new Map(); for (const id of eligible) { const guild = this._guildFor(id); if (!guild) continue; if (!guildParticipants.has(guild)) guildParticipants.set(guild, []); guildParticipants.get(guild).push(id); }
    const touched = new Set(), eventId = `${message.type}:${keyBase}`, at = this.now();
    for (const [guild, ids] of guildParticipants) {
      const recentEventReceipts = this._recentEventReceipts(guild, at); if (recentEventReceipts.some(entry => entry.eventId === eventId)) continue;
      this._ensureWeek(guild, at);
      if (guild.week.eventIds.includes(eventId)) continue;
      const receiptCapacity = guild.week.eventIds.length < EVENT_RECEIPT_LIMIT, teamCapacity = message?.type !== "teamBattleEnded" || guild.week.eventIds.filter(value => value.startsWith("teamBattleEnded:")).length < 20, pointsAccepted = receiptCapacity && teamCapacity;
      guild.recentEventReceipts = [...recentEventReceipts, { eventId, at }].slice(-RECENT_RECEIPT_LIMIT);
      if (pointsAccepted) {
        guild.week.eventIds.push(eventId);
        guild.week.goalCounts[rule.goal] = Math.min(SHARED_GOAL_TARGETS[rule.goal], (Number(guild.week.goalCounts[rule.goal]) || 0) + 1);
        for (const id of ids) this._addPoints(guild, id, rule.base, at);
      }
      this._appendRoomActivity(guild, { kind: rule.kind, actorIds: ids, points: pointsAccepted ? rule.base * ids.length : 0, partySize: eligible.size, floor: rule.floor, at });
      touched.add(guild);
    }
    if (!touched.size) return; if (this._commit()) return; for (const guild of touched) this._pushGuild(guild);
  }
  _prunePlans(at = this.now()) { const touched = new Map(); for (const guild of this.guilds.values()) { const plans = guild.plans ?? [], active = plans.filter(entry => entry.scheduledAt + PLAN_RETENTION_MS > at), expired = plans.filter(entry => entry.scheduledAt + PLAN_RETENTION_MS <= at); if (!expired.length) continue; guild.plans = active; touched.set(guild.guildId, expired); } return touched; }
  prune({ pushRecruitments = true, pruneRecruitments = true, pushPlans = true, prunePlans = true, pushReminders = false } = {}) { const now = this.now(); let changed = false; for (const [id, entry] of this.invites) if (entry.expiresAt <= now || !this.guilds.has(entry.guildId) || this._guildFor(entry.toId)) { this.invites.delete(id); changed = true; } for (const guild of this.guilds.values()) if (this._ensureWeek(guild, now)) changed = true; const planGuilds = prunePlans ? this._prunePlans(now) : new Map(); if (planGuilds.size) changed = true; const failed = changed ? this._commit() : null; if (failed) { for (const [id, expired] of planGuilds) { const guild = this.guilds.get(id); if (!guild) continue; const existing = new Set((guild.plans ?? []).map(entry => entry.planId)); guild.plans = [...(guild.plans ?? []), ...expired.filter(entry => !existing.has(entry.planId))].sort((left, right) => left.scheduledAt - right.scheduledAt || left.createdAt - right.createdAt || left.planId.localeCompare(right.planId)); } } else { for (const [id, expired] of planGuilds) this._dropPlanRecruitments(id, expired.map(entry => entry.planId)); if (pushPlans) for (const id of planGuilds.keys()) this._pushGuild(this.guilds.get(id)); } if (pruneRecruitments) { const touched = this._pruneRecruitments(); if (pushRecruitments) this._pushRecruitmentGuilds(touched); } if (pushReminders) this.dispatchPlanReminders(); }

  _load() {
    if (!this.stateFile) return;
    try {
      const raw = readFileSync(this.stateFile, "utf8"); if (raw.length > 64 * 1024 * 1024) throw new Error("guild state exceeds 64 MiB");
      const data = JSON.parse(raw), persistedVersion = data?.version == null ? 1 : data.version, loadedAt = this.now();
      if (![1, 2, 3].includes(persistedVersion)) throw new Error("unsupported guild state version");
      for (const source of Array.isArray(data.guilds) ? data.guilds.slice(0, MAX_GUILDS) : []) {
        const id = guildId(source.guildId), leaderId = playerId(source.leaderId), requestedMembers = (Array.isArray(source.memberIds) ? source.memberIds : []).map(playerId).filter(Boolean).slice(0, MAX_MEMBERS);
        if (!id || !leaderId || !requestedMembers.includes(leaderId) || this.memberships.has(leaderId)) continue;
        const memberIds = new Set(requestedMembers.filter(member => member === leaderId || !this.memberships.has(member))), eventIds = (Array.isArray(source.week?.eventIds) ? source.week.eventIds : []).map(value => text(value, 180)).filter(Boolean).slice(-EVENT_RECEIPT_LIMIT), hasGoalCounts = source.week && Object.prototype.hasOwnProperty.call(source.week, "goalCounts"), seenActivityIds = new Set(), activity = [], recentEventReceipts = (Array.isArray(source.recentEventReceipts) ? source.recentEventReceipts : []).map(entry => ({ eventId: text(entry?.eventId, 180), at: Math.max(0, Number(entry?.at) || 0) })).filter(entry => entry.eventId && entry.at > loadedAt - RECENT_RECEIPT_TTL_MS).slice(-RECENT_RECEIPT_LIMIT);
        for (const entry of (Array.isArray(source.activity) ? source.activity : []).slice(-1_000)) {
          const activityId = text(entry?.activityId, 96), kind = String(entry?.kind ?? ""), storedWeekId = text(entry?.weekId, 10), storedDay = text(entry?.day, 10), isCheckIn = kind === "checkIn", participantLimit = isCheckIn ? MAX_MEMBERS : this.maxRoomMembers, actorIds = [...new Set((Array.isArray(entry?.actorIds) ? entry.actorIds : []).map(playerId).filter(Boolean))].slice(0, participantLimit), activityAt = Math.max(0, Number(entry?.at) || 0);
          if (!ACTIVITY_ID.test(activityId) || !activityAt || seenActivityIds.has(activityId) || !ACTIVITY_KINDS.has(kind) || (isCheckIn ? !validDayId(storedDay) : !validWeekId(storedWeekId))) continue;
          const normalized = { activityId, kind, at: activityAt, points: Math.max(0, Math.floor(Number(entry?.points) || 0)), actorIds, partySize: Math.max(1, Math.min(participantLimit, Math.floor(Number(entry?.partySize) || 1))), guildMemberCount: Math.max(1, Math.min(participantLimit, Math.floor(Number(entry?.guildMemberCount) || actorIds.length || 1))) };
          if (isCheckIn) normalized.day = storedDay; else normalized.weekId = storedWeekId;
          if (Number.isFinite(Number(entry?.floor))) normalized.floor = Math.max(1, Math.min(10_000, Math.floor(Number(entry.floor))));
          seenActivityIds.add(activityId); activity.push(normalized);
        }
        const seenPlanIds = new Set(), planCandidates = [];
        for (const entry of (Array.isArray(source.plans) ? source.plans : []).slice(0, 1_000)) {
          const planIdValue = text(entry?.planId, 96), creatorId = playerId(entry?.creatorId), purpose = String(entry?.purpose ?? ""), style = String(entry?.style ?? ""), floor = Number(entry?.floor), createdAt = Number(entry?.createdAt), scheduledAt = Number(entry?.scheduledAt);
          if (!PLAN_ID.test(planIdValue) || seenPlanIds.has(planIdValue) || !memberIds.has(creatorId) || !PLAN_PURPOSES.has(purpose) || !PLAN_STYLES.has(style) || !Number.isSafeInteger(floor) || floor < 1 || floor > 10_000 || !Number.isSafeInteger(createdAt) || createdAt <= 0 || !Number.isSafeInteger(scheduledAt) || scheduledAt - createdAt < PLAN_MIN_LEAD_MS || scheduledAt - createdAt > PLAN_MAX_LEAD_MS || scheduledAt + PLAN_RETENTION_MS <= loadedAt) continue;
          const responses = {}; if (entry?.responses && typeof entry.responses === "object" && !Array.isArray(entry.responses)) for (const [rawMemberId, rawStatus] of Object.entries(entry.responses)) { const memberId = playerId(rawMemberId), status = String(rawStatus ?? ""); if (memberIds.has(memberId) && PLAN_RESPONSES.has(status)) responses[memberId] = status; }
          seenPlanIds.add(planIdValue); planCandidates.push({ planId: planIdValue, creatorId, purpose, style, note: text(entry?.note, PLAN_NOTE_LIMIT), floor, scheduledAt, createdAt, responses });
        }
        planCandidates.sort((left, right) => left.scheduledAt - right.scheduledAt || left.createdAt - right.createdAt || left.planId.localeCompare(right.planId));
        const creatorPlanCounts = new Map(), plans = []; for (const entry of planCandidates) { const count = creatorPlanCounts.get(entry.creatorId) ?? 0; if (plans.length >= PLAN_LIMIT || count >= PLAN_CREATOR_LIMIT) continue; plans.push(entry); creatorPlanCounts.set(entry.creatorId, count + 1); }
        const guild = { guildId: id, name: text(source.name, 16) || "ギルド", tag: text(source.tag, 4) || "AD", description: text(source.description, 80), leaderId, officerIds: new Set((Array.isArray(source.officerIds) ? source.officerIds : []).map(playerId).filter(member => member && memberIds.has(member) && member !== leaderId)), memberIds, joinedAt: Object.fromEntries([...memberIds].map(member => [member, Math.max(0, Number(source.joinedAt?.[member]) || 0)])), createdAt: Math.max(0, Number(source.createdAt) || 0), totalXp: Math.max(0, Number(source.totalXp) || 0), week: { weekId: text(source.week?.weekId, 10), points: Math.max(0, Number(source.week?.points) || 0), memberPoints: Object.fromEntries([...memberIds].map(member => [member, Math.max(0, Number(source.week?.memberPoints?.[member]) || 0)])), eventIds, checkIns: Object.fromEntries([...memberIds].map(member => [member, text(source.week?.checkIns?.[member], 10)]).filter(([, value]) => validDayId(value))), goalCounts: hasGoalCounts ? saturatedGoalCounts(source.week.goalCounts) : legacyGoalCounts(eventIds) }, chat: (Array.isArray(source.chat) ? source.chat : []).slice(-CHAT_LIMIT).map(entry => ({ id: text(entry?.id, 96), playerId: playerId(entry?.playerId), name: text(entry?.name, 16) || "冒険者", text: text(entry?.text, 80), at: Math.max(0, Number(entry?.at) || 0) })).filter(entry => entry.id && entry.playerId && entry.text), plans, activity, recentEventReceipts };
        this._ensureWeek(guild, loadedAt); this._trimActivity(guild, loadedAt); this.guilds.set(id, guild); for (const memberId of memberIds) this.memberships.set(memberId, id);
      }
      for (const [rawId, values] of Object.entries(data.applications ?? {})) { const id = guildId(rawId); if (id && this.guilds.has(id)) this.applications.set(id, new Set((Array.isArray(values) ? values : []).map(playerId).filter(id => id && !this.memberships.has(id)).slice(0, 100))); }
      for (const entry of Array.isArray(data.invites) ? data.invites.slice(-1_000) : []) { const inviteIdValue = text(entry?.inviteId, 96), target = playerId(entry?.toId), from = playerId(entry?.fromId), targetGuild = guildId(entry?.guildId), expiresAt = Math.max(0, Number(entry?.expiresAt) || 0); if (inviteIdValue && target && from && this.guilds.has(targetGuild) && expiresAt > this.now() && !this.memberships.has(target)) this.invites.set(inviteIdValue, { inviteId: inviteIdValue, guildId: targetGuild, toId: target, fromId: from, createdAt: Math.max(0, Number(entry.createdAt) || 0), expiresAt }); }
      for (const [rawPlayerId, rawDay] of Object.entries(data.checkIns ?? {})) { const id = playerId(rawPlayerId), day = text(rawDay, 10); if (id && validDayId(day)) this.checkIns.set(id, day); }
      for (const guild of this.guilds.values()) for (const [rawPlayerId, rawDay] of Object.entries(guild.week?.checkIns ?? {})) { const id = playerId(rawPlayerId), day = text(rawDay, 10); if (id && validDayId(day) && day > (this.checkIns.get(id) ?? "")) this.checkIns.set(id, day); }
    } catch (error) { if (error?.code === "ENOENT") return; throw new Error(`Guild state could not be loaded: ${this.stateFile}`, { cause: error }); }
  }
  _save() { if (!this.stateFile) return true; const guilds = [...this.guilds.values()].map(guild => ({ ...guild, officerIds: [...guild.officerIds], memberIds: [...guild.memberIds], week: { ...guild.week, eventIds: [...guild.week.eventIds], goalCounts: { ...guild.week.goalCounts } }, chat: [...guild.chat], plans: (guild.plans ?? []).map(entry => ({ ...entry, responses: { ...entry.responses } })), activity: guild.activity.map(entry => ({ ...entry, actorIds: [...entry.actorIds] })) })), applications = Object.fromEntries([...this.applications].map(([id, ids]) => [id, [...ids]])), checkIns = Object.fromEntries([...this.checkIns].slice(-20_000)), data = JSON.stringify({ version: 3, guilds, applications, invites: [...this.invites.values()], checkIns }); try { mkdirSync(dirname(this.stateFile), { recursive: true }); const temporary = `${this.stateFile}.tmp`; writeFileSync(temporary, data, { mode: 0o600 }); renameSync(temporary, this.stateFile); this.lastPersistenceError = null; return true; } catch (error) { this.lastPersistenceError = error; return false; } }
}

export const GUILD_MAX_MEMBERS = MAX_MEMBERS;
export const GUILD_WEEK_GOALS = WEEK_GOALS;
export const GUILD_RECRUITMENT_TTL_MS = RECRUITMENT_TTL_MS;
