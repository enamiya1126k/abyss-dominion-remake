import test from "node:test";
import assert from "node:assert/strict";

import { chooseOnlineBattleAction } from "../src/OnlineBattleAI.js";
import { RoomStore } from "../src/RoomStore.js";

function actor(overrides = {}) {
  return {
    playerId: "owner",
    ownerPlayerId: "owner",
    hp: 1_000,
    maxHp: 1_000,
    mp: 100,
    maxMp: 100,
    itemCharges: 1,
    element: "neutral",
    stats: { hp: 1_000, mp: 100, atk: 220, matk: 220, def: 100, mdef: 100, spd: 100, crit: 0 },
    cooldowns: {},
    effects: [],
    skills: [],
    ...overrides,
  };
}

function enemy(id, overrides = {}) {
  return {
    id,
    hp: 2_000,
    maxHp: 2_000,
    atk: 100,
    matk: 100,
    def: 100,
    mdef: 100,
    spd: 100,
    element: "neutral",
    effects: [],
    battleActions: [],
    ...overrides,
  };
}

test("build257 online auto AI is deterministic, attribute-aware, and excludes active CT", () => {
  const player = actor({ element: "water" });
  const target = enemy("ice", { element: "ice", hp: 9_000, maxHp: 9_000 });
  const skills = [
    { id: "fire", name: "炎", kind: "attack", element: "fire", power: 1.5, hits: 1, mp: 10, cooldown: 2 },
    { id: "water", name: "水", kind: "attack", element: "water", power: 1.5, hits: 1, mp: 10, cooldown: 2 },
  ];
  const battle = { players: { owner: player }, enemies: [target] };
  assert.equal(chooseOnlineBattleAction(player, battle, skills).skillId, "fire");
  player.cooldowns.fire = 1;
  assert.notEqual(chooseOnlineBattleAction(player, battle, skills).skillId, "fire");
});

test("build257 online auto AI revives/heals first and conserves MP outside emergencies", () => {
  const player = actor({ hp: 500, mp: 100 });
  const ally = actor({ playerId: "ally", ownerPlayerId: "ally", hp: 0, maxHp: 1_500 });
  const foe = enemy("foe", { hp: 20_000, maxHp: 20_000 });
  const revive = { id: "revive", kind: "revive", revive: .35, mp: 25, cooldown: 3 };
  const expensive = { id: "ultimate", kind: "attack", element: "neutral", power: 1.25, hits: 1, mp: 90, cooldown: 4 };
  const battle = { players: { owner: player, ally }, enemies: [foe] };
  assert.deepEqual(chooseOnlineBattleAction(player, battle, [expensive, revive]), {
    actorId: "owner", kind: "skill", skillId: "revive", targetId: "ally", auto: true,
  });
  ally.hp = 1_500;
  assert.equal(chooseOnlineBattleAction(player, battle, [expensive]).kind, "attack", "non-lethal skills do not drain the last 20% MP");
});

test("build257 online auto AI uses an emergency item on a critical ally when no recovery skill is selected", () => {
  const player = actor({ hp: 1_000, itemCharges: 1 });
  const ally = actor({ playerId: "ally", ownerPlayerId: "ally", hp: 180, maxHp: 1_000 });
  const action = chooseOnlineBattleAction(player, { players: { owner: player, ally }, enemies: [enemy("foe")] }, []);
  assert.deepEqual(action, { actorId: "owner", kind: "item", targetId: "ally", auto: true });
});

test("build257 online auto AI projects committed recovery so two actors do not waste healing on the same ally", () => {
  const player = actor({ hp: 1_000, itemCharges: 1 });
  const healer = actor({ playerId: "healer", ownerPlayerId: "owner", hp: 1_000 });
  const ally = actor({ playerId: "ally", ownerPlayerId: "ally", hp: 180, maxHp: 1_000 });
  const heal = { id: "heal", kind: "heal", heal: .65, mp: 5, cooldown: 2 };
  healer.skills = [heal];
  const battle = {
    players: { owner: player, healer, ally },
    enemies: [enemy("foe")],
    actions: { healer: { actorId: "healer", kind: "skill", skillId: "heal", targetId: "ally", auto: true } },
  };
  const action = chooseOnlineBattleAction(player, battle, [heal]);
  assert.equal(action.kind, "attack");
  assert.notEqual(action.targetId, "ally");
});

test("build257 online auto AI recognizes composite and transfer revival skills", () => {
  const player = actor();
  const fallen = actor({ playerId: "fallen", ownerPlayerId: "fallen", hp: 0, maxHp: 1_500, mp: 0 });
  const lifeCycle = { id: "life-cycle", kind: "allHeal", allAllies: true, heal: .1, reviveTransferRate: .5, reviveMp: .2, mp: 10, cooldown: 3 };
  const action = chooseOnlineBattleAction(player, { players: { owner: player, fallen }, enemies: [enemy("foe")] }, [lifeCycle]);
  assert.deepEqual(action, { actorId: "owner", kind: "skill", skillId: "life-cycle", targetId: "fallen", auto: true });
});

test("build257 online auto AI never loops on an unfundable HP-transfer revive", () => {
  const player = actor({ hp: 1, maxHp: 1_000, itemCharges: 0 });
  const fallen = actor({ playerId: "fallen", ownerPlayerId: "fallen", hp: 0, maxHp: 1_500 });
  const pureTransfer = { id: "transfer", kind: "revive", reviveTransferRate: .5, mp: 0, cooldown: 2 };
  let action = chooseOnlineBattleAction(player, { players: { owner: player, fallen }, enemies: [enemy("foe")] }, [pureTransfer]);
  assert.notEqual(action.skillId, pureTransfer.id);
  assert.notEqual(action.kind, "skill");

  const healingTransfer = { id: "healing-transfer", kind: "allHeal", allAllies: true, heal: .5, reviveTransferRate: .5, mp: 0, cooldown: 3 };
  action = chooseOnlineBattleAction(player, { players: { owner: player, fallen }, enemies: [enemy("foe")] }, [healingTransfer]);
  assert.equal(action.skillId, healingTransfer.id, "a composite revive may use HP created by its preceding all-heal");
  assert.equal(action.targetId, fallen.playerId);
});

test("build257 online auto projection does not reserve a fallen ally for a committed unfundable transfer", () => {
  const player = actor({ playerId: "next", ownerPlayerId: "next" });
  const first = actor({ playerId: "first", ownerPlayerId: "first", hp: 1, maxHp: 1_000 });
  const fallen = actor({ playerId: "fallen", ownerPlayerId: "fallen", hp: 0, maxHp: 1_500 });
  const transfer = { id: "transfer", kind: "revive", reviveTransferRate: .5, mp: 0, cooldown: 2 };
  first.skills = [transfer];
  const battle = {
    players: { next: player, first, fallen },
    enemies: [enemy("foe")],
    actions: { first: { actorId: "first", kind: "skill", skillId: transfer.id, targetId: fallen.playerId } },
  };
  const action = chooseOnlineBattleAction(player, battle, [{ ...transfer, id: "next-transfer" }]);
  assert.equal(action.skillId, "next-transfer");
  assert.equal(action.targetId, fallen.playerId, "a failed earlier transfer must not falsely reserve the target");
});

test("build257 online auto AI skips revival-sealed allies and rescues an eligible target", () => {
  const player = actor();
  const sealed = actor({ playerId: "sealed", ownerPlayerId: "sealed", hp: 0, maxHp: 2_000, effects: [{ kind: "reviveSeal", value: 1, turns: 2 }] });
  const eligible = actor({ playerId: "eligible", ownerPlayerId: "eligible", hp: 0, maxHp: 1_000 });
  const revive = { id: "revive", kind: "revive", revive: .35, mp: 10, cooldown: 3 };
  const action = chooseOnlineBattleAction(player, { players: { owner: player, sealed, eligible }, enemies: [enemy("foe")] }, [revive]);
  assert.equal(action.skillId, revive.id);
  assert.equal(action.targetId, eligible.playerId);

  eligible.effects = [{ kind: "reviveSeal", value: 1, turns: 1 }];
  assert.notEqual(chooseOnlineBattleAction(player, { players: { owner: player, sealed, eligible }, enemies: [enemy("foe")] }, [revive]).skillId, revive.id);
});

test("build257 online auto AI projects a committed composite revive before choosing the next actor", () => {
  const player = actor();
  const healer = actor({ playerId: "healer", ownerPlayerId: "owner" });
  const fallenA = actor({ playerId: "fallen-a", ownerPlayerId: "ally-a", hp: 0, maxHp: 1_500 });
  const fallenB = actor({ playerId: "fallen-b", ownerPlayerId: "ally-b", hp: 0, maxHp: 1_000 });
  const lifeCycle = { id: "life-cycle", kind: "allHeal", allAllies: true, heal: .1, reviveTransferRate: .5, mp: 10, cooldown: 3 };
  healer.skills = [lifeCycle];
  const battle = {
    players: { owner: player, healer, "fallen-a": fallenA, "fallen-b": fallenB },
    enemies: [enemy("foe")],
    actions: { healer: { actorId: "healer", kind: "skill", skillId: "life-cycle", targetId: "fallen-a", auto: true } },
  };
  const action = chooseOnlineBattleAction(player, battle, [lifeCycle]);
  assert.equal(action.skillId, "life-cycle");
  assert.equal(action.targetId, "fallen-b", "the already reserved fallen ally is not selected twice");
});

test("build257 explore resolver applies transfer revival embedded in all-heal", () => {
  const store = new RoomStore({ now: () => 257_000, random: () => .99 });
  store._broadcast = () => {};
  store._broadcastRoom = () => {};
  const lifeCycle = { id: "life-cycle", name: "Life Cycle", kind: "allHeal", allAllies: true, heal: .1, reviveTransferRate: .5, reviveMp: .2, mp: 10, cooldown: 3, effects: [], revivedEffects: [] };
  const player = actor({ skills: [lifeCycle], equipmentCombatEffects: {}, abyssSkillEffects: {}, rewardModifiers: {} });
  const fallen = actor({ playerId: "fallen", ownerPlayerId: "fallen", hp: 0, maxHp: 1_000, mp: 0, skills: [] });
  const foe = enemy("foe", { maxMp: 0, currentMp: 0, cooldowns: {} });
  const battle = { id: "battle", floor: 1, round: 1, phase: "result", speed: 1, players: { owner: player, fallen }, enemies: [foe], actions: {}, lastEvents: [], skillUses: {}, delayedSkillEchoes: [], openingCircleBuff: false };
  const room = { roomId: "ROOM", selectedFloor: 1, expedition: { battle } };
  store.sessions.set("owner", { playerId: "owner", profile: { displayName: "Owner", skills: [lifeCycle] } });

  const events = [];
  store._resolvePlayerAction(room, battle, player, { actorId: "owner", kind: "skill", skillId: "life-cycle", targetId: "fallen" }, events, new Map());
  assert.equal(player.hp, 500);
  assert.equal(fallen.hp, 500);
  assert.equal(fallen.mp, 20);
  assert.equal(events.some(event => event.kind === "revive" && event.targetId === "fallen"), true);
});

test("build257 online auto AI never spends a life on a non-lethal sacrifice", () => {
  const player = actor({ hp: 800 });
  const sacrifice = { id: "sacrifice", kind: "attack", power: 0, hits: 1, mp: 0, selfSacrificeHpDamage: 1.5 };
  const action = chooseOnlineBattleAction(player, { players: { owner: player }, enemies: [enemy("foe", { hp: 5_000, maxHp: 5_000 })] }, [sacrifice]);
  assert.equal(action.kind, "attack");
  assert.equal(action.skillId, undefined);
});

test("build257 online auto AI values defense ignore and zero-power signature damage", () => {
  const player = actor({ hp: 700, maxHp: 1_000, stats: { hp: 1_000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: 100, crit: 0 } });
  const armored = enemy("armored", { hp: 1_000, maxHp: 1_000, def: 10_000, mdef: 10_000 });
  const pierce = { id: "pierce", kind: "attack", power: .9, hits: 1, mp: 5, cooldown: 2, defenseIgnore: .9 };
  const drain = { id: "drain", kind: "attack", power: 0, hits: 1, mp: 5, cooldown: 2, fillHpDrain: 1 };
  const battle = { players: { owner: player }, enemies: [armored] };
  assert.equal(chooseOnlineBattleAction(player, battle, [pierce]).skillId, "pierce");
  armored.hp = 250;
  assert.equal(chooseOnlineBattleAction(player, battle, [drain]).skillId, "drain");
});

test("build257 online auto AI estimates guaranteed critical, execute, post-hit percent damage and the per-hit cap", () => {
  const player = actor({ stats: { hp: 1_000, mp: 100, atk: 100, matk: 100, def: 100, mdef: 100, spd: 100, crit: 0 } });
  const target = enemy("target", { hp: 1_000, maxHp: 1_000, def: 100, mdef: 100 });
  const plain = { id: "plain", kind: "attack", power: 1, hits: 1, mp: 0 };
  const guaranteed = { id: "guaranteed", kind: "attack", power: .8, hits: 1, mp: 0, guaranteedCritical: true };
  assert.equal(chooseOnlineBattleAction(player, { players: { owner: player }, enemies: [target] }, [plain, guaranteed]).skillId, guaranteed.id);

  target.hp = 400;
  const ordinary = { id: "ordinary", kind: "attack", power: .9, hits: 1, mp: 5 };
  const execute = { id: "execute", kind: "attack", power: .65, hits: 1, mp: 5, execute: .5 };
  assert.equal(chooseOnlineBattleAction(player, { players: { owner: player }, enemies: [target] }, [ordinary, execute]).skillId, execute.id);

  target.hp = 1_000;
  const capped = { id: "capped", kind: "attack", power: 4, hits: 1, mp: 90 };
  assert.equal(chooseOnlineBattleAction(player, { players: { owner: player }, enemies: [target] }, [capped]).kind, "attack", "a capped 90% hit is not treated as lethal to bypass MP reserve");

  target.hp = 600;
  const thresholdCombo = { id: "threshold-combo", kind: "attack", power: .8, hits: 3, mp: 90, execute: .5 };
  assert.equal(chooseOnlineBattleAction(player, { players: { owner: player }, enemies: [target] }, [thresholdCombo]).skillId, thresholdCombo.id, "later hits receive execute after an earlier hit crosses the HP threshold");

  const small = enemy("small", { hp: 90, maxHp: 90, def: 0, mdef: 0 });
  const postHit = { id: "post-hit", kind: "attack", power: 2.3, hits: 1, mp: 90, currentHpDamage: .25 };
  assert.equal(chooseOnlineBattleAction(player, { players: { owner: player }, enemies: [small] }, [postHit]).kind, "attack", "current-HP damage is based on HP remaining after the direct hit");
});

test("build257 online auto lethal estimates include active attack, conversion, critical, defense, vulnerable, and guard effects", () => {
  const costly = { id: "costly", kind: "attack", damageClass: "physical", element: "neutral", power: 2, hits: 1, mp: 90 };
  const weakened = actor({
    mp: 100,
    stats: { hp: 1_000, mp: 100, atk: 220, matk: 220, def: 100, mdef: 100, spd: 100, crit: 0 },
    effects: [{ kind: "atkDown", value: .5, turns: 2 }],
  });
  const guarded = enemy("guarded", {
    hp: 700,
    maxHp: 2_000,
    def: 100,
    mdef: 100,
    effects: [{ kind: "defUp", value: .5, turns: 2 }, { kind: "guard", value: .5, turns: 2 }],
  });
  assert.equal(chooseOnlineBattleAction(weakened, { players: { owner: weakened }, enemies: [guarded] }, [costly]).kind, "attack", "a guarded target is not falsely treated as a lethal MP-reserve exception");

  const empowered = actor({
    mp: 100,
    stats: { hp: 1_000, mp: 100, atk: 100, matk: 300, def: 100, mdef: 100, spd: 100, crit: 0 },
    effects: [
      { kind: "atkUp", value: .5, turns: 2 },
      { kind: "magicToPhysical", value: .5, turns: 2 },
      { kind: "guaranteedCritical", value: 0, turns: 2 },
    ],
  });
  const exposed = enemy("exposed", {
    hp: 1_600,
    maxHp: 2_000,
    def: 100,
    mdef: 100,
    effects: [{ kind: "defDown", value: .5, turns: 2 }, { kind: "vulnerable", value: .5, turns: 2 }],
  });
  const finisher = { ...costly, id: "effect-finisher", power: 1.5 };
  assert.equal(chooseOnlineBattleAction(empowered, { players: { owner: empowered }, enemies: [exposed] }, [finisher]).skillId, finisher.id, "active zero-value critical presence and combat modifiers expose the real lethal finisher");
});

test("build257 online auto projection applies healDown to a committed recovery", () => {
  const heal = { id: "heal", name: "Heal", kind: "heal", heal: .4, mp: 5, cooldown: 1, effects: [], revivedEffects: [] };
  const next = actor({ playerId: "next", ownerPlayerId: "next", skills: [heal] });
  const first = actor({ playerId: "first", ownerPlayerId: "first", skills: [heal] });
  const ally = actor({ playerId: "ally", ownerPlayerId: "ally", hp: 100, effects: [{ kind: "healDown", value: .75, turns: 2 }] });
  const battle = {
    players: { next, first, ally },
    enemies: [enemy("foe", { hp: 20_000, maxHp: 20_000 })],
    actions: { first: { actorId: first.playerId, kind: "skill", skillId: heal.id, targetId: ally.playerId, auto: true } },
  };

  const action = chooseOnlineBattleAction(next, battle, [heal]);
  assert.equal(action.skillId, heal.id, "the second healer still sees a critical ally after the first heal is reduced to 25%");
  assert.equal(action.targetId, ally.playerId);
});

test("build257 online auto projection carries all-heal cleanse, effects, and party shield into later decisions", () => {
  const support = {
    id: "all-support",
    name: "All Support",
    kind: "allHeal",
    allAllies: true,
    heal: .1,
    cleanse: true,
    partyShieldRate: .1,
    mp: 0,
    effects: [{ kind: "atkUp", value: .2, turns: 2, allies: true }],
    revivedEffects: [],
  };
  const duplicate = { id: "duplicate", name: "Duplicate", kind: "buff", allAllies: true, partyShieldRate: .1, mp: 0, effects: [{ kind: "atkUp", value: .2, turns: 2, allies: true }], revivedEffects: [] };
  const cleanse = { id: "cleanse", name: "Cleanse", kind: "buff", allAllies: true, cleanse: true, mp: 0, effects: [], revivedEffects: [] };
  const first = actor({ playerId: "first", ownerPlayerId: "first", skills: [support] });
  const next = actor({ playerId: "next", ownerPlayerId: "next", skills: [cleanse, duplicate] });
  const afflicted = actor({ playerId: "afflicted", ownerPlayerId: "afflicted", effects: [{ kind: "atkDown", value: .2, turns: 2 }] });
  const battle = {
    round: 1,
    players: { first, next, afflicted },
    enemies: [enemy("foe", { hp: 20_000, maxHp: 20_000 })],
    actions: { first: { actorId: first.playerId, kind: "skill", skillId: support.id, targetId: afflicted.playerId, auto: true } },
  };

  assert.equal(chooseOnlineBattleAction(next, battle, [cleanse, duplicate]).kind, "attack", "the later actor neither re-cleanses nor duplicates the projected party buff and shield");
});

test("build257 online auto projection prevents duplicate party shields after a committed buff", () => {
  const shield = { id: "party-shield", name: "Party Shield", kind: "buff", partyShieldRate: .1, mp: 0, effects: [], revivedEffects: [] };
  const first = actor({ playerId: "first", ownerPlayerId: "first", skills: [shield] });
  const next = actor({ playerId: "next", ownerPlayerId: "next", skills: [shield] });
  const ally = actor({ playerId: "ally", ownerPlayerId: "ally" });
  const battle = {
    round: 1,
    players: { first, next, ally },
    enemies: [enemy("foe", { hp: 20_000, maxHp: 20_000 })],
    actions: { first: { actorId: first.playerId, kind: "skill", skillId: shield.id, targetId: first.playerId, auto: true } },
  };

  assert.equal(chooseOnlineBattleAction(next, battle, [shield]).kind, "attack");
});

test("build257 online auto projection includes support attached to an earlier attack skill", () => {
  const attackSupport = {
    id: "attack-support",
    name: "Attack Support",
    kind: "attack",
    power: .5,
    hits: 1,
    mp: 0,
    partyShieldRate: .1,
    effects: [{ kind: "atkUp", value: .2, turns: 2, allies: true }],
  };
  const duplicate = { id: "duplicate", name: "Duplicate", kind: "buff", allAllies: true, mp: 0, partyShieldRate: .1, effects: [{ kind: "atkUp", value: .2, turns: 2, allies: true }] };
  const first = actor({ playerId: "first", ownerPlayerId: "first", skills: [attackSupport], stats: { hp: 1_000, mp: 100, atk: 220, matk: 220, def: 100, mdef: 100, spd: 200, crit: 0 } });
  const next = actor({ playerId: "next", ownerPlayerId: "next", skills: [duplicate] });
  const ally = actor({ playerId: "ally", ownerPlayerId: "ally" });
  const foe = enemy("foe", { hp: 20_000, maxHp: 20_000 });
  const battle = {
    round: 1,
    players: { first, next, ally },
    enemies: [foe],
    actions: { first: { actorId: first.playerId, kind: "skill", skillId: attackSupport.id, targetId: foe.id } },
  };
  assert.equal(chooseOnlineBattleAction(next, battle, [duplicate]).kind, "attack", "the later AUTO actor does not duplicate an attack's party effect and shield");
});

test("build257 online auto projection applies an earlier attack self-heal before later recovery decisions", () => {
  const selfHealAttack = { id: "self-heal-attack", kind: "attack", power: .5, hits: 1, mp: 0, selfHeal: .8, effects: [] };
  const heal = { id: "heal", kind: "heal", heal: .65, mp: 0, effects: [] };
  const first = actor({ playerId: "first", ownerPlayerId: "first", hp: 100, skills: [selfHealAttack], stats: { hp: 1_000, mp: 100, atk: 220, matk: 220, def: 100, mdef: 100, spd: 200, crit: 0 } });
  const next = actor({ playerId: "next", ownerPlayerId: "next", skills: [heal] });
  const foe = enemy("foe", { hp: 20_000, maxHp: 20_000 });
  const battle = {
    round: 1,
    players: { first, next },
    enemies: [foe],
    actions: { first: { actorId: first.playerId, kind: "skill", skillId: selfHealAttack.id, targetId: foe.id } },
  };
  assert.notEqual(chooseOnlineBattleAction(next, battle, [heal]).skillId, heal.id);
});

test("build257 online auto projects only committed actors that resolve before the current actor, including the SPD tie-break", () => {
  const revive = id => ({ id, kind: "revive", revive: .35, mp: 0, effects: [] });
  const fastRevive = revive("fast-revive"), slowRevive = revive("slow-revive");
  const fast = actor({ playerId: "fast", ownerPlayerId: "fast", skills: [fastRevive], stats: { hp: 1_000, mp: 100, atk: 220, matk: 220, def: 100, mdef: 100, spd: 200, crit: 0 } });
  const slow = actor({ playerId: "slow", ownerPlayerId: "slow", skills: [slowRevive], stats: { hp: 1_000, mp: 100, atk: 220, matk: 220, def: 100, mdef: 100, spd: 50, crit: 0 } });
  const fallen = actor({ playerId: "fallen", ownerPlayerId: "fallen", hp: 0, maxHp: 1_500 });
  const foe = enemy("foe", { hp: 20_000, maxHp: 20_000 });
  const slowCommit = { actorId: slow.playerId, kind: "skill", skillId: slowRevive.id, targetId: fallen.playerId };
  assert.equal(chooseOnlineBattleAction(fast, { round: 1, players: { fast, slow, fallen }, enemies: [foe], actions: { slow: slowCommit } }, [fastRevive]).skillId, fastRevive.id, "a slower commitment cannot make the faster actor heal a corpse before it is revived");

  const tiedFirst = actor({ playerId: "a-first", ownerPlayerId: "a-first", skills: [slowRevive] });
  const tiedNext = actor({ playerId: "z-next", ownerPlayerId: "z-next", skills: [fastRevive] });
  const tiedFallen = actor({ playerId: "tied-fallen", ownerPlayerId: "tied-fallen", hp: 0, maxHp: 1_500 });
  const tiedBattle = {
    round: 1,
    players: { "a-first": tiedFirst, "z-next": tiedNext, "tied-fallen": tiedFallen },
    enemies: [foe],
    actions: { "a-first": { actorId: tiedFirst.playerId, kind: "skill", skillId: slowRevive.id, targetId: tiedFallen.playerId } },
  };
  assert.notEqual(chooseOnlineBattleAction(tiedNext, tiedBattle, [fastRevive]).skillId, fastRevive.id, "equal-SPD players use the resolver's stable actor-id tie-break");

  const store = new RoomStore({ now: () => 257_000, random: () => .5 });
  const resolved = [];
  store._resolveCoopBossMechanic = () => {};
  store._resolveCoopTechnique = () => null;
  store._resolvePlayerAction = (_room, _battle, player) => resolved.push(player.playerId);
  store._resolveEnemyActions = () => {};
  store._floorBossDomainRoundEnd = () => {};
  store._syncAllExpeditionVitals = () => {};
  store._recordBattleContribution = () => {};
  store._broadcast = () => {};
  store._broadcastRoom = () => {};
  const orderBattle = { ...tiedBattle, phase: "command", actions: { "a-first": { kind: "attack", targetId: foe.id }, "z-next": { kind: "attack", targetId: foe.id } }, enemies: [{ ...foe, spd: 1 }] };
  store._resolveBattleRound({ members: new Set(), expedition: { battle: orderBattle } }, orderBattle);
  assert.deepEqual(resolved, ["a-first", "z-next"]);
});

test("build257 committed item projection ignores the user's heal-power stat", () => {
  const groupHeal = { id: "group-heal", kind: "allHeal", allAllies: true, heal: .5, mp: 0, effects: [] };
  const first = actor({ playerId: "first", ownerPlayerId: "first", equipmentCombatEffects: { healPower: 150 }, stats: { hp: 1_000, mp: 100, atk: 220, matk: 220, def: 100, mdef: 100, spd: 200, crit: 0 } });
  const next = actor({ playerId: "next", ownerPlayerId: "next", skills: [groupHeal] });
  const woundedA = actor({ playerId: "wounded-a", ownerPlayerId: "wounded-a", hp: 10 });
  const woundedB = actor({ playerId: "wounded-b", ownerPlayerId: "wounded-b", hp: 410 });
  const woundedC = actor({ playerId: "wounded-c", ownerPlayerId: "wounded-c", hp: 410 });
  const battle = {
    round: 1,
    players: { first, next, "wounded-a": woundedA, "wounded-b": woundedB, "wounded-c": woundedC },
    enemies: [enemy("foe", { hp: 20_000, maxHp: 20_000 })],
    actions: { first: { actorId: first.playerId, kind: "item", targetId: woundedA.playerId } },
  };
  assert.equal(chooseOnlineBattleAction(next, battle, [groupHeal]).skillId, groupHeal.id, "fixed 40% item healing leaves 410/1000 HP and preserves the needed follow-up group heal");
});

test("build257 online auto AI uses MP recovery and periodic non-duplicate tactics", () => {
  const lowMp = actor({ mp: 30, maxMp: 100 });
  const mpHeal = { id: "mana", kind: "mpHeal", mpHeal: .5, mp: 5, cooldown: 2 };
  const foe = enemy("foe", { hp: 20_000, maxHp: 20_000 });
  assert.equal(chooseOnlineBattleAction(lowMp, { round: 1, players: { owner: lowMp }, enemies: [foe] }, [mpHeal]).skillId, mpHeal.id);

  const player = actor();
  const buff = { id: "focus", kind: "buff", mp: 5, cooldown: 3, effects: [{ kind: "atkUp", value: .3, turns: 3 }] };
  assert.equal(chooseOnlineBattleAction(player, { round: 1, players: { owner: player }, enemies: [foe] }, [buff]).skillId, buff.id);
  assert.equal(chooseOnlineBattleAction(player, { round: 2, players: { owner: player }, enemies: [foe] }, [buff]).kind, "attack", "a tactic is not spammed every round");
  player.effects = [{ kind: "atkUp", value: .3, turns: 2 }];
  assert.equal(chooseOnlineBattleAction(player, { round: 1, players: { owner: player }, enemies: [foe] }, [buff]).kind, "attack", "an active tactic is not duplicated");
});

test("build257 online auto AI prioritizes a dangerous enemy when neither target is immediately killable", () => {
  const player = actor();
  const quiet = enemy("quiet", { hp: 20_000, maxHp: 20_000, atk: 20, matk: 20, spd: 20 });
  const threat = enemy("threat", { hp: 20_000, maxHp: 20_000, atk: 900, matk: 800, spd: 300 });
  const action = chooseOnlineBattleAction(player, { players: { owner: player }, enemies: [quiet, threat] }, []);
  assert.equal(action.kind, "attack");
  assert.equal(action.targetId, "threat");
});

test("build257 explore battle auto toggle fills every owned actor and snapshot exposes exact skill CT", () => {
  let now = 257_000;
  const store = new RoomStore({ now: () => now, random: () => .99 });
  store._broadcastRoom = () => {};
  store._resolveBattleRound = () => {};
  const skill = { id: "burst", name: "Burst", kind: "attack", mp: 8, power: 1.4, hits: 1, cooldown: 3, effects: [], revivedEffects: [], status: null };
  const owner = { playerId: "owner", roomId: "ROOM", connected: true, profile: { displayName: "Owner", skills: [skill] } };
  store.sessions.set(owner.playerId, owner);
  const first = actor({ playerId: "owner", ownerPlayerId: "owner", skills: [skill] });
  const second = actor({ playerId: "owner:m2", ownerPlayerId: "owner", skills: [skill] });
  const other = actor({ playerId: "other", ownerPlayerId: "other", skills: [] });
  const battle = { id: "battle", floor: 1, round: 1, phase: "command", speed: 1, deadlineAt: now + 15_000, players: { owner: first, "owner:m2": second, other }, enemies: [enemy("foe")], actions: {}, autoPlayers: new Set(), lastEvents: [] };
  const room = { roomId: "ROOM", phase: "expedition", expedition: { battle } };
  store.rooms.set(room.roomId, room);

  const secondarySkill = store.submitBattleAction(owner, { actorId: "owner:m2", kind: "skill", skillId: "burst", targetId: "foe" });
  assert.equal(secondarySkill.ok, true, "a secondary roster actor can use its own configured skill");
  assert.equal(battle.actions["owner:m2"].skillId, "burst");
  delete battle.actions["owner:m2"];

  const enabled = store.setBattleAuto(owner, { mode: "explore", enabled: true });
  assert.equal(enabled.ok, true);
  assert.deepEqual(Object.keys(battle.actions).sort(), ["owner", "owner:m2"]);
  assert.deepEqual(enabled.battle.autoPlayers, ["owner"]);
  assert.equal(enabled.battle.players.find(value => value.playerId === "owner:m2").skills[0].cooldown, 3);

  const disabled = store.setBattleAuto(owner, { mode: "explore", enabled: false });
  assert.equal(disabled.ok, true);
  assert.deepEqual(battle.actions, {});
  assert.deepEqual(disabled.battle.autoPlayers, []);
});

test("build257 explore injects AUTO actions in actual SPD order so later actors can project earlier revival", () => {
  const store = new RoomStore({ now: () => 257_000, random: () => .99 });
  store._broadcastRoom = () => {};
  const revive = { id: "revive", name: "Revive", kind: "revive", revive: .35, mp: 0, cooldown: 2, effects: [], revivedEffects: [] };
  const slow = actor({ skills: [revive], stats: { hp: 1_000, mp: 100, atk: 220, matk: 220, def: 100, mdef: 100, spd: 50, crit: 0 } });
  const fast = actor({ playerId: "owner:fast", ownerPlayerId: "owner", skills: [revive], stats: { hp: 1_000, mp: 100, atk: 220, matk: 220, def: 100, mdef: 100, spd: 200, crit: 0 } });
  const fallen = actor({ playerId: "fallen", ownerPlayerId: "fallen", hp: 0, maxHp: 1_500 });
  const other = actor({ playerId: "other", ownerPlayerId: "other" });
  const battle = { id: "battle", floor: 1, round: 1, phase: "command", speed: 1, deadlineAt: 272_000, players: { owner: slow, "owner:fast": fast, fallen, other }, enemies: [enemy("foe")], actions: {}, autoPlayers: new Set(), lastEvents: [] };
  const room = { roomId: "ROOM", phase: "expedition", expedition: { battle } };
  const session = { playerId: "owner", roomId: room.roomId, connected: true, profile: { displayName: "Owner", skills: [revive] } };
  store.rooms.set(room.roomId, room);
  store.sessions.set(session.playerId, session);

  assert.equal(store.setBattleAuto(session, { mode: "explore", enabled: true }).ok, true);
  assert.equal(battle.actions[fast.playerId].skillId, revive.id, "the faster actor reserves the revival it will actually perform first");
  assert.notEqual(battle.actions[slow.playerId].skillId, revive.id, "the slower actor projects the faster actor's committed revival");
});

test("build257 player skill CT lasts the advertised number of following command rounds", () => {
  const store = new RoomStore({ now: () => 257_000, random: () => .99 });
  store._broadcast = () => {};
  store._broadcastRoom = () => {};
  const skill = { id: "burst", name: "Burst", kind: "attack", mp: 8, power: 1.1, hits: 1, cooldown: 3, damageClass: "physical", element: "neutral", effects: [] };
  const player = actor({ skills: [skill], equipmentCombatEffects: {}, abyssSkillEffects: {}, rewardModifiers: {} });
  const foe = enemy("foe", { hp: 1_000_000_000, maxHp: 1_000_000_000, maxMp: 0, currentMp: 0, cooldowns: {} });
  const battle = { id: "battle", floor: 1, round: 1, phase: "result", speed: 1, players: { owner: player }, enemies: [foe], actions: {}, lastEvents: [], skillUses: {}, delayedSkillEchoes: [], openingCircleBuff: false };
  const room = { roomId: "ROOM", expedition: { battle } };
  store.sessions.set("owner", { playerId: "owner", profile: { displayName: "Owner", skills: [skill] } });

  store._resolvePlayerAction(room, battle, player, { actorId: "owner", kind: "skill", skillId: "burst", targetId: "foe" }, [], new Map([["foe", 1]]));
  assert.equal(player.cooldowns.burst, 4, "internal +1 survives the current round-end tick");
  store._openNextBattleRound(room, battle);
  assert.equal(player.cooldowns.burst, 3, "the next command round displays the advertised base CT");
});

test("build257 explore composite revival respects the selected ally and includes the revived ally in party effects", () => {
  const store = new RoomStore({ now: () => 257_000, random: () => .99 });
  store._broadcast = () => {};
  store._broadcastRoom = () => {};
  const genesis = {
    id: "genesis",
    name: "Genesis",
    kind: "allHeal",
    allAllies: true,
    heal: .1,
    reviveTransferRate: .5,
    reviveMp: .2,
    cleanse: true,
    partyShieldRate: .1,
    mp: 10,
    cooldown: 3,
    effects: [{ kind: "atkUp", value: .2, turns: 2, allies: true, chance: 1 }],
    revivedEffects: [],
  };
  const player = actor({ hp: 1, skills: [genesis], equipmentCombatEffects: {}, abyssSkillEffects: {}, rewardModifiers: {} });
  const larger = actor({ playerId: "larger", ownerPlayerId: "larger", hp: 0, maxHp: 2_000, mp: 0, skills: [] });
  const selected = actor({
    playerId: "selected",
    ownerPlayerId: "selected",
    hp: 0,
    maxHp: 1_000,
    mp: 0,
    skills: [],
    effects: [{ kind: "atkDown", value: .3, turns: 2 }],
  });
  const foe = enemy("foe", { maxMp: 0, currentMp: 0, cooldowns: {} });
  const battle = { id: "battle", floor: 1, round: 1, phase: "result", speed: 1, players: { owner: player, larger, selected }, enemies: [foe], actions: {}, lastEvents: [], skillUses: {}, delayedSkillEchoes: [], openingCircleBuff: false };
  const room = { roomId: "ROOM", expedition: { battle } };
  store.sessions.set("owner", { playerId: "owner", profile: { displayName: "Owner", skills: [genesis] } });

  const events = [];
  store._resolvePlayerAction(room, battle, player, { actorId: "owner", kind: "skill", skillId: genesis.id, targetId: selected.playerId }, events, new Map());

  assert.equal(larger.hp, 0, "the larger fallback corpse is not revived over the explicitly selected ally");
  assert.equal(player.hp, 51, "the transfer is calculated after the composite party heal raises 1 HP to 101");
  assert.equal(selected.hp, 50);
  assert.equal(selected.mp, 20);
  assert.equal(selected.effects.some(effect => effect.kind === "atkDown"), false, "the revived ally is cleansed");
  assert.equal(selected.effects.some(effect => effect.kind === "atkUp"), true, "the revived ally receives subsequent party effects");
  assert.equal(selected.shield, 100, "the revived ally receives the party shield");
  assert.equal(events.some(event => event.kind === "revive" && event.targetId === selected.playerId), true);
});

test("build257 explore pure transfer revival cannot create HP from a 1 HP caster and refunds MP and CT", () => {
  const store = new RoomStore({ now: () => 257_000, random: () => .99 });
  store._broadcast = () => {};
  store._broadcastRoom = () => {};
  const revive = { id: "transfer-revive", name: "Transfer Revive", kind: "revive", reviveTransferRate: .5, reviveMp: .2, mp: 15, cooldown: 3, effects: [], revivedEffects: [] };
  const player = actor({ hp: 1, skills: [revive], equipmentCombatEffects: {}, abyssSkillEffects: {}, rewardModifiers: {} });
  const fallen = actor({ playerId: "fallen", ownerPlayerId: "fallen", hp: 0, mp: 0, skills: [] });
  const foe = enemy("foe", { maxMp: 0, currentMp: 0, cooldowns: {} });
  const battle = { id: "battle", floor: 1, round: 1, phase: "result", speed: 1, players: { owner: player, fallen }, enemies: [foe], actions: {}, lastEvents: [], skillUses: {}, delayedSkillEchoes: [], openingCircleBuff: false };
  const room = { roomId: "ROOM", expedition: { battle } };
  store.sessions.set("owner", { playerId: "owner", profile: { displayName: "Owner", skills: [revive] } });

  assert.notEqual(chooseOnlineBattleAction(player, battle, [revive]).skillId, revive.id, "auto battle does not choose an unfundable HP transfer");
  const events = [];
  store._resolvePlayerAction(room, battle, player, { actorId: "owner", kind: "skill", skillId: revive.id, targetId: fallen.playerId }, events, new Map());

  assert.equal(player.hp, 1);
  assert.equal(player.mp, 100, "failed pure revival refunds its MP");
  assert.equal(player.cooldowns[revive.id], undefined, "failed pure revival clears its CT");
  assert.equal(fallen.hp, 0, "no transferred HP is synthesized");
  assert.equal(events.some(event => event.kind === "reviveFail"), true);
});

test("build257 online auto AI does not reserve a corpse for an unfundable committed transfer revival", () => {
  const player = actor();
  const healer = actor({ playerId: "healer", ownerPlayerId: "owner", hp: 1 });
  const fallenA = actor({ playerId: "fallen-a", ownerPlayerId: "ally-a", hp: 0, maxHp: 1_500 });
  const fallenB = actor({ playerId: "fallen-b", ownerPlayerId: "ally-b", hp: 0, maxHp: 1_000 });
  const transfer = { id: "transfer", kind: "revive", reviveTransferRate: .5, mp: 10, cooldown: 3 };
  const revive = { id: "revive", kind: "revive", revive: .35, mp: 10, cooldown: 3 };
  healer.skills = [transfer];
  const battle = {
    players: { owner: player, healer, "fallen-a": fallenA, "fallen-b": fallenB },
    enemies: [enemy("foe")],
    actions: { healer: { actorId: "healer", kind: "skill", skillId: transfer.id, targetId: fallenA.playerId, auto: true } },
  };

  const action = chooseOnlineBattleAction(player, battle, [revive]);
  assert.equal(action.skillId, revive.id);
  assert.equal(action.targetId, fallenA.playerId, "the failed commitment does not hide the highest-HP corpse from the next healer");
});

test("build257 explore public action submission accepts a fallen target only for composite recovery revival", () => {
  const store = new RoomStore({ now: () => 257_000, random: () => .99 });
  store._broadcastRoom = () => {};
  store._allBattleActionsReady = () => false;
  const composite = { id: "composite", name: "Composite", kind: "allHeal", allAllies: true, heal: .1, revive: .25, mp: 10, cooldown: 3, effects: [], revivedEffects: [] };
  const pureHeal = { id: "pure-heal", name: "Pure Heal", kind: "heal", heal: .4, mp: 5, cooldown: 1, effects: [], revivedEffects: [] };
  const buff = { id: "buff", name: "Buff", kind: "buff", mp: 5, cooldown: 1, effects: [{ kind: "atkUp", value: .2, turns: 2 }], revivedEffects: [] };
  const player = actor({ skills: [composite, pureHeal, buff] });
  const fallen = actor({ playerId: "fallen", ownerPlayerId: "fallen", hp: 0 });
  const battle = { id: "battle", floor: 1, round: 1, phase: "command", speed: 1, players: { owner: player, fallen }, enemies: [enemy("foe")], actions: {}, autoPlayers: new Set(), lastEvents: [], skillUses: {}, delayedSkillEchoes: [], openingCircleBuff: false };
  const room = { roomId: "ROOM", expedition: { battle } };
  const session = { playerId: "owner", roomId: room.roomId, profile: { displayName: "Owner", skills: [composite, pureHeal, buff] } };
  store.rooms.set(room.roomId, room);
  store.sessions.set(session.playerId, session);

  const accepted = store.submitBattleAction(session, { actorId: player.playerId, kind: "skill", skillId: composite.id, targetId: fallen.playerId });
  assert.equal(accepted.ok, true);
  assert.equal(battle.actions[player.playerId].targetId, fallen.playerId);

  delete battle.actions[player.playerId];
  assert.equal(store.submitBattleAction(session, { actorId: player.playerId, kind: "skill", skillId: pureHeal.id, targetId: fallen.playerId }).code, "TARGET_DOWN");
  assert.equal(store.submitBattleAction(session, { actorId: player.playerId, kind: "skill", skillId: buff.id, targetId: fallen.playerId }).code, "TARGET_DOWN");
});

test("build257 explore selfCost effects are resistance-bypassing self debuffs, not 95% HP costs", () => {
  const store = new RoomStore({ now: () => 257_000, random: () => .99 });
  store._broadcast = () => {};
  store._broadcastRoom = () => {};
  const stance = {
    id: "self-cost-stance",
    name: "Self Cost Stance",
    kind: "buff",
    mp: 0,
    cooldown: 0,
    effects: [
      { kind: "spdDown", value: .2, turns: 3, selfCost: true },
      { kind: "stun", statusId: "stun", value: 0, turns: 1, chance: 1, selfCost: true },
    ],
    revivedEffects: [],
  };
  const player = actor({ skills: [stance], equipmentCombatEffects: { statusResistance: 95 }, abyssSkillEffects: {}, rewardModifiers: {} });
  const foe = enemy("foe", { maxMp: 0, currentMp: 0, cooldowns: {} });
  const battle = { id: "battle", floor: 1, round: 1, phase: "result", speed: 1, players: { owner: player }, enemies: [foe], actions: {}, lastEvents: [], skillUses: {}, delayedSkillEchoes: [], openingCircleBuff: false };
  const room = { roomId: "ROOM", expedition: { battle } };
  store.sessions.set("owner", { playerId: "owner", profile: { displayName: "Owner", skills: [stance] } });

  const events = [];
  store._resolvePlayerAction(room, battle, player, { actorId: "owner", kind: "skill", skillId: stance.id, targetId: player.playerId }, events, new Map());

  assert.equal(player.hp, player.maxHp);
  assert.equal(player.effects.some(effect => effect.kind === "spdDown"), true);
  assert.equal(player.effects.some(effect => effect.kind === "stun"), true, "selfCost bypasses the caster's 95% status resistance");
  assert.equal(events.some(event => event.kind === "cost"), false);
});

test("build257 explore buff party shield covers every living ally even when the buff target is single", () => {
  const store = new RoomStore({ now: () => 257_000, random: () => .99 });
  store._broadcast = () => {};
  store._broadcastRoom = () => {};
  const stance = { id: "aegis-stance", name: "Aegis Stance", kind: "buff", partyShieldRate: .1, mp: 0, cooldown: 0, effects: [], revivedEffects: [] };
  const player = actor({ skills: [stance], equipmentCombatEffects: {}, abyssSkillEffects: {}, rewardModifiers: {} });
  const ally = actor({ playerId: "ally", ownerPlayerId: "ally", maxHp: 1_500, hp: 1_500 });
  const down = actor({ playerId: "down", ownerPlayerId: "down", maxHp: 2_000, hp: 0 });
  const foe = enemy("foe", { maxMp: 0, currentMp: 0, cooldowns: {} });
  const battle = { id: "battle", floor: 1, round: 1, phase: "result", speed: 1, players: { owner: player, ally, down }, enemies: [foe], actions: {}, lastEvents: [], skillUses: {}, delayedSkillEchoes: [], openingCircleBuff: false };
  const room = { roomId: "ROOM", expedition: { battle } };
  store.sessions.set("owner", { playerId: "owner", profile: { displayName: "Owner", skills: [stance] } });

  const events = [];
  store._resolvePlayerAction(room, battle, player, { actorId: "owner", kind: "skill", skillId: stance.id, targetId: ally.playerId }, events, new Map());

  assert.equal(player.shield, 100);
  assert.equal(ally.shield, 150);
  assert.equal(down.shield, undefined);
  assert.deepEqual(events.filter(event => event.kind === "shield").map(event => event.targetId).sort(), ["ally", "owner"]);
});

test("build257 explore AOE applies per-target effects but executes party and enemy utilities only once", () => {
  const store = new RoomStore({ now: () => 257_000, random: () => .99 });
  store._broadcast = () => {};
  store._broadcastRoom = () => {};
  const skill = {
    id: "aoe-utility",
    name: "AOE Utility",
    kind: "attack",
    allEnemies: true,
    power: .2,
    hits: 1,
    mp: 0,
    cooldown: 0,
    guaranteedHit: true,
    guaranteedCritical: true,
    element: "neutral",
    damageClass: "physical",
    partyShieldRate: .1,
    increaseEnemyCooldowns: 2,
    increaseAllyCooldowns: 3,
    reducePartyCooldowns: 1,
    dispelEnemyBuff: true,
    removeEnemyMagicCircle: true,
    effects: [
      { kind: "defDown", value: .2, turns: 2, enemy: true, chance: 1 },
      { kind: "atkUp", value: .2, turns: 2, allies: true, chance: 1 },
    ],
    status: { id: "stun", name: "Stun", chance: 1, turns: 1, power: 0 },
    revivedEffects: [],
  };
  const player = actor({ skills: [skill], cooldowns: { old: 5 }, equipmentCombatEffects: {}, abyssSkillEffects: {}, rewardModifiers: {} });
  const ally = actor({ playerId: "ally", ownerPlayerId: "ally", cooldowns: { old: 5 } });
  const foes = [
    enemy("foe-a", { hp: 1_000_000, maxHp: 1_000_000, cooldowns: { special: 1 }, effects: [{ kind: "atkUp", value: .2, turns: 2 }], circleEffect: "slot" }),
    enemy("foe-b", { hp: 1_000_000, maxHp: 1_000_000, cooldowns: { special: 1 }, effects: [{ kind: "atkUp", value: .2, turns: 2 }], circleEffect: "slot" }),
  ];
  const battle = { id: "battle", floor: 1, round: 1, phase: "result", speed: 1, players: { owner: player, ally }, enemies: foes, actions: {}, lastEvents: [], skillUses: {}, delayedSkillEchoes: [], openingCircleBuff: false };
  const room = { roomId: "ROOM", expedition: { battle } };
  store.sessions.set("owner", { playerId: "owner", profile: { displayName: "Owner", skills: [skill] } });

  const events = [];
  store._resolvePlayerAction(room, battle, player, { actorId: "owner", kind: "skill", skillId: skill.id, targetId: foes[0].id }, events, new Map([[foes[0].id, 1]]));

  assert.equal(player.cooldowns.old, 4, "party CT is reduced once and is not extended by player-side increaseAllyCooldowns");
  assert.equal(ally.cooldowns.old, 4);
  assert.deepEqual(foes.map(target => target.cooldowns.special), [3, 3]);
  assert.equal(foes.filter(target => target.effects.some(effect => effect.kind === "atkUp")).length, 1, "one enemy buff total is dispelled");
  assert.equal(foes.filter(target => target.circleEffect === "none").length, 1, "one enemy circle total is removed");
  for (const target of foes) {
    assert.equal(target.effects.some(effect => effect.kind === "defDown"), true);
    assert.equal(target.effects.some(effect => effect.kind === "status:stun" && effect.value === 0), true);
  }
  assert.equal(player.effects.some(effect => effect.kind === "atkUp"), true);
  assert.equal(ally.effects.some(effect => effect.kind === "atkUp"), true);
  assert.equal(events.filter(event => event.kind === "shield").length, 2, "the party shield is emitted once per living ally");
});

test("build257 explore random skills use the standard eight-element pool", () => {
  const resolvedDamage = skill => {
    const store = new RoomStore({ now: () => 257_000, random: () => .999 });
    store._broadcast = () => {};
    store._broadcastRoom = () => {};
    const player = actor({ skills: [skill], equipmentCombatEffects: {}, abyssSkillEffects: {}, rewardModifiers: {} });
    const target = enemy("target", { hp: 1_000_000, maxHp: 1_000_000, element: "light", maxMp: 0, currentMp: 0, cooldowns: {} });
    const battle = { id: "battle", floor: 1, round: 1, phase: "result", speed: 1, players: { owner: player }, enemies: [target], actions: {}, lastEvents: [], skillUses: {}, delayedSkillEchoes: [], openingCircleBuff: false };
    const room = { roomId: "ROOM", expedition: { battle } };
    store.sessions.set("owner", { playerId: "owner", profile: { displayName: "Owner", skills: [skill] } });
    const events = [];
    store._resolvePlayerAction(room, battle, player, { actorId: "owner", kind: "skill", skillId: skill.id, targetId: target.id }, events, new Map([[target.id, 1]]));
    return events.find(event => event.kind === "damage")?.value;
  };
  const common = { name: "Element Test", kind: "attack", power: 1, hits: 1, mp: 0, cooldown: 0, guaranteedHit: true, guaranteedCritical: true, damageClass: "physical", effects: [], revivedEffects: [] };

  const randomDamage = resolvedDamage({ ...common, id: "random", randomElement: true, element: "neutral" });
  const darkDamage = resolvedDamage({ ...common, id: "dark", element: "dark" });
  assert.equal(randomDamage, darkDamage, "a maximum RNG roll selects dark, the eighth and final standard element");
});

test("build257 explore zero-power hard control survives a faster target's completed action, blocks its next action, and deals no DOT", () => {
  const store = new RoomStore({ now: () => 257_000, random: () => .5 });
  store._broadcast = () => {};
  store._broadcastRoom = () => {};
  const stun = { id: "zero-stun", name: "Zero Stun", kind: "attack", power: .01, hits: 1, mp: 0, cooldown: 0, guaranteedHit: true, guaranteedCritical: true, element: "neutral", damageClass: "physical", status: { id: "stun", name: "Stun", chance: 1, turns: 1, power: 0 }, effects: [], revivedEffects: [] };
  const player = actor({ skills: [stun], stats: { hp: 1_000, mp: 100, atk: 220, matk: 220, def: 100, mdef: 100, spd: 100, crit: 0 }, equipmentCombatEffects: {}, abyssSkillEffects: {}, rewardModifiers: {} });
  const foe = enemy("fast-foe", { name: "Fast Foe", hp: 1_000_000, maxHp: 1_000_000, spd: 300, crit: 0, maxMp: 0, currentMp: 0, cooldowns: {}, actionUses: {}, battleActions: [] });
  const battle = { id: "battle", floor: 1, round: 1, phase: "result", speed: 1, players: { owner: player }, enemies: [foe], actions: {}, lastEvents: [], skillUses: {}, delayedSkillEchoes: [], openingCircleBuff: false };
  const room = { roomId: "ROOM", expedition: { battle } };
  store.sessions.set("owner", { playerId: "owner", profile: { displayName: "Owner", skills: [stun] } });

  store._resolveEnemyActions(battle, [], foe);
  const hpAfterFastAction = player.hp;
  assert.ok(hpAfterFastAction < player.maxHp, "the faster enemy already acted before the slower controller");

  const firstRoundEvents = [];
  store._resolvePlayerAction(room, battle, player, { actorId: "owner", kind: "skill", skillId: stun.id, targetId: foe.id }, firstRoundEvents, new Map([[foe.id, 1]]));
  const hpAfterDirectHit = foe.hp;
  assert.equal(foe.effects.some(effect => effect.kind === "status:stun" && effect.value === 0 && effect.turns === 1), true);

  store._openNextBattleRound(room, battle);
  assert.equal(foe.hp, hpAfterDirectHit, "zero-value control does not manufacture one point of DOT");
  assert.equal(foe.effects.some(effect => effect.kind === "status:stun" && effect.turns === 1), true, "control applied after the target acted survives round end");

  const nextRoundEvents = [];
  store._resolveEnemyActions(battle, nextRoundEvents, foe);
  assert.equal(nextRoundEvents.some(event => event.kind === "statusBlock" && event.targetId === foe.id), true);
  assert.equal(player.hp, hpAfterFastAction, "the target's next action opportunity is blocked");

  battle.phase = "result";
  store._openNextBattleRound(room, battle);
  assert.equal(foe.effects.some(effect => effect.kind === "status:stun"), false, "one-turn control expires after consuming an action opportunity");
});
