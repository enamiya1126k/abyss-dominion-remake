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
  const suffix = String.fromCharCode(65 + index);
  const result = store.hello(conn, {
    friendId: `AD-B256-BND${suffix}`,
    clientKey: `build256-bandwidth-${index}`.padEnd(32, "x"),
    profile: {
      displayName: index === 0 ? "Owner" : `Guest ${index}`,
      monsterId: `build256-bandwidth-monster-${index}`,
      speciesId: "slime",
      maxFloor: 30,
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

function startRoom() {
  let now = 256_000;
  const store = new RoomStore({
    now: () => now,
    random: () => .47,
    randomRoomCode: () => "BND256",
  });
  const members = [hello(store, 0), hello(store, 1)];
  const created = store.createRoom(members[0].session);
  assert.equal(created.ok, true);
  const room = store.rooms.get(created.room.roomId);
  assert.equal(store.joinRoom(members[1].session, room.roomId).ok, true);
  assert.equal(store.setFloor(members[0].session, 7).ok, true);
  for (const member of members) assert.equal(store.setReady(member.session, true).ok, true);
  assert.equal(store.startExpedition(members[0].session, {
    hostWorld: {
      floorSeeds: { 7: 256_007 },
      openedChestIds: { 7: [] },
      defeatedBossFloors: [],
      claimedBossRewardFloors: [],
    },
  }).ok, true);
  room.expedition.encountersEnabled = false;
  room.expedition.encounterPacing = {
    progress: 0,
    target: 1_000_000,
    memberSteps: {},
    lastContributorId: null,
    lastTriggeredBy: null,
    lastTriggeredAt: 0,
  };
  return { store, room, members, advance(ms = 100) { now += ms; } };
}

function clearMessages(members) {
  for (const member of members) member.conn.messages.length = 0;
}

function adjacentFloor(expedition, position) {
  for (const [dx, dy, facing] of [[1, 0, "right"], [0, 1, "down"], [-1, 0, "left"], [0, -1, "up"]]) {
    const next = { x: position.x + dx, y: position.y + dy, facing };
    if (expedition.tiles[next.y]?.[next.x] === ".") return next;
  }
  throw new Error("no adjacent floor cell");
}

function straightFloorTriple(expedition) {
  for (let y = 1; y < expedition.rows - 1; y++) for (let x = 1; x < expedition.cols - 1; x++) {
    for (const [dx, dy, facing] of [[1, 0, "right"], [0, 1, "down"], [-1, 0, "left"], [0, -1, "up"]]) {
      const cells = [0, 1, 2].map(step => ({ x: x + dx * step, y: y + dy * step, facing }));
      if (cells.every(cell => expedition.tiles[cell.y]?.[cell.x] === ".")) return cells;
    }
  }
  throw new Error("no straight floor triple");
}

function straightFloorLine(expedition, length = 4) {
  for (let y = 1; y < expedition.rows - 1; y++) for (let x = 1; x < expedition.cols - 1; x++) {
    for (const [dx, dy, facing] of [[1, 0, "right"], [0, 1, "down"], [-1, 0, "left"], [0, -1, "up"]]) {
      const cells = Array.from({ length }, (_, step) => ({ x: x + dx * step, y: y + dy * step, facing }));
      if (cells.every(cell => expedition.tiles[cell.y]?.[cell.x] === ".")) return cells;
    }
  }
  throw new Error(`no straight floor line of length ${length}`);
}

function distantFloor(expedition, point) {
  for (let y = 1; y < expedition.rows - 1; y++) for (let x = 1; x < expedition.cols - 1; x++) {
    if (expedition.tiles[y]?.[x] === "." && Math.max(Math.abs(x - point.x), Math.abs(y - point.y)) > 3) {
      return { x, y, facing: "down" };
    }
  }
  throw new Error("no distant floor cell");
}

test("build256 ordinary movement broadcasts only the compact expeditionMoved packet", () => {
  const { store, room, members } = startRoom();
  const expedition = room.expedition;
  expedition.objects = [];
  expedition.decorations = [];
  expedition.interactions = {};
  expedition.steps = 0;
  store._broadcastRoom(room);
  const next = adjacentFloor(expedition, members[0].session.dungeonPosition);
  clearMessages(members);

  assert.equal(store.moveExpedition(members[0].session, next).ok, true);
  for (const member of members) {
    const moved = member.conn.messages.filter(message => message.type === "expeditionMoved");
    const roomStates = member.conn.messages.filter(message => message.type === "roomState");
    assert.equal(moved.length, 1);
    assert.equal(moved[0].playerId, members[0].session.playerId);
    assert.deepEqual(moved[0].position, next);
    assert.equal(roomStates.length, 0, "an uneventful tile must not serialize the full room snapshot");
  }
});

test("build256 entering interaction range still publishes the updated prompt", () => {
  const { store, room, members } = startRoom();
  const expedition = room.expedition, [origin, middle, target] = straightFloorTriple(expedition);
  const chest = { id: "bandwidth-resonance", type: "resonanceChest", x: target.x, y: target.y, resolved: false, hidden: false, nearbyCount: 0 };
  expedition.objects = [chest];
  expedition.decorations = [];
  expedition.interactions = {};
  members[0].session.dungeonPosition = origin;
  members[1].session.dungeonPosition = distantFloor(expedition, target);
  store._syncCoopInteractions(room);
  assert.equal(expedition.interactions[members[0].session.playerId], undefined);
  clearMessages(members);

  assert.equal(store.moveExpedition(members[0].session, middle).ok, true);
  for (const member of members) {
    const roomStates = member.conn.messages.filter(message => message.type === "roomState");
    assert.equal(roomStates.length, 1, "the first nearby prompt requires one authoritative room refresh");
    const interaction = roomStates[0].room.expedition.interactions[members[0].session.playerId];
    assert.equal(interaction.action, "waitResonanceChest");
    assert.equal(interaction.targetId, chest.id);
    assert.equal(roomStates[0].room.expedition.objects.find(object => object.id === chest.id).nearbyCount, 1);
  }
});

test("build256 stepping on one co-op switch refreshes its occupied UI without a duplicate snapshot", () => {
  const { store, room, members } = startRoom();
  const expedition = room.expedition, [origin, middle, target] = straightFloorTriple(expedition);
  const other = distantFloor(expedition, target);
  expedition.objects = [
    { id: "bandwidth-switch-a", type: "coopSwitch", x: middle.x, y: middle.y, resolved: false, active: false, occupied: false, progress: 0 },
    { id: "bandwidth-switch-b", type: "coopSwitch", x: other.x, y: other.y, resolved: false, active: false, occupied: false, progress: 0 },
  ];
  expedition.decorations = [];
  expedition.interactions = {};
  expedition.coop.switchUnlocked = false;
  expedition.coop.switchResolution = null;
  members[0].session.dungeonPosition = origin;
  members[1].session.dungeonPosition = target;
  clearMessages(members);

  assert.equal(store.moveExpedition(members[0].session, middle).ok, true);
  for (const member of members) {
    const roomStates = member.conn.messages.filter(message => message.type === "roomState");
    assert.equal(roomStates.length, 1);
    const switchState = roomStates[0].room.expedition.objects.find(object => object.id === "bandwidth-switch-a");
    assert.equal(switchState.occupied, true);
    assert.equal(switchState.active, false);
  }
});

test("build256 a later follower UI change is sent after an earlier landing snapshot", () => {
  const { store, room, members } = startRoom();
  const expedition = room.expedition, [followerOrigin, hostOrigin, chestPoint, keyPoint] = straightFloorLine(expedition, 4);
  const chest = { id: "bandwidth-chest", hostChestKey: "bandwidth-chest", type: "chest", ...chestPoint, resolved: false, hidden: false, kind: "box", locked: false, mimic: false };
  const key = { id: "bandwidth-follow-key", type: "keyFragment", fragment: "cyan", ...keyPoint, resolved: false, hidden: false, optional: true, nonBlocking: true, coopOnly: true, onlineAdded: true };
  expedition.objects = [chest, key];
  expedition.decorations = [];
  expedition.interactions = {};
  expedition.coop.keyHolders = {};
  members[0].session.dungeonPosition = hostOrigin;
  members[1].session.dungeonPosition = followerOrigin;
  members[1].session.connected = false;
  store._syncCoopInteractions(room);
  assert.equal(expedition.interactions[members[1].session.playerId], undefined, "the key begins outside the follower's two-cell range");
  store._broadcastRoom(room);
  clearMessages(members);

  assert.equal(store.moveExpedition(members[0].session, chestPoint).ok, true);
  assert.deepEqual(members[1].session.dungeonPosition, hostOrigin, "the disconnected follower advances one cell toward the owner");
  const roomStates = members[0].conn.messages.filter(message => message.type === "roomState");
  assert.equal(roomStates.length, 2, "the landing state and the later follower prompt each receive an authoritative snapshot");
  assert.equal(roomStates[0].room.expedition.interactions[members[1].session.playerId], undefined);
  assert.equal(roomStates[1].room.expedition.interactions[members[1].session.playerId]?.action, "collectKeyFragment");
  assert.equal(roomStates[1].room.expedition.interactions[members[1].session.playerId]?.targetId, key.id);
});
