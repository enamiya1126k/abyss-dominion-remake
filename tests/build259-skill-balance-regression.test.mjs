import test from "node:test";
import assert from "node:assert/strict";

const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
};

const [{ SPECIES }, skills, { FLOOR_BOSS_CATALOG }, { JUVENILE_AMALGA_SKILLS }] = await Promise.all([
  import("../src/data/species.js?build259-balance"),
  import("../src/battle/SkillSystem.js?build259-balance"),
  import("../src/data/floorBosses.js?build259-balance"),
  import("../src/data/raidSpecies.js?build259-balance"),
]);

const {
  allSpeciesSkills,
  allLearnedSkills,
  canonicalSkillId,
  effectiveSkillMpCost,
  recommendedSkills,
} = skills;

const MP_CAP = { N: 18, R: 22, SR: 28, SSR: 34, UR: 40, LR: 48, "神話": 56, SECRET: 36 };
const protectedSpecies = new Set(["myth_enami", "myth_rion", "myth_hide", "myth_yori", "juvenile_amalga"]);
const offensive = skill => Number(skill?.power) > 0 || Number(skill?.currentHpDamage) > 0 || Number(skill?.selfSacrificeHpDamage) > 0;
const recovery = skill => !offensive(skill) && ["allHeal", "selfHeal", "revive", "mpHeal", "cleanse"].includes(skill?.type);

test("build259 gives every ordinary species a unique, ordered, affordable progression", () => {
  for (const species of Object.values(SPECIES)) {
    if (protectedSpecies.has(species.id) || species.isAbyss || species.isTenGod) continue;
    const kit = allSpeciesSkills(species.id);
    assert.ok(kit.length >= 4, `${species.id}: four or more techniques`);
    assert.equal(new Set(kit.map(skill => skill.id)).size, kit.length, `${species.id}: stable unique ids`);
    const unlocks = kit.map(skill => Number(skill.unlock?.value) || 1);
    assert.deepEqual(unlocks, [...unlocks].sort((a, b) => a - b), `${species.id}: ordered unlocks`);
    assert.ok(kit.filter(offensive).length >= 2, `${species.id}: not recovery-only`);
    for (const skill of kit) {
      assert.ok(Number(skill.mp) <= (MP_CAP[species.rarity] ?? 56), `${species.id}/${skill.id}: MP cap`);
      if (Number(skill.revive) > 0 || Number(skill.reviveTransferRate) > 0 || String(skill.tag).includes("奥義")) {
        assert.ok(Number(skill.cooldown) >= 4, `${species.id}/${skill.id}: meaningful CT`);
      }
    }
  }
});

test("build259 recommendations keep offense available and avoid four-heal auto loadouts", () => {
  for (const species of Object.values(SPECIES)) {
    if (protectedSpecies.has(species.id) || species.isAbyss || species.isTenGod) continue;
    const monster = { speciesId: species.id, level: 9999, rank: 4, _equipmentSkills: [] };
    const learned = allLearnedSkills(monster), picked = recommendedSkills(monster, 4);
    if (learned.filter(offensive).length >= 2) assert.ok(picked.filter(offensive).length >= 2, species.id);
    assert.ok(picked.filter(recovery).length <= 2, `${species.id}: recovery cap`);
  }
});

test("build259 floor-boss contracts stay usable even at extreme monster levels", () => {
  const caps = [14, 22, 34, 56];
  for (const boss of FLOOR_BOSS_CATALOG) {
    const monster = { speciesId: "slime", floorBossCatalogId: boss.id, level: 9999, rank: 4 };
    const learned = allLearnedSkills(monster);
    assert.equal(learned.length, 4, boss.id);
    learned.forEach((skill, index) => {
      assert.ok(effectiveSkillMpCost(monster, skill) <= caps[index], `${boss.id}/${skill.id}`);
      assert.ok(Number(skill.cooldown) <= 6, `${boss.id}/${skill.id}: CT ceiling`);
    });
  }
});

test("build259 preserves the mythic raid juvenile authored identity exactly", () => {
  const generated = allSpeciesSkills("juvenile_amalga");
  assert.deepEqual(generated.map(skill => skill.id), JUVENILE_AMALGA_SKILLS.map(skill => skill.id));
  assert.deepEqual(generated.map(skill => skill.name), JUVENILE_AMALGA_SKILLS.map(skill => skill.name));
  assert.deepEqual(generated.map(skill => skill.mp), [3, 7, 9, 18]);
  assert.deepEqual(generated.map(skill => skill.cooldown), [0, 1, 3, 4]);
});

test("build259 canonicalizes legacy skill ids without losing mastery/loadout references", () => {
  const replacement = Object.values(SPECIES)
    .flatMap(species => allSpeciesSkills(species.id))
    .find(skill => Array.isArray(skill.legacySkillIds) && skill.legacySkillIds.length);
  assert.ok(replacement, "at least one authored identity migration exists");
  assert.equal(canonicalSkillId(replacement.legacySkillIds[0]), replacement.id);
});
