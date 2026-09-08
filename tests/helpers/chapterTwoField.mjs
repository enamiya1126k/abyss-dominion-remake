import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {SaveService} from '../../src/services/SaveService.js';
import {chapterTwoState,beginChapterTwoRun} from '../../src/chapterTwo/ChapterTwoSystem.js';
import {chapterTwoLayout} from '../../src/chapterTwo/ChapterTwoMap.js';
import {sectionBounds,portalTapDestination} from '../../src/core/DungeonSectionSystem.js';
import {mountChapterTwoField} from '../../src/chapterTwo/ChapterTwoField.js';
const main=fs.readFileSync(new URL('../../src/main.js',import.meta.url),'utf8');
function fresh(){globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};const s=new SaveService().state;s.player.maxFloor=100;s.player.currentFloor=100;s.campaign100.finalCompleted=true;return s;}
export function fieldFixture(room=0){
 const s=fresh();chapterTwoState(s).introComplete=true;beginChapterTwoRun(s);const run=s.chapterTwo376.run;run.room=room;run.visited=[0,room];run.position={...chapterTwoLayout(run.serial).sections[room].center};
 const old=Object.fromEntries(['document','ResizeObserver','devicePixelRatio','requestAnimationFrame','cancelAnimationFrame'].map(k=>[k,globalThis[k]]));let callback,contacts=[],draws=0;const listeners=new Map();
 globalThis.document={addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k),getElementById:()=>null,querySelector:()=>null};globalThis.ResizeObserver=class{observe(){}disconnect(){}};globalThis.devicePixelRatio=1;globalThis.requestAnimationFrame=f=>{callback=f;return 1};globalThis.cancelAnimationFrame=()=>{};
 const canvas={isConnected:true,width:390,height:500,getBoundingClientRect:()=>({width:390,height:500,left:0,top:0}),getContext:()=>({}),setPointerCapture(){}};
 const context=vm.createContext({TILE:88,sectionBounds,portalTapDestination,CAMERA_DRAG_THRESHOLD_PX:8,createInputState:()=>({pts:new Map()}),document:globalThis.document,save:{state:s}});
 vm.runInContext(main.split('\n').filter(l=>l.startsWith('class Entity')||l.startsWith('class Camera')).join('\n')+'\nglobalThis.Entity=Entity;globalThis.Camera=Camera;',context);
 vm.runInContext(main.slice(main.indexOf('function path(w,'),main.indexOf('function stopGame()')),context);
 const g={};context.game=g;mountChapterTwoField(g,{canvas,Entity:context.Entity,Camera:context.Camera,findPath:context.path,drawScene:()=>draws++,bindInput:context.bindInput,updateTrail:()=>{},TILE:88,run,onSave(){},onContact:o=>{contacts.push(o);g.paused=true}});
 let now=performance.now();return {s,g,run,context,contacts,canvas,listeners,tick(n){for(let i=0;i<n;i++){now+=40;callback(now)}},tap(x,y){const q=g.camera.world((x+.5)*88,(y+.5)*88),e={pointerId:1,clientX:q.x,clientY:q.y};canvas.onpointerdown(e);canvas.onpointerup(e)},cleanup(){g.disposeChapterTwo();for(const [k,v]of Object.entries(old))if(v===undefined)delete globalThis[k];else globalThis[k]=v;}};
}
