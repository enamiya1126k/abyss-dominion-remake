// Shared, deterministic, server-authoritative physics. Milliseconds / world units.
export const TETRA539=Object.freeze({width:1200,height:5800,startY:5400,goalY:360,step:50,countdown:4000,duration:150000,grace:20000,charge:1150,minJump:85,maxJump:435,respawn:1600,waveEvery:16000,waveLife:3200,waveWarning:3000});
export const clamp539=(v,a,b)=>Math.max(a,Math.min(b,v));
const copy=x=>structuredClone(x),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const random=g=>{let n=g.seed|0;n^=n<<13;n^=n>>>17;n^=n<<5;g.seed=n>>>0||539;return g.seed/4294967296};
export function course539(seed=539){const r={seed:seed||539},pads=[],safeRoutes=[],shortRoutes=[];const add=p=>{p.id=pads.length;pads.push(p);return p.id};
 const checkpoints=Array.from({length:4},(_,i)=>add({x:600,y:5400-i*1680,r:i===3?132:122,kind:i===3?'finish':'refuge',checkpoint:i,section:i,low:false}));
 for(let section=0;section<3;section++){const top=5400-section*1680,side=section%2?-1:1,safe=[checkpoints[section]],short=[checkpoints[section]];
  for(let i=1;i<=7;i++)safe.push(add({x:600+side*(220+Math.sin(i*.85)*85)+(random(r)-.5)*28,y:top-i*210+(random(r)-.5)*22,r:72,kind:'stable',low:false,section}));
  for(let i=1;i<=4;i++)short.push(add({x:600+Math.sin(i*1.3+section)*70+(random(r)-.5)*22,y:top-i*336+(random(r)-.5)*16,r:i%2?59:64,kind:['tilt','spin','sink','tilt'][(i-1+section)%4],low:true,section}));
  safe.push(checkpoints[section+1]);short.push(checkpoints[section+1]);safeRoutes.push(safe);shortRoutes.push(short);
 }
 return{width:1200,height:5800,pads,checkpoints,safeRoutes,shortRoutes};
}
export function wave539(at){if(at<0)return{active:false,warning:false,next:TETRA539.waveEvery,phase:0};const cycle=Math.floor(at/TETRA539.waveEvery),phase=at%TETRA539.waveEvery;return{active:cycle>0&&phase<TETRA539.waveLife,warning:phase>=TETRA539.waveEvery-TETRA539.waveWarning,next:TETRA539.waveEvery-phase,phase};}
export function pad539(g,pad,at=g.elapsed){const state=g.padStates?.[pad.id]??{},spin=pad.kind==='spin'&&state.spinAt!=null?clamp539((at-state.spinAt)/8000,0,1):0,angle=spin*Math.PI*4;
 const sinking=pad.kind==='sink'&&state.sinkAt!=null?at-state.sinkAt:-1,submerged=pad.low&&wave539(at).active||sinking>=2200&&sinking<4800;
 return{...pad,x:pad.x+(spin>0&&spin<1?Math.sin(angle)*30:0),y:pad.y+(spin>0&&spin<1?(Math.cos(angle)-1)*24:0),angle,submerged,sinking,tilt:pad.kind==='tilt'&&state.tiltAt!=null?clamp539((at-state.tiltAt)/1400,0,1):0};
}
export const jumpDistance539=ms=>TETRA539.minJump+(TETRA539.maxJump-TETRA539.minJump)*clamp539(ms/TETRA539.charge,0,1);
export const flightTime539=d=>Math.round(480+d*.85);
export function landing539(g,x,y,at=g.elapsed){return g.course.pads.map(p=>pad539(g,p,at)).filter(p=>!p.submerged&&Math.hypot(x-p.x,y-p.y)<=p.r-7).sort((a,b)=>Math.hypot(x-a.x,y-a.y)-Math.hypot(x-b.x,y-b.y))[0]??null;}
export function pose539(g,p,at=g.elapsed){if(p.flight){const f=p.flight,t=clamp539((at-f.at)/f.duration,0,1);return{x:f.x+(f.tx-f.x)*t,y:f.y+(f.ty-f.y)*t,z:Math.sin(t*Math.PI)*(80+f.distance*.18)}}if(p.padId!=null){const pad=pad539(g,g.course.pads[p.padId],at);return{x:pad.x+p.ox,y:pad.y+p.oy,z:0}}return{x:p.x,y:p.y,z:0};}
const event=(g,type,extra={})=>{g.events.push({id:++g.eventSeq,at:g.elapsed,type,...extra});g.events=g.events.slice(-28)};
export function makeTetra539({id,code,partyId,hostId,members,now=0}){return{id,code,game:'tetra',rulesVersion:1,partyId462:partyId,hostId,members:copy(members),phase:'lobby',revision:0,createdAt:now,updatedAt:now,serverAt:now,lastAt:now,elapsed:0,players:[],events:[],eventSeq:0,results:[]};}
export function startTetra539(g,now,seed=539){g.seed=seed||539;g.course=course539(seed);g.padStates={};g.players=g.members.filter(m=>!m.departed).map((m,seat)=>({playerId:m.playerId,name:m.name,seat,ai:!!m.ai,speciesId:m.choice?.speciesId??'slime',color499:m.color499??['blue','green','pink','orange'][seat]}));
 while(g.players.length<4){const seat=g.players.length;g.players.push({playerId:`AI-${g.id}-${seat}`,name:['しぶき','しおかぜ','より','なみのり'][seat],seat,ai:true,speciesId:['myth_yori','wolf','myth_yori','slime'][seat],color499:g.aiColors500?.[seat]??['blue','green','pink','orange'][seat]});}
 Object.assign(g,{phase:'countdown',startAt:now+TETRA539.countdown,endAt:now+TETRA539.countdown+TETRA539.duration,lastAt:now,serverAt:now,elapsed:-TETRA539.countdown,firstFinish:null,events:[],eventSeq:0,results:[],waveCycle:0});
 for(const p of g.players)Object.assign(p,{x:600+(p.seat-1.5)*42,y:5400,padId:g.course.checkpoints[0],ox:(p.seat-1.5)*42,oy:0,checkpoint:0,bestY:5400,falls:0,jumps:0,landings:0,lastSeq:0,chargeAt:null,aim:-Math.PI/2,flight:null,fallAt:null,finishedAt:null,auto:p.ai,brain:{next:350+p.seat*230},landedAt:0});
 g.updatedAt=now;g.revision++;return g;
}
export function fall539(g,p,reason='miss'){if(p.fallAt!=null||p.finishedAt!=null)return;const pos=pose539(g,p);Object.assign(p,{x:pos.x,y:pos.y,padId:null,flight:null,chargeAt:null,fallAt:g.elapsed,falls:p.falls+1});event(g,'splash',{seat:p.seat,x:p.x,y:p.y,reason});}
export function inputTetra539(g,p,a){if(g.phase!=='play'||p.finishedAt!=null||p.fallAt!=null||p.flight)return false;const at=clamp539(a.at??g.elapsed,Math.max(0,g.elapsed-200),g.elapsed);
 if(a.action==='cancel'){p.chargeAt=null;return true}
 if(Number.isFinite(a.angle))p.aim=clamp539(a.angle,-Math.PI,Math.PI);
 if(a.action==='begin'){if(p.chargeAt!=null)return false;p.chargeAt=at;return true}
 if(a.action==='aim')return p.chargeAt!=null;
 if(a.action!=='release'||p.chargeAt==null)return false;const hold=at-p.chargeAt;p.chargeAt=null;if(hold<60)return false;
 const d=jumpDistance539(hold),pos=pose539(g,p),tx=pos.x+Math.cos(p.aim)*d,ty=pos.y+Math.sin(p.aim)*d;Object.assign(p,{flight:{x:pos.x,y:pos.y,tx,ty,at:g.elapsed,distance:d,duration:flightTime539(d)},x:pos.x,y:pos.y,padId:null,jumps:p.jumps+1});event(g,'jump',{seat:p.seat,x:pos.x,y:pos.y});return true;
}
export function order539(g){return [...g.players].sort((a,b)=>a.finishedAt!=null&&b.finishedAt!=null?a.finishedAt-b.finishedAt||a.seat-b.seat:a.finishedAt!=null?-1:b.finishedAt!=null?1:b.checkpoint-a.checkpoint||a.bestY-b.bestY||a.falls-b.falls||a.seat-b.seat);}
export function finishTetra539(g,reason='time'){if(g.phase==='result')return;g.phase='result';g.reason=reason;let previous=null;g.results=order539(g).map((p,i)=>{const key=p.finishedAt!=null?'f'+p.finishedAt:`p${p.checkpoint}:${p.bestY}:${p.falls}`,rank=key===previous?.key?previous.rank:i+1;previous={key,rank};return{playerId:p.playerId,seat:p.seat,name:p.name,rank,finishedAt:p.finishedAt,progress:Math.round((5400-p.bestY)/5040*100),falls:p.falls,jumps:p.jumps,landings:p.landings}});g.players.forEach(p=>p.chargeAt=null);event(g,'finish');g.updatedAt=g.lastAt;g.revision++;}
function land(g,p){const f=p.flight,x=f.tx,y=f.ty,pad=landing539(g,x,y);if(!pad){p.x=x;p.y=y;p.flight=null;fall539(g,p);return}Object.assign(p,{x,y,ox:x-pad.x,oy:y-pad.y,padId:pad.id,flight:null,landedAt:g.elapsed,landings:p.landings+1});
 const state=g.padStates[pad.id]??={};if(pad.kind==='sink'&&(state.sinkAt==null||g.elapsed-state.sinkAt>=4800))state.sinkAt=g.elapsed;if(pad.kind==='tilt'){state.tiltAt=g.elapsed;state.direction=(p.seat%2?1:-1)}if(pad.kind==='spin'&&(state.spinAt==null||g.elapsed-state.spinAt>=8000))state.spinAt=g.elapsed;
 if(pad.checkpoint===p.checkpoint+1){p.checkpoint=pad.checkpoint;event(g,'checkpoint',{seat:p.seat,checkpoint:p.checkpoint})}if(pad.section<=p.checkpoint)p.bestY=Math.min(p.bestY,y);
 if(pad.kind==='finish'&&p.checkpoint===3){p.finishedAt=g.elapsed;p.bestY=TETRA539.goalY;if(g.firstFinish==null){g.firstFinish=g.elapsed;g.endAt=Math.min(g.endAt,g.startAt+g.elapsed+TETRA539.grace)}event(g,'goal',{seat:p.seat})}else event(g,'land',{seat:p.seat,x,y});
 p.brain.next=g.elapsed+700+random(g)*900;
}
function bot539(g,p){if(p.flight||p.fallAt!=null||p.finishedAt!=null||g.elapsed<p.brain.next)return;if(p.chargeAt!=null){if(g.elapsed>=p.brain.releaseAt)inputTetra539(g,p,{action:'release',angle:p.brain.angle});return}
 const pos=pose539(g,p),wave=wave539(g.elapsed),section=Math.min(2,p.checkpoint),routes=[g.course.safeRoutes[section],g.course.shortRoutes[section]],candidates=[];
 for(let route=0;route<2;route++)for(const id of routes[route].slice(1)){const pad=pad539(g,g.course.pads[id]),d=dist(pos,pad);if(pad.y>=pos.y-75||d>TETRA539.maxJump-12||d<TETRA539.minJump+5||pad.submerged||pad.low&&(wave.active||wave.warning))continue;candidates.push({pad,d,score:(pos.y-pad.y)+(route===1?(p.seat%2?20:-90):40)-Math.abs(pad.x-pos.x)*.08})}
 candidates.sort((a,b)=>b.score-a.score);const target=candidates[0];if(!target){p.brain.next=g.elapsed+250;return}
 // AI uses visible geometry and the same charge/release physics; occasional imperfect aim.
 let error=(random(g)-.5)*.045;if(random(g)<.055)error+=(random(g)<.5?-1:1)*.24;const angle=Math.atan2(target.pad.y-pos.y,target.pad.x-pos.x)+error,hold=(target.d-TETRA539.minJump)/(TETRA539.maxJump-TETRA539.minJump)*TETRA539.charge;
 inputTetra539(g,p,{action:'begin',angle});p.brain.angle=angle;p.brain.releaseAt=g.elapsed+hold;p.brain.next=g.elapsed;
}
export function advanceTetra539(g,now,inputs=new Map(),auto=new Set()){if(!['countdown','play'].includes(g.phase))return;const steps=Math.min(200,Math.floor((now-g.lastAt)/TETRA539.step));
 for(let s=0;s<steps&&g.phase!=='result';s++){g.lastAt+=TETRA539.step;g.elapsed=g.lastAt-g.startAt;if(g.phase==='countdown'&&g.elapsed>=0){g.phase='play';g.revision++;event(g,'begin')}if(g.phase==='countdown')continue;
  const cycle=Math.floor(g.elapsed/TETRA539.waveEvery);if(cycle>g.waveCycle){g.waveCycle=cycle;event(g,'wave')}
  for(const p of g.players){const wasAuto=p.auto;p.auto=p.ai||auto.has(p.playerId);if(wasAuto!==p.auto){p.chargeAt=null;p.brain.next=g.elapsed+400;inputs.delete(p.playerId)}
   if(p.finishedAt!=null)continue;
   if(p.fallAt!=null){if(g.elapsed-p.fallAt>=TETRA539.respawn){const pad=g.course.pads[g.course.checkpoints[p.checkpoint]];Object.assign(p,{x:pad.x,y:pad.y,padId:pad.id,ox:(p.seat-1.5)*26,oy:0,fallAt:null,chargeAt:null,landedAt:g.elapsed});p.brain.next=g.elapsed+350;event(g,'respawn',{seat:p.seat})}continue}
   if(p.flight){if(g.elapsed-p.flight.at>=p.flight.duration)land(g,p);else{const pos=pose539(g,p);p.x=pos.x;p.y=pos.y}continue}
   const pad=pad539(g,g.course.pads[p.padId]);if(pad.submerged){fall539(g,p,'wave');continue}
   if(pad.kind==='tilt'&&g.elapsed-p.landedAt>500){p.ox+=(g.padStates[pad.id]?.direction??1)*TETRA539.step/1000*48*pad.tilt;if(Math.hypot(p.ox,p.oy)>pad.r-5){fall539(g,p,'tilt');continue}}
   const pos=pose539(g,p);p.x=pos.x;p.y=pos.y;
   if(p.chargeAt!=null&&g.elapsed-p.chargeAt>3500)p.chargeAt=null;
   if(p.auto){inputs.delete(p.playerId);bot539(g,p)}else{const actions=inputs.get(p.playerId)??[];while(actions.length&&actions[0].at<=g.elapsed)inputTetra539(g,p,actions.shift());if(!actions.length)inputs.delete(p.playerId)}
  }
  if(g.players.every(p=>p.finishedAt!=null))finishTetra539(g,'all');else if(g.lastAt>=g.endAt)finishTetra539(g,g.firstFinish!=null?'grace':'time');
 }
 if(now>=g.endAt&&g.phase!=='result'){g.lastAt=now;g.elapsed=Math.min(TETRA539.duration,now-g.startAt);finishTetra539(g,g.firstFinish!=null?'grace':'time')}g.serverAt=now;g.updatedAt=now;
}
export function publicTetra539(g,viewerId,{frame=false}={}){return{id:g.id,code:g.code,game:'tetra',rulesVersion:1,hostId:g.hostId,phase:g.phase,revision:g.revision,serverAt:g.serverAt,elapsed:g.elapsed,startAt:g.startAt,endAt:g.endAt,firstFinish:g.firstFinish,...(!frame&&g.course?{course:copy(g.course)}:{}),padStates:copy(g.padStates??{}),members:g.members.map(m=>({playerId:m.playerId,name:m.name,departed:!!m.departed,choice:m.choice?{id:m.choice.id,speciesId:m.choice.speciesId}:null})),players:g.players.map(({brain,lastSeq,...p})=>({...copy(p),...(p.playerId===viewerId?{lastSeq}:{})})),events:copy(g.events),results:copy(g.results),reason:g.reason};}
export const signature539=g=>!g?null:g.phase==='lobby'?g:{id:g.id,phase:g.phase==='result'?'result':'play',members:g.members,results:g.phase==='result'?g.results:null};
