// Original painted scenery, decoded once per active renderer; small repeated terrain textures.
export const artURL593=(id,card=false)=>new URL('../../assets/runners593/'+id+(card?'-card':'')+'.webp',import.meta.url).href;
const colors={
 forest:['#a0ed48','#4fbb30','#2b7825','#bd8544','#704828','#e9bd70'],
 sky:['#b6f573','#6abb45','#326743','#d9c6a1','#826d58','#fff0c3'],
 relay:['#9bdd65','#3f9660','#24534b','#75978a','#394f51','#b6d4a8'],
 clock:['#ffe69a','#d5a753','#81643e','#b5895f','#604948','#ebc18b'],
 coast:['#fff1ac','#e8c681','#a78757','#cfaa70','#897145','#ffe3aa'],
 frost:['#ffffff','#bbf0ff','#68b5d2','#88bbd0','#40698e','#d7f8ff'],
 crystal:['#ecd7ff','#9c90e8','#635ba3','#657aa8','#2e405f','#abc1f5'],
 ember:['#ffc08e','#c96e51','#724348','#76616c','#352e45','#b49792']
};
const canvas=(w,h)=>{const n=document.createElement('canvas');n.width=w;n.height=h;return n;};
function rounded(c,x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function gradient(c,x,y,x2,y2,stops){const g=c.createLinearGradient(x,y,x2,y2);stops.forEach(([at,color])=>g.addColorStop(at,color));return g;}
export function preload593(r,course){
 if(r.scene593?.id===course.id)return;
 r.scene593?.image.remove();const image=new Image();image.decoding='async';image.className='ru-background593';image.setAttribute('aria-hidden','true');image.draggable=false;r.canvas.before(image);
 const record=r.scene593={id:course.id,image,ready:false,key:null};image.onload=()=>{if(r.scene593===record)record.ready=true;};image.src=artURL593(course.theme);
}
export function backdrop593(r,course){
 preload593(r,course);const a=r.scene593,c=r.ctx,w=r.width,h=r.height;c.clearRect(0,0,w,h);
 if(!a.ready){c.fillStyle=['crystal','ember'].includes(course.theme)?'#213357':'#73ccec';c.fillRect(0,0,w,h);return;}
 const key=w+':'+h;
 if(a.key!==key){a.width=Math.ceil(Math.max(w+96,h*1.5));a.image.style.width=a.width+'px';a.image.style.height=h+'px';a.key=key;}
 // The browser composites a single decoded backdrop; canvas never redraws it.
 const travel=Math.max(0,Math.min(1,r.camera/Math.max(1,course.length-w/r.scale)));
 a.image.style.transform='translate3d('+(-(a.width-w)*(.12+travel*.76))+'px,0,0)';
}
function textures(r,theme){if(r.terrain593?.theme===theme)return r.terrain593;const t=colors[theme]??colors.forest,soil=canvas(96,96),c=soil.getContext('2d');
 c.fillStyle=t[4];c.fillRect(0,0,96,96);
 for(let row=0;row<3;row++)for(let col=-1;col<4;col++){
  const x=col*37+(row%2?18:0),y=row*32;rounded(c,x+2,y+2,34,29,6,gradient(c,x,y,x+12,y+32,[[0,t[3]],[.6,t[4]],[1,t[4]]]));
  c.strokeStyle=t[5]+'4d';c.lineWidth=1;c.beginPath();c.moveTo(x+7,y+4);c.lineTo(x+28,y+4);c.stroke();
  ellipse(c,x+13,y+12,2,1,t[5]+'3b');ellipse(c,x+27,y+23,1,2,t[4]);
 }
 const cap=canvas(96,34),d=cap.getContext('2d');d.fillStyle=gradient(d,0,0,0,30,[[0,t[0]],[.28,t[1]],[.78,t[2]],[1,t[2]]] );d.beginPath();d.moveTo(0,2);d.lineTo(96,2);d.lineTo(96,18);for(let x=96;x>=0;x-=12)d.quadraticCurveTo(x-6,30,x-12,18);d.closePath();d.fill();
 d.strokeStyle=t[0];d.lineWidth=3;d.beginPath();d.moveTo(0,3);d.lineTo(96,3);d.stroke();
 for(let x=6;x<96;x+=12){ellipse(d,x,10,3,1,t[0]+'9c');if(['forest','sky','relay'].includes(theme)){d.strokeStyle=t[0];d.lineWidth=2;d.beginPath();d.moveTo(x,5);d.lineTo(x+1,0);d.stroke();}}
 return r.terrain593={theme,t,soil:r.ctx.createPattern(soil,'repeat'),cap};
}
export function platform593(r,s,course){
 const c=r.ctx,{t,soil,cap}=textures(r,course.theme),depth=s.ground?520:s.wall?s.h:Math.max(29,s.h??20);c.save();c.translate(s.x,s.y);
 // Terrain bounds match collision surfaces. Highlights never obscure holes.
 if(s.ground||s.wall){c.fillStyle=soil;c.fillRect(0,0,s.w,depth);c.fillStyle='#10152136';c.fillRect(s.w-6,5,6,depth-5);c.fillStyle=t[5]+'66';c.fillRect(1,7,2,depth-7);}
 else{rounded(c,2,4,s.w-4,depth,8,t[4]);rounded(c,5,7,s.w-10,depth-6,5,gradient(c,0,6,0,depth,[[0,t[3]],[1,t[4]]]));c.strokeStyle=t[5]+'70';c.lineWidth=2;c.beginPath();c.moveTo(10,11);c.lineTo(s.w-10,11);c.stroke();for(let x=23;x<s.w-15;x+=33){c.strokeStyle=t[4];c.beginPath();c.moveTo(x,15);c.lineTo(x-3,depth);c.stroke();}}
 c.save();c.beginPath();c.rect(0,-2,s.w,34);c.clip();for(let x=0;x<s.w;x+=96)c.drawImage(cap,x,-2);c.restore();
 if(!s.ground&&!s.wall&&s.move){ellipse(c,s.w/2,25,5,3,t[0]);}
 if(s.ground&&['forest','sky','relay'].includes(course.theme)){
  // Small cached-looking silhouettes; ornaments stay away from the walkable top.
  for(let x=38;x<s.w-25;x+=103){c.strokeStyle=t[2];c.lineWidth=2;c.beginPath();c.moveTo(x,20);c.quadraticCurveTo(x+12,35,x+4,54);c.stroke();ellipse(c,x+8,32,6,2,t[1]);ellipse(c,x+2,43,5,2,t[2]);}
 }
 c.restore();
}
export function enemy593(c,p,at){c.save();c.translate(p.x,p.y);c.scale(p.dir,1);const walk=Math.sin(at/90)*2;
 ellipse(c,-9+walk,-3,7,4,'#342b39');ellipse(c,10-walk,-3,7,4,'#342b39');
 ellipse(c,-1,-14,18,13,'#492630');ellipse(c,-2,-16,16,12,gradient(c,-8,-29,8,-5,[[0,'#ffb47b'],[.32,'#e86455'],[1,'#99344a']]));
 ellipse(c,-8,-21,5,3,'#ffc39b');ellipse(c,10,-14,8,9,'#fff0d2');ellipse(c,13,-14,3,5,'#222738');ellipse(c,14,-16,1,2,'white');
 c.strokeStyle='#7d3441';c.lineWidth=2;c.beginPath();c.moveTo(0,-27);c.lineTo(1,-7);c.stroke();c.restore();}
export function pickup593(c,item,at){const fire=item.kind==='fire',bob=Math.sin(at/320+item.x)*3;c.save();c.translate(item.x,item.y+bob);
 const glow=c.createRadialGradient(0,0,2,0,0,24);glow.addColorStop(0,fire?'#ffda7780':'#c0fff680');glow.addColorStop(1,'#ffffff00');c.fillStyle=glow;c.fillRect(-24,-24,48,48);
 c.beginPath();c.moveTo(0,-17);c.lineTo(13,-4);c.lineTo(9,11);c.lineTo(0,17);c.lineTo(-10,10);c.lineTo(-13,-5);c.closePath();c.fillStyle=gradient(c,-12,-16,12,18,[[0,fire?'#fffac4':'#eeffff'],[.3,fire?'#ffcc55':'#76efdb'],[1,fire?'#d95737':'#239da7']]);c.fill();c.strokeStyle=fire?'#9d4938':'#276a83';c.lineWidth=1.6;c.stroke();c.fillStyle='#ffffffa8';c.beginPath();c.moveTo(0,-13);c.lineTo(0,9);c.lineTo(-8,-4);c.closePath();c.fill();c.restore();}
export function courseArt593(course){return `<img class="ru-course-art593" src="${artURL593(course.theme,true)}" loading="lazy" decoding="async" width="480" height="320" alt="">`;}
export function barrier594(c,wall,hits=0){
 c.save();c.translate(wall.x,wall.y);
 for(let y=0;y<wall.h;y+=35){const h=Math.min(34,wall.h-y);
  rounded(c,0,y,wall.w,h,3,'#633f31');rounded(c,3,y+3,wall.w-6,h-6,2,'#c28a47');
  c.strokeStyle='#f0c67b';c.lineWidth=4;c.beginPath();c.moveTo(6,y+7);c.lineTo(wall.w-6,y+h-7);c.moveTo(wall.w-6,y+7);c.lineTo(6,y+h-7);c.stroke();
  if(hits){c.strokeStyle='#482b32';c.lineWidth=2;c.beginPath();c.moveTo(18,y+2);c.lineTo(12,y+13);c.lineTo(23,y+21);c.lineTo(15,y+h);c.stroke();}
 }
 rounded(c,wall.w/2-32,-25,64,19,7,'#573b32');c.fillStyle='#fff0b2';c.font='bold 10px "Noto Sans JP",sans-serif';c.textAlign='center';c.fillText(hits?'あと１発':'火でこわせる',wall.w/2,-12);c.restore();
}
