import {createRequire} from 'node:module';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';import {createServer} from './preview.mjs';
const {chromium}=createRequire(import.meta.url)('playwright'),server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const report={scope:'Production crane rules/view/art/input, isolated outer party roster; production coordinator and four sockets tested separately.',hardwareIPhone:false,checks:[],sizes:[],errors:[],failed:[]};let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM??'/tmp/chromium',args:['--no-sandbox']});report.browserVersion=browser.version();
 const page=await browser.newPage({viewport:{width:390,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:2});page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failed.push(r.url());});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.ready);await page.evaluate(()=>document.fonts.ready);
 for(const size of [{width:390,height:740},{width:320,height:568},{width:740,height:390}]){
  await page.setViewportSize(size);for(let self=0;self<4;self++){
   await page.evaluate(self=>{load('play',self,4);freeze();},self);await page.waitForTimeout(80);
   const d=await page.evaluate(()=>{const stage=document.querySelector('[data-cr-stage]').getBoundingClientRect(),control=document.querySelector('.cr-control566').getBoundingClientRect(),u=c.craneUI566,own=u.renderer.points.find(p=>p.seat===rawGame.players.find(p=>p.playerId===c.transport.selfId).seat);return{scroll:document.documentElement.scrollWidth,stage:{x:stage.x,y:stage.y,w:stage.width,h:stage.height,bottom:stage.bottom},controlBottom:control.bottom,own};});
   assert(d.scroll<=size.width);assert(d.stage.h>=260);assert(d.stage.bottom<=size.height);assert(d.controlBottom<=size.height);assert(d.own.y>d.stage.h*.7);assert(Math.abs(d.own.x-d.stage.w/2)<.01);assert.equal(await page.locator('[data-cr-pawn]').count(),4);report.sizes.push({...size,self,...d});
  }
 }
 report.checks.push('All four seats rotate to the bottom and fit 390×740, 320×568 and 740×390 without overflow.');
 await page.setViewportSize({width:390,height:740});await page.evaluate(()=>{load('play',0,4);freeze();});await page.waitForTimeout(100);
 const cdp=await page.context().newCDPSession(page),touch=(type,q)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:['touchEnd','touchCancel'].includes(type)?[]:[{x:q.x,y:q.y,id:0,radiusX:4,radiusY:4,force:1}]});let q=await page.evaluate(()=>targetPoint(0,0));
 await touch('touchStart',q);await touch('touchEnd');assert.equal(await page.evaluate(()=>rawGame.players[0].shots),1);assert(Math.abs(await page.evaluate(()=>rawGame.players[0].hook.angle)+Math.PI/2)<.001);
 await touch('touchStart',q);await touch('touchEnd');assert.equal(await page.evaluate(()=>rawGame.players[0].shots),1);
 await page.evaluate(()=>{load('play',0,4);freeze();});await touch('touchStart',q);await touch('touchCancel');assert.equal(await page.evaluate(()=>rawGame.players[0].shots),0);assert.equal(await page.evaluate(()=>c.craneUI566.aim),null);
 report.checks.push('Native CDP touch fires once in the intended direction; busy claw blocks repeats; touch cancellation does not shoot.');
 await page.evaluate(()=>{load('play',1,4);freeze();});q=await page.evaluate(()=>targetPoint(0,0));await touch('touchStart',q);await touch('touchEnd');assert(Math.abs(Math.abs(await page.evaluate(()=>rawGame.players[1].hook.angle))-Math.PI)<.001);
 await page.evaluate(()=>{load('play',0,4);freeze();});await page.locator('[data-cr-canvas]').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>rawGame.players[0].shots),1);
 report.checks.push('Rotated-seat aiming and keyboard cursor/fire use the same authoritative angles.');
 await page.evaluate(()=>stealDemo());await page.waitForTimeout(100);await page.screenshot({path:'docs/build566/chromium-mobile.png'});q=await page.evaluate(()=>targetPoint(0,-2));await touch('touchStart',q);await touch('touchEnd');await page.evaluate(()=>advance(700));await page.waitForTimeout(90);
 assert.equal(await page.evaluate(()=>rawGame.players[0].steals),1);assert((await page.locator('[data-cr-call]').textContent()).includes('よこどり'));await page.screenshot({path:'docs/build566/chromium-steal.png'});
 await page.evaluate(()=>advance(6000));assert.equal(await page.evaluate(()=>rawGame.players[0].score),23);assert.equal(await page.evaluate(()=>rawGame.players[2].score),23);
 await page.evaluate(()=>stealDemo(true));q=await page.evaluate(()=>targetPoint(0,-2));await touch('touchStart',q);await touch('touchEnd');await page.evaluate(()=>advance(6000));assert.equal(await page.evaluate(()=>rawGame.players[0].bites),1);assert.equal(await page.evaluate(()=>rawGame.players[0].score),7);
 report.checks.push('Touch steals the returning big chest; only the new owner receives +12; a stolen mimic bites for −4.');
 await page.evaluate(()=>load('lobby',0,3));await page.locator('[data-cr-monster="m1"]').tap();assert.equal(await page.evaluate(()=>rawGame.members[0].choice.speciesId),'goblin');await page.screenshot({path:'docs/build566/chromium-lobby.png',fullPage:true});
 await page.evaluate(()=>{load('play',0,3);freeze();});assert.equal(await page.evaluate(()=>rawGame.players.filter(p=>p.ai).length),1);await page.evaluate(()=>finish());assert.equal(await page.locator('[data-party-result490="again"]').count(),1);assert.equal(await page.locator('[data-party-result490="list"]').count(),1);await page.screenshot({path:'docs/build566/chromium-result.png',fullPage:true});
 await page.evaluate(()=>{load('play',1,3);finish();});assert(await page.locator('[data-party-result490="again"]').isDisabled());report.checks.push('Three-human/one-AI roster, companion picker, tied result and host-only replay controls render.');
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>{load('play',0,4);freeze();rawGame.players[0].stunUntil=Date.now()+1200;sync();});await page.waitForTimeout(60);assert(await page.evaluate(()=>c.craneUI566.reduced));assert.equal(await page.locator('[data-cr-pawn="0"]>span').evaluate(el=>getComputedStyle(el).animationName),'none');report.checks.push('Reduced motion removes bite shake and animated canvas bursts.');
 await page.evaluate(()=>{c.connected=()=>false;});await page.waitForTimeout(40);assert(await page.locator('[data-cr-network]').isVisible());await page.evaluate(()=>{c.connected=()=>true;rawGame.rules566=0;sync();c.render();});assert((await page.locator('main').innerText()).includes('Build566'));assert.equal(await page.locator('canvas').count(),0);report.checks.push('Network loss is visible; incompatible room versions show the update message.');
 assert.deepEqual(report.errors,[]);assert.deepEqual([...new Set(report.failed)],[]);
}finally{await browser?.close();await new Promise(r=>server.close(r));await writeFile('docs/build566/chromium-browser.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
