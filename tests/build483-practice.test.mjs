import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {installPracticeBoot483,practiceDocument483} from '../src/practice/PracticeBoot483.js';
import {openPracticeFrame450} from '../src/practice/PracticeFrame450.js';
const base='https://example.test/game/',entry=base+'src/main.js?v=3.1.162-build483';
const input={base,entry,styles:'',map:JSON.stringify({imports:{'./src/main.js':'./src/main.js?v=3.1.141-build462','./src/core/config.js?v=old':'./src/core/config.js?v=current'}})};
function child({dom=true,clone=true}={}){
 const nodes=Object.fromEntries(['practice-error450','practice-loading483','practice-reason483','practice-retry483','practice-close483'].map(k=>[k,{hidden:k==='practice-error450',textContent:''}]));
 const events={},docEvents={},timers=new Map();let id=0,ready=dom;
 const snapshot={state:{player:{crystals:123},party:['p1']},opponent:{displayName:'相手'}};
 const w={frameElement:clone?{__practiceBoot450:snapshot}:{__practiceBoot450:{invalid:()=>{}}},document:{baseURI:base,getElementById:k=>ready?nodes[k]:null,addEventListener:(k,fn)=>docEvents[k]=fn},addEventListener:(k,fn)=>events[k]=fn,setTimeout:fn=>(timers.set(++id,fn),id),clearTimeout:k=>timers.delete(k)};
 return{w,nodes,events,timers,snapshot,mount:()=>{ready=true;docEvents.DOMContentLoaded?.()}};
}
function runEntry(w,load){const html=practiceDocument483(input),script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace('await import(', 'await loadEntry483(');return vm.runInNewContext(`(async()=>{${script}})()`,{...w,globalThis:w,document:w.document,URL,parent:{postMessage(){}},loadEntry483:load});}

test('srcdoc uses the same current main entry as its parent and absolute import-map URLs',()=>{
 const html=practiceDocument483(input),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
 assert.equal(map.imports[base+'src/main.js'],entry);assert.equal(map.imports[base+'src/core/config.js?v=old'],base+'src/core/config.js?v=current');assert.ok(html.includes(`await import("${entry}")`));
 assert.doesNotMatch(html,/await import\('\.\/src\/main.js'\)/);
 const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');assert.match(main,/__practiceStart483=startPracticeChild450/);assert.doesNotMatch(main,/queueMicrotask\(startPracticeChild450\)/);
});
test('bootstrap isolates save and both storage namespaces; WebSocket is blocked only in the child',()=>{
 const c=child(),before=structuredClone(c.snapshot);installPracticeBoot483(c.w);
 c.w.__practiceBoot450.state.player.crystals=0;c.w.localStorage.setItem('save','modified');c.w.sessionStorage.setItem('screen','battle');
 assert.deepEqual(c.snapshot,before);assert.equal(c.w.frameElement.__practiceBoot450,undefined);assert.equal(c.w.sessionStorage.getItem('save'),null);assert.equal(c.w.localStorage.getItem('screen'),null);assert.throws(()=>new c.w.WebSocket(),/送信しません/);
});
test('battle starts once and only after module loading finishes; successful load clears the timeout',async()=>{
 const c=child();installPracticeBoot483(c.w);const order=[];
 await runEntry(c.w,async url=>{assert.equal(url,entry);order.push('import');await Promise.resolve();c.w.__practiceStart483=()=>{order.push('start');c.w.__practiceReady450=true};order.push('loaded')});
 assert.deepEqual(order,['import','loaded','start']);assert.equal(c.nodes['practice-loading483'].hidden,true);assert.equal(c.nodes['practice-error450'].hidden,true);assert.equal(c.timers.size,0);
});
test('import failure, combat startup exception and stale entry show retry/return without mutating the snapshot',async()=>{
 for(const mode of ['import','combat','stale']){const c=child(),before=structuredClone(c.snapshot);installPracticeBoot483(c.w);
  await runEntry(c.w,async()=>{if(mode==='import')throw Error('network failed');if(mode==='combat')c.w.__practiceStart483=()=>{throw Error('battle failed')}});
  assert.equal(c.nodes['practice-error450'].hidden,false);assert.equal(c.nodes['practice-loading483'].hidden,true);assert.ok(c.nodes['practice-reason483'].textContent);assert.equal(c.timers.size,0);assert.deepEqual(c.snapshot,before);
 }
});
test('early exceptions remain visible after DOMContentLoaded; timeout prevents a permanent blank screen',()=>{
 const early=child({dom:false,clone:false});installPracticeBoot483(early.w);early.mount();assert.equal(early.nodes['practice-error450'].hidden,false);
 const c=child();installPracticeBoot483(c.w);[...c.timers.values()][0]();assert.equal(c.w.__practiceCanStart483(),false);assert.match(c.nodes['practice-reason483'].textContent,/読み込みが完了/);
});
test('an autoplay-only rejection after ready does not cover a working battle; combat errors still surface',()=>{
 const c=child();installPracticeBoot483(c.w);c.w.__practiceReady450=true;let prevented=false;
 c.events.unhandledrejection({reason:{name:'NotAllowedError',message:'The media playback was denied'},preventDefault(){prevented=true}});assert.equal(prevented,true);assert.equal(c.nodes['practice-error450'].hidden,true);
 c.events.error({error:Error('combat crashed')});assert.equal(c.nodes['practice-error450'].hidden,false);assert.equal(c.nodes['practice-reason483'].textContent,'combat crashed');
});
function parentDom(){
 class Element{constructor(tag){this.tag=tag;this.children=[];this.style={};this.contentWindow={};}setAttribute(){}append(...children){for(const c of children){c.parent=this;this.children.push(c)}}prepend(c){c.parent=this;this.children.unshift(c)}remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this)}replaceWith(next){next.parent=this.parent;this.parent.children=this.parent.children.map(c=>c===this?next:c)}focus(){this.focused=true}}
 const events={},body=new Element('body'),focus=new Element('button');body.style.overflow='auto';
 const document={baseURI:base,body,activeElement:focus,createElement:tag=>new Element(tag),querySelector:s=>s==='script[type="importmap"]'?{textContent:input.map}:body.children.find(e=>e.className==='practice-frame-shell450')??null,querySelectorAll:()=>[]};
 return{document,body,focus,window:{addEventListener:(k,f)=>events[k]=f,removeEventListener:k=>delete events[k]},events};
}
test('retry replaces the child realm with a fresh snapshot; stale or foreign messages cannot close it',async()=>{
 const d=parentDom(),previous={document:globalThis.document,window:globalThis.window,url:globalThis.__abyssMainUrl483};Object.assign(globalThis,{document:d.document,window:d.window,__abyssMainUrl483:entry});
 try{let closed=0;const state={player:{crystals:500}},frame=await openPracticeFrame450({state,opponent:{displayName:'相手'},onClose:()=>closed++}),old=frame.frame;
  old.__practiceBoot450.state.player.crystals=0;d.events.message({source:old.contentWindow,origin:new URL(base).origin,data:{type:'practice-retry483'}});
  assert.notEqual(frame.frame,old);assert.equal(frame.frame.__practiceBoot450.state.player.crystals,500);assert.equal(state.player.crystals,500);
  d.events.message({source:old.contentWindow,origin:new URL(base).origin,data:{type:'practice-close450'}});assert.equal(closed,0);
  d.events.message({source:frame.frame.contentWindow,origin:'https://foreign.test',data:{type:'practice-close450'}});assert.equal(closed,0);
  frame.close();frame.close();assert.equal(closed,1);assert.equal(d.body.style.overflow,'auto');assert.equal(d.body.children.length,0);assert.equal(d.focus.focused,true);
  await assert.rejects(openPracticeFrame450({state:{fn(){}},opponent:{displayName:'invalid'}}));assert.equal(d.body.children.length,0);
 }finally{globalThis.document=previous.document;globalThis.window=previous.window;globalThis.__abyssMainUrl483=previous.url;}
});
