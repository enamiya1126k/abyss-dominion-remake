import {layout520,camera520} from './Camera520.js';
import {TOWER517 as C,shape517,landing517,BLOCK_COLORS517,fallSpeed517} from './Rules517.js';
export function block517(c,x,y,size,type,alpha=1){
 const color=BLOCK_COLORS517[type]??'#8ccab2',q=size/32;c.save();c.globalAlpha=alpha;c.translate(x,y);c.scale(q,q);
 c.fillStyle='#07120f';c.fillRect(0,0,32,32);let metal=c.createLinearGradient(0,0,32,32);metal.addColorStop(0,'#fff0b2');metal.addColorStop(.25,'#977544');metal.addColorStop(.65,'#463622');metal.addColorStop(1,'#d6b776');c.fillStyle=metal;c.fillRect(1,1,30,30);
 let face=c.createLinearGradient(4,3,28,30);face.addColorStop(0,color);face.addColorStop(.48,'#284442');face.addColorStop(1,'#0b2224');c.fillStyle=face;c.fillRect(4,4,24,24);
 c.fillStyle=color;c.globalAlpha=alpha*.36;c.beginPath();c.moveTo(4,4);c.lineTo(28,4);c.lineTo(23,9);c.lineTo(9,9);c.lineTo(9,23);c.lineTo(4,28);c.closePath();c.fill();c.globalAlpha=alpha;
 c.strokeStyle=color;c.lineWidth=1.1;c.beginPath();c.moveTo(16,9);c.lineTo(22,16);c.lineTo(16,23);c.lineTo(10,16);c.closePath();c.stroke();c.fillStyle='#e7ffff';c.fillRect(15,14,2,4);
 c.fillStyle='#ffedb9';for(const [a,b] of [[2,2],[28,2],[2,28],[28,28]])c.fillRect(a,b,2,2);c.fillStyle='#ffffff4c';c.fillRect(5,4,22,1);c.restore();
}
export function preview517(type,rotation=0){const cells=shape517(type,rotation),w=Math.max(...cells.map(c=>c[0]))+1,h=Math.max(...cells.map(c=>c[1]))+1,s=Math.min(19,44/h),color=BLOCK_COLORS517[type];return`<svg viewBox="0 0 88 48" aria-hidden="true">${cells.map(([x,y])=>{const a=(88-w*s)/2+x*s,b=(48-h*s)/2+(h-y-1)*s;return`<g><rect x="${a}" y="${b}" width="${s-1}" height="${s-1}" rx="1.5" fill="#183c36" stroke="#d3b77b" stroke-width="1"/><path d="M${a+2} ${b+2}h${s-5}l-3 3h-${s-11}v${s-8}l-3 2z" fill="${color}"/><rect x="${a+s*.34}" y="${b+s*.34}" width="${s*.3}" height="${s*.3}" fill="${color}"/></g>`}).join('')}</svg>`}
export function makeRenderer517(canvas){const ctx=canvas.getContext('2d',{alpha:false}),background=document.createElement('canvas'),bg=background.getContext('2d'),settled=document.createElement('canvas'),sc=settled.getContext('2d');const r={canvas,ctx,background,bg,settled,sc,width:0,height:0,boardRevision:-1,tiles:new Map()};if(typeof Image!=='undefined'){r.art=new Image();r.art.onload=()=>{if(!r.disposed&&r.width)resize517(r,r.width,r.height,r.dpr)};r.art.src=new URL('../../assets/tower520/shaft.webp',import.meta.url).href}return r}
export function resize517(r,width,height,dpr=1){
 r.width=width;r.height=height;r.dpr=Math.min(1.5,dpr);Object.assign(r,layout520(width,height,r.overview520));
 r.canvas.width=Math.round(width*r.dpr);r.canvas.height=Math.round(height*r.dpr);
 for(const c of [r.background,r.settled]){c.width=Math.round(width*r.dpr);c.height=Math.ceil(r.worldHeight*r.dpr)}
 r.cameraY=null;r.bottom=r.worldBottom;r.top=r.bottom-C.height*r.cell;const{bg:b}=r,wh=r.worldHeight;
 b.setTransform(r.dpr,0,0,r.dpr,0,0);const gr=b.createLinearGradient(0,0,0,wh);gr.addColorStop(0,'#244b42');gr.addColorStop(.4,'#102d26');gr.addColorStop(1,'#051713');b.fillStyle=gr;b.fillRect(0,0,width,wh);
 if(r.art?.complete&&r.art.naturalWidth){b.drawImage(r.art,0,0,width,wh);b.fillStyle='#00120d70';b.fillRect(r.left,r.top,r.cell*10,r.cell*C.height)}
 b.strokeStyle='#bfddab14';b.lineWidth=.6;
 for(let y=0;y<=C.height;y++){const py=r.bottom-y*r.cell;b.beginPath();b.moveTo(r.left,py);b.lineTo(width-r.left,py);b.stroke()}
 for(let x=0;x<=10;x++){b.beginPath();b.moveTo(r.left+x*r.cell,r.top);b.lineTo(r.left+x*r.cell,r.bottom);b.stroke()}
 for(const x of[r.left-8,width-r.left+1]){const g=b.createLinearGradient(x,0,x+7,0);g.addColorStop(0,'#574025');g.addColorStop(.45,'#edcf87');g.addColorStop(.65,'#8a6936');g.addColorStop(1,'#33261b');b.fillStyle=g;b.fillRect(x,r.top,7,C.height*r.cell+12);
  for(let y=0;y<=C.height;y+=2){const py=r.bottom-y*r.cell;b.fillStyle='#e9ce8a';b.fillRect(x-2,py,11,3);if(y>0&&y<C.height){b.font='7px sans-serif';b.textAlign=x<width/2?'left':'right';b.fillStyle='#d7cca6aa';b.fillText(String(y),x<width/2?x+12:x-4,py-4)}}}
 b.fillStyle='#745d37';b.fillRect(r.left-9,r.bottom,width-2*r.left+18,11);b.fillStyle='#f7e1a0';b.fillRect(r.left-9,r.bottom,width-2*r.left+18,2);
 b.save();b.setLineDash([4,5]);b.strokeStyle='#bffceaaa';b.beginPath();b.moveTo(r.left,r.top);b.lineTo(width-r.left,r.top);b.stroke();b.restore();b.textAlign='center';b.font='700 11px sans-serif';b.fillStyle='#ecffe9';b.fillText('—  SKY GATE  /  脱出  —',width/2,r.top-12);
 r.boardRevision=-1;r.tiles.clear();r.cacheBuilds520=(r.cacheBuilds520??0)+1;
}
export function follow520(r,g,focus,dt,reduced){return camera520(r,g,focus,dt,reduced)}

function tile(r,type){if(!r.tiles.has(type)){const c=document.createElement('canvas'),d=r.dpr,s=r.cell;c.width=Math.ceil(s*d);c.height=Math.ceil(s*d);const ctx=c.getContext('2d');ctx.scale(d,d);block517(ctx,0,0,s,type);r.tiles.set(type,c)}return r.tiles.get(type)}
export function paint517(r,g,players,at,reduced=false){const{ctx:c,width:w,height:h,cell:s,left:l,bottom:b}=r;if(!w)return;c.setTransform(1,0,0,1,0,0);c.drawImage(r.background,0,-(r.cameraY??0)*r.dpr);if(r.boardRevision!==g.boardRevision){r.sc.setTransform(1,0,0,1,0,0);r.sc.clearRect(0,0,r.settled.width,r.settled.height);r.sc.setTransform(r.dpr,0,0,r.dpr,0,0);for(const t of g.board)r.sc.drawImage(tile(r,t.type),l+t.x*s,r.worldBottom-(t.y+1)*s,s,s);r.boardRevision=g.boardRevision}c.drawImage(r.settled,0,-(r.cameraY??0)*r.dpr);c.setTransform(r.dpr,0,0,r.dpr,0,0);
 const f=g.falling,aim=g.aim,cells=f?.cells??shape517(g.hand[aim?.slot??0],aim?.rotation??0),x=f?.x??aim?.x??0,land=f?.land??landing517(g,cells,x);if(g.phase==='play'||g.phase==='countdown'){c.fillStyle=f?'#ecb66710':'#cbe8cc0a';const cols=new Set(cells.map(v=>v[0]));for(const dx of cols)c.fillRect(l+(x+dx)*s,r.top,s,b-r.top);for(const[dx,dy]of cells){c.fillStyle='#f0d4a31a';c.fillRect(l+(x+dx)*s,b-(land+dy+1)*s,s,s);c.strokeStyle=f?'#e8bb7288':'#9cbcaf66';c.setLineDash([3,3]);c.strokeRect(l+(x+dx)*s+1,b-(land+dy+1)*s+1,s-2,s-2);c.setLineDash([])}}
 if(!f&&g.phase==='play'){c.globalAlpha=.65;const a=g.aim,shape=shape517(g.hand[a.slot],a.rotation);for(const [dx,dy] of shape)c.drawImage(tile(r,g.hand[a.slot]),l+(a.x+dx)*s,b-(C.height+.15+dy+1)*s,s,s);c.globalAlpha=1}
 if(f){const lead=g.phase==='result'?0:Math.min(.1,Math.max(0,(at-g.serverAt)/1000)),speed=fallSpeed517(g.elapsed),y=Math.max(f.land,f.y-lead*speed);for(const[dx,dy]of f.cells){const px=l+(f.x+dx)*s,py=b-(y+dy+1)*s;if(!reduced){c.fillStyle=BLOCK_COLORS517[f.type]+'48';const tail=s*(.35+speed/15);c.fillRect(px+5,py-tail,s-10,tail);c.fillStyle='#fff5';c.fillRect(px+2,py-tail*.6,1,tail*.6)}c.drawImage(tile(r,f.type),px,py,s,s)}}
 if(f){const low=Math.min(...f.cells.map(v=>v[1])),edge=b-(f.y+low)*s;if(edge<24){
  const cols=[...new Set(f.cells.map(v=>v[0]))];c.fillStyle='#201a0fed';c.fillRect(l+(f.x+Math.min(...cols))*s,35,(Math.max(...cols)-Math.min(...cols)+1)*s,34);
  c.strokeStyle='#ffdda0';c.lineWidth=2;c.fillStyle='#ffe8b7';for(const dx of cols){const cx=l+(f.x+dx+.5)*s;c.beginPath();c.moveTo(cx-5,43);c.lineTo(cx,49);c.lineTo(cx+5,43);c.stroke()}
  c.textAlign='center';c.font='bold 9px sans-serif';c.fillText('上から接近',Math.max(42,Math.min(w-42,l+(f.x+(Math.min(...cols)+Math.max(...cols)+1)/2)*s)),63);
 }}
 for(const p of players){if(!p.alive||g.elapsed>=(p.superActiveUntil??0))continue;const px=l+p.x*s,py=b-p.y*s;
  const glow=c.createLinearGradient(0,py-s,0,py+s*2);glow.addColorStop(0,'#e5ffdb99');glow.addColorStop(.5,'#6cffe344');glow.addColorStop(1,'#52e9bc00');c.fillStyle=glow;c.beginPath();c.moveTo(px-s*.35,py-s*.3);c.lineTo(px+s*.35,py-s*.3);c.lineTo(px,py+s*2);c.closePath();c.fill();
  if(!reduced){c.strokeStyle='#c3ffeacc';c.lineWidth=1;for(let i=0;i<5;i++){const xx=px+(i-2)*s*.22,yy=py+((at/8+i*23)%(s*1.7));c.beginPath();c.moveTo(xx,yy);c.lineTo(xx,yy+s*.45);c.stroke()}}
 }
 for(const e of g.events){const age=g.elapsed+Math.max(0,at-g.serverAt)-e.at;if(age<0||age>850)continue;const t=age/850,x=l+(e.x??5)*s,y=b-(e.y??0)*s;if(e.type==='superJump'){c.save();c.globalAlpha=1-t;c.strokeStyle='#d7ffe3';c.lineWidth=2;for(let ring=0;ring<2;ring++){c.beginPath();c.ellipse(x,y,(.35+t*2+ring*.2)*s,(.1+t*.35)*s,0,0,Math.PI*2);c.stroke()}c.restore()}
 if(e.type==='sealed'){c.save();c.globalAlpha=1-t;c.strokeStyle='#f3bb80';c.lineWidth=2;c.strokeRect(x-s*.5,y-s*.8,s,s);c.beginPath();c.moveTo(x-s*.5,y-s*.8);c.lineTo(x+s*.5,y+s*.2);c.moveTo(x+s*.5,y-s*.8);c.lineTo(x-s*.5,y+s*.2);c.stroke();c.restore()}
 if(e.type==='slam'||e.type==='crush'||e.type==='bounce'){c.globalAlpha=1-t;c.strokeStyle=e.type==='crush'?'#f7e5ca':e.type==='bounce'?'#abeddd':'#e8bb79';c.lineWidth=2*(1-t);c.beginPath();c.ellipse(x,y,(.15+t*1.9)*s,(.07+t*.4)*s,0,0,Math.PI*2);c.stroke();if(!reduced)for(let i=0;i<8;i++){const angle=i*Math.PI/4;c.fillStyle=i%2?'#ceb286':'#91bcac';c.fillRect(x+Math.cos(angle)*t*s*2,y-Math.abs(Math.sin(angle))*t*s*1.4+t*t*s,3*(1-t)+1,3*(1-t)+1)}c.globalAlpha=1}}
 if(!reduced){c.fillStyle='#fce9a54d';for(let i=0;i<9;i++){const x=l+((i*37)%100)/100*C.width*s,y=(h-((at/70+i*71)%h));c.fillRect(x,y,1.5,1.5)}}
 if(r.worldHeight>h+1&&!r.overview520){const mx=w-45,my=h-(C.height*3.2+28),ms=3.2;c.fillStyle='#031711d9';c.fillRect(mx-4,my-13,40,C.height*ms+19);c.strokeStyle='#c5b17677';c.strokeRect(mx-4,my-13,40,C.height*ms+19);c.font='7px sans-serif';c.textAlign='center';c.fillStyle='#e4d2a2';c.fillText('全体',mx+16,my-4);
  c.fillStyle='#698d70';for(const t of g.board)c.fillRect(mx+t.x*ms,my+(C.height-1-t.y)*ms,ms-.4,ms-.4);
  for(const p of players)if(p.role==='run'&&p.alive){c.fillStyle=p.playerId===r.self520?'#fff3ba':'#a3f6dd';c.fillRect(mx+p.x*ms-1,my+(C.height-p.y)*ms-2,2.5,2.5)}
  if(f){c.fillStyle='#ffc27a';for(const[dx,dy]of f.cells)if(f.y+dy<C.height)c.fillRect(mx+(f.x+dx)*ms,my+(C.height-1-f.y-dy)*ms,ms-.4,ms-.4)}
  const top=Math.max(0,(r.cameraY-(r.worldBottom-C.height*s))/s),vh=Math.min(C.height-top,h/s);c.strokeStyle='#f5e3a5';c.lineWidth=1;c.strokeRect(mx,my+top*ms,32,vh*ms);
 }
 return{cell:s,left:l,bottom:b};}
