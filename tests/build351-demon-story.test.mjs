import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as S from '../src/core/CampaignStorySystem.js';
import * as H from '../src/core/CampaignHeroEncounterSystem.js';
import * as A from '../src/core/CampaignStoryArchiveSystem.js';

const ids=['myth_enami','myth_yori','myth_hide','myth_rion'];
function stateFor(mask=15){
 const ledger=H.createCampaignHeroEncounterState();
 ids.forEach((id,i)=>Object.assign(ledger.heroes[id],{defeated:!(mask&(1<<i)),remainingHpRate:mask&(1<<i)?1:0}));
 return {player:{currentFloor:100,maxFloor:100},campaign100:{heroEncounters310:ledger}};
}
function royal(scene){
 assert.deepEqual(scene.characters.map(c=>c.id).sort(),['lionel','sairan']);
 assert.ok(scene.dialogue.every(l=>!l.speakerId||['lionel','sairan'].includes(l.speakerId)));
 assert.equal(scene.routeHidden,true);
 assert.ok(scene.dialogue.length>=12);
}
function readAll(state,clearedFloor){
 const result=[];
 for(let i=0;i<30;i++){
  const scene=S.nextCampaignStoryScene(state,{clearedFloor});if(!scene)return result;
  result.push(scene);assert.equal(S.acknowledgeCampaignStoryScene(state,scene.id).recorded,true);
 }
 throw new Error('story queue did not drain');
}
test('five demon chapters join the ordered floor queue; endings are never queued early',()=>{
 const state=stateFor();
 const first=readAll(state,39);assert.deepEqual(first.map(s=>s.id),['opening-prophecy','road-010','road-020','demon-020','road-030']);
 const rest=readAll(state,100),all=[...first,...rest];
 assert.equal(all.length,16);assert.equal(all.filter(s=>s.storyTrack==='demon').length,5);
 assert.ok(!all.some(s=>s.kind==='ending'));
 for(const s of all.filter(s=>s.storyTrack==='demon'))royal(s);
 assert.equal(S.nextCampaignStoryScene(JSON.parse(JSON.stringify(state)),{clearedFloor:100}),null);
});
test('existing completed hero chapters retain their receipts and expose only the five new councils',()=>{
 const state=stateFor();
 for(const d of [S.CAMPAIGN_STORY_OPENING,...S.CAMPAIGN_STORY_SCENES])S.acknowledgeCampaignStoryScene(state,d.id);
 const chapters=readAll(state,100);assert.deepEqual(chapters.map(s=>s.id),S.CAMPAIGN_DEMON_STORY_SCENES.map(s=>s.id));
 assert.equal(new Set(state.campaign100.story309.seenSceneIds).size,16);
});
test('late councils honor all 16 survivor combinations, including heroes away from camp',()=>{
 for(let mask=0;mask<16;mask++){
  const state=stateFor(mask),count=ids.filter((_,i)=>mask&(1<<i)).length;
  const away=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(d=>state.campaign100.heroEncounters310.heroes[d.heroId].defeated===false);
  if(away){const l=state.campaign100.heroEncounters310;l.activeEncounterId=away.id;l.events[away.id].status='active';}
  for(const floor of [80,100]){
   const s=S.resolveCampaignStoryScene(`demon-${floor.toString().padStart(3,'0')}`,state);royal(s);
   const text=s.dialogue.map(l=>l.text).join('\n');assert.ok(text.includes(`現時点で残る勇者は${count}人`));
   if(count===0)assert.doesNotMatch(text,/誰も撃退されていません/);
  }
 }
});
test('demon archive replays the saved past, without changing current roster or save',()=>{
 const state=stateFor(),scene=S.resolveCampaignStoryScene('demon-080',state);
 S.acknowledgeCampaignStoryScene(state,scene.id);A.recordCampaignStoryArchiveScene(state,scene);
 state.campaign100.heroEncounters310=stateFor(1).campaign100.heroEncounters310;
 state.campaign100.reincarnation319={cycle:1};
 const before=JSON.stringify(state),category=A.createCampaignStoryArchiveModel(state).categories.find(c=>c.id==='demon');
 const replay=category.entries.find(e=>e.id==='archive-demon-080').scenes[0];royal(replay);
 assert.ok(replay.dialogue.some(l=>l.text.includes('残る勇者は4人')));assert.equal(JSON.stringify(state),before);
});
test('four epilogues unlock by the actual recorded ending and preserve the all-preempted distinction',()=>{
 for(const key of ['complete','narrow','defeat','all-preempted']){
  const ending=key==='all-preempted'?'complete':key,variant=key==='all-preempted'?key:null;
  const scene=S.campaignEndingStoryScene(ending,{variant});royal(scene);assert.equal(scene.id,`ending-${key}`);
  const state={campaign100:{reincarnation319:{history:[{ending,variant,cycle:0,resultId:'test'}]}}};
  const entries=A.createCampaignStoryArchiveModel(state).categories.find(c=>c.id==='demon').entries.filter(e=>e.id.startsWith('archive-ending-'));
  assert.deepEqual(entries.filter(e=>e.available).map(e=>e.id),[`archive-ending-${key}`]);
 }
 assert.equal(S.campaignEndingStoryScene('unknown'),null);
 assert.ok(S.campaignEndingStoryScene('defeat').dialogue.some(l=>l.text.includes('敗因を報告')));
 assert.ok(S.campaignEndingStoryScene('complete',{variant:'all-preempted'}).dialogue.some(l=>l.text.includes('王室で交わされた刃は一本もない')));
});
test('actual browser queue drains added chapters at the final gate and runs the preparation callback',()=>{
 const state=stateFor();for(const d of [S.CAMPAIGN_STORY_OPENING,...S.CAMPAIGN_STORY_SCENES])S.acknowledgeCampaignStoryScene(state,d.id);
 const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),start=main.indexOf('function queueCampaignStoryScenes('),end=main.indexOf('\nfunction bindExplore(',start),timers=[],shown=[];
 const sandbox={campaignStoryRequestedFloor:null,campaignStoryCompletionCallback:null,campaignStoryPresenting:false,campaignStoryQueueTimer:null,battle:null,screen:'campaignFinalFloor',save:{state},document:{querySelector:()=>null},setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout:()=>{},nextCampaignStoryScene:S.nextCampaignStoryScene,nextCampaignHeroBranchStoryScene:()=>null,campaignHeroLedger:()=>state.campaign100.heroEncounters310,scheduleContextGuide:()=>{},showCampaignStoryScene:scene=>{shown.push(scene.id);S.acknowledgeCampaignStoryScene(state,scene.id);sandbox.queueCampaignStoryScenes({delay:0});return true}};
 vm.createContext(sandbox);vm.runInContext(main.slice(start,end),sandbox);
 let completed=0;sandbox.queueCampaignStoryScenes({clearedFloor:100,delay:0,onComplete:()=>completed++});
 for(let i=0;timers.length&&i<30;i++)timers.shift()();
 assert.equal(timers.length,0);assert.equal(completed,1);assert.deepEqual(shown,S.CAMPAIGN_DEMON_STORY_SCENES.map(s=>s.id));
});
test('default queue invocation infers progress instead of replacing it with floor zero',()=>{
 const state=stateFor();state.player.maxFloor=41;
 const pending=S.pendingCampaignStoryScenes(state,{clearedFloor:null,includeOpening:false});
 assert.ok(pending.some(s=>s.id==='demon-040'));assert.ok(!pending.some(s=>s.id==='demon-060'));
});
