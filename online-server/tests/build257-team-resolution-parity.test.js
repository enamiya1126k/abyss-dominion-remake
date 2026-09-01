import test from "node:test";
import assert from "node:assert/strict";

import { TeamBattleCoordinator, chooseTeamAutoAction } from "../src/TeamBattleCoordinator.js";

function metrics() {
  return { damage: 0, healing: 0, damageTaken: 0, guards: 0, support: 0, kos: 0 };
}

function combatant(playerId, side, overrides = {}) {
  return {
    playerId,
    ownerPlayerId: `${playerId}-owner`,
    name: playerId,
    side,
    hp: 1_000,
    maxHp: 1_000,
    mp: 100,
    maxMp: 100,
    shield: 0,
    guard: false,
    itemCharges: 1,
    cooldowns: {},
    attribute: "neutral",
    element: "neutral",
    stats: { hp: 1_000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: 100, crit: 0, evasion: 0, accuracy: 120 },
    skills: [],
    effects: [],
    circleEffect: "none",
    circleLevel: 0,
    circleLastLifeUsed: false,
    circleReviveUsed: false,
    metrics: metrics(),
    ...overrides,
  };
}

test("build257 team AUTO falls back to an item when an inefficient group heal exists", () => {
  const actor = combatant("healer", "sun", {
    skills: [{ id: "all-heal", kind: "allHeal", mp: 10, cooldown: 0, heal: 1, allAllies: true }],
  });
  const critical = combatant("critical", "sun", { hp: 200 });
  const healthy = combatant("healthy", "sun");
  const enemy = combatant("enemy", "moon");
  const battle = { players: { healer: actor, critical, healthy, enemy }, actions: {} };

  const action = chooseTeamAutoAction(battle, actor, 257);
  assert.equal(action.kind, "item");
  assert.equal(action.targetId, critical.playerId);
});

test("build257 team AUTO reserves an ally already assigned a single-target recovery", () => {
  const first = combatant("first", "sun", {
    skills: [{ id: "heal", kind: "heal", mp: 5, cooldown: 0, heal: .3 }],
  });
  const second = combatant("second", "sun", {
    hp: 250,
    skills: [{ id: "heal", kind: "heal", mp: 5, cooldown: 0, heal: .3 }],
  });
  const lowest = combatant("lowest", "sun", { hp: 150 });
  const enemy = combatant("enemy", "moon");
  const battle = {
    players: { first, second, lowest, enemy },
    actions: { first: { actorId: first.playerId, kind: "skill", skillId: "heal", targetId: lowest.playerId } },
  };

  const action = chooseTeamAutoAction(battle, second, 257);
  assert.equal(action.kind, "skill");
  assert.equal(action.skillId, "heal");
  assert.equal(action.targetId, second.playerId);
});

test("build257 team resolution applies AOE, hybrid stats, element advantage and status to every enemy", () => {
  const skill = {
    id: "hybrid-flame",
    name: "Hybrid Flame",
    kind: "attack",
    mp: 10,
    cooldown: 2,
    power: 1,
    hits: 1,
    allEnemies: true,
    damageClass: "hybrid",
    element: "fire",
    status: { id: "scorch", name: "Scorch", chance: 1, power: .2, turns: 2 },
  };
  const actor = combatant("actor", "sun", {
    stats: { hp: 1_000, mp: 100, atk: 10, matk: 1_000, def: 100, mdef: 100, spd: 100, crit: 0, evasion: 0, accuracy: 120 },
    skills: [skill],
  });
  const enemyA = combatant("enemy-a", "moon", {
    hp: 10_000,
    maxHp: 10_000,
    element: "ice",
    attribute: "ice",
    stats: { hp: 10_000, mp: 100, atk: 100, matk: 100, def: 1_000_000_000, mdef: 0, spd: 100, crit: 0, evasion: 0, accuracy: 100 },
  });
  const enemyB = combatant("enemy-b", "moon", {
    hp: 10_000,
    maxHp: 10_000,
    element: "ice",
    attribute: "ice",
    stats: { hp: 10_000, mp: 100, atk: 100, matk: 100, def: 1_000_000_000, mdef: 0, spd: 100, crit: 0, evasion: 0, accuracy: 100 },
  });
  const battle = { round: 1, damageMultiplier: 1, healingMultiplier: 1, players: { actor, "enemy-a": enemyA, "enemy-b": enemyB } };
  const coordinator = new TeamBattleCoordinator({ random: () => 0, sessions: new Map() });
  const events = [];

  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: skill.id, targetId: enemyA.playerId }, events);

  assert.ok(enemyA.hp < 7_000, "hybrid damage must use the stronger magical attack against the lower defense");
  assert.ok(enemyB.hp < 7_000, "allEnemies must damage the second enemy too");
  assert.equal(events.filter(event => event.kind === "damage").length, 2);
  assert.equal(events.filter(event => event.kind === "damage").every(event => event.elementFactor === 1.25), true);
  assert.equal(enemyA.effects.some(effect => effect.kind === "status:scorch"), true);
  assert.equal(enemyB.effects.some(effect => effect.kind === "status:scorch"), true);
});

test("build257 team magic-to-physical conversion is shared by AUTO and resolution", () => {
  const physical = { id: "physical", name: "Physical", kind: "attack", mp: 10, cooldown: 0, power: 1.5, hits: 1, damageClass: "physical", guaranteedHit: true };
  const magical = { id: "magical", name: "Magical", kind: "attack", mp: 10, cooldown: 0, power: 1.5, hits: 1, damageClass: "magic", guaranteedHit: true };
  const baseStats = { hp: 1_000, mp: 100, atk: 100, matk: 300, def: 100, mdef: 100, spd: 100, crit: 0, evasion: 0, accuracy: 120 };
  const actor = combatant("actor", "sun", { stats: baseStats, skills: [physical, magical] });
  const enemy = combatant("enemy", "moon", { hp: 10_000, maxHp: 10_000, stats: { ...baseStats, hp: 10_000, atk: 100, matk: 100 } });
  let battle = { round: 1, damageMultiplier: 1, players: { actor, enemy }, actions: {} };

  assert.equal(chooseTeamAutoAction(battle, actor, 257).skillId, magical.id);
  actor.effects = [{ kind: "magicToPhysical", value: .5, turns: 2 }];
  assert.equal(chooseTeamAutoAction(battle, actor, 257).skillId, physical.id);

  const coordinator = new TeamBattleCoordinator({ random: () => 0, sessions: new Map() });
  const physicalTarget = combatant("physical-target", "moon", { hp: 10_000, maxHp: 10_000, stats: { ...baseStats, hp: 10_000, atk: 100, matk: 100 } });
  battle = { round: 1, damageMultiplier: 1, players: { actor, "physical-target": physicalTarget } };
  const physicalEvents = [];
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: physical.id, targetId: physicalTarget.playerId }, physicalEvents);

  actor.mp = actor.maxMp;
  const magicalTarget = combatant("magical-target", "moon", { hp: 10_000, maxHp: 10_000, stats: { ...baseStats, hp: 10_000, atk: 100, matk: 100 } });
  battle = { round: 1, damageMultiplier: 1, players: { actor, "magical-target": magicalTarget } };
  const magicalEvents = [];
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: magical.id, targetId: magicalTarget.playerId }, magicalEvents);

  assert.ok(physicalEvents.find(event => event.kind === "damage").value > magicalEvents.find(event => event.kind === "damage").value,
    "half of MATK must move into ATK, leaving only the unconverted half for magic damage");
});

test("build257 team AUTO estimates active attack and defense effects with resolver semantics", () => {
  const finisher = { id: "finisher", name: "Finisher", kind: "attack", mp: 10, cooldown: 0, power: 4, hits: 1, damageClass: "physical", guaranteedHit: true };
  const weakened = combatant("weakened", "sun", {
    effects: [{ kind: "atkDown", value: .8, turns: 2 }],
    skills: [finisher],
  });
  const fortified = combatant("fortified", "moon", {
    hp: 200,
    effects: [{ kind: "defUp", value: .5, turns: 2 }],
  });
  let battle = { round: 1, damageMultiplier: 1, players: { weakened, fortified }, actions: {} };
  const action = chooseTeamAutoAction(battle, weakened, 257);
  assert.equal(action.skillId, finisher.id, "AUTO must not mistake the weakened basic attack for a lethal hit");

  const coordinator = new TeamBattleCoordinator({ random: () => 0, sessions: new Map() });
  const events = [];
  coordinator._resolveAction(battle, weakened, action, events);
  assert.equal(fortified.hp, 0, "the finisher selected with effect-aware estimation is lethal in the resolver too");

  const costly = { ...finisher, id: "costly", name: "Costly", power: 2 };
  const strengthened = combatant("strengthened", "sun", {
    effects: [{ kind: "atkUp", value: 1, turns: 2 }],
    skills: [costly],
  });
  const exposed = combatant("exposed", "moon", {
    hp: 300,
    effects: [{ kind: "defDown", value: .5, turns: 2 }],
  });
  battle = { round: 1, damageMultiplier: 1, players: { strengthened, exposed }, actions: {} };
  assert.equal(chooseTeamAutoAction(battle, strengthened, 257).kind, "attack",
    "AUTO must conserve MP when attack-up and defense-down make the basic attack lethal");
});

test("build257 team revive resolves cleanse, revivedEffects and revive MP", () => {
  const revive = {
    id: "revive",
    name: "Revive Blessing",
    kind: "revive",
    mp: 20,
    cooldown: 4,
    revive: .4,
    reviveMp: .2,
    cleanse: true,
    revivedEffects: [{ kind: "atkUp", value: .3, turns: 2 }],
  };
  const actor = combatant("actor", "sun", { skills: [revive] });
  const fallen = combatant("fallen", "sun", {
    hp: 0,
    mp: 80,
    effects: [{ kind: "atkDown", value: .2, turns: 2 }, { kind: "status:poison", value: .1, turns: 2 }],
  });
  const enemy = combatant("enemy", "moon");
  const battle = { round: 1, damageMultiplier: 1, healingMultiplier: 1, players: { actor, fallen, enemy } };
  const coordinator = new TeamBattleCoordinator({ random: () => 0, sessions: new Map() });
  const events = [];

  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: revive.id, targetId: fallen.playerId }, events);

  assert.equal(fallen.hp, 400);
  assert.equal(fallen.mp, 20, "revive MP is set from max MP rather than added to the pre-KO remainder");
  assert.equal(fallen.effects.some(effect => effect.kind === "atkDown" || effect.kind === "status:poison"), false);
  assert.equal(fallen.effects.some(effect => effect.kind === "atkUp"), true);
  assert.equal(events.some(event => event.kind === "cleanse"), true);
});

test("build257 team recovery projection permits a second group heal only while allies remain critical", () => {
  const groupHeal = { id: "group-heal", kind: "allHeal", mp: 5, cooldown: 0, heal: .25, allAllies: true };
  const first = combatant("first", "sun", { hp: 10, skills: [groupHeal] });
  const second = combatant("second", "sun", { hp: 10, skills: [groupHeal] });
  const enemy = combatant("enemy", "moon");
  const battle = {
    healingMultiplier: 1,
    players: { first, second, enemy },
    actions: { first: { actorId: first.playerId, kind: "skill", skillId: groupHeal.id, targetId: first.playerId } },
  };

  const action = chooseTeamAutoAction(battle, second, 257);
  assert.equal(action.kind, "skill");
  assert.equal(action.skillId, groupHeal.id, "one 25% heal leaves both allies at 26%, so a second heal is still useful");
});

test("build257 team AUTO does not project a slower committed heal into a faster actor's decision state", () => {
  const fastHeal = { id: "fast-heal", kind: "allHeal", mp: 5, cooldown: 0, heal: .25, allAllies: true };
  const slowHeal = { id: "slow-heal", kind: "allHeal", mp: 5, cooldown: 0, heal: .6, allAllies: true };
  const fast = combatant("fast", "sun", {
    hp: 10,
    skills: [fastHeal],
    stats: { hp: 1_000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: 200, crit: 0, evasion: 0, accuracy: 120 },
  });
  const slow = combatant("slow", "sun", {
    hp: 10,
    skills: [slowHeal],
    stats: { hp: 1_000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: 100, crit: 0, evasion: 0, accuracy: 120 },
  });
  const enemy = combatant("enemy", "moon");
  const battle = {
    players: { fast, slow, enemy },
    actions: { slow: { actorId: slow.playerId, kind: "skill", skillId: slowHeal.id, targetId: slow.playerId } },
  };

  const action = chooseTeamAutoAction(battle, fast, 257);
  assert.equal(action.kind, "skill");
  assert.equal(action.skillId, fastHeal.id, "the later heal cannot make the faster actor's current critical state look healthy");
});

test("build257 team bulk AUTO planning follows the resolver's effective-SPD order on every fill path", () => {
  const scenario = ({ tied = false, splitOwners = false, healerFirst = false } = {}) => {
    const revive = { id: "revive", name: "Revive", kind: "revive", mp: 10, cooldown: 2, revive: .2 };
    const heal = { id: "heal", name: "Heal", kind: "heal", mp: 10, cooldown: 2, heal: .3 };
    const reviverOwnerId = splitOwners ? "reviver-owner" : "owner", healerOwnerId = splitOwners ? "healer-owner" : "owner";
    const reviver = combatant("reviver", "sun", {
      ownerPlayerId: reviverOwnerId,
      skills: [revive],
      stats: { hp: 1_000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: 100, crit: 0, evasion: 0, accuracy: 120 },
    });
    const healer = combatant("healer", "sun", {
      ownerPlayerId: healerOwnerId,
      skills: [heal],
      stats: { hp: 1_000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: tied ? 100 : 200, crit: 0, evasion: 0, accuracy: 120 },
    });
    const fallen = combatant("fallen", "sun", { ownerPlayerId: splitOwners ? "fallen-owner" : "owner", hp: 0 });
    const enemy = combatant("enemy", "moon", {
      ownerPlayerId: "enemy-owner",
      stats: { hp: 1_000, mp: 100, atk: 1, matk: 1, def: 100, mdef: 100, spd: 50, crit: 0, evasion: 0, accuracy: 120 },
    });
    const battle = {
      id: `order-${tied ? "tie" : "fast"}`, round: 1, phase: "command", speed: 1, commandMs: 18_000,
      deadlineAt: 10_000, nextRoundAt: 0, damageMultiplier: 1, healingMultiplier: 1,
      ruleset: "standard", series: "bo1", targetWins: 1, score: { sun: 0, moon: 0 }, games: [], betweenGames: false,
      players: healerFirst ? { healer, reviver, fallen, enemy } : { reviver, healer, fallen, enemy }, actions: {}, autoPlayers: new Set(), lastEvents: [],
    };
    return { revive, heal, reviver, healer, fallen, enemy, reviverOwnerId, healerOwnerId, battle, room: { phase: "team", teamBattle: battle, members: new Set() } };
  };
  const makeCoordinator = () => new TeamBattleCoordinator({
    now: () => 100,
    random: () => 0,
    sessions: new Map([
      ["owner", { playerId: "owner", connected: true }],
      ["reviver-owner", { playerId: "reviver-owner", connected: true }],
      ["healer-owner", { playerId: "healer-owner", connected: true }],
      ["enemy-owner", { playerId: "enemy-owner", connected: true }],
    ]),
    broadcast: () => {},
  });

  let state = scenario(), coordinator = makeCoordinator();
  coordinator.setAuto(state.room, { playerId: "owner" }, true);
  assert.equal(state.battle.actions.healer.kind, "attack", "setAuto plans the faster healer before the slower revive");
  assert.equal(state.battle.actions.reviver.skillId, state.revive.id);
  state.battle.actions.enemy = { actorId: "enemy", kind: "guard", targetId: "enemy" };
  coordinator._resolve(state.room, state.battle);
  assert.equal(state.fallen.hp, 200);
  assert.equal(state.healer.mp, state.healer.maxMp, "the faster healer must not waste MP on a still-fallen target");
  assert.equal(state.battle.lastEvents.some(event => event.kind === "heal" && event.actorId === state.healer.playerId), false);

  state = scenario(); coordinator = makeCoordinator();
  state.battle.autoPlayers.add("owner");
  coordinator.advance(state.room);
  assert.equal(state.battle.actions.healer.kind, "attack", "advance uses the same effective-SPD planning order");
  assert.equal(state.battle.actions.reviver.skillId, state.revive.id);

  state = scenario(); coordinator = makeCoordinator();
  coordinator._resolve(state.room, state.battle);
  assert.equal(state.fallen.hp, 200, "resolver fallback fills and executes AUTO in the same effective-SPD order");
  assert.equal(state.healer.mp, state.healer.maxMp);

  state = scenario({ tied: true }); coordinator = makeCoordinator();
  coordinator.setAuto(state.room, { playerId: "owner" }, true);
  assert.equal(state.battle.actions.reviver.skillId, state.revive.id);
  assert.equal(state.battle.actions.healer.skillId, state.heal.id, "stable insertion order is shared for an effective-SPD tie");
  state.battle.actions.enemy = { actorId: "enemy", kind: "guard", targetId: "enemy" };
  coordinator._resolve(state.room, state.battle);
  assert.equal(state.fallen.hp, 500, "the tied reviver acts before the tied heal exactly as projected");

  state = scenario({ splitOwners: true }); coordinator = makeCoordinator();
  coordinator.setAuto(state.room, { playerId: state.reviverOwnerId }, true);
  coordinator.setAuto(state.room, { playerId: state.healerOwnerId }, true);
  assert.equal(state.battle.actions.healer.kind, "attack",
    "a fast owner must not heal a corpse based on another owner's already-queued slower revive");

  state = scenario({ tied: true, splitOwners: true, healerFirst: true }); coordinator = makeCoordinator();
  coordinator.setAuto(state.room, { playerId: state.reviverOwnerId }, true);
  coordinator.setAuto(state.room, { playerId: state.healerOwnerId }, true);
  assert.equal(state.battle.actions.healer.kind, "attack",
    "for an SPD tie, object insertion order determines that the healer still acts before the committed revive");
});

test("build257 team AI and resolver share capped defense-ignore semantics", () => {
  const plain = { id: "plain", name: "Plain", kind: "attack", mp: 10, cooldown: 0, power: 5, hits: 1, damageClass: "physical", element: "neutral", defenseIgnore: 0 };
  const pierce = { id: "pierce", name: "Pierce", kind: "attack", mp: 10, cooldown: 0, power: 2, hits: 1, damageClass: "physical", element: "neutral", defenseIgnore: .9 };
  const actor = combatant("actor", "sun", { skills: [plain, pierce] });
  const enemy = combatant("enemy", "moon", {
    hp: 10_000,
    maxHp: 10_000,
    stats: { hp: 10_000, mp: 100, atk: 100, matk: 100, def: 900, mdef: 900, spd: 100, crit: 0, evasion: 0, accuracy: 100 },
  });
  const battle = { round: 1, damageMultiplier: 1, players: { actor, enemy }, actions: {} };
  assert.equal(chooseTeamAutoAction(battle, actor, 257).skillId, pierce.id);

  const coordinator = new TeamBattleCoordinator({ random: () => 0, sessions: new Map() });
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: pierce.id, targetId: enemy.playerId }, []);
  assert.ok(enemy.hp < 7_500, "the resolver must apply the same 90% defense-ignore cap used by AUTO");
});

test("build257 team supports transfer revival and combined all-heal revival", () => {
  const transferRevive = { id: "transfer", name: "Transfer", kind: "revive", mp: 10, cooldown: 0, reviveTransferRate: .5, reviveMp: .2, revivedEffects: [] };
  const actor = combatant("actor", "sun", { hp: 800, skills: [transferRevive] });
  const fallen = combatant("fallen", "sun", { hp: 0, mp: 0 });
  const enemy = combatant("enemy", "moon");
  const battle = { round: 1, healingMultiplier: 1, players: { actor, fallen, enemy } };
  const coordinator = new TeamBattleCoordinator({ random: () => 0, sessions: new Map() });
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: transferRevive.id, targetId: fallen.playerId }, []);
  assert.equal(actor.hp, 400);
  assert.equal(fallen.hp, 400);
  assert.equal(fallen.mp, 20);

  const combined = { id: "combined", name: "Combined", kind: "allHeal", mp: 10, cooldown: 0, heal: .2, allAllies: true, revive: .01, reviveTransferRate: .5, reviveMp: .3, revivedEffects: [] };
  const secondActor = combatant("second-actor", "sun", { hp: 400, skills: [combined] });
  const secondFallen = combatant("second-fallen", "sun", { hp: 0, mp: 0 });
  const secondEnemy = combatant("second-enemy", "moon");
  const secondBattle = { round: 1, healingMultiplier: 1, players: { "second-actor": secondActor, "second-fallen": secondFallen, "second-enemy": secondEnemy } };
  coordinator._resolveAction(secondBattle, secondActor, { kind: "skill", skillId: combined.id, targetId: secondFallen.playerId }, []);
  assert.equal(secondActor.hp, 300, "all-heal resolves before sharing half of the healed caster HP");
  assert.equal(secondFallen.hp, 300);
  assert.equal(secondFallen.mp, 30);
});

test("build257 team preserves control effects, cleanse and power-zero fixed damage skills", () => {
  const control = { id: "control", name: "Control", kind: "attack", mp: 0, cooldown: 0, power: 1, hits: 1, guaranteedHit: true, effects: [{ kind: "healDown", value: .5, turns: 2, enemy: true }, { kind: "stun", value: 1, turns: 1, enemy: true }] };
  const actor = combatant("actor", "sun", { skills: [control] });
  const enemy = combatant("enemy", "moon");
  const battle = { round: 1, damageMultiplier: 1, healingMultiplier: 1, players: { actor, enemy } };
  const coordinator = new TeamBattleCoordinator({ random: () => 0, sessions: new Map() });
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: control.id, targetId: enemy.playerId }, []);
  assert.equal(enemy.effects.some(effect => effect.kind === "healDown"), true);
  assert.equal(enemy.effects.some(effect => effect.kind === "stun"), true);
  const skipEvents = [];
  coordinator._resolveAction(battle, enemy, { kind: "attack", targetId: actor.playerId }, skipEvents);
  assert.equal(skipEvents.some(event => event.kind === "statusSkip"), true);

  const cleanse = { id: "cleanse", name: "Cleanse", kind: "buff", mp: 0, cooldown: 0, cleanse: true };
  const cleanser = combatant("cleanser", "moon", { skills: [cleanse] });
  battle.players.cleanser = cleanser;
  coordinator._resolveAction(battle, cleanser, { kind: "skill", skillId: cleanse.id, targetId: enemy.playerId }, []);
  assert.equal(enemy.effects.some(effect => ["healDown", "stun"].includes(effect.kind)), false);

  const drain = { id: "drain", name: "Drain", kind: "attack", mp: 0, cooldown: 0, power: 0, hits: 1, guaranteedHit: true, fillHpDrain: 1 };
  actor.skills = [drain];
  actor.hp = 400;
  enemy.hp = 1_000;
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: drain.id, targetId: enemy.playerId }, []);
  assert.equal(actor.hp, 1_000);
  assert.equal(enemy.hp, 400);

  const sacrifice = { id: "sacrifice", name: "Sacrifice", kind: "attack", mp: 0, cooldown: 0, power: 0, hits: 1, guaranteedHit: true, selfSacrificeHpDamage: 1 };
  actor.skills = [sacrifice];
  actor.hp = 500;
  enemy.hp = 1_000;
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: sacrifice.id, targetId: enemy.playerId }, []);
  assert.equal(actor.hp, 0);
  assert.equal(enemy.hp, 500);
});

test("build257 team AUTO never spends a nonlethal self-sacrifice", () => {
  const sacrifice = { id: "sacrifice", name: "Sacrifice", kind: "attack", mp: 0, cooldown: 0, power: 0, hits: 1, guaranteedHit: true, selfSacrificeHpDamage: 1 };
  const actor = combatant("actor", "sun", { hp: 500, skills: [sacrifice] });
  const enemy = combatant("enemy", "moon", { hp: 1_000 });
  const action = chooseTeamAutoAction({ players: { actor, enemy }, actions: {} }, actor, 257);
  assert.notEqual(action.skillId, sacrifice.id);
  assert.equal(action.kind, "attack");
});

test("build257 team refunds a duplicate pure revive instead of consuming MP or CT", () => {
  const revive = { id: "revive", name: "Revive", kind: "revive", mp: 20, cooldown: 4, revive: .4 };
  const first = combatant("first", "sun", { skills: [revive] });
  const second = combatant("second", "sun", { skills: [revive] });
  const fallen = combatant("fallen", "sun", { hp: 0 });
  const enemy = combatant("enemy", "moon");
  const battle = { round: 1, healingMultiplier: 1, players: { first, second, fallen, enemy } };
  const coordinator = new TeamBattleCoordinator({ random: () => 0, sessions: new Map() });
  coordinator._resolveAction(battle, first, { kind: "skill", skillId: revive.id, targetId: fallen.playerId }, []);
  const events = [];
  coordinator._resolveAction(battle, second, { kind: "skill", skillId: revive.id, targetId: fallen.playerId }, events);
  assert.equal(second.mp, second.maxMp);
  assert.equal(second.cooldowns[revive.id], undefined);
  assert.equal(events.some(event => event.kind === "reviveFail"), true);
});

test("build257 team transfer revive cannot create HP from a one-HP caster", () => {
  const revive = { id: "transfer", name: "Transfer", kind: "revive", mp: 20, cooldown: 4, reviveTransferRate: .5 };
  const actor = combatant("actor", "sun", { hp: 1, skills: [revive] });
  const fallen = combatant("fallen", "sun", { hp: 0 });
  const enemy = combatant("enemy", "moon");
  const battle = { round: 1, healingMultiplier: 1, players: { actor, fallen, enemy } };
  const coordinator = new TeamBattleCoordinator({ random: () => 0, sessions: new Map() });
  const events = [];
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: revive.id, targetId: fallen.playerId }, events);
  assert.equal(actor.hp, 1);
  assert.equal(fallen.hp, 0);
  assert.equal(actor.mp, actor.maxMp);
  assert.equal(actor.cooldowns[revive.id], undefined);
  assert.equal(events.some(event => event.kind === "reviveFail"), true);
});

test("build257 team attack-wide ally effects and guaranteed combat buffs are functional", () => {
  const skill = {
    id: "battle-hymn", name: "Battle Hymn", kind: "attack", mp: 0, cooldown: 0, power: .2, hits: 1,
    effects: [{ kind: "atkUp", value: .2, turns: 2, allies: true }],
  };
  const actor = combatant("actor", "sun", {
    skills: [skill],
    effects: [{ kind: "guaranteedHit", value: 0, turns: 2 }, { kind: "guaranteedCritical", value: 0, turns: 2 }],
    stats: { hp: 1_000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: 100, crit: 0, evasion: 0, accuracy: 20 },
  });
  const ally = combatant("ally", "sun");
  const enemy = combatant("enemy", "moon", {
    effects: [{ kind: "guard", value: .5, turns: 2 }, { kind: "vulnerable", value: .5, turns: 2 }],
    stats: { hp: 1_000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: 100, crit: 0, evasion: 75, accuracy: 100 },
  });
  const battle = { round: 1, damageMultiplier: 1, players: { actor, ally, enemy } };
  const coordinator = new TeamBattleCoordinator({ random: () => .99, sessions: new Map() });
  const events = [];
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: skill.id, targetId: enemy.playerId }, events);
  const damage = events.find(event => event.kind === "damage");
  assert.ok(damage?.value > 0, "guaranteedHit from an active buff must bypass evasion");
  assert.equal(damage?.critical, true);
  assert.equal(actor.effects.some(effect => effect.kind === "atkUp"), true);
  assert.equal(ally.effects.some(effect => effect.kind === "atkUp"), true, "effect.allies applies to every living ally even on a single-target attack");
});

test("build257 team percent damage still permits last-life and revival circles", () => {
  const skill = { id: "percent", name: "Percent", kind: "attack", mp: 0, cooldown: 0, power: .2, hits: 1, guaranteedHit: true, currentHpDamage: .25 };
  const actor = combatant("actor", "sun", {
    skills: [skill],
    stats: { hp: 1_000, mp: 100, atk: 1, matk: 1, def: 100, mdef: 100, spd: 100, crit: 0, evasion: 0, accuracy: 120 },
  });
  const enemy = combatant("enemy", "moon", {
    hp: 2, maxHp: 1_000, circleEffect: "lastLife",
    stats: { hp: 1_000, mp: 100, atk: 100, matk: 100, def: 1_000_000_000, mdef: 1_000_000_000, spd: 100, crit: 0, evasion: 0, accuracy: 100 },
  });
  const battle = { round: 1, damageMultiplier: 1, players: { actor, enemy } };
  const coordinator = new TeamBattleCoordinator({ random: () => .5, sessions: new Map() });
  const events = [];
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: skill.id, targetId: enemy.playerId }, events);
  assert.equal(enemy.hp, 1);
  assert.equal(enemy.circleLastLifeUsed, true);
  assert.equal(events.some(event => event.kind === "circleActivate"), true);
  assert.equal(events.some(event => event.kind === "ko"), false);
});

test("build257 team combined revival applies cleanse, ally effects and party shield after revival", () => {
  const skill = {
    id: "returning-aegis", name: "Returning Aegis", kind: "allHeal", mp: 10, cooldown: 2,
    heal: .2, allAllies: true, revive: .3, cleanse: true, partyShieldRate: .2,
    effects: [{ kind: "atkUp", value: .2, turns: 2, allies: true }],
  };
  const actor = combatant("actor", "sun", { skills: [skill] });
  const fallen = combatant("fallen", "sun", { hp: 0, effects: [{ kind: "atkDown", value: .2, turns: 2 }] });
  const enemy = combatant("enemy", "moon");
  const battle = { round: 1, healingMultiplier: 1, players: { actor, fallen, enemy } };
  const coordinator = new TeamBattleCoordinator({ random: () => 0, sessions: new Map() });
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: skill.id, targetId: fallen.playerId }, []);
  assert.ok(fallen.hp > 0);
  assert.equal(fallen.effects.some(effect => effect.kind === "atkDown"), false);
  assert.equal(fallen.effects.some(effect => effect.kind === "atkUp"), true);
  assert.equal(fallen.shield, 200);
  assert.equal(actor.shield, 200);
});

test("build257 team honors effect chance and maps compatibility cooldown extension to enemies only", () => {
  const skill = {
    id: "time-lock", name: "Time Lock", kind: "buff", mp: 10, cooldown: 0,
    increaseAllyCooldowns: 2,
    effects: [
      { kind: "atkUp", value: .5, turns: 2, allies: true, chance: 0 },
      { kind: "stun", value: 1, turns: 1, enemy: true, chance: 0 },
    ],
  };
  const actor = combatant("actor", "sun", { skills: [skill], cooldowns: { own: 2 } });
  const ally = combatant("ally", "sun", { cooldowns: { ally: 3 } });
  const enemy = combatant("enemy", "moon", { cooldowns: { enemy: 1 } });
  const battle = { round: 1, players: { actor, ally, enemy } };
  const coordinator = new TeamBattleCoordinator({ random: () => .99, sessions: new Map() });
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: skill.id, targetId: enemy.playerId }, []);
  assert.equal(actor.effects.some(effect => effect.kind === "atkUp"), false);
  assert.equal(ally.effects.some(effect => effect.kind === "atkUp"), false);
  assert.equal(enemy.effects.some(effect => effect.kind === "stun"), false);
  assert.deepEqual(actor.cooldowns, { own: 2 });
  assert.deepEqual(ally.cooldowns, { ally: 3 });
  assert.deepEqual(enemy.cooldowns, { enemy: 3 });
});

test("build257 team attack resolves percent damage, healing, MP drain, shields and CT fields once", () => {
  const skill = {
    id: "authority", name: "Authority", kind: "attack", mp: 10, cooldown: 3, power: .2, hits: 1,
    guaranteedHit: true, guaranteedCritical: true, currentHpDamage: .2, drain: .25, selfHeal: .1,
    mpDrain: .5, partyShieldRate: .2, reducePartyCooldowns: 1, increaseEnemyCooldowns: 2,
  };
  const actor = combatant("actor", "sun", { hp: 500, skills: [skill], cooldowns: { prior: 3 } });
  const ally = combatant("ally", "sun", { cooldowns: { ally: 3 } });
  const enemy = combatant("enemy", "moon", {
    hp: 5_000, maxHp: 10_000, mp: 100, maxMp: 100, cooldowns: { enemy: 1 },
    stats: { hp: 10_000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: 100, crit: 0, evasion: 0, accuracy: 100 },
  });
  const battle = { round: 1, damageMultiplier: 1, players: { actor, ally, enemy } };
  const coordinator = new TeamBattleCoordinator({ random: () => 0, sessions: new Map() });
  const events = [];
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: skill.id, targetId: enemy.playerId }, events);
  assert.ok(enemy.hp < 5_000);
  assert.equal(events.filter(event => event.kind === "damage").length, 2);
  assert.ok(actor.hp > 500);
  assert.ok(actor.mp > 90);
  assert.ok(enemy.mp < 100);
  assert.equal(actor.shield, 200);
  assert.equal(ally.shield, 200);
  assert.equal(actor.cooldowns.prior, 2);
  assert.equal(actor.cooldowns[skill.id], 3);
  assert.equal(ally.cooldowns.ally, 2);
  assert.equal(enemy.cooldowns.enemy, 3);
});

test("build257 team heal-down reduces regeneration, drain and post-attack self healing", () => {
  const regenerating = combatant("regenerating", "sun", {
    hp: 100,
    effects: [{ kind: "regen", value: .2, turns: 2 }, { kind: "healDown", value: .5, turns: 2 }],
  });
  const roundEnemy = combatant("round-enemy", "moon");
  const roundBattle = {
    round: 1, phase: "result", outcome: null, betweenGames: false, nextRoundAt: 0, commandMs: 18_000,
    players: { regenerating, "round-enemy": roundEnemy }, actions: {}, lastEvents: [], autoPlayers: new Set(),
  };
  const room = { phase: "team", teamBattle: roundBattle, members: new Set() };
  const coordinator = new TeamBattleCoordinator({ now: () => 100, random: () => 0, sessions: new Map(), broadcast: () => {} });
  coordinator.advance(room);
  assert.equal(regenerating.hp, 200, "50% heal-down must halve 20% regeneration");

  const leech = { id: "leech", name: "Leech", kind: "attack", mp: 0, cooldown: 0, power: .2, hits: 1, damageClass: "physical", guaranteedHit: true, drain: .5, selfHeal: .1 };
  const attacker = combatant("attacker", "sun", {
    hp: 100,
    effects: [{ kind: "healDown", value: .5, turns: 2 }],
    skills: [leech],
  });
  const target = combatant("target", "moon", {
    hp: 10_000,
    maxHp: 10_000,
    stats: { hp: 10_000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: 100, crit: 0, evasion: 0, accuracy: 100 },
  });
  const battle = { round: 1, damageMultiplier: 1, players: { attacker, target } };
  const events = [];
  coordinator._resolveAction(battle, attacker, { kind: "skill", skillId: leech.id, targetId: target.playerId }, events);
  assert.equal(attacker.hp, 260);
  assert.deepEqual(events.filter(event => event.kind === "heal").map(event => event.value), [110, 50]);
});

test("build257 team random element uses only the canonical eight combat attributes", () => {
  const skill = { id: "random", name: "Random", kind: "attack", mp: 0, cooldown: 0, power: .2, hits: 1, guaranteedHit: true, randomElement: true };
  const actor = combatant("actor", "sun", { skills: [skill] });
  const enemy = combatant("enemy", "moon", { element: "light", attribute: "light" });
  const battle = { round: 1, damageMultiplier: 1, players: { actor, enemy } };
  const coordinator = new TeamBattleCoordinator({ random: () => .999, sessions: new Map() });
  const events = [];
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: skill.id, targetId: enemy.playerId }, events);
  assert.equal(events.find(event => event.kind === "damage")?.elementFactor, 1.25, "the last canonical random element is dark, not poison");
});

test("build257 team value-zero hard control still blocks the next action after a slow cast", () => {
  const freeze = { id: "freeze", name: "Freeze", kind: "attack", mp: 0, cooldown: 0, power: .2, hits: 1, guaranteedHit: true, status: { id: "freeze", name: "Freeze", chance: 1, power: 0, turns: 1 } };
  const caster = combatant("caster", "sun", { skills: [freeze] });
  const target = combatant("target", "moon");
  const battle = {
    round: 1, phase: "result", outcome: null, betweenGames: false, nextRoundAt: 0, commandMs: 18_000,
    damageMultiplier: 1, players: { caster, target }, actions: {}, lastEvents: [], autoPlayers: new Set(),
  };
  const room = { phase: "team", teamBattle: battle, members: new Set() };
  const coordinator = new TeamBattleCoordinator({ now: () => 100, random: () => 0, sessions: new Map() });
  coordinator._resolveAction(battle, caster, { kind: "skill", skillId: freeze.id, targetId: target.playerId }, []);
  const afterDirectHit = target.hp;
  coordinator.advance(room);
  assert.equal(target.hp, afterDirectHit, "a zero-power control status must not deal phantom DOT damage");
  const events = [];
  coordinator._resolveAction(battle, target, { kind: "attack", targetId: caster.playerId }, events);
  assert.equal(events.some(event => event.kind === "statusSkip"), true);
});

test("build257 team damaging statuses tick once, retain attribution and expire by turn", () => {
  const poison = { id: "poison", name: "Poison", kind: "attack", mp: 0, cooldown: 0, power: .2, hits: 1, guaranteedHit: true, status: { id: "poison", name: "Poison", chance: 1, power: .1, turns: 2 } };
  const actor = combatant("actor", "sun", { skills: [poison] });
  const enemy = combatant("enemy", "moon");
  const battle = {
    round: 1, phase: "result", outcome: null, betweenGames: false, nextRoundAt: 0, commandMs: 18_000,
    damageMultiplier: 1, players: { actor, enemy }, actions: {}, lastEvents: [], autoPlayers: new Set(),
  };
  const room = { phase: "team", teamBattle: battle, members: new Set() };
  const coordinator = new TeamBattleCoordinator({ now: () => 100, random: () => 0, sessions: new Map() });
  coordinator._resolveAction(battle, actor, { kind: "skill", skillId: poison.id, targetId: enemy.playerId }, []);
  const afterDirectHit = enemy.hp, damageBefore = actor.metrics.damage;
  coordinator.advance(room);
  assert.equal(enemy.hp, afterDirectHit - 100);
  assert.equal(actor.metrics.damage, damageBefore + 100);
  assert.equal(battle.lastEvents.some(event => event.kind === "statusDamage" && event.actorId === actor.playerId), true);
  assert.equal(enemy.effects.find(effect => effect.kind === "status:poison")?.turns, 1);
});

test("build257 team AUTO ignores revival-sealed fallen allies", () => {
  const revive = { id: "revive", name: "Revive", kind: "revive", mp: 10, cooldown: 0, revive: .4 };
  const actor = combatant("actor", "sun", { skills: [revive] });
  const sealed = combatant("sealed", "sun", { hp: 0, effects: [{ kind: "reviveSeal", value: 1, turns: 3 }] });
  const enemy = combatant("enemy", "moon");
  const action = chooseTeamAutoAction({ players: { actor, sealed, enemy }, actions: {} }, actor, 257);
  assert.equal(action.kind, "attack");
  assert.notEqual(action.skillId, revive.id);
});

test("build257 team AUTO restores critically low MP and opens with a useful nonduplicate buff", () => {
  const mana = { id: "mana", name: "Mana", kind: "mpHeal", mp: 0, cooldown: 2, mpHeal: .4 };
  const actor = combatant("actor", "sun", { skills: [mana] });
  const drained = combatant("drained", "sun", { mp: 10 });
  const enemy = combatant("enemy", "moon");
  let action = chooseTeamAutoAction({ round: 1, players: { actor, drained, enemy }, actions: {} }, actor, 257);
  assert.equal(action.kind, "skill");
  assert.equal(action.skillId, mana.id);
  assert.equal(action.targetId, drained.playerId);

  const buff = { id: "formation", name: "Formation", kind: "buff", mp: 5, cooldown: 3, allAllies: true, effects: [{ kind: "atkUp", value: .2, turns: 2, allies: true }] };
  actor.skills = [buff];
  action = chooseTeamAutoAction({ round: 1, players: { actor, drained, enemy }, actions: {} }, actor, 257);
  assert.equal(action.skillId, buff.id);
  actor.effects = [{ kind: "atkUp", value: .2, turns: 2 }];
  drained.effects = [{ kind: "atkUp", value: .2, turns: 2 }];
  action = chooseTeamAutoAction({ round: 1, players: { actor, drained, enemy }, actions: {} }, actor, 257);
  assert.notEqual(action.skillId, buff.id);
});
