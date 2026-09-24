const TAU=Math.PI*2;
const ellipse=(c,x,y,rx,ry)=>{c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU)};
export function item535(c,image,type,x,y,size,angle=0){
 c.save();c.translate(x,y);c.rotate(angle);
 if(image?.complete&&image.naturalWidth){const side=image.width/2;c.drawImage(image,type==='brace'?side:0,0,side,image.height,-size/2,-size/2,size,size)}
 else{c.fillStyle=type==='brace'?'#f6cb72':'#8ff7dd';c.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6;c.lineTo(Math.cos(a)*size*.3,Math.sin(a)*size*.3)}c.closePath();c.fill()}
 c.restore();
}
export function chargeAura535(c,pos,rad,color,q,level,at,reduced){
 if(q<=0)return;
 const full=q>=.999,pulse=reduced?1:1+Math.sin(at/(full?120:220))*.035;
 const width=rad*(1.6+q*.8+(level-1)*.025),height=rad*(3.7+q*1.6),cy=pos.y-height*.48;
 c.save();c.translate(pos.x,cy);c.scale(width/height,1);
 const glow=c.createRadialGradient(0,height*.12,height*.10,0,0,height*.64);
 glow.addColorStop(0,full?'#fff1a81a':color+'15');glow.addColorStop(.50,full?'#ffdc6977':color+'55');glow.addColorStop(1,'#fff0');
 c.fillStyle=glow;ellipse(c,0,0,height*.64*pulse,height*.64);c.fill();c.restore();
 c.save();c.lineCap='round';c.globalAlpha=.3+q*.55;
 for(let side of[-1,1])for(let j=0;j<3;j++){
  const phase=reduced?.45:(at/1050+j*.31)%1,stretch=.6+phase*.35,edge=width*(.65+j*.12);
  c.strokeStyle=full?(j===1?'#fffbe1':'#f4c55d'):j===1?'#e9fff7':color;
  c.lineWidth=full?1.7:1;
  c.beginPath();c.moveTo(pos.x+side*rad*.6,pos.y+2);
  c.bezierCurveTo(pos.x+side*edge,pos.y-height*.15,pos.x+side*(edge+rad*.25),pos.y-height*.53,pos.x+side*width*.28,pos.y-height*stretch);
  c.stroke();
 }
 if(!reduced)for(let i=0;i<(full?10:6);i++){
  const t=(at/(800+i*53)+i*.19)%1,x=pos.x+Math.sin(i*9.3+t*2)*width*(.65-.25*t),y=pos.y-t*height;
  c.globalAlpha=(1-t)*q*.85;c.fillStyle=full?'#fff3b2':color;c.fillRect(x,y,full?2.3:1.5,3+t*5);
 }
 c.globalAlpha=.6+q*.3;c.strokeStyle=full?'#fff0ab':color;c.lineWidth=full?2.4:1.2;
 ellipse(c,pos.x,pos.y,rad*(1.3+q*.6),rad*(.6+q*.3));c.stroke();c.restore();
}
export function guide535(c,from,to,color,rad,q,at,reduced){
 const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);if(length<2)return;
 const angle=Math.atan2(dy,dx),full=q>=.999,ink=full?'#fff0ae':color,half=Math.min(12,rad*.62),tip=Math.min(13,length*.24);
 c.save();c.translate(from.x,from.y);c.rotate(angle);
 const beam=c.createLinearGradient(0,0,length,0);beam.addColorStop(0,ink+'05');beam.addColorStop(.65,ink+'38');beam.addColorStop(1,ink+'9c');
 c.fillStyle=beam;c.beginPath();c.moveTo(rad*.3,-half*.6);c.lineTo(length-tip,-half);c.lineTo(length,0);c.lineTo(length-tip,half);c.lineTo(rad*.3,half*.6);c.closePath();c.fill();
 c.strokeStyle=ink+'80';c.lineWidth=.8;c.beginPath();c.moveTo(rad,-half*.65);c.lineTo(length-tip,-half);c.moveTo(rad,half*.65);c.lineTo(length-tip,half);c.stroke();
 c.strokeStyle='#071b18';c.lineWidth=4;c.lineJoin='round';c.beginPath();c.moveTo(length-tip,-half);c.lineTo(length,0);c.lineTo(length-tip,half);c.stroke();c.strokeStyle=ink;c.lineWidth=2;c.stroke();
 c.strokeStyle=ink+'b0';c.lineWidth=1;c.beginPath();c.moveTo(rad*.8,0);c.lineTo(length-tip,0);c.stroke();
 for(let i=0;i<3;i++){const p=reduced?(i+1)/4:((at/1800+i/3)%1),x=rad+(length-rad-tip)*p;c.globalAlpha=p*.8;c.fillStyle=ink;c.beginPath();c.moveTo(x-3,-2);c.lineTo(x+2,0);c.lineTo(x-3,2);c.fill()}
 c.restore();
}
export function magneticField535(c,pos,rad,range,at,reduced){
 c.save();
 for(let i=0;i<3;i++){
  const phase=reduced?.45:(at/1700+i/3)%1,size=rad*1.3+(range-rad*1.3)*(1-phase);
  c.globalAlpha=(.08+phase*.23)*(1-phase*.7);c.strokeStyle='#a2ffe4';c.lineWidth=1;
  ellipse(c,pos.x,pos.y,size,size*.78);c.stroke();
 }
 if(!reduced)for(let i=0;i<7;i++){
  const t=(at/1100+i*.143)%1,a=i*2.399+t*.6,size=range*(1-t),x=pos.x+Math.cos(a)*size,y=pos.y+Math.sin(a)*size*.78;
  c.globalAlpha=Math.sin(t*Math.PI)*.65;c.fillStyle='#cafff1';ellipse(c,x,y,1.4,1);c.fill();
 }
 c.restore();
}
export function fullFlash535(c,pos,age,rad,reduced){
 if(age<0||age>580)return;const t=age/580;
 c.save();c.globalAlpha=(1-t)*.95;c.strokeStyle='#fff9dc';c.lineWidth=1.5;
 const width=(rad*1.5+22)*(.3+t),y=pos.y-rad*2.3;
 c.beginPath();c.moveTo(pos.x-width,y);c.lineTo(pos.x+width,y);c.moveTo(pos.x,y-width*.6);c.lineTo(pos.x,y+width*.6);c.stroke();
 if(!reduced){const g=c.createRadialGradient(pos.x,y,0,pos.x,y,width);g.addColorStop(0,'#fff9eacc');g.addColorStop(.18,'#fff0b470');g.addColorStop(1,'#ffdc0000');c.fillStyle=g;ellipse(c,pos.x,y,width,width);c.fill()}
 c.restore();
}
