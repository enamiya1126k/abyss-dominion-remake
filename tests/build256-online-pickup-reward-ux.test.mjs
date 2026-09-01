import test from "node:test";
import assert from "node:assert/strict";
import { OnlinePartyController, onlineRewardReceiptData } from "../src/online/OnlinePartyClient.js?build256-pickup-reward-ux";

test("build256 chest rewards become an explicit itemized receipt", () => {
  const receipt = onlineRewardReceiptData({
    rewardId: "build256-chest-player",
    reward: { gold: 12_345, crystals: 2, captureCrystals: 1 },
    source: { kind: "chest", title: "✨ 輝く宝箱" },
  }, { ok: true, gold: 12_345, crystals: 2, captureCrystals: 1 });

  assert.equal(receipt.title, "✨ 輝く宝箱");
  assert.equal(receipt.heading, "受け取った報酬");
  assert.deepEqual(receipt.items, [
    { label: "GOLD", value: "+12,345G", rare: false },
    { label: "魔晶石", value: "×2", rare: false },
    { label: "捕獲結晶", value: "×1", rare: false },
  ]);
});

test("build256 deluxe and rare equipment receipts retain the realized equipment name", () => {
  const receipt = onlineRewardReceiptData({
    rewardId: "build256-deluxe-player",
    reward: { gold: 900, randomEquipmentRarity: "神話" },
    source: { kind: "deluxeChest", title: "豪華共鳴宝箱" },
  }, { ok: true, gold: 900, equipmentName: "神話 星喰らいの剣 Lv.201", equipmentKindLabel: "武器", isImportantEquipment: true });

  assert.equal(receipt.important, true);
  assert.equal(receipt.items.at(-1).label, "武器");
  assert.equal(receipt.items.at(-1).value, "神話 星喰らいの剣 Lv.201");
  assert.equal(receipt.items.at(-1).rare, true);
});

test("build256 routine battle rewards do not interrupt play with a receipt", () => {
  assert.equal(onlineRewardReceiptData({ rewardId: "battle", reward: { gold: 100 }, source: { kind: "battle" } }, { ok: true, gold: 100 }), null);
  assert.equal(onlineRewardReceiptData({ rewardId: "duplicate", reward: { gold: 100 }, source: { kind: "chest" } }, { ok: true, duplicate: true, gold: 100 }), null);
});

test("build256 one chest delivery is acknowledged once and keeps the exact received amount", async () => {
  const message = { rewardId: "build256-ack-once", reward: { gold: 7_654, abyssKeys: 1 }, source: { kind: "chest", title: "🔓 鍵付き宝箱" } };
  const sent = [], receipts = [];
  const controller = new OnlinePartyController({ onReward: async () => ({ ok: true, gold: 7_654, abyssKeys: 1 }) });
  controller._send = (type, payload) => { sent.push({ type, payload }); return true; };
  controller._showRewardReceipt = (received, result) => receipts.push(onlineRewardReceiptData(received, result));

  await controller._receiveReward(message);
  assert.deepEqual(sent, [{ type: "rewardAck", payload: { rewardId: "build256-ack-once" } }]);
  assert.equal(receipts.length, 1);
  assert.deepEqual(receipts[0].items, [
    { label: "GOLD", value: "+7,654G", rare: false },
    { label: "深淵の鍵", value: "×1", rare: true },
  ]);
});
