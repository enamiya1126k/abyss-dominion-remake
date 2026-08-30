import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const PLAYER_ID = /^AD-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const MAX_RECORDS = 20_000;
const MAX_PARTY = 4;
const MAX_EQUIPMENT = 6;
const MAX_STAT = 1_000_000_000_000;
const MAX_SOURCE_BYTES = 64 * 1024;
const STALE_AFTER_MS = 30 * 24 * 60 * 60_000;
const DISPLAY_SCALE = 90;
const RARITIES = new Set(["N", "R", "SR", "SSR", "UR", "LR", "神話", "深淵", "十神", "SECRET"]);

function text(value, max = 32) {
  return String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "").trim().slice(0, max);
}
function finite(value, min, max, fallback = min) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}
function integer(value, min, max, fallback = min) { return Math.round(finite(value, min, max, fallback)); }
function safeId(value) { const id = text(value, 80); return /^[A-Za-z0-9_-]{1,80}$/.test(id) ? id : null; }
function rarity(value) { const result = text(value, 12); return RARITIES.has(result) ? result : "N"; }
function assetPath(value) {
  const result = text(value, 240);
  if (!result || result.includes("..") || result.includes("\\") || result.includes(":") || result.startsWith("//")) return null;
  if (!/^(?:\.\/)?assets\/[A-Za-z0-9_./+@-]+\.(?:png|webp|gif|jpe?g)(?:\?[A-Za-z0-9_.=&-]+)?$/i.test(result)) return null;
  return result;
}
function assetBase(value) {
  const result = text(value, 220).replace(/\/+$/, "");
  if (!result || result.includes("..") || result.includes("\\") || result.includes(":") || result.startsWith("//")) return null;
  return /^(?:\.\/)?assets\/[A-Za-z0-9_./+@-]+$/.test(result) ? result : null;
}
function encodedBytes(value) {
  try { return Buffer.byteLength(JSON.stringify(value), "utf8"); } catch { return Number.POSITIVE_INFINITY; }
}
function sanitizeStats(source = {}) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  const required = ["hp", "atk", "def", "spd"];
  if (required.some(key => !Number.isFinite(Number(source[key])))) return null;
  const atk = integer(source.atk, 1, MAX_STAT, 1), def = integer(source.def, 0, MAX_STAT, 0);
  return {
    hp: integer(source.hp, 1, MAX_STAT, 1),
    atk,
    matk: integer(source.matk ?? source.mag, 1, MAX_STAT, atk),
    def,
    mdef: integer(source.mdef ?? source.res, 0, MAX_STAT, def),
    spd: integer(source.spd, 1, MAX_STAT, 1),
    // CombatPower v4 uses the final post-equipment values. Some legal series,
    // mastery and signature bonuses can take these above their earlier caps.
    crit: finite(source.crit, 0, MAX_STAT, 0),
    evasion: finite(source.evasion, 0, MAX_STAT, 0),
  };
}

/** Recomputes the exact v4 display power from sanitized final battle stats. */
export function verifiedMonsterPower(stats) {
  if (!stats) return 0;
  const highAttack = Math.max(stats.atk, stats.matk), lowAttack = Math.min(stats.atk, stats.matk);
  const highDefense = Math.max(stats.def, stats.mdef), lowDefense = Math.min(stats.def, stats.mdef);
  const raw = stats.hp * .35 + (highAttack + lowAttack * .35) * 4 + (highDefense + lowDefense * .35) * 3 + stats.spd * 2 + stats.crit * 12 + stats.evasion * 10;
  return Math.max(1, Math.round(Math.pow(Math.max(1, raw), .32) * DISPLAY_SCALE));
}

function powerMatches(claimed, verified) {
  if (claimed == null || claimed === "") return true;
  const value = Number(claimed);
  if (!Number.isFinite(value) || value < 0) return false;
  return Math.abs(Math.round(value) - verified) <= Math.max(2, Math.round(verified * .01));
}
function sanitizeEquipment(source) {
  return (Array.isArray(source) ? source : []).slice(0, MAX_EQUIPMENT).map((item, index) => ({
    slot: text(item?.slot, 24) || `slot-${index + 1}`,
    name: text(item?.name, 48) || "装備",
    rarity: rarity(item?.rarity),
    level: integer(item?.level, 0, 99_999_999, 0),
    plus: integer(item?.plus, 0, 9_999, 0),
    visualAsset: assetPath(item?.visualAsset),
  }));
}
function sanitizeMonster(source, index) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return { error: "BAD_PARTY_MEMBER" };
  if (Array.isArray(source.equipment) && source.equipment.length > MAX_EQUIPMENT) return { error: "POWER_EQUIPMENT_TOO_LARGE" };
  const battleStats = sanitizeStats(source.battleStats ?? source.stats);
  if (!battleStats) return { error: "POWER_STATS_REQUIRED" };
  const power = verifiedMonsterPower(battleStats);
  if (!powerMatches(source.power, power)) return { error: "POWER_MISMATCH" };
  const circle = source.magicCircle && typeof source.magicCircle === "object" ? source.magicCircle : source.circle && typeof source.circle === "object" ? source.circle : {};
  return { value: {
    slot: integer(source.slot, 1, MAX_PARTY, index + 1),
    monsterId: text(source.monsterId, 80) || null,
    speciesId: safeId(source.speciesId) || "slime",
    visualSpeciesId: safeId(source.visualSpeciesId),
    endgameBossId: safeId(source.endgameBossId),
    floorBossCatalogId: safeId(source.floorBossCatalogId),
    customVisualAsset: assetPath(source.customVisualAsset),
    customVisualBase: assetBase(source.customVisualBase),
    name: text(source.name ?? source.monsterName, 32) || "魔物",
    level: integer(source.level, 1, 99_999_999, 1),
    rarity: rarity(source.rarity ?? source.summonTier ?? source.summonRarity),
    power,
    attribute: text(source.attribute, 20) || "neutral",
    battleStats,
    equipment: sanitizeEquipment(source.equipment),
    magicCircle: { name: text(circle.name ?? source.circleName, 32) || "魔法陣なし", level: integer(circle.level ?? source.circleLevel, 0, 99, 0) },
  } };
}
function sanitizeSnapshot(source = {}) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return { error: "BAD_POWER_SNAPSHOT" };
  if (Array.isArray(source.party) && source.party.length > MAX_PARTY) return { error: "POWER_PARTY_TOO_LARGE" };
  const partySource = Array.isArray(source.party) ? source.party.slice(0, MAX_PARTY) : [];
  if (!partySource.length) return { error: "POWER_PARTY_REQUIRED" };
  const party = [];
  for (let index = 0; index < partySource.length; index++) {
    const sanitized = sanitizeMonster(partySource[index], index);
    if (sanitized.error) return sanitized;
    party.push(sanitized.value);
  }
  party.sort((left, right) => left.slot - right.slot);
  party.forEach((entry, index) => entry.slot = index + 1);
  const power = party.reduce((sum, entry) => sum + entry.power, 0);
  if (!powerMatches(source.power, power)) return { error: "POWER_MISMATCH" };
  return { value: {
    displayName: text(source.displayName, 16) || "冒険者",
    maxFloor: integer(source.maxFloor, 1, 10_000, 1),
    power,
    party,
  } };
}
function publicMonster(source, { icon = false } = {}) {
  const result = {
    speciesId: source.speciesId, visualSpeciesId: source.visualSpeciesId, endgameBossId: source.endgameBossId,
    floorBossCatalogId: source.floorBossCatalogId, customVisualAsset: source.customVisualAsset, customVisualBase: source.customVisualBase,
    name: source.name, level: source.level, rarity: source.rarity, power: source.power,
  };
  if (!icon) Object.assign(result, { slot: source.slot, attribute: source.attribute, equipment: source.equipment.map(item => ({ ...item })), magicCircle: { ...source.magicCircle } });
  return result;
}
function publicEntry(record, rank) {
  return { rank, playerId: record.playerId, displayName: record.displayName, power: record.power, maxFloor: record.maxFloor, updatedAt: record.updatedAt, icon: publicMonster(record.party[0], { icon: true }) };
}
function publicProfile(record) {
  return { playerId: record.playerId, displayName: record.displayName, power: record.power, maxFloor: record.maxFloor, updatedAt: record.updatedAt, party: record.party.map(entry => publicMonster(entry)) };
}

export class PlayerPowerRanking {
  constructor({ now = () => Date.now(), stateFile = null, canView = () => true } = {}) {
    this.now = now; this.stateFile = stateFile ? String(stateFile) : null; this.canView = canView;
    this.records = new Map(); this.lastPersistenceError = null; this._load();
  }
  persistenceHealthy() { return !this.lastPersistenceError; }
  recordCount() { this.prune({ persist: false }); return this.records.size; }
  _rate(session, key, windowMs, maximum) {
    if (!session) return false;
    const now = this.now(); session.powerRankingRates ??= {}; let state = session.powerRankingRates[key];
    if (!state || now < state.startedAt || now - state.startedAt >= windowMs) state = session.powerRankingRates[key] = { startedAt: now, count: 0 };
    if (state.count >= maximum) return false; state.count++; return true;
  }
  _receipts(session) {
    const values = Array.isArray(session?.powerRankingReceipts) ? session.powerRankingReceipts : [];
    if (session) session.powerRankingReceipts = values.slice(-32);
    return session?.powerRankingReceipts ?? values;
  }
  submit(session, message = {}) {
    const playerId = String(session?.playerId ?? "").toUpperCase(), requestId = text(message.requestId, 96);
    if (!PLAYER_ID.test(playerId)) return { ok: false, code: "NOT_READY", message: "本人確認済みの接続から更新してください" };
    const suppliedId = text(message.playerId ?? message.snapshot?.playerId, 24).toUpperCase();
    if (suppliedId && suppliedId !== playerId) return { ok: false, code: "PLAYER_ID_MISMATCH", message: "別プレイヤーの戦力は更新できません" };
    if (!requestId || !/^[A-Za-z0-9_-]{8,96}$/.test(requestId)) return { ok: false, code: "BAD_POWER_REQUEST", message: "戦力更新要求を確認できません" };
    const previousReceipt = this._receipts(session).find(entry => entry.requestId === requestId);
    if (previousReceipt) return { ok: true, duplicate: true, message: { type: "powerSnapshotAck", requestId, power: previousReceipt.power, updatedAt: previousReceipt.updatedAt, duplicate: true } };
    if (encodedBytes(message) > MAX_SOURCE_BYTES) return { ok: false, code: "POWER_SNAPSHOT_TOO_LARGE", message: "戦力情報が大きすぎます" };
    if (!this._rate(session, "submit", 60_000, 6)) return { ok: false, code: "POWER_SNAPSHOT_RATE", message: "戦力の更新が多すぎます。少し待ってください" };
    const sanitized = sanitizeSnapshot(message.snapshot);
    if (sanitized.error) {
      const mismatched = sanitized.error === "POWER_MISMATCH";
      return { ok: false, code: sanitized.error, message: mismatched ? "戦力とパーティー情報が一致しません" : "パーティーの戦力情報を確認できません" };
    }
    const at = this.now(), snapshot = sanitized.value, previous = new Map(this.records);
    this.prune({ persist: false });
    if (!this.records.has(playerId) && this.records.size >= MAX_RECORDS) {
      const oldest = [...this.records.values()].sort((left, right) => left.updatedAt - right.updatedAt || left.playerId.localeCompare(right.playerId))[0];
      if (oldest) this.records.delete(oldest.playerId);
    }
    this.records.set(playerId, { playerId, ...snapshot, updatedAt: at });
    if (!this._save()) { this.records = previous; return { ok: false, code: "POWER_RANKING_PERSISTENCE", message: "戦力ランキングを保存できません。サーバーの保存先を確認してください" }; }
    const receipt = { requestId, power: snapshot.power, updatedAt: at };
    session.powerRankingReceipts = [...this._receipts(session).filter(entry => entry.requestId !== requestId), receipt].slice(-32);
    return { ok: true, message: { type: "powerSnapshotAck", requestId, power: snapshot.power, updatedAt: at, duplicate: false } };
  }
  _activeSorted() {
    const cutoff = this.now() - STALE_AFTER_MS;
    return [...this.records.values()].filter(entry => entry.updatedAt > cutoff).sort((left, right) => right.power - left.power || right.maxFloor - left.maxFloor || left.updatedAt - right.updatedAt || left.playerId.localeCompare(right.playerId));
  }
  list(session, message = {}) {
    if (!session?.playerId) return { ok: false, code: "NOT_READY", message: "先に接続してください" };
    if (!this._rate(session, "list", 5_000, 4)) return { ok: false, code: "POWER_RANKING_RATE", message: "ランキングの更新が多すぎます。少し待ってください" };
    this.prune();
    const sorted = this._activeSorted(), rankById = new Map(sorted.map((entry, index) => [entry.playerId, index + 1]));
    const visible = sorted.filter(entry => this.canView(session.playerId, entry.playerId)).slice(0, 100);
    const selfRecord = this.records.get(session.playerId), selfRank = rankById.get(session.playerId);
    return { ok: true, message: { type: "powerRankingState", requestId: text(message.requestId, 96) || null, serverNow: this.now(), staleAfterMs: STALE_AFTER_MS, total: sorted.length, entries: visible.map(entry => publicEntry(entry, rankById.get(entry.playerId))), self: selfRecord && selfRank ? publicEntry(selfRecord, selfRank) : null } };
  }
  profile(session, message = {}) {
    if (!session?.playerId) return { ok: false, code: "NOT_READY", message: "先に接続してください" };
    if (!this._rate(session, "profile", 60_000, 30)) return { ok: false, code: "POWER_RANKING_RATE", message: "パーティー確認が多すぎます。少し待ってください" };
    this.prune();
    const targetId = text(message.playerId, 24).toUpperCase(), record = this.records.get(targetId);
    if (!PLAYER_ID.test(targetId) || !record || !this.canView(session.playerId, targetId)) return { ok: false, code: "POWER_RANKING_PROFILE_MISSING", message: "このプレイヤーの最新パーティーは表示できません" };
    return { ok: true, message: { type: "powerRankingProfileResult", requestId: text(message.requestId, 96) || null, profile: publicProfile(record) } };
  }
  prune({ persist = true } = {}) {
    const cutoff = this.now() - STALE_AFTER_MS, before = this.records.size;
    for (const [id, entry] of this.records) if (entry.updatedAt <= cutoff) this.records.delete(id);
    if (persist && this.records.size !== before) this._save();
    return before - this.records.size;
  }
  _load() {
    if (!this.stateFile) return;
    try {
      const raw = readFileSync(this.stateFile, "utf8");
      if (Buffer.byteLength(raw, "utf8") > 64 * 1024 * 1024) throw new Error("power ranking state exceeds 64 MiB");
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object" || Array.isArray(data) || data.version !== 1) throw new Error("unsupported power ranking state version");
      const cutoff = this.now() - STALE_AFTER_MS;
      for (const source of (Array.isArray(data.records) ? data.records : []).slice(-MAX_RECORDS)) {
        const playerId = text(source?.playerId, 24).toUpperCase(), updatedAt = integer(source?.updatedAt, 0, Number.MAX_SAFE_INTEGER, 0);
        if (!PLAYER_ID.test(playerId) || updatedAt <= cutoff) continue;
        const sanitized = sanitizeSnapshot(source);
        if (!sanitized.value) continue;
        this.records.set(playerId, { playerId, ...sanitized.value, updatedAt });
      }
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw new Error(`Power ranking state could not be loaded: ${this.stateFile}`, { cause: error });
    }
  }
  _save() {
    if (!this.stateFile) { this.lastPersistenceError = null; return true; }
    const data = JSON.stringify({ version: 1, records: [...this.records.values()].sort((left, right) => left.updatedAt - right.updatedAt).slice(-MAX_RECORDS) });
    try {
      mkdirSync(dirname(this.stateFile), { recursive: true });
      const temporary = `${this.stateFile}.tmp`;
      writeFileSync(temporary, data, { mode: 0o600 }); renameSync(temporary, this.stateFile);
      this.lastPersistenceError = null; return true;
    } catch (error) { this.lastPersistenceError = error; return false; }
  }
}

export const POWER_RANKING_STALE_MS = STALE_AFTER_MS;
