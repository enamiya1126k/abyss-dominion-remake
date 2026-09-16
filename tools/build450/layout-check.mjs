import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{spawn}from'node:child_process';
const{chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const server=spawn(process.execPath,['tools/build450/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],rows=[];
try{
 await new Promise((r,j)=>{const timer=setTimeout(()=>j(Error('server timeout')),30000);server.stdout.on('data',b=>{if(String(b).includes('Preview http')){clearTimeout(timer);r()}});server.on('exit',c=>j(Error('server exit '+c)))});
 const executable=path.resolve('../browser445-133/chromium');fs.chmodSync(executable,0o755);browser=await chromium.launch({executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:{...process.env,LD_LIBRARY_PATH:path.dirname(executable)}});
 const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:'no-preference',deviceScaleFactor:3,isMobile:true,hasTouch:true});page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1'||/\.(mp3|ogg)$/.test(u.pathname))return r.abort();return r.continue()});await page.routeWebSocket('**/*',s=>s.close());await page.goto('http://127.0.0.1:8441');await page.waitForFunction(()=>window.ready445);


 await page.evaluate(()=>qa450.ranking({party:[]}));await page.setViewportSize({width:393,height:852});
 await page.waitForTimeout(1500);console.log(await page.locator('.practice-challenge450:enabled').first().evaluate(e=>{let s=getComputedStyle(e);return {source:s.borderImageSource,slice:s.borderImageSlice,width:s.borderImageWidth,root:s.getPropertyValue('--button438')}}));
 await page.screenshot({path:'docs/build450/ranking-layout.png'});
}finally{await browser?.close();server.kill();}
