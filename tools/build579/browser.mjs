import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createServer} from './preview.mjs';

const {chromium}=createRequire(import.meta.url)('playwright');
const html=await readFile('index.html','utf8');
const link=html.match(/<link[^>]+href="\.\/src\/Styles\/build579-luck-art\.css[^>]+>/)?.[0];
assert(link,'The production entry point must load the new stylesheet');
assert(html.indexOf(link)>html.indexOf('build571-luck.css'));
const server=createServer(link);await new Promise(r=>server.listen(0,'127.0.0.1',r));
const report={errors:[],failed:[],cases:[],nativeIPhone:false,scope:'Production luck view, rules and art; isolated screen fixture with the party lounge stubbed.'};
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.ABYSS_CHROMIUM_PATH||'/tmp/chromium',args:['--no-sandbox']});
  const page=await browser.newPage({isMobile:true,hasTouch:true,viewport:{width:390,height:740}});
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)report.failed.push(r.url())});
  const url='http://127.0.0.1:'+server.address().port;
  await page.goto(url+'/?before');
  await page.waitForFunction(()=>window.ready&&c.lkUI511.artReady);
  const oldCss=(await readFile('src/Styles/build571-luck.css','utf8')).replace('luck577/items.webp','luck575/items.webp');
  await page.evaluate(async css=>{
    await navigator.serviceWorker.register('/world-raid-offline575-sw.js');await navigator.serviceWorker.ready;
    await new Promise(r=>{if(navigator.serviceWorker.controller)return r();navigator.serviceWorker.addEventListener('controllerchange',r,{once:true})});
    const cache=await caches.open('abyss-world-offline-build575');
    await cache.put(new URL('/src/Styles/build571-luck.css',location.href),new Response(css,{headers:{'Content-Type':'text/css'}}));
  },oldCss);
  await page.reload();await page.waitForFunction(()=>window.ready&&c.lkUI511.artReady);
  await page.evaluate(()=>{load('hand');c.state.luck.hand=['regalia','podium','frontier','usurper'];c.render()});
  await page.evaluate(()=>document.fonts.ready);
  report.reproducedBackground=await page.locator('[data-item="regalia"]').first().evaluate(e=>getComputedStyle(e).backgroundImage);
  assert(report.reproducedBackground.includes('/assets/luck575/items.webp'));
  await page.screenshot({path:'docs/build579/before.jpg',type:'jpeg',quality:86});

  // Keep the old worker and opaque-atlas CSS cached throughout this navigation.
  await page.goto(url);await page.waitForFunction(()=>window.ready&&c.lkUI511.artReady);
  report.oldWorker=await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL);
  assert(report.oldWorker.endsWith('/world-raid-offline575-sw.js'));
  assert(await page.evaluate(async()=>{
    const cache=await caches.open('abyss-world-offline-build575');
    return (await (await cache.match(new URL('/src/Styles/build571-luck.css',location.href))).text()).includes('luck575/items.webp');
  }));
  const groups=[['hunter','combo','mile','pioneer'],['sprint','resonance','vault','phoenix'],['salvage','anchor','streak','interest'],['regalia','podium','frontier','usurper']];
  for(const size of [{width:390,height:740},{width:320,height:568}]){
    await page.setViewportSize(size);
    for(const ids of groups){
      for(let pick=0;pick<4;pick++){
        await page.evaluate(ids=>{load('hand');c.state.luck.hand=ids;c.raw=(kind,msg)=>{window.sent=msg;return true};c.render()},ids);
        const art=await page.locator('.lk-hand508 .lk-art508').evaluateAll(es=>es.map(e=>({item:e.dataset.item,url:getComputedStyle(e).backgroundImage,size:getComputedStyle(e).backgroundSize})));
        assert.equal(art.length,4);
        for(const a of art){const later=groups[3].includes(a.item);assert(a.url.includes('/assets/luck579/items-'+(later?'575':'571')+'.webp'));assert.equal(a.size,later?'200% 200%':'400% 300%')}
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        await page.locator('[data-hand-pick511="'+pick+'"]').tap();
        assert.equal(await page.evaluate(()=>sent.index),pick);
        assert.equal(await page.evaluate(()=>sent.kind),'hand');
        report.cases.push({...size,item:ids[pick],art});
      }
    }
  }
  await page.setViewportSize({width:390,height:740});
  await page.evaluate(()=>{load('hand');c.state.luck.hand=['regalia','podium','frontier','usurper'];c.render()});
  await page.screenshot({path:'docs/build579/after.jpg',type:'jpeg',quality:86});
  await page.evaluate(()=>{lobby(true);document.querySelector('.lk-catalog508').open=true;document.querySelectorAll('.lk-catalog508 article').forEach(a=>{if(!a.querySelector('[data-atlas="571"],[data-atlas="575"]'))a.remove()})});
  await page.locator('.lk-catalog508').screenshot({path:'docs/build579/catalog.jpg',type:'jpeg',quality:86});
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failed,[]);
}finally{
  await browser?.close();await new Promise(r=>server.close(r));
  await writeFile('docs/build579/browser.json',JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({cases:report.cases.length,errors:report.errors,failed:report.failed,reproducedBackground:report.reproducedBackground,oldWorker:report.oldWorker}));
