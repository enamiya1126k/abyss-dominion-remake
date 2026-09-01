import { attributeDamageMultiplier } from "../../src/data/attributes.js";
import { chooseAutoBattleSupport } from "./AutoBattleSupport.js";

const NEGATIVE_KINDS = new Set([
  "atkDown", "defDown", "spdDown", "evasionDown", "accuracyDown",
  "vulnerable", "healDown", "reviveSeal", "stun",
]);

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function ratio(value, maximum) {
  return Math.max(0, finite(value)) / Math.max(1, finite(maximum, 1));
}

function ownerAction(player, action = {}) {
  return {
    actorId: player.playerId,
    ...action,
    auto: true,
  };
}

function hasNegativeEffect(entity) {
  return (entity?.effects ?? []).some(effect => {
    const kind = String(effect?.kind ?? "");
    return NEGATIVE_KINDS.has(kind) || kind.startsWith("status:");
  });
}

function revivalBlocked(entity) {
  return (entity?.effects ?? []).some(effect => String(effect?.kind ?? "") === "reviveSeal" && finite(effect?.turns, 1) > 0);
}

function addProjectedEffect(entity, effect) {
  if (!entity || !effect?.kind) return;
  entity.effects ??= [];
  const current = entity.effects.find(entry => entry.kind === effect.kind);
  if (current) {
    current.value = Math.max(finite(current.value), finite(effect.value));
    current.turns = Math.max(finite(current.turns, 1), finite(effect.turns, 1));
  } else entity.effects.push({ ...effect, turns: Math.max(1, finite(effect.turns, 1)) });
}

function projectedEffectValue(entity, kind) {
  return (entity?.effects ?? []).filter(effect => effect?.kind === kind && finite(effect?.turns, 1) > 0)
    .reduce((best, effect) => Math.max(best, finite(effect?.value)), 0);
}

function hasProjectedEffect(entity, kind) {
  return (entity?.effects ?? []).some(effect => effect?.kind === kind && finite(effect?.turns, 1) > 0);
}

function projectedStatFactor(entity, up, down) {
  return Math.max(.2, 1 + projectedEffectValue(entity, up) - projectedEffectValue(entity, down));
}

function projectedPlayerOrder(player, battle) {
  return {
    priority: battle?.round === 1 && finite(player?.equipmentCombatEffects?.firstStrike) > 0 ? 1 : 0,
    speed: finite(player?.stats?.spd) * projectedStatFactor(player, "spdUp", "spdDown"),
    id: String(player?.playerId ?? ""),
  };
}

function actsBefore(candidate, current, battle) {
  if (!candidate || !current || candidate.playerId === current.playerId || finite(candidate.hp) <= 0) return false;
  const left = projectedPlayerOrder(candidate, battle), right = projectedPlayerOrder(current, battle);
  return left.priority !== right.priority ? left.priority > right.priority
    : left.speed !== right.speed ? left.speed > right.speed
      : left.id.localeCompare(right.id) < 0;
}

function clearProjectedNegative(entity) {
  if (entity) entity.effects = (entity.effects ?? []).filter(effect => !hasNegativeEffect({ effects: [effect] }));
}

function projectHealing(actor, target, rate, { useHealPower = true, round = "ceil" } = {}) {
  if (!target || finite(target.hp) <= 0 || finite(rate) <= 0) return;
  const healPower = useHealPower ? 1 + Math.min(150, Math.max(0, finite(actor?.equipmentCombatEffects?.healPower))) / 100 : 1,
    received = Math.max(.05, 1 - Math.min(.95, projectedEffectValue(target, "healDown"))),
    raw = Math.max(1, finite(target.maxHp, 1)) * finite(rate) * healPower * received,
    gain = Math.max(1, round === "floor" ? Math.floor(raw) : Math.ceil(raw));
  target.hp = Math.min(finite(target.maxHp, 1), finite(target.hp) + gain);
}

function applyProjectedSkillEffects(skill, actor, targets, partyShieldTargets = targets) {
  for (const effect of skill?.effects ?? []) {
    if (effect?.enemy) continue;
    const affected = effect?.allies ? targets : [actor].filter(Boolean);
    for (const target of affected) addProjectedEffect(target, effect);
  }
  const rate = Math.max(0, Math.min(.8, finite(skill?.partyShieldRate)));
  if (rate > 0) for (const target of partyShieldTargets.filter(ally => finite(ally.hp) > 0)) {
    target.shield = Math.max(finite(target.shield), Math.max(1, Math.ceil(finite(target.maxHp, 1) * rate)));
  }
}

function skillTargetsAll(skill) {
  return Boolean(skill?.allEnemies);
}

function attackStat(player, skill) {
  const stats = player?.stats ?? {};
  const factor = projectedStatFactor(player, "atkUp", "atkDown"),
    rawAttack = Math.max(1, finite(stats.atk, 1)) * factor,
    rawMagic = Math.max(1, finite(stats.matk, stats.atk ?? 1)) * factor,
    conversion = Math.max(0, Math.min(1, projectedEffectValue(player, "magicToPhysical") + Math.max(0, finite(player?.equipmentCombatEffects?.magicToPhysical)) / 100)),
    attack = rawAttack + rawMagic * conversion,
    magic = rawMagic * (1 - conversion);
  if (skill?.damageClass === "magic") return Math.max(1, magic);
  if (skill?.damageClass === "hybrid") return Math.max(1, attack, magic);
  return Math.max(1, attack);
}

function enemyDefense(enemy, skill) {
  const raw = skill?.damageClass === "magic"
    ? finite(enemy?.mdef, enemy?.def)
    : skill?.damageClass === "hybrid"
      ? Math.min(finite(enemy?.def), finite(enemy?.mdef, enemy?.def))
      : finite(enemy?.def),
    ignore = Math.max(0, Math.min(.9, finite(skill?.defenseIgnore)));
  return Math.max(0, raw * projectedStatFactor(enemy, "defUp", "defDown") * (1 - ignore));
}

function estimatedDamage(player, enemy, skill = null) {
  if (skill?.fillHpDrain > 0) {
    return Math.max(0, Math.min(finite(enemy?.hp), finite(player?.maxHp) - finite(player?.hp)));
  }
  if (skill?.selfSacrificeHpDamage > 0) {
    return Math.max(1, Math.min(finite(enemy?.hp), Math.floor(finite(player?.hp) * Math.min(2, finite(skill.selfSacrificeHpDamage)))));
  }
  const stat = attackStat(player, skill), defense = enemyDefense(enemy, skill),
    power = skill ? Math.max(.01, finite(skill.power, 1)) : 1, hits = skill ? Math.max(1, Math.floor(finite(skill.hits, 1))) : 1,
    area = skillTargetsAll(skill) ? .75 : 1,
    element = skill?.element ?? player?.element ?? "neutral",
    attribute = attributeDamageMultiplier(element, enemy?.element ?? "neutral"),
    defenseRatio = stat / Math.max(1, stat + defense), maximumHp = Math.max(1, finite(enemy?.maxHp, enemy?.hp ?? 1)), currentHp = Math.max(0, finite(enemy?.hp)),
    critical = skill?.guaranteedCritical || hasProjectedEffect(player, "guaranteedCritical") ? 1.55 + Math.max(0, finite(player?.equipmentCombatEffects?.critDamage)) / 100 : 1,
    vulnerable = 1 + projectedEffectValue(enemy, "vulnerable"), guard = 1 - Math.max(0, Math.min(.8, projectedEffectValue(enemy, "guard"))),
    perHitCap = Math.max(1, Math.ceil(maximumHp * .9));
  let remaining = currentHp, direct = 0;
  for (let hit = 0; hit < hits && remaining > 0; hit++) {
    const execute = finite(skill?.execute) > 0 && ratio(remaining, maximumHp) <= finite(skill.execute) ? 2 : 1,
      perHit = Math.min(Math.max(1, Math.round(maximumHp * defenseRatio * .33 * power * area * attribute * execute * critical * vulnerable * guard)), perHitCap),
      dealt = Math.min(remaining, perHit);
    remaining -= dealt;
    direct += dealt;
  }
  const percentRate = Math.min(.25, Math.max(0, finite(skill?.currentHpDamage))),
    percent = percentRate > 0 && remaining > 0 ? Math.max(1, Math.floor(remaining * percentRate)) : 0;
  return Math.max(0, Math.min(currentHp, direct + percent));
}

function projectedBattleAfterCommittedSupport(player, battle, currentSkills) {
  const projectedPlayers = Object.fromEntries(Object.entries(battle?.players ?? {}).map(([id, ally]) => [id, {
    ...ally,
    effects: (ally?.effects ?? []).map(effect => ({ ...effect })),
  }]));
  const projected = { ...battle, players: projectedPlayers };
  const reviveProjected = (skill, actor, preferred = null) => {
    const fallen = preferred?.hp <= 0 && !revivalBlocked(preferred)
      ? preferred
      : Object.values(projectedPlayers).filter(ally => ally.hp <= 0 && !revivalBlocked(ally))
        .sort((left, right) => finite(right.maxHp) - finite(left.maxHp) || String(left.playerId).localeCompare(String(right.playerId)))[0];
    if (!fallen) return null;
    const transferRate = Math.max(0, Math.min(.9, finite(skill?.reviveTransferRate)));
    if (transferRate > 0 && actor) {
      const actorHp = Math.max(0, Math.floor(finite(actor.hp))), amount = Math.min(Math.max(0, actorHp - 1), Math.floor(actorHp * transferRate));
      if (amount <= 0) return null;
      actor.hp = actorHp - amount;
      fallen.hp = Math.max(1, Math.min(finite(fallen.maxHp, 1), amount));
    } else {
      fallen.hp = Math.max(1, Math.ceil(finite(fallen.maxHp, 1) * Math.max(.01, finite(skill?.revive, finite(skill?.heal, .35)))));
    }
    fallen.mp = Math.min(finite(fallen.maxMp), Math.ceil(finite(fallen.maxMp) * Math.max(0, finite(skill?.reviveMp))));
    for (const effect of skill?.revivedEffects ?? []) addProjectedEffect(fallen, effect);
    return fallen;
  };
  for (const [actionActorId, action] of Object.entries(battle?.actions ?? {})) {
    if (!action || actionActorId === player?.playerId) continue;
    const actor = battle?.players?.[actionActorId], projectedActor = projectedPlayers[actionActorId], target = projectedPlayers[action.targetId];
    if (!actsBefore(actor, player, battle)) continue;
    if (action.kind === "item" && target?.hp > 0) {
      projectHealing(projectedActor, target, .4, { useHealPower: false });
      target.mp = Math.min(finite(target.maxMp), finite(target.mp) + Math.ceil(finite(target.maxMp) * .25));
      continue;
    }
    if (action.kind !== "skill") continue;
    const availableSkills = Array.isArray(actor?.skills) ? actor.skills : actionActorId === player?.playerId ? currentSkills : [],
      skill = availableSkills.find(entry => entry?.id === action.skillId);
    if (!skill) continue;
    if (skill.kind === "revive") {
      reviveProjected(skill, projectedActor, target);
      continue;
    }
    if (["heal", "allHeal"].includes(skill.kind)) {
      const group = skill.kind === "allHeal" || skill.allAllies, targets = group
        ? Object.values(projectedPlayers).filter(ally => ally.hp > 0)
        : [target].filter(ally => ally?.hp > 0), rate = Math.max(.01, finite(skill.heal) || .25);
      for (const ally of targets) {
        projectHealing(projectedActor, ally, rate);
        if (skill.cleanse) clearProjectedNegative(ally);
      }
      if (finite(skill.revive) > 0 || finite(skill.reviveTransferRate) > 0) {
        const revived = reviveProjected(skill, projectedActor, target);
        if (revived) {
          if (skill.cleanse) clearProjectedNegative(revived);
          if (group && !targets.includes(revived)) targets.push(revived);
        }
      }
      applyProjectedSkillEffects(skill, projectedActor, targets);
      continue;
    }
    if (skill.kind === "mpHeal") {
      const targets = skill.allAllies ? Object.values(projectedPlayers).filter(ally => ally.hp > 0) : [target ?? projectedActor].filter(ally => ally?.hp > 0),
        rate = Math.max(.01, finite(skill.mpHeal, .25));
      for (const ally of targets) ally.mp = Math.min(ally.maxMp, finite(ally.mp) + Math.ceil(finite(ally.maxMp, 1) * rate));
      applyProjectedSkillEffects(skill, projectedActor, targets);
      continue;
    }
    if (skill.kind === "buff") {
      const living = Object.values(projectedPlayers).filter(ally => ally.hp > 0), targets = skill.allAllies ? living : [target].filter(ally => ally?.hp > 0);
      if (skill.cleanse) for (const ally of targets) clearProjectedNegative(ally);
      if (finite(skill.heal) > 0) for (const ally of targets) projectHealing(projectedActor, ally, finite(skill.heal));
      applyProjectedSkillEffects(skill, projectedActor, targets, living);
      continue;
    }
    if (skill.kind === "attack") {
      const living = Object.values(projectedPlayers).filter(ally => ally.hp > 0), attackTargets = skillTargetsAll(skill)
        ? (battle?.enemies ?? []).filter(enemy => finite(enemy.hp) > 0)
        : [(battle?.enemies ?? []).find(enemy => enemy.id === action.targetId && finite(enemy.hp) > 0) ?? (battle?.enemies ?? []).find(enemy => finite(enemy.hp) > 0)].filter(Boolean),
        dealt = attackTargets.reduce((sum, enemy) => sum + estimatedDamage(projectedActor, enemy, skill), 0),
        drainRate = skill.noLifeSteal ? 0 : Math.min(1.25, Math.max(0, finite(skill.drain)) + Math.max(0, finite(projectedActor?.equipmentCombatEffects?.lifeSteal)) / 100 + projectedEffectValue(projectedActor, "lifeSteal"));
      if (drainRate > 0 && dealt > 0 && finite(projectedActor.hp) > 0) {
        const received = Math.max(.05, 1 - Math.min(.95, projectedEffectValue(projectedActor, "healDown"))), gain = Math.max(1, Math.floor(dealt * drainRate * received));
        projectedActor.hp = Math.min(finite(projectedActor.maxHp, 1), finite(projectedActor.hp) + gain);
      }
      if (finite(skill.selfHeal) > 0 && finite(projectedActor.hp) > 0) projectHealing(projectedActor, projectedActor, finite(skill.selfHeal), { round: "floor" });
      if (finite(skill.revive) > 0 || finite(skill.reviveTransferRate) > 0) reviveProjected(skill, projectedActor, target);
      applyProjectedSkillEffects(skill, projectedActor, living, living);
    }
  }
  return projected;
}

function threatScore(enemy, enemies) {
  const raw = Math.max(1, finite(enemy?.atk) + finite(enemy?.matk) + finite(enemy?.spd) * .55),
    maximum = Math.max(1, ...enemies.map(value => finite(value?.atk) + finite(value?.matk) + finite(value?.spd) * .55)),
    hpRate = ratio(enemy?.hp, enemy?.maxHp);
  return raw / maximum + (enemy?.boss ? .35 : 0) + (hpRate <= .25 ? .2 : 0);
}

function bestBasicTarget(player, enemies) {
  return [...enemies].sort((left, right) => {
    const leftDamage = estimatedDamage(player, left), rightDamage = estimatedDamage(player, right),
      leftKill = leftDamage >= finite(left.hp) ? 1 : 0, rightKill = rightDamage >= finite(right.hp) ? 1 : 0;
    if (leftKill !== rightKill) return rightKill - leftKill;
    const leftValue = Math.min(finite(left.hp), leftDamage) * (1 + threatScore(left, enemies) * .35),
      rightValue = Math.min(finite(right.hp), rightDamage) * (1 + threatScore(right, enemies) * .35);
    return rightValue - leftValue || finite(left.hp) - finite(right.hp) || String(left.id).localeCompare(String(right.id));
  })[0] ?? null;
}

function bestAttackSkill(player, enemies, skills) {
  const candidates = [];
  for (const skill of skills.filter(entry => entry?.kind === "attack")) {
    const targets = skillTargetsAll(skill) ? enemies : enemies;
    for (const target of targets) {
      const affected = skillTargetsAll(skill) ? enemies : [target],
        outcomes = affected.map(enemy => ({ enemy, damage: estimatedDamage(player, enemy, skill) })),
        kills = outcomes.filter(outcome => outcome.damage >= finite(outcome.enemy.hp)).length,
        effective = outcomes.reduce((sum, outcome) => sum + Math.min(finite(outcome.enemy.hp), outcome.damage) * (1 + threatScore(outcome.enemy, enemies) * .35), 0),
        cost = Math.max(0, finite(skill.mp)), maximumMp = Math.max(1, finite(player.maxMp, player.mp ?? 1)),
        score = (effective + kills * Math.max(1, ...outcomes.map(outcome => finite(outcome.enemy.maxHp, outcome.enemy.hp))) * .22) / (1 + cost / maximumMp * .45);
      if (finite(skill.selfSacrificeHpDamage) <= 0 || kills > 0) candidates.push({ skill, target, outcomes, kills, effective, score });
      if (skillTargetsAll(skill)) break;
    }
  }
  return candidates.sort((left, right) => right.score - left.score || left.skill.mp - right.skill.mp || String(left.skill.id).localeCompare(String(right.skill.id)))[0] ?? null;
}

/**
 * Deterministic online auto-battle policy. It mirrors the offline recovery
 * thresholds, then evaluates finish potential, threat, attribute matchup and
 * MP reserve before spending a skill.
 */
export function chooseOnlineBattleAction(player, battle, skills = []) {
  const supportBattle = projectedBattleAfterCommittedSupport(player, battle, skills),
    actingPlayer = supportBattle.players?.[player?.playerId] ?? player,
    allies = Object.values(supportBattle.players ?? {}), livingAllies = allies.filter(ally => finite(ally.hp) > 0),
    enemies = (battle?.enemies ?? []).filter(enemy => finite(enemy.hp) > 0),
    cooldowns = player?.cooldowns ?? {}, currentMp = Math.max(0, finite(player?.mp)), maximumMp = Math.max(1, finite(player?.maxMp, currentMp || 1)),
    usable = (skills ?? []).filter(skill => skill && Math.max(0, finite(skill.mp)) <= currentMp && Math.max(0, finite(cooldowns[skill.id])) <= 0);

  if (!enemies.length) return ownerAction(player, { kind: "guard", targetId: player.playerId });

  // Keep the proven offline 32% / 52% / 58% utilization / 20% reserve rules.
  const support = chooseAutoBattleSupport(actingPlayer, supportBattle, usable);
  if (support) return ownerAction(player, { kind: "skill", skillId: support.skill.id, targetId: support.skill.selfOnly ? player.playerId : support.target.playerId });

  const afflicted = livingAllies.filter(hasNegativeEffect), cleanse = usable
    .filter(skill => skill.cleanse && ["buff", "heal", "allHeal"].includes(skill.kind))
    .sort((left, right) => finite(left.mp) - finite(right.mp))[0];
  if (cleanse && afflicted.length && (afflicted.length >= 2 || afflicted.some(ally => ratio(ally.hp, ally.maxHp) <= .6))) {
    const target = cleanse.allAllies ? afflicted[0] : [...afflicted].sort((a, b) => ratio(a.hp, a.maxHp) - ratio(b.hp, b.maxHp))[0];
    return ownerAction(player, { kind: "skill", skillId: cleanse.id, targetId: cleanse.selfOnly ? player.playerId : target.playerId });
  }

  const emergency = [...livingAllies].sort((left, right) => ratio(left.hp, left.maxHp) - ratio(right.hp, right.maxHp))[0];
  if (emergency && ratio(emergency.hp, emergency.maxHp) <= .22 && finite(player?.itemCharges) > 0) {
    return ownerAction(player, { kind: "item", targetId: emergency.playerId });
  }

  const basicTarget = bestBasicTarget(actingPlayer, enemies), basicDamage = basicTarget ? estimatedDamage(actingPlayer, basicTarget) : 0,
    attack = bestAttackSkill(actingPlayer, enemies, usable), partyCritical = livingAllies.some(ally => ratio(ally.hp, ally.maxHp) <= .32),
    selfCritical = ratio(actingPlayer?.hp, actingPlayer?.maxHp) <= .28;

  const basicSecuresKill = Boolean(basicTarget && basicDamage >= finite(basicTarget.hp));
  if (!basicSecuresKill) {
    const mpRecovery = usable.filter(skill => skill.kind === "mpHeal").map(skill => {
      const targets = skill.allAllies ? livingAllies : [livingAllies.find(ally => ally.playerId === player.playerId) ?? player],
        rate = Math.max(.01, finite(skill.mpHeal, .25)), nominal = targets.reduce((sum, ally) => sum + finite(ally.maxMp, 1) * rate, 0),
        effective = targets.reduce((sum, ally) => sum + Math.min(Math.max(0, finite(ally.maxMp) - finite(ally.mp)), finite(ally.maxMp, 1) * rate), 0),
        lowest = [...targets].sort((left, right) => ratio(left.mp, left.maxMp) - ratio(right.mp, right.maxMp) || String(left.playerId).localeCompare(String(right.playerId)))[0],
        cost = Math.max(0, finite(skill.mp));
      return { skill, target: lowest, effective, utilization: effective / Math.max(1, nominal), efficiency: effective / Math.max(1, cost) };
    }).filter(entry => entry.target && ratio(entry.target.mp, entry.target.maxMp) <= .35 && entry.utilization >= .5 && (currentMp - finite(entry.skill.mp) >= maximumMp * .20 || ratio(entry.target.mp, entry.target.maxMp) <= .20))
      .sort((left, right) => right.efficiency - left.efficiency || right.effective - left.effective || finite(left.skill.mp) - finite(right.skill.mp) || String(left.skill.id).localeCompare(String(right.skill.id)))[0];
    if (mpRecovery) return ownerAction(player, { kind: "skill", skillId: mpRecovery.skill.id, targetId: mpRecovery.target.playerId });

    const turn = Math.max(1, Math.floor(finite(battle?.round, 1))), dangerous = enemies.some(enemy => enemy?.boss) || enemies.length >= 3,
      tacticalWindow = turn <= 2 && dangerous || enemies.length <= 2 && (turn === 1 || (turn - 1) % 4 === 0),
      tactical = tacticalWindow ? usable.filter(skill => skill.kind === "buff" && !skill.cleanse && currentMp - finite(skill.mp) >= maximumMp * .20).filter(skill => {
        const targets = skill.allAllies ? livingAllies : [allies.find(ally => ally.playerId === player.playerId) ?? player];
        const effects = (skill.effects ?? []).filter(effect => !effect?.enemy && effect?.kind);
        const effectsUseful = effects.some(effect => {
          const affected = effect.allies ? targets : [allies.find(ally => ally.playerId === player.playerId) ?? player];
          return affected.some(ally => !(ally.effects ?? []).some(active => active.kind === effect.kind && finite(active.turns, 1) > 0));
        });
        const shieldUseful = finite(skill.partyShieldRate) > 0 && livingAllies.some(ally => finite(ally.shield) < Math.ceil(finite(ally.maxHp, 1) * finite(skill.partyShieldRate)));
        return effectsUseful || shieldUseful;
      }).sort((left, right) => finite(right.partyShieldRate) - finite(left.partyShieldRate) || finite(left.mp) - finite(right.mp) || String(left.id).localeCompare(String(right.id)))[0] : null;
    if (tactical) return ownerAction(player, { kind: "skill", skillId: tactical.id, targetId: player.playerId });
  }

  if (attack) {
    const basicValue = basicTarget ? Math.min(finite(basicTarget.hp), basicDamage) * (1 + threatScore(basicTarget, enemies) * .35) : 0,
      targetOutcome = attack.outcomes.find(outcome => outcome.enemy === attack.target) ?? attack.outcomes[0],
      skillSecuresKill = attack.kills > 0 && !(basicTarget && basicDamage >= finite(basicTarget.hp)),
      areaAdvantage = skillTargetsAll(attack.skill) && enemies.length >= 2,
      favorable = attributeDamageMultiplier(attack.skill.element ?? player?.element, attack.target?.element) > attributeDamageMultiplier(player?.element, attack.target?.element),
      leavesReserve = currentMp - finite(attack.skill.mp) >= maximumMp * .20,
      urgent = skillSecuresKill || partyCritical || Boolean(attack.target?.boss && currentMp - finite(attack.skill.mp) >= maximumMp * .08),
      worthwhile = attack.score >= Math.max(1, basicValue) * 1.15 || skillSecuresKill || areaAdvantage || favorable,
      avoidsWaste = !(targetOutcome && basicDamage >= finite(attack.target.hp) && finite(attack.skill.mp) > 0);
    if (worthwhile && avoidsWaste && (leavesReserve || urgent)) {
      return ownerAction(player, { kind: "skill", skillId: attack.skill.id, targetId: attack.target.id });
    }
  }

  if (selfCritical && !basicTarget?.boss && basicDamage < finite(basicTarget?.hp)) {
    const guardSkill = usable.filter(skill => skill.kind === "guard").sort((left, right) => finite(left.mp) - finite(right.mp))[0];
    if (guardSkill) return ownerAction(player, { kind: "skill", skillId: guardSkill.id, targetId: player.playerId });
    if (finite(player?.itemCharges) > 0) return ownerAction(player, { kind: "item", targetId: player.playerId });
    return ownerAction(player, { kind: "guard", targetId: player.playerId });
  }

  return ownerAction(player, { kind: "attack", targetId: basicTarget?.id ?? enemies[0].id });
}
