import{start492,input492,sweep492,advance492,public492}from'./Rules492.js';
// Server-authoritative, fixed-step cooperative defense. No currency or main-game stats.
export const CANAL489=Object.freeze({duration:60000,countdown:3000,step:100,fireMs:500,burstMs:12000,leaseMs:1100,maxQueue:96,maxSequence:50000,hp:100,maxEnemies:96});
export const DIRECTIONS489=Object.freeze(['北','東','南','西']);
export const SPECIES489=Object.freeze([
 {id:'crayfish',name:'アメリカザリガニ',quip:'ハサミだけは一人前。',hp:1,travelMs:10000,damage:4,points:10},
 {id:'turtle',name:'ミドリガメ',quip:'のんびり顔で、しっかり進む。',hp:3,travelMs:14000,damage:7,points:25},
 {id:'bass',name:'ブラックバス',quip:'口の大きさには自信あり。',hp:2,travelMs:8000,damage:5,points:20},
 {id:'cone',name:'コーンザリ将軍',quip:'架空種。工事中でも止まらない。',hp:4,travelMs:11000,damage:8,points:35}
]);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const lanes489=seat=>[(seat+3)%4,seat,(seat+1)%4];
export const enemyProgress489=(e,at)=>clamp((at-e.spawnAt)/e.travelMs,0,1);
export function gates489(elapsed){if(elapsed>=50000)return[0,1,2,3];const n=Math.floor(Math.max(0,elapsed)/10000)%4;return[n,(n+1)%4]}
function rand(g){let x=g.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.rng=x>>>0;return g.rng/4294967296}
export function makeCanal489({id,code,partyId,hostId,members,now,seed=1}){return{id,code,partyId462:partyId,hostId,game:'canal',version489:1,phase:'lobby',createdAt:now,updatedAt:now,revision:0,members:members.map(m=>({...m})),rng:seed>>>0||1,players:[],enemies:[],events:[],eventSerial:0,enemySerial:0,hp:100,captured:0,breaches:0,points:0}}
export function startCanal489(g,now){if(g.rules492===1)return start492(g,now);
 if(g.phase!=='lobby')return false;
 if(!g.members.length||g.members.length>4||g.members.some(m=>!m.choice))throw Error('全員の魔物を選んでください');
 g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,choice:{...m.choice},seat,ai:false}));
 const ai=['slime','goblin','wolf','skeleton'],names=['網係スライム','長靴ゴブリン','見回りオオカミ','骨まで働く係'];
 while(g.players.length<4){const seat=g.players.length;g.players.push({playerId:`AI-${g.id}-${seat}`,name:names[seat],choice:{id:`ai-${seat}`,speciesId:ai[seat]},seat,ai:true})}
 for(const p of g.players)Object.assign(p,{lane:p.seat,held:false,holdUntil:0,lastSeq:0,nextFireAt:now+CANAL489.countdown,burstAt:now+CANAL489.countdown,captured:0,assists:0,points:0,bursts:0,auto:false,lastAction:null});
 g.phase='countdown';g.startAt=now+CANAL489.countdown;g.endAt=g.startAt+CANAL489.duration;g.simAt=g.startAt-CANAL489.step;g.nextSpawnAt=g.startAt+800;g.updatedAt=now;return true;
}
function event(g,kind,at,extra={}){g.events.push({id:++g.eventSerial,kind,at,...extra});if(g.events.length>48)g.events.splice(0,g.events.length-48)}
function spawn(g,at,lane){if(g.enemies.length>=CANAL489.maxEnemies)return;const r=rand(g),kind=r<.44?0:r<.71?1:r<.95?2:3,s=SPECIES489[kind];g.enemies.push({id:++g.enemySerial,kind,lane,hp:s.hp,maxHp:s.hp,spawnAt:at,travelMs:s.travelMs*(.92+rand(g)*.16)*(at-g.startAt>=50000?.55:1),wiggle:rand(g)});}
function hit(g,p,e,damage,at){e.hp-=damage;if(e.hp>0)return;const s=SPECIES489[e.kind];g.enemies=g.enemies.filter(x=>x.id!==e.id);g.captured++;g.points+=s.points;p.captured++;p.points+=s.points;if(e.lane!==p.seat)p.assists++;event(g,'catch',at,{enemyId:e.id,kindIndex:e.kind,lane:e.lane,progress:enemyProgress489(e,at),seat:p.seat,assist:e.lane!==p.seat});}
export function sweep489(g,p,lane,at,burst=false){if(g.rules492===1)return sweep492(g,p,lane,at,burst);
 if(g.phase!=='playing'||at<g.startAt||at>=g.endAt||!lanes489(p.seat).includes(lane))return false;
 if(burst?at<p.burstAt:at<p.nextFireAt)return false;
 const targets=g.enemies.filter(e=>e.lane===lane&&enemyProgress489(e,at)>=.18).sort((a,b)=>enemyProgress489(b,at)-enemyProgress489(a,at)||a.id-b.id);
 if(burst){p.burstAt=at+CANAL489.burstMs;p.bursts++}else p.nextFireAt=at+(p.ai||p.auto?900:CANAL489.fireMs);
 p.lane=lane;p.lastAction={id:(p.lastAction?.id??0)+1,at,lane,burst,progress:targets.length?enemyProgress489(targets[0],at):.55};
 for(const e of targets.slice(0,burst?12:1))hit(g,p,e,burst?3:1,at);
 return true;
}
export function inputCanal489(g,p,input,receivedAt){if(g.rules492===1)return input492(g,p,input,receivedAt);
 if(!p||p.ai||!['countdown','playing'].includes(g.phase)||!Number.isSafeInteger(input.seq)||input.seq<=p.lastSeq||input.seq>CANAL489.maxSequence)return false;
 if(!Number.isInteger(input.lane)||!lanes489(p.seat).includes(input.lane)||typeof input.held!=='boolean'||typeof input.pulse!=='boolean'||typeof input.burst!=='boolean')return false;
 p.lastSeq=input.seq;p.lane=input.lane;p.held=input.held;p.holdUntil=receivedAt+CANAL489.leaseMs;
 // No client timestamp is trusted. Pulse and held input share the same cooldown.
 if(input.burst)sweep489(g,p,input.lane,receivedAt,true);
 else if(input.pulse)sweep489(g,p,input.lane,receivedAt,false);
 return true;
}
function finish(g,at){g.phase='result';g.finishedAt=at;g.success=g.hp>0;g.grade=!g.success?'再出動':g.hp>=75?'S':g.hp>=50?'A':'B';for(const p of g.players){p.held=false;p.holdUntil=0}event(g,'finish',at,{success:g.success});}
export function advanceCanal489(g,now,connected=()=>true){if(g.rules492===1)return advance492(g,now,connected);
 if(!['countdown','playing'].includes(g.phase)||now<g.startAt)return;
 g.phase='playing';const until=Math.min(now,g.endAt);
 // At most 601 fixed steps even after a long disconnect/restart; no lost waves.
 while(g.simAt+CANAL489.step<=until&&g.phase==='playing'){
  const at=g.simAt+=CANAL489.step,elapsed=at-g.startAt;
  if(at>=g.endAt){finish(g,g.endAt);break}
  if(elapsed===50000){g.nextSpawnAt=Math.min(g.nextSpawnAt,at);event(g,'flood',at)}
  while(g.nextSpawnAt<=at){const gates=gates489(g.nextSpawnAt-g.startAt);if(gates.length===4)for(const lane of gates)spawn(g,g.nextSpawnAt,lane);else spawn(g,g.nextSpawnAt,gates[Math.floor(rand(g)*gates.length)]);g.nextSpawnAt+=gates.length===4?1100:elapsed<30000?500:320;}
  // Rotate resolution order so the first seat does not always take shared captures.
  for(let n=0;n<4;n++){
   const p=g.players[(n+Math.floor(elapsed/CANAL489.step))%4];p.auto=!p.ai&&!connected(p.playerId);
   if(p.ai||p.auto){const allowed=lanes489(p.seat),e=g.enemies.filter(e=>allowed.includes(e.lane)&&enemyProgress489(e,at)>=(e.lane===p.seat?.25:.58)).sort((a,b)=>(enemyProgress489(b,at)+(b.lane===p.seat?.2:0))-(enemyProgress489(a,at)+(a.lane===p.seat?.2:0)))[0];if(e){p.lane=e.lane;const crowded=g.enemies.filter(x=>x.lane===e.lane&&enemyProgress489(x,at)>=.3).length;if(crowded>=3)sweep489(g,p,e.lane,at,true);sweep489(g,p,e.lane,at,false)}}
   else if(p.held&&at<p.holdUntil)sweep489(g,p,p.lane,at,false);
  }
  const escaped=g.enemies.filter(e=>enemyProgress489(e,at)>=1);
  for(const e of escaped){g.hp=Math.max(0,g.hp-SPECIES489[e.kind].damage);g.breaches++;event(g,'breach',at,{lane:e.lane,kindIndex:e.kind,damage:SPECIES489[e.kind].damage})}
  if(escaped.length){const ids=new Set(escaped.map(e=>e.id));g.enemies=g.enemies.filter(e=>!ids.has(e.id))}
  if(g.hp<=0)finish(g,at);
 }
}
export function publicCanal489(g,selfId,now,connected=()=>true){if(g.rules492===1)return public492(g,selfId,now,connected);return{id:g.id,code:g.code,hostId:g.hostId,game:g.game,phase:g.phase,revision:g.revision,startAt:g.startAt,endAt:g.endAt,simAt:g.simAt,serverNow:now,hp:g.hp,captured:g.captured,breaches:g.breaches,points:g.points,success:g.success,grade:g.grade,finishedAt:g.finishedAt,members:g.members.map(m=>({playerId:m.playerId,name:m.name,choice:m.choice?{id:m.choice.id,speciesId:m.choice.speciesId}:null,departed:!!m.departed})),players:g.players.map(p=>({playerId:p.playerId,name:p.name,choice:{...p.choice},seat:p.seat,ai:p.ai,auto:p.auto,connected:p.ai||!!connected(p.playerId),lane:p.lane,held:p.held,burstAt:p.burstAt,captured:p.captured,assists:p.assists,points:p.points,bursts:p.bursts,lastAction:p.lastAction?{...p.lastAction}:null,...(p.playerId===selfId?{lastSeq:p.lastSeq}: {})})),enemies:g.enemies.map(e=>({...e})),events:g.events.filter(e=>now-e.at<2500).map(e=>({...e}))}}
