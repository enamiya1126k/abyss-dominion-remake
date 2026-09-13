import fs from 'node:fs';import assert from 'node:assert/strict';import{spawn}from'node:child_process';
const{chromium}=await import(process.env.PLAYWRIGHT_MODULE),server=spawn(process.execPath,['tools/build436/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],missing=new Set(),checks=[],metrics={};
try{
 await new Promise((r,j)=>{const t=setTimeout(()=>j(Error('server timeout')),20000);server.stdout.on('data',b=>{if(String(b).includes('Preview http')){clearTimeout(t);r();}});server.on('exit',code=>j(Error('server exited '+code)));});
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:393,height:720},isMobile:true});await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.routeWebSocket('**/*',s=>s.close());page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.add(new URL(r.url()).pathname)});
 await page.goto('http://127.0.0.1:8436');await page.waitForFunction(()=>window.ready436);

 for(const viewport of [{width:393,height:720},{width:1280,height:800}]){
  await page.setViewportSize(viewport);await page.evaluate(()=>qa436.normalCount());await page.locator('[data-gacha-count="100"]').scrollIntoViewIfNeeded();await page.waitForTimeout(400);await page.screenshot({path:'docs/build436/normal-count-'+viewport.width+'.png'});
  const rows=await page.locator('[data-gacha-count]').evaluateAll(nodes=>nodes.map(e=>({text:e.textContent,width:e.clientWidth,scroll:e.scrollWidth,b:e.querySelector('b').getBoundingClientRect().width})));
  assert.equal(rows.length,6);assert.ok(rows.every(r=>r.scroll<=r.width+1&&r.b<=r.width),'count clipped '+JSON.stringify(rows));checks.push('normal 1 to 100 summon labels fit '+viewport.width);
 }
 assert.deepEqual(errors,[]);assert.deepEqual([...missing],[]);
}finally{fs.writeFileSync('docs/build436/final-ui-result.json',JSON.stringify({checks,errors,missing:[...missing],metrics},null,2));await browser?.close();server.kill();console.log(JSON.stringify({checks:checks.length,errors,missing:[...missing],metrics}));}
