// Real input and simulation only: no forced player placement or seal completion.
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const server=spawn(process.execPath,['tools/build559/qa-server.mjs'],{cwd:process.cwd(),env:{...process.env,PLAYWRIGHT_WS_MODULE:'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/lib/utilsBundle.js'},stdio:['ignore','pipe','pipe']});
server.stderr.on('data',b=>process.stderr.write(b));await new Promise((yes,no)=>{server.stdout.on('data',b=>{if(String(b).includes('QA ready'))yes()});server.on('exit',code=>no(Error('server exit '+code)))});
let browser;try{
 const api=async(path,body={})=>(await fetch('http://127.0.0.1:8559/qa/'+path,{method:'POST',body:JSON.stringify(body)})).json();
 await api('reset',{phase:'hiding',role:'hider',humans:1,seed:559});
 browser=await chromium.launch({executablePath:'/workspace/scratch/f849e4a30ac8/runtime546/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:740},deviceScaleFactor:2,isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8559/preview.html?self=p0');await page.waitForFunction(()=>window.qaReady);await page.evaluate(()=>document.fonts.ready);
 await page.locator('[data-hd-goal559="seal:2"]').click();await page.waitForFunction(()=>window.sent559?.some(m=>m.target));await api('advance',{ms:23400});await page.waitForFunction(()=>window.c.state.hide.elapsed>=3400);await page.waitForTimeout(180);
 const g=await api('state');assert.equal(g.phase,'play');assert(g.players[0].interacting541);assert(g.heist541.seals[2].alarmUntil>g.elapsed);await mkdir('../output',{recursive:true});const area=await page.locator('[data-hd-stage]').boundingBox();await page.screenshot({path:'../output/ABYSS_Build559_hide.png',clip:{x:0,y:area.y,width:390,height:740-area.y}});
 await page.locator('[data-hd-action="map"]').click();await page.waitForTimeout(150);await page.screenshot({path:'docs/build559/normal-map.png'});
 await writeFile('docs/build559/capture.json',JSON.stringify({seed:559,mode:'one human input with three AI, ordinary navigation from preparation; no forced positions, progress or victory',elapsed:g.elapsed,sealProgress:g.heist541.seals[2].progress,alarm:g.heist541.seals[2].alarmUntil,phase:g.phase,errors},null,2));assert.deepEqual(errors,[]);console.log('Captured ordinary match at '+g.elapsed+'ms');
}finally{await browser?.close();server.kill('SIGTERM')}
