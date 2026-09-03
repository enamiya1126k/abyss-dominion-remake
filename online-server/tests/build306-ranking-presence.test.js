import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  PlayerPowerRanking,
  POWER_RANKING_PRESENCE_ONLINE_MS,
  verifiedMonsterPower,
} from "../src/PlayerPowerRanking.js";
import { RoomStore } from "../src/RoomStore.js";

const TARGET_ID = "AD-AAAA-2222";
const VIEWER_ID = "AD-BBBB-2222";
const BLOCKED_ID = "AD-CCCC-2222";

function battleStats(seed = 1) {
  return { hp: 1_000 + seed, atk: 120 + seed, matk: 90 + seed, def: 70 + seed, mdef: 60 + seed, spd: 40 + seed, crit: 10, evasion: 5 };
}

function snapshot(seed = 1, displayName = `冒険者${seed}`) {
  const stats = battleStats(seed), power = verifiedMonsterPower(stats);
  return {
    displayName,
    maxFloor: Math.min(100, seed + 1),
    power,
    party: [{
      slot: 1,
      speciesId: "slime",
      name: `スライム${seed}`,
      level: seed + 1,
      rarity: "SR",
      power,
      battleStats: stats,
      equipment: [],
      magicCircle: { name: "力の陣", level: 1 },
    }],
  };
}

function rankingSession(playerId) {
  return { playerId, powerRankingRates: {}, powerRankingReceipts: [] };
}

function submit(ranking, playerId, seed, requestId) {
  return ranking.submit(rankingSession(playerId), { requestId, snapshot: snapshot(seed) });
}

function resetListRate(session) {
  session.powerRankingRates = {};
  return session;
}

test("RoomStore presence is online through 90 seconds, expires after it, and disconnects immediately", () => {
  let now = 1_900_000_000_000;
  const store = new RoomStore({ now: () => now });
  const target = {
    ...rankingSession(TARGET_ID),
    connected: true,
    connection: {},
    clientKey: "target-client-key-for-presence",
    lastSeen: now - 10_000,
    roomId: null,
    profile: { displayName: "対象", monsterName: "スライム", speciesId: "slime" },
  };
  const viewer = {
    ...rankingSession(VIEWER_ID),
    connected: true,
    connection: {},
    clientKey: "viewer-client-key-for-presence",
    lastSeen: now,
    roomId: null,
    profile: { displayName: "閲覧者", monsterName: "スライム", speciesId: "slime" },
  };
  store.sessions.set(target.playerId, target);
  store.sessions.set(viewer.playerId, viewer);
  assert.equal(store.submitPowerSnapshot(target, { requestId: "presence_submit_target", snapshot: snapshot(12, "対象") }).ok, true);

  const ignoredClientTime = store.touchPowerRankingPresence(target, { lastActiveAt: now + 86_400_000 });
  assert.deepEqual(ignoredClientTime, { ok: true, lastActiveAt: now }, "the server clock, not a supplied client time, is authoritative");

  now += POWER_RANKING_PRESENCE_ONLINE_MS;
  let list = store.powerRankingList(resetListRate(viewer), { requestId: "presence_at_boundary" });
  assert.equal(list.message.entries[0].online, true, "exactly 90 seconds remains online");
  assert.equal(list.message.entries[0].lastActiveAt, now - POWER_RANKING_PRESENCE_ONLINE_MS);
  assert.equal(list.message.presenceOnlineMs, POWER_RANKING_PRESENCE_ONLINE_MS);

  now += 1;
  list = store.powerRankingList(resetListRate(viewer), { requestId: "presence_after_boundary" });
  assert.equal(list.message.entries[0].online, false, "90 seconds plus 1 ms is offline");

  now += 5_000;
  assert.equal(store.touchPowerRankingPresence(target).lastActiveAt, now);
  list = store.powerRankingList(resetListRate(viewer), { requestId: "presence_after_refresh" });
  assert.equal(list.message.entries[0].online, true);

  store.disconnect(target);
  assert.equal(target.connected, false);
  list = store.powerRankingList(resetListRate(viewer), { requestId: "presence_after_disconnect" });
  assert.equal(list.message.entries[0].online, false, "a closed authenticated session is immediately offline");
  assert.equal(list.message.entries[0].lastActiveAt, now, "disconnect keeps the last safe activity time");
  assert.equal(store.touchPowerRankingPresence(target).code, "NOT_READY");
});

test("future presence is clamped for display, rejected as online, and returned in profile consistently", () => {
  const now = 1_910_000_000_000;
  const ranking = new PlayerPowerRanking({
    now: () => now,
    presenceOf: () => ({ online: true, lastActiveAt: now + 60_000 }),
  });
  const owner = rankingSession(TARGET_ID);
  assert.equal(ranking.submit(owner, { requestId: "future_presence_submit", snapshot: snapshot(22) }).ok, true);

  const list = ranking.list(resetListRate(owner), { requestId: "future_presence_list" });
  assert.equal(list.message.self.online, false);
  assert.equal(list.message.self.lastActiveAt, now, "a future time never leaves the server response");
  const profile = ranking.profile(resetListRate(owner), { requestId: "future_presence_profile", playerId: TARGET_ID });
  assert.equal(profile.message.profile.online, false);
  assert.equal(profile.message.profile.lastActiveAt, now);
  assert.equal(profile.message.serverNow, now);
});

test("blocked ranking entries never expose their presence", () => {
  const now = 1_920_000_000_000, presenceCalls = [];
  const ranking = new PlayerPowerRanking({
    now: () => now,
    canView: (_viewerId, targetId) => targetId !== BLOCKED_ID,
    presenceOf: playerId => {
      presenceCalls.push(playerId);
      return { online: true, lastActiveAt: now };
    },
  });
  assert.equal(submit(ranking, TARGET_ID, 30, "visible_presence_submit").ok, true);
  assert.equal(submit(ranking, BLOCKED_ID, 40, "blocked_presence_submit").ok, true);

  const viewer = rankingSession(VIEWER_ID);
  const list = ranking.list(viewer, { requestId: "blocked_presence_list" });
  assert.equal(list.message.entries.some(entry => entry.playerId === BLOCKED_ID), false);
  assert.equal(list.message.entries.find(entry => entry.playerId === TARGET_ID)?.online, true);
  assert.equal(presenceCalls.includes(BLOCKED_ID), false, "presence lookup itself is skipped for blocked rows");

  presenceCalls.length = 0;
  const profile = ranking.profile(resetListRate(viewer), { requestId: "blocked_presence_profile", playerId: BLOCKED_ID });
  assert.equal(profile.code, "POWER_RANKING_PROFILE_MISSING");
  assert.deepEqual(presenceCalls, []);
});

test("legacy persisted ranking records fall back to updatedAt without becoming online", () => {
  const directory = mkdtempSync(join(tmpdir(), "abyss-build306-presence-"));
  const stateFile = join(directory, "power-rankings.json");
  const now = 1_930_000_000_000;
  try {
    const writer = new PlayerPowerRanking({ now: () => now, stateFile });
    assert.equal(submit(writer, TARGET_ID, 18, "legacy_presence_submit").ok, true);
    const saved = readFileSync(stateFile, "utf8");
    assert.equal(saved.includes("lastActiveAt"), false, "presence remains ephemeral and is absent from legacy-compatible ranking storage");
    assert.equal(saved.includes('"online"'), false);

    const restored = new PlayerPowerRanking({ now: () => now, stateFile });
    const list = restored.list(rankingSession(TARGET_ID), { requestId: "legacy_presence_list" });
    assert.equal(list.message.self.online, false);
    assert.equal(list.message.self.lastActiveAt, list.message.self.updatedAt);
    assert.equal(list.message.self.lastActiveAt, now);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("protocol 1.17 advertises and accepts the background-safe presence capability", () => {
  const server = readFileSync(new URL("../server.js", import.meta.url), "utf8");
  assert.match(server, /protocol:"1\.17\.0"/);
  assert.match(server, /message\.protocol!=="1\.17\.0"/);
  assert.match(server, /powerRankingPresenceV1:true/);
  assert.match(server, /BACKGROUND_REQUESTS=new Set\(\[[^\]]*"powerRankingPresence"/);
  assert.match(server, /message\.type==="powerRankingPresence"[^\n]*touchPowerRankingPresence\(session\)/);
});
