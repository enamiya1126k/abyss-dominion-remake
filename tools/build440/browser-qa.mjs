import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import{spawn}from'node:child_process';
const{chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const server=spawn(process.execPath,['tools/build440/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],missing=new Set(),checks=[],metrics={};
try{
 await new Promise((r,j)=>{const timer=setTimeout(()=>j(Error('Server timeout')),20000);server.stdout.on('data',b=>{if(String(b).includes('Preview http')){clearTimeout(timer);r();}});server.on('exit',c=>j(Error('Server exit '+c)));});
 browser=await chromium.launch({executablePath:process.env.ABYSS_QA_CHROMIUM||path.resolve('../browser440/chromium'),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:{...process.env,LD_LIBRARY_PATH:path.resolve('../browser440')}});
 const page=await browser.newPage({viewport:{width:393,height:720},isMobile:true,reducedMotion:'reduce'});await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.routeWebSocket('**/*',s=>s.close());page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.add(new URL(r.url()).pathname)});
 await page.goto('http://127.0.0.1:8440');await page.waitForFunction(()=>window.ready440);
 const shot=async name=>page.screenshot({path:`docs/build440/${name}.png`});
 for(const size of [{width:393,height:720},{width:375,height:540},{width:430,height:760},{width:1280,height:800}]){
  await page.setViewportSize(size);
  for(const kind of ['skills','home','attributes','settings','altar','contract','experience','memory','archive']){
   await page.evaluate(k=>qa440[k](),kind);if(kind==='skills')await page.locator('[data-skill-slot="0"]').click();await page.waitForTimeout(70);await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,kind+' horizontal overflow');checks.push(`${kind}: no horizontal overflow ${size.width}x${size.height}`);
   if(kind==='skills'){
    assert.ok(await page.locator('[data-skill-pick]').count()>=6,'TenGod full skill list');
    const body=page.locator('.skill-picker-modal-v2 .game-modal-body');await body.evaluate(e=>e.scrollTop=e.scrollHeight);
    const fit=await page.locator('.skill-picker-modal-v2').evaluate(m=>{const list=[...m.querySelectorAll('[data-skill-pick]')],b=m.querySelector('.game-modal-body').getBoundingClientRect(),f=m.querySelector('[data-modal-primary]').getBoundingClientRect(),last=list.at(-1),r=last.getBoundingClientRect();return{last:{top:r.top,bottom:r.bottom},body:{top:b.top,bottom:b.bottom},footer:f.top,inside:r.top>=b.top-1&&r.bottom<=b.bottom+1&&r.bottom<=f.top,cards:list.map(e=>{const p=e.getBoundingClientRect();return [...e.querySelectorAll('p,.skill-picker-chips,.skill-slot-state438')].every(child=>{const c=child.getBoundingClientRect();return c.bottom<=p.bottom+1&&c.right<=p.right+1&&c.top>=p.top-1;});})};});metrics['skills-'+size.width]=fit;assert.ok(fit.inside&&fit.cards.every(Boolean),JSON.stringify(fit));checks.push('final skill and all badges visible inside cards '+size.width);if(size.width===393)await shot('skills-bottom-393');
    await page.locator('[data-skill-picker-filter="buff"]').click();assert.ok(await page.locator('[data-skill-pick]:visible').count()>0);assert.equal(await page.locator('[data-skill-pick]:visible:not([data-skill-picker-category="buff"])').count(),0);checks.push('skill filter still hides other categories '+size.width);
    await page.locator('[data-skill-picker-filter="all"]').click();await body.evaluate(e=>e.scrollTop=0);
   }
   if(kind==='home'){
    const fit=await page.locator('.home-attribute-orbit').evaluate(e=>{const a=e.getBoundingClientRect(),b=document.querySelector('.home-formation-banner').getBoundingClientRect();return{a:{top:a.top,bottom:a.bottom,left:a.left,right:a.right},b:{top:b.top,bottom:b.bottom,left:b.left,right:b.right},separate:a.bottom<=b.top+1||a.right<=b.left+1||b.right<=a.left+1};});metrics['home-'+size.width]=fit;assert.ok(fit.separate,JSON.stringify(fit));checks.push('home diagram stays clear of formation banner '+size.width);
   }
   if(kind==='settings'){
    const fit=await page.locator('.player-name-controls363').evaluate(e=>{const p=e.getBoundingClientRect(),i=e.querySelector('input').getBoundingClientRect(),b=e.querySelector('button').getBoundingClientRect();return i.right<=b.left&&b.right<=p.right+1&&b.height>=44;});assert.ok(fit);checks.push('name input and save button fit '+size.width);
   }
   if(kind==='memory'){
    const art=await page.locator('[data-memory-room]').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundImage));assert.equal(new Set(art).size,3);assert.ok(art.every(a=>a.includes('/build440/')));checks.push('three dedicated memory scenes '+size.width);
   }
   if(kind==='altar'){
    const art=await page.locator('.gacha-category-card>img.gacha-banner-art435').evaluateAll(es=>es.map(e=>e.getAttribute('src')));assert.equal(new Set(art).size,2);assert.ok(art[0].includes('summon-monsters')&&art[1].includes('summon-equipment'));
    if(size.width===393){await page.locator('[data-permanent-signature]').scrollIntoViewIfNeeded();await shot('summon-events-393');}
    const bg=await page.locator('[data-permanent-signature]').evaluate(e=>getComputedStyle(e).backgroundImage);assert.ok(bg.includes('summon-contract'),bg);checks.push('summon category and permanent contract artwork '+size.width);await page.locator('.game-modal-body').evaluate(e=>e.scrollTop=0);
   }
   if(kind==='archive'){await page.locator('[data-story-archive-category-button="chapterTwo"]').click();assert.equal(await page.locator('.story-archive-screen').getAttribute('data-story-archive-category'),'chapterTwo');checks.push('archive tabs navigate '+size.width);}
   if(size.width===393)await shot(kind+'-393');
  }
  await page.evaluate(()=>qa440.memory('battle'));assert.equal(await page.locator('.battle-memory-enemy').count(),4);assert.equal(await page.locator('.battle-memory-cost b').textContent(),'魔晶石 100個');if(size.width===393)await shot('battle-memory-393');checks.push('battle memory retains four enemies and cost '+size.width);
 }
 await page.setViewportSize({width:393,height:720});await page.evaluate(()=>qa440.skills());await page.locator('[data-skill-slot="0"]').click();const choice=page.locator('[data-skill-pick]:not(:disabled)').last(),skill=await choice.getAttribute('data-skill-pick');await choice.click();assert.equal(await page.locator('.skill-picker-modal-v2').count(),0);assert.ok(await page.evaluate(id=>qa439.state().monsters.at(-1).equippedSkills[0]===id,skill));checks.push('last eligible skill can be equipped through native UI');
 assert.deepEqual(errors,[]);assert.deepEqual([...missing],[]);console.log(JSON.stringify({checks:checks.length,errors,missing:[...missing]}));
}finally{fs.writeFileSync('docs/build440/browser-result.json',JSON.stringify({checks,errors,missing:[...missing],metrics},null,2));await browser?.close();server.kill();}
