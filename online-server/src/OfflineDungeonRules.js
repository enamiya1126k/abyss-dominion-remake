import {
  bossProfileForFloor,
  bossLevelForFloor,
  enemyHiddenProfileForFloor,
  enemyLevelForFloor,
  enemyRankStatMultiplier,
  equipmentHolderRateForFloor,
  equipmentSlotsForFloor,
  rollEnemyRank,
} from "../../src/core/EnemyScalingSystem.js";
import { treasureRoomRateForFloor, treasureRoomChestCount, shouldPlaceTreasureMimic } from "../../src/core/TreasureSystem.js";
import { campaignFloorToLegacyDepth } from "./CampaignFloorScale.js";
import { createCampaignDungeonLayout } from "../../src/core/CampaignDungeonLayoutSystem.js";
import { chooseSafeSectionExitCell, sectionIdAt } from "../../src/core/DungeonSectionSystem.js";

const CARDINALS = Object.freeze([[1, 0], [-1, 0], [0, 1], [0, -1]]);
// The shared dungeon is the host's ordinary dungeon world.  Keep the exact
// solo HP curve here; multiplayer compensation is applied by RoomStore using
// the number of participating players instead of silently weakening enemies.
export const ONLINE_ENEMY_HP_DIVISOR = 1;
export { treasureRoomRateForFloor };

const BASE_STATS = Object.freeze({
  slime: { hp: 22, atk: 7, def: 4, spd: 7 },
  cave_rat: { hp: 28, atk: 9, def: 4, spd: 12 },
  bat: { hp: 25, atk: 10, def: 3, spd: 15 },
  mushroom: { hp: 40, atk: 12, def: 8, spd: 6 },
  skeleton_archer: { hp: 52, atk: 18, def: 9, spd: 14 },
  skeleton_guard: { hp: 75, atk: 17, def: 18, spd: 7 },
  wolf: { hp: 64, atk: 22, def: 10, spd: 19 },
  orc: { hp: 92, atk: 27, def: 16, spd: 8 },
  stone_golem: { hp: 135, atk: 29, def: 31, spd: 5 },
  wraith: { hp: 82, atk: 35, def: 17, spd: 22 },
  gargoyle: { hp: 124, atk: 39, def: 32, spd: 15 },
  wyvern: { hp: 165, atk: 47, def: 30, spd: 28 },
  dragon: { hp: 240, atk: 62, def: 44, spd: 25 },
  dark_knight: { hp: 215, atk: 67, def: 52, spd: 21 },
  frost_dragon: { hp: 315, atk: 81, def: 61, spd: 29 },
  ancient_dragon: { hp: 430, atk: 104, def: 78, spd: 33 },
});

const key = point => `${point.x},${point.y}`;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function safeInteger(value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.floor(number))) : fallback;
}

// Keep these byte-for-byte equivalent to SecretRoomSystem's independent
// expedition stream. Secret-room planning must never consume the floor RNG.
function seeded(seed) {
  let value = seed >>> 0;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}

function mixSeed(seed, floor) {
  let value = (safeInteger(seed, 1, 1, 0x7fffffff) ^ (safeInteger(floor, 1, 1, 100) * 2654435761)) >>> 0;
  value ^= value >>> 16; value = Math.imul(value, 2246822507); value ^= value >>> 13; value = Math.imul(value, 3266489909); value ^= value >>> 16;
  return value >>> 0;
}

function secretRoomPlan(run, floor) {
  if (!run || run.id == null) return null;
  const safeFloor = safeInteger(floor, 1, 1, 100);
  const random = seeded(mixSeed(run.seed, safeFloor));
  return { id: `${String(run.id)}:${safeFloor}`, appears: safeFloor % 10 !== 0 && random() < .09, positionRoll: random() };
}

function floorConfig(floor, rng) {
  const tier = Math.min(9, Math.floor((floor - 1) / 10));
  const min = Math.min(31, 23 + tier);
  const max = Math.min(39, 31 + tier);
  let cols = (min + Math.floor(rng() * (max - min + 1))) | 1;
  let rows = (min + Math.floor(rng() * (max - min + 1))) | 1;
  cols = clamp(cols, 23, 39);
  rows = clamp(rows, 23, 39);
  return { cols, rows, roomCount: 5 + Math.floor(rng() * 3) };
}

function distancesFrom(tiles, start) {
  const distances = new Map([[key(start), 0]]);
  const queue = [start];
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = queue[cursor];
    for (const [dx, dy] of CARDINALS) {
      const next = { x: current.x + dx, y: current.y + dy };
      if (tiles[next.y]?.[next.x] !== "." || distances.has(key(next))) continue;
      distances.set(key(next), distances.get(key(current)) + 1);
      queue.push(next);
    }
  }
  return distances;
}

function takeCells(cells, reserved, rng, count) {
  const result = [];
  const pool = cells.filter(cell => !reserved.has(key(cell)));
  while (pool.length && result.length < count) {
    const index = Math.floor(rng() * pool.length);
    const point = pool.splice(index, 1)[0];
    reserved.add(key(point));
    result.push(point);
  }
  return result;
}

function decorationPlan(tiles, reserved, floor, rng, layout = null) {
  const cells = [], edgeCells = [];
  for (let y = 1; y < tiles.length - 1; y++) for (let x = 1; x < tiles[0].length - 1; x++) {
    if (tiles[y][x] !== "." || reserved.has(`${x},${y}`)) continue;
    const openCount = CARDINALS.filter(([dx, dy]) => tiles[y + dy]?.[x + dx] === ".").length;
    const cell = { x, y, openCount };
    cells.push(cell);
    if (openCount < 4) edgeCells.push(cell);
  }
  const used = new Set(reserved), decorations = [];
  const take = (pool, predicate = () => true) => {
    const available = pool.filter(cell => predicate(cell) && !used.has(key(cell)));
    if (!available.length) return null;
    const cell = available[Math.floor(rng() * available.length)];
    used.add(key(cell));
    return cell;
  };
  const add = (type, pool = edgeCells, options = {}) => {
    const point = take(pool, options.predicate);
    if (!point) return;
    decorations.push({ id: `${floor}-decor-${decorations.length}`, type, x: point.x, y: point.y, sectionId: layout ? sectionIdAt(layout, point.x, point.y) : null, rotation: options.rotation ?? point.rotation ?? 0, scale: options.scale ?? 1, phase: Math.floor(rng() * 997), used: false, destroyed: false });
  };
  const density = Math.min(30, Math.max(10, Math.round(cells.length / 17)));
  const cycle = ["candelabrum", "crystal", "barrel", "crate", "bones", "crystal", "candelabrum", "barrel"];
  for (let index = 0; index < density; index++) add(cycle[(index + Math.floor(rng() * cycle.length)) % cycle.length], edgeCells, { scale: index % 5 === 0 ? 1.12 : 1 });
  const waterCount = Math.max(1, Math.min(5, Math.floor(cells.length / 90)));
  for (let index = 0; index < waterCount; index++) {
    const before = decorations.length;
    add("water", cells, { scale: 1.25, predicate: cell => cell.openCount >= 3 });
    if (decorations.length === before) add("water", cells, { scale: 1.25 });
  }
  return decorations;
}

function addFirstTutorialPickup({ tiles, start, objects, decorations, floor, explorePickupDone, layout = null }) {
  if (floor !== 1 || explorePickupDone) return null;
  const occupied = new Set([...objects, ...decorations].filter(Boolean).map(entry => key(entry)));
  let point = null, nearest = Infinity;
  for (let y = 1; y < tiles.length - 1; y++) for (let x = 1; x < tiles[0].length - 1; x++) {
    if (tiles[y][x] !== "." || occupied.has(`${x},${y}`) || x === start.x && y === start.y) continue;
    const distance = Math.abs(x - start.x) + Math.abs(y - start.y);
    if (distance < nearest) { point = { x, y }; nearest = distance; }
  }
  if (!point) return null;
  const pickup = { id: "1-guide-first-pickup", ...point, sectionId: layout ? sectionIdAt(layout, point.x, point.y) : null, type: "crystal", rotation: 0, scale: 1.15, phase: 199, used: false, destroyed: false, tutorialGuide: "firstPickup" };
  decorations.push(pickup);
  return pickup;
}

function bossCorridor(floor) {
  const cols = 23;
  const rows = 31;
  const tiles = Array.from({ length: rows }, () => Array(cols).fill("#"));
  const center = Math.floor(cols / 2);
  for (let y = 3; y < rows - 3; y++) for (let x = center - 2; x <= center + 2; x++) tiles[y][x] = ".";
  for (let y = 3; y <= 11; y++) for (let x = 3; x < cols - 3; x++) tiles[y][x] = ".";
  return { cols, rows, tiles, start: { x: center, y: rows - 4 }, exit: { x: center, y: 3 }, boss: { x: center, y: 8 } };
}

function roomFloor(floor, rng) {
  const { cols, rows, roomCount } = floorConfig(floor, rng);
  const tiles = Array.from({ length: rows }, () => Array(cols).fill("#"));
  const rooms = [];
  const inside = (x, y) => x > 0 && y > 0 && x < cols - 1 && y < rows - 1;
  const carve = (x, y) => { if (inside(x, y)) tiles[y][x] = "."; };
  const center = room => ({ x: room.x + Math.floor(room.w / 2), y: room.y + Math.floor(room.h / 2) });
  const overlaps = room => rooms.some(other => room.x < other.x + other.w + 1 && room.x + room.w + 1 > other.x && room.y < other.y + other.h + 1 && room.y + room.h + 1 > other.y);
  for (let attempts = 0; rooms.length < roomCount && attempts < 900; attempts++) {
    const maxWidth = Math.min(13, cols - 4);
    const maxHeight = Math.min(11, rows - 4);
    const w = Math.max(7, Math.min(maxWidth, 7 + Math.floor(rng() * 4) * 2));
    const h = Math.max(7, Math.min(maxHeight, 7 + Math.floor(rng() * 5)));
    const room = { x: 1 + Math.floor(rng() * Math.max(1, cols - w - 2)), y: 1 + Math.floor(rng() * Math.max(1, rows - h - 2)), w, h };
    if (!overlaps(room)) rooms.push(room);
  }
  if (rooms.length < 5) rooms.splice(0, rooms.length,
    { x: 1, y: 1, w: 7, h: 7 },
    { x: cols - 8, y: 1, w: 7, h: 7 },
    { x: 1, y: rows - 8, w: 7, h: 7 },
    { x: cols - 8, y: rows - 8, w: 7, h: 7 },
    { x: Math.floor((cols - 7) / 2), y: Math.floor((rows - 7) / 2), w: 7, h: 7 });
  for (const room of rooms) for (let y = room.y; y < room.y + room.h; y++) for (let x = room.x; x < room.x + room.w; x++) carve(x, y);
  const horizontal = (from, to, y, width) => { for (let x = Math.min(from, to); x <= Math.max(from, to); x++) for (let offset = 0; offset < width; offset++) carve(x, y + offset - Math.floor((width - 1) / 2)); };
  const vertical = (from, to, x, width) => { for (let y = Math.min(from, to); y <= Math.max(from, to); y++) for (let offset = 0; offset < width; offset++) carve(x + offset - Math.floor((width - 1) / 2), y); };
  const connect = (a, b, width) => rng() < .5 ? (horizontal(a.x, b.x, a.y, width), vertical(a.y, b.y, b.x, width)) : (vertical(a.y, b.y, a.x, width), horizontal(a.x, b.x, b.y, width));
  for (let index = 1; index < rooms.length; index++) {
    const current = center(rooms[index]);
    const prior = rooms.slice(0, index).map(center);
    const parent = prior.reduce((best, point) => Math.abs(point.x - current.x) + Math.abs(point.y - current.y) < Math.abs(best.x - current.x) + Math.abs(best.y - current.y) ? point : best, prior[0]);
    connect(parent, current, rng() < .62 ? 3 : 4);
  }
  if (rooms.length > 3 && rng() < .6) connect(center(rooms[Math.floor(rng() * rooms.length)]), center(rooms[Math.floor(rng() * rooms.length)]), 3);
  const cells = [];
  for (let y = 1; y < rows - 1; y++) for (let x = 1; x < cols - 1; x++) if (tiles[y][x] === ".") cells.push({ x, y });
  const start = center(rooms[0]);
  const distances = distancesFrom(tiles, start);
  const wallAdjacent = cells.filter(cell => CARDINALS.some(([dx, dy]) => tiles[cell.y + dy]?.[cell.x + dx] === "#"));
  const exit = (wallAdjacent.length ? wallAdjacent : cells).reduce((best, cell) => (distances.get(key(cell)) ?? -1) > (distances.get(key(best)) ?? -1) ? cell : best, start);
  return { cols, rows, tiles, start, exit, cells, distances };
}

export function createSoloStyleDungeon({ roomId, floor, runId, now, random, chestSpawnBonus = 0, secretRoomRun = null, explorePickupDone = false, bossIds = [], recentSignatures = [] }) {
  const bossFloor = true;
  const layout = createCampaignDungeonLayout({ floor, bossIds, random, recentSignatures });
  const tiles = layout.tiles.map(row => row.map(tile => tile === 0 ? "." : "#"));
  const cells = layout.sections.flatMap(section => section.cells.map(cell => ({ ...cell, sectionId: section.id })));
  const reserved = new Set([key(layout.start)]);
  for (const portal of layout.sectionPortals) { reserved.add(`${portal.x},${portal.y}`); reserved.add(`${portal.arrivalX},${portal.arrivalY}`); }
  const bossSection = layout.sections.find(section => section.id !== layout.startSectionId) ?? layout.sections.at(-1);
  const bossCandidates = bossSection.cells.map(cell => ({ ...cell, sectionId: bossSection.id })).filter(cell => Math.abs(cell.x - layout.start.x) + Math.abs(cell.y - layout.start.y) > 4 && !reserved.has(key(cell)));
  const bossPoint = takeCells(bossCandidates, reserved, random, 1)[0] ?? { ...bossSection.center, sectionId: bossSection.id };
  const exit = chooseSafeSectionExitCell(bossSection, { reserved: [...reserved], awayFrom: [bossPoint], minimumDistance: 3, random }) ?? bossCandidates.at(-1) ?? bossPoint;
  reserved.add(key(exit));
  const candidates = cells.filter(cell => Math.abs(cell.x - layout.start.x) + Math.abs(cell.y - layout.start.y) > 4 && Math.abs(cell.x - exit.x) + Math.abs(cell.y - exit.y) > 4 && !reserved.has(key(cell)));
  const objects = [];
  const add = (type, point, index, extra = {}) => { if (point) { reserved.add(key(point)); objects.push({ id: `${type}-${index}`, type, ...point, sectionId: point.sectionId ?? sectionIdAt(layout, point.x, point.y), resolved: false, ...extra }); } };
  let treasureRoom = false;
  add("encounter", bossPoint, 1, { bossEncounter: true, postBossExit: { ...exit } });
  const shuffledSections = layout.sections.map(section => ({ section, roll: random() })).sort((a, b) => a.roll - b.roll).map(entry => entry.section);
  shuffledSections.slice(0, 3).forEach((section, index) => {
    const sectionCells = section.cells.map(cell => ({ ...cell, sectionId: section.id })).filter(cell => !reserved.has(key(cell)) && Math.abs(cell.x - layout.start.x) + Math.abs(cell.y - layout.start.y) >= 4);
    add("campaignKey", takeCells(sectionCells, reserved, random, 1)[0] ?? section.center, index + 1, { shared: true, persistent: true });
  });
  {
    treasureRoom = random() < treasureRoomRateForFloor(campaignFloorToLegacyDepth(floor));
    const chestCount = treasureRoom ? treasureRoomChestCount(random) : random() < Math.max(0, .16 - Math.max(0, Number(chestSpawnBonus) || 0)) ? 0 : random() < .72 ? 1 : 2;
    const pick = () => {
      const available = candidates.filter(cell => !reserved.has(key(cell))), pool = available.length ? available : candidates.length ? candidates : cells;
      const point = { ...pool[Math.floor(random() * pool.length)] }; reserved.add(key(point)); return point;
    };
    let treasureMimics = 0;
    for (let index = 0; index < chestCount; index++) {
      const roll = random(), kind = treasureRoom ? (roll > .48 ? "radiant" : "cabinet") : roll > .96 ? "radiant" : roll > .78 ? "cabinet" : roll > .25 ? "box" : "apple";
      const locked = kind === "radiant" && random() < (treasureRoom ? .58 : .45), mimic = !locked && shouldPlaceTreasureMimic({ treasureRoom, mimicsPlaced: treasureMimics, random }), point = pick();
      if (mimic) treasureMimics++;
      objects.push({ id: `${floor}-${index}`, type: "chest", ...point, sectionId: point.sectionId ?? sectionIdAt(layout, point.x, point.y), resolved: false, kind, locked, mimic, treasureRoom });
    }
    const roomPlan = secretRoomPlan(secretRoomRun, floor);
    if (roomPlan?.appears) {
      const wallAdjacent = cells.filter(cell => CARDINALS.some(([dx, dy]) => tiles[cell.y + dy]?.[cell.x + dx] === "#"));
      const candidateKeys = new Set(candidates.map(key));
      const preferred = wallAdjacent.filter(cell => candidateKeys.has(key(cell)) && !reserved.has(key(cell)));
      if (preferred.length) {
        const roll = Math.max(0, Math.min(.999999, Number(roomPlan.positionRoll) || 0));
        const point = { ...preferred[Math.floor(roll * preferred.length)] };
        reserved.add(key(point));
        const directions = [{ dx: 0, dy: -1, rotation: 0 }, { dx: 1, dy: 0, rotation: Math.PI / 2 }, { dx: 0, dy: 1, rotation: Math.PI }, { dx: -1, dy: 0, rotation: -Math.PI / 2 }];
        const rotation = directions.find(direction => tiles[point.y + direction.dy]?.[point.x + direction.dx] === "#")?.rotation ?? 0;
        objects.push({ id: roomPlan.id, roomId: roomPlan.id, type: "secretRoom", ...point, sectionId: point.sectionId ?? sectionIdAt(layout, point.x, point.y), rotation, resolved: false, persistent: true });
      }
    }
  }
  objects.push({ id: "exit", type: "exit", ...exit, sectionId: exit.sectionId ?? bossSection.id, resolved: false, hidden: true });
  const nextEncounter = 10 + Math.floor(random() * 23);
  const decorations = decorationPlan(tiles, reserved, floor, random, layout);
  addFirstTutorialPickup({ tiles, start: layout.start, objects, decorations, floor, explorePickupDone, layout });
  return {
    id: runId, roomId, floor, cols: layout.cols, rows: layout.rows,
    tiles: tiles.map(row => row.join("")), start: layout.start, exit,
    layoutVersion: layout.layoutVersion, shape: layout.shape,
    sections: layout.sections, rooms: layout.sections, sectionGraph: layout.sectionGraph,
    sectionPortals: layout.sectionPortals, sectionByCell: layout.sectionByCell,
    startSectionId: layout.startSectionId, currentSectionId: layout.startSectionId,
    roomAttributes: layout.roomAttributes, shapeSignatures: layout.shapeSignatures,
    objects, decorations, treasureRoom, steps: 0,
    nextEncounter, encountersEnabled: true, campaignKeysCollected: 0,
    discoveries: 0,
    totalDiscoveries: objects.filter(object => object.type === "chest").length + decorations.filter(object => ["barrel", "crate", "bones", "crystal", "water"].includes(object.type)).length,
    encountersCleared: 0, totalEncounters: bossFloor ? 1 : 0,
    exitReached: false, stairsMemberIds: new Set(), stairsCountdownEndsAt: 0,
    returnVotes: new Set(), startedAt: now, eventCount: 0, lastEvent: null, battle: null,
  };
}

export function encounterCountForFloor(floor, roll) {
  if (floor <= 4) return 1;
  if (floor < 10) return roll < .18 ? 2 : 1;
  if (floor < 50) return roll < .05 ? 3 : roll < .34 ? 2 : 1;
  if (floor < 100) return roll < .05 ? 1 : roll < .38 ? 2 : roll < .73 ? 3 : 4;
  return roll < .01 ? 1 : roll < .09 ? 2 : roll < .27 ? 3 : 4;
}

export function floorEnemyStats({ floor, template, random, boss = false }) {
  const depth=campaignFloorToLegacyDepth(floor);
  const sourceBase = template?.baseStats ?? BASE_STATS[template.id] ?? BASE_STATS.slime;
  const base = {
    hp: Math.max(1, Number(sourceBase.hp) || BASE_STATS.slime.hp),
    atk: Math.max(1, Number(sourceBase.atk) || BASE_STATS.slime.atk),
    def: Math.max(0, Number(sourceBase.def) || 0),
    spd: Math.max(1, Number(sourceBase.spd) || BASE_STATS.slime.spd),
  };
  const level = boss ? bossLevelForFloor(depth) : enemyLevelForFloor(depth, random());
  const rank = rollEnemyRank(depth, random());
  const rankMultiplier = enemyRankStatMultiplier(rank);
  const equipped = boss || random() < equipmentHolderRateForFloor(depth);
  const hidden = enemyHiddenProfileForFloor(depth, { rank, boss, equipped, slots: equipped ? equipmentSlotsForFloor(depth) : 0, roll: random() });
  const bossProfile = boss ? bossProfileForFloor(depth) : { hp: 1, atk: 1, def: 1, spd: 1 };
  const depthHp = 1 + Math.max(0, depth - 60) / 180;
  const depthAtk = 1 + Math.max(0, depth - 80) / 340;
  const variance = .94 + random() * .12;
  const unscaledHp = (base.hp + level * 8) * rankMultiplier * hidden.hp * bossProfile.hp * depthHp * variance;
  const maxHp = Math.max(1, Math.round(unscaledHp / ONLINE_ENEMY_HP_DIVISOR));
  const atk = Math.max(1, Math.round((base.atk + level * 1.4) * rankMultiplier * hidden.atk * bossProfile.atk * depthAtk * variance));
  const def = Math.max(0, Math.round((base.def + level * .5) * rankMultiplier * hidden.def * bossProfile.def * variance));
  const spd = Math.max(1, Math.round((base.spd + level * .18) * hidden.spd * bossProfile.spd * variance));
  return { level, rank, maxHp, hp: maxHp, atk, matk: Math.max(1, Math.round(atk * (.82 + random() * .26))), def, mdef: Math.max(0, Math.round(def * (.84 + random() * .24))), spd, equipped: Boolean(hidden.active), equipmentSlots: hidden.slots ?? 0, equipmentLevel: hidden.gearLevel ?? 0, equipmentRarity: hidden.rarity ?? null };
}
