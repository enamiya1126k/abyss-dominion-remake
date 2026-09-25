import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE),out=fileURLToPath(new URL('../../docs/build552/',import.meta.url));
const server=spawn(process.execPath,[fileURLToPath(new URL('./qa-server.mjs',import.meta.url))],{env:process.env,stdio:['ignore','pipe','pipe']});let stderr='';server.stderr.on('data',s=>stderr+=s);await new Promise((ok,no)=>{server.stdout.on('data',s=>{if(String(s).includes('ready'))ok()});server.on('exit',()=>no(Error(stderr)))});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const base='http://127.0.0.1:8550',api=(name,data={})=>fetch(base+'/qa/'+name,{method:'POST',body:JSON.stringify(data)}).then(r=>r.json()),errors=[];
try{
 const p=await browser.newPage({viewport:{width:430,height:860},deviceScaleFactor:2,isMobile:true,hasTouch:true});p.on('pageerror',e=>errors.push(e.stack));await p.goto(base+'/preview.html');await p.waitForFunction(()=>window.qaReady);await p.evaluate(()=>document.fonts.ready);
 await api('reset',{mode:'pinball',phase:'choice',humans:1});await api('pause',{value:true});await p.waitForTimeout(400);await p.screenshot({path:out+'pinball-equipment-final.png'});
 let savedPlay=false,savedJackpot=false,savedChoice=false,seen=0;
 for(let i=0;i<720;i++){
  let g=await api('state');if(g.phase==='result')break;
  if(!g.players[0].picked){
   if(g.round>=4&&!savedChoice){await p.waitForTimeout(80);await p.screenshot({path:out+'pinball-equipment-moving.png'});savedChoice=true}
   await p.locator('[data-rc-pick]').first().click();await api('advance',{ms:20});await p.waitForFunction(()=>c.state.ricochet.players[0].picked);
   await p.locator('[data-rc-canvas]').focus();for(let k=0;k<6;k++)await p.keyboard.press('ArrowUp');await p.keyboard.press(g.round%2?'ArrowLeft':'ArrowRight');await p.keyboard.press('Enter');
  }
  await api('advance',{ms:200});g=await api('state');await p.waitForTimeout(18);
  if(!savedPlay&&g.round>=3&&g.players[0].y>6&&g.players[0].y<13&&!g.players.some(q=>!q.picked)){await p.screenshot({path:out+'pinball-action-final.png'});savedPlay=true}
  const hit=g.events.find(e=>e.id>seen&&e.type==='jackpot');seen=g.eventId;
  if(!savedJackpot&&hit&&g.round>=3){await p.screenshot({path:out+'pinball-jackpot-final.png'});savedJackpot=true}
 }
 const g=await api('state');await p.waitForFunction(()=>c.state.ricochet.phase==='result');await p.screenshot({path:out+'pinball-result-real.png',fullPage:true});
 await writeFile(out+'capture-report.json',JSON.stringify({source:'Real local authoritative simulation and actual client input, 1 human + 3 AI; no positions, scores, gems or effects injected.',rounds:g.history.length,results:g.results,errors,serverErrors:stderr,savedPlay,savedJackpot,savedChoice},null,2)+'\n');console.log(JSON.stringify({savedPlay,savedJackpot,savedChoice,errors,serverErrors:stderr}));
}finally{await browser.close();server.kill()}
