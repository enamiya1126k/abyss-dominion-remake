import {active601,starOpen601} from './Coop601.js';
const outline='M16 2 20.4 10.4 30 12 23 19 24.6 29 16 24.5 7.4 29 9 19 2 12 11.6 10.4Z';
export const starIcon601=filled=>`<svg viewBox="0 0 32 32" aria-hidden="true"><path d="${outline}" fill="${filled?'#ffdc82':'#223e47'}" stroke="${filled?'#fff1bc':'#9d956e'}" stroke-width="1.7"/>${filled?'<path d="M16 2v15L2 12l9.6-1.6Z" fill="#fff4c2"/><path d="m16 17 8.6 12L16 24.5Z" fill="#b67932"/>':''}</svg>`;
export function starHud601(course,g){return course.stars601.map(s=>starIcon601(g.stars601?.includes(s.id))).join('');}
function starPath(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,d=i%2?r*.47:r;i?c.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d):c.moveTo(x+Math.cos(a)*d,y+Math.sin(a)*d);}c.closePath();}
const dot=(c,x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,7);c.fill();};
export function scenery601(c,g,course,left,right,elapsed,reduced=false){
 const visible=(x,w=70)=>x+w>left&&x-w<right,players=g.players.filter(active601);c.save();
 for(const trial of course.trials601){
  if(!trial.pads.some(p=>visible(p.x,420)))continue;
  const state=g.coop601?.[trial.id],open=state?.open;
  for(const [i,pad] of trial.pads.entries()){
   const held=players.some(p=>p.grounded&&Math.abs(p.x-pad.x)<=23&&Math.abs(p.y-pad.y)<=5),lit=open||held;
   c.save();c.translate(pad.x,pad.y);c.fillStyle='#102e3e';c.beginPath();c.ellipse(0,-3,24,7,0,0,7);c.fill();c.strokeStyle=lit?'#baffd5':'#c4a169';c.lineWidth=2;c.stroke();
   dot(c,0,-12,5,lit?'#d3ffde':'#d5b47b');c.fillStyle=lit?'#6bcfae':'#7f816f';c.fillRect(-5,-7,10,5);
   // The paired dots are the same symbol on both pads and the star's seal.
   dot(c,-5,-25,2.5,i===0||open?'#ffe2a0':'#375967');dot(c,5,-25,2.5,i===1||open?'#ffe2a0':'#375967');c.restore();
   if(lit&&!open){c.strokeStyle='#96f3d54d';c.lineWidth=1.2;c.setLineDash([3,8]);c.lineDashOffset=reduced?0:-elapsed/80;c.beginPath();c.moveTo(pad.x,pad.y-15);c.quadraticCurveTo(pad.x,pad.y-80,trial.reward.x,trial.reward.y);c.stroke();c.setLineDash([]);}
  }
 }
 for(const s of course.stars601){
  if(!visible(s.x)||g.stars601?.includes(s.id))continue;
  const open=starOpen601(g,s),y=s.y+(reduced?0:Math.sin(elapsed/430+s.x)*2),shine=open?1:.28;
  c.save();c.globalAlpha=shine;c.fillStyle='#ffe4a21b';c.beginPath();c.arc(s.x,y,24,0,7);c.fill();
  starPath(c,s.x,y+2,16);c.fillStyle='#8b542b';c.fill();starPath(c,s.x,y,15);c.fillStyle='#f4c460';c.fill();c.strokeStyle='#fff0b8';c.lineWidth=1.5;c.stroke();
  c.beginPath();c.moveTo(s.x,y-15);c.lineTo(s.x,y);c.lineTo(s.x-14,y-5);c.lineTo(s.x-4,y-5);c.closePath();c.fillStyle='#fff6cc';c.fill();c.restore();
  if(!open){const state=g.coop601?.[s.trial];c.strokeStyle='#c1dce2';c.lineWidth=1.5;c.beginPath();c.arc(s.x,y,23,0,7);c.stroke();c.strokeStyle='#8dffca';c.lineWidth=3;c.beginPath();c.arc(s.x,y,23,-Math.PI/2,-Math.PI/2+Math.PI*2*(state?.charge??0)/600);c.stroke();dot(c,s.x-5,y+29,2.5,'#ffe2a0');dot(c,s.x+5,y+29,2.5,'#ffe2a0');}
  else if(!reduced)for(let i=0;i<3;i++){const a=elapsed/1400+i*2.1;dot(c,s.x+Math.cos(a)*22,y+Math.sin(a)*19,1.4,'#fff1b9');}
 }
 for(const h of course.hints601){
  if(!visible(h.x,120))continue;
  if(h.kind==='secret'){
   // A luminous broken arch and drifting motes can be seen before taking the drop.
   c.strokeStyle='#153843';c.lineWidth=6;c.beginPath();c.arc(h.x,h.y+12,43,Math.PI,Math.PI*2);c.stroke();c.strokeStyle='#a9efcc';c.lineWidth=1.5;c.stroke();
   for(let i=0;i<6;i++){const t=((reduced?0:elapsed/2400)+i/6)%1;dot(c,h.x+Math.sin(t*5+i)*13,h.y-52+t*150,2-t,'#c0ffe6');}
  }else{
   c.save();c.translate(h.x,h.y-3);c.strokeStyle='#ffe1a098';c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,22,4,0,0,7);c.stroke();
   for(let i=0;i<2;i++){dot(c,i*9-5,-15-i*12,3,'#e7daac');c.fillStyle='#b7cab0';c.fillRect(i*9-8,-12-i*12,6,7);}c.beginPath();c.moveTo(14,-13);c.quadraticCurveTo(28,-25,16,-34);c.moveTo(16,-34);c.lineTo(22,-33);c.moveTo(16,-34);c.lineTo(17,-28);c.stroke();c.restore();
  }
 }
 const checkpoint=g.events.findLast(e=>e.type==='checkpoint'&&elapsed-(e.at-g.startAt)<1200);
 if(checkpoint){const cp=course.checkpoints[checkpoint.checkpoint];if(cp&&visible(cp.x)){const age=elapsed-(checkpoint.at-g.startAt);c.globalAlpha=Math.max(0,1-age/1200);c.strokeStyle='#b9ffdc';c.lineWidth=2;c.beginPath();c.ellipse(cp.x,cp.y-6,18+age/35,5+age/140,0,0,7);c.stroke();c.globalAlpha=1;}}
 c.restore();
}
