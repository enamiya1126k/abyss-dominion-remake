import {TETRA539 as C,clamp539,pad539,pose539,wave539,jumpDistance539,flightTime539,landing539} from './Rules539.js';
import {color499} from '../party/PartyColors499.js';
const TAU=Math.PI*2,images=new Map();
const art=name=>{if(!images.has(name)){const i=new Image();i.src=new URL(`../../assets/tetra539/${name}.webp`,import.meta.url).href;images.set(name,i)}return images.get(name)};
const ready=i=>i?.complete&&i.naturalWidth>0;
export function renderer539(canvas){return{canvas,ctx:canvas.getContext('2d',{alpha:false}),ocean:art('ocean'),pads:art('pads'),width:0,height:0,scale:1,cameraY:null,points:[]};}
export function resize539(r,w,h,dpr=1){r.width=w;r.height=h;r.dpr=Math.min(2,dpr);r.canvas.width=Math.round(w*r.dpr);r.canvas.height=Math.round(h*r.dpr);r.scale=w/C.width;}
export const worldPoint539=(r,x,y)=>({x:x/r.scale,y:y/r.scale+r.cameraY});
export const screenPoint539=(r,x,y)=>({x:x*r.scale,y:(y-r.cameraY)*r.scale});
function label(c,text,x,y,color='#fff3d7',size=10){c.font=`700 ${size}px "Noto Sans JP",sans-serif`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='#06333dde';c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y)}
function ellipse(c,x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.stroke()}}
export function paint539(r,g,selfId,u,at,reduced=false){const c=r.ctx,w=r.width,h=r.height;if(!w||!g.course)return;const elapsed=g.phase==='countdown'?Math.min(0,at-g.startAt):g.phase==='result'?g.elapsed:g.elapsed+Math.min(150,Math.max(0,at-g.serverAt)),p=g.players.find(p=>p.playerId===selfId)??g.players[0],pos=pose539(g,p,elapsed),camTarget=clamp539(pos.y-h/r.scale*.77,0,C.height-h/r.scale);
 // Keep the entire course width visible. Smooth follow; a respawn never hides the player.
 if(r.cameraY==null||Math.abs(r.cameraY-camTarget)>800)r.cameraY=camTarget;else r.cameraY+=(camTarget-r.cameraY)*(reduced?1:.12);
 c.setTransform(r.dpr,0,0,r.dpr,0,0);c.fillStyle='#075269';c.fillRect(0,0,w,h);
 if(ready(r.ocean)){const scale=Math.max(w/r.ocean.width,h/r.ocean.height)*1.08,iw=r.ocean.width*scale,ih=r.ocean.height*scale,pan=(r.cameraY/(C.height-h/r.scale))*(ih-h);c.drawImage(r.ocean,(w-iw)/2,-pan,iw,ih);c.fillStyle='#012d403a';c.fillRect(0,0,w,h)}
 // Slow glints and foam are canvas overlays, keeping generated art crisp on mobile.
 if(!reduced){c.strokeStyle='#baf6ee26';c.lineWidth=1;for(let i=0;i<20;i++){const x=(i*89+Math.sin(at/3400+i)*13)%w,y=((i*67+at/95-r.cameraY*r.scale*.23)%(h+20)+h+20)%(h+20);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+14,y-4,x+29,y);c.stroke()}}
 const wave=wave539(elapsed),visible=g.course.pads.map(pad=>pad539(g,pad,elapsed)).filter(pad=>{const y=(pad.y-r.cameraY)*r.scale;return y>-100&&y<h+110}).sort((a,b)=>a.y-b.y);
 // Subtle buoys describe the two choices without drawing artificial bridges.
 for(const pad of visible){const s=screenPoint539(r,pad.x,pad.y),size=pad.r*3.15*r.scale,cell={stable:0,tilt:1,spin:2,sink:3,refuge:4,finish:5}[pad.kind],alpha=pad.submerged?.28:1,tilt=pad.tilt*(g.padStates[pad.id]?.direction??1)*.14;
  ellipse(c,s.x,s.y+size*.18,size*.41,size*.21,'#00253760');c.save();c.translate(s.x,s.y+size*.08+(pad.submerged?9:0));c.rotate(pad.kind==='spin'?pad.angle:tilt);c.globalAlpha=alpha;
  if(ready(r.pads)){const cw=r.pads.width/3,ch=r.pads.height/2;c.drawImage(r.pads,cell%3*cw,Math.floor(cell/3)*ch,cw,ch,-size/2,-size*.64,size,size)}else{ellipse(c,0,0,pad.r*r.scale,pad.r*r.scale*.7,'#b2a990','#eedbb1')}
  c.restore();c.lineWidth=1;
  // This outline is the actual landing area, so art never promises a false foothold.
  ellipse(c,s.x,s.y,(pad.r-7)*r.scale,(pad.r-7)*r.scale,null,pad.submerged?'#8fdded66':pad.low?'#f7c47166':'#fff3cc55');
  if(pad.kind==='refuge'||pad.kind==='finish'){label(c,pad.kind==='finish'?'GOAL':pad.checkpoint===0?'START':`避難所 ${pad.checkpoint}`,s.x,s.y+size*.38,'#fbefc4',10)}
  else if(pad.low){const tag=pad.submerged?'水没':{tilt:'傾く',spin:'回転',sink:'沈む'}[pad.kind];label(c,tag,s.x,s.y+size*.38,pad.submerged?'#b0e5ef':'#ffe0a5',8)}
  if(pad.sinking>=0&&pad.sinking<2200&&!pad.submerged){c.strokeStyle='#ffaf6d';c.lineWidth=2;c.beginPath();c.arc(s.x,s.y,(pad.r+8)*r.scale,-Math.PI/2,-Math.PI/2+TAU*(1-pad.sinking/2200));c.stroke()}
 }
 if(wave.active){const phase=wave.phase/C.waveLife,front=phase*(h+200)-100;c.save();const gradient=c.createLinearGradient(0,front-85,0,front+35);gradient.addColorStop(0,'#9ddfff00');gradient.addColorStop(.8,'#ceffff70');gradient.addColorStop(1,'#ffffffb0');c.fillStyle=gradient;c.fillRect(0,front-85,w,120);c.strokeStyle='#e9ffffd9';c.lineWidth=3;c.beginPath();for(let x=0;x<=w;x+=6){const y=front+Math.sin(x/19+elapsed/260)*8;x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();c.restore()}
 const charging=u.chargeStart!=null&&!p.flight&&p.fallAt==null&&p.finishedAt==null&&g.phase==='play';r.preview=null;
 if(!charging&&!p.flight&&p.fallAt==null&&p.finishedAt==null){const a=screenPoint539(r,pos.x,pos.y),d=30;c.strokeStyle='#ffe5a9aa';c.lineWidth=1.5;c.beginPath();c.moveTo(a.x+Math.cos(u.angle)*17,a.y+Math.sin(u.angle)*17);c.lineTo(a.x+Math.cos(u.angle)*d,a.y+Math.sin(u.angle)*d);c.stroke();ellipse(c,a.x+Math.cos(u.angle)*d,a.y+Math.sin(u.angle)*d,2,2,'#ffe5a9')}
 if(charging){const hold=Math.max(0,at-u.chargeStart),d=jumpDistance539(hold),tx=pos.x+Math.cos(u.angle)*d,ty=pos.y+Math.sin(u.angle)*d,target=screenPoint539(r,tx,ty),origin=screenPoint539(r,pos.x,pos.y),land=landing539(g,tx,ty,elapsed+flightTime539(d)),color=land?'#ffe292':'#ff9b8d';r.preview={tx,ty,land:land?.id??null,distance:d};c.save();c.setLineDash([3,5]);c.strokeStyle=color;c.lineWidth=1.8;c.beginPath();c.moveTo(origin.x,origin.y);c.quadraticCurveTo((origin.x+target.x)/2,(origin.y+target.y)/2-40,target.x,target.y);c.stroke();c.setLineDash([]);c.lineWidth=2;ellipse(c,target.x,target.y,10,10,'#012c4277',color);c.beginPath();c.moveTo(target.x-15,target.y);c.lineTo(target.x+15,target.y);c.moveTo(target.x,target.y-15);c.lineTo(target.x,target.y+15);c.stroke();label(c,land?'着地できる！':'海に落ちる！',target.x,Math.max(18,target.y-23),color,10);c.restore()}
 const positions=[];for(const player of g.players){const point=pose539(g,player,elapsed),s=screenPoint539(r,point.x,point.y),fall=player.fallAt!=null?clamp539((elapsed-player.fallAt)/600,0,1):0;positions.push({seat:player.seat,x:s.x,y:s.y-point.z*r.scale,visible:s.y>=-60&&s.y<=h+65,fall,scale:1+point.z/700});if(s.y<-50||s.y>h+50)continue;const color=color499(player.color499,player.seat).hex;c.globalAlpha=fall?1-fall:1;ellipse(c,s.x,s.y+4,player.playerId===selfId?13:10,6,'#001e3577',player.playerId===selfId?'#ffecac':color);c.globalAlpha=1;}
 r.points=positions;
 for(const e of g.events){const age=elapsed-e.at;if(e.type!=='splash'||age<0||age>1050)continue;const s=screenPoint539(r,e.x,e.y),t=age/1050;c.save();c.globalAlpha=1-t;c.lineWidth=2;ellipse(c,s.x,s.y,10+t*35,5+t*17,null,'#ecffff');if(!reduced)for(let i=0;i<8;i++){const a=i*TAU/8,x=s.x+Math.cos(a)*t*40,y=s.y+Math.sin(a)*t*20-Math.sin(t*Math.PI)*23;ellipse(c,x,y,2,4,'#dcffff')}c.restore()}
 // Progress ribbon shows all four racers, including those outside the camera.
 const px=w-13,top=66,bottom=h-24;c.strokeStyle='#061e35bb';c.lineWidth=5;c.beginPath();c.moveTo(px,top);c.lineTo(px,bottom);c.stroke();for(let i=0;i<4;i++){const y=bottom-(bottom-top)*i/3;ellipse(c,px,y,3,3,'#e1c990')}
 for(const player of g.players){const progress=clamp539((5400-(player.finishedAt!=null?360:pose539(g,player,elapsed).y))/5040,0,1),y=bottom-progress*(bottom-top),x=px-(player.seat%2?3:-3);ellipse(c,x,y,player.playerId===selfId?5:3.5,player.playerId===selfId?5:3.5,color499(player.color499,player.seat).hex,player.playerId===selfId?'#fff3c7':null)}
 if(p.fallAt!=null){label(c,'より「イージー！」',w/2,h*.44,'#ffe4a7',20);label(c,'避難所から、もう一回！',w/2,h*.44+29,'#ffffff',12)}
 if(p.finishedAt!=null){label(c,'GOAL!',w/2,h*.38,'#ffe5a6',36);label(c,'仲間のゴールを見守ろう',w/2,h*.38+38,'#ffffff',12)}
 const vignette=c.createLinearGradient(0,0,0,h);vignette.addColorStop(0,'#00243888');vignette.addColorStop(.18,'#00243800');vignette.addColorStop(.8,'#00243800');vignette.addColorStop(1,'#00243866');c.fillStyle=vignette;c.fillRect(0,0,w,h);
 return{elapsed,wave,charging};
}
