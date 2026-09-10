import * as H from '../src/core/CampaignHeroEncounterSystem.js';
import * as B from '../src/core/CampaignHeroBranchStorySystem.js';
import * as A from '../src/core/CampaignStoryArchiveSystem.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {SaveService} from '../src/services/SaveService.js';
import {CHAPTER_TWO_AREAS} from '../src/chapterTwo/ChapterTwoContent.js';
import {CHAPTER_TWO_STORIES401,chapterTwoStarted401,chapterTwoStoryRead401,chapterTwoProgress401} from '../src/chapterTwo/ChapterTwoProgress401.js';
import {createChapterTwoArchive401,createStoryArchiveModel401} from '../src/core/ChapterTwoArchive401.js';
import {createCampaignStoryArchiveModel} from '../src/core/CampaignStoryArchiveSystem.js';
import {chapterTwoStoryScene} from '../src/chapterTwo/ChapterTwoStory.js';
import {CAMPAIGN_STORY_CHARACTERS} from '../src/core/CampaignStorySystem.js';
import {chapterTwoHomeCard401,chapterTwoProgressMarkup401,chapterTwoMemoryCard401} from '../src/ui/ChapterTwoProgress401.js';
import {HomeScreen} from '../src/ui/screens/HomeScreen.js';import {StoryArchiveScreen} from '../src/ui/screens/StoryArchiveScreen.js';
const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const extract=(a,b)=>source.slice(source.indexOf('function '+a+'('),source.indexOf('function '+b+'('));
function fresh(){globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};const s=new SaveService().state;s.player.maxFloor=100;s.campaign100.finalCompleted=true;s.chapterTwo376={introComplete:true,clears:0,areaClears378:{},stories378:{},runs378:{}};return s;}
function freeze(s){if(s&&typeof s==='object'){Object.freeze(s);Object.values(s).forEach(freeze);}return s;}
function finished(s){const p=s.chapterTwo376;p.clears=1;p.epilogueComplete=true;p.endingComplete378=true;for(const a of CHAPTER_TWO_AREAS)p.areaClears378[a.id]=1;for(const x of CHAPTER_TWO_STORIES401)p.stories378[x.kind]={index:99,complete:true};return s;}
function run(area=0,done=false,extras={}){return{area,serial:1,room:done?5:1,defeated:done?[...CHAPTER_TWO_AREAS[area].keys]:[],visited:[0,1],...extras};}

test('401 is hidden for first chapter, eligible saves and unfinished introductions without normalizing them',()=>{
 for(const mode of ['first','eligible','partial','stale']){
  const s=fresh();if(mode==='first'||mode==='stale'){s.player.maxFloor=99;s.campaign100.finalCompleted=false;}if(mode==='eligible')delete s.chapterTwo376;if(mode==='partial')s.chapterTwo376={introComplete:false,introIndex:15};
  const old=structuredClone(s);freeze(s);assert.equal(chapterTwoStarted401(s),false);assert.equal(chapterTwoProgress401(s),null);assert.equal(chapterTwoHomeCard401(s),'');assert.equal(createChapterTwoArchive401(s),null);assert.equal(chapterTwoMemoryCard401(null),'');assert.deepEqual(createStoryArchiveModel401(s),createCampaignStoryArchiveModel(s));assert.deepEqual(s,old);
 }
});
test('401 introduction completion reveals all three entrances and retains the first chapter header until then',()=>{
 const s=fresh();s.chapterTwo376.introComplete=false;assert.doesNotMatch(HomeScreen(s),/id="chapterTwoHome380"/);assert.match(HomeScreen(s),/id="openCampaignIntel"/);s.chapterTwo376.introComplete=true;
 assert.match(HomeScreen(s),/進行・次の目的を見る/);assert.match(chapterTwoMemoryCard401(createChapterTwoArchive401(s)),/data-memory-room="chapterTwo"/);
 const archive=createStoryArchiveModel401(s);assert.equal(archive.categories.length,4);const html=StoryArchiveScreen(archive,{category:'chapterTwo'});assert.match(html,/has-chapter-two401/);assert.equal((html.match(/data-story-archive-entry=/g)||[]).length,1);assert.doesNotMatch(html,/id="openCampaignIntel"/);
});
test('401 existing second-chapter receipts yield all eleven scenes without a migration or first-chapter record',()=>{
 const s=finished(fresh()),before=structuredClone(s);freeze(s);const a=createChapterTwoArchive401(s);assert.equal(a.total,11);assert.equal(a.read,11);assert.equal(new Set(a.entries.map(e=>e.id)).size,11);assert.deepEqual(s,before);
 for(const entry of a.entries){assert.equal(entry.scenes[0].replayTitle401,'第二章・回想');assert.equal(entry.scenes[0].characters.length,6);assert.ok(entry.scenes[0].characters.every(Boolean));assert.ok(entry.scenes[0].dialogue.length>=7);}
});
test('401 partial stories, boss wins and unlocked destinations do not count as read',()=>{
 const s=fresh(),p=s.chapterTwo376;p.clears=1;p.areaClears378={0:1,1:1,2:1,3:1,4:1};for(const x of CHAPTER_TWO_STORIES401)p.stories378[x.kind]={index:99,complete:false};
 const a=createChapterTwoArchive401(s);assert.equal(a.read,1);for(const e of a.entries.slice(1))assert.deepEqual(e.scenes,[]);
 const html=StoryArchiveScreen(createStoryArchiveModel401(s),{category:'chapterTwo'});assert.doesNotMatch(html,/筋書きのない明日|天律の聖域の先へ/);assert.equal(chapterTwoStoryRead401(s,'__proto__'),false);
});
test('401 legacy epilogue and either ending receipt are supported without filling missing flags',()=>{
 const s=fresh();s.chapterTwo376.epilogueComplete=true;assert.equal(createChapterTwoArchive401(s).read,2);
 for(const mode of ['legacy','story']){const t=structuredClone(s);if(mode==='legacy')t.chapterTwo376.endingComplete378=true;else t.chapterTwo376.stories378.ending={complete:true};const before=structuredClone(t);assert.equal(createChapterTwoArchive401(t).read,3);assert.deepEqual(t,before);}
});
test('401 archive copies dialogue and cast; callers cannot alter canonical scenes or save records',()=>{
 const s=fresh(),before=structuredClone(s),original=chapterTwoStoryScene('intro',CAMPAIGN_STORY_CHARACTERS),text=original.dialogue[0].text,name=original.characters[0].name;
 const a=createChapterTwoArchive401(s);a.entries[0].scenes[0].dialogue[0].text='changed';a.entries[0].scenes[0].characters[0].name='changed';
 const again=createChapterTwoArchive401(s);assert.equal(again.entries[0].scenes[0].dialogue[0].text,text);assert.equal(again.entries[0].scenes[0].characters[0].name,name);assert.deepEqual(s,before);
});
test('401 combined archive keeps every first-chapter category and its exact counts',()=>{
 for(const s of [fresh(),finished(fresh())]){s.campaign100.storyArchive324={version:1,records:[{sceneId:'untouched-custom-receipt',seenAt:'2026-09-01',payload:{keep:true}}]};const before=structuredClone(s),first=createCampaignStoryArchiveModel(s),combined=createStoryArchiveModel401(s);assert.deepEqual(combined.categories.slice(0,3),first.categories);assert.equal(combined.total,first.total+11);assert.equal(combined.read,first.read+createChapterTwoArchive401(s).read);assert.deepEqual(s,before);}
});
test('401 progress resumes the current region with key pickups and visited rooms intact',()=>{
 const s=fresh();s.chapterTwo376.run=run(0,false,{room:4,defeated:['west','east'],keys380:['west','east'],visited:[0,1,3,4]});const before=structuredClone(s);freeze(s);const m=chapterTwoProgress401(s);assert.equal(m.title,'最深部へ向かう');assert.equal(m.action.type,'explore');assert.equal(m.action.area,0);assert.equal(m.action.label,'探索を再開する');assert.deepEqual(s,before);
 const legacy=fresh();legacy.chapterTwo376.run=run(0,false,{defeated:['west','east']});assert.equal(chapterTwoProgress401(legacy).title,'最深部へ向かう');assert.equal(legacy.chapterTwo376.run.keys380,undefined);
});
test('401 after an area clear, finish its unread conclusion then offer the next region',()=>{
 const s=fresh(),p=s.chapterTwo376;p.clears=1;p.run=run(0,true);p.areaClears378[0]=1;let m=chapterTwoProgress401(s);assert.equal(m.action.kind,'epilogue');p.epilogueComplete=true;m=chapterTwoProgress401(s);assert.equal(m.name,'黒根の侵食域');assert.equal(m.action.area,1);assert.equal(m.cleared,1);assert.equal(m.areas.filter(a=>a.unlocked).length,2);
});
test('401 can resume a saved region and a partially read introduction without creating a run',()=>{
 const s=fresh(),p=s.chapterTwo376;p.clears=1;p.epilogueComplete=true;p.areaClears378[0]=1;p.runs378[1]=run(1);p.stories378['area1-intro']={index:3,complete:false};const before=structuredClone(s);let m=chapterTwoProgress401(s);assert.equal(m.action.kind,'area1-intro');assert.deepEqual(s,before);p.stories378['area1-intro'].complete=true;m=chapterTwoProgress401(s);assert.equal(m.action.area,1);assert.equal(m.action.label,'探索を再開する');assert.equal(p.run,undefined);
});
test('401 read endings lead to postgame destinations and unfinished elite patrols resume their tier',()=>{
 const s=finished(fresh()),p=s.chapterTwo376;p.run=run(4,true);let m=chapterTwoProgress401(s);assert.equal(m.completed,true);assert.equal(m.cleared,5);assert.equal(m.action.type,'destinations');p.runs378[4]=p.run;p.run.eliteTier393=2;p.run.roaming380=['roam4_1'];m=chapterTwoProgress401(s);assert.equal(m.action.eliteResume,true);assert.match(m.title,/1\/3/);const before=structuredClone(s);chapterTwoProgressMarkup401(m);assert.deepEqual(s,before);
});
test('401 locked regions have no destinations, names or clickable hidden story buttons',()=>{
 const s=fresh(),html=chapterTwoProgressMarkup401(chapterTwoProgress401(s));assert.equal((html.match(/data-chapter-progress-area=/g)||[]).length,1);assert.doesNotMatch(html,/黒根の侵食域|天律の聖域|深淵の回廊|理の中枢/);assert.match(html,/未解放/);for(const mode of ['battle','pending','run']){const t=fresh();if(mode==='battle')t.activeBattle={};if(mode==='pending')t.chapterTwo376.run=run(0,false,{pending:{token:'keep'}});if(mode==='run')t.player.inRun=true;const m=chapterTwoProgress401(t);assert.equal(m.blocked,true);assert.match(chapterTwoProgressMarkup401(m),/data-chapter-progress-primary disabled/);}
});

function harness(s=fresh()){
 let modal,html='',calls=[];const nodes=new Map();
 const node=k=>{if(!nodes.has(k))nodes.set(k,{dataset:{},textContent:'',innerHTML:'',insertAdjacentHTML(){},style:{setProperty(){},removeProperty(){}},classList:{add(){},toggle(){}},focus(){},querySelector:node,addEventListener(type,fn){this['on'+type]=fn}});return nodes.get(k);};
 const cast=['lionel','sairan','myth_enami','myth_yori','myth_hide','myth_rion'].map(id=>({dataset:{storyCharacterId:id},classList:{toggle(){}}}));
 const c={chapterTwoStarted401,chapterTwoProgress401,chapterTwoProgressMarkup401,createChapterTwoArchive401,createCampaignStoryArchiveModel,chapterTwoMemoryCard401,save:{state:s,save(){calls.push('SAVE');return true}},battle:null,game:null,campaignStoryPresenting:false,storyArchiveCategory:'prologue',storyArchiveModel:null,
  app:{insertAdjacentHTML(_,v){html=v;nodes.clear();modal={isConnected:true,classList:{add(){}},setAttribute(){},querySelector:node,querySelectorAll:k=>k==='[data-story-character-id]'?cast:[],addEventListener(){},remove(){this.isConnected=false}};}},
  Modal:(title,body,button)=>title+body+button,topModal:()=>modal,pixelIcon:x=>x,document:{querySelector:()=>null,getElementById:node},requestAnimationFrame:f=>f(),setTimeout:f=>f(),showToast:m=>calls.push(['toast',m]),go:screen=>calls.push(['go',screen]),
  showChapterTwoDialogue:kind=>calls.push(['story',kind]),enterChapterTwoForest:o=>calls.push(['explore',JSON.parse(JSON.stringify(o))]),openChapterTwoDestinations:o=>calls.push(['destinations',o.area]),showCampaignStoryReplaySequence:scenes=>calls.push(['replay',scenes[0].id]),openBattleMemory:()=>calls.push('battle-memory')};
 vm.createContext(c);vm.runInContext(extract('openChapterTwoArchive401','openChapterTwo'),c);vm.runInContext(extract('openMemoryArchiveHub','openBattleMemory'),c);
 return {c,node,calls,get html(){return html},get modal(){return modal}};
}
test('401 actual progress modal opens without changing a save; resume dispatches once without a reset',()=>{
 const s=fresh();s.chapterTwo376.run=run();const before=structuredClone(s),h=harness(s);h.c.openChapterTwoProgress401();assert.match(h.html,/地域の歩み/);assert.deepEqual(s,before);assert.deepEqual(h.calls,[]);h.node('[data-chapter-progress-primary]').onclick();h.node('[data-chapter-progress-primary]').onclick();assert.deepEqual(h.calls,[['explore',{area:0,eliteResume:false}]]);assert.deepEqual(s,before);
});
test('401 progress action rechecks current state after opening, blocking pending battles and locked saves',()=>{
 for(const mode of ['battle','pending','locked']){const h=harness();h.c.openChapterTwoProgress401();if(mode==='battle')h.c.battle={};if(mode==='pending')h.c.save.state.chapterTwo376.run=run(0,false,{pending:{}});if(mode==='locked')h.c.save.state.chapterTwo376.introComplete=false;h.node('[data-chapter-progress-primary]').onclick();assert.ok(!h.calls.some(x=>['explore','story','destinations'].includes(x[0])));assert.equal(h.modal.isConnected,true);}
});
test('401 actual memory hub preserves first-chapter entry and adds a gated shortcut to the same archive',()=>{
 for(const started of [false,true]){const s=fresh();s.chapterTwo376.introComplete=started;const before=structuredClone(s),h=harness(s);h.c.openMemoryArchiveHub();assert.match(h.html,/data-memory-room="story"/);assert.equal(h.html.includes('data-memory-room="chapterTwo"'),started);if(started){h.node('[data-memory-room="chapterTwo"]').onclick();assert.equal(h.c.storyArchiveCategory,'chapterTwo');assert.deepEqual(h.calls,[['go','storyArchive']]);}assert.deepEqual(s,before);}
});
test('401 archive shortcuts cannot show unread scenes or open second-chapter UI before starting',()=>{
 let h=harness();h.c.save.state.chapterTwo376.introComplete=false;h.c.openChapterTwoArchive401('ending');assert.deepEqual(h.calls,[]);h=harness();h.c.openChapterTwoArchive401('ending');assert.deepEqual(h.calls,[['go','storyArchive']]);h=harness(finished(fresh()));h.c.openChapterTwoArchive401('ending');assert.deepEqual(h.calls,[['go','storyArchive'],['replay','chapter-two-ending']]);
});
test('401 actual generic replay completes and closes every chapter-two scene without a save, reward or live-story callback',()=>{
 for(const ending of ['read','close','dismiss'])for(const entry of createChapterTwoArchive401(finished(fresh())).entries){
  const s=finished(fresh()),before=structuredClone(s),h=harness(s);h.c.orderedCampaignStoryCharacters=scene=>scene.characters;h.c.campaignStoryPresentationBody=()=>'<div>story</div>';
  vm.runInContext(extract('showCampaignStoryReplaySequence','queueCampaignStoryScenes'),h.c);
  h.c.showCampaignStoryReplaySequence(entry.scenes);assert.match(h.html,/第二章・回想/);
  if(ending==='read')for(let n=0;n<entry.scenes[0].dialogue.length;n++)h.node('[data-modal-primary]').onclick();
  else if(ending==='close')h.node('[data-story-replay-close]').onclick();else h.modal._onDismiss();
  assert.equal(h.c.campaignStoryPresenting,false);assert.equal(h.modal.isConnected,false);assert.deepEqual(h.calls,[]);assert.deepEqual(s,before);
 }
});
test('401 chapter-two read receipts survive actual SaveService reloads; rendering adds no receipt fields',()=>{
 const input=finished(fresh()),mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)};const save=new SaveService();save.state=save.migrate(input);assert.equal(save.save(),true);
 const loaded=new SaveService();const before=structuredClone(loaded.state);assert.equal(createChapterTwoArchive401(loaded.state).read,11);chapterTwoProgress401(loaded.state);createStoryArchiveModel401(loaded.state);assert.deepEqual(loaded.state,before);assert.equal(loaded.state.schemaVersion,84);
});
test('401 production wiring uses the progress panel, shared archive and isolated viewer',()=>{
 const bind=extract('bindHome','bindStoryArchive');assert.match(bind,/chapterTwoHome380.*openChapterTwoProgress401/);assert.match(source,/storyArchiveModel=createStoryArchiveModel401\(save.state\)/);const replay=extract('showCampaignStoryReplaySequence','queueCampaignStoryScenes');assert.doesNotMatch(replay,/save\.save|recordCampaignStoryArchiveScene|showChapterTwoDialogue|queueCampaignStoryScenes/);
 const departure=extract('openChapterTwoDestinations','openRoyalMemory379');assert.match(departure,/data-depart-story.*openChapterTwoArchive401/);assert.match(departure,/data-depart-ending.*openChapterTwoArchive401\('ending'\)/);
 const css=fs.readFileSync(new URL('../src/Styles/build401-progress-archive.css',import.meta.url),'utf8');assert.match(css,/has-chapter-two401.*\.story-archive-tabs/);assert.match(css,/repeat\(2,minmax\(0,1fr\)\)/);assert.match(css,/max-height:calc\(100dvh/);assert.match(css,/:focus-visible/);
});

test('401 twelve first-chapter hero outcomes, fresh and legacy records survive the combined archive',()=>{
const heroes=['myth_enami','myth_yori','myth_hide','myth_rion'],outcomes=['repelled','hero-victory','escaped'];
for(const heroId of heroes)for(const outcome of outcomes){let ledger=H.createCampaignHeroEncounterState(),definition=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE.find(entry=>entry.heroId===heroId),prelude=B.nextCampaignHeroBranchStoryScene(ledger,{floor:definition.floor});ledger=B.acknowledgeCampaignHeroBranchStoryScene(ledger,{sceneId:prelude.id}).state;assert.ok(H.campaignHeroEncounterCandidate(ledger,{floor:definition.floor,encounterRoll:0,visitedSections:2,stepsSinceBattle:6,partyHpRate:1}));ledger=H.activateCampaignHeroEncounter(ledger,{encounterId:definition.id,floor:definition.floor}).state;const rate=outcome==='repelled'?0:outcome==='hero-victory'?0.54:0.82,settled=H.settleCampaignHeroEncounter(ledger,{encounterId:definition.id,resultId:heroId+'-'+outcome,heroId,outcome,floor:definition.floor,hpRate:rate,repelled:outcome==='repelled'});ledger=B.queueCampaignHeroAftermathStories(settled.state,{encounterId:definition.id,outcome,floor:definition.floor,heroHpRate:rate,storyCycle:0}).state;const state={player:{maxFloor:definition.floor,currentFloor:definition.floor},campaign100:{heroEncounters310:ledger}};while(ledger.branchStories323.pending.length){const scene=B.nextCampaignHeroBranchStoryScene(ledger,{floor:definition.floor});A.recordCampaignStoryArchiveScene(state,scene,{seenAt:'2026-09-04T00:00:00.000Z'});ledger=B.acknowledgeCampaignHeroBranchStoryScene(ledger,{sceneId:scene.id}).state;state.campaign100.heroEncounters310=ledger}state.player.maxFloor=100;state.campaign100.finalCompleted=true;state.chapterTwo376={introComplete:true};const before=JSON.stringify(state),first=A.createCampaignStoryArchiveModel(state),model=createStoryArchiveModel401(state);assert.deepEqual(model.categories.slice(0,3),first.categories);assert.equal(JSON.stringify(state),before);const heroEntry=model.categories.find(category=>category.id==='heroes').entries.find(entry=>entry.id==='archive-encounter-'+definition.id),demonEntry=model.categories.find(category=>category.id==='demon').entries.find(entry=>entry.id==='archive-report-'+definition.id);assert.equal(heroEntry.variants.filter(variant=>variant.available).length,1);assert.equal(demonEntry.variants.filter(variant=>variant.available).length,1);assert.equal(heroEntry.variants.find(variant=>variant.outcome===outcome).available,true);assert.equal(demonEntry.variants.find(variant=>variant.outcome===outcome).available,true)}
const fresh={player:{maxFloor:1,currentFloor:1},campaign100:{}},freshBefore=JSON.stringify(fresh),freshModel=A.createCampaignStoryArchiveModel(fresh);assert.equal(freshModel.read,0);assert.equal(JSON.stringify(fresh),freshBefore);
let legacy=H.createCampaignHeroEncounterState(),def=H.CAMPAIGN_HERO_ENCOUNTER_SCHEDULE[0],pre=B.nextCampaignHeroBranchStoryScene(legacy,{floor:def.floor});legacy=B.acknowledgeCampaignHeroBranchStoryScene(legacy,{sceneId:pre.id}).state;legacy=H.activateCampaignHeroEncounter(legacy,{encounterId:def.id,floor:def.floor}).state;legacy=H.settleCampaignHeroEncounter(legacy,{encounterId:def.id,resultId:'legacy',heroId:def.heroId,outcome:'escaped',floor:def.floor,hpRate:.9}).state;legacy.version=3;delete legacy.events[def.id].heroHpRate;delete legacy.events[def.id].hurtPercent;legacy.branchStories323.receipts.push('branch-result-'+def.id+'-escaped');delete legacy.branchStories323.history;const legacyState={player:{maxFloor:def.floor,currentFloor:def.floor},campaign100:{heroEncounters310:legacy}},legacyModel=A.createCampaignStoryArchiveModel(legacyState);assert.equal(legacyModel.categories.find(category=>category.id==='heroes').entries.find(entry=>entry.id==='archive-encounter-'+def.id).variants.find(variant=>variant.outcome==='escaped').available,true);


});
