import {WALLS585,wallPosition585} from './Rules585.js';
import {gaps586,segments586} from './Mechanics586.js';
import {color563} from '../party/Arcade563.js';
export const direction585=['上','下','左','右'];
export const arrow585=['↓','↑','→','←'];
export function board585(canvas){return {canvas,ctx:canvas.getContext('2d'),size:1,seen:0,particles:[]};}
export function resize585(r,size,dpr=1){r.size=size;r.dpr=Math.min(2,dpr);r.canvas.width=Math.round(size*r.dpr);r.canvas.height=Math.round(size*r.dpr);}
// Faceted steel blocks, brass rails, sockets and shaded spikes share the collider's bounds.
function segment(c,a,b,y,s,kind){if(b-a<.001)return;const x=a*s,width=(b-a)*s,h=WALLS585.thickness*s,cy=y*s;
 c.shadowColor='#000b';c.shadowBlur=s*.017;c.shadowOffsetY=s*.016;c.fillStyle='#060c0c';c.fillRect(x,cy-h*.48,width,h*.72);c.shadowBlur=0;c.shadowOffsetY=0;
 const cells=Math.max(1,Math.ceil(width/(s*.082))),cw=width/cells;
 for(let i=0;i<cells;i++){const xx=x+i*cw,grad=c.createLinearGradient(xx,cy-h*.48,xx+cw,cy+h*.2);grad.addColorStop(0,'#8d9985');grad.addColorStop(.16,'#344b45');grad.addColorStop(.55,'#142924');grad.addColorStop(1,'#090f12');c.fillStyle=grad;c.fillRect(xx+1,cy-h*.48,cw-2,h*.67);c.strokeStyle='#172622';c.lineWidth=1;c.strokeRect(xx+1,cy-h*.48,cw-2,h*.67);
 c.fillStyle=kind==='chase'?'#dc8c4e':kind==='double'?'#79c9a6':'#dab97a';for(const px of [xx+cw*.2,xx+cw*.8]){c.beginPath();c.arc(px,cy-h*.28,Math.max(1,s*.0038),0,Math.PI*2);c.fill();}
 for(let j=0;j<2;j++){const sx=xx+j*cw/2,sw=cw/2;c.fillStyle='#151d1b';c.fillRect(sx+sw*.1,cy+h*.02,sw*.8,h*.17);c.beginPath();c.moveTo(sx+sw*.10,cy+h*.11);c.lineTo(sx+sw*.5,cy+h*.5);c.lineTo(sx+sw*.9,cy+h*.11);c.closePath();c.fillStyle='#aebfac';c.fill();c.beginPath();c.moveTo(sx+sw*.5,cy+h*.11);c.lineTo(sx+sw*.5,cy+h*.5);c.lineTo(sx+sw*.9,cy+h*.11);c.fillStyle='#52665f';c.fill();c.strokeStyle='#e0e9cf';c.lineWidth=.7;c.beginPath();c.moveTo(sx+sw*.1,cy+h*.11);c.lineTo(sx+sw*.5,cy+h*.5);c.stroke();}}
 const rail=c.createLinearGradient(0,cy-h*.5,0,cy-h*.29);rail.addColorStop(0,'#fbdb91');rail.addColorStop(.45,'#866632');rail.addColorStop(1,'#352b18');c.fillStyle=rail;c.fillRect(x,cy-h*.5,width,h*.13);c.strokeStyle='#bca26b';c.strokeRect(x,cy-h*.49,width,h*.69);
}
export function paint585(r,g,u,at){const c=r.ctx,s=r.size;c.setTransform(r.dpr,0,0,r.dpr,0,0);c.clearRect(0,0,s,s);if(!g)return;
 // A thin ground trail shows direction without obscuring the collision circle.
 for(const p of g.players){if(!p.alive||Math.hypot(p.vx??0,p.vy??0)<.1)continue;const dash=at<p.dashUntil;c.strokeStyle=color563(p)+(dash?'a0':'45');c.lineWidth=dash?s*.026:s*.01;c.lineCap='round';c.beginPath();c.moveTo((p.x-(p.vx??0)*(dash?.09:.035))*s,(p.y-(p.vy??0)*(dash?.09:.035))*s);c.lineTo(p.x*s,p.y*s);c.stroke();}c.lineCap='butt';
 for(const w of g.walls){const warning=at<w.launchAt,pos=wallPosition585(w,at),gaps=gaps586(w);c.save();if(w.dir===1){c.translate(0,s);c.scale(1,-1);}if(w.dir===2)c.transform(0,1,1,0,0,0);if(w.dir===3)c.transform(0,1,-1,0,s,0);
 const front=w.dir===0||w.dir===2?pos:1-pos,near=front>-.1&&front<1.1;
 if(warning){const pulse=u.reduced?.5:.5+.16*Math.sin(at/150);for(const [a,b]of segments586(w)){c.fillStyle=`rgba(246,109,64,${pulse})`;c.fillRect(a*s,0,(b-a)*s,s*.025);c.strokeStyle='rgba(255,177,98,.35)';c.lineWidth=1;for(let x=a*s;x<b*s;x+=12){c.beginPath();c.moveTo(x,0);c.lineTo(Math.min(b*s,x+6),s*.025);c.stroke();}}
 for(const gap of gaps){const lo=gap.center-gap.width/2,hi=gap.center+gap.width/2;c.fillStyle='rgba(112,255,189,.10)';c.fillRect(lo*s,0,gap.width*s,s);c.strokeStyle='rgba(166,255,200,.55)';c.lineWidth=1;c.setLineDash([4,7]);for(const edge of [lo,hi]){c.beginPath();c.moveTo(edge*s,0);c.lineTo(edge*s,s);c.stroke();}c.setLineDash([]);for(let i=0;i<3;i++){const y=s*(.035+i*.045);c.strokeStyle='#d7ffce';c.lineWidth=2;c.beginPath();c.moveTo(gap.center*s-s*.025,y);c.lineTo(gap.center*s,y+s*.018);c.lineTo(gap.center*s+s*.025,y);c.stroke();}}}
 else if(near){const y=front*s;for(const [a,b]of segments586(w)){const glow=c.createLinearGradient(0,y,0,y+s*.065);glow.addColorStop(0,'rgba(255,142,68,.3)');glow.addColorStop(1,'transparent');c.fillStyle=glow;c.fillRect(a*s,y,(b-a)*s,s*.065);segment(c,a,b,front,s,w.pattern);}
 for(const gap of gaps){const lo=gap.center-gap.width/2,hi=gap.center+gap.width/2;c.strokeStyle='#ccf7b6';c.lineWidth=2;c.shadowColor='#a6f8b2';c.shadowBlur=8;for(const edge of [lo,hi]){c.beginPath();c.moveTo(edge*s,y-s*.045);c.lineTo(edge*s,y+s*.045);c.stroke();}c.shadowBlur=0;c.fillStyle='#a7eab213';c.fillRect(lo*s,y-s*.035,gap.width*s,s*.07);}}
 c.restore();}
 if(u.target&&u.pointer==null&&g.stage==='run'){c.strokeStyle='#f5e4ab77';c.lineWidth=1.5;c.setLineDash([3,4]);c.beginPath();c.arc(u.target.x*s,u.target.y*s,s*.026,0,Math.PI*2);c.stroke();c.setLineDash([]);}
 for(const e of g.events){if(e.id<=r.seen)continue;r.seen=e.id;if(u.reduced||at-e.at>700)continue;if(e.type==='out'||e.type==='dash'){const p=g.players[e.seat],out=e.type==='out',count=out?24:9;for(let i=0;i<count;i++){const a=i*2.399;r.particles.push({x:e.x,y:e.y,vx:out?Math.cos(a)*(.06+(i%4)*.05):-e.dx*.2+Math.cos(a)*.07,vy:out?Math.sin(a)*.15:-e.dy*.2+Math.sin(a)*.07,born:e.at,life:out?850:450,color:i%3?color563(p):'#ffe3aa'});}}}
 r.particles=r.particles.filter(p=>at-p.born<p.life).slice(-110);for(const p of r.particles){const age=(at-p.born)/1000;c.globalAlpha=Math.max(0,1-(at-p.born)/p.life);c.fillStyle=p.color;c.fillRect((p.x+p.vx*age)*s,(p.y+p.vy*age+age*age*.07)*s,2.5,2.5);}c.globalAlpha=1;
}
