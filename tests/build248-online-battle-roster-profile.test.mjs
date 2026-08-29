import test from "node:test";
import assert from "node:assert/strict";

const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
};

const [{ buildOnlinePartyProfile, ONLINE_BATTLE_ROSTER_MAX }, { createMonster }, { calculatedStats }, { maxMp }] = await Promise.all([
  import("../src/ui/screens/OnlinePartyScreen.js?build248-roster-profile-test"),
  import("../src/models/Monster.js?build248-roster-profile-test"),
  import("../src/models/Monster.js?build248-roster-profile-test"),
  import("../src/battle/SkillSystem.js?build248-roster-profile-test"),
]);

function fixture({ longNames = true } = {}) {
  const species = ["slime", "goblin", "cave_rat", "mushroom", "skeleton"];
  const monsters = species.map((speciesId, index) => createMonster(speciesId, {
    level: 10 + index,
    nickname: index === 4 ? (longNames ? "主".repeat(300) : "主力") : `仲間${index + 1}`,
    currentHp: 5 + index,
    currentMp: 2 + index,
  }));
  const primary = monsters[4];
  primary.magicCircleId = "aegis";
  primary.magicCircleInstanceId = "mc:aegis:build248-primary";
  primary.equipment.weaponRight = "build248-primary-weapon";
  primary._equipmentAffixes = { normalDamage: 25 };
  return {
    primary,
    state: {
      player: { maxFloor: 321, gold: 123_456 },
      inventory: { captureCrystals: 12, abyssKeys: 3 },
      settings: {},
      party: monsters.map(monster => monster.id),
      monsters,
      equipment: [{
        id: "build248-primary-weapon",
        name: longNames ? "剣".repeat(300) : "主力の剣",
        rarity: "神話",
        level: 44,
        plus: 7,
      }],
      magicCircles: {
        unlocked: { aegis: true },
        instances: [{
          instanceId: "mc:aegis:build248-primary",
          circleId: "aegis",
          level: 9,
          source: "test",
          createdAt: 0,
        }],
        goldSpent: 0,
      },
    },
  };
}

test("build248 exposes a bounded four-monster battle roster with the selected primary first", () => {
  const { state, primary } = fixture();
  const profile = buildOnlinePartyProfile(state, { monsterId: primary.id, displayName: "冒険者" });

  assert.equal(ONLINE_BATTLE_ROSTER_MAX, 4);
  assert.equal(profile.battleRosterVersion, 1);
  assert.equal(profile.primaryMonsterId, primary.id);
  assert.equal(profile.battleRoster.length, 4);
  assert.equal(profile.battleRoster[0].monsterId, primary.id, "the primary remains available even when it was fifth in party order");
  assert.deepEqual(profile.battleRoster.map(entry => entry.rosterIndex), [0, 1, 2, 3]);
  assert.deepEqual(profile.battleRoster.map(entry => entry.isPrimary), [true, false, false, false]);
  assert.equal(new Set(profile.battleRoster.map(entry => entry.monsterId)).size, 4);
});

test("build248 roster entries preserve each monster's complete online battle payload", () => {
  const { state, primary } = fixture();
  const expectedStats = calculatedStats(primary);
  const expectedMp = maxMp(primary);
  const profile = buildOnlinePartyProfile(state, { monsterId: primary.id, displayName: "冒険者" });
  const entry = profile.battleRoster[0];

  assert.equal(entry.battleStats.hp, expectedStats.hp);
  assert.equal(entry.battleStats.mp, expectedMp);
  assert.equal(entry.currentHp, primary.currentHp);
  assert.equal(entry.currentMp, primary.currentMp);
  assert.ok(Array.isArray(entry.skills));
  assert.equal(entry.equipment.length, 6);
  assert.equal(entry.equipment.find(item => item.slot === "weaponRight")?.level, 44);
  assert.equal(entry.equipmentCombatEffects.normalDamage, 25);
  assert.equal(entry.circleId, "aegis");
  assert.equal(entry.circleLevel, 9);
  assert.equal(entry.monsterName.length, 240, "untrusted save strings are bounded before transport");
  assert.equal(entry.equipment.find(item => item.slot === "weaponRight")?.name.length, 240);
});

test("build248 keeps every legacy primary field while exposing the same primary in battleRoster", () => {
  const { state, primary } = fixture({ longNames: false });
  const profile = buildOnlinePartyProfile(state, { monsterId: primary.id, displayName: "冒険者" });
  const entry = profile.battleRoster[0];

  for (const key of [
    "monsterId", "speciesId", "monsterName", "level", "power", "attribute",
    "circleId", "circleLevel", "equipment", "equipmentAuthorities", "equipmentCombatEffects",
    "abyssSkillEffects", "signatureResonance", "battleStats", "currentHp", "currentMp", "skills",
  ]) assert.deepEqual(profile[key], entry[key], `legacy primary field ${key} must remain authoritative`);

  const empty = buildOnlinePartyProfile({ player: {}, inventory: {}, settings: {}, party: [], monsters: [] });
  assert.equal(empty.monsterId, null);
  assert.equal(empty.primaryMonsterId, null);
  assert.deepEqual(empty.battleRoster, []);
});
