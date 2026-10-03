import {STEP580,random580 as random,event580 as emit,make580,players580,finish580,publicBase580,resume580} from '../arcade580/Common580.js';

export const SUSHI581=Object.freeze({step:STEP580,countdown:3000,duration:75000,slots:12,speed:.50,rushSpeed:.66,reach:1.06,grabMs:650,spicyMs:1500,snatchMs:14000,setBonus:180,comboGoal:5,feverMs:6000});
export const MENU581=Object.freeze([
 {id:'salmon',name:'サーモン',points:10},{id:'tuna',name:'まぐろ',points:10},
 {id:'egg',name:'たまご',points:10},{id:'shrimp',name:'えび',points:10},
 {id:'roll',name:'かっぱ巻',points:10},{id:'roe',name:'いくら',points:10},
 {id:'gold',name:'金皿',points:40},{id:'wasabi',name:'激辛わさび',points:-40}
]);
const C=SUSHI581,TAU=Math.PI*2;
export const makeSushi581=args=>({...make580('sushi',args),rules581:3});
export const fever582=(p,at)=>!!p&&at<(p.feverUntil??0);
export const seatAngle581=seat=>Math.PI/2+seat*Math.PI/2;
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function angle581(g,d,at=g.lastAt??g.serverAt){return (g.beltAngle??0)+d.slot*TAU/C.slots+(g.phase==='play'?Math.max(0,Math.min(150,at-(g.lastAt??g.serverAt)))/1000*g.direction*g.speed:0);}
export function reachable581(g,p,d,at=g.lastAt??g.serverAt){return !!p&&!!d&&Math.abs(wrap(angle581(g,d,at)-seatAngle581(p.seat)))<=C.reach;}
export function point581(g,d,selfSeat=0,at=g.lastAt??g.serverAt){const a=angle581(g,d,at)-selfSeat*Math.PI/2;return {x:.5+Math.cos(a)*.35,y:.48+Math.sin(a)*.32};}
export function wanted581(p,kind){return kind===6?p.order.findIndex((_,i)=>!p.filled[i]):p.order.findIndex((v,i)=>v===kind&&!p.filled[i]);}
function recipe(g,p){p.order=[...g.recipes[p.sets%g.recipes.length]];p.filled=[false,false,false];}
function spawn(g,slot,kind=null){
 if(kind==null){const r=random(g),gold=g.dishes.filter(d=>d.kind===6).length,spicy=g.dishes.filter(d=>d.kind===7).length;
  if(r<(g.rush?.27:.065)&&gold<(g.rush?4:2))kind=6;
  else if(r>.87&&spicy<2)kind=7;
  else{const needed=g.players.flatMap(p=>p.order.filter((_,i)=>!p.filled[i]));kind=needed.length&&random(g)<.62?needed[Math.floor(random(g)*needed.length)]:Math.floor(random(g)*6);}
 }
 g.dishes.push({id:++g.dishSeq,slot,kind,bornAt:g.lastAt,expiresAt:g.lastAt+18000});g.refill[slot]=0;
}
export function startSushi581(g,now,seed=581){
 if(g.phase!=='lobby')return false;g.seed=seed>>>0||581;g.lastAt=now;players580(g);
 const types=[0,1,2,3,4,5];for(let i=5;i>0;i--){const j=Math.floor(random(g)*(i+1));[types[i],types[j]]=[types[j],types[i]];}
 g.recipes=Array.from({length:6},(_,i)=>[types[i],types[(i+1)%6],types[(i+3)%6]]);
 Object.assign(g,{phase:'countdown',phaseAt:now,startAt:now+C.countdown,deadline:now+C.countdown+C.duration,lastAt:now,serverAt:now,round:1,beltAngle:0,direction:1,speed:C.speed,nextReverse:now+C.countdown+22000,rush:false,dishes:[],dishSeq:0,refill:Array(C.slots).fill(0)});
 for(const p of g.players){Object.assign(p,{sets:0,plates:0,golds:0,spicy:0,snatches:0,combo:0,bestCombo:0,fevers:0,feverUntil:0,nextAt:g.startAt,stunUntil:0,snatchAt:g.startAt+2000,botAt:g.startAt+350+random(g)*800,lastEatAt:0});recipe(g,p);}
 [0,1,2,3,4,5,0,1,2,7,6,3].forEach((kind,slot)=>spawn(g,slot,kind));g.updatedAt=now;g.revision++;return true;
}
export function snatchTarget581(g,p){return g.dishes.filter(d=>d.kind!==7&&wanted581(p,d.kind)>=0).sort((a,b)=>(b.kind===6)-(a.kind===6)||Math.abs(wrap(angle581(g,a)-seatAngle581(p.seat)))-Math.abs(wrap(angle581(g,b)-seatAngle581(p.seat)))||a.id-b.id)[0]??null;}
export function canEat581(g,p,at=g.lastAt??g.serverAt){return !!p&&g.phase==='play'&&at>=g.startAt&&at<g.deadline&&at>=p.nextAt&&at>=p.stunUntil;}
export function validSushi581(g,p,m,at=g.lastAt??g.serverAt){
 if(!canEat581(g,p,at))return false;
 if(m.action==='snatch')return false;
 return m.action==='grab'&&Number.isSafeInteger(m.target)&&m.target>0&&reachable581(g,p,g.dishes.find(d=>d.id===m.target),at);
}
export function inputSushi581(g,p,m){
 if(!validSushi581(g,p,m))return false;
 const d=m.action==='snatch'?snatchTarget581(g,p):g.dishes.find(d=>d.id===m.target);if(!d)return false;
 const angle=angle581(g,d),index=wanted581(p,d.kind),before=p.score;
 g.dishes=g.dishes.filter(v=>v.id!==d.id);g.refill[d.slot]=g.lastAt+425;p.lastSeq=Math.max(p.lastSeq,m.seq??0);p.nextAt=g.lastAt+C.grabMs;p.lastEatAt=g.lastAt;
 if(m.action==='snatch'){p.snatchAt=g.lastAt+C.snatchMs;p.snatches++;}
 if(d.kind===7){p.combo=0;p.feverUntil=0;p.score=Math.max(0,p.score-40);p.spicy++;p.stunUntil=g.lastAt+C.spicyMs;p.nextAt=p.stunUntil;emit(g,'spicy',{seat:p.seat,kind:d.kind,angle,value:p.score-before});return true;}
 const hot=fever582(p,g.lastAt),multiplier=hot?2:1,platePoints=(MENU581[d.kind].points+(index>=0?10:0))*multiplier;
 p.plates++;p.score+=platePoints;let complete=false;
 if(d.kind===6)p.golds++;
 if(index>=0){p.filled[index]=true;if(p.filled.every(Boolean)){p.score+=C.setBonus;p.sets++;complete=true;recipe(g,p);}}
 if(!hot){p.combo=index>=0?(p.combo??0)+1:0;p.bestCombo=Math.max(p.bestCombo??0,p.combo);}
 emit(g,m.action==='snatch'?'steal':'eat',{seat:p.seat,kind:d.kind,angle,value:p.score-before,platePoints,multiplier,matched:index>=0,complete,combo:p.combo});if(complete)emit(g,'set',{seat:p.seat,sets:p.sets,value:C.setBonus});
 if(!hot&&p.combo>=C.comboGoal){p.combo=0;p.feverUntil=g.lastAt+C.feverMs;p.fevers=(p.fevers??0)+1;emit(g,'fever',{seat:p.seat,until:p.feverUntil});}return true;
}
function bot(g,p){
 if(g.lastAt<p.botAt||!canEat581(g,p))return null;p.botAt=g.lastAt+700+random(g)*700;
 const inReach=g.dishes.filter(d=>reachable581(g,p,d)),wanted=inReach.filter(d=>d.kind!==7&&wanted581(p,d.kind)>=0).sort((a,b)=>(b.kind===6)-(a.kind===6));
 if(wanted.length)return {action:'grab',target:wanted[Math.floor(random(g)*Math.min(2,wanted.length))].id};
 const spare=inReach.filter(d=>d.kind!==7||random(g)<.014);if(spare.length&&g.lastAt-p.lastEatAt>1300&&random(g)<.38)return {action:'grab',target:spare[Math.floor(random(g)*spare.length)].id};return null;
}
export function advanceSushi581(g,now,inputs=new Map(),auto=new Set()){
 if(['lobby','result'].includes(g.phase))return false;
 const before=g.lastAt;resume580(g,now,inputs,['startAt','deadline','phaseAt','nextReverse'],['nextAt','stunUntil','snatchAt','botAt','lastEatAt','feverUntil']);const shift=g.lastAt-before;
 if(shift){for(const d of g.dishes){d.bornAt+=shift;d.expiresAt+=shift;}g.refill=g.refill.map(at=>at?at+shift:0);}
 let changed=false;
 while(g.lastAt+C.step<=now&&g.phase!=='result'){
  g.lastAt+=C.step;changed=true;
  if(g.phase==='countdown'){inputs.clear();if(g.lastAt<g.startAt)continue;g.phase='play';g.phaseAt=g.lastAt;emit(g,'start');}
  if(g.lastAt>=g.deadline){inputs.clear();finish580(g);break;}
  if(!g.rush&&g.lastAt>=g.deadline-15000){g.rush=true;g.speed=C.rushSpeed;emit(g,'rush');}
  if(g.lastAt>=g.nextReverse){g.direction*=-1;g.nextReverse+=22000;emit(g,'reverse');}
  g.beltAngle=wrap(g.beltAngle+g.direction*g.speed*C.step/1000);
  const actions=[];
  for(const p of g.players){p.auto=p.ai||auto.has(p.playerId);const list=inputs.get(p.playerId)??[];inputs.delete(p.playerId);if(p.auto){const m=bot(g,p);if(m)actions.push({p,m,at:g.lastAt});}else for(const m of list)if(m.round==null||m.round===1)actions.push({p,m,at:m.at??g.lastAt});}
  const priority=Math.floor(g.lastAt/C.step)%4;actions.sort((a,b)=>a.at-b.at||((a.p.seat-priority+4)%4)-((b.p.seat-priority+4)%4)||(a.m.seq??0)-(b.m.seq??0));for(const {p,m} of actions)inputSushi581(g,p,m);
  for(const d of [...g.dishes])if(g.lastAt>=d.expiresAt){g.dishes=g.dishes.filter(v=>v.id!==d.id);g.refill[d.slot]=g.lastAt+250;}
  for(let slot=0;slot<C.slots;slot++)if(g.refill[slot]&&g.lastAt>=g.refill[slot])spawn(g,slot);
 }
 g.serverAt=g.lastAt;g.updatedAt=now;if(changed)g.revision++;return changed;
}
export function publicSushi581(g){return {...publicBase580(g),rules581:g.rules581,nextReverse:g.nextReverse,beltAngle:g.beltAngle,direction:g.direction,speed:g.speed,rush:g.rush,dishes:(g.dishes??[]).map(d=>({...d})),players:g.players.map(({botAt,inputSeq563,...p})=>({...p,order:[...p.order],filled:[...p.filled],lastSeq:Math.max(p.lastSeq,inputSeq563??0)}))};}
export const signature581=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
