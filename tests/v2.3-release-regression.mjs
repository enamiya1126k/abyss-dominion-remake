import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {APP_VERSION,MONSTER_STORAGE_CAP,SAVE_SCHEMA_VERSION} from "../src/core/config.js";
import {bossProfileForFloor} from "../src/core/EnemyScalingSystem.js";
import {SPECIAL_ACTION_INFO} from "../src/battle/EnemyAI.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");

assert.equal(APP_VERSION,"2.4.1");
assert.equal(SAVE_SCHEMA_VERSION,50);
assert.equal(MONSTER_STORAGE_CAP,3000);

const regularBoss=bossProfileForFloor(10),fiftyBoss=bossProfileForFloor(50),hundredBoss=bossProfileForFloor(100);
assert.ok(regularBoss.hp>=7&&regularBoss.atk>=2,"10階ボスは序盤の壁になる強度");
assert.ok(fiftyBoss.hp>regularBoss.hp&&hundredBoss.hp>fiftyBoss.hp,"節目ボスは段階強化");
for(const action of ["flameSweep","frostNova","venomCloud","thunderChain","earthRupture","galeRend","shadowCurse"]){
  assert.ok(SPECIAL_ACTION_INFO[action],`${action} missing`);
}
assert.equal(SPECIAL_ACTION_INFO.flameSweep.status.id,"burn");
assert.equal(SPECIAL_ACTION_INFO.frostNova.status.id,"freeze");
assert.equal(SPECIAL_ACTION_INFO.venomCloud.status.id,"poison");

const main=read("src/main.js"),explore=read("src/ui/screens/ExploreScreen.js"),gauntlet=read("src/ui/screens/GauntletScreen.js"),audio=read("src/core/AudioSystem.js"),css=read("src/Styles/v2.2.0.css"),index=read("index.html");
assert.match(main,/count=roll<\.34\?4/);
assert.match(main,/function floorBossParty\(/);
assert.match(main,/beginEncounter\(floorBossParty\(bossInfo,floor\)\)/);
assert.match(main,/const basinScale=\(decoration\.scale\?\?1\.2\)\*1\.48/);
assert.match(main,/data-explore-auto-mode/);
assert.match(explore,/toggleExplorePartyHud/);
assert.match(explore,/data-explore-auto-mode="floor"/);
assert.match(explore,/data-explore-auto-mode="items"/);
assert.match(explore,/data-explore-auto-mode="exp"/);
assert.match(gauntlet,/data-gauntlet-party-toggle/);
assert.match(gauntlet,/帰還して精算/);
assert.doesNotMatch(gauntlet,/法廷主へ<\/b>/);
assert.match(css,/v2\.3\.0 — final mobile layout/);
assert.match(css,/gauntlet-walk-screen\{[^}]*height:100dvh!important/);
assert.match(css,/party-hud-collapsed \.explore-party-strip\{display:none!important/);
assert.match(css,/damage-slot-digits/);
assert.match(index,/ASSET_VERSION = "2\.4\.1"/);

for(const event of ["visibilitychange","pagehide","blur","focus","pageshow"]){
  assert.ok(audio.includes(event),`Audio lifecycle event missing: ${event}`);
}
assert.match(audio,/\.loop=true/);

const basin=fs.readFileSync(path.join(root,"assets/ui/explore/empty-water-basin.png"));
assert.equal(basin.toString("ascii",1,4),"PNG");
assert.equal(basin.readUInt32BE(16),313);
assert.equal(basin.readUInt32BE(20),313);
assert.ok(basin.length>50_000);

console.log("ABYSS DOMINION v2.4.0 final release regression: PASS");
