import {SUMO523 as C,body523,nextShrink523,radius523,dashDistance527,chargeRatio535,level535} from './Rules523.js';
import {item535,chargeAura535,guide535,magneticField535,fullFlash535} from './Effects535.js';
import {rupture535} from './Stage535.js';
import {playerColor499} from '../party/PartyColors499.js';
const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const assets=new Map();
function asset(path){if(assets.has(path))return assets.get(path);const img=typeof Image==='function'?new Image():null;if(img)img.src=new URL('../../assets/'+(path==='items.webp'?'sumo535/':'sumo527/')+path,import.meta.url).href;assets.set(path,img);return img}
const ready=i=>i?.complete&&i.naturalWidth>0;
export function createRenderer523(canvas){return{canvas,ctx:canvas.getContext('2d',{alpha:false}),bg:asset('abyss.webp'),texture:asset('arena.webp'),items:asset('items.webp'),width:0,height:0,camera:{x:0,y:0,zoom:1.18},lastAt:0}}
export function project523(r,x,y){return{x:r.cx+(x-r.camera.x)*r.scale,y:r.cy+(y-r.camera.y)*r.scale*.78}}
export function unproject527(r,x,y){return{x:(x-r.cx)/r.scale+r.camera.x,y:(y-r.cy)/(r.scale*.78)+r.camera.y}}
export function resize523(r,w,h,dpr=1){const d=Math.min(1.5,dpr);if(r.key===[w,h,d].join(':'))return;r.key=[w,h,d].join(':');Object.assign(r,{width:w,height:h,dpr:d,cx:w/2,cy:Math.max(100,(h-110)*.5),baseScale:Math.max(6,Math.min((w-24)/18,(h-130)/14.04))});r.scale=r.baseScale*r.camera.zoom;r.canvas.width=Math.round(w*d);r.canvas.height=Math.round(h*d)}
function ellipse(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU)}
function ringPath(c,outer,inner,a=0,b=TAU){c.beginPath();c.arc(0,0,outer,a,b);c.arc(0,0,inner,b,a,true);c.closePath()}
function imageCover(c,img,w,h,ox=0,oy=0){const s=Math.max(w/img.width,h/img.height);c.drawImage(img,(w-img.width*s)/2+ox,(h-img.height*s)/2+oy,img.width*s,img.height*s)}
function floorImage(c,r){if(ready(r.texture)){const i=r.texture;const pad=.021;c.drawImage(i,i.width*pad,i.height*pad,i.width*(1-pad*2),i.height*(1-pad*2),-9,-9,18,18)}else{c.fillStyle='#30463d';c.fillRect(-9,-9,18,18);c.strokeStyle='#9e9463';c.lineWidth=.03;for(const R of[3,4.95,6.3,7.65,9]){c.beginPath();c.arc(0,0,R,0,TAU);c.stroke()}}}
function world(c,r,fn){const o=project523(r,0,0);c.save();c.translate(o.x,o.y);c.scale(r.scale,r.scale*.78);fn();c.restore()}
function camera(r,g,poses,at,reduced){const elapsed=g.phase==='result'?g.elapsed:Math.max(0,at-g.startAt),warning=nextShrink523(elapsed)-elapsed<C.warning,collapse=g.events.some(e=>e.type==='collapse'&&elapsed-e.at>=0&&elapsed-e.at<1800),self=poses.find(p=>p.playerId===r.selfId),focus=self?.alive?self:poses.find(p=>p.alive),dt=clamp((at-(r.lastAt||at))/1000,0,.06);r.lastAt=at;
 const overview=warning||collapse||g.phase!=='play',z=Math.min(1.8,9/g.radius)*(overview?1:1.16),tx=overview?0:Math.sign(focus?.x??0)*Math.max(0,Math.abs(focus?.x??0)-1.65)*.58,ty=overview?0:Math.sign(focus?.y??0)*Math.max(0,Math.abs(focus?.y??0)-1.5)*.5,f=reduced?1:1-Math.exp(-dt*4.5);r.camera.x+=(tx-r.camera.x)*f;r.camera.y+=(ty-r.camera.y)*f;r.camera.zoom+=(z-r.camera.zoom)*f;r.scale=r.baseScale*r.camera.zoom}
function background(c,r,at,reduced){const w=r.width,h=r.height;c.fillStyle='#061a19';c.fillRect(0,0,w,h);if(ready(r.bg))imageCover(c,r.bg,w,h,-r.camera.x*1.7,-r.camera.y*1.5);const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#02130f25');shade.addColorStop(.5,'#06272508');shade.addColorStop(1,'#02130fde');c.fillStyle=shade;c.fillRect(0,0,w,h);if(reduced)return;
 for(let i=0;i<4;i++){const x=w*(.15+i*.28)+Math.sin(at/7000+i)*25,y=h*(.18+i*.21),mist=c.createRadialGradient(x,y,0,x,y,w*.43);mist.addColorStop(0,'#7adab70b');mist.addColorStop(1,'#7adab700');c.fillStyle=mist;c.fillRect(x-w*.43,y-w*.43,w*.86,w*.86)}
}
function arena(c,r,g,elapsed,at,reduced){const R=g.radius,o=project523(r,0,0),s=r.scale;
 c.fillStyle='#001a1699';ellipse(c,o.x,o.y+28,R*s*1.03,R*s*.78);c.fill();
 const edge=c.createLinearGradient(0,o.y,0,o.y+24);edge.addColorStop(0,'#806f43');edge.addColorStop(.2,'#c5a565');edge.addColorStop(.35,'#263831');edge.addColorStop(1,'#091713');c.fillStyle=edge;ellipse(c,o.x,o.y+16,R*s,R*s*.78);c.fill();
 world(c,r,()=>{c.save();c.beginPath();c.arc(0,0,R,0,TAU);c.clip();floorImage(c,r);c.restore();c.strokeStyle='#e1c484';c.lineWidth=.065;c.beginPath();c.arc(0,0,R-.035,0,TAU);c.stroke();if(R<9){c.strokeStyle='#080f0dd9';c.lineWidth=.07;for(let i=0;i<35;i++){const a=i/35*TAU,x=Math.cos(a)*R,y=Math.sin(a)*R;c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(a+.2)*(.06+i%4*.04),y-Math.sin(a+.2)*(.06+i%4*.04));c.stroke()}}
 });
 rupture535(c,r,g,elapsed,at,reduced,{world,floor:floorImage,next:nextShrink523,radius:radius523,warning:C.warning});
}

function gem(c,r,v,at,reduced){const p=project523(r,v.x,v.y),q=(v.value===3?4.3:3.1)*r.camera.zoom,bob=reduced?0:Math.sin(at/290+v.id)*1.4;c.fillStyle=v.value===3?'#eab74525':'#60ffd929';ellipse(c,p.x,p.y+2,q*1.7,q*.48);c.fill();c.save();c.translate(p.x,p.y-5+bob);c.shadowColor=v.value===3?'#ffd564':'#4affd9';c.shadowBlur=6;c.fillStyle=v.value===3?'#efc575':'#6deccc';c.beginPath();c.moveTo(0,-q*1.7);c.lineTo(q,0);c.lineTo(0,q*1.7);c.lineTo(-q,0);c.closePath();c.fill();c.shadowBlur=0;c.fillStyle='#fff5c9';c.beginPath();c.moveTo(0,-q*1.7);c.lineTo(0,q);c.lineTo(-q,0);c.closePath();c.fill();c.restore()}
function players(c,r,g,poses,elapsed,at,reduced){for(const p of poses){if(!p.alive)continue;const pos=project523(r,p.x,p.y),rad=body523(p)*r.scale,color=playerColor499(p).hex;c.fillStyle='#0008';ellipse(c,pos.x,pos.y+2,rad*1.1,rad*.45);c.fill();c.strokeStyle=color;c.lineWidth=2;ellipse(c,pos.x,pos.y,rad*1.2,rad*.56);c.stroke();
 const q=p.charging?chargeRatio535(p):0;
 if(p.magnetUntil>elapsed){magneticField535(c,pos,rad,C.magnetRadius*r.scale,at,reduced);item535(c,r.items,'magnet',pos.x-rad*1.8,pos.y-rad*2,19)}
 if(p.anchor535){c.save();c.strokeStyle='#e5c676';c.lineWidth=1.3;ellipse(c,pos.x,pos.y,rad*1.48,rad*.7);c.stroke();for(let i=0;i<4;i++){const a=i*TAU/4;c.fillStyle='#f5d688';c.fillRect(pos.x+Math.cos(a)*rad*1.48-1.5,pos.y+Math.sin(a)*rad*.7-1.5,3,3)}c.restore();item535(c,r.items,'brace',pos.x+rad*1.8,pos.y-rad*1.9,20)}
 if(p.charging){const aim=project523(r,p.x+p.fx*dashDistance527(p),p.y+p.fy*dashDistance527(p));guide535(c,pos,aim,color,rad,q,at,reduced);chargeAura535(c,pos,rad,color,q,level535(p),at,reduced)}
 if(p.attackUntil>elapsed){for(let i=3;i>=1;i--){c.save();c.globalAlpha=.12*(4-i);const back=project523(r,p.x-p.dx*i*.55,p.y-p.dy*i*.55);c.strokeStyle=color;c.lineWidth=rad*(1.3-i*.2);c.beginPath();c.moveTo(back.x,back.y);c.lineTo(pos.x,pos.y);c.stroke();c.restore()}}
 if(p.braceUntil>elapsed){c.strokeStyle='#ffedaf';c.lineWidth=3;c.beginPath();c.arc(pos.x,pos.y-12,rad*1.6,Math.PI,TAU);c.stroke()}
 const speed=Math.hypot(p.vx,p.vy,p.kx,p.ky);if(speed>1&&!reduced){c.fillStyle='#d7cba13a';for(let i=0;i<3;i++){const age=((at/300+i*.3)%1);ellipse(c,pos.x-(p.vx+p.kx)*age*2.2+Math.sin(i+at/900)*3,pos.y-(p.vy+p.ky)*age*1.7,1+age*4,.5+age*2);c.fill()}}
 // Off-screen opponents remain visible even when the camera follows the player.
 const margin=20,limitY=r.height-128;if(pos.x<margin||pos.x>r.width-margin||pos.y<margin||pos.y>limitY){const x=clamp(pos.x,margin,r.width-margin),y=clamp(pos.y,margin,limitY),ang=Math.atan2(pos.y-y,pos.x-x);c.save();c.translate(x,y);c.rotate(ang);c.fillStyle=color;c.strokeStyle='#03130d';c.lineWidth=2;c.beginPath();c.moveTo(8,0);c.lineTo(-5,-6);c.lineTo(-5,6);c.closePath();c.fill();c.stroke();c.restore()}
 }}
export function paint523(r,g,poses,at,reduced=false){if(!r.width)return;camera(r,g,poses,at,reduced);const c=r.ctx,elapsed=g.phase==='result'?g.elapsed:Math.max(0,at-g.startAt);c.setTransform(r.dpr,0,0,r.dpr,0,0);background(c,r,at,reduced);arena(c,r,g,elapsed,at,reduced);
 if(r.destination&&g.phase==='play'){const p=project523(r,r.destination.x,r.destination.y);c.strokeStyle='#fff0b899';c.lineWidth=1;ellipse(c,p.x,p.y,8,5);c.stroke();c.fillStyle='#ffdf96';ellipse(c,p.x,p.y,2,1.5);c.fill()}
 for(const v of g.crystals)gem(c,r,v,at,reduced);
 for(const v of g.pickups??[]){const p=project523(r,v.x,v.y),age=elapsed-v.born,ink=v.type==='brace'?'#f6cb79':'#9bffe2';c.save();c.globalAlpha=v.expires-elapsed<3000?(reduced?.65:.6+.25*Math.sin(at/160)):1;if(age<1800){const beam=c.createLinearGradient(0,p.y-90,0,p.y);beam.addColorStop(0,ink+'00');beam.addColorStop(1,ink+'65');c.fillStyle=beam;c.fillRect(p.x-10,p.y-90,20,90)}c.fillStyle='#041c19b0';ellipse(c,p.x,p.y,13,5);c.fill();c.strokeStyle=ink+'c0';c.lineWidth=.9;ellipse(c,p.x,p.y,15,6);c.stroke();item535(c,r.items,v.type,p.x,p.y-19+(reduced?0:Math.sin(at/500+v.id)*2),42,reduced?0:Math.sin(at/1000)*.045);c.restore()}

 players(c,r,g,poses,elapsed,at,reduced);
 for(const e of g.events){const age=elapsed-e.at;if(age<0||age>1100)continue;const t=age/1100,p=project523(r,e.x??0,e.y??0);c.save();c.globalAlpha=1-t;if(e.type==='chargeFull'){const who=poses.find(v=>v.playerId===e.playerId);if(who?.alive&&who.charging)fullFlash535(c,project523(r,who.x,who.y),age,body523(who)*r.scale,reduced)}if(['hit','grow','brace','magnet','anchor','guardBreak'].includes(e.type)){c.strokeStyle=e.type==='magnet'?'#a2ffe1':e.type==='grow'?'#99edcd':'#ffe4a0';c.lineWidth=3*(1-t)+.5;ellipse(c,p.x,p.y,8+t*r.scale*2.6,4+t*r.scale*1.45);c.stroke();if(['hit','guardBreak'].includes(e.type)&&!reduced)for(let i=0;i<12;i++){const a=i*TAU/12;c.strokeStyle=i%2?'#ffbb68':'#fff4c5';c.beginPath();c.moveTo(p.x+Math.cos(a)*t*30,p.y+Math.sin(a)*t*22);c.lineTo(p.x+Math.cos(a)*(t*45+3),p.y+Math.sin(a)*(t*32+3));c.stroke()}if(e.type==='grow'){c.font='bold 11px system-ui';c.fillStyle='#ecffe5';c.textAlign='center';c.fillText('Lv.'+level535(poses.find(v=>v.playerId===e.playerId)??{power:0})+' UP',p.x,p.y-42-t*15)}}c.restore()}
 if(!reduced){c.fillStyle='#c8f3b95a';for(let i=0;i<14;i++)c.fillRect((i*67+at/180)%r.width,r.height-(i*91+at/100)%r.height,1.3,1.3)}
}
