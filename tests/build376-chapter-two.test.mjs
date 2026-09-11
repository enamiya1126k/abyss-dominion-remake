import {cleanupSingles410} from '../src/battle/SingleTraits410.js';
import {pickupChapterTwoKey380} from '../src/chapterTwo/ChapterTwoSystem.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import vm from 'node:vm';
import {SaveService} from '../src/services/SaveService.js';
import {HomeScreen} from '../src/ui/screens/HomeScreen.js';
import {ChapterTwoScreen} from '../src/chapterTwo/ChapterTwoScreen.js';
import {SPECIES} from '../src/data/species.js';
import {chapterTwoUnlocked,chapterTwoState,beginChapterTwoRun,moveChapterTwoRoom,beginChapterTwoEncounter,settleChapterTwoEncounter,openChapterTwoChest,chapterTwoEnemyEntries,tuneChapterTwoEnemy,ROOMS,ENCOUNTERS,chapterTwoWorld,chapterTwoObjective} from '../src/chapterTwo/ChapterTwoSystem.js';
import {CHAPTER_TWO_INTRO,CHAPTER_TWO_EPILOGUE} from '../src/chapterTwo/ChapterTwoStory.js';
const clone=s=>JSON.parse(JSON.stringify(s));
function fresh(){const mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};return new SaveService();}
function unlocked(){const save=fresh();Object.assign(save.state.player,{maxFloor:100,currentFloor:100,inRun:false});Object.assign(save.state.campaign100,{finalCompleted:true,finalUnlocked:true,endings:['complete']});chapterTwoState(save.state).introComplete=true;return save;}
function start(){const s=unlocked();assert.equal(beginChapterTwoRun(s.state).ok,true);return s;}
function battleAt(state,id){const room=ROOMS.find(room=>room.encounter===id);state.chapterTwo376.run.room=room.id;return beginChapterTwoEncounter(state,id);}
test('locked accounts never acquire chapter data or entry; reaching 100 and losing is insufficient',()=>{
 for(const floor of [1,50,99,100])for(const lost of [false,true]){
  const save=fresh();save.state.player.maxFloor=floor;
  if(lost){save.state.campaign100.endings=['defeat'];save.state.campaign100.heroEncounters310.finalArena.lastEnding='defeat';}
  const before=JSON.stringify(save.state);
  assert.equal(chapterTwoUnlocked(save.state),false);assert.equal(chapterTwoState(save.state),null);assert.equal(beginChapterTwoRun(save.state).ok,false);
  assert.equal(JSON.stringify(save.state),before);assert.doesNotMatch(HomeScreen(save.state),/id="openChapterTwo"/);
 }
});
test('win plus 100 unlocks; a lower-floor victory flag alone does not',()=>{
 const s=fresh().state;s.player.maxFloor=99;s.campaign100.finalCompleted=true;assert.equal(chapterTwoUnlocked(s),false);
 s.player.maxFloor=100;assert.equal(chapterTwoUnlocked(s),true);assert.doesNotMatch(HomeScreen(s),/id="openChapterTwo"/);assert.doesNotMatch(HomeScreen(s),/openCampaignReincarnation/);
 for(const ending of ['complete','narrow','all-preempted']){s.campaign100.finalCompleted=false;s.campaign100.heroEncounters310.finalArena={completed:true,lastEnding:ending};assert.equal(chapterTwoUnlocked(s),true);}
});
test('sequence requires intro, two seals, and local encounters; no off-room rewards',()=>{
 const save=unlocked(),s=save.state;chapterTwoState(s).introComplete=false;assert.equal(beginChapterTwoRun(s).ok,false);chapterTwoState(s).introComplete=true;beginChapterTwoRun(s);
 assert.equal(beginChapterTwoEncounter(s,'heart').ok,false);assert.equal(moveChapterTwoRoom(s,'east').ok,true);assert.equal(moveChapterTwoRoom(s,'north').ok,true);assert.equal(moveChapterTwoRoom(s,'east').ok,true);assert.equal(moveChapterTwoRoom(s,'north').ok,false);
 for(const id of ['west','east']){const a=battleAt(s,id);assert.equal(a.ok,true);assert.equal(settleChapterTwoEncounter(s,a.token,{won:true}).ok,true);assert.equal(pickupChapterTwoKey380(s,id).ok,true);}
 s.chapterTwo376.run.room=4;assert.equal(moveChapterTwoRoom(s,'north').ok,true);
});
test('victory, chest, replays and first clear rewards are idempotent and leave chapter one intact',()=>{
 const save=start(),s=save.state,before=clone(s.campaign100),floor=s.player.currentFloor,max=s.player.maxFloor;
 s.chapterTwo376.run.defeated=['west','east'];s.chapterTwo376.run.keys380=['west','east'];const a=battleAt(s,'heart'),r=settleChapterTwoEncounter(s,a.token,{won:true});assert.equal(r.crystals,300);assert.equal(r.experience,300000);const gold=s.player.gold;
 assert.equal(settleChapterTwoEncounter(s,a.token,{won:true}).duplicate,true);assert.equal(s.player.gold,gold);
 s.chapterTwo376.run.room=2;assert.equal(openChapterTwoChest(s).ok,true);assert.equal(openChapterTwoChest(s).ok,false);
 assert.equal(beginChapterTwoRun(s).ok,true);s.chapterTwo376.run.defeated=['west','east'];s.chapterTwo376.run.keys380=['west','east'];const b=battleAt(s,'heart');assert.notEqual(a.token,b.token);const again=settleChapterTwoEncounter(s,b.token,{won:true});assert.equal(again.crystals,0);assert.equal(again.experience,120000);assert.equal(s.chapterTwo376.clears,2);
 assert.deepEqual(s.campaign100,before);assert.equal(s.player.currentFloor,floor);assert.equal(s.player.maxFloor,max);
});
test('defeat and retreat award nothing and leave an encounter available',()=>{
 const s=start().state,before=clone(s.player),a=battleAt(s,'west');assert.equal(settleChapterTwoEncounter(s,a.token,{won:false}).won,false);assert.deepEqual(s.player,before);assert.equal(s.chapterTwo376.run.defeated.length,0);assert.equal(battleAt(s,'west').ok,true);
});
test('actual SaveService preserves room position, story and pending battle token after reload',()=>{
 const save=start(),s=save.state;moveChapterTwoRoom(s,'east');s.chapterTwo376.introIndex=CHAPTER_TWO_INTRO.length;s.chapterTwo376.run.position={x:7,y:8};const a=beginChapterTwoEncounter(s,'patrol');s.activeBattle={specialBattle:true,specialBattleType:'chapterTwo',chapterTwoToken:a.token,chapterTwoEncounter:a.encounter,enemies:[{id:'resume-fixture',speciesId:'slime',hp:100,maxHp:100}]};save.save();const reload=new SaveService();assert.deepEqual(reload.state.chapterTwo376,s.chapterTwo376);assert.equal(beginChapterTwoEncounter(reload.state,'patrol').token,a.token);
 const r=settleChapterTwoEncounter(reload.state,a.token,{won:true});assert.equal(r.ok,true);reload.save();const third=new SaveService();assert.equal(settleChapterTwoEncounter(third.state,a.token,{won:true}).duplicate,true);
});
test('authored enemies and portraits exist; all six rooms are connected and walkable',()=>{
 const seen=new Set([0]),queue=[0];while(queue.length){const id=queue.shift();for(const next of Object.values(ROOMS[id].links))if(!seen.has(next)){seen.add(next);queue.push(next)}}assert.equal(seen.size,6);
 const w=chapterTwoWorld(start().state.chapterTwo376.run);for(const portal of w.sectionPortals){assert.equal(w.tiles[portal.y][portal.x],0);assert.equal(w.tiles[portal.arrivalY][portal.arrivalX],0)}
 for(const [id,profile] of Object.entries(ENCOUNTERS))for(const [i,e] of chapterTwoEnemyEntries(id).entries()){assert.ok(SPECIES[e.speciesId]);tuneChapterTwoEnemy(e,id,i);assert.ok(e.hp>0&&e.hp===e.maxHp&&e.atk>0);assert.ok(e.level>=1000);}
 for(const [,id] of [...CHAPTER_TWO_INTRO,...CHAPTER_TWO_EPILOGUE])if(id)assert.ok(SPECIES[id],id);
 const s=start().state;assert.match(ChapterTwoScreen(s,{field:true}),/gameCanvas/);assert.match(ChapterTwoScreen(s),/現在の目的/);
});
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const finishSource=main.slice(main.indexOf('function finishChapterTwoBattle('),main.indexOf('\nfunction openExploreFloorSelector',main.indexOf('function finishChapterTwoBattle(')));
function finishFixture({saveFails=false}={}){
 const save=start(),attempt=battleAt(save.state,'patrol');save.state.activeBattle={specialBattleType:'chapterTwo',chapterTwoToken:attempt.token};const modals=[];const modal={classList:{add(){}},querySelector:()=>({}),remove(){}};
 const context={chapterTwoAutoModal380(){},battleContributionSnapshot:()=>({}),chapterTwoRewardBody:()=>'',openBattleContributionReport:(_,cb)=>cb(),showChapterTwoProgress:()=>{},save:{state:save.state,save:()=>!saveFails},battle:{specialBattleType:'chapterTwo',chapterTwoToken:attempt.token,party:save.state.monsters},settleChapterTwoEncounter,chapterTwoObjective,chapterTwoState,CHAPTER_TWO_ENCOUNTERS:ENCOUNTERS,syncPersistentAilments(){},clearPartySynergy(){},restorePartyVitals(){},cleanupUltimateBattle(){},cleanupSingles410,document:{querySelector:()=>({remove(){}})},app:{insertAdjacentHTML:(_,html)=>modals.push(html)},audio:{sfx(){}},render(){},Modal:(title,body)=>title+body,topModal:()=>modal,activeEnemy:null,snapshot:null,screen:'chapterTwoField'};
 vm.createContext(context);vm.runInContext(finishSource,context);return{context,modals};
}
test('actual battle settlement integration clears the checkpoint and commits rewards together',()=>{
 const {context:c}=finishFixture();const before=c.save.state.player.gold;vm.runInContext('finishChapterTwoBattle(true)',c);assert.equal(c.battle,null);assert.equal(c.save.state.activeBattle,undefined);assert.equal(c.save.state.player.gold,before+45000);assert.equal(c.screen,'chapterTwoField');
});
test('failed result save rolls rewards and progress back and retains a retryable battle',()=>{
 const {context:c,modals}=finishFixture({saveFails:true});const before=JSON.stringify(c.save.state);vm.runInContext('finishChapterTwoBattle(true)',c);assert.equal(JSON.stringify(c.save.state),before);assert.ok(c.battle);assert.match(modals[0],/再試行/);
 c.save.save=()=>true;vm.runInContext('finishChapterTwoBattle(true)',c);assert.equal(c.battle,null);assert.equal(c.save.state.chapterTwo376.run.defeated.includes('patrol'),true);
});

test('area gate rejects a corrupted jump to the final room without seals',()=>{
 const s=start().state;s.chapterTwo376.run.room=5;assert.equal(beginChapterTwoEncounter(s,'heart').ok,false);assert.equal(s.chapterTwo376.run.pending,null);
});
