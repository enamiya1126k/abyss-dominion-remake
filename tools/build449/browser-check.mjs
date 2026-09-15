import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{spawn}from'node:child_process';
const{chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const server=spawn(process.execPath,['tools/build445/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],rows=[];
try{
 await new Promise((r,j)=>{const timer=setTimeout(()=>j(Error('server timeout')),30000);server.stdout.on('data',b=>{if(String(b).includes('Preview http')){clearTimeout(timer);r()}});server.on('exit',c=>j(Error('server exit '+c)))});
 const executable=path.resolve('../browser445-133/chromium');fs.chmodSync(executable,0o755);browser=await chromium.launch({executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:{...process.env,LD_LIBRARY_PATH:path.dirname(executable)}});
 const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:'no-preference',deviceScaleFactor:3,isMobile:true,hasTouch:true});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1'||/\.(png|webp|gif|jpe?g|mp3|ogg)$/.test(u.pathname))return r.abort();return r.continue()});await page.routeWebSocket('**/*',s=>s.close());await page.goto('http://127.0.0.1:8441');await page.waitForFunction(()=>window.ready445);

 for(const width of [320,393,768,1280]){
 await page.setViewportSize({width,height:852});
 for(const [level,plus] of [[10000,10],[7,50],[99999999,9999]]){
 await page.evaluate(async({level,plus})=>{qa440.reset();const s=qa435.currentState;const m=s.monsters.find(m=>m.id===s.party[0]);m.level=level;m.plus=plus;const{EquipmentScreen}=await import('/src/ui/screens/EquipmentScreen.js');document.querySelector('#app').innerHTML=EquipmentScreen(s,m.id,{home:true});},{level,plus});
 assert.equal(await page.locator('.equipment-level449').textContent(),`Lv.${level}＋${plus}`);
 const fit=await page.locator('.equipment-level449').evaluate(e=>{const r=e.getBoundingClientRect(),h=e.parentElement.getBoundingClientRect(),next=e.nextElementSibling.getBoundingClientRect();return{fits:e.scrollWidth<=e.clientWidth+1&&r.right<=next.left+1&&r.bottom<=h.bottom+1,width:r.width,height:r.height}});
 assert.ok(fit.fits,JSON.stringify({width,level,fit}));rows.push({width,level,plus,...fit});
 }
 }
 await page.setViewportSize({width:393,height:852});await page.screenshot({path:'docs/build449/equipment-preview.png'});
 assert.deepEqual(errors,[]);fs.writeFileSync('docs/build449/browser-results.json',JSON.stringify({rows,errors},null,2));console.log(JSON.stringify({cases:rows.length,errors}));
}finally{await browser?.close();server.kill();}
