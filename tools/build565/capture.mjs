import {createRequire} from 'node:module';
import {mkdtemp,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createServer} from './preview.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const frames=await mkdtemp(join(tmpdir(),'abyss565-'));
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:740},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.ready);await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>demo());await page.waitForTimeout(200);
 const start=Date.now();
 for(let i=0;i<38;i++){
  const wait=start+i*100-Date.now();if(wait>0)await page.waitForTimeout(wait);
  if(i===5)await page.evaluate(()=>{goalDemo();window.captureTimer=setInterval(()=>advance(20),20);});
  await page.screenshot({path:join(frames,String(i).padStart(3,'0')+'.png')});
 }
 await mkdir('docs/build565',{recursive:true});
 const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate','10','-i',join(frames,'%03d.png'),'-filter_complex','split[s0][s1];[s0]palettegen=max_colors=192[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0','docs/build565/goal-demo.gif'],{encoding:'utf8'});
 if(result.status!==0)throw Error(result.stderr);console.log('Created docs/build565/goal-demo.gif from the actual game renderer.');
}finally{await browser?.close();await new Promise(r=>server.close(r));await rm(frames,{recursive:true,force:true});}
