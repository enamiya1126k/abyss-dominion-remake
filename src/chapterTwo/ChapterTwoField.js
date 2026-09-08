import {ROOMS,ENCOUNTERS,chapterTwoWorld} from './ChapterTwoSystem.js?v=3.1.56-build376';
const DOORS={north:{x:9,y:2},south:{x:9,y:16},east:{x:16,y:9},west:{x:2,y:9}};
export function mountChapterTwoField(g,{canvas,Entity,Camera,findPath,drawMonster,TILE,run,party,onSave,onContact,blocked=()=>false}){
 g.chapterTwo=true;g.world=chapterTwoWorld();g.player=new Entity(run.position.x,run.position.y);g.canvas=canvas;g.ctx=canvas.getContext('2d');g.camera=new Camera(canvas);g.running=true;g.paused=false;
 let frame=0,disposed=false,last=performance.now(),lastPaint=0,lastSave=0,drag=false,pinch=null,armed=false;const pointers=new Map(),trail=[];
 const room=ROOMS[run.room],objects=Object.entries(room.links).map(([direction,to])=>({id:direction,type:'door',...DOORS[direction],label:ROOMS[to].name}));
 if(room.encounter&&!run.defeated.includes(room.encounter))objects.push({id:room.encounter,type:'enemy',x:9,y:7,label:ENCOUNTERS[room.encounter].name});
 if(room.chest&&!run.chest)objects.push({id:'chest',type:'chest',x:6,y:7,label:'宝箱'});
 if(room.spring)objects.push({id:'spring',type:'spring',x:12,y:7,label:'回復の泉'});
 function fit(){const rect=canvas.getBoundingClientRect(),ratio=Math.min(2,globalThis.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));g.camera.reset(g.player.rx*TILE,g.player.ry*TILE);g.camera.z=canvas.width/(TILE*19);g.camera.clamp(g.world)}
 fit();const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(fit):null;observer?.observe(canvas);
 const busy=()=>g.paused||blocked();
 const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
 function walk(goal){if(busy())return;const route=findPath(g.world,g.player,goal);if(route.length){g.player.setPath(route);armed=true;g.camera.manual=false}else if(Math.hypot(g.player.x-goal.x,g.player.y-goal.y)<1.2)armed=true;}
 canvas.onpointerdown=e=>{if(busy())return;canvas.setPointerCapture?.(e.pointerId);const q=point(e);pointers.set(e.pointerId,{...q,sx:e.clientX,sy:e.clientY});if(pointers.size===2){const[a,b]=[...pointers.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:g.camera.z};drag=true}};
 canvas.onpointermove=e=>{const p=pointers.get(e.pointerId);if(!p||busy())return;const q=point(e),dx=q.x-p.x,dy=q.y-p.y;Object.assign(p,q);if(pointers.size>=2&&pinch){const[a,b]=[...pointers.values()];g.camera.z=Math.max(canvas.width/(TILE*22),Math.min(canvas.width/(TILE*9),pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.d)));g.camera.clamp(g.world);return}if(Math.hypot(e.clientX-p.sx,e.clientY-p.sy)>8)drag=true;if(drag){g.camera.pan(dx,dy);g.camera.clamp(g.world)}};
 const release=e=>{pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;if(!pointers.size)drag=false};
 canvas.onpointerup=e=>{const p=pointers.get(e.pointerId),wasDrag=drag||pinch;release(e);if(!p||wasDrag||busy())return;const q=point(e),w=g.camera.screen(q.x,q.y);walk({x:Math.floor(w.x/TILE),y:Math.floor(w.y/TILE)})};
 canvas.onpointercancel=canvas.onlostpointercapture=release;
 const key=e=>{if(busy()||e.target?.matches('input,textarea,button'))return;const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(!d)return;e.preventDefault();if(!g.player.path.length)walk({x:g.player.x+d[0],y:g.player.y+d[1]})};document.addEventListener('keydown',key);
 function label(text,x,y){const c=g.ctx,p=g.camera.world((x+.5)*TILE,(y+1)*TILE),font=Math.max(10,canvas.width/45);c.font=`bold ${font}px sans-serif`;c.textAlign='center';const width=c.measureText(text).width+10;c.fillStyle='#07090ded';c.fillRect(p.x-width/2,p.y,width,font+7);c.strokeStyle='#a18447';c.strokeRect(p.x-width/2,p.y,width,font+7);c.fillStyle='#eee0b5';c.fillText(text,p.x,p.y+font+2);}
 function draw(){const c=g.ctx,cam=g.camera,t=TILE*cam.z;c.imageSmoothingEnabled=false;c.fillStyle='#060b09';c.fillRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<19;y++)for(let x=0;x<19;x++){const p=cam.world(x*TILE,y*TILE),wall=g.world.tiles[y][x],v=(x*13+y*7+run.room*11)%5;
   c.fillStyle=wall?['#10231d','#172b20','#1b3023','#10251d','#263724'][v]:['#293026','#313526','#373526','#2c3328','#36382b'][v];c.fillRect(p.x,p.y,t+1,t+1);
   if(wall){c.fillStyle='#0a1914';c.fillRect(p.x+t*.12,p.y+t*.16,t*.76,t*.7);c.fillStyle='#34402a';c.fillRect(p.x+t*.22,p.y+t*.2,t*.4,t*.14);}
   else{c.fillStyle='#62603e';c.globalAlpha=.18;c.fillRect(p.x+t*.15,p.y+t*.72,t*.25,t*.1);c.globalAlpha=1;if(v===0&&run.room>=3){c.fillStyle='#4d2a53';c.fillRect(p.x+t*.4,p.y,t*.1,t*.8);}}
  }
  for(const o of objects){const p=cam.world(o.x*TILE,o.y*TILE);if(o.type==='enemy'){drawMonster({x:o.x,y:o.y,moving341:false}, {speciesId:ENCOUNTERS[o.id].species[0],level:ENCOUNTERS[o.id].level},false,1.5);}
   else if(o.type==='door'){c.fillStyle='#a99658';c.fillRect(p.x+t*.2,p.y+t*.2,t*.6,t*.6);c.fillStyle='#131710';c.fillRect(p.x+t*.3,p.y+t*.3,t*.4,t*.4);}
   else if(o.type==='chest'){c.fillStyle='#9d7038';c.fillRect(p.x+t*.1,p.y+t*.3,t*.8,t*.5);c.fillStyle='#edc26a';c.fillRect(p.x+t*.1,p.y+t*.3,t*.8,t*.13);c.fillRect(p.x+t*.45,p.y+t*.42,t*.1,t*.2);}
   else{c.fillStyle='#28444d';c.fillRect(p.x,p.y+t*.3,t,t*.6);c.fillStyle='#75c5d5';c.fillRect(p.x+t*.15,p.y+t*.4,t*.7,t*.15);}
   label(o.label,o.x,o.y);
  }
  party.forEach((m,i)=>{const p=trail[Math.min(trail.length-1,i*8)]??{x:g.player.rx-i*.45,y:g.player.ry+i*.35,facing:g.player.facing};drawMonster({...p,moving341:g.player.path.length>0},m,false,1,i)});
  if(g.player.path.length){const p=cam.world((g.player.path.at(-1).x+.5)*TILE,(g.player.path.at(-1).y+.5)*TILE);c.strokeStyle='#e7c979';c.lineWidth=2;c.strokeRect(p.x-t*.25,p.y-t*.25,t*.5,t*.5)}
 }
 function persist(){if(run.room===room.id)run.position={x:g.player.x,y:g.player.y};onSave?.()}
 function tick(now){if(disposed||!g.running||!canvas.isConnected)return;const dt=Math.min(.05,(now-last)/1000);last=now;
  if(!busy()){const moved=g.player.move(dt,5);if(g.player.path.length||moved){trail.unshift({x:g.player.rx,y:g.player.ry,facing:g.player.facing});if(trail.length>40)trail.pop();g.camera.follow(g.player.rx*TILE,g.player.ry*TILE,dt);g.camera.clamp(g.world)}
   if(moved&&now-lastSave>1000){persist();lastSave=now}
   if(armed){const object=objects.find(o=>Math.hypot(g.player.rx-o.x,g.player.ry-o.y)<.85);if(object){armed=false;g.player.path=[];persist();onContact(object)}}
  }
  if(!disposed&&now-lastPaint>=1000/30){draw();lastPaint=now}if(!disposed)frame=requestAnimationFrame(tick);
 }
 g.centerChapterTwo=fit;g.chapterTwoDoor=direction=>{if(DOORS[direction]&&room.links[direction]!=null)walk(DOORS[direction])};
 g.disposeChapterTwo=()=>{if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer?.disconnect();document.removeEventListener('keydown',key);canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=null;persist()};
 frame=requestAnimationFrame(tick);return g;
}
