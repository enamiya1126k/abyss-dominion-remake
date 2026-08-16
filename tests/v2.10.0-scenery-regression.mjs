import assert from"node:assert/strict";
import fs from"node:fs";
import path from"node:path";
import{fileURLToPath}from"node:url";

import{DUNGEON_THEMES,dungeonThemeAssetPaths,dungeonThemeForFloor}from"../src/data/dungeonThemes.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const index=read("index.html"),main=read("src/main.js"),screen=read("src/ui/screens/ExploreScreen.js"),css=read("src/Styles/v2.10.0.css");

assert.equal(Object.keys(DUNGEON_THEMES).length,9,"nine materially distinct exploration themes are available");
for(const theme of Object.values(DUNGEON_THEMES)){
 assert.ok(theme.wallDepth>=.22&&theme.wallDepth<=.42,`${theme.id} has a restrained raised-wall depth`);
 assert.ok(theme.wallFace&&theme.wallRim&&theme.wallJoint,`${theme.id} has theme-specific wall face, rim and joint colours`);
}
assert.equal(dungeonThemeForFloor(1).id,"ruins");
assert.equal(dungeonThemeForFloor(11).id,"jungle");
assert.equal(dungeonThemeForFloor(21).id,"magma");
assert.equal(dungeonThemeForFloor(31).id,"ice");
assert.equal(dungeonThemeForFloor(41).id,"sacred");
assert.equal(dungeonThemeForFloor(51).id,"void");
assert.deepEqual([61,71,81,91].map(floor=>dungeonThemeForFloor(floor).id),["poison","void","magma","poison"],"the forty-floor Nether uses multiple matching landscapes");

assert.deepEqual([101,151,201,251,301,351,401,451,501].map(floor=>dungeonThemeForFloor(floor).id),["magma","ice","poison","storm","ruins","jungle","sacred","void","deepsea"],"deep fifty-floor bands match their named element");
assert.equal(dungeonThemeForFloor(101).variant,0);
assert.equal(dungeonThemeForFloor(111).variant,1);
assert.equal(dungeonThemeForFloor(121).variant,2);
assert.equal(dungeonThemeForFloor(131).variant,3);
assert.equal(dungeonThemeForFloor(141).variant,4);
assert.notEqual(dungeonThemeForFloor(101).cropOffsetX,dungeonThemeForFloor(111).cropOffsetX,"ten-floor sub-bands sample a different texture region");
assert.deepEqual([551,561,571,581,591].map(floor=>dungeonThemeForFloor(floor).id),["void","storm","magma","ice","poison"],"chaos bands visibly rotate their component elements");
assert.equal(dungeonThemeForFloor(3101).id,"magma","second-world floors retain the biome-linked scenery cycle");

for(const asset of dungeonThemeAssetPaths()){
 const absolute=path.join(root,asset);assert.ok(fs.existsSync(absolute),`missing scenery asset: ${asset}`);
 const bytes=fs.readFileSync(absolute);assert.equal(bytes.toString("ascii",1,4),"PNG",`${asset} must be PNG`);
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);assert.ok(width>=1200&&height>=1200,`${asset} is too small for continuous canvas sampling`);
}

assert.match(index,/v2\.10\.0\.css\?v=2\.10\.0-build(?:14[6-9]|15[0-7])/);
assert.match(index,/main\.js\?v=\$\{ASSET_VERSION\}-\$\{ASSET_BUILD\}/);
assert.match(main,/dungeonThemeForFloor/);
assert.match(main,/function exploreTextureSample/);
assert.match(main,/panelWidth=split\?Math\.floor\(image\.width\/2\)/,"atlas floor and wall panels are sampled independently");
assert.match(main,/function drawExploreRaisedWalls/);
assert.match(main,/drawExploreTextureSample\(wallTexture,true,theme/,"raised wall faces retain the current biome's wall material");
assert.match(main,/Contact shadows are painted onto the walkable side/);
assert.match(main,/sides>=3/,"isolated wall cells receive a connected pillar cap");
assert.match(main,/drawExploreAmbientParticles/);
assert.match(main,/drawExploreWallEdges/);
assert.match(screen,/explore-scenery-badge/);
assert.match(screen,/data-scenery-variant/);
assert.match(css,/sceneryPlateArrival/);
assert.match(css,/battle-theme-nether/);

console.log("ABYSS DOMINION v2.10.0 scenery regression: PASS");
