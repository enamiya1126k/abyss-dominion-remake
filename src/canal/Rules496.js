import{color499,assignColors499}from'../party/PartyColors499.js';
// Build496 shared pond. Earlier games retain their versioned engines.
export const CANAL496=Object.freeze({duration:60000,countdown:4500,step:100,fireMs:220,aiFireMs:1350,leaseMs:1100,netMax:28,maxEnemies:22,hp:100});
export const SPECIES496=Object.freeze([
 {id:'crayfish',name:'アメリカザリガニ',short:'ザリガニ',quip:'ハサミ自慢。網は苦手。',hp:1,travelMs:8000,damage:12,points:10},
 {id:'turtle',name:'ミドリガメ',short:'カメ',quip:'かたい甲羅は3回タップ！',hp:3,travelMs:10500,damage:17,points:30},
 {id:'bass',name:'ブラックバス',short:'バス',quip:'速い！2回で捕まえろ。',hp:2,travelMs:6200,damage:15,points:20},
 {id:'cone',name:'コーンザリ将軍',short:'ザリ将軍',quip:'架空の大物。みんなで8回！',hp:8,travelMs:11500,damage:30,points:100}
]);
const lanes=()=>[0,1,2,3];
// Anchor movement before applying a snare: neither applying nor expiring it changes position.
export function progress496(e,at){const anchor=e.motionAt??e.spawnAt,elapsed=Math.max(0,at-anchor),slowed=Math.max(0,Math.min(at,e.slowUntil??0)-anchor);return Math.max(0,Math.min(1,(e.motionProgress??0)+(elapsed-slowed*.7)/e.travelMs))}
export function remaining496(e,at){const distance=(1-progress496(e,at))*e.travelMs,slow=Math.max(0,(e.slowUntil??0)-at);return distance<=slow*.3?distance/.3:distance+slow*.7}
export function wave496(elapsed){return elapsed<12000?{name:'家に着く前に、タップで捕獲！',hint:'4人の網で、同じ家を守ろう',stage:0}:elapsed<30000?{name:'硬いカメ・速いバスが来た！',hint:'数字の回数だけタップして捕獲',stage:1}:elapsed<50000?{name:'大物襲来！ 仲間の網に続け！',hint:'仲間と連携して大網をためよう！',stage:2}:{name:'全水門、開放！',hint:'最後の10秒、家を守り切れ！',stage:3}}
export function gates496(elapsed){if(elapsed<12000||elapsed>=50000)return[0,1,2,3];const n=Math.floor((elapsed-12000)/6000)%4;return[n,(n+1)%4]}
function rand(g){let x=g.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.rng=x>>>0;return g.rng/4294967296}
function event(g,kind,at,extra={}){g.events.push({id:++g.eventSerial,kind,at,...extra});if(g.events.length>72)g.events.splice(0,g.events.length-72)}
export function start496(g,now){
 if(g.phase!=='lobby')return false;
 if(!g.members.length||g.members.length>4||g.members.some(m=>!m.choice))throw Error('全員の魔物を選んでください');
 g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,color499:color499(m.color499,seat).id,choice:{id:m.choice.id,speciesId:m.choice.speciesId},seat,ai:false}));
 const bots=['slime','goblin','wolf','skeleton'],names=['網係スライム','長靴ゴブリン','見回りオオカミ','骨まで働く係'];
 while(g.players.length<4){const seat=g.players.length;g.players.push({playerId:`AI-${g.id}-${seat}`,name:names[seat],choice:{id:`ai-${seat}`,speciesId:bots[seat]},seat,ai:true})}
 assignColors499(g.players);
 g.startAt=now+CANAL496.countdown;g.endAt=g.startAt+CANAL496.duration;
 for(const p of g.players)Object.assign(p,{lane:p.seat,held:false,holdUntil:0,lastSeq:0,nextFireAt:g.startAt,burstAt:g.startAt,captured:0,assists:0,teamwork:0,rescues:0,points:0,bursts:0,hits:0,auto:false,lastAction:null});
 Object.assign(g,{rules492:1,rules494:1,rules496:1,phase:'countdown',simAt:g.startAt-100,nextSpawnAt:g.startAt+500,updatedAt:now,enemies:[],events:[],eventSerial:0,enemySerial:0,hp:100,captured:0,breaches:0,points:0,netEnergy:0,netMax:CANAL496.netMax,netUntil:0,megaCount:0,teamCatches:0,bySpecies:[0,0,0,0],bossMask:0});return true;
}
function spawn(g,at,lane,kind){
 if(g.enemies.length>=CANAL496.maxEnemies||g.enemies.filter(e=>e.lane===lane).length>=6)return;
 const elapsed=at-g.startAt;
 if(kind==null){const r=rand(g);kind=elapsed<12000?0:r<.42?0:r<.73?1:2}
 // A route is chosen once. It never depends on which other enemies remain alive.
 const s=SPECIES496[kind],routeX=.18+rand(g)*.64,routeEnd=.36+rand(g)*.28,curve=(rand(g)-.5)*.12;
 g.enemies.push({id:++g.enemySerial,kind,lane,hp:s.hp,maxHp:s.hp,spawnAt:at,travelMs:s.travelMs*(.90+rand(g)*.20)*(elapsed>=50000?.62:.90),routeX,routeEnd,curve,wiggle:rand(g),motionAt:at,motionProgress:0,slowUntil:0,snareSeat:null,contributors:[]});
}
function hit(g,p,e,damage,at,mega){
 if(!g.enemies.some(x=>x.id===e.id))return;
 const helper=e.contributors?.some(x=>x.seat!==p.seat&&at-x.at<=3000);e.contributors??=[];e.contributors=e.contributors.filter(x=>at-x.at<=3000&&x.seat!==p.seat);e.contributors.push({seat:p.seat,at});
 e.hp-=damage;p.hits++;const base={enemyId:e.id,kindIndex:e.kind,lane:e.lane,progress:progress496(e,at),wiggle:e.wiggle,routeX:e.routeX,routeEnd:e.routeEnd,curve:e.curve,seat:p.seat,mega};
 if(e.hp>0){e.motionProgress=progress496(e,at);e.motionAt=at;e.slowUntil=at+850;e.snareSeat=p.seat;event(g,'hit',at,{...base,hp:e.hp,slow:true});return}
 g.enemies=g.enemies.filter(x=>x.id!==e.id);const s=SPECIES496[e.kind];g.captured++;g.points+=s.points;p.captured++;p.points+=s.points;g.bySpecies[e.kind]++;
 const rescue=base.progress>=.80;if(rescue)p.rescues++;if(helper)p.assists++;
 if(helper){g.teamCatches++;for(const x of e.contributors)g.players[x.seat].teamwork++}
 if(!mega)g.netEnergy=Math.min(CANAL496.netMax,g.netEnergy+(helper?2:1));
 event(g,'catch',at,{...base,assist:!!helper,teamwork:!!helper,rescue,helpers:helper?e.contributors.filter(x=>x.seat!==p.seat).map(x=>x.seat):[],points:s.points});
}
export function sweep496(g,p,lane,at,mega=false,targetId=null){
 if(g.phase!=='playing'||at<g.startAt||at>=g.endAt||!lanes(p.seat).includes(lane))return false;
 if(mega){
  if(g.netEnergy<CANAL496.netMax||at<g.netUntil)return false;
  g.netEnergy=0;g.netUntil=at+3000;g.megaCount++;p.bursts++;p.lastAction={id:(p.lastAction?.id??0)+1,at,lane,burst:true,progress:.5};
  event(g,'mega',at,{seat:p.seat,seats:g.players.map(x=>x.seat)});for(const e of [...g.enemies])hit(g,p,e,3,at,true);return true;
 }
 if(at<p.nextFireAt)return false;
 const candidates=g.enemies.sort((a,b)=>progress496(b,at)-progress496(a,at)||a.id-b.id);
 const e=targetId==null?candidates[0]:candidates.find(e=>e.id===targetId);
 // Tapping a creature already captured by a teammate must not spend a stroke.
 if(!e)return false;
 p.nextFireAt=at+(p.ai||p.auto?CANAL496.aiFireMs:CANAL496.fireMs);p.lane=e.lane;
 p.lastAction={id:(p.lastAction?.id??0)+1,at,lane,burst:false,progress:progress496(e,at),enemyId:e.id,wiggle:e.wiggle};hit(g,p,e,1,at,false);return true;
}
export function input496(g,p,x,at){
 if(!p||p.ai||!['countdown','playing'].includes(g.phase)||!Number.isSafeInteger(x.seq)||x.seq<=p.lastSeq||x.seq>50000||!Number.isInteger(x.lane)||!lanes(p.seat).includes(x.lane)||x.held!==false||typeof x.pulse!=='boolean'||typeof x.burst!=='boolean')return false;
 if(x.targetId!=null&&(!Number.isSafeInteger(x.targetId)||x.targetId<1))return false;
 p.lastSeq=x.seq;p.lane=x.lane;p.held=false;p.holdUntil=0;
 if(x.burst)sweep496(g,p,x.lane,at,true);else if(x.pulse)sweep496(g,p,x.lane,at,false,x.targetId);return true;
}
function finish(g,at){g.phase='result';g.finishedAt=at;g.success=g.hp>0;g.grade=!g.success?'再出動':g.hp>=90?'S':g.hp>=60?'A':'B';for(const p of g.players){p.held=false;p.holdUntil=0}event(g,'finish',at,{success:g.success})}
export function advance496(g,now,connected=()=>true){
 if(!['countdown','playing'].includes(g.phase)||now<g.startAt)return;g.phase='playing';const until=Math.min(now,g.endAt);
 while(g.simAt+100<=until&&g.phase==='playing'){
  const at=g.simAt+=100,elapsed=at-g.startAt;
  if(at>=g.endAt){finish(g,g.endAt);break}
  if(elapsed===50000){g.nextSpawnAt=at;event(g,'flood',at)}
  for(const [i,time]of [32000,44000].entries())if(elapsed>=time&&!(g.bossMask&(1<<i))){g.bossMask|=1<<i;const lane=(Math.floor(g.rng/100)+i)%4;spawn(g,at,lane,3);event(g,'boss',at,{lane})}
  while(g.nextSpawnAt<=at){
   const t=g.nextSpawnAt,dt=t-g.startAt,open=gates496(dt);
   // Stagger the opening group and jitter cadence as well as positions.
   spawn(g,t,Math.floor(rand(g)*4),dt<12000?0:undefined);
   const teamPace=1+.75*(g.players.filter(p=>!p.ai).length-1);
   g.nextSpawnAt+=(dt<12000?850:dt<30000?560:dt<50000?350:180)*(.72+rand(g)*.56)/teamPace;
  }
  for(let n=0;n<4;n++){
   const p=g.players[(n+Math.floor(elapsed/100))%4];p.auto=!p.ai&&!connected(p.playerId);
   if(p.ai||p.auto){
    const priority=e=>progress496(e,at)+(e.snareSeat!=null&&e.snareSeat!==p.seat&&at<e.slowUntil?.30:0);
    const e=g.enemies.filter(e=>progress496(e,at)>=.34).sort((a,b)=>priority(b)-priority(a)||a.id-b.id)[0];
    // Humans decide when to deploy their shared super net. All-AI recovery can use it.
    if(g.players.every(x=>x.ai||!connected(x.playerId))&&g.netEnergy>=CANAL496.netMax&&g.enemies.length>=5)sweep496(g,p,p.seat,at,true);
    if(e)sweep496(g,p,e.lane,at,false,e.id);
   }
  }
  for(const e of [...g.enemies])if(progress496(e,at)>=1){const damage=SPECIES496[e.kind].damage;g.hp=Math.max(0,g.hp-damage);g.breaches++;g.enemies=g.enemies.filter(x=>x.id!==e.id);event(g,'breach',at,{lane:e.lane,kindIndex:e.kind,damage})}
  if(g.hp<=0)finish(g,at);
 }
}
export function public496(g,selfId,now,connected=()=>true){return{
 id:g.id,code:g.code,hostId:g.hostId,game:g.game,rules492:1,rules494:1,rules496:1,phase:g.phase,revision:g.revision,startAt:g.startAt,endAt:g.endAt,simAt:g.simAt,serverNow:now,hp:g.hp,captured:g.captured,breaches:g.breaches,points:g.points,success:g.success,grade:g.grade,finishedAt:g.finishedAt,
 netEnergy:g.netEnergy,netMax:CANAL496.netMax,netUntil:g.netUntil,megaCount:g.megaCount,teamCatches:g.teamCatches,bySpecies:[...g.bySpecies],
 members:g.members.map((m,i)=>({playerId:m.playerId,name:m.name,color499:color499(m.color499,i).id,choice:m.choice?{id:m.choice.id,speciesId:m.choice.speciesId}:null,departed:!!m.departed})),
 players:g.players.map(p=>({playerId:p.playerId,name:p.name,color499:color499(p.color499,p.seat).id,choice:{id:p.choice.id,speciesId:p.choice.speciesId},seat:p.seat,ai:p.ai,auto:p.auto,connected:p.ai||!!connected(p.playerId),lane:p.lane,held:p.held,captured:p.captured,assists:p.assists,teamwork:p.teamwork,rescues:p.rescues,points:p.points,bursts:p.bursts,hits:p.hits,lastAction:p.lastAction?{...p.lastAction}:null,...(p.playerId===selfId?{lastSeq:p.lastSeq,nextFireAt:p.nextFireAt}:{})})),
 enemies:g.enemies.map(({contributors,...e})=>({...e})),events:g.events.filter(e=>now-e.at<2500).map(e=>({...e}))
}}
