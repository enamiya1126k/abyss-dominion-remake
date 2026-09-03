import test from"node:test";
import assert from"node:assert/strict";
import{campaignEndingForResult,normalizeCampaignState}from"../src/core/Campaign100System.js";

test("Build309 derives the three endings only from the current four-monster party result",()=>{
 assert.equal(campaignEndingForResult({won:false,partySurvivors:4}),"defeat");
 assert.equal(campaignEndingForResult({partyWon:false,sairanWon:true}),"defeat","the retired Sairan win flag cannot create an ending");
 assert.equal(campaignEndingForResult({won:true,partySurvivors:4,partySize:4}),"complete");
 for(const survivors of[1,2,3])assert.equal(campaignEndingForResult({won:true,partySurvivors:survivors,partySize:4}),"comeback");
 assert.equal(campaignEndingForResult({won:true,partySurvivors:0,partySize:4}),"defeat");
 assert.equal(campaignEndingForResult({partyWon:true}),"complete","the old partyWon call remains a full-party victory when no survivor count was recorded");
});

test("Build309 campaign normalization only permits the party stage and removes Sairan battle carry state",()=>{
 const state={campaign100:{version:5,finalStage:"sairan",finalSessionPending:"sairan",sairanMonsterId:"temporary-king",heroCarry:[{speciesId:"myth_enami",hp:8}]}};
 const campaign=normalizeCampaignState(state);
 assert.equal(campaign.finalStage,null);
 assert.equal(Object.hasOwn(campaign,"finalSessionPending"),false);
 assert.equal(Object.hasOwn(campaign,"sairanMonsterId"),false);
 assert.equal(Object.hasOwn(campaign,"heroCarry"),false);
 campaign.finalStage="party";campaign.finalSessionPending="party";
 const party=normalizeCampaignState(state);
 assert.equal(party.finalStage,"party");
 assert.equal(party.finalSessionPending,"party");
});
