// Build494 focused lanes. Stored Build492 games retain their original engine.
export const CANAL494=Object.freeze({duration:60000,countdown:4500,step:100,fireMs:220,aiFireMs:1100,leaseMs:1100,netMax:18,maxEnemies:24,hp:100});
export const SPECIES494=Object.freeze([
 {id:'crayfish',name:'アメリカザリガニ',short:'ザリガニ',quip:'ハサミ自慢。網は苦手。',hp:1,travelMs:8000,damage:12,points:10},
 {id:'turtle',name:'ミドリガメ',short:'カメ',quip:'かたい甲羅は3回タップ！',hp:3,travelMs:10500,damage:17,points:30},
 {id:'bass',name:'ブラックバス',short:'バス',quip:'速い！2回で捕まえろ。',hp:2,travelMs:6200,damage:15,points:20},
 {id:'cone',name:'コーンザリ将軍',short:'ザリ将軍',quip:'架空の大物。みんなで8回！',hp:8,travelMs:11500,damage:30,points:100}
]);
const lanes=()=>[0,1,2,3];
export const progress494=(e,at)=>Math.max(0,Math.min(1,(at-e.spawnAt)/e.travelMs));
export function wave494(elapsed){return elapsed<12000?{name:'家に着く前に、タップで捕獲！',hint:'左右スワイプで水路を切り替え',stage:0}:elapsed<30000?{name:'硬いカメ・速いバスが来た！',hint:'数字の回数だけタップして捕獲',stage:1}:elapsed<50000?{name:'大物襲来！ 危険な水路を援護！',hint:'捕獲でためて、全方向に大網！',stage:2}:{name:'全水門、開放！',hint:'最後の10秒、家を守り切れ！',stage:3}}
export function gates494(elapsed){if(elapsed<12000||elapsed>=50000)return[0,1,2,3];const n=Math.floor((elapsed-12000)/6000)%4;return[n,(n+1)%4]}
function rand(g){let x=g.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;g.rng=x>>>0;return g.rng/4294967296}
function event(g,kind,at,extra={}){g.events.push({id:++g.eventSerial,kind,at,...extra});if(g.events.length>72)g.events.splice(0,g.events.length-72)}
export function start494(g,now){
 if(g.phase!=='lobby')return false;
 if(!g.members.length||g.members.length>4||g.members.some(m=>!m.choice))throw Error('全員の魔物を選んでください');
 g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,choice:{id:m.choice.id,speciesId:m.choice.speciesId},seat,ai:false}));
 const bots=['slime','goblin','wolf','skeleton'],names=['網係スライム','長靴ゴブリン','見回りオオカミ','骨まで働く係'];
 while(g.players.length<4){const seat=g.players.length;g.players.push({playerId:`AI-${g.id}-${seat}`,name:names[seat],choice:{id:`ai-${seat}`,speciesId:bots[seat]},seat,ai:true})}
 g.startAt=now+CANAL494.countdown;g.endAt=g.startAt+CANAL494.duration;
 for(const p of g.players)Object.assign(p,{lane:p.seat,held:false,holdUntil:0,lastSeq:0,nextFireAt:g.startAt,burstAt:g.startAt,captured:0,assists:0,teamwork:0,points:0,bursts:0,hits:0,auto:false,lastAction:null});
 Object.assign(g,{rules492:1,rules494:1,phase:'countdown',simAt:g.startAt-100,nextSpawnAt:g.startAt+500,updatedAt:now,enemies:[],events:[],eventSerial:0,enemySerial:0,hp:100,captured:0,breaches:0,points:0,netEnergy:0,netMax:CANAL494.netMax,netUntil:0,megaCount:0,teamCatches:0,bySpecies:[0,0,0,0],bossMask:0});return true;
}
function spawn(g,at,lane,kind){
 if(g.enemies.length>=CANAL494.maxEnemies||g.enemies.filter(e=>e.lane===lane).length>=6)return;
 const elapsed=at-g.startAt;
 if(kind==null){const r=rand(g);kind=elapsed<12000?0:r<.42?0:r<.73?1:2}
 const used=new Set(g.enemies.filter(e=>e.lane===lane).map(e=>e.visualSlot493));const visualSlot493=[0,1,2,3,4,5].find(slot=>!used.has(slot));
 const s=SPECIES494[kind];g.enemies.push({id:++g.enemySerial,kind,lane,visualSlot493,hp:s.hp,maxHp:s.hp,spawnAt:at,travelMs:s.travelMs*(.94+rand(g)*.12)*(elapsed>=50000?.62:1),wiggle:rand(g),contributors:[]});
}
function hit(g,p,e,damage,at,mega){
 if(!g.enemies.some(x=>x.id===e.id))return;
 const helper=e.contributors?.some(x=>x.seat!==p.seat&&at-x.at<=3000);e.contributors??=[];e.contributors=e.contributors.filter(x=>at-x.at<=3000&&x.seat!==p.seat);e.contributors.push({seat:p.seat,at});
 e.hp-=damage;p.hits++;const base={enemyId:e.id,kindIndex:e.kind,lane:e.lane,progress:progress494(e,at),wiggle:e.wiggle,seat:p.seat,mega};
 if(e.hp>0){event(g,'hit',at,{...base,hp:e.hp});return}
 g.enemies=g.enemies.filter(x=>x.id!==e.id);const s=SPECIES494[e.kind];g.captured++;g.points+=s.points;p.captured++;p.points+=s.points;g.bySpecies[e.kind]++;
 if(e.lane!==p.seat)p.assists++;
 if(helper){g.teamCatches++;for(const x of e.contributors)g.players[x.seat].teamwork++}
 if(!mega)g.netEnergy=Math.min(CANAL494.netMax,g.netEnergy+(helper?2:1));
 event(g,'catch',at,{...base,assist:e.lane!==p.seat,teamwork:!!helper,points:s.points});
}
export function sweep494(g,p,lane,at,mega=false,targetId=null){
 if(g.phase!=='playing'||at<g.startAt||at>=g.endAt||!lanes(p.seat).includes(lane))return false;
 if(mega){
  if(g.netEnergy<CANAL494.netMax||at<g.netUntil)return false;
  g.netEnergy=0;g.netUntil=at+900;g.megaCount++;p.bursts++;p.lastAction={id:(p.lastAction?.id??0)+1,at,lane,burst:true,progress:.5};
  event(g,'mega',at,{seat:p.seat});for(const e of [...g.enemies])hit(g,p,e,3,at,true);return true;
 }
 if(at<p.nextFireAt)return false;
 const candidates=g.enemies.filter(e=>e.lane===lane).sort((a,b)=>progress494(b,at)-progress494(a,at)||a.id-b.id);
 const e=targetId==null?candidates[0]:candidates.find(e=>e.id===targetId);
 // Tapping a creature already captured by a teammate must not spend a stroke.
 if(!e)return false;
 p.nextFireAt=at+(p.ai||p.auto?CANAL494.aiFireMs:CANAL494.fireMs);p.lane=lane;
 p.lastAction={id:(p.lastAction?.id??0)+1,at,lane,burst:false,progress:progress494(e,at),enemyId:e.id,wiggle:e.wiggle};hit(g,p,e,1,at,false);return true;
}
export function input494(g,p,x,at){
 if(!p||p.ai||!['countdown','playing'].includes(g.phase)||!Number.isSafeInteger(x.seq)||x.seq<=p.lastSeq||x.seq>50000||!Number.isInteger(x.lane)||!lanes(p.seat).includes(x.lane)||x.held!==false||typeof x.pulse!=='boolean'||typeof x.burst!=='boolean')return false;
 if(x.targetId!=null&&(!Number.isSafeInteger(x.targetId)||x.targetId<1))return false;
 p.lastSeq=x.seq;p.lane=x.lane;p.held=false;p.holdUntil=0;
 if(x.burst)sweep494(g,p,x.lane,at,true);else if(x.pulse)sweep494(g,p,x.lane,at,false,x.targetId);return true;
}
function finish(g,at){g.phase='result';g.finishedAt=at;g.success=g.hp>0;g.grade=!g.success?'再出動':g.hp>=90?'S':g.hp>=60?'A':'B';for(const p of g.players){p.held=false;p.holdUntil=0}event(g,'finish',at,{success:g.success})}
export function advance494(g,now,connected=()=>true){
 if(!['countdown','playing'].includes(g.phase)||now<g.startAt)return;g.phase='playing';const until=Math.min(now,g.endAt);
 while(g.simAt+100<=until&&g.phase==='playing'){
  const at=g.simAt+=100,elapsed=at-g.startAt;
  if(at>=g.endAt){finish(g,g.endAt);break}
  if(elapsed===50000){g.nextSpawnAt=at;event(g,'flood',at)}
  for(const [i,time]of [32000,44000].entries())if(elapsed>=time&&!(g.bossMask&(1<<i))){g.bossMask|=1<<i;const lane=(Math.floor(g.rng/100)+i)%4;spawn(g,at,lane,3);event(g,'boss',at,{lane})}
  while(g.nextSpawnAt<=at){
   const t=g.nextSpawnAt,dt=t-g.startAt,open=gates494(dt);
   if(dt===500||dt>=50000)for(const lane of open)spawn(g,t,lane,dt===500?0:undefined);
   else spawn(g,t,dt<12000?Math.floor((dt-500)/1100)%4:open[Math.floor(rand(g)*open.length)]);
   const teamPace=1+.25*(g.players.filter(p=>!p.ai).length-1);
   g.nextSpawnAt+=dt<12000?1100:(dt<30000?400:dt<50000?290:950)/teamPace;
  }
  for(let n=0;n<4;n++){
   const p=g.players[(n+Math.floor(elapsed/100))%4];p.auto=!p.ai&&!connected(p.playerId);
   if(p.ai||p.auto){
    const allowed=lanes(p.seat),e=g.enemies.filter(e=>allowed.includes(e.lane)&&progress494(e,at)>=(e.lane===p.seat?.25:.94)).sort((a,b)=>(progress494(b,at)+(b.lane===p.seat?.3:0))-(progress494(a,at)+(a.lane===p.seat?.3:0)))[0];
    // Humans decide when to deploy their shared super net. All-AI recovery can use it.
    if(g.players.every(x=>x.ai||!connected(x.playerId))&&g.netEnergy>=CANAL494.netMax&&g.enemies.length>=5)sweep494(g,p,p.seat,at,true);
    if(e)sweep494(g,p,e.lane,at,false,e.id);
   }
  }
  for(const e of [...g.enemies])if(progress494(e,at)>=1){const damage=SPECIES494[e.kind].damage;g.hp=Math.max(0,g.hp-damage);g.breaches++;g.enemies=g.enemies.filter(x=>x.id!==e.id);event(g,'breach',at,{lane:e.lane,kindIndex:e.kind,damage})}
  if(g.hp<=0)finish(g,at);
 }
}
export function public494(g,selfId,now,connected=()=>true){return{
 id:g.id,code:g.code,hostId:g.hostId,game:g.game,rules492:1,rules494:1,phase:g.phase,revision:g.revision,startAt:g.startAt,endAt:g.endAt,simAt:g.simAt,serverNow:now,hp:g.hp,captured:g.captured,breaches:g.breaches,points:g.points,success:g.success,grade:g.grade,finishedAt:g.finishedAt,
 netEnergy:g.netEnergy,netMax:CANAL494.netMax,netUntil:g.netUntil,megaCount:g.megaCount,teamCatches:g.teamCatches,bySpecies:[...g.bySpecies],
 members:g.members.map(m=>({playerId:m.playerId,name:m.name,choice:m.choice?{id:m.choice.id,speciesId:m.choice.speciesId}:null,departed:!!m.departed})),
 players:g.players.map(p=>({playerId:p.playerId,name:p.name,choice:{id:p.choice.id,speciesId:p.choice.speciesId},seat:p.seat,ai:p.ai,auto:p.auto,connected:p.ai||!!connected(p.playerId),lane:p.lane,held:p.held,captured:p.captured,assists:p.assists,teamwork:p.teamwork,points:p.points,bursts:p.bursts,hits:p.hits,lastAction:p.lastAction?{...p.lastAction}:null,...(p.playerId===selfId?{lastSeq:p.lastSeq,nextFireAt:p.nextFireAt}:{})})),
 enemies:g.enemies.map(({contributors,...e})=>({...e})),events:g.events.filter(e=>now-e.at<2500).map(e=>({...e}))
}}
