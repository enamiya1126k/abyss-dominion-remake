// Run from the repository root. Requires Playwright and a Chromium executable.
// All application traffic is restricted to this local fixture server.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const output=process.env.RAID_QA_DIR??'/tmp/abyss-build432-qa';fs.mkdirSync(output,{recursive:true});
const server=spawn(process.execPath,['tools/build432/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});
let browser;const errors=[],missing=new Set(),checks=[];
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Preview server timeout')),10000);server.stdout.on('data',b=>{if(b.toString().includes('Preview http')){clearTimeout(timer);resolve();}});server.on('error',reject);});
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:393,height:720},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.add(new URL(r.url()).pathname);});
 await page.goto('http://127.0.0.1:8432');await page.waitForFunction(()=>window.ready432);await page.waitForSelector('.raid-ranks432 li strong');
 const shot=async name=>page.screenshot({path:path.join(output,name+'.png')});
 const scrolling=async()=>{const result=await page.locator('.raid-scroll432').evaluate(el=>{el.scrollTop=el.scrollHeight;return {top:el.scrollTop,max:el.scrollHeight-el.clientHeight,width:el.scrollWidth,client:el.clientWidth};});assert.ok(result.top>0);assert.ok(Math.abs(result.max-result.top)<2);assert.ok(result.width<=result.client+1);checks.push('scroll '+JSON.stringify(result));};
 for(const size of [{width:393,height:720},{width:375,height:620},{width:1280,height:800}]){await page.setViewportSize(size);await page.locator('.raid-scroll432').evaluate(el=>el.scrollTop=0);assert.ok(await page.locator('[data-world-start]').isVisible());const b=await page.locator('.raid-footer432').boundingBox();assert.ok(b.y+b.height<size.height,JSON.stringify({size,b}));checks.push('lobby fits '+JSON.stringify(size));}
 await page.setViewportSize({width:393,height:720});await shot('lobby432');
 await page.locator('[data-raid-details432="offline"]>summary').click();await scrolling();await page.locator('.raid-scroll432').evaluate(el=>el.scrollTop=0);
 await page.locator('[data-raid-exchange432]').click();for(const id of ['abyss-amalga','zero-sovereign','vajra-beast']){await page.locator(`[data-raid-shop-boss432="${id}"]`).click();assert.equal(await page.locator('[data-raid-buy432]').count(),3);}await shot('exchange432');
 await page.setViewportSize({width:375,height:540});await scrolling();await page.setViewportSize({width:393,height:720});await page.locator('[data-raid-lobby432]').click();
 await page.locator('[data-world-panel429="ranking"]').first().click();await page.waitForSelector('.world-ranking429');await page.setViewportSize({width:375,height:540});await scrolling();await page.setViewportSize({width:393,height:720});await page.locator('[data-raid-lobby432]').click();
 await page.locator('[data-world-start]').click();await page.waitForSelector('.battle-screen');
 assert.equal(await page.locator('.battle-unit.combatant').count(),4);assert.equal(await page.locator('.enemy-combatant').count(),3);assert.equal(await page.locator('.enemy-battle-magic-circle').count(),1);assert.equal(await page.locator('.raid-main-boss .enemy-battle-magic-circle').count(),1);
 await page.locator('[data-online-battle-auto]').click();await page.waitForSelector('[data-command="attack"]');await scrolling();await shot('battle-controls432');await page.locator('.raid-scroll432').evaluate(el=>el.scrollTop=0);await shot('battle432');
 await page.evaluate(()=>fetch('/finish-test'));await page.locator('[data-command="attack"]').click();
 for(let i=0;i<3;i++){if(await page.locator('[data-command="attack"]').count())await page.locator('[data-command="attack"]').click();}
 await page.waitForSelector('.contribution-list');assert.equal(await page.locator('.contribution-list>article').count(),4);await shot('contribution432');await scrolling();await page.locator('[data-modal-primary]').click();await page.waitForSelector('.raid-reward432');await shot('reward432');await page.locator('[data-modal-primary]').click();await page.waitForSelector('[data-world-start]');assert.equal(await page.locator('.game-modal').count(),0);checks.push('battle → contribution → reward → lobby');
 assert.deepEqual(errors,[]);assert.deepEqual([...missing],[]);
 const result={checks,errors,missing:[...missing]};fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser?.close();server.kill();}
