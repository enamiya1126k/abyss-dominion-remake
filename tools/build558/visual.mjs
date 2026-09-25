import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {COURSES556} from '../../src/cart/Courses556.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE),out=fileURLToPath(new URL('../../docs/build558/',import.meta.url));
const server=spawn(process.execPath,[fileURLToPath(new URL('./qa-server.mjs',import.meta.url))],{env:process.env,stdio:['ignore','pipe','pipe']});let stderr='';server.stderr.on('data',b=>stderr+=b);await new Promise((ok,no)=>{server.stdout.on('data',b=>{if(String(b).includes('ready'))ok()});server.on('exit',()=>no(Error(stderr)))});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});const base='http://127.0.0.1:8558',api=(n,d={})=>fetch(base+'/qa/'+n,{method:'POST',body:JSON.stringify(d)}).then(r=>r.json()),errors=[],missing=[],checks=[];
try{const p=await browser.newPage({viewport:{width:390,height:664},deviceScaleFactor:2,isMobile:true,hasTouch:true});p.on('pageerror',e=>{errors.push(e.stack);console.error(e.message)});p.on('response',r=>{if(r.status()>=400&&/cart|556/.test(r.url()))missing.push(r.url())});await p.goto(base+'/preview.html');await p.waitForFunction(()=>window.qaReady);await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>Object.values(c.cartUI543.renderer.scenes556).every(i=>i.complete&&i.naturalWidth)&&c.cartUI543.renderer.rug557.naturalWidth);
 for(const viewport of [{width:390,height:664},{width:320,height:690},{width:430,height:932},{width:844,height:390}]){
  await p.setViewportSize(viewport);
  for(const course of COURSES556.filter(q=>['icefork','market'].includes(q.id))){const {id}=await api('reset',{courseId:course.id});await api('pause',{value:true});await p.waitForFunction(id=>c.state.cart?.id===id,id);await p.waitForTimeout(120);
   const text=await p.locator('[data-ct-danger]').textContent();if(text!==course.name)throw Error('wrong course name');
   const geometry=await p.evaluate(()=>({floor:c.cartUI543.renderer.floor558,overflow:document.documentElement.scrollWidth>innerWidth,finite:c.cartUI543.renderer.points.every(q=>Number.isFinite(q.x)&&Number.isFinite(q.y)&&q.scale>0),width:c.cartUI543.renderer.width,height:c.cartUI543.renderer.height}));
   if(geometry.floor!==(course.id==='icefork'?'frost-harbor':null)||geometry.overflow||!geometry.finite)throw Error(JSON.stringify(geometry));
   if(course.id==='icefork')await p.screenshot({path:out+(viewport.width===390?'course-icefork':`icefork-${viewport.width}x${viewport.height}`)+'.png'});
   checks.push({id:course.id,name:text,scene:course.scene,viewport,geometry});
  }
 }
 if(errors.length||missing.length||stderr)throw Error(JSON.stringify({errors,missing,stderr}));await writeFile(out+'visual-report.json',JSON.stringify({checks,errors,missing,stderr},null,2));console.log(JSON.stringify({checks,errors,missing,stderr}));}finally{await browser.close();server.kill()}
