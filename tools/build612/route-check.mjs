// Traverse each authored route hop using the production physics, without forms,
// buddy boosts or ever landing on a ship. Keep witnesses for repeatable QA.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {makeRunners587,startRunners587} from '../../src/runners587/Rules587.js';
import {course589} from '../../src/runners587/Courses589.js';
import {surfaces587} from '../../src/runners587/Level587.js';
import {control587,stepRunner587} from '../../src/runners587/Physics587.js';
const c=course589('voyage');
const g=makeRunners587({id:'route',hostId:'p0',members:[{playerId:'p0'}]});g.courseId='voyage';startRunners587(g,0);
const id=s=>s.startsWith('ground')?s:'voyage-'+s;
const paths=[['ground0','reef-step','reef-crumble','reef-battery','reef-tide','ground1','reef-bridge-a','reef-bridge-b','reef-bridge-c','ground2','works-entry','ground3','ground4','works-lift','ground5','works-shuttle','works-exit','ground6','tower-entry','tower-coast','ground7','coast-phase','coast-crumble','coast-saw','ground8','coast-last','ground9'],['ground1','reef-key-step','reef-key','reef-star','reef-high-return','reef-high-exit','ground2'],['works-entry','works-upper-a','works-guards','works-star','works-upper-b','works-upper-c','ground5'],['ground7','tower-step-a','tower-step-b','tower-seal','tower-return-a','tower-return-b','ground8'],['coast-catch','coast-crumble']];
function hop(fromId,toId,t0){
 const from=surfaces587(t0,c,g).find(s=>s.id===id(fromId));let dest=surfaces587(t0,c,g).find(s=>s.id===id(toId));
 if(!from||!dest)return null;
 const fromStart=Math.max(from.x+10,from.x+from.w-170),starts=[];for(let x=fromStart;x<from.x+from.w-2;x+=8)starts.push(x);
 for(const takeoff of starts)for(const release of [800,300,150,0]){
  const p={...g.players[0],x:takeoff,y:from.y,vx:235,vy:0,grounded:true,platformId:from.id,lastGroundAt:t0+3000,controlAt:t0+3000};
  for(let k=1;k<=70;k++){
   const t=t0+k*25,target=surfaces587(t,c,g).find(s=>s.id===id(toId));if(target)dest=target;
   const aim=dest.x+Math.min(dest.w*.6,70),axis=p.x<aim-3?1:p.x>aim+10?-1:0;
   control587(p,{axis,jump:k*25<release,attack:false},t+3000);stepRunner587(p,t+3000,t,.025,g);
   if(p.grounded&&p.platformId===dest.id)return{from:fromId,to:toId,t0,takeoff,release,ms:k*25,x:p.x,y:p.y};
   if(p.platformId?.startsWith('ark')||p.y>650||p.grounded&&p.platformId!==from.id)break;
  }
 }
 return null;
}
const report=[],failures=[];
for(const path of paths)for(let i=0;i<path.length-1;i++){
 let found=null;for(const t of [0,1500,3500,5000,9000,14000]){found=hop(path[i],path[i+1],t);if(found)break;}
 if(found)report.push(found);else failures.push(path[i]+' -> '+path[i+1]);
}
fs.mkdirSync('docs/build612',{recursive:true});fs.writeFileSync('docs/build612/route-witnesses.json',JSON.stringify(report,null,2));
console.log('Playable hops without powers or boats:',report.length);console.log('Unreachable hops:',failures);
assert.deepEqual(failures,[]);
