import {ARENA555,final555} from './Arena555.js';
import {sprite552} from './Art552.js';
import {rotorAngle552,fever552,GEM_COLORS552} from './Carnival552.js';
export const asset555=name=>new URL('../../assets/ricochet555/'+name+'.png',import.meta.url).href;
const images=new Map(),tau=Math.PI*2;
function picture(name){if(!images.has(name)){const im=new Image();im.src=asset555(name);images.set(name,im);}return images.get(name);}
export function label555(c,t,x,y,size,color='#ffedbb'){const k=size/32;c.save();c.translate(x,y);c.scale(k,-k);c.font='800 32px "Noto Sans JP", "Hiragino Sans", sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=.045/k;c.strokeStyle='#04271f';c.strokeText(t,0,0);c.fillStyle=color;c.fillText(t,0,0);c.restore();}
function circle(c,x,y,r,color,w=.04){c.beginPath();c.arc(x,y,r,0,tau);c.strokeStyle=color;c.lineWidth=w;c.stroke();}
export function cabinet555(c,g,r,at){const floor=picture('arena-floor'),rotor=picture('impact-rotor'),H=ARENA555.height;c.fillStyle='#06372b';c.fillRect(-8.2,-.2,16.4,H+.4);
 if(floor.complete&&floor.naturalWidth){c.save();c.translate(-8.18,H+.18);c.scale(1,-1);c.drawImage(floor,0,0,16.36,H+.36);c.restore();}
 const self=r.self,active=fever552(g);c.strokeStyle=active?'#ffe590':'#c9a860';c.lineWidth=.055;c.strokeRect(-8,0,16,H);
 // Raised inner rails create actual traversable outer lanes, sharing the solver geometry.
 for(const rail of g.layout.rails){c.save();c.lineCap='round';c.lineWidth=rail.r*2+.07;c.strokeStyle='#372d17';c.beginPath();c.moveTo(rail.x,rail.from);c.lineTo(rail.x,rail.to);c.stroke();c.lineWidth=rail.r*2;c.strokeStyle='#b4904d';c.stroke();c.lineWidth=.055;c.strokeStyle='#ffe6a1';c.stroke();c.restore();}
 for(const lane of g.layout.lanes){const progress=self?.lane555?.side===lane.side?self.lane555.step:0;for(let i=0;i<3;i++){const y=lane.checkpoints[i],lit=i<progress;c.save();c.globalAlpha=lit?1:.62;sprite552(c,i,lane.x,y,.78);c.restore();label555(c,String(i+1),lane.x,y-.62,.22,GEM_COLORS552[i]);}
  for(let y=4.3;y<14;y+=2){c.beginPath();c.moveTo(lane.x-.18,y-.1);c.lineTo(lane.x,y+.08);c.lineTo(lane.x+.18,y-.1);c.lineWidth=.045;c.strokeStyle='#e6d89155';c.stroke();}
  label555(c,'３色レーン',lane.x,2.4,.25,'#dcc992');
 }
 // The rotor's exact server angle and velocity also drive its depiction.
 const spin=rotorAngle552(g,at);c.save();c.translate(0,ARENA555.rotorY);circle(c,0,0,3.2,'#bb94562b',.045);c.rotate(spin);
 if(rotor.complete&&rotor.naturalWidth){c.scale(1,-1);c.drawImage(rotor,22,383,1493,256,-3.11,-.533,6.22,1.066);}c.restore();
 const rest=Math.max(0,Math.ceil((g.carnival552.lockUntil-at)/1000)),ready=self?.gems552===7;
 for(const b of g.layout.bumpers){const flash=g.events.some(e=>e.type==='pin'&&e.bumper===b.id&&at>=e.at&&at-e.at<130),need=b.kind==='gem'&&!(self?.gems552&(1<<b.gem)),tint=b.kind==='gem'?GEM_COLORS552[b.gem]:'#ffdf87';
  if(need||b.kind==='crown'&&ready){c.save();c.globalAlpha=r.reduced?.75:.58+.22*Math.sin(at/220+b.id);circle(c,b.x,b.y,b.r+.17,tint,.06);c.restore();}
  if(flash)circle(c,b.x,b.y,b.r+.22,'#fff7c9',.07);sprite552(c,b.kind==='gem'?b.gem:b.kind==='crown'?3:4,b.x,b.y,b.r*2.05);
  if(b.kind==='gem')label555(c,['赤','青','緑'][b.gem],b.x,b.y-b.r-.26,.26,need?tint:'#a4b6a5');
  if(b.kind==='crown'){label555(c,rest?'王冠 '+rest+'秒':ready?'狙え！ 王冠':'３色 → 王冠',b.x,b.y+1.21,.34,ready?'#fff5b6':'#e5c482');label555(c,final555(g,at)?'残り15秒 · 王冠２倍':'×1 ・ ×3 ・ ×7',b.x,b.y-1.21,.25,'#e2c083');}
 }
 // This is a machine charge indicator, not a predicted trajectory.
 c.save();c.translate(0,ARENA555.rotorY);c.beginPath();c.arc(0,0,3.28,-Math.PI/2,-Math.PI/2+tau*(active?1:g.carnival552.heat/100));c.lineWidth=.075;c.strokeStyle=active?'#ffe699':'#66dbc0';c.stroke();c.restore();
 label555(c,active?'回転 FEVER ×2':'棒を回して FEVER',0,7.95,.26,active?'#ffdf8a':'#a0cfb6');
}
export function effects555(c,g,r,at){const events=g.events.filter(e=>at>=e.at&&at-e.at<650&&e.x!=null);for(const e of events){const t=(at-e.at)/650;if(!r.reduced&&['pin','hit','rotor','burst','jackpot','laneGate'].includes(e.type)){const big=e.type==='burst'||e.type==='jackpot';c.save();c.globalAlpha=(1-t)*.85;for(let i=0;i<(big?18:5);i++){const a=i*tau/(big?18:5)+e.id,len=.1+t*(big?2:1);c.beginPath();c.moveTo(e.x+Math.cos(a)*len,e.y+Math.sin(a)*len);c.lineTo(e.x+Math.cos(a)*(len+.15),e.y+Math.sin(a)*(len+.15));c.lineWidth=big?.055:.035;c.strokeStyle=i%2?'#ffe8a7':'#b6ffe0';c.stroke();}c.restore();}}
 const points=events.filter(e=>e.value&&e.seat===r.self?.seat).sort((a,b)=>b.value-a.value).slice(0,2);for(const e of points){const t=(at-e.at)/650;c.save();c.globalAlpha=1-t;label555(c,'+'+e.value.toLocaleString('ja-JP'),e.x,e.y+.55+t,.34,e.type==='jackpot'?'#ffe6a1':'#fff3ce');c.restore();}
}
