// Run: node --experimental-vm-modules --test tests/build340-story-continuity.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ids=['myth_enami','myth_yori','myth_hide','myth_rion'];
const context=vm.createContext({console,Date,Math,Number,Object,Array,Set,Map,String,Boolean,JSON,structuredClone});
const modules={};
modules.Campaign100System=new vm.SourceTextModule(`export const CAMPAIGN_MAX_FLOOR=100;export const HERO_PARTY_IDS=${JSON.stringify(ids)};`,{context});
await modules.Campaign100System.link(()=>{});await modules.Campaign100System.evaluate();
for(const name of ['CampaignHeroPursuitSystem','CampaignHeroEncounterSystem','CampaignStorySystem','CampaignHeroBranchStorySystem','CampaignStoryArchiveSystem']){
 const module=new vm.SourceTextModule(fs.readFileSync(new URL('../src/core/'+name+'.js',import.meta.url),'utf8'),{context});
 await module.link(spec=>{const key=spec.split('/').at(-1).split('.js')[0];if(!modules[key])throw Error(spec);return modules[key]});
 await module.evaluate();modules[name]=module;
}
const H=modules.CampaignHeroEncounterSystem.namespace,S=modules.CampaignStorySystem.namespace,B=modules.CampaignHeroBranchStorySystem.namespace,A=modules.CampaignStoryArchiveSystem.namespace;
const alive=mask=>ids.filter((_,i)=>mask&(1<<i));
function ledgerFor(mask=15){const ledger=H.createCampaignHeroEncounterState();ids.forEach((id,i)=>Object.assign(ledger.heroes[id],{defeated:!(mask&(1<<i)),remainingHpRate:mask&(1<<i)?1:0}));return ledger}
function check(scene,expected){
 assert.deepEqual(Array.from(scene.characters,c=>c.id).sort(),[...expected].sort(),scene.id);
 assert.equal(new Set(scene.characters.map(c=>c.id)).size,expected.length);
 for(const line of scene.dialogue){assert.ok(!line.speakerId||expected.includes(line.speakerId),`${scene.id}: absent speaker ${line.speakerId}`);assert.ok(line.text?.trim(),scene.id)}
}
const archiveScenes=state=>A.createCampaignStoryArchiveModel(state).categories.flatMap(c=>c.entries.flatMap(e=>e.scenes??e.variants.flatMap(v=>v.scenes)));

test('10 chapters × 16 survival combinations; full party has richer conversation',()=>{
 for(const definition of S.CAMPAIGN_STORY_SCENES)for(let mask=0;mask<16;mask++){
  const scene=S.resolveCampaignStoryScene(definition.id,{campaign100:{heroEncounters310:ledgerFor(mask)}});check(scene,alive(mask));
  if(mask===15){assert.ok(scene.dialogue.length>=18,scene.id);for(const id of ids)assert.ok(scene.dialogue.filter(l=>l.speakerId===id).length>=3)}
 }
});
test('eight departures retain silent participants; defeated and away heroes are absent',()=>{
 for(const d of H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE)for(let mask=0;mask<16;mask++){
  if(!alive(mask).includes(d.heroId))continue;
  const ledger=ledgerFor(mask),scene=B.campaignHeroBranchStorySceneById(ledger,`branch-prelude-${d.id}`);check(scene,alive(mask));
  if(mask===15)assert.ok(scene.dialogue.length>=14,d.id);
 }
 const ledger=ledgerFor(),away=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE[0];
 ledger.activeEncounterId=away.id;ledger.events[away.id].status='active';
 check(S.resolveCampaignStoryScene('road-020',{campaign100:{heroEncounters310:ledger}}),ids.filter(id=>id!==away.heroId));
});
test('384 aftermath combinations keep return/death and wounds consistent',()=>{
 for(const d of H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE)for(const outcome of B.CAMPAIGN_HERO_BRANCH_OUTCOMES)for(let mask=0;mask<16;mask++){
  if(!alive(mask).includes(d.heroId))continue;
  for(const health of [1,.45]){
   const rate=outcome==='repelled'?0:health,queued=B.queueCampaignHeroAftermathStories(ledgerFor(mask),{encounterId:d.id,outcome,floor:d.floor,heroHpRate:rate}).state;
   const expected=alive(mask).filter(id=>outcome!=='repelled'||id!==d.heroId);
   const scene=B.campaignHeroBranchStorySceneById(queued,`branch-party-${d.id}-${outcome}`);check(scene,expected);
   if(expected.length===4)assert.ok(scene.dialogue.length>=12);
   const result=B.campaignHeroBranchStorySceneById(queued,`branch-result-${d.id}-${outcome}`);check(result,[d.heroId]);
   assert.ok(!result.dialogue.some(l=>l.text==='この結果は、次へ持ち越す。'),'hero-specific result is selected');
   check(B.campaignHeroBranchStorySceneById(queued,`branch-report-${d.id}-${outcome}`),['lionel','sairan']);
  }
 }
});
test('queued scenes preserve encounter-time party across later defeats and serialization',()=>{
 const d=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE[0];
 let ledger=B.queueCampaignHeroAftermathStories(ledgerFor(),{encounterId:d.id,outcome:'escaped',floor:d.floor,heroHpRate:1}).state;
 Object.assign(ledger.heroes.myth_rion,{defeated:true,remainingHpRate:0});
 ledger=B.normalizeCampaignHeroBranchStoryState(JSON.parse(JSON.stringify(ledger)));
 check(B.campaignHeroBranchStorySceneById(ledger,`branch-party-${d.id}-escaped`),ids);
});
test('wound reactions never resurrect a defeated or absent speaker',()=>{
 for(let mask=1;mask<16;mask++)for(const id of alive(mask)){
  const ledger=ledgerFor(mask);ledger.heroes[id].remainingHpRate=.3;
  for(const d of S.CAMPAIGN_STORY_SCENES)check(S.resolveCampaignStoryScene(d.id,{campaign100:{heroEncounters310:ledger}}),alive(mask));
 }
});
test('legacy Hide replay restores Rion and does not adopt later deaths or mutate save',()=>{
 const d=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(d=>d.heroId==='myth_hide');
 const old=B.campaignHeroBranchStorySceneById(ledgerFor(),`branch-prelude-${d.id}`);
 delete old.castVersion;delete old.heroStoryState;old.characters=old.characters.filter(c=>c.id!=='myth_rion');
 const state={campaign100:{heroEncounters310:ledgerFor(7)}};
 A.recordCampaignStoryArchiveScene(state,old);
 const before=JSON.stringify(state),scene=archiveScenes(state).find(s=>s.id===old.id);check(scene,ids);assert.ok(scene.dialogue.length>=14);
 assert.equal(JSON.stringify(state),before);
 // A new reincarnation must not change this historical scene either.
 state.campaign100.reincarnation319={cycle:1};state.campaign100.heroEncounters310=H.createCampaignHeroEncounterState({storyCycle:1});
 check(archiveScenes(state).find(s=>s.id===old.id),ids);
});
test('new snapshots preserve a three-person historical cast after a reset',()=>{
 const scene=S.resolveCampaignStoryScene('road-030',{campaign100:{heroEncounters310:ledgerFor(7)}}),state={campaign100:{}};
 A.recordCampaignStoryArchiveScene(state,scene);state.campaign100.heroEncounters310=ledgerFor();
 check(archiveScenes(state).find(s=>s.id===scene.id),ids.slice(0,3));
});
test('legacy receipts reconstruct departure before its own later defeat',()=>{
 const d=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE[0];let ledger=ledgerFor();
 ledger=B.acknowledgeCampaignHeroBranchStoryScene(ledger,{sceneId:`branch-prelude-${d.id}`}).state;
 ledger=H.activateCampaignHeroEncounter(ledger,{encounterId:d.id,floor:d.floor}).state;
 ledger=H.settleCampaignHeroEncounter(ledger,{encounterId:d.id,heroId:d.heroId,resultId:'qa',outcome:'repelled',hpRate:0,repelled:true,floor:d.floor+2}).state;
 const state={campaign100:{heroEncounters310:ledger}},before=JSON.stringify(state);
 check(archiveScenes(state).find(s=>s.id===`branch-prelude-${d.id}`),ids);assert.equal(JSON.stringify(state),before);
 const model=A.createCampaignStoryArchiveModel(state);assert.equal(model.categories.flatMap(c=>c.entries).filter(e=>e.variants).flatMap(e=>e.variants).filter(v=>v.available).length,0);
});
test('opening intentionally shows the two royal characters',()=>check(S.resolveCampaignStoryScene(S.CAMPAIGN_STORY_OPENING_ID,{}),['lionel','sairan']));

test('unhurt return and lone-survivor scenes do not invent wounds or greeters',()=>{
 for(const d of H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE){
  let ledger=B.queueCampaignHeroAftermathStories(ledgerFor(),{encounterId:d.id,outcome:'hero-victory',floor:d.floor,heroHpRate:1}).state;
  for(const part of ['result','report','party']){
   const text=B.campaignHeroBranchStorySceneById(ledger,`branch-${part}-${d.id}-hero-victory`).dialogue.map(l=>l.text).join('\n');
   assert.doesNotMatch(text,/損傷だけが|傷まで無かったこと|相手へ0%の傷|想定を超え|残した傷は/);
  }
  ledger=B.queueCampaignHeroAftermathStories(ledgerFor(1<<ids.indexOf(d.heroId)),{encounterId:d.id,outcome:'escaped',floor:d.floor,heroHpRate:1}).state;
  const scene=B.campaignHeroBranchStorySceneById(ledger,`branch-party-${d.id}-escaped`);check(scene,[d.heroId]);
  assert.doesNotMatch(scene.dialogue.map(l=>l.text).join('\n'),/待ってくれて|顔見たら|皆で読む|おかえり/);
 }
});
test('legacy archive uses earlier recorded defeats without reviving their speakers',()=>{
 const d=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE[0],ledger=ledgerFor(15&~(1<<ids.indexOf(d.heroId))),state={campaign100:{}};
 const queued=B.queueCampaignHeroAftermathStories(ledger,{encounterId:d.id,outcome:'repelled',floor:d.floor,heroHpRate:0}).state;
 const prior=B.campaignHeroBranchStorySceneById(queued,`branch-party-${d.id}-repelled`);delete prior.castVersion;delete prior.heroStoryState;
 A.recordCampaignStoryArchiveScene(state,prior);
 const next=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE[1],pre=B.campaignHeroBranchStorySceneById(ledger,`branch-prelude-${next.id}`);delete pre.castVersion;delete pre.heroStoryState;
 A.recordCampaignStoryArchiveScene(state,pre);
 check(archiveScenes(state).find(s=>s.id===pre.id),ids.filter(id=>id!==d.heroId));
});
test('royal audience and final voices honor all 16 rosters',async()=>{
 const royal=new vm.SourceTextModule(fs.readFileSync(new URL('../src/ui/screens/CampaignFinalFloorScreen.js',import.meta.url),'utf8'),{context});
 const stub=new vm.SourceTextModule('export const monsterVisual=()=>"";export const pixelIcon=()=>"";',{context});await stub.link(()=>{});await stub.evaluate();await royal.link(()=>stub);await royal.evaluate();
 const names={myth_enami:'えなみ',myth_yori:'より',myth_hide:'ひで',myth_rion:'りおん'};
 for(let mask=0;mask<16;mask++){
  const expected=alive(mask),heroes=ids.map(id=>({id,name:names[id],defeated:!expected.includes(id),remainingHpRate:expected.includes(id)?1:0}));
  const lines=royal.namespace.finalAudienceDialogue({heroes,party:[{name:'魔王'}]});
  for(const id of ids)assert.equal(lines.some(l=>l.speaker===names[id]),expected.includes(id));
  if(mask===15)assert.ok(lines.length>=16);
  for(const moment of ['enter','victory','defeat'])for(const line of S.campaignHeroFinalVoiceLines(moment,expected))assert.ok(expected.includes(line.heroId??line.speakerId));
 }
});
