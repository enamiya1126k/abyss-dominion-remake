import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const out=fileURLToPath(new URL('../../docs/build546/',import.meta.url));await mkdir(out,{recursive:true});
const server=spawn(process.execPath,[fileURLToPath(new URL('./qa-server.mjs',import.meta.url))],{stdio:['ignore','pipe','pipe']});server.stderr.pipe(process.stderr);
await new Promise((ok,no)=>{server.stdout.on('data',d=>{if(String(d).includes('ready'))ok()});server.on('exit',n=>no(Error('server exited '+n)))});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const errors=[],missing=[],report={engine:await browser.version(),scope:'Production cart View543 / Renderer543 / Rules543 in deterministic local visual fixture; no live server or physical iPhone',viewports:[],rounds:[],unchanged:[]};
const check=(ok,msg)=>{if(!ok)throw Error(msg)};
const wait=async p=>{await p.waitForFunction(()=>window.qaReady);await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>{const r=c.cartUI543.renderer;return ['track','cart','wax','sale','crates'].every(k=>r[k]?.complete&&r[k].naturalWidth)});await p.waitForTimeout(120)};
const scene=async(p,round,zoom=false,ready=false)=>{await p.evaluate(a=>scene546(...a),[round,zoom,ready]);await wait(p);if(zoom)await p.waitForTimeout(700)};
try{
 for(const [width,height] of [[390,844],[320,690],[430,932],[844,390]]){
  const p=await browser.newPage({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true});p.on('pageerror',e=>errors.push(e.stack));p.on('response',r=>{if(r.status()>=400)missing.push(r.url())});
  await p.goto('http://127.0.0.1:8546/preview.html');await wait(p);
  const layout=await p.evaluate(()=>{const r=c.cartUI543.renderer;return{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,stage:c.cartUI543.nodes.stage.getBoundingClientRect().toJSON(),footer:document.querySelector('.ct-controls543').getBoundingClientRect().toJSON(),dpr:r.dpr}});
  check(layout.scrollWidth===width,'horizontal overflow');check(layout.footer.bottom<=height+.5,'footer clipped');check(layout.stage.height>=200,'stage collapsed');report.viewports.push(layout);
  await p.screenshot({path:out+`cart546-${width}x${height}.png`});
  if(width===390){
   for(let round=1;round<=5;round++){
    await scene(p,round);const state=await p.evaluate(()=>{const r=c.cartUI543.renderer;return{round:c.state.cart.round,key:r.key,cacheBuilds:r.cacheBuilds,source:r.key.includes('cart546')}});
    check(state.source===[2,5].includes(round),'wrong surface variant');const start=state.cacheBuilds;await p.waitForTimeout(180);check(await p.evaluate(()=>c.cartUI543.renderer.cacheBuilds)===start,'background rebuilt per frame');report.rounds.push(state);
    if([2,5].includes(round)){await p.screenshot({path:out+`cart546-round${round}.png`});await scene(p,round,true);await p.screenshot({path:out+`cart546-round${round}-zoom.png`});await scene(p,round)}
    if([1,3,4].includes(round)){
     const match=await p.evaluate(async()=>{const M=await import('/before/src/cart/Renderer543.js');const r=M.renderer543(document.createElement('canvas')),now=c.cartUI543.renderer;M.resize543(r,now.width,now.height,now.dpr);await Promise.all([r.track,r.cart,r.polished,r.crates].map(i=>i.decode()));M.paint543(r,c.state.cart,'p0',{reduced:true},Date.now());return r.terrain.toDataURL()===now.terrain.toDataURL()});
     check(match,'unchanged round '+round+' terrain differs');report.unchanged.push({round,pixelIdenticalTo545:match});
    }
   }
   await scene(p,2,false,true);await p.locator('[data-ct-aim]').fill('15');const push=p.locator('[data-ct-control="push"]');const b=await push.boundingBox();await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();await p.waitForTimeout(300);await p.evaluate(()=>{c.state.cart.elapsed+=600});await p.mouse.up();
   check(await p.evaluate(()=>c.state.cart.players[0].launched),'hold/release launch failed');check(await p.evaluate(()=>Math.abs(c.state.cart.players[0].aim545-15*Math.PI/180)<.0001),'aim changed');report.input={angleDegrees:15,holdReleaseLaunched:true};
   await p.evaluate(()=>run546(true));await p.waitForTimeout(450);check(await p.evaluate(()=>c.state.cart.players[0].y>1.1),'cart failed to move');await p.evaluate(()=>run546(false));
  }
  await p.evaluate(()=>c.cartUI543.cleanup?.());await p.close();
 }
 // If the new background is still loading, fall back to the established timber
 // road without showing a rectangular material or a blank scene.
 const p=await browser.newPage({viewport:{width:390,height:844}});let unblock;const gate=new Promise(r=>unblock=r);
 await p.route('**/assets/cart546/*.webp',async route=>{await gate;await route.continue()});await p.goto('http://127.0.0.1:8546/preview.html',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.qaReady&&c.cartUI543.renderer.track.naturalWidth>0);await p.waitForTimeout(100);
 check(await p.evaluate(()=>c.cartUI543.renderer.key.includes('/cart544/track.webp')),'missing fallback');unblock();await wait(p);check(await p.evaluate(()=>c.cartUI543.renderer.key.includes('/cart546/wax.webp')),'delayed asset did not refresh cache');report.delayedAsset={woodFallback:true,refreshAfterDecode:true};await p.close();
 check(errors.length===0,errors.join('\n'));check(missing.length===0,missing.join('\n'));report.errors=errors;report.missing=missing;
 await writeFile(out+'browser-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close();server.kill('SIGTERM')}
