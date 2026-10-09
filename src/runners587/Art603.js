export const artURL603=id=>new URL('../../assets/runners603/'+id+'.webp',import.meta.url).href;
const assets=new Map(),ids=['saw','pendulum','tesla','cannon','icicle','phase'];
function get(id){let a=assets.get(id);if(a)return a;const image=new Image();a={image,ready:false,error:false};assets.set(id,a);image.decoding='async';image.src=artURL603(id);a.promise=image.decode().then(()=>a.ready=true).catch(()=>a.error=true);return a;}
export function preload603(course){return course.expert603?Promise.all(ids.map(id=>get(id).promise)):Promise.resolve();}
export function status603(course){return {ready:!course.expert603||ids.every(id=>assets.get(id)?.ready),error:course.expert603&&ids.some(id=>assets.get(id)?.error)};}
export function image603(c,id,x,y,w,h){const a=get(id);if(a.ready)c.drawImage(a.image,x,y,w,h);}
export function sprite603(c,id,x,y,w,h=w,angle=0){c.save();c.translate(x,y);if(angle)c.rotate(angle);image603(c,id,-w/2,-h/2,w,h);c.restore();}
