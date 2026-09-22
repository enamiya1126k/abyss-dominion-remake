import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire,registerHooks} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {WORLDS512,worldIndex512,worldRoute512,sceneryFrame512,createSceneryLoader512,sceneryMarkup512,sceneryNodes512,paintScenery512,finishScenery512} from '../src/luck/Scenery512.js';
import {raceFrame511,courseOffsets511} from '../src/luck/Presentation511.js';
import {LUCK511,makeLuck511,startLuck511,drawPlan511,advanceLuck511,publicLuck511} from '../src/luck/Rules511.js';

function state(from=[0,0,0,0],to=from,item='dash'){
  return {id:'scenery',phase:'run',phaseAt:1000,round:4,players:from.map((distance,seat)=>({seat,playerId:'p'+seat,distance,loadout:[]})),event:{rows:from.map((value,seat)=>({seat,from:value,to:to[seat],item,delta:(BigInt(to[seat])-BigInt(value)).toString()}))}};
}
const frame=(g,ms=0,self='p0',reduced=false)=>sceneryFrame512(g,g.phaseAt+ms,raceFrame511(g,g.phaseAt+ms,self,reduced),reduced);
test('all seven boundaries are exact, including decimal strings beyond safe Number range',()=>{
  assert.equal(worldIndex512(-1),0);assert.equal(worldIndex512(0),0);
  WORLDS512.slice(1).forEach((w,i)=>{assert.equal(worldIndex512(w.from-1n),i);assert.equal(worldIndex512(w.from),i+1);assert.equal(worldIndex512(String(w.from+1n)),i+1)});
  assert.equal(worldIndex512('999999999999999999999999999999999999999999'),6);
});
test('every viewer follows their own distance, independently of the leader and the minimap',()=>{
  const g=state([0,10000,10000000,1000000000]);g.phase='hand';
  assert.deepEqual(g.players.map(p=>frame(g,0,p.playerId).index),[0,1,4,6]);
  assert.equal(frame(g,0,'spectator').index,0);
});
test('the user screenshot distances enter the stratosphere and space, not stadium',()=>{
  const g=state([28182000,600000000,2080000,1410000]);g.phase='chest';
  assert.deepEqual(g.players.map(p=>frame(g,0,p.playerId).index),[4,5,3,3]);
});
test('ordinary crossings begin at their actual marker crossing and fade for at most 180ms',()=>{
  for(const item of ['dash','rocket','spring','mega','triple']){
    const g=state([9500,0,0,0],[10500,0,0,0],item),route=worldRoute512(g.event.rows[0]),at=route[1].at;
    assert.equal(frame(g,at-.01).index,0);assert.equal(frame(g,at+.01).to,1);
    assert.equal(worldIndex512(raceFrame511(g,g.phaseAt+at+.01,'p0').focusQ/1000000n),1);
    assert.equal(frame(g,at+181).index,1);assert.equal(frame(g,at+181).blend,0);
  }
});
test('a huge jump reveals every intermediate world without adding run time',()=>{
  const g=state([0,0,0,0],['1000000000000000000000000000000',0,0,0],'mega'),before=JSON.stringify(g),route=worldRoute512(g.event.rows[0]);
  assert.deepEqual(route.map(s=>s.index),[0,1,2,3,4,5,6]);
  for(let i=1;i<route.length;i++){assert.equal(frame(g,route[i].at+181).index,i);if(i>1)assert.ok(route[i].at-route[i-1].at>=279.99)}
  assert.ok(route.at(-1).at+180<LUCK511.runMs);assert.equal(frame(g,4800).index,6);assert.equal(JSON.stringify(g),before);
});
test('scenery never leads physical distance during a forward run',()=>{
  for(const finish of [10001,105000,1e8,'10000000000000000000000000000000000000000']){
    const g=state([0,0,0,0],[finish,0,0,0]);
    for(let ms=0;ms<=4800;ms+=13){const actual=raceFrame511(g,g.phaseAt+ms,'p0'),s=sceneryFrame512(g,g.phaseAt+ms,actual);assert.ok(s.to<=worldIndex512(actual.focusQ/1000000n))}
  }
});
test('reverse travel descends through worlds, handles exact boundaries, and ends at the real destination',()=>{
  const g=state([2000000000,0,0,0],[0,0,0,0]),route=worldRoute512(g.event.rows[0]);
  assert.deepEqual(route.map(r=>r.index),[6,5,4,3,2,1,0]);assert.equal(frame(g,4800).index,0);
  const exact=state([10001,0,0,0],[10000,0,0,0]);assert.deepEqual(worldRoute512(exact.event.rows[0]).map(x=>x.index),[1]);
});
test('very late crossings, stationary scores and already-galactic scores cannot queue transitions after the run',()=>{
  for(const [from,to] of [[0,10000],[999999,1000000],[10000000,10000000],['9999999999999999999999999','10000000000000000000000000']]){
    const g=state([from,0,0,0],[to,0,0,0]);assert.equal(frame(g,4800).index,worldIndex512(to));assert.equal(frame(g,4800).warp,0);assert.equal(frame(g,300000).blend,0);
    assert.ok(worldRoute512(g.event.rows[0]).every(x=>x.at<=4800));
  }
});
test('late join is derived from shared run time without replay state; reduced motion jumps directly',()=>{
  const g=state([0,0,0,0],[1e12,0,0,0]);
  assert.deepEqual(frame(g,1700),frame(JSON.parse(JSON.stringify(g)),1700));
  assert.deepEqual(frame(g,0,'p0',true),{from:6,to:6,index:6,blend:0,warp:0});
  assert.equal(worldRoute512(g.event.rows[0]),worldRoute512(g.event.rows[0]));
});
test('all presentation phases keep exact camera, flowing markers, offsets and distance gaps untouched',()=>{
  const g=state([9999900,1000000000,9999400,0],[10200000,2000000000,10500000,0]);
  for(const phase of ['chest','hand','dice','broadcast','run','settle','result']){
    g.phase=phase;const f=raceFrame511(g,g.phaseAt+2000,'p0'),before=structuredClone(f),offsets=courseOffsets511(f,393,1100);
    sceneryFrame512(g,g.phaseAt+2000,f);assert.deepEqual(f,before);assert.deepEqual(courseOffsets511(f,393,1100),offsets);assert.equal(f.rows[0].x,50);assert.equal(f.span,2000);
  }
});

function loaderRig(){
  const instances=[],timers=new Map();let serial=0,events=0;
  class ImageClass{constructor(){instances.push(this);this.naturalWidth=2170}set src(v){this.url=v}get src(){return this.url}}
  const loader=createSceneryLoader512({ImageClass,setTimer:fn=>{timers.set(++serial,fn);return serial},clearTimer:id=>timers.delete(id)}),unsubscribe=loader.subscribe(()=>events++);
  return {instances,timers,loader,unsubscribe,events:()=>events};
}
test('background loader caps downloads at two, prioritizes the current world and caches completed images',()=>{
  const r=loaderRig();r.loader.preload([5,6]);assert.equal(r.instances.length,2);assert.match(r.instances[0].src,/space\.png$/);assert.match(r.instances[1].src,/galaxy\.png$/);
  r.instances[0].onload();assert.equal(r.instances.length,3);assert.equal(r.loader.status(5),'ready');assert.equal(r.timers.size,2);
  for(let i=1;i<6;i++)r.instances[i].onload();assert.equal(r.instances.length,6);assert.equal(r.timers.size,0);assert.equal(r.events(),6);
  for(let i=0;i<100;i++)r.loader.preload();assert.equal(r.instances.length,6);r.unsubscribe();
});
test('failed and timed-out scenery uses fallback, allows remaining downloads and retries explicitly',()=>{
  const r=loaderRig();r.loader.preload();r.instances[0].onerror();assert.equal(r.loader.status(1),'failed');[...r.timers.values()][0]();assert.equal(r.loader.status(2),'failed');
  for(let i=2;i<6;i++)r.instances[i].onload();assert.equal(r.loader.status(6),'ready');assert.equal(r.timers.size,0);
  r.loader.retry();assert.equal(r.instances.length,8);r.instances[6].onload();r.instances[7].onload();assert.equal(r.loader.status(1),'ready');r.unsubscribe();
});
test('leaving the game cancels downloads, timers and callbacks; reopening resumes only missing assets',()=>{
  const r=loaderRig();r.loader.preload();const stale=r.instances[0].onload;r.unsubscribe();assert.equal(r.timers.size,0);assert.equal(r.instances[0].onload,null);assert.equal(r.instances[0].src,'');stale();assert.equal(r.events(),0);assert.equal(r.instances.length,2);
  const unsubscribe=r.loader.subscribe(()=>{});r.loader.preload();assert.equal(r.instances.length,4);unsubscribe();assert.equal(r.timers.size,0);
});
test('async decode completion after disposal cannot repaint a dead game',async()=>{
  let finish;const images=[];class ImageClass{constructor(){images.push(this);this.naturalWidth=200}decode(){return new Promise(resolve=>finish=resolve)}}
  const timers=new Map();let id=0,writes=0;const l=createSceneryLoader512({ImageClass,setTimer:f=>{timers.set(++id,f);return id},clearTimer:i=>timers.delete(i)}),off=l.subscribe(()=>writes++);l.preload();images[0].onload();await Promise.resolve();off();finish();await Promise.resolve();await Promise.resolve();assert.equal(writes,0);assert.equal(l.status(1),'idle');assert.equal(timers.size,0);
});

function sceneryDOM(){
  let writes=0;const elements=new Map();
  const element=()=>({hidden:false,style:{},dataset:{},textContent:''});
  const root={querySelector:q=>{if(!elements.has(q))elements.set(q,element());return elements.get(q)}};
  const set=(e,k,v)=>{if(e[k]!==v){e[k]=v;writes++}};
  return {root,nodes:sceneryNodes512(root),mutations:()=>writes,ops:{style:(e,k,v)=>set(e.style,k,v),data:(e,k,v)=>set(e.dataset,k,String(v)),hide:(e,v)=>set(e,'hidden',v),put:(e,v)=>set(e,'textContent',v)}};
}
test('only two three-depth world slots are used; existing markers, runners and controls remain separate',()=>{
  const html=sceneryMarkup512();assert.equal((html.match(/data-world-slot512=/g)||[]).length,2);assert.equal((html.match(/class="lk-course508/g)||[]).length,4);assert.equal((html.match(/class="lk-near511/g)||[]).length,2);assert.doesNotMatch(html,/<button|data-runner|data-mark|<canvas/);
});
test('crossfade retains continuous world offsets for both worlds, falls back on failure and caches writes',()=>{
  const d=sceneryDOM(),offsets={ground:112.25,horizon:71.12,near:313.47},s={from:4,to:5,index:5,blend:.75,warp:.1},loader={status:i=>i===4?'ready':'failed'};
  paintScenery512(d.nodes,s,offsets,loader,d.ops);assert.equal(d.nodes.slots[0].el.dataset.world512,'stratosphere');assert.equal(d.nodes.slots[1].el.dataset.world512,'space');assert.equal(d.nodes.slots[1].el.style.opacity,'0.7500');assert.equal(d.nodes.slots[1].el.style['--lk-world-image512'],'none');
  d.nodes.slots.forEach(slot=>{assert.match(slot.layers[0].style.transform,/-112\.25px/);assert.match(slot.layers[1].style.transform,/-71\.12px/);assert.match(slot.layers[2].style.transform,/-313\.47px/)});
  assert.equal(d.nodes.label.textContent,'宇宙 · 1億m');const writes=d.mutations();for(let i=0;i<1000;i++)paintScenery512(d.nodes,s,offsets,loader,d.ops);assert.equal(d.mutations(),writes);
  paintScenery512(d.nodes,{from:5,to:5,index:5,blend:0,warp:0},offsets,loader,d.ops);assert.equal(d.nodes.slots[1].el.hidden,true);assert.equal(d.nodes.warp.style.opacity,'0.0000');
});
test('generated assets fully decode with documented hashes and a consistent panoramic aspect',async()=>{
  const require=createRequire(import.meta.url),{loadImage}=require('@napi-rs/canvas'),manifest=JSON.parse(readFileSync(new URL('../docs/build512/generated-assets.json',import.meta.url)));
  assert.equal(manifest.length,6);
  for(const entry of manifest){const url=new URL('../'+entry.path,import.meta.url),bytes=readFileSync(url),image=await loadImage(url.pathname);assert.equal(image.width,entry.width);assert.equal(image.height,entry.height);assert.ok(Math.abs(image.width/image.height-3)<.01);assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256)}
});
test('the victory background uses the winning distance and safely falls back to the original stadium',()=>{
  assert.equal(finishScenery512(9999),'');assert.match(finishScenery512(100000000),/data-finish-world512="space"/);assert.match(finishScenery512('100000000000000000000000'),/galaxy\.png/);
});

const fixtures={
 [new URL('../src/ui/MonsterVisual.js',import.meta.url).href]:`export const monsterVisual=()=>'<i class="test-sprite"></i>';export const setMonsterVisualFrame=()=>{};`,
 [new URL('../src/data/species.js',import.meta.url).href]:`export const SPECIES=Object.fromEntries(['slime','goblin','wolf','skeleton','ember_gecko','glacier_queen','myth_rion','myth_yori','myth_hide','myth_enami'].map(id=>[id,{id,name:id,race:id==='slime'?'slime':'beast',rarity:'R'}]));`,
 [new URL('../src/data/endgameCharacters.js',import.meta.url).href]:`export const ENDGAME_CHARACTERS={};export const canonicalEndgameId=id=>id;`
};
const hook=registerHooks({resolve(spec,c,next){const url=spec.startsWith('.')?new URL(spec,c.parentURL).href:spec;if(fixtures[url]&&!existsSync(new URL(url)))return{url,shortCircuit:true};return next(spec,c)},load(url,c,next){if(fixtures[url]&&!existsSync(new URL(url)))return{format:'module',source:fixtures[url],shortCircuit:true};return next(url,c)}});
const {luckView511,luckAfter511,luckBefore511,luckTick511,paintLuck511}=await import('../src/luck/View511.js');
hook.deregister();
const plan=()=>drawPlan511(n=>n-1);
function game(n=4){const g=makeLuck511({id:'luck-test',code:'ABC123',partyId:'party',hostId:'p0',members:Array.from({length:n},(_,i)=>({playerId:'p'+i,name:'P'+i,color499:['orange','pink','green','blue'][i],owned:[{id:'m'+i,speciesId:'wolf'}],choice:{id:'m'+i,speciesId:'wolf'}}))});startLuck511(g,1000,plan());return g}
const begin=g=>{advanceLuck511(g,g.nextAt);return g.phaseAt};
function context(g,self='p0'){return{state:{luck:publicLuck511(g,self),party:{id:'party',hostId:'p0',members:g.members.map(m=>({...m,connected:true})),game:'luck',phase:g.phase},available:true,serverNow:g.phaseAt,partyResultActions490:1},transport:{selfId:self},offset:g.phaseAt-Date.now(),sgMonster463:()=>'<span class="sg-monster"><i></i></span>',sgSpeciesName463:id=>id,ready:()=>true,connected:()=>true,roster:()=>[{id:'m0',speciesId:'wolf'}],bank:()=>null,save:{state:{player:{gold:1000,crystals:0},settings:{audioEnabled:false},monsters:[]}},root:{querySelector:()=>null},draft:{code:'ABC123'},render(){},lkUI511:{gameId:g.id,artReady:true,sound:false}}}
function dom(g=game()){
 let mutations=0,serial=0;const queue=new Map(),listeners=new Map(),saved={document:globalThis.document,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
 function el(){const values={},attrs={},children=new Map();return{clientHeight:350,clientWidth:393,dataset:new Proxy({},{set(t,k,v){mutations++;t[k]=v;return true}}),style:new Proxy({setProperty(k,v){this[k]=v},getPropertyValue(k){return this[k]??''},getPropertyPriority(){return''}},{set(t,k,v){mutations++;t[k]=v;return true}}),classList:{contains:s=>s==='lk-play508'},getAttribute:k=>attrs[k]??null,setAttribute(k,v){mutations++;attrs[k]=v},addEventListener(){},removeEventListener(){},contains:()=>false,querySelector(q){if(!children.has(q))children.set(q,el());return children.get(q)},querySelectorAll:()=>[],get textContent(){return values.textContent},set textContent(v){mutations++;values.textContent=v},get disabled(){return values.disabled},set disabled(v){mutations++;values.disabled=v},get hidden(){return values.hidden},set hidden(v){mutations++;values.hidden=v}}}
 const root=el(),groups={'[data-dice-cube511]':3,'[data-dice-lift511]':3,'[data-dice-actor511]':4,'[data-gear-slot511]':40,'[data-volley511] .lk-art508':9,'[data-chest511]':4,'[data-hand-pick511]':4,'[data-dot511]':8,'[data-mark511]':7,'[data-reveals511] .lk-art508':4};for(const[k,v]of Object.entries(groups))groups[k]=Array.from({length:v},el);root.querySelectorAll=q=>groups[q]??[];
 globalThis.document={visibilityState:'visible',querySelector:()=>null,addEventListener:(n,fn)=>listeners.set(n,fn),removeEventListener:n=>listeners.delete(n)};globalThis.requestAnimationFrame=fn=>{const id=++serial;queue.set(id,fn);return id};globalThis.cancelAnimationFrame=id=>queue.delete(id);
 if(g.phase==='countdown')begin(g);const c=context(g);c.root={querySelector:()=>root};c.offset=g.phaseAt-Date.now();c.raw=()=>true;
 return{g,c,root,groups,queue,listeners,mutations:()=>mutations,reset:()=>mutations=0,flush(){const jobs=[...queue.values()];queue.clear();for(const f of jobs)f()},restore(){luckBefore511(c);for(const[k,v]of Object.entries(saved)){if(v===undefined)delete globalThis[k];else globalThis[k]=v}}}
}


test('live View511 paints the local space world, preserves ±1000m camera, stops idle writes and cleans up',()=>{
 const g=game();begin(g);g.players[0].distance=150000000;g.players[1].distance=1e10;
 const d=dom(g);try{luckAfter511(d.c);d.flush();const n=d.c.lkUI511.nodes;assert.match(n.scenery.label.textContent,/宇宙/);assert.equal(n.scenery.slots[0].el.dataset.world512,'space');assert.equal(n.scenery.slots[1].el.hidden,true);assert.equal(n.players[0].runner.hidden,false);assert.equal(n.players[1].runner.hidden,true);assert.match(n.players[0].runner.style.transform,/50.0000%/);d.reset();for(let i=0;i<100;i++)paintLuck511(d.c,g.phaseAt+10);const writes=d.mutations();for(let i=0;i<100;i++)paintLuck511(d.c,g.phaseAt+10);assert.equal(d.mutations(),writes);luckBefore511(d.c);assert.equal(d.c.lkUI511.sceneryUnsubscribe,null);assert.equal(d.queue.size,0)}finally{d.restore()}
});
test('integrated render crosses all worlds while retaining the existing finite RAF and hidden-tab suspension',()=>{
 const g=game();begin(g);g.phase='run';g.event={rows:g.players.map((p,i)=>({seat:i,playerId:p.playerId,from:0,to:i?100:1000000000000,item:'mega',delta:i?100:1000000000000,loadout:[],coils:0,wards:0})),attacks:[],diceOrder:[],castMs:0};
 const d=dom(g);try{luckAfter511(d.c);d.flush();const n=d.c.lkUI511.nodes,route=worldRoute512(d.c.state.luck.event.rows[0]);for(const s of route.slice(1)){paintLuck511(d.c,g.phaseAt+s.at+181);assert.equal(n.scenery.slots[0].el.dataset.world512,WORLDS512[s.index].id)}assert.equal(d.queue.size,1);d.c.offset=g.phaseAt+4801-Date.now();d.flush();assert.equal(d.queue.size,0);document.visibilityState='hidden';d.listeners.get('visibilitychange')();d.reset();luckTick511(d.c);assert.equal(d.mutations(),0);assert.equal(d.queue.size,0);assert.equal((luckView511(d.c).match(/data-world-slot512=/g)||[]).length,2)}finally{d.restore()}
});
