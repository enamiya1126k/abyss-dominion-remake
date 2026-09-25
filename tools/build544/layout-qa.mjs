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
 for(const[width,height]of [[320,568],[390,844],[430,932],[844,390]]){
  await api('reset');const p=await open(width,height);await start(p);await sync(p,3550);await p.waitForTimeout(250);
  const fit=await p.evaluate(()=>{const h=c.cartUI543.renderer.height;return c.cartUI543.renderer.points.every(v=>v.y+34*v.scale<=h+1)});check(fit,'starting nameplates inside stage '+width);await shot(p,'cart544-course-'+width);results.push({width,height,nameplatesInside:true});await p.close();
 }
 await writeFile(out+'/layout-report544.json',JSON.stringify({results,errors,missing},null,2));console.log('Final layouts verified',JSON.stringify(results));
}finally{await browser.close();server.kill('SIGTERM')}
