import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const source=fs.readFileSync('world-raid-offline432-sw.js','utf8');
function fixture(){const handlers={},items=new Map();let network=true,claims=0;const cache={match:async key=>items.get(String(key))?.clone(),put:async(key,r)=>items.set(String(key),r.clone())};const context={URL,Response,Set,Array,Promise,Error,self:{location:{href:'https://game.test/abyss/world-raid-offline432-sw.js'},addEventListener:(type,fn)=>handlers[type]=fn,skipWaiting:async()=>{},clients:{claim:async()=>claims++}},caches:{open:async()=>cache},fetch:async request=>{if(!network)throw new Error('offline');return new Response('cached:'+String(request.url??request));}};vm.runInNewContext(source,context);return {handlers,items,setOnline:v=>network=v,claims:()=>claims};}
test('service worker caches boot files, then serves modules with version queries and navigation offline',async()=>{
 const f=fixture();let task,result;f.handlers.message({data:{type:'prepareWorldRaid430',urls:['./index.html','./src/main.js','./src/core/config.js']},ports:[{postMessage:m=>result=m}],waitUntil:p=>task=p});await task;assert.equal(result.ok,true);f.setOnline(false);
 let response;f.handlers.fetch({request:{method:'GET',url:'https://game.test/abyss/src/main.js?v=3.1.111-build432',mode:'cors'},respondWith:p=>response=p});assert.match(await(await response).text(),/src\/main.js/);
 f.handlers.fetch({request:{method:'GET',url:'https://game.test/abyss/',mode:'navigate'},respondWith:p=>response=p});assert.match(await(await response).text(),/index.html/);
});
test('offline cache never intercepts WebSocket, API POSTs or external origins',()=>{
 const f=fixture();for(const request of [{method:'POST',url:'https://game.test/abyss/api',mode:'cors'},{method:'GET',url:'https://other.test/src/main.js',mode:'cors'},{method:'GET',url:'https://game.test/party',mode:'cors'}])f.handlers.fetch({request,respondWith:()=>assert.fail('unrelated traffic intercepted')});
});
test('failed prefetch reports failure and cannot claim offline readiness',async()=>{
 const f=fixture();f.setOnline(false);let task,result;f.handlers.message({data:{type:'prepareWorldRaid430',urls:['./index.html']},ports:[{postMessage:m=>result=m}],waitUntil:p=>task=p});await task;assert.equal(result.ok,false);
});
test('offline boot manifest includes every runtime dependency and only files that exist',()=>{
 const urls=JSON.parse(fs.readFileSync('world-raid-offline432-assets.json','utf8'));assert.ok(urls.includes('./index.html'));assert.ok(urls.includes('./src/worldRaid/WorldRaidClient430.js'));assert.ok(urls.includes('./src/worldRaid/WorldRaidClient432.js'));assert.ok(urls.includes('./src/worldRaid/WorldRaidRules432.js'));assert.ok(urls.includes('./src/Styles/build432-world-raid.css'));for(const u of urls)assert.ok(fs.existsSync(u),u);
 const graph=JSON.parse(fs.readFileSync('tools/build430/runtime-sources.json','utf8'));for(const name of Object.keys(graph)){assert.ok(urls.includes('./src/worldRaid/runtime430/'+name),name);assert.doesNotMatch(fs.readFileSync('src/worldRaid/runtime430/'+name,'utf8'),/from\s*["']node:/);}
});
