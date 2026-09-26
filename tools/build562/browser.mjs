import http from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=process.cwd(),styles=[507,508,509,510,511,512].map(n=>`<link rel="stylesheet" href="/src/Styles/build${n}-luck.css">`).join('')+'<link rel="stylesheet" href="/src/Styles/build528-party.css">';
const html=`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${styles}<style>@font-face{font-family:QAJP;src:url(/qa-font.ttf)}*{box-sizing:border-box}body{margin:0;background:#0c2924;color:#f5e8ad;font-family:QAJP,system-ui,sans-serif}button,input{font:inherit}#root{max-width:720px;margin:auto}.sg-monster{display:inline-grid;place-items:center;font-size:24px}</style><main id="root"></main><script type="module">
import {game,gear,resolve as resolveRound} from '/tools/build562/fixture.mjs';
import {publicLuck511} from '/src/luck/Rules511.js';
import {luckView511,luckAfter511,luckBefore511,luckClick511,paintLuck511} from '/src/luck/View511.js';
window.fakeNow=120000;Date.now=()=>fakeNow;
window.c={root:document.querySelector('#root'),state:{},transport:{selfId:'p0'},ready:()=>true,roster:()=>[],sgSpeciesName463:x=>x,sgMonster463:()=>'<span class="sg-monster" aria-label="QA portrait placeholder">◆</span>',lkUI511:{sound:false,artReady:true}};
c.render=()=>{luckBefore511(c);c.root.innerHTML=luckView511(c);luckAfter511(c);paintLuck511(c,fakeNow)};
c.root.onclick=e=>{const b=e.target.closest('button');if(b)luckClick511(c,b)};
window.load=(mode='hand')=>{
 fakeNow=120000;const g=game({round:8,rounds:16,items:['engine','engine','engine','engine'],distance:[10000,3000,2000,0]});
 g.phase=mode==='impact'?'broadcast':mode;g.phaseAt=fakeNow;g.deadline=fakeNow+35000;
 g.players[0].loadout=[...gear('ward',1,6),...gear('revenge',1,5),...gear('echo',1,2),...gear('doubling',2,1),...gear('engine',3,1)];
 Object.assign(g.players[0],{wards:4,coils:4,suns:2,savings:'2000000000000000000',lastAdvance:321});
 g.players[1].loadout=gear('shield',1,1);g.players[2].loadout=gear('spring',1,1);
 g.players[3].loadout=gear('mirror',1,1);
 if(mode==='impact')g.plan511[7].seats[1].boxes[0][0]='shell';
 if(mode!=='hand')g.event=resolveRound(g);
 window.rawGame=g;c.state.luck=publicLuck511(g,'p0');c.state.party={hostId:'p0',members:g.members.map(m=>({...m,ready:true,connected:true}))};c.render();
};
window.at=ms=>{fakeNow=120000+ms;c.lkUI511.lastPaint=null;paintLuck511(c,fakeNow)};
window.lobby=flag=>{const g=rawGame;g.phase='lobby';g.members.forEach(m=>m.owned=[m.choice]);c.state.luck=publicLuck511(g,'p0');if(!flag)delete c.state.luck.itemRules562;c.render()};
load();window.ready=true;
</script></html>`;
const server=http.createServer(async(req,res)=>{try{
 const p=new URL(req.url,'http://local').pathname;
 if(p==='/'){res.setHeader('Content-Type','text/html');res.end(html);return}
 if(p==='/qa-font.ttf'){res.setHeader('Content-Type','font/ttf');res.end(await readFile(process.env.QA_FONT??'/workspace/scratch/f849e4a30ac8/runtime546/NotoSansJP.ttf'));return}
 if(p==='/favicon.ico'){res.writeHead(204);res.end();return}
 // This isolated screen fixture excludes the unrelated party lounge and character catalogue.
 if(p==='/src/party/PartyView462.js'){res.setHeader('Content-Type','text/javascript');res.end('export const partySeats462=()=>"";');return}
 const file=p.startsWith('/assets/')?resolve(root,'../.task-luck562',p.slice(1)):resolve(root,p.slice(1));
 if(!file.startsWith(resolve(root,'..')+'/'))throw Error('Invalid path');
 const bytes=await readFile(file);res.setHeader('Content-Type',{'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png'}[extname(file)]??'text/plain');res.end(bytes);
 }catch(e){res.writeHead(404);res.end(String(e))}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM??'/workspace/scratch/f849e4a30ac8/runtime546/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:740},isMobile:true,hasTouch:true}),errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
 await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.waitForFunction(()=>window.ready);await page.evaluate(()=>document.fonts.ready);
 const panel=page.locator('[data-gear-panel511]'),stats=page.locator('[data-gear-status511]');
 const report={browser:'Chromium 133 mobile touch, production luck modules/CSS and unchanged artwork; party lounge and portraits stubbed; not iPhone hardware',sizes:[],checks:[]};
 for(const width of [390,320]){
  await page.setViewportSize({width,height:740});await page.evaluate(()=>load());
  await page.locator('[data-gear-seat511="0"]').tap();await panel.waitFor({state:'visible'});
  assert.match(await stats.textContent(),/お守り残り4 回/);assert.match(await stats.textContent(),/今回の補充（選択後）\+1 回/);
  assert.match(await stats.textContent(),/成長倍率（R8）×16384/);
  const size=await page.evaluate(()=>{const e=document.querySelector('[data-gear-list511]'),p=document.querySelector('[data-gear-panel511]');return {width:innerWidth,page:document.documentElement.scrollWidth,panel:p.getBoundingClientRect().width,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight}});
  assert(size.page<=width);assert(size.scrollWidth<=size.clientWidth+1);assert(size.scrollHeight>size.clientHeight);
  report.sizes.push(size);if(width===390)await page.screenshot({path:'docs/build562/equipment-mobile.png'});
  await page.locator('[data-gear-list511]').evaluate(e=>e.scrollTo(0,e.scrollHeight));
  assert.match(await page.locator('[data-gear-slot511]:not([hidden])').last().textContent(),/×3/);
  await page.locator('[data-gear-seat511="1"]').tap();await page.waitForFunction(()=>document.querySelector('[data-gear-title511]').textContent.startsWith('りおん'));
  assert.match(await stats.textContent(),/毎回の回数・バリア1 回/);
  assert.equal(await page.locator('[data-gear-list511]').evaluate(e=>e.scrollTop),0);
  await page.locator('[data-gear-close511]').tap();await panel.waitFor({state:'hidden'});
 }
 report.checks.push('390/320px: carried and replenishment counts separate, correct R8 multiplier, full descriptions scroll, player switching, close');
 await page.evaluate(()=>load('reveal'));await page.locator('[data-gear-seat511="0"]').tap();await panel.waitFor({state:'visible'});assert.match(await stats.textContent(),/お守り残り5 回/);
 await page.evaluate(()=>load('impact'));await page.locator('[data-gear-seat511="0"]').tap();await panel.waitFor({state:'visible'});
 await page.evaluate(()=>at(1728));assert.match(await stats.textContent(),/お守り残り5 回/);
 await page.evaluate(()=>at(1792));assert.match(await stats.textContent(),/お守り残り4 回/);
 report.checks.push('revealed refill 4+1=5; pending hit leaves5; visible impact consumes to4');
 await page.evaluate(()=>lobby(false));assert(await page.locator('[data-lk511-action="start"]').isDisabled());
 await page.evaluate(()=>lobby(true));assert(!(await page.locator('[data-lk511-action="start"]').isDisabled()));
 await page.locator('.lk-catalog508 summary').tap();assert.equal(await page.locator('.lk-catalog508 article').count(),40);
 assert.match(await page.locator('.lk-catalog508 article').filter({hasText:'お守りバルーン'}).textContent(),/未使用分は全部持ち越し/);
 report.checks.push('all40 descriptions; old server cannot start; updated server allows start');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);report.errors=errors;report.failedResources=failed;
 await writeFile('docs/build562/browser.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser?.close();await new Promise(r=>server.close(r))}
