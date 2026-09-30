import {MULTIPLIERS571,count571,copies571,milestone571} from './Buffs571.js';
const big=x=>BigInt(x??0);
export function number571(x){const n=big(x),s=n.toString();return s.length<=18?n.toLocaleString('ja-JP'):`約${s[0]}.${s.slice(1,4)}×10^${s.length-1}`;}
export const power571=(base,n)=>number571(BigInt(base)**BigInt(n??0));
function ratio571(n,d){n=big(n);d=big(d);if(d===1n)return number571(n);if(n%d===0n)return number571(n/d);if(d===2n)return number571(n/2n)+'.5';if(n.toString().length<15&&d.toString().length<15)return String(Number(n)/Number(d));return `(${number571(n)}÷${number571(d)})`;}
export function factors571(calculation){return MULTIPLIERS571.filter(([key])=>big(calculation.factors?.[key]??1)!==1n).map(([key,label])=>({key,label,value:key==='turbine'?ratio571(calculation.factors[key],calculation.turbineDenominator):number571(calculation.factors[key])}));}
export function formula571(calculation){
 if(!calculation?.factors)return '';
 const base=ratio571(calculation.baseTwice,2),factors=factors571(calculation);
 return `${base}m${factors.map(x=>' × '+x.value).join('')} ＝ ${number571(calculation.planned)}m`;
}
export const factorLabels571=c=>factors571(c).map(x=>`${x.label} ×${x.value}`).join(' · ');
export function stock571(p,round){const added=round?count571((p.loadout??[]).filter(x=>x.round<round),'coil'):0;return [['太陽',p.suns,3],['コイル',(p.coils??0)+added,2],['命中チャージ',p.strikes,2]].filter(([,n])=>n>0).map(([label,n,base])=>`${label}${label==='コイル'&&added?`${p.coils??0}+今回${added}`:n}個 → 大技×${power571(base,n)}`).join(' · ');}
export function gearEffect571(id,p,round){
 const gear=p.loadout??[],n=count571(gear,id),old=gear.filter(x=>x.round<round),grown=count571(old,id);
 const effects={
  regalia:()=>`今回、開始時単独1位なら前進×${power571(4,grown)}（新規装備分は次回から）`,
  podium:()=>`勲章${gear.filter(x=>x.id===id).map(x=>x.medals575??0).join("・")}個 → 育成倍率×${power571(2,gear.filter(x=>x.id===id).reduce((v,x)=>v+(x.medals575??0)*copies571(x),0))}（獲得分は次の回から）`,
  frontier:()=>`覚醒${gear.filter(x=>x.id===id&&x.awake575).reduce((v,x)=>v+copies571(x),0)}個 → 前進×${power571(8,gear.filter(x=>x.id===id&&x.awake575).reduce((v,x)=>v+copies571(x),0))}（覚醒した次の回から）`,
  usurper:()=>`未達成${gear.filter(x=>x.id===id&&!x.claimed575).reduce((v,x)=>v+copies571(x),0)}個。前半に2位以下→単独1位で太陽+3/個、一度限り`,
  solar:()=>`装備${n}個：大技以外で太陽+${n}個／回。蓄積${p.suns??0}個 → 次の大技×${power571(3,p.suns)}`,
  coil:()=>`装備${n}個：今回の補充+${grown}個。蓄積${p.coils??0}個 → 大技×${power571(2,p.coils)}`,
  hunter:()=>`装備${n}個：命中した相手1人につき+${n}個。蓄積${p.strikes??0}個 → 大技×${power571(2,p.strikes)}`,
  focus:()=>`各出目+${n*2}。6を超えて有効`,
  combo:()=>`攻撃成功${p.attackHits??0}回 → 前進×${power571(1+(p.attackHits??0),grown)}`,
  doubling:()=>`今回の成長倍率×${power571(2,old.filter(x=>x.id===id).reduce((a,x)=>a+(round-x.round)*copies571(x),0))}`,
  mile:()=>`累計${number571(p.distance)}m → 前進×${number571(milestone571(p.distance,1000)**BigInt(n))}`,
  pioneer:()=>`今回の前進×${power571(3,grown)}`,
  interest:()=>`記録の倍率×${number571(gear.filter(x=>x.id===id).reduce((v,x)=>v*milestone571(x.entryDistance,500)**BigInt(copies571(x)),1n))}`,
  streak:()=>`羽${p.wings??0}枚 → 前進×${number571(1+(p.wings??0))}`,
  vault:()=>`消費後もチャージの${n===1?'1/2':n<10?`${2**n-1}/${2**n}`:`1−1/2^${n}`}が残る`,
  bank:()=>`貯金${number571(p.savings)}m → 大技の土台+${number571(big(p.savings)*8n)}m`,
  battery:()=>`大技×${power571(2,n)}`,
  overdrive:()=>`今回の前進×${power571(2,grown)}／大技×${power571(4,grown)}`,
  anchor:()=>`対象の後退ダメージを1/${power571(2,n)}に`,
  shield:()=>`毎回${n}発まで防御`,
  mirror:()=>`毎回${n}発まで反射`
 };
 return effects[id]?.()??`装備${n}個ぶんの効果が発動`;
}

export function rewardLabel575(r){const a=r?.rewards575;return !a?"":[a.medals?`勲章+${a.medals}！`:"",a.awaken?`星図${a.awaken}個が覚醒！`:"",a.suns?`首位奪取！ 太陽+${a.suns}`:""].filter(Boolean).join(" · ");}
