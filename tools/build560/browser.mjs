import http from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const root=process.cwd(),music=resolve(root,'../.task-audio560/music'),requests=[],errors=[];
const html=`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Build560 audio lifecycle QA</title><button id="tap">音楽を開始</button><button id="off">音OFF</button><button id="on">音ON</button><script type="module">
import {AudioSystem} from '/src/core/AudioSystem.js';
window.settings={audioEnabled:true,musicVolume:.28,sfxVolume:.45};window.system=new AudioSystem(()=>settings);
// The unchanged production main.js listener, in addition to AudioSystem recovery.
document.addEventListener('pointerdown',()=>system.unlock(),{once:true,passive:true});
document.querySelector('#off').onclick=()=>{settings.audioEnabled=false;system.applySettings()};document.querySelector('#on').onclick=()=>{settings.audioEnabled=true;system.unlock();system.applySettings()};
window.level=()=>{const data=new Float32Array(window.meter.fftSize);window.meter.getFloatTimeDomainData(data);return Math.sqrt(data.reduce((s,x)=>s+x*x,0)/data.length)};
window.ready=true;
</script></html>`;
const server=http.createServer(async(req,res)=>{try{const p=new URL(req.url,'http://local').pathname;if(p==='/'){res.setHeader('Content-Type','text/html');res.end(html);return}if(p==='/favicon.ico'){res.writeHead(204);res.end();return}const f=p.startsWith('/assets/audio/')?resolve(music,p.split('/').at(-1)):resolve(root,'.'+p);if(!f.startsWith(root+'/')&&!f.startsWith(music+'/'))throw Error('Invalid path');const bytes=await readFile(f);if(p.endsWith('.mp3'))requests.push(p);res.setHeader('Content-Type',extname(f)==='.mp3'?'audio/mpeg':'text/javascript');res.setHeader('Accept-Ranges','bytes');const range=req.headers.range?.match(/bytes=(\d+)-(\d*)/);if(range){const start=Number(range[1]),end=range[2]?Math.min(bytes.length-1,Number(range[2])):bytes.length-1;res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});res.end(bytes.subarray(start,end+1))}else{res.setHeader('Content-Length',bytes.length);res.end(bytes)}}catch(e){res.writeHead(404);res.end(String(e))}});
await new Promise(r=>server.listen(8560,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM??resolve(root,'../.task-audio560/runtime/chromium'),headless:true,args:['--no-sandbox','--autoplay-policy=user-gesture-required']});
 const page=await browser.newPage({viewport:{width:390,height:740},isMobile:true,hasTouch:true});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});await page.goto('http://127.0.0.1:8560/');await page.waitForFunction(()=>window.ready);
 assert.equal(await page.evaluate(()=>system.current),null);await page.locator('#tap').tap();await page.waitForFunction(()=>system.current?.currentTime>.1);
 await page.evaluate(()=>{const c=system.context;window.meter=c.createAnalyser();meter.fftSize=2048;window.source=c.createMediaElementSource(system.current);source.connect(meter);meter.connect(c.destination);window.initialMedia=system.current});
 const report={browser:'Chromium mobile touch, real bundled MP3s; not iPhone Safari hardware',tracks:[],errors};
 for(const scene of ['home','explore','battle','boss','elite','abyss','divine']){
  await page.evaluate(scene=>system.setScene(scene),scene);await page.waitForFunction(()=>system.current.currentTime>.2&&!system.current.paused&&system.current.readyState>=3);await page.waitForFunction(()=>level()>0.00001);const row=await page.evaluate(()=>({scene:system.scene,src:system.current.currentSrc.split('/').at(-1),time:system.current.currentTime,rms:level(),volume:system.current.volume,oneElement:system.current===initialMedia}));assert(row.oneElement);assert(row.rms>0);report.tracks.push(row);
 }
 const before=await page.evaluate(()=>system.current.currentTime);await page.locator('#tap').tap();const after=await page.evaluate(()=>system.current.currentTime);assert(after>=before);report.noRewind={before,after};
 await page.locator('#off').tap();assert(await page.evaluate(()=>system.current.paused));await page.locator('#tap').tap();assert(await page.evaluate(()=>system.current.paused));await page.locator('#on').tap();await page.waitForFunction(()=>!system.current.paused);
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));assert(await page.evaluate(()=>system.current.paused));await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await page.waitForFunction(()=>!system.current.paused);
 // Emulate an OS/browser rejection during foreground resume, then a trusted tap.
 await page.evaluate(()=>{system.pauseForPage();window.nativePlay=system.current.play;system.current.play=()=>Promise.reject(new DOMException('Interrupted session','NotAllowedError'));return system.resumeForPage()});assert(await page.evaluate(()=>system.needsGesture));await page.evaluate(()=>system.current.play=nativePlay);await page.locator('#tap').tap();await page.waitForFunction(()=>!system.current.paused&&!system.needsGesture);report.recovery=true;
 report.requests=[...new Set(requests)];assert.equal(report.requests.length,7);assert.deepEqual(errors,[]);await writeFile('docs/build560/browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify({tracks:report.tracks.map(t=>({scene:t.scene,rms:t.rms})),recovery:true,errors}));
}finally{await browser?.close();await new Promise(r=>server.close(r))}
