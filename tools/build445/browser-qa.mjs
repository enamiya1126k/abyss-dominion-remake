import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{spawn}from'node:child_process';
const{chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const server=spawn(process.execPath,['tools/build445/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],rows=[];
try{
 await new Promise((r,j)=>{const timer=setTimeout(()=>j(Error('server timeout')),30000);server.stdout.on('data',b=>{if(String(b).includes('Preview http')){clearTimeout(timer);r()}});server.on('exit',c=>j(Error('server exit '+c)))});
 const executable=path.resolve('../browser445-133/chromium');fs.chmodSync(executable,0o755);browser=await chromium.launch({executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:{...process.env,LD_LIBRARY_PATH:path.dirname(executable)}});
 const page=await browser.newPage({viewport:{width:393,height:800},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 // Local code and CSS only. Missing unchanged artwork in this sparse checkout
 // is irrelevant to the text boxes being measured, so omit raster requests.
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1'||/\.(png|webp|gif|jpe?g|mp3|ogg)$/.test(u.pathname))return r.abort();return r.continue();});await page.routeWebSocket('**/*',s=>s.close());await page.goto('http://127.0.0.1:8441');await page.waitForFunction(()=>window.ready445);
 for(const width of [320,393,430,1280]){
  await page.setViewportSize({width,height:800});
  for(const kind of ['home','formation','equipment','records','ranking','explore'])for(const value of [999999,1405071,99999999,Number.MAX_SAFE_INTEGER]){
   await page.evaluate(({kind,value})=>qa445.show(kind,value),{kind,value});
   const cells=await page.locator('[data-power-qa445]').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(e);const t=range.getBoundingClientRect();return{text:e.textContent,width:b.width,textWidth:t.width,parentWidth:p.width,overflow:t.width>b.width+1||t.right>p.right+1||t.left<p.left-1}}));
   assert.ok(cells.length,kind);const failures=cells.filter(c=>c.overflow);rows.push({width,kind,value,cells});assert.deepEqual(failures,[],JSON.stringify({width,kind,value,failures}));
  }
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,cases:rows.length,errors}));
}finally{fs.writeFileSync('docs/build445/browser-results.json',JSON.stringify({rows,errors},null,2)+'\n');await browser?.close();server.kill();}
