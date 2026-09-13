import fs from 'node:fs';import assert from 'node:assert/strict';import{spawn}from'node:child_process';
const{chromium}=await import(process.env.PLAYWRIGHT_MODULE),server=spawn(process.execPath,['tools/build437/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],missing=new Set(),checks=[],metrics={};
try{
 await new Promise((r,j)=>{const t=setTimeout(()=>j(Error('server timeout')),20000);server.stdout.on('data',b=>{if(String(b).includes('Preview http')){clearTimeout(t);r();}});server.on('exit',code=>j(Error('server exited '+code)));});
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:393,height:720},isMobile:true});await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.routeWebSocket('**/*',s=>s.close());page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.add(new URL(r.url()).pathname)});
 await page.goto('http://127.0.0.1:8437');await page.waitForFunction(()=>window.ready437);
 for(const size of [{width:393,height:720},{width:375,height:540},{width:430,height:760},{width:1280,height:800}]){
  await page.setViewportSize(size);
  for(const kind of ['formation','equipment','skills']){
   await page.evaluate(k=>qa437.menu(k),kind);await page.waitForTimeout(350);await page.evaluate(()=>document.fonts.ready);
   const layout=await page.evaluate(()=>{
    const css=[...document.styleSheets].find(s=>s.href?.includes('build437-finish')),selectors='.screen,.v2-screen-hud,.v2-bottom-nav,button,.formation-grid,.formation-member,.formation-gear-grid,.equipment-loadout-workbench,.selected-equipment-stats,.equipped-skill-grid,.skill-slot-card';
    const geometry=()=>[...document.querySelectorAll(selectors)].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};});
    const after=geometry();css.disabled=true;const before=geometry();css.disabled=false;
    return {count:after.length,moved:after.flatMap((r,i)=>Object.keys(r).some(k=>Math.abs(r[k]-before[i][k])>.1)?[{i,before:before[i],after:r}]:[]),overflow:document.documentElement.scrollWidth>innerWidth+1};
   });metrics[kind+'-'+size.width]=layout;assert.deepEqual(layout.moved,[],kind+' layout moved');assert.equal(layout.overflow,false,kind+' page overflow');checks.push(`${kind} geometry unchanged at ${size.width}`);
   if(size.width===393){await page.screenshot({path:`docs/build437/${kind}-393.png`});if(kind==='formation'){await page.locator('.formation-grid').scrollIntoViewIfNeeded();await page.screenshot({path:'docs/build437/formation-cards-393.png'});}}
  }
  for(const online of [true,false]){
   await page.evaluate(v=>qa437.raid(true,v),online);await page.waitForTimeout(350);
   const bars=await page.evaluate(()=>[...document.querySelectorAll('.side-unit-card .bar-label')].map(e=>{const r=document.createRange();r.selectNodeContents(e);return{text:e.textContent,font:parseFloat(getComputedStyle(e).fontSize),w:e.clientWidth,tw:r.getBoundingClientRect().width};}));
   metrics[`vitals-${size.width}-${online}`]=bars;assert.ok(bars.length>=10);assert.ok(bars.every(e=>e.font<=8&&e.tw<=e.w+.5),'vitals overflow '+JSON.stringify(bars));
   const scroll=await page.evaluate(()=>({page:document.documentElement.scrollHeight,viewport:innerHeight,button:document.querySelector('[data-world-retreat]').getBoundingClientRect().bottom}));assert.ok(scroll.page<=scroll.viewport+1&&scroll.button<=scroll.viewport+1,'raid viewport '+JSON.stringify(scroll));checks.push(`${online?'online':'offline'} raid exact vitals / one viewport at ${size.width}`);
   if(size.width===393&&online)await page.screenshot({path:'docs/build437/raid-393.png'});
  }
 }
 await page.setViewportSize({width:393,height:720});
 for(const status of ['online','pending','accepted','expired']){
  await page.evaluate(s=>qa437.report(s),status);await page.waitForTimeout(100);
  const text=await page.locator('.raid-result437').innerText();assert.match(text,/99ラウンド終了/);assert.match(text,/1,071,408/);assert.match(text,/今回の活躍表/);assert.equal(await page.locator('.contribution-row437').count(),4);
  assert.match(text,status==='pending'?/接続後に自動送信/:status==='expired'?/集計対象外/:/反映しました/);assert.ok(!(await page.locator('.contribution-detail437').evaluate(e=>e.open)));
  if(status==='online'){await page.screenshot({path:'docs/build437/result-393.png'});await page.locator('.contribution-detail437>summary').click();assert.ok(await page.locator('.contribution-table437').isVisible());await page.screenshot({path:'docs/build437/result-details-393.png'});}
  checks.push(`unified result with correct ${status} status`);
 }
 await page.setViewportSize({width:375,height:540});await page.evaluate(()=>qa437.report('online',true));assert.ok(await page.locator('.contribution-row437').evaluateAll(rows=>rows.every(e=>e.scrollWidth<=e.clientWidth+1)));checks.push('large result values fit short narrow viewport');
 await page.evaluate(()=>qa437.menu());await page.locator('[data-role-guide436]').click();assert.ok(await page.locator('.role-guide-modal436').isVisible());checks.push('existing role guide action works with decoration');
 for(const path of ['frame','button','sanctum']){assert.ok(await page.evaluate(async n=>{const i=new Image();i.src='/assets/ui/build437/'+n+'.webp';await i.decode();return i.naturalWidth>1000;},path));}checks.push('all three full-resolution generated assets load');
 assert.deepEqual(errors,[]);assert.deepEqual([...missing],[]);
}finally{fs.writeFileSync('docs/build437/browser-result.json',JSON.stringify({checks,errors,missing:[...missing],metrics},null,2));await browser?.close();server.kill();console.log(JSON.stringify({checks:checks.length,errors,missing:[...missing]}));}
