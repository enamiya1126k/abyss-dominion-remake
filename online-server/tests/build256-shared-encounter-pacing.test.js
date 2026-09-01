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

function join(store, index) {
  const conn = connection();
  const suffix = String.fromCharCode(65 + index);
  const result = store.hello(conn, {
    friendId: `AD-B256-ENC${suffix}`,
    clientKey: `build256-encounter-${index}`.padEnd(32, "x"),
    profile: {
      displayName: index === 0 ? "Owner" : `Guest ${index}`,
      monsterId: `build256-monster-${index}`,
      speciesId: "slime",
      maxFloor: 50,
      explorePickupDone: true,
      battleStats: {
        hp: 600,
        mp: 80,
        atk: 180,
        matk: 160,
        def: 140,
        mdef: 130,
        spd: 90,
        crit: 5,
        evasion: 3,
        accuracy: 100,
      },
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session };
}

function startRoom(players = 2, floor = 7) {
  let now = 256_000;
  const store = new RoomStore({
    now: () => now,
    random: () => .47,
    randomRoomCode: () => "PACE56",
  });
  const members = Array.from({ length: players }, (_, index) => join(store, index));
  const created = store.createRoom(members[0].session);
  assert.equal(created.ok, true);
  const room = store.rooms.get(created.room.roomId);
  for (const member of members.slice(1)) assert.equal(store.joinRoom(member.session, room.roomId).ok, true);
  assert.equal(store.setFloor(members[0].session, floor).ok, true);
  for (const member of members) assert.equal(store.setReady(member.session, true).ok, true);
  assert.equal(store.startExpedition(members[0].session, {
    hostWorld: {
      floorSeeds: { [floor]: 256_000 + floor },
      openedChestIds: { [floor]: [] },
      defeatedBossFloors: [],
      claimedBossRewardFloors: [],
    },
  }).ok, true);
  return { store, room, members, now: () => now, advance(ms) { now += ms; } };
}

function freeNeighbor(expedition, session) {
  const current = session.dungeonPosition;
  return [[1, 0], [0, 1], [-1, 0], [0, -1]]
    .map(([dx, dy]) => ({ x: current.x + dx, y: current.y + dy, facing: dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up" }))
    .find(point => expedition.tiles[point.y]?.[point.x] === "."
      && !expedition.objects.some(object => object.x === point.x && object.y === point.y && !object.resolved && !object.hidden)
      && !(expedition.decorations ?? []).some(object => object.x === point.x && object.y === point.y && !object.used && !object.destroyed));
}

test("build256 a connected guest can advance and trigger the shared random encounter", () => {
  const { store, room, members: [owner, guest] } = startRoom(2);
  const expedition = room.expedition, next = freeNeighbor(expedition, guest.session);
  assert.ok(next);
  const ordinaryTarget = expedition.nextEncounter, totalBefore = expedition.totalEncounters;
  expedition.steps = 7;
  expedition.encounterPacing = {
    progress: 17,
    target: 18,
    memberSteps: { [guest.session.playerId]: 17 },
    lastContributorId: null,
    lastTriggeredBy: null,
    lastTriggeredAt: 0,
  };

  assert.equal(store.moveExpedition(guest.session, next).ok, true);
  assert.ok(expedition.battle, "the guest's real movement can start the encounter");
  assert.match(expedition.battle.encounterId, /^random-/);
  assert.equal(expedition.encounterPacing.lastTriggeredBy, guest.session.playerId);
  assert.equal(expedition.encounterPacing.lastContributorId, guest.session.playerId);
  assert.equal(expedition.encounterPacing.progress, 0);
  assert.equal(expedition.encounterPacing.target, 28, "the next encounter gets the relaxed 18-40 step cadence");
  assert.equal(expedition.totalEncounters, totalBefore + 1);
  assert.equal(expedition.steps, 7, "guest movement does not mutate the host's world/hazard clock");
  assert.equal(expedition.nextEncounter, ordinaryTarget, "the host's seeded ordinary-floor value stays intact");
  assert.equal(owner.session.connected, true);
});

test("build256 simultaneous party movement uses one party pace instead of multiplying encounter frequency", () => {
  const { store, room, members } = startRoom(4);
  const expedition = room.expedition;
  expedition.encounterPacing = {
    progress: 0,
    target: 100,
    memberSteps: {},
    lastContributorId: null,
    lastTriggeredBy: null,
    lastTriggeredAt: 0,
  };

  for (const member of members) {
    const next = freeNeighbor(expedition, member.session);
    assert.ok(next);
    assert.equal(store.moveExpedition(member.session, next).ok, true);
  }

  assert.equal(expedition.encounterPacing.progress, 1, "four one-tile moves share one pace, not four encounters' worth");
  for (const member of members) assert.equal(expedition.encounterPacing.memberSteps[member.session.playerId], 1);
  assert.equal(expedition.battle, null);

  const beforeNoop = expedition.encounterPacing.progress;
  assert.equal(store.moveExpedition(members[1].session, { ...members[1].session.dungeonPosition }).ok, true);
  assert.equal(expedition.encounterPacing.progress, beforeNoop, "same-tile/facing-only requests cannot farm encounter progress");
});

test("build256 shared pacing starts relaxed and ignores movement during the post-battle grace window", () => {
  const { store, room, members: [, guest], now } = startRoom(2);
  const expedition = room.expedition, first = freeNeighbor(expedition, guest.session);
  assert.ok(first);

  assert.equal(store.moveExpedition(guest.session, first).ok, true);
  assert.ok(expedition.encounterPacing.target >= 18 && expedition.encounterPacing.target <= 42);
  assert.equal(expedition.encounterPacing.progress, 1);

  const second = freeNeighbor(expedition, guest.session);
  assert.ok(second);
  expedition.encounterPacing.progress = expedition.encounterPacing.target - 1;
  expedition.encounterPacing.memberSteps[guest.session.playerId] = expedition.encounterPacing.target - 1;
  expedition.encounterCooldownUntil = now() + 1_400;
  const before = expedition.encounterPacing.progress;
  assert.equal(store.moveExpedition(guest.session, second).ok, true);
  assert.equal(expedition.encounterPacing.progress, before, "grace-window steps do not queue an immediate follow-up battle");
  assert.equal(expedition.battle, null);
});

test("build256 one-player online preserves the exact ordinary encounter clock", () => {
  const { store, room, members: [owner] } = startRoom(1);
  const expedition = room.expedition, next = freeNeighbor(expedition, owner.session);
  assert.ok(next);
  const seededTarget = expedition.nextEncounter;
  expedition.steps = seededTarget - 1;

  assert.equal(store.moveExpedition(owner.session, next).ok, true);
  assert.ok(expedition.battle, "solo online triggers on the original seeded threshold");
  assert.match(expedition.battle.encounterId, /^random-/);
  assert.equal(expedition.steps, 0);
  assert.equal(expedition.nextEncounter, 19, "solo keeps the legacy 8-31 follow-up schedule");
  assert.equal(expedition.encounterPacing, undefined, "party pacing is never installed in a one-player room");
});

test("build256 pickups and ordinary objects defer a due encounter instead of stacking battle on the same step", () => {
  const { store, room, members: [, guest] } = startRoom(2);
  const expedition = room.expedition, pickupPoint = freeNeighbor(expedition, guest.session);
  assert.ok(pickupPoint);
  const crate = { id: "build256-due-crate", type: "crate", ...pickupPoint, used: false, destroyed: false };
  expedition.decorations.push(crate);
  expedition.encounterPacing = { progress: 0, target: 1, memberSteps: {}, lastTriggeredBy: null, lastTriggeredAt: 0 };

  assert.equal(store.moveExpedition(guest.session, pickupPoint).ok, true);
  assert.equal(crate.used, true);
  assert.equal(expedition.battle, null, "pickup feedback remains visible before another battle can start");
  assert.equal(expedition.encounterPacing.progress, 1);
  assert.equal(expedition.encounterPacing.target, 3, "landing content grants two safe personal steps");

  const chestPoint = freeNeighbor(expedition, guest.session);
  assert.ok(chestPoint);
  const chest = { id: "build256-due-chest", hostChestKey: "build256-due-chest", type: "chest", ...chestPoint, resolved: false, kind: "box", locked: false, mimic: false };
  expedition.objects.push(chest);
  expedition.encounterPacing = { progress: 0, target: 1, memberSteps: {}, lastTriggeredBy: null, lastTriggeredAt: 0 };
  assert.equal(store.moveExpedition(guest.session, chestPoint).ok, true);
  assert.equal(chest.resolved, true);
  assert.equal(expedition.battle, null, "chest rewards are never hidden by a random battle on the opening step");
  assert.equal(expedition.encounterPacing.target, 3);
});

test("build256 auto-collecting a non-blocking key fragment also grants two safe steps", () => {
  const { store, room, members: [, guest] } = startRoom(2);
  const expedition = room.expedition, keyPoint = freeNeighbor(expedition, guest.session);
  assert.ok(keyPoint);
  const fragment = {
    id: "build256-safe-key",
    type: "keyFragment",
    fragment: "cyan",
    ...keyPoint,
    resolved: false,
    hidden: false,
    optional: true,
    nonBlocking: true,
    coopOnly: true,
    onlineAdded: true,
  };
  expedition.objects.push(fragment);
  expedition.coop.keyHolders = {};
  expedition.encounterPacing = { progress: 0, target: 1, memberSteps: {}, lastTriggeredBy: null, lastTriggeredAt: 0 };

  assert.equal(store.moveExpedition(guest.session, keyPoint).ok, true);
  assert.equal(fragment.resolved, true, "landing on the fragment auto-collects it");
  assert.equal(expedition.coop.keyHolders.cyan, guest.session.playerId);
  assert.equal(expedition.battle, null, "the pickup receipt is not covered by an immediate random battle");
  assert.equal(expedition.encounterPacing.progress, 1);
  assert.equal(expedition.encounterPacing.target, 3);
});

test("build256 dead, disconnected and boss-floor walkers cannot feed the shared encounter clock", () => {
  {
    const { store, room, members: [, guest] } = startRoom(2);
    const expedition = room.expedition, next = freeNeighbor(expedition, guest.session);
    guest.session.coopVitals.hp = 0;
    for (const entry of guest.session.coopRosterVitals ?? []) entry.hp = 0;
    expedition.encounterPacing = { progress: 0, target: 1, memberSteps: {} };
    assert.equal(store.moveExpedition(guest.session, next).code, "ACTOR_DOWN");
    assert.equal(expedition.encounterPacing.progress, 0);
  }

  {
    const { store, room, members: [, guest] } = startRoom(2);
    const expedition = room.expedition, next = freeNeighbor(expedition, guest.session);
    expedition.encounterPacing = { progress: 0, target: 1, memberSteps: {} };
    store.disconnect(guest.session);
    assert.equal(store.moveExpedition(guest.session, next).ok, true);
    assert.equal(expedition.encounterPacing.progress, 0);
    assert.equal(expedition.battle, null);
  }

  {
    const { store, room, members: [, guest] } = startRoom(2, 10);
    const expedition = room.expedition, next = freeNeighbor(expedition, guest.session);
    assert.equal(expedition.encountersEnabled, false);
    expedition.encounterPacing = { progress: 0, target: 1, memberSteps: {} };
    assert.equal(store.moveExpedition(guest.session, next).ok, true);
    assert.equal(expedition.encounterPacing.progress, 0);
    assert.equal(expedition.battle, null);
  }
});
