import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";
import { createSoloStyleDungeon } from "../src/OfflineDungeonRules.js";
import { COOP_GIMMICK_TYPES, coopGimmickFor } from "../src/CoopGimmicks.js";
import { prepareOnlineExpansionV208 } from "../src/OnlineExpansion208.js";

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

function join(store, index, overrides = {}) {
  const conn = connection();
  const suffix = String.fromCharCode(65 + index);
  const result = store.hello(conn, {
    friendId: `AD-MPAX-TES${suffix}`,
    clientKey: `build244-multiplayer-parity-${index}`.padEnd(32, "x"),
    profile: {
      displayName: index === 0 ? "World owner" : `Guest ${index}`,
      monsterId: `build244-monster-${index}`,
      speciesId: "slime",
      maxFloor: index === 0 ? 50 : 1,
      currentHp: 500 - index * 50,
      currentMp: 40 - index * 5,
      explorePickupDone: true,
      battleStats: {
        hp: 500,
        mp: 40,
        atk: 260,
        matk: 230,
        def: 180,
        mdef: 170,
        spd: 90,
        crit: 5,
        evasion: 3,
        accuracy: 100,
      },
      ...overrides,
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session, result };
}

function startRoom({ players = 2, floor = 7, seed = 244_007, nextSeed = 244_008, forceRare = null, profiles = [] } = {}) {
  let now = 244_000;
  const store = new RoomStore({
    now: () => now,
    random: () => .47,
    randomRoomCode: () => "MP244X",
  });
  const members = Array.from({ length: players }, (_, index) => join(store, index, profiles[index]));
  const created = store.createRoom(members[0].session);
  assert.equal(created.ok, true);
  const room = store.rooms.get(created.room.roomId);
  for (const member of members.slice(1)) assert.equal(store.joinRoom(member.session, room.roomId).ok, true);
  assert.equal(store.setFloor(members[0].session, floor).ok, true);
  for (const member of members) assert.equal(store.setReady(member.session, true).ok, true);
  const started = store.startExpedition(members[0].session, {
    forceRare,
    hostWorld: {
      floorSeeds: { [floor]: seed, [floor + 1]: nextSeed },
      openedChestIds: { [floor]: [], [floor + 1]: [] },
      defeatedBossFloors: [],
      claimedBossRewardFloors: [],
    },
  });
  assert.equal(started.ok, true);
  return {
    store,
    members,
    room,
    now: () => now,
    advanceTime(ms) { now += ms; },
  };
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

function isCoopOnlyObject(object) {
  return Boolean(
    object.onlineAdded
    || object.rare
    || COOP_ONLY_TYPES.has(object.type)
    || String(object.id ?? "").startsWith("coop-")
    || String(object.id ?? "").startsWith("rare-"),
  );
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

function assertOrdinaryFloorUnchanged(actual, expected, seed) {
  assert.equal(actual.offlineSeed, seed);
  assert.equal(actual.floor, expected.floor);
  assert.equal(actual.cols, expected.cols);
  assert.equal(actual.rows, expected.rows);
  assert.deepEqual(actual.tiles, expected.tiles, "co-op must reuse the host's ordinary tile map");
  assert.deepEqual(actual.start, expected.start);
  assert.deepEqual(actual.exit, expected.exit);
  assert.equal(actual.treasureRoom, expected.treasureRoom);
  assert.equal(actual.nextEncounter, expected.nextEncounter, "co-op additions must not consume the ordinary encounter RNG stream");
  assert.equal(actual.encountersEnabled, expected.encountersEnabled);
  assert.equal(
    actual.objects.some(object => object.type === "encounter" && object.onlineAdded),
    false,
    "multiplayer must not inject extra ordinary enemies",
  );
  for (const type of ["encounter", "chest", "exit"]) {
    assert.equal(
      actual.objects.filter(object => object.type === type).length,
      expected.objects.filter(object => object.type === type).length,
      `the ordinary ${type} count must match the host's offline floor`,
    );
  }
  assert.deepEqual(
    actual.objects.filter(object => !isCoopOnlyObject(object)).map(ordinaryObject),
    expected.objects.map(ordinaryObject),
    "ordinary exits, enemies and chests must stay byte-for-byte equivalent after projection",
  );
  assert.deepEqual(actual.decorations, expected.decorations, "ordinary pickups and props must stay unchanged");
}

function optionalFeatureKinds(expedition) {
  return [expedition.coop?.gimmickType, expedition.coop?.rare?.kind].filter(Boolean);
}

test("build244 two-player exploration preserves the host floor and adds at most one optional co-op feature", () => {
  const floor = 7, seed = 987_654_321;
  const { members: [owner], room, now } = startRoom({ floor, seed, forceRare: "hiddenPortal" });
  const expected = offlineFloor({ ownerId: owner.session.playerId, floor, seed, now: now() });

  assertOrdinaryFloorUnchanged(room.expedition, expected, seed);
  assert.equal(room.expedition.coop.enabled, true);
  assert.equal(room.expedition.coop.partySize, 2);
  assert.equal(room.expedition.coop.rare?.kind ?? null, null, "rare content must not become a second co-op feature");
  assert.equal(optionalFeatureKinds(room.expedition).length, 1, "a floor may expose exactly one logical optional co-op feature");
  const optionalObjects = room.expedition.objects.filter(isCoopOnlyObject);
  assert.ok(optionalObjects.length > 0, "a non-boss multiplayer floor should add an optional co-op object");
  assert.deepEqual([...new Set(optionalObjects.map(object => object.gimmickType))], [room.expedition.coop.gimmickType]);
  for (const object of optionalObjects) {
    assert.equal(object.coopOnly, true);
    assert.equal(object.optional, true);
    assert.equal(object.nonBlocking, true);
    assert.equal(object.onlineAdded, true);
  }
  assert.equal(
    room.expedition.objects.some(object => isCoopOnlyObject(object) && object.x === room.expedition.exit.x && object.y === room.expedition.exit.y),
    false,
    "an optional co-op object must never cover the ordinary exit",
  );
  const ordinaryOccupied = new Set([
    `${room.expedition.start.x},${room.expedition.start.y}`,
    `${room.expedition.exit.x},${room.expedition.exit.y}`,
    ...room.expedition.objects.filter(object => !isCoopOnlyObject(object)).map(object => `${object.x},${object.y}`),
    ...(room.expedition.decorations ?? []).map(object => `${object.x},${object.y}`),
  ]);
  for (const object of optionalObjects) {
    assert.equal(ordinaryOccupied.has(`${object.x},${object.y}`), false, "optional objects must not cover ordinary objects or decorations");
  }
});

test("build244 every gimmick avoids ordinary objects, decorations, start and exit across floor seeds", () => {
  const found = new Set();
  for (let floor = 1; floor <= 600 && found.size < COOP_GIMMICK_TYPES.length; floor++) {
    if (floor % 10 === 0) continue;
    const ownerId = `build244-placement-${floor}`;
    const wanted = coopGimmickFor({ leaderId: ownerId, floor });
    if (found.has(wanted)) continue;
    const source = createSoloStyleDungeon({
      roomId: ownerId,
      floor,
      runId: `build244-placement-run-${floor}`,
      now: 244_000,
      random: offlineRandom(244_000 + floor),
      chestSpawnBonus: 0,
      secretRoomRun: null,
      explorePickupDone: true,
    });
    const ordinaryOccupied = new Set([
      `${source.start.x},${source.start.y}`,
      `${source.exit.x},${source.exit.y}`,
      ...source.objects.map(object => `${object.x},${object.y}`),
      ...(source.decorations ?? []).map(object => `${object.x},${object.y}`),
    ]);
    prepareOnlineExpansionV208(source, { ownerId, hostWorld: { openedChestIds: {} }, participants: 2 });
    assert.equal(source.coop.gimmickType, wanted);
    const optional = source.objects.filter(object => object.coopOnly);
    assert.ok(optional.length > 0);
    for (const object of optional) {
      assert.equal(ordinaryOccupied.has(`${object.x},${object.y}`), false, `${wanted} overlaps host content at ${object.x},${object.y}`);
    }
    found.add(wanted);
  }
  assert.deepEqual([...found].sort(), [...COOP_GIMMICK_TYPES].sort());
});

test("build244 optional co-op content can be ignored while only the owner receives floor progression", () => {
  const floor = 7, seed = 244_707, nextSeed = 244_708;
  const { store, members: [owner, guest], room, now } = startRoom({ floor, seed, nextSeed, forceRare: "hiddenPortal" });
  const optional = room.expedition.objects.filter(isCoopOnlyObject);
  assert.ok(optional.length > 0);
  assert.ok(optional.some(object => !object.resolved), "the fixture must leave its co-op content untouched");

  guest.session.coopVitals.hp = 222;
  guest.session.coopVitals.mp = 11;
  assert.equal(store.expeditionPing(guest.session, { kind: "here" }).ok, true);
  assert.equal(room.expedition.contribution[guest.session.playerId].pings, 1);

  room.expedition.encountersEnabled = false;
  owner.session.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  guest.session.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  store._resolveLanding(room, owner.session);
  assert.equal(room.expedition.exitReached, true, "the unchanged ordinary exit remains usable");
  store._updateStairGathering(room);
  const advanced = store.completeExpedition(owner.session);

  assert.equal(advanced.ok, true);
  assert.equal(advanced.advanced, true, "unresolved optional content must not gate the ordinary stairs");
  assert.equal(room.expedition.floor, floor + 1);
  assertOrdinaryFloorUnchanged(
    room.expedition,
    offlineFloor({ ownerId: owner.session.playerId, floor: floor + 1, seed: nextSeed, now: now() }),
    nextSeed,
  );

  const ownerClear = owner.session.pendingRewards.find(entry => entry.source?.kind === "floorClear" && entry.source.floor === floor);
  const guestClear = guest.session.pendingRewards.find(entry => entry.source?.kind === "floorAssist" && entry.source.floor === floor);
  assert.ok(ownerClear);
  assert.ok(guestClear, "the guest receives their own assistance reward");
  assert.equal(ownerClear.reward.leaderFloorUnlock, floor + 1);
  assert.equal(Object.hasOwn(guestClear.reward, "leaderFloorUnlock"), false, "the guest receives no progression-shaped unlock field");
  assert.equal(Object.hasOwn(guestClear.source, "leaderFloorUnlock"), false);
  assert.equal(ownerClear.source.worldOwnerId, owner.session.playerId);
  assert.equal(guestClear.source.worldOwnerId, owner.session.playerId);
  assert.equal(guest.session.profile.maxFloor, 1, "server-side guest progression remains untouched");
  assert.deepEqual(guest.session.coopVitals, { hp: 222, maxHp: 500, mp: 11, maxMp: 40 }, "the guest keeps their own HP and MP across floors");
  assert.equal(room.expedition.contribution[guest.session.playerId].pings, 1, "the guest's contribution follows the run without becoming host progression");
  assert.ok(guest.session.pendingMessages.some(message => message.type === "expeditionVitals" && message.reason === "floorAdvance" && message.hp === 222 && message.mp === 11));
  assert.ok(optional.some(object => !object.resolved), "the previous floor advanced while its optional feature was still unresolved");

  const returned = store.requestReturn(owner.session);
  assert.equal(returned.ok, true);
  assert.equal(returned.ended, true);
  const guestResult = guest.session.pendingMessages.findLast(message => message.type === "expeditionResult");
  assert.equal(guestResult.recipientId, guest.session.playerId);
  assert.equal(guestResult.ownerId, owner.session.playerId);
  assert.equal(guestResult.progressionEligible, false);
  assert.equal(Object.hasOwn(guestResult, "startFloor"), false);
  assert.equal(Object.hasOwn(guestResult, "endFloor"), false);
  assert.equal(Object.hasOwn(guestResult, "floorsCleared"), false);
  assert.deepEqual(guestResult.assistedWorld, { ownerId: owner.session.playerId, startFloor: floor, endFloor: floor + 1, floorsCleared: 1 });
  assert.equal(guestResult.multiplayer, true);
  assert.equal(guestResult.finalVitals.reason, "expeditionEnd");
  assert.equal(guestResult.finalVitals.hp, 222);
  assert.equal(guestResult.finalVitals.mp, 11);
  assert.equal(guestResult.summary.ranking.find(entry => entry.playerId === guest.session.playerId).pings, 1);
  assert.equal(guest.session.profile.maxFloor, 1);
});

test("build244 boss floors add no optional co-op feature and write first-clear state only to the owner", () => {
  const floor = 10;
  const { store, members: [owner, guest], room } = startRoom({ floor, seed: 244_010, nextSeed: 244_011, forceRare: "hiddenPortal" });

  assert.equal(room.expedition.coop.enabled, true);
  assert.equal(room.expedition.coop.gimmickType, null);
  assert.equal(room.expedition.coop.rare?.kind ?? null, null);
  assert.equal(room.expedition.objects.some(isCoopOnlyObject), false, "boss floors keep the ordinary boss route free from optional co-op content");

  const boss = room.expedition.objects.find(object => object.type === "floorBoss");
  assert.ok(boss);
  store._startBattle(room, boss);
  const battle = room.expedition.battle;
  assert.ok(battle?.floorBoss);
  battle.players[owner.session.playerId].hp = 321;
  battle.players[owner.session.playerId].mp = 22;
  battle.players[guest.session.playerId].hp = 234;
  battle.players[guest.session.playerId].mp = 13;
  for (const enemy of battle.enemies) enemy.hp = 0;
  store._finishBattleVictory(room, battle);

  assert.deepEqual(room.hostWorld.defeatedBossFloors, [floor]);
  const ownerFirstClear = owner.session.pendingRewards.find(entry => entry.source?.kind === "floorBoss" && entry.source?.bossFirstClear);
  assert.ok(ownerFirstClear, "the owner receives the first-clear choice contract");
  assert.equal(ownerFirstClear.source.worldOwnerId, owner.session.playerId);
  assert.equal(guest.session.pendingRewards.some(entry => entry.source?.kind === "floorBoss" && entry.source?.bossFirstClear), false, "the guest must not receive the owner's first-clear state");
  assert.ok(owner.session.pendingMessages.some(message => message.type === "hostWorldDelta" && message.delta?.defeatedBoss?.floor === floor));
  assert.equal(guest.session.pendingMessages.some(message => message.type === "hostWorldDelta" && message.delta?.defeatedBoss?.floor === floor), false);
  assert.ok(owner.session.pendingRewards.some(entry => entry.source?.kind === "battle"));
  assert.ok(guest.session.pendingRewards.some(entry => entry.source?.kind === "battle"), "the guest still receives their personal battle reward");
  const ownerDefeated = owner.session.pendingMessages.find(message => message.type === "battleDefeated" && message.floor === floor);
  const guestDefeated = guest.session.pendingMessages.find(message => message.type === "battleDefeated" && message.floor === floor);
  assert.equal(ownerDefeated?.floorBoss, true);
  assert.equal(ownerDefeated?.worldOwnerId, owner.session.playerId);
  assert.equal(ownerDefeated?.progressionEligible, true, "only the world owner may count the floor boss toward normal progression");
  assert.equal(guestDefeated, undefined, "a guest never receives a progression-shaped boss receipt");
  assert.deepEqual(owner.session.coopVitals, { hp: 321, maxHp: 500, mp: 22, maxMp: 40 });
  assert.deepEqual(guest.session.coopVitals, { hp: 234, maxHp: 500, mp: 13, maxMp: 40 });

  room.expedition.encountersEnabled = false;
  owner.session.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  guest.session.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  store._resolveLanding(room, owner.session);
  assert.equal(room.expedition.exitReached, true);
  store._updateStairGathering(room);
  const advanced = store.completeExpedition(owner.session);
  assert.equal(advanced.ok, true);
  assert.equal(advanced.advanced, true);
  const ownerClear = owner.session.pendingRewards.find(entry => entry.source?.kind === "floorClear" && entry.source.floor === floor);
  const guestClear = guest.session.pendingRewards.find(entry => entry.source?.kind === "floorAssist" && entry.source.floor === floor);
  assert.equal(ownerClear.reward.leaderFloorUnlock, floor + 1);
  assert.equal(Object.hasOwn(guestClear.reward, "leaderFloorUnlock"), false);
  assert.equal(Object.hasOwn(guestClear.source, "leaderFloorUnlock"), false);
  assert.equal(guestClear.source.bossAssist, true);
  assert.equal(guest.session.profile.maxFloor, 1);
});

test("build244 ordinary multiplayer battle receipts remain personal without transferring world ownership", () => {
  const floor = 7;
  const { store, members: [owner, guest], room } = startRoom({ floor, seed: 244_207 });
  store._startBattle(room, {
    id: "build244-ordinary-encounter",
    type: "encounter",
    ...guest.session.dungeonPosition,
    resolved: true,
  });
  const battle = room.expedition.battle;
  assert.ok(battle);
  for (const enemy of battle.enemies) enemy.hp = 0;
  store._finishBattleVictory(room, battle);

  const ownerDefeated = owner.session.pendingMessages.find(message => message.type === "battleDefeated" && message.floor === floor);
  assert.equal(ownerDefeated?.floorBoss, false);
  assert.equal(ownerDefeated?.worldOwnerId, owner.session.playerId);
  assert.equal(ownerDefeated?.progressionEligible, true);
  assert.equal(guest.session.pendingMessages.some(message => message.type === "battleDefeated" && message.floor === floor), false, "guest progression receipts are physically absent");
  for (const member of [owner, guest]) assert.ok(member.session.pendingRewards.some(entry => entry.source?.kind === "battle"));
  assert.deepEqual(room.hostWorld.defeatedBossFloors, [], "an ordinary guest battle cannot mutate the owner's boss state");
});

test("build244 a co-op strong enemy is explicitly not a normal floor boss progression receipt", () => {
  const floor = 7;
  const { store, members: [owner, guest], room } = startRoom({ floor, seed: 244_257 });
  store._startBattle(room, {
    id: "build244-coop-strong-enemy",
    type: "coopElite",
    coopElite: true,
    ...guest.session.dungeonPosition,
    resolved: true,
  });
  const battle = room.expedition.battle;
  assert.ok(battle?.coopBoss);
  for (const enemy of battle.enemies) enemy.hp = 0;
  store._finishBattleVictory(room, battle);

  const ownerDefeated = owner.session.pendingMessages.find(message => message.type === "battleDefeated" && message.floor === floor);
  assert.equal(ownerDefeated?.floorBoss, false, "the client progression gate must never classify a co-op strong enemy as a floor boss");
  assert.equal(ownerDefeated?.boss, true);
  assert.equal(ownerDefeated?.worldOwnerId, owner.session.playerId);
  assert.equal(ownerDefeated?.progressionEligible, true);
  assert.equal(guest.session.pendingMessages.some(message => message.type === "battleDefeated" && message.floor === floor), false, "guest progression receipts are physically absent");
  for (const member of [owner, guest]) assert.ok(member.session.pendingRewards.some(entry => entry.source?.kind === "coopBoss"));
  assert.deepEqual(room.hostWorld.defeatedBossFloors, []);
  assert.equal(owner.session.pendingRewards.some(entry => entry.source?.bossFirstClear), false);
  assert.equal(guest.session.pendingRewards.some(entry => entry.source?.bossFirstClear), false);
});

test("build244 a guest tutorial flag cannot alter the owner's next ordinary floor", () => {
  const floor = 7, nextFloor = floor + 1, nextSeed = 244_308;
  const { store, members: [owner, guest], room, now } = startRoom({
    floor,
    seed: 244_307,
    nextSeed,
    profiles: [
      { explorePickupDone: true },
      { explorePickupDone: false },
    ],
  });
  assert.equal(owner.session.profile.explorePickupDone, true);
  assert.equal(guest.session.profile.explorePickupDone, false);

  room.expedition.encountersEnabled = false;
  owner.session.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  guest.session.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  store._resolveLanding(room, owner.session);
  store._updateStairGathering(room);
  assert.equal(store.completeExpedition(owner.session).advanced, true);

  const expected = offlineFloor({ ownerId: owner.session.playerId, floor: nextFloor, seed: nextSeed, now: now() });
  assertOrdinaryFloorUnchanged(room.expedition, expected, nextSeed);
  assert.equal(
    room.expedition.decorations.some(object => object.tutorialGuide === "firstPickup"),
    false,
    "the guest's unfinished tutorial must not inject an object into the owner's saved world",
  );
});

test("build244 a one-player room keeps every co-op reward, object and battle layer disabled", () => {
  const { store, members: [owner], room } = startRoom({ players: 1, floor: 7, seed: 244_107, forceRare: "hiddenPortal" });

  assert.equal(room.expedition.coop.enabled, false);
  assert.equal(room.expedition.coop.partySize, 1);
  assert.equal(room.expedition.coop.gimmickType, null);
  assert.equal(room.expedition.coop.resonance, null);
  assert.equal(room.expedition.coop.rare?.kind ?? null, null);
  assert.equal(room.coopRun.resonance, null);
  assert.equal(room.expedition.objects.some(isCoopOnlyObject), false);

  store._startBattle(room, {
    id: "build244-solo-encounter",
    type: "encounter",
    ...owner.session.dungeonPosition,
    resolved: true,
  });
  assert.equal(room.expedition.battle.players[owner.session.playerId].itemCharges, 0, "solo online must not receive a free co-op-only medicine");
});

test("build244 guest movement never accelerates the host's ordinary encounter clock", () => {
  const { store, members: [owner, guest], room } = startRoom({ floor: 7, seed: 244_307 });
  const expedition = room.expedition;
  const freeNeighbor = member => {
    const current = member.session.dungeonPosition;
    return [[1, 0], [0, 1], [-1, 0], [0, -1]]
      .map(([dx, dy]) => ({ x: current.x + dx, y: current.y + dy }))
      .find(point => expedition.tiles[point.y]?.[point.x] === "."
        && !expedition.objects.some(object => object.x === point.x && object.y === point.y)
        && !(expedition.decorations ?? []).some(object => object.x === point.x && object.y === point.y));
  };

  expedition.steps = 7;
  expedition.nextEncounter = 999;
  const guestNext = freeNeighbor(guest);
  assert.ok(guestNext);
  assert.equal(store.moveExpedition(guest.session, guestNext).ok, true);
  assert.equal(expedition.steps, 7, "a guest step must not advance the owner's offline encounter schedule");
  assert.equal(expedition.nextEncounter, 999);
  assert.equal(expedition.battle, null);

  const ownerNext = freeNeighbor(owner);
  assert.ok(ownerNext);
  assert.equal(store.moveExpedition(owner.session, ownerNext).ok, true);
  assert.equal(expedition.steps, 8, "the host's step advances the ordinary exploration clock once");
  assert.equal(expedition.nextEncounter, 999);
});

test("build244 optional objects never delay the host's ordinary random encounter", () => {
  const { store, members: [owner], room } = startRoom({ players: 2, floor: 7, seed: 244_407 });
  const expedition = room.expedition, optional = expedition.objects.find(isCoopOnlyObject);
  assert.ok(optional);
  owner.session.dungeonPosition = { x: optional.x, y: optional.y, facing: "down" };
  expedition.steps = 8;
  expedition.nextEncounter = 8;
  store._maybeStartSoloStyleEncounter(room, owner.session);
  assert.ok(expedition.battle, "non-blocking co-op overlays must not postpone an ordinary encounter");
  assert.match(expedition.battle.encounterId, /^random-/);
});

test("build244 shared normal-map pickup settlement is atomic and retryable", () => {
  const { store, members: [owner, guest], room } = startRoom({ floor: 7, seed: 244_507 });
  const expedition = room.expedition, point = { ...owner.session.dungeonPosition };
  expedition.objects = expedition.objects.filter(object => object.x !== point.x || object.y !== point.y);
  expedition.decorations = (expedition.decorations ?? []).filter(object => object.x !== point.x || object.y !== point.y);
  const crystal = { id: "build244-atomic-crystal", type: "crystal", ...point, used: false, destroyed: false };
  expedition.decorations.push(crystal);
  const ownerRewards = owner.session.pendingRewards.length, guestRewards = guest.session.pendingRewards.length;
  const originalSync = store._syncSettlementJournal.bind(store);
  let firstRandomCalls = 0;
  store.random = () => {
    firstRandomCalls++;
    return .5;
  };
  store._syncSettlementJournal = () => false;
  const failed = store._resolveLanding(room, owner.session);
  assert.equal(failed?.code, "SETTLEMENT_PERSISTENCE");
  assert.equal(firstRandomCalls, 1);
  assert.equal(crystal.used, false, "the pickup remains available when either recipient cannot be persisted");
  assert.equal(crystal.destroyed, false);
  assert.equal(owner.session.pendingRewards.length, ownerRewards);
  assert.equal(guest.session.pendingRewards.length, guestRewards);
  const settlementKey = `${expedition.id}:decoration:${crystal.id}:settlement`;
  const pinnedPlan = room._pendingRewardPlans.get(settlementKey);
  assert.ok(pinnedPlan, "a failed settlement keeps the exact decoration roll for retry");
  assert.deepEqual(pinnedPlan.reward, { crystals: 1 });
  assert.equal(pinnedPlan.title, "魔晶石鉱脈");
  assert.match(pinnedPlan.message, /魔晶石×1/);
  assert.equal(pinnedPlan.deliveries.length, 2);

  store._syncSettlementJournal = originalSync;
  let retryRandomCalls = 0;
  store.random = () => {
    retryRandomCalls++;
    return .01;
  };
  store._resolveLanding(room, owner.session);
  assert.equal(retryRandomCalls, 0, "retry must reuse the pinned plan instead of drawing a different reward");
  assert.equal(crystal.used, true);
  assert.equal(room._pendingRewardPlans.has(settlementKey), false, "the pinned plan is cleared only after persistence succeeds");
  assert.equal(owner.session.pendingRewards.length, ownerRewards + 1);
  assert.equal(guest.session.pendingRewards.length, guestRewards + 1);
  const ownerPickupRewards = owner.session.pendingRewards.filter(entry => entry.rewardId.includes(crystal.id));
  const guestPickupRewards = guest.session.pendingRewards.filter(entry => entry.rewardId.includes(crystal.id));
  assert.equal(ownerPickupRewards.length, 1);
  assert.equal(guestPickupRewards.length, 1);
  assert.deepEqual(ownerPickupRewards[0].reward, { crystals: 1 }, "the retry keeps the original roll even though the new RNG would yield two");
  assert.deepEqual(guestPickupRewards[0].reward, { crystals: 1 });

  store._resolveLanding(room, owner.session);
  assert.equal(owner.session.pendingRewards.filter(entry => entry.rewardId.includes(crystal.id)).length, 1, "a consumed pickup cannot award twice");
  assert.equal(guest.session.pendingRewards.filter(entry => entry.rewardId.includes(crystal.id)).length, 1);
});
