import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldFixture} from './helpers/chapterTwoField.mjs';
import {run as nativeFixture} from '../tools/build420/native-harness.mjs';
import {createMonster,calculatedStats} from '../src/models/Monster.js';
import {maxMp} from '../src/battle/SkillSystem.js';

async function fixture(area=0){
 const {context:c}=await nativeFixture(['slime'],['slime'],{inspect:true});
 const notices=[],hud=new Map();let heals=0,saves=0;
 const f=fieldFixture(2,{area,onContact(o){if(o.type==='spring'){heals++;c.recoverChapterTwoSpring418(o,100)}else f.g.paused=true;}});
 f.s.monsters=['ch2_carmia','ch2_seria','myth_hide','ch2_althea'].map(speciesId=>createMonster(speciesId,{level:1000}));
 f.s.party=f.s.monsters.map(m=>m.id);f.s.player.inRun=false;f.run.auto377=false;
 for(const m of f.s.monsters){m.currentHp=1;m.currentMp=0;m.status='poison';m.statuses=['poison'];m.ailments=['poison'];const labels={hp:{textContent:''},mp:{textContent:''}},fills={hp:{style:{}},mp:{style:{}}};hud.set(m.id,{labels,fills,querySelector:q=>labels[q.includes('hp')?'hp':'mp'],querySelectorAll:q=>[fills[q.includes('hp')?'hp':'mp']]});}
 c.game=f.g;c.screen='chapterTwoField';c.battle=null;c.save={state:f.s,save(){saves++;return true}};
 c.document={querySelector:q=>hud.get(q.match(/data-explore-hud-id="([^"]+)"/)?.[1])??null};
 c.render=()=>assert.fail('Successful spring recovery must preserve the live field');c.showToast=t=>notices.push(t);
 return {...f,c,hud,notices,get heals(){return heals},get saves(){return saves}};
}
const place=(f,x,y)=>{Object.assign(f.g.player,{x,y,rx:x,ry:y,p:0,path:[]})};
const pos=f=>({x:f.g.player.x,y:f.g.player.y});
const springs=f=>f.contacts.filter(o=>o.type==='spring');
for(let area=0;area<5;area++)test(`area ${area}: tap through spring, preserve route, heal once and rearm after leaving`,async()=>{
 const f=await fixture(area);try{
  const {x,y}=f.g.world.hotSpring,vertical=[2,4].includes(area),start={x:x-(vertical?0:3),y:y-(vertical?3:0)},goal={x:x+(vertical?0:3),y:y+(vertical?3:0)};
  place(f,start.x,start.y);f.tap(goal.x,goal.y);const field=f.g,player=f.g.player;
  f.tick(14);assert.equal(f.heals,1);assert.ok(player.path.length,'destination remains after entering spring');assert.equal(f.g,field);assert.equal(f.g.player,player);assert.equal(f.g.paused,false);
  for(const m of f.s.monsters){assert.equal(m.currentHp,calculatedStats(m).hp);assert.equal(m.currentMp,maxMp(m));assert.equal(m.statuses.length,0);assert.equal(m.status,null);assert.equal(m.ailments.length,0);assert.match(f.hud.get(m.id).labels.hp.textContent,/^HP \d+\/\d+$/);assert.equal(f.hud.get(m.id).fills.hp.style.width,'100%');assert.equal(f.hud.get(m.id).fills.mp.style.width,'100%');}
  assert.equal(f.g.hotSpringRecoveryFx.until,1900);assert.equal(f.notices.length,1);
  // A treasure lying beyond the spring must still stop and open normally.
  f.tick(45);if(vertical){assert.equal(f.contacts.at(-1).type,'chest');assert.equal(f.g.paused,true);assert.equal(player.path.length,0);f.g.paused=false;f.g.chapterTwoObjects.splice(f.g.chapterTwoObjects.findIndex(o=>o.type==='chest'),1);}
  else assert.deepEqual(pos(f),goal);
  f.tap(start.x,start.y);f.tick(65);assert.deepEqual(pos(f),start);assert.equal(f.heals,2);
  f.tap(x,y);f.tick(35);assert.deepEqual(pos(f),{x,y});assert.equal(f.heals,3);const saveCount=f.saves;
  f.tick(100);assert.equal(f.heals,3);assert.equal(f.saves,saveCount,'standing in water cannot repeatedly save/heal');
  // Repeated short taps inside the release radius must not trap the player.
  f.tap(x-(vertical?1:0),y-(vertical?0:1));f.tick(10);assert.equal(f.heals,3);f.tap(start.x,start.y);f.tick(40);assert.deepEqual(pos(f),start);
 }finally{f.cleanup()}
});
test('auto exploration continues through the spring to its intended treasure',async()=>{
 const f=await fixture(1);try{
  const {x,y}=f.g.world.hotSpring;place(f,x+3,y);f.run.auto377=true;f.run.completed=true;
  const target=f.g.chapterTwoObjects.find(o=>o.type==='chest');assert.ok(target.x<x);f.tick(100);
  assert.equal(f.heals,1);assert.equal(f.run.auto377,true);assert.equal(f.contacts.at(-1),target);assert.equal(f.g.paused,true);assert.equal(f.g.player.path.length,0);
 }finally{f.cleanup()}
});
test('pause/modal suspends contact; resuming preserves the route and performs one recovery',async()=>{
 const f=await fixture();try{
  const {x,y}=f.g.world.hotSpring;place(f,x-3,y);f.tap(x+3,y);f.g.paused=true;f.tick(30);assert.equal(f.heals,0);assert.deepEqual(pos(f),{x:x-3,y});
  f.g.paused=false;f.tick(50);assert.equal(f.heals,1);assert.deepEqual(pos(f),{x:x+3,y});
 }finally{f.cleanup()}
});
test('failed recovery save rolls back vitals and does not display success or persist abandoned run',async()=>{
 const f=await fixture();try{
  const {x,y}=f.g.world.hotSpring,frames=[];f.c.requestAnimationFrame=fn=>frames.push(fn);f.c.save.save=()=>false;
  place(f,x-3,y);f.tap(x+3,y);f.tick(14);
  assert.equal(f.heals,1);assert.equal(f.g.paused,true);assert.equal(f.g.discardChapterTwoSave,true);assert.equal(f.c.save.state.monsters[0].currentHp,1);assert.equal(f.c.save.state.monsters[0].currentMp,0);assert.equal(f.c.save.state.monsters[0].status,'poison');assert.equal(f.g.hotSpringRecoveryFx,undefined);assert.ok(f.notices.every(t=>!t.includes('回復した')));assert.equal(frames.length,1);
 }finally{f.cleanup()}
});
test('first-chapter spring keeps its one-use recovery and movement path',async()=>{
 const {context:c,party}=await nativeFixture(['slime'],['slime'],{inspect:true});
 c.battle=null;c.screen='explore';c.save.save=()=>true;const spring={x:1,y:1,active:true,used:false,radius:.8};
 c.game={world:{hotSpring:spring},player:{x:1,y:1,rx:1,ry:1,path:[{x:2,y:1},{x:3,y:1}]}};
 c.refreshExplorePartyHud=()=>{};c.expeditionSnapshotFromGame=()=>({});c.persistExpeditionSnapshot=()=>{};c.audio={};c.showExploreNotice=()=>{};
 party[0].currentHp=1;party[0].currentMp=0;const route=JSON.stringify(c.game.player.path);
 assert.equal(c.applyBossHotSpringRecovery(0),true);assert.equal(spring.used,true);assert.equal(party[0].currentHp,calculatedStats(party[0]).hp);assert.equal(party[0].currentMp,maxMp(party[0]));assert.equal(JSON.stringify(c.game.player.path),route);assert.equal(c.applyBossHotSpringRecovery(2000),false);
});
