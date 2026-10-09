import {artURL602} from './Art602.js';
// Compositor-backed, decoded paintings. No procedural scenery fallback.
export const artURL593=(id,card=false)=>new URL('../../assets/runners593/'+id+(card?'-card':'')+'.webp',import.meta.url).href;
function background(r,id){const image=new Image();image.decoding='async';image.className='ru-background593';image.setAttribute('aria-hidden','true');image.draggable=false;r.canvas.before(image);const record={image,ready:false,key:null};image.onload=()=>{record.ready=true;};image.src=id==='cave'?artURL602('cave'):artURL593(id);return record;}
export function preload593(r,course){
 if(r.scene593?.id===course.id)return;
 r.scene593?.image.remove();r.cave602?.image.remove();r.scene593=background(r,course.theme);r.scene593.id=course.id;
 r.cave602=course.secrets600?.length?background(r,course.id==='relay'?'cave':'crystal'):null;if(r.cave602)r.cave602.image.style.opacity='0';
}
export function backdrop593(r,course){
 preload593(r,course);const w=r.width,h=r.height;r.ctx.clearRect(0,0,w,h);
 for(const a of [r.scene593,r.cave602].filter(Boolean)){
  const key=w+':'+h;if(a.key!==key){a.width=Math.ceil(Math.max(w+96,h*1.5));a.image.style.width=a.width+'px';a.image.style.height=h+'px';a.key=key;}
  const travel=Math.max(0,Math.min(1,r.camera/Math.max(1,course.length-w/r.scale)));
  a.image.style.transform='translate3d('+(-(a.width-w)*(.12+travel*.76))+'px,0,0)';
 }
 if(r.cave602)r.cave602.image.style.opacity=String(r.cave602.ready?r.depth602??0:0);
}
export function courseArt593(course){return `<img class="ru-course-art593" src="${artURL593(course.theme,true)}" loading="lazy" decoding="async" width="480" height="320" alt="">`;}
