import {chopMaterial487} from './Presentation487.js';
import {cabbageShape490} from './Shape490.js';
import {destruction490} from './Floor490.js';
import {SWIPE567} from './Rules484.js';
import {createDebris567,release567,stepDebris567} from './Debris567.js';

const boxes=[[30,72,411,432],[469,85,887,442],[917,92,1328,441],[1352,150,1761,444],[13,528,432,830],[453,576,877,826],[897,580,1317,823],[1342,599,1761,823],[637,205,1228,585],[34,790,616,1165],[645,831,1219,1165]];
const images=new Map();
function asset(src){if(!images.has(src)){const im=new Image();im.src='./assets/'+src;images.set(src,im);}return images.get(src);}
const ready=im=>im?.complete&&im.naturalWidth>0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function layout567(width,height,cuts=0,damage=0,position=0){
  const shape=cabbageShape490(cuts),size=Math.min(width*.49,height*.57),sink=destruction490(damage).sink;
  const floor=height*(.80+sink*.10),fw=size*shape.width,fh=size*shape.height;
  const x=width*.49-fw/2,y=floor-fh;
  // One shared blade edge determines the rendered cut and the score crossing.
  const travel=(fh+size*.15)/SWIPE567.contact,edge=y-size*.15+position*travel;
  const kw=size*1.48,kh=kw*474/1527;
  return{width,height,size,floor,x,y,fw,fh,edge,knife:{x:width*.49-kw*.325,y:edge-kh*.995,w:kw,h:kh}};
}

export function createScene567(canvas,{reduced=false}={}){
  const ctx=canvas.getContext('2d',{alpha:true}),scene={canvas,ctx,reduced,position:0,active:false,cuts:0,damage:0,world:createDebris567(),last:0,width:0,height:0,needsPaint:true,draws:0,totalMs:0,cost:0,lite:false};
  scene.food=asset('cabbage486/cabbage-stages.png');scene.fine=asset('cabbage487/fine-stages.png');scene.knife=asset('cabbage488/cleaver.png');
  scene.pose=(position,active)=>{scene.position=position;scene.active=active;scene.needsPaint=true;paintScene567(scene,performance.now(),false);};
  scene.hit=wood=>{if(scene.reduced)return;const l=layout567(scene.width,scene.height,scene.cuts,scene.damage,scene.position);release567(scene.world,{x:l.width*.49,y:Math.min(l.floor,l.edge),floor:l.floor,width:l.width,cuts:scene.cuts,wood});if(scene.lite&&scene.world.bodies.length>24)scene.world.bodies.splice(0,scene.world.bodies.length-24);scene.needsPaint=true;};
  return scene;
}

function food(ctx,scene,l,frame,alpha=1,offset=0){
  const im=frame>=8?scene.fine:scene.food;if(!ready(im))return;
  const [x,y,r,b]=boxes[frame];ctx.globalAlpha=alpha;ctx.drawImage(im,x,y,r-x,b-y,l.x,l.y+offset,l.fw,l.fh);ctx.globalAlpha=1;
}
function drawFood(ctx,s,l){
  const m=chopMaterial487(s.cuts),intersects=s.active&&l.edge>l.y&&l.edge<l.floor;
  const draw=offset=>{
    // The two atlas stages meet at a wipe; alpha blending would double the head.
    if(m.mix<=0){food(ctx,s,l,m.food,1,offset);return;}
    const split=l.x+l.fw*m.mix;
    ctx.save();ctx.beginPath();ctx.rect(split,0,l.width,l.height);ctx.clip();food(ctx,s,l,m.food,1,offset);ctx.restore();
    ctx.save();ctx.beginPath();ctx.rect(0,0,split,l.height);ctx.clip();food(ctx,s,l,m.next,1,offset);ctx.restore();
  };
  // The split mask is clipped at the actual blade edge, not a timed animation.
  // Lifting reverses the mask without granting a cut; only a full stroke scores.
  if(intersects){
    ctx.save();ctx.beginPath();ctx.rect(0,0,l.width,l.edge-1);ctx.clip();draw(-1);ctx.restore();
    ctx.save();ctx.beginPath();ctx.rect(0,l.edge+1,l.width,l.height);ctx.clip();draw(1.4);ctx.restore();
    const t=(l.edge-l.y)/l.fh,span=Math.sqrt(Math.max(0,1-(t*2-1)**2))*l.fw*.43;
    ctx.strokeStyle='#f4ffd5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(l.width*.49-span,l.edge);ctx.lineTo(l.width*.49+span,l.edge);ctx.stroke();
  }else draw(0);
}
function ribbon(ctx,s,b){
  ctx.save();ctx.globalAlpha=clamp((9-b.age)/1.2,0,1);
  ctx.translate(b.x,b.y);ctx.rotate(b.angle);const w=b.length,h=b.thickness;
  ctx.beginPath();ctx.moveTo(-w/2,-h/2);ctx.quadraticCurveTo(-w*.1,-h*.8,w/2,-h*.1);ctx.lineTo(w*.43,h*.7);ctx.quadraticCurveTo(0,h*.05,-w*.43,h*.5);ctx.closePath();
  ctx.fillStyle=(b.wood?['#c28b4d','#8c552f','#e5b67a']:['#c9e9a4','#a7cb75','#edf8c5'])[b.shade];ctx.fill();
  if(!b.wood&&ready(s.food)){ctx.save();ctx.clip();ctx.drawImage(s.food,80+b.shade*65,170,145,35,-w/2,-h/2,w,h*1.5);ctx.restore();}
  ctx.strokeStyle=b.wood?'#e5bc7966':'#f4ffd7a8';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-w*.4,-h*.2);ctx.quadraticCurveTo(0,-h*.3,w*.38,0);ctx.stroke();ctx.restore();
}

export function paintScene567(s,now=performance.now(),advance=true){
  if(!s.ctx||s.canvas.ownerDocument?.visibilityState==='hidden'){s.last=now;return;}
  const started=performance.now(),width=s.canvas.clientWidth,height=s.canvas.clientHeight;if(!width||!height)return;
  const resized=s.width!==width||s.height!==height;
  if(resized){s.width=width;s.height=height;s.world.bodies=[];s.needsPaint=true;}
  const l=layout567(width,height,s.cuts,s.damage,s.position),dt=s.last?Math.min(.05,(now-s.last)/1000):0;
  if(advance){s.last=now;const before=s.world.bodies.length;if(!s.reduced)stepDebris567(s.world,dt,{width,floor:l.floor});if(before!==s.world.bodies.length)s.needsPaint=true;}
  // A still knife and sleeping pieces require no redraw; keep watching image loads.
  const loaded=ready(s.food)&&ready(s.fine)&&ready(s.knife);
  if(!s.needsPaint&&!s.world.bodies.some(b=>!b.sleep||b.age>7.8)&&s.loaded===loaded)return;
  s.loaded=loaded;s.needsPaint=false;
  const dpr=Math.min(globalThis.devicePixelRatio??1,s.lite?1.25:2),ctx=s.ctx;
  if(s.canvas.width!==Math.round(width*dpr)||s.canvas.height!==Math.round(height*dpr)){s.canvas.width=Math.round(width*dpr);s.canvas.height=Math.round(height*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
  // Contact shadows are simple ellipses; no blur filters in the animation loop.
  ctx.fillStyle='#10231338';ctx.beginPath();ctx.ellipse(width*.49,l.floor+4,l.fw*.47,Math.max(3,l.size*.035),0,0,Math.PI*2);ctx.fill();
  for(const b of s.world.bodies){ctx.globalAlpha=.14*clamp(1-(b.floor-b.y)/110,0,1);ctx.fillStyle='#13250f';ctx.beginPath();ctx.ellipse(b.x,b.floor+2,b.length*.48,2,0,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  drawFood(ctx,s,l);
  for(const b of s.world.bodies)ribbon(ctx,s,b);
  if(ready(s.knife)){const k=l.knife;ctx.drawImage(s.knife,49,238,1527,474,k.x,k.y,k.w,k.h);}
  // Small tactile travel guide on the edge of the board, away from the food.
  const gx=width*.91,gy=height*.46,gh=Math.min(96,height*.23);
  ctx.strokeStyle=s.active?'#e4f2b885':'#e4f2b83d';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx,gy+gh);ctx.stroke();
  for(const [y,dir] of [[gy,-1],[gy+gh,1]]){ctx.beginPath();ctx.moveTo(gx-4,y-dir*5);ctx.lineTo(gx,y);ctx.lineTo(gx+4,y-dir*5);ctx.stroke();}
  ctx.fillStyle=s.active?'#f7f4c0':'#d5e3a5';ctx.beginPath();ctx.arc(gx,gy+clamp(s.position,0,1)*gh,4,0,Math.PI*2);ctx.fill();
  const cost=performance.now()-started;s.draws++;s.totalMs+=cost;s.cost=s.cost*.9+cost*.1;
  if(!s.lite&&s.draws>25&&s.cost>5){s.lite=true;if(s.world.bodies.length>24)s.world.bodies.splice(0,s.world.bodies.length-24);s.needsPaint=true;}
}

export function updateScene567(scene,player){
  if(scene.cuts!==(player?.cuts??0)||scene.damage!==(player?.boardDamage??0))scene.needsPaint=true;
  scene.cuts=player?.cuts??0;scene.damage=player?.boardDamage??0;
  paintScene567(scene);
}
