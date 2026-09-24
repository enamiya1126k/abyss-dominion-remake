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
 const p=await open();await p.evaluate(()=>disposeQA());
 const stylePaths=(await readFile(fileURLToPath(new URL('../../index.html',import.meta.url)),'utf8')).match(/href="[^\"]+\.css[^\"]*"/g).map(x=>x.slice(6,-1)).filter(x=>/build(45\d|46\d|47\d|48\d|49\d|5\d\d)-/.test(x));
 await p.evaluate(async paths=>{for(const path of paths){if(document.querySelector(`link[href="${path}"]`))continue;await new Promise(resolve=>{const l=document.createElement('link');l.rel='stylesheet';l.href='/'+path.replace(/^\.\//,'');l.onload=l.onerror=resolve;document.head.append(l)})}},stylePaths);
 const report=await p.evaluate(async()=>{
  const fixtures=await(await fetch('/docs/build542/color-fixtures.json')).json(),{applyPlayerColors542}=await import('/src/party/PlayerColors542.js');
  const specs={bomb:['bomb/View542','bombView542'],tetra:['tetra/View539','tetraView539'],hide:['hide/View536','hideView536'],fishing:['fishing/View524','fishingView524'],sumo:['sumo/View523','sumoView523'],tower:['tower/View517','towerView517'],quiz:['quiz/View513','quizView513'],luck:['luck/View511','luckView511'],gorilla:['gorilla/View505','gorillaView505'],canal:['canal/View489','canalView489'],cabbage:['cabbage/View484','cabbageView484'],sugoroku:['sugoroku/View463','sugorokuView463'],race:['race/RaceView452','raceView452']},rows=[];
  for(const[kind,[path,fn]]of Object.entries(specs)){
   const module=await import('/src/'+path+'.js'),state=fixtures[kind],client={...c,state,offset:100000-Date.now(),ready:()=>true,connected:()=>true,root:document.querySelector('#app'),error:'',save:{state:{player:{gold:0,crystals:0}}},bank:()=>({}),render:()=>{}};
   try{client.root.innerHTML=module[fn](client)}catch(e){throw Error(kind+': '+e.message)}await document.fonts.ready;
   const sheets=[...document.styleSheets].filter(s=>s.href?.includes('build542-player-colors'));sheets.forEach(s=>s.disabled=true);
   const measure=()=>[...client.root.querySelectorAll('*')].map(e=>{const b=e.getBoundingClientRect();return[b.x,b.y,b.width,b.height].map(v=>Math.round(v*100)/100).join(',')});
   const before=measure();applyPlayerColors542(client);sheets.forEach(s=>s.disabled=false);const after=measure();if(JSON.stringify(before)!==JSON.stringify(after))throw Error(kind+' layout changed');
   const marks=[...client.root.querySelectorAll('[data-identity542]')],colors=marks.map(e=>getComputedStyle(e).getPropertyValue('--identity542').trim());if(marks.length<4)throw Error(kind+' missing player identity marks: '+marks.length);
   if(!['#f5a1cb','#ffb376','#78cfff','#91e3b0'].every(v=>colors.includes(v)))throw Error(kind+' palette lost: '+colors.join(','));
   rows.push({game:kind,elements:before.length,identityMarks:marks.length,colors:colors.slice(0,4),geometryChanges:0});
  }
  return rows;
 });
 results.push(...report);check(errors.length===0,'errors '+errors.join('; '));check(missing.length===0,'missing '+missing.join('; '));await writeFile(out+'/color-layout-report542.json',JSON.stringify({results,errors,missing,scope:'Live game view HTML and production styles; all element bounds before/after color-only changes.'},null,2));console.log(JSON.stringify({results,errors,missing}));await p.close();
}catch(e){console.error({errors,missing});throw e}finally{await browser.close();server.kill('SIGTERM')}
