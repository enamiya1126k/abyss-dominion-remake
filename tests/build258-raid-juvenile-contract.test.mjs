import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
};

const [speciesModule, skillModule, monsterModule, saveModule, visualModule, onlineModule, tradeModule, encounterModule, marketModule, battleRulesModule] = await Promise.all([
  import("../src/data/species.js?build258-raid-juvenile"),
  import("../src/battle/SkillSystem.js?build258-raid-juvenile"),
  import("../src/models/Monster.js?build258-raid-juvenile"),
  import("../src/services/SaveService.js?build258-raid-juvenile"),
  import("../src/ui/MonsterVisual.js?build258-raid-juvenile"),
  import("../src/ui/screens/OnlinePartyScreen.js?build258-raid-juvenile"),
  import("../src/online/OnlineTradeSystem.js?build258-raid-juvenile"),
  import("../src/core/EncounterPoolSystem.js?build258-raid-juvenile"),
  import("../src/core/SecretRoomSystem.js?build258-raid-juvenile"),
  import("../src/battle/BattleRules.js?build258-raid-juvenile"),
]);

const { SPECIES } = speciesModule;
const { allLearnedSkills } = skillModule;
const { createMonster } = monsterModule;
const { SaveService, normalizeRaidJuvenileContract } = saveModule;
const { monsterSpriteUrl, hasMonsterSprite } = visualModule;
const { buildOnlinePartyProfile } = onlineModule;
const { buildOnlineTradeCatalog, reserveOnlineTradeAsset, commitOnlineTrade } = tradeModule;
const { eligibleEncounterSpecies } = encounterModule;
const { isDarkMarketMonsterAllowed } = marketModule;
const { processEnemyStatuses } = battleRulesModule;

const NEW_SKILL_IDS = [
  "juvenile_amalga_melting_claw",
  "juvenile_amalga_scatter_swarm",
  "juvenile_amalga_rehatch",
  "juvenile_amalga_endless_rush",
];

function legacyJuvenile(id = "legacy-amalga") {
  const monster = createMonster("ancient_dragon", { level: 201, nickname: "ユーザー命名の幼体" });
  monster.id = id;
  monster.raidLimited = true;
  monster.weeklyRaidBossId = "abyss-amalga";
  monster.obtainedMethod = "onlineWeeklyRaidExchange";
  monster.customVisualBase = "./assets/online/raid/juvenile-amalga";
  monster.tags = ["dragon", "speed", "raid", "weekly", "abyss-amalga"];
  monster.equippedSkills = allLearnedSkills(monster).slice(0, 4).map(skill => skill.id);
  monster.skillLoadoutInitialized = true;
  monster.skillProgress = Object.fromEntries(monster.equippedSkills.map((skillId, index) => [skillId, {
    level: 2 + index * 2, exp: 11 + index, uses: 21 + index, need: 999,
  }]));
  monster.equipment = { weaponRight: "weapon-sentinel", weaponLeft: null, armorBody: null, armorSupport: null, accessoryNeck: null, accessoryFinger: null };
  monster.history = { adventures: 19, battles: 23, victories: 17, customMemory: "preserve-me" };
  return monster;
}

test("build258 defines the raid hatchling as a mythic, contract-only species with exactly four authored skills", () => {
  const species = SPECIES.juvenile_amalga;
  assert.equal(species.name, "融骸幼体アマルガ");
  assert.equal(species.rarity, "神話");
  assert.equal(species.fieldEncounter, false);
  assert.equal(species.gachaExcluded, true);
  assert.equal(species.captureRate, 0);
  assert.deepEqual(species.authoredSkills.map(skill => skill.id), NEW_SKILL_IDS);
  assert.deepEqual(species.skills.map(skill => skill.id), NEW_SKILL_IDS);

  const monster = createMonster("juvenile_amalga", { level: 201 });
  const skills = allLearnedSkills(monster);
  assert.deepEqual(skills.map(skill => skill.id), NEW_SKILL_IDS);
  assert.deepEqual(skills.map(skill => skill.cooldown), [0, 1, 3, 4]);
  assert.deepEqual(skills.map(skill => skill.mp), [3, 7, 9, 18]);
  assert.equal(skills[1].allEnemies, true);
  assert.deepEqual(skills[1].effects.map(effect => effect.kind), ["accuracyDown", "spdDown"]);
  assert.equal(skills[2].cleanse, true);
  assert.equal(skills[3].hits, 4);
  assert.equal(skills[3].increaseEnemyCooldowns, 1);
  assert.equal(skills[3].status.id, "poison");
  assert.equal(skills[3].status.name, "融骸侵食");
});

test("build258 juvenile erosion uses the shared damage-over-time contract offline", () => {
  const status = SPECIES.juvenile_amalga.authoredSkills[3].status;
  const enemy = { id: "training-enemy", name: "試験体", hp: 1_000, maxHp: 1_000 };
  const battle = { enemies: [enemy], enemyStatuses: { [enemy.id]: [{ ...status }] }, party: [], log: [] };
  const ticks = processEnemyStatuses(battle);
  assert.equal(ticks.length, 1);
  assert.equal(ticks[0].id, "poison");
  assert.equal(ticks[0].damage, 35);
  assert.equal(enemy.hp, 965);
});

test("build258 excludes the hatchling from exploration, summon-compatible pools, and the dark market", () => {
  assert.equal(eligibleEncounterSpecies(SPECIES, 10_000).some(species => species.id === "juvenile_amalga"), false);
  assert.equal(SPECIES.juvenile_amalga.gachaExcluded, true);
  assert.equal(isDarkMarketMonsterAllowed(SPECIES.juvenile_amalga), false);
});

test("build258 strictly migrates only the old raid juvenile and preserves identity, rename, level, gear, and history", () => {
  const monster = legacyJuvenile(), untouched = createMonster("ancient_dragon", { level: 201, nickname: "通常の古龍" });
  const preserved = {
    id: monster.id,
    nickname: monster.nickname,
    level: monster.level,
    equipment: structuredClone(monster.equipment),
    history: structuredClone(monster.history),
    oldSkillIds: [...monster.equippedSkills],
    oldProgress: structuredClone(monster.skillProgress),
  };

  assert.equal(normalizeRaidJuvenileContract(monster), true);
  assert.equal(normalizeRaidJuvenileContract(untouched), false);
  assert.equal(untouched.speciesId, "ancient_dragon");
  assert.equal(monster.speciesId, "juvenile_amalga");
  assert.equal(monster.id, preserved.id);
  assert.equal(monster.nickname, preserved.nickname);
  assert.equal(monster.level, preserved.level);
  assert.deepEqual(monster.equipment, preserved.equipment);
  assert.deepEqual(monster.history, preserved.history);
  assert.deepEqual(monster.equippedSkills, NEW_SKILL_IDS);
  assert.equal(monster.summonTier, "神話");
  assert.equal(monster.summonRarity, "神話");
  assert.equal(monster.raidContractProfileVersion, 1);
  NEW_SKILL_IDS.forEach((skillId, index) => {
    const old = preserved.oldProgress[preserved.oldSkillIds[index]];
    assert.equal(monster.skillProgress[skillId].level, old.level);
    assert.equal(monster.skillProgress[skillId].exp, old.exp);
    assert.equal(monster.skillProgress[skillId].uses, old.uses);
    assert.ok(monster.skillProgress[preserved.oldSkillIds[index]], "legacy mastery history remains available");
  });

  const once = structuredClone(monster);
  normalizeRaidJuvenileContract(monster);
  assert.deepEqual(monster, once, "the targeted migration is idempotent");
});

test("build258 repairs already-renamed hatchlings that still carry foreign skills", () => {
  const monster = createMonster("juvenile_amalga", { level: 201 });
  monster.equippedSkills = ["ancient_dragon__identity_1", "ancient_dragon__identity_2", null, null];
  monster.skillLoadoutInitialized = true;
  monster.skillProgress = { ancient_dragon__identity_1: { level: 7, exp: 44, uses: 55 } };
  monster.raidContractProfileVersion = 1;
  normalizeRaidJuvenileContract(monster);
  assert.deepEqual(monster.equippedSkills, NEW_SKILL_IDS);
  assert.equal(monster.skillProgress[NEW_SKILL_IDS[0]].level, 7);
  assert.equal(monster.skillProgress[NEW_SKILL_IDS[0]].uses, 55);
});

test("build258 SaveService migration records the new codex identity and is stable across a second load", () => {
  storage.clear();
  const service = new SaveService(), state = structuredClone(service.state), monster = legacyJuvenile("save-amalga");
  state.schemaVersion = 58;
  state.monsters.push(monster);
  const migrated = service.migrate(state), first = migrated.monsters.find(entry => entry.id === monster.id);
  assert.equal(first.speciesId, "juvenile_amalga");
  assert.equal(first.level, 201);
  assert.ok(migrated.codex.encounters.juvenile_amalga >= 1);
  assert.ok(migrated.codex.captures.juvenile_amalga >= 1);

  const twice = service.migrate(migrated), second = twice.monsters.find(entry => entry.id === monster.id);
  assert.equal(second.level, 201);
  assert.deepEqual(second.equippedSkills, NEW_SKILL_IDS);
  assert.deepEqual(second.skillProgress, first.skillProgress);
});

test("build258 preserves and bounds juvenile reward claims in the client raid-world save DTO", async () => {
  storage.clear();
  const service = new SaveService(), state = structuredClone(service.state);
  state.onlineParty.raidWorld = {
    campaignId: "weekly-0-abyss-amalga-persist",
    juvenileRewardClaimedBy: Object.fromEntries([
      ["", true],
      ["not-claimed", false],
      ...Array.from({ length: 40 }, (_, index) => [`AD-CLM-${String(index).padStart(4, "0")}`, true]),
    ]),
  };
  const migrated = service.migrate(state), claims = migrated.onlineParty.raidWorld.juvenileRewardClaimedBy;
  assert.equal(Object.keys(claims).length, 32);
  assert.equal(Object.values(claims).every(value => value === true), true);
  assert.equal("" in claims, false);
  assert.equal("not-claimed" in claims, false);
  assert.deepEqual(service.migrate(migrated).onlineParty.raidWorld.juvenileRewardClaimedBy, claims, "a second load keeps the same bounded claim receipts");

  const mainSource = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(mainSource, /function persistOnlineRaidWorld[\s\S]{0,5000}juvenileRewardClaimedBy/);
});

test("build258 sends all four real skills, costs, CT, and effects to online battle profiles", () => {
  const monster = createMonster("juvenile_amalga", { level: 201, nickname: "融骸幼体" });
  normalizeRaidJuvenileContract(monster);
  const state = {
    player: { maxFloor: 201, gold: 1_000 }, inventory: { captureCrystals: 0, abyssKeys: 0 }, settings: {},
    party: [monster.id], monsters: [monster], equipment: [], magicCircles: { unlocked: {}, instances: [], owned: {}, goldSpent: 0 },
  };
  const profile = buildOnlinePartyProfile(state, { monsterId: monster.id, displayName: "テスター" });
  assert.equal(profile.speciesId, "juvenile_amalga");
  assert.equal(profile.summonTier, "神話");
  assert.deepEqual(profile.skills.map(skill => skill.id), NEW_SKILL_IDS);
  assert.deepEqual(profile.skills.map(skill => skill.cooldown), [0, 1, 3, 4]);
  assert.deepEqual(profile.skills.map(skill => skill.mp), [3, 7, 9, 18]);
  assert.deepEqual(profile.skills[1].effects.map(effect => effect.kind), ["accuracyDown", "spdDown"]);
  assert.equal(profile.skills[2].kind, "heal");
  assert.equal(profile.skills[2].cleanse, true);
  assert.equal(profile.skills[3].increaseEnemyCooldowns, 1);
});

test("build258 immediately repairs an old juvenile received through online exchange before persistence", async () => {
  const localA = createMonster("slime", { nickname: "残す仲間" }), localB = createMonster("goblin", { nickname: "渡す仲間" });
  const state = { player: { gold: 0, crystals: 0 }, inventory: { captureCrystals: 0 }, monsters: [localA, localB], party: [], equipment: [], reserveEquipment: [], bossEquipmentVault: [], onlineParty: {} };
  assert.equal(reserveOnlineTradeAsset(state, "trade-juvenile", `monster:${localB.id}`).ok, true);
  const incoming = legacyJuvenile("incoming-amalga"), committed = commitOnlineTrade(state, "trade-juvenile", { kind: "monster", name: incoming.nickname, rarity: "LR", level: incoming.level, details: "+12", payload: incoming });
  assert.equal(committed.ok, true);
  const received = state.monsters.find(monster => monster.id === incoming.id);
  assert.ok(received);
  normalizeRaidJuvenileContract(received); // same helper called by persistOnlineStateMutation
  assert.equal(received.speciesId, "juvenile_amalga");
  assert.deepEqual(received.equippedSkills, NEW_SKILL_IDS);

  const mainSource = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(mainSource, /kind==="tradeCommit"[\s\S]{0,1200}normalizeRaidJuvenileContract\(monster\)/);
});

test("build258 keeps the raid hatchling visible but unavailable in personal trade and rejects direct reservation", () => {
  const juvenile = createMonster("juvenile_amalga", { level: 201 }), other = createMonster("slime", { level: 10 });
  const state = { player: { gold: 0, crystals: 0 }, inventory: { captureCrystals: 0 }, monsters: [juvenile, other], party: [], equipment: [], reserveEquipment: [], bossEquipmentVault: [], onlineParty: {} };
  const entry = buildOnlineTradeCatalog(state).find(asset => asset.ref === `monster:${juvenile.id}`);
  assert.ok(entry);
  assert.equal(entry.unavailable, true);
  assert.equal(entry.reason, "レイド契約個体は個人交換できません");

  const result = reserveOnlineTradeAsset(state, "trade-juvenile-blocked", `monster:${juvenile.id}`);
  assert.equal(result.ok, false);
  assert.equal(result.message, "レイド契約個体は個人交換できません");
  assert.equal(state.monsters.some(monster => monster.id === juvenile.id), true);
  assert.equal(state.onlineParty.tradeEscrow["trade-juvenile-blocked"], undefined);
});

test("build258 uses the dedicated raid art for instances and species-only codex visuals", () => {
  assert.equal(hasMonsterSprite("juvenile_amalga"), true);
  assert.match(monsterSpriteUrl("juvenile_amalga", "idle2"), /^\.\/assets\/online\/raid\/juvenile-amalga-idle2\.png\?v=/);
  assert.match(monsterSpriteUrl({ speciesId: "juvenile_amalga" }, "attack"), /^\.\/assets\/online\/raid\/juvenile-amalga-attack\.png\?v=/);
});
