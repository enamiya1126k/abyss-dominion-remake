import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

function connection() {
  return { session: null, closed: [], messages: [], send(value) { this.messages.push(JSON.parse(value)); }, close(code, reason) { this.closed.push({ code, reason }); } };
}
const profile = {
  displayName: "背景冒険者", monsterId: "m1", speciesId: "slime", monsterName: "スライム", level: 10, maxFloor: 10,
  battleStats: { hp: 100, mp: 10, atk: 10, matk: 10, def: 5, mdef: 5, spd: 10, crit: 5, evasion: 3, accuracy: 100 },
};

test("background hello never replaces an active foreground connection", () => {
  const store = new RoomStore(), foreground = connection(), clientKey = "x".repeat(32);
  const first = store.hello(foreground, { friendId: "AD-AAAA-2222", clientKey, profile });
  assert.equal(first.ok, true);
  const background = connection(), refused = store.hello(background, { friendId: "AD-AAAA-2222", clientKey, resumeToken: first.resumeToken, profile, backgroundOnly: true });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, "BACKGROUND_CONNECTION_BUSY");
  assert.equal(background.session, null);
  assert.equal(foreground.closed.length, 0);
  assert.equal(store.sessions.get("AD-AAAA-2222").connection, foreground);
});

test("background reconnect preserves room membership but hides room broadcasts until foreground mode", () => {
  const store = new RoomStore(), firstConnection = connection(), clientKey = "y".repeat(32);
  const first = store.hello(firstConnection, { friendId: "AD-BBBB-2222", clientKey, profile });
  assert.equal(first.ok, true);
  assert.equal(store.createRoom(firstConnection.session).ok, true);
  const roomId = firstConnection.session.roomId;
  store.disconnect(firstConnection.session, firstConnection);
  const background = connection(), resumed = store.hello(background, { friendId: "AD-BBBB-2222", clientKey, resumeToken: first.resumeToken, profile, backgroundOnly: true });
  assert.equal(resumed.ok, true);
  assert.equal(resumed.backgroundOnly, true);
  assert.equal(resumed.resumableRoom, true);
  assert.equal(resumed.room, null);
  assert.equal(background.session.roomId, roomId);
  background.messages.length = 0;
  store._broadcastRoom(store.rooms.get(roomId));
  assert.equal(background.messages.some(message => message.type === "roomState"), false);
  store._send(background.session, { type: "onlineReward", rewardId: "safe", reward: { gold: 1 } });
  assert.equal(background.messages.some(message => message.type === "onlineReward"), true);
  const foreground = store.setConnectionMode(background.session, { backgroundOnly: false });
  assert.equal(foreground.ok, true);
  assert.equal(foreground.message.room.roomId, roomId);
  assert.ok(foreground.message.friendState);
  assert.ok(foreground.message.guildState);
  assert.deepEqual(foreground.message.activeTradeIds, []);
  background.messages.length = 0;
  store._broadcastRoom(store.rooms.get(roomId));
  assert.equal(background.messages.some(message => message.type === "roomState"), true);
});
