import {validStroke541,stroke541,rally541,teamTick541} from './Team541.js';
import{route500,missilePoint500}from'./Motion500.js';
import{color499,assignColors499}from'../party/PartyColors499.js';
// Build500: species roles, shared giant encounter and server-authoritative interceptable missiles.
export const CANAL500=Object.freeze({duration:60000,countdown:4500,step:100,fireMs:220,aiFireMs:1350,leaseMs:1100,netMax:28,maxEnemies:22,hp:100,missileMs:650,missileEveryMs:1000,missileDamage:5});
export const SPECIES500=Object.freeze([
 {id:'crayfish',name:'アメリカザリガニ',short:'ザリガニ',quip:'ハサミ自慢。2回タップで捕獲！',hp:2,travelMs:8000,damage:12,points:10},
 {id:'turtle',name:'ミドリガメ',short:'カメ',quip:'かたい甲羅は3回タップ！',hp:3,travelMs:11500,damage:17,points:30},
 {id:'bass',name:'ブラックバス',short:'バス',quip:'くねくね速い！1回で捕獲。',hp:1,travelMs:5600,damage:15,points:20},
 {id:'cone',name:'コーンザリ将軍',short:'ザリ将軍',quip:'20回で捕獲！ミサイルは1タップで迎撃！',hp:20,travelMs:22000,damage:30,points:100}
]);
const lanes=()=>[0,1,2,3];
// Anchor movement before applying a snare: neither applying nor expiring it changes position.
export function progress500(e,at){const anchor=e.motionAt??e.spawnAt,elapsed=Math.max(0,at-anchor),slowed=Math.max(0,Math.min(at,e.slowUntil??0)-anchor);return Math.max(0,Math.min(1,(e.motionProgress??0)+(elapsed-slowed*.7)/e.travelMs))}
export function remaining500(e,at){const distance=(1-progress500(e,at))*e.travelMs,slow=Math.max(0,(e.slowUntil??0)-at);return distance<=slow*.3?distance/.3:distance+slow*.7}
export function wave500(elapsed){return elapsed<12000?{name:'家に着く前に、タップで捕獲！',hint:'4人の網で、同じ家を守ろう',stage:0}:elapsed<30000?{name:'硬いカメ・速いバスが来た！',hint:'数字の回数だけタップして捕獲',stage:1}:elapsed<50000?{name:'大物襲来！ 仲間の網に続け！',hint:'仲間と連携して大網をためよう！',stage:2}:{name:'全水門、開放！',hint:'最後の10秒、家を守り切れ！',stage:3}}
export function gates500(elapsed){if(elapsed<12000||elapsed>=50000)return[0,1,2,3];const n=Math.floor((elapsed-12000)/6000)%4;return[n,(n+1)%4]}
function rand(g){let x=g.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.rng=x>>>0;return g.rng/4294967296}
function event(g,kind,at,extra={}){g.events.push({id:++g.eventSerial,kind,at,...extra});if(g.events.length>72)g.events.splice(0,g.events.length-72)}
export function start500(g,now){
 if(g.phase!=='lobby')return false;
 if(!g.members.length||g.members.length>4||g.members.some(m=>!m.choice))throw Error('全員の魔物を選んでください');
 g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,color499:color499(m.color499,seat).id,choice:{id:m.choice.id,speciesId:m.choice.speciesId},seat,ai:false}));
 const bots=['slime','goblin','wolf','skeleton'],names=['網係スライム','長靴ゴブリン','見回りオオカミ','骨まで働く係'];
 while(g.players.length<4){const seat=g.players.length;g.players.push({playerId:`AI-${g.id}-${seat}`,name:names[seat],choice:{id:`ai-${seat}`,speciesId:bots[seat]},seat,ai:true})}
 assignColors499(g.players,g.aiColors500??{});
 g.startAt=now+CANAL500.countdown;g.endAt=g.startAt+CANAL500.duration;
 for(const p of g.players)Object.assign(p,{lane:p.seat,held:false,holdUntil:0,lastSeq:0,nextFireAt:g.startAt,burstAt:g.startAt,captured:0,assists:0,teamwork:0,rescues:0,points:0,bursts:0,hits:0,auto:false,lastAction:null,intercepted:0});
 Object.assign(g,{rules492:1,rules494:1,rules496:1,rules500:1,phase:'countdown',simAt:g.startAt-100,nextSpawnAt:g.startAt+500,updatedAt:now,enemies:[],events:[],eventSerial:0,enemySerial:0,hp:100,captured:0,breaches:0,points:0,netEnergy:0,netMax:CANAL500.netMax,netUntil:0,megaCount:0,teamCatches:0,bySpecies:[0,0,0,0],bossMask:0,missiles:[],missileSerial:0,intercepted:0});if(g.rules541){Object.assign(g,{combo541:0,bestCombo541:0,fever541Until:0,feverReady541:0,lastCatch541:0,rally541:null,netMax:32});for(const p of g.players)Object.assign(p,{strokes541:0,bestSweep541:0})}return true;
}
function spawn(g,at,lane,kind){
 if(g.enemies.length>=CANAL500.maxEnemies||(kind!==3&&g.enemies.filter(e=>e.lane===lane).length>=6))return false;
 const elapsed=at-g.startAt;
 if(kind==null){const r=rand(g);kind=elapsed<12000?0:r<.42?0:r<.73?1:2}
 // A route is chosen once. It never depends on which other enemies remain alive.
 const s=SPECIES500[kind],routeX=kind===3?.5:[.17,.38,.60,.82][lane]+(rand(g)-.5)*.06,routeEnd=kind===3?.5:.36+rand(g)*.28,curve=kind===3?0:(rand(g)-.5)*.10;
 g.enemies.push({path541:g.rules541?1:0,path500:1,nextShotAt:kind===3?at+2000:null,id:++g.enemySerial,kind,lane,hp:s.hp,maxHp:s.hp,spawnAt:at,travelMs:s.travelMs*(.90+rand(g)*.20)*(elapsed>=50000?.62:.90),routeX,routeEnd,curve,wiggle:rand(g),motionAt:at,motionProgress:0,slowUntil:0,snareSeat:null,contributors:[]});return true;
}
function hit(g,p,e,damage,at,mega){
 if(!g.enemies.some(x=>x.id===e.id))return;
 const helper=e.contributors?.some(x=>x.seat!==p.seat&&at-x.at<=3000);e.contributors??=[];e.contributors=e.contributors.filter(x=>at-x.at<=3000&&x.seat!==p.seat);e.contributors.push({seat:p.seat,at});
 if(g.rules541&&!mega){damage+=helper?1:0;if(at<(g.fever541Until??0))damage++;if(e.kind===3&&at<(e.breakUntil541??0))damage++;}
 e.hp-=damage;p.hits++;if(g.rules541&&e.kind===3&&e.hp>0&&e.contributors.length>=2&&at>=(e.breakReady541??0)){e.motionProgress=progress500(e,at);e.motionAt=at;e.slowUntil=at+3500;e.breakUntil541=at+3500;e.breakReady541=at+9000;event(g,'break541',at,{enemyId:e.id});}const base={path541:e.path541,path500:1,enemyId:e.id,kindIndex:e.kind,lane:e.lane,progress:progress500(e,at),wiggle:e.wiggle,routeX:e.routeX,routeEnd:e.routeEnd,curve:e.curve,seat:p.seat,mega};
 if(e.hp>0){e.motionProgress=progress500(e,at);e.motionAt=at;e.slowUntil=g.rules541?Math.max(e.slowUntil??0,at+850):at+850;e.snareSeat=p.seat;event(g,'hit',at,{...base,hp:e.hp,slow:true});return}
 g.enemies=g.enemies.filter(x=>x.id!==e.id);const s={...SPECIES500[e.kind]};if(g.rules541){g.combo541=at-(g.lastCatch541??0)<2200?(g.combo541??0)+1:1;g.bestCombo541=Math.max(g.bestCombo541??0,g.combo541);g.lastCatch541=at;if(at<(g.fever541Until??0))s.points*=2;if(g.combo541>=8&&at>=(g.feverReady541??0)){g.fever541Until=at+8000;g.feverReady541=at+18000;event(g,'fever541',at)}}g.captured++;g.points+=s.points;p.captured++;p.points+=s.points;g.bySpecies[e.kind]++;
 const rescue=base.progress>=.80;if(rescue)p.rescues++;if(helper)p.assists++;
 if(helper){g.teamCatches++;for(const x of e.contributors)g.players[x.seat].teamwork++}
 if(!mega)g.netEnergy=Math.min(g.netMax??CANAL500.netMax,g.netEnergy+(helper?2:1));
 event(g,'catch',at,{...base,assist:!!helper,teamwork:!!helper,rescue,helpers:helper?e.contributors.filter(x=>x.seat!==p.seat).map(x=>x.seat):[],points:s.points});
}
export function sweep500(g,p,lane,at,mega=false,targetId=null){
 if(g.phase!=='playing'||at<g.startAt||at>=g.endAt||!lanes(p.seat).includes(lane))return false;
 if(mega){
  if(g.rules541)return rally541(g,p,at,event);
  if(g.netEnergy<CANAL500.netMax||at<g.netUntil)return false;
  g.netEnergy=0;g.netUntil=at+3000;g.megaCount++;p.bursts++;p.lastAction={id:(p.lastAction?.id??0)+1,at,lane,burst:true,progress:.5};
  event(g,'mega',at,{seat:p.seat,seats:g.players.map(x=>x.seat)});for(const missile of [...g.missiles])intercept500(g,p,missile.id,at,true);for(const e of [...g.enemies])hit(g,p,e,3,at,true);return true;
 }
 if(at<p.nextFireAt)return false;
 const candidates=g.enemies.sort((a,b)=>progress500(b,at)-progress500(a,at)||a.id-b.id);
 const e=targetId==null?candidates[0]:candidates.find(e=>e.id===targetId);
 // Tapping a creature already captured by a teammate must not spend a stroke.
 if(!e)return false;
 p.nextFireAt=at+(p.ai||p.auto?CANAL500.aiFireMs:CANAL500.fireMs);p.lane=e.lane;
 p.lastAction={id:(p.lastAction?.id??0)+1,at,lane,burst:false,progress:progress500(e,at),enemyId:e.id,wiggle:e.wiggle};hit(g,p,e,1,at,false);return true;
}
export function input500(g,p,x,at){
 if(!p||p.ai||!['countdown','playing'].includes(g.phase)||!Number.isSafeInteger(x.seq)||x.seq<=p.lastSeq||x.seq>50000||!Number.isInteger(x.lane)||!lanes(p.seat).includes(x.lane)||x.held!==false||typeof x.pulse!=='boolean'||typeof x.burst!=='boolean')return false;
 if(x.targetId!=null&&(!Number.isSafeInteger(x.targetId)||x.targetId<1))return false;
 if(x.missileId500!=null&&(!Number.isSafeInteger(x.missileId500)||x.missileId500<1||x.targetId!=null||x.burst||!x.pulse))return false;
 if(x.stroke541!=null&&(!g.rules541||!validStroke541(x.stroke541)||x.targetId!=null||x.missileId500!=null||x.burst||x.pulse))return false;
 p.lastSeq=x.seq;p.lane=x.lane;p.held=false;p.holdUntil=0;
 if(x.stroke541){stroke541(g,p,x.stroke541,at,{progress:progress500,hit,intercept:intercept500,event});return true;}
 if(x.burst)sweep500(g,p,x.lane,at,true);else if(x.pulse){if(x.missileId500!=null)intercept500(g,p,x.missileId500,at);else sweep500(g,p,x.lane,at,false,x.targetId)};return true;
}
// Missiles are durable game state, not client effects: one resolution per id.
export function intercept500(g,p,id,at,mega=false){
 if(g.phase!=='playing'||!p||at<g.startAt||at>=g.endAt)return false;
 const missile=g.missiles.find(m=>m.id===id&&at>=m.spawnAt&&at<m.arriveAt);if(!missile)return false;
 g.missiles=g.missiles.filter(m=>m.id!==id);g.intercepted++;p.intercepted++;
 if(!mega){p.lastAction={id:(p.lastAction?.id??0)+1,at,lane:p.seat,burst:false};}
 event(g,'intercept',at,{missileId500:id,seat:p.seat,...missilePoint500(missile,at),mega});return true;
}
function missiles500(g,at){
 // Fixed simulation ticks also run on catch-up/restart, preserving shot cadence.
 for(const e of g.enemies)if(e.kind===3&&at>=e.nextShotAt){
  const from=route500(e,progress500(e,at));g.missiles.push({id:++g.missileSerial,enemyId:e.id,spawnAt:at,arriveAt:at+(g.rules541?1300:CANAL500.missileMs),fromX:from.x,fromY:Math.min(.67,from.y+.05),damage:CANAL500.missileDamage});
  e.nextShotAt+=CANAL500.missileEveryMs;
 }
 for(const m of [...g.missiles])if(at>=m.arriveAt){g.missiles=g.missiles.filter(x=>x.id!==m.id);g.hp=Math.max(0,g.hp-m.damage);if(g.rules541)g.combo541=0;event(g,'missileImpact',at,{missileId500:m.id,damage:m.damage})}
}
function finish(g,at){g.phase='result';g.finishedAt=at;g.success=g.hp>0;g.grade=!g.success?'再出動':g.hp>=90?'S':g.hp>=60?'A':'B';for(const p of g.players){p.held=false;p.holdUntil=0}event(g,'finish',at,{success:g.success})}
export function advance500(g,now,connected=()=>true){
 if(!['countdown','playing'].includes(g.phase)||now<g.startAt)return;g.phase='playing';const until=Math.min(now,g.endAt);
 while(g.simAt+100<=until&&g.phase==='playing'){
  const at=g.simAt+=100,elapsed=at-g.startAt;
  if(at>=g.endAt){finish(g,g.endAt);break}
  if(elapsed===50000){g.nextSpawnAt=at;event(g,'flood',at)}
  for(const [i,time]of [32000].entries())if(elapsed>=time&&!(g.bossMask&(1<<i))){const lane=(Math.floor(g.rng/100)+i)%4;if(spawn(g,at,lane,3)){g.bossMask|=1<<i;event(g,'boss',at,{lane})}}
  while(g.nextSpawnAt<=at){
   const t=g.nextSpawnAt,dt=t-g.startAt,open=gates500(dt);
   // Stagger the opening group and jitter cadence as well as positions.
   spawn(g,t,Math.floor(rand(g)*4),dt<12000?0:undefined);
   const teamPace=1+(g.rules541?.32:.75)*(g.players.filter(p=>!p.ai).length-1);
   g.nextSpawnAt+=(dt<12000?850:dt<30000?560:dt<50000?350:180)*(.72+rand(g)*.56)/teamPace;
  }
  teamTick541(g,at,{hit,intercept:intercept500,event});
  for(let n=0;n<4;n++){
   const p=g.players[(n+Math.floor(elapsed/100))%4];p.auto=!p.ai&&!connected(p.playerId);
   if(p.ai||p.auto){
    if(g.rules541){const missile=g.missiles.find(m=>at-m.spawnAt>500+p.seat*80);if(missile&&((Math.floor(at/100)+p.seat)%4===0))intercept500(g,p,missile.id,at);}
    const priority=e=>(e.kind===3?.75:progress500(e,at))+(e.snareSeat!=null&&e.snareSeat!==p.seat&&at<e.slowUntil?.30:0);
    const e=g.enemies.filter(e=>e.kind===3||progress500(e,at)>=.30).sort((a,b)=>priority(b)-priority(a)||a.id-b.id)[0];
    // Humans decide when to deploy their shared super net. All-AI recovery can use it.
    if(g.players.every(x=>x.ai||!connected(x.playerId))&&g.netEnergy>=CANAL500.netMax&&g.enemies.length>=5)sweep500(g,p,p.seat,at,true);
    if(e)sweep500(g,p,e.lane,at,false,e.id);
   }
  }
  missiles500(g,at);
  for(const e of [...g.enemies])if(progress500(e,at)>=1){const damage=SPECIES500[e.kind].damage;g.hp=Math.max(0,g.hp-damage);if(g.rules541)g.combo541=0;g.breaches++;g.enemies=g.enemies.filter(x=>x.id!==e.id);event(g,'breach',at,{lane:e.lane,kindIndex:e.kind,damage})}
  if(g.hp<=0)finish(g,at);
 }
}
export function public500(g,selfId,now,connected=()=>true){return{
 id:g.id,code:g.code,hostId:g.hostId,game:g.game,rules492:1,rules494:1,rules496:1,rules500:1,phase:g.phase,revision:g.revision,startAt:g.startAt,endAt:g.endAt,simAt:g.simAt,serverNow:now,hp:g.hp,captured:g.captured,breaches:g.breaches,points:g.points,success:g.success,grade:g.grade,finishedAt:g.finishedAt,
 ...(g.rules541?{rules541:1,combo541:g.combo541,bestCombo541:g.bestCombo541,fever541Until:g.fever541Until,rally541:g.rally541?{...g.rally541,seats:[...g.rally541.seats]}:null}:{}),
 missiles:(g.missiles??[]).map(m=>({...m})),intercepted:g.intercepted??0,netEnergy:g.netEnergy,netMax:g.netMax??CANAL500.netMax,netUntil:g.netUntil,megaCount:g.megaCount,teamCatches:g.teamCatches,bySpecies:[...g.bySpecies],
 members:g.members.map((m,i)=>({playerId:m.playerId,name:m.name,color499:color499(m.color499,i).id,choice:m.choice?{id:m.choice.id,speciesId:m.choice.speciesId}:null,departed:!!m.departed})),
 players:g.players.map(p=>({playerId:p.playerId,name:p.name,color499:color499(p.color499,p.seat).id,choice:{id:p.choice.id,speciesId:p.choice.speciesId},seat:p.seat,ai:p.ai,auto:p.auto,connected:p.ai||!!connected(p.playerId),lane:p.lane,held:p.held,captured:p.captured,assists:p.assists,teamwork:p.teamwork,rescues:p.rescues,points:p.points,bursts:p.bursts,hits:p.hits,intercepted:p.intercepted??0,bestSweep541:p.bestSweep541??0,lastAction:p.lastAction?{...p.lastAction}:null,...(p.playerId===selfId?{lastSeq:p.lastSeq,nextFireAt:p.nextFireAt}:{})})),
 enemies:g.enemies.map(({contributors,...e})=>({...e})),events:g.events.filter(e=>now-e.at<2500).map(e=>({...e}))
}}
