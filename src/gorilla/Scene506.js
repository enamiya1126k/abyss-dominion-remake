import{HAIRS505,layout505,kingPose505,blast505,count505}from'./Presentation505.js';
import{painters505 as paint,draw505}from'./Scene505.js';
import{liveFrame506,sceneKey506}from'./Performance506.js';
const caches=new WeakMap();
function surface(canvas,w,h,u){const out=u.createCanvas506?.(w,h)??canvas.ownerDocument?.createElement('canvas')??globalThis.document?.createElement?.('canvas');if(!out)return null;out.width=w;out.height=h;return out}
function reset(cache){for(const layer of cache.layers??[])if(layer){layer.canvas.width=1;layer.canvas.height=1}cache.layers=[];cache.layerKey=null}
export function release506(canvas){const cache=caches.get(canvas);if(cache){reset(cache);for(const b of cache.bodies??[]){b.canvas.width=1;b.canvas.height=1}if(cache.back){cache.back.canvas.width=1;cache.back.canvas.height=1}caches.delete(canvas)}}
function hair(c,h,l,g,at,u){c.save();c.translate(l.x+l.size*h.x/100,l.y+l.size*h.y/100);c.scale(l.size/370,l.size/370);paint.drawHair(c,h,g,at,u);c.restore()}
// The two transparent layers preserve hair ordering around the one animated
// strand. They are sampled at the maximum visible pixel density, never reduced.
function overlays(canvas,cache,l,g,at,u,pose,ratio){
 const active=g.phase==='pluck'&&!u.reduced?g.events.at(-1)?.hair:u.pending?.kind==='pull'?u.pending.hair:-1;
 const coverChest=pose.asset==='rage'&&pose.frame>=2;
 const full=layout505(l.w,l.h,{...g,phase:'playing'},at,u.reduced),density=Math.max(full.size*full.scale,l.size*1.07)*ratio/370;
 const key=[g.id,g.picked.join(','),active,coverChest,density].join('|');
 if(cache.layerKey!==key){reset(cache);const bounds={x:88,y:135,w:199,h:186},parts=active>=0?2:1;
  for(let part=0;part<parts;part++){const bmp=surface(canvas,Math.ceil(bounds.w*density),Math.ceil(bounds.h*density),u);if(!bmp){reset(cache);return null}const c=bmp.getContext('2d');c.setTransform(density,0,0,density,-bounds.x*density,-bounds.y*density);const unit={x:0,y:0,size:370};if(part===0&&!coverChest)paint.undercoat(c,unit);
   for(const h of HAIRS505){if(h.id===active||coverChest&&h.y<66||active>=0&&(part===0?h.id>active:h.id<active))continue;hair(c,h,unit,g,at,{...u,pending:null})}
   cache.layers.push({canvas:bmp,...bounds,density});
  }cache.layerKey=key;
 }
 return{layers:cache.layers,active};
}
function layer(c,b,l){const unit=l.size/370;c.drawImage(b.canvas,l.x+b.x*unit,l.y+b.y*unit,b.canvas.width/b.density*unit,b.canvas.height/b.density*unit)}
function background(c,canvas,cache,assets,w,h,ratio,u){const key=[w,h,ratio].join('|');let back=cache.back;if(!back||back.key!==key||back.image!==assets.background){if(back){back.canvas.width=1;back.canvas.height=1}const bmp=surface(canvas,canvas.width,canvas.height,u);if(!bmp)return false;const b=bmp.getContext('2d');b.setTransform(ratio,0,0,ratio,0,0);paint.cover(b,assets.background,w,h);const shade=b.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#071d1780');shade.addColorStop(.25,'#071d1700');shade.addColorStop(1,'#071d1770');b.fillStyle=shade;b.fillRect(0,0,w,h);cache.back=back={canvas:bmp,key,image:assets.background}}c.drawImage(back.canvas,0,0,w,h);return true}
function world(c,l,blast){c.translate(l.cx,l.cy+l.dy);c.scale(l.scale,l.scale);c.translate(-l.cx,-l.cy);if(blast?.scale!==undefined){c.translate(l.cx,l.y+l.size*.8);c.scale(blast.scale,blast.scale);c.translate(-l.cx,-l.y-l.size*.8)}}
function king(c,l,assets,pose,hero,shadow=true){c.save();c.shadowColor=shadow?'#06150ba0':'#00000000';c.shadowBlur=shadow?12:0;c.shadowOffsetY=shadow?6:0;if(hero)c.drawImage(assets.hero,l.x,l.y,l.size,l.size);else paint.tile(c,assets[pose.asset],pose.frame,l,pose.asset);c.restore()}
function body(c,canvas,cache,l,g,assets,pose,blast,ratio,u){const hero=l.focus>.985&&!['drum','blast'].includes(g.phase),image=hero?assets.hero:assets[pose.asset];
 // Camera travel retains the original drawing transform. At a fixed camera the
 // king and shadow are identical across animation frames. Travel and subpixel
 // shake still sample the original image directly, preserving fur detail.
 if(l.focus>0&&l.focus<1||blast?.shake){c.save();world(c,l,blast);king(c,l,assets,pose,hero);c.restore();return}
 const key=[l.w,l.h,ratio,l.x,l.y,l.size,l.scale,l.dy,blast?.scale??1,hero?'hero':pose.asset,hero?0:pose.frame].join('|');cache.bodies??=[];let saved=cache.bodies.find(b=>b.key===key&&b.image===image);
 if(!saved){const pad=24,bmp=surface(canvas,canvas.width+2*pad*ratio,canvas.height+2*pad*ratio,u);if(!bmp){c.save();world(c,l,blast);king(c,l,assets,pose,hero);c.restore();return}const b=bmp.getContext('2d');b.setTransform(ratio,0,0,ratio,pad*ratio,pad*ratio);world(b,l,blast);king(b,l,assets,pose,hero);saved={canvas:bmp,key,pad,image};cache.bodies.push(saved);if(cache.bodies.length>3){const old=cache.bodies.shift();old.canvas.width=1;old.canvas.height=1}}
 c.drawImage(saved.canvas,-saved.pad,-saved.pad,saved.canvas.width/ratio,saved.canvas.height/ratio);
}
export function draw506(canvas,g,assets,at,u={}){
 const w=canvas.clientWidth||canvas.width,h=canvas.clientHeight||canvas.height;
 let cache=caches.get(canvas);if(!cache){cache={layers:[]};caches.set(canvas,cache)}
 const key=sceneKey506(g,u,w,h,canvas.width,canvas.height),count=g.phase==='countdown'?count505(g,at):'',live=liveFrame506(g,at,u.reduced);
 if(cache.key===key&&cache.assets===assets&&!live&&!cache.live&&cache.count===count)return cache.layout;
 const l=layout505(w,h,g,at,u.reduced),ratio=canvas.width/w,pose=kingPose505(g,at),blast=blast505(g,at,u.reduced);
 // Static frames use the original painter exactly once. This makes the settled
 // frame pixel-identical and avoids doing any canvas work while choosing.
 if(!live){draw505(canvas,g,assets,at,u)}
 else{
  const bits=overlays(canvas,cache,l,g,at,u,pose,ratio);
  if(!bits)draw505(canvas,g,assets,at,u);
  else{const c=canvas.getContext('2d');c.setTransform(ratio,0,0,ratio,0,0);c.clearRect(0,0,w,h);c.save();if(blast?.shake)c.translate(Math.sin(blast.age*.071)*blast.shake,Math.cos(blast.age*.063)*blast.shake*.55);
   if(blast?.shake){paint.cover(c,assets.background,w,h);const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#071d1780');shade.addColorStop(.25,'#071d1700');shade.addColorStop(1,'#071d1770');c.fillStyle=shade;c.fillRect(0,0,w,h)}else background(c,canvas,cache,assets,w,h,ratio,u);if(blast)paint.aura(c,w,h,blast.age);
   body(c,canvas,cache,l,g,assets,pose,blast,ratio,u);c.save();world(c,l,blast);
   layer(c,bits.layers[0],l);if(bits.active>=0)hair(c,HAIRS505[bits.active],l,g,at,u);if(bits.layers[1])layer(c,bits.layers[1],l);
   paint.drawPinch(c,l,g,at,u,assets.hero);c.restore();if(blast&&!blast.judging&&!u.reduced)paint.shockwave(c,w,h,blast.age);c.restore();
  }
 }
 cache.key=key;cache.assets=assets;cache.live=live;cache.count=count;cache.layout=l;return l;
}
