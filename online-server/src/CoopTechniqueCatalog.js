const TECHNIQUES = Object.freeze({
  "triad-dominion": Object.freeze({
    id: "triad-dominion",
    name: "三位深淵陣",
    shortLabel: "攻＋防＋支",
    effectText: "敵へ被ダメージ+15%・味方へHP10%障壁・攻撃/魔力+10%",
    points: 3,
    linkLabel: "TRINITY LINK",
  }),
  "resonance-break": Object.freeze({
    id: "resonance-break",
    name: "共鳴連撃",
    shortLabel: "同敵へ攻撃×2",
    effectText: "対象へ被ダメージ+35%",
    points: 1,
    linkLabel: "LINK",
  }),
  "aegis-cross": Object.freeze({
    id: "aegis-cross",
    name: "護刃結界",
    shortLabel: "攻撃＋防御",
    effectText: "生存者全員へ最大HP10%の障壁",
    points: 2,
    linkLabel: "AEGIS LINK",
  }),
  "battle-chorus": Object.freeze({
    id: "battle-chorus",
    name: "戦脈鼓舞",
    shortLabel: "攻撃＋支援",
    effectText: "生存者全員の攻撃・魔力+10%",
    points: 2,
    linkLabel: "BRAVE LINK",
  }),
  "life-chorus": Object.freeze({
    id: "life-chorus",
    name: "命脈唱和",
    shortLabel: "支援×2",
    effectText: "生存者全員のHP10%・MP6%回復",
    points: 2,
    linkLabel: "LIFE LINK",
  }),
});

function cloneTechnique(technique) {
  return technique ? { ...technique } : null;
}

function actionRole(entry) {
  const action = entry?.action ?? {};
  if (action.kind === "attack") return "offense";
  if (action.kind === "guard") return "guard";
  if (action.kind === "item") return "support";
  if (action.kind !== "skill" || !entry.skillKind) return null;
  if (entry.skillKind === "attack") return "offense";
  if (entry.skillKind === "guard") return "guard";
  return "support";
}

function distinctTriad(offense, guarding, support) {
  for (const attacker of offense) for (const guard of guarding) for (const helper of support) {
    const ids = [attacker.playerId, guard.playerId, helper.playerId];
    if (new Set(ids).size === 3) return { actorIds: ids, targetId: attacker.action.targetId ?? null };
  }
  return null;
}

function distinctPair(left, right) {
  for (const first of left) for (const second of right) {
    if (first.playerId !== second.playerId) return { actorIds: [first.playerId, second.playerId], targetId: first.action.targetId ?? null };
  }
  return null;
}

function sameTargetAssault(offense) {
  const groups = new Map();
  for (const entry of offense) {
    const targetId = String(entry.action.targetId ?? "");
    if (!targetId) continue;
    const list = groups.get(targetId) ?? [];
    list.push(entry);
    groups.set(targetId, list);
  }
  const selected = [...groups.entries()]
    .filter(([, entries]) => entries.length >= 2)
    .sort((left, right) => right[1].length - left[1].length || left[0].localeCompare(right[0]))[0];
  if (!selected) return null;
  return { targetId: selected[0], actorIds: selected[1].map(entry => entry.playerId), chain: selected[1].length };
}

export function coopTechniqueRecipes() {
  return Object.values(TECHNIQUES).map(cloneTechnique);
}

export function coopTechniqueFor(id) {
  return cloneTechnique(TECHNIQUES[String(id)]);
}

export function detectCoopTechnique(entries = []) {
  const normalized = (Array.isArray(entries) ? entries : [])
    .filter(entry => entry?.playerId && entry?.action)
    .map(entry => ({ ...entry, playerId: String(entry.playerId), role: actionRole(entry) }))
    .filter(entry => entry.role)
    .sort((left, right) => left.playerId.localeCompare(right.playerId)
      || left.role.localeCompare(right.role)
      || String(left.action.kind ?? "").localeCompare(String(right.action.kind ?? ""))
      || String(left.action.skillId ?? "").localeCompare(String(right.action.skillId ?? ""))
      || String(left.action.targetId ?? "").localeCompare(String(right.action.targetId ?? "")))
    .filter((entry, index, rows) => index === 0 || rows[index - 1].playerId !== entry.playerId);
  if (new Set(normalized.map(entry => entry.playerId)).size < 2) return null;

  const offense = normalized.filter(entry => entry.role === "offense");
  const guarding = normalized.filter(entry => entry.role === "guard");
  const support = normalized.filter(entry => entry.role === "support");
  const triad = distinctTriad(offense, guarding, support);
  if (triad) return { ...cloneTechnique(TECHNIQUES["triad-dominion"]), ...triad, perfect: true };

  const assault = sameTargetAssault(offense);
  if (assault) {
    const points = assault.chain >= 4 ? 3 : assault.chain === 3 ? 2 : 1;
    const linkLabel = assault.chain >= 4 ? "PERFECT LINK" : assault.chain === 3 ? "GREAT LINK" : "LINK";
    return { ...cloneTechnique(TECHNIQUES["resonance-break"]), ...assault, points, linkLabel, perfect: assault.chain >= 4 };
  }

  const aegis = distinctPair(offense, guarding);
  if (aegis) return { ...cloneTechnique(TECHNIQUES["aegis-cross"]), ...aegis };
  const brave = distinctPair(offense, support);
  if (brave) return { ...cloneTechnique(TECHNIQUES["battle-chorus"]), ...brave };
  const life = distinctPair(support, support);
  if (life) return { ...cloneTechnique(TECHNIQUES["life-chorus"]), ...life, targetId: null };
  return null;
}

export const COOP_TECHNIQUE_CATALOG = TECHNIQUES;
