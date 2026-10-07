const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright'),fs=require('fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:390,height:700},deviceScaleFactor:2,isMobile:true,hasTouch:true}),errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>{const p='upstream/'+new URL(r.request().url()).pathname.slice(1),contentType={html:'text/html',mjs:'text/javascript',js:'text/javascript',css:'text/css',webp:'image/webp',png:'image/png',svg:'image/svg+xml',json:'application/json',otf:'font/otf'}[p.split('.').pop()]||'application/octet-stream';if(!fs.existsSync(p)){missing.push(p);return r.fulfill({status:404,body:''});}return r.fulfill({body:fs.readFileSync(p),contentType});});
await page.goto('http://127.0.0.1:8091/tools/build597/preview.html?play=1&people=2&course=forest');await page.waitForFunction(()=>preview591.g.phase==='play');await page.waitForTimeout(200);

const scenes=[];
for(const kind of ['crushers','wide','crumble']){
 await page.evaluate(kind=>{const v=preview591,c=v.course(),obj=kind==='crushers'?c.crushers[0]:kind==='wide'?c.hazards.find(h=>h.wide):c.platforms.find(p=>p.crumble);v.setPosition(obj.x-50);Object.assign(v.g.players[0],{weapon:'thunder',invincibleUntil:0,axis:0,vx:0,vy:0});if(kind==='crumble')v.g.crumbles[obj.id]=v.g.elapsed-350;},kind);
 await page.waitForTimeout(250);await page.screenshot({path:'work597/'+kind+'.png'});scenes.push(kind);
}
await page.evaluate(()=>{const v=preview591;v.setPosition(v.course().crushers[0].pitX+40,350);Object.assign(v.g.players[0],{grounded:true,axis:0,vx:0,vy:0});});
await page.waitForTimeout(6200);const refuge=await page.evaluate(()=>({y:preview591.g.players[0].y,deaths:preview591.g.players[0].deaths}));
await page.screenshot({path:'work597/refuge.png'});
const result={scenes,refuge,errors,missing};fs.writeFileSync('work597/preview-results.json',JSON.stringify(result,null,2));console.log(result);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.equal(refuge.y,350);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
