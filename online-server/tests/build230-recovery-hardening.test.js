import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";

function connection() {
  return {
    messages: [],
    closed: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close(code, reason) { this.closed.push({ code, reason }); },
  };
}

function identity(index) {
  return {
    friendId: `AD-RCVR-RC${"BCDEFG"[index - 1]}2`,
    clientKey: `recovery-client-${index}`.padEnd(32, "x"),
    profile: { displayName: `Recovery ${index}`, speciesId: "slime", maxFloor: 20 },
  };
}

function hello(store, index, extra = {}) {
  const conn = connection();
  const result = store.hello(conn, { ...identity(index), ...extra });
  assert.equal(result.ok, true);
  return { conn, result, session: conn.session };
}

test("build230 requires the current resume token and rotates it only after a successful reconnect", () => {
  const store = new RoomStore();
  const first = hello(store, 1);
  const originalToken = first.result.resumeToken;
  store.markSessionActivity(first.session);

  const missing = store.hello(connection(), identity(1));
  assert.equal(missing.ok, false);
  assert.equal(missing.code, "RESUME_TOKEN_MISMATCH");
  assert.equal(first.session.resumeToken, originalToken);
  assert.equal(first.conn.closed.length, 0);

  const wrong = store.hello(connection(), { ...identity(1), resumeToken: "wrong-token" });
  assert.equal(wrong.ok, false);
  assert.equal(wrong.code, "RESUME_TOKEN_MISMATCH");
  assert.equal(first.session.resumeToken, originalToken);
  assert.equal(first.conn.closed.length, 0);

  const replacement = connection();
  const replaced = store.hello(replacement, { ...identity(1), resumeToken: originalToken });
  assert.equal(replaced.ok, true);
  assert.notEqual(replaced.resumeToken, originalToken);
  assert.equal(first.conn.closed[0]?.code, 4001);
  assert.equal(replacement.session, first.session);

  store.disconnect(replacement.session, replacement);
  const rotatedToken = replaced.resumeToken;
  const ackLossRetryConnection = connection();
  const ackLossRetry = store.hello(ackLossRetryConnection, { ...identity(1), resumeToken: originalToken });
  assert.equal(ackLossRetry.ok, true);
  assert.equal(ackLossRetry.resumeToken, rotatedToken, "the previous token resends the current token without another rotation");
  assert.equal(ackLossRetryConnection.session.previousResumeToken, originalToken);

  store.disconnect(ackLossRetryConnection.session, ackLossRetryConnection);
  const repeatedAckLossConnection = connection();
  const repeatedAckLoss = store.hello(repeatedAckLossConnection, { ...identity(1), resumeToken: originalToken });
  assert.equal(repeatedAckLoss.ok, true);
  assert.equal(repeatedAckLoss.resumeToken, rotatedToken, "consecutive lost helloAck packets remain recoverable");
  store.disconnect(repeatedAckLossConnection.session, repeatedAckLossConnection);

  const disconnectedWrong = store.hello(connection(), { ...identity(1), resumeToken: "definitely-wrong" });
  assert.equal(disconnectedWrong.code, "RESUME_TOKEN_MISMATCH");
  assert.equal(repeatedAckLossConnection.session.resumeToken, rotatedToken);

  const resumedConnection = connection();
  const resumed = store.hello(resumedConnection, { ...identity(1), resumeToken: rotatedToken });
  assert.equal(resumed.ok, true);
  assert.notEqual(resumed.resumeToken, rotatedToken);
});

test("build230 replaces a half-open first connection when its helloAck was lost", () => {
  let now = 2_000;
  const store = new RoomStore({ now: () => now, reconnectGraceMs: 5_000, initialHelloRetryMs: 1_000 });
  const first = hello(store, 1);
  const issuedToken = first.result.resumeToken;
  now += 100;

  const replacement = connection();
  const retried = store.hello(replacement, identity(1));
  assert.equal(retried.ok, true);
  assert.equal(retried.resumeToken, issuedToken, "the unknown first token must be resent, not rotated");
  assert.equal(replacement.session, first.session);
  assert.equal(first.session.connection, replacement);
  assert.equal(first.conn.closed[0]?.code, 4001);

  store.disconnect(first.session, first.conn);
  assert.equal(first.session.connected, true, "a stale close event must not disconnect the replacement");
  assert.equal(first.session.connection, replacement);

  store.markSessionActivity(first.session);
  const afterActivity = store.hello(connection(), identity(1));
  assert.equal(afterActivity.code, "RESUME_TOKEN_MISMATCH");
  assert.equal(replacement.closed.length, 0, "a rejected retry must not replace the active connection");
});

test("build230 retries a lost first helloAck only for a short, completely blank session", () => {
  let now = 5_000;
  const store = new RoomStore({ now: () => now, reconnectGraceMs: 5_000, initialHelloRetryMs: 1_000 });
  const first = hello(store, 1);
  const issuedToken = first.result.resumeToken;
  store.disconnect(first.session, first.conn);
  now += 100;
  const retryConnection = connection();
  const retry = store.hello(retryConnection, identity(1));
  assert.equal(retry.ok, true);
  assert.equal(retry.resumeToken, issuedToken);
  assert.equal(retryConnection.session.previousResumeToken, null);

  store.disconnect(retryConnection.session, retryConnection);
  now += 100;
  const repeatedConnection = connection();
  const repeated = store.hello(repeatedConnection, identity(1));
  assert.equal(repeated.ok, true);
  assert.equal(repeated.resumeToken, issuedToken, "repeated first-ACK loss must not rotate the unknown token");

  const connectedConnection = connection();
  const connectedRetry = store.hello(connectedConnection, identity(1));
  assert.equal(connectedRetry.ok, true);
  assert.equal(connectedRetry.resumeToken, issuedToken);
  assert.equal(repeatedConnection.closed[0]?.code, 4001);
  store.disconnect(connectedConnection.session, connectedConnection);
  const wrongClient = store.hello(connection(), { ...identity(1), clientKey: "different-client-secret".padEnd(32, "x") });
  assert.equal(wrongClient.code, "ID_IN_USE");
});

test("build230 keeps a blank first-ACK retry open through 31 seconds but not beyond the original five-minute boundary", () => {
  let now = 100_000;
  const store = new RoomStore({ now: () => now, reconnectGraceMs: 5 * 60_000 });
  const first = hello(store, 1);
  const issuedToken = first.result.resumeToken;
  store.disconnect(first.session, first.conn);
  now += 31_000;
  const retryConnection = connection();
  const retry = store.hello(retryConnection, identity(1));
  assert.equal(retry.ok, true);
  assert.equal(retry.resumeToken, issuedToken);

  store.disconnect(retryConnection.session, retryConnection);
  now = 100_000 + 5 * 60_000 + 1;
  const tooLate = store.hello(connection(), identity(1));
  assert.equal(tooLate.code, "RESUME_TOKEN_MISMATCH", "a retry must not extend the original tokenless window");

  let untouchedNow = 200_000;
  const untouched = new RoomStore({ now: () => untouchedNow, reconnectGraceMs: 5 * 60_000 });
  const untouchedFirst = hello(untouched, 2);
  const oldToken = untouchedFirst.result.resumeToken;
  untouched.disconnect(untouchedFirst.session, untouchedFirst.conn);
  untouchedNow += 5 * 60_000 + 1;
  const clean = untouched.hello(connection(), identity(2));
  assert.equal(clean.ok, true);
  assert.notEqual(clean.resumeToken, oldToken, "after grace, an asset-free expired identity starts a clean session");
});

test("build230 never grants tokenless initial retry after room, reward, activity, protected trade, or deadline state", () => {
  const rejected = setup => {
    let now = 7_000;
    const store = new RoomStore({ now: () => now, reconnectGraceMs: 5_000, initialHelloRetryMs: 1_000, randomRoomCode: () => "SAFE30" });
    const first = hello(store, 2);
    setup?.({ store, first, advance: value => { now += value; } });
    store.disconnect(first.session, first.conn);
    return store.hello(connection(), identity(2));
  };

  assert.equal(rejected(({ store, first }) => store.createRoom(first.session)).code, "RESUME_TOKEN_MISMATCH");
  assert.equal(rejected(({ store, first }) => store._queueReward(first.session, { rewardId: "protected", reward: { gold: 1 } })).code, "RESUME_TOKEN_MISMATCH");
  assert.equal(rejected(({ store, first }) => store.markSessionActivity(first.session)).code, "RESUME_TOKEN_MISMATCH");
  assert.equal(rejected(({ store, first }) => store.trade.recoveries.set("terminal", { tradeId: "terminal", participants: [first.session.playerId], ack: {} })).code, "RESUME_TOKEN_MISMATCH");
  assert.equal(rejected(({ advance }) => advance(1_001)).code, "RESUME_TOKEN_MISMATCH");
});

test("build230 moves expired pending data into a 24-hour outbox and restores it without room membership", () => {
  let now = 10_000;
  const store = new RoomStore({ now: () => now, reconnectGraceMs: 1_000, randomRoomCode: () => "RCVR24" });
  const player = hello(store, 2);
  const oldToken = player.result.resumeToken;
  const roomId = store.createRoom(player.session).room.roomId;
  store._queueReward(player.session, { rewardId: "recovery-reward", reward: { gold: 1234 }, source: { kind: "test" } });
  player.session.pendingMessages.push(
    { type: "hostWorldDelta", mutationId: "foreign-world-message", ownerId: "AD-FORE-IGN2", delta: { floorSeed: { floor: 2, seed: 99 } } },
    { type: "battleDefeated", receiptId: "foreign-battle-message", worldOwnerId: "AD-FORE-IGN2", progressionEligible: false, floor: 2 },
    { type: "expeditionVitals", reason: "recovery-test", hp: 321, maxHp: 500, mp: 12, maxMp: 40 },
  );
  store.disconnect(player.session, player.conn);
  now += 1_001;
  store.pruneExpired();

  assert.equal(store.sessions.has(player.session.playerId), false);
  assert.equal(store.rooms.has(roomId), false);
  assert.equal(store.recoveryOutboxes.size, 1);
  const outbox = store.recoveryOutboxes.get(player.session.playerId);
  assert.equal(outbox.resumeToken, oldToken);
  assert.equal(outbox.expiresAt, now + 24 * 60 * 60_000);
  assert.equal(outbox.pendingMessages.some(message => message.type === "hostWorldDelta" || message.type === "battleDefeated"), false);
  assert.equal(outbox.pendingMessages.some(message => message.type === "expeditionVitals" && message.reason === "recovery-test"), true);

  const missing = store.hello(connection(), identity(2));
  assert.equal(missing.code, "RESUME_TOKEN_MISMATCH");
  assert.equal(store.recoveryOutboxes.get(player.session.playerId).resumeToken, oldToken);
  const wrong = store.hello(connection(), { ...identity(2), resumeToken: "wrong-token" });
  assert.equal(wrong.code, "RESUME_TOKEN_MISMATCH");
  assert.equal(store.recoveryOutboxes.get(player.session.playerId).resumeToken, oldToken);

  const recoveredConnection = connection();
  const recovered = store.hello(recoveredConnection, { ...identity(2), resumeToken: oldToken });
  assert.equal(recovered.ok, true);
  assert.equal(recovered.recovered, true);
  assert.equal(recovered.resumed, false);
  assert.equal(recovered.room, null);
  assert.equal(recoveredConnection.session.roomId, null);
  assert.notEqual(recovered.resumeToken, oldToken);
  assert.equal(store.recoveryOutboxes.size, 0);

  store.deliverPendingRewards(recoveredConnection.session);
  assert.equal(recoveredConnection.messages.some(message => message.type === "onlineReward" && message.rewardId === "recovery-reward"), true);
  assert.equal(recoveredConnection.messages.some(message => message.type === "hostWorldDelta" || message.type === "battleDefeated"), false);
  assert.equal(recoveredConnection.messages.some(message => message.type === "expeditionVitals" && message.reason === "recovery-test"), true);
});

test("build230 outboxes accept the previous token after a lost hello acknowledgement", () => {
  let now = 15_000;
  const store = new RoomStore({ now: () => now, reconnectGraceMs: 10 });
  const first = hello(store, 4);
  const clientToken = first.result.resumeToken;
  const rotatedConnection = connection();
  const rotated = store.hello(rotatedConnection, { ...identity(4), resumeToken: clientToken });
  assert.equal(rotated.ok, true);
  assert.notEqual(rotated.resumeToken, clientToken);
  store._queueReward(rotatedConnection.session, { rewardId: "ack-loss-reward", reward: { crystals: 7 }, source: { kind: "test" } });
  store.disconnect(rotatedConnection.session, rotatedConnection);
  now += 11;
  store.pruneExpired();

  const outbox = store.recoveryOutboxes.get(first.session.playerId);
  assert.equal(outbox.resumeToken, rotated.resumeToken);
  assert.equal(outbox.previousResumeToken, clientToken);
  const recoveredConnection = connection();
  const recovered = store.hello(recoveredConnection, { ...identity(4), resumeToken: clientToken });
  assert.equal(recovered.ok, true);
  assert.equal(recovered.recovered, true);
  assert.equal(recovered.resumeToken, rotated.resumeToken);
  assert.equal(recoveredConnection.session.previousResumeToken, clientToken);
  store.deliverPendingRewards(recoveredConnection.session);
  assert.equal(recoveredConnection.messages.some(message => message.rewardId === "ack-loss-reward"), true);
});

test("build230 recovery queues are bounded and abandoned outboxes expire after 24 hours", () => {
  let now = 20_000;
  const store = new RoomStore({ now: () => now, reconnectGraceMs: 1 });
  const player = hello(store, 3);
  for (let index = 0; index < 400; index++) {
    store._queueReward(player.session, { rewardId: `reward-${index}`, reward: { gold: index }, source: { kind: "test" } });
    player.session.pendingMessages.push({ type: "hostWorldDelta", mutationId: `delta-${index}`, delta: { index } });
  }
  assert.ok(player.session.pendingRewards.length <= 256);
  store.disconnect(player.session, player.conn);
  now += 2;
  store.pruneExpired();
  const outbox = store.recoveryOutboxes.get(player.session.playerId);
  assert.ok(outbox.pendingRewards.length <= 256);
  assert.ok(outbox.pendingMessages.length <= 256);

  now += 24 * 60 * 60_000 + 1;
  const freshConnection = connection();
  const fresh = store.hello(freshConnection, identity(3));
  assert.equal(fresh.ok, true);
  assert.equal(fresh.recovered, false);
  assert.equal(freshConnection.session.pendingRewards.length, 0);
  assert.equal(store.recoveryOutboxes.size, 0);
});

test("build230 leader migration prefers connected members before join order on leave and expiry", () => {
  let now = 30_000;
  const store = new RoomStore({ now: () => now, reconnectGraceMs: 100, randomRoomCode: () => "LEAD30" });
  const leader = hello(store, 4);
  now += 1;
  const earlierOffline = hello(store, 5);
  now += 1;
  const laterOnline = hello(store, 6);
  const roomId = store.createRoom(leader.session).room.roomId;
  store.joinRoom(earlierOffline.session, roomId);
  now += 1;
  store.joinRoom(laterOnline.session, roomId);
  store.disconnect(earlierOffline.session, earlierOffline.conn);
  store.leaveRoom(leader.session);
  assert.equal(store.rooms.get(roomId).leaderId, laterOnline.session.playerId);

  const nextStore = new RoomStore({ now: () => now, reconnectGraceMs: 100, randomRoomCode: () => "LEAD31" });
  const expiringLeader = hello(nextStore, 4);
  const firstOffline = hello(nextStore, 5);
  const connected = hello(nextStore, 6);
  const nextRoomId = nextStore.createRoom(expiringLeader.session).room.roomId;
  nextStore.joinRoom(firstOffline.session, nextRoomId);
  now += 1;
  nextStore.joinRoom(connected.session, nextRoomId);
  nextStore.disconnect(firstOffline.session, firstOffline.conn);
  nextStore.disconnect(expiringLeader.session, expiringLeader.conn);
  expiringLeader.session.expiresAt = now;
  firstOffline.session.expiresAt = now + 10_000;
  nextStore.pruneExpired();
  assert.equal(nextStore.rooms.get(nextRoomId).leaderId, connected.session.playerId);
});
