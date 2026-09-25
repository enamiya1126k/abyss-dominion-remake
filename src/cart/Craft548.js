// Screen-space craftsmanship only. No physics, trajectory or stopping forecast.
const TAU=Math.PI*2;
function polygon(c,points,fill,stroke,width=1){
 c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
 if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}
}
function gradient(c,x0,y0,x1,y1,stops){const g=c.createLinearGradient(x0,y0,x1,y1);for(const [at,color]of stops)g.addColorStop(at,color);return g}
function stud(c,x,y,r=2){
 c.fillStyle='#59442c';c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
 c.fillStyle='#fff3c5';c.beginPath();c.arc(x-.45,y-.65,r*.45,0,TAU);c.fill();
}
// A short enamel-and-brass direction pointer. Length reflects tension only;
// it stays beside the cart and never inspects a course, target or opponent.
export function direction548(c,{x,y,size,direction,power,color,tint=color,at,reduced,width:fieldWidth,height:fieldHeight}){
 const dx=Math.cos(direction),dy=Math.sin(direction),margin=10;
 const roomX=Math.abs(dx)<.001?Infinity:(dx>0?fieldWidth-margin-x:margin-x)/dx;
 const roomY=Math.abs(dy)<.001?Infinity:(dy>0?fieldHeight-margin-y:margin-y)/dy;
 const room=Math.max(20,Math.min(roomX,roomY)),start=Math.min(size*.48,room*.34),length=Math.max(15,Math.min(32+power*26,room-start-5)),width=(7+power*2)*Math.min(1,length/32);
 c.save();c.translate(x,y);c.rotate(direction);c.translate(start,0);
 const shape=[[-4,-width*.68],[length-18,-width*.68],[length-20,-width*1.55],[length+3,0],[length-20,width*1.55],[length-18,width*.68],[-4,width*.68],[1,0]];
 c.save();c.translate(1.5,3);polygon(c,shape,'#142a2659');c.restore();
 const gold=gradient(c,0,-width*1.6,0,width*1.6,[[0,'#fff9d4'],[.2,'#e9c57b'],[.48,'#ba8641'],[.53,'#fff0bd'],[1,'#9f6c31']]);
 polygon(c,shape,gold,'#5c4a29',.8);
 const inset=[[-1,-width*.34],[length-13,-width*.34],[length-15,-width*.95],[length-2,0],[length-15,width*.95],[length-13,width*.34],[-1,width*.34],[2,0]];
 polygon(c,inset,gradient(c,0,-width,0,width,[[0,color],[.47,tint],[1,'#325344']]),'#fff1c088',.65);
 polygon(c,[[2,0],[length-2,0],[length-15,width*.95],[length-13,width*.34],[-1,width*.34]],'#162f3140');
 c.beginPath();c.moveTo(2,-width*.43);c.lineTo(length-15,-width*.43);c.strokeStyle='#fff8d6';c.lineWidth=.8;c.stroke();
 if(!reduced){
  c.save();polygon(c,inset);c.clip();const shine=(at/11)%(length+32)-16;
  polygon(c,[[shine-5,-20],[shine+1,-20],[shine+13,20],[shine+7,20]],'#fff9dc60');c.restore();
 }
 stud(c,5,0,1.4);c.restore();
}
// Twin stitched straps end in a leather grip with brass caps. Everything is
// attached to the cart, so touching elsewhere cannot create a floating joystick.
export function sling548(c,{x,y,size,direction,power,color,width,height,at,reduced}){
 const back={x:-Math.cos(direction),y:-Math.sin(direction)},margin=19;
 const roomX=Math.abs(back.x)<.001?Infinity:(back.x>0?width-margin-x:margin-x)/back.x;
 const roomY=Math.abs(back.y)<.001?Infinity:(back.y>0?height-margin-y:margin-y)/back.y;
 const length=Math.max(8,Math.min(size*.46+power*29,roomX,roomY));
 const span=Math.max(9,size*.20),join=size*.12,flex=(1-power)*8;
 c.save();c.translate(x,y);c.rotate(direction+Math.PI);
 for(const side of [-1,1]){
  const path=()=>{c.beginPath();c.moveTo(join,side*span);c.bezierCurveTo(length*.45,side*(span+flex),length*.72,side*9,length,side*9)};
  c.save();c.translate(0,2);path();c.strokeStyle='#13271c50';c.lineWidth=6;c.stroke();c.restore();
  path();c.strokeStyle='#4f3621';c.lineWidth=5.5-power*1.3;c.lineCap='round';c.stroke();
  path();c.strokeStyle=color;c.globalAlpha=.8;c.lineWidth=3.2-power*.7;c.stroke();c.globalAlpha=1;
  path();c.setLineDash([1.5,3]);c.strokeStyle='#ffe8bfa8';c.lineWidth=.7;c.stroke();c.setLineDash([]);
  stud(c,join,side*span,2.3);
 }
 c.translate(length,0);
 if(!reduced&&power>.9)c.translate(0,Math.sin(at/43)*.45);
 c.fillStyle='#19302748';c.beginPath();c.roundRect(-4,-17,11,36,4);c.fill();
 const metal=gradient(c,-5,0,5,0,[[0,'#8c6036'],[.25,'#ffedb4'],[.48,'#d7ad64'],[.8,'#fff6d4'],[1,'#725532']]);
 c.fillStyle=metal;c.beginPath();c.roundRect(-5,-17,10,34,3);c.fill();c.strokeStyle='#5d4828';c.lineWidth=.8;c.stroke();
 c.fillStyle=gradient(c,-4,0,4,0,[[0,'#18392f'],[.35,'#466c52'],[.7,'#2b5140'],[1,'#142b25']]);c.fillRect(-3.8,-11,7.6,22);
 c.strokeStyle='#b7b48290';c.lineWidth=.65;
 for(let y=-10;y<10;y+=3){c.beginPath();c.moveTo(-3.5,y);c.lineTo(3.5,y+2);c.stroke()}
 polygon(c,[[-2.8,0],[0,-3.7],[2.8,0],[0,3.7]],color,'#ffe8b4',.8);
 stud(c,0,-14,1.2);stud(c,0,14,1.2);c.restore();
}
export function launch548(c,{x,y,size,direction,color,age,power,reduced}){
 if(age<0||age>480||reduced)return;
 const t=age/480;c.save();c.translate(x,y);c.rotate(direction);c.globalAlpha=(1-t)*.7;
 // Small wheel dust and tapered light streaks; no expanding target rings.
 for(const side of [-1,1])for(let i=0;i<4;i++){
  const px=-size*.08-t*(15+i*8)*(1+power),py=side*(size*.22+i*t*3),r=(1.5+i*.5)*(1+t);
  c.fillStyle=i%2?'#f6dfb5':color;c.beginPath();c.ellipse(px,py,r*1.8,r,0,0,TAU);c.fill();
 }
 for(const side of [-1,1])polygon(c,[[-size*.15,side*size*.3],[-size*.15-28*t,side*(size*.3+2)],[-size*.12-12*t,side*(size*.3-1)]],'#fff7d5');
 c.restore();
}
