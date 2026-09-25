import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {BOT_COURSES556} from '../../src/cart/BotCourses556.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE),out=fileURLToPath(new URL('../../docs/build556/',import.meta.url));
const server=spawn(process.execPath,[fileURLToPath(new URL('./qa-server.mjs',import.meta.url))],{env:process.env,stdio:['ignore','pipe','pipe']});let stderr='';server.stderr.on('data',b=>stderr+=b);await new Promise((ok,no)=>{server.stdout.on('data',b=>{if(String(b).includes('ready'))ok()});server.on('exit',()=>no(Error(stderr)))});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});const base='http://127.0.0.1:8556',api=(n,d={})=>fetch(base+'/qa/'+n,{method:'POST',body:JSON.stringify(d)}).then(r=>r.json()),errors=[],events=[],screens=[],shots=[];
try{
 const p=await browser.newPage({viewport:{width:390,height:664},deviceScaleFactor:2,isMobile:true,hasTouch:true});p.on('pageerror',e=>errors.push(e.stack));await p.goto(base+'/preview.html');await p.waitForFunction(()=>window.qaReady);await p.evaluate(()=>document.fonts.ready);await api('reset',{phase:'countdown',humans:1,seed:172});await api('pause',{value:true});await p.waitForTimeout(100);await p.waitForFunction(()=>Object.values(c.cartUI543.renderer.scenes556).every(i=>i.complete&&i.naturalWidth)&&c.cartUI543.renderer.spring556.naturalWidth);
 let seen=0;
 for(let i=0;i<740;i++){
  let g=await api('state');if(g.phase==='result')break;
  const q=g.players[0];
  if(g.phase==='play'&&!q.launched&&q.fallenAt==null&&g.elapsed>=650){
   const plan=BOT_COURSES556[g.courseId556][q.lane][1],metrics=await p.evaluate(()=>{const r=c.cartUI543.renderer,q=c.state.cart.players[0],s=1-q.y/30*.56;return{width:r.width,height:r.height,xScale:r.width*.82/8.8*s,yScale:r.height*(.91-.22)/30,skewX:-q.x/8.8*r.width*.82*.56/30}}),distance=12+plan.power*(Math.max(72,Math.min(120,metrics.width*.28,metrics.height*.34))-12),vx=Math.sin(plan.angle),vy=Math.cos(plan.angle),dx=-(vx*metrics.xScale+vy*metrics.skewX),dy=vy*metrics.yScale,k=distance/Math.hypot(dx,dy),box=await p.locator('[data-ct-stage]').boundingBox(),x=box.x+box.width*.5,y=box.y+box.height*.5;
   await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+dx*k,y+dy*k,{steps:3});await p.waitForTimeout(80);if(g.round===1)await p.screenshot({path:out+'cart-aim-real.png'});await p.mouse.up();await p.waitForTimeout(30);await api('advance',{ms:50});g=await api('state');shots.push({round:g.round,course:g.courseId556,power:g.players[0].power,angle:g.players[0].aim545});
  }
  await api('advance',{ms:200});g=await api('state');await p.waitForTimeout(12);const fresh=g.events.filter(e=>e.id>seen);events.push(...fresh);seen=g.eventId;
  if(g.phase==='play'&&g.elapsed>=2800&&!screens.includes(g.courseId556)){await p.screenshot({path:out+'cart-'+g.courseId556+'-real.png'});screens.push(g.courseId556)}
 }
 const g=await api('state');await p.waitForFunction(()=>c.state.cart.phase==='result');await p.screenshot({path:out+'cart-result-real.png',fullPage:true});const report={source:'Production game modules, one automated human using actual mouse drags, three AI; server clock accelerated in 25 ms simulation steps. Normal seeded random draw. No course, score, position, velocity or outcome injection.',phase:g.phase,rounds:g.history,results:g.results,shots,screens,eventCounts:Object.fromEntries([...new Set(events.map(e=>e.type))].map(t=>[t,events.filter(e=>e.type===t).length])),errors,stderr};await writeFile(out+'capture-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(errors.length||stderr||shots.length!==5||g.history.length!==5)throw Error('capture failed');
}finally{await browser.close();server.kill()}
