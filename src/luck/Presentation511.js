import {total571,groupGear571,copies571} from './Buffs571.js';
import {power571,stock571,factorLabels571} from './Presentation571.js';
import {LUCK511,metres511,rounds528} from './Rules511.js';
import {paintKey510,animating510,banner510,distance510} from './Presentation510.js';
export {raceFrame510 as raceFrame511,broadcastFrame510 as broadcastFrame511,delta510 as delta511,hitLabel510 as hitLabel511,distance510 as distance511,fullDistance510 as fullDistance511,courseOffsets510 as courseOffsets511,markerLabel510 as markerLabel511} from './Presentation510.js';
export const gearList511=groupGear571;
export const equipment511=p=>`装備 ${total571(p.loadout)}個${p.wards?' · お守り'+p.wards:''}${p.coils?' · コイル×'+power571(2,p.coils):''}${p.suns?' · 太陽×'+power571(3,p.suns):''}${metres511(p.savings)>0n?' · 貯金'+distance510(p.savings):''} ▾`;
export function banner511(g,self){if(g.phase==='dice')return{title:'',sub:''};if(g.phase==='hand'&&g.round===rounds528(g))return{title:g.ownPick!=null?'最後の一手、セット。':'育てた力、解き放て。',sub:'この4枚には、必ず大技が1枚以上。'};return banner510(g,self)}
export function paintKey511(g,at,ready,pending,reduced){return paintKey510(g,at,ready,pending,reduced)+(g.phase==='dice'?':dice:'+ (reduced?Math.min((g.event?.diceOrder.length??1)-1,Math.floor(Math.max(0,at-g.phaseAt)/LUCK511.diceMs)):Math.floor(Math.min(Math.max(0,at-g.phaseAt),g.event.diceMs)/16.667)):'')}
export const animating511=(g,at,reduced)=>animating510(g,at,reduced)||(!reduced&&g?.phase==='dice'&&at>=g.phaseAt&&at<g.phaseAt+g.event.diceMs);
const clamp=x=>Math.max(0,Math.min(1,x));
// CSS cubes have 1/front, 2/top, 3/right, 4/left, 5/bottom, 6/back.
const poses=[[0,0],[0,0],[-90,0],[0,-90],[0,90],[90,0],[0,180]];
export function diceFrame511(g,at,reduced=false){
 if(g.phase!=='dice'||!g.event?.diceOrder?.length)return null;
 const age=Math.max(0,at-g.phaseAt),index=Math.min(g.event.diceOrder.length-1,Math.floor(age/LUCK511.diceMs)),seat=g.event.diceOrder[index],row=g.event.rows[seat],c=row.calculation;
 const local=reduced?LUCK511.diceMs:Math.min(LUCK511.diceMs,age-index*LUCK511.diceMs),faces=c.dice;
 const dice=faces.map((value,i)=>{const start=i*130,end=620+i*330,t=clamp((local-start)/(end-start)),k=1-(1-t)**3,[x,y]=poses[c.rawDice?.[i]??value];return{value,raw:c.rawDice?.[i]??value,landed:t===1,x:(720+x)*k,y:(1080+y)*k,z:Math.sin(Math.PI*t)*12,lift:-Math.sin(Math.PI*t)*20}});
 const landed=dice.filter(d=>d.landed).length,done=landed===dice.length,impact=done&&local<620+(dice.length-1)*330+220;
 let formula=faces.map((v,i)=>dice[i].landed?v:'?').join(' × ');
 if(['product','triple'].includes(row.item))formula+=' × 100m';
 else if(done)formula=row.item==='jackpot'?(faces[0]>=6?faces[0]+'！ 大当たり +20,000m':faces[0]+' · 大砲は不発'):faces[0]+' · '+(faces[0]>=4?'+1,400m':'−300m');
 const powers=[factorLabels571(c)];
 if(c.focus)powers.unshift('各出目 +'+c.focus);
 if(metres511(c.cash)>0n)powers.push('貯金 +'+distance510(c.cash));
 return{index,seat,row,dice,done,impact,landed,formula,powers:powers.join(' · '),power:done?'+'+distance510(c.planned):'',cue:index+':'+landed};
}
export function buffStatus511(p,round){const gear=p.loadout??[],doubling=gear.filter(x=>x.id==='doubling'&&x.round<round).reduce((n,x)=>n+(round-x.round)*copies571(x),0);return[ doubling?'成長 ×'+(2n**BigInt(doubling)).toString():'',stock571(p),metres511(p.savings)>0n?'貯金 '+distance510(p.savings):''].filter(Boolean).join(' · ')}
