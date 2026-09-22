import {freezeColors501} from '../party/GameColors501.js';
import {ITEMS508,item508,ATTACKS508} from './Items508.js';
import {publicLuck507,ranks507} from './Rules507.js';
export {ITEMS508,item508} from './Items508.js';
export const LUCK508 = Object.freeze({rounds:8,boxes:4,hand:4,countdownMs:3500,chestMs:15000,handMs:35000,minChooseMs:1500,revealMs:1600,castMs:2800,runMs:4800,settleMs:1700});
const copy = x=>JSON.parse(JSON.stringify(x));
const fail = x=>{throw Error(x)};
const integer = (x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
const shuffled = (a,randomInt)=>{for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
// Each chest has four distinct, uniformly shuffled items. No position/rank weighting.
// All entropy (including order and gamble) is sealed before anyone chooses.
export function drawPlan508(randomInt){return Array.from({length:8},()=>({order:shuffled([0,1,2,3],randomInt),seats:Array.from({length:4},()=>({boxes:Array.from({length:4},()=>shuffled(ITEMS508.map(x=>x.id),randomInt).slice(0,4)),autoBox:randomInt(4),autoItem:randomInt(4),waitBox:1500+randomInt(1501),waitItem:3000+randomInt(3001),coin:randomInt(2),tie:randomInt(4)}))}))}
function validPlan(plan){return Array.isArray(plan)&&plan.length===8&&plan.every(r=>Array.isArray(r.order)&&r.order.length===4&&new Set(r.order).size===4&&r.order.every(x=>integer(x,0,3))&&Array.isArray(r.seats)&&r.seats.length===4&&r.seats.every(p=>Array.isArray(p.boxes)&&p.boxes.length===4&&p.boxes.every(b=>Array.isArray(b)&&b.length===4&&new Set(b).size===4&&b.every(id=>ITEMS508.some(x=>x.id===id)))&&integer(p.autoBox,0,3)&&integer(p.autoItem,0,3)&&integer(p.waitBox,1500,3000)&&integer(p.waitItem,3000,6000)&&integer(p.coin,0,1)&&integer(p.tie,0,3)))}
export function makeLuck508({id,code,partyId,hostId,members,now=0}){return{id,code,game:'luck',rules508:1,partyId462:partyId,hostId,phase:'lobby',phaseAt:now,createdAt:now,updatedAt:now,revision:0,members:members.map(m=>({...m,choice:m.choice??null})),players:[],round:0,scaleMax:600,event:null,history:[],results:null,nextAt:null}}
export function startLuck508(g,at,plan){
 if(g.phase!=='lobby'||!g.members.length||g.members.length>4||g.members.some(m=>!m.choice))fail('全員の魔物を選んでください');
 if(!Number.isFinite(at)||!validPlan(plan))fail('抽選情報が不正です');
 g.plan508=copy(plan);g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,choice:{id:m.choice.id,speciesId:m.choice.speciesId},seat,ai:false,distance:0,engines:0,charged:false,autoRounds:0}));
 const bots=[['ころころスライム','slime'],['一発屋ゴブリン','goblin'],['追い風オオカミ','wolf'],['骨までラッキー','skeleton']];
 while(g.players.length<4){const seat=g.players.length,[name,speciesId]=bots[seat];g.players.push({playerId:`AI-${g.id}-${seat}`,name,choice:{id:'ai-'+seat,speciesId},seat,ai:true,distance:0,engines:0,charged:false,autoRounds:0})}
 freezeColors501(g.players,g.members,g.aiColors500);g.phase='countdown';g.phaseAt=at;g.startAt=at+LUCK508.countdownMs;g.nextAt=g.startAt;g.round=1;g.boxes508=[null,null,null,null];g.items508=[null,null,null,null];g.updatedAt=at;g.revision++;return g;
}
const draw = (g,seat)=>g.plan508[g.round-1].seats[seat];
const slots = g=>g.phase==='chest'?g.boxes508:g.items508;
function schedule(g){const ai=g.players.filter(p=>p.ai&&slots(g)[p.seat]===null).map(p=>g.phaseAt+(g.phase==='chest'?draw(g,p.seat).waitBox:draw(g,p.seat).waitItem));g.nextAt=slots(g).every(x=>x!==null)?Math.max(g.phaseAt+LUCK508.minChooseMs,g.lastChoiceAt??g.phaseAt):Math.min(g.deadline,...ai)}
function choosePhase(g,phase,at){g.phase=phase;g.phaseAt=at;g.deadline=at+(phase==='chest'?LUCK508.chestMs:LUCK508.handMs);g.lastChoiceAt=at;if(phase==='chest'){g.boxes508=[null,null,null,null];g.items508=[null,null,null,null];g.auto508=[false,false,false,false];g.event=null}schedule(g)}
export function chooseLuck508(g,id,kind,index,round,at){
 if(!['chest','hand'].includes(kind)||!integer(index,0,3)||!integer(round,1,8)||!Number.isFinite(at))fail('4つの中から1つ選んでください');
 const p=g.players.find(p=>p.playerId===id&&!p.ai);if(!p)fail('このレースには観戦で参加しています');
 const field=kind==='chest'?'box':'pick',prior=g.history.find(e=>e.round===round)?.rows.find(r=>r.playerId===id);
 if(prior?.[field]===index)return false;
 const choices=kind==='chest'?g.boxes508:g.items508;
 if(g.round===round&&choices[p.seat]===index)return false;
 if(g.phase!==kind||round!==g.round||at<g.phaseAt||at>=g.deadline)fail('この選択の受付は終了しました');
 if(choices[p.seat]!==null)fail('選択済みです。変更できません');
 choices[p.seat]=index;g.lastChoiceAt=at;schedule(g);g.updatedAt=at;g.revision++;return true;
}
// AI sees only its hand, public distances/equipment and remaining rounds, never opponents' picks.
export function aiPick508(g,p){const d=draw(g,p.seat),hand=d.boxes[g.boxes508[p.seat]],lead=Math.max(...g.players.map(o=>o.distance)),gap=lead-p.distance;
 const scores=hand.map((id,i)=>{const it=item508(id);let value=it.move;
  if(id==='engine')value+=Math.min(450,(8-g.round)*75);
  if(id==='battery')value+=g.round<8?250:0;
  if(id==='comet')value+=Math.min(700,gap/2);
  if(id==='dice')value=gap>700?720:430;
  if(id==='turbo')value=570;
  if(id==='shield')value+=p.distance===lead?220:100;
  if(id==='mirror')value+=130;
  if(id==='lightning')value+=270;
  if(id==='magnet')value+=230;
  if(id==='swap')value+=Math.max(0,gap)*.6;
  if(id==='shell')value+=p.distance<lead?100:0;
  if(id==='banana')value+=g.players.some(o=>o.distance>p.distance)?160:0;
  if(id==='pit')value+=g.players.some(o=>o.distance<p.distance)?230:0;
  return value+((i+d.autoItem)%4)*65;
 });return scores.indexOf(Math.max(...scores));}
function target508(g,seat,mode){const me=g.players[seat],d=draw(g,seat);let candidates=g.players.filter(p=>p.seat!==seat);
 if(mode==='ahead')candidates=candidates.filter(p=>p.distance>me.distance).sort((a,b)=>a.distance-b.distance);
 else if(mode==='behind')candidates=candidates.filter(p=>p.distance<me.distance).sort((a,b)=>b.distance-a.distance);
 else if(mode==='leader'){const top=Math.max(...g.players.map(p=>p.distance));candidates=candidates.filter(p=>p.distance===top)}
 else candidates.sort((a,b)=>b.distance-a.distance);
 if(!candidates.length)return null;const distance=candidates[0].distance,c=candidates.filter(p=>p.distance===distance);return c[d.tie%c.length].seat;
}
export function resolveRound508(g,at){
 const leader=Math.max(...g.players.map(p=>p.distance)),before=ranks507(g.players);
 const rows=g.players.map(p=>{const d=draw(g,p.seat),box=g.boxes508[p.seat],pick=g.items508[p.seat],it=item508(d.boxes[box][pick]);let base=it.id==='dice'?(d.coin?1400:-300):it.move;
  if(it.id==='comet')base+=Math.min(700,Math.floor((leader-p.distance)/2));
  const gain=(Math.max(0,base)+p.engines*100)*(p.charged?2:1);
  return{playerId:p.playerId,seat:p.seat,box,pick,item:it.id,from:p.distance,start:p.distance,gain,knockback:Math.max(0,-base),hit:false,mirrorUsed:false,engines:p.engines+(it.id==='engine'?1:0),charged:it.id==='battery',automatic:g.auto508[p.seat],beforeRank:before.find(x=>x.playerId===p.playerId).rank};
 });
 const attacks=[];
 function apply(kind,source,target,reflected=false){const a=rows[source],b=rows[target];let outcome='hit';
  if(b.item==='shield'||b.item==='spring'&&['banana','pit'].includes(kind))outcome='blocked';
  else if(b.item==='mirror'&&!b.mirrorUsed){b.mirrorUsed=true;outcome=reflected?'blocked':'reflected'}
  const hit={target,source,kind,outcome,amount:0,reflected};
  if(outcome==='reflected'){hit.returned=apply(kind,target,source,true);return hit}
  if(outcome==='blocked')return hit;
  b.hit=true;
  if(kind==='shell'){b.knockback+=100;hit.amount=100}
  if(kind==='banana'){b.knockback+=250;hit.amount=250}
  if(kind==='lightning'){const after=Math.floor(b.gain/2);hit.amount=b.gain-after;b.gain=after}
  if(kind==='pit'){hit.amount=b.gain;b.gain=0}
  if(kind==='magnet'){const n=Math.min(300,Math.floor(b.gain/2));b.gain-=n;a.gain+=n;hit.amount=n}
  if(kind==='swap'){[a.start,b.start]=[b.start,a.start];hit.amount=b.start-a.start}
  // A successful external hit disables every source of this round's turbo movement.
  if(b.item==='turbo')b.gain=0;
  if(a.item==='turbo'&&a.hit)a.gain=0;
  return hit;
 }
 for(const seat of g.plan508[g.round-1].order){const kind=rows[seat].item;if(!ATTACKS508.includes(kind))continue;
  const targets=kind==='lightning'?g.players.filter(p=>p.seat!==seat).map(p=>p.seat):[target508(g,seat,kind==='shell'?'leader':kind==='banana'?'ahead':kind==='pit'?'behind':'front')].filter(x=>x!==null);
  attacks.push({id:`${g.id}:${g.round}:${attacks.length}`,source:seat,item:kind,targets:targets.map(t=>apply(kind,seat,t))});
 }
 for(const r of rows){if(r.item==='turbo'&&r.hit)r.gain=0;r.to=Math.max(0,r.start+r.gain-r.knockback);r.delta=r.to-r.from}
 const after=ranks507(rows.map(r=>({playerId:r.playerId,distance:r.to})));for(const r of rows)r.afterRank=after.find(x=>x.playerId===r.playerId).rank;
 return{round:g.round,at,fromMax:g.scaleMax,toMax:Math.max(600,Math.ceil((Math.max(...rows.map(r=>r.to))+100)/100)*100),rows,attacks,castMs:attacks.length*LUCK508.castMs};
}
function reveal(g,at){g.event=resolveRound508(g,at);g.history.push(copy(g.event));g.phase='reveal';g.phaseAt=at;g.nextAt=at+LUCK508.revealMs}
export function advanceLuck508(g,now){if(!Number.isFinite(now))return false;let changed=false;
 for(let n=0;n<192&&!['lobby','result'].includes(g.phase)&&Number.isFinite(g.nextAt)&&now>=g.nextAt;n++){
  const at=g.nextAt;
  if(g.phase==='countdown')choosePhase(g,'chest',at);
  else if(['chest','hand'].includes(g.phase)){
   for(const p of g.players)if(slots(g)[p.seat]===null&&(at>=g.deadline||p.ai&&at>=g.phaseAt+(g.phase==='chest'?draw(g,p.seat).waitBox:draw(g,p.seat).waitItem))){const d=draw(g,p.seat);slots(g)[p.seat]=g.phase==='chest'?d.autoBox:p.ai?aiPick508(g,p):d.autoItem;g.auto508[p.seat]=true;g.lastChoiceAt=at}
   if(slots(g).every(x=>x!==null)&&at>=g.phaseAt+LUCK508.minChooseMs){if(g.phase==='chest')choosePhase(g,'hand',at);else reveal(g,at)}else schedule(g);
  }else if(g.phase==='reveal'){g.phase=g.event.attacks.length?'broadcast':'run';g.phaseAt=at;g.nextAt=at+(g.phase==='broadcast'?g.event.castMs:LUCK508.runMs)}
  else if(g.phase==='broadcast'){g.phase='run';g.phaseAt=at;g.nextAt=at+LUCK508.runMs}
  else if(g.phase==='run'){for(const p of g.players){const r=g.event.rows[p.seat];p.distance=r.to;p.engines=r.engines;p.charged=r.charged;if(r.automatic)p.autoRounds++}g.scaleMax=g.event.toMax;g.phase='settle';g.phaseAt=at;g.nextAt=at+LUCK508.settleMs}
  else if(g.phase==='settle'){if(g.round===8){g.phase='result';g.phaseAt=at;g.nextAt=null;g.results=ranks507(g.players);g.resultAt=at}else{g.round++;choosePhase(g,'chest',at)}}
  else break;
  g.updatedAt=at;g.revision++;changed=true;
 }return changed;
}
export function publicLuck508(g,selfId,connected=()=>true){
 if(g.rules508!==1)return publicLuck507(g,selfId,connected);
 const me=g.players.find(p=>p.playerId===selfId),choosing=['chest','hand'].includes(g.phase),seat=me?.seat;
 return{id:g.id,code:g.code,game:'luck',rules508:1,hostId:g.hostId,phase:g.phase,phaseAt:g.phaseAt,revision:g.revision,round:g.round,rounds:8,scaleMax:g.scaleMax,startAt:g.startAt??null,deadline:choosing?g.deadline:null,
 members:g.members.map(m=>({playerId:m.playerId,name:m.name,color499:m.color499,choice:m.choice?{id:m.choice.id,speciesId:m.choice.speciesId}:null})),
 players:g.players.map(p=>({playerId:p.playerId,name:p.name,choice:{...p.choice},seat:p.seat,ai:p.ai,color499:p.color499,distance:p.distance,engines:p.engines,charged:p.charged,connected:p.ai||!!connected(p.playerId),locked:choosing?slots(g)[p.seat]!==null:false})),
 ownBox:choosing&&me?g.boxes508[seat]:null,ownPick:g.phase==='hand'&&me?g.items508[seat]:null,
 hand:g.phase==='hand'&&me?[...draw(g,seat).boxes[g.boxes508[seat]]]:null,
 event:g.event?copy(g.event):null,history:copy(g.history),results:g.results?copy(g.results):null};
}
