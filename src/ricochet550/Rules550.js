import {ITEMS550,level550 as L,clamp550 as clamp,THEMES550} from './Catalog550.js';
import {assignColors499,color499,validColor499} from '../party/PartyColors499.js';
export const RICOCHET550=Object.freeze({version:1,step:20,width:12,height:21,radius:.49,draft:12000,countdown:2400,launch:6500,play:14500,break:4200,maxSpeed:95});
const C=RICOCHET550,clone=x=>structuredClone(x);
export function random550(g){let n=g.seed|0;n^=n<<13;n^=n>>>17;n^=n<<5;g.seed=(n>>>0)||550;return g.seed/4294967296}
export function event550(g,type,data={}){g.events.push({id:++g.eventId,type,at:g.simAt,...data});if(g.events.length>60)g.events.splice(0,g.events.length-60)}
export function make550({id,code,partyId,hostId,now,members,mode='pinball'}){if(!ITEMS550[mode])throw Error('Unknown game');return{id,code,game:mode,rules550:1,partyId462:partyId,hostId,members:clone(members),players:[],phase:'lobby',round:0,rounds:8,revision:0,createdAt:now,updatedAt:now,serverAt:now,simAt:now,events:[],eventId:0,history:[],results:[],winnerIds:[]}}
export function start550(g,now,seed=550){g.seed=seed||550;g.rules550=1;g.players=g.members.filter(m=>!m.departed).map((m,seat)=>({playerId:m.playerId,seat,name:m.name,speciesId:m.choice?.speciesId??'slime',color499:m.color499,ai:!!m.ai,score:0,parts:{},charge:0,hits:0,lastSeq:0}));
 const names=['カンカン丸','改造ゴブ','より','ネジ余った骨'];while(g.players.length<4){const seat=g.players.length;g.players.push({playerId:`AI-${g.id}-${seat}`,seat,name:names[seat],speciesId:['slime','goblin','wolf','skeleton'][seat],ai:true,score:0,parts:{},charge:0,hits:0,lastSeq:0})}
 assignColors499(g.players);for(const p of g.players)if(p.ai&&validColor499(g.aiColors500?.[p.seat]))p.color499=color499(g.aiColors500[p.seat]).id;
 g.round=0;g.rounds=g.rounds===16?16:8;g.history=[];g.results=[];g.simAt=now;g.serverAt=now;draft550(g,now);return g;
}
export function layout550(g){
 if(g.game==='pinball')return{bumpers:[[-3.3,7,.78],[3.3,7,.78],[0,10,1],[-3.2,13.1,.78],[3.2,13.1,.78],[-1.8,17,.78],[1.8,17,.78],[0,19,.62]].map(([x,y,r],id)=>({id,x,y,r,value:(id===2?100:50)*(id===g.lucky?2:1)})),chests:[[-4.2,18.6],[4.2,18.6],[0,14.4]].map(([x,y],id)=>({id,x,y,r:.48,claimed:null})),posts:[],belts:[]};
 const offset=(g.round%3)*3;return{bumpers:[],chests:[],posts:Array.from({length:65},(_,i)=>({id:i,x:(i%3-1)*3.15,y:23+i*19+offset,r:.72})),belts:Array.from({length:28},(_,i)=>({id:i,from:17+i*43,to:19.2+i*43}))};
}
function draft550(g,at){g.round++;g.phase='draft';g.phaseAt=at;g.deadline=at+C.draft;g.elapsed=0;g.contacts={};g.events=[];g.theme=(g.round-1)%THEMES550.length;g.lucky=Math.floor(random550(g)*8);g.layout=layout550(g);
 for(const p of g.players){const lane=(p.seat+g.round-1)%4;Object.assign(p,{x:(lane-1.5)*2.25,y:2,vx:0,vy:0,r:g.game==='junkgp'?.6:C.radius,mass:1+L(p,'armor')*.6+(g.game==='junkgp'?L(p,'bumper')*.15:0),launched:false,pulling:false,power:0,angle:0,picked:null,offers:[],roundScore:0,roundHits:0,walls:0,wallMult:1,die:0,luckMult:1,link:0,maxY:2,rocketFired:false,cometFired:false,usedBelts:[],botPick:900+random550(g)*1800,botAt:600+random550(g)*4400});
  const available=ITEMS550[g.game].filter(x=>L(p,x.id)<x.max);while(p.offers.length<3&&available.length){let at=Math.floor(random550(g)*available.length);if(available[at].rarity===3&&random550(g)<.45)at=Math.floor(random550(g)*available.length);p.offers.push(available.splice(at,1)[0].id)}
 }
 g.revision++;event550(g,'draft',{round:g.round});
}
export function pick550(g,p,id){if(g.phase!=='draft'||p.picked||!p.offers.includes(id))return false;p.parts[id]=(p.parts[id]??0)+1;p.picked=id;p.mass=1+L(p,'armor')*.6+(g.game==='junkgp'?L(p,'bumper')*.15:0);event550(g,'pick',{seat:p.seat,item:id});g.revision++;return true}
export function launch550(g,p,power,angle){if(g.phase!=='play'||p.launched||!Number.isFinite(power)||!Number.isFinite(angle)||power<.08||power>1||Math.abs(angle)>Math.PI)return false;
 p.launched=true;p.launchAt=g.elapsed;p.pulling=false;p.power=power;p.angle=angle;p.die=L(p,'dice')?1+Math.floor(random550(g)*6):0;
 let speed=7+13*power+21*Math.pow(power,3);
 if(g.game==='pinball'){speed*=1+.18*L(p,'spring');p.luckMult=1+p.die*.25*L(p,'dice')}
 else{speed*=Math.pow(1.16,L(p,'engine'));speed+=g.round*.7*L(p,'bank');if(p.die)speed*=Math.max(.55,1+(p.die-3)*.12*L(p,'dice'));speed/=Math.sqrt(p.mass)}
 const carryX=p.vx,carryY=p.vy,stored=p.charge;p.charge=0;speed+=stored*.16;p.vx+=Math.sin(angle)*speed;p.vy+=Math.cos(angle)*speed;limit550(p);event550(g,'launch',{seat:p.seat,x:p.x,y:p.y,charge:stored,die:p.die,carryX,carryY,vx:p.vx,vy:p.vy});return true;
}
export function input550(g,p,m){if(!p||!Number.isSafeInteger(m.seq)||m.seq<=p.lastSeq||m.round!==g.round)return false;
 if(m.action==='pick'){if(!pick550(g,p,m.item))return false;p.lastSeq=m.seq;return true}
 if(g.phase!=='play'||p.launched||g.elapsed>=C.launch||!['pull','shoot','cancel'].includes(m.action))return false;
 if(m.action==='cancel'){p.pulling=false;p.power=0;p.lastSeq=m.seq;return true}
 if(!Number.isFinite(m.angle)||Math.abs(m.angle)>Math.PI||!Number.isFinite(m.power)||m.power>1||m.power<(m.action==='shoot'?.08:0))return false;
 p.angle=m.angle;p.power=m.power;p.pulling=m.power>0;p.lastSeq=m.seq;return m.action==='shoot'?launch550(g,p,m.power,m.angle):true;
}
export function limit550(p){const v=Math.hypot(p.vx,p.vy);if(v>C.maxSpeed){p.vx*=C.maxSpeed/v;p.vy*=C.maxSpeed/v}}
function cool(g,key,ms){if(g.simAt-(g.contacts[key]??-1e9)<ms)return false;g.contacts[key]=g.simAt;return true}
export function charge550(p,strength){if(L(p,'cell'))p.charge=Math.min(120,p.charge+strength*.18*L(p,'cell'))}
function hit550(g,p,strength){p.hits++;p.roundHits++;charge550(p,strength);if(p.roundHits>=3&&!p.cometFired&&L(p,g.game==='pinball'?'comet':'coil')){p.cometFired=true;const force=(g.game==='pinball'?5:6)*L(p,g.game==='pinball'?'comet':'coil');if(g.game==='pinball'){const v=Math.hypot(p.vx,p.vy)||1;p.vx+=p.vx/v*force;p.vy+=p.vy/v*force}else p.vy+=force;event550(g,'boost',{seat:p.seat,x:p.x,y:p.y,text:'おかわり噴射！'})}}
function award550(g,p,value,type,x=p.x,y=p.y){const combo=1+Math.min(3,Math.floor(p.roundHits/4))*.25;const amount=Math.round(value*p.wallMult*p.luckMult*combo*(p.link||1));p.link=0;p.roundScore+=amount;event550(g,type,{seat:p.seat,value:amount,x,y,mult:p.wallMult*p.luckMult*combo})}
function wall550(g,p,nx,ny,depth,key){p.x+=nx*depth;p.y+=ny*depth;const incoming=p.vx*nx+p.vy*ny;if(incoming>=0)return;const strength=-incoming,e=Math.min(.995,.93+.015*L(p,'mirror'));p.vx-=(1+e)*incoming*nx;p.vy-=(1+e)*incoming*ny;
 if(strength>1&&cool(g,`${p.seat}:w:${key}`,180)){p.walls++;if(g.game==='pinball')p.wallMult=Math.min(8,p.wallMult+.35*L(p,'echo'));else{const k=1+.08*L(p,'spring');p.vx*=k;p.vy*=k}hit550(g,p,strength);event550(g,'wall',{seat:p.seat,x:p.x,y:p.y,strength})}}
export function pair550(g,a,b){let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),r=a.r+b.r;if(d>=r)return 0;if(d<1e-8){dx=a.seat<b.seat?1:-1;dy=0;d=1}const nx=dx/d,ny=dy/d,ia=1/a.mass,ib=1/b.mass,overlap=r-Math.hypot(b.x-a.x,b.y-a.y)+.00001;
 a.x-=nx*overlap*ia/(ia+ib);a.y-=ny*overlap*ia/(ia+ib);b.x+=nx*overlap*ib/(ia+ib);b.y+=ny*overlap*ib/(ia+ib);
 const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel>=0)return 0;const e=Math.min(.995,.89+.023*(L(a,'bumper')+L(b,'bumper')+L(a,'mirror')+L(b,'mirror'))),j=-(1+e)*rel/(ia+ib);a.vx-=j*nx*ia;a.vy-=j*ny*ia;b.vx+=j*nx*ib;b.vy+=j*ny*ib;
 if(-rel>.8&&cool(g,`p:${a.seat}:${b.seat}`,260)){hit550(g,a,-rel);hit550(g,b,-rel);if(g.game==='pinball'){const link=1+Math.max(L(a,'link'),L(b,'link'));a.link=Math.max(a.link,link);b.link=Math.max(b.link,link)}else{a.vy+=3*L(a,'turbo');b.vy+=3*L(b,'turbo')}event550(g,'hit',{seat:a.seat,other:b.seat,x:(a.x+b.x)/2,y:(a.y+b.y)/2,strength:-rel})}return -rel;
}
function bumper550(g,p,b,scoring){let dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy),min=p.r+b.r;if(d>=min)return;if(d<1e-7){dx=0;dy=1;d=1}const nx=dx/d,ny=dy/d;p.x=b.x+nx*min;p.y=b.y+ny*min;const vn=p.vx*nx+p.vy*ny;if(vn>=0)return;const strength=-vn;p.vx-=1.95*vn*nx;p.vy-=1.95*vn*ny;
 if(scoring){p.vx+=nx*2.3;p.vy+=ny*2.3}
 if(strength>.7&&cool(g,`${p.seat}:${scoring?'b':'post'}:${b.id}`,420)){hit550(g,p,strength);if(scoring)award550(g,p,(b.value+40*L(p,'spark'))*Math.pow(1.35,L(p,'crown')),'pin',b.x,b.y);else event550(g,'wall',{seat:p.seat,x:p.x,y:p.y,strength})}
}
export function physics550(g,dt=C.step/1000){let remaining=dt;while(remaining>1e-9){let max=Math.max(1,...g.players.map(p=>Math.hypot(p.vx,p.vy)));const h=Math.min(remaining,C.radius*.3/(max+6));remaining-=h;
 for(const p of g.players){const v=Math.hypot(p.vx,p.vy);const drag=(g.game==='pinball'?.095:.19)*THEMES550[g.theme].friction*Math.pow(.8,L(p,'wheels'))*Math.pow(.9,L(p,'mirror'));p.vx*=Math.exp(-drag*h);p.vy*=Math.exp(-drag*h);
  if(g.game==='junkgp'&&p.launched&&L(p,'hook')&&g.players.some(q=>q!==p&&q.y>p.y&&q.y-p.y<5&&Math.abs(q.x-p.x)<2))p.vy+=2*L(p,'hook')*h;
  if(g.game==='pinball'&&L(p,'magnet')&&v>.2){const target=g.layout.chests.filter(b=>b.claimed==null).sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y))[0];if(target){const d=Math.hypot(target.x-p.x,target.y-p.y);if(d>0&&d<3+L(p,'magnet')*.5){p.vx+=(target.x-p.x)/d*2.5*L(p,'magnet')*h;p.vy+=(target.y-p.y)/d*2.5*L(p,'magnet')*h}}}
  p.x+=p.vx*h;p.y+=p.vy*h;
  if(g.game==='junkgp')for(const b of g.layout.belts)if(p.y>=b.from&&p.y<=b.to&&p.vy>0&&!p.usedBelts.includes(b.id)){p.usedBelts.push(b.id);p.vy+=6*THEMES550[g.theme].boost;event550(g,'boost',{seat:p.seat,x:p.x,y:p.y,text:'速達便！'})}
 }
 for(let pass=0;pass<4;pass++){for(const p of g.players){const w=C.width/2-p.r;if(p.x< -w)wall550(g,p,1,0,-w-p.x,'L');if(p.x>w)wall550(g,p,-1,0,p.x-w,'R');if(p.y<p.r)wall550(g,p,0,1,p.r-p.y,'B');if(g.game==='pinball'&&p.y>C.height-p.r)wall550(g,p,0,-1,p.y-C.height+p.r,'T');
  for(const b of g.layout.bumpers)bumper550(g,p,b,true);if(g.game==='junkgp')for(const b of g.layout.posts)if(Math.abs(b.y-p.y)<2)bumper550(g,p,b,false);
 }
 for(let i=0;i<g.players.length;i++)for(let j=i+1;j<g.players.length;j++)pair550(g,g.players[i],g.players[j]);}
 for(const p of g.players){limit550(p);p.maxY=Math.max(p.maxY,p.y);if(g.game==='junkgp')p.roundScore=Math.max(0,Math.round((p.maxY-2)*10));else for(const b of g.layout.chests)if(b.claimed==null&&Math.hypot(p.x-b.x,p.y-b.y)<p.r+b.r){b.claimed=p.seat;award550(g,p,250*(1+.8*L(p,'chest'))*(g.theme===2?2:1),'treasure',b.x,b.y)}}
 }}
function bot550(g,p){let angle;if(g.game==='pinball'){const b=g.layout.bumpers[Math.floor(random550(g)*g.layout.bumpers.length)];angle=Math.atan2(b.x-p.x,b.y-p.y)+(random550(g)-.5)*.28}else angle=(random550(g)-.5)*.95;return{angle,power:.46+random550(g)*.54}}
function autoPick550(g,p){const sorted=p.offers.map(id=>({id,weight:random550(g)+L(p,id)*.14+(id==='bank'&&g.round<g.rounds/2?.5:0)+(id==='cell'&&L(p,'turbo')?.35:0)})).sort((a,b)=>b.weight-a.weight);if(sorted[0])pick550(g,p,sorted[0].id)}
export function finishRound550(g,at){const rows=g.players.map(p=>{const investment=g.game==='pinball'?12*g.round*g.round*L(p,'bank'):0;p.roundScore+=investment;p.score+=p.roundScore;p.vx=p.vy=0;p.pulling=false;return{seat:p.seat,points:p.roundScore,investment,item:p.picked,hits:p.roundHits,charge:Math.round(p.charge)}});g.history.push({round:g.round,rows});g.phase=g.round===g.rounds?'result':'intermission';g.phaseAt=at;g.deadline=at+C.break;g.revision++;event550(g,'score');
 if(g.phase==='result'){g.results=[...g.players].sort((a,b)=>b.score-a.score||a.seat-b.seat).map(p=>({playerId:p.playerId,seat:p.seat,name:p.name,score:p.score,rank:1+g.players.filter(q=>q.score>p.score).length}));g.winnerIds=g.results.filter(x=>x.rank===1).map(x=>x.playerId)}
}
export function advance550(g,now,inputs=[],auto=new Set()){
 if(['lobby','result'].includes(g.phase)){g.serverAt=now;inputs.length=0;return}
 if(now-g.simAt>2000){const shift=now-g.simAt-500;g.simAt+=shift;g.phaseAt+=shift;g.deadline+=shift;if(g.roundAt!=null)g.roundAt+=shift}
 while(g.simAt+C.step<=now){g.simAt+=C.step;const at=g.simAt;
  while(inputs.length&&inputs[0].at<=at){const m=inputs.shift();input550(g,g.players.find(p=>p.playerId===m.playerId),m)}
  if(g.phase==='draft'){for(const p of g.players)if(!p.picked&&((p.ai||auto.has(p.playerId))&&at-g.phaseAt>=p.botPick||at>=g.deadline))autoPick550(g,p);if(g.players.every(p=>p.picked)&&at-g.phaseAt>=1400){g.phase='countdown';g.phaseAt=at;g.deadline=at+C.countdown;g.revision++}}
  else if(g.phase==='countdown'&&at>=g.deadline){g.phase='play';g.phaseAt=at;g.roundAt=at;g.deadline=at+C.play;g.elapsed=0;g.revision++;event550(g,'go')}
  else if(g.phase==='play'){g.elapsed=at-g.roundAt;for(const p of g.players){if(!p.launched&&((p.ai||auto.has(p.playerId))&&g.elapsed>=p.botAt||g.elapsed>=C.launch)){const bot=bot550(g,p);launch550(g,p,p.pulling?Math.max(.08,p.power):bot.power,p.pulling?p.angle:bot.angle)}if(g.game==='junkgp'&&p.launched&&!p.rocketFired&&g.elapsed-p.launchAt>=1200&&L(p,'rocket')){p.rocketFired=true;p.vy+=5*L(p,'rocket');event550(g,'boost',{seat:p.seat,x:p.x,y:p.y,text:'ロケット点火！'})}}physics550(g);if(at>=g.deadline)finishRound550(g,at)}
  else if(g.phase==='intermission'&&at>=g.deadline)draft550(g,at);
  if(g.phase==='result')break;
 }
 g.serverAt=now;g.updatedAt=now;
}
export function public550(g,id,{frame=false}={}){const s=clone(g);delete s.seed;delete s.contacts;s.members=s.members.map(m=>({playerId:m.playerId,name:m.name,choice:m.choice,ai:!!m.ai,departed:!!m.departed}));for(const p of s.players){delete p.botAt;delete p.botPick;delete p.usedBelts;if(p.playerId!==id)delete p.offers}if(frame){delete s.history;delete s.members;s.layout={...s.layout,posts:[],belts:[]}}return s}
export function signature550(g){if(!g)return null;return[g.id,g.phase,g.round,g.rounds,g.phase==='lobby'?g.revision:0,g.phase==='draft'?g.players.map(p=>p.picked):null,g.phase==='result'?g.results:null]}
