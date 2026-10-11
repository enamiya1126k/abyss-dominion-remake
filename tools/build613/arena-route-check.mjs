// Actual floor -> lower ledge -> upper ledge jumps, with no powers or allies.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {COURSES589} from '../../src/runners587/Courses589.js';
import {makeRunners587,startRunners587} from '../../src/runners587/Rules587.js';
import {surfaces587} from '../../src/runners587/Level587.js';
import {control587,stepRunner587} from '../../src/runners587/Physics587.js';
const witnesses=[],fail=[];
for(const c of COURSES589.filter(c=>c.boss600)){
 const g=makeRunners587({id:'route612',members:[{playerId:'a'},{playerId:'b'}]});g.courseId=c.id;startRunners587(g,0);
 const surfaces=surfaces587(0,c,g),floor=surfaces.find(s=>s.ground&&s.x===c.arena612.left),steps=surfaces.filter(s=>s.id.includes('-arena612-'));
 for(const [from,to]of [[floor,steps[0]],[steps[0],steps[1]],[floor,steps[2]],[steps[2],steps[3]]]){
  let witness=null;
  for(let x=Math.max(from.x+12,to.x-190);x<Math.min(from.x+from.w-12,to.x+to.w-12)&&!witness;x+=8)for(const hold of [800,500,300]){
   const p={...g.players[0],x,y:from.y,vx:235,vy:0,grounded:true,platformId:from.id,lastGroundAt:3000,controlAt:3000,jumpHeld:false,weapon:null};
   for(let tick=1;tick<=70;tick++){
    const t=tick*25,aim=to.x+to.w*.6,axis=p.x<aim-5?1:p.x>aim+10?-1:0;
    control587(p,{axis,jump:t<hold,attack:false},3000+t);stepRunner587(p,3000+t,t,.025,g);
    if(p.grounded&&p.platformId===to.id){witness={course:c.id,from:from.id,to:to.id,x,hold,ms:t,landing:{x:p.x,y:p.y}};break;}
    if(p.y>400||tick>1&&p.grounded&&p.platformId!==from.id)break;
   }
   if(witness)break;
  }
  if(witness)witnesses.push(witness);else fail.push(c.id+': '+from.id+' -> '+to.id);
 }
}
fs.mkdirSync('docs/build613',{recursive:true});fs.writeFileSync('docs/build613/arena-route-witnesses.json',JSON.stringify(witnesses,null,2)+'\n');
console.log('Arena jumps verified:',witnesses.length,'failures:',fail);assert.deepEqual(fail,[]);
