import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { FLOOR_BOSS_CATALOG } from "../src/data/floorBosses.js";
import {
  allLearnedSkills,
  chooseAutoSkill,
  maxMp,
  skillCombatKeywords,
  skillEffectDetails,
  skillMpCostBreakdown,
} from "../src/battle/SkillSystem.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = relative => readFileSync(join(root, relative), "utf8");

function equippedMonster(skills, { hp = 620, mp = 999, level = 3000 } = {}) {
  return {
    id: "build249-healer",
    speciesId: "slime",
    level,
    rank: 1,
    currentHp: hp,
    currentMp: mp,
    _maxHp: 1000,
    _equipmentSkills: skills,
    _equipmentStats: {},
    _equipmentAffixes: {},
    equippedSkills: [...skills.slice(0, 4).map(skill => skill.id), ...Array(4).fill(null)].slice(0, 4),
    skillLoadoutInitialized: true,
    skillProgress: {},
  };
}

const modestGroupHeal = { id: "build249-group-heal", name: "群癒", type: "allHeal", target: "味方全体", heal: .20, mp: 12, mpRate: .32 };
const attack = { id: "build249-attack", name: "攻撃", type: "attack", target: "敵単体", power: 1.2, hits: 1, mp: 0 };
const highLevel = equippedMonster([modestGroupHeal, attack]);
const healCost = skillMpCostBreakdown(highLevel, modestGroupHeal);
assert.equal(healCost.rawRate, .32);
assert.equal(healCost.rate, .14, "20% party recovery must not inherit a 32% enemy-style MP rate");
assert.ok(healCost.final < Math.ceil(maxMp(highLevel) * .20), "small recovery must stay well below the old 20-30% MP drain");

const transferRevive = { id: "build249-transfer", type: "revive", target: "味方単体", revive: .01, reviveMp: .40, reviveTransferRate: .50, mp: 30, mpRate: .62 };
const transferCost = skillMpCostBreakdown(highLevel, transferRevive);
assert.equal(transferCost.rate, .30, "pure transfer revive receives the dedicated recovery cap");
const transferDetails = skillEffectDetails(transferRevive).join(" / ");
assert.match(transferDetails, /現在HPの50%を分け/);
assert.doesNotMatch(transferDetails, /HP1%/);
assert.ok(skillCombatKeywords(transferRevive).includes("HP分与50%"));

const offensiveLeech = { id: "build249-leech", type: "attack", target: "敵全体", power: 1.3, selfHeal: .20, mp: 10, mpRate: .36 };
assert.equal(skillMpCostBreakdown(highLevel, offensiveLeech).rate, .36, "offensive self-heal skills keep their attack MP rate");

const offensiveBoss = FLOOR_BOSS_CATALOG.find(boss => boss.actionIds.slice(0, 4).some(id => Number(boss.actions[id]?.multiplier) > 0 && Number(boss.actions[id]?.selfHeal) > 0));
assert.ok(offensiveBoss, "an offensive self-heal boss fixture is required");
const offensiveAction = offensiveBoss.actionIds.slice(0, 4).map(id => offensiveBoss.actions[id]).find(action => Number(action?.multiplier) > 0 && Number(action?.selfHeal) > 0);
const offensiveContract = allLearnedSkills({ floorBossCatalogId: offensiveBoss.id, speciesId: "slime", level: 9999 }).find(skill => skill.name === offensiveAction.label);
assert.equal(offensiveContract.type, "attack");
assert.ok(offensiveContract.power > 0 && offensiveContract.selfHeal > 0, "contract must retain both damage and post-hit recovery");

const recoveryBoss = FLOOR_BOSS_CATALOG.find(boss => boss.actionIds.slice(0, 4).some(id => !boss.actions[id]?.pattern && !Number(boss.actions[id]?.multiplier) && Number(boss.actions[id]?.selfHeal) > 0));
assert.ok(recoveryBoss, "a pure self-heal boss fixture is required");
const recoveryAction = recoveryBoss.actionIds.slice(0, 4).map(id => recoveryBoss.actions[id]).find(action => !action?.pattern && !Number(action?.multiplier) && Number(action?.selfHeal) > 0);
const recoveryContract = allLearnedSkills({ floorBossCatalogId: recoveryBoss.id, speciesId: "slime", level: 9999 }).find(skill => skill.name === recoveryAction.label);
assert.equal(recoveryContract.type, "selfHeal");
assert.equal(recoveryContract.heal, recoveryAction.selfHeal, "pure self-heal must use the canonical heal field instead of becoming a 1 HP heal");

const autoMonster = equippedMonster([modestGroupHeal, attack], { hp: 620, mp: 999, level: 100 });
const ally = { id: "build249-ally", currentHp: 620, _maxHp: 1000 };
assert.equal(chooseAutoSkill(autoMonster, { party: [autoMonster, ally], cooldowns: {} })?.id, attack.id, "two allies around 60% HP must not spam recovery");
autoMonster.currentHp = 500; ally.currentHp = 500;
assert.equal(chooseAutoSkill(autoMonster, { party: [autoMonster, ally], cooldowns: {} })?.id, modestGroupHeal.id, "two wounded allies at 50% HP should receive group recovery");
autoMonster.currentMp = skillMpCostBreakdown(autoMonster, modestGroupHeal).final;
assert.equal(chooseAutoSkill(autoMonster, { party: [autoMonster, ally], cooldowns: {} })?.id, attack.id, "noncritical recovery must preserve the MP reserve");

const main = source("src/main.js"), rules = source("online-server/src/OfflineDungeonRules.js"), client = source("src/online/OnlinePartyClient.js"), battleScreen = source("src/ui/screens/BattleScreen.js"), index = source("index.html");
assert.match(main, /treasureRoomRateForFloor\(floor\)/);
assert.match(rules, /treasureRoomRateForFloor\(floor\)/);
assert.match(client, /delay: 300, duration: 720/);
assert.match(client, /presentationKoIds/);
assert.match(client, /presentation-ko-playing/);
assert.match(battleScreen, /presentation-ko-pending/);
assert.match(index, /build249\.css\?v=2\.11\.73-build249/);
assert.match(index, /const ASSET_VERSION = "2\.11\.73"/);
assert.match(index, /const ASSET_BUILD = "build249"/);

console.log("build249 recovery/presentation/mimic regression: PASS");
