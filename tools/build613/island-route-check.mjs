import fs from 'node:fs';import assert from 'node:assert/strict';
import {makeRunners587,startRunners587} from '../../src/runners587/Rules587.js';
import {course589} from '../../src/runners587/Courses589.js';
import {surfaces587} from '../../src/runners587/Level587.js';
import {control587,stepRunner587} from '../../src/runners587/Physics587.js';
const g=makeRunners587({id:'routes',members:[{playerId:'p'}]});g.courseId='voyage';startRunners587(g,0);const c=course589(g),surfaces=surfaces587(30000,c,g),paths=[['ground1','voyage-seal-a','voyage-seal-b','voyage-seal-c','voyage-seal-exit','ark-works611'],['ground2','voyage-fort-a','voyage-fort-b','voyage-fort-c','ark-coast611']],report=[],fail=[];
for(const path of paths)for(let i=1;i<path.length;i++){
 const a=surfaces.find(s=>s.id===path[i-1]),b=surfaces.find(s=>s.id===path[i]);let found=null;
 for(let x=Math.max(a.x+12,b.x-210);x<Math.min(a.x+a.w-12,b.x+b.w-12)&&!found;x+=8)for(const hold of [800,500,300,0]){
  const p={...g.players[0],x,y:a.y,vx:235,vy:0,grounded:true,platformId:a.id,lastGroundAt:33000,controlAt:33000,jumpHeld:false,weapon:null};
  for(let k=1;k<=70;k++){const t=30000+k*25,target=b.x+b.w*.4,axis=p.x<target-5?1:p.x>target+10?-1:0;control587(p,{axis,jump:k*25<hold,attack:false},t+3000);stepRunner587(p,t+3000,t,.025,g);if(p.grounded&&p.platformId===b.id){found={from:a.id,to:b.id,x,hold,ms:k*25,landing:{x:p.x,y:p.y}};break;}if(p.y>420||k>1&&p.grounded&&p.platformId!==a.id)break;}
  if(found)break;
 }
 if(found)report.push(found);else fail.push(a.id+' -> '+b.id);
}
fs.mkdirSync('docs/build613',{recursive:true});fs.writeFileSync('docs/build613/island-route-witnesses.json',JSON.stringify(report,null,2));console.log('Island jumps',report.length,'failed',fail);assert.deepEqual(fail,[]);
const seals=report.filter(q=>q.from==='voyage-seal-a'||q.from==='voyage-seal-b');assert(seals.reduce((n,q)=>n+q.ms,0)+1500<8000);
