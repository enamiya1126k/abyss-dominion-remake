import {rune597} from './Elements597.js';
import {centered602} from './Art602.js';
const assets=new Map();
export const artURL595=id=>new URL('../../assets/runners'+(['ice','steam'].includes(id)?596:595)+'/'+id+'.webp',import.meta.url).href;
const terrain=theme=>['forest','sky','relay'].includes(theme)?'grass':['frost','crystal'].includes(theme)?'ice':theme==='ember'?'lava':'ruin';
// Source-image contact planes, not the transparent bounding box. The rim keeps
// the same scale on a thick cliff, a thin ledge and a moving platform.
const surfaces596={grass:{edge:32,walk:36},ice:{edge:22,walk:12},ruin:{edge:28,walk:12},lava:{edge:24,walk:12}};
function load(id){
 if(assets.has(id))return assets.get(id);
 const image=new Image(),a={image,ready:false};assets.set(id,a);image.decoding='async';image.src=artURL595(id);
 a.promise=image.decode().then(()=>{a.ready=true;if(id==='steam'||id==='gate')prepareEffects596(a,id);}).catch(()=>{});return a;
}
function prepareEffects596(a,id){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const c=canvas.getContext('2d'),im=a.image;
 if(id==='steam'){
  c.drawImage(im,0,0,im.naturalWidth,im.naturalHeight*.72,0,0,96,96);
  const fade=c.createLinearGradient(0,0,0,96);fade.addColorStop(0,'#fff');fade.addColorStop(.6,'#fff');fade.addColorStop(1,'#fff0');c.globalCompositeOperation='destination-in';c.fillStyle=fade;c.fillRect(0,0,96,96);
 }else{
  c.drawImage(im,64,106,128,148,0,0,96,96);
  const fade=c.createRadialGradient(48,48,12,48,48,48);fade.addColorStop(0,'#fff');fade.addColorStop(.5,'#fff');fade.addColorStop(1,'#fff0');c.globalCompositeOperation='destination-in';c.fillStyle=fade;c.fillRect(0,0,96,96);
 }
 a.effect=canvas;
}
export function preload595(course,r){
 for(const id of [terrain(course.theme),'beetle','bat','fire','wind','gate','spikes','crate','steam'])load(id);
 if(!r)return;const a=load(terrain(course.theme));
 a.promise.then(()=>{if(!a.ready)return;for(const s of [...course.grounds.map(([x,end])=>({x,w:end-x,ground:true})),...course.platforms,...course.walls.filter(w=>!w.breakable).map(w=>({...w,wall:true}))])terrainTile595(r,s,terrain(course.theme),a);});
}
// Assemble each ledge once. Runtime rendering is a single cached image blit.
export function platform595(r,s,course){
 const id=terrain(course.theme),a=load(id);if(!a.ready)return;
 const tile=terrainTile595(r,s,id,a);r.ctx.drawImage(tile.canvas,s.x,s.y-tile.top);
}
function terrainTile595(r,s,id,a){
 const view=r.width>650?900:r.width<350?440:480;
 const depth=r.width&&r.height?Math.max(174,Math.ceil(r.height*.3/(r.width/view)/32)*32+16):174;
 const h=s.depth602??(s.wall?s.h:s.ground?depth:Math.max(30,(s.h??18)+14)),w=Math.ceil(s.w),key=id+':'+w+':'+h+':'+(s.wall?'wall':s.ground?'ground':'ledge');
 const cache=r.terrain595??=new Map();let tile=cache.get(key);
 if(!tile){
  const im=a.image,ih=im.naturalHeight,iw=im.naturalWidth,{edge,walk}=surfaces596[id];
  const rim=16,cut=walk+44,top=Math.ceil(walk*rim/44),lip=top+rim;
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=Math.ceil(h+top);const d=canvas.getContext('2d');
  // One continuous strip across the full surface: no chopped centre tiles or
  // mismatched end caps. Narrow walls use a detailed central stone slice.
  const sw=s.wall?Math.min(iw-edge*2,Math.max(160,w*3)):iw-edge*2,sx=(iw-sw)/2;
  d.drawImage(im,sx,0,sw,cut,0,0,w,lip);
  d.drawImage(im,sx,cut,sw,ih-cut,0,lip,w,h-rim);
  if(s.ground){const shade=d.createLinearGradient(0,top+h*.55,0,top+h);shade.addColorStop(0,'#0c152500');shade.addColorStop(1,'#0c152572');d.globalCompositeOperation='source-atop';d.fillStyle=shade;d.fillRect(0,top,w,h);}
  tile={canvas,top};
  if(cache.size>=48)cache.delete(cache.keys().next().value);cache.set(key,tile);
 }
 return tile;
}
export function enemy595(c,p,at){
 const a=load(p.flying?'bat':'beetle');if(!a.ready)return;
 const w=p.flying?49:43,h=p.flying?39:30;
 c.save();c.translate(p.x,p.y);c.scale(p.dir,p.flying?.94+Math.sin(at/100)*.06:1);
 c.drawImage(a.image,-w/2,-h,w,h);c.restore();
}
export function pickup595(c,item,at){rune597(c,item.kind,item.x,item.y+Math.sin(at/320+item.x)*3);}

export function gate595(c,course,open,at=0,arrivalAge=-1){
 const a=load('gate');if(!a.ready)return false;
 const x=course.goal,y=214;c.save();c.globalAlpha=open?1:.5;c.drawImage(a.image,x-62,126,124,174);c.restore();
 if(open&&a.effect){c.save();c.beginPath();c.ellipse(x,y,35,52,0,0,Math.PI*2);c.clip();c.translate(x,y);c.scale(1,1.48);c.rotate(at/2100);c.globalAlpha=.67;c.drawImage(a.effect,-47,-47,94,94);c.rotate(-at/3400);c.globalAlpha=.3;c.drawImage(a.effect,-33,-33,66,66);c.restore();}
 if(open&&at)for(let i=0;i<5;i++){const t=(at/1800+i/5)%1,a=t*Math.PI*2+i;c.save();c.globalAlpha=Math.sin(t*Math.PI)*.75;centered602(c,'spark',x+Math.cos(a)*(29-t*15),267-t*98,7);c.restore();}
 if(open&&arrivalAge>=0&&arrivalAge<1000){const p=arrivalAge/1000;c.save();c.globalAlpha=Math.sin(Math.PI*p)*.85;centered602(c,'spark',x,y+17,60+p*100);c.restore();}
 return true;
}
export function spikes595(c,h){const a=load('spikes');if(a.ready)c.drawImage(a.image,h.x-2,h.y-h.h-2,h.w+4,h.h+5);}
export function steam596(c,h,state,at){
 const a=load('steam');if(!a.ready)return false;
 const im=a.image,iw=im.naturalWidth,ih=im.naturalHeight,base=Math.round(ih*.85),tail=state.phase-h.on;
 // A cached painted puff rises, expands and fades; no canvas allocation,
 // filters or image decoding in the frame loop. The vent stays planted.
 c.save();c.beginPath();c.rect(h.x,h.y-h.h,h.w,h.h);c.clip();
 if(state.active){
  c.globalAlpha=.58;c.drawImage(im,0,0,iw,base,h.x,h.y-h.h,h.w,h.h-9);
  if(a.effect)for(let i=0;i<3;i++){
   const p=(at/1150+i/3+h.x*.001)%1,w=h.w*(.38+p*.62),height=h.h*(.42+p*.48);
   c.globalAlpha=Math.sin(p*Math.PI)*.55;c.drawImage(a.effect,h.x+(h.w-w)/2+Math.sin(p*6+i)*2,h.y-9-p*h.h*.28-height,w,height);
  }
 }else if(state.warning){c.globalAlpha=.18+(at?Math.sin(at/120)*.06:0);c.drawImage(im,0,0,iw,base,h.x+h.w*.2,h.y-27,h.w*.6,18);}
 else if(at&&tail>=0&&tail<200){c.globalAlpha=(1-tail/200)*.22;c.drawImage(im,0,0,iw,base,h.x,h.y-h.h,h.w,h.h-9);}
 c.restore();c.drawImage(im,0,base,iw,ih-base,h.x,h.y-9,h.w,10);
 return true;
}

export function barrier595(c,wall,hits=0){
 const a=load('crate');if(!a.ready)return;
 const count=Math.ceil(wall.h/wall.w),h=wall.h/count;
 for(let i=0;i<count;i++)c.drawImage(a.image,wall.x,wall.y+i*h,wall.w,h);
 if(hits){c.save();c.globalAlpha=.6;centered602(c,'spark',wall.x+wall.w*.6,wall.y+wall.h*.5,14);c.restore();}
}
