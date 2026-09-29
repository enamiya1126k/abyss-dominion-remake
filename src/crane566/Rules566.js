import {assignColors499} from '../party/PartyColors499.js';

export const CRANE566=Object.freeze({version:1,step:25,countdown:3000,duration:90000,grace:10000,reach:17.4,outSpeed:22,emptySpeed:16,reload:350,grabRadius:.24});
export const LOOT566=Object.freeze({
 coin:{name:'金貨',value:1,r:.42,speed:6.2},
 gem:{name:'宝石',value:3,r:.5,speed:4},
 chest:{name:'宝箱',value:7,r:.68,speed:2.6},
 crown:{name:'大宝箱',value:12,r:.8,speed:2.1},
 mimic:{name:'ミミック',value:-4,r:.62,speed:3.5}
});
export const dock566=seat=>({x:[0,8.5,0,-8.5][seat],y:[8.5,0,-8.5,0][seat]});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const random=g=>{let n=g.seed|0;n^=n<<13;n^=n>>>17;n^=n<<5;g.seed=n>>>0||566;return g.seed/4294967296;};
function emit(g,type,data={}){g.events.push({id:++g.eventId,type,at:g.lastAt,...data});g.events=g.events.slice(-60);}
export function makeCrane566({id,code,partyId,hostId,members,now=0}){
 return {id,code,game:'crane',rules566:1,partyId462:partyId,hostId,members:structuredClone(members),createdAt:now,updatedAt:now,serverAt:now,lastAt:now,phase:'lobby',revision:0,round:1,elapsed:0,players:[],loot:[],events:[],eventId:0,results:[],winnerIds:[]};
}
export function spawnLoot566(g,kind=null){
 const types=['coin','gem','chest','gem','coin','chest','gem','mimic'];
 kind??=types[Math.floor(random(g)*types.length)];
 if(kind==='mimic'&&g.loot.filter(v=>v.kind==='mimic').length>=2)kind='gem';
 let a,r,x,y;
 for(let i=0;i<40;i++){a=random(g)*Math.PI*2;r=1.7+random(g)*3.8;x=Math.cos(a)*r;y=Math.sin(a)*r;if(g.loot.every(v=>Math.hypot(v.x-x,v.y-y)>LOOT566[v.kind].r+LOOT566[kind].r+.3))break;}
 const item={id:++g.lootSeq,kind,x,y,a,r,owner:null,lockUntil:0,born:g.lastAt,turn:(random(g)<.5?-1:1)*(.075+random(g)*.035)};
 g.loot.push(item);return item;
}
export function startCrane566(g,now,seed=566){
 if(g.phase!=='lobby')return false;
 g.seed=seed>>>0||566;
 g.players=g.members.filter(m=>!m.departed).map((m,seat)=>({playerId:m.playerId,name:m.name,seat,ai:!!m.ai,color499:m.color499,speciesId:m.choice?.speciesId??'slime'}));
 const names=['お宝スライム','よこどりゴブ','より','欲ばりホネさん'];
 while(g.players.length<4){const seat=g.players.length;g.players.push({playerId:'AI-'+g.id+'-'+seat,name:names[seat],seat,ai:true,speciesId:['slime','goblin','wolf','skeleton'][seat]});}
 assignColors499(g.players,g.aiColors500??{});
 for(const p of g.players)Object.assign(p,{...dock566(p.seat),score:0,caught:0,steals:0,robbed:0,bites:0,shots:0,lastSeq:0,nextAt:now+C.countdown,stunUntil:0,hook:null,auto:p.ai,botAt:now+C.countdown+400+random(g)*1100});
 Object.assign(g,{phase:'countdown',phaseAt:now,startAt:now+C.countdown,deadline:now+C.countdown+C.duration,lastAt:now,serverAt:now,elapsed:0,loot:[],lootSeq:0,events:[],eventId:0,nextSpawn:now+C.countdown+1800,nextCrown:now+C.countdown+18000,final:false,turn:1,results:[],winnerIds:[]});
 for(const kind of ['chest','chest','gem','gem','gem','coin','coin','gem','mimic','mimic'])spawnLoot566(g,kind);
 g.updatedAt=now;g.revision++;return true;
}
const C=CRANE566;
export function canCast566(g,p,at=g?.lastAt){return !!p&&g?.phase==='play'&&at>=g.startAt&&at<g.deadline&&!p.hook&&at>=p.nextAt;}
export function validCast566(g,p,m,at=g.lastAt){return m.action==='cast'&&m.shot===p?.shots&&Number.isFinite(m.angle)&&Math.abs(m.angle)<=Math.PI&&canCast566(g,p,at);}
export function inputCrane566(g,p,m){
 if(!validCast566(g,p,m))return false;
 p.hook={x:p.x,y:p.y,angle:m.angle,travel:0,phase:'out',itemId:null};p.shots++;p.lastSeq=Math.max(p.lastSeq,m.seq??0);
 emit(g,'cast',{seat:p.seat,x:p.x,y:p.y});return true;
}
// Exact swept-circle contact between two moving bodies: no tunnelling or seat-first capture.
export function contact566(a,b,item,oldItem,r){
 const x=a.x-oldItem.x,y=a.y-oldItem.y,dx=b.x-a.x-(item.x-oldItem.x),dy=b.y-a.y-(item.y-oldItem.y),c=x*x+y*y-r*r;
 if(c<=0)return 0;const aa=dx*dx+dy*dy;if(aa<1e-12)return null;
 const bb=2*(x*dx+y*dy),disc=bb*bb-4*aa*c;if(disc<0)return null;
 const t=(-bb-Math.sqrt(disc))/(2*aa);return t>=0&&t<=1?t:null;
}
function take(g,p,item){
 const previous=item.owner;
 if(previous!=null){const victim=g.players[previous];if(victim.hook?.itemId===item.id){victim.hook.itemId=null;victim.robbed++;}p.steals++;}
 item.owner=p.seat;item.lockUntil=g.lastAt+250;p.hook.phase='back';p.hook.itemId=item.id;
 // Keep the treasure at the contact point so a steal never teleports it across the table.
 item.x=p.hook.x;item.y=p.hook.y;
 emit(g,previous==null?'grab':'steal',{seat:p.seat,from:previous,itemId:item.id,kind:item.kind,x:item.x,y:item.y,value:LOOT566[item.kind].value});
}
function bank(g,p,item){
 const spec=LOOT566[item.kind],before=p.score;p.score=Math.max(0,p.score+spec.value);
 if(item.kind==='mimic'){p.bites++;p.stunUntil=g.lastAt+1200;p.nextAt=p.stunUntil;}
 else{p.caught++;p.nextAt=g.lastAt+C.reload;}
 g.loot=g.loot.filter(v=>v.id!==item.id);
 emit(g,item.kind==='mimic'?'bite':'bank',{seat:p.seat,kind:item.kind,x:p.x,y:p.y,value:p.score-before});
}
function predicted(g,item,seconds){
 if(item.owner!=null){const dock=g.players[item.owner],d=distance(dock,item),travel=Math.min(d,LOOT566[item.kind].speed*seconds);return {x:item.x+(dock.x-item.x)/Math.max(d,.001)*travel,y:item.y+(dock.y-item.y)/Math.max(d,.001)*travel};}
 const a=item.a+item.turn*g.turn*seconds;return {x:Math.cos(a)*item.r,y:Math.sin(a)*item.r};
}
export function thinkCrane566(g,p){
 if(!canCast566(g,p)||g.lastAt<p.botAt)return;
 p.botAt=g.lastAt+450+random(g)*700;
 const leader=Math.max(...g.players.map(q=>q.score));
 const choices=g.loot.filter(v=>v.owner!==p.seat&&v.lockUntil<=g.lastAt&&(v.kind!=='mimic'||random(g)<.035)).map(v=>{
  let point=v;for(let i=0;i<3;i++)point=predicted(g,v,distance(p,point)/C.outSpeed);
  const d=distance(p,point),value=LOOT566[v.kind].value;
  return {v,point,merit:value/(1+d/LOOT566[v.kind].speed)*(.7+random(g)*.6)+(v.owner!=null?2.4+(g.players[v.owner].score===leader?1.2:0):0)};
 }).sort((a,b)=>b.merit-a.merit);
 if(!choices.length)return;
 const q=choices[random(g)<.16&&choices.length>1?1:0],error=(random(g)-.5)*(random(g)<.15?.18:.045);
 const angle=Math.atan2(q.point.y-p.y,q.point.x-p.x)+error;
 inputCrane566(g,p,{action:'cast',shot:p.shots,angle:Math.atan2(Math.sin(angle),Math.cos(angle))});
}
export function physicsCrane566(g,dt=C.step/1000){
 const before=new Map(g.loot.map(v=>[v.id,{x:v.x,y:v.y}])),sweeps=[];
 for(const v of g.loot)if(v.owner==null){v.a+=v.turn*g.turn*dt;v.x=Math.cos(v.a)*v.r;v.y=Math.sin(v.a)*v.r;}
 for(const p of g.players){
  const h=p.hook;if(!h)continue;const from={x:h.x,y:h.y};
  if(h.phase==='out'){
   const move=Math.min(C.outSpeed*dt,C.reach-h.travel);h.travel+=move;h.x+=Math.cos(h.angle)*move;h.y+=Math.sin(h.angle)*move;
   sweeps.push({p,from,to:{x:h.x,y:h.y}});
  }else{
   const item=g.loot.find(v=>v.id===h.itemId&&v.owner===p.seat),d=distance(p,h),step=Math.min(d,(item?LOOT566[item.kind].speed:C.emptySpeed)*dt);
   h.x+=(p.x-h.x)/Math.max(d,.001)*step;h.y+=(p.y-h.y)/Math.max(d,.001)*step;
   if(item){item.x=h.x;item.y=h.y;}
  }
 }
 const hits=[];
 for(const s of sweeps)for(const item of g.loot){
  if(item.owner===s.p.seat||item.lockUntil>g.lastAt)continue;
  // The last half-unit belongs to the receiving dock; bank after simultaneous contacts.
  if(item.owner!=null&&distance(item,g.players[item.owner])<.55)continue;
  const t=contact566(s.from,s.to,item,before.get(item.id),LOOT566[item.kind].r+C.grabRadius);
  if(t!=null)hits.push({...s,item,t});
 }
 const priority=Math.floor(g.lastAt/C.step)%4;
 hits.sort((a,b)=>a.t-b.t||((a.p.seat-priority+4)%4)-((b.p.seat-priority+4)%4)||a.item.id-b.item.id);
 for(const hit of hits){
  const {p,item,from,to,t}=hit;if(p.hook?.phase!=='out'||item.lockUntil>g.lastAt)continue;
  p.hook.x=from.x+(to.x-from.x)*t;p.hook.y=from.y+(to.y-from.y)*t;take(g,p,item);
 }
 for(const p of g.players){
  const h=p.hook;if(!h)continue;
  if(h.phase==='out'&&(h.travel>=C.reach||Math.abs(h.x)>9.3||Math.abs(h.y)>9.3))h.phase='back';
  if(h.phase==='back'&&distance(p,h)<.35){const item=g.loot.find(v=>v.id===h.itemId&&v.owner===p.seat);if(item)bank(g,p,item);else p.nextAt=g.lastAt+C.reload;p.hook=null;p.botAt=Math.max(p.botAt,p.nextAt+250+random(g)*650);}
 }
}
export function finishCrane566(g){
 if(g.phase==='result')return;
 const order=[...g.players].sort((a,b)=>b.score-a.score||a.seat-b.seat);
 g.results=order.map(p=>({seat:p.seat,playerId:p.playerId,score:p.score,rank:1+order.filter(q=>q.score>p.score).length,steals:p.steals,bites:p.bites}));g.winnerIds=g.results.filter(r=>r.rank===1).map(r=>r.playerId);
 g.phase='result';g.phaseAt=g.lastAt;g.revision++;emit(g,'finish',{winners:g.winnerIds});
}
export function advanceCrane566(g,now,inputs=new Map(),auto=new Set()){
 if(['lobby','result'].includes(g.phase))return false;
 // Suspended hosts / server restarts shift the clock, never fast-forward an unattended match.
 if(now-g.lastAt>1000){const shift=now-g.lastAt-C.step;for(const key of ['startAt','deadline','phaseAt','nextSpawn','nextCrown'])g[key]+=shift;for(const p of g.players)for(const key of ['nextAt','stunUntil','botAt'])p[key]+=shift;for(const v of g.loot)v.lockUntil+=shift;g.lastAt+=shift;inputs.clear();}
 let changed=false;
 while(g.lastAt+C.step<=now&&g.phase!=='result'){
  g.lastAt+=C.step;g.elapsed=Math.max(0,g.lastAt-g.startAt);changed=true;
  if(g.phase==='countdown'){inputs.clear();if(g.lastAt<g.startAt)continue;g.phase='play';g.phaseAt=g.lastAt;emit(g,'start');}
  if(g.phase==='play'&&g.lastAt>=g.deadline){g.phase='resolve';g.phaseAt=g.lastAt;inputs.clear();emit(g,'closing');}
  for(const p of g.players){
   p.auto=p.ai||auto.has(p.playerId);const list=inputs.get(p.playerId)??[];inputs.delete(p.playerId);
   if(p.auto)thinkCrane566(g,p);else for(const m of list){p.lastSeq=Math.max(p.lastSeq,m.seq??0);inputCrane566(g,p,m);}
  }
  physicsCrane566(g);
  if(g.phase==='play'){
   const nextTurn=Math.floor(g.elapsed/25000)%2?-1:1;if(nextTurn!==g.turn){g.turn=nextTurn;emit(g,'reverse');}
   if(g.lastAt>=g.nextSpawn&&g.loot.length<12){spawnLoot566(g);g.nextSpawn=g.lastAt+1500;}
   if(g.lastAt>=g.nextCrown){if(g.loot.length<14&&g.loot.filter(v=>v.kind==='crown').length<2){spawnLoot566(g,'crown');emit(g,'crown');}g.nextCrown=g.lastAt+(g.final?6000:19000);}
   if(!g.final&&g.elapsed>=C.duration-15000){g.final=true;g.nextCrown=g.lastAt;emit(g,'final');}
  }else if(!g.players.some(p=>p.hook)||g.lastAt>=g.deadline+C.grace)finishCrane566(g);
 }
 g.serverAt=g.lastAt;g.updatedAt=now;if(changed)g.revision++;return changed;
}
export function publicCrane566(g){
 const {seed,aiColors500,...rest}=g;
 return {...rest,members:g.members.map(({playerId,name,choice,color499,departed})=>({playerId,name,choice:choice?{id:choice.id,speciesId:choice.speciesId}:null,color499,departed})),players:g.players.map(({botAt,inputSeq563,...p})=>({...p,lastSeq:Math.max(p.lastSeq,inputSeq563??0),hook:p.hook?{...p.hook}:null})),loot:g.loot.map(v=>({...v})),events:g.events.map(v=>({...v}))};
}
export const signature566=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
