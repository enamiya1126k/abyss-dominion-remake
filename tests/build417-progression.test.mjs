import test from 'node:test';
import assert from 'node:assert/strict';
import {run,rng} from '../tools/build420/native-harness.mjs';
import {SaveService} from '../src/services/SaveService.js';
import {SAVE_KEY} from '../src/core/config.js';
import {cleanupTrial415} from '../src/battle/TrialAdaptation415.js';
import {cleanupSingles410} from '../src/battle/SingleTraits410.js';
import {buildTurnQueue} from '../src/battle/TurnSystem.js';

const ids=['ch2_carmia','ch2_seria','ch2_rostia','ch2_althea'];
const noop=()=>{};
const classList={add:noop,remove:noop,toggle:noop};
async function fixture(partyIds=ids){
 localStorage.removeItem(SAVE_KEY);
 const f=await run(partyIds,['slime'],{inspect:true,circles:false,level:1000,floor:100});
 const c=f.context,service=new SaveService();service.state=c.save.state;c.save=service;
 const timers=[],frames=[],button={addEventListener:noop,classList},modal={querySelector:()=>button,remove:noop,classList};
 Object.assign(c,{battleBiomePanelTimer:null,expeditionSaveTimer:null,exploreActionGeneration:0,
  audio:{setScene:noop,sfx:noop},stopExploreAuto:noop,settleAbandonedCampaignHeroPursuit:()=>false,
  topModal:()=>modal,showToast:noop,requestAnimationFrame:fn=>{frames.push(fn)},
  setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length},clearTimeout:noop,
  mountHomeEnvironment400:noop,clearContextGuide:noop,mountBattleBossLayout:noop,
  scheduleBattleContextGuide:noop,clearInterval:noop});
 c.document={querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>button,body:{appendChild:noop},createElement:()=>({classList,remove:noop})};
 c.app={classList,insertAdjacentHTML:noop};let mounts=0;
 c.mountBattleScreen=()=>{mounts++};c.renderBattle=f.nativeRender;
 service.state.player.gold=100000;service.state.player.checkpoint=1;
 service.state.settings.exploreAutoMode='off';service.state.settings.autoBattle=false;
 f.b.auto=false;f.b.biomeBattle={name:'光属性区画'};f.b.biomePanelCollapseAt=Date.now()+1800;
 return {...f,timers,frames,mounts:()=>mounts,button};
}
function defeat(f){f.party.forEach(u=>{u.currentHp=0;u.currentMp=0});f.context.lose=f.nativeLose;f.nativeLose();}
function dispose(f){cleanupSingles410(f.context.battle);cleanupTrial415(f.context.battle);}

test('defeat at floor100 stays on its result when the biome collapse callback arrives late',async()=>{
 const f=await fixture(),c=f.context;
 c.scheduleBattleBiomePanelCollapse();const pending=f.timers.at(-1).fn;
 defeat(f);assert.equal(c.save.state.player.currentFloor,1);assert.equal(c.save.state.player.inRun,false);
 const hp=f.party.map(u=>u.currentHp);assert.deepEqual(hp,[1,1,1,1]);
 const before=f.mounts();pending();assert.equal(f.mounts(),before,'finished battle remounted above defeat result');
 assert.deepEqual(f.party.map(u=>u.currentHp),hp,'late render rebound combat-only HP');dispose(f);
});
test('pagehide checkpoint after defeat cannot resurrect a settled battle or its exploration snapshot',async()=>{
 const f=await fixture();defeat(f);const gold=f.context.save.state.player.gold;
 f.nativeSave();assert.ok(f.context.save.state.activeBattle===undefined);
 const loaded=new SaveService();assert.ok(loaded.state.activeBattle===undefined);
 assert.equal(loaded.state.player.inRun,false);assert.equal(loaded.state.player.gold,gold);dispose(f);
});
test('loading an old orphaned normal battle preserves rescue state and drops only inactive encounter data',async()=>{
 const f=await fixture(),s=f.context.save;
 f.nativeSave();dispose(f);s.state.player.inRun=false;s.state.player.currentFloor=1;
 s.state.monsters.forEach(u=>{u.currentHp=1;u.currentMp=0});s.save();
 const gold=s.state.player.gold,reloaded=new SaveService();
 assert.ok(reloaded.state.activeBattle===undefined);assert.equal(reloaded.state.expeditionSnapshot,null);
 assert.equal(reloaded.state.player.currentFloor,1);assert.equal(reloaded.state.player.maxFloor,100);
 assert.equal(reloaded.state.player.gold,gold);assert.ok(reloaded.state.monsters.filter(u=>ids.includes(u.id)).every(u=>u.currentHp===1&&u.currentMp===0));
});
test('runtime resume refuses an ordinary checkpoint belonging to an ended run',async()=>{
 const f=await fixture(),c=f.context;f.nativeSave();dispose(f);c.battle=null;c.save.state.player.inRun=false;c.save.state.player.currentFloor=1;
 assert.equal(f.nativeResume(),false);assert.equal(c.battle,null);assert.equal(c.save.state.activeBattle,undefined);assert.equal(c.save.state.player.currentFloor,1);
});
test('an ended field cannot start a transition and leave encountering/paused stuck',async()=>{
 const f=await fixture(),c=f.context;dispose(f);c.battle=null;c.screen='explore';c.save.state.player.inRun=false;
 c.game={running:true,paused:false,world:{encountering:false},player:{path:[],p:0}};
 let renders=0;c.render=()=>{renders++};
 await c.beginEncounter([{speciesId:'slime',level:1000}]);
 assert.equal(c.game.world.encountering,false);assert.equal(c.game.running,false);assert.equal(c.screen,'home');assert.equal(renders,1);
});
test('cancelling an encounter transition releases its own field lock',async()=>{
 const f=await fixture(),c=f.context;dispose(f);c.battle=null;c.screen='explore';
 c.game={running:true,paused:false,world:{encountering:false},player:{path:[],p:0}};
 c.wait=async()=>{c.exploreActionGeneration++};
 await c.beginEncounter([{speciesId:'slime',level:1000}]);
 assert.equal(c.game.world.encountering,false);assert.equal(c.game.paused,false);
});

test('native cancellation during a transition releases pause even when it already cleared encountering',async()=>{
 const f=await fixture(),c=f.context;dispose(f);c.battle=null;c.screen='explore';
 c.game={running:true,paused:false,world:{encountering:false},player:{path:[],p:0}};
 c.wait=async()=>{c.cancelPendingExploreActions()};
 await c.beginEncounter([{speciesId:'slime',level:1000}]);
 assert.equal(c.game.world.encountering,false);assert.equal(c.game.paused,false);
});
test('cancelled transition cannot release a newer encounter or another screen modal',async()=>{
 for(const newer of [false,true]){
  const f=await fixture(),c=f.context;dispose(f);c.battle=null;c.screen='explore';
  const origin=c.game={running:true,paused:false,world:{encountering:false},player:{path:[],p:0}};
  c.wait=async()=>{c.exploreActionGeneration++;if(newer)origin.encounterToken417={};else c.document.querySelector=selector=>selector==='.game-modal'?{}:null};
  await c.beginEncounter([{speciesId:'slime',level:1000}]);
  assert.equal(origin.paused,true);assert.equal(origin.world.encountering,newer);
 }
});
test('normal floor100 encounters still start with HP1 / MP0 and the selected floor is retained',async()=>{
 const f=await fixture(),c=f.context;dispose(f);c.battle=null;c.screen='explore';
 c.save.state.settings.contextualGuide.disabled=true;
 c.save.state.monsters.forEach(u=>{u.currentHp=1;u.currentMp=0});
 c.game={running:true,paused:false,world:{encountering:false,currentAttribute:'light'},player:{path:[],p:0}};
 c.currentSnapshot=()=>null; // World geometry is tested separately; retain native battle construction.
 c.battleIntro=async()=>{};c.saveBattleCheckpoint=f.nativeSave;
 await c.beginEncounter([{speciesId:'slime',level:1000}]);
 assert.ok(c.battle);assert.equal(c.battle.resultSettled??false,false);
 assert.equal(c.save.state.player.currentFloor,100);assert.equal(c.save.state.player.inRun,true);
 assert.equal(c.save.state.activeBattle.floor,100);assert.ok(c.battle.turnQueue.length>0);
 assert.ok(c.battle.party.every(u=>u.currentHp>0&&u.currentMp===0));
 dispose({...f,context:c});
});
test('HP1 / MP0 / poison at floor100 completes enemy turns and defeat once, including late timers',async()=>{
 const f=await fixture(),c=f.context,b=f.b;
 c.lose=f.nativeLose;c.saveBattleCheckpoint=f.nativeSave;b.auto=true;c.render=noop;
 for(const u of f.party){u.currentHp=1;u.currentMp=0;u._unyieldingUsed=true;b.allyAilments[u.id]=[{id:'poison',power:1,persistent:true}];}
 f.enemies[0].atk=1e8;f.enemies[0].spd=1e8;f.enemies[0].hp=f.enemies[0].maxHp=1e9;
 c.chooseEnemyAction=()=>c.ENEMY_ACTIONS.attack;
 buildTurnQueue(b);let steps=0;
 while(!b.resultSettled&&steps++<20)await f.nativeContinue();
 assert.ok(b.resultSettled,'enemy turns did not reach the result');assert.equal(c.save.state.player.inRun,false);
 const gold=c.save.state.player.gold,hp=f.party.map(u=>u.currentHp),before=f.mounts();
 for(const timer of [...f.timers])await timer.fn();for(const frame of [...f.frames])frame();
 f.nativeSave();assert.equal(f.mounts(),before);assert.deepEqual(f.party.map(u=>u.currentHp),hp);
 assert.equal(c.save.state.player.gold,gold);assert.ok(c.save.state.activeBattle===undefined);
 f.button.onclick();assert.equal(c.battle,null);assert.equal(c.screen,'home');dispose(f);
});
test('late turn completion after settlement cannot advance the queue or modify saved rescue HP',async()=>{
 const f=await fixture(),c=f.context;defeat(f);
 const index=f.b.queueIndex,turn=f.b.turn,hp=f.party.map(u=>u.currentHp);
 await c.finishCurrentAction();await c.endRound();await c.enemyTurn();
 assert.equal(f.b.queueIndex,index);assert.equal(f.b.turn,turn);assert.deepEqual(f.party.map(u=>u.currentHp),hp);dispose(f);
});
test('legitimate memory and special battle saves remain resumable outside a normal expedition',async()=>{
 for(const type of ['memory','chapterTwo','team','campaignHero']){
  const f=await fixture(),c=f.context;
  if(type==='memory')f.b.memoryBattle=true;else {f.b.specialBattle=true;f.b.specialBattleType=type;}
  c.save.state.player.inRun=false;f.nativeSave();dispose(f);
  const loaded=new SaveService();assert.ok(loaded.state.activeBattle,type);
 }
});

test('reported Serene / Fairy / Shade Cat / Thorn Bud encounter uses native AI and exits at low HP (10 seeds)',async()=>{
 for(let seed=1;seed<=10;seed++){
  const f=await fixture(['myth_hide','ch2_carmia','ch2_seria','ch2_althea']),c=f.context;
  dispose(f);c.battle=null;c.screen='explore';c.render=noop;
  c.save.state.settings.contextualGuide.disabled=true;c.save.state.settings.autoBattle=true;
  for(const u of f.party){u.currentHp=1;u.currentMp=0;u.ailments=[{id:'poison',power:.03,persistent:true}];}
  c.game={running:true,paused:false,world:{encountering:false,currentAttribute:'light'},player:{path:[],p:0}};
  c.currentSnapshot=()=>null;c.battleIntro=async()=>{};c.saveBattleCheckpoint=f.nativeSave;c.lose=f.nativeLose;
  c.win=()=>{throw new Error('unexpected victory in lethal regression fixture')};
  const previous=Math.random;Math.random=rng(seed);
  try{
   await c.beginEncounter(['time_dragon','fairy','shade_cat','thorn_bud'].map(speciesId=>({speciesId,level:1000})));
   await f.timers.find(t=>t.ms===c.scaledBattleDelay(120)).fn();const b=c.battle;let actions=0;
   while(!b.resultSettled&&actions++<80)await f.nativeContinue();
   assert.ok(b.resultSettled,`seed ${seed}: enemy flow stopped ${JSON.stringify({turn:b.turn,index:b.queueIndex,busy:b.busy,auto:b.auto,committed:b.actionCommitted,entry:b.turnQueue[b.queueIndex],hp:b.party.map(u=>u.currentHp),log:b.log.slice(-8)})}`);assert.equal(c.save.state.player.inRun,false);
   assert.ok(c.save.state.activeBattle===undefined);assert.ok(f.party.every(u=>u.currentHp===1&&u.currentMp===0));
   const before=f.mounts();for(const timer of [...f.timers])await timer.fn();
   assert.equal(f.mounts(),before);f.nativeSave();assert.ok(c.save.state.activeBattle===undefined);
   f.button.onclick();assert.equal(c.screen,'home');assert.equal(c.battle,null);
  }finally{Math.random=previous;dispose(f);}
 }
});
