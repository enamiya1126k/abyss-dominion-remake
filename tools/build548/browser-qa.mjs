import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const out=fileURLToPath(new URL('../../docs/build548/',import.meta.url));await mkdir(out,{recursive:true});
const server=spawn(process.execPath,[fileURLToPath(new URL('./qa-server.mjs',import.meta.url))],{stdio:['ignore','pipe','pipe']});server.stderr.pipe(process.stderr);
await new Promise((ok,no)=>{server.stdout.on('data',d=>{if(String(d).includes('ready'))ok()});server.on('exit',n=>no(Error('server exited '+n)))});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const base='http://127.0.0.1:8548',errors=[],missing=[],report={engine:await browser.version(),scope:'Production cart View / Controls / Renderer with real CartCoordinator over two WebSocket clients; no public deployment or physical iPhone',viewports:[],checks:[]};
const check=(ok,msg)=>{if(!ok)throw Error(msg)};
const api=async(path,data={})=>{const r=await fetch(base+'/qa/'+path,{method:'POST',body:JSON.stringify(data)});if(!r.ok)throw Error(await r.text());return r.json()};
async function open(width=390,height=844,self='p0'){
 const p=await browser.newPage({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true});p.on('pageerror',e=>errors.push(e.stack));p.on('response',r=>{if(r.status()>=400)missing.push(r.url())});
 await p.addInitScript(()=>{window.drawnLabels548=new Set();const draw=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(s,...args){window.drawnLabels548.add(s);return draw.call(this,s,...args)}});await p.goto(base+'/preview.html?self='+self);await p.waitForFunction(()=>window.qaReady);await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>{const r=c.cartUI543.renderer;return ['track','cart','wax','sale','crates'].every(k=>r[k].complete&&r[k].naturalWidth)});return p;
}
async function reset(pages,round=2){const {id}=await api('reset',{round});for(const p of pages)await p.waitForFunction(id=>c.state.cart.id===id&&!c.state.cart.players[0].launched,id);await pages[0].waitForTimeout(70)}
async function touch(p){const cdp=await p.context().newCDPSession(p);return{down:points=>cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points}),move:points=>cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points}),up:points=>cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:points??[]}),cancel:()=>cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]})}}
const point=(x,y,id=1)=>({x,y,id,radiusX:3,radiusY:3});
async function anchor(p){const b=await p.locator('[data-ct-stage]').boundingBox();return{x:b.x+b.width*.55,y:b.y+b.height*.52}}
const shot=(p,name)=>p.screenshot({path:out+name+'.png'});
try{
 const p=await open(),peer=await open(390,844,'p1'),t=await touch(p),other=await touch(peer);await reset([p,peer]);
 let a=await anchor(p);await t.down([point(a.x,a.y)]);await t.move([point(a.x+22,a.y+69)]);await p.waitForTimeout(90);
 const pull=await p.evaluate(()=>({...c.cartUI543.pull547}));check(pull.active&&pull.power>0&&pull.power<1,'pull not sampled');check(await p.locator('[data-ct-tether]').count()===0,'old floating tether still present');check(await p.evaluate(()=>!('preview' in c.cartUI543.renderer)),'renderer computed a stopping forecast');await p.waitForFunction(power=>c.state.cart.players[0].pullPower547===power,pull.power);
 await shot(p,'cart548-pulling');check(await p.evaluate(()=>!Array.from(window.drawnLabels548).some(s=>['P','海まで飛ぶ！','停車の目安','金枠ねらい！','この先、海！'].includes(s))),'prediction or parking text is still drawn');check(await p.locator('[data-ct-power]').innerText()!=='POWER 0%','old precision readout');await p.waitForTimeout(1600);const held=await p.evaluate(()=>c.cartUI543.pull547.power);check(held===pull.power,'holding changes power');await t.up();
 await p.waitForFunction(()=>c.state.cart.players[0].launched);await peer.waitForFunction(()=>c.state.cart.players[0].launched);
 const powers=await Promise.all([p,peer].map(page=>page.evaluate(()=>c.state.cart.players[0].power)));check(powers.every(n=>n===pull.power),'server power differs from pull');
 const b=await anchor(peer);await other.down([point(b.x,b.y)]);await other.move([point(b.x-14,b.y+54)]);const second=await peer.evaluate(()=>c.cartUI543.pull547.power);await other.up();await p.waitForFunction(()=>c.state.cart.players[1].launched);
 check((await api('state')).players[1].power===second,'second player did not launch independently');await p.waitForTimeout(400);await shot(p,'cart548-launched');report.checks.push('No stopping forecast, landing marker, hazard text, parking P letters or floating joystick; actual canvas labels inspected');report.checks.push('Two connected clients agree on exact released power; holding 1.6 seconds does not increase it');
 // A stationary finger still synchronizes the final throttled move at timeout.
 await reset([p,peer]);a=await anchor(p);await t.down([point(a.x,a.y)]);await t.move([point(a.x,a.y+48)]);const deadlinePower=await p.evaluate(()=>c.cartUI543.pull547.power);await p.waitForFunction(power=>c.state.cart.players[0].pullPower547===power,deadlinePower);await api('advance',{ms:8500});await p.waitForFunction(()=>c.state.cart.players[0].launched);check((await api('state')).players[0].power===deadlinePower,'stationary pull lost at deadline');await t.up();report.checks.push('Final throttled movement reaches server even when finger stops; deadline uses that strength');
 // Taps, return-to-origin, native touch cancellation, blur and round changes.
 for(const mode of ['tap','return','cancel','blur','round']){
  await reset([p,peer]);a=await anchor(p);await t.down([point(a.x,a.y)]);
  if(mode!=='tap')await t.move([point(a.x+15,a.y+74)]);
  if(mode==='return')await t.move([point(a.x+2,a.y+2)]);
  if(mode==='cancel')await t.cancel();
  else if(mode==='blur'){await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await t.up()}
  else if(mode==='round'){await reset([p,peer],3);await t.up()}
  else await t.up();
  await p.waitForTimeout(170);check(!(await api('state')).players[0].launched,mode+' accidentally launched');check(await p.evaluate(()=>!c.cartUI543.pull547),'pull stuck after '+mode);report.checks.push(mode+' safely cancels');
 }
 await reset([p,peer]);a=await anchor(p);await t.down([point(a.x,a.y)]);await t.move([point(a.x,a.y+55)]);
 await t.down([point(a.x,a.y+55),point(a.x+40,a.y+20,2)]);check(await p.evaluate(()=>c.cartUI543.pointer547)==null,'second touch did not cancel');await t.up([point(a.x,a.y+55)]);await t.cancel();await p.waitForTimeout(160);check(!(await api('state')).players[0].launched,'multitouch accidentally fired');report.checks.push('Second finger cancels safely; lifting it cannot launch');
 await reset([p,peer]);a=await anchor(p);await t.down([point(a.x,a.y)]);await t.move([point(a.x,a.y+65)]);await p.setViewportSize({width:430,height:932});await p.waitForTimeout(160);await t.up();check(!(await api('state')).players[0].launched,'rotation accidentally fired');report.checks.push('Resize cancels safely');
 await p.setViewportSize({width:390,height:844});await reset([p,peer]);a=await anchor(p);const deck=await p.locator('.ct-sling-controls547').boundingBox();await t.down([point(a.x,a.y)]);await t.move([point(a.x,deck.y+15)]);await t.up();await p.waitForFunction(()=>c.state.cart.players[0].launched);check((await api('state')).players[0].power===1,'captured release outside stage failed');report.checks.push('Release outside the original stage stays captured and fires once');
 await reset([p,peer]);await p.locator('[data-ct-canvas]').focus();await p.keyboard.press('ArrowUp');await p.keyboard.press('ArrowLeft');await p.keyboard.press('Enter');await p.waitForFunction(()=>c.state.cart.players[0].launched);report.checks.push('Keyboard arrows and Enter work');
 await p.evaluate(()=>dispose547());await peer.evaluate(()=>dispose547());await p.close();await peer.close();
 for(const [width,height]of [[320,690],[390,844],[430,932],[844,390]]){
  await api('reset');const page=await open(width,height),finger=await touch(page);await reset([page]);
  const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,stage:document.querySelector('[data-ct-stage]').getBoundingClientRect().toJSON(),footer:document.querySelector('footer').getBoundingClientRect().toJSON(),oldControls:document.querySelectorAll('[data-ct-aim],[data-ct-control="push"]').length}));
  check(layout.scrollWidth===width,'horizontal overflow');check(layout.footer.bottom<=height+.5,'footer clipped');check(layout.oldControls===0,'old controls still present');check(layout.stage.height>=200,'stage collapsed');check(await page.evaluate(()=>{const e=document.querySelector('[data-ct-time]'),r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-ct-time]')===e}),'timer obscured by footer');report.viewports.push(layout);
  const q=await anchor(page);await finger.down([point(q.x,q.y)]);await finger.move([point(q.x-12,q.y+55)]);await page.waitForTimeout(90);await shot(page,`cart548-${width}x${height}`);await finger.up();await page.waitForFunction(()=>c.state.cart.players[0].launched);await page.evaluate(()=>dispose547());await page.close();
 }
 for(const round of [1,2,3,4,5]){
  await api('reset',{round});const page=await open();await reset([page],round);const finger=await touch(page),q=await anchor(page);
  await finger.down([point(q.x,q.y)]);await finger.move([point(q.x+10,q.y+68)]);await page.waitForTimeout(90);
  check(await page.evaluate(()=>!('preview' in c.cartUI543.renderer)),'forecast computed on round '+round);
  const terrain=await page.evaluate(()=>c.cartUI543.renderer.cacheBuilds);await finger.move([point(q.x-20,q.y+44)]);await page.waitForTimeout(60);
  check(await page.evaluate(()=>c.cartUI543.renderer.cacheBuilds)===terrain,'pull rebuilds static environment');
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>{c.render()});await page.waitForTimeout(80);
  check(await page.evaluate(()=>c.cartUI543.reduced),'reduced motion preference lost');await page.evaluate(()=>dispose547());await page.close();
 }
 report.checks.push('Five course variants draw without forecasts; pulling reuses the cached environment; reduced motion works');
 check(errors.length===0,errors.join('\n'));check(missing.length===0,missing.join('\n'));report.errors=errors;report.missing=missing;await writeFile(out+'browser-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}catch(e){console.error({errors,missing});for(const page of browser.contexts().flatMap(c=>c.pages())){await shot(page,'debug548');console.error(await page.evaluate(()=>({text:document.body.innerText,ui:window.c?.cartUI543?{pull:c.cartUI543.pull547,pending:c.cartUI543.pending547}:null})))}throw e}
finally{await browser.close();server.kill('SIGTERM')}
