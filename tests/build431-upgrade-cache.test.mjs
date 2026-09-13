import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8');
const source=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replaceAll('import(', 'loadModule(').replace('refreshStaleAssets();','globalThis.bootPromise=refreshStaleAssets();');
function fixture({current=false,failRegistration=false}={}){
 const stored=new Map([['abyss-dominion-asset-version',current?'3.1.116-build437':'3.1.114-build435'],['save-record','{"pendingResult":true,"gutsUsed":true}']]),events=[],listeners=new Map(),scope='https://game.test/abyss/';
 const workers={controller:{scriptURL:scope+(current?'world-raid-offline437-sw.js':'world-raid-offline435-sw.js')},getRegistrations:async()=>[{scope,unregister:async()=>events.push('unregister-own')},{scope:'https://game.test/other/',unregister:async()=>events.push('unregister-other')}],register:async()=>{if(failRegistration)throw new Error('offline');events.push('register');},addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type)};
 const context={URL,Promise,Error,setTimeout,clearTimeout,window:{caches:true},location:{href:scope},navigator:{serviceWorker:workers},console:{warn:()=>{}},localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)},caches:{keys:async()=>['abyss-world-offline-build431','other-app-cache'],delete:async name=>events.push('delete:'+name)},loadModule:async name=>{events.push(name.includes('/main.js')?'load-main':'load-cache-helper');return {prepareOfflineCache430:async()=>events.push('warm-boot')};}};
 vm.runInNewContext(source,context);return {stored,events,context,activate(){workers.controller={scriptURL:scope+'world-raid-offline437-sw.js'};events.push('activated');listeners.get('controllerchange')?.();}};
}
test('upgrade waits for the new worker, preserves saved results and warms code without reserving another ticket',async()=>{
 const f=fixture();await new Promise(setImmediate);assert.ok(f.events.includes('register'));assert.ok(!f.events.includes('load-main'));f.activate();await f.context.bootPromise;await new Promise(setImmediate);
 assert.ok(f.events.indexOf('activated')<f.events.indexOf('load-main'));assert.ok(f.events.includes('warm-boot'));assert.equal(f.stored.get('save-record'),'{"pendingResult":true,"gutsUsed":true}');assert.equal(f.stored.get('abyss-dominion-asset-version'),'3.1.116-build437');
 assert.ok(!f.events.includes('delete:other-app-cache'));assert.ok(!f.events.includes('unregister-other'));assert.equal(f.context.window.__abyssBootComplete,true);
});
test('same-build reload keeps the existing cache and does not download all boot files again',async()=>{
 const f=fixture({current:true});await f.context.bootPromise;await new Promise(setImmediate);assert.ok(f.events.includes('load-main'));assert.ok(!f.events.some(e=>e.startsWith('delete:')));assert.ok(!f.events.includes('warm-boot'));
});
test('offline worker registration failure does not delete native battle or result records or block game boot',async()=>{
 const f=fixture({current:true,failRegistration:true});await f.context.bootPromise;assert.ok(f.events.includes('load-main'));assert.equal(f.stored.get('save-record'),'{"pendingResult":true,"gutsUsed":true}');
});
