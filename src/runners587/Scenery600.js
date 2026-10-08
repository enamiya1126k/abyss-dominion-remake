import {MONSTER_SPRITE_FOLDERS} from '../data/monsterCatalog.js';
import {firebar600,tide600,roller600,bossPosition600} from './Encounters600.js';
const portraits=new Map(),orbs=new Map();
export function bossAsset600(species,frame='idle1'){
 return new URL('../../assets/monsters/'+MONSTER_SPRITE_FOLDERS[species]+'/'+frame+'.png?v=3.0.3-build303',import.meta.url).href;
}
export function preload600(course){
 if(!course.boss600)return;
 for(const frame of ['idle1','idle2','idle3','walk1','walk2','attack','damage','down']){
  const key=course.boss600.speciesId+':'+frame;if(portraits.has(key))continue;
  const image=new Image(),asset={image,ready:false};portraits.set(key,asset);image.decoding='async';
  image.onload=()=>{
   const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const c=canvas.getContext('2d');c.drawImage(image,0,0);
   try{const data=c.getImageData(0,0,canvas.width,canvas.height).data;let left=canvas.width,right=0,top=canvas.height,bottom=0;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]>20){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
    asset.box=right>=left?[left,top,right-left+1,bottom-top+1]:[0,0,canvas.width,canvas.height];
   }catch{asset.box=[0,0,canvas.width,canvas.height];}
   asset.ready=true;
  };
  image.src=bossAsset600(course.boss600.speciesId,frame);
 }
}
function orb(kind){
 if(orbs.has(kind))return orbs.get(kind);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d'),ice=kind==='ice';
 const halo=c.createRadialGradient(32,32,3,32,32,32);halo.addColorStop(0,ice?'#efffff':'#fffbd0');halo.addColorStop(.32,ice?'#aeeaff':'#ffe480');halo.addColorStop(.52,ice?'#3f93ce':'#ff812be6');halo.addColorStop(1,ice?'#80eaff00':'#ff430000');c.fillStyle=halo;c.fillRect(0,0,64,64);
 if(ice){c.beginPath();for(let i=0;i<7;i++){const a=i/7*Math.PI*2,x=32+Math.cos(a)*23,y=32+Math.sin(a)*23;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fillStyle='#409eceb0';c.fill();c.strokeStyle='#d8faff';c.lineWidth=2;c.stroke();
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;c.beginPath();c.moveTo(26,26);c.lineTo(32+Math.cos(a)*23,32+Math.sin(a)*23);c.strokeStyle=i%2?'#d9ffff8c':'#154f8480';c.stroke();}
 }else{c.fillStyle='#fff7c5';c.beginPath();c.moveTo(30,10);c.bezierCurveTo(48,27,44,38,33,48);c.bezierCurveTo(16,45,19,29,30,10);c.fill();c.fillStyle='#fff';c.beginPath();c.ellipse(31,33,5,9,.3,0,Math.PI*2);c.fill();}
 orbs.set(kind,canvas);return canvas;
}
const disk=(c,x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
export function scenery600(c,g,course,left,right,elapsed,reduced=false){
 const visible=(x,w=60)=>x+w>left&&x-w<right;c.save();
 for(const h of course.firebars600){if(!visible(h.x,h.length))continue;const points=firebar600(h,elapsed),tip=points.at(-1);
  c.strokeStyle='#654329';c.lineWidth=5;c.beginPath();c.moveTo(h.x,h.y);c.lineTo(tip.x,tip.y);c.stroke();c.strokeStyle='#edb460';c.lineWidth=1;c.stroke();
  disk(c,h.x,h.y,12,'#343e44');c.strokeStyle='#dbbc7a';c.lineWidth=3;c.stroke();disk(c,h.x,h.y,4,'#fee7a0');
  for(const p of points){c.save();c.translate(p.x,p.y);c.rotate(reduced?0:elapsed/350+p.x*.07);c.drawImage(orb('fire'),-15,-15,30,30);c.restore();}
 }
 for(const h of course.tides600){if(!visible(h.x,h.w))continue;const top=tide600(h,elapsed).y;
  const fill=c.createLinearGradient(0,top,0,h.y+26);fill.addColorStop(0,'#a7faffd0');fill.addColorStop(.22,'#19bee1a8');fill.addColorStop(1,'#135ca052');c.fillStyle=fill;c.beginPath();c.moveTo(h.x,h.y+26);c.lineTo(h.x,top);
  for(let x=0;x<=h.w;x+=8)c.lineTo(h.x+x,top+Math.sin(x/22+elapsed/370)*2);c.lineTo(h.x+h.w,h.y+26);c.closePath();c.fill();c.strokeStyle='#d5ffff';c.lineWidth=2;c.beginPath();
  for(let x=0;x<=h.w;x+=8){const y=top+Math.sin(x/22+elapsed/370)*2;x?c.lineTo(h.x+x,y):c.moveTo(h.x,y);}c.stroke();
 }
 for(const h of course.rollers600){const p=roller600(h,elapsed);if(!visible(h.left,h.right-h.left))continue;
  if(p.warning){c.strokeStyle='#d2f8ff';c.lineWidth=2;c.setLineDash([3,5]);c.beginPath();c.arc(h.right,h.y-22,22+(700-elapsed%h.period)/35,0,Math.PI*2);c.stroke();c.setLineDash([]);}
  if(p.active&&g.rollerBroken600?.[h.id]!==p.cycle){c.save();c.translate(p.x,p.y);c.rotate(-(p.x-h.right)/22);c.drawImage(orb('ice'),-31,-31,62,62);c.restore();}
 }
 for(const room of course.secrets600){if(!visible(room.left,room.right-room.left))continue;
  c.strokeStyle='#91ded979';c.lineWidth=2;c.beginPath();c.arc((room.left+room.right)/2,room.floor-110,45,Math.PI,0);c.stroke();
  for(let i=0;i<7;i++){const x=room.left+22+i*(room.right-room.left-44)/6,y=room.floor+6;disk(c,x,y,2,'#b5f1eb');}
 }
 for(const h of course.swarms600){if(!visible(h.max)||g.waves600?.[h.id]?.count>=h.count)continue;const t=(elapsed%800)/800;c.strokeStyle='#e3c27a';c.lineWidth=2;c.globalAlpha=1-t;c.beginPath();c.ellipse(h.max,h.y-2,12+t*20,4+t*6,0,0,7);c.stroke();c.globalAlpha=1;}
 const b=g.boss600?{...g.boss600,x:bossPosition600(g.boss600,elapsed)}:null;
 if(b&&visible(b.x,100)){
  const down=b.hp<=0,age=elapsed-b.phaseAt,frame=down?'down':elapsed<b.hitUntil?'damage':b.phase==='dash'?('walk'+(1+Math.floor(elapsed/120)%2)):b.phase==='cast'?'attack':('idle'+[1,2,3,2][Math.floor(elapsed/260)%4]);
  const asset=portraits.get(b.speciesId+':'+frame)??portraits.get(b.speciesId+':idle1');
  if(!down||age<650){c.save();c.translate(b.x,b.y);if(down)c.globalAlpha=Math.max(0,1-age/650);
   c.fillStyle='#0c1a2280';c.beginPath();c.ellipse(0,0,37,5,0,0,7);c.fill();
   if(['wave','fire'].includes(b.pattern)&&['warn','dash'].includes(b.phase)){c.strokeStyle='#8de1e1';c.lineWidth=4;c.beginPath();c.ellipse(b.dir*29,-32,10,26,0,0,7);c.stroke();disk(c,-b.dir*24,-35,4,'#ffe799');}if(b.phase==='stunned'){for(let i=0;i<3;i++){const a=elapsed/250+i*2.1;disk(c,Math.cos(a)*21,-76+Math.sin(a)*5,3,'#fff2ae');}}
   if(b.phase==='warn'){const p=Math.min(1,age/900);c.strokeStyle='#ffbc76';c.lineWidth=3;c.beginPath();c.arc(0,-30,39,Math.PI*1.5,Math.PI*1.5+Math.PI*2*p);c.stroke();c.fillStyle='#ffdbaa55';c.beginPath();c.moveTo(b.dir*35,-6);c.lineTo(b.dir*(55+p*70),-6);c.lineTo(b.dir*(55+p*70),-17);c.lineTo(b.dir*(75+p*70),-3);c.lineTo(b.dir*(55+p*70),11);c.lineTo(b.dir*(55+p*70),1);c.lineTo(b.dir*35,1);c.fill();}
   if(asset?.ready){const [sx,sy,sw,sh]=asset.box,h=down?48:70,w=Math.min(100,sw/sh*h);c.save();c.scale(-b.dir,1);c.drawImage(asset.image,sx,sy,sw,sh,-w/2,-h,w,h);c.restore();}
   if(!down){c.fillStyle='#152935';c.fillRect(-40,-89,80,7);c.fillStyle=b.hp<=b.maxHp/2?'#ffac75':'#efce8d';c.fillRect(-39,-88,78*b.hp/b.maxHp,5);c.strokeStyle='#c7b77f';c.lineWidth=1;c.strokeRect(-41,-90,82,9);}
   c.restore();
  }
 }
 for(const s of g.enemyShots600??[]){if(!visible(s.x))continue;c.save();c.translate(s.x,s.y);if(s.kind==='wave'){c.strokeStyle='#f2d290';c.lineWidth=4;c.beginPath();c.arc(0,10,18,Math.PI,0);c.stroke();}else c.drawImage(orb('fire'),-s.r*1.7,-s.r*1.7,s.r*3.4,s.r*3.4);c.restore();}
 c.restore();
}
