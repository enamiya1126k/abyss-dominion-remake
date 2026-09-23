import {SUMO523,body523,nextShrink523} from './Rules523.js';
import {playerColor499} from '../party/PartyColors499.js';
export function createRenderer523(canvas){const r={canvas,ctx:canvas.getContext('2d',{alpha:false}),base:document.createElement('canvas'),floor:document.createElement('canvas'),width:0,height:0};return r}
export function project523(r,x,y){return{x:r.cx+x*r.scale,y:r.cy+y*r.scale*.78}}
export function resize523(r,w,h,dpr=1){const d=Math.min(1.5,dpr),key=[w,h,d].join(':');if(r.key===key)return;r.key=key;Object.assign(r,{width:w,height:h,dpr:d,cx:w/2,cy:h*.50,scale:Math.min((w-32)/20,(h-62)/16)});
 for(const c of[r.canvas,r.base,r.floor]){c.width=Math.round(w*d);c.height=Math.round(h*d)}
 const b=r.base.getContext('2d');b.scale(d,d);const bg=b.createRadialGradient(w/2,h*.45,0,w/2,h*.45,h*.8);bg.addColorStop(0,'#174e3c');bg.addColorStop(.55,'#092720');bg.addColorStop(1,'#020e12');b.fillStyle=bg;b.fillRect(0,0,w,h);
 // Monumental pillars remain cached behind the moving arena.
 for(const side of[-1,1])for(let i=0;i<4;i++){const x=w/2+side*(w*.39+i*16),y=h*.06+i*37;const gold=b.createLinearGradient(x,0,x+12,0);gold.addColorStop(0,'#182a20');gold.addColorStop(.5,'#776945');gold.addColorStop(1,'#121e18');b.fillStyle=gold;b.fillRect(x,y,12,h);b.fillStyle='#aa9b6155';b.fillRect(x-3,y,18,5);b.fillStyle='#22614f';b.beginPath();b.moveTo(x+2,y+15);b.lineTo(x+10,y+15);b.lineTo(x+10,y+65);b.lineTo(x+6,y+75);b.lineTo(x+2,y+65);b.fill()}
 b.strokeStyle='#d3bf7233';b.strokeRect(6,6,w-12,h-12);for(const x of[6,w-6])for(const y of[6,h-6]){b.fillStyle='#c5aa67';b.beginPath();b.arc(x,y,2,0,Math.PI*2);b.fill()}
 r.floorKey=null;
}
function ellipse(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2)}
function arena(r,radius){if(r.floorKey===radius)return;r.floorKey=radius;const c=r.floor.getContext('2d'),s=r.scale,R=radius*s,x=r.cx,y=r.cy;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,r.floor.width,r.floor.height);c.setTransform(r.dpr,0,0,r.dpr,0,0);
 c.fillStyle='#0008';ellipse(c,x,y+27,R+7,R*.78+7);c.fill();c.fillStyle='#433a24';ellipse(c,x,y+12,R,R*.78);c.fill();
 c.save();ellipse(c,x,y,R,R*.78);c.clip();const gr=c.createLinearGradient(0,y-R,0,y+R);gr.addColorStop(0,'#497363');gr.addColorStop(.45,'#214b3e');gr.addColorStop(1,'#102e28');c.fillStyle=gr;c.fillRect(x-R,y-R,R*2,R*2);
 c.lineWidth=1;c.strokeStyle='#021b1699';for(let row=-10;row<11;row++)for(let col=-10;col<11;col++){const xx=x+(col+(row%2)*.5)*s*1.7,yy=y+row*s*.78;c.strokeRect(xx,yy,s*1.7,s*.78);c.fillStyle=(row+col)%3?'#ffffff04':'#cfdea90b';c.fillRect(xx+1,yy+1,s*1.7-2,s*.78-2)}
 c.strokeStyle='#d8ca8a44';for(const f of[.34,.67,.94]){ellipse(c,x,y,R*f,R*.78*f);c.stroke()}
 c.strokeStyle='#dbd19a44';for(let i=0;i<12;i++){const a=i*Math.PI/6;const p=project523(r,Math.cos(a)*radius*.88,Math.sin(a)*radius*.88);c.save();c.translate(p.x,p.y);c.rotate(a);c.strokeRect(-3,-3,6,6);c.restore()}
 c.strokeStyle='#d0c49155';c.lineWidth=2;for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(x+Math.cos(a)*R*.12,y+Math.sin(a)*R*.12*.78);c.lineTo(x+Math.cos(a+.4)*R*.25,y+Math.sin(a+.4)*R*.25*.78);c.lineTo(x+Math.cos(a+.8)*R*.12,y+Math.sin(a+.8)*R*.12*.78);c.stroke()}
 c.restore();const rim=c.createLinearGradient(x-R,y-R,x+R,y+R);rim.addColorStop(0,'#fae2a1');rim.addColorStop(.4,'#9b844e');rim.addColorStop(.8,'#e8cd85');rim.addColorStop(1,'#71633d');c.strokeStyle=rim;c.lineWidth=5;ellipse(c,x,y,R-1,R*.78-1);c.stroke();c.strokeStyle='#fff1b66b';c.lineWidth=1;ellipse(c,x,y,R-5,R*.78-5);c.stroke();
}
export function paint523(r,g,poses,at,reduced=false){const c=r.ctx,w=r.width,h=r.height,s=r.scale;if(!w)return;const elapsed=g.phase==='result'?g.elapsed:Math.max(0,at-g.startAt);const R=g.radius;arena(r,R);c.setTransform(1,0,0,1,0,0);c.drawImage(r.base,0,0);c.drawImage(r.floor,0,0);c.setTransform(r.dpr,0,0,r.dpr,0,0);
 const until=nextShrink523(elapsed)-elapsed;if(until<4000&&elapsed<85000){c.strokeStyle=`rgba(255,166,91,${reduced?.65:.5+Math.sin(at/140)*.2})`;c.lineWidth=5;ellipse(c,r.cx,r.cy,R*s-7,R*s*.78-7);c.stroke();c.fillStyle='#ffe0a4';c.textAlign='center';c.font='bold 11px sans-serif';c.fillText('外周が崩れる！',r.cx,24)}
 for(const gem of g.crystals){const p=project523(r,gem.x,gem.y),q=gem.value===3?5:3.5,bob=reduced?0:Math.sin(at/330+gem.id)*2;c.fillStyle='#b2ffdd22';ellipse(c,p.x,p.y+3,8,3);c.fill();c.save();c.translate(p.x,p.y-5+bob);c.fillStyle=gem.value===3?'#ffe093':'#a3ffd8';c.strokeStyle=gem.value===3?'#c59248':'#47b894';c.lineWidth=1;c.beginPath();c.moveTo(0,-q*1.5);c.lineTo(q,0);c.lineTo(0,q*1.5);c.lineTo(-q,0);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';c.fillRect(-1,-q,1,q);c.restore()}
 for(const p of poses){if(!p.alive)continue;const pos=project523(r,p.x,p.y),rad=body523(p)*s,color=playerColor499(p).hex;c.fillStyle='#0006';ellipse(c,pos.x,pos.y+2,rad*1.15,rad*.38);c.fill();c.strokeStyle=color;c.lineWidth=2;ellipse(c,pos.x,pos.y,rad*1.16,rad*.53);c.stroke();
 if(p.charging){const q=p.charge/1400,aim=project523(r,p.x+p.fx*(1.4+q*2.2),p.y+p.fy*(1.4+q*2.2));c.strokeStyle=color;c.globalAlpha=.35+q*.55;c.lineWidth=3+q*4;c.beginPath();c.moveTo(pos.x,pos.y);c.lineTo(aim.x,aim.y);c.stroke();const a=Math.atan2(aim.y-pos.y,aim.x-pos.x);c.beginPath();c.moveTo(aim.x-Math.cos(a-.55)*9,aim.y-Math.sin(a-.55)*9);c.lineTo(aim.x,aim.y);c.lineTo(aim.x-Math.cos(a+.55)*9,aim.y-Math.sin(a+.55)*9);c.stroke();c.globalAlpha=1;c.strokeStyle=q>=1?'#fff1ae':color;c.lineWidth=2;c.beginPath();c.ellipse(pos.x,pos.y,rad*(1.2+q*.35),rad*(.6+q*.18),0,-Math.PI/2,-Math.PI/2+Math.PI*2*q);c.stroke()}
 if(p.attackUntil>elapsed){c.strokeStyle=color+'aa';c.lineWidth=rad*.8;c.lineCap='round';const back=project523(r,p.x-p.dx*2,p.y-p.dy*2);c.beginPath();c.moveTo(back.x,back.y);c.lineTo(pos.x,pos.y);c.stroke();c.lineCap='butt'}
 if(Math.hypot(p.kx,p.ky)>2){c.strokeStyle='#f9e5b484';c.lineWidth=1.4;for(const side of[-1,1]){c.beginPath();c.moveTo(pos.x+side*rad*.6,pos.y);c.lineTo(pos.x-p.kx*s*.09+side*rad*.6,pos.y-p.ky*s*.07);c.stroke()}}
 }
 for(const e of g.events){const age=elapsed-e.at;if(age<0||age>1400)continue;const t=age/1400,pos=project523(r,e.x??0,e.y??0);c.save();c.globalAlpha=1-t;
 if(e.type==='hit'){c.strokeStyle=e.side?'#adffdf':'#ffe8a1';c.lineWidth=3*(1-t)+.5;ellipse(c,pos.x,pos.y,8+t*s*3,4+t*s*2);c.stroke();if(!reduced)for(let i=0;i<10;i++){const a=i*Math.PI/5;c.fillStyle=i%2?'#fff3bb':'#baecc4';c.fillRect(pos.x+Math.cos(a)*t*s*3,pos.y+Math.sin(a)*t*s*2-t*(1-t)*s,3,3)}}
 if(e.type==='grow'){c.strokeStyle='#9effd4';c.lineWidth=2;ellipse(c,pos.x,pos.y,s*(.4+t*2),s*(.15+t*.7));c.stroke();c.fillStyle='#d6ffe6';c.textAlign='center';c.font='bold 10px sans-serif';c.fillText('成長！',pos.x,pos.y-22-t*24)}
 if(e.type==='collapse'){for(let i=0;i<18;i++){const a=i*Math.PI/9,p=project523(r,Math.cos(a)*e.from,Math.sin(a)*e.from);c.save();c.translate(p.x+Math.cos(a)*t*10,p.y+t*t*90);c.rotate((i%3-1)*t);c.fillStyle=i%2?'#57634c':'#9d8d5b';c.fillRect(-s*.6,-s*.3,s*1.2,s*.6);c.restore()}}
 c.restore();}
 if(!reduced){c.fillStyle='#d6eac63b';for(let i=0;i<10;i++)c.fillRect((i*67+at/140)%w,h-(i*91+at/80)%h,1.5,1.5)}
}
