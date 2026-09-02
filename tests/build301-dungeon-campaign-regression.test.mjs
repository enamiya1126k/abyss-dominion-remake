import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

import{
 generateSectionDungeon,sectionIdAt,sectionRoute,portalTowardSection
}from"../src/core/DungeonSectionSystem.js";
import{
 CAMPAIGN_KEYS_PER_FLOOR,CAMPAIGN_MILESTONE_BOSSES,campaignFloorToLegacyFloor,
 campaignMilestoneBossIds,normalizeCampaignState,campaignFloorState,
 beginCampaignFloorRun,beginCampaignFloorReplay,collectCampaignKey,
 defeatCampaignBoss,claimTrophyChest,trophyChestEntitlements
}from"../src/core/Campaign100System.js";
import{
 FLOOR_BOSS_CATALOG,floorBossDefinitionForFloor,milestoneBossIdsForFloor
}from"../src/data/floorBosses.js";
import{ENDGAME_CHARACTERS}from"../src/data/endgameCharacters.js";
import{SaveService}from"../src/services/SaveService.js";

const CARDINAL=Object.freeze({
 north:{dx:0,dy:-1,opposite:"south"},
 east:{dx:1,dy:0,opposite:"west"},
 south:{dx:0,dy:1,opposite:"north"},
 west:{dx:-1,dy:0,opposite:"east"}
});
const NEIGHBORS=Object.freeze(Object.values(CARDINAL).map(({dx,dy})=>[dx,dy]));
const key=(x,y)=>`${x},${y}`;

function seeded(seed){
 let value=seed>>>0;
 return()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296};
}

function reachable(start,neighbors){
 const seen=new Set([start]),queue=[start];
 for(let index=0;index<queue.length;index++)for(const next of neighbors(queue[index]))if(!seen.has(next)){seen.add(next);queue.push(next)}
 return seen;
}

function openComponents(world){
 const remaining=new Set(Object.keys(world.sectionByCell)),components=[];
 while(remaining.size){
  const start=remaining.values().next().value,component=reachable(start,current=>{
   const[x,y]=current.split(",").map(Number);
   return NEIGHBORS.map(([dx,dy])=>key(x+dx,y+dy)).filter(next=>remaining.has(next));
  });
  component.forEach(entry=>remaining.delete(entry));components.push(component);
 }
 return components;
}

test("4–6 independent section dungeons stay connected only through reciprocal portals across many seeds",()=>{
 for(let seed=1;seed<=480;seed++){
  const count=4+(seed%3),attributes=Array.from({length:count},(_,index)=>`element-${index}`);
  const world=generateSectionDungeon({count,attributes,random:seeded(seed)}),context=`seed ${seed}, ${count} sections`;
  assert.equal(world.shape,"section-dungeons",context);
  assert.equal(world.sections.length,count,context);
  assert.equal(world.rooms,world.sections,context);
  assert.equal(new Set(world.sections.map(section=>section.id)).size,count,context);
  assert.deepEqual(world.sections.map(section=>section.attribute),attributes,context);

  const byId=new Map(world.sections.map(section=>[section.id,section]));
  const adjacency=new Map(world.sections.map(section=>[section.id,[]]));
  for(const edge of world.sectionGraph){
   const from=byId.get(edge.a),to=byId.get(edge.b),direction=CARDINAL[edge.direction];
   assert.ok(from&&to&&direction,`${context}: valid graph edge`);
   assert.equal(to.gx-from.gx,direction.dx,`${context}: logical edge x`);
   assert.equal(to.gy-from.gy,direction.dy,`${context}: logical edge y`);
   adjacency.get(edge.a).push(edge.b);adjacency.get(edge.b).push(edge.a);
  }
  const graphSeen=reachable(world.startSectionId,id=>adjacency.get(id)??[]);
  assert.equal(graphSeen.size,count,`${context}: logical topology connected`);
  for(const section of world.sections)assert.equal(sectionRoute(world,world.startSectionId,section.id).at(-1),section.id,`${context}: route reaches ${section.id}`);

  const summedCells=world.sections.reduce((sum,section)=>sum+section.cellKeys.length,0);
  assert.equal(Object.keys(world.sectionByCell).length,summedCells,`${context}: section cells never overlap`);
  for(const section of world.sections){
   const cells=new Set(section.cellKeys),start=section.cellKeys[0];
   assert.ok(cells.has(key(section.center.x,section.center.y)),`${context}: center is walkable`);
   const seen=reachable(start,current=>{
    const[x,y]=current.split(",").map(Number);
    return NEIGHBORS.map(([dx,dy])=>key(x+dx,y+dy)).filter(next=>cells.has(next));
   });
   assert.equal(seen.size,cells.size,`${context}: ${section.id} is internally connected`);
   for(const cellKey of cells){
    const[x,y]=cellKey.split(",").map(Number);
    assert.equal(world.tiles[y][x],0,`${context}: section cell is floor`);
    assert.equal(sectionIdAt(world,x,y),section.id,`${context}: section lookup`);
    for(const[dx,dy]of NEIGHBORS){
     const adjacent=world.sectionByCell[key(x+dx,y+dy)];
     assert.ok(!adjacent||adjacent===section.id,`${context}: no cross-section corridor or touching floor`);
    }
   }
  }
  const components=openComponents(world);
  assert.equal(components.length,count,`${context}: physical tilemap remains ${count} disconnected dungeons`);
  for(const component of components)assert.equal(new Set([...component].map(cell=>world.sectionByCell[cell])).size,1,`${context}: each physical component belongs to one section`);

  assert.equal(world.sectionPortals.length,world.sectionGraph.length*2,`${context}: every edge has two portals`);
  assert.equal(new Set(world.sectionPortals.map(portal=>portal.id)).size,world.sectionPortals.length,`${context}: portal ids unique`);
  for(const portal of world.sectionPortals){
   const source=byId.get(portal.sectionId),target=byId.get(portal.targetSectionId),direction=CARDINAL[portal.direction];
   assert.ok(source&&target&&direction,`${context}: portal endpoints valid`);
   assert.ok(source.cellKeys.includes(key(portal.x,portal.y)),`${context}: portal lies in source`);
   assert.ok(target.cellKeys.includes(key(portal.arrivalX,portal.arrivalY)),`${context}: arrival lies in target`);
   assert.equal(world.tiles[portal.y][portal.x],0,`${context}: portal tile open`);
   assert.equal(world.tiles[portal.arrivalY][portal.arrivalX],0,`${context}: arrival tile open`);
   const reverse=world.sectionPortals.find(candidate=>candidate.sectionId===portal.targetSectionId&&candidate.targetSectionId===portal.sectionId);
   assert.ok(reverse,`${context}: reverse portal exists`);
   assert.equal(reverse.direction,direction.opposite,`${context}: reverse direction`);
   const reverseVector=CARDINAL[reverse.direction];
   assert.equal(portal.arrivalX,reverse.x-reverseVector.dx,`${context}: arrival is one step inside destination`);
   assert.equal(portal.arrivalY,reverse.y-reverseVector.dy,`${context}: arrival is one step inside destination`);
   assert.equal(reverse.arrivalX,portal.x-direction.dx,`${context}: reverse arrival x`);
   assert.equal(reverse.arrivalY,portal.y-direction.dy,`${context}: reverse arrival y`);
   assert.equal(portalTowardSection(world,portal.sectionId,portal.targetSectionId)?.id,portal.id,`${context}: route selects portal`);
  }
 }
 assert.equal(generateSectionDungeon({count:1,random:seeded(9001)}).sections.length,4,"section count clamps to minimum");
 assert.equal(generateSectionDungeon({count:99,random:seeded(9002)}).sections.length,6,"section count clamps to maximum");
});

test("maximum-size section maps survive expedition save normalization without a 100-tile cutoff",()=>{
 const previousStorage=globalThis.localStorage,values=new Map();
 globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 try{
  const service=new SaveService(),template=structuredClone(service.state),scenarios=[
   {seed:3223,axis:"x",expectedCols:168,expectedRows:33},
   {seed:505,axis:"y",expectedCols:33,expectedRows:168}
  ];
  for(const scenario of scenarios){
   const world=generateSectionDungeon({count:6,random:seeded(scenario.seed)}),cells=world.sections.flatMap(section=>section.cells),target=cells.reduce((best,cell)=>cell[scenario.axis]>best[scenario.axis]?cell:best,cells[0]);
   assert.equal(world.cols,scenario.expectedCols,`seed ${scenario.seed} reaches the expected width`);
   assert.equal(world.rows,scenario.expectedRows,`seed ${scenario.seed} reaches the expected height`);
   assert.ok(target[scenario.axis]>100,`seed ${scenario.seed} exercises coordinates beyond the former cutoff`);
   world.exit={x:target.x,y:target.y};
   world.cols=Math.min(world.cols,100);world.rows=Math.min(world.rows,100);
   const state=structuredClone(template);state.player.inRun=true;state.expeditionSnapshot={floor:44,world,player:{x:target.x,y:target.y,rx:target.x,ry:target.y},partyTrail:[{x:target.x,y:target.y},{x:target.x-.25,y:target.y-.25}],cameraData:{x:target.x*32,y:target.y*32,z:1,ox:0,oy:0,manual:false},savedAt:new Date(0).toISOString()};
   const snapshot=service.migrate(state).expeditionSnapshot;
   assert.equal(snapshot.world.cols,scenario.expectedCols,"tile width repairs a previously truncated cols field");
   assert.equal(snapshot.world.rows,scenario.expectedRows,"tile height repairs a previously truncated rows field");
   assert.equal(snapshot.world.tiles.length,scenario.expectedRows,"stored tile rows match rows");
   assert.ok(snapshot.world.tiles.every(row=>row.length===scenario.expectedCols),"stored tile rows match cols");
   assert.deepEqual({x:snapshot.player.x,y:snapshot.player.y},target,"player position beyond tile 100 is preserved");
   assert.deepEqual(snapshot.partyTrail[0],target,"party trail position beyond tile 100 is preserved");
   assert.deepEqual({x:snapshot.world.exit.x,y:snapshot.world.exit.y},target,"exit remains aligned with the full tilemap");
  }

  const state=structuredClone(template),oversized=190;
  state.player.inRun=true;state.expeditionSnapshot={floor:45,world:{cols:oversized,rows:oversized,tiles:Array.from({length:oversized},()=>Array(oversized).fill(0)),start:{x:0,y:0},exit:{x:oversized-1,y:oversized-1}},player:{x:oversized-1,y:oversized-1},partyTrail:[{x:oversized-1,y:oversized-1}]};
  const bounded=service.migrate(state).expeditionSnapshot;
  assert.equal(bounded.world.cols,168,"untrusted snapshot width stays bounded to the largest legitimate map");
  assert.equal(bounded.world.rows,168,"untrusted snapshot height stays bounded to the largest legitimate map");
  assert.equal(bounded.world.tiles.length,168);
  assert.ok(bounded.world.tiles.every(row=>row.length===168));
  assert.deepEqual({x:bounded.player.x,y:bounded.player.y},{x:167,y:167});
  assert.deepEqual(bounded.partyTrail[0],{x:167,y:167});
  assert.deepEqual({x:bounded.world.exit.x,y:bounded.world.exit.y},{x:167,y:167});
 }finally{if(previousStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=previousStorage}
});

test("normal entry and serialized reconnect preserve an already-cleared floor",()=>{
 const save={};normalizeCampaignState(save);
 beginCampaignFloorRun(save,42,"first-run");
 collectCampaignKey(save,42,"42-campaign-key-1");
 collectCampaignKey(save,42,"42-campaign-key-2");
 collectCampaignKey(save,42,"42-campaign-key-3");
 const cleared=defeatCampaignBoss(save,42);
 cleared.bossAreaId="section-4";
 cleared.visitedRoomIds=["section-0","section-2","section-4"];
 cleared.postBossSpawns={trophy:{x:20,y:21,sectionId:"section-4"},spring:{x:22,y:21,sectionId:"section-4"},exit:{x:24,y:21,sectionId:"section-4"}};
 cleared.lastBossInfo={floorBossCatalogId:"floor-boss-420",name:"黎光の幻影騎士"};
 cleared.hotSpringUsed=true;
 const claim=claimTrophyChest(save,42);
 assert.equal(claim.claimed,true);
 assert.equal(campaignFloorState(save,42).trophyClaimed,true);
 const expected=structuredClone(campaignFloorState(save,42));delete expected.runId;

 const reentered=beginCampaignFloorRun(save,42,"ordinary-reentry");
 const actual=structuredClone(reentered);delete actual.runId;
 assert.deepEqual(actual,expected,"ordinary re-entry changes only the run id");
 assert.equal(reentered.runId,"ordinary-reentry");
 assert.equal(reentered.bossDefeated,true);
 assert.equal(reentered.exitUnlocked,true);
 assert.equal(reentered.trophyLocksOpened,CAMPAIGN_KEYS_PER_FLOOR);
 assert.equal(reentered.hotSpringUsed,true);

 const persisted=JSON.parse(JSON.stringify(save)),reconnected=beginCampaignFloorRun(persisted,42,"reconnect-run");
 const reconnectActual=structuredClone(reconnected);delete reconnectActual.runId;
 assert.deepEqual(reconnectActual,expected,"save round-trip reconnect preserves boss and post-boss field state");
 assert.equal(trophyChestEntitlements(persisted,42).equipmentGuaranteed,false,"claimed mythic reward cannot revive on reconnect");
});

test("only the explicit replay API resets replayable floor progress",()=>{
 const save={};normalizeCampaignState(save);
 for(let index=1;index<=3;index++)collectCampaignKey(save,57,`key-${index}`);
 const entry=defeatCampaignBoss(save,57);entry.bossAreaId="section-3";entry.visitedRoomIds=["section-0","section-3"];entry.hotSpringUsed=true;entry.postBossSpawns={trophy:{x:1,y:1},spring:{x:2,y:2},exit:{x:3,y:3}};
 claimTrophyChest(save,57);
 beginCampaignFloorRun(save,57,"normal-again");
 assert.equal(campaignFloorState(save,57).bossDefeated,true,"normal entry is a resume");

 const replay=beginCampaignFloorReplay(save,57,"explicit-replay");
 assert.equal(replay.runId,"explicit-replay");
 assert.deepEqual(replay.keyIds,[]);
 assert.equal(replay.keysCollected,0);
 assert.equal(replay.bossDiscovered,false);
 assert.equal(replay.bossDefeated,false);
 assert.equal(replay.exitUnlocked,false);
 assert.equal(replay.trophyLocksOpened,0);
 assert.equal(replay.hotSpringUsed,false);
 assert.deepEqual(replay.visitedRoomIds,[]);
 assert.equal(replay.postBossSpawns,null);
 assert.equal(replay.trophyClaimed,true,"explicit replay never restores the first-clear mythic entitlement");
 assert.equal(replay.bossAreaId,"section-3","stable boss-area seed may be retained for the replay");
 for(let index=1;index<=3;index++)collectCampaignKey(save,57,`replay-key-${index}`);
 defeatCampaignBoss(save,57);
 assert.equal(trophyChestEntitlements(save,57).equipmentGuaranteed,false,"replay grants fragments but not a second mythic item");
});

test("all 100 campaign floors resolve to official legacy bosses or the declared Abyss/Ten-God milestones",()=>{
 assert.equal(FLOOR_BOSS_CATALOG.length,90,"the legacy catalog supplies every non-milestone campaign floor");
 const normalIds=new Set();
 for(let floor=1;floor<=100;floor++){
  const campaignMilestones=campaignMilestoneBossIds(floor),catalogMilestones=milestoneBossIdsForFloor(floor);
  assert.deepEqual(catalogMilestones,campaignMilestones,`${floor}F milestone maps agree`);
  if(floor%10===0){
   assert.equal(floorBossDefinitionForFloor(floor),null,`${floor}F is reserved for story bosses`);
   assert.ok(campaignMilestones.length>=1,`${floor}F has an Abyss/Ten-God boss`);
   for(const id of campaignMilestones)assert.ok(ENDGAME_CHARACTERS[id],`${floor}F official story boss ${id} exists`);
  }else{
   assert.deepEqual(campaignMilestones,[],`${floor}F is a normal official floor boss`);
   const definition=floorBossDefinitionForFloor(floor),legacyFloor=campaignFloorToLegacyFloor(floor);
   assert.ok(definition,`${floor}F has a catalog definition`);
   assert.equal(definition.floor,legacyFloor,`${floor}F maps to legacy ${legacyFloor}F`);
   assert.equal(definition.legacyFloor,legacyFloor);
   assert.equal(definition.actualFloor,floor);
   assert.equal(definition.id,`floor-boss-${legacyFloor}`);
   assert.match(definition.visualSpeciesId,/^floor_boss_\d{3}$/);
   normalIds.add(definition.id);
  }
 }
 assert.equal(normalIds.size,90,"all normal campaign floors use distinct official bosses");
 assert.deepEqual(Object.fromEntries(Object.entries(CAMPAIGN_MILESTONE_BOSSES).map(([floor,ids])=>[floor,[...ids]])),{
  10:["abyss_gluttony"],20:["abyss_wrath"],30:["abyss_envy"],40:["abyss_sloth"],50:["abyss_greed"],60:["abyss_lust"],70:["abyss_pride"],
  80:["ten_time","ten_space","ten_life"],90:["ten_death","ten_fate","ten_chaos"],100:["ten_dominion","ten_creation","ten_end","ten_divinity"]
 });
 const sixth=floorBossDefinitionForFloor(6);
 assert.equal(sixth.id,"floor-boss-60");
 assert.equal(sixth.name,"深潮の封陣卿");
 assert.equal(sixth.visualSpeciesId,"floor_boss_060","campaign 6F cannot fall back to an enlarged ordinary monster");
});

test("main integration keeps section transitions, persistent post-boss unlocks, and strong reward feedback wired",async()=>{
 const[main,exploreScreen,build301Css]=await Promise.all([
  readFile(new URL("../src/main.js",import.meta.url),"utf8"),
  readFile(new URL("../src/ui/screens/ExploreScreen.js",import.meta.url),"utf8"),
  readFile(new URL("../src/Styles/build301.css",import.meta.url),"utf8")
 ]);
 assert.match(main,/generateSectionDungeon\(\{count:cfg\.roomCount,attributes,random:rng\}\)/);
 assert.match(main,/layoutVersion:301/);
 assert.match(main,/function transitionCampaignSection\(\)/);
 assert.match(main,/sectionPortals\.find\(entry=>entry\.sectionId===game\.world\.currentSectionId/);
 assert.doesNotMatch(main,/function connectRooms\(/,"old same-map corridor carver must stay removed");
 assert.match(main,/const campaignState=beginCampaignFloorRun\(/,"ordinary floor construction resumes campaign state");
 assert.doesNotMatch(main,/beginCampaignFloorReplay/,"ordinary gameplay must not call the explicit replay reset");
 assert.match(main,/const postBoss=campaignState\.bossDefeated,boss=postBoss\?null:/,"cleared floor re-entry does not respawn its boss");
 assert.match(main,/world\.boss=null;world\.bossDefeated=true;world\.nextEncounter=Number\.MAX_SAFE_INTEGER/,"boss clear despawns boss and random encounters");
 assert.match(main,/world\.trophyChest=\{[^;]+label:"支配者の戦利品"/s);
 assert.match(main,/world\.hotSpring=\{/);
 assert.match(main,/world\.exit=\{\.\.\.spawns\.exit,locked:false,active:true/);
 assert.match(main,/!game\.world\.bossDefeated&&game\.world\.steps>=game\.world\.nextEncounter/,"cleared floors cannot roll normal enemies");
 assert.match(main,/MYTHIC GET!/);
 assert.match(main,/BOSS TROPHY/);
 assert.match(main,/次の階層へ/);

 const bossFactory=main.slice(main.indexOf("function floorBossEnemy(){"),main.indexOf("function floorBossParty("));
 assert.match(bossFactory,/campaignFloorToLegacyFloor\(floor\)/);
 assert.match(bossFactory,/floorBossDefinitionForFloor\(floor\)/);
 assert.match(bossFactory,/FLOOR_BOSS_CATALOG/,"even the emergency branch remains inside the official boss catalog");
 assert.doesNotMatch(bossFactory,/randomEnemy|speciesPool|STANDARD_ENCOUNTER_SPECIES/,"official boss construction cannot reuse a random enlarged mob");

 assert.match(exploreScreen,/class="campaign-key-counter"/);
 assert.match(exploreScreen,/Array\.from\(\{length:CAMPAIGN_KEYS_PER_FLOOR\}/);
 assert.match(exploreScreen,/\$\{keys\}\/\$\{CAMPAIGN_KEYS_PER_FLOOR\}/);
 assert.match(build301Css,/\.campaign-key-counter/);
 assert.match(build301Css,/\.campaign-loot-reveal/);
 assert.match(build301Css,/\.campaign-mythic-item/);
});
