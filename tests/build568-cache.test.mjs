import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('Build568 loads updated handling, perspective, menu and protocol through one canonical cache URL',async()=>{
 const html=await read('index.html'),imports=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
 const assets=JSON.parse(await read('world-raid-offline568-assets.json'));
 for(const p of ['ricochet550/Control568','ricochet550/Hockey564','ricochet550/Board564','ricochet550/Teams564','ricochet550/View550','ricochet550/Rules550','party/PartyView462','race/RaceClient451','core/config','worldRaid/WorldRaidOfflineCache430']){
  const base='./src/'+p+'.js',target=base+'?v=3.1.247-build568';assert.equal(imports[base],target);
  for(const key of Object.keys(imports).filter(k=>k.split('?')[0]===base))assert.equal(imports[key],target);
  assert.deepEqual(assets.filter(a=>a.split('?')[0]===base),[target]);assert((await read(base)).length>0);
 }
 assert(html.includes('const ASSET_VERSION = "3.1.247"'));assert(html.includes('const ASSET_BUILD = "build568"'));
 assert(html.includes('register("./world-raid-offline568-sw.js"'));assert(html.includes('endsWith("/world-raid-offline568-sw.js")'));
 assert((await read('src/core/config.js')).includes('APP_VERSION="3.1.247"'));
});
