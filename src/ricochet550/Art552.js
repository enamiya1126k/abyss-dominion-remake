import {CARNIVAL552,GEM_COLORS552,rotorAngle552,fever552} from './Carnival552.js';
export const asset552=name=>new URL('../../assets/ricochet552/'+name+'.png',import.meta.url).href;
const cache=new Map(),tau=Math.PI*2;
export function image552(name){if(!cache.has(name)){const im=new Image();im.src=asset552(name);cache.set(name,im)}return cache.get(name)}
// Explicit source rectangles prevent adjacent sprites from bleeding into the rotating paddle.
const regions552=[[30,34,364,373],[447,34,364,373],[860,34,364,373],[23,425,395,417],[444,439,378,399],[847,477,383,321],[26,841,374,375],[408,969,442,106],[862,971,368,106]];
export function sprite552(c,id,x,y,w,h=w){const im=image552('carnival-props');if(!im.complete||!im.naturalWidth)return false;const [sx,sy,sw,sh]=regions552[id],k=im.naturalWidth/1254;c.save();c.translate(x,y);c.scale(1,-1);c.drawImage(im,sx*k,sy*k,sw*k,sh*k,-w/2,-h/2,w,h);c.restore();return true}
export function gemArt552(gem,lit){return `<i class="rc-gem552${lit?' is-lit':''}" data-gem="${gem}" aria-hidden="true"></i>`}
function circle(c,x,y,r,color,w=.04){c.beginPath();c.arc(x,y,r,0,tau);c.strokeStyle=color;c.lineWidth=w;c.stroke()}
function label(c,text,x,y,size,color='#ffebba'){c.save();c.translate(x,y);c.scale(1,-1);c.textAlign='center';c.textBaseline='middle';c.font=`800 ${size}px sans-serif`;c.strokeStyle='#093226';c.lineWidth=.09;c.strokeText(text,0,0);c.fillStyle=color;c.fillText(text,0,0);c.restore()}
export function cabinet552(c,g,r,at){
 const im=image552('carnival-table');c.fillStyle='#0b392d';c.fillRect(-6.45,-.45,12.9,18.9);
 if(im.complete&&im.naturalWidth){c.save();c.translate(-7.302,19.195);c.scale(1,-1);c.drawImage(im,0,0,14.646,20.866);c.restore()}
 // The light rail follows the actual collision boundary, including its four corners.
 c.beginPath();c.roundRect(-6,-.01,12,18.02,.08);c.strokeStyle=fever552(g)?'#ffe29d':'#c4a266b0';c.lineWidth=.045;c.stroke();
 for(let y=.5;y<18;y+=.85)for(const x of [-6.23,6.23]){const lit=fever552(g)||!r.reduced&&Math.floor(at/220)%5===Math.floor(y/.85)%5;c.beginPath();c.arc(x,y,.065,0,tau);c.fillStyle=lit?'#ffdda1':'#9c783c';c.fill()}
 const spin=rotorAngle552(g,at);c.save();c.translate(0,CARNIVAL552.rotorY);c.rotate(spin);c.fillStyle='#001a1470';c.beginPath();c.roundRect(-2.26,-.33,4.52,.62,.3);c.fill();
 if(!sprite552(c,7,0,0,4.65,.99)){c.fillStyle='#bb9a59';c.beginPath();c.roundRect(-2.34,-.22,4.68,.44,.22);c.fill()}c.restore();
 const ready=r.self?.gems552===7,rest=Math.max(0,Math.ceil((g.carnival552.lockUntil-at)/1000));
 for(const b of g.layout.bumpers){
  const flash=g.events.some(e=>(e.type==='pin'&&e.bumper===b.id||e.type==='jackpot'&&b.kind==='crown')&&at-e.at<160&&at>=e.at);
  const tint=b.kind==='gem'?GEM_COLORS552[b.gem]:'#f6cf76',index=b.kind==='gem'?b.gem:b.kind==='crown'?3:4;
  if(!r.reduced&&(flash||b.kind==='crown'&&ready)){c.save();c.globalAlpha=flash?.7:.25+.12*Math.sin(at/180);circle(c,b.x,b.y,b.r*1.24,tint,.1);c.restore()}
  sprite552(c,index,b.x,b.y,b.r*2.08*(flash&&!r.reduced?1.035:1));
  if(b.kind==='crown')label(c,rest?`CHARGE ${rest}`:ready?'JACKPOT!':'CROWN',b.x,b.y+1.47,.3,ready?'#fff4a4':'#d3bb83');
  else if(b.kind==='gem')label(c,['I','II','III'][b.gem],b.x,b.y-b.r-.25,.28,tint);
 }
 for(const b of g.layout.chests){if(b.claimed!=null){circle(c,b.x,b.y,.25,'#caac6650',.028);continue}sprite552(c,5,b.x,b.y,1.3);}
 if(!g.players.some(p=>p.racing)){label(c,'P U L L   &   R I C O C H E T',0,3.05,.24,'#e1c98988');}
}
export function pod552(c,p,color,at,reduced){
 c.save();c.translate(p.x,p.y);c.fillStyle='#03140f8f';c.beginPath();c.ellipse(.07,-.13,p.r*1.18,p.r*.9,0,0,tau);c.fill();
 sprite552(c,6,0,0,p.r*2.1);circle(c,0,0,p.r*.87,color,.075);
 if(p.gems552===7&&!reduced){circle(c,0,0,p.r*1.35,'#ffdf8ca0',.032);for(let i=0;i<3;i++){const a=at/700+i*tau/3;c.beginPath();c.arc(Math.cos(a)*p.r*1.3,Math.sin(a)*p.r*1.3,.065,0,tau);c.fillStyle=GEM_COLORS552[i];c.fill()}}
 c.restore();
}
export function sling552(c,p,pull,color){
 if(!pull?.active)return;const a=pull.angle,power=pull.power,nx=Math.sin(a),ny=Math.cos(a),length=.9+power*1.55;
 c.save();c.translate(p.x,p.y);c.rotate(-a);
 // Stretched twin cords and leather handle are the input gesture, never a predicted path.
 for(const x of [-.23,.23]){c.beginPath();c.moveTo(x,-.2);c.quadraticCurveTo(x*.8,-length*.6,x*.55,-length);c.strokeStyle='#231b13';c.lineWidth=.085;c.stroke();c.strokeStyle='#e0bb73';c.lineWidth=.035;c.stroke()}
 sprite552(c,8,0,-length,1.1,.31);c.beginPath();c.moveTo(-.19,.68);c.lineTo(0,.95+power*.25);c.lineTo(.19,.68);c.strokeStyle=power>.95?'#fff1c0':color;c.lineWidth=.075;c.lineCap='round';c.stroke();c.restore();
}
export function sparks552(c,g,r,at){
 const events=g.events.filter(e=>at-e.at>=0&&at-e.at<750&&e.x!=null);
 for(const e of events){const age=(at-e.at)/750;if(!r.reduced&&['wall','hit','pin','rotor','bell','jackpot','burst','treasure','combo'].includes(e.type)){c.globalAlpha=1-age;const big=e.type==='jackpot'||e.type==='burst',n=big?22:7;for(let i=0;i<n;i++){const a=i*tau/n+e.id,len=age*(big?4:1.05),x=e.x+Math.cos(a)*len,y=e.y+Math.sin(a)*len;c.save();c.translate(x,y);c.rotate(a);c.fillStyle=i%3===0?'#fff2c0':GEM_COLORS552[i%3];c.fillRect(0,0,big?.1:.04,big?.21:.1);c.restore()}}
  if(e.value&&events.filter(q=>q.value).sort((a,b)=>b.value-a.value).slice(0,3).includes(e)){c.globalAlpha=1-age;label(c,'+'+e.value.toLocaleString('ja-JP'),e.x,e.y+.6+age,e.type==='jackpot'?.76:.37,e.type==='jackpot'?'#ffe396':'#fff4ce')}
 }c.globalAlpha=1;
}
