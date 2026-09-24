const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),pieces=18;
const angle=i=>i*TAU/pieces+Math.sin(i*2.7)*.025;
function shape(c,outer,inner,i){
 const a=angle(i),b=angle(i+1),steps=5;
 c.beginPath();for(let j=0;j<=steps;j++){const t=a+(b-a)*j/steps,r=outer+(j===0||j===steps?0:Math.sin(i*4+j*2)*.035);c.lineTo(Math.cos(t)*r,Math.sin(t)*r)}
 for(let j=steps;j>=0;j--){const t=a+(b-a)*j/steps,r=inner+Math.sin(i*4+j*2)*.045;c.lineTo(Math.cos(t)*r,Math.sin(t)*r)}c.closePath();
}
function shard(c,r,outer,inner,i,face,floor){
 c.save();c.translate(0,.18);shape(c,outer,inner,i);c.fillStyle=face;c.fill();c.restore();
 c.save();shape(c,outer,inner,i);c.clip();floor(c,r);c.restore();
 shape(c,outer,inner,i);c.strokeStyle='#070f0cb0';c.lineWidth=.045;c.stroke();
}
export function rupture535(c,r,g,elapsed,at,reduced,{world,floor,next,radius,warning}){
 const until=next(elapsed)-elapsed;
 if(until<=warning){
  const safe=radius(next(elapsed)),q=1-until/warning,pulse=reduced?.6:.5+.5*Math.sin(at/(320-q*120));
  world(c,r,()=>{
   // Stone panels lift from a dark seam; amber light grows beneath the actual doomed band.
   c.save();c.beginPath();c.arc(0,0,g.radius,0,TAU);c.arc(0,0,safe,TAU,0,true);c.clip();
   c.fillStyle='#0a0a07';c.fillRect(-10,-10,20,20);
   for(let i=0;i<pieces;i++){
    const a=(angle(i)+angle(i+1))/2,lift=reduced?0:(.015+q*q*.1)*(1+Math.sin(at/65+i)*q*.25);
    c.save();c.translate(Math.cos(a)*lift,Math.sin(a)*lift-lift*.35);shard(c,r,g.radius,safe,i,'#130b05',floor);
    shape(c,g.radius,safe,i);c.fillStyle=`rgba(231,103,30,${.10+q*.15+pulse*.025})`;c.fill();c.restore();
   }
   for(let i=0;i<pieces;i++){
    const a=angle(i);c.beginPath();for(let j=0;j<=7;j++){const rad=safe+(g.radius-safe)*j/7,aa=a+Math.sin(i*5+j*2)*.02;const x=Math.cos(aa)*rad,y=Math.sin(aa)*rad;if(j)c.lineTo(x,y);else c.moveTo(x,y)}
    c.strokeStyle='#1f0905';c.lineWidth=.10+q*.10;c.stroke();c.strokeStyle='#ff9d3e';c.lineWidth=.025+q*.028;c.stroke();c.strokeStyle='#ffe4a1';c.lineWidth=.009+q*.012;c.stroke();
   }
   c.restore();
   c.beginPath();for(let i=0;i<=144;i++){const a=i*TAU/144,rad=safe+Math.sin(i*2.6)*.04;c.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}c.closePath();c.strokeStyle='#2e1209';c.lineWidth=.17;c.stroke();c.strokeStyle='#ffb45c';c.lineWidth=.045+q*.025;c.stroke();
   // Small inward ticks sit on the safe floor. The floor itself carries the warning.
   c.strokeStyle='#f5df9aa8';c.lineWidth=.045;for(let i=0;i<9;i++){c.save();c.rotate(i*TAU/9);c.beginPath();c.moveTo(safe-.23,-.09);c.lineTo(safe-.4,0);c.lineTo(safe-.23,.09);c.stroke();c.restore()}
   if(!reduced)for(let i=0;i<24;i++){const t=(at/1300+i*.13)%1,a=i*2.4,rad=safe+(g.radius-safe)*(.15+(i%5)*.15);c.globalAlpha=(1-t)*q*.7;c.fillStyle=i%3?'#f4bf80':'#242f27';c.fillRect(Math.cos(a)*rad,Math.sin(a)*rad-t*.45,.025+q*.025,.04)}
   c.globalAlpha=1;
  });
 }
 for(const e of g.events){
  if(e.type!=='collapse')continue;const age=elapsed-e.at;if(age<0||age>2100)continue;
  world(c,r,()=>{
   for(let i=0;i<pieces;i++){
    const t=clamp((age-(i%4)*45)/1750),a=(angle(i)+angle(i+1))/2,mid=(e.from+e.to)/2,drift=t*(.55+(i%3)*.2),fall=t*t*(9+(i%4)),tilt=reduced?0:Math.sin(i*8)*t*.7;
    c.save();c.globalAlpha=clamp((1-t)*1.5);c.translate(Math.cos(a)*(mid+drift),Math.sin(a)*(mid+drift)+fall);c.rotate(tilt);c.scale(1-t*.15,1-t*.3);c.translate(-Math.cos(a)*mid,-Math.sin(a)*mid);
    shard(c,r,e.from,e.to,i,i%2?'#403729':'#17221b',floor);c.restore();
   }
   if(!reduced)for(let i=0;i<40;i++){
    const t=clamp(age/1700),a=i*2.399,rad=e.to+(e.from-e.to)*((i%5)/5)+t*.8,x=Math.cos(a)*rad,y=Math.sin(a)*rad+t*t*8;
    c.save();c.globalAlpha=(1-t)*.6;c.translate(x,y);c.rotate(i+t*3);c.fillStyle=i%3?'#b3a17b':'#3a4235';const size=.025+(i%4)*.025;c.fillRect(-size,-size,size*2,size);c.restore();
   }
   const t=age/2100;c.save();c.globalAlpha=(1-t)*.18;c.strokeStyle='#d3b487';c.lineWidth=.25+t*.7;c.beginPath();c.arc(0,t*.45,e.to+t*.8,0,TAU);c.stroke();c.restore();
  });
 }
}
