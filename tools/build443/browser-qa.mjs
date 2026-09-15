import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const{chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const server=spawn(process.execPath,['tools/build443/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],missing=new Set(),rows=[];
try{
 await new Promise((r,j)=>{const t=setTimeout(()=>j(Error('server timeout')),20000);server.stdout.on('data',b=>{if(String(b).includes('Preview http')){clearTimeout(t);r();}});server.on('exit',c=>j(Error('server exit '+c)));});
 browser=await chromium.launch({executablePath:path.resolve('../browser440/chromium'),args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:{...process.env,LD_LIBRARY_PATH:path.resolve('../browser440')}});
 const page=await browser.newPage({viewport:{width:393,height:720},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.add(new URL(r.url()).pathname)});await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.routeWebSocket('**/*',s=>s.close());await page.goto('http://127.0.0.1:8441');await page.waitForFunction(()=>window.ready443);
 for(const size of [{width:393,height:720},{width:1280,height:800}]){
  await page.setViewportSize(size);
  for(const id of ['raid_vajra_beast','raid_zero_sovereign','reincarnation','ch2_dream394']){
   await page.evaluate(id=>qa443.circles(id),id);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   const title=await page.locator('.magic-circle-workshop header h3').innerText();const summary=await page.locator('.magic-circle-workshop header p').innerText();assert.ok(!summary.includes('NaN'));assert.match(summary,/[％%]/);
   rows.push({width:size.width,id,title,summary});if(size.width===393)await page.screenshot({path:`docs/build443/${id}-393.png`});
  }
 }
 await page.evaluate(()=>document.querySelectorAll('.game-modal').forEach(e=>e.remove()));assert.equal(await page.evaluate(()=>qa443.attack()),true);
 assert.deepEqual(errors,[]);assert.deepEqual([...missing],[]);console.log(JSON.stringify({rows,errors,missing:[...missing],nativeAttack:true}));
}finally{fs.writeFileSync('docs/build443/browser-results.json',JSON.stringify({rows,errors,missing:[...missing]},null,2));await browser?.close();server.kill();}
