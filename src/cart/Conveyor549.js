// A recessed roller assembly, projected with the road. No flat pasted decal.
function quad(c,project,x0,y0,x1,y1,fill,stroke,lift=0){
 const pts=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([x,y])=>project(x,y));
 c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y-lift):c.moveTo(p.x,p.y-lift));c.closePath();
 if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=.7;c.stroke()}return pts;
}
function metal(c,a,b,colors){const g=c.createLinearGradient(0,a,0,b);colors.forEach((s,i)=>g.addColorStop(i/(colors.length-1),s));return g}
export function conveyorBase549(c,project,zone){
 const original=project,mid=((zone.left??-4.15)+(zone.right??4.15))/2,ratio=((zone.right??4.15)-(zone.left??-4.15))/8.3;project=(x,y)=>original(mid+x*ratio,y);
 const f=zone.from,t=zone.to,front=project(0,f),back=project(0,t);
 c.save();c.translate(0,2);quad(c,project,-4.2,f-.09,4.2,t+.05,'#1e281d70');c.restore();
 quad(c,project,-4.15,f,4.15,t,metal(c,back.y,front.y,['#3b493d','#192b27','#60705a']),'#594830');
 // Bevels meet the planks; a shallow front lip provides a real thickness cue.
 quad(c,project,-4.17,f-.11,4.17,f+.08,metal(c,front.y-2,front.y+3,['#e0ca95','#7f6945','#403b2b']),'#b79863');
 quad(c,project,-4.17,t-.09,4.17,t+.08,'#b8a476','#ead9ab');
 for(const side of [-1,1]){
  const lo=side<0?-4.15:3.80,hi=lo+.35;
  quad(c,project,lo,f+.08,hi,t-.08,metal(c,back.y,front.y,['#8e7147','#ebd6a4','#ae8a52','#dcc494']),'#665136');
  quad(c,project,lo+.10,f+.18,hi-.10,t-.18,'#294b3c');
  for(const y of [f+.27,(f+t)/2,t-.27]){const p=project((lo+hi)/2,y),r=1.6*p.scale;c.fillStyle='#57462e';c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fill();c.fillStyle='#ffe6af';c.fillRect(p.x-r*.4,p.y-r*.55,r*.8,.6)}
 }
}
export function conveyorMotion549(c,project,zone,at,reduced){
 const original=project,mid=((zone.left??-4.15)+(zone.right??4.15))/2,ratio=((zone.right??4.15)-(zone.left??-4.15))/8.3;project=(x,y)=>original(mid+x*ratio,y);
 const f=zone.from+.13,t=zone.to-.13,horizontal=!!zone.kickX,reverse=horizontal?zone.kickX<0:zone.boost<0,sign=reverse?-1:1,phase=reduced?0:(at%1100)/1100*.36*sign;
 c.save();quad(c,project,-3.79,f,3.79,t);c.clip();
 if(horizontal){for(let x=-4.2+phase;x<4.2;x+=.36){const a=project(x,f),b=project(x+.29,f),g=c.createLinearGradient(a.x,0,b.x,0);['#263b36','#7a8774','#e3d7b4','#657661','#253d36'].forEach((s,i)=>g.addColorStop(i/4,s));quad(c,project,x,f,x+.29,t,g,'#23372b');}}
 else for(let y=f-.36+phase;y<t+.36;y+=.36){const a=project(0,y),b=project(0,y+.29),g=metal(c,b.y,a.y,['#283b32','#687968','#bcc3a4','#e3d7b4','#61715c','#263c32']);quad(c,project,-3.77,y,3.77,y+.29,g,'#23372b');for(const x of [-2.55,0,2.55])quad(c,project,x-.035,y+.015,x+.035,y+.28,'#314b3a55');}
 c.restore();
 const marks=horizontal?[[-1.6,(f+t)/2],[1.6,(f+t)/2]]:[[0,f+(t-f)*.33],[0,f+(t-f)*.68]];
 for(const [x,y] of marks){const pts=horizontal?[[x-sign*.2,y-.35],[x+sign*.48,y],[x-sign*.2,y+.35]]:[[x-.6,y-sign*.11],[x,y+sign*.33],[x+.6,y-sign*.11]],a=pts.map(([x,y])=>project(x,y));c.beginPath();c.moveTo(a[0].x,a[0].y);c.lineTo(a[1].x,a[1].y);c.lineTo(a[2].x,a[2].y);c.strokeStyle='#112e29a0';c.lineWidth=4;c.lineJoin='round';c.stroke();c.strokeStyle=reverse?'#c3f7ed':horizontal?'#dec6ff':'#edd69a';c.lineWidth=2;c.stroke();}
 for(const side of [-1,1])for(let i=0;i<3;i++){const y=f+(t-f)*(i+.5)/3,p=project(side*3.97,y),bright=reduced||((Math.floor(at/150)+i*sign+3)%3===0);c.fillStyle=bright?(reverse?'#d0fff5':'#fff0b8'):'#69836a';c.beginPath();c.ellipse(p.x,p.y,1.5*p.scale,2*p.scale,0,0,Math.PI*2);c.fill();}
}
