import fs from 'node:fs';import assert from 'node:assert/strict';import path from 'node:path';
import {attributeCycleVisual,attributeVisual} from '../../src/ui/components/AttributeVisual.js';
import {ATTRIBUTE_CYCLE} from '../../src/data/attributes.js';
const html=fs.readFileSync('index.html','utf8'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports,changed=JSON.parse(fs.readFileSync('docs/build440/changed-runtime.json')),assets=JSON.parse(fs.readFileSync('world-raid-offline440-assets.json'));
for(const name of changed){assert.equal(map['./'+name],'./'+name+'?v=3.1.119-build440');assert.ok(assets.includes('./'+name));for(const [from,to]of Object.entries(map))if(from.split('?')[0]==='./'+name)assert.equal(to,'./'+name+'?v=3.1.119-build440');}
assert.ok(!Object.keys(map).some(k=>k.includes('/runtime430/')));assert.ok(html.includes('world-raid-offline440-sw.js'));assert.ok(html.includes('build440-visual.css?v=3.1.119-build440'));assert.ok(fs.readFileSync('src/worldRaid/WorldRaidOfflineCache430.js','utf8').includes('world-raid-offline440-assets.json'));
for(const p of fs.readdirSync('assets/ui/build440'))assert.ok(assets.includes('./assets/ui/build440/'+p));
const known=new Set(JSON.parse(fs.readFileSync('docs/build440/baseline-required-paths.json','utf8')));for(const p of assets)assert.ok(fs.existsSync(p)||known.has(p.replace(/^\.\//,'')),p);
const graph=attributeCycleVisual();assert.deepEqual(ATTRIBUTE_CYCLE,['fire','ice','wind','earth','lightning','water']);assert.equal((graph.match(/<path /g)||[]).length,8);assert.equal((graph.match(/class="attribute-node440 /g)||[]).length,9);assert.ok(graph.includes('火から氷から風から土から雷から水から火'));assert.ok(graph.includes(attributeVisual('fire',{label:'火属性'})));assert.ok(!graph.includes('<img'));
console.log(JSON.stringify({changedRuntime:changed.length,cachedPaths:assets.length,generatedArt:8,nativeAtlasNodes:9,coloredArrows:8,frozenRuntimeAliased:false}));
