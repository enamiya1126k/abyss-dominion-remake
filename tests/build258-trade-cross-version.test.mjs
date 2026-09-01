import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { OnlinePartyController } from "../src/online/OnlinePartyClient.js?build258-trade-cross-version";
import { reserveOnlineTradeAsset } from "../src/online/OnlineTradeSystem.js";

const TRADE_RECEIPTS = "tradeOfferReceiptsV1";

function state() {
  return {
    player: { gold: 1_000, crystals: 100 },
    inventory: { captureCrystals: 10, potions: 10 },
    monsters: [{ id: "one", name: "一体目", equipment: {} }, { id: "two", name: "二体目", equipment: {} }],
    party: [], equipment: [], reserveEquipment: [], bossEquipmentVault: [], onlineParty: {},
  };
}

function asset(amount = 3) {
  return { assetId: "stack:potions", kind: "stack", name: "薬草", rarity: "N", level: 1, details: `${amount}個`, amount, payload: { key: "potions", amount } };
}

function legacyPublicAsset(source) {
  const { payload, amount, ...publicPart } = source;
  return publicPart;
}

function snapshot(tradeId, offer, { requestId, revision } = {}) {
  return {
    tradeId,
    state: "offering",
    participants: ["self", "peer"],
    requesterId: "self",
    offers: { self: offer, peer: null },
    ready: {}, confirmed: {},
    ...(requestId === undefined ? {} : { offerRequests: { self: requestId }, offerRevisions: { self: revision ?? 0 } }),
  };
}

function harness(save, capabilities = []) {
  const notices = [];
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    selfId: "self", capabilities: new Set(capabilities), getState: () => save,
    toast: value => notices.push(String(value)), onOnlineStateMutation: () => ({ ok: true }),
    _render: () => {}, _send: () => true, route: "home", trade: null,
    tradeFilter: "all", tradeQuery: "", tradeDraftRef: "", tradeAmount: "1",
    tradePendingOffer: null, tradeOfferSequence: 0, tradeReconcileSequence: 0,
    tradeReconcilePending: false, tradeReconnectAuthoritativeIds: new Set(), tradePersistenceBlocked: false,
    tradeOfferInflight: new Map(), tradeReconcileInflight: new Map(), tradeCommitInflight: new Map(), tradeFinishInflight: new Map(),
    tradeConfirmAvailableAt: 0, tradeConfirmTimer: null,
  });
  return { controller, notices };
}

test("build258 old-server snapshots ACK a matching asset without request receipts", async () => {
  const save = state(), tradeId = "trade-old-server";
  const reserved = reserveOnlineTradeAsset(save, tradeId, "stack:potions", { amount: 3, requestId: "trade-offer-client-001" });
  assert.equal(reserved.ok, true);
  const { controller } = harness(save);
  controller.tradePendingOffer = { tradeId, requestId: "trade-offer-client-001", asset: reserved.asset, previousEntry: null, previousRevision: 0 };

  controller._applyTradeState(snapshot(tradeId, legacyPublicAsset(asset(3))));
  await controller.tradeReconcileInflight.get(tradeId);
  await new Promise(resolve => setImmediate(resolve));

  assert.equal(controller.tradePendingOffer, null);
  assert.equal(save.onlineParty.tradeEscrow[tradeId].status, "offered");
  assert.equal(save.onlineParty.tradeEscrow[tradeId].offerRequestId, "");
  assert.equal(controller._tradeAdvanceAllowed(), true);
});

test("build258 receipt-capable clients ignore unrelated snapshots and errors", async () => {
  const save = state(), tradeId = "trade-strict-server";
  const reserved = reserveOnlineTradeAsset(save, tradeId, "stack:potions", { amount: 3, requestId: "trade-offer-client-002" });
  const { controller } = harness(save, [TRADE_RECEIPTS]);
  controller.tradePendingOffer = { tradeId, requestId: "trade-offer-client-002", asset: reserved.asset, previousEntry: null, previousRevision: 0 };

  controller._applyTradeState(snapshot(tradeId, asset(3), { requestId: "trade-offer-other-999", revision: 0 }));
  assert.equal(controller.tradePendingOffer.requestId, "trade-offer-client-002");
  assert.equal(controller.tradeReconcileInflight.has(tradeId), false);
  await controller._handleTradeOfferError({ type: "error", code: "TRADE_STATE", requestId: "trade-offer-other-999", tradeId });
  assert.equal(controller.tradePendingOffer.requestId, "trade-offer-client-002");
  assert.equal(save.inventory.potions, 7);
});

test("build258 old-server TRADE errors without requestId roll back only the active pending offer", async () => {
  const save = state(), tradeId = "trade-old-error";
  const reserved = reserveOnlineTradeAsset(save, tradeId, "stack:potions", { amount: 4, requestId: "trade-offer-client-003" });
  const { controller, notices } = harness(save);
  controller.trade = snapshot(tradeId, null);
  controller.tradePendingOffer = { tradeId, requestId: "trade-offer-client-003", asset: reserved.asset, previousEntry: null, previousRevision: 0 };

  await controller._handleTradeOfferError({ type: "error", code: "TRADE_ASSET", tradeId, message: "旧サーバーで拒否" });

  assert.equal(controller.tradePendingOffer, null);
  assert.equal(save.inventory.potions, 10);
  assert.equal(save.onlineParty.tradeEscrow[tradeId], undefined);
  assert.ok(notices.includes("旧サーバーで拒否"));
});

test("build258 protocol 1.16 advertises receipts while accepting requestId-less legacy clients", async () => {
  const server = await readFile(new URL("../online-server/server.js", import.meta.url), "utf8");
  assert.match(server, /tradeOfferReceiptsV1:true/);
  assert.match(server, /message\.requestId==null\?store\.offerTrade\(session,message\.tradeId,message\.asset,null\)/);
});
