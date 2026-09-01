import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildOnlineTradeCatalog,
  commitOnlineTrade,
  parseOnlineTradeAmount,
  recoverOrphanedTradeEscrows,
  releaseOnlineTradeAsset,
  reserveOnlineTradeAsset,
  rollbackOnlineTradeAssetReservation,
} from "../src/online/OnlineTradeSystem.js";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");
function state() {
  return {
    player: { gold: 10_000, crystals: 448 },
    inventory: { captureCrystals: 11, potions: 20 },
    monsters: [{ id: "one", name: "一体目", equipment: {} }, { id: "two", name: "二体目", equipment: {} }],
    party: [], equipment: [], reserveEquipment: [], bossEquipmentVault: [], onlineParty: {},
  };
}

test("build258 accepts explicit Japanese numeric input and rejects ambiguous quantities", () => {
  assert.equal(parseOnlineTradeAmount("１２，３４５", 20_000), 12_345);
  assert.equal(parseOnlineTradeAmount("1 234", 2_000), 1_234);
  for (const value of ["", "0", "-1", "1.5", "abc", Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(parseOnlineTradeAmount(value), null, String(value));
  }
  assert.equal(parseOnlineTradeAmount("101", 100), null);
});

test("build258 reserves, replaces and rolls back currency quantities atomically", () => {
  const save = state();
  const first = reserveOnlineTradeAsset(save, "trade-atomic", "currency:gold", { amount: 100 });
  assert.equal(first.ok, true); assert.equal(save.player.gold, 9_900); assert.equal(first.asset.amount, 100);

  const replaced = reserveOnlineTradeAsset(save, "trade-atomic", "currency:gold", { amount: 350, replace: true });
  assert.equal(replaced.ok, true); assert.equal(save.player.gold, 9_650); assert.equal(replaced.previousAsset.payload.amount, 100);

  const failed = reserveOnlineTradeAsset(save, "trade-atomic", "currency:gold", { amount: 99_999, replace: true });
  assert.equal(failed.ok, false);
  assert.equal(save.player.gold, 9_650, "a rejected replacement cannot release or alter the current escrow");
  assert.equal(save.onlineParty.tradeEscrow["trade-atomic"].asset.payload.amount, 350);

  const rolledBack = rollbackOnlineTradeAssetReservation(save, "trade-atomic", replaced.previousAsset);
  assert.equal(rolledBack.asset.payload.amount, 100);
  assert.equal(save.player.gold, 9_900, "network rejection restores the exact previous offer");
  releaseOnlineTradeAsset(save, "trade-atomic");
  assert.equal(save.player.gold, 10_000);
});

test("build258 exchanges exact GOLD, crystal, capture and stack quantities once", () => {
  const save = state();
  const rows = [
    ["currency:gold", 1_234, () => save.player.gold, 8_766],
    ["currency:crystals", 44, () => save.player.crystals, 404],
    ["currency:captureCrystals", 7, () => save.inventory.captureCrystals, 4],
    ["stack:potions", 12, () => save.inventory.potions, 8],
  ];
  for (const [ref, amount, current, remaining] of rows) {
    const tradeId = `trade-${ref.replace(":", "-")}`, reserved = reserveOnlineTradeAsset(save, tradeId, ref, { amount });
    assert.equal(reserved.ok, true); assert.equal(current(), remaining); assert.equal(reserved.asset.payload.amount, amount);
    releaseOnlineTradeAsset(save, tradeId);
  }
  assert.deepEqual([save.player.gold, save.player.crystals, save.inventory.captureCrystals, save.inventory.potions], [10_000, 448, 11, 20]);

  reserveOnlineTradeAsset(save, "trade-commit", "currency:gold", { amount: 500 });
  const incoming = { assetId: "currency:crystals", kind: "currency", name: "魔晶石", rarity: "💎", details: "30個", amount: 30, payload: { key: "crystals", amount: 30 } };
  assert.equal(commitOnlineTrade(save, "trade-commit", incoming).ok, true);
  assert.equal(commitOnlineTrade(save, "trade-commit", incoming).duplicate, true);
  assert.equal(save.player.gold, 9_500); assert.equal(save.player.crystals, 478);
});

test("build258 orphan recovery returns the complete reserved quantity only when unprotected", () => {
  const save = state();
  reserveOnlineTradeAsset(save, "trade-live", "currency:gold", { amount: 777 });
  reserveOnlineTradeAsset(save, "trade-orphan", "currency:crystals", { amount: 48 });
  assert.deepEqual(recoverOrphanedTradeEscrows(save, ["trade-live"]).map(asset => asset.payload.amount), [48]);
  assert.equal(save.player.gold, 9_223); assert.equal(save.player.crystals, 448);
  assert.equal(save.onlineParty.tradeEscrow["trade-live"].asset.payload.amount, 777);
});

test("build258 trade UI uses select then explicit quantity set with mobile controls", async () => {
  const [views, client, css] = await Promise.all([
    read("src/online/OnlineViews.js"), read("src/online/OnlinePartyClient.js"), read("src/Styles/build258-trade.css"),
  ]);
  for (const token of ["data-online-trade-amount-step", "data-online-trade-amount-max", "data-online-trade-quantity-set", "data-online-trade-amount-preview", "has-quantity", "online-trade-offer-quantity"]) assert.match(views + css, new RegExp(token));
  assert.match(client, /_selectTradeAsset/);
  assert.match(client, /rollbackOnlineTradeAssetReservation/);
  assert.doesNotMatch(client, /data-online-trade-amount[\s\S]{0,500}replace\(\/\\D\/g/);
  assert.match(client, /OnlineTradeSystem\.js\?v=2\.11\.82-build258/);
  assert.match(css, /font:900 16px/);
  assert.match(css, /max-height:690px/);
});
