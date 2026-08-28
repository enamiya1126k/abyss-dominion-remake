import test from "node:test";
import assert from "node:assert/strict";
import { MAX_TRADE_PERSISTED_MESSAGE_BYTES, TradeCoordinator, sanitizeTradeAsset } from "../src/TradeCoordinator.js";

const LEFT_ID = "AD-AAAA-AAAB";
const RIGHT_ID = "AD-AAAA-AAAC";
const THIRD_ID = "AD-AAAA-AAAD";
const FOURTH_ID = "AD-AAAA-AAAE";
const FIFTH_ID = "AD-AAAA-AAAF";

function participant(playerId) {
  return { playerId, connected: true };
}

function setup(options = {}) {
  let now = 10_000;
  const sent = [];
  const coordinator = new TradeCoordinator({
    now: () => now,
    timeoutMs: 1_000,
    commitRetryMs: 100,
    commitDeadlineMs: 500,
    maxCommitRetries: 2,
    send: (playerId, message, sendOptions = {}) => sent.push({ playerId, message, options: sendOptions }),
    getPlayerName: id => id,
    ...options,
  });
  return {
    coordinator,
    sent,
    now: () => now,
    advance: milliseconds => { now += milliseconds; },
  };
}

function beginTrade(coordinator) {
  const left = participant(LEFT_ID);
  const right = participant(RIGHT_ID);
  const room = { roomId: "TRADE2", phase: "lobby", members: new Set([LEFT_ID, RIGHT_ID, THIRD_ID]) };
  const requested = coordinator.request(room, left, right);
  assert.equal(requested.ok, true);
  const tradeId = requested.trade.tradeId;
  assert.equal(coordinator.respond(right, tradeId, true).ok, true);
  assert.equal(coordinator.offer(left, tradeId, {
    assetId: "currency:gold",
    kind: "currency",
    name: "GOLD",
    payload: { key: "gold", amount: 1250 },
  }).ok, true);
  assert.equal(coordinator.offer(right, tradeId, {
    assetId: "equipment:sword",
    kind: "equipment",
    name: "星剣",
    payload: { id: "sword", slots: [{ kind: "crit", value: 12 }] },
  }).ok, true);
  assert.equal(coordinator.readyUp(left, tradeId, true).ok, true);
  assert.equal(coordinator.readyUp(right, tradeId, true).trade.state, "confirming");
  return { left, right, room, tradeId };
}

function commitTrade(coordinator, context) {
  assert.equal(coordinator.confirm(context.left, context.tradeId).ok, true);
  const result = coordinator.confirm(context.right, context.tradeId);
  assert.equal(result.ok, true);
  assert.equal(result.trade.state, "committing");
  assert.equal(result.trade.commitPhase, "delivering");
}

test("unconfirmed and offering trades still time out with normal escrow-return cancellation", () => {
  const { coordinator, sent, advance } = setup();
  const { left, right, room, tradeId } = beginTrade(coordinator);

  advance(1_001);
  coordinator.prune();

  assert.equal(coordinator.activeFor(left.playerId), null);
  assert.equal(coordinator.activeFor(right.playerId), null);
  assert.deepEqual(coordinator.protectedTradeIdsFor(left.playerId), []);
  const cancellations = sent.filter(entry => entry.message.type === "tradeCancelled" && entry.message.tradeId === tradeId);
  assert.equal(cancellations.length, 2);
  assert.equal(cancellations.every(entry => entry.message.reason === "timeout"), true);

  const next = coordinator.request(room, left, right);
  assert.equal(next.ok, true);
});

test("one successful ACK releases that player while commit recovery retries only the missing side", () => {
  const { coordinator, sent, advance } = setup();
  const context = beginTrade(coordinator);
  commitTrade(coordinator, context);

  const initialCommits = sent.filter(entry => entry.message.type === "tradeCommit");
  assert.equal(initialCommits.length, 2);
  assert.equal(initialCommits.every(entry => entry.options.persist === true), true);

  const acknowledged = coordinator.ack(context.left, context.tradeId, true);
  assert.deepEqual(acknowledged, { ok: true, committed: true, clearPending: true });
  assert.equal(coordinator.activeFor(context.left.playerId), null);
  assert.equal(coordinator.blocksContent(context.left.playerId), false);
  assert.equal(coordinator.isCommitting(context.left.playerId), false);
  assert.ok(coordinator.activeFor(context.right.playerId));
  assert.equal(coordinator.blocksContent(context.right.playerId), true);
  assert.equal(coordinator.isCommitting(context.right.playerId), true);
  assert.deepEqual(coordinator.protectedTradeIdsFor(context.left.playerId), []);
  assert.deepEqual(coordinator.protectedTradeIdsFor(context.right.playerId), [context.tradeId]);

  const third = participant(THIRD_ID);
  const nextForAcknowledged = coordinator.request(context.room, context.left, third);
  assert.equal(nextForAcknowledged.ok, true);
  coordinator.cancel(context.left, nextForAcknowledged.trade.tradeId);

  advance(100);
  coordinator.prune();
  advance(100);
  coordinator.prune();
  const leftCommits = sent.filter(entry => entry.playerId === LEFT_ID && entry.message.type === "tradeCommit");
  const rightCommits = sent.filter(entry => entry.playerId === RIGHT_ID && entry.message.type === "tradeCommit");
  assert.equal(leftCommits.length, 1);
  assert.equal(rightCommits.length, 3);
});

test("a failed live ACK schedules a bounded retry without clearing escrow", () => {
  const { coordinator, sent } = setup();
  const context = beginTrade(coordinator);
  commitTrade(coordinator, context);

  const failed = coordinator.ack(context.left, context.tradeId, false);
  assert.deepEqual(failed, { ok: true, retry: true, clearPending: false });
  assert.equal(coordinator.blocksContent(context.left.playerId), true);
  assert.deepEqual(coordinator.protectedTradeIdsFor(context.left.playerId), [context.tradeId]);

  coordinator.prune();
  assert.equal(sent.filter(entry => entry.playerId === LEFT_ID && entry.message.type === "tradeCommit").length, 2);
  assert.equal(sent.some(entry => entry.message.type === "tradeCancelled" && entry.message.tradeId === context.tradeId), false);
});

test("retry limit closes the live lock into a completion-safe terminal recovery without cancellation", () => {
  const { coordinator, sent, advance } = setup();
  const context = beginTrade(coordinator);
  commitTrade(coordinator, context);
  coordinator.ack(context.left, context.tradeId, true);

  advance(100);
  coordinator.prune();
  advance(100);
  coordinator.prune();
  advance(100);
  coordinator.prune();

  assert.equal(coordinator.activeFor(context.left.playerId), null);
  assert.equal(coordinator.activeFor(context.right.playerId), null);
  assert.equal(coordinator.blocksContent(context.right.playerId), false);
  assert.equal(coordinator.isCommitting(context.tradeId), false);
  assert.equal(coordinator.recoveryFor(context.left.playerId), null);
  assert.ok(coordinator.recoveryFor(context.right.playerId));
  assert.deepEqual(coordinator.protectedTradeIdsFor(context.right.playerId), [context.tradeId]);
  assert.equal(sent.some(entry => entry.message.type === "tradeCancelled" && entry.message.tradeId === context.tradeId), false);

  const terminal = sent.filter(entry => entry.playerId === RIGHT_ID && entry.message.type === "tradeRecoveryPending");
  assert.equal(terminal.length, 1);
  assert.equal(terminal[0].message.tradeId, context.tradeId);
  assert.equal(terminal[0].message.completionSafe, true);
  assert.equal(terminal[0].message.terminal, true);
  assert.equal(terminal[0].message.incomingAsset.kind, "currency");
  assert.deepEqual(terminal[0].message.incomingAsset.payload, { key: "gold", amount: 1250 });
  assert.deepEqual(terminal[0].options, { persist: true, replaceTrade: true });

  const nextTrade = coordinator.request(context.room, context.right, participant(THIRD_ID));
  assert.equal(nextTrade.ok, true, "terminal recovery keeps escrow protected without blocking normal play");
  coordinator.cancel(context.right, nextTrade.trade.tradeId);
});

test("commit deadline terminalizes both missing receivers and never rolls either escrow back", () => {
  const { coordinator, sent, advance } = setup({ maxCommitRetries: 99, commitDeadlineMs: 250 });
  const context = beginTrade(coordinator);
  commitTrade(coordinator, context);

  advance(251);
  coordinator.prune();

  assert.equal(coordinator.activeFor(context.left.playerId), null);
  assert.equal(coordinator.activeFor(context.right.playerId), null);
  assert.equal(coordinator.blocksContent(context.left.playerId), false);
  assert.equal(coordinator.blocksContent(context.right.playerId), false);
  assert.deepEqual(coordinator.protectedTradeIdsFor(context.left.playerId), [context.tradeId]);
  assert.deepEqual(coordinator.protectedTradeIdsFor(context.right.playerId), [context.tradeId]);
  assert.equal(sent.filter(entry => entry.message.type === "tradeRecoveryPending").length, 2);
  assert.equal(sent.some(entry => entry.message.type === "tradeCancelled" && entry.message.tradeId === context.tradeId), false);
});

test("terminal recovery accepts one late ACK exactly once and clears protected escrow id", () => {
  const { coordinator, sent, advance } = setup();
  const context = beginTrade(coordinator);
  commitTrade(coordinator, context);
  coordinator.ack(context.left, context.tradeId, true);
  advance(501);
  coordinator.prune();

  const recovered = coordinator.ack(context.right, context.tradeId, true);
  assert.deepEqual(recovered, { ok: true, committed: true, recovered: true, clearPending: true });
  assert.deepEqual(coordinator.protectedTradeIdsFor(context.right.playerId), []);
  assert.equal(coordinator.recoveryFor(context.right.playerId), null);
  assert.equal(sent.filter(entry => entry.message.type === "tradeCompleted" && entry.playerId === LEFT_ID).length, 1);
  assert.equal(sent.filter(entry => entry.message.type === "tradeCompleted" && entry.playerId === RIGHT_ID).length, 1);

  const duplicate = coordinator.ack(context.right, context.tradeId, true);
  assert.deepEqual(duplicate, { ok: true, committed: true, clearPending: true, duplicate: true });
  assert.equal(sent.filter(entry => entry.message.type === "tradeCompleted" && entry.playerId === RIGHT_ID).length, 1);
});

test("failed terminal ACK keeps the actionable recovery payload and never sends cancellation", () => {
  const { coordinator, sent, advance } = setup();
  const context = beginTrade(coordinator);
  commitTrade(coordinator, context);
  coordinator.ack(context.left, context.tradeId, true);
  advance(501);
  coordinator.prune();

  const failed = coordinator.ack(context.right, context.tradeId, false);
  assert.deepEqual(failed, { ok: true, retry: false, recoveryPending: true, clearPending: false });
  assert.ok(coordinator.recoveryFor(context.right.playerId));
  assert.equal(sent.filter(entry => entry.playerId === RIGHT_ID && entry.message.type === "tradeRecoveryPending").length, 2);
  assert.equal(sent.some(entry => entry.message.type === "tradeCancelled" && entry.message.tradeId === context.tradeId), false);
});

test("terminal recovery can be resent, does not block a new trade, and remains protected until ACK", () => {
  const { coordinator, sent, advance } = setup();
  const context = beginTrade(coordinator);
  commitTrade(coordinator, context);
  coordinator.ack(context.left, context.tradeId, true);
  advance(501);
  coordinator.prune();

  const before = sent.filter(entry => entry.playerId === RIGHT_ID && entry.message.type === "tradeRecoveryPending").length;
  assert.equal(coordinator.resendRecoveries(RIGHT_ID), 1);
  const after = sent.filter(entry => entry.playerId === RIGHT_ID && entry.message.type === "tradeRecoveryPending");
  assert.equal(after.length, before + 1);
  assert.deepEqual(after.at(-1).options, { persist: true, replaceTrade: true });
  assert.deepEqual(coordinator.protectedTradeIdsFor(RIGHT_ID), [context.tradeId]);

  const next = coordinator.request(context.room, context.right, participant(THIRD_ID));
  assert.equal(next.ok, true);
  coordinator.cancel(context.right, next.trade.tradeId);
  assert.equal(coordinator.ack(context.right, context.tradeId, true).ok, true);
  assert.deepEqual(coordinator.protectedTradeIdsFor(RIGHT_ID), []);
  assert.equal(coordinator.resendRecoveries(RIGHT_ID), 0);
});

test("terminal recovery count is reserved and bounded without deleting unresolved escrow", () => {
  const { coordinator, advance } = setup({ maxRecoveriesPerPlayer: 2, recoveryWarningThreshold: 2, maxCommitRetries: 99, commitDeadlineMs: 250 });
  const first = beginTrade(coordinator);
  commitTrade(coordinator, first);
  advance(251);
  coordinator.prune();
  const second = beginTrade(coordinator);
  commitTrade(coordinator, second);
  advance(251);
  coordinator.prune();

  assert.equal(coordinator.recoveries.size, 2);
  assert.deepEqual(new Set(coordinator.protectedTradeIdsFor(RIGHT_ID)), new Set([first.tradeId, second.tradeId]));
  const atCapacity = coordinator.request(first.room, first.left, participant(THIRD_ID));
  assert.equal(atCapacity.ok, false);
  assert.equal(atCapacity.code, "TRADE_RECOVERY_CAPACITY");
  assert.equal(coordinator.recoveries.size, 2, "capacity handling must never delete unresolved settlement");
  assert.deepEqual(coordinator.recoveryStatus(), { count: 2, warningThreshold: 2, warning: true });

  const unrelatedLeft = participant(FOURTH_ID), unrelatedRight = participant(FIFTH_ID), unrelatedRoom = { roomId: "OTHER2", phase: "lobby", members: new Set([FOURTH_ID, FIFTH_ID]) };
  const unrelated = coordinator.request(unrelatedRoom, unrelatedLeft, unrelatedRight);
  assert.equal(unrelated.ok, true, "one player's unacknowledged recoveries must not globally stop unrelated trades");
  coordinator.cancel(unrelatedLeft, unrelated.trade.tradeId);

  assert.equal(coordinator.ack(first.left, first.tradeId, true).ok, true);
  assert.equal(coordinator.ack(first.right, first.tradeId, true).ok, true);
  assert.equal(coordinator.recoveries.size, 1);
  const afterAck = coordinator.request(first.room, first.left, participant(THIRD_ID));
  assert.equal(afterAck.ok, true);
});

test("a participant cannot evade recovery capacity by ACKing only their side and cycling partner IDs", () => {
  const { coordinator, advance } = setup({ maxRecoveriesPerPlayer: 2, maxCommitRetries: 99, commitDeadlineMs: 250 });
  const left = participant(LEFT_ID);
  const terminalWith = partnerId => {
    const right = participant(partnerId);
    const room = { roomId: `CAP${partnerId.at(-1)}`, phase: "lobby", members: new Set([LEFT_ID, partnerId]) };
    const requested = coordinator.request(room, left, right);
    assert.equal(requested.ok, true);
    const tradeId = requested.trade.tradeId;
    coordinator.respond(right, tradeId, true);
    coordinator.offer(left, tradeId, { assetId: `gold:${partnerId}`, kind: "currency", name: "GOLD", payload: { key: "gold", amount: 1 } });
    coordinator.offer(right, tradeId, { assetId: `gems:${partnerId}`, kind: "currency", name: "GEMS", payload: { key: "gems", amount: 1 } });
    coordinator.readyUp(left, tradeId, true);
    coordinator.readyUp(right, tradeId, true);
    coordinator.confirm(left, tradeId);
    coordinator.confirm(right, tradeId);
    assert.equal(coordinator.ack(left, tradeId, true).ok, true);
    advance(251);
    coordinator.prune();
    return { right, room, tradeId };
  };

  const first = terminalWith(RIGHT_ID);
  terminalWith(THIRD_ID);
  assert.equal(coordinator.recoveriesFor(LEFT_ID).length, 0, "the creator already ACKed both of its own receipts");
  assert.equal(coordinator.recoveryReservationsFor(LEFT_ID).length, 2);
  const denied = coordinator.request(
    { roomId: "CAPMAX", phase: "lobby", members: new Set([LEFT_ID, FOURTH_ID]) },
    left,
    participant(FOURTH_ID),
  );
  assert.equal(denied.ok, false);
  assert.equal(denied.code, "TRADE_RECOVERY_CAPACITY");
  assert.equal(coordinator.recoveries.size, 2, "capacity must not delete or roll back either unresolved settlement");

  const unrelatedLeft = participant(FIFTH_ID), unrelatedRight = participant("AD-AAAA-AAAG");
  const unrelated = coordinator.request(
    { roomId: "CAPOK2", phase: "lobby", members: new Set([unrelatedLeft.playerId, unrelatedRight.playerId]) },
    unrelatedLeft,
    unrelatedRight,
  );
  assert.equal(unrelated.ok, true);
  coordinator.cancel(unrelatedLeft, unrelated.trade.tradeId);

  assert.equal(coordinator.ack(first.right, first.tradeId, true).ok, true);
  assert.equal(coordinator.recoveryReservationsFor(LEFT_ID).length, 1);
  const released = coordinator.request(first.room, left, first.right);
  assert.equal(released.ok, true);
});

test("terminal recovery payload and ACK stay bound to the original client key and resume-token lineage", () => {
  const { coordinator, sent, advance } = setup();
  const left = { ...participant(LEFT_ID), clientKey: "left-device-secret".padEnd(32, "x"), resumeToken: "left-resume-token" };
  const right = { ...participant(RIGHT_ID), clientKey: "right-device-secret".padEnd(32, "x"), resumeToken: "right-resume-token" };
  const room = { roomId: "SEC230", phase: "lobby", members: new Set([LEFT_ID, RIGHT_ID]) };
  const requested = coordinator.request(room, left, right);
  const tradeId = requested.trade.tradeId;
  assert.equal(coordinator.respond(right, tradeId, true).ok, true);
  assert.equal(coordinator.offer(left, tradeId, { assetId: "gold", kind: "currency", name: "GOLD", payload: { key: "gold", amount: 10 } }).ok, true);
  assert.equal(coordinator.offer(right, tradeId, { assetId: "gems", kind: "currency", name: "GEMS", payload: { key: "gems", amount: 5 } }).ok, true);
  assert.equal(coordinator.readyUp(left, tradeId, true).ok, true);
  assert.equal(coordinator.readyUp(right, tradeId, true).ok, true);
  coordinator.confirm(left, tradeId);
  coordinator.confirm(right, tradeId);
  advance(501);
  coordinator.prune();

  const before = sent.filter(entry => entry.playerId === RIGHT_ID && entry.message.type === "tradeRecoveryPending").length;
  const wrongDevice = { ...right, clientKey: "attacker-device-secret".padEnd(32, "x") };
  assert.equal(coordinator.resendRecoveries(RIGHT_ID, wrongDevice), 0);
  assert.equal(coordinator.ack(wrongDevice, tradeId, true).code, "TRADE_CREDENTIAL_MISMATCH");
  assert.equal(coordinator.resendRecoveries(RIGHT_ID, { ...right, resumeToken: "" }), 0);
  assert.equal(coordinator.ack({ ...right, resumeToken: "" }, tradeId, true).code, "TRADE_CREDENTIAL_MISMATCH");
  assert.equal(sent.filter(entry => entry.playerId === RIGHT_ID && entry.message.type === "tradeRecoveryPending").length, before);
  assert.deepEqual(coordinator.protectedTradeIdsFor(RIGHT_ID), [tradeId]);

  assert.equal(coordinator.resendRecoveries(RIGHT_ID, right), 1);
  assert.equal(coordinator.ack(right, tradeId, true).ok, true);
  assert.deepEqual(coordinator.protectedTradeIdsFor(RIGHT_ID), []);
});

test("trade payload limits use UTF-8 bytes and reserve room for the persisted settlement envelope", () => {
  const seventyKiB = "x".repeat(70 * 1024);
  const accepted = sanitizeTradeAsset({ assetId: "large", kind: "equipment", name: "large", payload: { blob: seventyKiB } });
  assert.ok(accepted);
  const envelope = { type: "tradeRecoveryPending", tradeId: "trade-boundary", incomingAsset: accepted, partnerId: RIGHT_ID, partnerName: "相手", reason: "commitDeadline", completionSafe: true, terminal: true };
  assert.ok(Buffer.byteLength(JSON.stringify(envelope), "utf8") <= MAX_TRADE_PERSISTED_MESSAGE_BYTES);
  const multibyteOverflow = sanitizeTradeAsset({ assetId: "too-large", kind: "equipment", name: "large", payload: { blob: "界".repeat(40 * 1024) } });
  assert.equal(multibyteOverflow, null, "UTF-16 character count must not bypass the byte limit");
});

test("trade transport rejects magic circles and accepts preserved monster payloads", () => {
  assert.equal(sanitizeTradeAsset({ assetId: "circle:x", kind: "circle", name: "魔法陣", payload: { id: "x" } }), null);
  const asset = sanitizeTradeAsset({
    assetId: "monster:m1",
    kind: "monster",
    name: "継承個体",
    level: 88,
    payload: { id: "m1", iv: { atk: 99 }, skills: ["alpha"], equipment: { weaponRight: null } },
  });
  assert.equal(asset.kind, "monster");
  assert.equal(asset.payload.iv.atk, 99);
  assert.deepEqual(asset.payload.skills, ["alpha"]);
});
