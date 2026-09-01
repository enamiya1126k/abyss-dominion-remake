import test from "node:test";
import assert from "node:assert/strict";
import { TradeCoordinator, sanitizeTradeAsset } from "../src/TradeCoordinator.js";

const LEFT = "AD-258A-AAAA", RIGHT = "AD-258B-BBBB";
const participant = (playerId, suffix) => ({
  playerId, connected: true,
  clientKey: `build258-client-${suffix}`.padEnd(32, suffix),
  resumeToken: `build258-resume-${suffix}`,
});

test("build258 canonicalizes every supported counted asset and exposes the real quantity", () => {
  const cases = [
    ["currency", "gold", 12_345, "GOLD", "12,345G"],
    ["currency", "crystals", 44, "魔晶石", "44個"],
    ["currency", "captureCrystals", 7, "捕獲結晶", "7個"],
    ["stack", "potions", 19, "薬草", "19個"],
  ];
  for (const [kind, key, amount, name, details] of cases) {
    const asset = sanitizeTradeAsset({ assetId: "forged:id", kind, name: "偽表示", rarity: "偽", details: "999999個", payload: { key, amount, ignored: true } });
    assert.deepEqual({ assetId: asset.assetId, name: asset.name, details: asset.details, amount: asset.amount, payload: asset.payload }, { assetId: `${kind}:${key}`, name, details, amount, payload: { key, amount } });
  }
});

test("build258 rejects unknown, fractional, non-positive and unsafe quantities", () => {
  const values = [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, Infinity, NaN];
  for (const amount of values) assert.equal(sanitizeTradeAsset({ kind: "currency", payload: { key: "gold", amount } }), null);
  assert.equal(sanitizeTradeAsset({ kind: "currency", payload: { key: "unknown", amount: 1 } }), null);
  assert.equal(sanitizeTradeAsset({ kind: "stack", payload: { key: "unknown", amount: 1 } }), null);
});

test("build258 commit and durable recovery retain the exact canonical quantity", () => {
  const sent = [], left = participant(LEFT, "l"), right = participant(RIGHT, "r"), room = { roomId: "T258AA", phase: "lobby", members: new Set([LEFT, RIGHT]) };
  const coordinator = new TradeCoordinator({ send: (playerId, message) => sent.push({ playerId, message }), getPlayerName: id => id });
  const requested = coordinator.request(room, left, right), tradeId = requested.trade.tradeId;
  assert.equal(coordinator.respond(right, tradeId, true).ok, true);
  const leftOffer = coordinator.offer(left, tradeId, { kind: "currency", details: "1G", payload: { key: "gold", amount: 12_345 } });
  assert.equal(leftOffer.ok, true);
  assert.equal(leftOffer.trade.offers[LEFT].amount, 12_345);
  assert.equal(leftOffer.trade.offers[LEFT].details, "12,345G");
  assert.equal(coordinator.offer(right, tradeId, { kind: "currency", payload: { key: "crystals", amount: 44 } }).ok, true);
  coordinator.readyUp(left, tradeId, true); coordinator.readyUp(right, tradeId, true);
  coordinator.confirm(left, tradeId); coordinator.confirm(right, tradeId);
  const leftCommit = sent.find(entry => entry.playerId === LEFT && entry.message.type === "tradeCommit");
  assert.equal(leftCommit.message.incomingAsset.payload.amount, 44);
  assert.equal(leftCommit.message.incomingAsset.amount, 44);
  const durable = coordinator.durableSnapshot();
  assert.equal(durable.settlements[0].offers[LEFT].payload.amount, 12_345);

  const restoredSent = [], restored = new TradeCoordinator({ durableState: durable, send: (playerId, message) => restoredSent.push({ playerId, message }), getPlayerName: id => id });
  assert.equal(restored.resendRecoveries(LEFT, left), 1);
  const recovery = restoredSent.find(entry => entry.message.type === "tradeRecoveryPending");
  assert.equal(recovery.message.incomingAsset.payload.amount, 44);
  assert.equal(recovery.message.incomingAsset.details, "44個");
});
