function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hpRatio(ally) {
  return Math.max(0, number(ally?.hp)) / Math.max(1, number(ally?.maxHp, 1));
}

function canRevive(skill) {
  return skill?.kind === "revive" || number(skill?.revive) > 0 || number(skill?.reviveTransferRate) > 0;
}

function canFundReviveTransfer(player, skill) {
  const rate = Math.max(0, Math.min(.9, number(skill?.reviveTransferRate)));
  if (rate <= 0) return true;
  const current = Math.max(0, Math.floor(number(player?.hp))), maximum = Math.max(1, Math.floor(number(player?.maxHp, 1)));
  const preHeal = current > 0 && ["heal", "allHeal"].includes(skill?.kind)
    ? Math.ceil(maximum * Math.max(0, number(skill?.heal)))
    : 0;
  const hp = Math.min(maximum, current + preHeal);
  return Math.min(Math.max(0, hp - 1), Math.floor(hp * rate)) > 0;
}

function revivalBlocked(ally) {
  return (ally?.effects ?? []).some(effect => String(effect?.kind ?? "") === "reviveSeal" && number(effect?.turns, 1) > 0);
}

export function chooseAutoBattleSupport(player, battle, skills = []) {
  const allies = Object.values(battle?.players ?? {}), living = allies.filter(ally => ally.hp > 0), fallen = allies.filter(ally => ally.hp <= 0 && !revivalBlocked(ally)),
    usable = (skills ?? []).filter(skill => Math.max(0, number(skill?.mp)) <= Math.max(0, number(player?.mp)));

  if (fallen.length) {
    const skill = usable.filter(entry => canRevive(entry) && canFundReviveTransfer(player, entry)).sort((left, right) => number(left.mp) - number(right.mp) || String(left.id).localeCompare(String(right.id)))[0],
      target = [...fallen].sort((left, right) => number(right.maxHp) - number(left.maxHp) || String(left.playerId).localeCompare(String(right.playerId)))[0];
    if (skill && target) return { skill, target };
  }
  if (!living.length) return null;

  const critical = living.some(ally => hpRatio(ally) <= .32), wounded = living.filter(ally => hpRatio(ally) <= .52).length,
    lowest = [...living].sort((left, right) => hpRatio(left) - hpRatio(right) || String(left.playerId).localeCompare(String(right.playerId)))[0],
    reserve = Math.max(0, number(player?.maxMp)) * .20;
  const candidates = usable.filter(skill => ["heal", "allHeal"].includes(skill.kind)).map(skill => {
    const targets = skill.kind === "allHeal" || skill.allAllies ? living : [lowest], rate = Math.max(.01, number(skill.heal, .25)),
      nominal = targets.reduce((sum, target) => sum + Math.max(1, number(target.maxHp, 1)) * rate, 0),
      effective = targets.reduce((sum, target) => sum + Math.min(Math.max(0, number(target.maxHp, 1) - number(target.hp)), Math.max(1, number(target.maxHp, 1)) * rate), 0),
      cost = Math.max(0, number(skill.mp));
    return { skill, target: targets[0], group: targets.length > 1, effective, utilization: effective / Math.max(1, nominal), efficiency: effective / Math.max(1, cost) };
  }).filter(entry => entry.utilization >= .58 && (critical || number(player.mp) - number(entry.skill.mp) >= reserve));
  const groupNeeded = critical || wounded >= 2,
    choice = candidates.filter(entry => entry.group ? groupNeeded : hpRatio(lowest) <= .34)
      .sort((left, right) => right.efficiency - left.efficiency || right.effective - left.effective || number(left.skill.mp) - number(right.skill.mp) || String(left.skill.id).localeCompare(String(right.skill.id)))[0];
  return choice ? { skill: choice.skill, target: choice.target } : null;
}
