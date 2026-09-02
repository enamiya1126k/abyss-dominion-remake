import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

import{
 generateSectionDungeon,safeSectionExitCandidates,chooseSafeSectionExitCell
}from"../src/core/DungeonSectionSystem.js";

const DIRECTIONS=Object.freeze([[1,0],[-1,0],[0,1],[0,-1]]);
const key=point=>`${point.x},${point.y}`;

function seeded(seed){
 let value=seed>>>0;
 return()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296}
}

function reachableWithout(section,removed){
 const open=new Set(section.cellKeys);open.delete(key(removed));
 const start=open.values().next().value,seen=new Set(start?[start]:[]),queue=[...seen];
 for(let cursor=0;cursor<queue.length;cursor++){
  const[x,y]=queue[cursor].split(",").map(Number);
  for(const[dx,dy]of DIRECTIONS){const next=`${x+dx},${y+dy}`;if(open.has(next)&&!seen.has(next)){seen.add(next);queue.push(next)}}
 }
 return seen
}

function portalCellsInSection(world,sectionId){
 return world.sectionPortals.flatMap(portal=>[
  {x:portal.x,y:portal.y,sectionId:portal.sectionId},
  {x:portal.arrivalX,y:portal.arrivalY,sectionId:portal.targetSectionId}
 ]).filter(point=>point.sectionId===sectionId)
}

test("post-boss exits never become section cut vertices across 2,400 generated floors",()=>{
 for(let seed=1;seed<=2400;seed++){
  const random=seeded(seed),world=generateSectionDungeon({count:4+seed%3,random});
  for(const section of world.sections){
   const portals=portalCellsInSection(world,section.id),boss=section.center,reserved=[...portals,boss],candidates=safeSectionExitCandidates(section,{reserved});
   assert.ok(candidates.length,`seed ${seed}/${section.id}: safe exit candidates exist`);
   const exit=chooseSafeSectionExitCell(section,{reserved,awayFrom:[boss],minimumDistance:3,random});
   assert.ok(exit,`seed ${seed}/${section.id}: safe exit selected`);
   assert.equal(exit.sectionId,section.id);
   assert.ok(!new Set(reserved.map(key)).has(key(exit)),`seed ${seed}/${section.id}: exit avoids boss and both sides of every portal`);

   const reachable=reachableWithout(section,exit);
   assert.equal(reachable.size,section.cellKeys.length-1,`seed ${seed}/${section.id}: blocking the active exit cannot split the dungeon`);
   for(const portal of portals)assert.ok(reachable.has(key(portal)),`seed ${seed}/${section.id}: every portal remains reachable after the exit activates`)
  }
 }
});

test("main treats the hidden pre-boss exit as floor and activates only a safe destination after victory",async()=>{
 const main=await readFile(new URL("../src/main.js",import.meta.url),"utf8"),spawn=main.slice(main.indexOf("function ensurePostBossSpawns("),main.indexOf("function applyCampaignBossClearToWorld(")),movement=main.slice(main.indexOf("function update(dt)"),main.indexOf("function openChest(")),pathfinder=main.slice(main.indexOf("function path(w,s,g)"),main.indexOf("function bindInput(c)"));
 assert.match(spawn,/safeSectionExitCandidates\(section\)/,"saved exits are accepted only when they cannot cut a section");
 assert.match(spawn,/chooseSafeSectionExitCell\(section,/,"new exits use the cut-safe selector");
 assert.match(spawn,/sectionId:portal\.targetSectionId/,"arrival cells on the reverse side of portals are reserved too");
 assert.match(pathfinder,/const exitBlocksPassage=Boolean\(w\.exit&&w\.exit\.active!==false&&!w\.exit\.locked\)/,"inactive/locked exits cannot obstruct pre-boss routing");
 assert.match(pathfinder,/!goalIsExit&&exitBlocksPassage&&x===w\.exit\.x&&y===w\.exit\.y/);
 assert.match(movement,/if\(game\.world\.exit\?\.active!==false&&!game\.world\.exit\.locked&&game\.player\.x===game\.world\.exit\.x&&game\.player\.y===game\.world\.exit\.y\)/,"walking across the hidden or locked reservation cannot trigger a false floor-clear prompt");
});
