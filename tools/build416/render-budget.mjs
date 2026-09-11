import fs from 'node:fs';
import {run} from './native-harness.mjs';
import {HomeScreen} from '../../src/ui/screens/HomeScreen.js';
import {FormationScreen} from '../../src/ui/screens/FormationScreen.js';
import {BattleScreen} from '../../src/ui/screens/BattleScreen.js';
import {HOME_SKINS400} from '../../src/core/HomeSkinSystem400.js';
import {cleanupSingles410} from '../../src/battle/SingleTraits410.js';
import {cleanupTrial415} from '../../src/battle/TrialAdaptation415.js';
import {buildTurnQueue} from '../../src/battle/TurnSystem.js';
const f=await run(['ch2_seria','ch2_carmia','ch2_lumea','ch2_fiora'],['ch2_nemesia','ch2_everia','ch2_ferne','ch2_clarisse'],{inspect:true,level:1500,circles:true}),s=f.context.save.state;
s.campaign100.finalCompleted=true;buildTurnQueue(f.b);f.b.auto=false;
const rows=[];
function sample(name,render,check){
 let html;for(let i=0;i<8;i++)html=render();check(html);
 const timings=[];for(let i=0;i<100;i++){const started=performance.now();html=render();timings.push(performance.now()-started);}
 timings.sort((a,b)=>a-b);rows.push({name,iterations:100,medianMs:timings[50],p95Ms:timings[95],maxMs:timings[99],htmlBytes:Buffer.byteLength(html)});
}
for(const skin of HOME_SKINS400.slice(1)){s.settings.homeSkin400={id:skin.id,motion:true};sample('home:'+skin.id,()=>HomeScreen(s),html=>{if((html.match(/data-home-party-slot="/g)??[]).length!==4)throw Error('home roster missing');});}
sample('formation',()=>FormationScreen(s),html=>{if(!html.includes('スキル編集'))throw Error('formation controls missing');});
for(const menu of ['command','skill','item']){f.b.skillMenu=menu==='skill';f.b.itemMenu=menu==='item';s.inventory.potions=3;sample('battle:'+menu,()=>BattleScreen(f.b,s.inventory,s.settings,100),html=>{if(!html.includes('battle-screen'))throw Error('battle missing');if(/(?:undefined|NaN)<\//.test(html))throw Error('invalid rendered value');});}
cleanupSingles410(f.b);cleanupTrial415(f.b);
const report={build:416,runtime:process.version,platform:process.platform,method:'Production HTML generation only. Node timing excludes browser layout, painting, GPU, image decoding and network; these values are not FPS or mobile frame times.',rows};
fs.writeFileSync('docs/build416/render-budget.json',JSON.stringify(report,null,2));console.log(rows);
