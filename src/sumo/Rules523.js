import {freezeColors501} from '../party/GameColors501.js';
export const SUMO523=Object.freeze({radius:9,duration:90000,countdown:3000,step:1000/60,charge:1400,cooldown:850,finale:4600,maxPower:24});
export const clamp523=(v,a,b)=>Math.max(a,Math.min(b,v));
const len=(x,y)=>Math.hypot(x,y),unit=(x,y)=>{const d=len(x,y);return d>.001?{x:x/d,y:y/d}:{x:0,y:1}};
export const body523=p=>.46+Math.min(SUMO523.maxPower,p.power)*.023;
export const mass523=p=>1+p.power*.045;
export const radius523=t=>t<45000?9:t<60000?7.5:t<75000?6:t<85000?4.5:Math.max(.2,3*(90000-t)/5000);
export const nextShrink523=t=>[45000,60000,75000,85000].find(v=>v>t)??90000;
const emit=(g,type,data={})=>{g.events.push({id:++g.eventSeq,type,at:g.elapsed,...data});if(g.events.length>40)g.events.shift()};
const random=g=>{let x=g.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.seed=x>>>0;return g.seed/4294967296};
export function makeSumo523({id,code,partyId,hostId,members,now=0}){return{id,code,game:'sumo',rules523:1,partyId462:partyId,hostId,members:members.map(m=>({...m})),phase:'lobby',revision:0,createdAt:now,updatedAt:now,players:[],crystals:[],events:[],eventSeq:0}}
function crystal(g,initial=false){if(g.crystals.length>=26)return;const a=random(g)*Math.PI*2,d=Math.sqrt(random(g))*(g.radius-1.2);g.crystals.push({id:++g.crystalSeq,x:Math.cos(a)*d,y:Math.sin(a)*d,value:random(g)>.87?3:1,born:initial?-1000:g.elapsed})}
export function startSumo523(g,now,seed=523){if(g.phase!=='lobby')return false;g.seed=seed>>>0||523;while(g.members.length<4){const i=g.members.length;g.members.push({playerId:`AI-${g.id}-${i}`,name:`AI ${i+1}`,ai:true,choice:{speciesId:['slime','wolf','goblin','skeleton'][i]}})}freezeColors501(g.members,[],g.aiColors500??{});
 g.players=g.members.map((m,seat)=>{const a=seat*Math.PI/2+Math.PI/4,x=Math.cos(a)*5,y=Math.sin(a)*5;return{playerId:m.playerId,name:m.name,seat,speciesId:m.choice.speciesId,color499:m.color499,ai:!!m.ai,auto:!!m.ai,x,y,vx:0,vy:0,kx:0,ky:0,fx:-x/5,fy:-y/5,power:0,alive:true,charging:false,charge:0,attackUntil:0,coolUntil:0,stunUntil:0,lastSeq:0,hits:0,kos:0,collected:0,attackSerial:0,hitIds:[]}});
 Object.assign(g,{phase:'countdown',startAt:now+3000,lastAt:now,elapsed:0,radius:9,crystals:[],crystalSeq:0,nextCrystal:900,events:[],eventSeq:0});for(let i=0;i<18;i++)crystal(g,true);g.revision++;return true;
}
export function release523(g,p){if(!p.charging)return;p.charging=false;const q=clamp523(p.charge/1400,0,1);p.charge=0;if(q<.085||g.elapsed<p.coolUntil||g.elapsed<p.stunUntil)return;
 p.attackPower=q;p.attackUntil=g.elapsed+280+q*120;p.attackSerial++;p.hitIds=[];p.coolUntil=p.attackUntil+SUMO523.cooldown;p.dx=p.fx;p.dy=p.fy;emit(g,'dash',{playerId:p.playerId,x:p.x,y:p.y,dx:p.dx,dy:p.dy,power:q});
}
export function motion523(g,p,input={},dt=1/60){if(!p.alive)return;let x=Number(input.x)||0,y=Number(input.y)||0,d=len(x,y);if(d>1){x/=d;y/=d}
 if(input.cancel){p.charging=false;p.charge=0}else{
  if(input.press&&g.elapsed>=p.coolUntil&&g.elapsed>=p.stunUntil&&!p.charging&&g.elapsed>=p.attackUntil){p.charging=true;p.charge=0}
  if(p.charging){p.charge=Math.min(1400,p.charge+dt*1000);if(input.release)release523(g,p)}
 }
 const attacking=g.elapsed<p.attackUntil,stunned=g.elapsed<p.stunUntil;
 if(!attacking&&!stunned&&len(x,y)>.05){const facing=unit(x,y);p.fx=facing.x;p.fy=facing.y}
 const speed=3.8/(1+p.power*.012)*(p.charging?.42:1);
 p.vx=attacking?p.dx*(7+5*p.attackPower+p.power*.08):stunned?0:x*speed;
 p.vy=attacking?p.dy*(7+5*p.attackPower+p.power*.08):stunned?0:y*speed;
 p.x+=(p.vx+p.kx)*dt;p.y+=(p.vy+p.ky)*dt;const drag=Math.exp(-3.5*dt);p.kx*=drag;p.ky*=drag;
}
function hit(g,a,b,nx,ny,impulses){if(g.elapsed>=a.attackUntil||a.hitIds.includes(b.playerId))return;a.hitIds.push(b.playerId);a.hits++;
 const front=b.fx*(-nx)+b.fy*(-ny),side=front<.3?1.2:1,guard=b.charging&&front>.6?.82:1;
 const force=(5+10*a.attackPower+a.power*.2)*side*guard/mass523(b);
 impulses[b.seat].x+=nx*force;impulses[b.seat].y+=ny*force;impulses[b.seat].stun=Math.max(impulses[b.seat].stun,180+a.attackPower*230);b.lastHit=a.playerId;b.lastHitAt=g.elapsed;
 emit(g,'hit',{playerId:a.playerId,target:b.playerId,x:(a.x+b.x)/2,y:(a.y+b.y)/2,dx:nx,dy:ny,power:a.attackPower,side:side>1});
}
export function collide523(g){const impulses=g.players.map(()=>({x:0,y:0,stun:0}));for(let i=0;i<g.players.length;i++)for(let j=i+1;j<g.players.length;j++){const a=g.players[i],b=g.players[j];if(!a.alive||!b.alive)continue;const dx=b.x-a.x,dy=b.y-a.y,dist=len(dx,dy),reach=body523(a)+body523(b);if(dist>=reach)continue;
 const n=dist>.0001?{x:dx/dist,y:dy/dist}:{x:1,y:0},over=reach-dist,ma=mass523(a),mb=mass523(b);
 a.x-=n.x*over*mb/(ma+mb);a.y-=n.y*over*mb/(ma+mb);b.x+=n.x*over*ma/(ma+mb);b.y+=n.y*over*ma/(ma+mb);
 hit(g,a,b,n.x,n.y,impulses);hit(g,b,a,-n.x,-n.y,impulses);
 }
 for(const p of g.players){const v=impulses[p.seat];if(!v.stun)continue;p.kx+=v.x;p.ky+=v.y;p.stunUntil=g.elapsed+v.stun;p.charging=false;p.charge=0;p.attackUntil=0}
}
function out(g,p){p.alive=false;p.outAt=g.elapsed;p.outX=p.x;p.outY=p.y;p.outVX=p.vx+p.kx;p.outVY=p.vy+p.ky;const killer=g.players.find(v=>v.playerId===p.lastHit&&g.elapsed-p.lastHitAt<2500);if(killer)killer.kos++;emit(g,'out',{playerId:p.playerId,killer:killer?.playerId,x:p.x,y:p.y,vx:p.outVX,vy:p.outVY});p.charging=false;p.charge=0;}
export function finishSumo523(g,reason='last'){if(g.phase==='result')return;const live=g.players.filter(p=>p.alive);let winners=[];
 if(live.length===1)winners=[live[0].playerId];else if(live.length>1){const best=Math.min(...live.map(p=>len(p.x,p.y)));winners=live.filter(p=>Math.abs(len(p.x,p.y)-best)<.001).map(p=>p.playerId)}
 const order=[...g.players].sort((a,b)=>Number(winners.includes(b.playerId))-Number(winners.includes(a.playerId))||Number(b.alive)-Number(a.alive)||(b.outAt??g.elapsed)-(a.outAt??g.elapsed)||len(a.x,a.y)-len(b.x,b.y));
 g.results=order.map((p,i)=>({playerId:p.playerId,rank:winners.includes(p.playerId)?1:1+order.filter(q=>winners.includes(q.playerId)||q.alive&&!p.alive||!q.alive&&!p.alive&&q.outAt>p.outAt).length,winner:winners.includes(p.playerId),power:p.power,hits:p.hits,kos:p.kos,collected:p.collected}));
 if(!winners.length){g.results=g.results.map(v=>({...v,rank:1+g.players.filter(q=>q.outAt>(g.players.find(p=>p.playerId===v.playerId).outAt)).length}))}
 Object.assign(g,{phase:'result',winnerIds:winners,reason:winners.length===0?'draw':reason,phaseAt:g.lastAt,finaleUntil:g.lastAt+SUMO523.finale});g.revision++;emit(g,'finish',{winners});
}
const brains=new WeakMap();
export function bot523(g,p){let group=brains.get(g);if(!group){group=new Map();brains.set(g,group)}let b=group.get(p.playerId);if(!b||g.elapsed>=b.until){
 const enemies=g.players.filter(v=>v.alive&&v!==p),near=[...enemies].sort((a,b)=>len(a.x-p.x,a.y-p.y)-len(b.x-p.x,b.y-p.y))[0],danger=enemies.find(v=>len(v.x-p.x,v.y-p.y)<3.5&&(v.charging||v.attackUntil>g.elapsed)),distance=len(p.x,p.y),limit=g.radius-1.25;
 let tx=0,ty=0,attack=false;
 if(distance>limit){tx=-p.x;ty=-p.y}
 else if(danger&&!p.charging&&g.elapsed<p.coolUntil){tx=-(danger.fy);ty=danger.fx;const sign=(tx*p.x+ty*p.y)>0?-1:1;tx*=sign;ty*=sign}
 else if(near&&len(near.x-p.x,near.y-p.y)<3.4&&g.elapsed>=p.coolUntil){tx=near.x+near.vx*.15-p.x;ty=near.y+near.vy*.15-p.y;attack=true}
 else{const gems=g.crystals.filter(v=>len(v.x,v.y)<limit).sort((a,b)=>len(a.x-p.x,a.y-p.y)/a.value-len(b.x-p.x,b.y-p.y)/b.value);const target=gems[0]??near;if(target){tx=target.x-p.x;ty=target.y-p.y}}
 const v=unit(tx,ty);b={...v,attack,until:g.elapsed+150};group.set(p.playerId,b);
 }
 const dangerEdge=len(p.x,p.y)>g.radius-.8;
 return{x:b.x,y:b.y,press:b.attack&&!p.charging,release:p.charging&&(p.charge>=800+(p.attackSerial%3)*300||!b.attack),cancel:p.charging&&dangerEdge};
}
export function advanceSumo523(g,now,inputs=new Map(),autoIds=new Set()){
 if(!['play','countdown'].includes(g.phase))return false;if(now<g.startAt){g.lastAt=now;return false}if(g.phase==='countdown'){g.phase='play';g.lastAt=g.startAt;g.revision++}
 if(now-g.lastAt>500){const delay=now-g.lastAt-100;g.startAt+=delay;g.lastAt+=delay}
 let steps=0;while(g.lastAt+SUMO523.step<=now+.001&&g.phase==='play'&&steps++<30){g.lastAt+=SUMO523.step;g.elapsed=g.lastAt-g.startAt;const old=g.radius;g.radius=radius523(g.elapsed);if(old-g.radius>.3)emit(g,'collapse',{from:old,to:g.radius});
  for(const p of g.players){p.auto=p.ai||autoIds.has(p.playerId);const input=p.auto?bot523(g,p):inputs.get(p.playerId)??{};motion523(g,p,input);if(!p.auto){input.press=false;input.release=false;input.cancel=false}}
  collide523(g);
  for(const p of g.players){if(!p.alive)continue;if(len(p.x,p.y)>g.radius+body523(p)*.22){out(g,p);continue}
   for(let i=g.crystals.length-1;i>=0;i--){const v=g.crystals[i];if(len(p.x-v.x,p.y-v.y)<body523(p)+.3){g.crystals.splice(i,1);const old=p.power;p.collected+=v.value;p.power=Math.min(24,p.power+v.value);emit(g,Math.floor(old/3)!==Math.floor(p.power/3)?'grow':'collect',{playerId:p.playerId,x:v.x,y:v.y,power:p.power})}}
  }
  g.crystals=g.crystals.filter(v=>len(v.x,v.y)<g.radius-.25);
  if(g.players.filter(p=>p.alive).length<=1)finishSumo523(g);else if(g.elapsed>=90000)finishSumo523(g,'center');
  if(g.phase==='play'&&g.elapsed>=g.nextCrystal){crystal(g);g.nextCrystal=g.elapsed+900}
 }
 g.updatedAt=now;return steps>0;
}
export function publicSumo523(g){return{id:g.id,code:g.code,game:'sumo',rules523:1,partyId462:g.partyId462,hostId:g.hostId,phase:g.phase,revision:g.revision,members:g.members.map(({playerId,name,choice,ai,color499,departed})=>({playerId,name,choice,ai,color499,departed})),players:g.players.map(({hitIds,...p})=>({...p})),crystals:g.crystals.map(v=>({...v})),events:g.events.map(v=>({...v})),serverAt:g.lastAt,startAt:g.startAt,elapsed:g.elapsed,radius:g.radius,winnerIds:g.winnerIds,reason:g.reason,results:g.results,finaleUntil:g.finaleUntil}}
export const signature523=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
