import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(resolve(root, path), "utf8");
const battle = read("src/ui/screens/BattleScreen.js");
const css = read("src/Styles/build216.css");
const index = read("index.html");
const config = read("src/core/config.js");

assert.match(battle, /battle-history-hidden/, "battle screen must opt into the expanded arena layout");
assert.doesNotMatch(battle, /class="battle-log"/, "the permanent battle history strip must not be rendered");
assert.match(css, /\.battle-history-hidden \.side-battle-arena/, "the removed history space must be returned to the arena");
assert.match(css, /\.boss-enemy,.floor-boss-enemy,.raid-main-boss/, "all boss families must receive the safe top offset");
assert.match(css, /white-space:normal!important/, "two-line boss names must be allowed to wrap safely");
assert.match(index, /build216\.css\?v=2\.11\.51-build216/, "build216 stylesheet must be loaded");
assert.match(index, /ASSET_VERSION = "2\.11\.51"/);
assert.match(index, /ASSET_BUILD = "build216"/);
assert.match(config, /APP_VERSION="2\.11\.51"/);

console.log("build216 battle space regression: ok");
