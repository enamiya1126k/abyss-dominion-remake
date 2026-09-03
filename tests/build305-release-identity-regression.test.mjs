import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { APP_VERSION, SAVE_SCHEMA_VERSION } from "../src/core/config.js";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SRC_ROOT = resolve(ROOT, "src");
const RELEASE_QUERY = "?v=3.0.9-build309";

async function javascriptFiles(directory = SRC_ROOT) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await javascriptFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".js")) files.push(path);
  }
  return files;
}

test("Build308 publishes one client release identity while retaining the Build306 UI layer", async () => {
  assert.equal(APP_VERSION, "3.0.9");
  assert.equal(SAVE_SCHEMA_VERSION, 75);

  const index = await readFile(resolve(ROOT, "index.html"), "utf8");
  assert.match(index, /const ASSET_VERSION = "3\.0\.9";/);
  assert.match(index, /const ASSET_BUILD = "build309";/);
  assert.match(index, /import\(`\.\/src\/main\.js\?v=\$\{ASSET_VERSION\}-\$\{ASSET_BUILD\}`\)/);

  const styles = [...index.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)]
    .map(match => match[1]);
  const build304Index = styles.findIndex(href => /\/build304-final\.css\?v=3\.0\.4-build304$/.test(href));
  const build305Index = styles.findIndex(href => /\/build305[^/]*\.css\?v=3\.0\.5-build305$/.test(href));
  const build306Index = styles.findIndex(href => /\/build306[^/]*\.css\?v=3\.0\.6-build306$/.test(href));
  assert.notEqual(build304Index, -1, "Build304 presentation CSS must remain the base layer");
  assert.notEqual(build305Index, -1, "Build305 final-audit CSS must be loaded");
  assert.notEqual(build306Index, -1, "Build306 UI CSS must be loaded");
  assert.ok(build305Index > build304Index, "Build305 CSS must remain after Build304 CSS");
  assert.ok(build306Index > build305Index, "Build306 CSS must load last");
});

test("Build308 removes superseded cache identities from active src imports", async () => {
  const currentEdges = [];
  for (const importer of await javascriptFiles()) {
    const source = await readFile(importer, "utf8");
    assert.doesNotMatch(
      source,
      /\?v=3\.0\.5-build305/,
      `${relative(SRC_ROOT, importer)} still contains the Build305 browser cache identity`,
    );

    for (const match of source.matchAll(/(?:from\s*|import\s*\()(["'])([^"']+)\1/g)) {
      const specifier = match[2];
      if (!specifier.startsWith(".")) continue;
      if (specifier.endsWith(RELEASE_QUERY)) currentEdges.push(`${relative(SRC_ROOT, importer)} -> ${specifier.split("?")[0]}`);
    }
  }
  assert.ok(currentEdges.length >= 70, `expected the Build308 dependency graph, checked only ${currentEdges.length} current edges`);
});

test("Build308 refreshes every incoming edge of each changed browser module", async () => {
  const changedModules = [
    "battle/EnemyAI.js",
    "battle/SkillSystem.js",
    "core/Campaign100System.js",
    "core/EndgameSystem.js",
    "core/ReturnRewardSystem.js",
    "core/config.js",
    "online/OnlinePartyClient.js",
    "online/OnlineProgressIsolation.js",
    "services/SaveService.js",
    "ui/components/GameChrome.js",
  ].map(path => resolve(SRC_ROOT, path));
  const changedSet = new Set(changedModules);
  const incoming = new Map(changedModules.map(path => [path, 0]));

  for (const importer of await javascriptFiles()) {
    const source = await readFile(importer, "utf8");
    for (const match of source.matchAll(/(?:from\s*|import\s*\()(["'])([^"']+)\1/g)) {
      const specifier = match[2];
      if (!specifier.startsWith(".")) continue;
      const [pathPart, query = ""] = specifier.split("?");
      const target = resolve(dirname(importer), pathPart);
      if (!changedSet.has(target)) continue;
      incoming.set(target, incoming.get(target) + 1);
      assert.equal(`?${query}`, RELEASE_QUERY, `${relative(SRC_ROOT, importer)} has a stale edge to ${relative(SRC_ROOT, target)}`);
    }
  }
  for (const [target, count] of incoming) assert.ok(count > 0, `${relative(SRC_ROOT, target)} must have an audited incoming edge`);
});

test("Build308 keeps online package metadata and live protocol at 1.17.0", async () => {
  const packageJson = JSON.parse(await readFile(resolve(ROOT, "online-server/package.json"), "utf8"));
  const packageLock = JSON.parse(await readFile(resolve(ROOT, "online-server/package-lock.json"), "utf8"));
  const client = await readFile(resolve(ROOT, "src/online/OnlinePartyClient.js"), "utf8");
  const server = await readFile(resolve(ROOT, "online-server/server.js"), "utf8");

  assert.equal(packageJson.version, "1.17.0");
  assert.equal(packageLock.version, "1.17.0");
  assert.equal(packageLock.packages?.[""]?.version, "1.17.0");
  assert.match(client, /const ONLINE_PROTOCOL = "1\.17\.0";/);
  assert.match(server, /message\.protocol!=="1\.17\.0"/);
  assert.match(server, /type:"helloAck",protocol:"1\.17\.0"/);
  assert.match(server, /protocol:"1\.17\.0"/);
});
