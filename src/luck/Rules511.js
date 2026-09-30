import {factors575,rewardProgress575} from './Progress575.js';
import {copies571,count571 as count,total571,retain571,eligible571,milestone571} from './Buffs571.js';
import {freezeColors501} from '../party/GameColors501.js';
import {ITEMS511,item511,ATTACKS511,BIG511,DICE511} from './Items511.js';
import {publicLuck509} from './Rules509.js';
export {ITEMS511,item511} from './Items511.js';
export const LUCK511 = Object.freeze({rounds:8,boxes:4,hand:4,countdownMs:3500,chestMs:15000,handMs:35000,minChooseMs:1500,revealMs:1600,castMs:3200,diceMs:2400,runMs:4800,settleMs:1700});
export const rounds528=g=>g?.rounds===16?16:8;
const copy = x=>JSON.parse(JSON.stringify(x));
const fail = x=>{throw Error(x)};
const integer = (x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
const shuffled = (a,randomInt)=>{for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
// Outcomes are sealed on the server before choices. Final hands guarantee a finisher.
export function drawPlan511(randomInt,rounds=8){if(![8,16].includes(rounds))throw Error('8か16ラウンドを選んでください');return Array.from({length:rounds},(_,round)=>({order:shuffled([0,1,2,3],randomInt),seats:Array.from({length:4},()=>({boxes:Array.from({length:4},()=>{const hand=shuffled(ITEMS511.filter(x=>eligible571(x,round+1,rounds)).map(x=>x.id),randomInt).slice(0,4);if(round===rounds-1&&!hand.some(id=>BIG511.includes(id)))hand[randomInt(4)]=BIG511.filter(id=>eligible571(item511(id),round+1,rounds))[randomInt(BIG511.filter(id=>eligible571(item511(id),round+1,rounds)).length)];if(hand.every(id=>BIG511.includes(id))){const safe=ITEMS511.filter(x=>!BIG511.includes(x.id)&&eligible571(x,round+1,rounds));hand[randomInt(4)]=safe[randomInt(safe.length)].id;}return hand}),autoBox:randomInt(4),autoItem:randomInt(4),waitBox:1500+randomInt(1501),waitItem:3000+randomInt(3001),dice:[1+randomInt(6),1+randomInt(6),1+randomInt(6)],jackpot:1+randomInt(6),coin:randomInt(2),tie:randomInt(4)}))}))}
function validPlan(plan,rounds){return Array.isArray(plan)&&plan.length===rounds&&plan.every(r=>Array.isArray(r.order)&&r.order.length===4&&new Set(r.order).size===4&&r.order.every(x=>integer(x,0,3))&&Array.isArray(r.seats)&&r.seats.length===4&&r.seats.every(p=>Array.isArray(p.boxes)&&p.boxes.length===4&&p.boxes.every(b=>Array.isArray(b)&&b.length===4&&new Set(b).size===4&&b.every(id=>ITEMS511.some(x=>x.id===id)))&&integer(p.autoBox,0,3)&&integer(p.autoItem,0,3)&&integer(p.waitBox,1500,3000)&&integer(p.waitItem,3000,6000)&&Array.isArray(p.dice)&&p.dice.length===3&&p.dice.every(x=>integer(x,1,6))&&integer(p.jackpot,1,6)&&integer(p.coin,0,1)&&integer(p.tie,0,3)))}
export function makeLuck511({id,code,partyId,hostId,members,now=0}){return{id,code,game:'luck',rounds:8,rules511:1,itemRules571:1,itemRules575:1,partyId462:partyId,hostId,phase:'lobby',phaseAt:now,createdAt:now,updatedAt:now,revision:0,members:members.map(m=>({...m,choice:m.choice??null})),players:[],round:0,scaleMax:600,event:null,history:[],results:null,nextAt:null}}
export function startLuck511(g,at,plan){
 if(g.phase!=='lobby'||!g.members.length||g.members.length>4||g.members.some(m=>!m.choice))fail('全員の魔物を選んでください');
 if(!Number.isFinite(at)||!validPlan(plan,rounds528(g)))fail('抽選情報が不正です');
 g.itemRules571=1;g.plan511=copy(plan);g.players=g.members.map((m,seat)=>({playerId:m.playerId,name:m.name,choice:{id:m.choice.id,speciesId:m.choice.speciesId},seat,ai:false,distance:0,loadout:[],coils:0,strikes:0,attackHits:0,wings:0,wards:0,savings:0,suns:0,lastAdvance:0,autoRounds:0}));
 const bots=[['ころころスライム','slime'],['一発屋ゴブリン','goblin'],['追い風オオカミ','wolf'],['骨までラッキー','skeleton']];
 while(g.players.length<4){const seat=g.players.length,[name,speciesId]=bots[seat];g.players.push({playerId:`AI-${g.id}-${seat}`,name,choice:{id:'ai-'+seat,speciesId},seat,ai:true,distance:0,loadout:[],coils:0,strikes:0,attackHits:0,wings:0,wards:0,savings:0,suns:0,lastAdvance:0,autoRounds:0})}
 freezeColors501(g.players,g.members,g.aiColors500);g.phase='countdown';g.phaseAt=at;g.startAt=at+LUCK511.countdownMs;g.nextAt=g.startAt;g.round=1;g.boxes511=[null,null,null,null];g.items511=[null,null,null,null];g.updatedAt=at;g.revision++;return g;
}
const draw = (g,seat)=>g.plan511[g.round-1].seats[seat];
const slots = g=>g.phase==='chest'?g.boxes511:g.items511;
function schedule(g){const ai=g.players.filter(p=>p.ai&&slots(g)[p.seat]===null).map(p=>g.phaseAt+(g.phase==='chest'?draw(g,p.seat).waitBox:draw(g,p.seat).waitItem));g.nextAt=slots(g).every(x=>x!==null)?Math.max(g.phaseAt+LUCK511.minChooseMs,g.lastChoiceAt??g.phaseAt):Math.min(g.deadline,...ai)}
function choosePhase(g,phase,at){g.phase=phase;g.phaseAt=at;g.deadline=at+(phase==='chest'?LUCK511.chestMs:LUCK511.handMs);g.lastChoiceAt=at;if(phase==='chest'){g.boxes511=[null,null,null,null];g.items511=[null,null,null,null];g.auto511=[false,false,false,false];g.event=null}schedule(g)}
export function chooseLuck511(g,id,kind,index,round,at){
 if(!['chest','hand'].includes(kind)||!integer(index,0,3)||!integer(round,1,rounds528(g))||!Number.isFinite(at))fail('4つの中から1つ選んでください');
 const p=g.players.find(p=>p.playerId===id&&!p.ai);if(!p)fail('このレースには観戦で参加しています');
 const field=kind==='chest'?'box':'pick',prior=g.history.find(e=>e.round===round)?.rows.find(r=>r.playerId===id);
 if(prior?.[field]===index)return false;
 const choices=kind==='chest'?g.boxes511:g.items511;
 if(g.round===round&&choices[p.seat]===index)return false;
 if(g.phase!==kind||round!==g.round||at<g.phaseAt||at>=g.deadline)fail('この選択の受付は終了しました');
 if(choices[p.seat]!==null)fail('選択済みです。変更できません');
 choices[p.seat]=index;g.lastChoiceAt=at;schedule(g);g.updatedAt=at;g.revision++;return true;
}
// Exact integer metres internally; JSON uses numbers while safe, then decimal strings.
export const metres511 = x=>BigInt(x??0);
const packed=n=>n<=BigInt(Number.MAX_SAFE_INTEGER)&&n>=BigInt(Number.MIN_SAFE_INTEGER)?Number(n):n.toString();
const estimate511=x=>Math.min(1e12,Number(x??0));
const max=(a,b)=>a>b?a:b,min=(a,b)=>a<b?a:b;
const serial=x=>JSON.parse(JSON.stringify(x,(_k,v)=>typeof v==='bigint'?packed(v):v));
export function ranks511(players){return [...players].sort((a,b)=>metres511(a.distance)>metres511(b.distance)?-1:metres511(a.distance)<metres511(b.distance)?1:0).map(p=>({playerId:p.playerId,distance:p.distance,rank:1+players.filter(o=>metres511(o.distance)>metres511(p.distance)).length}))}
// AI uses public installed equipment and its own hand, never sealed dice or rival choices.
export function aiPick511(g,p){const d=draw(g,p.seat),hand=d.boxes[g.boxes511[p.seat]],lead=Math.max(...g.players.map(o=>estimate511(o.distance))),gap=lead-estimate511(p.distance),future=rounds528(g)-g.round;
 const scores=hand.map((id,i)=>{const it=item511(id);let value=it.move;
  if(it.persistent)value=value*(1+future*.6)+future*100;
  if(id==='turbine')value=200+future*500;
  if(id==='seed')value=(2**future-1)*100;
  if(id==='bond')value=Math.floor(future/2)*1800;
  if(id==='coil')value=100+future*400;
  if(id==='doubling')value=200+future*future*700;
  if(id==='bank')value=200*(future+1)*8;
  if(id==='solar')value=100+future*future*550;
  if(id==='forge')value=200*(future+1)*(future+2)/2;
  if(id==='echo')value=300+future*600+Math.min(1e9,Number(p.lastAdvance??0))*.5*future;
  if(id==='focus')value=300+future*900;
  if(['hunter','combo','salvage','streak'].includes(id))value=200+future*600;
  if(id==='pioneer')value=500+future*1000;
  if(['regalia','podium','frontier','usurper'].includes(id))value=250+future*700+(gap===0?600:0);
  if(id==='mile')value=200+Number(milestone571(p.distance,1000))*future*700;
  if(id==='interest')value=200+Number(milestone571(p.distance,500))*future*500;
  if(id==='resonance')value=total571(p.loadout)*future*500+(p.suns??0)*1000;
  if(id==='vault'||id==='phoenix')value=200+future*400;
  if(id==='sprint')value=4000+Math.min(1e9,Number(p.distance))*2;
  if(id==='crown')value=900+future*150;
  if(id==='overdrive')value=200+future*650;
  if(id==='triple')value=4287;if(id==='harvest')value=400*Math.max(1,total571(p.loadout))**2;
  if(id==='nova')value=12000;if(id==='dragon')value=estimate511(p.distance)+2000;
  if(['shield','mirror','ward'].includes(id))value+=g.players.filter(o=>o.seat!==p.seat).reduce((n,o)=>n+total571(o.loadout.filter(x=>ATTACKS511.includes(x.id)))*240,0);
  if(id==='product')value=1225;if(id==='mega')value=3300;if(id==='jackpot')value=gap>3000?4500:2800;
  if(id==='breaker')value+=lead*.3;if(id==='swap')value+=gap*.7;if(id==='sniper')value+=lead>2000?1200:0;
  if(BIG511.includes(id))value=(value+estimate511(p.savings)*8)*2**Math.min(12,p.coils+count(p.loadout,'battery'))*3**Math.min(8,p.suns??0);
  if(future===0&&it.persistent)value*=.2;
  return value*(.8+((i+d.autoItem)%4)*.17);
 });return scores.indexOf(Math.max(...scores));}
function target511(g,seat,mode,rows){const me=g.players[seat],d=draw(g,seat);let candidates=g.players.filter(p=>p.seat!==seat);
 if(mode==='ahead')candidates=candidates.filter(p=>metres511(p.distance)>metres511(me.distance));
 if(mode==='behind')candidates=candidates.filter(p=>metres511(p.distance)<metres511(me.distance));
 if(mode==='leader'){const top=g.players.reduce((n,p)=>max(n,metres511(p.distance)),0n);candidates=candidates.filter(p=>metres511(p.distance)===top)}
 // Earlier thieves can remove the best target's equipment in this same round.
 // Rank only equipment that is still present and was equipped before this round.
 const stealable=p=>rows[p.seat].loadout.filter(x=>x.round<g.round);
 const metric=p=>mode==='sniper'?rows[p.seat].planned:mode==='wrench'?BigInt(count(stealable(p),'turbine')*100+count(stealable(p),'engine')):metres511(p.distance);
 if(mode==='sniper')candidates=candidates.filter(p=>metric(p)>=2000n);if(mode==='wrench')candidates=candidates.filter(p=>metric(p)>0n);
 candidates.sort((a,b)=>metric(a)===metric(b)?0:metric(a)>metric(b)?(mode==='ahead'?1:-1):(mode==='ahead'?-1:1));
 if(!candidates.length)return null;const c=candidates.filter(p=>metric(p)===metric(candidates[0]));return c[d.tie%c.length].seat;
}
export function resolveRound511(g,at){
 const leader=g.players.reduce((n,p)=>max(n,metres511(p.distance)),0n),before=ranks511(g.players);
 const rows=g.players.map(p=>{const d=draw(g,p.seat),box=g.boxes511[p.seat],pick=g.items511[p.seat],it=item511(d.boxes[box][pick]),loadout=copy(p.loadout);
  if(it.persistent)loadout.push({id:it.id,round:g.round,...(it.id==='interest'?{entryDistance:p.distance}:{})});
  const amplified=it.id==='resonance'?2:1;if(amplified===2)for(const gear of loadout)if(!ATTACKS511.includes(gear.id))gear.stack=copies571(gear)*2;
  const active=loadout.filter(x=>x.round<=g.round),grown=active.filter(x=>x.round<g.round),big=BIG511.includes(it.id);
  let base=BigInt(it.persistent?0:it.move),passive=0n,seed=0n,bond=0n,forge=0n;
  const focus=count(active,'focus')*2,faces=d.dice.map(v=>v+focus),jackpot=d.jackpot+focus;
  if(it.id==='dice')base=faces[0]>=4?1400n:-300n;
  if(it.id==='product')base=BigInt(faces[0])*BigInt(faces[1])*100n;
  if(it.id==='triple')base=BigInt(faces[0])*BigInt(faces[1])*BigInt(faces[2])*100n;
  if(it.id==='harvest')base=400n*BigInt(Math.max(1,total571(loadout)))**2n;
  if(it.id==='dragon')base=metres511(p.distance)+2000n;
  if(it.id==='jackpot')base=jackpot>=6?20000n:0n;
  if(it.id==='sprint')base=4000n+metres511(p.distance)*2n;
  if(it.id==='comet')base+=(leader-metres511(p.distance))/2n;
  for(const gear of active){const copies=BigInt(copies571(gear));passive+=BigInt(item511(gear.id).move)*copies;const age=g.round-gear.round;
   if(gear.id==='forge')forge+=200n*BigInt(age)*copies;
   if(gear.id==='seed'&&age>0)seed+=100n*2n**BigInt(age-1)*copies;
   if(gear.id==='bond'&&age>0&&age%2===0)bond+=2400n*copies;
  }
  const turbines=count(grown,'turbine'),coils=p.coils*amplified+count(grown,'coil'),usedCoils=big?coils:0,batteries=big?count(active,'battery'):0;
  const saved=metres511(p.savings)*BigInt(amplified)+200n*BigInt(count(active,'bank')),cash=big?saved*8n:0n;
  const suns=(p.suns??0)*amplified+(big?0:count(active,'solar')),usedSuns=big?suns:0;
  const doubling=grown.filter(x=>x.id==='doubling').reduce((n,x)=>n+(g.round-x.round)*copies571(x),0);
  // Keep the half-metre until every amplifier has been applied. Two amplifiers
  // must give exactly 100%, including an odd previous advance.
  const echoTwice=metres511(p.lastAdvance)*BigInt(count(grown,'echo')),echo=echoTwice/2n;
  const crowns=g.round===rounds528(g)?count(active,'crown'):0,overdrive=count(grown,'overdrive')*(big?2:1);
  const strikes=(p.strikes??0)*amplified,usedStrikes=big?strikes:0,wings=(p.wings??0)*amplified;
  const factors={...factors575(active,g.round,metres511(p.distance)===leader&&g.players.filter(o=>metres511(o.distance)===leader).length===1),growth:2n**BigInt(doubling),solar:3n**BigInt(usedSuns),coil:2n**BigInt(usedCoils),hunt:2n**BigInt(usedStrikes),combo:BigInt(1+(p.attackHits??0))**BigInt(count(grown,'combo')),miles:milestone571(p.distance,1000)**BigInt(count(active,'mile')),pioneer:3n**BigInt(count(grown,'pioneer')),interest:active.filter(x=>x.id==='interest').reduce((n,x)=>n*milestone571(x.entryDistance,500)**BigInt(copies571(x)),1n),wings:1n+BigInt(wings),battery:2n**BigInt(batteries),overdrive:2n**BigInt(overdrive),crown:5n**BigInt(crowns),turbine:3n**BigInt(turbines)};
  const baseTwice=(max(0n,base)+passive+seed+bond+forge+cash)*2n+echoTwice,denominator=2n**BigInt(turbines+1);
  const gain=Object.values(factors).reduce((n,x)=>n*x,baseTwice)/denominator;
  const vault=count(active,'vault');
  const beforeAttacks={savings:big?0n:saved,suns:big?retain571(suns,vault):suns,coils:big?retain571(coils,vault):coils,strikes:big?retain571(strikes,vault):strikes,attackHits:p.attackHits??0,wings,wards:(p.wards??0)*amplified+count(active,'ward'),guards:count(active,'shield'),mirrors:count(active,'mirror')};
  return{playerId:p.playerId,seat:p.seat,box,pick,item:it.id,from:metres511(p.distance),start:metres511(p.distance),gain,planned:gain,knockback:max(0n,-base),stopped:false,hit:false,loadout,initialLoadout571:copy(loadout),...beforeAttacks,beforeAttacks,revenge:count(grown,'revenge'),automatic:g.auto511[p.seat],beforeRank:before.find(x=>x.playerId===p.playerId).rank,
   calculation:{baseTwice,factors,turbineDenominator:2n**BigInt(turbines),spent:{suns:usedSuns,coils:usedCoils,strikes:usedStrikes,savings:big?saved:0n},base,passive,seed,bond,forge,cash,echo,echoTwice,doubling,overdrive,crowns,suns:usedSuns,focus,turbines,coils:usedCoils,batteries,wardAdded:count(active,'ward'),dice:DICE511.includes(it.id)?it.id==='jackpot'?[jackpot]:faces.slice(0,it.id==='triple'?3:it.id==='product'?2:1):null,rawDice:DICE511.includes(it.id)?it.id==='jackpot'?[d.jackpot]:d.dice.slice(0,it.id==='triple'?3:it.id==='product'?2:1):null,jackpot:it.id==='jackpot'?jackpot:null,planned:gain}};
 });
 const attacks=[];
 function apply(kind,source,target,strength,reflected=false){const a=rows[source],b=rows[target];let outcome='hit',guard='';
  if(count(b.loadout,'spring')&&['banana','pit'].includes(kind)){outcome='blocked';guard='spring'}
  else if(b.guards>0){b.guards--;outcome='blocked';guard='shield'}
  else if(b.mirrors>0){b.mirrors--;outcome=reflected?'blocked':'reflected';guard='mirror'}
  else if(b.wards>0){b.wards--;outcome='blocked';guard='ward'}
  const hit={target,source,kind,outcome,amount:0n,reflected,guard,strength};
  if(outcome==='blocked'||outcome==='reflected'){hit.guardCharge=count(b.loadout,'salvage');b.coils+=hit.guardCharge;}
  if(outcome==='reflected'){hit.returned=apply(kind,target,source,strength,true);return hit}
  if(outcome==='blocked')return hit;
  if(kind==='wrench'){
   const eligible=b.loadout.map((x,i)=>({...x,i})).filter(x=>['turbine','engine'].includes(x.id)&&x.round<g.round).sort((x,y)=>(x.id==='turbine'?0:1)-(y.id==='turbine'?0:1));
   if(!eligible.length){hit.outcome='miss';return hit}
   // Strength steals more pieces; copies join next round and cannot fire recursively now.
   hit.stolen=[];let left=strength;
   for(const gear of eligible){if(!left)break;const index=b.loadout.findIndex(x=>x.id===gear.id&&x.round===gear.round),available=copies571(b.loadout[index]),n=Math.min(left,available);if(n===available)b.loadout.splice(index,1);else b.loadout[index].stack=available-n;a.loadout.push({id:gear.id,round:g.round,stack:n});hit.stolen.push({id:gear.id,fromRound:gear.round,count:n});hit.amount+=BigInt(n);left-=n;}
  }
  const loss=n=>n/2n**BigInt(count(b.loadout,'anchor'));

  if(kind==='shell'||kind==='banana'){hit.amount=min(max(0n,b.start+b.gain-b.knockback),loss(BigInt((kind==='shell'?100:250)*strength)));b.knockback+=hit.amount}
  if(kind==='breaker'){const remaining=b.from*7n**BigInt(strength)/10n**BigInt(strength);hit.amount=min(max(0n,b.start+b.gain-b.knockback),loss(b.from-remaining));b.knockback+=hit.amount}
  if(kind==='lightning'){const after=b.gain/2n**BigInt(strength);hit.amount=b.gain-after;b.gain=after}
  if(kind==='pit'||kind==='sniper'){hit.amount=b.gain;b.gain=0n;b.stopped=true}
  if(kind==='magnet'){const available=max(0n,b.start-b.knockback),n=loss(available-available*7n**BigInt(strength)/10n**BigInt(strength));b.knockback+=n;a.gain+=n;hit.amount=n;}
  if(kind==='swap'){[a.start,b.start]=[b.start,a.start];hit.amount=b.start-a.start}
  if(hit.amount!==0n){b.hit=true;b.coils+=b.revenge;a.attackHits++;hit.charge=count(a.loadout,'hunter');a.strikes+=hit.charge;}
  if(hit.amount!==0n&&['turbo','mega'].includes(b.item))b.gain=0n;
  if(['turbo','mega'].includes(a.item)&&a.hit)a.gain=0n;
  return hit;
 }
 // Freeze installed triggers before resolving attacks: theft never changes this round's firing order.
 const triggers=rows.map(r=>ATTACKS511.map(kind=>({kind,strength:count(r.loadout.filter(x=>x.round<=g.round),kind)+(r.item===kind&&!item511(kind).persistent?1:0)})).filter(x=>x.strength));
 for(const seat of g.plan511[g.round-1].order){const volleys=[];
  for(const {kind,strength} of triggers[seat]){
   const target=kind==='lightning'?null:target511(g,seat,kind==='shell'||kind==='breaker'||kind==='magnet'?'leader':kind==='banana'?'ahead':kind==='pit'?'behind':kind==='sniper'?'sniper':kind==='wrench'?'wrench':'front',rows);
   const targets=kind==='lightning'?g.players.filter(p=>p.seat!==seat).map(p=>p.seat):target===null?[]:[target];
   volleys.push({item:kind,strength,targets:targets.map(t=>apply(kind,seat,t,strength))});
  }
  if(volleys.length)attacks.push({id:`${g.id}:${g.round}:${seat}`,source:seat,item:volleys[0].item,volleys,targets:volleys.flatMap(v=>v.targets)});
 }
 for(const r of rows){if(r.stopped||['turbo','mega'].includes(r.item)&&r.hit||r.hit&&r.planned>0n&&r.gain===0n){r.gain=0n;r.stopped=true;}if(BIG511.includes(r.item)&&r.stopped&&count(r.loadout,'phoenix')){const used=r.calculation.spent;r.suns+=used.suns-r.beforeAttacks.suns;r.coils+=used.coils-r.beforeAttacks.coils;r.strikes+=used.strikes-r.beforeAttacks.strikes;r.savings+=used.savings;r.refunded571=true;}if(!r.hit)r.wings+=count(r.loadout,'streak');r.to=max(0n,r.start+r.gain-r.knockback);r.delta=r.to-r.from;r.lastAdvance=max(0n,r.delta)}
 const after=ranks511(rows.map(r=>({playerId:r.playerId,distance:r.to})));for(const r of rows)r.afterRank=after.find(x=>x.playerId===r.playerId).rank;
 rewardProgress575(rows,g.round,rounds528(g));
 return serial({round:g.round,itemRules562:1,itemRules571:1,itemRules575:1,at,fromMax:g.scaleMax,toMax:rows.reduce((n,r)=>max(n,r.to+100n),600n),rows,attacks,castMs:attacks.length*LUCK511.castMs,diceOrder:g.plan511[g.round-1].order.filter(seat=>DICE511.includes(rows[seat].item)),diceMs:rows.filter(r=>DICE511.includes(r.item)).length*LUCK511.diceMs});
}

function reveal(g,at){g.event=resolveRound511(g,at);g.history.push(copy(g.event));g.phase='reveal';g.phaseAt=at;g.nextAt=at+LUCK511.revealMs}
export function advanceLuck511(g,now){if(!Number.isFinite(now))return false;let changed=false;
 for(let n=0;n<192&&!['lobby','result'].includes(g.phase)&&Number.isFinite(g.nextAt)&&now>=g.nextAt;n++){
  const at=g.nextAt;
  if(g.phase==='countdown')choosePhase(g,'chest',at);
  else if(['chest','hand'].includes(g.phase)){
   for(const p of g.players)if(slots(g)[p.seat]===null&&(at>=g.deadline||p.ai&&at>=g.phaseAt+(g.phase==='chest'?draw(g,p.seat).waitBox:draw(g,p.seat).waitItem))){const d=draw(g,p.seat);slots(g)[p.seat]=g.phase==='chest'?d.autoBox:p.ai?aiPick511(g,p):d.autoItem;g.auto511[p.seat]=true;g.lastChoiceAt=at}
   if(slots(g).every(x=>x!==null)&&at>=g.phaseAt+LUCK511.minChooseMs){if(g.phase==='chest')choosePhase(g,'hand',at);else reveal(g,at)}else schedule(g);
  }else if(g.phase==='reveal'){g.phase=g.event.diceOrder.length?'dice':g.event.attacks.length?'broadcast':'run';g.phaseAt=at;g.nextAt=at+(g.phase==='dice'?g.event.diceMs:g.phase==='broadcast'?g.event.castMs:LUCK511.runMs)}
  else if(g.phase==='dice'){g.phase=g.event.attacks.length?'broadcast':'run';g.phaseAt=at;g.nextAt=at+(g.phase==='broadcast'?g.event.castMs:LUCK511.runMs)}
  else if(g.phase==='broadcast'){g.phase='run';g.phaseAt=at;g.nextAt=at+LUCK511.runMs}
  else if(g.phase==='run'){for(const p of g.players){const r=g.event.rows[p.seat];p.distance=r.to;p.loadout=copy(r.loadout);p.coils=r.coils;p.wards=r.wards;p.savings=r.savings;p.suns=r.suns;p.strikes=r.strikes;p.attackHits=r.attackHits;p.wings=r.wings;p.lastAdvance=r.lastAdvance;if(r.automatic)p.autoRounds++}g.scaleMax=g.event.toMax;g.phase='settle';g.phaseAt=at;g.nextAt=at+LUCK511.settleMs}
  else if(g.phase==='settle'){if(g.round===rounds528(g)){g.phase='result';g.phaseAt=at;g.nextAt=null;g.results=ranks511(g.players);g.resultAt=at}else{g.round++;choosePhase(g,'chest',at)}}
  else break;
  g.updatedAt=at;g.revision++;changed=true;
 }return changed;
}
export function publicLuck511(g,selfId,connected=()=>true){
 if(g.rules511!==1)return publicLuck509(g,selfId,connected);
 const me=g.players.find(p=>p.playerId===selfId),choosing=['chest','hand'].includes(g.phase),seat=me?.seat;
 return{id:g.id,code:g.code,game:'luck',rules511:1,itemRules562:1,itemRules571:g.itemRules571??0,itemRules575:g.itemRules575??0,hostId:g.hostId,phase:g.phase,phaseAt:g.phaseAt,revision:g.revision,round:g.round,rounds:rounds528(g),scaleMax:g.scaleMax,startAt:g.startAt??null,deadline:choosing?g.deadline:null,
 members:g.members.map(m=>({playerId:m.playerId,name:m.name,color499:m.color499,choice:m.choice?{id:m.choice.id,speciesId:m.choice.speciesId}:null})),
 players:g.players.map(p=>({playerId:p.playerId,name:p.name,choice:{...p.choice},seat:p.seat,ai:p.ai,color499:p.color499,distance:p.distance,loadout:copy(p.loadout),coils:p.coils,wards:p.wards,savings:p.savings,suns:p.suns,strikes:p.strikes??0,attackHits:p.attackHits??0,wings:p.wings??0,lastAdvance:p.lastAdvance,connected:p.ai||!!connected(p.playerId),locked:choosing?slots(g)[p.seat]!==null:false})),
 ownBox:choosing&&me?g.boxes511[seat]:null,ownPick:g.phase==='hand'&&me?g.items511[seat]:null,
 hand:g.phase==='hand'&&me?[...draw(g,seat).boxes[g.boxes511[seat]]]:null,
 event:g.event?copy(g.event):null,history:copy(g.history),results:g.results?copy(g.results):null};
}
