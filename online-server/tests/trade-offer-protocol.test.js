import test from "node:test";
import assert from "node:assert/strict";
import { TradeCoordinator, sanitizeTradeAsset } from "../src/TradeCoordinator.js";

const LEFT = "AD-OFFER-AA01";
const RIGHT = "AD-OFFER-AA02";

function participant(playerId, suffix) {
  return {
    playerId,
    connected: true,
    clientKey: `offer-client-${suffix}`.padEnd(32, suffix),
    resumeToken: `offer-resume-${suffix}`,
  };
}

function beginTrade(options = {}) {
  const sent = [];
  const left = participant(LEFT, "l");
  const right = participant(RIGHT, "r");
  const room = { roomId: "OFFER1", phase: "lobby", members: new Set([LEFT, RIGHT]) };
  const coordinator = new TradeCoordinator({
    send: (playerId, message) => sent.push({ playerId, message }),
    getPlayerName: playerId => playerId,
    ...options,
  });
  const requested = coordinator.request(room, left, right);
  assert.equal(requested.ok, true);
  const tradeId = requested.trade.tradeId;
  assert.equal(coordinator.respond(right, tradeId, true).ok, true);
  return { coordinator, left, right, sent, tradeId };
}

const currency = (key, amount) => ({ kind: "currency", payload: { key, amount } });

test("live offers reject gems and non-number amounts without advancing the revision", () => {
  const { coordinator, left, tradeId } = beginTrade();
  const legacyAlias = coordinator.offer(left, tradeId, currency("gems", 1));
  assert.equal(sanitizeTradeAsset(currency("gems", 1)), null);
  assert.equal(legacyAlias.ok, false);
  assert.equal(legacyAlias.code, "TRADE_ASSET");
  assert.equal(legacyAlias.offerRequestId, "");
  assert.equal(legacyAlias.offerRevision, 0);
  assert.equal(legacyAlias.trade.offers[LEFT], null);

  const invalid = [
    ["offer-invalid-string-01", currency("gold", "1")],
    ["offer-invalid-boolean-1", currency("gold", true)],
    ["offer-invalid-boolean-0", currency("gold", false)],
  ];

  for (const [requestId, asset] of invalid) {
    assert.equal(sanitizeTradeAsset(asset), null);
    const rejected = coordinator.offer(left, tradeId, asset, requestId);
    assert.equal(rejected.ok, false);
    assert.equal(rejected.code, "TRADE_ASSET");
    assert.equal(rejected.requestId, requestId);
    assert.equal(rejected.offerRequestId, "");
    assert.equal(rejected.offerRevision, 0);
    assert.equal(rejected.trade.offers[LEFT], null);
  }
});

test("requestId-less legacy clients receive a synthetic receipt without weakening live validation", () => {
  const { coordinator, left, tradeId } = beginTrade();
  const accepted = coordinator.offer(left, tradeId, currency("gold", 5));
  assert.equal(accepted.ok, true);
  assert.match(accepted.requestId, /^legacy-/);
  assert.equal(accepted.offerRequestId, accepted.requestId);
  assert.equal(accepted.offerRevision, 1);
  assert.equal(accepted.trade.offers[LEFT].amount, 5);

  const rejectedAlias = coordinator.offer(left, tradeId, currency("gems", 5));
  assert.equal(rejectedAlias.ok, false);
  assert.equal(rejectedAlias.code, "TRADE_ASSET");
  assert.equal(rejectedAlias.offerRevision, 1);
  assert.equal(rejectedAlias.trade.offers[LEFT].assetId, "currency:gold");
  assert.equal(rejectedAlias.trade.offers[LEFT].amount, 5);
});

test("durable legacy gems are restored as crystals while live offers stay strict", () => {
  const { coordinator, left, right, tradeId } = beginTrade();
  assert.equal(coordinator.offer(left, tradeId, currency("crystals", 9), "offer-left-durable-0001").ok, true);
  assert.equal(coordinator.offer(right, tradeId, currency("gold", 4), "offer-right-durable-001").ok, true);
  assert.equal(coordinator.readyUp(left, tradeId, true).ok, true);
  assert.equal(coordinator.readyUp(right, tradeId, true).ok, true);
  assert.equal(coordinator.confirm(left, tradeId).ok, true);
  assert.equal(coordinator.confirm(right, tradeId).ok, true);

  const durable = coordinator.durableSnapshot();
  assert.equal(durable.settlements.length, 1);
  durable.settlements[0].offers[LEFT] = {
    assetId: "currency:gems",
    kind: "currency",
    name: "GEMS",
    rarity: "R",
    level: 1,
    details: "9個",
    amount: 9,
    payload: { key: "gems", amount: 9 },
  };

  const restored = new TradeCoordinator({ durableState: durable });
  const recovery = restored.recoveries.get(tradeId);
  assert.ok(recovery);
  assert.deepEqual(recovery.offers[LEFT], {
    assetId: "currency:crystals",
    kind: "currency",
    name: "魔晶石",
    rarity: "💎",
    level: 1,
    details: "9個",
    amount: 9,
    payload: { key: "crystals", amount: 9 },
  });
  assert.equal(sanitizeTradeAsset(currency("gems", 9)), null);
});

test("offer requestId is idempotent after confirmation and cannot be reused for another asset", () => {
  const { coordinator, left, right, tradeId } = beginTrade();
  const firstRequestId = "offer-left-idempotent-01";
  const leftRequestId = "offer-left-idempotent-02";
  const leftAsset = currency("gold", 7);
  const first = coordinator.offer(left, tradeId, currency("gold", 6), firstRequestId);
  assert.equal(first.ok, true);
  assert.equal(first.requestId, firstRequestId);
  assert.equal(first.offerRequestId, firstRequestId);
  assert.equal(first.offerRevision, 1);
  assert.equal(first.trade.offerRequests[LEFT], firstRequestId);
  assert.equal(first.trade.offerRevisions[LEFT], 1);

  const changed = coordinator.offer(left, tradeId, leftAsset, leftRequestId);
  assert.equal(changed.ok, true);
  assert.equal(changed.offerRequestId, leftRequestId);
  assert.equal(changed.offerRevision, 2);
  assert.equal(coordinator.offer(right, tradeId, currency("crystals", 3), "offer-right-idempotent-1").ok, true);
  assert.equal(coordinator.readyUp(left, tradeId, true).ok, true);
  assert.equal(coordinator.readyUp(right, tradeId, true).trade.state, "confirming");
  assert.equal(coordinator.confirm(left, tradeId).ok, true);
  const confirmingSnapshot = coordinator.snapshot(coordinator.trades.get(tradeId));

  const duplicate = coordinator.offer(left, tradeId, leftAsset, leftRequestId);
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.offerRevision, 2);
  assert.equal(duplicate.trade.state, "confirming");
  assert.equal(duplicate.trade.ready[LEFT], true);
  assert.equal(duplicate.trade.ready[RIGHT], true);
  assert.equal(duplicate.trade.confirmed[LEFT], true);
  assert.deepEqual(duplicate.trade, confirmingSnapshot);

  const mismatch = coordinator.offer(left, tradeId, currency("gold", 8), leftRequestId);
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.code, "TRADE_REQUEST_REUSE");
  assert.equal(mismatch.requestId, leftRequestId);
  assert.equal(mismatch.offerRequestId, leftRequestId);
  assert.equal(mismatch.offerRevision, 2);
  assert.equal(mismatch.trade.state, "confirming");
  assert.equal(mismatch.trade.offers[LEFT].amount, 7);
  assert.equal(mismatch.trade.confirmed[LEFT], true);
  assert.deepEqual(mismatch.trade, confirmingSnapshot);

  const newRequest = coordinator.offer(left, tradeId, currency("gold", 8), "offer-left-idempotent-03");
  assert.equal(newRequest.code, "TRADE_STATE");
  assert.equal(newRequest.offerRevision, 2);
  assert.equal(newRequest.trade.offerRequests[LEFT], leftRequestId);
});
