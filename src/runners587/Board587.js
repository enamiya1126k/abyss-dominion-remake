import {paintBackdrop591,platform591,pickup591} from './Art591.js';
import {course589,readyGate589} from './Courses589.js';
import {scenery589} from './Scenery589.js';
import {surfaces587,enemyAt587} from './Level587.js';
import {look588} from './Feel588.js';
import {beetle588,spring588} from './Scenery588.js';

export function board587(canvas){return{canvas,ctx:canvas.getContext('2d',{alpha:false}),width:0,height:0,camera:0,scale:1,offsetY:0,last:0};}
export function resize587(r,w,h,dpr){r.width=w;r.height=h;r.dpr=Math.min(1.5,dpr);r.canvas.width=Math.round(w*r.dpr);r.canvas.height=Math.round(h*r.dpr);r.canvas.style.width=w+'px';r.canvas.style.height=h+'px';}
const path=(c,points,fill)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();};
function flag(c,x,y,lit,label){c.fillStyle='#344b41';c.fillRect(x-14,y-5,28,5);c.strokeStyle='#d4b976';c.lineWidth=3;c.beginPath();c.moveTo(x,y-3);c.lineTo(x,y-108);c.stroke();c.fillStyle='#ffe5a1';c.beginPath();c.arc(x,y-110,4,0,7);c.fill();path(c,[[x+2,y-101],[x+43,y-97],[x+34,y-78],[x+2,y-81]],lit?'#7eecc1':'#3b7e6a');c.fillStyle=lit?'#184b3d':'#d3e5c2';c.font='bold 12px "Noto Sans JP",sans-serif';c.textAlign='center';c.fillText('✓',x+20,y-86);c.fillStyle='#eff5c8';c.font='bold 10px "Noto Sans JP",sans-serif';c.fillText(label,x,y-122);}
function gate(c,t,course,open){const x=course.goal,y=300;c.save();c.translate(x,y);const g=c.createRadialGradient(0,-64,4,0,-64,60);g.addColorStop(0,'#f9ffe0');g.addColorStop(.32,'#b9ffe5');g.addColorStop(.7,'#32a994');g.addColorStop(1,'#153d39');c.fillStyle=g;c.beginPath();c.ellipse(0,-62,45,63,0,0,7);c.fill();c.strokeStyle='#f0cc79';c.lineWidth=9;c.stroke();c.strokeStyle='#756844';c.lineWidth=3;c.stroke();for(let i=0;i<5;i++){c.strokeStyle='rgba(220,255,216,.45)';c.lineWidth=1;c.beginPath();c.ellipse(0,-62,10+i*6,13+i*9,t/1600+i*.3,0,7);c.stroke();}c.fillStyle='#cfbb7f';c.fillRect(-57,-6,114,6);c.font='bold 13px "Noto Sans JP",serif';c.textAlign='center';c.fillStyle='#fff1b6';c.fillText('GOAL',0,-146);path(c,[[-54,-134],[54,-134],[43,-115],[-43,-115]],'#153e34');c.fillStyle='#ead397';c.fillText(open?('みんなのゴール'):'橋を３つ開こう',0,-120);c.restore();}
export function paint587(r,g,u,positions,focus,at){const course=course589(g),c=r.ctx,w=r.width,h=r.height;if(!w||!h)return;const dt=Math.min(.05,(at-(r.last||at))/1000);r.last=at;
 const look=look588(w,h,focus,g),view=look.view;r.scale=look.scale;const snap=r.snap||Math.abs(r.camera-look.camera)>500||u.reduced;if(snap){r.camera=look.camera;r.offsetY=look.offsetY;r.snap=false;}else{r.camera+=(look.camera-r.camera)*(1-Math.exp(-dt*11));r.offsetY+=(look.offsetY-r.offsetY)*(1-Math.exp(-dt*13));}

 c.setTransform(r.dpr,0,0,r.dpr,0,0);paintBackdrop591(r,course);
 for(let i=0;i<8;i++){const x=(i*71.7-r.camera*.08+(u.reduced?0:Math.sin(at/3200+i)*14))%(w+10),y=(i*43.7+(u.reduced?0:at*.006))%(h*.8);c.fillStyle='rgba(255,249,185,.55)';c.beginPath();c.arc(x<0?x+w:x,y,1+i%2*.5,0,7);c.fill();}
 c.save();c.translate(-r.camera*r.scale,r.offsetY);c.scale(r.scale,r.scale);const left=r.camera-100,right=r.camera+view+100,visible=s=>s.x+(s.w??40)>left&&s.x<right;
 for(const s of surfaces587(g.elapsed+Math.min(90,Math.max(0,at-g.serverAt)),course,g).filter(s=>visible(s)&&!s.wall&&!s.bridge))platform591(r,s,course);
 for(const wall of course.walls.filter(visible))platform591(r,{...wall,wall:true},course);
 scenery589(c,g,{...course,walls:[]},left,right,u.reduced?0:at);
 for(const cp of course.checkpoints.slice(1))if(visible(cp))flag(c,cp.x,cp.y,(focus.checkpoint??0)>=course.checkpoints.indexOf(cp),'CHECK');
 if(r.camera<300){c.fillStyle='#203f32';c.fillRect(190,248,3,52);path(c,[[155,233],[218,233],[231,244],[218,255],[155,255]],'#e0c288');c.fillStyle='#214536';c.font='bold 11px "Noto Sans JP",sans-serif';c.textAlign='center';c.fillText('GO! →',188,248);}
 for(const s of course.springs.filter(visible))spring588(c,s,at,g);
 for(const gem of course.gems.filter(visible)){if(focus.gems?.includes(gem.id))continue;const y=gem.y+(u.reduced?0:Math.sin(at/260+gem.x)*4);path(c,[[gem.x,y-13],[gem.x+10,y],[gem.x,y+13],[gem.x-10,y]],'#a1ffbd');c.shadowBlur=0;path(c,[[gem.x,y-11],[gem.x+8,y],[gem.x,y+9]],'#48c4ac');c.strokeStyle='#eeffbf';c.lineWidth=1.5;c.stroke();c.fillStyle='#efffbd';c.font='bold 9px "Noto Sans JP",sans-serif';c.textAlign='center';c.fillText('加速',gem.x,y-20);}
 for(const item of course.pickups)if(visible(item)&&!focus.powers?.includes(item.id))pickup591(c,item,u.reduced?0:at);
 for(const b of g.projectiles??[]){if(!visible(b))continue;const lead=Math.min(65,Math.max(0,at-g.serverAt))/1000,x=b.x+b.vx*lead;c.fillStyle=b.kind==='fire'?'#ffc288':'#bcffe7';c.beginPath();c.ellipse(x,b.y,b.kind==='fire'?7:12,6,0,0,7);c.fill();c.fillStyle='#fff2cc';c.beginPath();c.arc(x+Math.sign(b.vx)*2,b.y,3,0,7);c.fill();c.strokeStyle=b.kind==='fire'?'#f3977544':'#adf5e844';c.lineWidth=4;c.beginPath();c.moveTo(x,b.y);c.lineTo(x-Math.sign(b.vx)*19,b.y);c.stroke();}
 const enemyFrames=r.enemies591??=new Map();
 for(const e of g.enemies){if(e.defeated)continue;const p=enemyAt587(e,g.elapsed+Math.max(0,Math.min(90,at-g.serverAt)));if(!visible(p))continue;
  const frame=u.reduced?0:Math.floor(at/100)%4;let tile=enemyFrames.get(frame);
  if(!tile){tile=document.createElement('canvas');tile.width=76;tile.height=58;beetle588(tile.getContext('2d'),{x:36,y:44,dir:1},frame*100);enemyFrames.set(frame,tile);}
  c.save();c.translate(p.x,p.y);c.scale(p.dir,1);c.drawImage(tile,-36,-44);c.restore();
 }
 if(visible({x:course.goal}))gate(c,u.reduced?0:at,course,readyGate589(g));
 for(const p of positions){if(!p.alive||p.respawnAt||p.finishTime!=null)continue;const floor=surfaces587(g.elapsed,course,g).filter(s=>p.x>s.x-10&&p.x<s.x+s.w+10&&s.y>=p.y).sort((a,b)=>a.y-b.y)[0];if(floor){c.fillStyle='rgba(1,17,18,.25)';c.beginPath();c.ellipse(p.x,floor.y-1,Math.max(6,17-(floor.y-p.y)/12),3,0,0,7);c.fill();}if(p.boostUntil>at&&!u.reduced){for(let i=0;i<4;i++){c.fillStyle=`rgba(151,255,186,${.35-i*.07})`;c.fillRect(p.x-p.facing*(18+i*10),p.y-17+i%2*4,7,3);}}}
 if(!u.reduced)for(const e of g.events){const age=at-e.at;if(age<0||age>600||!Number.isFinite(e.x))continue;if(!['defeat','power','bump','shoot','stomp','spring','boost','miss','jump','goal','land','buddy','wallkick','switch','rescue'].includes(e.type))continue;const count=['jump','land'].includes(e.type)?5:10;for(let i=0;i<count;i++){const a=i/count*Math.PI*2,dist=age/11;c.fillStyle=e.type==='miss'?'#ffb7a7':e.type==='boost'?'#c9ffd0':'#fff0b9';c.globalAlpha=1-age/600;c.fillRect(e.x+Math.cos(a)*dist,e.y-15+Math.sin(a)*dist+age*age/17000,3,3);}c.globalAlpha=1;}
 c.restore();r.positions=positions;
}
