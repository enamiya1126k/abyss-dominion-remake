import {createRequire} from 'node:module';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';import {createServer} from '../build571/preview.mjs';
const {chromium}=createRequire(import.meta.url)('playwright'),server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const report={errors:[],failed:[],cases:[],nativeIPhone:false};
try{browser=await chromium.launch({headless:true,executablePath:'/tmp/chromium',args:['--no-sandbox']});const page=await browser.newPage({isMobile:true,hasTouch:true,viewport:{width:390,height:740}});page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failed.push(r.url())});await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.ready&&c.lkUI511.artReady);await page.evaluate(()=>document.fonts.ready);
for(const size of [{width:390,height:740},{width:320,height:568}]){await page.setViewportSize(size);for(const reduced of [false,true]){
 await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});await page.evaluate(()=>{c.lkUI511.diceSound=null;load('dice');at(0)});
 if(!reduced)assert.equal(await page.locator('[data-dice-power511]').textContent(),'');
 await page.evaluate(()=>at(1600));
 const expected=await page.evaluate(async()=>{const {diceFrame511}=await import('/src/luck/Presentation511.js');return diceFrame511(c.state.luck,fakeNow,c.lkUI511.reduced).power});
 assert(expected.startsWith('+'));assert.equal(await page.locator('[data-dice-power511]').textContent(),expected);assert.equal(await page.locator('[data-dice-caption511]').textContent(),'移動距離（攻撃前）');assert(!await page.locator('.lk-dice-stage511').textContent().then(t=>t.includes('どこまで飛ぶ')));assert.match(await page.locator('[data-reader511]').textContent(),/移動距離/);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(size.width===390&&!reduced)await page.screenshot({path:'docs/build578/dice.png'});
 report.cases.push({...size,reduced,result:expected});
}}
await page.evaluate(()=>{load('dice');c.state.luck.event.rows[c.state.luck.event.diceOrder[0]].calculation.planned='10000000000000000000000000000000000000000';c.render();at(1600)});assert(await page.locator('[data-dice-power511]').textContent().then(t=>!t.includes('Infinity')&&!t.includes('NaN')&&t.length>1));
assert.deepEqual(report.errors,[]);assert.deepEqual(report.failed,[]);
}finally{await browser?.close();await new Promise(r=>server.close(r));await writeFile('docs/build578/browser.json',JSON.stringify(report,null,2)+'\n')};console.log(JSON.stringify(report));
