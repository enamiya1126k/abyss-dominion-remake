import {initMotor554,canNitro554,fireNitro554,hitMotor554,gainNitro554,gates554,crossGates554,nitroActive554,shiftMotor554,motorAim554,MOTOR554} from './Motor554.js';
import {initRush553,chargeRush553,burst553,canBurst553,overdrive553,queueJackpot553,resolveJackpot553,shiftRush553,publicRush553} from './Rush553.js';
import {CARNIVAL552,carnivalLayout552,initCarnival552,tickCarnival552,pinHit552,rotorContact552,comboHit552,chainMultiplier552,fever552} from './Carnival552.js';
import {ITEMS550,level550 as L,clamp550 as clamp,THEMES550} from './Catalog550.js';
import {assignColors499,color499,validColor499} from '../party/PartyColors499.js';
export const RICOCHET550=Object.freeze({version:5,step:20,width:12,height:18,radius:.49,draft:8000,countdown:0,launch:12500,play:18000,break:0,maxSpeed:95});
const C=RICOCHET550,clone=x=>structuredClone(x);
export function random550(g){let n=g.seed|0;n^=n<<13;n^=n>>>17;n^=n<<5;g.seed=(n>>>0)||550;return g.seed/4294967296}
export function event550(g,type,data={}){g.events.push({id:++g.eventId,type,at:g.simAt,...data});if(g.events.length>60)g.events.splice(0,g.events.length-60)}
export function make550({id,code,partyId,hostId,now,members,mode='pinball'}){if(!ITEMS550[mode])throw Error('Unknown game');return{id,code,game:mode,rules550:5,partyId462:partyId,hostId,members:clone(members),players:[],phase:'lobby',round:0,rounds:8,revision:0,createdAt:now,updatedAt:now,serverAt:now,simAt:now,events:[],eventId:0,history:[],results:[],winnerIds:[]}}
export function start550(g,now,seed=550){g.seed=seed||550;g.rules550=5;g.players=g.members.filter(m=>!m.departed).map((m,seat)=>({playerId:m.playerId,seat,name:m.name,speciesId:m.choice?.speciesId??'slime',color499:m.color499,ai:!!m.ai,score:0,parts:{},charge:0,hits:0,lastSeq:0}));
 const names=['カンカン丸','改造ゴブ','より','ネジ余った骨'];while(g.players.length<4){const seat=g.players.length;g.players.push({playerId:`AI-${g.id}-${seat}`,seat,name:names[seat],speciesId:['slime','goblin','wolf','skeleton'][seat],ai:true,score:0,parts:{},charge:0,hits:0,lastSeq:0})}
 assignColors499(g.players);for(const p of g.players)if(p.ai&&validColor499(g.aiColors500?.[p.seat]))p.color499=color499(g.aiColors500[p.seat]).id;
 g.round=0;g.rounds=g.rounds===16?16:8;g.history=[];g.results=[];g.simAt=now;g.serverAt=now;g.contacts={};g.claimed551={};
 for(const p of g.players)Object.assign(p,{x:(p.seat-1.5)*2.25,y:2,vx:0,vy:0,r:g.game==='junkgp'?.66:C.radius,mass:1,maxY:2,usedBelts:[],walls:0,wallMult:1,luckMult:1,link:0,racing:false,combo:0,comboAt:-1e6});
 if(g.game==='pinball'){initCarnival552(g);initRush553(g);}else initMotor554(g);g.layout=layout550(g);
 draft550(g,now);return g;
}
// World layout is a pure function of position. Rounds never move the road or its obstacles.
export const trackTheme551=y=>Math.max(0,Math.floor(y/72))%THEMES550.length;
export function layout550(g){
 if(g.game==='pinball')return carnivalLayout552();
 const chunks=new Set();for(const p of g.players.length?g.players:[{y:2}])for(let d=-1;d<=2;d++)chunks.add(Math.max(0,Math.floor(p.y/48)+d));
 const posts=[],belts=[],pickups=[];
 for(const chunk of [...chunks].sort((a,b)=>a-b)){const y=chunk*48,lane=(chunk%3-1)*3.3,side=chunk%2?1:-1;
  posts.push({id:chunk*4,x:side*2.8,y:y+(chunk===0?8:13),r:.8},{id:chunk*4+1,x:-side*3.1,y:y+26,r:.72},{id:chunk*4+2,x:0,y:y+40,r:.86});
  if(chunk%3===2)posts.push({id:chunk*4+3,x:side*4.8,y:y+34,r:.7});
  belts.push({id:chunk,x:lane,w:3.8,from:y+(chunk===0?12:18),to:y+(chunk===0?15:21)});
  pickups.push({id:chunk,x:-lane*.8,y:y+32,r:.4,claimed:g.claimed551?.[chunk]??null});
 }
 return{bumpers:[],chests:[],posts,belts,pickups,gates:gates554(g.players)};
}
function draft550(g,at){
 g.round++;g.phase='play';g.phaseAt=at;g.roundAt=at;g.deadline=at+C.play;g.pickDeadline=at+C.draft;g.elapsed=0;g.theme=(g.round-1)%THEMES550.length;g.lucky=Math.floor(random550(g)*8);
 if(!g.layout)g.layout=layout550(g);
 for(const p of g.players){Object.assign(p,{launched:false,pulling:false,pullKind553:null,burstUsed553:false,power:0,angle:0,picked:null,offers:[],roundScore:0,roundHits:0,die:0,rocketFired:false,cometFired:false,botPick:700+random550(g)*1600,botAt:2500+random550(g)*4700});
  const available=ITEMS550[g.game].filter(x=>L(p,x.id)<x.max);while(p.offers.length<3&&available.length){let at=Math.floor(random550(g)*available.length);if(available[at].rarity===3&&random550(g)<.45)at=Math.floor(random550(g)*available.length);p.offers.push(available.splice(at,1)[0].id)}
 }
 g.revision++;event550(g,'round',{round:g.round});
}
export function pick550(g,p,id){if(g.phase!=='play'||p.picked||g.simAt>g.pickDeadline||!p.offers.includes(id)||L(p,id)>=4)return false;p.parts[id]=(p.parts[id]??0)+1;p.picked=id;p.mass=1+L(p,'armor')*.6+(g.game==='junkgp'?L(p,'bumper')*.15:0);event550(g,'pick',{seat:p.seat,item:id});g.revision++;return true}
export function launch550(g,p,power,angle){if(g.phase!=='play'||!p.picked||p.launched||!Number.isFinite(power)||!Number.isFinite(angle)||power<.08||power>1||Math.abs(angle)>Math.PI)return false;
 p.launched=true;p.racing=true;p.launchAt=g.elapsed;p.pulling=false;p.pullKind553=null;p.power=power;p.angle=angle;p.die=L(p,'dice')?1+Math.floor(random550(g)*6):0;
 let speed=7+13*power+21*Math.pow(power,3);
 if(g.game==='pinball'){speed*=1+.18*L(p,'spring');p.luckMult=1+p.die*.25*L(p,'dice')}
 else{speed*=Math.pow(1.16,L(p,'engine'));speed+=g.round*.7*L(p,'bank');if(p.die)speed*=Math.max(.55,1+(p.die-3)*.12*L(p,'dice'));speed/=Math.sqrt(p.mass)}
 const carryX=p.vx,carryY=p.vy,stored=p.charge;p.charge=0;speed+=stored*.16;p.vx+=Math.sin(angle)*speed;p.vy+=Math.cos(angle)*speed;limit550(p);event550(g,'launch',{seat:p.seat,x:p.x,y:p.y,charge:stored,die:p.die,carryX,carryY,vx:p.vx,vy:p.vy});return true;
}
export function input550(g,p,m){if(!p||!Number.isSafeInteger(m.seq)||m.seq<=p.lastSeq||m.round!==g.round)return false;
 if(m.action==='pick'){if(!pick550(g,p,m.item))return false;p.lastSeq=m.seq;return true}
 const burst=['burstPull','burstShoot','burstCancel'].includes(m.action),nitro=['nitroPull','nitroShoot','nitroCancel'].includes(m.action),shoot=['shoot','burstShoot','nitroShoot'].includes(m.action),cancel=['cancel','burstCancel','nitroCancel'].includes(m.action);
 if(nitro?!canNitro554(g,p):burst?!canBurst553(g,p):g.phase!=='play'||!p.picked||p.launched||g.elapsed>=C.launch||!['pull','shoot','cancel'].includes(m.action))return false;
 if(cancel){p.pulling=false;p.pullKind553=null;p.power=0;p.lastSeq=m.seq;return true}
 if(!Number.isFinite(m.angle)||Math.abs(m.angle)>Math.PI||!Number.isFinite(m.power)||m.power>1||m.power<(shoot?.08:0))return false;
 p.angle=m.angle;p.power=m.power;p.pulling=m.power>0;p.pullKind553=nitro?'nitro':burst?'burst':'normal';p.lastSeq=m.seq;
 return shoot?(nitro?fireNitro554(g,p,m.power,m.angle,{limit:limit550,event:event550}):burst?burst553(g,p,m.power,m.angle,{limit:limit550,event:event550}):launch550(g,p,m.power,m.angle)):true;
}
export function limit550(p){const v=Math.hypot(p.vx,p.vy);if(v>C.maxSpeed){p.vx*=C.maxSpeed/v;p.vy*=C.maxSpeed/v}}
function cool(g,key,ms){if(g.simAt-(g.contacts[key]??-1e9)<ms)return false;g.contacts[key]=g.simAt;return true}
export function charge550(p,strength){if(L(p,'cell'))p.charge=Math.min(120,p.charge+strength*.18*L(p,'cell'))}
function hit550(g,p,strength){p.hits++;p.roundHits++;charge550(p,strength);p.combo=g.simAt-p.comboAt<2300?p.combo+1:1;p.comboAt=g.simAt;
 if(g.game==='pinball'){chargeRush553(g,p,strength,event550);comboHit552(g,p,event550);}else hitMotor554(g,p,strength,event550);
 if(g.game==='junkgp'&&p.combo>=3&&p.combo%3===0){p.vy+=3.2;event550(g,'combo',{seat:p.seat,x:p.x,y:p.y,count:p.combo,text:'カンカン '+p.combo+'連鎖！'})}if(p.roundHits>=3&&!p.cometFired&&L(p,g.game==='pinball'?'comet':'coil')){p.cometFired=true;const force=(g.game==='pinball'?5:6)*L(p,g.game==='pinball'?'comet':'coil');if(g.game==='pinball'){const v=Math.hypot(p.vx,p.vy)||1;p.vx+=p.vx/v*force;p.vy+=p.vy/v*force}else p.vy+=force;event550(g,'boost',{seat:p.seat,x:p.x,y:p.y,text:'おかわり噴射！'})}}
function award550(g,p,value,type,x=p.x,y=p.y,extra={}){const combo=g.game==='pinball'?chainMultiplier552(p):1+Math.min(3,Math.floor(p.roundHits/4))*.25,fever=fever552(g)?2:1,rush=g.game==='pinball'&&overdrive553(p,g.simAt)?2:1,mult=p.wallMult*p.luckMult*combo*fever*rush*(p.link||1);const amount=Math.round(value*mult);p.link=0;
 if(type==='jackpot'){queueJackpot553(g,p,amount,x,y,mult,{random:random550,event:event550});return}
 p.roundScore+=amount;event550(g,type,{seat:p.seat,value:amount,x,y,mult,...extra})}
function wall550(g,p,nx,ny,depth,key){p.x+=nx*depth;p.y+=ny*depth;const incoming=p.vx*nx+p.vy*ny;if(incoming>=0)return;const strength=-incoming,e=Math.min(.995,.93+.015*L(p,'mirror'));p.vx-=(1+e)*incoming*nx;p.vy-=(1+e)*incoming*ny;
 if(strength>1&&cool(g,`${p.seat}:w:${key}`,180)){p.walls++;if(g.game==='pinball')p.wallMult=Math.min(8,p.wallMult+.35*L(p,'echo'));else{const k=1+.08*L(p,'spring');p.vx*=k;p.vy*=k}hit550(g,p,strength);event550(g,'wall',{seat:p.seat,x:p.x,y:p.y,strength})}}
export function pair550(g,a,b){let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),r=a.r+b.r;if(d>=r)return 0;if(d<1e-8){dx=a.seat<b.seat?1:-1;dy=0;d=1}const nx=dx/d,ny=dy/d,ia=1/a.mass,ib=1/b.mass,overlap=r-Math.hypot(b.x-a.x,b.y-a.y)+.00001;
 a.x-=nx*overlap*ia/(ia+ib);a.y-=ny*overlap*ia/(ia+ib);b.x+=nx*overlap*ib/(ia+ib);b.y+=ny*overlap*ib/(ia+ib);
 const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel>=0)return 0;const e=Math.min(.995,.89+.023*(L(a,'bumper')+L(b,'bumper')+L(a,'mirror')+L(b,'mirror'))),j=-(1+e)*rel/(ia+ib);a.vx-=j*nx*ia;a.vy-=j*ny*ia;b.vx+=j*nx*ib;b.vy+=j*ny*ib;
 if(-rel>.8&&cool(g,`p:${a.seat}:${b.seat}`,260)){hit550(g,a,-rel);hit550(g,b,-rel);if(g.game==='pinball'){const link=1+Math.max(L(a,'link'),L(b,'link'));a.link=Math.max(a.link,link);b.link=Math.max(b.link,link)}else{a.vy+=3*L(a,'turbo');b.vy+=3*L(b,'turbo')}event550(g,'hit',{seat:a.seat,other:b.seat,x:(a.x+b.x)/2,y:(a.y+b.y)/2,strength:-rel})}return -rel;
}
function bumper550(g,p,b,scoring){let dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy),min=p.r+b.r;if(d>=min)return;if(d<1e-7){dx=0;dy=1;d=1}const nx=dx/d,ny=dy/d;p.x=b.x+nx*min;p.y=b.y+ny*min;const vn=p.vx*nx+p.vy*ny;if(vn>=0)return;const strength=-vn;p.vx-=1.95*vn*nx;p.vy-=1.95*vn*ny;
 if(scoring){const kick=fever552(g)||overdrive553(p,g.simAt)?2.3:.7;p.vx+=nx*kick;p.vy+=ny*kick}
 if(strength>.7&&cool(g,`${p.seat}:${scoring?'b':'post'}:${b.id}`,420)){hit550(g,p,strength);if(scoring)pinHit552(g,p,b,{event:event550,award:award550});else event550(g,'wall',{seat:p.seat,x:p.x,y:p.y,strength})}
}
export function physics550(g,dt=C.step/1000){if(g.game==='junkgp'){g.layout=layout550(g);for(const p of g.players)if(g.simAt-p.comboAt>=2300)p.combo=0;}else{resolveJackpot553(g,event550);tickCarnival552(g);for(const p of g.players)if(g.simAt-p.comboAt>=CARNIVAL552.chainWindow)p.combo=0;}let remaining=dt;while(remaining>1e-9){let max=Math.max(1,...g.players.map(p=>Math.hypot(p.vx,p.vy)));const h=Math.min(remaining,C.radius*.3/(max+6));remaining-=h;
 for(const p of g.players){const v=Math.hypot(p.vx,p.vy);const drag=(g.game==='pinball'?.20:.19*THEMES550[trackTheme551(p.y)].friction*(nitroActive554(p,g.simAt)?.35:1))*Math.pow(.8,L(p,'wheels'))*Math.pow(.9,L(p,'mirror'))+(g.game==='pinball'?Math.max(0,v-38)*.016:0);p.vx*=Math.exp(-drag*h);p.vy*=Math.exp(-drag*h);
  if(g.game==='junkgp'){
   const leader=g.players.reduce((a,b)=>a.y>b.y?a:b),gap=leader.y-p.y;
   // Visible tailwind helps the pack regroup; never teleports or starts a fresh waiting cart.
   p.tailwind=p.racing&&gap>9?Math.min(1,(gap-9)/24):0;
   if(p.tailwind){const target=Math.min(75,Math.max(8,leader.vy)+Math.min(20,gap*.35));p.vy+=(target-p.vy)*p.tailwind*1.7*h;}
  }
  if(g.game==='junkgp'&&p.racing&&L(p,'hook')&&g.players.some(q=>q!==p&&q.y>p.y&&q.y-p.y<5&&Math.abs(q.x-p.x)<2))p.vy+=2*L(p,'hook')*h;
  if(g.game==='pinball'&&L(p,'magnet')&&v>.2){const target=g.layout.chests.filter(b=>b.claimed==null).sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y))[0];if(target){const d=Math.hypot(target.x-p.x,target.y-p.y);if(d>0&&d<3+L(p,'magnet')*.5){p.vx+=(target.x-p.x)/d*2.5*L(p,'magnet')*h;p.vy+=(target.y-p.y)/d*2.5*L(p,'magnet')*h}}}
  const oldX=p.x,oldY=p.y;p.x+=p.vx*h;p.y+=p.vy*h;if(g.game==='junkgp')crossGates554(g,p,oldX,oldY,{event:event550,random:random550,limit:limit550});
  if(g.game==='junkgp')for(const b of g.layout.belts)if(p.y>=b.from&&p.y<=b.to&&Math.abs(p.x-b.x)<b.w/2+p.r*.35&&p.vy>0&&!p.usedBelts.includes(b.id)){p.usedBelts.push(b.id);gainNitro554(g,p,18,event550);p.vy+=7*THEMES550[trackTheme551(p.y)].boost;event550(g,'boost',{seat:p.seat,x:p.x,y:p.y,text:'加速ローラー！'})}
 }
 for(let pass=0;pass<4;pass++){for(const p of g.players){const w=C.width/2-p.r;if(p.x< -w)wall550(g,p,1,0,-w-p.x,'L');if(p.x>w)wall550(g,p,-1,0,p.x-w,'R');if(p.y<p.r)wall550(g,p,0,1,p.r-p.y,'B');if(g.game==='pinball'&&p.y>C.height-p.r)wall550(g,p,0,-1,p.y-C.height+p.r,'T');
  for(const b of g.layout.bumpers)bumper550(g,p,b,true);if(g.game==='pinball')rotorContact552(g,p,{hit:hit550,event:event550,cool});if(g.game==='junkgp')for(const b of g.layout.posts)if(Math.abs(b.y-p.y)<2)bumper550(g,p,b,false);
 }
 for(let i=0;i<g.players.length;i++)for(let j=i+1;j<g.players.length;j++)pair550(g,g.players[i],g.players[j]);}
 for(const p of g.players){limit550(p);if(g.game==='junkgp'&&!nitroActive554(p,g.simAt))gainNitro554(g,p,Math.max(0,p.y-p.maxY)*MOTOR554.travelCharge,event550);p.maxY=Math.max(p.maxY,p.y);if(g.game==='junkgp'){
  p.roundScore=Math.max(0,Math.round((p.maxY-2)*10)-p.score);
  for(const b of g.layout.pickups)if(b.claimed==null&&Math.hypot(p.x-b.x,p.y-b.y)<p.r+b.r){b.claimed=p.seat;g.claimed551[b.id]=p.seat;p.charge=Math.min(120,p.charge+18);gainNitro554(g,p,22,event550);event550(g,'fuel',{seat:p.seat,x:b.x,y:b.y,text:'充電 +18'})}
 }else for(const b of g.layout.chests)if(b.claimed==null&&Math.hypot(p.x-b.x,p.y-b.y)<p.r+b.r){b.claimed=p.seat;b.respawnAt552=g.simAt+10000;award550(g,p,250*(1+.8*L(p,'chest')),'treasure',b.x,b.y)}}
 }}
function bot550(g,p){if(g.game==='junkgp')return motorAim554(g,p,random550);let angle;if(g.game==='pinball'){const candidates=p.gems552===7?g.layout.bumpers.filter(b=>b.kind==='crown'):g.layout.bumpers.filter(b=>b.kind==='gem'&&!(p.gems552&(1<<b.gem)));const b=candidates[Math.floor(random550(g)*candidates.length)];angle=Math.atan2(b.x-p.x,b.y-p.y)+(random550(g)-.5)*.28}else angle=(random550(g)-.5)*.95;return{angle,power:.46+random550(g)*.54}}
function autoPick550(g,p){const sorted=p.offers.map(id=>({id,weight:random550(g)+L(p,id)*.14+(id==='bank'&&g.round<g.rounds/2?.5:0)+(id==='cell'&&L(p,'turbo')?.35:0)})).sort((a,b)=>b.weight-a.weight);if(sorted[0])pick550(g,p,sorted[0].id)}
export function finishRound550(g,at){
 if(g.phase==='result')return;
 resolveJackpot553(g,event550,true);
 const rows=g.players.map(p=>{const investment=g.game==='pinball'?Math.round((12*g.round*g.round+p.roundScore*.15)*L(p,'bank')):0;p.roundScore+=investment;p.score+=p.roundScore;p.pulling=false;return{seat:p.seat,points:p.roundScore,distance:Math.round((p.maxY-2)*10),investment,item:p.picked,hits:p.roundHits,charge:Math.round(p.charge)}});
 g.history.push({round:g.round,rows});g.revision++;
 if(g.round<g.rounds){draft550(g,at);return}
 g.phase='result';g.phaseAt=at;g.deadline=at;g.players.forEach(p=>{p.vx=p.vy=0});event550(g,'score');
 g.results=[...g.players].sort((a,b)=>b.score-a.score||a.seat-b.seat).map(p=>({playerId:p.playerId,seat:p.seat,name:p.name,score:p.score,rank:1+g.players.filter(q=>q.score>p.score).length}));g.winnerIds=g.results.filter(x=>x.rank===1).map(x=>x.playerId);
}
export function advance550(g,now,inputs=[],auto=new Set()){
 if(['lobby','result'].includes(g.phase)){g.serverAt=now;inputs.length=0;return}
 if(now-g.simAt>2000){const shift=now-g.simAt-500;g.simAt+=shift;g.phaseAt+=shift;shiftRush553(g,shift);shiftMotor554(g,shift);if(g.carnival552){g.carnival552.startedAt+=shift;g.carnival552.feverUntil+=shift;g.carnival552.lockUntil+=shift;for(const b of g.layout.chests)if(b.respawnAt552)b.respawnAt552+=shift;}for(const p of g.players)p.comboAt+=shift;g.deadline+=shift;g.pickDeadline+=shift;if(g.roundAt!=null)g.roundAt+=shift}
 while(g.simAt+C.step<=now){g.simAt+=C.step;const at=g.simAt;g.elapsed=at-g.roundAt;
  while(inputs.length&&inputs[0].at<=at){const m=inputs.shift();input550(g,g.players.find(p=>p.playerId===m.playerId),m)}
  for(const p of g.players){
   if(!p.picked&&(((p.ai||auto.has(p.playerId))&&g.elapsed>=p.botPick)||at>=g.pickDeadline))autoPick550(g,p);
   if(!p.launched&&p.picked&&(((p.ai||auto.has(p.playerId))&&g.elapsed>=p.botAt)||g.elapsed>=C.launch)){const bot=bot550(g,p);launch550(g,p,p.pulling?Math.max(.08,p.power):bot.power,p.pulling?p.angle:bot.angle)}
   if((p.ai||auto.has(p.playerId))&&canBurst553(g,p)&&at-p.burstReadyAt553>=900&&g.elapsed-p.launchAt>=1400){const bot=bot550(g,p);burst553(g,p,p.pulling&&p.pullKind553==='burst'?Math.max(.08,p.power):bot.power,p.pulling&&p.pullKind553==='burst'?p.angle:bot.angle,{limit:limit550,event:event550});}
   if((p.ai||auto.has(p.playerId))&&canNitro554(g,p)&&at-p.nitroReadyAt554>=650&&g.elapsed-p.launchAt>=1000){const bot=motorAim554(g,p,random550);fireNitro554(g,p,p.pulling&&p.pullKind553==='nitro'?Math.max(.08,p.power):bot.power,p.pulling&&p.pullKind553==='nitro'?p.angle:bot.angle,{limit:limit550,event:event550});}
   if(g.game==='junkgp'&&p.launched&&!p.rocketFired&&g.elapsed-p.launchAt>=1200&&L(p,'rocket')){p.rocketFired=true;p.vy+=5*L(p,'rocket');event550(g,'boost',{seat:p.seat,x:p.x,y:p.y,text:'ロケット点火！'})}
  }
  physics550(g);if(at>=g.deadline)finishRound550(g,at);if(g.phase==='result')break;
 }
 g.serverAt=now;g.updatedAt=now;
}
export function public550(g,id,{frame=false}={}){const s=clone(g);publicRush553(s);delete s.seed;delete s.contacts;s.members=s.members.map(m=>({playerId:m.playerId,name:m.name,choice:m.choice,ai:!!m.ai,departed:!!m.departed}));for(const p of s.players){delete p.botAt;delete p.botPick;delete p.usedBelts;if(p.playerId!==id)delete p.offers}if(frame){delete s.history;delete s.members;s.layout={...s.layout,posts:[],belts:[]}}return s}
export function signature550(g){if(!g)return null;if(g.phase==='play')return[g.id,'play',g.rules550,g.rounds];return[g.id,g.phase,g.round,g.rounds,g.phase==='lobby'?g.revision:0,g.phase==='result'?g.results:null]}
