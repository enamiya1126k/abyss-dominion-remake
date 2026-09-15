import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{spawn}from'node:child_process';
const{chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const server=spawn(process.execPath,['tools/build445/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],rows=[];
try{
 await new Promise((r,j)=>{const timer=setTimeout(()=>j(Error('server timeout')),30000);server.stdout.on('data',b=>{if(String(b).includes('Preview http')){clearTimeout(timer);r()}});server.on('exit',c=>j(Error('server exit '+c)))});
 const executable=path.resolve('../browser445-133/chromium');fs.chmodSync(executable,0o755);browser=await chromium.launch({executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:{...process.env,LD_LIBRARY_PATH:path.dirname(executable)}});
 const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:'no-preference',deviceScaleFactor:3,isMobile:true,hasTouch:true});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1'||/\.(png|webp|gif|jpe?g|mp3|ogg)$/.test(u.pathname))return r.abort();return r.continue()});await page.routeWebSocket('**/*',s=>s.close());await page.goto('http://127.0.0.1:8441');await page.waitForFunction(()=>window.ready445);

 const expected=await page.evaluate(async()=>{
  const{createMonster}=await import('/src/models/Monster.js');const{monsterCombatPower,formatCombatPower,recordPartyCombatPower}=await import('/src/core/CombatPower.js');
  qa440.reset();const s=qa435.currentState;s.monsters=['myth_rion','myth_yori','myth_enami','myth_hide'].map(speciesId=>createMonster(speciesId,{level:1000,allowEndgameLevel:true}));s.party=s.monsters.map(m=>m.id);
  s.records.combatPower={scaleVersion:7,highest:510224,previous:420812,history:[{power:510224,previous:420812,delta:89412,floor:100,at:'2026-09-15T00:00:00Z'}],legacyRecord447:{scaleVersion:6,highest:500000,history:[]},legacyRecord446:{scaleVersion:5,highest:500000,history:[]},legacyRecord445:{scaleVersion:4,highest:23652,history:[]}};
  recordPartyCombatPower(s);const powers=s.monsters.map(m=>monsterCombatPower(m));const{HomeScreen}=await import('/src/ui/screens/HomeScreen.js');document.querySelector('#app').innerHTML=HomeScreen(s,{serverStatus:{state:'online'}});
  const{installPowerTextFit446}=await import('/src/ui/PowerTextFit446.js');installPowerTextFit446(document.querySelector('#app'));
  return{labels:powers.map(n=>n.toLocaleString('en-US')),total:formatCombatPower(powers.reduce((a,b)=>a+b,0))};
 });
 for(const width of [320,393]){
  await page.setViewportSize({width,height:852});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const labels=await page.locator('.home-scene-power-value').allTextContents();assert.deepEqual(labels,expected.labels);
  assert.ok(await page.locator('.home-scene-power-value').evaluateAll(es=>es.every(e=>{const r=document.createRange();r.selectNodeContents(e);return r.getBoundingClientRect().width<=e.getBoundingClientRect().width+.1})));
 }
 await page.evaluate(async()=>{const{FormationScreen}=await import('/src/ui/screens/FormationScreen.js');document.querySelector('#app').innerHTML=FormationScreen(qa435.currentState)});
 assert.ok((await page.locator('#app').textContent()).includes(expected.total));
 await page.evaluate(()=>qa438.power());assert.ok((await page.locator('#app').textContent()).includes(expected.total));assert.equal(await page.locator('.power-legacy-record445').count(),4);
 assert.deepEqual(errors,[]);const result={passed:true,heroLabels:expected.labels,total:expected.total,homeViewports:[320,393],formationTotalMatches:true,recordTotalMatches:true,legacyArchives:4,errors};fs.writeFileSync('docs/build448/browser-results.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await browser?.close();server.kill();}
