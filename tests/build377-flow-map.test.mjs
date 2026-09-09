import {pickupChapterTwoKey380} from '../src/chapterTwo/ChapterTwoSystem.js';
import {fieldFixture} from './helpers/chapterTwoField.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {SaveService} from '../src/services/SaveService.js';
import {chapterTwoState,chapterTwoNeedsIntroduction,chapterTwoDungeonHint,beginChapterTwoRun,chapterTwoWorld,chapterTwoObjective,moveChapterTwoRoom} from '../src/chapterTwo/ChapterTwoSystem.js';
import {chapterTwoLayout} from '../src/chapterTwo/ChapterTwoMap.js';
import {ChapterTwoScreen,chapterTwoDestinations,chapterTwoMapMarkup} from '../src/chapterTwo/ChapterTwoScreen.js';
import {HomeScreen} from '../src/ui/screens/HomeScreen.js';
import {ExploreScreen} from '../src/ui/screens/ExploreScreen.js';
import {ExploreScreen as OldExplore} from '../../build376/src/ui/screens/ExploreScreen.js';
import {generateSectionDungeon,sectionBounds,portalTapDestination} from '../src/core/DungeonSectionSystem.js';
import {generateSectionDungeon as oldGenerate} from '../../build376/src/core/DungeonSectionSystem.js';
import {buildSectionMiniMapModel} from '../src/core/DungeonMiniMapSystem.js';
import {mountChapterTwoField} from '../src/chapterTwo/ChapterTwoField.js';
import {chapterTwoStoryScene} from '../src/chapterTwo/ChapterTwoStory.js';
import {CAMPAIGN_STORY_CHARACTERS} from '../src/core/CampaignStorySystem.js';
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function fresh(){globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};const s=new SaveService().state;s.player.maxFloor=100;s.player.currentFloor=100;s.campaign100.finalCompleted=true;return s;}
const rng=n=>()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);
const normalized=s=>s.replace(/3\.1\.\d+/g,'VERSION');
test('first-chapter ExploreScreen output and mutation match the old version at all 100 floors',t=>{
 t.mock.method(Date,'now',()=>1770000000000);
 for(let floor=1;floor<=100;floor++){const s=fresh();s.player.currentFloor=floor;s.player.maxFloor=floor;s.campaign100.finalCompleted=false;const a=structuredClone(s),b=structuredClone(s);assert.equal(normalized(ExploreScreen(a,{run:{startedAt:1}})),normalized(OldExplore(b,{run:{startedAt:1}})),`floor ${floor}`);assert.deepEqual(a,b);}
});
test('shared generator default remains identical for 30 seeds',()=>{for(let n=1;n<=30;n++)assert.deepEqual(generateSectionDungeon({count:6,random:rng(n)}),oldGenerate({count:6,random:rng(n)}));});
test('second chapter migration retains intro, seals, rewards and pending battle; resets only invalid old position',()=>{
 const s=fresh();s.chapterTwo376={introComplete:true,introIndex:16,clears:2,serial:3,run:{serial:3,room:4,position:{x:9,y:9},visited:[0,1,3,4],defeated:['patrol','west'],chest:true,pending:{token:'forest:3:east',encounter:'east',partyIds:s.party}}};
 const c=structuredClone(s.campaign100),p=chapterTwoState(s);assert.equal(p.run.geometryVersion,377);assert.deepEqual(p.run.position,chapterTwoLayout(3).sections[4].center);assert.equal(p.run.pending.token,'forest:3:east');assert.equal(p.run.chest,true);assert.equal(p.clears,2);assert.deepEqual(s.campaign100,c);assert.equal(chapterTwoNeedsIntroduction(s),false);assert.equal(chapterTwoDungeonHint(s),true);
});
test('home hint and destination list are post-clear only, and hint ends on forest entry',()=>{
 const s=fresh();assert.equal(chapterTwoNeedsIntroduction(s),true);assert.equal(chapterTwoDungeonHint(s),false);const p=chapterTwoState(s);p.introComplete=true;assert.match(HomeScreen(s),/chapter-two-dungeon-hint/);const h=chapterTwoDestinations(s);assert.ok(h.indexOf('1〜100階層')<h.indexOf('魔王城王室'));assert.ok(h.indexOf('魔王城王室')<h.indexOf('境界の森'));beginChapterTwoRun(s);assert.equal(chapterTwoDungeonHint(s),false);assert.doesNotMatch(HomeScreen(s),/class="chapter-two-dungeon-hint"/);
 s.campaign100.finalCompleted=false;assert.equal(chapterTwoNeedsIntroduction(s),false);assert.equal(chapterTwoDungeonHint(s),false);assert.equal(chapterTwoDestinations(s),'');
});
test('map shows visited rooms and adjacent unknown rooms without leaking distant facilities',()=>{
 const s=fresh();chapterTwoState(s).introComplete=true;beginChapterTwoRun(s);const r=s.chapterTwo376.run,w=chapterTwoWorld(r),m=buildSectionMiniMapModel(w);assert.deepEqual(m.visitedIds,['forest-0']);assert.deepEqual(m.frontierIds,['forest-1']);assert.equal(m.markers.length,0);assert.doesNotMatch(chapterTwoMapMarkup(w,r),/3 月映りの水辺/);assert.match(chapterTwoMapMarkup(w,r),/未探索の区画/);
 r.visited=[0,1,2];r.room=2;const next=buildSectionMiniMapModel(chapterTwoWorld(r));assert.ok(next.markers.some(x=>x.kind==='chest'));assert.ok(next.markers.some(x=>x.kind==='spring'));
 assert.match(chapterTwoObjective(r).title,/0\/2/);r.defeated=['west'];r.keys380=['west'];assert.match(chapterTwoObjective(r).title,/1\/2/);r.defeated.push('east');r.keys380.push('east');assert.equal(chapterTwoObjective(r).title,'最深部へ向かう');r.room=5;assert.equal(chapterTwoObjective(r).title,'世界樹の残響・侵食体を倒す');r.completed=true;assert.equal(chapterTwoObjective(r).title,'境界の森を解放した');
 const chapterBefore=JSON.stringify(s.campaign100);ChapterTwoScreen(s);assert.equal(JSON.stringify(s.campaign100),chapterBefore);
});
test('six-person story reuses canonical portraits and speaker identities',()=>{for(const kind of ['intro','epilogue']){const scene=chapterTwoStoryScene(kind,CAMPAIGN_STORY_CHARACTERS);assert.equal(scene.characters.length,6);assert.equal(scene.routeHidden,true);for(const line of scene.dialogue)if(line.speakerId)assert.ok(scene.characters.some(c=>c.id===line.speakerId));assert.equal(scene.characters.find(c=>c.id==='sairan').portrait.asset,CAMPAIGN_STORY_CHARACTERS.sairan.portrait.asset);}});
test('shared input + real geometry: tap portal, drag and pinch; transitions preserve destination spawn',()=>{
 const f=fieldFixture();try{const e={pointerId:1,clientX:80,clientY:80};f.canvas.onpointerdown(e);f.canvas.onpointermove({...e,clientX:110});f.canvas.onpointerup({...e,clientX:110});assert.equal(f.g.player.path.length,0);f.canvas.onpointerdown(e);f.canvas.onpointerdown({pointerId:2,clientX:180,clientY:80});const zoom=f.g.camera.z;f.canvas.onpointermove({pointerId:2,clientX:220,clientY:80});assert.ok(f.g.camera.z>zoom);f.canvas.onpointerup(e);f.canvas.onpointerup({pointerId:2,clientX:220,clientY:80});const door=f.g.chapterTwoObjects.find(o=>o.type==='door');f.tap(door.x,door.y);f.tick(500);assert.equal(f.contacts[0]?.type,'door');assert.equal(moveChapterTwoRoom(f.s,'east').ok,true);const position={...f.run.position};f.g.disposeChapterTwo();assert.deepEqual(f.run.position,position);assert.equal(f.listeners.size,0);}finally{f.cleanup()}
});
test('manual entry does not trigger enemy at spawn, auto walks to encounter once',()=>{
 const f=fieldFixture(3);try{f.tick(20);assert.equal(f.contacts.length,0);f.g.chapterTwoToggleAuto();f.tick(500);assert.equal(f.contacts.length,1);assert.equal(f.contacts[0].id,'west');f.tick(20);assert.equal(f.contacts.length,1)}finally{f.cleanup()}
});
test('every portal, chest, spring and boss is reachable inside its room over 20 forest seeds',()=>{
 const ctx=vm.createContext({});vm.runInContext(main.slice(main.indexOf('function path(w,'),main.indexOf('function bindInput(c)')),ctx);
 for(let n=1;n<=20;n++){const run={serial:n,room:0,visited:[0],defeated:[]},w=chapterTwoWorld(run);assert.equal(new Set(w.sections.map(s=>s.layoutPattern)).size,6);
 for(const section of w.sections){w.currentSectionId=section.id;const targets=[...w.sectionPortals,...w.bosses,...w.chests,w.hotSpring].filter(o=>o.sectionId===section.id);for(const o of targets){const route=ctx.path(w,section.center,o);assert.ok(route.length||section.center.x===o.x&&section.center.y===o.y,`seed${n} ${section.id} ${o.id}`);}}
 }
});
