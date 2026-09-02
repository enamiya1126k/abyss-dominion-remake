import test from "node:test";
import assert from "node:assert/strict";

import { chooseEnemyAction, ENEMY_ACTIONS } from "../src/battle/EnemyAI.js";
import { chooseAutoBattleDecision, maxMp } from "../src/battle/SkillSystem.js";

const attack = {
  id: "strike",
  name: "Strike",
  type: "attack",
  target: "敵単体",
  power: .5,
  hits: 1,
  mp: 0,
  element: "neutral",
  damageClass: "physical",
};

function monsterWith(skills, overrides = {}) {
  return {
    id: overrides.id ?? "hero",
    speciesId: "slime",
    level: 100,
    rank: 1,
    currentHp: 1_000,
    currentMp: 100,
    _maxHp: 1_000,
    _equipmentSkills: skills,
    _equipmentStats: {},
    _equipmentAffixes: {},
    equippedSkills: [...skills.map(skill => skill.id), null, null, null, null].slice(0, 4),
    skillLoadoutInitialized: true,
    skillProgress: {},
    ...overrides,
  };
}

const ally = (id, overrides = {}) => ({
  id,
  speciesId: "slime",
  level: 100,
  rank: 1,
  currentHp: 1_000,
  currentMp: 100,
  _maxHp: 1_000,
  maxMp: 100,
  ...overrides,
});

const foe = {
  id: "foe",
  speciesId: "slime",
  element: "neutral",
  hp: 1_000_000,
  maxHp: 1_000_000,
  atk: 60,
  matk: 60,
  def: 10,
  mdef: 10,
  spd: 20,
};

function withFixedRandom(value, callback) {
  const previous = Math.random;
  Math.random = () => value;
  try { return callback(); }
  finally { Math.random = previous; }
}

test("build305 offline AUTO evaluates party MP shortage, utilization, and the 20% reserve", () => {
  const manaTide = { id: "mana-tide", name: "Mana Tide", type: "mpHeal", target: "味方全体", mpHeal: .25, mp: 10 };
  const hero = monsterWith([manaTide, attack]);
  const maximum = maxMp(hero);
  hero.currentMp = Math.floor(maximum * .8);
  const drained = ally("drained", { currentMp: 10 });

  let decision = chooseAutoBattleDecision(hero, { party: [hero, drained], enemies: [foe], cooldowns: {} });
  assert.equal(decision.skill?.id, manaTide.id, "a depleted ally can trigger the party MP recovery even when the caster is healthy");
  assert.equal(decision.targetId, drained.id);

  hero.currentMp = maximum;
  const almostFull = [ally("low", { currentMp: 34 }), ally("full-a"), ally("full-b")];
  decision = chooseAutoBattleDecision(hero, { party: [hero, ...almostFull], enemies: [foe], cooldowns: {} });
  assert.equal(decision.skill?.id, attack.id, "less than 50% useful recovery must not consume a turn");

  hero.currentMp = Math.floor(maximum * .25);
  const partyDebt = [ally("debt-a", { currentMp: 30 }), ally("debt-b", { currentMp: 30 })];
  decision = chooseAutoBattleDecision(hero, { party: [hero, ...partyDebt], enemies: [foe], cooldowns: {} });
  assert.equal(decision.skill?.id, attack.id, "non-emergency recovery must preserve 20% of the caster's maximum MP");

  partyDebt[0].currentMp = 10;
  decision = chooseAutoBattleDecision(hero, { party: [hero, ...partyDebt], enemies: [foe], cooldowns: {} });
  assert.equal(decision.skill?.id, manaTide.id, "20% or lower party MP remains an emergency exception to the reserve");
});

test("build305 offline AUTO recognizes executable cleanse composites at the online thresholds", () => {
  const cleansingHeal = { id: "cleansing-heal", name: "Cleansing Heal", type: "allHeal", target: "味方全体", heal: .2, cleanse: true, mp: 10 };
  const hero = monsterWith([cleansingHeal, attack]);
  const first = ally("first"), second = ally("second");
  const base = { party: [hero, first, second], enemies: [foe], cooldowns: {} };

  let decision = chooseAutoBattleDecision(hero, { ...base, allyEffects: { first: [{ kind: "poison" }], second: [{ kind: "atkDown" }] } });
  assert.equal(decision.skill?.id, cleansingHeal.id, "two afflicted allies justify a composite cleanse even at full HP");
  assert.equal(decision.reason, "composite-cleanse");

  decision = chooseAutoBattleDecision(hero, { ...base, allyEffects: { first: [{ kind: "poison" }] } });
  assert.equal(decision.skill?.id, attack.id, "one healthy afflicted ally does not justify the composite cooldown");

  first.currentHp = 600;
  decision = chooseAutoBattleDecision(hero, { ...base, allyEffects: { first: [{ kind: "poison" }] } });
  assert.equal(decision.skill?.id, cleansingHeal.id, "one afflicted ally at 60% HP or lower justifies the composite cleanse");
  assert.equal(decision.targetId, first.id);
});

test("build305 offline enemy CT blocks the advertised number of action opportunities", () => withFixedRandom(0, () => {
  const elemental = {
    speciesId: "elemental",
    role: "balanced",
    element: "fire",
    hp: 100,
    maxHp: 100,
    boss: false,
    maxMp: 100,
    currentMp: 100,
    specialCooldown: 0,
    phase: 1,
  };
  assert.equal(chooseEnemyAction(elemental, { allies: [elemental], opponents: [] }), ENEMY_ACTIONS.flameSweep);
  assert.equal(elemental.specialCooldown, 2, "base CT1 is stored as CT+1 until the current action cycle ends");
  assert.notEqual(chooseEnemyAction(elemental, { allies: [elemental], opponents: [] }), ENEMY_ACTIONS.flameSweep);
  assert.equal(chooseEnemyAction(elemental, { allies: [elemental], opponents: [] }), ENEMY_ACTIONS.flameSweep, "CT1 returns after exactly one blocked opportunity");

  const floorBoss = {
    speciesId: "floor-boss",
    role: "balanced",
    element: "neutral",
    hp: 30,
    maxHp: 100,
    boss: true,
    maxMp: 100,
    currentMp: 100,
    specialCooldown: 0,
    phase: 1,
    floorBossActionIds: ["first", "ultimate"],
    floorBossActionIndex: 0,
  };
  assert.equal(chooseEnemyAction(floorBoss, { allies: [floorBoss], opponents: [] }), "floorBoss:ultimate");
  assert.equal(floorBoss.specialCooldown, 3, "base CT2 uses the same internal CT+1 contract as player skills");
  assert.notEqual(chooseEnemyAction(floorBoss, { allies: [floorBoss], opponents: [] }), "floorBoss:first");
  assert.notEqual(chooseEnemyAction(floorBoss, { allies: [floorBoss], opponents: [] }), "floorBoss:first");
  assert.equal(chooseEnemyAction(floorBoss, { allies: [floorBoss], opponents: [] }), "floorBoss:first", "the dedicated counter is decremented only once per opportunity");
}));
