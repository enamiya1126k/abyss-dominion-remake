export const PALETTES591={
 forest:{sky:'#c5dec5',bottom:'#658f89',far:'#6b9690',near:'#3c746e',top:'#b3d787',edge:'#eff0bd',rock:'#456a65',dark:'#264d4b',accent:'#e8c58c',light:'#fff1c8'},
 sky:{sky:'#c6e9ee',bottom:'#739eb7',far:'#82aeba',near:'#587f98',top:'#d2e0bc',edge:'#fff0cb',rock:'#647c8a',dark:'#385367',accent:'#e8ca96',light:'#fff3d0'},
 relay:{sky:'#b1d8cb',bottom:'#578c8e',far:'#5f9997',near:'#3d777c',top:'#bcdec3',edge:'#ecdfb2',rock:'#527d79',dark:'#285653',accent:'#b2f2d5',light:'#f4f5cb'},
 clock:{sky:'#d6ba9e',bottom:'#7f7a91',far:'#8d8294',near:'#685f7c',top:'#d2bca2',edge:'#ffe1a7',rock:'#706678',dark:'#49465e',accent:'#f3bc80',light:'#ffe6b4'},
 coast:{sky:'#c5e8df',bottom:'#6cafb9',far:'#75b9b7',near:'#428f9e',top:'#f1d4a2',edge:'#fff0ca',rock:'#6f9694',dark:'#3c6f79',accent:'#c4f5eb',light:'#fff2c5'},
 frost:{sky:'#d9e7f5',bottom:'#99b8d5',far:'#a4bfda',near:'#739abf',top:'#edf7fc',edge:'#ffffff',rock:'#83b3d1',dark:'#507999',accent:'#cbefff',light:'#f5fbff'},
 crystal:{sky:'#555578',bottom:'#313c66',far:'#4a557b',near:'#303f66',top:'#adb4db',edge:'#e5d2ff',rock:'#535b87',dark:'#34395e',accent:'#bdacff',light:'#e5d2ff'},
 ember:{sky:'#d39c8c',bottom:'#6f536e',far:'#8f6477',near:'#5d465f',top:'#bb9392',edge:'#ffd2a2',rock:'#685269',dark:'#3f354c',accent:'#ffb38a',light:'#ffe5b9'}
};
const poly=(c,points,fill)=>{c.beginPath();for(let i=0;i<points.length;i++)i?c.lineTo(...points[i]):c.moveTo(...points[i]);c.closePath();c.fillStyle=fill;c.fill();};
const surface=(w,h)=>{const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);return c;};
function tree(c,x,y,s,t){c.fillStyle=t.dark;c.fillRect(x-4*s,y-110*s,8*s,120*s);for(let i=0;i<3;i++)poly(c,[[x,y-(165-i*27)*s],[x+(47+i*4)*s,y-(65-i*15)*s],[x-(47+i*4)*s,y-(65-i*15)*s]],i===0?t.far:t.near);}
function palm591(c,x,y,s,t){c.strokeStyle=t.dark;c.lineWidth=7*s;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+22*s,y-60*s,x+4*s,y-110*s);c.stroke();for(let i=0;i<5;i++){const dx=(i-2)*24*s;c.strokeStyle=t.near;c.lineWidth=8*s;c.beginPath();c.moveTo(x+4*s,y-110*s);c.quadraticCurveTo(x+dx*.6,y-140*s,x+dx,y-(i%2?91:108)*s);c.stroke();}}
function towers(c,x,y,s,t){c.fillStyle=t.dark;c.fillRect(x,y-90*s,30*s,110*s);c.fillRect(x+46*s,y-140*s,37*s,160*s);c.fillRect(x+96*s,y-68*s,30*s,88*s);poly(c,[[x-6*s,y-90*s],[x+15*s,y-123*s],[x+36*s,y-90*s]],t.near);poly(c,[[x+40*s,y-140*s],[x+64*s,y-178*s],[x+89*s,y-140*s]],t.near);c.fillStyle=t.light;for(let i=0;i<3;i++)c.fillRect(x+61*s,y-(115-i*26)*s,5*s,11*s);}
export function backdrop591(r,course){
 const {width:w,height:h}=r,t=PALETTES591[course.theme]??PALETTES591.forest;
 if(r.art591?.key===course.id+':'+w+':'+h)return r.art591;
 const sky=surface(w,h),c=sky.getContext('2d'),gradient=c.createLinearGradient(0,0,0,h);gradient.addColorStop(0,t.sky);gradient.addColorStop(1,t.bottom);c.fillStyle=gradient;c.fillRect(0,0,w,h);
 const sunX=w*.78,sunY=h*.24;c.fillStyle=t.light+'44';c.beginPath();c.arc(sunX,sunY,48,0,7);c.fill();c.fillStyle=t.light+'aa';c.beginPath();c.arc(sunX,sunY,30,0,7);c.fill();
 for(let i=0;i<14;i++){const x=(i*137+17)%(w+120)-60,y=34+(i*53)%(h*.52);c.fillStyle=t.light+'30';c.beginPath();c.ellipse(x,y,43+i%3*20,4+i%4,0,0,7);c.fill();}
 const layers=[.14,.28].map((factor,layer)=>{
  const canvas=surface(w+180,h),d=canvas.getContext('2d'),lw=canvas.width,base=h*(layer?.82:.68);d.globalAlpha=layer?.8:.52;
  for(let i=0;i<7;i++){const x=i*lw/6,peak=base-60-(i*71)%110;poly(d,[[x-100,h],[x-94,base],[x,peak],[x+130,base+25],[x+160,h]],layer?t.near:t.far);}
  if(course.theme==='coast'){d.fillStyle=t.far;d.fillRect(0,base+8,lw,h);for(let i=0;i<8;i++){d.strokeStyle=t.light+'55';d.lineWidth=1;d.beginPath();d.ellipse(i*95,base+18+i%3*15,63,3,0,0,7);d.stroke();}for(let i=0;i<4;i++)palm591(d,i*lw/3,base+42,.8,t);}
  else if(course.theme==='relay'){for(let i=0;i<4;i++){const x=i*lw/3-30;d.strokeStyle=t.near;d.lineWidth=14;d.beginPath();d.moveTo(x,base+65);d.lineTo(x,base-30);d.arc(x+32,base-30,32,Math.PI,0);d.lineTo(x+64,base+65);d.stroke();d.strokeStyle=t.accent+'55';d.lineWidth=2;d.stroke();}}
  else if(course.theme==='forest')for(let i=0;i<6;i++)tree(d,i*lw/5-15,base+45,.55+i%3*.16,t);
  else if(['clock','ember','sky'].includes(course.theme)){towers(d,30,base,.75,t);towers(d,lw*.64,base+50,.55,t);}
  else for(let i=0;i<10;i++){const x=i*lw/9,y=base+30,s=35+i%4*14;poly(d,[[x-s/2,y],[x-s/4,y-s],[x+7,y-s-18],[x+s/2,y]],layer?t.near:t.far);d.strokeStyle=t.accent+'55';d.beginPath();d.moveTo(x+7,y-s-18);d.lineTo(x,y);d.stroke();}
  return{canvas,factor};
 });
 return r.art591={key:course.id+':'+w+':'+h,sky,layers};
}
export function paintBackdrop591(r,course){const art=backdrop591(r,course),c=r.ctx;c.drawImage(art.sky,0,0);for(const layer of art.layers){const w=layer.canvas.width,x=-((r.camera*layer.factor*r.scale)%w);c.drawImage(layer.canvas,x,0);c.drawImage(layer.canvas,x+w,0);}}
function tile591(s,t){
 const depth=s.ground?520:s.wall?s.h:64,w=s.w,canvas=surface(w+12,depth+18),c=canvas.getContext('2d');c.translate(6,12);
 const g=c.createLinearGradient(0,0,0,depth);g.addColorStop(0,t.rock);g.addColorStop(1,t.dark);c.fillStyle=g;
 if(s.ground||s.wall)c.fillRect(0,0,w,depth);else{poly(c,[[0,2],[w,2],[w-6,23],[w*.72,37],[w*.48,53],[w*.2,34],[5,23]],t.dark);poly(c,[[3,9],[w-3,9],[w*.75,31],[w*.48,49],[w*.37,24],[6,20]],t.rock);}
 if(s.ground||s.wall){
  c.save();c.beginPath();c.rect(0,0,w,depth);c.clip();
  for(let row=0;row<depth/38;row++)for(let x=(row%2?-30:0);x<w;x+=61){c.fillStyle=(x+row)%3?t.dark+'44':t.edge+'0c';c.fillRect(x+1,row*38+14,58,35);c.strokeStyle=t.dark+'66';c.strokeRect(x,row*38+12,61,38);c.fillStyle=t.edge+'20';c.fillRect(x+2,row*38+14,57,1);}
  c.restore();
 }
 c.fillStyle=t.top;c.fillRect(0,0,w,9);c.fillStyle=t.edge;c.fillRect(0,0,w,2);c.fillStyle=t.dark;c.fillRect(2,10,w-4,3);
 if(s.ground&&t!==PALETTES591.frost)for(let x=5;x<w-8;x+=17)poly(c,[[x,1],[x+2,-3-(x%5)],[x+5,0],[x+8,-6],[x+10,2]],t.top);
 if(s.ground)for(let x=30;x<w-20;x+=93){c.strokeStyle=t.top+'99';c.lineWidth=2;c.beginPath();c.moveTo(x,7);c.quadraticCurveTo(x+12,27,x,49);c.stroke();for(let j=0;j<3;j++){c.fillStyle=t.top+'bb';c.beginPath();c.ellipse(x+j%2*7,17+j*10,6,2,j%2?.6:-.6,0,7);c.fill();}}
 if(!s.ground&&!s.wall){poly(c,[[w/2,18],[w/2+5,24],[w/2,30],[w/2-5,24]],s.move?t.light:t.accent);}
 return canvas;
}
export function platform591(r,s,course){const t=PALETTES591[course.theme]??PALETTES591.forest,cache=r.tiles591??=new Map(),key=[course.theme,s.w,s.h,!!s.ground,!!s.wall,!!s.move].join(':');let tile=cache.get(key);if(!tile){tile=tile591(s,t);if(cache.size>=24)cache.delete(cache.keys().next().value);cache.set(key,tile);}r.ctx.drawImage(tile,s.x-6,s.y-12);}
export function pickup591(c,item,at){
 const fire=item.kind==='fire',color=fire?'#ffc488':'#b0f7e7',bob=Math.sin(at/350+item.x)*3;c.save();c.translate(item.x,item.y+bob);c.fillStyle='#153d48cc';c.beginPath();c.arc(0,0,17,0,7);c.fill();c.strokeStyle=color;c.lineWidth=2;c.stroke();c.fillStyle=color;
 if(fire){c.beginPath();c.moveTo(-7,7);c.bezierCurveTo(-17,-2,-2,-4,-2,-13);c.bezierCurveTo(10,-7,15,5,5,10);c.closePath();c.fill();c.fillStyle='#fff6cf';c.beginPath();c.ellipse(0,4,3,6,0,0,7);c.fill();}
 else{c.strokeStyle=color;c.lineWidth=2.8;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-10,i*6-6);c.lineTo(4+i*2,i*6-6);c.quadraticCurveTo(15,i*6-12,8,i*6-14);c.stroke();}}
 c.restore();
}
export function courseArt591(course){
 const t=PALETTES591[course.theme],night=course.theme==='crystal',id='ru-art-'+course.id;
 const towers=['clock','ember','sky'].includes(course.theme);
 const hills=`<path d="M0 102L44 52 90 85 138 30 206 86 272 45 320 90V170H0Z" fill="${t.far}"/><path d="M0 123L53 80 110 118 183 69 249 115 320 73V170H0Z" fill="${t.near}"/>`;
 let scenery=towers?`<path d="M39 130V65H63V130M88 130V44H116V130M226 130V54H252V130" fill="${t.dark}"/><path d="M32 66L51 36 71 66M80 45L102 13 124 45M218 55L239 23 260 55" fill="${t.rock}"/><path d="M99 62V76M236 72V86" stroke="${t.light}" stroke-width="5"/>`:
  ['frost','crystal'].includes(course.theme)?`<path d="M15 136L38 52 59 129 96 73 126 144M214 141L242 37 266 131 291 62 313 143" fill="${t.accent}" opacity=".35"/>`:
  `<path d="M31 135V58M70 134V76M242 130V50M279 130V72" stroke="${t.dark}" stroke-width="7"/><path d="M9 98L32 29 57 98M50 106L70 48 93 106M216 92L242 21 268 92M257 109L279 49 302 109" fill="${t.near}"/>`;
 if(course.theme==='coast')scenery=`<path d="M0 115Q80 94 150 119T320 115V180H0Z" fill="${t.far}"/><path d="M0 126Q55 111 100 127T200 126T320 126" fill="none" stroke="${t.light}" opacity=".35"/><path d="M51 147Q70 94 55 58M263 141Q250 102 270 57" fill="none" stroke="${t.dark}" stroke-width="7"/><path d="M14 69Q30 37 55 58Q92 31 107 65M21 43Q49 34 55 58Q68 19 90 32M232 58Q249 36 270 57Q300 33 320 62" fill="none" stroke="${t.near}" stroke-width="10"/>`;
 if(course.theme==='relay')scenery=`<path d="M27 147V75Q52 29 80 75V147M217 147V60Q248 18 279 60V147" fill="none" stroke="${t.near}" stroke-width="16"/><path d="M130 110V60L150 41 169 60V112" fill="${t.rock}"/><path d="M150 55L156 65 150 75 144 65Z" fill="${t.accent}"/>`;
 if(course.theme==='sky')scenery+=`<path d="M191 123L191 69M164 40L218 98M218 40L164 98" stroke="${t.light}" stroke-width="6"/><circle cx="191" cy="69" r="6" fill="${t.accent}"/>`;
 if(course.theme==='clock')scenery+=`<circle cx="159" cy="66" r="26" stroke="${t.accent}" stroke-width="7" fill="${t.dark}"/><path d="M159 39V28M159 103V92M132 66H121M197 66H186M159 46V66H174" stroke="${t.accent}" stroke-width="5"/>`;
 return `<svg class="ru-course-art591" viewBox="0 0 320 180" aria-hidden="true"><defs><linearGradient id="${id}" x2="0" y2="1"><stop stop-color="${t.sky}"/><stop offset="1" stop-color="${t.bottom}"/></linearGradient></defs><rect width="320" height="180" fill="url(#${id})"/><circle cx="258" cy="38" r="22" fill="${t.light}" opacity="${night?.75:.45}"/>${hills}${scenery}<path d="M0 143H108V180H0ZM166 143H320V180H166Z" fill="${t.dark}"/><path d="M0 143H108M166 143H320M120 114H178" stroke="${t.top}" stroke-width="9"/><path d="M0 140H108M166 140H320M120 111H178" stroke="${t.edge}" stroke-width="2"/><path d="M282 139V100H300L294 112H283" fill="${t.accent}" stroke="${t.edge}" stroke-width="2"/><path d="M145 89L152 98 145 107 138 98Z" fill="${t.light}"/><ellipse cx="87" cy="134" rx="11" ry="7" fill="#be776c"/><circle cx="93" cy="131" r="2" fill="#fff1c9"/></svg>`;
}
