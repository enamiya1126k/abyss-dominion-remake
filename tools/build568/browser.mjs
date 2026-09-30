import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createServer} from './preview.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const report={scope:'Production hockey view, inputs, rendering and rules; outer roster isolated. Four-client server integration is in the Node tests.',hardwareIPhone:false,sizes:[],checks:[],errors:[],failed:[]};
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM??'/tmp/chromium',args:['--no-sandbox']});report.browserVersion=browser.version();
 const page=await browser.newPage({viewport:{width:390,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failed.push(r.url());});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.ready);await page.evaluate(()=>document.fonts.ready);
 for(const size of [{width:390,height:740},{width:320,height:568},{width:740,height:390}]){
  await page.setViewportSize(size);
  for(const self of [0,1,2,3]){
   await page.evaluate(id=>{load('play',id);freeze();},self);await page.waitForTimeout(90);
   const d=await page.evaluate(()=>{
    const g=rawGame,r=c.ricochetUI550.renderer,me=g.players.find(p=>p.playerId===c.transport.selfId),box=document.querySelector('[data-rc-stage]').getBoundingClientRect();
    return {width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,team:me.team564,stage:box.toJSON(),attack:document.querySelector('.hk-clock565 small').textContent,
      points:r.points.map(q=>({seat:q.seat,x:q.x,y:q.y,team:g.players.find(p=>p.seat===q.seat).team564})),leftTeam:document.querySelector('.hk-scorebar565 article b').textContent};
   });
   assert(d.width<=size.width);assert(d.height<=size.height);assert(d.stage.height>120);assert(d.stage.bottom<=size.height);assert.equal(d.attack,'↑ 上へ攻撃');
   assert(d.leftTeam.includes(d.team===0?'サファイア':'ルビー'));
   for(const p of d.points)assert.equal(p.y>d.stage.height/2,p.team===d.team);
   report.sizes.push({viewport:size,self,...d});
  }
 }
 report.checks.push('All four seats on both teams see their own two strikers below center, own score first and attack up; 12 viewport/seat combinations fit.');
 await page.setViewportSize({width:390,height:740});
 const cdp=await page.context().newCDPSession(page);
 const touch=(type,x=260,y=470)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:['touchEnd','touchCancel'].includes(type)?[]:[{x,y,id:0,radiusX:5,radiusY:5,force:1}]});
 const reset=async self=>{await page.evaluate(id=>{load('play',id);freeze();rawGame.players.forEach(p=>{p.ai=false;p.vx=p.vy=0;});sync();},self);await page.waitForTimeout(50);};
 for(const self of [0,1]){
  await reset(self);await touch('touchStart');await touch('touchMove',225,550);await page.waitForTimeout(110);
  const aim=await page.evaluate(()=>({pull:c.ricochetUI550.pull,braking:rawGame.players.find(p=>p.playerId===c.transport.selfId).pulling}));assert(aim.braking);
  await page.screenshot({path:`docs/build568/chromium-${self===0?'sapphire':'ruby'}-aim.png`});
  await touch('touchEnd');
  const launched=await page.evaluate(()=>{const p=rawGame.players.find(p=>p.playerId===c.transport.selfId);return{team:p.team564,vx:p.vx,vy:p.vy,shots:p.shots555};});
  assert.equal(launched.shots,1);assert(launched.team===0?launched.vx>0&&launched.vy>0:launched.vx<0&&launched.vy<0);
  await touch('touchStart');await touch('touchMove',225,550);await touch('touchEnd');assert.equal(await page.evaluate(()=>rawGame.players.find(p=>p.playerId===c.transport.selfId).shots555),1);
  await reset(self);await touch('touchStart');await touch('touchMove',264,476);await touch('touchEnd');assert.equal(await page.evaluate(()=>rawGame.players.find(p=>p.playerId===c.transport.selfId).shots555),0);
  await touch('touchStart');await touch('touchMove',260,540);await touch('touchCancel');assert.equal(await page.evaluate(()=>rawGame.players.find(p=>p.playerId===c.transport.selfId).shots555),0);assert.equal(await page.evaluate(()=>rawGame.players.find(p=>p.playerId===c.transport.selfId).pulling),false);
  for(const [key,axis,direction] of [['ArrowUp','vy',1],['ArrowDown','vy',-1],['ArrowRight','vx',1],['ArrowLeft','vx',-1]]){
   await reset(self);await page.locator('[data-rc-canvas]').focus();await page.keyboard.press(key);await page.keyboard.down('Space');await page.waitForTimeout(140);await page.keyboard.up('Space');
   const shot=await page.evaluate(axis=>{const p=rawGame.players.find(p=>p.playerId===c.transport.selfId);return{team:p.team564,velocity:p[axis],shots:p.shots555};},axis);
   assert.equal(shot.shots,1);assert(shot.velocity*direction*(shot.team===0?1:-1)>0);
  }
 }
 report.checks.push('Native touch up/right shots have identical screen direction for sapphire and ruby; all four keyboard directions match too. Short drags cancel, touch cancel stops braking, cooldown prevents duplicates.');
 await reset(1);await touch('touchStart');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:260,y:470,id:0},{x:100,y:300,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:260,y:470,id:0},{x:100,y:430,id:1}]});await touch('touchCancel');
 assert.equal(await page.evaluate(()=>rawGame.players[1].shots555),0);
 await page.evaluate(()=>{c.ready=()=>false;c.connected=()=>false;});await touch('touchStart');await touch('touchMove',220,550);await touch('touchEnd');assert.equal(await page.evaluate(()=>rawGame.players[1].shots555),0);await page.evaluate(()=>{c.ready=()=>true;c.connected=()=>true;});
 report.checks.push('A second finger cannot fire the primary striker, and disconnected input is rejected.');
 await page.evaluate(()=>{load('lobby',0,2);freeze();});await page.locator('[data-rc-team="1"]').tap();assert.equal(await page.locator('[data-rc-team="1"]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('[data-rc-team] small').allTextContents().then(v=>v.every(s=>s.includes('下側')&&s.includes('↑ 上'))),true);
 await page.screenshot({path:'docs/build568/chromium-lobby.png',fullPage:true});
 await page.locator('[data-rc-speed="2"]').tap();await page.locator('[data-rc-rotor="true"]').tap();assert.deepEqual(await page.evaluate(()=>rawGame.hockey565),{rotor:true,speed:2});
 for(const self of [0,1]){await reset(self);await page.evaluate(()=>finish(false));assert.equal(await page.locator('[data-party-result490="again"]').count(),1);assert.equal(await page.locator('[data-party-result490="list"]').count(),1);}
 report.checks.push('Lobby wording matches both local perspectives; team/propeller/2x options and result/replay controls remain available.');
 await page.emulateMedia({reducedMotion:'reduce'});await reset(1);await touch('touchStart');await touch('touchMove',260,550);await touch('touchEnd');assert.equal(await page.evaluate(()=>rawGame.players[1].shots555),1);
 assert.deepEqual(report.errors,[]);assert.deepEqual([...new Set(report.failed)],[]);
}finally{await browser?.close();await new Promise(r=>server.close(r));await writeFile('docs/build568/chromium-browser.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
