import test from "node:test";
import assert from "node:assert/strict";
import { TradeCoordinator, sanitizeTradeAsset } from "../src/TradeCoordinator.js";

const LEFT_ID = "AD-JUVN-AAAB";
const RIGHT_ID = "AD-JUVN-AAAC";

function participant(playerId) {
  return { playerId, connected: true };
}

function juvenileAsset(id = "juvenile-contract-1") {
  return {
    assetId: `monster:${id}`,
    kind: "monster",
    name: "融骸幼体アマルガ",
    rarity: "神話",
    level: 201,
    details: "+0",
    payload: { id, speciesId: "juvenile_amalga", level: 201 },
  };
}

function goldAsset(amount = 10) {
  return { kind: "currency", payload: { key: "gold", amount } };
}

function openTrade(coordinator) {
  const left = participant(LEFT_ID), right = participant(RIGHT_ID);
  const room = { roomId: "JUVN01", phase: "lobby", members: new Set([LEFT_ID, RIGHT_ID]) };
  const requested = coordinator.request(room, left, right);
  assert.equal(requested.ok, true);
  assert.equal(coordinator.respond(right, requested.trade.tradeId, true).ok, true);
  return { left, right, tradeId: requested.trade.tradeId };
}

test("build258 live server rejects a raid hatchling offer without replacing the current offer", () => {
  const coordinator = new TradeCoordinator(), context = openTrade(coordinator);
  assert.equal(coordinator.offer(context.left, context.tradeId, goldAsset(25), "juvenile-offer-0001").ok, true);
  const rejected = coordinator.offer(context.left, context.tradeId, juvenileAsset(), "juvenile-offer-0002");
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, "TRADE_ASSET_RESTRICTED");
  assert.equal(rejected.message, "レイド契約個体は個人交換できません");
  assert.equal(rejected.trade.offers[LEFT_ID].kind, "currency");
  assert.equal(coordinator.activeFor(LEFT_ID).offers[LEFT_ID].payload.amount, 25);
});

test("build258 commit boundary cancels a pre-existing restricted live offer before delivery", () => {
  const sent = [], coordinator = new TradeCoordinator({ send: (playerId, message) => sent.push({ playerId, message }) }), context = openTrade(coordinator);
  assert.equal(coordinator.offer(context.left, context.tradeId, goldAsset(10), "juvenile-commit-0001").ok, true);
  assert.equal(coordinator.offer(context.right, context.tradeId, goldAsset(20), "juvenile-commit-0002").ok, true);
  const trade = coordinator.activeFor(LEFT_ID);
  trade.offers[LEFT_ID] = sanitizeTradeAsset(juvenileAsset());
  assert.ok(trade.offers[LEFT_ID]);
  assert.equal(coordinator.readyUp(context.left, context.tradeId, true).ok, true);
  assert.equal(coordinator.readyUp(context.right, context.tradeId, true).ok, true);

  const rejected = coordinator.confirm(context.left, context.tradeId);
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, "TRADE_ASSET_RESTRICTED");
  assert.equal(coordinator.activeFor(LEFT_ID), null);
  assert.equal(sent.some(entry => entry.message.type === "tradeCommit"), false);
  assert.equal(sent.filter(entry => entry.message.type === "tradeCancelled" && entry.message.reason === "restrictedAsset").length, 2);
});

test("build258 still restores an already-durable juvenile settlement for lossless recovery", () => {
  const now = 10_000, tradeId = "trade-juvenile-durable";
  const durableState = {
    completed: [],
    settlements: [{
      tradeId,
      roomId: "JUVN01",
      participants: [LEFT_ID, RIGHT_ID],
      requesterId: LEFT_ID,
      participantNames: { [LEFT_ID]: "Left", [RIGHT_ID]: "Right" },
      offers: { [LEFT_ID]: juvenileAsset("durable-juvenile"), [RIGHT_ID]: goldAsset(50) },
      ack: { [LEFT_ID]: false, [RIGHT_ID]: true },
      credentials: { [LEFT_ID]: { clientKey: "durable-client-key-left-0001", resumeToken: "durable-resume-left-0001" } },
      state: "recoveryPending",
      terminalAt: now - 1_000,
      recoveryExpiresAt: now + 60_000,
    }],
  };
  const coordinator = new TradeCoordinator({ now: () => now, durableState });
  const recovery = coordinator.recoveryFor(LEFT_ID);
  assert.ok(recovery);
  assert.equal(recovery.tradeId, tradeId);
  assert.equal(recovery.offers[LEFT_ID].payload.speciesId, "juvenile_amalga");
  assert.equal(sanitizeTradeAsset(juvenileAsset()).payload.speciesId, "juvenile_amalga", "generic sanitizer remains compatible with durable recovery");
});
