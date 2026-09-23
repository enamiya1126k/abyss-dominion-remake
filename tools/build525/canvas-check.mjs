// Native Canvas visual evidence, not a browser/phone screenshot.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {CATCHES525,catch525} from '../../src/fishing/Catches525.js';
import {makeFishing524,startFishing524,advanceFishing524} from '../../src/fishing/Rules524.js';
import {renderer524,resize524,paint524,drawCatch525} from '../../src/fishing/Renderer524.js';
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
const root=new URL('../../',import.meta.url),out=new URL('docs/build525/',root);
mkdirSync(out,{recursive:true});
globalThis.document={createElement:()=>createCanvas(1,1)};
const r=renderer524(createCanvas(390,430));
r.pond=await loadImage(new URL('assets/fishing524/pond.webp',root).pathname);
r.atlas=await loadImage(new URL('assets/fishing524/fish-atlas.webp',root).pathname);
for(const name of ['river','rare','oddities','lord'])r.atlases525[name]=await loadImage(new URL('assets/fishing525/'+name+'.webp',root).pathname);
const gallery=createCanvas(1280,720),c=gallery.getContext('2d');c.fillStyle='#123c30';c.fillRect(0,0,1280,720);
for(const [i,fish]of CATCHES525.entries()){const x=(i%8)*160+80,y=Math.floor(i/8)*180+78;drawCatch525(c,r,fish,x,y,138);c.fillStyle='#f3dfb0';c.font='14px sans-serif';c.textAlign='center';c.fillText(fish.id,x,y+85)}
writeFileSync(new URL('catch-gallery.webp',out),gallery.toBuffer('image/webp'));
const g=makeFishing524({id:'visual525',code:'FISH',partyId:'p',hostId:'p0',members:Array.from({length:4},(_,i)=>({playerId:'p'+i,name:'P'+i,choice:{speciesId:'slime'}}))});startFishing524(g,0,525);advanceFishing524(g,3000);g.elapsed=100000;g.lastAt=g.startAt+g.elapsed;
const scenes=[['lord-landing','land','lord',800],['boot-chain','chain','boot',350],['gold-landing','land','arowana',650]];
for(const [w,h]of [[320,240],[375,380],[390,430],[430,600]]){
 resize524(r,w,h,3);const builds=r.cacheBuilds;
 for(const [name,type,id,age]of scenes){const f={...catch525(id),value:100,chainDepth525:id==='lord'?0:2},e={type,id:1,at:g.elapsed-age,seat:1,x:.43,y:.67,fish:f,from:f};g.events=[e];paint524(r,g,g.lastAt,false,'p0');assert.equal(r.cacheBuilds,builds);if(w===390)writeFileSync(new URL(name+'.webp',out),r.canvas.toBuffer('image/webp'))}
}
console.log('Native Canvas: 32 art cells + 3 animated scenes × 4 mobile stage sizes; DPR ≤1.5; no background rebuild per frame.');
