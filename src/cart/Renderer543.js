import {CART543 as C,clamp543} from './Rules543.js';
import {course544,GOLD544,parkingBonus544} from './Courses544.js';
import {playerColor499} from '../party/PartyColors499.js';
import {direction548,sling548,launch548} from './Craft548.js';
const images={};function art(name){if(!images[name]){const i=new Image();i.decoding='async';const folder={wax:'cart546',sale:'cart546',obstacle:'cart545'}[name]??'cart544';i.src=`./assets/${folder}/${name}.webp`;images[name]=i}return images[name]}
const ready=i=>i?.complete&&i.naturalWidth,mix=(a,b,t)=>a+(b-a)*t;
function text(c,s,x,y,size=12,color='#fff1c5'){c.font=`800 ${size}px "Noto Sans JP",sans-serif`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=3;c.strokeStyle='#184943';c.strokeText(s,x,y);c.fillStyle=color;c.fillText(s,x,y)}
export function point543(r,x,y){const depth=clamp543(y/C.edge,0,1.2),scale=1-depth*.56,front=r.width>r.height?.83:.91;return{x:r.width*.5+x/C.width*r.width*.82*scale,y:r.height*(front-y/C.edge*(front-.22)),scale}}
function band(r,c,from,to,fill,stroke){const a=point543(r,-C.width/2,from),b=point543(r,C.width/2,from),d=point543(r,-C.width/2,to),e=point543(r,C.width/2,to);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(d.x,d.y);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.2;c.stroke()}}
function line(r,c,x1,y1,x2,y2,color,width=1){const a=point543(r,x1,y1),b=point543(r,x2,y2);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
export function renderer543(canvas){return{canvas,ctx:canvas.getContext('2d',{alpha:false}),terrain:document.createElement('canvas'),track:art('track'),cart:art('cart'),wax:art('wax'),sale:art('sale'),crates:art('obstacle'),width:0,height:0,dpr:1,points:[],cacheBuilds:0}}
export function resize543(r,w,h,dpr=1){r.width=w;r.height=h;r.dpr=Math.min(1.5,dpr);r.canvas.width=Math.round(w*r.dpr);r.canvas.height=Math.round(h*r.dpr);r.key=null}
function background(r,g){const course=course544(g),variant=course.id==='wax'?r.wax:course.id==='sale'?r.sale:r.track,track=ready(variant)?variant:r.track,key=[r.width,r.height,r.dpr,track?.src,!!ready(track),!!ready(r.crates),course.id].join(':');if(r.key===key)return;r.key=key;r.cacheBuilds++;const c=r.terrain.getContext('2d');r.terrain.width=r.canvas.width;r.terrain.height=r.canvas.height;c.setTransform(r.dpr,0,0,r.dpr,0,0);c.fillStyle='#358d87';c.fillRect(0,0,r.width,r.height);
 // Build546: each wax course is one complete environment, including its polished
 // timber, continuous board joints and outdoor reflections. Never paste an opaque
 // material rectangle onto the road. Keep the original framing and world bounds.
 // While a variant loads (or if it fails), the original wooden road is still valid.
 if(ready(track))c.drawImage(track,0,track.naturalHeight*.2,track.naturalWidth,track.naturalHeight*.8,0,0,r.width,r.height);
 for(const z of course.zones){
  if(z.kind==='rug'){band(r,c,z.from,z.to,'#8e254bc9','#ffcd92');for(let side of [-1,1])line(r,c,side*3.9,z.from,side*3.9,z.to,'#f3c580',2);for(let y=z.from+.8;y<z.to;y+=1.9){for(let x of [-2,0,2]){const p=point543(r,x,y);text(c,'◆',p.x,p.y,8,'#f4d192')}}}
  if(z.kind==='boost'){band(r,c,z.from,z.to,'#286957ee','#ffed9b');for(let y=z.from+.25;y<z.to;y+=.55)line(r,c,-4.4,y,4.4,y,'#ffffff1c',1);for(let x of [-2.6,0,2.6]){line(r,c,x-.6,(z.from+z.to)/2-.4,x,(z.from+z.to)/2+.4,'#ffe589',3);line(r,c,x,(z.from+z.to)/2+.4,x+.6,(z.from+z.to)/2-.4,'#ffe589',3)}}
 }
 // Solid stacked freight crates; their footprint exactly matches collision bounds.
 for(const b of course.blocks){const front=b.y-b.h/2,back=b.y+b.h/2,a=point543(r,b.x-b.w/2,front),d=point543(r,b.x+b.w/2,front),e=point543(r,b.x+b.w/2,back),f=point543(r,b.x-b.w/2,back),lift=16*a.scale;
  c.fillStyle='#102d3566';c.beginPath();c.moveTo(a.x+3,a.y+5);c.lineTo(d.x+4,d.y+5);c.lineTo(e.x+3,e.y+5);c.lineTo(f.x+3,f.y+5);c.fill();
  c.fillStyle='#745134';c.fillRect(a.x,a.y-lift,d.x-a.x,lift);c.strokeStyle='#d5b47d';c.lineWidth=1;c.strokeRect(a.x,a.y-lift,d.x-a.x,lift);
  c.fillStyle='#ba8a53';c.beginPath();c.moveTo(a.x,a.y-lift);c.lineTo(d.x,d.y-lift);c.lineTo(e.x,e.y-lift);c.lineTo(f.x,f.y-lift);c.closePath();c.fill();
  if(ready(r.crates)){const width=(d.x-a.x)*1.055,height=width*r.crates.naturalHeight/r.crates.naturalWidth;c.drawImage(r.crates,(a.x+d.x-width)/2,a.y-height*.86,width,height)}
  text(c,'搬入中 · 壁で回り込め',r.width/2,a.y+10,9,'#ffe3a0');
 }
 // Brass inlay sits in the timber. No parking letters or painted lane grid.
 const near=point543(r,0,GOLD544.from),far=point543(r,0,GOLD544.to),glaze=c.createLinearGradient(0,far.y,0,near.y);
 glaze.addColorStop(0,'#ffd37716');glaze.addColorStop(.5,'#fff1b62b');glaze.addColorStop(1,'#b8873d16');
 band(r,c,GOLD544.from,GOLD544.to,glaze,'#9b753c');
 for(const y of [GOLD544.from,GOLD544.to]){line(r,c,-4.4,y,4.4,y,'#fff0b3',1.6);line(r,c,-4.4,y-.08,4.4,y-.08,'#815b2e99',.7)}
 for(const x of [-4.28,4.28])for(const y of [GOLD544.from+.17,GOLD544.to-.17]){const p=point543(r,x,y);c.fillStyle='#f4dba1';c.beginPath();c.moveTo(p.x,p.y-2);c.lineTo(p.x+2,p.y);c.lineTo(p.x,p.y+2);c.lineTo(p.x-2,p.y);c.fill()}
 // A physical dock edge remains legible without a hazard label or warning tape.
 band(r,c,29.63,30,'#775939');line(r,c,-4.4,30,4.4,30,'#fff0be',1.7);line(r,c,-4.4,29.63,4.4,29.63,'#4b392d',2);
 for(let x=-4;x<=4;x+=1){const p=point543(r,x,29.79);c.fillStyle='#503d28';c.fillRect(p.x-1,p.y-1,2,2);c.fillStyle='#efdaaa';c.fillRect(p.x-1,p.y-1,1,1)}
 for(const y of [10,18,25])for(const side of [-1,1])line(r,c,side*4.2,y,side*4.4,y,'#f4d6a099',1.2);
}
function groceries(c,x,y,age,seed,large=false){const seconds=age/1000;for(let i=0;i<7;i++){const a=(i*2.4+seed)*1.7,speed=22+i%3*17,dx=Math.cos(a)*speed*seconds,dy=-Math.abs(Math.sin(a))*70*seconds+70*seconds*seconds;c.save();c.translate(x+dx,y+dy);c.rotate(a+seconds*(i%2?5:-5));c.fillStyle=['#f08037','#d9503e','#83b45d','#ecc58b'][i%4];c.beginPath();c.ellipse(0,0,large?3.5:2.8,i%4===3?7:3.5,0,0,Math.PI*2);c.fill();c.fillStyle='#337a4e';c.fillRect(-1,-5,2,3);c.restore()}}
export function paint543(r,g,selfId,u,at){if(!r.width||!r.height||!g.players.length)return;const c=r.ctx;background(r,g);
 const live=g.players.filter(p=>p.fallenAt==null),low=Math.min(...live.map(p=>p.y),30),high=Math.max(...live.map(p=>p.y),0),follow=g.players.every(p=>p.launched)&&live.length&&g.phase!=='countdown',weight=follow?clamp543((low-4)/18,0,1):0;
 const targetZoom=1+weight*.74,targetFocus=mix(r.height*.5,(point543(r,0,Math.min(31,high+2)).y+point543(r,0,Math.max(0,low-2)).y)/2,weight);
 if(r.round!==g.round){r.round=g.round;r.zoom=1;r.focus=r.height*.5}
 r.zoom=mix(r.zoom??1,targetZoom,u.reduced?1:.09);r.focus=mix(r.focus??r.height*.5,targetFocus,u.reduced?1:.09);
 const zoom=r.zoom,tx=r.width*(1-zoom)/2,ty=clamp543(r.height*.5-r.focus*zoom,r.height*(1-zoom),0),elapsed=g.phase==='play'?g.elapsed+clamp543(at-g.serverAt,0,130):g.elapsed,t=clamp543((performance.now()-(u.receivedAt??0))/100,0,1);
 c.setTransform(r.dpr*zoom,0,0,r.dpr*zoom,tx*r.dpr,ty*r.dpr);c.drawImage(r.terrain,0,0,r.width,r.height);r.points=[];
 const self=g.players.find(p=>p.playerId===selfId);
 if(g.phase==='play'&&self&&!self.launched&&u.pull547?.active&&!u.pending547){
  const {power,angle}=u.pull547,a=point543(r,self.x,self.y),b=point543(r,self.x+Math.sin(angle),self.y+Math.cos(angle));
  const size=clamp543(r.width*.22,62,110)*a.scale,direction=Math.atan2(b.y-a.y,b.x-a.x),color=playerColor499(self).hex;
  const visual={x:a.x,y:a.y,size,direction,power,color,tint:playerColor499(self).tint,at:performance.now(),reduced:u.reduced,width:r.width,height:r.height};
  direction548(c,visual);sling548(c,visual);
 }

 for(const p of [...g.players].sort((a,b)=>b.y-a.y)){
  const old=u.previous?.round===g.round?u.previous.players.find(q=>q.seat===p.seat):null,x=old&&old.launched===p.launched?mix(old.x,p.x,t):p.x,y=old&&old.launched===p.launched?mix(old.y,p.y,t):p.y,v=point543(r,x,y),fall=p.fallenAt!=null?clamp543((elapsed-p.fallenAt)/1200,0,1):0,speed=Math.hypot(p.vx,p.vy),hit=elapsed-p.lastHitAt<300;
  const pulling=p.playerId===selfId&&!p.launched&&u.pull547?.active,launchAge=p.launchAt==null?Infinity:elapsed-p.launchAt;
  const size=clamp543(r.width*.22,62,110)*v.scale,alpha=1-fall,angle=fall?(u.reduced?0:fall*3.8):(p.playerId===selfId&&!p.launched&&u.pull547?.active?u.pull547.angle:p.bodyAngle545??p.aim545??0)*.6+(hit&&!u.reduced?Math.sin(elapsed/27)*.13:0),scale=(1-fall*.55)*(pulling?1+(u.pull547.power??0)*.035:1),color=playerColor499(p).hex;
  const footprint=point543(r,C.radius,y).x-r.width/2;
  const forward=point543(r,x+Math.sin(p.bodyAngle545??0),y+Math.cos(p.bodyAngle545??0)),direction=Math.atan2(forward.y-v.y,forward.x-v.x);
  launch548(c,{x:v.x,y:v.y,size,direction,color,age:launchAge,power:p.power??0,reduced:u.reduced});
  if(speed>1&&!fall&&!u.reduced){c.save();c.translate(v.x,v.y);c.rotate(direction);c.globalAlpha=clamp543(speed/18,0,.32);const trail=c.createLinearGradient(-size*.15,0,-size*.6-speed*1.8,0);trail.addColorStop(0,p.boosted?'#ffe5a2':color);trail.addColorStop(1,'#fff6cd00');c.fillStyle=trail;for(const side of [-1,1]){c.beginPath();c.moveTo(-size*.15,side*size*.25-1.6);c.lineTo(-size*.6-speed*1.8,side*size*.25);c.lineTo(-size*.15,side*size*.25+1.6);c.fill()}c.restore()}
  if(!u.reduced&&launchAge>=0&&launchAge<420){const kick=Math.sin(launchAge/420*Math.PI*3)*(1-launchAge/420)*3;v.x+=Math.cos(direction)*kick;v.y+=Math.sin(direction)*kick}
  if(!u.reduced)v.y+=fall*fall*90-Math.sin(fall*Math.PI)*45;
  c.save();c.globalAlpha=alpha;c.translate(v.x,v.y);c.rotate(angle);c.scale(scale,scale);
  c.beginPath();c.ellipse(0,size*.16,footprint+3,Math.max(4,size*.13),0,0,Math.PI*2);c.fillStyle=parkingBonus544(p)?'#ffdf6599':'#143c3977';c.fill();c.strokeStyle=parkingBonus544(p)?'#fff0a2':color;c.lineWidth=p.playerId===selfId?2.8:2;c.stroke();
  if(ready(r.cart))c.drawImage(r.cart,-size*.5,-size*.68,size,size);
  // Player-color flag stays visible even when the passenger is inside the basket.
  c.fillStyle=color;c.fillRect(size*.22,-size*.37,size*.17,size*.11);c.fillStyle='#fff1ca';c.fillRect(size*.21,-size*.39,1,size*.29);
  c.restore();r.points.push({seat:p.seat,x:v.x*zoom+tx,y:(v.y-size*.07)*zoom+ty,scale:v.scale*scale*zoom,size,angle,alpha,visible:fall<1});
 }
 for(const e of g.events){const age=elapsed-e.at;if(age<0||age>1100||!['bump','fall','boost','park','block'].includes(e.type))continue;const p=point543(r,e.x,e.y);c.save();c.globalAlpha=1-age/1100;
  if(e.type==='block')text(c,'搬入中です！',p.x,p.y-20-age/60,11);
  if(e.type==='bump'){if(!u.reduced){groceries(c,p.x,p.y-15,age,e.id);c.strokeStyle='#fff1b2';c.lineWidth=2;for(let i=0;i<9;i++){const a=i*Math.PI/4.5,dist=7+age/30;c.beginPath();c.moveTo(p.x+Math.cos(a)*dist,p.y+Math.sin(a)*dist);c.lineTo(p.x+Math.cos(a)*(dist+5),p.y+Math.sin(a)*(dist+5));c.stroke()}}text(c,'ガシャーン！',p.x,p.y-26-age/60,13)}
  if(e.type==='fall'){if(!u.reduced)groceries(c,p.x,p.y,age,e.id,true);text(c,'返品できませーん！',p.x,p.y-25-age/45,12,'#fff0c6')}
  if(e.type==='boost')text(c,'速達！！',p.x,p.y-26-age/50,12,'#fff1a7');
  if(e.type==='park'&&e.perfect){text(c,'神駐車！ ＋50',p.x,p.y-30-age/65,13,'#fff4a3');if(!u.reduced)for(let i=0;i<8;i++){const a=i*Math.PI/4;text(c,'✦',p.x+Math.cos(a)*(18+age/60),p.y+Math.sin(a)*(18+age/60),8,'#ffe28a')}}c.restore();
 }
 // Screen-space labels remain readable as the camera moves closer to the action.
 c.setTransform(r.dpr,0,0,r.dpr,0,0);
 for(const [y,label,tint]of [[28.1,'＋50','#ffe6a7']]){const p=point543(r,4.4,y),x=clamp543(p.x*zoom+tx+19,26,r.width-24),sy=p.y*zoom+ty;if(sy<r.height*.12||sy>r.height-18)continue;c.fillStyle='#173e34ed';c.beginPath();c.roundRect(x-18,sy-8,36,16,3);c.fill();c.strokeStyle='#d8b777';c.lineWidth=.8;c.stroke();text(c,label,x,sy,8,tint)}
 return{elapsed};
}
