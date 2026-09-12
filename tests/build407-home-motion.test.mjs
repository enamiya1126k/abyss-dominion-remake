import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {HOME_SKINS400} from '../src/core/HomeSkinSystem400.js';
import {homeSkinScene400,homeEnvironment400,mountHomeEnvironment400} from '../src/ui/HomeSkin400.js';
import {homeMotionQuality407,mountHomeMotion407} from '../src/ui/HomeMotion407.js';
import {HomeScreen} from '../src/ui/screens/HomeScreen.js';
import {SaveService} from '../src/services/SaveService.js';
import {APP_VERSION,SAVE_SCHEMA_VERSION} from '../src/core/config.js';

const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const state=(id,motion=true)=>({player:{maxFloor:100},campaign100:{finalCompleted:true},primordial422:{cleared:true},settings:{homeSkin400:{id,motion}}});
const css=read('src/Styles/build407-home-motion.css');

test('original scenes retain their URLs and the new scene loads only its own image',()=>{
 for(const skin of HOME_SKINS400.slice(1)){
  const html=homeSkinScene400(state(skin.id));
  if(skin.id==='primordial-dawn')assert.equal(skin.image,'./assets/ui/primordial/home-dawn424.png');else assert.match(skin.image,new RegExp(`/home-skins400/${skin.id}\\.webp\\?v=3\\.1\\.80-build400$`));
  assert.equal((html.match(/class="skin400-base"/g)??[]).length,1);
  assert.ok(html.includes(`class="skin400-base" href="${skin.image}"`));
  for(const other of HOME_SKINS400.slice(1).filter(s=>s.id!==skin.id))assert.ok(!html.includes(other.image));
  assert.doesNotMatch(html,/<(?:button|a|input|foreignObject)\b/);
  assert.match(html,/aria-hidden="true" focusable="false"/);
 }
 assert.match(homeEnvironment400({player:{maxFloor:1}}),/home-environment-motion/);
});

test('motion has a fixed budget of at most 23 groups and 17 on small or constrained devices',()=>{
 for(const skin of HOME_SKINS400.slice(1)){
  const html=homeSkinScene400(state(skin.id)),animated=(html.match(/class="skin400-moving/g)??[]).length,detail=(html.match(/data-motion-detail407/g)??[]).length;
  assert.ok(animated<=23,skin.id);assert.ok(animated-detail<=17,skin.id);
  assert.ok(Buffer.byteLength(html)<10000,skin.id);
 }
 const source=read('src/ui/HomeSkin400.js')+read('src/ui/HomeMotion407.js');
 assert.doesNotMatch(source,/requestAnimationFrame\(|setInterval\(|setTimeout\(|new Audio\(|AudioContext/);
 assert.doesNotMatch(css,/(?:backdrop-)?filter\s*:|will-change\s*:/);
 assert.match(css,/@media\(max-width:600px\)[\s\S]*?data-motion-detail407/);
});

test('each scene and preview owns all gradient, mask and crop references',()=>{
 for(const skin of HOME_SKINS400.slice(1)){
  const scene=homeSkinScene400(state(skin.id)),preview=homeSkinScene400(state(skin.id),'preview');
  const ids=new Set([...scene.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  for(const [,ref] of scene.matchAll(/url\(#([^)]*)\)/g))assert.ok(ids.has(ref),`${skin.id}:${ref}`);
  for(const id of ids)assert.ok(!preview.includes(`id="${id}"`));
  assert.match(scene,/preserveAspectRatio="xMidYMid slice"/);
 }
});

test('motion OFF, reduced motion and image failure remove all enhanced layers and preserve the static image',()=>{
 for(const skin of HOME_SKINS400.slice(1)){
  const s=state(skin.id,false),before=JSON.stringify(s),html=homeSkinScene400(s);
  assert.match(html,/data-motion400="off"/);assert.ok(html.includes(skin.image));assert.equal(JSON.stringify(s),before);
 }
 assert.match(css,/\.home-motion407\[data-motion400="off"\] \.skin407-effects,[\s\S]*?display:none !important/);
 assert.match(css,/\.home-motion407\.skin400-image-failed \.skin407-effects/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*?\.skin407-effects \{ display:none !important/);
 assert.match(css,/\.skin400-base \{ transform:none; animation:none; \}/);
});

function target(){
 const listeners=new Map();return{listeners,addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);},removeEventListener(name,fn){listeners.get(name)?.delete(fn);},emit(name){for(const fn of listeners.get(name)??[])fn();},count(){return [...listeners.values()].reduce((n,s)=>n+s.size,0);}};
}
function environment(home=true){
 const view=target(),media=Object.assign(target(),{matches:false}),connection=Object.assign(target(),{saveData:false});
 const app={covered:false,querySelector(){return this.covered?{}:null;}},scene={},root={isConnected:true,dataset:{},querySelector:()=>scene,matches:()=>home,closest:()=>app};
 const intersections=[],mutations=[];
 view.navigator={hardwareConcurrency:8,connection};view.matchMedia=()=>media;
 view.IntersectionObserver=class{constructor(callback){this.callback=callback;intersections.push(this);}observe(element){this.element=element;}disconnect(){this.disconnected=true;}visible(value){this.callback([{target:this.element,isIntersecting:value}]);}};
 view.MutationObserver=class{constructor(callback){this.callback=callback;mutations.push(this);}observe(element,options){this.element=element;this.options=options;}disconnect(){this.disconnected=true;}};
 const doc=Object.assign(target(),{hidden:false,defaultView:view});return{view,media,connection,root,app,doc,scene,intersections,mutations};
}

test('hidden tabs, offscreen previews, shared modals and page restoration pause and resume together',()=>{
 const e=environment(),dispose=mountHomeMotion407(e.root,e.doc),paused=()=>e.root.dataset.environmentPaused400;
 assert.equal(paused(),'false');assert.equal(e.intersections[0].element,e.scene);
 e.doc.hidden=true;e.doc.emit('visibilitychange');assert.equal(paused(),'true');
 e.doc.hidden=false;e.doc.emit('visibilitychange');assert.equal(paused(),'false');
 e.intersections[0].visible(false);assert.equal(paused(),'true');e.intersections[0].visible(true);assert.equal(paused(),'false');
 e.app.covered=true;e.mutations[0].callback();assert.equal(paused(),'true');
 e.view.emit('pagehide');e.app.covered=false;e.mutations[0].callback();assert.equal(paused(),'true');e.view.emit('pageshow');assert.equal(paused(),'false');
 e.media.matches=true;e.media.emit('change');assert.equal(paused(),'true');e.media.matches=false;e.media.emit('change');assert.equal(paused(),'false');
 assert.deepEqual(e.mutations[0].options,{childList:true});
 dispose();assert.equal(e.doc.count()+e.view.count()+e.media.count()+e.connection.count(),0);assert.ok(e.intersections[0].disconnected&&e.mutations[0].disconnected);
 const before=JSON.stringify(e.root.dataset);e.intersections[0].visible(false);assert.equal(JSON.stringify(e.root.dataset),before);
});

test('settings preview does not watch unrelated page mutations and scene replacement releases every observer',()=>{
 const first=environment(false);mountHomeEnvironment400(first.root,first.doc);assert.equal(first.mutations.length,0);
 first.intersections[0].visible(false);assert.equal(first.root.dataset.environmentPaused400,'true');
 const second=environment();mountHomeEnvironment400(second.root,second.doc);
 assert.equal(first.doc.count()+first.view.count()+first.media.count()+first.connection.count(),0);assert.ok(first.intersections[0].disconnected);
 mountHomeEnvironment400(null,second.doc);assert.equal(second.doc.count()+second.view.count()+second.media.count()+second.connection.count(),0);assert.ok(second.intersections[0].disconnected&&second.mutations[0].disconnected);
});

test('resource-constrained devices reduce optional details, including after a live data-saving change',()=>{
 assert.equal(homeMotionQuality407({navigator:{}}),'full');
 for(const navigator of [{hardwareConcurrency:4},{deviceMemory:4},{connection:{saveData:true}}])assert.equal(homeMotionQuality407({navigator}),'light');
 assert.equal(homeMotionQuality407({navigator:{hardwareConcurrency:8,deviceMemory:8}}),'full');
 const e=environment(),dispose=mountHomeMotion407(e.root,e.doc);
 assert.equal(e.root.dataset.homeMotionQuality407,'full');e.connection.saveData=true;e.connection.emit('change');assert.equal(e.root.dataset.homeMotionQuality407,'light');dispose();
});

test('all unlocked homes retain formation controls, menu actions and untouched party stats',()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
 const save=new SaveService();save.state.player.maxFloor=100;save.state.campaign100.finalCompleted=true;save.state.primordial422={cleared:true};
 const before=JSON.stringify({party:save.state.party,equipment:save.state.equipment,monsters:save.state.monsters.map(m=>({id:m.id,level:m.level,hp:m.currentHp,mp:m.currentMp}))});
 for(const skin of HOME_SKINS400.slice(1)){
  save.state.settings.homeSkin400={id:skin.id,motion:true};const html=HomeScreen(save.state);
  assert.equal((html.match(/data-home-party-slot="/g)??[]).length,4);
  for(const id of ['openSettings','openGacha','openMonsters','openEquipment','openSkills'])assert.ok(html.includes(`id="${id}"`));
  assert.equal((html.match(/data-home-skin-scene400/g)??[]).length,1);
 }
 assert.equal(JSON.stringify({party:save.state.party,equipment:save.state.equipment,monsters:save.state.monsters.map(m=>({id:m.id,level:m.level,hp:m.currentHp,mp:m.currentMp}))}),before);
});

test('current entry preserves guide/name and motion module aliases',()=>{
 const html=read('index.html'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
 assert.equal(SAVE_SCHEMA_VERSION,84);
 assert.ok(html.indexOf('type="importmap"')<html.indexOf('type="module"'));
 assert.ok(html.includes(`const ASSET_VERSION = "${APP_VERSION}"`));
 for(const path of ['models/Monster.js','ui/HomeSkin400.js','core/HomeSkinSystem400.js']){
  const aliases=Object.entries(map).filter(([key])=>key.split('?')[0]==='./src/'+path);
  assert.ok(aliases.length>0);assert.equal(new Set(aliases.map(([,value])=>value)).size,1);
 }
 for(const target of Object.values(map))assert.ok(fs.existsSync(new URL('../'+target.split('?')[0],import.meta.url)));
 for(const css of ['build406-chapter-guide-summon','build407-home-motion'])assert.ok(html.includes(css));
});

test('100 home/preview replacements leave no listeners or observers after disposal',()=>{
 const environments=[];
 for(let i=0;i<100;i++){const e=environment(i%2===0);environments.push(e);mountHomeEnvironment400(e.root,e.doc);}
 mountHomeEnvironment400(null,environments.at(-1).doc);
 for(const e of environments){assert.equal(e.doc.count()+e.view.count()+e.media.count()+e.connection.count(),0);assert.ok(e.intersections.every(o=>o.disconnected));assert.ok(e.mutations.every(o=>o.disconnected));}
});
