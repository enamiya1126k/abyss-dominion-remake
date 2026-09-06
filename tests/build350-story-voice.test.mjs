import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/core/CampaignStorySystem.js';
import * as H from '../src/core/CampaignHeroEncounterSystem.js';
import * as B from '../src/core/CampaignHeroBranchStorySystem.js';
import * as A from '../src/core/CampaignStoryArchiveSystem.js';
import {finalAudienceDialogue} from '../src/ui/screens/CampaignFinalFloorScreen.js';

const ids=['myth_enami','myth_yori','myth_hide','myth_rion'];
function ledger(mask=15){
 const value=H.createCampaignHeroEncounterState();
 for(const [i,id] of ids.entries())Object.assign(value.heroes[id],{defeated:!(mask&(1<<i)),remainingHpRate:mask&(1<<i)?.65:0});
 return value;
}
function voice(scene){
 for(const {speakerId,text} of scene.dialogue){
  assert.doesNotMatch(text,/へん|ひん|せや|ほな|やねん/,scene.id+': '+text);
  if(speakerId==='myth_rion')assert.doesNotMatch(text,/僕|俺/,scene.id+': '+text);
  if(speakerId==='myth_enami')assert.doesNotMatch(text,/オレ|俺/,scene.id+': '+text);
 }
}
test('personal facts stay available as background without requiring every fact in the journey',()=>{
 const profiles=S.CAMPAIGN_HERO_DIALOGUE_PROFILES;
 assert.match(profiles.myth_yori.background,/テトラポッド/);
 assert.match(profiles.myth_hide.background,/狩猟免許/);
 assert.match(profiles.myth_rion.background,/理学療法士/);
 assert.match(profiles.myth_enami.background,/食品衛生管理者/);
 assert.equal(profiles.myth_rion.firstPerson,'オレ');
 assert.equal(profiles.myth_enami.firstPerson,'僕');
 // The supplied facts are optional writing material, not mandatory scene content.
});
test('rendered voices stay consistent through wounded, missing-party and outcome branches',()=>{
 for(let mask=0;mask<16;mask++){
  for(const d of S.CAMPAIGN_STORY_SCENES)voice(S.resolveCampaignStoryScene(d.id,{campaign100:{heroEncounters310:ledger(mask)}}));
  for(const d of H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE){
   if(!(mask&(1<<ids.indexOf(d.heroId))))continue;
   voice(B.campaignHeroBranchStorySceneById(ledger(mask),`branch-prelude-${d.id}`));
   for(const outcome of B.CAMPAIGN_HERO_BRANCH_OUTCOMES){
    const queued=B.queueCampaignHeroAftermathStories(ledger(mask),{encounterId:d.id,outcome,floor:d.floor,heroHpRate:outcome==='repelled'?0:.65}).state;
    for(const part of ['party','result','report'])voice(B.campaignHeroBranchStorySceneById(queued,`branch-${part}-${d.id}-${outcome}`));
   }
  }
 }
});
test('final audience and encounter voices use the same language for all surviving casts',()=>{
 for(let mask=0;mask<16;mask++){
  const heroes=ids.map((id,i)=>({id,name:S.CAMPAIGN_STORY_CHARACTERS[id].name,defeated:!(mask&(1<<i)),remainingHpRate:mask&(1<<i)?1:0}));
  const dialogue=finalAudienceDialogue({heroes,party:[{name:'魔王'}]}).map(l=>({speakerId:heroes.find(h=>h.name===l.speaker)?.id,text:l.text}));
  voice({id:'final-'+mask,dialogue});
 }
 for(const id of ids)for(const moment of ['spotted','contact','repelled','retreated','heroVictory','finalPlayerWin','finalHeroesWin'])for(const cycle of [1,2])voice({id:moment,dialogue:[{speakerId:id,text:S.campaignHeroVoiceLine(id,moment,{cycle})}]});
});

const replay=state=>A.createCampaignStoryArchiveModel(state).categories.flatMap(c=>c.entries.flatMap(e=>e.scenes??e.variants.flatMap(v=>v.scenes)));
test('Build340+ snapshots receive new dialogue while preserving the historical cast and save',()=>{
 const old=S.resolveCampaignStoryScene('road-020',{});delete old.storyTextVersion;
 old.dialogue=[{speakerId:'myth_rion',text:'僕の話、まだ聞いてへんの？'}];
 const state={campaign100:{}};A.recordCampaignStoryArchiveScene(state,old);
 state.campaign100.heroEncounters310=ledger(1);state.campaign100.reincarnation319={cycle:1};
 const before=JSON.stringify(state),scene=replay(state).find(s=>s.id===old.id);
 assert.deepEqual(scene.characters.map(c=>c.id).sort(),[...ids].sort());voice(scene);
 assert.ok(scene.dialogue.some(l=>l.text.includes('テトラポッド')));
 assert.equal(JSON.stringify(state),before);
});
test('revised archived escapes preserve explicit combat and fresh/prior wounds across cycles',()=>{
 const d=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE[0];
 for(const [battled,fresh,prior]of [[false,0,30],[true,20,30]]){
  const value=ledger();Object.assign(value.events[d.id],{battleKnown348:true,battled348:battled,newHurtPercent348:fresh,priorHurtPercent348:prior});
  const queued=B.queueCampaignHeroAftermathStories(value,{encounterId:d.id,outcome:'escaped',floor:d.floor,heroHpRate:1-(fresh+prior)/100}).state;
  const state={campaign100:{}};
  for(const part of ['result','report','party']){
   const scene=B.campaignHeroBranchStorySceneById(queued,`branch-${part}-${d.id}-escaped`);delete scene.storyTextVersion;
   A.recordCampaignStoryArchiveScene(state,scene);
  }
  state.campaign100.heroEncounters310=ledger(1);state.campaign100.reincarnation319={cycle:1};
  const before=JSON.stringify(state),scenes=replay(state),text=scenes.flatMap(s=>s.dialogue.map(l=>l.text)).join('\n');
  if(battled){assert.match(text,/交戦した後、撤退/);assert.match(text,/新たに20%/);assert.match(text,/以前の30%/);}
  else{assert.match(text,/攻撃は加えていません/);assert.match(text,/以前から残る30%/);assert.doesNotMatch(text,/新たに30%/);}
  scenes.forEach(voice);assert.equal(JSON.stringify(state),before);
 }
});
