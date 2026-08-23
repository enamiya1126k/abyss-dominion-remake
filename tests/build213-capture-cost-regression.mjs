import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const inventory = await readFile(new URL("../src/ui/screens/InventoryScreen.js", import.meta.url), "utf8");
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const config = await readFile(new URL("../src/core/config.js", import.meta.url), "utf8");

assert.match(main, /function captureCrystalCost\(\)\{return 1\}/);
assert.match(main, /captureCrystals:\["🔮","捕獲結晶","捕獲1回につき1個消費します。"\]/);
assert.match(main, /save\.state\.inventory\.captureCrystals-=cost/);
assert.match(main, /捕獲失敗・捕獲結晶1個を消費/);
assert.doesNotMatch(main, /最大75個消費/);
assert.match(inventory, /捕獲1回につき1個消費/);
assert.doesNotMatch(inventory, /最大75個消費/);
assert.match(index, /const ASSET_VERSION = "2\.11\.48";/);
assert.match(index, /const ASSET_BUILD = "build213";/);
assert.match(config, /APP_VERSION="2\.11\.48"/);

console.log("build213 capture cost regression: ok");
