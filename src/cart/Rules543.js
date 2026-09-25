import {pair545,box545,surface545,rotate545} from './Collisions545.js';
import {course544,resistance544,parkingBonus544} from './Courses544.js';
import {assignColors499} from '../party/PartyColors499.js';

export const CART543=Object.freeze({step:25,rounds:5,countdown:3500,launchWindow:8500,roundTime:20000,breakTime:3800,chargeTime:1800,width:8.8,edge:30,radius:.58,friction:1.65,maxAngle:Math.PI});
const C=CART543,copy=x=>structuredClone(x);
export const clamp543=(n,a,b)=>Math.max(a,Math.min(b,n));
function random(g){let n=g.seed|0;n^=n<<13;n^=n>>>17;n^=n<<5;g.seed=n>>>0||543;return g.seed/4294967296}
function event(g,type,extra={}){g.events.push({id:++g.eventId,type,at:g.elapsed,...extra});g.events=g.events.slice(-48)}
export function makeCart543({id,code,partyId,hostId,now,members}){return{id,code,game:'cart',rules543:4,partyId462:partyId,hostId,createdAt:now,updatedAt:now,serverAt:now,revision:0,phase:'lobby',members:copy(members),players:[],events:[],eventId:0,elapsed:0,round:0,history:[],results:[],winnerIds:[]}}
function setup(g,now){g.round++;g.roundAt=now+C.countdown;g.phase='countdown';g.phaseAt=now;g.elapsed=0;g.multiplier=g.round===C.rounds?2:1;g.stillAt=null;g.events=[];g.contacts={};g.roundResults=[];
 for(const p of g.players){const lane=(p.seat+g.round-1)%4;Object.assign(p,{x:(lane-1.5)*1.8,y:1.1,vx:0,vy:0,lane,chargeAt:null,pullPower547:0,launched:false,launchAt:null,fallenAt:null,power:null,roundScore:0,lastHitAt:-9999,auto:p.ai,botStart:350+random(g)*4800,aim545:0,bodyAngle545:0,spin545:0,boosted:false,parkedAt:null,parkAnnounced:false,botPower:course544(g).botPower-.075+random(g)*.15});p.aim545=course544(g).blocks.length?(lane<2?-1:1)*(lane===0||lane===3?.12:.32):0;if(course544(g).blocks.length)p.botPower+=(lane===0||lane===3?-.115:-.02);}
 event(g,'round',{round:g.round});
}
export function startCart543(g,now,seed=543){g.rules543=4;g.seed=seed||543;g.players=g.members.filter(m=>!m.departed).map((m,seat)=>({playerId:m.playerId,name:m.name,seat,ai:!!m.ai,color499:m.color499,speciesId:m.choice?.speciesId??'slime',score:0,best:0,perfects:0,bumps:0,falls:0,lastSeq:0}));
 const aiNames=['カート丸','押すなよゴブ','より','おさきに骨さん'];
 while(g.players.length<4){const seat=g.players.length;g.players.push({playerId:'AI-'+g.id+'-'+seat,name:aiNames[seat],seat,ai:true,speciesId:['slime','goblin','wolf','skeleton'][seat],score:0,best:0,perfects:0,bumps:0,falls:0,lastSeq:0})}
 assignColors499(g.players,g.aiColors500??{});g.round=0;g.history=[];g.lastAt=now;setup(g,now);g.updatedAt=now;g.revision++;
}
export function points543(p){if(p.fallenAt!=null||!p.launched)return 0;return Math.round(clamp543((p.y-10)/(C.edge-C.radius-10),0,1)*100)}
export const score543=p=>points543(p)+parkingBonus544(p);
// A local, isolated preview. It never reads opponents or alters the live match.
export function forecast544(g,player,power,angle=player.aim545??0){
 const p={...player,launched:false,fallenAt:null,vx:0,vy:0,boosted:false,parkedAt:null,parkAnnounced:false};
 const trace=[{x:p.x,y:p.y}];p.aim545=angle;
 const preview={phase:'play',round:g.round,elapsed:0,players:[p],events:[],eventId:0,contacts:{}};
 launch543(preview,p,power);
 for(let i=0;i<600&&p.fallenAt==null&&(i===0||Math.hypot(p.vx,p.vy)>=.06);i++){preview.elapsed+=C.step;physics543(preview);if(i%8===0)trace.push({x:p.x,y:p.y})}
 trace.push({x:p.x,y:p.y});return{x:p.x,y:p.y,fallen:p.fallenAt!=null,perfect:parkingBonus544(p)>0,trace};
}
export function launch543(g,p,power){if(g.phase!=='play'||p.launched||p.fallenAt!=null||!Number.isFinite(power))return false;
 p.power=clamp543(power,.08,1);p.launched=true;p.chargeAt=null;p.launchAt=g.elapsed;
 const angle=clamp543(p.aim545??0,-C.maxAngle,C.maxAngle),speed=4.5+7.5*p.power;
 p.vx=speed*Math.sin(angle);p.vy=speed*Math.cos(angle);p.bodyAngle545=angle;p.spin545=0;event(g,'launch',{seat:p.seat,power:p.power,x:p.x,y:p.y});return true;
}
export function input543(g,p,action,at=g.elapsed,angle,power){
 if(g.phase!=='play'||p.launched||p.fallenAt!=null||!Number.isFinite(at)||at<0||at>=C.launchWindow)return false;
 if(action==='cancel'){p.chargeAt=null;p.pullPower547=0;return true}
 if(!['pull','shoot'].includes(action)||!Number.isFinite(angle)||Math.abs(angle)>C.maxAngle||!Number.isFinite(power)||power>(1)||power<(action==='shoot'?.08:0))return false;
 p.aim545=angle;p.pullPower547=power;p.chargeAt=power>0?at:null;
 return action==='shoot'?launch543(g,p,power):true;
}
function fall(g,p){if(p.fallenAt!=null)return;p.fallenAt=g.elapsed;p.falls++;p.chargeAt=null;p.vx=p.vy=0;event(g,'fall',{seat:p.seat,x:p.x,y:p.y})}
export function physics543(g,dt=C.step/1000){const active=g.players.filter(p=>p.launched&&p.fallenAt==null);
 for(const p of active){const v=Math.hypot(p.vx,p.vy),next=Math.max(0,v-resistance544(g,p.y)*dt),ratio=v?next/v:0;
  p.x+=p.vx*dt*(1+ratio)/2;p.y+=p.vy*dt*(1+ratio)/2;p.vx*=ratio;p.vy*=ratio;
  const belt=course544(g).zones.find(z=>z.kind==='boost');
  if(belt&&!p.boosted&&p.vy>0&&p.y>=belt.from&&p.y-p.vy*dt<=belt.to){p.boosted=true;const speed=Math.hypot(p.vx,p.vy),factor=(speed+belt.boost)/speed;p.vx*=factor;p.vy*=factor;event(g,'boost',{seat:p.seat,x:p.x,y:p.y});}

  rotate545(p,dt);
 }
 // Several constraint passes resolve corners and parked carts without injecting energy.
 const wall=C.width/2-C.radius;
 for(let iteration=0;iteration<5;iteration++){
  for(const p of active){
   if(p.x<-wall)surface545(p,1,0,-wall-p.x);if(p.x>wall)surface545(p,-1,0,p.x-wall);if(p.y<C.radius)surface545(p,0,1,C.radius-p.y,.5);
   for(const b of course544(g).blocks){const strength=box545(p,b);if(strength>1&&g.elapsed-(p.blockAt545??-10000)>450){p.blockAt545=g.elapsed;event(g,'block',{seat:p.seat,x:p.x,y:p.y,strength})}}
  }
  for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
   const a=active[i],b=active[j],strength=pair545(a,b),key=[a.seat,b.seat].sort().join(':');
   if(strength>.55&&g.elapsed-(g.contacts[key]??-10000)>400){g.contacts[key]=g.elapsed;a.bumps++;b.bumps++;a.lastHitAt=b.lastHitAt=g.elapsed;event(g,'bump',{a:a.seat,b:b.seat,x:(a.x+b.x)/2,y:(a.y+b.y)/2,strength})}
  }
 }
 for(const p of active){p.x=clamp543(p.x,-C.width/2+C.radius,C.width/2-C.radius);if(p.y+C.radius>=C.edge)fall(g,p);else if(Math.hypot(p.vx,p.vy)<.06){p.vx=p.vy=0;p.parkedAt??=g.elapsed;if(!p.parkAnnounced&&g.elapsed-p.parkedAt>=250){p.parkAnnounced=true;event(g,'park',{seat:p.seat,x:p.x,y:p.y,perfect:parkingBonus544(p)>0,points:score543(p)});}}else{p.parkedAt=null;p.parkAnnounced=false;}}
}
function finishRound(g,now){g.roundResults=g.players.map(p=>{const base=points543(p),bonus=parkingBonus544(p);p.roundScore=(base+bonus)*g.multiplier;if(bonus)p.perfects=(p.perfects??0)+1;p.score+=p.roundScore;p.best=Math.max(p.best,base+bonus);p.vx=p.vy=0;return{seat:p.seat,base,bonus,points:p.roundScore,power:p.power,fallen:p.fallenAt!=null,y:p.y}});g.history.push({round:g.round,multiplier:g.multiplier,results:copy(g.roundResults)});g.phase=g.round===C.rounds?'result':'intermission';g.phaseAt=now;event(g,'score');
 if(g.phase==='result'){const ordered=[...g.players].sort((a,b)=>b.score-a.score||a.seat-b.seat);g.results=ordered.map(p=>({playerId:p.playerId,name:p.name,seat:p.seat,score:p.score,best:p.best,perfects:p.perfects,bumps:p.bumps,falls:p.falls,rank:1+ordered.filter(q=>q.score>p.score).length}));g.winnerIds=g.results.filter(r=>r.rank===1).map(r=>r.playerId)}
}
function step(g,now,inputs,auto){g.elapsed=now-g.roundAt;
 for(const p of g.players){p.auto=p.ai||auto.has(p.playerId);const list=inputs.get(p.playerId)??[];inputs.delete(p.playerId);
  if(!p.auto)for(const a of list)input543(g,p,a.action,a.at-g.roundAt,a.angle,a.power);
  if(!p.launched&&p.auto){if(p.chargeAt==null&&g.elapsed>=p.botStart)p.chargeAt=g.elapsed;if(p.chargeAt!=null&&g.elapsed-p.chargeAt>=p.botPower*C.chargeTime)launch543(g,p,p.botPower)}
  if(!p.launched&&g.elapsed>=C.launchWindow)launch543(g,p,!p.auto&&p.pullPower547>0?p.pullPower547:course544(g).botPower-.10);
 }
 physics543(g);
 const settled=g.players.every(p=>p.launched&&(p.fallenAt!=null||Math.hypot(p.vx,p.vy)<.06));if(settled){g.stillAt??=g.elapsed}else g.stillAt=null;
 if(g.stillAt!=null&&g.elapsed-g.stillAt>=1000||g.elapsed>=C.roundTime)finishRound(g,now);
}
export function advanceCart543(g,now,inputs=new Map(),auto=new Set()){if(['lobby','result'].includes(g.phase))return false;
 const target=Math.min(now,g.lastAt+1000);while(g.lastAt+C.step<=target){g.lastAt+=C.step;if(g.phase==='countdown'){inputs.clear();if(g.lastAt>=g.roundAt){g.phase='play';g.phaseAt=g.lastAt;event(g,'go')}}else if(g.phase==='intermission'){inputs.clear();if(g.lastAt>=g.phaseAt+C.breakTime)setup(g,g.lastAt)}else if(g.phase==='play')step(g,g.lastAt,inputs,auto);else break}
 if(now-g.lastAt>1000){const shift=now-g.lastAt;g.roundAt+=shift;g.phaseAt+=shift;g.lastAt=now;inputs.clear()}
 g.serverAt=now;g.updatedAt=now;g.revision++;return true;
}
export function publicCart543(g,selfId){return{id:g.id,code:g.code,game:'cart',rules543:4,partyId462:g.partyId462,hostId:g.hostId,phase:g.phase,phaseAt:g.phaseAt,revision:g.revision,serverAt:g.serverAt,roundAt:g.roundAt,elapsed:g.elapsed,round:g.round,multiplier:g.multiplier,members:g.members.map(({playerId,name,choice,color499,departed})=>({playerId,name,choice,color499,departed})),players:g.players.map(({botStart,botPower,lastSeq,chargeAt,...p})=>({...p,charging:chargeAt!=null,...(p.playerId===selfId?{lastSeq,chargeAt}:{})})),events:g.events,roundResults:g.roundResults,history:g.history,results:g.results,winnerIds:g.winnerIds}}
export const signature543=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
