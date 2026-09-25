// Project materials onto the shared floor geometry, including half-width surfaces.
import {rug557} from './Rug557.js';
const quad=(c,project,l,f,r,t)=>{c.beginPath();for(const [i,[x,y]]of [[l,f],[r,f],[r,t],[l,t]].entries()){const p=project(x,y);if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y)}c.closePath()};
const line=(c,P,x,y,a,b,color,w=1)=>{const p=P(x,y),q=P(a,b);c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke()};
export function floorSurface556(c,P,z,rug){const l=z.left,r=z.right,f=z.from,t=z.to;
 if(z.kind==='rug'&&rug557(c,P,z,rug))return;
 if(z.kind==='wax'){if(l< -4&&r>4)return;c.save();quad(c,P,l,f,r,t);c.clip();const near=P(0,f),far=P(0,t),g=c.createLinearGradient(near.x,near.y,far.x+35,far.y);g.addColorStop(0,'#d0f9ff00');g.addColorStop(.4,'#d4ffff50');g.addColorStop(.7,'#daf6ff12');g.addColorStop(1,'#e2ffff40');c.fillStyle=g;c.fill();for(let y=f+.5;y<t;y+=.68)line(c,P,l+.06,y,r-.08,y+.10,'#e6ffff38',.8);c.restore();return}
 if(z.kind!=='rug')return;const front=P(0,f),back=P(0,t);c.save();c.translate(0,2);quad(c,P,l+.05,f-.07,r-.05,t+.03);c.fillStyle='#1b18364a';c.fill();c.restore();c.save();quad(c,P,l+.08,f,r-.08,t);const fabric=c.createLinearGradient(0,back.y,0,front.y);fabric.addColorStop(0,'#503056');fabric.addColorStop(.5,'#744c73');fabric.addColorStop(1,'#4d3257');c.fillStyle=fabric;c.fill();c.clip();
 for(let y=f;y<t;y+=.16)line(c,P,l,y,r,y,'#efd4c016',.6);for(let x=l+.1;x<r;x+=.14)line(c,P,x,f,x,t,'#1a15382c',.55);
 for(const x of [l+.27,r-.27]){line(c,P,x,f+.12,x,t-.12,'#e0bf82',1.7);line(c,P,x+.08,f+.12,x+.08,t-.12,'#684533',.5)}
 for(let y=f+1;y<t-1;y+=2){const x=(l+r)/2,pts=[[x,y-.55],[x+.52,y],[x,y+.55],[x-.52,y]].map(([x,y])=>P(x,y));c.strokeStyle='#dfbc866e';c.lineWidth=1;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.stroke()};c.restore();for(let x=l+.2;x<r-.15;x+=.17)for(const y of [f,t])line(c,P,x,y,x,y+(y===f?-.18:.18),'#e6cf9aa0',.8);
}
export function springBarrel556(c,P,b,sprite,age=Infinity){
 if(!sprite?.complete||!sprite.naturalWidth){springFallback556(c,P,b);return}
 const p=P(b.x,b.y),rx=P(b.x+b.r,b.y).x-p.x,ry=Math.max(3,rx*.35),pulse=age>=0&&age<300?Math.sin(age/300*Math.PI*2)*(1-age/300):0,w=rx*2/.88,h=w*sprite.naturalHeight/sprite.naturalWidth*(1-pulse*.09);
 c.save();c.fillStyle='#071e3266';c.beginPath();c.ellipse(p.x+2,p.y+2,rx*1.07,ry,0,0,Math.PI*2);c.fill();c.drawImage(sprite,p.x-w/2,p.y-h*.96+ry*.25,w,h);
 if(age>=0&&age<220){c.globalAlpha=(1-age/220)*.65;c.strokeStyle='#ffe8a7';c.lineWidth=1.3;c.beginPath();c.ellipse(p.x,p.y-ry*1.5,rx*(1+age/500),ry*(1+age/500),0,0,Math.PI*2);c.stroke()}c.restore();
}
function springFallback556(c,P,b,flash=0){const p=P(b.x,b.y),edge=P(b.x+b.r,b.y),rx=edge.x-p.x,ry=Math.max(3,rx*.35),h=17*p.scale;c.save();c.translate(p.x,p.y);
 c.fillStyle='#17382969';c.beginPath();c.ellipse(2,3,rx*1.16,ry*1.12,0,0,Math.PI*2);c.fill();const brass=c.createLinearGradient(-rx,0,rx,0);brass.addColorStop(0,'#76552b');brass.addColorStop(.2,'#d9b967');brass.addColorStop(.5,'#7d6338');brass.addColorStop(.8,'#e7d09a');brass.addColorStop(1,'#735634');c.fillStyle=brass;c.fillRect(-rx,-h,rx*2,h);c.beginPath();c.ellipse(0,0,rx,ry,0,0,Math.PI*2);c.fill();
 for(let y=-h+3;y<-1;y+=3.5*p.scale){c.strokeStyle='#292d32';c.lineWidth=1.8*p.scale;c.beginPath();c.ellipse(0,y,rx*.89,ry*.76,0,0,Math.PI);c.stroke();c.strokeStyle='#ddcea5';c.lineWidth=.7*p.scale;c.stroke()}
 const cap=c.createRadialGradient(-rx*.28,-h-ry*.4,0,0,-h,rx);cap.addColorStop(0,'#ffe7a2');cap.addColorStop(.35,'#ae8650');cap.addColorStop(.62,flash?'#ffe694':'#2d7366');cap.addColorStop(.82,'#0f443d');cap.addColorStop(.87,'#f0d698');cap.addColorStop(1,'#7d582c');c.fillStyle=cap;c.beginPath();c.ellipse(0,-h,rx,ry,0,0,Math.PI*2);c.fill();c.strokeStyle='#fce4a7';c.lineWidth=.9;c.stroke();
 for(const x of [-.7,.7]){c.fillStyle='#fff2c9';c.beginPath();c.arc(x*rx,-h,1.1*p.scale,0,Math.PI*2);c.fill()}c.restore();}
