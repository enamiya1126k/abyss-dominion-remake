import{missileLayout500}from'./Motion500.js';
// Small physical rockets, glowing exhaust and detached sparks: no guide lines.
export function drawMissiles500(ctx,g,at,now,w,h,reduced=false){
 for(const m of missileLayout500(g.missiles,at,w,h)){
  const angle=Math.atan2((.817-m.fromY)*h,(.5-m.fromX)*w)-Math.PI/2;
  ctx.save();ctx.translate(m.x,m.y);ctx.rotate(angle);
  ctx.shadowColor='#ffd685';ctx.shadowBlur=reduced?5:12;
  const flame=ctx.createLinearGradient(0,-37,0,-10);flame.addColorStop(0,'#ff742500');flame.addColorStop(.5,'#ff9946');flame.addColorStop(1,'#fff3bc');ctx.fillStyle=flame;
  ctx.beginPath();ctx.moveTo(-5,-10);ctx.quadraticCurveTo(-8,-21,0,-38-(reduced?0:Math.sin(now/27+m.id)*5));ctx.quadraticCurveTo(8,-21,5,-10);ctx.fill();ctx.shadowBlur=0;
  if(!reduced)for(let i=0;i<4;i++){const t=(now/200+i*.25+m.id*.19)%1;ctx.globalAlpha=(1-t)*.8;ctx.fillStyle='#ffecc2';ctx.beginPath();ctx.arc(Math.sin(i*7+m.id)*7,-21-t*32,1.3*(1-t)+.4,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
  ctx.fillStyle='#c59158';ctx.strokeStyle='#563d24';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-6,-10);ctx.lineTo(-12,-16);ctx.lineTo(-12,-4);ctx.lineTo(0,7);ctx.lineTo(12,-4);ctx.lineTo(12,-16);ctx.lineTo(6,-10);ctx.fill();ctx.stroke();
  const steel=ctx.createLinearGradient(-7,0,7,0);steel.addColorStop(0,'#36554e');steel.addColorStop(.35,'#eff5db');steel.addColorStop(.65,'#8faaa0');steel.addColorStop(1,'#24443c');ctx.fillStyle=steel;ctx.beginPath();ctx.roundRect(-7,-13,14,24,5);ctx.fill();ctx.stroke();
  ctx.fillStyle='#dc6841';ctx.beginPath();ctx.moveTo(-7,5);ctx.quadraticCurveTo(-6,13,0,18);ctx.quadraticCurveTo(6,13,7,5);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffe4a2';ctx.fillRect(-7,-10,14,3);ctx.fillStyle='#ffffffbb';ctx.fillRect(-4,-5,2,9);ctx.restore();
 }
}
