import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";
import { MAX_TRADE_PERSISTED_MESSAGE_BYTES } from "../src/TradeCoordinator.js";

function connection() {
  return { messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close() {} };
}

function hello(store, suffix) {
  const conn = connection();
  const result = store.hello(conn, {
    friendId: `AD-TRDE-T${suffix}Z2`,
    clientKey: `trade-guard-client-${suffix}`.padEnd(32, "x"),
    profile: { displayName: `Trader ${suffix}`, speciesId: "slime", maxFloor: 100 },
  });
  assert.equal(result.ok, true);
  return { conn, result, session: conn.session };
}

function roomSetup(options = {}) {
  const store = new RoomStore({ randomRoomCode: () => "TRD230", ...options });
  const left = hello(store, "B");
  const right = hello(store, "C");
  const created = store.createRoom(left.session);
  assert.equal(store.joinRoom(right.session, created.room.roomId).ok, true);
  store.setReady(left.session, true);
  store.setReady(right.session, true);
  return { store, left, right, room: store.rooms.get(created.room.roomId) };
}

function request(env) {
  const result = env.store.requestTrade(env.left.session, env.right.session.playerId);
  assert.equal(result.ok, true);
  return result.trade.tradeId;
}

const gold = amount => ({
  assetId: `currency:gold:${amount}`,
  kind: "currency",
  name: "GOLD",
  payload: { key: "gold", amount },
});

test("build230 blocks every online content start while any room member has a live trade", () => {
  const env = roomSetup();
  const tradeId = request(env);
  for (const result of [
    env.store.startExpedition(env.left.session, {}),
    env.store.startRaid(env.left.session, {}),
    env.store.startTeamBattle(env.left.session),
  ]) {
    assert.equal(result.ok, false);
    assert.equal(result.code, "TRADE_ACTIVE");
  }
  assert.equal(env.store.startResonance(env.left.session).code, "RESONANCE_INTEGRATED");
  assert.equal(env.room.phase, "lobby");
  assert.equal(env.store.cancelTrade(env.left.session, tradeId).ok, true);
  assert.equal(env.store.startExpedition(env.left.session, {}).ok, true);
});

test("build230 rejects trade mutations outside the original shared lobby while cancel and ack remain available", () => {
  const env = roomSetup();
  const firstTradeId = request(env);
  env.room.phase = "expedition";
  const phaseInvalid = env.store.respondTrade(env.right.session, firstTradeId, true);
  assert.equal(phaseInvalid.code, "TRADE_CONTEXT_INVALID");
  assert.equal(env.store.cancelTrade(env.left.session, firstTradeId).ok, true);

  env.room.phase = "lobby";
  const secondTradeId = request(env);
  assert.equal(env.store.respondTrade(env.right.session, secondTradeId, true).ok, true);
  env.right.session.roomId = "OTHER2";
  assert.equal(env.store.offerTrade(env.left.session, secondTradeId, gold(10)).code, "TRADE_CONTEXT_INVALID");
  assert.equal(env.store.readyTrade(env.left.session, secondTradeId, true).code, "TRADE_CONTEXT_INVALID");
  assert.equal(env.store.confirmTrade(env.left.session, secondTradeId).code, "TRADE_CONTEXT_INVALID");
  const ack = env.store.ackTrade(env.left.session, secondTradeId, true);
  assert.notEqual(ack.code, "TRADE_CONTEXT_INVALID");
  assert.equal(ack.code, "TRADE_STATE");
  assert.equal(env.store.cancelTrade(env.left.session, secondTradeId).ok, true);
});

test("build230 replaceTrade persistence leaves one terminal recovery payload and protects its escrow id", () => {
  let now = 50_000;
  const env = roomSetup({ now: () => now });
  const tradeId = request(env);
  assert.equal(env.store.respondTrade(env.right.session, tradeId, true).ok, true);
  assert.equal(env.store.offerTrade(env.left.session, tradeId, gold(100)).ok, true);
  assert.equal(env.store.offerTrade(env.right.session, tradeId, gold(200)).ok, true);
  assert.equal(env.store.readyTrade(env.left.session, tradeId, true).ok, true);
  assert.equal(env.store.readyTrade(env.right.session, tradeId, true).ok, true);
  assert.equal(env.store.confirmTrade(env.left.session, tradeId).ok, true);
  assert.equal(env.store.confirmTrade(env.right.session, tradeId).trade.state, "committing");

  for (const player of [env.left, env.right]) {
    assert.deepEqual(player.session.pendingMessages.filter(message => message.tradeId === tradeId).map(message => message.type), ["tradeCommit"]);
  }
  const trade = env.store.trade.trades.get(tradeId);
  trade.commitDeadlineAt = now;
  env.store.trade.prune();
  for (const player of [env.left, env.right]) {
    const persisted = player.session.pendingMessages.filter(message => message.tradeId === tradeId);
    assert.deepEqual(persisted.map(message => message.type), ["tradeRecoveryPending"]);
    assert.equal(persisted[0].terminal, true);
    assert.deepEqual(env.store.trade.protectedTradeIdsFor(player.session.playerId), [tradeId]);
  }
});

test("build230 persists a 70 KiB trade commit and terminal recovery through session outbox recovery", () => {
  let now = 70_000;
  const env = roomSetup({ now: () => now, reconnectGraceMs: 10 });
  const tradeId = request(env);
  const rightResumeToken = env.right.session.resumeToken;
  assert.equal(env.store.respondTrade(env.right.session, tradeId, true).ok, true);
  const largeAsset = { assetId: "equipment:large", kind: "equipment", name: "大型継承装備", payload: { blob: "x".repeat(70 * 1024) } };
  assert.equal(env.store.offerTrade(env.left.session, tradeId, largeAsset).ok, true);
  assert.equal(env.store.offerTrade(env.right.session, tradeId, gold(200)).ok, true);
  assert.equal(env.store.readyTrade(env.left.session, tradeId, true).ok, true);
  assert.equal(env.store.readyTrade(env.right.session, tradeId, true).ok, true);
  assert.equal(env.store.confirmTrade(env.left.session, tradeId).ok, true);
  assert.equal(env.store.confirmTrade(env.right.session, tradeId).trade.state, "committing");

  const commit = env.right.session.pendingMessages.find(message => message.type === "tradeCommit" && message.tradeId === tradeId);
  assert.ok(commit);
  assert.ok(Buffer.byteLength(JSON.stringify(commit), "utf8") > 64 * 1024);
  assert.ok(Buffer.byteLength(JSON.stringify(commit), "utf8") <= MAX_TRADE_PERSISTED_MESSAGE_BYTES);
  env.store.disconnect(env.right.session, env.right.conn);
  const trade = env.store.trade.trades.get(tradeId);
  trade.commitDeadlineAt = now;
  env.store.trade.prune();
  const terminal = env.right.session.pendingMessages.filter(message => message.tradeId === tradeId);
  assert.deepEqual(terminal.map(message => message.type), ["tradeRecoveryPending"]);
  assert.ok(Buffer.byteLength(JSON.stringify(terminal[0]), "utf8") > 64 * 1024);

  now += 11;
  env.store.pruneExpired();
  const outbox = env.store.recoveryOutboxes.get(env.right.session.playerId);
  assert.deepEqual(outbox.pendingMessages.filter(message => message.tradeId === tradeId).map(message => message.type), ["tradeRecoveryPending"]);

  const recoveredConnection = connection();
  const recovered = env.store.hello(recoveredConnection, {
    friendId: env.right.session.playerId,
    clientKey: env.right.session.clientKey,
    resumeToken: rightResumeToken,
    profile: env.right.session.profile,
  });
  assert.equal(recovered.ok, true);
  env.store.deliverPendingRewards(recoveredConnection.session);
  const delivered = recoveredConnection.messages.filter(message => message.type === "tradeRecoveryPending" && message.tradeId === tradeId);
  assert.equal(delivered.length, 1);
  assert.equal(delivered[0].incomingAsset.payload.blob.length, 70 * 1024);
});

test("build230 resends coordinator recovery after the 24-hour session outbox is gone", () => {
  let now = 90_000;
  const env = roomSetup({ now: () => now, reconnectGraceMs: 10 });
  const roomId = env.room.roomId;
  const tradeId = request(env);
  const rightResumeToken = env.right.session.resumeToken;
  assert.equal(env.store.respondTrade(env.right.session, tradeId, true).ok, true);
  assert.equal(env.store.offerTrade(env.left.session, tradeId, gold(10)).ok, true);
  assert.equal(env.store.offerTrade(env.right.session, tradeId, gold(20)).ok, true);
  assert.equal(env.store.readyTrade(env.left.session, tradeId, true).ok, true);
  assert.equal(env.store.readyTrade(env.right.session, tradeId, true).ok, true);
  env.store.confirmTrade(env.left.session, tradeId);
  env.store.confirmTrade(env.right.session, tradeId);
  env.store.disconnect(env.right.session, env.right.conn);
  env.store.trade.trades.get(tradeId).commitDeadlineAt = now;
  env.store.trade.prune();
  now += 11;
  env.store.pruneExpired();
  assert.equal(env.store.recoveryOutboxes.has(env.right.session.playerId), true);
  now += 24 * 60 * 60_000 + 1;
  env.store.pruneExpired();
  assert.equal(env.store.recoveryOutboxes.has(env.right.session.playerId), false);

  const attackerConnection = connection();
  const attacker = env.store.hello(attackerConnection, {
    friendId: env.right.session.playerId,
    clientKey: "attacker-client-secret".padEnd(32, "x"),
    resumeToken: rightResumeToken,
    profile: env.right.session.profile,
  });
  assert.equal(attacker.ok, false);
  assert.equal(attacker.code, "ID_IN_USE");
  assert.equal(attackerConnection.session, undefined);
  assert.equal(attackerConnection.messages.some(message => message.type === "tradeRecoveryPending"), false);

  const missingTokenConnection = connection();
  const missingToken = env.store.hello(missingTokenConnection, {
    friendId: env.right.session.playerId,
    clientKey: env.right.session.clientKey,
    profile: env.right.session.profile,
  });
  assert.equal(missingToken.ok, false);
  assert.equal(missingToken.code, "RESUME_TOKEN_MISMATCH");
  assert.equal(missingTokenConnection.session, undefined);

  const forgedAck = env.store.ackTrade({
    playerId: env.right.session.playerId,
    clientKey: "attacker-client-secret".padEnd(32, "x"),
    resumeToken: rightResumeToken,
    pendingMessages: [],
  }, tradeId, true);
  assert.equal(forgedAck.ok, false);
  assert.equal(forgedAck.code, "TRADE_CREDENTIAL_MISMATCH");
  assert.deepEqual(env.store.trade.protectedTradeIdsFor(env.right.session.playerId), [tradeId]);

  const freshConnection = connection();
  const fresh = env.store.hello(freshConnection, {
    friendId: env.right.session.playerId,
    clientKey: env.right.session.clientKey,
    resumeToken: rightResumeToken,
    profile: env.right.session.profile,
  });
  assert.equal(fresh.ok, true);
  assert.equal(fresh.recovered, true);
  assert.notEqual(fresh.resumeToken, rightResumeToken);
  assert.equal(freshConnection.session.previousResumeToken, rightResumeToken);
  assert.equal(freshConnection.session.roomId, null, "expired membership must not be restored");
  assert.deepEqual(env.store.trade.protectedTradeIdsFor(env.right.session.playerId), [tradeId]);
  env.store.deliverPendingRewards(freshConnection.session);
  assert.equal(freshConnection.messages.filter(message => message.type === "tradeRecoveryPending" && message.tradeId === tradeId).length, 1);
  assert.equal(env.store.ackTrade(freshConnection.session, tradeId, true).ok, true);
  assert.deepEqual(env.store.trade.protectedTradeIdsFor(env.right.session.playerId), []);
  assert.equal(env.store.joinRoom(freshConnection.session, roomId).ok, true);
  assert.equal(env.store.requestTrade(freshConnection.session, env.left.session.playerId).ok, true);
});
