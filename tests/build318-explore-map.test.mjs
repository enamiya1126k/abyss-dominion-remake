import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SECTION_SHAPE_PATTERNS,
  generateSectionDungeon,
  sectionRoute,
  shapeSignatureSimilarity,
} from "../src/core/DungeonSectionSystem.js";

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1_664_525) + 1_013_904_223) >>> 0;
    return value / 4_294_967_296;
  };
}

function assertConnected(section, context) {
  const cells = new Set(section.cellKeys);
  const queue = [section.cellKeys[0]];
  const seen = new Set(queue);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const [x, y] = queue[cursor].split(",").map(Number);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = `${x + dx},${y + dy}`;
      if (cells.has(next) && !seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  assert.equal(seen.size, cells.size, `${context} is one connected walkable shape`);
}

test("Build318 procedural families replace ring/cross bias and keep consecutive sections novel", () => {
  const counts = Object.fromEntries(SECTION_SHAPE_PATTERNS.map(pattern => [pattern, 0]));
  let recentSignatures = [];
  for (let seed = 1; seed <= 80; seed += 1) {
    const world = generateSectionDungeon({ count: 6, random: seeded(seed), recentSignatures });
    assert.equal(world.generationVersion, 318);
    assert.equal(world.shapeSignatures.length, 6);
    assert.equal(world.sections.some(section => ["ring", "branched"].includes(section.layoutPattern)), false);
    world.sections.forEach((section, index) => {
      counts[section.layoutPattern] += 1;
      assertConnected(section, `${seed}/${section.id}`);
      if (index > 0) {
        assert.notEqual(section.layoutPattern, world.sections[index - 1].layoutPattern, "adjacent section families do not repeat");
        assert.ok(shapeSignatureSimilarity(section.shapeSignature, world.sections[index - 1].shapeSignature) < 0.86, "adjacent silhouettes remain visibly distinct");
      }
    });
    recentSignatures = [...recentSignatures, ...world.shapeSignatures].slice(-12);
  }
  const distribution = Object.values(counts);
  assert.ok(Math.min(...distribution) >= 30, "every procedural family appears repeatedly");
  assert.ok(Math.max(...distribution) / Math.min(...distribution) < 2.2, "no family dominates like the old ring/cross patterns");
});

test("Build318 history-aware generation is deterministic and all passages stay traversable", () => {
  const history = generateSectionDungeon({ count: 6, random: seeded(31801) }).shapeSignatures;
  const first = generateSectionDungeon({ count: 6, random: seeded(31802), recentSignatures: history });
  const second = generateSectionDungeon({ count: 6, random: seeded(31802), recentSignatures: history });
  assert.deepEqual(second, first, "same seed and history reproduce exactly");
  assert.equal(history.slice(-2).some(signature => signature.split("|")[0] === first.sections[0].layoutPattern), false, "the next floor avoids its most recent families");
  for (const section of first.sections) {
    assert.equal(sectionRoute(first, first.startSectionId, section.id).at(-1), section.id);
  }
  for (const portal of first.sectionPortals) {
    assert.ok(portal.passageDepth >= 3 && portal.passageDepth <= 5);
    assert.equal(first.sectionByCell[`${portal.x},${portal.y}`], portal.sectionId);
    assert.equal(first.tiles[portal.arrivalY][portal.arrivalX], 0);
  }
});

test("Build318 passage renderer uses a black fade without mobile-heavy effects", async () => {
  const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/Styles/build318-map.css", import.meta.url), "utf8");
  const saveService = await readFile(new URL("../src/services/SaveService.js", import.meta.url), "utf8");
  const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const start = main.indexOf("function drawCampaignSectionPortal");
  const end = main.indexOf("function drawCampaignKey", start);
  const passageRenderer = main.slice(start, end);
  assert.match(passageRenderer, /passageDepth/);
  assert.match(passageRenderer, /rgba\(0,0,0/);
  assert.match(passageRenderer, /performanceProfile\?\.constrained\?3:4/);
  assert.doesNotMatch(passageRenderer, /createLinearGradient|filter=|drawExploreParticles|performance\.now/);
  assert.match(main, /recentDungeonShapeSignatures/);
  assert.match(main, /layoutVersion:318/);
  assert.match(saveService, /normalizeDungeonShapeHistory/);
  assert.match(saveService, /dungeonShapeHistory=normalizeDungeonShapeHistory/);
  assert.match(css, /section-passage-fade/);
  assert.match(index, /build318-map\.css/);
  assert.match(index, /ASSET_BUILD = "build318"/);
});
