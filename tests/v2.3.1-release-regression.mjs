import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {APP_VERSION,MONSTER_STORAGE_CAP,SAVE_SCHEMA_VERSION} from "../src/core/config.js";
import {GAUNTLET_DAILY_LIMIT,TEAM_BATTLE_DAILY_LIMIT} from "../src/core/EndgameSystem.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");

assert.equal(APP_VERSION,"2.7.0");
assert.equal(SAVE_SCHEMA_VERSION,53);
assert.equal(MONSTER_STORAGE_CAP,3000);
assert.equal(TEAM_BATTLE_DAILY_LIMIT,10);
assert.equal(GAUNTLET_DAILY_LIMIT,10);

const equipmentVisual=read("src/ui/components/EquipmentVisual.js");
assert.match(equipmentVisual,/class="equipment-pixel-art slot-/);
assert.doesNotMatch(equipmentVisual,/equipment-fallback/);

const correctionCss=read("src/Styles/v2.3.1.css");
assert.match(correctionCss,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(correctionCss,/\.equipment-pixel-art::before,\.equipment-pixel-art::after\{display:none!important/);
assert.match(correctionCss,/animation-duration:1500ms!important/);
assert.match(correctionCss,/\.floating-number\.critical\{animation-duration:1800ms!important/);
assert.match(correctionCss,/\[data-formation-pick\]\[hidden\].*display:none!important/);
assert.match(correctionCss,/abyss-corridor-room\.png/);

const main=read("src/main.js");
assert.match(main,/autoExploreButtonPosition/);
assert.match(main,/data-formation-attribute/);
assert.match(main,/button\.hidden=Boolean\(query/);
assert.match(main,/team-defeat-modal/);

const explore=read("src/ui/screens/ExploreScreen.js");
assert.match(explore,/data-hud-hp-label>HP/);
assert.match(explore,/data-hud-mp-label>MP/);
assert.match(explore,/rarity-name-/);
assert.match(explore,/attributeVisual\(attribute/);

const gauntlet=read("src/ui/screens/GauntletScreen.js");
assert.match(gauntlet,/abyss-corridor-portal\.png/);
assert.doesNotMatch(gauntlet,/corridor-pillar/);

const skillTree=read("src/ui/screens/AbyssSkillTreeScreen.js");
assert.match(skillTree,/function treeIcon/);
assert.doesNotMatch(skillTree,/🩸|🫀|⚔️|🏰|💰/u);

const index=read("index.html");
assert.match(index,/v2\.3\.1\.css\?v=2\.7\.0/);
assert.match(index,/ASSET_VERSION = "2\.7\.0"/);

for(const [asset,minBytes] of [
 ["assets/ui/trials/abyss-corridor-room.png",500_000],
 ["assets/ui/trials/abyss-corridor-portal.png",400_000]
]){
 const png=fs.readFileSync(path.join(root,asset));
 assert.equal(png.toString("ascii",1,4),"PNG",`${asset} is not PNG`);
 assert.ok(png.length>minBytes,`${asset} is unexpectedly small`);
}

console.log("ABYSS DOMINION v2.4.0 correction regression: PASS");
