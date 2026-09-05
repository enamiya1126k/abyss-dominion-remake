import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {monsterVisual,partyMonsterArtScale} from '../src/ui/MonsterVisual.js';

const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function functionSource(name,next){return source.slice(source.indexOf(`function ${name}(`),source.indexOf(`function ${next}(`))}
const boss={speciesId:'dark_knight',floorBossCatalogId:'floor_boss_010',currentHp:100};
const normal={speciesId:'dark_knight',currentHp:100};

test('only contracted floor-boss party art is enlarged; enemy/codex art stays normal',()=>{
 for(const marker of [{floorBossCatalogId:'floor_boss_010'},{floorBossId:'floor_boss_010'},{obtainedMethod:'floorBossContract'}])assert.equal(partyMonsterArtScale({...normal,...marker}),2);
 for(const monster of [normal,{...normal,faction:'abyss'},{...normal,faction:'tenGod'},null])assert.equal(partyMonsterArtScale(monster),1);
 assert.match(monsterVisual(boss,'BOSS',{partyArt:true}),/party-monster-art-layer/);
 assert.doesNotMatch(monsterVisual(boss),/party-monster-art-layer/);
 assert.doesNotMatch(monsterVisual(normal,'N',{partyArt:true}),/party-monster-art-layer/);
});

for(const frame of ['idle','walk1','attack','damage','down'])test(`art layer remains single for ${frame}`,()=>{
 const html=monsterVisual(boss,'BOSS',{frame,partyArt:true});
 assert.equal((html.match(/class="party-monster-art-layer"/g)??[]).length,1);
 assert.equal((html.match(/<img /g)??[]).length,1);
 assert.match(html,/<img [^>]*><span class="monster-visual-fallback" hidden>/);
});

test('canvas enlargement preserves the foot pivot at every camera zoom and in every animation state',()=>{
 for(const z of [.4,1,2])for(const down of [false,true])for(const moving of [false,true]){
  const calls=[],ctx={save(){},restore(){},drawImage(...args){calls.push(args)}};
  const game={player:{path:moving?[{}]:[],x:4,y:6,rx:4,ry:6},camera:{z,world:(x,y)=>({x:x*z+7,y:y*z-11})},ctx};
  const context=vm.createContext({game,TILE:32,performance:{now:()=>1000},calculatedStats:()=>({hp:100}),explorationSpriteImage:()=>({image:true}),SPECIES:{}});
  vm.runInContext(functionSource('drawExplorationMonster','drawExplorationTileAsset'),context);
  for(const scale of [1,2])context.drawExplorationMonster({x:4,y:6},{...boss,currentHp:down?0:100},false,scale);
  const a=calls[0].slice(1),b=calls[1].slice(1);
  assert.equal(b[2],a[2]*2);assert.equal(b[3],a[3]*2);
  assert.ok(Math.abs((a[0]+a[2]/2)-(b[0]+b[2]/2))<1e-8);
  assert.ok(Math.abs((a[1]+a[3]*.875)-(b[1]+b[3]*.875))<1e-8);
 }
});

test('all four exploration slots use art scale without changing positions or draw order',()=>{
 for(let slot=0;slot<4;slot++){
  const members=Array.from({length:4},(_,i)=>({...normal,...(i===slot?boss:{})})),calls=[];
  const context=vm.createContext({game:{player:{rx:8,ry:9}},partyMonsterArtScale,explorationPartyMembers:()=>members,explorationFollowerPosition:i=>({x:8-i,y:9}),drawExplorationMonster:(...args)=>calls.push(args)});
  vm.runInContext(functionSource('explorationPartySceneObjects','onlineExploreObjectFoot'),context);
  const objects=context.explorationPartySceneObjects();objects.forEach(o=>o.draw());
  assert.deepEqual(calls.map(c=>c[3]),members.map((m,i)=>(i?.95:1)*(i===slot?2:1)));
  assert.deepEqual(calls.map(c=>[c[0].x,c[0].y]),[[8,9],[7,9],[6,9],[5,9]]);
  assert.deepEqual(Array.from(objects,o=>o.order),[80,81,82,83]);
 }
});

test('online exploration keeps circle calls at the original positions',()=>{
 const calls=[],circles=[],members=[boss,normal].map((monster,i)=>({monster,member:{playerId:String(i),dungeonPosition:{x:3+i,y:4},profile:{}}}));
 const context=vm.createContext({game:{online:true,onlineMembers:members,onlineSelfId:'0'},partyMonsterArtScale,drawExplorationMonster:(...args)=>calls.push(args),drawOnlineExploreCircle:(...args)=>circles.push(args)});
 vm.runInContext(functionSource('explorationPartySceneObjects','onlineExploreObjectFoot'),context);
 context.explorationPartySceneObjects().forEach(o=>o.draw());
 assert.deepEqual(calls.map(c=>c[3]),[2,.95]);
 assert.equal(circles.length,2);
 assert.equal(circles[0][0],calls[0][0]);assert.equal(circles[1][0],calls[1][0]);
});
