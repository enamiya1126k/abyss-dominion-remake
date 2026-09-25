import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE),out=fileURLToPath(new URL('../../docs/build554/',import.meta.url));
const server=spawn(process.execPath,[fileURLToPath(new URL('./qa-server.mjs',import.meta.url))],{env:process.env,stdio:['ignore','pipe','pipe']});let stderr='';server.stderr.on('data',s=>stderr+=s);await new Promise((ok,no)=>{server.stdout.on('data',s=>{if(String(s).includes('ready'))ok()});server.on('exit',()=>no(Error(stderr)))});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const base='http://127.0.0.1:8550',api=(name,data={})=>fetch(base+'/qa/'+name,{method:'POST',body:JSON.stringify(data)}).then(r=>r.json()),errors=[];
try{
 const p=await browser.newPage({viewport:{width:430,height:860},deviceScaleFactor:2,isMobile:true,hasTouch:true});p.on('pageerror',e=>errors.push(e.stack));await p.goto(base+'/preview.html');await p.waitForFunction(()=>window.qaReady);await p.evaluate(()=>document.fonts.ready);
 await api('reset',{mode:'junkgp',phase:'choice',humans:1});await api('pause',{value:true});await p.waitForTimeout(400);await p.screenshot({path:out+'gp-equipment-first.png'});
 let savedTurbo=false,savedGate=false,savedSix=false,savedChoice=false,savedMachine=false,seen=0;
 const shoot=async g=>{const self=g.players[0],gate=g.layout.gates.find(b=>b.y>self.y+2&&!self.passedGates554.includes(b.id)),xTarget=gate?(gate.left==='wild'?-gate.x:gate.x):0,angle=Math.max(-1.08,Math.min(1.08,Math.atan2(xTarget-self.x,gate?Math.max(5,gate.y-self.y):12))),box=await p.locator('[data-rc-stage]').boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
  await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x-Math.sin(angle)*105,y+Math.cos(angle)*105,{steps:3});await p.waitForTimeout(40);await p.mouse.up();await p.waitForTimeout(12);await api('advance',{ms:20});};
 for(let i=0;i<730;i++){
  let g=await api('state');if(g.phase==='result')break;const self=g.players[0];
  if(!self.picked){if(g.round>=6&&!savedChoice){await p.waitForTimeout(60);await p.screenshot({path:out+'gp-equipment-moving.png'});savedChoice=true}
   const priorities=['engine','rocket','cell','wheels','armor','turbo','coil','bank','spring','bumper','dice','hook'],pick=priorities.find(id=>self.offers.includes(id));await p.locator(`[data-rc-pick="${pick}"]`).click();await api('advance',{ms:20});await p.waitForFunction(()=>c.state.ricochet.players[0].picked);g=await api('state');await shoot(g);
  }else if(self.launched&&self.nitro554>=100&&g.simAt>=self.nitroUntil554){await shoot(g);g=await api('state');if(g.players[0].nitroUntil554>g.simAt&&g.round>=3&&!savedTurbo){await p.waitForTimeout(35);await p.screenshot({path:out+'gp-turbo-real.png'});savedTurbo=true;}}
  await api('advance',{ms:200});g=await api('state');await p.waitForTimeout(20);
  const mine=g.players[0],next=g.layout.gates.find(b=>b.y>mine.y&&!mine.passedGates554.includes(b.id));
  if(!savedGate&&g.round>=3&&next&&next.y-mine.y>2&&next.y-mine.y<8){await p.screenshot({path:out+'gp-gates-real.png'});savedGate=true;}
  if(!savedMachine&&g.round>=7&&mine.picked&&g.players.some(q=>q!==mine&&Math.abs(q.y-mine.y)<6)){await p.screenshot({path:out+'gp-machine-real.png'});savedMachine=true;}
  if(!savedSix&&g.events.some(e=>e.id>seen&&e.type==='gate'&&e.seat===0&&e.die===6)){await p.screenshot({path:out+'gp-six-real.png'});savedSix=true;}
  seen=g.eventId;
 }
 const g=await api('state');await p.waitForFunction(()=>c.state.ricochet.phase==='result');await p.screenshot({path:out+'gp-result-real.png',fullPage:true});
 const report={source:'Production modules in local QA, one automated human input + three AI; no score, position, upgrade, gate result or effect injection. Equipment is chosen from actual offers and steering uses actual drag gestures.',rounds:g.history.length,results:g.results,players:g.players.map(q=>({seat:q.seat,parts:q.parts,nitros:q.nitroShots554,gates:q.gateWins554,sixes:q.gateSixes554})),errors,serverErrors:stderr,savedTurbo,savedGate,savedSix,savedChoice,savedMachine};await writeFile(out+'capture-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await browser.close();server.kill()}
