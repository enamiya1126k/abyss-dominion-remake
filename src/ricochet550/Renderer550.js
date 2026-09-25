import {road554,kart554,motorSling554,sparks554,speedVeil554} from './Art554.js';
import {nitroActive554} from './Motor554.js';
import {aura553} from './Art553.js';
import {overdrive553} from './Rush553.js';
import {cabinet552,pod552,sling552,sparks552} from './Art552.js';
import {image551,drawArt551,prop551,atlas551} from './Art551.js';
import {RICOCHET550 as C,layout550} from './Rules550.js';
import {level550 as L,THEMES550} from './Catalog550.js';
import {playerColor499} from '../party/PartyColors499.js';
const tau=Math.PI*2;
function disk(c,x,y,r,fill,stroke,width=1){c.beginPath();c.arc(x,y,r,0,tau);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function rect(c,x,y,w,h,r,fill,stroke,width=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function grad(c,x,y,w,h,colors){const g=c.createLinearGradient(x,y,x+w,y+h);colors.forEach((v,i)=>g.addColorStop(i/(colors.length-1),v));return g}
function radial(c,x,y,r,colors){const g=c.createRadialGradient(x-r*.25,y-r*.3,0,x,y,r);colors.forEach((v,i)=>g.addColorStop(i/(colors.length-1),v));return g}
function line(c,points,color,w=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=w;c.stroke()}
function star(c,x,y,r){c.save();c.translate(x,y);c.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,s=i%2?r*.18:r;c.lineTo(Math.cos(a)*s,Math.sin(a)*s)}c.closePath();c.strokeStyle='#e1c47970';c.lineWidth=.022;c.stroke();c.restore()}
const vehicle550=new Map();
function cartArt550(){let im=vehicle550.get('cart');if(!im){im=new Image();im.src=new URL('../../assets/ricochet551/scrap-kart.png',import.meta.url).href;vehicle550.set('cart',im)}return im}
export function renderer550(canvas){return{canvas,ctx:canvas.getContext('2d',{alpha:false}),width:0,height:0,camera:0,positions:[],trails:new Map()}}
export function resize550(r,w,h,dpr=1){r.width=w;r.height=h;r.dpr=Math.min(2,dpr);r.canvas.width=Math.round(w*r.dpr);r.canvas.height=Math.round(h*r.dpr);r.canvas.style.width=w+'px';r.canvas.style.height=h+'px';r.base=null}
export function projection550(r,g,self){
 const pin=g.game==='pinball',land=r.width>r.height*1.4,available=r.width;
 const scale=pin?Math.min((available-6)/14.646,(r.height-8)/20.866):Math.min(available/16,r.height/15),camera=pin?0:Math.max(0,(self?.y??2)-2);
 return{scale,ox:available/2,oy:pin?r.height/2+8.762*scale:r.height*.74+2*scale,camera};
}
function road550(c,r,g,pr,at){const low=pr.camera-(r.height-pr.oy)/pr.scale-3,high=pr.camera+pr.oy/pr.scale+3;
 const im=image551('workshop-road');
 if(im.complete&&im.naturalWidth){const crop=.055,cw=1-crop*2,w=16,h=w*im.naturalHeight/(im.naturalWidth*cw);
  // Sample a central strip of the source so artwork rails agree with the physical ±6 walls.
  for(let i=Math.floor(low/h);i*h<high;i++){c.save();c.translate(0,i*h+h/2);c.scale(1,i%2?-1:1);c.scale(1,-1);c.drawImage(im,im.naturalWidth*crop,0,im.naturalWidth*cw,im.naturalHeight,-w/2,-h/2,w,h+.018);c.restore()}
 }else rect(c,-8,low,16,high-low,0,'#a48a62');
 for(const x of [-6.05,6.05]){line(c,[[x,low],[x,high]],'#70562c',.065);line(c,[[x-.035,low],[x-.035,high]],'#f4d68a',.035)}
 for(let y=Math.ceil(low/20)*20;y<high;y+=20){if(y<=0)continue;c.save();c.translate(-6.5,y);c.scale(1,-1);rect(c,-.28,-.45,.56,.9,.06,'#103d31d9','#ccae6b',.02);c.rotate(-Math.PI/2);c.fillStyle='#f4d999';c.font='.23px sans-serif';c.textAlign='center';c.fillText(String(y*10)+'m',0,.08);c.restore()}
 if(low<2&&high>1)for(let i=0;i<12;i++)for(let j=0;j<2;j++)rect(c,-6+i,.5+j*.25,1,.25,0,(i+j)%2?'#17412ad1':'#fff0bad1');
 const layout=g.layout.posts?.length?g.layout:layout550(g);
 for(const b of layout.belts){if(b.to<low||b.from>high)continue;const center=(b.to+b.from)/2,h=b.to-b.from;
  if(!prop551(c,1,b.x,center,b.w*1.24,h*1.24)){rect(c,b.x-b.w/2,b.from,b.w,h,.15,'#1f604c','#d9b366',.05);for(let y=b.from+.2;y<b.to;y+=.26)line(c,[[b.x-b.w*.45,y],[b.x+b.w*.45,y]],'#b9b78c',.07)}
  if(!r.reduced){const t=(at/680)%1;c.globalAlpha=.24*(1-t);line(c,[[b.x-b.w*.35,b.from+t*h],[b.x+b.w*.35,b.from+t*h]],'#ceffb5',.13);c.globalAlpha=1}
 }
 for(const b of layout.posts)if(b.y>low&&b.y<high){if(!prop551(c,0,b.x,b.y,b.r*2.62)){disk(c,b.x,b.y,b.r,'#20533f','#f0d28e',.07)}}
 for(const b of layout.pickups??[])if(b.claimed==null&&b.y>low&&b.y<high){if(!r.reduced){disk(c,b.x,b.y,.54+Math.sin(at/240+b.id)*.025,null,'#b3ed9977',.035)}if(!prop551(c,2,b.x,b.y,1.26))disk(c,b.x,b.y,.3,'#acffd1','#ffe5a2',.04)}
}
function spring550(c,x,y,n){line(c,[[x-.17,y-.33],[x+.17,y-.25],[x-.17,y-.13],[x+.17,y],[x-.17,y+.13],[x+.17,y+.25],[x-.17,y+.33]],'#f4e8bd',.04);for(const d of [-.35,.35])line(c,[[x-.2,y+d],[x+.2,y+d]],'#aa874e',.07)}
function pod550(c,p,g,at,vehicle){const color=playerColor499(p).hex,parts=p.parts??{},r=p.r;c.save();c.translate(p.x,p.y);const rot=g.game==='junkgp'?Math.max(-.5,Math.min(.5,Math.atan2(p.vx,Math.abs(p.vy)+3)*.6)):0;c.rotate(-rot);
 disk(c,.07,-.1,r*1.25,'#031a12bb');
 if(g.game==='junkgp'){
  if(vehicle?.complete&&vehicle.naturalWidth){c.save();c.scale(-1,1);c.drawImage(vehicle,-1.16,-1.16,2.32,2.32);c.restore()}else{
  for(const x of [-.46,.46])for(const y of [-.33,.33]){rect(c,x-.14,y-.2,.28,.4,.07,'#151c16','#c8ad76',.04);line(c,[[x-.11,y-.1],[x+.11,y-.1]],'#5b6554',.028);line(c,[[x-.11,y+.1],[x+.11,y+.1]],'#5b6554',.028)}
  rect(c,-.42,-.55,.84,1.1,.23,grad(c,-.4,0,.8,0,['#725128','#f1dba1','#c4a774','#795229']), '#fce7ba',.034);rect(c,-.32,-.38,.64,.86,.17,color,'#ffe4a6',.04);rect(c,-.26,.28,.52,.13,.03,'#2a493b','#cbb27d',.022);
  }
  line(c,[[.63,-.05],[.63,.73]],'#ecce86',.035);c.beginPath();c.moveTo(.63,.73);c.lineTo(.99,.64);c.lineTo(.63,.45);c.closePath();c.fillStyle=color;c.fill();
  if(parts.armor||parts.bumper){atlas551(c,'junkgp','bumper',0,.79,1.45,.6);rect(c,-.56,.5,1.12,.15,.04,grad(c,-.5,.5,1,0,['#6e7e72','#e2e8d6','#6e7e72']), '#e4d5a1',.03);for(const x of [-.45,.45])disk(c,x,.58,.033,'#534b37')}
  if(parts.spring){atlas551(c,'junkgp','spring',-.79,0,.45,.7);atlas551(c,'junkgp','spring',.79,0,.45,.7)}
  if(parts.rocket||parts.coil){atlas551(c,'junkgp','rocket',0,-.82,1.1,.75);for(const x of [-.29,.29]){rect(c,x-.11,-.69,.22,.37,.07,grad(c,x-.1,0,.22,0,['#554c37','#ecdbac','#695940']), '#b0874e',.025);if(p.launched&&Math.hypot(p.vx,p.vy)>5){c.beginPath();c.moveTo(x-.075,-.69);c.lineTo(x,-1-.18*Math.sin(at/73+x));c.lineTo(x+.075,-.69);c.fillStyle='#ffc864';c.fill()}}}
  if(parts.engine||parts.bank){for(let i=0;i<Math.min(4,(parts.engine??0)+(parts.bank??0));i++)rect(c,-.3+i*.17,-.45,.11,.2,.02,'#39392d','#e5c087',.02)}
 }else{pod552(c,p,color,at,false)}
 if(parts.cell){rect(c,.38,-.38,.16,.36,.04,'#18392f','#e0c382',.023);rect(c,.41,-.33,.1,.25*Math.min(1,p.charge/120),.01,'#b7ffbf')}
 if(parts.magnet||parts.hook){c.beginPath();c.arc(-.45,-.3,.18,0,Math.PI*1.5);c.strokeStyle='#e09766';c.lineWidth=.085;c.stroke()}
 c.restore();
}
function sling550(c,p,pull,pr){if(!pull?.active)return;const power=pull.power,a=pull.angle,nx=Math.sin(a),ny=Math.cos(a);c.save();const tail=1+power*.85,tx=p.x-nx*tail,ty=p.y-ny*tail;const perpendicular=[ny*.14,-nx*.14];for(const sign of [-1,1]){const dx=perpendicular[0]*sign,dy=perpendicular[1]*sign;line(c,[[p.x+dx,p.y+dy],[tx+dx,ty+dy]],'#261b11',.09);line(c,[[p.x+dx,p.y+dy],[tx+dx,ty+dy]],'#d5bc7a',.035)}c.translate(tx,ty);c.rotate(-a);rect(c,-.32,-.1,.64,.2,.09,grad(c,0,-.1,0,.2,['#f6e2b3','#72522f','#cfad70']),'#f7e1a5',.025);c.restore();
 const length=.7+power*.65,x=p.x+nx*.74,y=p.y+ny*.74;c.save();c.translate(x,y);c.rotate(-a);c.beginPath();c.moveTo(-.07,0);c.lineTo(-.07,length-.3);c.lineTo(-.22,length-.3);c.lineTo(0,length);c.lineTo(.22,length-.3);c.lineTo(.07,length-.3);c.lineTo(.07,0);c.closePath();c.fillStyle='#ffeab3';c.fill();c.strokeStyle='#9b673d';c.lineWidth=.025;c.stroke();c.restore();
}
export function paint550(r,g,selfId,u,at){if(!r.width||!r.height)return[];const mix=Math.min(1,(performance.now()-(u.receivedAt??0))/50),players=g.players.map(p=>{const q=u.previous?.id===g.id&&u.previous?.phase===g.phase?u.previous.players.find(q=>q.seat===p.seat):null;return q?{...p,x:q.x+(p.x-q.x)*mix,y:q.y+(p.y-q.y)*mix}:p});const me=players.find(p=>p.playerId===selfId);r.reduced=u.reduced;r.self=me;const pr=projection550(r,g,me);if(!u.reduced&&u.impact553){const age=at-u.impact553.at;if(age>=0&&age<160){const fade=1-age/160;pr.ox+=Math.sin(age*.17)*u.impact553.strength*fade;pr.oy+=Math.cos(age*.19)*u.impact553.strength*.7*fade;}}if(g.game==='junkgp')r.vehicle??=cartArt550();r.projection=pr;const ctx=r.ctx;ctx.setTransform(r.dpr,0,0,r.dpr,0,0);ctx.fillStyle='#091e19';ctx.fillRect(0,0,r.width,r.height);
 const glow=ctx.createRadialGradient(r.width/2,0,10,r.width/2,0,r.height);glow.addColorStop(0,'#a6843530');glow.addColorStop(1,'#09241f00');ctx.fillStyle=glow;ctx.fillRect(0,0,r.width,r.height);
 ctx.save();ctx.translate(pr.ox,pr.oy);ctx.scale(pr.scale,-pr.scale);ctx.translate(0,-pr.camera);
 if(g.game==='pinball')cabinet552(ctx,g,r,at);else road554(ctx,r,g,pr,at);


 // Trails show only travelled positions. No prediction or landing computation.
 for(const p of players){
  let trail=r.trails.get(p.seat)??[],pin=g.game==='pinball';
  if(g.phase!=='play'||u.reduced)trail=[];
  else if(Math.hypot(p.vx,p.vy)>5){
   const last=trail.at(-1);if(last&&Math.hypot(p.x-last[0],p.y-last[1])>(pin?2.5:5))trail=[];
   if(!last||Math.hypot(p.x-last[0],p.y-last[1])>.025)trail.push([p.x,p.y,at]);
   if(trail.length>10)trail.shift();
   trail=trail.filter(t=>at-t[2]<(pin?140:120));let length=0;for(let i=trail.length-1;i>0;i--){length+=Math.hypot(trail[i][0]-trail[i-1][0],trail[i][1]-trail[i-1][1]);if(length>(pin?2.1:3.2)){trail=trail.slice(i);break}}
  }else trail.shift();
  r.trails.set(p.seat,trail);
  if(trail.length>1){const hot=pin?overdrive553(p,at):nitroActive554(p,at);ctx.save();ctx.lineCap='round';for(let i=1;i<trail.length;i++){ctx.globalAlpha=.08+(pin?.28:.2)*i/trail.length;line(ctx,[trail[i-1],trail[i]],hot?'#ffdc83':playerColor499(p).hex,.025+(hot?.19:.1)*i/trail.length)}ctx.restore()}
 }
 for(const p of players){
  if(g.game==='junkgp'&&p.tailwind>.1&&!u.reduced){ctx.globalAlpha=.22*p.tailwind;for(let k=0;k<3;k++){const x=p.x+(k-1)*.43,y=p.y-.9-(at/180+k*.3)%1.6;line(ctx,[[x,y],[x,y-.65]],'#e6ffde',.06)}ctx.globalAlpha=1}
  if(g.game==='pinball'){aura553(ctx,p,at,u.reduced);pod552(ctx,p,playerColor499(p).hex,at,u.reduced);}else kart554(ctx,p,g,at,playerColor499(p).hex,u.reduced);
 }
 const local=players.find(p=>p.playerId===selfId);if(g.phase==='play'&&local&&(!local.launched||u.pullMode==='burst'||u.pullMode==='nitro')){if(g.game==='pinball')sling552(ctx,local,u.pull,playerColor499(local).hex);else motorSling554(ctx,local,u.pull,playerColor499(local).hex);}
 if(g.game==='pinball')sparks552(ctx,g,r,at);
 if(g.game==='junkgp')sparks554(ctx,g,r,at);
 ctx.restore();if(g.game==='junkgp')speedVeil554(ctx,r,me,at,u.reduced);
 r.positions=players.map(p=>({seat:p.seat,x:pr.ox+p.x*pr.scale,y:pr.oy-(p.y-pr.camera)*pr.scale,size:Math.max(20,pr.scale*(g.game==='junkgp'?1.13:1.03)),visible:g.phase==='play'&&pr.oy-(p.y-pr.camera)*pr.scale> -40&&pr.oy-(p.y-pr.camera)*pr.scale<r.height+40}));
 return r.positions;
}
