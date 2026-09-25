// Offline tuning only. The live server uses the generated small lookup table.
import {writeFile} from 'node:fs/promises';
import {COURSES556} from '../../src/cart/Courses556.js';
import * as R from '../../src/cart/Rules543.js';
const report=[],plans={};
for(const course of COURSES556){plans[course.id]=[];for(let lane=0;lane<4;lane++){
 const p={seat:lane,x:(lane-1.5)*1.8,y:1.1,vx:0,vy:0,falls:0,bumps:0,spin545:0,bodyAngle545:0,zoneHits556:[],bumperHits556:0};const candidates=[];
 const sample=(power,angle)=>{const f=R.forecast544({courseId556:course.id,round:1},p,power,angle);if(!f.fallen){const score=Math.round(Math.max(0,(f.y-10)/(R.CART543.edge-R.CART543.radius-10)*100));candidates.push({power:+power.toFixed(4),angle:+angle.toFixed(4),score,y:+f.y.toFixed(2)})}};
 for(const angle of [-1.05,-.9,-.75,-.65,-.55,-.44,-.38,-.28,-.22,-.12,0,.12,.22,.28,.38,.44,.55,.65,.75,.9,1.05])for(let i=0;i<23;i++)sample(.28+i*.03,angle);
 const seeds=[...candidates].sort((a,b)=>b.score-a.score).slice(0,3);for(const best of seeds)for(let dp=-5;dp<=5;dp++)for(let da=-2;da<=2;da++)sample(best.power+dp*.003,best.angle+da*.012);
 const selected=[];for(const target of [64,79,93]){const best=candidates.filter(c=>!selected.some(s=>s.power===c.power&&s.angle===c.angle)).sort((a,b)=>Math.abs(a.score-target)-Math.abs(b.score-target)||Math.abs(a.angle)-Math.abs(b.angle))[0];if(best)selected.push(best)}
 if(selected.length!==3||selected.some(x=>x.score<35))throw Error('Unplayable lane '+course.id+' '+lane+' '+JSON.stringify(selected));plans[course.id].push(selected.map(({power,angle})=>({power,angle})));report.push({course:course.id,lane,selected});
 }console.log(course.id+' calibrated');}
await writeFile(new URL('../../src/cart/BotCourses556.js',import.meta.url),'// Calibrated against the actual solo solver; live collisions still alter every shot.\nexport const BOT_COURSES556='+JSON.stringify(plans)+';\n');await writeFile(new URL('../../docs/build556/course-balance.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
