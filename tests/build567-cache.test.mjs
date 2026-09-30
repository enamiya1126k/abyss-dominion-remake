import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const read=f=>readFile(new URL('../'+f,import.meta.url),'utf8');
test('swipe: import aliases, cache manifest, CSS and advertised version load one coherent Build567',async()=>{
 const html=await read('index.html'),imports=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports,assets=JSON.parse(await read('world-raid-offline567-assets.json'));
 for(const p of ['core/config','cabbage/Rules484','cabbage/Signals491','cabbage/View484','cabbage/Swipe567','cabbage/Scene567','cabbage/Debris567','party/PartyGames462','party/PartyView462','race/RaceClient451','worldRaid/WorldRaidOfflineCache430']){
  const base='./src/'+p+'.js',target=base+'?v=3.1.246-build567';assert.equal(imports[base],target);assert.deepEqual(assets.filter(v=>v.split('?')[0]===base),[target]);for(const k of Object.keys(imports).filter(k=>k.split('?')[0]===base))assert.equal(imports[k],target);await read(base);
 }
 const css='./src/Styles/build567-cabbage-swipe.css?v=3.1.246-build567';assert(html.includes(css));assert(assets.includes(css));assert(html.includes('register("./world-raid-offline567-sw.js"'));assert((await read('src/race/RaceClient451.js')).includes('cabbageSwipe567:1'));
});
