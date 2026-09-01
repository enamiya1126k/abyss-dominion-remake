import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RoomStore } from "../src/RoomStore.js";
import { SettlementJournal, hashSettlementSecret } from "../src/SettlementJournal.js";
import { TradeCoordinator } from "../src/TradeCoordinator.js";

function connection() {
  return {
    messages: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close() {},
  };
}

function identity(index) {
  return {
    friendId: `AD-JRNL-AAA${index + 2}`,
    clientKey: `journal-client-key-${index}`.padEnd(32, "x"),
    profile: { displayName: `Journal ${index}`, speciesId: "slime", maxFloor: 20 },
  };
}

function hello(store, index, resumeToken = "") {
  const conn = connection();
  const result = store.hello(conn, { ...identity(index), resumeToken });
  assert.equal(result.ok, true);
  return { conn, result, session: conn.session };
}

function beginCommittedTrade(store, left, right) {
  const created = store.createRoom(left.session);
  assert.equal(created.ok, true);
  assert.equal(store.joinRoom(right.session, created.room.roomId).ok, true);
  const requested = store.requestTrade(left.session, right.session.playerId);
  assert.equal(requested.ok, true);
  const tradeId = requested.trade.tradeId;
  assert.equal(store.respondTrade(right.session, tradeId, true).ok, true);
  assert.equal(store.offerTrade(left.session, tradeId, {
    assetId: "currency:gold:100",
    kind: "currency",
    name: "GOLD",
    payload: { key: "gold", amount: 100 },
  }).ok, true);
  assert.equal(store.offerTrade(right.session, tradeId, {
    assetId: "currency:crystals:5",
    kind: "currency",
    name: "魔晶石",
    payload: { key: "crystals", amount: 5 },
  }).ok, true);
  assert.equal(store.readyTrade(left.session, tradeId, true).ok, true);
  assert.equal(store.readyTrade(right.session, tradeId, true).ok, true);
  assert.equal(store.confirmTrade(left.session, tradeId).ok, true);
  const committed = store.confirmTrade(right.session, tradeId);
  assert.equal(committed.ok, true);
  assert.equal(committed.trade.state, "committing");
  return tradeId;
}

test("settlement journal atomically replaces bounded state and never accepts plaintext credentials", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-settlement-journal-"));
  const stateFile = join(folder, "settlements.json");
  const journal = new SettlementJournal({ stateFile, now: () => 12_345, maxTradeRecords: 2, maxOutboxes: 2, maxBytes: 32 * 1024 });
  const credential = {
    clientKeyHash: hashSettlementSecret("client-secret"),
    resumeTokenHash: hashSettlementSecret("resume-secret"),
    previousResumeTokenHash: null,
  };
  const shared = { rewardId: "reward-1", reward: { gold: 10 } };
  const state = {
    tradeState: { settlements: [], completed: [{ tradeId: "done", participants: ["a", "b"], expiresAt: 20_000 }] },
    outboxes: [{ playerId: "AD-JRNL-AAA2", credential, pendingRewards: [shared], pendingMessages: [], expiresAt: 20_000 }],
  };
  assert.equal(journal.replace(state), true);
  assert.equal(statSync(stateFile).mode & 0o777, 0o600);
  assert.deepEqual(readdirSync(folder), ["settlements.json"]);
  const encoded = readFileSync(stateFile, "utf8");
  assert.equal(encoded.includes("client-secret"), false);
  assert.equal(encoded.includes("resume-secret"), false);
  assert.equal(new SettlementJournal({ stateFile }).snapshot().tradeState.completed[0].tradeId, "done");

  const prior = readFileSync(stateFile, "utf8");
  assert.equal(journal.replace({ tradeState: state.tradeState, outboxes: [{ ...state.outboxes[0], nested: { clientKey: "plaintext" } }] }), false);
  assert.equal(readFileSync(stateFile, "utf8"), prior, "a rejected replacement must not clobber the last good snapshot");
  assert.equal(journal.persistenceHealthy(), false);

  const sharedReference = { value: 1 };
  const inMemory = new SettlementJournal();
  assert.equal(inMemory.replace({ tradeState: { settlements: [], completed: [] }, outboxes: [{ a: sharedReference, b: sharedReference }] }), true);
  assert.equal(new SettlementJournal({ maxTradeRecords: 1 }).replace({ tradeState: { settlements: [], completed: [{}, {}] }, outboxes: [] }), false);
  assert.equal(new SettlementJournal({ maxOutboxes: 1 }).replace({ tradeState: {}, outboxes: [{}, {}] }), false);
  assert.equal(new SettlementJournal({ maxBytes: 128 }).replace({ tradeState: {}, outboxes: [{ blob: "x".repeat(512) }] }), false);
});

test("corrupt settlement state is quarantined, starts empty, and exposes an unhealthy signal", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-settlement-corrupt-"));
  const stateFile = join(folder, "settlements.json");
  writeFileSync(stateFile, "{truncated", "utf8");
  const journal = new SettlementJournal({ stateFile, now: () => 98_765 });
  assert.deepEqual(journal.snapshot().tradeState, { settlements: [], completed: [] });
  assert.equal(journal.status().healthy, false);
  assert.equal(journal.status().corruptRecovered, true);
  assert.equal(existsSync(`${stateFile}.corrupt-98765`), true);
  assert.equal(existsSync(stateFile), false);
});

test("terminal recovery and completed tombstones expire at fixed bounded deadlines", () => {
  let now = 1_000, persisted = null;
  const credentials = {
    "AD-JRNL-AAA2": { clientKeyHash: hashSettlementSecret("left"), resumeTokenHash: hashSettlementSecret("left-token") },
    "AD-JRNL-AAA3": { clientKeyHash: hashSettlementSecret("right"), resumeTokenHash: hashSettlementSecret("right-token") },
  };
  const coordinator = new TradeCoordinator({
    now: () => now,
    persistState: state => { persisted = state; return true; },
    durableState: {
      settlements: [{
        tradeId: "expiring-trade",
        roomId: "ROOM39",
        participants: ["AD-JRNL-AAA2", "AD-JRNL-AAA3"],
        requesterId: "AD-JRNL-AAA2",
        participantNames: {},
        offers: {
          "AD-JRNL-AAA2": { assetId: "gold", kind: "currency", name: "GOLD", payload: { key: "gold", amount: 1 } },
          "AD-JRNL-AAA3": { assetId: "gems", kind: "currency", name: "GEMS", payload: { key: "gems", amount: 1 } },
        },
        ack: { "AD-JRNL-AAA2": true, "AD-JRNL-AAA3": false },
        credentials,
        state: "recoveryPending",
        terminalAt: now,
        recoveryExpiresAt: now + 10,
      }],
      completed: [{ tradeId: "expiring-done", participants: ["AD-JRNL-AAA2", "AD-JRNL-AAA3"], expiresAt: now + 10 }],
    },
  });
  assert.equal(coordinator.recoveries.size, 1);
  assert.equal(coordinator.completed.size, 1);
  assert.equal(coordinator.durableSnapshot().settlements[0].recoveryExpiresAt, 1_010, "serialization must not extend the fixed deadline");
  now = 1_011;
  coordinator.prune();
  assert.equal(coordinator.recoveries.size, 0);
  assert.equal(coordinator.completed.size, 0);
  assert.deepEqual(persisted, { settlements: [], completed: [] });
});

test("a failed ACK write rolls back the in-memory ACK and remains safely retryable", () => {
  let allowPersistence = true;
  const coordinator = new TradeCoordinator({ persistState: () => allowPersistence });
  const left = { playerId: "AD-JRNL-AAA2", connected: true, clientKey: "left-client-key".padEnd(32, "x"), resumeToken: "left-token" };
  const right = { playerId: "AD-JRNL-AAA3", connected: true, clientKey: "right-client-key".padEnd(32, "x"), resumeToken: "right-token" };
  const room = { roomId: "ACK239", phase: "lobby", members: new Set([left.playerId, right.playerId]) };
  const requested = coordinator.request(room, left, right), tradeId = requested.trade.tradeId;
  coordinator.respond(right, tradeId, true);
  coordinator.offer(left, tradeId, { assetId: "gold", kind: "currency", name: "GOLD", payload: { key: "gold", amount: 1 } });
  coordinator.offer(right, tradeId, { assetId: "crystals", kind: "currency", name: "魔晶石", payload: { key: "crystals", amount: 1 } });
  coordinator.readyUp(left, tradeId, true);
  coordinator.readyUp(right, tradeId, true);
  coordinator.confirm(left, tradeId);
  assert.equal(coordinator.confirm(right, tradeId).ok, true);

  allowPersistence = false;
  const failed = coordinator.ack(left, tradeId, true);
  assert.equal(failed.code, "SETTLEMENT_PERSISTENCE");
  assert.equal(coordinator.trades.get(tradeId).ack[left.playerId], false);
  assert.deepEqual(coordinator.protectedTradeIdsFor(left.playerId), [tradeId]);
  allowPersistence = true;
  assert.equal(coordinator.ack(left, tradeId, true).ok, true);
  assert.deepEqual(coordinator.protectedTradeIdsFor(left.playerId), []);
});

test("pending rewards survive RoomStore recreation, authenticate by hashes, and stop after durable ACK", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-reward-restart-"));
  const settlementStateFile = join(folder, "settlements.json");
  const friendStateFile = join(folder, "friends.json");
  let store = new RoomStore({ settlementStateFile, friendStateFile });
  const first = hello(store, 0);
  const resumeToken = first.result.resumeToken;
  assert.equal(store._queueReward(first.session, { rewardId: "durable-reward", reward: { gold: 777 }, source: { kind: "test" } }), true);
  assert.equal(first.conn.messages.some(message => message.type === "onlineReward" && message.rewardId === "durable-reward"), true);
  const onDisk = readFileSync(settlementStateFile, "utf8");
  assert.equal(onDisk.includes(identity(0).clientKey), false);
  assert.equal(onDisk.includes(resumeToken), false);

  store = new RoomStore({ settlementStateFile, friendStateFile });
  const wrong = store.hello(connection(), { ...identity(0), clientKey: "wrong-client-key".padEnd(32, "x"), resumeToken });
  assert.equal(wrong.ok, false);
  assert.equal(wrong.code, "ID_IN_USE");
  const recovered = hello(store, 0, resumeToken);
  assert.equal(recovered.result.recovered, true);
  assert.equal(store.deliverPendingRewards(recovered.session), true);
  assert.equal(recovered.conn.messages.filter(message => message.type === "onlineReward" && message.rewardId === "durable-reward").length, 1);
  assert.equal(store.ackReward(recovered.session, "durable-reward").ok, true);

  store = new RoomStore({ settlementStateFile, friendStateFile });
  const afterAck = hello(store, 0);
  assert.equal(store.deliverPendingRewards(afterAck.session), true);
  assert.equal(afterAck.conn.messages.some(message => message.rewardId === "durable-reward"), false);
  assert.equal(store.ackReward(afterAck.session, "durable-reward").ok, true, "duplicate reward ACK remains idempotent");
});

test("trade restart resends only the unacknowledged side and preserves an idempotent tombstone", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-trade-restart-"));
  const settlementStateFile = join(folder, "settlements.json");
  const friendStateFile = join(folder, "friends.json");
  let store = new RoomStore({ settlementStateFile, friendStateFile, randomRoomCode: () => "JRN239" });
  const left = hello(store, 0), right = hello(store, 1);
  const leftToken = left.result.resumeToken, rightToken = right.result.resumeToken;
  const tradeId = beginCommittedTrade(store, left, right);
  assert.equal(store.ackTrade(left.session, tradeId, true).ok, true);
  const raw = readFileSync(settlementStateFile, "utf8");
  for (const secret of [identity(0).clientKey, identity(1).clientKey, leftToken, rightToken]) assert.equal(raw.includes(secret), false);

  store = new RoomStore({ settlementStateFile, friendStateFile });
  const restartedLeft = hello(store, 0);
  assert.equal(store.deliverPendingRewards(restartedLeft.session), true);
  assert.equal(restartedLeft.conn.messages.some(message => ["tradeCommit", "tradeRecoveryPending"].includes(message.type) && message.tradeId === tradeId), false);
  const restartedRight = hello(store, 1, rightToken);
  assert.equal(store.deliverPendingRewards(restartedRight.session), true);
  assert.equal(restartedRight.conn.messages.filter(message => message.type === "tradeRecoveryPending" && message.tradeId === tradeId).length, 1);
  assert.equal(store.ackTrade(restartedRight.session, tradeId, true).ok, true);

  store = new RoomStore({ settlementStateFile, friendStateFile });
  const completed = hello(store, 1);
  assert.equal(store.deliverPendingRewards(completed.session), true);
  assert.equal(completed.conn.messages.some(message => message.tradeId === tradeId && ["tradeCommit", "tradeRecoveryPending"].includes(message.type)), false);
  const duplicate = store.ackTrade(completed.session, tradeId, true);
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.duplicate, true);
});

test("journal write failure blocks trade commit and reward delivery before network messages", () => {
  const folder = mkdtempSync(join(tmpdir(), "abyss-settlement-fail-"));
  const blocker = join(folder, "not-a-directory");
  writeFileSync(blocker, "file", "utf8");
  const store = new RoomStore({ settlementStateFile: join(blocker, "settlements.json"), randomRoomCode: () => "FAIL39" });
  const left = hello(store, 0), right = hello(store, 1);
  left.conn.messages.length = 0;
  assert.equal(store._queueReward(left.session, { rewardId: "must-not-send", reward: { gold: 1 } }), false);
  assert.equal(left.conn.messages.some(message => message.rewardId === "must-not-send"), false);

  const created = store.createRoom(left.session);
  assert.equal(created.ok, true);
  assert.equal(store.joinRoom(right.session, created.room.roomId).ok, true);
  const requested = store.requestTrade(left.session, right.session.playerId), id = requested.trade.tradeId;
  store.respondTrade(right.session, id, true);
  store.offerTrade(left.session, id, { assetId: "gold", kind: "currency", name: "GOLD", payload: { key: "gold", amount: 1 } });
  store.offerTrade(right.session, id, { assetId: "crystals", kind: "currency", name: "魔晶石", payload: { key: "crystals", amount: 1 } });
  store.readyTrade(left.session, id, true);
  store.readyTrade(right.session, id, true);
  store.confirmTrade(left.session, id);
  const failed = store.confirmTrade(right.session, id);
  assert.equal(failed.ok, false);
  assert.equal(failed.code, "SETTLEMENT_PERSISTENCE");
  assert.equal(left.conn.messages.some(message => message.type === "tradeCommit" && message.tradeId === id), false);
  assert.equal(right.conn.messages.some(message => message.type === "tradeCommit" && message.tradeId === id), false);
  assert.equal(store.settlementPersistenceHealthy(), false);
  assert.equal(store.settlementStatus().error, "SETTLEMENT_PERSISTENCE_ERROR");
});
