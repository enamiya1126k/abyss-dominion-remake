import http from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=process.cwd(),base='/abyss-dominion-remake/',music=resolve(root,'../.task-audio560/music'),requests=[];
const html=`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Build561 media delivery QA</title>
<button id="tap">音楽を開始</button><button id="off">音OFF</button><button id="on">音ON</button><div id="panel"></div>
<script type="module">
window.settings={audioEnabled:true,musicVolume:.28,sfxVolume:.45};
window.useWorker=async build=>{await navigator.serviceWorker.register('./world-raid-offline'+build+'-sw.js',{scope:'./',updateViaCache:'none'});await new Promise((resolve,reject)=>{const sw=navigator.serviceWorker;const check=()=>{if(sw.controller?.scriptURL.endsWith('offline'+build+'-sw.js')){clearTimeout(timer);sw.removeEventListener('controllerchange',check);resolve()}};const timer=setTimeout(()=>reject(Error('controller timeout')),10000);sw.addEventListener('controllerchange',check);check()})};
const build=new URL(location.href).searchParams.get('build')||'560';await useWorker(build);
const {AudioSystem}=await import('./src/core/AudioSystem.js?v=build'+build);window.system=new AudioSystem(()=>settings);
document.addEventListener('pointerdown',()=>system.unlock(),{once:true,passive:true});
document.querySelector('#off').onclick=()=>{settings.audioEnabled=false;system.applySettings()};document.querySelector('#on').onclick=()=>{settings.audioEnabled=true;system.unlock();system.applySettings()};
if(build==='561'){const {audioRecoveryPanel561}=await import('./src/core/AudioRecovery561.js?v=3.1.240-build561');document.querySelector('#panel').innerHTML=audioRecoveryPanel561({settings})}
window.probe=async(name,range)=>{try{const r=await fetch('./assets/audio/'+name+'?v=2.11.2-build166',{headers:range?{Range:range}:{}});return {status:r.status,range:r.headers.get('content-range'),length:(await r.arrayBuffer()).byteLength}}catch(e){return {error:e.name,message:e.message}}};
window.ready=true;
</script></html>`;
let failAudio=false;
const server=http.createServer(async(req,res)=>{try{
 const u=new URL(req.url,'http://local'),p=u.pathname;if(p===base){res.setHeader('Content-Type','text/html');res.end(html);return}if(p==='/favicon.ico'){res.writeHead(204);res.end();return}
 if(p===base+'qa-fault'){failAudio=u.searchParams.has('on');res.writeHead(204);res.end();return}
 const rel=p.slice(base.length);let f;
 if(rel.startsWith('assets/audio/'))f=resolve(music,rel.split('/').at(-1));
 else if(rel==='world-raid-offline560-sw.js'||rel==='src/core/AudioSystem.js'&&u.searchParams.get('v')==='build560')f=resolve(root,'../baseline560',rel);
 else f=resolve(root,rel);
 if(!p.startsWith(base)||!f.startsWith(resolve(root,'..')+'/'))throw Error('Invalid path');
 const bytes=await readFile(f),range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
 if(rel.startsWith('assets/audio/')&&failAudio){res.writeHead(503,{'Cache-Control':'no-store'});res.end();return}
 res.setHeader('Content-Type',extname(f)==='.mp3'?'audio/mpeg':extname(f)==='.js'?'text/javascript':'text/plain');res.setHeader('Cache-Control','no-store');res.setHeader('Accept-Ranges','bytes');
 if(rel.startsWith('assets/audio/'))requests.push({file:rel,range:req.headers.range??null});
 if(range){const start=Number(range[1]),end=range[2]?Math.min(bytes.length-1,Number(range[2])):bytes.length-1;res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});res.end(bytes.subarray(start,end+1))}else{res.setHeader('Content-Length',bytes.length);res.end(bytes)}
 }catch(e){res.writeHead(404);res.end(String(e))}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM??resolve(root,'../.task-audio560/runtime/chromium'),headless:true,args:['--no-sandbox','--autoplay-policy=user-gesture-required']});
 const page=await browser.newPage({viewport:{width:390,height:740},isMobile:true,hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const url=`http://127.0.0.1:${server.address().port}${base}`;
 await page.goto(url+'?build=560');await page.waitForFunction(()=>window.ready);
 const report={browser:'Chromium 133, mobile touch, production Service Workers and actual unchanged MP3s; not iPhone hardware',before:{},after:{},tracks:[]};
 report.before.coldRange=await page.evaluate(()=>probe('main-bgm.mp3','bytes=0-1'));assert.equal(report.before.coldRange.error,'TypeError');
 report.before.warmFull=await page.evaluate(()=>probe('main-bgm.mp3'));assert.equal(report.before.warmFull.status,200);
 report.before.warmRange=await page.evaluate(()=>probe('main-bgm.mp3','bytes=0-1'));assert.equal(report.before.warmRange.status,200);assert(report.before.warmRange.length>2);
 // Cold actual media playback takes the same failing 206 -> Cache.put path.
 await page.evaluate(()=>{system.scene='explore'});await page.locator('#tap').tap();
 await page.waitForFunction(()=>system.current?.error);report.before.media=await page.evaluate(()=>({time:system.current.currentTime,code:system.current.error.code,needsGesture:system.needsGesture}));assert.equal(report.before.media.time,0);
 console.log(JSON.stringify({oldWorker:report.before}));
 await page.evaluate(()=>{localStorage.setItem('qa-save-sentinel','preserve');system.destroy();return useWorker('561')});
 report.after.controller=await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL.split('/').at(-1));assert.equal(report.after.controller,'world-raid-offline561-sw.js');
 report.after.coldRange=await page.evaluate(()=>probe('main-bgm.mp3','bytes=0-1'));assert.equal(report.after.coldRange.status,206);assert.equal(report.after.coldRange.length,2);
 // Deliberately seed a stale whole audio entry in the current worker cache.
 await page.evaluate(async()=>{const c=await caches.open('abyss-world-offline-build561');await c.put(new URL('./assets/audio/main-bgm.mp3',location.href),new Response('stale-audio',{headers:{'Content-Type':'audio/mpeg'}}))});
 report.after.staleRange=await page.evaluate(()=>probe('main-bgm.mp3','bytes=0-1'));assert.equal(report.after.staleRange.status,206);assert.equal(report.after.staleRange.length,2);
 report.after.staleFull=await page.evaluate(()=>probe('main-bgm.mp3'));assert.equal(report.after.staleFull.length,3640405);
 await page.goto(url+'?build=561');await page.waitForFunction(()=>window.ready);assert.equal(await page.evaluate(()=>localStorage.getItem('qa-save-sentinel')),'preserve');
 await page.locator('[data-audio-retry561]').tap();await page.waitForFunction(()=>system.current?.currentTime>.1);
 await page.evaluate(()=>{window.meter=system.context.createAnalyser();meter.fftSize=2048;window.mediaSource=system.context.createMediaElementSource(system.current);mediaSource.connect(meter);meter.connect(system.context.destination);window.initialMedia=system.current;window.level=()=>{const d=new Float32Array(meter.fftSize);meter.getFloatTimeDomainData(d);return Math.sqrt(d.reduce((s,x)=>s+x*x,0)/d.length)}});
 for(const scene of ['home','explore','battle','boss','elite','abyss','divine']){
  await page.evaluate(s=>system.setScene(s),scene);await page.waitForFunction(()=>system.current.currentTime>.2&&!system.current.paused&&level()>0.00001);
  const row=await page.evaluate(()=>({scene:system.scene,time:system.current.currentTime,rms:level(),sameElement:system.current===initialMedia,error:system.current.error?.code??null}));assert(row.sameElement);assert.equal(row.error,null);report.tracks.push(row);
 }
 assert.equal(await page.locator('[data-audio-state561]').textContent(),'BGMを再生中です。');
 await page.evaluate(async()=>{await fetch('./qa-fault?on');system.setScene('home')});await page.waitForFunction(()=>system.current.error);
 assert.match(await page.locator('[data-audio-state561]').textContent(),/読み込みに失敗/);
 await page.evaluate(()=>fetch('./qa-fault'));await page.locator('[data-audio-retry561]').tap();await page.waitForFunction(()=>!system.current.error&&system.current.currentTime>.2&&!system.current.paused);report.after.networkErrorRecovery=true;
 const before=await page.evaluate(()=>system.current.currentTime);await page.locator('#tap').tap();assert(await page.evaluate(t=>system.current.currentTime>=t,before));
 await page.locator('#off').tap();await page.locator('[data-audio-retry561]').tap();assert(await page.evaluate(()=>system.current.paused));assert.equal(await page.locator('[data-audio-state561]').textContent(),'サウンドはOFFです。');
 await page.locator('#on').tap();await page.waitForFunction(()=>!system.current.paused);
 await page.evaluate(()=>{settings.musicVolume=0;system.applySettings()});await page.locator('[data-audio-retry561]').tap();assert.equal(await page.locator('[data-audio-state561]').textContent(),'BGMの音量が0%です。');
 await page.evaluate(()=>{settings.musicVolume=.28;system.applySettings();window.dispatchEvent(new Event('pagehide'))});assert(await page.evaluate(()=>system.current.paused));await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await page.waitForFunction(()=>!system.current.paused);
 report.after.statusUI=true;report.after.offAndZeroRespected=true;report.after.pageResume=true;report.after.saveUntouched=true;report.errors=errors;assert.deepEqual(errors,[]);
 // Non-media boot modules must still be available from the offline cache.
 await page.context().setOffline(true);const offline=await page.evaluate(async()=>{const r=await fetch('./src/core/AudioSystem.js?v=build561');return {status:r.status,source:await r.text()}});await page.context().setOffline(false);assert.equal(offline.status,200);assert(offline.source.includes('export class AudioSystem'));report.after.offlineModuleCache=true;
 report.nativeRangeRequests=requests.filter(r=>r.range).length;report.musicFiles=[...new Set(requests.map(r=>r.file))];
 await writeFile('docs/build561/browser.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({fixedWorker:report.after,tracks:report.tracks,nativeRangeRequests:report.nativeRangeRequests,errors}));
}finally{await browser?.close();await new Promise(r=>server.close(r))}
