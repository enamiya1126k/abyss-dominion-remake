import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  CASINO_MULTIPLIER_RATES,
  buyDarkMarketRecovery,
  casinoBetLimit,
  darkMarketMonsterPriceFloor,
  isDarkMarketMonsterAllowed,
  normalizeSecretRoomState,
  spinSecretRoomCasino,
} from "../src/core/SecretRoomSystem.js?build251-secret-room-casino";

function casinoState(overrides = {}) {
  return {
    player: { gold: 10_000, crystals: 500, ...(overrides.player ?? {}) },
    secretRooms: {
      run: null,
      activeRoom: {
        id: "build251-audit",
        floor: 100,
        rested: false,
        casino: {
          entryPaid: false,
          used: false,
          spins: 0,
          wins: 0,
          netGold: 0,
          crystalsSpent: 0,
          lastResult: null,
          history: [],
          ...(overrides.casino ?? {}),
        },
        offers: [],
        recoveryPurchased: {},
      },
    },
  };
}

test("build251 uses the fixed sub-1.0 RTP table", () => {
  const table = CASINO_MULTIPLIER_RATES.map(bucket => [bucket.multiplier ?? bucket.min, bucket.rate]);
  assert.deepEqual(table, [
    [0, .50],
    [1, .30],
    [2, .13],
    [3, .045],
    [5, .018],
    [10, .005],
    [50, .0018],
    [100, .00019],
    [999, .00001],
  ]);
  const rateTotal = table.reduce((sum, [, rate]) => sum + rate, 0);
  const returnToPlayer = table.reduce((sum, [multiplier, rate]) => sum + multiplier * rate, 0);
  assert.ok(Math.abs(rateTotal - 1) < 1e-12);
  assert.ok(Math.abs(returnToPlayer - .95399) < 1e-12);
});

test("build251 charges the room entry once, then repeats with GOLD only", () => {
  const state = casinoState();
  const first = spinSecretRoomCasino(state, 100, () => .81);
  assert.equal(first.ok, true);
  assert.equal(first.multiplier, 2);
  assert.equal(state.player.gold, 10_100);
  assert.equal(state.player.crystals, 400);

  const second = spinSecretRoomCasino(state, 100, () => .60);
  assert.equal(second.ok, true);
  assert.equal(second.multiplier, 1);
  assert.equal(state.player.gold, 10_100);
  assert.equal(state.player.crystals, 400, "the second spin must not charge crystals again");
  assert.equal(state.secretRooms.activeRoom.casino.spins, 2);
  assert.equal(state.secretRooms.activeRoom.casino.crystalsSpent, 100);
  assert.equal(state.secretRooms.activeRoom.casino.history.length, 2);
});

test("build251 migrates a legacy used room without charging its entry again", () => {
  const state = casinoState({
    casino: {
      used: true,
      spins: 1,
      wins: 0,
      netGold: -100,
      crystalsSpent: 100,
      lastResult: { multiplier: 0, bet: 100, payout: 0, net: -100, crystalCost: 100 },
    },
  });
  normalizeSecretRoomState(state);
  const crystals = state.player.crystals;
  const result = spinSecretRoomCasino(state, 50, () => .60);
  assert.equal(result.ok, true);
  assert.equal(state.player.crystals, crystals);
  assert.equal(state.secretRooms.activeRoom.casino.entryPaid, true);
});

test("build251 retains only the latest twenty slot results", () => {
  const state = casinoState({ player: { gold: 100_000, crystals: 500 } });
  for (let index = 0; index < 25; index += 1) {
    const result = spinSecretRoomCasino(state, 1, () => .60);
    assert.equal(result.ok, true, `spin ${index + 1}`);
  }
  const casino = state.secretRooms.activeRoom.casino;
  assert.equal(casino.spins, 25);
  assert.equal(casino.history.length, 20);
  assert.ok(casino.history.some(entry => entry.at === casino.lastResult.at && entry.bet === casino.lastResult.bet));
});

test("build251 makes a repeated spin id idempotent", () => {
  const state = casinoState();
  const first = spinSecretRoomCasino(state, 100, { spinId: "same-payment", random: () => .81 });
  const before = JSON.stringify({ player: state.player, casino: state.secretRooms.activeRoom.casino });
  const duplicate = spinSecretRoomCasino(state, 100, { spinId: "same-payment", random: () => 0 });
  assert.equal(first.ok, true);
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(JSON.stringify({ player: state.player, casino: state.secretRooms.activeRoom.casino }), before);
});

test("build251 keeps the jackpot payout inside safe integer bounds", () => {
  const state = casinoState({ player: { gold: Number.MAX_SAFE_INTEGER, crystals: 500 } });
  const bet = casinoBetLimit(state);
  const result = spinSecretRoomCasino(state, bet, { spinId: "safe-jackpot", random: () => .9999999 });
  assert.equal(result.ok, true);
  assert.equal(result.multiplier, 999);
  assert.equal(Number.isSafeInteger(state.player.gold), true);
  assert.ok(state.player.gold <= Number.MAX_SAFE_INTEGER);
});

test("build251 rejects invalid bets without mutating currency", () => {
  for (const bet of [0, -1, 10_001, Number.NaN, Number.POSITIVE_INFINITY]) {
    const state = casinoState();
    const before = { ...state.player };
    assert.equal(spinSecretRoomCasino(state, bet, () => .60).ok, false);
    assert.deepEqual(state.player, before);
    assert.equal(state.secretRooms.activeRoom.casino.spins, 0);
  }
  const state = casinoState({ player: { gold: 12_345, crystals: 500 } });
  const limit = casinoBetLimit(state);
  assert.equal(Number.isSafeInteger(limit), true);
  assert.ok(limit >= 1 && limit <= state.player.gold);
});

test("build251 excludes authored and serial-only monsters from the dark market", () => {
  assert.equal(isDarkMarketMonsterAllowed({ id: "ordinary", rarity: "LR", tags: [] }), true);
  assert.equal(isDarkMarketMonsterAllowed({ id: "abyssal_hydra", rarity: "UR", tags: [] }), true, "a normal monster name must not trigger a substring ban");
  for (const species of [
    { id: "ten", isTenGod: true },
    { id: "abyss", isAbyss: true },
    { id: "ten-tag", tags: ["tenGod"] },
    { id: "abyss-tag", tags: ["abyss"] },
    { id: "serial", serialOnly: true },
    { id: "excluded", gachaExcluded: true },
    { id: "serial-source", acquisition: ["シリアルコード限定"] },
  ]) assert.equal(isDarkMarketMonsterAllowed(species), false, species.id);
});

test("build251 removes forbidden legacy offers and reprices old excessive levels once", () => {
  const state = casinoState();
  state.secretRooms.activeRoom.offers = [
    { id: "forbidden", kind: "monster", rarity: "深淵", sold: false, price: 1, payload: { speciesId: "slime", level: 10 } },
    { id: "overlevel", kind: "monster", rarity: "SR", powerGrade: "standard", sold: false, price: 1, referencePrice: 1, payload: { speciesId: "slime", level: 9_999, plus: 0 } },
    { id: "equipment", kind: "equipment", rarity: "LR", sold: false, price: 1, referencePrice: 1, payload: { name: "random relic", level: 99_999 } },
  ];
  normalizeSecretRoomState(state);
  assert.deepEqual(state.secretRooms.activeRoom.offers.map(offer => offer.id), ["overlevel", "equipment"]);
  const price = state.secretRooms.activeRoom.offers[0].price;
  assert.ok(price > 1);
  assert.equal(state.secretRooms.activeRoom.offers[1].price, 1, "equipment keeps its random bargain");
  normalizeSecretRoomState(state);
  assert.equal(state.secretRooms.activeRoom.offers[0].price, price, "migration is idempotent");
});

test("build251 keeps recovery purchases repeatable and capped at ten", () => {
  const state = casinoState();
  state.inventory = {};
  state.records = {};
  for (let index = 0; index < 10; index += 1) assert.equal(buyDarkMarketRecovery(state, "highPotions").ok, true);
  assert.equal(state.inventory.highPotions, 10);
  assert.equal(state.secretRooms.activeRoom.recoveryPurchased.highPotions, 10);
  assert.equal(buyDarkMarketRecovery(state, "highPotions").ok, false);
});

test("build251 leaves up-to-three-times levels unpriced and scales excessive levels", () => {
  assert.equal(darkMarketMonsterPriceFloor(100, 300, "SR", "standard"), 0);
  const justOver = darkMarketMonsterPriceFloor(100, 301, "SR", "standard");
  const high = darkMarketMonsterPriceFloor(100, 1_000, "SR", "standard");
  const jackpot = darkMarketMonsterPriceFloor(100, 9_999, "LR", "jackpot");
  assert.ok(justOver > 0);
  assert.ok(high > justOver);
  assert.ok(jackpot > high);
  assert.ok(darkMarketMonsterPriceFloor(100, { level: 9_999, plus: 99 }, "LR", "jackpot") > jackpot);
  assert.ok(darkMarketMonsterPriceFloor(100, { level: 9_999 }, "LR", "jackpot") >= jackpot);
  assert.ok(darkMarketMonsterPriceFloor(100, 9_999, 123_456) >= 123_456, "numeric third argument remains a reference-price floor");
  assert.ok(
    darkMarketMonsterPriceFloor(53, { speciesId: "mimic", level: 590, plus: 5 }, "SR", "standard") > 28_416_033,
    "the reported 53F/Lv590 bargain case must cost more than the screenshot wallet",
  );
});

test("build251 updates cache identity and removes one-spin wording", async () => {
  const [index, main, shop, saveService, secretRoom, css] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/main.js", import.meta.url), "utf8"),
    readFile(new URL("../src/ui/screens/ShopScreen.js", import.meta.url), "utf8"),
    readFile(new URL("../src/services/SaveService.js", import.meta.url), "utf8"),
    readFile(new URL("../src/core/SecretRoomSystem.js", import.meta.url), "utf8"),
    readFile(new URL("../src/Styles/build251.css", import.meta.url), "utf8"),
  ]);
  assert.match(index, /build251\.css\?v=2\.11\.75-build251/);
  const assetVersion = index.match(/const ASSET_VERSION = "(\d+)\.(\d+)\.(\d+)"/)?.slice(1).map(Number);
  const assetBuild = Number(index.match(/const ASSET_BUILD = "build(\d+)"/)?.[1]);
  assert.ok(assetVersion && (assetVersion[0] > 2 || assetVersion[0] === 2 && (assetVersion[1] > 11 || assetVersion[1] === 11 && assetVersion[2] >= 75)), "active asset version must not regress below build251");
  assert.ok(assetBuild >= 251, "active asset build must not regress below build251");
  assert.match(main, /SecretRoomSystem\.js\?v=2\.11\.82-build258/);
  assert.match(main, /ShopScreen\.js\?v=2\.11\.82-build258/);
  assert.match(main, /SaveService\.js\?v=2\.11\.82-build258/);
  assert.match(shop, /SecretRoomSystem\.js\?v=2\.11\.82-build258/);
  assert.match(saveService, /SecretRoomSystem\.js\?v=2\.11\.82-build258/);
  assert.doesNotMatch(secretRoom, /ENDGAME_CHARACTERS|marketEndgameOffer/);
  assert.match(secretRoom, /random\(\)<\.05\?9999/);
  assert.doesNotMatch(`${main}\n${shop}`, /この🚪で1回限り|この🚪では挑戦済み|別の🚪を発見すると再挑戦/);
  assert.match(`${main}\n${shop}`, /何度でも|繰り返し/);
  assert.match(main, /casino\.history\?\?\[\]\)\.slice\(-20\)\.reverse\(\)/, "the casino UI must display all twenty retained results");
  for (const className of ["casino-session-stats", "casino-jackpot-meter", "casino-history-list", "casino-history-row", "casino-repeat-note"]) {
    assert.match(css, new RegExp(`\\.${className}`));
  }
  const autoStart = main.indexOf("async function runSecretRoomAuto");
  const autoEnd = main.indexOf("function leaveSecretRoom", autoStart);
  assert.ok(autoStart >= 0 && autoEnd > autoStart);
  assert.doesNotMatch(main.slice(autoStart, autoEnd), /spinSecretRoomCasino/, "AUTO must not gamble repeatedly");
  const marketBindStart = main.indexOf("function bindDarkMarketModal");
  const marketBindEnd = main.indexOf("function openDarkMarket", marketBindStart);
  assert.match(main.slice(marketBindStart, marketBindEnd), /refreshDarkMarketModal/);
  assert.match(main, /scrollState=\{\}|card\.scrollTop=scrollState\.card/);
  assert.match(main.slice(marketBindStart, marketBindEnd), /purchaseRecords:save\.state\.records\?\.purchases\?\?0/);
  assert.match(main.slice(marketBindStart, marketBindEnd), /save\.state\.records\.purchases=checkpoint\.purchaseRecords/);
  assert.doesNotMatch(main.slice(marketBindStart, marketBindEnd), /modal\.remove\(\).*openDarkMarket/s, "recovery purchases must keep the current modal");
});
