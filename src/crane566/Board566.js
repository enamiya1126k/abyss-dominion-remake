import {LOOT566,dock566} from './Rules566.js';
import {color563} from '../party/Arcade563.js';
export const rotate566=(x,y,seat)=>{const a=seat*Math.PI/2;return{x:x*Math.cos(a)-y*Math.sin(a),y:x*Math.sin(a)+y*Math.cos(a)};};
export const unrotate566=(x,y,seat)=>rotate566(x,y,-seat);
const images={};
function art(name){if(!images[name]){const im=new Image();im.src=new URL('../../assets/crane566/'+name+'.webp',import.meta.url).href;images[name]=im;}return images[name];}
export function board566(canvas){return{canvas,ctx:canvas.getContext('2d'),width:0,height:0,points:[]};}
export function resize566(r,w,h,dpr=1){r.width=w;r.height=h;r.dpr=Math.min(dpr,2);r.canvas.width=Math.round(w*r.dpr);r.canvas.height=Math.round(h*r.dpr);r.sx=(w-70)/17;r.sy=(h-100)/17;}
export function screen566(r,x,y,seat){const q=rotate566(x,y,seat);return{x:r.width/2+q.x*r.sx,y:r.height/2+q.y*r.sy};}
export function world566(r,x,y,seat){return unrotate566((x-r.width/2)/r.sx,(y-r.height/2)/r.sy,seat);}
function circle(ctx,x,y,r,fill,stroke=null,width=1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function text(ctx,label,x,y,size,color='#ffebaf'){ctx.font=`800 ${size}px "Noto Sans JP",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=4;ctx.strokeStyle='#062b29';ctx.strokeText(label,x,y);ctx.fillStyle=color;ctx.fillText(label,x,y);}
function claw(ctx,x,y,angle,color,closed){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.shadowColor='#020f16';ctx.shadowBlur=4;ctx.shadowOffsetY=3;
 ctx.lineCap='round';ctx.lineJoin='round';
 for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(-10,side*4);ctx.lineTo(-1,side*(closed?8:12));ctx.lineTo(9,side*(closed?4:10));ctx.lineTo(12,side*(closed?1:7));ctx.strokeStyle='#402d19';ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle='#edcb86';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#fff0bd';ctx.lineWidth=1;ctx.stroke();}
 ctx.shadowBlur=0;circle(ctx,-9,0,5,'#b58c4e','#ffe0a1');circle(ctx,-9,0,2.5,color);ctx.restore();
}
function treasure(ctx,item,q,size,at){
 const spec=LOOT566[item.kind],hazard=item.kind==='mimic';
 ctx.save();ctx.translate(q.x,q.y);
 ctx.fillStyle='#001b2377';ctx.beginPath();ctx.ellipse(1,size*.31,size*.52,size*.17,0,0,Math.PI*2);ctx.fill();
 if(['chest','crown','mimic'].includes(item.kind)){
  const im=art(hazard?'mimic':'chest'),s=item.kind==='crown'?size*1.33:size;
  if(item.kind==='crown'){ctx.shadowColor='#ffd176';ctx.shadowBlur=15;circle(ctx,0,0,s*.39,'#eeba3b16','#ffe39b',1);}
  if(im.complete&&im.naturalWidth)ctx.drawImage(im,-s/2,-s*.55,s,s);else{ctx.fillStyle=hazard?'#ed7775':'#e4b65c';ctx.fillRect(-s*.35,-s*.25,s*.7,s*.5);}
  ctx.shadowBlur=0;
 }else if(item.kind==='gem'){
  const r=size*.32;ctx.shadowBlur=12;ctx.shadowColor='#66e9d5';ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.8,-r*.2);ctx.lineTo(r*.55,r*.8);ctx.lineTo(0,r);ctx.lineTo(-r*.65,r*.6);ctx.lineTo(-r*.8,-r*.3);ctx.closePath();ctx.fillStyle='#36b7ac';ctx.fill();ctx.strokeStyle='#d4fff0';ctx.lineWidth=1.5;ctx.stroke();ctx.shadowBlur=0;ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(-r*.2,r*.6);ctx.lineTo(r*.8,-r*.2);ctx.moveTo(-r*.8,-r*.3);ctx.lineTo(r*.8,-r*.2);ctx.strokeStyle='#b0ffee';ctx.lineWidth=1;ctx.stroke();
 }else{const grad=ctx.createRadialGradient(-4,-5,1,0,0,size*.35);grad.addColorStop(0,'#fff6be');grad.addColorStop(.65,'#e9b94f');grad.addColorStop(1,'#79501b');circle(ctx,0,0,size*.3,grad,'#ffe7a1',2);circle(ctx,0,0,size*.21,null,'#9b681f',1);text(ctx,'✦',0,0,size*.32,'#fff1b0');}
 text(ctx,hazard?'−4':'+'+spec.value,0,size*.52,11,hazard?'#ffaca7':'#fff0ba');
 if(item.kind==='crown')text(ctx,'BIG',0,-size*.57,9);
 ctx.restore();
}
export function paint566(r,g,self,u,at){
 if(!r.width||!r.height)return;
 const ctx=r.ctx,w=r.width,h=r.height,seat=g.players.find(p=>p.playerId===self)?.seat??0,point=(x,y)=>screen566(r,x,y,seat),t=Math.min(1,Math.max(0,(performance.now()-(u.receivedAt??0))/50));
 const smooth=(v,old)=>old?{...v,x:old.x+(v.x-old.x)*t,y:old.y+(v.y-old.y)*t}:v;
 ctx.setTransform(r.dpr,0,0,r.dpr,0,0);ctx.clearRect(0,0,w,h);
 ctx.fillStyle='#041d261a';ctx.fillRect(0,0,w,h);
 // Mechanical dial strokes stay exact at every screen aspect ratio; the artwork is decorative.
 ctx.save();ctx.translate(w/2,h/2);ctx.scale(r.sx,r.sy);
 for(const rad of [6.3,7.05,8.9]){ctx.beginPath();ctx.arc(0,0,rad,0,Math.PI*2);ctx.strokeStyle=rad===6.3?'#d7b86540':'#ebc77b58';ctx.lineWidth=rad===8.9?.09:.025;ctx.stroke();}
 for(let i=0;i<48;i++){const a=i*Math.PI/24+(u.reduced?0:g.elapsed/45000*g.turn),x=Math.cos(a),y=Math.sin(a);ctx.beginPath();ctx.moveTo(x*6.9,y*6.9);ctx.lineTo(x*(i%4===0?6.65:6.8),y*(i%4===0?6.65:6.8));ctx.strokeStyle='#d4b77865';ctx.lineWidth=.045;ctx.stroke();}
 ctx.restore();
 for(const p of g.players){const q=point(p.x,p.y),color=color563(p);const grad=ctx.createRadialGradient(q.x-7,q.y-8,1,q.x,q.y,25);grad.addColorStop(0,'#678d7e');grad.addColorStop(.6,'#183e3a');grad.addColorStop(.68,'#dbc28a');grad.addColorStop(.8,'#84643d');grad.addColorStop(1,'#142f2c');circle(ctx,q.x,q.y+4,27,'#001b23bb');circle(ctx,q.x,q.y,25,grad,color,2);if(p.playerId===self){circle(ctx,q.x,q.y,29,null,color,1);ctx.shadowColor=color;ctx.shadowBlur=12;circle(ctx,q.x,q.y,26,null,color,1);ctx.shadowBlur=0;}}
 const renderedHooks=new Map();
 for(const p of g.players){
  if(!p.hook)continue;const old=u.previous?.players.find(v=>v.seat===p.seat),hh=smooth(p.hook,old?.hook?.phase===p.hook.phase?old.hook:null),q=point(hh.x,hh.y),base=point(p.x,p.y),color=color563(p);renderedHooks.set(p.seat,{hh,q,base,color});
  ctx.lineCap='round';ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='#031a22';ctx.lineWidth=6;ctx.stroke();ctx.strokeStyle='#bda775';ctx.lineWidth=3;ctx.stroke();ctx.setLineDash([3,5]);ctx.lineDashOffset=u.reduced?0:-at/55;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
 }
 for(const v of g.loot){
  const old=u.previous?.loot.find(o=>o.id===v.id&&o.owner===v.owner),item=smooth(v,old),q=point(item.x,item.y),size=Math.max(27,Math.min(r.sx,r.sy)*LOOT566[v.kind].r*3.5);
  if(v.owner!=null){circle(ctx,q.x,q.y,size*.5,null,color563(g.players[v.owner]),1.5);}
  treasure(ctx,v,q,size,at);
 }
 for(const [seat,{hh,q,base,color}]of renderedHooks)claw(ctx,q.x,q.y,Math.atan2(q.y-base.y,q.x-base.x),color,hh.itemId!=null);
 if(u.aim&&!g.players[seat].hook){const q=point(u.aim.x,u.aim.y),base=point(g.players[seat].x,g.players[seat].y);ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.lineTo(q.x,q.y);ctx.setLineDash([4,6]);ctx.strokeStyle='#f4e4bdaa';ctx.lineWidth=1.5;ctx.stroke();ctx.setLineDash([]);circle(ctx,q.x,q.y,15,null,'#fff0b5',2);circle(ctx,q.x,q.y,3,'#fff4ce');}
 const recent=g.events.filter(e=>['steal','bank','bite'].includes(e.type)&&at-e.at>=0&&at-e.at<1100).slice(-6);
 for(const e of recent){const age=(at-e.at)/1100,q=point(e.x,e.y),color=e.type==='bite'?'#ff9c97':color563(g.players[e.seat]);ctx.globalAlpha=1-age;const expansion=u.reduced?10:12+age*38;circle(ctx,q.x,q.y,expansion,null,color,2*(1-age));if(!u.reduced){for(let i=0;i<8;i++){const a=i*Math.PI/4;circle(ctx,q.x+Math.cos(a)*expansion,q.y+Math.sin(a)*expansion,2*(1-age),color);}}text(ctx,e.type==='steal'?'横取り！':e.type==='bite'?'ガブッ！':`+${e.value}`,q.x,Math.max(16,q.y-24-(u.reduced?0:age*28)),e.type==='steal'?17:21,color);ctx.globalAlpha=1;}
 r.points=g.players.map(p=>({...point(p.x,p.y),seat:p.seat}));
}
