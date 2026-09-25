import{drawMissiles500}from'./Missiles500.js';
import{netCell499}from'./NetColor499.js';
// Build497 presentation only: physical cast-net sprites, water impact and localized danger.
// The shared movement, hit areas, timing and scoring still belong to Rules/Scene496.
import{imageCell492}from'./Scene492.js';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ready=im=>im?.complete&&im.naturalWidth;
function round(ctx,x,y,w,h,r=9){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function fill(ctx,x,y,w,h,color,r=9){ctx.fillStyle=color;round(ctx,x,y,w,h,r);ctx.fill()}
function gradient(ctx,x,y,h,top,bottom){const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,top);g.addColorStop(1,bottom);return g}
function label(ctx,value,x,y,size,color='#fff5d6',weight=800){ctx.fillStyle=color;ctx.font=`${weight} ${size}px system-ui,sans-serif`;ctx.textAlign='center';ctx.fillText(value,x,y)}
function glow(ctx,x,y,rx,ry,color,alpha){ctx.save();ctx.globalAlpha=clamp(alpha);ctx.translate(x,y);ctx.scale(1,ry/rx);const g=ctx.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,color);g.addColorStop(1,color.slice(0,7)+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill();ctx.restore()}
// Small cloth tabs on the nets identify the teammate, without a screen-spanning guide.
function ribbon(ctx,x,y,color,size=8){ctx.save();ctx.translate(x,y);ctx.fillStyle='#173e3b88';ctx.beginPath();ctx.moveTo(1,2);ctx.lineTo(size+2,size*.55+2);ctx.lineTo(size*.6+2,size*1.4+2);ctx.lineTo(-size*.3+1,size*.9+2);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(size,size*.55);ctx.lineTo(size*.55,size*1.25);ctx.lineTo(size*.25,size*.85);ctx.lineTo(-size*.3,size*.95);ctx.closePath();ctx.fill();ctx.fillStyle='#ffecb4';ctx.beginPath();ctx.arc(0,0,2,0,Math.PI*2);ctx.fill();ctx.restore()}
function net(ctx,u,index,x,y,size,color,alpha=1,rotation=0){ctx.save();ctx.globalAlpha=clamp(alpha);ctx.translate(x,y);ctx.rotate(rotation);if(ready(u.netArt497)){if(!netCell499(ctx,u,index,0,0,size,color))imageCell492(ctx,u.netArt497,index,0,0,size);}else if(ready(u.props))imageCell492(ctx,u.props,0,0,0,size);ribbon(ctx,size*.23,size*.15,color,Math.max(5,size*.105));ctx.restore()}
function splash(ctx,u,x,y,age,size,reduced=false,color='#dbfbff'){if(age<0||age>650)return;const t=reduced?.35:age/650,alpha=reduced?.6:clamp(1-t);ctx.save();ctx.globalAlpha=alpha;
 if(ready(u.netArt497))imageCell492(ctx,u.netArt497,3,x,y-size*.10,size*(.65+t*.65));
 if(!reduced){for(let i=0;i<8;i++){const a=i*Math.PI/4+.22,dx=Math.cos(a)*size*(.18+t*.55),dy=Math.sin(a)*size*(.10+t*.25)-Math.sin(t*Math.PI)*size*.28;ctx.fillStyle=i%3?color:'#ffffff';ctx.beginPath();ctx.ellipse(x+dx,y+dy,1.7*(1-t)+.7,2.5*(1-t)+1,a,0,Math.PI*2);ctx.fill()}}
 ctx.restore()}
export function cast497(ctx,u,seat,point,age,w,h,colors,crew){if(age<0||age>900)return;const color=colors[seat]??colors[0],origin=crew[seat]??crew[0],flight=u.reduced?0:260;
 if(age<flight){const t=clamp(age/flight),ease=1-(1-t)**2,x=origin.x*w+(point.x-origin.x*w)*ease,y=(origin.y-.045)*h+(point.y-(origin.y-.045)*h)*ease-Math.sin(t*Math.PI)*Math.min(55,h*.09);net(ctx,u,0,x,y,42+20*t,color,1,(1-t)*(seat%2?.4:-.4));return}
 const impact=age-flight;splash(ctx,u,point.x,point.y,impact,64,u.reduced);net(ctx,u,1,point.x,point.y,66+Math.sin(clamp(impact/260)*Math.PI)*9,color,clamp(1-impact/560)*.9);
}
function badge(ctx,e){const s=e.size,x=e.path500===1&&e.kind===3?-19:s*.18,y=e.path500===1&&e.kind===3?Math.max(30-e.y,s*.05):-s*.43,w=e.path500===1&&e.kind===3?38:25,h=24,danger=e.eta<2500||e.path500===1&&e.kind===3;ctx.shadowColor='#07302d88';ctx.shadowBlur=4;ctx.shadowOffsetY=2;fill(ctx,x,y,w,h,gradient(ctx,x,y,h,danger?'#c96643':'#376658',danger?'#672a20':'#143d37'),7);ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle=danger?'#ffe0a0':'#cfdbb2';ctx.lineWidth=.9;round(ctx,x+.5,y+.5,w-1,h-1,7);ctx.stroke();label(ctx,String(e.hp),x+w/2,y+17,15)}
function houseHealth(ctx,g,w,h,danger,now,reduced){const x=w*.5,y=h*.743,hp=g.hp<=30?'#ff9169':g.hp<=60?'#ffe18a':'#a6f4cb';
 if(danger||g.hp<=30)glow(ctx,x,h*.837,w*.23,h*.12,'#ff744d',reduced?.17:.14+.05*Math.sin(now/280));
 const width=Math.min(224,w*.59),left=x-width/2;ctx.save();ctx.shadowColor='#072b2fa0';ctx.shadowBlur=8;ctx.shadowOffsetY=3;fill(ctx,left-8,y-21,width+16,46,gradient(ctx,left,y-21,46,'#284e44f2','#102c29f5'),11);ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle=g.hp<=30?'#eeae74':'#baad75';ctx.lineWidth=1;round(ctx,left-7.5,y-20.5,width+15,45,10);ctx.stroke();label(ctx,`みんなの家  ${g.hp} / 100`,x,y-4,12,hp);
 fill(ctx,left,y+3,width,10,'#071e1c',5);if(g.hp>0){fill(ctx,left+1,y+4,Math.max(2,(width-2)*g.hp/100),8,gradient(ctx,left,y+4,8,hp,g.hp<=30?'#c95136':'#4da777'),4);fill(ctx,left+3,y+4,Math.max(1,(width-6)*g.hp/100),2,'#efffc366',2)}ctx.restore();
 if(g.hp<=30){label(ctx,'家がピンチ！',x,h*.80,11,'#ffe0b5')}
}
function banner(ctx,w,h,text){const bw=Math.min(290,w*.72),x=(w-bw)/2,y=h*.46;ctx.save();ctx.shadowColor='#163c3890';ctx.shadowBlur=16;ctx.shadowOffsetY=5;fill(ctx,x,y,bw,38,gradient(ctx,x,y,38,'#315a49f5','#13392ef5'),12);ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle='#efd59a';ctx.lineWidth=1.2;round(ctx,x+.6,y+.6,bw-1.2,36.8,11);ctx.stroke();label(ctx,text,w/2,y+25,Math.min(20,w*.043),'#fff0b2');ctx.restore()}
export function draw497(canvas,g,u,at,now,layout,colors,crew,pointFor){
 const ctx=canvas?.getContext('2d'),w=canvas?.clientWidth,h=canvas?.clientHeight;if(!ctx||!w||!h)return;const dpr=Math.min(globalThis.devicePixelRatio??1,1.5);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 if(ready(u.background)){if(!u.bgCache541||u.bgCache541.width!==canvas.width||u.bgCache541.height!==canvas.height||u.bgSource541!==u.background){u.bgCache541=document.createElement('canvas');u.bgCache541.width=canvas.width;u.bgCache541.height=canvas.height;u.bgCache541.getContext('2d').drawImage(u.background,0,0,canvas.width,canvas.height);u.bgSource541=u.background}ctx.drawImage(u.bgCache541,0,0,w,h);}else if(!g.rules541){ctx.fillStyle='#285d53';ctx.fillRect(0,0,w,h)}
 // Soft contact-light replaces the flat colored foot rings. No boundary or trajectory lines.
 for(const p of g.players??[]){const a=crew[p.seat];glow(ctx,a.x*w,a.y*h,w*.07,h*.021,colors[p.seat],.30)}
 const danger=layout.some(e=>e.eta<2500);if(danger)glow(ctx,w/2,h*.70,w*.18,h*.065,'#ff9c66',.12);
 for(const e of [...layout].sort((a,b)=>(a.path500===1&&a.kind===3?-1:0)-(b.path500===1&&b.kind===3?-1:0)||a.y-b.y||a.id-b.id)){const {x,y,size:s}=e;ctx.save();ctx.translate(x,y);
  glow(ctx,0,s*.29,s*.4,s*.13,'#124b54',.35);
  // A short foam wake stays with its creature instead of connecting it to another object.
  if(!u.reduced){ctx.fillStyle='#ddffff77';for(let i=0;i<3;i++){const t=((now/800+i/3+e.id*.13)%1),dx=(i-1)*s*.10;ctx.globalAlpha=(1-t)*.55;ctx.beginPath();ctx.ellipse(dx,-s*(.16+t*.23),s*(.10+t*.025),1.5,0,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}
  if(e.eta<2500)glow(ctx,0,s*.1,s*.48,s*.32,'#ff7348',.25);
  if(ready(u.atlas))imageCell492(ctx,u.atlas,e.kind,0,0,s);else{ctx.fillStyle=['#f96840','#99b740','#a3b66b','#d19eef'][e.kind];ctx.beginPath();ctx.arc(0,0,s*.30,0,Math.PI*2);ctx.fill()}
  if(e.slowUntil>at){net(ctx,u,1,0,s*.14,s*.92,colors[e.snareSeat]??colors[0],.65);fill(ctx,-24,s*.44,48,16,'#164538ed',6);label(ctx,'足止め中',0,s*.44+12,9,'#ecffe6')}
  badge(ctx,e);
  if(e.path541===1&&e.kind===3){const by=s*.05+30;fill(ctx,-61,by,122,22,'#163c38ed',6);fill(ctx,-55,by+15,110,4,'#092c27',2);fill(ctx,-55,by+15,110*e.hp/e.maxHp,4,at<(e.breakUntil541??0)?'#a0f8e8':'#f5be78',2);label(ctx,at<(e.breakUntil541??0)?'BREAK！ 網を重ねろ！':'巨大将軍 · ２人連携でBREAK',0,by+11,8);}else if(e.path500===1&&e.kind===3){fill(ctx,-67,s*.05+27,134,21,'#6b3227ee',8);label(ctx,'巨大将軍 · ミサイル注意',0,s*.05+42,10,'#fff1c6');}
  if(e.eta<1700){fill(ctx,-24,s*.39,48,17,'#903e26f0',7);label(ctx,'家が危険',0,s*.39+12,9,'#fff1c6')}else if(u.teach&&e.id===layout[0]?.id){fill(ctx,-29,s*.4,58,20,'#f6e6a8',7);label(ctx,'タップ！',0,s*.4+14,11,'#27422f')}
  ctx.restore();
 }
 houseHealth(ctx,g,w,h,danger,now,u.reduced);
 if(g.hp<=60){ctx.strokeStyle='#552c1688';ctx.lineWidth=2;for(const path of [[[.43,.81],[.48,.84],[.46,.87]],[[.56,.80],[.53,.84],[.55,.87]]].slice(0,g.hp<=30?2:1)){ctx.beginPath();path.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.stroke()}}
 if(g.hp<=30){const grad=ctx.createRadialGradient(w/2,h/2,w*.22,w/2,h/2,h*.8);grad.addColorStop(0,'#a7251600');grad.addColorStop(1,'#a7251644');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h)}
 const effects=[...(u.effects??[])];if(u.preview&&now-u.preview.localAt<220&&!effects.some(e=>e.enemyId===u.preview.enemyId&&e.seat===u.seat))effects.push(u.preview);
 const mega=effects.findLast(e=>e.kind==='mega'&&now-e.localAt>=0&&now-e.localAt<1300);
 for(const e of effects){const age=now-e.localAt;if(age<0||age>1300)continue;const point=e.kind==='intercept'?{x:e.x*w,y:e.y*h}:e.point??(e.progress!=null?pointFor(e,e.progress,w,h):null);
  if(e.kind==='mega')continue;
  if(e.kind==='breach'||e.kind==='missileImpact'){splash(ctx,u,w*.5,h*.807,age,85,u.reduced,'#ffe9cc');fill(ctx,w*.34,h*.84,w*.32,25,'#843721ee',8);label(ctx,'家に −'+e.damage,w/2,h*.84+18,14);continue}
  if(!point||!['hit','catch','stroke','intercept'].includes(e.kind))continue;
  // The shared cast has its own four-net animation, not 22 simultaneous ropes.
  if(e.mega&&mega)continue;
  cast497(ctx,u,e.seat,point,age,w,h,colors,crew);
  if((e.kind==='catch'||e.kind==='intercept')&&age>=240&&age<1100){const t=clamp((age-240)/850);splash(ctx,u,point.x,point.y,age-240,e.teamwork?86:62,u.reduced);net(ctx,u,2,point.x,point.y-(u.reduced?8:t*30),58-t*9,colors[e.seat],Math.min(1,(1-t)*2));if(e.teamwork)glow(ctx,point.x,point.y-10,42,32,'#ffebb0',.25*(1-t))}
 }
 if(g.rules500===1)drawMissiles500(ctx,g,at,now,w,h,u.reduced);
 if(mega){const age=now-mega.localAt;for(const p of g.players)cast497(ctx,u,p.seat,{x:w*(p.seat%2?.67:.33),y:h*(p.seat<2?.32:.55)},Math.min(age,850),w,h,colors,crew);
  if(age>=230){const size=Math.min(w*.78,340)*(u.reduced?1:.76+.24*Math.sin(clamp((age-230)/720)*Math.PI)),alpha=clamp((1300-age)/380);glow(ctx,w/2,h*.42,size*.53,size*.25,'#fff2b2',alpha*.25);net(ctx,u,age>880?2:1,w/2,h*.42,size,'#fff1a6',alpha*.86);splash(ctx,u,w/2,h*.56,Math.max(0,age-350),w*.53,u.reduced);}
  banner(ctx,w,h,`${mega.strength541??4}人合体！ 一網打尽！`);
 }
 if(g.rules541){const sweeps=effects.filter(e=>e.kind==='sweep541'&&now-e.localAt<500);for(const e of [...sweeps,...(u.stroke541?[{path:u.stroke541,localAt:now,seat:u.seat}]:[])]){if(!e.path?.length)continue;ctx.save();ctx.globalAlpha=Math.max(0,1-(now-e.localAt)/500);ctx.lineCap='round';ctx.lineJoin='round';for(const [width,color] of [[19,'#f6e29b22'],[5,'#17423cb0'],[2,'#fff1af']]){ctx.lineWidth=width;ctx.strokeStyle=color;ctx.beginPath();e.path.forEach((p,i)=>i?ctx.lineTo(p.x*w,p.y*h):ctx.moveTo(p.x*w,p.y*h));if(e.path.length===1){ctx.lineTo(e.path[0].x*w+.1,e.path[0].y*h)}ctx.stroke()}const q=e.path.at(-1);net(ctx,u,0,q.x*w,q.y*h,40,colors[e.seat],.85);ctx.restore()}}
 u.effects=(u.effects??[]).filter(e=>now-e.localAt<1300);
}
