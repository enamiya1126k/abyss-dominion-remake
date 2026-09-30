import {createRequire} from 'node:module';import {mkdir,rm} from 'node:fs/promises';import {createServer} from './preview.mjs';
const {chromium}=createRequire(import.meta.url)('playwright'),server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const dir='docs/build567/frames';await mkdir(dir,{recursive:true});let browser;
try{
 browser=await chromium.launch({executablePath:process.env.QA_CHROMIUM??'/tmp/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:740},isMobile:true,hasTouch:true,deviceScaleFactor:1});await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.ready);await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>{load();cue('cut');});await page.waitForTimeout(200);
 const cdp=await page.context().newCDPSession(page),box=await page.locator('[data-cb-swipe567]').boundingBox(),y=box.y+box.height*.5;
 const touch=(type,dy)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:315,y:y+dy,id:0,radiusX:5,radiusY:5,force:1}]});await touch('touchStart',0);
 for(let i=0;i<120;i++){
  if(i===80)await page.evaluate(()=>cue('stop'));
  if(i===100)await page.evaluate(()=>cue('cut'));
  let position;
  if(i<12)position=i/12*.65;
  else if(i<80){const phase=((i-12)%8)/8;position=phase<.5?phase*2:2-phase*2;}
  else if(i<86)position=0;
  else if(i<94)position=(i-86)/7;
  else if(i<100)position=1;
  else{const phase=((i-100)%8)/8;position=phase<.5?phase*2:2-phase*2;}
  await touch('touchMove',position*110);await page.waitForTimeout(40);await page.screenshot({path:dir+'/'+String(i).padStart(4,'0')+'.png'});
 }
 await touch('touchEnd');console.log('120 native-touch frames captured');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
