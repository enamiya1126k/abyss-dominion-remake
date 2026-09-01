import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { PlayerPowerRanking, POWER_RANKING_STALE_MS, verifiedMonsterPower } from "../src/PlayerPowerRanking.js";

const stats = value => ({ hp: 1000 + value, atk: 100 + value, matk: 80 + value, def: 60 + value, mdef: 50 + value, spd: 30 + value, crit: 10, evasion: 5 });
const snapshot = (value, name = `冒険者${value}`) => {
  const battleStats = stats(value), power = verifiedMonsterPower(battleStats);
  return { displayName: name, maxFloor: Math.min(10_000, value + 1), power, party: [{ slot: 1, speciesId: "slime", name: `スライム${value}`, level: value + 1, rarity: "SR", power, battleStats, equipment: [{ slot: "weapon", name: "剣", rarity: "UR", level: value, plus: 2, visualAsset: "./assets/equipment/sword.png" }], magicCircle: { name: "力の陣", level: 3 } }] };
};
const session = (playerId, request = 0) => ({ playerId, powerRankingRates: {}, powerRankingReceipts: [], request });
const submit = (ranking, playerId, value, requestId = `request_${value}`) => ranking.submit(session(playerId), { requestId, snapshot: snapshot(value) });

test("server recomputes combat power and rejects mismatched or spoofed snapshots", () => {
  const ranking = new PlayerPowerRanking(), owner = session("AD-AAAA-2222"), source = snapshot(25);
  const accepted = ranking.submit(owner, { requestId: "request_25", snapshot: source });
  assert.equal(accepted.ok, true);
  assert.equal(accepted.message.power, verifiedMonsterPower(stats(25)));
  const mismatch = ranking.submit(owner, { requestId: "request_26", snapshot: { ...source, power: source.power + 999 } });
  assert.equal(mismatch.code, "POWER_MISMATCH");
  const memberMismatch = structuredClone(source); memberMismatch.party[0].power += 999;
  assert.equal(ranking.submit(owner, { requestId: "request_27", snapshot: memberMismatch }).code, "POWER_MISMATCH");
  assert.equal(ranking.submit(owner, { requestId: "request_28", playerId: "AD-BBBB-2222", snapshot: source }).code, "PLAYER_ID_MISMATCH");
  const missingStats = structuredClone(source); delete missingStats.party[0].battleStats;
  assert.equal(ranking.submit(owner, { requestId: "request_29", snapshot: missingStats }).code, "POWER_STATS_REQUIRED");
  const uncappedStats = { ...stats(25), crit: 240, evasion: 130 }, uncappedPower = verifiedMonsterPower(uncappedStats);
  const uncapped = { ...source, power: uncappedPower, party: [{ ...source.party[0], power: uncappedPower, battleStats: uncappedStats }] };
  assert.equal(ranking.submit(owner, { requestId: "request_30", snapshot: uncapped }).message.power, uncappedPower);
});

test("ranking returns top 100 plus self, party detail, and respects blocks", () => {
  let now = 1_800_000_000_000;
  const blockedId = "AD-ZZZY-2222", ranking = new PlayerPowerRanking({ now: () => now, canView: (_viewer, target) => target !== blockedId });
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", code = value => {
    let number = value, result = "";
    for (let index = 0; index < 4; index++) { result = alphabet[number % alphabet.length] + result; number = Math.floor(number / alphabet.length); }
    return result;
  };
  for (let index = 0; index < 102; index++) {
    const letters = code(index + 1);
    const id = index === 101 ? "AD-ZZZZ-2222" : index === 100 ? blockedId : `AD-${letters}-2222`;
    const result = ranking.submit(session(id), { requestId: `rank_${String(index).padStart(4, "0")}`, snapshot: snapshot(102 - index) });
    assert.equal(result.ok, true, `${id} must submit`);
  }
  const viewer = session("AD-ZZZZ-2222"), list = ranking.list(viewer, { requestId: "list_req_1" });
  assert.equal(list.ok, true);
  assert.equal(list.message.total, 102);
  assert.equal(list.message.entries.length, 100);
  assert.ok(list.message.entries.every((entry, index, entries) => !index || entries[index - 1].power >= entry.power));
  assert.equal(list.message.entries.some(entry => entry.playerId === blockedId), false);
  assert.equal(list.message.self.playerId, "AD-ZZZZ-2222");
  assert.ok(list.message.self.rank > 100);
  const target = list.message.entries[0], detail = ranking.profile(viewer, { requestId: "profile_req_1", playerId: target.playerId });
  assert.equal(detail.ok, true);
  assert.equal(detail.message.profile.party.length, 1);
  assert.equal(detail.message.profile.party[0].equipment[0].name, "剣");
  assert.equal("battleStats" in detail.message.profile.party[0], false);
  assert.equal(ranking.profile(viewer, { requestId: "profile_req_2", playerId: blockedId }).code, "POWER_RANKING_PROFILE_MISSING");
  now += POWER_RANKING_STALE_MS + 1;
  const expired = ranking.list(viewer, { requestId: "list_req_2" });
  assert.equal(expired.message.total, 0);
  assert.equal(expired.message.self, null);
});

test("request receipts are idempotent, requests are bounded, and asset URLs are constrained", () => {
  const ranking = new PlayerPowerRanking(), owner = session("AD-CCCC-2222"), source = snapshot(30);
  source.party[0].customVisualAsset = "javascript:alert(1)";
  source.party[0].customVisualBase = "./assets/online/weekly-raid/juvenile";
  source.party[0].equipment[0].visualAsset = "https://evil.example/item.png";
  const first = ranking.submit(owner, { requestId: "stable_req", snapshot: source });
  assert.equal(first.ok, true);
  const duplicate = ranking.submit(owner, { requestId: "stable_req", snapshot: source });
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.duplicate, true);
  const changed = structuredClone(source); changed.displayName = "別の内容";
  assert.equal(ranking.submit(owner, { requestId: "stable_req", snapshot: changed }).code, "POWER_REQUEST_CONFLICT");
  const detail = ranking.profile(owner, { requestId: "profile_req", playerId: owner.playerId });
  assert.equal(detail.message.profile.party[0].customVisualAsset, null);
  assert.equal(detail.message.profile.party[0].customVisualBase, "./assets/online/weekly-raid/juvenile");
  assert.equal(detail.message.profile.party[0].equipment[0].visualAsset, null);
  assert.equal(ranking.submit(owner, { requestId: "large_req", snapshot: source, padding: "x".repeat(70_000) }).code, "POWER_SNAPSHOT_TOO_LARGE");
  const tooMany = structuredClone(source); tooMany.party = Array.from({ length: 5 }, () => structuredClone(source.party[0]));
  assert.equal(ranking.submit(owner, { requestId: "party_limit", snapshot: tooMany }).code, "POWER_PARTY_TOO_LARGE");
  const unsafeBase = structuredClone(source); unsafeBase.party[0].customVisualBase = "./assets/%2e%2e/private";
  assert.equal(ranking.submit(owner, { requestId: "unsafe_base", snapshot: unsafeBase }).ok, true);
  assert.equal(ranking.profile(owner, { requestId: "profile_unsafe", playerId: owner.playerId }).message.profile.party[0].customVisualBase, null);
});

test("serial-limited SECRET rarity remains visible in the public party", () => {
  const ranking = new PlayerPowerRanking(), owner = session("AD-SECR-2222"), source = snapshot(13);
  source.party[0].rarity = "SECRET";
  assert.equal(ranking.submit(owner, { requestId: "secret_rarity", snapshot: source }).ok, true);
  const detail = ranking.profile(owner, { requestId: "secret_profile", playerId: owner.playerId });
  assert.equal(detail.message.profile.party[0].rarity, "SECRET");
});

test("ranking state is atomically persisted and restored without private credentials", () => {
  const directory = mkdtempSync(join(tmpdir(), "abyss-power-ranking-")), stateFile = join(directory, "power-rankings.json");
  try {
    let now = 1_800_000_000_000;
    const first = new PlayerPowerRanking({ now: () => now, stateFile });
    assert.equal(submit(first, "AD-DDDD-2222", 42, "persist_42").ok, true);
    const raw = readFileSync(stateFile, "utf8");
    assert.equal(raw.includes("clientKey"), false);
    assert.equal(raw.includes("resumeToken"), false);
    const restored = new PlayerPowerRanking({ now: () => now, stateFile });
    const result = restored.list(session("AD-DDDD-2222"), { requestId: "restore_1" });
    assert.equal(result.message.total, 1);
    assert.equal(result.message.self.playerId, "AD-DDDD-2222");
    now += POWER_RANKING_STALE_MS + 1;
    restored.prune();
    assert.equal(new PlayerPowerRanking({ now: () => now, stateFile }).recordCount(), 0);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
