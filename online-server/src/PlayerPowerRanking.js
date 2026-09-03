import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const PLAYER_ID = /^AD-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
// Ranking state is rewritten atomically.  Keep the bounded public snapshots
// comfortably below the loader's hard limit even when every retained account
// has a full party and a restart-idempotency ledger.
const MAX_RECORDS = 5_000;
const MAX_PARTY = 4;
const MAX_EQUIPMENT = 6;
const MAX_STAT = 1_000_000_000_000;
const MAX_SOURCE_BYTES = 64 * 1024;
const MAX_PERSISTED_RECORD_BYTES = 8 * 1024;
const MAX_STATE_BYTES = 64 * 1024 * 1024;
const STALE_AFTER_MS = 30 * 24 * 60 * 60_000;
const PRESENCE_ONLINE_MS = 90_000;
const DAY_MS = 24 * 60 * 60_000;
const WEEK_MS = 7 * DAY_MS;
const JST_OFFSET_MS = 9 * 60 * 60_000;
const MAX_ACKNOWLEDGED_REWARDS = 5_000;
const MAX_RECEIPTS_PER_PLAYER = 8;
const MAX_LEGACY_RECORDS = 20_000;
const STATE_VERSION = 2;
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
function payloadHash(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("base64url");
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
  if (claimed == null || claimed === "") return false;
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
function monsterPlausibilityError({ maxFloor, level, equipment, battleStats }) {
  // These are deliberately generous ceilings, intended to reject malformed or
  // trivially forged payloads without constraining legitimate 10,000F builds.
  const floor = Math.max(1, Number(maxFloor) || 1);
  const levelLimit = Math.min(99_999_999, Math.max(10_000, floor * 10_000));
  const equipmentLevelLimit = Math.min(99_999_999, Math.max(10_000, floor * 10_000));
  if (level > levelLimit || equipment.some(item => item.level > equipmentLevelLimit)) return "POWER_PROGRESSION_IMPLAUSIBLE";
  const highestEquipmentLevel = Math.max(0, ...equipment.map(item => item.level));
  const totalPlus = equipment.reduce((sum, item) => sum + item.plus, 0);
  const combatCeiling = Math.min(MAX_STAT, Math.max(
    10_000_000,
    Math.pow(floor + 25, 3) * 250,
    Math.pow(level + 100, 2) * 1_000,
    Math.pow(highestEquipmentLevel + 100, 2) * 100,
  ));
  if (["hp", "atk", "matk", "def", "mdef", "spd"].some(key => battleStats[key] > combatCeiling)) return "POWER_STATS_IMPLAUSIBLE";
  const rateCeiling = Math.min(MAX_STAT, Math.max(10_000, floor * 1_000, level * 10, highestEquipmentLevel * 10, totalPlus * 100));
  if (battleStats.crit > rateCeiling || battleStats.evasion > rateCeiling) return "POWER_STATS_IMPLAUSIBLE";
  return null;
}
function sanitizeMonster(source, index, { maxFloor = 1, enforcePlausibility = true } = {}) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return { error: "BAD_PARTY_MEMBER" };
  if (Array.isArray(source.equipment) && source.equipment.length > MAX_EQUIPMENT) return { error: "POWER_EQUIPMENT_TOO_LARGE" };
  const battleStats = sanitizeStats(source.battleStats ?? source.stats);
  if (!battleStats) return { error: "POWER_STATS_REQUIRED" };
  const power = verifiedMonsterPower(battleStats);
  if (!powerMatches(source.power, power)) return { error: "POWER_MISMATCH" };
  const level = integer(source.level, 1, 99_999_999, 1), equipment = sanitizeEquipment(source.equipment);
  const plausibilityError = enforcePlausibility ? monsterPlausibilityError({ maxFloor, level, equipment, battleStats }) : null;
  if (plausibilityError) return { error: plausibilityError };
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
    level,
    rarity: rarity(source.rarity ?? source.summonTier ?? source.summonRarity),
    power,
    attribute: text(source.attribute, 20) || "neutral",
    battleStats,
    equipment,
    magicCircle: { name: text(circle.name ?? source.circleName, 32) || "魔法陣なし", level: integer(circle.level ?? source.circleLevel, 0, 99, 0) },
  } };
}
function sanitizeSnapshot(source = {}, { enforcePlausibility = true } = {}) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return { error: "BAD_POWER_SNAPSHOT" };
  if (Array.isArray(source.party) && source.party.length > MAX_PARTY) return { error: "POWER_PARTY_TOO_LARGE" };
  const partySource = Array.isArray(source.party) ? source.party.slice(0, MAX_PARTY) : [];
  if (!partySource.length) return { error: "POWER_PARTY_REQUIRED" };
  const maxFloor = integer(source.maxFloor, 1, 100, 1);
  const party = [];
  for (let index = 0; index < partySource.length; index++) {
    const sanitized = sanitizeMonster(partySource[index], index, { maxFloor, enforcePlausibility });
    if (sanitized.error) return sanitized;
    party.push(sanitized.value);
  }
  party.sort((left, right) => left.slot - right.slot);
  party.forEach((entry, index) => entry.slot = index + 1);
  const power = party.reduce((sum, entry) => sum + entry.power, 0);
  if (!powerMatches(source.power, power)) return { error: "POWER_MISMATCH" };
  return { value: {
    displayName: text(source.displayName, 16) || "冒険者",
    maxFloor,
    power,
    party,
  } };
}
function compactVerifiedSnapshot(source) {
  return {
    displayName: source.displayName,
    maxFloor: source.maxFloor,
    power: source.power,
    party: source.party.map(({ battleStats, ...entry }) => ({
      ...entry,
      equipment: entry.equipment.map(item => ({ ...item })),
      magicCircle: { ...entry.magicCircle },
    })),
  };
}
function persistedMonster(source, { dropAssets = false } = {}) {
  return {
    slot: integer(source?.slot, 1, MAX_PARTY, 1),
    monsterId: text(source?.monsterId, 80) || null,
    speciesId: safeId(source?.speciesId) || "slime",
    visualSpeciesId: safeId(source?.visualSpeciesId),
    endgameBossId: safeId(source?.endgameBossId),
    floorBossCatalogId: safeId(source?.floorBossCatalogId),
    customVisualAsset: dropAssets ? null : assetPath(source?.customVisualAsset),
    customVisualBase: dropAssets ? null : assetBase(source?.customVisualBase),
    name: text(source?.name, 32) || "魔物",
    level: integer(source?.level, 1, 99_999_999, 1),
    rarity: rarity(source?.rarity),
    power: integer(source?.power, 1, Number.MAX_SAFE_INTEGER, 1),
    attribute: text(source?.attribute, 20) || "neutral",
    equipment: sanitizeEquipment(source?.equipment).map(item => dropAssets ? { ...item, visualAsset: null } : item),
    magicCircle: {
      name: text(source?.magicCircle?.name, 32) || "魔法陣なし",
      level: integer(source?.magicCircle?.level, 0, 99, 0),
    },
  };
}
function persistedRecord(source) {
  const build = dropAssets => ({
    playerId: text(source?.playerId, 24).toUpperCase(),
    displayName: text(source?.displayName, 16) || "冒険者",
    maxFloor: integer(source?.maxFloor, 1, 100, 1),
    power: integer(source?.power, 1, Number.MAX_SAFE_INTEGER, 1),
    party: (Array.isArray(source?.party) ? source.party : []).slice(0, MAX_PARTY).map(entry => persistedMonster(entry, { dropAssets })),
    updatedAt: integer(source?.updatedAt, 0, Number.MAX_SAFE_INTEGER, 0),
  });
  let result = build(false);
  if (encodedBytes(result) > MAX_PERSISTED_RECORD_BYTES) result = build(true);
  return encodedBytes(result) <= MAX_PERSISTED_RECORD_BYTES ? result : null;
}
function sanitizePersistedRecord(source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  const playerId = text(source.playerId, 24).toUpperCase(), updatedAt = integer(source.updatedAt, 0, Number.MAX_SAFE_INTEGER, 0);
  if (!Array.isArray(source.party) || !source.party.length || source.party.length > MAX_PARTY) return null;
  const partySource = source.party.slice(0, MAX_PARTY);
  if (!PLAYER_ID.test(playerId) || !updatedAt) return null;
  const party = partySource.map((entry, index) => ({ ...persistedMonster(entry), slot: index + 1 }));
  const power = party.reduce((sum, entry) => sum + entry.power, 0);
  if (!powerMatches(source.power, power)) return null;
  const record = { playerId, displayName: text(source.displayName, 16) || "冒険者", maxFloor: integer(source.maxFloor, 1, 100, 1), power, party, updatedAt };
  return persistedRecord(record) ? record : null;
}
function compareRanking(left, right) {
  return right.power - left.power || right.maxFloor - left.maxFloor || left.updatedAt - right.updatedAt || left.playerId.localeCompare(right.playerId);
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
function publicPresence(source, recordUpdatedAt, at) {
  const now = integer(at, 0, Number.MAX_SAFE_INTEGER, Date.now());
  const reportedAt = integer(source?.lastActiveAt, 0, Number.MAX_SAFE_INTEGER, 0);
  const fallbackAt = integer(recordUpdatedAt, 0, Number.MAX_SAFE_INTEGER, 0);
  const lastActiveAt = Math.min(now, Math.max(reportedAt, fallbackAt));
  return {
    online: Boolean(source?.online === true && reportedAt > 0 && reportedAt <= now && now - reportedAt <= PRESENCE_ONLINE_MS),
    lastActiveAt,
  };
}
function publicEntry(record, rank, presence, at) {
  return { rank, playerId: record.playerId, displayName: record.displayName, power: record.power, maxFloor: record.maxFloor, updatedAt: record.updatedAt, ...publicPresence(presence, record.updatedAt, at), icon: publicMonster(record.party[0], { icon: true }) };
}
function publicProfile(record, presence, at) {
  return { playerId: record.playerId, displayName: record.displayName, power: record.power, maxFloor: record.maxFloor, updatedAt: record.updatedAt, ...publicPresence(presence, record.updatedAt, at), party: record.party.map(entry => publicMonster(entry)) };
}

export function powerRankingSeason(value = Date.now()) {
  const local = new Date(Number(value) + JST_OFFSET_MS);
  const localDay = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  const daysSinceMonday = (new Date(localDay).getUTCDay() + 6) % 7;
  const startLocal = localDay - daysSinceMonday * DAY_MS, startAt = startLocal - JST_OFFSET_MS;
  return { id: new Date(startLocal).toISOString().slice(0, 10), startsAt: startAt, endsAt: startAt + WEEK_MS };
}

export function rankingRewardForRank(rank) {
  const position = integer(rank, 1, 100, 100);
  if (position === 1) return { gold: 15_000_000, crystals: 3_000, captureCrystals: 300, abyssKeys: 100, experienceItemsUltra: 30, mythicEquipment: 1, equipmentPlus: 99 };
  if (position <= 3) return { gold: 10_000_000, crystals: 2_000, captureCrystals: 200, abyssKeys: 60, experienceItemsUltra: 20, mythicEquipment: 1, equipmentPlus: 75 };
  if (position <= 10) return { gold: 6_000_000, crystals: 1_200, captureCrystals: 120, abyssKeys: 30, experienceItemsUltra: 12, mythicEquipment: 1, equipmentPlus: 50 };
  if (position <= 50) return { gold: 3_000_000, crystals: 600, captureCrystals: 60, abyssKeys: 15, experienceItemsUltra: 6, mythicEquipment: 0, equipmentPlus: 0 };
  return { gold: 1_500_000, crystals: 300, captureCrystals: 30, abyssKeys: 5, experienceItemsUltra: 3, mythicEquipment: 0, equipmentPlus: 0 };
}

function publicRewardDelivery(source) {
  return { deliveryId: source.deliveryId, seasonId: source.seasonId, rank: source.rank, title: `週間戦力ランキング #${source.rank}`, reward: { ...source.reward }, createdAt: source.createdAt };
}
function sanitizeReward(source) {
  const value = source && typeof source === "object" && !Array.isArray(source) ? source : {};
  return {
    gold: integer(value.gold, 0, Number.MAX_SAFE_INTEGER, 0), crystals: integer(value.crystals, 0, 100_000, 0),
    captureCrystals: integer(value.captureCrystals, 0, 100_000, 0), abyssKeys: integer(value.abyssKeys, 0, 10_000, 0),
    experienceItemsUltra: integer(value.experienceItemsUltra, 0, 10_000, 0), mythicEquipment: integer(value.mythicEquipment, 0, 10, 0),
    equipmentPlus: integer(value.equipmentPlus, 0, 999, 0),
  };
}

export class PlayerPowerRanking {
  constructor({ now = () => Date.now(), stateFile = null, canView = () => true, presenceOf = () => null, maxRecords = MAX_RECORDS, maxAcknowledgedRewards = MAX_ACKNOWLEDGED_REWARDS, maxStateBytes = MAX_STATE_BYTES } = {}) {
    this.now = now; this.stateFile = stateFile ? String(stateFile) : null; this.canView = canView; this.presenceOf = presenceOf;
    this.maxRecords = integer(maxRecords, 1, MAX_RECORDS, MAX_RECORDS);
    this.maxAcknowledgedRewards = integer(maxAcknowledgedRewards, 0, MAX_ACKNOWLEDGED_REWARDS, MAX_ACKNOWLEDGED_REWARDS);
    this.maxStateBytes = integer(maxStateBytes, 1_024, MAX_STATE_BYTES, MAX_STATE_BYTES);
    this.records = new Map(); this.rewards = []; this.receiptsByPlayer = new Map(); this.season = powerRankingSeason(this.now()); this.lastPersistenceError = null;
    this._load(); const at = this.now(); if (this._rollSeason(at)) this.prune({ persist: true, roll: false, at });
  }
  persistenceHealthy() { return !this.lastPersistenceError; }
  nextRolloverAt() { return Math.max(0, Number(this.season?.endsAt) || powerRankingSeason(this.now()).endsAt); }
  rollSeason(at = this.now()) { return this._rollSeason(Number(at)); }
  recordCount() { this.prune({ persist: true }); return this.records.size; }
  _rate(session, key, windowMs, maximum, at = this.now()) {
    if (!session) return false;
    const now = Number(at); session.powerRankingRates ??= {}; let state = session.powerRankingRates[key];
    if (!state || now < state.startedAt || now - state.startedAt >= windowMs) state = session.powerRankingRates[key] = { startedAt: now, count: 0 };
    if (state.count >= maximum) return false; state.count++; return true;
  }
  _receiptLedger(playerId) { return this.receiptsByPlayer.get(playerId) ?? []; }
  _setReceiptLedger(playerId, entries) {
    const bounded = entries.slice(-MAX_RECEIPTS_PER_PLAYER).map(entry => ({ ...entry }));
    if (bounded.length) this.receiptsByPlayer.set(playerId, bounded); else this.receiptsByPlayer.delete(playerId);
    return bounded;
  }
  _syncSessionReceipts(session) {
    if (session) session.powerRankingReceipts = this._receiptLedger(session.playerId).map(entry => ({ requestId: entry.requestId, power: entry.power, updatedAt: entry.updatedAt }));
  }
  _presence(playerId, at) {
    try { return this.presenceOf?.(playerId, at) ?? null; } catch { return null; }
  }
  _pruneRecordsAt(at) {
    const cutoff = Number(at) - STALE_AFTER_MS; let removed = 0;
    for (const [id, entry] of this.records) if (entry.updatedAt <= cutoff) { this.records.delete(id); this.receiptsByPlayer.delete(id); removed++; }
    return removed;
  }
  _compareRetention(left, right) {
    const leftCurrent = left.updatedAt >= this.season.startsAt && left.updatedAt < this.season.endsAt;
    const rightCurrent = right.updatedAt >= this.season.startsAt && right.updatedAt < this.season.endsAt;
    return Number(rightCurrent) - Number(leftCurrent) || compareRanking(left, right);
  }
  _enforceRecordCapacity() {
    if (this.records.size <= this.maxRecords) return 0;
    const retained = new Set([...this.records.values()].sort((left, right) => this._compareRetention(left, right)).slice(0, this.maxRecords).map(entry => entry.playerId)); let removed = 0;
    for (const id of this.records.keys()) if (!retained.has(id)) { this.records.delete(id); this.receiptsByPlayer.delete(id); removed++; }
    return removed;
  }
  _compactRewards() {
    const pending = this.rewards.filter(entry => entry.acknowledgedAt == null);
    const acknowledgedSorted = this.rewards.filter(entry => entry.acknowledgedAt != null).sort((left, right) => left.acknowledgedAt - right.acknowledgedAt || left.createdAt - right.createdAt || left.deliveryId.localeCompare(right.deliveryId));
    const acknowledged = this.maxAcknowledgedRewards ? acknowledgedSorted.slice(-this.maxAcknowledgedRewards) : [];
    const unique = new Map();
    for (const entry of [...acknowledged, ...pending].sort((left, right) => left.createdAt - right.createdAt || left.rank - right.rank || left.deliveryId.localeCompare(right.deliveryId))) unique.set(entry.deliveryId, entry);
    this.rewards = [...unique.values()];
  }
  submit(session, message = {}) {
    const at = this.now(), playerId = String(session?.playerId ?? "").toUpperCase(), requestId = text(message.requestId, 96);
    if (!PLAYER_ID.test(playerId)) return { ok: false, code: "NOT_READY", message: "本人確認済みの接続から更新してください" };
    const suppliedId = text(message.playerId ?? message.snapshot?.playerId, 24).toUpperCase();
    if (suppliedId && suppliedId !== playerId) return { ok: false, code: "PLAYER_ID_MISMATCH", message: "別プレイヤーの戦力は更新できません" };
    if (!requestId || !/^[A-Za-z0-9_-]{8,96}$/.test(requestId)) return { ok: false, code: "BAD_POWER_REQUEST", message: "戦力更新要求を確認できません" };
    if (!this._rollSeason(at)) return { ok: false, code: "POWER_RANKING_PERSISTENCE", message: "週間ランキングを安全に確定できません" };
    if (encodedBytes(message) > MAX_SOURCE_BYTES) return { ok: false, code: "POWER_SNAPSHOT_TOO_LARGE", message: "戦力情報が大きすぎます" };
    const sanitized = sanitizeSnapshot(message.snapshot);
    if (sanitized.error) {
      const mismatched = sanitized.error === "POWER_MISMATCH";
      const implausible = sanitized.error.includes("IMPLAUSIBLE");
      return { ok: false, code: sanitized.error, message: mismatched ? "戦力とパーティー情報が一致しません" : implausible ? "到達階層・レベル・装備と戦闘能力が一致しません" : "パーティーの戦力情報を確認できません" };
    }
    const snapshotHash = payloadHash(sanitized.value), previousReceipt = this._receiptLedger(playerId).find(entry => entry.requestId === requestId);
    if (previousReceipt) {
      if (previousReceipt.payloadHash !== snapshotHash) return { ok: false, code: "POWER_REQUEST_CONFLICT", message: "同じ戦力更新IDの内容が一致しません" };
      this._syncSessionReceipts(session);
      return { ok: true, duplicate: true, message: { type: "powerSnapshotAck", requestId, power: previousReceipt.power, updatedAt: previousReceipt.updatedAt, duplicate: true, rankingRewards: this.pendingRewards(session.playerId) } };
    }
    if (!this._rate(session, "submit", 60_000, 6, at)) return { ok: false, code: "POWER_SNAPSHOT_RATE", message: "戦力の更新が多すぎます。少し待ってください" };
    const snapshot = compactVerifiedSnapshot(sanitized.value), candidate = { playerId, ...snapshot, updatedAt: at };
    if (!persistedRecord(candidate)) return { ok: false, code: "POWER_SNAPSHOT_TOO_LARGE", message: "公開パーティー情報が大きすぎます" };
    const previousRecords = new Map(this.records), previousReceipts = new Map([...this.receiptsByPlayer].map(([id, entries]) => [id, entries.map(entry => ({ ...entry }))]));
    this._pruneRecordsAt(at);
    if (!this.records.has(playerId) && this.records.size >= this.maxRecords) {
      const retentionOrder = (left, right) => this._compareRetention(left, right), worst = [...this.records.values()].sort(retentionOrder).at(-1);
      if (!worst || retentionOrder(candidate, worst) >= 0) { this.records = previousRecords; this.receiptsByPlayer = previousReceipts; return { ok: false, code: "POWER_RANKING_FULL", message: "現在の保存枠は上位記録で満杯です。戦力更新後にもう一度お試しください" }; }
      this.records.delete(worst.playerId); this.receiptsByPlayer.delete(worst.playerId);
    }
    this.records.set(playerId, candidate);
    const receipt = { requestId, payloadHash: snapshotHash, power: snapshot.power, updatedAt: at };
    this._setReceiptLedger(playerId, [...this._receiptLedger(playerId).filter(entry => entry.requestId !== requestId), receipt]);
    if (!this._save()) { this.records = previousRecords; this.receiptsByPlayer = previousReceipts; return { ok: false, code: "POWER_RANKING_PERSISTENCE", message: "戦力ランキングを保存できません。サーバーの保存先を確認してください" }; }
    this._syncSessionReceipts(session);
    return { ok: true, message: { type: "powerSnapshotAck", requestId, power: snapshot.power, updatedAt: at, duplicate: false, rankingRewards: this.pendingRewards(session.playerId) } };
  }
  _activeSorted(at = this.now()) {
    const cutoff = Number(at) - STALE_AFTER_MS;
    return [...this.records.values()].filter(entry => entry.updatedAt > cutoff).sort(compareRanking);
  }
  list(session, message = {}) {
    const at = this.now();
    if (!session?.playerId) return { ok: false, code: "NOT_READY", message: "先に接続してください" };
    if (!this._rollSeason(at)) return { ok: false, code: "POWER_RANKING_PERSISTENCE", message: "週間ランキングを安全に確定できません" };
    if (!this._rate(session, "list", 5_000, 4, at)) return { ok: false, code: "POWER_RANKING_RATE", message: "ランキングの更新が多すぎます。少し待ってください" };
    this.prune({ at, roll: false });
    const sorted = this._activeSorted(at), rankById = new Map(sorted.map((entry, index) => [entry.playerId, index + 1]));
    const limit = integer(message.limit, 1, 100, 100), visible = sorted.slice(0, 100).filter(entry => this.canView(session.playerId, entry.playerId)).slice(0, limit);
    const selfRecord = this.records.get(session.playerId), selfRank = rankById.get(session.playerId);
    return { ok: true, message: { type: "powerRankingState", requestId: text(message.requestId, 96) || null, serverNow: at, staleAfterMs: STALE_AFTER_MS, presenceOnlineMs: PRESENCE_ONLINE_MS, season: { ...this.season }, rewardPolicy: "TOP100・毎週月曜0:00(JST)確定", rankingRewards: this.pendingRewards(session.playerId), total: sorted.length, entries: visible.map(entry => publicEntry(entry, rankById.get(entry.playerId), this._presence(entry.playerId, at), at)), self: selfRecord && selfRank ? publicEntry(selfRecord, selfRank, this._presence(selfRecord.playerId, at), at) : null } };
  }
  pendingRewards(playerId) {
    const id = String(playerId ?? "").toUpperCase();
    return this.rewards.filter(entry => entry.playerId === id && entry.acknowledgedAt == null).slice(0, 12).map(publicRewardDelivery);
  }
  ackReward(session, message = {}) {
    const at = this.now(), playerId = String(session?.playerId ?? "").toUpperCase(), deliveryId = text(message.deliveryId, 96);
    if (!PLAYER_ID.test(playerId) || !deliveryId) return { ok: false, code: "BAD_RANKING_REWARD_ACK", message: "ランキング報酬の受取情報を確認できません" };
    if (!this._rollSeason(at)) return { ok: false, code: "POWER_RANKING_PERSISTENCE", message: "週間ランキングを安全に確定できません" };
    const entry = this.rewards.find(value => value.deliveryId === deliveryId && value.playerId === playerId);
    if (!entry) return { ok: false, code: "RANKING_REWARD_MISSING", message: "対象のランキング報酬がありません" };
    if (entry.acknowledgedAt != null) return { ok: true, duplicate: true, message: { type: "powerRankingRewardAck", deliveryId, duplicate: true } };
    const previousRewards = this.rewards.map(value => ({ ...value, reward: { ...value.reward } })); entry.acknowledgedAt = at; this._compactRewards();
    if (!this._save()) { this.rewards = previousRewards; return { ok: false, code: "POWER_RANKING_PERSISTENCE", message: "報酬の受取を保存できません" }; }
    return { ok: true, message: { type: "powerRankingRewardAck", deliveryId, duplicate: false } };
  }
  profile(session, message = {}) {
    const at = this.now();
    if (!session?.playerId) return { ok: false, code: "NOT_READY", message: "先に接続してください" };
    if (!this._rollSeason(at)) return { ok: false, code: "POWER_RANKING_PERSISTENCE", message: "週間ランキングを安全に確定できません" };
    if (!this._rate(session, "profile", 60_000, 30, at)) return { ok: false, code: "POWER_RANKING_RATE", message: "パーティー確認が多すぎます。少し待ってください" };
    this.prune({ at, roll: false });
    const targetId = text(message.playerId, 24).toUpperCase(), record = this.records.get(targetId);
    if (!PLAYER_ID.test(targetId) || !record || !this.canView(session.playerId, targetId)) return { ok: false, code: "POWER_RANKING_PROFILE_MISSING", message: "このプレイヤーの最新パーティーは表示できません" };
    return { ok: true, message: { type: "powerRankingProfileResult", requestId: text(message.requestId, 96) || null, serverNow: at, presenceOnlineMs: PRESENCE_ONLINE_MS, profile: publicProfile(record, this._presence(record.playerId, at), at) } };
  }
  prune({ persist = true, roll = true, at = this.now() } = {}) {
    const timestamp = Number(at), before = this.records.size;
    if (roll && !this._rollSeason(timestamp)) return 0;
    const previousRecords = new Map(this.records), previousReceipts = new Map([...this.receiptsByPlayer].map(([id, entries]) => [id, entries.map(entry => ({ ...entry }))]));
    this._pruneRecordsAt(timestamp); this._enforceRecordCapacity(); const removed = before - this.records.size;
    if (persist && removed && !this._save()) { this.records = previousRecords; this.receiptsByPlayer = previousReceipts; return 0; }
    return removed;
  }
  _rollSeason(at = this.now()) {
    const timestamp = Number(at), current = powerRankingSeason(timestamp);
    if (!this.season?.id) { this.season = current; return this._save(); }
    if (this.season.id === current.id) return true;
    // A wall-clock correction must never reopen a settled week.
    if (current.startsAt < this.season.startsAt) return true;
    const previousSeason = { ...this.season }, previousRewards = this.rewards.map(entry => ({ ...entry, reward: { ...entry.reward } })), previousRecords = new Map(this.records), previousReceipts = new Map([...this.receiptsByPlayer].map(([id, entries]) => [id, entries.map(entry => ({ ...entry }))]));
    const finalists = [...this.records.values()].filter(entry => entry.updatedAt >= previousSeason.startsAt && entry.updatedAt < previousSeason.endsAt).sort(compareRanking).slice(0, 100);
    finalists.forEach((entry, index) => { const rank = index + 1, deliveryId = `power-${previousSeason.id}-${entry.playerId}`; if (!this.rewards.some(reward => reward.deliveryId === deliveryId)) this.rewards.push({ deliveryId, playerId: entry.playerId, seasonId: previousSeason.id, rank, reward: rankingRewardForRank(rank), createdAt: current.startsAt, acknowledgedAt: null }); });
    this._compactRewards(); this.season = current; this._pruneRecordsAt(timestamp); this._enforceRecordCapacity();
    if (this._save()) return true;
    this.rewards = previousRewards; this.season = previousSeason; this.records = previousRecords; this.receiptsByPlayer = previousReceipts; return false;
  }
  _load() {
    if (!this.stateFile) return;
    try {
      const raw = readFileSync(this.stateFile, "utf8");
      if (Buffer.byteLength(raw, "utf8") > this.maxStateBytes) throw new Error(`power ranking state exceeds ${this.maxStateBytes} bytes`);
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object" || Array.isArray(data) || ![1, STATE_VERSION].includes(data.version)) throw new Error("unsupported power ranking state version");
      if (data.season && typeof data.season === "object" && typeof data.season.id === "string") this.season = { id: text(data.season.id, 20), startsAt: integer(data.season.startsAt, 0, Number.MAX_SAFE_INTEGER, 0), endsAt: integer(data.season.endsAt, 0, Number.MAX_SAFE_INTEGER, 0) };
      for (const source of (Array.isArray(data.records) ? data.records : []).slice(-MAX_LEGACY_RECORDS)) {
        const playerId = text(source?.playerId, 24).toUpperCase(), updatedAt = integer(source?.updatedAt, 0, Number.MAX_SAFE_INTEGER, 0);
        if (!PLAYER_ID.test(playerId) || !updatedAt) continue;
        const legacy = Array.isArray(source?.party) && source.party.some(entry => entry?.battleStats || entry?.stats);
        if (legacy) {
          const sanitized = sanitizeSnapshot(source, { enforcePlausibility: false });
          if (!sanitized.value) continue;
          const record = { playerId, ...compactVerifiedSnapshot(sanitized.value), updatedAt };
          if (persistedRecord(record)) this.records.set(playerId, record);
        } else {
          const record = sanitizePersistedRecord(source);
          if (record) this.records.set(playerId, record);
        }
      }
      this.rewards = (Array.isArray(data.rewards) ? data.rewards : []).map(source => { const playerId = text(source?.playerId, 24).toUpperCase(), deliveryId = text(source?.deliveryId, 96), seasonId = text(source?.seasonId, 20), rank = integer(source?.rank, 1, 100, 100); if (!PLAYER_ID.test(playerId) || !deliveryId || !seasonId) return null; return { deliveryId, playerId, seasonId, rank, reward: sanitizeReward(source.reward), createdAt: integer(source.createdAt, 0, Number.MAX_SAFE_INTEGER, 0), acknowledgedAt: source.acknowledgedAt == null ? null : integer(source.acknowledgedAt, 0, Number.MAX_SAFE_INTEGER, 0) }; }).filter(Boolean);
      this._compactRewards();
      for (const ledger of (Array.isArray(data.receipts) ? data.receipts : []).slice(-MAX_LEGACY_RECORDS)) {
        const playerId = text(ledger?.playerId, 24).toUpperCase();
        if (!PLAYER_ID.test(playerId) || !this.records.has(playerId)) continue;
        const entries = (Array.isArray(ledger.entries) ? ledger.entries : []).slice(-MAX_RECEIPTS_PER_PLAYER).map(source => {
          const requestId = text(source?.requestId, 96), receiptHash = text(source?.payloadHash, 64), power = integer(source?.power, 1, Number.MAX_SAFE_INTEGER, 1), updatedAt = integer(source?.updatedAt, 0, Number.MAX_SAFE_INTEGER, 0);
          return /^[A-Za-z0-9_-]{8,96}$/.test(requestId) && /^[A-Za-z0-9_-]{43}$/.test(receiptHash) && updatedAt ? { requestId, payloadHash: receiptHash, power, updatedAt } : null;
        }).filter(Boolean);
        this._setReceiptLedger(playerId, entries);
      }
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw new Error(`Power ranking state could not be loaded: ${this.stateFile}`, { cause: error });
    }
  }
  _save() {
    if (!this.stateFile) { this.lastPersistenceError = null; return true; }
    try {
      const records = [];
      for (const source of [...this.records.values()].sort((left, right) => left.updatedAt - right.updatedAt || left.playerId.localeCompare(right.playerId))) {
        const record = persistedRecord(source);
        if (!record) throw new Error(`power ranking record exceeds ${MAX_PERSISTED_RECORD_BYTES} bytes`);
        records.push(record);
      }
      const receipts = [...this.receiptsByPlayer.entries()].filter(([playerId]) => this.records.has(playerId)).sort(([left], [right]) => left.localeCompare(right)).map(([playerId, entries]) => ({ playerId, entries: entries.slice(-MAX_RECEIPTS_PER_PLAYER).map(entry => ({ ...entry })) }));
      const data = JSON.stringify({ version: STATE_VERSION, season: this.season, rewards: this.rewards, receipts, records });
      const bytes = Buffer.byteLength(data, "utf8");
      if (bytes > this.maxStateBytes) throw new Error(`power ranking state would exceed ${this.maxStateBytes} bytes`);
      mkdirSync(dirname(this.stateFile), { recursive: true });
      const temporary = `${this.stateFile}.tmp`;
      writeFileSync(temporary, data, { mode: 0o600 }); renameSync(temporary, this.stateFile);
      this.lastPersistenceError = null; return true;
    } catch (error) { this.lastPersistenceError = error; return false; }
  }
}

export const POWER_RANKING_STALE_MS = STALE_AFTER_MS;
export const POWER_RANKING_PRESENCE_ONLINE_MS = PRESENCE_ONLINE_MS;
