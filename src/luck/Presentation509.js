import {LUCK509,item509,metres509} from './Rules509.js';
export const clamp509 = x=>Math.max(0,Math.min(1,x));
const ease = x=>x*x*(3-2*x);
export function fullDistance509(n){return metres509(typeof n==='number'?Math.round(n):n).toLocaleString('en-US')+'m'}
export function distance509(n){const x=metres509(typeof n==='number'?Math.round(n):n),neg=x<0n,v=neg?-x:x,units=['','万','億','兆','京','垓','秭','穣','溝','澗','正','載','極'];let i=0,div=1n;while(v/div>=10000n&&i<units.length-1){i++;div*=10000n}if(v/div>=10000n){const s=v.toString();return(neg?'−':'')+s[0]+'.'+s.slice(1,3)+'e'+(s.length-1)+'m'}const scaled=v*10n/div;return(neg?'−':'')+(i?(scaled<1000n?(Number(scaled)/10).toFixed(scaled%10n?1:0):(scaled/10n).toString())+units[i]:v.toLocaleString('en-US'))+'m'}
export const delta509=n=>(metres509(n)>0n?'+':'')+distance509(n);
export const gearList509=p=>{const out=[];for(const g of p.loadout??[]){const old=out.find(x=>x.id===g.id);if(old)old.count++;else out.push({id:g.id,count:1})}return out};
export const equipment509=p=>`装備 ${(p.loadout??[]).length}個${p.coils?' · コイル'+p.coils:''} ▾`;
export function formula509(c){if(!c)return'';const parts=[];if(c.dice)parts.push(`${c.dice[0]} × ${c.dice[1]} × 100`);else if(c.jackpot)parts.push(c.jackpot===6?'6！ 大当たり 20,000':'大砲は不発 0');else if(metres509(c.base)>0n)parts.push(distance509(c.base));if(metres509(c.passive))parts.push('装備 '+distance509(c.passive));if(metres509(c.seed))parts.push('苗 '+distance509(c.seed));if(metres509(c.bond))parts.push('定期便 '+distance509(c.bond));let s=parts.join(' + ')||'0';if(c.turbines||c.coils||c.batteries)s='('+s+')';if(c.turbines)s+=' ×'+(1.5**c.turbines);if(c.coils)s+=' ×'+(2n**BigInt(c.coils)).toString();if(c.batteries)s+=' ×'+(2n**BigInt(c.batteries)).toString();return s}

export function paintKey509(g,at,ready,pending,reduced){
 const ms=Math.max(0,at-g.phaseAt);let tick='';
 if(['chest','hand'].includes(g.phase))tick=Math.ceil(Math.max(0,g.deadline-at)/1000);
 else if(g.phase==='countdown')tick=Math.ceil(Math.max(0,g.startAt-at)/1000);
 else if(g.phase==='power')tick=reduced?'still':Math.floor(Math.min(ms,LUCK509.powerMs)/80);
 else if(g.phase==='broadcast')tick=reduced?Math.floor(ms/LUCK509.castMs):Math.floor(Math.min(ms,g.event.castMs)/32);
 else if(g.phase==='run')tick=reduced?'still':Math.floor(Math.min(ms,LUCK509.runMs)/32);
 return[g.id,g.revision,g.phase,g.round,g.phaseAt,tick,ready,JSON.stringify(pending),g.ownBox,g.ownPick].join(':');
}
export function raceFrame509(g,at,selfId,reduced=false){
 const run=g.phase==='run',t=run?(reduced?1:clamp509((at-g.phaseAt)/LUCK509.runMs)):['settle','result'].includes(g.phase)?1:0;
 const rows=g.players.map(p=>{const r=g.event?.rows[p.seat],item=r?.item??'dash';let k=ease(t);
  if(['rocket','turbo','comet','mega','jackpot'].includes(item))k=ease(clamp509((t-.1)/.86));
  const exact=r?metres509(r.from)+(metres509(r.to)-metres509(r.from))*BigInt(Math.round(k*1000000))/1000000n:metres509(p.distance),distance=Number(exact);let y=0,angle=0;
  if(run&&!reduced&&t>0&&t<1){
   const amp=Math.sin(Math.PI*t);
   if(['rocket','turbo','comet','mega','jackpot'].includes(item)&&r.gain>0){y=-16*amp;angle=-12*amp}
   else if(item==='spring'){y=-30*Math.abs(Math.sin(t*Math.PI*3));angle=8*Math.sin(t*12)}
   else if(metres509(r.to)<metres509(r.from)){angle=-330*Math.sin(Math.PI*t);y=-14*amp}
   else{y=-Math.abs(Math.sin(t*70))*5*amp;angle=Math.sin(t*70)*5*amp}
  }
  return{seat:p.seat,distance,exact:exact.toString(),progress:k,item,y,angle,trail:run&&!reduced&&t>.12&&t<.96&&r?.gain>=450,guard:run&&((p.loadout??[]).some(x=>['shield','mirror','ward'].includes(x.id))||['shield','mirror','ward'].includes(item)),delta:r?.delta??0};
 });
 const focus=rows.find(r=>g.players[r.seat].playerId===selfId)??rows[0],boost=run&&focus.trail;
 const anchor=34+(boost?ease(clamp509(t/.3))*10*Math.sin(Math.PI*t):0),span=Math.max(520,Math.abs(focus?.distance??0)*Number.EPSILON*100),camera=(focus?.distance??0)-span*anchor/100;
 const domain=Math.max(600,...rows.map(r=>r.distance+100));
 for(const r of rows){r.rawX=(r.distance-camera)/span*100;r.x=Math.max(7,Math.min(93,r.rawX));r.offscreen=r.rawX<7?'left':r.rawX>93?'right':'';r.mini=4+92*r.distance/domain;r.rank=1+rows.filter(o=>metres509(o.exact)>metres509(r.exact)).length}
 const capped=v=>Math.max(-6000,Math.min(6000,Number(v))),past=(g.history??[]).filter(e=>e.round<g.round).reduce((n,e)=>n+capped(e.rows[focus.seat].delta),0),current=g.event?.rows[focus.seat];
 const visualCamera=past+(current?capped(current.delta)*focus.progress:0)-520*anchor/100;
 return{rows,camera,visualCamera,span,t,speed:run&&!reduced?Math.sin(Math.PI*t):0,boost,marks:Array.from({length:7},(_,i)=>{const step=10**Math.ceil(Math.log10(span/6)),distance=(Math.floor(camera/step)+i)*step;return{distance,x:(distance-camera)/span*100}})};
}
export function broadcastFrame509(g,at,reduced=false){
 if(g.phase!=='broadcast'||!g.event?.attacks.length)return null;
 const age=Math.max(0,at-g.phaseAt),index=Math.min(g.event.attacks.length-1,Math.floor(age/LUCK509.castMs)),attack=g.event.attacks[index],t=reduced?.88:clamp509((age-index*LUCK509.castMs)/LUCK509.castMs);
 const impact=t>=.55,returned=t>=.79,flight=ease(clamp509((t-.2)/.35)),targets=[];
 for(const hit of attack.targets){const old=targets.find(x=>x.target===hit.target);if(!old)targets.push({...hit,hits:[hit],visible:impact,returnVisible:returned});else{old.hits.push(hit);if(hit.outcome==='hit'){old.outcome='hit';old.kind=hit.kind}if(hit.returned)old.returned=hit.returned}}
 return{attack:{...attack,targets},index,t,impact,returned,flight,targets,all:targets.length>1,beat:t<.2?'launch':t<.55?'travel':t<.79?'impact':'result'};
}
export function banner509(g,selfId){
 if(g.phase==='chest')return{title:'運命の宝箱を、ひとつ。',sub:'どの箱にも、ランダムな4つのアイテム。'};
 if(g.phase==='hand')return{title:g.ownPick!=null?'勝負の一手、セット。':'この4つで、どう仕掛ける？',sub:g.players.some(p=>p.playerId===selfId)?'みんなの選択は、一斉公開まで秘密。':'みんなの一手を見守ろう。'};
 if(g.phase==='power')return{title:'',sub:''};
 if(g.phase==='reveal')return{title:'装備を重ねて、発動！',sub:''};
 if(g.phase==='broadcast')return{title:'',sub:''};
 if(g.phase==='run')return{title:'',sub:''};
 if(g.phase==='settle'){const me=g.event?.rows.find(r=>r.playerId===selfId),lead=g.event?.rows.find(r=>r.afterRank===1&&r.beforeRank===4);return{title:g.round===8?'フィニッシュ！':lead?'最後尾から、一気に先頭！':me?delta509(me.delta):'順位が動いた！',sub:me?`${me.afterRank}位 · ${distance509(me.to)}`:''}};
 return{title:'',sub:''};
}
export function hitLabel509(hit){return hit.outcome==='miss'?'空振り！':hit.outcome==='blocked'?'ガード！':hit.outcome==='reflected'?'反射！':hit.kind==='swap'?'入れ替わった！':hit.kind==='magnet'?'横取り！':hit.kind==='lightning'?'直撃！':hit.kind==='pit'?'落下！':'直撃！'}
