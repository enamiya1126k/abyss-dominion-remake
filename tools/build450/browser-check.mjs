import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{spawn}from'node:child_process';
const{chromium}=await import('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const server=spawn(process.execPath,['tools/build450/preview-server.mjs'],{stdio:['ignore','pipe','inherit']});let browser;const errors=[],rows=[];
try{
 await new Promise((r,j)=>{const timer=setTimeout(()=>j(Error('server timeout')),30000);server.stdout.on('data',b=>{if(String(b).includes('Preview http')){clearTimeout(timer);r()}});server.on('exit',c=>j(Error('server exit '+c)))});
 const executable=path.resolve('../browser445-133/chromium');fs.chmodSync(executable,0o755);browser=await chromium.launch({executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:{...process.env,LD_LIBRARY_PATH:path.dirname(executable)}});
 const page=await browser.newPage({viewport:{width:393,height:852},reducedMotion:'no-preference',deviceScaleFactor:3,isMobile:true,hasTouch:true});page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1'||/\.(png|webp|gif|jpe?g|mp3|ogg)$/.test(u.pathname))return r.abort();return r.continue()});await page.routeWebSocket('**/*',s=>s.close());await page.goto('http://127.0.0.1:8441');await page.waitForFunction(()=>window.ready445);

 const restore=async()=>{
  assert.equal(await page.locator('.practice-frame-shell450').count(),0);
  assert.equal(await page.evaluate(()=>JSON.stringify(originalState450)===JSON.stringify(qa435.currentState)),true);
  assert.equal(await page.evaluate(()=>JSON.stringify({...localStorage})===originalStorage450),true);
 };
 const start=async(kind)=>{
  await page.evaluate(async(kind)=>{
   const{createMonster,calculatedStats}=await import('/src/models/Monster.js');const{learnedSkills,maxMp}=await import('/src/battle/SkillSystem.js');const{normalizeDuel450}=await import('/src/practice/PracticeSnapshot450.js');
   const state=structuredClone(qa435.currentState);state.monsters=[createMonster('ember_gecko',{level:9}),createMonster('glacier_queen',{level:9})];state.party=state.monsters.map(m=>m.id);state.player.inRun=false;state.activeBattle=null;state.settings.autoBattle=false;state.settings.exploreAutoMode='off';state.settings.battleSpeed=4;
   const ids=kind==='loss'?['myth_rion','myth_yori']:kind==='hero'?['myth_rion','myth_yori','myth_enami','myth_hide']:['slime'];
   const opponent={displayName:'より',party:ids.map(id=>{const m=createMonster(id,{level:kind==='loss'?1000:9}),stats=calculatedStats(m);return{name:id,speciesId:id,level:m.level,rarity:'N',duel:normalizeDuel450({version:1,stats,maxMp:maxMp(m),skills:learnedSkills(m),element:'water'})}})};
   window.opponent450=opponent;
   window.originalState450=structuredClone(qa435.currentState);localStorage.setItem('practice-sentinel450','unchanged');window.originalStorage450=JSON.stringify({...localStorage});
   const{openPracticeFrame450}=await import('/src/practice/PracticeFrame450.js');window.frame450=await openPracticeFrame450({state,opponent});
  },kind);
  const frame=page.frames().find(f=>f!==page.mainFrame());await frame.waitForFunction(()=>window.__practiceReady450,{},{timeout:20000});
  assert.equal(await frame.locator('.battle-screen').count(),1);return frame;
 };
 for(const kind of ['win','loss','retreat','hero']){
  const frame=await start(kind);
  if(kind==='retreat')await frame.locator('#escapeBattle').click();
  else await frame.locator('#toggleBattleAuto').dispatchEvent('pointerdown');
  if(kind==='hero'){
   await frame.waitForTimeout(3000);assert.equal(await frame.locator('#practice-error450:not([hidden])').count(),0);
   await page.locator('.practice-frame-close450').click();
  }else{
   await frame.locator('.battle-contribution-modal').waitFor({timeout:45000});await frame.locator('.battle-contribution-modal [data-modal-primary]').click();
   assert.ok((await frame.locator('.practice-result450').textContent()).includes({win:'勝利',loss:'敗北',retreat:'撤退'}[kind]));await frame.locator('[data-modal-primary]').last().click();
  }
  await restore();rows.push({case:kind,passed:true});console.log('passed',kind);
 }
 await page.evaluate(()=>qa450.ranking(opponent450));
 for(const width of [320,393,709]){
  await page.setViewportSize({width,height:852});
  const layout=await page.locator('.practice-ranking-row450').evaluateAll(nodes=>nodes.map(n=>{const b=n.querySelector('.practice-challenge450'),p=n.querySelector('strong'),r=n.getBoundingClientRect(),q=b?.getBoundingClientRect(),v=p.getBoundingClientRect();return{inside:!q||q.left>=r.left&&q.right<=r.right&&q.top>=r.top&&q.bottom<=r.bottom,separate:!q||q.top>=v.bottom,width:r.width}}));
  assert.ok(layout.every(x=>x.inside&&x.separate),JSON.stringify({width,layout}));rows.push({viewport:width,layout:true});
 }
 assert.equal(await page.locator('.practice-ranking-row450').first().locator('.practice-challenge450').count(),0);
 assert.equal(await page.locator('.practice-challenge450:disabled').count(),1);
 // Exercise the actual ranking button + profile request + native child startup.
 await page.evaluate(()=>{window.originalState450=structuredClone(qa435.currentState);window.originalStorage450=JSON.stringify({...localStorage})});
 await page.locator('.practice-challenge450:enabled').first().click();
 await page.locator('.practice-frame-shell450').waitFor({timeout:8000}).catch(async e=>{throw Error(e.message+' toast='+await page.evaluate(()=>window.lastToast434)+' errors='+JSON.stringify(errors))});
 const fromRanking=page.frames().find(f=>f!==page.mainFrame());await fromRanking.waitForFunction(()=>window.__practiceReady450,{},{timeout:20000});
 await page.locator('.practice-frame-close450').click();await restore();
 assert.deepEqual(errors,[]);const result={checks:rows,rankingButtonLaunch:true,parentStateAndStorageUntouched:true,errors};
 fs.writeFileSync('docs/build450/browser-results.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));

}finally{await browser?.close();server.kill();}
