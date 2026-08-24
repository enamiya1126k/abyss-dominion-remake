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

const CARDINALS = Object.freeze([[1, 0], [-1, 0], [0, 1], [0, -1]]);
// The shared dungeon is the host's ordinary dungeon world.  Keep the exact
// solo HP curve here; multiplayer compensation is applied by RoomStore using
// the number of participating players instead of silently weakening enemies.
export const ONLINE_ENEMY_HP_DIVISOR = 1;

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

function floorConfig(floor, rng) {
  const tier = Math.min(9, Math.floor((floor - 1) / 10));
  const min = Math.min(31, 23 + tier);
  const max = Math.min(39, 31 + tier);
  let cols = (min + Math.floor(rng() * (max - min + 1))) | 1;
  let rows = (min + Math.floor(rng() * (max - min + 1))) | 1;
  cols = clamp(cols, 23, 39);
  rows = clamp(rows, 23, 39);
  return { cols, rows, roomCount: 3 + Math.floor(rng() * Math.min(5, 3 + Math.floor(tier / 3))) };
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

function decorationPlan(tiles, reserved, floor, rng) {
  const cells = [];
  for (let y = 1; y < tiles.length - 1; y++) for (let x = 1; x < tiles[0].length - 1; x++) {
    if (tiles[y][x] !== "." || reserved.has(`${x},${y}`)) continue;
    const openCount = CARDINALS.filter(([dx, dy]) => tiles[y + dy]?.[x + dx] === ".").length;
    if (openCount < 4) cells.push({ x, y });
  }
  const types = ["candelabrum", "crystal", "barrel", "crate", "bones", "crystal", "candelabrum", "barrel"];
  return takeCells(cells, new Set(reserved), rng, Math.min(24, Math.max(8, Math.round(cells.length / 18))))
    .map((point, index) => ({ id: `${floor}-decor-${index}`, type: types[index % types.length], ...point, phase: Math.floor(rng() * 997) }));
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
  if (rooms.length < 3) rooms.splice(0, rooms.length,
    { x: 1, y: 1, w: 7, h: 7 },
    { x: cols - 8, y: 1, w: 7, h: 7 },
    { x: Math.floor((cols - 7) / 2), y: rows - 8, w: 7, h: 7 });
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

export function createSoloStyleDungeon({ roomId, floor, runId, now, random }) {
  const bossFloor = floor % 10 === 0;
  const layout = bossFloor ? bossCorridor(floor) : roomFloor(floor, random);
  const tiles = layout.tiles;
  const cells = layout.cells ?? tiles.flatMap((row, y) => row.map((tile, x) => tile === "." ? { x, y } : null).filter(Boolean));
  const reserved = new Set([key(layout.start), key(layout.exit)]);
  const candidates = cells.filter(cell => Math.abs(cell.x - layout.start.x) + Math.abs(cell.y - layout.start.y) > 4 && Math.abs(cell.x - layout.exit.x) + Math.abs(cell.y - layout.exit.y) > 3);
  const objects = [];
  const add = (type, point, index) => { if (point) { reserved.add(key(point)); objects.push({ id: `${type}-${index}`, type, ...point, resolved: false }); } };
  if (bossFloor) add("encounter", layout.boss, 1);
  else {
    const chestCount = random() < .16 ? 0 : random() < .72 ? 1 : 2;
    takeCells(candidates, reserved, random, chestCount).forEach((point, index) => add("chest", point, index + 1));
    takeCells(candidates, reserved, random, 2).forEach((point, index) => add("bone", point, index + 1));
    takeCells(candidates, reserved, random, 1).forEach(point => add("shrine", point, 1));
    takeCells(candidates, reserved, random, 3).forEach((point, index) => add("encounter", point, index + 1));
  }
  objects.push({ id: "exit", type: "exit", ...layout.exit, resolved: false });
  const decorations = decorationPlan(tiles, reserved, floor, random);
  return {
    id: runId, roomId, floor, cols: layout.cols, rows: layout.rows,
    tiles: tiles.map(row => row.join("")), start: layout.start, exit: layout.exit,
    objects, decorations, discoveries: 0,
    totalDiscoveries: objects.filter(object => ["chest", "bone", "shrine"].includes(object.type)).length,
    encountersCleared: 0, totalEncounters: objects.filter(object => object.type === "encounter").length,
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
  const sourceBase = template?.baseStats ?? BASE_STATS[template.id] ?? BASE_STATS.slime;
  const base = {
    hp: Math.max(1, Number(sourceBase.hp) || BASE_STATS.slime.hp),
    atk: Math.max(1, Number(sourceBase.atk) || BASE_STATS.slime.atk),
    def: Math.max(0, Number(sourceBase.def) || 0),
    spd: Math.max(1, Number(sourceBase.spd) || BASE_STATS.slime.spd),
  };
  const level = boss ? bossLevelForFloor(floor) : floor === 1 ? 1 : enemyLevelForFloor(floor, random());
  const rank = rollEnemyRank(floor, random());
  const rankMultiplier = enemyRankStatMultiplier(rank);
  const equipped = boss || random() < equipmentHolderRateForFloor(floor);
  const hidden = enemyHiddenProfileForFloor(floor, { rank, boss, equipped, slots: equipped ? equipmentSlotsForFloor(floor) : 0, roll: random() });
  const bossProfile = boss ? bossProfileForFloor(floor) : { hp: 1, atk: 1, def: 1, spd: 1 };
  const depthHp = 1 + Math.max(0, floor - 60) / 180;
  const depthAtk = 1 + Math.max(0, floor - 80) / 340;
  const variance = .94 + random() * .12;
  const unscaledHp = (base.hp + level * 8) * rankMultiplier * hidden.hp * bossProfile.hp * depthHp * variance;
  const maxHp = Math.max(1, Math.round(unscaledHp / ONLINE_ENEMY_HP_DIVISOR));
  const atk = Math.max(1, Math.round((base.atk + level * 1.4) * rankMultiplier * hidden.atk * bossProfile.atk * depthAtk * variance));
  const def = Math.max(0, Math.round((base.def + level * .5) * rankMultiplier * hidden.def * bossProfile.def * variance));
  const spd = Math.max(1, Math.round((base.spd + level * .18) * hidden.spd * bossProfile.spd * variance));
  return { level, rank, maxHp, hp: maxHp, atk, matk: Math.max(1, Math.round(atk * (.82 + random() * .26))), def, mdef: Math.max(0, Math.round(def * (.84 + random() * .24))), spd, equipmentLevel: hidden.gearLevel ?? 0 };
}
