import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { renderOnlineExplore } from "../src/online/OnlineViews.js";
import { OnlinePartyController } from "../src/online/OnlinePartyClient.js";

const hostId = "AD-HOST-244A";
const guestId = "AD-GEST-244B";
const profile = (displayName, maxFloor = 120) => ({
  displayName, monsterName: `${displayName}の魔物`, monsterId: `${displayName}-monster`, speciesId: "slime",
  level: 80, stars: 4, plus: 12, power: 5000, maxFloor, attribute: "water",
  battleStats: { hp: 500, mp: 80, atk: 120, def: 100, matk: 110, mdef: 90, spd: 75, crit: 5 },
  currentHp: 500, currentMp: 80, skills: [],
});
const members = [
  { playerId: hostId, leader: true, connected: true, ready: true, profile: profile("部屋主"), dungeonPosition: { x: 1, y: 1 }, coopVitals: { hp: 500, maxHp: 500, mp: 80, maxMp: 80 } },
  { playerId: guestId, leader: false, connected: true, ready: true, profile: profile("お手伝い"), dungeonPosition: { x: 2, y: 1 }, coopVitals: { hp: 460, maxHp: 500, mp: 65, maxMp: 80 } },
];
const gameState = { player: { currentFloor: 40, maxFloor: 120, gold: 0, crystals: 0 }, inventory: {}, settings: {}, party: [], monsters: [] };

function expeditionRoom(gimmickType = "dualSwitch", party = members) {
  return {
    roomId: "ROOM244", ownerId: hostId, leaderId: hostId, phase: "expedition", selectedFloor: 40, members: party,
    expedition: {
      id: "exp244", floor: 40, cols: 5, rows: 5,
      tiles: [["#", "#", "#", "#", "#"], ["#", ".", ".", ".", "#"], ["#", ".", ".", ".", "#"], ["#", ".", ".", ".", "#"], ["#", "#", "#", "#", "#"]],
      objects: [], interactions: {}, discoveries: 0, encountersCleared: 0, totalDiscoveries: 1, totalEncounters: 1,
      startedAt: Date.now(), coop: { enabled: party.length >= 2, gimmickType, resonance: { level: 1 } },
    },
  };
}

test("build244 presents each normal-map co-op gimmick as optional and non-blocking", () => {
  const labels = new Map([
    ["dualSwitch", "同時スイッチ"], ["relaySeal", "連鎖封印"], ["resonanceChest", "共同宝箱"],
    ["splitKey", "分割された鍵"], ["eliteVault", "共闘強敵・宝物庫"],
  ]);
  for (const [gimmickType, label] of labels) {
    const html = renderOnlineExplore(expeditionRoom(gimmickType), guestId, { gameState });
    assert.match(html, new RegExp(`任意協力・${label}`));
    assert.match(html, /任意・無視して出口へ進行可/);
    assert.match(html, /自分の階層・ボス進行は変化なし/);
    assert.match(html, /data-online-dungeon-canvas/);
    assert.doesNotMatch(html, /RESONANCE MAZE|音板を起動|data-online-resonance-board/);
  }
});

test("build244 keeps solo online exploration free from co-op guidance", () => {
  const solo = [{ ...members[0], dungeonPosition: { x: 1, y: 1 } }];
  const room = expeditionRoom("dualSwitch", solo);
  room.expedition.coop.enabled = false;
  const html = renderOnlineExplore(room, hostId, { gameState });
  assert.match(html, /通常探索・主の世界/);
  assert.match(html, /協力追加なし・オフライン探索と同じ進行/);
  assert.doesNotMatch(html, /任意協力・同時スイッチ/);
});

test("build244 explains host and guest progression before departure and in result reports", () => {
  const lobby = { roomId: "ROOM244", ownerId: hostId, leaderId: hostId, phase: "lobby", selectedFloor: 40, members };
  const hostLobby = renderOnlineExplore(lobby, hostId, { gameState });
  const guestLobby = renderOnlineExplore(lobby, guestId, { gameState });
  assert.match(hostLobby, /部屋主であるあなたの通常探索へ保存/);
  assert.match(guestLobby, /自分の通常探索階層・ボス進行は変わりません/);

  const report = { id: "report244", ownerId: hostId, floor: 40, reason: "floorBoss", multiplayer: true, ranking: [] };
  const hostReport = renderOnlineExplore(lobby, hostId, { gameState, expeditionReport: report });
  const guestReport = renderOnlineExplore(lobby, guestId, { gameState, expeditionReport: report });
  assert.match(hostReport, /階層支配者の撃破結果は、部屋主であるあなたの通常探索へ保存/);
  assert.match(guestReport, /お手伝い報酬と自分のHP\/MPだけを保存/);
  assert.match(guestReport, /通常探索階層・ボス進行は変わりません/);
});

test("build255 guest report displays assisted-world floors without recreating local progression", () => {
  const lobby = { roomId: "ROOM244", ownerId: hostId, leaderId: hostId, phase: "lobby", selectedFloor: 40, members };
  const report = {
    id: "guest-assisted-report", ownerId: hostId, progressionEligible: false, completed: true, reason: "return", multiplayer: true, ranking: [],
    assistedWorld: { ownerId: hostId, startFloor: 200, endFloor: 203, floorsCleared: 3 },
  };
  const html = renderOnlineExplore(lobby, guestId, { gameState, expeditionReport: report });
  assert.match(html, /203Fを共に踏破しました/);
  assert.match(html, /お手伝い報酬と自分のHP\/MPだけを保存/);
  assert.match(html, /通常探索階層・ボス進行は変わりません/);
  assert.doesNotMatch(html, /(?:0|undefined)Fを共に踏破/);
});

test("build244 opens a large receipt only for weapons and important equipment", async () => {
  const receiptIds = [], acknowledgements = [];
  const results = new Map([
    ["gold", { ok: true, gold: 100, isImportantEquipment: false }],
    ["armor", { ok: true, equipmentName: "SSR 鎧", equipmentKindLabel: "防具", isImportantEquipment: false }],
    ["lr-armor", { ok: true, equipmentName: "LR 鎧", equipmentKindLabel: "防具", isImportantEquipment: true }],
    ["weapon", { ok: true, equipmentName: "R 剣", equipmentKindLabel: "武器", isImportantEquipment: true }],
  ]);
  const controller = new OnlinePartyController({ onReward: async ({ rewardId }) => results.get(rewardId) });
  controller._send = (type, payload) => { acknowledgements.push([type, payload]); return true; };
  controller._showRewardReceipt = message => receiptIds.push(message.rewardId);
  for (const rewardId of results.keys()) await controller._receiveReward({ type: "onlineReward", rewardId, reward: {}, source: {} });
  assert.deepEqual(receiptIds, ["lr-armor", "weapon"]);
  assert.equal(acknowledgements.filter(([type]) => type === "rewardAck").length, 4);
});

test("build244 queues consecutive important-equipment receipts in FIFO order", async t => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 1_000 });
  const acknowledgements = [], shown = [];
  const controller = new OnlinePartyController({
    onReward: async ({ rewardId }) => ({ ok: true, equipmentName: rewardId === "first" ? "LR 蒼剣" : "神話の鎧", equipmentKindLabel: rewardId === "first" ? "武器" : "防具", isImportantEquipment: true }),
  });
  controller._send = (type, payload) => { acknowledgements.push([type, payload]); return true; };
  controller._query = () => null;
  controller._renderRewardReceipt = () => shown.push(controller.pendingRewardReceipt?.id);

  await controller._receiveReward({ type: "onlineReward", rewardId: "first", reward: { randomEquipmentRarity: "LR" }, source: { title: "一件目" } });
  await controller._receiveReward({ type: "onlineReward", rewardId: "second", reward: { randomEquipmentRarity: "神話" }, source: { title: "二件目" } });

  assert.equal(controller.pendingRewardReceipt?.id, "first");
  assert.deepEqual(controller.rewardReceiptQueue.map(entry => entry.id), ["second"]);
  assert.deepEqual(shown, ["first"], "the second receipt must not overwrite the visible first receipt");
  t.mock.timers.tick(7_200);
  assert.equal(controller.pendingRewardReceipt?.id, "second", "timeout advances to the next queued receipt");
  assert.deepEqual(shown, ["first", "second"]);
  controller._clearRewardReceipt();
  assert.equal(controller.pendingRewardReceipt, null, "closing the last receipt drains the FIFO queue");
  assert.deepEqual(controller.rewardReceiptQueue, []);
  assert.equal(acknowledgements.filter(([type]) => type === "rewardAck").length, 2);
});

test("build244 advances the receipt FIFO after a manual close", t => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 2_000 });
  const shown = [];
  let removed = false;
  const visibleReceipt = { classList: { add: value => assert.equal(value, "leaving") }, remove: () => { removed = true; } };
  const controller = new OnlinePartyController();
  controller._query = selector => selector === ".online-reward-receipt" ? visibleReceipt : null;
  controller._renderRewardReceipt = () => shown.push(controller.pendingRewardReceipt?.id);
  const important = name => ({ equipmentName: name, equipmentKindLabel: "武器", isImportantEquipment: true });

  controller._showRewardReceipt({ rewardId: "close-first", reward: { randomEquipmentRarity: "LR" }, source: {} }, important("LR 蒼剣"));
  controller._showRewardReceipt({ rewardId: "close-second", reward: { randomEquipmentRarity: "神話" }, source: {} }, important("神話の剣"));
  controller._clearRewardReceipt();

  assert.equal(controller.pendingRewardReceipt, null);
  assert.deepEqual(shown, ["close-first"]);
  t.mock.timers.tick(379);
  assert.equal(controller.pendingRewardReceipt, null, "the next receipt waits until the visible one finishes leaving");
  t.mock.timers.tick(1);
  assert.equal(removed, true);
  assert.equal(controller.pendingRewardReceipt?.id, "close-second");
  assert.deepEqual(shown, ["close-first", "close-second"]);
});

test("build244 forwards floor-boss progression only to the world owner", () => {
  const received = [];
  const controller = new OnlinePartyController({ onBattleDefeated: event => { received.push(event); return { ok: true }; } });
  controller.roomState = { ownerId: hostId, leaderId: hostId };
  controller.selfId = guestId;
  controller._applyBattleDefeated({ eventId: "guest-floor-boss", floor: 40, boss: true, floorBoss: true, worldOwnerId: hostId, progressionEligible: true, defeated: [{ boss: true }] });
  controller._applyBattleDefeated({ eventId: "guest-coop-boss", floor: 41, boss: true, floorBoss: false, worldOwnerId: hostId, progressionEligible: true, defeated: [{ boss: true }] });
  controller.selfId = hostId;
  controller._applyBattleDefeated({ eventId: "host-floor-boss", floor: 40, boss: true, floorBoss: true, worldOwnerId: hostId, progressionEligible: true, defeated: [{ boss: true }] });
  assert.equal(received[0].progressionEligible, false, "guest must not advance the host world's floor boss record");
  assert.equal(received[1].progressionEligible, false, "co-op bosses never qualify as ordinary floor-boss progression");
  assert.equal(received[2].progressionEligible, true, "only the world owner may persist floor-boss progression");
  assert.equal(received.every(event => event.worldOwnerId === hostId), true, "every receipt retains ownership metadata so persistence can reject guest records");
});

test("build244 persists ordinary battle records only for the host world owner", async () => {
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  const from = main.indexOf("function persistOnlineBattleDefeated"), to = main.indexOf("function claimOnlinePartyReward", from);
  assert.ok(from >= 0 && to > from);
  const source = main.slice(from, to);
  const fixture = selfId => {
    let saveCalls = 0;
    const calls = { floors: [], encounters: [], bosses: [], weaponKills: [], series: [] };
    const state = {
      onlineParty: { processedBattleEventIds: [] },
      player: { currentFloor: 5, maxFloor: 12, bossKills: { 40: 2 } },
      records: { kills: 7 }, codex: { encounters: { slime: 3 }, captures: {}, equipment: {} },
      monsters: [{ id: "battle-monster", affection: 12, bond: 12, battles: 5, history: { adventures: 4, battles: 4, victories: 3, kills: 6, bossDefeats: 1, highestFloor: 30, consecutiveDeployments: 2, longestConsecutiveDeployments: 3 } }],
    };
    const save = { state, save: () => { saveCalls += 1; return true; } };
    const context = {
      save, structuredClone: undefined, WORLD_MAX_FLOOR: 10_000, onlinePartyController: { selfId }, SPECIES: { slime: {}, dragon: {} },
      onlinePartyPersistentState: () => save.state.onlineParty,
      recordBiomeFloor: (_state, floor) => calls.floors.push(floor),
      recordBiomeEncounter: (_state, floor, speciesId) => calls.encounters.push([floor, speciesId]),
      recordBiomeBoss: (_state, floor) => calls.bosses.push(floor),
      recordWeaponKill: (_state, monsterId, enemy) => calls.weaponKills.push([monsterId, enemy.speciesId]),
      recordSeriesBattle: (_state, monsters, _unused, options) => calls.series.push([monsters[0].id, options.boss]),
    };
    vm.runInNewContext(`${source}\nthis.persist=persistOnlineBattleDefeated;`, context);
    return { state, calls, persist: context.persist, saveCalls: () => saveCalls };
  };

  const guest = fixture(guestId), guestBefore = JSON.parse(JSON.stringify(guest.state));
  const guestEvent = { eventId: "guest-floor-boss", monsterId: "battle-monster", floor: 40, boss: true, floorBoss: true, worldOwnerId: hostId, progressionEligible: false, defeated: [{ speciesId: "dragon", boss: true }] };
  const guestResult = guest.persist(guestEvent);
  assert.deepEqual(JSON.parse(JSON.stringify(guestResult)), { ok: true, guest: true });
  assert.deepEqual({ ...guest.state, onlineParty: undefined }, { ...guestBefore, onlineParty: undefined }, "guest normal progression, codex, records, and monster history stay byte-for-byte unchanged");
  assert.deepEqual(guest.state.onlineParty.processedBattleEventIds, [guestEvent.eventId]);
  assert.deepEqual(guest.calls, { floors: [], encounters: [], bosses: [], weaponKills: [], series: [] });
  assert.equal(guest.saveCalls(), 1, "the guest saves only the exactly-once receipt marker");
  assert.equal(guest.persist(guestEvent).duplicate, true);
  assert.equal(guest.saveCalls(), 1, "a duplicate guest event is neither recorded nor saved again");
  assert.deepEqual(guest.state.onlineParty.processedBattleEventIds, [guestEvent.eventId]);

  const host = fixture(hostId);
  assert.equal(host.persist({ eventId: "host-normal", monsterId: "battle-monster", floor: 39, boss: false, floorBoss: false, worldOwnerId: hostId, progressionEligible: false, defeated: [{ speciesId: "slime" }] }).ok, true);
  assert.equal(host.state.records.kills, 8);
  assert.equal(host.state.codex.encounters.slime, 4);
  assert.equal(host.state.monsters[0].history.highestFloor, 39);
  assert.deepEqual(host.calls.floors, [39]);
  assert.deepEqual(host.calls.encounters, [[39, "slime"]]);
  assert.equal(host.persist({ eventId: "host-floor-boss", monsterId: "battle-monster", floor: 40, boss: true, floorBoss: true, worldOwnerId: hostId, progressionEligible: true, defeated: [{ speciesId: "dragon", boss: true }] }).ok, true);
  assert.equal(host.state.player.bossKills[40], 3);
  assert.deepEqual(host.calls.bosses, [40]);
  assert.deepEqual({ currentFloor: host.state.player.currentFloor, maxFloor: host.state.player.maxFloor }, { currentFloor: 5, maxFloor: 12 });
});

test("build244 main persistence keeps resources compact and guards world progression", async () => {
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(main, /importantRarities=new Set\(\["LR","神話","深淵","十神"\]\)/);
  assert.match(main, /isImportantEquipment=Boolean\(equipmentAcquired&&equipmentName&&\(isWeapon\|\|importantRarities\.has\(equipmentRarity\)\)\)/);
  assert.match(main, /if\(equipmentName&&!isImportantEquipment\)setTimeout\(\(\)=>showToast/);
  assert.match(main, /if\(gold\)showResourceToast\("gold",gold\)/);
  assert.match(main, /if\(crystals\)setTimeout\(\(\)=>showResourceToast\("crystal",crystals\)/);
  assert.match(main, /ownsWorld=Boolean\(worldOwnerId\)&&worldOwnerId===selfId/);
  assert.match(main, /if\(!ownsWorld\)\{online\.processedBattleEventIds\.push\(eventId\)/);
  assert.match(main, /progressionEligible=floorBoss&&event\.progressionEligible===true/);
  assert.match(main, /if\(progressionEligible\)\{recordBiomeBoss\(save\.state,floor\);save\.state\.player\.bossKills/);
  assert.doesNotMatch(main, /if\(boss\)\{recordBiomeBoss\(save\.state,floor\)/);
  assert.match(main, /onlineObjects:multiplayer\?objects\.filter/);
});
