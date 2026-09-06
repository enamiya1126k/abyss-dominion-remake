import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {reconcileOnlineMotion} from '../src/online/OnlineMovement.js';
import {advanceHeroField,normalizeHeroPursuit} from '../src/core/CampaignHeroPursuitSystem.js';

const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function runtime(extra={}){
 const scope=vm.createContext({game:{},...extra});
 vm.runInContext(main.slice(main.indexOf('class Entity{'),main.indexOf('\nclass Camera{'))+'\nthis.Entity=Entity;',scope);
 for(const name of ['updateExplorationPartyTrail','explorationFollowerPosition','drawExplorationMonster','explorationPartySceneObjects']){
  const start=main.indexOf(`function ${name}(`),end=main.indexOf('\nfunction ',start+1);
  assert.ok(start>=0&&end>start);vm.runInContext(main.slice(start,end),scope);
 }
 return scope;
}

test('actual walking entity turns horizontally and retains direction while idle or moving vertically',()=>{
 const {Entity}=runtime(),actor=new Entity(5,5);
 assert.equal(actor.facing,'right');actor.setPath([{x:4,y:5},{x:4,y:4},{x:4,y:5},{x:5,y:5}]);
 actor.move(0,1);assert.equal(actor.facing,'right');
 actor.move(.5,1);assert.equal(actor.rx,4.5);assert.equal(actor.facing,'left');
 actor.move(.5,1);actor.move(1,1);actor.move(1,1);assert.equal(actor.facing,'left');
 actor.move(.5,1);assert.equal(actor.rx,4.5);assert.equal(actor.facing,'right');
 actor.move(.5,1);actor.move(1,1);assert.equal(actor.facing,'right');
 const restored=new Entity(4,5,'left');restored.move(1,1);assert.equal(restored.facing,'left');
 assert.equal(new Entity(4,5).facing,'right','older saves without a facing remain supported');
});

test('all three followers turn at their own place in the trail, including vertical segments and stops',()=>{
 const r=runtime(),leader=r.game.player=new r.Entity(0,0);r.updateExplorationPartyTrail();
 function walkTo(x,y){leader.setPath([{x,y}]);for(let i=0;i<8;i++){leader.move(.125,1);r.updateExplorationPartyTrail();}}
 for(let x=1;x<=12;x++)walkTo(x,0);
 for(let y=-1;y>=-4;y--)walkTo(12,y);
 for(let x=11;x>=10;x--)walkTo(x,-4);
 assert.equal(leader.facing,'left');
 for(let i=1;i<=3;i++)assert.equal(r.explorationFollowerPosition(i).facing,'right','followers still approach the turn from the right-facing path');
 walkTo(9,-4);
 assert.equal(r.explorationFollowerPosition(1).facing,'left');
 assert.equal(r.explorationFollowerPosition(2).facing,'right');
 assert.equal(r.explorationFollowerPosition(3).facing,'right');
 for(let x=8;x>=4;x--)walkTo(x,-4);
 const stopped=[];for(let i=1;i<=3;i++){const p=r.explorationFollowerPosition(i);assert.equal(p.facing,'left');stopped.push({...p});}
 leader.move(1,1);r.updateExplorationPartyTrail();
 for(let i=1;i<=3;i++)assert.deepEqual({...r.explorationFollowerPosition(i)},stopped[i-1]);
});

test('network lookahead cannot turn an avatar before its visible step; vertical snaps retain facing',()=>{
 const {Entity}=runtime(),actor=new Entity(5,5);
 reconcileOnlineMotion(actor,{x:4,y:5,facing:'left'});
 actor.move(.5,1);assert.equal(actor.facing,'left');
 reconcileOnlineMotion(actor,{x:4,y:4,facing:'up'});
 reconcileOnlineMotion(actor,{x:5,y:4,facing:'right'});
 assert.equal(actor.facing,'left','future right step must not flip the current left step');
 actor.move(.5,1);actor.move(1,1);assert.equal(actor.facing,'left');
 actor.move(.5,1);assert.equal(actor.facing,'right');actor.move(.5,1);
 reconcileOnlineMotion(actor,{x:20,y:20,facing:'left'},{snap:true});assert.equal(actor.facing,'left');
 reconcileOnlineMotion(actor,{x:40,y:40,facing:'up'},{snap:true});assert.equal(actor.facing,'left');
});

function canvas(){
 let matrix={a:1,d:1,e:0,f:0};const stack=[],images=[];
 return {images,get matrix(){return {...matrix};},save(){stack.push({...matrix});},restore(){matrix=stack.pop();},
  translate(x,y){matrix.e+=matrix.a*x;matrix.f+=matrix.d*y;},scale(x,y){matrix.a*=x;matrix.d*=y;},
  drawImage(image,x,y,w,h){images.push({image,matrix:{...matrix},left:matrix.a*x+matrix.e,right:matrix.a*(x+w)+matrix.e,top:matrix.d*y+matrix.f,bottom:matrix.d*(y+h)+matrix.f});}
 };
}
function drawingRuntime(){
 const ctx=canvas(),frames=[];
 const r=runtime({TILE:32,performance:{now:()=>0},SPECIES:{},calculatedStats:()=>({hp:100}),
  explorationSpriteImage:(monster,frame)=>(frames.push({id:monster.id,frame}),{id:monster.id,frame}),
  partyMonsterArtScale:()=>1});
 r.game={ctx,camera:{z:1,world:(x,y)=>({x:x+100,y:y+50})},player:new r.Entity(5,5)};
 return {r,ctx,frames};
}

test('sprite mirroring keeps identical world bounds and foot anchor, then restores the canvas',()=>{
 const {r,ctx}=drawingRuntime();
 for(const facing of ['right','left'])r.drawExplorationMonster({x:5,y:5,facing},{id:'monster'},false,1);
 const [right,left]=ctx.images;
 assert.equal(right.matrix.a,1);assert.equal(left.matrix.a,-1);
 assert.deepEqual([left.right,left.left,left.top,left.bottom],[right.left,right.right,right.top,right.bottom]);
 assert.deepEqual(ctx.matrix,{a:1,d:1,e:0,f:0});
});

test('online scene draws each member with their own direction and walk state, without mirroring circles',()=>{
 const {r,ctx,frames}=drawingRuntime(),self=r.game.player,peer=new r.Entity(8,5,'left'),circles=[];
 peer.setPath([{x:7,y:5}]);peer.move(.5,1);
 Object.assign(r.game,{online:true,onlineSelfId:'self',onlineEntities:new Map([['self',self],['peer',peer]]),
  onlineMembers:[{member:{playerId:'self',profile:{}},monster:{id:'self'}},{member:{playerId:'peer',profile:{}},monster:{id:'peer'}}]});
 r.drawOnlineExploreCircle=()=>circles.push(ctx.matrix);
 r.explorationPartySceneObjects().forEach(object=>object.draw());
 assert.deepEqual(ctx.images.map(i=>i.matrix.a),[1,-1]);
 assert.deepEqual(frames,[{id:'self',frame:'idle1'},{id:'peer',frame:'idle1'}]);
 // At index 1 both sequences happen to use idle1. At a later frame, only the moving peer walks.
 r.performance.now=()=>170;frames.length=0;r.explorationPartySceneObjects().forEach(object=>object.draw());
 assert.equal(frames[0].frame,'idle1');assert.equal(frames[1].frame,'walk2');
 assert.ok(circles.every(m=>m.a===1&&m.d===1&&m.e===0&&m.f===0));
});

test('pursuing heroes use their actual movement direction and preserve it through vertical motion and saves',()=>{
 const world={tiles:Array.from({length:12},()=>Array(12).fill(0)),currentSectionId:'a'};
 const hero={x:5,y:5,rx:5,ry:5,heroId:'myth_hide',encounterId:'test',sectionId:'a',state:'pursuing',graceSeconds:0};
 advanceHeroField(hero,{world,player:{x:0,y:5},dt:.1});assert.ok(hero.rx<5);assert.equal(hero.facing,'left');
 advanceHeroField(hero,{world,player:{x:0,y:5},dt:.1});
 advanceHeroField(hero,{world,player:{x:4,y:0},dt:.1});assert.equal(hero.facing,'left');assert.ok(hero.ry<5);
 advanceHeroField(hero,{world,player:{x:4,y:0},dt:.1});
 const restored=normalizeHeroPursuit(hero,{encounterId:'test',heroId:'myth_hide'});assert.equal(restored.facing,'left');
 advanceHeroField(hero,{world,player:{x:11,y:4},dt:.1});assert.ok(hero.rx>4);assert.equal(hero.facing,'right');
});
