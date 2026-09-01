import test from "node:test";
import assert from "node:assert/strict";
import { OnlinePartyController } from "../src/online/OnlinePartyClient.js?build258-trade-save-transaction";
import {
  ONLINE_TRADE_STACKS,
  reserveOnlineTradeAsset,
} from "../src/online/OnlineTradeSystem.js";

const EXPECTED_STACK_KEYS = [
  "abyssKeys",
  "experienceItems",
  "experienceItemsLarge",
  "experienceItemsMedium",
  "experienceItemsUltra",
  "fullHeals",
  "fullManaPotions",
  "highManaPotions",
  "highPotions",
  "manaPotions",
  "partyFullHeals",
  "partyFullManaPotions",
  "partyManaPotions",
  "partyPotions",
  "partyStatusCures",
  "potions",
  "reviveLeaves",
  "statusCures",
];

const copy = value => structuredClone(value);

function deferred() {
  let resolve;
  const promise = new Promise(next => { resolve = next; });
  return { promise, resolve };
}

function state({ inventory = {}, onlineParty = {} } = {}) {
  return {
    player: { gold: 10_000, crystals: 448 },
    inventory: { captureCrystals: 11, potions: 20, highPotions: 8, ...inventory },
    monsters: [
      { id: "one", name: "一体目", equipment: {} },
      { id: "two", name: "二体目", equipment: {} },
    ],
    party: [],
    equipment: [],
    reserveEquipment: [],
    bossEquipmentVault: [],
    onlineParty: {
      claimedRewards: [],
      tradeEscrow: {},
      tradeEscrowQuarantine: [],
      completedTradeIds: [],
      tradeHistory: [],
      raidMaterials: 0,
      raidWins: 0,
      raidExchange: {},
      ...onlineParty,
    },
  };
}

function trade(tradeId) {
  return {
    tradeId,
    participants: ["self", "peer"],
    offers: {},
    offerRequests: {},
    offerRevisions: {},
  };
}

function incomingStack(key = "highPotions", amount = 2) {
  return {
    assetId: `stack:${key}`,
    kind: "stack",
    name: ONLINE_TRADE_STACKS[key][0],
    rarity: ONLINE_TRADE_STACKS[key][1],
    level: 1,
    details: `${amount}個`,
    amount,
    payload: { key, amount },
  };
}

function clientHarness(save, { persist = () => ({ ok: true }), send = () => true } = {}) {
  const sent = [], mutations = [], notices = [], order = [];
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    selfId: "self",
    getState: () => save,
    toast: message => notices.push(String(message)),
    onOnlineStateMutation: event => {
      mutations.push(event);
      order.push(`persist:${event.kind}`);
      return persist(event);
    },
    _send: (type, payload = {}) => {
      const message = { type, ...payload };
      sent.push(message);
      order.push(`send:${type}:${String(payload.success ?? "")}`);
      return send(type, payload);
    },
    _render: () => {},
    _renderTradeRecoveryStatus: () => {},
    trade: null,
    tradeFilter: "all",
    tradeQuery: "",
    tradeDraftRef: "",
    tradeAmount: "1",
    tradeConfirmAvailableAt: 0,
    tradeConfirmTimer: null,
    tradePendingOffer: null,
    tradeOfferSequence: 0,
    tradeReconcileSequence: 0,
    tradeReconcilePending: false,
    tradePersistenceBlocked: false,
    tradeOfferInflight: new Map(),
    tradeReconcileInflight: new Map(),
    tradeCommitInflight: new Map(),
    tradeFinishInflight: new Map(),
    terminalTradeRecoveries: new Set(),
    tradeRecoveryStatus: null,
    tradeRecoveryTimer: null,
  });
  return { controller, sent, mutations, notices, order };
}

test("build258 reserve is rolled back and never offered when its save fails", async () => {
  const save = state(), before = copy(save), gate = deferred();
  const harness = clientHarness(save, { persist: () => gate.promise });
  harness.controller.trade = trade("trade-reserve-failure");
  harness.controller.tradeAmount = "3";

  const offering = harness.controller._offerTradeAsset("stack:potions");
  assert.equal(save.inventory.potions, 17, "the tentative reservation is visible while persistence is pending");
  assert.equal(harness.controller.tradePendingOffer?.status, "saving");
  assert.deepEqual(harness.sent, [], "tradeOffer must wait for durable persistence");

  gate.resolve({ ok: false, message: "reserve-save-failed" });
  await offering;

  assert.deepEqual(save, before, "a failed save restores inventory and escrow exactly");
  assert.equal(harness.controller.tradePendingOffer, null);
  assert.equal(harness.controller.tradePersistenceBlocked, true);
  assert.deepEqual(harness.sent, []);
  assert.deepEqual(harness.mutations.map(event => event.kind), ["tradeReserve"]);
  assert.ok(harness.notices.includes("reserve-save-failed"));
});

test("build258 commit sends only a negative ACK after a failed durable save", async () => {
  const save = state();
  assert.equal(reserveOnlineTradeAsset(save, "trade-commit-failure", "stack:potions", { amount: 4 }).ok, true);
  const beforeCommit = copy(save), gate = deferred();
  const harness = clientHarness(save, { persist: () => gate.promise });

  const committing = harness.controller._commitTrade({
    tradeId: "trade-commit-failure",
    incomingAsset: incomingStack(),
    partnerId: "peer",
    partnerName: "相手",
  });
  assert.deepEqual(harness.sent, [], "ACK must not precede persistence");
  assert.equal(save.onlineParty.completedTradeIds.includes("trade-commit-failure"), true);

  gate.resolve({ ok: false, message: "commit-save-failed" });
  await committing;

  assert.deepEqual(save, beforeCommit, "the outgoing escrow and incoming inventory are restored");
  assert.deepEqual(harness.sent, [{ type: "tradeAck", tradeId: "trade-commit-failure", success: false }]);
  assert.deepEqual(harness.order, ["persist:tradeCommit", "send:tradeAck:false"]);
  assert.equal(harness.notices.some(message => message.includes("受け取りました")), false);
});

test("build258 release waits for persistence and rolls back without a cancellation success notice", async () => {
  const save = state();
  assert.equal(reserveOnlineTradeAsset(save, "trade-release-failure", "currency:gold", { amount: 750 }).ok, true);
  const beforeRelease = copy(save), gate = deferred();
  const harness = clientHarness(save, { persist: () => gate.promise });
  harness.controller.trade = trade("trade-release-failure");

  const finishing = harness.controller._finishTrade("trade-release-failure", { cancelled: true, reason: "declined" });
  assert.equal(save.onlineParty.tradeEscrow["trade-release-failure"], undefined);
  assert.equal(harness.notices.length, 0, "completion UI must wait for persistence");

  gate.resolve({ ok: false, message: "release-save-failed" });
  await finishing;

  assert.deepEqual(save, beforeRelease, "the release is undone when saving it fails");
  assert.deepEqual(harness.mutations.map(event => event.kind), ["tradeRelease"]);
  assert.deepEqual(harness.sent, []);
  assert.ok(harness.notices.includes("release-save-failed"));
  assert.equal(harness.notices.includes("交換は辞退されました"), false);
});

test("build258 a deferred duplicate commit shares one save and cannot ACK success early", async () => {
  const save = state();
  assert.equal(reserveOnlineTradeAsset(save, "trade-duplicate", "stack:potions", { amount: 5 }).ok, true);
  const beforeCommit = copy(save), gate = deferred();
  const harness = clientHarness(save, { persist: () => gate.promise });
  const message = {
    tradeId: "trade-duplicate",
    incomingAsset: incomingStack("highPotions", 3),
    partnerId: "peer",
    partnerName: "相手",
  };

  const first = harness.controller._commitTrade(message);
  const duplicate = harness.controller._commitTrade(message);
  const sentBeforeSaveSettled = copy(harness.sent);

  gate.resolve({ ok: false, message: "duplicate-commit-save-failed" });
  await Promise.all([first, duplicate]);

  assert.deepEqual(sentBeforeSaveSettled, [], "a duplicate arriving during save must not observe the tentative completed ID");
  assert.deepEqual(harness.mutations.map(event => event.kind), ["tradeCommit"], "both messages share one persistence transaction");
  assert.deepEqual(harness.sent, [{ type: "tradeAck", tradeId: "trade-duplicate", success: false }]);
  assert.equal(harness.sent.some(message => message.success === true), false);
  assert.deepEqual(save, beforeCommit);
});

test("build258 send-failure does not claim rollback success when the compensating save fails", async () => {
  const save = state(), outcomes = [
    { ok: true },
    { ok: false, message: "rollback-save-failed" },
  ];
  const harness = clientHarness(save, {
    persist: () => outcomes.shift(),
    send: type => type !== "tradeOffer",
  });
  harness.controller.trade = trade("trade-send-failure");
  harness.controller.tradeAmount = "3";

  await harness.controller._offerTradeAsset("stack:potions");

  assert.deepEqual(harness.mutations.map(event => event.kind), ["tradeReserve", "tradeRollback"]);
  assert.equal(save.inventory.potions, 17, "failed compensating persistence restores the already-saved reservation");
  assert.equal(save.onlineParty.tradeEscrow["trade-send-failure"].asset.payload.amount, 3);
  assert.equal(harness.controller.tradePendingOffer?.tradeId, "trade-send-failure");
  assert.equal(harness.controller.tradePersistenceBlocked, true);
  assert.ok(harness.notices.includes("rollback-save-failed"));
  assert.equal(harness.notices.includes("接続が切れたため交換品を元の状態へ戻しました"), false);
});

test("build258 stale active IDs recover valid escrow and quarantine malformed escrow only after save", async () => {
  const save = state(), gate = deferred();
  assert.equal(reserveOnlineTradeAsset(save, "trade-active", "currency:gold", { amount: 300 }).ok, true);
  assert.equal(reserveOnlineTradeAsset(save, "trade-stale-valid", "stack:potions", { amount: 6 }).ok, true);
  save.onlineParty.tradeEscrow["trade-stale-malformed"] = {
    asset: {
      assetId: "stack:removedItem",
      kind: "stack",
      name: "旧アイテム",
      rarity: "N",
      details: "2個",
      amount: 2,
      payload: { key: "removedItem", amount: 2 },
    },
    reservedAt: 1,
    status: "reserved",
  };
  const harness = clientHarness(save, { persist: () => gate.promise });
  harness.controller.trade = trade("trade-stale-valid");
  harness.controller.tradePendingOffer = { tradeId: "trade-stale-valid", requestId: "trade-offer-stale-001", asset: copy(save.onlineParty.tradeEscrow["trade-stale-valid"].asset) };

  const recovering = harness.controller._recoverOrphanedTradeEscrows(["trade-active"]);
  assert.equal(save.onlineParty.tradeEscrow["trade-active"].asset.payload.amount, 300);
  assert.equal(save.onlineParty.tradeEscrow["trade-stale-valid"], undefined);
  assert.equal(save.onlineParty.tradeEscrow["trade-stale-malformed"], undefined);
  assert.equal(save.inventory.potions, 20);
  assert.equal(save.onlineParty.tradeEscrowQuarantine.length, 1);
  assert.deepEqual(harness.notices, [], "recovery UI waits for its save");

  gate.resolve({ ok: true });
  assert.equal(await recovering, true);

  assert.deepEqual(harness.mutations.map(event => ({
    kind: event.kind,
    assets: event.assets.map(asset => asset.payload.key),
    quarantined: event.quarantined,
  })), [{ kind: "tradeRecovery", assets: ["potions"], quarantined: ["trade-stale-malformed"] }]);
  assert.equal(save.onlineParty.tradeEscrowQuarantine[0].tradeId, "trade-stale-malformed");
  assert.equal(harness.controller.trade, null, "a trade absent from authoritative active IDs cannot leave stale UI behind");
  assert.equal(harness.controller.tradePendingOffer, null);
  assert.ok(harness.notices.includes("1件の交換品を所持品へ戻しました"));
  assert.ok(harness.notices.includes("1件の旧交換データを安全領域へ隔離しました"));
});

test("build258 orphan recovery round-trips every supported stack key", async () => {
  assert.deepEqual(Object.keys(ONLINE_TRADE_STACKS).sort(), EXPECTED_STACK_KEYS);
  const inventory = Object.fromEntries(EXPECTED_STACK_KEYS.map(key => [key, 5]));
  const save = state({ inventory });
  for (const key of EXPECTED_STACK_KEYS) {
    const result = reserveOnlineTradeAsset(save, `trade-stack-${key}`, `stack:${key}`, { amount: 2 });
    assert.equal(result.ok, true, key);
    assert.equal(save.inventory[key], 3, key);
  }
  const harness = clientHarness(save);

  assert.equal(await harness.controller._recoverOrphanedTradeEscrows([]), true);

  for (const key of EXPECTED_STACK_KEYS) assert.equal(save.inventory[key], 5, key);
  assert.deepEqual(save.onlineParty.tradeEscrow, {});
  assert.deepEqual(harness.mutations.map(event => event.kind), ["tradeRecovery"]);
  assert.deepEqual(harness.mutations[0].assets.map(asset => asset.payload.key).sort(), EXPECTED_STACK_KEYS);
  assert.ok(harness.notices.includes(`${EXPECTED_STACK_KEYS.length}件の交換品を所持品へ戻しました`));
});

test("build258 cancel cannot race an in-flight offer or reconciliation", () => {
  const save = state(), harness = clientHarness(save);
  harness.controller.trade = trade("trade-cancel-race");
  harness.controller.tradePendingOffer = { tradeId: "trade-cancel-race", requestId: "trade-offer-cancel-001" };
  const button = { dataset: {}, matches: selector => selector === "[data-online-trade-cancel]" };
  const event = { target: { closest: selector => selector === "button" ? button : null } };

  harness.controller._handleClick(event);
  assert.equal(harness.sent.some(message => message.type === "tradeCancel"), false);
  assert.ok(harness.notices.some(message => message.includes("保存・照合")));

  harness.controller.tradePendingOffer = null;
  harness.controller.tradeReconcilePending = true;
  harness.controller._handleClick(event);
  assert.equal(harness.sent.some(message => message.type === "tradeCancel"), false);

  harness.controller.tradeReconcilePending = false;
  harness.controller._handleClick(event);
  assert.deepEqual(harness.sent.at(-1), { type: "tradeCancel", tradeId: "trade-cancel-race" });
});

test("build258 a server cancellation serializes behind an in-flight offer save", async () => {
  const save = state(), reserveGate = deferred(); let persistCount = 0;
  const harness = clientHarness(save, { persist: () => ++persistCount === 1 ? reserveGate.promise : { ok: true } });
  harness.controller.trade = trade("trade-server-cancel-race");
  harness.controller.tradeAmount = "5";

  const offering = harness.controller._offerTradeAsset("stack:potions");
  const cancelling = harness.controller._finishTrade("trade-server-cancel-race", { cancelled: true, reason: "cancelled" });
  assert.deepEqual(harness.mutations.map(event => event.kind), ["tradeReserve"]);
  assert.equal(save.inventory.potions, 15);

  reserveGate.resolve({ ok: true });
  await Promise.all([offering, cancelling]);

  assert.deepEqual(harness.mutations.map(event => event.kind), ["tradeReserve", "tradeRelease"]);
  assert.deepEqual(harness.sent.map(message => message.type), ["tradeOffer"]);
  assert.equal(save.inventory.potions, 20);
  assert.equal(save.onlineParty.tradeEscrow["trade-server-cancel-race"], undefined);
  assert.equal(harness.controller.trade, null);
});
