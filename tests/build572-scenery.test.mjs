import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createRequire} from 'node:module';
import {WORLDS512,worldIndex512,worldRoute512,finishScenery512} from '../src/luck/Scenery512.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('rare secret world requires exact 1秭m and can be left when distance is lost',()=>{
 const end=10n**24n;assert.equal(worldIndex512(end-1n),8);assert.equal(worldIndex512(end.toString()),9);assert.equal(worldIndex512(10n**1000n),9);
 assert.deepEqual(worldRoute512({from:String(end+100n),to:'0',item:'dash'}).map(s=>s.index),[9,8,7,6,5,4,3,2,1,0]);assert.match(finishScenery512(end),/chaos.webp/);
});
test('all three new backgrounds decode at native aspect and stay below 700KB each',async()=>{
 const {loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');
 for(const w of WORLDS512.slice(7)){const url=new URL(w.src),b=readFileSync(url),im=await loadImage(url.pathname);assert.equal(im.width/im.height,1.5);assert(b.length<700000);}
});
test('current importmap and offline assets refresh scenery, CSS and worker together',()=>{
 const html=read('index.html'),imports=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports,assets=JSON.parse(read('world-raid-offline572-assets.json'));
 for(const p of ['src/luck/Scenery512.js','src/core/config.js','src/worldRaid/WorldRaidOfflineCache430.js']){const b='./'+p,t=b+'?v=3.1.251-build572';assert.equal(imports[b],t);assert(Object.entries(imports).filter(([k])=>k.split('?')[0]===b).every(([,v])=>v===t));assert(assets.includes(t));}
 for(const w of WORLDS512.slice(7))assert(assets.includes('./assets/luck572/'+w.id+'.webp'));
 assert(html.includes('build512-luck.css?v=3.1.251-build572'));assert(html.includes('register("./world-raid-offline572-sw.js"'));assert(read('world-raid-offline572-sw.js').includes('abyss-world-offline-build572'));
});
