import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{spawn}from'node:child_process';
const{chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const server=spawn(process.execPath,['tools/build445/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],rows=[];
try{
 await new Promise((r,j)=>{const timer=setTimeout(()=>j(Error('server timeout')),30000);server.stdout.on('data',b=>{if(String(b).includes('Preview http')){clearTimeout(timer);r()}});server.on('exit',c=>j(Error('server exit '+c)))});
 const executable=path.resolve('../browser445-133/chromium');fs.chmodSync(executable,0o755);browser=await chromium.launch({executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:{...process.env,LD_LIBRARY_PATH:path.dirname(executable)}});
 const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:'no-preference',deviceScaleFactor:3,isMobile:true,hasTouch:true});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1'||/\.(png|webp|gif|jpe?g|mp3|ogg)$/.test(u.pathname))return r.abort();return r.continue()});await page.routeWebSocket('**/*',s=>s.close());await page.goto('http://127.0.0.1:8441');await page.waitForFunction(()=>window.ready445);
 await page.evaluate(()=>{
  qa440.home();const texts=['324,558','292,465','367,236','420,812'];
  document.querySelectorAll('.home-scene-power').forEach(e=>{e.style.setProperty('width','78px','important');e.style.setProperty('min-width','78px','important');e.style.setProperty('max-width','78px','important')});
  document.querySelectorAll('.home-scene-power-value').forEach((e,i)=>{e.textContent=texts[i];e.style.setProperty('font-size','18px','important')});
 });
 const before=await page.locator('.home-scene-power-value').evaluateAll(es=>es.map(e=>({text:e.textContent,available:e.clientWidth,needed:e.scrollWidth})));assert.ok(before.some(e=>e.needed>e.available+1));
 await page.evaluate(async()=>{const{installPowerTextFit446}=await import('/src/ui/PowerTextFit446.js');window.stopFit446=installPowerTextFit446(document.querySelector('#app'))});
 async function check(label){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.waitForFunction(()=>[...document.querySelectorAll('.home-scene-power-value')].length===4&&[...document.querySelectorAll('.home-scene-power-value')].every(e=>{const r=document.createRange();r.selectNodeContents(e);return r.getBoundingClientRect().width<=e.getBoundingClientRect().width+.1&&e.scrollWidth<=e.clientWidth+1}));assert.ok(await page.locator('.home-scene-power').evaluateAll(es=>es.every(e=>e.querySelector('i').getBoundingClientRect().bottom<=e.querySelector('.home-scene-power-value').getBoundingClientRect().top+.1)));const cells=await page.locator('.home-scene-power-value').evaluateAll(es=>es.map(e=>{const r=document.createRange();r.selectNodeContents(e);return{text:e.textContent,size:parseFloat(getComputedStyle(e).fontSize),available:e.getBoundingClientRect().width,needed:r.getBoundingClientRect().width,ellipsis:getComputedStyle(e).textOverflow}}));assert.ok(cells.every(e=>e.ellipsis!=='ellipsis'));rows.push({label,cells});return cells;}
 const fitted=await check('reported digits in 78px plates with enlarged font');assert.ok(fitted.every(e=>e.size<18));assert.deepEqual(fitted.map(e=>e.text),['324,558','292,465','367,236','420,812']);
 for(const width of [320,375,393,430,1280]){
  await page.setViewportSize({width,height:852});
  for(const plateWidth of [72,78,94,120]){
   await page.evaluate(w=>document.querySelectorAll('.home-scene-power').forEach(e=>{for(const p of ['width','min-width','max-width'])e.style.setProperty(p,w+'px','important')}),plateWidth);
   await check(`viewport ${width}, plate ${plateWidth}`);
  }
 }
 await page.evaluate(()=>document.querySelectorAll('.home-scene-power-value').forEach(e=>e.textContent='12'));const short=await check('short numbers restore original size');assert.ok(short.every(e=>e.size===18));
 await page.evaluate(()=>document.querySelectorAll('.home-scene-power-value').forEach(e=>e.textContent='999999'));await check('updated six-digit values');
 await page.evaluate(()=>document.querySelectorAll('.home-scene-power-value').forEach(e=>e.textContent='1,999,999'));await check('reference seven-digit value');
 await page.evaluate(()=>qa440.home());await check('home re-render reconnects fitter');
 for(const width of [320,375,393,430,1280]){
  await page.setViewportSize({width,height:852});await check(`native plate layout ${width}`);
  await page.evaluate(()=>document.querySelectorAll('.home-scene-power-value').forEach(e=>e.textContent='9,999,999'));await check(`native seven-digit layout ${width}`);
 }
 await page.setViewportSize({width:393,height:852});await check('reference screenshot');await page.screenshot({path:'docs/build446/home-layout.png'});
 await page.evaluate(()=>{qa437.menu('formation');qa440.home()});await check('navigation back home');
 const code=fs.readFileSync('src/main.js','utf8');assert.ok(code.includes('installPowerTextFit446(app);'));
 assert.deepEqual(errors,[]);fs.writeFileSync('docs/build446/browser-results.json',JSON.stringify({before,rows,errors},null,2)+'\n');console.log(JSON.stringify({passed:true,cases:rows.length,clippingReproduced:true,errors}));
}finally{await browser?.close();server.kill();}
