import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

import{APP_VERSION,SAVE_SCHEMA_VERSION}from"../src/core/config.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const main=read("src/main.js"),battle=read("src/ui/screens/BattleScreen.js"),css=read("src/Styles/v2.6.0.css"),index=read("index.html");

assert.equal(APP_VERSION,"2.9.0");
assert.equal(SAVE_SCHEMA_VERSION,54);
assert.match(index,/const ASSET_VERSION = "2\.9\.0"/);

assert.match(battle,/hp-fill-draining/);
assert.match(battle,/hp-fill[\s\S]*bar-label/,"HP label must be rendered after gauge layers");
assert.match(css,/battle-bar>\.bar-label\{z-index:6!important/);
assert.match(css,/@keyframes battle-hp-fill-drain/);
assert.match(css,/battle-hp-trail-drain/);
assert.match(main,/function animateBattleHpGauge/);
assert.match(main,/animateBattleHpGauge\(target,el\)/);
assert.match(main,/function hpDrainDuration/);

assert.match(main,/function triggerBattleImpact/);
assert.match(main,/battleFlash\(critical\?"critical":"hit"\)/);
assert.match(css,/battle-unit-hit-bang/);
assert.match(css,/battle-field-impact-critical/);
assert.match(css,/battle-screen-flash\.hit/);

assert.match(main,/function bindBackdropTapClose/);
assert.match(main,/if\(event\.target!==modal\)return/);
assert.match(main,/function bindTapAnywhereClose/);
assert.match(main,/Math\.hypot\(event\.clientX-pointer\.x,event\.clientY-pointer\.y\)>10/);
assert.match(main,/modal\.classList\.add\("battle-detail-modal","battle-detail-modal-v2"\)/);
assert.match(main,/bindTapAnywhereClose\(modal,close\)/);

console.log("ABYSS DOMINION v2.9.0 battle feedback regression: PASS");
