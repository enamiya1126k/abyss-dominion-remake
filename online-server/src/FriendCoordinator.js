import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const FRIEND_ID = /^AD-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const MAX_RELATIONS = 200;
const MAX_ACCOUNTS = 20_000;
const INVITE_TTL_MS = 2 * 60_000;

function cleanId(value) { const id = String(value ?? "").trim().toUpperCase(); return FRIEND_ID.test(id) ? id : ""; }
function cleanText(value, max) { return String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "").trim().slice(0, max); }
function token() { return randomBytes(12).toString("base64url"); }
function credentialHash(value) { return createHash("sha256").update(String(value ?? "")).digest("hex"); }
function boundedIds(value, ownerId = "") { return [...new Set(Array.isArray(value) ? value.map(cleanId).filter(id => id && id !== ownerId) : [])].slice(0, MAX_RELATIONS); }

export class FriendCoordinator {
  constructor({ now = () => Date.now(), sessions, rooms, send = () => {}, canDiscoverRoom = () => true, canInviteToRoom = () => true, stateFile = null } = {}) {
    this.now = now; this.sessions = sessions; this.rooms = rooms; this.send = send; this.canDiscoverRoom = canDiscoverRoom; this.canInviteToRoom = canInviteToRoom; this.stateFile = stateFile ? String(stateFile) : null;
    this.accounts = new Map(); this.friends = new Map(); this.incoming = new Map(); this.blocked = new Map(); this.muted = new Map(); this.invites = new Map(); this.presenceSignatures = new Map(); this.lastPersistenceError = null;
    this._load();
  }

  _set(map, id) { if (!map.has(id)) map.set(id, new Set()); return map.get(id); }
  _account(session) {
    const profile = session?.profile ?? {}, previous = this.accounts.get(session?.playerId) ?? {};
    return { playerId: session.playerId, displayName: cleanText(profile.displayName, 16) || "冒険者", monsterName: cleanText(profile.monsterName, 32) || "仲間", speciesId: cleanText(profile.speciesId, 80) || "slime", fallbackEmoji: cleanText(profile.fallbackEmoji, 8) || "魔", lastSeen: Math.max(Number(previous.lastSeen) || 0, Number(session.lastSeen) || this.now()), credentialHash: previous.credentialHash || credentialHash(session.clientKey) };
  }
  _public(id, viewerId) {
    const stored = this.accounts.get(id) ?? { playerId: id, displayName: "冒険者", monsterName: "仲間", speciesId: "slime", fallbackEmoji: "魔", lastSeen: 0 }, { credentialHash: _credentialHash, ...account } = stored;
    const session = this.sessions.get(id), room = session?.roomId ? this.rooms.get(session.roomId) : null;
    const accepted = this._set(this.friends, viewerId).has(id), discoverable = Boolean(accepted && room?.phase === "lobby" && this.canDiscoverRoom(viewerId, room));
    return { ...account, online: Boolean(session?.connected), roomId: discoverable ? room.roomId : null, roomJoinable: Boolean(discoverable && room.members.size < 4), lastSeen: Number(account.lastSeen) || 0 };
  }
  _blockedPublic(id) {
    const stored = this.accounts.get(id) ?? { playerId: id, displayName: "冒険者", monsterName: "仲間", speciesId: "slime", fallbackEmoji: "魔" };
    return { playerId: id, displayName: cleanText(stored.displayName, 16) || "冒険者", monsterName: cleanText(stored.monsterName, 32) || "仲間", speciesId: cleanText(stored.speciesId, 80) || "slime", fallbackEmoji: cleanText(stored.fallbackEmoji, 8) || "魔" };
  }
  snapshot(playerId) {
    this.prune();
    const friends = [...this._set(this.friends, playerId)].filter(id => !this.interactionBlocked(playerId, id)).map(id => this._public(id, playerId)).sort((a, b) => Number(b.online) - Number(a.online) || a.displayName.localeCompare(b.displayName, "ja"));
    const incoming = [...this._set(this.incoming, playerId)].filter(id => !this.interactionBlocked(playerId, id)).map(id => this._public(id, playerId));
    const outgoing = [...this.incoming].filter(([id, ids]) => ids.has(playerId) && !this.interactionBlocked(playerId, id)).map(([id]) => this._public(id, playerId));
    const invites = [...this.invites.values()].filter(entry => entry.toId === playerId && !this.interactionBlocked(entry.fromId, entry.toId)).filter(entry => { const room = this.rooms.get(entry.roomId); return room && this.canInviteToRoom(playerId, room); }).map(entry => ({ inviteId: entry.inviteId, roomId: entry.roomId, from: this._public(entry.fromId, playerId), expiresAt: entry.expiresAt }));
    const blocked = [...(this.blocked.get(playerId) ?? [])].map(id => this._blockedPublic(id)).sort((a, b) => a.displayName.localeCompare(b.displayName, "ja") || a.playerId.localeCompare(b.playerId));
    const muted = [...(this.muted.get(playerId) ?? [])].map(id => this._blockedPublic(id)).sort((a, b) => a.displayName.localeCompare(b.displayName, "ja") || a.playerId.localeCompare(b.playerId));
    return { friends, incoming, outgoing, invites, blocked, muted };
  }
  push(playerId) { const session = this.sessions.get(playerId); if (session?.connected) this.send(playerId, { type: "friendState", state: this.snapshot(playerId) }); }
  roomAccessChanged(room) { if (!room) return; const affected = new Set(); for (const id of room.members ?? []) { affected.add(id); for (const friendId of this._set(this.friends, id)) affected.add(friendId); } for (const entry of this.invites.values()) if (entry.roomId === room.roomId) { affected.add(entry.fromId); affected.add(entry.toId); } for (const id of affected) this.push(id); }
  areFriends(leftId, rightId) { return !this.interactionBlocked(leftId, rightId) && this._set(this.friends, leftId).has(rightId) && this._set(this.friends, rightId).has(leftId); }
  interactionBlocked(leftId, rightId) {
    const left = cleanId(leftId), right = cleanId(rightId);
    return Boolean(left && right && left !== right && (this.blocked.get(left)?.has(right) || this.blocked.get(right)?.has(left)));
  }
  hasBlocked(blockerId, targetId) { const blocker = cleanId(blockerId), target = cleanId(targetId); return Boolean(blocker && target && blocker !== target && this.blocked.get(blocker)?.has(target)); }
  isMuted(viewerId, authorId) { const viewer = cleanId(viewerId), author = cleanId(authorId); return Boolean(viewer && author && viewer !== author && this.muted.get(viewer)?.has(author)); }
  hasAccount(playerId) { return this.accounts.has(playerId) || this.sessions.has(playerId); }
  hasPersistentAccount(playerId) { return this.accounts.has(playerId); }
  basicProfile(playerId) { const stored = this.accounts.get(playerId) ?? { playerId, displayName: "冒険者", monsterName: "仲間", speciesId: "slime", fallbackEmoji: "魔", lastSeen: 0 }, { credentialHash: _credentialHash, ...profile } = stored; return profile; }
  publicProfile(playerId, viewerId = playerId) { return this._public(playerId, viewerId); }
  identityMatches(playerId, clientKey) { const expected = this.accounts.get(playerId)?.credentialHash; if (!expected) return true; const actual = credentialHash(clientKey), left = Buffer.from(expected), right = Buffer.from(actual); return left.length === right.length && timingSafeEqual(left, right); }
  _pushCircle(playerId, { pushSelf = true } = {}) { if (pushSelf) this.push(playerId); for (const id of this._set(this.friends, playerId)) this.push(id); }
  _clearPersistentState() { this.accounts.clear(); this.friends.clear(); this.incoming.clear(); this.blocked.clear(); this.muted.clear(); }
  _commit() { if (this._save()) return null; const error = this.lastPersistenceError; this._clearPersistentState(); try { this._load(); } catch {} this.lastPersistenceError = error; return { ok: false, code: "PERSISTENCE_ERROR", message: "フレンド情報を保存できません。サーバーの保存先を確認してください" }; }
  persistenceHealthy() { return !this.lastPersistenceError; }
  noteSession(session, { persist = true, pushSelf = true } = {}) { if (!session) return true; this.accounts.set(session.playerId, this._account(session)); if (persist && this._commit()) return false; const signature = `${Boolean(session.connected)}:${session.roomId || ""}`; if (persist || this.presenceSignatures.get(session.playerId) !== signature) { this.presenceSignatures.set(session.playerId, signature); this._pushCircle(session.playerId, { pushSelf }); } return true; }

  _rate(session, key, windowMs, max) {
    const now = this.now(); session.friendRates ??= {}; let state = session.friendRates[key];
    if (!state || now < state.startedAt || now - state.startedAt >= windowMs) state = session.friendRates[key] = { startedAt: now, count: 0 };
    if (state.count >= max) return false; state.count++; return true;
  }
  request(session, rawTargetId) {
    const targetId = cleanId(rawTargetId), self = session?.playerId;
    if (!self || !targetId) return { ok: false, code: "BAD_FRIEND_ID", message: "フレンドIDの形式が正しくありません" };
    if (targetId === self) return { ok: false, code: "FRIEND_SELF", message: "自分自身には申請できません" };
    if (!this._rate(session, "request", 30_000, 4)) return { ok: false, code: "FRIEND_RATE", message: "申請が多すぎます。少し待ってください" };
    if (!this.accounts.has(targetId) && !this.sessions.has(targetId)) return { ok: false, code: "FRIEND_NOT_FOUND", message: "そのフレンドIDはまだオンラインサーバーに登録されていません" };
    if (this.blocked.get(self)?.has(targetId)) return { ok: false, code: "FRIEND_BLOCKED", message: "先にブロックを解除してください" };
    if (this.blocked.get(targetId)?.has(self)) return { ok: false, code: "FRIEND_NOT_FOUND", message: "そのフレンドIDは見つかりません" };
    if (this._set(this.friends, self).has(targetId)) return { ok: true, duplicate: true };
    if (this._set(this.incoming, self).has(targetId)) return this.respond(session, targetId, true);
    const pending = this._set(this.incoming, targetId); if (pending.size >= MAX_RELATIONS) return { ok: false, code: "FRIEND_LIMIT", message: "相手の申請枠がいっぱいです" };
    pending.add(self); this.accounts.set(self, this._account(session)); const failure = this._commit(); if (failure) return failure; this.push(self); this.push(targetId); return { ok: true };
  }
  respond(session, rawRequesterId, accepted) {
    const self = session?.playerId, requesterId = cleanId(rawRequesterId), pending = this._set(this.incoming, self);
    if (!requesterId || !pending.has(requesterId)) return { ok: false, code: "FRIEND_REQUEST_MISSING", message: "この申請はすでに処理されています" };
    if (this.interactionBlocked(self, requesterId)) { pending.delete(requesterId); const failure = this._commit(); if (failure) return failure; this.push(self); this.push(requesterId); return { ok: false, code: "FRIEND_REQUEST_MISSING", message: "この申請はすでに処理されています" }; }
    if (accepted) {
      if (this._set(this.friends, self).size >= MAX_RELATIONS || this._set(this.friends, requesterId).size >= MAX_RELATIONS) return { ok: false, code: "FRIEND_LIMIT", message: "フレンド上限に達しています" };
      this._set(this.friends, self).add(requesterId); this._set(this.friends, requesterId).add(self);
    }
    pending.delete(requesterId); const failure = this._commit(); if (failure) return failure; this.push(self); this.push(requesterId); return { ok: true, accepted: Boolean(accepted) };
  }
  remove(session, rawTargetId) {
    const self = session?.playerId, targetId = cleanId(rawTargetId); if (!targetId) return { ok: false, code: "BAD_FRIEND_ID", message: "フレンドIDが正しくありません" };
    this._set(this.friends, self).delete(targetId); this._set(this.friends, targetId).delete(self); const failure = this._commit(); if (failure) return failure; this.push(self); this.push(targetId); return { ok: true };
  }
  block(session, rawTargetId) {
    const self = session?.playerId, targetId = cleanId(rawTargetId); if (!targetId || targetId === self) return { ok: false, code: "BAD_FRIEND_ID", message: "フレンドIDが正しくありません" };
    if (!this._rate(session, "block", 60_000, 20)) return { ok: false, code: "FRIEND_RATE", message: "ブロック操作が多すぎます。少し待ってください" };
    if (!this._set(this.blocked, self).has(targetId) && this._set(this.blocked, self).size >= MAX_RELATIONS) return { ok: false, code: "FRIEND_LIMIT", message: "ブロック上限に達しています" };
    const duplicate = this._set(this.blocked, self).has(targetId);
    this._set(this.friends, self).delete(targetId); this._set(this.friends, targetId).delete(self); this._set(this.incoming, self).delete(targetId); this._set(this.incoming, targetId).delete(self); this._set(this.blocked, self).add(targetId);
    const failure = this._commit(); if (failure) return failure;
    for (const [id, entry] of this.invites) if (entry.fromId === self && entry.toId === targetId || entry.fromId === targetId && entry.toId === self) this.invites.delete(id);
    this.push(self); this.push(targetId); return { ok: true, duplicate };
  }
  unblock(session, rawTargetId) {
    const self = session?.playerId, targetId = cleanId(rawTargetId); if (!targetId || targetId === self) return { ok: false, code: "BAD_FRIEND_ID", message: "フレンドIDが正しくありません" };
    if (!this._rate(session, "unblock", 60_000, 20)) return { ok: false, code: "FRIEND_RATE", message: "ブロック解除操作が多すぎます。少し待ってください" };
    const removed = this.blocked.get(self)?.delete(targetId) ?? false;
    if (removed) { const failure = this._commit(); if (failure) return failure; }
    this.push(self); return { ok: true, duplicate: !removed };
  }
  mute(session, rawTargetId) {
    const self = session?.playerId, targetId = cleanId(rawTargetId); if (!targetId || targetId === self) return { ok: false, code: "BAD_FRIEND_ID", message: "フレンドIDが正しくありません" };
    if (!this.hasAccount(targetId)) return { ok: false, code: "FRIEND_NOT_FOUND", message: "そのプレイヤーを確認できません" };
    if (!this._rate(session, "mute", 60_000, 20)) return { ok: false, code: "FRIEND_RATE", message: "ミュート操作が多すぎます。少し待ってください" };
    const values = this._set(this.muted, self), duplicate = values.has(targetId); if (!duplicate && values.size >= MAX_RELATIONS) return { ok: false, code: "FRIEND_LIMIT", message: "ミュート上限に達しています" };
    values.add(targetId); const failure = this._commit(); if (failure) return failure; this.push(self); return { ok: true, duplicate };
  }
  unmute(session, rawTargetId) {
    const self = session?.playerId, targetId = cleanId(rawTargetId); if (!targetId || targetId === self) return { ok: false, code: "BAD_FRIEND_ID", message: "フレンドIDが正しくありません" };
    if (!this._rate(session, "unmute", 60_000, 20)) return { ok: false, code: "FRIEND_RATE", message: "ミュート解除操作が多すぎます。少し待ってください" };
    const removed = this.muted.get(self)?.delete(targetId) ?? false; if (removed) { const failure = this._commit(); if (failure) return failure; }
    this.push(self); return { ok: true, duplicate: !removed };
  }
  invite(session, rawTargetId) {
    const self = session?.playerId, targetId = cleanId(rawTargetId), room = session?.roomId ? this.rooms.get(session.roomId) : null;
    if (this.interactionBlocked(self, targetId)) return { ok: false, code: "FRIEND_REQUIRED", message: "フレンドだけを招待できます" };
    if (!targetId || !this._set(this.friends, self).has(targetId)) return { ok: false, code: "FRIEND_REQUIRED", message: "フレンドだけを招待できます" };
    if (!room || room.phase !== "lobby") return { ok: false, code: "ROOM_NOT_JOINABLE", message: "ロビーにいるときだけ招待できます" };
    if (!this.canInviteToRoom(targetId, room)) return { ok: false, code: "GUILD_RECRUITMENT_FORBIDDEN", message: "ギルド限定募集には同じギルドのメンバーだけを招待できます" };
    if (room.members.size >= 4) return { ok: false, code: "ROOM_FULL", message: "この部屋は満員です" };
    if (!this.sessions.get(targetId)?.connected) return { ok: false, code: "FRIEND_OFFLINE", message: "相手はオフラインです" };
    if (!this._rate(session, "invite", 10_000, 5)) return { ok: false, code: "FRIEND_INVITE_RATE", message: "招待が多すぎます。少し待ってください" };
    for (const [id, entry] of this.invites) if (entry.fromId === self && entry.toId === targetId) this.invites.delete(id);
    const inviteId = token(), entry = { inviteId, fromId: self, toId: targetId, roomId: room.roomId, createdAt: this.now(), expiresAt: this.now() + INVITE_TTL_MS };
    this.invites.set(inviteId, entry); this.push(targetId); return { ok: true, inviteId };
  }
  respondInvite(session, rawInviteId, accepted) {
    this.prune(); const inviteId = cleanText(rawInviteId, 96), entry = this.invites.get(inviteId);
    if (!entry || entry.toId !== session?.playerId) return { ok: false, code: "FRIEND_INVITE_MISSING", message: "この招待は期限切れです" };
    this.invites.delete(inviteId); this.push(session.playerId);
    if (!accepted) return { ok: true, accepted: false };
    if (this.interactionBlocked(entry.fromId, entry.toId)) return { ok: false, code: "FRIEND_INVITE_MISSING", message: "この招待は期限切れです" };
    if (!this._set(this.friends, entry.fromId).has(entry.toId)) return { ok: false, code: "FRIEND_REQUIRED", message: "フレンド関係を確認できません" };
    const room = this.rooms.get(entry.roomId); if (!room || !this.canInviteToRoom(session.playerId, room)) return { ok: false, code: "GUILD_RECRUITMENT_FORBIDDEN", message: "この部屋のギルド限定募集には参加できません" };
    return { ok: true, accepted: true, roomId: entry.roomId };
  }
  prune() { const now = this.now(); for (const [id, entry] of this.invites) if (entry.expiresAt <= now || !this.rooms.has(entry.roomId)) this.invites.delete(id); }

  _load() {
    if (!this.stateFile) return;
    try {
      const raw = readFileSync(this.stateFile, "utf8"); if (raw.length > 128 * 1024 * 1024) throw new Error("friend state exceeds 128 MiB"); const data = JSON.parse(raw); if (!data || typeof data !== "object" || Array.isArray(data) || ![1, 2].includes(data.version)) throw new Error("unsupported friend state version"); const version = data.version;
      for (const account of Array.isArray(data.accounts) ? data.accounts.slice(0, MAX_ACCOUNTS) : []) { const id = cleanId(account?.playerId), hash = /^[a-f0-9]{64}$/.test(String(account?.credentialHash ?? "")) ? String(account.credentialHash) : ""; if (id && hash) this.accounts.set(id, { playerId: id, displayName: cleanText(account.displayName, 16) || "冒険者", monsterName: cleanText(account.monsterName, 32) || "仲間", speciesId: cleanText(account.speciesId, 80) || "slime", fallbackEmoji: cleanText(account.fallbackEmoji, 8) || "魔", lastSeen: Math.max(0, Number(account.lastSeen) || 0), credentialHash: hash }); }
      const loadMap = (source, target) => { for (const [rawId, ids] of Object.entries(source ?? {}).slice(0, MAX_ACCOUNTS)) { const id = cleanId(rawId); if (id) target.set(id, new Set(boundedIds(ids, id))); } };
      loadMap(data.friends, this.friends); loadMap(data.incoming, this.incoming); loadMap(data.blocked, this.blocked); if (version >= 2) loadMap(data.muted, this.muted);
    } catch (error) { if (error?.code === "ENOENT") return; throw new Error(`Friend state could not be loaded: ${this.stateFile}`, { cause: error }); }
  }
  _save() {
    if (!this.stateFile) return true;
    const maps = source => Object.fromEntries([...source].filter(([id]) => cleanId(id)).slice(-MAX_ACCOUNTS).map(([id, ids]) => [id, boundedIds([...ids], id)]));
    const data = JSON.stringify({ version: 2, accounts: [...this.accounts.values()].slice(-MAX_ACCOUNTS), friends: maps(this.friends), incoming: maps(this.incoming), blocked: maps(this.blocked), muted: maps(this.muted) });
    try { mkdirSync(dirname(this.stateFile), { recursive: true }); const temporary = `${this.stateFile}.tmp`; writeFileSync(temporary, data, { mode: 0o600 }); renameSync(temporary, this.stateFile); this.lastPersistenceError = null; return true; } catch (error) { this.lastPersistenceError = error; return false; }
  }
}

export const FRIEND_INVITE_TTL_MS = INVITE_TTL_MS;
