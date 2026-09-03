import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

import{
 generateSectionDungeon,SECTION_SIZE_TIERS,SECTION_SHAPE_PATTERNS
}from"../src/core/DungeonSectionSystem.js";

const DIRECTIONS=Object.freeze({
 north:{dx:0,dy:-1,opposite:"south"},east:{dx:1,dy:0,opposite:"west"},
 south:{dx:0,dy:1,opposite:"north"},west:{dx:-1,dy:0,opposite:"east"}
});
const key=(x,y)=>`${x},${y}`;
const seeded=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};

function connectedCount(section){
 const cells=new Set(section.cellKeys),start=section.cellKeys[0],seen=new Set(start?[start]:[]),queue=[...seen];
 for(let cursor=0;cursor<queue.length;cursor++){
  const[x,y]=queue[cursor].split(",").map(Number);
  for(const{dx,dy}of Object.values(DIRECTIONS)){const next=key(x+dx,y+dy);if(cells.has(next)&&!seen.has(next)){seen.add(next);queue.push(next)}}
 }
 return seen.size
}

test("Build307 supports all four scales and all authored section silhouettes deterministically",()=>{
 const tiers=Object.keys(SECTION_SIZE_TIERS),averages={};
 assert.deepEqual(SECTION_SHAPE_PATTERNS,["irregular","cavern","ring","slender","branched"]);
 for(const tier of tiers){
  const areas=[];
  for(let seed=1;seed<=80;seed++){
   const patterns=Array.from({length:4},(_,index)=>SECTION_SHAPE_PATTERNS[(seed+index)%SECTION_SHAPE_PATTERNS.length]),options={count:4,random:seeded(seed),sizeTiers:Array(4).fill(tier),patterns},world=generateSectionDungeon(options);
   assert.equal(world.generationVersion,307);
   for(let index=0;index<world.sections.length;index++){
    const section=world.sections[index];
    assert.equal(section.sizeTier,tier);
    assert.equal(section.layoutPattern,patterns[index]);
    assert.equal(section.walkableArea,section.cells.length);
    assert.deepEqual(section.footprint,{w:section.w,h:section.h,area:section.cells.length});
    assert.equal(connectedCount(section),section.cells.length,`${tier}/${patterns[index]}/seed ${seed} is one walkable island`);
    areas.push(section.walkableArea)
   }
  }
  averages[tier]=areas.reduce((sum,value)=>sum+value,0)/areas.length
 }
 assert.ok(averages.small<averages.standard,JSON.stringify(averages));
 assert.ok(averages.standard<averages.large,JSON.stringify(averages));
 assert.ok(averages.large<averages.huge,JSON.stringify(averages));
 assert.ok(averages.huge>=averages.small*4.5,`huge sections are materially larger: ${JSON.stringify(averages)}`);

 const first=generateSectionDungeon({count:6,random:seeded(307)}),second=generateSectionDungeon({count:6,random:seeded(307)});
 assert.deepEqual(first,second,"seeded generation is stable for reconnect/save reproduction");
});

test("Build307 generated floors naturally contain every size and pattern over a broad seed sample",()=>{
 const tiers=new Set(),patterns=new Set();
 for(let seed=1;seed<=240;seed++)for(const section of generateSectionDungeon({count:4+seed%3,random:seeded(seed)}).sections){tiers.add(section.sizeTier);patterns.add(section.layoutPattern)}
 assert.deepEqual([...tiers].sort(),Object.keys(SECTION_SIZE_TIERS).sort());
 assert.deepEqual([...patterns].sort(),[...SECTION_SHAPE_PATTERNS].sort());
});

test("Build307 portals occupy the matching outer edge and always arrive one safe step inside",()=>{
 for(let seed=1;seed<=720;seed++){
  const world=generateSectionDungeon({count:4+seed%3,random:seeded(seed)}),byId=new Map(world.sections.map(section=>[section.id,section]));
  for(const section of world.sections){
   const linked=new Set(world.sectionPortals.filter(portal=>portal.sectionId===section.id).map(portal=>portal.direction));
   for(const[direction,anchor]of Object.entries(section.anchor))assert.equal(section.cellKeys.includes(key(anchor.x,anchor.y)),linked.has(direction),`seed ${seed}/${section.id}: no decorative fake exit`)
  }
  for(const portal of world.sectionPortals){
   const direction=DIRECTIONS[portal.direction],source=byId.get(portal.sectionId),target=byId.get(portal.targetSectionId),sourceCells=new Set(source.cellKeys),targetCells=new Set(target.cellKeys),reverse=world.sectionPortals.find(candidate=>candidate.sectionId===portal.targetSectionId&&candidate.targetSectionId===portal.sectionId);
   assert.ok(direction&&reverse&&source&&target);
   assert.equal(sourceCells.has(key(portal.x+direction.dx,portal.y+direction.dy)),false,`seed ${seed}: darkness is outside the ${portal.direction} edge`);
   assert.equal(sourceCells.has(key(portal.x-direction.dx,portal.y-direction.dy)),true,`seed ${seed}: ${portal.direction} portal has an inner approach`);
   assert.equal(targetCells.has(key(portal.arrivalX,portal.arrivalY)),true,`seed ${seed}: arrival is walkable`);
   assert.equal(portal.targetDirection,direction.opposite);
   assert.equal(portal.arrivalFacing,portal.direction);
   const reverseDirection=DIRECTIONS[reverse.direction];
   assert.equal(portal.arrivalX,reverse.x-reverseDirection.dx);
   assert.equal(portal.arrivalY,reverse.y-reverseDirection.dy)
  }
 }
});

test("Build308 starts new layouts at 308 while retaining safe Build303/307 field resumes",async()=>{
 const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8"),maze=main.slice(main.indexOf("function maze()"),main.indexOf("let expeditionSaveTimer")),hydrate=main.slice(main.indexOf("function hydrateExpeditionSnapshot("),main.indexOf("function clearExpeditionSnapshot("));
 assert.match(maze,/layoutVersion:308/);
 assert.doesNotMatch(maze,/layoutVersion:303/);
 assert.match(hydrate,/!\[303,307,308\]\.includes\(Number\(world\.layoutVersion\)\)/,"only the compatible disconnected-section layouts can resume");
});
