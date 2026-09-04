import { SPECIES } from "../../data/species.js?v=3.1.1-build311";
import { displayName, calculatedStats } from "../../models/Monster.js?v=3.1.1-build311";
import { monsterCombatPower, formatCombatPower } from "../../core/CombatPower.js?v=3.1.1-build311";
import { magicCircleById, equippedMagicCircle, goldPowerDamageMultiplier, goldPowerActionCost } from "../../core/MagicCircleSystem.js?v=3.1.1-build311";
import { learnedSkills, maxMp, effectiveSkillMpCost, applySkillMastery } from "../../battle/SkillSystem.js?v=3.1.1-build311";
import { signatureWeaponForMonster, signatureWeaponOwnerId } from "../../core/SignatureWeaponSystem.js?v=3.1.1-build311";
import { monsterVisual } from "../MonsterVisual.js?v=3.1.1-build311";
import { resourceHud, pixelIcon } from "../components/GameChrome.js?v=3.1.1-build311";

export const ONLINE_STORAGE_KEYS = Object.freeze({
  friendId: "abyss-dominion-online-friend-id",
  clientKey: "abyss-dominion-online-client-key",
  resumeToken: "abyss-dominion-online-resume-token",
  resumeTokenMap: "abyss-dominion-online-resume-token-map-v1",
  resumeTokenMigration: "abyss-dominion-online-resume-token-map-migrated-v1",
  serverUrl: "abyss-dominion-online-server-url",
  displayName: "abyss-dominion-online-display-name",
  monsterId: "abyss-dominion-online-monster-id",
  battleRosterOrder: "abyss-dominion-online-battle-roster-order-v1",
  route: "abyss-dominion-online-route",
  autoConnect: "abyss-dominion-online-auto-connect",
  guildPlanReminderReceipts: "abyss-dominion-online-guild-plan-reminder-receipts-v1",
  fullResetRaidRequest: "abyss-dominion-online-full-reset-raid-request-v1",
});

export const DEFAULT_ONLINE_SERVER_URL = "https://stumble-mountain-lego.ngrok-free.dev";

function isFixedOnlineServerHost(value) {
  let source = String(value ?? "").trim();
  if (!source) return false;
  if (!/^[a-z]+:\/\//i.test(source)) source = `https://${source}`;
  try { return new URL(source).hostname.toLowerCase() === "stumble-mountain-lego.ngrok-free.dev"; }
  catch { return false; }
}

export function enforceFixedOnlineServerUrl() {
  const previous = storageGet(ONLINE_STORAGE_KEYS.serverUrl).trim();
  if (previous && !isFixedOnlineServerHost(previous)) {
    storageSet(ONLINE_STORAGE_KEYS.resumeToken, "");
  }
  storageSet(ONLINE_STORAGE_KEYS.serverUrl, DEFAULT_ONLINE_SERVER_URL);
  storageSet(ONLINE_STORAGE_KEYS.autoConnect, "1");
  return DEFAULT_ONLINE_SERVER_URL;
}

export const ONLINE_ROOM_PURPOSES = Object.freeze([
  { id: "explore", label: "共同探索" },
  { id: "raid", label: "週替わりレイド" },
  { id: "team", label: "自由チーム戦" },
  { id: "social", label: "交流・交換" },
]);

export const ONLINE_ROOM_STYLES = Object.freeze([
  { id: "anyone", label: "だれでも歓迎" },
  { id: "casual", label: "のんびり" },
  { id: "help", label: "攻略・お手伝い" },
  { id: "fast", label: "短時間" },
]);

const EQUIPMENT_SLOTS = Object.freeze([
  ["weaponRight", "右手"], ["weaponLeft", "左手"], ["accessoryNeck", "首"],
  ["accessoryFinger", "指"], ["armorBody", "胴"], ["armorSupport", "補助"],
]);

export const ONLINE_BATTLE_ROSTER_MAX = 4;
const ONLINE_ROSTER_STRING_MAX = 240;
const ONLINE_ROSTER_OBJECT_KEYS_MAX = 96;
const ONLINE_ROSTER_ARRAY_MAX = 16;
const ONLINE_ROSTER_DEPTH_MAX = 6;

function boundedOnlineRosterValue(value, depth = 0) {
  if (value == null || typeof value === "boolean") return value;
  if (typeof value === "string") return value.slice(0, ONLINE_ROSTER_STRING_MAX);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return 0;
    return Math.max(-Number.MAX_SAFE_INTEGER, Math.min(Number.MAX_SAFE_INTEGER, value));
  }
  if (depth >= ONLINE_ROSTER_DEPTH_MAX) return Array.isArray(value) ? [] : {};
  if (Array.isArray(value)) return value.slice(0, ONLINE_ROSTER_ARRAY_MAX).map(entry => boundedOnlineRosterValue(entry, depth + 1));
  if (typeof value !== "object") return null;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !["__proto__", "prototype", "constructor"].includes(key))
    .slice(0, ONLINE_ROSTER_OBJECT_KEYS_MAX)
    .map(([key, entry]) => [String(key).slice(0, 40), boundedOnlineRosterValue(entry, depth + 1)]));
}

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

function storedOnlineBattleRosterOrder() {
  const raw = storageGet(ONLINE_STORAGE_KEYS.battleRosterOrder).trim();
  if (!raw || raw.length > 4096) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map(id => String(id ?? "").slice(0, 120)).filter(Boolean).slice(0, 16)
      : [];
  } catch { return []; }
}

/**
 * Return the party in the user's online deployment order. The first four
 * entries are the only monsters sent as battle candidates; the remainder are
 * retained as reserves so a future party-size increase cannot erase the
 * player's chosen order.
 */
export function onlineBattleRosterPriority(state, { monsterId = null, persist = true } = {}) {
  const byId = new Map((state?.monsters ?? []).filter(Boolean).map(monster => [String(monster.id), monster]));
  const party = [];
  for (const id of state?.party ?? []) {
    const monster = byId.get(String(id));
    if (monster && !party.some(entry => entry.id === monster.id)) party.push(monster);
  }
  if (!party.length) return [];

  const partyById = new Map(party.map(monster => [String(monster.id), monster]));
  const stored = storedOnlineBattleRosterOrder();
  const ordered = stored.map(id => partyById.get(id)).filter((monster, index, entries) => monster && entries.indexOf(monster) === index);
  const requested = partyById.get(String(monsterId || storageGet(ONLINE_STORAGE_KEYS.monsterId)));
  if (!ordered.length && requested) ordered.push(requested);
  for (const monster of party) if (!ordered.includes(monster)) ordered.push(monster);

  if (persist) {
    storageSet(ONLINE_STORAGE_KEYS.battleRosterOrder, JSON.stringify(ordered.map(monster => monster.id)));
    if (ordered[0]) storageSet(ONLINE_STORAGE_KEYS.monsterId, ordered[0].id);
  }
  return ordered;
}

/** Move one roster entry by one slot and persist the new priority. */
export function moveOnlineBattleRosterPriority(state, monsterId, direction) {
  const ordered = onlineBattleRosterPriority(state);
  const index = ordered.findIndex(monster => String(monster.id) === String(monsterId));
  const delta = direction === "up" ? -1 : direction === "down" ? 1 : 0;
  const destination = index + delta;
  if (!delta || index < 0 || destination < 0 || destination >= ordered.length) {
    return { changed: false, order: ordered.map(monster => monster.id), primaryMonsterId: ordered[0]?.id ?? null };
  }
  [ordered[index], ordered[destination]] = [ordered[destination], ordered[index]];
  const order = ordered.map(monster => monster.id);
  storageSet(ONLINE_STORAGE_KEYS.battleRosterOrder, JSON.stringify(order));
  storageSet(ONLINE_STORAGE_KEYS.monsterId, order[0]);
  return { changed: true, order, primaryMonsterId: order[0] };
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
      heal: Math.max(0, Number(skill.heal) || Number(skill.selfHeal) || Number(skill.revive) || 0),
      revive: Math.max(0, Number(skill.revive) || 0),
      reviveMp: Math.max(0, Number(skill.reviveMp) || 0),
      mpHeal: Math.max(0, Number(skill.mpHeal) || 0),
      hits: Math.max(1, Number(skill.hits) || 1),
      allEnemies: Boolean(skill.allEnemies || String(skill.target ?? "").includes("敵全体")),
      allAllies: Boolean(skill.allies || String(skill.target ?? "").includes("味方全体") || skill.type === "allHeal"),
      selfOnly: Boolean(skill.selfOnly || skill.target === "自分"),
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

function onlineBattleMonsterProfile(state, monster) {
  const species = SPECIES[monster.speciesId] ?? {};
  const circle = equippedMagicCircle(monster, state);
  const stats = calculatedStats(monster);
  const maximumMp = maxMp(monster);
  const signature = signatureWeaponForMonster(state, monster);
  return {
    monsterId: monster.id, speciesId: monster.speciesId, visualSpeciesId: monster.visualSpeciesId ?? null,
    endgameBossId: monster.endgameBossId ?? null, floorBossCatalogId: monster.floorBossCatalogId ?? monster.floorBossId ?? null,
    summonTier: monster.summonTier ?? monster.summonRarity ?? null, summonRarity: monster.summonRarity ?? monster.summonTier ?? null, endgameFaction: monster.endgameFaction ?? null,
    monsterName: displayName(monster), fallbackEmoji: species.emoji ?? "魔",
    level: Math.max(1, Number(monster.level) || 1), stars: Math.max(1, Number(monster.stars) || 1),
    plus: Math.max(0, Number(monster.plus) || 0), power: monsterCombatPower(monster),
    attribute: monster.attribute ?? species.element ?? "neutral",
    circleId: circle.id, circleName: circle.name, circleLevel: circle.id === "none" ? 0 : Math.max(1, Number(circle.level) || 1),
    circleEffect: circle.effect ?? "none", goldPowerMultiplier: circle.effect === "goldPower" ? goldPowerDamageMultiplier(state.player?.gold ?? 0, circle.level) : 1, goldPowerActionCost: circle.effect === "goldPower" ? goldPowerActionCost(state.player?.gold ?? 0) : 0, goldPowerGold: circle.effect === "goldPower" ? Math.max(0, Math.floor(Number(state.player?.gold) || 0)) : 0, equipment: equipmentProfile(state, monster), equipmentAuthorities: onlineEquipmentAuthorities(monster), equipmentCombatEffects: onlineEquipmentCombatEffects(monster), abyssSkillEffects: onlineAbyssSkillEffects(monster),
    signatureResonance: signature ? {
      id: signature.definition.id, name: signature.definition.name, ownerId: signature.ownerId,
      active: signature.active, description: signature.definition.description, ...signature.definition,
    } : null,
    battleStats: {
      hp: Math.max(1, stats.hp), mp: Math.max(0, maximumMp), atk: Math.max(1, stats.atk),
      matk: Math.max(1, stats.matk ?? stats.atk), def: Math.max(0, stats.def), mdef: Math.max(0, stats.mdef ?? stats.def),
      spd: Math.max(1, stats.spd), crit: Math.max(0, stats.crit), evasion: Math.max(0, stats.evasion),
      accuracy: Math.max(20, Number(stats.accuracy) || 100),
    },
    currentHp: Math.max(0, Math.min(stats.hp, monster.currentHp == null ? stats.hp : Number(monster.currentHp) || 0)),
    currentMp: Math.max(0, Math.min(maximumMp, monster.currentMp == null ? maximumMp : Number(monster.currentMp) || 0)),
    skills: onlineSkillProfile(monster),
  };
}

function onlineBattleRoster(state, primaryMonster, party) {
  if (!primaryMonster) return [];
  const ordered = onlineBattleRosterPriority(state, { monsterId: primaryMonster.id });
  const selected = (ordered.length ? ordered : [primaryMonster, ...(party ?? []).filter(monster => monster?.id !== primaryMonster.id)])
    .filter((monster, index, entries) => monster?.id && entries.findIndex(entry => entry?.id === monster.id) === index)
    .slice(0, ONLINE_BATTLE_ROSTER_MAX);
  return selected.map((monster, rosterIndex) => boundedOnlineRosterValue({
    rosterIndex,
    isPrimary: monster.id === primaryMonster.id,
    ...onlineBattleMonsterProfile(state, monster),
  }));
}

export function buildOnlinePartyProfile(state, { monsterId = null, displayName: onlineName = "" } = {}) {
  const { party, monster: requestedMonster } = selectedPartyMonster(state, monsterId);
  const priority = onlineBattleRosterPriority(state, { monsterId: requestedMonster?.id });
  const monster = priority[0] ?? requestedMonster;
  if (!monster) return {
    displayName: onlineName || "冒険者", monsterId: null, speciesId: "slime", visualSpeciesId: null, endgameBossId: null, floorBossCatalogId: null, summonTier: null, summonRarity: null, endgameFaction: null, monsterName: "未編成",
    fallbackEmoji: "？", level: 1, stars: 1, plus: 0, power: 0, maxFloor: 1, attribute: "neutral",
    circleId: "none", circleName: "魔法陣なし", circleLevel: 0, circleEffect: "none", goldPowerMultiplier: 1, goldPowerActionCost: 0, goldPowerGold: 0, equipment: [], equipmentAuthorities: [], equipmentCombatEffects: {}, abyssSkillEffects: {}, rewardModifiers: {},
    battleStats: { hp: 100, mp: 10, atk: 10, matk: 10, def: 5, mdef: 5, spd: 10, crit: 5, evasion: 3, accuracy: 100 },
    currentHp: 100, currentMp: 10, skills: [], captureStock: 0, abyssKeyStock: 0,
    battleRosterVersion: 1, primaryMonsterId: null, battleRoster: [],
    explorePickupDone: Boolean(state?.settings?.contextualGuide?.completed?.explore_pickup),
  };
  const primary = onlineBattleMonsterProfile(state, monster);
  return {
    displayName: String(onlineName || displayName(monster) || "冒険者").trim().slice(0, 16),
    ...primary,
    maxFloor: Math.max(1, Number(state.player?.maxFloor) || 1), rewardModifiers: onlineRewardModifiers(state),
    captureStock: Math.max(0, Number(state.inventory?.captureCrystals) || 0),
    abyssKeyStock: Math.max(0, Number(state.inventory?.abyssKeys) || 0),
    battleRosterVersion: 1, primaryMonsterId: primary.monsterId, battleRoster: onlineBattleRoster(state, monster, party),
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

function characterChoice(monster, slotIndex, total) {
  const species = SPECIES[monster.speciesId] ?? {};
  const active = slotIndex < ONLINE_BATTLE_ROSTER_MAX;
  const label = active ? `SLOT ${slotIndex + 1}` : "RESERVE";
  return `<li class="online-v3-character ${slotIndex === 0 ? "selected" : ""}" data-online-roster-entry="${escapeOnlineHtml(monster.id)}" ${slotIndex === 0 ? 'aria-current="true"' : ""}>
    <em class="online-v3-roster-slot"><small>${active ? "SLOT" : "控え"}</small><b>${active ? slotIndex + 1 : "—"}</b></em>
    ${monsterVisual(monster, species.emoji ?? "魔", { className: "online-v3-character-art" })}
    <span><b>${escapeOnlineHtml(displayName(monster))}</b><small>Lv.${Number(monster.level || 1).toLocaleString()}・戦力 ${formatCombatPower(monsterCombatPower(monster))}</small>${slotIndex === 0 ? "<i>メイン・最優先</i>" : `<i>${escapeOnlineHtml(label)} の順で出撃</i>`}</span>
    <span class="online-v3-roster-order" role="group" aria-label="${escapeOnlineHtml(displayName(monster))}の出撃順を変更">
      <button type="button" data-online-roster-move="up" data-online-roster-monster="${escapeOnlineHtml(monster.id)}" aria-label="${escapeOnlineHtml(displayName(monster))}を1つ前のスロットへ" ${slotIndex === 0 ? "disabled" : ""}>↑</button>
      <button type="button" data-online-roster-move="down" data-online-roster-monster="${escapeOnlineHtml(monster.id)}" aria-label="${escapeOnlineHtml(displayName(monster))}を1つ後ろのスロットへ" ${slotIndex === total - 1 ? "disabled" : ""}>↓</button>
    </span>
  </li>`;
}

export function renderOnlineBattleRosterPicker(state, { monsterId = null } = {}) {
  const ordered = onlineBattleRosterPriority(state, { monsterId });
  if (!ordered.length) return `<div class="online-v3-character-picker" data-online-roster-picker><header><div><small>ONLINE BATTLE ROSTER</small><b>出撃優先スロット</b></div></header><p>先に部隊へ1体以上編成してください。</p></div>`;
  return `<div class="online-v3-character-picker" data-online-roster-picker>
    <header><div><small>ONLINE BATTLE ROSTER</small><b>出撃優先スロット</b></div><em>最大 ${ONLINE_BATTLE_ROSTER_MAX}枠</em></header>
    <p>部屋人数に応じて SLOT 1 から必要な数だけ出撃します。全プレイヤー合計は必ず4体以内です。</p>
    <ol>${ordered.map((entry, index) => characterChoice(entry, index, ordered.length)).join("")}</ol>
  </div>`;
}

function roomOptionMarkup(options, selected, { includeAll = false } = {}) {
  const rows = includeAll ? [{ id: "all", label: "すべての目的" }, ...options] : options;
  return rows.map(option => `<option value="${escapeOnlineHtml(option.id)}" ${option.id === selected ? "selected" : ""}>${escapeOnlineHtml(option.label)}</option>`).join("");
}

function roomPurposeLabel(id) {
  return ONLINE_ROOM_PURPOSES.find(option => option.id === id)?.label ?? "共同探索";
}

function roomStyleLabel(id) {
  return ONLINE_ROOM_STYLES.find(option => option.id === id)?.label ?? "だれでも歓迎";
}

export function renderOnlineRoomDirectory(listings = [], { status = "idle", pendingId = null, purpose = "all" } = {}) {
  const rows = Array.isArray(listings) ? listings : [];
  const busy = status === "loading";
  const quickPending = pendingId === "quick";
  const statusText = busy
    ? rows.length ? "募集情報を更新しています" : "募集中の部屋を探しています…"
    : status === "error" ? "募集情報を取得できませんでした。更新をお試しください。"
      : rows.length ? `${rows.length}件の募集があります` : "現在、参加できる公開募集はありません。";
  const cards = rows.map(listing => {
    const roomId = String(listing?.roomId ?? "").slice(0, 6);
    const listingId = String(listing?.listingId ?? "").slice(0, 96);
    const hostName = String(listing?.host?.displayName ?? "冒険者").slice(0, 16);
    const monsterName = String(listing?.host?.monsterName ?? "仲間").slice(0, 40);
    const floor = Math.max(1, Math.min(100, Math.floor(Number(listing?.floor) || 1)));
    const count = Math.max(1, Math.min(4, Math.floor(Number(listing?.count) || 1)));
    const maximum = Math.max(count, Math.min(4, Math.floor(Number(listing?.max) || 4)));
    const purposeLabel = roomPurposeLabel(listing?.purpose);
    const styleLabel = roomStyleLabel(listing?.style);
    const joining = pendingId === roomId || pendingId === listingId;
    const aria = `${hostName}の部屋、${purposeLabel}、${styleLabel}、${floor}階、${count}/${maximum}人に参加`;
    return `<article class="online-room-listing-card ${joining ? "joining" : ""}" role="listitem" data-online-listed-room="${escapeOnlineHtml(roomId)}">
      <div class="online-room-listing-copy"><span><em>${escapeOnlineHtml(purposeLabel)}</em><em>${escapeOnlineHtml(styleLabel)}</em></span><b>${escapeOnlineHtml(hostName)}</b><small>仲間：${escapeOnlineHtml(monsterName)}</small></div>
      <dl><div><dt>階層</dt><dd>${floor.toLocaleString()}階</dd></div><div><dt>人数</dt><dd>${count}/${maximum}</dd></div><div><dt>ROOM</dt><dd>${escapeOnlineHtml(roomId || "------")}</dd></div></dl>
      <button type="button" data-online-join-listed-room="${escapeOnlineHtml(roomId)}" data-online-listing-id="${escapeOnlineHtml(listingId)}" aria-label="${escapeOnlineHtml(aria)}" ${pendingId ? "disabled" : ""}>${joining ? "参加中…" : "参加"}</button>
    </article>`;
  }).join("");
  return `<div class="online-room-board-controls">
      <label><span>目的で絞る</span><select data-online-room-purpose-filter>${roomOptionMarkup(ONLINE_ROOM_PURPOSES, purpose, { includeAll: true })}</select></label>
      <button type="button" data-online-quick-join ${busy || pendingId || !rows.length ? "disabled" : ""}>${quickPending ? "参加先を検索中…" : "おまかせ参加"}</button>
      <button type="button" data-online-refresh-listings aria-label="募集一覧を更新" ${busy ? "disabled" : ""}>↻ 更新</button>
    </div>
    <p class="online-room-board-status ${status}" data-online-room-listing-status role="status" aria-live="polite">${escapeOnlineHtml(statusText)}</p>
    <div class="online-room-board-list" data-online-room-listings role="list" aria-busy="${busy}">${cards || `<div class="online-room-board-empty"><span>${pixelIcon("notice")}</span><b>${busy ? "掲示板を確認中" : "募集を待っています"}</b><small>${busy ? "そのまま少しお待ちください" : "自分で公開部屋を作ることもできます"}</small></div>`}</div>`;
}

function onlineSocialCount(value, maximum = 999999) {
  return Math.max(0, Math.min(maximum, Math.floor(Number(value) || 0)));
}

function onlineSocialList(value, maximum = 200) {
  return (Array.isArray(value) ? value : []).slice(0, maximum);
}

function onlineGuildRoleLabel(role) {
  return role === "leader" ? "マスター" : role === "officer" ? "幹部" : "メンバー";
}

function onlineGuildClock(value) {
  const date = new Date(Math.max(0, Number(value) || 0));
  if (!Number.isFinite(date.getTime()) || date.getTime() <= 0) return "--:--";
  return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

const ONLINE_GUILD_SHARED_GOAL_LABELS = Object.freeze({
  expedition: "共同探索を完了",
  boss: "階層／共闘ボスを討伐",
  raid: "ワールドレイドに勝利",
  team: "自由チーム戦を完了",
  resonance: "仲間と共同探索を完了",
});

const ONLINE_GUILD_ACTIVITY_LABELS = Object.freeze({
  checkIn: "が本日の出席を記録",
  expedition: "が共同探索を完了",
  floorBoss: "が階層ボスを討伐",
  coopBoss: "が共闘ボスを討伐",
  raid: "がワールドレイドに勝利",
  team: "が自由チーム戦を完了",
  resonance: "が共同探索（旧記録）を完了",
});

function onlineGuildActivityTime(value) {
  const date = new Date(Math.max(0, Number(value) || 0));
  if (!Number.isFinite(date.getTime()) || date.getTime() <= 0) return "--/-- --:--";
  return date.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function onlineGuildActorNames(actors) {
  const rows = onlineSocialList(actors, 20);
  if (!rows.length) return "ギルドメンバー";
  const visible = rows.slice(0, 3).map(entry => escapeOnlineHtml(String(entry?.displayName || "冒険者").slice(0, 16)));
  return `${visible.join("、")}${rows.length > visible.length ? `ほか${rows.length - visible.length}人` : ""}`;
}

function onlineGuildSharedGoalRows(sharedGoals) {
  const seen = new Set();
  return onlineSocialList(sharedGoals, 20).map(entry => {
    const id = String(entry?.id ?? "");
    if (!ONLINE_GUILD_SHARED_GOAL_LABELS[id] || seen.has(id)) return "";
    seen.add(id);
    const target = Math.max(1, onlineSocialCount(entry?.target, 1_000_000_000));
    const current = Math.min(target, onlineSocialCount(entry?.current, target));
    const completed = Boolean(entry?.completed) || current >= target;
    const progress = Math.min(100, Math.round(current / target * 100));
    return `<li class="${completed ? "completed" : ""}"><span><i aria-hidden="true">${completed ? "✓" : "◇"}</i><b>${ONLINE_GUILD_SHARED_GOAL_LABELS[id]}</b><em>${completed ? "達成" : `${current.toLocaleString()} / ${target.toLocaleString()}`}</em></span><div role="progressbar" aria-label="${ONLINE_GUILD_SHARED_GOAL_LABELS[id]}" aria-valuemin="0" aria-valuemax="${target}" aria-valuenow="${current}"><i style="width:${progress}%"></i></div></li>`;
  }).join("");
}

function onlineGuildActivityCard(entry) {
  const kind = String(entry?.kind ?? ""), label = ONLINE_GUILD_ACTIVITY_LABELS[kind];
  if (!label) return "";
  const actors = onlineSocialList(entry?.actors, kind === "checkIn" ? 20 : 4);
  const actorIcons = actors.slice(0, 4).map(actor => `<i aria-hidden="true">${escapeOnlineHtml(String(actor?.fallbackEmoji || "魔").slice(0, 8))}</i>`).join("");
  const partySize = onlineSocialCount(entry?.partySize, kind === "checkIn" ? 20 : 4), guildMemberCount = onlineSocialCount(entry?.guildMemberCount, 20);
  const floor = onlineSocialCount(entry?.floor, 100), points = onlineSocialCount(entry?.points, 1_000_000_000);
  const badges = `${floor && ["expedition", "floorBoss", "coopBoss"].includes(kind) ? `<em>${floor.toLocaleString()}階</em>` : ""}${partySize ? `<em>${kind === "checkIn" ? "出席" : "PT"} ${partySize}人</em>` : ""}${guildMemberCount ? `<em>ギルド ${guildMemberCount}人</em>` : ""}`;
  return `<article class="online-guild-activity-card"><span class="online-guild-activity-actors">${actorIcons || "<i aria-hidden=\"true\">魔</i>"}${actors.length > 4 ? `<b>+${actors.length - 4}</b>` : ""}</span><div><p><b>${onlineGuildActorNames(actors)}</b>${label}</p><span>${badges}${points ? `<strong>+${points.toLocaleString()} Pt</strong>` : ""}</span></div><time>${escapeOnlineHtml(onlineGuildActivityTime(entry?.at))}</time></article>`;
}

function onlineGuildPublicCard(guild, actions = "") {
  if (!guild || typeof guild !== "object") return "";
  const count = onlineSocialCount(guild.memberCount, 20), maximum = Math.max(1, onlineSocialCount(guild.maxMembers || 20, 20));
  return `<article class="online-guild-card">
    <span class="online-guild-crest" aria-hidden="true">${escapeOnlineHtml(guild.tag || "GD")}</span>
    <div><small>${escapeOnlineHtml(guild.guildId || "GD------")}</small><b>${escapeOnlineHtml(guild.name || "ギルド")}</b><p>${escapeOnlineHtml(guild.description || "仲間と深淵へ挑むギルドです。")}</p></div>
    <em>${count} / ${maximum}</em>${actions}
  </article>`;
}

function onlineGuildPerson(entry, actions = "", { selfId = "", privacyHidden = false } = {}) {
  const self = entry?.playerId && entry.playerId === selfId;
  const online = entry?.online === true && !privacyHidden;
  return `<article class="online-guild-person ${online ? "online" : "offline"} ${privacyHidden ? "privacy-hidden" : ""} ${self ? "self" : ""}">
    <span class="online-guild-avatar" aria-hidden="true">${escapeOnlineHtml(entry?.fallbackEmoji || "魔")}</span>
    <div><span><b>${escapeOnlineHtml(entry?.displayName || "冒険者")}</b>${self ? "<em>あなた</em>" : ""}</span><small>${escapeOnlineHtml(entry?.monsterName || "仲間")}・今週 ${onlineSocialCount(entry?.weekPoints).toLocaleString()} Pt</small></div>
    <span class="online-guild-person-state"><i>${privacyHidden ? "非表示" : online ? "ONLINE" : "OFFLINE"}</i><b>${onlineGuildRoleLabel(entry?.role)}</b></span>${actions}
  </article>`;
}

function onlineGuildPending(pending, kind, id = "") {
  if (!pending) return false;
  if (typeof pending === "string") return pending === kind;
  if (pending.kind !== kind) return false;
  const target = String(kind.startsWith("recruitment") ? pending.recruitmentId ?? "" : kind.startsWith("plan") ? pending.planId ?? "" : pending.targetId ?? pending.guildId ?? pending.inviteId ?? "");
  return !id || !target || target === String(id);
}

function onlineGuildPlanTime(value) {
  const date = new Date(Math.max(0, Number(value) || 0));
  if (!Number.isFinite(date.getTime()) || date.getTime() <= 0) return { machine: "", date: "日時未定", clock: "" };
  return {
    machine: date.toISOString(),
    date: date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" }),
    clock: date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
  };
}

function onlineGuildDatetimeInputValue(value) {
  const date = new Date(Number(value));
  if (!Number.isFinite(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function onlineGuildPlanAttentions(source = {}, { now = Date.now(), selfId = "", connected = true, canJoinGathering = true } = {}) {
  if (connected === false) return [];
  const guild = source?.guild && typeof source.guild === "object" ? source.guild : source;
  const at = Number.isFinite(Number(now)) ? Number(now) : Date.now();
  return onlineSocialList(guild?.plans, 8).map(plan => {
    const gathering = plan?.gathering && typeof plan.gathering === "object" ? plan.gathering : null;
    const live = Boolean(gathering && Number(gathering.expiresAt) > at);
    const hosting = live && gathering.hostPlayerId === selfId && gathering.joined === true;
    const joinable = canJoinGathering !== false && live && gathering.joined !== true && Number(gathering.slots) > 0;
    const rsvp = ["going", "maybe"].includes(plan?.myStatus);
    const inWindow = Number(plan?.gatherOpensAt) > 0 && at >= Number(plan.gatherOpensAt) && at < Number(plan.gatherClosesAt);
    const due = !live && inWindow && (plan?.canGather === true || rsvp);
    if (!joinable && !hosting && !due) return null;
    const phase = live ? "live" : "window";
    const organizer = String(plan?.organizer?.displayName || "主催者");
    const title = joinable ? "遠征の集合が始まりました" : hosting ? "遠征の集合中です" : plan?.canGather === true ? "遠征の集合時間です" : "参加予定の遠征が近づいています";
    const detail = joinable ? `${organizer}の部屋へ参加できます` : hosting ? `${Math.max(1, Number(gathering?.count) || 1)} / ${Math.max(1, Number(gathering?.max) || 4)}人が集合中` : plan?.canGather === true ? "自分のロビーから集合を開始できます" : "主催者の集合開始をお待ちください";
    return {
      planId: String(plan?.planId ?? ""), phase, title, detail,
      priority: joinable ? 0 : hosting ? 1 : plan?.canGather === true ? 2 : plan?.myStatus === "going" ? 3 : 4,
      scheduledAt: Math.max(0, Number(plan?.scheduledAt) || 0),
    };
  }).filter(entry => entry?.planId).sort((left, right) => left.priority - right.priority || left.scheduledAt - right.scheduledAt || left.planId.localeCompare(right.planId));
}

export function onlineSocialNotificationSummary(friendSource = {}, guildSource = {}, options = {}) {
  const friendState = friendSource && typeof friendSource === "object" ? friendSource : {};
  const guildState = guildSource && typeof guildSource === "object" ? guildSource : {};
  const friendBadge = onlineSocialList(friendState.incoming).length + onlineSocialList(friendState.invites, 20).length;
  const socialNow = Number.isFinite(Number(options.now)) ? Number(options.now) : Date.now();
  const attentions = onlineGuildPlanAttentions(guildState, {
    now: socialNow,
    selfId: options.selfId,
    connected: options.connected !== false,
    canJoinGathering: options.canJoinGathering !== false,
  });
  const guildRole = guildState.guild?.role;
  const guildBadge = onlineSocialList(guildState.invitations, 100).length
    + (["leader", "officer"].includes(guildRole) ? onlineSocialList(guildState.guild?.applications, 100).length : 0)
    + attentions.length;
  return {
    friendBadge,
    guildBadge,
    badge: friendBadge + guildBadge,
    attention: attentions[0] ?? null,
    attentionCount: attentions.length,
  };
}

function onlineGuildPlanAttentionBanner(attention, { closed = false } = {}) {
  if (!attention) return "";
  return `<button type="button" class="online-guild-plan-attention ${closed ? "closed" : "panel"} ${escapeOnlineHtml(attention.phase)}" data-online-guild-plan-attention="${escapeOnlineHtml(attention.planId)}" aria-label="${escapeOnlineHtml(`${attention.title}。${attention.detail}。予定を確認`)}"><i aria-hidden="true"></i><span><small>${attention.phase === "live" ? "GUILD PARTY LIVE" : "EXPEDITION SOON"}</small><b>${escapeOnlineHtml(attention.title)}</b><em>${escapeOnlineHtml(attention.detail)}</em></span><strong>予定を見る</strong></button>`;
}

function onlineGuildPlanCard(entry, { pending = null, disabled = false, gatheringCapability = false, room = null, selfId = "", roomGuildOnly = true, hasExistingRecruitment = false, activeOwnGatheringPlanId = "", now = Date.now(), attentionPhase = "" } = {}) {
  const id = String(entry?.planId ?? ""), purpose = String(entry?.purpose ?? "explore"), time = onlineGuildPlanTime(entry?.scheduledAt);
  const attendees = onlineSocialList(entry?.attendees, 20).filter(person => person && ["going", "maybe"].includes(person.status));
  const goingCount = onlineSocialCount(entry?.goingCount, 20), maybeCount = onlineSocialCount(entry?.maybeCount, Math.max(0, 20 - goingCount));
  const myStatus = ["going", "maybe", "none"].includes(entry?.myStatus) ? entry.myStatus : "none";
  const responding = onlineGuildPending(pending, "planRespond", id), cancelling = onlineGuildPending(pending, "planCancel", id);
  const attendeeRows = attendees.map(person => `<li class="${person.status}"><i aria-hidden="true">${escapeOnlineHtml(person?.fallbackEmoji || "魔")}</i><b>${escapeOnlineHtml(person?.displayName || "冒険者")}</b><span>${person.status === "going" ? "参加予定" : "未定"}</span></li>`).join("");
  const planFloor = purpose === "explore" ? `<em>${Math.max(1, onlineSocialCount(entry?.floor, 100)).toLocaleString()}階</em>` : "";
  const at = Number.isFinite(Number(now)) ? Number(now) : Date.now(), gathering = entry?.gathering && typeof entry.gathering === "object" ? entry.gathering : null;
  const gatheringActive = Boolean(gathering && Number(gathering.expiresAt) > at), gatheringFull = Boolean(gathering && (Number(gathering.count) >= Number(gathering.max) || Number(gathering.slots) <= 0));
  let gatheringMarkup = "";
  if (gathering) {
    const recruitmentId = String(gathering.recruitmentId ?? ""), joining = onlineGuildPending(pending, "recruitmentJoin", recruitmentId);
    const joined = gathering.joined === true, hosting = gathering.hostPlayerId === selfId && joined;
    const closing = onlineGuildPending(pending, "recruitmentClose", recruitmentId), stateLabel = !gatheringActive ? "受付終了" : joined ? "この部屋に参加中" : gatheringFull ? "満員" : "ギルドメンバー募集中";
    const action = hosting && gatheringActive
      ? `<button type="button" class="end" data-online-guild-plan-gathering-close data-online-guild-recruitment-close="${escapeOnlineHtml(recruitmentId)}" data-online-social-focus-key="guild-plan-close:${escapeOnlineHtml(id)}" aria-label="この部屋に参加中。${closing ? "集合を終了しています" : "集合を終了"}" ${disabled || !gatheringCapability || closing ? "disabled" : ""}>${closing ? "終了中…" : "集合を終了"}</button>`
      : !joined && gatheringActive && !gatheringFull ? `<button type="button" data-online-guild-recruitment-join="${escapeOnlineHtml(recruitmentId)}" data-online-guild-plan-id="${escapeOnlineHtml(id)}" data-online-social-focus-key="guild-plan-join:${escapeOnlineHtml(id)}" ${disabled || !gatheringCapability || joining ? "disabled" : ""}>${joining ? "参加中…" : "部屋へ参加"}</button>` : `<b>${escapeOnlineHtml(stateLabel)}</b>`;
    gatheringMarkup = `<div class="online-guild-plan-gathering ${gatheringActive ? "live" : "expired"} ${joined ? "joined" : ""}" role="status" aria-live="polite" aria-atomic="true"><span><i aria-hidden="true"></i><small>${gatheringActive ? "LIVE GATHERING" : "GATHERING CLOSED"}</small><strong>${Math.max(1, onlineSocialCount(gathering.count, 4))} / ${Math.max(1, onlineSocialCount(gathering.max, 4))}人</strong></span>${action}</div>`;
  } else if (entry?.canGather === true && gatheringCapability) {
    const roomMembers = onlineSocialList(room?.members, 4), owner = room?.ownerId === selfId && room?.leaderId === selfId;
    const inWindow = Number(entry.gatherOpensAt) > 0 && at >= Number(entry.gatherOpensAt) && at < Number(entry.gatherClosesAt);
    let hint = "", launch = false;
    if (at < Number(entry.gatherOpensAt)) hint = "集合開始は予定時刻の30分前からです。";
    else if (!inWindow) hint = "この予定の集合受付時間は終了しました。";
    else if (!room) hint = "先に自分のオンライン部屋を作ってください。";
    else if (!owner) hint = "現在のプレイを終了し、自分の部屋を作ってください。";
    else if (room.phase !== "lobby") hint = "現在のプレイを終了してロビーへ戻ってください。";
    else if (roomMembers.length >= 4) hint = "現在の部屋は満員です。";
    else if (room.listing?.published) hint = "公開募集を終了してから集合を開始してください。";
    else if (!roomGuildOnly) hint = "ギルドメンバーだけの部屋で集合を開始してください。";
    else if (activeOwnGatheringPlanId && activeOwnGatheringPlanId !== id) hint = "別の遠征予定で集合中です。";
    else if (hasExistingRecruitment) hint = "先に現在のギルド募集を終了してください。";
    else launch = true;
    const gatheringPending = onlineGuildPending(pending, "planGather", id);
    gatheringMarkup = `<div class="online-guild-plan-gathering ready" role="status" aria-live="polite" aria-atomic="true">${launch ? `<span><small>GATHER PARTY</small><strong>この部屋で集合できます</strong></span><button type="button" data-online-guild-plan-gather="${escapeOnlineHtml(id)}" data-online-social-focus-key="guild-plan-gather:${escapeOnlineHtml(id)}" ${disabled || gatheringPending ? "disabled" : ""}>${gatheringPending ? "開始中…" : "集合を開始"}</button>` : `<p>${escapeOnlineHtml(hint)}</p>`}</div>`;
  }
  return `<article class="online-guild-plan-card ${myStatus} ${gatheringActive ? "gathering-live" : gathering ? "gathering-expired" : ""} ${attentionPhase ? `attention attention-${escapeOnlineHtml(attentionPhase)}` : ""}" role="listitem" tabindex="-1" data-online-guild-plan-card="${escapeOnlineHtml(id)}">
    <header><time datetime="${escapeOnlineHtml(time.machine)}"><b>${escapeOnlineHtml(time.date)}</b><strong>${escapeOnlineHtml(time.clock)}</strong></time><span><em>${escapeOnlineHtml(roomPurposeLabel(purpose))}</em><em>${escapeOnlineHtml(roomStyleLabel(entry?.style))}</em>${planFloor}</span></header>
    <div class="online-guild-plan-organizer"><i aria-hidden="true">${escapeOnlineHtml(entry?.organizer?.fallbackEmoji || "魔")}</i><span><small>主催</small><b>${escapeOnlineHtml(entry?.organizer?.displayName || "冒険者")}</b></span><dl><div><dt>参加予定</dt><dd>${goingCount}</dd></div><div><dt>未定</dt><dd>${maybeCount}</dd></div></dl></div>
    ${entry?.note ? `<p>${escapeOnlineHtml(entry.note)}</p>` : ""}
    ${gatheringMarkup}
    <div class="online-guild-plan-attendees"><b>参加表明</b>${attendeeRows ? `<ul>${attendeeRows}</ul>` : `<small>まだ参加表明はありません。</small>`}</div>
    <footer><div role="group" aria-label="この予定への回答"><button type="button" data-online-guild-plan-respond="going" data-online-guild-plan-id="${escapeOnlineHtml(id)}" data-online-social-focus-key="guild-plan-going:${escapeOnlineHtml(id)}" class="${myStatus === "going" ? "selected" : ""}" aria-pressed="${myStatus === "going"}" ${disabled || responding || cancelling || myStatus === "going" ? "disabled" : ""}>参加する</button><button type="button" data-online-guild-plan-respond="maybe" data-online-guild-plan-id="${escapeOnlineHtml(id)}" data-online-social-focus-key="guild-plan-maybe:${escapeOnlineHtml(id)}" class="${myStatus === "maybe" ? "selected" : ""}" aria-pressed="${myStatus === "maybe"}" ${disabled || responding || cancelling || myStatus === "maybe" ? "disabled" : ""}>未定</button><button type="button" data-online-guild-plan-respond="none" data-online-guild-plan-id="${escapeOnlineHtml(id)}" data-online-social-focus-key="guild-plan-none:${escapeOnlineHtml(id)}" class="ghost" aria-pressed="${myStatus === "none"}" ${disabled || responding || cancelling || myStatus === "none" ? "disabled" : ""}>回答取消</button></div>${entry?.canCancel === true ? `<button type="button" class="danger" data-online-guild-plan-cancel="${escapeOnlineHtml(id)}" data-online-social-focus-key="guild-plan-cancel:${escapeOnlineHtml(id)}" ${disabled || responding || cancelling ? "disabled" : ""}>${cancelling ? "取消中…" : "予定を取消"}</button>` : ""}</footer>
  </article>`;
}

function onlineGuildRecruitmentTime(expiresAt, now = Date.now()) {
  const remaining = Math.max(0, Number(expiresAt) - Number(now));
  if (!remaining) return "終了間近";
  const minutes = Math.max(1, Math.ceil(remaining / 60_000));
  return `あと${minutes}分`;
}

function onlineGuildRecruitmentCard(entry, { selfId = "", room = null, pending = null, disabled = false, closeDisabled = disabled, now = Date.now() } = {}) {
  const id = String(entry?.recruitmentId ?? ""), host = entry?.host ?? {};
  const maximum = Math.max(1, onlineSocialCount(entry?.max || 4, 4));
  const count = Math.min(maximum, onlineSocialCount(entry?.count, maximum));
  const slots = entry?.slots == null ? Math.max(0, maximum - count) : onlineSocialCount(entry.slots, maximum);
  const full = count >= maximum || slots <= 0;
  const expired = Number(entry?.expiresAt) > 0 && Number(entry.expiresAt) <= Number(now);
  const own = host?.playerId === selfId;
  const joined = Boolean(room?.leaderId && room.leaderId === host?.playerId);
  const joining = onlineGuildPending(pending, "recruitmentJoin", id);
  const closing = onlineGuildPending(pending, "recruitmentClose", id);
  const action = own
    ? `<button type="button" class="danger" data-online-guild-recruitment-close="${escapeOnlineHtml(id)}" data-online-social-focus-key="guild-recruitment-close:${escapeOnlineHtml(id)}" ${closeDisabled || closing ? "disabled" : ""}>${closing ? "終了中…" : "募集終了"}</button>`
    : `<button type="button" data-online-guild-recruitment-join="${escapeOnlineHtml(id)}" data-online-social-focus-key="guild-recruitment-join:${escapeOnlineHtml(id)}" ${disabled || joined || full || expired ? "disabled" : ""}>${joined ? "参加中" : full ? "満員" : expired ? "受付終了" : joining ? "参加中…" : "参加"}</button>`;
  return `<article class="online-guild-recruitment-card ${own ? "own" : ""} ${joined ? "joined" : ""}" role="listitem">
    <header><span class="online-guild-avatar" aria-hidden="true">${escapeOnlineHtml(host?.fallbackEmoji || "魔")}</span><div><small>${own ? "YOUR PARTY" : "GUILD PARTY"}</small><b>${escapeOnlineHtml(host?.displayName || "冒険者")}</b><span>${escapeOnlineHtml(host?.monsterName || "仲間")}・Lv.${Math.max(1, onlineSocialCount(host?.level, 99_999_999)).toLocaleString()}</span></div><time>${escapeOnlineHtml(onlineGuildRecruitmentTime(entry?.expiresAt, now))}</time></header>
    <div class="online-guild-recruitment-tags"><em>${escapeOnlineHtml(roomPurposeLabel(entry?.purpose))}</em><em>${escapeOnlineHtml(roomStyleLabel(entry?.style))}</em></div>
    ${entry?.note ? `<p>${escapeOnlineHtml(entry.note)}</p>` : ""}
    <footer><dl><div><dt>階層</dt><dd>${Math.max(1, onlineSocialCount(entry?.floor, 100)).toLocaleString()}階</dd></div><div><dt>人数</dt><dd>${count} / ${maximum}</dd></div></dl>${action}</footer>
  </article>`;
}

export function renderOnlineGuildPanel(source = {}, options = {}) {
  const state = source && typeof source === "object" ? source : {};
  const guild = state.guild && typeof state.guild === "object" ? state.guild : null;
  const invitations = onlineSocialList(state.invitations, 100), applications = onlineSocialList(state.applications, 100);
  const lookup = state.lookup && typeof state.lookup === "object" ? state.lookup : null;
  const selfId = String(options.selfId ?? ""), pending = options.pending ?? null;
  const connectionDisabled = options.connected === false || options.capability === false || options.disabled === true;
  const disabled = connectionDisabled || Boolean(pending);
  const lookupDraft = String(options.guildIdDraft ?? options.lookupDraft ?? options.drafts?.guildId ?? "").slice(0, 10);
  const createDraft = options.createDraft && typeof options.createDraft === "object" ? options.createDraft : options.drafts?.create ?? {};
  const chatDraft = String(options.chatDraft ?? options.drafts?.chat ?? "").slice(0, 80);
  const recruitmentDraft = options.recruitmentDraft && typeof options.recruitmentDraft === "object" ? options.recruitmentDraft : options.drafts?.recruitment ?? {};
  const friends = onlineSocialList(options.friends ?? options.friendState?.friends, 200);
  const mutedIds = new Set(onlineSocialList(options.mutedPlayers, 200).map(entry => String(entry?.playerId ?? "")).filter(Boolean));
  const blockedIds = new Set(onlineSocialList(options.friendState?.blocked, 200).map(entry => String(entry?.playerId ?? "")).filter(Boolean));
  const safetyCapability = options.safetyCapability !== false;
  const status = String(options.status ?? "");
  const availability = options.capability === false ? "このサーバーはギルド機能に未対応です。" : options.connected === false ? "再接続後にギルド操作を再開できます。" : "";
  const statusLine = `<p class="online-guild-status" data-online-guild-status role="status" aria-live="polite">${escapeOnlineHtml(status || availability)}</p>`;
  const invitationRows = invitations.map(entry => {
    const invitedGuild = entry?.guild, invitedMaximum = Math.max(1, onlineSocialCount(invitedGuild?.maxMembers || 20, 20));
    const invitedFull = onlineSocialCount(invitedGuild?.memberCount, invitedMaximum) >= invitedMaximum;
    return onlineGuildPublicCard(invitedGuild, `<footer class="online-guild-card-actions"><small>${escapeOnlineHtml(entry?.from?.displayName || "冒険者")}から招待</small><button type="button" data-online-guild-invite-accept="${escapeOnlineHtml(entry?.inviteId || "")}" ${disabled || invitedFull ? "disabled" : ""}>${invitedFull ? "満員" : "加入"}</button><button type="button" class="ghost" data-online-guild-invite-decline="${escapeOnlineHtml(entry?.inviteId || "")}" ${disabled ? "disabled" : ""}>断る</button></footer>`);
  }).join("");

  if (!guild) {
    const appliedIds = new Set(applications.map(entry => String(entry?.guildId ?? "")));
    const lookupFull = lookup && onlineSocialCount(lookup.memberCount, 20) >= Math.max(1, onlineSocialCount(lookup.maxMembers || 20, 20));
    const lookupApplied = lookup && appliedIds.has(String(lookup.guildId ?? ""));
    const lookupAction = lookup ? `<footer class="online-guild-card-actions"><button type="button" data-online-guild-apply="${escapeOnlineHtml(lookup.guildId || "")}" ${disabled || lookupFull || lookupApplied ? "disabled" : ""}>${lookupFull ? "満員" : lookupApplied ? "申請中" : "加入申請"}</button></footer>` : "";
    return `<div class="online-guild-view online-guild-guest" data-online-guild-view>
      ${statusLine}
      ${invitationRows ? `<section class="online-guild-section priority"><header><h3>届いた招待</h3><em>${invitations.length}</em></header>${invitationRows}</section>` : ""}
      <section class="online-guild-section"><header><div><small>EXACT ID SEARCH</small><h3>ギルドを探す</h3></div></header>
        <form class="online-guild-lookup" data-online-guild-lookup-form><label><span>ギルドID</span><input data-online-guild-id value="${escapeOnlineHtml(lookupDraft)}" maxlength="10" placeholder="GD-ABC234" autocomplete="off" autocapitalize="characters" spellcheck="false"></label><button type="submit" ${disabled ? "disabled" : ""}>検索</button></form>
        ${lookup ? onlineGuildPublicCard(lookup, lookupAction) : ""}
        ${applications.length ? `<div class="online-guild-applying"><b>加入申請中</b>${applications.map(entry => `<span><strong>${escapeOnlineHtml(entry?.name || "ギルド")}</strong><small>${escapeOnlineHtml(entry?.guildId || "")}</small></span>`).join("")}</div>` : ""}
      </section>
      <section class="online-guild-section"><header><div><small>FOUND A GUILD</small><h3>ギルドを作る</h3></div></header>
        <form class="online-guild-create" data-online-guild-create-form>
          <label><span>ギルド名 <small>2〜16文字</small></span><input data-online-guild-create-name maxlength="16" value="${escapeOnlineHtml(createDraft?.name || "")}" autocomplete="off"></label>
          <label><span>略称 <small>2〜4文字</small></span><input data-online-guild-create-tag maxlength="4" value="${escapeOnlineHtml(createDraft?.tag || "")}" placeholder="ABYS" autocomplete="off" autocapitalize="characters"></label>
          <label class="wide"><span>紹介 <small>80文字まで</small></span><textarea data-online-guild-create-description maxlength="80" rows="3" placeholder="活動方針や遊ぶ時間帯">${escapeOnlineHtml(createDraft?.description || "")}</textarea></label>
          <button type="submit" ${disabled ? "disabled" : ""}>ギルドを作成</button>
        </form>
      </section>
    </div>`;
  }

  const members = onlineSocialList(guild.members, 20), requests = onlineSocialList(guild.applications, 100), chat = onlineSocialList(guild.chat, 80), rawPlans = onlineSocialList(guild.plans, 8), recruitments = onlineSocialList(guild.recruitments, 20);
  const plans = rawPlans.map(entry => blockedIds.has(String(entry?.gathering?.hostPlayerId ?? "")) ? { ...entry, gathering: null } : entry);
  const role = ["leader", "officer", "member"].includes(guild.role) ? guild.role : "member";
  const manager = role === "leader" || role === "officer", leader = role === "leader";
  const memberCount = Math.min(20, Math.max(onlineSocialCount(guild.memberCount, 20), members.length)), full = memberCount >= 20;
  const week = guild.week && typeof guild.week === "object" ? guild.week : {}, points = onlineSocialCount(week.points);
  const goals = onlineSocialList(week.goals, 12).map(value => onlineSocialCount(value)).filter(value => value > 0).sort((left, right) => left - right);
  const maximum = goals.at(-1) || Math.max(1, points), progress = Math.min(100, Math.round(points / maximum * 100));
  const tier = Math.min(goals.length, onlineSocialCount(week.tier, goals.length));
  const memberIds = new Set(members.map(entry => String(entry?.playerId ?? "")));
  const inviteCandidates = friends.filter(entry => entry?.playerId && !memberIds.has(String(entry.playerId)));
  const applicationRows = requests.map(entry => onlineGuildPerson(entry, `<span class="online-guild-actions"><button type="button" data-online-guild-application-accept="${escapeOnlineHtml(entry?.playerId || "")}" ${disabled || full ? "disabled" : ""}>${full ? "満員" : "承認"}</button><button type="button" class="ghost" data-online-guild-application-decline="${escapeOnlineHtml(entry?.playerId || "")}" ${disabled ? "disabled" : ""}>拒否</button></span>`, { selfId })).join("");
  const roster = members.map(entry => {
    const targetId = String(entry?.playerId ?? ""), targetRole = entry?.role;
    let management = "";
    if (targetId && targetId !== selfId && (leader || role === "officer" && targetRole === "member")) {
      const roleButton = leader ? `<button type="button" data-online-guild-set-role="${escapeOnlineHtml(targetId)}" data-online-guild-role="${targetRole === "officer" ? "member" : "officer"}" ${disabled ? "disabled" : ""}>${targetRole === "officer" ? "一般に戻す" : "幹部にする"}</button>` : "";
      const transferButton = leader ? `<button type="button" data-online-guild-transfer="${escapeOnlineHtml(targetId)}" ${disabled ? "disabled" : ""}>マスター譲渡</button>` : "";
      management = `${roleButton}${transferButton}<button type="button" class="danger" data-online-guild-kick="${escapeOnlineHtml(targetId)}" ${disabled ? "disabled" : ""}>除名</button>`;
    }
    const muted = mutedIds.has(targetId), blocked = blockedIds.has(targetId);
    const safety = safetyCapability && targetId && targetId !== selfId ? `<button type="button" data-online-user-${muted ? "unmute" : "mute"}="${escapeOnlineHtml(targetId)}" data-online-social-focus-key="guild-safety:${escapeOnlineHtml(targetId)}" ${disabled ? "disabled" : ""}>${muted ? "ミュート解除" : "チャットをミュート"}</button>${blocked ? `<button type="button" data-online-friend-unblock="${escapeOnlineHtml(targetId)}" class="danger" ${disabled ? "disabled" : ""}>ブロック解除</button>` : `<button type="button" data-online-user-block="${escapeOnlineHtml(targetId)}" class="danger" ${disabled ? "disabled" : ""}>ブロック</button>`}` : "";
    const tools = safety || management ? `<details class="online-guild-member-tools online-user-safety-tools"><summary aria-label="${escapeOnlineHtml(entry?.displayName || "メンバー")}の設定">設定</summary><div>${safety}${management}</div></details>` : "";
    return onlineGuildPerson(entry, tools, { selfId, privacyHidden: blocked });
  }).join("");
  const chatRows = chat.filter(entry => !mutedIds.has(String(entry?.playerId ?? "")) && !blockedIds.has(String(entry?.playerId ?? ""))).map(entry => `<article class="${entry?.playerId === selfId ? "own" : ""}"><header><b>${escapeOnlineHtml(entry?.name || "冒険者")}</b><time>${onlineGuildClock(entry?.at)}</time></header><p>${escapeOnlineHtml(entry?.text || "")}</p></article>`).join("");
  const room = options.roomState && typeof options.roomState === "object" ? options.roomState : null;
  const planNow = Number.isFinite(Number(options.now)) ? Number(options.now) : Date.now();
  const roomMembers = onlineSocialList(room?.members, 4), roomCount = roomMembers.length;
  const roomLeader = Boolean(room?.leaderId && room.leaderId === selfId);
  const guildOnlyRoom = roomCount > 0 && roomMembers.every(entry => memberIds.has(String(entry?.playerId ?? "")));
  const publicListing = Boolean(room?.listing?.published);
  const planGatheringRecruitmentIds = new Set(plans.map(entry => String(entry?.gathering?.recruitmentId ?? "")).filter(Boolean));
  const visibleRecruitments = recruitments.filter(entry => !blockedIds.has(String(entry?.host?.playerId ?? "")) && !planGatheringRecruitmentIds.has(String(entry?.recruitmentId ?? "")));
  const currentPlanGathering = plans.find(entry => entry?.gathering?.hostPlayerId === selfId && entry?.gathering?.joined === true && Number(entry?.gathering?.expiresAt) > planNow);
  const recruitmentCapability = options.recruitmentCapability !== false;
  const canRecruit = recruitmentCapability && !connectionDisabled && roomLeader && room?.phase === "lobby" && roomCount < 4 && guildOnlyRoom && !publicListing && !currentPlanGathering;
  const purposeDraft = ONLINE_ROOM_PURPOSES.some(entry => entry.id === recruitmentDraft?.purpose) ? recruitmentDraft.purpose : "explore";
  const styleDraft = ONLINE_ROOM_STYLES.some(entry => entry.id === recruitmentDraft?.style) ? recruitmentDraft.style : "anyone";
  const noteDraft = String(recruitmentDraft?.note ?? "").slice(0, 48);
  const ownRecruitment = visibleRecruitments.find(entry => entry?.host?.playerId === selfId);
  let recruitmentHint = "";
  if (!recruitmentCapability) recruitmentHint = "このサーバーはギルド共闘募集に未対応です。";
  else if (currentPlanGathering) recruitmentHint = "遠征予定の集合募集が進行中です。予定カードから確認できます。";
  else if (!room) recruitmentHint = "オンライン部屋を作ると、ここからギルドメンバーだけを募集できます。";
  else if (!roomLeader) recruitmentHint = "募集を作成・更新できるのは現在の部屋主だけです。";
  else if (room?.phase !== "lobby") recruitmentHint = "共闘中の募集は終了します。ロビーへ戻って再募集してください。";
  else if (roomCount >= 4) recruitmentHint = "現在の部屋は4人で満員です。";
  else if (!guildOnlyRoom) recruitmentHint = "ギルド外の参加者がいる部屋は、ギルド限定募集へ切り替えられません。";
  else if (publicListing) recruitmentHint = "公開掲示板の募集を終了してから、ギルド限定募集を開始してください。";
  const recruitmentComposer = canRecruit ? `<form class="online-guild-recruitment-form" data-online-guild-recruitment-form>
      <div><label><span>目的</span><select data-online-guild-recruitment-purpose data-online-social-focus-key="guild-recruitment-purpose">${roomOptionMarkup(ONLINE_ROOM_PURPOSES, purposeDraft)}</select></label><label><span>遊び方</span><select data-online-guild-recruitment-style data-online-social-focus-key="guild-recruitment-style">${roomOptionMarkup(ONLINE_ROOM_STYLES, styleDraft)}</select></label></div>
      <label><span>ひとこと <small>48文字まで</small></span><textarea maxlength="48" rows="2" data-online-guild-recruitment-note data-online-social-focus-key="guild-recruitment-note" placeholder="挑戦内容や集合時間など">${escapeOnlineHtml(noteDraft)}</textarea><small>${noteDraft.length}/48</small></label>
      <button type="submit" data-online-social-focus-key="guild-recruitment-submit" ${disabled ? "disabled" : ""}>${onlineGuildPending(pending, "recruitmentCreate") ? "募集を更新中…" : ownRecruitment ? "募集を更新" : "ギルド限定で募集"}</button>
    </form>` : `<p class="online-guild-recruitment-hint">${escapeOnlineHtml(recruitmentHint)}</p>`;
  const recruitmentCards = visibleRecruitments.map(entry => onlineGuildRecruitmentCard(entry, { selfId, room, pending, disabled: disabled || !recruitmentCapability, closeDisabled: connectionDisabled || !recruitmentCapability, now: planNow })).join("");
  const recruitmentSection = `<section class="online-guild-section online-guild-recruitment"><header><div><small>GUILD-ONLY PARTY</small><h3>ギルド共闘募集</h3></div><em>${visibleRecruitments.length}</em></header><p class="online-guild-recruitment-copy">現在の部屋をギルド限定で30分間掲示します。参加時もサーバーが所属と空きを確認します。</p>${recruitmentComposer}<div class="online-guild-recruitment-list" role="list">${recruitmentCards || `<p class="online-guild-empty">現在、参加できるギルド募集はありません。</p>`}</div></section>`;
  const activityCapability = options.activityCapability === true;
  const sharedGoalRows = activityCapability ? onlineGuildSharedGoalRows(week.sharedGoals) : "";
  const sharedGoalSection = activityCapability ? `<section class="online-guild-section online-guild-shared-goals"><header><div><small>WEEKLY SHARED GOALS</small><h3>今週の共同目標</h3></div><em>${onlineSocialList(week.sharedGoals, 5).length}</em></header><ol>${sharedGoalRows || `<li class="empty">共同目標を取得中です。</li>`}</ol></section>` : "";
  const activities = activityCapability ? onlineSocialList(guild.activities, 40).slice().sort((left, right) => Number(right?.at || 0) - Number(left?.at || 0)) : [];
  const activityLimit = options.activitiesExpanded ? 40 : 8;
  const activityRows = activities.slice(0, activityLimit).map(onlineGuildActivityCard).join("");
  const activitySection = activityCapability ? `<section class="online-guild-section online-guild-activities"><header><div><small>RECENT GUILD ACTIVITY</small><h3>最近の活動</h3></div><em>${activities.length}</em></header><div class="online-guild-activity-list" id="online-guild-activity-list">${activityRows || `<p class="online-guild-empty">活動履歴はまだありません。</p>`}</div>${activities.length > 8 ? `<button type="button" data-online-guild-activity-more data-online-social-focus-key="guild-activity-more" aria-expanded="${options.activitiesExpanded ? "true" : "false"}" aria-controls="online-guild-activity-list">${options.activitiesExpanded ? "8件だけ表示" : "さらに見る"}</button>` : ""}</section>` : "";
  const planCapability = options.planCapability === true;
  const planGatheringCapability = options.planGatheringCapability === true;
  const planAttentions = onlineGuildPlanAttentions(state, { now: planNow, selfId, connected: options.connected !== false, canJoinGathering: options.liveGatheringJoinable !== false }), attentionOrder = new Map(planAttentions.map((entry, index) => [entry.planId, index]));
  const sortedPlans = plans.slice().sort((left, right) => {
    const leftAttention = attentionOrder.get(String(left?.planId ?? "")), rightAttention = attentionOrder.get(String(right?.planId ?? ""));
    if (leftAttention != null || rightAttention != null) return (leftAttention ?? Number.MAX_SAFE_INTEGER) - (rightAttention ?? Number.MAX_SAFE_INTEGER);
    const leftLive = Number(left?.gathering?.expiresAt) > planNow ? 0 : 1, rightLive = Number(right?.gathering?.expiresAt) > planNow ? 0 : 1;
    return leftLive - rightLive || Number(left?.scheduledAt || 0) - Number(right?.scheduledAt || 0);
  });
  const visiblePlans = sortedPlans.slice(0, options.plansExpanded ? 8 : 3);
  const planDraft = options.planDraft && typeof options.planDraft === "object" ? options.planDraft : {};
  const planPurpose = ONLINE_ROOM_PURPOSES.some(entry => entry.id === planDraft.purpose) ? planDraft.purpose : "explore";
  const planStyle = ONLINE_ROOM_STYLES.some(entry => entry.id === planDraft.style) ? planDraft.style : "anyone";
  const planStep = 5 * 60_000;
  const planMin = onlineGuildDatetimeInputValue(Math.ceil((planNow + 10 * 60_000) / planStep) * planStep), planMax = onlineGuildDatetimeInputValue(Math.floor((planNow + 14 * 24 * 60 * 60_000) / planStep) * planStep);
  const planScheduledAt = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(planDraft.scheduledAt ?? "")) ? String(planDraft.scheduledAt) : onlineGuildDatetimeInputValue(planNow + 60 * 60_000);
  const planFloor = Math.max(1, Math.min(100, Math.floor(Number(planDraft.floor) || 1))), planNote = String(planDraft.note ?? "").slice(0, 48);
  const planComposerOpen = options.planComposerOpen === true;
  const planCards = visiblePlans.map(entry => onlineGuildPlanCard(entry, { pending, disabled: disabled || !planCapability, gatheringCapability: planGatheringCapability && recruitmentCapability, room, selfId, roomGuildOnly: guildOnlyRoom, hasExistingRecruitment: Boolean(ownRecruitment), activeOwnGatheringPlanId: String(currentPlanGathering?.planId ?? ""), now: planNow, attentionPhase: planAttentions.find(attention => attention.planId === entry?.planId)?.phase ?? "" })).join("");
  const planSection = planCapability ? `<section class="online-guild-section online-guild-plans"><header><div><small>EXPEDITION SCHEDULE</small><h3>ギルド遠征予定</h3></div><em>${sortedPlans.length}</em></header><p class="online-guild-plan-copy">14日先まで予定を共有できます。集合時間になったら、主催者が予定カードから自分の部屋をギルド募集へ切り替えられます。予定そのものに報酬はありません。</p><button type="button" class="online-guild-plan-compose-toggle" data-online-guild-plan-compose-toggle data-online-social-focus-key="guild-plan-compose-toggle" aria-expanded="${planComposerOpen}" aria-controls="online-guild-plan-composer" ${connectionDisabled || !planCapability ? "disabled" : ""}>${planComposerOpen ? "作成フォームを閉じる" : "新しい予定を作る"}</button><div id="online-guild-plan-composer" class="online-guild-plan-composer" ${planComposerOpen ? "" : "hidden"}><form data-online-guild-plan-form><div><label><span>目的</span><select data-online-guild-plan-purpose data-online-social-focus-key="guild-plan-purpose">${roomOptionMarkup(ONLINE_ROOM_PURPOSES, planPurpose)}</select></label><label><span>遊び方</span><select data-online-guild-plan-style data-online-social-focus-key="guild-plan-style">${roomOptionMarkup(ONLINE_ROOM_STYLES, planStyle)}</select></label><label class="date"><span>集合日時</span><input type="datetime-local" step="300" min="${escapeOnlineHtml(planMin)}" max="${escapeOnlineHtml(planMax)}" value="${escapeOnlineHtml(planScheduledAt)}" data-online-guild-plan-scheduled-at data-online-social-focus-key="guild-plan-scheduled-at"></label><label><span>共同探索の階層</span><input type="number" inputmode="numeric" min="1" max="100" value="${planFloor}" data-online-guild-plan-floor data-online-social-focus-key="guild-plan-floor"></label></div><label><span>メモ <small>48文字まで</small></span><textarea maxlength="48" rows="2" data-online-guild-plan-note data-online-social-focus-key="guild-plan-note" placeholder="集合場所や挑戦内容など">${escapeOnlineHtml(planNote)}</textarea><small>${planNote.length}/48</small></label><button type="submit" data-online-social-focus-key="guild-plan-submit" ${disabled ? "disabled" : ""}>${onlineGuildPending(pending, "planCreate") ? "予定を登録中…" : "この予定を共有"}</button></form></div><div class="online-guild-plan-list" id="online-guild-plan-list" role="list">${planCards || `<p class="online-guild-empty">これからの遠征予定はありません。</p>`}</div>${sortedPlans.length > 3 ? `<button type="button" class="online-guild-plan-more" data-online-guild-plan-more data-online-social-focus-key="guild-plan-more" aria-expanded="${options.plansExpanded ? "true" : "false"}" aria-controls="online-guild-plan-list">${options.plansExpanded ? "優先3件だけ表示" : `すべて表示（${sortedPlans.length}件）`}</button>` : ""}</section>` : "";

  return `<div class="online-guild-view online-guild-member-view" data-online-guild-view>
    ${statusLine}
    <section class="online-guild-hero"><span class="online-guild-crest" aria-hidden="true">${escapeOnlineHtml(guild.tag || "GD")}</span><div><small>${escapeOnlineHtml(guild.guildId || "")}</small><h3>${escapeOnlineHtml(guild.name || "ギルド")}</h3><p>${escapeOnlineHtml(guild.description || "")}</p><span><em>${onlineGuildRoleLabel(role)}</em><b>Lv.${Math.max(1, onlineSocialCount(guild.level, 50))}</b><b>${memberCount} / 20人</b></span></div><button type="button" data-copy-guild-id="${escapeOnlineHtml(guild.guildId || "")}" aria-label="ギルドIDをコピー">IDコピー</button></section>
    <section class="online-guild-week"><header><div><small>WEEKLY ONLINE CO-OP</small><h3>今週の共闘ポイント</h3></div><strong>${points.toLocaleString()} Pt</strong></header><div class="online-guild-week-meter" role="progressbar" aria-label="今週の共闘ポイント" aria-valuemin="0" aria-valuemax="${maximum}" aria-valuenow="${Math.min(points, maximum)}"><i style="width:${progress}%"></i></div><ol>${goals.map((goal, index) => `<li class="${index < tier ? "done" : ""}"><i></i><span>${goal.toLocaleString()}</span></li>`).join("")}</ol><footer><small>出席と2人以上のオンライン活動で加算</small><button type="button" data-online-guild-check-in ${disabled || guild.checkedInToday ? "disabled" : ""}>${guild.checkedInToday ? "本日は出席済み" : onlineGuildPending(pending, "checkIn") ? "出席処理中…" : "本日の出席 +10 Pt"}</button></footer></section>
    ${sharedGoalSection}
    ${planSection}
    ${recruitmentSection}
    <section class="online-guild-section online-guild-chat"><header><div><small>PERSISTENT GUILD CHAT</small><h3>ギルドチャット</h3></div></header><div class="online-guild-chat-log" data-online-guild-chat-log role="log" aria-live="polite">${chatRows || `<p class="online-guild-empty">まだ会話はありません。最初の挨拶を送りましょう。</p>`}</div><form data-online-guild-chat-form><label><textarea data-online-guild-chat-input maxlength="80" rows="2" enterkeyhint="send" placeholder="ギルドへメッセージ">${escapeOnlineHtml(chatDraft)}</textarea><small>${chatDraft.length}/80</small></label><button type="submit" ${disabled ? "disabled" : ""}>送信</button></form></section>
    ${activitySection}
    ${manager && requests.length ? `<section class="online-guild-section priority"><header><h3>加入申請</h3><em>${requests.length}</em></header>${applicationRows}</section>` : ""}
    ${manager ? `<section class="online-guild-section online-guild-invites"><header><div><small>FRIEND INVITATION</small><h3>フレンドを招待</h3></div><em>${inviteCandidates.length}</em></header>${full ? `<p class="online-guild-empty">メンバー上限の20人に達しています。</p>` : inviteCandidates.length ? `<details><summary>招待するフレンドを選ぶ</summary><div>${inviteCandidates.map(entry => onlineGuildPerson(entry, `<span class="online-guild-actions"><button type="button" data-online-guild-invite="${escapeOnlineHtml(entry?.playerId || "")}" ${disabled ? "disabled" : ""}>招待</button></span>`, { selfId })).join("")}</div></details>` : `<p class="online-guild-empty">招待できるフレンドはいません。</p>`}</section>` : ""}
    <section class="online-guild-section online-guild-roster"><header><div><small>MEMBER ROSTER</small><h3>メンバー</h3></div><em>${memberCount}</em></header>${roster || `<p class="online-guild-empty">メンバー情報を取得中です。</p>`}</section>
    <section class="online-guild-danger"><h3>${leader ? "ギルド管理" : "脱退"}</h3>${leader && memberCount > 1 ? `<p>脱退する場合は、先にほかのメンバーへマスターを譲渡してください。</p>` : ""}${leader ? `<button type="button" data-online-guild-disband ${disabled ? "disabled" : ""}>ギルドを解散</button>` : `<button type="button" data-online-guild-leave ${disabled ? "disabled" : ""}>ギルドを脱退</button>`}</section>
  </div>`;
}

function renderOnlineFriendContent(source = {}, { selfId = "", draft = "", connected = true, disabled = false, mutedPlayers = [], safetyCapability = true } = {}) {
  const state = source && typeof source === "object" ? source : {}, friends = onlineSocialList(state.friends), incoming = onlineSocialList(state.incoming), outgoing = onlineSocialList(state.outgoing), invites = onlineSocialList(state.invites, 20), blocked = onlineSocialList(state.blocked, 200), muted = onlineSocialList(mutedPlayers, 200);
  const mutationDisabled = connected === false || disabled === true, disabledAttribute = mutationDisabled ? "disabled" : "";
  const mutedIds = new Set(muted.map(entry => String(entry?.playerId ?? "")).filter(Boolean));
  const person = (entry, actions = "") => `<article class="online-friend-person"><span class="online-friend-avatar">${escapeOnlineHtml(entry?.fallbackEmoji || "魔")}</span><div><b>${escapeOnlineHtml(entry?.displayName || "冒険者")}</b><small>${escapeOnlineHtml(entry?.monsterName || "仲間")}・${escapeOnlineHtml(entry?.playerId || "")}</small></div>${actions}</article>`;
  const muteButton = entry => {
    const playerId = String(entry?.playerId ?? ""), isMuted = mutedIds.has(playerId);
    return `<button type="button" class="ghost" data-online-user-${isMuted ? "unmute" : "mute"}="${escapeOnlineHtml(playerId)}" data-online-social-focus-key="friend-safety:${escapeOnlineHtml(playerId)}" ${disabledAttribute}>${isMuted ? "ミュート解除" : "ミュート"}</button>`;
  };
  return `<div class="online-friend-view" data-online-friend-view>
    ${mutationDisabled ? `<p class="online-friend-connection-status" role="status" aria-live="polite">再接続後にフレンド操作を再開できます。</p>` : ""}
    <div class="online-friend-self"><span>あなたのID</span><b>${escapeOnlineHtml(selfId)}</b><button type="button" data-copy-friend-id>コピー</button></div>
    <form data-online-friend-request-form><label><span>フレンドIDで申請</span><input data-online-friend-id value="${escapeOnlineHtml(draft)}" maxlength="15" placeholder="AD-ABCD-EFGH" autocomplete="off" autocapitalize="characters"></label><button type="submit" ${disabledAttribute}>申請</button></form>
    ${invites.length ? `<section><h3>部屋への招待 <em>${invites.length}</em></h3>${invites.map(entry => person(entry.from, `<span class="online-friend-actions"><button type="button" data-online-friend-invite-accept="${escapeOnlineHtml(entry.inviteId)}" ${disabledAttribute}>参加</button><button type="button" class="ghost" data-online-friend-invite-decline="${escapeOnlineHtml(entry.inviteId)}" ${disabledAttribute}>断る</button></span>`)).join("")}</section>` : ""}
    ${incoming.length ? `<section><h3>届いた申請 <em>${incoming.length}</em></h3>${incoming.map(entry => person(entry, `<span class="online-friend-actions"><button type="button" data-online-friend-accept="${escapeOnlineHtml(entry.playerId)}" ${disabledAttribute}>承認</button><button type="button" class="ghost" data-online-friend-decline="${escapeOnlineHtml(entry.playerId)}" ${disabledAttribute}>拒否</button>${safetyCapability ? `<button type="button" class="ghost" data-online-friend-block="${escapeOnlineHtml(entry.playerId)}" ${disabledAttribute}>ブロック</button>` : ""}</span>`)).join("")}</section>` : ""}
    <section><h3>フレンド <em>${friends.length}</em></h3>${friends.length ? friends.map(entry => person(entry, `<span class="online-friend-actions">${entry.online ? `<i class="online-friend-presence">ONLINE</i>` : `<i>OFFLINE</i>`}${entry.online ? `<button type="button" data-online-friend-invite="${escapeOnlineHtml(entry.playerId)}" ${disabledAttribute}>招待</button>` : ""}${safetyCapability ? muteButton(entry) : ""}<button type="button" class="ghost" data-online-friend-remove="${escapeOnlineHtml(entry.playerId)}" ${disabledAttribute}>解除</button>${safetyCapability ? `<button type="button" class="danger" data-online-friend-block="${escapeOnlineHtml(entry.playerId)}" ${disabledAttribute}>ブロック</button>` : ""}</span>`)).join("") : `<p class="online-friend-empty">フレンドIDを交換して、仲間を追加しましょう。</p>`}</section>
    ${outgoing.length ? `<p class="online-friend-pending">申請中：${outgoing.map(entry => escapeOnlineHtml(entry.displayName || entry.playerId)).join("、")}</p>` : ""}
    ${safetyCapability ? `<details class="online-safety-settings"><summary><span>安全設定</span><em>${blocked.length + muted.length}</em></summary><div><p><b>ミュート：</b>自分の画面でルーム／ギルドのチャットとスタンプを隠します。参加・招待・交換は止めません。</p><p><b>ブロック：</b>フレンドを解除し、招待・交換・同室をお互いに止めます。同じ部屋にいる場合は自分が退出します。ギルド所属は残ります。</p><section><h3>ミュート中 <em>${muted.length}</em></h3>${muted.length ? muted.map(entry => person(entry, `<span class="online-friend-actions"><button type="button" class="ghost" data-online-user-unmute="${escapeOnlineHtml(entry.playerId)}" data-online-social-focus-key="muted:${escapeOnlineHtml(entry.playerId)}" ${disabledAttribute}>ミュート解除</button></span>`)).join("") : `<p class="online-friend-empty">ミュート中の相手はいません。</p>`}</section><section><h3>ブロック中 <em>${blocked.length}</em></h3>${blocked.length ? blocked.map(entry => person(entry, `<span class="online-friend-actions"><button type="button" class="ghost" data-online-friend-unblock="${escapeOnlineHtml(entry.playerId)}" data-online-social-focus-key="blocked:${escapeOnlineHtml(entry.playerId)}" ${disabledAttribute}>ブロック解除</button></span>`)).join("") : `<p class="online-friend-empty">ブロック中の相手はいません。</p>`}</section></div></details>` : ""}
    <footer>部屋への招待は2分で期限切れになります。</footer>
  </div>`;
}

export function renderOnlineSocialPanel(friendSource = {}, guildSource = {}, options = {}) {
  const friendState = friendSource && typeof friendSource === "object" ? friendSource : {}, guildState = guildSource && typeof guildSource === "object" ? guildSource : {};
  const socialNow = Number.isFinite(Number(options.guildOptions?.now)) ? Number(options.guildOptions.now) : Date.now();
  const { friendBadge, guildBadge, badge, attention, attentionCount } = onlineSocialNotificationSummary(friendState, guildState, {
    now: socialNow,
    selfId: options.selfId,
    connected: options.guildOptions?.connected !== false,
    canJoinGathering: options.guildOptions?.liveGatheringJoinable !== false,
  });
  const open = Boolean(options.open), tab = options.tab === "guild" ? "guild" : "friends";
  if (!open) {
    if (options.showFab === false || options.hallFacilityMode === true) return "";
    return `${onlineGuildPlanAttentionBanner(attention, { closed: true })}<button type="button" class="online-friend-fab online-social-fab ${attentionCount ? "has-guild-attention" : ""}" data-online-friends-toggle aria-label="${escapeOnlineHtml(attentionCount ? `交流パネルを開く。遠征のお知らせ${attentionCount}件` : "交流パネルを開く")}">♟<b>${attentionCount ? "遠征あり" : "交流"}</b>${badge ? `<i>${Math.min(9, badge)}${badge > 9 ? "+" : ""}</i>` : ""}</button>`;
  }
  const panelAttention = onlineGuildPlanAttentionBanner(attention);
  const panelContent = tab === "guild" ? renderOnlineGuildPanel(guildState, { ...options.guildOptions, selfId: options.selfId, friendState, friends: friendState.friends, mutedPlayers: options.mutedPlayers, safetyCapability: options.safetyCapability }) : renderOnlineFriendContent(friendState, { selfId: options.selfId, draft: options.draft, connected: options.guildOptions?.connected, disabled: options.guildOptions?.disabled, mutedPlayers: options.mutedPlayers, safetyCapability: options.safetyCapability });
  const content = `${panelAttention}${panelContent}`;
  return `<button type="button" class="online-friend-scrim online-social-scrim" data-online-friends-close aria-label="交流パネルを閉じる"></button><aside class="online-friend-panel online-social-panel" role="dialog" aria-modal="true" aria-labelledby="onlineSocialTitle">
    <header class="online-social-header"><div><small>SOCIAL LINK</small><h2 id="onlineSocialTitle">交流</h2></div><button type="button" data-online-friends-close aria-label="閉じる">×</button></header>
    <nav class="online-social-tabs" role="tablist" aria-label="交流機能"><button type="button" role="tab" aria-selected="${tab === "friends"}" class="${tab === "friends" ? "active" : ""}" data-online-social-tab="friends">フレンド${friendBadge ? `<i>${Math.min(9, friendBadge)}${friendBadge > 9 ? "+" : ""}</i>` : ""}</button><button type="button" role="tab" aria-selected="${tab === "guild"}" class="${tab === "guild" ? "active" : ""}" data-online-social-tab="guild">ギルド${attentionCount ? `<span>遠征 ${attentionCount}</span>` : ""}${guildBadge ? `<i>${Math.min(9, guildBadge)}${guildBadge > 9 ? "+" : ""}</i>` : ""}</button></nav>
    <div class="online-social-content" data-online-social-content-tab="${tab}" role="tabpanel" aria-label="${tab === "guild" ? "ギルド" : "フレンド"}">${content}</div>
  </aside>`;
}

export function renderOnlineFriendPanel(source = {}, options = {}) {
  return renderOnlineSocialPanel(source, options.guildState ?? {}, options);
}

export function OnlinePartyScreen(state) {
  const identity = ensureOnlineIdentity();
  const invite = inviteParameters();
  const { monster: requestedMonster } = selectedPartyMonster(state);
  const monster = onlineBattleRosterPriority(state, { monsterId: requestedMonster?.id })[0] ?? requestedMonster;
  const defaultName = storageGet(ONLINE_STORAGE_KEYS.displayName) || (monster ? displayName(monster) : "冒険者");
  const server = enforceFixedOnlineServerUrl();
  return `<section class="screen online-v3-screen" data-online-v3-root>
    ${resourceHud(state, { backId: "backOnlineParty", title: "オンライン", eyebrow: "ABYSS DOMINION / CO-OP" })}
    <main class="online-v3-page">
      <section class="online-v3-entry online-v3-auto-entry" data-online-entry>
        <input type="hidden" data-online-server-url value="${escapeOnlineHtml(server)}">
        <input type="hidden" data-online-pending-room-code value="${escapeOnlineHtml(invite.room)}">
        <span class="online-v3-auto-sigil" aria-hidden="true"><i></i><i></i><i></i></span>
        <small>ABYSS NETWORK</small><h2>冒険者集会所へ接続中</h2>
        <p>回線の確認から前回の部屋への復帰まで、自動で行います。</p>
        <div class="online-v3-status connecting" data-online-status><i></i><b>接続を確認中…</b><span>そのままお待ちください</span></div>
        <button type="button" class="online-v3-primary online-v3-retry" data-online-connect ${monster ? "" : "disabled"}>もう一度接続する</button>
      </section>

      <section class="online-v3-gate online-v3-hub-entry" data-online-gate hidden>
        <span class="online-v3-auto-sigil" aria-hidden="true"><i></i><i></i><i></i></span>
        <small>GATHERING HALL</small><h2>集会所を準備しています</h2>
        <p>前回の部屋を確認し、空いている場合は自分の広場を用意します。</p>
        <div class="online-v3-status connecting"><i></i><b>入場処理中…</b><span>操作は必要ありません</span></div>
      </section>

      <section class="online-v3-room" data-online-room hidden>
        <header class="online-v3-roombar">
          <div><small>ROOM</small><strong data-online-room-id>------</strong></div>
          <button type="button" data-copy-room-id aria-label="ルームIDをコピー">コピー</button><button type="button" data-copy-invite aria-label="招待リンクを共有またはコピー">招待</button>
          <button type="button" data-online-profile-toggle aria-expanded="false">手帳</button><span data-online-member-count>1 / 4</span><button type="button" class="danger" data-online-leave-room>一人に戻る</button>
        </header>
        <aside class="online-v3-profile-drawer" data-online-profile-panel hidden aria-label="旅人手帳">
          <header><div><small>TRAVELER PROFILE</small><h2>旅人手帳</h2></div><button type="button" data-online-profile-close aria-label="旅人手帳を閉じる">×</button></header>
          <div class="online-v3-id"><span><small>フレンドID</small><strong>${identity.friendId}</strong></span><button type="button" data-copy-friend-id>コピー</button></div>
          <label class="online-v3-field"><span>オンライン表示名</span><input type="text" maxlength="16" data-online-display-name value="${escapeOnlineHtml(defaultName)}" autocomplete="nickname"></label>
          ${renderOnlineBattleRosterPicker(state, { monsterId: monster?.id })}
          <p class="online-v3-profile-note">変更内容は接続中の仲間へすぐ反映されます。</p>
        </aside>
        <aside class="online-v3-connection-banner offline" data-online-connection-banner role="status" aria-live="polite" aria-atomic="true">
          <i aria-hidden="true"></i><b>オフライン</b><span>オンラインサーバーへ接続されていません</span>
        </aside>
        <div class="online-v3-stage" data-online-stage aria-live="polite"></div>
        <nav class="online-v3-nav" aria-label="オンライン機能">
          <button type="button" data-online-route="home" class="active" aria-current="page">${pixelIcon("home")}<b>ホーム</b></button>
          <button type="button" data-online-route="explore">${pixelIcon("dungeon")}<b>共同探索</b></button>
          <button type="button" data-online-route="raid">${pixelIcon("event")}<b>レイド</b></button>
          <button type="button" data-online-route="team">${pixelIcon("crossed-swords")}<b>チーム戦</b></button>
          <button type="button" data-online-route="chat">${pixelIcon("notice")}<b>掲示板</b><i data-online-unread hidden></i></button>
        </nav>
      </section>
    </main>
    <div class="online-friend-layer" data-online-friend-layer>${renderOnlineFriendPanel({}, { selfId: identity.friendId, showFab: false })}</div>
  </section>`;
}
