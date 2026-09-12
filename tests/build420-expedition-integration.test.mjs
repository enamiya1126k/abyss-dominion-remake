import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {run} from '../tools/build423/native-harness.mjs';
import {SaveService} from '../src/services/SaveService.js';
import {SAVE_KEY} from '../src/core/config.js';
import {cleanupTrial415} from '../src/battle/TrialAdaptation415.js';
import {cleanupSingles410} from '../src/battle/SingleTraits410.js';

const ids=['ch2_carmia','ch2_seria','ch2_rostia','ch2_althea'];
const noop=()=>{};
const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
async function field(floor){
 localStorage.removeItem(SAVE_KEY);
 const f=await run(ids,['slime'],{inspect:true,floor,level:1000});
 cleanupSingles410(f.b);cleanupTrial415(f.b);
 const c=f.context,save=new SaveService();save.state=c.save.state;c.save=save;c.battle=null;c.game=null;c.screen='explore';
 Object.assign(c,{TILE:88,performance:{now:()=>1000},expeditionSaveTimer:null,exploreAutoNavigationState:null,
  go:screen=>{c.screen=screen},showExploreNotice:noop,showToast:noop,requestAnimationFrame:noop,clearInterval:noop});
 vm.runInContext(source.split('\n').filter(l=>l.startsWith('class Entity')||l.startsWith('class Camera')).join('\n')+'\nthis.Entity=Entity;this.Camera=Camera;',c);
 save.state.settings.exploreAutoMode='off';save.state.settings.contextualGuide.disabled=true;
 c.beginManualExpedition(save.state,floor);const world=c.maze();
 c.game={world,player:new c.Entity(world.start.x,world.start.y),camera:new c.Camera(),partyTrail:[],running:true,paused:false};
 return {...f,c};
}

test('real exit contact transfers 99→100 once and survives SaveService reload with a fresh floor100 map',async()=>{
 const {c}=await field(99),g=c.game,s=c.save.state;
 c.campaignFloorState(s,99).bossDefeated=true;g.world.bossDefeated=true;
 for(const boss of g.world.bosses)boss.active=false;
 Object.assign(g.world.exit,{active:true,locked:false});
 const exit=g.world.exit,from=[{x:exit.x-1,y:exit.y},{x:exit.x+1,y:exit.y},{x:exit.x,y:exit.y-1},{x:exit.x,y:exit.y+1}].find(p=>g.world.tiles[p.y]?.[p.x]===1);
 assert.ok(from);g.player=new c.Entity(from.x,from.y);g.player.setPath([{x:exit.x,y:exit.y}]);
 c.persistExpeditionSnapshot(c.expeditionSnapshotFromGame());
 c.update(.2);
 assert.equal(s.player.currentFloor,100);assert.equal(s.player.maxFloor,100);assert.equal(g.running,false);
 assert.equal(s.expeditionSnapshot,null);assert.equal(c.screen,'explore');
 c.save=new SaveService();assert.equal(c.save.state.player.currentFloor,100);assert.equal(c.save.state.player.inRun,true);
 const world=c.maze();assert.equal(world.exit.kind,'final-gate');assert.equal(world.exit.locked,true);
 assert.ok(world.bosses.some(b=>b.active));assert.equal(c.save.state.activeBattle,undefined);
});

test('actual floor100 map, player position and HP1/MP0 survive field save/hydration; old floor99 snapshot is rejected',async()=>{
 const {c,party}=await field(100),g=c.game;
 party.forEach(u=>{u.currentHp=1;u.currentMp=0});
 const pos=g.world.sections[0].cells.find(p=>p.x!==g.player.x||p.y!==g.player.y);assert.ok(pos);
 Object.assign(g.player,{x:pos.x,y:pos.y,rx:pos.x,ry:pos.y});
 g.player.setPath([{x:pos.x+1,y:pos.y}]);g.world.encountering=true;
 c.persistExpeditionSnapshot(c.expeditionSnapshotFromGame());c.save=new SaveService();
 const saved=c.save.state.expeditionSnapshot;assert.equal(saved.floor,100);assert.equal(saved.world.encountering,false);assert.equal(saved.player.path.length,0);
 const hydrated=c.hydrateExpeditionSnapshot(saved);assert.ok(hydrated);assert.equal(hydrated.running,true);assert.equal(hydrated.paused,false);
 assert.equal(hydrated.player.x,pos.x);assert.equal(hydrated.player.y,pos.y);assert.equal(hydrated.world.encountering,false);
 assert.ok(c.save.state.monsters.filter(u=>ids.includes(u.id)).every(u=>u.currentHp===1&&u.currentMp===0));
 assert.equal(c.hydrateExpeditionSnapshot({...saved,floor:99}),null);
});

test('departure selection re-enters floor100 from rescue floor1 and clears the old field snapshot before saving',async()=>{
 const {c}=await field(100),s=c.save.state;
 c.persistExpeditionSnapshot(c.expeditionSnapshotFromGame());s.player.currentFloor=1;s.player.inRun=false;s.player.maxFloor=100;
 let html='',removed=false;const classes={add:noop},input={value:'100',addEventListener:noop},primary={};
 const modal={classList:classes,remove(){removed=true},querySelector:q=>q==='#floorSelect'?input:q==='[data-modal-primary]'?primary:{classList:classes},querySelectorAll:()=>[]};
 c.app.insertAdjacentHTML=(_,text)=>{html=text};c.topModal=()=>modal;
 c.openExploreFloorSelector({chapterOneOnly:true});assert.match(html,/id="floorSelect"/);
 primary.onclick();
 assert.equal(removed,true);assert.equal(s.player.currentFloor,100);assert.equal(s.player.inRun,true);assert.equal(s.expeditionSnapshot,null);
 assert.equal(s.settings.exploreAutoMode,'off');assert.equal(c.screen,'explore');
 const loaded=new SaveService();assert.equal(loaded.state.player.currentFloor,100);assert.equal(loaded.state.player.inRun,true);assert.equal(loaded.state.expeditionSnapshot,null);
});
