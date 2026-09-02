import {
  buildOnlinePartyProfile, DEFAULT_ONLINE_SERVER_URL, ONLINE_STORAGE_KEYS, ensureOnlineIdentity, renderOnlineRoomDirectory, renderOnlineFriendPanel,
  onlineSocialNotificationSummary, moveOnlineBattleRosterPriority, renderOnlineBattleRosterPicker,
} from "../ui/screens/OnlinePartyScreen.js?v=3.0.5-build305";
import {
  renderOnlineHome, renderOnlineExplore, renderOnlineRaid, renderOnlineTeam, renderOnlineChat,
  onlineBattleActorId, onlineBattleOwnerId, onlineBattleActorProfile, onlineOwnedBattleActors, onlinePendingBattleActor,
} from "./OnlineViews.js?v=3.0.5-build305";
import {
  buildOnlineTradeCatalog, reserveOnlineTradeAsset, releaseOnlineTradeAsset,
  rollbackOnlineTradeAssetReservation, commitOnlineTrade, recoverOrphanedTradeEscrows,
  parseOnlineTradeAmount, reconcileOnlineTradeEscrow, sameOnlineTradeAsset, sameLegacyOnlineTradeAsset,
} from "./OnlineTradeSystem.js?v=2.11.82-build258";
import { setMonsterVisualFrame } from "../ui/MonsterVisual.js?v=3.0.5-build305";
import { ONLINE_EXPEDITION_MOVE_INTERVAL_MS } from "./OnlineMovement.js?v=2.11.80-build256";

const ROUTES = new Set(["home", "explore", "raid", "team", "chat"]);
const SOCIAL_FAB_ROUTES = new Set(["home", "chat"]);
const LEGACY_RESONANCE_ROUTES = new Set(["resonance", "resonanceMaze", "resonance-maze"]);
const ONLINE_PROTOCOL = "1.16.0";
const CAMPAIGN_FLOOR_MIN = 1;
const CAMPAIGN_FLOOR_MAX = 100;
const ROOM_PURPOSES = new Set(["explore", "raid", "team", "social"]);
const ROOM_STYLES = new Set(["anyone", "casual", "help", "fast"]);
const DIRECTION = Object.freeze({ up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] });
const ONLINE_EXPLORE_CHAT_POSITION = "abyss-online-explore-chat-position";
const ONLINE_EXPLORE_EMOTE_POSITION = "abyss-online-explore-emote-position";
const HANDSHAKE_TOKEN_RETRY_LIMIT = 2;
const RESUME_TOKEN_MAP_LIMIT = 32;
const RESUME_TOKEN_MAX_LENGTH = 512;
const RESUME_TOKEN_MAP_MAX_BYTES = 64 * 1024;
const GUILD_ID_PATTERN = /^GD-[A-Z2-9]{6}$/;
const PLAYER_ID_PATTERN = /^AD-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const GUILD_ROLES = new Set(["leader", "officer", "member"]);
const GUILD_SHARED_GOAL_IDS = Object.freeze(["expedition", "boss", "raid", "team", "resonance"]);
const GUILD_SHARED_GOAL_ID_SET = new Set(GUILD_SHARED_GOAL_IDS);
const GUILD_ACTIVITY_KINDS = new Set(["checkIn", "expedition", "floorBoss", "coopBoss", "raid", "team", "resonance"]);
const GUILD_PLAN_ID_PATTERN = /^[A-Za-z0-9_-]{18,96}$/;
const GUILD_RECRUITMENT_ID_PATTERN = /^[A-Za-z0-9_-]{18,96}$/;
const GUILD_PLAN_RESPONSES = new Set(["going", "maybe", "none"]);
const GUILD_PLAN_MAX_LEAD_MS = 14 * 24 * 60 * 60_000;
const GUILD_PLAN_TRANSITION_MIN_DELAY_MS = 50;
const GUILD_PLAN_TRANSITION_MAX_DELAY_MS = 2_147_000_000;
const GUILD_PLAN_TRANSITION_SETTLE_MS = 25;
const GUILD_SERVER_CLOCK_MAX_OFFSET_MS = 31 * 24 * 60 * 60_000;
const GUILD_PLAN_REMINDER_RECEIPT_LIMIT = 64;
const GUILD_PLAN_REMINDER_RECEIPT_MAX_BYTES = 16 * 1024;
const MUTED_PLAYER_LIMIT = 200;
const FULL_RESET_REQUEST_PATTERN = /^[A-Za-z0-9_-]{18,96}$/;
const FULL_RESET_TIMEOUT_MS = 12_000;
const POWER_RANKING_CAPABILITY = "powerRankingsV1";
const BACKGROUND_CONNECTION_CAPABILITY = "backgroundConnectionV1";
const TRADE_OFFER_RECEIPTS_CAPABILITY = "tradeOfferReceiptsV1";
const POWER_RANKING_REQUEST_TIMEOUT_MS = 10_000;
const POWER_RANKING_ENTRY_LIMIT = 100;
const POWER_RANKING_PARTY_LIMIT = 4;
const POWER_RANKING_EQUIPMENT_LIMIT = 6;
const FRIEND_MUTATION_SELECTOR = [
  "[data-online-friend-accept]", "[data-online-friend-decline]", "[data-online-friend-block]",
  "[data-online-friend-unblock]", "[data-online-user-block]", "[data-online-friend-invite]", "[data-online-friend-invite-accept]", "[data-online-friend-invite-decline]", "[data-online-friend-remove]",
].join(",");
const GUILD_MUTATION_SELECTOR = [
  "[data-online-guild-apply]", "[data-online-guild-invite]", "[data-online-guild-invite-accept]", "[data-online-guild-invite-decline]",
  "[data-online-guild-application-accept]", "[data-online-guild-application-decline]", "[data-online-guild-set-role]",
  "[data-online-guild-transfer]", "[data-online-guild-kick]", "[data-online-guild-check-in]", "[data-online-guild-leave]", "[data-online-guild-disband]",
  "[data-online-guild-recruitment-close]", "[data-online-guild-recruitment-join]",
  "[data-online-guild-plan-respond]", "[data-online-guild-plan-cancel]", "[data-online-guild-plan-gather]",
].join(",");
const SOCIAL_FOCUS_SELECTORS = [
  "[data-online-friends-toggle]", "[data-online-guild-plan-attention]", ".online-social-header [data-online-friends-close]",
  "[data-online-social-tab=\"friends\"]", "[data-online-social-tab=\"guild\"]",
  "[data-online-friend-id]", "[data-online-guild-id]", "[data-online-guild-create-name]", "[data-online-guild-create-tag]",
  "[data-online-guild-create-description]", "[data-online-guild-chat-input]", "[data-online-guild-recruitment-purpose]",
  "[data-online-guild-recruitment-style]", "[data-online-guild-recruitment-note]",
  "[data-online-guild-plan-purpose]", "[data-online-guild-plan-style]", "[data-online-guild-plan-scheduled-at]",
  "[data-online-guild-plan-floor]", "[data-online-guild-plan-note]",
  "[data-online-user-mute]", "[data-online-user-unmute]", "[data-online-friend-unblock]",
];
const ONLINE_STATE_CONTROL_SELECTOR = [
  "[data-online-create-room]", "[data-online-create-listed]", "[data-online-create-purpose]", "[data-online-create-style]",
  "[data-online-join-listed-room]", "[data-online-quick-join]", "[data-online-refresh-listings]", "[data-online-room-purpose-filter]",
  "[data-online-room-code]", "[data-online-join-form] button[type='submit']",
  "[data-online-remove-room-member]", "[data-online-trade-player]", "[data-online-trade-accept]", "[data-online-trade-decline]",
  "[data-online-trade-cancel]", "[data-online-trade-offer]", "[data-online-trade-ready]", "[data-online-trade-confirm]",
  "[data-online-raid-exchange]", "[data-online-ping-kind]", "[data-online-expedition-interact]", "[data-online-merchant-offer]",
  "[data-online-confirm-floor-boss]", "[data-online-confirm-coop-boss]", "[data-online-battle-cheer]", "[data-online-hall-destination]",
  "[data-online-ready]", "[data-online-start-explore]", "[data-online-return]", "[data-online-complete]", "[data-online-start-raid]",
  "[data-online-team-side]", "[data-online-team-ready]", "[data-online-team-ruleset]", "[data-online-team-series]", "[data-online-team-swap]", "[data-online-start-team]",
  "[data-online-move]", "[data-online-emote-anchor]", "[data-command]", "[data-skill-id]", "[data-online-battle-item]",
  "[data-online-item-target]", "[data-online-speed-cycle]", "[data-online-speed]", "[data-online-battle-auto]", "[data-online-battle-action]", "[data-online-battle-skill]",
  "[data-online-preset]", "[data-online-floor]", "[data-online-room-listing-toggle]", "[data-online-room-listing-purpose]",
  "[data-online-room-listing-style]", "[data-online-chat-input]", "[data-online-explore-chat-input]",
  "[data-online-user-block]", "[data-online-user-mute]", "[data-online-user-unmute]", "[data-online-friend-unblock]",
  "[data-online-chat-form] button[type='submit']", "[data-online-explore-chat-form] button[type='submit']",
  "[data-online-hall-games-toggle]", "[data-online-hall-game-join]", "[data-online-hall-game-leave]",
  "[data-online-hall-game-ready]", "[data-online-hall-game-start]", "[data-online-hall-game-reset]",
  "[data-online-hall-game-action]", "[data-online-hall-game-monster]",
].join(",");
const HALL_POINTS = Object.freeze([
  { route: "raid", x: 18, y: 25 }, { route: "explore", x: 82, y: 25 },
  { route: "games", x: 50, y: 25 },
  { route: "social", x: 50, y: 49 },
  { route: "team", x: 24, y: 78 }, { route: "chat", x: 76, y: 78 },
]);

function storageGet(key, fallback = "") { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } }
function storageSet(key, value) { try { localStorage.setItem(key, String(value)); } catch {} }
function storageRemove(key) { try { localStorage.removeItem(key); } catch {} }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
export function onlineBattlePresentationSpeed(value) {
  const speed = Number(value);
  return Number.isFinite(speed) && speed > 0 ? clamp(speed, .5, 2) : 1;
}
export function onlineBattlePresentationDelay(delay, speed = 1) {
  return Math.max(0, Math.round(Math.max(0, Number(delay) || 0) / onlineBattlePresentationSpeed(speed)));
}
function safeRoomId(value) {
  let source = String(value ?? "").trim();
  const invite = source.match(/(?:^|[?&])partyRoom=([^&#]+)/i);
  if (invite) { try { source = decodeURIComponent(invite[1]); } catch { source = invite[1]; } }
  return source.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}
function safeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]); }
const EXPEDITION_LOOT_RECEIPT_KINDS = new Set(["chest", "resonanceChest", "deluxeChest", "coopVault", "rarePortalChest"]);
function positiveRewardAmount(value) { const amount = Math.max(0, Math.floor(Number(value) || 0)); return amount > 0 ? amount : 0; }
export function onlineRewardReceiptData(message = {}, result = {}) {
  if (result?.duplicate) return null;
  const reward = message?.reward && typeof message.reward === "object" ? message.reward : {};
  const source = message?.source && typeof message.source === "object" ? message.source : {};
  const importantEquipment = result?.isImportantEquipment === true && Boolean(result?.equipmentName);
  if (!importantEquipment && !EXPEDITION_LOOT_RECEIPT_KINDS.has(String(source.kind ?? ""))) return null;
  const items = [], add = (label, value, rare = false) => { if (value) items.push({ label: String(label), value: String(value), rare: Boolean(rare) }); };
  const gold = positiveRewardAmount(result.gold ?? reward.gold), crystals = positiveRewardAmount(result.crystals ?? reward.crystals), captureCrystals = positiveRewardAmount(result.captureCrystals ?? reward.captureCrystals), abyssKeys = positiveRewardAmount(result.abyssKeys ?? reward.abyssKeys), potions = positiveRewardAmount(result.potions ?? reward.potions), raidMaterials = positiveRewardAmount(result.raidMaterials ?? reward.raidMaterials), experience = positiveRewardAmount(result.experience ?? reward.experience);
  if (gold) add("GOLD", `+${gold.toLocaleString()}G`);
  if (crystals) add("魔晶石", `×${crystals.toLocaleString()}`);
  if (captureCrystals) add("捕獲結晶", `×${captureCrystals.toLocaleString()}`);
  if (abyssKeys) add("深淵の鍵", `×${abyssKeys.toLocaleString()}`, true);
  if (potions) add("回復薬", `×${potions.toLocaleString()}`);
  if (raidMaterials) add("レイド核片", `×${raidMaterials.toLocaleString()}`);
  if (experience) add("経験値", `+${experience.toLocaleString()}`);
  if (result?.equipmentName) add(result.equipmentKindLabel || "装備", result.equipmentName, importantEquipment || ["LR", "神話", "深淵", "十神"].includes(String(reward.randomEquipmentRarity ?? "")));
  if (!items.length) return null;
  return {
    id: String(message.rewardId ?? Date.now()),
    title: String(source.title || (importantEquipment ? "重要装備獲得" : "宝箱を開封")),
    eyebrow: importantEquipment ? "ONLINE LOOT" : "TREASURE RECEIVED",
    heading: importantEquipment ? `${String(result.equipmentKindLabel || "装備")}を獲得` : "受け取った報酬",
    important: importantEquipment,
    items,
  };
}
function normalizedRoomPurpose(value, fallback = "explore") {
  const purpose = String(value ?? "");
  if (purpose === "resonance") return "explore";
  if (LEGACY_RESONANCE_ROUTES.has(purpose)) return "explore";
  return ROOM_PURPOSES.has(purpose) ? purpose : fallback;
}
function normalizedOnlineRoute(value, fallback = "home") {
  const route = String(value ?? "");
  if (LEGACY_RESONANCE_ROUTES.has(route)) return "explore";
  return ROUTES.has(route) ? route : fallback;
}
export function shouldShowOnlineSocialFab({ connectionStep, route } = {}) {
  if (connectionStep !== "room") return false;
  return SOCIAL_FAB_ROUTES.has(normalizedOnlineRoute(route, "home"));
}
function isTyping(target) { return Boolean(target?.closest?.("input,textarea,select,[contenteditable=true]")); }
function keyDirection(key) { return ({ ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" })[key] ?? null; }

function capabilitySet(value) {
  if (Array.isArray(value)) return new Set(value.map(entry => String(entry)));
  if (value && typeof value === "object") return new Set(Object.entries(value).filter(([, enabled]) => Boolean(enabled)).map(([name]) => name));
  return new Set();
}

function cleanSocialText(value, maximum = 80) {
  return String(value ?? "").normalize("NFKC").replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "").slice(0, maximum);
}

function boundedInteger(value, minimum, maximum, fallback = minimum) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, Math.floor(parsed))) : fallback;
}

function boundedNumber(value, minimum, maximum, fallback = minimum) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, parsed)) : fallback;
}

function normalizedCampaignFloors(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(Number).filter(floor => Number.isInteger(floor) && floor >= CAMPAIGN_FLOOR_MIN && floor <= CAMPAIGN_FLOOR_MAX))].slice(0, CAMPAIGN_FLOOR_MAX);
}

function normalizedCampaignFloorState(source = {}) {
  const collectedKeyIds = [...new Set((Array.isArray(source?.collectedKeyIds) ? source.collectedKeyIds : [])
    .map(value => String(value ?? "").slice(0, 80)).filter(Boolean))].slice(0, 3);
  const rawLocks = boundedInteger(source?.trophyLocksOpened, 0, 3, 0);
  const trophyFragmentPacksClaimed = Math.max(rawLocks, boundedInteger(source?.trophyFragmentPacksClaimed, 0, 3, 0));
  const keysCollected = Math.max(collectedKeyIds.length, boundedInteger(source?.keysCollected, 0, 3, 0), rawLocks);
  return {
    runId: String(source?.runId ?? "").slice(0, 120) || null,
    keysCollected,
    trophyLocksOpened: rawLocks >= 3 ? 3 : 0,
    trophyFragmentPacksClaimed,
    collectedKeyIds,
    hotSpringUsed: Boolean(source?.hotSpringUsed),
    trophyMythicClaimed: Boolean(source?.trophyMythicClaimed) || rawLocks >= 3,
    replayActive: Boolean(source?.replayActive),
    bossDefeatedThisRun: Boolean(source?.bossDefeatedThisRun),
  };
}

function normalizedCampaignFloorStates(source) {
  const states = source && typeof source === "object" && !Array.isArray(source) ? source : {}, result = {};
  for (const [rawFloor, state] of Object.entries(states).slice(0, CAMPAIGN_FLOOR_MAX)) {
    const floor = Number(rawFloor);
    if (!Number.isInteger(floor) || floor < CAMPAIGN_FLOOR_MIN || floor > CAMPAIGN_FLOOR_MAX) continue;
    result[String(floor)] = normalizedCampaignFloorState(state);
  }
  return result;
}

function campaignHostStateFromLocal(source = {}) {
  return normalizedCampaignFloorState({
    runId: source?.runId,
    keysCollected: source?.keysCollected,
    trophyLocksOpened: source?.trophyLocksOpened,
    trophyFragmentPacksClaimed: source?.trophyFragmentPacksClaimed,
    collectedKeyIds: source?.keyIds,
    hotSpringUsed: source?.hotSpringUsed,
    trophyMythicClaimed: source?.trophyClaimed,
    replayActive: false,
    bossDefeatedThisRun: Boolean(source?.bossDefeated),
  });
}

function mergeCampaignHostFloorState(onlineSource, localSource) {
  if (!onlineSource) return campaignHostStateFromLocal(localSource);
  const online = normalizedCampaignFloorState(onlineSource), local = campaignHostStateFromLocal(localSource);
  if (local.runId && online.runId && local.runId !== online.runId) return { ...local, trophyMythicClaimed: online.trophyMythicClaimed || local.trophyMythicClaimed };
  const collectedKeyIds = [...new Set([...online.collectedKeyIds, ...local.collectedKeyIds])].slice(0, 3);
  const keysCollected = Math.min(3, Math.max(online.keysCollected, local.keysCollected, collectedKeyIds.length));
  return {
    runId: local.runId || online.runId,
    keysCollected,
    trophyLocksOpened: Math.max(online.trophyLocksOpened, local.trophyLocksOpened) >= 3 ? 3 : 0,
    trophyFragmentPacksClaimed: Math.max(online.trophyFragmentPacksClaimed, local.trophyFragmentPacksClaimed),
    collectedKeyIds,
    hotSpringUsed: online.hotSpringUsed || local.hotSpringUsed,
    trophyMythicClaimed: online.trophyMythicClaimed || local.trophyMythicClaimed,
    replayActive: online.replayActive,
    bossDefeatedThisRun: online.bossDefeatedThisRun || local.bossDefeatedThisRun,
  };
}

function rankingIdentifier(value, maximum = 120) {
  const id = cleanSocialText(value, maximum).trim();
  return /^[A-Za-z0-9_-]+$/.test(id) ? id : "";
}

function rankingText(value, maximum, fallback = "") {
  return cleanSocialText(value, maximum).trim() || fallback;
}

function rankingAsset(value) {
  const asset = cleanSocialText(value, 260).trim();
  if (!asset || asset.includes("..") || asset.includes("\\") || !/^(?:\.\/)?assets\/[A-Za-z0-9_./@+-]+$/.test(asset)) return null;
  return asset;
}

function rankingPower(value) {
  return boundedInteger(value, 0, Number.MAX_SAFE_INTEGER, 0);
}

function normalizePowerRankingEquipment(source) {
  if (!source || typeof source !== "object") return null;
  const name = rankingText(source.name, 64);
  if (!name) return null;
  return {
    slot: rankingText(source.slot, 24, "equipment"),
    name,
    rarity: rankingText(source.rarity, 16, "N"),
    level: boundedInteger(source.level, 0, 99_999_999, 0),
    plus: boundedInteger(source.plus, 0, 99_999, 0),
    visualAsset: rankingAsset(source.visualAsset),
  };
}

function normalizePowerRankingBattleStats(source) {
  const stats = source && typeof source === "object" ? source : {};
  const stat = (name, fallback = 0) => boundedInteger(stats[name], 0, 1_000_000_000_000, fallback);
  // CombatPower v4 can legally produce fractional crit/evasion values after
  // series/mastery bonuses. Preserve them so server verification uses exactly
  // the same final stats as the local combat-power display.
  const fractionalStat = (name, fallback = 0) => boundedNumber(stats[name], 0, 1_000_000_000_000, fallback);
  return {
    hp: Math.max(1, stat("hp", 1)),
    atk: stat("atk"),
    matk: stat("matk", stat("mag")),
    def: stat("def"),
    mdef: stat("mdef", stat("res")),
    spd: stat("spd"),
    crit: fractionalStat("crit"),
    evasion: fractionalStat("evasion"),
  };
}

function normalizePowerRankingMonster(source, fallbackSlot = 1) {
  if (!source || typeof source !== "object") return null;
  const requestedSlot = Number(source.slot);
  const slot = Number.isInteger(requestedSlot) && requestedSlot >= 1 && requestedSlot <= POWER_RANKING_PARTY_LIMIT
    ? requestedSlot : boundedInteger(fallbackSlot, 1, POWER_RANKING_PARTY_LIMIT, 1);
  const speciesId = rankingIdentifier(source.speciesId, 80) || "slime";
  const name = rankingText(source.name ?? source.monsterName, 32, "魔物");
  const equipment = (Array.isArray(source.equipment) ? source.equipment : []).slice(0, POWER_RANKING_EQUIPMENT_LIMIT)
    .map(normalizePowerRankingEquipment).filter(Boolean);
  const circleSource = source.magicCircle && typeof source.magicCircle === "object" ? source.magicCircle : {
    name: source.circleName,
    level: source.circleLevel,
  };
  return {
    slot,
    monsterId: rankingText(source.monsterId, 80) || null,
    speciesId,
    visualSpeciesId: rankingIdentifier(source.visualSpeciesId, 80) || null,
    endgameBossId: rankingIdentifier(source.endgameBossId, 80) || null,
    floorBossCatalogId: rankingIdentifier(source.floorBossCatalogId, 80) || null,
    customVisualAsset: rankingAsset(source.customVisualAsset),
    customVisualBase: rankingAsset(source.customVisualBase),
    fallbackEmoji: rankingText(source.fallbackEmoji, 8, "魔"),
    name,
    level: boundedInteger(source.level, 1, 99_999_999, 1),
    rarity: rankingText(source.rarity ?? source.summonRarity ?? source.summonTier, 16, "N"),
    stars: boundedInteger(source.stars, 0, 99, 0),
    plus: boundedInteger(source.plus, 0, 99_999, 0),
    power: rankingPower(source.power),
    battleStats: normalizePowerRankingBattleStats(source.battleStats),
    equipment,
    magicCircle: {
      name: rankingText(circleSource?.name, 32, "魔法陣なし"),
      level: boundedInteger(circleSource?.level, 0, 99, 0),
    },
  };
}

function normalizePowerRankingIcon(source) {
  if (!source || typeof source !== "object") return null;
  return {
    speciesId: rankingIdentifier(source.speciesId, 80) || "slime",
    visualSpeciesId: rankingIdentifier(source.visualSpeciesId, 80) || null,
    endgameBossId: rankingIdentifier(source.endgameBossId, 80) || null,
    floorBossCatalogId: rankingIdentifier(source.floorBossCatalogId, 80) || null,
    customVisualAsset: rankingAsset(source.customVisualAsset),
    customVisualBase: rankingAsset(source.customVisualBase),
    fallbackEmoji: rankingText(source.fallbackEmoji, 8, "魔"),
    name: rankingText(source.name ?? source.monsterName, 32, "魔物"),
  };
}

/** Build the bounded public payload accepted by the ranking server. */
export function normalizePowerRankingSnapshot(source) {
  if (!source || typeof source !== "object") return null;
  const party = [], usedSlots = new Set();
  for (const raw of (Array.isArray(source.party) ? source.party : []).slice(0, POWER_RANKING_PARTY_LIMIT * 2)) {
    const member = normalizePowerRankingMonster(raw, party.length + 1);
    if (!member || usedSlots.has(member.slot)) continue;
    usedSlots.add(member.slot); party.push(member);
    if (party.length >= POWER_RANKING_PARTY_LIMIT) break;
  }
  party.sort((left, right) => left.slot - right.slot);
  if (!party.length) return null;
  return {
    displayName: rankingText(source.displayName, 16, "冒険者"),
    maxFloor: boundedInteger(source.maxFloor, 1, 100, 1),
    power: rankingPower(source.power),
    party,
  };
}

function normalizePowerRankingEntry(source) {
  if (!source || typeof source !== "object") return null;
  const playerId = normalizedPlayerId(source.playerId);
  if (!playerId) return null;
  const icon = normalizePowerRankingIcon(source.icon ?? source.leadMonster);
  return {
    rank: boundedInteger(source.rank, 1, 10_000_000, 1),
    playerId,
    displayName: rankingText(source.displayName, 16, "冒険者"),
    power: rankingPower(source.power),
    maxFloor: boundedInteger(source.maxFloor, 1, 100, 1),
    updatedAt: boundedInteger(source.updatedAt, 0, Number.MAX_SAFE_INTEGER, 0),
    icon,
    leadMonster: icon,
  };
}

export function normalizePowerRankingState(source, { supported = true, loading = false, error = "" } = {}) {
  const entries = (Array.isArray(source?.entries) ? source.entries : []).slice(0, POWER_RANKING_ENTRY_LIMIT)
    .map(normalizePowerRankingEntry).filter(Boolean).sort((left, right) => left.rank - right.rank);
  const self = normalizePowerRankingEntry(source?.self);
  return {
    supported: Boolean(supported),
    loading: Boolean(loading),
    entries,
    self,
    selfRank: self?.rank ?? null,
    total: boundedInteger(source?.total, 0, 10_000_000, entries.length),
    updatedAt: boundedInteger(source?.serverNow ?? source?.updatedAt, 0, Number.MAX_SAFE_INTEGER, 0),
    serverNow: boundedInteger(source?.serverNow, 0, Number.MAX_SAFE_INTEGER, 0),
    staleAfterMs: boundedInteger(source?.staleAfterMs, 0, 365 * 24 * 60 * 60_000, 0),
    season: source?.season && typeof source.season === "object" ? {
      id: rankingText(source.season.id, 20),
      startsAt: boundedInteger(source.season.startsAt, 0, Number.MAX_SAFE_INTEGER, 0),
      endsAt: boundedInteger(source.season.endsAt, 0, Number.MAX_SAFE_INTEGER, 0),
    } : null,
    rewardPolicy: rankingText(source?.rewardPolicy, 80),
    error: rankingText(error || source?.error, 120),
  };
}

export function normalizePowerRankingProfile(source) {
  if (!source || typeof source !== "object") return null;
  const playerId = normalizedPlayerId(source.playerId);
  if (!playerId) return null;
  const party = [], usedSlots = new Set();
  for (const raw of (Array.isArray(source.party) ? source.party : []).slice(0, POWER_RANKING_PARTY_LIMIT * 2)) {
    const member = normalizePowerRankingMonster(raw, party.length + 1);
    if (!member || usedSlots.has(member.slot)) continue;
    usedSlots.add(member.slot); party.push(member);
    if (party.length >= POWER_RANKING_PARTY_LIMIT) break;
  }
  party.sort((left, right) => left.slot - right.slot);
  return {
    playerId,
    displayName: rankingText(source.displayName, 16, "冒険者"),
    power: rankingPower(source.power),
    maxFloor: boundedInteger(source.maxFloor, 1, 100, 1),
    updatedAt: boundedInteger(source.updatedAt, 0, Number.MAX_SAFE_INTEGER, 0),
    party,
  };
}

function normalizedRosterVitals(source) {
  const rows = [], seenMonsterIds = new Set(), seenCombatantIds = new Set();
  for (const raw of (Array.isArray(source) ? source : []).slice(0, 8)) {
    if (!raw || typeof raw !== "object") continue;
    const monsterId = cleanSocialText(raw.monsterId, 120).trim();
    const combatantId = cleanSocialText(raw.combatantId, 80).trim();
    if (!monsterId || seenMonsterIds.has(monsterId) || (combatantId && seenCombatantIds.has(combatantId))) continue;
    const rosterIndex = boundedInteger(raw.rosterIndex, 0, 3, rows.length);
    const maxHp = Math.max(1, boundedInteger(raw.maxHp, 1, 1_000_000_000, 1));
    const maxMp = Math.max(0, boundedInteger(raw.maxMp, 0, 1_000_000_000, 0));
    seenMonsterIds.add(monsterId);
    if (combatantId) seenCombatantIds.add(combatantId);
    rows.push({
      combatantId: combatantId || null,
      monsterId,
      rosterIndex,
      isPrimary: raw.isPrimary === true || rosterIndex === 0,
      hp: boundedInteger(raw.hp, 0, maxHp, 0),
      maxHp,
      mp: boundedInteger(raw.mp, 0, maxMp, 0),
      maxMp,
    });
    if (rows.length >= 4) break;
  }
  return rows;
}

function normalizedAssistedWorld(source, expectedOwnerId = "") {
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  const ownerId = cleanSocialText(source.ownerId ?? expectedOwnerId, 24).trim();
  if (!ownerId || (expectedOwnerId && ownerId !== expectedOwnerId)) return null;
  const rawStartFloor = Number(source.startFloor), rawEndFloor = Number(source.endFloor), rawFloorsCleared = Number(source.floorsCleared);
  if (!Number.isFinite(rawStartFloor) || !Number.isFinite(rawEndFloor) || !Number.isFinite(rawFloorsCleared)) return null;
  const startFloor = boundedInteger(rawStartFloor, 1, 100, 1);
  return {
    ownerId,
    startFloor,
    endFloor: Math.max(startFloor, boundedInteger(rawEndFloor, 1, 100, startFloor)),
    floorsCleared: boundedInteger(rawFloorsCleared, 0, 100, 0),
  };
}

function readGuildPlanReminderReceipts() {
  const raw = storageGet(ONLINE_STORAGE_KEYS.guildPlanReminderReceipts, "");
  if (!raw || raw.length > GUILD_PLAN_REMINDER_RECEIPT_MAX_BYTES) return [];
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return []; }
  const source = Array.isArray(parsed?.receipts) ? parsed.receipts : [];
  const seen = new Set(), receipts = [];
  for (const value of source.slice(-GUILD_PLAN_REMINDER_RECEIPT_LIMIT * 2)) {
    const key = typeof value === "string" ? value : "";
    if (!key || key.length > 220 || !/^[A-Za-z0-9_:\-|]+$/.test(key) || seen.has(key)) continue;
    seen.add(key); receipts.push(key);
  }
  return receipts.slice(-GUILD_PLAN_REMINDER_RECEIPT_LIMIT);
}

function writeGuildPlanReminderReceipts(receipts) {
  const bounded = [...new Set(Array.isArray(receipts) ? receipts : [])].filter(value => typeof value === "string" && value.length <= 220).slice(-GUILD_PLAN_REMINDER_RECEIPT_LIMIT);
  let payload = JSON.stringify({ version: 1, receipts: bounded });
  while (payload.length > GUILD_PLAN_REMINDER_RECEIPT_MAX_BYTES && bounded.length) {
    bounded.shift(); payload = JSON.stringify({ version: 1, receipts: bounded });
  }
  storageSet(ONLINE_STORAGE_KEYS.guildPlanReminderReceipts, payload);
}

function normalizedPlayerId(value) {
  const id = cleanSocialText(value, 20).trim().toUpperCase();
  return PLAYER_ID_PATTERN.test(id) ? id : "";
}

export function normalizeMutedPlayer(source) {
  const playerId = normalizedPlayerId(typeof source === "string" ? source : source?.playerId);
  if (!playerId) return null;
  return {
    playerId,
    displayName: cleanSocialText(source?.displayName, 16).trim() || "冒険者",
    monsterName: cleanSocialText(source?.monsterName, 32).trim() || "仲間",
    fallbackEmoji: cleanSocialText(source?.fallbackEmoji, 8).trim() || "魔",
  };
}

function normalizedGuildId(value) {
  const id = cleanSocialText(value, 10).trim().toUpperCase();
  return GUILD_ID_PATTERN.test(id) ? id : "";
}

function emptyGuildState() { return { guild: null, invitations: [], applications: [], lookup: null, serverNow: 0 }; }

export function normalizeGuildSharedGoal(source) {
  const id = cleanSocialText(source?.id, 20).trim();
  if (!GUILD_SHARED_GOAL_ID_SET.has(id)) return null;
  const target = boundedInteger(source?.target, 1, 1_000_000_000, 1);
  const current = boundedInteger(source?.current, 0, target, 0);
  return { id, current, target, completed: source?.completed === true || current >= target };
}

function normalizeGuildSharedGoals(source) {
  const sharedIds = new Set(), sharedGoals = [];
  for (const raw of (Array.isArray(source) ? source : []).slice(0, 20)) {
    const entry = normalizeGuildSharedGoal(raw);
    if (!entry || sharedIds.has(entry.id)) continue;
    sharedIds.add(entry.id); sharedGoals.push(entry);
  }
  return sharedGoals.sort((left, right) => GUILD_SHARED_GOAL_IDS.indexOf(left.id) - GUILD_SHARED_GOAL_IDS.indexOf(right.id)).slice(0, 5);
}

function normalizeGuildWeek(source) {
  const goals = (Array.isArray(source?.goals) ? source.goals : []).slice(0, 12)
    .map(value => boundedInteger(value, 1, 1_000_000, 0)).filter(Boolean);
  return {
    weekId: cleanSocialText(source?.weekId, 10),
    points: boundedInteger(source?.points, 0, 1_000_000_000, 0),
    goals,
    tier: boundedInteger(source?.tier, 0, goals.length, 0),
  };
}

function normalizeGuildActivityActor(source) {
  if (!source || typeof source !== "object") return null;
  return {
    displayName: cleanSocialText(source.displayName, 16).trim() || "冒険者",
    fallbackEmoji: cleanSocialText(source.fallbackEmoji, 8).trim() || "魔",
  };
}

export function normalizeGuildActivity(source) {
  const activityId = cleanSocialText(source?.activityId, 96).trim();
  const kind = cleanSocialText(source?.kind, 20).trim();
  const at = boundedInteger(source?.at, 0, Number.MAX_SAFE_INTEGER, 0);
  if (!activityId || !GUILD_ACTIVITY_KINDS.has(kind) || !at) return null;
  const actorLimit = kind === "checkIn" ? 20 : 4;
  const actors = (Array.isArray(source?.actors) ? source.actors : []).slice(0, actorLimit)
    .map(normalizeGuildActivityActor).filter(Boolean);
  const activity = {
    activityId,
    kind,
    actors,
    partySize: boundedInteger(source?.partySize, 0, kind === "checkIn" ? 20 : 4, 0),
    guildMemberCount: boundedInteger(source?.guildMemberCount, 0, actorLimit, 0),
    points: boundedInteger(source?.points, 0, 1_000_000_000, 0),
    at,
  };
  const floor = boundedInteger(source?.floor, 0, 100, 0);
  if (floor) activity.floor = floor;
  return activity;
}

function normalizeGuildActivities(source) {
  const activitiesById = new Map();
  for (const raw of (Array.isArray(source) ? source : []).slice(0, 160)) {
    const entry = normalizeGuildActivity(raw);
    if (!entry) continue;
    const existing = activitiesById.get(entry.activityId);
    if (!existing || entry.at > existing.at) activitiesById.set(entry.activityId, entry);
  }
  return [...activitiesById.values()].sort((left, right) => right.at - left.at).slice(0, 40);
}

function guildPlanDatetimeValue(timestamp) {
  const date = new Date(Number(timestamp));
  if (!Number.isFinite(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function defaultGuildPlanDraft(now = Date.now()) {
  const rounded = Math.ceil((Number(now) + 60 * 60_000) / (5 * 60_000)) * 5 * 60_000;
  return { purpose: "explore", style: "anyone", scheduledAt: guildPlanDatetimeValue(rounded), floor: 1, note: "" };
}

function normalizeGuildPlanPerson(source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  return {
    displayName: cleanSocialText(source.displayName, 16).trim() || "冒険者",
    fallbackEmoji: cleanSocialText(source.fallbackEmoji, 8).trim() || "魔",
  };
}

function normalizeGuildPlanGathering(source, gatherOpensAt, gatherClosesAt) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  const recruitmentId = cleanSocialText(source.recruitmentId, 96).trim();
  const hostPlayerId = normalizedPlayerId(source.hostPlayerId);
  const count = Number(source.count), maximum = Number(source.max), slots = Number(source.slots), expiresAt = Number(source.expiresAt);
  if (!GUILD_RECRUITMENT_ID_PATTERN.test(recruitmentId) || !hostPlayerId
    || !Number.isSafeInteger(count) || !Number.isSafeInteger(maximum) || !Number.isSafeInteger(slots) || !Number.isSafeInteger(expiresAt)
    || maximum < 1 || maximum > 4 || count < 1 || count > maximum || slots !== maximum - count || expiresAt < gatherOpensAt
    || gatherClosesAt > 0 && expiresAt > gatherClosesAt) return null;
  return { recruitmentId, hostPlayerId, count, max: maximum, slots, expiresAt, joined: source.joined === true };
}

export function normalizeGuildPlan(source) {
  const planId = cleanSocialText(source?.planId, 96).trim();
  const purpose = normalizedRoomPurpose(cleanSocialText(source?.purpose, 20).trim(), "");
  const style = cleanSocialText(source?.style, 20).trim();
  const scheduledAt = boundedInteger(source?.scheduledAt, 0, Number.MAX_SAFE_INTEGER, 0);
  const createdAt = boundedInteger(source?.createdAt, 0, Number.MAX_SAFE_INTEGER, 0);
  if (!GUILD_PLAN_ID_PATTERN.test(planId) || !ROOM_PURPOSES.has(purpose) || !ROOM_STYLES.has(style)) return null;
  if (!createdAt || scheduledAt <= createdAt || scheduledAt - createdAt > GUILD_PLAN_MAX_LEAD_MS) return null;
  const organizer = normalizeGuildPlanPerson(source?.organizer);
  if (!organizer) return null;
  const attendees = (Array.isArray(source?.attendees) ? source.attendees : []).slice(0, 20).map(entry => {
    const person = normalizeGuildPlanPerson(entry), status = cleanSocialText(entry?.status, 12).trim();
    return person && (status === "going" || status === "maybe") ? { ...person, status } : null;
  }).filter(Boolean);
  const goingAttendees = attendees.filter(entry => entry.status === "going").length;
  const maybeAttendees = attendees.filter(entry => entry.status === "maybe").length;
  const myStatus = GUILD_PLAN_RESPONSES.has(source?.myStatus) ? source.myStatus : "none";
  const rawGatherOpensAt = Number(source?.gatherOpensAt), rawGatherClosesAt = Number(source?.gatherClosesAt);
  const validGatherWindow = Number.isSafeInteger(rawGatherOpensAt) && Number.isSafeInteger(rawGatherClosesAt)
    && rawGatherOpensAt === scheduledAt - 30 * 60_000 && rawGatherClosesAt === scheduledAt + 2 * 60 * 60_000;
  const gatherOpensAt = validGatherWindow ? rawGatherOpensAt : 0;
  const gatherClosesAt = validGatherWindow ? rawGatherClosesAt : 0;
  return {
    planId,
    purpose,
    style,
    note: cleanSocialText(source?.note, 48).trim(),
    floor: boundedInteger(source?.floor, 1, 100, 1),
    scheduledAt,
    createdAt,
    organizer,
    attendees,
    goingCount: goingAttendees,
    maybeCount: maybeAttendees,
    myStatus,
    canCancel: source?.canCancel === true,
    canGather: source?.canGather === true && validGatherWindow,
    gatherOpensAt,
    gatherClosesAt,
    gathering: validGatherWindow ? normalizeGuildPlanGathering(source?.gathering, gatherOpensAt, gatherClosesAt) : null,
  };
}

export function normalizeGuildPlanReminder(source) {
  const planId = cleanSocialText(source?.planId, 96).trim(), purpose = normalizedRoomPurpose(cleanSocialText(source?.purpose, 20).trim(), ""), style = cleanSocialText(source?.style, 20).trim();
  const scheduledAt = Number(source?.scheduledAt), organizer = normalizeGuildPlanPerson(source?.organizer);
  if (!GUILD_PLAN_ID_PATTERN.test(planId) || !ROOM_PURPOSES.has(purpose) || !ROOM_STYLES.has(style) || !Number.isSafeInteger(scheduledAt) || scheduledAt <= 0 || !organizer) return null;
  let gathering = null;
  if (source?.gathering && typeof source.gathering === "object" && !Array.isArray(source.gathering)) {
    const recruitmentId = cleanSocialText(source.gathering.recruitmentId, 96).trim(), count = Number(source.gathering.count), maximum = Number(source.gathering.max), slots = Number(source.gathering.slots), expiresAt = Number(source.gathering.expiresAt);
    if (!GUILD_RECRUITMENT_ID_PATTERN.test(recruitmentId) || !Number.isSafeInteger(count) || !Number.isSafeInteger(maximum) || !Number.isSafeInteger(slots) || !Number.isSafeInteger(expiresAt) || maximum < 1 || maximum > 4 || count < 1 || count > maximum || slots !== maximum - count || expiresAt <= 0 || source.gathering.joined !== false) return null;
    gathering = { recruitmentId, count, max: maximum, slots, expiresAt, joined: false };
  }
  return { planId, purpose, style, floor: boundedInteger(source?.floor, 1, 100, 1), scheduledAt, organizer, gathering };
}

function normalizeGuildPlans(source) {
  const plansById = new Map();
  for (const raw of (Array.isArray(source) ? source : []).slice(0, 32)) {
    const entry = normalizeGuildPlan(raw);
    if (!entry || plansById.has(entry.planId)) continue;
    plansById.set(entry.planId, entry);
  }
  return [...plansById.values()].sort((left, right) => left.scheduledAt - right.scheduledAt || left.createdAt - right.createdAt || left.planId.localeCompare(right.planId)).slice(0, 8);
}

function normalizeGuildPublic(source) {
  const guildId = normalizedGuildId(source?.guildId);
  if (!guildId) return null;
  const maximum = boundedInteger(source?.maxMembers, 1, 20, 20);
  return {
    guildId,
    name: cleanSocialText(source?.name, 16).trim() || "ギルド",
    tag: cleanSocialText(source?.tag, 4).trim().toUpperCase() || "GD",
    description: cleanSocialText(source?.description, 80).trim(),
    level: boundedInteger(source?.level, 1, 50, 1),
    memberCount: boundedInteger(source?.memberCount, 0, maximum, 0),
    maxMembers: maximum,
    leaderId: normalizedPlayerId(source?.leaderId),
    week: normalizeGuildWeek(source?.week),
  };
}

function normalizeGuildPerson(source) {
  const playerId = normalizedPlayerId(source?.playerId);
  if (!playerId) return null;
  const role = GUILD_ROLES.has(source?.role) ? source.role : "member";
  return {
    playerId,
    displayName: cleanSocialText(source?.displayName, 16).trim() || "冒険者",
    monsterName: cleanSocialText(source?.monsterName, 32).trim() || "仲間",
    fallbackEmoji: cleanSocialText(source?.fallbackEmoji, 8).trim() || "魔",
    online: Boolean(source?.online), role,
    joinedAt: boundedInteger(source?.joinedAt, 0, Number.MAX_SAFE_INTEGER, 0),
    weekPoints: boundedInteger(source?.weekPoints, 0, 1_000_000_000, 0),
  };
}

export function normalizeGuildRecruitment(source) {
  const recruitmentId = cleanSocialText(source?.recruitmentId, 96).trim();
  const playerId = normalizedPlayerId(source?.host?.playerId);
  const expiresAt = boundedInteger(source?.expiresAt, 0, Number.MAX_SAFE_INTEGER, 0);
  if (!recruitmentId || !playerId || !expiresAt) return null;
  const count = boundedInteger(source?.count, 1, 4, 1);
  const maximum = Math.max(count, boundedInteger(source?.max, count, 4, 4));
  const availableSlots = Math.max(0, maximum - count);
  return {
    recruitmentId,
    purpose: normalizedRoomPurpose(source?.purpose),
    style: ROOM_STYLES.has(source?.style) ? source.style : "anyone",
    note: cleanSocialText(source?.note, 48).trim(),
    floor: boundedInteger(source?.floor, 1, 100, 1),
    count,
    max: maximum,
    slots: boundedInteger(source?.slots, 0, availableSlots, availableSlots),
    host: {
      playerId,
      displayName: cleanSocialText(source?.host?.displayName, 16).trim() || "冒険者",
      monsterName: cleanSocialText(source?.host?.monsterName, 32).trim() || "仲間",
      speciesId: /^[A-Za-z0-9_-]{1,80}$/.test(String(source?.host?.speciesId ?? "")) ? String(source.host.speciesId) : "slime",
      fallbackEmoji: cleanSocialText(source?.host?.fallbackEmoji, 8).trim() || "魔",
      level: boundedInteger(source?.host?.level, 1, 99_999_999, 1),
    },
    createdAt: boundedInteger(source?.createdAt, 0, Number.MAX_SAFE_INTEGER, 0),
    expiresAt,
  };
}

function normalizeGuildProfile(source) {
  const base = normalizeGuildPublic(source);
  if (!base) return null;
  const role = GUILD_ROLES.has(source?.role) ? source.role : "member";
  const members = (Array.isArray(source?.members) ? source.members : []).slice(0, 20).map(normalizeGuildPerson).filter(Boolean);
  const applications = (Array.isArray(source?.applications) ? source.applications : []).slice(0, 100).map(normalizeGuildPerson).filter(Boolean);
  const chat = (Array.isArray(source?.chat) ? source.chat : []).slice(-80).map(entry => {
    const playerId = normalizedPlayerId(entry?.playerId), id = cleanSocialText(entry?.id, 96).trim(), text = cleanSocialText(entry?.text, 80).trim();
    if (!playerId || !id || !text) return null;
    return { id, playerId, name: cleanSocialText(entry?.name, 16).trim() || "冒険者", text, at: boundedInteger(entry?.at, 0, Number.MAX_SAFE_INTEGER, 0) };
  }).filter(Boolean);
  const recruitmentIds = new Set(), recruitments = [];
  for (const raw of (Array.isArray(source?.recruitments) ? source.recruitments : []).slice(0, 40)) {
    const entry = normalizeGuildRecruitment(raw);
    if (!entry || recruitmentIds.has(entry.recruitmentId)) continue;
    recruitmentIds.add(entry.recruitmentId); recruitments.push(entry);
    if (recruitments.length >= 20) break;
  }
  const activities = normalizeGuildActivities(source?.activities);
  const plans = normalizeGuildPlans(source?.plans);
  const week = { ...base.week, sharedGoals: normalizeGuildSharedGoals(source?.week?.sharedGoals) };
  return { ...base, week, role, members, applications, chat, plans, recruitments, activities, checkedInToday: Boolean(source?.checkedInToday) };
}

export function normalizeGuildState(source) {
  const invitations = (Array.isArray(source?.invitations) ? source.invitations : []).slice(0, 100).map(entry => {
    const guild = normalizeGuildPublic(entry?.guild), inviteId = cleanSocialText(entry?.inviteId, 96).trim();
    if (!guild || !inviteId) return null;
    const from = normalizeGuildPerson(entry?.from) ?? { playerId: "", displayName: "冒険者", monsterName: "仲間", fallbackEmoji: "魔", online: false, role: "member", joinedAt: 0, weekPoints: 0 };
    return { inviteId, guild, from, expiresAt: boundedInteger(entry?.expiresAt, 0, Number.MAX_SAFE_INTEGER, 0) };
  }).filter(Boolean);
  const applications = (Array.isArray(source?.applications) ? source.applications : []).slice(0, 3).map(normalizeGuildPublic).filter(Boolean);
  return { guild: normalizeGuildProfile(source?.guild), invitations, applications, lookup: normalizeGuildPublic(source?.lookup), serverNow: boundedInteger(source?.serverNow, 0, Number.MAX_SAFE_INTEGER, 0) };
}

export function currentGuildRoomRecruitmentLock(guildState, roomState, now = Date.now()) {
  const guild = guildState?.guild ?? guildState;
  const leaderId = normalizedPlayerId(roomState?.leaderId);
  if (!guild || !leaderId || !Number.isFinite(Number(now))) return { active: false, kind: "none" };
  const activeAt = Number(now);
  const planned = (Array.isArray(guild.plans) ? guild.plans : []).some(plan => {
    const gathering = plan?.gathering;
    return gathering?.joined === true
      && normalizedPlayerId(gathering.hostPlayerId) === leaderId
      && Number.isSafeInteger(gathering.expiresAt)
      && gathering.expiresAt > activeAt;
  });
  if (planned) return { active: true, kind: "planned" };
  const generic = (Array.isArray(guild.recruitments) ? guild.recruitments : []).some(entry => (
    normalizedPlayerId(entry?.host?.playerId) === leaderId
      && Number.isSafeInteger(entry?.expiresAt)
      && entry.expiresAt > activeAt
  ));
  return generic ? { active: true, kind: "generic" } : { active: false, kind: "none" };
}

function normalizeRoomListings(source) {
  const seen = new Set(), listings = [];
  for (const raw of Array.isArray(source) ? source : []) {
    const roomId = safeRoomId(raw?.roomId);
    if (roomId.length !== 6 || seen.has(roomId)) continue;
    const purpose = normalizedRoomPurpose(raw?.purpose);
    const style = ROOM_STYLES.has(raw?.style) ? raw.style : "anyone";
    const count = Math.max(1, Math.min(4, Math.floor(Number(raw?.count) || 1)));
    const maximum = Math.max(count, Math.min(4, Math.floor(Number(raw?.max) || 4)));
    listings.push({
      roomId, listingId: String(raw?.listingId ?? "").slice(0, 96), purpose, style,
      floor: Math.max(1, Math.min(100, Math.floor(Number(raw?.floor) || 1))), count, max: maximum,
      slots: Math.max(0, Math.min(maximum, Math.floor(Number(raw?.slots) || maximum - count))),
      host: {
        displayName: String(raw?.host?.displayName ?? "冒険者").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 16) || "冒険者",
        monsterName: String(raw?.host?.monsterName ?? "仲間").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 40) || "仲間",
      },
      publishedAt: Math.max(0, Number(raw?.publishedAt) || 0), updatedAt: Math.max(0, Number(raw?.updatedAt) || 0), expiresAt: Math.max(0, Number(raw?.expiresAt) || 0),
    });
    seen.add(roomId);
    if (listings.length >= 24) break;
  }
  return listings;
}

function normalizedWebsocketEndpoint(input) {
  let source = String(input ?? "").trim();
  if (!source || source.length > 2048) return "";
  if (!/^https?:\/\//i.test(source) && !/^wss?:\/\//i.test(source)) source = `https://${source}`;
  let url;
  try { url = new URL(source); } catch { return ""; }
  if (url.protocol === "https:") url.protocol = "wss:";
  else if (url.protocol === "http:") url.protocol = "ws:";
  if (!["ws:", "wss:"].includes(url.protocol) || !url.hostname || url.username || url.password) return "";
  url.pathname = "/party"; url.search = ""; url.hash = "";
  return url.toString();
}

function cleanResumeToken(value) {
  const token = typeof value === "string" ? value.trim() : "";
  return token && token.length <= RESUME_TOKEN_MAX_LENGTH && !/[\u0000-\u001f\u007f]/.test(token) ? token : "";
}

function readResumeTokenMap() {
  const raw = storageGet(ONLINE_STORAGE_KEYS.resumeTokenMap, "{}");
  if (!raw || raw.length > RESUME_TOKEN_MAP_MAX_BYTES) return Object.create(null);
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return Object.create(null); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return Object.create(null);
  const result = Object.create(null);
  for (const [rawEndpoint, rawToken] of Object.entries(parsed).slice(0, RESUME_TOKEN_MAP_LIMIT)) {
    const endpoint = normalizedWebsocketEndpoint(rawEndpoint), token = cleanResumeToken(rawToken);
    if (endpoint && endpoint === rawEndpoint && token) result[endpoint] = token;
  }
  return result;
}

function writeResumeTokenMap(source) {
  const entries = Object.entries(source ?? {}).filter(([endpoint, token]) => normalizedWebsocketEndpoint(endpoint) === endpoint && cleanResumeToken(token)).slice(-RESUME_TOKEN_MAP_LIMIT);
  storageSet(ONLINE_STORAGE_KEYS.resumeTokenMap, JSON.stringify(Object.fromEntries(entries)));
}

function migrateLegacyResumeToken() {
  const tokens = readResumeTokenMap();
  if (storageGet(ONLINE_STORAGE_KEYS.resumeTokenMigration) === "1") return tokens;
  const legacy = cleanResumeToken(storageGet(ONLINE_STORAGE_KEYS.resumeToken));
  const savedEndpoint = normalizedWebsocketEndpoint(storageGet(ONLINE_STORAGE_KEYS.serverUrl));
  if (!legacy) { storageSet(ONLINE_STORAGE_KEYS.resumeTokenMigration, "1"); return tokens; }
  // A legacy token is only associated with the URL that the legacy client
  // itself saved.  An invite URL must never inherit another server's token.
  if (!savedEndpoint) return tokens;
  if (!tokens[savedEndpoint]) { tokens[savedEndpoint] = legacy; writeResumeTokenMap(tokens); }
  storageSet(ONLINE_STORAGE_KEYS.resumeTokenMigration, "1");
  return tokens;
}

function websocketUrl(input) {
  if (!String(input ?? "").trim()) throw new Error("PCサーバーのURLを入力してください");
  const endpoint = normalizedWebsocketEndpoint(input);
  if (!endpoint) throw new Error("http(s) または ws(s) のURLを入力してください");
  const url = new URL(endpoint);
  if (globalThis.location?.protocol === "https:" && url.protocol === "ws:" && !["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error("HTTPS版ゲームでは https:// のトンネルURLを使ってください");
  return endpoint;
}

function fullResetRaidRequestId() {
  const pending = storageGet(ONLINE_STORAGE_KEYS.fullResetRaidRequest).trim();
  if (FULL_RESET_REQUEST_PATTERN.test(pending)) return pending;
  const entropy = globalThis.crypto?.randomUUID?.().replaceAll("-", "")
    ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  const requestId = `full-reset-${entropy}`.slice(0, 96);
  storageSet(ONLINE_STORAGE_KEYS.fullResetRaidRequest, requestId);
  return requestId;
}

function storeStandaloneResumeToken(endpointValue, value) {
  const endpoint = normalizedWebsocketEndpoint(endpointValue), token = cleanResumeToken(value);
  if (!endpoint || !token) return false;
  const tokens = readResumeTokenMap();
  if (Object.prototype.hasOwnProperty.call(tokens, endpoint)) delete tokens[endpoint];
  tokens[endpoint] = token;
  while (Object.keys(tokens).length > RESUME_TOKEN_MAP_LIMIT) delete tokens[Object.keys(tokens)[0]];
  writeResumeTokenMap(tokens);
  storageSet(ONLINE_STORAGE_KEYS.resumeTokenMigration, "1");
  storageSet(ONLINE_STORAGE_KEYS.resumeToken, token);
  return true;
}

/**
 * Authenticate with the preserved online identity and clear only this
 * account's current weekly-raid state before the local save is erased.  The
 * request id remains in localStorage until the server ACK arrives, so an
 * offline/timeout retry is safe and the local reset must not be committed.
 */
export function resetCurrentWeeklyRaidForFullReset(state, { timeoutMs = FULL_RESET_TIMEOUT_MS, WebSocketImpl = globalThis.WebSocket } = {}) {
  const requestId = fullResetRaidRequestId(), identity = ensureOnlineIdentity();
  if (typeof WebSocketImpl !== "function") return Promise.resolve({ ok: false, reason: "offline", requestId });
  let endpoint;
  try { endpoint = websocketUrl(storageGet(ONLINE_STORAGE_KEYS.serverUrl) || DEFAULT_ONLINE_SERVER_URL); }
  catch (error) { return Promise.resolve({ ok: false, reason: "serverUrl", message: error?.message, requestId }); }
  const resumeToken = migrateLegacyResumeToken()[endpoint] ?? "", clientKey = storageGet(ONLINE_STORAGE_KEYS.clientKey), profile = buildOnlinePartyProfile(state ?? {}, { displayName: storageGet(ONLINE_STORAGE_KEYS.displayName) });
  return new Promise(resolve => {
    let socket = null, settled = false, authenticated = false, resetSent = false;
    const finish = result => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      if (result.ok) storageRemove(ONLINE_STORAGE_KEYS.fullResetRaidRequest);
      try { socket?.close?.(1000, result.ok ? "full reset raid acknowledged" : "full reset raid aborted"); } catch {}
      resolve({ requestId, ...result });
    };
    const send = message => {
      if (!socket || socket.readyState !== 1) return false;
      try { socket.send(JSON.stringify(message)); return true; } catch { return false; }
    };
    const sendReset = () => {
      if (resetSent) return;
      resetSent = true;
      if (!send({ type: "resetWeeklyRaidForFullReset", requestId })) finish({ ok: false, reason: "offline" });
    };
    const timer = setTimeout(() => finish({ ok: false, reason: authenticated ? "timeout" : "offline" }), Math.max(2_000, Number(timeoutMs) || FULL_RESET_TIMEOUT_MS));
    try { socket = new WebSocketImpl(endpoint); }
    catch (error) { finish({ ok: false, reason: "offline", message: error?.message }); return; }
    socket.addEventListener("open", () => {
      if (!send({ type: "hello", protocol: ONLINE_PROTOCOL, friendId: identity.friendId, clientKey, resumeToken, profile })) finish({ ok: false, reason: "offline" });
    });
    socket.addEventListener("message", event => {
      let message; try { message = JSON.parse(event.data); } catch { return; }
      if (message?.type === "error") {
        const authCodes = new Set(["ID_IN_USE", "RESUME_TOKEN_MISMATCH", "BAD_CLIENT_KEY", "BAD_FRIEND_ID"]);
        const reason = message.code === "RESET_TRADE_ACTIVE" ? "tradePending" : authCodes.has(message.code) ? "auth" : message.code === "PROTOCOL_MISMATCH" || message.code === "UNKNOWN_MESSAGE" ? "unsupported" : "server";
        finish({ ok: false, reason, code: message.code, message: message.message }); return;
      }
      if (message?.type === "helloAck") {
        if (message.protocol !== ONLINE_PROTOCOL || message.capabilities?.fullResetRaidV1 !== true) { finish({ ok: false, reason: "unsupported" }); return; }
        authenticated = true;
        if (!storeStandaloneResumeToken(endpoint, message.resumeToken)) { finish({ ok: false, reason: "auth" }); return; }
        if (Array.isArray(message.activeTradeIds) && message.activeTradeIds.length) { finish({ ok: false, reason: "tradePending" }); return; }
        if (message.room) {
          if (!send({ type: "leaveRoom" })) finish({ ok: false, reason: "offline" });
        } else sendReset();
        return;
      }
      if (message?.type === "leftRoom") { sendReset(); return; }
      if (message?.type === "weeklyRaidResetAck" && message.requestId === requestId) finish({ ok: true, weekId: message.weekId, duplicate: Boolean(message.duplicate) });
    });
    socket.addEventListener("close", () => { if (!settled) finish({ ok: false, reason: authenticated ? "offline" : "auth" }); });
    socket.addEventListener("error", () => {});
  });
}

async function copyText(value) {
  try { await navigator.clipboard.writeText(String(value)); return true; } catch {
    const node = document.createElement("textarea"); node.value = String(value); node.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(node); node.select(); const ok = document.execCommand?.("copy"); node.remove(); return Boolean(ok);
  }
}

export class OnlinePartyController {
  constructor({ getState, toast = () => {}, onReward = async () => ({ ok: false }), onExpeditionStarted = () => ({ ok: true }), onExpeditionResult = async () => ({ ok: false }), onExpeditionOrphaned = async () => ({ ok: true, active: false }), onGuestProgressIsolation = () => ({ ok: true }), onShowExpeditionResult = () => {}, onBack = () => {}, onExploreCanvasMount = () => {}, onExploreCanvasUpdate = () => {}, onExploreCanvasUnmount = () => {}, onHostWorldUpdate = () => {}, onFloorBossDefeated = () => {}, onOnlineStateMutation = () => ({ ok: true }), onRaidWorldUpdate = () => {}, onRaidExchange = async () => ({ ok: false }), onOnlineVitalsUpdate = () => {}, onBattleDefeated = () => {}, onTeamBattleResult = () => {}, onSecretRoomEntered = () => {}, onBeginSecretRoomExpedition = () => {}, onTutorialGuide = () => {}, onScene = () => {}, onPowerRankingState = () => {}, onPowerRankingProfile = () => {}, onPowerRankingCapability = () => {}, onPowerRankingReward = async () => ({ ok: false }) } = {}) {
    const identity = ensureOnlineIdentity();
    this.getState = getState;
    this.toast = toast;
    this.onReward = onReward;
    this.onExpeditionStarted = onExpeditionStarted;
    this.onExpeditionResult = onExpeditionResult;
    this.onExpeditionOrphaned = onExpeditionOrphaned;
    this.onGuestProgressIsolation = onGuestProgressIsolation;
    this.onShowExpeditionResult = onShowExpeditionResult;
    this.onBack = onBack;
    this.onExploreCanvasMount = onExploreCanvasMount;
    this.onExploreCanvasUpdate = onExploreCanvasUpdate;
    this.onExploreCanvasUnmount = onExploreCanvasUnmount;
    this.onHostWorldUpdate = onHostWorldUpdate;
    this.onFloorBossDefeated = onFloorBossDefeated;
    this.onOnlineStateMutation = onOnlineStateMutation;
    this.onRaidWorldUpdate = onRaidWorldUpdate;
    this.onRaidExchange = onRaidExchange;
    this.onOnlineVitalsUpdate = onOnlineVitalsUpdate;
    this.onBattleDefeated = onBattleDefeated;
    this.onTeamBattleResult = onTeamBattleResult;
    this.onSecretRoomEntered = onSecretRoomEntered;
    this.onBeginSecretRoomExpedition = onBeginSecretRoomExpedition;
    this.onTutorialGuide = onTutorialGuide;
    this.onScene = onScene;
    this.onPowerRankingState = onPowerRankingState;
    this.onPowerRankingProfile = onPowerRankingProfile;
    this.onPowerRankingCapability = onPowerRankingCapability;
    this.onPowerRankingReward = onPowerRankingReward;
    this.selfId = identity.friendId;
    const initialServerUrl = storageGet(ONLINE_STORAGE_KEYS.serverUrl) || DEFAULT_ONLINE_SERVER_URL;
    const initialResumeEndpoint = normalizedWebsocketEndpoint(initialServerUrl);
    const initialResumeTokens = migrateLegacyResumeToken();
    this.resumeTokenEndpoint = initialResumeEndpoint;
    this.connectionEndpoint = "";
    this.lastHelloEndpoint = "";
    this.socketEndpoints = new WeakMap();
    this.resumeToken = initialResumeEndpoint ? initialResumeTokens[initialResumeEndpoint] ?? "" : "";
    this.resumeTokenStorageSnapshot = this.resumeToken;
    this.lastHelloResumeToken = "";
    this.helloAckPending = false;
    this.handshakeTokenRetries = 0;
    this.pendingLeaveOnReconnect = null;
    this.pendingLeaveTimer = null;
    this.selectedMonsterId = storageGet(ONLINE_STORAGE_KEYS.monsterId);
    const storedRoute = storageGet(ONLINE_STORAGE_KEYS.route);
    this.route = storedRoute === "resonance" ? "explore" : normalizedOnlineRoute(storedRoute);
    if (LEGACY_RESONANCE_ROUTES.has(storedRoute)) storageSet(ONLINE_STORAGE_KEYS.route, "explore");
    this.profile = null;
    this.root = null;
    this.ws = null;
    this.roomState = null;
    this.roomId = null;
    this.capabilities = new Set();
    this.backgroundActive = false;
    this.backgroundOnly = false;
    this.desiredBackgroundOnly = false;
    this.backgroundConnectionBusy = false;
    this.backgroundBound = [];
    this.connectionModePending = false;
    this.foregroundProfileSyncPending = false;
    this.powerRankingState = normalizePowerRankingState(null, { supported: false });
    this.powerRankingProfile = null;
    this.powerRankingRequests = new Map();
    this.powerRankingRequestSequence = 0;
    this.latestPowerRankingListRequestId = "";
    this.latestPowerRankingProfileRequestId = "";
    this.powerRankingWanted = false;
    this.powerRankingWantedOptions = { limit: POWER_RANKING_ENTRY_LIMIT };
    this.powerRankingProfileWanted = "";
    this.latestPowerRankingSnapshot = null;
    this.lastPowerRankingSnapshotSignature = "";
    this.lastPowerRankingSnapshotAt = 0;
    this.roomListings = [];
    this.friendState = { friends: [], incoming: [], outgoing: [], invites: [], blocked: [], muted: [] };
    this.guildState = emptyGuildState();
    this.guildClockOffsetMs = 0;
    this.guildClockSynced = false;
    this.guildPlanReminderReceipts = new Set(readGuildPlanReminderReceipts());
    this.friendPanelOpen = false;
    this.socialTab = "friends";
    this.socialScrollByTab = { friends: 0, guild: 0 };
    this.guildChatScroll = { top: 0, atBottom: true };
    this.friendIdDraft = "";
    this.guildLookupDraft = "";
    this.guildCreateDraft = { name: "", tag: "", description: "" };
    this.guildChatDraft = "";
    this.guildPlanDraft = defaultGuildPlanDraft();
    this.guildPlanComposerOpen = false;
    this.guildPlansExpanded = false;
    this.guildRecruitmentDraft = { purpose: "explore", style: "anyone", note: "" };
    this.guildActivitiesExpanded = false;
    this.guildPending = null;
    this.guildPendingTimer = null;
    this.guildPlanTransitionTimer = null;
    this.guildStatus = "";
    this.lastGuildChatAt = 0;
    this.roomListingsStatus = "idle";
    this.roomListingsGeneratedAt = 0;
    this.roomListingPurposeFilter = "all";
    this.roomBoardRenderSignature = "";
    this.pendingRoomJoinId = null;
    this.roomListingPending = false;
    this.roomMemberRemovalPendingId = null;
    this.mounted = false;
    this.manualClose = true;
    this.connectionReady = false;
    this.supersededConnection = false;
    this.connectionStatus = { kind: "offline", title: "オフライン", detail: "オンラインサーバーへ接続されていません" };
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.rewardInFlight = new Set();
    this.expeditionResultInFlight = new Set();
    this.recoverySettlementBatch = 0;
    this.recoverySettlementTasks = new Set();
    this.recoverySettlementFailed = false;
    this.presentedExpeditionResultIds = new Set();
    this.floorBossConfirm = null;
    this.coopBossConfirm = null;
    this.pendingFloorBossReward = null;
    this.selectedTarget = { explore: null, raid: "juvenile-amalga", team: null };
    this.selectedAlly = { explore: this.selfId, raid: this.selfId, team: this.selfId };
    this.skillMenu = { explore: false, raid: false, team: false };
    this.itemMenu = { explore: false, raid: false, team: false };
    this.itemTargetMenu = { explore: false, raid: false, team: false };
    this.hpTrails = { explore: {}, raid: {}, team: {} };
    this.presentationKoIds = { explore: new Set(), raid: new Set(), team: new Set() };
    this.raidReport = null;
    this.teamBattleReport = null;
    this.expeditionReport = null;
    this.pendingExpeditionReturnResult = null;
    this.pendingExpeditionStart = false;
    this.pendingSecretRoomRun = null;
    this.syncedExpeditionStartKey = "";
    this.guestProgressIsolationContext = null;
    this.trade = null;
    this.tradeFilter = "all";
    this.tradeQuery = "";
    this.tradeDraftRef = "";
    this.tradeAmount = "1";
    this.tradeConfirmAvailableAt = 0;
    this.tradeConfirmTimer = null;
    this.tradePendingOffer = null;
    this.tradeOfferSequence = 0;
    this.tradeReconcileSequence = 0;
    this.tradeReconcilePending = false;
    this.tradeReconnectAuthoritativeIds = new Set();
    this.tradePersistenceBlocked = false;
    this.tradeOfferInflight = new Map();
    this.tradeReconcileInflight = new Map();
    this.tradeCommitInflight = new Map();
    this.tradeFinishInflight = new Map();
    this.tradeRecoveryStatus = null;
    this.tradeRecoveryTimer = null;
    this.terminalTradeRecoveries = new Set();
    this.raidExchangePending = null;
    this.lastRaidWorldSignature = "";
    this.lastHostWorldSnapshotSignature = "";
    this.hostWorldRevision = Math.max(0, Number(this.getState?.()?.onlineParty?.hostWorld?.revision) || 0);
    this.processedHostWorldDeltas = new Set();
    this.processedBattleEvents = new Set();
    this.processedCoopTechniqueEvents = new Set();
    this.notifiedTutorialGuides = new Set();
    this.pendingExpeditionProfileSync = false;
    this.pendingRewardReceipt = null;
    this.rewardReceiptQueue = [];
    this.rewardReceiptTimer = null;
    this.rewardReceiptAdvanceTimer = null;
    this.hallDestination = null;
    this.hallNearbyRoute = null;
    this.hallGamesOpen = false;
    this.hallGameTab = "";
    this.hallGameRequestSequence = 0;
    this.exploreCanvasMounted = false;
    this.exploreCanvasUpdateFrame = null;
    this.pendingExploreCanvasUpdate = null;
    this.presentationTimers = new Set();
    this.onlineHudCollapsed = false;
    this.heldDirections = new Set();
    this.keyboardMoveMode = "";
    this.movePointers = new Map();
    this.movePointerSequence = 0;
    this.path = [];
    this.lastMoveAt = 0;
    this.lastChatAt = 0;
    this.chatDraft = "";
    this.exploreChatOpen = false;
    this.emoteGestureActive = false;
    this.emoteGestureCleanup = null;
    this.rareMerchantOpen = false;
    this.merchantPending = false;
    this.merchantResult = null;
    this.merchantPendingTimer = null;
    this.interactionPending = null;
    this.interactionPendingTimer = null;
    this.chatBubbles = new Map();
    this.socialBubbles = new Map();
    this.pingMenuOpen = false;
    this.coopPings = new Map();
    this.unread = 0;
    this.clockFrame = null;
    this.moveFrame = null;
    this.bound = [];
  }

  mount(root) {
    const openSocket = Boolean(this.ws && typeof WebSocket !== "undefined" && this.ws.readyState === WebSocket.OPEN);
    const connected = Boolean(this.connectionReady && openSocket);
    const wasBackgroundOnly = this.backgroundOnly;
    const foregroundProfileSyncNeeded = Boolean(openSocket && (
      connected && (wasBackgroundOnly || this.connectionModePending)
        && this.capabilities.has(POWER_RANKING_CAPABILITY) && this.capabilities.has(BACKGROUND_CONNECTION_CAPABILITY)
      || !this.connectionReady && this.helloAckPending && wasBackgroundOnly
    ));
    this.unmount({ disconnect: false, backgroundTransition: false });
    this.root = root;
    this.mounted = true;
    this.desiredBackgroundOnly = false;
    this.backgroundConnectionBusy = false;
    this.manualClose = Boolean(this.supersededConnection);
    this._refreshProfile();
    if (foregroundProfileSyncNeeded) this.foregroundProfileSyncPending = true;
    this._bindStaticUi();
    this._renderTradeRecoveryStatus();
    this._startLoops();
    if (connected) {
      if (wasBackgroundOnly && this.capabilities.has(POWER_RANKING_CAPABILITY) && this.capabilities.has(BACKGROUND_CONNECTION_CAPABILITY)) {
        this._requestConnectionMode(false);
        this._setStatus("connecting", "オンライン画面を準備中…", "同じ接続で部屋情報を復帰しています");
        this._showConnectionStep("gate");
        return;
      }
      this.backgroundOnly = false;
      this._setStatus("online", "接続済み", this.roomState ? "オンライン探索へ戻りました" : "部屋を作るか、ルームIDで参加してください");
      this._showConnectionStep(this.roomState ? "room" : "gate");
      if (this.roomState) this._render();
      else this._requestRoomListings();
      this._flushExpeditionProfileSync();
      return;
    }
    this._renderRoomBoard();
    if (this.supersededConnection) {
      this._setStatus("error", "別の画面で接続済み", "この画面の自動再接続を停止しました。再開する場合は接続を押してください");
      return;
    }
    this._setStatus("offline", "オフライン", "通常ゲームのセーブには影響しません");
    const awaitingInitialAck = Boolean(this.helloAckPending);
    if (storageGet(ONLINE_STORAGE_KEYS.serverUrl) && (awaitingInitialAck || storageGet(ONLINE_STORAGE_KEYS.autoConnect) === "1" && this._refreshResumeTokenFromStorage())) {
      if (awaitingInitialAck) this._setStatus("reconnecting", "認証確認中…", "初回接続の応答を安全に再確認しています");
      queueMicrotask(() => { if (this.mounted) this.connect({ reconnect: true }); });
    }
  }

  unmount({ disconnect = true, backgroundTransition = true } = {}) {
    this.mounted = false;
    this.emoteGestureCleanup?.();
    this._clearMoveInputs();
    this.hallDestination = null;
    this._unmountExploreCanvas();
    clearTimeout(this.interactionPendingTimer); clearTimeout(this.merchantPendingTimer);
    clearTimeout(this.tradeConfirmTimer); clearTimeout(this.rewardReceiptTimer); clearTimeout(this.rewardReceiptAdvanceTimer);
    clearTimeout(this.tradeRecoveryTimer);
    clearTimeout(this.pendingLeaveTimer);
    this._clearGuildPlanTransitionTimer();
    this.interactionPendingTimer = null; this.merchantPendingTimer = null;
    this.tradeConfirmTimer = null; this.rewardReceiptTimer = null; this.rewardReceiptAdvanceTimer = null; this.pendingRewardReceipt = null; this.rewardReceiptQueue = []; this.tradeRecoveryTimer = null; this.pendingLeaveTimer = null;
    if (this.tradeRecoveryStatus?.status === "complete") this.tradeRecoveryStatus = null;
    this._clearPresentationTimers();
    for (const ids of Object.values(this.presentationKoIds)) ids.clear();
    this._removeEvents();
    if (this.clockFrame) cancelAnimationFrame(this.clockFrame);
    if (this.moveFrame) cancelAnimationFrame(this.moveFrame);
    this.clockFrame = null; this.moveFrame = null;
    this.root?.querySelector(".online-v3-screen")?.classList.remove("online-shared-gameplay-active");
    if (disconnect) this.disconnect({ leave: true, quiet: true });
    else if (backgroundTransition && this.backgroundActive) {
      this.desiredBackgroundOnly = true;
      this._requestConnectionMode(true);
    }
    this.root = null;
  }

  _bindBackgroundLifecycle() {
    if (this.backgroundBound.length) return;
    const bind = (target, type, handler) => {
      if (!target?.addEventListener) return;
      target.addEventListener(type, handler);
      this.backgroundBound.push([target, type, handler]);
    };
    const resume = () => this._ensureConnectionAfterResume();
    bind(globalThis.document, "visibilitychange", () => { if (globalThis.document?.visibilityState === "visible") resume(); });
    bind(globalThis.window, "pageshow", resume);
    bind(globalThis.window, "online", resume);
  }

  _removeBackgroundLifecycle() {
    for (const [target, type, handler] of this.backgroundBound) target.removeEventListener(type, handler);
    this.backgroundBound = [];
  }

  _requestConnectionMode(backgroundOnly) {
    this.desiredBackgroundOnly = Boolean(backgroundOnly);
    if (!this.connectionReady || !this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    if (!this.capabilities.has(POWER_RANKING_CAPABILITY) || !this.capabilities.has(BACKGROUND_CONNECTION_CAPABILITY)) return false;
    if (this.connectionModePending || this.backgroundOnly === this.desiredBackgroundOnly) return true;
    this.connectionModePending = this._send("setConnectionMode", { backgroundOnly: this.desiredBackgroundOnly });
    return this.connectionModePending;
  }

  /**
   * Keep the controller's single authenticated socket alive while the Home
   * screen owns the ranking UI. No room is joined or rendered in this mode.
   */
  startBackground({ connect = true } = {}) {
    this.backgroundActive = true;
    this._bindBackgroundLifecycle();
    if (this.supersededConnection) return { ok: false, reason: "superseded" };
    if (this.backgroundConnectionBusy && !this.mounted) return { ok: false, reason: "busy" };
    if (this.mounted) return { ok: true, connected: this._canMutateOnline(), foreground: true };
    this.desiredBackgroundOnly = true;
    if (!this.connectionReady) this.backgroundOnly = true;
    if (!connect || this.ws && [WebSocket.OPEN, WebSocket.CONNECTING].includes(this.ws.readyState)) {
      if (this.connectionReady && this.ws?.readyState === WebSocket.OPEN) this._requestConnectionMode(true);
      return { ok: true, connected: Boolean(this.connectionReady && this.ws?.readyState === WebSocket.OPEN) };
    }
    this.manualClose = false;
    this.connect({ reconnect: true });
    return { ok: true, connected: false, connecting: true };
  }

  stopBackground({ disconnect = false } = {}) {
    this.backgroundActive = false;
    this.desiredBackgroundOnly = false;
    this._removeBackgroundLifecycle();
    if (disconnect && !this.mounted) this.disconnect({ leave: false, quiet: true });
    return { ok: true };
  }

  _bind(target, type, handler, options) {
    if (!target) return;
    target.addEventListener(type, handler, options);
    this.bound.push([target, type, handler, options]);
  }

  _removeEvents() {
    for (const [target, type, handler, options] of this.bound) target.removeEventListener(type, handler, options);
    this.bound = [];
  }

  _query(selector) { return this.root?.querySelector(selector) ?? null; }

  _pointerModeForButton(button) {
    if (button?.matches?.("[data-online-move]")) return "explore";
    return "";
  }

  _beginPointerMove(event, button) {
    if (!button || event?.button != null && event.button !== 0) return false;
    if (!this._canMutateOnline()) { this._announceConnectionPause(); return false; }
    const mode = this._pointerModeForButton(button);
    const direction = String(button.dataset?.onlineMove || "");
    const pointerId = Number(event?.pointerId);
    if (!mode || !DIRECTION[direction] || !Number.isFinite(pointerId) || this.movePointers.has(pointerId)) return false;
    event.preventDefault?.();
    this.path = [];
    this.movePointers.set(pointerId, { pointerId, mode, direction, sequence: ++this.movePointerSequence });
    try { button.setPointerCapture?.(pointerId); } catch {}
    return true;
  }

  _endPointerMove(event) {
    const pointerId = Number(event?.pointerId);
    if (!Number.isFinite(pointerId)) return false;
    return this.movePointers.delete(pointerId);
  }

  _currentMoveDirection(mode) {
    let latest = null;
    for (const pointer of this.movePointers.values()) if (pointer.mode === mode && (!latest || pointer.sequence > latest.sequence)) latest = pointer;
    return latest?.direction ?? (this.keyboardMoveMode === mode ? [...this.heldDirections][0] : null) ?? null;
  }

  _clearMoveInputs() {
    this.heldDirections.clear();
    this.keyboardMoveMode = "";
    this.movePointers.clear();
    this.path = [];
  }

  _movePointerModeActive(mode) {
    if (mode === "explore") return this.route === "explore" && this.roomState?.phase === "expedition" && !this.roomState?.expedition?.battle;
    return false;
  }

  _clearInactiveMoveInputs() {
    for (const [pointerId, pointer] of this.movePointers) if (!this._movePointerModeActive(pointer.mode)) this.movePointers.delete(pointerId);
    if (this.keyboardMoveMode && !this._movePointerModeActive(this.keyboardMoveMode)) { this.heldDirections.clear(); this.keyboardMoveMode = ""; }
  }

  _bindStaticUi() {
    this._bind(this.root, "click", event => this._handleClick(event));
    this._bind(this.root, "submit", event => this._handleSubmit(event));
    this._bind(this.root, "input", event => this._handleInput(event));
    this._bind(this.root, "change", event => this._handleChange(event));
    this._bind(this.root, "keydown", event => {
      if (this.friendPanelOpen && event.key === "Escape") {
        event.preventDefault(); this.friendPanelOpen = false; this._renderFriendPanel();
        requestAnimationFrame(() => this._query("[data-online-friends-toggle]")?.focus()); return;
      }
      if (this.friendPanelOpen && event.key === "Tab") {
        const panel = this._query(".online-social-panel"), focusable = [...(panel?.querySelectorAll("button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),summary,[href]") ?? [])];
        if (focusable.length) {
          const first = focusable[0], last = focusable.at(-1), active = panel?.ownerDocument?.activeElement;
          if (!panel.contains(active) || event.shiftKey && active === first || !event.shiftKey && active === last) { event.preventDefault(); (event.shiftKey ? last : first).focus(); return; }
        }
      }
      if (!event.target.matches?.("[data-online-chat-input],[data-online-explore-chat-input],[data-online-guild-chat-input]") || event.key !== "Enter" || event.shiftKey || event.isComposing) return;
      event.preventDefault(); event.target.form?.requestSubmit();
    });
    this._bind(window, "keydown", event => {
      const direction = keyDirection(event.key);
      const movingExplore = this.route === "explore" && this.roomState?.phase === "expedition" && !this.roomState?.expedition?.battle;
      if (!direction || isTyping(event.target) || !movingExplore || !this._canMutateOnline()) return;
      event.preventDefault(); this.path = []; this.keyboardMoveMode = "explore"; this.heldDirections.add(direction);
    });
    this._bind(window, "keyup", event => { const direction = keyDirection(event.key); if (direction) { this.heldDirections.delete(direction); if (!this.heldDirections.size) this.keyboardMoveMode = ""; } });
    this._bind(window, "blur", () => this._clearMoveInputs());
    this._bind(window, "pagehide", () => this._clearMoveInputs());
    this._bind(document, "visibilitychange", () => {
      if (document.visibilityState === "visible") this._ensureConnectionAfterResume();
      else this._clearMoveInputs();
    });
    this._bind(window, "pageshow", () => this._ensureConnectionAfterResume());
    this._bind(window, "online", () => this._ensureConnectionAfterResume());
    this._bind(this.root, "pointerdown", event => {
      const button = event.target.closest?.("[data-online-move]");
      if (!button) return;
      this._beginPointerMove(event, button);
    });
    this._bind(this.root, "pointerdown", event => {
      const emote = event.target.closest?.("[data-online-emote-anchor]");
      if (emote) { if (this._canMutateOnline()) this._beginEmoteGesture(event, emote); else this._announceConnectionPause(); return; }
      const target = event.target.closest?.("[data-enemy-target]");
      if (!target || !this._canMutateOnline()) return;
      const timer = setTimeout(() => { target.dataset.focusHold = "1"; this._send("focusTarget", { mode: this.route, targetId: target.dataset.enemyTarget }); this.toast("集中攻撃マーカーを共有しました"); }, 520);
      const cancel = () => { clearTimeout(timer); window.removeEventListener("pointerup", cancel, true); window.removeEventListener("pointercancel", cancel, true); };
      window.addEventListener("pointerup", cancel, true); window.addEventListener("pointercancel", cancel, true);
    });
    for (const target of [window, document]) for (const type of ["pointerup", "pointercancel"]) this._bind(target, type, event => this._endPointerMove(event), true);
  }

  _handleClick(event) {
    const mapCell = event.target.closest?.("[data-map-x][data-map-y]");
    if (mapCell && this.route === "explore" && this.roomState?.phase === "expedition") {
      if (!this._canMutateOnline()) { this._announceConnectionPause(); return; }
      this._setDestination({ x: Number(mapCell.dataset.mapX), y: Number(mapCell.dataset.mapY) });
      return;
    }
    const hall = event.target.closest?.("[data-online-hall-stage]");
    if (hall && !event.target.closest?.("button,.online-hall-hud,.online-hall-prompt,.online-hall-party-strip,.online-hall-quick-chat,.online-hall-games-modal")) {
      if (this.exploreChatOpen || this.hallGamesOpen || this.emoteGestureActive) return;
      if (!this._canMutateOnline()) { this._announceConnectionPause(); return; }
      const world = hall.querySelector(".online-hall-world"), rect = world?.getBoundingClientRect();
      if (rect?.width && rect?.height) this.hallDestination = { x: clamp((event.clientX - rect.left) / rect.width * 100, 5, 95), y: clamp((event.clientY - rect.top) / rect.height * 100, 15, 96) };
      return;
    }
    const button = event.target.closest?.("button");
    if (!button) return;
    if (button.matches("[data-online-guild-plan-attention]")) { this._openGuildPlanAttention(button.dataset.onlineGuildPlanAttention); return; }
    if (button.matches("[data-online-friends-toggle]")) { this.friendPanelOpen = true; this._renderFriendPanel(); requestAnimationFrame(() => this._query(".online-social-header [data-online-friends-close]")?.focus()); return; }
    if (button.matches("[data-online-friends-close]")) { this.friendPanelOpen = false; this._renderFriendPanel(); requestAnimationFrame(() => this._query("[data-online-friends-toggle]")?.focus()); return; }
    if (button.matches("[data-online-social-tab]")) {
      const tab = button.dataset.onlineSocialTab === "guild" ? "guild" : "friends", content = this._query(".online-social-content");
      if (tab !== this.socialTab && content) this.socialScrollByTab[this.socialTab] = content.scrollTop;
      this.socialTab = tab; this._renderFriendPanel();
      requestAnimationFrame(() => { const target = this._query(`[data-online-social-tab="${this.socialTab}"]`); try { target?.focus({ preventScroll: true }); } catch { target?.focus(); } }); return;
    }
    if (button.matches("[data-copy-guild-id]")) { copyText(button.dataset.copyGuildId).then(ok => this.toast(ok ? "ギルドIDをコピーしました" : "コピーできませんでした")); return; }
    if (button.matches("[data-online-guild-activity-more]")) { this.guildActivitiesExpanded = !this.guildActivitiesExpanded; this._renderFriendPanel(); return; }
    if (button.matches("[data-online-guild-plan-more]")) { this.guildPlansExpanded = !this.guildPlansExpanded; this._renderFriendPanel(); return; }
    if (button.matches("[data-online-guild-plan-compose-toggle]")) { this.guildPlanComposerOpen = !this.guildPlanComposerOpen; this._renderFriendPanel(); return; }
    if (button.matches("[data-online-user-mute]")) { this._setPlayerMuted(button.dataset.onlineUserMute, true); return; }
    if (button.matches("[data-online-user-unmute]")) { this._setPlayerMuted(button.dataset.onlineUserUnmute, false); return; }
    if (button.matches(`${FRIEND_MUTATION_SELECTOR},${GUILD_MUTATION_SELECTOR}`) && !this._canMutateOnline()) { this._announceConnectionPause(); return; }
    if (button.matches("[data-online-friend-accept]")) { this._send("friendRespond", { targetId: button.dataset.onlineFriendAccept, accepted: true }); return; }
    if (button.matches("[data-online-friend-decline]")) { this._send("friendRespond", { targetId: button.dataset.onlineFriendDecline, accepted: false }); return; }
    if (button.matches("[data-online-friend-block],[data-online-user-block]")) {
      if (!this.capabilities.has("onlineSafetyV1")) { this.toast("このサーバーは安全設定に未対応です"); return; }
      const targetId = button.dataset.onlineFriendBlock || button.dataset.onlineUserBlock;
      const profile = this._safetyProfile(targetId), name = profile?.displayName || "この相手";
      if (globalThis.confirm?.(`${name}をブロックしますか？\n\nフレンドを解除し、招待・交換・同室をお互いに止めます。同じ部屋にいる場合は自分が退出します。ギルド所属や進行は変更されません。`) === false) return;
      if (this._send("friendBlock", { targetId })) { this._purgePlayerSocial(targetId); this._refreshSafetyViews(); }
      return;
    }
    if (button.matches("[data-online-friend-unblock]")) {
      if (!this.capabilities.has("onlineSafetyV1")) { this.toast("このサーバーは安全設定に未対応です"); return; }
      const targetId = button.dataset.onlineFriendUnblock, profile = this._safetyProfile(targetId), name = profile?.displayName || "この相手";
      if (globalThis.confirm?.(`${name}のブロックを解除しますか？\n\n以前のフレンド関係や招待は自動では戻りません。`) === false) return;
      this._send("friendUnblock", { targetId }); return;
    }
    if (button.matches("[data-online-friend-invite]")) { this._send("friendRoomInvite", { targetId: button.dataset.onlineFriendInvite }); return; }
    if (button.matches("[data-online-friend-invite-accept]")) { this._send("friendInviteRespond", { inviteId: button.dataset.onlineFriendInviteAccept, accepted: true }); return; }
    if (button.matches("[data-online-friend-invite-decline]")) { this._send("friendInviteRespond", { inviteId: button.dataset.onlineFriendInviteDecline, accepted: false }); return; }
    if (button.matches("[data-online-friend-remove]")) { const targetId = button.dataset.onlineFriendRemove; if (globalThis.confirm?.("このフレンドを解除しますか？") === false) return; this._send("friendRemove", { targetId }); return; }
    if (button.matches("[data-online-guild-apply]")) { this._sendGuild("apply", "guildApply", { guildId: button.dataset.onlineGuildApply }); return; }
    if (button.matches("[data-online-guild-invite]")) { this._sendGuild("invite", "guildInvite", { targetId: button.dataset.onlineGuildInvite }); return; }
    if (button.matches("[data-online-guild-invite-accept]")) { this._sendGuild("inviteRespond", "guildInviteRespond", { inviteId: button.dataset.onlineGuildInviteAccept, accepted: true }); return; }
    if (button.matches("[data-online-guild-invite-decline]")) { this._sendGuild("inviteRespond", "guildInviteRespond", { inviteId: button.dataset.onlineGuildInviteDecline, accepted: false }); return; }
    if (button.matches("[data-online-guild-application-accept]")) { this._sendGuild("application", "guildApplicationRespond", { targetId: button.dataset.onlineGuildApplicationAccept, accepted: true }); return; }
    if (button.matches("[data-online-guild-application-decline]")) { this._sendGuild("application", "guildApplicationRespond", { targetId: button.dataset.onlineGuildApplicationDecline, accepted: false }); return; }
    if (button.matches("[data-online-guild-set-role]")) { this._sendGuild("setRole", "guildSetRole", { targetId: button.dataset.onlineGuildSetRole, role: button.dataset.onlineGuildRole }); return; }
    if (button.matches("[data-online-guild-transfer]")) {
      const targetId = button.dataset.onlineGuildTransfer, member = this.guildState.guild?.members?.find(entry => entry.playerId === targetId), name = member?.displayName || "このメンバー";
      if (globalThis.confirm?.(`${name}へギルドマスターを譲渡しますか？`) === false) return;
      this._sendGuild("transfer", "guildTransfer", { targetId }); return;
    }
    if (button.matches("[data-online-guild-kick]")) {
      const targetId = button.dataset.onlineGuildKick, member = this.guildState.guild?.members?.find(entry => entry.playerId === targetId), name = member?.displayName || "このメンバー";
      if (globalThis.confirm?.(`${name}をギルドから除名しますか？`) === false) return;
      this._sendGuild("kick", "guildKick", { targetId }); return;
    }
    if (button.matches("[data-online-guild-check-in]")) { this._sendGuild("checkIn", "guildCheckIn"); return; }
    if (button.matches("[data-online-guild-plan-respond]")) {
      const planId = String(button.dataset.onlineGuildPlanId ?? ""), status = String(button.dataset.onlineGuildPlanRespond ?? "");
      const plan = this.guildState.guild?.plans?.find(entry => entry.planId === planId);
      if (!plan || !GUILD_PLAN_RESPONSES.has(status)) return this.toast("この予定は終了しました");
      if (plan.myStatus === status) return;
      this._sendGuild("planRespond", "guildPlanRespond", { planId, status });
      return;
    }
    if (button.matches("[data-online-guild-plan-cancel]")) {
      const planId = String(button.dataset.onlineGuildPlanCancel ?? ""), plan = this.guildState.guild?.plans?.find(entry => entry.planId === planId);
      if (!plan?.canCancel) return this.toast("この予定は取り消せません");
      if (globalThis.confirm?.("このギルド遠征予定を取り消しますか？") === false) return;
      this._sendGuild("planCancel", "guildPlanCancel", { planId });
      return;
    }
    if (button.matches("[data-online-guild-plan-gather]")) {
      const planId = String(button.dataset.onlineGuildPlanGather ?? ""), plan = this.guildState.guild?.plans?.find(entry => entry.planId === planId);
      if (!plan?.canGather || plan.gathering) return this.toast("この予定では集合を開始できません");
      const now = this._guildNow();
      if (!plan.gatherOpensAt || now < plan.gatherOpensAt || now >= plan.gatherClosesAt) return this.toast("現在は集合受付時間外です");
      const room = this.roomState, roomCount = Array.isArray(room?.members) ? room.members.length : 0;
      if (!room) return this.toast("先に自分のオンライン部屋を作ってください");
      if (room.ownerId !== this.selfId || room.leaderId !== this.selfId) return this.toast("現在のプレイを終了し、自分の部屋を作ってください");
      if (room.phase !== "lobby") return this.toast("現在のプレイを終了してロビーへ戻ってください");
      if (roomCount >= 4) return this.toast("現在の部屋は満員です");
      if (room.listing?.published) return this.toast("公開募集を終了してから集合を開始してください");
      this._sendGuild("planGather", "guildPlanGather", { planId });
      return;
    }
    if (button.matches("[data-online-guild-plan-gathering-close]")) {
      const recruitmentId = String(button.dataset.onlineGuildRecruitmentClose ?? "");
      const plan = this.guildState.guild?.plans?.find(entry => entry.gathering?.recruitmentId === recruitmentId);
      if (!plan?.gathering || plan.gathering.hostPlayerId !== this.selfId || plan.gathering.joined !== true) return this.toast("この集合を終了できません");
      if (globalThis.confirm?.("集合だけを終了しますか？ 遠征予定と参加表明は残ります。") === false) return;
      this._sendGuild("recruitmentClose", "guildRecruitmentClose", { recruitmentId });
      return;
    }
    if (button.matches("[data-online-guild-recruitment-close]")) {
      const recruitmentId = String(button.dataset.onlineGuildRecruitmentClose ?? "");
      if (recruitmentId) this._sendGuild("recruitmentClose", "guildRecruitmentClose", { recruitmentId });
      return;
    }
    if (button.matches("[data-online-guild-recruitment-join]")) {
      const recruitmentId = String(button.dataset.onlineGuildRecruitmentJoin ?? "");
      const recruitment = this.guildState.guild?.recruitments?.find(entry => entry.recruitmentId === recruitmentId);
      const planGathering = this.guildState.guild?.plans?.find(entry => entry.gathering?.recruitmentId === recruitmentId)?.gathering ?? null;
      const targetId = planGathering?.hostPlayerId ?? recruitment?.host?.playerId ?? "";
      if (!recruitment && !planGathering) return this.toast("この募集は終了しました");
      if (!targetId) return this.toast("この募集の部屋主を確認できません");
      if (planGathering?.joined) { this.friendPanelOpen = false; this._renderFriendPanel(); return; }
      if (this.roomState?.leaderId === targetId) { this.friendPanelOpen = false; this._renderFriendPanel(); return; }
      if (this.roomState?.phase && this.roomState.phase !== "lobby") return this.toast("現在のオンラインプレイを終了してから参加してください");
      if (this.roomState && !this._confirmRoomExit()) return;
      this._sendGuild("recruitmentJoin", "guildRecruitmentJoin", { recruitmentId }, { targetId });
      return;
    }
    if (button.matches("[data-online-guild-leave]")) { if (globalThis.confirm?.("このギルドから脱退しますか？") === false) return; this._sendGuild("leave", "guildLeave"); return; }
    if (button.matches("[data-online-guild-disband]")) {
      const name = this.guildState.guild?.name || "";
      let confirmedName = name;
      if (typeof globalThis.prompt === "function") {
        confirmedName = globalThis.prompt(`ギルドを完全に解散します。確認のため「${name}」と入力してください。`);
        if (confirmedName == null) return;
        if (String(confirmedName).trim() !== name) { this.toast("ギルド名が一致しません"); return; }
      } else if (globalThis.confirm?.("このギルドを完全に解散しますか？") === false) return;
      this._sendGuild("disband", "guildDisband", { name }); return;
    }
    if (button.matches("[data-online-force-close-leave]")) { this._forceClosePendingRoomLeave(); return; }
    if (button.matches(ONLINE_STATE_CONTROL_SELECTOR) && !this._canMutateOnline()) { this._announceConnectionPause(); return; }
    if (button.matches("[data-online-refresh-listings]")) { this._requestRoomListings({ force: true }); return; }
    if (button.matches("[data-online-quick-join]")) { this._quickJoinRoom(); return; }
    if (button.matches("[data-online-join-listed-room]")) { this._joinListedRoom(button.dataset.onlineJoinListedRoom, button.dataset.onlineListingId); return; }
    if (button.matches("[data-online-remove-room-member]")) {
      const targetId = String(button.dataset.onlineRemoveRoomMember ?? ""), member = this.roomState?.members?.find(entry => entry.playerId === targetId);
      if (!targetId || this.roomMemberRemovalPendingId) return;
      const name = member?.profile?.displayName || "この参加者";
      if (typeof globalThis.confirm === "function" && !globalThis.confirm(`${name}を部屋から退出させますか？`)) return;
      this.roomMemberRemovalPendingId = targetId;
      if (!this._send("removeRoomMember", { targetId })) { this.roomMemberRemovalPendingId = null; this.toast("サーバーへ接続されていません"); }
      this._render(); return;
    }
    if (button.matches("[data-online-reward-close]")) { this._clearRewardReceipt(); return; }
    if (button.matches("[data-online-trade-player]")) { const targetId = button.dataset.onlineTradePlayer; if (targetId && targetId !== this.selfId) this._send("tradeInvite", { targetId }); return; }
    if (button.matches("[data-online-trade-accept]")) { this._send("tradeAccept", { tradeId: this.trade?.tradeId, accepted: true }); return; }
    if (button.matches("[data-online-trade-decline]")) { this._send("tradeAccept", { tradeId: this.trade?.tradeId, accepted: false }); return; }
    if (button.matches("[data-online-trade-cancel]")) {
      if (this.tradePendingOffer || this.tradeReconcilePending || this.tradeOfferInflight.has(String(this.trade?.tradeId ?? "")) || this.tradeReconcileInflight.has(String(this.trade?.tradeId ?? ""))) {
        this.toast("交換品を保存・照合しています。完了後に中止してください"); return;
      }
      this._send("tradeCancel", { tradeId: this.trade?.tradeId }); return;
    }
    if (button.matches("[data-online-trade-filter]")) { this.tradeFilter = button.dataset.onlineTradeFilter || "all"; this._render(); return; }
    if (button.matches("[data-online-trade-offer]")) { this._selectTradeAsset(button.dataset.onlineTradeOffer); return; }
    if (button.matches("[data-online-trade-amount-step]")) { this._stepTradeAmount(Number(button.dataset.onlineTradeAmountStep) || 0); return; }
    if (button.matches("[data-online-trade-amount-max]")) { this._setTradeAmountToMaximum(); return; }
    if (button.matches("[data-online-trade-quantity-set]")) { this._offerTradeAsset(this.tradeDraftRef, { readInput: true }); return; }
    if (button.matches("[data-online-trade-ready]")) { if (!this._tradeAdvanceAllowed()) { this.toast("交換品を保存・照合しています。完了後にもう一度お試しください"); return; } this._send("tradeReady", { tradeId: this.trade?.tradeId, ready: !Boolean(this.trade?.ready?.[this.selfId]) }); return; }
    if (button.matches("[data-online-trade-confirm]")) { if (Date.now() < this.tradeConfirmAvailableAt) return; if (!this._tradeAdvanceAllowed()) { this.toast("交換品の照合が完了していないため確定できません"); return; } this._send("tradeConfirm", { tradeId: this.trade?.tradeId }); return; }
    if (button.matches("[data-online-raid-exchange]")) { this._exchangeRaidReward(button.dataset.onlineRaidExchange, Number(button.dataset.onlineRaidCost)); return; }
    if (button.matches("[data-online-ping-toggle]")) { this.pingMenuOpen = !this.pingMenuOpen; this._render(); return; }
    if (button.matches("[data-online-ping-kind]")) { const kind = button.dataset.onlinePingKind; this.pingMenuOpen = false; this._send("expeditionPing", { kind }); this._render(); return; }
    if (button.matches("[data-online-hall-full-chat]")) { this.exploreChatOpen = false; this._setRoute("chat"); return; }
    if (button.matches("[data-online-chat-toggle]")) {
      this.exploreChatOpen = !this.exploreChatOpen;
      if (this.route === "home") { this.hallDestination = null; this._clearMoveInputs(); }
      this._render();
      if (this.exploreChatOpen) requestAnimationFrame(() => this._query("[data-online-explore-chat-input]")?.focus());
      return;
    }
    if (button.matches("[data-online-chat-close]")) { this.exploreChatOpen = false; this._render(); requestAnimationFrame(() => this._query("[data-online-chat-toggle]")?.focus()); return; }
    if (button.matches("[data-online-hall-games-toggle],[data-online-hall-game-close]")) {
      const closing = button.matches("[data-online-hall-game-close]");
      if (!closing && !this.capabilities.has("hallMinigamesV1")) { this.toast("遊戯広場を使うにはオンラインサーバーの193更新が必要です"); return; }
      this.hallGamesOpen = closing ? false : !this.hallGamesOpen;
      if (this.hallGamesOpen && !this.roomState?.hallGame) this.hallGameTab = "";
      this.exploreChatOpen = false; this.hallDestination = null; this._clearMoveInputs(); this._render(); return;
    }
    if (button.matches("[data-online-hall-game-tab]")) { this.hallGameTab = button.dataset.onlineHallGameTab === "race" ? "race" : "mimic"; this._render(); return; }
    if (button.matches("[data-online-hall-game-join],[data-online-hall-game-monster]")) {
      const game = (button.dataset.onlineHallGameJoin || (button.hasAttribute("data-online-hall-game-monster") ? "race" : this.hallGameTab)) === "race" ? "race" : "mimic";
      const monsterId = button.dataset.onlineHallGameMonster || undefined;
      this.hallGameTab = game;
      this._send("hallGameJoin", { game, monsterId, requestId: this._hallGameRequestId("join") }); return;
    }
    if (button.matches("[data-online-hall-game-leave]")) { this._send("hallGameLeave", { requestId: this._hallGameRequestId("leave") }); return; }
    if (button.matches("[data-online-hall-game-ready]")) {
      const participant = this.roomState?.hallGame?.participants?.find?.(entry => entry.playerId === this.selfId);
      this._send("hallGameReady", { ready: !Boolean(participant?.ready), requestId: this._hallGameRequestId("ready") }); return;
    }
    if (button.matches("[data-online-hall-game-start]")) { this._send("hallGameStart", { requestId: this._hallGameRequestId("start") }); return; }
    if (button.matches("[data-online-hall-game-reset]")) { this._send("hallGameReset", { requestId: this._hallGameRequestId("reset") }); return; }
    if (button.matches("[data-online-hall-game-action]")) {
      this._send("hallGameAction", { action: button.dataset.onlineHallGameAction, targetId: button.dataset.onlineHallGameTarget || undefined, requestId: this._hallGameRequestId("action") }); return;
    }
    if (button.matches("[data-online-open-merchant]")) { this.rareMerchantOpen = true; this.merchantResult = null; this._render(); return; }
    if (button.matches("[data-online-close-merchant]")) { this.rareMerchantOpen = false; this.merchantPending = false; this.merchantResult = null; clearTimeout(this.merchantPendingTimer); this._render(); return; }
    if (button.matches("[data-online-cancel-floor-boss]")) { this.floorBossConfirm = null; this._render(); return; }
    if (button.matches("[data-online-confirm-floor-boss]")) { const pending = this.floorBossConfirm; if (!pending || !this._beginInteractionPending("challengeFloorBoss", pending.targetId)) return; this.floorBossConfirm = null; if (!this._send("expeditionInteract", { action: "challengeFloorBoss", targetId: pending.targetId })) this._clearInteractionPending(false); this._render(); return; }
    if (button.matches("[data-online-cancel-coop-boss]")) { this.coopBossConfirm = null; this._render(); return; }
    if (button.matches("[data-online-confirm-coop-boss]")) { const pending = this.coopBossConfirm, action = pending?.action || "challengeCoopElite"; if (!pending || !this._beginInteractionPending(action, pending.targetId)) return; this.coopBossConfirm = null; if (!this._send("expeditionInteract", { action, targetId: pending.targetId })) this._clearInteractionPending(false); this._render(); return; }
    if (button.matches("[data-online-expedition-interact]")) { const action = button.dataset.onlineExpeditionInteract, targetId = button.dataset.onlineInteractionTarget; if (action === "challengeFloorBoss") { if (!this._beginInteractionPending(action,targetId)) return;if (!this._send("expeditionInteract",{action,targetId}))this._clearInteractionPending(false);this._render();return; } if (["challengeCoopElite", "challengeCoopBoss"].includes(action)) { const expedition = this.roomState?.expedition, interaction = expedition?.interactions?.[this.selfId] ?? {}, object = expedition?.objects?.find(entry => entry.id === targetId || entry.type === "coopElite") ?? {}, source = interaction.coopBoss ?? interaction.bossProfile ?? object, boss = { ...source, id: source.id ?? source.coopBossId, name: source.name ?? source.bossName, title: source.title ?? source.bossTitle, intro: source.intro ?? source.bossIntro, speciesId: source.speciesId ?? object.speciesId, visualSpeciesId: source.visualSpeciesId ?? object.visualSpeciesId, accent: source.accent ?? object.accent, mechanic: source.mechanic ?? object.mechanic }; this.coopBossConfirm = { action, targetId, boss, floor: Number(expedition?.floor) || 0 }; this._render(); return; } if (!this._beginInteractionPending(action, targetId)) return; if (!this._send("expeditionInteract", { action, targetId })) this._clearInteractionPending(false); this._render(); return; }
    if (button.matches("[data-online-merchant-offer]")) { if (this.merchantPending) return; const offer = button.dataset.onlineMerchantOffer; this.merchantPending = true; this.merchantResult = { offer, status: "pending" }; clearTimeout(this.merchantPendingTimer); this.merchantPendingTimer = setTimeout(() => { if (!this.merchantPending) return; this.merchantPending = false; this.merchantResult = { offer, status: "error", message: "通信結果を確認できませんでした。もう一度お試しください。" }; this._render(); }, 3500); if (!this._send("rareMerchantClaim", { offer })) { clearTimeout(this.merchantPendingTimer); this.merchantPending = false; this.merchantResult = { offer, status: "error", message: "サーバーへ接続されていません。" }; } this._render(); return; }
    if (button.matches("[data-online-battle-cheer]")) { this._send("battleCheer", { mode: button.dataset.onlineBattleCheer || this.route }); return; }
    if (button.matches("[data-online-hall-destination]")) { if (!this.exploreChatOpen && !this.hallGamesOpen && !this.emoteGestureActive) this.hallDestination = { x: Number(button.dataset.hallX), y: Number(button.dataset.hallY) }; return; }
    if (button.id === "backOnlineParty") {
      this.requestExit();
      return;
    }
    if (button.matches("[data-copy-friend-id]")) { copyText(this.selfId).then(ok => this.toast(ok ? "フレンドIDをコピーしました" : "コピーできませんでした")); return; }
    if (button.matches("[data-online-connect]")) { this.connect(); return; }
    if (button.matches("[data-online-disconnect]")) { this.disconnect(); return; }
    if (button.matches("[data-online-gate-back]")) { this.disconnect({ leave: false }); return; }
    if (button.matches("[data-online-create-room]")) {
      const published = Boolean(this._query("[data-online-create-listed]")?.checked);
      const purposeValue = this._query("[data-online-create-purpose]")?.value;
      const styleValue = this._query("[data-online-create-style]")?.value;
      const purpose = normalizedRoomPurpose(purposeValue);
      const style = ROOM_STYLES.has(styleValue) ? styleValue : "anyone";
      this._send("createRoom", { published, purpose, style }); return;
    }
    if (button.matches("[data-online-leave-room]")) { this.leaveRoom(); return; }
    if (button.matches("[data-copy-room-id]")) { copyText(this.roomId).then(ok => this.toast(ok ? "ルームIDをコピーしました" : "コピーできませんでした")); return; }
    if (button.matches("[data-copy-invite]")) { this.copyInvite(); return; }
    if (button.matches("[data-online-roster-move]")) {
      const result = moveOnlineBattleRosterPriority(this.getState?.(), button.dataset.onlineRosterMonster, button.dataset.onlineRosterMove);
      if (!result.changed) return;
      this.selectedMonsterId = result.primaryMonsterId || this.selectedMonsterId;
      this._refreshProfile();
      this._send("profile", { profile: this.profile });
      const picker = this._query("[data-online-roster-picker]");
      if (picker) picker.outerHTML = renderOnlineBattleRosterPicker(this.getState?.(), { monsterId: this.selectedMonsterId });
      return;
    }
    if (button.matches("[data-online-character]")) { this._selectCharacter(button.dataset.onlineCharacter); return; }
    const nextRoute = button.dataset.onlineRoute ?? button.dataset.onlineGo;
    if (nextRoute && ROUTES.has(nextRoute)) { this._setRoute(nextRoute); return; }
    if (button.matches("[data-online-ready]")) { const self = this._self(); this._send("setReady", { ready: !self?.ready }); return; }
    if (button.matches("[data-online-start-explore]")) {
      if (this._contentStartBlockedByTrade()) return;
      const leader = (this.roomState?.leaderId ?? this.roomState?.ownerId) === this.selfId || Boolean(this._self()?.isLeader);
      const membersReady = this.roomState?.phase === "lobby" && (this.roomState?.members?.length ?? 0) > 0 && this.roomState.members.every(member => member.connected && member.ready);
      if (!leader || !membersReady || this.pendingExpeditionStart) { this.toast(!leader ? "出発できるのは部屋主だけです" : !membersReady ? "全員の準備完了を待っています" : "出発を確認中です"); return; }
      this.expeditionReport = null; this._refreshProfile();
      const hostWorld = this._hostWorldNetworkSnapshot();
      this.pendingSecretRoomRun = leader ? this._createPendingSecretRoomRun() : null;
      if (this.pendingSecretRoomRun) hostWorld.secretRooms = { run: this.pendingSecretRoomRun };
      this.pendingExpeditionStart = this._send("startExpedition", { profile: this.profile, hostWorld });
      if (!this.pendingExpeditionStart) this.pendingSecretRoomRun = null; else this._render();
      return;
    }
    if (button.matches("[data-online-return]")) { this._send("requestReturn"); return; }
    if (button.matches("[data-online-complete]")) { this._send("completeExpedition"); return; }
    if (button.matches("[data-online-start-raid]")) { if (!this._contentStartBlockedByTrade()) this._send("startRaid", { raidWorld: this._raidWorldSnapshot() }); return; }
    if (button.matches("[data-online-team-side]")) { this._send("teamSide", { side: button.dataset.onlineTeamSide }); return; }
    if (button.matches("[data-online-team-ruleset]")) { this._send("teamSettings", { ruleset: button.dataset.onlineTeamRuleset, series: this.roomState?.teamSettings?.series ?? "bo1" }); return; }
    if (button.matches("[data-online-team-series]")) { this._send("teamSettings", { ruleset: this.roomState?.teamSettings?.ruleset ?? "standard", series: button.dataset.onlineTeamSeries }); return; }
    if (button.matches("[data-online-team-swap]")) { this._send("teamSwapSides"); return; }
    if (button.matches("[data-online-team-ready]")) { const self = this._self(); this._send("teamReady", { ready: !self?.teamReady }); return; }
    if (button.matches("[data-online-start-team]")) { if (!this._contentStartBlockedByTrade()) { this.teamBattleReport = null; this._send("startTeamBattle"); } return; }
    if (button.matches("[data-enemy-target]")) { this._selectBattleTarget(button.dataset.enemyTarget, "enemy"); return; }
    if (button.matches("[data-online-ally-target]")) { this._selectBattleTarget(button.dataset.onlineAllyTarget, "ally"); return; }
    if (button.matches("[data-command]")) { this._battleAction(this.route, button.dataset.command); return; }
    if (button.matches("[data-skill-id]")) { this._battleAction(this.route, "skill", button.dataset.skillId); return; }
    if (button.id === "closeSkillMenu") { this.skillMenu[this.route] = false; this._render(); return; }
    if (button.matches("[data-online-battle-item]")) { this.itemMenu[this.route] = false; this.itemTargetMenu[this.route] = true; this._render(); return; }
    if (button.matches("[data-online-item-target]")) { this.selectedAlly[this.route] = button.dataset.onlineItemTarget; this.itemTargetMenu[this.route] = false; this._submitBattleAction(this.route, "item"); return; }
    if (button.id === "closeItemMenu") { this.itemMenu[this.route] = false; this._render(); return; }
    if (button.id === "closeOnlineItemTarget") { this.itemTargetMenu[this.route] = false; this.itemMenu[this.route] = true; this._render(); return; }
    if (button.matches("[data-online-close-raid-report]")) { this.raidReport = null; this._render(); return; }
    if (button.matches("[data-online-close-team-report]")) { this.teamBattleReport = null; this._render(); return; }
    if (button.matches("[data-online-close-expedition-report]")) { const reward = this.pendingFloorBossReward; this.expeditionReport = null; this.pendingFloorBossReward = null; if (reward) this.onFloorBossDefeated({ ...reward, resume: true }); this._render(); this._showPendingExpeditionReturnResult(); return; }
    if (button.matches("[data-online-speed-cycle]")) { const mode = button.dataset.onlineSpeedCycle, current = Number(this._battle(mode)?.speed) || 1, speeds = [.5, 1, 2], speed = speeds[(speeds.indexOf(current) + 1) % speeds.length]; this._send(mode === "raid" ? "raidSpeed" : mode === "team" ? "teamSpeed" : "battleSpeed", { speed }); return; }
    if (button.matches("[data-online-center]")) { this.path = []; if (this.exploreCanvasMounted) this.onExploreCanvasUpdate(this.roomState, this.selfId, { center: true }); return; }
    if (button.matches("[data-online-party-hud-toggle]")) { this.onlineHudCollapsed = !this.onlineHudCollapsed; this._render(); return; }
    if (button.matches("[data-online-target]")) { this._selectBattleTarget(button.dataset.onlineTarget, button.dataset.onlineTargetSide); return; }
    if (button.matches("[data-online-speed]")) { const mode = button.dataset.onlineMode, speed = Number(button.dataset.onlineSpeed) || 1; this._send(mode === "raid" ? "raidSpeed" : mode === "team" ? "teamSpeed" : "battleSpeed", { speed }); return; }
    if (button.matches("[data-online-battle-auto]")) { this._toggleOnlineBattleAuto(button.dataset.onlineBattleAuto); return; }
    if (button.matches("[data-online-battle-action]")) { this._battleAction(button.dataset.onlineMode, button.dataset.onlineBattleAction); return; }
    if (button.matches("[data-online-battle-skill]")) { this._battleAction(button.dataset.onlineMode, "skill", button.dataset.onlineBattleSkill); return; }
    if (button.matches("[data-online-preset]")) { this._sendPreset(button.dataset.onlinePreset); return; }
  }

  _setDestination(target) {
    const expedition = this.roomState?.expedition;
    const start = this._self()?.dungeonPosition;
    const tiles = expedition?.tiles;
    if (!start || !Array.isArray(tiles) || !Number.isInteger(target?.x) || !Number.isInteger(target?.y)) return;
    const rows = tiles.length, cols = tiles[0]?.length ?? 0;
    if (target.x < 0 || target.y < 0 || target.x >= cols || target.y >= rows || tiles[target.y]?.[target.x] !== ".") return;
    const key = point => `${point.x},${point.y}`;
    const destinationKey = key(target), queue = [{ x: start.x, y: start.y }], previous = new Map([[key(start), null]]);
    for (let index = 0; index < queue.length && !previous.has(destinationKey); index++) {
      const point = queue[index];
      for (const next of [{ x: point.x + 1, y: point.y }, { x: point.x - 1, y: point.y }, { x: point.x, y: point.y + 1 }, { x: point.x, y: point.y - 1 }]) {
        const nextKey = key(next);
        if (next.x < 0 || next.y < 0 || next.x >= cols || next.y >= rows || tiles[next.y]?.[next.x] !== "." || previous.has(nextKey)) continue;
        previous.set(nextKey, point); queue.push(next);
      }
    }
    if (!previous.has(destinationKey)) { this.toast("そこへは移動できません"); return; }
    const path = [];
    for (let point = target; point && key(point) !== key(start); point = previous.get(key(point))) path.unshift(point);
    this.path = path.slice(0, 48);
  }

  _handleSubmit(event) {
    if (event.target.matches("[data-online-friend-request-form],[data-online-guild-lookup-form],[data-online-guild-create-form],[data-online-guild-chat-form],[data-online-guild-plan-form],[data-online-guild-recruitment-form]") && !this._canMutateOnline()) {
      event.preventDefault(); this._announceConnectionPause(); return;
    }
    if (event.target.matches("[data-online-friend-request-form]")) {
      event.preventDefault(); const targetId = String(this.friendIdDraft || this._query("[data-online-friend-id]")?.value || "").trim().toUpperCase();
      if (!/^AD-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(targetId)) return this.toast("AD-ABCD-EFGH形式で入力してください");
      if (this._send("friendRequest", { targetId })) { this.friendIdDraft = ""; this.toast("フレンド申請を送りました"); this._renderFriendPanel(); }
      return;
    }
    if (event.target.matches("[data-online-guild-lookup-form]")) {
      event.preventDefault(); const guildId = normalizedGuildId(this.guildLookupDraft || this._query("[data-online-guild-id]")?.value);
      if (!guildId) return this.toast("GD-ABC234形式で入力してください");
      this._sendGuild("lookup", "guildLookup", { guildId }); return;
    }
    if (event.target.matches("[data-online-guild-create-form]")) {
      event.preventDefault();
      const name = cleanSocialText(this.guildCreateDraft.name, 16).trim(), tag = cleanSocialText(this.guildCreateDraft.tag, 4).trim().toUpperCase(), description = cleanSocialText(this.guildCreateDraft.description, 80).trim();
      if (name.length < 2 || !/^[\p{L}\p{N}]{2,4}$/u.test(tag)) return this.toast("名前は2〜16文字、略称は文字・数字2〜4文字で入力してください");
      this._sendGuild("create", "guildCreate", { name, tag, description }); return;
    }
    if (event.target.matches("[data-online-guild-chat-form]")) {
      event.preventDefault(); const input = this._query("[data-online-guild-chat-input]");
      const text = cleanSocialText(this.guildChatDraft || input?.value, 80).replace(/\s+/g, " ").trim();
      if (!text) return;
      if (Date.now() - this.lastGuildChatAt < 850) return this.toast("少し待ってから送信してください");
      if (this._sendGuild("chat", "guildChat", { text })) { this.lastGuildChatAt = Date.now(); this.guildChatDraft = ""; if (input) input.value = ""; }
      return;
    }
    if (event.target.matches("[data-online-guild-plan-form]")) {
      event.preventDefault();
      const purpose = normalizedRoomPurpose(this.guildPlanDraft.purpose);
      const style = ROOM_STYLES.has(this.guildPlanDraft.style) ? this.guildPlanDraft.style : "anyone";
      const scheduledInput = String(this.guildPlanDraft.scheduledAt || this._query("[data-online-guild-plan-scheduled-at]")?.value || "");
      const scheduledAt = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(scheduledInput) ? new Date(scheduledInput).getTime() : NaN;
      const now = this._guildNow();
      if (!Number.isFinite(scheduledAt) || scheduledAt < now + 10 * 60_000 || scheduledAt > now + GUILD_PLAN_MAX_LEAD_MS) return this.toast("日時は10分後から14日後までで選んでください");
      const floor = boundedInteger(this.guildPlanDraft.floor || this._query("[data-online-guild-plan-floor]")?.value, 1, 100, 1);
      const note = cleanSocialText(this.guildPlanDraft.note, 48).replace(/\s+/g, " ").trim();
      this._sendGuild("planCreate", "guildPlanCreate", { purpose, style, scheduledAt, floor, note });
      return;
    }
    if (event.target.matches("[data-online-guild-recruitment-form]")) {
      event.preventDefault();
      const purpose = normalizedRoomPurpose(this.guildRecruitmentDraft.purpose);
      const style = ROOM_STYLES.has(this.guildRecruitmentDraft.style) ? this.guildRecruitmentDraft.style : "anyone";
      const note = cleanSocialText(this.guildRecruitmentDraft.note, 48).replace(/\s+/g, " ").trim();
      this._sendGuild("recruitmentCreate", "guildRecruitmentCreate", { purpose, style, note });
      return;
    }
    if (event.target.matches("[data-online-join-form],[data-online-chat-form],[data-online-explore-chat-form]") && !this._canMutateOnline()) {
      event.preventDefault(); this._announceConnectionPause(); return;
    }
    if (event.target.matches("[data-online-join-form]")) {
      event.preventDefault(); const roomId = safeRoomId(this._query("[data-online-room-code]")?.value);
      if (roomId.length !== 6) return this.toast("6文字のルームIDを入力してください");
      this._send("joinRoom", { roomId }); return;
    }
    if (event.target.matches("[data-online-chat-form]")) {
      event.preventDefault(); const input = this._query("[data-online-chat-input]");
      const text = String(input?.value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
      if (!text) return;
      if (Date.now() - this.lastChatAt < 850) return this.toast("少し待ってから送信してください");
      if (this._send("chat", { text })) { this.lastChatAt = Date.now(); this.chatDraft = ""; input.value = ""; const count = this._query("[data-online-chat-count]"); if (count) count.textContent = "0"; }
    }
    if (event.target.matches("[data-online-explore-chat-form]")) {
      event.preventDefault(); const input = this._query("[data-online-explore-chat-input]");
      const text = String(input?.value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
      if (!text || Date.now() - this.lastChatAt < 850) return;
      if (this._send("chat", { text })) { this.lastChatAt = Date.now(); this.chatDraft = ""; input.value = ""; input.blur(); }
    }
  }

  _handleInput(event) {
    if (event.target.matches("[data-online-friend-id]")) { this.friendIdDraft = String(event.target.value ?? "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 15); event.target.value = this.friendIdDraft; }
    if (event.target.matches("[data-online-guild-id]")) { this.guildLookupDraft = String(event.target.value ?? "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 10); event.target.value = this.guildLookupDraft; }
    if (event.target.matches("[data-online-guild-create-name]")) this.guildCreateDraft.name = cleanSocialText(event.target.value, 16);
    if (event.target.matches("[data-online-guild-create-tag]")) { this.guildCreateDraft.tag = cleanSocialText(event.target.value, 4).toUpperCase().replace(/\s/g, ""); event.target.value = this.guildCreateDraft.tag; }
    if (event.target.matches("[data-online-guild-create-description]")) this.guildCreateDraft.description = cleanSocialText(event.target.value, 80);
    if (event.target.matches("[data-online-guild-chat-input]")) { this.guildChatDraft = cleanSocialText(event.target.value, 80); const count = event.target.parentElement?.querySelector("small"); if (count) count.textContent = `${this.guildChatDraft.length}/80`; }
    if (event.target.matches("[data-online-guild-plan-scheduled-at]")) this.guildPlanDraft.scheduledAt = String(event.target.value ?? "").slice(0, 16);
    if (event.target.matches("[data-online-guild-plan-floor]")) { const value = String(event.target.value ?? "").replace(/\D/g, "").slice(0, 5); this.guildPlanDraft.floor = value; if (event.target.value !== value) event.target.value = value; }
    if (event.target.matches("[data-online-guild-plan-note]")) { this.guildPlanDraft.note = cleanSocialText(event.target.value, 48); if (event.target.value !== this.guildPlanDraft.note) event.target.value = this.guildPlanDraft.note; const count = event.target.parentElement?.querySelector(":scope>small"); if (count) count.textContent = `${this.guildPlanDraft.note.length}/48`; }
    if (event.target.matches("[data-online-guild-recruitment-note]")) { this.guildRecruitmentDraft.note = cleanSocialText(event.target.value, 48); if (event.target.value !== this.guildRecruitmentDraft.note) event.target.value = this.guildRecruitmentDraft.note; const count = event.target.parentElement?.querySelector(":scope>small"); if (count) count.textContent = `${this.guildRecruitmentDraft.note.length}/48`; }
    if (event.target.matches("[data-online-room-code]")) event.target.value = safeRoomId(event.target.value);
    if (event.target.matches("[data-online-chat-input],[data-online-explore-chat-input]")) { this.chatDraft = event.target.value.slice(0, 80); const count = this._query("[data-online-chat-count]"); if (count) count.textContent = String(this.chatDraft.length); }
    if (event.target.matches("[data-online-floor]")) {
      const self = this._self(), leader = (this.roomState?.leaderId ?? this.roomState?.ownerId) === this.selfId || Boolean(self?.leader || self?.isLeader);
      if (!leader || !this._canMutateOnline()) { event.target.value = String(Math.max(1, Number(this.roomState?.selectedFloor) || 1)); return; }
      const max = Math.max(1, Number(self?.profile?.maxFloor) || 1);
      const floor = Math.round(clamp(event.target.value, 1, max)); event.target.value = String(floor); this._send("setFloor", { floor });
    }
    if (event.target.matches("[data-online-display-name]")) {
      storageSet(ONLINE_STORAGE_KEYS.displayName, event.target.value.trim().slice(0, 16)); this._refreshProfile(); this._send("profile", { profile: this.profile });
    }
    if (event.target.matches("[data-online-server-url]")) storageSet(ONLINE_STORAGE_KEYS.serverUrl, event.target.value.trim());
    if (event.target.matches("[data-online-trade-query]")) { this.tradeQuery = String(event.target.value ?? "").slice(0, 40); this._render(); requestAnimationFrame(() => { const input = this._query("[data-online-trade-query]"); if (input) { input.focus(); input.setSelectionRange(this.tradeQuery.length, this.tradeQuery.length); } }); }
    if (event.target.matches("[data-online-trade-amount]")) {
      // Normalize Japanese/full-width digits and harmless grouping separators,
      // but keep every other character visible so a decimal or sign is rejected
      // instead of silently changing (for example, `1.5` must not become `15`).
      const normalized = String(event.target.value ?? "").normalize("NFKC").replace(/[,_，\s]/g, "").slice(0, 24);
      this.tradeAmount = normalized;
      if (event.target.value !== normalized) event.target.value = normalized;
      this._updateTradeQuantityPreview();
    }
  }

  _handleChange(event) {
    if (event.target.matches("[data-online-guild-plan-purpose]")) this.guildPlanDraft.purpose = normalizedRoomPurpose(event.target.value);
    if (event.target.matches("[data-online-guild-plan-style]")) this.guildPlanDraft.style = ROOM_STYLES.has(event.target.value) ? event.target.value : "anyone";
    if (event.target.matches("[data-online-guild-recruitment-purpose]")) this.guildRecruitmentDraft.purpose = normalizedRoomPurpose(event.target.value);
    if (event.target.matches("[data-online-guild-recruitment-style]")) this.guildRecruitmentDraft.style = ROOM_STYLES.has(event.target.value) ? event.target.value : "anyone";
    if (event.target.matches("[data-online-room-purpose-filter]")) {
      const value = event.target.value;
      this.roomListingPurposeFilter = value === "all" ? "all" : normalizedRoomPurpose(value, "all");
      this._requestRoomListings({ force: true });
      return;
    }
    if (event.target.matches("[data-online-room-listing-toggle],[data-online-room-listing-purpose],[data-online-room-listing-style]")) {
      if (this.roomListingPending) return;
      const published = Boolean(this._query("[data-online-room-listing-toggle]")?.checked);
      const guildRecruitmentLock = currentGuildRoomRecruitmentLock(this.guildState, this.roomState, this._guildNow());
      if (published && guildRecruitmentLock.active) {
        this.toast(guildRecruitmentLock.kind === "planned" ? "遠征予定の集合中です。予定カードで確認／予定取消を行ってください" : "ギルド共闘募集を終了してから公開募集へ切り替えてください");
        this._render();
        return;
      }
      const purposeValue = this._query("[data-online-room-listing-purpose]")?.value;
      const styleValue = this._query("[data-online-room-listing-style]")?.value;
      const purpose = normalizedRoomPurpose(purposeValue);
      const style = ROOM_STYLES.has(styleValue) ? styleValue : "anyone";
      this.roomListingPending = true;
      if (!this._send("setRoomListing", { published, purpose, style })) {
        this.roomListingPending = false;
        this.toast("募集設定を送信できませんでした");
        this._render();
        return;
      }
      this.root?.querySelectorAll("[data-online-room-listing-toggle],[data-online-room-listing-purpose],[data-online-room-listing-style]").forEach(control => { control.disabled = true; });
      const status = this._query(".online-room-listing-settings>header>strong");
      if (status) status.textContent = "更新中…";
    }
  }

  _selectCharacter(monsterId) {
    this.selectedMonsterId = monsterId; storageSet(ONLINE_STORAGE_KEYS.monsterId, monsterId);
    this.root?.querySelectorAll("[data-online-character]").forEach(button => {
      const active = button.dataset.onlineCharacter === monsterId; button.classList.toggle("selected", active); button.setAttribute("aria-pressed", String(active));
    });
    this._refreshProfile(); this._send("profile", { profile: this.profile });
  }

  _refreshProfile() {
    const name = this._query("[data-online-display-name]")?.value ?? storageGet(ONLINE_STORAGE_KEYS.displayName);
    this.profile = buildOnlinePartyProfile(this.getState?.(), { monsterId: this.selectedMonsterId, displayName: name });
    this.selectedMonsterId = this.profile.primaryMonsterId ?? this.selectedMonsterId;
  }

  _currentResumeEndpoint() {
    if (this.ws && this.connectionEndpoint) return this.connectionEndpoint;
    const input = this._query("[data-online-server-url]")?.value || storageGet(ONLINE_STORAGE_KEYS.serverUrl) || DEFAULT_ONLINE_SERVER_URL;
    return normalizedWebsocketEndpoint(input);
  }

  _refreshResumeTokenFromStorage(endpointValue = this._currentResumeEndpoint()) {
    const endpoint = normalizedWebsocketEndpoint(endpointValue);
    if (!endpoint) return this.resumeToken;
    const latest = migrateLegacyResumeToken()[endpoint] ?? "";
    if (endpoint !== this.resumeTokenEndpoint) {
      this.resumeTokenEndpoint = endpoint;
      this.resumeToken = latest;
      this.resumeTokenStorageSnapshot = latest;
    } else if (latest && latest !== this.resumeTokenStorageSnapshot) {
      this.resumeToken = latest;
      this.resumeTokenStorageSnapshot = latest;
    } else if (!this.resumeToken && latest) this.resumeToken = latest;
    return this.resumeToken;
  }

  _storeResumeTokenForEndpoint(endpointValue, value) {
    const endpoint = normalizedWebsocketEndpoint(endpointValue), token = cleanResumeToken(value);
    if (!endpoint || !token) return false;
    const tokens = readResumeTokenMap();
    if (Object.prototype.hasOwnProperty.call(tokens, endpoint)) delete tokens[endpoint];
    tokens[endpoint] = token;
    while (Object.keys(tokens).length > RESUME_TOKEN_MAP_LIMIT) delete tokens[Object.keys(tokens)[0]];
    writeResumeTokenMap(tokens);
    storageSet(ONLINE_STORAGE_KEYS.resumeTokenMigration, "1");
    storageSet(ONLINE_STORAGE_KEYS.resumeToken, token);
    this.resumeTokenEndpoint = endpoint;
    this.resumeToken = token;
    this.resumeTokenStorageSnapshot = token;
    return true;
  }

  _handleHandshakeError(message) {
    const code = String(message?.code ?? "HANDSHAKE_FAILED"), endpoint = this.lastHelloEndpoint || this.connectionEndpoint || this._currentResumeEndpoint();
    const latest = endpoint ? readResumeTokenMap()[endpoint] ?? "" : "";
    const storageTokenChanged = Boolean(latest && latest !== this.lastHelloResumeToken);
    const retryWithLatestToken = code === "RESUME_TOKEN_MISMATCH" && storageTokenChanged && this.handshakeTokenRetries < HANDSHAKE_TOKEN_RETRY_LIMIT;
    const socket = this.ws;
    this.connectionReady = false;
    this.helloAckPending = false;
    this._clearMoveInputs();
    if (retryWithLatestToken) {
      this.resumeToken = latest;
      this.resumeTokenStorageSnapshot = latest;
      this.resumeTokenEndpoint = endpoint;
      this.handshakeTokenRetries += 1;
      this.manualClose = false;
      storageSet(ONLINE_STORAGE_KEYS.autoConnect, "1");
      this._setStatus("reconnecting", "再認証中…", "更新された再接続キーで安全に接続し直します");
      try { socket?.close(4003, "retry hello with latest token"); } catch {}
      return;
    }
    this.manualClose = true;
    storageSet(ONLINE_STORAGE_KEYS.autoConnect, "0");
    this._setStatus("error", "認証できません", message?.message || "接続設定を確認して、もう一度接続してください");
    this._showConnectionStep("entry");
    try { socket?.close(1008, "hello rejected"); } catch {}
  }

  connect({ reconnect = false } = {}) {
    if (this.ws && [WebSocket.OPEN, WebSocket.CONNECTING].includes(this.ws.readyState)) return;
    const input = this._query("[data-online-server-url]")?.value || storageGet(ONLINE_STORAGE_KEYS.serverUrl) || DEFAULT_ONLINE_SERVER_URL;
    let url;
    try { url = websocketUrl(input); } catch (error) { this.toast(error.message); return; }
    if (!reconnect) { this.supersededConnection = false; this.handshakeTokenRetries = 0; this.reconnectAttempts = 0; }
    if (this.connectionEndpoint && this.connectionEndpoint !== url) {
      this.capabilities = new Set();
      this.powerRankingState = normalizePowerRankingState(null, { supported: false });
      this.powerRankingProfile = null;
      this._notifyPowerRankingState();
      if (typeof this.onPowerRankingProfile === "function") this.onPowerRankingProfile(null, { playerId: "", requestId: "", ok: false, reason: "serverChanged" });
      this.friendState = { friends: [], incoming: [], outgoing: [], invites: [], blocked: [], muted: [] };
      this.guildState = emptyGuildState();
      this.guildClockOffsetMs = 0; this.guildClockSynced = false;
      this.guildLookupDraft = ""; this.guildCreateDraft = { name: "", tag: "", description: "" }; this.guildChatDraft = ""; this.guildPlanDraft = defaultGuildPlanDraft(); this.guildRecruitmentDraft = { purpose: "explore", style: "anyone", note: "" };
      this.guildPlanComposerOpen = false; this.guildPlansExpanded = false; this.guildActivitiesExpanded = false;
      this.socialScrollByTab = { friends: 0, guild: 0 }; this.guildChatScroll = { top: 0, atBottom: true };
      this._clearGuildPending();
      this._renderFriendPanel();
    }
    this.connectionEndpoint = url;
    this._refreshResumeTokenFromStorage(url);
    storageSet(ONLINE_STORAGE_KEYS.serverUrl, input.trim()); this.manualClose = false; this.connectionReady = false; this._clearGuildPlanTransitionTimer(); this._clearMoveInputs();
    this._setStatus(reconnect ? "reconnecting" : "connecting", reconnect ? "再接続中…" : "接続中…", "PCサーバーへ接続しています");
    let socket;
    try { socket = new WebSocket(url); this.ws = socket; (this.socketEndpoints ??= new WeakMap()).set(socket, url); } catch (error) { this._setStatus("error", "接続できません", error.message); return; }
    socket.addEventListener("open", () => {
      if (this.ws !== socket) return;
      this.foregroundProfileSyncPending = false;
      this._refreshProfile();
      const endpoint = this.socketEndpoints.get(socket) || url;
      this.connectionEndpoint = endpoint;
      this._refreshResumeTokenFromStorage(endpoint);
      this.lastHelloEndpoint = endpoint;
      this.lastHelloResumeToken = this.resumeToken;
      this.helloAckPending = this._send("hello", { protocol: ONLINE_PROTOCOL, friendId: this.selfId, clientKey: storageGet(ONLINE_STORAGE_KEYS.clientKey), resumeToken: this.resumeToken, profile: this.profile, backgroundOnly: Boolean(this.desiredBackgroundOnly && !this.mounted) });
    });
    socket.addEventListener("message", event => { if (this.ws !== socket) return; try { this._handleMessage(JSON.parse(event.data), socket); } catch (error) { console.warn("Online message ignored", error); } });
    socket.addEventListener("close", event => this._handleClose(socket, event));
    socket.addEventListener("error", () => { if (this.ws === socket) { this.connectionReady = false; this._setStatus("error", "通信エラー", "PCサーバーとトンネルを確認してください"); } });
  }

  _beginInteractionPending(action, targetId) {
    if (this.interactionPending) return false;
    const pending = { action: String(action || ""), targetId: String(targetId || ""), startedAt: Date.now() };
    this.interactionPending = pending; clearTimeout(this.interactionPendingTimer);
    this.interactionPendingTimer = setTimeout(() => { if (this.interactionPending !== pending) return; this.interactionPending = null; this.interactionPendingTimer = null; this._render(); }, 3000);
    return true;
  }

  _clearInteractionPending(render = false) {
    clearTimeout(this.interactionPendingTimer); this.interactionPendingTimer = null; this.interactionPending = null;
    if (render) this._render();
  }

  _send(type, payload = {}) {
    if (this.ws?.readyState !== WebSocket.OPEN) return false;
    try { this.ws.send(JSON.stringify({ type, ...payload })); return true; } catch { return false; }
  }

  supportsPowerRankings() {
    return Boolean(this.connectionReady && this.capabilities.has(POWER_RANKING_CAPABILITY));
  }

  _nextPowerRankingRequestId(kind = "request") {
    this.powerRankingRequestSequence = (this.powerRankingRequestSequence + 1) % 1_000_000;
    const safeKind = String(kind).replace(/[^a-z]/gi, "").slice(0, 12) || "request";
    return `power-${safeKind}-${Date.now().toString(36)}-${this.powerRankingRequestSequence.toString(36)}`;
  }

  _notifyPowerRankingState() {
    if (typeof this.onPowerRankingState !== "function") return;
    try { this.onPowerRankingState(this.powerRankingState); } catch (error) { console.warn("Power ranking state callback failed", error); }
  }

  _notifyPowerRankingCapability() {
    if (typeof this.onPowerRankingCapability !== "function") return;
    try { this.onPowerRankingCapability({ supported: this.supportsPowerRankings(), capability: POWER_RANKING_CAPABILITY }); }
    catch (error) { console.warn("Power ranking capability callback failed", error); }
  }

  _deliverPowerRankingRewards(message) {
    const deliveries = Array.isArray(message?.rankingRewards) ? message.rankingRewards.slice(0, 12) : [];
    for (const source of deliveries) {
      const deliveryId = rankingText(source?.deliveryId, 96), seasonId = rankingText(source?.seasonId, 20);
      if (!deliveryId || !seasonId || !source?.reward || typeof source.reward !== "object") continue;
      const delivery = { deliveryId, seasonId, rank: boundedInteger(source.rank, 1, 100, 100), title: rankingText(source.title, 80, "週間戦力ランキング"), reward: { ...source.reward }, createdAt: boundedInteger(source.createdAt, 0, Number.MAX_SAFE_INTEGER, Date.now()) };
      Promise.resolve(this.onPowerRankingReward(delivery)).catch(error => console.warn("Power ranking reward callback failed", error));
    }
  }

  ackPowerRankingReward(deliveryId) {
    const id = rankingText(deliveryId, 96);
    return Boolean(id && this._send("powerRankingRewardAck", { deliveryId: id }));
  }

  _beginPowerRankingRequest(kind, type, payload = {}, meta = {}) {
    const requestId = this._nextPowerRankingRequestId(kind);
    if (kind === "list") this.latestPowerRankingListRequestId = requestId;
    if (kind === "profile") this.latestPowerRankingProfileRequestId = requestId;
    return new Promise(resolve => {
      const pending = {
        kind,
        ...meta,
        resolve,
        timer: setTimeout(() => {
          if (this.powerRankingRequests.get(requestId) !== pending) return;
          this.powerRankingRequests.delete(requestId);
          resolve({ ok: false, reason: "timeout", requestId });
          if (kind === "list" && requestId === this.latestPowerRankingListRequestId) {
            this.powerRankingState = { ...this.powerRankingState, loading: false, error: "ランキングを取得できませんでした" };
            this._notifyPowerRankingState();
          }
        }, POWER_RANKING_REQUEST_TIMEOUT_MS),
      };
      this.powerRankingRequests.set(requestId, pending);
      if (this._send(type, { requestId, ...payload })) return;
      clearTimeout(pending.timer);
      this.powerRankingRequests.delete(requestId);
      resolve({ ok: false, reason: "offline", requestId });
    });
  }

  _settlePowerRankingRequest(message, result, expectedKind = "") {
    const requestId = rankingText(message?.requestId, 96);
    const pending = requestId ? this.powerRankingRequests?.get?.(requestId) : null;
    if (!pending || expectedKind && pending.kind !== expectedKind) return false;
    clearTimeout(pending.timer);
    this.powerRankingRequests.delete(requestId);
    pending.resolve({ requestId, ...result });
    return pending;
  }

  _matchingPowerRankingRequest(message, expectedKind) {
    const requestId = rankingText(message?.requestId, 96);
    const pending = requestId ? this.powerRankingRequests?.get?.(requestId) : null;
    return pending?.kind === expectedKind ? { requestId, pending } : null;
  }

  _clearPowerRankingRequests(reason = "offline") {
    for (const [requestId, pending] of (this.powerRankingRequests ?? [])) {
      clearTimeout(pending.timer);
      pending.resolve({ ok: false, reason, requestId });
    }
    this.powerRankingRequests?.clear?.();
    if (this.powerRankingState?.loading) {
      this.powerRankingState = { ...this.powerRankingState, loading: false, error: reason === "unsupported" ? "" : "接続が中断されました" };
      this._notifyPowerRankingState();
    }
  }

  /** Publish a sanitized party snapshot. The server recalculates its power. */
  publishPowerRankingSnapshot(snapshot, { force = false } = {}) {
    const normalized = normalizePowerRankingSnapshot(snapshot);
    if (!normalized) return Promise.resolve({ ok: false, reason: "invalidSnapshot" });
    this.latestPowerRankingSnapshot = normalized;
    const signature = JSON.stringify(normalized);
    if (!this.connectionReady) {
      if (this.backgroundActive) {
        const started = this.startBackground();
        if (started.reason === "busy" || started.reason === "superseded") return Promise.resolve({ ok: false, reason: started.reason, queued: false });
      }
      return Promise.resolve({ ok: false, reason: "connecting", queued: true });
    }
    if (!this.capabilities.has(POWER_RANKING_CAPABILITY)) return Promise.resolve({ ok: false, reason: "unsupported" });
    if (!force && signature === this.lastPowerRankingSnapshotSignature && Date.now() - this.lastPowerRankingSnapshotAt < 30_000) {
      return Promise.resolve({ ok: true, skipped: true });
    }
    return this._beginPowerRankingRequest("snapshot", "powerSnapshotSubmit", { snapshot: normalized }).then(result => {
      if (result.ok) {
        this.lastPowerRankingSnapshotSignature = signature;
        this.lastPowerRankingSnapshotAt = Date.now();
      }
      return result;
    });
  }

  requestPowerRankings({ limit = POWER_RANKING_ENTRY_LIMIT } = {}) {
    const safeLimit = boundedInteger(limit, 1, POWER_RANKING_ENTRY_LIMIT, POWER_RANKING_ENTRY_LIMIT);
    this.powerRankingWanted = true;
    this.powerRankingWantedOptions = { limit: safeLimit };
    this.powerRankingState = { ...this.powerRankingState, loading: true, error: "" };
    this._notifyPowerRankingState();
    if (!this.connectionReady) {
      if (this.backgroundActive) {
        const started = this.startBackground();
        if (started.reason === "busy" || started.reason === "superseded") {
          this.powerRankingState = { ...this.powerRankingState, loading: false, error: "" };
          this._notifyPowerRankingState();
          return Promise.resolve({ ok: false, reason: started.reason, queued: false });
        }
      }
      return Promise.resolve({ ok: false, reason: "connecting", queued: true });
    }
    if (!this.capabilities.has(POWER_RANKING_CAPABILITY)) {
      this.powerRankingState = normalizePowerRankingState(null, { supported: false });
      this._notifyPowerRankingState();
      return Promise.resolve({ ok: false, reason: "unsupported" });
    }
    return this._beginPowerRankingRequest("list", "powerRankingList", { limit: safeLimit });
  }

  requestPowerRankingProfile(playerId) {
    const targetId = normalizedPlayerId(playerId);
    if (!targetId) return Promise.resolve({ ok: false, reason: "invalidPlayer" });
    this.powerRankingProfileWanted = targetId;
    if (!this.connectionReady) {
      if (this.backgroundActive) {
        const started = this.startBackground();
        if (started.reason === "busy" || started.reason === "superseded") return Promise.resolve({ ok: false, reason: started.reason, queued: false });
      }
      return Promise.resolve({ ok: false, reason: "connecting", queued: true });
    }
    if (!this.capabilities.has(POWER_RANKING_CAPABILITY)) return Promise.resolve({ ok: false, reason: "unsupported" });
    return this._beginPowerRankingRequest("profile", "powerRankingProfile", { playerId: targetId }, { playerId: targetId });
  }

  _flushPowerRankingAfterHandshake() {
    const supported = this.capabilities.has(POWER_RANKING_CAPABILITY);
    this.powerRankingState = { ...this.powerRankingState, supported, loading: supported && this.powerRankingWanted, error: "" };
    this._notifyPowerRankingCapability();
    this._notifyPowerRankingState();
    if (!supported) {
      this._clearPowerRankingRequests("unsupported");
      return;
    }
    if (this.latestPowerRankingSnapshot) void this.publishPowerRankingSnapshot(this.latestPowerRankingSnapshot, { force: true });
    if (this.powerRankingWanted) void this.requestPowerRankings(this.powerRankingWantedOptions);
    if (this.powerRankingProfileWanted) void this.requestPowerRankingProfile(this.powerRankingProfileWanted);
  }

  _sendGuild(kind, type, payload = {}, meta = {}) {
    if (!this._canMutateOnline()) { this._announceConnectionPause(); return false; }
    if (!this.capabilities.has("guildsV1")) { this.toast("このサーバーはギルド機能に未対応です"); return false; }
    if (String(kind).startsWith("recruitment") && !this.capabilities.has("guildPartyRecruitmentV1")) { this.toast("このサーバーはギルド共闘募集に未対応です"); return false; }
    if (String(kind).startsWith("plan") && !this.capabilities.has("guildPlansV1")) { this.toast("このサーバーはギルド遠征予定に未対応です"); return false; }
    if (kind === "planGather" && !this.capabilities.has("guildPlanGatheringV1")) { this.toast("このサーバーは予定からの集合に未対応です"); return false; }
    if (this.guildPending && kind !== "recruitmentClose") { this.toast("前のギルド操作を確認中です"); return false; }
    const pending = { kind: String(kind || type), targetId: meta.targetId ?? payload.targetId, guildId: payload.guildId, inviteId: payload.inviteId, planId: payload.planId, recruitmentId: payload.recruitmentId };
    if (kind === "lookup") this.guildState = { ...this.guildState, lookup: null };
    this.guildPending = pending;
    this.guildStatus = kind === "lookup" ? "ギルドを検索中…"
      : kind === "planCreate" ? "遠征予定を登録中…"
        : kind === "planRespond" ? "参加表明を更新中…"
          : kind === "planCancel" ? "遠征予定を取消中…"
            : kind === "planGather" ? "予定の集合募集を開始中…"
              : kind === "recruitmentCreate" ? "ギルド限定募集を公開中…"
              : kind === "recruitmentClose" ? "ギルド限定募集を終了中…"
                : kind === "recruitmentJoin" ? "募集の部屋へ参加中…" : "サーバーへ反映中…";
    if (!this._send(type, payload)) { this.guildPending = null; this.guildStatus = "送信できませんでした。接続を確認してください。"; this._renderFriendPanel(); return false; }
    clearTimeout(this.guildPendingTimer);
    this.guildPendingTimer = setTimeout(() => {
      if (this.guildPending !== pending) return;
      this.guildPending = null;
      this.guildPendingTimer = null;
      this.guildStatus = "最新状態を再確認しています…";
      this._send("guildList");
      this._renderFriendPanel();
    }, 4500);
    this._renderFriendPanel();
    return true;
  }

  _clearGuildPending(status = "") {
    clearTimeout(this.guildPendingTimer);
    this.guildPendingTimer = null;
    this.guildPending = null;
    this.guildStatus = cleanSocialText(status, 120).trim();
  }

  _syncGuildServerClock(value) {
    const serverNow = Number(value), localNow = Date.now(), offset = serverNow - localNow;
    if (!Number.isSafeInteger(serverNow) || serverNow <= 0 || !Number.isFinite(offset) || Math.abs(offset) > GUILD_SERVER_CLOCK_MAX_OFFSET_MS) {
      this.guildClockOffsetMs = 0;
      this.guildClockSynced = false;
      return false;
    }
    this.guildClockOffsetMs = Math.max(-GUILD_SERVER_CLOCK_MAX_OFFSET_MS, Math.min(GUILD_SERVER_CLOCK_MAX_OFFSET_MS, offset));
    this.guildClockSynced = true;
    return true;
  }

  _guildNow() {
    return Date.now() + (this.guildClockSynced ? this.guildClockOffsetMs : 0);
  }

  _rememberGuildPlanReminder(plan, phase) {
    const key = `${this.selfId}|${plan.planId}|${Math.max(0, Number(plan.scheduledAt) || 0)}|${phase}`;
    if (this.guildPlanReminderReceipts.has(key)) return false;
    this.guildPlanReminderReceipts.add(key);
    this.guildPlanReminderReceipts = new Set([...this.guildPlanReminderReceipts].slice(-GUILD_PLAN_REMINDER_RECEIPT_LIMIT));
    writeGuildPlanReminderReceipts([...this.guildPlanReminderReceipts]);
    return true;
  }

  _handleGuildPlanReminder(message) {
    const phase = message?.phase === "live" ? "live" : message?.phase === "window" ? "window" : "";
    const plan = normalizeGuildPlanReminder(message?.plan);
    const serverNow = Number(message?.serverNow), clockOffset = serverNow - Date.now();
    const validClock = Number.isSafeInteger(serverNow) && serverNow > 0 && Number.isFinite(clockOffset) && Math.abs(clockOffset) <= GUILD_SERVER_CLOCK_MAX_OFFSET_MS;
    const inGatherWindow = plan && serverNow >= plan.scheduledAt - 30 * 60_000 && serverNow < plan.scheduledAt + 2 * 60 * 60_000;
    if (!phase || !plan || !validClock || !inGatherWindow || (phase === "live" && (!plan.gathering || plan.gathering.expiresAt <= serverNow || plan.gathering.expiresAt > plan.scheduledAt + 2 * 60 * 60_000)) || (phase === "window" && plan.gathering)) return false;
    this._syncGuildServerClock(serverNow);
    if (this._rememberGuildPlanReminder(plan, phase)) {
      const organizer = plan.organizer?.displayName || "主催者";
      this.toast(phase === "live" ? `${organizer}のギルド遠征が集合中です` : "参加予定のギルド遠征が近づいています");
    }
    this._renderFriendPanel();
    return true;
  }

  _openGuildPlanAttention(planIdValue) {
    const planId = cleanSocialText(planIdValue, 96).trim();
    if (!GUILD_PLAN_ID_PATTERN.test(planId) || !this.guildState.guild?.plans?.some(plan => plan.planId === planId)) {
      this.toast("この遠征予定は終了しました");
      return false;
    }
    this.friendPanelOpen = true;
    this.socialTab = "guild";
    this.guildPlansExpanded = true;
    this._renderFriendPanel();
    const focusPlan = () => {
      if (!this.mounted || !this.friendPanelOpen || this.socialTab !== "guild") return;
      const card = this._query(`[data-online-guild-plan-card="${planId}"]`);
      if (!card) return;
      try { card.focus({ preventScroll: true }); } catch { card.focus?.(); }
      card.scrollIntoView?.({ block: "center", behavior: "auto" });
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(focusPlan); else focusPlan();
    return true;
  }

  _canMutateOnline() {
    return Boolean(!this.pendingLeaveOnReconnect && !this.backgroundOnly && !this.connectionModePending && this.connectionReady && this.ws && typeof WebSocket !== "undefined" && this.ws.readyState === WebSocket.OPEN);
  }

  _announceConnectionPause() {
    this.toast(this.connectionStatus.kind === "reconnecting" || this.connectionStatus.kind === "connecting" ? "再接続が終わるまでお待ちください" : "オンラインサーバーへ接続されていません");
  }

  _syncConnectionUi() {
    if (!this.root) return;
    const { kind = "offline", title = "オフライン", detail = "オンラインサーバーへ接続されていません" } = this.connectionStatus ?? {};
    const banner = this._query("[data-online-connection-banner]");
    if (banner) {
      banner.className = `online-v3-connection-banner ${kind}`;
      const heading = banner.querySelector("b"), copy = banner.querySelector("span");
      if (heading) heading.textContent = title;
      if (copy) copy.textContent = detail;
      let offlineExit = banner.querySelector("[data-online-force-close-leave]");
      if (this.pendingLeaveOnReconnect?.allowOfflineExit) {
        if (!offlineExit) {
          offlineExit = document.createElement("button");
          offlineExit.type = "button";
          offlineExit.dataset.onlineForceCloseLeave = "1";
          offlineExit.textContent = "オフラインで閉じる";
          offlineExit.setAttribute("aria-label", "通信を待たずオンライン画面を閉じる");
          banner.appendChild(offlineExit);
        }
      } else offlineExit?.remove();
    }
    const entryStatus = this._query("[data-online-status]");
    if (entryStatus) {
      let offlineExit = entryStatus.querySelector("[data-online-force-close-leave]");
      if (this.pendingLeaveOnReconnect?.allowOfflineExit) {
        if (!offlineExit) {
          offlineExit = document.createElement("button"); offlineExit.type = "button"; offlineExit.dataset.onlineForceCloseLeave = "1";
          offlineExit.textContent = "オフラインで閉じる"; offlineExit.setAttribute("aria-label", "通信を待たずオンライン画面を閉じる"); entryStatus.appendChild(offlineExit);
        }
      } else offlineExit?.remove();
    }
    const paused = !this._canMutateOnline();
    this.root.querySelector("[data-online-room]")?.classList.toggle("online-connection-paused", paused);
    if (paused) {
      this._clearMoveInputs();
      this.root.querySelectorAll(ONLINE_STATE_CONTROL_SELECTOR).forEach(control => {
        if (control.disabled) return;
        control.dataset.onlineConnectionDisabled = "1";
        control.disabled = true;
      });
    } else {
      this.root.querySelectorAll("[data-online-connection-disabled='1']").forEach(control => {
        control.disabled = false;
        delete control.dataset.onlineConnectionDisabled;
      });
    }
  }

  _supportsRoomListings() {
    return this.capabilities.size === 0 || ["roomListingsV1", "roomListings", "roomDirectory", "roomBoard"].some(name => this.capabilities.has(name));
  }

  _requestRoomListings({ force = false } = {}) {
    if (this.roomState || this.connectionStep === "room") return false;
    if (!this._supportsRoomListings()) {
      this.roomListingsStatus = "error";
      this._renderRoomBoard();
      return false;
    }
    if (this.roomListingsStatus === "loading" && !force) return false;
    this.roomListingsStatus = "loading";
    this._renderRoomBoard();
    const purpose = ROOM_PURPOSES.has(this.roomListingPurposeFilter) ? this.roomListingPurposeFilter : undefined;
    if (this._send("listRoomListings", { purpose })) return true;
    this.roomListingsStatus = "error";
    this._renderRoomBoard();
    return false;
  }

  _joinListedRoom(roomIdValue, listingIdValue) {
    if (this.pendingRoomJoinId || this.roomState) return;
    const roomId = safeRoomId(roomIdValue), listingId = String(listingIdValue ?? "").slice(0, 96);
    const listing = this.roomListings.find(entry => entry.roomId === roomId && (!listingId || entry.listingId === listingId));
    if (roomId.length !== 6 || !listing?.listingId) { this.toast("この募集は終了しました。掲示板を更新してください"); return; }
    this.pendingRoomJoinId = roomId;
    this._renderRoomBoard();
    if (this._send("joinListedRoom", { roomId, listingId: listing.listingId })) return;
    this.pendingRoomJoinId = null;
    this.roomListingsStatus = "error";
    this._renderRoomBoard();
  }

  _quickJoinRoom() {
    if (this.pendingRoomJoinId || this.roomState || !this.roomListings.length) return;
    this.pendingRoomJoinId = "quick";
    this._renderRoomBoard();
    const purpose = ROOM_PURPOSES.has(this.roomListingPurposeFilter) ? this.roomListingPurposeFilter : undefined;
    if (this._send("quickJoin", { purpose })) return;
    this.pendingRoomJoinId = null;
    this.roomListingsStatus = "error";
    this._renderRoomBoard();
  }

  _renderRoomBoard() {
    const target = this._query("[data-online-room-board-content]");
    if (!target) return;
    const signature = JSON.stringify({
      listings: this.roomListings, status: this.roomListingsStatus,
      pending: this.pendingRoomJoinId, purpose: this.roomListingPurposeFilter,
    });
    if (signature === this.roomBoardRenderSignature && target.dataset.onlineRoomBoardRendered === "1") return;
    const active = target.ownerDocument?.activeElement;
    let focus = null;
    if (active && target.contains(active)) {
      if (active.matches?.("[data-online-room-purpose-filter]")) focus = { kind: "filter" };
      else if (active.matches?.("[data-online-refresh-listings]")) focus = { kind: "refresh" };
      else if (active.matches?.("[data-online-quick-join]")) focus = { kind: "quick" };
      else if (active.matches?.("[data-online-join-listed-room]")) focus = { kind: "join", roomId: active.dataset.onlineJoinListedRoom };
    }
    target.innerHTML = renderOnlineRoomDirectory(this.roomListings, {
      status: this.roomListingsStatus, pendingId: this.pendingRoomJoinId, purpose: this.roomListingPurposeFilter,
    });
    target.dataset.onlineRoomBoardRendered = "1";
    this.roomBoardRenderSignature = signature;
    this._syncConnectionUi();
    if (!focus) return;
    requestAnimationFrame(() => {
      if (!this.mounted || !target.isConnected) return;
      let node = focus.kind === "filter" ? target.querySelector("[data-online-room-purpose-filter]")
        : focus.kind === "refresh" ? target.querySelector("[data-online-refresh-listings]")
          : focus.kind === "quick" ? target.querySelector("[data-online-quick-join]")
            : [...target.querySelectorAll("[data-online-join-listed-room]")].find(button => button.dataset.onlineJoinListedRoom === focus.roomId);
      node?.focus?.({ preventScroll: true });
    });
  }

  syncExpeditionProfile() {
    this._refreshProfile();
    this.pendingExpeditionProfileSync = true;
    return this._flushExpeditionProfileSync();
  }

  _flushExpeditionProfileSync() {
    if (!this.pendingExpeditionProfileSync || !this.profile) return false;
    if (!this._send("expeditionProfileSync", { profile: this.profile })) return false;
    this.pendingExpeditionProfileSync = false;
    return true;
  }

  _notifyTutorialGuide(id) {
    const key = String(id ?? "");
    if (!key || this.notifiedTutorialGuides.has(key)) return;
    this.notifiedTutorialGuides.add(key);
    this.onTutorialGuide(key);
  }

  _handleMessage(message, sourceSocket = null) {
    if (!message || typeof message.type !== "string") return;
    if (sourceSocket && sourceSocket !== this.ws) return;
    if (message.type === "helloAck") {
      if (message.protocol !== ONLINE_PROTOCOL) { this._handleHandshakeError({ code: "PROTOCOL_MISMATCH", message: "ゲームとオンラインサーバーのバージョンが一致しません" }); return; }
      this.connectionReady = true;
      this.helloAckPending = false;
      this.reconnectAttempts = 0;
      this.handshakeTokenRetries = 0;
      this.capabilities = capabilitySet(message.capabilities);
      this.backgroundOnly = message.backgroundOnly === true;
      this.desiredBackgroundOnly = Boolean(this.backgroundActive && !this.mounted);
      const backgroundHandshake = this.backgroundOnly || this.desiredBackgroundOnly;
      if (!backgroundHandshake) {
        this.recoverySettlementBatch += 1;
        this.recoverySettlementTasks = new Set();
        this.recoverySettlementFailed = false;
        this.friendState = this._normalizeFriendState(message.friendState);
        this._purgeHiddenSocial();
        const previousGuildId = this.guildState?.guild?.guildId ?? "", nextGuildState = normalizeGuildState(message.guildState);
        this._syncGuildServerClock(nextGuildState.serverNow);
        this.guildState = nextGuildState;
        if ((this.guildState.guild?.guildId ?? "") !== previousGuildId) { this.guildPlanComposerOpen = false; this.guildPlansExpanded = false; this.guildActivitiesExpanded = false; }
        this._clearGuildPending();
        if (this.guildState.guild) { this.guildLookupDraft = ""; this.guildCreateDraft = { name: "", tag: "", description: "" }; }
        else { this.guildPlanDraft = defaultGuildPlanDraft(this._guildNow()); this.guildRecruitmentDraft = { purpose: "explore", style: "anyone", note: "" }; }
      }
      const helloEndpoint = this.socketEndpoints?.get(sourceSocket) || this.lastHelloEndpoint || this.connectionEndpoint || this._currentResumeEndpoint();
      this.selfId = message.playerId || this.selfId;
      if (!this._storeResumeTokenForEndpoint(helloEndpoint, message.resumeToken)) { this.resumeToken = ""; this.resumeTokenStorageSnapshot = ""; }
      storageSet(ONLINE_STORAGE_KEYS.autoConnect, "1");
      this._flushPowerRankingAfterHandshake();
      // Always refresh an open Social panel from the hello snapshot, including
      // reconnects that do not resume a room. This also re-enables controls only
      // after the authenticated handshake has completed.
      if (!backgroundHandshake) this._renderFriendPanel();
      if (!backgroundHandshake && (Array.isArray(message.activeTradeIds) || !message.resumed)) {
        const activeTradeIds = Array.isArray(message.activeTradeIds) ? message.activeTradeIds : [];
        this.tradeReconnectAuthoritativeIds = new Set(activeTradeIds.map(String));
        this._recoverOrphanedTradeEscrows(activeTradeIds);
      }
      if (backgroundHandshake) {
        this.backgroundConnectionBusy = false;
        this.connectionModePending = false;
        if (!this._exitGuestProgressIsolation("backgroundHandshake")) {
          this.manualClose = true;
          this.connectionReady = false;
          storageSet(ONLINE_STORAGE_KEYS.autoConnect, "0");
          const socket = this.ws; this.ws = null;
          try { socket?.close(1011, "guest progress restore failed"); } catch {}
          this._setStatus("error", "本編進行を復元できません", "再読み込みすると、保護済みの進行から自動復元します");
          this.toast("本編進行の保護データを保存できないため、オンライン接続を停止しました");
          return;
        }
        this.roomState = null;
        this.roomId = null;
        if (!this.capabilities.has(POWER_RANKING_CAPABILITY) || !this.capabilities.has(BACKGROUND_CONNECTION_CAPABILITY)) {
          // Old servers do not provide ranking data. End a headless connection
          // quietly; mounting the Online screen can still reconnect normally.
          this.manualClose = true;
          this.connectionReady = false;
          const socket = this.ws; this.ws = null;
          try { socket?.close(1000, "background ranking unsupported"); } catch {}
          return;
        }
        if (this.backgroundOnly !== this.desiredBackgroundOnly) this._requestConnectionMode(this.desiredBackgroundOnly);
        if (this.mounted) {
          this._setStatus("connecting", "オンライン画面を準備中…", "同じ接続で部屋情報を復帰しています");
          this._showConnectionStep("gate");
        }
        return;
      }
      if (this.pendingLeaveOnReconnect) {
        this._showConnectionStep(message.room ? "room" : "gate");
        if (!message.room) { this._completePendingRoomLeave(); return; }
        const pendingRoomId = safeRoomId(this.pendingLeaveOnReconnect.roomId), resumedRoomId = safeRoomId(message.room.roomId);
        if (!pendingRoomId || resumedRoomId !== pendingRoomId) {
          clearTimeout(this.pendingLeaveTimer); this.pendingLeaveTimer = null;
          this.pendingLeaveOnReconnect = null;
          this._settlePendingExpeditionStart(null, { rejected: true });
          this._setStatus("online", "別の部屋へ復帰しました", "誤退出を防ぐため、以前の部屋への退出操作を中止しました");
          this.toast("接続先の部屋が変わったため、自動退出を中止しました");
          this._applyRoomState(message.room, { reconnected: Boolean(message.resumed) });
          this._flushExpeditionProfileSync();
          return;
        }
        this.pendingLeaveOnReconnect.sent = true;
        this._setStatus("reconnecting", "退出処理中…", "サーバーへ退出を確定しています");
        if (!this._send("leaveRoom")) { this.connectionReady = false; try { this.ws?.close(1012, "retry pending leave"); } catch {} }
        return;
      }
      this._setStatus("online", "接続済み", message.resumed ? "前の部屋へ復帰しました" : "部屋を作るか、ルームIDで参加してください");
      this._showConnectionStep(message.room ? "room" : "gate");
      if (message.room) { this._applyRoomState(message.room, { reconnected: Boolean(message.resumed) }); this._settlePendingExpeditionStart(message.room, { rejected: message.room.phase !== "expedition" }); }
      else {
        this._clearRoom({ reason: message.resumed ? "resumeWithoutRoom" : "helloWithoutRoom" });
        this._settlePendingExpeditionStart(null, { rejected: true });
        const invited = safeRoomId(this._query("[data-online-room-code]")?.value);
        if (invited.length === 6) this._send("joinRoom", { roomId: invited });
        else this._requestRoomListings();
      }
      this._flushExpeditionProfileSync();
      return;
    }
    if (message.type === "connectionModeAck") {
      this.connectionModePending = false;
      this.backgroundOnly = message.backgroundOnly === true;
      this.desiredBackgroundOnly = Boolean(this.backgroundActive && !this.mounted);
      if (this.backgroundOnly !== this.desiredBackgroundOnly) {
        this._requestConnectionMode(this.desiredBackgroundOnly);
        return;
      }
      if (this.backgroundOnly || !this.mounted) return;
      if (this.foregroundProfileSyncPending) {
        this.foregroundProfileSyncPending = false;
        this._refreshProfile();
        this._send("profile", { profile: this.profile });
      }
      if (message.friendState) { this.friendState = this._normalizeFriendState(message.friendState); this._purgeHiddenSocial(); }
      else this._send("friendList");
      if (message.guildState) {
        const nextGuildState = normalizeGuildState(message.guildState);
        this._syncGuildServerClock(nextGuildState.serverNow);
        this.guildState = nextGuildState;
      } else this._send("guildList");
      this._renderFriendPanel();
      if (Array.isArray(message.activeTradeIds)) {
        this.tradeReconnectAuthoritativeIds = new Set(message.activeTradeIds.map(String));
        this._recoverOrphanedTradeEscrows(message.activeTradeIds);
      }
      this._setStatus("online", "接続済み", message.room ? "オンライン探索へ戻りました" : "部屋を作るか、ルームIDで参加してください");
      this._showConnectionStep(message.room ? "room" : "gate");
      if (message.room) this._applyRoomState(message.room);
      else { this._clearRoom({ reason: "connectionModeWithoutRoom" }); this._requestRoomListings({ force: true }); }
      return;
    }
    if (message.type === "powerRankingRewards") {
      this._deliverPowerRankingRewards(message);
      return;
    }
    if (message.type === "powerSnapshotAck") {
      this._deliverPowerRankingRewards(message);
      if (!this._matchingPowerRankingRequest(message, "snapshot")) return;
      this._settlePowerRankingRequest(message, { ok: message.ok !== false, ack: message }, "snapshot");
      return;
    }
    if (message.type === "powerRankingState") {
      this._deliverPowerRankingRewards(message);
      const match = this._matchingPowerRankingRequest(message, "list");
      if (!match) return;
      const state = normalizePowerRankingState(message, { supported: true, loading: false });
      if (match.requestId === this.latestPowerRankingListRequestId) {
        this.powerRankingState = state;
        this._notifyPowerRankingState();
      }
      this._settlePowerRankingRequest(message, { ok: true, state }, "list");
      return;
    }
    if (message.type === "powerRankingRewardAck") return;
    if (message.type === "powerRankingProfileResult") {
      const match = this._matchingPowerRankingRequest(message, "profile");
      if (!match) return;
      const profile = normalizePowerRankingProfile(message.profile);
      if (profile && profile.playerId !== match.pending.playerId) return;
      if (match.requestId === this.latestPowerRankingProfileRequestId) {
        this.powerRankingProfile = profile;
        if (typeof this.onPowerRankingProfile === "function") {
          try { this.onPowerRankingProfile(this.powerRankingProfile, { playerId: match.pending.playerId, requestId: match.requestId, ok: Boolean(profile) }); }
          catch (error) { console.warn("Power ranking profile callback failed", error); }
        }
      }
      this._settlePowerRankingRequest(message, { ok: Boolean(profile), profile, reason: profile ? "" : "missing" }, "profile");
      return;
    }
    if (message.type === "roomListings") {
      if (this.roomState || this.connectionStep === "room") return;
      const generatedAt = Math.max(0, Number(message.generatedAt) || 0);
      if (generatedAt && generatedAt < this.roomListingsGeneratedAt) return;
      const normalized = normalizeRoomListings(message.listings);
      this.roomListings = ROOM_PURPOSES.has(this.roomListingPurposeFilter) ? normalized.filter(listing => listing.purpose === this.roomListingPurposeFilter) : normalized;
      this.roomListingsGeneratedAt = generatedAt || Date.now();
      this.roomListingsStatus = "ready";
      this._renderRoomBoard();
      return;
    }
    if (message.type === "friendState") { this.friendState = this._normalizeFriendState(message.state); this._purgeHiddenSocial(); this._refreshSafetyViews(); return; }
    if (message.type === "guildPlanReminder") { this._handleGuildPlanReminder(message); return; }
    if (message.type === "guildState") {
      const pendingKind = this.guildPending?.kind, pendingPlanId = pendingKind === "planGather" ? String(this.guildPending?.planId ?? "") : "", previousGuildId = this.guildState.guild?.guildId ?? "";
      const nextGuildState = normalizeGuildState(message.state);
      this._syncGuildServerClock(nextGuildState.serverNow);
      this.guildState = nextGuildState;
      if ((this.guildState.guild?.guildId ?? "") !== previousGuildId) { this.socialScrollByTab.guild = 0; this.guildChatScroll = { top: 0, atBottom: true }; this.guildPlanComposerOpen = false; this.guildPlansExpanded = false; this.guildActivitiesExpanded = false; }
      if (pendingKind === "planGather") {
        const pendingPlan = this.guildState.guild?.plans?.find(entry => entry.planId === pendingPlanId);
        if (!pendingPlan || pendingPlan.gathering) this._clearGuildPending();
      } else if (pendingKind !== "recruitmentJoin") this._clearGuildPending();
      if (this.guildState.guild) { this.guildLookupDraft = ""; this.guildCreateDraft = { name: "", tag: "", description: "" }; }
      if (pendingKind === "chat") this.guildChatDraft = "";
      if (pendingKind === "planCreate") { this.guildPlanDraft = defaultGuildPlanDraft(this._guildNow()); this.guildPlanComposerOpen = false; }
      if (pendingKind === "recruitmentCreate") this.guildRecruitmentDraft.note = "";
      if (!this.guildState.guild) { this.guildPlanDraft = defaultGuildPlanDraft(this._guildNow()); this.guildRecruitmentDraft = { purpose: "explore", style: "anyone", note: "" }; }
      this._renderFriendPanel(); return;
    }
    if (message.type === "guildLookupResult" || message.type === "guildLookup") {
      this.guildState = { ...this.guildState, lookup: normalizeGuildPublic(message.guild) };
      this._clearGuildPending();
      this._renderFriendPanel(); return;
    }
    if (message.type === "roomState") { this._applyRoomState(message.room); this._settlePendingExpeditionStart(message.room); return; }
    if (["resonanceStarted", "resonanceState", "resonanceEnded"].includes(message.type)) {
      this.route = "explore";
      storageSet(ONLINE_STORAGE_KEYS.route, "explore");
      this.toast("共鳴迷宮は共同探索へ統合されました。共同探索から出発してください");
      this._render(); return;
    }
    if (message.type === "tradeState") { this._applyTradeState(message.trade); return; }
    if (message.type === "tradeCancelled") { this._finishTrade(message.tradeId, { cancelled: true, reason: message.reason }); return; }
    if (message.type === "tradeCompleted") { this._finishTrade(message.tradeId, { completed: true }); return; }
    if (message.type === "tradeCommit") { this._commitTrade(message); return; }
    if (message.type === "tradeRecoveryPending") {
      const tradeId = String(message.tradeId ?? ""); if (!tradeId) return;
      this.terminalTradeRecoveries.add(tradeId);
      if (this.terminalTradeRecoveries.size > 100) this.terminalTradeRecoveries.delete(this.terminalTradeRecoveries.values().next().value);
      this._setTradeRecoveryStatus("pending", tradeId);
      this._commitTrade(message, { recovery: true }); return;
    }
    if (message.type === "hostWorldDelta") { this._applyHostWorldDelta(message); return; }
    if (message.type === "expeditionVitals") { this._applyExpeditionVitals(message); return; }
    if (message.type === "recoveryComplete") { if (message.orphanedExpedition) this._receiveOrphanedExpedition(this.recoverySettlementBatch); return; }
    if (message.type === "expeditionResult") { const batch = this.recoverySettlementBatch; this._trackRecoverySettlement(this._receiveExpeditionResult(message, batch), batch); return; }
    if (message.type === "secretRoomEntered") { if (String(message.playerId ?? "") !== this.selfId) return; const roomId = String(message.roomId ?? "").slice(0, 160), floor = Math.max(1, Math.min(100, Math.floor(Number(message.floor) || 1))); if (roomId) this.onSecretRoomEntered({ roomId, floor, playerId: this.selfId }); return; }
    if (["battleDefeated", "onlineBattleDefeated"].includes(message.type)) { this._applyBattleDefeated(message); return; }
    if (["raidWorld", "raidWorldState"].includes(message.type)) { const ownerId = this._explicitWorldOwnerId(message); if (ownerId && ownerId === this.selfId) this._syncRaidWorld(message.raidWorld ?? message.progress); return; }
    if (message.type === "leftRoom") { if (this.pendingLeaveOnReconnect) this._completePendingRoomLeave(); else this._clearRoom({ reason: "leftRoom" }); return; }
    if (message.type === "memberMoved") { const member = this.roomState?.members?.find(entry => entry.playerId === message.playerId); if (member && message.position) member.position = { ...message.position }; if (this.route === "home") this._updateHallPlayerDom(message.playerId); return; }
    if (message.type === "expeditionMoved") { const member = this.roomState?.members?.find(entry => entry.playerId === message.playerId); if (member && message.position) member.dungeonPosition = { ...message.position }; if (message.playerId === this.selfId) this._notifyTutorialGuide("explore_move"); if (this.exploreCanvasMounted) this._queueExploreCanvasUpdate(); else this._render(); return; }
    if (["expeditionStarted", "expeditionFloorAdvanced"].includes(message.type) && message.room) { this.floorBossConfirm = null; this.coopBossConfirm = null; this._applyRoomState(message.room); if (message.type === "expeditionStarted") this._settlePendingExpeditionStart(message.room); return; }
    if (message.type === "battleStarted" && message.room) { this.floorBossConfirm = null; this.coopBossConfirm = null; this.presentationKoIds.explore.clear(); this._applyRoomState(message.room); this._queueBattlePresentation("explore", message.events ?? message.room?.expedition?.battle?.lastEvents); return; }
    if (message.type === "expeditionEvent") { if (message.event?.kind === "hostChestOpened") { const ownerId = this._explicitWorldOwnerId(message.event); if (ownerId && ownerId === this.selfId) this.onHostWorldUpdate({ ...message.event, ownerId }); } if (message.event?.tutorialGuide === "firstPickup") this._notifyTutorialGuide("explore_pickup"); this._announceExpeditionEvent(message.event); return; }
    if (message.type === "floorBossDefeated") { this._clearPresentationTimers(); const ownerId = this._explicitWorldOwnerId(message), reward = { floor: Number(message.floor) || 0, firstClear: Boolean(message.firstClear), ownerId: ownerId || null, boss: message.boss ?? null, bosses: message.bosses ?? [] }, isWorldOwner = Boolean(ownerId && ownerId === this.selfId), multiplayer = message.summary?.multiplayer ?? (this.roomState?.members?.length ?? 0) >= 2; this.floorBossConfirm = null; this.coopBossConfirm = null; this._closeBattleMenus("explore"); this.expeditionReport = multiplayer ? message.summary ?? null : null; this.pendingFloorBossReward = null; if (isWorldOwner) this.onHostWorldUpdate({ kind: "floorBossDefeated", floor: reward.floor, ownerId, boss: reward.boss, bosses: reward.bosses }); this.route = "explore"; this.toast(`${reward.floor || ""}F 階層支配者を撃破！ 戦利品は鍵付き宝箱へ`); this._render(); return; }
    if (message.type === "expeditionPing" && message.ping?.id) { if (this._isSocialHidden(message.ping.playerId)) return; this.coopPings.set(message.ping.id, { ...message.ping }); if (this.exploreCanvasMounted) this.onExploreCanvasUpdate(this.roomState, this.selfId, { chatBubbles: this._chatBubbleSnapshot(), pings: this._pingSnapshot() }); else this._render(); return; }
    if (message.type === "battleRound" || message.type === "battleResolved") { const previous = this.roomState?.expedition?.battle; this._captureHpTrails("explore", previous, message.battle); if (this.roomState?.expedition) this.roomState.expedition.battle = message.battle; if (message.type === "battleRound") this._closeBattleMenus("explore"); this._setRoute("explore", { silent: true }); this._queueBattlePresentation("explore", message.battle?.lastEvents); return; }
    if (message.type === "expeditionEnded") { this._clearPresentationTimers(); const multiplayer = message.summary?.multiplayer ?? (this.roomState?.members?.length ?? 0) >= 2, completedFloor = message.summary?.floor ?? message.summary?.assistedWorld?.endFloor; this.presentationKoIds.explore.clear(); this.expeditionReport = multiplayer ? message.summary ?? null : null; if (this.roomState) this.roomState = { ...this.roomState, phase: "lobby", expedition: null, coopRun: null }; this._closeAllBattleMenus(); this.route = "explore"; this.toast(message.summary?.completed && Number.isFinite(Number(completedFloor)) ? `${Math.max(1, Math.min(100, Math.floor(Number(completedFloor))))}F 踏破！` : message.summary?.reason === "defeat" ? "パーティが全滅しました…" : "探索から帰還しました"); this._render(); return; }
    if (message.type === "battleEnded") { this._clearPresentationTimers(); this.coopBossConfirm = null; this.presentationKoIds.explore.clear(); this._closeBattleMenus("explore"); const bossName = message.coopBoss?.name || message.boss?.name; this.toast(message.result === "victory" ? bossName ? `${bossName}を撃破！` : "共闘バトル勝利！" : message.coopBoss ? "共闘ボスから退却。回復後に再挑戦できます" : "共闘パーティが全滅しました…"); return; }
    if (message.type === "raidStarted") {
      this.presentationKoIds.raid.clear();
      this.roomState = { ...(this.roomState ?? {}), phase: "raid", raid: message.raid, raidProgress: message.raid?.progress };
      this.selectedTarget.raid = message.raid?.minions?.find(entry => entry.hp > 0)?.id ?? message.raid?.boss?.id ?? null;
      const raidOwner = this._canonicalRoomOwnerId(this.roomState) === this.selfId;
      if (raidOwner && Object.prototype.hasOwnProperty.call(message.raid ?? {}, "progress")) this._syncRaidWorld(message.raid.progress);
      this._setRoute("raid", { silent: true }); this._queueBattlePresentation("raid", message.raid?.lastEvents); return;
    }
    if (["raidState", "raidRound", "raidResolved"].includes(message.type)) {
      const previous = this.roomState?.raid; this._captureHpTrails("raid", previous, message.raid);
      if (this.roomState) { this.roomState.phase = "raid"; this.roomState.raid = message.raid; this.roomState.raidProgress = message.raid?.progress ?? this.roomState.raidProgress; }
      const raidOwner = this._canonicalRoomOwnerId(this.roomState) === this.selfId;
      if (raidOwner && Object.prototype.hasOwnProperty.call(message.raid ?? {}, "progress")) this._syncRaidWorld(message.raid.progress);
      if (message.type === "raidRound") this._closeBattleMenus("raid"); this._setRoute("raid", { silent: true }); this._queueBattlePresentation("raid", message.raid?.lastEvents); return;
    }
    if (message.type === "raidEnded") {
      this._clearPresentationTimers();
      this.presentationKoIds.raid.clear();
      const raidOwner = this._canonicalRoomOwnerId(this.roomState) === this.selfId;
      if (this.roomState) { this.roomState.phase = "lobby"; this.roomState.raid = null; this.roomState.raidProgress = message.raid?.progress ?? null; }
      this._closeBattleMenus("raid");
      if (raidOwner) this._syncRaidWorld(message.raid?.progress ?? null);
      this.raidReport = { result: message.result, raid: message.raid, ranking: message.ranking ?? message.raid?.ranking ?? [] }; this.route = "raid"; this.toast(message.result === "victory" ? "今週のレイド討伐成功！" : message.result === "cancelled" ? "レイドを中断し、残HPを保存しました" : "敗北…ボスの残HPを保存しました"); this._render(); return;
    }
    if (message.type === "teamBattleStarted" || message.type === "teamBattleState" || message.type === "teamBattleRound" || message.type === "teamBattleResolved") { const previous = this.roomState?.teamBattle; if (message.type === "teamBattleStarted") this.presentationKoIds.team.clear(); this._captureHpTrails("team", previous, message.teamBattle); if (message.type === "teamBattleStarted") this.teamBattleReport = null; if (this.roomState) { this.roomState.phase = "team"; this.roomState.teamBattle = message.teamBattle; } if (message.type === "teamBattleRound") this._closeBattleMenus("team"); this._setRoute("team", { silent: true }); this._queueBattlePresentation("team", message.teamBattle?.lastEvents); return; }
    if (message.type === "teamBattleEnded") { this._clearPresentationTimers(); this.presentationKoIds.team.clear(); this.teamBattleReport = { resultId: message.resultId, result: message.result, winner: message.winner, summary: message.summary, teamBattle: message.teamBattle }; if (this.roomState) { this.roomState.phase = "lobby"; this.roomState.teamBattle = null; } this._closeBattleMenus("team"); this.onTeamBattleResult(this.teamBattleReport); this.route = "team"; this.toast(message.winner ? `${message.winner === "sun" ? "紅組" : "蒼組"}の勝利！` : "引き分け！"); this._render(); return; }
    if (message.type === "chatMessage") { this._receiveChat(message.message); return; }
    if (message.type === "social") { this._receiveSocial(message); return; }
    if (message.type === "onlineReward") { const batch = this.recoverySettlementBatch; this._trackRecoverySettlement(this._receiveReward(message, batch), batch); return; }
    if (message.type === "error") {
      const powerErrorCode = String(message.code ?? "");
      if (powerErrorCode === "BACKGROUND_CONNECTION_BUSY") {
        this.helloAckPending = false;
        this.connectionReady = false;
        this.manualClose = true;
        this.backgroundConnectionBusy = true;
        this._clearPowerRankingRequests("busy");
        // Another tab owns active cooperative play. Never steal that session or
        // enter a reconnect loop merely to refresh the public ranking.
        const socket = this.ws; this.ws = null;
        try { socket?.close(1000, "foreground session active elsewhere"); } catch {}
        return;
      }
      const powerRequestId = rankingText(message.requestId, 96), powerPending = powerRequestId ? this.powerRankingRequests?.get?.(powerRequestId) : null;
      if (powerPending) {
        const missing = powerErrorCode === "POWER_RANKING_PROFILE_MISSING";
        const latestProfile = powerPending.kind === "profile" && powerRequestId === this.latestPowerRankingProfileRequestId;
        const latestList = powerPending.kind === "list" && powerRequestId === this.latestPowerRankingListRequestId;
        if (latestProfile) {
          this.powerRankingProfile = null;
          if (typeof this.onPowerRankingProfile === "function") {
            try { this.onPowerRankingProfile(null, { playerId: powerPending.playerId, requestId: powerRequestId, ok: false, reason: missing ? "missing" : powerErrorCode }); } catch {}
          }
        }
        this._settlePowerRankingRequest(message, { ok: false, reason: missing ? "missing" : powerErrorCode || "rejected", message: rankingText(message.message, 120), profile: powerPending.kind === "profile" ? null : undefined }, powerPending.kind);
        if (latestList) {
          this.powerRankingState = { ...this.powerRankingState, loading: false, error: rankingText(message.message, 120, "ランキングを取得できませんでした") };
          this._notifyPowerRankingState();
        }
        return;
      }
      if (!this.connectionReady) { this._handleHandshakeError(message); return; }
      const pendingTradeOffer = this.tradePendingOffer;
      const tradeOfferRequestMatches = pendingTradeOffer && String(message.requestId ?? "") === pendingTradeOffer.requestId && (!message.tradeId || String(message.tradeId) === pendingTradeOffer.tradeId);
      const legacyTradeOfferRejected = pendingTradeOffer && !this.capabilities.has(TRADE_OFFER_RECEIPTS_CAPABILITY)
        && !message.requestId && String(message.code ?? "").startsWith("TRADE_")
        && (!message.tradeId || String(message.tradeId) === pendingTradeOffer.tradeId);
      if (tradeOfferRequestMatches || legacyTradeOfferRejected) {
        this._handleTradeOfferError(message); return;
      }
      if (this.pendingLeaveOnReconnect) {
        if (["NOT_IN_ROOM", "ROOM_NOT_FOUND"].includes(String(message.code ?? ""))) this._completePendingRoomLeave();
        else {
          this.connectionReady = false;
          this._setStatus("reconnecting", "退出を再確認中…", message.message || "サーバーへ退出を再送します");
          try { this.ws?.close(1012, "retry pending leave"); } catch {}
        }
        return;
      }
      const errorCode = String(message.code ?? "");
      if (errorCode.startsWith("GUILD_") || ["recruitment", "plan"].some(prefix => String(this.guildPending?.kind ?? "").startsWith(prefix))) {
        this._clearGuildPending(message.message || "ギルド操作に失敗しました");
        this.toast(message.message || "ギルド操作に失敗しました");
        this._renderFriendPanel();
        return;
      }
      if (errorCode === "RESONANCE_INTEGRATED") {
        this._setRoute("explore", { silent: true });
        this.toast(message.message || "共鳴迷宮は共同探索へ統合されました");
        return;
      }
      this._settlePendingExpeditionStart(null, { rejected: true });
      this._clearInteractionPending(false);
      const hadPendingRoomJoin = Boolean(this.pendingRoomJoinId);
      this.pendingRoomJoinId = null;
      this.roomListingPending = false;
      this.roomMemberRemovalPendingId = null;
      if (this.roomListingsStatus === "loading" || hadPendingRoomJoin) this.roomListingsStatus = hadPendingRoomJoin ? "ready" : "error";
      if (this.merchantPending) { clearTimeout(this.merchantPendingTimer); this.merchantPending = false; this.merchantResult = { ...(this.merchantResult ?? {}), status: "error", message: message.message || "支援品を受け取れませんでした。" }; }
      this.toast(message.message || "オンライン処理に失敗しました");
      if (this.roomState) this._render(); else this._renderRoomBoard();
      return;
    }
  }

  _tradeCatalogSource() {
    const state = this.getState?.() ?? {}, source = buildOnlineTradeCatalog(state), tradeId = this.trade?.tradeId;
    const escrow = tradeId ? state.onlineParty?.tradeEscrow?.[tradeId]?.asset : null;
    if (escrow && ["stack", "currency"].includes(escrow.kind)) {
      const amount = parseOnlineTradeAmount(escrow.payload?.amount), existing = source.find(asset => asset.ref === escrow.assetId);
      if (amount && existing) {
        existing.count = Math.min(Number.MAX_SAFE_INTEGER, (Number(existing.count) || 0) + amount);
        existing.maxAmount = existing.count;
        existing.details = `所持 ${existing.count.toLocaleString()}`;
      } else if (amount) {
        source.push({ ref: escrow.assetId, kind: escrow.kind, name: escrow.name, rarity: escrow.rarity, level: 1, details: `所持 ${amount.toLocaleString()}`, count: amount, maxAmount: amount, unavailable: false });
      }
    }
    return source;
  }

  _tradeCatalog() {
    const source = this._tradeCatalogSource(), kind = this.tradeFilter, query = this.tradeQuery.trim().toLocaleLowerCase("ja");
    return source.filter(asset => (kind === "all" || asset.kind === kind) && (!query || `${asset.name} ${asset.rarity} ${asset.details}`.toLocaleLowerCase("ja").includes(query))).slice(0, 80);
  }

  _tradeDraftAsset() { return this._tradeCatalogSource().find(asset => asset.ref === this.tradeDraftRef) ?? null; }

  _selectTradeAsset(ref) {
    if (!ref || this.tradePendingOffer) return;
    const item = this._tradeCatalogSource().find(asset => asset.ref === ref);
    if (!item || item.unavailable) return this.toast(item?.reason || "交換できない所持品です");
    if (!["stack", "currency"].includes(item.kind) || Number(item.maxAmount) <= 1) {
      this.tradeDraftRef = ""; this.tradeAmount = "1"; this._offerTradeAsset(ref); return;
    }
    this.tradeDraftRef = ref;
    const escrow = this.getState?.()?.onlineParty?.tradeEscrow?.[this.trade?.tradeId]?.asset;
    const existingAmount = escrow?.assetId === ref ? parseOnlineTradeAmount(escrow.payload?.amount, item.maxAmount) : null;
    this.tradeAmount = String(existingAmount ?? 1);
    this._render();
    requestAnimationFrame(() => { const input = this._query("[data-online-trade-amount]"); input?.focus?.({ preventScroll: true }); input?.select?.(); });
  }

  _stepTradeAmount(step) {
    const item = this._tradeDraftAsset(); if (!item) return;
    const current = parseOnlineTradeAmount(this._query("[data-online-trade-amount]")?.value ?? this.tradeAmount, item.maxAmount) ?? 1;
    this.tradeAmount = String(Math.max(1, Math.min(Number(item.maxAmount) || 1, current + Math.trunc(step))));
    const input = this._query("[data-online-trade-amount]"); if (input) input.value = this.tradeAmount;
    this._updateTradeQuantityPreview();
  }

  _setTradeAmountToMaximum() {
    const item = this._tradeDraftAsset(); if (!item) return;
    this.tradeAmount = String(Math.max(1, Math.floor(Number(item.maxAmount) || 1)));
    const input = this._query("[data-online-trade-amount]"); if (input) input.value = this.tradeAmount;
    this._updateTradeQuantityPreview();
  }

  _updateTradeQuantityPreview() {
    const item = this._tradeDraftAsset(), input = this._query("[data-online-trade-amount]"); if (!item || !input) return;
    const amount = parseOnlineTradeAmount(input.value, item.maxAmount), remaining = amount == null ? null : Math.max(0, Number(item.count ?? item.maxAmount) - amount);
    const preview = this._query("[data-online-trade-amount-preview]");
    if (preview) preview.textContent = amount == null ? `1〜${Number(item.maxAmount).toLocaleString()}で入力してください` : `セット後の残り ${remaining.toLocaleString()}`;
    const submit = this._query("[data-online-trade-quantity-set]"); if (submit) submit.disabled = amount == null || Boolean(this.tradePendingOffer);
  }

  _nextTradeOfferRequestId() {
    this.tradeOfferSequence = (Number(this.tradeOfferSequence) + 1) % 1_000_000;
    let entropy = "";
    try { const values = new Uint32Array(1); globalThis.crypto?.getRandomValues?.(values); entropy = values[0].toString(36); } catch {}
    if (!entropy) entropy = Math.random().toString(36).slice(2, 10);
    return `trade-offer-${Date.now().toString(36)}-${this.tradeOfferSequence.toString(36)}-${entropy}`.slice(0, 96);
  }

  async _persistTradeMutation(event, rollback = null) {
    try {
      const result = await Promise.resolve(this.onOnlineStateMutation({ ...event, rollback }));
      if (result === false || result?.ok === false) { rollback?.(); return { ok: false, message: result?.message || "交換状態を保存できませんでした" }; }
      return { ok: true };
    } catch (error) {
      rollback?.();
      return { ok: false, message: error?.message || "交換状態を保存できませんでした" };
    }
  }

  _haltTradePersistence(message = "交換データを保存できないため、安全のため操作を停止しました") {
    this.tradePersistenceBlocked = true;
    this.tradeReconcilePending = false;
    this.toast(message);
    this._render();
  }

  _tradeAdvanceAllowed() {
    const tradeId = String(this.trade?.tradeId ?? "");
    if (this.tradePersistenceBlocked || this.tradePendingOffer || this.tradeReconcilePending || !tradeId
      || this.tradeOfferInflight.has(tradeId) || this.tradeReconcileInflight.has(tradeId)
      || this.tradeCommitInflight.has(tradeId) || this.tradeFinishInflight.has(tradeId)) return false;
    const ownOffer = this.trade.offers?.[this.selfId] ?? null, escrow = this.getState?.()?.onlineParty?.tradeEscrow?.[this.trade.tradeId] ?? null;
    if (!ownOffer) return !escrow;
    if (!this.capabilities.has(TRADE_OFFER_RECEIPTS_CAPABILITY)) return Boolean(escrow && escrow.status === "offered" && sameLegacyOnlineTradeAsset(escrow.asset, ownOffer));
    const requestId = String(this.trade.offerRequests?.[this.selfId] ?? ""), revision = Math.max(0, Math.floor(Number(this.trade.offerRevisions?.[this.selfId]) || 0));
    return Boolean(escrow && escrow.status === "offered" && sameOnlineTradeAsset(escrow.asset, ownOffer) && String(escrow.offerRequestId ?? "") === requestId && Math.max(0, Math.floor(Number(escrow.offerRevision) || 0)) === revision);
  }

  async _recoverOrphanedTradeEscrows(activeTradeIds = []) {
    const active = new Set((Array.isArray(activeTradeIds) ? activeTradeIds : []).map(String));
    const released = recoverOrphanedTradeEscrows(this.getState?.() ?? {}, [...active]);
    if (released.ok === false) { this._haltTradePersistence(released.message || "一部の交換保留品を復元できませんでした"); return false; }
    if (released.length || released.quarantined?.length) {
      const saved = await this._persistTradeMutation({ kind: "tradeRecovery", assets: [...released], quarantined: released.quarantined ?? [] }, released.rollback);
      if (!saved.ok) { this._haltTradePersistence(saved.message); return false; }
    }
    if (released.length) this.toast(`${released.length}件の交換品を所持品へ戻しました`);
    if (released.quarantined?.length) this.toast(`${released.quarantined.length}件の旧交換データを安全領域へ隔離しました`);
    const pendingId = String(this.tradePendingOffer?.tradeId ?? ""), shownId = String(this.trade?.tradeId ?? "");
    if (shownId && !active.has(shownId)) this._clearTradeUi();
    else if (pendingId && !active.has(pendingId)) this.tradePendingOffer = null;
    this._render();
    return true;
  }

  _contentStartBlockedByTrade() {
    if (!this.trade) return false;
    this.toast("交換を完了または中止してから開始してください");
    this._setRoute("home", { silent: true });
    return true;
  }

  _explicitWorldOwnerId(source) {
    const value = source?.worldOwnerId ?? source?.ownerId ?? source?.hostOwnerId;
    return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 24);
  }

  _canonicalRoomOwnerId(room = this.roomState) {
    const value = room?.expedition?.hostOwnerId ?? room?.ownerId;
    return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 24);
  }

  _guestProgressDescriptor(room) {
    const roomId = safeRoomId(room?.roomId), ownerId = this._canonicalRoomOwnerId(room);
    if (!roomId || !ownerId || ownerId === this.selfId) return null;
    const runId = String(room?.coopRun?.runId ?? room?.expedition?.id ?? "").slice(0, 120);
    return {
      roomId, ownerId, runId,
      startFloor: Math.max(1, Math.min(100, Math.floor(Number(room?.coopRun?.startFloor ?? room?.expedition?.floor ?? room?.selectedFloor) || 1))),
    };
  }

  _notifyGuestProgressIsolation(phase, context, reason) {
    if (!context || typeof this.onGuestProgressIsolation !== "function") return { ok: true };
    try {
      const result = this.onGuestProgressIsolation({ phase, ...context, reason: String(reason ?? phase).slice(0, 40) });
      if (result?.ok === false) this.recoverySettlementFailed = true;
      return result ?? { ok: true };
    } catch (error) {
      this.recoverySettlementFailed = true;
      return { ok: false, message: error?.message || "ゲスト進行の分離状態を保存できませんでした" };
    }
  }

  _syncGuestProgressIsolation(room, { reconnected = false } = {}) {
    const current = this.guestProgressIsolationContext, next = this._guestProgressDescriptor(room);
    const nextRoomId = safeRoomId(room?.roomId), roomOwnerId = this._canonicalRoomOwnerId(room);
    // An ownerless partial snapshot must never make a guarded guest look like the
    // world owner. Keep the existing guard until an authoritative owner or exit
    // event arrives.
    if (!roomOwnerId && current?.roomId === nextRoomId) return true;
    if (!next) {
      if (!current) return true;
      const result = this._notifyGuestProgressIsolation("exit", current, roomOwnerId === this.selfId ? "becameWorldOwner" : "roomContextChanged");
      if (result?.ok === false) return false;
      this.guestProgressIsolationContext = null;
      return true;
    }
    const same = Boolean(current && current.roomId === next.roomId && current.ownerId === next.ownerId);
    if (current && !same) {
      const result = this._notifyGuestProgressIsolation("exit", current, "roomContextChanged");
      if (result?.ok === false) return false;
      this.guestProgressIsolationContext = null;
    }
    if (!same) {
      const result = this._notifyGuestProgressIsolation("enter", next, "roomState");
      if (result?.ok === false) return false;
      this.guestProgressIsolationContext = next;
      return true;
    }
    this.guestProgressIsolationContext = { ...current, runId: next.runId || current.runId, startFloor: current.startFloor };
    if (reconnected) {
      const result = this._notifyGuestProgressIsolation("reconnect", this.guestProgressIsolationContext, "helloResume");
      if (result?.ok === false) return false;
    }
    return true;
  }

  _exitGuestProgressIsolation(reason = "roomClear") {
    const current = this.guestProgressIsolationContext;
    if (!current) return true;
    const result = this._notifyGuestProgressIsolation("exit", current, reason);
    if (result?.ok === false) return false;
    this.guestProgressIsolationContext = null;
    return true;
  }

  _settlePendingExpeditionStart(room, { rejected = false } = {}) {
    if (!this.pendingExpeditionStart) return false;
    if (room?.phase === "expedition") {
      const secretRoomRun = this.pendingSecretRoomRun;
      this.pendingExpeditionStart = false;
      this.pendingSecretRoomRun = null;
      if (this._canonicalRoomOwnerId(room) === this.selfId) this._commitAuthoritativeSecretRoomRun(secretRoomRun);
      return true;
    }
    if (rejected) { this.pendingExpeditionStart = false; this.pendingSecretRoomRun = null; }
    return false;
  }

  _syncActiveExpeditionRun(room) {
    if (room?.phase !== "expedition" || !room.expedition) { this.syncedExpeditionStartKey = ""; return false; }
    const run = room.coopRun && typeof room.coopRun === "object" ? room.coopRun : {};
    const runId = String(run.runId ?? room.expedition.id ?? "").slice(0, 120);
    const ownerId = this._canonicalRoomOwnerId(room);
    if (!runId || !ownerId) return false;
    const key = `${ownerId}:${runId}`;
    if (this.syncedExpeditionStartKey === key) return true;
    const result = this.onExpeditionStarted({
      runId, ownerId,
      startFloor: Math.max(1, Math.min(100, Math.floor(Number(run.startFloor ?? room.expedition.floor) || 1))),
      startedAt: Math.max(0, Number(run.startedAt ?? room.expedition.startedAt) || 0),
      resumed: true,
    });
    if (result?.ok === false) { this.recoverySettlementFailed = true; return false; }
    this.syncedExpeditionStartKey = key;
    return true;
  }

  _createPendingSecretRoomRun() {
    let seed = 0;
    try { const values = new Uint32Array(1); globalThis.crypto?.getRandomValues?.(values); seed = Number(values[0]) & 0x7fffffff; } catch {}
    if (!seed) seed = Math.max(1, Math.floor(Math.random() * 0x7fffffff));
    return { id: `online-${Date.now().toString(36)}-${seed.toString(36)}`.slice(0, 120), seed, startedAt: Date.now() };
  }

  _commitAuthoritativeSecretRoomRun(source) {
    const id = String(source?.id ?? "").trim().slice(0, 120), seed = Math.max(1, Math.min(0x7fffffff, Math.floor(Number(source?.seed) || 0)));
    if (!id || !Number(source?.seed)) return false;
    const current = this.getState?.()?.secretRooms?.run;
    if (String(current?.id ?? "") === id && Number(current?.seed) === seed) return false;
    this.onBeginSecretRoomExpedition({ id, seed, startedAt: Math.max(1, Math.floor(Number(source?.startedAt) || Date.now())) });
    return true;
  }

  _applyTradeState(trade, { authoritative = false } = {}) {
    if (!trade?.tradeId || !trade.participants?.includes(this.selfId)) return;
    const tradeId = String(trade.tradeId), currentTradeId = String(this.trade?.tradeId ?? ""), pending = this.tradePendingOffer;
    if (currentTradeId && currentTradeId !== tradeId && (pending || this.getState?.()?.onlineParty?.tradeEscrow?.[currentTradeId])) return;
    const enteredConfirm = trade.state === "confirming" && (currentTradeId !== tradeId || this.trade?.state !== "confirming");
    this.trade = trade; this.route = "home";
    const reconnectIds = this.tradeReconnectAuthoritativeIds ?? new Set(), reconnectAuthoritative = reconnectIds.has(tradeId);
    if (reconnectAuthoritative) reconnectIds.delete(tradeId);
    const ownOffer = trade.offers?.[this.selfId] ?? null, ownRequestId = String(trade.offerRequests?.[this.selfId] ?? ""), ownRevision = Math.max(0,Math.floor(Number(trade.offerRevisions?.[this.selfId])||0));
    const strictReceipts = this.capabilities.has(TRADE_OFFER_RECEIPTS_CAPABILITY);
    const pendingAssetMatches = strictReceipts ? sameOnlineTradeAsset(pending?.asset,ownOffer) : sameLegacyOnlineTradeAsset(pending?.asset,ownOffer);
    const pendingMatches = Boolean(pending && pending.tradeId === tradeId && pendingAssetMatches
      && (!strictReceipts || pending.requestId === ownRequestId));
    const pendingPreviousRevision = Math.max(0,Math.floor(Number(pending?.previousRevision)||0));
    const serverIsAuthoritative = authoritative || reconnectAuthoritative || !pending || ownRevision > pendingPreviousRevision;
    const localEscrowRevision = Math.max(0,Math.floor(Number(this.getState?.()?.onlineParty?.tradeEscrow?.[tradeId]?.offerRevision)||0));
    const snapshotBehind = strictReceipts && !authoritative && !reconnectAuthoritative && !pending && ownRevision < localEscrowRevision;
    if (!snapshotBehind && (pendingMatches || serverIsAuthoritative)) this._scheduleTradeSnapshotReconcile(trade,{settlePending:Boolean(pending),pendingMatches});
    if (enteredConfirm) {
      this.tradeConfirmAvailableAt = Date.now() + 3000;
      clearTimeout(this.tradeConfirmTimer);
      this.tradeConfirmTimer = setTimeout(() => { this.tradeConfirmTimer = null; this._render(); }, 3050);
    } else if (trade.state !== "confirming") { this.tradeConfirmAvailableAt = 0; clearTimeout(this.tradeConfirmTimer); this.tradeConfirmTimer = null; }
    this._render();
  }

  _scheduleTradeSnapshotReconcile(trade, { settlePending = false, pendingMatches = false } = {}) {
    const sequence = this.tradeReconcileSequence = (Number(this.tradeReconcileSequence) || 0) + 1, tradeId = String(trade.tradeId), publicOwnOffer = trade.offers?.[this.selfId] ?? null;
    const localEscrow = this.getState?.()?.onlineParty?.tradeEscrow?.[tradeId] ?? null, strictReceipts = this.capabilities.has(TRADE_OFFER_RECEIPTS_CAPABILITY);
    const ownOffer = strictReceipts || !publicOwnOffer ? publicOwnOffer
      : sameLegacyOnlineTradeAsset(localEscrow?.asset, publicOwnOffer) ? localEscrow.asset
      : sameLegacyOnlineTradeAsset(localEscrow?.previousOffer?.asset, publicOwnOffer) ? localEscrow.previousOffer.asset
      : publicOwnOffer;
    const requestId = String(trade.offerRequests?.[this.selfId] ?? ""), revision = Math.max(0,Math.floor(Number(trade.offerRevisions?.[this.selfId])||0));
    this.tradeReconcilePending = true; this._render();
    const operation = Promise.resolve().then(async()=>{
      const current = this.trade;
      if (!current || String(current.tradeId) !== tradeId) return;
      const currentRequest = String(current.offerRequests?.[this.selfId] ?? ""), currentRevision = Math.max(0,Math.floor(Number(current.offerRevisions?.[this.selfId])||0));
      if (currentRequest !== requestId || currentRevision !== revision) return;
      const result = reconcileOnlineTradeEscrow(this.getState?.() ?? {},tradeId,ownOffer,{requestId,revision});
      if (!result.ok) { this._haltTradePersistence(result.message || "交換品をサーバー状態へ照合できませんでした"); return; }
      if (result.changed) {
        const saved = await this._persistTradeMutation({kind:"tradeReconcile",tradeId,asset:result.asset,released:result.released,requestId,revision},result.rollback);
        if (!saved.ok) { this._haltTradePersistence(saved.message); return; }
      }
      const pending = this.tradePendingOffer;
      const receiptMatches = !this.capabilities.has(TRADE_OFFER_RECEIPTS_CAPABILITY) || pending?.requestId === requestId;
      if (settlePending && pending?.tradeId === tradeId && (pendingMatches && receiptMatches || !pendingMatches)) {
        this.tradePendingOffer = null; this.tradeDraftRef = ""; this.tradeAmount = "1";
      }
      this.tradePersistenceBlocked = false;
    });
    this.tradeReconcileInflight.set(tradeId, operation);
    operation.catch(error=>this._haltTradePersistence(error?.message||"交換状態の照合に失敗しました")).finally(()=>{
      if (this.tradeReconcileInflight.get(tradeId) === operation) this.tradeReconcileInflight.delete(tradeId);
      if (this.tradeReconcileSequence === sequence) { this.tradeReconcilePending = false; this._render(); }
    });
    return operation;
  }

  async _handleTradeOfferError(message) {
    const pending = this.tradePendingOffer;
    const strictReceipts = this.capabilities.has(TRADE_OFFER_RECEIPTS_CAPABILITY);
    if (!pending || (strictReceipts && pending.requestId !== String(message.requestId ?? ""))) return;
    if (!strictReceipts && message.requestId && pending.requestId !== String(message.requestId)) return;
    if (message.tradeId && pending.tradeId !== String(message.tradeId)) return;
    if (message.trade?.tradeId === pending.tradeId) this._applyTradeState(message.trade,{authoritative:true});
    else await this._rollbackPendingTradeOffer("serverRejected");
    this.toast(message.message || "交換品の提示が拒否されました");
  }

  _offerTradeAsset(ref, options = {}) {
    const tradeId = String(this.trade?.tradeId ?? "");
    if (!tradeId || !ref || this.tradeOfferInflight.has(tradeId)) return this.tradeOfferInflight.get(tradeId) ?? Promise.resolve(null);
    const operation = this._performTradeAssetOffer(ref, options);
    this.tradeOfferInflight.set(tradeId, operation);
    const cleanup = () => { if (this.tradeOfferInflight.get(tradeId) === operation) { this.tradeOfferInflight.delete(tradeId); this._render(); } };
    operation.then(cleanup, cleanup);
    return operation;
  }

  async _performTradeAssetOffer(ref, { readInput = false } = {}) {
    const tradeId = this.trade?.tradeId;
    if (!tradeId || !ref || this.tradePendingOffer || this.tradePersistenceBlocked || this.tradeReconcilePending) return;
    const state = this.getState?.() ?? {}, replacing = Boolean(state.onlineParty?.tradeEscrow?.[tradeId]), catalogItem = this._tradeCatalogSource().find(asset => asset.ref === ref);
    if (!catalogItem || catalogItem.unavailable) return this.toast(catalogItem?.reason || "交換できない所持品です");
    const amount = ["stack", "currency"].includes(catalogItem.kind)
      ? parseOnlineTradeAmount(readInput ? this._query("[data-online-trade-amount]")?.value : this.tradeAmount, catalogItem.maxAmount)
      : 1;
    if (!amount) { this._updateTradeQuantityPreview(); this.toast(`数量は1〜${Number(catalogItem.maxAmount).toLocaleString()}で入力してください`); return; }
    const requestId = this._nextTradeOfferRequestId(),result = reserveOnlineTradeAsset(state, tradeId, ref, { amount, replace: replacing, requestId });
    if (!result.ok) { this.toast(result.message || "交換品を提示できません"); return; }
    const pending = this.tradePendingOffer = { tradeId,requestId,asset:result.asset,previousAsset:result.previousAsset??null,previousEntry:result.previousEntry??null,previousRevision:Math.max(0,Math.floor(Number(result.previousEntry?.offerRevision)||0)),status:"saving" };
    this._render();
    const saved = await this._persistTradeMutation({kind:"tradeReserve",tradeId,asset:result.asset,requestId},result.rollback);
    if (!saved.ok) { if (this.tradePendingOffer === pending) this.tradePendingOffer=null; this._haltTradePersistence(saved.message); return; }
    if (this.tradePendingOffer !== pending) return;
    pending.status="sending";
    if (!this._send("tradeOffer", { tradeId, asset: result.asset, requestId })) {
      const restored = await this._rollbackPendingTradeOffer("sendFailed");
      if (restored) this.toast("接続が切れたため交換品を元の状態へ戻しました");
      return;
    }
    pending.status="awaiting";this._render();
  }

  async _rollbackPendingTradeOffer(reason = "rollback") {
    const pending = this.tradePendingOffer, tradeId = String(pending?.tradeId ?? "");
    if (!pending || !tradeId) return null;
    try {
      const previous = pending.previousEntry, result = reconcileOnlineTradeEscrow(this.getState?.() ?? {},tradeId,previous?.asset??null,{requestId:previous?.offerRequestId??"",revision:previous?.offerRevision??0});
      if(!result.ok)throw new Error(result.message||"元の交換品を復元できません");
      const saved=await this._persistTradeMutation({kind:"tradeRollback",tradeId,reason,asset:result.asset,released:result.released,requestId:pending.requestId},result.rollback);
      if(!saved.ok){this._haltTradePersistence(saved.message);return null}
      if(this.tradePendingOffer===pending)this.tradePendingOffer=null;
      return result;
    } catch (error) {
      this.toast(error?.message || "交換品の復元に失敗しました。再読み込みして復旧してください");
      return null;
    }
  }

  _commitTrade(message, options = {}) {
    const tradeId = String(message?.tradeId ?? ""); if (!tradeId) return Promise.resolve(false);
    const existing = this.tradeCommitInflight.get(tradeId);
    if (existing) return existing;
    const operation = this._performTradeCommit(message, options);
    this.tradeCommitInflight.set(tradeId, operation);
    const cleanup = () => { if (this.tradeCommitInflight.get(tradeId) === operation) { this.tradeCommitInflight.delete(tradeId); this._render(); } };
    operation.then(cleanup, cleanup);
    return operation;
  }

  async _performTradeCommit(message, { recovery = false } = {}) {
    const tradeId = String(message.tradeId ?? ""); if (!tradeId) return;
    const offerOperation = this.tradeOfferInflight.get(tradeId), reconcileOperation = this.tradeReconcileInflight.get(tradeId);
    if (offerOperation) { try { await offerOperation; } catch {} }
    if (reconcileOperation) { try { await reconcileOperation; } catch {} }
    if (this.tradePersistenceBlocked) {
      this._send("tradeAck", { tradeId, success: false });
      if (recovery) this._setTradeRecoveryStatus("error", tradeId);
      return false;
    }
    const result = commitOnlineTrade(this.getState?.() ?? {}, tradeId, message.incomingAsset, { partnerId: message.partnerId, partnerName: message.partnerName });
    if (result.ok) {
      const saved=result.duplicate?{ok:true}:await this._persistTradeMutation({ kind: "tradeCommit", tradeId, received: result.received, gave: result.gave },result.rollback);
      if(!saved.ok){this._send("tradeAck",{tradeId,success:false});if(recovery)this._setTradeRecoveryStatus("error",tradeId);this._haltTradePersistence(saved.message||"交換品を保存できませんでした");return false}
      const acknowledged = this._send("tradeAck", { tradeId, success: true });
      if (recovery) this._setTradeRecoveryStatus(acknowledged ? "complete" : "saved", tradeId);
      if (!result.duplicate) this.toast(recovery ? `${result.received?.name || "交換品"}を安全に復旧しました` : `${result.received?.name || "交換品"}を受け取りました`);
      return true;
    } else {
      this._send("tradeAck", { tradeId, success: false });
      if (recovery) this._setTradeRecoveryStatus("error", tradeId);
      this.toast(result.message || "交換品を保存できませんでした");
      return false;
    }
  }

  _finishTrade(tradeId, options = {}) {
    const id = String(tradeId ?? ""); if (!id) return Promise.resolve(false);
    const existing = this.tradeFinishInflight.get(id);
    if (existing) return existing;
    const operation = this._performTradeFinish(id, options);
    this.tradeFinishInflight.set(id, operation);
    const cleanup = () => { if (this.tradeFinishInflight.get(id) === operation) { this.tradeFinishInflight.delete(id); this._render(); } };
    operation.then(cleanup, cleanup);
    return operation;
  }

  async _performTradeFinish(tradeId, { cancelled = false, completed = false, reason = "" } = {}) {
    const id = String(tradeId ?? "");
    if(this.trade?.tradeId&&String(this.trade.tradeId)!==id&&!this.getState?.()?.onlineParty?.tradeEscrow?.[id])return;
    for (const operation of [this.tradeOfferInflight.get(id), this.tradeReconcileInflight.get(id), this.tradeCommitInflight.get(id)]) {
      if (operation) { try { await operation; } catch {} }
    }
    if (cancelled && this.terminalTradeRecoveries.has(id)) {
      this._setTradeRecoveryStatus("pending", id);
      this.toast("交換の安全な復旧を続けています");
      return;
    }
    if (cancelled) {
      const result = releaseOnlineTradeAsset(this.getState?.() ?? {}, tradeId);
      if(!result.ok){this._haltTradePersistence(result.message);return}
      if (result.asset) {const saved=await this._persistTradeMutation({ kind: "tradeRelease", tradeId, asset: result.asset },result.rollback);if(!saved.ok){this._clearTradeUi();this._haltTradePersistence(saved.message);return}}
      this.toast(reason === "declined" ? "交換は辞退されました" : reason === "timeout" ? "交換が時間切れになりました" : "交換を終了しました");
    } else if (completed) {
      if (this.terminalTradeRecoveries.has(id)) this._setTradeRecoveryStatus("complete", id);
      this.toast("交換が完了しました");
    }
    if (!this.trade || this.trade.tradeId === tradeId) this._clearTradeUi();
    this._render();
  }

  _clearTradeUi() {
    this.trade = null; this.tradePendingOffer = null; this.tradeFilter = "all"; this.tradeQuery = ""; this.tradeDraftRef = ""; this.tradeAmount = "1"; this.tradeConfirmAvailableAt = 0;
    this.tradeReconcileSequence = (Number(this.tradeReconcileSequence) || 0) + 1;
    this.tradeReconcilePending = false;
    clearTimeout(this.tradeConfirmTimer); this.tradeConfirmTimer = null;
  }

  _setTradeRecoveryStatus(status, tradeId) {
    clearTimeout(this.tradeRecoveryTimer); this.tradeRecoveryTimer = null;
    this.tradeRecoveryStatus = { status, tradeId: String(tradeId ?? "") };
    this._renderTradeRecoveryStatus();
    if (status === "complete") this.tradeRecoveryTimer = setTimeout(() => {
      this.tradeRecoveryTimer = null; this.tradeRecoveryStatus = null; this._renderTradeRecoveryStatus();
    }, 4200);
  }

  _renderTradeRecoveryStatus() {
    const host = this.root; if (!host) return;
    host.querySelector("[data-online-trade-recovery-status]")?.remove();
    const recovery = this.tradeRecoveryStatus; if (!recovery) return;
    const copy = recovery.status === "pending" ? ["交換を安全に復旧しています", "受取処理が終わるまで画面を閉じないでください"]
      : recovery.status === "complete" ? ["交換の復旧が完了しました", "交換品は所持品へ安全に保存されました"]
        : recovery.status === "saved" ? ["交換品を保存しました", "再接続後にサーバーの完了確認を行います"]
          : ["交換の復旧確認中", "再接続すると安全に再試行します"];
    const node = document.createElement("aside");
    node.className = `online-trade-recovery-status ${recovery.status}`;
    node.dataset.onlineTradeRecoveryStatus = "1";
    node.setAttribute("role", "status"); node.setAttribute("aria-live", "assertive"); node.setAttribute("aria-atomic", "true");
    const strong = document.createElement("strong"), span = document.createElement("span");
    strong.textContent = copy[0]; span.textContent = copy[1]; node.append(strong, span); host.appendChild(node);
  }

  async _exchangeRaidReward(kind, cost) {
    if (this.raidExchangePending) return;
    this.raidExchangePending = kind; this._render();
    try { const result = await this.onRaidExchange(kind, cost); this.toast(result?.message || (result?.ok ? "交換報酬を受け取りました" : "交換できませんでした")); }
    finally { this.raidExchangePending = null; this._render(); }
  }

  _raidWorldSnapshot() { const source = this.getState?.()?.onlineParty?.raidWorld; return source && typeof source === "object" ? JSON.parse(JSON.stringify(source)) : null; }

  _syncRaidWorld(raidWorld) {
    const signature = JSON.stringify(raidWorld ?? null); if (signature === this.lastRaidWorldSignature) return;
    this.lastRaidWorldSignature = signature; this.onRaidWorldUpdate({ raidWorld: raidWorld ?? null });
  }

  _applyHostWorldDelta(message) {
    const ownerId = this._explicitWorldOwnerId(message);
    const mutationId = String(message.mutationId ?? "").slice(0, 160), acknowledge = () => { if (mutationId && this.capabilities.has("hostWorldReceiptsV1")) this._send("hostWorldDeltaAck", { mutationId }); };
    if (!ownerId || ownerId !== this.selfId) { acknowledge(); return { ok: true, ignored: true, guest: true }; }
    const revision = Math.max(0, Math.floor(Number(message.revision) || 0)), eventKey = `${ownerId}:${revision || JSON.stringify(message.delta ?? {})}`;
    if ((revision && revision <= this.hostWorldRevision) || this.processedHostWorldDeltas.has(eventKey)) { acknowledge(); return; }
    const hostWorld = message.hostWorld && typeof message.hostWorld === "object" ? JSON.parse(JSON.stringify(message.hostWorld)) : this._hostWorldSnapshot(), delta = message.delta ?? {}; hostWorld.revision = Math.max(Number(hostWorld.revision) || 0, revision);
    if (delta.openedChest) { const floor = String(Math.max(1, Number(delta.openedChest.floor) || 1)), chestId = String(delta.openedChest.chestId ?? ""); hostWorld.openedChestIds[floor] ??= []; if (chestId && !hostWorld.openedChestIds[floor].includes(chestId)) hostWorld.openedChestIds[floor].push(chestId); }
    if (delta.floorSeed) { const floor = String(Math.max(1, Number(delta.floorSeed.floor) || 1)); hostWorld.floorSeeds ??= {}; hostWorld.floorSeeds[floor] = delta.floorSeed.seed; }
    if (delta.defeatedBoss) { const floor = Number(delta.defeatedBoss.floor); hostWorld.defeatedBossFloors = normalizedCampaignFloors(hostWorld.defeatedBossFloors); if (Number.isInteger(floor) && floor >= CAMPAIGN_FLOOR_MIN && floor <= CAMPAIGN_FLOOR_MAX && !hostWorld.defeatedBossFloors.includes(floor)) hostWorld.defeatedBossFloors.push(floor); }
    if (delta.claimedBossReward) { const floor = Number(delta.claimedBossReward.floor); hostWorld.claimedBossRewardFloors = normalizedCampaignFloors(hostWorld.claimedBossRewardFloors); if (Number.isInteger(floor) && floor >= CAMPAIGN_FLOOR_MIN && floor <= CAMPAIGN_FLOOR_MAX && !hostWorld.claimedBossRewardFloors.includes(floor)) hostWorld.claimedBossRewardFloors.push(floor); }
    if (delta.campaignFloorState) { const floor = Number(delta.campaignFloorState.floor); hostWorld.campaignFloorStates = normalizedCampaignFloorStates(hostWorld.campaignFloorStates); if (Number.isInteger(floor) && floor >= CAMPAIGN_FLOOR_MIN && floor <= CAMPAIGN_FLOOR_MAX) hostWorld.campaignFloorStates[String(floor)] = normalizedCampaignFloorState(delta.campaignFloorState.state); }
    hostWorld.campaignFloorStates = normalizedCampaignFloorStates(hostWorld.campaignFloorStates);
    const result = this.onHostWorldUpdate({ kind: "hostWorldSnapshot", hostWorld, ownerId, revision }); if (!result?.ok) { this.recoverySettlementFailed = true; return result; }
    this.hostWorldRevision = Math.max(this.hostWorldRevision, revision); this.processedHostWorldDeltas.add(eventKey); if (this.processedHostWorldDeltas.size > 256) this.processedHostWorldDeltas.delete(this.processedHostWorldDeltas.values().next().value); acknowledge();
  }

  _applyExpeditionVitals(message) {
    if (message.playerId && message.playerId !== this.selfId) return;
    const rosterVitals = normalizedRosterVitals(message.rosterVitals);
    const primaryVitals = rosterVitals.find(entry => entry.isPrimary)
      ?? rosterVitals.find(entry => entry.monsterId === message.monsterId)
      ?? rosterVitals[0]
      ?? null;
    const monsterId = cleanSocialText(message.monsterId || primaryVitals?.monsterId || this.selectedMonsterId, 120).trim();
    const hp = Math.max(0, Number(message.hp ?? primaryVitals?.hp) || 0);
    const mp = Math.max(0, Number(message.mp ?? primaryVitals?.mp) || 0);
    const rosterSignature = rosterVitals.map(entry => `${entry.monsterId}:${entry.hp}:${entry.mp}`).join(",");
    const fallbackMutationId = `${this.roomId || "room"}:${this.roomState?.expedition?.id || "run"}:${monsterId}:${hp}:${mp}:${message.reason || "sync"}:${rosterSignature}`;
    const mutationId = String(message.mutationId || fallbackMutationId).slice(0, 160), result = this.onOnlineVitalsUpdate({ mutationId, monsterId, hp, mp, rosterVitals });
    if (result?.ok && this.capabilities.has("expeditionResultsV1")) this._send("expeditionVitalsAck", { mutationId });
    else if (!result?.ok) this.recoverySettlementFailed = true;
    return result;
  }

  _applyBattleDefeated(message) {
    const eventId = String(message.eventId ?? message.id ?? ""); if (!eventId) return;const acknowledge=()=>{if(this.capabilities.has("battleRecordsV1"))this._send("battleDefeatedAck",{eventId})};if(this.processedBattleEvents.has(eventId)){acknowledge();return}
    const worldOwnerId=this._explicitWorldOwnerId(message),floorBoss=message.floorBoss===true,progressionEligible=floorBoss&&message.progressionEligible===true&&Boolean(worldOwnerId)&&worldOwnerId===this.selfId;
    const result=this.onBattleDefeated({ eventId, monsterId: message.monsterId || this.selectedMonsterId, floor: Math.max(1, Number(message.floor) || 1), boss: Boolean(message.boss), floorBoss, worldOwnerId, progressionEligible, defeated: Array.isArray(message.defeated) ? message.defeated : [] });if(result?.ok===false){this.recoverySettlementFailed=true;return}
    this.processedBattleEvents.add(eventId); if (this.processedBattleEvents.size > 256) this.processedBattleEvents.delete(this.processedBattleEvents.values().next().value);acknowledge();
  }

  _exploreUiSignature(room) {
    const expedition = room?.expedition;
    if (room?.phase !== "expedition" || !expedition || expedition.battle) return "";
    const interaction = expedition.interactions?.[this.selfId] ?? null;
    const rare = expedition.coop?.rare ?? null;
    const resonance = expedition.coop?.resonance ?? null;
    return JSON.stringify({
      expedition: expedition.id ?? null,
      leader: room.leaderId ?? null,
      floor: Number(expedition.floor) || 0,
      realm: Boolean(rare?.realmActive),
      exitReached: Boolean(expedition.exitReached),
      progress: [Number(expedition.discoveries) || 0, Number(expedition.encountersCleared) || 0, Number(expedition.totalDiscoveries) || 0, Number(expedition.totalEncounters) || 0],
      interaction: interaction ? [interaction.action ?? "", interaction.targetId ?? "", interaction.label ?? "", interaction.hint ?? ""] : null,
      resonance: [Number(resonance?.level) || 0, Number(expedition.coop?.ownerReconnectDeadline) || 0],
      rare: rare ? [rare.kind ?? "", rare.id ?? "", rare.phase ?? "", rare.merchantClaims?.[this.selfId] ?? null] : null,
      members: (room.members ?? []).map(member => {
        const vitals = member.coopVitals ?? member.profile?.battleStats ?? {};
        return [member.playerId, Boolean(member.connected), Boolean(member.isLeader), Number(vitals.hp) || 0, Number(vitals.maxHp) || 0, Number(vitals.mp) || 0, Number(vitals.maxMp) || 0];
      }),
    });
  }

  _applyRoomState(room, { reconnected = false } = {}) {
    if (!room?.roomId) return false;
    if (room.phase === "resonance") {
      room = { ...room, phase: "lobby", resonance: null };
      this.route = "explore";
      storageSet(ONLINE_STORAGE_KEYS.route, "explore");
    }
    // Restore/capture the local progression guard before any authoritative
    // expedition callback runs.  This order is essential when ownership moves
    // from this player being a guest to becoming the room's world owner.
    if (!this._syncGuestProgressIsolation(room, { reconnected })) {
      this.recoverySettlementFailed = true;
      this._setStatus("error", "本編進行を保護できません", "オンライン部屋から離れ、再読み込みすると保護済みの進行を復元します");
      this.toast("本編進行を安全に分離できないため、部屋への参加を中止しました");
      this._send("leaveRoom");
      return false;
    }
    const hiddenSocialIds = this._hiddenSocialIds();
    if (Array.isArray(room.chatHistory) && hiddenSocialIds.size) room = { ...room, chatHistory: room.chatHistory.filter(entry => !hiddenSocialIds.has(normalizedPlayerId(entry?.playerId))) };
    const recruitmentJoinCompleted = this.guildPending?.kind === "recruitmentJoin"
      && Boolean(this.guildPending.targetId)
      && room.leaderId === this.guildPending.targetId;
    this.pendingRoomJoinId = null;
    this.roomListingPending = false;
    if (!room.members?.some(member => member.playerId === this.roomMemberRemovalPendingId)) this.roomMemberRemovalPendingId = null;
    const previousRoom = this.roomState;
    const previousCount = this.roomState?.chatHistory?.length ?? 0;
    const hadInteractionPending = Boolean(this.interactionPending);
    const keepExploreCanvas = this.exploreCanvasMounted
      && this.route === "explore"
      && previousRoom?.phase === "expedition"
      && !previousRoom?.expedition?.battle
      && room.phase === "expedition"
      && !room.expedition?.battle
      && this._exploreUiSignature(previousRoom) === this._exploreUiSignature(room)
      && !hadInteractionPending;
    const rareKind = room?.expedition?.coop?.rare?.kind;
    const merchantClaim = rareKind === "otherworldMerchant" ? room?.expedition?.coop?.rare?.merchantClaims?.[this.selfId] : null;
    if (this.merchantPending && merchantClaim) { clearTimeout(this.merchantPendingTimer); this.merchantPendingTimer = null; this.merchantPending = false; this.merchantResult = { offer: merchantClaim, status: "success" }; }
    if (rareKind !== "otherworldMerchant") { this.rareMerchantOpen = false; this.merchantPending = false; this.merchantResult = null; clearTimeout(this.merchantPendingTimer); this.merchantPendingTimer = null; }
    this._clearInteractionPending(false);
    this.roomState = room; this.roomId = room.roomId;
    this._syncActiveExpeditionRun(room);
    const hallGame = room.hallGame, hallParticipant = hallGame?.participants?.some?.(entry => entry.playerId === this.selfId);
    if (hallGame?.game) this.hallGameTab = hallGame.game === "race" ? "race" : "mimic";
    if (hallParticipant && !["entry", "result"].includes(String(hallGame?.phase ?? ""))) this.hallGamesOpen = true;
    if (room.phase !== "lobby") this.hallGamesOpen = false;
    if (recruitmentJoinCompleted) {
      this._clearGuildPending();
      this.friendPanelOpen = false;
      this.toast("ギルド募集の部屋へ参加しました");
    }
    const worldOwnerId = this._canonicalRoomOwnerId(room);
    if (room.phase === "expedition" && worldOwnerId === this.selfId) this._commitAuthoritativeSecretRoomRun(room.hostWorld?.secretRooms?.run);
    // A null room snapshot means the server has not imported this owner's saved
    // raid yet.  Only an explicit raid victory is allowed to clear local progress.
    if (worldOwnerId === this.selfId && room.raidProgress) this._syncRaidWorld(room.raidProgress);
    if (worldOwnerId === this.selfId && room.hostWorld) { const revision = Math.max(0, Number(room.hostWorld.revision) || 0), signature = JSON.stringify(room.hostWorld); if (revision > this.hostWorldRevision || !revision && signature !== this.lastHostWorldSnapshotSignature) { const result = this.onHostWorldUpdate({ kind: "hostWorldSnapshot", hostWorld: room.hostWorld, ownerId: this.selfId, revision }); if (result?.ok) { this.hostWorldRevision = Math.max(this.hostWorldRevision, revision); this.lastHostWorldSnapshotSignature = signature; } } }
    if (room?.expedition?.interactions?.[this.selfId]?.action !== "browseRareMerchant" && !this.merchantResult) this.rareMerchantOpen = false;
    if (room.phase === "expedition") this.route = "explore";
    else if (room.phase === "raid") this.route = "raid";
    else if (room.phase === "team") this.route = "team";
    if (this.route !== "chat" && (room.chatHistory?.length ?? 0) > previousCount && previousCount > 0) this.unread = Math.min(99, this.unread + (room.chatHistory.length - previousCount));
    this._showConnectionStep("room");
    if (keepExploreCanvas) {
      this._queueExploreCanvasUpdate({ chatBubbles: this._chatBubbleSnapshot(), pings: this._pingSnapshot(), socialBubbles: this._socialBubbleSnapshot() });
      return true;
    }
    this._render();
    return true;
  }

  _self() { return this.roomState?.members?.find(member => member.playerId === this.selfId); }

  _safetyProfile(value) {
    const playerId = normalizedPlayerId(value);
    if (!playerId || playerId === this.selfId) return null;
    const sources = [
      ...(this.friendState?.friends ?? []), ...(this.friendState?.incoming ?? []), ...(this.friendState?.outgoing ?? []),
      ...(this.friendState?.blocked ?? []), ...(this.friendState?.muted ?? []), ...(this.guildState?.guild?.members ?? []),
    ];
    const source = sources.find(entry => entry?.playerId === playerId);
    const member = this.roomState?.members?.find(entry => entry?.playerId === playerId);
    return normalizeMutedPlayer(source ?? (member ? { playerId, ...member.profile } : null) ?? { playerId });
  }

  _mutedPlayerSnapshot() {
    const unique = new Map();
    for (const raw of (Array.isArray(this.friendState?.muted) ? this.friendState.muted : [])) {
      const entry = normalizeMutedPlayer(raw);
      if (entry && entry.playerId !== this.selfId) unique.set(entry.playerId, entry);
    }
    return [...unique.values()].slice(0, MUTED_PLAYER_LIMIT);
  }

  _blockedPlayerIds() {
    return new Set((Array.isArray(this.friendState?.blocked) ? this.friendState.blocked : []).map(entry => normalizedPlayerId(entry?.playerId)).filter(Boolean));
  }

  _hiddenSocialIds() {
    return new Set([...this._mutedPlayerSnapshot().map(entry => entry.playerId), ...this._blockedPlayerIds()]);
  }

  _guildStateForDisplay() {
    const guild = this.guildState?.guild;
    if (!guild) return this.guildState;
    const hidden = this._hiddenSocialIds(), blocked = this._blockedPlayerIds();
    return { ...this.guildState, guild: {
      ...guild,
      chat: (guild.chat ?? []).filter(entry => !hidden.has(normalizedPlayerId(entry?.playerId))),
      recruitments: (guild.recruitments ?? []).filter(entry => !blocked.has(normalizedPlayerId(entry?.host?.playerId))),
      plans: (guild.plans ?? []).map(entry => blocked.has(normalizedPlayerId(entry?.gathering?.hostPlayerId)) ? { ...entry, gathering: null } : entry),
    } };
  }

  _isSocialHidden(playerId) {
    const id = normalizedPlayerId(playerId);
    return Boolean(id && id !== this.selfId && this._hiddenSocialIds().has(id));
  }

  _purgePlayerSocial(value) {
    const playerId = normalizedPlayerId(value);
    if (!playerId || playerId === this.selfId) return;
    this.chatBubbles.delete(playerId);
    this.socialBubbles.delete(playerId);
    for (const [pingId, ping] of this.coopPings) if (normalizedPlayerId(ping?.playerId) === playerId) this.coopPings.delete(pingId);
    if (this.roomState?.chatHistory) {
      const before = this.roomState.chatHistory.length;
      this.roomState.chatHistory = this.roomState.chatHistory.filter(entry => normalizedPlayerId(entry?.playerId) !== playerId);
      this.unread = Math.max(0, this.unread - Math.max(0, before - this.roomState.chatHistory.length));
    }
    if (this.guildState?.guild?.chat) this.guildState = { ...this.guildState, guild: { ...this.guildState.guild, chat: this.guildState.guild.chat.filter(entry => normalizedPlayerId(entry?.playerId) !== playerId) } };
  }

  _purgeHiddenSocial() {
    for (const playerId of this._hiddenSocialIds()) this._purgePlayerSocial(playerId);
  }

  _refreshSafetyViews() {
    if (this.roomState && !this.exploreCanvasMounted) { this._render(); return; }
    if (this.exploreCanvasMounted) this.onExploreCanvasUpdate(this.roomState, this.selfId, { chatBubbles: this._chatBubbleSnapshot(), pings: this._pingSnapshot(), socialBubbles: this._socialBubbleSnapshot() });
    this._renderFriendPanel();
  }

  _setPlayerMuted(value, muted) {
    const profile = this._safetyProfile(value);
    if (!profile) { this.toast("相手を確認できませんでした"); return false; }
    if (!this.capabilities.has("onlineSafetyV1")) { this.toast("このサーバーは安全設定に未対応です"); return false; }
    if (!this._canMutateOnline()) { this._announceConnectionPause(); return false; }
    const sent = this._send(muted ? "friendMute" : "friendUnmute", { targetId: profile.playerId });
    if (sent && muted) { this._purgePlayerSocial(profile.playerId); this._refreshSafetyViews(); }
    return sent;
  }

  _normalizeFriendState(source) {
    const safe = list => (Array.isArray(list) ? list : []).slice(0, 200).map(entry => ({ ...entry, playerId: String(entry?.playerId ?? "").slice(0, 20), displayName: String(entry?.displayName ?? "冒険者").slice(0, 16), monsterName: String(entry?.monsterName ?? "仲間").slice(0, 32), fallbackEmoji: String(entry?.fallbackEmoji ?? "魔").slice(0, 8), online: Boolean(entry?.online), roomJoinable: Boolean(entry?.roomJoinable), roomId: entry?.roomId ? safeRoomId(entry.roomId) : null }));
    const privateSafe = list => (Array.isArray(list) ? list : []).slice(0, 200).map(normalizeMutedPlayer).filter(Boolean);
    return { friends: safe(source?.friends), incoming: safe(source?.incoming), outgoing: safe(source?.outgoing), blocked: privateSafe(source?.blocked), muted: privateSafe(source?.muted), invites: (Array.isArray(source?.invites) ? source.invites : []).slice(0, 20).map(entry => ({ inviteId: String(entry?.inviteId ?? "").slice(0, 96), roomId: safeRoomId(entry?.roomId), expiresAt: Math.max(0, Number(entry?.expiresAt) || 0), from: safe([entry?.from])[0] })) };
  }

  _refreshHallSocialNotice(summary) {
    const zone = this._query('.online-hall-zone[data-online-hall-destination="social"]');
    if (!zone) return;
    const badge = Math.max(0, Number(summary?.badge) || 0);
    const attentionCount = Math.max(0, Number(summary?.attentionCount) || 0);
    let notice = zone.querySelector("[data-online-hall-social-notice]");
    if (!notice) {
      notice = zone.ownerDocument.createElement("span");
      notice.className = "online-hall-social-notice";
      notice.dataset.onlineHallSocialNotice = "1";
      notice.setAttribute("aria-hidden", "true");
      zone.appendChild(notice);
    }
    notice.replaceChildren();
    if (attentionCount) {
      const attention = zone.ownerDocument.createElement("span");
      attention.textContent = "遠征";
      notice.appendChild(attention);
    }
    if (badge) {
      const count = zone.ownerDocument.createElement("span");
      count.textContent = `${Math.min(9, badge)}${badge > 9 ? "+" : ""}`;
      notice.appendChild(count);
    }
    notice.hidden = !badge && !attentionCount;
    zone.setAttribute("aria-label", `交流所へ移動${badge || attentionCount ? `。${badge ? `お知らせ${badge}件` : ""}${badge && attentionCount ? "、" : ""}${attentionCount ? "遠征あり" : ""}` : ""}`);
  }

  _renderFriendPanel() {
    this._clearGuildPlanTransitionTimer();
    const layer = this._query("[data-online-friend-layer]"); if (!layer) return;
    const active = typeof document !== "undefined" && layer.contains(document.activeElement) ? document.activeElement : null;
    const focusKey = cleanSocialText(active?.dataset?.onlineSocialFocusKey, 160);
    const focusSelector = active ? SOCIAL_FOCUS_SELECTORS.find(selector => active.matches?.(selector)) ?? "" : "";
    const selection = (focusKey || focusSelector) && Number.isFinite(active?.selectionStart) ? { start: active.selectionStart, end: active.selectionEnd } : null;
    const content = layer.querySelector(".online-social-content"), chat = layer.querySelector("[data-online-guild-chat-log]");
    const renderedTab = content?.dataset?.onlineSocialContentTab === "guild" ? "guild" : content ? "friends" : null;
    if (renderedTab) this.socialScrollByTab[renderedTab] = content.scrollTop;
    if (chat) this.guildChatScroll = { top: chat.scrollTop, atBottom: chat.scrollHeight - chat.clientHeight - chat.scrollTop <= 12 };
    const showSocialFab = shouldShowOnlineSocialFab({ connectionStep: this.connectionStep, route: this.route });
    if (!showSocialFab) this.friendPanelOpen = false;
    const hallFacilityMode = this.connectionStep === "room" && this.route === "home";
    const safetyCapability = this.capabilities.has("onlineSafetyV1"), mutedPlayers = this._mutedPlayerSnapshot(), guildState = this._guildStateForDisplay();
    const socialNow = this._guildNow(), liveGatheringJoinable = this._canMutateOnline() && !this.trade && (!this.roomState || this.roomState.phase === "lobby");
    const socialNotice = onlineSocialNotificationSummary(this.friendState, guildState, { now: socialNow, selfId: this.selfId, connected: this._canMutateOnline(), canJoinGathering: liveGatheringJoinable });
    layer.innerHTML = renderOnlineFriendPanel(this.friendState, {
      open: this.friendPanelOpen, selfId: this.selfId, draft: this.friendIdDraft, tab: this.socialTab, guildState,
      showFab: showSocialFab,
      hallFacilityMode,
      safetyCapability, mutedPlayers,
      guildOptions: {
        connected: this._canMutateOnline(), capability: this.capabilities.has("guildsV1"), disabled: Boolean(this.pendingLeaveOnReconnect),
        now: socialNow,
        liveGatheringJoinable,
        recruitmentCapability: this.capabilities.has("guildPartyRecruitmentV1"), roomState: this.roomState,
        planCapability: this.capabilities.has("guildPlansV1"), plansExpanded: this.guildPlansExpanded, planComposerOpen: this.guildPlanComposerOpen,
        planGatheringCapability: this.capabilities.has("guildPlanGatheringV1"),
        activityCapability: this.capabilities.has("guildActivityHistoryV1"), activitiesExpanded: this.guildActivitiesExpanded, safetyCapability,
        pending: this.guildPending, status: this.guildStatus, guildIdDraft: this.guildLookupDraft,
        createDraft: this.guildCreateDraft, chatDraft: this.guildChatDraft, planDraft: this.guildPlanDraft, recruitmentDraft: this.guildRecruitmentDraft, friends: this.friendState.friends,
      },
    });
    this._refreshHallSocialNotice(socialNotice);
    const page = this._query(".online-v3-page"); if (page) page.inert = this.friendPanelOpen;
    const nextContent = layer.querySelector(".online-social-content"), nextChat = layer.querySelector("[data-online-guild-chat-log]");
    if (nextContent) nextContent.scrollTop = this.socialScrollByTab[this.socialTab] ?? 0;
    if (nextChat) nextChat.scrollTop = this.guildChatScroll.atBottom ? nextChat.scrollHeight : this.guildChatScroll.top;
    if (focusKey || focusSelector) requestAnimationFrame(() => {
      if (!this.mounted) return;
      if (!this.friendPanelOpen) {
        let closedTarget = focusSelector ? layer.querySelector(focusSelector) : null;
        closedTarget ??= layer.querySelector("[data-online-friends-toggle]");
        if (!closedTarget || closedTarget.disabled) return;
        try { closedTarget.focus({ preventScroll: true }); } catch { closedTarget.focus(); }
        return;
      }
      let target = focusKey ? [...layer.querySelectorAll("[data-online-social-focus-key]")].find(entry => entry.dataset.onlineSocialFocusKey === focusKey) : null;
      target ??= focusSelector ? layer.querySelector(focusSelector) : null;
      if (!target || target.disabled) target = layer.querySelector(`[data-online-social-tab="${this.socialTab}"]`);
      if (!target) return;
      try { target.focus({ preventScroll: true }); } catch { target.focus(); }
      if (selection && typeof target.setSelectionRange === "function") target.setSelectionRange(Math.min(selection.start, target.value.length), Math.min(selection.end, target.value.length));
    });
    this._scheduleGuildPlanTransitionRender();
  }

  _clearGuildPlanTransitionTimer() {
    clearTimeout(this.guildPlanTransitionTimer);
    this.guildPlanTransitionTimer = null;
  }

  _scheduleGuildPlanTransitionRender() {
    this._clearGuildPlanTransitionTimer();
    if (!this.mounted || !this.connectionReady) return;
    const background = !this.friendPanelOpen || this.socialTab !== "guild";
    if (background && !this.capabilities.has("guildPlansV1")) return;
    const now = this._guildNow(), boundaries = [];
    for (const plan of (Array.isArray(this.guildState?.guild?.plans) ? this.guildState.guild.plans : [])) {
      for (const value of [plan?.gatherOpensAt, plan?.gatherClosesAt, plan?.gathering?.expiresAt]) {
        if (Number.isSafeInteger(value) && value > now) boundaries.push(value);
      }
    }
    if (!boundaries.length) return;
    const boundary = Math.min(...boundaries);
    const delay = Math.min(GUILD_PLAN_TRANSITION_MAX_DELAY_MS, Math.max(GUILD_PLAN_TRANSITION_MIN_DELAY_MS, boundary - now + GUILD_PLAN_TRANSITION_SETTLE_MS));
    const timer = setTimeout(() => {
      if (this.guildPlanTransitionTimer !== timer) return;
      this.guildPlanTransitionTimer = null;
      if (!this.mounted || !this.connectionReady) return;
      if ((!this.friendPanelOpen || this.socialTab !== "guild") && !this.capabilities.has("guildPlansV1")) return;
      if (this._guildNow() < boundary) { this._scheduleGuildPlanTransitionRender(); return; }
      this._renderFriendPanel();
    }, delay);
    this.guildPlanTransitionTimer = timer;
  }

  _showConnectionStep(step) {
    const changed = this.connectionStep !== step;
    this.connectionStep = step;
    const entry = this._query("[data-online-entry]"), gate = this._query("[data-online-gate]"), room = this._query("[data-online-room]");
    if (entry) entry.hidden = step !== "entry";
    if (gate) gate.hidden = step !== "gate";
    if (room) room.hidden = step !== "room";
    if (step === "gate") this._renderRoomBoard();
    this._renderFriendPanel();
    if (changed) requestAnimationFrame(() => { const screen = this._query(".online-v3-screen"); if (screen) screen.scrollTop = 0; });
  }

  _clearRoom({ reason = "roomClear" } = {}) {
    if (!this._exitGuestProgressIsolation(reason)) {
      this.recoverySettlementFailed = true;
      this._setStatus("error", "本編進行を復元できません", "部屋情報を保持しています。再読み込みすると保護済みの進行から自動復元します");
      this.toast("本編進行の復元を保存できないため、部屋を閉じませんでした");
      return false;
    }
    this.emoteGestureCleanup?.();
    const showReturnResult = Boolean(this.pendingExpeditionReturnResult); this.roomState = null; this.roomId = null; this.pendingExpeditionStart = false; this.pendingSecretRoomRun = null; this.syncedExpeditionStartKey = ""; this._clearMoveInputs(); this._closeAllBattleMenus(); this.unread = 0; this.floorBossConfirm = null; this.coopBossConfirm = null; this.pendingFloorBossReward = null; this.rareMerchantOpen = false; this.merchantPending = false; this.merchantResult = null; this.expeditionReport = null; this.raidReport = null; this.teamBattleReport = null; this.exploreChatOpen = false; this.hallGamesOpen = false; this.pingMenuOpen = false; this.pendingRoomJoinId = null; this.roomListingPending = false; this.roomMemberRemovalPendingId = null; this.processedCoopTechniqueEvents.clear(); clearTimeout(this.merchantPendingTimer); this.merchantPendingTimer = null; this._clearInteractionPending(false); this._clearTradeUi();
    this.root?.querySelector(".online-v3-screen")?.classList.remove("online-shared-gameplay-active");
    this._unmountExploreCanvas();
    this._query("[data-online-room]")?.classList.remove("online-shared-gameplay");
    this._showConnectionStep(this.ws?.readyState === WebSocket.OPEN ? "gate" : "entry");
    if (this.ws?.readyState === WebSocket.OPEN) this._requestRoomListings({ force: true });
    if (showReturnResult) queueMicrotask(() => this._showPendingExpeditionReturnResult());
    return true;
  }

  _setStatus(kind, title, detail) {
    this.connectionStatus = { kind, title, detail };
    const node = this._query("[data-online-status]");
    if (node) {
      node.className = `online-v3-status ${kind}`;
      const b = node.querySelector("b"), span = node.querySelector("span"); if (b) b.textContent = title; if (span) span.textContent = detail;
    }
    this._syncConnectionUi();
  }

  _setRoute(route, { silent = false } = {}) {
    route = normalizedOnlineRoute(route, "");
    if (!route) return;
    if (this.trade && route !== "home") { this.toast("交換を完了または中止してから移動してください"); return; }
    this.emoteGestureCleanup?.();
    const changed = this.route !== route;
    this.route = route; storageSet(ONLINE_STORAGE_KEYS.route, route);
    if (route === "chat") this.unread = 0;
    if (route !== "home") this.hallDestination = null;
    if (!silent || changed) this._clearMoveInputs();
    this._render();
    if (changed) requestAnimationFrame(() => { const stage = this._query("[data-online-stage]"); if (stage) stage.scrollTop = 0; });
  }

  _render() {
    if (!this.roomState || !this.roomId) return;
    this._clearInactiveMoveInputs();
    const roomNode = this._query("[data-online-room-id]"), count = this._query("[data-online-member-count]");
    if (roomNode) roomNode.textContent = this.roomId; if (count) count.textContent = `${this.roomState.members?.length ?? 0} / 4`;
    this.root?.querySelectorAll("[data-online-route]").forEach(button => { button.classList.toggle("active", button.dataset.onlineRoute === this.route); button.disabled = Boolean(this.trade && button.dataset.onlineRoute !== "home"); });
    this.root?.querySelectorAll(".online-v3-nav [data-online-route]").forEach(button => {
      if (button.dataset.onlineRoute === this.route) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    const unread = this._query("[data-online-unread]"); if (unread) { unread.hidden = this.unread <= 0; unread.textContent = this.unread > 9 ? "9+" : String(this.unread); }
    const stage = this._query("[data-online-stage]"); if (!stage) return;
    const battleGameplay = this.route === "explore" && this.roomState.phase === "expedition" || this.route === "raid" && this.roomState.phase === "raid" || this.route === "team" && this.roomState.phase === "team";
    const gameplay = battleGameplay;
    this._query("[data-online-room]")?.classList.toggle("online-shared-gameplay", gameplay);
    this.root?.querySelector(".online-v3-screen")?.classList.toggle("online-shared-gameplay-active", gameplay);
    const canvasExplore = this.route === "explore" && this.roomState.phase === "expedition" && !this.roomState.expedition?.battle;
    if (this.exploreCanvasMounted) this._unmountExploreCanvas();
    const guildNow = this._guildNow();
    const guildRecruitmentLock = currentGuildRoomRecruitmentLock(this.guildState, this.roomState, guildNow);
    const mutedPlayerIds = this._mutedPlayerSnapshot().map(entry => entry.playerId), blockedPlayerIds = [...this._blockedPlayerIds()];
    const socialNotice = onlineSocialNotificationSummary(this.friendState, this._guildStateForDisplay(), {
      now: guildNow,
      selfId: this.selfId,
      connected: this._canMutateOnline(),
      canJoinGathering: this._canMutateOnline() && !this.trade && (!this.roomState || this.roomState.phase === "lobby"),
    });
    const renderedTradeId=String(this.trade?.tradeId??""),tradeOfferPending=Boolean(this.tradePendingOffer||this.tradeReconcilePending||this.tradeOfferInflight.has(renderedTradeId)||this.tradeReconcileInflight.has(renderedTradeId)||this.tradeCommitInflight.has(renderedTradeId)||this.tradeFinishInflight.has(renderedTradeId)),tradeOfferPendingLabel=this.tradePendingOffer?.status==="saving"?"保存中…":this.tradePendingOffer?.status==="sending"?"送信中…":this.tradeCommitInflight.has(renderedTradeId)?"確定保存中…":this.tradeFinishInflight.has(renderedTradeId)?"終了処理中…":tradeOfferPending?"照合中…":"";
    const state = { selectedTarget: this.selectedTarget[this.route], selectedAlly: this.selectedAlly[this.route], skillMenu: this.skillMenu[this.route], itemMenu: this.itemMenu[this.route], itemTargetMenu: this.itemTargetMenu[this.route], hpTrails: this.hpTrails[this.route], presentationKoIds: [...(this.presentationKoIds[this.route] ?? [])], raidReport: this.raidReport, teamBattleReport: this.teamBattleReport, expeditionReport: this.expeditionReport, expeditionReturnReady: Boolean(this.pendingExpeditionReturnResult), expeditionStartPending: this.pendingExpeditionStart, floorBossConfirm: this.floorBossConfirm, coopBossConfirm: this.coopBossConfirm, exploreChatOpen: this.exploreChatOpen, hallGamesOpen: this.hallGamesOpen, hallGameTab: this.hallGameTab, hallGamesSupported: this.capabilities.has("hallMinigamesV1"), merchantOpen: this.rareMerchantOpen, merchantPending: this.merchantPending, merchantResult: this.merchantResult, interactionPending: this.interactionPending, pingMenuOpen: this.pingMenuOpen, chatDraft: this.chatDraft, hudCollapsed: this.onlineHudCollapsed, gameState: this.getState?.(), socialBubbles: this._socialBubbleSnapshot(), chatBubbles: this._chatBubbleSnapshot(), socialNotice, trade: this.trade, tradeCatalog: this.trade ? this._tradeCatalog() : [], tradeFilter: this.tradeFilter, tradeQuery: this.tradeQuery, tradeDraftRef: this.tradeDraftRef, tradeDraftAsset: this.trade ? this._tradeDraftAsset() : null, tradeAmount: this.tradeAmount, tradeOfferPending, tradeOfferPendingLabel, tradeConsistent:this._tradeAdvanceAllowed(), tradeConfirmSeconds: Math.max(0, Math.ceil((this.tradeConfirmAvailableAt - Date.now()) / 1000)), raidExchangePending: this.raidExchangePending, roomListingPending: this.roomListingPending, roomMemberRemovalPendingId: this.roomMemberRemovalPendingId, guildRecruitmentActive: guildRecruitmentLock.active, guildRecruitmentLock, mutedPlayerIds, blockedPlayerIds, safetyCapability: this.capabilities.has("onlineSafetyV1") };
    state.battleAutoSupported = this.capabilities.has("battleAutoV1");
    const activeInput = stage.contains(document.activeElement) ? document.activeElement : null;
    const restoreHallChatFocus = this.route === "home" && this.hallGamesOpen
      && activeInput?.matches?.("[data-online-explore-chat-input]");
    const hallChatSelection = restoreHallChatFocus && Number.isFinite(activeInput.selectionStart)
      ? { start: activeInput.selectionStart, end: activeInput.selectionEnd }
      : null;
    stage.innerHTML = this.route === "explore" ? renderOnlineExplore(this.roomState, this.selfId, state)
      : this.route === "raid" ? renderOnlineRaid(this.roomState, this.selfId, state)
      : this.route === "team" ? renderOnlineTeam(this.roomState, this.selfId, state)
      : this.route === "chat" ? renderOnlineChat(this.roomState, this.selfId, state)
      : renderOnlineHome(this.roomState, this.selfId, state);
    if (restoreHallChatFocus) requestAnimationFrame(() => {
      const input = this._query("[data-online-explore-chat-input]");
      if (!input) return;
      input.focus({ preventScroll: true });
      if (hallChatSelection) input.setSelectionRange?.(hallChatSelection.start, hallChatSelection.end);
    });
    this._syncConnectionUi();
    this._renderTradeRecoveryStatus();
    this._renderRewardReceipt();
    if (this.route === "chat") requestAnimationFrame(() => { const log = this._query("[data-online-chat-log]"); if (log) log.scrollTop = log.scrollHeight; });
    if (this.route === "home") { this.hallNearbyRoute = this._hallNearby(this._self()?.position); requestAnimationFrame(() => this._prepareExploreEmoteAnchor()); }
    this.onScene(canvasExplore ? "explore" : gameplay ? "battle" : "home");
    if (canvasExplore) requestAnimationFrame(() => { if (!this.mounted || this.route !== "explore" || this.roomState?.expedition?.battle) return; this.exploreCanvasMounted = true; this.onExploreCanvasMount(this.roomState, this.selfId, target => this._setDestination(target), this._chatBubbleSnapshot(), this._pingSnapshot(), this._socialBubbleSnapshot()); this._bindExploreChatDrag(); });
    if (battleGameplay && !canvasExplore) requestAnimationFrame(() => this._decorateBattleState());
    this._renderFriendPanel();
  }

  _selectBattleTarget(id, side) {
    const mode = this.route;
    if (!["explore", "raid", "team"].includes(mode)) return;
    if (side === "ally") this.selectedAlly[mode] = id; else this.selectedTarget[mode] = id;
    this._render();
  }

  _battle(mode) { return mode === "raid" ? this.roomState?.raid : mode === "team" ? this.roomState?.teamBattle : this.roomState?.expedition?.battle; }

  _toggleOnlineBattleAuto(mode) {
    if (!["explore", "raid", "team"].includes(mode)) return this.toast("この戦闘では自動戦闘を利用できません");
    if (!this.capabilities.has("battleAutoV1")) return this.toast("自動戦闘を使うにはオンラインサーバーの197更新が必要です");
    const battle = this._battle(mode);
    if (!battle) return this.toast("現在は自動戦闘を切り替えられません");
    const autoPlayers = Array.isArray(battle.autoPlayers) ? battle.autoPlayers : [];
    const enabled = !autoPlayers.includes(this.selfId);
    if (battle.phase === "result" && enabled) return this.toast("現在は自動戦闘を切り替えられません");
    if (!this._send("battleAuto", { mode, enabled })) return this.toast("自動戦闘の設定を送信できませんでした");
    battle.autoPlayers = enabled ? [...new Set([...autoPlayers, this.selfId])] : autoPlayers.filter(id => id !== this.selfId);
    this._closeBattleMenus(mode);
    this._render();
  }

  _battleAction(mode, kind, skillId = null) {
    const battle = this._battle(mode); if (!battle || battle.phase !== "command") return this.toast("現在は行動を選べません");
    const actor = onlinePendingBattleActor(battle, this.selfId);
    if (!actor) {
      const living = onlineOwnedBattleActors(battle, this.selfId, { livingOnly: true });
      return this.toast(living.length ? "すべての仲間が入力済みです" : "戦闘不能中です");
    }
    if (kind === "skill" && !skillId) { this.skillMenu[mode] = !this.skillMenu[mode]; this._render(); return; }
    if (kind === "item") { this.skillMenu[mode] = false; this.itemMenu[mode] = true; this.itemTargetMenu[mode] = false; this._render(); return; }
    this._submitBattleAction(mode, kind, skillId);
  }

  _submitBattleAction(mode, kind, skillId = null) {
    const battle = this._battle(mode); if (!battle || battle.phase !== "command") return this.toast("現在は行動を選べません");
    const actor = onlinePendingBattleActor(battle, this.selfId);
    if (!actor) {
      const living = onlineOwnedBattleActors(battle, this.selfId, { livingOnly: true });
      return this.toast(living.length ? "すべての仲間が入力済みです" : "戦闘不能中です");
    }
    const actorId = onlineBattleActorId(actor), actorProfile = onlineBattleActorProfile(this.roomState, actor);
    const actorSkills = Array.isArray(actor?.skills) ? actor.skills : actorProfile?.skills ?? [];
    const skill = actorSkills.find(entry => entry.id === skillId);
    if (kind === "skill" && !skill) return this.toast("設定済みスキルを確認できませんでした");
    if (kind === "skill") {
      const remaining = Math.max(0, Number(actor?.cooldowns?.[skill.id]) || 0);
      if (remaining > 0) return this.toast(`このスキルはあと${remaining}ターン使用できません`);
      if (Number(actor?.mp) < Math.max(0, Number(skill.mp) || 0)) return this.toast("MPが足りません");
    }
    const support = kind === "item" || kind === "skill" && skill?.kind !== "attack";
    const actors = Array.isArray(battle.players) ? battle.players : [], allies = mode === "team" ? actors.filter(entry => entry?.side === actor?.side) : actors;
    const selectedAlly = allies.some(entry => onlineBattleActorId(entry) === this.selectedAlly[mode]) ? this.selectedAlly[mode] : actorId;
    const teamEnemies = mode === "team" ? actors.filter(entry => entry?.side !== actor?.side && Number(entry?.hp) > 0) : [];
    const raidEnemies = mode === "raid" ? [battle.boss, ...(battle.minions ?? [])].filter(entry => entry && Number(entry.hp) > 0) : [];
    const exploreEnemies = mode === "explore" ? (battle.enemies ?? []).filter(entry => Number(entry?.hp) > 0) : [];
    const enemyTarget = mode === "raid" ? (raidEnemies.some(entry => entry.id === this.selectedTarget.raid) ? this.selectedTarget.raid : raidEnemies[0]?.id)
      : mode === "team" ? (teamEnemies.some(entry => onlineBattleActorId(entry) === this.selectedTarget.team) ? this.selectedTarget.team : onlineBattleActorId(teamEnemies[0]))
        : exploreEnemies.some(entry => entry.id === this.selectedTarget.explore) ? this.selectedTarget.explore : exploreEnemies[0]?.id;
    let sent;
    if (mode === "raid") sent = this._send("raidAction", { actorId, kind, skillId, targetId: selectedAlly, enemyTargetId: enemyTarget });
    else if (mode === "team") sent = this._send("teamAction", { actorId, kind, skillId, targetId: support ? selectedAlly : enemyTarget });
    else sent = this._send("battleAction", { actorId, kind, skillId, targetId: support ? selectedAlly : enemyTarget });
    if (sent) { battle.actions ??= {}; battle.actions[actorId] = { actorId, kind, skillId, pending: true }; this._closeBattleMenus(mode); this._render(); }
  }

  _closeBattleMenus(mode) { if (this.skillMenu) this.skillMenu[mode] = false; if (this.itemMenu) this.itemMenu[mode] = false; if (this.itemTargetMenu) this.itemTargetMenu[mode] = false; }

  _closeAllBattleMenus() { for (const mode of ["explore", "raid", "team"]) this._closeBattleMenus(mode); }

  _queueExploreCanvasUpdate(options = {}) {
    this.pendingExploreCanvasUpdate = { ...(this.pendingExploreCanvasUpdate ?? {}), ...options };
    if (this.exploreCanvasUpdateFrame != null) return;
    this.exploreCanvasUpdateFrame = requestAnimationFrame(() => {
      this.exploreCanvasUpdateFrame = null;
      const pending = this.pendingExploreCanvasUpdate ?? {};
      this.pendingExploreCanvasUpdate = null;
      if (!this.exploreCanvasMounted || !this.roomState) return;
      this.onExploreCanvasUpdate(this.roomState, this.selfId, pending);
    });
  }

  _unmountExploreCanvas() {
    if (this.exploreCanvasUpdateFrame != null) cancelAnimationFrame(this.exploreCanvasUpdateFrame);
    this.exploreCanvasUpdateFrame = null;
    this.pendingExploreCanvasUpdate = null;
    if (!this.exploreCanvasMounted) return;
    this.exploreCanvasMounted = false;
    this.onExploreCanvasUnmount();
  }

  _announceExpeditionEvent(event) {
    if (!event) return;
    const battleActor = this.roomState?.expedition?.battle?.players?.find(entry => onlineBattleActorId(entry) === String(event.actorId ?? ""));
    const actorProfile = battleActor ? onlineBattleActorProfile(this.roomState, battleActor) : null;
    const actor = actorProfile?.monsterName || this.roomState?.members?.find(member => member.playerId === event.actorId)?.profile?.displayName;
    const message = event.kind === "chest" || event.kind === "bone" || event.kind === "shrine" ? `${actor || "仲間"}が、${event.message}` : event.message || event.title;
    if (message) this.toast(message);
    if (event.kind === "splitKey" && String(event.id ?? event.message ?? "").includes("key-complete")) this._playKeyFusion();
  }

  _battlePresentationSpeed(mode) {
    return onlineBattlePresentationSpeed(this._battle(mode)?.speed);
  }

  _schedulePresentation(callback, delay, speed = 1) {
    this.presentationTimers ??= new Set();
    const timer = setTimeout(() => {
      this.presentationTimers.delete(timer);
      callback();
    }, onlineBattlePresentationDelay(delay, speed));
    this.presentationTimers.add(timer);
    return timer;
  }

  _clearPresentationTimers() {
    for (const timer of this.presentationTimers ?? []) clearTimeout(timer);
    this.presentationTimers?.clear();
  }

  _playKeyFusion() {
    const stage = this._query(".explore-stage") ?? this._query("[data-online-stage]");
    if (!stage) return;
    stage.querySelector(".online-key-fusion-fx")?.remove();
    const fx = document.createElement("div");
    fx.className = "online-key-fusion-fx";
    fx.setAttribute("aria-live", "polite");
    fx.innerHTML = `<div class="online-key-fusion-pieces"><img class="cyan" src="./assets/online/coop/keys/key-fragment-cyan.png?v=2.11.44-build209" alt=""><img class="violet" src="./assets/online/coop/keys/key-fragment-violet.png?v=2.11.44-build209" alt=""><img class="combined" src="./assets/online/coop/keys/key-combined.png?v=2.11.44-build209" alt=""></div><strong>共鳴鍵 完成</strong><small>封印された宝物庫が開きます</small>`;
    stage.appendChild(fx);
    requestAnimationFrame(() => fx.classList.add("active"));
    this._schedulePresentation(() => { fx.classList.add("leaving"); this._schedulePresentation(() => fx.remove(), 420); }, 2100);
  }

  _healthMap(mode, battle) {
    if (!battle) return new Map();
    const players = Array.isArray(battle.players) ? battle.players : [];
    let allies = players, foes;
    if (mode === "team") {
      const ownActor = players.find(actor => onlineBattleOwnerId(actor) === this.selfId), memberSide = this._self()?.teamSide;
      const viewingSide = ownActor?.side ?? (["sun", "moon"].includes(memberSide) ? memberSide : "sun");
      allies = players.filter(actor => actor.side === viewingSide).slice(0, 4);
      foes = players.filter(actor => actor.side !== viewingSide).slice(0, 4);
    } else foes = mode === "raid" ? [battle.boss, ...(battle.minions ?? [])] : battle.enemies ?? [];
    return new Map([...allies.map(player => [`ally:${onlineBattleActorId(player)}`, { hp: player.hp, max: player.maxHp }]), ...foes.filter(Boolean).map(enemy => [`enemy:${enemy.id ?? onlineBattleActorId(enemy)}`, { hp: enemy.hp, max: enemy.maxHp }])]);
  }

  _captureHpTrails(mode, previous, next) {
    const before = this._healthMap(mode, previous), after = this._healthMap(mode, next), trails = {}, speed = onlineBattlePresentationSpeed(next?.speed);
    for (const [key, current] of after) { const old = before.get(key); if (!old || Number(current.hp) >= Number(old.hp)) continue; trails[key] = { from: clamp(Number(old.hp) / Math.max(1, Number(old.max)) * 100, 0, 100), startedAt: Date.now(), delay: onlineBattlePresentationDelay(300, speed), duration: onlineBattlePresentationDelay(720, speed) }; if(key.startsWith("enemy:")&&Number(old.hp)>0&&Number(current.hp)<=0)this.presentationKoIds[mode]?.add(key.slice(key.indexOf(":")+1)); }
    this.hpTrails[mode] = trails;
  }

  _queueBattlePresentation(mode, events = []) {
    this._clearPresentationTimers();
    const speed = this._battlePresentationSpeed(mode), rows = [...events], featured = [...rows].reverse().find(event => event?.kind === "coopBreak"), recent = rows.slice(-12), koIds=this.presentationKoIds[mode]??new Set();
    if (featured && !recent.includes(featured)) recent.splice(0, Math.max(0, recent.length - 11), featured);
    for(const id of koIds)if(!recent.some(event=>event?.kind==="ko"&&String(event.targetId)===String(id)))recent.push({kind:"ko",targetKind:"enemy",targetId:id,label:"撃破"});
    const actions=recent.filter(event=>event?.kind!=="ko").slice(-8),kos=recent.filter(event=>event?.kind==="ko");
    for (const [index, event] of [...actions,...kos].entries()) {
      const actionCount=actions.length,delay=index<actionCount?80+index*90:980+(index-actionCount)*120;
      this._schedulePresentation(() => this._playBattleEvent(event, mode, speed), delay, speed);
    }
  }

  _playBattleEvent(event, mode = this.route, speed = this._battlePresentationSpeed(mode)) {
    speed = onlineBattlePresentationSpeed(speed);
    const schedule = (callback, delay) => this._schedulePresentation(callback, delay, speed);
    const linkArts = event?.kind === "coopBreak", techniqueEventId = linkArts ? String(event?.id ?? "") : "";
    if (techniqueEventId && this.processedCoopTechniqueEvents.has(techniqueEventId)) return;
    if (techniqueEventId) { this.processedCoopTechniqueEvents.add(techniqueEventId); if (this.processedCoopTechniqueEvents.size > 256) this.processedCoopTechniqueEvents.delete(this.processedCoopTechniqueEvents.values().next().value); }
    const actorId = event?.actorId ?? event?.actorIds?.[0], targetId = event?.targetId;
    const actor = this._query(`#ally-${CSS.escape(String(actorId))}`) ?? this._query(`#enemy-${CSS.escape(String(actorId))}`);
    const target = event?.targetKind === "player" ? this._query(`#ally-${CSS.escape(String(targetId))}`) ?? this._query(`#enemy-${CSS.escape(String(targetId))}`) : this._query(`#enemy-${CSS.escape(String(targetId))}`);
    if (linkArts) {
      const actorIds = [...new Set([...(Array.isArray(event.actorIds) ? event.actorIds : []), event.actorId].filter(Boolean).map(String))];
      const autoIncluded = new Set((Array.isArray(event.autoIncluded) ? event.autoIncluded : []).map(String));
      for (const id of actorIds) {
        const unit = this._query(`#ally-${CSS.escape(id)}`) ?? this._query(`#enemy-${CSS.escape(id)}`);
        if (!unit) continue;
        setMonsterVisualFrame(unit, "attack"); unit.classList.remove("fx-link-arts"); void unit.offsetWidth; unit.classList.add("fx-link-arts");
        const aura = document.createElement("span"); aura.className = `online-link-arts-actor-fx ${autoIncluded.has(id) || event.autoIncluded === true ? "auto-included" : ""}`; aura.setAttribute("aria-hidden", "true"); unit.appendChild(aura);
        schedule(() => { aura.remove(); unit.classList.remove("fx-link-arts"); if (!unit.classList.contains("dead")) setMonsterVisualFrame(unit, "idle"); }, 1320);
      }
    }
    if (actor && ["damage", "enemyDamage", "signature", "heal", "mpHeal", "revive", "circleActivate"].includes(event.kind)) { setMonsterVisualFrame(actor,"attack"); actor.classList.remove("fx-lunge", "fx-skill-lunge"); void actor.offsetWidth; actor.classList.add(event.label && event.label !== "たたかう" ? "fx-skill-lunge" : "fx-lunge"); const actorSelector=actor.id?`#${CSS.escape(actor.id)}`:null;schedule(()=>{const current=actorSelector?this._query(actorSelector):actor;if(current&&!current.classList.contains("dead"))setMonsterVisualFrame(current,"idle")},920); }
    const impactDelay=["damage","enemyDamage","signature","deathMirrorPhantom"].includes(event?.kind)?170:60;
    if (target && ["damage", "enemyDamage", "signature", "deathMirrorPhantom"].includes(event.kind) && Number(event.value) > 0) schedule(()=>{setMonsterVisualFrame(target,"damage"); target.classList.remove("fx-hit", "fx-critical-hit"); void target.offsetWidth; target.classList.add(event.critical ? "fx-critical-hit" : "fx-hit"); const flash = document.createElement("span"); flash.className = `battle-unit-hit-flash ${event.critical ? "critical" : ""}`; target.appendChild(flash); schedule(() => flash.remove(), 680); const targetSelector=target.id?`#${CSS.escape(target.id)}`:null;schedule(()=>{const current=targetSelector?this._query(targetSelector):target;if(current&&!current.classList.contains("dead"))setMonsterVisualFrame(current,"idle")},1050)},impactDelay);
    if(target&&event?.kind==="ko"){target.classList.add("presentation-ko-playing");setMonsterVisualFrame(target,"down");schedule(()=>{this.presentationKoIds[mode]?.delete(String(targetId));target.classList.remove("presentation-ko-pending","presentation-ko-playing");target.classList.add("presentation-ko-resolved","dead");target.setAttribute("aria-hidden","true")},560)}
    const layer = this._query("#battleFxLayer");
    if (layer && target && (Number(event?.value) || ["miss", "guard"].includes(event?.kind))) schedule(()=>{const layerRect = layer.getBoundingClientRect(), rect = target.getBoundingClientRect(), float = document.createElement("div"); const healing = ["heal", "mpHeal", "revive"].includes(event.kind), text = event.kind === "miss" ? "MISS" : event.kind === "guard" ? "GUARD" : `${healing ? "+" : "-"}${Math.max(0, Number(event.value) || 0).toLocaleString()}`; float.className = `floating-number ${healing ? "heal" : event.critical ? "critical" : event.kind === "enemyDamage" ? "enemy" : "damage"}`; float.textContent = text; float.style.left = `${rect.left - layerRect.left + rect.width / 2}px`; float.style.top = `${rect.top - layerRect.top + rect.height * .34}px`; layer.appendChild(float); schedule(() => float.remove(), 2400)},impactDelay);
    if (layer && (event?.label || linkArts) && (["signature", "raidTelegraph", "revive", "effect", "buff", "link", "coopBreak", "circleActivate", "equipmentAuthority"].includes(event.kind) || event.kind === "damage" && event.label !== "たたかう")) { const title = String(event.label || "LINK ARTS"), detailBase = String(event.description || event.message || event.effectText || (event.kind === "circleActivate" ? "魔法陣 発動" : event.actorName || "共闘アクション")), detail = linkArts && (event.autoIncluded === true || Array.isArray(event.autoIncluded) && event.autoIncluded.length) ? `${detailBase}・自動連携` : detailBase; const banner = document.createElement("div"); const authority = event.kind === "equipmentAuthority" || /固有|権能|反照/.test(detail); banner.className = `battle-cinematic-banner ${event.kind === "raidTelegraph" || event.kind === "coopBreak" ? "boss" : "skill"} ${linkArts ? "link-arts" : ""} ${title.length > 20 ? "very-long-title" : title.length > 12 ? "long-title" : ""} ${authority ? "equipment-authority" : ""}`; if (event.techniqueId) banner.dataset.techniqueId = String(event.techniqueId); banner.innerHTML = `<span class="battle-banner-copy">${linkArts ? '<em class="link-arts-kicker">LINK ARTS</em>' : ""}<strong>${safeHtml(title)}</strong><small class="battle-banner-effect">${safeHtml(detail)}</small></span>`; this._query(".battle-arena")?.appendChild(banner); const hold = mode === "raid" ? 2100 : linkArts ? 1900 : 1550; schedule(() => { banner.classList.add("leaving"); schedule(() => banner.remove(), 380); }, hold); }
  }

  _sendPreset(text) {
    const message = String(text ?? "").trim().slice(0, 80);
    if (!message || Date.now() - this.lastChatAt < 850) return;
    if (this._send("chat", { text: message })) this.lastChatAt = Date.now();
  }

  _refreshHallSocialDom() {
    if (this.route !== "home" || !this.exploreChatOpen) return false;
    const composer = this._query("[data-online-explore-chat-input]");
    const stage = this._query("[data-online-hall-stage]");
    if (!composer || !stage) return false;
    const chats = new Map(this._chatBubbleSnapshot().map(entry => [String(entry.playerId), entry]));
    const emotes = new Map(this._socialBubbleSnapshot().map(entry => [String(entry.playerId), entry]));
    const updateBubble = (player, className, value) => {
      let bubble = player.querySelector(`.${className}`);
      if (!value) { bubble?.remove(); return; }
      if (!bubble) {
        bubble = player.ownerDocument.createElement("span");
        bubble.className = className;
        player.insertBefore(bubble, player.firstChild);
      }
      bubble.textContent = value;
    };
    stage.querySelectorAll("[data-online-hall-player]").forEach(player => {
      const playerId = String(player.dataset.onlineHallPlayer ?? "");
      updateBubble(player, "online-hall-emote", emotes.get(playerId)?.emoji ?? "");
      updateBubble(player, "online-hall-chat-bubble", chats.get(playerId)?.text ?? "");
    });
    const unread = this._query("[data-online-unread]");
    if (unread) { unread.hidden = this.unread <= 0; unread.textContent = this.unread > 9 ? "9+" : String(this.unread); }
    return true;
  }

  _receiveChat(message) {
    if (!message?.id || !this.roomState || this._isSocialHidden(message.playerId)) return;
    this.roomState.chatHistory ??= [];
    if (!this.roomState.chatHistory.some(entry => entry.id === message.id)) this.roomState.chatHistory.push(message);
    this.roomState.chatHistory = this.roomState.chatHistory.slice(-50);
    if (this.route !== "chat") this.unread = Math.min(99, this.unread + 1);
    this.chatBubbles.set(message.playerId, { playerId: message.playerId, text: String(message.text ?? "").slice(0, 80), expiresAt: Date.now() + 6200 });
    if (this.exploreCanvasMounted) this.onExploreCanvasUpdate(this.roomState, this.selfId, { chatBubbles: this._chatBubbleSnapshot(), pings: this._pingSnapshot() });
    else if (!["explore", "raid", "team"].includes(this.route) || !this._battle(this.route)) {
      if (!this._refreshHallSocialDom()) this._render();
    }
  }

  _showRewardReceipt(message, result = {}) {
    if (result?.duplicate || result?.isImportantEquipment !== true && !EXPEDITION_LOOT_RECEIPT_KINDS.has(String(message?.source?.kind ?? ""))) return;
    const receipt = onlineRewardReceiptData(message, result); if (!receipt) return;
    if (this.pendingRewardReceipt?.id === receipt.id || this.rewardReceiptQueue.some(entry => entry.id === receipt.id)) return;
    this.rewardReceiptQueue.push(receipt);
    this._showNextRewardReceipt();
  }

  _showNextRewardReceipt() {
    if (this.pendingRewardReceipt || this.rewardReceiptAdvanceTimer || !this.rewardReceiptQueue.length) return;
    this.pendingRewardReceipt = { ...this.rewardReceiptQueue.shift(), expiresAt: Date.now() + 7200 };
    clearTimeout(this.rewardReceiptTimer);
    this.rewardReceiptTimer = setTimeout(() => this._clearRewardReceipt(), 7200);
    this._renderRewardReceipt();
  }

  _renderRewardReceipt() {
    const data = this.pendingRewardReceipt; if (!data || data.expiresAt <= Date.now()) { if (data) this._clearRewardReceipt(); return; }
    const stage = this._query(".explore-stage") ?? this._query("[data-online-stage]"); if (!stage) return;
    const current = stage.querySelector(".online-reward-receipt"); if (current?.dataset.receiptId === data.id) return; current?.remove();
    const receipt = document.createElement("aside"); receipt.className = `online-reward-receipt ${data.important ? "online-weapon-receipt" : "online-loot-summary-receipt"}`; receipt.dataset.receiptId = data.id; receipt.setAttribute("role", "status");
    receipt.innerHTML = `<header><span>${safeHtml(data.eyebrow)}</span><strong>${safeHtml(data.title)}</strong><button type="button" data-online-reward-close aria-label="閉じる">×</button></header><section><h4>${safeHtml(data.heading)}</h4><ul>${data.items.map(item => `<li class="${item.rare ? "rare" : ""}"><span>${safeHtml(item.label)}</span><b>${safeHtml(item.value)}</b></li>`).join("")}</ul></section>`;
    stage.appendChild(receipt); requestAnimationFrame(() => receipt.classList.add("show"));
  }

  _clearRewardReceipt() {
    clearTimeout(this.rewardReceiptTimer); this.rewardReceiptTimer = null; this.pendingRewardReceipt = null;
    const receipt = this._query(".online-reward-receipt");
    if (!receipt) { this._showNextRewardReceipt(); return; }
    receipt.classList.add("leaving");
    clearTimeout(this.rewardReceiptAdvanceTimer);
    this.rewardReceiptAdvanceTimer = setTimeout(() => {
      receipt.remove();
      this.rewardReceiptAdvanceTimer = null;
      this._showNextRewardReceipt();
    }, 380);
  }

  _trackRecoverySettlement(promise, batch) {
    const tasks = this.recoverySettlementTasks, task = Promise.resolve(promise).catch(() => { if (batch === this.recoverySettlementBatch) this.recoverySettlementFailed = true; });
    tasks.add(task); task.finally(() => tasks.delete(task)); return task;
  }

  async _receiveReward(message, batch = this.recoverySettlementBatch) {
    const id = String(message.rewardId ?? ""); if (!id || this.rewardInFlight.has(id)) return;
    this.rewardInFlight.add(id);
    try {
      const result = await this.onReward({ rewardId: id, reward: message.reward ?? {}, source: message.source ?? {} });
      if (result?.ok) { this._send("rewardAck", { rewardId: id }); if (!result.duplicate && result.isImportantEquipment === true) this._showRewardReceipt(message, result); else if (!result.duplicate && EXPEDITION_LOOT_RECEIPT_KINDS.has(String(message?.source?.kind ?? ""))) this._showRewardReceipt(message, result); }
      else if (batch === this.recoverySettlementBatch) this.recoverySettlementFailed = true;
    } catch {
      if (batch === this.recoverySettlementBatch) this.recoverySettlementFailed = true;
    } finally { this.rewardInFlight.delete(id); }
  }

  async _receiveExpeditionResult(message, batch = this.recoverySettlementBatch) {
    if (!this.capabilities.has("expeditionResultsV1")) return;
    const runId = String(message.runId ?? message.summary?.runId ?? "").slice(0, 120), resultId = String(message.resultId ?? "").slice(0, 160), explicitOwnerId = this._explicitWorldOwnerId({ ownerId: message.ownerId ?? message.summary?.ownerId }), ownerId = explicitOwnerId || this._canonicalRoomOwnerId(this.roomState) || "legacy-owner-unknown", progressionEligible = Boolean(message.progressionEligible === true && explicitOwnerId && explicitOwnerId === this.selfId), recipientId = String(message.recipientId ?? this.selfId).slice(0, 24);
    if (!resultId || !ownerId || recipientId !== this.selfId || this.expeditionResultInFlight.has(resultId)) return;
    const summarySource = message.summary && typeof message.summary === "object" ? message.summary : {};
    const hasOwnerProgress = [message.startFloor, message.endFloor, message.floorsCleared].every((value, index) => value !== null && value !== "" && Number.isFinite(Number(value)) && Number(value) >= (index < 2 ? 1 : 0));
    if (progressionEligible && !hasOwnerProgress) { if (batch === this.recoverySettlementBatch) this.recoverySettlementFailed = true; return; }
    const startFloor = progressionEligible ? boundedInteger(message.startFloor, 1, 100, 1) : null;
    const endFloor = progressionEligible ? Math.max(startFloor, boundedInteger(message.endFloor, 1, 100, startFloor)) : null;
    const floorsCleared = progressionEligible ? boundedInteger(message.floorsCleared, 0, 100, 0) : null;
    const legacyAssistedSource = !progressionEligible && [message.startFloor, message.endFloor, message.floorsCleared].every((value, index) => value !== null && value !== "" && Number.isFinite(Number(value)) && Number(value) >= (index < 2 ? 1 : 0))
      ? { ownerId, startFloor: message.startFloor, endFloor: message.endFloor, floorsCleared: message.floorsCleared }
      : null;
    const assistedWorld = !progressionEligible
      ? normalizedAssistedWorld(message.assistedWorld ?? summarySource.assistedWorld ?? legacyAssistedSource, ownerId)
      : null;
    const reason = String(message.reason ?? "return").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 40) || "return";
    const finalVitalsSource = message.finalVitals && typeof message.finalVitals === "object" ? message.finalVitals : null;
    const rosterVitals = normalizedRosterVitals(finalVitalsSource?.rosterVitals ?? message.rosterVitals);
    const primaryVitals = rosterVitals.find(entry => entry.isPrimary) ?? rosterVitals[0] ?? null;
    const finalVitals = finalVitalsSource || primaryVitals ? {
      mutationId: String(finalVitalsSource?.mutationId ?? message.mutationId ?? "").slice(0, 160),
      monsterId: cleanSocialText(finalVitalsSource?.monsterId || primaryVitals?.monsterId, 120).trim(),
      playerId: recipientId,
      hp: Math.max(0, Number(finalVitalsSource?.hp ?? primaryVitals?.hp) || 0),
      mp: Math.max(0, Number(finalVitalsSource?.mp ?? primaryVitals?.mp) || 0),
      reason: "expeditionEnd",
      rosterVitals,
    } : null;
    const { startFloor: _summaryStartFloor, endFloor: _summaryEndFloor, floorsCleared: _summaryFloorsCleared, floor: _summaryFloor, nextFloor: _summaryNextFloor, ownerFloorUnlock: _summaryOwnerFloorUnlock, leaderFloorUnlock: _summaryLeaderFloorUnlock, floorUnlock: _summaryFloorUnlock, unlockFloor: _summaryUnlockFloor, unlockedFloor: _summaryUnlockedFloor, maxFloorUnlock: _summaryMaxFloorUnlock, maxFloor: _summaryMaxFloor, assistedWorld: _summaryAssistedWorld, ...guestSafeSummary } = summarySource;
    const summary = progressionEligible
      ? { ...summarySource, resultId, ownerId, progressionEligible, startFloor, endFloor, floor: Math.max(startFloor, boundedInteger(summarySource.floor ?? endFloor, 1, 100, endFloor)), floorsCleared, completed: Boolean(message.completed), reason, multiplayer: Boolean(message.multiplayer) }
      : { ...guestSafeSummary, resultId, ownerId, progressionEligible: false, ...(assistedWorld ? { assistedWorld } : {}), completed: Boolean(message.completed), reason, multiplayer: Boolean(message.multiplayer) };
    this.expeditionResultInFlight.add(resultId);
    try {
      const progressionSpan = progressionEligible ? { startFloor, endFloor, floorsCleared } : assistedWorld ? { assistedWorld } : {};
      const settled = await this.onExpeditionResult({ runId, resultId, ownerId, recipientId, progressionEligible, ...progressionSpan, completed: Boolean(message.completed), reason, multiplayer: Boolean(message.multiplayer), finishedAt: Math.max(0, Number(message.finishedAt) || 0), finalVitals, summary });
      if (!settled?.ok) { if (batch === this.recoverySettlementBatch) this.recoverySettlementFailed = true; return; }
      const presentedResultIds = this.presentedExpeditionResultIds ??= new Set();
      if (!settled.duplicate && !presentedResultIds.has(resultId)) {
        const context = { resultId, summary, reason, defeat: settled.defeat ?? null, guest: Boolean(settled.guest), duplicate: Boolean(settled.duplicate) };
        if (summary.multiplayer && this.roomState) {
          this.expeditionReport = summary;
          if (settled.returnResult || settled.defeat) this.pendingExpeditionReturnResult = { result: settled.returnResult ?? null, context };
          this._closeBattleMenus("explore"); this.route = "explore"; this._render();
        } else this.onShowExpeditionResult(settled.returnResult ?? null, context);
        presentedResultIds.add(resultId);
        if (presentedResultIds.size > 256) presentedResultIds.delete(presentedResultIds.values().next().value);
      }
      this._send("expeditionResultAck", { resultId });
    } finally { this.expeditionResultInFlight.delete(resultId); }
  }

  async _receiveOrphanedExpedition(batch = this.recoverySettlementBatch) {
    if (!this.capabilities.has("expeditionResultsV1") || this.orphanRecoveryInFlight) return;
    this.orphanRecoveryInFlight = true;
    try {
      const tasks = this.recoverySettlementTasks; if (tasks.size) await Promise.allSettled([...tasks]);
      if (batch !== this.recoverySettlementBatch) return;
      if (this.recoverySettlementFailed) { this.toast("保留報酬を保存できなかったため、共同探索の復旧を次回接続時に再試行します"); return; }
      const settled = await this.onExpeditionOrphaned({ reason: "serverRestart" });
      if (!settled?.ok) { this.toast(settled?.message || "中断された探索を保存できませんでした。再接続して再試行してください"); return; }
      if (!settled.active) return;
      const context = settled.context ?? { reason: "serverRestart", summary: settled.summary ?? {}, guest: false };
      this.onShowExpeditionResult(settled.returnResult ?? null, context);
    } finally { this.orphanRecoveryInFlight = false; }
  }

  _showPendingExpeditionReturnResult() {
    if (!this.pendingExpeditionReturnResult || this.expeditionReport) return false;
    const pending = this.pendingExpeditionReturnResult; this.pendingExpeditionReturnResult = null;
    this.onShowExpeditionResult(pending.result, pending.context); return true;
  }

  _startLoops() {
    const clock = () => { if (!this.mounted) return; this._updateClock(); this.clockFrame = requestAnimationFrame(clock); };
    const move = now => { if (!this.mounted) return; if (now - this.lastMoveAt >= ONLINE_EXPEDITION_MOVE_INTERVAL_MS) this._moveStep(now); this.moveFrame = requestAnimationFrame(move); };
    this.clockFrame = requestAnimationFrame(clock); this.moveFrame = requestAnimationFrame(move);
  }

  _updateClock() {
    for (const mode of ["explore", "raid", "team"]) {
      const node = this._query(`[data-online-countdown="${mode}"]`), battle = this._battle(mode);
      if (!node || !battle || battle.phase !== "command") continue;
      const remaining = Math.max(0, (Number(battle.deadlineAt) - Date.now()) / 1000); node.textContent = remaining.toFixed(1); node.classList.toggle("urgent", remaining <= 5);
    }
  }

  _moveStep(now) {
    if (!this._canMutateOnline()) { this._clearMoveInputs(); return; }
    if (this.route === "home" && this.roomState?.phase === "lobby") {
      if (this.exploreChatOpen || this.hallGamesOpen || this.emoteGestureActive) { this.hallDestination = null; return; }
      this._moveHallStep(now); return;
    }
    if (this.route !== "explore" || this.roomState?.phase !== "expedition" || this.roomState?.expedition?.battle) return;
    const self = this._self(), current = self?.dungeonPosition, expedition = this.roomState.expedition;
    if (!current || Number(self?.coopVitals?.hp) <= 0) { this._clearMoveInputs(); return; }
    let direction = this._currentMoveDirection("explore"), target = null;
    if (direction) { const [dx, dy] = DIRECTION[direction]; target = { x: current.x + dx, y: current.y + dy }; }
    else if (this.path.length) { target = this.path.shift(); const dx = target.x - current.x, dy = target.y - current.y; direction = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down"; }
    if (!target || expedition.tiles?.[target.y]?.[target.x] !== ".") { if (target) this.path = []; return; }
    this.lastMoveAt = now; self.dungeonPosition = { ...target, facing: direction }; this._send("expeditionMove", { position: self.dungeonPosition }); if (this.exploreCanvasMounted) this.onExploreCanvasUpdate(this.roomState, this.selfId); else this._render();
  }

  _hostWorldSnapshot() {
    const state = this.getState?.() ?? {}, source = state.onlineParty?.hostWorld ?? {};
    const opened = source.openedChestIds && typeof source.openedChestIds === "object" ? source.openedChestIds : {};
    const soloOpened = state.player?.openedChests && typeof state.player.openedChests === "object" ? state.player.openedChests : {};
    const floors = new Set([...Object.keys(opened), ...Object.keys(soloOpened)]);
    const defeated = Array.isArray(source.defeatedBossFloors) ? source.defeatedBossFloors : [];
    const onlineClears = Array.isArray(state.onlineParty?.firstCoopBossClears) ? state.onlineParty.firstCoopBossClears : [];
    const bossKills = Object.entries(state.player?.bossKills ?? {}).filter(([, value]) => Number(value) > 0).map(([floor]) => Number(floor));
    const bossRewards = Object.keys(state.player?.bossRewards ?? {}).map(Number);
    const claimed = Array.isArray(source.claimedBossRewardFloors) ? source.claimedBossRewardFloors : [];
    const campaignFloorStates = normalizedCampaignFloorStates(source.campaignFloorStates);
    const campaignFloors = state.campaign100?.floors && typeof state.campaign100.floors === "object" && !Array.isArray(state.campaign100.floors) ? state.campaign100.floors : {};
    const campaignDefeated = [];
    for (const [rawFloor, localFloorState] of Object.entries(campaignFloors)) { const floor = Number(rawFloor); if (!Number.isInteger(floor) || floor < CAMPAIGN_FLOOR_MIN || floor > CAMPAIGN_FLOOR_MAX) continue; const key = String(floor); campaignFloorStates[key] = mergeCampaignHostFloorState(campaignFloorStates[key], localFloorState); if (localFloorState?.bossDefeated) campaignDefeated.push(floor); }
    const savedSeeds = state.player?.floorSeeds && typeof state.player.floorSeeds === "object" ? state.player.floorSeeds : {}, onlineSeeds = source.floorSeeds && typeof source.floorSeeds === "object" ? source.floorSeeds : {};
    const claimedBossRewardFloors = normalizedCampaignFloors(claimed);
    return { revision: Math.max(this.hostWorldRevision, Number(source.revision) || 0), openedChestIds: Object.fromEntries([...floors].map(floor => [String(floor), [...new Set([...(Array.isArray(opened[floor]) ? opened[floor] : []), ...(Array.isArray(soloOpened[floor]) ? soloOpened[floor] : [])].map(String).slice(0, 200))]])), floorSeeds: { ...savedSeeds, ...onlineSeeds }, defeatedBossFloors: normalizedCampaignFloors([...defeated, ...onlineClears, ...bossKills, ...bossRewards, ...campaignDefeated]), claimedBossRewardFloors, campaignFloorStates };
  }

  _hostWorldNetworkSnapshot() {
    const full = this._hostWorldSnapshot(), selected = Math.max(1, Number(this.roomState?.selectedFloor) || 1);
    const snapshot = { revision: full.revision, floorSeeds: {}, openedChestIds: {}, defeatedBossFloors: full.defeatedBossFloors, claimedBossRewardFloors: full.claimedBossRewardFloors, campaignFloorStates: full.campaignFloorStates };
    const secretRun = this.getState?.()?.secretRooms?.run;
    if (secretRun && typeof secretRun === "object") {
      const id = String(secretRun.id ?? "").slice(0, 120), seed = Math.max(1, Math.min(0x7fffffff, Math.floor(Number(secretRun.seed) || 1)));
      if (id) snapshot.secretRooms = { run: { id, seed } };
    }
    const candidates = [...new Set([selected, ...Object.keys(full.floorSeeds), ...Object.keys(full.openedChestIds)].map(Number).filter(floor => Number.isInteger(floor) && floor >= selected))].sort((left, right) => left - right);
    // Keep startExpedition comfortably below the server's 128 KiB WebSocket
    // ceiling, while prioritising the selected floor and the floors ahead.
    for (const floor of candidates) {
      const key = String(floor), seed = full.floorSeeds[key], opened = full.openedChestIds[key];
      if (seed != null) snapshot.floorSeeds[key] = seed;
      if (Array.isArray(opened) && opened.length) snapshot.openedChestIds[key] = opened.slice(0, 200);
      if (JSON.stringify(snapshot).length <= 56 * 1024) continue;
      delete snapshot.floorSeeds[key]; delete snapshot.openedChestIds[key];
      if (floor === selected) {
        if (seed != null) snapshot.floorSeeds[key] = seed;
        if (Array.isArray(opened) && opened.length) snapshot.openedChestIds[key] = opened.slice(0, 64);
      }
      break;
    }
    return snapshot;
  }

  _chatBubbleSnapshot() {
    const now = Date.now();
    for (const [id, bubble] of this.chatBubbles) if (Number(bubble.expiresAt) <= now || this._isSocialHidden(id)) this.chatBubbles.delete(id);
    return [...this.chatBubbles.values()].map(bubble => ({ ...bubble }));
  }

  _pingSnapshot() {
    const now = Date.now();
    for (const [id, ping] of this.coopPings) if (Number(ping.expiresAt) <= now || this._isSocialHidden(ping?.playerId)) this.coopPings.delete(id);
    return [...this.coopPings.values()].map(ping => ({ ...ping }));
  }

  _socialBubbleSnapshot() {
    const now = Date.now();
    for (const [id, bubble] of this.socialBubbles) if (Number(bubble.expiresAt) <= now || this._isSocialHidden(id)) this.socialBubbles.delete(id);
    return [...this.socialBubbles.values()].map(bubble => ({ ...bubble }));
  }

  _receiveSocial(message) {
    if (this._isSocialHidden(message.playerId)) return;
    const emoji = ({ wave: "👋", cheer: "✨", heart: "❤️", like: "👍", alert: "⚠️", question: "❓", surprise: "‼️", laugh: "😄", cry: "💧", clap: "👏", sparkle: "🌟" })[message.id] ?? "✨";
    this.socialBubbles.set(message.playerId, { playerId: message.playerId, emoji, id: message.id, expiresAt: Date.now() + Math.max(1800, Number(message.duration) || 2800) });
    if (this.exploreCanvasMounted) this.onExploreCanvasUpdate(this.roomState, this.selfId, { chatBubbles: this._chatBubbleSnapshot(), pings: this._pingSnapshot(), socialBubbles: this._socialBubbleSnapshot() });
    else if (!["explore", "raid", "team"].includes(this.route) || !this._battle(this.route)) {
      if (!this._refreshHallSocialDom()) this._render();
    }
  }

  _placeExploreEmote(anchor, point = null) {
    const stage = anchor?.closest?.(".explore-stage,.online-hall-world");
    if (!anchor || !stage) return null;
    const rect = anchor.getBoundingClientRect();
    const minX = 10, maxX = Math.max(minX, stage.clientWidth - rect.width - 10);
    const minY = 10, maxY = Math.max(minY, stage.clientHeight - rect.height - 14);
    const x = clamp(point?.x ?? minX, minX, maxX), y = clamp(point?.y ?? 12, minY, maxY);
    anchor.style.setProperty("left", `${x}px`, "important");
    anchor.style.setProperty("top", `${y}px`, "important");
    anchor.style.setProperty("right", "auto", "important");
    anchor.style.setProperty("bottom", "auto", "important");
    return { x, y };
  }

  _prepareExploreEmoteAnchor() {
    const anchor = this._query(".online-explore-emote,.online-hall-emote-tool");
    if (!anchor) return;
    if (anchor.matches(".online-hall-emote-tool")) {
      for (const property of ["left", "top", "right", "bottom"]) anchor.style.removeProperty(property);
      return;
    }
    const key = ONLINE_EXPLORE_EMOTE_POSITION;
    let saved = null;
    try { saved = JSON.parse(storageGet(key, "null")); } catch {}
    const placed = this._placeExploreEmote(anchor, saved);
    if (placed) storageSet(key, JSON.stringify(placed));
  }

  _beginEmoteGesture(event, anchor) {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    this.emoteGestureCleanup?.();
    const choices = [["wave", "👋"], ["cheer", "✨"], ["heart", "❤️"], ["like", "👍"], ["alert", "⚠️"], ["question", "❓"]];
    const pointerId = event.pointerId, origin = { x: event.clientX, y: event.clientY };
    const isHallGame = anchor.matches?.(".online-hall-game-emote-tool");
    const isHall = isHallGame || anchor.matches?.(".online-hall-emote-tool");
    const movable = !isHall && anchor.matches?.(".online-explore-emote"), stage = anchor.closest(".explore-stage,.online-hall-world");
    const positionKey = ONLINE_EXPLORE_EMOTE_POSITION;
    const anchorRect = anchor.getBoundingClientRect(), stageRect = stage?.getBoundingClientRect();
    const startPosition = stageRect ? { x: anchorRect.left - stageRect.left, y: anchorRect.top - stageRect.top } : null;
    let wheel = null, selected = isHall ? null : 0, opened = false, dragging = false, wheelMoved = false, lastPosition = startPosition, cleaned = false;
    const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1), viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    const marginX = Math.min(82, Math.max(8, viewportWidth / 2 - 4)), marginY = Math.min(82, Math.max(8, viewportHeight / 2 - 4));
    const anchorCenter = { x: anchorRect.left + anchorRect.width / 2, y: anchorRect.top + anchorRect.height / 2 };
    const wheelOrigin = isHallGame
      ? { x: clamp(anchorCenter.x, marginX, Math.max(marginX, viewportWidth - marginX)), y: clamp(anchorCenter.y, marginY, Math.max(marginY, viewportHeight - marginY)) }
      : isHall
      ? anchorCenter
      : { x: clamp(origin.x, marginX, Math.max(marginX, viewportWidth - marginX)), y: clamp(origin.y, marginY, Math.max(marginY, viewportHeight - marginY)) };
    const paintSelection = () => wheel?.querySelectorAll("i").forEach((node, index) => node.classList.toggle("selected", selected != null && index === selected));
    const selectHallOption = pointer => {
      let next = null, nearest = Number.POSITIVE_INFINITY;
      wheel?.querySelectorAll("i").forEach((node, index) => {
        const rect = node.getBoundingClientRect(), distance = Math.hypot(pointer.clientX - (rect.left + rect.width / 2), pointer.clientY - (rect.top + rect.height / 2));
        if (distance <= Math.max(26, Math.max(rect.width, rect.height) * .72) && distance < nearest) { next = index; nearest = distance; }
      });
      selected = next; paintSelection();
    };
    if (isHall) {
      this.hallDestination = null;
      this._clearMoveInputs();
      this.emoteGestureActive = true;
      stage?.classList.add("emote-gesture-active");
      document.documentElement.classList.add("online-hall-emote-gesture");
      anchor.setAttribute("aria-expanded", "true");
    }
    try { anchor.setPointerCapture?.(pointerId); } catch {}
    const open = () => {
      if (dragging) return;
      opened = true; wheel = document.createElement("div"); wheel.className = `online-emote-wheel${isHall ? " online-emote-wheel-hall" : ""}`;
      wheel.style.left = `${wheelOrigin.x}px`; wheel.style.top = `${wheelOrigin.y}px`;
      wheel.innerHTML = choices.map(([id, emoji], index) => `<i data-emote-index="${index}" data-emote-id="${id}" style="--emote-angle:${index * 60 - 90}deg">${emoji}</i>`).join("");
      document.body.appendChild(wheel); paintSelection();
    };
    const timer = setTimeout(open, 360);
    const update = move => {
      if (move.pointerId != null && move.pointerId !== pointerId) return;
      if (isHall) { move.preventDefault?.(); move.stopPropagation?.(); }
      const dx = move.clientX - origin.x, dy = move.clientY - origin.y;
      if (movable && startPosition && Math.hypot(dx, dy) > 8 && !dragging) { dragging = true; opened = false; clearTimeout(timer); wheel?.remove(); wheel = null; anchor.classList.add("dragging"); }
      if (dragging) { move.preventDefault?.(); lastPosition = this._placeExploreEmote(anchor, { x: startPosition.x + dx, y: startPosition.y + dy }); return; }
      if (!opened || !wheel) return;
      wheelMoved = true;
      if (isHall) { selectHallOption(move); return; }
      const angle = Math.atan2(move.clientY - wheelOrigin.y, move.clientX - wheelOrigin.x) * 180 / Math.PI;
      selected = Math.round(((angle + 90 + 360) % 360) / 60) % choices.length; paintSelection();
    };
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      clearTimeout(timer); anchor.classList.remove("dragging");
      window.removeEventListener("pointermove", update, true); window.removeEventListener("pointerup", finish, true); window.removeEventListener("pointercancel", cancel, true); window.removeEventListener("touchmove", blockTouch, true); window.removeEventListener("keydown", cancelWithKeyboard, true); wheel?.remove();
      try { if (anchor.hasPointerCapture?.(pointerId)) anchor.releasePointerCapture?.(pointerId); } catch {}
      if (isHall) {
        this.emoteGestureActive = false;
        stage?.classList.remove("emote-gesture-active");
        document.documentElement.classList.remove("online-hall-emote-gesture");
        anchor.removeAttribute("aria-expanded");
      }
      if (this.emoteGestureCleanup === cleanup) this.emoteGestureCleanup = null;
    };
    const finish = up => {
      if (up.pointerId != null && up.pointerId !== pointerId) return;
      if (dragging && lastPosition) { storageSet(positionKey, JSON.stringify(lastPosition)); anchor.dataset.emoteSuppress = "1"; setTimeout(() => delete anchor.dataset.emoteSuppress, 0); }
      else if (opened) {
        if (isHall || wheelMoved) update(up);
        if (selected != null) { const [id] = choices[selected]; this._send("social", { kind: "emote", id }); }
        anchor.dataset.emoteSuppress = "1"; setTimeout(() => delete anchor.dataset.emoteSuppress, 0);
      }
      cleanup();
    };
    const cancel = cancelEvent => { if (cancelEvent?.pointerId != null && cancelEvent.pointerId !== pointerId) return; if (dragging && lastPosition) storageSet(positionKey, JSON.stringify(lastPosition)); cleanup(); };
    const blockTouch = touchEvent => { if (isHall) touchEvent.preventDefault(); };
    const cancelWithKeyboard = keyEvent => { if (keyEvent.key === "Escape") { keyEvent.preventDefault(); cleanup(); } };
    window.addEventListener("pointermove", update, true); window.addEventListener("pointerup", finish, true); window.addEventListener("pointercancel", cancel, true);
    if (isHall) window.addEventListener("touchmove", blockTouch, { capture: true, passive: false });
    window.addEventListener("keydown", cancelWithKeyboard, true);
    this.emoteGestureCleanup = cleanup;
  }

  _decorateBattleState() {
    const battle = this._battle(this.route), focus = battle?.focusTarget;
    if (focus && Number(focus.expiresAt) > Date.now()) this._query(`#enemy-${CSS.escape(String(focus.targetId))}`)?.classList.add("online-focus-target");
  }

  _hallNearby(position) {
    if (!position) return null;
    return HALL_POINTS.find(point => Math.hypot(point.x - Number(position.x), point.y - Number(position.y)) <= 10)?.route ?? null;
  }

  _hallGameRequestId(kind = "action") {
    this.hallGameRequestSequence = (this.hallGameRequestSequence + 1) % 1_000_000;
    return `hall-${String(kind).replace(/[^a-z]/gi, "").slice(0, 12) || "action"}-${Date.now().toString(36)}-${this.hallGameRequestSequence.toString(36)}`;
  }

  _updateHallPlayerDom(playerId) {
    const member = this.roomState?.members?.find(entry => entry.playerId === playerId), node = this._query(`[data-online-hall-player="${CSS.escape(String(playerId))}"]`);
    if (member?.position && node) { node.style.setProperty("--hall-x", `${clamp(member.position.x, 5, 95)}%`); node.style.setProperty("--hall-y", `${clamp(member.position.y, 15, 96)}%`); }
  }

  _bindExploreChatDrag() {
    this._prepareExploreEmoteAnchor();
    const button = this._query("#onlineExploreChatToggle"), stage = button?.closest(".explore-stage");
    if (!button || !stage || button.dataset.dragBound === "1") return;
    button.dataset.dragBound = "1";
    const key = ONLINE_EXPLORE_CHAT_POSITION;
    const read = () => { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; } };
    const place = point => { const rect = button.getBoundingClientRect(), safeX = 10, safeTop = 10, safeBottom = 14, x = clamp(point?.x ?? stage.clientWidth - 84, safeX, Math.max(safeX, stage.clientWidth - rect.width - safeX)), y = clamp(point?.y ?? stage.clientHeight * .58, safeTop, Math.max(safeTop, stage.clientHeight - rect.height - safeBottom)); button.style.setProperty("left", `${x}px`, "important"); button.style.setProperty("top", `${y}px`, "important"); button.style.setProperty("right", "auto", "important"); button.style.setProperty("bottom", "auto", "important"); return { x, y }; };
    requestAnimationFrame(() => place(read()));
    button.addEventListener("pointerdown", down => { if (down.button != null && down.button !== 0) return; const start = { x: down.clientX, y: down.clientY }, origin = place(read()); let moved = false; button.setPointerCapture?.(down.pointerId); const move = event => { const dx = event.clientX - start.x, dy = event.clientY - start.y; if (Math.hypot(dx, dy) > 6) moved = true; if (moved) place({ x: origin.x + dx, y: origin.y + dy }); }; const finish = event => { button.removeEventListener("pointermove", move); button.removeEventListener("pointerup", finish); button.removeEventListener("pointercancel", finish); if (moved) { const final = place({ x: origin.x + event.clientX - start.x, y: origin.y + event.clientY - start.y }); try { localStorage.setItem(key, JSON.stringify(final)); } catch {} button.dataset.dragSuppress = "1"; setTimeout(() => delete button.dataset.dragSuppress, 0); } }; button.addEventListener("pointermove", move); button.addEventListener("pointerup", finish); button.addEventListener("pointercancel", finish); });
    button.addEventListener("click", event => { if (button.dataset.dragSuppress === "1") { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
  }

  _moveHallStep(now) {
    const self = this._self(), current = self?.position, destination = this.hallDestination;
    if (!current || !destination) return;
    const dx = destination.x - current.x, dy = destination.y - current.y, distance = Math.hypot(dx, dy);
    if (distance <= 1.5) { this.hallDestination = null; const nearby = this._hallNearby(current); if (nearby !== this.hallNearbyRoute) { this.hallNearbyRoute = nearby; this._render(); } return; }
    const step = Math.min(6, distance), position = { x: current.x + dx / distance * step, y: current.y + dy / distance * step, facing: Math.abs(dx) > Math.abs(dy) ? dx < 0 ? "left" : "right" : dy < 0 ? "up" : "down" };
    this.lastMoveAt = now; self.position = position; this._send("move", { position }); this._updateHallPlayerDom(this.selfId); const nearby = this._hallNearby(position); if (nearby !== this.hallNearbyRoute) { this.hallNearbyRoute = nearby; this._render(); }
  }

  _ensureConnectionAfterResume() {
    if ((!this.mounted && !this.backgroundActive) || this.manualClose) return;
    this._refreshResumeTokenFromStorage();
    const awaitingInitialAck = Boolean(this.helloAckPending);
    if (!storageGet(ONLINE_STORAGE_KEYS.serverUrl) || !awaitingInitialAck && (storageGet(ONLINE_STORAGE_KEYS.autoConnect) !== "1" || !this.resumeToken)) return;
    if (this.ws && [WebSocket.OPEN, WebSocket.CONNECTING].includes(this.ws.readyState)) return;
    clearTimeout(this.reconnectTimer); this.reconnectTimer = null;
    this.connect({ reconnect: true });
  }

  _handleClose(closedSocket = null, closeEvent = null) {
    if (closedSocket && this.ws && this.ws !== closedSocket) return;
    this.ws = null; this.connectionReady = false; this.connectionModePending = false; this._clearPowerRankingRequests("offline"); this._notifyPowerRankingCapability(); this._clearGuildPlanTransitionTimer(); this._clearMoveInputs(); this._clearInteractionPending(false); clearTimeout(this.merchantPendingTimer); this.merchantPendingTimer = null; this.merchantPending = false; if (this.manualClose) return;
    if (Number(closeEvent?.code) === 4001) {
      clearTimeout(this.reconnectTimer); this.reconnectTimer = null;
      clearTimeout(this.pendingLeaveTimer); this.pendingLeaveTimer = null;
      this.manualClose = true; this.supersededConnection = true; this.helloAckPending = false; this.pendingLeaveOnReconnect = null;
      this._clearRoom({ reason: "superseded" });
      this._setStatus("error", "別の画面で接続済み", "この画面の自動再接続を停止しました。再開する場合は接続を押してください");
      this.guildStatus = "別の画面で接続されています。この画面では操作できません。";
      if (this.friendPanelOpen) this._renderFriendPanel();
      return;
    }
    if (!this.roomState) { this.pendingRoomJoinId = null; this.roomListingsStatus = "error"; this._renderRoomBoard(); }
    this._setStatus("reconnecting", "再接続中…", "切断中はサーバーが自動行動を担当します");
    this.guildStatus = "再接続中です。接続が戻ると操作を再開できます。";
    if (this.friendPanelOpen) this._renderFriendPanel();
    if (!this.mounted && !this.backgroundActive) return;
    clearTimeout(this.reconnectTimer); const delay = Math.min(10000, 800 * Math.pow(1.7, this.reconnectAttempts++));
    this.reconnectTimer = setTimeout(() => this.connect({ reconnect: true }), delay);
  }

  disconnect({ leave = true, quiet = false } = {}) {
    clearTimeout(this.reconnectTimer); this.reconnectTimer = null; this.manualClose = true;
    this.connectionReady = false; this.helloAckPending = false; this.connectionModePending = false; this.foregroundProfileSyncPending = false; this._clearPowerRankingRequests("offline"); this._notifyPowerRankingCapability(); this._clearMoveInputs();
    storageSet(ONLINE_STORAGE_KEYS.autoConnect, "0");
    if (leave) this._send("leaveRoom");
    if (this.ws) try { this.ws.close(1000, "client disconnect"); } catch {}
    this.ws = null;
    const cleared = this._clearRoom({ reason: leave ? "disconnectLeave" : "disconnect" });
    if (!cleared) return false;
    if (!quiet) this._setStatus("offline", "オフライン", "通常ゲームのセーブには影響しません");
    return true;
  }

  _confirmRoomExit() {
    if (!this.roomState || typeof globalThis.confirm !== "function") return true;
    const active = this.roomState.phase && this.roomState.phase !== "lobby";
    return globalThis.confirm(active ? "進行中のオンラインプレイから退出しますか？\n部屋主の進行や他の参加者へ影響する場合があります。" : "このオンライン部屋から退出しますか？");
  }

  _requestRoomLeave({ exitAfter = false, onComplete = null } = {}) {
    if (!this.roomState) {
      if (exitAfter) { const complete = typeof onComplete === "function" ? onComplete : this.onBack; this.disconnect({ leave: false, quiet: true }); complete(); }
      else this._clearRoom({ reason: "leaveWithoutRoom" });
      return;
    }
    if (this.pendingLeaveOnReconnect) {
      this.pendingLeaveOnReconnect.exitAfter ||= exitAfter;
      if (exitAfter && typeof onComplete === "function" && !this.pendingLeaveOnReconnect.onComplete) this.pendingLeaveOnReconnect.onComplete = onComplete;
      return;
    }
    const socketReady = Boolean(this.connectionReady && this.ws && typeof WebSocket !== "undefined" && this.ws.readyState === WebSocket.OPEN);
    this.pendingLeaveOnReconnect = { roomId: this.roomId, exitAfter: Boolean(exitAfter), onComplete: typeof onComplete === "function" ? onComplete : null, sent: false };
    clearTimeout(this.pendingLeaveTimer);
    this.pendingLeaveTimer = setTimeout(() => {
      this.pendingLeaveTimer = null;
      if (!this.pendingLeaveOnReconnect) return;
      this.pendingLeaveOnReconnect.allowOfflineExit = true;
      this._setStatus("reconnecting", "退出待機中…", "再接続を待つか、オフラインで閉じることができます");
    }, 4000);
    this._clearMoveInputs();
    this.manualClose = false;
    storageSet(ONLINE_STORAGE_KEYS.autoConnect, "1");
    this._setStatus("reconnecting", "退出処理中…", socketReady ? "サーバーへ退出を確定しています" : "再接続してからサーバーへ退出を確定します");
    if (socketReady) {
      this.pendingLeaveOnReconnect.sent = this._send("leaveRoom");
      if (this.pendingLeaveOnReconnect.sent) return;
    }
    if (!this.ws || typeof WebSocket === "undefined" || ![WebSocket.OPEN, WebSocket.CONNECTING].includes(this.ws.readyState)) this.connect({ reconnect: true });
  }

  _completePendingRoomLeave() {
    const pending = this.pendingLeaveOnReconnect;
    const unsettled = [...(this.recoverySettlementTasks ?? [])];
    if (pending && unsettled.length && !pending.waitingForSettlement) {
      pending.waitingForSettlement = true;
      this._setStatus("reconnecting", "退出結果を保存中…", "HP・MPと受け取った報酬を保存してから部屋を閉じます");
      Promise.allSettled(unsettled).then(() => { if (this.pendingLeaveOnReconnect === pending) this._completePendingRoomLeave(); });
      return;
    }
    clearTimeout(this.pendingLeaveTimer); this.pendingLeaveTimer = null;
    if (!this._clearRoom({ reason: "leaveComplete" })) {
      if (pending) {
        pending.waitingForSettlement = false;
        pending.allowOfflineExit = false;
        this.pendingLeaveOnReconnect = pending;
      }
      return false;
    }
    this.pendingLeaveOnReconnect = null;
    if (pending?.exitAfter) {
      const complete = typeof pending.onComplete === "function" ? pending.onComplete : this.onBack;
      this.disconnect({ leave: false, quiet: true });
      complete();
      return true;
    }
    this._setStatus("online", "接続済み", "オンライン部屋から退出しました");
    return true;
  }

  _forceClosePendingRoomLeave() {
    const pending = this.pendingLeaveOnReconnect;
    if (!pending?.allowOfflineExit) return;
    if (typeof globalThis.confirm === "function" && !globalThis.confirm("サーバーへ退出を届けられていません。\n部屋には最大5分間表示が残る場合がありますが、オフラインで閉じますか？")) return;
    clearTimeout(this.pendingLeaveTimer); this.pendingLeaveTimer = null;
    if (!this.disconnect({ leave: false, quiet: false })) {
      this.pendingLeaveOnReconnect = pending;
      return;
    }
    this.pendingLeaveOnReconnect = null;
    this.toast("通信復旧前に閉じました。サーバー側では最大5分後に退出します");
    if (pending.exitAfter) (typeof pending.onComplete === "function" ? pending.onComplete : this.onBack)();
  }

  requestExit(onComplete = null) {
    if (!this._confirmRoomExit()) return false;
    const complete = typeof onComplete === "function" ? onComplete : this.onBack;
    if (this.roomState) this._requestRoomLeave({ exitAfter: true, onComplete: complete });
    else { this.disconnect({ leave: false, quiet: true }); complete(); }
    return true;
  }

  leaveRoom() {
    if (!this._confirmRoomExit()) return;
    this._requestRoomLeave();
  }

  async copyInvite() {
    if (!this.roomId) return;
    const source = this._query("[data-online-server-url]")?.value ?? storageGet(ONLINE_STORAGE_KEYS.serverUrl);
    const url = new URL(location.href); url.searchParams.set("partyServer", source); url.searchParams.set("partyRoom", this.roomId);
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title: "ABYSS DOMINION オンライン招待", text: `ルーム ${this.roomId} へ参加`, url: url.toString() }); return; }
      catch (error) { if (error?.name === "AbortError") return; }
    }
    this.toast(await copyText(url.toString()) ? "招待リンクをコピーしました" : "コピーできませんでした");
  }
}
