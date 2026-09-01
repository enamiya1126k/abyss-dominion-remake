import test from "node:test";
import assert from "node:assert/strict";
import { ExploreScreen } from "../src/ui/screens/ExploreScreen.js";
import { renderOnlineExplore } from "../src/online/OnlineViews.js";

const ownerId = "AD-B256-OWNER";
const guestId = "AD-B256-GUEST";
const floor = 37;
const gameState = {
  player: { currentFloor: floor, maxFloor: floor, gold: 1200, crystals: 9 },
  inventory: {},
  settings: {},
  party: [],
  monsters: [],
};

const profile = (name, monsterId) => ({
  displayName: name,
  monsterName: `${name}の魔物`,
  monsterId,
  speciesId: "slime",
  attribute: "water",
  level: 30,
  power: 900,
  currentHp: 420,
  currentMp: 55,
  battleStats: { hp: 500, mp: 60, atk: 180, matk: 160, def: 130, mdef: 120, spd: 90, crit: 5 },
  skills: [],
});

function sharedRoom() {
  return {
    roomId: "B256FX",
    ownerId,
    leaderId: ownerId,
    phase: "expedition",
    selectedFloor: floor,
    members: [
      { playerId: ownerId, leader: true, connected: true, dungeonPosition: { x: 2, y: 2 }, coopVitals: { hp: 420, maxHp: 500, mp: 55, maxMp: 60 }, profile: profile("部屋主", "owner-monster") },
      { playerId: guestId, connected: true, dungeonPosition: { x: 3, y: 2 }, coopVitals: { hp: 390, maxHp: 500, mp: 48, maxMp: 60 }, profile: profile("同行者", "guest-monster") },
    ],
    expedition: {
      id: "build256-foundation",
      floor,
      cols: 7,
      rows: 7,
      tiles: Array.from({ length: 7 }, (_, y) => Array.from({ length: 7 }, (_, x) => y === 0 || y === 6 || x === 0 || x === 6 ? "#" : ".").join("")),
      objects: [{ id: "exit", type: "exit", x: 5, y: 5, resolved: false }],
      interactions: {},
      discoveries: 1,
      totalDiscoveries: 2,
      encountersCleared: 0,
      totalEncounters: 1,
      startedAt: 256_000,
      coop: { enabled: true, partySize: 2, gimmickType: null, rare: { realmActive: false } },
    },
  };
}

function screenAttribute(html, name) {
  return html.match(new RegExp(`${name}="([^"]+)"`))?.[1] ?? null;
}

test("build256 shared exploration renders on the ordinary ExploreScreen foundation", () => {
  const ordinary = ExploreScreen(gameState, {
    floor,
    party: [],
    combatPower: 0,
    progress: 33,
    run: { startedAt: 256_000 },
  });
  const shared = renderOnlineExplore(sharedRoom(), guestId, { gameState });

  for (const marker of ["explore-screen-dungeon", "explore-command-header", "explore-party-hud", "explore-stage", "explore-nav"]) {
    assert.match(ordinary, new RegExp(marker));
    assert.match(shared, new RegExp(marker), `shared exploration must keep the ordinary ${marker} shell`);
  }
  for (const attribute of ["data-biome", "data-scenery", "data-scenery-variant", "data-world", "data-music-profile"]) {
    assert.equal(screenAttribute(shared, attribute), screenAttribute(ordinary, attribute), `${attribute} must come from the ordinary floor presentation`);
  }
  assert.match(shared, /data-online-explore-view="shared"/);
  assert.match(shared, /id="gameCanvas" data-online-dungeon-canvas/);
  assert.match(shared, /id="miniMap"/);
  assert.match(shared, /id="miniMapToggle"/);
  assert.match(shared, /通常マップを共同探索/);
  assert.match(shared, /任意・無視して出口へ進行可/);
});

test("build256 shared exploration keeps multiplayer additions inside the ordinary stage", () => {
  const html = renderOnlineExplore(sharedRoom(), guestId, { gameState });
  const stageStart = html.indexOf('<div class="explore-stage">');
  const stageEnd = html.indexOf('<nav class="explore-nav">', stageStart);
  const stage = html.slice(stageStart, stageEnd);

  assert.ok(stageStart >= 0 && stageEnd > stageStart);
  assert.match(stage, /data-online-dungeon-canvas/);
  assert.match(stage, /online-coop-run-status/);
  assert.match(stage, /online-explore-chat-bar/);
  assert.doesNotMatch(stage, /online-v3-screen|online-v3-stage/, "shared exploration must not fall back to the former standalone page shell");
});
