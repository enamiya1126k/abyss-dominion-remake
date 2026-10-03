import {CONTROL586,vector586,segments586,nearestGap586,canDash586,move586} from './Mechanics586.js';
import {make580,players580,random580 as rnd,event580 as emit,publicBase580} from '../arcade580/Common580.js';

// Positions are in the square floor's local [0,1] coordinates. 40 Hz authority.
export const WALLS585=Object.freeze({step:25,countdown:3000,speed:.68,radius:.015,wallInset:.012,thickness:.088,edge:.036,finishDelay:1600});
const C=WALLS585,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const makeWalls585=args=>({...make580('walls',args),rules585:3,walls:[],elapsed:0,wave:0,stage:'ready'});
export const signature585=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
export function difficulty585(elapsed){const t=elapsed/1000;return {level:t<18?1:t<38?2:t<65?3:4,warning:Math.max(850,1500-t*9),travel:Math.max(1750,3700-t*23),period:Math.max(1650,3950-t*31),gap:Math.max(.17,.39-t*.0027)};}
export function wallPosition585(w,at){const f=(at-w.launchAt)/w.travel;return w.dir===0||w.dir===2?-.10+f*1.20:1.10-f*1.20;}
export function movePoint585(p,target,seconds){const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),step=Math.min(d,C.speed*Math.max(0,seconds));return d?{x:clamp(p.x+dx/d*step,C.edge,1-C.edge),y:clamp(p.y+dy/d*step,C.edge,1-C.edge)}:{x:p.x,y:p.y};}
function segmentBox(a,b,x0,y0,x1,y1){let lo=0,hi=1;for(const [v,d,min,max]of [[a.x,b.x-a.x,x0,x1],[a.y,b.y-a.y,y0,y1]]){if(Math.abs(d)<1e-12){if(v<min||v>max)return false;}else{let t0=(min-v)/d,t1=(max-v)/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return false;}}return true;}
function segmentCircle(a,b,x,y,r){const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return (a.x+t*dx-x)**2+(a.y+t*dy-y)**2<=r*r;}
function sweptCircle(a,b,x0,y0,x1,y1,r){return segmentBox(a,b,x0-r,y0,x1+r,y1)||segmentBox(a,b,x0,y0-r,x1,y1+r)||[[x0,y0],[x0,y1],[x1,y0],[x1,y1]].some(([x,y])=>segmentCircle(a,b,x,y,r));}
export function hitsWall585(w,a,b,from,to){
 if(to<w.launchAt||from>w.launchAt+w.travel)return false;
 // Relative motion sweeps both the player and wall; fast drags cannot tunnel.
 const axis=w.dir<2?'y':'x',cross=axis==='y'?'x':'y',p0=wallPosition585(w,from),p1=wallPosition585(w,to),v0={x:a[cross],y:a[axis]-p0},v1={x:b[cross],y:b[axis]-p1},h=C.thickness/2-.010;
 return segments586(w).some(([lo,hi])=>hi-lo>C.wallInset*2&&sweptCircle(v0,v1,lo+C.wallInset,-h,hi-C.wallInset,h,C.radius));
}
function spawn(g){const d=difficulty585(g.elapsed),wave=++g.wave;let dir;if(wave===1)dir=0;else {const pool=[0,1,2,3].filter(n=>n!==g.lastDir);dir=pool[Math.floor(rnd(g)*pool.length)];}g.lastDir=dir;
 const pattern=wave>=4&&wave%5===4?'double':wave>=5&&wave%5===0?'chase':wave>=6&&wave%5===1?'cross':'single',gap=.22+rnd(g)*.56,paired=['chase','cross'].includes(pattern);g.pattern=pattern;
 const add=(direction,center,delay,part,openings)=>{const id=++g.wallSerial;g.walls.push({id,wave,part,pattern,dir:direction,gap:center,width:d.gap,openings,announcedAt:g.lastAt,launchAt:g.lastAt+d.warning+delay,travel:d.travel});};
 const openings=pattern==='double'?[{center:.26,width:Math.max(.17,d.gap*.64)},{center:.74,width:Math.max(.17,d.gap*.64)}]:null;add(dir,gap,0,1,openings);
 if(pattern==='chase')add(dir,clamp(gap+(gap<.5?.16:-.16),.22,.78),1100,2,null);
 if(pattern==='cross')add(dir<2?2+Math.floor(rnd(g)*2):Math.floor(rnd(g)*2),.22+rnd(g)*.56,1250,2,null);
 g.nextAt=g.lastAt+d.period+(paired?1050:0);emit(g,'warning',{wave,pattern,dir});
}
export function startWalls585(g,now,seed=585){if(g.phase!=='lobby')return false;g.seed=seed>>>0||585;players580(g);for(const p of g.players){delete p.score;const x=.32+(p.seat%2)*.36,y=.38+Math.floor(p.seat/2)*.28;Object.assign(p,{x,y,target:{x,y},control:'point',controlAt:now,steerX:0,steerY:0,facingX:0,facingY:-1,dashX:0,dashY:0,dashUntil:0,dashReadyAt:0,dashes:0,vx:0,vy:0,alive:true,outAt:null,outWave:null,lastSeq:0,survived:0,dodged:0,botAt:now,botError:.8+rnd(g)*.5});}Object.assign(g,{phase:'countdown',stage:'ready',lastAt:now,serverAt:now,startAt:now+C.countdown,phaseAt:now,elapsed:0,nextAt:now+C.countdown+800,wave:0,wallSerial:0,pattern:'single',walls:[],results:[],winnerIds:[],finishAt:null});g.revision++;return true;}
export function validWalls585(g,p,m,at=g.lastAt){if(!p?.alive||g.phase!=='play'||g.stage!=='run')return false;if(m.action==='stop')return true;if(m.action==='dash')return canDash586(g,p,at);const t=m.target;if(!t||!Number.isFinite(t.x)||!Number.isFinite(t.y))return false;if(m.action==='steer')return Math.abs(t.x)<=1&&Math.abs(t.y)<=1;return m.action==='move'&&t.x>=0&&t.x<=1&&t.y>=0&&t.y<=1;}
export function inputWalls585(g,p,m){if(!validWalls585(g,p,m))return false;p.lastSeq=Math.max(p.lastSeq,m.seq??0);
 if(m.action==='stop'){p.control='steer';p.steerX=0;p.steerY=0;p.controlAt=g.lastAt;p.target={x:p.x,y:p.y};return true;}
 if(m.action==='dash'){const len=Math.hypot(p.facingX,p.facingY)||1;p.dashX=p.facingX/len;p.dashY=p.facingY/len;p.dashUntil=g.lastAt+CONTROL586.dashMs;p.dashReadyAt=g.lastAt+CONTROL586.dashCooldown;p.dashes++;emit(g,'dash',{seat:p.seat,x:p.x,y:p.y,dx:p.dashX,dy:p.dashY});return true;}
 if(m.action==='steer'){const v=vector586(m.target.x,m.target.y);p.control='steer';p.controlAt=g.lastAt;p.steerX=v.x;p.steerY=v.y;if(Math.hypot(v.x,v.y)>.03){const d=Math.hypot(v.x,v.y);p.facingX=v.x/d;p.facingY=v.y/d;}return true;}
 p.control='point';p.target={x:clamp(m.target.x,C.edge,1-C.edge),y:clamp(m.target.y,C.edge,1-C.edge)};const dx=p.target.x-p.x,dy=p.target.y-p.y,d=Math.hypot(dx,dy);if(d>.001){p.facingX=dx/d;p.facingY=dy/d;}return true;
}
function bot(g,p){if(g.lastAt<p.botAt)return;const d=difficulty585(g.elapsed);p.botAt=g.lastAt+200+rnd(g)*370;p.control='point';p.target={x:p.x,y:p.y};
 // Same visible warnings as humans; no future spawns, instant travel or immunity.
 for(const axis of ['x','y']){const wall=g.walls.filter(w=>(w.dir<2?'x':'y')===axis&&g.lastAt>w.announcedAt+320*p.botError).map(w=>{const pos=wallPosition585(w,g.lastAt),ahead=w.dir===0||w.dir===2?p[w.dir<2?'y':'x']-pos:pos-p[w.dir<2?'y':'x'];return {w,ahead};}).filter(q=>q.ahead>-.065).sort((a,b)=>a.ahead-b.ahead)[0]?.w;
 if(wall){const opening=nearestGap586(wall,p[axis]);const error=(rnd(g)-.5)*(.028+(d.level-1)*.09)*p.botError;const lane=(p.seat-1.5)/2.1*Math.max(0,opening.width/2-C.radius-.025);p.target[axis]=clamp(opening.center+lane+error,C.edge,1-C.edge);}}
const dx=p.target.x-p.x,dy=p.target.y-p.y,dist=Math.hypot(dx,dy);if(dist>.001){p.facingX=dx/dist;p.facingY=dy/dist;}if(dist>.18&&canDash586(g,p)&&g.walls.some(w=>g.lastAt>w.launchAt)&&rnd(g)<.24)inputWalls585(g,p,{action:'dash'});
}
function decide(g){const alive=g.players.filter(p=>p.alive);if(alive.length>1)return;const latest=Math.max(...g.players.map(p=>p.outAt??-1));g.winnerIds=(alive.length?alive:g.players.filter(p=>p.outAt===latest)).map(p=>p.playerId);g.results=g.players.map(p=>({seat:p.seat,playerId:p.playerId,rank:p.alive?1:1+g.players.filter(q=>q.alive||(q.outAt??0)>(p.outAt??0)).length,survived:p.survived})).sort((a,b)=>a.rank-b.rank||a.seat-b.seat);g.stage='finish';g.finishAt=g.lastAt+C.finishDelay;g.phaseAt=g.lastAt;emit(g,'last',{winnerIds:g.winnerIds});}
export function advanceWalls585(g,now,inputs=new Map(),auto=new Set()){
 if(['lobby','result'].includes(g.phase))return false;
 if(now-g.lastAt>1000){const delta=now-g.lastAt-C.step;for(const k of ['lastAt','startAt','phaseAt','nextAt','finishAt'])if(Number.isFinite(g[k]))g[k]+=delta;for(const w of g.walls){w.announcedAt+=delta;w.launchAt+=delta;}for(const p of g.players){p.botAt+=delta;for(const k of ['controlAt','dashUntil','dashReadyAt'])if(p[k]>0)p[k]+=delta;if(p.outAt!=null)p.outAt+=delta;}for(const e of g.events)e.at+=delta;inputs.clear();}
 let changed=false;
 while(g.lastAt+C.step<=now&&g.phase!=='result'){const previous=g.lastAt;g.lastAt+=C.step;changed=true;
  if(g.phase==='countdown'){inputs.clear();if(g.lastAt<g.startAt)continue;g.phase='play';g.stage='run';g.phaseAt=g.lastAt;emit(g,'start');}
  if(g.stage==='finish'){inputs.clear();if(g.lastAt>=g.finishAt){g.phase='result';g.phaseAt=g.lastAt;emit(g,'finish');}continue;}
  g.elapsed=g.lastAt-g.startAt;if(g.lastAt>=g.nextAt)spawn(g);
  for(const p of g.players){const wasAuto=p.auto;p.auto=p.ai||auto.has(p.playerId);if(wasAuto&&!p.auto)inputWalls585(g,p,{action:'stop'});const list=inputs.get(p.playerId)??[];inputs.delete(p.playerId);if(!p.alive)continue;if(p.auto)bot(g,p);else {const future=[];for(const m of list){if(Number.isFinite(m.at)&&m.at>g.lastAt){future.push(m);continue;}if(m.round==null||m.round===g.round)inputWalls585(g,p,m);}if(future.length)inputs.set(p.playerId,future);}
   const before={x:p.x,y:p.y},after=move586(p,C.step/1000,g.lastAt,C.speed,C.edge),hit=g.walls.find(w=>hitsWall585(w,before,after,previous,g.lastAt));p.vx=(after.x-before.x)/(C.step/1000);p.vy=(after.y-before.y)/(C.step/1000);Object.assign(p,after);p.survived=g.elapsed;
   if(hit){p.alive=false;p.outAt=g.lastAt;p.outWave=hit.wave??hit.id;p.outDir=hit.dir;p.vx=0;p.vy=0;p.target={x:p.x,y:p.y};emit(g,'out',{seat:p.seat,wall:hit.id,dir:hit.dir,x:p.x,y:p.y});}
  }
  const cleared=g.walls.filter(w=>g.lastAt>w.launchAt+w.travel);for(const w of cleared){for(const p of g.players)if(p.alive)p.dodged++;emit(g,'clear',{wall:w.id});}g.walls=g.walls.filter(w=>g.lastAt<=w.launchAt+w.travel);decide(g);
 }
 g.serverAt=g.lastAt;g.updatedAt=now;if(changed)g.revision++;return changed;
}
export function publicWalls585(g,selfId){return {...publicBase580(g),rules585:g.rules585,stage:g.stage,elapsed:g.elapsed,wave:g.wave,pattern:g.pattern,finishAt:g.finishAt,walls:g.walls.map(w=>({...w,openings:w.openings?.map(o=>({...o}))??null})),players:g.players.map(({botAt,botError,inputSeq563,target,...p})=>({...p,target:p.playerId===selfId?{...target}:null,lastSeq:p.playerId===selfId?Math.max(p.lastSeq,inputSeq563??0):0}))};}
