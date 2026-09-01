import test from "node:test";
import assert from "node:assert/strict";

import {
  chooseAutoBattleDecision,
  chooseAutoSkill,
  effectiveSkillMpCost,
} from "../src/battle/SkillSystem.js";

const attack = (id, options = {}) => ({
  id,
  name: id,
  type: "attack",
  target: options.allEnemies ? "敵全体" : "敵単体",
  power: 1,
  hits: 1,
  mp: 0,
  element: "neutral",
  damageClass: "physical",
  ...options,
});

function monsterWith(skills, options = {}) {
  const monster = {
    id: options.id ?? "auto-hero",
    speciesId: "slime",
    level: options.level ?? 100,
    rank: 1,
    currentHp: options.hp ?? 1000,
    currentMp: options.mp ?? 999,
    _maxHp: options.maxHp ?? 1000,
    _equipmentSkills: skills,
    _equipmentStats: {},
    _equipmentAffixes: {},
    equippedSkills: [...skills.slice(0, 4).map(skill => skill.id), ...Array(4).fill(null)].slice(0, 4),
    skillLoadoutInitialized: true,
    skillProgress: {},
  };
  return monster;
}

const enemy = (id, options = {}) => ({
  id,
  speciesId: options.speciesId ?? "slime",
  element: options.element ?? "neutral",
  hp: options.hp ?? 1000,
  maxHp: options.maxHp ?? options.hp ?? 1000,
  atk: options.atk ?? 60,
  matk: options.matk ?? 60,
  def: options.def ?? 10,
  mdef: options.mdef ?? 10,
  spd: options.spd ?? 20,
  ...options,
});

test("build257 keeps the proven recovery thresholds and MP reserve", () => {
  const groupHeal = { id: "group-heal", name: "群癒", type: "allHeal", target: "味方全体", heal: .20, mp: 12, mpRate: .14 };
  const strike = attack("strike", { power: 1.2 });
  const hero = monsterWith([groupHeal, strike], { hp: 620 });
  const ally = { id: "ally", currentHp: 620, _maxHp: 1000 };

  assert.equal(chooseAutoBattleDecision(hero, { party: [hero, ally], cooldowns: {} }).skill?.id, strike.id, "62% HP must not trigger wasteful healing");
  hero.currentHp = 500;
  ally.currentHp = 500;
  assert.equal(chooseAutoBattleDecision(hero, { party: [hero, ally], cooldowns: {} }).skill?.id, groupHeal.id, "two allies at 52% or below need group recovery");

  hero.currentMp = effectiveSkillMpCost(hero, groupHeal);
  const conserved = chooseAutoBattleDecision(hero, { party: [hero, ally], cooldowns: {} });
  assert.equal(conserved.skill?.id, strike.id, "noncritical healing must preserve 20% MP");
  assert.equal(chooseAutoSkill(hero, { party: [hero, ally], cooldowns: {} })?.id, strike.id, "the legacy wrapper must return the decision skill");
});

test("build257 revives the most durable fallen ally before attacking", () => {
  const revive = { id: "revive", name: "蘇生", type: "revive", target: "味方単体", revive: .4, mp: 8 };
  const hero = monsterWith([attack("strike"), revive]);
  const small = { id: "small", currentHp: 0, _maxHp: 500 };
  const large = { id: "large", currentHp: 0, _maxHp: 1800 };
  const decision = chooseAutoBattleDecision(hero, { party: [hero, small, large], cooldowns: {} });
  assert.equal(decision.skill?.id, revive.id);
  assert.equal(decision.targetId, large.id);
  assert.equal(decision.reason, "revive");
});

test("build257 offline AUTO skips a revival-sealed fallen ally", () => {
  const revive = { id: "revive", name: "蘇生", type: "revive", target: "味方単体", revive: .4, mp: 8 };
  const hero = monsterWith([attack("strike"), revive]);
  const sealed = { id: "sealed", currentHp: 0, _maxHp: 2_000 };
  const eligible = { id: "eligible", currentHp: 0, _maxHp: 800 };
  const decision = chooseAutoBattleDecision(hero, {
    party: [hero, sealed, eligible], cooldowns: {},
    allyEffects: { sealed: [{ kind: "reviveSeal", value: 1, turns: 2 }] },
  });
  assert.equal(decision.skill?.id, revive.id);
  assert.equal(decision.targetId, eligible.id);
});

test("build257 offline AUTO rejects an unfundable pure HP transfer but allows all-heal to fund its composite revival first", () => {
  const strike = attack("strike", { power: .8 });
  const pureTransfer = { id: "pure-transfer", name: "純分与", type: "revive", target: "味方単体", reviveTransferRate: .5, mp: 0 };
  const composite = { id: "composite-transfer", name: "回復分与", type: "allHeal", target: "味方全体", heal: .1, reviveTransferRate: .5, mp: 0 };
  const fallen = { id: "fallen", currentHp: 0, _maxHp: 1_500 };
  const foe = enemy("foe", { hp: 5_000, maxHp: 5_000 });

  const pureCaster = monsterWith([pureTransfer, strike], { hp: 1, maxHp: 1_000 });
  const rejected = chooseAutoBattleDecision(pureCaster, { party: [pureCaster, fallen], enemies: [foe], cooldowns: {} });
  assert.notEqual(rejected.skill?.id, pureTransfer.id);

  const compositeCaster = monsterWith([composite, strike], { hp: 1, maxHp: 1_000 });
  const accepted = chooseAutoBattleDecision(compositeCaster, { party: [compositeCaster, fallen], enemies: [foe], cooldowns: {} });
  assert.equal(accepted.skill?.id, composite.id);
  assert.equal(accepted.targetId, fallen.id);
  assert.equal(accepted.reason, "revive");
});

test("build257 selects an affordable off-cooldown elemental advantage deterministically", () => {
  const neutral = attack("neutral-heavy", { power: 1.4 });
  const fire = attack("fire-edge", { power: 1.2, element: "fire" });
  const hero = monsterWith([neutral, fire]);
  const ice = enemy("ice-target", { element: "ice", hp: 2000, maxHp: 2000 });
  const battle = { party: [hero], enemies: [ice], cooldowns: {}, autoBattleStats: { [hero.id]: { atk: 100, matk: 100, _affixes: {} } } };

  const first = chooseAutoBattleDecision(hero, battle);
  assert.equal(first.skill?.id, fire.id, "1.25× weakness should beat the slightly stronger neutral skill");
  assert.equal(first.targetId, ice.id);
  assert.equal(first.reason, "attribute-advantage");
  for (let index = 0; index < 8; index++) assert.deepEqual(chooseAutoBattleDecision(hero, battle), first, "the same state must always produce the same action");

  battle.cooldowns[hero.id] = { [fire.id]: 2 };
  assert.equal(chooseAutoBattleDecision(hero, battle).skill?.id, neutral.id, "skills on cooldown must be excluded");
});

test("build257 finishes a low-HP enemy before a more durable threat", () => {
  const hero = monsterWith([attack("finisher")]);
  const nearlyDown = enemy("nearly-down", { hp: 45, maxHp: 1000, atk: 20 });
  const dangerous = enemy("dangerous", { hp: 2000, maxHp: 2000, atk: 500, matk: 500, spd: 100, boss: true });
  const decision = chooseAutoBattleDecision(hero, {
    party: [hero], enemies: [dangerous, nearlyDown], cooldowns: {},
    autoBattleStats: { [hero.id]: { atk: 100, matk: 100, _affixes: {} } },
  });
  assert.equal(decision.targetId, nearlyDown.id);
  assert.equal(decision.reason, "lethal-finisher");
});

test("build257 values full-field damage and guards instead of wasting MP at critical HP", () => {
  const single = attack("single", { power: 1.5 });
  const sweep = attack("sweep", { power: .75, allEnemies: true });
  const hero = monsterWith([single, sweep]);
  const foes = [enemy("a", { hp: 1200 }), enemy("b", { hp: 1200 }), enemy("c", { hp: 1200 })];
  const battle = { party: [hero], enemies: foes, cooldowns: {}, autoBattleStats: { [hero.id]: { atk: 100, matk: 100, _affixes: {} } } };
  assert.equal(chooseAutoBattleDecision(hero, battle).skill?.id, sweep.id, "three useful hits should beat one larger hit");

  hero.currentHp = 150;
  const guarded = chooseAutoBattleDecision(hero, battle);
  assert.equal(guarded.kind, "guard");
  assert.equal(guarded.reason, "low-hp-guard");
});

test("build257 basic fallback focuses the largest surviving threat", () => {
  const hero = monsterWith([]);
  const routine = enemy("routine", { hp: 900, maxHp: 1000, atk: 30, spd: 10 });
  const controller = enemy("controller", {
    hp: 1000, maxHp: 1000, atk: 120, matk: 180, spd: 80,
    battleActions: [{ label: "蘇生", revive: .5 }, { label: "封印", status: { id: "stun" } }],
  });
  const decision = chooseAutoBattleDecision(hero, { party: [hero], enemies: [routine, controller], cooldowns: {} });
  assert.equal(decision.kind, "attack");
  assert.equal(decision.targetId, controller.id);
  assert.equal(decision.reason, "basic-attack");
});

test("build257 AUTO estimates defense-ignore with the same defense reduction used by combat", () => {
  const heavy = attack("heavy", { power: 1 });
  const pierce = attack("pierce", { power: .8, defenseIgnore: .8 });
  const hero = monsterWith([heavy, pierce]);
  const armored = enemy("armored", { hp: 1000, maxHp: 1000, def: 250, mdef: 250 });
  const decision = chooseAutoBattleDecision(hero, {
    party: [hero], enemies: [armored], cooldowns: {},
    autoBattleStats: { [hero.id]: { atk: 100, matk: 100, _affixes: {} } },
  });
  assert.equal(decision.skill?.id, pierce.id, "an 80% defense-piercing hit must beat a nominally stronger blocked hit");
});

test("build257 AUTO keeps zero-power fixed-damage signatures as real attacks", () => {
  const weak = attack("weak", { power: .2 });
  const fullLifeDrain = attack("full-life-drain", { power: 0, fillHpDrain: true });
  const sacrifice = attack("sacrifice", { power: 0, selfSacrificeHpDamage: 1, cooldown: 5 });
  const hero = monsterWith([weak, fullLifeDrain, sacrifice], { hp: 600, maxHp: 1000 });
  const target = enemy("target", { hp: 500, maxHp: 500, def: 10 });
  const battle = { party: [hero], enemies: [target], cooldowns: {}, autoBattleStats: { [hero.id]: { atk: 100, matk: 100, _affixes: {} } } };

  assert.equal(chooseAutoBattleDecision(hero, battle).skill?.id, sacrifice.id, "a lethal current-HP sacrifice must not disappear because power is zero");
  battle.cooldowns[hero.id] = { [sacrifice.id]: 5 };
  target.hp = 350;
  assert.equal(chooseAutoBattleDecision(hero, battle).skill?.id, fullLifeDrain.id, "missing-HP drain must be considered by its fixed damage instead of power");
  hero.currentHp = hero._maxHp;
  assert.equal(chooseAutoBattleDecision(hero, battle).skill?.id, weak.id, "a full-HP drain with zero actual effect must not replace a useful attack");
});

test("build257 AUTO never spends its life on a nonlethal sacrifice", () => {
  const strike = attack("safe-strike", { power: .8 });
  const sacrifice = attack("nonlethal-sacrifice", { power: 0, selfSacrificeHpDamage: 1 });
  const hero = monsterWith([strike, sacrifice], { hp: 300, maxHp: 1000 });
  const durable = enemy("durable", { hp: 1200, maxHp: 1200, def: 10 });
  const decision = chooseAutoBattleDecision(hero, {
    party: [hero], enemies: [durable], cooldowns: {},
    autoBattleStats: { [hero.id]: { atk: 100, matk: 100, _affixes: {} } },
  });
  assert.equal(decision.skill?.id, strike.id, "AUTO must preserve the actor when the sacrifice cannot defeat an enemy");
});

test("build257 AUTO periodically uses inactive tactics even against one routine enemy", () => {
  const buff = { id: "focus", name: "集中", type: "buff", target: "自分", power: 0, mp: 4, effects: [{ kind: "atkUp", value: .3, turns: 3 }] };
  const strike = attack("strike", { power: .8 });
  const hero = monsterWith([buff, strike]);
  const routine = enemy("routine", { hp: 2000, maxHp: 2000 });
  const base = { party: [hero], enemies: [routine], cooldowns: {}, autoBattleStats: { [hero.id]: { atk: 100, matk: 100, _affixes: {} } } };

  assert.equal(chooseAutoBattleDecision(hero, { ...base, turn: 1 }).skill?.id, buff.id, "turn one may establish a useful stance in a normal fight");
  assert.equal(chooseAutoBattleDecision(hero, { ...base, turn: 2 }).skill?.id, strike.id, "tactics must not be spammed every turn");
  assert.equal(chooseAutoBattleDecision(hero, { ...base, turn: 5 }).skill?.id, buff.id, "an expired tactic gets another deterministic window");
  assert.equal(chooseAutoBattleDecision(hero, { ...base, turn: 5, allyEffects: { [hero.id]: [{ kind: "atkUp", turns: 2, sourceSkillId: buff.id }] } }).skill?.id, strike.id, "an already active tactic must not be recast");
});

test("build257 offline AUTO estimates guaranteed critical and execute before choosing a finisher", () => {
  const guaranteed = attack("guaranteed", { power: .75, guaranteedCritical: true });
  const plain = attack("plain", { power: 1 });
  const hero = monsterWith([plain, guaranteed]);
  const target = enemy("target", { hp: 1_000, maxHp: 1_000, def: 100, mdef: 100 });
  const battle = { party: [hero], enemies: [target], cooldowns: {}, autoBattleStats: { [hero.id]: { atk: 100, matk: 100, _affixes: {} } } };
  assert.equal(chooseAutoBattleDecision(hero, battle).skill?.id, guaranteed.id, "a guaranteed critical uses the resolver's critical multiplier");

  const execute = attack("execute", { power: .55, execute: .5 });
  const ordinary = attack("ordinary", { power: .7 });
  hero._equipmentSkills = [ordinary, execute];
  hero.equippedSkills = [ordinary.id, execute.id, null, null];
  target.hp = 400;
  assert.equal(chooseAutoBattleDecision(hero, battle).skill?.id, execute.id, "execute is valued when the target is inside its threshold");

  const thresholdCombo = attack("threshold-combo", { power: 1, hits: 3, execute: .5, mp: 90 });
  hero._equipmentSkills = [thresholdCombo];
  hero.equippedSkills = [thresholdCombo.id, null, null, null];
  hero.currentMp = 100;
  target.hp = 250;
  target.maxHp = 400;
  target.def = 100;
  target.mdef = 100;
  assert.equal(chooseAutoBattleDecision(hero, battle).skill?.id, thresholdCombo.id, "later hits gain execute after an earlier hit crosses the threshold");
});

test("build257 offline AUTO lethal estimates include battle attack, conversion, critical, defense, vulnerable, and guard effects", () => {
  const costly = attack("costly", { power: 7, mp: 90 });
  const weakened = monsterWith([costly], { mp: 100 });
  const guarded = enemy("guarded", { hp: 600, maxHp: 600, def: 100, mdef: 100 });
  const guardedDecision = chooseAutoBattleDecision(weakened, {
    party: [weakened],
    enemies: [guarded],
    cooldowns: {},
    autoBattleStats: { [weakened.id]: { atk: 100, matk: 100, _affixes: {} } },
    allyEffects: { [weakened.id]: [{ kind: "atkDown", value: .5, turns: 2 }] },
    enemyEffects: { [guarded.id]: [{ kind: "defUp", value: .5, turns: 2 }, { kind: "guard", value: .5, turns: 2 }] },
  });
  assert.equal(guardedDecision.kind, "attack", "a guarded target is not falsely treated as a lethal MP-reserve exception");
  assert.equal(guardedDecision.skill, null);

  const finisher = attack("effect-finisher", { power: 4, mp: 90, damageClass: "physical" });
  const empowered = monsterWith([finisher], { id: "empowered", mp: 100 });
  const exposed = enemy("exposed", { hp: 3_000, maxHp: 3_000, def: 100, mdef: 100 });
  const empoweredDecision = chooseAutoBattleDecision(empowered, {
    party: [empowered],
    enemies: [exposed],
    cooldowns: {},
    autoBattleStats: { [empowered.id]: { atk: 100, matk: 300, _affixes: {} } },
    allyEffects: {
      [empowered.id]: [
        { kind: "atkUp", value: .5, turns: 2 },
        { kind: "magicToPhysical", value: .5, turns: 2 },
        { kind: "guaranteedCritical", value: 0, turns: 2 },
      ],
    },
    enemyEffects: { [exposed.id]: [{ kind: "defDown", value: .5, turns: 2 }, { kind: "vulnerable", value: .5, turns: 2 }] },
  });
  assert.equal(empoweredDecision.skill?.id, finisher.id, "active zero-value critical presence and battle modifiers expose the real lethal finisher");
  assert.equal(empoweredDecision.reason, "lethal-finisher");
});

test("build257 offline AUTO applies current-HP damage after the direct hit", () => {
  const costly = attack("costly-percent", { power: 1, currentHpDamage: .25, mp: 90 });
  const hero = monsterWith([costly], { mp: 100 });
  const target = enemy("target", { hp: 90, maxHp: 90, def: 100, mdef: 100 });
  const decision = chooseAutoBattleDecision(hero, {
    party: [hero], enemies: [target], cooldowns: {},
    autoBattleStats: { [hero.id]: { atk: 100, matk: 100, _affixes: {} } },
  });
  assert.equal(decision.kind, "attack", "a false lethal estimate must not break the MP reserve");
  assert.equal(decision.skill, null);
});
