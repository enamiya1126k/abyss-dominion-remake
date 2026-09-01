import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";
import {
  chooseRareEvent,
  firstClearEquipmentRarity,
  personalBonusDraw,
  prepareOnlineExpansionV207,
  rareEventChance,
  rarityAtLeast,
} from "../src/OnlineExpansion207.js";
import { COOP_GIMMICK_TYPES } from "../src/CoopGimmicks.js";

const LEGACY_RARE_TYPES = new Set([
  "rareGoldenMonster",
  "rareMerchant",
  "rarePortal",
  "rarePortalGuardian",
  "rarePortalChest",
  "rareReturnPortal",
]);

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function hello(store, index, profile = {}) {
  const conn = connection();
  const friendId = `AD-BZ27-AA${"BCDE"[index - 1]}A`;
  const result = store.hello(conn, {
    friendId,
    clientKey: `build207-client-key-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `共闘207-${index}`,
      speciesId: "slime",
      maxFloor: 120,
      battleStats: { hp: 2_000, mp: 150, atk: 500, matk: 450, def: 300, mdef: 300, spd: 90, crit: 5, evasion: 3 },
      ...profile,
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session, result };
}

function readyRoom(store, count = 2, profile = {}) {
  const players = Array.from({ length: count }, (_, index) => hello(store, index + 1, profile));
  const created = store.createRoom(players[0].session);
  for (const player of players.slice(1)) assert.equal(store.joinRoom(player.session, created.room.roomId).ok, true);
  for (const player of players) assert.equal(store.setReady(player.session, true).ok, true);
  return { players, room: store.rooms.get(created.room.roomId) };
}

function fixture(floor = 1) {
  const rows = 15, cols = 15;
  const tiles = Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => x > 0 && y > 0 && x < cols - 1 && y < rows - 1 ? "." : "#"));
  return {
    id: `build207-fixture-${floor}`,
    floor,
    rows,
    cols,
    tiles,
    start: { x: 1, y: 1 },
    exit: { x: 13, y: 13 },
    objects: [{ id: "host-chest", type: "chest", x: 2, y: 2, resolved: false }],
    totalDiscoveries: 1,
  };
}

function assertSingleNormalMapGimmick(expedition) {
  assert.ok(COOP_GIMMICK_TYPES.includes(expedition.coop.gimmickType));
  assert.equal(expedition.coop.rare.kind, null);
  assert.equal(expedition.objects.some(object => object.rare || LEGACY_RARE_TYPES.has(object.type)), false);
  const optionalObjects = expedition.objects.filter(object => object.onlineAdded);
  assert.ok(optionalObjects.length > 0);
  assert.deepEqual([...new Set(optionalObjects.map(object => object.gimmickType))], [expedition.coop.gimmickType]);
  assert.equal([expedition.coop.gimmickType, expedition.coop.rare.kind].filter(Boolean).length, 1);
}

function injectLegacyRareObject(expedition, kind, object) {
  Object.assign(expedition.coop.rare, {
    kind,
    resolved: false,
    merchantClaims: {},
    portalEntered: false,
    guardianDefeated: false,
    realmActive: false,
    portalReturned: false,
  });
  const legacyObject = { resolved: false, hidden: false, persistent: true, rare: true, ...object };
  expedition.objects.push(legacyObject);
  return legacyObject;
}

test("build207 keeps exactly one normal-map co-op gimmick and ignores legacy rare requests", () => {
  for (const kind of ["goldenMonster", "otherworldMerchant", "hiddenPortal"]) {
    const expedition = fixture(321);
    prepareOnlineExpansionV207(expedition, {
      ownerId: "AD-BZ27-AABA",
      hostWorld: { openedChestIds: {} },
      participants: 4,
      resonance: 3,
      forceRare: kind,
    });
    assertSingleNormalMapGimmick(expedition);
    assert.equal(expedition.coop.resonance.level, 3);
    assert.equal(expedition.coop.resonance.rewardBonusPct, 9);
  }
  assert.equal(chooseRareEvent({ forceRare: "goldenMonster", participants: 2 }), null);
  assert.equal(rareEventChance({ floor: 1001, participants: 4, resonance: 5 }), 0);
});

test("build207 shared loot gives everyone the same base and only the lucky player a personal extra", () => {
  let rolls = [.99];
  const store = new RoomStore({ randomRoomCode: () => "LOOT27", random: () => rolls.shift() ?? .99 });
  const { players, room } = readyRoom(store, 2);
  assert.equal(store.startExpedition(players[0].session, { hostWorld: { openedChestIds: {} } }).ok, true);
  rolls = [0, .5, .99];
  const results = store._queueSharedReward207(room, {
    rewardId: "shared-loot",
    base: { gold: 1_000, crystals: 3 },
    source: { kind: "testChest", floor: 20, title: "共通宝箱" },
  });
  assert.equal(results.length, 2);
  const first = players[0].session.pendingRewards.find(entry => entry.rewardId === `shared-loot:${players[0].session.playerId}`);
  const second = players[1].session.pendingRewards.find(entry => entry.rewardId === `shared-loot:${players[1].session.playerId}`);
  assert.deepEqual(first.source.sharedBase, second.source.sharedBase);
  assert.equal(first.reward.gold, second.reward.gold);
  assert.equal(first.reward.captureCrystals, 1);
  assert.equal(second.reward.captureCrystals, undefined);
  assert.equal(first.source.personalBonus, "追加捕獲結晶");
  assert.equal(second.source.personalBonus, null);
  assert.equal(personalBonusDraw(() => .99), null);
});

test("build207 owner disconnect keeps the current floor but blocks the next floor until reconnection", () => {
  let now = 100_000;
  const store = new RoomStore({ now: () => now, reconnectGraceMs: 300_000, randomRoomCode: () => "HOST27" });
  const { players, room } = readyRoom(store, 2);
  assert.equal(store.startExpedition(players[0].session, { hostWorld: { openedChestIds: {} } }).ok, true);
  const currentId = room.expedition.id;
  store.disconnect(players[0].session);
  players[1].session.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  store._updateStairGathering(room);
  now += 3_001;
  store._advanceExpeditionFloor(room);
  assert.equal(room.expedition.id, currentId);
  assert.equal(room.expedition.coop.ownerAdvanceBlocked, true);
  assert.ok(room.expedition.coop.ownerReconnectDeadline > now);

  const replacement = connection();
  const resumed = store.hello(replacement, {
    friendId: players[0].session.playerId,
    clientKey: players[0].session.clientKey,
    resumeToken: players[0].result.resumeToken,
    profile: players[0].session.profile,
  });
  assert.equal(resumed.ok, true);
  assert.equal(resumed.resumed, true);
  assert.equal(room.expedition.hostOwnerId, players[0].session.playerId);
  assert.equal(room.leaderId, players[0].session.playerId);
  assert.equal(room.expedition.coop.ownerDisconnectedAt, 0);
});

test("build207 boss first-clear equipment and unlock belong only to the world owner", () => {
  let now = 200_000;
  const store = new RoomStore({ now: () => now, randomRoomCode: () => "BOSS27" });
  const { players, room } = readyRoom(store, 2, { maxFloor: 20 });
  assert.equal(store.setFloor(players[0].session, 10).ok, true);
  for (const player of players) assert.equal(store.setReady(player.session, true).ok, true);
  assert.equal(store.startExpedition(players[0].session, { hostWorld: { openedChestIds: {}, defeatedBossFloors: [] } }).ok, true);
  const boss = room.expedition.objects.find(object => object.type === "floorBoss");
  store._startBattle(room, boss);
  const battle = room.expedition.battle;
  battle.enemies.forEach(enemy => { enemy.hp = 0; });
  store._finishBattleVictory(room, battle);
  for (const player of players) player.session.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  store._updateStairGathering(room);
  now += 3_001;
  store._advanceExpeditionFloor(room);
  const ownerReward = players[0].session.pendingRewards.find(entry => entry.source?.bossFirstClear);
  const ownerUnlock = players[0].session.pendingRewards.find(entry => entry.source?.kind === "floorClear");
  const helperReward = players[1].session.pendingRewards.find(entry => entry.source?.bossAssist);
  assert.ok(ownerReward);
  assert.equal(ownerReward.reward.randomEquipmentRarity, undefined);
  assert.equal(firstClearEquipmentRarity(10), "R");
  assert.equal(ownerUnlock.reward.leaderFloorUnlock, 11);
  assert.ok(helperReward);
  assert.equal(helperReward.reward.randomEquipmentRarity, undefined);
  assert.equal(Object.hasOwn(helperReward.reward, "leaderFloorUnlock"), false, "a helper receipt must not carry an inert progression field");
  assert.deepEqual(room.hostWorld.defeatedBossFloors, [10]);
  assert.equal(room.expedition.hostOwnerId, players[0].session.playerId);
  assert.equal(room.coopRun.resonance, 1);
  assert.equal(rarityAtLeast("UR", "UR"), true);
  assert.equal(rarityAtLeast("SSR", "UR"), false);
});

test("build207 social, focus marker and one-use KO cheer are authoritative", () => {
  const store = new RoomStore({ randomRoomCode: () => "PLAY27", random: () => .2 });
  const { players, room } = readyRoom(store, 2);
  assert.equal(store.startExpedition(players[0].session, { hostWorld: { openedChestIds: {} } }).ok, true);
  const position = room.expedition.start;
  store._startBattle(room, { id: "build207-encounter-1", type: "encounter", ...position });
  const battle = room.expedition.battle;
  const enemy = battle.enemies[0];
  assert.equal(store.social(players[0].session, { kind: "emote", id: "clap" }).ok, true);
  assert.equal(players[1].conn.messages.findLast(message => message.type === "social")?.id, "clap");
  assert.equal(store.focusTarget(players[0].session, { mode: "explore", targetId: enemy.id }).ok, true);
  assert.equal(battle.focusTarget.targetId, enemy.id);
  assert.equal(battle.focusTarget.expiresAt > 0, true);
  battle.players[players[1].session.playerId].hp = 0;
  assert.equal(store.battleCheer(players[1].session, { mode: "explore" }).ok, true);
  assert.ok(battle.cheeredBy.includes(players[1].session.playerId));
  assert.ok(battle.players[players[0].session.playerId].effects.some(effect => effect.kind === "atkUp" && effect.value === .03));
  assert.equal(store.battleCheer(players[1].session, { mode: "explore" }).code, "CHEER_USED");
});

test("build207 legacy merchant remains readable while portal requests stay on the normal map", () => {
  const store = new RoomStore({ randomRoomCode: () => "STEP27" });
  const { players, room } = readyRoom(store, 2);
  store._finishExpedition(room, { reason: "select-non-boss" });
  assert.equal(store.setFloor(players[0].session, 119).ok, true);
  for (const player of players) assert.equal(store.setReady(player.session, true).ok, true);
  assert.equal(store.startExpedition(players[0].session, { hostWorld: { openedChestIds: {} }, forceRare: "otherworldMerchant" }).ok, true);
  assertSingleNormalMapGimmick(room.expedition);
  for (const object of room.expedition.objects) if (object.onlineAdded) object.resolved = true;
  const merchant = injectLegacyRareObject(room.expedition, "otherworldMerchant", {
    id: "legacy-rare-merchant",
    type: "rareMerchant",
    ...room.expedition.start,
  });
  players[0].session.dungeonPosition = { x: merchant.x, y: merchant.y, facing: "down" };
  store._resolveLanding(room, players[0].session);
  assert.equal(merchant.resolved, false);
  assert.equal(room.expedition.interactions[players[0].session.playerId].action, "browseRareMerchant");

  store._finishExpedition(room, { reason: "test" });
  for (const player of players) assert.equal(store.setReady(player.session, true).ok, true);
  assert.equal(store.startExpedition(players[0].session, { hostWorld: { openedChestIds: {} }, forceRare: "hiddenPortal" }).ok, true);
  assertSingleNormalMapGimmick(room.expedition);
  for (const object of room.expedition.objects) if (object.onlineAdded) object.resolved = true;
  const portal = injectLegacyRareObject(room.expedition, "hiddenPortal", {
    id: "legacy-rare-portal",
    type: "rarePortal",
    ...room.expedition.start,
  });
  players[0].session.dungeonPosition = { x: portal.x, y: portal.y, facing: "down" };
  store._resolveLanding(room, players[0].session);
  assert.equal(portal.resolved, false);
  assert.equal(room.expedition.interactions[players[0].session.playerId], undefined);
  const tilesBefore = structuredClone(room.expedition.tiles);
  const response = store.expeditionInteract(players[0].session, { action: "enterRarePortal", targetId: portal.id });
  assert.equal(response.ok, false);
  assert.equal(response.code, "FEATURE_INTEGRATED");
  assert.match(response.message, /共同探索へ統合/);
  assert.deepEqual(room.expedition.tiles, tilesBefore);
  assert.equal(room._rareMainWorld, null);
});
