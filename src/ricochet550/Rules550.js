import {ARENA555,layout555,initArena555,canShoot555,stepRotor555,rotorContact555,laneCross555,shiftArena555} from './Arena555.js';
import {initRush553,chargeRush553,burst553,canBurst553,overdrive553,queueJackpot553,resolveJackpot553,shiftRush553,publicRush553} from './Rush553.js';
import {CARNIVAL552,initCarnival552,tickCarnival552,pinHit552,collectGem555,comboHit552,chainMultiplier552,fever552} from './Carnival552.js';
import {ITEMS550,level550 as L} from './Catalog550.js';
import {assignColors499,color499,validColor499} from '../party/PartyColors499.js';
export const RICOCHET550=Object.freeze({version:6,step:20,width:16,height:18.4,radius:.49,draft:7000,launch:90000,play:90000,maxSpeed:95});
const C=RICOCHET550,clone=x=>structuredClone(x);
export function random550(g){let n=g.seed|0;n^=n<<13;n^=n>>>17;n^=n<<5;g.seed=(n>>>0)||555;return g.seed/4294967296}
export function event550(g,type,data={}){g.events.push({id:++g.eventId,type,at:g.simAt,...data});if(g.events.length>100)g.events.splice(0,g.events.length-100)}
export function make550({id,code,partyId,hostId,now,members,mode='pinball'}){if(mode!=='pinball')throw Error('このゲームは終了しました');return{id,code,game:'pinball',rules550:6,partyId462:partyId,hostId,members:clone(members),players:[],phase:'lobby',round:1,rounds:1,duration555:90000,revision:0,createdAt:now,updatedAt:now,serverAt:now,simAt:now,events:[],eventId:0,history:[],results:[],winnerIds:[]}}
export function start550(g,now,seed=555){
 if(g.game!=='pinball')throw Error('このゲームは終了しました');g.seed=seed||555;g.rules550=6;g.duration555=g.duration555===150000?150000:90000;
 g.players=g.members.filter(m=>!m.departed).map((m,seat)=>({playerId:m.playerId,seat,name:m.name,speciesId:m.choice?.speciesId??'slime',color499:m.color499,ai:!!m.ai}));
 const names=['カンカン丸','ねらうゴブ','より','ホネスピン'];while(g.players.length<4){const seat=g.players.length;g.players.push({playerId:`AI-${g.id}-${seat}`,seat,name:names[seat],speciesId:['slime','goblin','wolf','skeleton'][seat],ai:true})}
 assignColors499(g.players);for(const p of g.players)if(p.ai&&validColor499(g.aiColors500?.[p.seat]))p.color499=color499(g.aiColors500[p.seat]).id;
 Object.assign(g,{phase:'play',phaseAt:now,roundAt:now,round:1,rounds:1,deadline:now+g.duration555,pickDeadline:now+C.draft,elapsed:0,theme:0,history:[],results:[],events:[],eventId:0,simAt:now,serverAt:now,contacts:{}});
 for(const p of g.players)Object.assign(p,{score:0,roundScore:0,parts:{},charge:0,hits:0,roundHits:0,lastSeq:0,x:(p.seat-1.5)*3.8,y:1.6,vx:0,vy:0,r:C.radius,mass:1,maxY:1.6,walls:0,wallMult:1,luckMult:1,link:0,racing:false,combo:0,comboAt:-1e6,launched:false,pulling:false,pullKind553:null,power:0,angle:0,picked:null,offers:[],botAt555:now+1700+random550(g)*1800});
 initCarnival552(g);initRush553(g);initArena555(g);g.layout=layout550(g);for(const p of g.players)offer555(g,p);g.revision++;event550(g,'start');return g;
}
export const layout550=()=>layout555();
export const trackTheme551=()=>0; // Archived renderer compatibility; GP cannot be created.
function offer555(g,p){const available=ITEMS550.pinball.filter(x=>L(p,x.id)<x.max);p.offers=[];while(p.offers.length<3&&available.length)p.offers.push(available.splice(Math.floor(random550(g)*available.length),1)[0].id);p.offerId555++;p.offerUntil555=g.simAt+C.draft;p.botPick555=g.simAt+600+random550(g)*1300;}
export function pick550(g,p,id,offerId=p.offerId555){const item=ITEMS550.pinball.find(x=>x.id===id);if(g.phase!=='play'||g.simAt>p.offerUntil555||offerId!==p.offerId555||!p.offers.includes(id)||!item||L(p,id)>=item.max)return false;p.parts[id]=L(p,id)+1;p.picked=id;p.offers=[];event550(g,'pick',{seat:p.seat,item:id});g.revision++;return true}
export function launch550(g,p,power,angle){if(!canShoot555(g,p)||!Number.isFinite(power)||!Number.isFinite(angle)||power<.08||power>1||Math.abs(angle)>Math.PI)return false;
 const carryX=p.vx,carryY=p.vy,stored=p.charge,speed=(7+13*power+21*power**3)*(1+.15*L(p,'spring'))+stored*.10;
 p.launched=true;p.racing=true;p.launchAt=g.elapsed;p.shots555++;p.nextShotAt555=g.simAt+ARENA555.reload;p.pulling=false;p.pullKind553=null;p.power=power;p.angle=angle;p.charge=0;
 p.vx+=Math.sin(angle)*speed;p.vy+=Math.cos(angle)*speed;limit550(p);event550(g,'launch',{seat:p.seat,x:p.x,y:p.y,charge:stored,carryX,carryY,vx:p.vx,vy:p.vy,shot:p.shots555});return true;
}
export function input550(g,p,m){if(!p||!Number.isSafeInteger(m.seq)||m.seq<=p.lastSeq||m.round!==1)return false;
 if(m.action==='pick'){if(!pick550(g,p,m.item,m.offerId))return false;p.lastSeq=m.seq;return true}
 const burst=['burstPull','burstShoot','burstCancel'].includes(m.action),shoot=['shoot','burstShoot'].includes(m.action),cancel=['cancel','burstCancel'].includes(m.action);
 if(!['pull','shoot','cancel','burstPull','burstShoot','burstCancel'].includes(m.action)||m.shot!==(burst?p.bursts553:p.shots555)||(burst?!canBurst553(g,p):!canShoot555(g,p)))return false;
 if(cancel){p.pulling=false;p.pullKind553=null;p.power=0;p.lastSeq=m.seq;return true}
 if(!Number.isFinite(m.angle)||Math.abs(m.angle)>Math.PI||!Number.isFinite(m.power)||m.power>1||m.power<(shoot?.08:0))return false;
 p.angle=m.angle;p.power=m.power;p.pulling=m.power>0;p.pullKind553=burst?'burst':'normal';p.lastSeq=m.seq;
 return shoot?(burst?burst553(g,p,m.power,m.angle,{limit:limit550,event:event550}):launch550(g,p,m.power,m.angle)):true;
}
export function limit550(p){const v=Math.hypot(p.vx,p.vy);if(v>C.maxSpeed){p.vx*=C.maxSpeed/v;p.vy*=C.maxSpeed/v}}
function cool(g,key,ms){if(g.simAt-(g.contacts[key]??-1e9)<ms)return false;g.contacts[key]=g.simAt;return true}
export function charge550(p,strength){if(L(p,'cell'))p.charge=Math.min(120,p.charge+strength*.15*L(p,'cell'))}
function hit550(g,p,strength){p.hits++;p.roundHits++;charge550(p,strength);p.combo=g.simAt-p.comboAt<CARNIVAL552.chainWindow?p.combo+1:1;p.comboAt=g.simAt;chargeRush553(g,p,strength,event550);comboHit552(g,p,event550);}
export function award550(g,p,value,type,x=p.x,y=p.y,extra={}){
 if(type==='jackpot'){const mult=(fever552(g)||overdrive553(p,g.simAt)?2:1)*(1+.25*L(p,'crown'));queueJackpot553(g,p,Math.round(value*mult),x,y,mult,{random:random550,event:event550});return;}
 const mult=extra.fixed?1:Math.min(4,p.wallMult*chainMultiplier552(p)*(fever552(g)?2:1)*(overdrive553(p,g.simAt)?2:1)),amount=Math.round(value*mult);p.wallMult=1;p.roundScore+=amount;p.breakdown555[type]=(p.breakdown555[type]??0)+amount;event550(g,type,{seat:p.seat,value:amount,x,y,mult,...extra});
}
function wall550(g,p,nx,ny,depth,key){p.x+=nx*depth;p.y+=ny*depth;const incoming=p.vx*nx+p.vy*ny;if(incoming>=0)return;const strength=-incoming,e=Math.min(.96,.91+.01*L(p,'mirror'));p.vx-=(1+e)*incoming*nx;p.vy-=(1+e)*incoming*ny;
 if(strength>1&&cool(g,`${p.seat}:w:${key}`,180)){p.walls++;p.wallMult=Math.min(1.75,p.wallMult+.25*L(p,'echo'));hit550(g,p,strength);event550(g,'wall',{seat:p.seat,x:p.x,y:p.y,strength})}}
export function pair550(g,a,b){let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),r=a.r+b.r;if(d>=r)return 0;if(d<1e-8){dx=a.seat<b.seat?1:-1;dy=0;d=1}const nx=dx/d,ny=dy/d,ia=1/a.mass,ib=1/b.mass,overlap=r-Math.hypot(b.x-a.x,b.y-a.y)+.00001;
 a.x-=nx*overlap*ia/(ia+ib);a.y-=ny*overlap*ia/(ia+ib);b.x+=nx*overlap*ib/(ia+ib);b.y+=ny*overlap*ib/(ia+ib);
 const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel>=0)return 0;const impulse=-1.88*rel/(ia+ib);a.vx-=impulse*nx*ia;a.vy-=impulse*ny*ia;b.vx+=impulse*nx*ib;b.vy+=impulse*ny*ib;
 if(-rel>.8&&cool(g,`p:${a.seat}:${b.seat}`,240)){hit550(g,a,-rel);hit550(g,b,-rel);event550(g,'hit',{seat:a.seat,other:b.seat,x:(a.x+b.x)/2,y:(a.y+b.y)/2,strength:-rel})}return -rel;
}
function obstacle555(g,p,x,y,r,key,b){let dx=p.x-x,dy=p.y-y,d=Math.hypot(dx,dy),min=p.r+r;if(d>=min)return;if(d<1e-7){dx=1;dy=0;d=1}const nx=dx/d,ny=dy/d;p.x=x+nx*(min+.00001);p.y=y+ny*(min+.00001);const vn=p.vx*nx+p.vy*ny;if(vn>=0)return;const strength=-vn;p.vx-=1.9*vn*nx;p.vy-=1.9*vn*ny;
 if(b){const kick=fever552(g)?1:.35;p.vx+=nx*kick;p.vy+=ny*kick}
 if(strength>.7&&cool(g,`${p.seat}:${key}`,b?400:180)){hit550(g,p,strength);if(b)pinHit552(g,p,b,{event:event550,award:award550});else event550(g,'wall',{seat:p.seat,x:p.x,y:p.y,strength})}
}
export function physics550(g,dt=C.step/1000){resolveJackpot553(g,event550);tickCarnival552(g);for(const p of g.players)if(g.simAt-p.comboAt>=CARNIVAL552.chainWindow)p.combo=0;let remaining=dt;
 while(remaining>1e-9){const tip=Math.abs(g.carnival552.rotor555.omega)*ARENA555.rotorHalf,max=Math.max(1,...g.players.map(p=>Math.hypot(p.vx,p.vy))),h=Math.min(remaining,C.radius*.25/(max+tip+1));remaining-=h;stepRotor555(g,h,event550,award550);
  for(const p of g.players){const v=Math.hypot(p.vx,p.vy),drag=.48*Math.pow(.9,L(p,'mirror'))+Math.max(0,v-46)*.014;p.vx*=Math.exp(-drag*h);p.vy*=Math.exp(-drag*h);const oldX=p.x,oldY=p.y;p.x+=p.vx*h;p.y+=p.vy*h;laneCross555(g,p,oldX,oldY,{event:event550,award:award550,gem:collectGem555});}
  for(let pass=0;pass<4;pass++){for(const p of g.players){const w=C.width/2-p.r;if(p.x< -w)wall550(g,p,1,0,-w-p.x,'L');if(p.x>w)wall550(g,p,-1,0,p.x-w,'R');if(p.y<p.r)wall550(g,p,0,1,p.r-p.y,'B');if(p.y>C.height-p.r)wall550(g,p,0,-1,p.y-C.height+p.r,'T');
   for(const rail of g.layout.rails)obstacle555(g,p,rail.x,Math.max(rail.from,Math.min(rail.to,p.y)),rail.r,'rail'+rail.x);
   for(const b of g.layout.bumpers)obstacle555(g,p,b.x,b.y,b.r,'pin'+b.id,b);rotorContact555(g,p,{hit:hit550,event:event550,cool});
  }for(let i=0;i<g.players.length;i++)for(let j=i+1;j<g.players.length;j++)pair550(g,g.players[i],g.players[j]);}
  for(const p of g.players)limit550(p);
 }
}
export function bot555(g,p){const crown=g.layout.bumpers.find(b=>b.kind==='crown'),missing=g.layout.bumpers.filter(b=>b.kind==='gem'&&!(p.gems552&(1<<b.gem)));let target;
 if(p.gems552===7)target=crown;else if(Math.abs(p.x)>5.8)target={x:Math.sign(p.x)*6.8,y:p.y<3.2?4:17};else if(p.y<3.0&&random550(g)<.32)target={x:p.x<0?-6.8:6.8,y:3.4};else if(random550(g)<.24)target={x:random550(g)<.5?-2.4:2.4,y:ARENA555.rotorY};else target=missing[Math.floor(random550(g)*missing.length)]??crown;
 return{angle:Math.atan2(target.x-p.x,target.y-p.y)+(random550(g)-.5)*.18,power:.36+random550(g)*.56};}
function autoPick555(g,p){if(p.offers.length)pick550(g,p,p.offers[Math.floor(random550(g)*p.offers.length)],p.offerId555)}
export function finishRound550(g,at){if(g.phase==='result')return;resolveJackpot553(g,event550,true);for(const p of g.players){p.score+=p.roundScore;p.roundScore=0;p.pulling=false;p.vx=p.vy=0;}g.history=[];g.phase='result';g.phaseAt=at;g.deadline=at;g.revision++;event550(g,'score');g.results=[...g.players].sort((a,b)=>b.score-a.score||a.seat-b.seat).map(p=>({playerId:p.playerId,seat:p.seat,name:p.name,score:p.score,rank:1+g.players.filter(q=>q.score>p.score).length}));g.winnerIds=g.results.filter(x=>x.rank===1).map(x=>x.playerId);}
export function advance550(g,now,inputs=[],auto=new Set()){
 if(['lobby','result'].includes(g.phase)){g.serverAt=now;inputs.length=0;return}
 if(now-g.simAt>2000){const shift=now-g.simAt-500;g.simAt+=shift;g.phaseAt+=shift;g.roundAt+=shift;g.deadline+=shift;g.pickDeadline+=shift;shiftRush553(g,shift);shiftArena555(g,shift);g.carnival552.startedAt+=shift;g.carnival552.feverUntil+=shift;g.carnival552.lockUntil+=shift;for(const p of g.players){p.comboAt+=shift;p.botAt555+=shift;p.botPick555+=shift;}}
 while(g.simAt+C.step<=now){g.simAt+=C.step;const at=g.simAt;g.elapsed=at-g.roundAt;
  if(at>=g.deadline){finishRound550(g,at);inputs.length=0;break;}
  while(inputs.length&&inputs[0].at<=at){const m=inputs.shift();input550(g,g.players.find(p=>p.playerId===m.playerId),m);}
  if(at>=g.session555.nextSupply){g.session555.nextSupply+=ARENA555.supply;g.session555.supplyCount++;for(const p of g.players)offer555(g,p);event550(g,'supply',{text:'能力が届いた！ 走りながら選べるよ'});g.revision++;}
  for(const p of g.players){const isAuto=p.ai||auto.has(p.playerId);if(p.offers.length&&(at>=p.offerUntil555||isAuto&&at>=p.botPick555))autoPick555(g,p);
   if(isAuto&&at>=p.botAt555){const aim=bot555(g,p);if(canBurst553(g,p))burst553(g,p,aim.power,aim.angle,{event:event550,limit:limit550});else if(canShoot555(g,p))launch550(g,p,aim.power,aim.angle);p.botAt555=at+2800+random550(g)*1400;}
   if(!p.launched&&p.picked&&!isAuto&&g.elapsed>=8000){const aim=bot555(g,p);launch550(g,p,p.pulling?Math.max(.08,p.power):aim.power,p.pulling?p.angle:aim.angle);}
  }physics550(g);
 }g.serverAt=now;g.updatedAt=now;
}
export function public550(g,id,{frame=false}={}){const s=clone(g);publicRush553(s);delete s.seed;delete s.contacts;s.members=s.members.map(m=>({playerId:m.playerId,name:m.name,choice:m.choice,ai:!!m.ai,departed:!!m.departed}));for(const p of s.players){delete p.botAt555;delete p.botPick555;if(p.playerId!==id)delete p.offers;}if(frame){delete s.history;delete s.members;}return s;}
export function signature550(g){if(!g)return null;return g.phase==='play'?[g.id,'play',g.rules550]:[g.id,g.phase,g.duration555,g.phase==='lobby'?g.revision:0,g.phase==='result'?g.results:null];}
