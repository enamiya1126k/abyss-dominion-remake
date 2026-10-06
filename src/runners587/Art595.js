import {platform593,pickup593,enemy593,barrier594} from './World593.js';
const assets=new Map();
export const artURL595=id=>new URL('../../assets/runners595/'+id+'.webp',import.meta.url).href;
const terrain=theme=>['forest','sky','relay'].includes(theme)?'grass':['frost','crystal'].includes(theme)?'ice':theme==='ember'?'lava':'ruin';
function load(id){
 if(assets.has(id))return assets.get(id);
 const image=new Image(),a={image,ready:false};assets.set(id,a);image.decoding='async';image.src=artURL595(id);
 a.promise=image.decode().then(()=>{a.ready=true;}).catch(()=>{});return a;
}
export function preload595(course,r){
 for(const id of [terrain(course.theme),'beetle','bat','fire','wind','gate','spikes','crate'])load(id);
 if(!r)return;const a=load(terrain(course.theme));
 a.promise.then(()=>{if(!a.ready)return;for(const s of [...course.grounds.map(([x,end])=>({x,w:end-x,ground:true})),...course.platforms,...course.walls.filter(w=>!w.breakable).map(w=>({...w,wall:true}))])terrainTile595(r,s,terrain(course.theme),a);});
}
// Assemble each ledge once. Runtime rendering is a single cached image blit.
export function platform595(r,s,course){
 const id=terrain(course.theme),a=load(id);if(!a.ready)return platform593(r,s,course);
 const tile=terrainTile595(r,s,id,a);r.ctx.drawImage(tile,s.x,s.y-2);
 if(s.move){const c=r.ctx;c.fillStyle='#d7fff7';c.fillRect(s.x+s.w/2-7,s.y+6,14,2);}
}
function terrainTile595(r,s,id,a){
 const h=s.wall?s.h:s.ground?174:Math.max(30,(s.h??18)+14),w=Math.ceil(s.w),key=id+':'+w+':'+h;
 const cache=r.terrain595??=new Map();let tile=cache.get(key);
 if(!tile){
  tile=document.createElement('canvas');tile.width=w;tile.height=h+3;const d=tile.getContext('2d'),im=a.image,ih=im.naturalHeight,iw=im.naturalWidth;
  const cap=Math.min(w/3,90*h/ih),sourceCap=cap*ih/h,body=iw-sourceCap*2;
  d.drawImage(im,0,0,sourceCap,ih,0,0,cap,h);
  for(let x=cap;x<w-cap;){const width=Math.min(w-cap-x,body*h/ih);d.drawImage(im,sourceCap,0,width*ih/h,ih,x,0,width+.5,h);x+=width;}
  d.drawImage(im,iw-sourceCap,0,sourceCap,ih,w-cap,0,cap,h);
  if(s.ground){const shade=d.createLinearGradient(0,h*.55,0,h);shade.addColorStop(0,'#0c152500');shade.addColorStop(1,'#0c152572');d.globalCompositeOperation='source-atop';d.fillStyle=shade;d.fillRect(0,0,w,h);}
  if(cache.size>=48)cache.delete(cache.keys().next().value);cache.set(key,tile);
 }
 return tile;
}
export function enemy595(c,p,at){
 const a=load(p.flying?'bat':'beetle');if(!a.ready)return enemy593(c,p,at);
 const w=p.flying?49:43,h=p.flying?39:30;
 c.save();c.translate(p.x,p.y);c.scale(p.dir,p.flying?.94+Math.sin(at/100)*.06:1);
 c.drawImage(a.image,-w/2,-h,w,h);c.restore();
}
export function pickup595(c,item,at){
 const a=load(item.kind);if(!a.ready)return pickup593(c,item,at);
 const bob=Math.sin(at/320+item.x)*3;c.drawImage(a.image,item.x-19,item.y-19+bob,38,38);
}
export function gate595(c,course,open){
 const a=load('gate');if(!a.ready)return false;
 c.drawImage(a.image,course.goal-62,300-168,124,174);
 c.textAlign='center';c.font='bold 12px "Noto Sans JP",sans-serif';c.fillStyle='#fff1bc';c.fillText(open?'GOAL':'橋をすべて開こう',course.goal,120);return true;
}
export function spikes595(c,h){
 const a=load('spikes');if(a.ready)c.drawImage(a.image,h.x-2,h.y-h.h-2,h.w+4,h.h+5);
 else{c.fillStyle='#a6b9c9';c.beginPath();for(let x=h.x;x<h.x+h.w;x+=12){c.moveTo(x,h.y);c.lineTo(x+6,h.y-h.h);c.lineTo(x+12,h.y);}c.fill();}
}

export function barrier595(c,wall,hits=0){
 const a=load('crate');if(!a.ready)return barrier594(c,wall,hits);
 const count=Math.ceil(wall.h/wall.w),h=wall.h/count;
 for(let i=0;i<count;i++)c.drawImage(a.image,wall.x,wall.y+i*h,wall.w,h);
 if(hits){c.strokeStyle='#301c27';c.lineWidth=2;c.beginPath();c.moveTo(wall.x+23,wall.y);c.lineTo(wall.x+13,wall.y+wall.h*.3);c.lineTo(wall.x+28,wall.y+wall.h*.6);c.lineTo(wall.x+15,wall.y+wall.h);c.stroke();}
 c.font='bold 10px "Noto Sans JP",sans-serif';c.textAlign='center';c.fillStyle='#fff2c1';c.fillText(hits?'あと１発':'火でこわせる',wall.x+wall.w/2,wall.y-12);
}
