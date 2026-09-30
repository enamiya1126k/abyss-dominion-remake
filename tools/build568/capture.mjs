import {createRequire} from 'node:module';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createServer} from './preview.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const frames=await mkdtemp(join(tmpdir(),'abyss568-'));let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_CHROMIUM??'/tmp/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:740},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.ready);await page.evaluate(()=>document.fonts.ready);
 const cdp=await page.context().newCDPSession(page),touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:0,radiusX:5,radiusY:5,force:1}]});
 let frame=0;
 for(const self of [0,1]){
  await page.evaluate(self=>{
   load('play',self);freeze();const sign=self===0?1:-1;
   rawGame.players.forEach((p,i)=>{p.ai=false;p.vx=p.vy=0;p.x=[-3.5,3.5,3.4,-3.4][i];p.y=[4.8,13.6,3.2,15.2][i];});
   Object.assign(rawGame.gem,{x:sign*-1.6,y:self===0?7.2:11.2,vx:0,vy:0,lastTouch:null,charge565:0});
   rawGame.simAt=Date.now();rawGame.serverAt=rawGame.simAt;rawGame.deadline=rawGame.simAt+90000;sync();
  },self);
  await page.waitForTimeout(100);
  for(let i=0;i<48;i++){
   if(i===5)await touch('touchStart',260,470);
   if(i>5&&i<=15)await touch('touchMove',260-(i-5)*4.5,470+(i-5)*8);
   if(i===19)await touch('touchEnd');
   if(i>=19)await page.evaluate(()=>advance(80));
   await page.screenshot({path:join(frames,String(frame++).padStart(3,'0')+'.png')});
  }
 }
 const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate','12','-i',join(frames,'%03d.png'),'-filter_complex','split[s0][s1];[s0]palettegen=max_colors=192[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0','docs/build568/team-view-demo.gif'],{encoding:'utf8'});
 if(result.status!==0)throw Error(result.stderr);console.log('Captured both local team views with production touch input and physics.');
}finally{await browser?.close();await new Promise(r=>server.close(r));await rm(frames,{recursive:true,force:true});}
