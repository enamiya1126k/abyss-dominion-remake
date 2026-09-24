// Shared, deterministic objectives. Exact hiding positions never enter hunter hints.
import {nearest537,line537} from './Map537.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const emit=(g,type,extra={})=>{g.events.push({id:++g.eventSeq,type,at:g.elapsed,...extra});g.events=g.events.slice(-32)};
export function setupHeist541(g){
 const pick=r=>{const q=nearest537(g.map,{x:r.cx,y:r.cy});return{x:q.x,y:q.y}};
 g.heist541={seals:[1,2,7].map((index,id)=>({id,...pick(g.map.rooms[index]),name:g.map.rooms[index].name,progress:0,done:false})),exit:{...nearest537(g.map,{x:2400,y:3950})},cage:{...nearest537(g.map,{x:1300,y:3500})},rescues:0};
 g.decoys541=[];for(const p of g.players)Object.assign(p,{abilityReady541:0,rescued541:false,rescueProgress541:0,seals541:0,escaped541:false,interacting541:null});
}
export function ability541(g,p,token){
 if(g.phase!=='play'||!p.alive||g.elapsed<(p.abilityReady541??0))return false;
 p.abilityReady541=g.elapsed+(p.hunter?20000:18000);
 if(p.hunter){const nearest=Math.min(Infinity,...g.players.filter(x=>!x.hunter&&x.alive).map(x=>dist(x,p)));p.sense541={until:g.elapsed+3500,level:nearest<450?2:nearest<1000?1:0};emit(g,'sense541',{viewer:p.playerId});}
 else{g.decoys541.push({id:p.objectId,x:p.x,y:p.y,kind:p.kind,checked:false,until:g.elapsed+4800});p.objectId=token();p.kind=p.choices.find(k=>k!==p.kind)??p.kind;emit(g,'decoy541',{x:p.x,y:p.y});}
 return true;
}
export function tickHeist541(g,dt,finish){
 if(!g.heist541||g.phase!=='play')return;
 const h=g.players[g.hunterSeat],alive=g.players.filter(p=>!p.hunter&&p.alive),heist=g.heist541;
 g.decoys541=g.decoys541.filter(d=>d.until>g.elapsed&&!d.checked);
 for(const p of alive)p.interacting541=null;
 for(const s of heist.seals){if(s.done)continue;const workers=alive.filter(p=>dist(p,s)<155&&!p.moving&&line537(g.map,p,s));
  if(workers.length){s.progress=Math.min(2400,s.progress+dt*workers.length);workers.forEach(p=>p.interacting541={type:'seal',value:s.progress/2400});if(s.progress>=2400){s.done=true;workers.forEach(p=>p.seals541++);emit(g,'seal541',{name:s.name,seal:s.id});}}
  else s.progress=Math.max(0,s.progress-dt*.3);
 }
 const prisoners=g.players.filter(p=>!p.hunter&&!p.alive&&!p.rescued541),helpers=alive.filter(p=>dist(p,heist.cage)<160&&!p.moving&&line537(g.map,p,heist.cage));
 if(prisoners.length&&helpers.length&&dist(h,heist.cage)>430){const p=prisoners[0];p.rescueProgress541+=dt;helpers.forEach(q=>q.interacting541={type:'rescue',value:p.rescueProgress541/2800});if(p.rescueProgress541>=2800){Object.assign(p,{alive:true,rescued541:true,x:heist.cage.x,y:heist.cage.y,stamina:15000,exhausted:false,moving:false,route:[],goal:null,brain:{next:g.elapsed+600,memory:{},suspects:{}}});heist.rescues++;emit(g,'rescue541',{seat:p.seat,name:p.name});}}
 else for(const p of prisoners)p.rescueProgress541=0;
 if(heist.seals.every(s=>s.done)){const p=alive.find(p=>dist(p,heist.exit)<150&&line537(g.map,p,heist.exit));if(p){p.escaped541=true;emit(g,'escape541',{seat:p.seat});finish(g,'hiders','escape');}}
}
export function goalHeist541(g,p){
 const h=g.heist541;if(!h)return null;
 if(p.hunter){const list=[...h.seals.filter(s=>!s.done),h.cage,h.exit];return list[Math.floor(g.elapsed/8500)%list.length];}
 if(g.players.some(q=>!q.hunter&&!q.alive&&!q.rescued541)&&dist(p,h.cage)<1000&&dist(g.players[g.hunterSeat],h.cage)>500)return h.cage;
 const list=h.seals.filter(s=>!s.done);if(!list.length)return h.exit;
 const others=g.players.filter(q=>q!==p&&!q.hunter&&q.alive);const score=s=>dist(p,s)+others.filter(q=>dist(q,s)<dist(p,s)-80).length*1000;return [...list].sort((a,b)=>score(a)-score(b))[0];
}
export function publicHeist541(g,isHunter){if(!g.heist541)return null;return{...g.heist541,seals:g.heist541.seals.map(({progress,...s})=>({...s,...(!isHunter?{progress}: {})})),prisoners:g.players.filter(p=>!p.hunter&&!p.alive).map(p=>({seat:p.seat,name:p.name,rescuable:!p.rescued541}))};}
