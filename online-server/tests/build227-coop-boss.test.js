import test from "node:test";
import assert from "node:assert/strict";
import { RoomStore } from "../src/RoomStore.js";
import {
  COOP_BOSS_CATALOG,
  coopBossFor,
} from "../src/CoopBossCatalog.js";
import {
  coopGimmickFor,
  prepareCoopExpeditionV206,
} from "../src/CoopGimmicks.js";

function dungeonFixture(floor = 1) {
  const rows = 15, cols = 15;
  return {
    id: `build227-fixture-${floor}`,
    floor,
    rows,
    cols,
    tiles: Array.from({ length: rows }, (_, y) => Array.from(
      { length: cols },
      (_, x) => x > 0 && y > 0 && x < cols - 1 && y < rows - 1 ? "." : "#",
    )),
    start: { x: 1, y: 1 },
    exit: { x: 13, y: 13 },
    objects: [{ id: "host-chest", type: "chest", x: 2, y: 2, resolved: false }],
    totalDiscoveries: 1,
  };
}

function connection() {
  return {
    messages: [],
    send(raw) { this.messages.push(JSON.parse(raw)); },
    close() {},
  };
}

function hello(store, index) {
  const conn = connection();
  const suffix = "BCDE"[index - 1];
  const result = store.hello(conn, {
    friendId: `AD-CB27-AAA${suffix}`,
    clientKey: `build227-coop-boss-${index}`.padEnd(32, "x"),
    profile: {
      displayName: `共闘227-${index}`,
      speciesId: "slime",
      visualSpeciesId: "slime",
      maxFloor: 10_000,
      level: 1_000,
      currentHp: 80_000,
      currentMp: 2_000,
      captureStock: 9,
      battleStats: {
        hp: 80_000,
        mp: 2_000,
        atk: 12_000,
        matk: 11_000,
        def: 8_000,
        mdef: 8_000,
        spd: 2_000,
        crit: 5,
        evasion: 3,
        accuracy: 100,
      },
      skills: [{ id: "party-heal", name: "共鳴治癒", kind: "heal", mp: 20, heal: .25 }],
    },
  });
  assert.equal(result.ok, true);
  return { conn, session: conn.session };
}

function eliteFloor(ownerId, bossId = null, minFloor = 1) {
  for (let floor = Math.max(1, minFloor); floor < 10_000; floor++) {
    if (floor % 10 === 0) continue;
    if (coopGimmickFor({ leaderId: ownerId, floor }) !== "eliteVault") continue;
    if (bossId && coopBossFor({ ownerId, floor }).id !== bossId) continue;
    return floor;
  }
  throw new Error(`No elite floor found for ${ownerId} / ${bossId ?? "any boss"}`);
}

function startEliteRoom(count = 2, { bossId = null, minFloor = 1 } = {}) {
  let now = 227_000;
  const store = new RoomStore({
    now: () => now,
    randomRoomCode: () => `CB${count}227`,
    random: () => .5,
  });
  const players = Array.from({ length: count }, (_, index) => hello(store, index + 1));
  const created = store.createRoom(players[0].session);
  assert.equal(created.ok, true);
  for (const player of players.slice(1)) {
    assert.equal(store.joinRoom(player.session, created.room.roomId).ok, true);
  }
  const floor = eliteFloor(players[0].session.playerId, bossId, minFloor);
  assert.equal(store.setFloor(players[0].session, floor).ok, true);
  for (const player of players) assert.equal(store.setReady(player.session, true).ok, true);
  assert.equal(store.startExpedition(players[0].session, {
    hostWorld: { floorSeeds: {}, openedChestIds: {}, defeatedBossFloors: [] },
  }).ok, true);
  const room = store.rooms.get(created.room.roomId);
  const elite = room.expedition.objects.find(object => object.type === "coopElite");
  const vault = room.expedition.objects.find(object => object.type === "resonanceVault");
  assert.ok(elite, "an elite-vault floor must contain the authored co-op boss");
  assert.ok(vault?.unlocked, "eliteVault starts with its challenge point unlocked");
  for (const player of players) {
    player.session.dungeonPosition = { x: vault.x, y: vault.y, facing: "down" };
  }
  store._syncCoopInteractions(room);
  return {
    store,
    players,
    room,
    floor,
    elite,
    vault,
    advance(ms = 1) { now += ms; },
  };
}

function challenge(env, player = env.players[0]) {
  env.store._syncCoopInteractions(env.room);
  const interaction = env.room.expedition.interactions[player.session.playerId];
  assert.equal(interaction?.action, "challengeCoopBoss");
  assert.equal(interaction?.targetId, env.vault.id);
  return env.store.expeditionInteract(player.session, interaction);
}

function makeBossSurviveRound(battle) {
  const enemy = battle.enemies[0];
  enemy.maxHp = 1_000_000_000;
  enemy.hp = enemy.maxHp;
  enemy.def = 1_000_000_000;
  enemy.mdef = 1_000_000_000;
  enemy.atk = 1;
  enemy.matk = 1;
  enemy.spd = 1;
  return enemy;
}

test("build227 deterministically rotates all three authored co-op bosses", () => {
  const expectedIds = new Set(COOP_BOSS_CATALOG.map(boss => boss.id));
  const expectedMechanics = new Set(["linked-assault", "mirror-guard", "dual-role"]);
  const foundIds = new Set(), foundMechanics = new Set();

  for (let floor = 1; floor <= 300; floor++) {
    const first = coopBossFor({ ownerId: `owner-${floor % 13}`, floor });
    const second = coopBossFor({ ownerId: `owner-${floor % 13}`, floor });
    assert.equal(first.id, second.id);
    assert.equal(first.mechanic.id, second.mechanic.id);
    foundIds.add(first.id);
    foundMechanics.add(first.mechanic.id);
  }

  assert.deepEqual(foundIds, expectedIds);
  assert.deepEqual(foundMechanics, expectedMechanics);
  const mutable = coopBossFor({ ownerId: "clone-check", floor: 227 });
  mutable.mechanic.name = "changed";
  mutable.actions[0].label = "changed";
  const fresh = coopBossFor({ ownerId: "clone-check", floor: 227 });
  assert.notEqual(fresh.mechanic.name, "changed");
  assert.notEqual(fresh.actions[0].label, "changed");
});

test("build227 generates co-op bosses only for two-plus non-boss expeditions", () => {
  const ownerId = "AD-CB27-AAAB";
  const floor = eliteFloor(ownerId);

  const solo = dungeonFixture(floor);
  prepareCoopExpeditionV206(solo, {
    leaderId: ownerId,
    hostWorld: { openedChestIds: {} },
    participants: 1,
  });
  assert.equal(solo.coop.enabled, false);
  assert.equal(solo.objects.some(object => object.type === "coopElite"), false);
  assert.equal(solo.coop.coopBoss ?? null, null);

  const party = dungeonFixture(floor);
  prepareCoopExpeditionV206(party, {
    leaderId: ownerId,
    hostWorld: { openedChestIds: {} },
    participants: 2,
  });
  const elite = party.objects.find(object => object.type === "coopElite");
  assert.equal(party.coop.enabled, true);
  assert.ok(elite);
  assert.equal(elite.coopBossId, coopBossFor({ ownerId, floor }).id);

  const ordinaryBossFloor = dungeonFixture(10);
  prepareCoopExpeditionV206(ordinaryBossFloor, {
    leaderId: ownerId,
    hostWorld: { openedChestIds: {} },
    participants: 4,
  });
  assert.equal(ordinaryBossFloor.objects.some(object => object.type === "coopElite"), false);
  assert.equal(ordinaryBossFloor.coop.coopBoss ?? null, null);
});

test("build227 refuses a challenge unless two battle-eligible members remain", () => {
  const env = startEliteRoom(2);
  env.players[1].session.coopVitals.hp = 0;
  env.store._syncCoopInteractions(env.room);

  const result = env.store.expeditionInteract(env.players[0].session, {
    action: "challengeCoopBoss",
    targetId: env.vault.id,
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "NEED_PARTY");
  assert.equal(env.room.expedition.battle, null);
  assert.equal(env.room.expedition.coop.eliteBattleStarted, false);
});

test("build227 starts the catalog boss with public metadata and capture disabled", () => {
  const env = startEliteRoom(2);
  const expected = coopBossFor({ ownerId: env.room.ownerId, floor: env.floor });
  assert.equal(challenge(env).ok, true);

  const battle = env.room.expedition.battle;
  const enemy = battle.enemies[0];
  assert.equal(battle.coopElite, true);
  assert.equal(battle.floorBoss, false);
  assert.equal(battle.coopBoss.id, expected.id);
  assert.equal(battle.coopBoss.name, expected.name);
  assert.equal(battle.coopBoss.mechanic.id, expected.mechanic.id);
  assert.equal(battle.coopBoss.mechanic.dueRound, 3);
  assert.equal(battle.coopBoss.mechanic.successes, 0);
  assert.equal(battle.coopBoss.mechanic.failures, 0);
  assert.equal(enemy.speciesId, expected.speciesId);
  assert.equal(enemy.visualSpeciesId, expected.visualSpeciesId);
  assert.equal(enemy.name, expected.name);
  assert.equal(enemy.boss, true);
  assert.equal(enemy.uncapturable, true);
  assert.deepEqual(enemy.battleActions.map(action => action.id), expected.actions.map(action => action.id));

  const duplicate = env.store.expeditionInteract(env.players[0].session, {
    action: "challengeCoopBoss",
    targetId: env.vault.id,
  });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.code, "NO_EXPEDITION");
  assert.equal(env.room.expedition.battle.id, battle.id);

  enemy.hp = Math.floor(enemy.maxHp * .2);
  const capture = env.store.submitBattleAction(env.players[0].session, {
    kind: "capture",
    targetId: enemy.id,
  });
  assert.equal(capture.ok, false);
  assert.equal(capture.code, "UNCAPTURABLE");
});

test("build227 linked-assault succeeds with two attackers and fails without coordination", () => {
  const linkedBossId = COOP_BOSS_CATALOG.find(boss => boss.mechanic.id === "linked-assault").id;
  const env = startEliteRoom(2, { bossId: linkedBossId });
  assert.equal(challenge(env).ok, true);
  const battle = env.room.expedition.battle;
  const enemy = makeBossSurviveRound(battle);

  battle.round = battle.coopBoss.mechanic.dueRound;
  battle.actions = Object.fromEntries(env.players.map(player => [player.session.playerId, {
    kind: "attack",
    targetId: enemy.id,
    auto: false,
  }]));
  env.store._resolveBattleRound(env.room, battle);
  const success = battle.lastEvents.find(event => event.kind === "coopBossMechanic");
  assert.equal(success?.mechanicId, "linked-assault");
  assert.equal(success?.success, true);
  assert.ok(enemy.effects.some(effect => effect.kind === "vulnerable" && effect.value === .35));
  assert.equal(battle.coopBoss.mechanic.successes, 1);

  battle.phase = "command";
  battle.outcome = null;
  battle.round = battle.coopBoss.mechanic.dueRound;
  battle.actions = Object.fromEntries(env.players.map(player => [player.session.playerId, {
    kind: "guard",
    targetId: player.session.playerId,
    auto: false,
  }]));
  env.store._resolveBattleRound(env.room, battle);
  const failure = battle.lastEvents.find(event => event.kind === "coopBossMechanic");
  assert.equal(failure?.mechanicId, "linked-assault");
  assert.equal(failure?.success, false);
  assert.ok(enemy.effects.some(effect => effect.kind === "atkUp" && effect.value >= .25));
  assert.equal(battle.coopBoss.mechanic.failures, 1);
});

test("build227 mirror-guard needs two guards and shields every living member", () => {
  const mirrorBossId = COOP_BOSS_CATALOG.find(boss => boss.mechanic.id === "mirror-guard").id;
  const env = startEliteRoom(3, { bossId: mirrorBossId });
  assert.equal(challenge(env).ok, true);
  const battle = env.room.expedition.battle;
  const enemy = makeBossSurviveRound(battle);

  battle.round = battle.coopBoss.mechanic.dueRound;
  battle.actions = Object.fromEntries(env.players.map((player, index) => [player.session.playerId, {
    kind: index < 2 ? "guard" : "attack",
    targetId: index < 2 ? player.session.playerId : enemy.id,
    auto: false,
  }]));
  env.store._resolveBattleRound(env.room, battle);
  const success = battle.lastEvents.find(event => event.kind === "coopBossMechanic");
  assert.equal(success?.mechanicId, "mirror-guard");
  assert.equal(success?.success, true);
  const shieldState = Object.values(battle.players).map(player => ({
    playerId: player.playerId,
    shield: player.shield,
    expected: Math.ceil(player.maxHp * .1),
  }));
  assert.ok(shieldState.every(player => player.shield >= player.expected - 1), JSON.stringify(shieldState));

  battle.phase = "command";
  battle.outcome = null;
  battle.round = battle.coopBoss.mechanic.dueRound;
  battle.actions = Object.fromEntries(env.players.map((player, index) => [player.session.playerId, {
    kind: index === 0 ? "guard" : "attack",
    targetId: index === 0 ? player.session.playerId : enemy.id,
    auto: false,
  }]));
  env.store._resolveBattleRound(env.room, battle);
  const failure = battle.lastEvents.find(event => event.kind === "coopBossMechanic");
  assert.equal(failure?.mechanicId, "mirror-guard");
  assert.equal(failure?.success, false);
  assert.ok(enemy.effects.some(effect => effect.kind === "atkUp" && effect.value >= .25));
});

test("build227 dual-role needs separate offense and support actions", () => {
  const dualRoleBossId = COOP_BOSS_CATALOG.find(boss => boss.mechanic.id === "dual-role").id;
  const env = startEliteRoom(2, { bossId: dualRoleBossId });
  assert.equal(challenge(env).ok, true);
  const battle = env.room.expedition.battle;
  const enemy = makeBossSurviveRound(battle);

  battle.round = battle.coopBoss.mechanic.dueRound;
  battle.actions = {
    [env.players[0].session.playerId]: { kind: "attack", targetId: enemy.id, auto: false },
    [env.players[1].session.playerId]: { kind: "guard", targetId: env.players[1].session.playerId, auto: false },
  };
  env.store._resolveBattleRound(env.room, battle);
  const success = battle.lastEvents.find(event => event.kind === "coopBossMechanic");
  assert.equal(success?.mechanicId, "dual-role");
  assert.equal(success?.success, true);
  assert.ok(enemy.effects.some(effect => effect.kind === "vulnerable" && effect.value === .35));

  battle.phase = "command";
  battle.outcome = null;
  battle.round = battle.coopBoss.mechanic.dueRound;
  battle.actions = Object.fromEntries(env.players.map(player => [player.session.playerId, {
    kind: "attack",
    targetId: enemy.id,
    auto: false,
  }]));
  env.store._resolveBattleRound(env.room, battle);
  const failure = battle.lastEvents.find(event => event.kind === "coopBossMechanic");
  assert.equal(failure?.mechanicId, "dual-role");
  assert.equal(failure?.success, false);
  assert.ok(enemy.effects.some(effect => effect.kind === "atkUp" && effect.value >= .25));
});

test("build227 defeat returns the party to the vault and permits a clean retry", () => {
  const env = startEliteRoom(2);
  assert.equal(challenge(env).ok, true);
  const firstBattle = env.room.expedition.battle;
  for (const player of Object.values(firstBattle.players)) player.hp = 0;
  firstBattle.phase = "result";
  firstBattle.outcome = "defeat";

  env.store._finishBattleDefeat(env.room, firstBattle);

  assert.equal(env.room.phase, "expedition");
  assert.equal(env.room.expedition.battle, null);
  assert.equal(env.room.expedition.coop.eliteBattleStarted, false);
  assert.equal(env.room.expedition.coop.eliteDefeated, false);
  assert.ok(env.room.expedition.coop.coopBossAttempts >= 1);
  assert.equal(env.elite.resolved, false);
  assert.ok(env.players.every(player => player.session.coopVitals.hp > 0));

  for (const player of env.players) {
    player.session.dungeonPosition = { x: env.vault.x, y: env.vault.y, facing: "down" };
  }
  assert.equal(challenge(env).ok, true);
  assert.notEqual(env.room.expedition.battle.id, firstBattle.id);
});

test("build227 victory pays each starting party member once and never advances the host floor", () => {
  for (const count of [2, 3, 4]) {
    const env = startEliteRoom(count, { minFloor: count >= 3 ? 100 : 1 });
    const selectedFloor = env.room.selectedFloor;
    const expeditionId = env.room.expedition.id;
    const defeatedBossFloors = [...(env.room.hostWorld.defeatedBossFloors ?? [])];
    assert.equal(challenge(env).ok, true);
    const battle = env.room.expedition.battle;
    for (const enemy of battle.enemies) enemy.hp = 0;
    battle.phase = "result";
    battle.outcome = "victory";

    env.store._finishBattleVictory(env.room, battle);

    const bossId = battle.coopBoss.id;
    const victoryEntries = env.players.map(player => player.session.pendingRewards.filter(
      reward => reward.rewardId === `coopBoss:v1:${battle.id}:${bossId}:${player.session.playerId}`,
    ));
    assert.ok(victoryEntries.every(entries => entries.length === 1));
    assert.ok(victoryEntries.every(entries => entries[0].source.kind === "coopBoss"));
    assert.ok(victoryEntries.every(entries => entries[0].reward.crystals === ({ 2: 3, 3: 4, 4: 5 })[count]));
    assert.ok(victoryEntries.every(entries => entries[0].reward.captureCrystals === (selectedFloor >= 100 ? 1 : 0)));
    const fixed = victoryEntries.map(entries => ({
      gold: entries[0].reward.gold,
      crystals: entries[0].reward.crystals,
      experience: entries[0].reward.experience,
    }));
    assert.ok(fixed.every(reward => JSON.stringify(reward) === JSON.stringify(fixed[0])));
    assert.ok(env.players.every(player => player.session.pendingRewards.every(
      reward => reward.rewardId !== `${battle.id}:victory:${player.session.playerId}`,
    )), "a co-op boss must not also pay the ordinary battle-victory contract");

    env.store._finishBattleVictory(env.room, battle);
    assert.ok(env.players.every(player => player.session.pendingRewards.filter(
      reward => reward.rewardId === `coopBoss:v1:${battle.id}:${bossId}:${player.session.playerId}`,
    ).length === 1));

    assert.equal(env.room.phase, "expedition");
    assert.equal(env.room.selectedFloor, selectedFloor);
    assert.equal(env.room.expedition.id, expeditionId);
    assert.equal(env.room.expedition.floor, selectedFloor);
    assert.deepEqual(env.room.hostWorld.defeatedBossFloors ?? [], defeatedBossFloors);
    assert.equal(env.room.expedition.coop.eliteDefeated, true);
    assert.ok(env.room.expedition.coop.coopBossVictories >= 1);
    assert.equal(env.room.expedition.objects.find(object => object.type === "deluxeChest")?.hidden, false);
    assert.equal(env.players.some(player => player.session.pendingRewards.some(
      reward => Number(reward.reward.leaderFloorUnlock) > 0,
    )), false);
  }
});

test("build227 keeps a disconnected participant in battle and delivers one reward after reconnect", () => {
  const env = startEliteRoom(2);
  assert.equal(challenge(env).ok, true);
  const battle = env.room.expedition.battle;
  const guest = env.players[1];
  const friendId = guest.session.playerId;
  const clientKey = guest.session.clientKey;
  const resumeToken = guest.session.resumeToken;
  const profile = guest.session.profile;

  env.store.disconnect(guest.session, guest.conn);
  assert.equal(env.room.expedition.battle.id, battle.id);
  assert.ok(env.room.expedition.battle.players[friendId]);

  for (const enemy of battle.enemies) enemy.hp = 0;
  battle.phase = "result";
  battle.outcome = "victory";
  env.store._finishBattleVictory(env.room, battle);

  const rewardId = `coopBoss:v1:${battle.id}:${battle.coopBoss.id}:${friendId}`;
  assert.equal(guest.session.pendingRewards.filter(reward => reward.rewardId === rewardId).length, 1);

  const reconnected = connection();
  const resumed = env.store.hello(reconnected, { friendId, clientKey, resumeToken, profile });
  assert.equal(resumed.ok, true);
  assert.equal(resumed.resumed, true);
  assert.equal(resumed.room?.expedition?.id, env.room.expedition.id);
  env.store.deliverPendingRewards(reconnected.session);
  assert.equal(reconnected.messages.filter(message => message.type === "onlineReward" && message.rewardId === rewardId).length, 1);

  assert.equal(env.store.ackReward(reconnected.session, rewardId).ok, true);
  env.store.deliverPendingRewards(reconnected.session);
  assert.equal(reconnected.messages.filter(message => message.type === "onlineReward" && message.rewardId === rewardId).length, 1);
});
