import test from "node:test";
import assert from "node:assert/strict";

const views = await import("../src/online/OnlineViews.js?build248-multi-actor-client-test");
const { OnlinePartyController } = await import("../src/online/OnlinePartyClient.js?build248-multi-actor-client-test");

const selfId = "AD-AAAA-BBBB", guestId = "AD-CCCC-DDDD";

function monsterProfile(monsterId, rosterIndex, name, skillId, circleId = "none") {
  return {
    rosterIndex, isPrimary: rosterIndex === 0, monsterId, speciesId: rosterIndex ? "goblin" : "slime",
    monsterName: name, fallbackEmoji: rosterIndex ? "鬼" : "魔", level: 20 + rosterIndex, stars: 1, plus: 0,
    attribute: rosterIndex ? "fire" : "water", power: 1000 + rosterIndex,
    battleStats: { hp: 200 + rosterIndex * 10, mp: 40, atk: 30, matk: 25, def: 20, mdef: 18, spd: 15 + rosterIndex, crit: 5, evasion: 3, accuracy: 100 },
    currentHp: 200 + rosterIndex * 10, currentMp: 40,
    skills: [{ id: skillId, name: `${name}技`, description: "敵単体へ攻撃", kind: "attack", mp: 3, power: 1 }],
    equipment: [], equipmentAuthorities: [], equipmentCombatEffects: {}, abyssSkillEffects: {},
    circleId, circleName: circleId === "aegis" ? "半月障壁陣" : "魔法陣なし", circleLevel: circleId === "aegis" ? 7 : 0, circleEffect: circleId === "aegis" ? "shield" : "none",
  };
}

function profile(displayName, prefix) {
  const battleRoster = [
    monsterProfile(`${prefix}-m1`, 0, `${displayName}主力`, `${prefix}-skill-1`),
    monsterProfile(`${prefix}-m2`, 1, `${displayName}二体目`, `${prefix}-skill-2`, "aegis"),
  ];
  return {
    displayName, ...battleRoster[0], primaryMonsterId: battleRoster[0].monsterId,
    battleRosterVersion: 1, battleRoster, maxFloor: 100, captureStock: 5,
  };
}

function actor(ownerPlayerId, rosterIndex, side = null) {
  const ownProfile = ownerPlayerId === selfId ? selfProfile : guestProfile;
  const entry = ownProfile.battleRoster[rosterIndex];
  const combatantId = rosterIndex === 0 ? ownerPlayerId : `${ownerPlayerId}:m${rosterIndex + 1}`;
  return {
    playerId: combatantId, combatantId, ownerPlayerId, monsterId: entry.monsterId, rosterIndex,
    isPrimary: rosterIndex === 0, side, name: ownProfile.displayName, monsterName: entry.monsterName,
    hp: entry.currentHp, maxHp: entry.battleStats.hp, mp: entry.currentMp, maxMp: entry.battleStats.mp,
    stats: entry.battleStats, skills: entry.skills, itemCharges: 2, captureCharges: 2, effects: [],
  };
}

const selfProfile = profile("自分", "self"), guestProfile = profile("友人", "guest");
const members = [
  { playerId: selfId, connected: true, teamSide: "moon", profile: selfProfile },
  { playerId: guestId, connected: true, teamSide: "sun", profile: guestProfile },
];

function sharedBattle(actions = {}) {
  return {
    phase: "command", round: 1, speed: 1, actions, lastEvents: [],
    players: [actor(selfId, 0), actor(selfId, 1), actor(guestId, 0), actor(guestId, 1)],
    enemies: [{ id: "enemy-1", name: "敵", speciesId: "slime", hp: 500, maxHp: 500, mp: 0, maxMp: 0, level: 10, effects: [] }],
  };
}

test("build248 resolves actor ownership, roster profiles, and the next unsubmitted living actor", () => {
  const battle = sharedBattle({ [selfId]: { kind: "attack" } });
  const room = { members };
  assert.equal(views.onlineBattleOwnerId(battle.players[1]), selfId);
  assert.equal(views.onlineBattleActorId(battle.players[1]), `${selfId}:m2`);
  assert.deepEqual(views.onlineOwnedBattleActors(battle, selfId).map(views.onlineBattleActorId), [selfId, `${selfId}:m2`]);
  assert.equal(views.onlinePendingBattleActor(battle, selfId)?.combatantId, `${selfId}:m2`);
  assert.equal(views.onlineBattleActorProfile(room, battle.players[1]).monsterName, "自分二体目");
  assert.equal(views.onlineBattleActorProfile(room, battle.players[1]).circleId, "aegis");

  const legacy = { playerId: selfId, hp: 10 };
  assert.equal(views.onlineBattleActorProfile(room, legacy).monsterId, "self-m1", "old one-actor snapshots still use the root profile");
});

test("build248 lobby deployment counts mirror the shared and per-side four-slot allocation", () => {
  const third = { playerId: "AD-EEEE-FFFF", connected: true, profile: { ...guestProfile, battleRoster: guestProfile.battleRoster.slice(0, 1) } };
  const shared = views.onlineRosterAllocationCounts([members[0], members[1], third]);
  assert.deepEqual([shared.get(selfId), shared.get(guestId), shared.get(third.playerId)], [2, 1, 1]);

  const teamMembers = [
    { ...members[0], teamSide: "sun" }, { ...members[1], teamSide: "sun" },
    { ...third, teamSide: "moon" },
  ];
  const team = views.onlineRosterAllocationCounts(teamMembers, { team: true });
  assert.deepEqual([team.get(selfId), team.get(guestId), team.get(third.playerId)], [2, 2, 1]);
  const lobby = views.renderOnlineTeam({ members: teamMembers, phase: "lobby", leaderId: selfId }, selfId);
  assert.equal((lobby.match(/出撃2体/g) ?? []).length, 2);
  assert.equal((lobby.match(/出撃1体/g) ?? []).length, 1);
});

test("build248 renders four ally slots and advances the command UI actor by actor", () => {
  const room = { members, selectedFloor: 20 };
  const firstDone = sharedBattle({ [selfId]: { kind: "attack" } });
  const html = views.renderSharedBattle({ mode: "explore", room, battle: firstDone, selfId, enemies: firstDone.enemies, skillMenu: true });
  assert.match(html, new RegExp(`id="ally-${selfId}:m2"`));
  assert.match(html, /自分二体目の行動/);
  assert.match(html, /自分二体目技/);
  assert.match(html, /半月障壁陣/);
  assert.doesNotMatch(html, /行動入力済み/);
  assert.equal((html.match(/class="battle-unit combatant side-battle-unit/g) ?? []).length, 4);

  const allDone = sharedBattle({ [selfId]: { kind: "attack" }, [`${selfId}:m2`]: { kind: "guard" } });
  const waiting = views.renderSharedBattle({ mode: "explore", room, battle: allDone, selfId, enemies: allDone.enemies });
  assert.match(waiting, /行動入力済み/);
});

test("build248 sends actorId and records pending actions per combatant for every online mode", () => {
  for (const mode of ["explore", "raid", "team"]) {
    const battle = sharedBattle();
    if (mode === "team") {
      battle.players = [actor(selfId, 0, "moon"), actor(selfId, 1, "moon"), actor(guestId, 0, "sun"), actor(guestId, 1, "sun")];
    }
    if (mode === "raid") {
      battle.boss = { id: "raid-boss", hp: 1000, maxHp: 1000 };
      battle.minions = [];
    }
    const roomState = { members, expedition: { battle }, raid: battle, teamBattle: battle };
    const sent = [], controller = Object.create(OnlinePartyController.prototype);
    Object.assign(controller, {
      selfId, roomState, selectedAlly: { explore: selfId, raid: selfId, team: selfId },
      selectedTarget: { explore: "enemy-1", raid: "raid-boss", team: guestId },
      skillMenu: { explore: false, raid: false, team: false }, itemMenu: { explore: false, raid: false, team: false }, itemTargetMenu: { explore: false, raid: false, team: false },
      _send: (type, payload) => { sent.push({ type, payload }); return true; }, _render: () => {}, toast: message => { throw new Error(message); },
    });

    controller._submitBattleAction(mode, "skill", "self-skill-1");
    controller._submitBattleAction(mode, "skill", "self-skill-2");
    assert.deepEqual(sent.map(entry => entry.payload.actorId), [selfId, `${selfId}:m2`], `${mode} sends each owned actor exactly once`);
    assert.equal(sent.every(entry => Object.prototype.hasOwnProperty.call(entry.payload, "actorId")), true);
    assert.equal(battle.actions[selfId].actorId, selfId);
    assert.equal(battle.actions[`${selfId}:m2`].actorId, `${selfId}:m2`);
  }
});

test("build248 team viewing side follows ownerPlayerId and caps both rendered sides at four", () => {
  const players = [actor(guestId, 0, "sun"), actor(guestId, 1, "sun"), actor(selfId, 0, "moon"), actor(selfId, 1, "moon")];
  const teamBattle = { phase: "command", round: 1, speed: 1, actions: {}, players, format: "2 vs 2", ruleset: "standard", series: "bo1", score: { sun: 0, moon: 0 }, game: 1 };
  const html = views.renderOnlineTeam({ members, phase: "team", teamBattle }, selfId);
  assert.match(html, /自分主力の行動/);
  assert.match(html, new RegExp(`id="ally-${selfId}:m2"`));
  assert.match(html, new RegExp(`id="enemy-${guestId}:m2"`));
  assert.doesNotMatch(html, /観戦中/);
});

test("build248 forwards bounded roster vitals during and after an expedition", async () => {
  const sent = [], updates = [], results = [];
  const controller = Object.create(OnlinePartyController.prototype);
  Object.assign(controller, {
    selfId,
    roomId: "ROOM01",
    selectedMonsterId: "self-m1",
    roomState: { ownerId: selfId, expedition: { id: "run-1", hostOwnerId: selfId } },
    capabilities: new Set(["expeditionResultsV1"]),
    expeditionResultInFlight: new Set(),
    recoverySettlementBatch: 1,
    recoverySettlementFailed: false,
    onOnlineVitalsUpdate: event => { updates.push(event); return { ok: true }; },
    onExpeditionResult: async event => { results.push(event); return { ok: true, duplicate: true }; },
    _send: (type, payload) => { sent.push({ type, payload }); return true; },
  });
  const rosterVitals = [
    { combatantId: selfId, monsterId: "self-m1", rosterIndex: 0, isPrimary: true, hp: 155, maxHp: 200, mp: 31, maxMp: 40 },
    { combatantId: `${selfId}:m2`, monsterId: "self-m2", rosterIndex: 1, isPrimary: false, hp: 180, maxHp: 210, mp: 27, maxMp: 40 },
    { combatantId: `${selfId}:m3`, monsterId: "self-m2", rosterIndex: 2, hp: 999, maxHp: 1, mp: 999, maxMp: 1 },
  ];

  controller._applyExpeditionVitals({ playerId: selfId, mutationId: "vitals-1", rosterVitals });
  assert.deepEqual(updates[0].rosterVitals.map(entry => entry.monsterId), ["self-m1", "self-m2"], "duplicate or excess monster records are not persisted twice");
  assert.equal(updates[0].monsterId, "self-m1");
  assert.equal(updates[0].hp, 155);
  assert.deepEqual(sent[0], { type: "expeditionVitalsAck", payload: { mutationId: "vitals-1" } });

  await controller._receiveExpeditionResult({
    runId: "run-1", resultId: "result-1", ownerId: selfId, recipientId: selfId,
    startFloor: 1, endFloor: 2, floorsCleared: 1, finalVitals: { mutationId: "final-1", rosterVitals },
  }, 1);
  assert.equal(results[0].finalVitals.rosterVitals.length, 2);
  assert.equal(results[0].finalVitals.monsterId, "self-m1");
  assert.deepEqual(sent.at(-1), { type: "expeditionResultAck", payload: { resultId: "result-1" } });
});
