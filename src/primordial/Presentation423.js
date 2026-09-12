const TAU=Math.PI*2;
export function motherHalo423(){
 const seals=Array.from({length:10},(_,i)=>{const a=i*TAU/10-Math.PI/2,x=160+125*Math.cos(a),y=160+125*Math.sin(a);return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><circle r="13"/><path d="M0 -8 7 4 -7 4Z M-9 0H9 M0 -9V9"/><circle r="3"/></g>`}).join('');
 return `<span class="mother-halo423" aria-hidden="true"><svg viewBox="0 0 320 320" focusable="false"><g class="mother-orbit423" fill="none" stroke="currentColor" stroke-width="1"><circle cx="160" cy="160" r="144"/><circle cx="160" cy="160" r="137"/><circle cx="160" cy="160" r="109"/>${seals}</g><g class="mother-rays423" fill="none" stroke="currentColor" stroke-width=".8">${Array.from({length:20},(_,i)=>`<path transform="rotate(${i*18} 160 160)" d="M160 70V26 M156 41 160 32 164 41"/>`).join('')}</g></svg><i></i><i></i><i></i><i></i><i></i><i></i></span>`;
}
export function drawMotherHalo423({ctx,camera,TILE,actor,time=0,reducedMotion=false}){
 const p=camera.world((actor.position.x+.5)*TILE,(actor.position.y-.6)*TILE),radius=TILE*camera.z*1.7;
 ctx.save();ctx.translate(p.x,p.y);const glow=ctx.createRadialGradient(0,0,radius*.1,0,0,radius*1.18);glow.addColorStop(0,'#e7bd6b18');glow.addColorStop(.7,'#e7bd6b30');glow.addColorStop(1,'#e7bd6b00');ctx.fillStyle=glow;ctx.fillRect(-radius*1.2,-radius*1.2,radius*2.4,radius*2.4);
 ctx.rotate(reducedMotion?0:time/24000);ctx.strokeStyle='#e8c777bb';ctx.lineWidth=Math.max(1,camera.z*.6);for(const rate of [1,.94,.76]){ctx.beginPath();ctx.arc(0,0,radius*rate,0,TAU);ctx.stroke();}
 for(let i=0;i<10;i++){const a=i*TAU/10,x=Math.cos(a)*radius*.87,y=Math.sin(a)*radius*.87;ctx.beginPath();ctx.arc(x,y,radius*.075,0,TAU);ctx.moveTo(x-radius*.035,y);ctx.lineTo(x+radius*.035,y);ctx.moveTo(x,y-radius*.035);ctx.lineTo(x,y+radius*.035);ctx.stroke();}ctx.restore();
}
