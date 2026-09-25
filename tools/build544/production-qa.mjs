import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile,chmod} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {brotliDecompressSync} from 'node:zlib';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const server=spawn(process.execPath,['--import',fileURLToPath(new URL('../build539/catalog-fixture.mjs',import.meta.url)),fileURLToPath(new URL('./qa-server.mjs',import.meta.url))],{stdio:['ignore','pipe','pipe']});server.stderr.on('data',d=>process.stderr.write(d));
await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(String(d).includes('ready'))resolve()});server.on('exit',n=>reject(Error('server exited '+n)))});
await writeFile(process.env.CHROMIUM_PATH,brotliDecompressSync(await readFile(process.env.CHROMIUM_BROTLI)));await chmod(process.env.CHROMIUM_PATH,0o755);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const base='http://127.0.0.1:8543',out=fileURLToPath(new URL('../../docs/build544',import.meta.url)),errors=[],missing=[],results=[];await mkdir(out,{recursive:true});
const api=async(path,data={})=>{const r=await fetch(base+'/qa/'+path,{method:'POST',body:JSON.stringify(data)});if(!r.ok)throw Error(await r.text());return r.json()};
const check=(x,msg)=>{if(!x)throw Error(msg)};
async function open(width=390,height=844,self='p0'){const p=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)missing.push(new URL(r.url()).pathname)});await p.goto(base+'/preview.html?self='+self);await p.waitForFunction(()=>window.qaReady);await p.evaluate(()=>document.fonts.ready);return p}
async function sync(p,ms=50){await p.waitForTimeout(40);await api('advance',{ms});await p.waitForTimeout(120)}
async function start(p,humans=[p]){for(const q of humans)await q.locator('[data-party-action462="ready"]').click();await p.locator('[data-ct-action="start"]').click();await p.waitForFunction(()=>c.state.cart.phase!=='lobby')}
async function shot(p,name){await p.screenshot({path:out+'/'+name+'.png'})}
async function touch(p){const cdp=await p.context().newCDPSession(p),b=await p.locator('[data-ct-control="push"]').boundingBox(),point={x:b.x+b.width/2,y:b.y+b.height/2,id:1};return{down:()=>cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]}),up:()=>cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}),cancel:()=>cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]})}}
try{
 await api('reset');const p=await open();
 const stylePaths=(await readFile(fileURLToPath(new URL('../../index.html',import.meta.url)),'utf8')).match(/href="[^\"]+\.css[^\"]*"/g).map(x=>x.slice(6,-1)).filter(x=>/build(45\d|46\d|47\d|48\d|49\d|5\d\d)-/.test(x));
 await p.evaluate(async paths=>{await Promise.all(paths.map(path=>new Promise(resolve=>{const l=document.createElement('link');l.rel='stylesheet';l.href='/'+path.replace(/^\.\//,'');l.onload=l.onerror=resolve;document.head.append(l)})))},stylePaths);
 await p.evaluate(async()=>{
  disposeQA();const oldRoot=document.querySelector('#app');oldRoot.replaceWith(oldRoot.cloneNode(false));const {RaceClient451}=await import('/src/race/RaceClient451.js');
  const socket=new WebSocket(location.origin.replace('http','ws')+'/socket?self=p0');
  const transport={selfId:'p0',connectionReady:false,ws:socket,capabilities:new Set(['monsterRaceV1']),_handleMessage(){},_send(type,payload){if(socket.readyState!==1)return false;socket.send(JSON.stringify(payload));return true}};
  const roster=['slime','wolf','goblin','skeleton'].map((speciesId,i)=>({id:'m'+i,speciesId}));
  const save={state:{player:{gold:0,crystals:0},monsters:roster,party:['m0']},save:()=>true};
  window.c=new RaceClient451({transport,save,displayName:()=> 'えなみ'});c.roster=()=>roster;
  socket.onmessage=e=>transport._handleMessage(JSON.parse(e.data),socket);
  socket.onopen=()=>{transport.connectionReady=true;c.mount(document.querySelector('#app'))};
 });
 await p.waitForSelector('.ct-lobby543');await p.waitForFunction(()=>c.ready());await p.waitForTimeout(600);await start(p);await sync(p,3550);
 const t=await touch(p);await t.down();await sync(p,600);await p.evaluate(()=>c.refresh());await p.waitForTimeout(150);check(await p.evaluate(()=>c.cartUI543.localCharge!=null),'status refresh preserves active hold');await sync(p,500);await t.up();await sync(p,100);check((await api('state')).players[0].launched,'production client releases');
 const fit=await p.evaluate(()=>{const s=document.querySelector('.ct-play543').getBoundingClientRect(),b=document.querySelector('[data-ct-control="push"]').getBoundingClientRect();return{left:s.left,width:s.width,height:s.height,controlBottom:b.bottom,bodyWidth:document.body.scrollWidth}});check(fit.bodyWidth<=390&&fit.controlBottom<=845,'production CSS fit');
 await api('scene');await p.waitForTimeout(350);await shot(p,'cart544-production');await shot(p,'cart544-before-crash');await sync(p,550);await shot(p,'cart544-crash');await api('scene',{kind:'fall'});await sync(p,450);await shot(p,'cart544-fall');await sync(p,160000);await p.waitForSelector('.ct-result543');await p.locator('[data-party-result490="again"]').click();await p.waitForSelector('.ct-lobby543');await start(p);await sync(p,3550);const t2=await touch(p);await t2.down();await sync(p,250);await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await sync(p,100);check((await api('state')).players[0].chargeAt==null,'production blur cancels without launch');check(!(await api('state')).players[0].launched,'blur not launch');

 await t2.cancel();await sync(p,50);
 const throttle=await p.context().newCDPSession(p);await throttle.send('Emulation.setCPUThrottlingRate',{rate:4});
 const t3=await touch(p);await t3.down();await api('run',{running:true});
 const forecastPerf=await p.evaluate(async()=>{const times=[],r=c.cartUI543.renderer,cache=r.cacheBuilds,start=performance.now();let last=start;await new Promise(resolve=>{function tick(t){times.push(t-last);last=t;if(t-start<1100)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});times.sort((a,b)=>a-b);return{frames:times.length,p95:times[Math.floor(times.length*.95)],cacheBuilds:r.cacheBuilds-cache,preview:!!r.preview,throttle:4}});
 await shot(p,'cart544-aim');await t3.up();await p.waitForTimeout(150);await api('run',{running:false});await throttle.send('Emulation.setCPUThrottlingRate',{rate:1});check(forecastPerf.preview,'hold predicts isolated stop');check(forecastPerf.cacheBuilds===0,'hold preview reuses terrain cache');
 await api('scene',{kind:'gold',round:1});await sync(p,350);check(await p.locator('[data-ct-status="0"]').textContent()==='★ 仮 143点','gold live score visible');await shot(p,'cart544-gold');
 for(const[round,name,title]of [[2,'wax','床、磨きたて。'],[3,'rug','ふかふか大通り'],[4,'boost','返品エクスプレス'],[5,'sale','閉店セール']]){await api('scene',{kind:'floor',round});await sync(p,200);check(await p.locator('[data-ct-danger]').textContent()===title,'new course shown: '+name);await shot(p,'cart544-'+name)}
 await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>c.render());await api('scene',{kind:'fall',round:1});await sync(p,300);check(await p.evaluate(()=>c.cartUI543.reduced&&c.cartUI543.renderer.points.filter(p=>p.alpha<1).every(p=>p.angle===0)),'reduced motion disables falling spin');
 check(errors.length===0,'errors: '+errors.join(';'));check(missing.length===0,'missing: '+missing.join(';'));await writeFile(out+'/production-report544.json',JSON.stringify({productionRaceClient:true,partyStyles:stylePaths.length,fit,refreshWhileHolding:true,release:true,replay:true,blurCancel:true,courseChanges:5,goldenParking:true,reducedMotion:true,forecastPerf,errors,missing},null,2));console.log('production client OK',JSON.stringify(fit));await p.evaluate(()=>c.dispose());await p.close();
}catch(e){console.error({errors,missing});for(const p of browser.contexts().flatMap(c=>c.pages())){await shot(p,'debug-production544');console.error(await p.evaluate(()=>({error:c.error,party:c.state?.party,phase:c.state?.cart?.phase,choice:c.state?.cart?.members,ready:c.ready(),html:document.querySelector('[data-party-action462=ready]')?.outerHTML})));}throw e}finally{await browser.close();server.kill('SIGTERM')}
