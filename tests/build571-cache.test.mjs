import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Build571 updated modules, generated art, CSS, offline worker and protocol gates move together',()=>{
 const html=read('index.html'),imports=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports,assets=JSON.parse(read('world-raid-offline571-assets.json'));
 for(const p of ['luck/Rules511','luck/Items511','luck/Items571','luck/Buffs571','luck/Presentation571','luck/Presentation511','luck/Equipment562','luck/Descriptions562','luck/View511','core/config','race/RaceClient451','party/PartyView462','worldRaid/WorldRaidOfflineCache430']){
  const base='./src/'+p+'.js',target=base+'?v=3.1.250-build571';assert.equal(imports[base],target);assert(Object.entries(imports).filter(([key])=>key.split('?')[0]===base).every(([,v])=>v===target));assert(assets.includes(target));
 }
 for(const path of ['./assets/luck571/items.webp','./assets/luck571/barrier.webp','./src/Styles/build571-luck.css?v=3.1.250-build571'])assert(assets.includes(path));
 assert(html.includes('register("./world-raid-offline571-sw.js"'));assert(html.includes('build571-luck.css?v=3.1.250-build571'));
 for(const path of ['online-server/src/LuckCoordinator511.js','online-server/src/PartyCoordinator462.js','online-server/src/RaceCoordinator451.js','src/race/RaceClient451.js','src/party/PartyView462.js'])assert(read(path).includes('luckVersion571'));
});
