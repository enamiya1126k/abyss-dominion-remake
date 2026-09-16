import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{spawn}from'node:child_process';import{tmpdir}from'node:os';
const{chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const dir=fs.mkdtempSync(path.join(tmpdir(),'race451-ws-')),env={...process.env,HOST:'127.0.0.1',PORT:'18871'};
for(const[name,file]of Object.entries({FRIEND_STATE_FILE:'friends',GUILD_STATE_FILE:'guilds',POWER_RANKING_STATE_FILE:'rankings',SETTLEMENT_STATE_FILE:'settlements',WORLD_RAID_STATE_FILE:'raids',RACE_STATE_FILE:'race'}))env[name]=path.join(dir,file+'.json');
const processes=[];let browser;const errors=[],checks=[];
function launch(file,cwd,env,ready){const proc=spawn(process.execPath,[file],{cwd,env,stdio:['ignore','pipe','pipe']});processes.push(proc);return new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('startup timeout '+out)),15000);proc.stdout.on('data',b=>{out+=b;if(out.includes(ready)){clearTimeout(timer);resolve(proc)}});proc.stderr.on('data',b=>out+=b);proc.on('exit',c=>{if(c){clearTimeout(timer);reject(Error(out))}})})}
try{
 let serverProcess=await launch('server.js',path.resolve('online-server'),env,'Local:');await launch('tools/build454/preview-server.mjs',process.cwd(),process.env,'Preview454 ready');
 const executable=path.resolve('../browser445-133/chromium');fs.chmodSync(executable,0o755);browser=await chromium.launch({executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage'],env:{...process.env,LD_LIBRARY_PATH:path.dirname(executable),FONTCONFIG_FILE:process.env.RACE_QA_FONTCONFIG||process.env.FONTCONFIG_FILE}});

 const context=await browser.newContext({viewport:{width:393,height:640},isMobile:true,hasTouch:true});
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await context.routeWebSocket('**/*',r=>new URL(r.url()).hostname==='127.0.0.1'?r.connectToServer():r.close());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:18451/');await page.waitForFunction(()=>window.qa451?.client.ready());
 await page.locator('[data-race-action="create"]').click();await page.waitForFunction(()=>qa451.client.state.room);
 await page.evaluate(()=>{const m=qa451.save.state.monsters[0];for(let i=0;i<40;i++)qa451.save.state.monsters.push({...m,id:'scroll-fixture-'+i});qa451.client.render()});
 const cdp=await context.newCDPSession(page);
 async function swipe(x,y,to){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+(to-y)*i/12}]});await page.waitForTimeout(18)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(300)}
 // Reproduce native clipping without the fix. No locator clicks or scrollIntoView.
 await page.evaluate(()=>{document.querySelector('#app').classList.remove('race-host454');document.querySelector('#app').scrollTop=0});
 await swipe(5,500,130);assert.equal(await page.locator('#app').evaluate(e=>e.scrollTop),0);checks.push('baseline native app clipping reproduced with touch');
 await page.evaluate(()=>document.querySelector('#app').classList.add('race-host454'));
 for(const width of [320,393,709]){
 await page.setViewportSize({width,height:640});await page.evaluate(()=>document.querySelector('#app').scrollTop=0);
 await swipe(5,510,130);assert.ok(await page.locator('#app').evaluate(e=>e.scrollTop)>0,'outer touch scroll '+width);
 const target=page.locator('[data-race-action="start"]');
 for(let i=0;i<10;i++){const b=await target.boundingBox();if(b.y>=0&&b.y+b.height<=640)break;await swipe(5,510,130)}
 const b=await target.boundingBox();assert.ok(b.y>=0&&b.y+b.height<=640,'start reachable '+width);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks.push('touch reaches start before any auto-scroll at '+width);
 }
 await page.setViewportSize({width:393,height:640});await page.evaluate(()=>document.querySelector('#app').scrollTop=300);
 const roster=page.locator('.race-roster451');const rb=await roster.boundingBox();const y=Math.min(580,rb.y+rb.height-15);await swipe(190,y,Math.max(rb.y+20,y-180));assert.ok(await roster.evaluate(e=>e.scrollTop)>0);checks.push('roster retains independent touch scrolling');
 await page.evaluate(()=>{const e=document.querySelector('.race-roster451');e.scrollTop=e.scrollHeight;document.querySelector('#app').scrollTop=300});const before=await page.locator('#app').evaluate(e=>e.scrollTop);await swipe(190,570,430);assert.ok(await page.locator('#app').evaluate(e=>e.scrollTop)>before);checks.push('roster bottom chains gesture to outer scroll');
 for(let i=0;i<8;i++){const b=await page.locator('[data-race-action="start"]').boundingBox();if(b.y>=0&&b.y+b.height<=640)break;await swipe(5,510,130)}
 await page.screenshot({path:'docs/build454/start-reachable.png'});
 const start=await page.locator('[data-race-action="start"]').boundingBox();assert.ok(start.y>=0&&start.y+start.height<=640);await page.touchscreen.tap(start.x+start.width/2,start.y+start.height/2);
 await page.waitForFunction(()=>qa451.client.state.room.phase==='entry');checks.push('start enters selection phase');await page.waitForFunction(()=>qa451.client.state.room.phase==='parade',{}, {timeout:60000});checks.push('visible start tapped successfully; solo room progresses to parade');
 assert.equal(await page.locator('#app').evaluate(e=>e.scrollTop),0);
 await page.evaluate(()=>qa451.client.unmount());assert.equal(await page.locator('#app').evaluate(e=>getComputedStyle(e).overflowY),'hidden');checks.push('unmount restores native non-race overflow');
 assert.deepEqual(errors,[]);fs.writeFileSync('docs/build454/scroll-results.json',JSON.stringify({checks,errors,browser:'Chromium mobile touch via CDP; physical Safari not tested'},null,2));console.log(JSON.stringify({checks,errors}));
}finally{await browser?.close();for(const p of processes)p.kill();fs.rmSync(dir,{recursive:true,force:true})}
