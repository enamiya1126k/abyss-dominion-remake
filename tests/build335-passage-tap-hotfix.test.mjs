import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { APP_VERSION } from "../src/core/config.js";
import { generateSectionDungeon, portalTapDestination } from "../src/core/DungeonSectionSystem.js";

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1_664_525) + 1_013_904_223) >>> 0;
    return value / 4_294_967_296;
  };
}

const directions = {
  north: { dx: 0, dy: -1 },
  east: { dx: 1, dy: 0 },
  south: { dx: 0, dy: 1 },
  west: { dx: -1, dy: 0 },
};

test("Build335 visible passage taps resolve to the real portal mouth", () => {
  for (let seed = 1; seed <= 120; seed += 1) {
    const world = generateSectionDungeon({ count: 4 + seed % 3, random: seeded(seed) });
    for (const portal of world.sectionPortals) {
      const direction = directions[portal.direction];
      const depth = Math.ceil(Math.max(3.15, Math.min(4.35, Number(portal.passageDepth) || 3.8)) + 0.35);
      for (let distance = 1; distance <= depth; distance += 1) {
        const target = { x: portal.x + direction.dx * distance, y: portal.y + direction.dy * distance };
        assert.notEqual(world.tiles?.[target.y]?.[target.x], 0, `seed ${seed}: drawn ${portal.direction} passage is outside the actual floor`);
        assert.deepEqual(portalTapDestination(world, target, portal.sectionId), { x: portal.x, y: portal.y });
      }
      assert.equal(portalTapDestination(world, { x: portal.x, y: portal.y }, portal.sectionId), null, "real floor remains an ordinary destination");
    }
  }
});

test("Build335 passage redirect remains active in Build336", () => {
  const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.equal(APP_VERSION, "3.1.17");
  assert.match(index, /ASSET_VERSION = "3\.1\.17"/);
  assert.match(index, /ASSET_BUILD = "build336"/);
  assert.match(main, /destination=portalTapDestination\(game\.world,target\)\?\?target;onDestination/);
  assert.match(main, /destination=portalTapDestination\(game\.world,g\)\?\?g,route=path/);
  assert.match(main, /DungeonSectionSystem\.js\?v=3\.1\.17-build336/);
});
