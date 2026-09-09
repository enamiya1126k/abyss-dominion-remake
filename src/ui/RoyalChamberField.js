import{ROYAL_ASSET,createRoyalWorld,royalHeroPositions,royalContact}from'../core/RoyalChamberSystem.js?v=3.1.59-build379';
// Uses the same Entity, Camera, route finder and sprite renderer as exploration.
export function mountRoyalChamber(g,{canvas,Entity,Camera,findPath,drawMonster,TILE,room,party,heroes,onSave,onApproach,onContact,onThrone,blocked=()=>false}){
 g.royal=true;g.world=createRoyalWorld();g.player=new Entity(room.position.x,room.position.y);g.canvas=canvas;g.ctx=canvas.getContext('2d');g.running=true;g.paused=false;g.last=performance.now();g.camera=new Camera(canvas);
 const image=new Image();image.src=ROYAL_ASSET;let frame=0,lastPaint=0,lastSave=0,disposed=false,armed=false,drag=false,pinch=null;const points=new Map(),heroActors=royalHeroPositions(heroes),trail=[];
 function fit(){const rect=canvas.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);canvas.width=Math.max(1,Math.round(rect.width*d));canvas.height=Math.max(1,Math.round(rect.height*d));g.camera.reset(g.player.rx*TILE,g.player.ry*TILE);g.camera.z=canvas.width/(TILE*20);g.camera.clamp(g.world)}
 fit();const observer=new ResizeObserver(fit);observer.observe(canvas);
 const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
 const busy=()=>g.paused||blocked();
 canvas.onpointerdown=e=>{if(busy())return;canvas.setPointerCapture?.(e.pointerId);const p=point(e);points.set(e.pointerId,{...p,startX:e.clientX,startY:e.clientY});if(points.size===2){const[a,b]=[...points.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:g.camera.z};drag=true}};
 canvas.onpointermove=e=>{const p=points.get(e.pointerId);if(!p||busy())return;const q=point(e),dx=q.x-p.x,dy=q.y-p.y;Object.assign(p,q);if(points.size>=2){const[a,b]=[...points.values()];if(pinch)g.camera.z=Math.max(canvas.width/(TILE*24),Math.min(canvas.width/(TILE*10),pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance)));g.camera.clamp(g.world);return}if(Math.hypot(e.clientX-p.startX,e.clientY-p.startY)>8)drag=true;if(drag){g.camera.pan(dx,dy);g.camera.clamp(g.world)}};
 const release=e=>{points.delete(e.pointerId);if(points.size<2)pinch=null;if(!points.size)drag=false};
 canvas.onpointerup=e=>{const p=points.get(e.pointerId),wasDrag=drag||pinch;release(e);if(!p||wasDrag||busy())return;const q=point(e),w=g.camera.screen(q.x,q.y),goal={x:Math.floor(w.x/TILE),y:Math.floor(w.y/TILE)};let route=findPath(g.world,g.player,goal);if(!route.length&&!g.world.tiles[goal.y]?.[goal.x])return;if(route.length){g.player.setPath(route);armed=true;g.camera.manual=false}};
 canvas.onpointercancel=canvas.onlostpointercapture=release;
 const key=e=>{if(busy()||e.target?.matches('input,textarea,button'))return;const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(!d)return;e.preventDefault();if(g.player.path.length)return;const p={x:g.player.x+d[0],y:g.player.y+d[1]},route=findPath(g.world,g.player,p);if(route.length){g.player.setPath(route);armed=true;g.camera.manual=false}};document.addEventListener('keydown',key);
 function label(text,x,y,color='#ead18d'){const p=g.camera.world((x+.5)*TILE,(y+1)*TILE),ctx=g.ctx,font=Math.max(11,canvas.width/48);ctx.font=`bold ${font}px sans-serif`;const width=ctx.measureText(text).width+12;ctx.fillStyle='#08080deb';ctx.fillRect(p.x-width/2,p.y+5,width,font+8);ctx.strokeStyle='#94743b';ctx.strokeRect(p.x-width/2,p.y+5,width,font+8);ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(text,p.x,p.y+font+7)}
 function draw(){const ctx=g.ctx,camera=g.camera;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#07070a';ctx.fillRect(0,0,canvas.width,canvas.height);const origin=camera.world(0,0);if(image.complete&&image.naturalWidth)ctx.drawImage(image,origin.x,origin.y,20*TILE*camera.z,30*TILE*camera.z);else{ctx.fillStyle='#30251c';for(let y=0;y<30;y++)for(let x=0;x<20;x++)if(!g.world.tiles[y][x]){const p=camera.world(x*TILE,y*TILE);ctx.fillRect(p.x,p.y,TILE*camera.z-1,TILE*camera.z-1)}}
 const activeHeroes=room.phase==='victory'?[]:room.phase==='cleared'?heroActors.map((h,i)=>({...h,x:7+i*2,y:9})):heroActors;
 const actors=activeHeroes.map(h=>({position:{x:h.x,y:h.y,moving341:false,facing:'left'},monster:{speciesId:h.id,visualSpeciesId:h.id},name:h.name,hero:true}));
 party.forEach((m,i)=>{const p=trail[Math.min(trail.length-1,i*12)]??{x:g.player.rx,y:g.player.ry+i*.8,facing:g.player.facing};actors.push({position:{...p,moving341:g.player.path.length>0},monster:m,index:i})});
 actors.sort((a,b)=>a.position.y-b.position.y).forEach(a=>{drawMonster(a.position,a.monster,a.hero,1,a.index??0);if(a.hero)label(a.name,a.position.x,a.position.y)});
 if(room.phase==='victory'||room.phase==='cleared'||!activeHeroes.length)label(room.phase==='cleared'?'玉座・決戦の記憶':'玉座へ',10,6);
 if(g.player.path.length){const end=g.player.path.at(-1),p=camera.world((end.x+.5)*TILE,(end.y+.5)*TILE);ctx.strokeStyle='#e7cc7e';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,12,5,0,0,Math.PI*2);ctx.stroke()}
 }
 function persist(){room.position={x:g.player.x,y:g.player.y};onSave?.()}
 function tick(now){if(disposed||!g.running||!canvas.isConnected)return;const dt=Math.min(.05,(now-g.last)/1000);g.last=now;
 if(!busy()){const moved=g.player.move(dt,4.5);if(g.player.path.length||moved){trail.unshift({x:g.player.rx,y:g.player.ry,facing:g.player.facing});if(trail.length>70)trail.pop();g.camera.follow(g.player.rx*TILE,g.player.ry*TILE,dt);g.camera.clamp(g.world)}if(moved&&now-lastSave>800){persist();lastSave=now}
 if(room.phase==='approach'&&(royalContact({x:g.player.rx,y:g.player.ry},heroActors,{audience:true})||!heroActors.length&&g.player.ry<=16)){g.player.path=[];armed=false;persist();onApproach()}
 else if(room.phase==='ready'&&armed&&royalContact({x:g.player.rx,y:g.player.ry},heroActors)){g.player.path=[];armed=false;persist();onContact()}
 else if(['victory','cleared'].includes(room.phase)&&armed&&Math.hypot(g.player.rx-10,g.player.ry-6)<=1.5){g.player.path=[];armed=false;persist();onThrone()}}
 if(now-lastPaint>=1000/30){draw();lastPaint=now}frame=requestAnimationFrame(tick)}
 g.centerRoyal=()=>{fit();g.camera.manual=false};g.disposeRoyal=()=>{if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('keydown',key);canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=null;if(!g.paused)persist()};frame=requestAnimationFrame(tick);return g;
}
