import {LUCK509,metres509} from './Rules509.js';
import {banner509,broadcastFrame509,distance509} from './Presentation509.js';
export {distance509 as distance510,fullDistance509 as fullDistance510,delta509 as delta510,equipment509 as equipment510,gearList509 as gearList510,hitLabel509 as hitLabel510} from './Presentation509.js';
export const broadcastFrame510=broadcastFrame509;
export const SPAN510=2000;
const Q=1000000n,PROGRESS=1000000000000n,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>x*x*(3-2*x),abs=x=>x<0n?-x:x;
const fast=new Set(['rocket','turbo','comet','mega','jackpot']);
const floorDiv=(a,b)=>a>=0n?a/b:-((-a+b-1n)/b);
const mod=(a,b)=>((a%b)+b)%b;
const progress=(item,t)=>ease(fast.has(item)?clamp((t-.1)/.86):t);
// Fixed-point world coordinates preserve nearby gaps even when total metres exceed 2^53.
function atRow(row,t){const k=BigInt(Math.round(progress(row.item,t)*Number(PROGRESS)));return metres509(row.from)*Q+(metres509(row.to)-metres509(row.from))*Q*k/PROGRESS}
function miniPosition(value,domain){return 4+Number(value*92000000n/domain)/1000000}
export function paintKey510(g,at,ready,pending,reduced){
 const ms=Math.max(0,at-g.phaseAt);let tick='';
 if(['chest','hand'].includes(g.phase))tick=Math.ceil(Math.max(0,g.deadline-at)/1000);
 else if(g.phase==='countdown')tick=Math.ceil(Math.max(0,g.startAt-at)/1000);
 else if(g.phase==='broadcast')tick=reduced?Math.min(g.event.attacks.length-1,Math.floor(ms/LUCK509.castMs)):Math.floor(Math.min(ms,g.event.castMs)/16.667);
 else if(g.phase==='run')tick=reduced?'still':Math.floor(Math.min(ms,LUCK509.runMs)/16.667);
 return[g.id,g.revision,g.phase,g.round,g.phaseAt,tick,ready,JSON.stringify(pending),g.ownBox,g.ownPick].join(':');
}
export function animating510(g,at,reduced){return !reduced&&['run','broadcast'].includes(g?.phase)&&at>=g.phaseAt&&at<g.phaseAt+(g.phase==='run'?LUCK509.runMs:g.event.castMs)}
export function banner510(g,self){return g.phase==='power'?{title:'',sub:''}:banner509(g,self)}
// Crossing trails are bounded afterimages only for sub-frame/high-speed passes.
// Ordinary passing racers always use their real relative coordinates.
const crossings=new WeakMap();
export function passages510(event,focusSeat){
 if(!event)return[];let bySeat=crossings.get(event);if(!bySeat){bySeat=new Map();crossings.set(event,bySeat)}if(bySeat.has(focusSeat))return bySeat.get(focusSeat);
 const me=event.rows[focusSeat],out=[];
 for(const r of event.rows){if(r.seat===focusSeat)continue;const gap=t=>atRow(r,t)-atRow(me,t);let last=gap(0),lastT=0;
  for(let i=1;i<=128;i++){const t=i/128,next=gap(t);
   if(last!==0n&&next!==0n&&(last<0n)!==(next<0n)){
    let lo=lastT,hi=t,negative=last<0n;for(let n=0;n<46;n++){const mid=(lo+hi)/2;if((gap(mid)<0n)===negative)lo=mid;else hi=mid}const center=(lo+hi)/2;
    const step=1/1000000,rate=Number(gap(clamp(center+step))-gap(clamp(center-step)))/Number(Q)/(2*step*LUCK509.runMs),duration=Math.abs(rate)>0?SPAN510/Math.abs(rate):Infinity;
    if(duration<190)out.push({seat:r.seat,at:center*LUCK509.runMs,direction:negative?1:-1,duration:260});
   }
   if(next!==0n){last=next;lastT=t}
  }
 }
 bySeat.set(focusSeat,out);return out;
}
export function raceFrame510(g,at,selfId,reduced=false){
 const run=g.phase==='run',t=run?(reduced?1:clamp((at-g.phaseAt)/LUCK509.runMs)):['settle','result'].includes(g.phase)?1:0;
 const focusSeat=(g.players.find(p=>p.playerId===selfId)??g.players[0])?.seat??0;
 const rows=g.players.map(p=>{const r=g.event?.rows[p.seat],item=r?.item??'dash',q=r?atRow(r,t):metres509(p.distance)*Q,moving=run&&!reduced&&t>0&&t<1&&metres509(r?.to??p.distance)!==metres509(r?.from??p.distance);
  let y=0,angle=0;const direction=r&&metres509(r.to)<metres509(r.from)?-1:1;
  if(moving){const envelope=Math.sin(Math.PI*t);if(fast.has(item)&&direction>0){y=-14*envelope;angle=-10*envelope}else if(item==='spring'){y=-24*Math.abs(Math.sin(t*Math.PI*3));angle=6*Math.sin(t*12)}else if(direction<0){angle=-24*envelope;y=-8*envelope}else{y=-Math.abs(Math.sin(t*90))*5*envelope;angle=Math.sin(t*90)*4*envelope}}
  const step=1/10000,velocity=r?Number(atRow(r,clamp(t+step))-atRow(r,clamp(t-step)))/Number(Q)/(2*step*LUCK509.runMs/1000):0;
  return{seat:p.seat,q,exact:(q/Q).toString(),item,y,angle,direction,moving,velocity,trail:moving&&Math.abs(velocity)>160,guard:run&&((p.loadout??[]).some(x=>['shield','mirror','ward'].includes(x.id))||['shield','mirror','ward'].includes(item)),delta:r?.delta??0};
 });
 const focus=rows[focusSeat],focusQ=focus.q,cameraQ=focusQ-1000n*Q,domain=rows.reduce((n,r)=>r.q>n?r.q:n,600n*Q)+100n*Q;
 for(const r of rows){const gap=r.q-focusQ;r.gap=(gap/Q).toString();r.rawX=50+Number(gap)/(Number(Q)*20);r.x=r.rawX;r.offscreen=gap< -1000n*Q?'left':gap>1000n*Q?'right':'';r.visible=!r.offscreen;r.mini=miniPosition(r.q,domain);r.rank=1+rows.filter(o=>o.q>r.q).length;r.focus=r.seat===focusSeat;r.gapLabel=r.offscreen?distance509((abs(gap)/Q).toString())+(gap<0n?'後ろ':'先'):'';
  r.afterimage=null;if(run&&!reduced){const age=at-g.phaseAt,pass=passages510(g.event,focusSeat).find(p=>p.seat===r.seat&&Math.abs(age-p.at)<p.duration/2);if(pass){const k=(age-pass.at)/pass.duration+.5;r.afterimage={x:pass.direction>0?-12+k*124:112-k*124,direction:pass.direction,opacity:.75*Math.sin(Math.PI*k)}}}
 }
 const first=floorDiv(cameraQ,500n*Q);
 const marks=Array.from({length:7},(_,i)=>{const metres=(first+BigInt(i))*500n;return{distance:metres.toString(),x:Number(metres*Q-cameraQ)/Number(Q)/20,hidden:metres<0n}});
 const velocity=run&&!reduced?focus.velocity:0,speed=clamp(Math.log2(1+Math.abs(velocity)/100)/8);
 return{rows,focusSeat,focusQ,cameraQ,span:SPAN510,t,speed,velocity,direction:velocity<0?-1:1,boost:focus.trail,marks,domain:(domain/Q).toString()};
}
// Ground, foreground and horizon all derive from the same world camera. No distance cap.
// Modulo is applied before floating point conversion to avoid giant CSS translations.
export function courseOffsets510(frame,stageWidth,trackWidth){
 const w=BigInt(Math.max(1,Math.round(stageWidth*1000))),tile=BigInt(Math.max(1,Math.round(trackWidth*1000))),den=Q*BigInt(SPAN510)*100n;
 const offset=ratio=>Number(mod(frame.cameraQ*w*BigInt(ratio),tile*den))/Number(den)/1000;
 return{ground:offset(100),horizon:offset(22),near:offset(280)};
}
export function markerLabel510(value){const n=metres509(value);if(abs(n)<1000000000n)return n.toLocaleString('en-US')+'m';return '…'+mod(n,1000000n).toString().padStart(6,'0')+'m'}
