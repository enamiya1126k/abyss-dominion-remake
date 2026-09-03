import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
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

test("Build308 publishes one client identity and retains the Build306 UI layer", async () => {
  assert.equal(APP_VERSION, "3.0.9");
  assert.equal(SAVE_SCHEMA_VERSION, 75);

  const index = await readFile(resolve(ROOT, "index.html"), "utf8");
  assert.match(index, /const ASSET_VERSION = "3\.0\.9";/);
  assert.match(index, /const ASSET_BUILD = "build309";/);
  assert.match(index, /import\(`\.\/src\/main\.js\?v=\$\{ASSET_VERSION\}-\$\{ASSET_BUILD\}`\)/);

  const styles = [...index.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)]
    .map(match => match[1]);
  const build305Index = styles.findIndex(href => /\/build305-final-audit\.css\?v=3\.0\.5-build305$/.test(href));
  const build306Index = styles.findIndex(href => /\/build306-ui\.css\?v=3\.0\.6-build306$/.test(href));
  assert.notEqual(build305Index, -1, "Build305 CSS must remain the base layer");
  assert.notEqual(build306Index, -1, "Build306 UI CSS must be loaded");
  assert.ok(build306Index > build305Index, "Build306 CSS must load after Build305 CSS");
});

test("Build308 replaces superseded browser-cache identities on active src imports", async () => {
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

test("Build308 keeps online package, client, server, and presence capability at 1.17.0", async () => {
  const packageJson = JSON.parse(await readFile(resolve(ROOT, "online-server/package.json"), "utf8"));
  const packageLock = JSON.parse(await readFile(resolve(ROOT, "online-server/package-lock.json"), "utf8"));
  const client = await readFile(resolve(ROOT, "src/online/OnlinePartyClient.js"), "utf8");
  const server = await readFile(resolve(ROOT, "online-server/server.js"), "utf8");

  assert.equal(packageJson.version, "1.17.0");
  assert.equal(packageLock.version, "1.17.0");
  assert.equal(packageLock.packages?.[""]?.version, "1.17.0");
  assert.match(client, /const ONLINE_PROTOCOL = "1\.17\.0";/);
  assert.match(client, /const POWER_RANKING_PRESENCE_CAPABILITY = "powerRankingPresenceV1";/);
  assert.match(client, /_send\("powerRankingPresence"\)/);
  assert.match(server, /message\.protocol!=="1\.17\.0"/);
  assert.match(server, /type:"helloAck",protocol:"1\.17\.0"/);
  assert.match(server, /protocol:"1\.17\.0"/);
  assert.match(server, /powerRankingPresenceV1:true/);
  assert.match(server, /message\.type==="powerRankingPresence"/);
});
