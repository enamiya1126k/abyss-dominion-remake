import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

function connection() {
  return {
    messages: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close() {},
  };
}

function hello(store, index) {
  const conn = connection();
  const result = store.hello(conn, {
    friendId: `AD-PRTY-AA${"BCDE"[index - 1]}A`,
    clientKey: `party-size-client-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `Party ${index}`,
      speciesId: "slime",
      maxFloor: 1200,
      battleStats: { hp: 10_000, mp: 500, atk: 2_500, matk: 2_000, def: 1_200, mdef: 1_200, spd: 100, crit: 5, evasion: 3 },
    },
  });
  assert.equal(result.ok, true);
  return { conn, result, session: conn.session };
}

function startRoom(count = 4, { now = () => 10_000, reconnectGraceMs = 1_000, forceRare = null } = {}) {
  const store = new RoomStore({ now, reconnectGraceMs, randomRoomCode: () => "PTY23A", random: () => .99 });
  const players = Array.from({ length: count }, (_, index) => hello(store, index + 1));
  const created = store.createRoom(players[0].session);
  for (const player of players.slice(1)) assert.equal(store.joinRoom(player.session, created.room.roomId).ok, true);
  assert.equal(store.setFloor(players[0].session, 1).ok, true);
  for (const player of players) assert.equal(store.setReady(player.session, true).ok, true);
  assert.equal(store.startExpedition(players[0].session, { hostWorld: { openedChestIds: {} }, forceRare }).ok, true);
  return { store, players, room: store.rooms.get(created.room.roomId) };
}

function assertPartyTier(room, { size, participantTier, rewardTier, enabled = size >= 2 }) {
  const coop = room.expedition.coop;
  assert.equal(room.members.size, size);
  assert.equal(coop.partySize, size);
  assert.equal(coop.enabled, enabled);
  assert.equal(coop.participantTier, participantTier);
  assert.equal(coop.rewardTier, rewardTier);
}

test("build230 formal departures lower party reward quality from four to three and two", () => {
  const { store, players, room } = startRoom();
  const expedition = room.expedition, owner = players[0].session;
  for (const object of expedition.objects) if (["resonanceChest", "deluxeChest"].includes(object.type)) object.resolved = true;
  const deluxe = { id: "lifecycle-deluxe", type: "deluxeChest", x: 5, y: 5, resolved: false, hidden: false, rewardTier: "abyss" };
  const resonance = { id: "lifecycle-resonance", type: "resonanceChest", x: 7, y: 7, resolved: false, hidden: false, rewardTier: "abyss" };
  const resolved = { id: "lifecycle-resolved", type: "deluxeChest", x: 8, y: 8, resolved: true, hidden: false, rewardTier: "abyss" };
  const rare = { id: "lifecycle-rare", type: "rarePortalChest", x: 9, y: 9, resolved: false, hidden: false, rewardTier: "abyss" };
  expedition.objects.push(deluxe, resonance, resolved, rare);
  room.coopRun.resonance = 5;
  room.coopRun.consecutiveFloors = 8;
  Object.assign(expedition.coop.resonance, { level: 5, rewardBonusPct: 15, contributionBonusPct: 10 });

  assert.equal(store.leaveRoom(players[3].session).ok, true);
  assertPartyTier(room, { size: 3, participantTier: "gold", rewardTier: "gold" });
  assert.equal(expedition.coop.participantTierLabel, "黄金共鳴");
  assert.equal(expedition.coop.rewardTierLabel, "金級");
  assert.equal(expedition.coop.rewardScaleLabel, "黒鉄級・黄金共鳴");
  assert.equal(deluxe.rewardTier, "gold");
  assert.equal(resonance.rewardTier, "gold");
  assert.equal(resolved.rewardTier, "abyss", "an already-opened chest keeps its recorded appearance");
  assert.equal(rare.rewardTier, "abyss", "the rare-realm chest is always abyss quality");
  assert.equal(room.coopRun.resonance, 0);
  assert.equal(room.coopRun.consecutiveFloors, 0);
  assert.deepEqual(expedition.coop.resonance, { level: 0, max: 5, rewardBonusPct: 0, contributionBonusPct: 0 });

  owner.dungeonPosition = { x: deluxe.x, y: deluxe.y, facing: "down" };
  assert.equal(store.expeditionInteract(owner, { action: "openDeluxeChest", targetId: deluxe.id }).ok, true);
  const threePlayerReward = owner.pendingRewards.find(entry => entry.rewardId === `${expedition.id}:deluxeChest:${owner.playerId}`);
  assert.equal(threePlayerReward?.reward.coopTier, "gold");
  assert.equal(threePlayerReward?.reward.coopExtraRolls, undefined, "three players must not retain the four-player extra roll");
  assert.match(threePlayerReward?.source.title ?? "", /金級/);

  assert.equal(store.leaveRoom(players[2].session).ok, true);
  assertPartyTier(room, { size: 2, participantTier: "silver", rewardTier: "silver" });
  assert.equal(expedition.coop.participantTierLabel, "白銀共鳴");
  assert.equal(expedition.coop.rewardTierLabel, "銀級");
  assert.equal(expedition.coop.rewardScaleLabel, "黒鉄級・白銀共鳴");
  assert.equal(resonance.rewardTier, "silver");

  owner.dungeonPosition = { x: resonance.x, y: resonance.y, facing: "down" };
  players[1].session.dungeonPosition = { x: resonance.x + 1, y: resonance.y, facing: "left" };
  assert.equal(store.expeditionInteract(owner, { action: "openResonanceChest", targetId: resonance.id }).ok, true);
  const twoPlayerReward = owner.pendingRewards.find(entry => entry.rewardId === `${expedition.id}:resonance:${owner.playerId}`);
  assert.equal(twoPlayerReward?.reward.coopTier, "silver");
  assert.equal(twoPlayerReward?.reward.coopExtraRolls, undefined);
  assert.match(twoPlayerReward?.source.title ?? "", /銀級/);
});

test("build230 disconnect grace keeps four-player quality, then expiry formally lowers it", () => {
  let now = 20_000;
  const { store, players, room } = startRoom(4, { now: () => now, reconnectGraceMs: 1_000 });
  const chest = { id: "expiry-deluxe", type: "deluxeChest", x: 5, y: 5, resolved: false, hidden: false, rewardTier: "abyss" };
  room.expedition.objects.push(chest);
  room.coopRun.resonance = 4;
  room.coopRun.consecutiveFloors = 6;
  Object.assign(room.expedition.coop.resonance, { level: 4, rewardBonusPct: 12, contributionBonusPct: 8 });

  store.disconnect(players[3].session, players[3].conn);
  assert.equal(players[3].session.connected, false);
  assertPartyTier(room, { size: 4, participantTier: "abyss", rewardTier: "abyss" });
  assert.equal(chest.rewardTier, "abyss");
  assert.equal(room.coopRun.resonance, 4);
  assert.equal(room.coopRun.consecutiveFloors, 6);
  assert.equal(room.expedition.coop.resonance.level, 4);
  assert.equal(room.expedition.coop.resonance.rewardBonusPct, 12);
  assert.equal(room.expedition.coop.resonance.contributionBonusPct, 8);

  now += 1_001;
  store.pruneExpired();
  assert.equal(store.sessions.has(players[3].session.playerId), false);
  assertPartyTier(room, { size: 3, participantTier: "gold", rewardTier: "gold" });
  assert.equal(chest.rewardTier, "gold");
  assert.equal(room.coopRun.resonance, 0);
  assert.equal(room.coopRun.consecutiveFloors, 0);
  assert.equal(room.expedition.coop.resonance.level, 0);
  assert.equal(room.expedition.coop.resonance.rewardBonusPct, 0);
  assert.equal(room.expedition.coop.resonance.contributionBonusPct, 0);
});

test("build230 a four-player run reduced to solo loses co-op bonuses and floor resonance", () => {
  const { store, players, room } = startRoom();
  const owner = players[0].session;
  for (const player of players.slice(1).reverse()) assert.equal(store.leaveRoom(player.session).ok, true);

  assertPartyTier(room, { size: 1, participantTier: "solo", rewardTier: "black-iron", enabled: false });
  assert.equal(room.expedition.coop.participantTierLabel, "通常探索");
  assert.equal(room.expedition.coop.rewardScaleLabel, "黒鉄級・通常探索");
  assert.equal(room.coopRun.resonance, 0);

  store.random = () => 0;
  store._queueSharedReward207(room, { rewardId: "solo-shared", base: { gold: 100 }, source: { kind: "test", floor: room.expedition.floor }, premium: true });
  const soloShared = owner.pendingRewards.find(entry => entry.rewardId === `solo-shared:${owner.playerId}`);
  assert.equal(soloShared?.source.personalBonus, null);
  assert.deepEqual(soloShared?.reward, { gold: 100 });

  const expeditionId = room.expedition.id;
  room.expedition.exitReached = true;
  owner.dungeonPosition = { ...room.expedition.exit, facing: "down" };
  assert.equal(store.completeExpedition(owner).ok, true);
  const floorReward = owner.pendingRewards.find(entry => entry.rewardId === `${expeditionId}:floor-clear:${owner.playerId}`);
  assert.deepEqual(floorReward?.reward, { leaderFloorUnlock: 2 }, "solo continuation must not receive a minimum two-player reward");
  assert.equal(room.coopRun.resonance, 0, "solo floor advancement must not build co-op resonance");
  assertPartyTier(room, { size: 1, participantTier: "solo", rewardTier: "black-iron", enabled: false });

  store._finishExpedition(room, { completed: true, reason: "test" });
  assert.equal(owner.pendingRewards.some(entry => entry.rewardId.includes(":completion:")), false, "solo completion must not pay a co-op completion reward");
});

test("build230 world-owner departure still ends the expedition before membership rescaling", () => {
  const { store, players, room } = startRoom(2);
  assert.equal(store.leaveRoom(players[0].session).ok, true);
  assert.equal(room.phase, "lobby");
  assert.equal(room.expedition, null);
  assert.equal(room.coopRun, null);
  assert.equal(room.members.size, 1);
});

test("build230 two-to-one removes every co-op-only interaction and rejects direct server actions", () => {
  const { store, players, room } = startRoom(2);
  const owner = players[0].session, expedition = room.expedition, point = { x: 5, y: 5 };
  const objects = [
    { id: "solo-resonance", type: "resonanceChest", ...point, resolved: false, hidden: false },
    { id: "solo-deluxe", type: "deluxeChest", ...point, resolved: false, hidden: false },
    { id: "solo-relay", type: "relaySeal", seal: "A", ...point, resolved: false, hidden: false, active: false },
    { id: "solo-key", type: "keyFragment", fragment: "cyan", ...point, resolved: false, hidden: false },
    { id: "solo-vault", type: "resonanceVault", ...point, resolved: false, hidden: false, unlocked: true },
    { id: "solo-merchant", type: "rareMerchant", ...point, resolved: false, hidden: false },
    { id: "solo-portal", type: "rarePortal", ...point, resolved: false, hidden: false },
    { id: "solo-guardian", type: "rarePortalGuardian", ...point, resolved: false, hidden: false },
    { id: "solo-rare-chest", type: "rarePortalChest", ...point, resolved: false, hidden: false, rewardTier: "abyss" },
  ];
  expedition.objects.push(...objects);
  Object.assign(expedition.coop.rare, { kind: "otherworldMerchant", resolved: false, merchantClaims: {}, portalEntered: false, realmActive: false, guardianDefeated: false });
  owner.dungeonPosition = { ...point, facing: "down" };
  const rewardsBefore = owner.pendingRewards.length, discoveriesBefore = expedition.discoveries;

  assert.equal(store.leaveRoom(players[1].session).ok, true);
  store._syncCoopInteractions(room);
  const blocked = new Set(["openResonanceChest", "waitResonanceChest", "activateRelaySeal", "waitRelayPartner", "collectKeyFragment", "waitKeyPartner", "challengeCoopBoss", "challengeCoopElite", "openDeluxeChest", "browseRareMerchant", "enterRarePortal", "challengeRareGuardian", "openRarePortalChest"]);
  assert.equal(blocked.has(expedition.interactions[owner.playerId]?.action), false);

  const attempts = [
    ["openResonanceChest", "solo-resonance"],
    ["openDeluxeChest", "solo-deluxe"],
    ["activateRelaySeal", "solo-relay"],
    ["collectKeyFragment", "solo-key"],
    ["challengeCoopBoss", "solo-vault"],
    ["browseRareMerchant", "solo-merchant"],
    ["enterRarePortal", "solo-portal"],
    ["challengeRareGuardian", "solo-guardian"],
    ["openRarePortalChest", "solo-rare-chest"],
  ];
  for (const [action, targetId] of attempts) assert.equal(store.expeditionInteract(owner, { action, targetId }).code, "NEED_PARTY", action);
  assert.equal(store.rareMerchantClaim(owner, { offer: "crystal" }).code, "NEED_PARTY");
  assert.equal(owner.pendingRewards.length, rewardsBefore);
  assert.equal(expedition.discoveries, discoveriesBefore);
  assert.equal(expedition.battle, null);
  assert.equal(objects.every(object => object.resolved === false), true);
  assert.deepEqual(expedition.coop.keyHolders, {});
  assert.equal(expedition.coop.relayStage, 0);
});

test("build230 party loss inside the rare realm returns safely without guardian or chest rewards", () => {
  const { store, players, room } = startRoom(2, { forceRare: "hiddenPortal" });
  const ownerPlayer = players[0], owner = ownerPlayer.session, expedition = room.expedition, portal = expedition.objects.find(object => object.type === "rarePortal");
  assert.ok(portal);
  for (const object of expedition.objects) if (object !== portal && object.type !== "chest") object.resolved = true;
  owner.dungeonPosition = { x: portal.x, y: portal.y, facing: "down" };
  store._syncCoopInteractions(room);
  assert.equal(store.expeditionInteract(owner, { action: "enterRarePortal", targetId: portal.id }).ok, true);
  const guardian = expedition.objects.find(object => object.type === "rarePortalGuardian"), chest = expedition.objects.find(object => object.type === "rarePortalChest"), rewardsBefore = owner.pendingRewards.length;
  assert.equal(expedition.coop.rare.realmActive, true);
  assert.ok(room._rareMainWorld);

  assert.equal(store.leaveRoom(players[1].session).ok, true);
  assert.equal(expedition.coop.rare.realmActive, false);
  assert.equal(expedition.coop.rare.resolved, true);
  assert.equal(expedition.coop.rare.abandoned, true);
  assert.equal(expedition.coop.rare.portalReturned, true);
  assert.equal(room._rareMainWorld, null);
  assert.equal(expedition.objects.find(object => object.type === "rarePortal")?.resolved, true);
  assert.equal(owner.pendingRewards.length, rewardsBefore);
  assert.equal(store.expeditionInteract(owner, { action: "challengeRareGuardian", targetId: guardian.id }).code, "NEED_PARTY");
  assert.equal(store.expeditionInteract(owner, { action: "openRarePortalChest", targetId: chest.id }).code, "NEED_PARTY");
  assert.equal(owner.pendingRewards.length, rewardsBefore);
  assert.ok(ownerPlayer.conn.messages.some(message => message.type === "expeditionEvent" && message.event?.id === `${expedition.id}:portal-party-return`));
});

test("build230 explicit leave aborts an active rare guardian battle without rewards", () => {
  const { store, players, room } = startRoom(2, { forceRare: "hiddenPortal" });
  const owner = players[0].session, expedition = room.expedition, portal = expedition.objects.find(object => object.type === "rarePortal");
  assert.ok(portal);
  owner.dungeonPosition = { x: portal.x, y: portal.y, facing: "down" };
  store._syncCoopInteractions(room);
  assert.equal(store.expeditionInteract(owner, { action: "enterRarePortal", targetId: portal.id }).ok, true);
  const guardian = expedition.objects.find(object => object.type === "rarePortalGuardian");
  assert.ok(guardian);
  owner.dungeonPosition = { x: guardian.x, y: guardian.y, facing: "down" };
  store._syncCoopInteractions(room);
  assert.equal(store.expeditionInteract(owner, { action: "challengeRareGuardian", targetId: guardian.id }).ok, true);
  assert.equal(expedition.battle?.rareKind, "portalGuardian");
  expedition.battle.players[owner.playerId].hp = 654;
  expedition.battle.players[owner.playerId].mp = 43;
  const rewardsBefore = owner.pendingRewards.length;

  assert.equal(store.leaveRoom(players[1].session).ok, true);
  assert.equal(expedition.battle, null);
  assert.equal(owner.coopVitals.hp, 654);
  assert.equal(owner.coopVitals.mp, 43);
  assert.equal(owner.pendingRewards.length, rewardsBefore);
  assert.equal(expedition.coop.rare.guardianDefeated, false);
  assert.equal(expedition.coop.rare.abandoned, true);
  assert.equal(room._rareMainWorld, null);
  assert.ok(players[0].conn.messages.some(message => message.type === "battleEnded" && message.reason === "partyChanged" && message.result === "cancelled"));
});

test("build230 disconnect grace keeps a rare battle, then expiry aborts it without rewards", () => {
  let now = 40_000;
  const { store, players, room } = startRoom(2, { now: () => now, reconnectGraceMs: 1_000, forceRare: "goldenMonster" });
  const owner = players[0].session, expedition = room.expedition, golden = expedition.objects.find(object => object.type === "rareGoldenMonster");
  assert.ok(golden);
  golden.resolved = true;
  store._startBattle(room, { ...golden, rareKind: "goldenMonster", coopElite: true });
  const battle = expedition.battle;
  assert.equal(battle?.rareKind, "goldenMonster");
  battle.players[owner.playerId].hp = 765;
  battle.players[owner.playerId].mp = 54;
  const rewardsBefore = owner.pendingRewards.length;

  store.disconnect(players[1].session, players[1].conn);
  assert.equal(expedition.battle, battle, "the disconnected player's AI remains active during grace");
  assert.equal(expedition.coop.partySize, 2);
  now += 1_001;
  store.pruneExpired();
  assert.equal(expedition.battle, null);
  assert.equal(expedition.coop.partySize, 1);
  assert.equal(expedition.coop.enabled, false);
  assert.equal(owner.coopVitals.hp, 765);
  assert.equal(owner.coopVitals.mp, 54);
  assert.equal(owner.pendingRewards.length, rewardsBefore);
  assert.equal(expedition.coop.rare.resolved, true);
  assert.equal(expedition.coop.rare.abandoned, true);
});

function startTestBattle(store, room, suffix) {
  const point = room.expedition.start;
  store._startBattle(room, { id: `vitals-encounter-${suffix}-1`, type: "encounter", x: point.x, y: point.y, resolved: true });
  assert.ok(room.expedition.battle);
  return room.expedition.battle;
}

test("build230 explicit guest leave sends final normal and in-battle HP/MP before clearing", () => {
  const normal = startRoom(2), normalGuest = normal.players[1];
  normalGuest.session.coopVitals = { hp: 321, maxHp: 10_000, mp: 45, maxMp: 500 };
  normalGuest.conn.messages.length = 0;
  assert.equal(normal.store.leaveRoom(normalGuest.session).ok, true);
  const normalVitals = normalGuest.conn.messages.filter(message => message.type === "expeditionVitals" && message.reason === "leave");
  assert.equal(normalVitals.length, 1);
  assert.equal(normalVitals[0].hp, 321);
  assert.equal(normalVitals[0].mp, 45);
  assert.match(normalVitals[0].mutationId, new RegExp(`:${normalGuest.session.playerId}:\\d+:leave$`));
  assert.equal(normalGuest.session.coopVitals, null);

  const combat = startRoom(2), combatGuest = combat.players[1], battle = startTestBattle(combat.store, combat.room, "leave");
  battle.players[combatGuest.session.playerId].hp = 222;
  battle.players[combatGuest.session.playerId].mp = 33;
  combatGuest.session.coopVitals = { hp: 9_999, maxHp: 10_000, mp: 499, maxMp: 500 };
  combatGuest.conn.messages.length = 0;
  assert.equal(combat.store.leaveRoom(combatGuest.session).ok, true);
  const combatVitals = combatGuest.conn.messages.filter(message => message.type === "expeditionVitals" && message.reason === "leave");
  assert.equal(combatVitals.length, 1);
  assert.equal(combatVitals[0].hp, 222);
  assert.equal(combatVitals[0].mp, 33);
  assert.equal(combatGuest.session.coopVitals, null);
});

test("build230 expired guest recovery outbox keeps final normal and in-battle HP/MP once", () => {
  for (const mode of ["normal", "battle"]) {
    let now = 30_000;
    const env = startRoom(2, { now: () => now, reconnectGraceMs: 1_000 }), guest = env.players[1], expected = mode === "battle" ? { hp: 111, mp: 22 } : { hp: 444, mp: 55 };
    if (mode === "battle") {
      const battle = startTestBattle(env.store, env.room, "expiry");
      battle.players[guest.session.playerId].hp = expected.hp;
      battle.players[guest.session.playerId].mp = expected.mp;
      guest.session.coopVitals = { hp: 8_888, maxHp: 10_000, mp: 488, maxMp: 500 };
    } else guest.session.coopVitals = { hp: expected.hp, maxHp: 10_000, mp: expected.mp, maxMp: 500 };
    env.store.disconnect(guest.session, guest.conn);
    now += 1_001;
    env.store.pruneExpired();
    const outbox = env.store.recoveryOutboxes.get(guest.session.playerId), vitals = outbox?.pendingMessages.filter(message => message.type === "expeditionVitals");
    assert.equal(vitals?.length, 1, mode);
    assert.equal(vitals[0].reason, "sessionExpired");
    assert.equal(vitals[0].hp, expected.hp);
    assert.equal(vitals[0].mp, expected.mp);
    assert.match(vitals[0].mutationId, new RegExp(`:${guest.session.playerId}:\\d+:sessionExpired$`));
    const mutationId = vitals[0].mutationId;
    env.store.pruneExpired();
    assert.equal(env.store.recoveryOutboxes.get(guest.session.playerId)?.pendingMessages.filter(message => message.type === "expeditionVitals").length, 1);
    assert.equal(env.store.recoveryOutboxes.get(guest.session.playerId)?.pendingMessages.find(message => message.type === "expeditionVitals")?.mutationId, mutationId);
  }
});
