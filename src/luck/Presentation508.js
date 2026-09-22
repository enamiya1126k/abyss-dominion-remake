import {LUCK508,item508} from './Rules508.js';
export const clamp508 = x=>Math.max(0,Math.min(1,x));
const ease = x=>x*x*(3-2*x);
export const delta508 = n=>(n>0?'+':'')+Math.round(n)+'m';
export const equipment508 = p=>[p.engines?`毎回 +${p.engines*100}m`:'',p.charged?'次回 ×2':''].filter(Boolean).join(' · ');
export function paintKey508(g,at,ready,pending,reduced){
 const ms=Math.max(0,at-g.phaseAt);let tick='';
 if(['chest','hand'].includes(g.phase))tick=Math.ceil(Math.max(0,g.deadline-at)/1000);
 else if(g.phase==='countdown')tick=Math.ceil(Math.max(0,g.startAt-at)/1000);
 else if(g.phase==='broadcast')tick=reduced?Math.floor(ms/LUCK508.castMs):Math.floor(Math.min(ms,g.event.castMs)/32);
 else if(g.phase==='run')tick=reduced?'still':Math.floor(Math.min(ms,LUCK508.runMs)/32);
 return[g.id,g.revision,g.phase,g.round,g.phaseAt,tick,ready,JSON.stringify(pending),g.ownBox,g.ownPick].join(':');
}
export function raceFrame508(g,at,selfId,reduced=false){
 const run=g.phase==='run',t=run?(reduced?1:clamp508((at-g.phaseAt)/LUCK508.runMs)):['settle','result'].includes(g.phase)?1:0;
 const rows=g.players.map(p=>{const r=g.event?.rows[p.seat],item=r?.item??'dash';let k=ease(t);
  if(['rocket','turbo','comet'].includes(item))k=ease(clamp508((t-.1)/.86));
  const distance=r?r.from+(r.to-r.from)*k:p.distance;let y=0,angle=0;
  if(run&&!reduced&&t>0&&t<1){
   const amp=Math.sin(Math.PI*t);
   if(['rocket','turbo','comet'].includes(item)&&r.gain>0){y=-16*amp;angle=-12*amp}
   else if(item==='spring'){y=-30*Math.abs(Math.sin(t*Math.PI*3));angle=8*Math.sin(t*12)}
   else if(r.to<r.from){angle=-330*Math.sin(Math.PI*t);y=-14*amp}
   else{y=-Math.abs(Math.sin(t*70))*5*amp;angle=Math.sin(t*70)*5*amp}
  }
  return{seat:p.seat,distance,item,y,angle,trail:run&&!reduced&&t>.12&&t<.96&&r?.gain>=450,guard:run&&['shield','mirror'].includes(item),delta:r?.delta??0};
 });
 const focus=rows.find(r=>g.players[r.seat].playerId===selfId)??rows[0],boost=run&&focus.trail;
 const anchor=34+(boost?ease(clamp508(t/.3))*10*Math.sin(Math.PI*t):0),span=520,camera=(focus?.distance??0)-span*anchor/100;
 const domain=Math.max(600,...rows.map(r=>r.distance+100));
 for(const r of rows){r.rawX=(r.distance-camera)/span*100;r.x=Math.max(7,Math.min(93,r.rawX));r.offscreen=r.rawX<7?'left':r.rawX>93?'right':'';r.mini=4+92*r.distance/domain;r.rank=1+rows.filter(o=>Math.round(o.distance)>Math.round(r.distance)).length}
 return{rows,camera,span,t,speed:run&&!reduced?Math.sin(Math.PI*t):0,boost,marks:Array.from({length:7},(_,i)=>{const distance=(Math.floor(camera/100)+i)*100;return{distance,x:(distance-camera)/span*100}})};
}
export function broadcastFrame508(g,at,reduced=false){
 if(g.phase!=='broadcast'||!g.event?.attacks.length)return null;
 const age=Math.max(0,at-g.phaseAt),index=Math.min(g.event.attacks.length-1,Math.floor(age/LUCK508.castMs)),attack=g.event.attacks[index],t=reduced ? .88 : clamp508((age-index*LUCK508.castMs)/LUCK508.castMs);
 const impact=t>=.55,returned=t>=.79,flight=ease(clamp508((t-.2)/.35));
 const targets=attack.targets.map(hit=>({...hit,visible:impact,returnVisible:returned}));
 return{attack,index,t,impact,returned,flight,targets,all:attack.item==='lightning',beat:t<.2?'launch':t<.55?'travel':t<.79?'impact':'result'};
}
export function banner508(g,selfId){
 if(g.phase==='chest')return{title:'運命の宝箱を、ひとつ。',sub:'どの箱にも、ランダムな4つのアイテム。'};
 if(g.phase==='hand')return{title:g.ownPick!=null?'勝負の一手、セット。':'この4つで、どう仕掛ける？',sub:g.players.some(p=>p.playerId===selfId)?'みんなの選択は、一斉公開まで秘密。':'みんなの一手を見守ろう。'};
 if(g.phase==='reveal')return{title:'いっせーので、発動！',sub:''};
 if(g.phase==='broadcast')return{title:'',sub:''};
 if(g.phase==='run')return{title:'',sub:''};
 if(g.phase==='settle'){const me=g.event?.rows.find(r=>r.playerId===selfId),lead=g.event?.rows.find(r=>r.afterRank===1&&r.beforeRank===4);return{title:g.round===8?'フィニッシュ！':lead?'最後尾から、一気に先頭！':me?delta508(me.delta):'順位が動いた！',sub:me?`${me.afterRank}位 · ${me.to}m`:''}};
 return{title:'',sub:''};
}
export function hitLabel508(hit){return hit.outcome==='blocked'?'ガード！':hit.outcome==='reflected'?'反射！':hit.kind==='swap'?'入れ替わった！':hit.kind==='magnet'?'横取り！':hit.kind==='lightning'?'直撃！':hit.kind==='pit'?'落下！':'直撃！'}
