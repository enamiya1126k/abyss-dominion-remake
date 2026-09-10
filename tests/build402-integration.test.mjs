import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {SaveService} from '../src/services/SaveService.js';
import {recoverChapterTwoPending402} from '../src/core/ChapterTwoRecovery402.js';
import * as C from '../src/chapterTwo/ChapterTwoSystem.js';
import {chapterTwoProgress401} from '../src/chapterTwo/ChapterTwoProgress401.js';
import {createStoryArchiveModel401} from '../src/core/ChapterTwoArchive401.js';
import {chapterTwoGachaUnlocked397,drawChapterTwoGacha397,CHAPTER_TWO_GACHA_POOLS397} from '../src/chapterTwo/ChapterTwoGacha397.js';
import {homeSkinsUnlocked400,homeSkinState400,commitHomeSkin400} from '../src/core/HomeSkinSystem400.js';
import {claimCircleResearch398} from '../src/chapterTwo/MagicCircleResearch398.js';
import {acknowledgeHeroAlliance396} from '../src/chapterTwo/HeroAlliance396.js';
import {calculatedStats} from '../src/models/Monster.js';
import {fieldFixture} from './helpers/chapterTwoField.mjs';
const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const extract=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
const plain=x=>JSON.parse(JSON.stringify(x));
function fixture(){const mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};const save=new SaveService(),s=save.state;s.player.maxFloor=100;s.campaign100.finalCompleted=true;s.player.crystals=10000;save.migrate(s);C.chapterTwoState(s).introComplete=true;C.beginChapterTwoRun(s);return{save,s,mem};}
function pending(s){const r=C.chapterTwoState(s).run;r.room=1;const x=C.beginChapterTwoEncounter(s,C.CHAPTER_TWO_AREAS[0].keys[0]);assert.ok(x.ok);return x;}
function commitContext(save,extra={}){const ctx={save,game:null,showToast(){},...extra};vm.createContext(ctx);vm.runInContext(extract('function chapterTwoCommit(','let chapterTwoIntroTimer='),ctx);return ctx;}

test('402 interrupted battle creation reload clears only orphan receipts and allows exploration',()=>{
 const {save,s}=fixture(),attempt=pending(s);const r=C.chapterTwoState(s).run;r.position={x:8,y:9};r.keys380=['saved-key'];r.visited=[0,1];s.monsters[0].currentHp=1;s.monsters[0].currentMp=0;
 const protectedBefore=plain({player:s.player,monsters:s.monsters,equipment:s.equipment,inventory:s.inventory,campaign:s.campaign100,run:r});assert.ok(save.save());const loaded=new SaveService(),after=loaded.state,run=C.chapterTwoState(after).run;
 assert.equal(run.pending,null);assert.equal(after.chapterTwo376.runs378[0].pending,null);assert.deepEqual(run.position,protectedBefore.run.position);assert.deepEqual(run.keys380,protectedBefore.run.keys380);assert.deepEqual(run.visited,protectedBefore.run.visited);assert.equal(after.monsters[0].currentHp,1);assert.equal(after.monsters[0].currentMp,0);assert.equal(after.player.crystals,s.player.crystals);assert.equal(after.player.gold,s.player.gold);assert.deepEqual(after.campaign100,s.campaign100);assert.deepEqual(after.equipment,s.equipment);assert.deepEqual(after.inventory,s.inventory);
 assert.equal(chapterTwoProgress401(after).blocked,false);assert.ok(C.selectChapterTwoArea(after,0).ok);assert.equal(C.settleChapterTwoEncounter(after,attempt.token,{won:true}).ok,false);assert.equal(recoverChapterTwoPending402(after),0);
});
test('402 recovery preserves every active checkpoint and leaves first-chapter saves untouched',()=>{
 for(const activeBattle of [{specialBattleType:'chapterTwo',chapterTwoToken:'valid'},{specialBattleType:'raid'},{enemies:[{id:'first-chapter'}]}]){const state={activeBattle,chapterTwo376:{run:{pending:{token:'valid'}},runs378:{1:{pending:{token:'other'}}}}},before=plain(state);assert.equal(recoverChapterTwoPending402(state),0);assert.deepEqual(state,before);}
 const first={player:{gold:123},campaign100:{storyArchive324:{records:[{sceneId:'keep'}]}}},before=plain(first);assert.equal(recoverChapterTwoPending402(first),0);assert.deepEqual(first,before);
});
test('402 serialized duplicate and inactive-region orphans recover without touching rewards or routes',()=>{
 const r={pending:{token:'old'},defeated:['west'],room:2,eliteTier393:3,roaming380:['roam0_1']},s={chapterTwo376:{run:r,runs378:{0:plain(r),1:{pending:{token:'other'},room:4}},stories378:{ending:{complete:true}},returnReport380:{gold:500}}};
 assert.equal(recoverChapterTwoPending402(s),3);assert.deepEqual(r,{pending:null,defeated:['west'],room:2,eliteTier393:3,roaming380:['roam0_1']});assert.equal(s.chapterTwo376.runs378[1].room,4);assert.equal(s.chapterTwo376.returnReport380.gold,500);assert.equal(s.chapterTwo376.stories378.ending.complete,true);assert.equal(recoverChapterTwoPending402(s),0);
});
test('402 rejecting a mismatched live checkpoint also releases its pending receipt',()=>{
 const {save,s}=fixture();pending(s);s.activeBattle={specialBattleType:'chapterTwo',chapterTwoToken:'mismatch'};const ctx={save,chapterTwoUnlocked:C.chapterTwoUnlocked,chapterTwoState:C.chapterTwoState,recoverChapterTwoPending402,screen:'initial'};vm.createContext(ctx);vm.runInContext(extract('function resumeSavedBattle(','function affixValue('),ctx);
 assert.equal(ctx.resumeSavedBattle(),false);assert.equal(ctx.screen,'home');assert.equal(save.state.activeBattle,undefined);assert.equal(C.chapterTwoState(save.state).run.pending,null);
});
test('402 failed mutations and thrown saves restore the complete transaction before a retry',()=>{
 for(const failure of ['rejected','throws','save-false','save-throws']){const {save}=fixture(),before=plain(save.state);let writes=0;save.save=()=>{writes++;if(failure==='save-throws')throw Error('quota');return false;};const ctx=commitContext(save);const r=ctx.chapterTwoCommit(()=>{save.state.player.gold+=100;save.state.chapterTwo376.stories378.changed={complete:true};if(failure==='throws')throw Error('construction');return{ok:failure!=='rejected'};});assert.equal(r.ok,false);assert.deepEqual(plain(save.state),before);assert.equal(writes,['save-false','save-throws'].includes(failure)?1:0);}
});
test('402 a failed field save stops stale movement and redraws from restored state',()=>{
 const {save}=fixture(),before=plain(save.state),g={chapterTwo:true},calls=[];save.save=()=>false;const ctx=commitContext(save,{game:g,screen:'chapterTwoField',requestAnimationFrame:f=>f(),render:()=>calls.push('render')});assert.equal(ctx.chapterTwoCommit(()=>{save.state.player.gold=0;return{ok:true}}).saveFailed,true);assert.equal(g.paused,true);assert.equal(g.discardChapterTwoSave,true);assert.deepEqual(calls,['render']);assert.deepEqual(plain(save.state),before);
});
test('402 actual departure saves destination, roaming state and hint together exactly once',()=>{
 for(const failed of [false,true]){const {save,s}=fixture();s.chapterTwo376.dungeonHint377=true;const before=plain(s);let writes=0;const calls=[];save.save=()=>{writes++;return !failed};const ctx=commitContext(save,{battle:null,chapterTwoState:C.chapterTwoState,chapterTwoAreaUnlocked:C.chapterTwoAreaUnlocked,selectChapterTwoArea:C.selectChapterTwoArea,beginChapterTwoRun:C.beginChapterTwoRun,beginChapterTwoElite393:C.beginChapterTwoElite393,refreshChapterTwoRoaming380:C.refreshChapterTwoRoaming380,stopGame:()=>calls.push('stop'),go:x=>calls.push(x)});vm.runInContext(extract('function enterChapterTwoForest(','function departureParty379('),ctx);ctx.enterChapterTwoForest();assert.equal(writes,1);if(failed){assert.deepEqual(plain(save.state),before);assert.deepEqual(calls,[]);}else{assert.equal(save.state.chapterTwo376.dungeonHint377,false);assert.deepEqual(calls,['stop','chapterTwoField']);}}
});
test('402 unlock boundary is shared by gacha and skins while the progress panel waits for the introduction',()=>{
 for(const cleared of [false,true])for(const won of [false,true])for(const intro of [false,true]){const {s}=fixture();s.player.maxFloor=cleared?100:99;s.campaign100.finalCompleted=won;s.chapterTwo376.introComplete=intro;assert.equal(C.chapterTwoUnlocked(s),cleared&&won);assert.equal(chapterTwoGachaUnlocked397(s),cleared&&won);assert.equal(homeSkinsUnlocked400(s),cleared&&won);assert.equal(Boolean(chapterTwoProgress401(s)),cleared&&won&&intro);}
});
test('402 recruitment, new circles, summon, skin and archive coexist across SaveService reloads',async()=>{
 const {save,s}=fixture(),first=plain(s.campaign100);const joined=C.recruitChapterTwoHeroes380(s);assert.ok(joined.ok);assert.ok(acknowledgeHeroAlliance396(s).ok);const research=claimCircleResearch398(s);assert.ok(research.ok);const summons=drawChapterTwoGacha397(s,10,{random:()=>.8});assert.ok(summons.ok);const stats=s.party.map(id=>calculatedStats(s.monsters.find(m=>m.id===id))),gold=s.player.gold,crystals=s.player.crystals,count=s.monsters.length,gear=s.equipment.length;
 assert.ok((await commitHomeSkin400(save,{id:'core',motion:false})).ok);createStoryArchiveModel401(s);chapterTwoProgress401(s);assert.deepEqual(s.party.map(id=>calculatedStats(s.monsters.find(m=>m.id===id))),stats);assert.deepEqual(s.campaign100,first);
 const loaded=new SaveService(),l=loaded.state;assert.equal(l.monsters.length,count);assert.equal(l.equipment.length,gear);assert.equal(l.player.gold,gold);assert.equal(l.player.crystals,crystals);assert.equal(homeSkinState400(l).skin.id,'core');assert.equal(homeSkinState400(l).motion,false);assert.equal(l.chapterTwoGacha397.draws,10);assert.equal(claimCircleResearch398(l).ok,false);assert.equal(acknowledgeHeroAlliance396(l).ok,false);const n=l.monsters.length;C.recruitChapterTwoHeroes380(l);assert.equal(l.monsters.length,n);assert.ok(research.granted.every(c=>l.magicCircles.instances.some(i=>i.circleId===c.circleId||i.circleId===c.id)));assert.deepEqual(l.campaign100,first);
});
test('402 failed victory persistence rolls back progress, drops and currency, retry pays only once',()=>{
 const {save,s}=fixture(),a=pending(s),before=plain(s),realSave=save.save.bind(save);save.save=()=>false;const ctx=commitContext(save);assert.equal(ctx.chapterTwoCommit(()=>C.settleChapterTwoEncounter(save.state,a.token,{won:true})).saveFailed,true);assert.deepEqual(plain(save.state),before);save.save=realSave;assert.ok(ctx.chapterTwoCommit(()=>C.settleChapterTwoEncounter(save.state,a.token,{won:true})).ok);const received=plain(save.state);assert.equal(ctx.chapterTwoCommit(()=>C.settleChapterTwoEncounter(save.state,a.token,{won:true})).ok,false);assert.deepEqual(plain(save.state),received);const l=new SaveService().state;assert.equal(l.player.gold,received.player.gold);assert.equal(l.equipment.length,received.equipment.length);
});
test('402 paused or hidden exploration paints no frames, resumes and disposes cleanly',()=>{
 const h=fieldFixture();try{h.tick(3);const painted=h.draws;assert.ok(painted>0);const position=plain(h.run.position);h.g.paused=true;h.tick(50);assert.equal(h.draws,painted);assert.deepEqual(h.run.position,position);h.g.paused=false;document.hidden=true;h.tick(50);assert.equal(h.draws,painted);document.hidden=false;h.tick(3);assert.ok(h.draws>painted);const before=h.draws;h.g.disposeChapterTwo();h.tick(10);assert.equal(h.draws,before);}finally{h.cleanup();}
});
test('402 canvas cache reuses hot sheets, bounds retained atlases and canonicalizes fallback frames',async()=>{
 const {chapterTwoCanvasFrame383:frame,CHAPTER_TWO_CANVAS_CACHE_LIMIT402:limit}=await import('../src/ui/ChapterTwoSprite383.js?test402');const oldImage=globalThis.Image,oldDoc=globalThis.document,images=[];let canvases=0;const ids=Object.values(CHAPTER_TWO_GACHA_POOLS397).flat();
 globalThis.Image=class{constructor(){images.push(this)}set src(v){this.url=v;this.onload?.();}};globalThis.document={createElement:()=>{canvases++;return{getContext:()=>({translate(){},scale(){},beginPath(){},lineTo(){},moveTo(){},closePath(){},clip(){},drawImage(){}})};}};
 try{const idle=frame(ids[0],'idle1');assert.ok(idle);for(let i=0;i<100;i++)assert.equal(frame(ids[0],'unknown'+i),idle);assert.equal(canvases,1);for(let i=1;i<limit;i++)frame(ids[i],'idle1');assert.equal(images.length,limit);frame(ids[0],'idle1');frame(ids[limit],'idle1');assert.equal(frame(ids[0],'idle1'),idle);const prior=images.length;frame(ids[1],'idle1');assert.equal(images.length,prior+1);assert.equal(images[1].onload,null);assert.equal(images.filter(i=>i.onload!==null).length,limit);
 for(const id of ids)for(const f of ['idle1','idle2','idle3','walk1','walk2','attack','damage','down'])assert.ok(frame(id,f));assert.equal(images.filter(i=>i.onload!==null).length,limit);
 }finally{globalThis.Image=oldImage;globalThis.document=oldDoc;}
});
