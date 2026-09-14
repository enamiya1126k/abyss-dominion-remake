import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{spawn}from'node:child_process';
const{chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const server=spawn(process.execPath,['tools/build441/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],missing=new Set(),metrics={};
try{
 await new Promise((r,j)=>{const timer=setTimeout(()=>j(Error('server timeout')),20000);server.stdout.on('data',b=>{if(String(b).includes('Preview http')){clearTimeout(timer);r()}});server.on('exit',c=>j(Error('server exit '+c)))});
 browser=await chromium.launch({executablePath:path.resolve('../browser440/chromium'),args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:{...process.env,LD_LIBRARY_PATH:path.resolve('../browser440')}});
 const page=await browser.newPage({viewport:{width:393,height:720},isMobile:true,reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.add(new URL(r.url()).pathname)});await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.routeWebSocket('**/*',s=>s.close());
 await page.goto('http://127.0.0.1:8441');await page.waitForFunction(()=>window.ready441);
 for(const size of [{width:393,height:720},{width:375,height:540},{width:430,height:760},{width:1280,height:800}]){
  await page.setViewportSize(size);
  for(const kind of ['home','lobby','circles','battle']){
   await page.evaluate(k=>qa441[k](),kind);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,kind+' overflow '+size.width);
   if(size.width===393)await page.screenshot({path:`docs/build441/${kind}-393.png`});
   if(kind==='home')metrics['home-'+size.width]=await page.evaluate(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};return{diagram:rect('.home-attribute-orbit'),banner:rect('.home-formation-banner')};});
   if(kind==='lobby')assert.equal(await page.locator('.raid-lobby-ranking441 .raid-ranking-row439').count(),3);
   if(kind==='circles'){const list=page.locator('.magic-circle-list');await list.evaluate(e=>e.scrollTop=e.scrollHeight);const last=page.locator('[data-circle-row405="ch2_reserve398"]');metrics['circle-last-'+size.width]=await last.evaluate(e=>{const r=e.getBoundingClientRect(),b=e.closest('.magic-circle-list').getBoundingClientRect();return{bottom:r.bottom,listBottom:b.bottom}});if(size.width===393)await page.screenshot({path:'docs/build441/circles-last-393.png'});}
  }
 }
 await page.setViewportSize({width:393,height:720});await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>qa441.battle());await page.waitForTimeout(100);
 for(const element of ['fire','ice','water','wind','earth','lightning','light','dark']){assert.ok(await page.evaluate(e=>qa441.effect(e),element),'effect target');await page.waitForTimeout(160);if(element==='ice'||element==='dark')await page.screenshot({path:`docs/build441/effect-${element}-393.png`});await page.waitForFunction(()=>!document.querySelector('.battle-effects441'),{},{timeout:4000});}
 await page.evaluate(()=>{for(let i=0;i<24;i++)qa441.effect('fire');});assert.equal(await page.locator('.battle-effects441').count(),1,'one shared canvas');await page.waitForFunction(()=>!document.querySelector('.battle-effects441'),{},{timeout:4000});
 console.log(JSON.stringify({errors,missing:[...missing],metrics}));
}finally{fs.writeFileSync('docs/build441/browser-results.json',JSON.stringify({errors,missing:[...missing],metrics},null,2));await browser?.close();server.kill();}
