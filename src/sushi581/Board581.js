import {seatAngle581,SUSHI581,angle581,fever582} from './Rules581.js';
import {color563} from '../party/Arcade563.js';
const TAU=Math.PI*2;
export function board581(canvas,fxCanvas=canvas){const image=new Image();image.src=new URL('../../assets/sushi581/menu.webp',import.meta.url).href;const ctx=canvas.getContext('2d');const fx=fxCanvas.getContext('2d');ctx.sushiFont581=fx.sushiFont581=getComputedStyle(canvas).fontFamily;return {canvas,ctx,fxCanvas,fx,w:1,h:1,image};}
export function resize581(r,w,h,dpr){r.w=Math.max(1,w);r.h=Math.max(1,h);r.canvas.width=Math.round(r.w*Math.min(2,dpr));r.canvas.height=Math.round(r.h*Math.min(2,dpr));r.ctx.setTransform(r.canvas.width/r.w,0,0,r.canvas.height/r.h,0,0);if(r.fxCanvas!==r.canvas){r.fxCanvas.width=r.canvas.width;r.fxCanvas.height=r.canvas.height;r.fx.setTransform(r.canvas.width/r.w,0,0,r.canvas.height/r.h,0,0);}}
export function diner581(seat,self=0,scale=1){const a=seatAngle581(seat)-self*Math.PI/2;return {x:.5+Math.cos(a)*.45,y:.48+Math.sin(a)*.435*scale};}
function curve(ctx,x,y,rx,ry,a=0,b=TAU){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,a,b);}
function label(ctx,text,x,y,size,fill){ctx.font=`900 ${size}px ${ctx.sushiFont581}`;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#152720';ctx.strokeText(text,x,y);ctx.fillStyle=fill;ctx.fillText(text,x,y);}
export function paint581(r,g,self,u,at){
 let ctx=r.ctx;const {w,h,image}=r,p=g.players.find(p=>p.playerId===self),seat=p?.seat??0,turn=seat*Math.PI/2,x=w*.5,y=h*.48,rx=w*.35,ry=Math.min(h*.32,w*.35),lane=Math.min(57,w*.145,h*.19);
 ctx.clearRect(0,0,w,h);ctx.lineCap='round';
 for(const [width,color] of [[lane+10,'#1a211a'],[lane+6,'#b99451'],[lane+2,'#213f36'],[lane-6,'#081e1be8']]){curve(ctx,x,y,rx,ry);ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();}
 ctx.save();ctx.lineWidth=1.2;ctx.strokeStyle='#8b9d7b55';
 const belt=angle581(g,{slot:0},at)-turn;
 for(let i=0;i<72;i++){const a=belt+i*TAU/72,c=Math.cos(a),s=Math.sin(a);ctx.beginPath();ctx.moveTo(x+c*(rx-lane*.35),y+s*(ry-lane*.35));ctx.lineTo(x+c*(rx+lane*.35),y+s*(ry+lane*.35));ctx.stroke();}ctx.restore();
 if(p){const a=Math.PI/2-SUSHI581.reach,b=Math.PI/2+SUSHI581.reach,tint=color563(p);ctx.save();ctx.lineCap='butt';curve(ctx,x,y,rx,ry,a,b);ctx.lineWidth=lane+2;ctx.strokeStyle=tint+'40';ctx.stroke();for(const offset of [-.51,.51]){curve(ctx,x,y,rx+lane*offset,ry+lane*offset,a,b);ctx.lineWidth=2.5;ctx.strokeStyle=tint;ctx.stroke();}for(const edge of [a,b]){ctx.beginPath();ctx.moveTo(x+Math.cos(edge)*(rx-lane*.60),y+Math.sin(edge)*(ry-lane*.60));ctx.lineTo(x+Math.cos(edge)*(rx+lane*.64),y+Math.sin(edge)*(ry+lane*.64));ctx.strokeStyle='#fff1c3';ctx.lineWidth=4;ctx.stroke();}ctx.restore();label(ctx,'ここまで取れる',x,y+ry-lane*.82,Math.max(9,w*.027),tint);}
 const size=Math.max(13,Math.min(20,w*.05)),centerFont=Math.min(23,w*.064);
 ctx.save();ctx.strokeStyle='#d3b76e44';ctx.lineWidth=1;curve(ctx,x,y,Math.min(w*.2,120),Math.min(h*.14,67));ctx.stroke();ctx.restore();
 label(ctx,fever582(p,at)?'フィーバー！':'魔 王 寿 司',x,y-9,centerFont,'#f9dda0');label(ctx,fever582(p,at)?'お寿司の得点 ×２':g.rush?'金皿ラッシュ！':'３皿そろえて ＋180',x,y+15,Math.max(10,w*.029),g.rush?'#ffe376':'#e5d5ac');
 ctx.save();ctx.translate(x,y+42);if(g.direction<0)ctx.scale(-1,1);ctx.strokeStyle='#d9b66e';ctx.fillStyle='#d9b66e';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,9,-Math.PI*.5,Math.PI, false);ctx.stroke();ctx.beginPath();ctx.moveTo(-14,-1);ctx.lineTo(-5,-1);ctx.lineTo(-9,6);ctx.closePath();ctx.fill();ctx.restore();
 ctx=r.fx;if(r.fx!==r.ctx)ctx.clearRect(0,0,w,h);ctx.lineCap='round';
 for(const q of g.players){const a=seatAngle581(q.seat)-turn,stack=Math.min(5,Math.floor(q.plates/3)),cx=x+Math.cos(a)*w*.42,cy=y+Math.sin(a)*h*.415*Math.min(1,w*.35/(h*.32));for(let i=0;i<stack;i++){ctx.beginPath();ctx.ellipse(cx+(Math.cos(a)>.5?-26:26),cy+9-i*3,9,3,0,0,TAU);ctx.fillStyle=i%2?'#dcd8b4':'#c3bd91';ctx.fill();ctx.strokeStyle='#6c754f';ctx.lineWidth=1;ctx.stroke();}}
 for(const e of g.events){const age=at-e.at;if(age<0||age>1100||e.seat==null)continue;const q=diner581(e.seat,seat,Math.min(1,w*.35/(h*.32))),end={x:Math.max(30,Math.min(w-30,q.x*w)),y:Math.max(31,Math.min(h-27,q.y*h))};
  if(['eat','steal','spicy'].includes(e.type)){
   const a=e.angle-turn,start={x:x+Math.cos(a)*rx,y:y+Math.sin(a)*ry},t=Math.min(1,age/420),ease=1-(1-t)**3;
   if(!u.reduced&&t<1){ctx.save();const px=start.x+(end.x-start.x)*ease,py=start.y+(end.y-start.y)*ease-Math.sin(t*Math.PI)*Math.min(35,h*.08),size=48*(1-t*.55);ctx.lineWidth=e.type==='steal'?4:2.5;ctx.strokeStyle=e.type==='steal'?'#ffe092':'#dab788';ctx.shadowBlur=e.type==='steal'?9:0;ctx.shadowColor='#ffd977';for(const d of [-3,3]){ctx.beginPath();ctx.moveTo(end.x+d,end.y);ctx.lineTo(px+d,py);ctx.stroke();}ctx.shadowBlur=0;if(image.complete&&image.naturalWidth){const iw=image.naturalWidth/4,ih=image.naturalHeight/2;ctx.drawImage(image,(e.kind%4)*iw+iw*.02,Math.floor(e.kind/4)*ih*.83,iw*.96,ih*.9,px-size*.48,py-size*.6,size*.96,size*1.2);}ctx.restore();}
   const ly=Math.max(28,Math.min(h-15,end.y-(e.seat===seat?8:30)-(u.reduced?0:age*.01)));if(age<650)label(ctx,e.type==='spicy'?'辛っ！ '+e.value:(e.multiplier===2?'×２ ':'')+'+'+e.value,Math.max(60,Math.min(w-60,end.x+(e.seat===seat?48:0))),ly,size,e.type==='spicy'?'#ff9869':color563(g.players[e.seat]));
  }
  if(!u.reduced&&['eat','steal','spicy'].includes(e.type)&&age<650){const a=e.angle-turn,cx=x+Math.cos(a)*rx,cy=y+Math.sin(a)*ry;ctx.save();ctx.globalAlpha=Math.max(0,1-age/650);ctx.strokeStyle=e.type==='spicy'?'#ff9869':e.matched?'#ffe49c':'#adf2d4';ctx.lineWidth=2;curve(ctx,cx,cy,12+age*.035,8+age*.023);ctx.stroke();for(let i=0;i<6;i++){const a=i*TAU/6+age*.002,rad=10+age*.05;ctx.fillStyle=ctx.strokeStyle;ctx.fillRect(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad,3,3);}ctx.restore();}
  if(['set','fever'].includes(e.type)&&!u.reduced){for(let i=0;i<16;i++){const a=i*2.4,dist=age*.07;ctx.fillStyle=['#ffd475','#90edcc','#ff9876'][i%3];ctx.globalAlpha=Math.max(0,1-age/1100);ctx.fillRect(end.x+Math.cos(a)*dist,end.y+Math.sin(a)*dist-age*.07+age*age*.00008,4,7);}ctx.globalAlpha=1;}
 }
}
