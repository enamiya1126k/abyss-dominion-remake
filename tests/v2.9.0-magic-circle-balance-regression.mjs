import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

import{APP_VERSION,SAVE_SCHEMA_VERSION}from"../src/core/config.js";
import{enemyEquipmentLevelForFloor,enemyHiddenProfileForFloor}from"../src/core/EnemyScalingSystem.js";
import{slotDamageMultiplier}from"../src/core/MagicCircleSystem.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const index=read("index.html"),main=read("src/main.js"),battleScreen=read("src/ui/screens/BattleScreen.js"),css=read("src/Styles/v2.9.0.css");

assert.equal(APP_VERSION,"2.9.0");
assert.equal(SAVE_SCHEMA_VERSION,54,"this display/balance update must keep save compatibility");
assert.match(index,/ASSET_VERSION = "2\.9\.0"/);
assert.match(index,/v2\.9\.0\.css\?v=2\.9\.0/);

assert.equal(enemyEquipmentLevelForFloor(300),2000,"300F normal enemies need a real wall against one Lv.2000 player weapon");
assert.equal(enemyEquipmentLevelForFloor(300,{rank:"LR"}),2700);
assert.equal(enemyEquipmentLevelForFloor(300,{boss:true}),3100);
assert.equal(enemyEquipmentLevelForFloor(500),3600);
assert.ok(enemyEquipmentLevelForFloor(1000)>10000,"the deep-floor curve must keep accelerating");
const profile=enemyHiddenProfileForFloor(300,{equipped:true,slots:6});
assert.equal(profile.gearLevel,2000);
assert.equal(profile.rarity,"LR");
assert.equal(profile.socketRarity,"LR");
assert.ok(profile.atk>5&&profile.def>5&&profile.damageTaken<.7);

assert.equal(slotDamageMultiplier(0),0);
assert.equal(slotDamageMultiplier(999),3);
assert.ok(slotDamageMultiplier(500)>1.7&&slotDamageMultiplier(500)<1.8);

assert.match(battleScreen,/ally-circle-intent/);
assert.match(battleScreen,/magicCircleProfiles/);
assert.match(battleScreen,/aria-pressed="\$\{battle\.auto\}"/);
assert.doesNotMatch(battleScreen,/class="battle-bar mp enemy-mp"/);
assert.match(main,/addEventListener\("pointerdown"/);
assert.match(main,/function magicCircleActivationFx/);
assert.match(main,/function prepareEnemyMagicCircleTurn/);
assert.match(main,/敵側の三桁抽選結果/);
assert.match(main,/magicCircleActivationFx\(enemy,profile/);
assert.match(css,/magic-circle-activation/);
assert.match(css,/"Arial Black"/);
assert.match(css,/magic-circle-roulette/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);

console.log("ABYSS DOMINION v2.9.0 magic-circle/balance regression: PASS");
