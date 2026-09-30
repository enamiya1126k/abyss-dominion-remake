import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const read=f=>readFile(new URL('../'+f,import.meta.url),'utf8');
test('crane: every new or changed front-end module has one current import target and offline cache entry',async()=>{
 const html=await read('index.html'),imports=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports,assets=JSON.parse(await read('world-raid-offline567-assets.json'));
 const changed=['core/config','crane566/Rules566','crane566/Board566','crane566/View566','party/PartyGames462','party/PartyView462','party/PartyResults490','race/RaceClient451','race/RacePresentation452','race/RaceUX458','worldRaid/WorldRaidOfflineCache430'];
 for(const path of changed){const base='./src/'+path+'.js',target=imports[base];assert(/^.*[?]v=3.1.(245-build566|246-build567)$/.test(target));assert.equal(imports[base],target);assert(assets.includes(target));for(const key of Object.keys(imports).filter(k=>k.split('?')[0]===base))assert.equal(imports[key],target);await read(base);}
 for(const path of ['assets/crane566/arena.webp','assets/crane566/cover.webp','assets/crane566/chest.webp','assets/crane566/mimic.webp'])assert(assets.includes('./'+path));
 assert(html.includes('./src/Styles/build566-crane.css?v=3.1.245-build566'));assert(html.includes('register("./world-raid-offline567-sw.js"'));assert((await read('online-server/server.js')).includes('monsterRace451.advanceCrane566()'));
});
