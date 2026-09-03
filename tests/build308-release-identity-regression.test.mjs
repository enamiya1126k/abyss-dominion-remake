import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { APP_VERSION, SAVE_SCHEMA_VERSION } from "../src/core/config.js";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SRC_ROOT = resolve(ROOT, "src");
const RELEASE_QUERY = "?v=3.0.9-build309";

const BUILD308_BROWSER_MODULES = new Set([
  "battle/EnemyAI.js",
  "battle/SkillSystem.js",
  "core/BossRewardMappingSystem.js",
  "core/Campaign100System.js",
  "core/CampaignBossRewardSystem.js",
  "core/CampaignBossWorldSystem.js",
  "core/DungeonMiniMapSystem.js",
  "core/EndgameSystem.js",
  "core/EncounterPoolSystem.js",
  "core/FloorBossChallengeSystem.js",
  "core/SignatureWeaponSystem.js",
  "core/config.js",
  "data/attributes.js",
  "data/biomes.js",
  "data/dungeonThemes.js",
  "data/species.js",
  "models/Monster.js",
  "online/OnlinePartyClient.js",
  "services/EquipmentLoadoutSystem.js",
  "services/SaveService.js",
  "services/WeaponMastery.js",
  "ui/components/AttributeVisual.js",
  "ui/screens/BattleScreen.js",
  "ui/screens/HomeScreen.js",
]);

async function javascriptFiles(directory = SRC_ROOT) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await javascriptFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".js") && entry.name !== "app.bundle.js") files.push(path);
  }
  return files;
}

test("Build308 publishes one client identity without a save-schema reset", async () => {
  assert.equal(APP_VERSION, "3.0.9");
  assert.equal(SAVE_SCHEMA_VERSION, 75);

  const index = await readFile(resolve(ROOT, "index.html"), "utf8");
  assert.match(index, /const ASSET_VERSION = "3\.0\.9";/);
  assert.match(index, /const ASSET_BUILD = "build309";/);
  assert.match(index, /import\(`\.\/src\/main\.js\?v=\$\{ASSET_VERSION\}-\$\{ASSET_BUILD\}`\)/);
});

test("Build308 removes the superseded Build307 identity from active source imports", async () => {
  for (const path of await javascriptFiles()) {
    const source = await readFile(path, "utf8");
    assert.doesNotMatch(
      source,
      /\?v=3\.0\.7-build307/,
      `${relative(SRC_ROOT, path)} still exposes the superseded Build307 cache identity`,
    );
  }
});

test("Build308 refreshes every browser edge into the release's changed modules", async () => {
  const incoming = new Map([...BUILD308_BROWSER_MODULES].map(path => [path, 0]));

  for (const importer of await javascriptFiles()) {
    const source = await readFile(importer, "utf8");
    for (const match of source.matchAll(/(?:from\s*|import\s*\()(["'])([^"']+)\1/g)) {
      const specifier = match[2];
      if (!specifier.startsWith(".")) continue;
      const [bare] = specifier.split("?");
      const target = relative(SRC_ROOT, resolve(dirname(importer), bare)).replaceAll("\\", "/");
      if (!BUILD308_BROWSER_MODULES.has(target)) continue;
      incoming.set(target, incoming.get(target) + 1);
      assert.equal(
        specifier,
        `${bare}${RELEASE_QUERY}`,
        `${relative(SRC_ROOT, importer)} has a stale browser edge to ${target}`,
      );
    }
  }

  for (const [target, count] of incoming) {
    assert.ok(count > 0, `${target} must have at least one audited browser importer`);
  }
});
