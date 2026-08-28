import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";
import { createSoloStyleDungeon } from "../src/OfflineDungeonRules.js";
import { coopParticipantTier, coopRewardTier } from "../src/CoopGimmicks.js";

const COOP_ONLY_TYPES = new Set([
  "coopSwitch",
  "relaySeal",
  "resonanceChest",
  "resonanceVault",
  "coopElite",
  "deluxeChest",
  "keyFragment",
  "combinedKey",
  "rareGoldenMonster",
  "rareMerchant",
  "rarePortal",
  "rarePortalGuardian",
  "rarePortalChest",
  "rareReturnPortal",
]);

function offlineRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function connection() {
  return {
    messages: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close() {},
  };
}

function createSoloRoom({ floor = 7, now = () => 42_000 } = {}) {
  const store = new RoomStore({ now, random: () => .5, randomRoomCode: () => "SOLO43" });
  const conn = connection();
  const hello = store.hello(conn, {
    friendId: "AD-S2L2-PAR2",
    clientKey: "build243-solo-parity-client-key",
    profile: {
      displayName: "Solo parity",
      monsterId: "solo-parity-monster",
      speciesId: "slime",
      maxFloor: 20,
      currentHp: 321,
      currentMp: 27,
      explorePickupDone: true,
      battleStats: { hp: 700, mp: 70, atk: 200, matk: 180, def: 140, mdef: 130, spd: 90, crit: 5, evasion: 3, accuracy: 100 },
    },
  });
  assert.equal(hello.ok, true);
  const created = store.createRoom(conn.session);
  assert.equal(created.ok, true);
  assert.equal(store.setFloor(conn.session, floor).ok, true);
  assert.equal(store.setReady(conn.session, true).ok, true);
  return { store, conn, session: conn.session, room: store.rooms.get(created.room.roomId) };
}

function ordinaryObject(object) {
  return {
    id: object.id,
    type: object.type,
    x: object.x,
    y: object.y,
    resolved: Boolean(object.resolved),
    kind: object.kind ?? null,
    locked: Boolean(object.locked),
    mimic: Boolean(object.mimic),
    bossEncounter: Boolean(object.bossEncounter),
  };
}

function offlineFloor({ ownerId, floor, seed, now }) {
  return createSoloStyleDungeon({
    roomId: ownerId,
    floor,
    runId: `offline-${floor}`,
    now,
    random: offlineRandom(seed),
    chestSpawnBonus: 0,
    secretRoomRun: null,
    explorePickupDone: true,
  });
}

function assertOrdinaryFloorParity(actual, expected, seed) {
  assert.equal(actual.offlineSeed, seed);
  assert.equal(actual.floor, expected.floor);
  assert.equal(actual.cols, expected.cols);
  assert.equal(actual.rows, expected.rows);
  assert.deepEqual(actual.tiles, expected.tiles, "the host floor seed must produce the offline tile map");
  assert.deepEqual(actual.start, expected.start);
  assert.deepEqual(actual.exit, expected.exit);
  assert.equal(actual.treasureRoom, expected.treasureRoom);
  assert.equal(actual.nextEncounter, expected.nextEncounter, "the ordinary encounter schedule must keep the offline RNG stream");
  assert.equal(actual.encountersEnabled, expected.encountersEnabled);
  assert.deepEqual(
    actual.objects.filter(object => !COOP_ONLY_TYPES.has(object.type)).map(ordinaryObject),
    expected.objects.map(ordinaryObject),
    "ordinary chests, exits and encounter objects must be unchanged",
  );
  assert.deepEqual(actual.decorations, expected.decorations, "ordinary map pickups and props must be unchanged");
  assert.equal(actual.objects.some(object => object.onlineAdded || object.rare || COOP_ONLY_TYPES.has(object.type)), false);
}

function assertSoloFeaturesStopped(room) {
  const { expedition } = room;
  assert.equal(expedition.coop.enabled, false);
  assert.equal(expedition.coop.gimmickType, null);
  assert.equal(expedition.coop.partySize, 1);
  assert.equal(expedition.coop.participantTier, "solo");
  assert.equal(expedition.coop.resonance, null, "solo online must not create a resonance meter");
  assert.equal(room.coopRun.resonance, null, "solo online must not accumulate run resonance");
  assert.equal(expedition.coop.rare?.kind ?? null, null, "forced or random co-op-only draws must stay disabled");
  assert.equal(expedition.objects.some(object => object.onlineAdded), false, "solo online must not add encounter markers");
  assert.deepEqual(coopParticipantTier(1), {
    id: "solo",
    label: "通常探索",
    rank: 0,
    multiplier: 1,
    extraRolls: 0,
  });
  assert.equal(coopRewardTier(expedition.floor, 1).multiplier, 1, "the one-player count must not multiply rewards");
}

test("build243 one-player online uses the exact offline floor and disables every co-op overlay", () => {
  const floor = 7, firstSeed = 987_654_321, nextSeed = 12345;
  const { store, session, room } = createSoloRoom({ floor });
  const started = store.startExpedition(session, {
    forceRare: "hiddenPortal",
    hostWorld: {
      floorSeeds: { [floor]: firstSeed, [floor + 1]: nextSeed },
      openedChestIds: { [floor]: [], [floor + 1]: [] },
    },
  });
  assert.equal(started.ok, true);
  assert.equal(room.phase, "expedition");

  assertOrdinaryFloorParity(
    room.expedition,
    offlineFloor({ ownerId: session.playerId, floor, seed: firstSeed, now: 42_000 }),
    firstSeed,
  );
  assertSoloFeaturesStopped(room);

  room.expedition.encountersEnabled = false;
  room.expedition.exitReached = true;
  session.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  store._updateStairGathering(room);
  const advanced = store._advanceExpeditionFloor(room);
  assert.equal(advanced.ok, true);
  assert.equal(advanced.advanced, true);
  assert.equal(room.expedition.floor, floor + 1);

  assertOrdinaryFloorParity(
    room.expedition,
    offlineFloor({ ownerId: session.playerId, floor: floor + 1, seed: nextSeed, now: 42_000 }),
    nextSeed,
  );
  assertSoloFeaturesStopped(room);

  const clear = session.pendingRewards.find(entry => entry.source?.kind === "floorClear");
  assert.ok(clear);
  assert.deepEqual(clear.reward, { leaderFloorUnlock: floor + 1 }, "solo floor clear must not contain a party reward bonus");
});

test("build243 solo chest rewards stay on the offline reward path without a personal co-op draw", () => {
  const floor = 7, seed = 987_654_321;
  const { store, session, room } = createSoloRoom({ floor });
  assert.equal(store.startExpedition(session, {
    hostWorld: { floorSeeds: { [floor]: seed }, openedChestIds: { [floor]: [] } },
  }).ok, true);

  const chest = room.expedition.objects.find(object => object.type === "chest" && !object.locked && !object.mimic);
  assert.ok(chest, "fixture seed must contain an ordinary chest");
  const rewardRolls = [.6, .25, .4, .2, .8];
  const rewardRandom = () => rewardRolls.shift() ?? .5;
  store.random = rewardRandom;
  const expected = store._offlineChestReward(floor, chest, session);

  const replayRolls = [.6, .25, .4, .2, .8];
  store.random = () => replayRolls.shift() ?? .5;
  session.dungeonPosition = { x: chest.x, y: chest.y, facing: "down" };
  store._resolveLanding(room, session);

  const delivered = session.pendingRewards.find(entry => entry.source?.kind === "chest");
  assert.ok(delivered);
  assert.deepEqual(delivered.reward, expected, "online solo must deliver the ordinary offline chest reward unchanged");
  assert.equal(delivered.source.personalBonus, null);
  assert.equal(session.pendingRewards.some(entry => entry.reward?.coopExtraRolls), false);
  assert.equal(room.expedition.coop.rare?.kind ?? null, null);
});

test("build243 normal chest rarity uses the host's offline abyss-skill thresholds", () => {
  const { store, session, room } = createSoloRoom();
  session.profile.abyssSkillEffects.equipmentRarityBonus = 2;
  const cases = [
    [{ kind: "cabinet" }, "SSR"],
    [{ kind: "radiant" }, "LR"],
    [{ kind: "radiant", locked: true }, "LR"],
  ];
  for (const [chest, expectedRarity] of cases) {
    store.random = () => chest.locked ? .34 : .44;
    assert.equal(store._offlineChestReward(7, chest, session).randomEquipmentRarity, expectedRarity);
  }

  store.random = () => .44;
  assert.equal(store._offlineChestReward(7, { kind: "cabinet" }).randomEquipmentRarity, "SR", "without the host profile, the offline base threshold remains unchanged");
  store.random = () => .34;
  assert.equal(store._offlineChestReward(7, { kind: "radiant", locked: true }).randomEquipmentRarity, "SSR");

  assert.equal(store.startExpedition(session, { hostWorld: { floorSeeds: { 7: 24307 }, openedChestIds: { 7: [] } } }).ok, true);
  const chest = room.expedition.objects.find(object => object.type === "chest");
  assert.ok(chest);
  Object.assign(chest, { kind: "cabinet", locked: false, mimic: false, resolved: false, hidden: false });
  session.profile.abyssSkillEffects.equipmentRarityBonus = 2;
  const rewardRolls = [.44, 0, .5];
  store.random = () => rewardRolls.shift() ?? .5;
  session.dungeonPosition = { x: chest.x, y: chest.y, facing: "down" };
  store._resolveLanding(room, session);
  const delivered = session.pendingRewards.find(entry => entry.source?.kind === "chest");
  assert.equal(delivered?.reward?.randomEquipmentRarity, "SSR", "the authoritative chest settlement must pass the host profile into the offline roll");

  session.profile.abyssSkillEffects.equipmentRarityBonus = 99;
  store.random = () => .80;
  assert.equal(store._offlineChestReward(7, { kind: "radiant", locked: true }, session).randomEquipmentRarity, "SSR", "locked chest LR chance keeps the offline 75% cap");
  assert.equal(store._offlineChestReward(7, { kind: "radiant" }, session).randomEquipmentRarity, "LR", "radiant chest LR chance keeps the offline 85% cap");
  assert.equal(store._offlineChestReward(7, { kind: "cabinet" }, session).randomEquipmentRarity, "SSR", "cabinet SSR chance keeps the offline 90% cap");
});
