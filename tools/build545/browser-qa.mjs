import {spawn} from 'node:child_process';
import {advanced545} from './advanced-qa.mjs';
import {mkdir,writeFile,readFile,chmod} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {brotliDecompressSync} from 'node:zlib';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const server=spawn(process.execPath,['--import',fileURLToPath(new URL('../build539/catalog-fixture.mjs',import.meta.url)),fileURLToPath(new URL('./qa-server.mjs',import.meta.url))],{stdio:['ignore','pipe','pipe']});server.stderr.on('data',d=>process.stderr.write(d));
await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(String(d).includes('ready'))resolve()});server.on('exit',n=>reject(Error('server exited '+n)))});
await writeFile(process.env.CHROMIUM_PATH,brotliDecompressSync(await readFile(process.env.CHROMIUM_BROTLI)));await chmod(process.env.CHROMIUM_PATH,0o755);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const base='http://127.0.0.1:8545',out=fileURLToPath(new URL('../../docs/build545',import.meta.url)),errors=[],missing=[],report={};await mkdir(out,{recursive:true});
const api=async(path,data={})=>{const r=await fetch(base+'/qa/'+path,{method:'POST',body:JSON.stringify(data)});if(!r.ok)throw Error(await r.text());return r.json()};
const check=(x,msg)=>{if(!x)throw Error(msg)};
async function open(width=390,height=844,self='p0'){
 const p=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1});p.on('pageerror',e=>errors.push(e.stack));p.on('response',r=>{if(r.status()>=400)missing.push(new URL(r.url()).pathname)});await p.goto(base+'/preview.html?self='+self);await p.waitForFunction(()=>window.qaReady);
 await p.evaluate(async id=>{disposeQA();const old=document.querySelector('#app');old.replaceWith(old.cloneNode(false));const {RaceClient451}=await import('/src/race/RaceClient451.js');const socket=new WebSocket(location.origin.replace('http','ws')+'/socket?self='+id);const transport={selfId:id,connectionReady:false,ws:socket,capabilities:new Set(['monsterRaceV1']),_handleMessage(){},_send(type,payload){if(socket.readyState!==1)return false;socket.send(JSON.stringify(payload));return true}};const roster=['slime','wolf','goblin','skeleton'].map((speciesId,i)=>({id:'m'+i,speciesId}));const save={state:{player:{gold:0,crystals:0},monsters:roster,party:['m0']},save:()=>true};window.c=new RaceClient451({transport,save,displayName:()=>['えなみ','りおん','より','ひで'][Number(id.slice(1))]});c.roster=()=>roster;c.sgMonster463=id=>{const i=Math.max(0,['slime','wolf','goblin','skeleton'].indexOf(id));return '<span class="sg-monster" style="display:block;width:100%;height:100%;background-image:url(/assets/bomb542/players.webp);background-size:200% 200%;background-position:'+i%2*100+'% '+Math.floor(i/2)*100+'%"></span>'};socket.onmessage=e=>transport._handleMessage(JSON.parse(e.data),socket);socket.onopen=()=>{transport.connectionReady=true;c.mount(document.querySelector('#app'))}},self);
 await p.waitForFunction(()=>c.ready());await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);return p;
}
const prefixes={canal:'cn',hide:'hd',bomb:'bb',cart:'ct'},startWait={canal:4700,hide:20100,bomb:3550,cart:3550};
async function start(p,kind,pages=[p]){if(kind==='hide')await p.locator('[data-hd-role="hider"]').click();for(const q of pages)await q.locator('[data-party-action462="ready"]').click();await p.locator(`[data-${prefixes[kind]}-action="start"]`).click();await p.waitForFunction(k=>c.state[k].phase!=='lobby',kind);await sync(p,startWait[kind]);}
async function sync(p,ms=50){await p.waitForTimeout(40);await api('advance',{ms});await p.waitForTimeout(180)}
const shot=(p,name)=>p.screenshot({path:out+'/'+name+'.png'});
async function touch(p){const cdp=await p.context().newCDPSession(p);return{points:ps=>cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:ps}),move:ps=>cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:ps}),up:ps=>cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:ps??[]}),cancel:()=>cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]})}}
try{
 if(!process.env.QA545_INPUTS&&!process.env.QA545_LAYOUT_KIND)for(const kind of ['canal','hide','bomb','cart']){
  console.log('inspect',kind);await api('reset',{kind});const p=await open();await start(p,kind);if(kind==='canal'){await api('canalSetup');await api('canalFeed');await p.waitForTimeout(100)}if(kind==='bomb')await api('bombScene');if(kind==='cart')await api('cartScene',{kind:'floor',round:2});await p.waitForTimeout(300);if(kind==='hide')await p.waitForTimeout(2000);await shot(p,kind+'545-first');
  report[kind]=await p.evaluate(k=>({phase:c.state[k].phase,error:c.error,stage:document.querySelector(`[data-${{canal:'cn-stage496',hide:'hd-stage',bomb:'bb-stage',cart:'ct-stage'}[k]}]`)?.getBoundingClientRect().toJSON(),assets:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),feed:k==='canal'?document.querySelector('.cn-feed496').getBoundingClientRect().toJSON():null,bg:k==='canal'?{src:c.cnUI496.background?.src,loaded:c.cnUI496.background?.naturalWidth}:null} ),kind);
  if(kind==='cart'){await api('cartScene',{kind:'floor',round:3});await p.waitForTimeout(250);await shot(p,'cart545-bank')}
  await p.evaluate(()=>c.dispose());await p.close();
 }
 await advanced545({api,open,start,sync,touch,shot,check,report});
 check(errors.length===0,'browser errors: '+errors.join('\n'));check(missing.length===0,'missing assets: '+missing.join(','));
 await writeFile(out+(process.env.QA545_LAYOUT_KIND&&!process.env.QA545_CONTINUE?'/layout-extra.json':process.env.QA545_INPUTS||process.env.QA545_CONTINUE?'/inputs-extra.json':'/browser-report.json'),JSON.stringify({report,errors,missing},null,2));console.log(JSON.stringify(report));
}catch(e){console.error({errors,missing});for(const p of browser.contexts().flatMap(c=>c.pages())){await shot(p,'debug545');console.error(await p.evaluate(()=>({error:c.error,html:document.body.innerText.slice(-2000)})))}throw e}finally{await browser.close();server.kill('SIGTERM')}
