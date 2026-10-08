import {color563 as color} from '../party/Arcade563.js';
export const PADS580=[[.28,.35],[.72,.35],[.19,.62],[.50,.72],[.81,.62]];
const images=new Map();
function asset(path){if(!images.has(path)){const i=new Image();i.src=new URL('../../assets/'+path,import.meta.url).href;images.set(path,i);}return images.get(path);}
export function board580(canvas){return {canvas,ctx:canvas.getContext('2d'),w:1,h:1,points:[]};}
export function resize580(r,w,h,dpr){r.w=w;r.h=h;r.canvas.width=Math.round(w*Math.min(2,dpr));r.canvas.height=Math.round(h*Math.min(2,dpr));r.ctx.setTransform(r.canvas.width/w,0,0,r.canvas.height/h,0,0);}
function ellipse(ctx,x,y,rx,ry,fill,stroke=null){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function label(ctx,text,x,y,size=16,fill='#ffe8a4'){ctx.font=`800 ${size}px sans-serif`;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#132822';ctx.strokeText(text,x,y);ctx.fillStyle=fill;ctx.fillText(text,x,y);}
function treasure(ctx,kind,x,y,size,at){
 ctx.save();ctx.translate(x,y);ctx.rotate(kind==='bomb'?.1:Math.sin(at*.003+x)*.12);
 if(kind==='coin'){ellipse(ctx,0,0,size*.75,size,'#f9b72d','#fff2a6');ellipse(ctx,0,0,size*.5,size*.72,'#ef961b','#ffe581');label(ctx,'G',0,size*.38,size,'#fff4b4');}
 else if(kind==='gem'){ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.8,0);ctx.lineTo(0,size);ctx.lineTo(-size*.8,0);ctx.closePath();ctx.fillStyle='#5ff2c7';ctx.fill();ctx.strokeStyle='#d8fff4';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(0,size);ctx.moveTo(-size*.8,0);ctx.lineTo(size*.8,0);ctx.stroke();}
 else if(kind==='gold'){const gradient=ctx.createLinearGradient(0,-size,0,size);gradient.addColorStop(0,'#fff3a6');gradient.addColorStop(.5,'#ffc33c');gradient.addColorStop(1,'#b06512');ctx.beginPath();ctx.moveTo(-size,-size*.55);ctx.lineTo(size,-size*.55);ctx.lineTo(size*1.3,size*.6);ctx.lineTo(-size*1.3,size*.6);ctx.closePath();ctx.fillStyle=gradient;ctx.fill();ctx.strokeStyle='#ffe8a7';ctx.lineWidth=2;ctx.stroke();label(ctx,'100',0,size*.27,size*.7);}
 else{ellipse(ctx,0,0,size,size,'#172b30','#fc7d47');ellipse(ctx,-size*.28,-size*.3,size*.23,size*.23,'#567980');ctx.beginPath();ctx.moveTo(size*.4,-size*.8);ctx.quadraticCurveTo(size*.6,-size*1.6,size*1.2,-size*1.4);ctx.strokeStyle='#e9c583';ctx.lineWidth=3;ctx.stroke();ellipse(ctx,size*1.2,-size*1.4,3,3,'#fff3b3');label(ctx,'!',0,size*.4,size,'#ffca80');}
 ctx.restore();
}
export function paint580(r,g,self,u,at){
 const {ctx,w,h}=r;ctx.clearRect(0,0,w,h);r.points=[];
 const reduced=u.reduced,animation=reduced?0:at;
 if(g.game==='elevator'){
  const shake=g.events.some(e=>e.type==='shake'&&at-e.at<350),sway=reduced?0:Math.sin(animation*.0017)*Math.min(4,g.stress*.06)+(shake?Math.sin(at*.07)*4:0),fallen=g.reason==='collapse'&&g.phase==='roundEnd',fall=fallen?Math.min(h,(at-g.phaseAt)*.45):0;
  ctx.save();ctx.translate(sway,fall);
  ctx.strokeStyle='#ba9c5c';ctx.lineWidth=4;for(const x of [w*.1,w*.9]){ctx.beginPath();ctx.moveTo(x,-10);ctx.lineTo(x,h*.79);ctx.stroke();for(let y=-24+(animation*.024)%24;y<h*.55;y+=24){ctx.strokeStyle='#f1d18b';ctx.lineWidth=2;ctx.strokeRect(x-3,y,6,15);}}
  const cage=asset('elevator580/cage.webp'),cw=w*1.02,ch=cw*.48,cy=h*.79-ch*.70;
  if(cage.complete&&cage.naturalWidth)ctx.drawImage(cage,-w*.01,cy,cw,ch);else{ctx.fillStyle='#79572f';ctx.fillRect(w*.04,h*.79,w*.92,18);}
  for(const p of g.players){const old=u.previous?.players?.[p.seat],blend=Math.min(1,(performance.now()-(u.receivedAt??0))/50),px=old?.status===p.status?old.x+(p.x-old.x)*blend:p.x;let x=px*w,y=h*.79+fall;if(p.status==='banked'){const t=reduced?1:Math.max(0,Math.min(1,(at-p.bankAt)/750));x+=((p.x<.5?.06:.94)*w-x)*t;y=h*.79+(h*.45-h*.79)*t-Math.sin(t*Math.PI)*h*.13;}if(p.status==='top')y=h*.79;r.points.push({seat:p.seat,x:x+sway,y,status:p.status});if(p.status==='riding'||p.status==='top')ellipse(ctx,px*w,h*.79+1,w*.062,5,color(p)+'66',color(p));}
  ctx.restore();
  if(!fallen)for(const d of g.drops){const old=u.previous?.drops?.find(v=>v.id===d.id),blend=Math.min(1,(performance.now()-(u.receivedAt??0))/50),y=old?old.y+(d.y-old.y)*blend:d.y;treasure(ctx,d.kind,d.x*w,y*h,Math.max(9,w*.032),animation);}
  for(const e of g.events){const age=at-e.at;if(age<0||age>1000)continue;if(e.type==='catch'||e.type==='blast'){const p=g.players[e.seat];label(ctx,(e.value>0?'+':'')+e.value,e.x*w,h*.70-age*.035,Math.max(14,w*.04),e.value>0?color(p):'#ff966b');}}
 }else{
  const reveal=g.stage==='reveal';
  const point=(pad,seat)=>pad==null?{x:(.18+.21*seat)*w,y:h*.93}:{x:PADS580[pad][0]*w,y:PADS580[pad][1]*h-12};
  for(const p of g.players){const from=point(p.fromPad598,p.seat),to=point(p.target,p.seat),t=p.jumpAt598?Math.max(0,Math.min(1,(at-p.jumpAt598)/420)):1;let x=from.x+(to.x-from.x)*t,y=from.y+(to.y-from.y)*t-(reduced?0:Math.sin(t*Math.PI)*h*.17);const crowd=g.players.filter(q=>q.target===p.target),j=crowd.findIndex(q=>q.seat===p.seat);if(p.target!=null)x+=(j-(crowd.length-1)/2)*w*.045*t;
   if(reveal&&p.out)y+=Math.min(h,Math.max(0,at-g.phaseAt)*.35);
   r.points.push({seat:p.seat,x,y,status:p.out&&reveal?'fallen':'riding'});ellipse(ctx,x,y+3,Math.max(12,w*.046),4,color(p)+'66',color(p));
  }
  for(const pad of reveal?(g.eruptions598??[]):g.danger){const [px,py]=PADS580[pad],x=px*w,y=py*h,age=at-g.phaseAt;ctx.save();ctx.strokeStyle='#ffe0a1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-18,y);ctx.lineTo(x-6,y-7);ctx.lineTo(x+1,y+6);ctx.lineTo(x+13,y-5);ctx.stroke();if(reveal)for(let i=0;i<12;i++){const a=i*2.399,rad=Math.max(0,Math.sin(Math.min(1,age/1500)*Math.PI))*(32+i*3);ellipse(ctx,x+Math.cos(a)*rad,y-Math.abs(Math.sin(a))*rad*2,2+i%4,4+i%5,i%2?'#ff8b27':'#fff0a0');}ctx.restore();}

 }
 // Sparse deterministic sparks are decorative; game state never depends on rendering.
 if(!reduced)for(let i=0;i<12;i++){const x=((i*83.73)%w),y=(h+((i*41.7-animation*.017)%(h+20)))%(h+20);ellipse(ctx,x,y,1,2,'#fbe0a366');}
}
