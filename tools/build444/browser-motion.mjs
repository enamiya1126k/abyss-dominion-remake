import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const{chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const server=spawn(process.execPath,['tools/build443/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],missing=new Set(),report={};
try{
 await new Promise((r,j)=>{const t=setTimeout(()=>j(Error('server timeout')),20000);server.stdout.on('data',b=>{if(String(b).includes('Preview http')){clearTimeout(t);r();}});server.on('exit',c=>j(Error('server exit '+c)));});
 browser=await chromium.launch({executablePath:path.resolve('../browser440/chromium'),args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:{...process.env,LD_LIBRARY_PATH:path.resolve('../browser440')}});
 const page=await browser.newPage({viewport:{width:393,height:720},reducedMotion:'no-preference'});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.add(new URL(r.url()).pathname)});await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.routeWebSocket('**/*',s=>s.close());await page.goto('http://127.0.0.1:8441');await page.waitForFunction(()=>window.ready443);
 // Real production markup + every production stylesheet, without requiring
 // unmaterialized scene backgrounds or connecting to production accounts.
 report.fixtures=await page.evaluate(async()=>{
  const c=await import('/src/core/MagicCircleSystem.js'),online=await import('/src/ui/screens/OnlinePartyScreen.js');
  const state=qa441.state;qa440.reset();const monster=state.monsters.find(m=>state.party.includes(m.id));
  const circles=c.MAGIC_CIRCLES.filter(e=>e.asset.includes('build441')||['none','reincarnation','raid_zero_sovereign','raid_vajra_beast'].includes(e.id));
  let html='';const fixtures=[];
  for(const circle of circles){
   const instance=c.createMagicCircleInstance(state,circle.id,{level:5});c.equipMagicCircle(state,monster,instance?.instanceId??'none');
   for(const context of ['home','battle','workshop','online']){
    const classes={home:'home-character-circle',battle:'battle-magic-circle',workshop:'workshop-circle',online:'battle-magic-circle'};
    const art=context==='online'?online.onlineMagicCircleArt({circleId:circle.id,circleLevel:5},{className:classes[context]}):c.magicCircleMarkup(monster,state,{className:classes[context]});
    const id=context+'-'+circle.id;
    const wrapped=context==='home'?`<div class="home-scene-unit">${art}</div>`:['battle','online'].includes(context)?`<div class="battle-screen side-battle-v2 ${context==='online'?'online-shared-battle':''}"><div class="side-party"><div class="side-battle-unit"><div class="side-unit-sprite" style="--circle405-size:120px;--circle405-top:70px">${art}</div></div></div></div>`:`<div class="magic-circle-workshop"><header>${art}</header></div>`;
    html+=`<div data-qa444="${id}" style="position:relative;width:220px;height:220px">${wrapped}</div>`;fixtures.push({id,circle:circle.id,context,frames:circle.frames?.length||1});
   }
  }
  document.querySelector('#app').innerHTML=html;window.fixtures444=fixtures;
  await Promise.all([...document.querySelectorAll('.magic-circle>img')].map(i=>i.decode()));return fixtures;
 });
 assert.equal(report.fixtures.filter(f=>f.frames===1).length,44);
 const sheet=page.locator('link[href*="build444-circle-motion"]');assert.equal(await sheet.count(),1);
 await sheet.evaluate(e=>e.disabled=true);
 report.before=await page.locator('[data-qa444="battle-ch2_chain394"] .magic-circle>img').evaluate(e=>getComputedStyle(e).animationName);assert.equal(report.before,'none');
 await sheet.evaluate(e=>e.disabled=false);await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-qa444="battle-ch2_chain394"] .magic-circle>img')).animationName==='magic-circle-art-spin');
 report.after=await page.evaluate(()=>fixtures444.map(f=>{
  const wrapper=document.querySelector(`[data-qa444="${f.id}"] .magic-circle`),img=wrapper.querySelector('img'),style=getComputedStyle(img);
  const animation=img.getAnimations().find(a=>a.animationName==='magic-circle-art-spin');
  if(!animation)return {...f,name:style.animationName};
  animation.pause();animation.currentTime=0;const bounds0=img.getBoundingClientRect(),transform0=getComputedStyle(img).transform,wrapper0=getComputedStyle(wrapper).transform;
  animation.currentTime=animation.effect.getTiming().duration/4;const bounds1=img.getBoundingClientRect(),transform1=getComputedStyle(img).transform;
  const opacities=[];
  for(const time of [0,600,1200,2400,7000,14000,27999]){animation.currentTime=time;opacities.push(getComputedStyle(img).opacity);}
  animation.currentTime=0;animation.play();
  return {...f,name:style.animationName,duration:animation.effect.getTiming().duration,transform0,transform1,wrapperStable:wrapper0===getComputedStyle(wrapper).transform,centerShift:Math.hypot(bounds1.x+bounds1.width/2-bounds0.x-bounds0.width/2,bounds1.y+bounds1.height/2-bounds0.y-bounds0.height/2),opacities};
 }));
 for(const r of report.after){assert.ok(r.name.includes('magic-circle-art-spin'),r.id);assert.notEqual(r.transform0,r.transform1,r.id);assert.ok(r.wrapperStable,r.id);assert.ok(r.centerShift<.1,r.id+': center drift '+r.centerShift);if(r.frames===1){assert.equal(r.name,'magic-circle-art-spin');assert.equal(r.duration,r.circle==='none'?55000:28000);assert.ok(r.opacities.every(o=>o==='1'),r.id);}}
 const target=page.locator('[data-qa444="battle-ch2_chain394"] .magic-circle>img');
 const t0=await target.evaluate(e=>e.getAnimations()[0].currentTime);await page.waitForTimeout(350);const t1=await target.evaluate(e=>e.getAnimations()[0].currentTime);assert.ok(t1>t0+100);report.realTimeProgress=t1-t0;
 await page.setViewportSize({width:1280,height:800});report.desktop=await page.locator('.magic-circle>img:only-of-type').evaluateAll(es=>es.map(e=>getComputedStyle(e).animationName));assert.ok(report.desktop.every(n=>n==='magic-circle-art-spin'));
 await page.emulateMedia({reducedMotion:'reduce'});report.reduced=await page.locator('.magic-circle>img:only-of-type').evaluateAll(es=>es.map(e=>({name:getComputedStyle(e).animationName,opacity:getComputedStyle(e).opacity})));assert.ok(report.reduced.every(r=>r.name==='none'&&r.opacity==='1'));
 await page.emulateMedia({reducedMotion:'no-preference'});assert.equal(await target.evaluate(e=>getComputedStyle(e).animationName),'magic-circle-art-spin');
 // The actual equipped preview uses the same production renderer.
 await page.evaluate(()=>qa443.circles('ch2_chain394'));assert.equal(await page.locator('.workshop-circle>img').evaluate(e=>getComputedStyle(e).animationName),'magic-circle-art-spin');
 assert.deepEqual(errors,[]);assert.deepEqual([...missing],[]);report.passed=true;console.log(JSON.stringify({passed:true,cases:report.after.length,realTimeProgress:report.realTimeProgress,before:report.before,errors,missing:[...missing]}));
}finally{fs.writeFileSync('docs/build444/browser-results.json',JSON.stringify({...report,errors,missing:[...missing]},null,2)+'\n');await browser?.close();server.kill();}
