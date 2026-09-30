import {createRequire} from 'node:module';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';import {createServer} from './preview.mjs';
const {chromium}=createRequire(import.meta.url)('playwright'),server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
const report={scope:'Production cabbage view, rules, gesture binding, atlas art and bounded debris physics; isolated outer party roster. Four real sockets/coordinator tested separately.',nativeIPhoneTested:false,sizes:[],checks:[],errors:[],failed:[]};
try{
 browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM??'/tmp/chromium',headless:true,args:['--no-sandbox']});report.browserVersion=browser.version();
 const page=await browser.newPage({viewport:{width:390,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:2});page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failed.push(r.url());});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.ready);await page.evaluate(()=>document.fonts.ready);
 for(const size of [{width:390,height:740},{width:320,height:568},{width:740,height:390}]){
  await page.setViewportSize(size);await page.evaluate(()=>{load();cue('cut');});await page.waitForTimeout(80);
  const d=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,width:document.documentElement.scrollWidth,stage:document.querySelector('[data-cb-swipe567]').getBoundingClientRect().toJSON(),footer:document.querySelector('.cb-action-area').getBoundingClientRect().toJSON()}));
  assert(d.width<=size.width);assert(d.scroll<=size.height);assert(d.stage.height>=250);assert(d.stage.bottom<=size.height);assert(d.footer.bottom<=size.height);assert.equal(await page.locator('[data-cb-side]').count(),0);report.sizes.push({...size,...d});
 }
 report.checks.push('390×740, 320×568 and landscape 740×390 fit the viewport; left/right buttons removed and stage is the touch surface.');
 await page.setViewportSize({width:390,height:740});await page.evaluate(()=>{load();cue('cut');});await page.waitForTimeout(150);
 const cdp=await page.context().newCDPSession(page),touch=(type,y,x=300,id=0)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:['touchEnd','touchCancel'].includes(type)?[]:[{x,y,id,radiusX:5,radiusY:5,force:1}]});
 const box=await page.locator('[data-cb-swipe567]').boundingBox(),y=box.y+box.height*.5;
 await touch('touchStart',y);await page.waitForTimeout(25);await touch('touchMove',y+35);
 let position=await page.evaluate(()=>c.cbUI484.scene567.position);assert(position>.25&&position<.5);assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),0);
 await page.screenshot({path:'docs/build567/chromium-blade-follow.png'});await page.waitForTimeout(25);await touch('touchMove',y+105);await page.waitForTimeout(300);
 assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),1);assert.equal(await page.locator('[data-cb-score="0"]').getAttribute('data-score'),'10');
 await touch('touchMove',y+130);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),1);
 await touch('touchEnd');await touch('touchStart',y);await touch('touchEnd');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),1);
 report.protocolFields=await page.evaluate(()=>[...new Set(sent.filter(v=>v.op==='cabbageStroke567').flatMap(v=>v.strokes.flatMap(Object.keys)))]);assert.deepEqual(report.protocolFields.sort(),['at','kind','seq']);
 report.checks.push('Native CDP touch tracks the blade mid-stroke before any score; one full downstroke scores exactly once, held blade and taps cannot repeat.');
 await touch('touchStart',y+110);await touch('touchMove',y);await page.waitForTimeout(30);await touch('touchMove',y+100);await touch('touchEnd');await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),2);
 assert((await page.evaluate(()=>c.cbUI484.scene567.world.bodies.length))>0);await page.screenshot({path:'docs/build567/chromium-mobile.png'});
 // Up/down keyboard is equivalent to a full lift and cut; horizontal keys are inert.
 await page.locator('[data-cb-swipe567]').focus();await page.keyboard.press('ArrowLeft');await page.keyboard.press('a');await page.keyboard.press('d');await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),2);
 await page.keyboard.press('ArrowUp');await page.waitForTimeout(25);await page.keyboard.press('ArrowDown');await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),3);
 await page.keyboard.press('ArrowDown');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),3);
 await page.evaluate(()=>cue('stop'));const previous=await page.evaluate(()=>rawGame.players[0].score);await page.keyboard.press('ArrowUp');await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>rawGame.players[0].score),previous);
 await page.keyboard.press('ArrowDown');await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>rawGame.players[0].score),previous-80);assert.equal(await page.evaluate(()=>rawGame.players[0].boardDamage),1);await page.screenshot({path:'docs/build567/chromium-stop.png'});
 report.checks.push('Upstroke and waiting never score or damage; keyboard ↑/↓ uses same rules; ←/→/A/D removed; red-cue downstroke costs exactly 80 and damages the board.');
 await page.evaluate(()=>{load();cue('cut');});await touch('touchStart',y);await touch('touchMove',y+25);await touch('touchCancel');await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),0);
 await page.evaluate(()=>{load();cue('cut');});await touch('touchStart',y);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y,id:0},{x:130,y:y+10,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:300,y,id:0},{x:130,y:y+110,id:1}]});await touch('touchCancel');await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),0);
 report.checks.push('Touch cancellation produces no cut; a second finger cannot move or score with the primary knife.');
 await page.evaluate(()=>{load();cue('cut');c.ready=()=>false;c.connected=()=>false;});await page.waitForTimeout(90);assert(await page.locator('[data-cb-offline]').isVisible());await touch('touchStart',y);await touch('touchMove',y+100);await touch('touchEnd');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),0);await page.evaluate(()=>{c.ready=()=>true;c.connected=()=>true;});
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>{load();cue('cut');});await touch('touchStart',y);await page.waitForTimeout(25);await touch('touchMove',y+100);await touch('touchEnd');await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),1);assert.equal(await page.evaluate(()=>c.cbUI484.scene567.world.bodies.length),0);assert((await page.evaluate(()=>c.cbUI484.scene567.position))>.8);
 report.checks.push('Disconnected input is blocked; reduced motion keeps essential blade tracking and scoring while omitting debris.');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>{window.PointerEvent=undefined;load();cue('cut');});await touch('touchStart',y);await page.waitForTimeout(25);await touch('touchMove',y+100);await touch('touchEnd');await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>rawGame.players[0].cuts),1);report.checks.push('Native touch fallback without PointerEvent cuts once and suppresses compatibility clicks.');
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 report.stress=await page.evaluate(async()=>{
  load();cue('cut');const s=c.cbUI484.scene567;for(let i=0;i<120;i++)s.hit(false);const samples=[],intervals=[];let previous=performance.now();
  for(let i=0;i<100;i++){await new Promise(requestAnimationFrame);const now=performance.now();intervals.push(now-previous);previous=now;const t=performance.now();s.pose((i%20)/20,true);view.cabbageTick484(c);samples.push(performance.now()-t);}
  const ordered=[...samples].sort((a,b)=>a-b);return{cpuSlowdown:4,frames:samples.length,meanDrawAndTickMs:samples.reduce((a,b)=>a+b,0)/samples.length,p95DrawAndTickMs:ordered[Math.floor(ordered.length*.95)],maxBodies:40,bodiesAfter:s.world.bodies.length,frameIntervalP95:[...intervals].sort((a,b)=>a-b)[95],adaptiveLite:s.lite,meanFrameInterval:intervals.reduce((a,b)=>a+b,0)/intervals.length};
 });assert(report.stress.bodiesAfter<=40);assert(report.stress.p95DrawAndTickMs<16.7);await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
 report.checks.push('40-body cap stressed at 4× CPU slowdown; physics and blade remain local, gesture messages never contain particle state.');
 await page.evaluate(()=>{load('lobby');});await page.screenshot({path:'docs/build567/chromium-lobby.png',fullPage:true});await page.evaluate(()=>{load();finish();});assert.equal(await page.locator('[data-party-result490="again"]').count(),1);await page.screenshot({path:'docs/build567/chromium-result.png',fullPage:true});
 assert.deepEqual(report.errors,[]);assert.deepEqual([...new Set(report.failed)],[]);
}finally{await browser?.close();await new Promise(r=>server.close(r));await writeFile('docs/build567/chromium-browser.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
