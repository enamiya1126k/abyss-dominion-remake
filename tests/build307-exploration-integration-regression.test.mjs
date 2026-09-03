import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { SPECIES } from "../src/data/species.js";
import {
  ENCOUNTER_RARE_PITY,
  normalizeEncounterHistory,
  rollAttributeEncounterGroup,
} from "../src/core/EncounterPoolSystem.js";
import { SaveService } from "../src/services/SaveService.js";

const source = path => readFile(new URL(path, import.meta.url), "utf8");
const seeded = seed => () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};

test("Build308 normal campaign encounters use the current floor, section attribute, and durable history", async () => {
  const main = await source("../src/main.js");
  const groupFactory = main.slice(
    main.indexOf("function randomEnemyGroup("),
    main.indexOf("function randomEnemy(){"),
  );
  const encounterEntry = main.slice(
    main.indexOf("function beginEncounter("),
    main.indexOf("const EXPLORE_INTERACTIVE_DECORATIONS"),
  );

  assert.match(
    main,
    /import\{recordEncounterHistory,rollAttributeEncounterGroup\}from"\.\/core\/EncounterPoolSystem\.js\?v=3\.0\.9-build309"/,
  );
  assert.match(groupFactory, /const floor=save\.state\.player\.currentFloor/);
  assert.match(groupFactory, /const attribute=game\?\.world\?\.currentAttribute\?\?"neutral"/);
  assert.match(
    groupFactory,
    /rollAttributeEncounterGroup\(STANDARD_ENCOUNTER_SPECIES,floor,attribute,\{count,history:save\.state\.encounterHistory,rng:Math\.random,campaign:true\}\)/,
  );
  assert.match(
    groupFactory,
    /save\.state\.encounterHistory=rolled\.species\.length\?rolled\.history:recordEncounterHistory\(save\.state\.encounterHistory,picked\)/,
    "one completed group must commit the history returned by the group roll",
  );
  assert.doesNotMatch(groupFactory, /pickBiomeEncounterSpecies|speciesPoolForFloor/);

  assert.match(
    encounterEntry,
    /emergency\?\[\]:randomEnemyGroup\(\)/,
    "ordinary encounters must not accidentally force the one-enemy compatibility path",
  );
  assert.match(groupFactory, /function randomEnemyGroup\(\{forcedCount=null\}=\{\}\)/);
  assert.match(groupFactory, /if\(!Number\.isInteger\(fixedCount\)\)/);
  assert.match(groupFactory, /floor<10\)count=roll<\.18\?2:1/);
  assert.match(groupFactory, /floor<50\)count=roll<\.05\?3:roll<\.34\?2:1/);
  assert.match(groupFactory, /floor<100\)count=roll<\.05\?1:roll<\.38\?2:roll<\.73\?3:4/);
});

test("Build308 group rotation rejects duplicate IDs and duplicate display names and advances pity once", () => {
  const duplicateNamePool = [
    { id: "fire-a", name: "同名竜", rarity: "N", element: "fire", minFloor: 1 },
    { id: "fire-b", name: "同名竜", rarity: "R", element: "fire", minFloor: 1 },
    { id: "fire-c", name: "炎牙獣", rarity: "SR", element: "fire", minFloor: 1 },
    { id: "fire-d", name: "火焔鳥", rarity: "SSR", element: "fire", minFloor: 1 },
    { id: "earth-a", name: "岩甲虫", rarity: "N", element: "earth", minFloor: 1 },
    { id: "dark-a", name: "黒影", rarity: "R", element: "dark", minFloor: 1 },
    { id: "lightning-a", name: "雷獣", rarity: "SR", element: "lightning", minFloor: 1 },
  ];
  const history = normalizeEncounterHistory({
    missesSinceHighRare: ENCOUNTER_RARE_PITY.hardLimit,
    totalEncounters: 91,
  });

  for (let seed = 1; seed <= 80; seed += 1) {
    const result = rollAttributeEncounterGroup(duplicateNamePool, 100, "fire", {
      count: 4,
      campaign: true,
      history,
      rng: seeded(seed),
    });
    const ids = result.species.map(entry => entry.id);
    const names = result.species.map(entry => entry.name);
    assert.equal(new Set(ids).size, ids.length, `seed ${seed}: species IDs are unique`);
    assert.equal(new Set(names).size, names.length, `seed ${seed}: display names are unique`);
    assert.equal(result.history.totalEncounters, 92, `seed ${seed}: one battle records once`);
    assert.equal(result.history.missesSinceHighRare, 0, `seed ${seed}: hard pity resolves once`);
  }

  const real = rollAttributeEncounterGroup(SPECIES, 100, "fire", {
    count: 4,
    campaign: true,
    history,
    rng: seeded(307),
  });
  assert.equal(real.species.length, 4);
  assert.equal(new Set(real.species.map(entry => entry.id)).size, 4);
  assert.equal(new Set(real.species.map(entry => entry.name)).size, 4);
  assert.equal(real.history.totalEncounters, 92);
});

test("Build308 encounter history initializes, migrates, saves, and reloads without losing pity progress", () => {
  const previousStorage = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };

  try {
    const fresh = new SaveService();
    assert.deepEqual(fresh.state.encounterHistory, normalizeEncounterHistory({}));

    fresh.state.encounterHistory = normalizeEncounterHistory({
      missesSinceHighRare: 13,
      recentSpeciesIds: ["ember_slime", "dragon"],
      recentSpeciesNames: ["火種スライム", "紅蓮竜ドラグニール"],
      totalEncounters: 72,
      highRareEncounters: 4,
    });
    assert.equal(fresh.save(), true);

    const reloaded = new SaveService();
    assert.deepEqual(reloaded.state.encounterHistory, fresh.state.encounterHistory);
    const persisted = JSON.parse([...values.values()].at(-1));
    assert.deepEqual(persisted.encounterHistory, fresh.state.encounterHistory);

    const legacy = structuredClone(reloaded.state);
    delete legacy.encounterHistory;
    const migrated = reloaded.migrate(legacy);
    assert.deepEqual(migrated.encounterHistory, normalizeEncounterHistory({}));
    assert.deepEqual(
      reloaded.migrate(structuredClone(migrated)).encounterHistory,
      migrated.encounterHistory,
      "migration remains idempotent",
    );
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

test("Build308 runtime keeps new layouts, legacy resumes, large-room camera follow, true minimap geometry, and feathered portals connected", async () => {
  const [main, miniMap, dungeon] = await Promise.all([
    source("../src/main.js"),
    source("../src/core/DungeonMiniMapSystem.js"),
    source("../src/core/DungeonSectionSystem.js"),
  ]);
  const cameraStart = main.indexOf("class Camera{");
  const camera = main.slice(cameraStart, main.indexOf("normalizeEndgameState(save.state);", cameraStart));
  const portal = main.slice(
    main.indexOf("function drawCampaignSectionPortal"),
    main.indexOf("function drawCampaignKey"),
  );
  const miniDraw = main.slice(main.indexOf("function drawMini("), main.indexOf("function path("));

  assert.match(main, /layoutVersion:308/);
  assert.match(main, /!\[303,307,308\]\.includes\(Number\(world\.layoutVersion\)\)/);
  assert.match(camera, /follow\(px,py,dt=1\/60\)/);
  assert.match(camera, /alpha=1-Math\.pow\(\.88,/);
  assert.match(camera, /sectionBounds\(w,w\.currentSectionId,2\)/);
  assert.match(camera, /baseLeft=/);
  assert.match(camera, /baseTop=/);
  assert.match(main, /game\.camera\.follow\(game\.player\.rx\*TILE,game\.player\.ry\*TILE,dt\)/);

  assert.match(miniMap, /sizeTier:String\(section\.sizeTier\?\?"standard"\)/);
  assert.match(miniMap, /shapeVariant:String\(section\.shapeVariant\?\?section\.layoutPattern/);
  assert.match(miniMap, /layoutSignature:geometrySignature\(sections\)/);
  assert.match(miniDraw, /model\.layoutSignature/);
  assert.match(miniDraw, /section\.cells/);
  assert.match(miniDraw, /transform\.scale/);

  assert.match(dungeon, /generationVersion:307/);
  assert.match(dungeon, /sizeTier:tier\.id/);
  assert.match(dungeon, /layoutPattern:pattern/);
  assert.match(portal, /mouthPath/);
  assert.match(portal, /createLinearGradient/);
  assert.match(portal, /interiorOffset=\{north:/);
  assert.doesNotMatch(portal, /fillRect\(|ellipse\(/);
});
