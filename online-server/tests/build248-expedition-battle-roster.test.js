import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore, sanitizeProfile } from "../src/RoomStore.js";

const IDS = ["AD-ERST-AAAB", "AD-ERST-AAAC", "AD-ERST-AAAD", "AD-ERST-AAAE"];

function connection() {
  return {
    messages: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close() {},
  };
}

function rosterMonster(ownerIndex, rosterIndex) {
  const number = rosterIndex + 1;
  const hp = 800 + ownerIndex * 100 + rosterIndex * 20;
  const mp = 80 + rosterIndex * 5;
  return {
    rosterIndex,
    isPrimary: rosterIndex === 0,
    monsterId: `build248-expedition-${ownerIndex}-${number}`,
    speciesId: "slime",
    monsterName: `探索魔物${ownerIndex}-${number}`,
    fallbackEmoji: "魔",
    level: 20 + rosterIndex,
    stars: 1,
    plus: 0,
    power: 10_000 + ownerIndex * 100 + rosterIndex,
    attribute: "neutral",
    circleId: "none",
    circleName: "魔法陣なし",
    circleLevel: 0,
    circleEffect: "none",
    battleStats: {
      hp,
      mp,
      atk: 300 + rosterIndex * 10,
      matk: 280 + rosterIndex * 10,
      def: 180,
      mdef: 170,
      spd: 100 + rosterIndex,
      crit: 5,
      evasion: 0,
      accuracy: 100,
    },
    currentHp: hp,
    currentMp: mp,
    skills: [{
      id: `build248-skill-${ownerIndex}-${number}`,
      name: `探索技${ownerIndex}-${number}`,
      kind: "attack",
      mp: 1,
      power: 1,
      hits: 1,
    }],
  };
}

function profile(index, rosterSize = 4, { legacy = false } = {}) {
  const roster = Array.from({ length: rosterSize }, (_, rosterIndex) => rosterMonster(index, rosterIndex));
  const primary = roster[0] ?? rosterMonster(index, 0);
  return {
    displayName: index === 0 ? "World owner" : `Guest ${index}`,
    ...primary,
    maxFloor: index === 0 ? 50 : 1,
    captureStock: 0,
    abyssKeyStock: 0,
    explorePickupDone: true,
    ...(legacy ? {} : {
      battleRosterVersion: 1,
      primaryMonsterId: primary.monsterId,
      battleRoster: roster,
    }),
  };
}

function hello(store, index, { resumeToken, rosterSize = 4, legacy = false } = {}) {
  const conn = connection();
  const suppliedProfile = profile(index, rosterSize, { legacy });
  const result = store.hello(conn, {
    friendId: IDS[index],
    clientKey: `build248-expedition-roster-client-${index}`.padEnd(40, "x"),
    resumeToken,
    profile: suppliedProfile,
  });
  assert.equal(result.ok, true, result.message);
  return { conn, result, session: conn.session, profile: suppliedProfile };
}

function startRoom({ players = 2, rosterSizes = [], legacy = [] } = {}) {
  let now = 248_000;
  const store = new RoomStore({
    now: () => now,
    random: () => .49,
    randomRoomCode: () => "ER248X",
    reconnectGraceMs: 5_000,
  });
  const members = Array.from({ length: players }, (_, index) => hello(store, index, {
    rosterSize: rosterSizes[index] ?? 4,
    legacy: Boolean(legacy[index]),
  }));
  const created = store.createRoom(members[0].session);
  assert.equal(created.ok, true);
  const room = store.rooms.get(created.room.roomId);
  for (const member of members.slice(1)) assert.equal(store.joinRoom(member.session, room.roomId).ok, true);
  assert.equal(store.setFloor(members[0].session, 7).ok, true);
  for (const member of members) assert.equal(store.setReady(member.session, true).ok, true);
  const started = store.startExpedition(members[0].session, {
    hostWorld: {
      floorSeeds: { 7: 248_007 },
      openedChestIds: { 7: [] },
      defeatedBossFloors: [],
      claimedBossRewardFloors: [],
    },
  });
  assert.equal(started.ok, true, started.message);
  return {
    store,
    members,
    room,
    advanceTime(ms) { now += ms; },
  };
}

function startBattle(room, store, suffix = "allocation") {
  store._startBattle(room, {
    id: `build248-expedition-roster-${suffix}-1`,
    type: "encounter",
    ...room.expedition.start,
    resolved: true,
  });
  assert.ok(room.expedition.battle);
  return room.expedition.battle;
}

function ownedActors(battle, member) {
  return Object.values(battle.players).filter(actor => actor.ownerPlayerId === member.session.playerId);
}

function rosterIds(actors) {
  return actors.map(actor => actor.monsterId).sort();
}

test("build248 expedition allocates at most four simultaneous monsters across the whole room", () => {
  const { store, members, room } = startRoom({ players: 3, rosterSizes: [6, 4, 4] });
  const battle = startBattle(room, store);
  const actors = Object.values(battle.players);

  assert.equal(actors.length, 4, "the expedition cap is shared by the room, not multiplied per player");
  assert.deepEqual(members.map(member => ownedActors(battle, member).length), [2, 1, 1], "one slot per owner is reserved before room-order round-robin extras");
  for (const member of members) {
    const primary = battle.players[member.session.playerId];
    assert.ok(primary, "every participant receives their primary actor");
    assert.equal(primary.playerId, member.session.playerId);
    assert.equal(primary.combatantId, member.session.playerId);
    assert.equal(primary.ownerPlayerId, member.session.playerId);
    assert.equal(primary.monsterId, member.session.profile.battleRoster[0].monsterId);
    assert.equal(primary.rosterIndex, 0);
    assert.equal(primary.isPrimary, true);
  }
  const extra = battle.players[`${members[0].session.playerId}:m2`];
  assert.ok(extra);
  assert.equal(extra.combatantId, `${members[0].session.playerId}:m2`);
  assert.equal(extra.ownerPlayerId, members[0].session.playerId);
  assert.equal(extra.monsterId, members[0].session.profile.battleRoster[1].monsterId);
  assert.equal(extra.rosterIndex, 1);
  assert.equal(extra.isPrimary, false);
  assert.equal(members[0].session.profile.battleRoster.length, 4, "the server retains only the bounded sanitized roster");
});

test("build248 expedition actions are keyed by actor and restricted to that actor's owner", () => {
  const { store, members: [owner, guest], room } = startRoom({ players: 2 });
  const battle = startBattle(room, store, "actions");
  const ownerActors = ownedActors(battle, owner);
  const guestActors = ownedActors(battle, guest);
  assert.deepEqual(ownerActors.map(actor => actor.playerId), [owner.session.playerId, `${owner.session.playerId}:m2`]);
  assert.equal(guestActors.length, 2);

  const foreign = store.submitBattleAction(owner.session, { actorId: guestActors[0].playerId, kind: "guard" });
  assert.equal(foreign.ok, false);
  assert.equal(foreign.code, "BAD_ACTOR");
  assert.deepEqual(battle.actions, {});

  assert.equal(store.submitBattleAction(owner.session, { kind: "guard" }).ok, true);
  assert.ok(battle.actions[ownerActors[0].playerId], "omitting actorId chooses the first living unsubmitted owned actor");
  const primarySkillId = owner.session.profile.battleRoster[0].skills[0].id;
  const extraSkillId = owner.session.profile.battleRoster[1].skills[0].id;
  assert.equal(store.submitBattleAction(owner.session, {
    actorId: ownerActors[1].playerId,
    kind: "skill",
    skillId: primarySkillId,
    targetId: battle.enemies[0].id,
  }).code, "BAD_SKILL", "an actor cannot borrow another owned monster's skill payload");
  assert.equal(store.submitBattleAction(owner.session, {
    kind: "skill",
    skillId: extraSkillId,
    targetId: battle.enemies[0].id,
  }).ok, true);
  assert.ok(battle.actions[ownerActors[1].playerId], "the next omitted actorId advances to the next owned actor");
  assert.equal(battle.actions[ownerActors[1].playerId].skillId, extraSkillId);
  const duplicate = store.submitBattleAction(owner.session, { actorId: ownerActors[1].playerId, kind: "attack" });
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.duplicate, true);

  let finalAction;
  for (const actor of guestActors) {
    finalAction = store.submitBattleAction(guest.session, { actorId: actor.playerId, kind: "guard" });
    assert.equal(finalAction.ok, true);
  }
  assert.deepEqual(Object.keys(battle.actions).sort(), Object.keys(battle.players).sort(), "all four simultaneous actors submit independently");
  for (const actorId of Object.keys(battle.players)) assert.equal(finalAction.battle.actions[actorId].actorId, actorId, "snapshots retain the actor identity for each submitted command");
  assert.equal(battle.phase, "result");
});

test("build248 expedition cheer unlocks only after every actor owned by that player is down", () => {
  const { store, members: [owner, guest], room } = startRoom({ players: 2 });
  const battle = startBattle(room, store, "cheer");
  const ownerActors = ownedActors(battle, owner);
  const livingAllies = ownedActors(battle, guest);
  assert.equal(ownerActors.length, 2);
  assert.equal(livingAllies.length, 2);

  ownerActors[0].hp = 0;
  ownerActors[1].hp = 1;
  const tooEarly = store.battleCheer(owner.session, { mode: "explore" });
  assert.equal(tooEarly.ok, false);
  assert.equal(tooEarly.code, "NOT_SPECTATING", "a downed primary cannot cheer while another owned actor still lives");
  assert.equal(battle.cheeredBy?.includes(owner.session.playerId) ?? false, false);

  ownerActors[1].hp = 0;
  const cheered = store.battleCheer(owner.session, { mode: "explore" });
  assert.equal(cheered.ok, true);
  assert.deepEqual(battle.cheeredBy, [owner.session.playerId]);
  for (const ally of livingAllies) {
    assert.ok(ally.effects.some(effect => effect.kind === "atkUp" && effect.value >= .03));
    assert.ok(ally.effects.some(effect => effect.kind === "defUp" && effect.value >= .03));
  }
  assert.equal(store.battleCheer(owner.session, { mode: "explore" }).code, "CHEER_USED");
});

test("build248 expedition victory settles one owner reward and one receipt with per-monster EXP", () => {
  const { store, members, room } = startRoom({ players: 2 });
  const battle = startBattle(room, store, "settlement");
  const expectedByOwner = new Map(members.map(member => [member.session.playerId, rosterIds(ownedActors(battle, member))]));
  for (const member of members) {
    for (const actor of ownedActors(battle, member)) {
      battle.skillUses[actor.playerId] = { [`skill-use-${actor.rosterIndex}`]: actor.rosterIndex + 1 };
    }
  }
  for (const enemy of battle.enemies) enemy.hp = 0;

  const first = store._finishBattleVictory(room, battle);
  assert.notEqual(first?.ok, false, first?.message);
  for (const member of members) {
    const rewards = member.session.pendingRewards.filter(entry => entry.source?.kind === "battle");
    const receipts = member.session.pendingMessages.filter(entry => entry.type === "battleDefeated");
    assert.equal(rewards.length, 1, "gold, crystals, drops and EXP use one idempotent owner settlement");
    assert.equal(receipts.length, member === members[0] ? 1 : 0, "only the world owner receives a progression battle receipt");
    assert.ok(Number.isFinite(rewards[0].reward.gold));
    assert.ok(Array.isArray(rewards[0].reward.experienceRoster));
    assert.deepEqual(rewards[0].reward.experienceRoster.map(entry => entry.monsterId).sort(), expectedByOwner.get(member.session.playerId));
    for (const entry of rewards[0].reward.experienceRoster) assert.ok(Number.isFinite(entry.experience) && entry.experience >= 0);
    assert.ok(Array.isArray(rewards[0].reward.skillUsesRoster));
    assert.deepEqual(rewards[0].reward.skillUsesRoster, ownedActors(battle, member).map(actor => ({
      monsterId: actor.monsterId,
      rosterIndex: actor.rosterIndex,
      skillUses: { [`skill-use-${actor.rosterIndex}`]: actor.rosterIndex + 1 },
    })));
    assert.deepEqual(rewards[0].reward.skillUses, { "skill-use-0": 1 }, "the legacy scalar applies only to the primary monster");
    assert.equal(rewards[0].reward.skillUses["skill-use-1"], undefined, "secondary uses cannot be double-applied to the primary");
    if (member === members[0]) {
      assert.equal(receipts[0].worldOwnerId, members[0].session.playerId);
      assert.equal(receipts[0].progressionEligible, true);
    }
  }

  store._finishBattleVictory(room, battle);
  for (const member of members) {
    assert.equal(member.session.pendingRewards.filter(entry => entry.source?.kind === "battle").length, 1, "a retried finish cannot duplicate the owner reward");
    assert.equal(member.session.pendingMessages.filter(entry => entry.type === "battleDefeated").length, member === members[0] ? 1 : 0, "a retried finish cannot create or duplicate a progression receipt");
  }
});

test("build248 expedition vitals preserve the primary legacy fields and every roster actor across reconnect", () => {
  const { store, members: [owner], room } = startRoom({ players: 1 });
  const startedVitals = owner.session.pendingMessages.findLast(message => message.type === "expeditionVitals" && message.reason === "start");
  assert.ok(startedVitals);
  assert.equal(startedVitals.rosterVitals.length, 4);
  const battle = startBattle(room, store, "reconnect");
  const actors = ownedActors(battle, owner);
  actors.forEach((actor, index) => {
    actor.hp = actor.maxHp - (index + 1) * 11;
    actor.mp = Math.max(0, actor.maxMp - (index + 1) * 3);
  });

  assert.equal(store._syncDepartingExpeditionVitals(room, owner.session, "build248Reconnect"), true);
  const persisted = owner.session.pendingMessages.findLast(message => message.type === "expeditionVitals");
  assert.equal(persisted.reason, "build248Reconnect");
  assert.equal(persisted.rosterVitals.length, 4);
  for (const actor of actors) {
    const entry = persisted.rosterVitals.find(item => item.monsterId === actor.monsterId);
    assert.ok(entry, `missing vitals for ${actor.monsterId}`);
    assert.equal(entry.hp, actor.hp);
    assert.equal(entry.maxHp, actor.maxHp);
    assert.equal(entry.mp, actor.mp);
    assert.equal(entry.maxMp, actor.maxMp);
  }
  const primary = battle.players[owner.session.playerId];
  assert.equal(persisted.hp, primary.hp, "legacy hp mirrors the primary actor");
  assert.equal(persisted.maxHp, primary.maxHp);
  assert.equal(persisted.mp, primary.mp, "legacy mp mirrors the primary actor");
  assert.equal(persisted.maxMp, primary.maxMp);

  const resumeToken = owner.result.resumeToken;
  store.disconnect(owner.session, owner.conn);
  const resumed = hello(store, 0, { resumeToken });
  assert.equal(resumed.result.resumed, true);
  const resumedActors = resumed.result.room.expedition.battle.players;
  for (const actor of actors) {
    const entry = resumedActors.find(item => item.combatantId === actor.combatantId);
    assert.ok(entry, `missing reconnected actor ${actor.combatantId}`);
    assert.equal(entry.hp, actor.hp);
    assert.equal(entry.mp, actor.mp);
  }
  resumed.conn.messages.length = 0;
  assert.equal(store.deliverPendingRewards(resumed.session), true);
  const replayed = resumed.conn.messages.findLast(message => message.type === "expeditionVitals");
  assert.deepEqual(replayed.rosterVitals, persisted.rosterVitals, "the latest full roster vitals remain recoverable after reconnect");
  assert.equal(replayed.hp, persisted.hp);
  assert.equal(replayed.mp, persisted.mp);
});

test("build248 legacy expedition profiles still create one primary actor and one roster-vitals entry", () => {
  const { store, members: [owner], room } = startRoom({ players: 1, rosterSizes: [1], legacy: [true] });
  const battle = startBattle(room, store, "legacy");
  const actors = Object.values(battle.players);
  assert.equal(actors.length, 1);
  assert.equal(actors[0].playerId, owner.session.playerId);
  assert.equal(actors[0].combatantId, owner.session.playerId);
  assert.equal(actors[0].ownerPlayerId, owner.session.playerId);
  assert.equal(actors[0].monsterId, owner.session.profile.monsterId);
  assert.equal(store.submitBattleAction(owner.session, { kind: "guard" }).ok, true);
  assert.ok(battle.actions[owner.session.playerId]);

  const vitals = owner.session.pendingMessages.findLast(message => message.type === "expeditionVitals");
  assert.equal(vitals.rosterVitals.length, 1);
  assert.equal(vitals.rosterVitals[0].monsterId, owner.session.profile.monsterId);
  assert.equal(vitals.hp, vitals.rosterVitals[0].hp);
  assert.equal(vitals.mp, vitals.rosterVitals[0].mp);
});

test("build248 a legacy primary-vitals update is authoritative for the next roster battle", () => {
  const { store, members: [owner], room } = startRoom({ players: 1 });
  const stalePrimary = owner.session.coopRosterVitals.find(entry => entry.isPrimary);
  assert.ok(stalePrimary);
  assert.notEqual(stalePrimary.hp, 123);
  assert.notEqual(stalePrimary.mp, 7);

  // Older exploration paths and clients update only these primary mirror fields.
  owner.session.coopVitals = {
    hp: 123,
    maxHp: owner.session.profile.battleStats.hp,
    mp: 7,
    maxMp: owner.session.profile.battleStats.mp,
  };
  const battle = startBattle(room, store, "legacy-primary-mirror");
  const primary = battle.players[owner.session.playerId];
  assert.equal(primary.hp, 123, "the stale roster copy must not restore HP");
  assert.equal(primary.mp, 7, "the stale roster copy must not restore MP");
  assert.equal(owner.session.coopRosterVitals.find(entry => entry.isPrimary).hp, 123);
  assert.equal(owner.session.coopRosterVitals.find(entry => entry.isPrimary).mp, 7);
});

test("build248 profile sanitizer stably deduplicates monster ids while retaining distinct null-id roster slots", () => {
  const base = profile(0, 1);
  const duplicateFirst = { ...rosterMonster(0, 1), monsterId: "build248-duplicate", currentHp: 511 };
  const duplicateLater = { ...rosterMonster(0, 2), monsterId: "build248-duplicate", currentHp: 522 };
  const anonymousFirst = { ...rosterMonster(0, 2), monsterId: null, monsterName: "匿名A", currentHp: 533 };
  const anonymousSecond = { ...rosterMonster(0, 3), monsterId: null, monsterName: "匿名B", currentHp: 544 };
  const sanitized = sanitizeProfile({
    ...base,
    battleRosterVersion: 1,
    primaryMonsterId: base.monsterId,
    battleRoster: [base.battleRoster[0], duplicateFirst, duplicateLater, anonymousFirst, anonymousSecond],
  });

  assert.deepEqual(sanitized.battleRoster.map(entry => entry.monsterId), [base.monsterId, "build248-duplicate", null, null]);
  assert.deepEqual(sanitized.battleRoster.map(entry => entry.rosterIndex), [0, 1, 2, 3]);
  assert.equal(sanitized.battleRoster[1].currentHp, 511, "the first duplicate is retained deterministically");
  assert.deepEqual(sanitized.battleRoster.slice(2).map(entry => entry.monsterName), ["匿名A", "匿名B"], "null ids remain distinct by input position");

  const { store, members: [owner], room } = startRoom({ players: 1 });
  owner.session.profile = sanitized;
  owner.session.coopVitals = {
    hp: sanitized.battleRoster[0].currentHp,
    maxHp: sanitized.battleRoster[0].battleStats.hp,
    mp: sanitized.battleRoster[0].currentMp,
    maxMp: sanitized.battleRoster[0].battleStats.mp,
  };
  owner.session.coopRosterVitals = sanitized.battleRoster.map(entry => ({
    monsterId: entry.monsterId,
    rosterIndex: entry.rosterIndex,
    isPrimary: entry.isPrimary,
    hp: entry.currentHp,
    maxHp: entry.battleStats.hp,
    mp: entry.currentMp,
    maxMp: entry.battleStats.mp,
  }));
  const battle = startBattle(room, store, "null-vitals");
  assert.equal(Object.values(battle.players).find(actor => actor.rosterIndex === 2).hp, 533);
  assert.equal(Object.values(battle.players).find(actor => actor.rosterIndex === 3).hp, 544, "the second null-id actor cannot inherit the first null-id actor's vitals");
});

test("build248 capture stock is one owner-shared attempt usable by any living roster actor", () => {
  const { store, members: [owner], room } = startRoom({ players: 1 });
  owner.session.profile.captureStock = 1;
  const battle = startBattle(room, store, "owner-capture");
  const actors = ownedActors(battle, owner);
  const target = battle.enemies.find(enemy => !enemy.boss && !enemy.uncapturable);
  assert.ok(target);
  target.hp = Math.max(1, Math.floor(target.maxHp * .2));
  actors[0].hp = 0;
  assert.ok(actors.slice(1).every(actor => actor.captureCharges === 1), "every actor advertises the owner's available attempt");

  const accepted = store.submitBattleAction(owner.session, {
    actorId: actors[1].playerId,
    kind: "capture",
    targetId: target.id,
  });
  assert.equal(accepted.ok, true);
  assert.ok(actors.every(actor => actor.captureCharges === 0), "submitting one capture reserves the owner-shared attempt immediately");
  const duplicate = store.submitBattleAction(owner.session, {
    actorId: actors[2].playerId,
    kind: "capture",
    targetId: target.id,
  });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.code, "NO_CAPTURE");

  for (const actor of actors.slice(2)) assert.equal(store.submitBattleAction(owner.session, { actorId: actor.playerId, kind: "guard" }).ok, true);
  assert.equal(battle.phase, "result");
  assert.equal(owner.session.pendingRewards.filter(entry => entry.source?.kind === "battleCapture").length, 1, "one owner can incur only one capture cost/result per battle");
});
