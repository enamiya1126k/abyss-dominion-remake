import assert from "node:assert/strict";
import fs from "node:fs";
import { RoomStore, sanitizeProfile } from "../online-server/src/RoomStore.js";

const room = fs.readFileSync(new URL("../online-server/src/RoomStore.js", import.meta.url), "utf8");
const screen = fs.readFileSync(new URL("../src/ui/screens/OnlinePartyScreen.js", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.js", import.meta.url), "utf8");

// Shared command order and authored enemy action support.
assert.match(room, /type:"player"/, "round queue should contain players");
assert.match(room, /type:"enemy"/, "round queue should contain enemies");
assert.match(room, /firstStrike/, "equipment first-strike priority should participate in turn ordering");
assert.match(room, /_selectEnemyAction\(/, "authored enemy action selector should be used");
assert.match(room, /cooldowns/, "skill cooldown state should be retained online");
assert.match(room, /damageClass===?"hybrid"|damageClass\s*===\s*"hybrid"/, "hybrid damage class should be supported");

// Equipment, abyss growth and reward parity.
for (const token of [
  'equipmentEffect(actor,"normalDamage"',
  'equipmentEffect(actor,"chainChance"',
  'equipmentEffect(actor,"burnChance"',
  'abyssFactor(actor,"partyDamageRate")',
  'abyssFactor(target,"partyDamageTakenRate")',
  'enemyExperienceReward',
  'battleGoldBase',
  'randomEquipmentRarity',
]) assert.ok(room.includes(token), `missing online parity token: ${token}`);
for (const token of ["partyGoldGain", "partyDropRate", "partyTreasureSense", "abyssSkillEffects", "rewardModifiers"]) {
  assert.ok(screen.includes(token), `profile should transport ${token}`);
}

// Magic circles and delayed time-echo skill behavior.
for (const token of ["slot", "lastLife", "revive", "manaReversal", "endgameNoCrit", "shield", "openingBuff", "turn20", "rage", "weakCrit", "sacrifice", "inheritance", "goldPower", "randomSkill", "soleSurvivor", "deathDrain", "lowHpPower", "deathMirror"]) {
  assert.ok(room.includes(token), `missing online magic-circle effect: ${token}`);
}
assert.match(room, /repeatDelay/, "repeat-delay metadata must survive sanitization");
assert.match(room, /delayedSkillEchoes/, "online delayed skill echoes should be stored and resolved");
assert.match(main, /delayedSkillEchoes/, "offline delayed skill echoes should also be stored and resolved");
assert.match(screen, /repeatDelay/, "client profile should transport repeatDelay");

// Local save side effects: EXP and mastery target the exact participating monster.
const claimStart = main.indexOf("function claimOnlinePartyReward");
const claimEnd = main.indexOf("function exchangeOnlineRaidReward", claimStart);
const claim = main.slice(claimStart, claimEnd);
assert.match(claim, /source\.kind==="battle"&&source\.monsterId/, "battle EXP must be applied to the exact participating monster");
assert.match(claim, /recordSkillUse\(/, "online battle skill use must feed skill mastery");
assert.match(claim, /\["N","R","SR","SSR","UR","LR","神話"\]/, "online random equipment rewards must accept mythic rarity");

// Dynamic sanitization sanity: the fields most likely to regress must survive the network boundary.
const profile = sanitizeProfile({
  displayName: "監査",
  monsterId: "m-1",
  speciesId: "slime",
  battleStats: { hp: 100, mp: 50, atk: 20, matk: 20, def: 10, mdef: 10, spd: 12, crit: 5, accuracy: 100, evasion: 0 },
  equipmentCombatEffects: { normalDamage: 25, chainChance: 10 },
  abyssSkillEffects: { partyDamageRate: .2, partyDamageTakenRate: -.1 },
  rewardModifiers: { partyGoldGain: .3, partyDropRate: .2, partyTreasureSense: .1 },
  skills: [{ id: "echo", name: "残響", type: "attack", power: 1.5, damageClass: "hybrid", repeatDelay: 2 }],
});
assert.equal(profile.skills[0].repeatDelay, 2);
assert.equal(profile.skills[0].damageClass, "hybrid");
assert.equal(profile.equipmentCombatEffects.normalDamage, 25);
assert.equal(profile.abyssSkillEffects.partyDamageRate, .2);
assert.equal(profile.rewardModifiers.partyGoldGain, .3);

const store = new RoomStore({ random: () => .5 });
const normalFactor = store._equipmentDamageFactor({ hp: 100, maxHp: 100, equipmentCombatEffects: { normalDamage: 20 } }, { hp: 100, maxHp: 100, boss: false }, null, { round: 1 });
const bossFactor = store._equipmentDamageFactor({ hp: 100, maxHp: 100, equipmentCombatEffects: { bossDamage: 30 } }, { hp: 100, maxHp: 100, boss: true }, null, { round: 1 });
assert.equal(normalFactor, 1.2);
assert.equal(bossFactor, 1.3);

// Round-end timing parity: delayed echoes and the turn-20 circle resolve at the end of the current round, never one round early.
const timingStore = new RoomStore({ random: () => .5 });
timingStore._broadcast = () => {};
timingStore._broadcastRoom = () => {};
const timingPlayer = { playerId: "p", name: "監査", hp: 100, maxHp: 100, mp: 0, maxMp: 10, guard: false, cooldowns: {}, equipmentCombatEffects: {}, abyssSkillEffects: {}, effects: [], circleEffect: "none" };
const timingEnemy = { id: "e", name: "標的", hp: 100, maxHp: 100, maxMp: 0, currentMp: 0, cooldowns: {}, effects: [], shield: 0 };
const timingBattle = { id: "timing", floor: 1, round: 1, phase: "result", speed: 1, deadlineAt: 0, nextRoundAt: 0, outcome: null, players: { p: timingPlayer }, enemies: [timingEnemy], actions: {}, lastEvents: [], delayedSkillEchoes: [{ dueRound: 2, sourceId: "p", targetId: "e", amount: 10, skillName: "残響" }] };
timingStore._openNextBattleRound({}, timingBattle);
assert.equal(timingBattle.round, 2);
assert.equal(timingEnemy.hp, 100, "repeatDelay must not fire while advancing from round 1 to round 2");
timingBattle.phase = "result";
timingStore._openNextBattleRound({}, timingBattle);
assert.equal(timingEnemy.hp, 90, "repeatDelay must fire at the end of its due round");
assert.equal(timingBattle.round, 3);

const judgmentPlayer = { ...timingPlayer, circleEffect: "turn20", circleJudgmentUsed: false, hp: 100, effects: [], cooldowns: {} };
const judgmentEnemy = { ...timingEnemy, hp: 100, effects: [], cooldowns: {} };
const judgmentBattle = { id: "judgment", floor: 1, round: 19, phase: "result", speed: 1, deadlineAt: 0, nextRoundAt: 0, outcome: null, players: { p: judgmentPlayer }, enemies: [judgmentEnemy], actions: {}, lastEvents: [], delayedSkillEchoes: [] };
timingStore._openNextBattleRound({}, judgmentBattle);
assert.equal(judgmentBattle.round, 20);
assert.equal(judgmentEnemy.hp, 100, "turn-20 judgment must not fire at the end of round 19");
judgmentBattle.phase = "result";
timingStore._openNextBattleRound({}, judgmentBattle);
assert.equal(judgmentEnemy.hp, 0, "turn-20 judgment must fire at the end of round 20");
assert.equal(judgmentBattle.outcome, "victory");

console.log("build223 online combat full parity regression: ok");
