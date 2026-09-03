import test from"node:test";
import assert from"node:assert/strict";

import{
 CAMPAIGN_HERO_COMBAT_PROFILES,
 CAMPAIGN_HERO_IDS,
 CAMPAIGN_HERO_ENCOUNTER_RULES,
 CAMPAIGN_HERO_ENCOUNTER_SCHEDULE,
 CAMPAIGN_HERO_FIELD_PROFILES,
 CAMPAIGN_HERO_FINAL_LEVEL,
 CAMPAIGN_HERO_RECEIPT_LIMITS,
 CAMPAIGN_HERO_REWIND_DAY,
 CAMPAIGN_HERO_REWIND_FLOOR,
 advanceCampaignRewindFloor,
 activateCampaignHeroEncounter,
 beginCampaignDay9Rewind,
 beginCampaignHeroFieldEncounter,
 campaignFinalHeroEntries,
 campaignHeroEncounterCandidate,
 campaignHeroEndingForResult,
 campaignRemainingHeroIds,
 createCampaignDayNineRewind,
 createCampaignHeroEncounterState,
 normalizeCampaignHeroInvasion,
 normalizeCampaignHeroEncounterState,
 recordCampaignHeroWound,
 scheduledCampaignHeroForFloor,
 settleCampaignHeroEncounter
}from"../src/core/CampaignHeroEncounterSystem.js";

test("Build310 has eight fixed, non-boss ambush windows with final strength from the outset",()=>{
 assert.deepEqual(CAMPAIGN_HERO_IDS,["myth_enami","myth_yori","myth_hide","myth_rion"]);
 assert.deepEqual(CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.map(entry=>entry.floor),[15,25,35,45,55,65,75,85]);
 assert.deepEqual(CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.map(entry=>entry.day),[2,3,4,5,6,7,8,9]);
 assert.deepEqual(CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.map(entry=>entry.heroId),[
  "myth_yori","myth_hide","myth_enami","myth_rion","myth_yori","myth_hide","myth_enami","myth_rion"
 ]);
 assert.ok(CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.every(entry=>entry.fixedLevel===CAMPAIGN_HERO_FINAL_LEVEL&&entry.finalStrength));
 assert.equal(CAMPAIGN_HERO_FINAL_LEVEL,1000);
 assert.deepEqual(CAMPAIGN_HERO_ENCOUNTER_RULES.excludedFloors,[10,20,30,40,50,60,70,80,90,100]);
});

test("main-integration aliases expose schedule, begin, and migration contracts",()=>{
 const root={player:{maxFloor:35},campaign100:{story309:{heroContinuity:{myth_enami:{damageRatio:.3,encounters:1}}}}};
 const invasion=normalizeCampaignHeroInvasion(root);
 assert.equal(invasion.heroes.myth_enami.remainingHpRate,.7);
 assert.equal(invasion.events["hero-ambush-yori-1"].status,"legacy-missed");
 const candidate=scheduledCampaignHeroForFloor(invasion,35);
 assert.equal(candidate.id,"hero-ambush-enami-1");
 const begun=beginCampaignHeroFieldEncounter(invasion,{...candidate,floor:35});
 assert.equal(begun.activated,true);
});

test("all four heroes have bounded step-driven field behavior and authored combat priorities",()=>{
 for(const heroId of["myth_enami","myth_yori","myth_hide","myth_rion"]){
  const field=CAMPAIGN_HERO_FIELD_PROFILES[heroId],combat=CAMPAIGN_HERO_COMBAT_PROFILES[heroId];
  assert.equal(field.heroId,heroId);
  assert.ok(field.maxPursuitPlayerSteps<=24);
  assert.ok(field.maxPortalTransfers<=3);
  assert.equal(field.canBlockPortalLanding,false);
  assert.ok(combat.priorities.length>=5);
 }
 assert.equal(CAMPAIGN_HERO_ENCOUNTER_RULES.moveOnlyOnPlayerStep,true);
 assert.equal(CAMPAIGN_HERO_FIELD_PROFILES.myth_yori.observePlayerSteps,2);
 assert.equal(CAMPAIGN_HERO_FIELD_PROFILES.myth_hide.bonusMoveEveryPlayerSteps,4);
 assert.deepEqual(CAMPAIGN_HERO_FIELD_PROFILES.myth_enami.preferredDistance,{min:6,max:8});
 assert.deepEqual(CAMPAIGN_HERO_FIELD_PROFILES.myth_rion.interceptAheadTiles,{min:3,max:5});
});

test("candidate selection enforces safety gates and never backfills a missed day",()=>{
 const state=createCampaignHeroEncounterState();
 assert.equal(campaignHeroEncounterCandidate(state,{floor:15,visitedSections:2,stepsSinceBattle:6,partyHpRate:.5}).heroId,"myth_yori");
 assert.equal(campaignHeroEncounterCandidate(state,{floor:15,visitedSections:1,stepsSinceBattle:6,partyHpRate:1}),null);
 assert.equal(campaignHeroEncounterCandidate(state,{floor:15,visitedSections:2,stepsSinceBattle:5,partyHpRate:1}),null);
 assert.equal(campaignHeroEncounterCandidate(state,{floor:15,visitedSections:2,stepsSinceBattle:6,partyHpRate:.49}),null);
 assert.equal(campaignHeroEncounterCandidate(state,{floor:15,online:true}),null);
 assert.equal(campaignHeroEncounterCandidate(state,{floor:20}),null);
 assert.equal(campaignHeroEncounterCandidate(state,{floor:25}).heroId,"myth_hide","Yori is not backfilled outside day two");
});

test("legacy migration marks past windows missed instead of ambushing a returning player in a backlog",()=>{
 const migrated=normalizeCampaignHeroEncounterState(null,{migrationHighestFloor:56});
 assert.deepEqual(
  CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.slice(0,4).map(entry=>migrated.events[entry.id].status),
  ["legacy-missed","legacy-missed","legacy-missed","legacy-missed"]
 );
 assert.equal(migrated.events[CAMPAIGN_HERO_ENCOUNTER_SCHEDULE[4].id].status,"scheduled");
 const again=normalizeCampaignHeroEncounterState(migrated,{migrationHighestFloor:100});
 assert.equal(again.events[CAMPAIGN_HERO_ENCOUNTER_SCHEDULE[4].id].status,"scheduled","migration never re-runs on an authored ledger");
});

test("normalization keeps nullable fields null and is pure and idempotent",()=>{
 const fresh=createCampaignHeroEncounterState(),snapshot=structuredClone(fresh);
 assert.equal(fresh.legacyMigrationApplied,false,"a missing migration floor is not floor one");
 for(const event of Object.values(fresh.events)){
  assert.equal(event.activatedFloor,null);
  assert.equal(event.resolvedFloor,null);
 }

 const once=normalizeCampaignHeroEncounterState(fresh,{migrationHighestFloor:null});
 const twice=normalizeCampaignHeroEncounterState(once,{migrationHighestFloor:"   "});
 assert.deepEqual(fresh,snapshot,"normalization never mutates its source ledger");
 assert.deepEqual(once,fresh,"normalizing a canonical ledger is a no-op");
 assert.deepEqual(twice,once,"normalization is idempotent across blank optional numbers");
});

test("heroes-only Build310 placeholders migrate past windows while preserving partial continuity",()=>{
 const root={
  player:{maxFloor:100},
  campaign100:{heroEncounters310:{
   heroes:{
    myth_yori:{remainingHpRate:.37,encounters:2,lastSeenFloor:55},
    myth_hide:{remainingHpRate:null,lowestHpRate:"",encounters:1}
   }
  }}
 },snapshot=structuredClone(root),migrated=normalizeCampaignHeroInvasion(root);

 assert.deepEqual(root,snapshot,"migration is pure");
 assert.equal(migrated.heroes.myth_yori.remainingHpRate,.37,"partial wound continuity is retained");
 assert.equal(migrated.heroes.myth_yori.lastSeenFloor,55);
 assert.equal(migrated.heroes.myth_hide.remainingHpRate,1,"null and blank HP do not create a false defeat");
 assert.equal(migrated.heroes.myth_hide.defeated,false);
 assert.ok(CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.every(entry=>migrated.events[entry.id].status==="legacy-missed"));
 assert.equal(migrated.legacyMigrationApplied,true);
 assert.deepEqual(normalizeCampaignHeroEncounterState(migrated,{migrationHighestFloor:100}),migrated,"a migrated canonical ledger stays stable");
});

test("authored-ledger detection rejects invalid placeholders but accepts a recognized event",()=>{
 const invalid=normalizeCampaignHeroInvasion({
  player:{maxFloor:100},
  campaign100:{heroEncounters310:{version:null,events:{unknown:{status:"resolved"}},legacyMigrationApplied:false}}
 });
 assert.ok(CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.every(entry=>invalid.events[entry.id].status==="legacy-missed"));

 const eventId="hero-ambush-yori-1",authored=normalizeCampaignHeroInvasion({
  player:{maxFloor:100},
  campaign100:{heroEncounters310:{events:{[eventId]:{status:"resolved",outcome:"escaped",resolvedFloor:15}}}}
 });
 assert.equal(authored.events[eventId].status,"resolved");
 assert.equal(authored.events[eventId].resolvedFloor,15);
 assert.equal(authored.events["hero-ambush-hide-1"].status,"scheduled","a recognized authored event prevents destructive backlog migration");
 assert.equal(authored.legacyMigrationApplied,false);
});

test("normalization imports old story wounds monotonically without mutating input",()=>{
 const raw={heroes:{myth_yori:{remainingHpRate:.8,encounters:1}},events:{}};
 const snapshot=structuredClone(raw);
 const normalized=normalizeCampaignHeroEncounterState(raw,{heroContinuity:{
  yori:{damageRatio:.45,encounters:2},
  hide:{currentHp:0,maxHp:100,defeated:true}
 }});
 assert.deepEqual(raw,snapshot);
 assert.equal(normalized.heroes.myth_yori.remainingHpRate,.55);
 assert.equal(normalized.heroes.myth_yori.encounters,2);
 assert.equal(normalized.heroes.myth_hide.defeated,true);
 assert.equal(normalized.events["hero-ambush-hide-1"].status,"skipped-defeated");
});

test("wound checkpoints only lower HP and accept an idempotent receipt",()=>{
 const fresh=createCampaignHeroEncounterState(),freshSnapshot=structuredClone(fresh);
 const missing=recordCampaignHeroWound(fresh,{heroId:"myth_yori",woundId:"blank-hp",hpRate:" "});
 assert.equal(missing.recorded,false);
 assert.equal(missing.reason,"missing-hp");
 assert.equal(missing.state.heroes.myth_yori.defeated,false,"blank HP is not zero HP");
 const first=recordCampaignHeroWound(fresh,{heroId:"より",woundId:"battle-yori:round-4",hp:62,maxHp:100});
 assert.deepEqual(fresh,freshSnapshot,"pure transition does not mutate its input");
 assert.equal(first.recorded,true);
 assert.equal(first.state.heroes.myth_yori.remainingHpRate,.62);
 const healed=recordCampaignHeroWound(first.state,{heroId:"myth_yori",woundId:"battle-yori:round-5",hpRate:.9});
 assert.equal(healed.state.heroes.myth_yori.remainingHpRate,.62,"healing never erases a permanent wound");
 const duplicate=recordCampaignHeroWound(healed.state,{heroId:"myth_yori",woundId:"battle-yori:round-5",hpRate:.1});
 assert.equal(duplicate.duplicate,true);
 assert.equal(duplicate.state.heroes.myth_yori.remainingHpRate,.62);
});

test("normalization bounds receipts and repairs corrupt active encounter state",()=>{
 const source=createCampaignHeroEncounterState();
 source.heroes.myth_yori.lastSeenFloor=null;
 source.events["hero-ambush-yori-1"].status="active";
 source.events["hero-ambush-hide-1"].status="active";
 source.activeEncounterId="hero-ambush-hide-1";
 source.processedWoundIds=Array.from({length:CAMPAIGN_HERO_RECEIPT_LIMITS.wounds+20},(_,index)=>`wound-${index}`);
 const normalized=normalizeCampaignHeroEncounterState(source);

 assert.equal(normalized.heroes.myth_yori.lastSeenFloor,null);
 assert.equal(normalized.activeEncounterId,"hero-ambush-hide-1");
 assert.equal(normalized.events["hero-ambush-hide-1"].status,"active");
 assert.equal(normalized.events["hero-ambush-yori-1"].status,"armed");
 assert.equal(normalized.processedWoundIds.length,CAMPAIGN_HERO_RECEIPT_LIMITS.wounds);
 assert.equal(normalized.processedWoundIds.at(-1),`wound-${CAMPAIGN_HERO_RECEIPT_LIMITS.wounds+19}`);
});

test("encounter settlement is pure, idempotent, and a defeated hero cannot harass again",()=>{
 const base=createCampaignHeroEncounterState(),activated=activateCampaignHeroEncounter(base,{encounterId:"hero-ambush-yori-1",floor:15});
 assert.equal(activated.activated,true);
 assert.equal(base.events["hero-ambush-yori-1"].status,"scheduled");
 const settled=settleCampaignHeroEncounter(activated.state,{
  encounterId:"hero-ambush-yori-1",resultId:"result-yori-1",outcome:"player-win",currentHp:0,maxHp:100,floor:15
 });
 assert.equal(settled.recorded,true);
 assert.equal(settled.defeatedNow,true);
 assert.equal(settled.state.heroes.myth_yori.encounters,1);
 assert.equal(settled.state.heroes.myth_yori.remainingHpRate,0);
 assert.equal(settled.state.events["hero-ambush-yori-2"].status,"skipped-defeated");
 const duplicate=settleCampaignHeroEncounter(settled.state,{
  encounterId:"hero-ambush-yori-1",resultId:"result-yori-1",outcome:"player-win",currentHp:0,maxHp:100
 });
 assert.equal(duplicate.duplicate,true);
 assert.equal(duplicate.state.heroes.myth_yori.encounters,1);
});

test("escape resolves one authored event without punishing the party or raising hero HP",()=>{
 const activated=activateCampaignHeroEncounter(createCampaignHeroEncounterState(),{encounterId:"hero-ambush-hide-1",floor:25});
 const result=settleCampaignHeroEncounter(activated.state,{
  encounterId:"hero-ambush-hide-1",resultId:"result-hide-escape",outcome:"escaped",hpRate:.72,floor:25
 });
 assert.equal(result.state.heroes.myth_hide.defeated,false);
 assert.equal(result.state.heroes.myth_hide.remainingHpRate,.72);
 assert.equal(result.state.events["hero-ambush-hide-1"].status,"resolved");
 assert.equal(campaignHeroEncounterCandidate(result.state,{floor:26}),null);
 assert.equal(campaignHeroEncounterCandidate(result.state,{floor:65}).heroId,"myth_hide");
});

test("final roster preserves canonical order and each surviving hero's permanent HP",()=>{
 let state=createCampaignHeroEncounterState();
 state=recordCampaignHeroWound(state,{heroId:"myth_yori",woundId:"yori-wound",hpRate:.4}).state;
 state=settleCampaignHeroEncounter(state,{encounterId:"hero-ambush-hide-1",resultId:"hide-down",outcome:"repelled",hpRate:0}).state;
 assert.deepEqual(campaignRemainingHeroIds(state),["myth_enami","myth_yori","myth_rion"]);
 assert.deepEqual(campaignFinalHeroEntries(state).map(entry=>[entry.heroId,entry.carryHpRate]),[
  ["myth_enami",1],["myth_yori",.4],["myth_rion",1]
 ]);
 assert.ok(campaignFinalHeroEntries(state).every(entry=>entry.level===1000&&entry.fixedTrialScaling));
});

test("the final result has exactly the four requested endings",()=>{
 const fresh=createCampaignHeroEncounterState();
 assert.equal(campaignHeroEndingForResult(fresh,{partyWon:true,partySurvivors:4}),"complete");
 assert.equal(campaignHeroEndingForResult(fresh,{partyWon:true,partySurvivors:1}),"narrow");
 assert.equal(campaignHeroEndingForResult(fresh,{partyWon:false,partySurvivors:0}),"defeat");
 let allDown=fresh;
 for(const[heroId,encounterId]of[["myth_yori","hero-ambush-yori-1"],["myth_hide","hero-ambush-hide-1"],["myth_enami","hero-ambush-enami-1"],["myth_rion","hero-ambush-rion-1"]]){
  allDown=settleCampaignHeroEncounter(allDown,{encounterId,resultId:`${heroId}-down`,heroId,outcome:"repelled",hpRate:0}).state;
 }
 assert.equal(campaignHeroEndingForResult(allDown,{partyWon:false,partySurvivors:0}),"all-preempted");
});

test("final defeat creates one idempotent day-nine rewind while preserving wounds and encounter receipts",()=>{
 let state=createCampaignHeroEncounterState();
 state=recordCampaignHeroWound(state,{heroId:"myth_rion",woundId:"rion-before-final",hpRate:.33}).state;
 state=settleCampaignHeroEncounter(state,{encounterId:"hero-ambush-yori-1",resultId:"yori-before-final",outcome:"escaped",hpRate:.6}).state;
 const snapshot=structuredClone(state),rewound=createCampaignDayNineRewind(state,{resultId:"final-loss-1"});
 assert.deepEqual(state,snapshot);
 assert.equal(rewound.recorded,true);
 assert.equal(rewound.state.rewind.active,true);
 assert.equal(rewound.state.rewind.targetDay,CAMPAIGN_HERO_REWIND_DAY);
 assert.equal(rewound.state.rewind.targetFloor,CAMPAIGN_HERO_REWIND_FLOOR);
 assert.equal(rewound.transition.replayFloors.from,81);
 assert.equal(rewound.state.heroes.myth_rion.remainingHpRate,.33);
 assert.equal(rewound.state.events["hero-ambush-yori-1"].status,"resolved");
 const duplicate=createCampaignDayNineRewind(rewound.state,{resultId:"final-loss-1"});
 assert.equal(duplicate.duplicate,true);
 assert.equal(duplicate.state.rewind.count,1);
});

test("rewind advances from floor 81 through 100 and only then reopens the final arena",()=>{
 const begun=beginCampaignDay9Rewind(createCampaignHeroEncounterState(),{resultId:"final-loss-alias"});
 assert.equal(begun.state.rewind.currentFloor,81);
 const next=advanceCampaignRewindFloor(begun.state,81);
 assert.equal(next.currentFloor,82);
 assert.equal(next.state.rewind.active,true);
 const complete=advanceCampaignRewindFloor(next.state,{clearedFloor:100});
 assert.equal(complete.completed,true);
 assert.equal(complete.state.rewind.active,false);
 assert.equal(complete.state.finalArena.unlocked,true);
});
