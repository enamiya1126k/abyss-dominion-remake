import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {SaveService} from '../src/services/SaveService.js';
import * as C from '../src/chapterTwo/ChapterTwoSystem.js';
import {chapterTwoLayout} from '../src/chapterTwo/ChapterTwoMap.js';
import {mitigateHeroDamage,heroOverheal} from '../src/core/HeroAllianceSystem.js';
import * as oldShield from '../../build377/src/core/HeroAllianceSystem.js';
import {shieldCapacity,rememberShieldCapacity} from '../src/core/HeroShieldDisplay.js';
const clone=x=>JSON.parse(JSON.stringify(x));
function fresh(){const mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};const save=new SaveService();save.state.player.maxFloor=100;save.state.campaign100.finalCompleted=true;C.chapterTwoState(save.state).introComplete=true;return save;}
function win(s,key){const r=C.chapterTwoState(s).run;r.room=C.chapterTwoRooms(r).find(x=>x.encounter===key).id;const attempt=C.beginChapterTwoEncounter(s,key);assert.equal(attempt.ok,true,key);const result=C.settleChapterTwoEncounter(s,attempt.token,{won:true});assert.equal(result.ok,true);return result;}
function clear(s){return C.chapterTwoArea(C.chapterTwoState(s).run).keys.map(k=>win(s,k));}
test('five-region progression awards once, preserves chapter one and resumes each saved region',()=>{
 const save=fresh(),s=save.state,first=clone(s.campaign100),tokens=new Set();let gear=0;
 for(let area=0;area<5;area++){
  assert.equal(C.chapterTwoAreaUnlocked(s,area),true);if(area<4)assert.equal(C.chapterTwoAreaUnlocked(s,area+1),false);
  assert.equal(C.selectChapterTwoArea(s,area).ok,true);const r=C.chapterTwoState(s).run;r.room=5;assert.equal(C.beginChapterTwoEncounter(s,C.chapterTwoArea(r).keys[3]).ok,false);
  const results=clear(s);for(const result of results){assert.ok(!tokens.has(result.token));tokens.add(result.token);const before=JSON.stringify(s);assert.equal(C.settleChapterTwoEncounter(s,result.token,{won:true}).duplicate,true);assert.equal(JSON.stringify(s),before);}
  assert.equal(results[3].firstClear,true);assert.equal(results[3].crystals,300*(area+1));if(area){assert.ok(results[3].equipment);assert.ok(results[3].experiencePacks>0);gear++;}
  r.room=2;assert.equal(C.openChapterTwoChest(s).ok,true);assert.equal(C.openChapterTwoChest(s).ok,false);save.save();
 }
 assert.equal(tokens.size,20);assert.equal(s.equipment.filter(e=>e.obtainedMethod==='chapterTwo').length,gear);assert.deepEqual(s.campaign100,first);assert.equal(C.beginChapterTwoRun(s,{area:4,challenge:true}).ok,false);
 const reload=new SaveService();for(let area=0;area<5;area++){assert.equal(C.selectChapterTwoArea(reload.state,area).ok,true);assert.equal(C.chapterTwoState(reload.state).run.completed,true);assert.equal(C.chapterTwoState(reload.state).run.chest,true);}
 C.chapterTwoState(reload.state).endingComplete378=true;
 for(let n=1;n<=6;n++){assert.equal(C.beginChapterTwoRun(reload.state,{area:4,challenge:true}).ok,true);assert.equal(C.chapterTwoState(reload.state).run.challengeTier,Math.min(5,n));const result=clear(reload.state)[3];assert.equal(result.firstClear,false);assert.equal(result.crystals,0);assert.ok(result.experience>C.ENCOUNTERS.a4_heart.experience);}
});
test('pending encounter in a later region survives reload and blocks switching or resetting',()=>{
 const save=fresh(),s=save.state;C.beginChapterTwoRun(s);clear(s);C.selectChapterTwoArea(s,1);const r=C.chapterTwoState(s).run;r.room=1;const pending=C.beginChapterTwoEncounter(s,'a1_patrol');save.save();const reload=new SaveService();
 assert.equal(C.selectChapterTwoArea(reload.state,0).ok,false);assert.equal(C.beginChapterTwoRun(reload.state,{area:1}).ok,false);assert.equal(C.beginChapterTwoEncounter(reload.state,'a1_patrol').token,pending.token);assert.equal(C.settleChapterTwoEncounter(reload.state,pending.token,{won:true}).ok,true);reload.save();assert.equal(C.chapterTwoState(new SaveService().state).run.area,1);
});
test('all region topologies have reachable portals and room objects across five seeds',()=>{
 for(let area=0;area<5;area++)for(let serial=1;serial<=5;serial++){
  const w=chapterTwoLayout(serial,area);assert.equal(w.sections.length,6);assert.equal(w.sectionPortals.length,12);
  for(const section of w.sections){const cells=new Set(section.cellKeys),seen=new Set(),queue=[section.center];for(let n=0;n<queue.length;n++){const p=queue[n],key=`${p.x},${p.y}`;if(seen.has(key)||!cells.has(key))continue;seen.add(key);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])queue.push({x:p.x+dx,y:p.y+dy});}assert.equal(seen.size,cells.size);
   const run={area,serial,room:section.chapterRoom,defeated:[],visited:[0]};const world=C.chapterTwoWorld(run);for(const p of world.sectionPortals){assert.equal(world.tiles[p.y][p.x],0);assert.equal(world.tiles[p.arrivalY][p.arrivalX],0);}
  }
 }
});
test('shield bookkeeping preserves real damage and overheal behavior with a stable capacity',()=>{
 for(const speciesId of ['dire_wolf','myth_yori','myth_rion']){
  const u={id:'u',speciesId,currentHp:100000,heroShield348:65948},v={id:'v',speciesId:'myth_enami',currentHp:100000};const b={party:[u,v],turn:1},old=clone(b);
  for(const amount of [10000,30000,50000]){assert.equal(mitigateHeroDamage(b,'party',u,amount),oldShield.mitigateHeroDamage(old,'party',old.party[0],amount));assert.equal(u.heroShield348,old.party[0].heroShield348);assert.equal(shieldCapacity(u),65948);}
  assert.equal(heroOverheal(b,'party',u,3000,200000),oldShield.heroOverheal(old,'party',old.party[0],3000,200000));assert.equal(u.heroShield348,old.party[0].heroShield348);
 }
 const source=fs.readFileSync(new URL('../src/ui/screens/BattleScreen.js',import.meta.url),'utf8');const fn=source.slice(source.indexOf('function shieldLabel('),source.indexOf('\n',source.indexOf('function shieldLabel(')));const c={shieldCapacity,battleInteger:n=>n.toLocaleString()};vm.createContext(c);vm.runInContext(fn,c);c.unit={heroShield348:65948,heroShieldMax378:100000};assert.match(vm.runInContext('shieldLabel(unit)',c),/盾 65,948\/100,000/);assert.match(vm.runInContext('shieldLabel(unit)',c),/width:65.948%/);c.unit.heroShield348=0;assert.match(vm.runInContext('shieldLabel(unit)',c),/盾 0\/100,000/);
});
