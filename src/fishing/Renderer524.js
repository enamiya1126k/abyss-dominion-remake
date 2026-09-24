import {WATER526,depth526,waterScale526,clampWater526,shadowSize526,available526,landingDuration526,retrievalPoint526,visualCue526} from './Water526.js';
import {SPECIES524,fishPose524,approachPose530,mood524,clamp524} from './Rules524.js';
import {playerColor499} from '../party/PartyColors499.js';
import {artSpec525,artFrame525} from './Catches525.js';
const art={};
function image524(name){if(art[name]||typeof Image==='undefined')return art[name];const img=new Image();img.decoding='async';img.src=`./assets/fishing524/${name}.webp`;art[name]=img;return img}
function image525(name){const key='525/'+name;if(art[key]||typeof Image==='undefined')return art[key];const img=new Image();img.decoding='async';img.src=`./assets/fishing525/${name}.webp`;art[key]=img;return img}
function image532(name){const key='532/'+name;if(art[key]||typeof Image==='undefined')return art[key];const img=new Image();img.decoding='async';img.src=`./assets/fishing532/${name}.webp`;art[key]=img;return img}
function image533(name){const key='533/'+name;if(art[key]||typeof Image==='undefined')return art[key];const img=new Image();img.decoding='async';img.src=`./assets/fishing533/${name}.webp`;art[key]=img;return img}
function image534(name){const key='534/'+name;if(art[key]||typeof Image==='undefined')return art[key];const img=new Image();img.decoding='async';img.src=`./assets/fishing534/${name}.webp`;art[key]=img;return img}
function collection531(){if(art.collection531||typeof Image==='undefined')return art.collection531;const img=new Image();img.decoding='async';img.src='./assets/fishing531/collection.webp';art.collection531=img;return img}
function shadowImage526(){if(art.shadow526||typeof Image==='undefined')return art.shadow526;const img=new Image();img.decoding='async';img.src='./assets/fishing526/fish-shadow.webp';art.shadow526=img;return img}
export function renderer524(canvas){const atlases={};const sources={...Object.fromEntries(['river','rare','oddities','lord'].map(n=>[n,()=>image525(n)])),collection531,...Object.fromEntries(['shore','finds'].map(n=>[n+'534',()=>image534(n)])),...Object.fromEntries(['market','coast'].map(n=>[n+'533',()=>image533(n)])),...Object.fromEntries(['river','sea','danger'].map(n=>[n+'532',()=>image532(n)]))};for(const [key,get]of Object.entries(sources))Object.defineProperty(atlases,key,{get});return{canvas,ctx:canvas.getContext('2d',{alpha:false}),background:document.createElement('canvas'),pond:image524('pond'),get atlas(){return image524('fish-atlas')},atlases525:atlases,width:0,height:0,artReady:false,shadow526:shadowImage526(),motion526:new Map()}}

export function resize524(r,w,h,dpr=1){const d=Math.min(1.5,dpr),ready=!!(r.pond?.complete&&r.pond?.naturalWidth),key=[w,h,d,ready].join(':');if(r.key===key)return;r.key=key;Object.assign(r,{width:w,height:h,dpr:d,artReady:ready});for(const c of[r.canvas,r.background]){c.width=Math.max(1,Math.round(w*d));c.height=Math.max(1,Math.round(h*d))}const b=r.background.getContext('2d');b.setTransform(d,0,0,d,0,0);b.fillStyle='#143f35';b.fillRect(0,0,w,h);if(ready)b.drawImage(r.pond,0,0,w,h);else{const grad=b.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#536e44');grad.addColorStop(.25,'#205c4b');grad.addColorStop(.75,'#0e594e');grad.addColorStop(1,'#4a3826');b.fillStyle=grad;b.fillRect(0,0,w,h);b.fillStyle='#755f3d';b.fillRect(0,h*.8,w,h*.2)}const shade=b.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#041b1b33');shade.addColorStop(.65,'#02191600');shade.addColorStop(1,'#0a1c1844');b.fillStyle=shade;b.fillRect(0,0,w,h);r.cacheBuilds=(r.cacheBuilds??0)+1}
export const dock524=(r,seat)=>({x:r.width*(.13+seat*.2467),y:r.height*.91});
export function bobber524(r,p,t){const pos=retrievalPoint526(p,p.mode==='fight'?p.progress:0),scale=waterScale526(pos.y),wiggle=(p.mode==='fight'?Math.sin(t/190+p.seat)*(mood524(p,t)==='surge'?5:1.3):Math.sin(t/900+p.seat)*.65)*scale,water=clampWater526(pos.x+wiggle/r.width,pos.y,.003);return{x:r.width*water.x,y:r.height*water.y,scale}}

export function drawFish524(c,atlas,tier,x,y,size,angle=0,alpha=1){c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;if(atlas?.complete&&atlas.naturalWidth){const cell=atlas.naturalWidth/3;c.drawImage(atlas,(tier%3)*cell,Math.floor(tier/3)*cell,cell,cell,-size/2,-size/2,size,size)}else{c.fillStyle=SPECIES524[tier].color;c.beginPath();c.ellipse(0,0,size*.4,size*.18,0,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(size*.3,0);c.lineTo(size*.55,-size*.2);c.lineTo(size*.55,size*.2);c.fill()}c.restore()}
export function drawCatch525(c,r,fish,x,y,size,angle=0,alpha=1){
 const a=artSpec525(fish),atlas=a.sheet==='legacy'?r.atlas:r.atlases525?.[a.sheet];
 if(!atlas?.complete||!atlas.naturalWidth){drawFish524(c,r.atlas,fish.tier??0,x,y,size,angle,alpha);return}
 const uv=artFrame525(fish),iw=atlas.naturalWidth,ih=atlas.naturalHeight,cw=uv.w*iw,ch=uv.h*ih,dh=size*ch/cw;
 c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);c.drawImage(atlas,uv.x*iw,uv.y*ih,cw,ch,-size/2,-dh/2,size,dh);c.restore();
}
function goldSpark525(c,x,y,size,t){c.save();c.fillStyle='#fff1a8';for(let i=0;i<8;i++){const a=i*Math.PI/4+t/1700,rr=size*(.42+(i%3)*.04),sx=x+Math.cos(a)*rr,sy=y+Math.sin(a)*rr*.6;c.globalAlpha=.35+(1+Math.sin(t/120+i))*.3;c.fillRect(sx-1,sy-4,2,8);c.fillRect(sx-4,sy-1,8,2)}c.restore()}
function ripple(c,x,y,size,alpha=.6){c.strokeStyle=`rgba(212,255,239,${alpha})`;c.lineWidth=1;c.beginPath();c.ellipse(x,y,size,size*.32,0,0,Math.PI*2);c.stroke()}
function spray(c,x,y,age,scale=1){const t=age/900;if(t<0||t>1)return;c.fillStyle=`rgba(225,255,243,${1-t})`;for(let i=0;i<12;i++){const a=i*Math.PI/6,xx=x+Math.cos(a)*t*45*scale,yy=y+Math.sin(a)*t*12*scale-Math.sin(t*Math.PI)*30*scale;c.fillRect(xx,yy,2+(i%2),3+(i%3))}ripple(c,x,y,8+t*45*scale,(1-t)*.8)}
function waterClip526(c,w,h){const rows=WATER526.banks;c.beginPath();c.moveTo(rows[0][1]*w,rows[0][0]*h);for(const row of rows.slice(1))c.lineTo(row[1]*w,row[0]*h);for(const row of [...rows].reverse())c.lineTo(row[2]*w,row[0]*h);c.closePath();c.clip()}
export function drawShadow526(c,r,tier,pos,time,heading=0,alpha=1){
 const size=shadowSize526(r.width,tier,pos.y),depth=depth526(pos.y),x=pos.x*r.width,y=pos.y*r.height;
 c.save();c.translate(x,y);c.scale(1,.47+depth*.13);c.rotate(heading);c.globalAlpha=(.64+depth*.14)*alpha;c.globalCompositeOperation='multiply';
 if(r.shadow526?.complete&&r.shadow526.naturalWidth){
  if(!r.shadowSmall540){const small=document.createElement('canvas');small.width=192;small.height=Math.round(192*r.shadow526.naturalHeight/r.shadow526.naturalWidth);small.getContext('2d').drawImage(r.shadow526,0,0,small.width,small.height);r.shadowSmall540=small}const img=r.shadowSmall540,iw=img.width,ih=img.height,dh=size*ih/iw;
  // Tail moves around its own joint; no pixel readback or filtered full-screen layer.
  c.drawImage(img,0,0,iw*.73,ih,-size/2,-dh/2,size*.73,dh);
  c.save();c.translate(size*.23,0);c.rotate(Math.sin(time/310)*.075);c.drawImage(img,iw*.73,0,iw*.27,ih,0,-dh/2,size*.27,dh);c.restore();
 }else{
  c.fillStyle='#133e34';c.beginPath();c.moveTo(-size*.43,0);c.bezierCurveTo(-size*.34,-size*.19,size*.05,-size*.17,size*.25,-size*.035);c.bezierCurveTo(size*.34,-size*.025,size*.43,-size*.15,size*.46,-size*.1);c.quadraticCurveTo(size*.40,0,size*.46,size*.1);c.bezierCurveTo(size*.43,size*.15,size*.34,size*.025,size*.25,size*.035);c.bezierCurveTo(size*.05,size*.17,-size*.34,size*.19,-size*.43,0);c.fill();
 }
 if(tier===4){c.strokeStyle='#174537';c.lineWidth=.65;for(const sign of [-1,1]){c.beginPath();c.moveTo(-size*.4,sign*size*.065);c.quadraticCurveTo(-size*.57,sign*size*.18,-size*.27,sign*size*.23);c.stroke()}}
 c.restore();
}
function pose526(r,p,time){let s=r.motion526.get(p.playerId);if(!s||s.mode!==p.mode){s={mode:p.mode,at:time,progress:p.progress??0,tension:p.tension??0};r.motion526.set(p.playerId,s)}const dt=Math.max(0,Math.min(100,time-s.at)),f=1-Math.exp(-dt/75);s.at=time;s.progress+=(p.progress-s.progress)*f;s.tension+=(p.tension-s.tension)*f;return{...p,progress:s.progress,tension:s.tension}}
function cueRing526(c,float,p,mood,time,reduced){
 const v=visualCue526(p,mood),radius=15+float.scale*3,pulse=reduced?0:(1+Math.sin(time/(v.critical?80:180)))*1.5;
 c.save();c.translate(float.x,float.y);c.strokeStyle='#123c3288';c.lineWidth=3;c.beginPath();c.arc(0,0,radius,0,Math.PI*2);c.stroke();
 c.strokeStyle=v.color;c.lineWidth=2.5;c.beginPath();c.arc(0,0,radius,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(.035,p.progress));c.stroke();
 if(v.danger){
  // Outward chevrons tell the player to release; danger has shape and motion, not only color.
  c.lineWidth=2;c.beginPath();for(const sign of[-1,1]){const x=sign*(radius+5+pulse);c.moveTo(x-sign*3,-4);c.lineTo(x,0);c.lineTo(x-sign*3,4)}c.stroke();
  if(v.critical){c.beginPath();c.moveTo(-4,-radius-8);c.lineTo(0,-radius-14);c.lineTo(4,-radius-8);c.closePath();c.stroke()}
 }else{
  // A small winding arrow sits directly above the float.
  c.translate(0,-radius-10);c.lineWidth=1.7;c.beginPath();c.arc(0,0,4.5,.1,Math.PI*1.7);c.stroke();c.beginPath();c.moveTo(1,-6);c.lineTo(4,-4);c.lineTo(1,-2);c.stroke();
 }
 c.restore();
}
function rodAndLine526(c,r,p,float,mood,time,self,reduced){
 const dock=dock524(r,p.seat),fight=p.mode==='fight',v=visualCue526(p,mood),taut=fight?v.taut:.06,color=playerColor499(p).hex,jitter=fight&&v.danger&&!reduced?Math.sin(time/45)*1.4:0;
 const tip={x:dock.x+(float.x-dock.x)*(.20+taut*.12)+jitter,y:dock.y-r.height*.23+taut*r.height*.095},base={x:dock.x+7,y:dock.y-14};
 c.beginPath();c.moveTo(base.x,base.y);c.bezierCurveTo(base.x+(tip.x-base.x)*.35-taut*7,base.y+(tip.y-base.y)*.35-taut*r.height*.08,base.x+(tip.x-base.x)*.70,base.y+(tip.y-base.y)*.70-taut*r.height*.12,tip.x,tip.y);c.strokeStyle='#18261f';c.lineWidth=3.7;c.stroke();c.strokeStyle=p.rod>=5?'#f7e6a7':p.rod>=3?'#d8bf7f':'#bca578';c.lineWidth=1.5+p.rod*.12;c.stroke();
 const sag=(1-taut)*(13+float.scale*7),lineColor=self&&fight?v.color:color;
 c.beginPath();c.moveTo(tip.x,tip.y);c.quadraticCurveTo((tip.x+float.x)/2+jitter,(tip.y+float.y)/2+sag,float.x,float.y);
 if(self&&fight&&v.danger){c.strokeStyle=v.critical?'#fb8f7040':'#ffdb8340';c.lineWidth=5;c.stroke()}
 c.strokeStyle=lineColor+(self?'dc':'70');c.lineWidth=self&&fight?1.65:.85;c.stroke();
 if(self&&fight&&v.danger){const x=tip.x*.45+float.x*.55,y=tip.y*.45+float.y*.55;c.strokeStyle=v.color;c.lineWidth=1;c.beginPath();c.moveTo(x-5,y-3-jitter);c.lineTo(x-1,y-5-jitter);c.moveTo(x+3,y+5+jitter);c.lineTo(x+7,y+3+jitter);c.stroke()}
}
export function paint524(r,g,t,reduced=false,selfId=null){
 if(!r.width)return;resize524(r,r.width,r.height,r.dpr);
 const c=r.ctx,w=r.width,h=r.height,elapsed=g.phase==='result'?g.elapsed+Math.max(0,t-(g.finaleUntil-5200)):Math.max(0,t-g.startAt);
 c.setTransform(1,0,0,1,0,0);c.drawImage(r.background,0,0);c.setTransform(r.dpr,0,0,r.dpr,0,0);
 c.save();waterClip526(c,w,h);
	for(const s of g.shoals){if(!available526(s,elapsed))continue;const p=fishPose524(s,elapsed),past=fishPose524(s,elapsed-100),heading=Math.atan2((p.y-past.y)*h*1.7,(p.x-past.x)*w)-Math.PI;drawShadow526(c,r,s.tier,p,reduced?0:elapsed+s.id*70,heading)}
	for(const p of g.players){if(p.mode!=='waiting')continue;const q=approachPose530(g,p,elapsed);if(!q)continue;const before=approachPose530(g,p,elapsed-70)??q,heading=Math.atan2((q.y-before.y)*h*1.7,(q.x-before.x)*w)-Math.PI;drawShadow526(c,r,q.tier,q,reduced?0:elapsed+p.seat*91,heading,q.phase==='startle'?.72:.92);if(q.phase==='nibble'&&!reduced){const touch=.5+.5*Math.sin(elapsed/105+p.seat);ripple(c,p.castX*w,p.castY*h,(4+touch*8)*waterScale526(p.castY),.18+touch*.34)}}
 // Water highlights pass over the sprites, so the fish sit below the surface.
 if(!reduced)for(let i=0;i<16;i++){const y=.185+(i*.061)%.55,scale=waterScale526(y),x=(i*61+Math.sin(t/2200+i)*8)%w;c.strokeStyle='#d0ebc31b';c.lineWidth=.7;c.beginPath();c.moveTo(x,y*h);c.quadraticCurveTo(x+8*scale,y*h-1,x+21*scale,y*h);c.stroke()}
 c.restore();
 for(const raw of g.players){
  const p=pose526(r,raw,elapsed),dock=dock524(r,p.seat),self=p.playerId===selfId,color=playerColor499(p).hex;
  c.fillStyle='#00150c55';c.beginPath();c.ellipse(dock.x,dock.y+2,w*.051,4,0,0,Math.PI*2);c.fill();c.strokeStyle=color;c.lineWidth=self?2:1;c.beginPath();c.ellipse(dock.x,dock.y+2,w*.053,5,0,0,Math.PI*2);c.stroke();
  if(!['waiting','fight'].includes(p.mode))continue;
  let float=bobber524(r,p,elapsed);const castT=clamp524((elapsed-p.castAt)/650,0,1),fight=p.mode==='fight',mood=mood524(p,elapsed);
	  if(castT<1){float={...float,x:dock.x+(float.x-dock.x)*castT,y:dock.y+(float.y-dock.y)*castT-Math.sin(castT*Math.PI)*h*.20,scale:1+(float.scale-1)*castT};if(p.castBait530)drawCatch525(c,r,p.castBait530,float.x-5,float.y+6,w*.075*(1-castT*.28),castT*Math.PI*.9,.96)}
  if(fight){c.save();waterClip526(c,w,h);drawShadow526(c,r,p.fish?.tier??0,{x:float.x/w,y:(float.y+3)/h},reduced?0:elapsed,Math.sin(elapsed/700+p.seat)*.35,.6);c.restore()}
  rodAndLine526(c,r,p,float,mood,elapsed,self,reduced);
  if(fight&&mood==='surge'&&!reduced)spray(c,float.x,float.y,(elapsed-p.hookedAt)%700,float.scale*.34);
  const dip=fight&&(mood==='surge'||mood==='warn')&&!reduced?(1+Math.sin(elapsed/105))*2.3*float.scale:0;
  ripple(c,float.x,float.y+3*float.scale,(4+(elapsed%1500)/260)*float.scale,self?.6:.35);
  c.fillStyle=color;c.beginPath();c.ellipse(float.x,float.y+dip,2.6*float.scale,Math.max(1,(6-dip)*float.scale),fight&&mood==='surge'?.4:0,0,Math.PI*2);c.fill();c.strokeStyle='#f8edc2';c.lineWidth=.8;c.beginPath();c.moveTo(float.x,float.y-7*float.scale+dip);c.lineTo(float.x,float.y-2*float.scale+dip);c.stroke();
  if(self&&fight)cueRing526(c,float,p,mood,elapsed,reduced);
 }
 // Local landing is drawn last, keeping it clear when several players catch together.
 const eventKey=g.id+':'+selfId+':'+g.events.length+':'+(g.events.at(-1)?.id??0);if(r.eventKey526!==eventKey){r.eventKey526=eventKey;r.events526=[...g.events].sort((a,b)=>(a.type==='land'&&g.players[a.seat]?.playerId===selfId?1:0)-(b.type==='land'&&g.players[b.seat]?.playerId===selfId?1:0))}
 for(const e of r.events526){const age=elapsed-e.at;if(age<0)continue;
  if((e.type==='cast'||e.type==='bite')&&age<900)spray(c,w*e.x,h*e.y,age,waterScale526(e.y)*(e.type==='bite'?.7:.35));
	  if(e.type==='recover'&&age<700){const d=dock524(r,e.seat),q=age/700;ripple(c,d.x,d.y-2,6+q*24,(1-q)*.5)}
  if(e.type==='land'&&age<landingDuration526(e.fish)+160){
   const d=dock524(r,e.seat),boss=e.fish.tier===4,self=g.players[e.seat]?.playerId===selfId,duration=landingDuration526(e.fish),f=clamp524(age/duration,0,1),reveal=clamp524(f/.42,0,1),leave=clamp524((f-.72)/.28,0,1),cx=self?w*.5:d.x,cy=self?h*.46:d.y-h*.18;
   const x=e.x*w+(cx-e.x*w)*reveal+(d.x-cx)*leave,y=e.y*h+(cy-e.y*h)*reveal-Math.sin(reveal*Math.PI)*h*.12+(d.y-cy)*leave,size=w*(boss?(self?.82:.40):self?.36:.20)*(waterScale526(e.y)+(1-waterScale526(e.y))*reveal)*(1-leave*.48);
   drawCatch525(c,r,e.fish,x,y,size,Math.sin(reveal*Math.PI)*-.25);if(e.fish.golden525||e.fish.id==='treasure')goldSpark525(c,x,y,size,elapsed);spray(c,e.x*w,e.y*h,age,boss?1.5:.85);
  }
  if(e.type==='escape'&&age<900){const d=dock524(r,e.seat);c.fillStyle='#fff0c9';c.font='bold 12px sans-serif';c.textAlign='center';c.globalAlpha=1-age/900;c.fillText(e.reason==='snap'?'糸が切れた！':'逃げられた…',d.x,d.y-40-age*.018);c.globalAlpha=1}
  if(e.type==='lord'&&age<2200){const q=age/2200,scale=waterScale526(e.y??.4);ripple(c,w*(e.x??.5),h*(e.y??.4),(9+q*28)*scale,(1-q)*.55)}
 }
 if(g.phase==='result'){const age=t-(g.finaleUntil-5200),rows=g.results??[];for(const row of rows){const p=g.players.find(p=>p.playerId===row.playerId),d=dock524(r,p.seat);if(row.biggest){const winner=row.rank===1,size=winner?w*.53/(1+(g.winnerIds.length-1)*.5):w*.18,progress=clamp524(age/1500,0,1),x=winner?d.x+(w*(g.winnerIds.indexOf(p.playerId)+1)/(g.winnerIds.length+1)-d.x)*progress:d.x,y=winner?d.y+(h*.45-d.y)*progress:d.y-40;drawCatch525(c,r,row.biggest,x,y,row.biggest.tier===4&&winner?size*1.5:size,Math.sin(t/400+p.seat)*.06)}}}
}
