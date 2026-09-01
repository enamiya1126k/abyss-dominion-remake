import test from "node:test";
import assert from "node:assert/strict";

import { RaidCoordinator, chooseRaidAutoAction } from "../src/RaidCoordinator.js";

function player(id, overrides = {}) {
  return {
    playerId: id,
    ownerPlayerId: id,
    monsterName: id,
    hp: 1_000,
    maxHp: 1_000,
    mp: 100,
    maxMp: 100,
    itemCharges: 1,
    attribute: "neutral",
    stats: { hp: 1_000, mp: 100, atk: 200, matk: 200, def: 100, mdef: 100, spd: 100, crit: 0, accuracy: 120, evasion: 0 },
    skills: [],
    cooldowns: {},
    effects: [],
    circleEffect: "none",
    circleLevel: 0,
    signatureResonance: null,
    signatureExtraRound: 0,
    ...overrides,
  };
}

function enemy(id, overrides = {}) {
  return {
    id,
    name: id,
    hp: 10_000,
    maxHp: 10_000,
    atk: 200,
    matk: 200,
    def: 50,
    mdef: 40,
    spd: 100,
    accuracy: 100,
    evasion: 0,
    element: "ice",
    effects: [],
    ...overrides,
  };
}

function raidFor(players, overrides = {}) {
  const boss = enemy("boss", { boss: true, raidMainBoss: true });
  return {
    round: 1,
    players: Object.fromEntries(players.map(entry => [entry.playerId, entry])),
    actions: {},
    boss,
    minions: [],
    minionsDefeated: 0,
    modifier: { healing: 1, playerDamage: 1 },
    progress: { maxHp: boss.maxHp, hp: boss.hp, totalDamage: 0, milestonesClaimed: [], campaignId: "test" },
    contribution: Object.fromEntries(players.map(entry => [entry.ownerPlayerId, { damage: 0, taken: 0, healing: 0, mpHealing: 0, revives: 0, guards: 0, support: 0 }])),
    ...overrides,
  };
}

function coordinatorFor(players) {
  const sessions = new Map(players.map(entry => [entry.ownerPlayerId, { playerId: entry.ownerPlayerId, profile: { displayName: entry.ownerPlayerId } }]));
  return new RaidCoordinator({ now: () => 257_000, random: () => .5, sessions, broadcast: () => {}, queueReward: () => {} });
}

test("build257 raid AUTO falls back to an item when an available heal is not worth casting", () => {
  const healer = player("healer", { skills: [{ id: "thin-group-heal", kind: "allHeal", allAllies: true, heal: .1, mp: 10, cooldown: 1 }] });
  const critical = player("critical", { hp: 100 });
  const raid = raidFor([healer, critical]);
  const action = chooseRaidAutoAction(raid, healer, 1);
  assert.equal(action.kind, "item");
  assert.equal(action.targetId, critical.playerId);
});

test("build257 raid AUTO does not reserve the same recovery target twice", () => {
  const healer = player("healer", { skills: [{ id: "single-heal", kind: "heal", heal: .3, mp: 10, cooldown: 1 }] });
  const earlier = player("earlier");
  const first = player("first", { hp: 100 });
  const second = player("second", { hp: 150 });
  const raid = raidFor([healer, earlier, first, second], { actions: { earlier: { actorId: earlier.playerId, kind: "item", targetId: first.playerId } } });
  const action = chooseRaidAutoAction(raid, healer, 1);
  assert.equal(action.kind, "skill");
  assert.equal(action.skillId, "single-heal");
  assert.equal(action.targetId, second.playerId);
});

test("build257 raid AUTO projects committed group healing and permits necessary follow-up recovery", () => {
  const groupHeal = { id: "group-heal", kind: "allHeal", allAllies: true, heal: .25, mp: 10, cooldown: 1 };
  const earlier = player("earlier", { skills: [groupHeal] });
  const healer = player("healer", { itemCharges: 0, skills: [groupHeal] });
  const critical = player("critical", { hp: 10 });
  const raid = raidFor([earlier, healer, critical], { actions: { earlier: { actorId: earlier.playerId, kind: "skill", skillId: groupHeal.id, targetId: critical.playerId } } });

  const action = chooseRaidAutoAction(raid, healer, 1);
  assert.equal(action.kind, "skill", "the first 25% heal only projects the ally from 1% to 26%, so another recovery remains valid");
  assert.equal(action.skillId, groupHeal.id);

  earlier.skills = [{ ...groupHeal, id: "full-heal", heal: 1 }];
  raid.actions.earlier.skillId = "full-heal";
  assert.notEqual(chooseRaidAutoAction(raid, healer, 1).skillId, groupHeal.id, "a projected full recovery prevents true zero-value duplication");
});

test("build257 raid AUTO reserves the fallen ally revived by a committed composite heal", () => {
  const composite = { id: "composite", kind: "allHeal", allAllies: true, heal: .25, revive: .25, mp: 10 };
  const revive = { id: "revive", kind: "revive", revive: .35, mp: 10 };
  const earlier = player("earlier", { skills: [composite] });
  const healer = player("healer", { skills: [revive] });
  const first = player("first", { hp: 0 });
  const second = player("second", { hp: 0 });
  const raid = raidFor([earlier, healer, first, second], { actions: { earlier: { actorId: earlier.playerId, kind: "skill", skillId: composite.id, targetId: earlier.playerId } } });

  const action = chooseRaidAutoAction(raid, healer, 1);
  assert.equal(action.skillId, revive.id);
  assert.equal(action.targetId, second.playerId, "the composite heal already owns the first fallen target for this round");
});

test("build257 raid AUTO can choose an uncommitted composite heal as its revive action", () => {
  const composite = { id: "composite", kind: "allHeal", allAllies: true, heal: .25, reviveTransferRate: .5, mp: 10 };
  const healer = player("healer", { skills: [composite] });
  const fallen = player("fallen", { hp: 0 });
  const raid = raidFor([healer, fallen]);

  const action = chooseRaidAutoAction(raid, healer, 1);
  assert.equal(action.kind, "skill");
  assert.equal(action.skillId, composite.id);
  assert.equal(action.targetId, fallen.playerId);
});

test("build257 raid resolver matches AUTO scoring for area, hybrid, element, effects, and status", () => {
  const skill = {
    id: "hybrid-area",
    name: "Hybrid Area",
    kind: "attack",
    mp: 10,
    power: 1,
    hits: 1,
    allEnemies: true,
    damageClass: "hybrid",
    element: "fire",
    defenseIgnore: .5,
    guaranteedHit: true,
    effects: [{ kind: "atkDown", value: .2, turns: 2, enemy: true }],
    status: { id: "burn", name: "Burn", chance: 1, power: .05, turns: 2 },
  };
  const actor = player("owner", { stats: { hp: 1_000, mp: 100, atk: 100, matk: 400, def: 100, mdef: 100, spd: 100, crit: 0, accuracy: 120, evasion: 0 }, skills: [skill] });
  const raid = raidFor([actor]);
  const minion = enemy("minion");
  raid.minions = [minion];
  const coordinator = coordinatorFor([actor]), events = [];
  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: skill.id, targetId: actor.playerId, enemyTargetId: raid.boss.id }, coordinator.sessions.get(actor.ownerPlayerId), events);

  assert.equal(10_000 - raid.boss.hp, 370, "hybrid MATK, fire advantage, defense ignore, and the 75% area modifier all affect real damage");
  assert.equal(10_000 - minion.hp, 370, "allEnemies damages every living raid enemy");
  assert.equal(raid.progress.totalDamage, 370, "persistent raid HP counts only boss damage");
  assert.equal(raid.contribution.owner.damage, 740, "contribution includes boss and minion damage");
  for (const target of [raid.boss, minion]) {
    assert.equal(target.effects.some(effect => effect.kind === "atkDown"), true);
    assert.equal(target.effects.some(effect => effect.kind === "status:burn"), true);
  }
});

test("build257 raid resolver applies revive effects and cleanses support targets", () => {
  const revive = { id: "revive", name: "Revive", kind: "revive", mp: 10, revive: .1, heal: .9, reviveMp: .2, cleanse: true, revivedEffects: [{ kind: "regen", value: .1, turns: 3 }, { kind: "guard", value: .2, turns: 2 }] };
  const splitRevive = { id: "split-revive", name: "Split Revive", kind: "revive", mp: 10, revive: .9, reviveTransferRate: .5, reviveMp: .2 };
  const purify = { id: "purify", name: "Purify", kind: "buff", mp: 5, allAllies: true, cleanse: true, effects: [{ kind: "defUp", value: .2, turns: 2, allies: true }] };
  const actor = player("owner", { skills: [revive, splitRevive, purify], effects: [{ kind: "spdDown", value: .2, turns: 2 }] });
  const fallen = player("fallen", { hp: 0, mp: 80, effects: [{ kind: "atkDown", value: .2, turns: 2 }, { kind: "status:poison", value: .05, turns: 2 }] });
  const raid = raidFor([actor, fallen]), coordinator = coordinatorFor([actor, fallen]), events = [];

  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: revive.id, targetId: fallen.playerId }, coordinator.sessions.get(actor.ownerPlayerId), events);
  assert.equal(fallen.hp, 100, "skill.revive takes priority over an unrelated heal rate");
  assert.equal(fallen.mp, 20, "reviveMp sets the post-revive fraction instead of adding to retained KO MP");
  assert.deepEqual(fallen.effects.map(effect => effect.kind).sort(), ["guard", "regen"]);

  fallen.hp = 0;
  fallen.mp = 0;
  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: splitRevive.id, targetId: fallen.playerId }, coordinator.sessions.get(actor.ownerPlayerId), events);
  assert.equal(actor.hp, 500, "transfer revival never spends the caster's final HP");
  assert.equal(fallen.hp, 500);
  assert.equal(fallen.mp, 20, "reviveMp is retained with transfer revival");

  fallen.effects.push({ kind: "accuracyDown", value: .2, turns: 2 });
  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: purify.id, targetId: actor.playerId }, coordinator.sessions.get(actor.ownerPlayerId), events);
  assert.equal(actor.effects.some(effect => effect.kind === "spdDown"), false);
  assert.equal(fallen.effects.some(effect => effect.kind === "accuracyDown"), false);
  assert.equal(actor.effects.some(effect => effect.kind === "defUp"), true);
  assert.equal(fallen.effects.some(effect => effect.kind === "defUp"), true);
});

test("build257 raid resolver executes composite all-heal revival", () => {
  const lifeCycle = { id: "life-cycle", name: "Life Cycle", kind: "allHeal", allAllies: true, mp: 10, heal: .1, revive: .01, reviveTransferRate: .5, reviveMp: .2 };
  const actor = player("owner", { hp: 400, skills: [lifeCycle] });
  const fallen = player("fallen", { hp: 0, mp: 0 });
  const raid = raidFor([actor, fallen]), coordinator = coordinatorFor([actor, fallen]), events = [];

  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: lifeCycle.id, targetId: actor.playerId }, coordinator.sessions.get(actor.ownerPlayerId), events);
  assert.equal(actor.hp, 260, "the living-party heal resolves before sharing half of the caster's current HP");
  assert.equal(fallen.hp, 260);
  assert.equal(fallen.mp, 20);
  assert.equal(raid.contribution.owner.revives, 1);
});

test("build257 raid AUTO and resolver preserve power-zero drain and sacrifice semantics", () => {
  const drain = { id: "fill-drain", name: "Fill Drain", kind: "attack", mp: 0, power: 0, hits: 1, fillHpDrain: 1 };
  const drainer = player("drainer", { hp: 400, skills: [drain] });
  const drainRaid = raidFor([drainer]), drainCoordinator = coordinatorFor([drainer]), drainEvents = [];
  assert.equal(chooseRaidAutoAction(drainRaid, drainer, 1).skillId, drain.id);
  drainCoordinator._resolvePlayer({ selectedFloor: 1 }, drainRaid, drainer, { kind: "skill", skillId: drain.id, targetId: drainer.playerId, enemyTargetId: drainRaid.boss.id }, drainCoordinator.sessions.get(drainer.ownerPlayerId), drainEvents);
  assert.equal(drainer.hp, 1_000);
  assert.equal(drainRaid.boss.hp, 9_400);
  assert.equal(drainRaid.contribution.drainer.healing, 600);

  const sacrifice = { id: "sacrifice", name: "Sacrifice", kind: "attack", mp: 0, power: 0, hits: 1, selfSacrificeHpDamage: 1.5 };
  const martyr = player("martyr", { hp: 800, skills: [sacrifice] });
  const sacrificeRaid = raidFor([martyr]), sacrificeCoordinator = coordinatorFor([martyr]), sacrificeEvents = [];
  assert.notEqual(chooseRaidAutoAction(sacrificeRaid, martyr, 1).skillId, sacrifice.id, "AUTO never sacrifices itself without securing a KO");
  sacrificeRaid.boss.hp = 1_000;
  assert.equal(chooseRaidAutoAction(sacrificeRaid, martyr, 1).skillId, sacrifice.id);
  sacrificeCoordinator._resolvePlayer({ selectedFloor: 1 }, sacrificeRaid, martyr, { kind: "skill", skillId: sacrifice.id, targetId: martyr.playerId, enemyTargetId: sacrificeRaid.boss.id }, sacrificeCoordinator.sessions.get(martyr.ownerPlayerId), sacrificeEvents);
  assert.equal(martyr.hp, 0);
  assert.equal(sacrificeRaid.boss.hp, 0);
  assert.equal(sacrificeEvents.some(event => event.kind === "ko" && event.targetId === martyr.playerId), true);
});

test("build257 raid composite AUTO target is the ally the resolver revives", () => {
  const lifeCycle = { id: "life-cycle", name: "Life Cycle", kind: "allHeal", allAllies: true, mp: 0, heal: .1, revive: .01, reviveTransferRate: .5 };
  const actor = player("owner", { hp: 400, skills: [lifeCycle] });
  const small = player("small", { hp: 0 });
  const large = player("large", { hp: 0, maxHp: 2_000, stats: { ...player("template").stats, hp: 2_000 } });
  const raid = raidFor([actor, small, large]), coordinator = coordinatorFor([actor, small, large]), events = [];

  const action = chooseRaidAutoAction(raid, actor, 1);
  assert.equal(action.skillId, lifeCycle.id);
  assert.equal(action.targetId, large.playerId, "AUTO selects the largest fallen ally");
  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, action, coordinator.sessions.get(actor.ownerPlayerId), events);

  assert.equal(small.hp, 0);
  assert.equal(large.hp, 260, "the resolver honors the selected fallen ally rather than falling back by insertion order");
  assert.equal(actor.hp, 260);
});

test("build257 raid recovery projection includes transfer donor loss and revived HP", () => {
  const lifeCycle = { id: "life-cycle", name: "Life Cycle", kind: "allHeal", allAllies: true, mp: 0, heal: .1, revive: .01, reviveTransferRate: .9 };
  const singleHeal = { id: "single-heal", name: "Single Heal", kind: "heal", mp: 0, heal: .4 };
  const donor = player("donor", { hp: 500, skills: [lifeCycle], stats: { ...player("template").stats, spd: 200 } });
  const healer = player("healer", { itemCharges: 0, skills: [singleHeal], stats: { ...player("template").stats, spd: 100 } });
  const fallen = player("fallen", { hp: 0 });
  const raid = raidFor([donor, healer, fallen], { actions: { donor: { actorId: donor.playerId, kind: "skill", skillId: lifeCycle.id, targetId: fallen.playerId } } });

  const action = chooseRaidAutoAction(raid, healer, 1);
  assert.equal(action.skillId, singleHeal.id);
  assert.equal(action.targetId, donor.playerId, "the follow-up healer sees the donor at 62 HP, not at its pre-transfer projection");

  const coordinator = coordinatorFor([donor, healer, fallen]), events = [];
  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, donor, raid.actions.donor, coordinator.sessions.get(donor.ownerPlayerId), events);
  assert.equal(donor.hp, 62);
  assert.equal(fallen.hp, 558);
});

test("build257 raid recovery projection uses resolver order for equal-speed committed actors", () => {
  const groupHeal = { id: "group-heal", name: "Group Heal", kind: "allHeal", allAllies: true, mp: 0, heal: .1 };
  const transfer = { id: "transfer", name: "Transfer", kind: "revive", mp: 0, revive: .01, reviveTransferRate: .5 };
  const singleHeal = { id: "single-heal", name: "Single Heal", kind: "heal", mp: 0, heal: .4 };
  const first = player("first", { skills: [groupHeal] });
  const second = player("second", { hp: 500, skills: [transfer] });
  const fallen = player("fallen", { hp: 0, maxHp: 2_000, stats: { ...player("template").stats, hp: 2_000 } });
  const wounded = player("wounded", { hp: 100 });
  const healer = player("healer", { itemCharges: 0, skills: [singleHeal] });
  const raid = raidFor([first, second, fallen, wounded, healer], {
    actions: {
      second: { actorId: second.playerId, kind: "skill", skillId: transfer.id, targetId: fallen.playerId },
      first: { actorId: first.playerId, kind: "skill", skillId: groupHeal.id, targetId: first.playerId },
    },
  });

  const action = chooseRaidAutoAction(raid, healer, 1);
  assert.equal(action.skillId, singleHeal.id);
  assert.equal(action.targetId, fallen.playerId, "stable player order heals the donor before its transfer, matching _resolve");
});

test("build257 raid AUTO does not heal a corpse before a slower committed revival resolves", () => {
  const revive = { id: "slow-revive", name: "Slow Revive", kind: "revive", mp: 0, revive: .35 };
  const heal = { id: "fast-heal", name: "Fast Heal", kind: "heal", mp: 0, heal: .4 };
  const slow = player("slow", { skills: [revive], stats: { ...player("template").stats, spd: 50 } });
  const fast = player("fast", { itemCharges: 0, skills: [heal], stats: { ...player("template").stats, spd: 200 } });
  const fallen = player("fallen", { hp: 0 });
  const raid = raidFor([slow, fast, fallen], { actions: { slow: { actorId: slow.playerId, kind: "skill", skillId: revive.id, targetId: fallen.playerId } } });

  const action = chooseRaidAutoAction(raid, fast, 1);
  assert.equal(action.kind, "attack");
  assert.notEqual(action.targetId, fallen.playerId, "the future revive reserves the corpse without projecting it alive before the fast actor's turn");
});

test("build257 raid AUTO skips an unfundable transfer revive when a real revive is available", () => {
  const transfer = { id: "cheap-transfer", name: "Cheap Transfer", kind: "revive", mp: 0, revive: .01, reviveTransferRate: .5 };
  const fixed = { id: "fixed-revive", name: "Fixed Revive", kind: "revive", mp: 20, revive: .35 };
  const actor = player("owner", { hp: 1, skills: [transfer, fixed] });
  const fallen = player("fallen", { hp: 0 });
  const raid = raidFor([actor, fallen]);

  const action = chooseRaidAutoAction(raid, actor, 1);
  assert.equal(action.skillId, fixed.id);
  assert.equal(action.targetId, fallen.playerId);
});

test("build257 raid AUTO does not fund a fast transfer revive with a slower committed heal", () => {
  const transfer = { id: "cheap-transfer", name: "Cheap Transfer", kind: "revive", mp: 0, revive: .01, reviveTransferRate: .5 };
  const fixed = { id: "fixed-revive", name: "Fixed Revive", kind: "revive", mp: 20, revive: .35 };
  const heal = { id: "slow-heal", name: "Slow Heal", kind: "heal", mp: 0, heal: .5 };
  const fast = player("fast", { hp: 1, skills: [transfer, fixed], stats: { ...player("template").stats, spd: 200 } });
  const slow = player("slow", { skills: [heal], stats: { ...player("template").stats, spd: 50 } });
  const fallen = player("fallen", { hp: 0 });
  const raid = raidFor([fast, slow, fallen], {
    actions: { slow: { actorId: slow.playerId, kind: "skill", skillId: heal.id, targetId: fast.playerId } },
  });

  const action = chooseRaidAutoAction(raid, fast, 1);
  assert.equal(action.skillId, fixed.id, "a heal that resolves later cannot supply transfer HP on the fast actor's turn");
  assert.equal(action.targetId, fallen.playerId);
});

test("build257 raid failed pure revives refund MP and clear the just-applied cooldown", () => {
  const revive = { id: "revive", name: "Revive", kind: "revive", mp: 20, cooldown: 3, revive: .35 };
  const actor = player("owner", { mp: 70, skills: [revive], cooldowns: { other: 2 } });
  const sealed = player("sealed", { hp: 0, effects: [{ kind: "reviveSeal", value: 1, turns: 2 }] });
  const raid = raidFor([actor, sealed]), coordinator = coordinatorFor([actor, sealed]), events = [];

  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: revive.id, targetId: actor.playerId }, coordinator.sessions.get(actor.ownerPlayerId), events);

  assert.equal(actor.mp, 70);
  assert.equal(actor.cooldowns[revive.id], undefined);
  assert.equal(actor.cooldowns.other, 2);
  assert.equal(sealed.hp, 0);
  assert.equal(events.some(event => event.kind === "reviveFail"), true);
});

test("build257 raid transfer revival cannot create HP from a one-HP donor", () => {
  const transfer = { id: "transfer", name: "Transfer", kind: "revive", mp: 20, cooldown: 3, revive: .01, reviveTransferRate: .9 };
  const backup = { id: "backup", name: "Backup", kind: "revive", mp: 0, revive: .35 };
  const donor = player("donor", { hp: 1, mp: 50, skills: [transfer] });
  const rescuer = player("rescuer", { skills: [backup] });
  const fallen = player("fallen", { hp: 0 });
  const raid = raidFor([donor, rescuer, fallen], { actions: { donor: { actorId: donor.playerId, kind: "skill", skillId: transfer.id, targetId: fallen.playerId } } });

  assert.equal(chooseRaidAutoAction(raid, rescuer, 1).targetId, fallen.playerId, "an impossible committed transfer does not reserve the corpse");
  const coordinator = coordinatorFor([donor, rescuer, fallen]), events = [];
  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, donor, raid.actions.donor, coordinator.sessions.get(donor.ownerPlayerId), events);
  assert.equal(donor.hp, 1);
  assert.equal(donor.mp, 50);
  assert.equal(donor.cooldowns[transfer.id], undefined);
  assert.equal(fallen.hp, 0);
  assert.equal(events.some(event => event.kind === "reviveFail"), true);

  const composite = { id: "composite-transfer", name: "Composite Transfer", kind: "allHeal", allAllies: true, mp: 10, cooldown: 2, heal: .5, revive: .01, reviveTransferRate: .9 };
  const tiny = player("tiny", { hp: 1, maxHp: 1, mp: 50, skills: [composite], stats: { ...player("template").stats, hp: 1 } });
  const stillFallen = player("still-fallen", { hp: 0 });
  const compositeRaid = raidFor([tiny, stillFallen]), compositeCoordinator = coordinatorFor([tiny, stillFallen]), compositeEvents = [];
  compositeCoordinator._resolvePlayer({ selectedFloor: 1 }, compositeRaid, tiny, { kind: "skill", skillId: composite.id, targetId: stillFallen.playerId }, compositeCoordinator.sessions.get(tiny.ownerPlayerId), compositeEvents);
  assert.equal(tiny.hp, 1);
  assert.equal(tiny.mp, 40, "the healing portion still consumes the composite skill");
  assert.equal(tiny.cooldowns[composite.id], 3);
  assert.equal(stillFallen.hp, 0);
});

test("build257 raid composite support applies post-revive effects, cleanse, and shields to the full party", () => {
  const lifeCycle = {
    id: "life-cycle-support",
    name: "Life Cycle Support",
    kind: "allHeal",
    allAllies: true,
    mp: 0,
    heal: .2,
    revive: .25,
    partyShieldRate: .1,
    cleanse: true,
    effects: [
      { kind: "defUp", value: .2, turns: 2, allies: true, chance: 1 },
      { kind: "spdUp", value: .2, turns: 2, allies: true, chance: 0 },
    ],
  };
  const actor = player("owner", { hp: 500, skills: [lifeCycle], effects: [{ kind: "atkDown", value: .2, turns: 2 }] });
  const ally = player("ally", { effects: [{ kind: "status:poison", value: .05, turns: 2 }] });
  const fallen = player("fallen", { hp: 0, effects: [{ kind: "defDown", value: .2, turns: 2 }] });
  const raid = raidFor([actor, ally, fallen]), coordinator = coordinatorFor([actor, ally, fallen]), events = [];

  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: lifeCycle.id, targetId: fallen.playerId }, coordinator.sessions.get(actor.ownerPlayerId), events);

  for (const target of [actor, ally, fallen]) {
    assert.equal(target.shield, 100);
    assert.equal(target.effects.some(effect => effect.kind === "defUp"), true);
    assert.equal(target.effects.some(effect => effect.kind === "spdUp"), false);
    assert.equal(target.effects.some(effect => effect.kind.endsWith("Down") || effect.kind.startsWith("status:")), false);
  }
  assert.equal(fallen.hp, 250);
});

test("build257 raid attack resolves execute, percentage damage, drains, party support, and CT fields", () => {
  const skill = {
    id: "compound-attack",
    name: "Compound Attack",
    kind: "attack",
    mp: 10,
    cooldown: 4,
    power: 1,
    hits: 1,
    guaranteedHit: true,
    execute: .5,
    currentHpDamage: .2,
    drain: .5,
    selfHeal: .1,
    mpDrain: .5,
    partyShieldRate: .1,
    reducePartyCooldowns: 1,
    increaseAllyCooldowns: 1,
    effects: [
      { kind: "stun", value: 0, turns: 1, enemy: true, chance: 0 },
      { kind: "atkDown", value: .2, turns: 2, enemy: true, chance: 1 },
      { kind: "defUp", value: .2, turns: 2, allies: true, chance: 1 },
      { kind: "spdUp", value: .2, turns: 2, allies: true, chance: 0 },
    ],
  };
  const actor = player("owner", { hp: 400, mp: 40, skills: [skill] });
  const ally = player("ally", { cooldowns: { allySkill: 3 } });
  const raid = raidFor([actor, ally], { round: 6, modifier: { healing: 1, playerDamage: 1, disableCritical: true } });
  raid.boss.hp = 4_000;
  raid.boss.currentMp = 50;
  raid.boss.maxMp = 100;
  raid.progress.hp = 4_000;
  const coordinator = coordinatorFor([actor, ally]), events = [];

  assert.equal(chooseRaidAutoAction(raid, actor, 1).skillId, skill.id, "AUTO values execute and post-hit percentage damage");
  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: skill.id, targetId: actor.playerId, enemyTargetId: raid.boss.id }, coordinator.sessions.get(actor.ownerPlayerId), events);

  assert.equal(raid.boss.hp, 2_889);
  assert.equal(raid.progress.totalDamage, 1_111);
  assert.equal(raid.contribution.owner.damage, 1_111);
  assert.equal(raid.boss.currentMp, 0);
  assert.equal(actor.mp, 80);
  assert.equal(actor.hp, 1_000);
  assert.equal(raid.contribution.owner.healing, 600);
  assert.equal(raid.contribution.owner.mpHealing, 50);
  assert.equal(actor.cooldowns[skill.id], 4, "party CT reduction includes the skill's just-applied cooldown");
  assert.equal(ally.cooldowns.allySkill, 2, "increaseAllyCooldowns is not applied to the caster's own party");
  assert.equal(raid.boss.actionDelay, 1, "increaseAllyCooldowns remains the enemy-delay compatibility spelling");
  assert.equal(raid.boss.effects.some(effect => effect.kind === "atkDown"), true);
  assert.equal(raid.boss.effects.some(effect => effect.kind === "stun"), false);
  for (const target of [actor, ally]) {
    assert.equal(target.shield, 100);
    assert.equal(target.effects.some(effect => effect.kind === "defUp"), true);
    assert.equal(target.effects.some(effect => effect.kind === "spdUp"), false);
  }

  const hpBeforeBossTurn = [actor.hp, ally.hp];
  coordinator._resolveBoss(raid, events);
  assert.deepEqual([actor.hp, ally.hp], hpBeforeBossTurn);
  assert.equal(events.some(event => event.kind === "cooldownBlock" && event.targetId === raid.boss.id), true);
});

test("build257 raid MP drain estimator and resolver retain fallback gain after a lethal hit", () => {
  const skill = { id: "lethal-mp-drain", name: "Lethal MP Drain", kind: "attack", mp: 50, power: 1.4, hits: 1, guaranteedHit: true, mpDrain: .25 };
  const actor = player("owner", { skills: [skill] });
  const raid = raidFor([actor], { modifier: { healing: 1, playerDamage: 1, disableCritical: true } });
  const coordinator = coordinatorFor([actor]), events = [];

  assert.equal(chooseRaidAutoAction(raid, actor, 1).skillId, skill.id, "AUTO treats fallback MP absorption as reducing effective skill cost");
  raid.boss.hp = 200;
  raid.progress.hp = 200;
  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: skill.id, targetId: actor.playerId, enemyTargetId: raid.boss.id }, coordinator.sessions.get(actor.ownerPlayerId), events);

  assert.equal(raid.boss.hp, 0);
  assert.equal(actor.mp, 75, "the actor recovers 25% max MP even though no target survives to supply MP");
  assert.equal(raid.contribution.owner.mpHealing, 25);
});

test("build257 raid attack-attached party and enemy effects still resolve when damage misses", () => {
  const skill = {
    id: "miss-support",
    name: "Miss Support",
    kind: "attack",
    mp: 0,
    power: 1,
    hits: 1,
    partyShieldRate: .1,
    increaseEnemyCooldowns: 1,
    effects: [
      { kind: "defUp", value: .2, turns: 2, allies: true, chance: 1 },
      { kind: "atkDown", value: .2, turns: 2, enemy: true, chance: 1 },
    ],
  };
  const actor = player("owner", { skills: [skill] });
  const ally = player("ally");
  const raid = raidFor([actor, ally]), sessions = new Map([
    [actor.ownerPlayerId, { playerId: actor.ownerPlayerId, profile: { displayName: actor.ownerPlayerId } }],
    [ally.ownerPlayerId, { playerId: ally.ownerPlayerId, profile: { displayName: ally.ownerPlayerId } }],
  ]), coordinator = new RaidCoordinator({ now: () => 257_000, random: () => .99, sessions, broadcast: () => {}, queueReward: () => {} }), events = [];

  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: skill.id, targetId: actor.playerId, enemyTargetId: raid.boss.id }, sessions.get(actor.ownerPlayerId), events);

  assert.equal(raid.boss.hp, 10_000);
  assert.equal(events.some(event => event.kind === "miss"), true);
  assert.equal(raid.boss.effects.some(effect => effect.kind === "atkDown"), true);
  assert.equal(raid.boss.actionDelay, 1);
  for (const target of [actor, ally]) {
    assert.equal(target.shield, 100);
    assert.equal(target.effects.some(effect => effect.kind === "defUp"), true);
  }
});

test("build257 raid current-HP damage resolves after a missed direct hit", () => {
  const skill = { id: "percent-after-miss", name: "Percent After Miss", kind: "attack", mp: 0, power: 1, hits: 1, currentHpDamage: .2 };
  const actor = player("owner", { skills: [skill], stats: { ...player("template").stats, accuracy: 20 } });
  const raid = raidFor([actor]);
  raid.boss.evasion = 75;
  const sessions = new Map([[actor.ownerPlayerId, { playerId: actor.ownerPlayerId, profile: { displayName: actor.ownerPlayerId } }]]);
  const coordinator = new RaidCoordinator({ now: () => 257_000, random: () => .99, sessions, broadcast: () => {}, queueReward: () => {} }), events = [];

  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: skill.id, targetId: actor.playerId, enemyTargetId: raid.boss.id }, sessions.get(actor.ownerPlayerId), events);

  assert.equal(events.some(event => event.kind === "miss"), true);
  assert.equal(raid.boss.hp, 8_000);
  assert.equal(raid.progress.totalDamage, 2_000);
  assert.equal(raid.contribution.owner.damage, 2_000);
});

test("build257 raid enemy CT extensions stack across explicit and compatibility spellings", () => {
  const explicit = { id: "explicit-delay", name: "Explicit Delay", kind: "attack", mp: 0, power: .1, hits: 1, guaranteedHit: true, increaseEnemyCooldowns: 1 };
  const compatibility = { id: "compat-delay", name: "Compat Delay", kind: "attack", mp: 0, power: .1, hits: 1, guaranteedHit: true, increaseAllyCooldowns: 1 };
  const first = player("first", { skills: [explicit] });
  const second = player("second", { skills: [compatibility] });
  const raid = raidFor([first, second], { modifier: { healing: 1, playerDamage: 1, disableCritical: true } });
  const coordinator = coordinatorFor([first, second]), events = [];

  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, first, { kind: "skill", skillId: explicit.id, targetId: first.playerId, enemyTargetId: raid.boss.id }, coordinator.sessions.get(first.ownerPlayerId), events);
  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, second, { kind: "skill", skillId: compatibility.id, targetId: second.playerId, enemyTargetId: raid.boss.id }, coordinator.sessions.get(second.ownerPlayerId), events);

  assert.equal(raid.boss.actionDelay, 2);
});

test("build257 raid enemy CT delay survives idle telegraph rounds until an action consumes it", () => {
  const actor = player("owner");
  const raid = raidFor([actor], { round: 5, phase: "result", nextRoundAt: 0, outcome: null, speed: 1, lastEvents: [] });
  raid.boss.actionDelay = 1;
  const coordinator = coordinatorFor([actor]);
  const room = { phase: "raid", selectedFloor: 1, raid };

  coordinator.advance(room);
  assert.equal(raid.round, 6);
  assert.equal(raid.boss.actionDelay, 1, "round opening does not spend delay while the boss is idle");

  const events = [], before = actor.hp;
  coordinator._resolveBoss(raid, events);
  assert.equal(actor.hp, before);
  assert.equal(raid.boss.actionDelay, 0, "the first eligible boss action consumes one delay");
  assert.equal(events.some(event => event.kind === "cooldownBlock" && event.targetId === raid.boss.id), true);
});

test("build257 raid hard-control presence suppresses both minion and boss actions at power zero", () => {
  const actor = player("owner");
  const raid = raidFor([actor], { round: 6 });
  const minion = enemy("minion", { effects: [{ kind: "status:freeze", value: 0, turns: 1 }] });
  raid.minions = [minion];
  raid.boss.effects = [{ kind: "stun", value: 0, turns: 1 }];
  const coordinator = coordinatorFor([actor]), events = [], before = actor.hp;

  coordinator._resolveMinions(raid, events);
  coordinator._resolveBoss(raid, events);

  assert.equal(actor.hp, before);
  assert.equal(events.filter(event => event.kind === "statusBlock").length, 2);
});

test("build257 raid canonicalizes poison and nature and samples randomElement from the standard eight", () => {
  const resolveDamage = ({ element, randomElement = false, speciesId, targetElement, random = .5 }) => {
    const skill = { id: `element-${element}`, name: "Element", kind: "attack", mp: 0, power: 1, hits: 1, guaranteedHit: true, element, randomElement };
    const actor = player("owner", { speciesId, skills: [skill] });
    const raid = raidFor([actor], { modifier: { healing: 1, playerDamage: 1, disableCritical: true } });
    raid.boss.element = targetElement;
    const sessions = new Map([[actor.ownerPlayerId, { playerId: actor.ownerPlayerId, profile: { displayName: actor.ownerPlayerId } }]]);
    const coordinator = new RaidCoordinator({ now: () => 257_000, random: () => random, sessions, broadcast: () => {}, queueReward: () => {} });
    coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: skill.id, targetId: actor.playerId, enemyTargetId: raid.boss.id }, sessions.get(actor.ownerPlayerId), []);
    return 10_000 - raid.boss.hp;
  };

  assert.equal(resolveDamage({ element: "poison", speciesId: "acid_slime", targetElement: "wind" }), resolveDamage({ element: "ice", speciesId: "acid_slime", targetElement: "wind" }));
  assert.equal(resolveDamage({ element: "nature", speciesId: "flora", targetElement: "lightning" }), resolveDamage({ element: "earth", speciesId: "flora", targetElement: "lightning" }));
  assert.equal(resolveDamage({ element: "water", randomElement: true, speciesId: "owner", targetElement: "light", random: .999 }), resolveDamage({ element: "dark", speciesId: "owner", targetElement: "light", random: .999 }), "the last standard-pool element is dark, not an extra poison/nature alias");
});

test("build257 raid randomElement is sampled once per all-enemy skill", () => {
  const skill = { id: "random-area", name: "Random Area", kind: "attack", mp: 0, power: 1, hits: 1, allEnemies: true, guaranteedHit: true, randomElement: true };
  const actor = player("owner", { skills: [skill] });
  const raid = raidFor([actor], { modifier: { healing: 1, playerDamage: 1, disableCritical: true } });
  const minion = enemy("minion");
  raid.minions = [minion];
  const rolls = [0, .5, .5];
  const sessions = new Map([[actor.ownerPlayerId, { playerId: actor.ownerPlayerId, profile: { displayName: actor.ownerPlayerId } }]]);
  const coordinator = new RaidCoordinator({ now: () => 257_000, random: () => rolls.shift() ?? .5, sessions, broadcast: () => {}, queueReward: () => {} });

  coordinator._resolvePlayer({ selectedFloor: 1 }, raid, actor, { kind: "skill", skillId: skill.id, targetId: actor.playerId, enemyTargetId: raid.boss.id }, sessions.get(actor.ownerPlayerId), []);

  assert.equal(10_000 - raid.boss.hp, 174);
  assert.equal(10_000 - minion.hp, 174, "boss and minion share the single fire roll for this cast");
});
