import test from "node:test";
import assert from "node:assert/strict";

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(String(key)) ?? null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
  clear() { this.values.clear(); }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage;
globalThis.window = { dispatchEvent() {} };
globalThis.CustomEvent = class CustomEvent {
  constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
};

const [
  { MAX_PARTY_SIZE, SAVE_KEY },
  { SaveService },
  { createMonster, calculatedStats },
  { maxMp },
  { createBattleRulesState, applyBattleEffect },
  { buildTurnQueue },
  { createEnemyBattleState },
  { SPECIES },
  { FormationScreen },
  { ExploreScreen },
  { BattleScreen },
] = await Promise.all([
  import("../src/core/config.js"),
  import("../src/services/SaveService.js"),
  import("../src/models/Monster.js"),
  import("../src/battle/SkillSystem.js"),
  import("../src/battle/BattleRules.js"),
  import("../src/battle/TurnSystem.js"),
  import("../src/battle/EnemyAI.js"),
  import("../src/data/species.js"),
  import("../src/ui/screens/FormationScreen.js"),
  import("../src/ui/screens/ExploreScreen.js"),
  import("../src/ui/screens/BattleScreen.js"),
]);

function freshState() {
  storage.clear();
  return new SaveService().state;
}

function putState(state) {
  storage.setItem(SAVE_KEY, JSON.stringify(state));
  return new SaveService().state;
}

function makeMember(index, ailment) {
  const monster = createMonster("slime", {
    nickname: `監査${index + 1}`,
    level: 5 + index * 5,
    currentHp: index + 1,
    currentMp: index + 5,
    ailments: [{ id: ailment, power: 0.01 * (index + 1) }],
  });
  assert.ok(monster.currentHp <= calculatedStats(monster).hp);
  assert.ok(monster.currentMp <= maxMp(monster));
  return monster;
}

test("build248 keeps legacy one-member offline saves as one-member parties", () => {
  const state = freshState();
  const only = state.monsters[0];
  only.currentHp = 7;
  only.currentMp = 3;
  only.ailments = [{ id: "poison", name: "毒", kind: "damageOverTime", power: 0.05 }];
  state.party = [only.id];

  const loaded = putState(state);
  assert.deepEqual(loaded.party, [only.id]);
  assert.equal(loaded.monsters.find(monster => monster.id === only.id)?.currentHp, 7);
  assert.equal(loaded.monsters.find(monster => monster.id === only.id)?.currentMp, 3);
  assert.equal(loaded.monsters.find(monster => monster.id === only.id)?.ailments[0]?.id, "poison");
});

test("build248 normalizes offline parties to four unique valid members", () => {
  assert.equal(MAX_PARTY_SIZE, 4);
  const state = freshState();
  const members = Array.from({ length: 5 }, (_, index) => makeMember(index, "poison"));
  state.monsters = members;
  state.party = [members[0].id, members[1].id, members[1].id, "missing-monster", members[2].id, members[3].id, members[4].id];

  const loaded = putState(state);
  assert.deepEqual(loaded.party, members.slice(0, 4).map(monster => monster.id));
  assert.equal(new Set(loaded.party).size, 4);
  assert.ok(loaded.monsters.some(monster => monster.id === members[4].id), "the fifth owned monster stays safely in reserve");
});

test("build248 keeps HP, MP, persistent ailments, effects and turns separate for all four allies", () => {
  const state = freshState();
  const ailmentIds = ["poison", "burn", "freeze", "curse"];
  const members = ailmentIds.map((ailment, index) => makeMember(index, ailment));
  state.monsters = members;
  state.party = members.map(monster => monster.id);
  const loaded = putState(state);
  const party = loaded.party.map(id => loaded.monsters.find(monster => monster.id === id));

  assert.deepEqual(party.map(monster => monster.currentHp), [1, 2, 3, 4]);
  assert.deepEqual(party.map(monster => monster.currentMp), [5, 6, 7, 8]);
  assert.deepEqual(party.map(monster => monster.ailments[0]?.id), ailmentIds);

  const enemy = createEnemyBattleState(SPECIES.goblin, { speciesId: "goblin", level: 10, boss: false }, 9);
  enemy.id = "build248-enemy";
  const battle = {
    party,
    enemies: [enemy],
    enemy,
    targetEnemyId: enemy.id,
    turn: 1,
    turnQueue: [],
    queueIndex: 0,
    guards: {},
    species: SPECIES,
    log: [],
    auto: false,
    busy: false,
    magicCircleProfiles: {},
    magicCircleArt: {},
    ...createBattleRulesState(party),
  };

  party.forEach((monster, index) => {
    applyBattleEffect(battle, monster.id, {
      kind: "atkUp",
      value: 0.01 * (index + 1),
      turns: index + 1,
      sourceKey: `build248-${index}`,
    });
  });
  buildTurnQueue(battle);

  assert.deepEqual(Object.keys(battle.cooldowns).sort(), party.map(monster => monster.id).sort());
  assert.deepEqual(party.map(monster => battle.allyAilments[monster.id][0]?.id), ailmentIds);
  assert.deepEqual(party.map(monster => battle.allyEffects[monster.id][0]?.turns), [1, 2, 3, 4]);
  const allyTurns = battle.turnQueue.filter(entry => entry.type === "ally");
  assert.equal(allyTurns.length, 4);
  assert.deepEqual(new Set(allyTurns.map(entry => entry.id)), new Set(party.map(monster => monster.id)));
});

test("build248 renders the same four-member party in formation, exploration and battle", () => {
  const state = freshState();
  const ailmentIds = ["poison", "burn", "freeze", "curse"];
  const members = ailmentIds.map((ailment, index) => makeMember(index, ailment));
  state.monsters = members;
  state.party = members.map(monster => monster.id);
  const loaded = putState(state);
  const party = loaded.party.map(id => loaded.monsters.find(monster => monster.id === id));

  const formationHtml = FormationScreen(loaded);
  assert.equal((formationHtml.match(/data-formation-member="/g) ?? []).length, 4);
  for (let slot = 1; slot <= 4; slot += 1) assert.match(formationHtml, new RegExp(`SLOT ${slot}`));

  const exploreHtml = ExploreScreen(loaded);
  assert.equal((exploreHtml.match(/data-explore-monster="/g) ?? []).length, 4);
  for (const monster of party) assert.match(exploreHtml, new RegExp(`data-explore-monster="${monster.id}"`));

  const enemy = createEnemyBattleState(SPECIES.goblin, { speciesId: "goblin", level: 10, boss: false }, 9);
  enemy.id = "build248-render-enemy";
  const battle = {
    party,
    enemies: [enemy],
    enemy,
    targetEnemyId: enemy.id,
    turn: 1,
    turnQueue: [],
    queueIndex: 0,
    guards: {},
    species: SPECIES,
    log: [],
    auto: false,
    busy: false,
    magicCircleProfiles: {},
    magicCircleArt: {},
    ...createBattleRulesState(party),
  };
  buildTurnQueue(battle);
  const battleHtml = BattleScreen(battle, loaded.inventory, loaded.settings, 9);

  assert.equal((battleHtml.match(/id="ally-/g) ?? []).length, 4);
  for (let slot = 1; slot <= 4; slot += 1) assert.match(battleHtml, new RegExp(`formation-slot-${slot}`));
  party.forEach((monster, index) => {
    assert.match(battleHtml, new RegExp(`id="ally-${monster.id}"`));
    assert.match(battleHtml, new RegExp(`HP ${index + 1}\\/${calculatedStats(monster).hp}`));
    assert.match(battleHtml, new RegExp(`MP ${index + 5}\\/${maxMp(monster)}`));
  });
});
