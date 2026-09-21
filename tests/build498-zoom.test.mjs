import test from 'node:test';
import assert from 'node:assert/strict';
import { lockPlayZoom486 } from '../src/cabbage/Input486.js';

class Node {
  listeners = new Map(); attrs = new Map();
  style = { touchAction: 'pan-y' };
  addEventListener(n, fn, options) { const a=this.listeners.get(n)??[];a.push({fn,options});this.listeners.set(n,a); }
  removeEventListener(n, fn, capture) { this.listeners.set(n,(this.listeners.get(n)??[]).filter(x=>x.fn!==fn||!!x.options.capture!==!!capture)); }
  setAttribute(n,v) { this.attrs.set(n,v); }
  getAttribute(n) { return this.attrs.get(n)??null; }
  removeAttribute(n) { this.attrs.delete(n); }
  contains(n) { return n===this || n?.parent===this; }
  emit(n, props={}) { const e={target:this,cancelable:true,prevented:false,preventDefault(){this.prevented=true},...props};for(const x of [...(this.listeners.get(n)??[])])x.fn(e);return e; }
}
function fixture(scale=1) {
  const doc=new Node(),surface=new Node(),meta=new Node(),frames=[];
  const original='width=device-width,initial-scale=1,viewport-fit=cover';
  meta.setAttribute('content',original);doc.querySelector=()=>meta;
  doc.defaultView={visualViewport:{scale},requestAnimationFrame:fn=>frames.push(fn)};
  const target=(kind='enemy')=>({parent:surface,closest:q=>kind==='enemy'&&q.includes('data-cn-target496')?{}:kind==='button'&&q==='button,a,input,select,textarea'?{}:null});
  const touch=(id,t)=>({identifier:id,target:t});
  const start=(id,t)=>doc.emit('touchstart',{target:t,touches:[touch(id,t)],changedTouches:[touch(id,t)]});
  const end=(id,t)=>doc.emit('touchend',{target:t,touches:[],changedTouches:[touch(id,t)]});
  const drain=()=>{while(frames.length)frames.shift()()};
  return {doc,surface,meta,original,frames,target,touch,start,end,drain};
}
test('100 rapid enemy releases cancel native zoom, including enemies removed before touchend',()=>{
  const f=fixture(),off=lockPlayZoom486(f.surface,f.doc);
  for(let i=0;i<100;i++){const t=f.target();assert.equal(f.start(i,t).prevented,true);t.parent=null;assert.equal(f.end(i,t).prevented,true);}
  assert.equal(f.surface.style.touchAction,'none');
  for(const n of ['touchend','touchstart','gesturestart','dblclick'])assert.deepEqual(f.doc.listeners.get(n)[0].options,{passive:false,capture:true});
  off();assert.equal(f.surface.style.touchAction,'pan-y');assert.equal(f.meta.getAttribute('content'),f.original);
  for(const a of f.doc.listeners.values())assert.equal(a.length,0);
});
test('native header/footer buttons and keyboard clicks remain usable; outside screens are untouched',()=>{
  const f=fixture(),off=lockPlayZoom486(f.surface,f.doc),button=f.target('button'),outside={closest:()=>null};
  f.start(1,button);assert.equal(f.end(1,button).prevented,false);
  assert.equal(f.doc.emit('click',{target:button,detail:0}).prevented,false);
  f.start(2,outside);assert.equal(f.end(2,outside).prevented,false);
  assert.equal(f.doc.emit('gesturestart',{target:outside}).prevented,false);
  assert.equal(f.doc.emit('dblclick',{target:button}).prevented,true);
  off();assert.equal(f.doc.emit('dblclick',{target:button}).prevented,false);
});
test('empty playfield and simultaneous touches cannot start native zoom; cancel clears tracked ids',()=>{
  const f=fixture(),off=lockPlayZoom486(f.surface,f.doc),a=f.target('water'),b=f.target();
  f.start(1,a);assert.equal(f.doc.emit('touchstart',{target:b,touches:[f.touch(1,a),f.touch(2,b)],changedTouches:[f.touch(2,b)]}).prevented,true);
  assert.equal(f.doc.emit('touchmove',{target:b,touches:[{},{}]}).prevented,true);
  assert.equal(f.doc.emit('touchcancel',{target:a,changedTouches:[f.touch(1,a)]}).prevented,true);
  assert.equal(f.end(2,b).prevented,true);assert.equal(f.end(1,a).prevented,false);off();
});
test('scaled exit requests scale 1 then restores original viewport; quick replay cannot restore a stale lock',()=>{
  const f=fixture(2),off=lockPlayZoom486(f.surface,f.doc);off();assert.equal(f.frames.length,1);
  assert.match(f.meta.getAttribute('content'),/initial-scale=1,/);
  const off2=lockPlayZoom486(f.surface,f.doc);f.drain();assert.match(f.meta.getAttribute('content'),/user-scalable=no/);
  f.doc.defaultView.visualViewport.scale=1;off2();assert.equal(f.meta.getAttribute('content'),f.original);
  off2();assert.equal(f.meta.getAttribute('content'),f.original);
});
test('cleanup never overwrites another screen viewport settings',()=>{
  const f=fixture(2),off=lockPlayZoom486(f.surface,f.doc);off();
  f.meta.setAttribute('content','width=device-width,initial-scale=1.5');f.drain();
  assert.equal(f.meta.getAttribute('content'),'width=device-width,initial-scale=1.5');
});
