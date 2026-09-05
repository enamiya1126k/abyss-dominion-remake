// node --experimental-vm-modules --test tests/build341-hero-pursuit.test.mjs
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
import * as P from '../src/core/CampaignHeroPursuitSystem.js';
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function declaration(source,name){const start=source.indexOf('function '+name+'(');assert.ok(start>=0,name);const tail=source.slice(start);const end=tail.slice(1).search(/\n(?:export )?(?:async )?function /);return end<0?tail:tail.slice(0,end+1)}
function worldFor(width=38,height=14){const world={cols:width,rows:height,tiles:[],sections:[{id:'room',cellKeys:[]}],sectionByCell:{},currentSectionId:'room',start:{x:2,y:6},exit:{x:width-2,y:height-2,active:false,locked:true},chests:[],campaignKeys:[],steps:0};for(let y=0;y<height;y++){world.tiles[y]=[];for(let x=0;x<width;x++){const wall=x===0||y===0||x===width-1||y===height-1;world.tiles[y][x]=wall?1:0;if(!wall){world.sections[0].cellKeys.push(`${x},${y}`);world.sectionByCell[`${x},${y}`]='room'}}}return world}
function actor(overrides={}){return{encounterId:'hero-ambush-hide-1',heroId:'myth_hide',floor:23,x:2,y:6,rx:2,ry:6,sectionId:'room',chaseSteps:0,portalTransfers:0,playerChoice337:'flee',state:'pursuing',graceSeconds:0,...overrides}}
const ids=['myth_enami','myth_yori','myth_hide','myth_rion'];
const moduleContext=vm.createContext({Date,Math,Number,Object,Array,Set,Map,String,Boolean,JSON,structuredClone});
const modules={Campaign100System:new vm.SourceTextModule(`export const CAMPAIGN_MAX_FLOOR=100;export const HERO_PARTY_IDS=${JSON.stringify(ids)};`,{context:moduleContext})};await modules.Campaign100System.link(()=>{});await modules.Campaign100System.evaluate();
for(const name of ['CampaignHeroPursuitSystem','CampaignHeroEncounterSystem','CampaignHeroBranchStorySystem']){const m=new vm.SourceTextModule(fs.readFileSync(new URL('../src/core/'+name+'.js',import.meta.url),'utf8'),{context:moduleContext});await m.link(spec=>modules[spec.split('/').at(-1).split('.js')[0]]);await m.evaluate();modules[name]=m}
const H=modules.CampaignHeroEncounterSystem.namespace,B=modules.CampaignHeroBranchStorySystem.namespace;
function activeLedger(){let ledger=H.createCampaignHeroEncounterState();ledger.events['hero-ambush-hide-1'].preludeSeen=true;ledger=H.activateCampaignHeroEncounter(ledger,{encounterId:'hero-ambush-hide-1',floor:23}).state;ledger.heroes.myth_hide.remainingHpRate=.63;return ledger}
function harness(p=actor(),world=worldFor()){
 const events=[],state={settings:{exploreAutoMode:'off'},player:{currentFloor:23,inRun:true},campaign100:{heroEncounters310:activeLedger()}};
 const game={running:true,paused:false,world:{...world,campaignHeroPursuit:p},player:{x:28,y:6,rx:28,ry:6,path:[]},camera:{c:{width:390,height:650},world:(x,y)=>({x,y})}};
 let saveOK=true,modal=null;
 const ctx=vm.createContext({...P,Math,Number,Object,Array,String,Boolean,Set,Map,JSON,structuredClone,game,snapshot:null,battle:null,TILE:32,
  save:{state,save:()=>saveOK},document:{querySelector:()=>modal},
  campaignHeroLedger:()=>{const ledger=H.normalizeCampaignHeroEncounterState(state.campaign100.heroEncounters310);state.campaign100.heroEncounters310=ledger;return ledger},normalizeCampaignState:()=>state.campaign100,
  campaignHeroCheckpointResumable:()=>false,activeExploreSection:()=>game.world.sections[0],campaignWorldBosses:()=>[],
  showCampaignHeroEncounterChoice:()=>events.push('choice'),refreshCampaignHeroChaseHud:()=>{},
  beginCampaignHeroContactBattle:()=>{if(!game.world.encountering){game.world.encountering=true;events.push('fight')}},resolveEscapedCampaignHeroPursuit:()=>{events.push('escape');game.world.campaignHeroPursuit=null},
  armCampaignHeroEncounter:()=>events.push('spawn'),showToast:t=>events.push(t),stopExploreAuto:()=>{},cancelPendingExploreActions:()=>{game.player.path=[]},
  expeditionSnapshotFromGame:()=>({floor:state.player.currentFloor,world:game.world,player:game.player}),persistExpeditionSnapshot:s=>{ctx.persistCampaignHeroField(s);state.expeditionSnapshot=structuredClone(s);return state.expeditionSnapshot}
 });
 for(const name of ['campaignHeroSpawnPoint','repairCampaignHeroPursuit','persistCampaignHeroField','restoreCampaignHeroFieldPursuit','prepareCampaignHeroFloorTransfer','campaignHeroTouchesPlayer','campaignHeroChoicePending','engageCampaignHeroFromHud','updateCampaignHeroFieldMotion','updateCampaignHeroPursuitOnStep','transferCampaignHeroPursuit'])vm.runInContext(declaration(main,name),ctx);
 return{ctx,game,state,events,setSaveOK:v=>saveOK=v,setModal:v=>modal=v};
}

test('reachable visible spawn is 4–10 walking tiles away, not the farthest cell',()=>{
 const world=worldFor(),player={x:15,y:6},visible=p=>p.x>=16&&p.x<=23&&p.y===6;
 const spawn=P.chooseHeroSpawn(world,player,{visible,blocked:[{x:21,y:6}]});assert.ok(spawn);assert.ok(visible(spawn));assert.notDeepEqual(spawn,{x:21,y:6});
 const distance=P.heroFieldRoute(world,spawn,player).length;assert.ok(distance>=4&&distance<=10);
});
test('all four heroes visibly walk around a wall and reach a stationary player',()=>{
 for(const heroId of ids){const world=worldFor(20),p=actor({heroId}),player={x:16,y:6,path:[]};for(let y=1;y<10;y++)world.tiles[y][9]=1;
  let fractional=false,contact=false;for(let tick=0;tick<1400&&!contact;tick++){const r=P.advanceHeroField(p,{world,player,dt:.025});fractional||=!Number.isInteger(p.rx)||!Number.isInteger(p.ry);assert.equal(world.tiles[p.y][p.x],0);contact=r.contact}
  assert.ok(fractional,heroId+' interpolates');assert.ok(contact,heroId+' arrives');assert.equal(p.chaseSteps,0,'time and enemy steps do not count as player steps');
 }
});
test('menus and battles pause movement and preserve the walk in progress',()=>{
 const world=worldFor(),p=actor(),player={x:20,y:6};P.advanceHeroField(p,{world,player,dt:.05});const before=JSON.stringify(p);
 for(let i=0;i<200;i++)P.advanceHeroField(p,{world,player,dt:.05,paused:true});assert.equal(JSON.stringify(p),before);
 P.advanceHeroField(p,{world,player,dt:.05});assert.notEqual(JSON.stringify(p),before);
 const h=harness();h.setModal({});const state=JSON.stringify(h.game.world.campaignHeroPursuit);h.ctx.updateCampaignHeroFieldMotion(.05);assert.equal(JSON.stringify(h.game.world.campaignHeroPursuit),state);
 h.setModal(null);h.ctx.battle={};h.ctx.updateCampaignHeroFieldMotion(.05);assert.equal(JSON.stringify(h.game.world.campaignHeroPursuit),state);
});
test('499 actual steps never escape; 500 escapes only with enough separation',()=>{
 const h=harness();for(let i=0;i<499;i++)h.ctx.updateCampaignHeroPursuitOnStep();assert.equal(h.events.includes('escape'),false);assert.equal(h.game.world.campaignHeroPursuit.chaseSteps,499);
 h.ctx.updateCampaignHeroPursuitOnStep();assert.deepEqual(h.events,['escape']);
 const near=harness(actor({x:20,rx:20,chaseSteps:499}));near.game.player.x=23;for(let i=0;i<50;i++)near.ctx.updateCampaignHeroPursuitOnStep();assert.equal(near.events.length,0);assert.equal(near.game.world.campaignHeroPursuit.chaseSteps,549);
});
test('contact on step 500 starts combat before escape; adjacent heroes cannot be skipped',()=>{
 for(const x of [27,28,29]){const h=harness(actor({x,rx:x,chaseSteps:499}));h.ctx.updateCampaignHeroPursuitOnStep();assert.deepEqual(h.events,['fight'])}
});
test('ten section transfers retain the hero and step count, with a safe arrival',()=>{
 const h=harness(actor({chaseSteps:270}));for(let i=0;i<10;i++)h.ctx.transferCampaignHeroPursuit(h.game.world.sections[0]);
 const p=h.game.world.campaignHeroPursuit;assert.equal(p.chaseSteps,270);assert.equal(p.portalTransfers,10);assert.equal(p.pendingArrival341,true);assert.equal(h.events.length,0);
 assert.equal(P.advanceHeroField(p,{world:h.game.world,player:h.game.player,dt:.05}).contact,false);
 h.game.player.x-=5;P.advanceHeroField(p,{world:h.game.world,player:h.game.player,dt:.05});assert.equal(p.pendingArrival341,false);assert.ok(Math.abs(p.x-h.game.player.x)>=4);
});
test('23→24→30→31 floor handoffs survive serialization, keep wounds, and block another hero',()=>{
 const h=harness(actor({chaseSteps:234}));
 for(const floor of [24,30,31]){
  h.ctx.prepareCampaignHeroFloorTransfer(floor);h.state.player.currentFloor=floor;
  h.state.campaign100.heroEncounters310=H.normalizeCampaignHeroEncounterState(JSON.parse(JSON.stringify(h.state.campaign100.heroEncounters310)));
  h.game.world=worldFor();h.game.player={...h.game.world.start,path:[]};h.ctx.restoreCampaignHeroFieldPursuit();
  const p=h.game.world.campaignHeroPursuit;assert.equal(p.heroId,'myth_hide');assert.equal(p.floor,floor);assert.equal(p.chaseSteps,234);assert.equal(p.pendingArrival341,true);
  assert.equal(h.state.campaign100.heroEncounters310.heroes.myth_hide.remainingHpRate,.63);assert.equal(h.state.campaign100.heroEncounters310.processedResultIds.length,0);
  assert.equal(B.nextCampaignHeroBranchStoryScene(h.state.campaign100.heroEncounters310,{floor}),null);
 }
});
test('reload resumes the same field pursuit; old 14/22 pursuit is migrated without an escape',()=>{
 const h=harness(actor({chaseSteps:14}));h.ctx.persistCampaignHeroField({floor:23,world:h.game.world});h.game.world.campaignHeroPursuit=null;h.ctx.restoreCampaignHeroFieldPursuit();
 assert.equal(h.game.world.campaignHeroPursuit.chaseSteps,14);h.ctx.updateCampaignHeroPursuitOnStep();assert.equal(h.events.length,0);
 const saved=structuredClone(h.state.campaign100.heroEncounters310);const settled=H.settleCampaignHeroEncounter(saved,{encounterId:'hero-ambush-hide-1',resultId:'real-combat',heroId:'myth_hide',outcome:'repelled',floor:31,hpRate:0});
 assert.equal(settled.state.fieldPursuit341,null);assert.equal(settled.state.activeEncounterId,null);
 h.state.campaign100.heroEncounters310=settled.state;h.ctx.restoreCampaignHeroFieldPursuit();assert.equal(h.game.world.campaignHeroPursuit,null,'completed encounter never resurrected');
});
test('fight button starts once, save failure does not settle, menus reject clicks',()=>{
 const h=harness();h.setModal({});assert.equal(h.ctx.engageCampaignHeroFromHud(),false);assert.equal(h.events.length,0);h.setModal(null);
 h.setSaveOK(false);assert.equal(h.ctx.engageCampaignHeroFromHud(),false);assert.ok(!h.events.includes('fight'));assert.ok(!h.events.includes('escape'));assert.equal(h.game.world.campaignHeroPursuit.playerChoice337,'flee');
 h.setSaveOK(true);assert.equal(h.ctx.engageCampaignHeroFromHud(),true);assert.equal(h.ctx.engageCampaignHeroFromHud(),false);assert.equal(h.events.filter(e=>e==='fight').length,1);
});
test('screen indicator uses CSS pixels correctly at device pixel ratios 1, 2 and 3',()=>{
 for(const ratio of [1,2,3]){const args={canvasWidth:390*ratio,canvasHeight:650*ratio,cssWidth:390,cssHeight:650,top:100,bottom:64};
  assert.equal(P.heroScreenIndicator({...args,screenPoint:{x:200*ratio,y:350*ratio}}).inside,true);
  const outside=P.heroScreenIndicator({...args,screenPoint:{x:500*ratio,y:350*ratio}});assert.equal(outside.inside,false);assert.equal(outside.arrow,'→');assert.ok(outside.x<=372);
 }
});
test('SaveService keeps pursuit counters above 999 and arrival metadata',()=>{
 const code=fs.readFileSync(new URL('../src/services/SaveService.js',import.meta.url),'utf8'),ctx=vm.createContext({EXPEDITION_MAP_MAX_DIMENSION:512,plainRecord:v=>Boolean(v&&typeof v==='object'&&!Array.isArray(v)),finiteNumber:(v,f,min,max)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):f,Number,Math,Array,Object,Map,Set,String,Date});
 vm.runInContext(declaration(code,'normalizeExpeditionSnapshot'),ctx);
 const world=worldFor();world.campaignHeroPursuit=actor({chaseSteps:1205,portalTransfers:40,pendingArrival341:true,arrivalAnchor341:{x:2,y:6}});
 const result=ctx.normalizeExpeditionSnapshot({floor:31,world,player:{x:2,y:6}});
 assert.equal(result.world.campaignHeroPursuit.chaseSteps,1205);assert.equal(result.world.campaignHeroPursuit.portalTransfers,40);assert.equal(result.world.campaignHeroPursuit.pendingArrival341,true);
});

test('nearby visible cells across a wall are not used unless reachable within ten steps',()=>{
 const world=worldFor(28,22),player={x:10,y:5};for(let y=1;y<20;y++)world.tiles[y][11]=1;
 const spawn=P.chooseHeroSpawn(world,player,{visible:p=>p.x>=12});assert.ok(spawn);assert.ok(spawn.x<11);assert.ok(P.heroFieldRoute(world,spawn,player).length<=10);
});

test('the final gate rejoins the living pursuer without an escape and rolls back on save failure',()=>{
 for(const saveOK of [false,true]){
  const ledger=activeLedger();ledger.finalArena.unlocked=true;ledger.fieldPursuit341=actor({floor:100,chaseSteps:310});
  const events=[],save={state:{player:{currentFloor:100,inRun:true},campaign100:{heroEncounters310:ledger},expeditionSnapshot:{floor:100,world:{campaignHeroPursuit:actor()}}},save:()=>saveOK};
  const ctx=vm.createContext({CAMPAIGN_MAX_FLOOR:100,Math,Boolean,JSON,structuredClone,save,game:{paused:true},screen:'explore',settleCampaignHeroEncounter:H.settleCampaignHeroEncounter,
   campaignHeroLedger:()=>save.state.campaign100.heroEncounters310,normalizeCampaignState:()=>save.state.campaign100,
   clearExpeditionSnapshot:options=>{assert.equal(options.settleHeroPursuit,false);save.state.expeditionSnapshot=null},stopGame:()=>events.push('stop'),go:s=>events.push(s),showToast:()=>{},render:()=>{}});
  vm.runInContext(declaration(main,'rejoinCampaignHeroAtFinalGate')+'\n'+declaration(main,'enterCampaignFinalFloor'),ctx);
  assert.equal(ctx.enterCampaignFinalFloor(),saveOK);const after=save.state.campaign100.heroEncounters310;
  assert.equal(after.heroes.myth_hide.remainingHpRate,.63);assert.equal(after.heroes.myth_hide.defeated,false);
  if(saveOK){assert.equal(after.activeEncounterId,null);assert.equal(after.fieldPursuit341,null);assert.equal(after.events['hero-ambush-hide-1'].outcome,'joined-final');assert.equal(save.state.expeditionSnapshot,null);assert.deepEqual(events,['stop','campaignFinalFloor'])}
  else{assert.equal(after.activeEncounterId,'hero-ambush-hide-1');assert.equal(after.fieldPursuit341.chaseSteps,310);assert.ok(save.state.expeditionSnapshot);assert.equal(events.length,0)}
 }
});
