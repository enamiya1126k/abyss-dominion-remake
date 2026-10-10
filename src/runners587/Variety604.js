const modes={forest:'duet',sky:'rings',relay:'duet',clock:'sprint',coast:'sprint',frost:'ice',crystal:'targets',ember:'combat',stormforge:'targets',abyssice:'ice',eclipse:'combat'};
const guard=(c,id,x,y,axe=false)=>{const e={id:c.id+'-604-'+id,x,y,min:x-14,max:x+14,speed:24,axe604:axe};c.enemies.push(e);return e;};
export function variety604(source){
 const c=structuredClone(source),mode=modes[c.id];
 for(const trial of c.trials601){
  trial.kind604=mode;const a=trial.pads[0],b=trial.pads[1],r=trial.reward;
  trial.label604={duet:'2人で封印を解除',rings:'光の輪を順番に通る',sprint:'足場を起動・6秒で星へ',ice:'氷の敵を蹴って台座へ',targets:'3つの的を攻撃',combat:'3体の番兵を倒す'}[mode];
  if(mode==='targets')trial.targets604=[{id:trial.id+'-a',x:a.x-26,y:a.y-25},{id:trial.id+'-b',x:a.x+35,y:a.y-65},{id:trial.id+'-c',x:b.x,y:b.y-25}];
  if(mode==='combat'){
   const safeB=c.boss600&&Math.abs(b.x-c.boss600.x)<140?{x:a.x+95,y:a.y}:b;
   trial.guards604=[guard(c,'guard-a',a.x-20,a.y,true).id,guard(c,'guard-b',safeB.x+12,safeB.y,true).id,guard(c,'guard-c',a.x+25,a.y).id];
  }
  if(mode==='ice'){
   const e=guard(c,'frozen-key',a.x-85,a.y);e.prefrozen600=true;trial.iceId604=e.id;
   c.platforms.push({id:trial.id+'-ice-runway604',x:a.x-115,y:a.y,w:155,h:18});
  }
  if(mode==='rings'){
   trial.rings604=[{x:a.x,y:a.y-34},{x:(a.x+r.x)/2,y:(a.y+r.y)/2},{x:r.x,y:r.y}];
   // Each step is less than one ordinary jump, without requiring a wind form.
   const rise=a.y-(r.y+29),n=Math.max(1,Math.ceil(Math.abs(rise)/72));
   for(let i=1;i<n;i++)c.platforms.push({id:trial.id+'-step604-'+i,x:a.x+(r.x-a.x)*i/n-30,y:a.y-rise*i/n,w:60,h:18});
  }
  if(mode==='sprint')trial.limit604=6000;
 }
 // Keep terrain and old routes intact. Add modest patrol groups on open ground,
 // leaving flags, trap mouths, walls and the boss arena free of spawn collisions.
 const extras=[];
 for(let i=0;i<c.sections.length-1;i++){
  if(!c.expert603&&i%2===0)continue;
  const from=c.sections[i].x,to=c.sections[i+1].x;
  for(const [a,b,y=300] of c.grounds){
   const left=Math.max(a+75,from+240),right=Math.min(b-75,to-100);if(y!==300||right-left<120)continue;
   const x=(left+right)/2;
   if(c.checkpoints.some(p=>Math.abs(p.x-x)<135)||c.walls.some(w=>x>w.x-65&&x<w.x+w.w+65)||c.hazards.some(h=>x>h.x-65&&x<h.x+h.w+65)||c.crushers.some(h=>x>h.x-80&&x<h.x+h.w+80)||c.boss600&&x>c.boss600.left-160)continue;
   const e=guard(c,'patrol-'+i,x,y,i%2===1);e.min=x-42;e.max=x+42;e.speed=38;extras.push(e.id);break;
  }
 }
 c.addedEnemies604=extras;
 c.stars601.sort((a,b)=>a.x-b.x);c.stars601.forEach((s,i)=>s.slot604=i);
 c.description=c.description.replace(/２人[^。]*スター[^。]*。/g,'').replace(/３つの星と旗[^。]*。/g,'');
 c.description+=' 星はコース順に３個。探索・足場・'+({duet:'協力',rings:'光の輪',sprint:'時間制限',ice:'氷の運搬',targets:'射的',combat:'番兵との戦闘'}[mode])+'で集めよう。';
 return c;
}
