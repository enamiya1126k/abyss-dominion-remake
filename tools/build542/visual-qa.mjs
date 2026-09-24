import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile,chmod} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {brotliDecompressSync} from 'node:zlib';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const server=spawn(process.execPath,['--import',fileURLToPath(new URL('../build539/catalog-fixture.mjs',import.meta.url)),fileURLToPath(new URL('./qa-server.mjs',import.meta.url))],{stdio:['ignore','pipe','pipe']});server.stderr.on('data',d=>process.stderr.write(d));
await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(String(d).includes('ready'))resolve()});server.on('exit',n=>reject(Error('server exited '+n)))});
await writeFile(process.env.CHROMIUM_PATH,brotliDecompressSync(await readFile(process.env.CHROMIUM_BROTLI)));await chmod(process.env.CHROMIUM_PATH,0o755);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const base='http://127.0.0.1:8542',out=fileURLToPath(new URL('../../docs/build542',import.meta.url)),errors=[],missing=[],results=[];await mkdir(out,{recursive:true});
const api=async(path,data={})=>{const r=await fetch(base+'/qa/'+path,{method:'POST',body:JSON.stringify(data)});if(!r.ok)throw Error(await r.text());return r.json()};
const check=(x,msg)=>{if(!x)throw Error(msg)};
async function open(width=390,height=844,self='p0'){const p=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)missing.push(new URL(r.url()).pathname)});await p.goto(base+'/preview.html?self='+self);await p.waitForFunction(()=>window.qaReady);await p.evaluate(()=>document.fonts.ready);return p}
async function sync(p,ms=50){await p.waitForTimeout(40);await api('advance',{ms});await p.waitForTimeout(120)}
async function start(p,humans=[p]){for(const q of humans)await q.locator('[data-party-action462="ready"]').click();await p.locator('[data-bb-action="start"]').click();await p.waitForFunction(()=>c.state.bomb.phase!=='lobby')}
async function shot(p,name){await p.screenshot({path:out+'/'+name+'.png'});}
async function tapCell(p,x,y){const pos=await p.evaluate(({x,y})=>{const r=c.bombUI542.renderer,b=document.querySelector('[data-bb-canvas]').getBoundingClientRect();return{x:b.x+r.left+x*r.s,y:b.y+r.top+y*r.s}},{x,y});await p.touchscreen.tap(pos.x,pos.y)}
try{
 await api('reset',{kind:'bomb',humans:2});const a=await open(),b=await open(390,844,'p1');await a.evaluate(()=>c.raw('partyColor499',{partyId:c.state.party.id,seatToken485:c.state.party.members[0].seatToken485,color499:'pink'}));await b.evaluate(()=>c.raw('partyColor499',{partyId:c.state.party.id,seatToken485:c.state.party.members[1].seatToken485,color499:'orange'}));await a.waitForTimeout(150);await start(a,[a,b]);await sync(a,3600);await api('disableAI');await api('bombSetup',{scene:true});await sync(a,50);await shot(a,'bomb542-relay-ready');await a.locator('[data-bb-control="kick"]').tap();await sync(a,50);await shot(a,'bomb542-return');await sync(a,700);await shot(a,'bomb542-explosion');await a.close();await b.close();check(errors.length===0&&missing.length===0,JSON.stringify({errors,missing}));console.log('Scene screenshots complete');
}catch(e){console.error({errors,missing});throw e}finally{await browser.close();server.kill('SIGTERM')}
