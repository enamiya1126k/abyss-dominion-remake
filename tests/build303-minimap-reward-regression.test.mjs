import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{buildSectionMiniMapModel,fitMiniMapTransform,projectMiniMapPoint}from"../src/core/DungeonMiniMapSystem.js";

const section=(id,index,offset,attribute)=>({id,index,attribute,center:{x:offset+1,y:1},cells:[{x:offset,y:0},{x:offset+1,y:0},{x:offset,y:1},{x:offset+1,y:1}],cellKeys:[`${offset},0`,`${offset+1},0`,`${offset},1`,`${offset+1},1`]});

test("minimap preserves real silhouettes, one-hop fog and safe markers",()=>{
 const sections=[section("a",0,0,"fire"),section("b",1,10,"water"),section("c",2,20,"wind")],world={sections,startSectionId:"a",currentSectionId:"a",discoveredSections:["a"],sectionGraph:[{a:"a",b:"b"},{a:"b",b:"c"}],sectionPortals:[{sectionId:"a",targetSectionId:"b",x:1,y:1},{sectionId:"b",targetSectionId:"a",x:10,y:1},{sectionId:"b",targetSectionId:"c",x:11,y:1},{sectionId:"c",targetSectionId:"b",x:20,y:1}],sectionByCell:Object.fromEntries(sections.flatMap(value=>value.cellKeys.map(key=>[key,value.id]))),campaignKeys:[{x:0,y:0,sectionId:"a",collected:false},{x:10,y:0,sectionId:"b",collected:false}],boss:{x:20,y:0,sectionId:"c",hidden:true}};
 const model=buildSectionMiniMapModel(world,{});
 assert.deepEqual(model.sections.map(value=>[value.id,value.mode]),[["a","visited"],["b","frontier"]]);
 assert.equal(model.sections[0].cells.length,4,"the actual cell silhouette is retained");
 assert.deepEqual(model.markers.map(value=>value.sectionId),["a"],"undiscovered rewards never leak through the map");
 const transform=fitMiniMapTransform(model,176,176,10);
 for(const value of model.sections.flatMap(entry=>entry.cells)){
  const point=projectMiniMapPoint(transform,value);
  assert.ok(point.x>=9&&point.x<=167&&point.y>=9&&point.y<=167,"every visible shape fits inside the frame");
 }
});

test("portals, boss unlocks and ordinary chests have authored feedback",async()=>{
 const[main,css]=await Promise.all([
  readFile(new URL("../src/main.js",import.meta.url),"utf8"),
  readFile(new URL("../src/Styles/build303-dungeon.css",import.meta.url),"utf8")
 ]);
 const portal=main.slice(main.indexOf("function drawCampaignSectionPortal"),main.indexOf("function drawCampaignKey"));
 assert.match(portal,/createLinearGradient/);
 assert.match(portal,/targetTheme\.accent/);
 assert.doesNotMatch(portal,/ellipse\(/,"the old black oval portal does not return");
 const boss=main.slice(main.indexOf("function showPostBossFieldUnlocks"),main.indexOf("function transitionCampaignSection"));
 assert.match(boss,/pixelIcon\("chest"\)/);
 assert.match(boss,/pixelIcon\("rest"\)/);
 assert.match(boss,/pixelIcon\("dungeon"\)/);
 assert.doesNotMatch(boss,/[◆♨□]/);
 const chest=main.slice(main.indexOf("function showChestRewardReveal"),main.indexOf("function explorationPartyMembers"));
 assert.match(chest,/獲得！/);
 assert.match(chest,/openedChests\[floor\]\.includes\(c\.id\)/);
 assert.match(chest,/persistExpeditionSnapshot\(expeditionSnapshotFromGame\(\),\{saveNow:false\}\)/);
 assert.match(chest,/if\(!save\.save\(\)\)throw new Error\("save failed"\)/);
 assert.match(chest,/catch\(error\)\{save\.state=checkpoint;c\.open=chestCheckpoint\.open/);
 assert.match(css,/\.dungeon-chest-reveal/);
 assert.match(css,/\.post-boss-field-unlocks>div>span/);
});

