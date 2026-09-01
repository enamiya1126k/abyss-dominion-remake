import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PlayerPowerRanking, powerRankingSeason, verifiedMonsterPower } from "../src/PlayerPowerRanking.js";

function session(playerId) { return { playerId, powerRankingRates: {}, powerRankingReceipts: [] }; }
function snapshot(displayName, attack = 100, { maxFloor = 200, level = 100 } = {}) {
  const battleStats = { hp: 1_000, atk: attack, matk: attack, def: 100, mdef: 100, spd: 100, crit: 0, evasion: 0 };
  const power = verifiedMonsterPower(battleStats);
  return { displayName, maxFloor, power, party: [{ slot: 1, speciesId: "slime", name: displayName, level, rarity: "N", power, battleStats, equipment: [], magicCircle: { name: "魔法陣なし", level: 0 } }] };
}
function reward(deliveryId, playerId, { acknowledgedAt = null, createdAt = 1 } = {}) {
  return { deliveryId, playerId, seasonId: "2026-01-01", rank: 100, reward: { gold: 1 }, createdAt, acknowledgedAt };
}

test("known Monday JST boundary and request timestamps are exact", () => {
  const before = Date.UTC(2026, 7, 30, 14, 59, 59, 999), boundary = Date.UTC(2026, 7, 30, 15, 0, 0, 0);
  assert.equal(powerRankingSeason(before).id, "2026-08-24");
  assert.equal(powerRankingSeason(before).endsAt, boundary);
  assert.equal(powerRankingSeason(boundary).id, "2026-08-31");

  let now = before;
  const ranking = new PlayerPowerRanking({ now: () => now }), player = session("AD-ABCD-EFGH");
  assert.equal(ranking.submit(player, { requestId: "request-old1", snapshot: snapshot("OLD", 200) }).ok, true);

  // Only the first clock read may classify this request. Later reads crossing
  // midnight must not overwrite the prior-week record with a new-week time.
  const sequence = [boundary - 1, boundary + 1, boundary + 2]; let cursor = 0;
  ranking.now = () => sequence[cursor++] ?? boundary + 2;
  assert.equal(ranking.submit(player, { requestId: "request-edge", snapshot: snapshot("EDGE", 300) }).message.updatedAt, boundary - 1);
  assert.equal(ranking.rollSeason(boundary), true);
  assert.equal(ranking.pendingRewards(player.playerId).length, 1);

  // A request captured exactly at the boundary settles the old record first,
  // then stores the new record in the new season.
  now = before;
  const exact = new PlayerPowerRanking({ now: () => now }), exactPlayer = session("AD-IJKL-MNPQ");
  exact.submit(exactPlayer, { requestId: "request-old2", snapshot: snapshot("OLD2", 250) });
  now = boundary;
  const result = exact.submit(exactPlayer, { requestId: "request-new2", snapshot: snapshot("NEW2", 350) });
  assert.equal(result.ok, true);
  assert.equal(result.message.updatedAt, boundary);
  assert.equal(exact.pendingRewards(exactPlayer.playerId).length, 1);
});

test("dormant records are finalized before 30-day pruning on restart", () => {
  const directory = mkdtempSync(join(tmpdir(), "abyss-rank-262-dormant-")), stateFile = join(directory, "power-rankings.json");
  let now = Date.UTC(2026, 0, 5, 12, 0, 0), ranking = new PlayerPowerRanking({ now: () => now, stateFile }), player = session("AD-ABCD-EFGH");
  assert.equal(ranking.submit(player, { requestId: "request-dormant", snapshot: snapshot("DORMANT", 500) }).ok, true);
  now += 31 * 24 * 60 * 60_000;
  ranking = new PlayerPowerRanking({ now: () => now, stateFile });
  assert.equal(ranking.pendingRewards(player.playerId).length, 1);
  assert.equal(ranking.recordCount(), 0);
});

test("snapshot request receipts remain idempotent across restart", () => {
  const directory = mkdtempSync(join(tmpdir(), "abyss-rank-262-receipt-")), stateFile = join(directory, "power-rankings.json");
  let now = Date.UTC(2026, 7, 24, 0, 0, 0), ranking = new PlayerPowerRanking({ now: () => now, stateFile }), player = session("AD-ABCD-EFGH"), request = { requestId: "request-restart", snapshot: snapshot("FIRST", 500) };
  const first = ranking.submit(player, request);
  assert.equal(first.ok, true);
  const persisted = readFileSync(stateFile, "utf8");
  assert.equal(persisted.includes("battleStats"), false, "verified raw stats should not bloat durable public records");
  assert.equal(JSON.parse(persisted).receipts.length, 1);

  now += 60_000;
  ranking = new PlayerPowerRanking({ now: () => now, stateFile });
  const duplicate = ranking.submit(session(player.playerId), request);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.message.updatedAt, first.message.updatedAt);
  const conflict = ranking.submit(session(player.playerId), { ...request, snapshot: snapshot("CHANGED", 501) });
  assert.equal(conflict.code, "POWER_REQUEST_CONFLICT");
});

test("pending rewards survive acknowledged-history compaction and reload", () => {
  const directory = mkdtempSync(join(tmpdir(), "abyss-rank-262-pending-")), stateFile = join(directory, "power-rankings.json");
  let now = Date.UTC(2026, 7, 24, 0, 0, 0), ranking = new PlayerPowerRanking({ now: () => now, stateFile, maxAcknowledgedRewards: 2 }), player = session("AD-ABCD-EFGH");
  ranking.submit(player, { requestId: "request-finalist", snapshot: snapshot("FINALIST", 600) });
  ranking.rewards = [
    reward("old-pending", player.playerId),
    reward("ack-zero", "AD-IJKL-MNPQ", { acknowledgedAt: 0, createdAt: 2 }),
    reward("ack-two", "AD-IJKL-MNPQ", { acknowledgedAt: 2, createdAt: 3 }),
    reward("ack-three", "AD-IJKL-MNPQ", { acknowledgedAt: 3, createdAt: 4 }),
  ];
  now = powerRankingSeason(now).endsAt;
  assert.equal(ranking.rollSeason(now), true);
  assert.equal(ranking.rewards.filter(entry => entry.acknowledgedAt == null).length, 2, "old and newly finalized pending rewards must both remain");
  assert.equal(ranking.rewards.filter(entry => entry.acknowledgedAt != null).length, 2);
  assert.equal(ranking.rewards.some(entry => entry.deliveryId === "old-pending"), true);

  ranking = new PlayerPowerRanking({ now: () => now, stateFile, maxAcknowledgedRewards: 2 });
  assert.equal(ranking.rewards.some(entry => entry.deliveryId === "old-pending"), true);
  assert.equal(ranking.pendingRewards(player.playerId).length, 2);
});

test("capacity keeps stronger finalists instead of evicting the oldest", () => {
  let now = Date.UTC(2026, 7, 24, 0, 0, 0);
  const ranking = new PlayerPowerRanking({ now: () => now, maxRecords: 3 });
  for (const [playerId, attack] of [["AD-AAAA-AAAA", 900], ["AD-BBBB-BBBB", 500], ["AD-CCCC-CCCC", 300]]) {
    assert.equal(ranking.submit(session(playerId), { requestId: `request-${playerId.slice(3, 7)}`, snapshot: snapshot(playerId, attack) }).ok, true);
    now += 1;
  }
  const weak = ranking.submit(session("AD-DDDD-DDDD"), { requestId: "request-weak", snapshot: snapshot("WEAK", 100) });
  assert.equal(weak.code, "POWER_RANKING_FULL");
  assert.equal(ranking.records.has("AD-AAAA-AAAA"), true);
  assert.equal(ranking.records.has("AD-DDDD-DDDD"), false);

  now += 1;
  const strong = ranking.submit(session("AD-EEEE-EEEE"), { requestId: "request-strong", snapshot: snapshot("STRONG", 700) });
  assert.equal(strong.ok, true);
  assert.equal(ranking.records.has("AD-CCCC-CCCC"), false);
  assert.equal(ranking.records.has("AD-AAAA-AAAA"), true);
});

test("state byte limit fails closed without replacing the last durable file", () => {
  const directory = mkdtempSync(join(tmpdir(), "abyss-rank-262-bytes-")), stateFile = join(directory, "power-rankings.json"), now = Date.UTC(2026, 7, 24, 0, 0, 0);
  let ranking = new PlayerPowerRanking({ now: () => now, stateFile });
  assert.equal(ranking.submit(session("AD-ABCD-EFGH"), { requestId: "request-small", snapshot: snapshot("SMALL", 100) }).ok, true);
  const previous = readFileSync(stateFile, "utf8");
  assert.ok(Buffer.byteLength(previous, "utf8") < 1_024);

  ranking = new PlayerPowerRanking({ now: () => now, stateFile, maxStateBytes: 1_024 });
  const failed = ranking.submit(session("AD-IJKL-MNPQ"), { requestId: "request-overflow", snapshot: snapshot("日本語の長い表示名", 200) });
  assert.equal(failed.code, "POWER_RANKING_PERSISTENCE");
  assert.equal(ranking.persistenceHealthy(), false);
  assert.equal(ranking.records.has("AD-IJKL-MNPQ"), false);
  assert.equal(readFileSync(stateFile, "utf8"), previous);
});

test("plausibility validation rejects obvious forged early-game stats", () => {
  const ranking = new PlayerPowerRanking(), player = session("AD-ABCD-EFGH");
  const forgedStats = { hp: 1e12, atk: 1e12, matk: 1e12, def: 1e12, mdef: 1e12, spd: 1e12, crit: 1e12, evasion: 1e12 }, forgedPower = verifiedMonsterPower(forgedStats);
  const forged = { displayName: "FORGED", maxFloor: 1, power: forgedPower, party: [{ slot: 1, speciesId: "slime", name: "FORGED", level: 1, rarity: "N", power: forgedPower, battleStats: forgedStats, equipment: [], magicCircle: { name: "none", level: 0 } }] };
  assert.equal(ranking.submit(player, { requestId: "request-forged", snapshot: forged }).code, "POWER_STATS_IMPLAUSIBLE");
  const missingClaim = snapshot("MISSING", 100); delete missingClaim.power;
  assert.equal(ranking.submit(player, { requestId: "request-missing", snapshot: missingClaim }).code, "POWER_MISMATCH");
  assert.equal(ranking.submit(player, { requestId: "request-valid1", snapshot: snapshot("VALID", 100) }).ok, true);
});

test("server wiring schedules rollover and sends a background-safe reconnect envelope", () => {
  const roomStore = readFileSync(new URL("../src/RoomStore.js", import.meta.url), "utf8");
  const server = readFileSync(new URL("../server.js", import.meta.url), "utf8");
  assert.match(roomStore, /type:"powerRankingRewards"/);
  assert.match(roomStore, /BACKGROUND_SAFE_MESSAGES=new Set\(\[[^\]]*"powerRankingRewards"/);
  assert.match(server, /deliverPendingPowerRankingRewards/);
  assert.match(server, /schedulePowerRankingRollover/);
  assert.match(server, /rollPowerRankingSeason\(Date\.now\(\)\)/);
});
