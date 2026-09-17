import{boostLimit462,boostCost462,planTemperament462}from'./RaceRules462.js';
import{course459,coursePoint459,temperament459}from'./RaceCourse459.js';
import{boostPower457}from'./RaceBoost457.js';
import{raceAssessment455}from'./RaceStrategy455.js';
export const SIM456={step:200,distance:1000,maxMs:40000,cooldown:2200,boostMs:1400,boostCost:10,maxBoosts:5};
const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
function random(s){let x=s.rng+=0x6D2B79F5;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296}
export const TACTICS456=[{id:'wind',name:'追い風',description:'一度だけ、自分の走る速さが8％上昇（2秒）。'},{id:'mud',name:'ぬかるみ',description:'一度だけ、すぐ前の1匹を7％減速（1.4秒）。重ね掛けで減速率は増えない。'},{id:'shield',name:'魔法障壁',description:'自分への妨害を1回防ぐ。'},{id:'draft',name:'吸い付き走法',description:'特技発動時に前の魔物が100m以内ならスタミナ12回復、2秒間4％加速。'}];
export function tactic456(racer){return TACTICS456[hash(racer.speciesId)%4]}
function event(s,type,i,target=null){s.events.push({id:++s.eventId,at:s.elapsed,type,i,target});if(s.events.length>16)s.events.shift()}
export function createSimulation456(racers,course,seed){const s={version:racers[0]?.rulesVersion>=8?8:racers[0]?.rulesVersion>=7?7:racers[0]?.rulesVersion>=5?5:4,rng:seed>>>0,elapsed:0,eventId:0,events:[],order:[],history:[],runners:[]};if(s.version>=7){s.track459=course459(racers[0]?.track459);s.distance=s.track459.distance;s.maxMs=90000;s.front459=racers.filter(r=>r.profile.style==='逃げ').length}s.runners=racers.map(r=>({distance:0,velocity:0,stamina:100,boosts:0,boostUntil:0,lastBoost:-10000,boostSeq:0,slowUntil:0,windUntil:0,draftUntil:0,guard:tactic456(r).id==='shield',skillUsed:false,finishMs:null,luck:Math.exp((random(s)-.5)*.22),score:raceAssessment455(r,course).score,...(s.version>=7?{hesitate459:random(s)<temperament459(r.bond459).chance,hesitated459:false,pendingBoost459:[]}: {}),...(s.version>=8?planTemperament462(r,()=>random(s)):{})}));return s}
export function boost456(s,index,seq){const x=s.runners[index];if(!x)throw Error('自分の出走魔物が見つかりません');if(!Number.isInteger(seq)||seq<1||seq>boostLimit462(s))throw Error('操作番号が不正です');if(seq<=x.boostSeq)return false;if(seq!==x.boostSeq+1)throw Error('前の操作を確認してください');if(x.finishMs!==null||s.order.length===8)throw Error('ゴール後は操作できません');if(x.boosts>=boostLimit462(s))throw Error(`叩けるのは${boostLimit462(s)}回までです`);if((s.version??4)<5&&s.elapsed-x.lastBoost<SIM456.cooldown)throw Error('少し待ってから叩いてください');const cost=boostCost462(s);if(x.stamina+1e-9<cost)throw Error('スタミナが足りません');x.boosts++;x.boostSeq=seq;x.lastBoost=s.elapsed;if(s.version>=8&&x.ignored462<2&&x.commandRolls462[seq-1]<x.temperament462.ignore){x.ignored462++;event(s,'ignore462',index);return true}x.stamina-=cost;if(s.version>=8&&x.temperament462.ignore===0){x.loyalUntil462=s.elapsed+SIM456.boostMs;event(s,'loyal462',index)}if(s.version===7&&x.hesitate459&&!x.hesitated459){x.hesitated459=true;x.pendingBoost459.push(s.elapsed+600);event(s,'hesitate',index)}else{x.boostUntil=s.elapsed+SIM456.boostMs;if(s.version>=5)(x.boostEnds457??=[]).push(x.boostUntil);event(s,'boost',index)}return true}
function autoAt(r,n){if(r.rulesVersion>=8){const total=boostLimit462(r),pattern=hash(r.speciesId)%3;return 1000+(21000-1000)*((n+(pattern===0?.2:pattern===1?.5:.8))/total)}if(r.rulesVersion>=5){const pattern=hash(r.speciesId)%3;return (pattern===0?[1200,1400,9000,16000,21000]:pattern===1?[4000,8000,12000,16500,21000]:[8000,14000,21000,21200,21400])[n]}const table=r.profile.style==='逃げ'?[1200,5400,9800,15000,20500]:r.profile.style==='追込'?[8000,11800,15500,19000,22500]:[4000,8000,12000,16500,21000];return table[n]}
export function advanceSimulation456(s,racers,target,autoIndices=[],record=true){const auto=new Set(autoIndices),until=Math.min(s.maxMs??SIM456.maxMs,Math.floor(Math.max(0,target)/SIM456.step)*SIM456.step);while(s.elapsed<until&&s.order.length<8){
 const dt=SIM456.step/1000,length=s.distance??1000,scale=s.version>=7?s.track459.seconds/24:1;
 for(let i=0;i<8;i++){const x=s.runners[i],r=racers[i];if(x.finishMs!==null)continue;
  if(s.version>=8){if(x.restAt462>=0&&s.elapsed>=x.restAt462){x.restAt462=-1;x.restUntil462=s.elapsed+1000;event(s,'rest462',i)}if(x.surgeAt462>=0&&s.elapsed>=x.surgeAt462){x.surgeAt462=-1;x.surgeUntil462=s.elapsed+1400;event(s,'surge462',i)}}
  if(s.version>=7)for(let j=x.pendingBoost459.length-1;j>=0;j--)if(x.pendingBoost459[j]<=s.elapsed){const due=x.pendingBoost459.splice(j,1)[0];x.boostUntil=Math.max(x.boostUntil,due+SIM456.boostMs);(x.boostEnds457??=[]).push(due+SIM456.boostMs);event(s,'obey',i)}
  if(auto.has(i)&&x.boosts<boostLimit462(s)&&s.elapsed>=autoAt(r,x.boosts)*scale&&(s.version>=5||s.elapsed-x.lastBoost>=SIM456.cooldown)&&x.stamina>=boostCost462(s))boost456(s,i,x.boostSeq+1);
  const tactic=tactic456(r),activation=Math.max(5000,Math.min(17000,r.profile.skillAt))*scale;
  if(!x.skillUsed&&s.elapsed>=activation){x.skillUsed=true;const ahead=s.runners.map((v,j)=>({v,j})).filter(a=>a.j!==i&&a.v.finishMs===null&&a.v.distance>x.distance).sort((a,b)=>a.v.distance-b.v.distance)[0];
   if(tactic.id==='wind'){x.windUntil=s.elapsed+2000;event(s,'wind',i)}
   if(tactic.id==='mud'&&ahead){if(ahead.v.guard){ahead.v.guard=false;event(s,'shield',ahead.j,i)}else{ahead.v.slowUntil=s.elapsed+1400;event(s,'mud',i,ahead.j)}}
   if(tactic.id==='draft'&&ahead&&ahead.v.distance-x.distance<=length*.1){x.stamina=Math.min(100,x.stamina+12);x.draftUntil=s.elapsed+2000;event(s,'draft',i,ahead.j)}
  }
 }
 // All movement uses positions from the same tick, not render timing or client clocks.
 for(let i=0;i<8;i++){const x=s.runners[i],r=racers[i];if(x.finishMs!==null)continue;const t=s.elapsed/1000/scale,style=r.profile.style,pace=style==='逃げ'?(t<7?1.055:t>18?.97:1):style==='追込'?(t<9?.955:t>17?1.07:1):style==='差し'?(t<10?.98:t>13?1.035:1):1.005;
  const boost=s.version>=5?boostPower457(x,s.elapsed):x.boostUntil>s.elapsed?1.18:1,wind=x.windUntil>s.elapsed?1.08:1,draft=x.draftUntil>s.elapsed?1.04:1,slow=x.slowUntil>s.elapsed?.93:1,energy=x.stamina<20?.9+.1*x.stamina/20:1;
  const corner=s.version>=7&&coursePoint459(x.distance/length,s.track459).corner?Math.max(.88,Math.min(1.08,1+(r.profile.technique-70)*.006)):1,pacePressure=s.version>=7&&s.front459>=3&&style==='逃げ'?(t<7?1.025:t>17?.97:1):1;
  const temperament=s.version>=8?x.temperament462.pace*(x.restUntil462>s.elapsed?.12:1)*(x.surgeUntil462>s.elapsed?1.45:1):1;
  x.velocity=temperament*(s.version>=7?length/s.track459.seconds:42)*corner*pacePressure*Math.max(.7,1+(x.score-75)*.005)*x.luck*pace*boost*wind*draft*slow*energy*(.99+random(s)*.02);
  const old=x.distance;x.distance=Math.min(length,old+x.velocity*dt);const drain=s.version>=7?(1.9-(r.profile.stamina-70)*.02)/scale*(length===500?.8:length===3000?1.3:length===1600?1.1:1)*(s.front459>=3&&style==='逃げ'&&t<7?1.2:1):1.9-(r.profile.stamina-70)*.008;x.stamina=Math.max(0,x.stamina-dt*drain*(s.version>=8?.65:1));
  if(x.distance>=length){x.finishMs=s.elapsed+(length-old)/x.velocity*1000;x.velocity=0}
 }
 s.elapsed+=SIM456.step;s.order=s.runners.map((x,i)=>({x,i})).filter(a=>a.x.finishMs!==null).sort((a,b)=>a.x.finishMs-b.x.finishMs||a.i-b.i).map(a=>a.i);
 if(record){s.history.push(s.runners.map(x=>x.distance));if(s.history.length>12)s.history.shift()}
 }
 return s
}
export function publicSimulation456(s){if(!s)return null;return{...(s.version>=7?{distance:s.distance,track459:s.track459}:{}),elapsed:s.elapsed,order:[...s.order],events:s.events,history:s.order.length===8?s.history:[],runners:s.runners.map(x=>({distance:x.distance,velocity:x.velocity,stamina:x.stamina,boosts:x.boosts,boostSeq:x.boostSeq,lastBoost:x.lastBoost,boostUntil:x.boostUntil,...(s.version>=5?{boostEnds457:x.boostEnds457??[]}:{}),slowUntil:x.slowUntil,windUntil:x.windUntil,draftUntil:x.draftUntil,guard:x.guard,finishMs:x.finishMs,...(s.version>=7?{pendingBoost459:x.pendingBoost459}: {}),...(s.version>=8?{restUntil462:x.restUntil462,surgeUntil462:x.surgeUntil462,loyalUntil462:x.loyalUntil462}: {})}))}}
export function simulationOutcome456(s){if(s.order.length!==8)throw Error('まだ全員ゴールしていません');return{order:[...s.order],finishMs:s.runners.map(x=>x.finishMs)}}
// Public forecast is an independent Monte Carlo estimate with standard five-use control.
// Actual race RNG is created only at the start and is never sent to clients.
export function forecastSimulation456(racers,course,samples=1024){const triples=Array(512).fill(0);for(let seed=1;seed<=samples;seed++){const s=createSimulation456(racers,course,hash('forecast456:'+seed));advanceSimulation456(s,racers,s.maxMs??SIM456.maxMs,[0,1,2,3,4,5,6,7],false);if(s.order.length!==8)throw Error('レース試算が完走しません');const[a,b,c]=s.order;triples[a*64+b*8+c]++}return{samples,triples,assumption:`標準の${boostLimit462(racers[0])}回操作を行った場合の出走前予測。距離・なつき度・気まぐれも含む試算で、実際の操作・特技で変動します。`}}
