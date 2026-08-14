import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

import{APP_VERSION}from"../src/core/config.js";
import{MAGIC_CIRCLES}from"../src/core/MagicCircleSystem.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const file=relative=>path.join(root,relative);
const pngInfo=relative=>{
 const data=fs.readFileSync(file(relative));
 assert.equal(data.toString("ascii",1,4),"PNG",`${relative} must be PNG`);
 return{width:data.readUInt32BE(16),height:data.readUInt32BE(20),colorType:data[25]};
};

assert.equal(APP_VERSION,"2.6.1");

const circles=MAGIC_CIRCLES.filter(circle=>circle.id!=="none");
assert.equal(circles.length,18);
for(const circle of circles){
 assert.equal(circle.frames.length,3,`${circle.id} animation frame count`);
 for(const source of circle.frames){
  const relative=source.replace(/^\.\//,"");
  assert.ok(fs.existsSync(file(relative)),`missing ${relative}`);
  assert.deepEqual(pngInfo(relative),{width:512,height:512,colorType:6},`${relative} format`);
 }
}
const circlePngs=fs.readdirSync(file("assets/magic-circles")).filter(name=>name.endsWith(".png")&&name!=="plain.png");
assert.equal(circlePngs.length,54,"18 circles × 3 PNGs");
assert.ok(!circlePngs.some(name=>name.includes(".tmp.")),"temporary circle PNGs must not ship");

for(const frame of["idle1","idle2","idle3","walk1","walk2","attack","damage","down"]){
 const relative=`assets/monsters/myth_rion/${frame}.png`;
 assert.deepEqual(pngInfo(relative),{width:512,height:512,colorType:6},relative);
}

const mythicEquipment=fs.readdirSync(file("assets/ui/equipment/mythic")).filter(name=>name.endsWith(".png"));
assert.equal(mythicEquipment.length,24);
for(const name of mythicEquipment)assert.deepEqual(pngInfo(`assets/ui/equipment/mythic/${name}`),{width:512,height:512,colorType:6},name);

const main=read("src/main.js");
const battle=read("src/ui/screens/BattleScreen.js");
const equipment=read("src/ui/screens/EquipmentScreen.js");
const equipmentVisual=read("src/ui/components/EquipmentVisual.js");
const circlesSource=read("src/core/MagicCircleSystem.js");
const css=read("src/Styles/v2.6.0.css");

assert.doesNotMatch(equipment,/magicCircleMarkup/,"equipment paper doll must not render the giant circle");
assert.match(equipment,/equipment-magic-circle-button/,"small settings icon remains");
assert.match(equipmentVisual,/equipment-direct-art/);
assert.match(css,/equipment-direct-art[\s\S]*overflow:hidden!important[\s\S]*object-fit:contain!important/);

assert.match(main,/setAutoMenuOpen/);
assert.match(main,/summary\?\.addEventListener\("click",event=>\{event\.preventDefault\(\)/);
assert.match(main,/handle:"summary",onTap:\(\)=>setAutoMenuOpen/);

assert.match(main,/refreshBattleHpTrails/);
assert.match(battle,/class="hp-trail"/);
assert.match(css,/battle-hp-trail-drain/);

assert.match(main,/battle\.invincibleAlliance=invincibleAllianceReady\(\)/);
assert.match(main,/battleBanner\("無敵"/);
assert.match(battle,/invincible-alliance-status/);

assert.match(circlesSource,/frames:freeze/);
assert.match(circlesSource,/magic-circle-frame-\$\{index\+1\}/);
assert.match(css,/magic-circle-frame-cycle/);

assert.match(main,/returnToSummonTop=.*openGacha\(\)/);
assert.doesNotMatch(main,/returnToSummonTop=.*go\("gacha"\)/);

console.log("ABYSS DOMINION v2.6.1 correction regression: PASS");
