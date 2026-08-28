import {
  prepareOnlineExpansionV207,
  personalBonusDraw,
  firstClearEquipmentRarity,
  rarityAtLeast,
  resonanceContributionScore,
} from "./OnlineExpansion207.js";

function key(point) { return `${point.x},${point.y}`; }
function distance(left, right) { return Math.abs(left.x - right.x) + Math.abs(left.y - right.y); }

function ensureEncounterDensity(expedition, participants = 1) {
  const current = (expedition.objects ?? []).filter(object => object.type === "encounter");
  // Party size must not rewrite the host floor.  Multiplayer adds only the
  // optional co-op object selected by CoopGimmicks; ordinary encounters keep
  // the exact offline count, locations, and identities.
  void participants;
  expedition.totalEncounters = current.length;
  expedition.coop ??= {};
  expedition.coop.encounterRateLabel = "通常探索と同一";
}

function wallAlcoves(expedition) {
  const occupied = new Set([
    key(expedition.start),
    key(expedition.exit),
    ...[...(expedition.objects ?? []), ...(expedition.decorations ?? [])].map(key),
  ]);
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
    if (["resonanceChest", "deluxeChest"].includes(object.type)) object.persistent = true;
  }
  return expedition;
}

export {
  personalBonusDraw,
  firstClearEquipmentRarity,
  rarityAtLeast,
  resonanceContributionScore,
};
