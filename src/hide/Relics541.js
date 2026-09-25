import {gatesOpen559,exits559} from './Heist541.js';
let atlas;
function art(){if(!atlas){atlas=new Image();atlas.src='./assets/hide541/relics.webp'}return atlas}
function label(c,s,y,size,color){c.font=`800 ${size}px "Noto Sans JP",sans-serif`;c.textAlign='center';c.textBaseline='middle';const w=c.measureText(s).width;c.fillStyle='#12382eea';c.strokeStyle=color+'88';c.lineWidth=2;c.beginPath();c.roundRect(-w/2-13,y-size*.65,w+26,size*1.3,8);c.fill();c.stroke();c.fillStyle=color;c.fillText(s,0,y)}
export function relics541(c,g,overview=false,reduced=false){
 const h=g.heist541;if(!h)return;const im=art(),open=gatesOpen559(h);
 const nodes=[...h.seals.map(s=>({...s,cell:0,label:s.done?'✓ '+(s.short??s.name):`${s.id+1} ${s.short??'封印'}`,color:s.done?'#a9efd0':s.alarmUntil>g.elapsed?'#ffb387':'#f8d78c',idle:open&&!s.done})),...exits559(h).map(e=>({...e,cell:1,label:(e.short??e.name)+(open?' OPEN':' · 鍵３つ'),color:open?'#a9f4ef':'#c8bd99'})),{...h.cage,cell:2,label:h.prisoners?.length?'仲間を救出':'救出の檻',color:'#bed0ef'}];
 for(const o of nodes){
  c.save();c.translate(o.x,o.y);const size=overview?230:o.cell===1?255:185,alarm=!o.done&&!o.idle&&o.alarmUntil>g.elapsed;
  c.globalAlpha=o.idle?.42:o.done?.78:1;
  c.fillStyle='#09282066';c.beginPath();c.ellipse(3,13,size*.42,size*.19,0,0,Math.PI*2);c.fill();
  if(alarm||o.cell===1&&open){const pulse=reduced?0:(1+Math.sin(g.elapsed/260))*.5;c.strokeStyle=o.color+'a0';c.lineWidth=overview?13:5;c.beginPath();c.ellipse(0,8,105+pulse*14,48+pulse*6,0,0,Math.PI*2);c.stroke()}
  if(im.complete&&im.naturalWidth){const sw=im.naturalWidth/2,sh=im.naturalHeight/2;c.drawImage(im,o.cell%2*sw,Math.floor(o.cell/2)*sh,sw,sh,-size/2,-size*.76,size,size)}else{c.fillStyle=o.color;c.fillRect(-25,-45,50,50)}
  if(o.cell===0&&!o.done&&!o.idle){c.strokeStyle='#173d32';c.lineWidth=overview?13:8;c.beginPath();c.arc(0,0,103,0,Math.PI*2);c.stroke();if(o.progress){c.strokeStyle=o.color;c.lineCap='round';c.beginPath();c.arc(0,0,103,-Math.PI/2,-Math.PI/2+Math.PI*2*o.progress/(h.sealMs??8000));c.stroke()}}
  label(c,o.label,overview?160:size*.48,overview?88:30,o.color);c.restore();
 }
}
export function decoySmoke541(c,g,at){const im=art();if(!im.complete||!im.naturalWidth)return;for(const e of g.events){const age=g.elapsed-e.at;if(e.type!=='decoy541'||age<0||age>700)continue;c.save();c.globalAlpha=(1-age/700)*.75;const sw=im.naturalWidth/2,sh=im.naturalHeight/2,size=175+age*.05;c.drawImage(im,sw,sh,sw,sh,e.x-size/2,e.y-size*.85,size,size);c.restore()}}
export function miniRelics541(c,h,k,elapsed=0){
 if(!h)return;c.save();const open=gatesOpen559(h);
 for(const s of h.seals){c.fillStyle=s.done?'#a3f6d4':open?'#738c77':s.alarmUntil>elapsed?'#ffaf7a':'#ffde83';c.strokeStyle='#163a2d';c.lineWidth=1;c.beginPath();c.arc(s.x*k,s.y*k,3.2,0,Math.PI*2);c.fill();c.stroke()}
 for(const gate of exits559(h)){c.fillStyle=open?'#a2ffff':'#ede3c0';c.fillRect(gate.x*k-4,gate.y*k-3,8,6)}
 if(h.prisoners?.length){c.fillStyle='#b2bfff';c.fillRect(h.cage.x*k-3,h.cage.y*k-3,6,6)}c.restore();
}
export function guide541(c,g,p,cam,w,h){
 if(!p?.alive||!g.heist541)return;const heist=g.heist541,open=gatesOpen559(heist);
 let targets=open?exits559(heist):heist.seals.filter(s=>!s.done&&(!p.hunter||s.alarmUntil>g.elapsed));
 if(!open)targets=[...targets].sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,1);
 if(p.hunter&&open)return;
 const used=[];
 for(const target of targets){const x=(target.x-cam.x)*cam.scale,y=(target.y-cam.y)*cam.scale;if(x>40&&x<w-40&&y>100&&y<h-110)continue;const xx=Math.max(41,Math.min(w-41,x));let yy=Math.max(115,Math.min(h-126,y));if(used.some(q=>Math.abs(q.x-xx)<85&&Math.abs(q.y-yy)<38))yy-=40;used.push({x:xx,y:yy});
  c.save();c.translate(xx,yy);c.fillStyle='#10362ff2';c.strokeStyle=open?'#a0e7d3':'#dec284';c.lineWidth=1;c.beginPath();c.roundRect(-37,-18,74,36,7);c.fill();c.stroke();c.fillStyle=open?'#baf8e8':'#ffe1a1';c.font='800 10px "Noto Sans JP",sans-serif';c.textAlign='center';c.fillText(open?(target.short??target.name):`${target.id+1} ${target.short??'封印'}`,0,-3);c.fillText(['→','↘','↓','↙','←','↖','↑','↗'][(Math.round(Math.atan2(y-h*.57,x-w/2)/(Math.PI/4))+8)%8],0,11);c.restore();
 }
}
