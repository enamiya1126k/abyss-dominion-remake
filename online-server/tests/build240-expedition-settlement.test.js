import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";
import { readFile } from "node:fs/promises";

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function join(store, index, overrides = {}) {
  const conn = connection();
  const result = store.hello(conn, {
    friendId: `AD-PZ25-AA${"BCDE"[index - 1]}A`,
    clientKey: `build240-settlement-key-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `Settlement-${index}`,
      monsterId: `settlement-monster-${index}`,
      speciesId: "slime",
      maxFloor: 50,
      currentHp: 500,
      currentMp: 40,
      abyssKeyStock: 0,
      battleStats: { hp: 500, mp: 40, atk: 250, matk: 220, def: 180, mdef: 170, spd: 90, crit: 5, evasion: 3, accuracy: 100 },
      ...overrides,
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session, result };
}

function startRoom({ players = 1, floor = 50 } = {}) {
  const store = new RoomStore({ now: () => 240_000, random: () => .4, randomRoomCode: () => "SET240" });
  const members = Array.from({ length: players }, (_, index) => join(store, index + 1));
  const created = store.createRoom(members[0].session), room = store.rooms.get(created.room.roomId);
  for (const member of members.slice(1)) assert.equal(store.joinRoom(member.session, room.roomId).ok, true);
  assert.equal(store.setFloor(members[0].session, floor).ok, true);
  for (const member of members) assert.equal(store.setReady(member.session, true).ok, true);
  assert.equal(store.startExpedition(members[0].session, { hostWorld: { floorSeeds: { [floor]: 24050 }, openedChestIds: {} } }).ok, true);
  return { store, members, room };
}

test("build240 battle settlement retries atomically and mirrors a host key exactly once", () => {
  const { store, members: [owner], room } = startRoom();
  store._startBattle(room, { id: "build240-key-battle", type: "encounter", ...owner.session.dungeonPosition, resolved: true });
  const battle = room.expedition.battle;
  battle.floorBoss = true;
  battle.floor = 50;
  for (const enemy of battle.enemies) enemy.hp = 0;

  const beforeRewards = owner.session.pendingRewards.length, sync = store._syncSettlementJournal.bind(store);
  store._syncSettlementJournal = () => false;
  const failed = store._finishBattleVictory(room, battle);
  assert.equal(failed.ok, false);
  assert.equal(room.expedition.battle, battle);
  assert.equal(owner.session.pendingRewards.length, beforeRewards);
  assert.equal(room.hostKeyStock, 0);

  store._syncSettlementJournal = sync;
  store._finishBattleVictory(room, battle);
  assert.equal(room.expedition.battle, null);
  assert.equal(owner.session.pendingRewards.filter(entry => Number(entry.reward?.abyssKeys) === 1).length, 1);
  assert.equal(room.hostKeyStock, 1);
  store._finishBattleVictory(room, battle);
  assert.equal(room.hostKeyStock, 1);
});

test("build240 an expired former helper cannot block the owner's terminal result", () => {
  const { store, members: [owner, helper], room } = startRoom({ players: 2, floor: 7 });
  assert.equal(store.leaveRoom(helper.session).ok, true);
  store.sessions.delete(helper.session.playerId);
  store.recoveryOutboxes.delete(helper.session.playerId);

  const result = store._finishExpedition(room, { completed: false, reason: "return" });
  assert.equal(result.ok, true);
  assert.equal(result.summary.multiplayer, true);
  assert.deepEqual(new Set(result.summary.participantIds), new Set([owner.session.playerId, helper.session.playerId]));
  assert.equal(room.phase, "lobby");
  assert.equal(room.expedition, null);
  assert.ok(owner.session.pendingMessages.some(message => message.type === "expeditionResult"));
});

test("build240 a host-world receipt carries an isolated full snapshot", () => {
  const { store, members: [owner], room } = startRoom({ floor: 1 });
  const position = { ...owner.session.dungeonPosition }, chest = { id: "isolated", hostChestKey: "isolated", type: "chest", ...position, kind: "box", resolved: false };
  room.expedition.decorations = room.expedition.decorations.filter(item => item.x !== position.x || item.y !== position.y);
  room.expedition.objects = room.expedition.objects.filter(item => item.type === "exit");
  room.expedition.objects.push(chest);
  store._resolveLanding(room, owner.session);
  const receipt = owner.session.pendingMessages.find(message => message.type === "hostWorldDelta");
  assert.ok(receipt);
  const snapshot = JSON.stringify(receipt.hostWorld);
  room.hostWorld.openedChestIds["1"].push("later-mutation");
  assert.equal(JSON.stringify(receipt.hostWorld), snapshot);
});

test("build240 websocket recovery completes only after pending settlements", async () => {
  const server = await readFile(new URL("../server.js", import.meta.url), "utf8");
  assert.match(server, /pendingExpeditionResult=Boolean/);
  assert.match(server, /deliverPendingRewards\(socket\.session\)[^]*type:"recoveryComplete"/);
  assert.match(server, /orphanedExpedition:Boolean\(!result\.resumableRoom&&!pendingExpeditionResult\)/);
});
