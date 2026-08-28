import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const JOURNAL_VERSION = 1;
const DEFAULT_MAX_BYTES = 64 * 1024 * 1024;
const DEFAULT_MAX_TRADE_RECORDS = 512;
const DEFAULT_MAX_OUTBOXES = 1024;
const FORBIDDEN_SECRET_KEYS = new Set(["clientKey", "resumeToken", "previousResumeToken"]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function positiveInteger(value, fallback) {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function containsPlaintextCredential(value, seen = new Set()) {
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) return value.some(entry => containsPlaintextCredential(entry, seen));
  for (const [key, entry] of Object.entries(value)) {
    if (FORBIDDEN_SECRET_KEYS.has(key)) return true;
    if (containsPlaintextCredential(entry, seen)) return true;
  }
  return false;
}

export function hashSettlementSecret(value) {
  const source = String(value ?? "");
  return source ? createHash("sha256").update(source).digest("hex") : "";
}

/**
 * Small atomic store for settlement state only. Room and battle state remain
 * intentionally ephemeral. Callers supply already-bounded, public-safe data;
 * this final boundary rejects credential plaintext, oversized files, and
 * unbounded top-level collections before replacing the previous snapshot.
 */
export class SettlementJournal {
  constructor({
    stateFile = null,
    now = () => Date.now(),
    maxBytes = DEFAULT_MAX_BYTES,
    maxTradeRecords = DEFAULT_MAX_TRADE_RECORDS,
    maxOutboxes = DEFAULT_MAX_OUTBOXES,
  } = {}) {
    this.stateFile = stateFile ? String(stateFile) : null;
    this.now = now;
    this.maxBytes = positiveInteger(maxBytes, DEFAULT_MAX_BYTES);
    this.maxTradeRecords = positiveInteger(maxTradeRecords, DEFAULT_MAX_TRADE_RECORDS);
    this.maxOutboxes = positiveInteger(maxOutboxes, DEFAULT_MAX_OUTBOXES);
    this.state = { version: JOURNAL_VERSION, updatedAt: 0, tradeState: { settlements: [], completed: [] }, outboxes: [] };
    this.lastPersistenceError = null;
    this.loadError = null;
    this.corruptStatePath = null;
    this.lastBytes = 0;
    this._load();
  }

  snapshot() {
    return clone(this.state);
  }

  persistenceHealthy() {
    return !this.lastPersistenceError && !this.loadError;
  }

  recordPersistenceFailure(error) {
    this.lastPersistenceError = String(error?.message || error || "settlement persistence failed").slice(0, 240);
    return false;
  }

  status() {
    const settlements = this.state.tradeState?.settlements?.length ?? 0;
    const completed = this.state.tradeState?.completed?.length ?? 0;
    return {
      healthy: this.persistenceHealthy(),
      enabled: Boolean(this.stateFile),
      settlements,
      completed,
      outboxes: this.state.outboxes?.length ?? 0,
      bytes: this.lastBytes,
      corruptRecovered: Boolean(this.corruptStatePath),
      error: this.lastPersistenceError || this.loadError ? "SETTLEMENT_PERSISTENCE_ERROR" : null,
    };
  }

  replace({ tradeState = {}, outboxes = [] } = {}) {
    const next = {
      version: JOURNAL_VERSION,
      updatedAt: Math.max(0, Math.floor(Number(this.now()) || 0)),
      tradeState: {
        settlements: Array.isArray(tradeState.settlements) ? tradeState.settlements : [],
        completed: Array.isArray(tradeState.completed) ? tradeState.completed : [],
      },
      outboxes: Array.isArray(outboxes) ? outboxes : [],
    };
    let temporary = null;
    try {
      const tradeCount = next.tradeState.settlements.length + next.tradeState.completed.length;
      if (tradeCount > this.maxTradeRecords) throw new Error("settlement trade record limit exceeded");
      if (next.outboxes.length > this.maxOutboxes) throw new Error("settlement outbox limit exceeded");
      if (containsPlaintextCredential(next)) throw new Error("settlement journal rejected plaintext credentials");
      const encoded = JSON.stringify(next);
      const bytes = Buffer.byteLength(encoded, "utf8");
      if (bytes > this.maxBytes) throw new Error("settlement journal byte limit exceeded");
      if (this.stateFile) {
        mkdirSync(dirname(this.stateFile), { recursive: true });
        temporary = `${this.stateFile}.tmp-${process.pid}-${randomBytes(4).toString("hex")}`;
        writeFileSync(temporary, encoded, { mode: 0o600, flush: true });
        renameSync(temporary, this.stateFile);
        temporary = null;
      }
      this.state = clone(next);
      this.lastBytes = bytes;
      this.lastPersistenceError = null;
      return true;
    } catch (error) {
      if (temporary) try { unlinkSync(temporary); } catch {}
      return this.recordPersistenceFailure(error);
    }
  }

  _load() {
    if (!this.stateFile) return;
    try {
      const raw = readFileSync(this.stateFile, "utf8");
      const bytes = Buffer.byteLength(raw, "utf8");
      if (bytes > this.maxBytes) throw new Error("settlement journal exceeds byte limit");
      const parsed = JSON.parse(raw);
      const settlements = parsed?.tradeState?.settlements;
      const completed = parsed?.tradeState?.completed;
      const outboxes = parsed?.outboxes;
      if (parsed?.version !== JOURNAL_VERSION || !Array.isArray(settlements) || !Array.isArray(completed) || !Array.isArray(outboxes)) throw new Error("settlement journal shape is invalid");
      if (settlements.length + completed.length > this.maxTradeRecords || outboxes.length > this.maxOutboxes) throw new Error("settlement journal collection limit exceeded");
      if (containsPlaintextCredential(parsed)) throw new Error("settlement journal contains plaintext credentials");
      this.state = clone(parsed);
      this.lastBytes = bytes;
    } catch (error) {
      if (error?.code === "ENOENT") return;
      this.loadError = String(error?.message || error || "settlement journal load failed").slice(0, 240);
      try {
        const suffix = Math.max(0, Math.floor(Number(this.now()) || Date.now()));
        this.corruptStatePath = `${this.stateFile}.corrupt-${suffix}`;
        renameSync(this.stateFile, this.corruptStatePath);
      } catch {}
      this.state = { version: JOURNAL_VERSION, updatedAt: 0, tradeState: { settlements: [], completed: [] }, outboxes: [] };
      this.lastBytes = 0;
    }
  }
}

export const SETTLEMENT_JOURNAL_LIMITS = Object.freeze({
  maxBytes: DEFAULT_MAX_BYTES,
  maxTradeRecords: DEFAULT_MAX_TRADE_RECORDS,
  maxOutboxes: DEFAULT_MAX_OUTBOXES,
});
