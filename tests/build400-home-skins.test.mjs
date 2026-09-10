import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {SaveService} from '../src/services/SaveService.js';
import {SAVE_KEY} from '../src/core/config.js';
import {HOME_SKINS400,homeSkinsUnlocked400,homeSkinState400,commitHomeSkin400} from '../src/core/HomeSkinSystem400.js';
import {homeSkinScene400,homeEnvironment400,homeSkinSettings400,bindHomeSkinSettings400,mountHomeEnvironment400} from '../src/ui/HomeSkin400.js';
import {HomeScreen} from '../src/ui/screens/HomeScreen.js';
import {SettingsScreen} from '../src/ui/screens/SettingsScreen.js';
const sharp=createRequire(import.meta.url)('sharp');
const state=(unlocked=true)=>({player:{maxFloor:unlocked?100:90,gold:123456,crystals:777},campaign100:{finalCompleted:unlocked},settings:{autoBattle:false,musicVolume:.17},monsters:[],party:[],equipment:[],inventory:{potions:22}});
const fresh=()=>{const mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};return{save:new SaveService(),mem};};

test('400 unlocks all five scenes together only on valid second-chapter eligibility',()=>{
 const cases=[
  [{player:{maxFloor:99},campaign100:{finalCompleted:true}},false],
  [{player:{maxFloor:100},campaign100:{finalCompleted:false}},false],
  [state(),true],
  [{campaign100:{floors:{100:{bossDefeated:true}},heroEncounters310:{finalArena:{completed:true,lastEnding:'narrow'}}}},true],
  [{campaign100:{finalUnlocked:true,heroEncounters310:{finalArena:{completed:true,lastEnding:'defeat'}}}},false],
  [{campaign100:{finalUnlocked:true,reincarnation319:{history:[{victorious:true,ending:'complete'}]}}},true],
  [{campaign100:{floors:{100:{cleared:true}},heroEncounters310:{finalArena:{completed:true,lastEnding:'all-preempted'}}}},true],
 ];
 for(const [s,expected] of cases){const before=structuredClone(s);assert.equal(homeSkinsUnlocked400(s),expected);const html=homeSkinSettings400(s);assert.equal((html.match(/data-select-home-skin400=/g)??[]).length,expected?6:0);assert.deepEqual(s,before);}
});

test('400 first-chapter and unknown selections retain original home without writes or new asset loads',async()=>{
 const s=state(false);s.settings.homeSkin400={id:'core',motion:false};const before=structuredClone(s);
 assert.equal(homeSkinState400(s).skin.id,'town');assert.equal(homeSkinState400(s).motion,true);assert.equal(homeSkinSettings400(s),'');assert.match(homeEnvironment400(s),/home-river-shimmer/);assert.doesNotMatch(homeEnvironment400(s),/home-skins400/);
 let writes=0;assert.equal((await commitHomeSkin400({state:s,save(){writes++;return true}},{id:'core'})).ok,false);assert.equal(writes,0);assert.deepEqual(s,before);
 for(const bad of ['../../secret','__proto__','<script>',null,[],{}]){const t=state();t.settings.homeSkin400={id:bad};const b=structuredClone(t);assert.equal(homeSkinState400(t).skin.id,'town');assert.deepEqual(t,b);}
});

test('400 five unique compressed portrait backgrounds and small thumbnails exist',async()=>{
 assert.equal(HOME_SKINS400.length,6);const hashes=new Set();let bytes=0;
 for(const skin of HOME_SKINS400.slice(1)){
  for(const [key,w,h] of [['image',1024,1536],['thumbnail',256,384]]){
   const file=new URL('../'+skin[key].split('?')[0],import.meta.url),buf=fs.readFileSync(file),meta=await sharp(buf).metadata();
   assert.equal(meta.format,'webp');assert.equal(meta.width,w);assert.equal(meta.height,h);assert.ok(buf.length<(key==='image'?800000:80000));bytes+=buf.length;if(key==='image')hashes.add(buf.toString('base64'));
  }
 }
 assert.equal(hashes.size,5);assert.ok(bytes<3500000);
});

test('400 selecting every skin and toggling motion persists across real SaveService reloads',async()=>{
 const {save,mem}=fresh();save.state.player.maxFloor=100;save.state.campaign100.finalCompleted=true;save.state.player.gold=123456;save.state.settings.musicVolume=.17;save.state=save.migrate(structuredClone(save.state));save.save();
 const party=[...save.state.party],monsters=save.state.monsters.map(m=>m.id),before=JSON.stringify(save.state.campaign100);
 for(const skin of HOME_SKINS400)for(const motion of [false,true]){
  assert.ok((await commitHomeSkin400(save,{id:skin.id,motion})).ok);
  const loaded=new SaveService();assert.equal(homeSkinState400(loaded.state).skin.id,skin.id);assert.equal(homeSkinState400(loaded.state).motion,motion);
  assert.equal(loaded.state.player.gold,123456);assert.equal(loaded.state.settings.musicVolume,.17);assert.deepEqual(loaded.state.party,party);assert.deepEqual(loaded.state.monsters.map(m=>m.id),monsters);assert.equal(JSON.stringify(loaded.state.campaign100),before);
 }
 assert.ok(mem.get(SAVE_KEY).includes('homeSkin400'));assert.equal(save.state.schemaVersion,84);
});

test('400 failed, throwing or protected saves restore the exact prior preference',async()=>{
 for(const prior of [undefined,{id:'forest',motion:false}])for(const failure of ['false','throw']){
  const s=state();if(prior)s.settings.homeSkin400=prior;const before=structuredClone(s);
  const save={state:s,save(){if(failure==='throw')throw Error('full');return false;}};
  assert.equal((await commitHomeSkin400(save,{id:'core',motion:true})).ok,false);assert.deepEqual(s,before);
 }
 const {save}=fresh();save.state.player.maxFloor=100;save.state.campaign100.finalCompleted=true;save.loadFailed=true;const before=structuredClone(save.state);
 assert.equal((await commitHomeSkin400(save,{id:'forest'})).ok,false);assert.deepEqual(save.state,before);
 let writes=0;const mock={state:state(),save(){writes++;return true}};assert.equal((await commitHomeSkin400(mock,{id:'bogus'})).ok,false);assert.equal((await commitHomeSkin400(mock,{motion:'yes'})).ok,false);assert.equal(writes,0);
});

test('400 home uses one selected scene with decorative, non-interactive responsive motion',()=>{
 const {save}=fresh();save.state.player.maxFloor=100;save.state.campaign100.finalCompleted=true;
 for(const skin of HOME_SKINS400.slice(1)){
  save.state.settings.homeSkin400={id:skin.id,motion:true};const html=HomeScreen(save.state),scene=homeSkinScene400(save.state);
  assert.ok(html.includes(`data-home-skin400="${skin.id}"`));assert.equal((html.match(/data-home-skin-scene400/g)??[]).length,1);assert.doesNotMatch(html,/home-river-shimmer/);assert.match(scene,/preserveAspectRatio="xMidYMid slice"/);assert.match(scene,/aria-hidden="true" focusable="false"/);
  for(const other of HOME_SKINS400.slice(1))if(other.id!==skin.id)assert.ok(!html.includes(`/home-skins400/${other.id}.webp`));
  const preview=homeSkinScene400(save.state,'preview');const ids=[...scene.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.ok(ids.every(id=>!preview.includes(`id="${id}"`)));
 }
 const old=state(false);assert.equal(homeSkinSettings400(old),'');
 const settings=SettingsScreen(save.state);assert.match(settings,/id="backHome"/);assert.match(settings,/id="toggleAudio"/);assert.match(settings,/id="resetSave"/);assert.equal((settings.match(/aria-pressed="true" class="home-skin-choice/g)??[]).length,1);
});

test('400 visibility listener pauses scenes and is removed on rerender/navigation',()=>{
 const listeners=new Set(),doc={hidden:false,addEventListener:(name,fn)=>{assert.equal(name,'visibilitychange');listeners.add(fn)},removeEventListener:(_,fn)=>listeners.delete(fn)};
 const root={isConnected:true,dataset:{}},next={isConnected:true,dataset:{}};
 mountHomeEnvironment400(root,doc);assert.equal(listeners.size,1);assert.equal(root.dataset.environmentPaused400,'false');doc.hidden=true;for(const fn of listeners)fn();assert.equal(root.dataset.environmentPaused400,'true');
 mountHomeEnvironment400(next,doc);assert.equal(listeners.size,1);assert.equal(next.dataset.environmentPaused400,'true');doc.hidden=false;for(const fn of listeners)fn();assert.equal(next.dataset.environmentPaused400,'false');
 mountHomeEnvironment400(null,doc);assert.equal(listeners.size,0);
});

function mockPanel(save){
 const root={querySelector:()=>root.panel};
 function create(){
  const panel={isConnected:true,dataset:{},status:{textContent:''},buttons:[],contains:b=>panel.buttons.includes(b),setAttribute(){},removeAttribute(){},addEventListener:(_,fn)=>panel.click=fn};
  for(const skin of HOME_SKINS400)panel.buttons.push({dataset:{selectHomeSkin400:skin.id},hasAttribute:()=>true,disabled:false,focus(){this.focused=true}});
  panel.buttons.push({dataset:{},hasAttribute:()=>false,disabled:false,focus(){this.focused=true}});
  panel.querySelectorAll=()=>panel.buttons;panel.querySelector=q=>q==='[data-home-skin-status400]'?panel.status:q==='[data-toggle-home-motion400]'?panel.buttons.at(-1):panel.buttons.find(b=>q.includes(`"${b.dataset.selectHomeSkin400}"`));
  Object.defineProperty(panel,'outerHTML',{set(html){assert.ok(html.includes(homeSkinState400(save.state).skin.name));panel.isConnected=false;root.panel=create();}});return panel;
 }
 root.panel=create();bindHomeSkinSettings400(root,save);return root;
}
test('400 option clicks block duplicate saves, update only the panel and restore focused selection',async()=>{
 let resolve,writes=0;const save={state:state(),save(){writes++;return new Promise(r=>resolve=r)}};const root=mockPanel(save),panel=root.panel,button=panel.buttons[2];
 const first=panel.click({target:{closest:()=>button}});await panel.click({target:{closest:()=>panel.buttons[3]}});assert.equal(writes,1);assert.ok(panel.buttons.every(b=>b.disabled));resolve(true);await first;
 assert.equal(save.state.settings.homeSkin400.id,'invasion');assert.notEqual(root.panel,panel);assert.equal(root.panel.buttons[2].focused,true);assert.match(root.panel.status.textContent,/保存しました/);
 save.save=()=>false;const p=root.panel;await p.click({target:{closest:()=>p.buttons[4]}});assert.equal(root.panel,p);assert.equal(save.state.settings.homeSkin400.id,'invasion');assert.ok(p.buttons.every(b=>!b.disabled));assert.match(p.status.textContent,/保存できません/);
});

test('400 motion off/reduced motion and page hiding stop decorative animation without audio or RAF loops',()=>{
 const css=fs.readFileSync(new URL('../src/Styles/build400-home-skins.css',import.meta.url),'utf8'),ui=fs.readFileSync(new URL('../src/ui/HomeSkin400.js',import.meta.url),'utf8'),main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
 assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/\[data-motion400="off"\] \.skin400-moving\{animation:none!important\}/);assert.match(css,/animation-play-state:paused!important/);assert.match(css,/pointer-events:none/);
 assert.doesNotMatch(ui,/requestAnimationFrame\(|setInterval\(|new Audio\(|AudioContext/);assert.match(main,/function render\(\)\{\s*mountHomeEnvironment400\(null\)/);assert.match(main,/bindHomeSkinSettings400\(app,save\)/);
 for(const id of ['forest','invasion','abyss','sanctum','core']){const s=state();s.settings.homeSkin400={id,motion:false};assert.match(homeSkinScene400(s),/data-motion400="off"/);}
});
