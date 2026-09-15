import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const html=fs.readFileSync('index.html','utf8'),map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports,changed=JSON.parse(fs.readFileSync('docs/build446/changed-runtime.json')),assets=JSON.parse(fs.readFileSync('world-raid-offline446-assets.json'));
for(const name of changed){assert.equal(map['./'+name],'./'+name+'?v=3.1.125-build446');assert.ok(assets.includes('./'+name));for(const[from,to]of Object.entries(map))if(from.split('?')[0]==='./'+name)assert.equal(to,'./'+name+'?v=3.1.125-build446');execFileSync(process.execPath,['--check',name]);}
assert.ok(!Object.keys(map).some(k=>/\/runtime(430|443)\//.test(k)));assert.ok(html.includes('world-raid-offline446-sw.js'));
const frozen=JSON.parse(fs.readFileSync('tools/build443/runtime-sources.json'));for(const name of Object.keys(frozen))assert.ok(assets.includes('./src/worldRaid/runtime443/'+name));
const known=new Set(JSON.parse(fs.readFileSync('docs/build445/baseline-assets.json')));for(const p of assets)assert.ok(fs.existsSync(p)||known.has(p.replace(/^\.\//,'')),p);
assert.match(fs.readFileSync('src/core/config.js','utf8'),/APP_VERSION="3.1.125"/);assert.match(fs.readFileSync('src/worldRaid/WorldRaidOfflineCache430.js','utf8'),/world-raid-offline446-assets.json/);
assert.ok(assets.includes('./src/Styles/build446-power-fit.css'));assert.ok(html.includes('build446-power-fit.css?v=3.1.125-build446'));
console.log(JSON.stringify({changedRuntime:changed.length,cachedPaths:assets.length,frozenRule4Modules:Object.keys(frozen).length,frozenRuntimeAliased:false,syntax:'pass'}));
