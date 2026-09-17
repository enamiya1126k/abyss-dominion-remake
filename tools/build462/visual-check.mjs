import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const {chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const server=spawn(process.execPath,['tools/build462/preview-server.mjs'],{cwd:process.cwd(),env:{...process.env,RACE_QA_ASSETS:path.resolve('../qa459/asset-cache')},stdio:['ignore','pipe','pipe']});
let browser;
try {
 await new Promise((resolve,reject)=>{server.stdout.on('data',x=>{if(String(x).includes('Preview462 ready'))resolve()});server.on('error',reject)});
 const executablePath=path.resolve('../browser459/chromium');
 browser=await chromium.launch({executablePath,args:['--no-sandbox'],env:{...process.env,LD_LIBRARY_PATH:path.dirname(executablePath)}});
 const page=await browser.newPage({viewport:{width:393,height:850}});
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await page.goto('http://127.0.0.1:18451/');
 await page.evaluate(async()=>{
  const {monsterVisual}=await import('/src/ui/MonsterVisual.js');
  const {worldArt461}=await import('/src/race/RaceWorld461.js');
  const {chapterTwoCanvasFrame383}=await import('/src/ui/ChapterTwoSprite383.js');
  window.nativeCanvas462=chapterTwoCanvasFrame383;
  document.body.innerHTML='<main class="race458" style="padding:10px;color:#f5dc9e;background:#17101e"><h2>封書の小剣姫ルメア</h2><div id="lumea462" style="display:flex;justify-content:center">'+monsterVisual('ch2_lumea','◆',{frame:'idle1',className:'race-art451'})+'</div><h2>周回・全体表示</h2><div style="position:relative;height:280px;overflow:hidden"><div style="position:absolute;transform:scale(.19427);transform-origin:0 0">'+worldArt461({course:'砂',track459:3000})+'</div></div></main>';
  const art=document.querySelector('#lumea462 .race-art451');art.style.setProperty('width','250px','important');art.style.setProperty('height','250px','important');
  for(const f of ['idle1','idle2','idle3'])chapterTwoCanvasFrame383('ch2_lumea',f);
 });
 await page.waitForFunction(()=>window.nativeCanvas462?.('ch2_lumea','idle1'));
 await page.waitForTimeout(300);
 const visible=await page.evaluate(()=>['idle1','idle2','idle3'].map(frame=>{
  const c=nativeCanvas462('ch2_lumea',frame),pixels=c.getContext('2d').getImageData(0,0,256,256).data;
  let count=0;for(let i=3;i<pixels.length;i+=4)count+=Number(pixels[i]>0);return {frame,pixels:count};
 }));
 assert.ok(visible.every(x=>x.pixels>1000));
 const response=await page.request.get('http://127.0.0.1:18451/assets/monsters/ch2_389_lumea/sheet.png');
 assert.equal(response.status(),200);assert.equal((await response.body()).length,fs.statSync('assets/monsters/ch2_389_lumea/sheet.png').size);
 await page.screenshot({path:'docs/build462/native-visuals.png'});
 fs.writeFileSync('docs/build462/visual-results.json',JSON.stringify({nativeSprite:'ch2_lumea',frames:visible,bundledAtlas:true},null,2));
 console.log(visible);
}finally {await browser?.close();server.kill();}
