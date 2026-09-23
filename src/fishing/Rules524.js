import {waterScale526,waterBounds526,clampWater526,fishAim526,available526,landingDuration526,retrievalPoint526} from './Water526.js';
import {CATCHES525,selectCatch525,canChain525} from './Catches525.js';
import {freezeColors501} from '../party/GameColors501.js';
export const FISH524=Object.freeze({duration:120000,lordChance526:.65,lordWindow526:16000,grace:10000,countdown:3000,step:50,finale:5200,maxRod:6});
export const SPECIES524=Object.freeze(CATCHES525.slice(0,5));
export const clamp524=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=g=>{let x=g.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.seed=x>>>0;return g.seed/4294967296};
const event=(g,type,data={})=>{g.events.push({id:++g.eventSeq,type,at:g.elapsed,...data});if(g.events.length>36)g.events.shift()};
export const rod524=p=>Math.min(6,1+Math.floor(p.caught/2));
export function fishPose524(shoal,t){const depth=waterScale526(shoal.y),x=shoal.x+Math.sin(t/5200+shoal.id)*.042*depth,y=shoal.y+Math.cos(t/6700+shoal.id)*.02*depth;return clampWater526(x,y,.012)}
export function targetFish526(g,x,y){const candidates=g.shoals.filter(s=>available526(s,g.elapsed)).map(s=>({s,pos:fishPose524(s,g.elapsed)}));for(const row of candidates)row.distance=fishAim526(row.pos,x,y);return candidates.filter(row=>row.distance<=1).sort((a,b)=>a.distance-b.distance)[0]??null}
function lordSchedule526(g,exhausted=false){return{phase:exhausted?'gone':'hidden',at:!exhausted&&rnd(g)<FISH524.lordChance526?42000+Math.floor(rnd(g)*50000):null,ownerId:null}}
function lordOutcome526(g,p,phase){if(p.fish?.tier!==4||!g.lord526||g.lord526.ownerId!==p.playerId)return;g.lord526.phase=phase;g.boss=false;event(g,phase==='caught'?'lordCaught':'lordGone',{seat:p.seat})}
function updateLord526(g){const lord=g.lord526;if(lord.phase==='hidden'&&lord.at!=null&&g.elapsed>=lord.at){spawn(g,4);const s=g.shoals.at(-1);s.expiresAt526=g.elapsed+FISH524.lordWindow526;Object.assign(lord,{phase:'visible',appearedAt:g.elapsed,expiresAt:s.expiresAt526,shoalId:s.id});g.boss=true;event(g,'lord',{x:s.x,y:s.y});g.revision++}if(lord.phase==='visible'&&g.elapsed>=lord.expiresAt){g.shoals=g.shoals.filter(s=>s.tier!==4);lord.phase='gone';g.boss=false;event(g,'lordGone')}}

export function mood524(p,t){if(p.mode!=='fight')return'calm';const phase=((t-p.hookedAt+p.fish.rhythm)%6600+6600)%6600;return phase<2600?'calm':phase<3400?'warn':phase<4700?'surge':'tired'}
export function makeFishing524({id,code,partyId,hostId,members,now=0}){return{id,code,game:'fishing',rules524:3,partyId462:partyId,hostId,members:members.map(m=>({...m})),phase:'lobby',revision:0,createdAt:now,updatedAt:now,players:[],shoals:[],events:[],eventSeq:0}}
function spawn(g,tier=null){const id=++g.shoalSeq,v=rnd(g),y=.19+rnd(g)*.53,b=waterBounds526(y);g.shoals.push({id,tier:tier??(v<.42?0:v<.79?1:v<.96?2:3),x:b.left+.065+rnd(g)*(b.right-b.left-.13),y,readyAt:0})}
export function startFishing524(g,now,seed=524){if(g.phase!=='lobby')return false;g.seed=seed>>>0||524;while(g.members.length<4){const i=g.members.length;g.members.push({playerId:`AI-${g.id}-${i}`,name:`AI ${i+1}`,ai:true,choice:{speciesId:['slime','wolf','goblin','skeleton'][i]}})}freezeColors501(g.members,[],g.aiColors500??{});
 g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,seat,speciesId:m.choice.speciesId,color499:m.color499,ai:!!m.ai,auto:!!m.ai,mode:'idle',score:0,caught:0,bait:0,rod:1,records:[],chainTrail525:[],bestChain525:0,misses:0,lastSeq:0,reel:false,nextAI:0,castX:.5,castY:.4,progress:0,tension:0}));
 Object.assign(g,{phase:'countdown',startAt:now+3000,lastAt:now,elapsed:0,shoals:[],shoalSeq:0,events:[],eventSeq:0,boss:false});for(let i=0;i<8;i++)spawn(g);g.lord526=lordSchedule526(g);g.revision++;return true;
}
function catchSpec(g,tier,bait,previous=null){const spec=selectCatch525(tier,()=>rnd(g),{bait,previous}),variation=.8+rnd(g)*.4,depth=previous?Math.min(6,(previous.chainDepth525??0)+1):0,boost=previous?.lure525 ? .7 : previous ? .88 : bait ? .8 : 1;return{...spec,kg:Math.round(spec.kg*variation*10)/10,value:Math.round(spec.base*variation*(1+depth*.12)),difficulty:spec.difficulty*boost,baited:!!bait,rhythm:Math.floor(rnd(g)*1800),chainDepth525:depth,chainFrom525:previous?.id??null,lureBoost525:!!previous?.lure525}}
export function continue525(g,p){const previous=p.fish;if(g.phase!=='play'||g.elapsed>=FISH524.duration||p.mode!=='choice'||!canChain525(previous))return false;const fish=catchSpec(g,previous.tier,true,previous);Object.assign(p,{mode:'waiting',castAt:g.elapsed,biteAt:g.elapsed+1000+rnd(g)*900,reel:false,fish,progress:0,tension:0});event(g,'chain',{seat:p.seat,from:{...previous},depth:fish.chainDepth525,x:p.castX,y:p.castY});return true}
export function cast524(g,p,x,y,useBait=false){if(g.phase!=='play'||g.elapsed>=FISH524.duration||p.mode!=='idle'||!Number.isFinite(x)||!Number.isFinite(y))return false;({x,y}=clampWater526(x,y));
 const target=targetFish526(g,x,y);let tier=target?.s.tier??0;
 if(target){if(tier===4){if(g.lord526?.phase!=='visible')return false;Object.assign(g.lord526,{phase:'hooked',ownerId:p.playerId});g.shoals=g.shoals.filter(s=>s.id!==target.s.id);event(g,'lordClaim',{seat:p.seat,x,y})}else target.s.readyAt=g.elapsed+6000}
 const bait=useBait&&p.bait>0;if(bait)p.bait--;if(bait&&tier<3&&rnd(g)<.55)tier++;
 Object.assign(p,{mode:'waiting',chainTrail525:[],castAt:g.elapsed,biteAt:g.elapsed+1700+rnd(g)*1800,castX:x,castY:y,reel:false,fish:catchSpec(g,tier,bait),progress:0,tension:0});event(g,'cast',{seat:p.seat,x,y});return true;
}
export function choose524(g,p,kind){if(p.mode!=='choice'||!['keep','bait','continue'].includes(kind))return false;const fish=p.fish;if(fish.baitOnly525&&kind==='keep')return false;if(kind==='continue'){if(g.elapsed<FISH524.duration)return continue525(g,p);if(!fish.baitOnly525)return false;kind='bait'}const keep=kind==='keep'||fish.tier===4||fish.terminal525;if(!keep&&p.bait>=3&&!fish.baitOnly525)return false;if(keep){p.score+=fish.value;p.records.push({id:fish.id,name:fish.name,tier:fish.tier,kg:fish.kg,value:fish.value,color:fish.color,art525:fish.art525,chainDepth525:fish.chainDepth525??0});p.records=p.records.slice(-24)}else p.bait=Math.min(3,p.bait+(fish.tier>=2?2:1));event(g,keep?'keep':'bait',{seat:p.seat,fish:{...fish}});Object.assign(p,{mode:'rest',restUntil:g.elapsed+550,reel:false});return true}
function lose(g,p,reason){lordOutcome526(g,p,'gone');p.misses++;p.mode='rest';p.restUntil=g.elapsed+1100;p.reel=false;event(g,'escape',{seat:p.seat,reason,x:p.castX,y:p.castY})}
export function fight524(g,p,dt=.05){if(p.mode!=='fight')return;const mood=mood524(p,g.elapsed),surge=mood==='surge',rod=rod524(p),strength=1+(rod-1)*.15;
 if(p.reel){p.progress+=.22*strength/p.fish.difficulty*(surge?.27:mood==='tired'?1.2:1)*dt;p.tension+=(surge?.68:mood==='warn'?.28:.135)*p.fish.difficulty/(1+(rod-1)*.085)*dt}
 else{p.tension-=(surge?.15:.36)*dt;p.progress-=(surge?.039:.018)*dt}
 p.tension=clamp524(p.tension,0,1);p.progress=clamp524(p.progress,0,1);
 if(p.tension>=1){lose(g,p,'snap');return}if(g.elapsed-p.hookedAt>32000||p.progress<=0&&g.elapsed-p.hookedAt>10000){lose(g,p,'gone');return}
 if(p.progress>=1){lordOutcome526(g,p,'caught');p.mode='landing';p.landedAt=g.elapsed;p.reel=false;p.caught++;p.rod=rod524(p);p.chainTrail525=[...(p.chainTrail525??[]),p.fish.id].slice(-7);p.bestChain525=Math.max(p.bestChain525??0,p.fish.chainDepth525??0);event(g,'land',{seat:p.seat,fish:{...p.fish},...retrievalPoint526(p,1)});return}
}
// Ordinary opponents have a reaction delay, occasional mistakes, and time between casts.
// AI gets the same progress, tension and catch rules as a human.
export function botFishing524(g,p){
 const bot=p.bot526??={mode:null,readyAt:0,lag:550+rnd(g)*550,lapseUntil:0,lapseReel:false,lordDelay:2600+rnd(g)*2200};
 if(bot.mode!==p.mode){bot.mode=p.mode;bot.readyAt=g.elapsed+(p.mode==='idle'?1300+rnd(g)*1700:p.mode==='choice'?900+rnd(g)*1300:p.mode==='fight'?bot.lag:0);p.nextAI=bot.readyAt}
 if(g.elapsed<bot.readyAt||g.elapsed<p.nextAI)return;p.nextAI=g.elapsed+380+rnd(g)*400;
 if(p.mode==='idle'){
  const visible=g.shoals.filter(s=>available526(s,g.elapsed));
  const boss=visible.find(s=>s.tier===4&&g.elapsed-(g.lord526?.appearedAt??g.elapsed)>=bot.lordDelay);
  const ordinary=visible.filter(s=>s.tier<4&&s.tier<=Math.min(3,rod524(p)+(p.bait?1:0)));
  const target=boss&&rnd(g)<.5?boss:ordinary[Math.floor(rnd(g)*ordinary.length)];
  if(target){const pos=fishPose524(target,g.elapsed),spread=target.tier===4?.038:.055;cast524(g,p,pos.x+(rnd(g)-.5)*spread,pos.y+(rnd(g)-.5)*spread*.7,p.bait>0&&rnd(g)<.6)}
 }
 if(p.mode==='fight'){
  if(g.elapsed<bot.lapseUntil){p.reel=bot.lapseReel;return}
  if(rnd(g)<.1){bot.lapseUntil=g.elapsed+650+rnd(g)*750;bot.lapseReel=rnd(g)<.62;p.reel=bot.lapseReel;return}
  const mood=mood524(p,Math.max(p.hookedAt,g.elapsed-bot.lag));p.reel=mood!=='surge'&&mood!=='warn'&&p.tension<.74;
 }
 if(p.mode==='choice'){const f=p.fish,chain=canChain525(f)&&(f.baitOnly525||f.id==='boot'||f.id==='lure'||f.chainDepth525>0&&g.elapsed<104000&&rnd(g)<.72||g.elapsed<65000&&rnd(g)<.25);choose524(g,p,chain?'continue':f.baitOnly525?'bait':g.elapsed<60000&&p.bait<2&&f.tier<2&&rnd(g)<.4?'bait':'keep')}
}
export function finishFishing524(g){if(g.phase==='result')return;for(const p of g.players){if(['landing','choice'].includes(p.mode)){p.mode='choice';choose524(g,p,p.fish?.baitOnly525?'bait':'keep')}else if(p.mode==='fight')lose(g,p,'time');p.reel=false}
 g.shoals=g.shoals.filter(s=>s.tier!==4);if(g.lord526&&['visible','hooked'].includes(g.lord526.phase))g.lord526.phase='gone';g.boss=false;const best=Math.max(...g.players.map(p=>p.score));g.winnerIds=g.players.filter(p=>p.score===best).map(p=>p.playerId);g.results=[...g.players].sort((a,b)=>b.score-a.score||Math.max(0,...b.records.map(f=>f.kg))-Math.max(0,...a.records.map(f=>f.kg))).map(p=>({playerId:p.playerId,rank:1+g.players.filter(q=>q.score>p.score).length,score:p.score,caught:p.caught,bestChain525:p.bestChain525??0,biggest:[...p.records].sort((a,b)=>b.kg-a.kg)[0]??null,boss:p.records.filter(f=>f.tier===4).length}));Object.assign(g,{phase:'result',finaleUntil:g.lastAt+FISH524.finale});g.revision++;event(g,'finish');
}
export function advanceFishing524(g,now,inputs=new Map(),autoIds=new Set()){
 if(!['countdown','play'].includes(g.phase))return false;if(g.rules524!==3||!g.lord526){const active=g.players.find(p=>['waiting','fight','landing'].includes(p.mode)&&p.fish?.tier===4),exhausted=g.boss||g.players.some(p=>p.records?.some(f=>f.tier===4));g.rules524=3;g.shoals=g.shoals.filter(s=>s.tier!==4);g.lord526=active?{phase:'hooked',at:null,ownerId:active.playerId}:lordSchedule526(g,!!exhausted||g.elapsed>92000);g.boss=!!active;for(const p of g.players){p.chainTrail525??=[];p.bestChain525??=0;p.bot526=null}}if(now<g.startAt){g.lastAt=now;return false}if(g.phase==='countdown'){g.phase='play';g.lastAt=g.startAt;g.revision++}
 if(now-g.lastAt>600){const delay=now-g.lastAt-100;g.lastAt+=delay;g.startAt+=delay}
 let steps=0;while(g.lastAt+50<=now&&g.phase==='play'&&steps++<12){g.lastAt+=50;g.elapsed=g.lastAt-g.startAt;
  updateLord526(g);
  for(const p of g.players)p.auto=p.ai||autoIds.has(p.playerId);
  // Honor received human casts before AI decisions; arrival order decides competing casts.
  const pending=g.players.filter(p=>!p.auto&&inputs.has(p.playerId)).sort((a,b)=>{const aa=inputs.get(a.playerId),bb=inputs.get(b.playerId);return (aa.castReceivedAt526??aa.receivedAt??0)-(bb.castReceivedAt526??bb.receivedAt??0)||(aa.castOrder526??0)-(bb.castOrder526??0)});
  for(const p of pending){const input=inputs.get(p.playerId);if(input.cast)cast524(g,p,input.cast.x,input.cast.y,input.cast.bait);if(input.choice)choose524(g,p,input.choice);p.reel=input.reel===true;delete input.cast;delete input.castOrder526;delete input.castReceivedAt526;delete input.choice}
  for(const p of g.players){if(p.auto)botFishing524(g,p);
   if(p.mode==='waiting'&&g.elapsed>=p.biteAt){p.mode='fight';p.hookedAt=g.elapsed;p.progress=.09;p.tension=.18;event(g,'bite',{seat:p.seat,x:p.castX,y:p.castY,big:p.fish.tier>=3})}
   fight524(g,p);
   if(p.mode==='landing'&&g.elapsed-p.landedAt>=landingDuration526(p.fish)){p.mode='choice';p.choiceUntil=g.elapsed+5000;if(p.fish.tier===4||p.fish.terminal525)choose524(g,p,'keep')}
   if(p.mode==='choice'&&g.elapsed>=p.choiceUntil)choose524(g,p,p.fish.baitOnly525?'continue':'keep');if(p.mode==='rest'&&g.elapsed>=p.restUntil){p.mode='idle';p.fish=null}
  }
  if(g.elapsed>=FISH524.duration&&(g.elapsed>=FISH524.duration+FISH524.grace||g.players.every(p=>!['fight','waiting','landing'].includes(p.mode))))finishFishing524(g);
 }
 g.updatedAt=now;return steps>0;
}
export function publicFishing524(g){return{id:g.id,code:g.code,game:'fishing',rules524:3,partyId462:g.partyId462,hostId:g.hostId,phase:g.phase,revision:g.revision,members:g.members.map(({playerId,name,choice,ai,color499,departed})=>({playerId,name,choice,ai,color499,departed})),players:g.players.map(({nextAI,bot526,biteAt,fish,...p})=>({...p,records:p.records.map(f=>({...f})),chainTrail525:[...(p.chainTrail525??[])],fish:['fight','landing','choice','rest'].includes(p.mode)&&fish?{...fish}:null,biteAt:undefined})),shoals:g.shoals.map(s=>({...s})),events:g.events.map(e=>({...e})),serverAt:g.lastAt,startAt:g.startAt,elapsed:g.elapsed,boss:g.boss,lord526:g.lord526?{phase:g.lord526.phase,ownerId:g.lord526.ownerId}:null,winnerIds:g.winnerIds,results:g.results,finaleUntil:g.finaleUntil}}
export const signature524=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
