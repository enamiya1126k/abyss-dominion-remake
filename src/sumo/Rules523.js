import {freezeColors501} from '../party/GameColors501.js';
import {think535} from './Brains535.js';
export const SUMO523=Object.freeze({radius:9,duration:150000,countdown:3000,step:1000/60,charge:1400,cooldown:850,finale:4600,maxPower:48,magnetDuration:8000,magnetRadius:3.3,warning:6000});
export const clamp523=(v,a,b)=>Math.max(a,Math.min(b,v));
const len=(x,y)=>Math.hypot(x,y),unit=(x,y)=>{const d=len(x,y);return d>.001?{x:x/d,y:y/d}:{x:0,y:1}};
export const body523=p=>.52*(1+.5*clamp523(p.power/SUMO523.maxPower,0,1));
export const mass523=p=>1+clamp523(p.power,0,SUMO523.maxPower)*.014;
export const level535=p=>1+Math.floor(clamp523(p.power??0,0,SUMO523.maxPower)/4);
export const chargeCap535=p=>SUMO523.charge+(level535(p)-1)*160;
export const chargeRatio535=p=>clamp523((p.charge??0)/chargeCap535(p),0,1);
export const might535=p=>{const lv=level535(p)-1;return 1+.16*lv+.013*lv*lv};
export const dashSpeed535=(p,q=chargeRatio535(p))=>7+5*q+(level535(p)-1)*.19;
export const SHRINKS527=Object.freeze([40000,75000,105000,130000]);
export const RADII527=Object.freeze([9,7.65,6.3,4.95,3.6]);
export const radius523=t=>RADII527[SHRINKS527.filter(v=>v<=t+.001).length];
export const nextShrink523=t=>SHRINKS527.find(v=>v>t+.001)??Infinity;
export const dashDistance527=p=>{const q=chargeRatio535(p);return dashSpeed535(p,q)*(.28+q*.12)};
const emit=(g,type,data={})=>{g.events.push({id:++g.eventSeq,type,at:g.elapsed,...data});if(g.events.length>40)g.events.shift()};
const random=g=>{let x=g.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.seed=x>>>0;return g.seed/4294967296};
export function makeSumo523({id,code,partyId,hostId,members,now=0}){return{id,code,game:'sumo',rules523:3,partyId462:partyId,hostId,members:members.map(m=>({...m})),phase:'lobby',revision:0,createdAt:now,updatedAt:now,players:[],crystals:[],events:[],eventSeq:0}}
function crystal(g,initial=false){if(g.crystals.length>=34)return;const a=random(g)*Math.PI*2,d=Math.sqrt(random(g))*(g.radius-.9);g.crystals.push({id:++g.crystalSeq,x:Math.cos(a)*d,y:Math.sin(a)*d,value:random(g)>.87?3:1,born:initial?-1000:g.elapsed})}
export function startSumo523(g,now,seed=523){if(g.phase!=='lobby')return false;g.seed=seed>>>0||523;while(g.members.length<4){const i=g.members.length;g.members.push({playerId:`AI-${g.id}-${i}`,name:`AI ${i+1}`,ai:true,choice:{speciesId:['slime','wolf','goblin','skeleton'][i]}})}freezeColors501(g.members,[],g.aiColors500??{});
 g.players=g.members.map((m,seat)=>{const a=seat*Math.PI/2+Math.PI/4,x=Math.cos(a)*5,y=Math.sin(a)*5;return{playerId:m.playerId,name:m.name,seat,speciesId:m.choice.speciesId,color499:m.color499,ai:!!m.ai,auto:!!m.ai,x,y,vx:0,vy:0,kx:0,ky:0,fx:-x/5,fy:-y/5,power:0,alive:true,charging:false,charge:0,attackUntil:0,coolUntil:0,stunUntil:0,lastSeq:0,hits:0,kos:0,collected:0,attackSerial:0,hitIds:[],braceUsed:false,braceUntil:0,magnetUntil:0,anchor535:0,blocks535:0,aiStyle535:(seat+(seed%4))%4}});
 Object.assign(g,{rules523:3,phase:'countdown',startAt:now+3000,lastAt:now,elapsed:0,radius:9,crystals:[],crystalSeq:0,nextCrystal:700,pickups:[],pickupSeq:0,nextMagnet:14000,nextBrace535:22000,events:[],eventSeq:0});for(let i=0;i<24;i++)crystal(g,true);g.revision++;return true;
}
export function release523(g,p){if(!p.charging)return;p.charging=false;const q=chargeRatio535(p);p.charge=0;if(q<.085||g.elapsed<p.coolUntil)return;
 p.stunUntil=g.elapsed;p.attackPower=q;p.attackMight535=might535(p);p.attackSpeed535=dashSpeed535(p,q);p.attackUntil=g.elapsed+280+q*120;p.attackSerial++;p.hitIds=[];p.coolUntil=p.attackUntil+SUMO523.cooldown;p.dx=p.fx;p.dy=p.fy;emit(g,'dash',{playerId:p.playerId,x:p.x,y:p.y,dx:p.dx,dy:p.dy,power:q,level:level535(p)});
}
export function motion523(g,p,input={},dt=1/60){if(!p.alive)return;let x=Number(input.x)||0,y=Number(input.y)||0,d=len(x,y);if(d>1){x/=d;y/=d}
 if(input.mode==='target'&&Number.isFinite(input.tx)&&Number.isFinite(input.ty)){
 const dx=input.tx-p.x,dy=input.ty-p.y,dist=len(dx,dy),stop=.09;
 if(dist>stop){const travel=3.8/(1+p.power*.005)*(p.charging?.42:1)*dt;const n=unit(dx,dy),f=Math.min(1,(dist-stop)/Math.max(.001,travel));x=n.x*f;y=n.y*f}else{x=0;y=0}
 }
 if(g.elapsed>=p.attackUntil&&g.elapsed>=p.stunUntil&&len(x,y)>.05){const n=unit(x,y);p.fx=n.x;p.fy=n.y}
 if(input.cancel){p.charging=false;p.charge=0}else{
  if(input.press&&g.elapsed>=p.coolUntil&&g.elapsed>=p.stunUntil&&!p.charging&&g.elapsed>=p.attackUntil){p.charging=true;p.charge=0}
  if(p.charging){const before=p.charge,cap=chargeCap535(p);p.charge=Math.min(cap,p.charge+dt*1000*(1+(level535(p)-1)*.10));if(before<cap&&p.charge>=cap)emit(g,'chargeFull',{playerId:p.playerId,x:p.x,y:p.y,level:level535(p)});if(input.release)release523(g,p)}
 }
 const attacking=g.elapsed<p.attackUntil,stunned=g.elapsed<p.stunUntil;
 if(!attacking&&!stunned&&len(x,y)>.05){const facing=unit(x,y);p.fx=facing.x;p.fy=facing.y}
 const speed=3.8/(1+p.power*.005)*(p.charging?.42:1);
 p.vx=attacking?p.dx*(p.attackSpeed535??dashSpeed535(p,p.attackPower)):stunned?0:x*speed;
 p.vy=attacking?p.dy*(p.attackSpeed535??dashSpeed535(p,p.attackPower)):stunned?0:y*speed;
 p.x+=(p.vx+p.kx)*dt;p.y+=(p.vy+p.ky)*dt;const drag=Math.exp(-4.0*dt);p.kx*=drag;p.ky*=drag;
}
function hit(g,a,b,nx,ny,impulses){if(g.elapsed>=a.attackUntil||a.hitIds.includes(b.playerId))return;a.hitIds.push(b.playerId);a.hits++;
 if(b.anchor535>0){
  b.anchor535=0;b.blocks535=(b.blocks535??0)+1;b.anchorFlash535=g.elapsed+700;
  // Stop the blocked dash itself: its body must not keep shoving the defender off the lip.
  a.attackUntil=g.elapsed;const before=impulses[b.seat];
  if(len(before.startX,before.startY)<=g.radius+body523(b)*.22){b.x=before.startX;b.y=before.startY;const gap=body523(a)+body523(b);a.x=b.x-nx*gap;a.y=b.y-ny*gap}
  emit(g,'guardBreak',{playerId:b.playerId,attacker:a.playerId,x:b.x,y:b.y,dx:nx,dy:ny});return;
 }
 const front=b.fx*(-nx)+b.fy*(-ny),side=front<.3?1.2:1,guard=b.charging&&front>.6?.82:1;
 const opening=g.elapsed<30000?.48:g.elapsed<55000?.74:1;const force=(5+12*a.attackPower)*(a.attackMight535??might535(a))*side*guard*opening/mass523(b);
 impulses[b.seat].x+=nx*force;impulses[b.seat].y+=ny*force;impulses[b.seat].stun=Math.max(impulses[b.seat].stun,180+a.attackPower*230);b.lastHit=a.playerId;b.lastHitAt=g.elapsed;
 emit(g,'hit',{playerId:a.playerId,target:b.playerId,x:(a.x+b.x)/2,y:(a.y+b.y)/2,dx:nx,dy:ny,power:a.attackPower,side:side>1});
}
export function collide523(g){const impulses=g.players.map(p=>({x:0,y:0,stun:0,startX:p.x,startY:p.y}));for(let i=0;i<g.players.length;i++)for(let j=i+1;j<g.players.length;j++){const a=g.players[i],b=g.players[j];if(!a.alive||!b.alive)continue;const dx=b.x-a.x,dy=b.y-a.y,dist=len(dx,dy),reach=body523(a)+body523(b);if(dist>=reach)continue;
 const n=dist>.0001?{x:dx/dist,y:dy/dist}:{x:1,y:0},over=reach-dist,ma=mass523(a),mb=mass523(b);
 a.x-=n.x*over*mb/(ma+mb);a.y-=n.y*over*mb/(ma+mb);b.x+=n.x*over*ma/(ma+mb);b.y+=n.y*over*ma/(ma+mb);
 hit(g,a,b,n.x,n.y,impulses);hit(g,b,a,-n.x,-n.y,impulses);
 }
 for(const p of g.players){const v=impulses[p.seat];if(!v.stun)continue;p.kx+=v.x;p.ky+=v.y;p.stunUntil=g.elapsed+v.stun;p.attackUntil=0}
}
function out(g,p){p.alive=false;p.outAt=g.elapsed;p.outX=p.x;p.outY=p.y;p.outVX=p.vx+p.kx;p.outVY=p.vy+p.ky;const killer=g.players.find(v=>v.playerId===p.lastHit&&g.elapsed-p.lastHitAt<2500);if(killer)killer.kos++;emit(g,'out',{playerId:p.playerId,killer:killer?.playerId,x:p.x,y:p.y,vx:p.outVX,vy:p.outVY});p.charging=false;p.charge=0;}
export function brace527(g,p,collapsed=false){
 const d=len(p.x,p.y),r=body523(p);
 if(collapsed||p.braceUsed||!Number.isFinite(p.lastHitAt)||g.elapsed-p.lastHitAt>1600||d>g.radius+r+1)return false;
 const n=unit(p.x,p.y);p.braceUsed=true;p.braceUntil=g.elapsed+850;p.x=n.x*(g.radius-r*.55);p.y=n.y*(g.radius-r*.55);
 p.kx=-n.x*1.8;p.ky=-n.y*1.8;p.vx=0;p.vy=0;p.attackUntil=0;p.stunUntil=g.elapsed+240;
 emit(g,'brace',{playerId:p.playerId,x:p.x,y:p.y});return true;
}
function pickup535(g,type){if((g.pickups??=[]).some(v=>v.type===type)||g.pickups.length>=2)return;const safe=nextShrink523(g.elapsed)-g.elapsed<SUMO523.warning?radius523(nextShrink523(g.elapsed)):g.radius,a=random(g)*Math.PI*2,d=(.25+random(g)*.48)*safe;g.pickups.push({id:++g.pickupSeq,x:Math.cos(a)*d,y:Math.sin(a)*d,born:g.elapsed,expires:g.elapsed+18000,type});emit(g,type==='magnet'?'magnetSpawn':'anchorSpawn',{x:Math.cos(a)*d,y:Math.sin(a)*d})}
export function attract527(g,dt){
 // Move each crystal once per tick, towards the closest active magnet. No seat-order stealing.
 for(const gem of g.crystals){const candidates=g.players.filter(p=>p.alive&&p.magnetUntil>g.elapsed).map(p=>({p,d:len(p.x-gem.x,p.y-gem.y)})).filter(v=>v.d<SUMO523.magnetRadius).sort((a,b)=>a.d-b.d||String(a.p.playerId).localeCompare(String(b.p.playerId)));const v=candidates[0];if(!v)continue;const n=unit(v.p.x-gem.x,v.p.y-gem.y),speed=Math.min(v.d,dt*(3.6+(SUMO523.magnetRadius-v.d)*3)),swirl=Math.min(.5,v.d*.2)*dt;gem.x+=n.x*speed-n.y*swirl;gem.y+=n.y*speed+n.x*swirl;gem.attracted=v.p.playerId}
}
export function migrateSumo527(g){
 if(g.rules523===3)return false;
 if(g.rules523===2){for(const p of g.players??[]){p.charge=(p.charge??0)/1400*chargeCap535(p);p.anchor535=0;p.blocks535=0;p.aiStyle535=(p.seat+((g.seed??0)%4))%4;delete p.brain535}g.nextBrace535=(g.elapsed??0)+8000;g.rules523=3;return true}
 const oldT=[0,45000,60000,75000,85000,90000],newT=[0,40000,75000,105000,130000,150000],t=g.elapsed??0;let i=0;while(i<4&&t>=oldT[i+1])i++;
 const elapsed=newT[i]+(newT[i+1]-newT[i])*clamp523((t-oldT[i])/(oldT[i+1]-oldT[i]),0,1),shift=elapsed-t,rad=radius523(elapsed),factor=rad/Math.max(.2,g.radius??9);
 for(const p of g.players??[]){p.x*=factor;p.y*=factor;p.power=Math.min(48,(p.power??0)*2);p.braceUsed=false;p.braceUntil=0;p.magnetUntil=0;for(const k of['attackUntil','coolUntil','stunUntil','outAt','lastHitAt'])if(Number.isFinite(p[k])&&p[k]>0)p[k]+=shift;p.charging=false;p.charge=0}
 for(const v of g.crystals??[]){v.x*=factor;v.y*=factor}
 Object.assign(g,{rules523:2,elapsed,radius:rad,startAt:(g.startAt??0)-shift,pickups:[],pickupSeq:0,nextMagnet:elapsed+10000,nextCrystal:elapsed+700,events:[]});migrateSumo527(g);return true;
}
export function finishSumo523(g,reason='last'){if(g.phase==='result')return;const live=g.players.filter(p=>p.alive);let winners=[];
 if(live.length===1)winners=[live[0].playerId];else if(live.length>1){const best=Math.min(...live.map(p=>len(p.x,p.y)));winners=live.filter(p=>Math.abs(len(p.x,p.y)-best)<.001).map(p=>p.playerId)}
 const order=[...g.players].sort((a,b)=>Number(winners.includes(b.playerId))-Number(winners.includes(a.playerId))||Number(b.alive)-Number(a.alive)||(b.outAt??g.elapsed)-(a.outAt??g.elapsed)||len(a.x,a.y)-len(b.x,b.y));
 g.results=order.map((p,i)=>({playerId:p.playerId,rank:winners.includes(p.playerId)?1:1+order.filter(q=>winners.includes(q.playerId)||q.alive&&!p.alive||!q.alive&&!p.alive&&q.outAt>p.outAt).length,winner:winners.includes(p.playerId),power:p.power,hits:p.hits,kos:p.kos,collected:p.collected,blocks535:p.blocks535??0,level535:level535(p)}));
 if(!winners.length){g.results=g.results.map(v=>({...v,rank:1+g.players.filter(q=>q.outAt>(g.players.find(p=>p.playerId===v.playerId).outAt)).length}))}
 Object.assign(g,{phase:'result',winnerIds:winners,reason:winners.length===0?'draw':reason,phaseAt:g.lastAt,finaleUntil:g.lastAt+SUMO523.finale});g.revision++;emit(g,'finish',{winners});
}
export const bot523=(g,p)=>think535(g,p,{level:level535,ratio:chargeRatio535,next:nextShrink523,radius:radius523,warning:SUMO523.warning,body:body523,dash:dashDistance527});
export function advanceSumo523(g,now,inputs=new Map(),autoIds=new Set()){
 if(!['play','countdown'].includes(g.phase))return false;migrateSumo527(g);if(now<g.startAt){g.lastAt=now;return false}if(g.phase==='countdown'){g.phase='play';g.lastAt=g.startAt;g.revision++}
 if(now-g.lastAt>500){const delay=now-g.lastAt-100;g.startAt+=delay;g.lastAt+=delay}
 let steps=0;while(g.lastAt+SUMO523.step<=now+.001&&g.phase==='play'&&steps++<30){g.lastAt+=SUMO523.step;g.elapsed=g.lastAt-g.startAt;const old=g.radius;g.radius=radius523(g.elapsed);const collapsed=old-g.radius>.3;if(collapsed)emit(g,'collapse',{from:old,to:g.radius});
  for(const p of g.players){p.auto=p.ai||autoIds.has(p.playerId);const input=p.auto?bot523(g,p):inputs.get(p.playerId)??{};motion523(g,p,input);if(!p.auto){input.press=false;input.release=false;input.cancel=false}}
  collide523(g);g.crystals=g.crystals.filter(v=>len(v.x,v.y)<g.radius-.25);g.pickups=(g.pickups??[]).filter(v=>v.expires>g.elapsed&&len(v.x,v.y)<g.radius-.25);attract527(g,1/60);
  for(const p of g.players){if(!p.alive)continue;if(len(p.x,p.y)>g.radius+body523(p)*.22){if(!brace527(g,p,collapsed)){out(g,p);continue}}
   for(let i=(g.pickups??[]).length-1;i>=0;i--){const v=g.pickups[i];if(len(p.x-v.x,p.y-v.y)<body523(p)+.4){if(v.type==='brace'&&p.anchor535)continue;g.pickups.splice(i,1);if(v.type==='brace'){p.anchor535=1;emit(g,'anchor',{playerId:p.playerId,x:p.x,y:p.y})}else{p.magnetUntil=g.elapsed+SUMO523.magnetDuration;emit(g,'magnet',{playerId:p.playerId,x:p.x,y:p.y})}}}
   for(let i=g.crystals.length-1;i>=0;i--){const v=g.crystals[i];if(len(p.x-v.x,p.y-v.y)<body523(p)+.3){g.crystals.splice(i,1);const old=p.power;p.collected+=v.value;p.power=Math.min(SUMO523.maxPower,p.power+v.value);emit(g,Math.floor(old/4)!==Math.floor(p.power/4)?'grow':'collect',{playerId:p.playerId,x:v.x,y:v.y,power:p.power})}}
  }
  g.pickups=(g.pickups??[]).filter(v=>v.expires>g.elapsed&&len(v.x,v.y)<g.radius-.25);
  if(g.elapsed>=(g.nextMagnet??14000)){pickup535(g,'magnet');g.nextMagnet=g.elapsed+22000+random(g)*6000}
  if(g.elapsed>=(g.nextBrace535??22000)){pickup535(g,'brace');g.nextBrace535=g.elapsed+28000+random(g)*8000}
  g.crystals=g.crystals.filter(v=>len(v.x,v.y)<g.radius-.25);
  if(g.players.filter(p=>p.alive).length<=1)finishSumo523(g);else if(g.elapsed>=SUMO523.duration)finishSumo523(g,'center');
  if(g.phase==='play'&&g.elapsed>=g.nextCrystal){crystal(g);g.nextCrystal=g.elapsed+700}
 }
 g.updatedAt=now;return steps>0;
}
export function publicSumo523(g){return{id:g.id,code:g.code,game:'sumo',rules523:3,partyId462:g.partyId462,hostId:g.hostId,phase:g.phase,revision:g.revision,members:g.members.map(({playerId,name,choice,ai,color499,departed})=>({playerId,name,choice,ai,color499,departed})),players:g.players.map(({hitIds,brain535,aiStyle535,aiRest535,...p})=>({...p})),crystals:g.crystals.map(v=>({...v})),pickups:(g.pickups??[]).map(v=>({...v})),events:g.events.map(v=>({...v})),serverAt:g.lastAt,startAt:g.startAt,elapsed:g.elapsed,radius:g.radius,winnerIds:g.winnerIds,reason:g.reason,results:g.results,finaleUntil:g.finaleUntil}}
export const signature523=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
