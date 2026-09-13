import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const output=process.env.MOTHER_QA_DIR??'docs/build433';fs.mkdirSync(output,{recursive:true});
const server=spawn(process.execPath,['tools/build433/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],missing=new Set(),checks=[];
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Preview timeout')),10000);server.stdout.on('data',b=>{if(b.toString().includes('Preview http')){clearTimeout(timer);resolve();}});server.on('error',reject);});
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:393,height:720},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.routeWebSocket('**/*',ws=>ws.close());
 page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message);});page.on('response',r=>{if(r.status()===404)missing.add(new URL(r.url()).pathname);});
 await page.goto('http://127.0.0.1:8433');await page.waitForFunction(()=>window.ready433);
 await page.waitForTimeout(700);
 const shot=async name=>page.screenshot({path:path.join(output,name+'.png')});
 const measure=()=>page.evaluate(async()=>{
  const {chapterTwoFrameBounds383}=await import('/src/ui/ChapterTwoSprite383.js');
  const unit=document.querySelector('[data-mother-unit425]'),img=unit.querySelector('svg[data-monster-atlas]'),r=img.getBoundingClientRect(),b=chapterTwoFrameBounds383('ch2_ionea'),circle=unit.querySelector('.mother-dial424').getBoundingClientRect(),card=unit.querySelector('.enemy-info').getBoundingClientRect(),side=unit.closest('.side-enemies').getBoundingClientRect();
  const body={left:r.left+r.width*b.left,right:r.left+r.width*b.right,top:r.top+r.height*b.top,bottom:r.top+r.height*b.bottom};
  const labels=[...unit.querySelectorAll('.bar-label')].map(el=>{const range=document.createRange();range.selectNodeContents(el);return {text:el.textContent,width:range.getBoundingClientRect().width,available:el.parentElement.clientWidth,font:getComputedStyle(el).fontSize};});
  const others=[...document.querySelectorAll('.side-battle-unit:not([data-mother-unit425]) .side-unit-card')].map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};});
  return {body,circle:{cx:circle.left+circle.width/2,cy:circle.top+circle.height/2,left:circle.left,right:circle.right},card:{top:card.top,bottom:card.bottom},side:{left:side.left,right:side.right},labels,others,scrollWidth:document.documentElement.scrollWidth,clientWidth:innerWidth};
 });
 for(const size of [{width:393,height:720},{width:375,height:620},{width:1280,height:800}]){
  await page.setViewportSize(size);let firstHeight;
  for(const n of [0,1,3]){
   await page.evaluate(n=>qa433.battle(n),n);await page.waitForTimeout(700);const m=await measure();
   assert.ok(m.body.bottom<m.card.top,JSON.stringify(m));assert.ok(Math.abs(m.circle.cx-(m.body.left+m.body.right)/2)<1);assert.ok(Math.abs(m.circle.cy-(m.body.top+m.body.bottom)/2)<1);
   assert.ok(m.circle.left>=m.side.left-2&&m.circle.right<=m.side.right+2,JSON.stringify(m));assert.ok(m.scrollWidth<=m.clientWidth+1);
   for(const l of m.labels)assert.ok(l.width<=l.available+1,JSON.stringify(l));
   for(const o of m.others)assert.ok(!(m.body.left<o.right&&m.body.right>o.left&&m.body.top<o.bottom&&m.body.bottom>o.top),'mother overlaps another card');
   const height=m.body.bottom-m.body.top;if(firstHeight==null)firstHeight=height;assert.ok(height>=firstHeight*.75,JSON.stringify({size,n,height,firstHeight,m}));
   checks.push({size,summons:n,motherHeight:height,labels:m.labels});if(size.width===393)await shot('mother-'+n);
  }
 }
 await page.setViewportSize({width:375,height:540});await page.evaluate(()=>qa433.battle(3));await page.waitForTimeout(300);
 const scroll=await page.locator('.mother-battle422').evaluate(el=>{el.scrollTop=el.scrollHeight;return{top:el.scrollTop,max:el.scrollHeight-el.clientHeight,touch:getComputedStyle(el).touchAction};});assert.ok(scroll.top>0&&Math.abs(scroll.top-scroll.max)<2);assert.equal(scroll.touch,'pan-y');checks.push({scroll});
 await page.setViewportSize({width:393,height:720});await page.evaluate(()=>qa433.battle(3));await page.waitForTimeout(500);
 await page.evaluate(()=>{window.spin433=qa433.spin(3);});await page.waitForSelector('[data-dial-phase425="spinning"]');const spinning=await measure();assert.ok(Math.abs(spinning.circle.cx-(spinning.body.left+spinning.body.right)/2)<1);assert.ok(Math.abs(spinning.circle.cy-(spinning.body.top+spinning.body.bottom)/2)<1);await shot('dial-spinning');
 await page.waitForSelector('[data-dial-phase425="revealed"] .is-selected433');assert.equal(await page.locator('.is-selected433').getAttribute('data-dial-numeral424'),'3');await shot('dial-stopped');
 await page.waitForSelector('.battle-banner-effect');assert.match(await page.locator('.battle-banner-effect').textContent(),/十神Ⅳ 死より発動/);await shot('skill');await page.evaluate(()=>window.spin433);checks.push('native spin → stopped numeral IV → native skill banner');
 await page.evaluate(()=>qa433.field(true));await page.waitForTimeout(700);await shot('sanctum');
 let point=await page.evaluate(()=>qa433.bodyPoint());await page.touchscreen.tap(point.x,point.y);await page.waitForSelector('.mother-challenge-modal433');assert.match(await page.locator('.game-modal-body').textContent(),/十神の母と再戦しますか/);await shot('rematch');await page.locator('[data-mother-cancel433]').click();assert.equal(await page.evaluate(()=>qa433.starts),0);
 point=await page.evaluate(()=>qa433.namePoint());await page.touchscreen.tap(point.x,point.y);await page.waitForSelector('.mother-challenge-modal433');await page.locator('[data-mother-cancel433]').click();
 point=await page.evaluate(()=>qa433.bodyPoint());await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+45,point.y+20,{steps:5});await page.mouse.up();assert.equal(await page.locator('.mother-challenge-modal433').count(),0);
 await page.evaluate(()=>qa433.field(true));await page.waitForTimeout(400);point=await page.evaluate(()=>qa433.bodyPoint());await page.touchscreen.tap(point.x,point.y);await page.locator('[data-modal-primary]').click();await page.waitForSelector('.battle-screen');assert.equal(await page.evaluate(()=>qa433.starts),1);
 await page.evaluate(()=>qa433.field(false));await page.waitForTimeout(400);point=await page.evaluate(()=>qa433.bodyPoint());await page.touchscreen.tap(point.x,point.y);await page.waitForSelector('.mother-challenge-modal433');assert.match(await page.locator('.game-modal-body').textContent(),/挑戦しますか/);await page.locator('[data-mother-cancel433]').click();
 await page.evaluate(()=>qa433.field(true,{x:9,y:9}));await page.waitForTimeout(400);
 point=await page.evaluate(()=>{const g=qa433.game,p=g.camera.world(4.5*88,9.5*88),c=g.canvas,r=c.getBoundingClientRect();return{x:r.left+p.x*r.width/c.width,y:r.top+p.y*r.height/c.height};});await page.touchscreen.tap(point.x,point.y);assert.ok(await page.evaluate(()=>qa433.game.player.path.length)>0);await page.waitForSelector('.mother-challenge-modal433',{timeout:7000});await page.locator('[data-mother-cancel433]').click();checks.push('walking into the cleared mother also opens rematch');
 await page.evaluate(()=>{qa433.field(true);qa433.altar();});assert.deepEqual(await page.evaluate(()=>qa433.stories),['ending']);checks.push('mother body/name taps, cancel, drag, initial challenge, rematch, separate altar');
 assert.deepEqual(errors,[]);assert.deepEqual([...missing],[]);
 const result={checks,errors,missing:[...missing],browser:'Chromium mobile emulation; real iPhone Safari untested'};fs.writeFileSync(path.join(output,'browser-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));

}finally{await browser?.close();server.kill();}
