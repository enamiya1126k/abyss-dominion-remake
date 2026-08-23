import {
  prepareOnlineExpansionV207,
  personalBonusDraw,
  firstClearEquipmentRarity,
  rarityAtLeast,
  resonanceContributionScore,
} from "./OnlineExpansion207.js";

function key(point) { return `${point.x},${point.y}`; }
function distance(left, right) { return Math.abs(left.x - right.x) + Math.abs(left.y - right.y); }

function seededScore(seed, point) {
  let value = 2166136261;
  for (const character of `${seed}:${point.x}:${point.y}`) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return value >>> 0;
}

function ensureEncounterDensity(expedition, participants = 1) {
  const current = (expedition.objects ?? []).filter(object => object.type === "encounter");
  const partySize = Math.max(1, Math.min(4, Number(participants) || 1));
  // One player receives the solo baseline. Each additional player adds 10%
  // pressure so co-op stays lively without turning every step into a battle.
  const soloBaseline = Math.max(4, Math.min(6, 4 + Math.floor((Number(expedition.floor) || 1) / 200)));
  const target = Math.max(current.length, Math.round(soloBaseline * (1 + (partySize - 1) * .1)));
  if (current.length >= target) { expedition.totalEncounters = current.length; return; }
  const occupied = new Set((expedition.objects ?? []).map(key));
  const candidates = [];
  for (let y = 1; y < expedition.rows - 1; y++) for (let x = 1; x < expedition.cols - 1; x++) {
    const point = { x, y };
    if (expedition.tiles[y]?.[x] !== "." || occupied.has(key(point))) continue;
    if (distance(point, expedition.start) < 4 || distance(point, expedition.exit) < 3) continue;
    candidates.push(point);
  }
  candidates.sort((left, right) => seededScore(expedition.id ?? expedition.floor, left) - seededScore(expedition.id ?? expedition.floor, right));
  for (let index = current.length; index < target && candidates.length; index++) {
    const point = candidates.shift();
    expedition.objects.push({ id: `online-encounter-${index}-${point.x}-${point.y}`, type: "encounter", ...point, resolved: false, hidden: false, onlineAdded: true });
    occupied.add(key(point));
  }
  expedition.totalEncounters = expedition.objects.filter(object => object.type === "encounter").length;
  expedition.coop ??= {};
  expedition.coop.encounterRateLabel = partySize === 1 ? "ソロ同等" : `ソロ比 +${(partySize - 1) * 10}%`;
}

function wallAlcoves(expedition) {
  const occupied = new Set((expedition.objects ?? []).map(key));
  const result = [];
  for (let y = 1; y < expedition.rows - 1; y++) {
    for (let x = 1; x < expedition.cols - 1; x++) {
      if (expedition.tiles[y]?.[x] !== "." || expedition.tiles[y - 1]?.[x] === ".") continue;
      if (occupied.has(`${x},${y}`) || distance({ x, y }, expedition.start) < 4) continue;
      result.push({ x, y, wallSide: "top" });
    }
  }
  return result.sort((left, right) => distance(right, expedition.start) - distance(left, expedition.start));
}

function moveVaultIntoWall(expedition) {
  const vault = (expedition.objects ?? []).find(object => object.type === "resonanceVault");
  if (!vault) return;
  const destination = wallAlcoves(expedition)[0];
  if (!destination) { vault.wallSide = "top"; return; }
  const origin = { x: vault.x, y: vault.y };
  for (const object of expedition.objects ?? []) {
    if (object.x !== origin.x || object.y !== origin.y) continue;
    if (!["resonanceVault", "coopElite", "deluxeChest"].includes(object.type)) continue;
    object.x = destination.x;
    object.y = destination.y;
    object.wallSide = "top";
  }
}

export function prepareOnlineExpansionV208(expedition, options = {}) {
  prepareOnlineExpansionV207(expedition, options);
  ensureEncounterDensity(expedition, options.participants);
  moveVaultIntoWall(expedition);
  for (const object of expedition.objects ?? []) {
    if (["resonanceChest", "deluxeChest", "rarePortalChest"].includes(object.type)) object.persistent = true;
  }
  const rare = expedition.coop?.rare;
  if (!rare) return expedition;
  rare.realmActive = false;
  rare.portalReturned = false;
  if (rare.kind === "hiddenPortal") {
    const portal = expedition.objects.find(object => object.type === "rarePortal");
    const alcove = wallAlcoves(expedition)[0];
    if (portal && alcove) Object.assign(portal, alcove);
    else if (portal) portal.wallSide = "top";
    // The guardian and reward belong to a dedicated chamber in build208,
    // rather than being stacked on an arbitrary tile of the host dungeon.
    expedition.objects = expedition.objects.filter(object => !["rarePortalGuardian", "rarePortalChest"].includes(object.type));
    delete rare.destination;
  }
  return expedition;
}

export function createRareTreasureRealm208({ floor = 1 } = {}) {
  const rows = [
    "#############",
    "#...........#",
    "#...........#",
    "#..#.....#..#",
    "#...........#",
    "#...........#",
    "#..#.....#..#",
    "#...........#",
    "#...........#",
    "#...........#",
    "#############",
  ];
  const start = { x: 6, y: 9 };
  return {
    cols: rows[0].length,
    rows: rows.length,
    tiles: rows.map(row => [...row]),
    start,
    exit: { ...start },
    objects: [
      { id: "rare-realm-guardian", type: "rarePortalGuardian", x: 6, y: 4, resolved: false, hidden: false, rare: true },
      { id: "rare-realm-chest", type: "rarePortalChest", x: 6, y: 2, resolved: false, hidden: true, persistent: true, rewardTier: "abyss", rare: true },
      { id: "rare-realm-return", type: "rareReturnPortal", x: 6, y: 9, resolved: false, hidden: true, persistent: true, wallSide: "bottom", rare: true },
    ],
    decorations: [
      { id: "realm-crystal-l", type: "crystal", x: 2, y: 2, phase: 11 },
      { id: "realm-crystal-r", type: "crystal", x: 10, y: 2, phase: 31 },
      { id: "realm-flame-l", type: "candelabrum", x: 3, y: 5, phase: 17 },
      { id: "realm-flame-r", type: "candelabrum", x: 9, y: 5, phase: 47 },
      { id: "realm-bones-l", type: "bones", x: 2, y: 8, phase: 5 },
      { id: "realm-bones-r", type: "bones", x: 10, y: 8, phase: 23 },
    ],
    floor: Math.max(1, Number(floor) || 1),
  };
}

export {
  personalBonusDraw,
  firstClearEquipmentRarity,
  rarityAtLeast,
  resonanceContributionScore,
};
