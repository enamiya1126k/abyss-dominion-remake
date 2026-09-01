import { randomBytes } from "node:crypto";

const SIDES = new Set(["sun", "moon", "spectator"]);
const ACTIONS = new Set(["attack", "guard", "skill", "item"]);
const SPEEDS = new Set([0.5, 1, 2]);
const RULESETS = new Set(["standard", "balanced", "blitz"]);
const SERIES = new Set(["bo1", "bo3"]);
const TEAM_MONSTER_LIMIT = 4;
const RANDOM_SKILL_ELEMENTS = Object.freeze(["fire", "water", "lightning", "earth", "wind", "ice", "light", "dark"]);
const COMMAND_MS = 18_000;
const BLITZ_COMMAND_MS = 9_000;
const EFFECT_KINDS = new Set([
  "atkUp", "defUp", "spdUp", "evasionUp", "accuracyUp",
  "atkDown", "defDown", "spdDown", "evasionDown", "accuracyDown",
  "critUp", "critDown", "vulnerable", "regen", "counter", "guard", "taunt", "lifeSteal",
  "magicToPhysical", "guaranteedHit", "guaranteedCritical", "healDown", "reviveSeal", "stun",
]);
const ATTRIBUTES = new Set(["neutral", "fire", "water", "lightning", "earth", "wind", "ice", "light", "dark"]);
const ATTRIBUTE_RELATIONS = Object.freeze({
  neutral: { strong: [], weak: [] },
  fire: { strong: ["ice"], weak: ["water"] },
  water: { strong: ["fire"], weak: ["lightning"] },
  lightning: { strong: ["water"], weak: ["earth"] },
  earth: { strong: ["lightning"], weak: ["wind"] },
  wind: { strong: ["earth"], weak: ["ice"] },
  ice: { strong: ["wind"], weak: ["fire"] },
  light: { strong: ["dark"], weak: ["dark"] },
  dark: { strong: ["light"], weak: ["light"] },
});

const token = (bytes = 10) => randomBytes(bytes).toString("base64url");
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const cleanText = (value, max = 80) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function healthRatio(entity) {
  return Math.max(0, finite(entity?.hp)) / Math.max(1, finite(entity?.maxHp, 1));
}

function entityId(entity) {
  return String(entity?.playerId ?? entity?.id ?? "");
}

function stableHash(value = "") {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function canonicalAttribute(value) {
  const key = String(value ?? "neutral").toLowerCase();
  if (key === "thunder") return "lightning";
  if (key === "poison") return ["dark", "water", "earth", "ice"][stableHash(key) % 4];
  if (key === "nature") return ["wind", "earth", "light", "ice"][stableHash(key) % 4];
  return ATTRIBUTES.has(key) ? key : "neutral";
}

function attributeDamageMultiplier(attacking, defending) {
  const attack = canonicalAttribute(attacking), defense = canonicalAttribute(defending);
  const relation = ATTRIBUTE_RELATIONS[attack] ?? ATTRIBUTE_RELATIONS.neutral;
  if (relation.strong.includes(defense)) return 1.25;
  if (relation.weak.includes(defense)) return 0.8;
  return 1;
}

function skillTargetsAll(skill) {
  return Boolean(skill?.allEnemies);
}

function combatStat(entity, key, fallback = 0) {
  return finite(entity?.stats?.[key], finite(entity?.[key], fallback));
}

function attackStat(actor, skill) {
  const rawAttack = combatStat(actor, "atk", 1);
  const rawMagic = combatStat(actor, "matk", rawAttack);
  const conversion = clamp(effectValue(actor, "magicToPhysical"), 0, 1);
  const physical = rawAttack + rawMagic * conversion;
  const magic = rawMagic * (1 - conversion);
  if (skill?.damageClass === "magic") return Math.max(1, magic);
  if (skill?.damageClass === "hybrid") return Math.max(1, physical, magic);
  return Math.max(1, physical);
}

function defenseStat(target, skill) {
  if (skill?.damageClass === "magic") return Math.max(0, combatStat(target, "mdef", combatStat(target, "def")));
  if (skill?.damageClass === "hybrid") return Math.max(0, Math.min(combatStat(target, "def"), combatStat(target, "mdef", combatStat(target, "def"))));
  return Math.max(0, combatStat(target, "def"));
}

function estimatedDamage(actor, target, skill = null) {
  if (skill?.fillHpDrain) return Math.max(0, Math.min(finite(target?.hp), finite(actor?.maxHp) - finite(actor?.hp)));
  if (finite(skill?.selfSacrificeHpDamage) > 0) return Math.max(1, Math.floor(finite(actor?.hp) * Math.min(2, finite(skill.selfSacrificeHpDamage))));
  const attack = attackStat(actor, skill) * statFactor(actor, "atkUp", "atkDown");
  const defense = defenseStat(target, skill) * statFactor(target, "defUp", "defDown") * (1 - clamp(skill?.defenseIgnore, 0, .9));
  const power = skill ? Math.max(0.2, finite(skill.power, 1) * Math.max(1, finite(skill.hits, 1))) : 1;
  const area = skillTargetsAll(skill) ? 0.75 : 1;
  const element = skill?.element ?? actor?.element ?? actor?.attribute ?? "neutral";
  const attribute = attributeDamageMultiplier(element, target?.element ?? target?.attribute ?? "neutral");
  const defenseRatio = attack / Math.max(1, attack + defense);
  const maximumHp = Math.max(1, finite(target?.maxHp, target?.hp ?? 1)), currentHp = Math.max(0, finite(target?.hp));
  const execute = finite(skill?.execute) > 0 && healthRatio(target) <= finite(skill.execute) ? 2 : 1;
  const critical = skill?.guaranteedCritical || hasActiveEffect(actor, "guaranteedCritical") ? 1.45 : 1;
  const vulnerable = 1 + Math.min(2, effectValue(target, "vulnerable"));
  const raw = Math.max(1, Math.round(maximumHp * defenseRatio * 0.48 * power * area * attribute * execute * critical * vulnerable));
  let direct = Math.min(currentHp, Math.min(raw, Math.max(1, Math.ceil(maximumHp * (skill ? .55 : .38)))));
  if (target?.guard) direct = Math.max(1, Math.round(direct * .42));
  const guardEffect = Math.min(.9, effectValue(target, "guard"));
  if (guardEffect > 0) direct = Math.max(1, Math.round(direct * (1 - guardEffect)));
  const remaining = Math.max(0, currentHp - direct), percentRate = Math.min(.25, Math.max(0, finite(skill?.currentHpDamage)));
  const percent = percentRate > 0 && remaining > 0 ? Math.max(1, Math.floor(remaining * percentRate)) : 0;
  return Math.min(currentHp, direct + percent);
}

function threatScore(target, enemies) {
  const threat = enemy => Math.max(1, combatStat(enemy, "atk") + combatStat(enemy, "matk") + combatStat(enemy, "spd") * 0.55);
  const raw = threat(target), maximum = Math.max(1, ...enemies.map(threat));
  return raw / maximum + (healthRatio(target) <= 0.25 ? 0.2 : 0);
}

function bestBasicTarget(actor, enemies) {
  return [...enemies].sort((left, right) => {
    const leftDamage = estimatedDamage(actor, left), rightDamage = estimatedDamage(actor, right);
    const leftKill = leftDamage >= finite(left.hp) ? 1 : 0, rightKill = rightDamage >= finite(right.hp) ? 1 : 0;
    if (leftKill !== rightKill) return rightKill - leftKill;
    const leftValue = Math.min(finite(left.hp), leftDamage) * (1 + threatScore(left, enemies) * 0.35);
    const rightValue = Math.min(finite(right.hp), rightDamage) * (1 + threatScore(right, enemies) * 0.35);
    return rightValue - leftValue || finite(left.hp) - finite(right.hp) || entityId(left).localeCompare(entityId(right));
  })[0] ?? null;
}

function bestAttackSkill(actor, enemies, skills) {
  const candidates = [];
  for (const skill of skills.filter(entry => entry?.kind === "attack")) {
    for (const target of enemies) {
      const affected = skillTargetsAll(skill) ? enemies : [target];
      const outcomes = affected.map(enemy => ({ enemy, damage: estimatedDamage(actor, enemy, skill) }));
      const kills = outcomes.filter(outcome => outcome.damage >= finite(outcome.enemy.hp)).length;
      if (finite(skill.selfSacrificeHpDamage) > 0 && kills === 0) continue;
      const effective = outcomes.reduce((sum, outcome) => sum + Math.min(finite(outcome.enemy.hp), outcome.damage) * (1 + threatScore(outcome.enemy, enemies) * 0.35), 0);
      const cost = Math.max(0, finite(skill.mp)), maximumMp = Math.max(1, finite(actor.maxMp, actor.mp ?? 1));
      const score = (effective + kills * Math.max(1, ...outcomes.map(outcome => finite(outcome.enemy.maxHp, outcome.enemy.hp))) * 0.22) / (1 + cost / maximumMp * 0.45);
      candidates.push({ skill, target, outcomes, kills, score });
      if (skillTargetsAll(skill)) break;
    }
  }
  return candidates.sort((left, right) => right.score - left.score || finite(left.skill.mp) - finite(right.skill.mp) || entityId(left.target).localeCompare(entityId(right.target)) || String(left.skill.id).localeCompare(String(right.skill.id)))[0] ?? null;
}

function plannedTeamRecovery(battle, side, currentActor = null) {
  const players = Object.values(battle?.players ?? {}), allies = players.filter(player => player.side === side);
  const projectedHp = new Map(allies.map(ally => [ally.playerId, finite(ally.hp)]));
  const initiallyLiving = new Set(allies.filter(ally => finite(ally.hp) > 0).map(ally => ally.playerId));
  const revivedBeforeCurrent = new Set();
  const actionOrder = teamActionOrder(battle), orderIndex = new Map(actionOrder.map((actor, index) => [actor.playerId, index]));
  const currentIndex = orderIndex.get(currentActor?.playerId) ?? Number.POSITIVE_INFINITY;
  const plannedActions = actionOrder.map(actor => ({ actor, planned: battle?.actions?.[actor.playerId] }))
    .filter(entry => entry.planned && entry.actor.side === side && (orderIndex.get(entry.actor.playerId) ?? Number.POSITIVE_INFINITY) < currentIndex);
  const projected = ally => projectedHp.get(ally.playerId) ?? finite(ally.hp);
  const recoveryFactor = ally => Math.max(.05, 1 - Math.min(.95, effectValue(ally, "healDown")));
  const recover = (ally, amount) => projectedHp.set(ally.playerId, Math.min(finite(ally.maxHp, 1), projected(ally) + Math.ceil(Math.max(0, amount) * recoveryFactor(ally))));
  const revive = (plannedActor, plannedSkill, requestedTarget, beforeCurrent) => {
    const fallen = requestedTarget && projected(requestedTarget) <= 0 && effectValue(requestedTarget, "reviveSeal") <= 0
      ? requestedTarget
      : allies.find(ally => projected(ally) <= 0 && effectValue(ally, "reviveSeal") <= 0);
    if (!fallen) return;
    const transferRate = clamp(plannedSkill.reviveTransferRate, 0, .9);
    if (transferRate > 0) {
      const available = Math.max(0, projected(plannedActor) - 1);
      const transferred = Math.min(available, Math.max(1, Math.floor(projected(plannedActor) * transferRate)));
      if (transferred <= 0) return;
      projectedHp.set(plannedActor.playerId, Math.max(1, projected(plannedActor) - transferred));
      projectedHp.set(fallen.playerId, Math.max(1, Math.min(finite(fallen.maxHp, 1), transferred)));
    } else {
      projectedHp.set(fallen.playerId, Math.max(1, Math.ceil(finite(fallen.maxHp, 1) * Math.max(.2, finite(plannedSkill.revive, finite(plannedSkill.heal, .35))))));
    }
    if (beforeCurrent && projected(fallen) > 0) revivedBeforeCurrent.add(fallen.playerId);
  };
  for (const { actor: plannedActor, planned } of plannedActions) {
    const target = allies.find(ally => ally.playerId === planned?.targetId);
    const beforeCurrent = (orderIndex.get(plannedActor.playerId) ?? Number.POSITIVE_INFINITY) < currentIndex;
    if (planned?.kind === "item") {
      if (target && projected(target) > 0) recover(target, Math.ceil(finite(target.maxHp, 1) * .35 * finite(battle?.healingMultiplier, 1)));
      continue;
    }
    if (planned?.kind !== "skill") continue;
    const plannedSkill = plannedActor.skills?.find(skill => skill.id === planned.skillId);
    if (plannedSkill?.kind === "revive") {
      revive(plannedActor, plannedSkill, target, beforeCurrent);
    } else if (["heal", "allHeal"].includes(plannedSkill?.kind)) {
      const targets = plannedSkill.kind === "allHeal" || plannedSkill.allAllies ? allies.filter(ally => projected(ally) > 0) : [target].filter(ally => ally && projected(ally) > 0);
      for (const ally of targets) recover(ally, Math.ceil(finite(ally.maxHp, 1) * Math.max(.12, finite(plannedSkill.heal, .25)) * finite(battle?.healingMultiplier, 1)));
      if (finite(plannedSkill.revive) > 0 || finite(plannedSkill.reviveTransferRate) > 0) revive(plannedActor, plannedSkill, target, beforeCurrent);
    }
  }
  return { projectedHp, targetableLivingIds: new Set([...initiallyLiving, ...revivedBeforeCurrent]) };
}

function chooseAutoSupport(actor, allies, usable, planning = {}) {
  const projectedAllies = allies.map(ally => ({ ...ally, hp: planning.projectedHp?.get(ally.playerId) ?? ally.hp }));
  const targetableLivingIds = planning.targetableLivingIds ?? new Set(allies.filter(ally => finite(ally.hp) > 0).map(ally => ally.playerId));
  const living = projectedAllies.filter(ally => finite(ally.hp) > 0 && targetableLivingIds.has(ally.playerId));
  const fallen = projectedAllies.filter(ally => finite(ally.hp) <= 0 && effectValue(ally, "reviveSeal") <= 0);
  if (fallen.length) {
    const skill = usable.filter(entry => entry.kind === "revive" || finite(entry.revive) > 0 || finite(entry.reviveTransferRate) > 0)
      .sort((left, right) => finite(left.mp) - finite(right.mp) || String(left.id).localeCompare(String(right.id)))[0];
    const target = [...fallen].sort((left, right) => finite(right.maxHp) - finite(left.maxHp) || entityId(left).localeCompare(entityId(right)))[0];
    if (skill && target) return { skill, target };
  }
  if (!living.length) return null;
  const critical = living.some(ally => healthRatio(ally) <= 0.32);
  const wounded = living.filter(ally => healthRatio(ally) <= 0.52).length;
  const lowest = [...living].sort((left, right) => healthRatio(left) - healthRatio(right) || entityId(left).localeCompare(entityId(right)))[0];
  const reserve = Math.max(0, finite(actor.maxMp)) * 0.20;
  const candidates = usable.filter(skill => ["heal", "allHeal"].includes(skill.kind)).map(skill => {
    const targets = skill.kind === "allHeal" || skill.allAllies ? living : [lowest];
    const rate = Math.max(0.01, finite(skill.heal, 0.25));
    const nominal = targets.reduce((sum, target) => sum + Math.max(1, finite(target.maxHp, 1)) * rate, 0);
    const effective = targets.reduce((sum, target) => sum + Math.min(Math.max(0, finite(target.maxHp, 1) - finite(target.hp)), Math.max(1, finite(target.maxHp, 1)) * rate), 0);
    const cost = Math.max(0, finite(skill.mp));
    return { skill, target: targets[0], group: targets.length > 1, effective, utilization: effective / Math.max(1, nominal), efficiency: effective / Math.max(1, cost) };
  }).filter(entry => entry.utilization >= 0.58 && (critical || finite(actor.mp) - finite(entry.skill.mp) >= reserve));
  const groupNeeded = critical || wounded >= 2;
  const choice = candidates.filter(entry => entry.group ? groupNeeded : healthRatio(lowest) <= 0.34)
    .sort((left, right) => right.efficiency - left.efficiency || right.effective - left.effective || finite(left.skill.mp) - finite(right.skill.mp) || String(left.skill.id).localeCompare(String(right.skill.id)))[0];
  return choice ? { skill: choice.skill, target: choice.target } : null;
}

export function chooseTeamAutoAction(battle, actor, now = Date.now()) {
  const action = source => ({ actorId: actor.playerId, skillId: null, targetId: null, submittedAt: now, auto: true, ...source });
  const players = Object.values(battle?.players ?? {});
  const allies = players.filter(player => player.side === actor.side);
  const livingAllies = allies.filter(player => finite(player.hp) > 0);
  const enemies = players.filter(player => player.side !== actor.side && finite(player.hp) > 0);
  const currentMp = Math.max(0, finite(actor.mp)), maximumMp = Math.max(1, finite(actor.maxMp, currentMp || 1));
  const cooldowns = actor.cooldowns ?? {};
  const usable = (actor.skills ?? []).filter(skill => skill && Math.max(0, finite(skill.mp)) <= currentMp && Math.max(0, finite(cooldowns[skill.id])) <= 0);
  if (!enemies.length) return action({ kind: "guard", targetId: actor.playerId });

  const planning = plannedTeamRecovery(battle, actor.side, actor);
  const support = chooseAutoSupport(actor, allies, usable, planning);
  if (support) return action({ kind: "skill", skillId: support.skill.id, targetId: support.target.playerId });
  const projectedLiving = livingAllies.map(ally => ({ ...ally, hp: planning.projectedHp?.get(ally.playerId) ?? ally.hp }));
  const lowest = [...projectedLiving].sort((left, right) => healthRatio(left) - healthRatio(right) || entityId(left).localeCompare(entityId(right)))[0];
  if (lowest && healthRatio(lowest) <= 0.25 && finite(actor.itemCharges) > 0) {
    return action({ kind: "item", targetId: lowest.playerId });
  }

  const mpRecovery = usable.filter(skill => skill.kind === "mpHeal").map(skill => {
    const targets = skill.allAllies ? livingAllies : [[...livingAllies].sort((left, right) => finite(left.mp) / Math.max(1, finite(left.maxMp, 1)) - finite(right.mp) / Math.max(1, finite(right.maxMp, 1)) || entityId(left).localeCompare(entityId(right)))[0]].filter(Boolean);
    const rate = Math.max(.01, finite(skill.mpHeal, .25));
    const nominal = targets.reduce((sum, ally) => sum + finite(ally.maxMp, 1) * rate, 0);
    const effective = targets.reduce((sum, ally) => sum + Math.min(Math.max(0, finite(ally.maxMp) - finite(ally.mp)), finite(ally.maxMp, 1) * rate), 0);
    const target = [...targets].sort((left, right) => finite(left.mp) / Math.max(1, finite(left.maxMp, 1)) - finite(right.mp) / Math.max(1, finite(right.maxMp, 1)) || entityId(left).localeCompare(entityId(right)))[0];
    const cost = Math.max(0, finite(skill.mp));
    return { skill, target, effective, utilization: effective / Math.max(1, nominal), efficiency: effective / Math.max(1, cost) };
  }).filter(entry => entry.target
    && finite(entry.target.mp) / Math.max(1, finite(entry.target.maxMp, 1)) <= .35
    && entry.utilization >= .5
    && (currentMp - finite(entry.skill.mp) >= maximumMp * .20 || finite(entry.target.mp) / Math.max(1, finite(entry.target.maxMp, 1)) <= .20))
    .sort((left, right) => right.efficiency - left.efficiency || right.effective - left.effective || finite(left.skill.mp) - finite(right.skill.mp) || String(left.skill.id).localeCompare(String(right.skill.id)))[0];
  if (mpRecovery) return action({ kind: "skill", skillId: mpRecovery.skill.id, targetId: mpRecovery.target.playerId });

  const turn = Math.max(1, Math.floor(finite(battle?.round, 1)));
  const tacticalWindow = turn === 1 || (turn - 1) % 4 === 0;
  const tactical = tacticalWindow ? usable.filter(skill => skill.kind === "buff" && !skill.cleanse && currentMp - finite(skill.mp) >= maximumMp * .20).filter(skill => {
    const targets = skill.allAllies ? livingAllies : [livingAllies.find(ally => ally.playerId === actor.playerId) ?? actor];
    const effects = (skill.effects ?? []).filter(effect => !effect?.enemy && effect?.kind);
    const effectsUseful = effects.some(effect => {
      const affected = effect.allies ? targets : [livingAllies.find(ally => ally.playerId === actor.playerId) ?? actor];
      return affected.some(ally => !(ally.effects ?? []).some(active => active.kind === effect.kind && finite(active.turns, 1) > 0));
    });
    const shieldUseful = finite(skill.partyShieldRate) > 0 && targets.some(ally => finite(ally.shield) < Math.ceil(finite(ally.maxHp, 1) * finite(skill.partyShieldRate)));
    return effectsUseful || shieldUseful || finite(skill.selfShieldRate) > 0 && finite(actor.shield) < Math.ceil(finite(actor.maxHp, 1) * finite(skill.selfShieldRate));
  }).sort((left, right) => finite(right.partyShieldRate) - finite(left.partyShieldRate) || finite(left.mp) - finite(right.mp) || String(left.id).localeCompare(String(right.id)))[0] : null;
  if (tactical) return action({ kind: "skill", skillId: tactical.id, targetId: actor.playerId });

  const basicTarget = bestBasicTarget(actor, enemies), basicDamage = basicTarget ? estimatedDamage(actor, basicTarget) : 0;
  const attack = bestAttackSkill(actor, enemies, usable);
  const projectedActor = projectedLiving.find(ally => ally.playerId === actor.playerId) ?? actor;
  const partyCritical = projectedLiving.some(ally => healthRatio(ally) <= 0.32), selfCritical = healthRatio(projectedActor) <= 0.28;
  if (attack) {
    const basicValue = basicTarget ? Math.min(finite(basicTarget.hp), basicDamage) * (1 + threatScore(basicTarget, enemies) * 0.35) : 0;
    const targetOutcome = attack.outcomes.find(outcome => outcome.enemy === attack.target) ?? attack.outcomes[0];
    const skillSecuresKill = attack.kills > 0 && !(basicTarget && basicDamage >= finite(basicTarget.hp));
    const areaAdvantage = skillTargetsAll(attack.skill) && enemies.length >= 2;
    const favorable = attributeDamageMultiplier(attack.skill.element ?? actor.element ?? actor.attribute, attack.target?.element ?? attack.target?.attribute) > attributeDamageMultiplier(actor.element ?? actor.attribute, attack.target?.element ?? attack.target?.attribute);
    const leavesReserve = currentMp - finite(attack.skill.mp) >= maximumMp * 0.20;
    const worthwhile = attack.score >= Math.max(1, basicValue) * 1.15 || skillSecuresKill || areaAdvantage || favorable;
    const avoidsWaste = !(targetOutcome && basicDamage >= finite(attack.target.hp) && finite(attack.skill.mp) > 0);
    if (worthwhile && avoidsWaste && (leavesReserve || skillSecuresKill || partyCritical)) {
      return action({ kind: "skill", skillId: attack.skill.id, targetId: attack.target.playerId });
    }
  }

  if (selfCritical && basicTarget && basicDamage < finite(basicTarget.hp)) {
    const guardSkill = usable.filter(skill => skill.kind === "guard")
      .sort((left, right) => finite(left.mp) - finite(right.mp) || String(left.id).localeCompare(String(right.id)))[0];
    if (guardSkill) return action({ kind: "skill", skillId: guardSkill.id, targetId: actor.playerId });
    if (finite(actor.itemCharges) > 0 && healthRatio(projectedActor) <= 0.25) return action({ kind: "item", targetId: actor.playerId });
    return action({ kind: "guard", targetId: actor.playerId });
  }
  return action({ kind: "attack", targetId: basicTarget?.playerId ?? enemies[0].playerId });
}

function normalizedSettings(source = {}) {
  return {
    ruleset: RULESETS.has(source?.ruleset) ? source.ruleset : "standard",
    series: SERIES.has(source?.series) ? source.series : "bo1",
  };
}

function targetWinsFor(series) {
  return series === "bo3" ? 2 : 1;
}

function statPower(stats = {}) {
  const offense = Math.max(1, (Number(stats.atk) || 1) + (Number(stats.matk) || 1));
  const defense = Math.max(1, (Number(stats.def) || 0) + (Number(stats.mdef) || 0));
  return Math.max(1, Math.sqrt(Math.max(1, Number(stats.hp) || 1)) * Math.sqrt(offense * defense) * Math.max(1, Math.sqrt(Number(stats.spd) || 1)));
}

function balancedStats(stats, profile, combatants, sideCounts, side) {
  const powers = combatants.map(entry => Math.max(1, Number(entry.profile?.power) || statPower(entry.profile?.battleStats)));
  const averagePower = powers.reduce((sum, value) => sum + value, 0) / Math.max(1, powers.length);
  const ownPower = Math.max(1, Number(profile?.power) || statPower(stats));
  const buildScale = clamp(Math.sqrt(averagePower / ownPower), 0.65, 1.6);
  const ownCount = Math.max(1, sideCounts[side] || 1);
  const enemyCount = Math.max(1, sideCounts[side === "sun" ? "moon" : "sun"] || 1);
  const numberAdvantage = Math.max(1, enemyCount / ownCount);
  const enduranceScale = clamp(buildScale * numberAdvantage, 0.65, 3);
  const combatScale = clamp(buildScale * Math.sqrt(numberAdvantage), 0.65, 2.1);
  return {
    hp: Math.max(1, Math.round(stats.hp * enduranceScale)),
    mp: Math.max(0, Math.round(stats.mp * clamp(buildScale, 0.8, 1.4))),
    atk: Math.max(1, Math.round(stats.atk * combatScale)),
    matk: Math.max(1, Math.round(stats.matk * combatScale)),
    def: Math.max(0, Math.round(stats.def * combatScale)),
    mdef: Math.max(0, Math.round(stats.mdef * combatScale)),
    spd: Math.max(1, Math.round(stats.spd * clamp(Math.sqrt(buildScale), 0.82, 1.24))),
    crit: stats.crit,
    evasion: stats.evasion,
    accuracy: stats.accuracy,
  };
}

function profileRoster(profile = {}) {
  const supplied = Array.isArray(profile.battleRoster) ? profile.battleRoster.filter(entry => entry && typeof entry === "object") : [];
  return (supplied.length ? supplied : [profile]).slice(0, TEAM_MONSTER_LIMIT);
}

function allocateTeamRoster(members) {
  const allocations = members.slice(0, TEAM_MONSTER_LIMIT).map((member, sourceIndex) => ({
    member,
    sourceIndex,
    side: member.teamSide,
    entries: profileRoster(member.profile),
    count: 1,
  }));
  let remaining = Math.max(0, TEAM_MONSTER_LIMIT - allocations.length);
  while (remaining > 0) {
    const sideCount = side => allocations.filter(allocation => allocation.side === side).reduce((sum, allocation) => sum + allocation.count, 0);
    const eligible = allocations.filter(allocation => sideCount(allocation.side) < 2 && allocation.count < allocation.entries.length);
    if (!eligible.length) break;
    eligible.sort((left, right) => sideCount(left.side) - sideCount(right.side)
      || left.count - right.count
      || left.sourceIndex - right.sourceIndex);
    eligible[0].count += 1;
    remaining -= 1;
  }
  return allocations.flatMap(allocation => allocation.entries.slice(0, allocation.count).map((profile, order) => ({
    member: allocation.member,
    profile,
    side: allocation.side,
    rosterOrder: order,
  })));
}

function initialEffects(circleEffect) {
  return circleEffect === "openingBuff" ? [{ kind: "atkUp", value: .2, turns: 999 }, { kind: "critUp", value: .2, turns: 999 }] : [];
}

function resetPlayerForGame(player) {
  const initial = player.initial;
  player.hp = initial.maxHp;
  player.maxHp = initial.maxHp;
  player.mp = initial.maxMp;
  player.maxMp = initial.maxMp;
  player.shield = initial.shield;
  player.guard = false;
  player.itemCharges = 1;
  player.cooldowns = {};
  player.effects = initialEffects(player.circleEffect);
  player.circleLastLifeUsed = false;
  player.circleReviveUsed = false;
}

function emptyMetrics() {
  return { damage: 0, healing: 0, damageTaken: 0, guards: 0, support: 0, kos: 0 };
}

function scoreFor(metrics = {}) {
  return Math.max(0, Math.round((metrics.damage || 0) + (metrics.healing || 0) * .7 + (metrics.support || 0) * 250 + (metrics.kos || 0) * 1000));
}

function resultSummary(battle) {
  const monsters = Object.values(battle.players).map(player => {
    const metrics = { ...emptyMetrics(), ...(player.metrics ?? {}) };
    return {
      playerId: player.ownerPlayerId,
      combatantId: player.playerId,
      monsterId: player.monsterId ?? null,
      name: player.name,
      monsterName: player.monsterName,
      side: player.side,
      score: scoreFor(metrics),
      ...metrics,
    };
  }).sort((left, right) => right.score - left.score || right.damage - left.damage || left.combatantId.localeCompare(right.combatantId));
  const aggregate = new Map();
  for (const monster of monsters) {
    const row = aggregate.get(monster.playerId) ?? { playerId: monster.playerId, name: monster.name, side: monster.side, monsterName: monster.monsterName, ...emptyMetrics() };
    for (const key of Object.keys(emptyMetrics())) row[key] += monster[key] || 0;
    aggregate.set(monster.playerId, row);
  }
  const rows = [...aggregate.values()].map(row => ({ ...row, score: scoreFor(row) }))
    .sort((left, right) => right.score - left.score || right.damage - left.damage || left.playerId.localeCompare(right.playerId));
  return {
    resultId: `team:${battle.id}`,
    winner: battle.winner ?? null,
    outcome: battle.outcome ?? null,
    ruleset: battle.ruleset,
    series: battle.series,
    format: battle.format,
    playerFormat: battle.playerFormat,
    score: { ...battle.score },
    games: (battle.games ?? []).map(game => ({ ...game, score: { ...game.score } })),
    mvpPlayerId: rows[0]?.playerId ?? null,
    mvpCombatantId: monsters[0]?.combatantId ?? null,
    ranking: rows.map((entry, index) => ({ ...entry, rank: index + 1 })),
    monsterRanking: monsters.map((entry, index) => ({ ...entry, rank: index + 1 })),
  };
}

function effectValue(entity, kind) {
  return (entity?.effects ?? [])
    .filter(effect => effect.kind === kind && effect.turns > 0)
    .reduce((best, effect) => Math.max(best, Number(effect.value) || 0), 0);
}

function hasActiveEffect(entity, kind) {
  return (entity?.effects ?? []).some(effect => effect.kind === kind && effect.turns > 0);
}

const INCAPACITATING_EFFECT_KINDS = new Set(["stun", "status:stun", "status:freeze", "status:sleep", "status:paralysis", "status:charm", "status:confusion"]);

function addEffect(entity, effect) {
  const kind = String(effect?.kind ?? "");
  if (!entity || !EFFECT_KINDS.has(kind) && !kind.startsWith("status:")) return;
  entity.effects ??= [];
  const current = entity.effects.find(entry => entry.kind === kind);
  if (current) {
    current.value = Math.max(current.value, clamp(effect.value, 0, 3));
    current.turns = Math.max(current.turns, Math.round(clamp(effect.turns, 1, 20)));
    if (effect.name) current.name = cleanText(effect.name, 60);
    if (effect.sourcePlayerId) current.sourcePlayerId = cleanText(effect.sourcePlayerId, 80);
    if (effect.sourceOwnerId) current.sourceOwnerId = cleanText(effect.sourceOwnerId, 80);
    if (INCAPACITATING_EFFECT_KINDS.has(kind)) current.actionBlockPending = true;
  } else {
    entity.effects.push({
      kind,
      value: clamp(effect.value, 0, 3),
      turns: Math.round(clamp(effect.turns, 1, 20)),
      ...(effect.name ? { name: cleanText(effect.name, 60) } : {}),
      ...(effect.sourcePlayerId ? { sourcePlayerId: cleanText(effect.sourcePlayerId, 80) } : {}),
      ...(effect.sourceOwnerId ? { sourceOwnerId: cleanText(effect.sourceOwnerId, 80) } : {}),
      ...(INCAPACITATING_EFFECT_KINDS.has(kind) ? { actionBlockPending: true } : {}),
    });
  }
}

const NEGATIVE_EFFECT_KINDS = new Set([
  "atkDown", "defDown", "spdDown", "evasionDown", "accuracyDown", "critDown", "vulnerable", "healDown", "reviveSeal", "stun",
]);

function cleanseEffects(entity) {
  if (!entity) return 0;
  const before = (entity.effects ?? []).length;
  entity.effects = (entity.effects ?? []).filter(effect => !NEGATIVE_EFFECT_KINDS.has(effect.kind) && !String(effect.kind).startsWith("status:"));
  return before - entity.effects.length;
}

function isIncapacitated(entity) {
  const effect = (entity?.effects ?? []).find(entry => entry.turns > 0 && INCAPACITATING_EFFECT_KINDS.has(String(entry.kind)));
  if (!effect) return false;
  effect.actionBlockPending = false;
  return true;
}

function applySkillStatus(target, skill, random, source = null) {
  const status = skill?.status;
  if (!target || !status || random() >= clamp(status.chance, 0, 1)) return false;
  addEffect(target, {
    kind: `status:${cleanText(status.id, 40) || "status"}`,
    name: status.name,
    value: clamp(status.power, 0, 3),
    turns: Math.round(clamp(status.turns, 1, 20)),
    sourcePlayerId: source?.playerId,
    sourceOwnerId: source?.ownerPlayerId,
  });
  return true;
}

function tickEffects(entity) {
  entity.effects = (entity.effects ?? [])
    .map(effect => INCAPACITATING_EFFECT_KINDS.has(String(effect.kind)) && effect.actionBlockPending
      ? { ...effect }
      : { ...effect, turns: effect.turns - 1 })
    .filter(effect => effect.turns > 0);
}

function statFactor(entity, up, down) {
  return Math.max(0.2, 1 + effectValue(entity, up) - effectValue(entity, down));
}

function teamActionOrder(battle) {
  return Object.values(battle?.players ?? {})
    .map((player, index) => ({ player, index, speed: finite(player?.stats?.spd) * statFactor(player, "spdUp", "spdDown") }))
    .filter(entry => entry.player.hp > 0)
    .sort((left, right) => right.speed - left.speed || left.index - right.index)
    .map(entry => entry.player);
}

function effectiveEvasion(entity) {
  return clamp((entity?.stats?.evasion ?? 0) * statFactor(entity, "evasionUp", "evasionDown"), 0, 75);
}

function hitLands(attacker, target, random, guaranteed = false) {
  if (guaranteed) return true;
  const accuracy = clamp((attacker?.stats?.accuracy ?? 100) * statFactor(attacker, "accuracyUp", "accuracyDown"), 20, 180);
  const dodge = clamp(effectiveEvasion(target) - (accuracy - 100) * 0.5, 0, 75);
  return random() < clamp(1 - dodge / 100, 0.08, 0.98);
}

function circleDamageFactor(actor, round = 1, aliveCount = 2) {
  const effect = actor?.circleEffect ?? "none", missing = 1 - actor.hp / Math.max(1, actor.maxHp), level = Math.max(0, Number(actor?.circleLevel) || 0);
  if (effect === "openingBuff") return 1.2;
  if (effect === "manaReversal") return 1.15 + Math.min(.25, level * .004);
  if (effect === "rage") return 1 + missing * .75;
  if (effect === "lowHpPower") return 1 + missing * 1.15;
  if (effect === "goldPower") return 1.12 + Math.min(.3, level * .004);
  if (effect === "soleSurvivor" && aliveCount === 1) return 1.65;
  if (effect === "slot") { const seed = [...`${actor.playerId}:${round}`].reduce((sum, char) => Math.imul(sum ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261), roll = seed % 1000; return roll === 0 ? 0 : .5 + roll / 400; }
  return 1;
}

function publicPlayer(player) {
  const { stats, initial, skills, ...safe } = player;
  return {
    ...safe,
    cooldowns: { ...(safe.cooldowns ?? {}) },
    skills: (skills ?? []).map(skill => ({
      ...skill,
      cooldown: Math.max(0, Math.floor(Number(skill.cooldown) || 0)),
      effects: (skill.effects ?? []).map(effect => ({ ...effect })),
      revivedEffects: (skill.revivedEffects ?? []).map(effect => ({ ...effect })),
      status: skill.status ? { ...skill.status } : null,
    })),
    effects: (safe.effects ?? []).map(effect => ({ ...effect })),
  };
}

export function teamBattleSnapshot(battle) {
  if (!battle) return null;
  return {
    id: battle.id,
    round: battle.round,
    phase: battle.phase,
    speed: battle.speed,
    deadlineAt: battle.deadlineAt,
    nextRoundAt: battle.nextRoundAt,
    outcome: battle.outcome,
    winner: battle.winner,
    format: battle.format,
    playerFormat: battle.playerFormat,
    teamMonsterLimit: TEAM_MONSTER_LIMIT,
    ruleset: battle.ruleset,
    series: battle.series,
    game: battle.game,
    targetWins: battle.targetWins,
    score: { ...(battle.score ?? { sun: 0, moon: 0 }) },
    betweenGames: Boolean(battle.betweenGames),
    gameWinner: battle.gameWinner ?? null,
    games: (battle.games ?? []).map(game => ({ ...game, score: { ...game.score } })),
    summary: battle.summary ? {
      ...battle.summary,
      score: { ...(battle.summary.score ?? {}) },
      games: (battle.summary.games ?? []).map(game => ({ ...game, score: { ...(game.score ?? {}) } })),
      ranking: (battle.summary.ranking ?? []).map(entry => ({ ...entry })),
      monsterRanking: (battle.summary.monsterRanking ?? []).map(entry => ({ ...entry })),
    } : null,
    focusTarget: battle.focusTarget ? { ...battle.focusTarget } : null,
    cheeredBy: [...(battle.cheeredBy ?? [])],
    autoPlayers: [...(battle.autoPlayers ?? [])],
    players: Object.values(battle.players).map(publicPlayer),
    actions: Object.fromEntries(Object.entries(battle.actions).map(([id, action]) => [id, {
      kind: action.kind,
      skillId: action.skillId ?? null,
      targetId: action.targetId ?? null,
      actorId: action.actorId ?? id,
      auto: Boolean(action.auto),
    }])),
    lastEvents: (battle.lastEvents ?? []).map(event => ({ ...event })),
  };
}

export class TeamBattleCoordinator {
  constructor({ now = () => Date.now(), random = Math.random, sessions, broadcast = () => {} } = {}) {
    this.now = now;
    this.random = random;
    this.sessions = sessions;
    this.broadcast = broadcast;
  }

  settings(room) {
    if (!room) return normalizedSettings();
    room.teamSettings = normalizedSettings(room.teamSettings);
    return { ...room.teamSettings };
  }

  setSettings(room, session, source = {}) {
    if (!room) return { ok: false, code: "NOT_IN_ROOM", message: "部屋に参加していません" };
    if (room.leaderId !== session.playerId) return { ok: false, code: "LEADER_ONLY", message: "対戦ルールを変更できるのはリーダーだけです" };
    if (room.phase !== "lobby") return { ok: false, code: "ROOM_BUSY", message: "ロビーでのみ対戦ルールを変更できます" };
    const requestedRuleset = cleanText(source.ruleset, 20), requestedSeries = cleanText(source.series, 20);
    if (requestedRuleset && !RULESETS.has(requestedRuleset)) return { ok: false, code: "BAD_TEAM_RULESET", message: "その対戦ルールは使用できません" };
    if (requestedSeries && !SERIES.has(requestedSeries)) return { ok: false, code: "BAD_TEAM_SERIES", message: "その勝敗形式は使用できません" };
    const current = this.settings(room);
    room.teamSettings = normalizedSettings({ ruleset: requestedRuleset || current.ruleset, series: requestedSeries || current.series });
    for (const id of room.members) {
      const member = this.sessions.get(id);
      if (member) member.teamReady = false;
    }
    this.broadcast(room, { type: "roomRefresh" });
    return { ok: true, settings: this.settings(room) };
  }

  swapSides(room, session) {
    if (!room) return { ok: false, code: "NOT_IN_ROOM", message: "部屋に参加していません" };
    if (room.leaderId !== session.playerId) return { ok: false, code: "LEADER_ONLY", message: "チームを入れ替えられるのはリーダーだけです" };
    if (room.phase !== "lobby") return { ok: false, code: "ROOM_BUSY", message: "ロビーでのみチームを入れ替えられます" };
    let changed = 0;
    for (const id of room.members) {
      const member = this.sessions.get(id);
      if (!member) continue;
      if (member.teamSide === "sun") { member.teamSide = "moon"; changed += 1; }
      else if (member.teamSide === "moon") { member.teamSide = "sun"; changed += 1; }
      member.teamReady = false;
    }
    if (!changed) return { ok: false, code: "NO_TEAM_PLAYERS", message: "入れ替える対戦参加者がいません" };
    this.broadcast(room, { type: "roomRefresh" });
    return { ok: true, swapped: changed };
  }

  setSide(room, session, side) {
    if (!room) return { ok: false, code: "NOT_IN_ROOM", message: "部屋に参加していません" };
    if (room.phase !== "lobby") return { ok: false, code: "ROOM_BUSY", message: "別の共闘コンテンツを終了してください" };
    const next = SIDES.has(side) ? side : "spectator";
    session.teamSide = next;
    session.teamReady = false;
    this.broadcast(room, { type: "roomRefresh" });
    return { ok: true, side: next };
  }

  setReady(room, session, ready) {
    if (!room) return { ok: false, code: "NOT_IN_ROOM", message: "部屋に参加していません" };
    if (room.phase !== "lobby") return { ok: false, code: "ROOM_BUSY", message: "別の共闘コンテンツを終了してください" };
    if (!["sun", "moon"].includes(session.teamSide)) return { ok: false, code: "TEAM_REQUIRED", message: "紅組か蒼組を選んでください" };
    session.teamReady = Boolean(ready);
    this.broadcast(room, { type: "roomRefresh" });
    return { ok: true };
  }

  start(room, session) {
    if (!room) return { ok: false, code: "NOT_IN_ROOM", message: "部屋に参加していません" };
    if (room.leaderId !== session.playerId) return { ok: false, code: "LEADER_ONLY", message: "チーム戦を開始できるのはリーダーだけです" };
    if (room.phase !== "lobby") return { ok: false, code: "ROOM_BUSY", message: "別の共闘コンテンツを終了してください" };
    const participants = [...room.members]
      .map(id => this.sessions.get(id))
      .filter(member => member && ["sun", "moon"].includes(member.teamSide));
    const sun = participants.filter(member => member.teamSide === "sun");
    const moon = participants.filter(member => member.teamSide === "moon");
    if (participants.length < 2 || !sun.length || !moon.length) return { ok: false, code: "BAD_TEAMS", message: "紅組と蒼組へ1人以上ずつ参加してください" };
    if (participants.length > 4) return { ok: false, code: "TOO_MANY_PLAYERS", message: "参加できるのは最大4人です" };
    if (participants.some(member => !member.connected)) return { ok: false, code: "MEMBER_OFFLINE", message: "再接続待ちの参加者がいます" };
    if (participants.some(member => !member.teamReady)) return { ok: false, code: "NOT_ALL_READY", message: "参加者全員の準備完了を待っています" };

    const settings = this.settings(room);
    const combatants = allocateTeamRoster(participants);
    const sideCounts = {
      sun: combatants.filter(entry => entry.side === "sun").length,
      moon: combatants.filter(entry => entry.side === "moon").length,
    };
    if (combatants.length > TEAM_MONSTER_LIMIT) return { ok: false, code: "TEAM_ROSTER_LIMIT", message: "戦場全体で魔物4体までです" };

    const players = {}, circleEvents = [];
    const memberActorCounts = new Map();
    for (const combatant of combatants) {
      const { member, profile, side } = combatant;
      const memberOrder = memberActorCounts.get(member.playerId) ?? 0;
      memberActorCounts.set(member.playerId, memberOrder + 1);
      const actorId = memberOrder === 0 ? member.playerId : `${member.playerId}:m${memberOrder + 1}`;
      const sourceStats = profile.battleStats ?? member.profile.battleStats;
      const stats = settings.ruleset === "balanced" ? balancedStats(sourceStats, profile, combatants, sideCounts, side) : { ...sourceStats };
      const circleEffect = profile.circleEffect ?? "none";
      const shield = circleEffect === "shield" ? Math.ceil(stats.hp * .5) : 0;
      const rosterIndex = Number.isInteger(Number(profile.rosterIndex)) ? Number(profile.rosterIndex) : memberOrder;
      players[actorId] = {
        playerId: actorId,
        combatantId: actorId,
        ownerPlayerId: member.playerId,
        rosterIndex,
        isPrimary: memberOrder === 0,
        monsterId: cleanText(profile.monsterId, 80) || null,
        name: member.profile.displayName,
        monsterName: profile.monsterName ?? member.profile.monsterName,
        speciesId: profile.speciesId ?? member.profile.speciesId,
        visualSpeciesId: profile.visualSpeciesId ?? member.profile.visualSpeciesId ?? null,
        endgameBossId: profile.endgameBossId ?? null,
        floorBossCatalogId: profile.floorBossCatalogId ?? null,
        fallbackEmoji: profile.fallbackEmoji ?? member.profile.fallbackEmoji,
        level: profile.level ?? member.profile.level ?? 1,
        stars: profile.stars ?? member.profile.stars ?? 1,
        plus: profile.plus ?? member.profile.plus ?? 0,
        power: profile.power ?? 0,
        summonTier: profile.summonTier ?? null,
        summonRarity: profile.summonRarity ?? null,
        endgameFaction: profile.endgameFaction ?? null,
        attribute: profile.attribute ?? profile.element ?? "neutral",
        element: profile.attribute ?? profile.element ?? "neutral",
        side,
        hp: stats.hp,
        maxHp: stats.hp,
        mp: stats.mp,
        maxMp: stats.mp,
        shield,
        guard: false,
        itemCharges: 1,
        cooldowns: {},
        stats: { ...stats },
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        effects: initialEffects(circleEffect),
        circleEffect,
        circleId: profile.circleId ?? "none",
        circleName: profile.circleName || "魔法陣",
        circleLevel: profile.circleLevel ?? 0,
        circleLastLifeUsed: false,
        circleReviveUsed: false,
        balanced: settings.ruleset === "balanced",
        balanceFactor: settings.ruleset === "balanced" ? Number((stats.hp / Math.max(1, sourceStats.hp)).toFixed(3)) : 1,
        initial: { maxHp: stats.hp, maxMp: stats.mp, shield },
        metrics: emptyMetrics(),
      };
      if (circleEffect !== "none") circleEvents.push({ kind: "circleActivate", actorId, actorOwnerId: member.playerId, actorName: member.profile.displayName, targetKind: "player", targetId: actorId, label: profile.circleName || "魔法陣" });
    }
    for (const member of participants) member.teamReady = false;
    room.teamBattle = {
      id: token(), round: 1, game: 1, phase: "command", speed: 1,
      deadlineAt: this.now() + (settings.ruleset === "blitz" ? BLITZ_COMMAND_MS : COMMAND_MS), nextRoundAt: 0,
      outcome: null, winner: null, format: `${sideCounts.sun} vs ${sideCounts.moon}`, playerFormat: `${sun.length}人 vs ${moon.length}人`,
      ruleset: settings.ruleset, series: settings.series, targetWins: targetWinsFor(settings.series),
      score: { sun: 0, moon: 0 }, games: [], betweenGames: false, gameWinner: null,
      commandMs: settings.ruleset === "blitz" ? BLITZ_COMMAND_MS : COMMAND_MS,
      damageMultiplier: settings.ruleset === "blitz" ? 1.25 : 1,
      healingMultiplier: settings.ruleset === "blitz" ? .85 : 1,
      players, actions: {}, autoPlayers: new Set(), lastEvents: [...circleEvents, { kind: "seriesStart", label: `${settings.series === "bo3" ? "2本先取" : "1本先取"}・${settings.ruleset === "balanced" ? "均衡" : settings.ruleset === "blitz" ? "速攻" : "通常"}ルール` }],
    };
    room.phase = "team";
    this.broadcast(room, { type: "teamBattleStarted", teamBattle: teamBattleSnapshot(room.teamBattle) });
    this.broadcast(room, { type: "roomRefresh" });
    return { ok: true, teamBattle: teamBattleSnapshot(room.teamBattle) };
  }

  action(room, session, source = {}) {
    const battle = room?.teamBattle;
    if (!battle || room.phase !== "team") return { ok: false, code: "NO_TEAM_BATTLE", message: "チーム戦は開始されていません" };
    if (battle.phase !== "command") return { ok: false, code: "ACTION_CLOSED", message: "現在は行動を選べません" };
    const ownedActors = Object.values(battle.players).filter(player => player.ownerPlayerId === session.playerId);
    const requestedActorId = cleanText(source.actorId ?? source.combatantId, 80);
    if (requestedActorId && !ownedActors.some(player => player.playerId === requestedActorId)) return { ok: false, code: "BAD_ACTOR", message: "その魔物は操作できません" };
    const actor = requestedActorId
      ? battle.players[requestedActorId]
      : ownedActors.find(player => player.hp > 0 && !battle.actions[player.playerId]) ?? ownedActors.find(player => player.hp > 0);
    if (!actor || actor.hp <= 0) return { ok: false, code: "ACTOR_DOWN", message: "戦闘不能中です" };
    if (battle.actions[actor.playerId]) {
      const snapshot = teamBattleSnapshot(battle);
      return { ok: true, duplicate: true, battle: snapshot, teamBattle: snapshot };
    }
    const kind = ACTIONS.has(source.kind) ? source.kind : "attack";
    const skill = kind === "skill" ? actor.skills.find(entry => entry.id === cleanText(source.skillId, 80)) : null;
    if (kind === "skill" && !skill) return { ok: false, code: "BAD_SKILL", message: "そのスキルは使用できません" };
    const remainingCooldown = skill ? Math.max(0, Math.floor(Number(actor.cooldowns?.[skill.id]) || 0)) : 0;
    if (remainingCooldown > 0) return { ok: false, code: "SKILL_COOLDOWN", message: "そのスキルは再使用待ちです", remainingCooldown };
    if (skill && actor.mp < skill.mp) return { ok: false, code: "NO_MP", message: "MPが足りません" };
    if (kind === "item" && actor.itemCharges <= 0) return { ok: false, code: "NO_ITEM", message: "応急薬は使用済みです" };

    const targetId = cleanText(source.targetId, 80);
    const values = Object.values(battle.players);
    const supportAction = kind === "item" || kind === "skill" && skill?.kind !== "attack";
    const attackSkill = !supportAction;
    const canRevive = skill?.kind === "revive" || finite(skill?.revive) > 0 || finite(skill?.reviveTransferRate) > 0;
    const candidates = values.filter(player => attackSkill ? player.side !== actor.side && player.hp > 0 : player.side === actor.side);
    let target = candidates.find(player => player.playerId === targetId);
    if (!target) target = attackSkill ? candidates.find(player => player.hp > 0) : actor;
    if (!target) return { ok: false, code: "NO_TARGET", message: "対象がいません" };
    if (skill?.selfOnly && targetId && targetId !== actor.playerId) return { ok: false, code: "SELF_ONLY", message: "このスキルは自分にのみ使用できます" };
    if (skill?.kind === "revive" && target.hp > 0) return { ok: false, code: "TARGET_ALIVE", message: "倒れている味方を選んでください" };
    if (!attackSkill && !canRevive && target.hp <= 0) return { ok: false, code: "TARGET_DOWN", message: "戦闘可能な味方を選んでください" };
    battle.actions[actor.playerId] = { actorId: actor.playerId, kind, skillId: skill?.id ?? null, targetId: target.playerId, submittedAt: this.now(), auto: false };
    this.broadcast(room, { type: "teamBattleState", teamBattle: teamBattleSnapshot(battle) });
    if (this._allReady(battle)) this._resolve(room, battle);
    const snapshot = teamBattleSnapshot(battle);
    return { ok: true, battle: snapshot, teamBattle: snapshot };
  }

  setSpeed(room, session, value) {
    const battle = room?.teamBattle;
    if (!battle) return { ok: false, code: "NO_TEAM_BATTLE", message: "チーム戦は開始されていません" };
    if (room.leaderId !== session.playerId) return { ok: false, code: "LEADER_ONLY", message: "速度変更はリーダーだけが行えます" };
    const speed = Number(value);
    if (!SPEEDS.has(speed)) return { ok: false, code: "BAD_SPEED", message: "その速度は選べません" };
    battle.speed = speed;
    this.broadcast(room, { type: "teamBattleState", teamBattle: teamBattleSnapshot(battle) });
    return { ok: true };
  }

  setAuto(room, session, enabled) {
    const battle = room?.teamBattle;
    if (!battle || room.phase !== "team") return { ok: false, code: "NO_TEAM_BATTLE", message: "チーム戦は開始されていません" };
    const ownerId = session?.playerId;
    if (!ownerId || !Object.values(battle.players).some(player => player.ownerPlayerId === ownerId)) return { ok: false, code: "NOT_PARTICIPANT", message: "このチーム戦には参加していません" };
    const value = Boolean(enabled);
    battle.autoPlayers = battle.autoPlayers instanceof Set ? battle.autoPlayers : new Set(battle.autoPlayers ?? []);
    if (value) battle.autoPlayers.add(ownerId);
    else {
      battle.autoPlayers.delete(ownerId);
      for (const actor of Object.values(battle.players).filter(player => player.ownerPlayerId === ownerId)) {
        if (battle.actions[actor.playerId]?.auto) delete battle.actions[actor.playerId];
      }
    }
    if (value && battle.phase === "command") {
      for (const actor of teamActionOrder(battle).filter(player => player.ownerPlayerId === ownerId && !battle.actions[player.playerId])) {
        battle.actions[actor.playerId] = this._autoAction(battle, actor);
      }
    }
    this.broadcast(room, { type: "teamBattleState", teamBattle: teamBattleSnapshot(battle) });
    if (battle.phase === "command" && this._allReady(battle)) this._resolve(room, battle);
    return { ok: true, enabled: value, battle: teamBattleSnapshot(battle) };
  }

  playerLeft(room, playerId) {
    const session = this.sessions.get(playerId);
    if (session) session.teamReady = false;
    const battle = room?.teamBattle;
    if (room?.phase === "team" && Object.values(battle?.players ?? {}).some(player => player.ownerPlayerId === playerId)) {
      battle.autoPlayers?.delete?.(playerId);
      for (const actor of Object.values(battle.players).filter(player => player.ownerPlayerId === playerId)) {
        delete battle.players[actor.playerId];
        delete battle.actions[actor.playerId];
      }
      const players = Object.values(battle.players);
      const aliveSun = players.some(player => player.side === "sun" && player.hp > 0);
      const aliveMoon = players.some(player => player.side === "moon" && player.hp > 0);
      if (!aliveSun || !aliveMoon) {
        battle.outcome = aliveSun === aliveMoon ? "draw" : "victory";
        battle.winner = aliveSun === aliveMoon ? null : aliveSun ? "sun" : "moon";
        if (battle.winner) battle.score[battle.winner] = battle.targetWins;
        battle.gameWinner = battle.winner;
        battle.games.push({ game: battle.game, winner: battle.winner, reason: "forfeit", score: { ...battle.score } });
        battle.summary = resultSummary(battle);
        battle.phase = "result";
        battle.deadlineAt = 0;
        battle.nextRoundAt = this.now();
        battle.lastEvents = [{ kind: "result", label: battle.winner ? `${battle.winner === "sun" ? "紅組" : "蒼組"} 勝利（相手が退出）` : "引き分け" }];
      }
      this.broadcast(room, { type: "teamBattleState", teamBattle: teamBattleSnapshot(battle) });
    }
    this.broadcast(room, { type: "roomRefresh" });
  }

  advance(room) {
    const battle = room?.teamBattle;
    if (!battle || room.phase !== "team") return;
    const now = this.now();
    if (battle.phase === "command") {
      for (const actor of teamActionOrder(battle)) {
        const session = this.sessions.get(actor.ownerPlayerId);
        const autoEnabled = battle.autoPlayers?.has?.(actor.ownerPlayerId);
        if (battle.actions[actor.playerId] || session?.connected && !autoEnabled) continue;
        battle.actions[actor.playerId] = this._autoAction(battle, actor);
      }
      if (now >= battle.deadlineAt || this._allReady(battle)) this._resolve(room, battle);
      return;
    }
    if (battle.phase !== "result" || now < battle.nextRoundAt) return;
    if (battle.outcome) {
      battle.summary ??= resultSummary(battle);
      this.broadcast(room, { type: "teamBattleEnded", resultId: battle.summary.resultId, result: battle.outcome, winner: battle.winner, summary: battle.summary, teamBattle: teamBattleSnapshot(battle) });
      room.phase = "lobby";
      room.teamBattle = null;
      for (const id of room.members) {
        const member = this.sessions.get(id);
        if (member) member.teamReady = false;
      }
      this.broadcast(room, { type: "roomRefresh" });
      return;
    }
    if (battle.betweenGames) {
      this._openNextGame(room, battle, now);
      return;
    }
    battle.round += 1;
    battle.phase = "command";
    battle.deadlineAt = now + battle.commandMs;
    battle.nextRoundAt = 0;
    battle.actions = {};
    battle.lastEvents = [];
    for (const player of Object.values(battle.players)) {
      player.guard = false;
      player.cooldowns ??= {};
      for (const id of Object.keys(player.cooldowns)) player.cooldowns[id] = Math.max(0, (Number(player.cooldowns[id]) || 0) - 1);
      const regen = effectValue(player, "regen");
      if (regen && player.hp > 0) {
        const received = Math.max(.05, 1 - Math.min(.95, effectValue(player, "healDown")));
        player.hp = Math.min(player.maxHp, player.hp + Math.ceil(player.maxHp * regen * received));
      }
      for (const effect of player.effects ?? []) {
        if (!String(effect.kind).startsWith("status:") || effect.turns <= 0 || finite(effect.value) <= 0 || player.hp <= 0) continue;
        const before = player.hp, damage = Math.max(1, Math.ceil(player.maxHp * Math.min(.5, finite(effect.value))));
        player.hp = Math.max(0, player.hp - damage);
        const dealt = before - player.hp, source = battle.players?.[effect.sourcePlayerId];
        player.metrics.damageTaken += dealt;
        if (source?.metrics) source.metrics.damage += dealt;
        battle.lastEvents.push({ kind: "statusDamage", actorId: effect.sourcePlayerId ?? null, actorOwnerId: effect.sourceOwnerId ?? source?.ownerPlayerId ?? null, targetKind: "player", targetId: player.playerId, value: dealt, label: effect.name ?? effect.kind });
        if (player.hp <= 0 && before > 0 && player.circleEffect === "lastLife" && !player.circleLastLifeUsed) { player.circleLastLifeUsed = true; player.hp = 1; battle.lastEvents.push({ kind: "circleActivate", targetKind: "player", targetId: player.playerId, label: "不屈の残光" }); }
        if (player.hp <= 0 && before > 0 && player.circleEffect === "revive" && !player.circleReviveUsed) { player.circleReviveUsed = true; player.hp = Math.max(1, Math.ceil(player.maxHp * .35)); battle.lastEvents.push({ kind: "circleActivate", targetKind: "player", targetId: player.playerId, label: "輪廻の魔法陣" }); }
        if (player.hp <= 0 && before > 0) {
          if (source?.metrics) source.metrics.kos += 1;
          battle.lastEvents.push({ kind: "ko", actorId: effect.sourcePlayerId ?? null, actorOwnerId: effect.sourceOwnerId ?? source?.ownerPlayerId ?? null, targetKind: "player", targetId: player.playerId, label: `${player.name} 戦闘不能` });
        }
      }
      tickEffects(player);
    }
    const aliveSun = Object.values(battle.players).some(player => player.side === "sun" && player.hp > 0);
    const aliveMoon = Object.values(battle.players).some(player => player.side === "moon" && player.hp > 0);
    if (!aliveSun || !aliveMoon) {
      this._resolve(room, battle);
      return;
    }
    this.broadcast(room, { type: "teamBattleRound", teamBattle: teamBattleSnapshot(battle) });
    this.broadcast(room, { type: "roomRefresh" });
  }

  _openNextGame(room, battle, now) {
    battle.game += 1;
    battle.round = 1;
    battle.phase = "command";
    battle.deadlineAt = now + battle.commandMs;
    battle.nextRoundAt = 0;
    battle.actions = {};
    battle.betweenGames = false;
    battle.gameWinner = null;
    battle.lastEvents = [];
    for (const player of Object.values(battle.players)) {
      resetPlayerForGame(player);
      if (player.circleEffect !== "none") battle.lastEvents.push({ kind: "circleActivate", actorId: player.playerId, actorOwnerId: player.ownerPlayerId, actorName: player.name, targetKind: "player", targetId: player.playerId, label: player.circleName || "魔法陣" });
    }
    battle.lastEvents.push({ kind: "gameStart", label: `第${battle.game}戦開始・紅 ${battle.score.sun} - ${battle.score.moon} 蒼` });
    this.broadcast(room, { type: "teamBattleRound", teamBattle: teamBattleSnapshot(battle) });
    this.broadcast(room, { type: "roomRefresh" });
  }

  _allReady(battle) {
    return Object.values(battle.players).filter(player => player.hp > 0).every(player => battle.actions[player.playerId]);
  }

  _autoAction(battle, actor) {
    return chooseTeamAutoAction(battle, actor, this.now());
  }

  _resolve(room, battle) {
    if (battle.phase !== "command") return;
    const order = teamActionOrder(battle);
    for (const actor of order) {
      if (battle.actions[actor.playerId]) continue;
      battle.actions[actor.playerId] = this._autoAction(battle, actor);
    }
    const events = [];
    for (const actor of order) {
      if (actor.hp <= 0) continue;
      this._resolveAction(battle, actor, battle.actions[actor.playerId], events);
    }
    const aliveSun = Object.values(battle.players).some(player => player.side === "sun" && player.hp > 0);
    const aliveMoon = Object.values(battle.players).some(player => player.side === "moon" && player.hp > 0);
    if (!aliveSun || !aliveMoon) {
      const gameWinner = aliveSun === aliveMoon ? null : aliveSun ? "sun" : "moon";
      battle.gameWinner = gameWinner;
      if (gameWinner) battle.score[gameWinner] += 1;
      battle.games.push({ game: battle.game, winner: gameWinner, reason: gameWinner ? "ko" : "draw", score: { ...battle.score } });
      if (battle.games.length > 8) battle.games = battle.games.slice(-8);
      const reachedTarget = gameWinner && battle.score[gameWinner] >= battle.targetWins;
      const drawLimit = !gameWinner && (battle.series === "bo1" || battle.games.length >= 5);
      if (reachedTarget) { battle.outcome = "victory"; battle.winner = gameWinner; }
      else if (drawLimit) { battle.outcome = "draw"; battle.winner = null; }
      else { battle.outcome = null; battle.winner = null; battle.betweenGames = true; }
      events.push({ kind: "result", label: gameWinner ? `第${battle.game}戦 ${gameWinner === "sun" ? "紅組" : "蒼組"}勝利（${battle.score.sun}-${battle.score.moon}）` : "この試合は引き分け" });
      if (battle.outcome) battle.summary = resultSummary(battle);
    }
    battle.phase = "result";
    battle.deadlineAt = 0;
    battle.nextRoundAt = this.now() + Math.round(2200 / battle.speed);
    battle.lastEvents = events;
    this.broadcast(room, { type: "teamBattleResolved", teamBattle: teamBattleSnapshot(battle), events });
    this.broadcast(room, { type: "roomRefresh" });
  }

  _resolveAction(battle, actor, action, events) {
    if (!action) return;
    const session = this.sessions.get(actor.ownerPlayerId);
    const actorName = session?.profile?.displayName ?? actor.name ?? "挑戦者";
    const skill = action.kind === "skill" ? actor.skills.find(entry => entry.id === action.skillId) : null;
    const players = Object.values(battle.players);
    const allies = players.filter(player => player.side === actor.side);
    const opponents = players.filter(player => player.side !== actor.side);
    const enemies = opponents.filter(player => player.hp > 0);
    const target = players.find(player => player.playerId === action.targetId);
    const reviveAlly = (reviveSkill, preferred = null) => {
      const fallen = preferred?.side === actor.side && preferred.hp <= 0 && effectValue(preferred, "reviveSeal") <= 0
        ? preferred
        : allies.find(player => player.hp <= 0 && effectValue(player, "reviveSeal") <= 0);
      if (!fallen) return null;
      const transferRate = clamp(reviveSkill.reviveTransferRate, 0, .9);
      if (transferRate > 0) {
        const available = Math.max(0, actor.hp - 1);
        const transferred = Math.min(available, Math.max(1, Math.floor(actor.hp * transferRate)));
        if (transferred <= 0) return null;
        actor.hp = Math.max(1, actor.hp - transferred);
        fallen.hp = Math.max(1, Math.min(fallen.maxHp, transferred));
      } else {
        fallen.hp = Math.max(1, Math.ceil(fallen.maxHp * Math.max(0.2, reviveSkill.revive || reviveSkill.heal || 0.35)));
      }
      fallen.mp = Math.min(fallen.maxMp, Math.ceil(fallen.maxMp * Math.max(0, finite(reviveSkill.reviveMp))));
      if (reviveSkill.cleanse) cleanseEffects(fallen);
      for (const effect of reviveSkill.revivedEffects ?? []) addEffect(fallen, { ...effect, sourcePlayerId: actor.playerId, sourceOwnerId: actor.ownerPlayerId });
      actor.metrics.healing += fallen.hp;
      actor.metrics.support += 2;
      events.push({ kind: "revive", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: fallen.playerId, value: fallen.hp, label: reviveSkill.name });
      if (reviveSkill.cleanse) events.push({ kind: "cleanse", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: fallen.playerId, label: `${reviveSkill.name}・浄化` });
      for (const effect of reviveSkill.revivedEffects ?? []) events.push({ kind: "effect", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: fallen.playerId, value: effect.value, turns: effect.turns, label: `${reviveSkill.name}・${effect.kind}` });
      return fallen;
    };
    const effectApplies = effect => this.random() < clamp(effect?.chance == null ? 1 : effect.chance, 0, 1);
    const applyCooldownFields = usedSkill => {
      if (!usedSkill) return;
      const adjust = (targets, amount) => {
        const value = Math.max(0, Math.floor(finite(amount)));
        if (!value) return;
        for (const target of targets) for (const id of Object.keys(target.cooldowns ?? {})) target.cooldowns[id] = Math.max(0, finite(target.cooldowns[id]) + value);
      };
      const reduce = Math.max(0, Math.floor(finite(usedSkill.reducePartyCooldowns)));
      if (reduce) for (const ally of allies) for (const id of Object.keys(ally.cooldowns ?? {})) ally.cooldowns[id] = Math.max(0, finite(ally.cooldowns[id]) - reduce);
      const enemyIncrease = finite(usedSkill.increaseEnemyCooldowns) || finite(usedSkill.increaseAllyCooldowns);
      adjust(opponents, enemyIncrease);
    };
    if (isIncapacitated(actor)) {
      events.push({ kind: "statusSkip", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: actor.playerId, label: "行動不能" });
      return;
    }
    if (action.kind === "guard") {
      actor.guard = true;
      actor.metrics.guards += 1;
      actor.metrics.support += 1;
      events.push({ kind: "guard", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: actor.playerId, label: "ガード" });
      return;
    }
    if (action.kind === "item") {
      actor.itemCharges = Math.max(0, actor.itemCharges - 1);
      const ally = target?.side === actor.side ? target : actor;
      const before = ally.hp;
      const received = Math.max(.05, 1 - Math.min(.95, effectValue(ally, "healDown")));
      ally.hp = Math.min(ally.maxHp, ally.hp + Math.ceil(ally.maxHp * 0.35 * (battle.healingMultiplier ?? 1) * received));
      const healed = ally.hp - before;
      actor.metrics.healing += healed;
      actor.metrics.support += 1;
      events.push({ kind: "heal", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: ally.playerId, value: healed, label: "模擬戦応急薬" });
      return;
    }
    const spentMp = skill ? Math.max(0, finite(skill.mp)) : 0;
    if (skill) {
      actor.mp = Math.max(0, actor.mp - spentMp);
      actor.cooldowns ??= {};
      const cooldown = Math.max(0, Math.floor(Number(skill.cooldown) || 0));
      if (cooldown > 0) actor.cooldowns[skill.id] = cooldown + 1;
    }
    if (skill?.kind === "revive") {
      const revived = reviveAlly(skill, target);
      if (!revived) {
        actor.mp = Math.min(actor.maxMp, actor.mp + spentMp);
        delete actor.cooldowns[skill.id];
        events.push({ kind: "reviveFail", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: target?.playerId ?? actor.playerId, label: "蘇生対象なし／蘇生封印" });
      } else applyCooldownFields(skill);
      return;
    }
    if (skill && ["heal", "allHeal", "mpHeal", "guard", "buff"].includes(skill.kind)) {
      let targets = skill.allAllies || skill.kind === "allHeal" ? allies.filter(player => player.hp > 0) : [target?.side === actor.side ? target : actor].filter(player => player.hp > 0);
      if (["heal", "allHeal"].includes(skill.kind)) for (const ally of targets) {
        const before = ally.hp;
        const received = Math.max(.05, 1 - Math.min(.95, effectValue(ally, "healDown")));
        ally.hp = Math.min(ally.maxHp, ally.hp + Math.ceil(ally.maxHp * Math.max(0.12, skill.heal || 0.25) * (battle.healingMultiplier ?? 1) * received));
        const healed = ally.hp - before;
        actor.metrics.healing += healed;
        events.push({ kind: "heal", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: ally.playerId, value: healed, label: skill.name });
      }
      if (skill.kind === "mpHeal") for (const ally of targets) {
        const before = ally.mp;
        ally.mp = Math.min(ally.maxMp, ally.mp + Math.ceil(ally.maxMp * Math.max(0.15, skill.mpHeal || 0.25)));
        const restored = ally.mp - before;
        actor.metrics.support += Math.max(1, Math.ceil(restored / Math.max(1, ally.maxMp) * 10));
        events.push({ kind: "mpHeal", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: ally.playerId, value: restored, label: skill.name });
      }
      if (["heal", "allHeal"].includes(skill.kind) && (finite(skill.revive) > 0 || finite(skill.reviveTransferRate) > 0)) {
        reviveAlly(skill, target);
        targets = skill.allAllies || skill.kind === "allHeal" ? allies.filter(player => player.hp > 0) : [target?.side === actor.side ? target : actor].filter(player => player.hp > 0);
      }
      if (skill.kind === "guard") for (const ally of targets) ally.guard = true;
      for (const effect of skill.effects ?? []) {
        if (effect.enemy) {
          const effectTargets = skill.allEnemies ? enemies : [target?.side !== actor.side && target?.hp > 0 ? target : enemies[0]].filter(Boolean);
          for (const enemy of effectTargets) if (effectApplies(effect)) addEffect(enemy, { ...effect, sourcePlayerId: actor.playerId, sourceOwnerId: actor.ownerPlayerId });
        } else if (effect.allies) {
          for (const ally of allies.filter(player => player.hp > 0)) if (effectApplies(effect)) addEffect(ally, { ...effect, sourcePlayerId: actor.playerId, sourceOwnerId: actor.ownerPlayerId });
        } else if (effectApplies(effect)) addEffect(actor, { ...effect, sourcePlayerId: actor.playerId, sourceOwnerId: actor.ownerPlayerId });
      }
      if (finite(skill.partyShieldRate) > 0) for (const ally of allies.filter(player => player.hp > 0)) {
        const amount = Math.max(1, Math.ceil(ally.maxHp * Math.min(.8, finite(skill.partyShieldRate))));
        ally.shield = Math.max(ally.shield ?? 0, amount);
        events.push({ kind: "shield", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: ally.playerId, value: amount, label: `${skill.name}・障壁` });
      }
      if (finite(skill.selfShieldRate) > 0 && actor.hp > 0) actor.shield = Math.max(actor.shield ?? 0, Math.max(1, Math.ceil(actor.maxHp * Math.min(.8, finite(skill.selfShieldRate)))));
      if (skill.cleanse) for (const ally of targets) {
        cleanseEffects(ally);
        events.push({ kind: "cleanse", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: ally.playerId, label: `${skill.name}・浄化` });
      }
      applyCooldownFields(skill);
      actor.metrics.support += Math.max(1, targets.length);
      if (!events.some(event => event.actorId === actor.playerId && event.label === skill.name)) events.push({ kind: "buff", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: targets[0]?.playerId, label: skill.name });
      return;
    }
    const defender = target?.side !== actor.side && target.hp > 0 ? target : enemies[0];
    if (!defender) {
      if (skill) { actor.mp = Math.min(actor.maxMp, actor.mp + spentMp); delete actor.cooldowns[skill.id]; }
      return;
    }
    const defenders = skill?.kind === "attack" && skillTargetsAll(skill) ? enemies : [defender];
    const attack = attackStat(actor, skill) * statFactor(actor, "atkUp", "atkDown") * circleDamageFactor(actor, battle.round, allies.filter(player => player.hp > 0).length);
    const power = skill?.kind === "attack" ? Math.max(0.2, skill.power * skill.hits) : 1;
    const areaFactor = skillTargetsAll(skill) ? 0.75 : 1;
    const skillElement = skill?.randomElement ? RANDOM_SKILL_ELEMENTS[Math.floor(this.random() * RANDOM_SKILL_ELEMENTS.length)] : skill?.element ?? actor.element ?? actor.attribute ?? "neutral";
    const criticalRate = actor.stats.crit / 100 + finite(skill?.critBonus) + effectValue(actor, "critUp") - effectValue(actor, "critDown");
    const capRate = skill ? 0.55 : 0.38;
    const fillHpDrain = Boolean(skill?.fillHpDrain), sacrificeRate = clamp(skill?.selfSacrificeHpDamage, 0, 2);
    const sacrificeHp = actor.hp;
    let totalDealt = 0;
    for (const currentDefender of defenders) {
      if (currentDefender.hp <= 0) continue;
      if (!hitLands(actor, currentDefender, this.random, Boolean(skill?.guaranteedHit) || hasActiveEffect(actor, "guaranteedHit"))) {
        events.push({ kind: "miss", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetId: currentDefender.playerId, label: `${currentDefender.name}が回避` });
        continue;
      }
      let critical = false, elementFactor = 1, value;
      if (fillHpDrain) {
        value = Math.max(0, Math.min(currentDefender.hp, actor.maxHp - actor.hp));
      } else if (sacrificeRate > 0) {
        value = Math.max(1, Math.floor(sacrificeHp * sacrificeRate));
      } else {
        const baseDefense = defenseStat(currentDefender, skill) * statFactor(currentDefender, "defUp", "defDown");
        const defense = baseDefense * (1 - clamp(skill?.defenseIgnore, 0, .9));
        const ratio = attack / Math.max(1, attack + defense);
        critical = Boolean(skill?.guaranteedCritical) || hasActiveEffect(actor, "guaranteedCritical") || this.random() < clamp(criticalRate, 0, 0.65);
        elementFactor = attributeDamageMultiplier(skillElement, currentDefender.element ?? currentDefender.attribute ?? "neutral");
        const executeFactor = finite(skill?.execute) > 0 && healthRatio(currentDefender) <= finite(skill.execute) ? 2 : 1;
        const vulnerable = 1 + Math.min(2, effectValue(currentDefender, "vulnerable"));
        const raw = Math.max(1, Math.round(currentDefender.maxHp * ratio * 0.48 * power * areaFactor * elementFactor * executeFactor * vulnerable * (battle.damageMultiplier ?? 1) * (0.92 + this.random() * 0.16) * (critical ? 1.45 : 1)));
        value = Math.min(raw, Math.max(1, Math.ceil(currentDefender.maxHp * capRate)));
        if (currentDefender.guard) value = Math.max(1, Math.round(value * 0.42));
        const guardEffect = Math.min(.9, effectValue(currentDefender, "guard"));
        if (guardEffect > 0) value = Math.max(1, Math.round(value * (1 - guardEffect)));
      }
      const fixedDamage = fillHpDrain || sacrificeRate > 0;
      const absorbed = fixedDamage ? 0 : Math.min(currentDefender.shield ?? 0, value);
      currentDefender.shield = Math.max(0, (currentDefender.shield ?? 0) - absorbed);
      const before = currentDefender.hp;
      currentDefender.hp = Math.max(0, currentDefender.hp - (value - absorbed));
      let dealt = before - currentDefender.hp;
      if (currentDefender.hp <= 0 && before > 0 && currentDefender.circleEffect === "lastLife" && !currentDefender.circleLastLifeUsed) { currentDefender.circleLastLifeUsed = true; currentDefender.hp = 1; events.push({ kind: "circleActivate", targetKind: "player", targetId: currentDefender.playerId, label: "不屈の残光" }); }
      if (currentDefender.hp <= 0 && before > 0 && currentDefender.circleEffect === "revive" && !currentDefender.circleReviveUsed) { currentDefender.circleReviveUsed = true; currentDefender.hp = Math.max(1, Math.ceil(currentDefender.maxHp * .35)); events.push({ kind: "circleActivate", targetKind: "player", targetId: currentDefender.playerId, label: "輪廻の魔法陣" }); }
      actor.metrics.damage += dealt;
      currentDefender.metrics.damageTaken += dealt;
      events.push({ kind: "damage", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetId: currentDefender.playerId, value: dealt, absorbed, critical, elementFactor, label: skill?.name ?? "たたかう" });
      if (finite(skill?.currentHpDamage) > 0 && currentDefender.hp > 0) {
        const percent = Math.max(1, Math.floor(currentDefender.hp * Math.min(.25, finite(skill.currentHpDamage)))), percentBefore = currentDefender.hp;
        currentDefender.hp = Math.max(0, currentDefender.hp - percent);
        const percentDealt = percentBefore - currentDefender.hp;
        dealt += percentDealt;
        actor.metrics.damage += percentDealt;
        currentDefender.metrics.damageTaken += percentDealt;
        events.push({ kind: "damage", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetId: currentDefender.playerId, value: percentDealt, critical: false, elementFactor: 1, label: `${skill.name}・割合` });
        if (currentDefender.hp <= 0 && percentBefore > 0 && currentDefender.circleEffect === "lastLife" && !currentDefender.circleLastLifeUsed) { currentDefender.circleLastLifeUsed = true; currentDefender.hp = 1; events.push({ kind: "circleActivate", targetKind: "player", targetId: currentDefender.playerId, label: "不屈の残光" }); }
        if (currentDefender.hp <= 0 && percentBefore > 0 && currentDefender.circleEffect === "revive" && !currentDefender.circleReviveUsed) { currentDefender.circleReviveUsed = true; currentDefender.hp = Math.max(1, Math.ceil(currentDefender.maxHp * .35)); events.push({ kind: "circleActivate", targetKind: "player", targetId: currentDefender.playerId, label: "輪廻の魔法陣" }); }
      }
      totalDealt += dealt;
      if (fillHpDrain && dealt > 0) {
        const beforeHeal = actor.hp;
        actor.hp = Math.min(actor.maxHp, actor.hp + dealt);
        const healed = actor.hp - beforeHeal;
        actor.metrics.healing += healed;
        events.push({ kind: "heal", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: actor.playerId, value: healed, label: `${skill.name}・満命吸収` });
      }
      if (skill) for (const effect of skill.effects ?? []) if (effect.enemy && effectApplies(effect)) addEffect(currentDefender, { ...effect, sourcePlayerId: actor.playerId, sourceOwnerId: actor.ownerPlayerId });
      if (applySkillStatus(currentDefender, skill, this.random, actor)) events.push({ kind: "status", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: currentDefender.playerId, value: skill.status.power, turns: skill.status.turns, label: skill.status.name || skill.status.id });
      if (currentDefender.hp <= 0) { actor.metrics.kos += 1; events.push({ kind: "ko", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, targetId: currentDefender.playerId, label: `${currentDefender.name} 戦闘不能` }); }
    }
    if (sacrificeRate > 0) {
      const before = actor.hp;
      actor.hp = 0;
      if (actor.circleEffect === "lastLife" && !actor.circleLastLifeUsed) { actor.circleLastLifeUsed = true; actor.hp = 1; events.push({ kind: "circleActivate", targetKind: "player", targetId: actor.playerId, label: "不屈の残光" }); }
      if (actor.hp <= 0 && actor.circleEffect === "revive" && !actor.circleReviveUsed) { actor.circleReviveUsed = true; actor.hp = Math.max(1, Math.ceil(actor.maxHp * .35)); events.push({ kind: "circleActivate", targetKind: "player", targetId: actor.playerId, label: "輪廻の魔法陣" }); }
      if (actor.hp <= 0 && before > 0) events.push({ kind: "ko", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, targetId: actor.playerId, label: `${actor.name} 戦闘不能` });
    }
    if (skill) {
      const friendlyTargets = skill.allAllies ? allies.filter(player => player.hp > 0) : [actor];
      for (const effect of skill.effects ?? []) if (!effect.enemy) for (const ally of effect.allies ? allies.filter(player => player.hp > 0) : [actor]) if (effectApplies(effect)) addEffect(ally, { ...effect, sourcePlayerId: actor.playerId, sourceOwnerId: actor.ownerPlayerId });
      if (finite(skill.drain) > 0 && totalDealt > 0 && actor.hp > 0) {
        const before = actor.hp;
        const received = Math.max(.05, 1 - Math.min(.95, effectValue(actor, "healDown")));
        actor.hp = Math.min(actor.maxHp, actor.hp + Math.max(1, Math.floor(totalDealt * Math.min(1.25, finite(skill.drain)) * received)));
        const healed = actor.hp - before;
        actor.metrics.healing += healed;
        if (healed) events.push({ kind: "heal", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: actor.playerId, value: healed, label: `${skill.name}・吸収` });
      }
      if (finite(skill.selfHeal) > 0 && actor.hp > 0) {
        const before = actor.hp;
        const received = Math.max(.05, 1 - Math.min(.95, effectValue(actor, "healDown")));
        actor.hp = Math.min(actor.maxHp, actor.hp + Math.max(1, Math.floor(actor.maxHp * Math.min(1, finite(skill.selfHeal)) * received)));
        const healed = actor.hp - before;
        actor.metrics.healing += healed;
        if (healed) events.push({ kind: "heal", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: actor.playerId, value: healed, label: `${skill.name}・自己回復` });
      }
      if (finite(skill.revive) > 0 || finite(skill.reviveTransferRate) > 0) reviveAlly(skill, target);
      if (finite(skill.mpDrain) > 0) {
        let drained = 0;
        for (const foe of defenders.filter(entry => entry.hp > 0)) {
          const amount = Math.min(Math.max(0, foe.mp), Math.max(1, Math.floor(foe.maxMp * Math.min(.8, finite(skill.mpDrain)))));
          foe.mp = Math.max(0, foe.mp - amount);
          drained += amount;
        }
        const before = actor.mp, gain = Math.max(1, drained || Math.floor(actor.maxMp * Math.min(.25, finite(skill.mpDrain))));
        actor.mp = Math.min(actor.maxMp, actor.mp + gain);
        if (actor.mp > before) events.push({ kind: "mpHeal", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: actor.playerId, value: actor.mp - before, label: `${skill.name}・MP吸収` });
      }
      const partyShieldRate = Math.max(finite(skill.partyShieldRate), finite(skill.hpShieldRate));
      if (partyShieldRate > 0) for (const ally of allies.filter(player => player.hp > 0)) {
        const amount = Math.max(1, Math.ceil(ally.maxHp * Math.min(.8, partyShieldRate)));
        ally.shield = Math.max(ally.shield ?? 0, amount);
        events.push({ kind: "shield", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: ally.playerId, value: amount, label: `${skill.name}・障壁` });
      }
      if (finite(skill.selfShieldRate) > 0 && actor.hp > 0) actor.shield = Math.max(actor.shield ?? 0, Math.max(1, Math.ceil(actor.maxHp * Math.min(.8, finite(skill.selfShieldRate)))));
      if (skill.cleanse) for (const ally of friendlyTargets) {
        cleanseEffects(ally);
        events.push({ kind: "cleanse", actorId: actor.playerId, actorOwnerId: actor.ownerPlayerId, actorName, targetKind: "player", targetId: ally.playerId, label: `${skill.name}・浄化` });
      }
      applyCooldownFields(skill);
    }
  }
}
