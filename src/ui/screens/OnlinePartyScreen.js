import { SPECIES } from "../../data/species.js?v=2.11.0-build164";
import { displayName, calculatedStats } from "../../models/Monster.js?v=2.11.30-build195";
import { monsterCombatPower, formatCombatPower } from "../../core/CombatPower.js?v=2.11.30-build195";
import { magicCircleById, equippedMagicCircle, goldPowerDamageMultiplier, goldPowerActionCost } from "../../core/MagicCircleSystem.js?v=2.11.0-build164";
import { learnedSkills, maxMp, effectiveSkillMpCost, applySkillMastery } from "../../battle/SkillSystem.js?v=2.11.30-build195";
import { signatureWeaponForMonster, signatureWeaponOwnerId } from "../../core/SignatureWeaponSystem.js?v=2.11.0-build164";
import { monsterVisual } from "../MonsterVisual.js?v=2.11.0-build164";
import { resourceHud, pixelIcon } from "../components/GameChrome.js?v=2.11.0-build164";

export const ONLINE_STORAGE_KEYS = Object.freeze({
  friendId: "abyss-dominion-online-friend-id",
  clientKey: "abyss-dominion-online-client-key",
  resumeToken: "abyss-dominion-online-resume-token",
  serverUrl: "abyss-dominion-online-server-url",
  displayName: "abyss-dominion-online-display-name",
  monsterId: "abyss-dominion-online-monster-id",
  route: "abyss-dominion-online-route",
  autoConnect: "abyss-dominion-online-auto-connect",
});

const EQUIPMENT_SLOTS = Object.freeze([
  ["weaponRight", "右手"], ["weaponLeft", "左手"], ["accessoryNeck", "首"],
  ["accessoryFinger", "指"], ["armorBody", "胴"], ["armorSupport", "補助"],
]);

export function escapeOnlineHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function storageGet(key, fallback = "") {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, String(value)); } catch {}
}

function randomToken(length = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(length);
  globalThis.crypto?.getRandomValues?.(bytes);
  return Array.from(bytes, (value, index) => alphabet[(value || Math.floor(Math.random() * 256) + index) % alphabet.length]).join("");
}

export function ensureOnlineIdentity() {
  let friendId = storageGet(ONLINE_STORAGE_KEYS.friendId);
  let clientKey = storageGet(ONLINE_STORAGE_KEYS.clientKey);
  if (!/^AD-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(friendId)) {
    friendId = `AD-${randomToken(4)}-${randomToken(4)}`;
    storageSet(ONLINE_STORAGE_KEYS.friendId, friendId);
  }
  if (clientKey.length < 24) {
    clientKey = `${randomToken(16)}${randomToken(16)}`;
    storageSet(ONLINE_STORAGE_KEYS.clientKey, clientKey);
  }
  return { friendId, clientKey };
}

function inviteParameters() {
  try {
    const params = new URLSearchParams(location.search);
    return {
      server: params.get("partyServer") ?? "",
      room: (params.get("partyRoom") ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6),
    };
  } catch { return { server: "", room: "" }; }
}

function selectedPartyMonster(state, requestedId = null) {
  const party = (state.party ?? []).map(id => state.monsters?.find(monster => monster.id === id)).filter(Boolean);
  const savedId = requestedId || storageGet(ONLINE_STORAGE_KEYS.monsterId);
  const monster = party.find(entry => entry.id === savedId) ?? party[0] ?? state.monsters?.[0] ?? null;
  if (monster) storageSet(ONLINE_STORAGE_KEYS.monsterId, monster.id);
  return { party, monster };
}

function equipmentProfile(state, monster) {
  const items = new Map((state.equipment ?? []).map(item => [item.id, item]));
  return EQUIPMENT_SLOTS.map(([slot, label]) => {
    const item = items.get(monster?.equipment?.[slot]);
    return item ? {
      slot, label, name: item.name ?? "装備", rarity: item.rarity ?? item.displayRarity ?? "N",
      level: Math.max(1, Number(item.level) || 1), plus: Math.max(0, Number(item.plus) || 0),
      signatureOwnerId: signatureWeaponOwnerId(item),
    } : { slot, label, name: "なし", rarity: "", level: 0, plus: 0, signatureOwnerId: null };
  });
}

function onlineSkillKind(skill) {
  const type = String(skill?.type ?? "");
  if (type === "revive") return "revive";
  if (type === "allHeal") return "allHeal";
  if (type === "selfHeal" || type === "heal") return "heal";
  if (type === "mpHeal") return "mpHeal";
  if (["stance", "buff", "cleanse"].includes(type)) return "buff";
  if (["guard", "defend"].includes(type)) return "guard";
  return "attack";
}

function onlineSkillProfile(monster) {
  return learnedSkills(monster).slice(0, 16).map(baseSkill => {
    const skill = applySkillMastery(monster, baseSkill);
    return {
      id: skill.id,
      name: skill.name ?? "スキル",
      description: skill.description ?? "特殊効果を発動",
      kind: onlineSkillKind(skill),
      mp: effectiveSkillMpCost(monster, skill),
      power: Math.max(.1, Number(skill.power) || 1),
      heal: Math.max(0, Number(skill.heal) || Number(skill.revive) || 0),
      revive: Math.max(0, Number(skill.revive) || 0),
      reviveMp: Math.max(0, Number(skill.reviveMp) || 0),
      mpHeal: Math.max(0, Number(skill.mpHeal) || 0),
      hits: Math.max(1, Number(skill.hits) || 1),
      allEnemies: Boolean(skill.allEnemies || String(skill.target ?? "").includes("敵全体")),
      allAllies: Boolean(skill.allies || String(skill.target ?? "").includes("味方全体") || skill.type === "allHeal"),
      guaranteedHit: Boolean(skill.guaranteedHit),
      guaranteedCritical: Boolean(skill.guaranteedCritical),
      defenseIgnore: Math.max(0, Math.min(1, Number(skill.defenseIgnore) || 0)),
      critBonus: Math.max(0, Math.min(1, Number(skill.critBonus) || 0)),
      drain: Math.max(0, Math.min(1, Number(skill.drain) || 0)),
      selfHeal: Math.max(0, Math.min(1, Number(skill.selfHeal) || 0)),
      currentHpDamage: Math.max(0, Math.min(1, Number(skill.currentHpDamage) || 0)),
      execute: Math.max(0, Math.min(1, Number(skill.execute) || 0)),
      barrier: Math.max(0, Number(skill.barrier) || 0),
      selfShieldRate: Math.max(0, Math.min(.8, Number(skill.selfShieldRate) || 0)),
      selfSacrificeHpDamage: Math.max(0, Number(skill.selfSacrificeHpDamage) || 0),
      noLifeSteal: Boolean(skill.noLifeSteal),
      cleanse: Boolean(skill.cleanse || skill.type === "cleanse"),
      damageClass: skill.damageClass === "magic" ? "magic" : skill.damageClass === "hybrid" ? "hybrid" : "physical",
      element: skill.element ?? monster.attribute ?? SPECIES[monster.speciesId]?.element ?? "neutral",
      equipmentGranted: Boolean(skill.equipmentGranted),
      equipmentAuthorityId: skill.equipmentAuthorityId ?? null,
      equipmentAuthorityName: skill.equipmentAuthorityName ?? null,
      tag: skill.tag ?? null,
      partyShieldRate: Math.max(0, Number(skill.partyShieldRate) || 0),
      hpShieldRate: Math.max(0, Number(skill.hpShieldRate) || 0),
      cooldown: Math.max(0, Number(skill.cooldown) || 0),
      dispelEnemyBuff: Boolean(skill.dispelEnemyBuff), dispelOne: Boolean(skill.dispelOne),
      removeEnemyMagicCircle: Boolean(skill.removeEnemyMagicCircle), breakAllyMagicCircle: Boolean(skill.breakAllyMagicCircle),
      reviveTransferRate: Math.max(0, Math.min(1, Number(skill.reviveTransferRate) || 0)),
      reducePartyCooldowns: Math.max(0, Number(skill.reducePartyCooldowns) || 0),
      increaseAllyCooldowns: Math.max(0, Number(skill.increaseAllyCooldowns) || 0),
      increaseEnemyCooldowns: Math.max(0, Number(skill.increaseEnemyCooldowns) || 0),
      selfHpCostRate: Math.max(0, Math.min(1, Number(skill.selfHpCostRate) || 0)),
      mpDrain: Math.max(0, Math.min(1, Number(skill.mpDrain) || 0)),
      turnPowerStep: Math.max(0, Number(skill.turnPowerStep) || 0), turnPowerCap: Math.max(0, Number(skill.turnPowerCap) || 0), repeatDelay: Math.max(0, Math.min(12, Math.floor(Number(skill.repeatDelay) || 0))),
      lowHpBonus: Math.max(0, Number(skill.lowHpBonus) || 0), lowHpThreshold: Math.max(0, Math.min(1, Number(skill.lowHpThreshold) || 0)),
      bonusVsEnemyBuff: Math.max(0, Number(skill.bonusVsEnemyBuff?.multiplier ?? skill.bonusVsEnemyBuff) > 1 ? Number(skill.bonusVsEnemyBuff?.multiplier ?? skill.bonusVsEnemyBuff) - 1 : Number(skill.bonusVsEnemyBuff?.multiplier ?? skill.bonusVsEnemyBuff) || 0),
      bonusVsStatus: Math.max(0, Number(skill.bonusVsStatus?.multiplier ?? skill.bonusVsStatus) > 1 ? Number(skill.bonusVsStatus?.multiplier ?? skill.bonusVsStatus) - 1 : Number(skill.bonusVsStatus?.multiplier ?? skill.bonusVsStatus) || 0),
      bonusVsStatusId: skill.bonusVsStatus?.id == null ? null : String(skill.bonusVsStatus.id).slice(0, 40),
      bonusVsEffect: Math.max(0, Number(skill.bonusVsEffect?.multiplier ?? skill.bonusVsEffect) > 1 ? Number(skill.bonusVsEffect?.multiplier ?? skill.bonusVsEffect) - 1 : Number(skill.bonusVsEffect?.multiplier ?? skill.bonusVsEffect) || 0),
      bonusVsEffectKind: skill.bonusVsEffect?.kind == null ? null : String(skill.bonusVsEffect.kind).slice(0, 40),
      fillHpDrain: Math.max(0, Number(skill.fillHpDrain) || 0), randomElement: Boolean(skill.randomElement),
      invertEnemyBuffRate: Math.max(0, Number(skill.invertEnemyBuffRate) || 0), invertOneBuff: Boolean(skill.invertOneBuff), invertRate: Math.max(0, Number(skill.invertRate) || 0),
      stealEnemyBuffRate: Math.max(0, Number(skill.stealEnemyBuffRate) || 0), stealOneBuffRate: Math.max(0, Number(skill.stealOneBuffRate) || 0),
      clearNegativeSelf: Boolean(skill.clearNegativeSelf), copyAtk: Math.max(0, Number(skill.copyAtk) || 0), selfAtk: Math.max(0, Number(skill.selfAtk) || 0),
      revivedEffects: (skill.revivedEffects ?? []).slice(0, 8).map(effect => ({
        kind: String(effect.kind ?? ""), value: Math.max(0, Number(effect.value) || 0), turns: Math.max(1, Number(effect.turns) || 1), allies: true, enemy: false,
      })),
      effects: (skill.effects ?? []).slice(0, 10).map(effect => ({
        kind: String(effect.kind ?? ""), value: Math.max(0, Number(effect.value) || 0),
        turns: Math.max(1, Number(effect.turns) || 1), allies: Boolean(effect.allies), enemy: Boolean(effect.enemy),
        chance: effect.chance == null ? null : Math.max(0, Math.min(1, Number(effect.chance) || 0)),
        statusId: effect.statusId == null ? null : String(effect.statusId).slice(0, 40), selfCost: Math.max(0, Number(effect.selfCost) || 0),
      })),
      status: skill.status ? {
        id: String(skill.status.id ?? "status"), name: String(skill.status.name ?? "状態異常"),
        chance: Math.max(0, Math.min(1, Number(skill.status.chance) || 0)),
        power: Math.max(0, Number(skill.status.power) || 0), turns: Math.max(1, Number(skill.status.turns) || 1),
      } : null,
    };
  });
}

function onlineEquipmentAuthorities(monster) {
  return (Array.isArray(monster?._equipmentAuthorities) ? monster._equipmentAuthorities : []).slice(0, 6).map(authority => ({
    id: String(authority?.id ?? "equipment-authority").slice(0, 80),
    name: String(authority?.name ?? "装備固有能力").slice(0, 40),
    description: String(authority?.description ?? "").slice(0, 180),
    fixedEffects: Object.fromEntries(Object.entries(authority?.fixedEffects ?? {}).filter(([, value]) => Number.isFinite(Number(value))).slice(0, 24).map(([key, value]) => [String(key).slice(0, 40), Number(value)])),
    skillId: authority?.skillId == null ? null : String(authority.skillId).slice(0, 80),
    skillName: authority?.skillName == null ? null : String(authority.skillName).slice(0, 60),
    itemName: authority?.itemName == null ? null : String(authority.itemName).slice(0, 60),
  }));
}

function onlineEquipmentCombatEffects(monster) {
  const source = { ...(monster?._equipmentAffixes ?? {}) };
  const series = monster?._seriesEffects ?? {};
  if (Number(series.lastStand) > 0) source.lastStand = 1;
  if (Number(series.firstStrike) > 0) source.firstStrike = 1;
  if (Number(series.mpRegen) > 0) source.mpRegenFlat = Number(series.mpRegen);
  if (Number(series.partyHpRegen) > 0) source.partyHpRegen = Number(series.partyHpRegen) * 100;
  if (Number(series.lowHpRegen) > 0) source.lowHpRegen = Number(series.lowHpRegen) * 100;
  return Object.fromEntries(Object.entries(source)
    .filter(([, value]) => Number.isFinite(Number(value)))
    .slice(0, 72)
    .map(([key, value]) => [String(key).slice(0, 40), Number(value)]));
}

function onlineAbyssSkillEffects(monster) {
  return Object.fromEntries(Object.entries(monster?._abyssSkillEffects ?? {})
    .filter(([, value]) => Number.isFinite(Number(value)))
    .slice(0, 64)
    .map(([key, value]) => [String(key).slice(0, 40), Number(value)]));
}

function onlineRewardModifiers(state) {
  const byId = new Map((state?.monsters ?? []).map(monster => [monster.id, monster]));
  const party = (state?.party ?? []).map(id => byId.get(id)).filter(Boolean);
  const sumAffix = (key, cap) => Math.max(0, Math.min(cap, party.reduce((sum, monster) => sum + Math.max(0, Number(monster?._equipmentAffixes?.[key]) || 0), 0)));
  return { partyGoldGain: sumAffix("goldGain", 300), partyDropRate: sumAffix("dropRate", 200), partyTreasureSense: sumAffix("treasureSense", 200) };
}

export function buildOnlinePartyProfile(state, { monsterId = null, displayName: onlineName = "" } = {}) {
  const { monster } = selectedPartyMonster(state, monsterId);
  if (!monster) return {
    displayName: onlineName || "冒険者", monsterId: null, speciesId: "slime", visualSpeciesId: null, endgameBossId: null, floorBossCatalogId: null, summonTier: null, summonRarity: null, endgameFaction: null, monsterName: "未編成",
    fallbackEmoji: "？", level: 1, stars: 1, plus: 0, power: 0, maxFloor: 1, attribute: "neutral",
    circleId: "none", circleName: "魔法陣なし", circleLevel: 0, circleEffect: "none", goldPowerMultiplier: 1, goldPowerActionCost: 0, goldPowerGold: 0, equipment: [], equipmentAuthorities: [], equipmentCombatEffects: {}, abyssSkillEffects: {}, rewardModifiers: {},
    battleStats: { hp: 100, mp: 10, atk: 10, matk: 10, def: 5, mdef: 5, spd: 10, crit: 5, evasion: 3, accuracy: 100 },
    currentHp: 100, currentMp: 10, skills: [], captureStock: 0, abyssKeyStock: 0,
    explorePickupDone: Boolean(state?.settings?.contextualGuide?.completed?.explore_pickup),
  };
  const species = SPECIES[monster.speciesId] ?? {};
  const circle = equippedMagicCircle(monster, state);
  const stats = calculatedStats(monster);
  const signature = signatureWeaponForMonster(state, monster);
  return {
    displayName: String(onlineName || displayName(monster) || "冒険者").trim().slice(0, 16),
    monsterId: monster.id, speciesId: monster.speciesId, visualSpeciesId: monster.visualSpeciesId ?? null,
    endgameBossId: monster.endgameBossId ?? null, floorBossCatalogId: monster.floorBossCatalogId ?? monster.floorBossId ?? null,
    summonTier: monster.summonTier ?? monster.summonRarity ?? null, summonRarity: monster.summonRarity ?? monster.summonTier ?? null, endgameFaction: monster.endgameFaction ?? null,
    monsterName: displayName(monster), fallbackEmoji: species.emoji ?? "魔",
    level: Math.max(1, Number(monster.level) || 1), stars: Math.max(1, Number(monster.stars) || 1),
    plus: Math.max(0, Number(monster.plus) || 0), power: monsterCombatPower(monster),
    maxFloor: Math.max(1, Number(state.player?.maxFloor) || 1), attribute: monster.attribute ?? species.element ?? "neutral",
    circleId: circle.id, circleName: circle.name, circleLevel: circle.id === "none" ? 0 : Math.max(1, Number(circle.level) || 1),
    circleEffect: circle.effect ?? "none", goldPowerMultiplier: circle.effect === "goldPower" ? goldPowerDamageMultiplier(state.player?.gold ?? 0, circle.level) : 1, goldPowerActionCost: circle.effect === "goldPower" ? goldPowerActionCost(state.player?.gold ?? 0) : 0, goldPowerGold: circle.effect === "goldPower" ? Math.max(0, Math.floor(Number(state.player?.gold) || 0)) : 0, equipment: equipmentProfile(state, monster), equipmentAuthorities: onlineEquipmentAuthorities(monster), equipmentCombatEffects: onlineEquipmentCombatEffects(monster), abyssSkillEffects: onlineAbyssSkillEffects(monster), rewardModifiers: onlineRewardModifiers(state),
    signatureResonance: signature ? {
      id: signature.definition.id, name: signature.definition.name, ownerId: signature.ownerId,
      active: signature.active, description: signature.definition.description, ...signature.definition,
    } : null,
    battleStats: {
      hp: Math.max(1, stats.hp), mp: Math.max(0, maxMp(monster)), atk: Math.max(1, stats.atk),
      matk: Math.max(1, stats.matk ?? stats.atk), def: Math.max(0, stats.def), mdef: Math.max(0, stats.mdef ?? stats.def),
      spd: Math.max(1, stats.spd), crit: Math.max(0, stats.crit), evasion: Math.max(0, stats.evasion),
      accuracy: Math.max(20, Number(stats.accuracy) || 100),
    },
    currentHp: Math.max(0, Math.min(stats.hp, monster.currentHp == null ? stats.hp : Number(monster.currentHp) || 0)),
    currentMp: Math.max(0, Math.min(maxMp(monster), monster.currentMp == null ? maxMp(monster) : Number(monster.currentMp) || 0)),
    skills: onlineSkillProfile(monster), captureStock: Math.max(0, Number(state.inventory?.captureCrystals) || 0),
    abyssKeyStock: Math.max(0, Number(state.inventory?.abyssKeys) || 0),
    explorePickupDone: Boolean(state.settings?.contextualGuide?.completed?.explore_pickup),
  };
}

export function onlineMagicCircleArt(profile, { className = "" } = {}) {
  const circle = magicCircleById(profile?.circleId);
  if (String(className).split(/\s+/).includes("battle-magic-circle")) {
    const level = Math.max(0, Number(profile?.circleLevel) || 0);
    const high = level >= 20 ? "magic-circle-high" : "";
    const slot = circle?.effect === "slot" ? "magic-circle-slot" : "";
    const frames = (circle?.frames?.length ? circle.frames : [circle?.asset ?? "./assets/magic-circles/plain.png"])
      .map((source, index) => `<img class="magic-circle-frame magic-circle-frame-${index + 1}" src="${escapeOnlineHtml(source)}" alt="" draggable="false">`).join("");
    return `<span class="magic-circle magic-circle-${escapeOnlineHtml(circle?.tone ?? "plain")} ${high} ${slot} ${className}" data-circle-id="${escapeOnlineHtml(circle?.id ?? "none")}" data-circle-level="${level}" aria-hidden="true">${frames}<i class="magic-circle-ring-a"></i><i class="magic-circle-ring-b"></i><b>${escapeOnlineHtml(circle?.glyph ?? "◇")}</b></span>`;
  }
  const source = circle?.asset ?? "./assets/magic-circles/plain.png";
  return `<span class="online-v3-circle ${className}" data-circle="${escapeOnlineHtml(circle?.id ?? "none")}" aria-hidden="true"><img src="${source}" alt=""><i></i></span>`;
}

export function onlineAvatarVisual(profile, { className = "", frame = "idle" } = {}) {
  return `<span class="online-v3-avatar ${className}">${onlineMagicCircleArt(profile)}${monsterVisual(profile, profile?.fallbackEmoji ?? "魔", { frame, className: "online-v3-avatar-monster" })}</span>`;
}

export function onlineEnemyVisual(enemy, { className = "" } = {}) {
  return monsterVisual({ speciesId: enemy?.speciesId ?? "slime", level: enemy?.level ?? 1 }, enemy?.emoji ?? "魔", {
    frame: Number(enemy?.hp) <= 0 ? "down" : "idle", className: `online-v3-enemy-monster ${className}`,
  });
}

function characterChoice(monster, selected) {
  const species = SPECIES[monster.speciesId] ?? {};
  return `<button type="button" class="online-v3-character ${monster.id === selected ? "selected" : ""}" data-online-character="${escapeOnlineHtml(monster.id)}" aria-pressed="${monster.id === selected}">
    ${monsterVisual(monster, species.emoji ?? "魔", { className: "online-v3-character-art" })}
    <span><b>${escapeOnlineHtml(displayName(monster))}</b><small>Lv.${Number(monster.level || 1).toLocaleString()}・戦力 ${formatCombatPower(monsterCombatPower(monster))}</small></span>
  </button>`;
}

export function OnlinePartyScreen(state) {
  const identity = ensureOnlineIdentity();
  const invite = inviteParameters();
  const { party, monster } = selectedPartyMonster(state);
  const defaultName = storageGet(ONLINE_STORAGE_KEYS.displayName) || (monster ? displayName(monster) : "冒険者");
  const server = invite.server || storageGet(ONLINE_STORAGE_KEYS.serverUrl);
  return `<section class="screen online-v3-screen" data-online-v3-root>
    ${resourceHud(state, { backId: "backOnlineParty", title: "オンライン", eyebrow: "ABYSS DOMINION / CO-OP" })}
    <main class="online-v3-page">
      <section class="online-v3-entry" data-online-entry>
        <header><span class="online-v3-signal"><i></i></span><div><small>HOME PC CO-OP SERVER</small><h2>仲間と同じ世界へ</h2><p>最大4人で、探索・レイド・自由チーム戦・チャットを楽しめます。</p></div></header>
        <div class="online-v3-id"><span><small>フレンドID</small><strong>${identity.friendId}</strong></span><button type="button" data-copy-friend-id>コピー</button></div>
        <label class="online-v3-field"><span>表示名</span><input type="text" maxlength="16" data-online-display-name value="${escapeOnlineHtml(defaultName)}" autocomplete="nickname"></label>
        <label class="online-v3-field"><span>サーバーURL</span><input type="url" inputmode="url" data-online-server-url value="${escapeOnlineHtml(server)}" placeholder="https://xxxxx.trycloudflare.com" autocapitalize="none"></label>
        <div class="online-v3-character-picker"><small>操作するキャラクター</small><div>${party.length ? party.map(entry => characterChoice(entry, monster?.id)).join("") : "<p>先に部隊へ1体以上編成してください。</p>"}</div></div>
        <button type="button" class="online-v3-primary" data-online-connect ${monster ? "" : "disabled"}>サーバーへ接続</button>
        <div class="online-v3-status offline" data-online-status><i></i><b>オフライン</b><span>通常ゲームのセーブには影響しません</span></div>
      </section>

      <section class="online-v3-gate" data-online-gate hidden>
        <header><button type="button" data-online-gate-back aria-label="接続設定へ戻る">←</button><div><small>ROOM ENTRANCE</small><h2>共闘する部屋へ</h2><p>新しい部屋を作るか、6文字のルームIDで参加してください。</p></div></header>
        <button type="button" class="online-v3-create" data-online-create-room><span>${pixelIcon("party")}</span><b>部屋を作成</b><small>自分がリーダーになります</small></button>
        <div class="online-v3-or"><span>または</span></div>
        <form data-online-join-form><label><span>ルームID</span><input type="text" maxlength="6" data-online-room-code value="${escapeOnlineHtml(invite.room)}" placeholder="AB12CD" autocapitalize="characters" autocomplete="off"></label><button type="submit">参加する</button></form>
        <button type="button" class="online-v3-link" data-online-disconnect>サーバーから切断</button>
      </section>

      <section class="online-v3-room" data-online-room hidden>
        <header class="online-v3-roombar">
          <div><small>ROOM</small><strong data-online-room-id>------</strong></div>
          <button type="button" data-copy-room-id>コピー</button><button type="button" data-copy-invite>招待</button>
          <span data-online-member-count>1 / 4</span><button type="button" class="danger" data-online-leave-room>退出</button>
        </header>
        <div class="online-v3-stage" data-online-stage aria-live="polite"></div>
        <nav class="online-v3-nav" aria-label="オンライン機能">
          <button type="button" data-online-route="home" class="active">${pixelIcon("home")}<b>ホーム</b></button>
          <button type="button" data-online-route="explore">${pixelIcon("dungeon")}<b>通常探索</b></button>
          <button type="button" data-online-route="raid">${pixelIcon("event")}<b>レイド</b></button>
          <button type="button" data-online-route="team">${pixelIcon("crossed-swords")}<b>チーム戦</b></button>
          <button type="button" data-online-route="chat">${pixelIcon("notice")}<b>チャット</b><i data-online-unread hidden></i></button>
        </nav>
      </section>
    </main>
  </section>`;
}
