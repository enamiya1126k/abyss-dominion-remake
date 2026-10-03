import {bursts584} from './Polish584.js';
import {chairLocation584} from './Rules583.js';
import {color563} from '../party/Arcade563.js';

const throneURL=new URL('../../assets/chairs583/throne.webp',import.meta.url).href;
export function chairArt583(){return `<img src="${throneURL}" alt="" draggable="false" width="300" height="450">`;}
export function board583(canvas){return {canvas,ctx:canvas.getContext('2d'),w:0,h:0,seen:0,particles:[]};}
export function resize583(r,w,h,dpr){r.w=w;r.h=h;const scale=Math.min(dpr,2);r.canvas.width=Math.round(w*scale);r.canvas.height=Math.round(h*scale);r.ctx.setTransform(scale,0,0,scale,0,0);}
export function paintBoard583(r,g,u,at){
 const x=r.ctx,w=r.w,h=r.h;if(!w||!h)return;x.clearRect(0,0,w,h);
 bursts584(r,g,u,at);
 const dancing=g.phase==='play'&&g.stage==='dance';
 if(dancing){
  x.save();x.globalAlpha=.35;x.strokeStyle='#e7c981';x.lineWidth=1;x.setLineDash([2,9]);x.beginPath();x.ellipse(w*.5,h*.58,w*.37,h*.30,0,0,Math.PI*2);x.stroke();x.restore();
  if(!u.reduced)for(let i=0;i<5;i++){const t=(at/1900+i*.2)%1;x.globalAlpha=Math.sin(t*Math.PI)*.7;x.fillStyle=i%2?'#a3dac0':'#f3d9a1';x.font='22px serif';x.fillText(i%2?'♪':'♫',w*(.12+i*.18),h*(.88-t*.5));}x.globalAlpha=1;
 }
 for(const e of g.events){if(e.id<=r.seen)continue;r.seen=e.id;if(e.type!=='sit'||at-e.at>900||u.reduced)continue;const pos=chairLocation584(g,e.chair),color=color563(g.players[e.seat]);for(let i=0;i<(e.gold?44:22);i++){const a=i*Math.PI*2/(e.gold?44:22);r.particles.push({x:pos.x*w,y:pos.y*h,at:e.at,vx:Math.cos(a)*(35+i%4*17),vy:Math.sin(a)*60-40,color:i%3?color:'#ffe5a4',size:2+i%3});}}
 r.particles=r.particles.filter(p=>at-p.at<1000).slice(-120);
 for(const p of r.particles){const t=(at-p.at)/1000;if(t<0)continue;x.globalAlpha=1-t;x.fillStyle=p.color;x.save();x.translate(p.x+p.vx*t,p.y+p.vy*t+80*t*t);x.rotate(t*5);x.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.7);x.restore();}x.globalAlpha=1;
}
