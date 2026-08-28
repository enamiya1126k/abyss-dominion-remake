import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";
import {
  COOP_TECHNIQUE_CATALOG,
  coopTechniqueRecipes,
  detectCoopTechnique,
} from "../src/CoopTechniqueCatalog.js";

function connection() {
  return {
    messages: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close() {},
  };
}

function profile(index) {
  return {
    displayName: `連携試験-${index}`,
    speciesId: "slime",
    visualSpeciesId: "slime",
    maxFloor: 10_000,
    level: 100,
    currentHp: 20_000,
    currentMp: 1_000,
    captureStock: 4,
    battleStats: {
      hp: 20_000,
      mp: 1_000,
      atk: 300,
      matk: 300,
      def: 4_000,
      mdef: 4_000,
      spd: 400 - index,
      crit: 0,
      evasion: 0,
      accuracy: 100,
    },
    skills: [
      { id: "test-strike", name: "試験斬", kind: "attack", mp: 0, power: .1, hits: 1, element: "fire" },
      { id: "test-heal", name: "試験治癒", kind: "heal", mp: 0, heal: .1 },
      { id: "test-guard", name: "試験障壁", kind: "guard", mp: 0 },
    ],
  };
}

function hello(store, index) {
  const conn = connection();
  const suffix = "BCDE"[index - 1];
  const result = store.hello(conn, {
    friendId: `AD-ARTS-AAA${suffix}`,
    clientKey: `build228-link-arts-${index}`.padEnd(32, "x"),
    profile: profile(index),
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session, hello: result };
}

function startBattle(count, { battleReconnectActionGraceMs = 100 } = {}) {
  let now = 228_000;
  const store = new RoomStore({
    now: () => now,
    battleReconnectActionGraceMs,
    randomRoomCode: () => `LA${count}228`,
    random: () => .5,
  });
  const players = Array.from({ length: count }, (_, index) => hello(store, index + 1));
  const created = store.createRoom(players[0].session);
  assert.equal(created.ok, true);
  for (const player of players.slice(1)) assert.equal(store.joinRoom(player.session, created.room.roomId).ok, true);
  for (const player of players) assert.equal(store.setReady(player.session, true).ok, true);
  assert.equal(store.startExpedition(players[0].session, {
    hostWorld: { floorSeeds: {}, openedChestIds: {}, defeatedBossFloors: [] },
  }).ok, true);
  const room = store.rooms.get(created.room.roomId);
  const position = room.expedition.start;
  store._startBattle(room, {
    id: `build228-encounter-${count}`,
    type: "encounter",
    x: position.x,
    y: position.y,
    resolved: true,
  });
  const battle = room.expedition.battle;
  assert.ok(battle);
  for (const enemy of battle.enemies) {
    enemy.maxHp = 1_000_000_000;
    enemy.hp = enemy.maxHp;
    enemy.def = 1_000_000_000;
    enemy.mdef = 1_000_000_000;
    enemy.atk = 1;
    enemy.matk = 1;
    enemy.spd = 1;
    enemy.crit = 0;
    enemy.effects = [];
  }
  const enemy = battle.enemies[0];
  return {
    store,
    room,
    battle,
    enemy,
    players,
    advance(ms = 1) { now += ms; },
  };
}

const action = {
  attack(targetId, auto = false) { return { kind: "attack", targetId, auto }; },
  strike(targetId, auto = false) { return { kind: "skill", skillId: "test-strike", targetId, auto }; },
  guard(playerId, auto = false) { return { kind: "guard", targetId: playerId, auto }; },
  heal(playerId, auto = false) { return { kind: "skill", skillId: "test-heal", targetId: playerId, auto }; },
};

function playerIds(env) {
  return env.players.map(player => player.session.playerId);
}

function setActions(env, rows) {
  const ids = playerIds(env);
  env.battle.actions = Object.fromEntries(rows.map((factory, index) => [ids[index], factory(ids[index])]));
}

function effect(entity, kind) {
  return (entity.effects ?? []).find(entry => entry.kind === kind);
}

test("build228 detector is deterministic and honors recipe priority", () => {
  const attack = (playerId, targetId = "enemy-a") => ({ playerId, action: { kind: "attack", targetId } });
  const guard = playerId => ({ playerId, action: { kind: "guard", targetId: playerId } });
  const support = playerId => ({ playerId, action: { kind: "skill", skillId: "heal", targetId: playerId }, skillKind: "heal" });

  const triadRows = [attack("p4"), support("p3"), guard("p2"), attack("p1")];
  const triad = detectCoopTechnique(triadRows);
  const reversed = detectCoopTechnique([...triadRows].reverse());
  assert.equal(triad?.id, "triad-dominion");
  assert.equal(triad?.points, 3);
  assert.deepEqual(reversed, triad, "submission order must not alter the selected LINK ART");

  const assaultOverGuard = detectCoopTechnique([guard("p3"), attack("p2"), attack("p1")]);
  assert.equal(assaultOverGuard?.id, "resonance-break");
  assert.deepEqual(assaultOverGuard?.actorIds, ["p1", "p2"]);
  assert.equal(assaultOverGuard?.points, 1);

  assert.equal(detectCoopTechnique([attack("p1"), attack("p2"), attack("p3")])?.points, 2);
  assert.equal(detectCoopTechnique([attack("p1"), attack("p2"), attack("p3"), attack("p4")])?.points, 3);
  assert.equal(detectCoopTechnique([attack("p1", "enemy-a"), attack("p2", "enemy-b")]), null);
  assert.equal(detectCoopTechnique([{ playerId: "p1", action: { kind: "capture", targetId: "enemy-a" } }, attack("p2")]), null);
  assert.equal(detectCoopTechnique([attack("p1"), attack("p1")]), null, "one duplicated player must never form a LINK");
  assert.deepEqual(
    detectCoopTechnique([attack("p2"), attack("p1"), attack("p1")])?.actorIds,
    ["p1", "p2"],
    "public detector must normalize duplicate player rows",
  );

  const recipes = coopTechniqueRecipes();
  assert.deepEqual(new Set(recipes.map(entry => entry.id)), new Set(Object.keys(COOP_TECHNIQUE_CATALOG)));
  recipes[0].name = "mutated";
  assert.notEqual(coopTechniqueRecipes()[0].name, "mutated", "catalog recipes must be returned as clones");
});

test("build228 keeps solo online battles completely outside LINK ARTS", () => {
  const env = startBattle(1);
  assert.equal(env.room.expedition.coop.enabled, false);
  assert.equal(env.battle.coopBreak, null);
  const snapshot = env.store.roomSnapshot(env.room).expedition.battle;
  assert.equal(snapshot.coopBreak, null);
  assert.equal(snapshot.coopTechnique, null);

  env.battle.actions = { [env.players[0].session.playerId]: action.attack(env.enemy.id) };
  let randomCalls = 0;
  env.store.random = () => { randomCalls += 1; return .5; };
  const events = [];
  assert.equal(env.store._resolveCoopTechnique(env.room, env.battle, events), null);
  assert.deepEqual(events, []);
  assert.equal(env.battle.coopBreak, null);
  assert.equal(randomCalls, 0, "solo LINK ARTS gating must not consume combat RNG");
});

test("build228 fills the shared gauge and applies each of the five LINK ARTS", () => {
  const cases = [
    {
      id: "resonance-break", count: 2, gauge: 5,
      actions: env => setActions(env, [() => action.attack(env.enemy.id), () => action.attack(env.enemy.id)]),
      verify: env => assert.deepEqual(effect(env.enemy, "vulnerable"), { kind: "vulnerable", value: .35, turns: 2 }),
    },
    {
      id: "aegis-cross", count: 2, gauge: 4,
      actions: env => setActions(env, [() => action.attack(env.enemy.id), id => action.guard(id)]),
      verify: env => assert.ok(Object.values(env.battle.players).every(player => player.shield === Math.ceil(player.maxHp * .1))),
    },
    {
      id: "battle-chorus", count: 2, gauge: 4,
      actions: env => setActions(env, [() => action.attack(env.enemy.id), id => action.heal(id)]),
      verify: env => assert.ok(Object.values(env.battle.players).every(player => effect(player, "atkUp")?.value === .1 && effect(player, "atkUp")?.turns === 2)),
    },
    {
      id: "life-chorus", count: 2, gauge: 4,
      prepare: env => { for (const player of Object.values(env.battle.players)) { player.hp = player.maxHp / 2; player.mp = player.maxMp / 2; } },
      actions: env => setActions(env, [id => action.heal(id), id => action.heal(id)]),
      verify: env => assert.ok(Object.values(env.battle.players).every(player => player.hp === player.maxHp / 2 + Math.ceil(player.maxHp * .1) && player.mp === player.maxMp / 2 + Math.ceil(player.maxMp * .06))),
    },
    {
      id: "triad-dominion", count: 3, gauge: 3,
      actions: env => setActions(env, [() => action.attack(env.enemy.id), id => action.guard(id), id => action.heal(id)]),
      verify: env => {
        assert.deepEqual(effect(env.enemy, "vulnerable"), { kind: "vulnerable", value: .15, turns: 2 });
        assert.ok(Object.values(env.battle.players).every(player => player.shield === Math.ceil(player.maxHp * .1)));
        assert.ok(Object.values(env.battle.players).every(player => effect(player, "atkUp")?.value === .1));
      },
    },
  ];

  for (const scenario of cases) {
    const env = startBattle(scenario.count);
    scenario.prepare?.(env);
    env.battle.coopBreak.gauge = scenario.gauge;
    scenario.actions(env);
    const events = [];
    const art = env.store._resolveCoopTechnique(env.room, env.battle, events);

    assert.equal(events.filter(event => event.kind === "link").length, 1, scenario.id);
    assert.equal(events[0].techniqueId, scenario.id);
    assert.equal(art?.kind, "coopBreak", scenario.id);
    assert.equal(art?.techniqueId, scenario.id);
    assert.equal(env.battle.coopBreak.gauge, 0, scenario.id);
    assert.equal(env.battle.coopBreak.totalUses, 1, scenario.id);
    assert.equal(env.battle.coopBreak.usesById[scenario.id], 1, scenario.id);
    assert.equal(env.battle.coopBreak.lastTechnique.id, scenario.id);
    scenario.verify(env);
  }
});

test("build228 resolves at most one prioritized LINK ART in a round", () => {
  const env = startBattle(4);
  const ids = playerIds(env);
  env.battle.coopBreak.gauge = 5;
  env.battle.actions = {
    [ids[0]]: action.attack(env.enemy.id),
    [ids[1]]: action.attack(env.enemy.id),
    [ids[2]]: action.guard(ids[2]),
    [ids[3]]: action.heal(ids[3]),
  };

  env.store._resolveBattleRound(env.room, env.battle);
  const links = env.battle.lastEvents.filter(event => event.kind === "link");
  const arts = env.battle.lastEvents.filter(event => event.kind === "coopBreak");
  assert.equal(links.length, 1);
  assert.equal(arts.length, 1);
  assert.equal(links[0].techniqueId, "triad-dominion");
  assert.equal(arts[0].techniqueId, "triad-dominion");
  assert.equal(env.battle.coopBreak.totalUses, 1);
  assert.equal(env.battle.coopBreak.gauge, 0);

  env.store._resolveBattleRound(env.room, env.battle);
  assert.equal(env.battle.coopBreak.totalUses, 1, "resolving an already closed round must be idempotent");
  assert.equal(env.battle.lastEvents.filter(event => event.kind === "coopBreak").length, 1);
});

test("build228 coexists with a due co-op boss mechanic without stacking the same vulnerability", () => {
  const env = startBattle(3);
  const ids = playerIds(env);
  env.battle.coopBoss = {
    id: "build228-boss",
    name: "連携監査ボス",
    mechanic: {
      id: "dual-role",
      name: "攻守共鳴",
      instruction: "攻撃と支援を合わせる",
      success: "共鳴成功",
      failure: "共鳴失敗",
      dueRound: env.battle.round,
      successes: 0,
      failures: 0,
      lastSuccess: null,
    },
  };
  env.battle.coopBreak.gauge = 3;
  env.battle.actions = {
    [ids[0]]: action.attack(env.enemy.id),
    [ids[1]]: action.guard(ids[1]),
    [ids[2]]: action.heal(ids[2]),
  };

  env.store._resolveBattleRound(env.room, env.battle);
  const bossEvents = env.battle.lastEvents.filter(event => event.kind === "coopBossMechanic");
  const artEvents = env.battle.lastEvents.filter(event => event.kind === "coopBreak");
  assert.equal(bossEvents.length, 1);
  assert.equal(bossEvents[0].success, true);
  assert.equal(artEvents.length, 1);
  assert.equal(artEvents[0].techniqueId, "triad-dominion");
  assert.equal(env.battle.coopBoss.mechanic.successes, 1);
  assert.equal(env.battle.coopBreak.totalUses, 1);
  const vulnerabilities = env.enemy.effects.filter(entry => entry.kind === "vulnerable");
  assert.equal(vulnerabilities.length, 1);
  assert.equal(vulnerabilities[0].value, .35, "the boss mechanic's stronger vulnerability wins by max, not addition");
  assert.ok(env.battle.lastEvents.indexOf(artEvents[0]) < env.battle.lastEvents.findIndex(event => event.kind === "damage"), "LINK ARTS must be presented before the actions it strengthens");
});

test("build228 holds a full gauge when a boss challenge already supplied the whole effect", () => {
  const env = startBattle(2);
  const ids = playerIds(env);
  env.battle.coopBoss = {
    id: "build228-overlap-boss",
    name: "重複監査ボス",
    mechanic: {
      id: "linked-assault",
      name: "双撃共鳴",
      instruction: "同時に攻撃する",
      success: "双撃成功",
      failure: "双撃失敗",
      dueRound: env.battle.round,
      successes: 0,
      failures: 0,
      lastSuccess: null,
    },
  };
  env.battle.coopBreak.gauge = 5;
  env.battle.actions = {
    [ids[0]]: action.attack(env.enemy.id),
    [ids[1]]: action.attack(env.enemy.id),
  };

  env.store._resolveBattleRound(env.room, env.battle);
  assert.equal(env.battle.coopBreak.gauge, 6);
  assert.equal(env.battle.coopBreak.totalUses, 0);
  assert.equal(env.battle.coopBreak.lastCharge.deferred, true);
  assert.match(env.battle.coopBreak.lastLabel, /READY/);
  assert.equal(env.battle.lastEvents.some(event => event.kind === "coopBreak"), false);
  assert.equal(env.battle.lastEvents.find(event => event.kind === "link")?.deferred, true);

  const vulnerability = effect(env.enemy, "vulnerable");
  if (vulnerability) vulnerability.turns = 1;
  env.battle.phase = "command";
  env.battle.round += 1;
  env.battle.actions = {
    [ids[0]]: action.attack(env.enemy.id),
    [ids[1]]: action.attack(env.enemy.id),
  };
  const events = [];
  const art = env.store._resolveCoopTechnique(env.room, env.battle, events);
  assert.equal(art?.techniqueId, "resonance-break");
  assert.equal(env.battle.coopBreak.gauge, 0);
  assert.equal(env.battle.coopBreak.totalUses, 1);
});

test("build228 LINK ARTS do not create extra rewards or advance the host world", () => {
  const env = startBattle(2);
  const ids = playerIds(env);
  const selectedFloor = env.room.selectedFloor;
  const expeditionId = env.room.expedition.id;
  const pendingBefore = env.players.map(player => player.session.pendingRewards.length);
  env.battle.coopBreak.gauge = 5;
  env.battle.actions = {
    [ids[0]]: action.attack(env.enemy.id),
    [ids[1]]: action.attack(env.enemy.id),
  };
  env.store._resolveBattleRound(env.room, env.battle);
  assert.equal(env.battle.lastEvents.filter(event => event.kind === "coopBreak").length, 1);

  for (const enemy of env.battle.enemies) enemy.hp = 0;
  env.battle.outcome = "victory";
  env.store._finishBattleVictory(env.room, env.battle);

  for (const [index, player] of env.players.entries()) {
    const added = player.session.pendingRewards.slice(pendingBefore[index]);
    assert.equal(added.length, 1);
    assert.equal(added[0].source.kind, "battle");
    assert.equal(Number(added[0].reward.leaderFloorUnlock) || 0, 0);
    assert.deepEqual(added[0].reward.skillUses, {});
  }
  assert.equal(env.room.selectedFloor, selectedFloor);
  assert.equal(env.room.expedition.id, expeditionId);
  assert.equal(env.room.expedition.encountersCleared, 1);
  assert.deepEqual(env.room.hostWorld.defeatedBossFloors ?? [], []);

  const counts = env.players.map(player => player.session.pendingRewards.length);
  env.store._finishBattleVictory(env.room, env.battle);
  assert.deepEqual(env.players.map(player => player.session.pendingRewards.length), counts);
});

test("build228 counts disconnected AI, snapshots the alias, and resumes without duplication", () => {
  const env = startBattle(2, { battleReconnectActionGraceMs: 100 });
  const [leader, guest] = env.players;
  env.battle.coopBreak.gauge = 5;
  env.battle.actions[leader.session.playerId] = action.attack(env.enemy.id);
  env.store.disconnect(guest.session, guest.conn);
  env.advance(101);
  env.store.advanceBattles();

  assert.equal(env.battle.phase, "result");
  assert.equal(env.battle.actions[guest.session.playerId]?.auto, true);
  const link = env.battle.lastEvents.find(event => event.kind === "link");
  const art = env.battle.lastEvents.find(event => event.kind === "coopBreak");
  assert.equal(link?.autoIncluded, true);
  assert.equal(art?.autoIncluded, true);
  assert.equal(env.battle.coopBreak.totalUses, 1);

  const snapshot = env.store.roomSnapshot(env.room).expedition.battle;
  assert.notStrictEqual(snapshot.coopBreak, snapshot.coopTechnique);
  assert.deepEqual(snapshot.coopTechnique, snapshot.coopBreak);
  assert.equal(snapshot.coopTechnique.lastTechnique.id, "resonance-break");
  assert.notStrictEqual(snapshot.coopBreak.lastCharge, snapshot.coopTechnique.lastCharge);
  assert.notStrictEqual(snapshot.coopBreak.lastCharge.actorIds, snapshot.coopTechnique.lastCharge.actorIds);
  snapshot.coopTechnique.lastCharge.actorIds.push("snapshot-only");
  assert.equal(snapshot.coopBreak.lastCharge.actorIds.includes("snapshot-only"), false);
  assert.equal(env.battle.coopBreak.lastCharge.actorIds.includes("snapshot-only"), false);
  const artSnapshot = snapshot.lastEvents.find(event => event.kind === "coopBreak");
  const artInternal = env.battle.lastEvents.find(event => event.kind === "coopBreak");
  assert.notStrictEqual(artSnapshot.actorNames, artInternal.actorNames);
  artSnapshot.actorNames.push("snapshot-only");
  assert.equal(artInternal.actorNames.includes("snapshot-only"), false);

  const resumedConnection = connection();
  const resumed = env.store.hello(resumedConnection, {
    friendId: guest.session.playerId,
    clientKey: guest.session.clientKey,
    resumeToken: guest.session.resumeToken,
    profile: guest.session.profile,
  });
  assert.equal(resumed.ok, true);
  assert.equal(resumed.resumed, true);
  assert.equal(resumed.room.expedition.battle.id, env.battle.id);
  assert.deepEqual(resumed.room.expedition.battle.coopTechnique, resumed.room.expedition.battle.coopBreak);
  assert.equal(resumed.room.expedition.battle.coopTechnique.totalUses, 1);

  env.store.advanceBattles();
  assert.equal(env.battle.coopBreak.totalUses, 1, "reconnect and room refresh must not replay the LINK ART");
  assert.equal(env.battle.lastEvents.filter(event => event.kind === "coopBreak").length, 1);

  env.store.leaveRoom(guest.session);
  assert.equal(env.battle.coopBreak, null, "formal departure must remove the multiplayer-only HUD from the remaining solo battle");
  const soloSnapshot = env.store.roomSnapshot(env.room).expedition.battle;
  assert.equal(soloSnapshot.coopBreak, null);
  assert.equal(soloSnapshot.coopTechnique, null);
});
