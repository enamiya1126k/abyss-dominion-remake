const actions441=new WeakMap();
export const setBattleAction441=(battle,action)=>{if(battle)actions441.set(battle,action)};
export const battleAction441=battle=>battle?actions441.get(battle):null;
// Presentation only: no combat-state writes, timers awaited by combat, or shared RNG.
const palettes={fire:['#ff7439','#ffe9a5'],ice:['#74dfff','#efffff'],water:['#409fff','#b7f8ff'],wind:['#67efac','#ecffe9'],earth:['#cda465','#fff0c0'],lightning:['#b78aff','#fff3a5'],light:['#ffe59b','#fffced'],dark:['#af67ee','#e8baff'],neutral:['#d6d9ef','#ffffff']};
const scenes=new WeakMap(),images=new Map();
const unit=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453123;return v-Math.floor(v)};
function circleImage(src){if(!src)return null;if(!images.has(src)){const img=new Image();img.src=src;images.set(src,img)}const img=images.get(src);return img.complete&&img.naturalWidth?img:null}
export function playBattleEffect441(target,{element='neutral',magic=false,critical=false,ultimate=false,circle=null,speed=1}={}){
 const arena=target?.closest?.('.battle-arena');if(!arena||!target.isConnected)return false;
 let scene=scenes.get(arena);
 if(!scene||!scene.canvas.isConnected){const canvas=document.createElement('canvas');canvas.className='battle-effects441';canvas.setAttribute('aria-hidden','true');arena.appendChild(canvas);scene={canvas,arena,bursts:[],raf:0};scenes.set(arena,scene)}
 const r=arena.getBoundingClientRect(),t=target.getBoundingClientRect(),reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 if(!r.width||!r.height)return false;
 const x=(t.left+t.width*.5-r.left)*arena.clientWidth/r.width,y=(t.top+t.height*.43-r.top)*arena.clientHeight/r.height;
 if(circle)circleImage(circle);
 const started=performance.now(),duration=reduced?240:Math.max(260,(ultimate?880:critical?620:500)/Math.sqrt(Math.max(1,Number(speed)||1)));
 scene.bursts.push({x,y,element:palettes[element]?element:'neutral',magic,critical,ultimate,circle,started,duration,reduced,radius:Math.max(34,Math.min(100,t.width*.72))});
 if(scene.bursts.length>4)scene.bursts.shift();
 if(!scene.raf)scene.raf=requestAnimationFrame(now=>draw(scene,now));return true;
}
function draw(scene,now){
 scene.raf=0;const{canvas,arena}=scene;
 if(!arena.isConnected||!canvas.isConnected){scene.bursts=[];return}
 const w=arena.clientWidth,h=arena.clientHeight,dpr=Math.min(1.5,globalThis.devicePixelRatio||1);
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
 const c=canvas.getContext('2d');if(!c){scene.bursts=[];canvas.remove();return}
 c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
 scene.bursts=scene.bursts.filter(e=>now-e.started<e.duration);
 for(const e of scene.bursts){const p=Math.max(0,(now-e.started)/e.duration),fade=Math.pow(1-p,1.5),[color,core]=palettes[e.element],radius=e.radius;c.save();c.translate(e.x,e.y);c.globalCompositeOperation='lighter';
  if(e.reduced){c.globalAlpha=fade*.45;c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.arc(0,0,radius*.6,0,Math.PI*2);c.stroke();c.restore();continue}
  const glow=c.createRadialGradient(0,0,0,0,0,radius*.8);glow.addColorStop(0,core+'aa');glow.addColorStop(.23,color+'66');glow.addColorStop(1,color+'00');c.globalAlpha=fade*.65;c.fillStyle=glow;c.fillRect(-radius,-radius,radius*2,radius*2);
  c.globalAlpha=fade;c.shadowBlur=7;c.shadowColor=color;c.strokeStyle=color;
  if(!e.magic){
   for(let i=0;i<(e.critical?2:1);i++){c.save();c.rotate(i?-1.03:-.62);const stretch=(.45+Math.min(1,p*4))*(e.critical?1.22:1);c.scale(stretch,1);c.lineWidth=7*(1-p);c.beginPath();c.moveTo(-radius,-radius*.15);c.quadraticCurveTo(0,radius*.23,radius,-radius*.15);c.stroke();c.lineWidth=2;c.strokeStyle=core;c.stroke();c.restore()}
  }else{
   c.lineWidth=2.4*(1-p);c.beginPath();c.ellipse(0,0,radius*(.3+p),radius*(.18+p*.65),-p*.6,0,Math.PI*2);c.stroke();
   if(e.ultimate&&e.circle){const img=circleImage(e.circle);if(img){c.save();c.globalAlpha=fade*.7;c.rotate(p*.45);const size=radius*(1.5+p);c.drawImage(img,-size/2,-size/2,size,size);c.restore()}}
   if(e.element==='wind'||e.element==='dark'||e.element==='water'){for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,radius*(.2+p*.65+i*.12),p*3+i*2,p*3+i*2+1.7);c.stroke()}}
   if(e.element==='lightning'){for(let i=0;i<3;i++){c.save();c.rotate(i*2.094);c.beginPath();c.moveTo(-10,-radius);for(let j=1;j<6;j++)c.lineTo((unit(i*8+j)-.5)*radius*.55,-radius+j*radius*.34);c.stroke();c.restore()}}
  }
  const count=e.critical||e.ultimate?22:12;
  for(let i=0;i<count;i++){const angle=i*2.399963+unit(i)*.6,travel=radius*(.16+unit(i+30)*.8)*(.2+Math.pow(p,.58)),x=Math.cos(angle)*travel,y=Math.sin(angle)*travel+(e.element==='fire'?-p*28:p*p*13),size=(1.4+unit(i+70)*3.2)*(1-p*.6);c.globalAlpha=fade*(.4+unit(i+10)*.6);c.fillStyle=i%3?color:core;c.save();c.translate(x,y);c.rotate(angle+p);
   if(e.magic&&(e.element==='ice'||e.element==='earth')){c.beginPath();c.moveTo(0,-size*2.8);c.lineTo(size,0);c.lineTo(0,size*1.3);c.lineTo(-size,0);c.closePath();c.fill()}
   else if(e.element==='light'){c.fillRect(-size*2,-.7,size*4,1.4);c.fillRect(-.7,-size*2,1.4,size*4)}
   else{c.beginPath();c.ellipse(0,0,size*(e.magic?1:2.4),size*.6,0,0,Math.PI*2);c.fill()}c.restore();
  }c.restore();
 }
 if(scene.bursts.length)scene.raf=requestAnimationFrame(time=>draw(scene,time));else canvas.remove();
}
