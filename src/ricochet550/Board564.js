import { HOCKEY564 as C, TEAM564, power565 } from './Hockey564.js';
import { color563 } from '../party/Arcade563.js';
const TAU=Math.PI*2,images=new Map(),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function image(name){if(!images.has(name)){const im=new Image();im.src=new URL('../../assets/'+name,import.meta.url).href;images.set(name,im);}return images.get(name);}
const ready=im=>im.complete&&im.naturalWidth;
export const board564=canvas=>({canvas,c:canvas.getContext('2d'),width:1,height:1,sx:1,sy:1,padX:7,padY:24,points:[],trail:[]});
export function resize564(r,w,h,dpr=1){r.width=Math.max(1,w);r.height=Math.max(1,h);r.dpr=Math.min(dpr,2);r.canvas.width=Math.round(w*r.dpr);r.canvas.height=Math.round(h*r.dpr);r.padY=clamp(h*.044,18,28);r.sx=(w-r.padX*2)/C.width;r.sy=(h-r.padY*2)/C.height;r.surfaceKey=null;r.trail=[];}
export const point564=(r,p)=>({x:r.width/2+p.x*r.sx,y:r.height-r.padY-p.y*r.sy});
function circle(c,x,y,r,fill,stroke,width=1){c.beginPath();c.arc(x,y,Math.max(.1,r),0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function text(c,str,x,y,size,color='#fce6b3'){c.font=`800 ${size}px "Noto Sans JP",sans-serif`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='#051b18';c.strokeText(str,x,y);c.fillStyle=color;c.fillText(str,x,y);}
function metal(c,x,y,w,h){const grad=c.createLinearGradient(x,y,x+w,y+h);for(const [at,color]of[[0,'#f3d999'],[.18,'#a8844a'],[.37,'#41351f'],[.58,'#dfba70'],[.8,'#6b4e2e'],[1,'#efcf90']])grad.addColorStop(at,color);return grad;}
function surface(r,g,self){
 const floor=image('hockey565/court.webp'),goalArt=image('hockey565/goal.webp'),team=g.players.find(p=>p.playerId===self)?.team564??0;
 const key=[r.width,r.height,team,!!ready(floor),!!ready(goalArt)].join(':');if(r.surfaceKey===key)return;r.surfaceKey=key;
 const cv=r.surface??=document.createElement('canvas');cv.width=r.canvas.width;cv.height=r.canvas.height;
 const c=cv.getContext('2d'),w=r.width,h=r.height,px=r.padX,py=r.padY;c.scale(r.dpr,r.dpr);c.fillStyle='#060f0e';c.fillRect(0,0,w,h);
 if(ready(floor))c.drawImage(floor,px,py,w-px*2,h-py*2);else{c.fillStyle='#123f33';c.fillRect(px,py,w-px*2,h-py*2);}
 const shade=c.createLinearGradient(0,py,0,h-py);shade.addColorStop(0,'#30121a35');shade.addColorStop(.5,'#00151114');shade.addColorStop(1,'#0b2b3f36');c.fillStyle=shade;c.fillRect(px,py,w-px*2,h-py*2);
 // Every part of a recessed goal stays outside the playable rectangle.
 c.fillStyle=metal(c,0,0,w,h);c.fillRect(0,0,px,h);c.fillRect(w-px,0,px,h);c.fillRect(0,0,w,py);c.fillRect(0,h-py,w,py);
 c.fillStyle='#13231c';c.fillRect(px,3,w-px*2,py-6);c.fillRect(px,h-py+3,w-px*2,py-6);c.strokeStyle='#ead29b77';c.lineWidth=1;c.strokeRect(2,2,w-4,h-4);c.strokeStyle='#fff1c755';c.strokeRect(px,py,w-px*2,h-py*2);
 for(let y=45;y<h-30;y+=65)for(const x of[3.5,w-3.5]){circle(c,x,y,1.6,'#1b2116');circle(c,x-.3,y-.5,.7,'#edcf92');}
 for(const goal of g.goals){
  const front=point564(r,goal),left=point564(r,{x:-goal.halfWidth,y:goal.y}).x,right=point564(r,{x:goal.halfWidth,y:goal.y}).x,top=goal.team===1,gy=top?0:front.y,gw=right-left,t=TEAM564[goal.team];
  c.fillStyle='#020807';c.fillRect(left,gy,gw,py);c.save();c.beginPath();c.rect(left-4,gy,gw+8,py);c.clip();
  if(ready(goalArt)){c.translate(w/2,top?py/2:h-py/2);if(!top)c.rotate(Math.PI);c.drawImage(goalArt,-gw*.56,-py*.7,gw*1.12,py*1.4);}c.restore();
  const well=c.createLinearGradient(0,gy,0,gy+py);well.addColorStop(top?0:1,'#000a');well.addColorStop(top?1:0,'#04131022');c.fillStyle=well;c.fillRect(left,gy,gw,py);
  c.fillStyle='#020806';c.fillRect(left,front.y-(top?0:1),gw,1.5);
  // The LED is precisely the authoritative y=0 / y=height scoring line.
  c.strokeStyle=t.color;c.lineWidth=1.5;c.beginPath();c.moveTo(left+2,front.y);c.lineTo(right-2,front.y);c.stroke();
  for(const x of[left,right]){c.fillStyle=metal(c,x-3,gy,6,py);c.fillRect(x-3,gy,6,py);c.fillStyle=t.color;c.fillRect(x-1,gy+py*.2,2,py*.6);}
  text(c,goal.team===team?'自陣':'相手',Math.max(25,left/2),gy+py/2,9,t.color);text(c,goal.team===team?'守る':'狙う',right+(w-right)/2,gy+py/2,9,t.color);
  c.save();c.beginPath();c.rect(px,py,w-px*2,h-py*2);c.clip();c.strokeStyle=t.color+'44';c.lineWidth=1;c.beginPath();c.ellipse(front.x,front.y,3.5*r.sx,2.05*r.sy,0,0,TAU);c.stroke();c.restore();
 }
 const mid=point564(r,{x:0,y:C.height/2});c.strokeStyle='#e7d4a273';c.lineWidth=1;c.beginPath();c.moveTo(px,mid.y);c.lineTo(w-px,mid.y);c.stroke();circle(c,mid.x,mid.y,r.sx*1.55,null,'#ead49e88',1);circle(c,mid.x,mid.y,r.sx*1.42,null,'#ead49e26',1);circle(c,mid.x,mid.y,2,'#edce8a');text(c,'自陣から打ち返せ',w/2,mid.y+Math.min(51,r.sy*1.9),9,'#e8d5a783');
}
function rotor(r,g){if(!g.hockey565?.rotor)return;const c=r.c,q=point564(r,{x:0,y:C.height/2}),art=image('ricochet555/impact-rotor.png');c.save();c.translate(q.x,q.y);c.scale(r.sx,r.sy);c.rotate(-g.rotor.angle);c.shadowColor='#00120d';c.shadowBlur=5;c.shadowOffsetY=3;if(ready(art))c.drawImage(art,22,383,1493,256,-2.7,-.46,5.4,.92);else{c.fillStyle='#ddbc79';c.beginPath();c.roundRect(-2.5,-.2,5,.4,.2);c.fill();}c.restore();}
function particles(r,g,u,at){const c=r.c;for(const e of g.events){
 const age=at-e.at,goal=e.type==='goal',pass=e.type==='pass',life=goal?1150:pass?650:300;if(age<0||age>life||e.x==null||!['gemHit','hit','rotor','wall','goal','pass'].includes(e.type))continue;
 const q=point564(r,{x:e.x,y:clamp(e.y,0,C.height)}),t=age/life,color=goal?TEAM564[e.team].color:pass?'#ffcf77':'#e9efd4';c.save();c.globalAlpha=(1-t)*(goal?.9:.7);
 if(goal){const glow=c.createRadialGradient(q.x,q.y,0,q.x,q.y,70+t*120);glow.addColorStop(0,color+'c0');glow.addColorStop(1,color+'00');c.fillStyle=glow;c.fillRect(0,q.y-210,r.width,420);if(!u.reduced){circle(c,q.x,q.y,18+t*r.width*.8,null,color,Math.max(1,5*(1-t)));circle(c,q.x,q.y,9+t*r.width*.55,null,'#fff1c6',2);}}
 if(pass)circle(c,q.x,q.y,16+t*40,null,color,2*(1-t));
 if(!u.reduced){const rays=goal?28:pass?12:5;for(let i=0;i<rays;i++){const a=i*TAU/rays+e.id*.71,dist=(goal?20:6)+t*(goal?180:25)*(1+.25*Math.sin(i*7)),x=q.x+Math.cos(a)*dist,y=q.y+Math.sin(a)*dist;c.strokeStyle=i%3?color:'#fff6d7';c.lineWidth=goal?2.4:1.5;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*(goal?10:4),y+Math.sin(a)*(goal?10:4));c.stroke();}}c.restore();
}}
export function paintBoard564(r,g,self,u,at){
 const c=r.c,w=r.width,h=r.height,s=Math.min(r.sx,r.sy),dt=clamp((at-g.serverAt)/1000,0,.04);surface(r,g,self);c.setTransform(r.dpr,0,0,r.dpr,0,0);c.clearRect(0,0,w,h);c.drawImage(r.surface,0,0,w,h);rotor(r,g);r.points=[];
 const striker=image('hockey565/striker.webp');for(const p of g.players){
  const low=p.team564===0?p.r:C.height/2+p.r,high=p.team564===0?C.height/2-p.r:C.height-p.r,q=point564(r,{x:clamp(p.x+p.vx*dt,-C.width/2+p.r,C.width/2-p.r),y:clamp(p.y+p.vy*dt,low,high)}),radius=p.r*s,mine=p.playerId===self,team=TEAM564[p.team564],reload=clamp((p.nextShotAt563-at)/C.reload,0,1);
  circle(c,q.x+1,q.y+3,radius+3,'#000b');c.save();c.shadowColor=team.color;c.shadowBlur=u.reduced?0:mine?10:6;circle(c,q.x,q.y,radius+2,null,team.color,mine?2.5:1.8);c.restore();
  if(ready(striker)){const z=radius*2/.96;c.drawImage(striker,q.x-z/2,q.y-z/2,z,z);}else circle(c,q.x,q.y,radius,metal(c,q.x-radius,q.y-radius,radius*2,radius*2),'#f7dc9c',1);
  c.strokeStyle=color563(p);c.lineWidth=3;c.beginPath();c.arc(q.x,q.y,radius*.77,-Math.PI/2,-Math.PI/2+TAU*(1-reload));c.stroke();
  if(mine){text(c,'▼',q.x,q.y-radius-9,10,'#fff0b3');circle(c,q.x,q.y,radius+5,null,'#fff0b36a',1);}r.points.push({...q,seat:p.seat,size:Math.max(21,radius*1.5),radius});
 }
 if(g.gem){
  const gem=g.gem,q=point564(r,gem),power=power565(gem),charged=(gem.charge565??0)>0,color=power>=2?'#ff9970':charged?'#ffe3a2':'#d5fff4',radius=gem.r*s;
  if(r.serial!==gem.serial){r.trail=[];r.serial=gem.serial;}if(!r.lastTrailAt||at-r.lastTrailAt>=15){r.trail.push({...q,at});r.lastTrailAt=at;}r.trail=r.trail.filter(p=>at-p.at<250+100*(power-1)).slice(-24);
  if(!u.reduced)for(let i=1;i<r.trail.length;i++){const a=r.trail[i-1],b=r.trail[i];c.save();c.globalAlpha=i/r.trail.length*(charged?.5:.24);c.strokeStyle=color;c.lineWidth=radius*(.5+i/r.trail.length);c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.restore();}
  c.save();c.shadowColor=color;c.shadowBlur=u.reduced?0:charged?16:7;circle(c,q.x,q.y,radius+1,'#041712',color,1.5);c.restore();const art=image('hockey565/puck.webp'),z=radius*2/.93;if(ready(art))c.drawImage(art,q.x-z/2,q.y-z/2,z,z);else circle(c,q.x,q.y,radius,'#202926','#f5d395',2);
  if(charged){circle(c,q.x,q.y,radius+3,null,color,1);text(c,'×'+power.toFixed(2),q.x,q.y-radius-10,10,color);}
 }else r.trail=[];
 particles(r,g,u,at);
 const p=g.players.find(p=>p.playerId===self),q=r.points.find(q=>q.seat===p?.seat);if(p&&q&&u.pull){const dx=Math.sin(u.pull.angle),dy=-Math.cos(u.pull.angle),len=24+u.pull.power*55;c.save();c.strokeStyle='#ffe5a0';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(q.x-dx*(15+u.pull.power*30),q.y-dy*(15+u.pull.power*30));c.lineTo(q.x,q.y);c.stroke();c.lineWidth=2;c.beginPath();c.moveTo(q.x+dx*22,q.y+dy*22);c.lineTo(q.x+dx*len,q.y+dy*len);c.stroke();c.translate(q.x+dx*len,q.y+dy*len);c.rotate(Math.atan2(dy,dx));c.beginPath();c.moveTo(7,0);c.lineTo(-5,-5);c.lineTo(-5,5);c.closePath();c.fillStyle='#fff1c4';c.fill();c.restore();}
}
