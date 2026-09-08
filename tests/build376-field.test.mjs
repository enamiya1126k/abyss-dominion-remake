import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {mountChapterTwoField} from '../src/chapterTwo/ChapterTwoField.js';
const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function movement(){const ctx=vm.createContext({TILE:88,sectionBounds:()=>{throw Error('not needed')}});vm.runInContext(source.split('\n').filter(l=>l.startsWith('class Entity')||l.startsWith('class Camera')).join('\n')+'\nglobalThis.Entity=Entity;globalThis.Camera=Camera;',ctx);vm.runInContext(source.slice(source.indexOf('function path(w,'),source.indexOf('function bindInput(c)')),ctx);return ctx;}
function fixture(run){
 const saved=Object.fromEntries(['document','ResizeObserver','devicePixelRatio','requestAnimationFrame','cancelAnimationFrame'].map(k=>[k,globalThis[k]]));let callback,contacts=[];const listeners=new Map(),ctx=new Proxy({measureText:t=>({width:t.length*6})},{get:(o,k)=>o[k]??(()=>{})});
 globalThis.document={addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k)};globalThis.ResizeObserver=class{observe(){}disconnect(){}};globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=f=>{callback=f;return 1};globalThis.cancelAnimationFrame=()=>{};
 const {Entity,Camera,path}=movement(),g={},canvas={width:390,height:500,isConnected:true,getBoundingClientRect:()=>({width:390,height:500,left:0,top:0}),getContext:()=>ctx,setPointerCapture(){}};
 mountChapterTwoField(g,{canvas,Entity,Camera,findPath:path,drawMonster:()=>{},TILE:88,run,party:[],onSave(){},onContact:o=>{contacts.push(o);g.paused=true}});
 let now=performance.now();return{g,canvas,listeners,contacts,tick(n){for(let i=0;i<n;i++){now+=40;callback(now)}},tap(x,y){const p=g.camera.world((x+.5)*88,(y+.5)*88),e={pointerId:1,clientX:p.x,clientY:p.y};canvas.onpointerdown(e);canvas.onpointerup(e)},cleanup(){g.disposeChapterTwo();for(const[k,v]of Object.entries(saved))if(v===undefined)delete globalThis[k];else globalThis[k]=v;}};
}
test('real Entity/Camera/path: tap reaches a doorway; a new-room spawn is not overwritten on disposal',()=>{
 const run={room:0,position:{x:9,y:15},defeated:[]},f=fixture(run);
 try{f.tap(16,9);f.tick(180);assert.equal(f.contacts.length,1);assert.equal(f.contacts[0].id,'east');run.room=1;run.position={x:3,y:9};f.g.disposeChapterTwo();assert.deepEqual(run.position,{x:3,y:9});assert.equal(f.listeners.size,0);assert.equal(f.canvas.onpointerdown,null)}finally{f.cleanup()}
});
test('map navigation buttons walk the party; entering a room never triggers automatic battle',()=>{
 const f=fixture({room:1,position:{x:3,y:9},defeated:['patrol']});
 try{f.tick(50);assert.equal(f.contacts.length,0);f.g.chapterTwoDoor('south');f.tick(5);assert.equal(f.contacts.length,0);f.g.chapterTwoDoor('north');f.tick(180);assert.equal(f.contacts[0].type,'door');assert.equal(f.contacts[0].id,'north')}finally{f.cleanup()}
});
test('tapping a visible enemy reaches a single encounter and disposes cleanly',()=>{
 const f=fixture({room:3,position:{x:9,y:15},defeated:[]});
 try{f.tap(9,7);f.tick(150);assert.equal(f.contacts.length,1);assert.equal(f.contacts[0].id,'west');f.tick(50);assert.equal(f.contacts.length,1)}finally{f.cleanup()}
});
