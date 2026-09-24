import {THEMES532,varietyPick532} from './Catalog532.js';
import {waterScale526,waterBounds526,clampWater526,fishAim526,available526,landingDuration526,retrievalPoint526,castDistance530,haulScale530,reelTowardDock530} from './Water526.js';
import {CATCHES525,selectCatch525,canChain525,catch525} from './Catches525.js';
import {LORD_IDS531,ROD_THRESHOLDS531,rodLevel531,depthTier531,MAX_CHAIN531} from './Catalog531.js';
import {freezeColors501} from '../party/GameColors501.js';
export const FISH524=Object.freeze({duration:120000,lordChance526:1,lordWindow526:120000,grace:10000,countdown:3000,step:50,finale:5200,maxRod:8});
export const SPECIES524=Object.freeze(CATCHES525.slice(0,5));
export const clamp524=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=g=>{let x=g.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.seed=x>>>0;return g.seed/4294967296};
const event=(g,type,data={})=>{g.events.push({id:++g.eventSeq,type,at:g.elapsed,...data});if(g.events.length>36)g.events.shift()};
export const rod524=p=>rodLevel531(p.rodXP531??Math.max(p.caught??0,ROD_THRESHOLDS531[Math.min(7,(p.rod??1)-1)]??0));
function growRod531(g,p,amount){const before=rod524(p);p.rodXP531=Math.min(ROD_THRESHOLDS531.at(-1),(p.rodXP531??p.caught??0)+amount);p.rod=rod524(p);if(p.rod>before)event(g,'rodUp',{seat:p.seat,level:p.rod})}
function trainBait531(g,p,fish){if(fish.trainingUsed531)return;fish.trainingUsed531=true;growRod531(g,p,2+Math.floor(Math.min(3,fish.tier)/2))}
export function fishPose524(shoal,t){const depth=waterScale526(shoal.y),x=shoal.x+Math.sin(t/5200+shoal.id)*.042*depth,y=shoal.y+Math.cos(t/6700+shoal.id)*.02*depth;return clampWater526(x,y,.012)}
export function targetFish526(g,x,y){const candidates=g.shoals.filter(s=>available526(s,g.elapsed)).map(s=>({s,pos:fishPose524(s,g.elapsed)}));for(const row of candidates)row.distance=fishAim526(row.pos,x,y);return candidates.filter(row=>row.distance<=1).sort((a,b)=>a.distance-b.distance)[0]??null}
export function approachPose530(g,p,t){const s=g.shoals.find(s=>s.id===p.targetShoal530),side=p.approachSide530??1,origin=s?fishPose524(s,t):clampWater526(p.castX+side*.075,p.castY-.04,.012),base=origin,end=p.biteAt??p.castAt+(p.approachDuration530??2400),from=Math.max(0,(t-p.castAt-650)/Math.max(1,end-p.castAt-650)),f=clamp524(from,0,1),dx=base.x-p.castX,dy=base.y-p.castY,len=Math.hypot(dx,dy)||1,style=p.approach530??'nibble';let x,y,phase;
 if(style==='startle'&&f<.34){const q=Math.sin(f/.34*Math.PI),side=p.approachSide530??1;x=base.x+dx/len*.07*q+dy/len*.035*q*side;y=base.y+dy/len*.05*q-dx/len*.018*q*side;phase='startle'}else{const q=style==='startle'?clamp524((f-.24)/.76,0,1):f,soft=q*q*(3-2*q),orbit=(1-soft)*(.014+.01*waterScale526(base.y)),wiggle=Math.sin(q*Math.PI*(style==='nibble'?5:3));x=base.x+(p.castX-base.x)*soft+Math.cos(q*8+p.seat)*orbit;y=base.y+(p.castY-base.y)*soft+wiggle*orbit*.35;phase=q>.72?'nibble':'approach'}
 return{...clampWater526(x,y,.008),tier:s?.tier??p.waitingTier530??0,phase,progress:f}}
function lordSchedule526(g,exhausted=false){return{phase:exhausted?'gone':'hidden',at:exhausted?null:25000+Math.floor(rnd(g)*15000),ownerId:null,count531:0}}
function lordOutcome526(g,p,phase){
 const lord=g.lord526;if(p.fish?.tier!==4||!lord||lord.ownerId!==p.playerId)return;
 if(phase==='caught'){g.shoals=g.shoals.filter(s=>s.tier!==4);Object.assign(lord,{phase:'caught',ownerId:null,nextAt531:lord.count531<2&&g.elapsed<95000?g.elapsed+14000:null});g.boss=false;event(g,'lordCaught',{seat:p.seat});return}
 // Preserve the same encounter, including weight. Recasting cannot reroll a boss.
 let s=g.shoals.find(s=>s.id===lord.shoalId);if(!s){spawn(g,4);s=g.shoals.at(-1);lord.shoalId=s.id}
 delete s.reservedBy530;Object.assign(s,{...clampWater526(p.castX,p.castY,.025),readyAt:g.elapsed+2200});Object.assign(lord,{phase:'visible',ownerId:null});g.boss=true;event(g,'lordRetry',{seat:p.seat,x:s.x,y:s.y});
}
function updateLord526(g){
 const lord=g.lord526;
 if(lord.phase==='caught'&&lord.nextAt531!=null&&g.elapsed>=lord.nextAt531){lord.phase='hidden';lord.at=g.elapsed}
 if(lord.phase==='hidden'&&lord.at!=null&&g.elapsed>=lord.at){
  spawn(g,4);const s=g.shoals.at(-1),ids=LORD_IDS531.filter(id=>id!==lord.speciesId531),id=varietyPick532(ids.map(catch525),()=>rnd(g),{theme:g.theme532}).id;
  Object.assign(lord,{phase:'visible',appearedAt:g.elapsed,shoalId:s.id,speciesId531:id,count531:(lord.count531??0)+1,catch531:catchSpec(g,4,false,null,id)});g.boss=true;event(g,'lord',{x:s.x,y:s.y,name:catch525(id).name});g.revision++;
 }
 if(lord.phase!=='visible'||g.elapsed>=FISH524.duration)return;
 const s=g.shoals.find(s=>s.id===lord.shoalId);if(!s||!available526(s,g.elapsed))return;
 const pos=fishPose524(s,g.elapsed),near=g.players.filter(p=>p.mode==='waiting'&&g.elapsed-p.castAt>=650&&Math.hypot((p.castX-pos.x)*.86,p.castY-pos.y)<.115).sort((a,b)=>Math.hypot(a.castX-pos.x,a.castY-pos.y)-Math.hypot(b.castX-pos.x,b.castY-pos.y)||a.castAt-b.castAt)[0];
 if(near){releaseTarget530(g,near);claimLord531(g,near,s);near.fish=bossCatch531(g,near.castBait530);near.waitingTier530=4;near.biteAt=g.elapsed+1100;near.approachDuration530=near.biteAt-near.castAt;event(g,'lordClaim',{seat:near.seat,x:near.castX,y:near.castY})}
}
function claimLord531(g,p,s){Object.assign(g.lord526,{phase:'hooked',ownerId:p.playerId});s.reservedBy530=p.playerId;p.targetShoal530=s.id}
function bossCatch531(g,bait){const base=g.lord526.catch531??catchSpec(g,4,false,null,g.lord526.speciesId531??'lord'),depth=bait?Math.min(MAX_CHAIN531,(bait.chainDepth525??0)+1):0;return{...base,value:Math.round(base.value*(1+depth*.18)),difficulty:base.difficulty*(bait?.lure525 ? .88 : bait ? .94 : 1),baited:!!bait,chainDepth525:depth,chainFrom525:bait?.id??null}}

export function mood524(p,t){if(p.mode!=='fight')return'calm';const hard=p.fish.tier>=3,cycle=hard?5700:6600,phase=((t-p.hookedAt+p.fish.rhythm)%cycle+cycle)%cycle;return phase<(hard?1850:2600)?'calm':phase<(hard?2550:3400)?'warn':phase<(hard?3950:4700)?'surge':'tired'}
export function makeFishing524({id,code,partyId,hostId,members,now=0}){return{id,code,game:'fishing',rules524:8,partyId462:partyId,hostId,members:members.map(m=>({...m})),phase:'lobby',revision:0,createdAt:now,updatedAt:now,players:[],shoals:[],events:[],eventSeq:0}}
function spawn(g,tier=null){const id=++g.shoalSeq,y=tier===4?.24+rnd(g)*.24:.19+rnd(g)*.53,b=waterBounds526(y);g.shoals.push({id,tier:tier??depthTier531(y,()=>rnd(g)),x:b.left+.065+rnd(g)*(b.right-b.left-.13),y,readyAt:0})}
export function startFishing524(g,now,seed=524){if(g.phase!=='lobby')return false;g.seed=seed>>>0||524;while(g.members.length<4){const i=g.members.length;g.members.push({playerId:`AI-${g.id}-${i}`,name:`AI ${i+1}`,ai:true,choice:{speciesId:['slime','wolf','goblin','skeleton'][i]}})}freezeColors501(g.members,[],g.aiColors500??{});
 g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,seat,speciesId:m.choice.speciesId,color499:m.color499,ai:!!m.ai,auto:!!m.ai,mode:'idle',score:0,caught:0,bait:0,baitItems530:[],pendingBait530:null,castBait530:null,rod:1,rodXP531:0,records:[],chainTrail525:[],bestChain525:0,misses:0,lastSeq:0,reel:false,nextAI:0,castX:.5,castY:.4,progress:0,tension:0}));
 g.theme532=THEMES532[Math.floor(rnd(g)*THEMES532.length)].id;Object.assign(g,{phase:'countdown',startAt:now+3000,lastAt:now,elapsed:0,shoals:[],shoalSeq:0,events:[],eventSeq:0,boss:false});for(let i=0;i<8;i++)spawn(g);g.lord526=lordSchedule526(g);g.revision++;return true;
}
function catchSpec(g,tier,bait,previous=null,lordId531='lord',recent=[]){
 const spec=selectCatch525(tier,()=>rnd(g),{bait,previous,lordId531,theme:g.theme532,recent}),variation=spec.item525 ? .85+rnd(g)*.3 : .55+rnd(g)*1.15,depth=previous?Math.min(MAX_CHAIN531,(previous.chainDepth525??0)+1):0,boost=previous?.lure525 ? .82 : previous||bait ? .94 : 1;
 const growing=previous&&!previous.item525,kg=Math.max(.001,Math.round(Math.max(spec.kg*variation,growing?(previous.kg??0)*1.12+.001:0)*1000)/1000),rarity531=spec.tier===4?6:Math.max(spec.special531?4:spec.tier,growing?(previous.rarity531??previous.tier)+1:0),trophy=rarity531>3&&spec.tier<4&&!spec.special531&&!spec.item525;
 return{...spec,name:trophy?'大冠 '+spec.name:spec.name,kg,rarity531,value:Math.round(spec.base*Math.pow(kg/spec.kg,.38)*(1+depth*.18)*(trophy?1.15:1)),difficulty:spec.difficulty*boost*(trophy?1.05:1),baited:!!bait,rhythm:Math.floor(rnd(g)*1800),chainDepth525:depth,chainFrom525:previous?.id??null,lureBoost525:!!previous?.lure525};
}
export function continue525(g,p){const previous=p.fish;if(g.phase!=='play'||g.elapsed>=FISH524.duration||p.mode!=='choice'||!canChain525(previous))return false;trainBait531(g,p,previous);Object.assign(p,{mode:'aim',pendingBait530:{...previous},castBait530:null,fish:null,reel:false,progress:0,tension:0});event(g,'aim',{seat:p.seat,from:{...previous},depth:(previous.chainDepth525??0)+1});return true}
export function cast524(g,p,x,y,useBait=false){if(g.phase!=='play'||g.elapsed>=FISH524.duration||!['idle','aim'].includes(p.mode)||!Number.isFinite(x)||!Number.isFinite(y))return false;({x,y}=clampWater526(x,y));
 const target=targetFish526(g,x,y);let tier=target?.s.tier??depthTier531(y,()=>rnd(g));
 if(target){if(tier===4){if(g.lord526?.phase!=='visible')return false;Object.assign(g.lord526,{phase:'hooked',ownerId:p.playerId});event(g,'lordClaim',{seat:p.seat,x,y})}target.s.reservedBy530=p.playerId}
 const previous=p.pendingBait530,stock=!previous&&useBait&&p.bait>0?(p.baitItems530?.[0]??{...CATCHES525[0],name:'小魚'}):null,baitItem=previous??stock,bait=!!baitItem;if(stock){p.baitItems530?.shift();p.bait=Math.max(0,p.bait-1)}
 const distance=castDistance530(p,x,y),biteDelay=850+distance*1900+rnd(g)*(650+distance*550),fish=tier===4?bossCatch531(g,baitItem):catchSpec(g,tier,bait,baitItem,'lord',p.recent532??[]),approach530=rnd(g)<.48?'startle':'nibble';
 Object.assign(p,{mode:'waiting',chainTrail525:previous?p.chainTrail525:[],castAt:g.elapsed,biteAt:g.elapsed+biteDelay,approachDuration530:Math.round(biteDelay/100)*100,castX:x,castY:y,castDistance530:distance,reel:false,fish,progress:0,tension:0,targetShoal530:target?.s.id??null,waitingTier530:tier,approach530,approachSide530:rnd(g)<.5?-1:1,castBait530:baitItem?{...baitItem}:null,stockBait530:!!stock});
 if(previous)event(g,'chain',{seat:p.seat,from:{...previous},depth:fish.chainDepth525,x,y});else event(g,'cast',{seat:p.seat,x,y,bait:!!baitItem});return true;
}
export function choose524(g,p,kind){
 if(p.mode!=='choice'||!['keep','bait','continue'].includes(kind))return false;const fish=p.fish;
 if(fish.trash534&&kind!=='keep')return false;
 if(fish.baitOnly525&&kind==='keep')return false;
 if(kind==='continue'){if(g.elapsed<FISH524.duration)return continue525(g,p);if(!fish.baitOnly525)return false;kind='bait'}
 const keep=kind==='keep'||fish.tier===4||fish.terminal525;
 if(!keep&&p.bait>=3&&!fish.baitOnly525)return false;
 if(keep){p.score+=fish.value;p.records.push({id:fish.id,name:fish.name,tier:fish.tier,kg:fish.kg,value:fish.value,color:fish.color,art525:fish.art525,chainDepth525:fish.chainDepth525??0,rarity531:fish.rarity531});p.records=p.records.slice(-24)}
 else{
  trainBait531(g,p,fish);p.baitItems530??=[];
  while(p.baitItems530.length<(p.bait??0))p.baitItems530.push({...CATCHES525[0],name:'小魚'});
  const amount=Math.min(3-p.baitItems530.length,fish.tier>=2?2:1);
  for(let i=0;i<amount;i++)p.baitItems530.push({...fish});p.baitItems530=p.baitItems530.slice(-3);p.bait=p.baitItems530.length;
 }
 event(g,keep?'keep':'bait',{seat:p.seat,fish:{...fish}});Object.assign(p,{mode:'rest',restUntil:g.elapsed+550,reel:false,pendingBait530:null,castBait530:null});return true;
}
function releaseTarget530(g,p,recovered=false){const target=g.shoals.find(s=>s.id===p.targetShoal530);if(target?.reservedBy530===p.playerId){delete target.reservedBy530;if(recovered)target.readyAt=Math.max(target.readyAt,g.elapsed+650)}if(p.fish?.tier===4&&g.lord526?.ownerId===p.playerId){g.lord526.phase='visible';g.lord526.ownerId=null;g.boss=true}p.targetShoal530=null}
function bite530(g,p){const s=g.shoals.find(s=>s.id===p.targetShoal530);if(s?.tier!==4&&s){delete s.reservedBy530;s.readyAt=g.elapsed+6000;p.targetShoal530=null}p.pendingBait530=null;p.stockBait530=false;p.mode='fight';p.hookedAt=g.elapsed;p.progress=.09;p.tension=.18;event(g,'bite',{seat:p.seat,x:p.castX,y:p.castY,big:p.fish.tier>=3})}
export function preBiteReel530(g,p,dt=.05){if(p.mode!=='waiting'||!p.reel)return false;if(!reelTowardDock530(p,dt))return false;releaseTarget530(g,p,true);const chained=!!p.pendingBait530;if(p.stockBait530&&p.castBait530){p.baitItems530??=[];p.baitItems530.unshift({...p.castBait530});p.bait=Math.min(3,p.bait+1)}Object.assign(p,{mode:chained?'aim':'idle',fish:null,castBait530:null,stockBait530:false,reel:false,progress:0,tension:0});event(g,'recover',{seat:p.seat,x:p.castX,y:p.castY});return true}
function lose(g,p,reason){lordOutcome526(g,p,'gone');const target=g.shoals.find(s=>s.id===p.targetShoal530);if(target?.reservedBy530===p.playerId){delete target.reservedBy530;target.readyAt=Math.max(target.readyAt,g.elapsed+900)}p.misses++;Object.assign(p,{mode:'rest',restUntil:g.elapsed+1100,reel:false,pendingBait530:null,castBait530:null,stockBait530:false,targetShoal530:null});event(g,'escape',{seat:p.seat,reason,x:p.castX,y:p.castY})}
export function fight524(g,p,dt=.05){if(p.mode!=='fight')return;const mood=mood524(p,g.elapsed),surge=mood==='surge',rod=rod524(p),strength=1+(rod-1)*.055,haul=haulScale530(p),resistance=.82+p.fish.difficulty*.20;
 // Rarity chiefly changes risk / reaction windows, not an arbitrarily huge health bar.
 if(p.reel){p.progress+=.19*strength/resistance/haul*(surge?.24:mood==='tired'?1.25:1)*dt;p.tension+=(surge?.82:mood==='warn'?.32:.13)*p.fish.difficulty/(1+(rod-1)*.17)*dt}
 else{p.tension-=(surge?.24:.43)*(1+(rod-1)*.035)*dt;p.progress-=(surge?.034:.014)*dt}
 p.tension=clamp524(p.tension,0,1);p.progress=clamp524(p.progress,0,1);
 if(p.tension>=1){lose(g,p,'snap');return}if(g.elapsed-p.hookedAt>32000||p.progress<=0&&g.elapsed-p.hookedAt>10000){lose(g,p,'gone');return}
 if(p.progress>=1){lordOutcome526(g,p,'caught');p.mode='landing';p.landedAt=g.elapsed;p.reel=false;p.caught++;p.recent532=[...(p.recent532??[]),p.fish.id].slice(-3);growRod531(g,p,1);p.chainTrail525=[...(p.chainTrail525??[]),p.fish.id].slice(-9);p.bestChain525=Math.max(p.bestChain525??0,p.fish.chainDepth525??0);event(g,'land',{seat:p.seat,fish:{...p.fish},...retrievalPoint526(p,1)});return}
}
// Ordinary opponents have a reaction delay, occasional mistakes, and time between casts.
// AI gets the same progress, tension and catch rules as a human.
export function botFishing524(g,p){
 const bot=p.bot526??={mode:null,readyAt:0,lag:550+rnd(g)*550,lapseUntil:0,lapseReel:false,lordDelay:2600+rnd(g)*2200};
 if(bot.mode!==p.mode){bot.mode=p.mode;bot.readyAt=g.elapsed+(['idle','aim'].includes(p.mode)?1300+rnd(g)*1700:p.mode==='choice'?900+rnd(g)*1300:p.mode==='fight'?bot.lag:0);p.nextAI=bot.readyAt}
 if(g.elapsed<bot.readyAt||g.elapsed<p.nextAI)return;p.nextAI=g.elapsed+380+rnd(g)*400;
 if(['idle','aim'].includes(p.mode)){
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
 if(p.mode==='choice'){const f=p.fish,chain=g.elapsed<102000&&canChain525(f)&&(f.baitOnly525||f.id==='boot'||f.lure525||f.chainDepth525>0&&rnd(g)<.6||g.elapsed<65000&&rnd(g)<.6);choose524(g,p,chain?'continue':f.baitOnly525?'bait':'keep')}
}
export function finishFishing524(g){if(g.phase==='result')return;for(const p of g.players){if(['landing','choice'].includes(p.mode)){p.mode='choice';choose524(g,p,p.fish?.baitOnly525?'bait':'keep')}else if(p.mode==='fight')lose(g,p,'time');else if(p.mode==='waiting'){releaseTarget530(g,p);Object.assign(p,{mode:'idle',fish:null,castBait530:null,pendingBait530:null,stockBait530:false})}p.reel=false}
 g.shoals=g.shoals.filter(s=>s.tier!==4);if(g.lord526&&['visible','hooked'].includes(g.lord526.phase))g.lord526.phase='gone';g.boss=false;const best=Math.max(...g.players.map(p=>p.score));g.winnerIds=g.players.filter(p=>p.score===best).map(p=>p.playerId);g.results=[...g.players].sort((a,b)=>b.score-a.score||Math.max(0,...b.records.map(f=>f.kg))-Math.max(0,...a.records.map(f=>f.kg))).map(p=>({playerId:p.playerId,rank:1+g.players.filter(q=>q.score>p.score).length,score:p.score,caught:p.caught,bestChain525:p.bestChain525??0,biggest:[...p.records].sort((a,b)=>b.kg-a.kg)[0]??null,boss:p.records.filter(f=>f.tier===4).length}));Object.assign(g,{phase:'result',finaleUntil:g.lastAt+FISH524.finale});g.revision++;event(g,'finish');
}
export function advanceFishing524(g,now,inputs=new Map(),autoIds=new Set()){
 if(!['countdown','play'].includes(g.phase))return false;if(g.rules524!==8||!g.lord526)migrateFishing531(g);if(now<g.startAt){g.lastAt=now;return false}if(g.phase==='countdown'){g.phase='play';g.lastAt=g.startAt;g.revision++}
 if(now-g.lastAt>600){const delay=now-g.lastAt-100;g.lastAt+=delay;g.startAt+=delay}
 let steps=0;while(g.lastAt+50<=now&&g.phase==='play'&&steps++<12){g.lastAt+=50;g.elapsed=g.lastAt-g.startAt;
  updateLord526(g);
  for(const p of g.players)p.auto=p.ai||autoIds.has(p.playerId);
  // Honor received human casts before AI decisions; arrival order decides competing casts.
  const pending=g.players.filter(p=>!p.auto&&inputs.has(p.playerId)).sort((a,b)=>{const aa=inputs.get(a.playerId),bb=inputs.get(b.playerId);return (aa.castReceivedAt526??aa.receivedAt??0)-(bb.castReceivedAt526??bb.receivedAt??0)||(aa.castOrder526??0)-(bb.castOrder526??0)});
  for(const p of pending){const input=inputs.get(p.playerId);if(input.cast)cast524(g,p,input.cast.x,input.cast.y,input.cast.bait);if(input.choice)choose524(g,p,input.choice);p.reel=input.reel===true;delete input.cast;delete input.castOrder526;delete input.castReceivedAt526;delete input.choice}
  for(const p of g.players){if(p.auto)botFishing524(g,p);
   if(p.mode==='waiting'){if(p.reel){if(preBiteReel530(g,p))continue;p.biteAt+=FISH524.step;p.approachDuration530=p.biteAt-p.castAt}if(g.elapsed>=p.biteAt)bite530(g,p)}
   fight524(g,p);
   if(p.mode==='landing'&&g.elapsed-p.landedAt>=landingDuration526(p.fish)){p.mode='choice';p.choiceUntil=g.elapsed+5000;if(p.fish.tier===4||p.fish.terminal525&&!p.fish.trash534)choose524(g,p,'keep')}
   if(p.mode==='choice'&&g.elapsed>=p.choiceUntil)choose524(g,p,p.fish.baitOnly525?'continue':'keep');if(p.mode==='rest'&&g.elapsed>=p.restUntil){p.mode='idle';p.fish=null}
  }
  if(g.elapsed>=FISH524.duration&&(g.elapsed>=FISH524.duration+FISH524.grace||g.players.every(p=>!['fight','waiting','landing'].includes(p.mode))))finishFishing524(g);
 }
 g.updatedAt=now;return steps>0;
}
export function publicFishing524(g){return{id:g.id,code:g.code,theme532:g.theme532??'river',game:'fishing',rules524:8,partyId462:g.partyId462,hostId:g.hostId,phase:g.phase,revision:g.revision,members:g.members.map(({playerId,name,choice,ai,color499,departed})=>({playerId,name,choice,ai,color499,departed})),players:g.players.map(({nextAI,bot526,recent532,biteAt,fish,pendingBait530,baitItems530,...p})=>({...p,records:p.records.map(f=>({...f})),chainTrail525:[...(p.chainTrail525??[])],fish:['fight','landing','choice','rest'].includes(p.mode)&&fish?{...fish}:null,biteAt:undefined,pendingBait530:pendingBait530?{...pendingBait530}:null,baitItems530:(baitItems530??[]).map(f=>({...f}))})),shoals:g.shoals.map(s=>({...s})),events:g.events.map(e=>({...e})),serverAt:g.lastAt,startAt:g.startAt,elapsed:g.elapsed,boss:g.boss,lord526:g.lord526?{phase:g.lord526.phase,ownerId:g.lord526.ownerId,speciesId531:g.lord526.phase==='hidden'?null:g.lord526.speciesId531}:null,winnerIds:g.winnerIds,results:g.results,finaleUntil:g.finaleUntil}}
function migrateFishing531(g){
 g.theme532??='river';if([5,6,7].includes(g.rules524)&&g.lord526){g.rules524=8;return}
 const active=g.players.find(p=>['waiting','fight'].includes(p.mode)&&p.fish?.tier===4);
 g.rules524=8;g.lord526??=lordSchedule526(g);
 if(active){const lord=g.lord526;let s=g.shoals.find(s=>s.tier===4);if(!s){spawn(g,4);s=g.shoals.at(-1)}Object.assign(lord,{phase:'hooked',ownerId:active.playerId,shoalId:s.id,speciesId531:active.fish.id,catch531:{...active.fish},count531:1});s.reservedBy530=active.playerId;active.targetShoal530=s.id}
 else if(['gone','hidden'].includes(g.lord526.phase)&&g.elapsed<100000){g.lord526=lordSchedule526(g);g.lord526.at=Math.max(g.elapsed+1500,g.lord526.at)}
 if(g.lord526.phase==='visible'){g.lord526.speciesId531??='lord';g.lord526.catch531??=catchSpec(g,4,false);g.lord526.count531??=1}
 g.shoals=g.shoals.filter(s=>s.tier!==4||s.id===g.lord526.shoalId);g.boss=['visible','hooked'].includes(g.lord526.phase);
 for(const s of g.shoals)delete s.expiresAt526;
 for(const p of g.players){p.rodXP531??=Math.max(p.caught??0,ROD_THRESHOLDS531[Math.min(7,(p.rod??1)-1)]??0);p.rod=rod524(p);p.chainTrail525??=[];p.bestChain525??=0;p.baitItems530??=Array.from({length:p.bait??0},()=>({...CATCHES525[0],name:'小魚'}));p.pendingBait530??=null;p.castBait530??=null;p.bot526=null}
}
export const signature524=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
