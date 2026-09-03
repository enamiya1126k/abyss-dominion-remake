import test from"node:test";
import assert from"node:assert/strict";

import{
 applyCampaignBossDefeatToWorld,campaignBossTrophyChestId,
 createCampaignBossPlacements,normalizeCampaignBossWorld,
 requiredCampaignBossSectionCount,shouldRegenerateCampaignBossSnapshot,
 updateCampaignTrophyChestLocks,validateCampaignBossSectionCapacity
}from"../src/core/CampaignBossWorldSystem.js";

const TEN_GODS=Object.freeze({
 80:["ten_time","ten_space","ten_life"],
 90:["ten_death","ten_fate","ten_chaos"],
 100:["ten_dominion","ten_creation","ten_end","ten_divinity"]
});

function section(index){
 const base=index*20,cells=[];for(let y=1;y<=7;y++)for(let x=1;x<=7;x++)cells.push({x:base+x,y});
 return{id:`section-${index}`,index,center:{x:base+4,y:4},cells,cellKeys:cells.map(cell=>`${cell.x},${cell.y}`)}
}

function campaignWorld(count){
 const sections=Array.from({length:count},(_,index)=>section(index));
 return{layoutVersion:308,sections,rooms:sections,startSectionId:"section-0",start:{...sections[0].center,sectionId:"section-0"},sectionPortals:[],campaignKeys:[],chests:[],decorations:[],exit:null,hotSpring:null,boss:null,trophyChest:null}
}

test("Build308 reserves a different non-start section for every milestone boss",()=>{
 assert.equal(requiredCampaignBossSectionCount(80,TEN_GODS[80],4),4);
 assert.equal(requiredCampaignBossSectionCount(90,TEN_GODS[90],4),4);
 assert.equal(requiredCampaignBossSectionCount(100,TEN_GODS[100],4),5,"100F needs the start plus four boss sections");
 const short=campaignWorld(4),validation=validateCampaignBossSectionCapacity(short,TEN_GODS[100],{floor:100});
 assert.equal(validation.valid,false);assert.match(validation.errors.join(" "),/at least 5 sections/);
 assert.throws(()=>createCampaignBossPlacements(short,TEN_GODS[100],{floor:100,seed:308}),error=>error?.code==="CAMPAIGN_BOSS_SECTION_CAPACITY");
 const world=campaignWorld(5),first=createCampaignBossPlacements(world,TEN_GODS[100],{floor:100,seed:308}),second=createCampaignBossPlacements(world,TEN_GODS[100],{floor:100,seed:308});
 assert.deepEqual(first,second,"the same floor seed reproduces every placement");
 assert.equal(new Set(first.map(boss=>boss.sectionId)).size,4);
 assert.equal(first.some(boss=>boss.sectionId===world.startSectionId),false);
 for(const boss of first){const owner=world.sections.find(entry=>entry.id===boss.sectionId);assert.ok(owner.cellKeys.includes(`${boss.x},${boss.y}`));assert.equal(boss.rewardOwnerId,boss.bossId)}
});

test("Build308 honors valid saved boss areas and repairs duplicate area assignments deterministically",()=>{
 const world=campaignWorld(5),progress={bossProgress:{
  ten_dominion:{bossAreaId:"section-4",discovered:true},
  ten_creation:{bossAreaId:"section-4"},
  ten_end:{bossAreaId:"section-0"}
 }},placements=createCampaignBossPlacements(world,TEN_GODS[100],{floor:100,seed:"stable-run",progress});
 assert.equal(placements.find(entry=>entry.bossId==="ten_dominion").sectionId,"section-4");
 assert.equal(placements.find(entry=>entry.bossId==="ten_dominion").hidden,false);
 assert.equal(new Set(placements.map(entry=>entry.sectionId)).size,4,"duplicate/start assignments are repaired, never shared");
});

test("Build308 keeps a valid saved boss coordinate when normalizing a resumed field",()=>{
 const world=campaignWorld(5),bosses=createCampaignBossPlacements(world,TEN_GODS[100],{floor:100,seed:41}),resumed={...world,bosses},again=createCampaignBossPlacements(resumed,TEN_GODS[100],{floor:100,seed:999});
 assert.deepEqual(again.map(({bossId,sectionId,x,y})=>({bossId,sectionId,x,y})),bosses.map(({bossId,sectionId,x,y})=>({bossId,sectionId,x,y})),"a different runtime seed cannot move already persisted bosses");
});

test("Build308 normalizes legacy singular objects into identity-safe arrays",()=>{
 const source={boss:{x:24,y:4,sectionId:"section-1",active:true},trophyChest:{id:"12-trophy",x:25,y:4,sectionId:"section-1",open:false}};
 const normalized=normalizeCampaignBossWorld(source,{floor:12,bossIds:["floor_boss_012"]});
 assert.equal(normalized.bosses.length,1);assert.equal(normalized.bosses[0].bossId,"floor_boss_012");
 assert.equal(normalized.trophyChests.length,1);assert.equal(normalized.trophyChests[0].id,"12-trophy-floor_boss_012");
 assert.equal(normalized.boss,normalized.bosses[0]);assert.equal(normalized.trophyChest,normalized.trophyChests[0]);
 assert.equal(campaignBossTrophyChestId(100,"ten_end"),"100-trophy-ten_end");
});

test("Build303/307 milestone snapshots are regenerated instead of reviving the old party boss",()=>{
 for(const floor of[80,90,100])for(const layoutVersion of[303,307])assert.equal(shouldRegenerateCampaignBossSnapshot({floor,world:{layoutVersion}},{bossIds:TEN_GODS[floor]}),true);
 assert.equal(shouldRegenerateCampaignBossSnapshot({floor:100,world:{layoutVersion:308}},{bossIds:TEN_GODS[100]}),false);
 assert.equal(shouldRegenerateCampaignBossSnapshot({floor:79,world:{layoutVersion:307}},{bossIds:["ordinary"]}),false);
 assert.equal(shouldRegenerateCampaignBossSnapshot({floor:100,world:{layoutVersion:307}},{bossIds:["ordinary"]}),false,"an explicitly single-boss floor is not treated as the new milestone layout");
});

test("one victory opens the route and creates only that boss chest without consuming shared keys",()=>{
 const base=campaignWorld(5),bosses=createCampaignBossPlacements(base,TEN_GODS[100],{floor:100,seed:9001}),world={...base,bosses,boss:bosses[0],bossDefeated:false},before=structuredClone(world),keyState={keysCollected:2,keysConsumed:0};
 const first=applyCampaignBossDefeatToWorld(world,{floor:100,bossId:TEN_GODS[100][0],bossIds:TEN_GODS[100],seed:9001,keysHeld:keyState.keysCollected});
 assert.deepEqual(world,before,"the battle-result reducer is pure");assert.deepEqual(keyState,{keysCollected:2,keysConsumed:0},"world settlement cannot spend a key");
 assert.equal(first.bossDefeated,true);assert.equal(first.allBossesDefeated,false);assert.equal(first.exit.active,true);assert.equal(first.exit.locked,false);assert.equal(first.hotSpring.active,true);assert.equal(first.nextEncounter,Number.MAX_SAFE_INTEGER);
 assert.equal(first.bosses.filter(entry=>entry.defeated).length,1);assert.equal(first.bosses.filter(entry=>entry.active).length,3);
 assert.deepEqual(first.trophyChests.map(entry=>entry.bossId),[TEN_GODS[100][0]]);assert.equal(first.trophyChests[0].locked,true);assert.equal(first.trophyChests[0].open,false);

 const exitPoint={x:first.exit.x,y:first.exit.y},springPoint={x:first.hotSpring.x,y:first.hotSpring.y},second=applyCampaignBossDefeatToWorld(first,{floor:100,bossId:TEN_GODS[100][1],bossIds:TEN_GODS[100],seed:9001,keysHeld:3});
 assert.deepEqual({x:second.exit.x,y:second.exit.y},exitPoint,"later gods do not move the unlocked exit");assert.deepEqual({x:second.hotSpring.x,y:second.hotSpring.y},springPoint);
 assert.equal(second.trophyChests.length,2);assert.equal(new Set(second.trophyChests.map(entry=>entry.id)).size,2);assert.ok(second.trophyChests.every(entry=>entry.locked===false));
 const repeated=applyCampaignBossDefeatToWorld(second,{floor:100,bossId:TEN_GODS[100][1],bossIds:TEN_GODS[100],seed:9001,keysHeld:3});assert.equal(repeated.trophyChests.length,2,"a replayed result is idempotent");
});

test("all defeated gods retain separate non-consuming chests and only then set the completion hint",()=>{
 const base=campaignWorld(5),bosses=createCampaignBossPlacements(base,TEN_GODS[100],{floor:100,seed:77});let world={...base,bosses};
 for(const bossId of TEN_GODS[100])world=applyCampaignBossDefeatToWorld(world,{floor:100,bossId,bossIds:TEN_GODS[100],seed:77,keysHeld:3});
 assert.equal(world.allBossesDefeated,true);assert.equal(world.trophyChests.length,4);assert.equal(new Set(world.trophyChests.map(entry=>entry.sectionId)).size,4);assert.ok(world.trophyChests.every(entry=>entry.locked===false));
 const relocked=updateCampaignTrophyChestLocks(world,{floor:100,bossIds:TEN_GODS[100],keysHeld:1});assert.ok(relocked.trophyChests.every(entry=>entry.locked===true));
 assert.equal(world.trophyChests.every(entry=>entry.locked===false),true,"lock refresh also leaves its input untouched");
});

test("a durable defeat repairs aftermath objects missing from a stale field snapshot",()=>{
 const base=campaignWorld(5),bosses=createCampaignBossPlacements(base,TEN_GODS[100],{floor:100,seed:19,progress:{bossProgress:{ten_dominion:{defeated:true}}}}),stale={...base,bosses,bossDefeated:true,exit:null,hotSpring:null,trophyChests:[]};
 const repaired=applyCampaignBossDefeatToWorld(stale,{floor:100,bossId:"ten_dominion",bossIds:TEN_GODS[100],seed:19,keysHeld:3});
 assert.equal(repaired.exit.active,true);assert.equal(repaired.exit.locked,false);assert.equal(repaired.hotSpring.active,true);assert.equal(repaired.trophyChests.length,1);
});

test("a used boss spring stays visible while its recovery remains consumed",()=>{
 const base=campaignWorld(5),bosses=createCampaignBossPlacements(base,TEN_GODS[80],{floor:80,seed:27}),world={...base,bosses};
 const cleared=applyCampaignBossDefeatToWorld(world,{floor:80,bossId:TEN_GODS[80][0],bossIds:TEN_GODS[80],seed:27,hotSpringUsed:true});
 assert.equal(cleared.hotSpring.active,true);
 assert.equal(cleared.hotSpring.used,true);
});
