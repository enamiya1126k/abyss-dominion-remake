// Shared objectives. Room alarms never identify a player's disguised furniture.
import {nearest537,line537,nav537,free537} from './Map537.js';
import {objective559} from './Tactics559.js';
export const HEIST559=Object.freeze({required:3,total:5,sealMs:8000,teamMs:6000,alarmMs:3000,echoMs:6000,decay:.3});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const emit=(g,type,extra={})=>{g.events.push({id:++g.eventSeq,type,at:g.elapsed,...extra});g.events=g.events.slice(-32)};
export const gatesOpen559=h=>!!h&&h.seals.filter(s=>s.done).length>=(h.required??3);
export const exits559=h=>h?.exits??(h?.exit?[{...h.exit,id:'garden',name:'庭門'}]:[]);
export function setupHeist541(g){
 const candidates=nav537(g.map).filter(p=>free537(g.map,p.x,p.y,85));
 const pick=q=>{const p=candidates.reduce((a,p)=>!a||dist(p,q)<dist(a,q)?p:a,null)??nearest537(g.map,q);return{x:p.x,y:p.y}};
 g.heist541={required:HEIST559.required,sealMs:HEIST559.sealMs,teamMs:HEIST559.teamMs,alarmMs:HEIST559.alarmMs,
  seals:[1,2,7,4,6].map((index,id)=>{const room=g.map.rooms[index];return{id,...pick({x:room.cx,y:room.cy}),room:index,name:room.name,short:['書庫','食堂','書斎','厨房','回廊'][id],progress:0,done:false,workMs:0,alarmUntil:0,nextAlarmAt:0}}),
  exits:[{id:'west',name:'薔薇の西門',short:'西門',...pick({x:550,y:3850})},{id:'east',name:'噴水の東門',short:'東門',...pick({x:4250,y:3750})}],
  cage:{...nearest537(g.map,{x:1300,y:3500})},rescues:0,openedAt:null};
 g.decoys541=[];for(const p of g.players)Object.assign(p,{abilityReady541:0,rescued541:false,rescueProgress541:0,rescues559:0,seals541:0,escaped541:false,escapeGate559:null,interacting541:null});
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
 if(!gatesOpen559(heist))for(const s of heist.seals){
  if(s.done)continue;
  const workers=alive.filter(p=>dist(p,s)<155&&!p.moving&&line537(g.map,p,s));
  if(workers.length){
   s.workMs+=dt;s.progress=Math.min(HEIST559.sealMs,s.progress+dt*(workers.length>1?HEIST559.sealMs/HEIST559.teamMs:1));
   // Partial progress remembers work time; repeated tiny stops cannot silence it.
   if(s.workMs>=HEIST559.alarmMs){s.alarmUntil=g.elapsed+HEIST559.echoMs;if(g.elapsed>=s.nextAlarmAt){s.nextAlarmAt=g.elapsed+HEIST559.echoMs;emit(g,'alarm559',{seal:s.id,name:s.name,until:s.alarmUntil})}}
   workers.forEach(p=>p.interacting541={type:'seal',seal:s.id,value:s.progress/HEIST559.sealMs,team:workers.length>1,exposed:s.workMs>=HEIST559.alarmMs});
   if(s.progress>=HEIST559.sealMs-1e-6){s.progress=HEIST559.sealMs;s.done=true;s.alarmUntil=0;workers.forEach(p=>{p.seals541++;p.interacting541=null});emit(g,'seal541',{name:s.name,seal:s.id});
    if(gatesOpen559(heist)){heist.openedAt=g.elapsed;for(const q of heist.seals)q.alarmUntil=0;for(const p of alive)p.interacting541=null;emit(g,'gates559');break;}
   }
  }else{s.progress=Math.max(0,s.progress-dt*HEIST559.decay);if(s.progress===0)s.workMs=0;}
 }
 const prisoners=g.players.filter(p=>!p.hunter&&!p.alive&&!p.rescued541),helpers=alive.filter(p=>dist(p,heist.cage)<160&&!p.moving&&line537(g.map,p,heist.cage));
 if(prisoners.length&&helpers.length&&dist(h,heist.cage)>430){const p=prisoners[0];p.rescueProgress541+=dt;helpers.forEach(q=>q.interacting541={type:'rescue',value:p.rescueProgress541/2800});if(p.rescueProgress541>=2800){Object.assign(p,{alive:true,rescued541:true,x:heist.cage.x,y:heist.cage.y,stamina:15000,exhausted:false,moving:false,route:[],goal:null,brain:{next:g.elapsed+600,memory:{},suspects:{}}});heist.rescues++;helpers.forEach(q=>q.rescues559++);emit(g,'rescue541',{seat:p.seat,name:p.name});}}
 else for(const p of prisoners)p.rescueProgress541=0;
 if(gatesOpen559(heist))for(const gate of exits559(heist)){const p=alive.find(p=>dist(p,gate)<150&&line537(g.map,p,gate));if(p){p.escaped541=true;p.escapeGate559=gate.id;emit(g,'escape541',{seat:p.seat,gate:gate.id,name:gate.name});finish(g,'hiders','escape');break;}}
}
export const goalHeist541=(g,p)=>objective559(g,p);
export function publicHeist541(g,isHunter){
 if(!g.heist541)return null;const h=g.heist541;
 return{required:h.required??3,sealMs:h.sealMs??2400,teamMs:h.teamMs??1200,alarmMs:h.alarmMs??0,openedAt:h.openedAt??null,
  seals:h.seals.map(s=>({id:s.id,x:s.x,y:s.y,room:s.room,name:s.name,short:s.short,done:s.done,alarmUntil:s.alarmUntil??0,...(!isHunter?{progress:s.progress}: {})})),
  exits:exits559(h),cage:{...h.cage},rescues:h.rescues,prisoners:g.players.filter(p=>!p.hunter&&!p.alive).map(p=>({seat:p.seat,name:p.name,rescuable:!p.rescued541}))};
}
