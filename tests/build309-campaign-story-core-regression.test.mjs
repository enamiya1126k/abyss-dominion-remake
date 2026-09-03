import test from"node:test";
import assert from"node:assert/strict";
import{readFile}from"node:fs/promises";

import{
 CAMPAIGN_STORY_CHARACTERS,
 CAMPAIGN_STORY_MILESTONES,
 CAMPAIGN_STORY_OPENING,
 CAMPAIGN_STORY_OPENING_ID,
 CAMPAIGN_STORY_POLICY,
 CAMPAIGN_STORY_SCENES,
 acknowledgeCampaignStoryScene,
 campaignStorySceneByFloor,
 nextCampaignStoryScene,
 normalizeCampaignStoryState,
 pendingCampaignStoryScenes,
 recordCampaignHeroStoryOutcome,
 resolveCampaignStoryScene
}from"../src/core/CampaignStorySystem.js";

const fresh=()=>({player:{maxFloor:1},campaign100:{floors:{}}});

test("Build309 authors one opening and ten distinct post-boss day scenes",()=>{
 assert.equal(CAMPAIGN_STORY_OPENING.id,CAMPAIGN_STORY_OPENING_ID);
 assert.deepEqual(CAMPAIGN_STORY_MILESTONES,[10,20,30,40,50,60,70,80,90,100]);
 assert.equal(CAMPAIGN_STORY_SCENES.length,10);
 assert.deepEqual(CAMPAIGN_STORY_SCENES.map(scene=>scene.day),[1,2,3,4,5,6,7,8,9,10]);
 assert.equal(new Set(CAMPAIGN_STORY_SCENES.map(scene=>scene.id)).size,10);
 assert.equal(new Set(CAMPAIGN_STORY_SCENES.map(scene=>scene.summary)).size,10);
 for(const story of[CAMPAIGN_STORY_OPENING,...CAMPAIGN_STORY_SCENES]){
  assert.ok(story.backgroundAsset.startsWith("./assets/"));
  assert.ok(story.dialogue.length>=4);
  assert.ok(story.dialogue.every(entry=>typeof entry.text==="string"&&entry.text.length>8));
 }
});

test("Build309 keeps Sairan and Lionel in story data while explicitly excluding Sairan from battle",()=>{
 assert.equal(CAMPAIGN_STORY_CHARACTERS.sairan.storyOnly,true);
 assert.equal(CAMPAIGN_STORY_CHARACTERS.sairan.battleEligible,false);
 assert.equal(CAMPAIGN_STORY_CHARACTERS.lionel.storyOnly,true);
 assert.equal(CAMPAIGN_STORY_POLICY.sairan.finalBattleParticipant,false);
 assert.equal(CAMPAIGN_STORY_POLICY.finalBattle.allowSairan,false);
 assert.deepEqual(CAMPAIGN_STORY_POLICY.finalBattle.heroIds,["myth_enami","myth_yori","myth_hide","myth_rion"]);
 assert.match(CAMPAIGN_STORY_OPENING.dialogue.map(line=>line.text).join(" "),/十日後/);
 assert.match(CAMPAIGN_STORY_OPENING.dialogue.map(line=>line.text).join(" "),/えなみ、より、ひで、りおん/);
});

test("Build309 supplies existing sprite paths and never falls back to emoji in story data",async()=>{
 for(const character of Object.values(CAMPAIGN_STORY_CHARACTERS)){
  assert.equal(character.portrait.type,"monster-sprite");
  assert.match(character.portrait.asset,/^\.\/assets\/monsters\/.+\/idle1\.png\?v=3\.0\.9-build309$/);
 }
 const source=await readFile(new URL("../src/core/CampaignStorySystem.js",import.meta.url),"utf8");
 assert.doesNotMatch(source,/\p{Extended_Pictographic}/u);
});

test("Build309 queues opening separately, then only queues a day after its ten-floor boss is cleared",()=>{
 const state=fresh();
 assert.equal(nextCampaignStoryScene(state,{clearedFloor:9}).id,"opening-prophecy");
 acknowledgeCampaignStoryScene(state,"opening-prophecy");
 assert.equal(nextCampaignStoryScene(state,{clearedFloor:9}),null);
 assert.equal(nextCampaignStoryScene(state,{clearedFloor:10}).id,"road-010");
 assert.deepEqual(pendingCampaignStoryScenes(state,{clearedFloor:31}).map(scene=>scene.id),["road-010","road-020","road-030"]);

 acknowledgeCampaignStoryScene(state,"road-010");
 assert.equal(nextCampaignStoryScene(state,{clearedFloor:31}).id,"road-020");
 state.campaign100.floors[40]={cleared:false,bossDefeated:false};
 state.player.maxFloor=40;
 assert.equal(pendingCampaignStoryScenes(state).some(scene=>scene.id==="road-040"),false,"standing on floor 40 is not proof its boss was defeated");
 state.campaign100.floors[40].bossDefeated=true;
 assert.equal(pendingCampaignStoryScenes(state).some(scene=>scene.id==="road-040"),true);
});

test("Build309 scene acknowledgement is receipt-first safe and idempotent",()=>{
 const state=fresh();
 const first=acknowledgeCampaignStoryScene(state,"opening-prophecy",{seenAt:"2026-09-02T12:00:00.000Z"});
 const duplicate=acknowledgeCampaignStoryScene(state,"opening-prophecy",{seenAt:"2026-09-02T12:00:00.000Z"});
 assert.equal(first.recorded,true);
 assert.equal(duplicate.recorded,false);
 assert.deepEqual(state.campaign100.story309.seenSceneIds,["opening-prophecy"]);
 assert.equal(state.campaign100.story309.openingSeen,true);
 assert.equal(state.campaign100.story309.seenAt["opening-prophecy"],"2026-09-02T12:00:00.000Z");
 assert.deepEqual(acknowledgeCampaignStoryScene(state,"bad-scene"),{recorded:false,reason:"unknown-scene"});
});

test("Build309 migrates old invasion receipts without mistaking day one for the new opening or floor ten scene",()=>{
 const state={player:{maxFloor:95},campaign100:{invasionDaysSeen:[1,2,3,10]}};
 const story=normalizeCampaignStoryState(state);
 assert.equal(story.openingSeen,false,"the authored opening remains available once to legacy players");
 assert.deepEqual(story.seenSceneIds,["road-010","road-020","road-090"]);
 assert.equal(nextCampaignStoryScene(state,{clearedFloor:95}).id,"opening-prophecy");
 acknowledgeCampaignStoryScene(state,"opening-prophecy");
 assert.equal(nextCampaignStoryScene(state,{clearedFloor:95}).id,"road-030");
 const again=normalizeCampaignStoryState(state);
 assert.equal(again.seenSceneIds.filter(id=>id==="road-010").length,1);
});

test("Build309 resolves distinct wound and repel continuity branches from canonical outcomes",()=>{
 const state=fresh();
 const normal=resolveCampaignStoryScene("road-050",state);
 assert.equal(normal.variant,"default");
 assert.equal(normal.dialogue.some(line=>line.continuity),false);

 const wound=recordCampaignHeroStoryOutcome(state,{heroId:"より",outcome:"escaped",hp:70,maxHp:100});
 assert.equal(wound.recorded,true);
 const woundedScene=resolveCampaignStoryScene("road-050",state);
 assert.equal(woundedScene.variant,"wounded");
 assert.equal(woundedScene.focusHeroId,"myth_yori");
 assert.match(woundedScene.dialogue.at(-1).text,/傷|間合い/);

 const earlyWound=resolveCampaignStoryScene("road-020",state).dialogue.at(-1).text;
 const lateWound=resolveCampaignStoryScene("road-090",state).dialogue.at(-1).text;
 assert.notEqual(earlyWound,woundedScene.dialogue.at(-1).text);
 assert.notEqual(lateWound,woundedScene.dialogue.at(-1).text,"continuity lines change as the party approaches the castle");

 recordCampaignHeroStoryOutcome(state,{heroId:"myth_enami",outcome:"repelled",hp:1,maxHp:100,repelled:true});
 const repelledScene=resolveCampaignStoryScene("road-060",state);
 assert.equal(repelledScene.variant,"repelled");
 assert.equal(repelledScene.focusHeroId,"myth_enami");
 assert.equal(repelledScene.dialogue.at(-1).continuity,true);
 assert.match(repelledScene.dialogue.at(-1).text,/全体|仲間/);
});

test("Build309 reads existing external encounter ledgers defensively without corrupting them",()=>{
 const external=[
  {heroId:"ひで",outcome:"escaped",currentHp:55,maxHp:100,at:"first"},
  {speciesId:"myth_hide",outcome:"repelled",currentHp:20,maxHp:100,at:"second"},
  {heroId:"unknown",outcome:"repelled",currentHp:-999,maxHp:0}
 ];
 const state={campaign100:{heroEncounters:external},player:{maxFloor:70}};
 const story=normalizeCampaignStoryState(state);
 assert.equal(story.heroContinuity.myth_hide.encounters,2);
 assert.equal(story.heroContinuity.myth_hide.repelledCount,1);
 assert.equal(story.heroContinuity.myth_hide.damageRatio,.8);
 assert.deepEqual(state.campaign100.heroEncounters,external,"the source encounter ledger stays untouched");
 assert.equal(campaignStorySceneByFloor(70,state).variant,"repelled");
 assert.equal(campaignStorySceneByFloor(75,state),null);
});

test("Build309 gives every road conversation all four established personalities",()=>{
 const expected=new Set(["myth_enami","myth_yori","myth_hide","myth_rion"]);
 for(const scene of CAMPAIGN_STORY_SCENES){
  assert.deepEqual(new Set(scene.dialogue.map(line=>line.speakerId)),expected,`${scene.id} must let all four characters speak`);
 }
 const all=CAMPAIGN_STORY_SCENES.flatMap(scene=>scene.dialogue).map(line=>line.text).join(" ");
 assert.match(all,/酒/,"Yori's drinking and teasing must be authored");
 assert.match(all,/拳/,"Yori's observational physical style must be authored");
 assert.match(all,/術式|魔力/,"Hide's precise magical analysis must be authored");
 assert.match(all,/ザリガニ/);
 assert.match(all,/笑|全体|守りたい/,"Enami's smiling, wide-view restraint must be authored");
 assert.match(all,/利益|交易|交渉|全員/,"Rion's businesslike support and loyalty must be authored");
 assert.match(all,/四拍|休符/);
});
