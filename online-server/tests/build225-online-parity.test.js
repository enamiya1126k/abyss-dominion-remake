import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function join(store, index, overrides = {}) {
  const conn = connection();
  const result = store.hello(conn, {
    friendId: `AD-PZ25-AA${"BCDE"[index - 1]}A`,
    clientKey: `build225-parity-key-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `Parity-${index}`,
      monsterId: `monster-${index}`,
      speciesId: "slime",
      maxFloor: 9,
      currentHp: 640,
      currentMp: 31,
      abyssKeyStock: 0,
      captureStock: 2,
      battleStats: { hp: 1_000, mp: 80, atk: 400, matk: 350, def: 220, mdef: 210, spd: 90, crit: 5, evasion: 3, accuracy: 100 },
      ...overrides,
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session, result };
}

function appearingSecretRun(floor) {
  for (let seed = 1; seed < 10_000; seed++) {
    let value = (seed ^ (floor * 2654435761)) >>> 0;
    value ^= value >>> 16; value = Math.imul(value, 2246822507); value ^= value >>> 13; value = Math.imul(value, 3266489909); value ^= value >>> 16;
    value = (value * 1664525 + 1013904223) >>> 0;
    if (value / 4294967296 < .09) return { id: "online-secret-run", seed };
  }
  throw new Error("expected a secret-room seed");
}

function soloRoom({ now = () => 10_000, random = () => .4, profile = {}, floor = 1 } = {}) {
  const store = new RoomStore({ now, random, randomRoomCode: () => "PAR225" });
  const player = join(store, 1, profile), created = store.createRoom(player.session);
  assert.equal(store.setFloor(player.session, floor).ok, true);
  assert.equal(store.setReady(player.session, true).ok, true);
  return { store, player, room: store.rooms.get(created.room.roomId) };
}

test("build225 solo online starts atomically from current vitals and has no co-op-only overlay", () => {
  const { store, player, room } = soloRoom();
  const refreshed = { ...player.session.profile, currentHp: 321, currentMp: 12, abyssKeyStock: 1 };
  const started = store.startExpedition(player.session, {
    profile: refreshed,
    forceRare: "hiddenPortal",
    hostWorld: { revision: 7, floorSeeds: { 1: 12345, 2: 22222 }, openedChestIds: { 1: [], 2: ["2-0"] } },
  });
  assert.equal(started.ok, true, "ready must survive the atomic profile refresh used by the real UI");
  assert.equal(room.expedition.coop.enabled, false);
  assert.equal(room.expedition.coop.gimmickType, null);
  assert.equal(room.expedition.coop.rare.kind, null);
  assert.equal(room.expedition.objects.some(object => object.id.startsWith("coop-") || object.rare), false);
  assert.deepEqual(player.session.coopVitals, { hp: 321, maxHp: 1_000, mp: 12, maxMp: 80 });
  const vitals = player.conn.messages.findLast(message => message.type === "expeditionVitals");
  assert.match(vitals.mutationId, new RegExp(`^${room.expedition.id}:`));
  assert.equal(vitals.hp, 321);
  assert.deepEqual(Object.keys(started.room.hostWorld.floorSeeds), ["1"], "room snapshots only expose the active host floor");

  store._startBattle(room, { id: "solo-random", type: "encounter", ...player.session.dungeonPosition, resolved: true });
  assert.equal(room.expedition.battle.players[player.session.playerId].itemCharges, 0, "solo online does not receive a free co-op medicine");
});

test("build225 a run-earned host key immediately opens a locked mimic and is accounted exactly once", () => {
  const { store, player, room } = soloRoom({ random: () => .2 });
  assert.equal(store.startExpedition(player.session, { hostWorld: { floorSeeds: { 1: 77 }, openedChestIds: {} } }).ok, true);
  const position = { ...player.session.dungeonPosition }, chest = { id: "1-0", hostChestKey: "1-0", type: "chest", ...position, kind: "radiant", locked: true, mimic: true, resolved: false };
  room.expedition.decorations = room.expedition.decorations.filter(entry => entry.x !== position.x || entry.y !== position.y);
  room.expedition.objects = room.expedition.objects.filter(entry => entry.type === "exit");
  room.expedition.objects.push(chest);
  room.hostKeyStock = 0;
  store._resolveLanding(room, player.session);
  assert.equal(chest.resolved, false);
  assert.equal(room.expedition.battle, null);

  const keyReward = {
    rewardId: `${room.expedition.id}:battle-key-fixture`,
    reward: { abyssKeys: 1 },
    source: { kind: "battle", floor: 1, title: "探索戦闘勝利" },
  };
  store._queueReward(player.session, keyReward);
  store._queueReward(player.session, keyReward);
  assert.equal(room.hostKeyStock, 1, "the owner's queued key reward updates the live host inventory exactly once");
  store._resolveLanding(room, player.session);
  assert.equal(chest.resolved, true);
  assert.ok(room.expedition.battle, "a mimic opens into battle only after key validation");
  assert.equal(room.hostKeyStock, 0, "the matching key-cost reward consumes the live key exactly once");
  assert.deepEqual(room.hostWorld.openedChestIds["1"], ["1-0"]);
  assert.equal(player.session.pendingRewards.filter(entry => entry.reward.abyssKeyCost === 1).length, 1);
  assert.equal(player.conn.messages.some(message => message.type === "hostWorldDelta" && message.delta?.openedChest?.chestId === "1-0"), true);
});

test("build225 exploration GOLD modifiers and equipment levels match offline reward rules", () => {
  const { store, player, room } = soloRoom({
    profile: {
      rewardModifiers: { partyGoldGain: 25 },
      abyssSkillEffects: { goldGainRate: .1, explorationRewardRate: .2 },
    },
  });
  assert.equal(store.startExpedition(player.session, { hostWorld: { floorSeeds: { 1: 91 }, openedChestIds: {} } }).ok, true);

  store._queueSharedReward207(room, {
    rewardId: `${room.expedition.id}:modified-shared-gold`,
    base: { gold: 101 },
    source: { kind: "chest", floor: 1, title: "古い木箱" },
  });
  const shared = player.session.pendingRewards.find(entry => entry.rewardId.endsWith(":modified-shared-gold:" + player.session.playerId));
  assert.equal(shared.reward.gold, 164, "abyss exploration rate is applied before the party equipment multiplier");

  const position = { ...player.session.dungeonPosition };
  room.expedition.objects = room.expedition.objects.filter(entry => entry.x !== position.x || entry.y !== position.y);
  room.expedition.decorations = room.expedition.decorations.filter(entry => entry.x !== position.x || entry.y !== position.y);
  room.expedition.decorations.push({ id: "modified-barrel", type: "barrel", ...position, used: false, destroyed: false });
  const rolls = [.1, .5];
  store.random = () => rolls.shift() ?? .5;
  store._resolveLanding(room, player.session);
  const prop = player.session.pendingRewards.find(entry => entry.source?.kind === "soloExploreProp" && entry.rewardId.includes("modified-barrel"));
  const abyssAdjusted = Math.round(prop.source.sharedBase.gold * 1.3);
  assert.equal(prop.reward.gold, Math.round(abyssAdjusted * 1.25));

  const equipmentRolls = [.59, .6, .25];
  store.random = () => equipmentRolls.shift() ?? .5;
  const equipment = store._offlineChestReward(10, { kind: "box" });
  assert.equal(equipment.randomEquipmentRarity, "R");
  assert.equal(equipment.equipmentSlot, "weapon");
  assert.equal(equipment.equipmentLevel, 108);
  assert.ok(equipment.gold > 0, "Release 200 makes ordinary boxes pay guaranteed GOLD alongside the equipment roll");
});

test("build225 host secret-room doors are repeatable, debounced and keep the run seed public", () => {
  let now = 12_000;
  const run = appearingSecretRun(7), { store, player, room } = soloRoom({ now: () => now, floor: 7, profile: { maxFloor: 9, explorePickupDone: true } });
  const started = store.startExpedition(player.session, { hostWorld: { floorSeeds: { 7: 7007 }, openedChestIds: {}, secretRooms: { run } } });
  assert.equal(started.ok, true);
  assert.deepEqual(started.room.hostWorld.secretRooms.run, run);
  const door = room.expedition.objects.find(object => object.type === "secretRoom");
  assert.ok(door);
  player.session.dungeonPosition = { x: door.x, y: door.y, facing: "up" };
  store._resolveLanding(room, player.session);
  store._resolveLanding(room, player.session);
  assert.equal(door.resolved, false, "entering never consumes the reusable door");
  assert.equal(player.conn.messages.filter(message => message.type === "secretRoomEntered").length, 1, "duplicate landing packets are debounced");
  now += 1_001;
  store._resolveLanding(room, player.session);
  const entries = player.conn.messages.filter(message => message.type === "secretRoomEntered");
  assert.equal(entries.length, 2, "the same player may re-enter later");
  assert.deepEqual(entries.at(-1), { type: "secretRoomEntered", roomId: door.roomId, floor: 7, playerId: player.session.playerId });
});

test("build225 tutorial pickup emits its guide marker and expedition profile sync safely updates vitals", () => {
  const { store, player, room } = soloRoom({ profile: { explorePickupDone: false } });
  assert.equal(store.startExpedition(player.session, { hostWorld: { floorSeeds: { 1: 111 }, openedChestIds: {}, secretRooms: { run: { id: "guide-run", seed: 1 } } } }).ok, true);
  const pickup = room.expedition.decorations.find(entry => entry.id === "1-guide-first-pickup");
  assert.ok(pickup);
  player.session.dungeonPosition = { x: pickup.x, y: pickup.y, facing: "down" };
  store._resolveLanding(room, player.session);
  assert.ok(player.conn.messages.some(message => message.type === "expeditionEvent" && message.event?.tutorialGuide === "firstPickup"));
  assert.ok(player.session.pendingRewards.some(entry => entry.source?.kind === "soloExploreProp" && entry.reward.crystals === 1));

  player.session.ready = true;
  const synced = store.expeditionProfileSync(player.session, {
    ...player.session.profile,
    explorePickupDone: true,
    battleStats: { ...player.session.profile.battleStats, hp: 500, mp: 40 },
    currentHp: 99_999,
    currentMp: -50,
  });
  assert.equal(synced.ok, true);
  assert.equal(player.session.ready, true, "secret-room profile sync does not alter readiness");
  assert.equal(player.session.profile.explorePickupDone, true);
  assert.equal(player.session.profile.battleStats.hp, 1_000, "an active run keeps its entry HP stat");
  assert.equal(player.session.profile.battleStats.mp, 80, "an active run keeps its entry MP stat");
  assert.deepEqual(player.session.coopVitals, { hp: 500, maxHp: 1_000, mp: 0, maxMp: 80 });
  assert.ok(player.conn.messages.some(message => message.type === "expeditionVitals" && message.reason === "profileSync" && message.hp === 500 && message.mp === 0));
});

test("build225 disconnected owner receives bounded host, battle and final-vitals mutations on reconnect", () => {
  const store = new RoomStore({ now: () => 20_000, random: () => .3, randomRoomCode: () => "PEND25" });
  const owner = join(store, 1), helper = join(store, 2), created = store.createRoom(owner.session), room = store.rooms.get(created.room.roomId);
  assert.equal(store.joinRoom(helper.session, created.room.roomId).ok, true);
  assert.equal(store.setFloor(owner.session, 1).ok, true);
  assert.equal(store.setReady(owner.session, true).ok, true);
  assert.equal(store.setReady(helper.session, true).ok, true);
  assert.equal(store.startExpedition(owner.session, { hostWorld: { floorSeeds: { 1: 88 }, openedChestIds: {} } }).ok, true);
  store.disconnect(owner.session, owner.conn);

  const position = { ...helper.session.dungeonPosition }, chest = { id: "1-0", hostChestKey: "1-0", type: "chest", ...position, kind: "box", locked: false, mimic: false, resolved: false };
  room.expedition.decorations = room.expedition.decorations.filter(entry => entry.x !== position.x || entry.y !== position.y);
  room.expedition.objects = room.expedition.objects.filter(entry => entry.type === "exit");
  room.expedition.objects.push(chest);
  store._resolveLanding(room, helper.session);
  store._startBattle(room, { id: "pending-battle", type: "encounter", ...position, resolved: true });
  const battle = room.expedition.battle;
  battle.enemies.forEach(enemy => { enemy.hp = 0; });
  store._finishBattleVictory(room, battle);
  store._finishExpedition(room, { completed: false, reason: "return" });

  assert.ok(owner.session.pendingMessages.some(message => message.type === "hostWorldDelta"));
  assert.ok(owner.session.pendingMessages.some(message => message.type === "battleDefeated"));
  const finalVitals = owner.session.pendingMessages.find(message => message.type === "expeditionVitals");
  assert.equal(finalVitals.reason, "expeditionEnd");
  assert.ok(owner.session.pendingMessages.filter(message => message.type === "hostWorldDelta").length <= 256);
  assert.ok(owner.session.pendingMessages.filter(message => message.type === "battleDefeated").length <= 64);

  const replacement = connection();
  const resumed = store.hello(replacement, { friendId: owner.session.playerId, clientKey: owner.session.clientKey, resumeToken: owner.result.resumeToken, profile: owner.session.profile });
  assert.equal(resumed.ok, true);
  store.deliverPendingRewards(owner.session);
  assert.ok(replacement.messages.some(message => message.type === "hostWorldDelta"));
  assert.ok(replacement.messages.some(message => message.type === "battleDefeated"));
  assert.ok(replacement.messages.some(message => message.type === "expeditionVitals" && message.reason === "expeditionEnd"));
});

test("build225 solo stairs unlock only the owner's next floor without a co-op resource bonus", () => {
  let now = 30_000;
  const { store, player, room } = soloRoom({ now: () => now });
  assert.equal(store.startExpedition(player.session, { hostWorld: { floorSeeds: { 1: 101 }, openedChestIds: {} } }).ok, true);
  room.expedition.encountersEnabled = false;
  room.expedition.exitReached = true;
  player.session.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  store._updateStairGathering(room);
  store.advanceBattles();
  assert.equal(room.expedition.floor, 2);
  const clear = player.session.pendingRewards.find(entry => entry.source?.kind === "floorClear");
  assert.equal(clear.reward.leaderFloorUnlock, 2);
  assert.equal(clear.reward.gold, undefined);
  assert.equal(clear.reward.crystals, undefined);
  assert.equal(player.session.pendingRewards.some(entry => entry.source?.kind === "completion"), false);
});

test("build225 imports the owner's raid world, retains cumulative contribution, and never transfers it on owner exit", () => {
  const { store, player, room } = soloRoom({ now: () => 40_000 });
  assert.equal(store.startRaid(player.session, { raidWorld: { campaignId: "saved-campaign", maxHp: 50_000, hp: 12_345, attempts: 3, totalDamage: 37_655, milestonesClaimed: [5, 10, 999], contribution: { [player.session.playerId]: { damage: 2_000, healing: 50 } } } }).ok, true);
  assert.equal(room.raid.progress.campaignId, "saved-campaign");
  assert.equal(room.raid.progress.hp, 12_345);
  assert.equal(room.raid.progress.attempts, 4);
  assert.equal(room.raid.contribution[player.session.playerId].damage, 2_000);
  assert.deepEqual(room.raid.progress.milestonesClaimed, [5, 10]);
  assert.ok(player.conn.messages.some(message => message.type === "raidWorldState" && message.raidWorld?.contribution?.[player.session.playerId]?.damage === 2_000));
  room.raid.progress.hp = 11_111;
  room.raid.boss.hp = 11_111;
  store.leaveRoom(player.session);
  assert.equal(store.raidProgressByOwner.get(player.session.playerId)?.hp, 11_111);
});

test("build225 team medicine targets an ally instead of being rewritten to an enemy", () => {
  const store = new RoomStore({ now: () => 50_000, random: () => .5, randomRoomCode: () => "ITEM25" });
  const first = join(store, 1), second = join(store, 2), created = store.createRoom(first.session), room = store.rooms.get(created.room.roomId);
  assert.equal(store.joinRoom(second.session, created.room.roomId).ok, true);
  assert.equal(store.setTeamSide(first.session, "sun").ok, true);
  assert.equal(store.setTeamSide(second.session, "moon").ok, true);
  assert.equal(store.setTeamReady(first.session, true).ok, true);
  assert.equal(store.setTeamReady(second.session, true).ok, true);
  assert.equal(store.startTeamBattle(first.session).ok, true);
  room.teamBattle.players[first.session.playerId].hp = 100;
  assert.equal(store.submitTeamAction(first.session, { kind: "item", targetId: first.session.playerId }).ok, true);
  assert.equal(room.teamBattle.actions[first.session.playerId].targetId, first.session.playerId);
});
