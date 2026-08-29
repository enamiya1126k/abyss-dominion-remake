import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function identity(index) {
  const suffix = String.fromCharCode(66 + index);
  return {
    friendId: `AD-RS47-AAA${suffix}`,
    clientKey: `build247-full-reset-client-${index}`.padEnd(32, "x"),
    profile: { displayName: `Reset ${index}`, speciesId: "slime", maxFloor: 50, battleStats: { hp: 100, mp: 20, atk: 20, matk: 20, def: 10, mdef: 10, spd: 10 } },
  };
}

function hello(store, index) {
  const conn = connection(), result = store.hello(conn, identity(index));
  assert.equal(result.ok, true, result.message);
  return { conn, session: conn.session, result };
}

function progress(weekly, playerId, campaignId = `${weekly.weekId}-${weekly.boss.id}-reset`) {
  return {
    campaignId, weekId: weekly.weekId, weekStartsAt: weekly.startsAt, weekEndsAt: weekly.endsAt,
    bossId: weekly.boss.id, modifierId: weekly.modifier.id, maxHp: weekly.boss.maxHp, hp: 0,
    attempts: 3, totalDamage: weekly.boss.maxHp, milestonesClaimed: [5, 10, 25, 50, 75, 100],
    personalMilestonesClaimed: { [playerId]: [5, 15, 30] }, lastAttemptAt: weekly.startsAt + 100,
    completedAt: weekly.startsAt + 200, contribution: { [playerId]: { damage: weekly.boss.maxHp } }, ranking: [{ playerId, rank: 1 }],
  };
}

test("build247 authenticated full reset clears only the caller's current weekly raid state and is idempotent", () => {
  const now = Date.UTC(2026, 7, 29), store = new RoomStore({ now: () => now }), owner = hello(store, 0), other = hello(store, 1), weekly = store.raid.weeklyState();
  const ownerProgress = progress(weekly, owner.session.playerId), otherProgress = progress(weekly, other.session.playerId, `${weekly.weekId}-${weekly.boss.id}-other`), oldWeekId = `${weekly.weekId}-older`;
  store.raidProgressByOwner.set(owner.session.playerId, ownerProgress);
  store.raidProgressByOwner.set(other.session.playerId, otherProgress);
  owner.session.pendingRewards = [
    { rewardId: `${ownerProgress.campaignId}:milestone:25:${owner.session.playerId}`, reward: { crystals: 1 }, source: { kind: "raidMilestone" } },
    { rewardId: "current-juvenile", reward: { gold: 1 }, source: { kind: "raidJuvenile", weekId: weekly.weekId } },
    { rewardId: "old-week-rank", reward: { crystals: 2 }, source: { kind: "raid", weekId: oldWeekId } },
    { rewardId: "ordinary-chest", reward: { gold: 3 }, source: { kind: "chest" } },
  ];
  owner.session.pendingMessages = [
    { type: "raidWorldState", raidWorld: { ...ownerProgress } },
    { type: "raidWorldState", raidWorld: { weekId: oldWeekId, campaignId: "old" } },
    { type: "expeditionVitals", mutationId: "keep-vitals" },
  ];
  other.session.pendingRewards = [{ rewardId: "other-current", reward: { crystals: 9 }, source: { kind: "raid", weekId: weekly.weekId } }];

  const requestId = "full-reset-build247-owner-0001", first = store.resetWeeklyRaidForFullReset(owner.session, { requestId, targetId: other.session.playerId });
  assert.equal(first.ok, true);
  assert.equal(first.duplicate, false);
  assert.equal(store.raidProgressByOwner.has(owner.session.playerId), false);
  assert.equal(store.raidProgressByOwner.get(other.session.playerId), otherProgress, "another player's raid world is untouched");
  assert.deepEqual(owner.session.pendingRewards.map(entry => entry.rewardId), ["old-week-rank", "ordinary-chest"]);
  assert.deepEqual(owner.session.pendingMessages.map(entry => entry.type), ["raidWorldState", "expeditionVitals"]);
  assert.equal(owner.session.pendingMessages[0].raidWorld.weekId, oldWeekId, "another week is untouched");
  assert.equal(other.session.pendingRewards.length, 1, "another player's pending reward is untouched");
  assert.equal(store.friends.hasAccount(owner.session.playerId), true, "the persistent online identity is retained");

  const snapshot = JSON.stringify({ rewards: owner.session.pendingRewards, messages: owner.session.pendingMessages, other: other.session.pendingRewards });
  const duplicate = store.resetWeeklyRaidForFullReset(owner.session, { requestId });
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(JSON.stringify({ rewards: owner.session.pendingRewards, messages: owner.session.pendingMessages, other: other.session.pendingRewards }), snapshot);

  store.raidProgressByOwner.set(owner.session.playerId, { ...ownerProgress, weekId: oldWeekId, campaignId: "old-campaign" });
  const next = store.resetWeeklyRaidForFullReset(owner.session, { requestId: "full-reset-build247-owner-0002" });
  assert.equal(next.ok, true);
  assert.equal(store.raidProgressByOwner.get(owner.session.playerId).weekId, oldWeekId, "an older week is never deleted");
});

test("build247 full reset requires the authenticated caller to leave rooms and rejects target spoofing", () => {
  const store = new RoomStore(), owner = hello(store, 2), other = hello(store, 3), weekly = store.raid.weeklyState(), otherProgress = progress(weekly, other.session.playerId);
  store.raidProgressByOwner.set(other.session.playerId, otherProgress);
  assert.equal(store.createRoom(owner.session).ok, true);
  const busy = store.resetWeeklyRaidForFullReset(owner.session, { requestId: "full-reset-build247-room-0001", targetId: other.session.playerId });
  assert.equal(busy.ok, false);
  assert.equal(busy.code, "RESET_ROOM_ACTIVE");
  assert.equal(store.raidProgressByOwner.get(other.session.playerId), otherProgress);
  assert.equal(store.resetWeeklyRaidForFullReset(null, { requestId: "full-reset-build247-auth-0001" }).code, "NOT_READY");
  assert.equal(store.resetWeeklyRaidForFullReset(owner.session, { requestId: "short" }).code, "BAD_RESET_REQUEST");
});

test("build247 persistence failure rolls the raid progress and pending deliveries back for retry", () => {
  const store = new RoomStore(), owner = hello(store, 4), weekly = store.raid.weeklyState(), ownerProgress = progress(weekly, owner.session.playerId);
  const reward = { rewardId: `${ownerProgress.campaignId}:personal:15:${owner.session.playerId}`, reward: { crystals: 15 }, source: { kind: "raidPersonal", weekId: weekly.weekId } };
  const message = { type: "raidWorldState", raidWorld: { ...ownerProgress } };
  store.raidProgressByOwner.set(owner.session.playerId, ownerProgress);
  owner.session.pendingRewards = [reward]; owner.session.pendingMessages = [message];
  const originalSync = store._syncSettlementJournal.bind(store); store._syncSettlementJournal = () => false;
  const failed = store.resetWeeklyRaidForFullReset(owner.session, { requestId: "full-reset-build247-rollback-01" });
  store._syncSettlementJournal = originalSync;
  assert.equal(failed.ok, false);
  assert.equal(failed.code, "SETTLEMENT_PERSISTENCE");
  assert.equal(store.raidProgressByOwner.get(owner.session.playerId), ownerProgress);
  assert.deepEqual(owner.session.pendingRewards, [reward]);
  assert.deepEqual(owner.session.pendingMessages, [message]);
  assert.deepEqual(owner.session.weeklyRaidResetReceipts ?? [], [], "a failed request is not marked complete");
  assert.equal(store.resetWeeklyRaidForFullReset(owner.session, { requestId: "full-reset-build247-rollback-01" }).ok, true, "the same request remains safely retryable");
});

test("build247 full reset recognizes a current-week legacy raid world by its campaign id", () => {
  const store = new RoomStore(), owner = hello(store, 5), weekly = store.raid.weeklyState();
  const legacyProgress = progress(weekly, owner.session.playerId);
  delete legacyProgress.weekId;
  store.raidProgressByOwner.set(owner.session.playerId, legacyProgress);
  owner.session.pendingMessages = [{ type: "raidWorldState", raidWorld: { ...legacyProgress } }];

  const result = store.resetWeeklyRaidForFullReset(owner.session, { requestId: "full-reset-build247-legacy-0001" });
  assert.equal(result.ok, true);
  assert.equal(store.raidProgressByOwner.has(owner.session.playerId), false);
  assert.deepEqual(owner.session.pendingMessages, []);
});
