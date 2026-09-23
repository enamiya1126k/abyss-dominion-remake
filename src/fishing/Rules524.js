import {freezeColors501} from '../party/GameColors501.js';
export const FISH524=Object.freeze({duration:120000,bossAt:90000,grace:10000,countdown:3000,step:50,finale:5200,maxRod:6});
export const SPECIES524=Object.freeze([
 {id:'silver',name:'銀葉ウグイ',base:24,kg:1.2,difficulty:.9,color:'#a9ded8',size:.65},
 {id:'jade',name:'翡翠コイ',base:58,kg:3.8,difficulty:1.25,color:'#61bfa2',size:1},
 {id:'ruby',name:'紅玉タイ',base:106,kg:8,difficulty:1.65,color:'#ed8977',size:1.25},
 {id:'gold',name:'月冠キンギョ',base:190,kg:14,difficulty:1.9,color:'#f3ce79',size:1.5},
 {id:'lord',name:'翠湖のぬし',base:460,kg:68,difficulty:2.65,color:'#e7d398',size:2.6}
]);
export const clamp524=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=g=>{let x=g.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.seed=x>>>0;return g.seed/4294967296};
const event=(g,type,data={})=>{g.events.push({id:++g.eventSeq,type,at:g.elapsed,...data});if(g.events.length>36)g.events.shift()};
export const rod524=p=>Math.min(6,1+Math.floor(p.caught/2));
export function fishPose524(shoal,t){return{x:clamp524(shoal.x+Math.sin(t/3400+shoal.id)*.045,.1,.9),y:clamp524(shoal.y+Math.cos(t/4100+shoal.id)*.025,.22,.70)}}
export function mood524(p,t){if(p.mode!=='fight')return'calm';const phase=((t-p.hookedAt+p.fish.rhythm)%6600+6600)%6600;return phase<2600?'calm':phase<3400?'warn':phase<4700?'surge':'tired'}
export function makeFishing524({id,code,partyId,hostId,members,now=0}){return{id,code,game:'fishing',rules524:1,partyId462:partyId,hostId,members:members.map(m=>({...m})),phase:'lobby',revision:0,createdAt:now,updatedAt:now,players:[],shoals:[],events:[],eventSeq:0}}
function spawn(g,tier=null){const id=++g.shoalSeq,v=rnd(g);g.shoals.push({id,tier:tier??(v<.42?0:v<.79?1:v<.96?2:3),x:.13+rnd(g)*.74,y:.24+rnd(g)*.44,readyAt:0})}
export function startFishing524(g,now,seed=524){if(g.phase!=='lobby')return false;g.seed=seed>>>0||524;while(g.members.length<4){const i=g.members.length;g.members.push({playerId:`AI-${g.id}-${i}`,name:`AI ${i+1}`,ai:true,choice:{speciesId:['slime','wolf','goblin','skeleton'][i]}})}freezeColors501(g.members,[],g.aiColors500??{});
 g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,seat,speciesId:m.choice.speciesId,color499:m.color499,ai:!!m.ai,auto:!!m.ai,mode:'idle',score:0,caught:0,bait:0,rod:1,records:[],misses:0,lastSeq:0,reel:false,nextAI:0,castX:.5,castY:.4,progress:0,tension:0}));
 Object.assign(g,{phase:'countdown',startAt:now+3000,lastAt:now,elapsed:0,shoals:[],shoalSeq:0,events:[],eventSeq:0,boss:false});for(let i=0;i<8;i++)spawn(g);g.revision++;return true;
}
function catchSpec(g,tier,bait){const spec=SPECIES524[tier],variation=.8+rnd(g)*.4;return{...spec,tier,kg:Math.round(spec.kg*variation*10)/10,value:Math.round(spec.base*variation),difficulty:spec.difficulty*(bait?.8:1),baited:bait,rhythm:Math.floor(rnd(g)*1800)}}
export function cast524(g,p,x,y,useBait=false){if(g.phase!=='play'||g.elapsed>=FISH524.duration||p.mode!=='idle'||!Number.isFinite(x)||!Number.isFinite(y))return false;x=clamp524(x,.08,.92);y=clamp524(y,.20,.73);
 const target=g.shoals.filter(s=>s.readyAt<=g.elapsed).map(s=>({s,pos:fishPose524(s,g.elapsed)})).sort((a,b)=>Math.hypot(a.pos.x-x,a.pos.y-y)-Math.hypot(b.pos.x-x,b.pos.y-y))[0];
 let tier=target&&Math.hypot(target.pos.x-x,target.pos.y-y)<.14?target.s.tier:0;
 if(target&&Math.hypot(target.pos.x-x,target.pos.y-y)<.14)target.s.readyAt=g.elapsed+6000;
 const bait=useBait&&p.bait>0;if(bait)p.bait--;if(bait&&tier<3&&rnd(g)<.55)tier++;
 Object.assign(p,{mode:'waiting',castAt:g.elapsed,biteAt:g.elapsed+1700+rnd(g)*1800,castX:x,castY:y,reel:false,fish:catchSpec(g,tier,bait),progress:0,tension:0});event(g,'cast',{seat:p.seat,x,y});return true;
}
export function choose524(g,p,kind){if(p.mode!=='choice'||!['keep','bait'].includes(kind))return false;const fish=p.fish;const keep=kind==='keep'||fish.tier===4;if(!keep&&p.bait>=3)return false;if(keep){p.score+=fish.value;p.records.push({id:fish.id,name:fish.name,tier:fish.tier,kg:fish.kg,value:fish.value,color:fish.color});p.records=p.records.slice(-24)}else p.bait=Math.min(3,p.bait+(fish.tier>=2?2:1));event(g,keep?'keep':'bait',{seat:p.seat,fish:{...fish}});Object.assign(p,{mode:'rest',restUntil:g.elapsed+550,reel:false});return true}
function lose(g,p,reason){p.misses++;p.mode='rest';p.restUntil=g.elapsed+1100;p.reel=false;event(g,'escape',{seat:p.seat,reason,x:p.castX,y:p.castY})}
export function fight524(g,p,dt=.05){if(p.mode!=='fight')return;const mood=mood524(p,g.elapsed),surge=mood==='surge',rod=rod524(p),strength=1+(rod-1)*.15;
 if(p.reel){p.progress+=.22*strength/p.fish.difficulty*(surge?.27:mood==='tired'?1.2:1)*dt;p.tension+=(surge?.68:mood==='warn'?.28:.135)*p.fish.difficulty/(1+(rod-1)*.085)*dt}
 else{p.tension-=(surge?.15:.36)*dt;p.progress-=(surge?.039:.018)*dt}
 p.tension=clamp524(p.tension,0,1);p.progress=clamp524(p.progress,0,1);
 if(p.tension>=1){lose(g,p,'snap');return}if(g.elapsed-p.hookedAt>32000||p.progress<=0&&g.elapsed-p.hookedAt>10000){lose(g,p,'gone');return}
 if(p.progress>=1){p.mode='landing';p.landedAt=g.elapsed;p.reel=false;p.caught++;p.rod=rod524(p);event(g,'land',{seat:p.seat,fish:{...p.fish},x:p.castX*.37+(.13+p.seat*.2467)*.63,y:p.castY*.37+.78*.63});return}
}
export function botFishing524(g,p){if(g.elapsed<p.nextAI)return;p.nextAI=g.elapsed+160+rnd(g)*140;
 if(p.mode==='idle'){const boss=g.shoals.find(s=>s.tier===4&&s.readyAt<=g.elapsed),targets=g.shoals.filter(s=>s.readyAt<=g.elapsed&&s.tier<=Math.min(3,rod524(p)-1+(p.bait?1:0)));let target=boss??targets[Math.floor(rnd(g)*targets.length)];if(!target)target=g.shoals.find(s=>s.readyAt<=g.elapsed);if(target){const pos=fishPose524(target,g.elapsed);cast524(g,p,pos.x,pos.y,p.bait>0&&(g.elapsed>65000||target.tier>=2))}}
 if(p.mode==='fight'){const mood=mood524(p,g.elapsed);p.reel=mood!=='surge'&&!(mood==='warn'&&p.tension>.46)&&p.tension<.73}
 if(p.mode==='choice')choose524(g,p,g.elapsed<72000&&p.bait<2&&p.fish.tier<2?'bait':'keep');
}
export function finishFishing524(g){if(g.phase==='result')return;for(const p of g.players){if(['landing','choice'].includes(p.mode)){p.mode='choice';choose524(g,p,'keep')}else if(p.mode==='fight')lose(g,p,'time');p.reel=false}
 const best=Math.max(...g.players.map(p=>p.score));g.winnerIds=g.players.filter(p=>p.score===best).map(p=>p.playerId);g.results=[...g.players].sort((a,b)=>b.score-a.score||Math.max(0,...b.records.map(f=>f.kg))-Math.max(0,...a.records.map(f=>f.kg))).map(p=>({playerId:p.playerId,rank:1+g.players.filter(q=>q.score>p.score).length,score:p.score,caught:p.caught,biggest:[...p.records].sort((a,b)=>b.kg-a.kg)[0]??null,boss:p.records.filter(f=>f.tier===4).length}));Object.assign(g,{phase:'result',finaleUntil:g.lastAt+FISH524.finale});g.revision++;event(g,'finish');
}
export function advanceFishing524(g,now,inputs=new Map(),autoIds=new Set()){
 if(!['countdown','play'].includes(g.phase))return false;if(now<g.startAt){g.lastAt=now;return false}if(g.phase==='countdown'){g.phase='play';g.lastAt=g.startAt;g.revision++}
 if(now-g.lastAt>600){const delay=now-g.lastAt-100;g.lastAt+=delay;g.startAt+=delay}
 let steps=0;while(g.lastAt+50<=now&&g.phase==='play'&&steps++<12){g.lastAt+=50;g.elapsed=g.lastAt-g.startAt;
  if(!g.boss&&g.elapsed>=FISH524.bossAt){g.boss=true;spawn(g,4);spawn(g,4);event(g,'lord');g.revision++}
  for(const p of g.players){p.auto=p.ai||autoIds.has(p.playerId);const input=inputs.get(p.playerId);if(p.auto)botFishing524(g,p);else if(input){if(input.cast)cast524(g,p,input.cast.x,input.cast.y,input.cast.bait);if(input.choice)choose524(g,p,input.choice);p.reel=input.reel===true;delete input.cast;delete input.choice}
   if(p.mode==='waiting'&&g.elapsed>=p.biteAt){p.mode='fight';p.hookedAt=g.elapsed;p.progress=.09;p.tension=.18;event(g,'bite',{seat:p.seat,x:p.castX,y:p.castY,big:p.fish.tier>=3})}
   fight524(g,p);
   if(p.mode==='landing'&&g.elapsed-p.landedAt>=1150){p.mode='choice';p.choiceUntil=g.elapsed+5000;if(p.fish.tier===4)choose524(g,p,'keep')}
   if(p.mode==='choice'&&g.elapsed>=p.choiceUntil)choose524(g,p,'keep');if(p.mode==='rest'&&g.elapsed>=p.restUntil){p.mode='idle';p.fish=null}
  }
  if(g.elapsed>=FISH524.duration&&(g.elapsed>=FISH524.duration+FISH524.grace||g.players.every(p=>!['fight','waiting','landing'].includes(p.mode))))finishFishing524(g);
 }
 g.updatedAt=now;return steps>0;
}
export function publicFishing524(g){return{id:g.id,code:g.code,game:'fishing',rules524:1,partyId462:g.partyId462,hostId:g.hostId,phase:g.phase,revision:g.revision,members:g.members.map(({playerId,name,choice,ai,color499,departed})=>({playerId,name,choice,ai,color499,departed})),players:g.players.map(({nextAI,biteAt,fish,...p})=>({...p,records:p.records.map(f=>({...f})),fish:['fight','landing','choice','rest'].includes(p.mode)&&fish?{...fish}:null,biteAt:undefined})),shoals:g.shoals.map(s=>({...s})),events:g.events.map(e=>({...e})),serverAt:g.lastAt,startAt:g.startAt,elapsed:g.elapsed,boss:g.boss,winnerIds:g.winnerIds,results:g.results,finaleUntil:g.finaleUntil}}
export const signature524=g=>!g?null:['lobby','result'].includes(g.phase)?g:{id:g.id,phase:'play',players:g.players.map(p=>[p.playerId,p.speciesId,p.color499])};
