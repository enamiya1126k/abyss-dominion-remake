import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{buildSectionMiniMapModel,fitMiniMapTransform,projectMiniMapPoint}from"../src/core/DungeonMiniMapSystem.js";
import{sectionBounds}from"../src/core/DungeonSectionSystem.js";

test("Build307 minimap exposes generated size and layout pattern at a stable true scale",()=>{
 const visible={id:"small-ring",index:0,attribute:"water",sizeTier:"small",layoutPattern:"ring",center:{x:2,y:2},cells:[{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:1,y:2},{x:3,y:2},{x:1,y:3},{x:2,y:3},{x:3,y:3}]};
 const hidden={id:"huge-cavern",index:1,attribute:"fire",sizeTier:"huge",layoutPattern:"cavern",center:{x:28,y:28},cells:Array.from({length:12},(_,y)=>Array.from({length:14},(_,x)=>({x:x+22,y:y+22}))).flat()};
 const world={sections:[visible,hidden],startSectionId:visible.id,currentSectionId:visible.id,discoveredSections:[visible.id],sectionGraph:[],sectionPortals:[]};
 const model=buildSectionMiniMapModel(world);
 assert.equal(model.sections.length,1,"hidden silhouettes remain secret");
 assert.equal(model.sections[0].sizeTier,"small");
 assert.equal(model.sections[0].shapeVariant,"ring","layoutPattern is the generator's canonical shape name");
 assert.equal(model.sections[0].cellCount,8);
 assert.equal(model.bounds.maxX,35,"hidden geometry still stabilizes the full-floor scale");
 assert.equal(model.bounds.maxY,33);
 const transform=fitMiniMapTransform(model,180,180,10),first=projectMiniMapPoint(transform,visible.cells[0]),last=projectMiniMapPoint(transform,hidden.cells.at(-1));
 assert.ok(first.x>=9&&first.y>=9);
 assert.ok(last.x<=171&&last.y<=171,"all generated size tiers fit one stable transform");
 assert.match(model.layoutSignature,/^[a-z0-9]+$/);
});

test("Build307 derives section bounds from legacy snapshot cells when min/max metadata is absent",()=>{
 const world={cols:50,rows:60,sections:[{id:"legacy",cells:[{x:10,y:20},{x:14,y:20},{x:12,y:24}]}]};
 assert.deepEqual(sectionBounds(world,"legacy",2),{x:8,y:18,w:9,h:9,minX:8,minY:18,maxX:16,maxY:26});
 const cellKeyWorld={cols:40,rows:40,sections:[{id:"keys-only",cellKeys:["5,7","8,11"]}]};
 assert.deepEqual(sectionBounds(cellKeyWorld,"keys-only",1),{x:4,y:6,w:6,h:7,minX:4,minY:6,maxX:9,maxY:12});
});

test("Build307 section exits render as feathered direction-aware passages, never black slabs",async()=>{
 const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8"),portal=main.slice(main.indexOf("function drawCampaignSectionPortal"),main.indexOf("function drawCampaignKey"));
 assert.match(portal,/createLinearGradient/);
 assert.match(portal,/mouthPath/);
 assert.match(portal,/bezierCurveTo/);
 assert.match(portal,/quadraticCurveTo/);
 assert.match(portal,/targetTheme\.accent/);
 assert.match(portal,/interiorOffset=\{north:/,"labels use the room-interior side of every cardinal mouth");
 assert.match(portal,/distance<=5/,"destination labels appear only near the exit");
 assert.doesNotMatch(portal,/fillRect\(/,"the opaque rectangular slab must not return");
 assert.doesNotMatch(portal,/ellipse\(/,"the retired black oval portal must not return");
});
