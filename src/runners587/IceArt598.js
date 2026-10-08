// Cache one translucent faceted shell, then composite it over the frozen sprite.
let shell;
export function iceArt598(c,p,at,reduced=false){
 if(!shell){shell=document.createElement('canvas');shell.width=112;shell.height=100;const d=shell.getContext('2d'),poly=(points,fill,stroke)=>{d.beginPath();points.forEach(([x,y],i)=>i?d.lineTo(x,y):d.moveTo(x,y));d.closePath();d.fillStyle=fill;d.fill();if(stroke){d.strokeStyle=stroke;d.lineWidth=2;d.stroke();}};const g=d.createLinearGradient(0,0,90,100);g.addColorStop(0,'#f0ffff88');g.addColorStop(.45,'#6dbbe933');g.addColorStop(1,'#358ad7bb');poly([[16,6],[88,4],[105,24],[102,89],[85,97],[10,93],[4,24]],g,'#ccf8ff');poly([[16,6],[88,4],[78,20],[26,23]],'#f2ffffc4');poly([[88,4],[105,24],[102,89],[85,97],[78,20]],'#519ee788','#d4f5ff99');poly([[4,24],[26,23],[18,80],[10,93]],'#d7ffff55');d.strokeStyle='#eaffffce';d.lineWidth=3;d.beginPath();d.moveTo(24,29);d.lineTo(17,67);d.moveTo(33,29);d.lineTo(28,52);d.stroke();d.lineWidth=1;d.beginPath();d.moveTo(67,78);d.lineTo(59,68);d.lineTo(64,57);d.moveTo(59,68);d.lineTo(47,71);d.stroke();}
 c.drawImage(shell,p.x-25,p.y-41,50,43);
 if(p.ice?.vx&&!reduced){c.strokeStyle='#c3f3ffaa';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(p.x-Math.sign(p.ice.vx)*(28+i*9),p.y-5-i*7);c.lineTo(p.x-Math.sign(p.ice.vx)*(40+i*9),p.y-5-i*7);c.stroke();}}
}
