import {water604,health604,image604} from './Art604.js';
import {bossOpen604} from './Encounters600.js';
import {image602,centered602,link602,strip602} from './Art602.js';
import {rune597} from './Elements597.js';
import {BOSS_ATLAS603} from './BossAtlas603.js';
import {firebar600,tide600,roller600,bossPosition600} from './Encounters600.js';
const portraits=new Map();
export function bossAsset600(species,frame='idle1'){
 return new URL('../../assets/runners603/boss-'+species+'.webp',import.meta.url).href;
}
export function preload600(course,nearX=Infinity){
 const b=course.boss600;if(!b||nearX+1800<b.left||portraits.has(b.speciesId+':idle1'))return;
 const frames=BOSS_ATLAS603[b.speciesId];if(!frames)return;
 const image=new Image(),records=Object.entries(frames).map(([frame,box])=>{const a={image,box,ready:false};portraits.set(b.speciesId+':'+frame,a);return a;});image.decoding='async';
 image.src=bossAsset600(b.speciesId);image.decode().then(()=>records.forEach(a=>a.ready=true)).catch(()=>{});
}
export function scenery600(c,g,course,left,right,elapsed,reduced=false){
 const visible=(x,w=60)=>x+w>left&&x-w<right;c.save();
 for(const h of course.firebars600){if(!visible(h.x,h.length))continue;const points=firebar600(h,elapsed),tip=points.at(-1);
  link602(c,'chain',h.x,h.y,tip.x,tip.y,5);
  for(const p of points){rune597(c,'fire',p.x,p.y,29);if(!reduced)centered602(c,'spark',p.x,p.y,15,15,elapsed/700);}
  centered602(c,'ui-button',h.x,h.y,30,26);c.strokeStyle='#b7f2cc';c.lineWidth=2;c.beginPath();c.moveTo(h.x-12,h.y-12);c.lineTo(h.x+12,h.y-12);c.stroke();
 }
 for(const h of course.tides600)if(visible(h.x,h.w))water604(c,h,elapsed,reduced);
 for(const h of course.swarms600){if(!visible(h.max)||g.waves600?.[h.id]?.count>=h.count)continue;const t=(elapsed%800)/800;c.save();c.globalAlpha=(1-t)*.5;centered602(c,'wind-streak',h.max,h.y-4,30+t*30,8);c.restore();}
 const b=g.boss600?{...g.boss600,x:bossPosition600(g.boss600,elapsed)}:null;
 if(b&&visible(b.x,100)){
  const down=b.hp<=0,age=elapsed-b.phaseAt,frame=down?'down':elapsed<b.hitUntil?'damage':b.phase==='dash'?('walk'+(1+Math.floor(elapsed/120)%2)):['cast','counter','warn'].includes(b.phase)?'attack':('idle'+[1,2,3,2][Math.floor(elapsed/260)%4]);
  const asset=portraits.get(b.speciesId+':'+frame)??portraits.get(b.speciesId+':idle1');
  if(!down||age<650){c.save();c.translate(b.x,b.y);if(down)c.globalAlpha=Math.max(0,1-age/650);
   if(['wave','fire'].includes(b.pattern)&&['warn','dash'].includes(b.phase)){c.save();c.globalAlpha=.7;centered602(c,'ice-shell',b.dir*29,-32,17,53);c.restore();centered602(c,'spark',-b.dir*24,-35,14);}
   if(b.phase==='stunned')for(let i=0;i<3;i++){const a=elapsed/250+i*2.1;centered602(c,'star',Math.cos(a)*21,-76+Math.sin(a)*5,9);}
   if(b.phase==='warn'){const p=Math.min(1,age/(b.elite603?.warn??900));c.save();c.globalAlpha=.5+p*.5;centered602(c,'arrow',b.dir*(53+p*20),-12,24,33,b.dir*Math.PI/2);c.restore();}
   if(asset?.ready){const [sx,sy,sw,sh]=asset.box,h=down?48:70,w=Math.min(100,sw/sh*h);c.save();c.scale(-b.dir,1);c.drawImage(asset.image,sx,sy,sw,sh,-w/2,-h,w,h);c.restore();}
   if(!down){if(!bossOpen604(b,elapsed)){image604(c,'axe',0,-70,34,26,Math.PI/4);c.save();c.strokeStyle='#ffc267';c.lineWidth=2;c.beginPath();c.arc(0,-59,25,Math.PI*1.05,Math.PI*1.95);c.stroke();c.restore();}health604(c,b);}
   c.restore();
  }
 }
 for(const s of g.enemyShots600??[]){if(!visible(s.x))continue;if(s.kind==='wave')centered602(c,'wind-streak',s.x,s.y,37,29,-Math.PI/2);else rune597(c,'fire',s.x,s.y,s.r*2.9);}
 c.restore();
}
