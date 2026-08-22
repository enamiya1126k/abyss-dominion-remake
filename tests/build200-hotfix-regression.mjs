import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {MONSTER_SPRITE_FOLDERS} from "../src/data/monsterCatalog.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=(file)=>fs.readFileSync(path.join(root,file),"utf8");
const index=read("index.html"),css=read("src/Styles/build200.css"),main=read("src/main.js"),config=read("src/core/config.js");

assert.match(index,/build200\.css\?v=2\.11\.35-build200/);
assert.ok(index.indexOf("build200.css")>index.indexOf("build199.css"),"build200 CSS must load last");
assert.match(index,/const ASSET_VERSION = "2\.11\.36";/);
assert.match(index,/const ASSET_BUILD = "build201";/);
assert.match(config,/APP_VERSION="2\.11\.36"/);

assert.match(css,/\.floor-boss-gate-entry\[hidden\]\{display:none!important\}/);
assert.match(css,/\.combat-rank-unit \.side-unit-sprite\{position:absolute!important\}/);
assert.match(css,/data-monster-species="frost_mole"/);
assert.match(css,/data-monster-species="floor_boss_020"/);
assert.match(css,/>img\[data-monster-sprite\]\{\s*transform:scaleX\(-1\)!important;/s);

const facingIds=[...css.matchAll(/data-monster-species="([^"]+)"/g)].map(match=>match[1]);
assert.ok(facingIds.length>=50,"source-facing audit should cover the mixed-direction catalog");
assert.equal(new Set(facingIds).size,facingIds.length,"source-facing selectors must not be duplicated");
for(const id of facingIds)assert.ok(MONSTER_SPRITE_FOLDERS[id],`unknown source-facing monster: ${id}`);

assert.match(main,/function floorBossWasDefeated\(player,floor\)/);
assert.match(main,/game\.world\.boss&&!floorBossWasDefeated\(save\.state\.player,save\.state\.player\.currentFloor\)/);
assert.match(main,/firstBoss=!!boss&&!memoryBattle&&!floorBossWasDefeated\(save\.state\.player,floor\)/);

const wasDefeated=(player,floor)=>{
 const key=String(Math.max(1,Math.floor(Number(floor)||1))),hasOwn=(record)=>Object.prototype.hasOwnProperty.call(record??{},key);
 return Number(player?.bossKills?.[key]??0)>0||hasOwn(player?.bossRewards)||hasOwn(player?.pendingBossRewards);
};
assert.equal(wasDefeated({bossKills:{20:1}},20),true);
assert.equal(wasDefeated({bossRewards:{20:"armor"}},20),true);
assert.equal(wasDefeated({pendingBossRewards:{20:{}}},20),true);
assert.equal(wasDefeated({bossKills:{},bossRewards:{},pendingBossRewards:{}},20),false);

console.log(`build200 hotfix regression: PASS (${facingIds.length} source-left visuals normalized)`);
