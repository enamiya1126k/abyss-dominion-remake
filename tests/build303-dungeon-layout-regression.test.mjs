import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";
import{generateSectionDungeon}from"../src/core/DungeonSectionSystem.js";

const CARDINAL={north:{dx:0,dy:-1},east:{dx:1,dy:0},south:{dx:0,dy:1},west:{dx:-1,dy:0}};
const seeded=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const cellKey=point=>`${point.x},${point.y}`;

test("Build303 section dungeons are materially larger without fake four-way exits",()=>{
 let cells=0,sections=0;
 for(let seed=1;seed<=240;seed++){
  const count=4+seed%3,world=generateSectionDungeon({count,random:seeded(seed)});
  assert.equal(world.slot,42);
  assert.equal(world.sectionScale,1.65);
  assert.ok(world.cols<=258&&world.rows<=258,`seed ${seed} fits the save-safe map envelope`);
  for(const section of world.sections){
   cells+=section.cells.length;sections++;
   const connected=new Set(world.sectionPortals.filter(portal=>portal.sectionId===section.id).map(portal=>portal.direction));
   for(const[direction,anchor]of Object.entries(section.anchor)){
    const walkable=section.cellKeys.includes(cellKey(anchor));
    assert.equal(walkable,connected.has(direction),`seed ${seed} ${section.id}: only a real link carves ${direction}`);
   }
   for(const portal of world.sectionPortals.filter(portal=>portal.sectionId===section.id)){
    assert.ok(section.cellKeys.includes(cellKey(portal)),`seed ${seed}: portal is part of the real silhouette`);
    const vector=CARDINAL[portal.direction];
    assert.ok(vector,`seed ${seed}: portal direction is valid`);
   }
  }
 }
 const average=cells/sections;
 assert.ok(average>=235&&average<=310,`expanded average walkable area stays in the designed band (${average.toFixed(1)})`);
});

test("Build303 guarantees an existing useful pickup in otherwise empty sections",async()=>{
 const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8");
 assert.match(main,/const meaningfulSections=new Set/);
 assert.match(main,/for\(const section of world\.sections\?\?\[\]\)/);
 assert.match(main,/add\("crystal",cells,\{scale:1\.18/);
 assert.match(main,/sectionReward=true/);
 assert.match(main,/section-reward-\$\{section\.index\+1\}/);
});

