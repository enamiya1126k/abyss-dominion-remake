// Painted art only. Images are decoded once; animation changes their transforms.
export const ASSETS602=Object.freeze(['bridge','switch','switch-active','spring','boost','wall','flag','star','ice-shell','spark','chain','wind-streak','ui-panel','ui-button','arrow','water']);
export const artURL602=id=>new URL('../../assets/runners602/'+id+'.webp',import.meta.url).href;
const images=new Map();
function asset602(id){
 if(images.has(id))return images.get(id);
 const image=new Image(),a={image,ready:false,error:false};images.set(id,a);image.decoding='async';image.src=artURL602(id);
 a.promise=image.decode().then(()=>{a.ready=true;}).catch(()=>{a.error=true;});return a;
}
export function preload602(){return Promise.all(ASSETS602.map(id=>asset602(id).promise));}
export function artStatus602(){return {ready:ASSETS602.every(id=>images.get(id)?.ready),error:ASSETS602.some(id=>images.get(id)?.error)};}
export function image602(c,id,x,y,w,h){const a=asset602(id);if(!a.ready)return false;c.drawImage(a.image,x,y,w,h);return true;}
export function centered602(c,id,x,y,w,h=w,angle=0){c.save();c.translate(x,y);if(angle)c.rotate(angle);image602(c,id,-w/2,-h/2,w,h);c.restore();}
export function strip602(c,id,x,y,w,h,tileWidth=100,offset=0){
 c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
 const shift=((offset%tileWidth)+tileWidth)%tileWidth;
 for(let xx=x+shift-tileWidth;xx<x+w;xx+=tileWidth)image602(c,id,xx,y,tileWidth,h);
 c.restore();
}
export function link602(c,id,x,y,toX,toY,width=8){const dx=toX-x,dy=toY-y;c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx)-Math.PI/2);image602(c,id,-width/2,0,width,Math.hypot(dx,dy));c.restore();}
export function wall602(c,s){
 c.save();c.beginPath();c.rect(s.x,s.y,s.w,s.h);c.clip();
 const tileHeight=Math.max(110,s.w*5.47);for(let y=s.y;y<s.y+s.h;y+=tileHeight)image602(c,'wall',s.x,y,s.w,tileHeight);c.restore();
}
export function switch602(c,s,on,at,paired=false){
 // Both state images share their exact canvas size and contact baseline.
 image602(c,on?'switch-active':'switch',s.x-26,s.y-11,52,14);
 if(on){c.save();c.globalAlpha=.5;centered602(c,'spark',s.x,s.y-11,10+Math.sin(at/270)*2);c.restore();}
 if(paired){const x=s.x-8;for(let i=0;i<2;i++){c.save();c.globalAlpha=on?1:.55;centered602(c,'boost',x+i*16,s.y-23,6,12);c.restore();}}
}
export function spring602(c,s,at,g){
 const e=g.events.findLast(e=>e.type==='spring'&&Math.abs(e.x-s.x)<2),age=e?at-e.at:9999;
 const squash=age>=0&&age<250?Math.sin(age/250*Math.PI)*7:0;
 // Compress below the collider's top. It never visually floats above the floor.
 image602(c,'spring',s.x-23,s.y-28+squash,46,28-squash);
}
export function flag602(c,cp,lit,at,reduced){
 c.save();c.globalAlpha=lit?1:.68;const sway=reduced?0:Math.sin(at/480+cp.x)*.7;
 image602(c,'flag',cp.x-13,cp.y-109,61+sway,110);c.restore();
 if(lit&&!reduced){c.save();c.globalAlpha=.55;centered602(c,'spark',cp.x+3,cp.y-100,10+Math.sin(at/380)*2);c.restore();}
}
export function icon602(id,cls=''){return `<img class="ru-art-icon602 ${cls}" src="${artURL602(id)}" alt="" draggable="false">`;}
