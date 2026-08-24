import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { battleEnvironmentForFloor } from "../src/data/biomes.js";

const ice = battleEnvironmentForFloor(31);
assert.equal(ice.name, "氷結回廊");
assert.equal(ice.primary, "ice");
assert.deepEqual(ice.favorable, ["ice"]);
assert.deepEqual(ice.adverse, ["fire"]);

const temple = battleEnvironmentForFloor(41);
assert.equal(temple.name, "古代神殿");
assert.equal(temple.primary, "light");
assert.deepEqual(temple.favorable, ["light"]);
assert.deepEqual(temple.adverse, ["dark"]);
assert.equal(temple.boost, 1.22);
assert.equal(temple.penalty, .84);

const main = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const views = await readFile(new URL("../src/online/OnlineViews.js", import.meta.url), "utf8");
const battleScreen = await readFile(new URL("../src/ui/screens/BattleScreen.js", import.meta.url), "utf8");
const roomStore = await readFile(new URL("../online-server/src/RoomStore.js", import.meta.url), "utf8");
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const config = await readFile(new URL("../src/core/config.js", import.meta.url), "utf8");

assert.match(main, /return battleEnvironmentForFloor\(floor\)/);
assert.match(views, /battleEnvironmentForFloor\(floor\)/);
assert.doesNotMatch(views, /function onlineBattleBiome/);
assert.match(battleScreen, /primary=environment\.primary\?\?favorable\[0\]/);
assert.match(roomStore, /raidProgressByOwner=new Map\(\)/);
assert.match(roomStore, /ownerId,leaderId:session\.playerId/);
assert.match(roomStore, /raidProgress:this\.raidProgressByOwner\.get\(ownerId\)\?\?null/);
assert.match(roomStore, /_broadcastRoom\(room\)\{this\._syncRaidProgress\(room\)/);
assert.match(index, /const ASSET_VERSION = "2\.11\.49";/);
assert.match(index, /const ASSET_BUILD = "build214";/);
assert.match(config, /APP_VERSION="2\.11\.49"/);

console.log("build214 biome and raid progress regression: ok");
