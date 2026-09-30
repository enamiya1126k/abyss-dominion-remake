import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createServer } from './preview.mjs';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const engine=process.env.QA_ENGINE??'chromium';
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const report={engine,hardwareIPhone:false,scope:'Production hockey view, renderer, artwork, input and physics; outside party/catalogue isolated. Wire tests exercise production server queues separately.',checks:[],sizes:[],errors:[],failed:[]};
let browser;
await mkdir('docs/build565',{recursive:true});
try{
  browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(process.env.QA_CHROMIUM?{executablePath:process.env.QA_CHROMIUM}:{}),args:engine==='webkit'?[]:['--no-sandbox']});
  report.browserVersion=browser.version();
  const page=await browser.newPage({viewport:{width:390,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failed.push(r.url());});
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.ready);await page.evaluate(()=>document.fonts.ready);
  for(const size of [{width:390,height:740},{width:320,height:568},{width:740,height:390}]){
    await page.setViewportSize(size);
    for(const self of [0,1]){
      await page.evaluate(id=>{load('play',id);freeze();},self);await page.waitForTimeout(100);
      const d=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,stage:(()=>{const r=document.querySelector('[data-rc-stage]').getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom};})(),mission:document.querySelector('.hk-clock565 small').textContent}));
      assert(d.scroll<=size.width);assert(d.stage.h>=120);if(size.width<size.height)assert(d.stage.h/size.height>.74);assert(d.stage.bottom<=size.height);
      assert(d.mission.includes(self===0?'↑ 上':'↓ 下'));assert.equal(await page.locator('[data-hk-score]').count(),2);assert.equal(await page.locator('[data-rc-pawn]').count(),4);
      report.sizes.push({...size,self,...d});
    }
  }
  report.checks.push('Both team perspectives fit 390/320px portrait and 740px landscape, with the correct attack direction.');
  await page.setViewportSize({width:390,height:740});await page.evaluate(()=>{load();freeze();});await page.waitForTimeout(90);
  const stage=await page.locator('[data-rc-canvas]').boundingBox(),x=stage.x+stage.width*.5,y=stage.y+stage.height*.45;
  if(engine==='chromium'){
    const cdp=await page.context().newCDPSession(page),touch=async(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id:0,radiusX:4,radiusY:4,force:1}]});
    await touch('touchStart',x,y);await touch('touchMove',x-35,y+95);await touch('touchEnd');
    assert.equal(await page.evaluate(()=>rawGame.players[0].shots555),1);assert(await page.evaluate(()=>rawGame.players[0].vy>0));
    await touch('touchStart',x,y);await touch('touchMove',x,y+70);await touch('touchEnd');assert.equal(await page.evaluate(()=>rawGame.players[0].shots555),1);
    await page.evaluate(()=>{load();freeze();});await touch('touchStart',x,y);await touch('touchMove',x,y+80);await touch('touchCancel');assert.equal(await page.evaluate(()=>rawGame.players[0].shots555),0);assert.equal(await page.evaluate(()=>c.ricochetUI550.pull),null);
    report.checks.push('Native touch drag/release fires exactly once; cooldown rejects a second shot; touch cancellation does not fire.');
  }else{
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-35,y+95,{steps:6});await page.mouse.up();assert.equal(await page.evaluate(()=>rawGame.players[0].shots555),1);assert(await page.evaluate(()=>rawGame.players[0].vy>0));
    report.checks.push('WebKit pointer drag/release fires once in the correct direction.');
  }
  await page.evaluate(()=>{load();freeze();});await page.locator('[data-rc-canvas]').focus();await page.keyboard.press('ArrowUp');await page.keyboard.down('Space');await page.waitForTimeout(120);await page.keyboard.up('Space');assert.equal(await page.evaluate(()=>rawGame.players[0].shots555),1);
  report.checks.push('Keyboard direction/charge/release remains available.');
  await page.evaluate(()=>{load('lobby',0,2);freeze();});assert.equal(await page.locator('[data-rc-team]').count(),2);await page.locator('[data-rc-team="1"]').tap();assert(await page.locator('[data-rc-team="1"]').getAttribute('aria-pressed')==='true');
  await page.screenshot({path:'docs/build565/'+engine+'-lobby.png',fullPage:true});report.checks.push('Lobby team selection updates the actual team allocation.');
  await page.locator('[data-rc-speed="2"]').tap();assert.equal(await page.evaluate(()=>rawGame.hockey565.speed),2);
  await page.locator('[data-rc-rotor="true"]').tap();assert.equal(await page.evaluate(()=>rawGame.hockey565.rotor),true);assert(await page.evaluate(()=>c.state.party.members.every(p=>!p.ready)));
  await page.screenshot({path:'docs/build565/'+engine+'-lobby.png',fullPage:true});
  await page.evaluate(()=>load('lobby',1,2));assert(await page.locator('[data-rc-speed="2"]').isDisabled());
  report.checks.push('Host controls propeller and 2x speed; choices reset readiness and are disabled for guests.');
  for(const [draw,self] of [[false,0],[false,1],[true,0]]){
    await page.evaluate(([draw,self])=>{load('play',self);finish(draw);},[draw,self]);
    assert.equal(await page.locator('[data-party-result490="again"]').count(),1);assert.equal(await page.locator('[data-party-result490="list"]').count(),1);assert.equal(await page.locator('.hk-resultteam564').count(),2);
    assert((await page.locator('h1').textContent()).includes(draw?'引き分け':self===0?'勝利':'取り返そう'));
  }
  report.checks.push('Team win, defeat and draw show both teams with replay/list controls.');
  await page.evaluate(()=>{load();finish(false);});await page.screenshot({path:'docs/build565/'+engine+'-result.png',fullPage:true});
  await page.evaluate(()=>demo());await page.waitForTimeout(150);await page.screenshot({path:'docs/build565/'+engine+'-mobile.png'});
  await page.evaluate(()=>goalDemo());await page.waitForTimeout(220);assert(await page.locator('[data-rc-goal]').isVisible());assert((await page.locator('[data-rc-goalname]').textContent()).includes('サファイア'));
  assert.equal(await page.locator('[data-rc-goalvalue]').textContent(),'+1');await page.screenshot({path:'docs/build565/'+engine+'-goal.png'});
  assert.equal(await page.evaluate(()=>rawGame.gem),null);await page.evaluate(()=>advance(1980));assert.equal(await page.evaluate(()=>rawGame.gem),null);
  await page.evaluate(()=>advance(20));assert(await page.evaluate(()=>rawGame.gem!==null));
  await page.evaluate(()=>{load();freeze();rawGame.gem.charge565=40;sync();});await page.waitForTimeout(60);assert.equal(await page.locator('[data-rc-power]').textContent(),'弾速 ×3.00');
  report.checks.push('Goal celebration shows scoring team and points, holds the puck for 2000 ms, and uncapped charge displays correctly.');
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>goalDemo(true));await page.waitForTimeout(100);assert.equal(await page.locator('.hk-goalcard565').evaluate(el=>getComputedStyle(el).animationName),'none');
  assert((await page.locator('[data-rc-goaldetail]').textContent()).includes('オウンゴール'));await page.emulateMedia({reducedMotion:'no-preference'});
  report.checks.push('Own-goal feedback is explicit and reduced-motion disables shake and flash animations.');
  await page.evaluate(()=>{rawGame.rules550=7;sync();c.render();});assert((await page.locator('main').textContent()).includes('Build565'));assert.equal(await page.locator('[data-rc-canvas]').count(),0);
  report.checks.push('An older server room shows an update message instead of running incompatible rules.');
  assert.deepEqual(report.errors,[]);assert.deepEqual([...new Set(report.failed)],[]);
}finally{
  await browser?.close();await new Promise(r=>server.close(r));
  await writeFile('docs/build565/'+engine+'-browser.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}
