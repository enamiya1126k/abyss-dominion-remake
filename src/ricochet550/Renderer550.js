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
function cartArt550(){let im=vehicle550.get('cart');if(!im){im=new Image();im.src=new URL('../../assets/ricochet550/junkgp-cart.png',import.meta.url).href;vehicle550.set('cart',im)}return im}
export function renderer550(canvas){return{canvas,ctx:canvas.getContext('2d',{alpha:false}),width:0,height:0,camera:0,positions:[],trails:new Map()}}
export function resize550(r,w,h,dpr=1){r.width=w;r.height=h;r.dpr=Math.min(2,dpr);r.canvas.width=Math.round(w*r.dpr);r.canvas.height=Math.round(h*r.dpr);r.canvas.style.width=w+'px';r.canvas.style.height=h+'px';r.base=null}
export function projection550(r,g,self){const pin=g.game==='pinball',scale=pin?Math.min((r.width-30)/C.width,(r.height-28)/C.height):(r.width-38)/C.width;const h=r.height/scale,cam=pin?0:Math.max(0,(self?.y??2)-h*.27);return{scale,ox:r.width/2,oy:pin?(r.height+C.height*scale)/2:r.height-12,camera:cam}}
function board550(c,g){const w=C.width,h=C.height;
 rect(c,-w/2-.33,-.33,w+.66,h+.66,.34,grad(c,-6,0,12,21,['#120e09','#ac8243','#fff0bc','#44301b','#c7a05a']), '#debe77',.035);
 rect(c,-6,-.02,12,21.04,.15,grad(c,-6,0,12,21,['#072820','#15513e','#103e34','#082c24']), '#e8c77b',.075);
 for(let y=.3;y<21;y+=.18)line(c,[[-5.9,y],[5.9,y+.08]],'#ffffff03',.018);
 for(const x of [-5.72,5.72])line(c,[[x,.2],[x,20.8]],'#dfb86977',.025);
 for(const y of [.23,20.77])line(c,[[-5.72,y],[5.72,y]],'#dfb86977',.025);
 for(let y=.7;y<21;y+=1.35)for(const x of [-6.17,6.17]){disk(c,x,y,.06,'#24180d','#ffe4a5',.02);line(c,[[x-.035,y],[x+.035,y]],'#daa654',.02)}
 for(const y of [4,10,16]){disk(c,0,y,2.45,null,'#b49c4940',.018);disk(c,0,y,2.55,null,'#b49c4920',.018);star(c,0,y,2.2)}
 for(const x of [-5.15,5.15])for(const y of [1.1,19.9]){c.save();c.translate(x,y);for(let i=0;i<3;i++){c.rotate(Math.PI/3);c.beginPath();c.ellipse(0,.27,.17,.4,0,0,tau);c.strokeStyle='#e5be6d88';c.lineWidth=.025;c.stroke()}c.restore()}
 // The launch sockets are ornamental; all bodies use the same continuous surface.
 for(let i=0;i<4;i++){const x=(i-1.5)*2.25;disk(c,x,2,.84,null,'#d9b46c40',.03);disk(c,x,2,.72,null,'#d9b46c60',.02)}
}
function pin550(c,b,flash,lucky){const r=b.r;
 disk(c,b.x+.1,b.y-.13,r*1.1,'#021813aa');
 disk(c,b.x,b.y,r,radial(c,b.x,b.y,r,['#fff2c0','#c89446','#65421d','#f5cf85']), '#ffe4a0',.035);
 disk(c,b.x,b.y,r*.78,'#503314','#edd190',.025);
 disk(c,b.x,b.y,r*.65,radial(c,b.x,b.y,r*.65,[flash?'#fffff3':lucky?'#fff9bb':'#a5f5c1',flash?'#ffd871':lucky?'#dbaf42':'#2c9b77',lucky?'#72430e':'#064b3d']), '#ffe9a0',.035);
 for(let i=0;i<8;i++){const a=i*tau/8;disk(c,b.x+Math.cos(a)*r*.86,b.y+Math.sin(a)*r*.86,.045,'#ffe4a8')}
 c.save();c.translate(b.x,b.y);c.scale(1,-1);c.textAlign='center';c.textBaseline='middle';c.font=`700 ${r*.47}px Georgia,serif`;c.fillStyle='#fff5c9';c.shadowColor='#091b15';c.shadowBlur=3;c.fillText(lucky?'×2':String(b.value),0,0);c.restore();
 if(flash){disk(c,b.x,b.y,r*1.22,null,'#ffeac1aa',.055);disk(c,b.x,b.y,r*1.45,null,'#ffcd6566',.025)}
}
function chest550(c,b){if(b.claimed!=null){disk(c,b.x,b.y,.25,null,'#d8bd6555',.025);return}c.save();c.translate(b.x,b.y);rect(c,-.46,-.36,.92,.7,.1,grad(c,-.5,-.4,1,.7,['#63391b','#c1843a','#efd59b']), '#ffe0a3',.035);rect(c,-.43,.01,.86,.15,.025,'#143d30','#e7c780',.022);for(const x of [-.27,.27])rect(c,x-.025,-.33,.05,.61,.01,'#edd7a0');rect(c,-.09,-.08,.18,.2,.02,'#fff2bd','#725017',.02);c.restore()}
function road550(c,r,g,pr,at){const low=Math.floor(pr.camera/1.25)*1.25-2,high=pr.camera+r.height/pr.scale+2;
 rect(c,-6.45,low,12.9,high-low,0,grad(c,-6,0,12,0,['#312719','#776043','#b19a6b','#836b49','#302417']));
 c.save();c.beginPath();c.rect(-6,low,12,high-low);c.clip();
 for(let y=low;y<high;y+=1.25){const row=Math.round(y/1.25);for(let col=0;col<5;col++){const x=-6+col*2.6-(row%2?1.3:0);rect(c,x+.04,y+.035,2.51,1.17,.075,grad(c,x,y,2,1,['#9c8964','#77634a']), '#332b2066',.023);line(c,[[x+.1,y+1.12],[x+2.45,y+1.12]],'#ddcaa153',.02);
 const seed=Math.abs(Math.sin(row*17.13+col*45.7));c.globalAlpha=.12+seed*.09;rect(c,x+.06,y+.06,2.45,1.1,.06,grad(c,x,y,2,1,['#efdda3','#553d27']));c.globalAlpha=1;
 for(let i=0;i<4;i++){const dx=.15+((seed*97+i*.483)%1)*2.2,dy=.14+((seed*73+i*.313)%1)*.9;line(c,[[x+dx,y+dy],[x+dx+.08,y+dy+.025]],'#382f243b',.013)}
 if((row+col)%7===0)line(c,[[x+.2,y+.2],[x+.45,y+.32],[x+.54,y+.22]],'#3f362636',.015);
 }}
 for(let y=Math.floor(low/14)*14+6;y<high;y+=14){disk(c,0,y,2.4,null,'#d3b67327',.04);disk(c,0,y,2.28,null,'#4738233b',.025);star(c,0,y,2.05)}
 c.restore();
 for(const x of [-6.15,6.15]){rect(c,x-.12,low,.24,high-low,.025,grad(c,x-.12,0,.24,0,['#573b21','#e0bc7a','#5b432a']));for(let y=Math.floor(low/4)*4;y<high;y+=4){disk(c,x,y,.085,'#ecd397','#543716',.025);line(c,[[x-.06,y],[x+.06,y]],'#54402a',.024)}}
 for(let y=Math.ceil(low/10)*10;y<high;y+=10){line(c,[[-5.8,y],[-4.7,y]],'#f0dfaa80',.04);c.save();c.translate(-5.5,y+.22);c.scale(1,-1);c.fillStyle='#eee0b8bb';c.font='.28px sans-serif';c.textAlign='center';c.fillText(String(y*10)+'m',0,0);c.restore()}
 if(low<2)for(let i=0;i<12;i++)for(let j=0;j<2;j++)rect(c,-6+i,1+j*.3,1,.3,0,(i+j)%2?'#24392c':'#d7caa3');
 const layout=g.layout.posts?.length?g.layout:layout550(g);
 for(const b of layout.belts){if(b.to<low||b.from>high)continue;rect(c,-5.92,b.from,11.84,b.to-b.from,.08,'#06251f','#e8c580',.04);
  for(let y=b.from+.12;y<b.to;y+=.2){const f=(Math.floor(y*10)%2);rect(c,-5.69,y,11.38,.13,.02,grad(c,-5.7,y,0,.13,['#537e70','#173e31','#648979']),null)}
  for(const x of [-5.82,5.82]){rect(c,x-.06,b.from,.12,b.to-b.from,.02,'#caa264');for(let y=b.from+.2;y<b.to;y+=.4)disk(c,x,y,.032,'#fff2c0')}
  for(const x of [-3.2,0,3.2]){for(const y of [b.from+.7,b.from+1.35]){line(c,[[x-.24,y],[x,y+.22],[x+.24,y]],'#573c20',.1);line(c,[[x-.24,y+.025],[x,y+.245],[x+.24,y+.025]],'#f3d191',.06)}disk(c,x,b.from+.22,.055,'#fcce6a')}
 }
 for(const b of layout.posts)if(b.y>low&&b.y<high){disk(c,b.x+.12,b.y-.13,b.r*1.2,'#2b1b16aa');disk(c,b.x,b.y,b.r,radial(c,b.x,b.y,b.r,['#f8edc4','#a59165','#38594b','#173a30']), '#e7cc8b',.055);disk(c,b.x,b.y,b.r*.68,'#174b3b','#d8bd76',.055);star(c,b.x,b.y,b.r*.45)}
}
function spring550(c,x,y,n){line(c,[[x-.17,y-.33],[x+.17,y-.25],[x-.17,y-.13],[x+.17,y],[x-.17,y+.13],[x+.17,y+.25],[x-.17,y+.33]],'#f4e8bd',.04);for(const d of [-.35,.35])line(c,[[x-.2,y+d],[x+.2,y+d]],'#aa874e',.07)}
function pod550(c,p,g,at,vehicle){const color=playerColor499(p).hex,parts=p.parts??{},r=p.r;c.save();c.translate(p.x,p.y);const rot=g.game==='junkgp'?Math.max(-.5,Math.min(.5,Math.atan2(p.vx,Math.abs(p.vy)+3)*.6)):0;c.rotate(-rot);
 disk(c,.07,-.1,r*1.25,'#031a12bb');
 if(g.game==='junkgp'){
  if(vehicle?.complete&&vehicle.naturalWidth){c.save();c.scale(1,-1);c.drawImage(vehicle,-.8,-.8,1.6,1.6);c.restore()}else{
  for(const x of [-.46,.46])for(const y of [-.33,.33]){rect(c,x-.14,y-.2,.28,.4,.07,'#151c16','#c8ad76',.04);line(c,[[x-.11,y-.1],[x+.11,y-.1]],'#5b6554',.028);line(c,[[x-.11,y+.1],[x+.11,y+.1]],'#5b6554',.028)}
  rect(c,-.42,-.55,.84,1.1,.23,grad(c,-.4,0,.8,0,['#725128','#f1dba1','#c4a774','#795229']), '#fce7ba',.034);rect(c,-.32,-.38,.64,.86,.17,color,'#ffe4a6',.04);rect(c,-.26,.28,.52,.13,.03,'#2a493b','#cbb27d',.022);
  }
  line(c,[[.43,-.05],[.43,.53]],'#ecce86',.035);c.beginPath();c.moveTo(.43,.53);c.lineTo(.76,.46);c.lineTo(.43,.33);c.closePath();c.fillStyle=color;c.fill();
  if(parts.armor||parts.bumper){rect(c,-.56,.5,1.12,.15,.04,grad(c,-.5,.5,1,0,['#6e7e72','#e2e8d6','#6e7e72']), '#e4d5a1',.03);for(const x of [-.45,.45])disk(c,x,.58,.033,'#534b37')}
  if(parts.spring){spring550(c,-.64,0,parts.spring);spring550(c,.64,0,parts.spring)}
  if(parts.rocket||parts.coil){for(const x of [-.29,.29]){rect(c,x-.11,-.69,.22,.37,.07,grad(c,x-.1,0,.22,0,['#554c37','#ecdbac','#695940']), '#b0874e',.025);if(p.launched&&Math.hypot(p.vx,p.vy)>5){c.beginPath();c.moveTo(x-.075,-.69);c.lineTo(x,-1-.18*Math.sin(at/73+x));c.lineTo(x+.075,-.69);c.fillStyle='#ffc864';c.fill()}}}
  if(parts.engine||parts.bank){for(let i=0;i<Math.min(4,(parts.engine??0)+(parts.bank??0));i++)rect(c,-.3+i*.17,-.45,.11,.2,.02,'#39392d','#e5c087',.02)}
 }else{
  disk(c,0,0,r*1.07,radial(c,0,0,r*1.07,['#fff9d7','#c4a261','#6e4a25','#eacc84']), '#fff3bd',.028);
  disk(c,0,0,r*.83,'#143c33',color,.07);disk(c,0,0,r*.71,radial(c,0,0,r*.71,[color+'aa','#173d31','#10271f']),'#f9e6b0',.022);
  for(let i=0;i<8;i++){const a=i*tau/8;disk(c,Math.cos(a)*r*.95,Math.sin(a)*r*.95,.033,'#fff5c9')}
  if(parts.echo||parts.crown){line(c,[[-.27,.45],[-.3,.65],[-.12,.55],[0,.75],[.12,.55],[.3,.65],[.27,.45]],'#ffe6a4',.055)}
 }
 if(parts.cell){rect(c,.38,-.38,.16,.36,.04,'#18392f','#e0c382',.023);rect(c,.41,-.33,.1,.25*Math.min(1,p.charge/120),.01,'#b7ffbf')}
 if(parts.magnet||parts.hook){c.beginPath();c.arc(-.45,-.3,.18,0,Math.PI*1.5);c.strokeStyle='#e09766';c.lineWidth=.085;c.stroke()}
 c.restore();
}
function sling550(c,p,pull,pr){if(!pull?.active)return;const power=pull.power,a=pull.angle,nx=Math.sin(a),ny=Math.cos(a);c.save();const tail=1+power*.85,tx=p.x-nx*tail,ty=p.y-ny*tail;const perpendicular=[ny*.14,-nx*.14];for(const sign of [-1,1]){const dx=perpendicular[0]*sign,dy=perpendicular[1]*sign;line(c,[[p.x+dx,p.y+dy],[tx+dx,ty+dy]],'#261b11',.09);line(c,[[p.x+dx,p.y+dy],[tx+dx,ty+dy]],'#d5bc7a',.035)}c.translate(tx,ty);c.rotate(-a);rect(c,-.32,-.1,.64,.2,.09,grad(c,0,-.1,0,.2,['#f6e2b3','#72522f','#cfad70']),'#f7e1a5',.025);c.restore();
 const length=.7+power*.65,x=p.x+nx*.74,y=p.y+ny*.74;c.save();c.translate(x,y);c.rotate(-a);c.beginPath();c.moveTo(-.07,0);c.lineTo(-.07,length-.3);c.lineTo(-.22,length-.3);c.lineTo(0,length);c.lineTo(.22,length-.3);c.lineTo(.07,length-.3);c.lineTo(.07,0);c.closePath();c.fillStyle='#ffeab3';c.fill();c.strokeStyle='#9b673d';c.lineWidth=.025;c.stroke();c.restore();
}
export function paint550(r,g,selfId,u,at){if(!r.width||!r.height)return[];const mix=Math.min(1,(performance.now()-(u.receivedAt??0))/50),players=g.players.map(p=>{const q=u.previous?.round===g.round&&u.previous?.phase===g.phase?u.previous.players.find(q=>q.seat===p.seat):null;return q?{...p,x:q.x+(p.x-q.x)*mix,y:q.y+(p.y-q.y)*mix}:p});const me=players.find(p=>p.playerId===selfId),pr=projection550(r,g,me);if(g.game==='junkgp')r.vehicle??=cartArt550();r.projection=pr;const ctx=r.ctx;ctx.setTransform(r.dpr,0,0,r.dpr,0,0);ctx.fillStyle='#091e19';ctx.fillRect(0,0,r.width,r.height);
 const glow=ctx.createRadialGradient(r.width/2,0,10,r.width/2,0,r.height);glow.addColorStop(0,'#a6843530');glow.addColorStop(1,'#09241f00');ctx.fillStyle=glow;ctx.fillRect(0,0,r.width,r.height);
 ctx.save();ctx.translate(pr.ox,pr.oy);ctx.scale(pr.scale,-pr.scale);ctx.translate(0,-pr.camera);
 if(g.game==='pinball')board550(ctx,g);else road550(ctx,r,g,pr,at);
 for(const b of g.layout.bumpers){const flash=!u.reduced&&g.events.some(e=>e.type==='pin'&&e.x===b.x&&e.y===b.y&&at-e.at<190);pin550(ctx,b,flash,b.id===g.lucky)}for(const b of g.layout.chests)chest550(ctx,b);

 // Trails show only travelled positions. No prediction or landing computation.
 for(const p of players){let trail=r.trails.get(p.seat)??[];if(g.phase!=='play'||u.reduced)trail=[];else if(Math.hypot(p.vx,p.vy)>5){trail.push([p.x,p.y]);if(trail.length>10)trail.shift()}else trail.shift();r.trails.set(p.seat,trail);if(trail.length>1)line(ctx,trail,playerColor499(p).hex+'35',.09)}
 for(const p of players)pod550(ctx,p,g,u.reduced?0:at,r.vehicle);
 const local=players.find(p=>p.playerId===selfId);if(g.phase==='play'&&local&&!local.launched)sling550(ctx,local,u.pull,pr);
 if(g.phase==='play')for(const e of g.events){const age=at-e.at;if(age<0||age>800||e.x==null)continue;const t=age/800;if(!u.reduced&&['wall','hit','pin','treasure','boost'].includes(e.type)){ctx.globalAlpha=1-t;for(let i=0;i<7;i++){const a=i*tau/7+e.id;line(ctx,[[e.x+Math.cos(a)*t*.5,e.y+Math.sin(a)*t*.5],[e.x+Math.cos(a)*t*1.2,e.y+Math.sin(a)*t*1.2]],i%2?'#ffb65c':'#fff1af',.035)}}if(e.value){ctx.globalAlpha=1-t;ctx.save();ctx.translate(e.x,e.y+.5+t*.9);ctx.scale(1,-1);ctx.textAlign='center';ctx.font='700 .5px sans-serif';ctx.strokeStyle='#0a281d';ctx.lineWidth=.09;ctx.strokeText('+'+e.value,0,0);ctx.fillStyle='#fff0b5';ctx.fillText('+'+e.value,0,0);ctx.restore()}ctx.globalAlpha=1}
 ctx.restore();
 r.positions=players.map(p=>({seat:p.seat,x:pr.ox+p.x*pr.scale,y:pr.oy-(p.y-pr.camera)*pr.scale,size:Math.max(18,pr.scale*.8),visible:g.phase==='play'&&p.y>pr.camera-.5&&p.y<pr.camera+r.height/pr.scale+.5}));
 return r.positions;
}
