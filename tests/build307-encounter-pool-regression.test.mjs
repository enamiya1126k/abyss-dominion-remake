import test from"node:test";
import assert from"node:assert/strict";

import{SPECIES}from"../src/data/species.js";
import{
 CAMPAIGN_RARITY_UNLOCK_FLOORS,ENCOUNTER_ATTRIBUTE_AFFINITIES,ENCOUNTER_RARE_PITY,ENCOUNTER_RECENT_WINDOW,
 campaignEncounterUnlockFloor,eligibleCampaignEncounterSpecies,encounterCandidatesForAttribute,
 encounterPoolAudit,encounterRarePityChance,isHighRarityEncounter,
 normalizeEncounterHistory,rollAttributeEncounterGroup
}from"../src/core/EncounterPoolSystem.js";
import{SaveService}from"../src/services/SaveService.js";

function seeded(seed){
 let value=seed>>>0;
 return()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296}
}

test("build307 gives every room attribute a varied, name-unique encounter family",()=>{
 const audit=encounterPoolAudit(SPECIES,100,{campaign:true});
 assert.deepEqual(audit.map(row=>row.attribute),Object.keys(ENCOUNTER_ATTRIBUTE_AFFINITIES));
 for(const row of audit){
  assert.ok(row.total>=8,`${row.attribute} has at least eight available enemies`);
  assert.equal(row.uniqueNames,row.total,`${row.attribute} has no duplicate display names`);
  assert.ok(row.highRare>0,`${row.attribute} can produce a high-rarity encounter`)
 }
 const fire=encounterCandidatesForAttribute(SPECIES,11,"fire",{campaign:true});
 assert.ok(fire.primary.length>=4,"the fire room no longer collapses to one dragon");
 assert.ok(fire.primary.every(species=>species.element==="fire"));
 assert.ok(fire.support.length>=4,"early fire rooms have reviewed fallback enemies")
});

test("build307 encounter groups never duplicate a species or display name",()=>{
 for(let seed=1;seed<=240;seed++){
  const result=rollAttributeEncounterGroup(SPECIES,11,"fire",{count:4,campaign:true,rng:seeded(seed)}),ids=result.species.map(species=>species.id),names=result.species.map(species=>species.name);
  assert.equal(result.species.length,4,`seed ${seed} fills the four-enemy group`);
  assert.equal(new Set(ids).size,ids.length,`seed ${seed} has unique species`);
  assert.equal(new Set(names).size,names.length,`seed ${seed} has unique names`)
 }
});

test("build307 compresses legacy unlock floors into the 100-floor campaign with rarity gates",()=>{
 assert.deepEqual(CAMPAIGN_RARITY_UNLOCK_FLOORS,{N:1,R:1,SR:4,SSR:10,UR:31,LR:61});
 assert.equal(campaignEncounterUnlockFloor(SPECIES.flame_ifrit),44);
 assert.equal(campaignEncounterUnlockFloor(SPECIES.apocalypse_dragon),67);
 assert.equal(campaignEncounterUnlockFloor(SPECIES.ancient_dragon),61,"the LR gate prevents an old low minFloor from unlocking too early");
 assert.equal(eligibleCampaignEncounterSpecies(SPECIES,30).some(species=>species.rarity==="UR"),false,"UR stays locked before floor 31");
 assert.equal(eligibleCampaignEncounterSpecies(SPECIES,60).some(species=>species.rarity==="LR"),false,"LR stays locked before floor 61");
 const atEnd=encounterPoolAudit(SPECIES,100,{campaign:true});
 for(const row of atEnd){
  assert.ok(row.rarities.UR>0,`${row.attribute} has a UR candidate by floor 100`);assert.ok(row.rarities.LR>0,`${row.attribute} has an LR candidate by floor 100`);
  const primary=encounterCandidatesForAttribute(SPECIES,100,row.attribute,{campaign:true}).primary;
  assert.ok(primary.some(species=>species.rarity==="UR"),`${row.attribute} primary family has UR by floor 100`);
  assert.ok(primary.some(species=>species.rarity==="LR"),`${row.attribute} primary family has LR by floor 100`)
 }
});

test("build307 avoids the recent short streak while preserving deterministic selection",()=>{
 let history=normalizeEncounterHistory({}),random=seeded(307),recent=[];
 for(let index=0;index<40;index++){
  const result=rollAttributeEncounterGroup(SPECIES,500,"lightning",{count:1,history,rng:random}),species=result.species[0];
  assert.ok(species);
  assert.ok(!recent.includes(species.id),`encounter ${index} is not in the previous ${ENCOUNTER_RECENT_WINDOW}`);
  recent=[...recent,species.id].slice(-ENCOUNTER_RECENT_WINDOW);history=result.history
 }
 const first=rollAttributeEncounterGroup(SPECIES,500,"poison",{count:4,rng:seeded(919)}).species.map(species=>species.id),second=rollAttributeEncounterGroup(SPECIES,500,"poison",{count:4,rng:seeded(919)}).species.map(species=>species.id);
 assert.deepEqual(first,second,"seeded encounter rotation is reproducible")
});

test("build307 soft pity rises and hard pity guarantees an available high rarity",()=>{
 assert.equal(encounterRarePityChance({missesSinceHighRare:ENCOUNTER_RARE_PITY.softStart-1}),0);
 assert.ok(encounterRarePityChance({missesSinceHighRare:ENCOUNTER_RARE_PITY.softStart})>0);
 assert.equal(encounterRarePityChance({missesSinceHighRare:ENCOUNTER_RARE_PITY.hardLimit}),1);
 const history=normalizeEncounterHistory({missesSinceHighRare:ENCOUNTER_RARE_PITY.hardLimit,totalEncounters:400}),result=rollAttributeEncounterGroup(SPECIES,11,"fire",{count:4,history,campaign:true,rng:seeded(1)}),species=result.species[0];
 assert.ok(species);
 assert.equal(result.pityTriggered,true);
 assert.equal(isHighRarityEncounter(species),true);
 assert.equal(result.history.missesSinceHighRare,0);
 assert.equal(result.history.totalEncounters,401,"a four-enemy group advances pity once per battle, not four times")
});

test("build307 save migration preserves and bounds the long-miss counter",()=>{
 const previousStorage=globalThis.localStorage,values=new Map();
 globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 try{
  const service=new SaveService(),migrated=service.migrate({...structuredClone(service.state),encounterHistory:{version:-8,missesSinceHighRare:999,recentSpeciesIds:["a","a","b","c","d","e","f"],recentSpeciesNames:["A","A","B","C","D","E","F"],totalEncounters:27.8,highRareEncounters:-4}});
  assert.equal(migrated.encounterHistory.missesSinceHighRare,ENCOUNTER_RARE_PITY.hardLimit);
  assert.equal(migrated.encounterHistory.recentSpeciesIds.length,ENCOUNTER_RECENT_WINDOW);
  assert.equal(migrated.encounterHistory.recentSpeciesNames.length,ENCOUNTER_RECENT_WINDOW);
  assert.equal(migrated.encounterHistory.totalEncounters,27);
  assert.equal(migrated.encounterHistory.highRareEncounters,0)
 }finally{if(previousStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=previousStorage}
});
