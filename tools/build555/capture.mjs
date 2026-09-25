import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE),out=fileURLToPath(new URL('../../docs/build555/',import.meta.url));
const server=spawn(process.execPath,[fileURLToPath(new URL('./qa-server.mjs',import.meta.url))],{env:process.env,stdio:['ignore','pipe','pipe']});let stderr='';server.stderr.on('data',b=>stderr+=b);await new Promise((ok,no)=>{server.stdout.on('data',b=>{if(String(b).includes('ready'))ok()});server.on('exit',()=>no(Error(stderr)))});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});const base='http://127.0.0.1:8550',api=(n,d={})=>fetch(base+'/qa/'+n,{method:'POST',body:JSON.stringify(d)}).then(r=>r.json()),errors=[],events=[];
try{
 const p=await browser.newPage({viewport:{width:390,height:664},deviceScaleFactor:2,isMobile:true,hasTouch:true});p.on('pageerror',e=>errors.push(e.stack));await p.goto(base+'/preview.html');await p.waitForFunction(()=>window.qaReady);await p.evaluate(()=>document.fonts.ready);await api('reset',{phase:'choice',humans:1});await api('pause',{value:true});await p.waitForTimeout(250);await p.screenshot({path:out+'pinball-equipment-real.png'});
 let seen=0,saveRotor=false,saveFever=false,saveCrown=false,saveAim=false,shot=0;
 for(let i=0;i<480;i++){
  let g=await api('state');if(g.phase==='result')break;let q=g.players[0];
  if(q.offers.length){if(q.picked)await p.locator('[data-rc-action="offer"]').click();const id=['spring','crown','cell','mirror','echo','spark'].find(id=>q.offers.includes(id));await p.locator(`[data-rc-pick="${id}"]`).click();await p.waitForTimeout(12);await api('advance',{ms:80});await p.waitForTimeout(30);g=await api('state');q=g.players[0];}
  if(q.picked&&(g.simAt>=q.nextShotAt555||q.burstCharge553>=100&&g.simAt>=q.overdriveUntil553)){
   const gems=g.layout.bumpers.filter(b=>b.kind==='gem'&&!(q.gems552&(1<<b.gem))).sort((a,b)=>Math.hypot(a.x-q.x,a.y-q.y)-Math.hypot(b.x-q.x,b.y-q.y));let target=q.gems552===7?g.layout.bumpers.find(b=>b.kind==='crown'):gems[0];
   if(Math.abs(q.x)>5.8)target={x:Math.sign(q.x)*6.8,y:q.y<3.2?4:17};else if(shot%5===2)target={x:q.x<0?-2.5:2.5,y:9.25};
   const angle=Math.atan2(target.x-q.x,target.y-q.y),distance=q.gems552===7?59:shot%5===2?100:75,box=await p.locator('[data-rc-stage]').boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x-Math.sin(angle)*distance,y+Math.cos(angle)*distance,{steps:3});await p.waitForTimeout(40);if(!saveAim&&shot>3){await p.screenshot({path:out+'pinball-aim-real.png'});saveAim=true}await p.mouse.up();await p.waitForTimeout(12);await api('advance',{ms:80});shot++;
  }
  await api('advance',{ms:200});g=await api('state');await p.waitForTimeout(18);const fresh=g.events.filter(e=>e.id>seen);events.push(...fresh);seen=g.eventId;
  if(!saveRotor&&g.elapsed>8000&&Math.abs(g.carnival552.rotor555.omega)>2&&Math.abs(Math.sin(g.carnival552.rotor555.angle))>.45){await p.screenshot({path:out+'pinball-impact-real.png'});saveRotor=true}
  if(!saveFever&&g.carnival552.feverUntil-g.simAt>5000&&g.elapsed>15000){await p.screenshot({path:out+'pinball-fever-real.png'});saveFever=true}
  if(!saveCrown&&fresh.some(e=>e.type==='jackpot'&&e.seat===0)){await p.screenshot({path:out+'pinball-crown-real.png'});saveCrown=true}
 }
 const g=await api('state');await p.waitForFunction(()=>c.state.ricochet.phase==='result');await p.screenshot({path:out+'pinball-result-real.png',fullPage:true});const report={source:'Production game modules, one automated human using actual UI offers and mouse drags, three AI, accelerated server clock. No score, position, velocity, ability or outcome injection.',duration:g.duration555,phase:g.phase,results:g.results,players:g.players.map(q=>({seat:q.seat,parts:q.parts,shots:q.shots555,bursts:q.bursts553,lanes:q.lanes555,jackpots:q.jackpots552,rotorWins:q.spinWins555,breakdown:q.breakdown555})),eventCounts:Object.fromEntries([...new Set(events.map(e=>e.type))].map(t=>[t,events.filter(e=>e.type===t).length])),screens:{saveRotor,saveFever,saveCrown,saveAim},errors,stderr};await writeFile(out+'capture-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(errors.length||stderr)throw Error('capture errors');
}finally{await browser.close();server.kill()}
