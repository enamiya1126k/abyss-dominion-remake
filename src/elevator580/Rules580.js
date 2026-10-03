import {STEP580,random580 as rnd,event580 as emit,make580,players580,finish580,publicBase580,resume580} from '../arcade580/Common580.js';

export const ELEVATOR580=Object.freeze({step:STEP580,countdown:3000,duration:30000,rides:3,intermission:3500,speed:.82,platform:.79,catchRadius:.082,topBonus:200});
export const DROPS580=Object.freeze({coin:{points:25,speed:.31},gem:{points:60,speed:.34},gold:{points:100,speed:.29},bomb:{points:0,speed:.36}});
const C=ELEVATOR580;
export const makeElevator580=args=>make580('elevator',args);
function ride(g){
 Object.assign(g,{phase:'countdown',phaseAt:g.lastAt,startAt:g.lastAt+C.countdown,deadline:g.lastAt+C.countdown+C.duration,nextSpawn:g.lastAt+C.countdown+250,drops:[],dropSeq:0,stress:0,weight:48,floor:1,collapseAt:0,reason:null});
 for(const p of g.players)Object.assign(p,{x:.18+p.seat*.21,target:.18+p.seat*.21,haul:0,status:'riding',banked:0,bankAt:0,stunUntil:0,botAt:g.startAt+300+rnd(g)*400});
}
export function startElevator580(g,now,seed=580){if(g.phase!=='lobby')return false;g.seed=seed>>>0||580;g.lastAt=now;g.round=1;players580(g);for(const p of g.players)Object.assign(p,{collected:0,escapes:0,tops:0,falls:0,bombs:0});ride(g);g.revision++;g.updatedAt=now;return true;}
export function validElevator580(g,p,m,at=g.lastAt){return !!p&&g.phase==='play'&&p.status==='riding'&&at>=g.startAt&&at<g.deadline&&(!g.collapseAt||at<g.collapseAt)&&(m.action==='bank'||m.action==='move'&&Number.isFinite(m.target)&&m.target>=.08&&m.target<=.92);}
export function inputElevator580(g,p,m){
 if(!validElevator580(g,p,m))return false;
 p.lastSeq=Math.max(p.lastSeq,m.seq??0);
 if(m.action==='move'){p.target=m.target;return true;}
 p.status='banked';p.bankAt=g.lastAt;p.banked=p.haul;p.score+=p.haul;p.escapes++;g.stress=Math.max(0,g.stress-15);emit(g,'bank',{seat:p.seat,value:p.haul,x:p.x});return true;
}
function endRide(g,reason){
 if(g.phase!=='play')return;
 for(const p of g.players)if(p.status==='riding'){
  if(reason==='top'){p.status='top';p.banked=p.haul+C.topBonus;p.score+=p.banked;p.tops++;}
  else{p.status='fallen';p.banked=0;p.falls++;}
 }
 g.phase='roundEnd';g.phaseAt=g.lastAt;g.reason=reason;g.nextRound=g.lastAt+C.intermission;emit(g,'roundEnd',{reason});
}
function spawn(g){
 const elapsed=g.lastAt-g.startAt,r=rnd(g),kind=r<(elapsed>18000?.22:.14)?'bomb':r<.35?'gold':r<.58?'gem':'coin';
 g.drops.push({id:++g.dropSeq,kind,x:.10+rnd(g)*.80,y:-.06,speed:DROPS580[kind].speed*(1+Math.min(1,elapsed/C.duration)*.2)});
 g.nextSpawn=g.lastAt+(elapsed>21000?440:elapsed>12000?600:770);
}
function think(g,p){
 if(g.lastAt<p.botAt||p.status!=='riding')return;p.botAt=g.lastAt+180+rnd(g)*240;
 if((g.collapseAt&&g.collapseAt-g.lastAt<1000+p.seat*50)||(p.haul>=150&&(g.stress>61+p.seat*3||g.floor>=8&&rnd(g)<.22))){inputElevator580(g,p,{action:'bank'});return;}
 const bomb=g.drops.filter(d=>d.kind==='bomb'&&d.y>.57&&Math.abs(d.x-p.x)<.14).sort((a,b)=>b.y-a.y)[0];
 if(bomb){p.target=Math.max(.08,Math.min(.92,bomb.x+(p.x<.5?.22:-.22)));return;}
 const loot=g.drops.filter(d=>d.kind!=='bomb'&&d.y<C.platform&&((C.platform-d.y)/d.speed)>Math.abs(d.x-p.x)/C.speed).map(d=>({d,v:DROPS580[d.kind].points/(1+Math.abs(d.x-p.x)*5+(C.platform-d.y)*2)})).sort((a,b)=>b.v-a.v)[0];
 if(loot)p.target=Math.max(.08,Math.min(.92,loot.d.x+(rnd(g)-.5)*.045));
}
export function physicsElevator580(g,dt=C.step/1000){
 for(const p of g.players)if(p.status==='riding'&&g.lastAt>=p.stunUntil){const d=p.target-p.x;p.x+=Math.sign(d)*Math.min(Math.abs(d),C.speed*dt);}
 for(const d of [...g.drops]){
  const before=d.y;d.y+=d.speed*dt;
  if(before<C.platform&&d.y>=C.platform){
   const players=g.players.filter(p=>p.status==='riding'&&Math.abs(p.x-d.x)<=C.catchRadius).sort((a,b)=>Math.abs(a.x-d.x)-Math.abs(b.x-d.x)||((a.seat+g.dropSeq)%4)-((b.seat+g.dropSeq)%4));
   if(d.kind==='bomb'){
    g.stress=Math.min(100,g.stress+10);for(const p of players){const loss=Math.min(40,p.haul);p.haul-=loss;p.stunUntil=g.lastAt+550;p.bombs++;emit(g,'blast',{seat:p.seat,value:-loss,x:p.x});}emit(g,'shake',{x:d.x});
   }else if(players.length){const p=players[0],value=DROPS580[d.kind].points;p.haul+=value;p.collected++;emit(g,'catch',{seat:p.seat,value,x:d.x,kind:d.kind});}
   g.drops=g.drops.filter(v=>v.id!==d.id);
  }
 }
 const riders=g.players.filter(p=>p.status==='riding');g.weight=riders.reduce((n,p)=>n+12+p.haul*.073,0);
 g.stress=Math.max(0,Math.min(100,g.stress+(g.weight>69?(g.weight-69)*.13:-(69-g.weight)*.045)*dt));
 if(g.stress>=90&&!g.collapseAt){g.collapseAt=g.lastAt+1500;emit(g,'alarm');}
 if(g.collapseAt&&g.stress<75){g.collapseAt=0;emit(g,'relief');}
 if(!riders.length)endRide(g,'escaped');else if(g.collapseAt&&g.lastAt>=g.collapseAt)endRide(g,'collapse');
}
export function advanceElevator580(g,now,inputs=new Map(),auto=new Set()){
 if(['lobby','result'].includes(g.phase))return false;
 resume580(g,now,inputs,['startAt','deadline','phaseAt','nextSpawn','collapseAt','nextRound'],['stunUntil','botAt','bankAt']);
 let changed=false;
 while(g.lastAt+C.step<=now&&g.phase!=='result'){
  g.lastAt+=C.step;changed=true;
  if(g.phase==='roundEnd'){inputs.clear();if(g.lastAt>=g.nextRound){if(g.round>=C.rides)finish580(g);else{g.round++;ride(g);}}continue;}
  if(g.phase==='countdown'){inputs.clear();if(g.lastAt<g.startAt)continue;g.phase='play';g.phaseAt=g.lastAt;emit(g,'start');}
  // End deadlines before reading queued input, including a delayed bank request.
  if(g.lastAt>=g.deadline){endRide(g,'top');inputs.clear();continue;}
  if(g.collapseAt&&g.lastAt>=g.collapseAt){endRide(g,'collapse');inputs.clear();continue;}
  g.floor=Math.min(10,1+Math.floor((g.lastAt-g.startAt)/3000));
  for(const p of g.players){p.auto=p.ai||auto.has(p.playerId);const list=inputs.get(p.playerId)??[];inputs.delete(p.playerId);if(p.auto)think(g,p);else for(const m of list)if(m.round==null||m.round===g.round)inputElevator580(g,p,m);}
  if(g.lastAt>=g.nextSpawn)spawn(g);physicsElevator580(g);
 }
 g.serverAt=g.lastAt;g.updatedAt=now;if(changed)g.revision++;return changed;
}
export function publicElevator580(g){return {...publicBase580(g),floor:g.floor,weight:g.weight,stress:g.stress,collapseAt:g.collapseAt,reason:g.reason,nextRound:g.nextRound,drops:(g.drops??[]).map(d=>({...d})),players:g.players.map(({botAt,inputSeq563,...p})=>({...p,lastSeq:Math.max(p.lastSeq,inputSeq563??0)}))};}
