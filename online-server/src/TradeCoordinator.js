import { randomBytes } from "node:crypto";
import { hashSettlementSecret } from "./SettlementJournal.js";

const KINDS = new Set(["monster", "equipment", "stack", "currency"]);
const STACK_ASSETS = new Map(Object.entries({
  potions: ["薬草", "N"], highPotions: ["上級回復薬", "R"], partyPotions: ["全体回復薬", "SR"],
  manaPotions: ["魔力水", "N"], highManaPotions: ["上級魔力水", "R"], partyManaPotions: ["全体魔力水", "SR"],
  fullManaPotions: ["完全魔力水", "SSR"], partyFullManaPotions: ["全体完全魔力水", "UR"], reviveLeaves: ["蘇生葉", "SR"],
  statusCures: ["浄化薬", "R"], partyStatusCures: ["全体浄化薬", "SSR"], fullHeals: ["完全回復薬", "UR"],
  partyFullHeals: ["全体完全回復薬", "LR"], experienceItems: ["経験値パック（小）", "R"],
  experienceItemsMedium: ["経験値パック（中）", "SR"], experienceItemsLarge: ["経験値パック（大）", "SSR"],
  experienceItemsUltra: ["経験値パック（超）", "UR"], abyssKeys: ["深淵鍵", "LR"],
}));
const CURRENCY_ASSETS = new Map(Object.entries({
  gold: ["GOLD", "G"], crystals: ["魔晶石", "💎"], captureCrystals: ["捕獲結晶", "捕獲"],
}));
const LEGACY_CURRENCY_KEYS = new Map([["gems", "crystals"]]);
const NON_PLAYER_TRADEABLE_MONSTER_SPECIES = new Set(["juvenile_amalga"]);
const MAX_TRADE_AMOUNT = Number.MAX_SAFE_INTEGER;
const MAX_ASSET_PAYLOAD_BYTES = 96 * 1024;
export const MAX_TRADE_PERSISTED_MESSAGE_BYTES = 112 * 1024;
const TRADE_MESSAGE_ENVELOPE_RESERVE_BYTES = 8 * 1024;
const DEFAULT_COMMIT_RETRY_MS = 15_000;
const DEFAULT_COMMIT_DEADLINE_MS = 90_000;
const DEFAULT_MAX_COMMIT_RETRIES = 5;
const DEFAULT_COMPLETED_RETENTION_MS = 30 * 60_000;
const DEFAULT_RECOVERY_RETENTION_MS = 7 * 24 * 60 * 60_000;
const DEFAULT_RECOVERY_WARNING_THRESHOLD = 1024;
const DEFAULT_MAX_RECOVERIES_PER_PLAYER = 8;

function token(bytes = 12) {
  return randomBytes(bytes).toString("base64url");
}

function text(value, max = 64) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function jsonByteLength(value) {
  try {
    return Buffer.byteLength(JSON.stringify(value), "utf8");
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function safePayload(value) {
  let encoded;
  try {
    encoded = JSON.stringify(value ?? {});
  } catch {
    return null;
  }
  if (Buffer.byteLength(encoded, "utf8") > MAX_ASSET_PAYLOAD_BYTES) return null;
  try {
    return JSON.parse(encoded);
  } catch {
    return null;
  }
}

function positiveInteger(value, fallback, minimum = 1) {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed >= minimum ? parsed : fallback;
}

function safeOfferRequestId(value) {
  const id = typeof value === "string" ? value.trim() : "";
  return /^[a-zA-Z0-9:_-]{8,96}$/.test(id) ? id : "";
}

export function sanitizeTradeAsset(source, { allowLegacy = false } = {}) {
  const kind = KINDS.has(source?.kind) ? source.kind : null;
  let payload = safePayload(source?.payload);
  if (!kind || !payload) return null;
  if (kind === "stack" || kind === "currency") {
    const definitions = kind === "stack" ? STACK_ASSETS : CURRENCY_ASSETS;
    const sourceKey = text(payload.key, 40), key = allowLegacy && kind === "currency" ? LEGACY_CURRENCY_KEYS.get(sourceKey) ?? sourceKey : sourceKey;
    const amount = payload.amount, definition = definitions.get(key);
    if (!definition || !Number.isSafeInteger(amount) || amount < 1 || amount > MAX_TRADE_AMOUNT) return null;
    const [name, rarity] = definition;
    payload = { key, amount };
    const asset = {
      assetId: `${kind}:${key}`,
      kind,
      name,
      rarity,
      level: 1,
      details: `${amount.toLocaleString("ja-JP")}${kind === "currency" && key === "gold" ? "G" : "個"}`,
      amount,
      payload,
    };
    return jsonByteLength(asset) <= MAX_TRADE_PERSISTED_MESSAGE_BYTES - TRADE_MESSAGE_ENVELOPE_RESERVE_BYTES ? asset : null;
  }
  const asset = {
    assetId: text(source.assetId, 160),
    kind,
    name: text(source.name, 64) || "交換品",
    rarity: text(source.rarity, 20) || "N",
    level: Math.max(0, Math.min(99_999_999, Math.floor(Number(source.level) || 0))),
    details: text(source.details, 80),
    payload,
  };
  return jsonByteLength(asset) <= MAX_TRADE_PERSISTED_MESSAGE_BYTES - TRADE_MESSAGE_ENVELOPE_RESERVE_BYTES ? asset : null;
}

function liveTradeAssetRestriction(asset) {
  return asset?.kind === "monster" && NON_PLAYER_TRADEABLE_MONSTER_SPECIES.has(text(asset?.payload?.speciesId, 80))
    ? "レイド契約個体は個人交換できません"
    : "";
}

function publicAsset(asset) {
  if (!asset) return null;
  const { payload, ...publicPart } = asset;
  if (["stack", "currency"].includes(asset.kind)) publicPart.amount = payload?.amount;
  return publicPart;
}

function privateCredential(session) {
  const clientKey = String(session?.clientKey ?? ""), resumeToken = String(session?.resumeToken ?? ""), previousResumeToken = String(session?.previousResumeToken ?? "");
  return clientKey.length >= 24 && resumeToken ? { clientKey, resumeToken, previousResumeToken: previousResumeToken || null } : null;
}

function durableCredential(source) {
  if (!source || typeof source !== "object") return null;
  const clientKeyHash = /^[a-f0-9]{64}$/.test(String(source.clientKeyHash ?? ""))
    ? String(source.clientKeyHash)
    : hashSettlementSecret(source.clientKey);
  const resumeTokenHash = /^[a-f0-9]{64}$/.test(String(source.resumeTokenHash ?? ""))
    ? String(source.resumeTokenHash)
    : hashSettlementSecret(source.resumeToken);
  const previousResumeTokenHash = /^[a-f0-9]{64}$/.test(String(source.previousResumeTokenHash ?? ""))
    ? String(source.previousResumeTokenHash)
    : hashSettlementSecret(source.previousResumeToken);
  return clientKeyHash && resumeTokenHash ? { clientKeyHash, resumeTokenHash, previousResumeTokenHash: previousResumeTokenHash || null } : null;
}

function credentialInputMatches(expected, { clientKey = "", resumeTokens = [] } = {}) {
  if (!expected) return false;
  const client = String(clientKey ?? ""), tokens = [...new Set((Array.isArray(resumeTokens) ? resumeTokens : [resumeTokens]).map(value => String(value ?? "")).filter(Boolean))];
  const clientMatches = expected.clientKeyHash
    ? hashSettlementSecret(client) === expected.clientKeyHash
    : client === String(expected.clientKey ?? "");
  if (!clientMatches) return false;
  if (expected.resumeTokenHash || expected.previousResumeTokenHash) {
    const actualHashes = new Set(tokens.map(hashSettlementSecret));
    return [expected.resumeTokenHash, expected.previousResumeTokenHash].filter(Boolean).some(value => actualHashes.has(value));
  }
  const expectedTokens = new Set([expected.resumeToken, expected.previousResumeToken].map(value => String(value ?? "")).filter(Boolean));
  return tokens.some(value => expectedTokens.has(value));
}

export class TradeCoordinator {
  constructor({
    now = () => Date.now(),
    timeoutMs = 5 * 60_000,
    commitRetryMs,
    commitDeadlineMs,
    maxCommitRetries = DEFAULT_MAX_COMMIT_RETRIES,
    completedRetentionMs = DEFAULT_COMPLETED_RETENTION_MS,
    recoveryRetentionMs = DEFAULT_RECOVERY_RETENTION_MS,
    recoveryWarningThreshold = DEFAULT_RECOVERY_WARNING_THRESHOLD,
    maxRecoveriesPerPlayer = DEFAULT_MAX_RECOVERIES_PER_PLAYER,
    send = () => {},
    broadcastRoom = () => {},
    getPlayerName = () => "",
    durableState = null,
    persistState = null,
  } = {}) {
    this.now = now;
    this.timeoutMs = positiveInteger(timeoutMs, 5 * 60_000);
    const derivedRetryMs = Math.min(this.timeoutMs, DEFAULT_COMMIT_RETRY_MS);
    this.commitRetryMs = positiveInteger(commitRetryMs, derivedRetryMs);
    const derivedDeadlineMs = Math.max(
      this.commitRetryMs * 4,
      Math.min(this.timeoutMs, DEFAULT_COMMIT_DEADLINE_MS),
    );
    this.commitDeadlineMs = positiveInteger(commitDeadlineMs, derivedDeadlineMs);
    this.maxCommitRetries = positiveInteger(maxCommitRetries, DEFAULT_MAX_COMMIT_RETRIES, 0);
    this.completedRetentionMs = positiveInteger(completedRetentionMs, DEFAULT_COMPLETED_RETENTION_MS);
    this.recoveryRetentionMs = positiveInteger(recoveryRetentionMs, DEFAULT_RECOVERY_RETENTION_MS);
    this.recoveryWarningThreshold = positiveInteger(recoveryWarningThreshold, DEFAULT_RECOVERY_WARNING_THRESHOLD);
    this.maxRecoveriesPerPlayer = positiveInteger(maxRecoveriesPerPlayer, DEFAULT_MAX_RECOVERIES_PER_PLAYER);
    this.send = send;
    this.broadcastRoom = broadcastRoom;
    this.getPlayerName = getPlayerName;
    this.persistState = typeof persistState === "function" ? persistState : null;
    this.trades = new Map();
    this.recoveries = new Map();
    this.completed = new Map();
    this._restoreDurableState(durableState);
  }

  /**
   * Returns the live trade that still needs this player. A player that has
   * already committed is deliberately released while the other device is in
   * bounded recovery. Terminal recovery tombstones are not live trades.
   */
  activeFor(playerId) {
    return [...this.trades.values()].find(
      trade => trade.participants.includes(playerId) && !trade.closed && !trade.ack[playerId],
    ) ?? null;
  }

  /** True while a live trade must prevent starting another online activity. */
  blocksContent(playerId) {
    return Boolean(this.activeFor(playerId));
  }

  /**
   * Accepts a trade, trade id, or player id. Terminal recovery is intentionally
   * excluded because it must not leave normal gameplay permanently locked.
   */
  isCommitting(subject) {
    const trade = typeof subject === "object" && subject
      ? subject
      : this.trades.get(text(subject, 160)) ?? this.activeFor(subject);
    return Boolean(trade && !trade.closed && trade.state === "committing");
  }

  /** Terminal settlement retained for an unacknowledged player, if any. */
  recoveryFor(playerId) {
    return this.recoveriesFor(playerId)[0] ?? null;
  }

  recoveriesFor(playerId) {
    return [...this.recoveries.values()].filter(
      recovery => recovery.participants.includes(playerId) && !recovery.ack[playerId],
    );
  }

  /**
   * Every unresolved settlement that this player helped create, including a
   * recovery where their own receipt is already acknowledged. Counting the
   * reservation on both participants prevents one device from ACKing its side
   * and cycling partner IDs to grow terminal tombstones without bound.
   */
  recoveryReservationsFor(playerId) {
    return [...this.recoveries.values()].filter(
      recovery => recovery.participants.includes(playerId),
    );
  }

  resendRecoveries(playerId, session = null) {
    const recoveries = this.recoveriesFor(playerId);
    let sent = 0;
    for (const recovery of recoveries) {
      if (!this.credentialMatches(playerId, session, recovery.tradeId)) continue;
      if (this._sendRecovery(recovery, playerId)) sent += 1;
    }
    return sent;
  }

  recoveryStatus() {
    return { count: this.recoveries.size, warningThreshold: this.recoveryWarningThreshold, warning: this.recoveries.size >= this.recoveryWarningThreshold };
  }

  durableSnapshot() {
    const now = this.now(), settlements = [];
    for (const trade of this.trades.values()) {
      if (trade.state !== "committing") continue;
      const serialized = this._serializeSettlement(trade);
      if (serialized) settlements.push(serialized);
    }
    for (const recovery of this.recoveries.values()) {
      if ((recovery.recoveryExpiresAt ?? Infinity) <= now) continue;
      const serialized = this._serializeSettlement(recovery);
      if (serialized) settlements.push(serialized);
    }
    const completed = [...this.completed.entries()]
      .filter(([, entry]) => Number(entry?.expiresAt) > now)
      .map(([tradeId, entry]) => ({ tradeId, participants: [...entry.participants], expiresAt: entry.expiresAt }));
    return { settlements, completed };
  }

  _serializeSettlement(trade) {
    const participants = Array.isArray(trade?.participants) ? [...new Set(trade.participants.map(value => text(value, 24)).filter(Boolean))] : [];
    if (participants.length !== 2 || !participants.every(id => trade.offers?.[id])) return null;
    const credentials = {};
    for (const id of participants) {
      const credential = durableCredential(trade.credentials?.[id]);
      if (!trade.ack?.[id] && !credential) return null;
      if (credential) credentials[id] = credential;
    }
    return {
      tradeId: text(trade.tradeId, 160),
      roomId: text(trade.roomId, 24),
      participants,
      requesterId: text(trade.requesterId, 24),
      participantNames: Object.fromEntries(participants.map(id => [id, text(trade.participantNames?.[id] ?? this.getPlayerName(id), 24)])),
      offers: Object.fromEntries(participants.map(id => [id, clone(trade.offers[id])])),
      offerRequests: Object.fromEntries(participants.map(id => [id, safeOfferRequestId(trade.offerRequests?.[id])])),
      offerRevisions: Object.fromEntries(participants.map(id => [id, Math.max(0, Math.floor(Number(trade.offerRevisions?.[id]) || 0))])),
      ack: Object.fromEntries(participants.map(id => [id, Boolean(trade.ack?.[id])])),
      credentials,
      state: trade.state === "committing" ? "committing" : "recoveryPending",
      commitPhase: text(trade.commitPhase, 32) || "recovering",
      commitStartedAt: Math.max(0, Number(trade.commitStartedAt) || 0),
      commitDeadlineAt: Math.max(0, Number(trade.commitDeadlineAt) || 0),
      commitRetryCount: Math.max(0, Math.floor(Number(trade.commitRetryCount) || 0)),
      terminalReason: text(trade.terminalReason, 48),
      terminalAt: Math.max(0, Number(trade.terminalAt) || 0),
      recoveryExpiresAt: Math.max(1, Number(trade.recoveryExpiresAt) || (Number(trade.commitStartedAt) || this.now()) + this.recoveryRetentionMs),
    };
  }

  _restoreDurableState(source) {
    const now = this.now();
    for (const entry of Array.isArray(source?.completed) ? source.completed : []) {
      const tradeId = text(entry?.tradeId, 160), participants = [...new Set((Array.isArray(entry?.participants) ? entry.participants : []).map(value => text(value, 24)).filter(Boolean))], expiresAt = Number(entry?.expiresAt) || 0;
      if (tradeId && participants.length === 2 && expiresAt > now) this.completed.set(tradeId, { participants, expiresAt });
    }
    for (const entry of Array.isArray(source?.settlements) ? source.settlements : []) {
      const trade = this._restoreSettlement(entry);
      if (!trade || this.completed.has(trade.tradeId)) continue;
      if (trade.participants.every(id => trade.ack[id])) {
        this.completed.set(trade.tradeId, { participants: [...trade.participants], expiresAt: now + this.completedRetentionMs });
        continue;
      }
      if (trade.recoveryExpiresAt <= now) continue;
      this.recoveries.set(trade.tradeId, trade);
    }
  }

  _restoreSettlement(source) {
    const tradeId = text(source?.tradeId, 160), participants = [...new Set((Array.isArray(source?.participants) ? source.participants : []).map(value => text(value, 24)).filter(Boolean))];
    if (!tradeId || participants.length !== 2) return null;
    const offers = {}, credentials = {}, ack = {};
    for (const id of participants) {
      offers[id] = sanitizeTradeAsset(source?.offers?.[id], { allowLegacy: true });
      ack[id] = Boolean(source?.ack?.[id]);
      const credential = durableCredential(source?.credentials?.[id]);
      if (!offers[id] || !ack[id] && !credential) return null;
      if (credential) credentials[id] = credential;
    }
    const now = this.now(), terminalAt = Math.max(0, Number(source?.terminalAt) || now);
    return {
      tradeId,
      roomId: text(source?.roomId, 24),
      participants,
      requesterId: text(source?.requesterId, 24) || participants[0],
      participantNames: Object.fromEntries(participants.map(id => [id, text(source?.participantNames?.[id], 24)])),
      offers,
      offerRequests: Object.fromEntries(participants.map(id => [id, safeOfferRequestId(source?.offerRequests?.[id])])),
      offerRevisions: Object.fromEntries(participants.map(id => [id, Math.max(0, Math.floor(Number(source?.offerRevisions?.[id]) || 0))])),
      ready: Object.fromEntries(participants.map(id => [id, true])),
      confirmed: Object.fromEntries(participants.map(id => [id, true])),
      ack,
      completionNotified: {},
      credentials,
      state: "recoveryPending",
      commitPhase: "terminal",
      commitStartedAt: Math.max(0, Number(source?.commitStartedAt) || terminalAt),
      commitDeadlineAt: Math.max(0, Number(source?.commitDeadlineAt) || terminalAt),
      commitRetryCount: Math.max(0, Math.floor(Number(source?.commitRetryCount) || 0)),
      commitAttempts: {},
      commitErrors: {},
      terminalReason: text(source?.terminalReason, 48) || (source?.state === "committing" ? "serverRestart" : "recoveryPending"),
      terminalAt,
      recoveryExpiresAt: Math.max(terminalAt + 1, Number(source?.recoveryExpiresAt) || terminalAt + this.recoveryRetentionMs),
      closed: true,
    };
  }

  _persist() {
    if (!this.persistState) return true;
    try {
      const snapshot = this.durableSnapshot(), now = this.now();
      const expectedSettlements = [...this.trades.values()].filter(trade => trade.state === "committing").length
        + [...this.recoveries.values()].filter(recovery => Number(recovery.recoveryExpiresAt) > now).length;
      if (snapshot.settlements.length !== expectedSettlements) return false;
      return this.persistState(snapshot) !== false;
    } catch {
      return false;
    }
  }

  /**
   * IDs whose local escrow must not be treated as orphaned on reconnect.
   * Includes terminal recovery even though it no longer blocks gameplay.
   */
  protectedTradeIdsFor(playerId) {
    const ids = [];
    for (const trade of this.trades.values()) {
      if (trade.participants.includes(playerId) && !trade.ack[playerId]) ids.push(trade.tradeId);
    }
    for (const recovery of this.recoveries.values()) {
      if (recovery.participants.includes(playerId) && !recovery.ack[playerId]) ids.push(recovery.tradeId);
    }
    return [...new Set(ids)];
  }

  credentialFor(playerId) {
    for (const trade of [...this.trades.values(), ...this.recoveries.values()]) {
      if (trade.participants.includes(playerId) && !trade.ack[playerId] && trade.credentials?.[playerId]) return { ...trade.credentials[playerId] };
    }
    return null;
  }

  updateCredential(playerId, session) {
    const credential = privateCredential(session);
    if (!credential) return false;
    let updated = false, durable = false;
    for (const trade of [...this.trades.values(), ...this.recoveries.values()]) {
      if (!trade.participants.includes(playerId) || trade.ack[playerId]) continue;
      trade.credentials ??= {};
      trade.credentials[playerId] = { ...credential };
      updated = true;
      if (trade.state === "committing" || this.recoveries.has(trade.tradeId)) durable = true;
    }
    if (durable) this._persist();
    return updated;
  }

  validateCredential(playerId, { clientKey = "", resumeToken = "" } = {}, tradeId = null) {
    const id = text(tradeId, 160), subject = id ? this.trades.get(id) ?? this.recoveries.get(id) : null;
    const expected = id ? subject?.credentials?.[playerId] ?? null : this.credentialFor(playerId);
    if (!expected) return { ok: false, clientKey: false, resumeToken: false };
    const clientMatches = expected.clientKeyHash
      ? hashSettlementSecret(clientKey) === expected.clientKeyHash
      : String(clientKey ?? "") === String(expected.clientKey ?? "");
    const tokenMatches = clientMatches && credentialInputMatches(expected, { clientKey, resumeTokens: [resumeToken] });
    return { ok: Boolean(clientMatches && tokenMatches), clientKey: clientMatches, resumeToken: tokenMatches };
  }

  credentialMatches(playerId, session, tradeId = null) {
    const id = text(tradeId, 160);
    const subject = id ? this.trades.get(id) ?? this.recoveries.get(id) : null;
    // When a concrete trade was requested, never borrow credentials from an
    // unrelated protected trade. Legacy/in-memory trades without a binding
    // remain compatible, while every newly-created RoomStore trade is bound.
    const expected = id ? subject?.credentials?.[playerId] ?? null : this.credentialFor(playerId);
    if (!expected) return true;
    const actual = privateCredential(session);
    return Boolean(actual && credentialInputMatches(expected, { clientKey: actual.clientKey, resumeTokens: [actual.resumeToken, actual.previousResumeToken] }));
  }

  request(room, session, target) {
    if (!room || room.phase !== "lobby") {
      return { ok: false, code: "TRADE_PHASE", message: "交換は出発前の広場で行ってください" };
    }
    if (!target || target.playerId === session.playerId || !room.members.has(target.playerId)) {
      return { ok: false, code: "TRADE_TARGET", message: "交換相手を選択してください" };
    }
    if (!target.connected) {
      return { ok: false, code: "TRADE_OFFLINE", message: "相手がオフラインです" };
    }
    if (this._blocksNewTrade(session.playerId) || this._blocksNewTrade(target.playerId)) {
      return { ok: false, code: "TRADE_BUSY", message: "どちらかが別の交換を進めています" };
    }
    if ([session.playerId, target.playerId].some(playerId => this.recoveryReservationsFor(playerId).length >= this.maxRecoveriesPerPlayer)) {
      return { ok: false, code: "TRADE_RECOVERY_CAPACITY", message: "未完了の交換復旧が上限に達しています。相手の受取確認が完了してからお試しください" };
    }
    const createdAt = this.now();
    const trade = {
      tradeId: `trade-${token(9)}`,
      roomId: room.roomId,
      participants: [session.playerId, target.playerId],
      requesterId: session.playerId,
      participantNames: {
        [session.playerId]: text(this.getPlayerName(session.playerId), 24),
        [target.playerId]: text(this.getPlayerName(target.playerId), 24),
      },
      state: "invited",
      offers: {},
      offerRequests: {},
      offerRevisions: {},
      ready: {},
      confirmed: {},
      ack: {},
      completionNotified: {},
      credentials: {
        [session.playerId]: privateCredential(session),
        [target.playerId]: privateCredential(target),
      },
      createdAt,
      expiresAt: createdAt + this.timeoutMs,
      closed: false,
    };
    this.trades.set(trade.tradeId, trade);
    this._emit(trade);
    return { ok: true, trade: this.snapshot(trade) };
  }

  respond(session, tradeId, accepted) {
    const trade = this._find(session, tradeId);
    if (!trade) return this._missing();
    if (trade.state !== "invited" || session.playerId === trade.requesterId) {
      return { ok: false, code: "TRADE_STATE", message: "この招待には応答できません" };
    }
    if (!accepted) {
      this.cancel(session, trade.tradeId, "declined");
      return { ok: true, cancelled: true };
    }
    trade.state = "offering";
    trade.expiresAt = this.now() + this.timeoutMs;
    this._emit(trade);
    return { ok: true, trade: this.snapshot(trade) };
  }

  offer(session, tradeId, rawAsset, rawRequestId = null) {
    const suppliedRequestId = safeOfferRequestId(rawRequestId), legacyRequest = rawRequestId == null;
    const trade = this._find(session, tradeId);
    if (!trade) return { ...this._missing(), tradeId: text(tradeId,160), ...(suppliedRequestId?{requestId:suppliedRequestId}:{}) };
    const requestId = suppliedRequestId || (legacyRequest ? `legacy-${session.playerId}-${Math.max(1,Math.floor(Number(trade.offerRevisions?.[session.playerId])||0)+1)}`.slice(0,96) : "");
    const offerMeta = () => ({ tradeId: trade.tradeId, requestId: requestId || undefined, offerRequestId: trade.offerRequests?.[session.playerId] ?? "", offerRevision: Math.max(0,Math.floor(Number(trade.offerRevisions?.[session.playerId])||0)), trade: this.snapshot(trade) });
    if (!requestId) return { ok: false, code: "TRADE_REQUEST_ID", message: "交換操作IDが不正です", ...offerMeta() };
	  const asset = sanitizeTradeAsset(rawAsset);
	  if (!asset) return { ok: false, code: "TRADE_ASSET", message: "交換品データが不正です", ...offerMeta() };
	  const restriction = liveTradeAssetRestriction(asset);
	  if (restriction) return { ok: false, code: "TRADE_ASSET_RESTRICTED", message: restriction, ...offerMeta() };
    trade.offerRequests ??= {};
    trade.offerRevisions ??= {};
    const previousRequestId = trade.offerRequests[session.playerId] ?? "", previousAsset = trade.offers[session.playerId] ?? null;
    if (previousRequestId === requestId) {
      if (JSON.stringify(previousAsset) !== JSON.stringify(asset)) return { ok: false, code: "TRADE_REQUEST_REUSE", message: "同じ交換操作IDを別の品に再利用できません", ...offerMeta() };
      this._emit(trade);
      return { ok: true, duplicate: true, requestId, offerRequestId: requestId, offerRevision: trade.offerRevisions[session.playerId], trade: this.snapshot(trade) };
    }
    if (!["offering", "ready"].includes(trade.state)) {
      return { ok: false, code: "TRADE_STATE", message: "現在は提示品を変更できません", ...offerMeta() };
    }
    trade.offers[session.playerId] = asset;
    trade.offerRequests[session.playerId] = requestId;
    trade.offerRevisions[session.playerId] = Math.max(0, Math.floor(Number(trade.offerRevisions[session.playerId]) || 0)) + 1;
    trade.ready = {};
    trade.confirmed = {};
    trade.state = "offering";
    trade.expiresAt = this.now() + this.timeoutMs;
    this._emit(trade);
    return { ok: true, requestId, offerRequestId: requestId, offerRevision: trade.offerRevisions[session.playerId], trade: this.snapshot(trade) };
  }

  readyUp(session, tradeId, ready = true) {
    const trade = this._find(session, tradeId);
    if (!trade) return this._missing();
    if (!trade.offers[session.playerId]) {
      return { ok: false, code: "TRADE_NO_OFFER", message: "先に交換品を選択してください" };
    }
    trade.ready[session.playerId] = Boolean(ready);
    trade.confirmed = {};
    trade.state = trade.participants.every(id => trade.ready[id] && trade.offers[id])
      ? "confirming"
      : "offering";
    trade.expiresAt = this.now() + this.timeoutMs;
    this._emit(trade);
    return { ok: true, trade: this.snapshot(trade) };
  }

  confirm(session, tradeId) {
    const trade = this._find(session, tradeId);
    if (!trade) return this._missing();
	  if (trade.state !== "confirming" || !trade.participants.every(id => trade.ready[id] && trade.offers[id])) {
	    return { ok: false, code: "TRADE_STATE", message: "双方のセット完了を待っています" };
	  }
	  const restriction = trade.participants.map(id => trade.offers[id]).map(liveTradeAssetRestriction).find(Boolean);
	  if (restriction) {
	    this._close(trade, "restrictedAsset", session.playerId);
	    return { ok: false, code: "TRADE_ASSET_RESTRICTED", message: restriction, tradeId: trade.tradeId };
	  }
	  trade.confirmed[session.playerId] = true;
    trade.expiresAt = this.now() + this.timeoutMs;
    if (!trade.participants.every(id => trade.confirmed[id])) {
      this._emit(trade);
      return { ok: true, trade: this.snapshot(trade) };
    }
    if (!this._beginCommit(trade)) {
      trade.confirmed[session.playerId] = false;
      this._emit(trade);
      return { ok: false, code: "SETTLEMENT_PERSISTENCE", message: "交換の安全な保存に失敗しました。サーバーの保存先を確認してから再試行してください" };
    }
    return { ok: true, trade: this.snapshot(trade) };
  }

  ack(session, tradeId, success = true) {
    const id = text(tradeId, 160);
    const playerId = session?.playerId;
    const trade = this.trades.get(id);
    if (trade && !trade.closed && trade.participants.includes(playerId)) {
      if (!this.credentialMatches(playerId, session, id)) return { ok: false, code: "TRADE_CREDENTIAL_MISMATCH", message: "交換を開始した端末から受取確認してください" };
      if (trade.state !== "committing") {
        return { ok: false, code: "TRADE_STATE", message: "確定待ちではありません" };
      }
      if (!success) return this._commitFailed(trade, playerId);
      const duplicate = Boolean(trade.ack[playerId]);
      const previousCommitPhase = trade.commitPhase;
      trade.ack[playerId] = true;
      if (!trade.participants.every(id => trade.ack[id])) trade.commitPhase = "recovering";
      if (!this._persist()) {
        trade.ack[playerId] = duplicate;
        trade.commitPhase = previousCommitPhase;
        return { ok: false, code: "SETTLEMENT_PERSISTENCE", message: "交換の受取確認を安全に保存できません。再試行します", clearPending: false };
      }
      this._notifyCompleted(trade, playerId);
      if (trade.participants.every(id => trade.ack[id])) {
        this._finalizeCompleted(trade);
      } else {
        this._emit(trade);
      }
      return { ok: true, committed: true, clearPending: true, ...(duplicate ? { duplicate: true } : {}) };
    }

    const recovery = this.recoveries.get(id);
    if (recovery && recovery.participants.includes(playerId)) {
      if (!this.credentialMatches(playerId, session, id)) return { ok: false, code: "TRADE_CREDENTIAL_MISMATCH", message: "交換を開始した端末から受取確認してください" };
      const duplicate = Boolean(recovery.ack[playerId]);
      if (duplicate) {
        if (!this._persist()) return { ok: false, code: "SETTLEMENT_PERSISTENCE", message: "交換の復旧確認を安全に保存できません。再試行します", clearPending: false };
        this._notifyCompleted(recovery, playerId);
        if (recovery.participants.every(id => recovery.ack[id])) {
          this.recoveries.delete(recovery.tradeId);
          this._rememberCompleted(recovery);
          this._persist();
        }
        return { ok: true, committed: true, recovered: true, clearPending: true, duplicate: true };
      }
      if (!success) {
        this._sendRecovery(recovery, playerId);
        return { ok: true, retry: false, recoveryPending: true, clearPending: false };
      }
      recovery.ack[playerId] = true;
      if (!this._persist()) {
        recovery.ack[playerId] = false;
        return { ok: false, code: "SETTLEMENT_PERSISTENCE", message: "交換の復旧確認を安全に保存できません。再試行します", clearPending: false };
      }
      this._notifyCompleted(recovery, playerId);
      if (recovery.participants.every(id => recovery.ack[id])) {
        this.recoveries.delete(recovery.tradeId);
        this._rememberCompleted(recovery);
        this._persist();
      }
      return { ok: true, committed: true, recovered: true, clearPending: true, ...(duplicate ? { duplicate: true } : {}) };
    }

    const completed = this.completed.get(id);
    if (completed?.participants.includes(playerId)) {
      return { ok: true, committed: true, clearPending: true, duplicate: true };
    }
    return this._missing();
  }

  cancel(session, tradeId, reason = "cancelled") {
    const trade = this._find(session, tradeId);
    if (!trade) return this._missing();
    if (trade.state === "committing") {
      return { ok: false, code: "TRADE_COMMITTING", message: "交換確定処理中は取り消せません" };
    }
    this._close(trade, reason, session.playerId);
    return { ok: true, cancelled: true };
  }

  playerLeft(playerId) {
    for (const trade of this.trades.values()) {
      if (trade.participants.includes(playerId) && trade.state !== "committing") {
        this._close(trade, "disconnect", playerId);
      }
    }
  }

  pairBlocked(leftId, rightId) {
    let cancelled = 0;
    for (const trade of [...this.trades.values()]) {
      if (trade.state === "committing" || !trade.participants.includes(leftId) || !trade.participants.includes(rightId)) continue;
      this._close(trade, "unavailable"); cancelled += 1;
    }
    return cancelled;
  }

  prune() {
    const now = this.now(); let durableChanged = false;
    for (const trade of this.trades.values()) {
      if (trade.state !== "committing") {
        if (trade.expiresAt <= now) this._close(trade, "timeout");
        continue;
      }
      if (trade.commitDeadlineAt <= now) {
        this._terminalizeCommit(trade, "commitDeadline");
        continue;
      }
      if (trade.nextCommitRetryAt > now) continue;
      if (trade.commitRetryCount >= this.maxCommitRetries) {
        this._terminalizeCommit(trade, "commitRetryLimit");
        continue;
      }
      trade.commitRetryCount += 1;
      trade.nextCommitRetryAt = Math.min(trade.commitDeadlineAt, now + this.commitRetryMs);
      if (!this._persist()) continue;
      for (const playerId of trade.participants) {
        if (!trade.ack[playerId]) this._sendCommit(trade, playerId);
      }
      this._emit(trade);
    }
    for (const [tradeId, recovery] of this.recoveries) {
      if (Number(recovery.recoveryExpiresAt) > now) continue;
      this.recoveries.delete(tradeId); durableChanged = true;
    }
    for (const [tradeId, completed] of this.completed) {
      if (completed.expiresAt <= now) { this.completed.delete(tradeId); durableChanged = true; }
    }
    if (durableChanged) this._persist();
  }

  snapshot(trade) {
    const committing = trade.state === "committing";
    return {
      tradeId: trade.tradeId,
      roomId: trade.roomId,
      participants: [...trade.participants],
      requesterId: trade.requesterId,
      state: trade.state,
      offers: Object.fromEntries(trade.participants.map(id => [id, publicAsset(trade.offers[id])])),
      offerRequests: Object.fromEntries(trade.participants.map(id => [id, safeOfferRequestId(trade.offerRequests?.[id])])),
      offerRevisions: Object.fromEntries(trade.participants.map(id => [id, Math.max(0, Math.floor(Number(trade.offerRevisions?.[id]) || 0))])),
      ready: { ...trade.ready },
      confirmed: { ...trade.confirmed },
      expiresAt: committing ? trade.commitDeadlineAt : trade.expiresAt,
      ...(committing ? {
        commitPhase: trade.commitPhase,
        commitStartedAt: trade.commitStartedAt,
        commitDeadlineAt: trade.commitDeadlineAt,
        commitRetryCount: trade.commitRetryCount,
      } : {}),
    };
  }

  _blocksNewTrade(playerId) {
    return Boolean(this.activeFor(playerId));
  }

  _find(session, tradeId) {
    const trade = this.trades.get(text(tradeId, 160));
    return trade && !trade.closed && trade.participants.includes(session?.playerId) ? trade : null;
  }

  _missing() {
    return { ok: false, code: "TRADE_NOT_FOUND", message: "交換セッションが見つかりません" };
  }

  _beginCommit(trade) {
    const now = this.now();
    trade.state = "committing";
    trade.commitPhase = "delivering";
    trade.commitStartedAt = now;
    trade.commitDeadlineAt = now + this.commitDeadlineMs;
    trade.nextCommitRetryAt = Math.min(trade.commitDeadlineAt, now + this.commitRetryMs);
    trade.commitRetryCount = 0;
    trade.commitAttempts = {};
    trade.commitErrors = {};
    trade.recoveryExpiresAt = now + this.recoveryRetentionMs;
    if (!this._persist()) {
      trade.state = "confirming";
      trade.commitPhase = null;
      trade.commitStartedAt = 0;
      trade.commitDeadlineAt = 0;
      trade.nextCommitRetryAt = 0;
      trade.commitRetryCount = 0;
      trade.recoveryExpiresAt = 0;
      return false;
    }
    for (const playerId of trade.participants) this._sendCommit(trade, playerId);
    this._emit(trade);
    return true;
  }

  _sendCommit(trade, playerId) {
    if (trade.ack[playerId]) return;
    const partnerId = trade.participants.find(id => id !== playerId);
    trade.commitAttempts[playerId] = (trade.commitAttempts[playerId] ?? 0) + 1;
    if (!this._persist()) return false;
    const sent = this.send(playerId, {
      type: "tradeCommit",
      tradeId: trade.tradeId,
      incomingAsset: clone(trade.offers[partnerId]),
      partnerId,
      partnerName: text(trade.participantNames?.[partnerId] ?? this.getPlayerName(partnerId), 24),
      commitDeadlineAt: trade.commitDeadlineAt,
    }, { persist: true });
    return sent !== false;
  }

  _commitFailed(trade, playerId) {
    trade.commitErrors[playerId] = (trade.commitErrors[playerId] ?? 0) + 1;
    if (this.now() >= trade.commitDeadlineAt || trade.commitRetryCount >= this.maxCommitRetries) {
      if (!this._terminalizeCommit(trade, this.now() >= trade.commitDeadlineAt ? "commitDeadline" : "commitRetryLimit")) return { ok: false, code: "SETTLEMENT_PERSISTENCE", message: "交換の復旧状態を安全に保存できません", clearPending: false };
      return { ok: true, retry: false, recoveryPending: true, clearPending: false };
    }
    trade.commitPhase = "recovering";
    trade.nextCommitRetryAt = Math.min(trade.nextCommitRetryAt, this.now());
    if (!this._persist()) return { ok: false, code: "SETTLEMENT_PERSISTENCE", message: "交換の復旧状態を安全に保存できません", clearPending: false };
    this._emit(trade);
    return { ok: true, retry: true, clearPending: false };
  }

  _terminalizeCommit(trade, reason) {
    if (trade.closed) return true;
    trade.closed = true;
    trade.state = "recoveryPending";
    trade.commitPhase = "terminal";
    trade.terminalReason = reason;
    trade.terminalAt = this.now();
    trade.recoveryExpiresAt = Math.max(Number(trade.recoveryExpiresAt) || 0, trade.terminalAt + this.recoveryRetentionMs);
    this.trades.delete(trade.tradeId);
    const unresolved = trade.participants.filter(id => !trade.ack[id]);
    if (!unresolved.length) {
      this._rememberCompleted(trade);
      return this._persist();
    }
    this.recoveries.set(trade.tradeId, trade);
    if (!this._persist()) return false;
    for (const playerId of unresolved) this._sendRecovery(trade, playerId);
    return true;
  }

  _sendRecovery(recovery, playerId) {
    if (recovery.ack[playerId]) return;
    const partnerId = recovery.participants.find(id => id !== playerId);
    if (!this._persist()) return false;
    const sent = this.send(playerId, {
      type: "tradeRecoveryPending",
      tradeId: recovery.tradeId,
      incomingAsset: clone(recovery.offers[partnerId]),
      partnerId,
      partnerName: text(recovery.participantNames?.[partnerId] ?? this.getPlayerName(partnerId), 24),
      reason: recovery.terminalReason,
      completionSafe: true,
      terminal: true,
    }, { persist: true, replaceTrade: true });
    return sent !== false;
  }

  _notifyCompleted(trade, playerId) {
    if (trade.completionNotified[playerId]) return;
    trade.completionNotified[playerId] = true;
    this.send(playerId, { type: "tradeCompleted", tradeId: trade.tradeId, reason: "completed" });
  }

  _finalizeCompleted(trade) {
    trade.closed = true;
    this.trades.delete(trade.tradeId);
    this.recoveries.delete(trade.tradeId);
    this._rememberCompleted(trade);
    this._persist();
  }

  _rememberCompleted(trade) {
    this.completed.set(trade.tradeId, {
      participants: [...trade.participants],
      expiresAt: this.now() + this.completedRetentionMs,
    });
  }

  _emit(trade) {
    for (const id of trade.participants) {
      if (trade.state === "committing" && trade.ack[id]) continue;
      this.send(id, { type: "tradeState", trade: this.snapshot(trade) });
    }
  }

  _close(trade, reason, actorId = null) {
    if (trade.closed) return;
    trade.closed = true;
    const message = { type: "tradeCancelled", tradeId: trade.tradeId, reason, actorId };
    for (const id of trade.participants) this.send(id, message);
    this.trades.delete(trade.tradeId);
  }
}
