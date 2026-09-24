import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const game=fileURLToPath(new URL('../../',import.meta.url)),out=resolve(game,'docs/build528')+'/';await mkdir(out,{recursive:true});
const source=await readFile(resolve(game,'index.html'),'utf8');
const styles=[...source.matchAll(/href="(\.\/src\/Styles\/[^"?]+)/g)].map(m=>m[1]);
const font=process.env.QA_FONT_DIR;
const html='<!doctype html><html lang="ja"><meta charset="utf-8"><base href="/game/"><meta name="viewport" content="width=device-width,initial-scale=1">'+(font?'<link rel="stylesheet" href="/font/400.css">':'')+styles.map(f=>'<link rel="stylesheet" href="/game/'+f.slice(2)+'">').join('')+'<style>*{box-sizing:border-box}html,body{margin:0;background:#09291f;color:#fff5d1;font-family:sans-serif}button,input{font:inherit}.sg-monster{display:inline-flex;width:36px;height:36px;align-items:center;justify-content:center}'+(font?'*{font-family:"Noto Sans JP",sans-serif!important}':'')+'</style><main id="app"></main><script type="module" src="/game/tools/build528/preview.mjs"></script></html>';
const server=createServer(async(req,res)=>{const url=decodeURIComponent(req.url.split('?')[0]);if(url==='/preview.html'){res.setHeader('Content-Type','text/html');res.end(html);return;}const root=font&&url.startsWith('/font/')?font:game,path=resolve(root,'.'+url.replace(/^\/(game|font)/,''));try{if(!path.startsWith(resolve(root)+'/'))throw Error();const data=await readFile(path);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(path)]??'application/octet-stream');res.end(data)}catch{res.statusCode=404;res.end('missing')}});await new Promise(r=>server.listen(8528,'127.0.0.1',r));
const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const results=[],errors=[];
for(const [width,height] of [[320,568],[375,667],[390,700],[430,800]]){
 const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8528/preview.html');await page.waitForFunction(()=>window.qaReady);await page.waitForTimeout(300);
 await page.locator('[data-gear-seat511="0"]').tap();await page.waitForTimeout(150);
 const initial=await page.evaluate(()=>{const e=document.querySelector('[data-gear-panel511]'),s=e.querySelector('[data-gear-list511]');return{title:e.querySelector('header').innerText,top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,scrollHeight:s.scrollHeight,height:s.clientHeight,items:e.querySelectorAll('[data-gear-slot511]:not([hidden])').length,dots:document.querySelectorAll('[data-dot511]').length,inert:document.querySelector('.lk-controls508').inert,extraSelectors:e.querySelectorAll('[data-gear-seat511]').length}});
 if(initial.items!==16||initial.dots!==16||!initial.inert||initial.extraSelectors||initial.bottom>height+1||initial.scrollHeight<=initial.height)throw Error('layout '+JSON.stringify(initial));
 // Real browser touch events, not just programmatically assigning scrollTop.
 const box=await page.locator('[data-gear-list511]').boundingBox(),cdp=await page.context().newCDPSession(page),x=Math.round(box.x+box.width*.6),y=Math.round(box.y+box.height-30);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let j=1;j<=10;j++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-j*Math.min(25,(box.height-65)/10)}]});await page.waitForTimeout(16)}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(100);
 const touchScroll=await page.locator('[data-gear-list511]').evaluate(e=>e.scrollTop);if(touchScroll<50)throw Error('native touch blocked '+width+':'+touchScroll);
 await page.locator('[data-gear-list511]').evaluate(e=>e.scrollTop=e.scrollHeight);await page.waitForTimeout(100);
 const last=await page.locator('[data-gear-slot511]:not([hidden])').last().boundingBox();if(last.y+last.height>box.y+box.height+1)throw Error('last equipment clipped');
 const before=await page.locator('[data-gear-list511]').evaluate(e=>e.scrollTop);await page.evaluate(()=>c.render());await page.waitForTimeout(100);const after=await page.locator('[data-gear-list511]').evaluate(e=>e.scrollTop);if(Math.abs(before-after)>2)throw Error('scroll position reset '+before+' '+after);
 if(width===390)await page.screenshot({path:out+'equipment-bottom.png'});
 await page.locator('[data-gear-seat511="2"]').tap();await page.waitForTimeout(80);const title=await page.locator('[data-gear-title511]').textContent();if(!title.includes('追い風オオカミ'))throw Error('wrong player');
 await page.keyboard.press('Escape');await page.waitForTimeout(80);if(await page.locator('[data-gear-panel511]').isVisible())throw Error('Escape close failed');
 await page.evaluate(()=>show('luck','lobby'));await page.locator('[data-lk511-rounds="8"]').tap();if(await page.locator('[data-lk511-rounds="8"]').getAttribute('aria-pressed')!=='true')throw Error('round select failed');await page.locator('[data-lk511-rounds="16"]').tap();if(!(await page.locator('.lk-facts507').textContent()).includes('16'))throw Error('round facts stale');
 if(width===390)await page.screenshot({path:out+'round-selection.png',fullPage:true});
 await page.evaluate(()=>show('luck','hand'));await page.locator('[data-gear-seat511="0"]').tap();await page.waitForTimeout(80);if(width===390)await page.screenshot({path:out+'equipment-top.png'});
 results.push({width,viewportHeight:height,...initial,touchScroll,scrollRestored:Math.abs(before-after)<=2,selectedPlayer:title});await page.close();
}
const page=await browser.newPage({viewport:{width:390,height:700},isMobile:true,hasTouch:true});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8528/preview.html');await page.waitForFunction(()=>window.qaReady);
await page.evaluate(()=>show('sugoroku','board'));await page.waitForTimeout(400);await page.screenshot({path:out+'stop-board.png'});
await page.evaluate(()=>show('sugoroku','card'));await page.waitForTimeout(200);await page.locator('.sg-inspect .sg-stop-notice528').scrollIntoViewIfNeeded();await page.screenshot({path:out+'stop-card.png'});
const notice=await page.locator('.sg-inspect .sg-stop-notice528').textContent();if(!notice.includes('20マス')||!notice.includes('初回停止'))throw Error('card stop preview missing');
await page.evaluate(()=>show('gorilla','blast'));await page.waitForFunction(()=>c.ggUI502.artReady503,{timeout:10000});await page.waitForTimeout(200);await page.screenshot({path:out+'gorilla-pinch.png'});
if(errors.length)throw Error('browser errors: '+errors.join(' / '));
await import('node:fs/promises').then(f=>f.writeFile(out+'browser-results.json',JSON.stringify({engine:'Chromium 153; mobile viewport emulation',views:'Production modules + local controller fixture; placeholder portraits, Japanese QA font',results,cardNotice:notice,errors},null,2)));
console.log(JSON.stringify({passed:results.length,errors,notice}));await browser.close();server.close();
