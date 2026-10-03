import {STEP580,random580 as random,event580 as emit,make580,players580,finish580,publicBase580,resume580} from '../arcade580/Common580.js';

export const CHAIRS583=Object.freeze({step:STEP580,countdown:3000,rounds:8,musicMin:3600,musicRange:3400,grabMs:4800,revealMs:2400,retryMs:100,normal:100,gold:150,goldMax:300,goldDelay:800,growMs:1800,counts:[3,3,2,3,2,3,2,1]});
const C=CHAIRS583;
export const makeChairs583=args=>({...make580('chairs',args),rules583:3,chairs:[],history:[]});
export function chairPoint583(index,count){return count===1?{x:.5,y:.56}:count===2?{x:index===0?.3:.7,y:.56}:[{x:.5,y:.46},{x:.27,y:.70},{x:.73,y:.70}][index];}
export function orbit583(seat,g,at,reduced=false){const angle=Math.PI/2+seat*Math.PI/2+(reduced?0:Math.max(0,at-(g.roundAt??g.startAt))/1250);return {x:.5+Math.cos(angle)*.37,y:.58+Math.sin(angle)*.30};}
export function chairLocation584(g,id){const ch=g.chairs.find(ch=>ch.id===id);return chairPoint583(ch?.slot??id,g.chairs.length);}
export function chairValue584(g,ch,at=g.lastAt??g.serverAt){
 if(ch.owner!=null)return ch.points;
 const growing=ch.gold&&ch.openAt>0&&['grab','reveal'].includes(g.stage),charge=growing?Math.max(0,Math.min(1,(at-ch.openAt)/C.growMs)):0;
 return (ch.gold?C.gold+Math.floor(charge*15+1e-8)*10:C.normal)*g.multiplier;
}
export function chairOpen584(g,ch,at=g.lastAt??g.serverAt){return g.stage==='grab'&&(!ch.gold||ch.openAt>0&&at>=ch.openAt);}
function nextRound(g){
 const count=C.counts[g.round-1],gold=Math.floor(random(g)*count);
 Object.assign(g,{stage:'dance',phaseAt:g.lastAt,roundAt:g.lastAt,deadline:null,stopAt:g.lastAt+C.musicMin+Math.floor(random(g)*C.musicRange/C.step)*C.step,multiplier:g.round>=7?2:1});
 g.mode=g.round===4?'goldrush':g.round===8?'final':[2,5,6].includes(g.round)?'shuffle':'standard';
 g.shuffleAt=g.mode==='shuffle'?g.lastAt+1500:0;g.shuffles=0;
 g.chairs=Array.from({length:count},(_,id)=>({id,slot:id,gold:g.mode==='goldrush'||id===gold,points:(g.mode==='goldrush'||id===gold?C.gold:C.normal)*g.multiplier,owner:null,claimedAt:0,receivedAt:0,openAt:0}));
 for(const p of g.players)Object.assign(p,{chair:null,gain:0,out:false,fault:false,reaction:null,nextAt:0,actionAt:0,bumpAt:0,botAt:0,falseAt:random(g)<.065?g.lastAt+1800+Math.floor(random(g)*1000):0});
 emit(g,'dance',{round:g.round,count,multiplier:g.multiplier});
}
export function startChairs583(g,now,seed=583){
 if(g.phase!=='lobby')return false;
 g.seed=seed>>>0||583;g.lastAt=now;players580(g);
 for(const p of g.players)Object.assign(p,{sits:0,golds:0,faults:0,bestReaction:null,chair:null,gain:0,out:false,fault:false,nextAt:0,actionAt:0,bumpAt:0});
 Object.assign(g,{phase:'countdown',stage:'ready',round:1,phaseAt:now,startAt:now+C.countdown,deadline:now+C.countdown,roundAt:now+C.countdown,stopAt:0,multiplier:1,chairs:[],history:[]});
 g.updatedAt=now;g.revision++;return true;
}
export function validChairs583(g,p,m,at=g.lastAt??g.serverAt){
 return !!p&&g.phase==='play'&&['dance','grab'].includes(g.stage)&&!p.out&&p.chair==null&&at>=g.roundAt&&at>=(p.nextAt??0)&&(g.stage!=='grab'||at<g.deadline)&&m.action==='sit'&&Number.isSafeInteger(m.target)&&g.chairs.some(ch=>ch.id===m.target&&(g.stage==='dance'||at<g.phaseAt||chairOpen584(g,ch,at)));
}
export function inputChairs583(g,p,m){
 const at=m.at??g.lastAt;
 if(!validChairs583(g,p,m,at)||at>g.lastAt||m.round!=null&&m.round!==g.round)return false;
 p.lastSeq=Math.max(p.lastSeq,m.seq??0);p.actionAt=g.lastAt;
 // Arrival time is stamped by the server. A press just before STOP stays a foul,
 // even when the next simulation tick has already switched to the grab phase.
 if(at<g.stopAt){p.out=true;p.fault=true;p.faults++;emit(g,'fault',{seat:p.seat});return true;}
 const chair=g.chairs.find(ch=>ch.id===m.target);
 if(chair.owner!=null){p.nextAt=g.lastAt+C.retryMs;p.bumpAt=g.lastAt;emit(g,'miss',{seat:p.seat,chair:chair.id,winner:chair.owner,margin:Math.max(0,at-chair.receivedAt)});return true;}
 chair.points=chairValue584(g,chair,at);chair.receivedAt=at;chair.owner=p.seat;chair.claimedAt=g.lastAt;p.chair=chair.id;p.gain=chair.points;p.score+=p.gain;p.sits++;if(chair.gold)p.golds++;
 p.reaction=Math.max(0,at-g.stopAt);p.bestReaction=Math.min(p.bestReaction??Infinity,p.reaction);
 emit(g,'sit',{seat:p.seat,chair:chair.id,value:p.gain,gold:chair.gold});return true;
}
function resolve(g){
 g.stage='reveal';g.phaseAt=g.lastAt;g.deadline=g.lastAt+C.revealMs;
 for(const p of g.players)if(p.chair==null)p.out=true;
 g.history.push({round:g.round,gains:g.players.map(p=>p.gain),chairs:g.chairs.map(ch=>({...ch}))});
 emit(g,'roundEnd',{round:g.round});
}
function bot(g,p){
 if(p.out||p.chair!=null)return null;
 if(g.stage==='dance')return p.falseAt&&g.lastAt>=p.falseAt?{action:'sit',target:g.chairs[Math.floor(random(g)*g.chairs.length)].id}:null;
 if(g.stage!=='grab'||g.lastAt<p.botAt||g.lastAt<p.nextAt)return null;
 p.botAt=g.lastAt+450+random(g)*500;
 const free=g.chairs.filter(ch=>ch.owner==null&&chairOpen584(g,ch)),gold=free.find(ch=>ch.id===p.botTarget)??free.find(ch=>ch.gold);
 // Bots act only after the public STOP signal and use currently empty seats.
 // Deliberately human-scale reactions; no access to opponents' queued actions.
 const chair=gold&&p.botGreedy?gold:free.filter(ch=>!ch.gold)[0]??free[Math.floor(random(g)*free.length)];
 return chair?{action:'sit',target:chair.id}:null;
}
export function advanceChairs583(g,now,inputs=new Map(),auto=new Set()){
 if(['lobby','result'].includes(g.phase))return false;
 const before=g.lastAt;
 resume580(g,now,inputs,['startAt','phaseAt','roundAt','stopAt','deadline','shuffleAt'],['nextAt','actionAt','bumpAt','botAt','falseAt']);
 const shift=g.lastAt-before;if(shift)for(const ch of g.chairs)for(const key of ['claimedAt','receivedAt','openAt'])if(ch[key])ch[key]+=shift;
 let changed=false;
 while(g.lastAt+C.step<=now&&g.phase!=='result'){
  g.lastAt+=C.step;changed=true;
  if(g.phase==='countdown'){inputs.clear();if(g.lastAt<g.startAt)continue;g.phase='play';nextRound(g);}
  if(g.stage==='reveal'){
   inputs.clear();if(g.lastAt<g.deadline)continue;
   if(g.round===C.rounds){finish580(g);break;}g.round++;nextRound(g);
  }
  if(g.stage==='dance'&&g.shuffleAt&&g.lastAt>=g.shuffleAt&&g.lastAt<g.stopAt){
   const count=g.chairs.length,shift=1+Math.floor(random(g)*(count-1));for(const ch of g.chairs)ch.slot=(ch.slot+shift)%count;
   g.shuffles++;g.shuffleAt=g.shuffles<2?g.lastAt+1300:0;emit(g,'shuffle');
  }
  if(g.stage==='dance'&&g.lastAt>=g.stopAt){
   g.stage='grab';g.phaseAt=g.stopAt;g.deadline=g.stopAt+C.grabMs;
   for(const ch of g.chairs)ch.openAt=g.stopAt+(ch.gold?C.goldDelay+(g.mode==='goldrush'?ch.id*220:0):0);
   for(const p of g.players){const golds=g.chairs.filter(ch=>ch.gold);p.botGreedy=g.mode==='final'||g.mode==='goldrush'||random(g)<.55;p.botTarget=golds[Math.floor(random(g)*golds.length)].id;p.botAt=p.botGreedy?g.chairs[p.botTarget].openAt+425+Math.floor(random(g)*1400):g.stopAt+500+Math.floor(random(g)*850);}
   emit(g,'stop');
  }
  const actions=[];
  for(const p of g.players){
   p.auto=p.ai||auto.has(p.playerId);const list=inputs.get(p.playerId)??[],future=[];
   if(p.auto){const m=bot(g,p);if(m)actions.push({p,m:{...m,at:g.lastAt}});}
   else for(const m of list){if(m.round!=null&&m.round!==g.round)continue;if((m.at??g.lastAt)>g.lastAt)future.push(m);else actions.push({p,m:{...m,at:m.at??g.lastAt}});}
   if(future.length)inputs.set(p.playerId,future);else inputs.delete(p.playerId);
  }
  const priority=(g.round+Math.floor(g.stopAt/C.step))%4;
  actions.sort((a,b)=>a.m.at-b.m.at||((a.p.seat-priority+4)%4)-((b.p.seat-priority+4)%4)||(a.m.seq??0)-(b.m.seq??0));
  for(const {p,m} of actions)inputChairs583(g,p,m);
  if(g.players.every(p=>p.out||p.chair!=null)||g.chairs.every(ch=>ch.owner!=null)||g.stage==='grab'&&g.lastAt>=g.deadline)resolve(g);
 }
 g.serverAt=g.lastAt;g.updatedAt=now;if(changed)g.revision++;return changed;
}
export function publicChairs583(g){
 return {...publicBase580(g),rules583:g.rules583,stage:g.stage,mode:g.mode,shuffles:g.shuffles,roundAt:g.roundAt,multiplier:g.multiplier,chairs:g.chairs.map(({receivedAt,...ch})=>({...ch,points:chairValue584(g,ch)})),history:g.history.map(r=>({round:r.round,gains:[...r.gains]})),players:g.players.map(({botAt,falseAt,botGreedy,botTarget,inputSeq563,...p})=>({...p,lastSeq:Math.max(p.lastSeq,inputSeq563??0)}))};
}
// There is deliberately no future STOP time, random seed or bot plan on the wire.
export const signature583=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
