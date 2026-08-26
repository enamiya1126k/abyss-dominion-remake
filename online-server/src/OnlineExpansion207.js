import { prepareCoopExpeditionV206 } from "./CoopGimmicks.js";

const RARE_KINDS = Object.freeze(["goldenMonster", "otherworldMerchant", "hiddenPortal"]);
const RARITY_ORDER = Object.freeze(["N", "R", "SR", "SSR", "UR", "LR"]);

function hashText(value) {
  let hash = 2166136261;
  for (const char of String(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function key(point) { return `${point.x},${point.y}`; }
function distance(left, right) { return Math.abs(left.x - right.x) + Math.abs(left.y - right.y); }

function freeCells(expedition) {
  const occupied = new Set([
    key(expedition.start), key(expedition.exit),
    ...(expedition.objects ?? []).map(key),
  ]);
  const cells = [];
  for (let y = 1; y < expedition.rows - 1; y++) {
    for (let x = 1; x < expedition.cols - 1; x++) {
      if (expedition.tiles[y]?.[x] !== "." || occupied.has(`${x},${y}`)) continue;
      cells.push({ x, y });
    }
  }
  return cells;
}

function takeFar(cells, source, random) {
  if (!cells.length) return { ...source };
  const ranked = [...cells].sort((a, b) => distance(b, source) - distance(a, source));
  const pool = ranked.slice(0, Math.max(1, Math.ceil(ranked.length * .22)));
  const point = pool[Math.floor(random() * pool.length)] ?? ranked[0];
  const index = cells.findIndex(entry => entry.x === point.x && entry.y === point.y);
  if (index >= 0) cells.splice(index, 1);
  return point;
}

function takeMid(cells, source, random) {
  if (!cells.length) return { ...source };
  const pool = cells.filter(point => distance(point, source) >= 5);
  const sourcePool = pool.length ? pool : cells;
  const point = sourcePool[Math.floor(random() * sourcePool.length)] ?? sourcePool[0];
  const index = cells.findIndex(entry => entry.x === point.x && entry.y === point.y);
  if (index >= 0) cells.splice(index, 1);
  return point;
}

export function rareEventChance({ floor = 1, participants = 1, resonance = 0 } = {}) {
  if (Math.max(1, Math.floor(Number(participants) || 1)) < 2 || Math.max(1, Math.floor(Number(floor) || 1)) % 10 === 0) return 0;
  return Math.min(.32, .12 + Math.min(10, Math.floor(Number(floor) / 100)) * .008 + Math.max(0, Number(participants) - 1) * .025 + Math.max(0, Number(resonance)) * .012);
}

export function chooseRareEvent({ ownerId = "", floor = 1, runId = "", participants = 1, resonance = 0, forceRare = null } = {}) {
  if (Math.max(1, Math.floor(Number(participants) || 1)) < 2 || Math.max(1, Math.floor(Number(floor) || 1)) % 10 === 0) return null;
  if (RARE_KINDS.includes(forceRare)) return forceRare;
  const random = seededRandom(hashText(`rare207:${ownerId}:${floor}:${runId}`));
  if (random() >= rareEventChance({ floor, participants, resonance })) return null;
  const roll = random();
  return roll < .45 ? "goldenMonster" : roll < .75 ? "otherworldMerchant" : "hiddenPortal";
}

export function prepareOnlineExpansionV207(expedition, {
  ownerId,
  hostWorld,
  contribution = null,
  participants = 1,
  resonance = 0,
  forceRare = null,
} = {}) {
  prepareCoopExpeditionV206(expedition, { leaderId: ownerId, hostWorld, contribution, participants });
  expedition.hostOwnerId = ownerId;
  expedition.coop ??= {};
  expedition.coop.resonance = {
    level: Math.max(0, Math.min(5, Number(resonance) || 0)),
    max: 5,
    rewardBonusPct: Math.max(0, Math.min(15, (Number(resonance) || 0) * 3)),
    contributionBonusPct: Math.max(0, Math.min(10, (Number(resonance) || 0) * 2)),
  };
  expedition.coop.ownerDisconnectedAt = 0;
  expedition.coop.ownerReconnectDeadline = 0;

  const kind = chooseRareEvent({ ownerId, floor: expedition.floor, runId: expedition.id, participants, resonance, forceRare });
  expedition.coop.rare = {
    kind,
    resolved: !kind,
    merchantClaims: {},
    portalEntered: false,
    guardianDefeated: false,
  };
  if (!kind) return expedition;

  const random = seededRandom(hashText(`rare-place207:${ownerId}:${expedition.floor}:${expedition.id}`));
  const cells = freeCells(expedition);
  const entry = takeMid(cells, expedition.start, random);
  if (kind === "goldenMonster") {
    expedition.objects.push({ id: "rare-golden-monster", type: "rareGoldenMonster", ...entry, resolved: false, rare: true });
  } else if (kind === "otherworldMerchant") {
    expedition.objects.push({ id: "rare-otherworld-merchant", type: "rareMerchant", ...entry, resolved: false, persistent: true, rare: true });
  } else {
    const destination = takeFar(cells, entry, random);
    expedition.coop.rare.destination = destination;
    expedition.objects.push(
      { id: "rare-hidden-portal", type: "rarePortal", ...entry, resolved: false, persistent: true, rare: true },
      { id: "rare-portal-guardian", type: "rarePortalGuardian", ...destination, resolved: false, hidden: true, rare: true },
      { id: "rare-portal-chest", type: "rarePortalChest", ...destination, resolved: false, hidden: true, rare: true },
    );
  }
  expedition.totalDiscoveries = Math.max(1, Number(expedition.totalDiscoveries) || 0) + 1;
  return expedition;
}

export function personalBonusDraw(random = Math.random, { floor = 1, resonance = 0, premium = false } = {}) {
  const chance = Math.min(.4, (premium ? .25 : .18) + Math.max(0, Number(resonance)) * .03);
  if (random() >= chance) return null;
  const roll = random();
  if (roll < .42) return { reward: { gold: Math.max(500, Math.round((Number(floor) + 10) * (premium ? 280 : 130))) }, label: "追加GOLD" };
  if (roll < .68) return { reward: { captureCrystals: premium ? 2 : 1 }, label: "追加捕獲結晶" };
  const rarityRoll = random(), rarity = rarityRoll > .985 ? "LR" : rarityRoll > .90 ? "UR" : rarityRoll > .64 ? "SSR" : "SR";
  return { reward: { randomEquipmentRarity: rarity }, label: `${rarity}装備`, rarity };
}

export function firstClearEquipmentRarity(floor = 1) {
  const value = Math.max(1, Number(floor) || 1);
  if (value >= 1000) return "LR";
  if (value >= 500) return "UR";
  if (value >= 100) return "SSR";
  if (value >= 30) return "SR";
  return "R";
}

export function rarityAtLeast(rarity, threshold = "UR") {
  return RARITY_ORDER.indexOf(String(rarity)) >= RARITY_ORDER.indexOf(String(threshold));
}

export function resonanceContributionScore(value = {}, resonance = 0) {
  const base = Math.max(0, Math.round(
    (Number(value.exploration) || 0) * 100 +
    (Number(value.combat) || 0) +
    (Number(value.rescue) || 0) * 500 +
    (Number(value.chests) || 0) * 250 +
    (Number(value.switches) || 0) * 400 +
    (Number(value.gimmicks) || 0) * 450 +
    (Number(value.pings) || 0) * 40 +
    (Number(value.support) || 0) * .4
  ));
  return Math.round(base * (1 + Math.max(0, Math.min(5, Number(resonance) || 0)) * .02));
}
