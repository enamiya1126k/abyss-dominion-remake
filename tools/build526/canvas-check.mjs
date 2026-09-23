// Real game renderer with native Canvas. These are not browser/iPhone screenshots.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {catch525} from '../../src/fishing/Catches525.js';
import {makeFishing524,startFishing524,advanceFishing524} from '../../src/fishing/Rules524.js';
import {renderer524,resize524,paint524} from '../../src/fishing/Renderer524.js';
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
const root=new URL('../../',import.meta.url),out=new URL('docs/build526/',root);mkdirSync(out,{recursive:true});
globalThis.document={createElement:()=>createCanvas(1,1)};
const r=renderer524(createCanvas(390,430));
r.pond=await loadImage(new URL('assets/fishing524/pond.webp',root).pathname);
r.atlas=await loadImage(new URL('assets/fishing524/fish-atlas.webp',root).pathname);
r.shadow526=await loadImage(new URL('assets/fishing526/fish-shadow.webp',root).pathname);
for(const name of ['river','rare','oddities','lord'])r.atlases525[name]=await loadImage(new URL('assets/fishing525/'+name+'.webp',root).pathname);
const g=makeFishing524({id:'visual526',code:'FISH',hostId:'p0',members:Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'P'+i,choice:{speciesId:'slime'}}))});startFishing524(g,0,526);advanceFishing524(g,3000);
g.elapsed=60000;g.lastAt=g.startAt+g.elapsed;g.events=[];
g.shoals=[{id:1,tier:4,x:.52,y:.205,readyAt:0},{id:2,tier:2,x:.7,y:.3,readyAt:0},{id:3,tier:1,x:.25,y:.46,readyAt:0},{id:4,tier:0,x:.68,y:.64,readyAt:0},{id:5,tier:2,x:.4,y:.6,readyAt:0}];
for(const p of g.players){p.mode='waiting';p.castX=.32+p.seat*.13;p.castY=.20+p.seat*.15;p.castAt=59000}
let serial=0;
for(const [w,h]of [[320,240],[375,380],[390,430],[430,600]]){
 resize524(r,w,h,3);const builds=r.cacheBuilds;
 for(const name of ['perspective','reel','ease','critical','catch']){
  const p=g.players[0];p.mode=name==='perspective'?'waiting':'fight';p.castX=.42;p.castY=name==='perspective'?.2:.48;p.progress=.44;p.tension=name==='critical'?.91:name==='ease'?.58:.25;p.fish={...catch525('arowana'),rhythm:0,value:300};p.hookedAt=60000-(name==='ease'?2850:name==='critical'?3700:1200);g.events=[];
  if(name==='catch'){p.mode='landing';g.events=[{id:++serial,type:'land',at:58900,seat:0,x:.3,y:.67,fish:p.fish}]}
  r.motion526.clear();paint524(r,g,g.lastAt,false,'p0');assert.equal(r.cacheBuilds,builds);assert.equal(r.dpr,1.5);
  if(w===390)writeFileSync(new URL(name+'.webp',out),r.canvas.toBuffer('image/webp'));
 }
}
console.log('Native Canvas: perspective, reel, ease, critical, catch × 4 mobile stage sizes; cached background; DPR cap 1.5.');
