import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('the live import map, offline cache and version advertise every hockey module consistently',async()=>{
  const html=await read('index.html'),imports=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
  const assets=JSON.parse(await read('world-raid-offline568-assets.json'));
  const files=['src/ricochet550/Audio565.js','src/ricochet550/Hockey564.js','src/ricochet550/Board564.js','src/ricochet550/Teams564.js','src/ricochet550/Rules550.js','src/ricochet550/View550.js','src/party/Arcade563.js','src/party/PartyGames462.js','src/party/PartyView462.js','src/race/RaceClient451.js','src/core/config.js','src/worldRaid/WorldRaidOfflineCache430.js'];
  for(const f of files){const canonical='./'+f,target=imports[canonical];assert(/^\.\/src\/.+\?v=3\.1\.(244-build565|245-build566|246-build567|247-build568)$/.test(target));assert.equal(imports[canonical],target);assert(assets.includes(target));assert((await read(f)).length>0);for(const key of Object.keys(imports).filter(k=>k.split('?')[0]===canonical))assert.equal(imports[key],target);}
  assert(html.includes('register("./world-raid-offline568-sw.js"'));assert(html.includes('endsWith("/world-raid-offline568-sw.js")'));
  assert(html.includes('const ASSET_VERSION = "3.1.247"'));assert(html.includes('const ASSET_BUILD = "build568"'));
  const css='./src/Styles/build565-hockey.css?v=3.1.244-build565';assert(html.includes(css));assert(assets.includes(css));
  assert((await read('src/core/config.js')).includes('APP_VERSION="3.1.247"'));
  const old=await read('world-raid-offline563-sw.js'),next=await read('world-raid-offline568-sw.js');assert.equal(next,old.replaceAll('build563','build568'));
});
