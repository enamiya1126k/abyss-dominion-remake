import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createServer} from './preview.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const report={errors:[],failed:[],sizes:[],checks:[],nativeIPhone:false,scope:'Production luck rules/view/styles/art with a local fixture; party lounge stubbed.'};let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:'/tmp/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({isMobile:true,hasTouch:true,viewport:{width:390,height:740}});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failed.push(r.url());});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.ready&&c.lkUI511.artReady);await page.evaluate(()=>document.fonts.ready);
 for(const size of [{width:390,height:740},{width:320,height:568}]){
  await page.setViewportSize(size);await page.evaluate(()=>load('hand'));
  assert.match(await page.locator('[data-charge571]').textContent(),/太陽3個 → 大技×27/);
  assert.equal(await page.locator('[data-hand-pick511] [data-atlas="571"]').count(),4);
  assert.equal(await page.locator('[data-formula571]').count(),0);assert(await page.locator('[data-burst571]').isHidden());
  assert(await page.locator('[data-guard511="0"]').isVisible());
  const handSize=await page.evaluate(()=>({width:innerWidth,page:document.documentElement.scrollWidth,bottom:document.querySelector('.lk-controls508').getBoundingClientRect().bottom,height:innerHeight}));
  report.sizes.push({...size,...handSize});assert(handSize.page<=size.width);assert(handSize.bottom<=size.height+1);await page.locator('.lk-controls508').evaluate(e=>e.scrollTo(0,e.scrollHeight));assert(await page.locator('[data-hand-pick511="3"]').isVisible());await page.locator('.lk-controls508').evaluate(e=>e.scrollTo(0,0));
  await page.locator('[data-gear-seat511="0"]').tap();await page.locator('[data-gear-panel511]').waitFor({state:'visible'});
  assert.match(await page.locator('[data-gear-status511]').textContent(),/3個 → 大技×27/);
  assert.match(await page.locator('[data-gear-slot511]:not([hidden])').first().textContent(),/装備1個/);
  await page.locator('[data-gear-list511]').evaluate(e=>e.scrollTo(0,e.scrollHeight));
  assert(await page.locator('[data-gear-slot511]:not([hidden])').last().isVisible());
  if(size.width===390)await page.screenshot({path:'docs/build571/equipment.png'});
  await page.locator('[data-gear-close511]').tap();await page.evaluate(()=>load('hand'));
  if(size.width===390)await page.screenshot({path:'docs/build571/hand.png'});
  await page.locator('[data-hand-pick511="1"]').tap();await page.waitForFunction(()=>document.querySelector('[data-hand-pick511="1"]').getAttribute('aria-pressed')==='true');assert.equal(await page.locator('[data-hand-pick511="1"]').getAttribute('aria-pressed'),'true');
 }
 report.checks.push('390/320px touch: new item atlas, stock-to-multiplier labels, gear scroll, barrier, hand selection; no final-distance preview or calculation formula');
 await page.setViewportSize({width:390,height:740});await page.evaluate(()=>load('run'));
 await page.evaluate(()=>at(30));const early=await page.locator('[data-burst571]').textContent();
 await page.evaluate(()=>at(1500));const later=await page.locator('[data-burst571]').textContent();assert(later.length>early.length);assert(!later.includes('＝'));
 await page.screenshot({path:'docs/build571/run.png'});
 await page.evaluate(()=>load('dice'));await page.evaluate(()=>at(2000));
 assert.match(await page.locator('[data-dice-formula511]').textContent(),/7 × 8 × 9/);
 assert.equal(await page.locator('[data-dice-cube511="0"]').getAttribute('aria-label'),'1の目、補正後7');
 assert.equal(await page.locator('[data-dice-power511]').textContent(),'育てた力を解放！');
 await page.screenshot({path:'docs/build571/dice.png'});
 report.checks.push('run multipliers appear in sequence without disclosing final distance; physical dice stay 1..6 while adjusted values exceed 6');
 await page.evaluate(()=>lobby(false));assert(await page.locator('[data-lk511-action="start"]').isDisabled());
 await page.evaluate(()=>lobby(true));assert(!(await page.locator('[data-lk511-action="start"]').isDisabled()));
 await page.locator('.lk-catalog508 summary').tap();assert.equal(await page.locator('.lk-catalog508 article').count(),52);
 assert.equal(await page.locator('.lk-catalog508 [data-atlas="571"]').count(),12);
 report.checks.push('52 item catalogue with 12 new sprites; old server start blocked');
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.failed,[]);
}finally{await browser?.close();await new Promise(r=>server.close(r));await writeFile('docs/build571/chromium-browser.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));
