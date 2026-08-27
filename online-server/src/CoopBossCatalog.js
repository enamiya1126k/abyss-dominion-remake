const COOP_BOSSES = Object.freeze([
  Object.freeze({
    id: "stormfang-lygalm",
    name: "雷鎖牙獣・ライガルム",
    title: "双雷を束ねる共鳴獣",
    speciesId: "stormfang_behemoth",
    visualSpeciesId: "stormfang_behemoth",
    emoji: "🐺",
    element: "lightning",
    accent: "#6ee7ff",
    intro: "同じラウンドに2人以上で攻撃し、雷鎖を逆流させろ。",
    mechanic: Object.freeze({
      id: "linked-assault",
      name: "双牙共振",
      shortLabel: "2人以上で攻撃",
      instruction: "このラウンドに2人以上が攻撃すると共鳴成功。ボスへ被ダメージ+35%を付与。",
      success: "雷鎖逆流",
      failure: "雷鎖暴走",
    }),
    stats: Object.freeze({ hp: 9, atk: 1.42, matk: 1.35, def: 1.28, mdef: 1.25, spd: 1.28 }),
    actions: Object.freeze([
      Object.freeze({ id: "thunder-fang", label: "雷鎖牙", type: "attack", pattern: "random2", power: .82, element: "lightning", ai: { base: 58 } }),
      Object.freeze({ id: "sky-chain-roar", label: "天雷鎖咆", type: "attack", pattern: "all", power: .7, element: "lightning", status: { id: "paralysis", name: "感電", chance: .14, power: 0, turns: 1 }, cooldown: 2, ai: { base: 34, partySizeAtLeast: 2 } }),
    ]),
  }),
  Object.freeze({
    id: "frozen-mirror-graciel",
    name: "凍鏡騎王・グラシエル",
    title: "守りを試す凍界の騎王",
    speciesId: "frozen_mirror_knight",
    visualSpeciesId: "frozen_mirror_knight",
    emoji: "🛡️",
    element: "ice",
    accent: "#9bdcff",
    intro: "仲間と同時に防御し、凍鏡の反射を受け流せ。",
    mechanic: Object.freeze({
      id: "mirror-guard",
      name: "凍鏡反照",
      shortLabel: "2人で防御",
      instruction: "このラウンドに2人以上が防御すると共鳴成功。全員へHP10%の障壁を展開。",
      success: "凍鏡防壁",
      failure: "反照増幅",
    }),
    stats: Object.freeze({ hp: 10, atk: 1.34, matk: 1.42, def: 1.52, mdef: 1.5, spd: 1.05 }),
    actions: Object.freeze([
      Object.freeze({ id: "mirror-sword", label: "凍鏡反閃", type: "attack", pattern: "singleStrong", power: 1.02, element: "ice", ai: { base: 55 } }),
      Object.freeze({ id: "zero-mirror", label: "零界鏡陣", type: "attack", pattern: "all", power: .66, element: "ice", status: { id: "freeze", name: "凍結", chance: .12, power: 0, turns: 1 }, cooldown: 2, ai: { base: 38, partySizeAtLeast: 2 } }),
    ]),
  }),
  Object.freeze({
    id: "void-gate-arcanos",
    name: "虚環門主・アルカノス",
    title: "攻守の分担を喰らう虚無門",
    speciesId: "void_archon",
    visualSpeciesId: "void_archon",
    emoji: "◉",
    element: "dark",
    accent: "#d78cff",
    intro: "攻撃役と支援役に分かれ、虚環の位相を同時に崩せ。",
    mechanic: Object.freeze({
      id: "dual-role",
      name: "虚環二相",
      shortLabel: "攻撃＋支援",
      instruction: "同じラウンドに攻撃役と支援役が1人ずつ行動すると共鳴成功。",
      success: "二相崩壊",
      failure: "虚環侵蝕",
    }),
    stats: Object.freeze({ hp: 11, atk: 1.38, matk: 1.52, def: 1.36, mdef: 1.42, spd: 1.16 }),
    actions: Object.freeze([
      Object.freeze({ id: "void-lance", label: "虚環穿ち", type: "attack", pattern: "random3", power: .68, damageClass: "magic", element: "dark", mpDrain: .08, ai: { base: 55 } }),
      Object.freeze({ id: "hollow-domain", label: "無響界門", type: "attack", pattern: "all", power: .62, damageClass: "magic", element: "dark", effects: [{ enemy: true, kind: "healDown", value: .25, turns: 2, chance: .55 }], cooldown: 2, ai: { base: 38, partySizeAtLeast: 2 } }),
    ]),
  }),
]);

function hashText(value) {
  let hash = 2166136261;
  for (const char of String(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

export function coopBossFor({ ownerId = "ROOM", floor = 1 } = {}) {
  const index = hashText(`build227:coop-boss:${ownerId}:${Math.max(1, Math.floor(Number(floor) || 1))}`) % COOP_BOSSES.length;
  const boss = COOP_BOSSES[index] ?? COOP_BOSSES[0];
  return {
    ...boss,
    mechanic: { ...boss.mechanic },
    stats: { ...boss.stats },
    actions: boss.actions.map(action => ({ ...action, ai: { ...(action.ai ?? {}) }, effects: action.effects?.map(effect => ({ ...effect })), status: action.status ? { ...action.status } : null })),
  };
}

export function coopBossObjectMeta(boss) {
  if (!boss) return {};
  return {
    coopBossId: boss.id,
    id: boss.id,
    name: boss.name,
    title: boss.title,
    intro: boss.intro,
    bossName: boss.name,
    bossTitle: boss.title,
    bossIntro: boss.intro,
    speciesId: boss.speciesId,
    visualSpeciesId: boss.visualSpeciesId,
    element: boss.element,
    accent: boss.accent,
    mechanic: { ...boss.mechanic },
  };
}

export function coopBossDailyKey(now = Date.now()) {
  const jst = new Date(Number(now) + 9 * 60 * 60 * 1000);
  return `${jst.getUTCFullYear()}-${String(jst.getUTCMonth() + 1).padStart(2, "0")}-${String(jst.getUTCDate()).padStart(2, "0")}`;
}

export const COOP_BOSS_CATALOG = COOP_BOSSES;
