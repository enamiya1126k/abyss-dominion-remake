import {CART543 as C,clamp543,forecast544} from './Rules543.js';
import {course544,GOLD544,parkingBonus544} from './Courses544.js';
import {playerColor499} from '../party/PartyColors499.js';
const images={};function art(name){if(!images[name]){const i=new Image();i.decoding='async';i.src=`./assets/cart544/${name}.webp`;images[name]=i}return images[name]}
const ready=i=>i?.complete&&i.naturalWidth,mix=(a,b,t)=>a+(b-a)*t;
function text(c,s,x,y,size=12,color='#fff1c5'){c.font=`800 ${size}px "Noto Sans JP",sans-serif`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=3;c.strokeStyle='#184943';c.strokeText(s,x,y);c.fillStyle=color;c.fillText(s,x,y)}
export function point543(r,x,y){const depth=clamp543(y/C.edge,0,1.2),scale=1-depth*.56;return{x:r.width*.5+x/C.width*r.width*.82*scale,y:r.height*(.91-y/C.edge*.69),scale}}
function band(r,c,from,to,fill,stroke){const a=point543(r,-C.width/2,from),b=point543(r,C.width/2,from),d=point543(r,-C.width/2,to),e=point543(r,C.width/2,to);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(d.x,d.y);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.2;c.stroke()}}
function line(r,c,x1,y1,x2,y2,color,width=1){const a=point543(r,x1,y1),b=point543(r,x2,y2);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
export function renderer543(canvas){return{canvas,ctx:canvas.getContext('2d',{alpha:false}),terrain:document.createElement('canvas'),track:art('track'),cart:art('cart'),width:0,height:0,dpr:1,points:[],cacheBuilds:0}}
export function resize543(r,w,h,dpr=1){r.width=w;r.height=h;r.dpr=Math.min(1.5,dpr);r.canvas.width=Math.round(w*r.dpr);r.canvas.height=Math.round(h*r.dpr);r.key=null}
function background(r,g){const course=course544(g),key=[r.width,r.height,r.dpr,!!ready(r.track),course.id].join(':');if(r.key===key)return;r.key=key;r.cacheBuilds++;const c=r.terrain.getContext('2d');r.terrain.width=r.canvas.width;r.terrain.height=r.canvas.height;c.setTransform(r.dpr,0,0,r.dpr,0,0);c.fillStyle='#358d87';c.fillRect(0,0,r.width,r.height);
 // Frame the generated coast around the playable road. Its visible edge matches y=30.
 if(ready(r.track))c.drawImage(r.track,0,r.track.naturalHeight*.2,r.track.naturalWidth,r.track.naturalHeight*.8,0,0,r.width,r.height);
 band(r,c,10,26.9,'#30574917');
 for(const z of course.zones){
  if(z.kind==='wax'){band(r,c,z.from,z.to,'#27c9e65f','#b8fcffb0');for(let y=z.from+.5;y<z.to;y+=1.6){line(r,c,-3.8,y,-1,y+.65,'#ecffff77',1);line(r,c,.9,y-.2,3.5,y+.3,'#b4fbff66',1)}for(let i=0;i<8;i++){const p=point543(r,(i%3-1)*2.5,z.from+(z.to-z.from)*(i+.5)/8);text(c,'✧',p.x,p.y,10,'#ecffff')}}
  if(z.kind==='rug'){band(r,c,z.from,z.to,'#8e254bc9','#ffcd92');for(let side of [-1,1])line(r,c,side*3.9,z.from,side*3.9,z.to,'#f3c580',2);for(let y=z.from+.8;y<z.to;y+=1.9){for(let x of [-2,0,2]){const p=point543(r,x,y);text(c,'◆',p.x,p.y,8,'#f4d192')}}}
  if(z.kind==='boost'){band(r,c,z.from,z.to,'#286957ee','#ffed9b');for(let y=z.from+.25;y<z.to;y+=.55)line(r,c,-4.4,y,4.4,y,'#ffffff1c',1);for(let x of [-2.6,0,2.6]){line(r,c,x-.6,(z.from+z.to)/2-.4,x,(z.from+z.to)/2+.4,'#ffe589',3);line(r,c,x,(z.from+z.to)/2+.4,x+.6,(z.from+z.to)/2-.4,'#ffe589',3)}}
 }
 // Golden stopping bay: both front and back of the cart's footprint must fit inside.
 band(r,c,GOLD544.from,GOLD544.to,'#ffdc5899','#fff3af');line(r,c,-4.4,GOLD544.from,4.4,GOLD544.from,'#fff2b2',2.2);line(r,c,-4.4,GOLD544.to,4.4,GOLD544.to,'#fff2b2',2.2);
 for(let x of [-2.2,0,2.2])line(r,c,x,GOLD544.from,x,GOLD544.to,'#fff5d788',1);
 const mid=point543(r,0,(GOLD544.from+GOLD544.to)/2);for(let x of [-3.3,-1.1,1.1,3.3])text(c,'P',point543(r,x,28.1).x,mid.y,11,'#fff4bf');
 band(r,c,29.55,30,'#3a2529');for(let x=-4.2;x<4.4;x+=.8)line(r,c,x,29.58,x+.35,30,'#ffd271',2);
 const edge=point543(r,0,30);text(c,'この先、海！',r.width/2,edge.y-13,10,'#fff0c8');
 for(const y of [10,18,25]){c.save();c.setLineDash([3,4]);line(r,c,-4.4,y,4.4,y,'#fff2d06b');c.restore()}
 for(let y=2;y<=5;y+=1.3){line(r,c,-.35,y,0,y+.45,'#fff0c4bc',2);line(r,c,0,y+.45,.35,y,'#fff0c4bc',2)}
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
 if(g.phase==='play'&&self&&!self.launched&&u.localCharge!=null){
  const power=Math.floor(clamp543((performance.now()-u.localCharge)/C.chargeTime,0,1)*100)/100,key=[g.round,self.seat,power].join(':');
  if(r.previewKey!==key){r.previewKey=key;r.preview=forecast544(g,self,power)}
  const predicted=r.preview,a=point543(r,self.x,self.y),b=point543(r,predicted.x,Math.min(31,predicted.y));
  c.save();c.setLineDash([4,5]);c.strokeStyle=predicted.fallen?'#ffa279':'#fffde8';c.lineWidth=1.8;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.setLineDash([]);c.fillStyle=predicted.perfect?'#ffe27088':'#fffce233';c.beginPath();c.ellipse(b.x,b.y,12*b.scale+4,7,0,0,Math.PI*2);c.fill();c.stroke();text(c,predicted.fallen?'海まで飛ぶ！':predicted.perfect?'金枠ねらい！':'停車の目安',b.x,b.y-17,10,predicted.fallen?'#ffd1af':'#ffffd8');c.restore();
 }

 for(const p of [...g.players].sort((a,b)=>b.y-a.y)){
  const old=u.previous?.round===g.round?u.previous.players.find(q=>q.seat===p.seat):null,x=old&&old.launched===p.launched?mix(old.x,p.x,t):p.x,y=old&&old.launched===p.launched?mix(old.y,p.y,t):p.y,v=point543(r,x,y),fall=p.fallenAt!=null?clamp543((elapsed-p.fallenAt)/1200,0,1):0,speed=Math.hypot(p.vx,p.vy),hit=elapsed-p.lastHitAt<300;
  const size=clamp543(r.width*.22,62,110)*v.scale,alpha=1-fall,angle=fall?(u.reduced?0:fall*3.8):Math.atan2(p.vx,p.vy||1)*.55+(hit&&!u.reduced?Math.sin(elapsed/27)*.13:0),scale=1-fall*.55,color=playerColor499(p).hex;
  const footprint=point543(r,C.radius,y).x-r.width/2;
  if(speed>1&&!fall&&!u.reduced){c.save();c.globalAlpha=clamp543(speed/18,0,.5);c.strokeStyle=p.boosted?'#ffe5a2':color;c.lineWidth=2;for(let side of [-1,1]){c.beginPath();c.moveTo(v.x+side*size*.26,v.y+size*.22);c.lineTo(v.x+side*size*.26-p.vx*2,v.y+size*.22+speed*2.2);c.stroke()}c.restore()}
  if(!u.reduced)v.y+=fall*fall*90-Math.sin(fall*Math.PI)*45;
  c.save();c.globalAlpha=alpha;c.translate(v.x,v.y);c.rotate(angle);c.scale(scale,scale);
  c.beginPath();c.ellipse(0,size*.16,footprint+3,Math.max(4,size*.13),0,0,Math.PI*2);c.fillStyle=parkingBonus544(p)?'#ffdf6599':'#143c3977';c.fill();c.strokeStyle=parkingBonus544(p)?'#fff0a2':color;c.lineWidth=p.playerId===selfId?2.8:2;c.stroke();
  if(ready(r.cart))c.drawImage(r.cart,-size*.5,-size*.68,size,size);
  // Player-color flag stays visible even when the passenger is inside the basket.
  c.fillStyle=color;c.fillRect(size*.22,-size*.37,size*.17,size*.11);c.fillStyle='#fff1ca';c.fillRect(size*.21,-size*.39,1,size*.29);
  if(p.charging&&!p.launched){const charge=p.playerId===selfId&&u.localCharge!=null?clamp543((performance.now()-u.localCharge)/C.chargeTime,0,1):.65;c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.arc(0,-size*.17,size*.46,-Math.PI/2,-Math.PI/2+charge*Math.PI*2);c.stroke()}
  c.restore();r.points.push({seat:p.seat,x:v.x*zoom+tx,y:(v.y-size*.07)*zoom+ty,scale:v.scale*scale*zoom,size,angle,alpha,visible:fall<1});
 }
 for(const e of g.events){const age=elapsed-e.at;if(age<0||age>1100||!['bump','fall','boost','park'].includes(e.type))continue;const p=point543(r,e.x,e.y);c.save();c.globalAlpha=1-age/1100;
  if(e.type==='bump'){if(!u.reduced){groceries(c,p.x,p.y-15,age,e.id);c.strokeStyle='#fff1b2';c.lineWidth=2;for(let i=0;i<9;i++){const a=i*Math.PI/4.5,dist=7+age/30;c.beginPath();c.moveTo(p.x+Math.cos(a)*dist,p.y+Math.sin(a)*dist);c.lineTo(p.x+Math.cos(a)*(dist+5),p.y+Math.sin(a)*(dist+5));c.stroke()}}text(c,'ガシャーン！',p.x,p.y-26-age/60,13)}
  if(e.type==='fall'){if(!u.reduced)groceries(c,p.x,p.y,age,e.id,true);text(c,'返品できませーん！',p.x,p.y-25-age/45,12,'#fff0c6')}
  if(e.type==='boost')text(c,'速達！！',p.x,p.y-26-age/50,12,'#fff1a7');
  if(e.type==='park'&&e.perfect){text(c,'神駐車！ ＋50',p.x,p.y-30-age/65,13,'#fff4a3');if(!u.reduced)for(let i=0;i<8;i++){const a=i*Math.PI/4;text(c,'✦',p.x+Math.cos(a)*(18+age/60),p.y+Math.sin(a)*(18+age/60),8,'#ffe28a')}}c.restore();
 }
 // Screen-space labels remain readable as the camera moves closer to the action.
 c.setTransform(r.dpr,0,0,r.dpr,0,0);
 for(const [y,label,tint]of [[14,'駐車エリア','#ecf8de'],[23.5,'奥ほど高得点','#ffedbe'],[28.1,'金枠 ＋50','#fff0a1']]){const p=point543(r,4.4,y),x=clamp543(p.x*zoom+tx+34,46,r.width-43),sy=p.y*zoom+ty;if(sy<r.height*.12||sy>r.height-18)continue;c.fillStyle='#133e36d9';c.beginPath();c.roundRect(x-39,sy-10,78,20,6);c.fill();text(c,label,x,sy,8,tint)}
 return{elapsed};
}
