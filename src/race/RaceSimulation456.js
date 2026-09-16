import{boostPower457}from'./RaceBoost457.js';
import{raceAssessment455}from'./RaceStrategy455.js';
export const SIM456={step:200,distance:1000,maxMs:40000,cooldown:2200,boostMs:1400,boostCost:10,maxBoosts:5};
const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
function random(s){let x=s.rng+=0x6D2B79F5;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296}
export const TACTICS456=[{id:'wind',name:'追い風',description:'一度だけ、自分の走る速さが8％上昇（2秒）。'},{id:'mud',name:'ぬかるみ',description:'一度だけ、すぐ前の1匹を7％減速（1.4秒）。重ね掛けで減速率は増えない。'},{id:'shield',name:'魔法障壁',description:'自分への妨害を1回防ぐ。'},{id:'draft',name:'吸い付き走法',description:'特技発動時に前の魔物が100m以内ならスタミナ12回復、2秒間4％加速。'}];
export function tactic456(racer){return TACTICS456[hash(racer.speciesId)%4]}
function event(s,type,i,target=null){s.events.push({id:++s.eventId,at:s.elapsed,type,i,target});if(s.events.length>16)s.events.shift()}
export function createSimulation456(racers,course,seed){const s={version:racers[0]?.rulesVersion>=5?5:4,rng:seed>>>0,elapsed:0,eventId:0,events:[],order:[],history:[],runners:[]};s.runners=racers.map(r=>({distance:0,velocity:0,stamina:100,boosts:0,boostUntil:0,lastBoost:-10000,boostSeq:0,slowUntil:0,windUntil:0,draftUntil:0,guard:tactic456(r).id==='shield',skillUsed:false,finishMs:null,luck:Math.exp((random(s)-.5)*.22),score:raceAssessment455(r,course).score}));return s}
export function boost456(s,index,seq){const x=s.runners[index];if(!x)throw Error('自分の出走魔物が見つかりません');if(!Number.isInteger(seq)||seq<1||seq>5)throw Error('操作番号が不正です');if(seq<=x.boostSeq)return false;if(seq!==x.boostSeq+1)throw Error('前の操作を確認してください');if(x.finishMs!==null||s.order.length===8)throw Error('ゴール後は操作できません');if(x.boosts>=5)throw Error('叩けるのは5回までです');if((s.version??4)<5&&s.elapsed-x.lastBoost<SIM456.cooldown)throw Error('少し待ってから叩いてください');if(x.stamina<SIM456.boostCost)throw Error('スタミナが足りません');x.stamina-=SIM456.boostCost;x.boosts++;x.boostSeq=seq;x.lastBoost=s.elapsed;x.boostUntil=s.elapsed+SIM456.boostMs;if(s.version>=5)(x.boostEnds457??=[]).push(x.boostUntil);event(s,'boost',index);return true}
function autoAt(r,n){if(r.rulesVersion>=5){const pattern=hash(r.speciesId)%3;return (pattern===0?[1200,1400,9000,16000,21000]:pattern===1?[4000,8000,12000,16500,21000]:[8000,14000,21000,21200,21400])[n]}const table=r.profile.style==='逃げ'?[1200,5400,9800,15000,20500]:r.profile.style==='追込'?[8000,11800,15500,19000,22500]:[4000,8000,12000,16500,21000];return table[n]}
export function advanceSimulation456(s,racers,target,autoIndices=[],record=true){const auto=new Set(autoIndices),until=Math.min(SIM456.maxMs,Math.floor(Math.max(0,target)/SIM456.step)*SIM456.step);while(s.elapsed<until&&s.order.length<8){
 const dt=SIM456.step/1000;
 for(let i=0;i<8;i++){const x=s.runners[i],r=racers[i];if(x.finishMs!==null)continue;
  if(auto.has(i)&&x.boosts<5&&s.elapsed>=autoAt(r,x.boosts)&&(s.version>=5||s.elapsed-x.lastBoost>=SIM456.cooldown)&&x.stamina>=SIM456.boostCost)boost456(s,i,x.boostSeq+1);
  const tactic=tactic456(r),activation=Math.max(5000,Math.min(17000,r.profile.skillAt));
  if(!x.skillUsed&&s.elapsed>=activation){x.skillUsed=true;const ahead=s.runners.map((v,j)=>({v,j})).filter(a=>a.j!==i&&a.v.finishMs===null&&a.v.distance>x.distance).sort((a,b)=>a.v.distance-b.v.distance)[0];
   if(tactic.id==='wind'){x.windUntil=s.elapsed+2000;event(s,'wind',i)}
   if(tactic.id==='mud'&&ahead){if(ahead.v.guard){ahead.v.guard=false;event(s,'shield',ahead.j,i)}else{ahead.v.slowUntil=s.elapsed+1400;event(s,'mud',i,ahead.j)}}
   if(tactic.id==='draft'&&ahead&&ahead.v.distance-x.distance<=100){x.stamina=Math.min(100,x.stamina+12);x.draftUntil=s.elapsed+2000;event(s,'draft',i,ahead.j)}
  }
 }
 // All movement uses positions from the same tick, not render timing or client clocks.
 for(let i=0;i<8;i++){const x=s.runners[i],r=racers[i];if(x.finishMs!==null)continue;const t=s.elapsed/1000,style=r.profile.style,pace=style==='逃げ'?(t<7?1.055:t>18?.97:1):style==='追込'?(t<9?.955:t>17?1.07:1):style==='差し'?(t<10?.98:t>13?1.035:1):1.005;
  const boost=s.version>=5?boostPower457(x,s.elapsed):x.boostUntil>s.elapsed?1.18:1,wind=x.windUntil>s.elapsed?1.08:1,draft=x.draftUntil>s.elapsed?1.04:1,slow=x.slowUntil>s.elapsed?.93:1,energy=x.stamina<20?.9+.1*x.stamina/20:1;
  x.velocity=42*Math.max(.7,1+(x.score-75)*.005)*x.luck*pace*boost*wind*draft*slow*energy*(.99+random(s)*.02);
  const old=x.distance;x.distance=Math.min(1000,old+x.velocity*dt);x.stamina=Math.max(0,x.stamina-dt*(1.9-(r.profile.stamina-70)*.008));
  if(x.distance>=1000){x.finishMs=s.elapsed+(1000-old)/x.velocity*1000;x.velocity=0}
 }
 s.elapsed+=SIM456.step;s.order=s.runners.map((x,i)=>({x,i})).filter(a=>a.x.finishMs!==null).sort((a,b)=>a.x.finishMs-b.x.finishMs||a.i-b.i).map(a=>a.i);
 if(record){s.history.push(s.runners.map(x=>x.distance));if(s.history.length>12)s.history.shift()}
 }
 return s
}
export function publicSimulation456(s){if(!s)return null;return{elapsed:s.elapsed,order:[...s.order],events:s.events,history:s.order.length===8?s.history:[],runners:s.runners.map(x=>({distance:x.distance,velocity:x.velocity,stamina:x.stamina,boosts:x.boosts,boostSeq:x.boostSeq,lastBoost:x.lastBoost,boostUntil:x.boostUntil,...(s.version>=5?{boostEnds457:x.boostEnds457??[]}:{}),slowUntil:x.slowUntil,windUntil:x.windUntil,draftUntil:x.draftUntil,guard:x.guard,finishMs:x.finishMs}))}}
export function simulationOutcome456(s){if(s.order.length!==8)throw Error('まだ全員ゴールしていません');return{order:[...s.order],finishMs:s.runners.map(x=>x.finishMs)}}
// Public forecast is an independent Monte Carlo estimate with standard five-use control.
// Actual race RNG is created only at the start and is never sent to clients.
export function forecastSimulation456(racers,course,samples=1024){const triples=Array(512).fill(0);for(let seed=1;seed<=samples;seed++){const s=createSimulation456(racers,course,hash('forecast456:'+seed));advanceSimulation456(s,racers,SIM456.maxMs,[0,1,2,3,4,5,6,7],false);if(s.order.length!==8)throw Error('レース試算が完走しません');const[a,b,c]=s.order;triples[a*64+b*8+c]++}return{samples,triples,assumption:'標準の5回操作を行った場合の出走前予測。実際の操作・特技で変動します。'}}
